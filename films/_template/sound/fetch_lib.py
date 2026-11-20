#!/usr/bin/env python3
"""The film's starter sound library: free (CC0) recordings + a few synthesised beds, ready for post/mix.py.

    python3 sound/fetch_lib.py          download what is missing (about 3 MB), then (re)build sound/lib/ and sound/credits.json
    python3 sound/fetch_lib.py --list   print the families it makes

Sources: three packs by Kenney (kenney.nl), CC0 1.0, fetched from GitHub mirrors at pinned commits (the same files
the first film made with this kit used), plus sounds synthesised here (room tone, whooshes, a spinning hum). Every file in sound/lib is
listed in sound/credits.json with its source and licence.

The mixer finds sounds by FAMILY: sound/lib/<family>_NN.wav (or <family>.wav). A film adds its own families the same
way (record or find CC0 / public-domain sounds, cut and level them like render() below, credit every file) and maps
its animation's event kinds onto families in post/mix.py's KINDS table. Never use a sound whose licence you have not
read: CC0 or public domain only, with the source written down.
"""
import io
import json
import os
import subprocess
import sys
import urllib.request
import zipfile
import zlib

import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
LIB = os.path.join(HERE, "lib")
SR = 48000
CC0 = "https://creativecommons.org/publicdomain/zero/1.0/"
PACKS = {
    "impact": dict(repo="Boyquotes/kenney-impact-sounds-for-godot", commit="999dd16", title="Impact Sounds (1.0)", page="https://kenney.nl/assets/impact-sounds"),
    "rpg": dict(repo="Boyquotes/kenney-rpg-audio-for-godot", commit="22eb79b", title="RPG Audio", page="https://kenney.nl/assets/rpg-audio"),
    "ui": dict(repo="Calinou/kenney-ui-audio", commit="8c3d81b", title="UI Audio", page="https://kenney.nl/assets/ui-audio"),
}


def fetch():
    for key, p in PACKS.items():
        d = os.path.join(RAW, key)
        if os.path.isdir(d) and len(os.listdir(d)) > 10:
            continue
        url = "https://github.com/%s/archive/%s.zip" % (p["repo"], p["commit"])
        print("fetching", url, flush=True)
        data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "film-sound/1.0"}), timeout=120).read()
        os.makedirs(d, exist_ok=True)
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            for m in z.namelist():
                b = os.path.basename(m)
                if b.lower().endswith((".ogg", ".wav")) or b.upper().startswith("LICENSE"):
                    open(os.path.join(d, b), "wb").write(z.read(m))
        print("  %s: %d files" % (key, len(os.listdir(d))), flush=True)


# ── small tools (as the first film's library was made, so the mixer's levels mean the same) ──
def load(pack, name):
    p = os.path.join(RAW, pack, name)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def varispeed(x, st):
    if not st:
        return x
    from fractions import Fraction
    fr = Fraction(2 ** (-st / 12.0)).limit_denominator(160)
    return signal.resample_poly(x, fr.numerator, fr.denominator, axis=0)


def filt(x, hp=None, lp=None):
    if hp:
        x = signal.sosfilt(signal.butter(2, hp, btype="high", fs=SR, output="sos"), x, axis=0)
    if lp:
        x = signal.sosfilt(signal.butter(2, lp, btype="low", fs=SR, output="sos"), x, axis=0)
    return x


def fade(x, fi_ms=1.0, fo_ms=20.0):
    x = x.copy()
    a, b = min(len(x) // 2, int(fi_ms * SR / 1000)), min(len(x) // 2, int(fo_ms * SR / 1000))
    sh = (slice(None),) + (None,) * (x.ndim - 1)
    if a > 1:
        x[:a] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(a) / a))[sh]
    if b > 1:
        x[-b:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(b) / b))[sh]
    return x


def kweight(x):
    """ITU-R BS.1770 K-weighting."""
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = np.tan(np.pi * f0 / SR); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = np.tan(np.pi * f0 / SR); a0 = 1 + K / Q + K * K
    return signal.lfilter([1, -2, 1], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0], signal.lfilter(b, a, x, axis=0), axis=0)


