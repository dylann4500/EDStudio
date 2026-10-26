#!/usr/bin/env python3
"""Cue sheet for 018 (montage, unhinged): "What if every human became magnetic?" -> cues.json
Run: python3 -I videos/018-magnetic/make_cues.py

Sound identity (new — not 014's music box, 013's pluck slip, 012's pizzicato or 010's C-minor kaiju march):
  a MAGNETIC HEIST — E minor, 112 bpm: low spiccato strings driving 8ths (i–VI–iv–V), a soft mallet ostinato on top, soft
  taiko on beats 1 + 3, a braam + boom the moment everyone becomes a magnet, a boom on every beat's big pile-up. It lifts to
  G major for the wooden world and turns into a warm piano arp (C – G/B – Am – F) for the four-hour hug.
  - 0–5.4 s: quiet street only (traffic, a murmur, footsteps, one car passing behind the title). Music ENTERS at 5.4.
  - foley-led impacts: every splat is a soft low "CLONG" (new synth sound `metal_clang`, low-passed), cutlery = tiny clinks,
    carts = a wire rattle (soft key taps) + a pile-up, the subway = a cabin roar + wheel clacks, the press room = shutter
    clicks, the MRI = a soft hum, Paris = wind + a rain of little clangs, the woods = leaves, the suburb = street + crickets
    at dusk. Steady mix, the music never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 69.0
M1 = 5.4
BEAT = 60 / 112.0                 # 0.536 s
S8 = BEAT / 2
SCENES = [0, 9.2, 14.6, 20.0, 25.4, 30.8, 36.2, 41.6, 47.0, 49.0, 52.4, 57.8, 64.6]

# ---------------------------------------------------------------- impact times (mirrors shots.js)
OPEN_LAND = [M1 + 0.16 + d + 0.3 for d in [0, 0.07, 0.03, 0.1, 0.05, 0.08, 0.02, 0.12]]
CUT = [10.2 + k * 0.08 + 0.27 for k in range(12)]
TOAST, PAN, SLAM, POP = 11.25 + 0.3, 11.75 + 0.3, 12.62, 13.85
# market
SH_RUN, SH_STOP, V_RUN, V_CART, SCOOP_Z = 17.4, 18.5, 2.4, 7.0, -0.35
Z_STOP = -7.0 + 1.0 * (SH_RUN - 14.6) + V_RUN * (SH_STOP - SH_RUN)
startZ = lambda k: Z_STOP - (0.9 + k * 0.62)
T_SCOOP = SH_STOP + (Z_STOP - 0.45 - startZ(0)) / V_CART
def cart0Z(t):
    if t < T_SCOOP: return startZ(0) + V_CART * (t - SH_STOP)
    u = min(1, (t - T_SCOOP) / 0.45); return (Z_STOP - 0.45) + (SCOOP_Z - (Z_STOP - 0.45)) * (1 - (1 - u) ** 2)
TK = [T_SCOOP]
for k in range(1, 12):
    tt = SH_STOP
    while tt < 22 and startZ(k) + V_CART * (tt - SH_STOP) < cart0Z(tt) - 0.42 * min(k, 6): tt += 1 / 240
    TK.append(tt + (0.35 if k >= 6 else 0))
MEET, JOIN = 22.75, [23.55 + i * 0.11 + 0.28 for i in range(7)]
MICS, ROWS = 28.25 + 0.3, [28.45 + 0.42 + r * 0.07 for r in range(4)]
SUCK_LAND, PETALS, OBJ = 31.75 + 0.32, [32.55, 33.2, 33.55, 33.9, 34.2, 34.55, 34.85], [34.0, 34.35, 35.15]
REPEL, SNAP = 37.55, 39.45
PARIS_RIGS = [41.9 + i * 0.27 for i in range(9)]
NEEDLE, CLONK = 48.3, 51.05
POOF = [53.55, 54.35]
HUG = 59.4

# ---------------------------------------------------------------- music
chords = [[M1, "Em"]]
def bars(t0, t1, prog):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += 4 * BEAT; k += 1
bars(M1 + 4 * BEAT, 52.4, ["C", "Am", "B", "Em"])
bars(52.4, 57.8, ["G", "D", "Em", "C"])                         # the wooden world: relief, major
chords += [[57.8, "C"], [59.4, "G/B"], [60.8, "Am"], [62.2, "F"], [63.4, "C"], [64.6, "G"], [66.4, "C"], [67.8, "G"]]
drive = [0, 0, 1, 0, 2, 0, 1, 0]
sections = [
    {"t0": M1, "t1": 52.4, "style": "strings", "vel": [[M1, 0.42], [7.0, 0.32], [30.8, 0.36], [47.0, 0.4], [52.4, 0.42]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.35},
    {"t0": 52.4, "t1": 57.8, "style": "strings", "vel": [[52.4, 0.38], [57.8, 0.32]], "step": S8, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.5},
    {"t0": 57.8, "t1": 64.6, "style": "arp", "vel": [[57.8, 0.44], [61.0, 0.5], [64.6, 0.46]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 64.6, "t1": D, "style": "arp", "vel": 0.36, "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
]
# mallet ostinato on top of the drive (its own section list is folded into the strings via mallet_melody: a curious figure)
mallet_melody = []
EM = {"Em": [64, 67, 71, 76], "C": [64, 67, 72, 76], "Am": [64, 69, 72, 76], "B": [63, 66, 71, 75], "G": [67, 71, 74, 79], "D": [66, 69, 74, 78]}
for i, (t0, sym) in enumerate(chords):
    if t0 >= 57.8: break
    t1 = chords[i + 1][0] if i + 1 < len(chords) else 57.8
    tones = EM[sym.split("/")[0]]
    k, t = 0, t0
    while t < t1 - 0.05:
        if k % 8 in (0, 3, 5, 6):
            mallet_melody.append([round(t, 3), tones[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12, 0.2 if k % 8 == 0 else 0.15, S8 * 0.9])
        t += S8; k += 1
for s0 in SCENES[1:10]:           # the "magnet pull" motif opens every beat: a rising, accelerating 4-note swoop
    mallet_melody += [[round(s0 + 0.04, 3), 76, 0.24, 0.12], [round(s0 + 0.17, 3), 78, 0.24, 0.1], [round(s0 + 0.27, 3), 79, 0.26, 0.1], [round(s0 + 0.35, 3), 83, 0.28, 0.35]]
melody = [[57.85, 72, 0.36, True, 0.8], [59.1, 67, 0.3, False, 0.4], [59.45, 71, 0.38, True, 0.8], [60.85, 72, 0.4, True, 0.9], [62.25, 77, 0.4, True, 1.0], [63.45, 76, 0.42, True, 1.6],
          [64.65, 74, 0.36, True, 1.2], [66.45, 76, 0.34, True, 1.2], [67.85, 79, 0.32, True, 1.0]]
drums = [[M1, 0.9, "boom"], [M1, 0.55, "taiko"], [SLAM, 0.7, "boom"], [TK[0], 0.55, "boom"], [TK[-1], 0.6, "boom"], [JOIN[-1], 0.75, "boom"], [ROWS[0], 0.8, "boom"],
         [OBJ[2], 0.75, "boom"], [REPEL + 0.05, 0.8, "boom"], [SNAP, 0.45, "taiko"], [46.3, 0.6, "boom"], [CLONK, 0.75, "boom"], [POOF[0], 0.35, "taiko"], [POOF[1], 0.35, "taiko"],
         [HUG, 0.4, "taiko"], [64.6, 0.45, "boom"]]
drum_patterns = [
    {"t0": M1 + 4 * BEAT, "t1": 52.4, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[7.5, 0.26], [30.8, 0.32], [52.4, 0.4]], "kind": "taiko"},
    {"t0": 50.2, "t1": 51.0, "step": 0.1, "pattern": [1], "vel": [[50.2, 0.12], [51.0, 0.45]], "kind": "tom"},                 # roll into the hikers' clonk
    {"t0": 52.4, "t1": 57.6, "step": BEAT, "pattern": [1, 0, 0.5, 0], "vel": 0.28, "kind": "taiko"},
]
DRONE = [28, 40, 47, 52, 59]   # E1 E2 B2 E3 B3
pad = [
    {"t0": M1, "t1": M1 + 4 * BEAT + 0.05, "notes": [28, 35, 40, 47, 52], "level": 1.5, "attack": 0.12, "release": 0.8, "cutoff": 900, "hp": 30},   # braam
    {"t0": M1 + 4 * BEAT, "t1": 52.45, "notes": DRONE, "level": 0.78, "attack": 0.6, "release": 0.6, "cutoff": 650, "hp": 30},
    {"t0": 52.4, "t1": 57.85, "notes": [31, 43, 50, 55, 62], "level": 0.9, "attack": 0.4, "release": 0.6, "cutoff": 900, "hp": 30},                # G lift
]
for i, (c0, sym) in enumerate(chords):
    if c0 < 57.8: continue
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": sym, "level": 1.9, "attack": 0.12, "release": 0.8})

# ---------------------------------------------------------------- ambience (one bed per place)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("city_day", 0.0, 9.25, -34, fi=0.5, args={"murmur": 0.7, "traffic": 0.8}, seed=1),
    bed("room_tone", 9.2, 14.65, -38), bed("clock", 9.2, 14.65, -52),
    bed("room_tone", 14.6, 20.05, -36), bed("city_day", 14.6, 20.05, -44, args={"murmur": 0.8, "traffic": 0.0}, seed=2),
    bed("cabin_hum", 20.0, 25.45, -35), bed("traffic_flow", 20.0, 25.45, -44, args={"density": 0.5}, seed=3),
    bed("room_tone", 25.4, 30.85, -37), bed("applause", 25.4, 26.5, -42, fo=0.5, args={"density": 14.0}, seed=4),
    bed("room_tone", 30.8, 36.25, -37), bed("lamp_hum", 30.8, 36.25, -53),
    bed("wind", 36.2, 41.65, -46, args={"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, seed=5), bed("crowd_cheer", SNAP + 0.15, 41.65, -33, fi=0.15, seed=6),
    bed("wind", 41.6, 47.05, -43, args={"darkness": 0.45, "gust": 0.35, "whistle": 0.0}, seed=7), bed("city_day", 41.6, 47.05, -40, args={"murmur": 1.0, "traffic": 0.2}, seed=8),
    bed("wind", 47.0, 52.45, -45, args={"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, seed=9), bed("dry_leaves", 47.0, 52.45, -48, args={"density": 0.5}, seed=10),
    bed("city_day", 52.4, D, -41, fo=1.0, args={"murmur": 0.4, "traffic": 0.5}, seed=11),
    bed("crickets", 61.5, D, -47, fi=2.0, fo=1.0, args={"count": 3, "density": 0.5}, seed=12),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def clang(t, g=-22, size=1.0, pitch=1.0, pan=0.0):
    E(t, "metal_clang", g, pan, {"size": size, "pitch": pitch})
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})

# 1. open: footsteps, one car behind the title, then the yank: a low swell, everyone's clang (staggered), a dog boof
steps(0.2, M1, -31, 2.0, -0.3, 0.2); steps(0.5, M1, -33, 1.8, 0.3, -0.1)
E(2.75, "car_pass", -27, -0.3, {"dur": 1.6, "size": 0.9}, room=-18)
E(M1 - 0.12, "low_swell", -24, 0.0, {"dur": 0.9, "pitch": 0.55})
for i, t in enumerate(OPEN_LAND): clang(t, -21 - (i % 3), 1.0 + 0.15 * (i % 3), 1.0 - 0.05 * (i % 4), ((i % 5) - 2) * 0.18)
E(6.9, "dog_bark", -27, 0.2, {"pitch": 1.1}, room=-18)
E(8.7, "car_pass", -28, 0.4, {"dur": 1.4, "size": 1.0}, room=-18)
# 2. kitchen: a sip, cutlery clinks, toaster clunk, the pan bonk, the fridge SLAM, toast pop
E(9.6, "slurp", -30, -0.1, {"dur": 0.4})
for k, t in enumerate(CUT): clang(t, -31 + (k % 3), 0.25, 2.4 + 0.15 * (k % 4), 0.15)
clang(TOAST, -24, 0.55, 1.4, 0.1); E(PAN, "bonk", -22, 0.0); clang(PAN + 0.01, -27, 0.5, 1.8)
E(SLAM - 0.3, "low_swell", -27, -0.2, {"dur": 0.5, "pitch": 0.8})
clang(SLAM, -17, 1.7, 0.75, -0.25); E(SLAM + 0.02, "giant_step", -24, -0.25, {"size": 0.5, "surface": "wood"})
E(POP, "lamp_switch_click", -26, -0.2); E(POP + 0.05, "plush_squeak", -27, -0.2, {"pitch": 1.0})
# 3. market: her footsteps, a wire-cart rattle that grows, the run, the scoop + pile-up
steps(14.6, SH_RUN, -31, 1.9, 0.0, 0.05); steps(SH_RUN, SH_STOP, -29, 4.6, 0.05, 0.1)
for j in range(5): E(14.8 + j * 0.85, "keyboard_type", -33 + j, 0.0, {"dur": 0.8, "rate": 16.0})
E(SH_RUN + 0.1, "keyboard_type", -27, 0.0, {"dur": SH_STOP - SH_RUN, "rate": 22.0})
for k, t in enumerate(TK): clang(t, -20 if k in (0, 11) else -25, 0.9 if k else 1.3, 1.1 + 0.05 * (k % 3), ((k % 5) - 2) * 0.15)
E(TK[0] + 0.05, "plush_squeak", -25, 0.0, {"pitch": 0.7})
# 4. subway: wheel clacks under the hum, the strangers' thud, then everyone joins (a clang each), the last one = boom
t = 20.1
while t < 25.35: E(t, "giant_step", -33, 0.0, {"size": 0.2, "surface": "wood"}, room=-20); E(t + 0.13, "giant_step", -35, 0.0, {"size": 0.18, "surface": "wood"}, room=-20); t += 1.07
E(MEET - 0.2, "low_swell", -27, 0.0, {"dur": 0.4, "pitch": 0.9}); E(MEET, "giant_step", -21, 0.0, {"size": 0.45, "surface": "ground"}); E(MEET + 0.03, "plush_squeak", -26, 0.0, {"pitch": 0.65})
for i, t in enumerate(JOIN): clang(t, -24, 0.8, 1.0 + 0.06 * (i % 3), ((i % 5) - 2) * 0.2); E(t + 0.01, "giant_step", -27, 0.0, {"size": 0.3, "surface": "ground"})
# 5. press: shutter clicks (faster after the mics fly), the mic clatter, the chairs' scrape + the pile-up
t = 25.6
while t < 30.7:
    E(t, "lamp_switch_click", -31, ((int(t * 7) % 5) - 2) * 0.2); t += 1 / (1.4 if t < MICS else 4.5)
for k in range(8): clang(MICS + k * 0.03, -30, 0.2, 2.6 + 0.1 * (k % 3), ((k % 5) - 2) * 0.1)
E(28.5, "metal_groan", -27, 0.0, {"dur": 0.45, "pitch": 2.2})
for r, t in enumerate(ROWS): clang(t, -19 if r == 0 else -23, 1.3, 0.8 + 0.05 * r, ((r % 3) - 1) * 0.25); E(t + 0.02, "giant_step", -25, 0.0, {"size": 0.4, "surface": "wood"})
# 6. MRI: the doctor goes in (whoosh-free: a low swell + clang), the petals, the objects; the wheelchair = boom
E(SUCK_LAND - 0.35, "low_swell", -25, 0.0, {"dur": 0.6, "pitch": 0.7}); clang(SUCK_LAND, -19, 1.5, 0.7)
for i, t in enumerate(PETALS): clang(t, -22, 1.0, 0.9 + 0.07 * (i % 4), ((i % 5) - 2) * 0.2); E(t + 0.02, "plush_squeak", -30, 0.0, {"pitch": 0.6 + 0.05 * i})
for i, t in enumerate(OBJ): clang(t, -20 if i == 2 else -23, 1.2 if i == 2 else 0.8, 1.1, 0.1)
# 7. wedding: the creep (soft rustle), BOOM apart, two bottoms on the grass, the snap into a back hug, cheers
E(36.9, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.5, "intensity": 0.5})
E(REPEL, "low_swell", -23, 0.0, {"dur": 0.6, "pitch": 0.6})
E(REPEL + 0.48, "giant_step", -23, -0.4, {"size": 0.4, "surface": "ground"}); E(REPEL + 0.5, "giant_step", -23, 0.4, {"size": 0.4, "surface": "ground"})
E(SNAP - 0.25, "low_swell", -27, 0.0, {"dur": 0.35, "pitch": 1.0}); E(SNAP, "giant_step", -21, -0.2, {"size": 0.45, "surface": "ground"}); E(SNAP + 0.02, "plush_squeak", -25, -0.2, {"pitch": 0.7})
# 8. Paris: the near tourists clang onto the leg, then a rain of little clangs as the tower fills up
for i, t in enumerate(PARIS_RIGS): clang(t, -23, 0.9, 1.0 + 0.04 * (i % 4), ((i % 5) - 2) * 0.2)
import random
rr = random.Random(18)
t = 44.2
while t < 46.6:
    clang(t, -30 - rr.random() * 4, 0.5 + rr.random() * 0.3, 1.2 + rr.random() * 0.6, (rr.random() - 0.5) * 0.8); t += 0.07 + rr.random() * 0.09
# 9. compass + hikers: the needle swings (a soft tick + boop), grass steps, the CLONK
E(47.8, "lamp_switch_click", -30, 0.0); E(NEEDLE, "plush_squeak", -25, 0.0, {"pitch": 1.1})
steps(49.0, CLONK - 0.35, -31, 3.0, -0.3, 0.3)
clang(CLONK, -18, 1.4, 0.85); E(CLONK + 0.02, "giant_step", -23, 0.0, {"size": 0.5, "surface": "ground"})
# 10. wooden world: wooden cars clatter by, the wooden bus, two POOFs (steel → wood)
E(53.2, "car_pass", -27, 0.5, {"dur": 1.6, "size": 0.9}, room=-18); E(55.8, "car_pass", -25, 0.4, {"dur": 2.0, "size": 1.5}, room=-18)
for t in (53.1, 53.25, 53.4, 55.6, 55.75, 55.9, 56.05): E(t, "giant_step", -31, 0.3, {"size": 0.22, "surface": "wood"}, room=-18)
for t in POOF: E(t - 0.05, "low_swell", -27, 0.0, {"dur": 0.4, "pitch": 1.1}); E(t, "plush_squeak", -24, -0.2, {"pitch": 0.6}); E(t + 0.04, "wood_snap", -31, -0.2, {"dur": 0.4, "size": 0.3})
steps(52.4, 57.8, -33, 2.0, -0.2, 0.2)
# 11. the hug: footsteps up the walk, the soft snap together, the dog, then just the warm piano + crickets at dusk
steps(57.8, HUG - 0.25, -31, 2.2, 0.2, -0.1); steps(57.9, HUG - 0.25, -33, 2.6, -0.3, -0.1)
E(HUG, "giant_step", -24, 0.0, {"size": 0.35, "surface": "ground"}); E(HUG + 0.03, "plush_squeak", -26, 0.0, {"pitch": 0.7}); E(HUG + 0.1, "blanket_rustle", -29, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5})
steps(60.5, 61.8, -34, 3.0, 0.4, 0.0)

cues = {
    "title": "018 - What if every human became magnetic? (montage: magnetic heist — strings drive + mallet + taiko, foley-led clangs)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.4, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0, "strings_db": 7.0, "mallet_db": -3.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet_melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events; market impacts", [round(t, 2) for t in TK])
