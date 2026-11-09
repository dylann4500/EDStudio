#!/usr/bin/env python3
"""Cue sheet for 052 (Scribe promo, sim style: "I upgraded my bedroom every day until I never had to leave it") -> cues.json.
    python3 -I videos/052-bedroom-never-leave/make_cues.py && python3 -I audio/synth.py 052-bedroom-never-leave

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js (the T table), so a re-voice keeps
every sound on its picture.

Sound identity: "UPGRADE DAY" — the manager's Nov 8 steer: most of our background music was bad, so the bed is MINIMAL and soft under
the voice and the foley carries every gag (fridge thunk, rope + switch clicks, the desk servo, the chips rattling down the chute,
robot-arm blips, the TV clunk, rails, the drone's buzz, the email ding, the stamp, Scribe's chimes, the pen, the printer). The bed:
140 bpm (lane rule: upbeat + percussive) as felt hats, a soft four-on-the-floor kick, light claps on 2 + 4 and a quarter-note pluck
over a pad — C–G–Am–F for the upgrades, Am–F–Dm–E for the email/refuse, F–G–C–Am lift for Scribe, back home for day 30 and a C under
the end card. The music stem sits ~13 dB under the voice and ducks 9 dB more while he speaks. Also rendered without music
(out/nomusic.mp4) so a trending sound can go under it at upload. All soft + low-passed."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


S = lambda b: B[b]['t0']
t = dict(
    never=W('hook', 'never'), d1=W('fridge', 'day'), mini=W('fridge', 'mini'), arms=W('fridge', 'arms'), reach=W('fridge', 'reach'),
    d2=W('pulley', 'day'), pulley=W('pulley', 'pulley'), neverP=W('pulley', 'never'), again=W('pulley', 'again'),
    swings=W('desk', 'swings'), snack=W('chute', 'snack'), straight=W('chute', 'straight'), kitchen=W('chute', 'kitchen'), mom=W('chute', 'mom'), hates=W('chute', 'hates'),
    robot=W('arm', 'robot'), feeds=W('arm', 'feeds'), scratches=W('arm', 'scratches'), tv=W('tv', 'tv'),
    drives=W('window', 'drives'), window=W('window', 'window'), grass=W('window', 'grass'),
    drone=W('drone', 'drone'), pizza=W('drone', 'pizza'), lap=W('drone', 'lap'),
    emails=W('email', 'emails'), forty=W('email', 'forty'), handwritten=W('email', 'handwritten'), due=W('email', 'due'), tomorrow=W('email', 'tomorrow'),
    pen=W('refuse', 'pen'), refuse=W('refuse', 'refuse'),
    open=W('scribe', 'open'), scribe=W('scribe', 'scribe'), photo=W('scribe', 'photo'), solves=W('scribe', 'solves'), fortyS=W('scribe', 'forty'),
    writes=W('hand', 'writes'), every=W('hand', 'every'), strokeB=W('hand', 'stroke', 2),
    printer=W('deliver', 'printer'), prints=W('deliver', 'prints'), droneD=W('deliver', 'drone'), flies=W('deliver', 'flies'),
    checks=W('match', 'checks'), perfect=W('match', 'perfect'), match=W('match', 'match'),
    d30=W('house', 'day'), whole=W('house', 'whole'), stood=W('last', 'stood'))
# ---- SAME formulas as shots.js (const T = {...}; ENDCARD)
T = dict(FRIDGE=t['mini'] - 0.05, DOOR=t['arms'] - 0.15, GRAB=t['reach'] + 0.05, PULL1=t['neverP'] - 0.05, PULL2=t['again'] - 0.05, SWING=t['swings'] - 0.1,
         DROPB=t['snack'] + 0.05, SLIDE0=t['straight'] - 0.15, SLIDE1=t['kitchen'] + 0.25, FEED=t['feeds'] - 0.05, SCRATCH=t['scratches'] - 0.05, TVDROP=t['tv'] - 0.08,
         DRIVE0=t['drives'] - 0.05, DRIVE1=t['window'] + 0.15, SASH=t['window'] - 0.1, PAT=t['grass'] - 0.1, DRONE0=t['drone'] - 0.3, PIZZA=t['lap'] - 0.15,
         FLASH=t['photo'] + 0.05, SOLVE0=t['solves'] - 0.05, SOLVE1=t['fortyS'] + 0.35, WRITE0=t['writes'] - 0.05, WRITE1=t['strokeB'] + 0.35,
         PRINT0=t['printer'] - 0.05, PRINT1=t['prints'] + 0.35, GRABP=t['droneD'], FLYOUT=t['flies'], STAMP=t['perfect'], HOUSE=t['d30'])
ENDCARD = B['last']['s1'] + 0.3

# ---------------------------------------------------------------- music: minimal 140 bpm bed
BPM = 140
BEAT = 60 / BPM
IN = 0.25
TENSE0, LIFT0, HOME0 = S('email'), S('scribe'), S('house')
chords, cur = [], IN
while cur < D - 1.0:
    if cur < TENSE0 - 0.4: seq = ['C', 'G', 'Am', 'F']
    elif cur < LIFT0 - 0.4: seq = ['Am', 'F', 'Dm', 'E']
    elif cur < HOME0 - 0.4: seq = ['F', 'G', 'C', 'Am']
    elif cur < ENDCARD - 0.4: seq = ['C', 'G', 'Am', 'F']
    else: seq = ['F', 'G', 'C', 'C']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
DROP = t['d1'] - 0.02                                    # the groove drops on "Day one"
sections = [{"t0": IN, "t1": D, "style": "pulse", "step": BEAT, "vel": [[IN, 0.18], [DROP, 0.2], [TENSE0, 0.16], [LIFT0, 0.21], [HOME0, 0.22], [ENDCARD, 0.2], [D, 0.16]], "roll": 0.02}]
mallet = []
for c in story['callouts']:                              # a two-note lift on every upgrade label, a falling pair on stamps
    a = c['t0'] + 0.02
    if c['style'] in ('label', 'term'):
        mallet += [[round(a, 3), 76, 0.26, 0.14], [round(a + 0.09, 3), 81, 0.28, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 74, 0.26, 0.12], [round(a + 0.11, 3), 67, 0.26, 0.26]]
pad = [{"t0": 0.05, "t1": D - 0.2, "notes": [36, 48, 55, 60, 64], "level": 0.42, "attack": 0.25, "release": 0.9, "cutoff": 850, "hp": 30},
       {"t0": 0.05, "t1": DROP + 0.6, "notes": [48, 55, 60], "level": 0.5, "attack": 0.2, "release": 0.6, "cutoff": 750, "hp": 40}]   # a soft pre-roll pad (the dropout check)
drums = [[round(DROP, 3), 0.32, "boom"], [round(T['STAMP'], 3), 0.3, "boom"], [round(T['HOUSE'], 3), 0.32, "boom"], [round(t['handwritten'], 3), 0.28, "boom"]]
PRE = IN
drums += [[round(PRE + k * BEAT / 2, 3), 0.14 + 0.16 * k / max(1, (DROP - PRE) / (BEAT / 2)), "tick"] for k in range(int((DROP - PRE) / (BEAT / 2)))]   # soft hat build under the hook
END_D = D - 0.5
drum_patterns = [{"t0": DROP, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[DROP, 0.36], [TENSE0, 0.28], [LIFT0, 0.38], [HOME0, 0.4], [D, 0.34]], "kind": "kick"},
                 {"t0": DROP + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[DROP, 0.22], [TENSE0, 0.16], [LIFT0, 0.24], [D, 0.22]], "kind": "clap"},
                 {"t0": DROP, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[DROP, 0.24], [TENSE0, 0.2], [LIFT0, 0.26], [D, 0.24]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -6.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def servo(tt, n=3, pan=0.0, g=-24):   # a robot / motor move = a few soft low blips
    for k in range(n): e(tt + k * 0.07, "scan_beep", g, pan, pitch=0.55 + 0.06 * k, dur=0.08)

# HOOK: phone taps under the line
for k in range(5): e(0.35 + k * 0.42, "plip", -27, -0.1, pitch=1.6 + 0.1 * (k % 2))
e(t['never'], "blanket_rustle", -24, 0.0, dur=0.4, intensity=0.6)
# DAY 1: the fridge drops in, the door, the can
e(T['FRIDGE'], "flash_swish", -22, 0.3, dur=0.3, peak=0.5); e(T['FRIDGE'] + 0.3, "clunk", -12, 0.3, size=0.8, metal=0.2); e(T['FRIDGE'] + 0.32, "giant_step", -20, 0.3, size=0.4)
e(T['DOOR'], "latch_click", -18, 0.35); e(T['GRAB'], "phone_pickup", -20, 0.3)
e(T['GRAB'] + 0.45, "pop", -18, 0.2, pitch=1.4); e(T['GRAB'] + 0.47, "hiss", -24, 0.2, dur=0.35)
# DAY 2: rope yank + switch clicks (night)
for p in (T['PULL1'], T['PULL2']): e(p - 0.05, "grate", -22, 0.3, dur=0.25); e(p + 0.15, "lamp_switch_click", -13, 0.6)
# DAY 4: the desk swings in, laptop opens, typing
servo(T['SWING'], 4, -0.2); e(T['SWING'] + 0.5, "knock", -18, -0.2, pitch=0.9); e(T['SWING'] + 0.6, "phone_set_down_wood", -20, 0.0)
e(T['SWING'] + 0.75, "keyboard_type", -22, 0.0, dur=max(0.4, S('chute') - T['SWING'] - 0.8), rate=11.0)
# DAY 7: Mom drops the bag in the hopper, it rattles down the chute, lands in his hand; Mom huffs
e(T['DROPB'], "blanket_rustle", -18, 0.4, dur=0.35, intensity=0.9); e(T['DROPB'] + 0.12, "metal_clang", -22, 0.4, size=0.5, pitch=1.3)
e(T['SLIDE0'], "grate", -20, 0.4, dur=T['SLIDE1'] - T['SLIDE0']); e(T['SLIDE0'], "candy_rattle", -22, 0.2, dur=T['SLIDE1'] - T['SLIDE0'], density=14.0, size=0.5)
e(T['SLIDE1'], "plush_pickup", -16, -0.2); e(T['SLIDE1'] + 0.05, "blanket_rustle", -20, -0.2, dur=0.3, intensity=0.8)
e(t['hates'] - 0.05, "breath", -18, 0.0, dur=0.5, inhale=False)
# DAY 9: robot arm — feed (crunch), back scratch (soft rasps + a happy sigh)
servo(t['robot'], 3, -0.4); servo(T['FEED'] - 0.3, 3, -0.3); e(T['FEED'] + 0.35, "pop", -20, 0.0, pitch=0.7); e(T['FEED'] + 0.45, "slurp", -24, 0.0, dur=0.25)
servo(T['SCRATCH'] - 0.25, 3, -0.2); e(T['SCRATCH'] + 0.1, "grate", -22, 0.0, dur=0.9); e(T['SCRATCH'] + 0.4, "breath", -19, 0.0, dur=0.6, inhale=False)
# DAY 10: the TV drops from the ceiling
servo(T['TVDROP'] - 0.05, 2, 0.0, -22); e(T['TVDROP'] + 0.4, "clunk", -14, 0.0, size=0.6, metal=0.6)
# DAY 12: rails, the bed drives, the sash, patting the grass
e(T['DRIVE0'], "grate", -18, -0.3, dur=T['DRIVE1'] - T['DRIVE0']); e(T['DRIVE1'], "clunk", -16, -0.5, size=0.7, metal=0.3)
e(T['SASH'], "latch_click", -18, -0.6); e(T['SASH'] + 0.05, "flash_swish", -24, -0.6, dur=0.3, peak=0.4)
for k in range(3): e(T['PAT'] + k * 0.22, "blanket_rustle", -21, -0.5, dur=0.15, intensity=0.5)
# DAY 15: the drone + the pizza
e(T['PIZZA'] + 0.2, "knock", -16, 0.0, pitch=0.8); e(T['PIZZA'] + 0.25, "gold_chime", -22, 0.0, notes=[84, 88], spacing=0.06, vel=0.3)
# EMAIL: the ding, the stamp, the deadline tick
e(t['emails'] - 0.1, "gold_chime", -16, 0.2, notes=[81, 76], spacing=0.12, vel=0.4, dur=0.8)
e(t['handwritten'] - 0.02, "giant_step", -15, 0.0, size=0.5); e(t['handwritten'], "knock", -15, 0.0, pitch=0.7)
e(t['due'], "counter_tick", -17, 0.2, bright=0.8); e(t['tomorrow'] + 0.15, "heartbeat", -18, 0.0, size=0.7)
# REFUSE: the far pen glints; the huff
e(t['pen'] - 0.1, "gold_chime", -24, -0.4, notes=[96], spacing=0.05, vel=0.25, dur=0.6)
e(t['refuse'] - 0.05, "breath", -16, 0.0, dur=0.5, inhale=True)
# SCRIBE: opens, the photo, scanning, solving, done
e(t['scribe'], "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
e(T['FLASH'] - 0.02, "lamp_switch_click", -14, 0.1); e(T['FLASH'], "flash_swish", -18, 0.1, dur=0.25, peak=0.6)
for k in range(12): e(T['SOLVE0'] + k * (T['SOLVE1'] - T['SOLVE0']) / 12, "scan_beep", -23, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(T['SOLVE1'], "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
k = 0
while T['WRITE0'] + k * 0.55 < T['WRITE1']:
    e(T['WRITE0'] + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
# DELIVER: printer, drone grab, out the window (outside: the street)
e(T['PRINT0'], "grate", -19, 0.3, dur=T['PRINT1'] - T['PRINT0']); servo(T['PRINT0'], 4, 0.3, -25)
e(T['GRABP'] + 0.05, "blanket_rustle", -20, 0.2, dur=0.25, intensity=0.6)
# MATCH: paper shuffle, the stamp, a chime
e(t['checks'], "blanket_rustle", -20, 0.0, dur=0.35, intensity=0.6)
e(T['STAMP'] + 0.04, "giant_step", -13, 0.0, size=0.6); e(T['STAMP'] + 0.05, "knock", -14, 0.0, pitch=0.7)
e(t['match'] + 0.2, "gold_chime", -16, 0.3, notes=[86, 91], spacing=0.07, vel=0.4)
# DAY 30: the whole house
e(T['HOUSE'], "low_swell", -18, 0.0, dur=1.2, pitch=1.2)
for k in range(6): servo(T['HOUSE'] + 0.4 + k * 0.5, 2, -0.6 + 0.25 * k, -26)
e(t['stood'] + 0.05, "pop", -20, 0.0, pitch=0.7)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[79, 84, 88, 91], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": S('pulley'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 1},
    {"sound": "crickets", "t0": S('pulley'), "t1": S('desk'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "seed": 2},
    {"sound": "room_tone", "t0": S('desk'), "t1": S('match'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 3},
    {"sound": "lamp_hum", "t0": S('chute'), "t1": T['SLIDE0'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -38, "seed": 4},
    {"sound": "crowd_cheer", "t0": T['TVDROP'] + 0.3, "t1": S('window'), "fade_in": 0.2, "fade_out": 0.1, "gain_db": -34, "args": {"excite": 0.4}, "seed": 5},
    {"sound": "city_day", "t0": t['grass'] - 0.2, "t1": S('drone'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -32, "seed": 6},
    {"sound": "hairdryer", "t0": T['DRONE0'], "t1": S('email'), "fade_in": 0.3, "fade_out": 0.2, "gain_db": -33, "args": {"pitch": 1.7}, "seed": 7},
    {"sound": "hairdryer", "t0": T['GRABP'] - 0.5, "t1": S('match'), "fade_in": 0.3, "fade_out": 0.2, "gain_db": -33, "args": {"pitch": 1.7}, "seed": 8},
    {"sound": "city_day", "t0": T['FLYOUT'] - 0.1, "t1": S('match'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -31, "seed": 9},
    {"sound": "room_tone", "t0": S('match'), "t1": S('house'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -33, "seed": 10},
    {"sound": "clock", "t0": S('match'), "t1": S('house'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "pan": 0.3, "seed": 11},
    {"sound": "city_day", "t0": S('house'), "t1": D, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -33, "seed": 12},
    {"sound": "fan", "t0": S('house'), "t1": D, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -38, "args": {"rate": 6.0}, "seed": 13},
    {"sound": "hairdryer", "t0": S('house'), "t1": D, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -38, "args": {"pitch": 1.7}, "seed": 14},
]

cues = {
    "title": "052 - Scribe promo (sim style): bedroom upgrades (minimal 140 bpm pluck/pad bed + gag foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -13.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -8.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
