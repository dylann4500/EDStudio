#!/usr/bin/env python3
"""Cue sheet for 027 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/027-electrons-vanish/make_cues.py

Sound identity: CURIOUS → CINEMATIC, in E minor (017 was D minor at 96 bpm; this one is 100 bpm with a different progression).
A quiet open: a Tokyo crossing at night (crowd murmur, traffic, the hum of neon). SECOND 0 is SUBTRACTIVE — no electrons means
air molecules can't bump into each other, so there is no sound: every bed stops dead, a sinking "pressure drop" + a braam, and a
soft synth-pluck ostinato with echo enters (the frozen world). Rio, Chicago and New York each get half a second of their own
sound (splash, toaster hum + the toast pop + a bark, chalk + kids) cut off by the same soft thump. The micro beats add high pings,
then a low string drive + taiko from the Tokyo glitter on, booms on the tower, the core, the Earth–Moon collision and the Sun's
arrival, a tom roll into the white-out. Rewind = the city comes back and the score turns warm (G major) for the hug.
The music never drops out once it starts. Times match shots.js SHOTS / story.json."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 65.2
SW, TP, TK, TC = 7.4, 11.95, 15.75, 19.6
B = [0, 3.4, 11.4, 15.2, 19.0, 22.8, 26.8, 31.8, 36.4, 41.0, 45.4, 49.6, 54.8, D]   # shot boundaries
REW = 54.8
BEAT = 0.6                         # 100 bpm

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, 31.8, ["Em", "C", "G", "D"])                                  # the frozen instant + the micro ladder
run(31.8, 49.6, ["Em", "C", "Am", "B"], step=1.2)                      # Paris → orbit → the Moon: cinematic
run(49.6, REW, ["C", "Am", "B", "B"], step=1.3)                        # the Sun: tension
run(REW, D - 0.3, ["G", "D", "Em", "C", "G", "D", "G"], step=1.5)      # rewind: warm turn

S8, S16 = BEAT / 2, BEAT / 4
sections = [
    {"t0": SW, "t1": 22.8, "style": "arp", "vel": [[SW, 0.26], [22.8, 0.27]], "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": 22.8, "t1": 31.8, "style": "arp", "vel": [[22.8, 0.26], [31.8, 0.3]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 31.8, "t1": 49.6, "style": "arp", "vel": [[31.8, 0.29], [49.6, 0.32]], "step": S8, "pattern": [0, 2, 1, 3]},
    {"t0": 49.6, "t1": REW, "style": "arp", "vel": [[49.6, 0.3], [REW, 0.36]], "step": S16, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": REW, "t1": D, "style": "arp", "vel": [[REW, 0.27], [D, 0.24]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
]
strings = [
    {"t0": 26.8, "t1": 41.0, "style": "strings", "vel": [[26.8, 0.14], [41.0, 0.28]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 41.0, "t1": 49.6, "style": "strings", "vel": [[41.0, 0.3], [49.6, 0.36]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.35},
    {"t0": 49.6, "t1": REW, "style": "strings", "vel": [[49.6, 0.34], [REW, 0.44]], "step": S16, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.4},
]
drums = [[SW, 0.8, "boom"], [31.8, 0.45, "taiko"], [33.6, 0.6, "boom"], [36.4, 0.4, "taiko"], [41.0, 0.75, "boom"], [45.4, 0.45, "taiko"],
         [49.35, 0.85, "boom"], [49.6, 0.4, "taiko"], [54.45, 1.0, "boom"], [REW, 0.3, "taiko"]]
drum_patterns = [
    {"t0": 31.8, "t1": 49.5, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[31.8, 0.18], [49.5, 0.3]], "kind": "taiko"},
    {"t0": 53.2, "t1": 54.4, "step": 0.09, "pattern": [1], "vel": [[53.2, 0.1], [54.4, 0.42]], "kind": "tom"},
]
# a 3-note high ping at each new place / scale, rising as the clock sweeps the decades
melody = []
PLACE = [TP - 0.2, TK - 0.2, TC - 0.2, 22.8, 26.8, 31.8, 36.4, 41.0, 45.4, 49.6]
for s0, top in zip(PLACE, [76, 79, 78, 81, 83, 81, 84, 86, 83, 88]):
    melody += [[s0 + 0.05, top, 0.22], [s0 + 0.35, top - 3, 0.19], [s0 + 0.65, top - 5, 0.19]]
melody += [[56.0, 79, 0.26], [56.3, 83, 0.26], [56.6, 86, 0.28], [59.2, 83, 0.22], [59.5, 86, 0.24]]   # the hug
DRONE = [28, 40, 47, 52]           # E1 E2 B2 E3
CHORD_PAD = {"Em": [52, 55, 59], "C": [48, 52, 55], "G": [50, 55, 59], "D": [50, 54, 57], "Am": [52, 57, 60], "B": [51, 54, 59]}
pad = [
    {"t0": SW, "t1": SW + 2.6, "notes": [28, 35, 40, 47, 52], "level": 1.4, "attack": 0.08, "release": 0.8, "cutoff": 900, "hp": 30},   # braam at SECOND 0
    {"t0": SW + 0.3, "t1": 31.85, "notes": DRONE, "level": 0.95, "attack": 0.9, "release": 0.6, "cutoff": 650, "hp": 30},
    {"t0": 31.8, "t1": 49.65, "notes": [28, 35, 40, 47], "level": 1.0, "attack": 0.4, "release": 0.6, "cutoff": 800, "hp": 30},
    {"t0": 41.0, "t1": 43.4, "notes": [28, 35, 40, 47, 52], "level": 1.2, "attack": 0.05, "release": 0.8, "cutoff": 900, "hp": 30},  # the core
    {"t0": 49.6, "t1": REW + 0.05, "notes": [24, 36, 43, 48], "level": 1.0, "attack": 0.5, "release": 0.4, "cutoff": 850, "hp": 30},
    {"t0": REW, "t1": D - 0.3, "notes": [31, 43, 50, 55, 59], "level": 1.0, "attack": 0.6, "release": 1.0, "cutoff": 900, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):          # a soft chord pad that follows the ladder (plucks decay: the pad keeps the floor)
    if SW <= ct < 31.8 or ct >= REW:
        c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
        pad.append({"t0": ct, "t1": (min(c1, 31.8) if ct < 31.8 else c1) + 0.35, "notes": CHORD_PAD[sym], "level": 0.6, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

amb = [
    # Tokyo before SECOND 0: crowd murmur + traffic + the hum of a thousand neon signs. Everything stops dead at SW.
    {"sound": "city_day", "t0": 0.0, "t1": SW + 0.04, "fade_in": 0.4, "fade_out": 0.04, "gain_db": -33, "args": {"murmur": 1.0, "traffic": 0.35}, "seed": 1},
    {"sound": "traffic_flow", "t0": 0.0, "t1": SW + 0.04, "fade_in": 0.4, "fade_out": 0.04, "gain_db": -46, "seed": 1},
    {"sound": "lamp_hum", "t0": 0.0, "t1": SW + 0.04, "fade_in": 0.6, "fade_out": 0.04, "gain_db": -48},
    # Rio: the pool for half a second
    {"sound": "surf", "t0": 11.4, "t1": TP + 0.04, "fade_in": 0.05, "fade_out": 0.04, "gain_db": -40, "args": {"size": 0.35}, "seed": 2},
    {"sound": "city_day", "t0": 11.4, "t1": TP + 0.04, "fade_in": 0.05, "fade_out": 0.04, "gain_db": -40, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 3},
    # Chicago: the toaster's hum + a morning room
    {"sound": "room_tone", "t0": 15.2, "t1": TK + 0.04, "fade_in": 0.05, "fade_out": 0.04, "gain_db": -40},
    {"sound": "lamp_hum", "t0": 15.2, "t1": TK + 0.04, "fade_in": 0.05, "fade_out": 0.04, "gain_db": -40},
    # New York: a class of kids
    {"sound": "city_day", "t0": 19.0, "t1": TC + 0.04, "fade_in": 0.05, "fade_out": 0.04, "gain_db": -40, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 4},
    # the blast: a deep rumble that grows scale by scale (nothing carries sound — it's the score's floor, very low)
    {"sound": "rocket_rumble", "t0": 30.4, "t1": REW + 0.04, "fade_in": 1.4, "fade_out": 0.06, "gain_db": -42, "args": {"rise": 1.0}, "seed": 1},
    {"sound": "wind", "t0": 36.4, "t1": REW + 0.04, "fade_in": 1.0, "fade_out": 0.06, "gain_db": -50, "args": {"darkness": 0.95, "gust": 0.2, "whistle": 0.0}, "seed": 2},
    # rewind: Tokyo is back
    {"sound": "city_day", "t0": REW, "t1": D, "fade_in": 0.25, "fade_out": 1.2, "gain_db": -34, "args": {"murmur": 1.0, "traffic": 0.35}, "seed": 5},
    {"sound": "traffic_flow", "t0": REW, "t1": D, "fade_in": 0.25, "fade_out": 1.2, "gain_db": -47, "seed": 2},
    {"sound": "lamp_hum", "t0": REW, "t1": D, "fade_in": 0.25, "fade_out": 1.2, "gain_db": -50},
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
# Tokyo: the friends' footsteps (stop dead at SECOND 0)
ev.append({"sound": "footsteps", "t0": 3.5, "t1": SW - 0.05, "pan0": -0.1, "pan1": 0.1, "gain_db": -36, "rate": 3.4})
# SECOND 0, and the same soft thump in every place it replays
e(SW, "pressure_drop", -12, 0.0, {"dur": 2.4}, hall=-12)
for tt in (TP, TK, TC):
    e(tt, "pressure_drop", -21, 0.0, {"dur": 1.1}, hall=-16)
# Rio: a swimmer slaps the water, the kid jumps
e(11.45, "water_splash", -24, -0.15, {"size": 0.35})
# Chicago: the toast pops, the dog starts a bark
e(TK - 0.26, "pop", -26, 0.15, {"pitch": 0.8})
e(TK - 0.4, "dog_bark", -30, 0.25, {"pitch": 1.1})
# New York: chalk on the board
e(19.02, "chalk_write", -30, 0.2, {"dur": 0.55, "strokes": 3})
# the atom: the electron clouds vanish (a soft low swell), the nuclei start to drift
e(22.85, "low_swell", -26, 0.0, {"dur": 2.4, "pitch": 1.2})
# Tokyo glitter: everything fizzes apart
e(29.6, "crumble", -26, 0.0, {"dur": 2.2, "size": 0.6})
e(30.6, "low_swell", -22, 0.0, {"dur": 1.6, "pitch": 0.9})
# Paris: the tower goes
e(33.6, "distant_boom", -18, 0.0, {"size": 1.0})
e(33.7, "crumble", -24, 0.0, {"dur": 2.4, "size": 1.4})
# the core (41.0), the planet doubling
e(41.0, "distant_boom", -16, 0.0, {"size": 1.4})
e(43.3, "low_swell", -24, 0.0, {"dur": 2.0, "pitch": 0.7})
# Earth + Moon collide (τ = 0.63 s at 49.6 − ε)
e(48.1, "low_swell", -22, 0.0, {"dur": 1.4, "pitch": 0.8})
e(49.35, "distant_boom", -12, 0.0, {"size": 1.6})
# the Sun: a long swell into the white-out
e(51.2, "low_swell", -22, 0.0, {"dur": 3.3, "pitch": 0.6}, hall=-14)
e(54.45, "distant_boom", -10, 0.0, {"size": 2.0})
# rewind: the hug
e(55.75, "blanket_rustle", -30, -0.1, {"dur": 0.45, "softness": 0.6, "intensity": 0.5})
ev.append({"sound": "footsteps", "t0": REW + 0.1, "t1": 56.0, "pan0": 0.3, "pan1": 0.0, "gain_db": -38, "rate": 4.2})

cues = {
    "title": "027 - What if every electron disappeared? (science: subtractive SECOND 0 -> curious pluck ostinato in E minor -> cinematic strings + taiko -> warm G major rewind)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [64.4, D],
    "stem_gain_db": {"music": -3.0, "sfx": 6.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.3, "feedback": 0.36, "mix": 0.3, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": SW, "midi": 28, "vel": 0.45, "hold": 2.2}, {"t": 41.0, "midi": 28, "vel": 0.4, "hold": 1.8}, {"t": 54.45, "midi": 28, "vel": 0.5, "hold": 2.0}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
