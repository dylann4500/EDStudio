#!/usr/bin/env python3
"""Cue sheet for 051 (Scribe promo, "everyone in my town has a number above their head") -> cues.json.
    python3 -I videos/051-number-above-head/make_cues.py && python3 -I audio/synth.py 051-number-above-head

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so re-voicing keeps every sound on
its picture. Sound identity "NUMBER TOWN": the manager's Nov 8 steer (the user finds most of our background music bad) = a MINIMAL bed
— a soft C-major pad, a light marimba pulse in quarters, a quiet 140 bpm kick + hats (no clap, no busy pluck), music ≈ −24 LUFS under
a −16 voice — and the places + the numbers carry the sound: street murmur, a school hallway, a café, the train, a party crowd, room
tone, a big crowd cheer when the town hits zero. Every number change has its own sound (a tick up, a falling run of ticks into a
bright "zero" chime), the books slam, the pen scribbles, the paper avalanche thumps. out/nomusic.mp4 = voice + SFX + ambience only."""
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


t = dict(
    everyone=W('hook', 'everyone'), number=W('hook', 'number'), homework=W('hook', 'homework'),
    dog=W('dog', 'dog'), dzero=W('dog', 'zero'), ate=W('dog', 'ate'),
    pclass=W('pres', 'class'), pzero=W('pres', 'zero'), nobody=W('pres', 'nobody'), trusts=W('pres', 'trusts'),
    these=W('couple', 'these'), minute=W('couple', 'minute'), love=W('couple', 'love'), copying=W('couple', 'copying'),
    guy=W('subway', 'guy'), nine=W('subway', 'nine'), dropped=W('subway', 'dropped'), still=W('subway', 'still'), up=W('subway', 'up'),
    parties=W('party', 'parties'), yeah=W('party', 'yeah'), sixtyone=W('party', 'sixtyone'),
    teachers=W('lounge', 'teachers'), mister=W('lounge', 'mister'), four=W('lounge', 'four'),
    and_=W('tyler', 'and'), three=W('tyler', 'three'), finals=W('tyler', 'finals'), five=W('tyler', 'five'), eight=W('tyler', 'eight'),
    forty=W('obstacle', 'forty'), handwritten=W('obstacle', 'handwritten'), due=W('obstacle', 'due'),
    im=W('cooked', 'im'), cooked=W('cooked', 'cooked'), so=W('cooked', 'so'), opens=W('cooked', 'open'), scribe=W('cooked', 'scribe'),
    one=W('solve', 'one'), photo=W('solve', 'photo'), scribe2=W('solve', 'scribe'), forty2=W('solve', 'forty'),
    then=W('hand', 'then'), writes=W('hand', 'writes'), even=W('hand', 'even'), sevens=W('hand', 'sevens'),
    myN=W('zero', 'my'), drops=W('zero', 'drops'), zero=W('zero', 'zero'), whole=W('zero', 'whole'), turns=W('zero', 'turns'),
    rturns=W('reveal', 'turns'), rscribe=W('reveal', 'scribe'),
    by=W('spread', 'by'), town=W('spread', 'town'), z1=W('spread', 'zero', 1), z2=W('spread', 'zero', 2), z3=W('spread', 'zero', 3),
    except_=W('dawson', 'except'), now=W('dawson', 'now'), all=W('dawson', 'all'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = min(WE('dawson', 'it') + 0.3, D - 4.0)
SAM_BUZZ = t['homework'] - 0.05
BURP = t['ate'] + 0.1
TICKS = [t['still'] + 0.05, t['up'] + 0.05]
REVEAL = t['sixtyone'] - 0.08
BOOKS = [t['finals'] + 0.02, t['five'] + 0.02, t['eight'] + 0.02]
LID0, LID1, FLASH = t['opens'] - 0.05, t['opens'] + 0.3, t['photo'] + 0.05
SOLVE0, SOLVE1 = t['scribe2'] + 0.1, t['forty2'] + 0.2
PEN0, WRITE0, WRITE1 = t['then'] + 0.02, W('hand', 'writes') - 0.05, WE('hand', 'sevens') + 0.25
TURN0 = t['turns'] - 0.12
PILE0 = t['now'] - 0.05
PILE1 = max(t['all'] + 0.45, PILE0 + 0.8)
ZW = [t['z1'], t['z2'], t['z3']]

# ---------------------------------------------------------------- music: minimal "NUMBER TOWN" bed, 140 bpm, C major
BPM = 140
BEAT = 60 / BPM
IN = t['everyone'] - 0.05
LIB0, LIFT0, END0 = t['and_'], t['scribe'] - 0.1, t['by']
chords, cur = [], IN
while cur < D - 1.0:
    if cur < LIB0 - 0.5: seq = ['C', 'G', 'Am', 'F']
    elif cur < LIFT0 - 0.5: seq = ['Am', 'F', 'Dm', 'E']
    elif cur < ENDCARD - 0.5: seq = ['C', 'G', 'Am', 'F']
    else: seq = ['F', 'G', 'C', 'C']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
sections = [{"t0": IN, "t1": D, "style": "thin", "vel": [[IN, 0.22], [LIB0, 0.2], [LIFT0, 0.26], [D, 0.24]], "roll": 0.04}]
TRI = {'C': [64, 67, 72], 'G': [62, 67, 71], 'Am': [64, 69, 72], 'F': [65, 69, 72], 'Dm': [62, 65, 69], 'E': [64, 68, 71]}
mallet = []
for i, (ct, sym) in enumerate(chords[:-1]):        # a light marimba pulse: quarter notes on the chord tones (8ths after Scribe opens)
    nxt = chords[i + 1][0]; tri = TRI[sym]; step = BEAT / 2 if LIFT0 - 0.3 < ct < ENDCARD else BEAT; k = 0
    while ct + k * step < nxt - 0.02:
        m = [tri[0], tri[1], tri[2], tri[1]][k % 4]
        mallet.append([round(ct + k * step, 3), m, 0.16 if k % 2 == 0 else 0.12, 0.14]); k += 1
for zt in [t['dzero'], t['pzero'], t['zero']] + ZW:   # every "zero" lands on a bright two-note mallet lift
    mallet += [[round(zt + 0.02, 3), 79, 0.3, 0.14], [round(zt + 0.1, 3), 84, 0.32, 0.3]]
PADN = {'C': [36, 48, 55, 60, 64], 'G': [43, 55, 59, 62], 'Am': [45, 57, 60, 64], 'F': [41, 53, 57, 60], 'Dm': [38, 50, 57, 62, 65], 'E': [40, 52, 56, 59, 64]}
pad = [{"t0": 0.0, "t1": IN + 0.3, "notes": PADN['C'], "level": 0.5, "attack": 0.5, "release": 0.5, "cutoff": 800, "hp": 30}]   # a soft pre-roll under the first words
for i, (ct, sym) in enumerate(chords[:-1]):   # one soft pad per chord: a continuous bed (the staccato bits alone trip the dropout check)
    pad.append({"t0": ct, "t1": min(D - 0.2, chords[i + 1][0] + 0.25), "notes": PADN[sym], "level": 0.75, "attack": 0.25, "release": 0.5, "cutoff": 900, "hp": 30})
drums = [[round(b, 3), 0.4, "boom"] for b in [BOOKS[0], t['zero'], t['all'] + 0.05]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.32], [LIB0, 0.26], [LIFT0, 0.36], [ENDCARD, 0.3], [D, 0.28]], "kind": "kick"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.35, 0.18, 0.6, 0.2], "vel": [[IN, 0.26], [LIB0, 0.22], [LIFT0, 0.3], [D, 0.26]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -7.0, "instrument": "pluck",
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
def tick_up(tt, gain=-18, pan=0.0, pitch=1.0): e(tt, "counter_tick", gain, pan, bright=0.7 * pitch)
def zero_chime(tt, gain=-14, pan=0.0): e(tt, "gold_chime", gain, pan, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)

# HOOK: a street full of numbers; Sam's phone buzzes, his number ticks up
steps(0.0, t['dog'] - 0.1, 7.0, -26, -0.2, 0.2)
for k in range(5): e(t['number'] + 0.05 + k * 0.09, "pop", -24 - (k % 2), -0.5 + 0.25 * k, pitch=1.3 + 0.1 * k)   # the numbers "on"
e(SAM_BUZZ, "alarm_beep", -24, 0.2, dur=0.25); e(SAM_BUZZ + 0.05, "counter_tick", -15, 0.0, bright=0.9)
e(SAM_BUZZ + 0.3, "whimper", -22, 0.0, pitch=0.9, dur=0.35)
# DOG at zero, the burp of paper
zero_chime(t['dzero'] + 0.02, -17)
e(BURP, "toot", -18, 0.0, size=0.25); e(BURP + 0.03, "blanket_rustle", -20, 0.0, dur=0.4, intensity=0.8)
e(BURP + 0.4, "dog_bark", -22, 0.0)
# HALLWAY: the president's zero; the side-eye
steps(t['pclass'], t['nobody'] + 0.8, 4.5, -22, 0.0, 0.0)
zero_chime(t['pzero'] + 0.02, -16)
e(t['nobody'], "low_swell", -20, 0.0, dur=0.9, pitch=0.7); e(t['trusts'], "plush_squeak", -22, 0.3, pitch=0.8)
# CAFÉ: the matching clocks tick together, the copy
e(t['minute'] + 0.02, "counter_tick", -16, -0.3, bright=0.8); e(t['minute'] + 0.03, "counter_tick", -16, 0.3, bright=0.8)
e(t['copying'] - 0.15, "plush_squeak", -22, 0.2, pitch=1.6)
e(t['copying'] - 0.05, "blanket_rustle", -18, 0.0, dur=0.35, intensity=0.9)   # the notebook slides over
e(t['copying'], "giant_step", -16, 0.0, size=0.4); e(t['copying'] + 0.02, "knock", -16, 0.0, pitch=0.7)   # the stamp
# SUBWAY: 9,000 and still going up
e(t['nine'], "low_swell", -20, 0.0, dur=0.9, pitch=0.6)
for tk in TICKS: tick_up(tk, -15)
e(t['dropped'] + 0.1, "breath", -22, 0.0, dur=0.5, inhale=False)
# PARTY: the liar
e(REVEAL, "low_swell", -18, 0.2, dur=0.6, pitch=1.4); e(REVEAL + 0.05, "giant_step", -16, 0.2, size=0.4); e(REVEAL + 0.05, "knock", -16, 0.2, pitch=0.8)
# LOUNGE: the grading number
e(t['four'], "counter_tick", -16, 0.0, bright=0.6); e(t['mister'] + 0.3, "slurp", -22, 0.0, dur=0.4)
# LIBRARY: 312, finals, the books, the climb
e(t['three'], "counter_tick", -18, 0.0, bright=0.6)
for k, bt in enumerate(BOOKS):
    for j in range(3): e(bt + j * 0.05, "giant_step", -13 - 2 * j, -0.3 if k == 1 else 0.3, size=0.45)
    e(bt + 0.02, "knock", -15, 0.0, pitch=0.6)
    for j in range(5): tick_up(bt + 0.04 + j * 0.06, -21, 0.0, 1.0 + 0.1 * j)
e(t['finals'] - 0.02, "distant_boom", -13, 0.0, size=0.8)
e(t['handwritten'] - 0.02, "giant_step", -15, 0.0, size=0.5); e(t['handwritten'], "knock", -16, 0.0, pitch=0.7)
e(t['due'], "counter_tick", -16, 0.2, bright=0.8)
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.02, "giant_step", -15, 0.0, size=0.5)
e(LID0, "knock", -16, 0.2, pitch=1.1); e(LID1, "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)   # Scribe opens
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 95], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < WRITE1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
# ZERO: a falling run of ticks into the big zero, the room turns around
n_run = 14
for j in range(n_run):
    u = j / n_run; tt = t['drops'] + (t['zero'] - t['drops']) * (1 - (1 - u) ** 0.5)   # accelerating (the roll is ease-in)
    tick_up(tt, -20 + 4 * u, 0.0, 1.4 - 0.6 * u)
