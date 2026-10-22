# Generates cues.json for video 007 (montage tone: sound-design-led, synth "pluck" voice — NOT the piano of 001/002).
# Run: python3 videos/007-twice-as-smart/make_cues.py videos/007-twice-as-smart/cues.json
#
# Sound identity (user steer: every kind of video gets its own sound; sims can be SFX-led):
#   - 0–6.6 s: no music at all, just an immersive street (steps, murmur). The premise hits → a low swell, and the synth enters.
#   - a warm detuned pluck arpeggio with ping-pong echo + a pad bed, building scene by scene (continuous — never cuts out).
#   - every scene has its own bed + a few real-feeling foley hits synced to the picture (chalk, cars passing, pens, cheering, rocket).
#   - the punch line (fitted sheet) thins the music to held chords; the end card resolves.
import json, sys

D = 69.5
SCENES = [0, 9.5, 15.5, 21.5, 27.0, 33.0, 39.0, 45.5, 50.0, 58.0, 64.4]
SH = 8.0   # the bedroom ending moved 8 s later when the city time-lapse + Mars beats were added

# D major "wonder" loop, one chord per ~1.5 s while the montage runs
prog = ["D", "A/C#", "Bm", "G"]
chords = [[0.2, "D"]]
t, k = 6.6, 0
while t < 58.0:
    chords.append([round(t, 3), prog[k % 4]]); t += 1.5; k += 1
chords += [[58.0, "G"], [60.0, "D/F#"], [62.0, "Em"], [63.2, "A"], [64.4, "D"]]

sections = [
    {"t0": 6.6, "t1": 9.5, "style": "arp", "vel": 0.2, "step": 0.75, "pattern": [0, 2, 1, 3]},   # plucks decay fast: never "held"
    {"t0": 9.5, "t1": 58.0, "style": "arp", "vel": [[9.5, 0.2], [27.0, 0.25], [45.5, 0.3], [52.0, 0.33], [58.0, 0.33]], "step": 0.25,
     "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 58.0, "t1": 64.4, "style": "arp", "vel": 0.21, "step": 0.375, "pattern": [0, 2, 1, 3]},   # the punch line: half-speed, softer
    {"t0": 64.4, "t1": D, "style": "arp", "vel": 0.23, "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},   # end card: slow and warm, still moving
]
# a simple high motif at the start of each montage beat (sparse, like a "ping" of insight)
melody = []
for s0, top in zip(SCENES[1:9], [78, 81, 78, 83, 81, 85, 86, 88]):
    melody += [[s0 + 0.05, top, 0.26], [s0 + 0.55, top - 3, 0.22], [s0 + 1.05, top - 5, 0.22]]
pad = [{"t0": 6.6, "t1": 9.6, "chord": "D", "level": 0.8, "attack": 0.8, "release": 0.5}]
for i in range(1, len(chords)):
    c0 = chords[i][0]
    if c0 < 6.6:
        continue
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.05, "chord": chords[i][1], "level": 0.55 if c0 < 58 else 0.75, "attack": 0.3, "release": 0.5})

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 9.55, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -38, "seed": 1},
    {"sound": "room_tone", "t0": 9.5, "t1": 15.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 9.5, "t1": 15.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 2},
    {"sound": "traffic_flow", "t0": 15.5, "t1": 21.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -38, "seed": 1},
    {"sound": "city_day", "t0": 21.5, "t1": 27.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 3},
    {"sound": "city_day", "t0": 24.3, "t1": 27.05, "fade_in": 0.5, "fade_out": 0.06, "gain_db": -40, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 4},
    {"sound": "room_tone", "t0": 27.0, "t1": 33.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "lamp_hum", "t0": 27.0, "t1": 33.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50},
    {"sound": "applause", "t0": 30.85, "t1": 33.05, "fade_in": 0.15, "fade_out": 0.06, "gain_db": -36, "args": {"density": 28.0}, "seed": 1},
    {"sound": "city_day", "t0": 33.0, "t1": 39.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "seed": 5},
    {"sound": "crowd_cheer", "t0": 33.8, "t1": 39.05, "fade_in": 0.35, "fade_out": 0.06, "gain_db": -33, "seed": 1},
    {"sound": "turbines", "t0": 39.0, "t1": 45.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -38, "seed": 1},
    {"sound": "traffic_flow", "t0": 39.0, "t1": 45.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "seed": 2},
    {"sound": "wind", "t0": 45.5, "t1": 50.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "rocket_rumble", "t0": 45.8, "t1": 50.05, "fade_in": 0.1, "fade_out": 0.06, "gain_db": -27, "seed": 1},
    {"sound": "wind", "t0": 50.0, "t1": 58.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "args": {"darkness": 0.92, "gust": 0.45, "whistle": 0.0}, "seed": 4},
    {"sound": "rocket_rumble", "t0": 49.9, "t1": 52.2, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -28, "args": {"rise": 0.25}, "seed": 2},
    {"sound": "room_tone", "t0": 58.0, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -42},
]

