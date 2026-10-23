# Generates cues.json for video 013 (montage tone, the dumb sibling of 007: same synth pluck + echo family, but a goofy F-major
# "oom-pah" bounce with a chromatic slip instead of 007's D-major wonder arpeggios — not a reuse).
# Run: python3 videos/013-twice-as-dumb/make_cues.py videos/013-twice-as-dumb/cues.json
#
# Sound identity:
#   - 0–5.4 s: quiet street only (steps, murmur). The dumb wave → a low swell + a soft low sting, the bounce enters at 5.6.
#   - a bouncy pluck oom-pah (bass on 1+3, stabs on 2+4) + ping-pong echo + a pad bed; a 3-note "wrong" slide motif opens every beat.
#   - foley-led like 007/010: every gag has its sound on the frame (bonks, crashes, typing, caws, chalk, rocket, applause).
#   - the twist (re-scored IQ) lifts to Bb; the fitted-sheet ending thins to a half-speed arp; the end card resolves on F.
import json, sys

D = 76.0
SCENES = [0, 8.2, 13.4, 18.6, 23.8, 29.0, 34.2, 39.4, 44.6, 49.8, 55.0, 60.2, 66.2, 72.0]
WAVE, T_RED, LIFT, TS = 5.4, 21.6, 55.6, 16.2
M0 = 5.6

# F major with a chromatic "dumb" slip (F#dim) — one chord per 1.6 s (2 bars of the 0.4-s bounce)
prog = ["F", "F#dim", "Gm", "C7"]
chords = [[0.2, "F"]]
t, k = M0, 0
while t < 60.2 - 0.01:
    chords.append([round(t, 3), prog[k % 4]]); t += 1.6; k += 1
chords += [[60.2, "Bb"], [61.8, "C"], [62.4, "Dm"], [63.8, "Bb"], [65.0, "C7"],          # the twist lifts
           [66.2, "F"], [67.8, "Dm"], [69.4, "Bb"], [71.0, "C"], [72.0, "F"], [74.0, "Bb"], [75.0, "F"]]

sections = [
    {"t0": M0, "t1": 8.2, "style": "bounce", "vel": 0.2, "step": 0.4, "bass_hold": 2.2, "stab_hold": 1.3},
    {"t0": 8.2, "t1": 60.2, "style": "bounce", "vel": [[8.2, 0.22], [29.0, 0.26], [49.8, 0.29], [60.2, 0.3]], "step": 0.4, "bass_hold": 2.2, "stab_hold": 1.3},
    {"t0": 60.2, "t1": 66.2, "style": "arp", "vel": 0.26, "step": 0.2, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 66.2, "t1": 72.0, "style": "arp", "vel": 0.21, "step": 0.4, "pattern": [0, 2, 1, 3]},     # the punch line: half speed
    {"t0": 72.0, "t1": D, "style": "arp", "vel": 0.22, "step": 0.4, "pattern": [0, 1, 2, 3, 2, 1]},
]
# each beat opens with a short descending "wrong" slide (a half step that lands a little flat) — staccato plucks
melody = []
for i, s0 in enumerate(SCENES[1:11]):
    top = [77, 79, 81, 77, 79, 84, 81, 79, 82, 84][i]
    melody += [[s0 + 0.05, top, 0.24, False, 0.18], [s0 + 0.25, top - 1, 0.22, False, 0.18], [s0 + 0.45, top - 5, 0.24, False, 0.35]]
melody += [[60.25, 77, 0.24, False, 0.3], [60.65, 81, 0.24, False, 0.3], [61.05, 84, 0.26, False, 0.5],     # the twist: going UP for once
           [63.85, 86, 0.26, False, 0.3], [64.25, 89, 0.26, False, 0.6]]
