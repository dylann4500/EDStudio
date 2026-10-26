# Generates cues.json for video 015 (funny / unhinged montage): "What if every human grew a tail that wags when they lie?"
# Run: python3 -I videos/015-tail-lies/make_cues.py videos/015-tail-lies/cues.json
#
# Sound identity (new — not 014's music-box bell, 013's pluck slip, 012's pizzicato mischief): a SNEAKY LOUNGE SWING.
#   - 0–5.2 s: a quiet street only (footsteps, murmur, a car). The sprout → a low swell + a soft boom + a burst of cartoon boops;
#     the swing enters there.
#   - piano: a swung walking bass in B-flat (I–vi–ii–V: Bbmaj7 Gm7 Cm7 F7, 112 bpm, one chord per bar) + soft comping stabs on 2 & 4
#     (with a swung "and-of-4" push every other bar) over a warm pad bed so the staccato never leaves holes.
#   - the signature: every lie gets a WAG — a fast two-note mallet trill (like a tail going side to side) + a fluffy double-swish
#     foley (soft blanket rustles), synced to the frame the tail starts wagging. Each beat's trill climbs a step.
#   - foley-led gags: jar smash, chair launch, swivel squeak + papers, balloon pops, a bumper clang + rotor whup-whup, chip rain,
#     flags falling, three gavel bangs; the press room's shutter storm stops dead at "Politics goes very quiet" (a gentle -4 dB dip).
#   - +1 year: the swing melts into a slow warm piano arp (Ebmaj7 → Bb), the dog's happy boofs, resolving on Bb for the end card.
import json, sys

D = 70.0
SCENES = [0, 10.6, 16.2, 21.8, 27.4, 33.0, 38.6, 44.2, 49.8, 55.8, 65.2]
M1 = 5.2
LIES = [9.3, 11.3, 14.05, 19.4, 24.4, 29.9, 35.95, 41.3, 46.95, 54.05]    # the frame each tail starts wagging (shots.js)
BEAT = 60 / 112.0
BAR = 4 * BEAT
END = 55.8

# ---------------------------------------------------------------- swing groove (piano), 5.2 → 55.8
prog = [("Bbmaj7", 46, [50, 53, 57]), ("Gm7", 43, [50, 53, 58]), ("Cm7", 48, [51, 55, 58]), ("F7", 41, [51, 57, 60])]
# walking bass per bar: root, a scale step up, the fifth, a chromatic approach into the next root
walks = {"Bbmaj7": [46, 48, 50, 44], "Gm7": [43, 45, 46, 47], "Cm7": [48, 46, 43, 40], "F7": [41, 45, 48, 45]}
chords, melody = [[0.2, "Bbmaj7"]], []
t, k = M1, 0
while t < END - 0.01:
    name, root, comp = prog[k % 4]
    chords.append([round(t, 3), name])
    for b, m in enumerate(walks[name]):                       # walking bass (legato quarters)
        melody.append([round(t + b * BEAT, 3), m, 0.34 if b == 0 else 0.28, False, BEAT * 0.92])
    for b in (1, 3):                                          # comp stabs on 2 and 4
        for j, m in enumerate(comp):
            melody.append([round(t + b * BEAT + 0.008 * j, 3), m + 12, 0.15, False, BEAT * 0.38])
    if k % 2 == 1:                                            # the swung "and of 4" push
        for j, m in enumerate(comp):
            melody.append([round(t + 3 * BEAT + BEAT * 0.66 + 0.008 * j, 3), m + 12, 0.13, False, BEAT * 0.3])
    t += BAR; k += 1
# a sneaky three-note tiptoe at the top of every beat (staccato, high piano)
for i, s0 in enumerate(SCENES[1:9]):
    base = [77, 79, 77, 81, 79, 82, 77, 79][i]
    melody += [[s0 + 0.06, base, 0.2, False, 0.14], [s0 + 0.06 + BEAT * 0.66, base - 3, 0.18, False, 0.14], [s0 + 0.06 + BEAT * 1.33, base - 5, 0.2, False, 0.3]]