def hit_level(x):
    """How loud a short sound reads: the loudest 50 ms of its K-weighted energy, in dB."""
    y = kweight(np.concatenate([x, np.zeros((int(0.05 * SR),) + x.shape[1:])]))
    p = (y ** 2).reshape(len(y), -1).mean(1)
    w = int(0.05 * SR)
    c = np.concatenate([[0], np.cumsum(p)])
    return 10 * np.log10((c[w:] - c[:-w]).max() / w + 1e-20)


def bed_level(x):
    return 10 * np.log10((kweight(x) ** 2).mean() + 1e-20)


def soften(x, top):
    a = 0.6 * top
    m = np.abs(x)
    return np.where(m <= a, x, np.sign(x) * (a + (top - a) * np.tanh((m - a) / (top - a))))


def level_to(x, target, kind="hit", ceiling=-1.5, crest=12.0):
    meter = hit_level if kind == "hit" else bed_level
    x = x * 10 ** ((target - meter(x)) / 20)
    if crest is not None and kind == "hit":
        for _ in range(3):
            x = soften(x, 10 ** ((target + crest) / 20))
            x = x * 10 ** ((target - meter(x)) / 20)
    pk = np.abs(x).max()
    lim = 10 ** (ceiling / 20)
    return x * (lim / pk) if pk > lim else x


def make_loop(x, xf_s=1.0):
    n = int(xf_s * SR)
    out = x[n:].copy()
    t = (np.arange(n) / n)[(slice(None),) + (None,) * (x.ndim - 1)]
    out[-n:] = out[-n:] * np.cos(t * np.pi / 2) + x[:n] * np.sin(t * np.pi / 2)
    return out


def write(name, x):
    x = np.asarray(x, dtype=np.float64)
    rng = np.random.default_rng(zlib.crc32(name.encode()))
    d = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0          # TPDF dither
    wavfile.write(os.path.join(LIB, name + ".wav"), SR, np.clip(np.round((x + d) * 32767.0), -32768, 32767).astype(np.int16))


def take(pack, name, st=0.0, hp=60, lp=None, level=-20.0, max_s=None, fo=None):
    """One recording, trimmed to 2 ms before its onset, filtered, pitched, faded and brought to a loudness."""
    x = load(pack, name)
    m = np.abs(x)
    a = max(0, int(np.argmax(m > 0.05 * m.max())) - int(0.002 * SR))
    x = x[a:]
    if max_s:
        x = x[: int(max_s * SR)]
    x = varispeed(x, st)
    x = filt(x, hp, lp)
    x = fade(x, 1.0, fo if fo else min(60.0, 0.3 * 1000 * len(x) / SR))
    return level_to(x, level, "hit")


