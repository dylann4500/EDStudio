#!/usr/bin/env python3
"""Cue sheet for 053 (Scribe promo, "Day N of inventing my way out of homework", flat2d look) -> cues.json.
    python3 -I videos/053-inventing-out-of-homework/make_cues.py && python3 -I audio/synth.py 053-inventing-out-of-homework

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so re-voicing keeps every sound on
its picture.

Sound identity: "GARAGE GADGETS" — a SOFT 140 bpm bed (manager relay of the user, Nov 8: most of our music is bad; keep it minimal under
the voice and let SFX carry the reel; an out/nomusic.mp4 gets a trending sound at upload): a marimba 8th-note arp in F major (F–C–Dm–Bb),
one low pluck per chord, a quiet pad, a felt four-on-the-floor kick + claps on 2 + 4 + 16th ticks. The obstacle (Mrs. Grimm, invention
41) turns the chords to Dm–Bb–C–A with the arp in quarters; Scribe lifts back to the bright loop; the end card resolves on F.
Foley carries the gags: robot clanks + a CHOMP, a drone buzz + pencil scribbles, a lever clunk + zap + eleven pops and boofs, a time
rumble + whoosh + a landing thump + a paper avalanche, the stack slam + stamp, the robot arm's whir + sparks + the BOOM, the laptop chime,
a camera shutter, solve beeps, the pen writing, the printer, the gold-star chime, then classroom applause. All soft + low-passed."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


T = dict(
    homework0=W('hook', 'homework'), every=W('hook', 'every'), this=W('intro', 'this'), leo=W('intro', 'leo'),
    day1=W('dog', 'day'), robot=W('dog', 'robot'), eats=W('dog', 'eats'), it1=W('dog', 'it'), ate=W('dog', 'ate'), wearing=W('dog', 'wearing'),
    day9=W('drone', 'day'), pencil=W('drone', 'pencil'), does=W('drone', 'does'), it2=W('drone', 'it'), drew=W('drone', 'drew'), mustache=W('drone', 'mustache'), mom=W('drone', 'mom'),
    day23=W('clone', 'day'), clone=W('clone', 'clone'), so1=W('clone', 'so'), second=W('clone', 'second'), it3=W('clone', 'it', 2), cloned=W('clone', 'cloned'), eleven=W('clone', 'eleven'),
    day40=W('time', 'day'), tmach=W('time', 'time'), back=W('time', 'back'), before=W('time', 'before'), nineteen=W('time', 'nineteen'), more=W('time', 'more'),
    then=W('teacher', 'then'), grimm=W('teacher', 'grimm'), drops=W('teacher', 'drops'), handwritten=W('teacher', 'handwritten'), and1=W('teacher', 'and'),
    invention=W('boom', 'invention'), f41=W('boom', 'fortyone'), fake=W('boom', 'fake'), lasted=W('boom', 'lasted'), four=W('boom', 'four'), seconds=W('boom', 'seconds'),
    so2=W('scribe', 'so'), showed=W('scribe', 'showed'), scribe=W('scribe', 'scribe'), he=W('scribe', 'he'), wrote=W('scribe', 'wrote'), learns=W('scribe', 'learns'),
    one=W('photo', 'one'), photo=W('photo', 'photo'), scribe2=W('photo', 'scribe'), reads=W('photo', 'reads'), step=W('photo', 'step'),
    then2=W('write', 'then'), his=W('write', 'his'), pen=W('write', 'pen'),
    he2=W('print', 'he'), prints=W('print', 'prints'), done=W('print', 'done'),
    next=W('match', 'next'), checks=W('match', 'checks'), perfect=W('match', 'perfect'),
    so3=W('payoff', 'now'), f42=W('payoff', 'fortytwo'), first=W('payoff', 'first'), worked=W('payoff', 'worked'), takes=W('payoff', 'takes'), credit=W('payoff', 'credit'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = T['credit'] + 0.75
BOOM = T['seconds'] + 0.08
DOGS = [T['cloned'] + 0.15 + i * 0.09 for i in range(11)]          # each clone lands ~0.45 s after it pops out
LAND82 = T['nineteen'] + 0.25
FLASH = T['photo'] + 0.1
SOLVE0, SOLVE1 = T['reads'] + 0.2, T['step'] + 0.2

# ---------------------------------------------------------------- music: soft 140 bpm, F major
BPM = 140
BEAT = 60 / BPM
IN = T['this'] - 0.02                       # the groove starts under "This is Leo" (the hook gets a riser + a hat build)
TENSE0, LIFT0 = T['then'] - 0.1, T['so2'] - 0.1
chords, cur = [], IN
while cur < D - 1.0:
    if cur < TENSE0 - 0.5: seq = ['F', 'C', 'Dm', 'Bb']
    elif cur < LIFT0 - 0.5: seq = ['Dm', 'Bb', 'C', 'A']
    elif cur < ENDCARD - 0.5: seq = ['F', 'C', 'Dm', 'Bb']
    else: seq = ['Bb', 'C', 'F', 'F']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'F'])
sections = [{"t0": IN, "t1": D, "style": "sparse", "vel": [[IN, 0.22], [TENSE0, 0.2], [LIFT0, 0.24], [D, 0.22]]}]
TRI = {'F': [65, 69, 72], 'C': [64, 67, 72], 'Dm': [65, 69, 74], 'Bb': [65, 70, 74], 'A': [64, 69, 73]}
ARP = [0, 1, 2, 3, 2, 1, 0, 1]
mallet = []
for i, (ct, sym) in enumerate(chords[:-1]):
    nxt = chords[i + 1][0]; tri = TRI[sym]; tense = TENSE0 - 0.3 < ct < LIFT0 - 0.3
    k, stp = 0, (BEAT if tense else BEAT / 2)
    while ct + k * stp < nxt - 0.02:
        a = ARP[k % 8]; m = tri[a] if a < 3 else tri[0] + 12
        mallet.append([round(ct + k * stp, 3), m, (0.17 if k % 2 == 0 else 0.12) * (0.85 if tense else 1.0), 0.15]); k += 1
for a in [T['f42'], T['worked'], ENDCARD]:   # a little rising "ta-da" on the wins
    mallet += [[round(a, 3), 77, 0.3, 0.14], [round(a + 0.08, 3), 81, 0.3, 0.14], [round(a + 0.16, 3), 84, 0.34, 0.4]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [41, 53, 60, 65], "level": 0.42, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": 0.05, "t1": IN + 0.25, "notes": [53, 60, 65], "level": 0.4, "attack": 0.8, "release": 0.4, "cutoff": 700, "hp": 30}]   # a riser under the hook
PRE = IN - BEAT * int(IN / BEAT - 0.1)
drums = [[round(PRE + k * BEAT / 4, 3), 0.18 + 0.25 * k / max(1, (IN - PRE) / (BEAT / 4)), "tick"] for k in range(int((IN - PRE) / (BEAT / 4)))]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.2 + 0.08 * k, "tom"] for k in range(4)]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.42], [TENSE0, 0.36], [LIFT0, 0.44], [D, 0.4]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.3], [TENSE0, 0.26], [LIFT0, 0.32], [D, 0.3]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.75, 0.25], "vel": [[IN, 0.28], [TENSE0, 0.24], [LIFT0, 0.3], [D, 0.28]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -3.0, "drums_db": -6.0, "instrument": "pluck",
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
def scribble(a, b, gain=-19, pan=0.0):
    t = a
    while t < b - 0.2: e(t, "pen_scribble", gain, pan, dur=min(0.7, b - t)); t += 0.65
def slam(tt, big=1.0, pan=0.0):
    e(tt, "giant_step", -13 + 2 * (big - 1), pan, size=0.6 * big); e(tt + 0.01, "blanket_rustle", -18, pan, dur=0.5, intensity=1.0); e(tt + 0.03, "knock", -17, pan, pitch=0.7)

# HOOK: the junk pile ticks + a spring boing, Leo's fist pump
e(0.15, "metal_clang", -26, -0.4, size=0.3, pitch=1.6, dur=0.6)
e(T['every'], "plush_squeak", -22, -0.3, pitch=1.5)
e(T['homework0'] + 0.1, "pop", -20, -0.2, pitch=1.2)
e(T['leo'], "pop", -16, 0.2, pitch=0.9); e(T['leo'] + 0.04, "gold_chime", -22, 0.2, notes=[84, 88], spacing=0.06, vel=0.35)   # the LEO, 9 tag
# DOG: robot trot + chomps, CHOMP on the slipper, Dad's yelp
e(T['day1'], "pop", -18, 0.0, pitch=0.8)
for k in range(10): e(T['robot'] - 0.3 + k * 0.17, "knock", -24, -0.5 + 0.08 * k, pitch=1.8 + 0.1 * (k % 2))
for k in range(5): e(T['eats'] + 0.04 * 0 + k * 0.14, "clunk", -24, 0.0, size=0.25, metal=0.9)
e(T['ate'], "clunk", -11, 0.1, size=0.7, metal=1.0); e(T['ate'] + 0.02, "bonk", -15, 0.1); e(T['ate'] + 0.12, "whimper", -15, 0.1, pitch=1.6, dur=0.4)
for k in range(5): e(T['ate'] + 0.25 + k * 0.33, "giant_step", -21, 0.1, size=0.35)   # Dad hopping
e(T['ate'] + 0.2, "blanket_rustle", -20, -0.3, dur=0.6, intensity=0.8)   # the newspaper flying
# DRONE: rotor buzz bed, the pencil on paper, then on Mom
e(T['day9'], "pop", -18, 0.0, pitch=0.85)
scribble(T['does'] + 0.05, T['it2'] - 0.05, -21, -0.3)
scribble(T['drew'], T['mom'] - 0.05, -17, 0.2)
e(T['mom'] + 0.05, "metal_groan", -24, 0.2, dur=0.5)   # Mom's growl (soft)
# CLONE: lever, zap, eleven clones popping out + boofs
e(T['day23'], "pop", -18, 0.0, pitch=0.9)
e(T['clone'], "metal_clang", -22, 0.0, size=0.6, pitch=1.2, dur=0.8)
steps(T['second'], T['it3'] - 0.1, 9.0, -27, -0.6, -0.3)   # Biscuit trots in
e(T['it3'] - 0.1, "clunk", -13, 0.2, size=0.8, metal=0.9)   # the lever
e(T['cloned'] - 0.02, "zap", -14, 0.0, dur=0.7); e(T['cloned'], "flash_swish", -16, 0.0, dur=0.4, peak=0.6)
for i, dt in enumerate(DOGS):
    e(dt, "pop", -15 - (i % 3), -0.6 + 0.12 * i, pitch=0.8 + 0.07 * (i % 5))
    if i % 3 == 0: e(dt + 0.12, "dog_bark", -20, -0.5 + 0.1 * i, pitch=1.0 + 0.1 * (i % 4))
e(T['eleven'], "gold_chime", -19, 0.3, notes=[88, 91], spacing=0.06, vel=0.35)
# TIME: rumble, whoosh to 1982, landing, the paper avalanche
e(T['day40'], "pop", -18, 0.0, pitch=0.95)
e(T['back'], "counter_tick", -20, 0.2, bright=0.8)
e(T['nineteen'] - 0.05, "whoosh_timeskip", -12, 0.0, pre=0.4, post=0.3)
e(LAND82, "giant_step", -12, 0.0, size=0.8); e(LAND82 + 0.02, "crumble", -21, 0.0, dur=0.6, size=0.4)
e(T['more'] - 0.25, "flash_swish", -20, 0.3, dur=0.3, peak=0.5); slam(T['more'], 1.3, 0.2)
# TEACHER: the stack slams on Leo's desk, the HANDWRITTEN stamp, the magnifier glint
slam(T['drops'] + 0.05, 1.1, 0.2)
e(T['handwritten'] - 0.02, "giant_step", -15, 0.0, size=0.5); e(T['handwritten'], "knock", -15, 0.0, pitch=0.7)
e(T['and1'] + 0.05, "gold_chime", -22, -0.2, notes=[91], spacing=0.05, vel=0.3, dur=0.5)
# BOOM: the arm whirs + scribbles, sparks, the explosion
e(T['invention'], "pop", -18, 0.0, pitch=1.0)
scribble(T['fake'], T['four'], -18, 0.2)
for k in range(6): e(T['lasted'] + k * 0.11, "zap", -24, 0.3 * (1 if k % 2 else -1), dur=0.25)
e(BOOM, "fireball", -8, 0.0, size=1.0); e(BOOM + 0.02, "distant_boom", -11, 0.0, size=0.9); e(BOOM + 0.05, "crumble", -17, 0.0, dur=0.9, size=0.7)
for k in range(4): e(BOOM + 0.5 + k * 0.13, "knock", -22, -0.6 + 0.4 * k, pitch=1.1)   # bits landing
# SCRIBE: Max walks in, the laptop chime; the practice page on the tablet
steps(T['so2'] - 0.1, T['showed'] + 0.1, 5.0, -25, 0.6, 0.3)
e(T['scribe'], "gold_chime", -16, 0.2, notes=[77, 84, 89], spacing=0.08, vel=0.42)
scribble(T['wrote'] - 0.05, T['one'] - 0.1, -20, 0.1)
e(T['learns'] + 0.05, "gold_chime", -19, 0.1, notes=[84, 91], spacing=0.07, vel=0.35)
# PHOTO + SOLVE: shutter, scan, solve beeps
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
e(T['scribe2'] + 0.05, "scan_beep", -20, 0.0, pitch=1.0, dur=0.3)
for k in range(14): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 14, "scan_beep", -23, 0.1, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -17, 0.0, notes=[79, 84, 88], spacing=0.07, vel=0.4)
# WRITE: the pen, stroke by stroke
scribble(T['then2'] + 0.1, T['he2'] - 0.05, -17, 0.0)
# PRINT: the printer + pages flying
e(T['prints'], "grate", -22, 0.2, dur=1.0)
for k in range(6): e(T['prints'] + k * 0.12, "blanket_rustle", -22, 0.2 - 0.12 * k, dur=0.25, intensity=0.6)
e(T['done'], "pop", -18, -0.2, pitch=1.2)
# MATCH: the magnifier pass, the gold star
e(T['next'], "pop", -18, 0.0, pitch=0.9)
e(T['perfect'] + 0.04, "knock", -14, 0.0, pitch=0.8); e(T['perfect'] + 0.05, "gold_chime", -14, 0.2, notes=[84, 88, 91, 96], spacing=0.06, vel=0.45, shimmer=0.3, dur=1.4)
# PAYOFF: the board flips, confetti, applause, the trophy
e(T['f42'], "pop", -15, 0.0, pitch=1.0)
for k in range(8): e(T['worked'] - 0.35 + k * 0.03, "pop", -21 - (k % 3), -0.6 + 0.15 * k, pitch=1.3 + 0.1 * (k % 4))
e(T['takes'], "gold_chime", -17, -0.2, notes=[88, 91, 96], spacing=0.06, vel=0.4)
e(ENDCARD, "gold_chime", -15, 0.0, notes=[77, 81, 84, 89], spacing=0.07, vel=0.45, shimmer=0.3, dur=2.4)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": T['day1'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -33, "seed": 1},
    {"sound": "lamp_hum", "t0": 0.0, "t1": T['day1'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -40, "seed": 2},
    {"sound": "room_tone", "t0": T['day1'], "t1": T['day23'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 3},
    {"sound": "clock", "t0": T['day1'], "t1": T['day9'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -38, "pan": 0.3, "seed": 4},
    {"sound": "buzz", "t0": T['pencil'] - 0.2, "t1": T['day23'], "fade_in": 0.2, "fade_out": 0.15, "gain_db": -30, "args": {"rate": 30.0}, "seed": 5},
    {"sound": "lamp_hum", "t0": T['day23'], "t1": T['nineteen'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -36, "seed": 6},
    {"sound": "rocket_rumble", "t0": T['before'], "t1": T['nineteen'] + 0.1, "fade_in": 0.3, "fade_out": 0.1, "gain_db": -26, "args": {"rise": 1.0}, "seed": 7},
    {"sound": "kids_laugh", "t0": T['nineteen'] + 0.2, "t1": T['invention'], "fade_in": 0.2, "fade_out": 0.1, "gain_db": -36, "args": {"density": 0.4}, "seed": 8},
    {"sound": "drill", "t0": T['fake'], "t1": BOOM, "fade_in": 0.1, "fade_out": 0.05, "gain_db": -28, "args": {"rate": 9.0}, "seed": 9},
    {"sound": "crickets", "t0": T['he'], "t1": T['next'], "fade_in": 0.2, "fade_out": 0.1, "gain_db": -42, "seed": 10},
    {"sound": "kids_laugh", "t0": T['next'], "t1": T['first'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -38, "args": {"density": 0.3}, "seed": 11},
    {"sound": "applause", "t0": T['first'] - 0.1, "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -24, "seed": 12},
    {"sound": "crowd_cheer", "t0": T['worked'] - 0.1, "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -30, "args": {"excite": 0.6}, "seed": 13},
]

cues = {
    "title": "053 - Scribe promo: Day N of inventing my way out of homework (flat2d; soft GARAGE GADGETS marimba 140 bpm + cartoon foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -12.0, "sfx": 3.5, "amb": 4.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