# the end: warm slow arp (sections) on Ebmaj7 → Bb/D → Cm7 → F7 → Bbmaj7, resolving on Bb
chords += [[55.8, "Ebmaj7"], [57.95, "Bb/D"], [60.1, "Cm7"], [61.35, "F7"], [62.5, "Bbmaj7"], [64.6, "Ebmaj7"], [66.5, "Bb"]]
sections = [
    {"t0": END, "t1": 65.2, "style": "arp", "vel": 0.26, "step": BEAT / 2, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 65.2, "t1": D, "style": "arp", "vel": 0.23, "step": BEAT, "pattern": [0, 2, 1, 3, 2, 1]},
]
melody += [[61.4, 84, 0.22, False, 0.5], [61.75, 86, 0.22, False, 0.5], [62.1, 89, 0.24, False, 1.2]]       # the dog's happy lift
# ---------------------------------------------------------------- the WAG trill (mallet) on every lie
TRILL = [(77, 79), (79, 81), (77, 79), (81, 82), (79, 81), (82, 84), (81, 82), (84, 86), (82, 84), (84, 86)]
mallet = []
for i, t0 in enumerate(LIES):
    a, b = TRILL[i]
    for j in range(10):
        mallet.append([round(t0 + j * 0.062, 3), a if j % 2 == 0 else b, 0.34 - 0.012 * j, 0.11])
mallet += [[M1 + 0.06 + j * 0.05, [70, 74, 77, 82, 86][j], 0.3, 0.2] for j in range(5)]                    # the sprout: a rising "fwoomp"

pad = [{"t0": M1 - 0.2, "t1": END + 0.4, "notes": [34, 41, 46, 50], "level": 0.85, "attack": 0.5, "release": 0.8, "cutoff": 800, "hp": 30}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 >= END - 0.01:
        pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.8, "attack": 0.3 if c0 > END else 0.9, "release": 0.7})
drums = [[M1, 0.38, "boom"], [12.5, 0.24, "taiko"], [25.05, 0.26, "taiko"], [42.0, 0.42, "boom"], [47.8, 0.22, "taiko"],
         [54.4, 0.36, "taiko"], [54.75, 0.36, "taiko"], [55.1, 0.44, "boom"]]
stings = [{"t": 14.95, "midi": 34, "vel": 0.26, "hold": 0.9}, {"t": 36.58, "midi": 36, "vel": 0.24, "hold": 0.9}]

# ---------------------------------------------------------------- ambience (a bed per place)
amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 10.65, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -36, "args": {"murmur": 0.6, "traffic": 0.6}, "seed": 1},
    {"sound": "room_tone", "t0": 10.6, "t1": 16.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "clock", "t0": 10.6, "t1": 16.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -54},
    {"sound": "room_tone", "t0": 16.2, "t1": 21.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 16.2, "t1": 21.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"murmur": 0.0, "traffic": 0.6}, "seed": 2},
    {"sound": "city_day", "t0": 21.8, "t1": 27.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -37, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 3},   # restaurant chatter
    {"sound": "city_day", "t0": 27.4, "t1": 33.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.3, "traffic": 0.3}, "seed": 4},
    {"sound": "wind", "t0": 27.4, "t1": 33.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, "seed": 1},
    {"sound": "crowd_cheer", "t0": 29.9, "t1": 33.05, "fade_in": 0.15, "fade_out": 0.06, "gain_db": -38, "args": {"excite": 0.6}, "seed": 1},
    {"sound": "traffic_flow", "t0": 33.0, "t1": 38.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "seed": 2},
    {"sound": "wind", "t0": 33.0, "t1": 38.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "args": {"darkness": 0.6, "gust": 0.4, "whistle": 0.0}, "seed": 2},
    {"sound": "turbines", "t0": 37.0, "t1": 38.65, "fade_in": 0.5, "fade_out": 0.06, "gain_db": -40, "args": {"rate": 2.2}, "seed": 1},   # the rotor's whir
    {"sound": "city_day", "t0": 38.6, "t1": 44.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "args": {"murmur": 0.8, "traffic": 0.0}, "seed": 5},   # casino floor
    {"sound": "crowd_cheer", "t0": 42.0, "t1": 44.25, "fade_in": 0.1, "fade_out": 0.06, "gain_db": -36, "args": {"excite": 0.8}, "seed": 2},
    {"sound": "room_tone", "t0": 44.2, "t1": 49.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 44.2, "t1": 48.3, "fade_in": 0.05, "fade_out": 0.12, "gain_db": -44, "args": {"murmur": 0.7, "traffic": 0.0}, "seed": 6},   # press murmur → silence
    {"sound": "room_tone", "t0": 49.8, "t1": 55.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 49.8, "t1": 55.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "args": {"murmur": 0.6, "traffic": 0.0}, "seed": 7},
    {"sound": "city_day", "t0": 55.8, "t1": D, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -46, "args": {"murmur": 0.15, "traffic": 0.35}, "seed": 8},
    {"sound": "wind", "t0": 55.8, "t1": D, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -50, "args": {"darkness": 0.5, "gust": 0.2, "whistle": 0.0}, "seed": 3},
    {"sound": "dry_leaves", "t0": 55.8, "t1": D, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -54, "args": {"density": 0.3}, "seed": 2},
]

