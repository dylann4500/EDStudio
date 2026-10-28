#!/usr/bin/env python3
"""Cue sheet for 035 (funny doubling POV, unhinged): "What if your farts got 2x louder every time?" -> cues.json
Run: python3 -I videos/035-fart-doubling/make_cues.py

Sound identity (new — not 022's modulating string fanfare, 020's mallet wind-ups, 019's piano house or 016's gossip jazz):
  SOUND-LED. The farts are the instrument: a cartoon `toot` (audio/synth.py, 035) that grows from a tiny 380 Hz squeak (#1)
  to a tuba-sized bwaaamp with a sub thump (#19) — soft, low-passed, never realistic. Under it a CARTOON SNEAK score on the warm
  pluck: a tiptoe oom-pah in G minor (bass on 1+3, staccato stabs on 2+4) that never changes key but keeps adding layers as the
  dB climbs — a mallet ostinato from the library, a spiccato string drive + soft taiko from the street, a braam at the
  stadium, a wide pad for orbit — then G major at Grandma's: a slow warm pluck arpeggio and a little cadence.
  - 0–6.7 s: quiet bedroom only (room tone, a clock, two soft snores, the tiny squeak). The music ENTERS on #2 with a braam.
  - every place has its own bed: elevator hum, office keys, library hush, garden wind + murmur, the street, the lab's pen
    scratch, a roaring stadium that CUTS to dead silence at #15 (music stays, thinned), space rumble, a dinner table.
  - the music never drops out; gentle dips only."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 66.0
M1 = 6.7               # the premise: music enters on fart #2
BEAT = 0.5
# shot starts (mirror shots.js SHOTS)
SCENES = [0, 8.9, 13.9, 19.0, 23.9, 26.5, 29.6, 33.6, 37.6, 42.4, 46.2, 48.8, 51.8, 57.4]
# every fart (mirror shots.js FARTS)
FARTS = [(4.3, 1), (6.7, 2), (9.7, 3), (12.0, 4), (14.9, 5), (17.1, 6), (20.9, 7), (25.8, 8), (27.5, 9), (30.6, 10), (34.3, 11), (36.2, 12),
         (38.5, 13), (40.5, 14), (43.6, 15), (45.5, 16), (47.3, 17), (49.3, 18), (50.7, 19)]
F = {n: t for t, n in FARTS}
GRANDMA = 55.7
PAN = {1: 0.25, 2: 0.25, 3: 0.0, 4: 0.0, 5: -0.3, 6: -0.3, 7: 0.1, 8: -0.3, 9: 0.2, 10: -0.05, 11: 0.0, 12: 0.0, 13: 0.0, 14: 0.0, 15: 0.0, 16: 0.0, 17: 0.0, 18: 0.0, 19: 0.0}

# ---------------------------------------------------------------- music
SNEAK = ["Gm", "Eb", "Cm", "D"]
HOME = [[51.8, "G"], [53.4, "D/F#"], [55.0, "Em"], [GRANDMA, "C"], [57.4, "G"], [59.0, "D"], [60.6, "C"], [62.2, "G"], [63.8, "G"]]
chords = []
t, k = M1, 0
while t < 51.8 - 0.01:
    chords.append([round(t, 3), SNEAK[k % 4]]); t += 4 * BEAT; k += 1
chords += HOME
sections = [
    {"t0": M1, "t1": 29.6, "style": "bounce", "vel": [[M1, 0.36], [8.0, 0.3], [19.0, 0.32], [29.6, 0.34]], "step": BEAT, "bass_hold": 2.0, "stab_hold": 1.3},
    {"t0": 19.0, "t1": 48.8, "style": "ostinato", "vel": [[19.0, 0.16], [29.6, 0.2], [42.4, 0.22], [43.7, 0.13], [45.5, 0.22], [48.8, 0.24]], "step": BEAT / 2, "pattern": [0, 2, 1, 4, 2, 5, 1, 3], "bass_every": 0},
    {"t0": 29.6, "t1": 48.8, "style": "strings", "vel": [[29.6, 0.3], [42.4, 0.38], [43.7, 0.24], [45.5, 0.4], [48.8, 0.44]], "step": BEAT / 2, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
    {"t0": 48.8, "t1": 51.8, "style": "strings", "vel": [[48.8, 0.32], [50.7, 0.42], [51.8, 0.3]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.6, "len": 1.0},
    {"t0": 51.8, "t1": D, "style": "arp", "vel": [[51.8, 0.42], [55.0, 0.36], [GRANDMA, 0.44], [60.0, 0.5], [D, 0.42]], "step": 0.4, "pattern": [0, 1, 2, 3, 2, 1]},
]
# a sneaky tiptoe melody on top of the oom-pah (6.7 → 19.0), then it hands over to the mallet
melody = []
MOT = [(0, 67), (0.75, 70), (1.0, 69), (1.5, 67), (2.0, 66), (3.0, 62)]          # G Bb A G F# D — a cartoon creep
for bar0 in [M1 + 4 * BEAT * j for j in range(6)]:
    for dt, m in MOT:
        tt = bar0 + dt
        if tt < 19.0: melody.append([round(tt, 3), m, 0.26, False, 0.22])
# the ending: a warm little tune in G over the arp
melody += [[57.45, 71, 0.4, True, 1.2], [59.05, 74, 0.42, True, 1.2], [59.4, 79, 0.38, False, 0.5], [60.65, 76, 0.42, True, 1.2], [62.25, 74, 0.4, True, 1.3], [63.85, 71, 0.38, True, 1.8]]
drums = [[F[n], 0.25 + 0.035 * n, "boom"] for n in range(6, 20)] + [[M1, 0.55, "boom"], [GRANDMA, 0.9, "boom"], [29.6, 0.4, "taiko"], [42.4, 0.45, "taiko"]]
drum_patterns = [
    {"t0": 29.6, "t1": 43.5, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[29.6, 0.22], [43.5, 0.32]], "kind": "taiko"},
    {"t0": 45.5, "t1": 48.8, "step": BEAT, "pattern": [1, 0.5, 0.7, 0.5], "vel": [[45.5, 0.3], [48.8, 0.38]], "kind": "taiko"},
    {"t0": 50.1, "t1": 50.7, "step": 0.1, "pattern": [1], "vel": [[50.1, 0.12], [50.7, 0.42]], "kind": "tom"},
]
pad = [{"t0": M1, "t1": M1 + 2.0, "notes": [31, 38, 43, 50, 55], "level": 1.4, "attack": 0.1, "release": 0.8, "cutoff": 900, "hp": 30},          # braam
       {"t0": M1 + 1.6, "t1": 29.65, "notes": [31, 43, 50], "level": 0.55, "attack": 0.6, "release": 0.6, "cutoff": 650, "hp": 30},
       {"t0": 29.6, "t1": 48.85, "notes": [31, 43, 50, 55], "level": 0.75, "attack": 0.4, "release": 0.6, "cutoff": 750, "hp": 30},
       {"t0": 43.6, "t1": 45.3, "notes": [31, 38, 43, 50, 58], "level": 1.0, "attack": 0.08, "release": 0.8, "cutoff": 800, "hp": 30},   # the silence: a held low chord
       {"t0": 48.8, "t1": 51.85, "notes": [31, 38, 43, 50, 55, 62], "level": 0.9, "attack": 0.3, "release": 0.6, "cutoff": 1100, "hp": 30},
       {"t0": 50.7, "t1": 51.9, "notes": [31, 38, 43, 50, 55], "level": 1.4, "attack": 0.06, "release": 0.8, "cutoff": 1000, "hp": 30},    # braam: the shockwave
       {"t0": GRANDMA, "t1": GRANDMA + 1.4, "notes": [36, 43, 48, 55], "level": 1.2, "attack": 0.06, "release": 0.9, "cutoff": 900, "hp": 30}]  # braam: Grandma
for c0, sym in chords:   # a soft chord pad under the staccato sneak so the music never reads as cutting out
    if M1 + 1.0 <= c0 < 29.6: pad.append({"t0": c0, "t1": c0 + 4 * BEAT + 0.3, "chord": sym, "level": 3.2, "attack": 0.25, "release": 0.6})
for i, (c0, sym) in enumerate(HOME):
    c1 = HOME[i + 1][0] if i + 1 < len(HOME) else D - 0.2
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": sym, "level": 2.0, "attack": 0.15, "release": 0.8})

# ---------------------------------------------------------------- ambience (one bed per place)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("room_tone", 0.0, 8.95, -34, fi=0.5), bed("clock", 0.0, 8.95, -48, seed=2),
    bed("cabin_hum", 8.9, 13.95, -40, seed=3), bed("room_tone", 8.9, 13.95, -36, seed=4),
    bed("room_tone", 13.9, 19.05, -36, seed=5), bed("city_day", 13.9, 19.05, -50, args={"murmur": 0.3, "traffic": 0.4}, seed=6),
    bed("room_tone", 19.0, 23.95, -38, seed=7), bed("clock", 19.0, 23.95, -50, seed=8),
    bed("wind", 23.9, 29.65, -42, args={"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, seed=9), bed("city_day", 23.9, 29.65, -44, args={"murmur": 0.6, "traffic": 0.0}, seed=10),
    bed("city_day", 29.6, 37.65, -36, args={"murmur": 0.6, "traffic": 0.8}, seed=11),
    bed("room_tone", 37.6, 42.45, -36, seed=12), bed("lamp_hum", 37.6, 42.45, -48, seed=13),
    bed("crowd_cheer", 42.3, F[15] + 0.02, -27, fi=0.1, fo=0.05, args={"excite": 1.0}, seed=14),
    bed("wind", F[16] + 0.4, 48.85, -42, fi=0.6, args={"darkness": 0.5, "gust": 0.5, "whistle": 0.0}, seed=15),
    bed("room_tone", 48.8, 51.85, -44, seed=16),
    bed("room_tone", 51.8, D, -38, fi=0.2, fo=1.0, seed=17), bed("clock", 51.8, GRANDMA, -50, seed=18),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})
def toot(n, room=-16, g_extra=0.0):
    s = ((n - 1) / 18) ** 0.85
    E(F[n], "toot", -24 + 9 * s + g_extra, PAN[n], {"size": round(s, 3), "pitch": round(1.0 + 0.06 * ((n * 7) % 5 - 2), 3)}, room=room)

for n in range(1, 20):
    toot(n, room=-10 if n in (15, 16, 17) else -16)
# 1. bed: snores, the squeak, the dog's ear; #2: duvet whoosh-free rustle, she sits up, the dog barks + jumps, the clock clunks
E(0.6, "snore", -36, 0.2, {"dur": 2.0, "size": 0.7}); E(2.7, "snore", -37, 0.2, {"dur": 1.8, "size": 0.7})
E(4.6, "plush_squeak", -36, 0.1, {"pitch": 1.6})
E(F[2] + 0.02, "blanket_rustle", -27, 0.0, {"dur": 0.9, "softness": 0.5, "intensity": 0.9})
E(F[2] + 0.06, "mattress_sit", -30, -0.3); E(F[2] + 0.2, "dog_bark", -28, 0.3, {"pitch": 1.2}); E(F[2] + 0.75, "giant_step", -32, 0.4, {"size": 0.2, "surface": "wood"})
E(F[2] + 0.52, "clunk", -31, 0.45, {"size": 0.3, "metal": 0.2})
# 2. elevator: a ding, #3, #4 the car drops (clang), papers, the lid pops
E(9.0, "gold_chime", -33, 0.0, {"notes": [76, 72], "spacing": 0.3, "vel": 0.35, "dur": 1.0})
E(F[4] + 0.03, "metal_clang", -27, 0.0, {"size": 0.8, "pitch": 0.7}); E(F[4] + 0.06, "blanket_rustle", -30, 0.3, {"dur": 0.7, "softness": 0.3, "intensity": 0.8})
E(F[4] + 0.08, "pop", -32, 0.35, {"pitch": 1.3})
# 3. office: keys + pen, #6 the paper blizzard, the CEO's chair rolls, the slow clap
E(13.95, "keyboard_type", -40, 0.3, {"dur": 0.5, "rate": 12.0})
E(F[6] + 0.05, "blanket_rustle", -24, 0.0, {"dur": 1.6, "softness": 0.2, "intensity": 1.0}); E(F[6] + 0.1, "grate", -33, 0.5, {"dur": 0.6})
for k in range(4): E(18.1 + 0.45 * k + 0.05, "knock", -31, 0.45, {"pitch": 1.6})
# 4. library: tiptoes, a soft "shh", #7 the books: a cascade of soft thuds, the sign falls
steps(19.0, 20.75, -38, 1.4, 0.1, -0.1)
E(20.15, "blanket_rustle", -38, -0.3, {"dur": 0.6, "softness": 0.9, "intensity": 0.4})
for k in range(9): E(F[7] + 0.35 + 0.11 * k, "giant_step", -31 + (k % 3), (-0.6 if k % 2 else 0.6), {"size": 0.15, "surface": "wood"})
E(F[7] + 0.55, "wood_snap", -31, 0.2, {"dur": 0.4, "size": 0.4}); E(F[7] + 0.06, "blanket_rustle", -29, 0.0, {"dur": 1.2, "softness": 0.4, "intensity": 0.7})
# 5. wedding: a gasp (soft swell) after #8, #9: veil + petals flutter, chairs creak
E(F[8] + 0.2, "low_swell", -32, 0.0, {"dur": 0.6, "pitch": 1.2})
E(F[9] + 0.05, "blanket_rustle", -25, 0.0, {"dur": 1.6, "softness": 0.4, "intensity": 0.9})
for k in range(3): E(F[9] + 0.2 + 0.08 * k, "floorboard_creak", -33, (k - 1) * 0.4, {"dur": 0.4})
# 6. street: a bite, #10 every car alarm on the block + pigeons + the umbrella flapping; #11 curtains, #12 glass
E(30.05, "slurp", -38, 0.0, {"dur": 0.3})
for k, (pan, pitch) in enumerate([(-0.5, 1.0), (0.4, 0.92), (-0.1, 1.08), (0.7, 0.85)]):
    E(F[10] + 0.1 + 0.12 * k, "car_alarm", -31 - 2 * k, pan, {"dur": 37.6 - F[10] - 0.3 - 0.12 * k, "pitch": pitch, "rate": 2.4 + 0.3 * k}, room=-14)
E(F[10] + 0.05, "wing_flutter", -26, 0.3, {"dur": 1.5, "n_birds": 12}); E(F[10] + 0.08, "blanket_rustle", -30, 0.2, {"dur": 0.8, "softness": 0.3, "intensity": 0.8})
E(F[11] + 0.1, "blanket_rustle", -27, 0.0, {"dur": 1.3, "softness": 0.4, "intensity": 0.9})
E(F[12] + 0.1, "glass_crack", -26, -0.3); E(F[12] + 0.18, "glass_crack", -27, 0.35); E(F[12] + 0.3, "glass_crack", -29, 0.0)
for k in range(6): E(F[12] + 0.7 + 0.13 * k, "plip", -35, (k % 3 - 1) * 0.4, {"pitch": 1.4 + 0.1 * k})
# 7. lab: the pen scratching, the spike, #14 the arm hits its stop, chairs roll back, mugs
for k in range(6): E(37.7 + 0.8 * k, "pen_scribble", -40, 0.1, {"dur": 0.7})
E(F[13] + 0.05, "pen_scribble", -31, 0.1, {"dur": 0.6})
E(F[14] + 0.06, "metal_clang", -28, 0.1, {"size": 0.4, "pitch": 1.5}); E(F[14] + 0.12, "grate", -31, -0.4, {"dur": 0.7}); E(F[14] + 0.14, "grate", -32, 0.4, {"dur": 0.7})
E(F[14] + 0.25, "knock", -32, -0.5, {"pitch": 1.2}); E(F[14] + 0.3, "knock", -32, 0.5, {"pitch": 1.1})
# 8. stadium: the roar → #15 dead silence (one far whistle of wind) → #16 hats + popcorn → #17 the net, a far boom
E(F[15] + 0.6, "low_swell", -34, 0.0, {"dur": 1.0, "pitch": 0.7})
E(F[16] + 0.06, "blanket_rustle", -27, 0.0, {"dur": 1.4, "softness": 0.3, "intensity": 0.9})
E(F[17] + 0.05, "distant_boom", -24, 0.0, {"size": 1.0}); E(F[17] + 0.2, "metal_groan", -31, -0.3, {"dur": 0.7, "pitch": 1.2})
# 9. orbit: the rumble, two far booms
E(48.85, "low_swell", -30, 0.0, {"dur": 1.4, "pitch": 0.5}); E(F[18] + 0.02, "distant_boom", -26, 0.0, {"size": 1.2}); E(F[19] + 0.02, "distant_boom", -22, 0.0, {"size": 1.6})
# 10. dinner: cutlery, a heartbeat while you hold it in, GRANDMA (the biggest toot of all), candles out, napkins, plates,
#     a slurp of tea, the fist bump, everyone laughing (a bright pluck flourish carries it)
for k in range(8): E(52.0 + 0.4 * k + 0.07 * (k % 3), "plip", -38, (k % 3 - 1) * 0.5, {"pitch": 2.0 + 0.2 * (k % 3)})
for k in range(4): E(53.75 + 0.42 * k, "heartbeat", -30 + k, 0.0, {"size": 0.8})
E(GRANDMA, "toot", -12, 0.25, {"size": 1.0, "pitch": 0.82, "dur": 1.6}, room=-14)
E(GRANDMA + 0.02, "distant_boom", -27, 0.0, {"size": 0.8})
E(GRANDMA + 0.1, "blanket_rustle", -26, 0.0, {"dur": 1.2, "softness": 0.4, "intensity": 0.9})
E(GRANDMA + 0.15, "candy_rattle", -31, -0.2); E(GRANDMA + 0.2, "grate", -32, -0.5, {"dur": 0.5}); E(GRANDMA + 0.22, "grate", -32, 0.5, {"dur": 0.5})
E(GRANDMA + 0.45, "slurp", -30, 0.25, {"dur": 0.5})
E(59.35, "pop", -28, 0.0, {"pitch": 0.9})

cues = {
    "title": "035 - What if your farts got 2x louder every time? (funny doubling POV, sound-led: cartoon toots that grow from a squeak to a tuba over a pluck cartoon-sneak that keeps adding layers)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [65.4, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "pluck", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0, "strings_db": 6.0, "mallet_db": -4.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -4.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.5, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(chords), "chords")
