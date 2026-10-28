#!/usr/bin/env python3
"""Cue sheet for 036 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/036-sun-disappears/make_cues.py

Sound identity: "LAST LIGHT" — a sunny, slightly too-cheerful G-major MALLET ostinato over soft piano at 112 bpm for the 8 min 19 s
of borrowed daylight (017 D-minor pluck 96, 027 E-minor pluck 100, 028 F#m bells 108, 029 Eb bells 90), progression
G–D–Em–C. A quiet open: a busy pool (murmur, splashes). SECOND 0 (the Sun vanishing) = a low swell + soft braam and the music
enters. Low strings creep in under the stadium and climb through the wedding; soft taiko + a tom riser into 0:00. LIGHTS OUT =
a boom + a braam, the crowd hush, and the score turns cold: E minor (relative minor), sparse piano arp + low strings + sub pad
through the days ladder (Em–C–Am–B), soft taiko on +1 DAY / +1 WEEK. Iceland lifts to C → G (warm piano arp) and the stars end
on G. The music never drops out once it starts. Times match shots.js SHOTS + story.json."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, "story.json")))
D = story["duration"]
SW, OUT = story["sw"], story["out"]
GOAL, MOON_OUT, JUP = 12.05, 30.28, 33.0
B = [0, 3.4, 6.3, 11.4, 16.6, 21.4, 24.4, 29.0, 31.3, 34.0, 37.0, 41.6, 46.2, 50.8, 55.6, D]
BEAT = 60 / 112
S8 = BEAT / 2
END = story["finalFade"][0]

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, OUT, ["G", "D", "Em", "C"])                                    # borrowed daylight
run(OUT, 34.0, ["Em", "C"], step=4 * BEAT)                             # lights out: cold, slow
run(34.0, 50.8, ["Em", "C", "Am", "B"], step=2 * BEAT)                 # the days ladder
run(50.8, D - 0.3, ["C", "G", "Am", "D", "C", "G", "G"], step=1.6)      # Iceland → the stars

sections = [
    {"t0": SW + 0.5, "t1": 16.6, "style": "ostinato", "vel": [[SW, 0.18], [16.6, 0.25]], "step": S8, "pattern": [0, 2, 1, 4, 2, 1], "bass_every": 4, "bass_vel": 0.6, "len": 1.0},
    {"t0": 16.6, "t1": OUT, "style": "ostinato", "vel": [[16.6, 0.25], [OUT, 0.3]], "step": S8, "pattern": [0, 1, 2, 4, 3, 2], "bass_every": 2, "bass_vel": 0.65, "len": 0.9},
    {"t0": OUT, "t1": 34.0, "style": "arp", "vel": [[OUT, 0.2], [34.0, 0.18]], "step": BEAT, "pattern": [0, 2, 1, 3]},
    {"t0": 34.0, "t1": 50.8, "style": "arp", "vel": [[34.0, 0.2], [50.8, 0.25]], "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": 50.8, "t1": D, "style": "arp", "vel": [[50.8, 0.24], [D, 0.2]], "step": 0.36, "pattern": [0, 1, 2, 3, 2, 1]},
]
strings = [
    {"t0": 11.4, "t1": OUT, "style": "strings", "vel": [[11.4, 0.1], [OUT, 0.3]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 37.0, "t1": 50.8, "style": "strings", "vel": [[37.0, 0.16], [50.8, 0.27]], "step": S8, "pattern": [0, 1, 0, 2, 0, 1, 0, 2], "octave": 1, "sustain": 0.3},
]
drums = [[SW, 0.7, "boom"], [GOAL, 0.45, "taiko"], [16.6, 0.35, "taiko"], [OUT, 1.0, "boom"], [OUT, 0.6, "taiko"],
         [34.0, 0.6, "boom"], [37.0, 0.45, "taiko"], [41.6, 0.5, "taiko"], [46.2, 0.5, "taiko"], [50.8, 0.55, "boom"], [60.8, 0.3, "taiko"]]
drum_patterns = [
    {"t0": 16.6, "t1": 21.4, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[16.6, 0.12], [21.4, 0.22]], "kind": "taiko"},
    {"t0": 21.4, "t1": OUT - 0.05, "step": BEAT / 2, "pattern": [1, 0.6], "vel": [[21.4, 0.12], [OUT - 0.05, 0.34]], "kind": "tom"},
    {"t0": 37.2, "t1": 50.6, "step": BEAT * 2, "pattern": [1, 0, 0.55, 0], "vel": [[37.2, 0.16], [50.6, 0.26]], "kind": "taiko"},
]
# a bright 3-note mallet "ping" as each daylight place appears; a falling figure for the Moon + Jupiter; a warm hook for the stars
mallet_melody = []
for s0, top in zip([6.3, 11.4, 16.6, 21.4], [86, 88, 91, 93]):
    mallet_melody += [[s0 + 0.06, top, 0.2, 0.3], [s0 + 0.33, top - 3, 0.18, 0.3], [s0 + 0.6, top - 5, 0.18, 0.5]]
mallet_melody += [[MOON_OUT, 83, 0.2, 0.6], [MOON_OUT + 0.4, 79, 0.18, 0.8], [JUP, 76, 0.17, 1.0]]
melody = [[56.3, 79, 0.22], [56.7, 83, 0.23], [57.1, 86, 0.25], [58.4, 83, 0.22], [58.8, 79, 0.21], [59.6, 74, 0.2]]
CHORD_PAD = {"G": [55, 59, 62], "D": [50, 54, 57], "Em": [52, 55, 59], "C": [48, 52, 55], "Am": [45, 48, 52], "B": [47, 51, 54]}
pad = [
    {"t0": SW, "t1": SW + 2.4, "notes": [31, 38, 43, 50], "level": 1.1, "attack": 0.2, "release": 0.9, "cutoff": 800, "hp": 30},   # the Sun goes
    {"t0": SW + 0.4, "t1": OUT + 0.05, "notes": [43, 50, 55], "level": 0.55, "attack": 1.2, "release": 0.4, "cutoff": 700, "hp": 40},
    {"t0": OUT, "t1": OUT + 2.6, "notes": [28, 35, 40, 47, 52], "level": 1.4, "attack": 0.04, "release": 1.0, "cutoff": 900, "hp": 28},   # lights out
    {"t0": OUT + 0.2, "t1": 50.85, "notes": [28, 40, 47, 52], "level": 0.9, "attack": 0.6, "release": 0.5, "cutoff": 650, "hp": 28},
    {"t0": 34.0, "t1": 36.6, "notes": [28, 35, 40, 47], "level": 1.0, "attack": 0.1, "release": 0.8, "cutoff": 800, "hp": 28},    # Earth leaves
    {"t0": 50.8, "t1": D - 0.3, "notes": [36, 43, 48, 55], "level": 0.85, "attack": 0.7, "release": 1.2, "cutoff": 850, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.55, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

def bed(sound, t0, t1, gain, args=None, seed=1, fi=0.05, fo=0.06):
    d = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": gain, "seed": seed}
    if args: d["args"] = args
    return d
amb = [
    # Phoenix pool (quiet open): a murmuring crowd, small water
    bed("city_day", 0.0, 3.45, -33, {"murmur": 1.0, "traffic": 0.05}, 1, fi=0.4),
    bed("surf", 0.0, 3.45, -44, {"size": 0.2}, 1, fi=0.4),
    bed("room_tone", 3.4, 6.35, -46, None, 1),                         # space: almost nothing
    bed("city_day", 6.3, 11.45, -32, {"murmur": 1.0, "traffic": 0.05}, 2),
    bed("surf", 6.3, 11.45, -42, {"size": 0.25}, 2),
    # London: the crowd, then the goal roar
    bed("crowd_cheer", 11.4, GOAL, -36, None, 1),
    bed("crowd_cheer", GOAL - 0.05, 16.65, -25, None, 2, fi=0.15),
    # Tuscany: a garden party, applause at the kiss
    bed("city_day", 16.6, 21.45, -36, {"murmur": 0.8, "traffic": 0.0}, 3),
    bed("applause", 19.0, 21.45, -34, None, 1, fi=0.3),
    # the dive: the pool crowd, hushed by the blackout
    bed("city_day", 21.4, OUT + 0.25, -31, {"murmur": 1.0, "traffic": 0.05}, 4, fo=0.25),
    bed("surf", 21.4, 24.45, -42, {"size": 0.25}, 3),
    # the dark wedding: a hushed murmur + a little wind
    bed("city_day", 24.4, 29.05, -44, {"murmur": 0.6, "traffic": 0.0}, 5, fi=0.4),
    bed("wind", 24.4, 29.05, -46, {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}, 1),
    # Bangkok rooftop: the city far below
    bed("traffic_flow", 29.0, 34.05, -40, None, 1),
    bed("wind", 29.0, 34.05, -44, {"darkness": 0.7, "gust": 0.3, "whistle": 0.02}, 2),
    bed("room_tone", 34.0, 37.05, -46, None, 2),                       # space
    # +1 DAY: cold wind + a fire drum
    bed("wind", 37.0, 41.65, -36, {"darkness": 0.6, "gust": 0.5, "whistle": 0.04}, 3),
    bed("dry_leaves", 37.0, 41.65, -40, {"density": 0.7}, 1),
    # +1 WEEK: Chicago corner, fire barrels, a heater hum, far traffic
    bed("wind", 41.6, 46.25, -34, {"darkness": 0.55, "gust": 0.7, "whistle": 0.06}, 4),
    bed("dry_leaves", 41.6, 46.25, -39, {"density": 0.9}, 2),
    bed("fan", 41.6, 46.25, -48, None, 1),
    bed("traffic_flow", 41.6, 46.25, -48, None, 2),
    # +1 MONTH: the frozen harbor
    bed("wind", 46.2, 50.85, -33, {"darkness": 0.5, "gust": 0.6, "whistle": 0.08}, 5),
    # Iceland: hot water trickling, soft wind
    bed("water_rush", 50.8, D, -40, None, 1, fi=0.3, fo=1.2),
    bed("wind", 50.8, D, -44, {"darkness": 0.6, "gust": 0.3, "whistle": 0.03}, 6, fo=1.2),
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
for tt, sz, pn in ((0.9, 0.5, -0.3), (2.2, 0.4, 0.25)):
    e(tt, "water_splash", -30, pn, {"size": sz})
# SECOND 0: the Sun goes (soft, deep — no whoosh)
e(SW, "low_swell", -20, 0.0, {"dur": 2.2, "pitch": 0.55}, hall=-12)
# the pool: splashes, the dad's two tosses + landings, the beach ball
for tt, sz in ((6.9, 0.4), (8.4, 0.4), (8.3, 0.9), (10.4, 0.9)):
    e(tt, "water_splash", -24 if sz > 0.5 else -30, 0.1, {"size": sz})
for k in range(4):
    e(6.3 + 1.25 * k + 0.62, "bonk", -36, (-1) ** k * 0.3)
# the goal
e(11.48, "kick", -24, -0.3)
e(GOAL, "blanket_rustle", -26, 0.0, {"dur": 0.35, "softness": 0.4, "intensity": 0.9, "strokes": 2})   # ball in the net
# the wedding: petals, the shutter, applause
e(18.1, "blanket_rustle", -34, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5, "strokes": 4})
e(20.45, "lamp_switch_click", -30, 0.2)
# the dive: running steps on the board, the jump, the splash in the dark
t = 21.95
while t < 23.4:
    e(t, "footstep", -34, -0.2, {"weight": 0.25, "scuff": 0.3}); t += 0.24
e(23.45, "wood_snap", -38, -0.2)
e(24.29, "water_splash", -18, -0.1, {"size": 1.1})
# LIGHTS OUT
e(OUT, "distant_boom", -14, 0.0, {"size": 1.5})
e(OUT, "pressure_drop", -18, 0.0, {"dur": 2.2}, hall=-14)
# the dark wedding: shutter clicks with the flashes
for tt in (25.0, 26.9, 28.3):
    e(tt, "lamp_switch_click", -30, 0.15)
# the Moon goes dark; Jupiter
e(MOON_OUT, "low_swell", -26, 0.0, {"dur": 1.6, "pitch": 0.8})
# Earth leaves
e(34.0, "low_swell", -20, 0.0, {"dur": 2.6, "pitch": 0.5}, hall=-12)
# the cold beats: fire pops
for tt in (38.1, 39.7, 40.9, 42.4, 43.9, 45.2):
    e(tt, "wood_snap", -38, 0.2 * ((tt * 10) % 3 - 1))
# the harbor: ice creaks, the catch
for tt in (46.8, 48.0):
    e(tt, "metal_groan", -40, -0.3, {"pitch": 2.6, "dur": 0.7})
e(48.75, "water_splash", -26, 0.15, {"size": 0.35})
e(49.4, "fish_blub", -34, 0.15)
# Iceland: little water moves
for tt in (51.6, 53.2, 54.7, 57.0):
    e(tt, "water_splash", -38, 0.2, {"size": 0.25})

cues = {
    "title": "036 - What if the Sun disappeared? (science: G-major mallet ostinato 112 bpm -> E-minor cold ladder -> C/G stars)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.5, D],
    "stem_gain_db": {"music": -3.0, "sfx": 6.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "mallet_db": -2.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D, "start": SW,
              "chords": chords, "sections": sections, "layers": strings, "melody": melody, "mallet_melody": mallet_melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": OUT, "midi": 28, "vel": 0.45, "hold": 2.2}],
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
