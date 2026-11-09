#!/usr/bin/env python3
"""Cue sheet for 049 (Scribe promo, "No Nut November" battle royale) -> cues.json.   python3 -I videos/049-scribe-promo/make_cues.py

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so re-voicing keeps every sound on
its picture. Then: python3 -I audio/synth.py 049-scribe-promo

Sound identity: "LOBBY RUSH" (v2, 140 bpm; v1 was a 120 bpm "LOBBY FUNK" the user found slow): synth.py disco pluck (octave bass in 8ths +
off-beat stabs) in E minor at 140 bpm, a four-on-the-floor kick, claps on 2 + 4, 16th hats, tom fills, a marimba arp, an E pad. The hook is the
plane's cabin hum + skydive wind over a hat/kick build; the full groove drops on "No Nut November" with a boom. The library turns the chords tense
(Em–C–Am–B), Scribe opening lifts them to G–D–Em–C, the ending goes back to the lobby loop and resolves on G under the end card.
Foley on every gag (bonks, chute pops, the kill-feed ding, wifi chirps, the crate, a heavenly chime on the cantaloupes, the gull,
camera shutter, solve beeps, pen scribble, stamps, the door, the spotlight clunk, a heartbeat on "nothing to do with his hands") and
the blimp crowd's applause under the end card. The narrator sits on top: music ducks ~9 dB under every phrase. All soft + low-passed."""
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
    hundred=W('hook', 'hundred'), jump=W('hook', 'jump'), plane=W('hook', 'plane'), no=W('hook', 'no'), last=W('hook', 'last'), wins=W('hook', 'wins'),
    seven=W('orchard', 'seven'), bold=W('orchard', 'bold'), stupid=W('orchard', 'stupid'), gone=W('orchard', 'gone'),
    day4=W('wifi', 'day'), wifi=W('wifi', 'wifi'), thirty=W('wifi', 'thirty'), go=W('wifi', 'go'),
    day15=W('drop', 'day'), dropW=W('drop', 'drop'), twenty=W('drop', 'twenty'), rip=W('drop', 'rip'), open=W('drop', 'open'), two=W('drop', 'two'), cantaloupes=W('drop', 'cantaloupes'), survives=W('drop', 'survives'),
    everyone=W('blimp', 'everyone'), blimpW=W('blimp', 'blimp'), watch=W('blimp', 'watch'), judge=W('blimp', 'judge'),
    day29=W('seagull', 'day'), trevor=W('seagull', 'trevor'), libraryS=W('seagull', 'library'), seagull=W('seagull', 'seagull'), winks=W('seagull', 'winks'), out=W('seagull', 'out'),
    lastM=W('twist', 'last'), playing=W('twist', 'playing'),
    tyler=W('library', 'tyler'), halloween=W('library', 'halloween'), forty=W('library', 'forty'), handwritten=W('library', 'handwritten'), due=W('library', 'due'), midnight=W('library', 'midnight'), hes=W('library', 'hes'),
    cooked=W('cooked', 'cooked'), so=W('cooked', 'so'), opens=W('cooked', 'opens'), scribe=W('cooked', 'scribe'),
    one=W('solve', 'one'), photo=W('solve', 'photo'), scribe2=W('solve', 'scribe'), solves=W('solve', 'solves'), forty2=W('solve', 'forty'),
    but=W('hand', 'but'), soH=W('hand', 'so'), writes=W('hand', 'writes'), chicken=W('hand', 'chicken'), messy=W('hand', 'messy'), sevens=W('hand', 'sevens'), even=W('hand', 'even'), graphs=W('hand', 'graphs'),
    professor=W('match', 'professor'), holds=W('match', 'holds'), homework=W('match', 'homework'), perfect=W('match', 'perfect'), match=W('match', 'match'),
    oneShot=W('done', 'one'), shot=W('done', 'shot'), done=W('done', 'done'), eleven=W('done', 'eleven'),
    tylerW=W('walk', 'tyler'), walks=W('walk', 'walks'), outside=W('walk', 'outside'), ninetynine=W('walk', 'ninetynine'), staring=W('walk', 'staring'), he=W('walk', 'he'), minutes=W('walk', 'minutes'), nothing=W('walk', 'nothing'), hands=W('walk', 'hands'),
    zero=W('zero', 'zero'), alive=W('zero', 'alive'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['alive'] + 0.75
LANDT = [5.32, 5.45, 5.58, 5.25, 5.66, 5.4]; CHL = t['bold'] - 0.22; BONK = t['stupid'] + 0.02; BONK2 = [t['stupid'] + 0.16, t['stupid'] + 0.36]; GONE = t['gone'] - 0.05
ARC = t['wifi']; RUN0 = t['thirty'] - 0.05; RUN1 = t['go'] - 0.02; BEAM0 = t['go'] + 0.04
LANDC = t['dropW'] + 0.02; BURST = t['open'] - 0.03; BEAMS5 = t['survives'] - 0.06
JUDGE = t['judge'] + 0.02
GULL0, GULL1, WINK, TOUT = t['seagull'] - 0.35, t['seagull'] + 0.12, t['winks'] + 0.05, t['out'] - 0.05
LID0, LID1, FLASH = t['opens'] - 0.05, t['opens'] + 0.3, t['photo'] + 0.05
SCAN0 = FLASH + 0.15; SOLVE0, SOLVE1 = t['scribe2'] + 0.1, t['forty2'] + 0.2
PEN0, WRITE0, WRITE1 = t['soH'] + 0.05, t['writes'] - 0.05, t['graphs'] + 0.45
DOOR0, WALK1, SPOT_ON, ZAP = t['walks'] - 0.1, t['outside'] + 0.45, t['staring'] - 0.25, t['zero'] + 0.04
FEED = [BONK + 0.05, BONK2[0] + 0.06, BONK2[1] + 0.1, GONE + 0.05, BEAM0 + 0.02, BEAM0 + 0.3, BEAM0 + 0.55, BEAM0 + 0.8, BEAMS5 + 0.05, BEAMS5 + 0.3, BEAMS5 + 0.55,
        t['everyone'] + 0.25, t['everyone'] + 0.65, t['blimpW'] + 0.1, t['watch'] + 0.05, t['judge'] - 0.1, t['judge'] + 0.3, TOUT + 0.05]

# ---------------------------------------------------------------- music: 140 bpm "LOBBY RUSH", E minor (pluck disco + marimba arp + driving drums)
# v2 (user, Nov 8: "more upbeat, faster percussive music… it feels a little bit slow"): 120 → 140 bpm, four-on-the-floor kick, claps on
# 2 + 4, 16th-note felt hats (tick), a tom fill every 4 bars, a bouncing 8th-note marimba arp over the chords; the drums start under
# the hook (hats + a building kick) and the full groove drops on "No Nut November".
BPM = 140
BEAT = 60 / BPM
IN = t['no'] - 0.02
LIB0, LIFT0, END0 = t['tyler'], t['scribe'] - 0.1, t['tylerW']
chords, cur, cyc = [], IN, 0
while cur < D - 1.0:
    if cur < LIB0 - 0.5: seq = ['Em', 'C', 'G', 'D'] if cyc % 2 == 0 else ['Em', 'C', 'Am', 'B']
    elif cur < LIFT0 - 0.5: seq = ['Em', 'C', 'Am', 'B']
    elif cur < END0 - 0.5: seq = ['G', 'D', 'Em', 'C']
    elif cur < ENDCARD - 0.5: seq = ['Em', 'C', 'Am', 'B']
    else: seq = ['C', 'D', 'G', 'G']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'G'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2,
             "vel": [[IN, 0.36], [t['seven'], 0.37], [t['everyone'], 0.39], [LIB0, 0.34], [LIFT0, 0.4], [t['professor'], 0.39], [END0, 0.35], [t['nothing'], 0.33], [ZAP, 0.4], [D, 0.36]],
             "bass_hold": 0.9, "stab_vel": 0.55, "stab_hold": 0.7}]