# ---------------------------------------------------------------- events
def boops(t0, n, pitch0=0.7, gap=0.04, gain=-27):
    return [{"t": round(t0 + j * gap, 3), "sound": "plush_squeak", "args": {"pitch": pitch0 + 0.05 * (j % 4)}, "gain_db": gain, "pan": ((j % 5) - 2) * 0.15, "room": -18} for j in range(n)]
def wag(t0, n=4, gain=-27, pan=0.0):   # the fluffy tail swish: quick soft double strokes
    return [{"t": round(t0 + j * 0.115, 3), "sound": "blanket_rustle", "args": {"dur": 0.12, "softness": 0.75, "intensity": 0.7, "strokes": 1}, "gain_db": gain - (j % 2) * 2, "pan": pan + (0.15 if j % 2 else -0.15), "room": -18} for j in range(n)]
def clicks(t0, t1, rate, gain=-31, seed=1):
    out, tt, k = [], t0, 0
    while tt < t1:
        out.append({"t": round(tt, 3), "sound": "lamp_switch_click", "gain_db": gain - (k % 3) * 2, "pan": (((k * 37 + seed) % 9) - 4) / 6.0, "room": -14}); tt += 1.0 / rate * (0.7 + 0.6 * (((k * 53 + seed) % 7) / 7)); k += 1
    return out

ev = [
    {"sound": "footsteps", "t0": 0.0, "t1": M1, "pan0": -0.3, "pan1": 0.3, "gain_db": -29, "rate": 2.2},
    {"sound": "footsteps", "t0": 0.2, "t1": M1, "pan0": 0.2, "pan1": -0.2, "gain_db": -31, "rate": 1.9},
    {"t": 1.5, "sound": "car_pass", "args": {"dur": 1.6, "size": 0.9}, "gain_db": -30, "pan": -0.5, "room": -18},
    {"t": 3.4, "sound": "car_pass", "args": {"dur": 1.5, "size": 1.0}, "gain_db": -29, "pan": 0.5, "room": -18},
    {"t": M1, "sound": "low_swell", "args": {"dur": 1.0, "pitch": 0.7}, "gain_db": -24, "pan": 0.0, "hall": -14},
    {"t": M1 + 0.4, "sound": "blanket_rustle", "args": {"dur": 0.6, "softness": 0.6, "intensity": 0.6, "strokes": 3}, "gain_db": -30, "pan": 0.0, "room": -16},
    {"sound": "footsteps", "t0": 7.1, "t1": 9.7, "pan0": -0.2, "pan1": 0.2, "gain_db": -31, "rate": 2.0},
    {"t": 7.6, "sound": "phone_pickup", "gain_db": -28, "pan": 0.1, "room": -16},
]
ev += boops(M1 + 0.03, 12, 0.72, gap=0.035)
ev += wag(LIES[0], 6, -26)
# cookie: the kid's wag, the jar knocked off (bonk) and smashing (a small soft crash), Mom's wag, the chair launched
ev += wag(LIES[1], 6, -27, -0.3)
ev += [{"t": 12.06, "sound": "bonk", "args": {"dur": 0.3}, "gain_db": -30, "pan": -0.2, "room": -16},
       {"t": 12.5, "sound": "car_crash", "args": {"dur": 0.6, "weight": 0.12}, "gain_db": -27, "pan": -0.1, "room": -14}]
