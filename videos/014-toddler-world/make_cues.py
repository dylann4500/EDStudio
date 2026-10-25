# Generates cues.json for video 014 (montage, funny): "What if every adult woke up as a toddler?"
# Run: python3 videos/014-toddler-world/make_cues.py videos/014-toddler-world/cues.json
#
# Sound identity (new — not 013's pluck slip or 012's pizzicato): a MUSIC-BOX NURSERY BOUNCE.
#   - 0–5.2 s: quiet suburb (adult footsteps, far traffic). The shrink → a low swell + soft boops; the music box enters at 5.2.
#   - instrument "bell" (glassy music-box), a G-major oom-pah (G – Em – C – D) with a light echo, over a warm pad bed so the
#     plucked-decay never leaves holes. Each beat opens with a little rising 3-note "toy" motif (original, not a nursery rhyme).
#   - foley-led: every gag has its sound on the frame (boops, wooden thump, a crowd of soft bumps, snores, shutter clicks,
#     books, seat bounces, a cake splat, playground pops, the dog, phone pickups).
#   - a steady mix (TRIBE's predicted response follows loudness second by second — keep the bed full, no dead air).
#   - Day 8: the grow-back lifts to a warm arp in C, resolving on G for the end card.
import json, sys

D = 69.5
SCENES = [0, 9.2, 14.6, 20.0, 25.4, 30.8, 36.2, 41.6, 47.0, 53.2, 58.6, 65.0]
M1, M2 = 5.2, 59.0
FALL, NAP, NO, STOMP, KICK, TANTRUM, CAKE, B0, B1, CALL = 17.75, 22.8, 28.4, 29.55, 39.0, 44.4, 45.75, 47.1, 50.2, 61.3

prog = ["G", "Em", "C", "D"]
STEP = 0.375                                  # 8ths at 80 bpm-ish feel, bouncy
chords = [[0.2, "G"]]
t, k = M1, 0
while t < 58.6 - 0.01:
    chords.append([round(t, 3), prog[k % 4]]); t += STEP * 4; k += 1
chords += [[58.6, "C"], [60.1, "G/B"], [61.3, "Am"], [62.5, "F"], [63.7, "C"], [65.0, "G"], [66.5, "C"], [68.0, "G"]]

sections = [
    {"t0": M1, "t1": 58.6, "style": "bounce", "vel": [[M1, 0.24], [20.0, 0.27], [41.6, 0.29], [58.6, 0.3]], "step": STEP, "bass_hold": 2.4, "stab_hold": 1.4},
    {"t0": 58.6, "t1": 65.0, "style": "arp", "vel": 0.27, "step": 0.1875, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 65.0, "t1": D, "style": "arp", "vel": 0.24, "step": 0.375, "pattern": [0, 2, 1, 3, 2, 1]},
]
melody = []
for i, s0 in enumerate(SCENES[1:10]):          # a rising toy motif opens every beat (G major, staccato)
    base = [79, 81, 83, 79, 84, 81, 83, 86, 84][i]
    melody += [[s0 + 0.05, base, 0.25, False, 0.16], [s0 + 0.24, base + 2, 0.24, False, 0.16], [s0 + 0.43, base + 4 if i % 2 == 0 else base + 5, 0.26, False, 0.4]]
melody += [[M1 + 0.1, 79, 0.24, False, 0.2], [M1 + 0.3, 83, 0.24, False, 0.2], [M1 + 0.5, 86, 0.26, False, 0.5],     # the shrink
           [M2 + 0.05, 84, 0.26, False, 0.3], [M2 + 0.45, 88, 0.26, False, 0.3], [M2 + 0.85, 91, 0.27, False, 0.7],     # the grow-back
           [CALL + 0.05, 88, 0.24, False, 0.5], [CALL + 0.65, 86, 0.24, False, 0.5], [CALL + 1.25, 84, 0.25, False, 0.9]]
