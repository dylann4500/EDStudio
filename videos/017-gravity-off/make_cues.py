#!/usr/bin/env python3
"""Cue sheet for 017 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/017-gravity-off/make_cues.py

Sound identity: CURIOUS → CINEMATIC. A quiet open (a stadium murmur, the kick, the roar), then SECOND 0: a sinking sub
"pressure drop" + a braam, the roar falls away, and a slow synth-pluck ostinato with echo enters over a D-minor drone — the
world in slow motion. It builds place by place (8ths at the ocean, low string drive + soft taiko from the bungee on, 16ths and
a tom roll into the countdown). GRAVITY BACK = a boom and the strings stomp under the landings (car crashes, the ocean slam,
the dive), then it turns warm in F major for the judges' 10 · 10 · 10. Every place has its own bed (crowd, kitchen fan,
pool, traffic, surf, gorge wind, plaza fountain). Never drops out once it starts. Times match shots.js SHOTS / tau()."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 73.8
SW, BACK = 8.2, 53.0
B = [0, 3.4, 9.4, 14.2, 19.0, 23.8, 28.6, 33.4, 38.2, 43.0, 47.8, 53.0, 55.6, 58.0, 60.4, 62.2, 65.6, D]   # shot boundaries
BEAT = 0.625                       # 96 bpm

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, 47.8, ["Dm", "Bb", "F", "C"])                                   # the slow-motion ladder: i–VI–III–VII
run(47.8, BACK, ["Gm", "Bb", "Gm", "A"], step=1.3)                      # countdown: tension toward the dominant
run(BACK, 65.6, ["Dm", "Bb", "Gm", "A"], step=1.25)                     # gravity is back: the landings
run(65.6, D - 0.3, ["F", "C", "Dm", "Bb", "F", "C", "F"], step=1.2)     # warm turn: the judges, the end card

S8, S16 = BEAT / 2, BEAT / 4
sections = [
    {"t0": SW, "t1": 28.6, "style": "arp", "vel": [[SW, 0.28], [19.0, 0.29], [28.6, 0.29]], "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": 28.6, "t1": 47.8, "style": "arp", "vel": [[28.6, 0.27], [38.2, 0.3], [47.8, 0.32]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 47.8, "t1": BACK, "style": "arp", "vel": [[47.8, 0.3], [BACK, 0.36]], "step": S16, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": BACK, "t1": 65.6, "style": "arp", "vel": 0.3, "step": S8, "pattern": [0, 2, 1, 3]},
    {"t0": 65.6, "t1": D, "style": "arp", "vel": [[65.6, 0.27], [D, 0.25]], "step": 0.4, "pattern": [0, 1, 2, 3, 2, 1]},
]
# low string drive under the plucks: drawn as M["layers"] (synth.py draws layer sections on top of the main section)
strings = [
    {"t0": 33.4, "t1": 47.8, "style": "strings", "vel": [[33.4, 0.18], [47.8, 0.3]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 47.8, "t1": BACK, "style": "strings", "vel": [[47.8, 0.3], [BACK, 0.42]], "step": S16, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.4},
    {"t0": BACK, "t1": 65.6, "style": "strings", "vel": [[BACK, 0.42], [65.6, 0.34]], "step": S8, "pattern": [0, 0, 0, 1, 0, 0, 2, 0], "octave": 1, "sustain": 0.35},
]
drums = [[SW, 0.85, "boom"], [28.6, 0.35, "taiko"], [33.4, 0.45, "taiko"], [38.2, 0.4, "taiko"], [43.0, 0.3, "taiko"], [47.8, 0.5, "boom"],
         [BACK, 1.0, "boom"], [BACK, 0.7, "taiko"], [54.8, 0.6, "taiko"], [57.2, 0.75, "boom"], [59.8, 0.85, "boom"], [65.05, 0.6, "boom"], [65.6, 0.35, "taiko"]]
drum_patterns = [
    {"t0": 33.4, "t1": 47.7, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[33.4, 0.18], [47.7, 0.3]], "kind": "taiko"},
    {"t0": 51.6, "t1": 52.95, "step": 0.09, "pattern": [1], "vel": [[51.6, 0.1], [52.95, 0.45]], "kind": "tom"},
    {"t0": 53.6, "t1": 65.5, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": [[53.6, 0.38], [65.5, 0.3]], "kind": "taiko"},
]
# a 3-note "ping" at the start of each place (high pluck), rising place by place
melody = []
PLACE = [14.2, 19.0, 23.8, 28.6, 33.4, 38.2, 43.0, 47.8]
for s0, top in zip(PLACE, [74, 77, 76, 79, 81, 79, 84, 86]):
    melody += [[s0 + 0.05, top, 0.24], [s0 + 0.36, top - 3, 0.2], [s0 + 0.67, top - 5, 0.2]]
melody += [[66.5, 77, 0.28], [66.8, 81, 0.28], [67.1, 84, 0.3], [70.0, 81, 0.24], [70.3, 84, 0.26]]   # 10 · 10 · 10
DRONE = [26, 38, 45, 50]           # D1 D2 A2 D3
CHORD_PAD = {"Dm": [50, 53, 57], "Bb": [46, 50, 53], "F": [45, 48, 53], "C": [48, 52, 55]}
pad = [
    {"t0": SW, "t1": SW + 2.5, "notes": [26, 33, 38, 45, 50], "level": 1.4, "attack": 0.1, "release": 0.8, "cutoff": 900, "hp": 30},   # braam at SECOND 0
    {"t0": SW + 0.3, "t1": 47.85, "notes": DRONE, "level": 0.95, "attack": 0.9, "release": 0.6, "cutoff": 650, "hp": 30},
    {"t0": 47.8, "t1": BACK + 0.05, "notes": [31, 43, 50, 55], "level": 0.95, "attack": 0.5, "release": 0.4, "cutoff": 800, "hp": 30},
    {"t0": BACK, "t1": 65.65, "notes": [26, 33, 38, 45, 50], "level": 1.0, "attack": 0.05, "release": 0.6, "cutoff": 900, "hp": 30},
    {"t0": 65.6, "t1": D - 0.3, "notes": [29, 41, 48, 53, 57], "level": 1.05, "attack": 0.6, "release": 1.0, "cutoff": 900, "hp": 30},
]

for i, (ct, sym) in enumerate(chords):          # a soft chord pad that follows the ladder (plucks decay: the pad keeps the floor)
    if SW <= ct < 47.8 or ct >= 65.6:
        c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
        pad.append({"t0": ct, "t1": (min(c1, 47.8) if ct < 47.8 else c1) + 0.35, "notes": CHORD_PAD[sym], "level": 0.62 if (ct < 28.6 or ct >= 65.6) else 0.5, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

amb = [
    # stadium, before: a big murmur that leans in; the roar at the goal; at SECOND 0 it falls away to a muffled hush
    {"sound": "city_day", "t0": 0.0, "t1": 8.6, "fade_in": 0.3, "fade_out": 0.35, "gain_db": -36, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 1},
    {"sound": "crowd_cheer", "t0": 0.0, "t1": 7.6, "fade_in": 0.3, "fade_out": 0.05, "gain_db": -42, "args": {"excite": 0.4}, "seed": 2},
    {"sound": "crowd_cheer", "t0": 7.6, "t1": 8.75, "fade_in": 0.08, "fade_out": 0.55, "gain_db": -31, "args": {"excite": 1.2}, "seed": 3},
    {"sound": "city_day", "t0": 8.2, "t1": 14.25, "fade_in": 0.5, "fade_out": 0.06, "gain_db": -50, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 4},
    {"sound": "wind", "t0": 8.2, "t1": 14.25, "fade_in": 0.6, "fade_out": 0.06, "gain_db": -48, "args": {"darkness": 0.9, "gust": 0.2, "whistle": 0.0}, "seed": 1},
    # Ohio kitchen: room tone + the ceiling fan
    {"sound": "room_tone", "t0": 14.2, "t1": 19.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "turbines", "t0": 14.2, "t1": 19.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52, "args": {"rate": 2.2}, "seed": 3},
    # Budapest pool: a soft wash + far voices
    {"sound": "surf", "t0": 19.0, "t1": 23.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"size": 0.3}, "seed": 1},
    {"sound": "city_day", "t0": 19.0, "t1": 23.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"murmur": 0.8, "traffic": 0.0}, "seed": 5},
    # Texas interstate: traffic + wind
    {"sound": "traffic_flow", "t0": 23.8, "t1": 28.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "seed": 1},
    {"sound": "wind", "t0": 23.8, "t1": 28.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.6, "gust": 0.4, "whistle": 0.0}, "seed": 2},
    # Maine: the sea against the rocks, getting bigger as it rises
    {"sound": "surf", "t0": 28.6, "t1": 33.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -34, "args": {"size": 1.0}, "seed": 2},
    {"sound": "wind", "t0": 28.6, "t1": 33.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.5, "gust": 0.5, "whistle": 0.05}, "seed": 3},
    # Victoria Falls: gorge wind + the far roar of the river
    {"sound": "wind", "t0": 33.4, "t1": 38.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "args": {"darkness": 0.4, "gust": 0.7, "whistle": 0.08}, "seed": 4},
    {"sound": "surf", "t0": 33.4, "t1": 38.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"size": 0.7}, "seed": 3},
    # Quito plaza: voices + the fountain
    {"sound": "city_day", "t0": 38.2, "t1": 43.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"murmur": 0.9, "traffic": 0.1}, "seed": 6},
    {"sound": "surf", "t0": 38.2, "t1": 43.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"size": 0.3}, "seed": 4},
    # orbit: almost nothing — a faint suit hum
    {"sound": "room_tone", "t0": 43.0, "t1": 47.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50},
    # the stadium, waiting
    {"sound": "city_day", "t0": 47.8, "t1": 53.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 7},
    {"sound": "wind", "t0": 47.8, "t1": 53.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.8, "gust": 0.3, "whistle": 0.0}, "seed": 5},
    # the return: each place's bed comes back at full size
    {"sound": "crowd_cheer", "t0": 53.0, "t1": 55.65, "fade_in": 0.6, "fade_out": 0.06, "gain_db": -36, "args": {"excite": 0.5}, "seed": 4},
    {"sound": "traffic_flow", "t0": 55.6, "t1": 58.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "seed": 2},
    {"sound": "surf", "t0": 58.0, "t1": 60.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -32, "args": {"size": 1.2}, "seed": 5},
    {"sound": "room_tone", "t0": 60.4, "t1": 62.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "surf", "t0": 62.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -46, "args": {"size": 0.3}, "seed": 6},
    {"sound": "city_day", "t0": 62.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -48, "args": {"murmur": 0.8, "traffic": 0.0}, "seed": 8},
    {"sound": "applause", "t0": 66.4, "t1": 69.8, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -36, "args": {"density": 30.0}, "seed": 1},
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
# the goal: a couple of player steps, the kick, the net
ev.append({"sound": "footsteps", "t0": 3.6, "t1": 7.15, "pan0": -0.3, "pan1": 0.0, "gain_db": -34, "rate": 3.2})
e(7.2, "kick", -16, -0.05)
e(7.62, "blanket_rustle", -27, 0.15, {"dur": 0.35, "softness": 0.3, "intensity": 0.8})
# SECOND 0
e(8.2, "pressure_drop", -12, 0.0, {"dur": 2.4}, hall=-12)
# kitchen: the coffee leaves the mug (a soft low bloop), toast hits the ceiling much later (off screen)
e(14.55, "plush_squeak", -32, 0.1, {"pitch": 0.55})
e(17.3, "plush_squeak", -34, 0.1, {"pitch": 0.6})
# pool: the springboard still shivering
e(19.15, "metal_groan", -34, -0.2, {"pitch": 2.2, "dur": 0.8})
# highway: suspensions creak as they let go
e(23.95, "metal_groan", -32, 0.2, {"pitch": 1.6, "dur": 1.0})
e(25.3, "metal_groan", -34, -0.2, {"pitch": 1.8, "dur": 1.0})
# the sea rising (a long low swell into the beat's end)
e(33.2, "low_swell", -24, 0.0, {"dur": 4.2, "pitch": 0.7}, hall=-14)
# bungee: the rush as he passes the deck (screen ~37.2)
e(37.35, "low_swell", -22, 0.0, {"dur": 1.6, "pitch": 1.1})
# plaza: pigeons
for k, tt in enumerate((38.6, 39.8, 41.3)):
    e(tt, "blanket_rustle", -34, (k - 1) * 0.3, {"dur": 0.4, "softness": 0.5, "intensity": 0.6, "strokes": 3})
# GRAVITY BACK
e(BACK, "distant_boom", -14, 0.0, {"size": 1.4})
# stadium: thousands land in the stand
for k, tt in enumerate((54.15, 54.3, 54.45, 54.6, 54.8, 55.0)):
    e(tt, "giant_step", -16 - k, (k % 3 - 1) * 0.3, {"size": 1.3})
# highway: the cars slam into the field (landing at screen ≈ 57.19), alarms
for k, (tt, g, pan) in enumerate(((57.19, -10, 0.1), (57.24, -14, -0.25), (57.3, -17, 0.35), (57.36, -19, -0.4))):
    e(tt, "car_crash", g, pan, {"weight": 1.3 - 0.2 * k})
e(57.45, "metal_groan", -20, 0.1, {"pitch": 1.0, "dur": 1.2})
for tt in (57.75, 58.0):
    pass
# the ocean lands (screen ≈ 59.78)
e(59.78, "water_splash", -8, 0.0, {"size": 3.0})
# kitchen: the coffee puddle drops off the ceiling onto the table (61.06), the toast lands next to it, the dog boofs
e(61.06, "water_splash", -20, 0.0, {"size": 0.25})
e(61.12, "plush_place", -26, 0.25)
e(61.75, "dog_bark", -28, -0.2, {"pitch": 1.0})
# pool: the kid's cannonball lands (63.98), the 27 m dive (65.03)
e(63.98, "water_splash", -16, -0.25, {"size": 0.6})
e(65.03, "water_splash", -6, 0.0, {"size": 1.6})

cues = {
    "title": "017 - What if gravity turned off for 5 seconds? (science: curious pluck ostinato -> cinematic strings + taiko, scene beds)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [73.3, D],
    "stem_gain_db": {"music": -3.0, "sfx": 6.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.3125, "feedback": 0.38, "mix": 0.3, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": SW, "midi": 26, "vel": 0.45, "hold": 2.2}, {"t": BACK, "midi": 26, "vel": 0.5, "hold": 2.0}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
# ---- v4 (TRIBE pass at ≤ 69.5 s): the sheet above is written on the 73.8 s timeline; M() maps it onto the 69.4 s cut
# (fans 4.8 → 3.8 s, coffee 4.8 → 3.2 s, pool 4.8 → 3.0 s; everything after 23.8 s moves 4.4 s earlier).
def M(t):
    if t <= 9.4:
        return t
    for a0, a1, b0, b1 in ((9.4, 14.2, 9.4, 13.2), (14.2, 19.0, 13.2, 16.4), (19.0, 23.8, 16.4, 19.4)):
        if t <= a1:
            return round(b0 + (t - a0) * (b1 - b0) / (a1 - a0), 3)
    return round(t - 4.4, 3)
def Mv(v):  # a velocity breakpoint list [[t, v], ...] or a plain number
    return [[M(a), b] for a, b in v] if isinstance(v, list) else v
def remap(c):
    c["duration"] = M(c["duration"]); c["end_fade"] = [M(x) for x in c["end_fade"]]; c["shots"] = [M(x) for x in c["shots"]]
    for a in c["ambience"]:
        a["t0"], a["t1"] = M(a["t0"]), M(a["t1"])
    for e_ in c["events"]:
        for k in ("t", "t0", "t1"):
            if k in e_:
                e_[k] = M(e_[k])
    m = c["music"]; m["end"] = M(m["end"])
    m["chords"] = [[M(t), sym] for t, sym in m["chords"]]
    for key in ("sections", "layers"):
        for S in m.get(key, []):
            S["t0"], S["t1"] = M(S["t0"]), M(S["t1"]); S["vel"] = Mv(S["vel"])
    m["drums"] = [[M(t), v, k] for t, v, k in m["drums"]]
    for P in m["drum_patterns"]:
        P["t0"], P["t1"] = M(P["t0"]), M(P["t1"]); P["vel"] = Mv(P["vel"])
    m["melody"] = [[M(x[0])] + x[1:] for x in m["melody"]]
    for r in m["pad"]:
        r["t0"], r["t1"] = M(r["t0"]), M(r["t1"])
    for st in m["stings"]:
        st["t"] = M(st["t"])
    return c
cues = remap(cues)
cues["title"] = cues["title"].replace("(science:", "(69.4 s cut, science:")
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
