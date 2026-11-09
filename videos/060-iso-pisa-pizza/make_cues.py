#!/usr/bin/env python3
"""Cue sheet for 060 (iso diorama Scribe dupe: Italy rebuilds the Leaning Tower of Pisa with pizza) -> cues.json.
   python3 -I videos/060-iso-pisa-pizza/make_cues.py && python3 -I audio/synth.py 060-iso-pisa-pizza

The original (@okwhatifcrazy, 75 s) has no narrator: a soft tonal bed + foley. Ours is SFX-led too ("TABLETOP ITALIA"): every
gag gets its foley (a stone groan + the tower thud, the ministry stamp, dough slaps, the toss + stadium cheer, a sauce tanker,
pepperoni pops, the pineapple bonk, bricks + the oven whoomp, a prop plane + the splat, a stern buzz, the night room (crickets,
clock, typing), a phone shutter, solve plips, pen scribble, the approval stamp + applause, crane clunks, the cutter scrape, a
pigeon's wings, the tower creaking back to 3.97° and a cheering piazza). Music (user steer Nov 8: minimal, it's muted for the
posted cut anyway): a soft F-major pluck bounce at 126 bpm that enters on the push (the premise), a slow arp for the night room,
the bounce back for the rebuild. Times are read from shots.js constants so the foley sits on the picture."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
D = story['duration']
src = open(os.path.join(HERE, 'shots.js')).read()
def const(name):   # `const NAME = { a: 1, b: 2 }` → dict
    js = re.search(r'const ' + name + r' = (\{[^}]*\})[,;]', src).group(1)
    return json.loads(re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', js))
TIP, DROP, STACK, CUT, PIGEON, PH = const('TIP'), const('DROP'), const('STACK'), const('CUT'), const('PIGEON'), const('PH')
BASIL = float(re.search(r'BASIL = ([\d.]+)', src).group(1))
SHOT_T0 = [float(x) for x in re.findall(r"\{ t0: ([\d.]+), t1: [\d.]+, set:", src)]
END = story['iso']['end']['t']
NIGHT0, NIGHT1 = 32.4, 41.6

# ---------------------------------------------------------------- music: soft pluck bounce in F, 126 bpm
BPM = 126
BEAT = 60 / BPM
IN = 3.4
chords, cur, cyc = [], IN, 0
while cur < D - 0.5:
    if cur < NIGHT0 - 0.3: seq = ['F', 'C', 'Dm', 'C'] if cyc % 2 == 0 else ['F', 'Bb', 'C', 'F']
    elif cur < NIGHT1 - 0.3: seq = ['Dm', 'Bb', 'F', 'C']
    else: seq = ['F', 'C', 'Bb', 'C'] if cur < END - 0.3 else ['Bb', 'C', 'F', 'F']
    for sym in seq:
        if cur >= D - 0.5: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'F'])
sections = [
    {"t0": IN, "t1": NIGHT0, "style": "bounce", "step": BEAT, "vel": [[IN, 0.28], [20.0, 0.27], [NIGHT0, 0.24]], "bass_hold": 1.5, "stab_hold": 0.85},
    {"t0": NIGHT0, "t1": NIGHT1, "style": "arp", "step": BEAT, "pattern": [0, 1, 2, 1], "vel": [[NIGHT0, 0.2], [36.0, 0.24], [NIGHT1, 0.27]]},
    {"t0": NIGHT1, "t1": D, "style": "bounce", "step": BEAT, "vel": [[NIGHT1, 0.3], [END, 0.3], [D, 0.26]], "bass_hold": 1.5, "stab_hold": 0.85},
]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [41, 53, 60, 65, 69], "level": 1.6, "attack": 0.6, "release": 0.8, "cutoff": 900, "hp": 40},
       {"t0": 0.2, "t1": IN + 0.4, "notes": [53, 60, 65, 69], "level": 1.7, "attack": 0.5, "release": 0.5, "cutoff": 800, "hp": 40}]
END_D = D - 0.4
pat = lambda a, b, kind, step, p, vel: {"t0": a, "t1": b, "step": step, "pattern": p, "vel": vel, "kind": kind}
drum_patterns = [pat(IN, NIGHT0, "kick", 2 * BEAT, [1], 0.28), pat(IN + BEAT, NIGHT0, "clap", 2 * BEAT, [1], 0.16), pat(IN, NIGHT0, "tick", BEAT / 2, [0.5, 0.3], 0.18),
                 pat(NIGHT1, END_D, "kick", 2 * BEAT, [1], 0.3), pat(NIGHT1 + BEAT, END_D, "clap", 2 * BEAT, [1], 0.18), pat(NIGHT1, END_D, "tick", BEAT / 2, [0.5, 0.3], 0.2)]
drums = [[TIP['impact'], 0.35, "boom"], [DROP['t1'], 0.35, "boom"], [PIGEON['lean1'], 0.25, "boom"]]
mallet = []
for a in (39.55, 41.95, 49.05, END):   # tiny rising "ta-da" on solved / approved / straight / the card (soft, low-passed)
    mallet += [[round(a, 3), 77, 0.24, 0.14], [round(a + 0.09, 3), 81, 0.24, 0.14], [round(a + 0.18, 3), 84, 0.28, 0.4]]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 2.0, "pad_reverb_db": -8.0, "mallet_db": -4.0, "drums_db": -8.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": mallet, "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)

# PUSH → FALL: effort, a stone groan that grows, the thud + rubble, a distant boom
e(3.5, "breath", -18, -0.2, dur=0.7, inhale=True)
e(3.9, "breath", -19, -0.2, dur=0.5, inhale=False)
e(TIP['start'] + 0.3, "metal_groan", -17, 0.0, dur=2.2, pitch=0.5)
e(TIP['impact'] - 0.02, "giant_step", -7, 0.2, size=1.6)
e(TIP['impact'], "crumble", -10, 0.2, dur=1.6, size=1.3)
e(TIP['impact'] + 0.03, "distant_boom", -14, 0.0)
for k in range(5): e(TIP['impact'] + 0.3 + k * 0.17, "crumble", -19 - k, 0.3 - 0.1 * k, dur=0.3, size=0.4)
e(7.9, "wing_flutter", -24, 0.4, dur=1.0, n_birds=4)
# MINISTRY: the stamp, the aides clap
e(9.88, "knock", -10, 0.0, pitch=0.6); e(9.9, "giant_step", -17, 0.0, size=0.35)
# DOUGH: slaps on every push
for k in range(7):
    a = 11.4 + k * 0.5
    e(a, "splash", -19, -0.4 + 0.13 * k, size=0.22); e(a + 0.01, "knock", -20, -0.4 + 0.13 * k, pitch=0.45)
# TOSS: flatten, launch, the catch + a cheer
e(15.1, "splash", -15, 0.0, size=0.45)
e(15.7, "boing", -16, 0.0, pitch=0.55, dur=0.6)
e(18.35, "splash", -13, 0.0, size=0.55); e(18.37, "giant_step", -16, 0.0, size=0.5)
# TOPPINGS: a sauce tanker, cheese snow, pepperoni pops, the pineapple
e(19.1, "car_pass", -18, -0.2, dur=2.0, size=0.6)
e(19.4, "slurp", -18, 0.0, dur=1.2)
for k in range(9): e(20.45 + k * 0.12, "crumble", -24, -0.3 + 0.08 * k, dur=0.14, size=0.15)
for k in range(10): e(20.78 + k * 0.075, "pop", -19 - (k % 3), -0.5 + 0.1 * k, pitch=1.2 + 0.06 * (k % 4))
k = 0
while 21.25 + k * 0.18 < 21.8: e(21.25 + k * 0.18, "giant_step", -21, 0.5, size=0.3); k += 1
e(22.15, "bonk", -12, 0.4)
e(22.85, "low_swell", -18, 0.5, dur=0.9, pitch=0.45)
# OVEN: bricks, the peel scraping in, the whoomp + fire
for k in range(6): e(23.3 + k * 0.14, "clunk", -19 - (k % 2), -0.3 + 0.12 * k, size=0.4)
e(24.3, "grate", -20, 0.0, dur=1.5)
e(25.4, "whoomp", -12, 0.0)
# AIR DROP: the plane, the fall, the splat + cheer
e(28.0, "knock", -19, 0.3, pitch=1.4)
e(28.2, "low_swell", -17, 0.0, dur=1.2, pitch=0.6)
e(DROP['t1'] - 0.02, "giant_step", -8, 0.0, size=1.5); e(DROP['t1'], "cartoon_splash", -11, 0.0, dur=1.2, size=0.9)
# BLOCKED: the sign plants, a stern buzz
e(30.65, "knock", -15, 0.2, pitch=0.8)
e(30.85, "scan_beep", -20, 0.2, pitch=0.55, dur=0.35)
# ROOM: typing, a groan at "once", the phone
e(32.5, "keyboard_type", -19, 0.0, dur=1.8, rate=12.0)
e(34.55, "breath", -17, 0.0, dur=1.1, inhale=False)
e(36.05, "phone_pickup", -18, 0.0)
e(PH['photo'] - 0.02, "lamp_switch_click", -12, 0.0); e(PH['photo'], "flash_swish", -20, 0.0, dur=0.2, peak=0.5)
e(37.62, "scan_beep", -18, 0.1, pitch=1.2, dur=0.2)
for k in range(10): e(37.9 + k * 0.16, "plip", -21, 0.1, pitch=1.0 + 0.06 * k)
k = 0
while 39.7 + k * 0.55 < 41.5: e(39.7 + k * 0.55, "pen_scribble", -14, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
# APPROVED: the stamp + applause
e(41.93, "knock", -10, 0.2, pitch=0.75); e(41.95, "giant_step", -18, 0.2, size=0.3)
# STACK: crane hum + a clunk per few layers
e(43.3, "metal_groan", -24, -0.3, dur=3.0, pitch=0.9)
k = 0
while STACK['t0'] + k * 0.24 < STACK['t1']: e(STACK['t0'] + k * 0.24, "knock", -19 - (k % 2), -0.2 + 0.03 * k, pitch=0.6 + 0.02 * k); k += 1
# CUT + BASIL
e(CUT['t0'], "grate", -18, 0.2, dur=CUT['t1'] - CUT['t0'])
for k in range(6): e(CUT['t0'] + 0.1 + k * 0.23, "pop", -24, 0.2, pitch=0.9)
e(BASIL + 0.3, "plush_place", -16, 0.0)
# POSE: effort grunt, a confused murmur
e(50.95, "breath", -18, -0.2, dur=0.6, inhale=True)
e(51.7, "breath", -20, -0.2, dur=0.5, inhale=False)
# PIGEON: wings, the land, the tower creaks back to 3.97°
e(PIGEON['land'] - 1.1, "wing_flutter", -16, 0.4, dur=1.1, n_birds=1)
e(PIGEON['land'], "plush_squeak", -20, 0.2, pitch=0.7)
e(PIGEON['lean0'], "metal_groan", -15, 0.0, dur=0.9, pitch=0.55)
e(PIGEON['lean1'], "giant_step", -15, 0.0, size=0.8)

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 8.8, "fade_in": 0.2, "fade_out": 0.15, "gain_db": -27, "args": {"murmur": 0.4, "traffic": 0.15}, "seed": 1},
    {"sound": "crowd_cheer", "t0": 0.0, "t1": 8.8, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -33, "args": {"excite": 0.12}, "seed": 2},
    {"sound": "crowd_cheer", "t0": TIP['impact'] - 0.2, "t1": 8.0, "fade_in": 0.05, "fade_out": 0.5, "gain_db": -27, "args": {"excite": 0.7}, "seed": 3},
    {"sound": "room_tone", "t0": 8.8, "t1": 11.0, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 4},
    {"sound": "applause", "t0": 10.0, "t1": 11.0, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -26, "args": {"density": 8.0}, "seed": 5},
    {"sound": "crowd_cheer", "t0": 11.0, "t1": 23.0, "fade_in": 0.1, "fade_out": 0.2, "gain_db": -31, "args": {"excite": 0.3}, "seed": 6},
    {"sound": "crowd_cheer", "t0": 18.3, "t1": 19.8, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -24, "args": {"excite": 1.0}, "seed": 7},
    {"sound": "crowd_cheer", "t0": 22.2, "t1": 23.0, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -27, "args": {"excite": 0.8}, "seed": 8},
    {"sound": "city_day", "t0": 23.0, "t1": 27.0, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -28, "args": {"murmur": 0.35, "traffic": 0.4}, "seed": 9},
    {"sound": "fire", "t0": 25.4, "t1": 27.0, "fade_in": 0.1, "fade_out": 0.15, "gain_db": -22, "args": {"size": 0.7}, "seed": 10},
    {"sound": "fan", "t0": 27.0, "t1": 29.6, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -27, "args": {"rate": 22.0}, "seed": 11},
    {"sound": "city_day", "t0": 27.0, "t1": 32.4, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -29, "args": {"murmur": 0.4, "traffic": 0.1}, "seed": 12},
    {"sound": "crowd_cheer", "t0": DROP['t1'], "t1": 30.6, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -24, "args": {"excite": 0.9}, "seed": 13},
    {"sound": "crickets", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -38, "seed": 14},
    {"sound": "clock", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -36, "pan": -0.3, "seed": 15},
    {"sound": "lamp_hum", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -41, "seed": 16},
    {"sound": "city_day", "t0": NIGHT1, "t1": D, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -28, "args": {"murmur": 0.4, "traffic": 0.1}, "seed": 17},
    {"sound": "applause", "t0": 41.95, "t1": 43.4, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -23, "seed": 18},
    {"sound": "crowd_cheer", "t0": 41.95, "t1": 43.4, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -27, "args": {"excite": 0.8}, "seed": 19},
    {"sound": "crowd_cheer", "t0": 49.0, "t1": 52.6, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -31, "args": {"excite": 0.2}, "seed": 20},
    {"sound": "crowd_cheer", "t0": PIGEON['lean1'], "t1": D, "fade_in": 0.1, "fade_out": 0.8, "gain_db": -28, "args": {"excite": 1.0}, "seed": 21},
    {"sound": "applause", "t0": PIGEON['lean1'] + 0.1, "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -28, "seed": 22},
]

cues = {
    "title": "060 - iso diorama Scribe dupe: Pisa rebuilt with pizza (SFX-led TABLETOP ITALIA: soft F-major pluck bounce 126 bpm + tabletop foley)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -17.0, "sfx": 5.0, "amb": 6.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": SHOT_T0 + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x['t']),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
