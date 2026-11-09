#!/usr/bin/env python3
"""Cue sheet for 062 (Scribe promo, "How f*cking airplanes f*cking fly") -> cues.json.
    python3 -I videos/062-fword-airplanes/make_cues.py && python3 -I audio/synth.py 062-fword-airplanes

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Sound identity: "DEADPAN EXPLAINER, AIRPORT EDITION" — the voice and the foley carry it (user, Nov 8: our music is weak; the no-music
cut is what gets posted under a trending sound). A quiet, bouncy mallet ostinato in F (F–C–Dm–B♭, 124 bpm — not 058's C loop) over a
soft kick + felt hats, a warm pad under everything (keeps the bed continuous), ~13 dB under the voice. The teacher → "cooked" stretch
drops to Dm–B♭–F–C with sparser drums; Scribe lifts it back. The places carry their own sound: the jet roaring over the planespotter,
the checkpoint murmur, the engine at the gate, wind on the takeoff roll, the cabin hum. Foley on every gag (shoes into the bin, the
belt, the pants drop boing, the arch's beeps, the cap sucked in → whoomp → fireball out the back, the liftoff thump, the throttle,
turbulence rattles + the coffee splat, the pretzel bag, the touchdown, ONE person clapping, the stack slam + stamp, Scribe's beeps +
the pen, the paper plane, the clap again, the end card chime). All soft + low-passed."""
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
    f1=W('hook', 'fucking', 1), fly=W('hook', 'fly'),
    sec=W('security', 'the'), airport=W('security', 'airport'), shoes=W('security', 'shoes'), belt=W('security', 'belt'), pants=W('security', 'pants'), down=W('security', 'down'), still=W('security', 'still'), beeps=W('security', 'beeps'),
    eng=W('engines', 'the'), suck=W('engines', 'suck'), air1=W('engines', 'air'), set=W('engines', 'set'), fire=W('engines', 'fire'), and_=W('engines', 'and'), back=W('engines', 'back'),
    this=W('wing', 'this'), wing=W('wing', 'wing'), shoves1=W('wing', 'shoves'), down2=W('wing', 'down'),
    lift0=W('lift', 'the'), shoves2=W('lift', 'shoves'), up=W('lift', 'up'), thats=W('lift', 'thats'), lift1=W('lift', 'lift'),
    twice=W('speed', 'twice'), speed=W('speed', 'speed'), four=W('speed', 'four'), lift2=W('speed', 'lift'),
    turb=W('turb', 'turbulence'), bumpy=W('turb', 'bumpy'), the2=W('turb', 'the'), fine=W('turb', 'fine'), your1=W('turb', 'your'), isnt=W('turb', 'isnt'),
    your2=W('snack', 'your'), snack=W('snack', 'snack'), one1=W('snack', 'one'), pretzel=W('snack', 'pretzel'),
    it2=W('land', 'it'), lands=W('land', 'lands'), one2=W('land', 'one'), claps1=W('land', 'claps'),
    its=W('teacher', 'its'), ten=W('teacher', 'ten'), problems=W('teacher', 'problems'), handwritten=W('teacher', 'handwritten'),
    youre=W('cooked', 'youre'), cooked=W('cooked', 'cooked'),
    so=W('scribe', 'so'), open_=W('scribe', 'open'), scribe=W('scribe', 'scribe'), one3=W('scribe', 'one'), photo=W('scribe', 'photo'), it3=W('scribe', 'it'), ten2=W('scribe', 'ten'),
    it4=W('hand', 'it'), draws=W('hand', 'draws'), diagram=W('hand', 'diagram'), hl=W('hand', 'lift'), hw=W('hand', 'weight'), ht=W('hand', 'thrust'), hd=W('hand', 'drag'), in_=W('hand', 'in'), handwriting=W('hand', 'handwriting'),
    you=W('fold', 'you'), fold=W('fold', 'fold'), plane2=W('fold', 'plane'), it5=W('fold', 'it', 2), flies=W('fold', 'flies'), one4=W('fold', 'one'), claps2=W('fold', 'claps'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['claps2'] + 0.55
TOVER = t['fly'] + 0.06
SHOE = [t['shoes'] + 0.2, t['shoes'] + 0.5]
BELTF, DROP, WALK0, BEEP = t['belt'] + 0.08, t['down'] - 0.12, t['still'] - 0.35, t['beeps'] - 0.02
CAP0, CAPIN, CAPFIRE, CAPOUT = t['suck'] - 0.05, t['air1'] + 0.12, t['fire'] - 0.02, t['back'] + 0.02
SPLASH = t['isnt'] - 0.02
BAGOPEN, PRETZ = t['one1'] - 0.15, t['pretzel'] - 0.08
STACKDROP, STAMP = t['problems'] - 0.05, t['handwritten'] + 0.05
LIDO0, LIDO1, FLASH = t['open_'] - 0.05, t['open_'] + 0.3, t['photo'] + 0.05
SOLVE0, SOLVE1 = t['it3'] + 0.05, t['ten2'] + 0.22
PEN0, WRITE0, WRITE1 = t['it4'] + 0.02, t['draws'] + 0.05, t['fold'] - 0.25
FOLD0, FOLD1, LAUNCH, CATCH = t['fold'] - 0.05, t['plane2'] + 0.05, t['it5'] - 0.05, t['one4'] + 0.05

# ---------------------------------------------------------------- music: soft explainer bed, 124 bpm, F major
BPM = 124
BEAT = 60 / BPM
IN = t['sec'] - 0.02
TENSE0, TENSE1 = t['its'] - 0.1, t['so'] - 0.1
chords, cur = [], IN
while cur < D - 1.0:
    seq = ['Dm', 'Bb', 'F', 'C'] if TENSE0 - 0.5 <= cur < TENSE1 - 0.5 else ['F', 'C', 'Dm', 'Bb']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'F'])