# ── the families: (family, pack, files, options). Levels: a step on wood is the reference (about -21). ──
I = lambda stem: ["%s_%03d.ogg" % (stem, k) for k in range(5)]
RECIPE = [
    ("step_wood", "impact", I("footstep_wood"), dict(level=-21.0)),
    ("step_rug", "impact", I("footstep_carpet"), dict(level=-24.0, lp=3500)),
    ("step_stone", "impact", I("footstep_concrete"), dict(level=-21.0)),
    ("step_grass", "impact", I("footstep_grass"), dict(level=-23.0)),
    ("step_snow", "impact", I("footstep_snow"), dict(level=-23.0)),
    ("step_board", "rpg", ["footstep_%d.ogg" % k for k in range(10)], dict(level=-21.0)),
    ("thump", "impact", I("impact_wood_medium"), dict(st=-2, level=-20.0)),
    ("knock_wood", "impact", I("impact_wood_light"), dict(level=-20.0)),
    ("knock_medium", "impact", I("impact_wood_medium"), dict(level=-19.0)),
    ("thud_wood", "impact", I("impact_wood_heavy"), dict(level=-17.0)),
    ("plank", "impact", I("impact_plank_medium"), dict(level=-18.0)),
    ("clink_glass", "impact", I("impact_glass_light"), dict(level=-22.0, hp=300)),
    ("glass_hit", "impact", I("impact_glass_medium"), dict(level=-20.0, hp=200)),
    ("glass_heavy", "impact", I("impact_glass_heavy"), dict(level=-18.0, hp=150)),
    ("clank_metal", "impact", I("impact_metal_light"), dict(level=-21.0, hp=200)),
    ("metal_hit", "impact", I("impact_metal_medium"), dict(level=-19.0)),
    ("metal_heavy", "impact", I("impact_metal_heavy"), dict(level=-17.0)),
    ("tin", "impact", I("impact_tin_medium"), dict(level=-20.0, hp=200)),
    ("plate", "impact", I("impact_plate_light"), dict(level=-21.0)),
    ("plate_heavy", "impact", I("impact_plate_medium"), dict(level=-19.0)),
    ("bell", "impact", I("impact_bell_heavy"), dict(level=-20.0)),
    ("soft_hit", "impact", I("impact_soft_medium"), dict(level=-20.0)),
    ("soft_heavy", "impact", I("impact_soft_heavy"), dict(level=-18.0)),
    ("punch", "impact", I("impact_punch_medium"), dict(level=-18.0)),
    ("hit", "impact", I("impact_generic_light"), dict(level=-20.0)),
    ("cloth", "rpg", ["cloth_%d.ogg" % k for k in range(1, 5)] + ["cloth_belt.ogg", "cloth_belt_2.ogg"], dict(level=-24.0, hp=90)),
    ("paper", "rpg", ["book_flip_%d.ogg" % k for k in range(1, 4)], dict(level=-24.0, hp=300)),
    ("book_place", "rpg", ["book_place_%d.ogg" % k for k in range(1, 4)], dict(level=-20.0)),
    ("book_open", "rpg", ["book_open.ogg", "book_close.ogg"], dict(level=-22.0)),
    ("creak", "rpg", ["creak_%d.ogg" % k for k in range(1, 4)], dict(level=-23.0, hp=150)),
    ("door_open", "rpg", ["door_open_1.ogg", "door_open_2.ogg"], dict(level=-21.0)),
    ("door_close", "rpg", ["door_close_%d.ogg" % k for k in range(1, 5)], dict(level=-18.0)),
    ("knife_draw", "rpg", ["draw_knife_%d.ogg" % k for k in range(1, 4)], dict(level=-22.0, hp=300)),
    ("knife_slice", "rpg", ["knife_slice.ogg", "knife_slice_2.ogg"], dict(level=-22.0, hp=300)),
    ("chop", "rpg", ["chop.ogg"], dict(level=-18.0)),
    ("pot", "rpg", ["metal_pot_%d.ogg" % k for k in range(1, 4)], dict(level=-20.0)),
    ("latch", "rpg", ["metal_latch.ogg", "metal_click.ogg"], dict(level=-21.0, hp=200)),
    ("coins", "rpg", ["handle_coins.ogg", "handle_coins_2.ogg"], dict(level=-22.0, hp=200)),
    ("leather", "rpg", ["drop_leather.ogg", "handle_small_leather.ogg", "handle_small_leather_2.ogg"], dict(level=-22.0)),
    ("belt", "rpg", ["belt_handle_1.ogg", "belt_handle_2.ogg"], dict(level=-23.0)),
    ("click", "ui", ["click%d.wav" % k for k in range(1, 6)], dict(level=-22.0, hp=120)),
    ("switch", "ui", ["switch%d.wav" % k for k in range(1, 13)], dict(level=-22.0, hp=120)),
    ("tick", "ui", ["rollover%d.wav" % k for k in range(1, 7)], dict(level=-26.0, hp=300)),
]


