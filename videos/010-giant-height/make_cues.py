#!/usr/bin/env python3
"""Cue sheet for 010 (tone: whatif, funny-DRAMATIC) -> cues.json.   python3 -I videos/010-giant-height/make_cues.py

Sound identity: a MOCK-EPIC "kaiju march" — C minor, 90 bpm, low spiccato strings (style "strings") stomping in 8ths, soft taiko on
the beats like giant footfalls, a braam + boom when everyone doubles, a boom on every collapse (bed, car, bus, bench), a grand lift
to Eb major for the rebuild, then it deflates to slow pulses for the dunk (the joke). Deadpan text + epic score = the comedy.
Foley is heavy-but-soft: giant_step thuds, wood_snap, bonk, metal_groan, car_crash — all low-passed. Never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 71.0
BEAT = 60 / 90.0                    # 0.667 s
GROW = 4.2                          # the music ENTERS here (quiet open: crickets + a snore — user steer, like 007)
B = [0, 6.6, 11.8, 17.2, 22.4, 27.6, 33.2, 38.8, 44.4, 49.8, 55.2, 60.4, 66.4, D]   # beat boundaries (shots.js SHOTS)
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(GROW, 6.6, ["Cm"])
for k, (a, b) in enumerate(zip(B[1:10], B[2:11])):
    bar(a, b, [["Cm", "Ab", "Fm", "G"], ["Cm", "Ab", "Eb", "G"]][k % 2])
bar(55.2, 60.4, ["Eb", "Bb", "Cm", "Ab"])                    # the rebuild: grand, major
bar(60.4, 66.4, ["Ab", "Bb", "Eb"])                          # the dunk: deflates
bar(66.4, D, ["Eb"])                                         # end card
drive = [0, 0, 1, 0, 2, 0, 1, 0]
stomp = [0, 0, 0, 1, 0, 0, 2, 0]
S8 = BEAT / 2
sections = [
    {"t0": GROW, "t1": 6.6, "style": "strings", "vel": [[GROW, 0.42], [6.6, 0.36]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.45},
    {"t0": 6.6, "t1": 55.2, "style": "strings", "vel": [[6.6, 0.3], [27.6, 0.34], [44.4, 0.38], [55.2, 0.42]], "step": S8, "pattern": stomp, "octave": 1, "sustain": 0.3},
    {"t0": 55.2, "t1": 60.4, "style": "strings", "vel": [[55.2, 0.44], [60.4, 0.5]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.55},
    {"t0": 60.4, "t1": 66.4, "style": "strings", "vel": [[60.4, 0.3], [66.4, 0.22]], "step": BEAT, "pattern": [0, 1], "accent": [1.0, 0.6], "octave": 1, "sustain": 0.35, "len": 1.0},
    {"t0": 66.4, "t1": D, "style": "strings", "vel": 0.22, "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.4, "len": 1.0},
]
drums = [[GROW, 0.9, "boom"], [GROW, 0.6, "taiko"], [5.6, 0.7, "boom"], [7.45, 0.4, "taiko"], [20.1, 0.55, "taiko"],
         [31.35, 0.85, "boom"], [36.7, 0.85, "boom"], [52.9, 0.85, "boom"], [55.2, 0.7, "boom"], [62.5, 0.4, "taiko"], [66.4, 0.6, "boom"]]
drum_patterns = [
    {"t0": 6.6, "t1": 31.2, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[6.6, 0.3], [31.2, 0.4]], "kind": "taiko"},     # footfalls
    {"t0": 31.8, "t1": 52.7, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[31.8, 0.36], [52.7, 0.46]], "kind": "taiko"},
    {"t0": 53.4, "t1": 55.1, "step": 0.1, "pattern": [1], "vel": [[53.4, 0.12], [55.1, 0.5]], "kind": "tom"},                    # roll into the rebuild
    {"t0": 55.2, "t1": 60.3, "step": S8, "pattern": [1, 0, 0.5, 0, 0.85, 0, 0.5, 0.4], "vel": [[55.2, 0.45], [60.3, 0.55]], "kind": "taiko"},
]
def motif(t0, notes):
    return [[round(t0 + k * BEAT, 3), m, v, 1] for k, (m, v) in enumerate(notes)]
melody = motif(17.2, [(60, .32), (63, .3), (67, .32), (65, .3), (63, .3)]) + motif(33.2, [(60, .32), (63, .3), (67, .33), (68, .32), (67, .32)]) \
       + motif(49.8, [(60, .32), (63, .32), (67, .34), (65, .32), (62, .34)]) + motif(55.2, [(63, .38), (67, .38), (70, .4), (72, .42), (70, .4), (67, .4)]) \
       + [[61.2, 67, 0.2], [63.2, 63, 0.18]]
DRONE = [24, 36, 43, 48, 55]  # C1 C2 G2 C3 G3
pad = [
    {"t0": GROW, "t1": 6.65, "notes": [24, 31, 36, 43, 48], "level": 1.5, "attack": 0.12, "release": 0.8, "cutoff": 900, "hp": 30},   # braam
    {"t0": 6.6, "t1": 55.25, "notes": DRONE, "level": 0.75, "attack": 0.6, "release": 0.6, "cutoff": 600, "hp": 30},
    {"t0": 55.2, "t1": 60.45, "notes": [27, 39, 46, 51, 58], "level": 0.95, "attack": 0.4, "release": 0.6, "cutoff": 900, "hp": 30},   # Eb lift
    {"t0": 60.4, "t1": D - 0.3, "notes": [32, 44, 51, 56, 63], "level": 0.7, "attack": 0.8, "release": 1.0, "cutoff": 800, "hp": 30},
]

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": 11.85, "fade_in": 0.6, "fade_out": 0.06, "gain_db": -40},
    {"sound": "crickets", "t0": 0.0, "t1": 6.65, "fade_in": 0.8, "fade_out": 0.06, "gain_db": -42, "args": {"count": 3, "density": 0.5}, "seed": 1},
    {"sound": "turbines", "t0": 6.6, "t1": 11.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"rate": 2.2}, "seed": 3},   # the ceiling fan's whoosh
    {"sound": "room_tone", "t0": 11.8, "t1": 17.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 17.2, "t1": 33.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.3, "traffic": 0.4}, "seed": 1},
    {"sound": "city_day", "t0": 33.2, "t1": 38.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 2},
    {"sound": "cabin_hum", "t0": 38.8, "t1": 44.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -36, "seed": 1},
    {"sound": "room_tone", "t0": 44.4, "t1": 49.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 44.4, "t1": 49.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 3},
    {"sound": "city_day", "t0": 49.8, "t1": 55.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"murmur": 0.2, "traffic": 0.3}, "seed": 4},
    {"sound": "traffic_flow", "t0": 55.2, "t1": 60.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 1},
    {"sound": "city_day", "t0": 60.4, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -46, "args": {"murmur": 0.2, "traffic": 0.3}, "seed": 5},
]
ev = []
def steps(t0, t1, rate, gain, pan0=0.0, pan1=0.0, size=1.0, surface="ground"):
    n = max(1, int((t1 - t0) * rate))
    for k in range(n + 1):
        u = k / n
        ev.append({"t": round(t0 + (t1 - t0) * u, 3), "sound": "giant_step", "args": {"size": size, "surface": surface},
                   "gain_db": gain + (-1.5 if k % 2 else 0), "pan": pan0 + (pan1 - pan0) * u, "room": -16 if surface == "wood" else None})
# quiet open: snores, then the growth (blanket heave), the frame snaps
for t0 in (0.5, 2.3):
    ev.append({"t": t0, "sound": "snore", "args": {"dur": 1.8}, "gain_db": -26, "pan": -0.05, "room": -16})
ev.append({"t": 4.25, "sound": "blanket_rustle", "args": {"dur": 1.2, "softness": 0.5, "intensity": 1.0, "strokes": 3}, "gain_db": -22, "pan": 0.0, "room": -14})
ev.append({"t": 5.6, "sound": "wood_snap", "args": {"size": 1.2}, "gain_db": -13, "pan": 0.0, "room": -12})
ev.append({"t": 7.45, "sound": "bonk", "gain_db": -15, "pan": -0.1, "room": -12})
steps(9.1, 11.7, 1.4, -21, -0.1, -0.5, 1.1, "wood")
# kitchen: the sip
ev.append({"t": 14.45, "sound": "slurp", "args": {"dur": 0.8}, "gain_db": -24, "pan": -0.15, "room": -16})
# suburb: front doors + giants; a porch roof cracks
for t0 in (17.3, 18.0, 19.0):
    ev.append({"t": t0 + 0.1, "sound": "door_open", "args": {"creak": 0.4, "pitch": 0.75}, "gain_db": -30, "pan": -0.2, "room": -16})
steps(17.3, 22.3, 1.3, -22, 0.5, -0.4, 1.2)
ev.append({"t": 20.1, "sound": "wood_snap", "args": {"size": 1.0}, "gain_db": -15, "pan": -0.2})
# dog walk: big slow steps + a tiny scramble of paws; then the boofs
steps(22.5, 25.2, 1.2, -24, 0.0, 0.1, 1.1)
for k in range(14):
    ev.append({"t": round(22.5 + k * 0.19, 3), "sound": "footstep", "args": {"weight": 0.3, "scuff": 0.4}, "gain_db": -38, "pan": 0.25})
for tt in (25.62, 25.95, 26.55):
    ev.append({"t": tt, "sound": "dog_bark", "args": {"pitch": 1.0}, "gain_db": -22, "pan": 0.25})
# car: steps up, sit, CRUNCH, then the alarm
steps(27.75, 29.6, 1.4, -23, 0.4, 0.15, 1.1)
ev.append({"t": 31.35, "sound": "car_crash", "args": {"weight": 1.3}, "gain_db": -12, "pan": 0.15})
ev.append({"t": 31.5, "sound": "metal_groan", "args": {"pitch": 1.2}, "gain_db": -24, "pan": 0.15})
for k, tt in enumerate((31.7, 32.3, 32.9)):
    ev.append({"t": tt, "sound": "car_horn", "args": {"dur": 0.35, "pitch": 1.0, "distance": 0.2}, "gain_db": -28, "pan": 0.15})
# bus: the 7th giant boards → the suspension bottoms out
steps(35.05, 36.55, 1.5, -24, 0.3, -0.1, 1.1)
ev.append({"t": 36.7, "sound": "metal_groan", "args": {"pitch": 0.8, "dur": 1.8}, "gain_db": -13, "pan": -0.1, "room": -16})
ev.append({"t": 36.75, "sound": "car_crash", "args": {"weight": 0.8}, "gain_db": -24, "pan": -0.1})
# plane: the cart rattles up the aisle (soft)
for k in range(8):
    ev.append({"t": round(39.2 + k * 0.6, 3), "sound": "plush_place", "gain_db": -36, "pan": 0.0, "room": -16})
# market time-lapse: quick light steps
steps(44.5, 49.7, 3.0, -31, -0.3, 0.3, 0.8)
# bench: steps, sit, SNAP + the giant hits the ground
steps(49.85, 51.2, 1.4, -23, 0.5, 0.0, 1.1)
ev.append({"t": 52.9, "sound": "wood_snap", "args": {"size": 1.4}, "gain_db": -12, "pan": 0.0, "room": -16})
ev.append({"t": 53.15, "sound": "giant_step", "args": {"size": 1.6}, "gain_db": -18, "pan": 0.0})
# rebuild: double-size cars passing
for tt, pan in ((56.3, 0.35), (58.0, -0.35), (59.7, 0.35)):
    ev.append({"t": tt, "sound": "car_pass", "args": {"dur": 1.8, "size": 1.6}, "gain_db": -22, "pan": pan, "room": -18})
# dunk: the ball swishes through and bounces
ev.append({"t": 62.52, "sound": "blanket_rustle", "args": {"dur": 0.25, "softness": 0.2, "intensity": 0.6}, "gain_db": -26, "pan": 0.1})
for tt, g in ((63.15, -22), (63.65, -27), (64.0, -31)):
    ev.append({"t": tt, "sound": "giant_step", "args": {"size": 0.45}, "gain_db": g, "pan": 0.1})
for e in ev:
    if e.get("room") is None:
        e.pop("room", None)

cues = {
    "title": "010 - What if every person's height doubled overnight? (mock-epic kaiju march + heavy foley)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [70.6, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 10.0},   # heavy foley is the point: thuds/crunches sit ~10 dB under the score, not 30
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": -6.0, "pad_reverb_db": -4.0, "strings_db": 8.0, "drums_db": -7.0,
              "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": GROW, "midi": 24, "vel": 0.5, "hold": 2.5}, {"t": 66.4, "midi": 27, "vel": 0.4, "hold": 2.5}],
              "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0}, "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