pad = [{"t0": M0, "t1": chords[2][0] + 0.35, "chord": "F", "level": 0.8, "attack": 0.8, "release": 0.6}]
for i in range(2, len(chords)):
    c0 = chords[i][0]
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.7 if c0 < 66.2 else 0.8, "attack": 0.15, "release": 0.6})

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 8.25, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -38, "seed": 1},
    {"sound": "room_tone", "t0": 8.2, "t1": 13.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 8.2, "t1": 13.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -47, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 2},
    {"sound": "room_tone", "t0": 13.4, "t1": 18.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "lamp_hum", "t0": 13.4, "t1": 18.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50},
    {"sound": "traffic_flow", "t0": 18.6, "t1": 23.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -38, "seed": 1},
    {"sound": "city_day", "t0": 23.8, "t1": 29.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "seed": 3},
    {"sound": "wind", "t0": 29.0, "t1": 34.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "rocket_rumble", "t0": 29.0, "t1": 34.25, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -40, "args": {"rise": 0.0}, "seed": 3},   # far jet drone
    {"sound": "room_tone", "t0": 34.2, "t1": 39.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "clock", "t0": 34.2, "t1": 39.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52},
    {"sound": "wind", "t0": 39.4, "t1": 49.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, "seed": 5},
    {"sound": "dry_leaves", "t0": 39.4, "t1": 44.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "args": {"density": 0.5}, "seed": 1},
    {"sound": "city_day", "t0": 44.6, "t1": 49.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"murmur": 0.2, "traffic": 0.4}, "seed": 6},
    {"sound": "room_tone", "t0": 49.8, "t1": 55.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "lamp_hum", "t0": 49.8, "t1": 55.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50},
    {"sound": "applause", "t0": 54.1, "t1": 55.05, "fade_in": 0.1, "fade_out": 0.06, "gain_db": -36, "args": {"density": 26.0}, "seed": 1},
    {"sound": "wind", "t0": 55.0, "t1": 60.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "rocket_rumble", "t0": LIFT - 0.2, "t1": LIFT + 4.5, "fade_in": 0.1, "fade_out": 0.4, "gain_db": -27, "seed": 1},
    {"sound": "crowd_cheer", "t0": LIFT + 4.4, "t1": 60.25, "fade_in": 0.2, "fade_out": 0.06, "gain_db": -34, "seed": 2},
    {"sound": "room_tone", "t0": 60.2, "t1": 66.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "applause", "t0": 63.9, "t1": 66.25, "fade_in": 0.15, "fade_out": 0.06, "gain_db": -35, "args": {"density": 30.0}, "seed": 2},
    {"sound": "room_tone", "t0": 66.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -42},
]

ev = [
    {"sound": "footsteps", "t0": 0.0, "t1": 5.9, "pan0": -0.4, "pan1": 0.3, "gain_db": -30, "rate": 2.1},
    {"sound": "footsteps", "t0": 0.25, "t1": 6.1, "pan0": 0.4, "pan1": -0.2, "gain_db": -32, "rate": 1.8},
    {"t": WAVE + 0.05, "sound": "low_swell", "args": {"dur": 1.2, "pitch": 0.55}, "gain_db": -26, "pan": 0.0, "hall": -14},
]
for tb in (WAVE + 0.2 + 1.12, WAVE + 0.2 + 1.87):                    # the wall-walker
    ev.append({"t": round(tb, 3), "sound": "bonk", "gain_db": -22, "pan": 0.05, "room": -16})
# classroom: signs go up (rustle), chalk at the board
for i in range(9):
    ev.append({"t": round(9.9 + i * 0.16, 3), "sound": "blanket_rustle", "args": {"dur": 0.25, "softness": 0.4, "intensity": 0.5}, "gain_db": -32, "pan": (i - 4) * 0.08, "room": -16})
ev.append({"t": 12.08, "sound": "chalk_write", "args": {"dur": 0.7, "strokes": 4}, "gain_db": -22, "pan": -0.15, "room": -14})
# office: typing, PIN, then the money flutter
ev.append({"t": 13.9, "sound": "keyboard_type", "args": {"dur": 1.3, "rate": 6.0}, "gain_db": -24, "pan": -0.1, "room": -16})
ev.append({"t": 16.5, "sound": "keyboard_type", "args": {"dur": 0.7, "rate": 7.0}, "gain_db": -24, "pan": -0.1, "room": -16})
for j in range(10):
    ev.append({"t": round(17.3 + j * 0.13, 3), "sound": "blanket_rustle", "args": {"dur": 0.3, "softness": 0.3, "intensity": 0.55}, "gain_db": -29, "pan": (j % 5 - 2) * 0.15, "room": -18})
# traffic: cross cars running their red, then the queue floors it into a pile-up
for tt, pan in ((19.39, 0.25), (20.21, 0.25), (21.03, 0.25), (19.23, -0.25), (20.05, -0.25), (20.87, -0.25)):
    ev.append({"t": tt - 0.6, "sound": "car_pass", "args": {"dur": 1.3, "size": 1.0}, "gain_db": -20, "pan": pan, "room": -18})