# ── synthesised (nothing downloaded) ──
def room_tone(seconds=24.0, seed=5):
    """The air of a quiet room: noise falling 6 dB per octave below 400 Hz and faster above, slowly breathing, no hum."""
    rng = np.random.default_rng(seed)
    n = int((seconds + 1.5) * SR)
    out = []
    for c in (0, 1):
        S = np.fft.rfft(rng.standard_normal(n))
        f = np.fft.rfftfreq(n, 1 / SR)
        y = np.fft.irfft(S * (1.0 / np.sqrt(1 + (f / 90.0) ** 2) / (1 + (f / 2600.0) ** 2) * (f > 25)), n)
        lf = rng.standard_normal(n // 4800 + 2)
        out.append(y * (1 + 0.12 * np.interp(np.arange(n), np.arange(len(lf)) * 4800, signal.lfilter([0.2], [1, -0.8], lf))))
    return level_to(make_loop(np.stack(out, 1), 1.5), -30.0, "bed", ceiling=-6.0)


def whoosh(dur=0.42, f0=500.0, f1=2400.0, seed=1):
    """Soft air moving past: a short swell of noise through a band that rises then falls."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    w = rng.standard_normal(n + 2048)
    t = np.arange(n) / n
    fc = f0 + (f1 - f0) * np.sin(np.pi * t) ** 1.5
    y = np.zeros(n)
    lo = bp = 0.0
    for i in range(n):
        g = 2 * np.sin(np.pi * min(fc[i], 9000.0) / SR)
        lo += g * bp
        hi = w[i] - lo - 0.9 * bp
        bp += g * hi
        y[i] = bp
    return level_to(filt(y * np.sin(np.pi * t) ** 2.2 * (1 - 0.35 * t), hp=150, lp=6000), -22.0, "hit")


def spin(rate=9.0, dur=3.0, seed=2):
    """Something spinning on a hard surface (a top, a coin, a wheel): a dry purr of rubbing noise, pulsing at the turn
    rate, over a faint hum. Loops (whole pulses in the loop)."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    rate = round(rate * dur) / dur
    noise = filt(rng.standard_normal(n), hp=700, lp=4200)
    pulse = 0.55 + 0.45 * np.sin(2 * np.pi * rate * t) ** 2
    hum = 0.25 * np.sin(2 * np.pi * (rate * 12) * t) + 0.12 * np.sin(2 * np.pi * (rate * 24) * t)
    return level_to((noise * pulse + hum * 0.08) * 0.5, -28.0, "bed", ceiling=-6.0)


SYNTH = [
    ("amb_room", room_tone, "the air of a quiet room: slowly breathing low noise (synthesised)"),
    ("spin_01", lambda: spin(9.0, 3.0, 2), "something spinning on a hard surface: a purr at 9 turns a second (synthesised)"),
    ("spin_02", lambda: spin(5.0, 3.0, 4), "something spinning on a hard surface: a purr at 5 turns a second (synthesised)"),
] + [("whoosh_%02d" % (k + 1), (lambda k=k: whoosh(0.30 + 0.08 * k, 400 + 90 * k, 2000 + 300 * k, seed=k + 1)), "soft air moving past (synthesised)") for k in range(6)]


def main():
    if "--list" in sys.argv:
        for fam, pack, files, o in RECIPE:
            print("%-14s %d takes from %s" % (fam, len(files), pack))
        for name, _, why in SYNTH:
            print("%-14s %s" % (name, why))
        return
    fetch()
    os.makedirs(LIB, exist_ok=True)
    credits = {"about": "Every file in sound/lib: its source and licence. Rebuild with: python3 sound/fetch_lib.py. Add your own sounds "
                        "the same way: CC0 or public domain only, with the source written down here.", "files": {}}
    for fam, pack, files, o in RECIPE:
        for k, f in enumerate(files):
            name = "%s_%02d" % (fam, k + 1)
            try:
                write(name, take(pack, f, **o))
            except Exception as e:
                print("SKIPPED %s (%s): %r" % (name, f, e))
                continue
            p = PACKS[pack]
            credits["files"][name] = dict(source="%s by Kenney (kenney.nl): %s" % (p["title"], f), licence="CC0 1.0", licence_url=CC0, page=p["page"],
                                          downloaded_from="https://github.com/%s (commit %s)" % (p["repo"], p["commit"]))
    for name, fn, why in SYNTH:
        write(name, fn())
        credits["files"][name] = dict(source=why, licence="made here (no recording)")
    json.dump(credits, open(os.path.join(HERE, "credits.json"), "w"), indent=1)
    print("LIBRARY %d files in %s" % (len(credits["files"]), LIB))


main()
