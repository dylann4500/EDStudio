#!/usr/bin/env python3
"""Cue sheet for 010 (tone: whatif, funny-DRAMATIC) -> cues.json.   python3 -I videos/010-giant-height/make_cues.py

Sound identity: a MOCK-EPIC "kaiju march" — C minor, 90 bpm, low spiccato strings (style "strings") stomping in 8ths, soft taiko on
the beats like giant footfalls, a braam + boom when everyone doubles, a boom on every collapse (bed, car, bus, bench), a grand lift
to Eb major for the rebuild, then it deflates to slow pulses for the dunk (the joke). Deadpan text + epic score = the comedy.
Foley is heavy-but-soft: giant_step thuds, wood_snap, bonk, metal_groan, car_crash — all low-passed. Never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 69.5
BEAT = 60 / 90.0                    # 0.667 s
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(0.2, 3.6, ["Cm"])
bar(3.6, 7.0, ["Cm", "Ab"])                                  # everyone asleep: low, quiet
bar(7.0, 10.0, ["Cm", "Fm", "G"])                            # THE GROWTH (braam)
bar(10.0, 17.0, ["Cm", "Ab", "Fm", "G"])                     # the door
bar(17.0, 23.0, ["Cm", "Ab", "Eb", "G"])                     # giants go to work (the march)
bar(23.0, 29.5, ["Cm", "Ab", "Fm", "G"])                     # the car
bar(29.5, 36.5, ["Cm", "Ab", "Eb", "G"])                     # the bus
bar(36.5, 43.0, ["Fm", "Cm", "Ab", "G"])                     # the market time-lapse
bar(43.0, 49.5, ["Cm", "Ab", "Fm", "G"])                     # the bench
bar(49.5, 56.5, ["Eb", "Bb", "Cm", "Ab"])                    # the rebuild: grand, major
bar(56.5, 64.4, ["Ab", "Bb", "Eb", "Eb"])                    # the dunk: deflates
bar(64.4, D, ["Eb"])                                         # end card
drive = [0, 0, 1, 0, 2, 0, 1, 0]
stomp = [0, 0, 0, 1, 0, 0, 2, 0]
S8 = BEAT / 2
sections = [
    {"t0": 0.2, "t1": 3.6, "style": "strings", "vel": 0.16, "step": BEAT, "pattern": [0, 1], "octave": 1, "len": 1.0, "sustain": 0.35},
    {"t0": 3.6, "t1": 7.0, "style": "strings", "vel": [[3.6, 0.17], [7.0, 0.22]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "len": 1.0, "sustain": 0.35},
    {"t0": 7.0, "t1": 10.0, "style": "strings", "vel": [[7.0, 0.42], [10.0, 0.36]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.45},
    {"t0": 10.0, "t1": 49.5, "style": "strings", "vel": [[10.0, 0.3], [23.0, 0.34], [36.5, 0.38], [49.5, 0.42]], "step": S8, "pattern": stomp, "octave": 1, "sustain": 0.3},
    {"t0": 49.5, "t1": 56.5, "style": "strings", "vel": [[49.5, 0.44], [56.5, 0.5]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.55},
    {"t0": 56.5, "t1": 64.4, "style": "strings", "vel": [[56.5, 0.3], [64.4, 0.22]], "step": BEAT, "pattern": [0, 1], "accent": [1.0, 0.6], "octave": 1, "sustain": 0.35, "len": 1.0},
    {"t0": 64.4, "t1": D, "style": "strings", "vel": 0.22, "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.4, "len": 1.0},
]
drums = [[0.25, 0.4, "boom"], [7.0, 0.9, "boom"], [7.0, 0.6, "taiko"], [8.8, 0.7, "boom"],
         [11.05, 0.45, "taiko"], [26.75, 0.85, "boom"], [33.0, 0.85, "boom"], [46.9, 0.85, "boom"],
         [49.5, 0.7, "boom"], [58.6, 0.4, "taiko"], [64.4, 0.6, "boom"]]
drum_patterns = [
    {"t0": 10.0, "t1": 26.6, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[10.0, 0.3], [26.6, 0.4]], "kind": "taiko"},     # footfalls
    {"t0": 27.2, "t1": 46.7, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[27.2, 0.36], [46.7, 0.46]], "kind": "taiko"},
    {"t0": 47.4, "t1": 49.3, "step": 0.1, "pattern": [1], "vel": [[47.4, 0.12], [49.3, 0.5]], "kind": "tom"},                    # roll into the rebuild
    {"t0": 49.5, "t1": 56.4, "step": S8, "pattern": [1, 0, 0.5, 0, 0.85, 0, 0.5, 0.4], "vel": [[49.5, 0.45], [56.4, 0.55]], "kind": "taiko"},
]
melody = [  # a heavy brass-like march motif (doubled at the octave) at the top of each giant beat
    [17.0, 60, 0.32, 1], [17.67, 63, 0.3, 1], [18.33, 67, 0.32, 1], [19.67, 65, 0.3, 1], [20.33, 63, 0.3, 1],
    [29.5, 60, 0.32, 1], [30.17, 63, 0.3, 1], [30.83, 67, 0.33, 1], [32.17, 68, 0.32, 1], [32.83, 67, 0.32, 1],
    [43.0, 60, 0.32, 1], [43.67, 63, 0.32, 1], [44.33, 67, 0.34, 1], [45.67, 65, 0.32, 1], [46.33, 62, 0.34, 1],
    [49.5, 63, 0.38, 1], [50.5, 67, 0.38, 1], [51.25, 70, 0.4, 1], [53.0, 72, 0.42, 1], [54.75, 70, 0.4, 1], [55.5, 67, 0.4, 1],
    [57.2, 67, 0.2], [59.2, 63, 0.18],                                                       # the dunk: deflating
]
DRONE = [24, 36, 43, 48, 55]  # C1 C2 G2 C3 G3
pad = [
    {"t0": 0.2, "t1": 7.05, "notes": DRONE, "level": 1.1, "attack": 1.2, "release": 0.6, "cutoff": 650, "hp": 30},
    {"t0": 7.0, "t1": 10.05, "notes": [24, 31, 36, 43, 48], "level": 1.5, "attack": 0.12, "release": 0.8, "cutoff": 900, "hp": 30},   # braam
    {"t0": 10.0, "t1": 49.55, "notes": DRONE, "level": 0.75, "attack": 0.6, "release": 0.6, "cutoff": 600, "hp": 30},
    {"t0": 49.5, "t1": 56.55, "notes": [27, 39, 46, 51, 58], "level": 0.95, "attack": 0.4, "release": 0.6, "cutoff": 900, "hp": 30},   # Eb lift
    {"t0": 56.5, "t1": D - 0.3, "notes": [32, 44, 51, 56, 63], "level": 0.7, "attack": 0.8, "release": 1.0, "cutoff": 800, "hp": 30},
]

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": 17.05, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -42},
    {"sound": "crickets", "t0": 0.0, "t1": 10.05, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -48, "args": {"count": 3, "density": 0.5}, "seed": 1},
    {"sound": "city_day", "t0": 17.0, "t1": 29.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.3, "traffic": 0.4}, "seed": 1},
    {"sound": "city_day", "t0": 29.5, "t1": 36.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 2},
    {"sound": "room_tone", "t0": 36.5, "t1": 43.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 36.5, "t1": 43.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 3},
    {"sound": "city_day", "t0": 43.0, "t1": 49.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"murmur": 0.2, "traffic": 0.3}, "seed": 4},
    {"sound": "traffic_flow", "t0": 49.5, "t1": 56.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 1},
    {"sound": "city_day", "t0": 56.5, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -46, "args": {"murmur": 0.2, "traffic": 0.3}, "seed": 5},
]
ev = []
def steps(t0, t1, rate, gain, pan0=0.0, pan1=0.0, size=1.0, surface="ground"):
    n = max(1, int((t1 - t0) * rate))
    for k in range(n + 1):
        u = k / n
        ev.append({"t": round(t0 + (t1 - t0) * u, 3), "sound": "giant_step", "args": {"size": size, "surface": surface},
                   "gain_db": gain + (-1.5 if k % 2 else 0), "pan": pan0 + (pan1 - pan0) * u, "room": -16 if surface == "wood" else None})
# bed: the frame snaps; the bedroom: BONK, then heavy steps out the door
ev.append({"t": 7.1, "sound": "blanket_rustle", "args": {"dur": 1.4, "softness": 0.5, "intensity": 1.0, "strokes": 3}, "gain_db": -24, "pan": 0.0, "room": -14})
ev.append({"t": 8.8, "sound": "wood_snap", "args": {"size": 1.2}, "gain_db": -13, "pan": 0.0, "room": -12})
ev.append({"t": 11.05, "sound": "bonk", "gain_db": -15, "pan": -0.1, "room": -12})
steps(12.7, 15.3, 1.4, -21, -0.1, -0.5, 1.1, "wood")
# suburb: front doors + giants walking (the near ones loud, panned with them)
for t0 in (17.2, 18.4, 19.0):
    ev.append({"t": t0 + 0.1, "sound": "door_open", "args": {"creak": 0.4, "pitch": 0.75}, "gain_db": -30, "pan": -0.2, "room": -16})
steps(17.3, 22.8, 1.3, -22, 0.5, -0.4, 1.2)
steps(19.6, 22.8, 1.1, -27, -0.4, 0.2, 1.0)
# car: steps up, sit, CRUNCH
steps(23.15, 25.0, 1.4, -23, 0.4, 0.15, 1.1)
ev.append({"t": 26.75, "sound": "car_crash", "args": {"weight": 1.3}, "gain_db": -12, "pan": 0.15})
ev.append({"t": 26.9, "sound": "metal_groan", "args": {"pitch": 1.2}, "gain_db": -24, "pan": 0.15})
# bus: the 7th giant boards → the suspension bottoms out
steps(31.35, 32.85, 1.5, -24, 0.3, -0.1, 1.1)
ev.append({"t": 33.0, "sound": "metal_groan", "args": {"pitch": 0.8, "dur": 1.8}, "gain_db": -13, "pan": -0.1, "room": -16})
ev.append({"t": 33.05, "sound": "car_crash", "args": {"weight": 0.8}, "gain_db": -24, "pan": -0.1})
# market time-lapse: quick light steps
steps(36.6, 42.9, 3.0, -31, -0.3, 0.3, 0.8)
# bench: steps, sit, SNAP + the giant hits the ground
steps(43.15, 45.2, 1.4, -23, 0.5, 0.0, 1.1)
ev.append({"t": 46.9, "sound": "wood_snap", "args": {"size": 1.4}, "gain_db": -12, "pan": 0.0, "room": -16})
ev.append({"t": 47.15, "sound": "giant_step", "args": {"size": 1.6}, "gain_db": -18, "pan": 0.0})
# rebuild: double-size cars passing
for tt, pan in ((50.6, 0.35), (52.3, -0.35), (54.0, 0.35), (55.7, -0.35)):
    ev.append({"t": tt, "sound": "car_pass", "args": {"dur": 1.8, "size": 1.6}, "gain_db": -22, "pan": pan, "room": -18})
# dunk: the ball swishes through (soft cloth = net) and bounces
ev.append({"t": 58.62, "sound": "blanket_rustle", "args": {"dur": 0.25, "softness": 0.2, "intensity": 0.6}, "gain_db": -26, "pan": 0.1})
for k, (tt, g) in enumerate(((59.25, -22), (59.75, -27), (60.1, -31))):
    ev.append({"t": tt, "sound": "giant_step", "args": {"size": 0.45}, "gain_db": g, "pan": 0.1})
for e in ev:
    if e.get("room") is None:
        e.pop("room", None)

cues = {
    "title": "010 - What if every person's height doubled overnight? (mock-epic kaiju march + heavy foley)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [69.1, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 10.0},   # heavy foley is the point: thuds/crunches sit ~10 dB under the score, not 30
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": [0, 10.0, 17.0, 23.0, 29.5, 36.5, 43.0, 49.5, 56.5, 64.4, D],
    "ambience": amb, "events": ev,
    "music": {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": -6.0, "pad_reverb_db": -4.0, "strings_db": 8.0, "drums_db": -7.0,
              "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": 7.0, "midi": 24, "vel": 0.5, "hold": 2.5}, {"t": 64.4, "midi": 27, "vel": 0.4, "hold": 2.5}],
              "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0}, "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
