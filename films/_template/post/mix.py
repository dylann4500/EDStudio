#!/usr/bin/env python3
"""The film's sound mix.

    python3 post/mix.py                 -> out/mix.wav (48 kHz, 24 bit, stereo) + out/mix_preview.mp3
    python3 post/mix.py --check         also out/mix_spectrogram.png, out/mix_wave.png and a per-shot level table
    python3 post/mix.py --stems         also out/stems/{amb,music,steps,fx,room}.wav (after the final gain, 32-bit float)
    python3 post/mix.py --no-preview    skip the mp3
    python3 post/mix.py --events more.json [--events ...] --out name
                                        add events files that are not in build/ and write out/<name>.wav instead
                                        (for trying the mix before a set has been built)
    python3 post/mix.py --track file    use this file as the music (as if it were sound/music/track.*)
    python3 post/mix.py --no-track      ignore sound/music/track.* and use the generated stems

It reads three things and nothing else decides a time:
    timeline.py              the shots (SHOTS: the story clock, what is rendered), the cut (EDIT: which part of each shot
                             the film shows and how fast), END_CARD, XFADE, CUES
    build/*/events.json      what the animation does: {"shot", "t", "kind", "gain", "dur"?}, t in seconds into the rendered shot
    sound/cues.json          the sound department's own sheet: ambience per shot, music, extra one-off sounds, levels
and plays recordings from sound/lib (see sound/credits.json; rebuild the library with sound/build_lib.py), plus the
user's music track when sound/music/track.<ext> exists (then the generated music is off; see music.track in the sheet).

The mix lives on the FILM clock. Every event and cue is given in story seconds and goes through timeline.film_time();
shot starts and lengths come from cut_start() and cut(), the end card from film_frames(). A moment the edit cuts out
makes no sound; a sound with a length (wheels, a chain, a fanfare) is clipped to the part of it that is shown; a shot
played faster brings its sounds closer together and never changes their pitch.

How it is put together
    amb    per shot a few beds (room, birds, clock ...) each with a level and a tone; on a picture cut they cross-fade in
           30 ms, so the room changes with the camera
    steps  step_* / land_* / cheer / dismount: wooden pegs on the surface the kind names; a rank landing on one frame
           is a short flam of feet about as loud as one firm step (STEP_CROWD, RANK_SPREAD)
    fx     everything else
    room   a little of steps + fx through a small synthetic room, so close recordings sit in the same space
    music  the user's track at one level set against the action; without it, 8-bar loops switched on bar lines and a
           last chord on the end card
Every layer has a fixed level: no compressor, no limiter, nothing that listens to the mix and moves a gain. One final
gain brings the film to the target loudness (target_lufs in the cue sheet, BS.1770) unless that would put the true peak
above the ceiling (true_peak_max); then the peak decides. Wooden knocks are nearly all peak, so the cue sheet may allow
the tips of the knocks to be rounded by a fixed curve (peak_round_db, see Mix.render): a waveshape with no memory, not
a limiter, so it cannot pump; ambience and music are never changed by it. The one thing that changes a level over time is music.track.even, off unless the sheet asks:
it takes out part of the recording's own slow swings, worked out from the music file alone before the mix (Mix.render).
Nothing is random: take, pitch, level and pan of every event come from a hash of its kind and its number, so the
same inputs always give the same file.
"""
import os
import sys
import json
import glob
import wave
import zlib
import subprocess
from fractions import Fraction

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl                                                        # noqa: E402

SR = 48000
LIB = os.path.join(ROOT, "sound", "lib")
OUT = os.path.join(ROOT, "out")
CUT_FADE = 0.030          # seconds: ambience cross-fade on a picture cut
DROP_CUT = True           # a sound whose moment the edit has cut out is not played (False only to compare with the old mix)
MAX_PAN = 0.14            # nobody told the mix where things are on screen: a little width, never a position

# ---------------------------------------------------------------------------------------------------------------------
# What each event kind plays. A set's animation writes events {"shot", "t", "kind", "gain", "dur"?} (build/<set>/
# events.json); this table turns a kind into sound. fam = the takes sound/lib/<fam>_*.wav (sound/fetch_lib.py makes a
# starter library; add your own families the same way). db = level against a step on wood.
# st = pitch in semitones (varispeed), var = how far pitch wanders (+-), mode: hit | dur (cut to the event's dur) |
# loop (a bed repeated for dur) | cluster (n hits of another kind inside `spread` seconds).
# alt = (family, tone) to borrow when the library has no takes of fam. until = a kind that ends this one's sound.
# crowd = p: when N events of this kind fall within 120 ms of each other in a shot, each is played N^-p as loud, so
# twenty wheels over one bump are a clatter, not twenty times one wheel (p = 0.5 keeps the energy of one).
# tune = (lowest, highest semitones it may move): a sound with a pitch of its own, played over a music track; the mix
# moves it to the key the music is in at that moment (Mix.in_tune). Add your film's own kinds at the end.
# ---------------------------------------------------------------------------------------------------------------------
SURFACES = {            # surface -> family, level, and what to borrow if that family is not in the library
    "wood":  dict(fam="step_wood", db=0.0),
    "board": dict(fam="step_board", db=0.0, alt=("step_wood", dict())),
    "rug":   dict(fam="step_rug", db=-3.0, alt=("step_wood", dict(lp=900, st=-3))),
    "stone": dict(fam="step_stone", db=0.0, alt=("step_wood", dict(lp=5000, st=2))),
    "grass": dict(fam="step_grass", db=-2.0, alt=("step_rug", dict())),
    "snow":  dict(fam="step_snow", db=-2.0, alt=("step_rug", dict())),
    "glass": dict(fam="clink_glass", db=-6.0, alt=("step_wood", dict(hp=900, st=5))),
    "metal": dict(fam="tin", db=-6.0, alt=("step_wood", dict(hp=600, st=4))),
}
WHO = {                 # who lands: kind "<who>_<surface>", e.g. step_wood, step_small_rug, land_stone (longest names first)
    "step_small": dict(st=4.0, db=-3.5, var=0.8),            # a small or light figure: higher, quieter
    "step":       dict(st=0.0, db=0.0, var=0.7),
    "land":       dict(st=-4.0, db=2.5, var=0.6, thump=-7.0),  # a real landing: lower, with a thump under it
}
# A crowd putting their feet down on the same frame: N landings inside 120 ms each play N^-STEP_CROWD as loud, and
# those on the very same instant land RANK_SPREAD apart, loudest first, all inside one picture frame.
STEP_CROWD = 0.35
RANK_SPREAD = 0.007
KINDS = {
    # hits on things (fam from sound/fetch_lib.py)
    "knock":        dict(fam="knock_wood", db=0.0, var=0.8),         # a small wooden knock (a toy tipping, a tap)
    "knock_heavy":  dict(fam="thud_wood", db=2.0, var=0.5),          # something wooden falling flat, a heavy hit
    "thump":        dict(fam="knock_medium", db=1.0, var=0.6),
    "plank":        dict(fam="plank", db=1.0, var=0.5),
    "clink":        dict(fam="clink_glass", db=-2.0, var=0.6),       # glass or ceramic touched
    "glass":        dict(fam="glass_hit", db=0.0, var=0.4),
    "clank":        dict(fam="clank_metal", db=-1.0, var=0.6),       # small metal (a lid, a tin, a helmet)
    "metal":        dict(fam="metal_hit", db=0.0, var=0.4),
    "tin":          dict(fam="tin", db=-2.0, var=0.6),
    "plate":        dict(fam="plate", db=-1.0, var=0.4),             # a plate or mug set down
    "bell":         dict(fam="bell", db=-4.0, var=0.0),
    "soft":         dict(fam="soft_hit", db=-2.0, var=0.6),          # something soft dropped
    "punch":        dict(fam="punch", db=0.0, var=0.5),
    "hit":          dict(fam="hit", db=0.0, var=0.6),
    # handling things
    "cloth":        dict(fam="cloth", mode="dur", db=-2.0, var=0.5, fade=0.10, dur=0.5),
    "paper":        dict(fam="paper", db=-3.0, var=1.0),             # a page turned, paper flapping
    "book":         dict(fam="book_place", db=0.0, var=0.4),
    "creak":        dict(fam="creak", db=-3.0, var=0.8),
    "door_open":    dict(fam="door_open", db=-2.0, var=0.3),
    "door_close":   dict(fam="door_close", db=1.0, var=0.3),
    "latch":        dict(fam="latch", db=-2.0, var=0.4),
    "coins":        dict(fam="coins", db=-2.0, var=0.4),
    "leather":      dict(fam="leather", db=-2.0, var=0.5),
    "chop":         dict(fam="chop", db=0.0, var=0.4),
    "pot":          dict(fam="pot", db=-1.0, var=0.4),
    "knife":        dict(fam="knife_draw", db=-3.0, var=0.4),
    # small machines
    "click":        dict(fam="click", db=-2.0, var=0.4),             # a button, a key
    "switch":       dict(fam="switch", db=-1.0, var=0.3),
    "tick":         dict(fam="tick", db=-7.0, var=1.0),
    # air and motion
    "whoosh":       dict(fam="whoosh", db=-6.0, var=1.5),            # something moving fast past the lens
    "spin":         dict(fam="spin", mode="loop", db=-6.0, var=0.3, fade=0.20, dur=1.0),    # a top, a coin, a wheel spinning
    # groups
    "tumble":       dict(mode="cluster", of="step", n=4, spread=0.35, db=-3.0),             # something tumbling: knocks along
    "cheer":        dict(mode="cluster", of="step", n=6, spread=0.10, db=-4.0),             # a crowd of small figures hopping as one
    # -- the film's own kinds go here (write what each one is, and what it borrows if its family is missing) --
}
FALLBACK = dict(fam="tick", db=-9.0, var=0.5)          # an event kind nobody has heard of: a small tick, and a warning
SET_SURFACE = {"table": "wood"}                       # per set: the surface for kinds that do not name one


