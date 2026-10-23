#!/usr/bin/env python3
"""Cue sheet for 009 (tone: biography) -> cues.json.   python3 -I videos/009-abe-lincoln/make_cues.py

Sound identity: AMERICANA. A dulcimer-like mallet ostinato + a folk-hymn piano theme in G major for the frontier years,
a minor turn at New Orleans, a rising pulse for the debates and the election, low strings + soft taiko for the war (a far boom
on every cannon), a hushed hymn for the signing and Gettysburg, a bright swell for the victory, a music-box lilt in the theatre
that drains to a drone as the shadow appears (one low boom under the black — no gunshot), solo piano at dawn, and the full theme
at the memorial. Music never drops out (house rule). Scene beds + a few synced foley hits sit under it.
Shot times come from story.json → shots (single source of truth). Every time below is in shots.js's own (src) clock;
remap() at the end moves the whole sheet onto the narrated timeline that tools/biography.py wrote (shots s0/s1 → t0/t1)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, "story.json")))
T = {s["cam"]: (s["t0"], s["t1"]) for s in story["shots"]}
DUR = 86.5            # src clock length; remap() stretches everything to story["duration"]

c = {
    "title": "009 - The story of Abraham Lincoln (biography: Americana)",
    "duration": DUR, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5,
    "end_fade": [DUR - 1.6, DUR],
    "stem_gain_db": {"music": 0.0, "sfx": -6.0, "amb": -4.0},
    "sfx_lowpass_hz": 4500,
    "shots": sorted({s["t0"] for s in story["shots"]} | {DUR}),
}

# ---------------------------------------------------------------- ambience: every place sounds like itself
c["ambience"] = [
    {"sound": "wind", "t0": 0.0, "t1": 3.6, "fade_in": 0.8, "fade_out": 0.4, "gain_db": -42, "args": {"darkness": 0.8, "gust": 0.4, "whistle": 0.05}},
    {"sound": "room_tone", "t0": 3.6, "t1": 6.9, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -44},
    {"sound": "wind", "t0": 6.9, "t1": 12.9, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -47, "args": {"darkness": 0.4, "gust": 0.3, "whistle": 0.0}},
    {"sound": "dry_leaves", "t0": 12.9, "t1": 15.9, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -44, "args": {"density": 0.6}},
    {"sound": "room_tone", "t0": 15.9, "t1": 19.6, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -44},
    {"sound": "wind", "t0": 19.6, "t1": 22.7, "fade_in": 0.3, "fade_out": 0.2, "gain_db": -46, "args": {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}},
    {"sound": "city_day", "t0": 22.7, "t1": 25.6, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -47, "args": {"murmur": 1.0, "traffic": 0.0}},   # the auction crowd
    {"sound": "room_tone", "t0": 25.6, "t1": 28.6, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -43},
    {"sound": "wind", "t0": 28.6, "t1": 32.0, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -45, "args": {"darkness": 0.9, "gust": 0.3, "whistle": 0.0}},
    {"sound": "room_tone", "t0": 32.0, "t1": 35.2, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -45},
    {"sound": "city_day", "t0": 35.2, "t1": 41.2, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -42, "args": {"murmur": 1.0, "traffic": 0.0}},
    {"sound": "room_tone", "t0": 41.2, "t1": 47.6, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -44},
    {"sound": "wind", "t0": 47.6, "t1": 51.0, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -44, "args": {"darkness": 0.8, "gust": 0.5, "whistle": 0.0}},
    {"sound": "room_tone", "t0": 51.0, "t1": 57.2, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -44},
    {"sound": "wind", "t0": 57.2, "t1": 63.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -46, "args": {"darkness": 0.5, "gust": 0.3, "whistle": 0.0}},
    {"sound": "city_day", "t0": 57.2, "t1": 62.3, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -50, "args": {"murmur": 1.0, "traffic": 0.0}},
    {"sound": "applause", "t0": 62.2, "t1": 63.3, "fade_in": 0.3, "fade_out": 0.2, "gain_db": -40, "args": {"density": 30, "swell": 0.5}},
    {"sound": "crowd_cheer", "t0": 63.2, "t1": 66.4, "fade_in": 0.15, "fade_out": 0.4, "gain_db": -38, "args": {"excite": 0.9}},
    {"sound": "city_day", "t0": 66.4, "t1": 70.0, "fade_in": 0.3, "fade_out": 0.1, "gain_db": -48, "args": {"murmur": 1.0, "traffic": 0.0}},
    {"sound": "applause", "t0": 67.0, "t1": 67.9, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -44, "args": {"density": 20, "swell": 0.3}},   # the audience laughs
    {"sound": "room_tone", "t0": 70.6, "t1": 76.4, "fade_in": 0.8, "fade_out": 0.4, "gain_db": -45},
    {"sound": "wind", "t0": 76.4, "t1": DUR, "fade_in": 0.6, "fade_out": 1.2, "gain_db": -48, "args": {"darkness": 0.4, "gust": 0.2, "whistle": 0.0}},
]

# ---------------------------------------------------------------- foley on story beats (soft, few)
ev = []
for t in (7.4, 8.3, 9.2, 11.35, 12.25):                     # axe on the log (a dull wood knock)
    ev.append({"t": t, "sound": "phone_set_down_wood", "gain_db": -27, "pan": 0.1, "room": -16})
ev.append({"t": 27.25, "sound": "latch_click", "args": {"kind": "close", "bright": 0.5, "strength": 0.5}, "gain_db": -36, "pan": 0.0, "room": -16})  # coins in her palm
ev.append({"sound": "footsteps", "t0": 28.8, "t1": 31.9, "pan0": 0.1, "pan1": -0.1, "gain_db": -34, "room": -20})
ev.append({"t": 34.3, "sound": "blanket_rustle", "args": {"dur": 0.35, "softness": 0.9, "intensity": 0.4}, "gain_db": -34, "pan": 0.0, "room": -16})  # page turn
ev.append({"t": 18.3, "sound": "blanket_rustle", "args": {"dur": 0.3, "softness": 0.9, "intensity": 0.35}, "gain_db": -35, "pan": 0.0, "room": -16})  # page turn
for t in (47.75, 48.35, 49.0, 49.7, 50.4):                  # cannons: far, soft booms (synced to battle.update shots)
    ev.append({"t": t, "sound": "distant_boom", "args": {"size": 0.7}, "gain_db": -27, "pan": -0.1, "room": -18})
ev.append({"t": 70.0, "sound": "distant_boom", "args": {"size": 0.3}, "gain_db": -22, "pan": 0.1, "room": -10})   # the shot: one muffled crack, no gunshot sample
ev.append({"t": 55.62, "sound": "pen_scribble", "args": {"dur": 0.95}, "gain_db": -30, "pan": 0.1, "room": -18})   # the signature
c["events"] = ev

# ---------------------------------------------------------------- music
M = {
    "instrument": "piano", "gain_db": 0.0, "reverb_db": -8.0, "pad_db": -5.0, "pad_reverb_db": -4.0,
    "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": DUR,
    "ducks": [], "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}],
    "mallet_db": -4.0, "strings_db": 0.0, "drums_db": -12.0,
}
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(0.0, 3.6, ["G"])
bar(3.6, 12.9, ["G", "C", "G", "D", "G", "C", "D", "G"])          # birth + woods: the folk theme
bar(12.9, 15.9, ["Em", "C"])                                      # mother's grave
bar(15.9, 22.7, ["G", "D", "Em", "C", "G", "D"])                  # firelight + the river
bar(22.7, 25.6, ["Em", "Am", "B"])                                # New Orleans: the minor turn
bar(25.6, 35.2, ["G", "C", "G", "D", "Em", "C", "D", "D"])        # store, road, law
bar(35.2, 41.2, ["G", "Em", "C", "D", "Em", "D"])                 # debates: rising pulse
bar(41.2, 47.6, ["G", "C", "D", "G", "C", "G"])                   # elected + the beard
bar(47.6, 51.0, ["Em", "C", "Am", "B"])                           # war
bar(51.0, 57.2, ["Em", "C", "Am", "D", "G"])                      # the proclamation (resolves on the signature)
bar(57.2, 63.2, ["G", "C", "G", "D", "Em", "G"])                  # Gettysburg hymn
bar(63.2, 66.4, ["G", "C", "D"])                                  # victory
bar(66.4, 70.6, ["G", "D", "Em"])                                 # theatre: lilt → drain
bar(70.6, 76.4, ["Em", "C", "G", "D"])                            # dawn: solo piano
bar(76.4, DUR, ["G", "C", "Em", "D", "C", "D", "G"])              # memorial: the whole theme
M["chords"] = chords

M["sections"] = [
    {"t0": 0.0, "t1": 3.6, "style": "sparse", "vel": 0.18},
    {"t0": 3.6, "t1": 12.9, "style": "ostinato", "vel": [[3.6, 0.2], [12.9, 0.26]], "step": 0.29, "pattern": [0, 1, 2, 4, 2, 1], "bass_every": 4, "bass_vel": 0.7, "len": 1.2},
    {"t0": 12.9, "t1": 15.9, "style": "held", "vel": 0.2, "roll": 0.08},
    {"t0": 15.9, "t1": 22.7, "style": "ostinato", "vel": [[15.9, 0.22], [22.7, 0.28]], "step": 0.29, "pattern": [0, 2, 4, 5, 4, 2], "bass_every": 4, "bass_vel": 0.75, "len": 1.2},
    {"t0": 22.7, "t1": 25.6, "style": "held", "vel": 0.22, "roll": 0.1},
    {"t0": 25.6, "t1": 35.2, "style": "ostinato", "vel": [[25.6, 0.24], [35.2, 0.28]], "step": 0.29, "pattern": [0, 1, 2, 4, 2, 1], "bass_every": 4, "bass_vel": 0.75, "len": 1.2},
    {"t0": 35.2, "t1": 41.2, "style": "pulse", "vel": [[35.2, 0.2], [41.2, 0.3]], "step": 0.5},
    {"t0": 41.2, "t1": 44.0, "style": "swell", "vel": 0.3, "step": 0.35, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 44.0, "t1": 47.6, "style": "ostinato", "vel": 0.24, "step": 0.25, "pattern": [0, 2, 4, 5, 4, 2], "bass_every": 4, "bass_vel": 0.7, "len": 1.0},
    {"t0": 47.6, "t1": 51.0, "style": "strings", "vel": [[47.6, 0.22], [51.0, 0.28]], "step": 0.125, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.4},
    {"t0": 51.0, "t1": 57.2, "style": "held", "vel": [[51.0, 0.2], [57.2, 0.26]], "roll": 0.09},
    {"t0": 57.2, "t1": 63.2, "style": "arp", "vel": [[57.2, 0.2], [63.2, 0.26]], "step": 0.5, "pattern": [0, 1, 2, 1]},
    {"t0": 63.2, "t1": 66.4, "style": "swell", "vel": 0.26, "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 66.4, "t1": 68.7, "style": "ostinato", "vel": 0.2, "step": 0.25, "pattern": [0, 2, 4, 2], "bass_every": 4, "bass_vel": 0.6, "len": 0.9, "transpose": 12},
    {"t0": 68.7, "t1": 70.6, "style": "sparse", "vel": 0.14},
    {"t0": 70.6, "t1": 76.4, "style": "held", "vel": 0.17, "roll": 0.12},
    {"t0": 76.4, "t1": 82.3, "style": "swell", "vel": [[76.4, 0.22], [82.3, 0.32]], "step": 0.42, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 82.3, "t1": DUR, "style": "cadence", "vel": 0.26, "roll": 0.14},
]
# the theme: a simple pentatonic folk-hymn line in G (beats of `b` seconds)
THEME = [(0, 67, 1), (1, 71, 1), (2, 74, 1.5), (3.5, 76, 0.5), (4, 74, 1), (5, 71, 1), (6, 69, 2),
         (8, 67, 1), (9, 71, 1), (10, 74, 1), (11, 79, 1), (12, 76, 1.5), (13.5, 74, 0.5), (14, 71, 2)]
def theme(t0, b, vel, octave=False, first=None, transpose=0):
    out = []
    for i, (beat, m, ln) in enumerate(THEME if first is None else THEME[:first]):
        e = [round(t0 + beat * b, 3), m + transpose, vel]
        if octave: e.append(1)
        out.append(e)
    return out
mel = []
mel += [[0.55, 67, 0.15, False, 3.0], [1.2, 74, 0.16], [2.4, 71, 0.15], [3.1, 67, 0.14, False, 1.2]]                        # title: two soft notes
mel += theme(4.0, 0.58, 0.24)                                    # childhood theme
mel += [[13.0, 71, 0.18], [14.2, 67, 0.17], [15.2, 64, 0.16]]    # grave: falling
mel += theme(16.2, 0.42, 0.24, first=7)                          # firelight (half theme)
mel += [[19.8, 74, 0.26, 1], [20.8, 76, 0.26, 1], [21.6, 79, 0.28, 1]]   # river opens up
mel += [[23.0, 71, 0.2], [24.0, 72, 0.2], [25.0, 71, 0.18]]      # New Orleans: minor sigh
mel += theme(25.8, 0.6, 0.24)                                    # store → road → law
mel += [[36.2, 67, 0.22], [37.2, 71, 0.22], [38.2, 74, 0.24], [39.2, 76, 0.26], [40.2, 78, 0.28]]   # debates climb
mel += [[41.3, 79, 0.32, 1], [42.4, 78, 0.3, 1], [43.0, 76, 0.3, 1]]    # elected!
mel += [[45.0, 74, 0.2], [45.5, 76, 0.2], [46.0, 79, 0.22], [46.9, 83, 0.2]]   # the beard grows (playful)
mel += [[48.0, 76, 0.26], [49.0, 72, 0.26], [50.0, 71, 0.28]]    # war
mel += [[52.0, 71, 0.18], [53.4, 72, 0.18], [54.8, 74, 0.18], [56.6, 79, 0.26, 1]]   # signing → resolve on the signature
mel += theme(57.4, 0.52, 0.26, octave=True)                      # Gettysburg hymn
mel += [[63.3, 79, 0.28, 1], [64.3, 83, 0.28, 1], [65.3, 86, 0.26, 1]]   # victory
mel += [[66.6, 83, 0.14], [67.1, 86, 0.14], [67.6, 83, 0.14], [68.1, 79, 0.13], [68.8, 64, 0.13, False, 2.0], [69.6, 59, 0.12, False, 1.4]]   # theatre lilt (music box)
mel += [[71.4, 71, 0.17], [72.6, 67, 0.16], [73.8, 69, 0.17], [75.2, 66, 0.16], [76.05, 62, 0.15, False, 1.2]]     # dawn
mel += theme(76.8, 0.62, 0.28, octave=True)                      # memorial: the whole theme
mel += [[85.0, 67, 0.22]]
M["melody"] = mel
M["mallet_melody"] = [[0.6, 79, 0.18, 0.6], [2.0, 83, 0.16, 0.6]]
M["drums"] = [[47.6, 0.32, "boom"], [63.2, 0.32, "boom"], [70.05, 0.4, "boom"], [82.3, 0.3, "boom"]]
M["drum_patterns"] = [
    {"t0": 47.6, "t1": 51.0, "step": 0.5, "pattern": [1, 0, 0.5, 0], "vel": [[47.6, 0.18], [51.0, 0.26]], "kind": "taiko"},
    {"t0": 63.2, "t1": 66.2, "step": 0.5, "pattern": [1, 0, 0.6, 0], "vel": 0.2, "kind": "taiko"},
]
M["stings"] = [{"t": 70.05, "midi": 28, "vel": 0.42, "hold": 3.0}]
M["pad"] = [
    {"t0": 0.0, "t1": 3.7, "notes": [43, 55, 62, 67, 71], "level": 0.95, "attack": 0.35, "release": 0.6, "cutoff": 1400},
    {"t0": 3.6, "t1": 12.95, "chord": "G", "level": 0.45, "attack": 0.6, "release": 0.6},
    {"t0": 12.9, "t1": 15.95, "chord": "Em", "level": 0.5, "attack": 0.5, "release": 0.6},
    {"t0": 15.9, "t1": 22.75, "chord": "G", "level": 0.42, "attack": 0.5, "release": 0.6},
    {"t0": 22.7, "t1": 25.65, "notes": [40, 47, 52, 59], "level": 0.6, "attack": 0.4, "release": 0.6, "cutoff": 1200},
    {"t0": 25.6, "t1": 35.25, "chord": "G", "level": 0.42, "attack": 0.5, "release": 0.6},
    {"t0": 35.2, "t1": 47.65, "chord": "D", "level": 0.45, "attack": 1.0, "release": 0.6},
    {"t0": 47.6, "t1": 51.05, "notes": [28, 40, 47, 52], "level": 0.85, "attack": 0.3, "release": 0.6, "cutoff": 700, "hp": 30},
    {"t0": 51.0, "t1": 57.25, "chord": "Em", "level": 0.5, "attack": 0.6, "release": 0.6},
    {"t0": 57.2, "t1": 66.45, "chord": "G", "level": 0.5, "attack": 0.6, "release": 0.6},
    {"t0": 66.4, "t1": 70.65, "notes": [28, 40, 47, 52, 59], "level": 1.0, "attack": 0.8, "release": 0.6, "cutoff": 800, "hp": 30},
    {"t0": 70.6, "t1": 76.45, "chord": "Em", "level": 0.45, "attack": 1.0, "release": 0.6},
    {"t0": 76.3, "t1": DUR, "chord": "G", "level": 0.6, "attack": 0.4, "release": 1.2},
]
c["music"] = M

# ---------------------------------------------------------------- src clock -> narrated timeline
SH = [s for s in story["shots"] if "s0" in s]
NEW_DUR = story["duration"]
def remap(x):
    for s in SH:
        if s["s0"] - 1e-6 <= x <= s["s1"] + 1e-6:
            return round(s["t0"] + (x - s["s0"]) / (s["s1"] - s["s0"]) * (s["t1"] - s["t0"]), 3)
    last = SH[-1]
    return round(last["t1"] if x > last["s1"] else 0.0, 3)
def bp(v): return [[remap(a), b] for a, b in v] if isinstance(v, list) else v
for a in c["ambience"]: a["t0"], a["t1"] = remap(a["t0"]), remap(a["t1"])
for e in c["events"]:
    for k in ("t", "t0", "t1"):
        if k in e: e[k] = remap(e[k])
M["chords"] = [[remap(t), sym] for t, sym in M["chords"]]
for sec in M["sections"]: sec["t0"], sec["t1"] = remap(sec["t0"]), remap(sec["t1"]); sec["vel"] = bp(sec["vel"])
M["melody"] = [[remap(m[0])] + m[1:] for m in M["melody"]]
M["mallet_melody"] = [[remap(m[0])] + m[1:] for m in M["mallet_melody"]]
M["drums"] = [[remap(d[0])] + d[1:] for d in M["drums"]]
for d in M["drum_patterns"]: d["t0"], d["t1"] = remap(d["t0"]), remap(d["t1"]); d["vel"] = bp(d["vel"])
for st in M["stings"]: st["t"] = remap(st["t"])
for p in M["pad"]: p["t0"], p["t1"] = remap(p["t0"]), remap(p["t1"])
M["end"] = NEW_DUR; c["duration"] = NEW_DUR; c["end_fade"] = [NEW_DUR - 1.8, NEW_DUR]
c["shots"] = sorted({s["t0"] for s in story["shots"]} | {NEW_DUR})
json.dump(c, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print("wrote cues.json:", len(chords), "chords,", len(M["sections"]), "sections,", len(mel), "melody notes")
