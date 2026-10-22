# Generates cues.json for video 006 (whatif tone, SOUND-DESIGN-LED mix).
# Run: python3 -I videos/006-memory-loss/make_cues.py videos/006-memory-loss/cues.json
# Idea: the places carry the sound (crowd, traffic, a far horn, a quiet bedroom). Music is only a low pad bed until the
# "+1 month" beat, where a soft piano enters and carries the ending. The big sound moment is SUBTRACTIVE: at 9:00 every
# voice and footstep on the street stops at once, leaving only traffic.
import json, sys
D = 68.6
FREEZE = 7.0

chords = [[0.3, "Dm"], [7.0, "Bb"], [15.2, "Dm"], [21.4, "F"], [25.4, "Bb"], [29.0, "Dm"], [35.0, "Bb"], [41.0, "F"],
          [47.4, "Dm"], [50.6, "Bb"], [53.8, "F"], [56.4, "C/E"], [58.6, "Dm"], [60.6, "Bb"], [62.6, "C"], [64.6, "F"]]
pad = [{"t0": c[0], "t1": (chords[i + 1][0] if i + 1 < len(chords) else D) + 0.05, "chord": c[1],
        "level": 0.25 if c[0] < 47.4 else 0.3, "attack": 1.2, "release": 0.9} for i, c in enumerate(chords)]
sections = [
    {"t0": 47.4, "t1": 53.8, "style": "held", "vel": [[47.4, 0.16], [53.8, 0.2]], "roll": 0.1},
    {"t0": 53.8, "t1": 62.6, "style": "arp", "vel": [[53.8, 0.2], [60.6, 0.27], [62.6, 0.25]], "step": 0.4444, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 62.6, "t1": D, "style": "cadence", "vel": [[62.6, 0.25], [64.6, 0.22]], "roll": 0.09},
]
melody = [[t, m, v] for t, m, v in [
    (48.2, 69, 0.18), (49.8, 65, 0.16), (51.0, 70, 0.18), (52.6, 69, 0.17),
    (54.2, 72, 0.24), (55.1, 69, 0.21), (56.4, 67, 0.24), (57.4, 72, 0.22), (58.6, 74, 0.26), (59.6, 72, 0.23),
    (60.6, 77, 0.28), (61.5, 76, 0.26), (62.6, 74, 0.26), (63.6, 72, 0.24), (64.6, 77, 0.24)]]
stings = [{"t": 64.6, "midi": 29, "vel": 0.4, "hold": 2.6}]