# ---------------------------------------------------------------------------------------------------------------------
def db(x):
    return 10 ** (x / 20.0)


def h01(*key):
    """A number in 0..1 that depends only on the key (so nothing is random)."""
    return zlib.crc32(("|".join(str(k) for k in key)).encode()) / 4294967295.0


def kweight(x):
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = np.tan(np.pi * f0 / SR); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = np.tan(np.pi * f0 / SR); a0 = 1 + K / Q + K * K
    return signal.lfilter([1, -2, 1], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0], signal.lfilter(b, a, x, axis=0), axis=0)


def lufs(x):
    """Integrated loudness, ITU-R BS.1770-4 (gated)."""
    y = kweight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if len(y) < blk:
        return -70.0
    cs = np.concatenate([np.zeros((1, y.shape[1])), np.cumsum(y * y, axis=0)])
    i = np.arange(1 + (len(y) - blk) // hop) * hop
    z = ((cs[i + blk] - cs[i]) / blk).sum(1)
    l = -0.691 + 10 * np.log10(z + 1e-30)
    keep = l > -70
    if not keep.any():
        return -70.0
    keep &= l > -0.691 + 10 * np.log10(z[keep].mean()) - 10
    return float(-0.691 + 10 * np.log10(z[keep].mean()))


def true_peak(x):
    return float(20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max() + 1e-12))


def varispeed(x, st):
    if abs(st) < 1e-6:
        return x
    fr = Fraction(2 ** (-st / 12.0)).limit_denominator(96)
    return signal.resample_poly(x, fr.numerator, fr.denominator, axis=0)


def tone(x, hp=None, lp=None):
    if hp:
        x = signal.sosfilt(signal.butter(2, hp, btype="high", fs=SR, output="sos"), x, axis=0)
    if lp:
        x = signal.sosfilt(signal.butter(2, lp, btype="low", fs=SR, output="sos"), x, axis=0)
    return x


# how well two notes k semitones apart sit together (unison/octave, minor second ... major seventh)
AGREE = np.array([1.0, -1.0, -0.2, 0.4, 0.5, 0.7, -0.6, 0.7, 0.5, 0.4, -0.2, -1.0])


def pitch_classes(x, lo=110.0, hi=2500.0):
    """Of a stretch of audio: the energy in each of the 12 pitch classes (C first), and how many cents its notes sit
    above A = 440 (from the strong spectral peaks). None when there is too little sound to say."""
    m = x.mean(1) if x.ndim > 1 else x
    if len(m) < SR // 10 or np.sqrt((m ** 2).mean()) < 1e-5:
        return None
    S = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2
    f = np.fft.rfftfreq(len(m), 1.0 / SR)
    use = (f >= lo) & (f <= hi)
    S, f = S[use], f[use]
    pk = np.where((S[1:-1] > S[:-2]) & (S[1:-1] >= S[2:]) & (S[1:-1] > 0.02 * S.max()))[0] + 1
    if len(pk) < 3:
        return None
    y0, y1, y2 = np.log(S[pk - 1]), np.log(S[pk]), np.log(S[pk + 1])
    fp = f[pk] + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 - 1e-12) * (f[1] - f[0])
    off = ((1200 * np.log2(fp / 440.0) + 50) % 100) - 50                # each peak's distance from the nearest semitone
    cents = float(np.angle((np.sqrt(S[pk]) * np.exp(2j * np.pi * off / 100)).sum()) / (2 * np.pi) * 100)
    pc = np.round(12 * np.log2(f / (440.0 * 2 ** (cents / 1200.0) * 2 ** (-9 / 12.0)))).astype(int) % 12
    c = np.sqrt(np.array([S[pc == k].sum() for k in range(12)]))
    return c / (np.linalg.norm(c) + 1e-12), cents


def pan_gains(p):
    th = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)          # 1, 1 in the middle


class Lib:
    """sound/lib: families of takes by file-name prefix."""

    def __init__(self):
        self.files = sorted(glob.glob(os.path.join(LIB, "*.wav")))
        self.names = [os.path.basename(f)[:-4] for f in self.files]
        self._wav, self._var = {}, {}

    def family(self, fam):
        return [n for n in self.names if n == fam or (n.startswith(fam + "_") and n[len(fam) + 1:].isdigit())]

    def wav(self, name):
        if name not in self._wav:
            sr, x = wavfile.read(os.path.join(LIB, name + ".wav"))
            assert sr == SR, name
            x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 2147483648.0 if x.dtype == np.int32 else 1.0)
            self._wav[name] = x
        return self._wav[name]

    def variant(self, name, st=0.0, hp=None, lp=None, q=8):
        """A take at a pitch (in eighths of a semitone; q = 100: to the cent) and tone; cached."""
        key = (name, round(st * q), q, hp, lp)
        if key not in self._var:
            self._var[key] = tone(varispeed(self.wav(name), key[1] / float(q)), hp, lp)
        return self._var[key]


def load_timeline():
    """The shots on the FILM clock. timeline.py has two clocks: SHOTS is the story (what is animated and rendered), EDIT is
    the cut (which part of each shot is shown, and how fast). Every time in the mix is a film time and comes from
    timeline's own helpers: a shot's start from cut_start(), its length from cut(), the end card from film_frames().
    a, b, sp = the story seconds shown and the speed (b reaches the end of the last frame shown: a shot of '2.2 s' is
    53 frames = 2.208 s, and a landing at 2.2 is on screen)."""
    shots = {}
    for s in tl.SHOTS:
        sid = s[0]
        a, b, sp = tl.edit(sid)
        shown_to = min(tl.frames(sid), int(round(b * tl.FPS))) / tl.FPS
        shots[sid] = dict(start=tl.cut_start(sid) / tl.FPS, dur=len(tl.cut(sid)) / tl.FPS, set=s[1], light=s[3],
                          story_start=tl.start(sid) / tl.FPS, story=s[2], a=a, b=max(b, shown_to), sp=sp,
                          edited=(a > 1e-6 or b < s[2] - 1e-6 or abs(sp - 1.0) > 1e-6))
    film = tl.film_frames() / tl.FPS
    total = film + tl.END_CARD - tl.XFADE
    shots["END"] = dict(start=total - tl.END_CARD, dur=tl.END_CARD, set="end", light=tl.SHOTS[-1][3],
                        story_start=tl.total_frames() / tl.FPS, story=tl.END_CARD, a=0.0, b=1e9, sp=1.0, edited=False)
    return shots, film, total