mallet = []
for c in story['callouts']:                                  # rising "ta-da" on TERM callouts, a two-note lift on labels, a falling pair on stamps
    a = c['t0'] + 0.02
    if a < IN: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 76, 0.36, 0.16], [round(a + 0.08, 3), 79, 0.36, 0.16], [round(a + 0.16, 3), 83, 0.4, 0.36]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 71, 0.3, 0.14], [round(a + 0.09, 3), 76, 0.32, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 71, 0.3, 0.12], [round(a + 0.11, 3), 64, 0.3, 0.26]]
# the bouncing marimba arp: 8ths on the chord tones (up-down with an octave kick on the 4th step); sparser 4ths in the tense library
TRI = {'Em': [64, 67, 71], 'C': [64, 67, 72], 'G': [62, 67, 71], 'D': [62, 66, 69], 'Am': [64, 69, 72], 'B': [63, 66, 71]}
ARP = [0, 1, 2, 3, 2, 1, 0, 1]
for i, (ct, sym) in enumerate(chords[:-1]):
    nxt = chords[i + 1][0]; tri = TRI[sym]; tense = LIB0 - 0.3 < ct < LIFT0 - 0.3
    k, step = 0, (BEAT if tense else BEAT / 2)
    while ct + k * step < nxt - 0.02:
        a = ARP[k % 8]; m = tri[a] if a < 3 else tri[0] + 12
        mallet.append([round(ct + k * step, 3), m, (0.2 if k % 2 == 0 else 0.15) * (0.8 if tense else 1.0), 0.16]); k += 1
