#!/usr/bin/env python3
"""Cue sheet for 056 (Scribe dupe of @whatifpov's "No shower for 365 days") -> cues.json.   python3 -I videos/056-no-shower/make_cues.py

Every time comes from story.json (the narrator's word times) with the SAME formulas as shots.js, so re-voicing keeps the sound on its picture.
Then: python3 -I audio/synth.py 056-no-shower

Sound identity: SFX-led like the reference (its VO posts sit on a quiet bed) and per the user's Nov 8 note ("most of the background music's
kind of ass"): the places carry it — a subway rumble + a fly buzz under the cold open, near-silence + tape hiss through the VHS rewind (the
reference drops to near-silence there), a running shower, a city street that turns to autumn leaves and winter wind, a stampede of
footsteps when the train car empties, a snore in the library, the professor's office, laptop + camera + pen foley, and the big shower.
The bed is minimal: a soft 140 bpm kick/hat + marimba arp in A minor that ENTERS on Day 1 (after the rewind), tightens under the
professor, lifts to C major on Scribe and resolves under the end card. out/nomusic.mp4 drops it entirely (voice + SFX + ambience)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


S0 = lambda b: B[b]['s0']; S1 = lambda b: B[b]['s1']; T0 = lambda b: B[b]['t0']
t = dict(due=W('due', 'due'), eight=W('due', 'eight'), skip=W('skip', 'skip'), just=W('skip', 'just'),
         shiny=W('d10', 'shiny'), never=W('d10', 'never'), smell=W('d30', 'smell'), smells=W('blind', 'smells'), youB=W('blind', 'you'),
         people=W('d80', 'people'), cross=W('d80', 'cross'), brown=W('crust', 'brown'), empties=W('train', 'empties'),
         flies=W('flies', 'flies'), professor=W('prof', 'professor'), wont=W('prof', 'wont'), feet=W('prof', 'feet'),
         forty=W('forty', 'forty'), handwritten=W('forty', 'handwritten'), by=W('forty', 'by'),
         open=W('scribe', 'open'), scribe=W('scribe', 'scribe'), one=W('scribe', 'one'), photo=W('scribe', 'photo'),
         solved=W('hand', 'solved'), written=W('hand', 'written'), fin=W('shower', 'finally'), shower=W('shower', 'shower'), hours=W('hours', 'hours'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
COLD1 = S1('hook') + 0.1; RW0 = COLD1; RW1 = T0('due') - 0.02
ENDC = S1('hours') + 0.32
WATER_ON = t['fin'] - 0.1; RST0 = S1('shower') + 0.25; RST1 = RST0 + 0.85
AM0, AM1 = T0('due') - 0.6, T0('d3')
EMPTY = t['empties'] - 0.35
POLE_OUT = t['wont'] - 0.15
LID0, LID1, FLASH = t['open'] - 0.05, t['open'] + 0.3, t['photo'] + 0.05
SOLVE0, SOLVE1 = T0('hand') + 0.05, t['solved'] + 0.35
WRITE0, WRITE1 = t['written'] - 0.1, T0('shower') - 0.15
HIT = t['smell'] + 0.12
PIG = t['youB'] - 0.05

# ---------------------------------------------------------------- music: minimal 140 bpm, A minor -> C major (enters on Day 1)
BPM = 140
BEAT = 60 / BPM
IN = RW1 + 0.02
TENSE0, LIFT0 = T0('prof'), T0('scribe') - 0.1
chords, cur = [], IN
while cur < D - 1.0:
    if cur < TENSE0 - 0.5: seq = ['Am', 'F', 'C', 'G']
    elif cur < LIFT0 - 0.5: seq = ['Am', 'F', 'Dm', 'E']
    elif cur < ENDC - 0.5: seq = ['C', 'G', 'Am', 'F']
    else: seq = ['F', 'G', 'C', 'C']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2,
             "vel": [[IN, 0.3], [T0('d30'), 0.32], [TENSE0, 0.3], [LIFT0, 0.36], [WATER_ON, 0.4], [D, 0.34]],
             "bass_hold": 0.9, "stab_vel": 0.45, "stab_hold": 0.6}]
TRI = {'Am': [64, 69, 72], 'F': [65, 69, 72], 'C': [64, 67, 72], 'G': [62, 67, 71], 'Dm': [62, 65, 69], 'E': [64, 68, 71]}
ARP = [0, 1, 2, 3, 2, 1, 0, 1]
mallet = []
for i, (ct, sym) in enumerate(chords[:-1]):
    nxt = chords[i + 1][0]; tri = TRI[sym]; tense = TENSE0 - 0.3 < ct < LIFT0 - 0.3
    k, step = 0, (BEAT if tense else BEAT / 2)
    while ct + k * step < nxt - 0.02:
        a = ARP[k % 8]; m = tri[a] if a < 3 else tri[0] + 12
        mallet.append([round(ct + k * step, 3), m, (0.17 if k % 2 == 0 else 0.12) * (0.8 if tense else 1.0), 0.15]); k += 1
pad = [{"t0": IN, "t1": D - 0.2, "notes": [33, 45, 52, 57, 60], "level": 0.55, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30}]   # nothing under the cold open + rewind: the bed ENTERS on Day 1 (quiet open, house rule)
drums = [[round(b, 3), 0.4, "boom"] for b in (IN, EMPTY + 0.1, t['by'] + 0.05, WATER_ON + 0.05)]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.42], [TENSE0, 0.38], [LIFT0, 0.48], [D, 0.44]], "kind": "kick"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.75, 0.25], "vel": [[IN, 0.3], [TENSE0, 0.26], [LIFT0, 0.34], [D, 0.3]], "kind": "tick"},
                 {"t0": LIFT0, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.3, "kind": "clap"}]
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": -3.0, "drums_db": -5.0, "instrument": "pluck",
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

# COLD OPEN: the emptied car, a contented sigh; then the VHS rewind (near-silence + a soft tape whir)
e(0.35, "breath", -20, 0.35, dur=0.9, inhale=False)
e(1.4, "plush_squeak", -27, 0.3, pitch=1.3)
e(RW0 - 0.02, "whoosh_timeskip", -20, 0.0, pre=0.05, post=0.6)
e(RW0, "hiss", -24, 0.0, dur=RW1 - RW0)
# THE MORNING: shower running; homework due at eight; skip it, just this once
e(t['eight'] - 0.05, "whimper", -22, 0.2, pitch=1.25, dur=0.3)
steps(t['skip'] + 0.05, t['just'] - 0.12, 4.5, -22, 0.0, 0.2)
e(t['just'] + 0.05, "plush_squeak", -20, 0.2, pitch=1.8); e(t['just'] + 0.08, "gold_chime", -24, 0.2, notes=[91], spacing=0.05, vel=0.3, dur=0.6)
# THE STREET
steps(T0('d3'), T0('d10'), 4.2, -24, 0.0, 0.0)
for k in range(3): e(t['never'] + 0.05 + k * 0.22, "gold_chime", -24 + k, 0.15, notes=[96 + 2 * k], spacing=0.04, vel=0.28, dur=0.5)   # the shine: a soft ting
steps(T0('d30'), T0('blind'), 4.0, -25, -0.2, 0.2)
e(HIT, "whimper", -18, -0.3, pitch=1.6, dur=0.4); e(HIT + 0.25, "breath", -22, -0.3, dur=0.5, inhale=False)
e(t['smell'] - 0.15, "low_swell", -24, 0.0, dur=1.2, pitch=0.55)   # the smell arrives
e(t['smells'] - 0.1, "breath", -16, 0.0, dur=0.5, inhale=True)    # the armpit sniff
e(PIG + 0.1, "plush_squeak", -19, 0.4, pitch=1.4); e(PIG + 0.3, "knock", -19, 0.4, pitch=0.9)   # the pigeon keels over
steps(T0('d80'), T0('crust'), 9.0, -26, 0.4, -0.3)
e(t['cross'] + 0.1, "car_horn", -27, 0.5, dur=0.35, pitch=1.1, distance=1.6)
steps(T0('crust'), T0('train'), 4.0, -23, 0.0, 0.0)
# THE TRAIN EMPTIES
steps(EMPTY, EMPTY + 1.2, 16.0, -17, 0.2, -0.3)
e(EMPTY + 0.05, "whimper", -22, -0.2, pitch=1.5, dur=0.35)
e(S1('train') + 0.1, "breath", -21, 0.3, dur=0.9, inhale=False)
# THE LIBRARY: asleep on the homework
e(T0('flies') + 0.15, "snore", -19, 0.0, dur=1.8, size=0.8)
# THE PROFESSOR + THE POLE
e(T0('prof') + 0.1, "plush_squeak", -22, 0.0, pitch=0.9)
e(POLE_OUT, "flash_swish", -18, 0.0, dur=0.4, peak=0.6); e(POLE_OUT + 0.25, "knock", -14, 0.1, pitch=1.2); e(POLE_OUT + 0.27, "wood_snap", -24, 0.1, size=0.3)
e(t['handwritten'], "giant_step", -18, 0.0, size=0.4); e(t['handwritten'] + 0.02, "knock", -18, 0.0, pitch=0.7)
e(t['by'], "hiss", -18, 0.0, dur=0.8); e(t['by'] + 0.03, "whimper", -19, 0.0, pitch=0.9, dur=0.5); e(t['by'] + 0.02, "giant_step", -17, 0.0, size=0.5)
# SCRIBE
e(LID0, "knock", -17, 0.2, pitch=1.1); e(LID1, "gold_chime", -16, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "lamp_switch_click", -13, 0.2); e(FLASH, "flash_swish", -17, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -23, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -17, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
k = 0
while WRITE0 + k * 0.5 < WRITE1:
    e(WRITE0 + k * 0.5, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.55); k += 1
# THE SHOWER
e(T0('shower') + 0.45, "giant_step", -19, 0.0, size=0.4); e(T0('shower') + 0.5, "water_splash", -21, 0.0, dur=0.6, size=0.4)
e(WATER_ON, "cartoon_splash", -13, 0.0, dur=2.0, size=1.0); e(WATER_ON + 0.02, "hiss", -18, -0.2, dur=1.6)
e(WATER_ON + 0.1, "low_swell", -15, 0.0, dur=2.4, pitch=1.2)
e(WATER_ON + 0.3, "gold_chime", -15, 0.0, notes=[72, 76, 79, 84, 88], spacing=0.09, vel=0.45, shimmer=0.5, dur=2.8)   # heavenly
e(WATER_ON + 0.4, "wing_flutter", -24, 0.6, dur=0.7, n_birds=3)   # the flies leave
for k in range(14): e(WATER_ON + 0.8 + k * 0.32, "pop", -26 - (k % 3), -0.5 + 0.08 * k, pitch=1.3 + 0.1 * (k % 4))   # bubbles
e(RST0 - 0.02, "whoosh_timeskip", -22, 0.0, pre=0.05, post=0.5); e(RST0, "hiss", -27, 0.0, dur=RST1 - RST0)
e(ENDC, "gold_chime", -15, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)
ev = [x for x in ev if x is not None]

amb = [
    {"sound": "train", "t0": 0.0, "t1": RW0, "fade_in": 0.05, "fade_out": 0.08, "gain_db": -24, "args": {"clack": 2.2}, "seed": 1},
    {"sound": "buzz", "t0": 0.0, "t1": RW0, "fade_in": 0.05, "fade_out": 0.08, "gain_db": -34, "args": {"rate": 38.0}, "seed": 2},
    {"sound": "crowd_cheer", "t0": 0.0, "t1": RW0, "fade_in": 0.1, "fade_out": 0.08, "gain_db": -36, "args": {"excite": 0.15}, "seed": 3},
    {"sound": "water_rush", "t0": RW1, "t1": AM1, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -26, "args": {"intensity": 0.6}, "seed": 4},
    {"sound": "room_tone", "t0": RW1, "t1": AM1, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 5},
    {"sound": "city_day", "t0": AM1, "t1": T0('d80'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -26, "args": {"murmur": 0.5, "traffic": 0.5}, "seed": 6},
    {"sound": "city_day", "t0": T0('d80'), "t1": T0('crust'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -27, "args": {"murmur": 0.6, "traffic": 0.6}, "seed": 7},
    {"sound": "dry_leaves", "t0": T0('d80'), "t1": T0('crust'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 8},
    {"sound": "wind", "t0": T0('crust'), "t1": T0('train'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -27, "args": {"darkness": 0.5, "gust": 0.4, "whistle": 0.05}, "seed": 9},
    {"sound": "train", "t0": T0('train'), "t1": T0('flies'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -24, "args": {"clack": 2.2}, "seed": 10},
    {"sound": "crowd_cheer", "t0": T0('train'), "t1": T0('flies'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -32, "args": {"excite": 0.25}, "seed": 11},
    {"sound": "crickets", "t0": T0('flies'), "t1": T0('prof'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -38, "seed": 12},
    {"sound": "buzz", "t0": T0('flies'), "t1": T0('scribe'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -31, "args": {"rate": 38.0}, "seed": 13},
    {"sound": "room_tone", "t0": T0('prof'), "t1": T0('shower'), "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 14},
    {"sound": "clock", "t0": T0('scribe'), "t1": T0('shower'), "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "pan": 0.2, "seed": 15},
    {"sound": "buzz", "t0": T0('shower'), "t1": WATER_ON + 1.2, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -32, "args": {"rate": 38.0}, "seed": 16},
    {"sound": "water_rush", "t0": WATER_ON, "t1": D, "fade_in": 0.08, "fade_out": 1.0, "gain_db": -22, "args": {"intensity": 1.0}, "seed": 17},
    {"sound": "clock", "t0": T0('hours'), "t1": ENDC + 0.4, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -33, "args": {"rate": 6.0}, "seed": 18},
]

cues = {
    "title": "056 - Scribe dupe: no shower for 365 days (SFX-led; minimal 140 bpm A-minor bed, enters on Day 1; narrator on top)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