e(t['zero'], "distant_boom", -11, 0.0, size=1.0); zero_chime(t['zero'] + 0.02, -11)
e(t['zero'] + 0.03, "pop", -14, 0.0, pitch=0.8); e(t['zero'] + 0.05, "candy_rattle", -20, 0.0, dur=0.8, density=20.0, size=0.5)   # confetti
e(TURN0 + 0.1, "breath", -16, 0.0, dur=0.5, inhale=True)
for j in range(6): e(TURN0 + 0.05 + j * 0.06, "floorboard_creak", -24, -0.5 + 0.2 * j)
# REVEAL: the president's laptop
e(t['rturns'], "low_swell", -20, 0.0, dur=0.8, pitch=1.2); e(t['rscribe'], "gold_chime", -16, -0.2, notes=[88, 91], spacing=0.08, vel=0.4)
# SPREAD: three waves of zeros
for k, zt in enumerate(ZW):
    for j in range(5): e(zt + j * 0.05, "pop", -18 - (j % 2), -0.6 + 0.3 * j + 0.1 * k, pitch=1.1 + 0.15 * k + 0.05 * j)
    zero_chime(zt + 0.03, -16 + 2 * k, -0.3 + 0.3 * k)
# DAWSON: the avalanche + his number explodes
e(t['except_'], "low_swell", -20, 0.0, dur=0.8, pitch=0.6)
for j in range(14):
    tt = PILE0 + (PILE1 - PILE0) * j / 13
    e(tt, "giant_step", -17 - (j % 3), -0.4 + 0.06 * j, size=0.35 + 0.02 * j); e(tt + 0.01, "blanket_rustle", -24, 0.0, dur=0.25, intensity=0.7)
    tick_up(tt + 0.02, -21, 0.0, 1.0 + 0.04 * j)
