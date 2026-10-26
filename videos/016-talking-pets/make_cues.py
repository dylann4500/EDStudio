# Generates cues.json for video 016 (unhinged lane): "What if every pet on Earth could suddenly talk?"
# Run: python3 videos/016-talking-pets/make_cues.py videos/016-talking-pets/cues.json
#
# Sound identity (new — not 014's music box, 013's pluck slip, 012's pizzicato or 008's sneaky pluck): "GOSSIP JAZZ".
#   - 0–5.6 s: a quiet living room (room tone, Biscuit snoring, Gary sipping tea, the fish bubbling). No music.
#   - 5.6 s (every pet gets a voice): a low swell + soft boops, and a piano trio walks in — the new synth `walk` style
#     (walking bass in quarter notes at ~133 bpm + soft off-beat comps), F major ii–V jazz loop (Fmaj7 Dm7 Gm7 C7),
#     a 4-note vibes "psst" motif (mallet) opening every beat, over a drone pad so the groove never leaves a hole.
#   - foley-led: every bubble has its pet's voice (soft boof / mrrow / rrawk / blub / squeak — all low-passed) and every
#     beat ends on a big soft impact (thuds, a crash, a pile-up) with a low sting under it.
#   - +1 year: the trio drops to a slow, warm piano arp; Biscuit's line gets a gentle swell; resolves on F under the end card.
import json, sys

D = 70.0
SCENES = [0, 9.6, 15.0, 20.4, 25.8, 31.2, 36.6, 42.0, 47.4, 52.8, 58.2]
M = 5.6
TIP, LAND, SMASH, CRASH, TOPPLE, STOP, ROLL0, ROLL1 = 7.8, 14.1, 19.27, 24.95, 30.5, 34.0, 34.7, 35.75
NEXT, BOLT, TOPPLE_L, SIGN, RAIN, THROW, PILE, SPEAK, HUG, END = 40.0, 40.45, 46.3, 50.3, 50.9, 55.0, 57.05, 63.3, 63.95, 66.0

STEP = 0.45                                   # quarter notes, ~133 bpm
BAR = STEP * 4
prog = ["Fmaj7", "Dm7", "Gm7", "C7"]
chords = [[0.2, "Fmaj7"]]
t, k = M, 0
while t < 58.2 - 0.01:
    chords.append([round(t, 3), prog[k % 4]]); t += BAR; k += 1
WARM = [[58.2, "Bbmaj7"], [59.6, "Am7"], [61.0, "Dm7"], [62.2, "Gm7"], [62.9, "C7"], [63.3, "Fmaj7"], [66.0, "Bbmaj7"], [67.6, "Fmaj7"]]
chords += WARM

sections = [
    {"t0": M, "t1": 58.2, "style": "walk", "vel": [[M, 0.25], [20.4, 0.27], [42.0, 0.29], [58.2, 0.3]], "step": STEP,
     "bass_hold": 0.95, "bass_vel": 0.95, "comp_vel": 0.42, "stab_hold": 0.8, "swing": 0.14},
    {"t0": 58.2, "t1": END, "style": "arp", "vel": 0.24, "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": END, "t1": D, "style": "arp", "vel": 0.22, "step": 0.45, "pattern": [0, 2, 1, 3, 2, 1]},
]
# the "psst" vibes motif: opens every beat (and the premise), climbing a little each time
mallet = []
for i, s0 in enumerate([M] + SCENES[1:10]):
    b = [77, 79, 81, 77, 82, 81, 79, 84, 82, 86][i]
    mallet += [[s0 + 0.08, b, 0.34, 0.22], [s0 + 0.31, b + 1, 0.3, 0.18], [s0 + 0.53, b, 0.32, 0.22], [s0 + 0.98, b - 4, 0.34, 0.5]]
melody = [[SPEAK + 0.05, 81, 0.22, False, 0.6], [SPEAK + 0.65, 79, 0.21, False, 0.6], [SPEAK + 1.25, 77, 0.24, False, 1.4],
          [END + 0.1, 77, 0.2, False, 1.0], [END + 1.0, 81, 0.2, False, 1.0], [END + 1.9, 84, 0.21, False, 2.2]]
pad = [{"t0": M - 0.3, "t1": 58.6, "notes": [41, 53, 60], "level": 0.85, "attack": 0.8, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < M:
        continue
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.55 if c0 < 58.2 else 0.9, "attack": 0.15, "release": 0.6})