ev += boops(12.55, 1, 0.55, gain=-26)
ev += [{"t": 12.72, "sound": "dog_bark", "args": {"pitch": 1.15}, "gain_db": -29, "pan": -0.1, "room": -16}]   # the family dog jumps at the crash
ev += wag(LIES[2], 6, -26, 0.3)
ev += [{"t": 14.47, "sound": "wood_snap", "args": {"dur": 0.4, "size": 0.35}, "gain_db": -27, "pan": 0.4, "room": -14},
       {"t": 14.95, "sound": "giant_step", "args": {"size": 0.45, "surface": "wood"}, "gain_db": -22, "pan": 0.5, "room": -14}]
# hire: the wag, the swivel squeak (a creak that spins), papers flapping
ev += wag(LIES[3], 4, -27)
ev += [{"t": 19.7, "sound": "floorboard_creak", "args": {"dur": 1.3}, "gain_db": -27, "pan": 0.0, "room": -16}]
ev += [{"t": round(19.95 + j * 0.17, 3), "sound": "blanket_rustle", "args": {"dur": 0.25, "softness": 0.2, "intensity": 0.5}, "gain_db": -30, "pan": ((j % 3) - 1) * 0.3, "room": -16} for j in range(6)]
ev += [{"t": 21.2, "sound": "pen_scribble", "args": {"dur": 0.4}, "gain_db": -31, "pan": 0.2, "room": -16}]
# date: the wag, the chair kicked out, the floor thump, then the whole room's tails (a chorus of swishes)
ev += wag(LIES[4], 4, -26, 0.2)
ev += [{"t": 24.8, "sound": "floorboard_creak", "args": {"dur": 0.35}, "gain_db": -28, "pan": 0.3, "room": -14},
       {"t": 25.05, "sound": "giant_step", "args": {"size": 0.5, "surface": "wood"}, "gain_db": -21, "pan": 0.2, "room": -14},
       {"t": 25.25, "sound": "wood_snap", "args": {"dur": 0.3, "size": 0.25}, "gain_db": -30, "pan": 0.45, "room": -14}]
for j in range(8):
    ev += wag(25.6 + j * 0.03, 3, -31, ((j % 5) - 2) * 0.25)
# bday: everybody's wag + cheer, six balloon pops, confetti
for j in range(4):
    ev += wag(LIES[5] + j * 0.05, 3, -30, (j - 1.5) * 0.3)
for j, pt in enumerate([30.3, 30.5, 30.72, 30.95, 31.2, 31.45]):
    ev.append({"t": pt, "sound": "bonk", "args": {"dur": 0.18}, "gain_db": -25, "pan": [0.0, 0.3, -0.3, 0.5, -0.5, 0.6][j], "room": -18})
    ev.append({"t": round(pt + 0.02, 3), "sound": "blanket_rustle", "args": {"dur": 0.3, "softness": 0.25, "intensity": 0.4}, "gain_db": -33, "pan": 0.0, "room": -18})