e(t['all'] + 0.05, "giant_step", -10, 0.0, size=1.0); e(t['all'] + 0.06, "crumble", -16, 0.0, dur=0.8, size=0.6)
e(t['all'] + 0.15, "whimper", -16, 0.0, pitch=0.8, dur=0.6)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

S = {b: (B[b]['t0'], B[b]['t1']) for b in story['order']}
amb = [
    {"sound": "city_day", "t0": 0.0, "t1": S['dog'][1], "fade_in": 0.05, "fade_out": 0.2, "gain_db": -27, "seed": 1},
    {"sound": "crowd_cheer", "t0": 0.0, "t1": S['dog'][1], "fade_in": 0.05, "fade_out": 0.2, "gain_db": -33, "args": {"excite": 0.1}, "seed": 2},
    {"sound": "room_tone", "t0": S['pres'][0], "t1": S['pres'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 3},
    {"sound": "kids_laugh", "t0": S['pres'][0], "t1": S['pres'][1], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 4},
    {"sound": "room_tone", "t0": S['couple'][0], "t1": S['couple'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 5},
    {"sound": "crowd_cheer", "t0": S['couple'][0], "t1": S['couple'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -36, "args": {"excite": 0.05}, "seed": 6},
    {"sound": "train", "t0": S['subway'][0], "t1": S['subway'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -26, "seed": 7},
    {"sound": "crowd_cheer", "t0": S['party'][0], "t1": S['party'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"excite": 0.45}, "seed": 8},
    {"sound": "room_tone", "t0": S['lounge'][0], "t1": S['lounge'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -32, "seed": 9},
    {"sound": "clock", "t0": S['lounge'][0], "t1": S['lounge'][1], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -38, "pan": -0.2, "seed": 10},
    {"sound": "room_tone", "t0": S['tyler'][0], "t1": S['zero'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -33, "seed": 11},
    {"sound": "clock", "t0": S['tyler'][0], "t1": S['zero'][1], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -36, "pan": 0.2, "seed": 12},
    {"sound": "kids_laugh", "t0": S['reveal'][0], "t1": S['reveal'][1], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 13},
    {"sound": "city_day", "t0": S['spread'][0], "t1": S['spread'][1], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -28, "seed": 14},
    {"sound": "crowd_cheer", "t0": S['spread'][0], "t1": S['spread'][1] + 0.3, "fade_in": 0.1, "fade_out": 0.4, "gain_db": -29, "args": {"excite": 0.7}, "seed": 15},
    {"sound": "applause", "t0": t['z1'], "t1": S['spread'][1] + 0.3, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -26, "seed": 16},
    {"sound": "room_tone", "t0": S['dawson'][0], "t1": D, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -32, "seed": 17},
]

cues = {
    "title": "051 - Scribe promo: everyone has a number above their head (NUMBER TOWN: minimal 140 bpm bed, place ambiences + number foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -9.5, "sfx": 3.5, "amb": 8.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