def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 9.65, -39, fi=0.4),
    amb_("city_day", 9.6, 15.05, -40, {"murmur": 0.15, "traffic": 0.4}, 2),
    amb_("wind", 9.6, 15.05, -50, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 3),
    amb_("room_tone", 15.0, 20.45, -40), amb_("lamp_hum", 15.0, 20.45, -55),
    amb_("room_tone", 20.4, 25.85, -40), amb_("city_day", 20.4, 22.8, -40, {"murmur": 1.0, "traffic": 0.0}, 4, fo=0.12),   # chatter stops dead at the fight
    amb_("room_tone", 25.8, 31.25, -39), amb_("city_day", 25.8, 31.25, -48, {"murmur": 0.5, "traffic": 0.3}, 5),
    amb_("room_tone", 31.2, 36.65, -40), amb_("city_day", 31.2, 36.65, -47, {"murmur": 0.6, "traffic": 0.0}, 6),
    amb_("room_tone", 36.6, 42.05, -40), amb_("city_day", 36.6, 40.4, -46, {"murmur": 0.7, "traffic": 0.0}, 7),
    amb_("room_tone", 42.0, 47.45, -40), amb_("applause", 42.0, 42.9, -44, {"density": 14.0}, 8, fo=0.4),
    amb_("cabin_hum", 47.4, 52.85, -50), amb_("room_tone", 47.4, 52.85, -41),
    amb_("crowd_cheer", RAIN - 0.05, 52.85, -36, {"excite": 0.8}, 9, fi=0.15),
    amb_("city_day", 52.8, 58.25, -42, {"murmur": 0.3, "traffic": 0.3}, 10), amb_("wind", 52.8, 58.25, -50, {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, 11),
    amb_("room_tone", 58.2, D, -42, fo=1.2),
]

def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def boops(t0, n, pitch0=0.7, gap=0.06, gain=-27):
    return [ev_(t0 + j * gap, "plush_squeak", gain, ((j % 5) - 2) * 0.15, {"pitch": pitch0 + 0.04 * (j % 4)}, -18) for j in range(n)]

def thuds(t0, n, size=0.35, gap=0.07, surface="ground", gain=-24):
    return [ev_(t0 + j * gap, "giant_step", gain, ((j % 5) - 2) * 0.15, {"size": size, "surface": surface}, -16) for j in range(n)]

ev = []
# 1. living room: snores, sips, the fish; the moment; the parrot + the cat; the chair goes over (Biscuit keeps snoring)
for ts in (0.5, 2.8, 5.0, 8.4):
    ev.append(ev_(ts, "snore", -30, -0.3, {"dur": 2.0, "size": 0.8}))
ev += [ev_(1.35, "slurp", -30, 0.0, {"dur": 0.7}), ev_(4.3, "slurp", -31, 0.0, {"dur": 0.6}), ev_(2.2, "fish_blub", -34, -0.4, {"n_bub": 3})]
ev.append(ev_(M, "low_swell", -24, 0.0, {"dur": 1.0, "pitch": 0.7}))
ev += boops(M + 0.05, 5, 0.75)
ev += [ev_(6.2, "parrot_chirp", -27, 0.35, {"pitch": 1.0}), ev_(6.55, "parrot_chirp", -28, 0.35, {"pitch": 1.08}),
       ev_(6.95, "cat_meow", -26, 0.05, {"pitch": 0.95}), ev_(6.45, "fish_blub", -32, -0.4, {"n_bub": 2})]
ev += [ev_(7.2, "blanket_rustle", -28, 0.0, {"dur": 0.4, "softness": 0.4, "intensity": 0.7}), ev_(7.45, "plush_squeak", -27, 0.2, {"pitch": 0.6})]
ev += [ev_(TIP, "giant_step", -19, -0.1, {"size": 0.6, "surface": "wood"}), ev_(TIP + 0.02, "wood_snap", -31, -0.1, {"dur": 0.4, "size": 0.3}), ev_(7.92, "plush_place", -28, 0.15)]
ev += [ev_(TIP + 0.3, "parrot_chirp", -29, 0.35, {"pitch": 1.15}), ev_(TIP + 0.55, "parrot_chirp", -30, 0.35, {"pitch": 1.2})]
# 2. lawn: Max shouts (boofs on every line), the door, the sprint, the face-plant
for tb in (10.2, 10.45, 11.05, 11.3, 11.85, 12.1):
    ev.append(ev_(tb, "dog_bark", -25, -0.2, {"pitch": 1.1}))
ev += [ev_(12.1, "door_open", -28, -0.3, {"creak": 0.6}), {"sound": "footsteps", "t0": 12.4, "t1": 13.7, "pan0": -0.3, "pan1": -0.1, "gain_db": -27, "rate": 6.0}]
ev += thuds(LAND, 2, 0.6, 0.09, gain=-19) + boops(LAND + 0.1, 1, 0.6, gain=-25) + [ev_(14.45, "dog_bark", -26, 0.1, {"pitch": 1.15})]
# 3. counter: the cat reviews (mrrows), the paw, the slide, the smash
for tm, pch in ((15.55, 0.9), (16.45, 1.0), (17.3, 0.85)):
    ev.append(ev_(tm, "cat_meow", -25, 0.0, {"pitch": pch}))
