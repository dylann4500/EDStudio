#!/usr/bin/env python3
"""Cue sheet for 037 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/037-oxygen-doubles/make_cues.py

Sound identity: "AIR" — a bright soft-MALLET ostinato in G major at 112 bpm (017 was a D-minor pluck, 027 E-minor pluck, 028
F#m bells, 029 bells), over warm pluck basses. Quiet open: mile 26 of a marathon (crowd + footfalls). SECOND 0 = a big inhale
+ a soft boom + a braam, and the mallets enter (G D Em C): the first minutes feel GREAT. When fire becomes the story (the
cake, 13.4 s) the harmony turns to E minor (Em C G D) with a low string drive, soft taiko from the barbecue on, and a sub
boom under every flame "whoomp". Each place keeps its own scene sound: crackle beds, a far siren (low-passed), hoses, steam.
The time skip (38.8 s) opens into a wonder section (C G Am D, sparser mallet, pad) for rust + giant dragonflies (wing buzz),
and the birthday ending resolves in G (C D G). The music never drops out once it starts. Times match shots.js + story.json."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 62.0
SW = 5.8
B = [0, 3.4, 8.6, 13.4, 18.6, 23.8, 28.8, 33.8, 38.8, 43.8, 49.8, D]   # shot boundaries
BEAT = 60 / 112
END = 57.0                          # final fade starts (end card 57.6)
# event times mirrored from shots.js
T_TAPE, T_BREATH, T_UP, T_FLY = 7.5, 9.7, 11.1, 11.6
T_LIGHT, T_BLOW, T_WHOOMP = 13.7, 16.25, 16.85
T_LID, T_LITE, T_BOOM = 18.95, 19.5, 20.3
T_LEAP, T_DROP, T_OUT, T_BUMP = 25.0, 31.4, 37.2, 42.6
T_SWOOP, T_LAND, T_SCARE = 44.9, 47.2, 48.3
T_WISH, T_BLOW2, T_ROAR, T_EXT = 52.2, 53.4, 53.75, 55.0

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, 13.4, ["G", "D", "Em", "C"])                                   # it feels great
run(13.4, 38.8, ["Em", "C", "G", "D"])                                 # fire becomes the story
run(38.8, 49.8, ["C", "G", "Am", "D"], step=3 * BEAT)                  # the time skip: wonder
run(49.8, D - 0.3, ["G", "C", "Em", "D", "C", "D", "G"], step=1.6)     # the wish + end card

S8 = BEAT / 2
sections = [
    {"t0": SW, "t1": 13.4, "style": "ostinato", "inst": "mallet", "vel": [[SW, 0.26], [13.4, 0.3]], "step": S8, "pattern": [0, 2, 4, 2, 1, 2, 3, 2], "bass_every": 4, "bass_vel": 0.7},
    {"t0": 13.4, "t1": 38.8, "style": "ostinato", "inst": "mallet", "vel": [[13.4, 0.26], [33.8, 0.32], [38.8, 0.28]], "step": S8, "pattern": [0, 1, 2, 4, 2, 1], "bass_every": 2, "bass_vel": 0.85},
    {"t0": 38.8, "t1": 49.8, "style": "ostinato", "inst": "mallet", "vel": [[38.8, 0.22], [49.8, 0.25]], "step": BEAT, "pattern": [0, 2, 4, 5, 4, 2], "bass_every": 3, "bass_vel": 0.6},
    {"t0": 49.8, "t1": D, "style": "ostinato", "inst": "mallet", "vel": [[49.8, 0.24], [D, 0.2]], "step": S8, "pattern": [0, 2, 4, 2], "bass_every": 4, "bass_vel": 0.65},
]
strings = [
    {"t0": 13.4, "t1": 38.8, "style": "strings", "vel": [[13.4, 0.12], [20.3, 0.2], [33.8, 0.26], [38.8, 0.2]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 38.8, "t1": 49.8, "style": "strings", "vel": [[38.8, 0.1], [49.8, 0.12]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.3},
]
drums = [[SW, 0.7, "boom"], [T_TAPE, 0.45, "taiko"], [T_WHOOMP, 0.75, "boom"], [T_BOOM, 0.95, "boom"], [T_BOOM, 0.5, "taiko"],
         [T_LEAP, 0.85, "boom"], [T_DROP + 0.7, 0.6, "boom"], [T_OUT, 0.5, "taiko"], [38.8, 0.45, "boom"], [T_BUMP + 0.3, 0.4, "taiko"],
         [T_ROAR, 0.6, "boom"], [57.6, 0.3, "taiko"]]
drum_patterns = [
    {"t0": 18.6, "t1": 38.6, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[18.6, 0.14], [33.8, 0.26], [38.6, 0.2]], "kind": "taiko"},
    {"t0": 37.9, "t1": 38.75, "step": 0.1, "pattern": [1], "vel": [[37.9, 0.06], [38.75, 0.26]], "kind": "tom"},
]
# a rising 3-note mallet "ping" as each new place appears; a little G-major hook for the wish
melody = []
for s0, top in zip([8.6, 13.4, 18.6, 23.8, 28.8, 33.8], [83, 83, 86, 86, 88, 88]):
    melody += [[s0 + 0.08, top, 0.2], [s0 + 0.35, top - 3, 0.18], [s0 + 0.62, top - 7, 0.18]]
melody += [[50.0, 79, 0.2], [50.3, 83, 0.2], [50.6, 86, 0.22], [55.9, 86, 0.22], [56.2, 83, 0.2], [56.5, 91, 0.24]]
CHORD_PAD = {"G": [55, 59, 62], "D": [50, 54, 57], "Em": [52, 55, 59], "C": [48, 52, 55], "Am": [57, 60, 64]}
pad = [
    {"t0": SW, "t1": SW + 2.4, "notes": [31, 38, 43, 50, 55], "level": 1.2, "attack": 0.15, "release": 0.9, "cutoff": 900, "hp": 30},    # braam: SECOND 0
    {"t0": SW + 0.3, "t1": 13.45, "notes": [31, 43, 50, 55], "level": 0.7, "attack": 0.9, "release": 0.5, "cutoff": 650, "hp": 30},
    {"t0": 13.4, "t1": 38.85, "notes": [28, 40, 47, 52], "level": 0.9, "attack": 0.6, "release": 0.5, "cutoff": 650, "hp": 30},
    {"t0": 38.8, "t1": 38.8 + 2.2, "notes": [36, 43, 48, 55, 60], "level": 1.1, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30},  # the time skip
    {"t0": 39.0, "t1": 49.85, "notes": [36, 43, 48, 52], "level": 0.8, "attack": 0.8, "release": 0.6, "cutoff": 700, "hp": 30},
    {"t0": 49.8, "t1": D - 0.3, "notes": [31, 43, 50, 55], "level": 0.85, "attack": 0.6, "release": 1.0, "cutoff": 800, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.55, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

def bed(sound, t0, t1, gain, args=None, seed=1, fi=0.06, fo=0.08):
    d = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": gain, "seed": seed}
    if args: d["args"] = args
    return d
amb = [
    # the marathon: a crowd behind barriers (quiet open), swelling at SECOND 0 and the tape
    bed("crowd_cheer", 0.0, 5.9, -34, {"excite": 0.5}, 1, fi=0.5),
    bed("crowd_cheer", 5.8, 8.65, -27, {"excite": 1.0}, 2, fi=0.4),
    bed("city_day", 0.0, 8.65, -42, {"murmur": 0.3, "traffic": 0.1}, 1, fi=0.5),
    # the park bench: a breezy morning, leaves, a far street
    bed("wind", 8.6, 13.45, -40, {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, 2),
    bed("dry_leaves", 8.6, 13.45, -44, {"density": 0.6}, 1),
    bed("city_day", 8.6, 13.45, -46, {"murmur": 0.2, "traffic": 0.3}, 3),
    # the kitchen: room tone + a quiet family
    bed("room_tone", 13.4, 18.65, -40, None, 1),
    bed("city_day", 13.4, 18.65, -48, {"murmur": 0.6, "traffic": 0.0}, 4),
    bed("fire", T_WHOOMP, 18.65, -30, {"size": 0.6}, 1, fi=0.05),
    # the backyard: suburb + the grill blaze
    bed("city_day", 18.6, 23.85, -44, {"murmur": 0.2, "traffic": 0.2}, 5),
    bed("fire", T_BOOM, 23.85, -24, {"size": 1.6}, 2, fi=0.05),
    # the campsite: woods wind + the campfire (it leaps at 25.0)
    bed("wind", 23.8, 28.85, -42, {"darkness": 0.5, "gust": 0.3, "whistle": 0.0}, 3),
    bed("fire", 23.8, 28.85, -30, {"size": 0.5}, 3),
    bed("fire", T_LEAP, 28.85, -27, {"size": 1.2}, 4, fi=0.05),
    # the forest: a big blaze, gusts, a far siren, the hose
    bed("fire", 28.8, 33.85, -24, {"size": 2.0}, 5),
    bed("wind", 28.8, 33.85, -36, {"darkness": 0.4, "gust": 0.7, "whistle": 0.02}, 4),
    bed("siren", 28.8, 33.85, -44, {"distance": 2.2}, 1),
    bed("water_rush", 28.8, 33.85, -42, {"intensity": 0.6}, 1),
    # downtown: the cart fire, two hoses, the pumper, a siren passing, the street watching
    bed("fire", 33.8, T_OUT + 0.3, -27, {"size": 1.1}, 6, fo=0.4),
    bed("water_rush", 33.8, 38.85, -33, {"intensity": 1.0}, 2),
    bed("siren", 33.8, 38.85, -40, {"distance": 1.3}, 2),
    bed("city_day", 33.8, 38.85, -40, {"murmur": 0.8, "traffic": 0.3}, 6),
    bed("applause", T_OUT + 0.4, 38.85, -38, {"density": 30.0, "swell": 0.4}, 1, fi=0.3),
    # ten years in five seconds: wind + a far street
    bed("wind", 38.8, 43.85, -38, {"darkness": 0.5, "gust": 0.8, "whistle": 0.0}, 6),
    bed("city_day", 38.8, 43.85, -48, {"murmur": 0.2, "traffic": 0.5}, 7),
    # the playground: kids + big wings
    bed("city_day", 43.8, D, -40, {"murmur": 1.0, "traffic": 0.1}, 8, fo=1.0),
    bed("buzz", 43.8, 49.85, -40, {"rate": 22.0}, 1),
    bed("buzz", T_SWOOP - 0.2, T_SWOOP + 1.2, -30, {"rate": 20.0}, 2, fi=0.5, fo=0.5),
    bed("buzz", 49.8, D - 1.0, -48, {"rate": 22.0}, 3, fo=1.0),
    bed("fire", T_ROAR, T_EXT + 0.2, -32, {"size": 0.6}, 7, fo=0.2),
    bed("applause", T_EXT + 0.6, 57.6, -38, {"density": 20.0, "swell": 0.3}, 2, fi=0.3, fo=0.6),
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
# the marathon: footfalls (tired, then quick), SECOND 0 = a big inhale, the tape
t, k = 0.3, 0
while t < 8.0:
    e(t, "footstep", -36 if t < SW else -32, ((k % 2) * 2 - 1) * 0.2, {"weight": 0.4, "scuff": 0.5}); k += 1
    t += 0.19 if t < SW else 0.15
e(SW - 0.35, "breath", -24, 0.0, {"dur": 0.8, "inhale": True})
e(SW, "low_swell", -20, 0.0, {"dur": 2.4, "pitch": 1.1}, hall=-14)
e(SW, "distant_boom", -18, 0.0, {"size": 1.2})
e(T_TAPE, "pop", -22, 0.0, {"pitch": 0.8})
e(T_TAPE + 0.05, "blanket_rustle", -30, 0.0, {"dur": 1.2, "softness": 0.4, "intensity": 0.9, "strokes": 6})   # confetti
# the bench: a wheeze, the big breath, he stands, the pigeons go
e(8.9, "breath", -30, -0.1, {"dur": 0.5, "inhale": False})
e(T_BREATH, "breath", -20, -0.1, {"dur": 1.0, "inhale": True})
e(T_BREATH + 1.05, "breath", -27, -0.1, {"dur": 0.7, "inhale": False})
e(T_UP + 0.2, "mattress_sit", -32, -0.1, {"dur": 0.6})
for k, tt in enumerate((T_FLY, T_FLY + 0.08, T_FLY + 0.18, T_FLY + 0.3)):
    e(tt, "blanket_rustle", -26 - k, (k - 1.5) * 0.3, {"dur": 0.6, "softness": 0.4, "intensity": 0.9, "strokes": 6})
# the cake: the lighter, each candle flares, the blow, WHOOMP
e(T_LIGHT, "lamp_switch_click", -32, 0.2)
for i in range(7):
    e(T_LIGHT + 0.16 + i * 0.17, "whoomp", -34, 0.1 * (i - 3) / 3, {"size": 0.2})
e(T_BLOW, "breath", -22, 0.0, {"dur": 0.6, "inhale": False})
e(T_WHOOMP, "whoomp", -10, 0.0, {"size": 1.0})
# the grill: the lid, the lighter, FWOOMP, patties land (one on his head)
e(T_LID + 0.3, "clunk", -26, -0.1)
e(T_LITE, "lamp_switch_click", -32, -0.1)
e(T_BOOM, "whoomp", -6, 0.0, {"size": 1.8})
e(T_BOOM, "distant_boom", -18, 0.0, {"size": 1.0})
for tt, snd, g in ((T_BOOM + 0.05 + 0.9, "plip", -26), (T_BOOM + 0.05 + 1.0, "pop", -24), (T_BOOM + 0.05 + 1.15, "bonk", -24)):
    e(tt, snd, g, 0.1)
# the campsite: the leap + three marshmallows catching
e(T_LEAP, "whoomp", -8, 0.0, {"size": 1.5})
for i in range(3):
    e(T_LEAP + 0.15 + i * 0.12, "whoomp", -26, (i - 1) * 0.3, {"size": 0.25})
# the forest: a crown flares, the branch cracks and lands
e(T_DROP - 0.3, "whoomp", -14, -0.2, {"size": 1.3})
e(T_DROP, "wood_snap", -22, -0.2, {"size": 1.2})
e(T_DROP + 0.7, "giant_step", -18, -0.1, {"size": 0.6})
e(T_DROP + 0.72, "crumble", -26, -0.1, {"dur": 1.0})
e(32.0, "hiss", -26, -0.2, {"dur": 1.4})
# downtown: a flare-up, then the knockdown in steam + applause
e(34.6, "whoomp", -14, 0.1, {"size": 0.9})
e(T_OUT, "hiss", -14, 0.0, {"dur": 1.6})
e(T_OUT + 0.05, "low_swell", -26, 0.0, {"dur": 1.4, "pitch": 0.8})
# ten years: rust creaks, the bumper drops
e(40.2, "metal_groan", -34, 0.1, {"dur": 1.2, "pitch": 1.3})
e(41.6, "metal_groan", -32, 0.1, {"dur": 1.2, "pitch": 0.9})
e(T_BUMP + 0.3, "metal_clang", -22, 0.0, {"size": 0.6, "pitch": 0.8})
e(T_BUMP + 0.32, "giant_step", -26, 0.0, {"size": 0.4})
# the dragonflies: kids duck, the crow squawks off
e(T_SWOOP + 0.4, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.5, "intensity": 0.8, "strokes": 4})
e(T_SCARE, "crow_caw", -24, -0.2, {"pitch": 1.0})
e(T_SCARE + 0.05, "blanket_rustle", -26, -0.2, {"dur": 0.6, "softness": 0.4, "intensity": 0.9, "strokes": 6})
# the wish: lighter, a breath held, blow, WHOOMP, extinguisher, the table laughs (applause)
e(50.2, "lamp_switch_click", -32, 0.1)
e(T_WISH - 0.2, "breath", -28, 0.0, {"dur": 0.8, "inhale": True})
e(T_BLOW2, "breath", -22, 0.0, {"dur": 0.5, "inhale": False})
e(T_ROAR, "whoomp", -10, 0.0, {"size": 0.9})
e(T_EXT, "hiss", -12, 0.1, {"dur": 1.3})

cues = {
    "title": "037 - What if the oxygen in the air doubled? (science: G-major mallet ostinato 112 bpm -> E-minor fire drive -> wonder -> G, scene beds)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.5, D],
    "stem_gain_db": {"music": -5.5, "sfx": 6.0, "amb": 10.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": BEAT * 0.75, "feedback": 0.3, "mix": 0.22, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 5.0, "drums_db": -8.0, "mallet_db": -1.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": SW, "midi": 31, "vel": 0.42, "hold": 2.2}, {"t": 38.8, "midi": 36, "vel": 0.4, "hold": 2.0}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