pad = [{"t0": M1 - 0.2, "t1": chords[2][0] + 0.35, "chord": "G", "level": 0.85, "attack": 0.6, "release": 0.6}]
for i in range(2, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.75 if c0 < 58.6 else 0.85, "attack": 0.15, "release": 0.6})

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 9.25, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -38, "args": {"murmur": 0.3, "traffic": 0.5}, "seed": 1},
    {"sound": "room_tone", "t0": 9.2, "t1": 14.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "clock", "t0": 9.2, "t1": 14.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52},
    {"sound": "city_day", "t0": 14.6, "t1": 20.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -37, "args": {"murmur": 0.5, "traffic": 0.7}, "seed": 2},
    {"sound": "room_tone", "t0": 20.0, "t1": 25.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "lamp_hum", "t0": 20.0, "t1": 25.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52},
    {"sound": "room_tone", "t0": 25.4, "t1": 30.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -39},
    {"sound": "applause", "t0": 25.4, "t1": 26.6, "fade_in": 0.05, "fade_out": 0.5, "gain_db": -40, "args": {"density": 18.0}, "seed": 3},
    {"sound": "room_tone", "t0": 30.8, "t1": 36.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 30.8, "t1": 36.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 4},
    {"sound": "cabin_hum", "t0": 36.2, "t1": 41.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -36},
    {"sound": "wind", "t0": 41.6, "t1": 47.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, "seed": 2},
    {"sound": "dry_leaves", "t0": 41.6, "t1": 47.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"density": 0.4}, "seed": 1},
    {"sound": "crowd_cheer", "t0": CAKE + 0.8, "t1": 47.05, "fade_in": 0.15, "fade_out": 0.06, "gain_db": -34, "seed": 3},
    {"sound": "city_day", "t0": 47.0, "t1": 53.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "args": {"murmur": 0.9, "traffic": 0.3}, "seed": 5},
    {"sound": "crowd_cheer", "t0": B1 - 0.5, "t1": 53.25, "fade_in": 0.6, "fade_out": 0.06, "gain_db": -40, "args": {"excite": 0.5}, "seed": 6},
    {"sound": "city_day", "t0": 53.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -43, "args": {"murmur": 0.2, "traffic": 0.4}, "seed": 7},
    {"sound": "wind", "t0": 53.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -48, "args": {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, "seed": 8},
]

def boops(t0, n, pitch0=0.7, gap=0.06, gain=-27):
    return [{"t": round(t0 + j * gap, 3), "sound": "plush_squeak", "args": {"pitch": pitch0 + 0.04 * (j % 4)}, "gain_db": gain, "pan": ((j % 5) - 2) * 0.15, "room": -18} for j in range(n)]

ev = [
    {"sound": "footsteps", "t0": 0.0, "t1": M1, "pan0": -0.3, "pan1": 0.2, "gain_db": -30, "rate": 2.0},
    {"sound": "footsteps", "t0": 0.3, "t1": M1, "pan0": 0.3, "pan1": -0.1, "gain_db": -32, "rate": 1.8},
    {"t": 1.6, "sound": "car_pass", "args": {"dur": 1.6, "size": 0.9}, "gain_db": -28, "pan": -0.5, "room": -18},
    {"t": 3.7, "sound": "car_pass", "args": {"dur": 1.5, "size": 1.0}, "gain_db": -27, "pan": -0.6, "room": -18},
    {"t": M1, "sound": "low_swell", "args": {"dur": 1.0, "pitch": 0.6}, "gain_db": -24, "pan": 0.0, "hall": -14},
    {"sound": "footsteps", "t0": M1 + 1.2, "t1": 9.2, "pan0": -0.2, "pan1": 0.2, "gain_db": -33, "rate": 3.4},
]
ev += boops(M1 + 0.05, 8, 0.75)
# kitchen: chair scrape → climb → topple (wooden thump) → bottom bounce
for th in (9.43, 9.70, 9.97):                                     # hop, hop, hop
    ev.append({"t": th, "sound": "giant_step", "args": {"size": 0.18, "surface": "wood"}, "gain_db": -24, "pan": -0.2, "room": -16})
