#!/usr/bin/env python3
"""Where the beats and the bar lines of a piece of music are.

    python3 tools/beats.py sound/music/track.mp3              tempo, key, loudness, then one line per bar
    python3 tools/beats.py track.mp3 --start 12.48            adds a FILM column: the time on the film when the track is
                                                              started 12.48 s in (music.track.start in sound/cues.json)
    python3 tools/beats.py track.mp3 --beats                  also lists every beat on its own line
    python3 tools/beats.py track.mp3 --json out/beats.json    the same numbers for a program
    python3 tools/beats.py track.mp3 --bpm 80-130             only look for a tempo in this range (default 60-180)
    python3 tools/beats.py track.mp3 --meter 3 --downbeat 2   force 3 beats to the bar, bar 1 on the track's 3rd beat (0-based 2)
    python3 tools/beats.py track.mp3 --count 0.14 8.75 22     you know from the score that there are 22 beats from the beat
                                                              near 0.14 s to the beat near 8.75 s: track that stretch again
                                                              with exactly that many (repeat --count for more stretches)

For laying the picture cuts on the beat (timeline.EDIT) and choosing the stretch of a track to use. numpy + scipy
only; ffmpeg decodes the file (any format it reads).

How: an onset curve (how much new sound starts, 100 times a second) -> the tempo from its autocorrelation -> the beats
by dynamic programming (the path of onsets that best keeps that tempo; Ellis 2007) -> if the tempo is steady, a
straight grid fitted through them (more exact than any single beat) -> the bar from where the bass and the harmony
change -> the key from the pitch classes (Krumhansl) -> loudness by ITU-R BS.1770.
Beats are good to about 10 ms on music with a clear pulse. The BAR (how many beats, and which is "one") is a guess from
the bass and the chords: check the first few bar lines against your ear, and use --meter / --downbeat to correct it.
Where every quaver is an onset (soft running strings) the tracker can read the pulse a few per cent slow or fast and
lose or gain a beat: count the bars in the score between two moments you are sure of and pin them with --count.
"""
import sys
import json
import subprocess

import numpy as np
from scipy import signal

SR = 48000            # decode rate (loudness is measured here)
AR = 24000            # analysis rate
HOP = 240             # 10 ms: the onset curve has 100 points a second
FPS = AR / HOP
NOTE = ["C", "C#", "D", "E-flat", "E", "F", "F#", "G", "A-flat", "A", "B-flat", "B"]


def decode(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
    if r.returncode != 0 or len(r.stdout) < 8 * SR // 10:
        raise SystemExit("ffmpeg could not read %s: %s" % (path, r.stderr.decode(errors="replace")[:300]))
    return np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


# ------------------------------------------------------------------------------------------------- loudness (BS.1770)
def kweight(x, sr=SR):
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = np.tan(np.pi * f0 / sr); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = np.tan(np.pi * f0 / sr); a0 = 1 + K / Q + K * K
    return signal.lfilter([1, -2, 1], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0], signal.lfilter(b, a, x, axis=0), axis=0)