def film_t(shots, sid, t):
    """Film seconds at which moment t (seconds into the rendered shot) is seen, or None when the cut does not show it.
    timeline.film_time decides. Two additions: 'END' (the end card, which no edit touches), and the last frame shown
    when a shot's frame count rounds up (see load_timeline)."""
    sh = shots[sid]
    if sid == "END":
        return sh["start"] + t
    T = tl.film_time(sid, t)
    if T is None and (not DROP_CUT or sh["a"] - 1e-6 <= t < sh["b"] - 1e-6):
        T = sh["start"] + (t - sh["a"]) / sh["sp"]
    return T


def film_span(shots, sid, t, dur):
    """A sound with a length: the part of story seconds t .. t + dur that the cut shows, as (film start, film length,
    seconds cut off its head), or None when none of it is shown. A shot played at another speed changes when the sound
    starts and how long it lasts, never its pitch."""
    sh = shots[sid]
    if sid == "END" or not DROP_CUT:
        return sh["start"] + (t - sh["a"]) / sh["sp"], dur, 0.0
    s0, s1 = max(t, sh["a"]), min(t + dur, sh["b"])
    if s1 - s0 <= 1e-6:
        return None
    return sh["start"] + (s0 - sh["a"]) / sh["sp"], (s1 - s0) / sh["sp"], s0 - t


def when(c, shots, what="cue"):
    """Film seconds of a cue-sheet moment: {"shot": id, "t": seconds into the rendered shot}, or {"shot": id, "cue": name
    in timeline.CUES, "t": offset from it}. A moment the cut has removed moves to the nearest moment of its shot that is
    shown (a music change cued inside a trimmed head happens on the cut instead)."""
    if c["shot"] not in shots:
        raise SystemExit("sound/cues.json: %s names shot %r, which is not in timeline.py" % (what, c["shot"]))
    t = float(c.get("t", 0.0))
    if "cue" in c:
        if c["cue"] not in tl.CUES.get(c["shot"], {}):
            raise SystemExit("sound/cues.json: %s uses CUES[%r][%r], which timeline.py does not have" % (what, c["shot"], c["cue"]))
        t += tl.CUES[c["shot"]][c["cue"]]
    sh = shots[c["shot"]]
    T = film_t(shots, c["shot"], t)
    if T is None:
        T = sh["start"] if t < sh["a"] else sh["start"] + sh["dur"]
    return T


def story_t(c, what="extra"):
    """Seconds into the rendered shot of a cue-sheet moment (the story clock, before the edit)."""
    t = float(c.get("t", 0.0))
    if "cue" in c:
        if c["cue"] not in tl.CUES.get(c.get("shot"), {}):
            raise SystemExit("sound/cues.json: %s uses CUES[%r][%r], which timeline.py does not have" % (what, c.get("shot"), c["cue"]))
        t += tl.CUES[c["shot"]][c["cue"]]
    return t


