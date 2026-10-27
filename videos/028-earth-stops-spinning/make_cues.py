#!/usr/bin/env python3
"""Cue sheet for 028 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/028-earth-stops-spinning/make_cues.py

Sound identity: "MOMENTUM" — glassy echoing BELLS in F-sharp minor at 108 bpm (017 was a D-minor pluck at 96, 027 an E-minor
pluck at 100), progression i–iv–VI–V (F#m Bm D C#). A quiet open: Quito's plaza (voices, the fountain, pigeons). SECOND 0 =
the planet stopping: a sub "pressure drop" + a boom + a braam, and under every place a deep slowed rumble of the bolted world
meeting the wind. The bells enter there and climb place by place (a 3-note ping per place, rising); a low string drive + soft
taiko join in Texas. The pole is nearly silent (soft wind, snow crunches). EARTH SPINS AGAIN = a second boom, then the score
turns warm and bouncy in A major (the relative major) for the aftermath gags, with a soft impact on every landing; the pole
ending resolves on D → A. The music never drops out once it starts. Times match shots.js SHOTS + story.json."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 60.6
SW, RS = 7.6, 33.8
B = [0, 3.4, 8.2, 12.6, 16.4, 20.6, 25.0, 29.4, 33.8, 38.2, 41.0, 43.8, 46.8, 50.2, D]   # shot boundaries
BEAT = 60 / 108                     # 108 bpm
S8 = BEAT / 2
END = 55.8                          # final fade starts (end card at 56.4)

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, 25.0, ["F#m", "Bm", "D", "C#"])                                # the slow-motion ladder
run(25.0, RS, ["F#m", "D", "Bm", "C#"], step=BEAT * 1.5)               # Maine → the pole: tighter, toward the dominant
run(RS, 50.2, ["A", "E", "F#m", "D"], step=2 * BEAT)                   # the spin is back: warm, bouncy aftermath
run(50.2, D - 0.3, ["D", "A", "E", "A", "D", "E", "A"], step=1.4)      # Dave's coffee + the end card

sections = [
    {"t0": SW, "t1": 20.6, "style": "arp", "vel": [[SW, 0.24], [20.6, 0.27]], "step": S8, "pattern": [0, 2, 1, 3]},
    {"t0": 20.6, "t1": RS, "style": "arp", "vel": [[20.6, 0.27], [RS, 0.31]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": RS, "t1": 50.2, "style": "arp", "vel": [[RS, 0.29], [50.2, 0.27]], "step": S8, "pattern": [0, 2, 3, 1]},
    {"t0": 50.2, "t1": D, "style": "arp", "vel": [[50.2, 0.25], [D, 0.22]], "step": 0.35, "pattern": [0, 1, 2, 3, 2, 1]},
]
strings = [
    {"t0": 20.6, "t1": RS, "style": "strings", "vel": [[20.6, 0.16], [RS, 0.28]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": RS, "t1": 50.2, "style": "strings", "vel": [[RS, 0.26], [50.2, 0.22]], "step": S8, "pattern": [0, 1, 0, 2, 0, 1, 0, 2], "octave": 1, "sustain": 0.3},
]
drums = [[SW, 0.9, "boom"], [25.0, 0.4, "taiko"], [29.4, 0.35, "taiko"], [RS, 1.0, "boom"], [RS, 0.6, "taiko"],
         [38.55, 0.55, "boom"], [42.1, 0.7, "boom"], [43.9, 0.5, "boom"], [47.48, 0.75, "boom"], [56.4, 0.35, "taiko"]]
drum_patterns = [
    {"t0": 25.0, "t1": 33.6, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[25.0, 0.16], [33.6, 0.28]], "kind": "taiko"},
    {"t0": 32.6, "t1": 33.75, "step": 0.09, "pattern": [1], "vel": [[32.6, 0.08], [33.75, 0.36]], "kind": "tom"},
    {"t0": 34.5, "t1": 50.0, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[34.5, 0.3], [50.0, 0.24]], "kind": "taiko"},
]
# a 3-note bell "ping" as each new place appears, climbing; a little A-major hook for the aftermath; Dave's toast
melody = []
for s0, top in zip([12.6, 16.4, 20.6, 25.0, 29.4], [78, 81, 83, 85, 88]):
    melody += [[s0 + 0.06, top, 0.22], [s0 + 0.34, top - 4, 0.19], [s0 + 0.62, top - 7, 0.19]]
for s0 in (38.2, 41.0, 43.8, 46.8):
    melody += [[s0 + 0.1, 81, 0.2], [s0 + 0.38, 85, 0.2], [s0 + 0.66, 88, 0.22]]
melody += [[51.7, 81, 0.24], [52.0, 85, 0.25], [52.3, 88, 0.27], [53.4, 85, 0.22], [53.7, 81, 0.2]]
DRONE_A = [30, 42, 49, 54]          # F#1 F#2 C#3 F#3
DRONE_B = [33, 45, 52, 57]          # A1 A2 E3 A3
CHORD_PAD = {"F#m": [54, 57, 61], "Bm": [47, 50, 54], "D": [50, 54, 57], "C#": [49, 53, 56], "A": [45, 49, 52], "E": [52, 56, 59]}
pad = [
    {"t0": SW, "t1": SW + 2.6, "notes": [30, 37, 42, 49, 54], "level": 1.4, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30},   # braam: the stop
    {"t0": SW + 0.3, "t1": RS + 0.05, "notes": DRONE_A, "level": 0.95, "attack": 0.9, "release": 0.5, "cutoff": 650, "hp": 30},
    {"t0": RS, "t1": RS + 2.2, "notes": [33, 40, 45, 52, 57], "level": 1.3, "attack": 0.06, "release": 0.8, "cutoff": 900, "hp": 30},  # the restart
    {"t0": RS + 0.2, "t1": 50.25, "notes": DRONE_B, "level": 0.9, "attack": 0.5, "release": 0.5, "cutoff": 700, "hp": 30},
    {"t0": 50.2, "t1": D - 0.3, "notes": [38, 45, 50, 57], "level": 0.95, "attack": 0.6, "release": 1.0, "cutoff": 800, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):          # a soft chord pad that follows the harmony (bells decay; the pad keeps the floor)
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.6, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

def bed(sound, t0, t1, gain, args=None, seed=1, fi=0.05, fo=0.06):
    d = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": gain, "seed": seed}
    if args: d["args"] = args
    return d
amb = [
    # Quito, before: voices + the fountain (quiet open)
    bed("city_day", 0.0, 8.25, -32, {"murmur": 1.0, "traffic": 0.1}, 1, fi=0.4),
    bed("surf", 0.0, 8.25, -42, {"size": 0.25}, 1, fi=0.4),
    # the slow-motion second: under every place a deep slowed rumble (the bolted world meeting the wind)
    bed("rocket_rumble", SW, RS + 0.1, -42, None, 2, fi=0.3, fo=0.25),
    bed("wind", 8.2, 12.65, -40, {"darkness": 0.95, "gust": 0.25, "whistle": 0.0}, 2),
    bed("city_day", 8.2, 12.65, -50, {"murmur": 1.0, "traffic": 0.0}, 3),
    # Rio: the water rushing to the deep end
    bed("surf", 12.6, 16.45, -30, {"size": 1.2}, 2),
    bed("city_day", 12.6, 16.45, -48, {"murmur": 0.7, "traffic": 0.0}, 4),
    # New York: traffic + voices, muffled by the slow motion
    bed("traffic_flow", 16.4, 20.65, -40, None, 1),
    bed("city_day", 16.4, 20.65, -42, {"murmur": 0.9, "traffic": 0.5}, 5),
    # Texas: the Mach 1.2 wind roars through everything bolted down; leaves; the mower
    bed("wind", 20.6, 25.05, -29, {"darkness": 0.45, "gust": 0.9, "whistle": 0.08}, 3),
    bed("dry_leaves", 20.6, 25.05, -36, {"density": 2.0}, 1),
    bed("turbines", 20.6, 25.05, -46, {"rate": 9.0}, 2),
    # Maine: the whole ocean on the move
    bed("surf", 25.0, 29.45, -27, {"size": 1.5}, 3),
    bed("wind", 25.0, 29.45, -41, {"darkness": 0.5, "gust": 0.5, "whistle": 0.04}, 4),
    # the South Pole: almost nothing
    bed("wind", 29.4, RS + 0.05, -43, {"darkness": 0.3, "gust": 0.2, "whistle": 0.05}, 5),
    # the spin comes back: each place's bed again, at full size
    bed("city_day", RS, 38.25, -36, {"murmur": 1.0, "traffic": 0.1}, 6, fi=0.3),
    bed("traffic_flow", 38.2, 41.05, -40, None, 2),
    bed("city_day", 38.2, 41.05, -42, {"murmur": 0.9, "traffic": 0.4}, 7),
    bed("surf", 41.0, 43.85, -40, {"size": 0.4}, 4),
    bed("turbines", 43.8, 46.85, -44, {"rate": 9.0}, 3),
    bed("dry_leaves", 43.8, 46.85, -42, {"density": 0.8}, 2),
    bed("surf", 46.8, 50.25, -26, {"size": 1.6}, 5),
    bed("wind", 50.2, D, -43, {"darkness": 0.3, "gust": 0.2, "whistle": 0.05}, 6, fo=1.2),
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
# Quito: pigeons, the kid's hops (soft), the selfie
for k, tt in enumerate((1.2, 4.1, 6.3)):
    e(tt, "blanket_rustle", -36, (k - 1) * 0.3, {"dur": 0.4, "softness": 0.5, "intensity": 0.6, "strokes": 3})
for tt in (4.62, 5.24, 5.86, 6.48, 7.1):
    e(tt, "footstep", -38, -0.15, {"weight": 0.3, "scuff": 0.4})
e(6.9, "lamp_switch_click", -36, 0.1)
# SECOND 0: the planet stops
e(SW, "pressure_drop", -11, 0.0, {"dur": 2.6}, hall=-12)
e(SW, "distant_boom", -13, 0.0, {"size": 1.6})
# Rio: the water slams into the deep end and goes up the wall
e(12.75, "water_splash", -14, 0.2, {"size": 1.4})
e(13.0, "low_swell", -24, 0.1, {"dur": 3.0, "pitch": 0.8}, hall=-14)
e(14.4, "water_splash", -20, 0.3, {"size": 0.8})
# New York: a far horn, slowed
e(19.4, "car_horn", -36, -0.3, {"dur": 0.9, "pitch": 0.6, "distance": 2.0})
# Texas: shingles + pickets rattle past (soft wood ticks)
for k, tt in enumerate((21.3, 22.4, 23.6)):
    e(tt, "wood_snap", -34, (k - 1) * 0.35)
# Maine: a long low rush as the sea leaves
e(25.2, "low_swell", -22, 0.0, {"dur": 4.0, "pitch": 0.6}, hall=-14)
# the pole: snow crunches as they jog, a mug clink
t = 29.5
while t < RS - 0.1:
    e(t, "footstep", -38, 0.1 * ((round(t / 0.4) % 2) * 2 - 1), {"weight": 0.45, "scuff": 1.4}); t += 0.4
# EARTH SPINS AGAIN
e(RS, "distant_boom", -12, 0.0, {"size": 1.5})
for k, tt in enumerate((34.1, 34.16, 34.22, 34.3, 34.4, 34.55)):
    e(tt, "giant_step", -20 - k, (k % 3 - 1) * 0.3, {"size": 0.55})
e(36.0, "blanket_rustle", -32, 0.3, {"dur": 0.5, "softness": 0.5, "intensity": 0.7, "strokes": 4})   # pigeons take off
# New York aftermath: skids, the cart tips, people sit down hard, the dog's boof
e(38.3, "metal_groan", -30, 0.25, {"pitch": 2.2, "dur": 0.6})
e(38.6, "car_crash", -24, -0.1, {"weight": 0.15})
for k, tt in enumerate((38.62, 38.7, 38.78)):
    e(tt, "giant_step", -24 - k, (k - 1) * 0.3, {"size": 0.4})
e(39.9, "dog_bark", -30, -0.2, {"pitch": 1.1})
# Rio: the water comes down
e(41.2, "low_swell", -22, 0.1, {"dur": 1.0, "pitch": 1.2})
e(42.1, "water_splash", -8, 0.0, {"size": 2.2})
# Texas: dad lands; the mower keeps going; the neighbor's dog
e(43.9, "giant_step", -18, 0.1, {"size": 0.7})
e(43.95, "metal_clang", -30, 0.2, {"size": 0.4, "pitch": 1.4})
e(45.4, "dog_bark", -32, -0.3, {"pitch": 0.9})
# Maine: the Atlantic slams back into the islet
e(47.48, "water_splash", -7, 0.0, {"size": 3.0})
e(47.5, "distant_boom", -18, 0.0, {"size": 1.2})
# the pole: Dave stops, raises the mug, sips
t = 50.25
while t < 51.4:
    e(t, "footstep", -38, 0.1, {"weight": 0.45, "scuff": 1.4}); t += 0.4
e(52.95, "slurp", -30, 0.05)

cues = {
    "title": "028 - What if Earth stopped spinning for one second? (science: bell ostinato F#m 108 bpm -> A-major aftermath, scene beds)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.5, D],
    "stem_gain_db": {"music": -3.0, "sfx": 6.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "bell", "echo": {"delay": BEAT * 0.75, "feedback": 0.34, "mix": 0.28, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": SW, "midi": 30, "vel": 0.45, "hold": 2.2}, {"t": RS, "midi": 33, "vel": 0.45, "hold": 2.0}],
              "ducks": [{"t0": 29.6, "t1": 33.5, "db": -3.0}], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