pad = [{"t0": IN, "t1": D - 0.2, "notes": [28, 40, 47, 52, 55], "level": 0.5, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}, {"t0": 0.3, "t1": IN + 0.2, "notes": [40, 47, 52], "level": 0.4, "attack": 1.4, "release": 0.4, "cutoff": 700, "hp": 30}]   # a riser under the hook's hat build (keeps the bed continuous)
booms = [IN, BONK, BEAM0, BURST, BEAMS5, TOUT, t['cooked'], t['perfect'], SPOT_ON, ZAP]
drums = [[round(b, 3), 0.45, "boom"] for b in booms]
PRE = IN - BEAT * int(IN / BEAT - 0.1)               # the hook's pre-roll starts on the same grid as the drop
drums += [[round(PRE + k * BEAT / 4, 3), 0.3 + 0.4 * k / max(1, (IN - PRE) / (BEAT / 4)), "tick"] for k in range(int((IN - PRE) / (BEAT / 4)))]   # a hat build
drums += [[round(PRE + k * BEAT, 3), 0.25 + 0.35 * k / max(1, (IN - PRE) / BEAT), "kick"] for k in range(int((IN - PRE) / BEAT))]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.25 + 0.1 * k, "tom"] for k in range(4)]   # the fill into the drop
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.6], [LIB0, 0.5], [LIFT0, 0.62], [END0, 0.52], [ZAP, 0.62], [D, 0.55]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.42], [LIB0, 0.34], [LIFT0, 0.44], [D, 0.42]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.45, 0.25, 0.85, 0.3], "vel": [[IN, 0.4], [LIB0, 0.34], [LIFT0, 0.42], [D, 0.4]], "kind": "tick"},
                 {"t0": IN + 15 * BEAT, "t1": END_D, "step": BEAT / 4, "pattern": [0] * 60 + [0.8, 0.9, 1.0, 1.1], "vel": 0.3, "kind": "tom"}]   # a 4-sixteenth tom fill closing every 4 bars