ev += [ev_(18.4, "pen_scribble", -32, 0.1, {"dur": 0.4}), ev_(SMASH, "wood_snap", -24, 0.1, {"dur": 0.5, "size": 0.25}), ev_(SMASH + 0.01, "car_crash", -30, 0.1, {"weight": 0.15})]
ev += boops(SMASH + 0.25, 1, 0.6, gain=-25)
# 4. dinner: chatter → the parrot does the fight → silence → Kevin + the tablecloth
for tp, pch in ((21.0, 1.0), (21.25, 1.1), (21.9, 0.95), (22.15, 1.15), (22.75, 1.0), (23.0, 1.05)):
    ev.append(ev_(tp, "parrot_chirp", -26, 0.35, {"pitch": pch}))
ev += [ev_(SLIDE := 24.2, "blanket_rustle", -27, -0.3, {"dur": 0.7, "softness": 0.3, "intensity": 0.8}),
       ev_(CRASH, "car_crash", -24, -0.35, {"weight": 0.35}), ev_(CRASH + 0.05, "giant_step", -22, -0.35, {"size": 0.45, "surface": "wood"})]
ev += boops(CRASH + 0.3, 2, 0.6, gain=-26)
# 5. office: typing, the goldfish (blubs), the lean-in, the forgetting, everyone falls over
ev += [ev_(25.9, "keyboard_type", -34, 0.3, {"dur": 1.2, "rate": 9}), ev_(26.2, "fish_blub", -26, 0.0, {"n_bub": 4}), ev_(27.35, "fish_blub", -27, 0.0, {"n_bub": 2}),
       ev_(28.35, "blanket_rustle", -30, 0.0, {"dur": 0.5, "softness": 0.5, "intensity": 0.6}), ev_(29.45, "fish_blub", -26, 0.0, {"n_bub": 5})]
ev += thuds(TOPPLE, 5, 0.45, 0.05, "wood", -21) + boops(TOPPLE + 0.3, 3, 0.62, gain=-26)
# 6. pet shop: wheel rattle (soft taps) until the strike, squeaks, the runaway wheel, the bag avalanche
ev += [ev_(31.25, "keyboard_type", -33, -0.1, {"dur": 2.7, "rate": 22}), ev_(31.85, "hamster_squeak", -27, 0.2, {"pitch": 1.0}),
       ev_(32.1, "hamster_squeak", -28, 0.2, {"pitch": 1.1}), ev_(32.85, "hamster_squeak", -27, 0.2, {"pitch": 0.95}), ev_(33.4, "fish_blub", -36, -0.4, {"n_bub": 3})]
for j in range(5):
    ev.append(ev_(34.3 + j * 0.07, "hamster_squeak", -30, ((j % 5) - 2) * 0.15, {"pitch": 0.9 + 0.05 * j}))
ev += [ev_(ROLL0 + 0.6, "keyboard_type", -32, -0.2, {"dur": 0.9, "rate": 14})] + thuds(ROLL1, 6, 0.35, 0.06, "ground", -23) + boops(ROLL1 + 0.35, 1, 0.6, gain=-25)
# 7. vet: three complaints, the door, "Next!", the stampede
ev += [ev_(36.95, "dog_bark", -26, -0.3, {"pitch": 1.05}), ev_(37.2, "dog_bark", -27, -0.3, {"pitch": 1.0}), ev_(37.95, "cat_meow", -25, 0.0, {"pitch": 1.05}),
       ev_(38.95, "dog_bark", -25, 0.3, {"pitch": 0.75}), ev_(39.25, "dog_bark", -26, 0.3, {"pitch": 0.8}), ev_(39.0, "door_open", -30, -0.5, {"creak": 0.4})]
ev += [{"sound": "footsteps", "t0": BOLT, "t1": 41.9, "pan0": -0.2, "pan1": 0.5, "gain_db": -25, "rate": 7.0},
       ev_(BOLT + 0.05, "dog_bark", -24, 0.0, {"pitch": 1.1}), ev_(BOLT + 0.2, "cat_meow", -26, 0.2, {"pitch": 1.2}), ev_(BOLT + 0.35, "dog_bark", -25, 0.3, {"pitch": 0.8})]