VEL = [[IN, 0.22], [t['turb'], 0.24], [TENSE0, 0.18], [TENSE1, 0.25], [t['claps2'], 0.27], [ENDCARD, 0.24], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "ostinato", "step": BEAT / 2, "pattern": [0, 1, 2, 1, 4, 2, 1, 3], "vel": VEL, "bass_every": 4, "bass_vel": 0.7, "len": 0.8}]
mallet = []
for c in story['callouts']:                                  # a two-note lift on every label, a rising "ta-da" on TERM callouts
    a = c['t0'] + 0.02
    if a < IN - 0.1: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 77, 0.3, 0.16], [round(a + 0.08, 3), 81, 0.3, 0.16], [round(a + 0.16, 3), 84, 0.34, 0.36]]
    elif c['style'] == 'label':
        mallet += [[round(a, 3), 72, 0.26, 0.14], [round(a + 0.09, 3), 77, 0.28, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 74, 0.26, 0.12], [round(a + 0.11, 3), 65, 0.26, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [41, 53, 57, 60, 65], "level": 0.45, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30},
       {"t0": 0.05, "t1": IN + 0.3, "notes": [53, 57, 60], "level": 1.0, "attack": 0.9, "release": 0.4, "cutoff": 700, "hp": 30}]   # a soft riser under the hook
drums = [[round(b, 3), 0.32, "boom"] for b in [IN, t['up'], t['four'] + 0.05, STACKDROP, t['cooked'], t['claps2']]]
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

# HOOK: the jet roars over the planespotter
e(0.05, "low_swell", -22, 0.0, dur=1.6, pitch=0.8)
e(TOVER - 0.05, "giant_step", -12, 0.0, size=0.9); e(TOVER, "pressure_drop", -16, 0.0, dur=1.4)
e(TOVER + 0.1, "blanket_rustle", -20, 0.3, dur=0.8, intensity=1.0)   # grass + leaves
# SECURITY
for k, s in enumerate(SHOE):
    e(s + 0.05, "flash_swish", -22, -0.3, dur=0.2, peak=0.5); e(s + 0.42, "clunk", -17, -0.4, size=0.3, metal=0.0)