music = {"gain_db": 0.5, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": -2.0, "drums_db": -4.0, "instrument": "pluck",
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
def ding(tt, k=0): e(tt, "gold_chime", -21, 0.5, notes=[88 if k % 2 else 91], spacing=0.05, vel=0.3, dur=0.6)   # the kill feed
def beam(tt, gain=-16, pan=0.0): e(tt, "zap", gain - 6, pan, dur=0.35); e(tt + 0.02, "low_swell", gain, pan, dur=0.8, pitch=1.8); e(tt + 0.1, "flash_swish", gain - 2, pan, dur=0.5, peak=0.6)
def bonk(tt, pan=0.0, big=1.0): e(tt, "bonk", -10 + 2 * (big - 1), pan); e(tt + 0.02, "plush_squeak", -15, pan, pitch=0.8); e(tt + 0.05, "giant_step", -18, pan, size=0.5 * big)

# HOOK: the plane, the jump, the chutes
for k in range(7): e(0.45 + k * 0.17, "flash_swish", -22, -0.4 + 0.12 * k, dur=0.3, peak=0.5)
e(t['jump'], "whimper", -22, -0.3, pitch=1.5, dur=0.35)
for k in range(9): tk = t['no'] + 0.08 + k * 0.065; e(tk, "pop", -15 - (k % 3), -0.6 + 0.15 * k, pitch=0.7 + 0.08 * (k % 4)); e(tk + 0.02, "blanket_rustle", -24, -0.5 + 0.12 * k, dur=0.4, intensity=0.8)
e(t['last'] - 0.05, "low_swell", -20, 0.0, dur=1.2, pitch=1.2)
# ORCHARD
for k, lt in enumerate(LANDT): e(lt, "giant_step", -22, -0.5 + 0.2 * k, size=0.4); e(lt + 0.02, "blanket_rustle", -25, -0.5 + 0.2 * k, dur=0.4, intensity=0.6)
e(CHL, "giant_step", -15, 0.0, size=0.6); e(CHL + 0.05, "pop", -18, 0.0, pitch=0.9)
e(t['bold'] + 0.05, "plush_squeak", -18, 0.0, pitch=1.6)
e(BONK - 0.3, "flash_swish", -18, 0.1, dur=0.3, peak=0.5); bonk(BONK, 0.0, 1.4); e(BONK + 0.1, "candy_rattle", -18, 0.2, dur=0.5, density=20.0, size=0.6)
bonk(BONK2[0], -0.5, 0.9); bonk(BONK2[1], 0.5, 0.9)
beam(GONE, -14)
# WIFI
steps(t['day4'], t['wifi'] - 0.15, 7.0, -24, 0.3, 0.0)
for k in range(4): e(ARC + k * 0.07, "scan_beep", -18, 0.1, pitch=1.2 + 0.25 * k, dur=0.12)
e(ARC + 0.3, "gold_chime", -17, 0.1, notes=[84, 88, 91], spacing=0.06, vel=0.4)
steps(RUN0, RUN1 + 0.25, 16.0, -15, -0.6, 0.6)
e(RUN0 + 0.05, "whimper", -24, -0.4, pitch=1.3, dur=0.3)
for k in range(8): beam(BEAM0 + k * 0.12, -19, -0.6 + 0.17 * k)
# DROP
e(t['day15'] - 0.2, "hiss", -24, 0.0, dur=LANDC - t['day15'] + 0.2)
e(t['day15'], "blanket_rustle", -21, 0.0, dur=LANDC - t['day15'], intensity=0.8)
e(LANDC, "giant_step", -9, 0.0, size=1.2); e(LANDC + 0.02, "crumble", -16, 0.0, dur=0.7, size=0.7); e(LANDC + 0.05, "wood_snap", -20, 0.0, size=0.5)
steps(t['twenty'] - 0.1, t['twenty'] + 0.55, 16.0, -15, 0.6, -0.6)
e(t['rip'], "grate", -16, 0.0, dur=0.25)
e(BURST, "wood_snap", -9, 0.0, size=1.2); e(BURST + 0.02, "crumble", -14, 0.0, dur=0.8, size=0.8); e(BURST + 0.04, "clunk", -16, 0.0, size=0.8, metal=0.0)
for k in range(4): e(BURST + 0.6 + k * 0.12, "knock", -20, -0.6 + 0.4 * k, pitch=0.8)   # planks landing
e(t['cantaloupes'] - 0.1, "gold_chime", -13, 0.0, notes=[79, 83, 86, 91, 95], spacing=0.07, vel=0.5, shimmer=0.4, dur=2.4)
e(t['cantaloupes'] - 0.1, "low_swell", -18, 0.0, dur=1.2, pitch=1.6)
beam(BEAMS5, -12); e(BEAMS5, "distant_boom", -14, 0.0, size=0.7)
# BLIMP
for k in range(4): e(t['everyone'] + 0.1 + k * 0.15, "flash_swish", -22, -0.4 + 0.25 * k, dur=0.4, peak=0.5)
e(t['blimpW'], "pop", -16, 0.0, pitch=0.7)
for k in range(8): e(JUDGE + k * 0.04, "pop", -18 - (k % 3), -0.7 + 0.2 * k, pitch=1.2 + 0.1 * (k % 4))
e(JUDGE + 0.05, "knock", -18, 0.0, pitch=1.5)
# DUSK: the gull, the wink, Trevor
e(GULL0, "wing_flutter", -18, 0.6, dur=0.6, n_birds=1); e(GULL1, "knock", -20, 0.4, pitch=1.4)
e(GULL1 + 0.15, "goose_honk", -18, 0.4, pitch=1.9, dur=0.16, angry=0.3)
e(WINK, "gold_chime", -16, 0.3, notes=[96], spacing=0.05, vel=0.45, dur=0.8); e(WINK + 0.02, "plush_squeak", -18, 0.3, pitch=2.2)
e(WINK + 0.25, "whimper", -18, -0.2, pitch=1.3, dur=0.4); e(WINK + 0.15, "heartbeat", -18, -0.1, size=0.6)
beam(TOUT, -13, -0.2)
# THE TWIST + LIBRARY
e(t['lastM'] - 0.05, "low_swell", -20, 0.0, dur=1.6, pitch=0.8)
e(t['halloween'] - 0.05, "slurp", -18, -0.4, dur=0.35)
e(t['handwritten'] - 0.02, "giant_step", -15, 0.0, size=0.5); e(t['handwritten'], "knock", -16, 0.0, pitch=0.7)   # the stamp
e(t['due'], "counter_tick", -16, 0.2, bright=0.8)
e(t['hes'] - 0.1, "pen_scribble", -18, -0.2, dur=0.7)
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.02, "giant_step", -15, 0.0, size=0.5)
e(LID0, "knock", -16, 0.2, pitch=1.1); e(LID1, "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)   # Scribe opens
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(12): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
e(t['but'], "whimper", -20, 0.0, pitch=1.1, dur=0.35)
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 95], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < WRITE1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
e(t['graphs'], "pen_scribble", -14, 0.0, dur=0.5)
for k in range(5): e(t['graphs'] + 0.05 + k * 0.08, "blanket_rustle", -22, 0.4, dur=0.15, intensity=0.6)   # pages to the stack
# PROFESSOR
e(t['holds'], "blanket_rustle", -21, 0.0, dur=0.3, intensity=0.7)
for k in range(3): e(t['holds'] + 0.3 + k * 0.27, "plush_squeak", -24, 0.0, pitch=1.6)   # eyes darting
e(t['perfect'] - 0.02, "breath", -16, 0.0, dur=0.4, inhale=True)
e(t['perfect'] + 0.04, "giant_step", -13, 0.0, size=0.6); e(t['perfect'] + 0.05, "knock", -14, 0.0, pitch=0.7)
e(t['match'] + 0.22, "knock", -14, 0.3, pitch=1.0); e(t['match'] + 0.25, "gold_chime", -16, 0.3, notes=[86, 91], spacing=0.07, vel=0.4)
# DONE
e(t['shot'] + 0.05, "clunk", -14, 0.2, size=0.5, metal=0.6); e(t['done'], "knock", -14, 0.4, pitch=0.6); e(t['done'] + 0.05, "giant_step", -20, 0.4, size=0.4)
e(t['eleven'], "counter_tick", -13, 0.0, bright=1.0, gold=True); e(t['eleven'] + 0.05, "gold_chime", -18, 0.0, notes=[88, 91], spacing=0.08, vel=0.35)
# WALK + STARE + HANDS
e(DOOR0, "door_open", -14, 0.0, creak=1.0, pitch=0.9)
steps(DOOR0 + 0.1, WALK1, 4.0, -20, 0.0, 0.0)
e(WALK1 + 0.05, "whimper", -20, 0.0, pitch=0.6, dur=0.6)   # the stretch-yawn
e(SPOT_ON, "clunk", -9, 0.0, size=1.2, metal=0.8); e(SPOT_ON + 0.05, "low_swell", -16, 0.0, dur=1.0, pitch=0.9)
for k in range(8): e(t['he'] + 0.1 + k * 0.33, "heartbeat", -15 + min(k, 4), 0.0, size=0.8 + 0.05 * k)
e(t['nothing'] + 0.2, "plush_squeak", -22, 0.0, pitch=1.4); e(t['nothing'] + 0.55, "plush_squeak", -22, 0.0, pitch=1.2)
# ZERO
beam(ZAP, -10); e(ZAP, "distant_boom", -10, 0.0, size=1.0); e(ZAP + 0.1, "whimper", -16, 0.0, pitch=1.6, dur=0.5)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[79, 83, 86, 91], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)
for k, ft in enumerate(FEED): ding(ft, k)

