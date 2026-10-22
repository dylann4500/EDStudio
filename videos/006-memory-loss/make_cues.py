# Generates cues.json for video 006 (whatif tone, DOOMER cut, SOUND-DESIGN-LED mix).
# Run: python3 -I videos/006-memory-loss/make_cues.py videos/006-memory-loss/cues.json
# The places carry the sound (crowd, traffic, crashes, a stuck horn, a far boom, hum dying with the grid, tank rumble, a mob).
# Music is a dark low pad bed (~9 dB under the ambience) the whole way; a few low piano chords only for the last beat.
# Big moments are SUBTRACTIVE where possible: at 9:00 every voice + footstep stops at once; the city hum dies with the grid.
import json, sys
D = 70.2
FREEZE = 7.0
TC, TC3, TC2 = 11.6, 12.6, 13.2           # T-bone, side hit, rear-end (shots.js)
FALL = 20.6                                # the plane comes down behind the skyline

chords = [[0.3, "Dm"], [7.0, "Bb"], [9.4, "Gm"], [15.2, "Dm"], [21.4, "Bb"], [28.0, "Gm"], [34.2, "A"], [40.4, "Dm"],
          [46.6, "Bb"], [52.8, "Gm"], [58.4, "Dm"], [61.6, "Bb"], [64.2, "Gm"], [66.2, "Dm"]]
pad = [{"t0": c[0], "t1": (chords[i + 1][0] if i + 1 < len(chords) else D) + 0.05, "chord": c[1],
        "level": 0.24, "attack": 1.4, "release": 1.0} for i, c in enumerate(chords)]
sections = [{"t0": 58.4, "t1": D, "style": "held", "vel": [[58.4, 0.16], [62.2, 0.2], [66.2, 0.18]], "roll": 0.12}]
melody = [[t, m, v] for t, m, v in [(59.2, 62, 0.16), (61.6, 65, 0.17), (62.6, 62, 0.18), (64.2, 58, 0.16), (66.2, 62, 0.18)]]
stings = [{"t": 66.2, "midi": 26, "vel": 0.4, "hold": 3.0}]

