#!/usr/bin/env python3
"""Cue sheet for 005 (tone: world) -> cues.json.   python3 -I videos/005-no-nukes/make_cues.py

World tone music = curious documentary/explainer energy, NOT the sad nostalgic piano of the emotional videos:
a soft mallet ostinato (style "ostinato"), D major / D lydian wonder (D <-> E/D), a driving low pulse for the tension,
a building ostinato through the time skip, a swell + pad on the reveal, and an OPEN ending (Gmaj7 -> Asus4, no resolution:
the video ends on a question). Music never drops out (house rule)."""
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
M["mallet_db"] = -3.0
M["reverb_db"] = -8.0
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(0.3, 10.2, ["D", "E/D", "D", "E/D"])          # lydian wonder
bar(10.2, 15.6, ["Bm", "G", "D", "A"])             # the vanishing
bar(15.6, 22.2, ["G", "D/F#", "Em", "A"])          # the capsule
bar(22.2, 30.2, ["D", "A/C#", "Bm", "G"])          # Day 1 — bright
bar(30.2, 38.4, ["Bm", "G", "Em", "F#"])           # power shifts — driving
bar(38.4, 46.2, ["Bm", "G", "D", "F#"])            # border + tanks
bar(46.2, 53.6, ["G", "A", "Bm", "D/F#"])          # years pass — building
bar(53.6, 55.0, ["Asus4"])                         # held breath (soft, never silent)
bar(55.0, 60.4, ["Bm", "G", "Em", "F#"])           # the reveal
bar(60.4, 66.6, ["Bm", "G", "D", "A"])             # last line
bar(66.6, 71.0, ["Gmaj7", "Asus4"])                # open question
M["chords"] = chords

