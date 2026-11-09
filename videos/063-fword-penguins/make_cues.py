#!/usr/bin/env python3
"""Cue sheet for 063 (Scribe promo, "How f*cking penguins f*cking survive f*cking Antarctica") -> cues.json.
    python3 -I videos/063-fword-penguins/make_cues.py && python3 -I audio/synth.py 063-fword-penguins

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Sound identity: "DEADPAN NATURE DOC" — the f-word explainer series' bed (058: a quiet bouncy mallet ostinato in C over a soft
four-on-the-floor kick + felt hats at 120 bpm, a warm pad, ~13 dB under the voice; the teacher → "cooked" run drops to Am–F–C–G),
but the ice carries the reel: a polar wind bed that howls in the blizzard shots and hushes on the plain, a colony of soft honks
around the huddle, water lapping at the floe edge. Foley on every gag: snow thumps on each F-word in the hook, ice crackling shut,
the ice block shattering + heads bopping, a sizzle in the hot middle, the egg's squeak + hop, a time-lapse whoosh, a fish dream
blub, the belly flop + a slide hiss, a whoosh past the walker, a bowling-strike crash, the seal's surge + teeth clack, Kevin's
splash + squawk, footsteps in the snow, then 058's office/library/Scribe foley and a chime under the end card. All soft + low-passed."""
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
    hf1=W('hook', 'fucking', 1), hf2=W('hook', 'fucking', 2), hf3=W('hook', 'fucking', 3), ant=W('hook', 'antarctica'),
    step1=W('huddle', 'step'), freeze=W('huddle', 'freeze'), then=W('huddle', 'then'), up=W('huddle', 'up'), t37=W('huddle', 'thirty-seven'), middle=W('huddle', 'middle'),
    step2=W('egg', 'step'), egg=W('egg', 'egg'), mom=W('egg', 'mom'), leaves=W('egg', 'leaves'), dad=W('egg', 'dad'), holds=W('egg', 'holds'), feet=W('egg', 'feet'), two2=W('egg', 'two', 2), months=W('egg', 'months'), no=W('egg', 'no'), food=W('egg', 'food'),
    step3=W('slide', 'step'), belly=W('slide', 'belly'), slide=W('slide', 'slide'), faster=W('slide', 'faster'), walking=W('slide', 'walking'), sf4=W('slide', 'fucking', 4), strike=W('slide', 'strike'),
    step4=W('seal', 'step'), leopard=W('seal', 'leopard'), seal=W('seal', 'seal'), never=W('seal', 'never'), first=W('seal', 'first'), push=W('seal', 'push'), kevin=W('seal', 'kevin'),
    wAnd=W('wrong', 'and'), always=W('wrong', 'always'), one=W('wrong', 'one'), penguinW=W('wrong', 'penguin'), walkingW=W('wrong', 'walking'), way=W('wrong', 'way'),
    tAnd=W('teacher', 'and'), biology=W('teacher', 'biology'), penguinT=W('teacher', 'penguin'), worksheet=W('teacher', 'worksheet'), tf3=W('teacher', 'fucking', 3), handwritten=W('teacher', 'handwritten'),
    youre=W('cooked', 'youre'), cooked=W('cooked', 'cooked'),
    so=W('scribe', 'so'), open_=W('scribe', 'open'), scribe=W('scribe', 'scribe'), oneS=W('scribe', 'one'), photo=W('scribe', 'photo'), it=W('scribe', 'it'), worksheet2=W('scribe', 'worksheet'),
    in_=W('hand', 'in'), yourH=W('hand', 'your'), stroke=W('hand', 'stroke'), stroke2=W('hand', 'stroke', 2),
    yourM=W('match', 'your'), mf2=W('match', 'fucking', 2), plus=W('match', 'plus'),
    lAnd=W('last', 'and'), still=W('last', 'still'), wayL=W('last', 'way'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['wayL'] + 0.55
DRIFT = [t['hf1'] + 0.05, t['hf2'] + 0.05, t['hf3'] + 0.05, t['ant'] + 0.12]
FRZ, SW0, SW1 = t['freeze'] + 0.06, t['then'] + 0.06, t['up'] - 0.12
HOP0, HOP1, MOMGO = t['mom'] + 0.02, t['mom'] + 0.36, t['leaves'] - 0.05
N0, N1, N2, N3 = t['two2'] - 0.05, t['two2'] + 0.35, t['months'] + 0.25, t['no'] - 0.02
FLOP, GO, STRIKE = t['belly'] - 0.08, t['slide'] - 0.06, t['strike'] - 0.06
PASS = (t['faster'] + t['walking']) / 2 + 0.12
RISE0, GRIN, PUSH, SPLASH = t['leopard'] - 0.22, t['seal'] - 0.04, t['push'] + 0.04, t['kevin'] - 0.1
LUNGE, ROCKET, CHOMP, KLAND = SPLASH + 0.1, SPLASH + 0.2, SPLASH + 0.32, SPLASH + 0.9
TURN0, TURN1 = t['penguinW'] - 0.1, t['walkingW'] + 0.05
SLAM, STAMP = t['worksheet'] + 0.02, t['handwritten'] + 0.05
LIDO0, LIDO1, FLASH = t['open_'] - 0.05, t['open_'] + 0.3, t['photo'] + 0.05
SOLVE0, SOLVE1 = t['it'] + 0.05, t['worksheet2'] + 0.25
PEN0, WRITE0, WRITE1 = t['in_'] + 0.02, t['yourH'] - 0.05, t['stroke2'] + 0.45
ICE_END, LIB0 = t['tAnd'], t['tAnd']

# ---------------------------------------------------------------- music: the series' soft explainer bed, 120 bpm, C major
BPM = 120
BEAT = 60 / BPM
IN = t['step1'] - 0.02
TENSE0, TENSE1 = t['tAnd'] - 0.1, t['so'] - 0.1
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
for k in range(4): mallet.append([round(t['wayL'] - 0.05 + k * 0.16, 3), [67, 64, 62, 60][k], 0.2, 0.3])   # the lonely walk: a little falling line
pad = [{"t0": IN, "t1": D - 0.2, "notes": [36, 48, 55, 60, 64], "level": 0.45, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": 0.05, "t1": IN + 0.3, "notes": [48, 55, 60, 64], "level": 1.4, "attack": 0.5, "release": 0.4, "cutoff": 800, "hp": 30}]   # a riser under the hook (a quiet pre-roll trips the dropout check)
drums = [[round(b, 3), 0.32, "boom"] for b in [IN, FRZ, STRIKE, GRIN, CHOMP, SLAM, t['cooked'], t['plus']]]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.18 + 0.05 * k, "tick"] for k in range(4)]
END_D = D - 0.6
drum_patterns = [{"t0": 0.1, "t1": IN - BEAT, "step": BEAT / 4, "pattern": [0.5, 0.25, 0.8, 0.3], "vel": [[0.1, 0.1], [IN, 0.2]], "kind": "tick"},   # felt hats under the hook (keeps the bed continuous)
                 {"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.36], [TENSE0, 0.28], [TENSE1, 0.38], [D, 0.32]], "kind": "kick"},
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

# HOOK: each F*CKING dumps a slab of snow on him
e(0.05, "low_swell", -24, 0.0, dur=1.6, pitch=1.0)
for i, tb in enumerate(DRIFT):
    e(tb, "giant_step", -19 + i, 0.0, size=0.3 + 0.08 * i); e(tb + 0.01, "blanket_rustle", -20, 0.0, dur=0.35, intensity=0.9)
# HUDDLE: a colony of soft honks; the ice cracks shut on him; it shatters; heads bop as he crowd-surfs; it's hot in the middle
for k in range(9): e(t['step1'] + 0.1 + k * 0.21, "goose_honk", -31 - (k % 3) * 2, -0.6 + 0.15 * k, pitch=0.8 + 0.08 * (k % 4), dur=0.22, angry=0.6)
e(FRZ - 0.03, "glass_crack", -16, 0.3, dur=0.5, n_pings=3); e(FRZ, "zap", -24, 0.3, dur=0.2)
e(SW0, "glass_crack", -13, 0.2, dur=0.7, n_pings=4); e(SW0 + 0.02, "crumble", -22, 0.2, dur=0.5, size=0.3)
e(SW0 + 0.1, "flash_swish", -19, 0.1, dur=0.5, peak=0.6)
for k in range(5): e(SW0 + 0.18 + k * 0.13, "plush_squeak", -24, 0.3 - 0.15 * k, pitch=1.3 + 0.1 * (k % 3))
e(SW1 + 0.06, "pop", -20, 0.0, pitch=0.8)
e(t['up'], "sizzle", -26, 0.0, dur=1.6); e(t['t37'] + 0.1, "breath", -22, 0.0, dur=0.7, inhale=False)
for k in range(4): e(t['up'] + 0.2 + k * 0.38, "plip", -26, 0.1, pitch=1.2)
# EGG: Mom flips it over, he catches it, she leaves; two months of night; he dreams of fish
e(t['egg'], "plush_squeak", -22, -0.2, pitch=0.9)
e(HOP0, "boing", -22, -0.2, pitch=1.3, dur=0.4); e(HOP1, "pop", -19, 0.2, pitch=1.1); e(HOP1 + 0.02, "gold_chime", -24, 0.2, notes=[88], spacing=0.05, vel=0.3, dur=0.5)
for k in range(3): e(HOP1 + 0.15 + k * 0.17, "plush_squeak", -25, 0.2, pitch=0.7 + 0.1 * k)
e(MOMGO + 0.1, "flash_swish", -24, -0.3, dur=0.3, peak=0.4)
steps(MOMGO + 0.25, t['dad'] - 0.1, 4.5, -27, -0.3, -0.5)
for k in range(4): e(t['holds'] + 0.1 + k * 0.28, "plush_squeak", -25, 0.0, pitch=0.6 + 0.08 * (k % 2))   # the wobble
e(N0 + 0.3, "whoosh_timeskip", -16, 0.0, pre=0.35, post=0.5)
e(N2, "low_swell", -22, 0.0, dur=0.8, pitch=0.8)
e(t['food'] - 0.1, "whimper", -22, 0.0, pitch=1.2, dur=0.4); e(t['food'] + 0.02, "fish_blub", -18, 0.3, n_bub=3, dur=0.5)
# BELLY SLIDE: the flop, the slide, the overtake, the strike
e(FLOP + 0.14, "giant_step", -16, 0.0, size=0.4); e(FLOP + 0.15, "blanket_rustle", -20, 0.0, dur=0.4, intensity=0.9)
e(GO, "hiss", -26, 0.0, dur=STRIKE - GO + 0.3)
e(PASS - 0.15, "flash_swish", -15, -0.4, dur=0.35, peak=0.8); e(PASS + 0.1, "plush_squeak", -22, 0.2, pitch=1.6)
e(STRIKE, "giant_step", -11, 0.0, size=0.8); e(STRIKE + 0.01, "bonk", -16, 0.0, dur=0.5)
for k in range(8): e(STRIKE + 0.03 + k * 0.04, "knock", -19 - (k % 3) * 2, -0.6 + 0.17 * k, pitch=0.8 + 0.1 * (k % 4))
for k in range(4): e(STRIKE + 0.12 + k * 0.1, "goose_honk", -25, -0.4 + 0.25 * k, pitch=1.1 + 0.1 * k, dur=0.2, angry=0.8)
for k in range(5): e(STRIKE + 0.7 + k * 0.08, "giant_step", -22, -0.5 + 0.25 * k, size=0.25)   # the pins landing
# LEOPARD SEAL
e(RISE0 + 0.08, "water_splash", -15, 0.2, dur=1.2, size=0.7); e(RISE0 + 0.1, "low_swell", -20, 0.0, dur=0.7, pitch=0.6)
e(GRIN, "wood_snap", -24, 0.2, size=0.3)
for k in range(3): e(t['never'] + 0.1 + k * 0.45, "plush_squeak", -27, -0.2 + 0.2 * k, pitch=1.0 + 0.15 * k)   # nervous glances
e(PUSH, "flash_swish", -22, 0.0, dur=0.25, peak=0.5); e(PUSH + 0.05, "goose_honk", -22, 0.0, pitch=1.2, dur=0.25, angry=0.7)
e(SPLASH, "cartoon_splash", -15, 0.2, dur=1.4, size=0.5)
e(LUNGE, "water_splash", -17, 0.25, dur=1.0, size=0.6)
e(CHOMP, "wood_snap", -13, 0.2, size=0.6); e(CHOMP + 0.01, "knock", -16, 0.2, pitch=0.5)
e(ROCKET, "boing", -18, 0.1, pitch=0.9, dur=0.5); e(ROCKET + 0.05, "goose_honk", -18, 0.0, pitch=1.35, dur=0.4, angry=1.2)
e(KLAND, "giant_step", -17, -0.3, size=0.4); e(KLAND + 0.02, "blanket_rustle", -21, -0.3, dur=0.5, intensity=0.8)
# THE WRONG WAY
steps(t['always'], ICE_END, 4.2, -27, 0.2, -0.2)
e(TURN0 + 0.1, "plush_squeak", -26, 0.0, pitch=0.8)
# THE TEACHER (as 058)
steps(t['tAnd'] - 0.05, t['biology'] + 0.1, 5.0, -24, 0.5, 0.1)
e(SLAM - 0.15, "flash_swish", -19, -0.1, dur=0.2, peak=0.5); e(SLAM, "giant_step", -10, -0.1, size=0.9); e(SLAM + 0.01, "wood_snap", -16, -0.1, size=0.6)
e(SLAM + 0.05, "blanket_rustle", -20, -0.1, dur=0.6, intensity=0.9)
e(t['tf3'] - 0.05, "flash_swish", -21, 0.2, dur=0.25, peak=0.5)
e(STAMP, "knock", -12, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
# COOKED
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.05, "whimper", -19, 0.0, pitch=1.1, dur=0.4)
# SCRIBE (as 049/058)
e(LIDO0, "knock", -17, 0.2, pitch=1.1); e(LIDO1, "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 95], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < t['yourM'] - 0.1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
# MATCH
e(t['yourM'] + 0.05, "blanket_rustle", -21, 0.0, dur=0.3, intensity=0.7)
e(t['mf2'] - 0.05, "breath", -16, 0.0, dur=0.4, inhale=True)
e(t['plus'] - 0.02, "knock", -14, 0.3, pitch=1.0); e(t['plus'], "gold_chime", -13, 0.3, notes=[79, 84, 88, 91, 96], spacing=0.06, vel=0.5, shimmer=0.4, dur=1.6)
for k in range(8): e(t['plus'] + 0.05 + k * 0.05, "pop", -22 - (k % 3), -0.6 + 0.17 * k, pitch=1.2 + 0.1 * (k % 4))
# LAST + END CARD
steps(t['lAnd'], t['still'] - 0.05, 4.2, -26, 0.0, 0.0)
e(t['still'] + 0.05, "plush_squeak", -26, 0.0, pitch=0.7)
steps(t['wayL'] + 0.45, D - 0.5, 4.2, -29, 0.0, 0.0)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

def wind(a, b, gain, gust, seed, darkness=0.5):
    return {"sound": "wind", "t0": round(a, 3), "t1": round(b, 3), "fade_in": 0.05, "fade_out": 0.1, "gain_db": gain, "args": {"darkness": darkness, "gust": gust, "whistle": 0.12}, "seed": seed}
amb = [
    wind(0.0, t['step1'], -22, 0.9, 1, 0.35),                      # the blizzard
    wind(t['step1'], t['freeze'] - 0.06, -27, 0.5, 2),
    wind(t['freeze'] - 0.06, t['then'] - 0.04, -21, 0.9, 3, 0.35),
    wind(t['then'] - 0.04, t['step2'], -29, 0.4, 4),
    wind(t['step2'], N0, -30, 0.4, 5),
    wind(N0, t['no'] - 0.06, -21, 1.0, 6, 0.3),                      # the polar night
    wind(t['no'] - 0.06, t['step4'], -29, 0.4, 7),
    wind(t['step4'], t['always'] - 0.06, -33, 0.3, 8),
    {"sound": "surf", "t0": t['step4'], "t1": t['always'] - 0.06, "fade_in": 0.1, "fade_out": 0.15, "gain_db": -27, "args": {"size": 0.4}, "seed": 9},
    wind(t['always'] - 0.06, ICE_END, -27, 0.5, 10),
    {"sound": "room_tone", "t0": LIB0, "t1": t['lAnd'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 11},
    {"sound": "clock", "t0": t['youre'] - 0.06, "t1": t['so'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -30, "pan": 0.2, "seed": 12},
    {"sound": "applause", "t0": t['plus'] + 0.05, "t1": t['lAnd'] + 0.2, "fade_in": 0.1, "fade_out": 0.4, "gain_db": -26, "seed": 13},
    wind(t['lAnd'] - 0.04, D, -26, 0.6, 14),
]

cues = {
    "title": "063 - Scribe promo: how f*cking penguins f*cking survive f*cking Antarctica (the series' soft explainer bed 120 bpm + polar wind + gag foley + deadpan narrator)",
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