ev.append({"sound": "footsteps", "t0": 10.05, "t1": 10.55, "pan0": -0.2, "pan1": -0.1, "gain_db": -30, "rate": 4.0})
ev.append({"t": 10.6, "sound": "floorboard_creak", "args": {"dur": 0.6}, "gain_db": -24, "pan": -0.2, "room": -16})
ev.append({"t": 11.1, "sound": "blanket_rustle", "args": {"dur": 0.6, "softness": 0.4, "intensity": 0.6}, "gain_db": -28, "pan": -0.2, "room": -16})
ev.append({"t": 13.08, "sound": "giant_step", "args": {"size": 0.45, "surface": "wood"}, "gain_db": -20, "pan": -0.2, "room": -14})
ev.append({"t": 13.12, "sound": "wood_snap", "args": {"dur": 0.4, "size": 0.3}, "gain_db": -30, "pan": -0.1, "room": -14})
ev += boops(13.2, 1, 0.6, gain=-24)
# commute: little feet, then everybody down at once
ev.append({"sound": "footsteps", "t0": 14.6, "t1": FALL, "pan0": 0.2, "pan1": -0.1, "gain_db": -30, "rate": 3.6})
ev.append({"sound": "footsteps", "t0": 14.7, "t1": FALL, "pan0": -0.2, "pan1": 0.1, "gain_db": -32, "rate": 3.2})
for j in range(10):
    ev.append({"t": round(FALL + 0.2 + j * 0.03, 3), "sound": "giant_step", "args": {"size": 0.25, "surface": "ground"}, "gain_db": -26, "pan": ((j % 5) - 2) * 0.12, "room": -18})
ev += boops(FALL + 0.3, 5, 0.65, gap=0.05)
ev.append({"sound": "footsteps", "t0": 19.4, "t1": 20.0, "pan0": 0.0, "pan1": 0.1, "gain_db": -31, "rate": 3.6})
ev.append({"t": 15.3, "sound": "car_horn", "args": {"dur": 0.35, "pitch": 1.1, "distance": 1.6}, "gain_db": -36, "pan": 0.4})
# board: marker squeak while the CEO presents, heads down, snores
for k in range(4):
    ev.append({"t": round(20.6 + k * 0.45, 3), "sound": "pen_scribble", "args": {"dur": 0.2}, "gain_db": -30, "pan": -0.25, "room": -14})
for j in range(6):
    ev.append({"t": round(NAP + 0.6 + j * 0.07, 3), "sound": "mattress_sit", "gain_db": -30, "pan": ((j % 3) - 1) * 0.2, "room": -16})
ev.append({"t": NAP + 1.2, "sound": "snore", "args": {"dur": 1.6, "size": 0.6}, "gain_db": -28, "pan": -0.1, "room": -16})
ev.append({"t": NAP + 1.3, "sound": "snore", "args": {"dur": 1.4, "size": 0.45}, "gain_db": -30, "pan": 0.2, "room": -16})
# press: shutter clicks (soft switch clicks), faster after "No."; the stomp + the books
tt = 25.6
while tt < 30.6:
    rate = 1.4 if tt < NO else 4.0
    ev.append({"t": round(tt, 3), "sound": "lamp_switch_click", "gain_db": -32, "pan": ((int(tt * 7) % 5) - 2) * 0.2, "room": -16}); tt += 1.0 / rate
ev.append({"t": STOMP - 0.1, "sound": "giant_step", "args": {"size": 0.3, "surface": "wood"}, "gain_db": -24, "pan": 0.0, "room": -14})
for j in range(7):
    ev.append({"t": round(STOMP + 0.15 + j * 0.06, 3), "sound": "giant_step", "args": {"size": 0.22, "surface": "wood"}, "gain_db": -25, "pan": ((j % 3) - 1) * 0.15, "room": -14})
ev += boops(STOMP + 0.45, 1, 0.6, gain=-24)
# market: tiny feet everywhere, arms full of rustling snacks
ev.append({"sound": "footsteps", "t0": 30.8, "t1": 36.2, "pan0": -0.3, "pan1": 0.3, "gain_db": -30, "rate": 4.5})
ev.append({"sound": "footsteps", "t0": 30.9, "t1": 36.2, "pan0": 0.3, "pan1": -0.3, "gain_db": -31, "rate": 4.0})
for j in range(10):
    ev.append({"t": round(31.3 + j * 0.42, 3), "sound": "blanket_rustle", "args": {"dur": 0.35, "softness": 0.3, "intensity": 0.6}, "gain_db": -29, "pan": ((j % 5) - 2) * 0.15, "room": -18})
ev.append({"t": 34.45, "sound": "low_swell", "args": {"dur": 0.8, "pitch": 0.7}, "gain_db": -28, "pan": 0.0, "hall": -14})
# plane: the whole cabin turns around in a wave (rustle), then a bounce wave rolls toward us
for j in range(6):
    ev.append({"t": round(36.5 + j * 0.12, 3), "sound": "blanket_rustle", "args": {"dur": 0.3, "softness": 0.4, "intensity": 0.5}, "gain_db": -30, "pan": ((j % 3) - 1) * 0.2, "room": -18})