# lot: the wag, the bumper clang, the rotor whup-whup (thumps at every half turn), lift-off whoosh of air
ev += wag(LIES[6], 4, -26, -0.2)
ev += [{"t": 36.58, "sound": "metal_groan", "args": {"dur": 0.5, "pitch": 1.5}, "gain_db": -30, "pan": 0.0, "room": -14},
       {"t": 36.58, "sound": "car_crash", "args": {"dur": 0.5, "weight": 0.15}, "gain_db": -28, "pan": 0.0, "room": -14}]
k = 1
while True:
    tt = 36.45 + (k * 3.14159 / 4) ** 0.5
    if tt > 38.55: break
    ev.append({"t": round(tt, 3), "sound": "giant_step", "args": {"size": 0.22, "surface": "ground"}, "gain_db": -27 + min(4, k * 0.25), "pan": -0.2, "room": -18}); k += 1
# poker: the push (chips), five wags, the table rattle, the eruption + chip rain, the dealer's facepalm
ev += clicks(40.95, 41.35, 14, -31, 3)
for j in range(5):
    ev += wag(LIES[7] + j * 0.06, 3, -30, (j - 2) * 0.3)
ev += clicks(41.6, 42.0, 22, -33, 5)
ev += clicks(42.4, 43.9, 16, -32, 7)
ev += [{"t": 42.65, "sound": "mattress_sit", "gain_db": -32, "pan": 0.0, "room": -16}]
# press: shutter storm → the wag → both flags fall → total silence; three aborted tries (tiny swishes)
ev += clicks(44.3, 46.95, 3.2, -31, 2)
ev += clicks(46.95, 48.2, 9.0, -30, 4)
ev += wag(LIES[8], 6, -26, 0.2)
ev += [{"t": 47.8, "sound": "giant_step", "args": {"size": 0.4, "surface": "wood"}, "gain_db": -23, "pan": -0.3, "room": -14},
       {"t": 48.0, "sound": "giant_step", "args": {"size": 0.45, "surface": "wood"}, "gain_db": -22, "pan": 0.4, "room": -14},
       {"t": 47.82, "sound": "metal_groan", "args": {"dur": 0.4, "pitch": 1.8}, "gain_db": -34, "pan": -0.3, "room": -14}]
for tr in (48.5, 49.0, 49.45):
    ev += wag(tr, 2, -33, 0.2)
# court: murmur, Gary stands (chair scrape), the wag, three gavel bangs
ev += [{"t": 53.35, "sound": "floorboard_creak", "args": {"dur": 0.5}, "gain_db": -29, "pan": -0.2, "room": -14}]
ev += wag(LIES[9], 6, -25, -0.1)
for b in (54.4, 54.75, 55.1):
    ev.append({"t": b, "sound": "giant_step", "args": {"size": 0.55, "surface": "wood"}, "gain_db": -19, "pan": 0.1, "room": -12})
# end: the dog trots in, the hug, the happy spin + boofs
ev += [{"sound": "footsteps", "t0": 55.9, "t1": 57.6, "pan0": 0.5, "pan1": 0.1, "gain_db": -34, "rate": 4.0},
       {"t": 58.6, "sound": "blanket_rustle", "args": {"dur": 0.5, "softness": 0.8, "intensity": 0.5}, "gain_db": -31, "pan": 0.0, "room": -16},
       {"t": 61.55, "sound": "dog_bark", "args": {"pitch": 1.05}, "gain_db": -25, "pan": 0.1, "room": -18},
       {"t": 62.05, "sound": "dog_bark", "args": {"pitch": 1.1}, "gain_db": -26, "pan": 0.1, "room": -18}]
ev += wag(61.4, 8, -30, 0.1)

cues = {
    "title": "015 - What if every human grew a tail that wags when they lie? (sneaky lounge swing + wag trills, foley-led)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [69.4, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 1.5, "pad_reverb_db": -4.0, "mallet_db": -1.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad, "drums": drums,
              "stings": stings, "ducks": [{"t0": 48.25, "t1": 49.8, "db": -4.0, "ramp": 0.35}],
              "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else "videos/015-tail-lies/cues.json"
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(melody), "piano notes,", len(mallet), "mallet notes")