# ---------------------------------------------------------------------------------------------------------------------
class Mix:
    def __init__(self, cues, more_events=(), track=None):
        self.cues = cues
        self.more_events = list(more_events)
        self.track = track                      # None: sound/music/track.* if there is one; a path: that file; False: never
        self.track_info = None
        self.lib = Lib()
        self.shots, self.film, self.total = load_timeline()
        self.order = [s[0] for s in tl.SHOTS]
        self.n = int(round(self.total * SR))
        self.bus = {k: np.zeros((self.n, 2)) for k in ("amb", "music", "steps", "fx")}
        self.counts, self.unknown, self.unknown_surface, self.missing, self.late = {}, {}, {}, {}, []
        self.serial = {}
        self.last_take = {}
        self.tuned = []                         # pitched sounds moved to agree with the music track (for the summary)
        self.mute = False                       # the event in hand is cut out of the film: it keeps its place in the deal, makes no sound
        self.cut_out, self.clipped = {}, 0      # events the edit removed (per kind), events with a length that it shortened
        self.guard, self.guarded = {}, []       # the accent guard (see events())

    # ----------------------------------------------------------------------------------------------- placing things
    def put(self, bus, x, t, gl=1.0, gr=1.0):
        i = int(round(t * SR))
        if x.ndim == 1:
            x = np.stack([x * gl, x * gr], axis=1)
        else:
            x = x * np.array([gl, gr])
        if i < 0:
            x, i = x[-i:], 0
        x = x[: max(0, self.n - i)]
        self.bus[bus][i:i + len(x)] += x

    def pick(self, fam, key, seq=None):
        """Round the takes of a family, never the same one twice running; which one comes from the hash."""
        takes = self.lib.family(fam)
        if not takes:
            return None
        if seq is not None:
            return takes[seq % len(takes)]
        k = int(h01("take", fam, key) * len(takes)) % len(takes)
        prev = self.last_take.get(fam, [])
        for _ in range(len(takes)):
            if takes[k] not in prev[-min(2, len(takes) - 1):] or len(takes) == 1:
                break
            k = (k + 1) % len(takes)
        self.last_take[fam] = (prev + [takes[k]])[-2:]
        return takes[k]

    def resolve(self, spec):
        """(family, extra tone) using the family's stand-in when the library has no takes of it."""
        fam, extra = spec.get("fam"), {}
        if fam and not self.lib.family(fam) and spec.get("alt"):
            self.missing[fam] = "using " + spec["alt"][0]
            fam, extra = spec["alt"][0], dict(spec["alt"][1])
        if fam and not self.lib.family(fam):
            self.missing[fam] = "using " + FALLBACK["fam"]
            fam, extra = FALLBACK["fam"], {}
        return fam, extra

    def hit(self, bus, spec, t, gain, key, st=0.0, dur=None, trim_db=0.0, layer=0, head=0.0):
        if dur and spec.get("with_dur"):
            spec = spec["with_dur"]
        fam, extra = self.resolve(spec)
        base = key.split("/layer")[0]
        name = self.pick(fam, base, int(base.split("#")[1].split("/")[0]) if spec.get("order") == "seq" else None) if fam else None
        if name is None or self.mute:                                    # (a cut-out event has still taken its turn in the deal)
            return
        if layer:                                                        # a second layer is the next take along, never the same one
            takes = self.lib.family(fam)
            name = takes[(takes.index(name) + layer) % len(takes)]
        var = spec.get("var", 0.5)
        st = st + spec.get("st", 0.0) + extra.get("st", 0.0) + (h01("st", key) - 0.5) * 2 * var
        hp, lp = getattr(self, "shot_tone", (None, None)) if bus == "fx" else (None, None)
        fine = 8
        if spec.get("tune") and self.track_info and not self.cues.get("music", {}).get("track", {}).get("no_tune"):
            st, fine = st + self.in_tune(name, spec, t, dur, key), 100
        x = self.lib.variant(name, st, hp or extra.get("hp"), lp or extra.get("lp"), q=fine)
        mode = spec.get("mode", "hit")
        if mode == "loop":
            want = int((dur or spec.get("dur", 1.0)) * SR)
            off = int(h01("off", key) * len(x))
            x = np.take(x, (off + np.arange(want)) % len(x), axis=0)
        if mode == "dur" and head > 0:                                   # the cut comes in part-way through it
            x = x[int(head * SR):].copy()
            f = min(len(x), int(0.015 * SR))
            x[:f] *= np.linspace(0, 1, f)[(slice(None),) + (None,) * (x.ndim - 1)]
        if mode in ("loop", "dur") and (dur or mode == "loop"):
            want = int((dur or spec.get("dur", 1.0)) * SR)
            x = x[:want].copy()
            f = min(len(x) // 2, int(spec.get("fade", 0.12) * SR))
            if f > 1:
                r = (0.5 - 0.5 * np.cos(np.pi * np.arange(f) / f))[(slice(None),) + (None,) * (x.ndim - 1)]
                if mode == "loop":
                    x[:f] *= r
                x[-f:] *= r[::-1]
        g = gain * db(spec.get("db", 0.0) + trim_db + (h01("lv", key) - 0.5) * 2 * 1.5)
        gl, gr = pan_gains((h01("pan", key) - 0.5) * 2 * MAX_PAN)
        self.put(bus, x, t, g * gl, g * gr)

    def in_tune(self, name, spec, t, dur, key):
        """Semitones to move a pitched sound so that it agrees with the music track under it: the whole semitones (within
        spec['tune']) that put its notes on the notes the orchestra is playing there, plus the cents between the
        orchestra's tuning and its own."""
        take = self.lib.wav(name)
        a = max(0, int(t * SR))
        b = min(self.n, a + int((dur or len(take) / SR) * SR))
        mine, music = pitch_classes(take), pitch_classes(self.bus["music"][a:b])
        if mine is None or music is None:
            return 0.0
        lo, hi = spec["tune"]
        M = np.array([[AGREE[(i - j) % 12] for j in range(12)] for i in range(12)]) @ music[0]
        scores = {k: float(np.roll(mine[0], k) @ M) for k in range(int(lo), int(hi) + 1)}
        best = max(scores, key=lambda k: (round(scores[k], 6), -abs(k)))
        cents = self.track_info["cents"] - mine[1]                      # the orchestra's tuning against the sound's own
        st = best + cents / 100.0
        names = ["C", "C#", "D", "E-flat", "E", "F", "F#", "G", "A-flat", "A", "B-flat", "B"]
        top = lambda c: " ".join(names[i] for i in np.argsort(c)[::-1][:3])
        self.tuned.append("%s at film %.2f s: moved %+d semitones and %+.0f cents; the music under it is on %s; it now plays %s"
                          % (key.split("#")[0], t, best, cents, top(music[0]), top(np.roll(mine[0], best))))
        return st

    def step(self, who, surface, t, gain, key, trim_db=0.0):
        w, s = WHO[who], SURFACES.get(surface)
        if s is None:
            self.unknown_surface["%s_%s" % (who, surface)] = self.unknown_surface.get("%s_%s" % (who, surface), 0) + 1
            s = SURFACES["wood"]
        spec = dict(fam=s["fam"], alt=s.get("alt"), db=s["db"] + w["db"], st=w["st"], var=w["var"])
        if surface == "wood" and w.get("wood_fam") and self.lib.family(w["wood_fam"]):
            spec.update(fam=w["wood_fam"], st=w["wood_st"], db=s["db"] + w["db"] + 3.5)          # those takes are already light
        self.hit("steps", spec, t, gain, key, trim_db=trim_db)
        if w.get("thump") is not None and self.lib.family("thump"):
            self.hit("steps", dict(fam="thump", db=w["thump"] + (-4.0 if surface in ("rug", "cork") else 0.0), var=0.5), t, gain, key + "/thump", trim_db=trim_db)

    def event(self, e, origin):
        sid, kind = e.get("shot"), str(e.get("kind"))
        if sid not in self.shots:
            self.late.append("%s: shot %r is not in timeline.py (%s)" % (kind, sid, origin))
            return
        sh = self.shots[sid]
        ts = float(e.get("t", 0.0))                                   # story seconds into the rendered shot
        gain = float(e.get("gain", 1.0))
        g = self.guard.get((sid, kind))
        if g and abs(ts - g["t"]) <= g["window"]:                     # it would sit on this shot's accent: let the accent speak first
            ts, gain = g["t"] + g["delay"], gain * db(g["db"])
            self.guarded.append("%s %s %+.0f ms after %s" % (sid, kind, 1000 * g["delay"], g["accent"]))
        t = film_t(self.shots, sid, ts)                               # film seconds, or None: the edit has cut that moment out
        if not (-0.5 <= ts <= sh["story"] + 0.5):
            self.late.append("%s at %s t=%.2f is outside its %.2f s shot (%s)" % (kind, sid, ts, sh["story"], origin))
        # Its number in the deal of takes comes from the story order, cut or not: trimming a shot removes sounds, it never
        # re-deals the takes, pitches and pans of the sounds that stay.
        i = self.serial[kind] = self.serial.get(kind, -1) + 1
        key = "%s#%d" % (kind, i)
        self.mute = False
        trims = self.cues.get("shots", {}).get(sid, {})
        surf_default = trims.get("surface", SET_SURFACE.get(sh["set"], "wood"))
        if e.get("file"):                                           # a cue-sheet extra that names a library file itself
            if t is None:
                self.cut_out[kind] = self.cut_out.get(kind, 0) + 1
                return
            self.counts[kind] = self.counts.get(kind, 0) + 1
            if e["file"] not in self.lib.names:
                self.missing[e["file"]] = "skipped"
                return
            x = self.lib.variant(e["file"], float(e.get("st", 0.0)), e.get("hp"), e.get("lp"))
            if e.get("dur"):
                x = x[: int(float(e["dur"]) * SR)].copy()
                f = min(len(x) // 2, int(0.15 * SR))
                x[-f:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(f) / f))[(slice(None),) + (None,) * (x.ndim - 1)]
            gl, gr = pan_gains(float(e.get("pan", 0.0)) * 1.0)
            self.put("fx", x, t, gain * db(float(e.get("db", 0.0))) * gl, gain * db(float(e.get("db", 0.0))) * gr)
            return
        spec = None if any(kind.startswith(w + "_") for w in WHO) else KINDS.get(kind, FALLBACK)
        dur = float(e["dur"]) if e.get("dur") else None
        if spec is not None:
            if dur is None and spec.get("until"):
                dur = self.until.get((sid, ts, spec["until"]))
            if dur is None and spec.get("mode") == "loop":
                dur = float(spec.get("dur", 1.0))
        head = 0.0
        if dur is not None and spec is not None and spec.get("mode") != "cluster":      # a sound with a length: what the cut shows of it
            part = film_span(self.shots, sid, ts, dur)
            if part is None:
                t = None
            else:
                t, d2, head = part
                self.clipped += int(d2 < dur / sh["sp"] - 1e-6)
                dur = d2
        if t is None:
            self.cut_out[kind] = self.cut_out.get(kind, 0) + 1
            self.mute, t = True, 0.0
        else:
            self.counts[kind] = self.counts.get(kind, 0) + 1
        for who in WHO:
            if kind.startswith(who + "_"):
                gain *= max(1, self.crowd.get(id(e), 1)) ** -STEP_CROWD
                self.step(who, kind[len(who) + 1:], t + RANK_SPREAD * min(4, self.rank.get(id(e), 0)), gain, key, trims.get("steps_db", 0.0))
                return
        if kind not in KINDS and not self.mute:
            self.unknown[kind] = self.unknown.get(kind, 0) + 1
        over = trims.get("kinds", {}).get(kind)                 # this shot's own level / pitch / tone for this kind (cue sheet)
        if over:
            spec = dict(spec, db=spec.get("db", 0.0) + float(over.get("db", 0.0)), st=spec.get("st", 0.0) + float(over.get("st", 0.0)))
            self.shot_tone = (over.get("hp"), over.get("lp"))
        else:
            self.shot_tone = (None, None)
        if spec.get("crowd"):
            gain *= max(1, self.crowd.get(id(e), 1)) ** -spec["crowd"]
        if spec.get("mode") == "cluster":
            for j in range(spec["n"]):
                dt = h01("dt", key, j) * spec["spread"]
                g = gain * db(spec["db"]) * (0.7 + 0.5 * h01("cg", key, j))
                self.step(spec["of"], surf_default, t + dt, g, "%s/%d" % (key, j), trims.get("steps_db", 0.0))
            return
        for j in range(int(spec.get("layers", 1))):
            self.hit("fx", spec, t, gain * (1.0 if j == 0 else 0.8), key if j == 0 else "%s/layer%d" % (key, j), dur=dur, trim_db=trims.get("fx_db", 0.0), layer=j, head=head)

    def events(self):
        evs = []
        for p in sorted(glob.glob(os.path.join(ROOT, "build", "*", "events.json"))) + self.more_events:
            for e in json.load(open(p)):
                evs.append((e, os.path.relpath(p, ROOT)))
        for e in self.cues.get("extra", []):
            if "cue" in e and e.get("shot") in self.shots:               # a moment from timeline.CUES (+ t as an offset)
                e = dict(e, t=story_t(e))
            evs.append((e, "sound/cues.json"))
        ok = [(e, o) for e, o in evs if e.get("shot") in self.shots]
        # a kind with `until` (and no dur) lasts until that other kind's next event in the same shot (story seconds)
        self.until = {}
        need = {(k, v["until"]) for k, v in KINDS.items() if v.get("until")}
        for e, _ in ok:
            for kind, other_kind in need:
                if e.get("kind") != kind:
                    continue
                for other, _ in ok:
                    if other.get("kind") == other_kind and other["shot"] == e["shot"] and float(other.get("t", 0)) > float(e.get("t", 0)):
                        k = (e["shot"], float(e.get("t", 0.0)), other_kind)
                        self.until[k] = min(self.until.get(k, 1e9), float(other["t"]) - float(e.get("t", 0.0)) + 0.06)
        # The accent guard (cue sheet): in a shot whose accent is named there, a guarded kind (e.g. a crowd's cheer)
        # that falls within `window` of the accent is moved to `delay` after it and turned down, so the big hit is
        # heard by itself first and the crowd answers it.
        self.guard, self.guarded = {}, []
        gd = self.cues.get("accent_guard", {})
        for sid, acc in gd.get("accents", {}).items():
            hits = [e for e, _ in ok if e["shot"] == sid and e.get("kind") == acc]
            if hits:
                first = max(hits, key=lambda e: (float(e.get("gain", 1.0)), -float(e.get("t", 0.0))))
                for k in gd.get("kinds", []):
                    self.guard[(sid, k)] = dict(t=float(first.get("t", 0.0)), accent=acc, window=float(gd.get("window", 0.08)),
                                                delay=float(gd.get("delay", 0.05)), db=float(gd.get("db", 0.0)))
        # the order of the deal: the story clock (see event())
        ok.sort(key=lambda p: (self.shots[p[0]["shot"]]["story_start"] + float(p[0].get("t", 0.0)), str(p[0].get("kind"))))
        # crowding: how many of the same kind sound at once ON THE FILM (see `crowd` above): only what the cut shows counts,
        # and a shot played faster crowds its sounds closer
        self.crowd, self.rank = {}, {}
        times = {}
        for n, (e, _) in enumerate(ok):
            kind = str(e.get("kind"))
            landing = any(kind.startswith(w + "_") for w in WHO)             # landings crowd together, whoever makes them
            if landing or KINDS.get(kind, {}).get("crowd"):
                T = film_t(self.shots, e["shot"], float(e.get("t", 0.0)))
                if T is not None:
                    times.setdefault((e["shot"], "landing" if landing else kind), []).append((T, id(e), float(e.get("gain", 1.0)), n))
        for k, lst in times.items():
            ts = np.array(sorted(r[0] for r in lst))
            for T, ident, _, _ in lst:
                self.crowd[ident] = int(np.searchsorted(ts, T + 0.06, side="right") - np.searchsorted(ts, T - 0.06, side="left"))
            if k[1] == "landing":                                              # feet on the very same instant: loudest first
                first, r = None, 0
                for T, ident, _, _ in sorted(lst, key=lambda r: (round(r[0], 3), -r[2], r[3])):
                    first, r = (first, r + 1) if first is not None and T - first < 0.004 else (T, 0)
                    self.rank[ident] = r
        for e, o in evs:
            if e.get("shot") not in self.shots:
                self.late.append("%s: shot %r is not in timeline.py (%s)" % (e.get("kind"), e.get("shot"), o))
        for e, o in ok:
            self.event(e, o)
        self.mute = False
        self.sources = sorted({o for _, o in evs})

    # ----------------------------------------------------------------------------------------------- ambience
    def per_shot_env(self, values, fade=CUT_FADE):
        """A gain curve: one value per shot (and END), moving from one to the next in `fade` seconds centred on the cut."""
        env = np.zeros(self.n)
        ids = self.order + ["END"]
        for k, sid in enumerate(ids):
            a = int(round(self.shots[sid]["start"] * SR))
            b = int(round(self.shots[ids[k + 1]]["start"] * SR)) if k + 1 < len(ids) else self.n
            env[a:b] = values.get(sid, 0.0)
        w = max(3, int(fade * SR) | 1)
        ker = np.hanning(w + 2)[1:-1]
        return np.convolve(np.pad(env, w // 2, mode="edge"), ker / ker.sum(), mode="valid")

    def ambience(self):
        amb = self.cues.get("ambience", {})
        by_light, by_shot = amb.get("by_light", {}), amb.get("shots", {})
        variants = {}
        for sid in self.order + ["END"]:
            layers = by_shot.get(sid, by_light.get(self.shots[sid]["light"], []))
            for L in layers:
                if L["bed"] not in self.lib.names:
                    self.missing[L["bed"]] = "ambience layer skipped"
                    continue
                key = (L["bed"], L.get("hp"), L.get("lp"))
                variants.setdefault(key, {})[sid] = variants.get(key, {}).get(sid, 0.0) + db(float(L.get("db", 0.0)))
        for (name, hp, lp), gains in sorted(variants.items(), key=lambda kv: str(kv[0])):
            x = self.lib.wav(name)
            if x.ndim == 1:
                x = np.stack([x, x], 1)
            # where the loop is at film time 0: from the cue sheet ("offsets", seconds) or a fixed place from the hash
            off = int(float(amb["offsets"][name]) * SR) if name in amb.get("offsets", {}) else int(h01("amb", name) * len(x))
            y = tone(np.take(x, (off + np.arange(self.n)) % len(x), axis=0), hp, lp)
            self.bus["amb"] += y * self.per_shot_env(gains)[:, None]

    # ----------------------------------------------------------------------------------------------- music
    def find_track(self):
        """The user's own music: sound/music/track.<anything ffmpeg reads>. When it is there it is the only music."""
        if self.track is False:
            return None
        if self.track:
            return self.track
        skip = (".json", ".txt", ".md", ".asd", ".pkf", ".sfk", ".reapeaks")
        c = sorted(q for q in glob.glob(os.path.join(ROOT, "sound", "music", "track.*")) if os.path.splitext(q)[1].lower() not in skip)
        return c[0] if c else None

    def music_track(self, path):
        """One track under the whole film, at one level (set in render(), against the action). The cue sheet's
        music.track says where in the track to start, where on the film, its tone, its fade-in, and how it ends:
        a fade over the end card, and/or splices: leave the track at one bar line and pick it up at another, so the
        track's own ending lands on the film's end."""
        m = self.cues.get("music", {}).get("track", {})
        r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
        if r.returncode != 0 or len(r.stdout) < 8 * SR:
            raise SystemExit("post/mix.py: ffmpeg could not read the music track %s: %s" % (path, r.stderr.decode(errors="replace")[:300]))
        x = tone(np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64), m.get("hp"), m.get("lp"))
        L = len(x) / SR
        T = when(m["at"], self.shots, "music track 'at'") if m.get("at") else 0.0
        pos = float(m.get("start", 0.0))
        xf = float(m.get("xfade", 0.05))
        runs, notes = [], []                                           # (film start, track from, track to) laid end to end
        for sp in m.get("splices", []):
            out = float(sp["out"]) if "out" in sp else pos + (when(sp["film"], self.shots, "music splice 'film'") - T)
            if not (pos + 2 * xf < out <= L) or not (0.0 <= float(sp["in"]) < L):
                notes.append("splice out %.3f -> in %.3f ignored (the track is being played from %.3f s and is %.3f s long)" % (out, float(sp["in"]), pos, L))
                continue
            runs.append((T, pos, out))
            T, pos = T + (out - pos), float(sp["in"])
        runs.append((T, pos, L))
        for k, (Tk, p0, p1) in enumerate(runs):
            pre = xf / 2 if k > 0 else 0.0                              # a splice is an equal-power cross-fade centred on the bar line
            post = xf / 2 if k + 1 < len(runs) else 0.0
            a, b = max(0, int(round((p0 - pre) * SR))), min(len(x), int(round((p1 + post) * SR)))
            y = x[a:b].copy()
            n = min(len(y), int(xf * SR))
            if k > 0 and n > 1:
                y[:n] *= np.sin(np.linspace(0, np.pi / 2, n))[:, None]
            if k + 1 < len(runs) and n > 1:
                y[-n:] *= np.cos(np.linspace(0, np.pi / 2, n))[:, None]
            if k == 0:
                f = min(len(y), int(float(m.get("fade_in", 0.3)) * SR))
                if f > 1:
                    y[:f] *= np.sin(np.linspace(0, np.pi / 2, f))[:, None] ** 2
            self.put("music", y, Tk - (p0 - a / SR))
        end = runs[-1][0] + (L - runs[-1][1])                          # where the track's last sample falls on the film
        fo = float(m.get("fade_out", 0.0))
        if fo > 0:                                                     # a fade that ends with the film (or with the track, if that is sooner)
            e = int(round(min(self.total, end) * SR))
            f = min(e, int(fo * SR))
            self.bus["music"][e - f:e] *= (np.cos(np.linspace(0, np.pi / 2, f)) ** 2)[:, None]
            self.bus["music"][e:] = 0.0
        # how sharp the orchestra sits (cents above A = 440): the median over the film, 4 s at a time (one short stretch
        # of a melody says little; the whole film says it to a few cents)
        est = [pitch_classes(self.bus["music"][i: i + 4 * SR]) for i in range(0, self.n - 4 * SR, 4 * SR)]
        est = [e[1] for e in est if e is not None]
        self.track_info = dict(path=os.path.relpath(path, ROOT), length=L, runs=runs, end=end, notes=notes, fade_out=fo,
                               cents=float(np.median(est)) if est else 0.0)

    def music(self):
        path = self.find_track()
        if path:
            return self.music_track(path)
        m = self.cues.get("music", {})
        cs = sorted(({**c, "T": when(c, self.shots, "music")} for c in m.get("cues", [])), key=lambda c: c["T"])
        if not cs:
            return
        bar = float(m.get("bar", 1.44))
        t0 = cs[0]["T"]
        if m.get("align"):                                               # slide the start back (less than a bar) so a bar line
            Ta = when(m["align"], self.shots, "music align")            # falls exactly on this moment, e.g. a picture cut
            if Ta > t0:
                t0 = max(0.0, Ta - np.ceil((Ta - t0) / bar - 1e-9) * bar)
                cs[0] = dict(cs[0], T=t0)
        segs = []
        for c in cs:
            T = c["T"]
            if c is not cs[0] and c.get("on_bar", True) and not c.get("one_shot"):
                T = t0 + np.ceil((T - t0) / bar - 1e-6) * bar           # change on the next bar line
            segs.append(dict(c, T=T))
        xf = 0.06
        for k, c in enumerate(segs):
            if c.get("stem") is None:
                continue
            if c["stem"] not in self.lib.names:
                self.missing[c["stem"]] = "music skipped"
                continue
            x = self.lib.wav(c["stem"])
            g = db(float(c.get("db", 0.0)))
            if c.get("one_shot"):
                self.put("music", x, c["T"], g, g)
                continue
            nxt = [s["T"] for s in segs[k + 1:] if not s.get("one_shot")]
            end = min(nxt[0] if nxt else self.total, self.total)
            want = int((end - c["T"] + xf) * SR)
            if want <= 0:
                continue
            y = np.take(x, np.arange(want) % len(x), axis=0) * g
            fi = int(max(xf, float(c.get("fade_in", xf))) * SR)
            fo = int(max(xf, float(c.get("fade_out", xf))) * SR)
            fi, fo = min(fi, len(y)), min(fo, len(y))
            y[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi))[:, None] ** (1 if fi <= int(xf * SR) else 2)
            y[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo))[:, None]
            self.put("music", y, c["T"])
        hp = m.get("hp")
        if hp:
            self.bus["music"] = tone(self.bus["music"], hp=hp)
        lv = m.get("shots")
        if lv:                                                           # per-shot trims of the music, moved slowly
            vals = {sid: db(float(lv.get(sid, 0.0))) for sid in self.order + ["END"]}
            self.bus["music"] *= self.per_shot_env(vals, fade=float(m.get("ride_s", 0.5)))[:, None]

    # ----------------------------------------------------------------------------------------------- the room
    def room(self):
        r = self.cues.get("room", {})
        send = float(r.get("db", -18.0))
        per = {sid: db(float(self.cues.get("shots", {}).get(sid, {}).get("room_db", send))) for sid in self.order + ["END"]}
        dry = (self.bus["steps"] * db(self.lv("steps")) + self.bus["fx"] * db(self.lv("fx"))) * self.per_shot_env(per, 0.02)[:, None]
        rt = float(r.get("rt", 0.28))
        rng = np.random.default_rng(int(r.get("seed", 1939)))
        n = int(rt * 1.4 * SR)
        ir = rng.standard_normal((n, 2)) * np.exp(-6.9 * np.arange(n) / SR / rt)[:, None]
        ir = tone(ir, hp=float(r.get("hp", 220.0)), lp=float(r.get("lp", 3800.0)))
        ir[: int(0.004 * SR)] = 0.0
        ir /= np.sqrt((ir ** 2).sum(0)).mean()
        self.bus["room"] = np.stack([signal.fftconvolve(dry[:, c], ir[:, c])[: self.n] for c in (0, 1)], axis=1)

    def lv(self, name):
        return float(self.cues.get("levels", {}).get(name, 0.0))

    def join_report(self):
        """For each join in the music: how big the step across it is, in level and in spectrum, against the steps the
        music itself makes from one pulse to the next in the four seconds either side. A join that sticks out would step
        more than its neighbours do. (Level: BS.1770-weighted, 0.25 s before against 0.25 s after. Spectrum: 24 bands,
        80 Hz - 10 kHz, the rms of their changes in dB once the change in overall level is taken out.)"""
        ti = self.track_info
        if not ti or len(ti["runs"]) < 2:
            return []
        mu = self.bus["music"]
        yk = kweight(mu)
        edges = np.geomspace(80, 10000, 25)

        def bands(a, b):
            seg = mu[int(a * SR): int(b * SR)].mean(1)
            S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2
            f = np.fft.rfftfreq(len(seg), 1.0 / SR)
            return np.array([10 * np.log10(S[(f >= lo) & (f < hi)].sum() + 1e-20) for lo, hi in zip(edges[:-1], edges[1:])])

        def step(t):
            lev = lambda a, b: -0.691 + 10 * np.log10((yk[int(a * SR): int(b * SR)] ** 2).mean(0).sum() + 1e-30)
            d = bands(t + 0.01, t + 0.26) - bands(t - 0.28, t - 0.03)
            return lev(t + 0.01, t + 0.26) - lev(t - 0.28, t - 0.03), float(np.sqrt(((d - d.mean()) ** 2).mean()))

        joins = [r[0] + 0.5 * float(self.cues["music"]["track"].get("xfade", 0.05)) * 0 + 0.010 for r in ti["runs"][1:]]   # the attack is 10 ms after the join's centre
        out = []
        for j in joins:
            near = [t for t in np.arange(j - 4.0, j + 4.01, 0.4) if 0.4 < t < self.total - 0.6 and all(abs(t - q) > 0.3 for q in joins)]
            st = np.array([step(t) for t in near])
            lj, sj = step(j)
            out.append("join at film %.3f s: level steps %+.1f dB, spectrum changes %.1f dB;  the music's own steps every 0.4 s around it: level median %.1f dB, largest %.1f dB; spectrum median %.1f dB, largest %.1f dB"
                       % (j - 0.010, lj, sj, np.median(np.abs(st[:, 0])), np.abs(st[:, 0]).max(), np.median(st[:, 1]), st[:, 1].max()))
        return out

    @staticmethod
    def loud_passages(x, pct=95.0):
        """How loud the loud passages are: the momentary loudness (400 ms, BS.1770 weighting) passed 5 % of the time."""
        y = kweight(x)
        w, h = int(0.4 * SR), int(0.1 * SR)
        cs = np.concatenate([np.zeros((1, 2)), np.cumsum(y * y, axis=0)])
        i = np.arange(1 + (len(y) - w) // h) * h
        return float(np.percentile(-0.691 + 10 * np.log10(((cs[i + w] - cs[i]) / w).sum(1) + 1e-30), pct))

    # ----------------------------------------------------------------------------------------------- all of it
    def render(self):
        self.music()                                                   # first: pitched effects are tuned to it
        self.events()
        self.ambience()
        self.room()
        for k in ("amb", "music", "steps", "fx"):
            if not (k == "music" and self.track_info):
                self.bus[k] = self.bus[k] * db(self.lv(k))
        if self.track_info:
            # The user's track sits at ONE fixed level, chosen against the action and not against a meter reading of the
            # file: `under_action_lu` below the loud passages of the knocks (the loudness steps + fx + room pass 5 % of the
            # time, 400 ms at a time), so a quiet master and a hot one end up in the same place under the same film.
            m = self.cues.get("music", {}).get("track", {})
            ev = float(m.get("even", 0.0))
            self.track_info["even"] = None
            if ev > 0:
                # OFF unless the cue sheet asks (even: 0..1). A recording with a wide range of its own (an orchestra: 15 LU
                # between its soft pages and its tuttis) cannot be both heard in the soft pages and under the action in
                # the tuttis at one gain. This takes out a part `even` of the recording's OWN slow swings: its loudness
                # over 3 s, against its average, smoothed over 2 s more. It listens only to the music, never to the
                # effects, and moves over seconds: a hand on the fader written down in advance, not a compressor.
                hop = SR // 20
                yk = (kweight(self.bus["music"]) ** 2).sum(1)
                c = np.concatenate([[0.0], np.cumsum(yk)])
                mid = np.arange(0, self.n, hop)
                a, b = np.clip(mid - 3 * SR // 2, 0, self.n), np.clip(mid + 3 * SR // 2, 0, self.n)
                L = -0.691 + 10 * np.log10((c[b] - c[a]) / np.maximum(1, b - a) + 1e-12)
                gdb = np.clip(-ev * (L - lufs(self.bus["music"])), -12.0, 12.0)
                k = np.hanning(41); k /= k.sum()
                gdb = np.convolve(np.pad(gdb, 20, mode="edge"), k, mode="valid")
                self.bus["music"] *= db(np.interp(np.arange(self.n), mid, gdb))[:, None]
                self.track_info["even"] = (ev, float(gdb.max()), float(gdb.min()))
            self.action_lufs = self.loud_passages(self.bus["steps"] + self.bus["fx"] + self.bus["room"])
            g = self.action_lufs - float(m.get("under_action_lu", 9.0)) - lufs(self.bus["music"]) + float(m.get("db", 0.0))
            self.bus["music"] *= db(g)
            self.track_info["gain_db"] = g
        tail = int(float(self.cues.get("tail_fade", 0.8)) * SR)
        head = int(float(self.cues.get("head_fade", 0.25)) * SR)
        env = np.ones(self.n)
        env[:head] = np.linspace(0, 1, head) ** 2
        env[-tail:] = np.cos(np.linspace(0, np.pi / 2, tail)) ** 2
        for k in self.bus:
            self.bus[k] *= env[:, None]
            self.bus[k] -= self.bus[k].mean(0)                         # no DC
        beds = self.bus["amb"] + self.bus["music"]
        hits = self.bus["steps"] + self.bus["fx"] + self.bus["room"]
        target = float(self.cues.get("target_lufs", -18.0))
        ceil = float(self.cues.get("true_peak_max", -1.0)) - 0.1      # a hair of margin for the mp3/aac encoders

        def gains(m):
            return target - lufs(m), ceil - true_peak(m)

        # Knocks are all peak and no loudness. If the film cannot reach the target because a few samples would pass the
        # ceiling, the tips of the knocks (never the beds) are rounded by a fixed curve: below `knee` of the top nothing
        # changes, above it the wave bends over. It is not a limiter: it has no memory and no gain that moves in time, so
        # nothing pumps. peak_round_db in the cue sheet is the most that may be taken off the highest peak (0 = off).
        # peak_round_on: "mix" (default) lays the curve on knocks + beds together and takes what it removes out of the
        # knocks alone: a knock gives way only where it and the music under it pass the knee TOGETHER, so no headroom is
        # kept for music that is not there at that instant (1.7 dB more film for the same rounding, measured). A knock is
        # only ever made smaller, sample by sample, never turned over; ambience and music come through unchanged.
        # "knocks" lays the curve on the knocks layer by itself (the first version).
        # peak_round_oversample (default 4): the curve is worked at 4 x 48 kHz and only what it takes away is brought back
        # down and subtracted from the knocks, so the wave is rounded BETWEEN the samples as well. Rounding the samples
        # alone left the true peak up to 1.6 dB above them (a flattened tip bulges between its samples), and the whole
        # film paid for that in level: 0.7 dB at 7 dB of rounding, measured.
        self.round_db, self.round_n = 0.0, 0
        mix = beds + hits
        g_l, g_p = gains(mix)
        most = float(self.cues.get("peak_round_db", 0.0))
        on_mix = self.cues.get("peak_round_on", "mix") != "knocks"
        self.round_on = "mix" if on_mix else "knocks"

        over = int(self.cues.get("peak_round_oversample", 4)) if on_mix else 1
        up = {}

        def bent(top):
            if not on_mix:
                return self._round(hits, top)
            if over > 1:
                if "mix" not in up:
                    up["mix"] = signal.resample_poly(mix, over, 1, axis=0)
                h = hits + signal.resample_poly(self._round(up["mix"], top) - up["mix"], 1, over, axis=0)[:len(hits)]
            else:
                h = self._round(mix, top) - beds
            return np.where(hits >= 0, np.minimum(np.maximum(h, 0.0), hits), np.maximum(np.minimum(h, 0.0), hits))

        if g_l > g_p + 0.05 and most > 0:
            pk = np.abs(mix if on_mix else hits).max()
            lo, hi = 0.0, most                                          # dB taken off the top
            for _ in range(7):
                mid = 0.5 * (lo + hi)
                m2 = beds + bent(pk * db(-mid))
                a, b = gains(m2)
                if a > b + 0.05:
                    lo = mid
                else:
                    hi = mid
            top = pk * db(-hi)
            self.round_db = hi
            shaped = bent(top)
            self.round_n = int((np.abs(shaped - hits) > 1e-3 * top).sum())      # (smaller than that: the filter's own ripple round a tip)
            self.round_rel = float(10 * np.log10(((shaped - hits) ** 2).sum() / (hits ** 2).sum() + 1e-30))
            self.round_most = float(20 * np.log10(np.abs(hits).max() / np.abs(shaped).max()))
            k = shaped / np.where(np.abs(hits) > 1e-12, hits, 1.0)      # the same curve, shared out over the three layers
            k = np.where(np.abs(hits) > 1e-12, k, 1.0)
            for name in ("steps", "fx", "room"):
                self.bus[name] = self.bus[name] * k
            mix = beds + shaped
            g_l, g_p = gains(mix)
        self.gain_db = min(g_l, g_p)
        self.limited_by = "loudness" if g_l <= g_p else "true peak"
        g = db(self.gain_db)
        for k in self.bus:
            self.bus[k] *= g
        return mix * g

    @staticmethod
    def _round(x, top, knee=0.6):
        a = knee * top
        m = np.abs(x)
        return np.where(m <= a, x, np.sign(x) * (a + (top - a) * np.tanh((m - a) / (top - a))))


def write_wav24(path, x):
    a = np.clip(np.round(x * 8388607.0), -8388608, 8388607).astype("<i4")
    w = wave.open(path, "wb")
    w.setnchannels(x.shape[1]); w.setsampwidth(3); w.setframerate(SR)
    w.writeframes(a.reshape(-1, 1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
    w.close()


def ffmpeg_loudness(path):
    try:
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True, timeout=120).stderr
        tail = r[r.rfind("Summary:"):]
        num = lambda label: float(tail.split(label)[1].split()[0])
        return num("I:"), num("LRA:"), num("Peak:")
    except Exception as e:                                             # ffmpeg missing: the numpy figures stand
        return None


def main():
    args = sys.argv[1:]
    more = [os.path.abspath(args[i + 1]) for i, a in enumerate(args) if a == "--events"]
    name = ([args[i + 1] for i, a in enumerate(args) if a == "--out"] or ["mix"])[0]
    cues = json.load(open(os.path.join(ROOT, "sound", "cues.json")))
    track = False if "--no-track" in args else ([os.path.abspath(args[i + 1]) for i, a in enumerate(args) if a == "--track"] or [None])[0]
    mx = Mix(cues, more, track)
    mix = mx.render()
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name + ".wav")
    write_wav24(path, mix)

    print("sound mix: %.3f s  (film %.3f s + end card %.1f s - cross-fade %.1f s), %d shots" % (mx.total, mx.film, tl.END_CARD, tl.XFADE, len(mx.order)))
    ed = [sid for sid in mx.order if mx.shots[sid]["edited"]]
    if ed:
        print("edit (timeline.EDIT): the film is %.3f s of the %.3f s rendered; %d shots trimmed or re-timed: %s" % (
              tl.film_frames() / tl.FPS, tl.total_frames() / tl.FPS, len(ed),
              "  ".join("%s %.2f-%.2f%s" % (sid, mx.shots[sid]["a"], min(mx.shots[sid]["b"], mx.shots[sid]["story"]), "" if abs(mx.shots[sid]["sp"] - 1) < 1e-6 else " x%.2f" % mx.shots[sid]["sp"]) for sid in ed)))
    else:
        print("edit (timeline.EDIT): empty, every shot is shown whole at speed 1")
    gone = sum(mx.cut_out.values())
    print("events cut out by the edit: %d%s; events with a length shortened by it: %d" % (gone, (" (" + ", ".join("%s x%d" % kv for kv in sorted(mx.cut_out.items())) + ")") if gone else "", mx.clipped))
    print("events from: " + (", ".join(mx.sources) if mx.sources else "(none)"))
    ti = mx.track_info
    if ti:
        print("music: the track %s (%.3f s long); the generated stems are off" % (ti["path"], ti["length"]))
        for k, (T, p0, p1) in enumerate(ti["runs"]):
            print("  %s film %7.3f s plays the track from %8.3f s%s" % ("from" if k == 0 else "splice at", T, p0, "" if k + 1 == len(ti["runs"]) else " (and leaves it at %.3f s)" % p1))
        print("  the track's own end falls at film %.3f s; the film ends at %.3f s%s" % (ti["end"], mx.total,
              ("; faded out over the last %.1f s" % ti["fade_out"]) if ti["fade_out"] > 0 else ""))
        for nline in ti["notes"]:
            print("  WARNING " + nline)
        mus, act = lufs(mx.bus["music"]), mx.loud_passages(mx.bus["steps"] + mx.bus["fx"] + mx.bus["room"])
        mlp = mx.loud_passages(mx.bus["music"])
        print("  level: one gain of %+.1f dB on the file -> music %.1f LUFS in the mix, %.1f LU under the action's loud passages (%.1f LUFS);" % (ti["gain_db"], mus, act - mus, act))
        print("         the music's own loud passages are at %.1f LUFS, %.1f LU under the action's" % (mlp, act - mlp))
        if ti.get("even"):
            print("         even %.2f: the recording's own slow swings reduced (its soft pages up to %+.1f dB, its tuttis down to %+.1f dB, over seconds)" % ti["even"])
        print("  the orchestra sits %+.0f cents from A = 440 (A = %.1f Hz); pitched effects are tuned to it and to the notes under them:" % (ti["cents"], 440 * 2 ** (ti["cents"] / 1200)))
        for line in mx.tuned:
            print("    " + line)
    else:
        print("music: the generated stems (no sound/music/track.* found)" if mx.track is not False else "music: the generated stems (--no-track)")
    built = sorted({os.path.basename(os.path.dirname(p)) for p in glob.glob(os.path.join(ROOT, "build", "*", "events.json"))})
    absent = [s for s in tl.SETS if s not in built]
    if absent:
        print("no events yet for set(s): %s  (their shots have ambience and music only)" % ", ".join(absent))
    if mx.round_db > 0:
        print("peak rounding: the tips of the knocks bent over by a fixed curve where %s the knee, up to %.1f dB off the top; %d samples changed"
              % ("knocks and beds together pass" if mx.round_on == "mix" else "the knocks layer passes", mx.round_db, mx.round_n))
        print("               (%.3f %% of the film); what it removes is %.1f dB under the knocks layer; ambience and music untouched"
              % (100.0 * mx.round_n / (2 * mx.n), mx.round_rel))
    else:
        print("peak rounding: not needed" if float(cues.get("peak_round_db", 0)) > 0 else "peak rounding: off")
    print("layers (after the final gain of %+.2f dB, set by %s):" % (mx.gain_db, mx.limited_by))
    for k in ("amb", "music", "steps", "fx", "room"):
        b = mx.bus[k]
        print("  %-6s %7.1f LUFS   peak %6.1f dBFS" % (k, lufs(b), 20 * np.log10(np.abs(b).max() + 1e-12)))
    print("mix     %7.2f LUFS   true peak %6.2f dBTP   (numpy BS.1770; target %.1f LUFS, ceiling %.1f dBTP)" % (lufs(mix), true_peak(mix), float(cues.get("target_lufs", -18.0)), float(cues.get("true_peak_max", -1.0))))
    ff = ffmpeg_loudness(path)
    if ff:
        print("ffmpeg  %7.2f LUFS   true peak %6.2f dBTP   LRA %.1f LU   (ebur128 on out/%s.wav)" % (ff[0], ff[2], ff[1], name))
    if mx.guarded:
        print("accent guard: " + "; ".join(mx.guarded))
    thinned = sum(1 for v in getattr(mx, "crowd", {}).values() if v > 1)
    print("events per kind (%d; %d of them thinned by the crowd rule):" % (sum(mx.counts.values()), thinned))
    for k in sorted(mx.counts):
        print("  %-22s %4d%s" % (k, mx.counts[k], "   <- unknown kind, played as a soft tick" if k in mx.unknown else ""))
    if mx.unknown:
        print("WARNING unknown kinds (played as a soft tick): " + ", ".join("%s x%d" % kv for kv in sorted(mx.unknown.items())))
    else:
        print("unknown kinds: none")
    if mx.unknown_surface:
        print("WARNING unknown surfaces (played as wood): " + ", ".join("%s x%d" % kv for kv in sorted(mx.unknown_surface.items())))
    for k, v in sorted(mx.missing.items()):
        print("WARNING library has no '%s': %s" % (k, v))
    for s in mx.late[:12]:
        print("WARNING " + s)
    # self-checks: clipping, DC, holes in the ambience
    clip = int((np.abs(mix) >= 0.999).sum())
    w = int(0.4 * SR)
    a = mx.bus["amb"][: (mx.n // w) * w].reshape(-1, w, 2)
    amb_db = 10 * np.log10((a ** 2).mean((1, 2)) + 1e-20)[: int((mx.total - 1.2) / 0.4)]
    print("checks: clipped samples %d, DC %.6f / %.6f, quietest 0.4 s of ambience %.1f dBFS (median %.1f)" % (clip, mix[:, 0].mean(), mix[:, 1].mean(), amb_db.min(), np.median(amb_db)))
    print("wrote " + os.path.relpath(path, ROOT))

    if "--stems" in args:
        os.makedirs(os.path.join(OUT, "stems"), exist_ok=True)
        for k, b in mx.bus.items():
            # 32-bit float: a layer by itself may stand a little over full scale where the music under it pulls the other
            # way (only their sum is kept under the ceiling), and a stem must not be clipped for it
            wavfile.write(os.path.join(OUT, "stems", k + ".wav"), SR, b.astype(np.float32))
        print("wrote out/stems/*.wav (32-bit float; they add up to the mix)")
    if "--no-preview" not in args:
        mp3 = os.path.join(OUT, name + "_preview.mp3")
        r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path, "-codec:a", "libmp3lame", "-b:a", "192k", mp3])
        print("wrote out/%s_preview.mp3" % name if r.returncode == 0 else "could not write the mp3 preview (ffmpeg)")
    if "--check" in args:
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path, "-lavfi",
                        "showspectrumpic=s=2400x800:legend=1:scale=log:fscale=log:start=30:stop=18000:drange=96", os.path.join(OUT, name + "_spectrogram.png")])
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path, "-lavfi",
                        "showwavespic=s=2400x500:split_channels=1:scale=sqrt", os.path.join(OUT, name + "_wave.png")])
        print("wrote out/%s_spectrogram.png, out/%s_wave.png" % (name, name))
        for line in mx.join_report():
            print(line)
        print("per shot: short-term level of the mix and of each layer (dBFS RMS, K-weighted for the mix)")
        km = kweight(mix)
        for sid in mx.order + ["END"]:
            s = mx.shots[sid]
            a, b = int(s["start"] * SR), min(mx.n, int((s["start"] + s["dur"]) * SR))
            row = "  %-4s %5.2f s  mix %6.1f" % (sid, s["dur"], -0.691 + 10 * np.log10((km[a:b] ** 2).mean(0).sum() + 1e-20))
            for k in ("amb", "music", "steps", "fx"):
                row += "  %s %6.1f" % (k, 10 * np.log10((mx.bus[k][a:b] ** 2).mean() + 1e-20))
            print(row + "  peak %5.1f" % (20 * np.log10(np.abs(mix[a:b]).max() + 1e-12)))


if __name__ == "__main__":
    main()
