#!/usr/bin/env python3
"""Cue sheet for 022 (funny doubling-POV, unhinged): "What if your ballsack doubled in size every minute?" -> cues.json
Run: python3 -I videos/022-ballsack-doubling/make_cues.py

Sound identity (new — not 018's E-minor heist, 019's piano house, 016's gossip jazz or 010's kaiju march):
  an ESCALATION FANFARE — 120 bpm spiccato strings driving 8ths, soft taiko on 1 + 3, and the piece KEEPS MODULATING UP a
  whole step every time the story moves to a bigger place (D minor → E minor → F# minor → G# minor → A major in space), the
  cheesy "truck-driver key change" as the joke. Every doubling = a rising root–fifth–octave pickup on the piano (a tiny
  "Zarathustra") landing on a soft BOOM. Space opens into a wide A-major pad; the sit-down is a warm, slow piano arp.
  - 0–5.5 s: quiet elevator only (room tone, cable hum, a sip, a creak). The music ENTERS at 5.5 with a braam + boom.
  - foley carries the slapstick: the censor pops (soft low boops), the doctor's thud, a sheet flutter, hangers + a rack crash,
    a wheelbarrow crunch, a truck bursting, a crane groan + a far boom, shutter clicks + chairs, hammer knocks + a gust,
    analysts' keyboards, one slurp of coffee at the end. Steady mix, the music never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 63.5
M1 = 5.5
BEAT = 0.5
S8 = BEAT / 2
# shot starts (mirror shots.js SHOTS)
SCENES = [0, 8.9, 13.05, 14.2, 19.4, 24.4, 29.4, 31.9, 34.6, 38.3, 39.8, 45.0, 47.4, 50.2, 55.4]
# every doubling (mirror shots.js BOOMS)
BOOMS = [5.5, 9.9, 12.4, 14.5, 17.6, 19.7, 22.8, 27.6, 29.7, 32.6, 34.9, 36.5, 38.0, 40.0, 42.6, 45.2, 47.7, 50.4, 51.6, 53.0]
FAINT_LAND, COUGH, M3, M5, TAILOR_HIT, M7, M8 = 10.87, 12.15, 12.4, 17.6, 17.98, 22.8, 27.6
CRANE_FOLD, LAND, TIP = 32.75, 33.3, 38.35
M16, END_MUSIC = 42.6, 55.4

# ---------------------------------------------------------------- music: keys per section
KEYS = [  # (t0, t1, progression, root midi for the pickup)
    (M1, 19.4, ["Dm", "Bb", "Gm", "A"], 62),
    (19.4, 29.4, ["Em", "C", "Am", "B"], 64),
    (29.4, 39.8, ["F#m", "D", "Bm", "C#"], 66),
    (39.8, 45.0, ["G#m", "E", "C#m", "D#"], 68),
    (45.0, END_MUSIC, ["A", "F#m", "D", "E"], 69),
]
chords = []
for t0, t1, prog, _ in KEYS:
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += 4 * BEAT; k += 1
END_CH = [[55.4, "C"], [57.0, "G/B"], [58.6, "Am"], [60.2, "F"], [61.8, "C"]]
chords += END_CH
drive = [0, 0, 1, 0, 2, 0, 1, 0]
sections = [
    {"t0": M1, "t1": 45.0, "style": "strings", "vel": [[M1, 0.42], [7.0, 0.32], [19.4, 0.35], [29.4, 0.38], [39.8, 0.41], [45.0, 0.42]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.35},
    {"t0": 45.0, "t1": END_MUSIC, "style": "strings", "vel": [[45.0, 0.3], [53.0, 0.36], [END_MUSIC, 0.32]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.6, "len": 1.0},
    {"t0": END_MUSIC, "t1": D, "style": "arp", "vel": [[END_MUSIC, 0.52], [59.0, 0.58], [D, 0.5]], "step": S8 * 1.5, "pattern": [0, 1, 2, 3, 2, 1]},
]
TONES = {}
def tones(sym):
    from_root = {"m": [0, 3, 7, 12], "": [0, 4, 7, 12]}
    pc = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
    s = sym.split("/")[0]; minor = s.endswith("m"); r = s[:-1] if minor else s
    base = 60 + pc[r]
    if base > 66: base -= 12
    return [base + i for i in from_root["m" if minor else ""]]
# mallet ostinato over the drive (a nervous little figure)
mallet_melody = []
for i, (t0, sym) in enumerate(chords):
    if t0 >= 45.0: break
    t1 = chords[i + 1][0] if i + 1 < len(chords) else 45.0
    tn = tones(sym); k, t = 0, t0
    while t < t1 - 0.05:
        if k % 8 in (0, 3, 5, 6): mallet_melody.append([round(t, 3), tn[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12, 0.19 if k % 8 == 0 else 0.14, S8 * 0.9])
        t += S8; k += 1
# the doubling pickup: root – fifth – octave landing on the boom (piano, doubled at the octave)
melody = []
def key_root(t):
    for t0, t1, _, r in KEYS:
        if t0 - 0.4 <= t < t1: return r
    return 69
for b in BOOMS:
    r = key_root(b)
    melody += [[round(b - 0.3, 3), r, 0.34, False, 0.14], [round(b - 0.15, 3), r + 7, 0.38, False, 0.14], [round(b, 3), r + 12, 0.46, True, 0.7]]
# the ending: a warm, slow melody over the arp (C major), doubled at the octave
melody += [[55.45, 72, 0.44, True, 1.2], [57.05, 71, 0.42, True, 1.2], [58.65, 72, 0.46, True, 1.0], [59.5, 76, 0.44, True, 0.6], [60.25, 77, 0.46, True, 1.4], [61.85, 76, 0.44, True, 1.6]]
drums = [[b, 0.62 if b not in (M1, 53.0, LAND) else 0.9, "boom"] for b in BOOMS] + [[M1, 0.55, "taiko"], [LAND, 0.95, "boom"], [M8, 0.5, "taiko"], [53.0, 0.6, "taiko"], [END_MUSIC, 0.42, "boom"]]
drum_patterns = [
    {"t0": M1 + 4 * BEAT, "t1": 45.0, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[7.5, 0.24], [29.4, 0.3], [45.0, 0.36]], "kind": "taiko"},
    {"t0": 45.0, "t1": 53.0, "step": BEAT * 2, "pattern": [1, 0.5], "vel": [[45.0, 0.22], [53.0, 0.34]], "kind": "taiko"},
    {"t0": 52.3, "t1": 53.0, "step": 0.1, "pattern": [1], "vel": [[52.3, 0.12], [53.0, 0.45]], "kind": "tom"},   # roll into "bigger than Earth"
]
pad = [{"t0": M1, "t1": M1 + 4 * BEAT + 0.05, "notes": [26, 33, 38, 45, 50], "level": 1.5, "attack": 0.12, "release": 0.8, "cutoff": 900, "hp": 30}]   # braam
DRONES = {62: [26, 38, 45, 50, 57], 64: [28, 40, 47, 52, 59], 66: [30, 42, 49, 54, 61], 68: [32, 44, 51, 56, 63], 69: [33, 45, 52, 57, 64]}
for t0, t1, _, r in KEYS:
    a = max(t0, M1 + 4 * BEAT) if t0 == M1 else t0
    pad.append({"t0": a - 0.05, "t1": t1 + 0.35, "notes": DRONES[r], "level": 0.8 if r != 69 else 0.7, "attack": 0.3, "release": 0.6, "cutoff": 700 if r != 69 else 1100, "hp": 30})
pad.append({"t0": 53.0, "t1": 54.2, "notes": [33, 40, 45, 52, 57], "level": 1.4, "attack": 0.1, "release": 0.8, "cutoff": 1000, "hp": 30})   # braam: bigger than Earth
for i, (c0, sym) in enumerate(END_CH):
    c1 = END_CH[i + 1][0] if i + 1 < len(END_CH) else D - 0.2
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": sym, "level": 2.3, "attack": 0.12, "release": 0.8})

# ---------------------------------------------------------------- ambience (one bed per place)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("room_tone", 0.0, 8.95, -33, fi=0.4), bed("cabin_hum", 0.0, 8.95, -41, fi=0.4, seed=2),
    bed("room_tone", 8.9, 14.25, -36, seed=3), bed("clock", 8.9, 14.25, -52, seed=4),
    bed("room_tone", 14.2, 19.45, -36, seed=5), bed("city_day", 14.2, 19.45, -48, args={"murmur": 0.6, "traffic": 0.2}, seed=6),
    bed("city_day", 19.4, 24.45, -38, args={"murmur": 0.5, "traffic": 0.3}, seed=7), bed("dry_leaves", 19.4, 24.45, -50, args={"density": 0.4}, seed=8),
    bed("city_day", 24.4, 29.45, -36, args={"murmur": 0.8, "traffic": 0.9}, seed=9),
    bed("wind", 29.4, 31.95, -40, args={"darkness": 0.4, "gust": 0.4, "whistle": 0.0}, seed=10), bed("city_day", 29.4, 34.65, -44, args={"murmur": 0.3, "traffic": 0.8}, seed=11),
    bed("room_tone", 34.6, 39.85, -37, seed=12), bed("applause", 34.6, 35.4, -44, fo=0.5, args={"density": 10.0}, seed=13),
    bed("city_day", 39.8, 45.05, -40, args={"murmur": 0.6, "traffic": 0.2}, seed=14), bed("wind", M16 + 0.2, 45.05, -38, fi=0.4, args={"darkness": 0.5, "gust": 0.8, "whistle": 0.0}, seed=15),
    bed("room_tone", 47.4, 50.25, -38, seed=16),
    bed("room_tone", END_MUSIC, D, -44, fi=0.6, fo=1.0, seed=17),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})
def pop(t, g=-24, pitch=0.7, pan=0.0):   # the censor doubling: a soft low boop
    E(t, "plush_squeak", g, pan, {"pitch": pitch}); E(t + 0.06, "plush_squeak", g - 4, pan, {"pitch": pitch * 0.8})

# 1. elevator: a sip, a cable creak, the pop + boom, the DING (a soft two-tone), everyone bolts out
E(2.45, "slurp", -31, 0.0, {"dur": 0.45}); E(4.2, "floorboard_creak", -36, 0.3, {"dur": 0.5})
E(M1 - 0.25, "low_swell", -25, 0.0, {"dur": 0.5, "pitch": 0.6}); pop(M1, -22, 0.75)
E(7.3, "gold_chime", -31, 0.2, {"notes": [76, 72], "spacing": 0.32, "vel": 0.4, "dur": 1.2})
steps(7.45, 8.7, -27, 4.6, -0.4, 0.4); steps(7.55, 8.7, -29, 4.2, 0.4, -0.4)
# 2. doctor: penlight click, the pop, the faint (thud + dust), the walk-in, the cough → BOOM, the sheet flutter, the doorway topple
E(9.2, "lamp_switch_click", -30, 0.2); pop(9.9, -24, 0.8, 0.1)
E(FAINT_LAND - 0.35, "low_swell", -30, 0.3, {"dur": 0.4, "pitch": 1.2}); E(FAINT_LAND, "giant_step", -21, 0.3, {"size": 0.5, "surface": "wood"})
steps(10.75, 11.45, -31, 2.4, 0.4, 0.2)
E(COUGH, "bonk", -30, -0.1, {"dur": 0.25})
E(M3 - 0.2, "low_swell", -26, 0.0, {"dur": 0.35, "pitch": 0.9}); pop(M3, -22, 0.65)
E(M3 + 0.02, "blanket_rustle", -26, 0.0, {"dur": 0.6, "softness": 0.4, "intensity": 0.8})
for i in range(3): E(M3 + 0.35 + 0.08 * i, "giant_step", -28, 0.4, {"size": 0.3, "surface": "wood"})
E(13.15, "plush_squeak", -28, 0.4, {"pitch": 1.2})   # the thumbs-up
# 3. tailor: a sewing machine purr, the pop, tape snap, the second pop, hangers + rack crash
E(14.25, "keyboard_type", -36, 0.5, {"dur": 3.0, "rate": 22.0})
pop(14.5, -23, 0.7); E(16.4, "pen_scribble", -33, 0.3, {"dur": 0.5})
E(M5 - 0.2, "low_swell", -25, 0.0, {"dur": 0.4, "pitch": 0.7}); pop(M5, -21, 0.6)
E(TAILOR_HIT, "metal_clang", -26, 0.4, {"size": 0.6, "pitch": 1.6}); E(TAILOR_HIT + 0.05, "wood_snap", -27, 0.4, {"dur": 0.5, "size": 0.5})
for k in range(5): E(TAILOR_HIT + 0.1 + 0.06 * k, "metal_clang", -32, 0.4, {"size": 0.25, "pitch": 2.4 + 0.1 * k})
E(TAILOR_HIT + 0.2, "blanket_rustle", -28, 0.3, {"dur": 0.7, "softness": 0.5, "intensity": 0.7}); E(17.75, "giant_step", -27, -0.4, {"size": 0.35, "surface": "wood"})
# 4. wheelbarrow: wheel steps, the dog, the pop, the crunch, you sit down hard
steps(19.4, M7, -31, 1.4, -0.3, 0.0)
for t in (20.3, 21.0, 21.7, 22.2): E(t, "dog_bark", -28, 0.35, {"pitch": 1.15})
pop(19.7, -25, 0.75)
E(M7 - 0.2, "low_swell", -24, 0.0, {"dur": 0.4, "pitch": 0.6}); pop(M7, -21, 0.55)
E(M7 + 0.05, "car_crash", -25, 0.1, {"weight": 0.25}); E(M7 + 0.1, "metal_groan", -29, 0.1, {"dur": 0.5, "pitch": 1.8})
E(M7 + 0.42, "giant_step", -24, -0.3, {"size": 0.4, "surface": "ground"}); E(M7 + 0.5, "metal_clang", -31, 0.5, {"size": 0.3, "pitch": 1.4})
# 5. truck: the box groans with each shove, the BURST, panels clatter down, the truck lands on top
for t in (24.95, 26.15, 27.35): E(t, "metal_groan", -29, 0.0, {"dur": 0.6, "pitch": 1.1})
E(M8 - 0.25, "low_swell", -23, 0.0, {"dur": 0.45, "pitch": 0.55}); pop(M8, -20, 0.5)
E(M8 + 0.02, "car_crash", -21, 0.0, {"weight": 0.8}); E(M8 + 0.5, "metal_groan", -27, 0.2, {"dur": 0.8, "pitch": 0.8})
for k in range(3): E(M8 + 1.0 + 0.3 * k, "metal_clang", -27, (k - 1) * 0.4, {"size": 0.9, "pitch": 1.0 + 0.1 * k})
E(28.2, "giant_step", -25, -0.4, {"size": 0.4, "surface": "ground"}); E(28.3, "giant_step", -26, 0.3, {"size": 0.4, "surface": "ground"})
# 6. crane: wind up top, the cable creak at the pop, the fold (long groan), the far landing BOOM + crunch
pop(29.7, -23, 0.6); E(29.75, "metal_groan", -27, 0.0, {"dur": 0.9, "pitch": 0.9})
pop(32.6, -22, 0.5); E(CRANE_FOLD, "metal_groan", -22, -0.2, {"dur": 1.0, "pitch": 0.6})
E(LAND, "distant_boom", -20, 0.0, {"size": 1.2}); E(LAND + 0.03, "car_crash", -25, 0.2, {"weight": 0.7})
steps(LAND + 0.2, 34.6, -30, 5.0, 0.3, 0.5)
# 7. press: shutter clicks (a storm after the boom), the pops, the chairs tip back row by row
t = 34.7
while t < 39.75:
    E(t, "lamp_switch_click", -32 if t < 38.0 else -29, ((int(t * 7) % 5) - 2) * 0.2); t += 1 / (1.6 if t < 38.0 else 6.0)
pop(34.9, -25, 0.8); pop(36.5, -24, 0.7); pop(38.0, -21, 0.55)
for r in range(3): E(TIP + 0.3 + 0.06 * r, "wood_snap", -27, ((r % 3) - 1) * 0.3, {"dur": 0.4, "size": 0.4}); E(TIP + 0.32 + 0.06 * r, "giant_step", -27, 0.0, {"size": 0.3, "surface": "wood"})
# 8. ZIP: hammer knocks, the pop, a proud beat, then the big one: wind gust + letters flutter
t = 39.85
while t < 40.6: E(t + 0.17, "giant_step", -30, 0.35, {"size": 0.16, "surface": "wood"}); t += 0.7
pop(40.0, -24, 0.7)
E(M16 - 0.25, "low_swell", -23, 0.0, {"dur": 0.5, "pitch": 0.5}); pop(M16, -21, 0.5)
E(M16 + 0.3, "blanket_rustle", -27, 0.3, {"dur": 1.2, "softness": 0.3, "intensity": 0.9}); E(M16 + 0.6, "pen_scribble", -33, 0.2, {"dur": 0.6})
# 9. orbit + war room: a low swell, the pop, keyboards, the analysts' gasp (a soft swell)
E(45.0, "low_swell", -28, 0.0, {"dur": 1.2, "pitch": 0.5}); pop(45.2, -23, 0.55)
E(47.45, "keyboard_type", -33, -0.2, {"dur": 2.6, "rate": 13.0}); pop(47.7, -22, 0.6)
# 10. earth: three pops, each lower
pop(50.4, -22, 0.5); pop(51.6, -21, 0.45); E(52.7, "low_swell", -22, 0.0, {"dur": 0.4, "pitch": 0.4}); pop(53.0, -19, 0.4)
# 11. the sit-down: a long exhale (soft rustle), one slurp, a contented chair creak
E(55.5, "blanket_rustle", -32, 0.0, {"dur": 1.0, "softness": 0.8, "intensity": 0.4})
E(56.5, "slurp", -28, 0.0, {"dur": 0.6}); E(58.35, "floorboard_creak", -33, 0.1, {"dur": 0.45})

cues = {
    "title": "022 - What if your ballsack doubled in size every minute? (funny doubling POV: escalation fanfare — strings drive that keeps modulating up, a piano pickup + boom on every doubling)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [62.9, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0, "strings_db": 7.0, "mallet_db": -4.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet_melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(chords), "chords")
