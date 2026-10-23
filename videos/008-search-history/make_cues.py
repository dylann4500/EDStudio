# Generates cues.json for video 008 (montage/funny: "sus" — search histories above everyone's head).
# Run: python3 -I videos/008-search-history/make_cues.py videos/008-search-history/cues.json
#
# Sound identity (not a copy of 002's bouncy piano or 007's synth arps):
#   - 0–7 s: no music, just a busy street (steps + murmur). At 9:00 the cards pop (a ripple of soft low boops), the crowd
#     murmur stops dead (nobody makes eye contact) and the SNEAKY groove starts.
#   - the groove: a D-minor pizzicato "oom-pah" (pluck voice in the bounce style, 120 bpm) + a creeping chromatic marimba
#     motif at the start of every place — detective / "caught you" energy, soft and low-passed.
#   - every place has its own bed (street, classroom, war room, dusk wind at the border, grandma's quiet room) + soft boops
#     each time a history row appears, synced to shots.js. Punch lines get one low pizz "plonk", never a gap.
#   - grandma turns it warm (F major, slow arp); the ending stays warm while the street murmur comes back.
import json, sys

D = 68.0
SCENES = [0, 10.0, 16.5, 23.0, 29.5, 36.0, 42.5, 49.0, 55.5, 63.0]
POP = 7.0

chords = []
prog = ["Dm", "Dm", "Bb", "A"]               # sneaky minor loop, 2 s per chord
t, k = POP, 0
while t < 49.0 - 1e-6:
    chords.append([round(t, 3), prog[k % 4]]); t += 2.0; k += 1
warm = ["F", "C/E", "Dm", "Bb"]               # grandma → ending: relative major, warm
t, k = 49.0, 0
while t < 63.0 - 1e-6:
    chords.append([round(t, 3), warm[k % 4]]); t += 1.75 if t < 55.5 else 2.0; k += 1
chords += [[63.0, "Bb"], [65.0, "F"]]

sections = [
    {"t0": POP, "t1": 49.0, "style": "bounce", "vel": [[POP, 0.2], [16.5, 0.23], [36.0, 0.26], [49.0, 0.26]], "step": 0.5,
     "bass_hold": 2.2, "stab_hold": 1.4},
    {"t0": 49.0, "t1": 63.0, "style": "arp", "vel": [[49.0, 0.22], [58.7, 0.26], [63.0, 0.26]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 63.0, "t1": D, "style": "arp", "vel": 0.22, "step": 0.5, "pattern": [0, 2, 1, 3]},
]

# creeping chromatic marimba motif (D minor) at each place; the last notes "lean" on the tritone = sus
def motif(t0, base=62, vel=0.42):
    seq = [(0.0, 0), (0.5, 3), (0.75, 4), (1.0, 5), (1.5, 7), (2.0, 8), (2.25, 7), (2.75, 6), (3.0, 5)]
    return [[round(t0 + dt, 3), base + n, vel * (1.0 if i % 2 == 0 else 0.82), 0.16] for i, (dt, n) in enumerate(seq)]
mallet_melody = []
for s0 in [POP + 0.5, 10.3, 16.8, 23.3, 29.8, 36.3, 42.8]:
    mallet_melody += motif(s0, 62 if s0 < 29 else 64)
# warm turn: a gentle descending line on the marimba for grandma + the ending
for t0, m in [(49.3, 81), (50.0, 79), (50.75, 77), (51.5, 76), (53.0, 77), (53.75, 76), (54.5, 72),
              (58.7, 81), (59.4, 79), (60.1, 77), (60.9, 76), (61.6, 74), (62.3, 72), (63.6, 77)]:
    mallet_melody.append([t0, m, 0.32, 0.5])

pad = []
for i, (c0, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.05, "chord": sym, "level": 0.6 if c0 < 49 else 0.75, "attack": 0.3, "release": 0.5})

# one continuous drone under the chord pads (pluck notes decay fast; pad crossfades alone left 50 ms holes)
pad += [{"t0": POP, "t1": 49.3, "chord": "Dm", "level": 0.85, "attack": 0.4, "release": 0.6},
        {"t0": 49.0, "t1": D - 0.3, "chord": "F", "level": 0.85, "attack": 0.6, "release": 0.6}]

# punch lines: one low pizz plonk each (continuous music — no rests)
stings = [{"t": tt, "midi": m, "vel": 0.32, "hold": 0.9} for tt, m in [(15.0, 38), (21.0, 41), (28.3, 38), (33.5, 37), (40.0, 38), (46.3, 37)]]
ducks = []
# soft pizz pickups into the chord changes where the groove thinned out (dropout check)
pickups = [[34.75, 57, 0.22, False, 0.3], [34.88, 59, 0.2, False, 0.25]]