e(t['belt'] - 0.02, "flash_swish", -18, -0.2, dur=0.3, peak=0.7); e(BELTF + 0.38, "clunk", -16, -0.4, size=0.35, metal=0.3)
e(DROP, "blanket_rustle", -16, 0.0, dur=0.35, intensity=0.9); e(DROP + 0.1, "boing", -16, 0.0, pitch=0.8, dur=0.5)
steps(WALK0, BEEP + 0.4, 7.0, -26, 0.0, 0.0)
e(BEEP, "alarm_beep", -12, 0.1, dur=1.2, n=3, pitch=0.9)
# ENGINES (the cap goes through it)
e(CAP0, "flash_swish", -15, 0.2, dur=0.35, peak=0.8); e(CAP0 + 0.05, "pop", -20, 0.2, pitch=0.9)
e(CAPIN, "metal_clang", -20, 0.1, size=0.4, pitch=1.4, dur=0.6)
for k in range(5): e(CAPIN + 0.15 + k * 0.12, "knock", -24, 0.0, pitch=1.2 + 0.1 * k)   # rattling through the compressor
e(CAPFIRE, "whoomp", -13, 0.0, size=0.8)
e(CAPOUT, "fireball", -13, -0.2, size=0.7)
# WING + LIFT (the takeoff roll)
e(t['shoves1'], "low_swell", -18, 0.0, dur=1.0, pitch=0.7); e(t['down2'], "giant_step", -18, 0.0, size=0.5)
e(t['shoves2'] - 0.1, "gold_chime", -22, 0.0, notes=[65, 72], spacing=0.08, vel=0.3)
e(t['up'], "giant_step", -12, 0.0, size=0.9); e(t['up'] + 0.02, "low_swell", -16, 0.0, dur=1.4, pitch=1.2)
# SPEED (the cockpit)
e(t['twice'] + 0.1, "clunk", -15, -0.2, size=0.4, metal=0.6); e(t['twice'] + 0.12, "low_swell", -18, 0.0, dur=1.0, pitch=1.4)
e(t['four'] + 0.05, "pressure_drop", -13, 0.0, dur=1.6); e(t['four'] + 0.1, "whimper", -18, 0.3, pitch=1.4, dur=0.5)
e(t['four'] + 0.2, "flash_swish", -20, -0.4, dur=0.4, peak=0.6)   # the cap flies off
# TURBULENCE
for k in range(9): e(t['turb'] + 0.1 + k * 0.17, "knock", -25 - (k % 3), -0.5 + 0.12 * k, pitch=0.7 + 0.08 * (k % 4))   # rattles
e(t['bumpy'], "bonk", -20, 0.2)
e(t['your1'] + 0.05, "knock", -22, 0.2, pitch=1.4); e(SPLASH, "water_splash", -14, 0.2, size=0.2)
e(SPLASH + 0.05, "whimper", -19, 0.2, pitch=1.2, dur=0.4)
# SNACK
e(t['snack'] - 0.05, "blanket_rustle", -21, 0.2, dur=0.3, intensity=0.6)
e(BAGOPEN, "blanket_rustle", -18, 0.2, dur=0.2, intensity=1.0); e(PRETZ + 0.2, "plip", -16, 0.2, pitch=0.8)
# LAND + one guy claps
e(t['lands'] - 0.02, "giant_step", -12, 0.0, size=0.8); e(t['lands'], "hiss", -20, 0.0, dur=0.9)
# TEACHER
e(t['ten'], "flash_swish", -22, 0.2, dur=0.3, peak=0.5)
e(STACKDROP, "giant_step", -11, 0.1, size=0.8); e(STACKDROP + 0.01, "wood_snap", -16, 0.1, size=0.5); e(STACKDROP + 0.05, "blanket_rustle", -20, 0.1, dur=0.6, intensity=0.9)
e(STAMP, "knock", -12, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
# COOKED
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.05, "whimper", -19, 0.0, pitch=1.1, dur=0.4)
# SCRIBE (as 049/058)
e(LIDO0, "knock", -17, 0.2, pitch=1.1); e(LIDO1, "gold_chime", -15, 0.2, notes=[77, 84, 89], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "lamp_switch_click", -12, 0.2); e(FLASH, "flash_swish", -16, 0.2, dur=0.25, peak=0.7)
for k in range(10): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 10, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[84, 89, 93, 96], spacing=0.05, vel=0.45)
# HAND — the pen draws the free-body diagram: a scribble per arrow, a soft pop when each one lands
e(PEN0, "flash_swish", -16, 0.3, dur=0.4, peak=0.6); e(PEN0 + 0.05, "gold_chime", -20, 0.3, notes=[91, 96], spacing=0.05, vel=0.3)
k = 0
while WRITE0 + k * 0.55 < WRITE1 - 0.1:
    e(WRITE0 + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
for i, w in enumerate([t['hl'], t['hw'], t['ht'], t['hd']]): e(w + 0.25, "pop", -19, -0.3 + 0.2 * i, pitch=1.0 + 0.1 * i)
# FOLD + FLY + CLAP
for k in range(3): e(FOLD0 + 0.1 + k * 0.4, "blanket_rustle", -19, 0.1, dur=0.25, intensity=0.8)
e(FOLD1, "gold_chime", -18, 0.0, notes=[84, 89], spacing=0.06, vel=0.35)
e(LAUNCH, "flash_swish", -15, 0.2, dur=0.6, peak=0.6); e(LAUNCH + 0.35, "flash_swish", -19, -0.3, dur=0.5, peak=0.4)
e(CATCH, "pop", -14, 0.0, pitch=0.8); e(CATCH + 0.18, "gold_chime", -15, 0.0, notes=[79, 84, 88, 91], spacing=0.05, vel=0.45)   # A+
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 77, 81, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": t['sec'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"darkness": 0.6, "gust": 0.4, "whistle": 0.05}, "seed": 1},
    {"sound": "jet", "t0": 0.0, "t1": t['sec'], "fade_in": 1.2, "fade_out": 0.12, "gain_db": -18, "args": {"whine": 0.3, "pitch": 0.9}, "seed": 2},
    {"sound": "room_tone", "t0": t['sec'], "t1": t['eng'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 3},
    {"sound": "crowd_cheer", "t0": t['sec'], "t1": t['eng'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -31, "args": {"excite": 0.12}, "seed": 4},   # the checkpoint murmur
    {"sound": "jet", "t0": t['eng'], "t1": t['this'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -20, "args": {"whine": 0.55, "pitch": 1.0}, "seed": 5},
    {"sound": "jet", "t0": t['this'], "t1": t['twice'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -20, "args": {"whine": 0.4, "pitch": 1.1}, "seed": 6},
    {"sound": "wind", "t0": t['this'], "t1": t['twice'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -29, "args": {"darkness": 0.5, "gust": 0.7, "whistle": 0.08}, "seed": 7},
    {"sound": "cabin_hum", "t0": t['twice'], "t1": t['turb'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -25, "seed": 8},
    {"sound": "wind", "t0": t['twice'], "t1": t['turb'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"darkness": 0.4, "gust": 0.8, "whistle": 0.1}, "seed": 9},
    {"sound": "cabin_hum", "t0": t['turb'], "t1": t['it2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -26, "seed": 10},
    {"sound": "jet", "t0": t['it2'], "t1": t['one2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -21, "args": {"whine": 0.3, "pitch": 0.8}, "seed": 11},
    {"sound": "cabin_hum", "t0": t['one2'], "t1": D, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -30, "seed": 12},
    {"sound": "applause", "t0": t['claps1'] - 0.35, "t1": t['its'] + 0.4, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -20, "args": {"density": 5.0, "swell": 0.1}, "seed": 13},   # ONE guy clapping
    {"sound": "applause", "t0": t['claps2'] - 0.15, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -20, "args": {"density": 5.0, "swell": 0.1}, "seed": 14},
]

cues = {
    "title": "062 - Scribe promo: how f*cking airplanes f*cking fly (soft F-major mallet bed 124 bpm + place sound + gag foley + deadpan narrator)",
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
