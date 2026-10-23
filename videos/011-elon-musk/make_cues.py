#!/usr/bin/env python3
"""Cue sheet for 011 (biography: Elon Musk) -> cues.json.   python3 -I videos/011-elon-musk/make_cues.py

Sound identity: BRIGHT, HOPEFUL TECH. Bell/synth arpeggios in D major (instrument "bell" + echo) over a continuous pad as the
main voice; a low strings drive + soft taiko for the rocket years; a hush (held chords) for the near-bankruptcy; swells on the
orbit, the landing and the catch; near-silence in space. Scene beds: rooms hum, jet turbines, wind on the island, rocket
rumble under every launch/landing/catch, crowd cheer on the beach, city on the street, wind on Mars.
Times are written per shot (cam name + local seconds) and resolved against story.json, so the sheet follows the narration.
Music never drops out (house rule) — one pad region spans everything under the arps."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, "story.json")))
SH = {s["cam"]: s for s in story["shots"]}
DUR = story["duration"]
def at(cam, lt=0.0, frac=None):
    s = SH[cam]; L = s["t1"] - s["t0"]
    return round(s["t0"] + (frac * L if frac is not None else lt), 3)
T0 = lambda cam: SH[cam]["t0"]
T1 = lambda cam: SH[cam]["t1"]

c = {"title": "011 - The story of Elon Musk (biography: bright tech)", "duration": DUR, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5,
     "end_fade": [DUR - 1.8, DUR], "stem_gain_db": {"music": -1.0, "sfx": -2.0, "amb": 4.0}, "sfx_lowpass_hz": 5000,
     "shots": sorted({s["t0"] for s in story["shots"]} | {DUR})}

amb = []
def bed(sound, a, b, db, fi=0.3, fo=0.3, **args): amb.append({"sound": sound, "t0": a, "t1": b, "fade_in": fi, "fade_out": fo, "gain_db": db, **({"args": args} if args else {})})
bed("city_day", T0("birth"), T1("birth"), -50, murmur=0.4, traffic=0.2)
bed("room_tone", T0("coding"), T1("blastar"), -45)
bed("turbines", T0("flight"), T1("flight"), -44, rate=0.4)
bed("wind", T0("flight"), T1("flight"), -48, darkness=0.3, gust=0.2, whistle=0.0)
bed("city_day", T0("campus"), T1("campus"), -50, murmur=0.6, traffic=0.1)
bed("room_tone", T0("zip2"), T1("paypal"), -45)
bed("room_tone", T0("spacex"), T1("spacex"), -42)
bed("wind", T0("boom"), T1("boom"), -46, darkness=0.4, gust=0.3, whistle=0.0)
bed("rocket_rumble", at("boom", 0.5), at("boom", 2.85), -34, fi=0.2, fo=0.15, rise=1.0)
bed("room_tone", T0("broke"), T1("broke"), -46)
bed("wind", T0("orbit"), T1("orbit"), -48, darkness=0.5, gust=0.2, whistle=0.0)
bed("rocket_rumble", at("orbit", 0.6), T1("orbit"), -31, fi=0.3, fo=0.4, rise=1.0)
bed("crowd_cheer", at("orbit", 1.8), T1("orbit"), -44, fi=0.4, fo=0.4, excite=0.6)
bed("room_tone", T0("cars"), T1("cars"), -46)
bed("applause", at("cars", frac=0.5), T1("cars"), -42, fi=0.3, fo=0.4, density=30, swell=0.5)
bed("rocket_rumble", T0("landing"), at("landing", frac=0.8), -32, fi=0.4, fo=0.3, rise=0.2)
bed("crowd_cheer", at("landing", frac=0.8), T1("landing"), -44, fi=0.3, fo=0.4, excite=0.8)
bed("city_day", T0("twitter"), T1("xsign"), -44, murmur=0.6, traffic=0.6)
bed("wind", T0("catch"), T1("catch"), -48, darkness=0.3, gust=0.3, whistle=0.0)
bed("rocket_rumble", T0("catch"), at("catch", frac=0.64), -30, fi=0.4, fo=0.3, rise=0.3)
bed("crowd_cheer", at("catch", frac=0.63), T1("catch"), -38, fi=0.15, fo=0.4, excite=1.0)
bed("wind", T0("mars"), DUR, -48, fi=0.5, fo=1.2, darkness=0.6, gust=0.3, whistle=0.0)
c["ambience"] = amb

ev = [
    {"t": at("boom", 2.8), "sound": "distant_boom", "args": {"size": 1.0}, "gain_db": -22, "pan": 0.0, "room": -14},
    {"t": at("landing", frac=0.78), "sound": "low_swell", "args": {"dur": 1.4, "pitch": 0.8}, "gain_db": -30, "pan": 0.0},
    {"t": at("catch", frac=0.62), "sound": "low_swell", "args": {"dur": 1.4, "pitch": 0.7}, "gain_db": -29, "pan": 0.0},
    {"sound": "footsteps", "t0": T0("twitter") + 0.2, "t1": T1("twitter") - 0.2, "pan0": -0.2, "pan1": 0.15, "gain_db": -33, "room": -20},
    {"t": at("xsign", frac=0.45), "sound": "door_close", "args": {"creak": 0.2}, "gain_db": -36, "pan": 0.0, "room": -12},
]
c["events"] = ev

M = {"instrument": "bell", "echo": {"delay": 0.375, "feedback": 0.35, "mix": 0.26, "lp_hz": 3200}, "gain_db": 0.0, "reverb_db": -8.0,
     "pad_db": 0.0, "pad_reverb_db": -4.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.2, "tau": 0.25}, "end": DUR, "ducks": [],
     "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -3.5}], "strings_db": 2.0, "drums_db": -11.0, "mallet_db": -6.0}
chords = []
def bar(a, b, syms):
    st = (b - a) / len(syms)
    for i, s in enumerate(syms): chords.append([round(a + i * st, 3), s])
bar(0.0, T0("birth"), ["D"])
bar(T0("birth"), T1("blastar"), ["D", "G", "Bm", "A", "D", "G"])
bar(T0("flight"), T1("paypal"), ["D", "A", "Bm", "G", "D", "A", "G", "A", "D", "G"])
bar(T0("spacex"), T1("boom"), ["Bm", "G", "D", "A"])
bar(T0("broke"), T1("broke"), ["Bm", "G"])
bar(T0("orbit"), T1("orbit"), ["G", "A", "D"])
bar(T0("cars"), T1("cars"), ["D", "G", "A"])
bar(T0("landing"), T1("landing"), ["Bm", "G", "A", "D"])
bar(T0("roadster"), T1("crew"), ["D", "Bm", "G", "A", "D", "G"])
bar(T0("twitter"), T1("xsign"), ["D", "A", "G", "A"])
bar(T0("catch"), T1("catch"), ["Bm", "G", "A", "D"])
bar(T0("starlink"), T1("starlink"), ["G", "D"])
bar(T0("mars"), DUR, ["G", "A", "D", "D"])
M["chords"] = chords
M["sections"] = [
    {"t0": 0.0, "t1": T0("birth"), "style": "arp", "vel": 0.16, "step": 0.75, "pattern": [0, 2, 1, 3]},
    {"t0": T0("birth"), "t1": T1("blastar"), "style": "arp", "vel": [[T0("birth"), 0.2], [T1("blastar"), 0.24]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": T0("flight"), "t1": T1("paypal"), "style": "arp", "vel": [[T0("flight"), 0.22], [T1("paypal"), 0.28]], "step": 0.25, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": T0("spacex"), "t1": T1("boom"), "style": "strings", "vel": [[T0("spacex"), 0.22], [T1("boom"), 0.32]], "step": 0.125, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
    {"t0": T0("broke"), "t1": T1("broke"), "style": "held", "vel": 0.18, "roll": 0.1},
    {"t0": T0("orbit"), "t1": T1("orbit"), "style": "swell", "vel": [[T0("orbit"), 0.22], [T1("orbit"), 0.32]], "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": T0("cars"), "t1": T1("cars"), "style": "arp", "vel": 0.26, "step": 0.25, "pattern": [0, 2, 1, 3, 2, 1, 3, 2]},
    {"t0": T0("landing"), "t1": T1("landing"), "style": "strings", "vel": [[T0("landing"), 0.2], [at("landing", frac=0.78), 0.34], [T1("landing"), 0.26]], "step": 0.125, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.35},
    {"t0": T0("roadster"), "t1": T1("crew"), "style": "arp", "vel": [[T0("roadster"), 0.18], [T1("crew"), 0.26]], "step": 0.5, "pattern": [0, 2, 1, 3]},
    {"t0": T0("twitter"), "t1": T1("xsign"), "style": "arp", "vel": 0.24, "step": 0.25, "pattern": [0, 1, 2, 1, 3, 1, 2, 1]},
    {"t0": T0("catch"), "t1": T1("catch"), "style": "strings", "vel": [[T0("catch"), 0.24], [at("catch", frac=0.62), 0.38], [T1("catch"), 0.3]], "step": 0.125, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.4},
    {"t0": T0("starlink"), "t1": T1("starlink"), "style": "arp", "vel": 0.22, "step": 0.375, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": T0("mars"), "t1": DUR - 3.0, "style": "swell", "vel": [[T0("mars"), 0.24], [DUR - 3.0, 0.32]], "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": DUR - 3.0, "t1": DUR, "style": "cadence", "vel": 0.26, "roll": 0.14},
]
# a hopeful motif (D major) that returns: childhood, orbit, roadster, the ending
MOTIF = [(0, 74), (1, 78), (2, 81), (3, 79), (4, 78), (5, 76), (6, 74)]
def motif(t0, b, v, octv=False): return [[round(t0 + k * b, 3), m, v] + ([1] if octv else []) for k, m in MOTIF]
mel = []
mel += [[0.15, 74, 0.13, False, 1.2], [0.6, 81, 0.14], [1.8, 78, 0.13], [2.9, 74, 0.13]]
mel += [[at("broke", 1.9), 71, 0.14, False, 1.6], [at("broke", 3.6), 66, 0.13, False, 1.6]]   # keep the hush from going silent
mel += motif(T0("birth") + 0.4, 0.55, 0.2)
mel += motif(at("orbit", 1.6), 0.45, 0.28, True)
mel += motif(T0("roadster") + 0.6, 0.7, 0.2)
mel += [[at("catch", frac=0.62), 86, 0.3, 1], [at("catch", frac=0.62) + 0.5, 85, 0.28, 1], [at("catch", frac=0.62) + 1.0, 81, 0.28, 1]]
mel += motif(T0("mars") + 0.3, 0.5, 0.26, True)
M["melody"] = mel
M["mallet_melody"] = []
M["drums"] = [[at("boom", 2.8), 0.4, "boom"], [at("orbit", 1.6), 0.3, "boom"], [at("landing", frac=0.78), 0.32, "boom"], [at("catch", frac=0.62), 0.38, "boom"], [DUR - 3.0, 0.26, "boom"]]
M["drum_patterns"] = [
    {"t0": T0("spacex"), "t1": at("boom", 2.8), "step": 0.5, "pattern": [1, 0, 0.5, 0], "vel": [[T0("spacex"), 0.16], [at("boom", 2.8), 0.26]], "kind": "taiko"},
    {"t0": T0("landing"), "t1": at("landing", frac=0.78), "step": 0.5, "pattern": [1, 0, 0.5, 0], "vel": 0.2, "kind": "taiko"},
    {"t0": T0("catch"), "t1": at("catch", frac=0.62), "step": 0.25, "pattern": [1, 0, 0.5, 0, 0.8, 0, 0.5, 0.4], "vel": [[T0("catch"), 0.14], [at("catch", frac=0.62), 0.28]], "kind": "taiko"},
]
M["stings"] = []
M["pad"] = [
    {"t0": 0.0, "t1": DUR, "chord": "D", "level": 0.75, "attack": 0.4, "release": 1.5},                     # the never-drop-out bed
    {"t0": T0("broke"), "t1": T1("broke"), "chord": "Bm", "level": 0.95, "attack": 0.4, "release": 0.6},
    {"t0": T0("roadster"), "t1": T1("crew"), "notes": [62, 69, 74, 78], "level": 0.4, "attack": 1.5, "release": 0.8, "cutoff": 2600},   # space shimmer
    {"t0": T0("starlink"), "t1": T1("starlink"), "notes": [67, 74, 79, 83], "level": 0.4, "attack": 1.0, "release": 0.8, "cutoff": 2800},
]
c["music"] = M
json.dump(c, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print("wrote cues.json:", len(chords), "chords,", len(M["sections"]), "sections,", len(mel), "melody notes")