ev = [
    {"sound": "footsteps", "t0": 0.0, "t1": 7.2, "pan0": -0.4, "pan1": 0.3, "gain_db": -30, "rate": 2.1},
    {"sound": "footsteps", "t0": 0.25, "t1": 7.35, "pan0": 0.4, "pan1": -0.2, "gain_db": -32, "rate": 1.8},
    {"t": 7.05, "sound": "low_swell", "args": {"dur": 1.4, "pitch": 1.0}, "gain_db": -24, "pan": 0.0, "hall": -14},
]
for i, t0 in enumerate([10.0, 11.0, 12.0, 13.0]):
    ev.append({"t": t0, "sound": "chalk_write", "args": {"dur": 0.85, "strokes": 5}, "gain_db": -24, "pan": 0.05, "room": -14})
for t0 in [12.85, 13.7, 14.6]:
    ev.append({"t": t0, "sound": "pen_scribble", "args": {"dur": 0.6}, "gain_db": -30, "pan": -0.3, "room": -16})
# cars: main-street pairs cross the intersection centre at k*2.2 s, cross-street pairs at k*2.2 + 1.1 s
for k in range(6, 11):
    for tt, pan in ((k * 2.2, 0.35), (k * 2.2 + 1.1, -0.35)):
        if 15.6 <= tt <= 21.4:
            ev.append({"t": round(tt, 3), "sound": "car_pass", "args": {"dur": 1.5, "size": 1.0}, "gain_db": -19, "pan": pan, "room": -18})
            ev.append({"t": round(tt + 0.05, 3), "sound": "car_pass", "args": {"dur": 1.4, "size": 0.85}, "gain_db": -22, "pan": -pan * 0.6, "room": -18})
for j, t0 in enumerate([23.35, 23.45, 23.55, 23.7]):
    ev.append({"t": t0, "sound": "blanket_rustle", "args": {"dur": 0.35, "softness": 0.6, "intensity": 0.6}, "gain_db": -30, "pan": (j - 1.5) * 0.25, "room": -18})
for j in range(6):
    ev.append({"t": 27.6 + j * 0.37, "sound": "pen_scribble", "args": {"dur": 0.9}, "gain_db": -31, "pan": (j - 2.5) * 0.18, "room": -14})
ev.append({"sound": "footsteps", "t0": 33.3, "t1": 35.0, "pan0": 0.0, "pan1": 0.0, "gain_db": -30, "rate": 3.0})
ev.append({"t": 52.3, "sound": "low_swell", "args": {"dur": 1.2, "pitch": 0.8}, "gain_db": -27, "pan": 0.0, "hall": -14})   # the colony starts building
for t0, inten in [(50.6 + SH, 0.9), (51.9 + SH, 1.0), (53.1 + SH, 1.0)]:
    ev.append({"t": t0, "sound": "blanket_rustle", "args": {"dur": 0.7, "softness": 0.35, "intensity": inten, "strokes": 2}, "gain_db": -22, "pan": 0.1, "room": -14})
ev.append({"t": 54.1 + SH, "sound": "blanket_rustle", "args": {"dur": 0.55, "softness": 0.3, "intensity": 1.0, "strokes": 3}, "gain_db": -21, "pan": 0.1, "room": -14})
ev.append({"t": 55.45 + SH, "sound": "mattress_sit", "args": {"dur": 0.5}, "gain_db": -30, "pan": -0.2, "room": -16})

cues = {
    "title": "007 - What if every human became twice as smart? (montage: SFX-led, synth pluck + echo)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [69.1, 69.5],
    "stem_gain_db": {"music": -1.5, "sfx": -4.0, "amb": -3.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -18.0, "ratio": 3.0, "win": 0.004, "limit_dbfs": -8.0}},
    "sfx_lowpass_hz": 6000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.375, "feedback": 0.4, "mix": 0.3, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad,
              "stings": [{"t": 7.05, "midi": 38, "vel": 0.3, "hold": 1.5}, {"t": 62.0, "midi": 33, "vel": 0.28, "hold": 1.2}],
              "ducks": [], "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -3.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
