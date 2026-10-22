#!/usr/bin/env python3
"""Cue sheet for 005 (tone: world, DRAMATIC) -> cues.json.   python3 -I videos/005-no-nukes/make_cues.py

The music must fit the reel's vibe. This one is ominous/high-stakes (nuclear weapons, armies, a secret bomb), so the score is
cinematic: D minor, a low spiccato string ostinato (style "strings"), soft taiko/timpani drums (drums / drum_patterns), sub drones
and a "braam" (low pad notes), one big hit at midnight and one at the reveal, a hopeful-but-grand lift for Day 1, and a dark
heartbeat into the last line. History: v1 copied 001's sad piano (user: "too sad"), v2 a calm mallet explainer (user: "too calm
for how dramatic/ominous it is"). Music never drops out (house rule) — the quiet moments keep a drone."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
c = json.load(open(os.path.join(HERE, "cues.json")))

c["title"] = "005 - What if every nuclear weapon disappeared? (world tone: curious explainer)"
c["shots"] = [0, 3.6, 10.2, 12.8, 15.6, 19.0, 22.2, 26.0, 30.2, 34.2, 38.4, 42.2, 46.2, 50.0, 53.6, 60.4, 71]
c["ambience"] = [
    {"sound": "room_tone", "t0": 0.0, "t1": 22.2, "fade_in": 0.6, "fade_out": 0.4, "gain_db": -44},
    {"sound": "lamp_hum", "t0": 15.6, "t1": 22.2, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -50},
    {"sound": "city_day", "t0": 22.2, "t1": 30.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -46},
    {"sound": "wind", "t0": 38.4, "t1": 42.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -48},
    {"sound": "room_tone", "t0": 50.0, "t1": 66.6, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -44},
]
c["events"] = [
    {"t": 16.25, "sound": "lamp_switch_click", "gain_db": -32, "pan": -0.2, "room": -14},
    {"t": 17.0, "sound": "lamp_switch_click", "gain_db": -33, "pan": 0.2, "room": -14},
    {"t": 17.6, "sound": "mattress_sit", "gain_db": -31, "pan": 0.1, "room": -16},
    {"sound": "footsteps", "t0": 34.4, "t1": 38.2, "pan0": -0.1, "pan1": 0.1, "gain_db": -34, "room": -18},
    {"t": 60.75, "sound": "blanket_rustle", "args": {"dur": 0.5, "softness": 0.95, "intensity": 0.45}, "gain_db": -30, "pan": 0.0, "room": -18},
]

M = c["music"]
M["end"] = 71.0
M["reverb_db"] = -9.0
M["mallet_db"] = -6.0
M["strings_db"] = 8.0
M["drums_db"] = -7.0
M["leveler"] = {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(0.3, 3.6, ["Dm"])                               # title: drone + one low hit
bar(3.6, 10.2, ["Dm", "Bb", "Gm", "A"])             # the facts: strings start driving
bar(10.2, 11.0, ["A"])                              # the roll into midnight
bar(11.0, 15.6, ["Dm", "Bb"])                       # midnight hit, then eerie shimmer while the dots go out
bar(15.6, 22.2, ["Dm", "Bb", "Gm", "A"])            # capsule: low and tense
bar(22.2, 30.2, ["F", "C", "Dm", "Bb"])             # Day 1: the lift (grand, hopeful)
bar(30.2, 38.4, ["Dm", "Bb", "Gm", "A"])            # power shifts: ominous drive
bar(38.4, 46.2, ["Dm", "C", "Bb", "A"])             # border + tanks: descending, heavier
bar(46.2, 53.6, ["Gm", "A", "Bb", "C", "D", "Eb", "A", "A"])   # years pass: climbing build
bar(53.6, 55.0, ["Dm"])                             # held breath (drone, never silent)
bar(55.0, 60.4, ["Dm", "Bb", "Gm", "A"])            # the reveal
bar(60.4, 66.6, ["Dm", "Bb", "Gm", "A"])            # heartbeat under the last line
bar(66.6, 71.0, ["Dm"])                             # final hit, drone out
M["chords"] = chords

drive = [0, 0, 1, 0, 2, 0, 1, 0]
M["sections"] = [
    {"t0": 0.3, "t1": 3.6, "style": "sparse", "vel": 0.2},
    {"t0": 3.6, "t1": 10.2, "style": "strings", "vel": [[3.6, 0.26], [10.2, 0.38]], "step": 0.125, "pattern": drive, "octave": 1},
    {"t0": 10.2, "t1": 11.0, "style": "strings", "vel": [[10.2, 0.34], [11.0, 0.5]], "step": 0.0625, "pattern": [0, 1], "octave": 1},
    {"t0": 11.0, "t1": 15.6, "style": "held", "vel": 0.2, "roll": 0.06},
    {"t0": 15.6, "t1": 22.2, "style": "strings", "vel": [[15.6, 0.26], [22.2, 0.3]], "step": 0.25, "pattern": [0, 0, 1, 0], "accent": [1.0, 0.6], "octave": 1, "len": 0.95},
    {"t0": 22.2, "t1": 30.2, "style": "strings", "vel": [[22.2, 0.18], [26.0, 0.22], [30.2, 0.2]], "step": 0.25, "pattern": [0, 1, 2, 3, 2, 1, 2, 1], "octave": 1, "sustain": 0.35, "len": 0.8},
    {"t0": 30.2, "t1": 38.4, "style": "strings", "vel": [[30.2, 0.36], [38.4, 0.46]], "step": 0.125, "pattern": drive, "octave": 1},
    {"t0": 38.4, "t1": 46.2, "style": "strings", "vel": [[38.4, 0.4], [46.2, 0.5]], "step": 0.125, "pattern": drive, "octave": 1, "sustain": 0.45},
    {"t0": 46.2, "t1": 53.6, "style": "strings", "vel": [[46.2, 0.32], [53.4, 0.58]], "step": 0.125, "pattern": [0, 1, 2, 1, 3, 1, 2, 1], "octave": 1, "sustain": 0.4},
    {"t0": 53.6, "t1": 55.0, "style": "strings", "vel": 0.26, "step": 0.0625, "pattern": [0, 1], "octave": 1, "len": 0.9},
    {"t0": 55.0, "t1": 60.4, "style": "strings", "vel": [[55.0, 0.55], [58.0, 0.5], [60.4, 0.38]], "step": 0.125, "pattern": drive, "octave": 1, "sustain": 0.55},
    {"t0": 60.4, "t1": 66.6, "style": "strings", "vel": [[60.4, 0.3], [66.6, 0.24]], "step": 0.5, "pattern": [0, 1], "accent": [1.0, 0.6], "octave": 1, "sustain": 0.35, "len": 0.7},
    {"t0": 66.6, "t1": 71.0, "style": "cadence", "vel": 0.24, "roll": 0.12},
]
D = 0.5   # beat (120 bpm)
M["drums"] = [
    [0.3, 0.55, "boom"],
    [11.0, 0.95, "boom"], [11.0, 0.7, "taiko"],        # midnight
    [42.2, 0.75, "boom"],                              # the hangar door: tanks
    [55.0, 1.0, "boom"], [55.0, 0.75, "taiko"],        # the reveal
    [66.6, 0.7, "boom"],                               # last hit under the end card
]
M["drum_patterns"] = [
    {"t0": 3.6, "t1": 10.2, "step": D, "pattern": [1, 0, 0, 0, 0.6, 0, 0, 0], "vel": [[3.6, 0.3], [10.2, 0.45]], "kind": "taiko"},
    {"t0": 10.2, "t1": 11.0, "step": 0.1, "pattern": [1], "vel": [[10.2, 0.15], [11.0, 0.55]], "kind": "tom"},
    {"t0": 22.2, "t1": 30.2, "step": D, "pattern": [1, 0, 0.5, 0], "vel": 0.32, "kind": "taiko"},
    {"t0": 30.2, "t1": 38.4, "step": D / 2, "pattern": [1, 0, 0, 0.45, 0, 0, 0.7, 0], "vel": [[30.2, 0.4], [38.4, 0.55]], "kind": "taiko"},
    {"t0": 38.4, "t1": 46.2, "step": D / 2, "pattern": [1, 0, 0.55, 0, 0.9, 0, 0.55, 0.45], "vel": [[38.4, 0.5], [46.2, 0.62]], "kind": "taiko"},
    {"t0": 46.2, "t1": 52.0, "step": D / 2, "pattern": [1, 0, 0.6, 0, 0.9, 0, 0.6, 0.5], "vel": [[46.2, 0.45], [52.0, 0.6]], "kind": "taiko"},
    {"t0": 52.0, "t1": 53.6, "step": 0.1, "pattern": [1], "vel": [[52.0, 0.2], [53.6, 0.7]], "kind": "tom"},
    {"t0": 55.5, "t1": 60.4, "step": D, "pattern": [1, 0, 0.6, 0], "vel": [[55.5, 0.55], [60.4, 0.4]], "kind": "taiko"},
    {"t0": 60.4, "t1": 66.6, "step": D / 2, "pattern": [1, 0, 0.55, 0, 0, 0, 0, 0], "vel": 0.36, "kind": "taiko"},   # heartbeat
]
M["melody"] = [
    [1.4, 74, 0.2], [2.4, 70, 0.2],                                              # title: D – Bb, a question
    [11.6, 81, 0.18], [12.6, 77, 0.17], [13.4, 74, 0.17], [14.4, 70, 0.16],     # eerie high fall as the dots go out
    [16.0, 69, 0.18], [19.3, 70, 0.18], [21.0, 73, 0.2],
    [22.2, 69, 0.3, 1], [23.2, 72, 0.3, 1], [24.2, 77, 0.33, 1], [25.6, 76, 0.3, 1], [26.2, 74, 0.33, 1], [27.6, 72, 0.3, 1], [28.2, 70, 0.32, 1], [29.4, 69, 0.3, 1],
    [32.25, 74, 0.28], [34.3, 70, 0.28], [36.35, 73, 0.3],
    [38.4, 74, 0.34, 1], [39.4, 77, 0.33, 1], [40.35, 76, 0.34, 1], [42.3, 74, 0.36, 1], [43.3, 72, 0.34, 1], [44.25, 73, 0.38, 1], [45.2, 76, 0.36, 1],
    [55.0, 74, 0.42, 1], [56.35, 77, 0.42, 1], [57.7, 79, 0.44, 1], [59.05, 81, 0.46, 1],
    [61.5, 74, 0.2], [63.5, 70, 0.18], [65.5, 73, 0.2],
]
M["mallet_melody"] = []
M["stings"] = [{"t": 11.0, "midi": 26, "vel": 0.5, "hold": 2.5}, {"t": 55.0, "midi": 26, "vel": 0.55, "hold": 3.0}, {"t": 66.6, "midi": 26, "vel": 0.4, "hold": 2.5}]
DRONE = [26, 38, 45, 50, 57]  # D1 D2 A2 sub drone + D3 A3 so phones hear it
M["pad"] = [
    {"t0": 0.3, "t1": 11.1, "notes": DRONE, "level": 0.9, "attack": 1.5, "release": 0.8, "cutoff": 700, "hp": 30},
    {"t0": 11.0, "t1": 15.7, "notes": [62, 69, 74, 77], "level": 0.6, "attack": 0.4, "release": 0.8, "cutoff": 3000},   # eerie shimmer
    {"t0": 11.0, "t1": 22.3, "notes": DRONE, "level": 0.8, "attack": 0.3, "release": 0.8, "cutoff": 600, "hp": 30},
    {"t0": 22.2, "t1": 30.3, "chord": "F", "level": 0.4, "attack": 1.2, "release": 0.8},
    {"t0": 30.2, "t1": 46.3, "notes": DRONE, "level": 0.85, "attack": 1.5, "release": 0.8, "cutoff": 650, "hp": 30},
    {"t0": 46.2, "t1": 53.65, "notes": [45, 52, 57, 64], "level": 0.5, "attack": 6.0, "release": 0.3, "cutoff": 1800},   # rising swell
    {"t0": 53.6, "t1": 55.05, "notes": DRONE, "level": 1.0, "attack": 0.4, "release": 0.3, "cutoff": 500, "hp": 30},
    {"t0": 55.0, "t1": 60.5, "notes": [26, 33, 38, 45, 50], "level": 1.5, "attack": 0.15, "release": 1.0, "cutoff": 900, "hp": 30},   # braam
    {"t0": 60.4, "t1": 70.6, "notes": DRONE, "level": 0.85, "attack": 0.8, "release": 1.2, "cutoff": 600, "hp": 30},
]
M["ducks"] = []
json.dump(c, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print("wrote cues.json:", len(chords), "chords,", len(M["sections"]), "sections")
