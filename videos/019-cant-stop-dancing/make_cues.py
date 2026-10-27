#!/usr/bin/env python3
"""Cue sheet for 019 (montage, unhinged): "What if everyone on Earth couldn't stop dancing?" -> cues.json
Run: python3 -I videos/019-cant-stop-dancing/make_cues.py

Sound identity (new — not 018's strings heist, 014's music box, 013's pluck slip, 012's pizzicato or 002's oom-pah):
  SOFT PIANO HOUSE — A minor Dorian, 120 bpm, locked to the dance beat in shots.js (beat 0 = M1 = 5.5 s): a round four-on-the-
  floor kick (new synth drum `kick`), a low-passed clap on 2 + 4 (new `clap`), an octave-bouncing piano bass with off-beat chord
  stabs (new section style `disco`), a warm pad, and one catchy mallet hook (the song stuck in 8.2 billion heads) every 2 bars.
  - 0–5.5 s: a silent library — room tone, page turns, two rubber stamps. A soft riser, then the beat DROPS at 5.5 (braam + boom).
  - Am7 | D7 vamp for the montage; a lift (Fmaj7 – G – Em7 – Am7) for the stadium drop and the fit-year time-lapse;
    a tom roll into the stadium jump; a boom on every beat's big physical moment.
  - 58.0: the warm turn — half-time kick, piano arp on C – G/B – Am7 – Fmaj7, the hook slowed down on piano. Never drops out.
  - foley-led places: chairs + books clatter, tray clinks, cabin hum + masks, conga steps + product falls + a can avalanche,
    shutter clicks + chair dominoes, a coffin catch, spoon clinks + a bowl bonk + cereal patter, a stadium roar + a quake rumble,
    the worm's thumps + a stamp, a banner slam, a city that is one street party at dusk."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 69.5
M1, BEAT = 5.5, 0.5
S8 = BEAT / 2
SCENES = [0, 9.4, 14.8, 20.2, 25.6, 28.3, 31.0, 36.4, 41.8, 47.2, 52.6, 58.0, 65.5]
beat_t = lambda n: M1 + n * BEAT

# ---------------------------------------------------------------- picture sync (mirrors shots.js)
LSTAND, SIGN_FALL = M1 + 2 * BEAT, 7.55
OR_DROP, TRAY_T = 12.4, 12.95
PL_DROP = 17.6
KICKS = [beat_t(4 * n + 3) for n in range(200) if 20.3 < beat_t(4 * n + 3) < 25.5]      # conga kicks (21.0, 23.0, 25.0)
PYR_T = beat_t(39)
MOON0, MOON1, PRESS_UP = 26.75, 28.05, 29.0
ROWS = [29.45 + r * 0.22 + 0.3 for r in range(4)]
TOSS0, TOSS1 = 34.45, 35.3
FLIP0, FLIP1 = 40.25, 40.75
ST_CROUCH, ST_JUMP, ST_LAND = 44.5, 45.0, 45.5
WORM0, WORM1, STAMP = 49.75, 51.55, 51.75
CLOSED_T = 55.45
END = 58.0

# ---------------------------------------------------------------- music
chords = []
def bars(t0, t1, prog, per=4 * BEAT):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += per; k += 1
bars(M1, 41.8, ["Am7", "D7"])
bars(41.8, 47.2, ["Fmaj7", "G", "Em7", "Am7"])          # stadium: the lift into the drop
bars(47.2, 52.6, ["Am7", "D7"])
bars(52.6, END, ["Fmaj7", "G", "Em7", "Am7"])           # fit-year time-lapse: triumphant lift
bars(END, 65.5, ["C", "G/B", "Am7", "Fmaj7"])            # the warm turn (one chord per bar)
chords += [[65.5, "C"], [67.3, "Fmaj7"], [68.4, "C"]]

sections = [
    {"t0": M1, "t1": 36.4, "style": "disco", "vel": [[M1, 0.5], [9.4, 0.44], [36.4, 0.46]], "step": S8, "stab_vel": 0.42, "stab_hold": 0.8, "bass_hold": 0.95},
    {"t0": 36.4, "t1": 41.8, "style": "disco", "vel": 0.42, "step": S8, "stab_vel": 0.28, "stab_hold": 0.7, "bass_hold": 0.95},   # kitchen: lighter
    {"t0": 41.8, "t1": END, "style": "disco", "vel": [[41.8, 0.46], [45.5, 0.52], [END, 0.46]], "step": S8, "stab_vel": 0.45, "stab_hold": 0.8, "bass_hold": 0.95},
    {"t0": END, "t1": 65.5, "style": "arp", "vel": [[END, 0.5], [62.0, 0.52], [65.5, 0.46]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 65.5, "t1": D, "style": "arp", "vel": 0.4, "step": BEAT, "pattern": [0, 2, 1, 3, 2, 1]},
]

# the hook: 2 bars over Am7 | D7, 8th-note grid (index, semitones above A4)
HOOK = [(0, 0), (2, 0), (3, 3), (5, 5), (6, 7), (8, 9), (10, 7), (11, 5), (12, 3), (14, 0)]
mallet_melody = []
def hook(t0, t1, octave=0, vel=0.3, every=2):
    t, k = t0, 0
    while t < t1 - 0.05:
        if k % every == 0:
            for i, s in HOOK:
                ti = t + i * S8
                if ti < t1 - 0.05: mallet_melody.append([round(ti, 3), 69 + s + 12 * octave, vel * (1.0 if i in (0, 8) else 0.82), S8 * 0.85])
        t += 8 * BEAT; k += 1
hook(M1, 41.8)
hook(47.2, 52.6)
# the stadium + fit-year lift: the hook transposed onto F (a third up = brighter), then back home
for t0 in (41.8, 52.6):
    for b in range(0, 2):
        tb = t0 + b * 8 * BEAT
        for i, s in HOOK:
            ti = tb + i * S8
            if ti < min(t0 + 5.4, END) - 0.05: mallet_melody.append([round(ti, 3), 72 + s, 0.28 * (1.0 if i in (0, 8) else 0.82), S8 * 0.85])
# OR: the heart monitor beeps on every beat (a soft high mallet "boop")
for n in range(200):
    tb = beat_t(n)
    if 9.5 < tb < 14.75: mallet_melody.append([round(tb + 0.01, 3), 88, 0.16, 0.12])

# the warm ending: the hook, slowed to half speed on piano (octave-doubled)
melody = []
for i, s in HOOK:
    ti = END + 0.02 + i * BEAT
    if ti < 65.2: melody.append([round(ti, 3), 69 + s + 3, 0.34, True, 0.9])   # in C: the same contour starting on C5
for i, s in HOOK[:6]:
    ti = 65.55 + i * BEAT * 0.9
    if ti < D - 0.6: melody.append([round(ti, 3), 72 + s, 0.3, True, 1.0])
melody.append([68.4, 72, 0.3, True, 1.0])

drums = [[M1, 0.85, "boom"], [LSTAND + 0.3, 0.4, "boom"], [TRAY_T, 0.45, "boom"], [PL_DROP, 0.4, "boom"], [PYR_T + 0.1, 0.55, "boom"],
         [ROWS[-1], 0.55, "boom"], [TOSS1, 0.6, "boom"], [FLIP1, 0.5, "boom"], [ST_LAND, 0.95, "boom"], [ST_LAND, 0.6, "taiko"],
         [WORM0, 0.35, "boom"], [STAMP, 0.35, "taiko"], [CLOSED_T, 0.5, "boom"], [65.5, 0.4, "boom"]]
drum_patterns = [
    {"t0": M1, "t1": ST_CROUCH, "step": BEAT, "pattern": [1], "vel": [[M1, 0.62], [9.4, 0.55], [41.8, 0.58]], "kind": "kick"},
    {"t0": ST_LAND, "t1": END, "step": BEAT, "pattern": [1], "vel": [[ST_LAND, 0.62], [END, 0.55]], "kind": "kick"},
    {"t0": beat_t(3), "t1": ST_CROUCH, "step": 2 * BEAT, "pattern": [1], "vel": 0.42, "kind": "clap"},          # 2 + 4
    {"t0": ST_LAND + BEAT, "t1": END, "step": 2 * BEAT, "pattern": [1], "vel": 0.42, "kind": "clap"},
    {"t0": ST_CROUCH, "t1": ST_JUMP + 0.01, "step": 0.0625, "pattern": [1], "vel": [[ST_CROUCH, 0.14], [ST_JUMP, 0.5]], "kind": "tom"},   # roll into the jump
    {"t0": ST_JUMP, "t1": ST_LAND, "step": BEAT, "pattern": [1], "vel": 0.5, "kind": "kick"},
    {"t0": END, "t1": 63.0, "step": 2 * BEAT, "pattern": [1], "vel": [[END, 0.42], [63.0, 0.25]], "kind": "kick"},  # half-time, fading
]
pad = [
    {"t0": M1, "t1": M1 + 4 * BEAT + 0.05, "notes": [33, 40, 45, 52, 57], "level": 1.4, "attack": 0.1, "release": 0.8, "cutoff": 900, "hp": 30},   # braam on the drop
    {"t0": 4.6, "t1": M1 + 0.02, "notes": [57, 64, 69], "level": 0.55, "attack": 0.8, "release": 0.15, "cutoff": 1400},                         # soft riser into the drop
]
for i, (c0, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    lvl = 1.7 if c0 >= END else 0.62
    pad.append({"t0": c0, "t1": c1 + 0.3, "chord": sym, "level": lvl, "attack": 0.12, "release": 0.6, "cutoff": 1300 if c0 < END else 1500})
pad.append({"t0": ST_CROUCH - 0.4, "t1": ST_LAND + 0.05, "notes": [41, 48, 53, 57, 60], "level": 0.9, "attack": 0.6, "release": 0.3, "cutoff": 1800})   # the build under the roll

# ---------------------------------------------------------------- ambience (one bed per place)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("room_tone", 0.0, 9.45, -33, fi=0.4, seed=1),
    bed("room_tone", 9.4, 14.85, -35, seed=2), bed("lamp_hum", 9.4, 14.85, -55, seed=3),
    bed("cabin_hum", 14.8, 20.25, -33, seed=4),
    bed("room_tone", 20.2, 25.65, -37, seed=5), bed("city_day", 20.2, 25.65, -42, args={"murmur": 0.8, "traffic": 0.0}, seed=6),
    bed("room_tone", 25.6, 31.05, -37, seed=7), bed("applause", 29.9, 31.05, -38, fi=0.3, args={"density": 22.0}, seed=8),
    bed("wind", 31.0, 36.45, -45, args={"darkness": 0.5, "gust": 0.25, "whistle": 0.0}, seed=9), bed("dry_leaves", 31.0, 36.45, -47, args={"density": 0.4}, seed=10),
    bed("crowd_cheer", TOSS1 + 0.1, 36.45, -36, fi=0.2, seed=11),
    bed("room_tone", 36.4, 41.85, -36, seed=12),
    bed("crowd_cheer", 41.8, 47.25, -31, seed=13), bed("applause", 41.8, 47.25, -37, args={"density": 40.0}, seed=14),
    bed("crowd_cheer", ST_LAND - 0.05, 47.25, -27, fi=0.08, seed=15),
    bed("room_tone", 47.2, 52.65, -36, seed=16), bed("traffic_flow", 47.2, 52.65, -48, args={"density": 0.4}, seed=17),
    bed("city_day", 52.6, 58.05, -38, args={"murmur": 0.6, "traffic": 0.7}, seed=18), bed("wind", 54.9, 57.3, -45, fi=0.3, fo=0.3, args={"darkness": 0.6, "gust": 0.5, "whistle": 0.0}, seed=19),
    bed("city_day", 58.0, D, -41, fo=1.2, args={"murmur": 1.0, "traffic": 0.3}, seed=20), bed("crowd_cheer", 61.0, D, -44, fi=2.0, fo=1.2, seed=21),
    bed("crickets", 62.0, D, -48, fi=2.0, fo=1.0, args={"count": 3, "density": 0.5}, seed=22),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})
def thud(t, g, size=0.35, surface="wood", pan=0.0):
    E(t, "giant_step", g, pan, {"size": size, "surface": surface})

# 1. library: page turns, two rubber stamps, a riser, THE DROP; chairs tip, books rain, the QUIET PLEASE sign falls
for t, p in ((1.2, -0.3), (2.3, 0.3), (3.6, -0.2)): E(t, "blanket_rustle", -33, p, {"dur": 0.35, "softness": 0.8, "intensity": 0.4, "strokes": 1})
for t in (2.75, 4.55): E(t, "phone_set_down_wood", -29, -0.05)
steps(0.3, 5.3, -33, 1.6, 0.0, 0.05)                                        # the student walking down the aisle
E(M1 + 0.75, "plush_place", -26, 0.05)                                      # the walker's books hit the floor
E(M1 - 0.5, "low_swell", -27, 0.0, {"dur": 0.6, "pitch": 0.8})
for i in range(8): thud(LSTAND + 0.28 + 0.025 * i, -26 - (i % 3), 0.28, "wood", ((i % 4) - 1.5) * 0.25)
for i in range(7): E(LSTAND + 0.85 + i * 0.11, "plush_place", -27 - (i % 3), 0.35 - 0.1 * i)
thud(SIGN_FALL + 0.38, -23, 0.42, "wood", 0.1); E(SIGN_FALL + 0.4, "metal_clang", -31, 0.1, {"size": 0.4, "pitch": 1.6})
# 2. OR: the lamp creaks round, the tray launches (clinks up, clinks down)
E(OR_DROP + 0.05, "metal_groan", -31, 0.0, {"dur": 0.6, "pitch": 2.0})
for k in range(6): E(TRAY_T + 0.02 * k, "metal_clang", -29 + (k % 2), 0.3, {"size": 0.22, "pitch": 2.6 + 0.12 * k})
for k in range(6): E(TRAY_T + 1.05 + 0.07 * k, "metal_clang", -30, 0.25 - 0.08 * k, {"size": 0.2, "pitch": 2.4 + 0.1 * (k % 3)})
# 3. plane: masks drop (soft fwumps back to front), a little rattle
E(PL_DROP - 0.15, "low_swell", -30, 0.0, {"dur": 0.35, "pitch": 1.1})
for k in range(6): E(PL_DROP + 0.04 * k, "plush_place", -28 - (k % 2), ((k % 3) - 1) * 0.3)
E(PL_DROP + 0.25, "keyboard_type", -34, 0.0, {"dur": 0.6, "rate": 14.0})
# 4. market: conga steps on beats 1–3, kicks knock products down, the can avalanche
for n in range(200):
    tb = beat_t(n)
    if 20.25 < tb < 25.55 and n % 4 != 3: thud(tb, -31, 0.2, "ground", 0.0)
for kt in KICKS:
    for k in range(5): E(kt + 0.55 + 0.09 * k, "plush_place", -28 - (k % 3), (-0.4 if (KICKS.index(kt) % 2 == 0) else 0.4))
for k in range(9): E(PYR_T + 0.12 + 0.07 * k, "metal_clang", -26 - (k % 3), 0.35 - 0.06 * k, {"size": 0.35 + 0.05 * (k % 3), "pitch": 1.8 + 0.15 * (k % 4)})
# 5. press: shutter clicks (faster from the moonwalk), the chairs topple row by row, a little applause
t = 25.65
while t < 30.9:
    E(t, "lamp_switch_click", -32, ((int(t * 7) % 5) - 2) * 0.2); t += 1 / (2.0 if t < MOON0 else 4.5)
for r, t in enumerate(ROWS): thud(t, -24 if r == 3 else -27, 0.4, "wood", ((r % 3) - 1) * 0.25)
E(MOON1 + 0.1, "plush_squeak", -29, 0.2, {"pitch": 0.9})
# 6. funeral: grass steps on the bounce, the toss (a soft swell), the catch
for n in range(200):
    tb = beat_t(n)
    if 31.05 < tb < 36.35 and not (TOSS0 - 0.1 < tb < TOSS1 + 0.1): thud(tb, -32, 0.22, "ground", 0.0)
E(TOSS0 - 0.1, "low_swell", -27, 0.0, {"dur": 0.6, "pitch": 0.9})
thud(TOSS1, -21, 0.5, "wood", 0.0)
# 7. kitchen: a spoon clink every beat, one slurp attempt, the bowl flip + bonk, cereal patter
for n in range(200):
    tb = beat_t(n) + 0.55 * BEAT
    if 36.5 < tb < FLIP0: E(tb, "metal_clang", -33, 0.15, {"size": 0.15, "pitch": 3.0})
E(37.4, "slurp", -30, 0.05, {"dur": 0.4})
E(FLIP0 + 0.05, "low_swell", -29, 0.0, {"dur": 0.4, "pitch": 1.2})
E(FLIP1, "bonk", -22, 0.0); E(FLIP1 + 0.02, "plush_squeak", -28, 0.0, {"pitch": 0.7})
E(FLIP1 + 0.1, "keyboard_type", -33, 0.0, {"dur": 0.9, "rate": 20.0})
# 8. stadium: the crowd jumps on every beat (soft thumps), the crouch, THE LAND = a quake rumble
for n in range(200):
    tb = beat_t(n)
    if 41.85 < tb < ST_CROUCH: thud(tb, -33, 0.6, "ground", 0.0)
E(ST_CROUCH, "low_swell", -25, 0.0, {"dur": 0.9, "pitch": 0.7})
thud(ST_LAND, -18, 1.2, "ground", 0.0); E(ST_LAND + 0.05, "distant_boom", -21, 0.0, {"size": 1.4})
# 9. office: papers fly, the worm (a soft floor thump per beat), the stamp
E(49.0, "blanket_rustle", -30, -0.1, {"dur": 0.9, "softness": 0.7, "intensity": 0.6, "strokes": 2})
thud(WORM0, -24, 0.4, "wood", 0.2)
for n in range(200):
    tb = beat_t(n)
    if WORM0 + 0.2 < tb < WORM1: thud(tb, -30, 0.22, "wood", 0.2 - 0.25 * (tb - WORM0))
E(STAMP, "bonk", -25, 0.1); E(STAMP + 0.02, "phone_set_down_wood", -27, 0.1)
# 10. street: dance steps on the sidewalk, the CLOSED FOREVER banner slams on
for n in range(200):
    tb = beat_t(n)
    if 52.65 < tb < 57.95: thud(tb, -34, 0.18, "ground", 0.1)
E(CLOSED_T - 0.25, "low_swell", -30, 0.0, {"dur": 0.3, "pitch": 1.2}); thud(CLOSED_T, -22, 0.45, "wood", -0.1)
# 11. rooftop: soft steps of the slow dance; the city is one street party below
steps(58.2, 61.5, -36, 1.0, -0.1, 0.1)

cues = {
    "title": "019 - What if everyone on Earth couldn't stop dancing? (montage: soft piano house — kick + clap + octave bass + mallet hook)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.6, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 8.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -11.0, "pad_db": 0.0, "pad_reverb_db": -6.0, "mallet_db": -2.0, "drums_db": -6.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet_melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events; conga kicks", KICKS, "pyramid", PYR_T)
