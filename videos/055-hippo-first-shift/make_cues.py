#!/usr/bin/env python3
"""Cue sheet for 055 (Scribe promo dupe: a hippo's first shift at a burger joint) -> cues.json.
   python3 -I videos/055-hippo-first-shift/make_cues.py && python3 -I audio/synth.py 055-hippo-first-shift

Event times come from shots.js's EV object (parsed below), so the foley sits on the picture.
Sound identity: "LUNCH RUSH" — SFX-led like the original (no narrator): every gag has its own foley (giant hippo steps, tile
cracks, the door frame popping, fabric strain + rip, a low groaning yawn, the soda gush and flood, a charge of thunder steps and a
table smash, crunching salad, a clipboard, the worksheet slap, pencil snaps, a shutter, solve plips, pen scribble, digging, a pond
filling, a happy car toot, the belly-flop splash) over room tone + lunch chatter by day and crickets + a clock at night. The music
is a minimal soft bed (user steer Nov 8: "most of our background music is bad… keep any bed minimal and soft, let SFX carry it"):
a bouncy pluck oom-pah in C major at 116 bpm with a soft kick + hats by day, a slow warm arp at night, the bounce back for the
promotion, and applause + cheers under the end card. out/nomusic.mp4 (everything but music) is made after the render."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
D = story['duration']
src = open(os.path.join(HERE, 'shots.js')).read()
ev_js = re.search(r'export const EV = (\{.*?\});', src, re.S).group(1)
EV = json.loads(re.sub(r',\s*}', '}', re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', ev_js).replace('\n', ' ')))
SHOT_T0 = [float(x) for x in re.findall(r"\{ t0: ([\d.]+), t1: [\d.]+, cam:", src)]

# ---------------------------------------------------------------- music: soft "LUNCH RUSH" bounce, C major 116 bpm
BPM = 116
BEAT = 60 / BPM
IN = 2.6                        # the title docks + the first line appears: the bed comes in
NIGHT0, NIGHT1 = 31.4, 41.2
chords, cur, cyc = [], IN, 0
while cur < D - 0.5:
    if cur < NIGHT0 - 0.3: seq = ['C', 'Am', 'F', 'G'] if cyc % 2 == 0 else ['C', 'Am', 'Dm', 'G']
    elif cur < NIGHT1 - 0.3: seq = ['Am', 'F', 'C', 'G']
    elif cur < EV['end'] - 0.3: seq = ['F', 'G', 'C', 'Am']
    else: seq = ['F', 'G', 'C', 'C']
    for sym in seq:
        if cur >= D - 0.5: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'C'])
sections = [
    {"t0": IN, "t1": NIGHT0, "style": "bounce", "step": BEAT, "vel": [[IN, 0.3], [25.0, 0.27], [NIGHT0, 0.24]], "bass_hold": 1.5, "stab_hold": 0.85},
    {"t0": NIGHT0, "t1": NIGHT1, "style": "arp", "step": BEAT, "pattern": [0, 1, 2, 1], "vel": [[NIGHT0, 0.2], [33.8, 0.24], [NIGHT1, 0.27]]},
    {"t0": NIGHT1, "t1": D, "style": "bounce", "step": BEAT, "vel": [[NIGHT1, 0.31], [EV['end'], 0.3], [D, 0.26]], "bass_hold": 1.5, "stab_hold": 0.85},
]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [36, 48, 55, 60, 64], "level": 1.6, "attack": 0.6, "release": 0.8, "cutoff": 900, "hp": 40},
       {"t0": 0.2, "t1": IN + 0.4, "notes": [48, 55, 60, 64], "level": 1.7, "attack": 0.5, "release": 0.5, "cutoff": 800, "hp": 40}]
END_D = D - 0.4
day = lambda a, b, kind, step, pat, vel: {"t0": a, "t1": b, "step": step, "pattern": pat, "vel": vel, "kind": kind}
drum_patterns = [day(IN, NIGHT0, "kick", 2 * BEAT, [1], 0.3), day(IN + BEAT, NIGHT0, "clap", 2 * BEAT, [1], 0.18), day(IN, NIGHT0, "tick", BEAT / 2, [0.5, 0.3], 0.2),
                 day(NIGHT1, END_D, "kick", 2 * BEAT, [1], 0.32), day(NIGHT1 + BEAT, END_D, "clap", 2 * BEAT, [1], 0.2), day(NIGHT1, END_D, "tick", BEAT / 2, [0.5, 0.3], 0.22)]
drums = [[EV['pop'], 0.35, "boom"], [EV['bigCrack'], 0.3, "boom"], [EV['chargeHit'], 0.35, "boom"], [EV['flop'], 0.4, "boom"]]
# a tiny rising mallet "ta-da" on the Scribe beats and the promotion (soft, low-passed)
mallet = []
for a in (EV['solve1'], EV['write1'], EV['aplus'], EV['mgr']):
    mallet += [[round(a, 3), 72, 0.26, 0.14], [round(a + 0.09, 3), 76, 0.26, 0.14], [round(a + 0.18, 3), 79, 0.3, 0.4]]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 2.0, "pad_reverb_db": -8.0, "mallet_db": -4.0, "drums_db": -8.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": mallet, "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def thuds(a, b, every, gain, size, pan0=0.0, pan1=0.0, surface="ground"):
    k, n = 0, max(1, int((b - a) / every))
    while a + k * every < b:
        u = k / n; e(a + k * every, "giant_step", gain - 2 * (k % 2), pan0 + (pan1 - pan0) * u, size=size, surface=surface); k += 1

# ARRIVE: heavy trot across the lot, the squeeze, the pop, the frame falls
thuds(0.35, 2.45, 0.5, -15, 0.55, -0.4, 0.0)
e(2.55, "metal_groan", -19, 0.0, dur=1.3, pitch=0.8)
e(2.7, "breath", -20, 0.0, dur=0.9, inhale=True)
e(EV['pop'] - 0.02, "pop", -9, 0.0, pitch=0.55); e(EV['pop'], "wood_snap", -12, 0.0, size=0.9); e(EV['pop'] + 0.03, "glass_crack", -18, 0.1, dur=0.6, n_pings=3)
e(EV['pop'] + 0.38, "metal_clang", -15, 0.0, size=1.0, pitch=0.7)
thuds(EV['pop'] + 0.08, 4.6, 0.2, -14, 0.6)
# FLOOR: every step cracks the tiles; the big one
for k, c in enumerate(EV['cracks']):
    e(c, "giant_step", -11, -0.2 + 0.13 * k, size=0.9, surface="ground"); e(c + 0.01, "glass_crack", -16, -0.2 + 0.13 * k, dur=0.5, n_pings=3); e(c + 0.02, "crumble", -19, 0.0, dur=0.4, size=0.4)
e(EV['bigCrack'], "giant_step", -8, 0.0, size=1.3); e(EV['bigCrack'] + 0.02, "crumble", -12, 0.0, dur=1.0, size=1.0); e(EV['bigCrack'] + 0.04, "wood_snap", -16, 0.0, size=0.6)
e(5.55, "breath", -24, -0.5, dur=0.5, inhale=True)
# UNIFORM: fabric strain, the rip, the cap lands
e(EV['shirtOn'] - 0.4, "blanket_rustle", -18, 0.3, dur=0.6, intensity=0.8)
e(EV['shirtOn'], "blanket_rustle", -15, 0.2, dur=EV['rip'] - EV['shirtOn'], intensity=1.0, strokes=3)
e(EV['rip'], "grate", -11, 0.1, dur=0.3); e(EV['rip'] + 0.01, "pop", -16, 0.1, pitch=0.9)
e(EV['cap'], "pop", -15, 0.0, pitch=1.3); e(EV['cap'] + 0.05, "plush_squeak", -19, 0.0, pitch=1.2)
# ORDER: register beep, the 150° yawn (an inhale + a long low groan + a gust)
e(11.6, "scan_beep", -22, -0.3, pitch=1.1, dur=0.15)
e(EV['yawn0'], "breath", -14, 0.2, dur=0.9, inhale=True)
e(EV['yawn0'] + 0.75, "foghorn", -13, 0.2, dur=1.6, pitch=0.42, grunt=1.0)
e(EV['yawnTop'] - 0.1, "low_swell", -20, 0.0, dur=1.2, pitch=0.7)
e(EV['yawn1'] + 0.2, "bonk", -18, 0.2)                         # the jaw snaps shut
# SODA: levers, the gush, splashes, the flood, a happy slurp
for k in range(3): e(EV['spray0'] - 0.25 + k * 0.08, "knock", -18, 0.4, pitch=1.3)
e(EV['spray0'] + 0.05, "splash", -12, 0.3, size=0.7)
e(16.4, "slurp", -18, 0.2, dur=0.6); e(17.3, "splash", -16, 0.2, size=0.5)
# CHARGE: thunder steps, the table smash, chairs, the burger lands
thuds(18.3, EV['chargeHit'] - 0.05, 0.2, -10, 0.85, 0.5, -0.3)
e(EV['chargeHit'], "car_crash", -12, -0.2, dur=0.9, weight=0.4); e(EV['chargeHit'] + 0.02, "wood_snap", -13, -0.2, size=0.8)
for k in range(5): e(EV['chargeHit'] + 0.25 + k * 0.11, "metal_clang", -20 - (k % 2), -0.5 + 0.2 * k, size=0.35, pitch=1.3 + 0.1 * k)
e(EV['burgerLand'] - 0.7, "flash_swish", -22, 0.0, dur=0.3, peak=0.5)
e(EV['burgerLand'], "pop", -15, -0.4, pitch=0.7); e(EV['burgerLand'] + 0.02, "knock", -18, -0.4, pitch=0.9)
# SALAD: the inhale + crunching
e(21.95, "slurp", -14, 0.0, dur=0.9)
k = 0
while 22.2 + k * 0.24 < 24.4:
    e(22.2 + k * 0.24, "crumble", -17 - (k % 3), 0.05 * (k % 3), dur=0.16, size=0.3); k += 1
e(23.4, "slurp", -16, 0.0, dur=0.7)
e(24.5, "breath", -20, 0.0, dur=0.6, inhale=False)              # a satisfied sigh
# DAMAGE: clipboard taps, a tense hum of the room
for k in range(4): e(25.6 + k * 0.6, "knock", -18, 0.4, pitch=1.6)
e(26.0, "low_swell", -22, 0.0, dur=1.6, pitch=0.6)
e(25.35, "keyboard_type", -17, 0.3, dur=2.6, rate=15.0)          # the receipt printer chattering out the damage bill
for k in range(3): e(25.5 + k * 0.85, "scan_beep", -21, 0.3, pitch=0.9 + 0.12 * k, dur=0.12)
# THE SHEET + the gulp
e(EV['slap'], "knock", -10, 0.0, pitch=0.7); e(EV['slap'] + 0.01, "blanket_rustle", -16, 0.0, dur=0.25, intensity=0.9); e(EV['slap'] + 0.02, "giant_step", -18, 0.0, size=0.3)
e(EV['gulp'], "fish_blub", -14, 0.0, n_bub=1, dur=0.4)
# NIGHT: pencils snap
for k, s in enumerate(EV['snaps']):
    e(s - 0.35, "pen_scribble", -22, 0.0, dur=0.3); e(s, "wood_snap", -12, 0.0, size=0.18 + 0.03 * k); e(s + 0.25, "knock", -22, 0.3, pitch=1.8)
# PHOTO + LAPTOP
e(EV['flash'] - 0.02, "lamp_switch_click", -12, 0.0); e(EV['flash'], "flash_swish", -18, 0.0, dur=0.2, peak=0.6)
e(34.78, "knock", -18, 0.1, pitch=1.2)                          # the lid
e(EV['scan0'], "scan_beep", -18, 0.1, pitch=1.2, dur=0.2)
for k in range(10): e(EV['solve0'] + k * (EV['solve1'] - EV['solve0']) / 10, "plip", -21, 0.1, pitch=1.0 + 0.06 * k)
e(EV['solve1'] + 0.02, "gold_chime", -18, 0.1, notes=[84, 88, 91], spacing=0.06, vel=0.35)
# WRITE: the pen
k = 0
while EV['write0'] + k * 0.55 < EV['write1']:
    e(EV['write0'] + k * 0.55, "pen_scribble", -14, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
e(EV['happy'], "plush_squeak", -18, 0.0, pitch=0.8)
# PROMOTION: the A+, the gold cap, confetti + applause
e(EV['aplus'], "knock", -11, 0.3, pitch=0.8); e(EV['aplus'] + 0.02, "giant_step", -18, 0.3, size=0.3)
e(EV['mgr'], "pop", -12, 0.0, pitch=0.9)
for k in range(10): e(EV['mgr'] + 0.04 + k * 0.05, "pop", -20 - (k % 3), -0.7 + 0.15 * k, pitch=1.3 + 0.08 * (k % 4))
# DIG + FILL + the sign
k = 0
while EV['dig0'] + k * 0.19 < EV['dig1']:
    e(EV['dig0'] + k * 0.19, "dig", -16 - (k % 2) * 2, -0.5 + 0.33 * (k % 4), size=0.6); k += 1
e(EV['dig1'] + 0.05, "splash", -16, 0.0, size=0.6)
e(EV['sign'], "pop", -14, -0.3, pitch=0.8); e(EV['sign'] + 0.02, "clunk", -18, -0.3, size=0.5, metal=0.6)
# LANE: a happy car toot, bags, a car pulling away
e(48.85, "car_horn", -21, -0.3, dur=0.25, pitch=1.2, distance=1.5)
for b in EV['bags']: e(b - 0.1, "splash", -22, 0.2, size=0.25); e(b + 0.45, "blanket_rustle", -18, -0.2, dur=0.25, intensity=0.8)
e(EV['carGo'] + 0.6, "car_pass", -22, -0.4, dur=1.4, size=0.8)
# FLOP: the rise, the splash, the flood
e(EV['flopUp'] - 0.3, "splash", -16, 0.0, size=0.5)
e(EV['flop'], "giant_step", -9, 0.0, size=1.4); e(EV['flop'] + 0.01, "cartoon_splash", -8, 0.0, dur=2.2, size=1.3); e(EV['flop'] + 0.02, "water_splash", -11, 0.0, dur=1.6, size=1.0)
e(EV['flop'] + 0.6, "car_horn", -24, -0.5, dur=0.2, pitch=1.4, distance=2.0)
e(EV['end'] - 0.1, "gold_chime", -16, 0.0, notes=[79, 84, 88, 91], spacing=0.07, vel=0.45, shimmer=0.2, dur=2.4)

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": 4.6, "fade_in": 0.1, "fade_out": 0.15, "gain_db": -24, "args": {"murmur": 0.25, "traffic": 0.5}, "seed": 1},
    {"sound": "room_tone", "t0": 4.6, "t1": NIGHT0, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 2},
    {"sound": "crowd_cheer", "t0": 4.6, "t1": 25.0, "fade_in": 0.1, "fade_out": 0.2, "gain_db": -32, "args": {"excite": 0.15}, "seed": 3},   # lunch chatter
    {"sound": "crowd_cheer", "t0": EV['chargeHit'] - 0.1, "t1": 21.6, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -27, "args": {"excite": 0.6}, "seed": 4},
    {"sound": "water_rush", "t0": EV['spray0'], "t1": 18.2, "fade_in": 0.1, "fade_out": 0.15, "gain_db": -21, "args": {"intensity": 0.7}, "seed": 5},
    {"sound": "crickets", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -38, "seed": 6},
    {"sound": "clock", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -36, "pan": -0.3, "seed": 7},
    {"sound": "lamp_hum", "t0": NIGHT0, "t1": NIGHT1, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -40, "seed": 8},
    {"sound": "room_tone", "t0": NIGHT1, "t1": 44.8, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -32, "seed": 9},
    {"sound": "applause", "t0": EV['mgr'] + 0.05, "t1": 44.8, "fade_in": 0.1, "fade_out": 0.25, "gain_db": -22, "seed": 10},
    {"sound": "crowd_cheer", "t0": EV['mgr'], "t1": 44.8, "fade_in": 0.1, "fade_out": 0.25, "gain_db": -27, "args": {"excite": 0.9}, "seed": 11},
    {"sound": "city_day", "t0": 44.8, "t1": D, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "args": {"murmur": 0.3, "traffic": 0.4}, "seed": 12},
    {"sound": "water_rush", "t0": EV['dig1'], "t1": EV['fill1'] + 0.3, "fade_in": 0.1, "fade_out": 0.3, "gain_db": -22, "args": {"intensity": 0.8}, "seed": 13},
    {"sound": "surf", "t0": 48.4, "t1": D, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -30, "args": {"size": 0.3}, "seed": 14},
    {"sound": "water_rush", "t0": EV['flop'] + 0.1, "t1": 56.0, "fade_in": 0.05, "fade_out": 0.8, "gain_db": -21, "args": {"intensity": 1.0}, "seed": 15},
    {"sound": "crowd_cheer", "t0": EV['flop'] + 0.3, "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -26, "args": {"excite": 0.8}, "seed": 16},
    {"sound": "applause", "t0": EV['end'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -22, "seed": 17},
]

ev = [x for x in ev if x is not None]
cues = {
    "title": "055 - Scribe promo dupe: a hippo's first shift (SFX-led LUNCH RUSH: soft C-major pluck bounce 116 bpm + giant foley)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 3.5, "amb": 5.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": SHOT_T0 + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