amb = [
    {"sound": "cabin_hum", "t0": 0.0, "t1": 2.1, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -24, "seed": 1},
    {"sound": "wind", "t0": 0.3, "t1": t['seven'], "fade_in": 0.4, "fade_out": 0.3, "gain_db": -24, "args": {"darkness": 0.4, "gust": 0.7, "whistle": 0.1}, "seed": 2},
    {"sound": "crowd_cheer", "t0": RUN0, "t1": BEAM0 + 0.9, "fade_in": 0.1, "fade_out": 0.4, "gain_db": -30, "args": {"excite": 0.5}, "seed": 3},
    {"sound": "crowd_cheer", "t0": t['twenty'] - 0.1, "t1": BEAMS5 + 0.3, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -31, "args": {"excite": 0.4}, "seed": 4},
    {"sound": "fan", "t0": t['everyone'], "t1": t['day29'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -32, "args": {"rate": 8.0}, "seed": 5},
    {"sound": "crowd_cheer", "t0": t['everyone'], "t1": t['day29'], "fade_in": 0.3, "fade_out": 0.2, "gain_db": -28, "args": {"excite": 0.3}, "seed": 6},
    {"sound": "surf", "t0": t['day29'], "t1": t['lastM'], "fade_in": 0.2, "fade_out": 0.3, "gain_db": -27, "args": {"size": 0.8}, "seed": 7},
    {"sound": "crickets", "t0": t['lastM'], "t1": t['tyler'], "fade_in": 0.2, "fade_out": 0.1, "gain_db": -40, "seed": 8},
    {"sound": "room_tone", "t0": t['tyler'], "t1": t['tylerW'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 9},
    {"sound": "clock", "t0": t['tyler'], "t1": t['tylerW'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -36, "pan": 0.2, "seed": 10},
    {"sound": "crickets", "t0": t['tylerW'], "t1": D, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -40, "seed": 11},
    {"sound": "crowd_cheer", "t0": t['ninetynine'], "t1": t['he'], "fade_in": 0.3, "fade_out": 0.4, "gain_db": -33, "args": {"excite": 0.2}, "seed": 12},
    {"sound": "applause", "t0": ZAP + 0.15, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -21, "seed": 13},
    {"sound": "crowd_cheer", "t0": ZAP + 0.1, "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -27, "args": {"excite": 1.0}, "seed": 14},
]

ev = [x for x in ev if x is not None]
cues = {
    "title": "049 - Scribe promo: No Nut November battle royale (LOBBY RUSH pluck + marimba 140 bpm, driving drums + battle-royale foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -8.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
