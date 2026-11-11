#!/usr/bin/env python3
"""Cue sheet for 073 (Scribe promo, Vex builds: "How a Dorm Desk Becomes a Homework Factory") -> cues.json.
    python3 -I videos/073-vex-build-homework-factory/make_cues.py && python3 -I audio/synth.py 073-vex-build-homework-factory

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Sound identity: "NIGHT SHIFT" — a dorm at night (room tone, crickets through the window, a lamp hum), the build genre's foley on every
gag, and a small, bouncy pluck groove in A minor (Am–F–C–G, 128 bpm: not 062's F-major mallet loop, not 071's 96-bpm feed groove) that
drops in on "Congratulations" (the hook is foley only, docs/BUILD.md) with a soft kick, a clap on 2 and 4, felt hats and a warm pad
(the pad keeps the bed continuous through the blackout, where the drums thin out). Mixed low under Vex (user, Nov 8: our music is weak;
the no-music cut is what gets posted under a trending sound). The genre's signature: a rising "ta-da" on every TERM callout, a
two-note lift on labels, a falling pair on stamps. All soft + low-passed."""
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
    homework=W('hook', 'homework'), so0=W('hook', 'so'), built=W('hook', 'built'), desk0=W('hook', 'desk'), door0=W('hook', 'door'), two0=W('hook', 'two'), crates=W('hook', 'crates'),
    congrats=W('congrats', 'congratulations'), wobbles=W('congrats', 'wobbles'), coffees=W('congrats', 'coffees'), on1=W('congrats', 'on'), derek1=W('congrats', 'derek'), down1=W('congrats', 'downstairs'),
    so1=W('brace', 'so'), bolt=W('brace', 'bolt'), diagonal=W('brace', 'diagonal'), this1=W('brace', 'this'), triangulation=W('brace', 'triangulation'), triangles=W('brace', 'triangles'), cant=W('brace', 'cant'), fold=W('brace', 'fold'), unlike=W('brace', 'unlike'), two1=W('brace', 'two'), am=W('brace', 'am'),
    then1=W('books', 'then'), textbooks=W('books', 'textbooks'), go=W('books', 'go'), on2=W('books', 'on'), floor=W('books', 'floor'), sags=W('books', 'sags'), room=W('books', 'room'),
    so2=W('beam', 'so'), steel1=W('beam', 'steel'), beam1=W('beam', 'beam'), load=W('beam', 'load'), path=W('beam', 'path'), dorm1=W('beam', 'dorm'), forty1=W('beam', 'forty'), foot=W('beam', 'foot'), brought=W('beam', 'brought'), three=W('beam', 'three'),
    lamp=W('power', 'lamp'), laptop=W('power', 'laptop'), fridge=W('power', 'fridge'), kettle0=W('power', 'kettle'), one0=W('power', 'one'), strip=W('power', 'strip'),
    so3=W('circuit', 'so'), run=W('circuit', 'run'), line=W('circuit', 'line'), dedicated=W('circuit', 'dedicated'), circuit=W('circuit', 'circuit'), outlet=W('circuit', 'outlet'), fifteen=W('circuit', 'fifteen'), kettle1=W('circuit', 'kettle'), twelve=W('circuit', 'twelve'), half=W('circuit', 'half'),
    then2=W('prof', 'then'), drops=W('prof', 'drops'), forty2=W('prof', 'forty'), physics=W('prof', 'physics'), handwritten=W('prof', 'handwritten'), only=W('prof', 'only'),
    so4=W('scribe', 'so'), install=W('scribe', 'install'), scribe=W('scribe', 'scribe'), automation=W('scribe', 'automation'), one1=W('scribe', 'one'), photo=W('scribe', 'photo'), solves=W('scribe', 'solves'), forty3=W('scribe', 'forty'), writes=W('scribe', 'writes'), diagrams=W('scribe', 'diagrams'), too0=W('scribe', 'too'),
    add=W('list', 'add'), printer=W('list', 'printer'), conveyor=W('list', 'conveyor'), robot=W('list', 'robot'), staples=W('list', 'staples'), snack=W('list', 'snack'), chute=W('list', 'chute'),
    congrats2=W('end', 'congratulations'), factory=W('end', 'factory'), door1=W('end', 'door'), desks=W('end', 'desks'), now=W('end', 'now'), done=W('end', 'done'), coffee2=W('end', 'coffee'), lives=W('end', 'lives'), beam2=W('end', 'beam'),
    he=W('tag', 'he'), his=W('tag', 'his'), cute=W('tag', 'cute'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
CARD = t['cute'] + 0.62
MUG_FALL, MUG_HIT = t['coffees'] - 0.25, t['coffees'] + 0.05
BOOK_T = [t['textbooks'] - 0.05, t['textbooks'] + 0.22, t['go'] - 0.02, t['on2'], t['on2'] + 0.28, t['three']]
DEV = [t['lamp'], t['laptop'], t['fridge'], t['kettle0'], t['one0']]
STACK_T = t['drops'] + 0.06
BEAM_IN = [t['so2'] + 0.15, t['steel1'] + 0.04]
CONDUIT = [t['run'] - 0.05, t['line'] + 0.15]
PANEL, FLIP = t['so3'] + 0.05, t['circuit'] - 0.25
BLACK = [t['strip'] + 0.08, t['circuit'] - 0.2]
PRINT0, CONV0, ROBOT0, STAPLE, CHUTE0 = t['printer'] + 0.25, t['conveyor'] - 0.05, t['robot'] - 0.05, t['staples'], t['snack'] - 0.1
LAND = lambda i: CHUTE0 + 0.56 + i * 0.4
DEREK_BONK, DEREK_UP = t['beam2'] + 0.02, t['he'] + 0.05
PAGE_DT = 0.55
PG = lambda k: PRINT0 + k * PAGE_DT

# ---------------------------------------------------------------- music: "NIGHT SHIFT" (128 bpm, A minor), enters on "Congratulations"
BPM = 128
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur = [], IN
while cur < D - 1.0:
    for sym in ['Am', 'F', 'C', 'G']:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Am'])
VEL = [[IN, 0.22], [BLACK[0], 0.16], [BLACK[1] + 0.3, 0.23], [t['so4'], 0.25], [t['congrats2'], 0.27], [CARD, 0.24], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2], "vel": VEL, "bass_every": 4, "bass_vel": 0.7, "len": 0.7}]
mallet = []
for c in story['callouts']:                                  # a rising "ta-da" on TERM callouts, a two-note lift on labels, a falling pair on stamps
    a = c['t0'] + 0.02
    if a < IN - 0.1: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 76, 0.3, 0.16], [round(a + 0.08, 3), 81, 0.3, 0.16], [round(a + 0.16, 3), 84, 0.34, 0.36]]
    elif c['style'] == 'label':
        mallet += [[round(a, 3), 72, 0.26, 0.14], [round(a + 0.09, 3), 76, 0.28, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 74, 0.26, 0.12], [round(a + 0.11, 3), 64, 0.26, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [45, 57, 60, 64, 69], "level": 0.5, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": BLACK[0], "t1": BLACK[1] + 0.4, "notes": [45, 52, 57], "level": 0.9, "attack": 0.15, "release": 0.4, "cutoff": 600, "hp": 30}]   # the blackout: the pad carries it
drums = [[round(b, 3), 0.3, "boom"] for b in [IN, t['sags'], BEAM_IN[1], t['strip'], STACK_T, t['congrats2'], DEREK_BONK]]
END_D = D - 0.6
DR = [[IN, 0.34], [BLACK[0], 0.12], [BLACK[1] + 0.3, 0.34], [D, 0.3]]
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": DR, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.2], [BLACK[0], 0.08], [BLACK[1] + 0.3, 0.22], [D, 0.2]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[IN, 0.22], [BLACK[0], 0.1], [BLACK[1] + 0.3, 0.24], [D, 0.22]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": -1.0, "drums_db": -6.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)

# HOOK: the sheet tossed, two crates, the door lands, the crates rattle
e(t['so0'] + 0.15, "flash_swish", -22, 0.3, dur=0.3, peak=0.5); e(t['so0'] + 0.2, "blanket_rustle", -24, 0.3, dur=0.3, intensity=0.6)
for k, tb in enumerate([t['built'], t['desk0']]): e(tb, "giant_step", -17, -0.3 + 0.6 * k, size=0.35); e(tb + 0.01, "knock", -20, -0.3 + 0.6 * k, pitch=0.8)
e(t['door0'] - 0.25, "flash_swish", -20, 0.0, dur=0.28, peak=0.6); e(t['door0'], "giant_step", -11, 0.0, size=0.75); e(t['door0'] + 0.01, "wood_snap", -19, 0.0, size=0.3)
e(t['two0'], "knock", -18, -0.3, pitch=1.3); e(t['crates'], "knock", -18, 0.3, pitch=1.4)
# CONGRATS: the mug set down, the wobble creaks, the mug falls, splash, the coffee drips on Derek, "HEY!"
e(t['congrats'] - 0.15, "phone_set_down_wood", -18, 0.2)
for k in range(4): e(t['wobbles'] - 0.05 + k * 0.24, "floorboard_creak", -22, -0.3 + 0.2 * k, dur=0.22)
e(MUG_FALL, "flash_swish", -22, 0.2, dur=0.25, peak=0.5); e(MUG_HIT, "cartoon_splash", -15, 0.2, size=0.35, dur=0.8)
for k in range(5): e(t['on1'] + k * 0.22, "plip", -18, 0.1, pitch=0.9 + 0.1 * (k % 3))
e(t['derek1'] + 0.05, "whimper", -18, 0.0, pitch=1.4, dur=0.35)
# BRACE: the drill, the bolts, the triangle glow, a finger poke, the 2 AM clock
e(t['bolt'] + 0.1, "knock", -16, -0.2, pitch=0.9); e(t['diagonal'] + 0.3, "clunk", -16, -0.2, size=0.3, metal=0.6)
e(t['triangulation'] - 0.05, "gold_chime", -24, 0.0, notes=[76, 81], spacing=0.06, vel=0.25)
e(t['cant'], "knock", -20, 0.0, pitch=1.6); e(t['fold'], "knock", -22, 0.0, pitch=1.6)
e(t['two1'], "alarm_beep", -22, 0.2, dur=0.6, n=2, pitch=1.1); e(t['am'] + 0.1, "breath", -22, 0.0, inhale=False)
# BOOKS: one thud per book, the floor groans, plaster crumbles on Derek, the bonk
for k, tb in enumerate(BOOK_T[:5]): e(tb, "giant_step", -15, -0.2, size=0.45 + 0.05 * k); e(tb + 0.02, "blanket_rustle", -24, -0.2, dur=0.2, intensity=0.6)
e(t['floor'] - 0.05, "metal_groan", -17, 0.0, dur=1.2, pitch=0.6); e(t['sags'], "floorboard_creak", -15, 0.0, dur=0.6)
e(t['floor'] + 0.2, "crumble", -18, 0.1, size=0.5); e(t['room'] - 0.1, "crumble", -19, 0.1, size=0.3)
e(t['room'], "bonk", -13, 0.1)
# BEAM: it grinds out of the wall, CLANG, the jack-up groan, the footings take it, the extra book
e(BEAM_IN[0], "grate", -18, 0.6, dur=BEAM_IN[1] - BEAM_IN[0])
e(BEAM_IN[1], "metal_clang", -12, 0.2, size=0.8, pitch=0.9, dur=0.9); e(BEAM_IN[1] + 0.02, "giant_step", -14, 0.0, size=0.7)
e(t['so2'] + 0.4, "whimper", -19, 0.0, pitch=1.5, dur=0.4)   # Derek ducks
e(t['load'] - 0.25, "metal_groan", -16, 0.0, dur=0.9, pitch=0.9); e(t['load'] + 0.1, "giant_step", -15, 0.0, size=0.5)
e(t['dorm1'], "giant_step", -19, -0.5, size=0.4); e(t['dorm1'] + 0.05, "giant_step", -19, 0.5, size=0.4)
e(t['three'], "giant_step", -13, -0.2, size=0.6); e(t['three'] + 0.05, "metal_groan", -22, 0.0, dur=0.6, pitch=1.2)
# POWER: each device pops in, clicks on, then the strip ZAPs and everything dies
for k, tb in enumerate(DEV): e(tb, "pop", -19, -0.4 + 0.2 * k, pitch=0.9 + 0.08 * k)
e(t['lamp'] + 0.08, "lamp_switch_click", -17, -0.4); e(t['laptop'] + 0.1, "gold_chime", -24, 0.0, notes=[84, 88], spacing=0.05, vel=0.2)
e(t['kettle0'] + 0.1, "lamp_switch_click", -19, 0.3)
e(t['strip'] - 0.05, "zap", -12, 0.0, dur=0.5); e(t['strip'] + 0.05, "pressure_drop", -16, 0.0, dur=1.0); e(t['strip'] + 0.1, "hiss", -22, 0.0, dur=0.8)
# CIRCUIT: the conduit zips through the dark, the panel, the breaker, lights back on, the gauge, the kettle boils
e(CONDUIT[0], "grate", -22, 0.3, dur=CONDUIT[1] - CONDUIT[0]); e(CONDUIT[1], "zap", -20, 0.5, dur=0.25)
e(PANEL, "pop", -18, 0.5, pitch=0.8); e(PANEL + 0.3, "latch_click", -18, 0.5, kind='open', bright=0.8)
e(FLIP, "lamp_switch_click", -12, 0.5); e(FLIP + 0.05, "clunk", -18, 0.5, size=0.25, metal=0.8); e(FLIP + 0.1, "low_swell", -20, 0.0, dur=0.8, pitch=1.3)
e(t['outlet'], "zap", -24, 0.5, dur=0.15)
for k in range(5): e(t['fifteen'] + k * 0.06, "counter_tick", -22, 0.5)
for k in range(3): e(t['twelve'] + k * 0.06, "counter_tick", -22, 0.3)
e(t['half'], "hiss", -18, 0.3, dur=1.2); e(t['half'] + 0.3, "lamp_switch_click", -20, 0.3)
# PROF: the stack drops in, THOOM, paper everywhere, the stamp
e(STACK_T - 0.3, "flash_swish", -16, 0.0, dur=0.32, peak=0.8); e(STACK_T, "giant_step", -10, 0.0, size=0.85); e(STACK_T + 0.03, "blanket_rustle", -18, 0.0, dur=0.8, intensity=1.0)
e(t['physics'], "blanket_rustle", -24, 0.2, dur=0.3, intensity=0.6)
e(t['handwritten'] + 0.03, "knock", -12, 0.0, pitch=0.6); e(t['handwritten'] + 0.04, "giant_step", -16, 0.0, size=0.5)
e(t['only'], "hiss", -22, 0.0, dur=0.5)   # the angry steam
# SCRIBE: installed, the photo, scanning, solving, the writing appears on screen, the diagram
for k in range(6): e(t['install'] + k * 0.08, "scan_beep", -26, 0.2, pitch=1.2 + 0.05 * k, dur=0.05)
e(t['scribe'] + 0.2, "gold_chime", -15, 0.2, notes=[77, 84, 89], spacing=0.08, vel=0.45)
e(t['photo'] - 0.02, "shutter", -14, -0.2); e(t['photo'], "flash_swish", -18, -0.2, dur=0.25, peak=0.6)
for k in range(8): e(t['photo'] + 0.45 + k * 0.1, "scan_beep", -24, 0.1, pitch=1.3 + 0.04 * (k % 4), dur=0.05)
S0, S1 = t['solves'], t['forty3'] + 0.25
for k in range(12): e(S0 + k * (S1 - S0) / 12, "scan_beep", -22, 0.1, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(S1, "gold_chime", -16, 0.1, notes=[84, 89, 93, 96], spacing=0.05, vel=0.45)
k = 0
while t['writes'] + k * 0.5 < t['add'] + 0.3:
    e(t['writes'] + k * 0.5, "pen_scribble", -18, -0.1 + 0.05 * (k % 3), dur=0.55); k += 1
e(t['diagrams'] + 0.05, "pop", -18, 0.0, pitch=1.1); e(t['too0'], "gold_chime", -20, 0.0, notes=[88, 93], spacing=0.06, vel=0.3)
# LIST: printer, conveyor, robot arm + staples, the snack chute
e(t['printer'], "pop", -16, -0.4, pitch=0.8)
for k in range(30):
    if PG(k) < D - 0.5: e(PG(k) + 0.05, "keyboard_type", -27, -0.4, dur=0.25)
e(CONV0, "flash_swish", -18, -0.3, dur=0.5, peak=0.6); e(CONV0 + 0.3, "clunk", -16, 0.0, size=0.4, metal=0.7)
e(t['robot'], "pop", -16, 0.4, pitch=0.7); e(t['robot'] + 0.15, "metal_groan", -24, 0.4, dur=0.5, pitch=1.6)
e(STAPLE, "clunk", -12, 0.3, size=0.5, metal=1.0)
for k in range(30):
    ts = PG(k) + 2.0
    if STAPLE + 0.1 < ts < D - 0.6: e(ts, "knock", -22, 0.3, pitch=1.5)
e(CHUTE0 - 0.2, "flash_swish", -18, -0.3, dur=0.4, peak=0.6)
for i in range(4): e(LAND(i) - 0.3, "blanket_rustle", -22, -0.3, dur=0.25, intensity=0.6); e(LAND(i), "crumble", -22, -0.3, size=0.15)
# END: the confetti, the knob, DONE, Derek bonks the beam, "Cute.", the end card
e(t['factory'], "pop", -15, 0.0, pitch=1.0); e(t['factory'] + 0.05, "gold_chime", -17, 0.0, notes=[81, 84, 88], spacing=0.07, vel=0.4)
e(t['door1'], "knock", -18, 0.3, pitch=1.1)
e(t['done'], "gold_chime", -17, 0.4, notes=[84, 88, 91], spacing=0.05, vel=0.4)
e(DEREK_BONK, "bonk", -11, 0.0); e(DEREK_BONK + 0.01, "metal_clang", -17, 0.0, size=0.5, pitch=1.2, dur=0.6)
e(DEREK_UP + 0.1, "blanket_rustle", -22, 0.0, dur=0.3, intensity=0.6); e(DEREK_UP + 0.3, "whimper", -20, 0.0, pitch=1.5, dur=0.4)
e(t['cute'] + 0.35, "gold_chime", -22, 0.0, notes=[93, 96], spacing=0.05, vel=0.25)
e(CARD, "gold_chime", -14, 0.0, notes=[69, 76, 81, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.05, "fade_out": 0.8, "gain_db": -30, "seed": 1},
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -34, "seed": 2},
    {"sound": "lamp_hum", "t0": t['lamp'], "t1": BLACK[0], "fade_in": 0.1, "fade_out": 0.05, "gain_db": -32, "seed": 3},
    {"sound": "lamp_hum", "t0": FLIP + 0.1, "t1": D, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -33, "seed": 4},
    {"sound": "drill", "t0": t['bolt'] - 0.08, "t1": t['diagonal'] + 0.35, "fade_in": 0.04, "fade_out": 0.08, "gain_db": -20, "args": {"rate": 14.0}, "seed": 5},
    {"sound": "fan", "t0": PRINT0, "t1": D - 0.3, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -31, "seed": 6},   # the factory hums
]

cues = {
    "title": "073 - Scribe promo: Vex builds a homework factory (A-minor pluck groove 128 bpm, entering on Congratulations + dorm night beds + build foley + Vex)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -16.0, "sfx": -1.0, "amb": 3.5, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
# user, Nov 10: music from FRAME 1 (no quiet open on Scribe reels) and every Vex reel plays the user's own CUTE
# track (tools/presets.json 'cute'); the synth score above is kept for reference only. ~8 dB under the voice.
cues['music'] = {'preset': 'cute', 'pick': 1, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -4.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