ev.append({"t": T_RED + 0.15, "sound": "car_pass", "args": {"dur": 1.0, "size": 1.2}, "gain_db": -20, "pan": 0.1, "room": -18})
for tt, w in ((22.53, 0.6), (22.82, 0.45), (23.10, 0.4)):
    ev.append({"t": tt, "sound": "car_crash", "args": {"dur": 0.9, "weight": w}, "gain_db": -20, "pan": 0.1, "room": -16})
# PULL door: five bonks
for i in range(5):
    ti = 24.3 + i * 0.95
    ev.append({"sound": "footsteps", "t0": ti, "t1": ti + 0.38, "pan0": 0.2, "pan1": 0.0, "gain_db": -32, "rate": 4.0})
    ev.append({"t": round(ti + 0.58, 3), "sound": "bonk", "gain_db": -21, "pan": 0.0, "room": -16})
# kitchen: the remote "connects"
ev.append({"t": 37.0, "sound": "phone_pickup", "gain_db": -26, "pan": 0.35, "room": -16})
# crows
for tt, p in ((39.9, 0.1), (41.0, -0.2), (41.55, 0.0), (42.7, 0.25), (43.3, -0.1)):
    ev.append({"t": tt, "sound": "crow_caw", "args": {"pitch": 0.95 + 0.1 * (p > 0)}, "gain_db": -27, "pan": p, "room": -18})
for tt in (41.5, 42.65, 42.8, 42.95, 43.1):
    ev.append({"t": tt, "sound": "blanket_rustle", "args": {"dur": 0.35, "softness": 0.35, "intensity": 0.7, "strokes": 2}, "gain_db": -29, "pan": 0.0, "room": -18})
# dog walk
ev.append({"sound": "footsteps", "t0": 44.8, "t1": 47.4, "pan0": -0.2, "pan1": 0.1, "gain_db": -31, "rate": 1.9})
ev.append({"t": 45.4, "sound": "dog_bark", "args": {"pitch": 0.9}, "gain_db": -26, "pan": 0.2, "room": -18})
ev.append({"t": 48.3, "sound": "slurp", "args": {"dur": 0.5}, "gain_db": -30, "pan": 0.2, "room": -18})         # the man sniffs the hydrant
ev.append({"t": 48.9, "sound": "dog_bark", "args": {"pitch": 1.0}, "gain_db": -26, "pan": 0.1, "room": -18})
# war room: marker squeaks on the hologram
for k in range(9):
    ev.append({"t": round(50.3 + k * 0.3, 3), "sound": "pen_scribble", "args": {"dur": 0.18}, "gain_db": -28, "pan": (k % 3 - 1) * 0.2, "room": -14})
for k in range(5):
    ev.append({"t": round(54.0 + k * 0.25, 3), "sound": "pen_scribble", "args": {"dur": 0.15}, "gain_db": -30, "pan": (k % 3 - 1) * 0.2, "room": -14})
# rocket comes home
ev.append({"t": LIFT + 4.3, "sound": "distant_boom", "args": {"dur": 2.0, "size": 0.6}, "gain_db": -26, "pan": 0.3, "hall": -14})
# fitted sheet (007 timing, shifted by TS)
for t0, inten in [(50.6 + TS, 0.9), (51.9 + TS, 1.0), (53.1 + TS, 1.0)]:
    ev.append({"t": t0, "sound": "blanket_rustle", "args": {"dur": 0.7, "softness": 0.35, "intensity": inten, "strokes": 2}, "gain_db": -22, "pan": 0.1, "room": -14})
ev.append({"t": 54.1 + TS, "sound": "blanket_rustle", "args": {"dur": 0.55, "softness": 0.3, "intensity": 1.0, "strokes": 3}, "gain_db": -21, "pan": 0.1, "room": -14})
ev.append({"t": 55.45 + TS, "sound": "mattress_sit", "args": {"dur": 0.5}, "gain_db": -30, "pan": -0.2, "room": -16})

cues = {
    "title": "013 - What if every human became twice as dumb? (montage: foley-led, goofy pluck bounce + echo)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [75.6, D],
    "stem_gain_db": {"music": -5.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5500,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.4, "feedback": 0.35, "mix": 0.26, "lp_hz": 2800},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 3.5, "pad_reverb_db": -4.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad,
              "stings": [{"t": WAVE + 0.05, "midi": 29, "vel": 0.3, "hold": 1.4}, {"t": 62.4, "midi": 34, "vel": 0.26, "hold": 1.2}],
              "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