amb = [
    # street before 9:00: voices + traffic as two layers so the voices can stop when the cards pop
    {"sound": "city_day", "t0": 0.0, "t1": 7.35, "fade_in": 0.3, "fade_out": 0.25, "gain_db": -38, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 1},
    {"sound": "city_day", "t0": 0.0, "t1": 10.05, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -40, "args": {"murmur": 0.0, "traffic": 0.8}, "seed": 2},
    {"sound": "city_day", "t0": 10.0, "t1": 16.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"murmur": 0.25, "traffic": 0.7}, "seed": 3},
    {"sound": "room_tone", "t0": 16.5, "t1": 23.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 16.5, "t1": 23.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -54, "args": {"murmur": 0.0, "traffic": 0.6}, "seed": 4},
    {"sound": "city_day", "t0": 23.0, "t1": 29.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"murmur": 0.3, "traffic": 0.6}, "seed": 5},
    {"sound": "room_tone", "t0": 29.5, "t1": 36.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -39},
    {"sound": "lamp_hum", "t0": 29.5, "t1": 36.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -54},
    {"sound": "city_day", "t0": 36.0, "t1": 42.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"murmur": 0.3, "traffic": 0.6}, "seed": 6},
    {"sound": "wind", "t0": 42.5, "t1": 49.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"darkness": 0.85, "gust": 0.3, "whistle": 0.0}, "seed": 3},
    {"sound": "room_tone", "t0": 49.0, "t1": 55.55, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42},
    # a year later: the voices are back
    {"sound": "city_day", "t0": 55.5, "t1": 64.0, "fade_in": 0.05, "fade_out": 0.8, "gain_db": -38, "args": {"murmur": 1.0, "traffic": 0.6}, "seed": 7},
]

def boop(t, pitch=0.6, g=-27, pan=0.0):
    return {"t": round(t, 3), "sound": "plush_squeak", "args": {"pitch": pitch}, "gain_db": g, "pan": pan}

ev = [
    {"sound": "footsteps", "t0": 0.05, "t1": 7.25, "pan0": -0.4, "pan1": 0.3, "gain_db": -30, "rate": 2.1},
    {"sound": "footsteps", "t0": 0.3, "t1": 7.4, "pan0": 0.4, "pan1": -0.2, "gain_db": -32, "rate": 1.8},
    {"t": 6.95, "sound": "low_swell", "args": {"dur": 0.9, "pitch": 0.9}, "gain_db": -27, "pan": 0.0, "hall": -16},
]
# 9:00 — the cards pop left → right (shots.js: POP + (x+26)/12*0.45)
for j in range(7):
    ev.append(boop(POP + 0.02 + j * 0.065, [0.55, 0.62, 0.58, 0.68, 0.6, 0.72, 0.64][j], -28, -0.5 + j * 0.16))
# history rows appearing (shots.js setRows timings)
for tt in [10.5, 11.3, 12.1, 12.9]:            ev.append(boop(tt, 0.62, -30, 0.15))     # Gary
ev.append({"sound": "footsteps", "t0": 13.6, "t1": 14.6, "pan0": -0.1, "pan1": -0.5, "gain_db": -33, "rate": 2.0})
for tt in [17.6, 18.5]:                        ev.append(boop(tt, 0.62, -30, -0.1))    # teacher
for j in range(6):                             ev.append(boop(20.2 + j * 0.07, 0.8 + 0.04 * (j % 3), -31, -0.4 + j * 0.16))   # every kid
ev.append({"sound": "footsteps", "t0": 27.3, "t1": 29.45, "pan0": 0.1, "pan1": 0.6, "gain_db": -31, "rate": 2.4})          # she leaves
ev.append({"sound": "footsteps", "t0": 36.05, "t1": 37.8, "pan0": 0.0, "pan1": 0.05, "gain_db": -32, "rate": 2.0})          # surgeon
for tt in [38.2, 39.1, 40.0]:                  ev.append(boop(tt, 0.6, -30, 0.1))
ev.append({"sound": "footsteps", "t0": 40.6, "t1": 42.4, "pan0": -0.3, "pan1": -0.5, "gain_db": -34, "rate": 1.6})
ev.append({"sound": "footsteps", "t0": 42.55, "t1": 44.9, "pan0": 0.2, "pan1": 0.1, "gain_db": -33, "rate": 1.9})           # spy in
for tt in [43.3, 44.1, 44.9]:                  ev.append(boop(tt, 0.58, -30, 0.2))
ev.append({"sound": "footsteps", "t0": 47.8, "t1": 49.0, "pan0": 0.1, "pan1": 0.2, "gain_db": -35, "rate": 1.9})            # spy out
for tt in [50.0, 51.2, 52.9]:                  ev.append(boop(tt, 0.66, -31, 0.1))     # grandma
ev.append({"sound": "footsteps", "t0": 55.5, "t1": 58.0, "pan0": -0.4, "pan1": -0.1, "gain_db": -32, "rate": 1.9})
ev.append({"sound": "footsteps", "t0": 55.6, "t1": 58.0, "pan0": 0.4, "pan1": 0.1, "gain_db": -33, "rate": 2.0})
ev.append({"t": 60.42, "sound": "plush_place", "gain_db": -24, "pan": 0.0})                                                 # the high five

cues = {
    "title": "008 - What if everyone's search history appeared above their head? (sneaky pizz + marimba, SFX boops)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [67.4, 68.0],
    "stem_gain_db": {"music": -21.0, "sfx": -5.0, "amb": -4.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -18.0, "ratio": 3.0, "win": 0.004, "limit_dbfs": -8.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.25, "feedback": 0.2, "mix": 0.14, "lp_hz": 2600},
              "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "mallet_db": -3.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "mallet_melody": mallet_melody, "pad": pad,
              "stings": stings, "ducks": ducks, "melody": pickups,
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