M["sections"] = [
    {"t0": 0.3, "t1": 10.2, "style": "ostinato", "vel": [[0.3, 0.17], [10.2, 0.24]], "step": 0.2475, "pattern": [0, 2, 4, 2, 1, 2, 3, 2], "bass_every": 8, "len": 0.8},
    {"t0": 10.2, "t1": 15.6, "style": "ostinato", "vel": [[10.2, 0.24], [15.6, 0.22]], "step": 0.225, "pattern": [5, 4, 2, 1, 3, 2, 0, 1], "bass_every": 4, "len": 0.8},
    {"t0": 15.6, "t1": 22.2, "style": "ostinato", "vel": 0.16, "step": 0.4125, "pattern": [0, 2, 1, 2], "bass_every": 4, "len": 1.2},
    {"t0": 22.2, "t1": 30.2, "style": "ostinato", "vel": [[22.2, 0.24], [26.0, 0.29], [30.2, 0.26]], "step": 0.25, "pattern": [0, 1, 2, 4, 3, 2, 4, 5], "bass_every": 4, "len": 0.85},
    {"t0": 30.2, "t1": 38.4, "style": "pulse", "vel": [[30.2, 0.22], [38.4, 0.27]], "step": 0.256},
    {"t0": 38.4, "t1": 46.2, "style": "pulse", "vel": [[38.4, 0.26], [46.2, 0.31]], "step": 0.244},
    {"t0": 46.2, "t1": 53.6, "style": "ostinato", "vel": [[46.2, 0.24], [53.4, 0.33]], "step": 0.185, "pattern": [0, 2, 4, 5, 4, 2, 1, 3], "bass_every": 4, "len": 0.75},
    {"t0": 53.6, "t1": 55.0, "style": "held", "vel": 0.24, "roll": 0.12},
    {"t0": 55.0, "t1": 60.4, "style": "swell", "vel": [[55.0, 0.3], [58.0, 0.37], [60.4, 0.3]], "step": 0.3375, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 60.4, "t1": 66.6, "style": "ostinato", "vel": [[60.4, 0.2], [66.6, 0.17]], "step": 0.31, "pattern": [0, 2, 1, 2], "bass_every": 4, "len": 0.9},
    {"t0": 66.6, "t1": 71.0, "style": "cadence", "vel": 0.21, "roll": 0.1},
]
# piano melody only where the mallet rests; mallet motifs carry the curiosity
M["melody"] = [
    [16.2, 71, 0.2], [17.8, 74, 0.2], [19.9, 79, 0.21], [21.0, 76, 0.22],                       # capsule
    [30.2, 74, 0.25], [31.2, 73, 0.22], [32.25, 71, 0.25], [34.3, 79, 0.26], [36.35, 78, 0.27],  # power shift
    [38.4, 74, 0.27], [39.4, 76, 0.26], [40.35, 79, 0.28], [42.3, 78, 0.28], [43.3, 81, 0.28], [44.25, 82, 0.31], [45.2, 81, 0.3],
    [55.0, 74, 0.36, 1], [56.35, 79, 0.37, 1], [57.7, 78, 0.39, 1], [59.05, 82, 0.4, 1],     # reveal (octave-doubled)
]
M["mallet_melody"] = [
    [1.0, 81, 0.24, 0.3], [1.5, 83, 0.22, 0.3], [2.0, 86, 0.24, 0.6],
    [3.4, 80, 0.24, 0.3], [3.9, 83, 0.22, 0.3], [4.4, 85, 0.26, 0.7],
    [6.0, 81, 0.25, 0.3], [6.5, 86, 0.24, 0.3], [7.0, 88, 0.26, 0.6],
    [8.3, 85, 0.25, 0.3], [8.8, 83, 0.24, 0.3], [9.3, 80, 0.26, 0.8],
    [23.0, 86, 0.27, 0.3], [23.5, 85, 0.25, 0.3], [24.0, 81, 0.27, 0.6], [25.0, 85, 0.27, 0.3], [25.5, 88, 0.28, 0.7],
    [27.0, 86, 0.27, 0.3], [27.5, 83, 0.25, 0.3], [28.2, 83, 0.28, 0.6], [29.2, 86, 0.28, 0.8],
    [62.4, 83, 0.2, 0.5], [64.5, 81, 0.19, 0.5], [65.6, 85, 0.2, 0.8],
]
M["stings"] = [{"t": 55.0, "midi": 35 + 12, "vel": 0.36, "hold": 2.2}]
M["pad"] = [
    {"t0": 0.3, "t1": 10.2, "chord": "D", "level": 0.28, "attack": 2.0, "release": 0.8},
    {"t0": 15.6, "t1": 17.3, "chord": "G", "level": 0.4, "attack": 0.6, "release": 0.6},   # capsule: a bed under the held piano
    {"t0": 17.25, "t1": 18.95, "chord": "D/F#", "level": 0.4, "attack": 0.5, "release": 0.6},
    {"t0": 18.9, "t1": 20.6, "chord": "Em", "level": 0.4, "attack": 0.5, "release": 0.6},
    {"t0": 20.55, "t1": 22.3, "chord": "A", "level": 0.42, "attack": 0.5, "release": 0.6},
    {"t0": 22.2, "t1": 30.2, "chord": "D", "level": 0.3, "attack": 1.0, "release": 0.8},
    {"t0": 38.4, "t1": 46.2, "chord": "Bm", "level": 0.35, "attack": 2.5, "release": 0.8},
    {"t0": 53.6, "t1": 55.05, "chord": "Asus4", "level": 0.95, "attack": 0.8, "release": 0.4},
    {"t0": 55.0, "t1": 56.4, "chord": "Bm", "level": 0.6, "attack": 0.6, "release": 0.6},
    {"t0": 56.35, "t1": 57.75, "chord": "G", "level": 0.75, "attack": 0.5, "release": 0.6},
    {"t0": 57.7, "t1": 59.1, "chord": "Em", "level": 0.9, "attack": 0.5, "release": 0.6},
    {"t0": 59.05, "t1": 60.6, "chord": "F#", "level": 1.0, "attack": 0.4, "release": 1.2},
    {"t0": 66.6, "t1": 70.6, "chord": "Asus4", "level": 0.38, "attack": 1.2, "release": 1.0},
]
M["ducks"] = []
json.dump(c, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print("wrote cues.json:", len(chords), "chords,", len(M["sections"]), "sections")