ev += thuds(BOLT + 0.3, 3, 0.45, 0.12, "ground", -22) + boops(BOLT + 0.5, 2, 0.6, gain=-26)
# 8. press: shutters (soft clicks), the dog's speech, the lunge, the lectern goes over
tt = 42.1
while tt < 47.3:
    rate = 1.3 if tt < 42.6 else 3.0 if tt < TOPPLE_L else 5.0
    ev.append(ev_(tt, "lamp_switch_click", -33, ((int(tt * 7) % 5) - 2) * 0.2)); tt += 1.0 / rate
for tb, pch in ((42.55, 1.15), (42.8, 1.2), (43.55, 1.1), (44.4, 1.15), (44.65, 1.2)):
    ev.append(ev_(tb, "dog_bark", -25, -0.05, {"pitch": pch}))
ev += [ev_(TOPPLE_L, "giant_step", -18, 0.0, {"size": 0.75, "surface": "wood"}), ev_(TOPPLE_L + 0.03, "wood_snap", -27, 0.0, {"dur": 0.5, "size": 0.4})] + boops(TOPPLE_L + 0.3, 1, 0.55, gain=-24)
# 9. summit: the cat's terms (mrrows), murmured nods, the signature, the treat rain + cheer
for tm, pch in ((47.9, 0.9), (48.75, 1.0), (49.55, 0.85)):
    ev.append(ev_(tm, "cat_meow", -25, 0.0, {"pitch": pch}))
ev += [ev_(SIGN - 0.25, "pen_scribble", -27, 0.2, {"dur": 0.6}), ev_(RAIN - 0.1, "low_swell", -24, 0.0, {"dur": 0.9, "pitch": 0.8})]
ev += [ev_(RAIN + 0.1, "dog_bark", -25, -0.2, {"pitch": 1.1}), ev_(RAIN + 0.35, "parrot_chirp", -27, 0.3, {"pitch": 1.1}), ev_(RAIN + 0.5, "hamster_squeak", -28, 0.1, {"pitch": 1.0}), ev_(RAIN + 0.65, "dog_bark", -26, -0.2, {"pitch": 1.15})]
ev += boops(RAIN, 6, 0.7, 0.08, -27)
# 10. park: "GO GET IT", the throw, six people sprint, the pile-up
ev += [ev_(53.55, "dog_bark", -25, 0.0, {"pitch": 1.0}), ev_(53.8, "dog_bark", -26, 0.0, {"pitch": 1.05}), ev_(54.3, "dog_bark", -26, 0.0, {"pitch": 1.1}),
       ev_(THROW, "plush_squeak", -27, 0.0, {"pitch": 0.55}), ev_(55.85, "plush_place", -28, 0.05)]
ev += [{"sound": "footsteps", "t0": 55.15, "t1": 56.9, "pan0": -0.4, "pan1": 0.0, "gain_db": -26, "rate": 6.5},
       {"sound": "footsteps", "t0": 55.2, "t1": 57.0, "pan0": 0.4, "pan1": 0.0, "gain_db": -27, "rate": 6.0}]
ev += thuds(56.75, 6, 0.55, 0.06, "ground", -20) + boops(57.1, 3, 0.6, gain=-25) + [ev_(57.6, "dog_bark", -27, 0.0, {"pitch": 1.2})]
# 11. +1 year: night; Biscuit breathes; he speaks; a happy thump-thump-thump of his tail
ev += [ev_(58.6, "snore", -34, -0.2, {"dur": 2.0, "size": 0.7}), ev_(60.4, "snore", -36, -0.2, {"dur": 1.6, "size": 0.7})]
ev += [ev_(SPEAK, "dog_bark", -31, -0.1, {"pitch": 0.8}), ev_(SPEAK - 0.15, "low_swell", -27, 0.0, {"dur": 1.2, "pitch": 0.9}), ev_(HUG, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5})]
for j in range(6):
    ev.append(ev_(HUG + 0.3 + j * 0.22, "giant_step", -31, -0.1, {"size": 0.15, "surface": "wood"}))

cues = {
    "title": "016 - What if every pet on Earth could suddenly talk? (unhinged: gossip-jazz walk, pet-voice foley)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.8, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0,
              "mallet_db": -2.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "stings": [{"t": M + 0.05, "midi": 29, "vel": 0.3, "hold": 1.3}, {"t": TIP, "midi": 29, "vel": 0.26, "hold": 0.9},
                         {"t": CRASH, "midi": 31, "vel": 0.26, "hold": 0.9}, {"t": TOPPLE_L, "midi": 29, "vel": 0.27, "hold": 0.9},
                         {"t": RAIN, "midi": 29, "vel": 0.26, "hold": 1.2}, {"t": 56.8, "midi": 31, "vel": 0.26, "hold": 0.9}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
