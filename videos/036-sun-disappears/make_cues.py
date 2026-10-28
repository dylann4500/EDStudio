#!/usr/bin/env python3
"""Cue sheet for 036 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/036-sun-disappears/make_cues.py

Sound identity: "LAST LIGHT" — a sunny, slightly too-cheerful G-major MALLET ostinato at 112 bpm for the 8 min 19 s of borrowed
daylight (G–D–Em–C) over a soft taiko/tom pulse that never stops (cut4, TRIBE steer: constant energy). SECOND 0 = a low swell + a
soft boom. LIGHTS OUT = boom + braam, then E minor with a driving taiko pulse + strings through the dark half. Foley carries every
beat: splashes, the kick + roar, swing chains + seesaw knocks, shutter clicks, floodlight CLUNKS + the crowd roar, a sub hit as
Earth leaves orbit, cart rattles, dryer thumps, the ice crack, the catch. Soft air swishes on the quick cuts, deeper whooshes
into each day of the ladder (low-passed, no bright whooshes). Iceland lifts to C → G under the stars and the end card.
Times mirror shots.js (cut4)."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, "story.json")))
D = story["duration"]
SW, OUT = story["sw"], story["out"]
# mirror shots.js constants (cut4)
GOAL, MOON_OUT, JUP = 10.25, 32.0 + 1.28, 35.0
J = OUT - 0.35
TOSS, PETALS, WFLASH, FLOOD = [5.3, 8.6], 19.5, 22.5, [29.05, 29.4, 29.75]
CATCH, CRACK, END_IN = 42.35, 41.45, 47.8
B = [0, 3.2, 4.7, 6.4, 8.0, 9.6, 11.2, 12.8, 14.6, 16.1, 17.5, 19.0, 20.7, 23.0, 26.2, 28.8, 30.4, 32.0, 34.0, 35.6, 37.0, 38.9, 41.2, 43.1, 45.2, D]
BEAT = 60 / 112
S8 = BEAT / 2

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, OUT, ["G", "D", "Em", "C"])                                    # borrowed daylight
run(OUT, 37.0, ["Em", "C", "Am", "B"], step=2 * BEAT)                  # lights out: cold but still driving
run(37.0, 43.1, ["Em", "C", "Am", "B"], step=2 * BEAT)                 # the days ladder
run(43.1, D - 0.3, ["C", "G", "Am", "D", "C", "G", "G"], step=1.6)      # Iceland → the stars

sections = [
    {"t0": SW + 0.3, "t1": 9.6, "style": "ostinato", "vel": [[SW, 0.2], [9.6, 0.26]], "step": S8, "pattern": [0, 2, 1, 4, 2, 1], "bass_every": 4, "bass_vel": 0.6, "len": 1.0},
    {"t0": 9.6, "t1": OUT, "style": "ostinato", "vel": [[9.6, 0.27], [OUT, 0.32]], "step": S8, "pattern": [0, 1, 2, 4, 3, 2], "bass_every": 2, "bass_vel": 0.65, "len": 0.9},
    {"t0": OUT, "t1": 43.1, "style": "arp", "vel": [[OUT, 0.24], [43.1, 0.28]], "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": 43.1, "t1": D, "style": "arp", "vel": [[43.1, 0.27], [D, 0.26]], "step": 0.36, "pattern": [0, 1, 2, 3, 2, 1]},
]
strings = [
    {"t0": 9.6, "t1": OUT, "style": "strings", "vel": [[9.6, 0.14], [OUT, 0.32]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": OUT + 0.4, "t1": 43.1, "style": "strings", "vel": [[OUT, 0.2], [43.1, 0.3]], "step": S8, "pattern": [0, 1, 0, 2, 0, 1, 0, 2], "octave": 1, "sustain": 0.3},
]
drums = [[SW, 0.7, "boom"], [GOAL, 0.55, "taiko"], [OUT, 1.0, "boom"], [OUT, 0.6, "taiko"]]
drums += [[f, 0.5, "taiko"] for f in FLOOD]
drums += [[35.6, 1.0, "boom"], [37.0, 0.5, "taiko"], [38.9, 0.5, "taiko"], [CRACK, 0.55, "taiko"], [43.1, 0.6, "boom"], [END_IN, 0.35, "taiko"]]
drum_patterns = [   # a driving pulse almost the whole way (TRIBE steer: constant energy), soft drums only
    {"t0": 4.7, "t1": 14.6, "step": BEAT, "pattern": [1, 0.45], "vel": [[4.7, 0.12], [14.6, 0.2]], "kind": "taiko"},
    {"t0": 14.6, "t1": 23.0, "step": BEAT / 2, "pattern": [1, 0.35, 0.6, 0.35], "vel": [[14.6, 0.14], [23.0, 0.24]], "kind": "tom"},
    {"t0": 23.0, "t1": OUT - 0.05, "step": BEAT / 4, "pattern": [1, 0.6], "vel": [[23.0, 0.14], [OUT - 0.05, 0.36]], "kind": "tom"},
    {"t0": OUT + 0.8, "t1": 42.9, "step": BEAT / 2, "pattern": [1, 0, 0.5, 0.3], "vel": [[OUT + 0.8, 0.16], [42.9, 0.26]], "kind": "taiko"},
    {"t0": 43.1, "t1": D - 0.6, "step": BEAT, "pattern": [1, 0.4], "vel": [[43.1, 0.15], [D - 0.6, 0.13]], "kind": "taiko"},
]
mallet_melody = []
for s0, top in zip([4.7, 9.6, 14.6, 19.0, 23.0], [86, 88, 91, 93, 95]):
    mallet_melody += [[s0 + 0.06, top, 0.2, 0.3], [s0 + 0.33, top - 3, 0.18, 0.3], [s0 + 0.6, top - 5, 0.18, 0.5]]
mallet_melody += [[MOON_OUT, 83, 0.2, 0.6], [MOON_OUT + 0.4, 79, 0.18, 0.8], [JUP, 76, 0.17, 1.0]]
melody = [[45.6, 79, 0.22], [46.0, 83, 0.23], [46.4, 86, 0.25], [47.6, 83, 0.22], [48.0, 79, 0.21], [48.8, 74, 0.2], [49.9, 79, 0.2], [50.4, 83, 0.19]]
CHORD_PAD = {"G": [55, 59, 62], "D": [50, 54, 57], "Em": [52, 55, 59], "C": [48, 52, 55], "Am": [45, 48, 52], "B": [47, 51, 54]}
pad = [
    {"t0": SW, "t1": SW + 2.0, "notes": [31, 38, 43, 50], "level": 1.1, "attack": 0.15, "release": 0.9, "cutoff": 800, "hp": 30},   # the Sun goes
    {"t0": SW + 0.4, "t1": OUT + 0.05, "notes": [43, 50, 55], "level": 0.55, "attack": 1.2, "release": 0.4, "cutoff": 700, "hp": 40},
    {"t0": OUT, "t1": OUT + 2.4, "notes": [28, 35, 40, 47, 52], "level": 1.4, "attack": 0.04, "release": 1.0, "cutoff": 900, "hp": 28},   # lights out
    {"t0": OUT + 0.2, "t1": 43.15, "notes": [28, 40, 47, 52], "level": 0.85, "attack": 0.6, "release": 0.5, "cutoff": 650, "hp": 28},
    {"t0": 35.6, "t1": 37.6, "notes": [24, 31, 36, 43], "level": 1.3, "attack": 0.03, "release": 0.9, "cutoff": 700, "hp": 22},    # Earth leaves: sub hit
    {"t0": 43.1, "t1": D - 0.3, "notes": [36, 43, 48, 55], "level": 0.85, "attack": 0.7, "release": 1.2, "cutoff": 850, "hp": 30},
    {"t0": 47.0, "t1": D - 0.3, "notes": [43, 50, 55, 59], "level": 0.9, "attack": 0.8, "release": 1.2, "cutoff": 1000, "hp": 60},   # a warm bed under the end card
]
for i, (ct, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.55, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

def bed(sound, t0, t1, gain, args=None, seed=1, fi=0.05, fo=0.06):
    d = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": gain, "seed": seed}
    if args: d["args"] = args
    return d
amb = [
    bed("city_day", 0.0, 3.25, -31, {"murmur": 1.0, "traffic": 0.05}, 1, fi=0.4),
    bed("surf", 0.0, 3.25, -42, {"size": 0.25}, 1, fi=0.4),
    bed("room_tone", 3.2, 4.75, -46, None, 1),
    bed("city_day", 4.7, 9.65, -30, {"murmur": 1.0, "traffic": 0.05}, 2),
    bed("surf", 4.7, 9.65, -40, {"size": 0.3}, 2),
    bed("crowd_cheer", 9.6, GOAL, -33, None, 1),
    bed("crowd_cheer", GOAL - 0.05, 14.65, -22, {"excite": 1.4}, 2, fi=0.1),
    bed("city_day", 14.6, 19.05, -29, {"murmur": 1.2, "traffic": 0.15}, 6),          # a busy playground
    bed("applause", 15.0, 19.05, -40, None, 3, fi=0.4),
    bed("city_day", 19.0, 23.05, -34, {"murmur": 0.9, "traffic": 0.0}, 3),
    bed("applause", 20.6, 23.05, -31, None, 1, fi=0.3),
    bed("city_day", 23.0, OUT + 0.2, -30, {"murmur": 1.0, "traffic": 0.05}, 4, fo=0.2),
    bed("surf", 23.0, 26.25, -40, {"size": 0.3}, 3),
    bed("city_day", 26.2, 28.85, -40, {"murmur": 0.8, "traffic": 0.0}, 5, fi=0.3),
    bed("wind", 26.2, 28.85, -44, {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}, 1),
    bed("crowd_cheer", 28.8, FLOOD[0], -36, {"excite": 0.5}, 3),                       # a dark stadium murmurs
    bed("crowd_cheer", FLOOD[0], 32.05, -21, {"excite": 1.5}, 4, fi=0.2),               # ... and roars as the lights bang on
    bed("traffic_flow", 32.0, 35.65, -38, None, 1),
    bed("city_day", 34.0, 35.65, -38, {"murmur": 1.0, "traffic": 0.0}, 7),
    bed("room_tone", 35.6, 37.05, -44, None, 2),
    bed("city_day", 37.0, 38.95, -28, {"murmur": 1.4, "traffic": 0.0}, 8),             # supermarket rush: a loud crowd
    bed("crowd_cheer", 37.0, 38.95, -27, {"excite": 0.8}, 5),
    bed("lamp_hum", 37.0, 38.95, -46, None, 1),
    bed("fan", 38.9, 41.25, -38, None, 1),                                              # a wall of dryers + a packed room chattering
    bed("crowd_cheer", 38.9, 41.25, -28, {"excite": 0.6}, 6),
    bed("wind", 41.2, 43.15, -33, {"darkness": 0.5, "gust": 0.7, "whistle": 0.08}, 5),
    bed("crowd_cheer", 41.2, CATCH, -34, {"excite": 0.5}, 7),                           # people out on the ice ...
    bed("crowd_cheer", CATCH - 0.05, 43.15, -26, {"excite": 1.2}, 8, fi=0.1),           # ... cheer the catch
    bed("crowd_cheer", 43.1, D, -28, {"excite": 0.7}, 9, fi=0.1, fo=1.2),                # the lagoon: chatter, laughter, then "ooh" at the stars
    bed("water_rush", 43.1, D, -38, None, 1, fi=0.3, fo=1.2),
    bed("applause", END_IN - 0.3, D, -32, None, 4, fi=0.6, fo=1.2),
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
# soft air swishes on the quick cuts inside a place; a deeper whoosh into each new day of the ladder
for c in [6.4, 8.0, 11.2, 12.8, 16.1, 17.5, 20.7, 30.4, 34.0]:
    e(c - 0.05, "flash_swish", -34, 0.15 if int(c * 10) % 2 else -0.15, {"dur": 0.22})
for c in [37.0, 38.9, 41.2, 43.1]:
    e(c, "whoosh_timeskip", -28, 0.0)
for tt, sz, pn in ((0.9, 0.5, -0.3), (2.2, 0.4, 0.25)):
    e(tt, "water_splash", -28, pn, {"size": sz})
# SECOND 0
e(SW, "low_swell", -18, 0.0, {"dur": 2.0, "pitch": 0.55}, hall=-12)
e(SW, "distant_boom", -22, 0.0, {"size": 1.2})
# the pool: tosses (up + landing), splashes, the beach ball
for a in TOSS:
    e(a - 0.05, "water_splash", -30, 0.1, {"size": 0.4}); e(a + 0.7, "water_splash", -20, 0.1, {"size": 1.0})
for tt in (6.7, 7.5):
    e(tt, "water_splash", -28, -0.2, {"size": 0.4})
for k in range(7):
    e(4.7 + 1.25 * k + 0.62, "bonk", -32, (-1) ** k * 0.3)
# the goal
e(GOAL - 0.6, "kick", -20, -0.3)
e(GOAL, "blanket_rustle", -22, 0.0, {"dur": 0.35, "softness": 0.4, "intensity": 0.9, "strokes": 2})
e(GOAL, "distant_boom", -26, 0.0, {"size": 0.6})
e(13.95, "blanket_rustle", -28, 0.2, {"dur": 0.5, "softness": 0.5, "intensity": 0.8, "strokes": 3})   # the knee slide
# playground: swing chains creak at the ends of each swing, the seesaw knocks, kids' feet
for k in range(6):
    e(14.75 + 1.31 * k, "metal_groan", -40, 0.3, {"pitch": 3.2, "dur": 0.35})
for k in range(5):
    e(14.9 + 1.75 * k, "knock", -32, -0.3, {"pitch": 0.6})
t = 14.7
while t < 18.9:
    e(t, "footstep", -38, -0.1, {"weight": 0.15, "scuff": 0.4}); t += 0.21
# the wedding
e(PETALS, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5, "strokes": 4})
e(WFLASH, "lamp_switch_click", -28, 0.2); e(WFLASH, "flash_swish", -32, 0.2)
# the dive + LIGHTS OUT
t = J - 1.5
while t < J - 0.05:
    e(t, "footstep", -32, -0.2, {"weight": 0.25, "scuff": 0.3}); t += 0.22
e(J, "wood_snap", -34, -0.2)
e(OUT, "distant_boom", -12, 0.0, {"size": 1.6})
e(OUT, "pressure_drop", -16, 0.0, {"dur": 2.0}, hall=-14)
e(OUT + 0.49, "water_splash", -16, -0.1, {"size": 1.2})
for tt in (26.5, 27.4, 28.3):
    e(tt, "lamp_switch_click", -28, 0.15); e(tt, "flash_swish", -36, 0.15)
# the floodlights: a heavy contactor CLUNK + a low clang per bank
for k, f in enumerate(FLOOD):
    e(f, "clunk", -16, (-0.4, 0.0, 0.4)[k], {"size": 1.4, "metal": 0.7}); e(f + 0.02, "metal_clang", -26, (-0.4, 0.0, 0.4)[k], {"size": 1.6, "pitch": 0.7})
# Bangkok: the Moon goes dark, Jupiter
e(MOON_OUT, "low_swell", -22, 0.0, {"dur": 1.5, "pitch": 0.8})
e(JUP, "low_swell", -26, 0.0, {"dur": 1.2, "pitch": 0.7})
# Earth leaves orbit: the big sub hit
e(35.6, "distant_boom", -12, 0.0, {"size": 2.0})
e(35.6, "low_swell", -16, 0.0, {"dur": 1.6, "pitch": 0.45}, hall=-12)
# supermarket: carts rattling at the lens, things dropping into carts, running feet
for k in range(5):
    e(37.15 + 0.36 * k, "candy_rattle", -34, (-1) ** k * 0.25)
for k in range(4):
    e(37.3 + 0.4 * k, "bonk", -36, (-1) ** k * 0.4)
t = 37.05
while t < 38.85:
    e(t, "footstep", -36, 0.1, {"weight": 0.3, "scuff": 0.3}); t += 0.19
# laundromat: dryer drums thumping in rhythm
for k in range(8):
    e(39.0 + 0.29 * k, "knock", -36, (-1) ** k * 0.3, {"pitch": 0.45})
# the ice: the crack races across, the catch
e(CRACK, "wood_snap", -20, 0.2); e(CRACK + 0.04, "metal_groan", -28, 0.2, {"pitch": 2.4, "dur": 0.6}); e(CRACK, "distant_boom", -22, 0.0, {"size": 0.7})
e(CRACK + 0.1, "crumble", -32, 0.1, {"dur": 0.9, "size": 0.5})
e(CATCH + 0.05, "water_splash", -22, 0.15, {"size": 0.45})
e(CATCH + 0.6, "fish_blub", -32, 0.15)
# Iceland: water moves, the dunk, the shooting stars
for tt in (43.4, 44.0, 44.8):
    e(tt, "water_splash", -32, 0.2, {"size": 0.3})
for tt in (46.6, 48.6, 50.2):
    e(tt, "low_swell", -30, 0.0, {"dur": 1.0, "pitch": 1.4})

cues = {
    "title": "036 - What if the Sun disappeared? (science: G-major mallet ostinato 112 bpm -> E-minor cold ladder -> C/G stars)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.5, D],
    "stem_gain_db": {"music": -3.0, "sfx": 7.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "mallet_db": -2.0, "drums_db": -5.5,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D, "start": SW,
              "chords": chords, "sections": sections, "layers": strings, "melody": melody, "mallet_melody": mallet_melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": OUT, "midi": 28, "vel": 0.45, "hold": 2.2}, {"t": 35.6, "midi": 24, "vel": 0.5, "hold": 1.6}],
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
