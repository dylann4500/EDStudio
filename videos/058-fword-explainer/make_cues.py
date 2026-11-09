#!/usr/bin/env python3
"""Cue sheet for 058 (Scribe promo, "How to f*cking survive f*cking finals week") -> cues.json.
    python3 -I videos/058-fword-explainer/make_cues.py && python3 -I audio/synth.py 058-fword-explainer

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Sound identity: "DEADPAN EXPLAINER" — the voice and the foley carry it (manager steer, Nov 8: the user finds most of our music bad;
keep the bed minimal and soft under the voice, let the SFX carry it). A quiet, bouncy mallet ostinato in C (C–G–Am–F, the cheerful
how-to-video loop) over a soft four-on-the-floor kick + felt hats at 120 bpm, a warm pad under everything (keeps the bed continuous),
~13 dB under the voice. The tense library run (the professor → "cooked") drops to Am–F–C–G with sparser mallets; Scribe lifts it back.
Foley on every gag: book slams, the mug + carafe, glugs, the eye twitch, microwave beeps, toothbrush, pizza lid + a heavenly chime,
phone pings + a snore, a paper avalanche, the stack slam + rubber stamp, the clock, Scribe's beeps + the pen, the A+ chime + applause,
crickets for the buried study group, and a snore under the end card. All soft + low-passed."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


t = dict(
    f1=W('hook', 'fucking', 1), f2=W('hook', 'fucking', 2), finals=W('hook', 'finals'), week=W('hook', 'week'),
    step1=W('coffee', 'step'), coffee=W('coffee', 'coffee'), not_=W('coffee', 'not'), cup=W('coffee', 'cup'), whole=W('coffee', 'whole'), pot=W('coffee', 'pot'), now1=W('coffee', 'now'), eye=W('coffee', 'eye'),
    step2=W('library', 'step'), library=W('library', 'library'), bed=W('library', 'bed'), kitchen=W('library', 'kitchen'), live=W('library', 'live'), now2=W('library', 'now'),
    step3=W('group', 'step'), study=W('group', 'study'), five=W('group', 'five'), oneP=W('group', 'one'), pizza=W('group', 'pizza'), zero=W('group', 'zero'), studying=W('group', 'studying'),
    step4=W('cards', 'step'), six=W('cards', 'six'), cards2=W('cards', 'flashcards', 2), win=W('cards', 'win'),
    step5=W('prof', 'step'), forty=W('prof', 'forty'), problems=W('prof', 'problems'), all_=W('prof', 'all'), handwritten=W('prof', 'handwritten'), due=W('prof', 'due'), midnight=W('prof', 'midnight'),
    youre=W('cooked', 'youre'), cooked=W('cooked', 'cooked'),
    so=W('scribe', 'so'), open_=W('scribe', 'open'), scribe=W('scribe', 'scribe'), oneS=W('scribe', 'one'), photo=W('scribe', 'photo'), it=W('scribe', 'it'), forty2=W('scribe', 'forty'),
    then=W('hand', 'then'), yourH=W('hand', 'your'), stroke=W('hand', 'stroke'), stroke2=W('hand', 'stroke', 2),
    theM=W('match', 'the'), checks=W('match', 'checks'), hw2=W('match', 'handwriting'), plus=W('match', 'plus'),
    yourF=W('friends', 'your'), still=W('friends', 'still'), cards3=W('friends', 'flashcards'),
    step6=W('sleep', 'step'), sleep=W('sleep', 'sleep'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['sleep'] + 0.55
BOOKT = [x for i, b in enumerate([t['f1'], t['f2'], t['finals'], t['week']]) for x in (b - 0.02, b + 0.1 + 0.03 * i)]
TOSS, POT0, CHUG0, CHUG1 = t['cup'] - 0.12, t['whole'] - 0.1, t['pot'] - 0.08, t['now1'] + 0.05
LID0 = t['pizza'] - 0.25
AV0, AV1 = t['six'] - 0.05, t['win'] + 0.05
SLAM, STAMP = t['problems'] + 0.02, t['handwritten'] + 0.05
LIDO0, LIDO1, FLASH = t['open_'] - 0.05, t['open_'] + 0.3, t['photo'] + 0.05
SOLVE0, SOLVE1 = t['it'] + 0.05, t['forty2'] + 0.25
PEN0, WRITE0, WRITE1 = t['then'] + 0.02, t['yourH'] - 0.05, t['stroke2'] + 0.45

# ---------------------------------------------------------------- music: soft explainer bed, 120 bpm, C major
BPM = 120
BEAT = 60 / BPM
IN = t['step1'] - 0.02
TENSE0, TENSE1 = t['step5'] - 0.1, t['so'] - 0.1
chords, cur = [], IN
while cur < D - 1.0:
    seq = ['Am', 'F', 'C', 'G'] if TENSE0 - 0.5 <= cur < TENSE1 - 0.5 else ['C', 'G', 'Am', 'F']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
VEL = [[IN, 0.22], [t['step3'], 0.24], [TENSE0, 0.18], [TENSE1, 0.25], [t['plus'], 0.27], [ENDCARD, 0.24], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "ostinato", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 4, 2, 1, 2], "vel": VEL, "bass_every": 4, "bass_vel": 0.7, "len": 0.8}]
mallet = []
for c in story['callouts']:                                  # a two-note lift on every STEP label, a rising "ta-da" on TERM callouts
    a = c['t0'] + 0.02
    if a < IN - 0.1: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 76, 0.3, 0.16], [round(a + 0.08, 3), 79, 0.3, 0.16], [round(a + 0.16, 3), 84, 0.34, 0.36]]
    elif c['style'] == 'label':
        mallet += [[round(a, 3), 72, 0.26, 0.14], [round(a + 0.09, 3), 79, 0.28, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 71, 0.26, 0.12], [round(a + 0.11, 3), 64, 0.26, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [36, 48, 55, 60, 64], "level": 0.45, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": 0.05, "t1": IN + 0.3, "notes": [48, 55, 60], "level": 0.35, "attack": 0.9, "release": 0.4, "cutoff": 700, "hp": 30}]   # a soft riser under the hook
drums = [[round(b, 3), 0.32, "boom"] for b in [IN, t['win'], SLAM, t['cooked'], t['plus']]]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.18 + 0.05 * k, "tick"] for k in range(4)]   # a little hat pickup into the groove
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.36], [TENSE0, 0.28], [TENSE1, 0.38], [D, 0.32]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.22], [TENSE0, 0.16], [TENSE1, 0.24], [D, 0.22]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[IN, 0.26], [TENSE0, 0.2], [TENSE1, 0.28], [D, 0.26]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -1.0, "drums_db": -6.0, "instrument": "pluck",
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

# HOOK: textbooks slam onto the towers
for i, bt in enumerate(BOOKT):
    e(bt + 0.2, "giant_step", -19, -0.4 if i % 2 == 0 else 0.4, size=0.35); e(bt + 0.21, "knock", -21, -0.4 if i % 2 == 0 else 0.4, pitch=0.6)
e(0.05, "low_swell", -24, 0.0, dur=1.6, pitch=1.0)
# COFFEE
e(t['step1'] + 0.15, "slurp", -20, 0.2, dur=0.45)
e(TOSS, "flash_swish", -17, -0.3, dur=0.3, peak=0.6)
e(t['cup'] + 0.35, "glass_crack", -18, -0.7, dur=0.6, n_pings=3)
e(POT0, "clunk", -18, 0.1, size=0.4, metal=0.2); e(POT0 + 0.05, "pop", -20, 0.1, pitch=0.9)
e(CHUG0, "slurp", -14, 0.1, dur=CHUG1 - CHUG0 + 0.1)
for k in range(5): e(CHUG0 + 0.06 + k * 0.11, "plip", -20, 0.15, pitch=0.6 + 0.08 * k)   # glug glug
e(t['now1'] + 0.05, "zap", -22, 0.0, dur=0.25)
for k in range(10): e(t['eye'] - 0.05 + k * 0.105, "plush_squeak", -22 - (k % 2) * 2, 0.15, pitch=2.0 + 0.1 * (k % 3))   # the twitch
e(t['eye'], "heartbeat", -17, 0.0, size=0.6); e(t['eye'] + 0.28, "heartbeat", -18, 0.0, size=0.6)
# LIBRARY LIFE
steps(t['step2'] + 0.1, t['bed'] - 0.35, 4.5, -22, 0.3, -0.3)
e(t['bed'] - 0.25, "mattress_sit", -16, -0.2); e(t['bed'] - 0.2, "blanket_rustle", -20, -0.2, dur=0.5, intensity=0.8)
for k in range(3): e(t['kitchen'] - 0.1 + k * 0.16, "scan_beep", -20, 0.3, pitch=1.1, dur=0.1)   # the microwave
e(t['kitchen'] + 0.4, "gold_chime", -24, 0.3, notes=[96], spacing=0.05, vel=0.3, dur=0.4)
for k in range(6): e(t['live'] - 0.15 + k * 0.14, "grate", -26, -0.1, dur=0.11)   # toothbrush
# STUDY GROUP
e(LID0 + 0.1, "wood_snap", -22, 0.0, size=0.3); e(LID0 + 0.12, "gold_chime", -15, 0.0, notes=[79, 84, 88, 91], spacing=0.06, vel=0.42, shimmer=0.4, dur=1.6)
e(LID0 + 0.1, "low_swell", -20, 0.0, dur=0.9, pitch=1.6)
for k in range(4): e(t['zero'] - 0.05 + k * 0.12, "scan_beep", -21, -0.5 + 0.33 * k, pitch=1.5 + 0.12 * k, dur=0.08)   # phones
e(t['studying'] + 0.05, "snore", -20, 0.4, dur=1.0, size=0.5)
e(t['studying'] + 0.1, "slurp", -24, -0.3, dur=0.3)
# FLASHCARDS
for k in range(4): e(t['step4'] + 0.15 + k * 0.35, "blanket_rustle", -24, 0.1, dur=0.12, intensity=0.5)
e(AV0, "blanket_rustle", -15, 0.0, dur=AV1 - AV0, intensity=1.0)
e(AV0 + 0.2, "whimper", -22, 0.0, pitch=1.3, dur=0.35)
e(t['win'], "giant_step", -13, 0.0, size=0.7); e(t['win'] + 0.05, "crumble", -18, 0.0, dur=0.5, size=0.4)
e(t['win'] + 0.25, "whimper", -19, 0.0, pitch=0.9, dur=0.5)
# THE PROFESSOR
e(SLAM - 0.15, "flash_swish", -19, -0.1, dur=0.2, peak=0.5); e(SLAM, "giant_step", -10, -0.1, size=0.9); e(SLAM + 0.01, "wood_snap", -16, -0.1, size=0.6)
e(SLAM + 0.05, "blanket_rustle", -20, -0.1, dur=0.6, intensity=0.9)
e(t['all_'] - 0.05, "flash_swish", -21, 0.2, dur=0.25, peak=0.5)
e(STAMP, "knock", -12, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
e(t['due'] - 0.02, "counter_tick", -15, 0.2, bright=0.8)
e(t['midnight'], "counter_tick", -15, 0.2, bright=0.8)
# COOKED
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.05, "whimper", -19, 0.0, pitch=1.1, dur=0.4)
# SCRIBE (as 049)
e(LIDO0, "knock", -17, 0.2, pitch=1.1); e(LIDO1, "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 95], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < t['theM'] - 0.1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
# MATCH
e(t['theM'] + 0.05, "blanket_rustle", -21, 0.0, dur=0.3, intensity=0.7)
for k in range(3): e(t['checks'] + 0.1 + k * 0.2, "plush_squeak", -24, 0.0, pitch=1.6)   # eyes darting
e(t['hw2'] - 0.05, "breath", -16, 0.0, dur=0.4, inhale=True)
e(t['plus'] - 0.02, "knock", -14, 0.3, pitch=1.0); e(t['plus'], "gold_chime", -13, 0.3, notes=[79, 84, 88, 91, 96], spacing=0.06, vel=0.5, shimmer=0.4, dur=1.6)
for k in range(8): e(t['plus'] + 0.05 + k * 0.05, "pop", -22 - (k % 3), -0.6 + 0.17 * k, pitch=1.2 + 0.1 * (k % 4))
# FRIENDS (night, buried)
e(t['yourF'], "blanket_rustle", -20, 0.0, dur=1.6, intensity=0.6)
e(t['still'], "whimper", -18, -0.3, pitch=1.4, dur=0.45); e(t['cards3'] + 0.05, "whimper", -19, 0.3, pitch=0.9, dur=0.5)
e(t['cards3'], "giant_step", -18, 0.0, size=0.4)
# SLEEP + END CARD
e(t['step6'] + 0.05, "blanket_rustle", -18, -0.2, dur=0.7, intensity=0.8)
e(t['sleep'] + 0.1, "snore", -16, 0.0, dur=2.2, size=0.7); e(t['sleep'] + 2.5, "snore", -18, 0.0, dur=2.0, size=0.7)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": t['step1'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 1},
    {"sound": "clock", "t0": 0.0, "t1": t['step1'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "pan": 0.2, "seed": 2},
    {"sound": "room_tone", "t0": t['step1'], "t1": t['step2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 3},
    {"sound": "city_day", "t0": t['step1'], "t1": t['step2'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "seed": 4},
    {"sound": "room_tone", "t0": t['step2'], "t1": t['step3'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 5},
    {"sound": "room_tone", "t0": t['step3'], "t1": t['step4'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 6},
    {"sound": "crowd_cheer", "t0": t['step3'], "t1": t['step4'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -33, "args": {"excite": 0.15}, "seed": 7},   # table chatter
    {"sound": "room_tone", "t0": t['step4'], "t1": t['step5'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 8},
    {"sound": "dry_leaves", "t0": AV0, "t1": AV1 + 0.4, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -26, "seed": 9},   # the paper avalanche
    {"sound": "room_tone", "t0": t['step5'], "t1": t['so'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 10},
    {"sound": "clock", "t0": t['due'], "t1": t['so'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -30, "pan": 0.2, "seed": 11},
    {"sound": "room_tone", "t0": t['so'], "t1": t['yourF'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 12},
    {"sound": "crickets", "t0": t['yourF'], "t1": t['step6'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -36, "seed": 13},
    {"sound": "room_tone", "t0": t['step6'], "t1": D, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -33, "seed": 14},
    {"sound": "applause", "t0": t['plus'] + 0.05, "t1": t['yourF'] + 0.2, "fade_in": 0.1, "fade_out": 0.4, "gain_db": -26, "seed": 15},
]

cues = {
    "title": "058 - Scribe promo: how to f*cking survive f*cking finals week (soft explainer mallet bed 120 bpm + gag foley + deadpan narrator)",
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