b = 37.85
while b < 41.5:
    ev.append({"t": round(b, 3), "sound": "mattress_sit", "gain_db": -27, "pan": (0.25 if int(b * 10) % 2 else -0.25), "room": -16}); b += 0.349
# wedding: the flower girl, the tantrum (floor thumps), the lunge, the cake (thump + splat), cheers
ev.append({"sound": "footsteps", "t0": 41.7, "t1": 44.2, "pan0": 0.0, "pan1": 0.0, "gain_db": -33, "rate": 3.4})
for j in range(8):
    ev.append({"t": round(TANTRUM + 0.3 + j * 0.13, 3), "sound": "giant_step", "args": {"size": 0.2, "surface": "ground"}, "gain_db": -27, "pan": -0.2, "room": -18})
ev.append({"sound": "footsteps", "t0": CAKE - 0.2, "t1": CAKE + 0.25, "pan0": -0.1, "pan1": 0.2, "gain_db": -30, "rate": 5.0})
ev.append({"t": CAKE + 0.62, "sound": "giant_step", "args": {"size": 0.5, "surface": "ground"}, "gain_db": -20, "pan": 0.25, "room": -16})
ev.append({"t": CAKE + 0.66, "sound": "slurp", "args": {"dur": 0.35}, "gain_db": -24, "pan": 0.25, "room": -16})
# park: every piece pops in with a boop, then kids everywhere
for i in range(8):
    ev += boops(round(B0 + (B1 - B0) * (i + 0.6) / 8, 3), 1, 0.7 + 0.05 * i, gain=-25)
ev.append({"sound": "footsteps", "t0": 47.0, "t1": 53.2, "pan0": -0.3, "pan1": 0.3, "gain_db": -32, "rate": 4.2})
# dogs: the dog trots, cuts Gary off, two boofs
ev.append({"sound": "footsteps", "t0": 53.3, "t1": 55.2, "pan0": -0.4, "pan1": 0.4, "gain_db": -33, "rate": 4.0})
ev.append({"sound": "footsteps", "t0": 54.2, "t1": 55.9, "pan0": 0.0, "pan1": 0.05, "gain_db": -32, "rate": 3.4})
ev.append({"sound": "footsteps", "t0": 55.3, "t1": 55.95, "pan0": 0.4, "pan1": 0.0, "gain_db": -30, "rate": 6.0})
ev.append({"t": 56.12, "sound": "dog_bark", "args": {"pitch": 1.0}, "gain_db": -24, "pan": 0.0, "room": -18})
ev.append({"t": 56.42, "sound": "dog_bark", "args": {"pitch": 1.05}, "gain_db": -25, "pan": 0.0, "room": -18})
ev.append({"sound": "footsteps", "t0": 56.6, "t1": 57.9, "pan0": 0.05, "pan1": 0.0, "gain_db": -33, "rate": 3.4})
# grow-back: swell + low boops, then everyone's phone
ev.append({"t": M2, "sound": "low_swell", "args": {"dur": 1.0, "pitch": 0.8}, "gain_db": -24, "pan": 0.0, "hall": -14})
ev += boops(M2 + 0.05, 8, 0.55, gap=0.05, gain=-26)
for j in range(5):
    ev.append({"t": round(CALL + 0.1 + j * 0.08, 3), "sound": "phone_pickup", "gain_db": -30, "pan": ((j % 5) - 2) * 0.2, "room": -16})

cues = {
    "title": "014 - What if every adult woke up as a toddler? (montage: music-box nursery bounce, foley-led)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [69.0, D],
    "stem_gain_db": {"music": -5.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5500,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "bell", "echo": {"delay": 0.375, "feedback": 0.28, "mix": 0.2, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 3.5, "pad_reverb_db": -4.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad,
              "stings": [{"t": M1 + 0.05, "midi": 31, "vel": 0.3, "hold": 1.3}, {"t": STOMP + 0.45, "midi": 33, "vel": 0.26, "hold": 0.9},
                         {"t": CAKE + 0.65, "midi": 31, "vel": 0.26, "hold": 0.9}],
              "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
