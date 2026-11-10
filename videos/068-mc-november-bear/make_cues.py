#!/usr/bin/env python3
"""Cue sheet for 068 (Scribe promo, "Remember November 2026 is coming", voxel) -> cues.json.
    python3 -I videos/068-mc-november-bear/make_cues.py && python3 -I audio/synth.py 068-mc-november-bear

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js (T = {...}), so a re-voice keeps
every sound on its picture.

Sound identity: "LORE STORYTIME → CLASSROOM BOP". The meme half is a music-box mystery: a glassy bell ostinato in A minor
(Am–F–C–G, 124 bpm) over a dark pad, wind on the snowfield, a soft kick like a heartbeat under the "three years" montage, a
1960 projector rattle under the doomsday scientist, the bedroom's clock + a real heartbeat at midnight. "And nothing f*cking
happened" lands on a boing + the morning street (birds, a lawn murmur). When the bear walks into chemistry class the groove
drops in on the same grid (four-on-the-floor kick, claps on 2 and 4, felt hats, a marimba arp: the lane's upbeat bed); the
Scribe pivot lifts to C–G–Am–F. The music never stops once the bear starts singing (one ostinato, sections only change the
chords + the drums). Foley on every gag: calendar flips, the chip-bag crinkle, the dream chime, the clock beep, the board slap,
the 40-sheet slam + stamp, the shutter, scan beeps, the pen, the nod, the whisper, the December sting, the end-card chime."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]


def WE(beat, word, n=1):
    return [w[2] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]


# ---- the same shot times as shots.js (T = {...} there)
T = dict(close=W('hook', 'remember') - 0.1, phone=W('nobody', 'nobody'), face=W('nobody', 'what') - 0.05, cal=W('nobody', 'for'),
         chips=W('places', 'on', 2), dream=W('places', 'in'), doom=W('doom', 'a'), board=W('doom', 'for'),
         now=W('now', 'well'), flip=W('now', 'its'), eyes=W('now', 'november') + 0.15, town=W('nothing', 'and'), shrug=W('nothing', 'happened'),
         cls=W('class', 'until'), dl=W('deadline', 'it'), slap=W('deadline', 'deadline') + 0.05, stack=W('deadline', 'forty') - 0.05, hw=W('deadline', 'handwritten') - 0.06,
         pov=W('scribe', 'so'), snap=W('scribe', 'photo') + 0.05, scr=W('scribe', 'of') + 0.1, solve=W('hand', 'solved'), awe=W('hand', 'wrote') - 0.05,
         write=W('hand', 'handwriting') - 0.15, lewis=W('hand', 'lewis'), appr=W('approve', 'the'), nod=W('approve', 'approved'), dec=W('dec', 'then'),
         december=W('dec', 'december'))
ENDC = WE('dec', 'coming') + 0.55
CAL_STEP = (W('places', 'calendars') - (T['cal'] + 0.25)) / 3          # setCal(): a page flips every CAL_STEP from T.cal + 0.25
DUCK = W('now', '2026') + 0.75
STACK_LAND = T['stack'] + 0.25
REAR = W('class', 'class')

# ---------------------------------------------------------------- music: one bell ostinato from the bear's song to the end
BPM = 124
BEAT = 60 / BPM
IN = T['close'] - 0.05
GROOVE = T['cls'] - 0.02
LIFT = T['pov'] - 0.05
chords, cur = [], IN
while cur < D - 1.0:
    seq = ['C', 'G', 'Am', 'F'] if cur >= LIFT - 0.5 else (['F', 'G', 'Am', 'C'] if cur >= GROOVE - 0.5 else ['Am', 'F', 'C', 'G'])
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
VEL = [[IN, 0.2], [T['cal'], 0.22], [T['doom'], 0.18], [T['now'], 0.16], [T['town'], 0.22], [GROOVE, 0.26], [LIFT, 0.29], [ENDC, 0.25], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "ostinato", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 4, 2, 1, 3], "vel": VEL, "bass_every": 4, "bass_vel": 0.6, "len": 0.9}]
mallet = []
ARP = {'F': [65, 69, 72, 77], 'G': [67, 71, 74, 79], 'Am': [69, 72, 76, 81], 'C': [72, 76, 79, 84]}
for k, (ct, sym) in enumerate(chords[:-1]):          # a marimba arp in 8ths once the groove is in
    if ct < GROOVE - 0.05: continue
    for i in range(8):
        tt = ct + i * BEAT / 2
        if tt >= D - 1.2: break
        mallet.append([round(tt, 3), ARP[sym][[0, 1, 2, 3, 2, 1, 2, 3][i]], 0.2 + (0.05 if i % 2 == 0 else 0), 0.18])
for c in story['callouts']:                          # a two-note lift on every label, a rising "ta-da" on TERM callouts
    a = c['t0'] + 0.02
    if a < IN - 0.1: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 77, 0.28, 0.16], [round(a + 0.08, 3), 81, 0.28, 0.16], [round(a + 0.16, 3), 84, 0.32, 0.36]]
    elif c['style'] == 'label':
        mallet += [[round(a, 3), 72, 0.24, 0.14], [round(a + 0.09, 3), 77, 0.26, 0.26]]
pad = [{"t0": 0.05, "t1": IN + 0.6, "notes": [45, 57, 64], "level": 2.8, "attack": 0.7, "release": 0.6, "cutoff": 600, "hp": 30},     # the snowfield drone
       {"t0": IN, "t1": GROOVE + 0.4, "notes": [45, 57, 60, 64], "level": 2.6, "attack": 0.6, "release": 0.8, "cutoff": 750, "hp": 30},
       {"t0": GROOVE, "t1": D - 0.2, "notes": [48, 55, 60, 64], "level": 2.4, "attack": 0.4, "release": 0.8, "cutoff": 900, "hp": 30}]
END_D = D - 0.6
drums = [[round(b, 3), 0.3, "boom"] for b in [GROOVE, T['slap'], STACK_LAND, T['hw'] + 0.06, T['december']]]
drums += [[round(GROOVE - BEAT + k * BEAT / 4, 3), 0.16 + 0.05 * k, "tick"] for k in range(4)]
drum_patterns = [
    {"t0": T['cal'], "t1": T['doom'], "step": 2 * BEAT, "pattern": [1], "vel": [[T['cal'], 0.2], [T['doom'], 0.24]], "kind": "kick"},          # heartbeat-ish under the montage
    {"t0": T['now'], "t1": T['town'], "step": 2 * BEAT, "pattern": [1], "vel": [[T['now'], 0.18], [T['town'], 0.26]], "kind": "kick"},
    {"t0": GROOVE, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[GROOVE, 0.36], [LIFT, 0.4], [D, 0.32]], "kind": "kick"},
    {"t0": GROOVE + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[GROOVE, 0.22], [LIFT, 0.26], [D, 0.22]], "kind": "clap"},
    {"t0": GROOVE, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[GROOVE, 0.24], [LIFT, 0.28], [D, 0.24]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -11.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -2.0, "drums_db": -6.0, "instrument": "bell",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=6.0, gain=-24, p0=0.0, p1=0.0):
    if b > a + 0.15: ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})

# HOOK: the snowfield; the bear's song
e(0.05, "low_swell", -21, 0.0, dur=2.6, pitch=0.7)
e(T['close'] - 0.05, "gold_chime", -21, 0.2, notes=[81, 88], spacing=0.12, vel=0.3, dur=1.6)
# NOBODY: phone in bed (a buzz as the video loads), the shrug
e(T['phone'] + 0.02, "phone_buzz", -24, 0.1, dur=0.35, pulses=1)
e(T['face'] + 0.3, "bonk", -26, 0.0, dur=0.3)
# PLACES: calendar flips, chip-bag crinkle + land, dream chime
for k in range(3): e(T['cal'] + 0.25 + k * CAL_STEP + 0.05, "blanket_rustle", -19, -0.1, dur=0.25, intensity=0.9)
e(W('places', 'calendars') + 0.05, "pop", -20, 0.0, pitch=0.8)
e(T['chips'] - 0.05, "flash_swish", -22, 0.1, dur=0.2, peak=0.5); e(T['chips'] + 0.12, "blanket_rustle", -15, 0.1, dur=0.35, intensity=1.0); e(T['chips'] + 0.13, "knock", -20, 0.1, pitch=0.7)
e(T['dream'] + 0.05, "gold_chime", -19, -0.2, notes=[84, 88, 91, 96], spacing=0.09, vel=0.35, shimmer=0.4, dur=2.0)
# DOOM: the 1960 projector rattle + a dread swell on "doomsday"
for k in range(int((T['now'] - T['doom']) / 0.125)): e(T['doom'] + k * 0.125, "knock", -33, 0.3, pitch=2.4 + 0.1 * (k % 3))
e(W('doom', 'doomsday'), "low_swell", -17, 0.0, dur=1.8, pitch=0.6); e(W('doom', 'november') + 0.05, "chalk_write", -22, -0.2, dur=0.5, strokes=3)
# NOW: midnight — the clock beeps, a heartbeat, she ducks under the quilt
e(T['flip'], "scan_beep", -16, 0.2, pitch=0.9, dur=0.18); e(T['flip'] + 0.25, "scan_beep", -18, 0.2, pitch=0.9, dur=0.18)
for k in range(int((T['town'] - T['eyes']) / 0.62)): e(T['eyes'] + 0.1 + k * 0.62, "heartbeat", -15, 0.0, size=0.8 + 0.05 * k)
e(DUCK, "blanket_rustle", -15, 0.0, dur=0.4, intensity=1.0)
# NOTHING: boing + a quiet morning street
e(T['town'] + 0.02, "boing", -18, 0.0, pitch=0.7, dur=0.5)
e(T['shrug'], "pop", -22, 0.0, pitch=1.1)
# CLASS: the bear's padding steps, the door, the screams
e(T['cls'] - 0.15, "door_open", -17, -0.3)
for k in range(5): e(T['cls'] + 0.1 + k * 0.28, "giant_step", -21, -0.2, size=0.35)
e(REAR + 0.05, "whoomp", -18, -0.1, size=0.4); e(REAR + 0.1, "low_swell", -20, 0.0, dur=0.8, pitch=1.2)
# DEADLINE: the board slap, the 40-sheet slam, the HANDWRITTEN stamp, her scream
e(T['slap'], "giant_step", -12, 0.0, size=0.6); e(T['slap'] + 0.01, "wood_snap", -17, 0.0, size=0.4); e(T['slap'] + 0.02, "knock", -14, 0.0, pitch=0.6)
e(T['stack'] + 0.05, "flash_swish", -20, 0.2, dur=0.25, peak=0.6)
e(STACK_LAND, "giant_step", -11, 0.1, size=0.8); e(STACK_LAND + 0.01, "wood_snap", -16, 0.1, size=0.5); e(STACK_LAND + 0.05, "blanket_rustle", -19, 0.1, dur=0.6, intensity=0.9)
e(T['hw'] + 0.06, "knock", -12, 0.0, pitch=0.55); e(T['hw'] + 0.07, "giant_step", -15, 0.0, size=0.5)
e(T['hw'] + 0.2, "whimper", -18, 0.0, pitch=1.3, dur=0.45)
# SCRIBE: shutter + flash, scan beeps, solved chime, the pen draws the Lewis structure
e(T['pov'] + 0.2, "gold_chime", -19, 0.2, notes=[77, 84, 89], spacing=0.08, vel=0.4)
e(T['snap'] - 0.03, "shutter", -13, 0.1); e(T['snap'], "flash_swish", -17, 0.1, dur=0.25, peak=0.7)
k = 0
while T['scr'] + k * 0.32 < T['solve'] - 0.1:
    e(T['scr'] + k * 0.32, "scan_beep", -25, 0.15, pitch=1.2 + 0.05 * (k % 3), dur=0.06); k += 1
for k in range(10): e(T['solve'] + k * (W('hand', 'and') - T['solve']) / 10, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(W('hand', 'and') + 0.02, "gold_chime", -16, 0.2, notes=[84, 89, 93, 96], spacing=0.05, vel=0.45)
k = 0
while T['write'] + k * 0.5 < WE('hand', 'all') + 0.2:
    e(T['write'] + k * 0.5, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.55); k += 1
e(T['lewis'] + 0.3, "pop", -19, -0.2, pitch=1.0); e(T['lewis'] + 0.75, "pop", -19, 0.2, pitch=1.15)
# APPROVE: the nod
e(T['nod'] + 0.05, "gold_chime", -16, -0.2, notes=[79, 84, 88], spacing=0.07, vel=0.4); e(T['nod'] + 0.15, "pop", -20, -0.2, pitch=0.8)
# DEC: the whisper, the December sting, the end card
e(W('dec', 'remember') - 0.3, "breath", -19, -0.3, dur=0.7, inhale=False)
e(T['december'], "low_swell", -14, 0.0, dur=1.4, pitch=0.8); e(T['december'] + 0.02, "bonk", -20, 0.0, dur=0.4)
e(ENDC, "gold_chime", -14, 0.0, notes=[72, 77, 81, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": T['phone'], "fade_in": 0.05, "fade_out": 0.12, "gain_db": -24, "args": {"darkness": 0.7, "gust": 0.5, "whistle": 0.12}, "seed": 1},
    {"sound": "sleigh_bells", "t0": 0.3, "t1": T['phone'], "fade_in": 1.0, "fade_out": 0.1, "gain_db": -36, "args": {"period": 0.48}, "seed": 2},
    {"sound": "room_tone", "t0": T['phone'], "t1": T['doom'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 3},
    {"sound": "crickets", "t0": T['dream'], "t1": T['doom'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "args": {"count": 3, "density": 0.4}, "seed": 4},
    {"sound": "room_tone", "t0": T['doom'], "t1": T['now'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -27, "seed": 5},
    {"sound": "clock", "t0": T['now'], "t1": T['town'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -24, "args": {"rate": 1.0}, "seed": 6},
    {"sound": "crickets", "t0": T['now'], "t1": T['town'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -33, "args": {"count": 3, "density": 0.5}, "seed": 7},
    {"sound": "city_day", "t0": T['town'], "t1": T['cls'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -27, "args": {"murmur": 0.4, "traffic": 0.3}, "seed": 8},
    {"sound": "room_tone", "t0": T['cls'], "t1": D, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -30, "seed": 9},
    {"sound": "kids_laugh", "t0": T['cls'] - 0.1, "t1": T['dl'] + 0.3, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -27, "args": {"density": 0.6}, "seed": 10},
    {"sound": "crowd_cheer", "t0": T['cls'] + 0.45, "t1": T['dl'] + 0.2, "fade_in": 0.08, "fade_out": 0.3, "gain_db": -22, "args": {"excite": 0.95}, "seed": 11},   # the class screams
    {"sound": "crowd_cheer", "t0": T['stack'], "t1": T['pov'], "fade_in": 0.2, "fade_out": 0.3, "gain_db": -31, "args": {"excite": 0.25}, "seed": 12},          # classroom murmur
]

cues = {
    "title": "068 - Scribe promo: Remember November 2026 (music-box lore in A minor → classroom bop 124 bpm + place sound + gag foley + Slax narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -13.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