def block_loudness(y, win, hop):
    """Loudness of every window of `win` seconds, `hop` seconds apart, of K-weighted audio y -> (times of the window centres, LUFS)."""
    w, h = int(win * SR), int(hop * SR)
    if len(y) < w:
        return np.zeros(0), np.zeros(0)
    cs = np.concatenate([np.zeros((1, y.shape[1])), np.cumsum(y * y, axis=0)])
    i = np.arange(1 + (len(y) - w) // h) * h
    z = ((cs[i + w] - cs[i]) / w).sum(1)
    return (i + w / 2) / SR, -0.691 + 10 * np.log10(z + 1e-30)


def integrated(l400):
    """Gated integrated loudness from 400 ms blocks (BS.1770-4)."""
    z = 10 ** ((l400 + 0.691) / 10)
    keep = l400 > -70
    if not keep.any():
        return -70.0
    keep &= l400 > -0.691 + 10 * np.log10(z[keep].mean()) - 10
    return float(-0.691 + 10 * np.log10(z[keep].mean()))


# ------------------------------------------------------------------------------------------------- onsets, tempo, beats
def spectra(m):
    """Short-time spectra of the mono analysis signal: |X| (frames x bins), 1024-point windows 10 ms apart."""
    n = 1024
    pad = np.concatenate([np.zeros(n // 2), m, np.zeros(n)])
    k = 1 + (len(pad) - n) // HOP
    idx = np.arange(n)[None, :] + HOP * np.arange(k)[:, None]
    return np.abs(np.fft.rfft(pad[idx] * np.hanning(n), axis=1))


def onset_curves(S):
    """(all, bass): how much new energy starts in each 10 ms, over the whole spectrum and below about 200 Hz."""
    f = np.fft.rfftfreq(1024, 1 / AR)
    edges = np.geomspace(40, 10000, 41)                              # 40 bands, even on a log scale
    B = np.stack([S[:, (f >= a) & (f < b)].sum(1) if ((f >= a) & (f < b)).any() else np.zeros(len(S)) for a, b in zip(edges[:-1], edges[1:])], 1)
    L = np.log1p(200.0 * B / (B.max() + 1e-12))
    d = np.maximum(0.0, L[2:] - L[:-2])                              # rise over 20 ms
    d = np.concatenate([np.zeros((2, d.shape[1])), d])
    centre = np.sqrt(edges[:-1] * edges[1:])

    def curve(cols):
        o = d[:, cols].sum(1)
        o = o - signal.convolve(o, np.ones(int(FPS)) / int(FPS), mode="same")      # take out the slow level
        o = np.maximum(0.0, o)
        return o / (o.std() + 1e-12)
    return curve(np.ones(len(centre), bool)), curve(centre < 200)


def tempo(o, lo=60.0, hi=180.0):
    """The beat period in seconds, with the runners-up [(bpm, score), ...]."""
    n = len(o)
    F = np.fft.rfft(o - o.mean(), 2 * n)
    ac = np.fft.irfft(F * np.conj(F))[:n]
    ac /= ac[0] + 1e-12
    lag = np.arange(n) / FPS
    cand = []
    for i in range(int(FPS * 60 / hi), min(n // 4 - 2, int(FPS * 60 / lo) + 1)):
        if ac[i] >= ac[i - 1] and ac[i] > ac[i + 1]:
            # a real beat period also shows at twice and three times its lag (half weight for half-way lags: a shuffle)
            comb = ac[i] + 0.5 * ac[min(n - 1, 2 * i)] + 0.33 * ac[min(n - 1, 3 * i)] + 0.25 * ac[min(n - 1, 4 * i)]
            bpm = 60.0 / lag[i]
            prior = np.exp(-0.5 * (np.log2(bpm / 110.0) / 0.9) ** 2)        # a mild preference for a walking pace
            a, b, c = ac[i - 1], ac[i], ac[i + 1]
            frac = 0.5 * (a - c) / (a - 2 * b + c) if abs(a - 2 * b + c) > 1e-12 else 0.0
            cand.append((comb * prior, (i + frac) / FPS))
    if not cand:
        raise SystemExit("no pulse found between %.0f and %.0f bpm (try --bpm lo-hi)" % (lo, hi))
    cand.sort(reverse=True)
    return cand[0][1], [(60.0 / p, s) for s, p in cand[:5]]


def track(o, period, tight=100.0):
    """Beat times (seconds): the chain of onsets that keeps the period best (dynamic programming, Ellis 2007)."""
    P = period * FPS
    g = signal.windows.gaussian(int(P) | 1, P / 32.0)
    loc = signal.convolve(o, g / g.sum(), mode="same")
    n = len(loc)
    score = loc.copy()
    back = -np.ones(n, int)
    lo, hi = int(round(P / 2)), int(round(2 * P))
    offs = np.arange(-hi, -lo + 1)
    cost = -tight * np.log(-offs / P) ** 2
    first = True
    for t in range(n):
        a, e = max(0, t - hi), t - lo + 1
        w = score[a:e] if e > a else score[:0]
        if len(w):
            c = w + cost[len(cost) - len(w):]
            j = int(np.argmax(c))
            if not (first and loc[t] < 0.01 * loc.max()):
                score[t] = loc[t] + c[j]
                back[t] = a + j
                first = False
    # the last beat: the best score near the end, then walk back
    tail = score[max(0, n - int(2 * P)):]
    t = max(0, n - int(2 * P)) + int(np.argmax(tail))
    beats = [t]
    while back[t] >= 0:
        t = back[t]
        beats.append(t)
    beats = np.array(beats[::-1])
    # drop the beats counted into silence before the music starts and after it stops
    st = loc[beats]
    thr = 0.3 * np.sqrt((st ** 2).mean())
    ok = np.where(st > thr)[0]
    if len(ok):
        beats = beats[ok[0]: ok[-1] + 1]
    # each beat to the top of its own onset (to a fraction of a frame)
    out = []
    for b in beats:
        a = max(1, b - 2); c = min(n - 2, b + 2)
        k = a + int(np.argmax(o[a: c + 1]))
        y0, y1, y2 = o[k - 1], o[k], o[k + 1]
        fr = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2) if abs(y0 - 2 * y1 + y2) > 1e-12 and y1 >= y0 and y1 >= y2 else 0.0
        out.append((k + fr) / FPS)
    return np.array(out)


def pinned(o, t0, t1, n, tight=100.0):
    """Exactly n beats from the beat near t0 to the beat near t1 (a beat on each end): the chain of onsets through that
    stretch that keeps the count. Each end is first moved to the strongest onset within 50 ms of the time given."""
    def snap(t):
        a, b = max(0, int((t - 0.05) * FPS)), int((t + 0.05) * FPS) + 1
        return a + int(np.argmax(o[a:b]))
    f0, f1 = snap(t0), snap(t1)
    P = (f1 - f0) / float(n)
    g = signal.windows.gaussian(int(P) | 1, P / 32.0)
    loc = signal.convolve(o, g / g.sum(), mode="same")
    half = max(2, int(round(0.35 * P)))
    cand = [np.array([f0])] + [np.arange(int(round(f0 + k * P)) - half, int(round(f0 + k * P)) + half + 1) for k in range(1, n)] + [np.array([f1])]
    score, back = [loc[cand[0]].astype(float)], []
    for k in range(1, n + 1):
        d = cand[k][:, None] - cand[k - 1][None, :]                       # frames from each earlier candidate
        c = np.where(d > 0, -tight * np.log(np.maximum(d, 1e-9) / P) ** 2, -1e18) + score[-1][None, :]
        j = np.argmax(c, axis=1)
        back.append(j)
        score.append(loc[np.clip(cand[k], 0, len(loc) - 1)] + c[np.arange(len(j)), j])
    i = int(np.argmax(score[-1]))
    path = [cand[n][i]]
    for k in range(n, 0, -1):
        i = int(back[k - 1][i])
        path.append(cand[k - 1][i])
    out = []
    for b in path[::-1]:
        a, c = max(1, b - 2), min(len(o) - 2, b + 2)
        q = a + int(np.argmax(o[a: c + 1]))
        y0, y1, y2 = o[q - 1], o[q], o[q + 1]
        fr = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2) if abs(y0 - 2 * y1 + y2) > 1e-12 and y1 >= y0 and y1 >= y2 else 0.0
        out.append((q + fr) / FPS)
    return np.array(out)


def steady_grid(beats):
    """A straight line through the beats: (first beat, period, rms distance of the beats from it in seconds)."""
    k = np.arange(len(beats))
    A = np.stack([np.ones(len(k)), k], 1)
    (t0, P), *_ = np.linalg.lstsq(A, beats, rcond=None)
    return float(t0), float(P), float(np.sqrt(((beats - (t0 + k * P)) ** 2).mean()))


# ------------------------------------------------------------------------------------------------- bars and key
def chroma_frames(m):
    """Pitch-class energy (frames x 12, C first) from 4096-point windows 40 ms apart, 55 Hz to 2 kHz."""
    n, hop = 4096, 960
    pad = np.concatenate([np.zeros(n // 2), m, np.zeros(n)])
    k = 1 + (len(pad) - n) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(k)[:, None]
    S = np.abs(np.fft.rfft(pad[idx] * np.hanning(n), axis=1)) ** 2
    f = np.fft.rfftfreq(n, 1 / AR)
    use = (f >= 55) & (f <= 2000)
    pc = np.round(12 * np.log2(f[use] / 261.6256)).astype(int) % 12
    C = np.zeros((k, 12))
    for p in range(12):
        C[:, p] = S[:, use][:, pc == p].sum(1)
    return C, hop / AR


def key_of(C):
    major = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    v = np.sqrt(C).sum(0)
    out = []
    for p in range(12):
        for name, prof in (("major", major), ("minor", minor)):
            out.append((float(np.corrcoef(v, np.roll(prof, p))[0, 1]), "%s %s" % (NOTE[p], name)))
    out.sort(reverse=True)
    return out[:3]


def bars_of(beats, o_bass, o_all, C, chop, meter=None, downbeat=None):
    """(beats per bar, index of the first downbeat, {meter: score}): from where the bass lands and the harmony changes."""
    def at(curve, t, half=0.05):
        a = max(0, int((t - half) * FPS)); b = min(len(curve), int((t + half) * FPS) + 1)
        return curve[a:b].max() if b > a else 0.0
    bass = np.array([at(o_bass, t) for t in beats])
    hit = np.array([at(o_all, t) for t in beats])
    seg = []
    for a, b in zip(beats, np.append(beats[1:], beats[-1] + (beats[-1] - beats[-2]))):
        i0, i1 = int(a / chop), max(int(a / chop) + 1, int(b / chop))
        v = C[i0:i1].sum(0)
        seg.append(v / (np.linalg.norm(v) + 1e-12))
    seg = np.array(seg)
    change = np.concatenate([[0.0], 1.0 - (seg[1:] * seg[:-1]).sum(1)])     # how different the harmony is from the beat before
    z = lambda v: (v - v.mean()) / (v.std() + 1e-12)
    D = z(bass) + z(change) + 0.5 * z(hit)
    scores, best = {}, {}
    for mtr in (2, 3, 4):
        s = [D[p::mtr].mean() - np.delete(D, np.arange(p, len(D), mtr)).mean() for p in range(mtr)]
        best[mtr] = int(np.argmax(s))
        # how well the pattern repeats every `mtr` beats, against repeating at the other spacings
        r = np.corrcoef(D[:-mtr], D[mtr:])[0, 1] if len(D) > 2 * mtr + 2 else 0.0
        scores[mtr] = float(max(s)) * max(0.0, float(r))
    if meter is None:                                                   # 4 only when the four-beat pattern says more than the two-beat one
        meter = 3 if scores[3] > max(scores[2], scores[4]) else (4 if scores[4] > 1.1 * scores[2] else 2)
    if downbeat is None:
        downbeat = best.get(meter, 0)
    return meter, downbeat % meter, scores


# ------------------------------------------------------------------------------------------------- the report
def analyse(path, bpm=(60.0, 180.0), meter=None, downbeat=None, counts=()):
    x = decode(path)
    dur = len(x) / SR
    m = signal.resample_poly(x.mean(1), 1, SR // AR)
    S = spectra(m)
    o_all, o_bass = onset_curves(S)
    period, runners = tempo(o_all, *bpm)
    beats = track(o_all, period)
    if len(beats) < 8:
        raise SystemExit("only %d beats found: no clear pulse" % len(beats))
    t0, P, rms = steady_grid(beats)
    steady = rms < 0.025 and not counts
    for (c0, c1, cn) in counts:                                         # stretches whose beat count is known from the score
        fixed = pinned(o_all, c0, c1, cn)
        half = 0.5 * (fixed[-1] - fixed[0]) / cn
        beats = np.concatenate([beats[beats < fixed[0] - half], fixed, beats[beats > fixed[-1] + half]])
    env = np.abs(x).max(1)
    loud = np.where(env > 10 ** (-60 / 20))[0]
    first_sound, last_sound = (loud[0] / SR, loud[-1] / SR) if len(loud) else (0.0, dur)
    if steady:                                                          # the straight grid is more exact than any one beat,
        k0 = int(np.ceil((first_sound - 0.25 * P - t0) / P))            # and it carries on through the bars where the pulse hides
        k1 = int(np.floor((last_sound - t0) / P))
        beats = t0 + P * np.arange(k0, k1 + 1)
        beats = np.maximum(0.0, beats[beats >= -0.03])                  # (a beat on the file's very first sample may come out at -0.001)
    C, chop = chroma_frames(m)
    meter, down, mscores = bars_of(beats, o_bass, o_all, C, chop, meter, downbeat)
    y = kweight(x)
    tm, lm = block_loudness(y, 0.4, 0.1)
    ts, ls = block_loudness(y, 3.0, 0.1)
    bars = beats[down::meter]
    blen = float(np.median(np.diff(bars))) if len(bars) > 1 else P * meter

    def st_at(t):                                                       # short-term loudness around a moment
        return float(ls[np.argmin(np.abs(ts - t))]) if len(ls) else float("nan")
    bar_rows = []
    for k, t in enumerate(bars):
        nxt = bars[k + 1] if k + 1 < len(bars) else t + blen
        mm = lm[(tm >= t) & (tm < nxt)]
        bar_rows.append(dict(bar=k + 1, t=float(t), lufs=float(10 * np.log10(np.mean(10 ** (mm / 10)))) if len(mm) else st_at(t)))
    return dict(file=path, duration=dur, first_sound=float(first_sound), last_sound=float(last_sound),
                bpm=60.0 / P if steady else 60.0 / float(np.median(np.diff(beats))), beat_period=P if steady else float(np.median(np.diff(beats))),
                steady=bool(steady), grid_rms_ms=1000 * rms, counts=[list(c) for c in counts], tempo_candidates=[(round(b, 2), round(s, 3)) for b, s in runners],
                meter=meter, downbeat_index=down, meter_scores={str(k): round(v, 3) for k, v in mscores.items()}, bar_length=blen,
                beats=[float(b) for b in beats], bars=bar_rows, key=[(n, round(c, 3)) for c, n in key_of(C)],
                integrated_lufs=integrated(lm), true_peak_db=float(20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max() + 1e-12)),
                short_term=[(float(t), float(l)) for t, l in zip(ts[::10], ls[::10])])


def main():
    a = sys.argv[1:]
    if not a or a[0].startswith("-"):
        raise SystemExit(__doc__)
    opt = lambda name, cast, dflt: cast(a[a.index(name) + 1]) if name in a else dflt
    lo, hi = opt("--bpm", lambda s: tuple(float(v) for v in s.split("-")), (60.0, 180.0))
    start = opt("--start", float, None)
    counts = [(float(a[i + 1]), float(a[i + 2]), int(a[i + 3])) for i, v in enumerate(a) if v == "--count"]
    R = analyse(a[0], (lo, hi), opt("--meter", int, None), opt("--downbeat", int, None), counts)
    if "--json" in a:
        json.dump(R, open(a[a.index("--json") + 1], "w"), indent=1)
    film = (lambda t: "%8.3f" % (t - start)) if start is not None else (lambda t: "")
    print("%s" % R["file"])
    print("length %.3f s   sound from %.3f s to %.3f s" % (R["duration"], R["first_sound"], R["last_sound"]))
    print("tempo  %.2f bpm   one beat = %.4f s   %s" % (R["bpm"], R["beat_period"],
          ("steady: a straight grid fits the %d beats to %.0f ms" % (len(R["beats"]), R["grid_rms_ms"])) if R["steady"]
          else ("a count was pinned, so the times below are tracked beat by beat (they stray %.0f ms from a straight grid)" % R["grid_rms_ms"]) if R["counts"]
          else ("NOT steady (beats stray %.0f ms from a straight grid): the times below are tracked beat by beat" % R["grid_rms_ms"])))
    print("       other readings of the pulse (bpm, score): " + ", ".join("%.1f (%.2f)" % c for c in R["tempo_candidates"][1:]))
    for c0, c1, cn in R["counts"]:
        inside = [b for b in R["beats"] if c0 - 0.06 <= b <= c1 + 0.06]
        print("count  %d beats from %.3f to %.3f s, as told (one beat = %.4f s there)" % (cn, inside[0], inside[-1], (inside[-1] - inside[0]) / cn))
    print("bar    %d beats = %.4f s, first bar line at %.3f s (beat %d of the track)   scores for 2/3/4 beats to the bar: %s"
          % (R["meter"], R["bar_length"], R["bars"][0]["t"] if R["bars"] else 0.0, R["downbeat_index"], " ".join("%s:%s" % kv for kv in R["meter_scores"].items())))
    print("       the bar is a guess from the bass and the chords: check it by ear, correct it with --meter N --downbeat I")
    print("key    probably %s; or %s" % ("%s (%.2f)" % R["key"][0], ", ".join("%s (%.2f)" % k for k in R["key"][1:])))
    print("loud   integrated %.1f LUFS   true peak %.1f dBTP" % (R["integrated_lufs"], R["true_peak_db"]))
    print()
    print("  bar   time s %s  LUFS   (loudness of that bar; # = 2 LU, from -40)%s" % ("  film s " if start is not None else "", "   beats in the bar" if "--beats" not in a else ""))
    beats = np.array(R["beats"])
    prev = None
    for k, row in enumerate(R["bars"]):
        nxt = R["bars"][k + 1]["t"] if k + 1 < len(R["bars"]) else row["t"] + R["bar_length"]
        inbar = beats[(beats >= row["t"] - 1e-6) & (beats < nxt - 1e-6)]
        four = [r["lufs"] for r in R["bars"][k: k + 4]]
        back = [r["lufs"] for r in R["bars"][max(0, k - 4): k]]
        mark = ""
        if back and len(four) == 4:
            dlt = np.mean(four) - np.mean(back)
            mark = "  <- louder from here (%+.1f LU)" % dlt if dlt > 2.5 and (prev is None or k - prev >= 4) else ("  <- quieter from here (%+.1f LU)" % dlt if dlt < -2.5 and (prev is None or k - prev >= 4) else "")
            if mark:
                prev = k
        print("%5d %8.3f %s %6.1f  %-22s%s%s" % (row["bar"], row["t"], film(row["t"]), row["lufs"], "#" * int(max(0, min(22, (row["lufs"] + 40) / 2))),
              "" if "--beats" in a else "  " + " ".join("%.3f" % b for b in inbar), mark))
    if "--beats" in a:
        print()
        print(" beat   time s %s" % ("  film s" if start is not None else ""))
        for i, b in enumerate(beats):
            print("%5d %8.3f %s%s" % (i, b, film(b), "   | bar %d" % (1 + (i - R["downbeat_index"]) // R["meter"]) if i >= R["downbeat_index"] and (i - R["downbeat_index"]) % R["meter"] == 0 else ""))
    lead = beats[beats < (R["bars"][0]["t"] if R["bars"] else 0) - 1e-6]
    if len(lead):
        print()
        print("beats before the first bar line (a pick-up): " + " ".join("%.3f" % b for b in lead))


if __name__ == "__main__":
    main()