def amb(snd, t0, t1, g, fi=0.4, fo=0.4, args=None, seed=1):
    a = {"sound": snd, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
WIND = {"darkness": 0.95, "gust": 0.25, "whistle": 0.0}
ambience = [
    # New York 8:59: voices stop dead at 9:00, traffic keeps going
    amb("city_day", 0.0, FREEZE + 0.15, -42, 0.6, 0.3, {"murmur": 1.0, "traffic": 0.0}, 11),
    amb("city_day", 0.0, 9.4, -42, 0.6, 0.15, {"murmur": 0.0, "traffic": 0.75}, 12),
    amb("wind", FREEZE, 9.4, -50, 1.2, 0.15, WIND, 13),
    # the intersection
    amb("city_day", 9.4, 15.2, -41, 0.15, 0.15, {"murmur": 0.15, "traffic": 0.8}, 14),
    # +5 min, night roof: wind + far traffic
    amb("wind", 15.2, 21.4, -45, 0.15, 0.15, WIND, 15),
    amb("city_day", 15.2, 21.4, -48, 0.15, 0.15, {"murmur": 0.0, "traffic": 0.5}, 16),
    # war room: room tone + confused voices
    amb("room_tone", 21.4, 28.0, -44, 0.15, 0.15, None, 17),
    amb("city_day", 21.4, 28.0, -50, 0.15, 0.15, {"murmur": 0.7, "traffic": 0.0}, 18),
    # capsule: electronics hum
    amb("lamp_hum", 28.0, 34.2, -51, 0.15, 0.15, None, 19),
    amb("room_tone", 28.0, 34.2, -46, 0.15, 0.15, None, 20),
    # reactor: wind + transformer hum
    amb("wind", 34.2, 40.4, -45, 0.15, 0.15, WIND, 21),
    amb("lamp_hum", 34.2, 40.4, -54, 0.15, 0.15, None, 22),
    # blackout: the city's hum and traffic die with the grid (long fades)
    amb("city_day", 40.4, 46.6, -43, 0.15, 4.4, {"murmur": 0.1, "traffic": 0.6}, 23),
    amb("lamp_hum", 40.4, 46.6, -52, 0.15, 4.6, None, 24),
    amb("wind", 42.0, 46.6, -48, 2.0, 0.15, WIND, 25),
    # border: wind + tank engines (low rumble)
    amb("wind", 46.6, 52.8, -45, 0.15, 0.15, WIND, 26),
    amb("city_day", 46.6, 52.8, -42, 0.4, 0.15, {"murmur": 0.0, "traffic": 1.0}, 27),
    # market mob
    amb("city_day", 52.8, 58.4, -42, 0.15, 0.15, {"murmur": 1.0, "traffic": 0.15}, 28),
    # a year later: wind and leaves, nothing else
    amb("wind", 58.4, 66.2, -46, 0.15, 1.0, WIND, 29),
    amb("dry_leaves", 58.4, 66.2, -50, 0.4, 1.0, None, 30),
]
events = [
    # the crowd: four step streams that all stop on 9:00
    {"sound": "footsteps", "t0": 0.05, "t1": FREEZE, "pan0": 0.0, "pan1": 0.0, "gain_db": -31, "rate": 1.8},
    {"sound": "footsteps", "t0": 0.17, "t1": FREEZE, "pan0": -0.45, "pan1": -0.35, "gain_db": -33, "rate": 1.7},
    {"sound": "footsteps", "t0": 0.36, "t1": FREEZE + 0.05, "pan0": 0.4, "pan1": 0.3, "gain_db": -34, "rate": 1.9},
    {"sound": "footsteps", "t0": 0.09, "t1": FREEZE + 0.1, "pan0": 0.15, "pan1": -0.15, "gain_db": -36, "rate": 2.3},
    # the crashes + a horn that gets stuck on
    {"t": TC, "sound": "car_crash", "args": {"weight": 1.0}, "gain_db": -24, "pan": -0.25},
    {"t": TC3, "sound": "car_crash", "args": {"weight": 0.7}, "gain_db": -29, "pan": -0.45},
    {"t": TC2, "sound": "car_crash", "args": {"weight": 0.8}, "gain_db": -27, "pan": -0.1},
    {"t": TC + 0.35, "sound": "car_horn", "args": {"dur": 3.3, "distance": 1.3}, "gain_db": -35, "pan": -0.25},
    # the plane: a far boom behind the skyline
    {"t": FALL, "sound": "distant_boom", "args": {"size": 1.3}, "gain_db": -24, "pan": 0.1},
    # the market: fists on the doors
    *[{"t": round(53.3 + k * 0.62 + (0.13 if k % 2 else 0), 3), "sound": "footstep", "args": {"weight": 1.4, "scuff": 0.3}, "gain_db": -31 - (k % 3), "pan": -0.1 + 0.05 * (k % 4)} for k in range(8)],
]
cues = {
    "title": "006 - What if everyone on Earth lost their memory at the same time? (doomer cut, sound-design-led)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [70.0, D],
    "stem_gain_db": {"music": -14.0, "sfx": -2.0, "amb": 4.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -20.0, "ratio": 3.0, "win": 0.004, "limit_dbfs": -10.0}},
    "sfx_lowpass_hz": 4800,
    "shots": [0, 9.4, 15.2, 21.4, 28.0, 31.2, 34.2, 40.4, 46.6, 52.8, 58.4, D],
    "ambience": ambience, "events": events,
    "music": {"gain_db": 0.0, "reverb_db": -6.0, "pad_db": -5.0, "pad_reverb_db": -3.0,
              "leveler": {"thr_rel_db": 6.0, "ratio": 1.0, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad, "stings": stings, "ducks": [],
              "eq": [{"f": 2800, "q": 0.8, "db": -3.0}, {"f": 6500, "q": 0.6, "db": -5.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print("wrote", sys.argv[1])
