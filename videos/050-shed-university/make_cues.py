#!/usr/bin/env python3
"""Cue sheet for 050 (Scribe promo, "I upgraded my backyard shed every day until it became a university") -> cues.json.
    python3 -I videos/050-shed-university/make_cues.py && python3 -I audio/synth.py 050-shed-university

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so re-voicing keeps every sound on
its picture. Sound identity: "QUAD BOUNCE" — a MINIMAL 140 bpm bed (user, Nov 8: "most of the background music's kind of ass"):
soft four-on-the-floor kick, claps on 2 + 4, light 16th hats, a quiet marimba arp over pluck chords, a pad underneath, all well
under the narrator; the foley carries the reel (hammer, desk clunk, marker squeak, trampoline boing, trash-can clang, the bell's
BONG, bricks + four column thunks, the gate + a stream of footsteps, the stadium crowd, the football bonk, the stamp, Scribe's
chime + scan beeps + pen scribble, the clock tower, a graduation roar + applause). Music enters on "Day one" (the hook is backyard
air + the hammer + a riser). Escalation G–D–Em–C, the inspector turns it tense (Em–C–Am–B), Scribe lifts it back, the payoff
resolves on G under the end card. out/nomusic.mp4 (voice + sfx + amb stems) is cut separately for a trending sound."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]


t = dict(
    univ=W('hook', 'university'), d1=W('day1', 'day'), desk=W('day1', 'desk'), board=W('day1', 'whiteboard'), student=W('day1', 'student'), me=W('day1', 'me'),
    d3=W('day3', 'day'), second=W('day3', 'second'), floor=W('day3', 'floor'), fire=W('day3', 'fire'), tramp=W('day3', 'trampoline'),
    d8=W('day8', 'day'), tower=W('day8', 'tower'), nbr=W('day8', 'neighbor'), loves=W('day8', 'loves'),
    d15=W('day15', 'day'), mascot=W('day15', 'mascot'), raccoon=W('day15', 'raccoon'), full=W('day15', 'full'), scholarship=W('day15', 'scholarship'),
    d30=W('day30', 'day'), bricks=W('day30', 'bricks'), columns=W('day30', 'columns'), colleges=W('day30', 'colleges'), columns2=W('day30', 'columns', 2),
    d45=W('day45', 'day'), students=W('day45', 'students'), i=W('day45', 'i'), invite=W('day45', 'invite'), my=W('day45', 'my'), mom=W('day45', 'mom'), dining=W('day45', 'dining'),
    d60=W('day60', 'day'), stadium=W('day60', 'stadium'), pool=W('day60', 'pool'), be=W('day60', 'be'),
    then=W('inspector', 'then'), every=W('inspector', 'every'), forty=W('inspector', 'forty'), handwritten=W('inspector', 'handwritten'), midnight=W('inspector', 'midnight'),
    including=W('inspector', 'including'), dean=W('inspector', 'dean'), im=W('inspector', 'im'), dean2=W('inspector', 'dean', 2),
    cooked=W('cooked', 'cooked'), so=W('cooked', 'so'), oneshot=W('cooked', 'oneshot'), scribe=W('cooked', 'scribe'),
    one=W('solve', 'one'), photo=W('solve', 'photo'), scribe2=W('solve', 'scribe'), forty2=W('solve', 'forty'),
    writes=W('hand', 'writes'), handwriting=W('hand', 'handwriting'), stroke=W('hand', 'stroke'), even=W('hand', 'even'), graph=W('hand', 'graph'),
    insp2=W('match', 'inspector'), holds=W('match', 'holds'), perfect=W('match', 'perfect'), match=W('match', 'match'), accredited=W('match', 'accredited'),
    d100=W('payoff', 'day'), ivy=W('payoff', 'ivy'), clock=W('payoff', 'clock'), ten=W('payoff', 'ten'), graduation=W('payoff', 'graduation'),
    raccoon2=W('last', 'raccoon'), top=W('last', 'top'), the3=W('last', 'the', 3), nbr3=W('last', 'neighbor'), back=W('last', 'back'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['back'] + 0.62
F2_UP, F2_LAND = t['second'] - 0.02, t['floor'] + 0.08
ROOF_LAND = F2_LAND + 0.12
JUMP0, TL = t['fire'] + 0.02, t['tramp'] + 0.1
CANL = TL + 0.5
BELL_LAND, BONGS = t['tower'] + 0.12, [t['nbr'] - 0.1, t['loves'] - 0.05, t['loves'] + 0.4]
LIDPOP, CHECK = t['mascot'] - 0.05, t['full'] - 0.15
BRICK0 = t['bricks'] - 0.04
COLS = [t['columns'] + 0.02 + k * 0.13 for k in range(4)]
COLL = 0.3
TOP0 = t['colleges'] - 0.1
CRUSH = COLS[3] + COLL
GATE0, STAD0, BONK = t['d45'] - 0.1, t['stadium'] - 0.04, t['be'] + 0.03
IVY0, TOWER0 = t['ivy'] - 0.05, t['clock'] - 0.15
TOWER1, CAPS = TOWER0 + 0.6, t['graduation'] + 0.05
LID0, LID1, FLASH = t['so'] - 0.02, t['so'] + 0.32, t['photo'] + 0.05
SOLVE0, SOLVE1 = t['scribe2'] + 0.1, t['forty2'] + 0.2
PEN0, WRITE0, WRITE1 = t['writes'] - 0.05, t['writes'] + 0.25, t['graph'] + 0.38

# ---------------------------------------------------------------- music: 140 bpm, minimal, G major
BPM = 140
BEAT = 60 / BPM
IN = t['d1'] - 0.02
TENSE0, LIFT0, END0 = t['then'], t['so'] - 0.05, t['d100']
chords, cur = [], IN
while cur < D - 1.0:
    if cur < TENSE0 - 0.5: seq = ['G', 'D', 'Em', 'C']
    elif cur < LIFT0 - 0.5: seq = ['Em', 'C', 'Am', 'B']
    elif cur < END0 - 0.5: seq = ['G', 'D', 'Em', 'C']
    elif cur < ENDCARD - 0.5: seq = ['C', 'D', 'G', 'Em']
    else: seq = ['C', 'D', 'G', 'G']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'G'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2,
             "vel": [[IN, 0.3], [t['d30'], 0.32], [TENSE0, 0.27], [LIFT0, 0.33], [END0, 0.35], [D, 0.32]],
             "bass_hold": 0.85, "stab_vel": 0.42, "stab_hold": 0.6}]
TRI = {'G': [62, 67, 71], 'D': [62, 66, 69], 'Em': [64, 67, 71], 'C': [64, 67, 72], 'Am': [64, 69, 72], 'B': [63, 66, 71]}
ARP = [0, 1, 2, 3, 2, 1, 0, 1]
mallet = []
for i, (ct, sym) in enumerate(chords[:-1]):
    nxt = chords[i + 1][0]; tri = TRI[sym]; tense = TENSE0 - 0.3 < ct < LIFT0 - 0.3
    k, step = 0, (BEAT if tense else BEAT / 2)
    while ct + k * step < nxt - 0.02:
        a = ARP[k % 8]; m = tri[a] if a < 3 else tri[0] + 12
        mallet.append([round(ct + k * step, 3), m, (0.15 if k % 2 == 0 else 0.11) * (0.8 if tense else 1.0), 0.15]); k += 1
for c in story['callouts']:                                  # a two-note lift on labels/money, a falling pair on stamps
    a = c['t0'] + 0.02
    if a < IN: continue
    if c['style'] in ('money', 'label', 'term'): mallet += [[round(a, 3), 74, 0.26, 0.14], [round(a + 0.09, 3), 79, 0.28, 0.26]]
    elif c['style'] == 'stamp': mallet += [[round(a, 3), 71, 0.26, 0.12], [round(a + 0.11, 3), 64, 0.26, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [31, 43, 50, 55, 59], "level": 0.55, "attack": 0.3, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": 0.0, "t1": IN + 0.25, "notes": [43, 50, 55, 59], "level": 1.0, "attack": 0.3, "release": 0.4, "cutoff": 750, "hp": 30}]   # a riser under the hook
booms = [IN, F2_LAND, CANL, BRICK0 + 0.1, TOP0 + 0.3, STAD0 + 0.1, t['handwritten'], t['cooked'], t['perfect'], t['accredited'], TOWER1, CAPS]
drums = [[round(b, 3), 0.4, "boom"] for b in booms]
PRE = IN - BEAT * int(IN / BEAT - 0.1)
drums += [[round(PRE + k * BEAT / 4, 3), 0.34 + 0.22 * k / max(1, (IN - PRE) / (BEAT / 4)), "tick"] for k in range(int((IN - PRE) / (BEAT / 4)))]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.22 + 0.08 * k, "tom"] for k in range(4)]
drums += [[round(PRE + k * BEAT, 3), 0.28 + 0.25 * k / max(1, (IN - PRE) / BEAT), "kick"] for k in range(int((IN - PRE) / BEAT))]   # a soft kick build under the hook (a quiet pre-roll trips the dropout check)
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.5], [TENSE0, 0.42], [LIFT0, 0.52], [END0, 0.55], [D, 0.5]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.34], [TENSE0, 0.28], [LIFT0, 0.36], [D, 0.36]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.75, 0.25], "vel": [[IN, 0.3], [TENSE0, 0.26], [LIFT0, 0.32], [D, 0.32]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": -6.0, "drums_db": -7.0, "instrument": "pluck",
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

# HOOK: the hammer, the sign slips
for k, tk in enumerate([0.12, 0.43, 0.74, 1.05]): e(tk, "knock", -13 - k, -0.3, pitch=0.75)
e(t['univ'] + 0.02, "wood_snap", -20, 0.1, size=0.3); e(t['univ'] + 0.05, "knock", -16, 0.1, pitch=1.3); e(t['univ'] + 0.15, "plush_squeak", -22, 0.1, pitch=0.7)
# DAY 1: desk drops, whiteboard pops, marker, hop, hand up
e(t['desk'] + 0.05, "clunk", -12, 0.2, size=0.6, metal=0.4)
e(t['board'] - 0.06, "pop", -14, -0.2, pitch=0.9)
e(t['board'] + 0.15, "chalk_write", -18, -0.2, dur=0.7, strokes=6)
e(t['student'] - 0.12, "flash_swish", -18, 0.1, dur=0.3, peak=0.5); e(t['student'] + 0.18, "mattress_sit", -18, 0.2)
e(t['me'] - 0.1, "plush_squeak", -16, 0.2, pitch=2.0); e(t['me'], "gold_chime", -20, 0.2, notes=[91, 95], spacing=0.06, vel=0.3)
# DAY 3: roof launches, floor lands, roof lands; the jump, BOING, the trash can
e(F2_UP, "whoomp", -18, 0.0, size=0.4); e(F2_LAND, "giant_step", -9, 0.0, size=1.0); e(F2_LAND + 0.02, "clunk", -12, 0.0, size=1.0, metal=0.0)
e(ROOF_LAND, "knock", -12, 0.0, pitch=0.6); e(ROOF_LAND + 0.02, "clunk", -16, 0.0, size=0.6, metal=0.0)
e(JUMP0, "whimper", -16, 0.1, pitch=1.7, dur=0.5)
e(TL, "boing", -9, 0.2, pitch=1.0); e(TL + 0.02, "flash_swish", -20, 0.2, dur=0.35, peak=0.6)
e(CANL, "metal_clang", -10, 0.4, size=0.7, pitch=1.6, dur=0.8); e(CANL + 0.01, "bonk", -12, 0.4)
e(CANL + 0.45, "metal_clang", -20, 0.6, size=0.4, pitch=2.2, dur=0.4)   # the lid lands
for k in range(4): e(CANL + 0.6 + k * 0.22, "knock", -24, 0.4, pitch=1.6)   # his feet kick the can
# DAY 8: the bell tower lands; BONG ×3; the neighbor's shutters
e(BELL_LAND - 0.3, "flash_swish", -18, 0.0, dur=0.35, peak=0.5); e(BELL_LAND, "giant_step", -12, 0.0, size=0.6); e(BELL_LAND + 0.02, "knock", -14, 0.0, pitch=0.7)
for k, b in enumerate(BONGS): e(b, "metal_clang", -8 - 2 * k, 0.0, size=2.2, pitch=1.15, dur=2.2)
e(t['nbr'] - 0.02, "knock", -14, 0.5, pitch=0.9); e(t['nbr'] + 0.06, "knock", -15, 0.6, pitch=1.0)   # shutters bang open
e(BONGS[1] + 0.08, "flash_swish", -20, 0.5, dur=0.3, peak=0.5)   # the toupee takes off
# DAY 15: the lid pops, the raccoon chitters, the check + confetti
e(LIDPOP, "pop", -12, 0.3, pitch=0.8); e(LIDPOP + 0.02, "metal_clang", -18, 0.3, size=0.4, pitch=2.0, dur=0.4)
for k in range(3): e(t['raccoon'] - 0.1 + k * 0.14, "hamster_squeak", -18, 0.2, pitch=0.7 + 0.08 * k)
e(CHECK, "blanket_rustle", -18, 0.4, dur=0.35, intensity=0.8); e(CHECK + 0.3, "gold_chime", -14, 0.3, notes=[79, 83, 86, 91], spacing=0.06, vel=0.45)
for k in range(6): e(CHECK + 0.3 + k * 0.05, "pop", -20 - (k % 3), -0.5 + 0.2 * k, pitch=1.3 + 0.1 * (k % 3))
# DAY 30: bricks, four columns, the gnome, the pediment
e(BRICK0, "crumble", -10, 0.0, dur=1.0, size=1.2); e(BRICK0 + 0.08, "giant_step", -8, 0.0, size=1.3); e(BRICK0 + 0.1, "distant_boom", -14, 0.0, size=0.6)
for k, c in enumerate(COLS): e(c - 0.15, "flash_swish", -22, -0.5 + 0.33 * k, dur=0.25, peak=0.5); e(c + COLL, "clunk", -9 - (k % 2), -0.5 + 0.33 * k, size=1.0, metal=0.0); e(c + COLL + 0.01, "giant_step", -13, -0.5 + 0.33 * k, size=0.7)
e(CRUSH + 0.01, "wood_snap", -14, 0.5, size=0.4); e(CRUSH + 0.05, "plush_squeak", -16, 0.5, pitch=0.6)
e(TOP0 + 0.3, "giant_step", -8, 0.0, size=1.2); e(TOP0 + 0.31, "clunk", -11, 0.0, size=1.2, metal=0.0)
e(t['columns2'], "gold_chime", -18, 0.0, notes=[79, 86], spacing=0.08, vel=0.35)
# DAY 45: the gate, a stream of feet, Mom's ladle
e(GATE0, "door_open", -15, -0.6, creak=0.8, pitch=1.2)
steps(GATE0 + 0.2, t['d60'] - 0.1, 18.0, -16, -0.5, 0.2)
for k in range(6): e(t['my'] + 0.05 + k * 0.2, "knock", -20 - (k % 2) * 2, -0.3, pitch=2.6)   # ladle on the pot
e(t['dining'] + 0.05, "slurp", -18, -0.3, dur=0.4)
e(t['i'] - 0.05, "whimper", -20, 0.0, pitch=1.0, dur=0.4)
# DAY 60: the stands pop up, the pool goes, the football, BONK
e(STAD0, "cartoon_splash", -14, 0.3, size=0.8)
for k in range(10): e(STAD0 + 0.05 + k * 0.04, "pop", -18 - (k % 3), 0.0 + 0.06 * k, pitch=0.8 + 0.06 * (k % 4))
e(BONK - 0.55, "flash_swish", -18, 0.6, dur=0.5, peak=0.5); e(BONK, "bonk", -7, 0.1); e(BONK + 0.02, "plush_squeak", -15, 0.1, pitch=0.8)
# DAY 61: the inspector's shoes, the stack, the stamp, the gasp, the clock, the turn, the dean's heartbeat
steps(t['then'] - 0.1, t['every'] - 0.15, 4.5, -18, 0.5, 0.0)
e(t['forty'] - 0.05, "blanket_rustle", -16, 0.0, dur=0.4, intensity=1.0); e(t['forty'], "giant_step", -16, 0.0, size=0.4)
e(t['handwritten'] - 0.02, "giant_step", -11, 0.0, size=0.6); e(t['handwritten'], "knock", -12, 0.0, pitch=0.7)
e(t['handwritten'] + 0.08, "breath", -14, 0.0, dur=0.5, inhale=True)
e(t['midnight'], "counter_tick", -14, 0.2, bright=0.8)
e(t['including'] + 0.05, "flash_swish", -16, 0.3, dur=0.45, peak=0.6)
for k in range(5): e(t['dean'] + 0.05 + k * 0.32, "heartbeat", -15 + min(k, 3), 0.0, size=0.8 + 0.05 * k)
# NIGHT: cooked, Scribe opens, photo, solve, the pen writes
e(t['cooked'], "hiss", -16, 0.0, dur=0.8); e(t['cooked'] + 0.02, "giant_step", -15, 0.0, size=0.5)
e(LID0, "knock", -16, 0.2, pitch=1.1); e(LID1, "gold_chime", -14, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 95], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < WRITE1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
e(t['graph'], "pen_scribble", -14, 0.0, dur=0.5)
# THE INSPECTOR'S OFFICE: rustle, darting eyes, PERFECT MATCH, ACCREDITED
e(t['holds'], "blanket_rustle", -21, 0.0, dur=0.3, intensity=0.7)
for k in range(3): e(t['holds'] + 0.3 + k * 0.27, "plush_squeak", -24, 0.0, pitch=1.6)
e(t['perfect'] - 0.02, "breath", -16, 0.0, dur=0.4, inhale=True)
e(t['perfect'] + 0.04, "giant_step", -13, 0.0, size=0.6); e(t['perfect'] + 0.05, "knock", -14, 0.0, pitch=0.7)
e(t['accredited'] + 0.03, "giant_step", -9, 0.0, size=0.9); e(t['accredited'] + 0.04, "knock", -11, 0.0, pitch=0.6); e(t['accredited'] + 0.1, "gold_chime", -14, 0.0, notes=[79, 83, 86, 91, 95], spacing=0.06, vel=0.5, shimmer=0.3)
# DAY 100: ivy, the clock tower rises + chimes, the roar, the caps
for k in range(8): e(IVY0 + k * 0.08, "blanket_rustle", -20, -0.6 + 0.17 * k, dur=0.3, intensity=0.9)
e(TOWER0, "crumble", -11, 0.0, dur=0.9, size=1.1); e(TOWER0 + 0.05, "distant_boom", -12, 0.0, size=0.7); e(TOWER1, "giant_step", -9, 0.0, size=1.2)
e(TOWER1 + 0.12, "metal_clang", -13, 0.0, size=2.6, pitch=1.0, dur=2.4)
e(CAPS - 0.05, "whoomp", -16, 0.0, size=0.6)
for k in range(14): e(CAPS + 0.02 + k * 0.035, "pop", -20 - (k % 3), -0.8 + 0.12 * k, pitch=1.0 + 0.1 * (k % 4))
e(t['top'] - 0.1, "gold_chime", -16, 0.0, notes=[86, 91, 95], spacing=0.06, vel=0.4)
for k in range(3): e(t['raccoon2'] + 0.05 + k * 0.13, "hamster_squeak", -20, 0.0, pitch=0.8 + 0.06 * k)
e(t['the3'] + 0.2, "whimper", -18, 0.0, pitch=0.55, dur=0.6)   # the neighbor grumbles
e(ENDCARD, "gold_chime", -14, 0.0, notes=[79, 83, 86, 91], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": t['d1'] + 0.1, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -28, "args": {"darkness": 0.3, "gust": 0.3, "whistle": 0.05}, "seed": 1},
    {"sound": "room_tone", "t0": t['d1'], "t1": t['d3'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 2},
    {"sound": "wind", "t0": t['d3'], "t1": t['d45'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -30, "args": {"darkness": 0.3, "gust": 0.3, "whistle": 0.05}, "seed": 3},
    {"sound": "kids_laugh", "t0": t['d15'], "t1": t['d30'] + 1.0, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -36, "args": {"density": 0.6}, "seed": 4},
    {"sound": "crowd_cheer", "t0": t['students'] - 0.4, "t1": t['d60'], "fade_in": 0.4, "fade_out": 0.2, "gain_db": -32, "args": {"excite": 0.25}, "seed": 5},
    {"sound": "crowd_cheer", "t0": STAD0, "t1": t['then'], "fade_in": 0.15, "fade_out": 0.2, "gain_db": -26, "args": {"excite": 0.8}, "seed": 6},
    {"sound": "crowd_cheer", "t0": t['then'], "t1": t['im'], "fade_in": 0.2, "fade_out": 0.3, "gain_db": -34, "args": {"excite": 0.2}, "seed": 7},
    {"sound": "room_tone", "t0": t['im'] + 0.6, "t1": t['insp2'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 8},
    {"sound": "clock", "t0": t['im'] + 0.6, "t1": t['insp2'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -36, "pan": 0.2, "seed": 9},
    {"sound": "crickets", "t0": t['im'] + 0.6, "t1": t['insp2'], "fade_in": 0.2, "fade_out": 0.1, "gain_db": -42, "seed": 10},
    {"sound": "room_tone", "t0": t['insp2'], "t1": t['d100'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 11},
    {"sound": "crowd_cheer", "t0": t['d100'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -30, "args": {"excite": 0.5}, "seed": 12},
    {"sound": "crowd_cheer", "t0": CAPS - 0.1, "t1": D, "fade_in": 0.15, "fade_out": 0.8, "gain_db": -24, "args": {"excite": 1.0}, "seed": 13},
    {"sound": "applause", "t0": CAPS + 0.3, "t1": D, "fade_in": 0.4, "fade_out": 0.8, "gain_db": -24, "seed": 14},
]

cues = {
    "title": "050 - Scribe promo: shed to university (QUAD BOUNCE, minimal 140 bpm pluck + marimba, foley-led + narrator)",
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