amb = lambda snd, t0, t1, g, fi=0.4, fo=0.4, args=None, seed=1: {"sound": snd, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, **({"args": args} if args else {}), "seed": seed}
ambience = [
    # New York rush hour: voices stop dead at 9:00 (fade_out 0.3 s), traffic keeps going
    amb("city_day", 0.0, FREEZE + 0.15, -42, 0.6, 0.3, {"murmur": 1.0, "traffic": 0.0}, 11),
    amb("city_day", 0.0, 15.2, -42, 0.6, 0.15, {"murmur": 0.0, "traffic": 0.75}, 12),
    amb("wind", FREEZE, 15.2, -50, 1.5, 0.15, {"darkness": 0.9, "gust": 0.15, "whistle": 0.0}, 13),
    # Seoul at night: quieter traffic, a little wind
    amb("city_day", 15.2, 21.4, -44, 0.15, 0.15, {"murmur": 0.0, "traffic": 0.5}, 14),
    amb("wind", 15.2, 21.4, -47, 0.15, 0.15, {"darkness": 0.95, "gust": 0.2, "whistle": 0.0}, 15),
    # Sydney bedroom
    amb("room_tone", 21.4, 29.0, -43, 0.15, 0.15, None, 16),
    # +1 hour: people start talking again, quietly
    amb("city_day", 29.0, 35.0, -42, 0.15, 0.15, {"murmur": 0.35, "traffic": 0.6}, 17),
    # +1 day: busier, posters
    amb("city_day", 35.0, 41.0, -41, 0.15, 0.15, {"murmur": 0.65, "traffic": 0.5}, 18),
    # +1 week: classroom
    amb("room_tone", 41.0, 47.4, -44, 0.15, 0.15, None, 19),
    amb("city_day", 41.0, 47.4, -52, 0.15, 0.15, {"murmur": 0.3, "traffic": 0.1}, 20),
    # +1 month: golden, calm
    amb("city_day", 47.4, 53.8, -46, 0.15, 0.15, {"murmur": 0.3, "traffic": 0.0}, 21),
    amb("wind", 47.4, 53.8, -48, 0.15, 0.15, {"darkness": 0.9, "gust": 0.15, "whistle": 0.0}, 22),
    # +1 year: the bench, autumn
    amb("city_day", 53.8, 64.6, -46, 0.15, 0.8, {"murmur": 0.2, "traffic": 0.45}, 23),
    amb("dry_leaves", 53.8, 64.6, -49, 0.4, 0.8, None, 24),
]
events = [
    # the crowd: four overlapping step streams that all stop on 9:00
    {"sound": "footsteps", "t0": 0.05, "t1": FREEZE, "pan0": 0.0, "pan1": 0.0, "gain_db": -31, "rate": 1.8},
    {"sound": "footsteps", "t0": 0.17, "t1": FREEZE, "pan0": -0.45, "pan1": -0.35, "gain_db": -33, "rate": 1.7},
    {"sound": "footsteps", "t0": 0.36, "t1": FREEZE + 0.05, "pan0": 0.4, "pan1": 0.3, "gain_db": -34, "rate": 1.9},
    {"sound": "footsteps", "t0": 0.09, "t1": FREEZE + 0.1, "pan0": 0.15, "pan1": -0.15, "gain_db": -36, "rate": 2.3},
    # Seoul: one far horn, then a farther one
    {"t": 17.3, "sound": "car_horn", "args": {"dur": 0.45, "distance": 2.0}, "gain_db": -31, "pan": 0.35},
    {"t": 19.7, "sound": "car_horn", "args": {"dur": 0.3, "pitch": 0.92, "distance": 3.0}, "gain_db": -36, "pan": -0.5},
    # Sydney: door, her steps, the tuck
    {"t": 21.7, "sound": "door_open", "args": {"creak": 0.35, "pitch": 0.8}, "gain_db": -25, "pan": -0.3, "room": -14},
    {"sound": "footsteps", "t0": 22.4, "t1": 23.3, "pan0": -0.3, "pan1": -0.2, "gain_db": -31, "room": -16},
    {"sound": "footsteps", "t0": 24.4, "t1": 25.9, "pan0": -0.2, "pan1": 0.1, "gain_db": -31, "room": -16},
    {"t": 26.9, "sound": "blanket_rustle", "args": {"dur": 0.8, "softness": 0.9, "intensity": 0.55}, "gain_db": -27, "pan": 0.1, "room": -18},
    # +1 hour: the soft tap of Face ID unlocking
    {"t": 31.0, "sound": "lamp_switch_click", "gain_db": -36, "pan": 0.05, "room": -20},
    # +1 day: a poster being smoothed onto a wall
    {"t": 35.5, "sound": "blanket_rustle", "args": {"dur": 0.45, "softness": 0.4, "intensity": 0.35}, "gain_db": -33, "pan": -0.25, "room": -16},
    # +1 month: the two soldiers walk up to each other
    {"sound": "footsteps", "t0": 47.5, "t1": 49.2, "pan0": -0.25, "pan1": -0.05, "gain_db": -32, "rate": 1.7},
    {"sound": "footsteps", "t0": 47.7, "t1": 49.2, "pan0": 0.25, "pan1": 0.05, "gain_db": -33, "rate": 1.7},
    # +1 year: her coat sleeve as she takes his hand
    {"t": 61.5, "sound": "blanket_rustle", "args": {"dur": 0.5, "softness": 0.95, "intensity": 0.3}, "gain_db": -33, "pan": 0.05, "room": -18},
]
cues = {
    "title": "006 - What if everyone on Earth lost their memory at the same time? (sound-design-led: places + pad, piano only at the end)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.4, D],
    "stem_gain_db": {"music": -16.0, "sfx": -2.0, "amb": 4.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -20.0, "ratio": 3.0, "win": 0.004, "limit_dbfs": -12.0}},
    "sfx_lowpass_hz": 4800,
    "shots": [0, 9.4, 15.2, 21.4, 25.4, 29.0, 35.0, 41.0, 47.4, 53.8, D],
    "ambience": ambience, "events": events,
    "music": {"gain_db": 0.0, "reverb_db": -6.5, "pad_db": -6.0, "pad_reverb_db": -4.0,
              "leveler": {"thr_rel_db": 6.0, "ratio": 1.0, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad, "stings": stings, "ducks": [],
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print("wrote", sys.argv[1])
