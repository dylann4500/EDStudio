#!/usr/bin/env python3
"""Cue sheet for 065 (Scribe lane, "Mommy rates your study habits", rating format, her goth bedroom) -> cues.json.
python3 -I videos/065-vex-rates-study/make_cues.py   then   python3 -I audio/synth.py 065-vex-rates-study
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "GOTH LO-FI" — a quiet bedroom (faint crickets through the dusk window) under the hook, then a dark, lazy pluck
arpeggio (80 bpm, E minor: Em7 → Cmaj7 → Am7 → B7) enters on the first rating with a soft kick + rim + shaker; minimal (the lane
also posts the no-music cut). Each rating card = a pixel pop; low scores get a soft low "bwomp" swell, the 10/10s a gold chime.
Foley: the third energy can clunking down, a breath + sparkle on "mommy", the phone shutter on the practice sheet, the pen drawing
the Punnett square, a "shh" breath. Voice on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(me=W('hook', 'me'), tabs=B['tabs']['t0'], two=W('tabs', 'two'), drink=B['drink']['t0'], zero=W('drink', 'zero'), hl=B['highlight']['t0'],
         its=W('highlight', 'its'), minus=W('highlight', 'minus'), bed=B['bed']['t0'], hmm=W('bed', 'hmm'), six=W('bed', 'six'), mommy=W('bed', 'mommy'),
         turn=B['turn']['t0'], ten1=W('turn', 'ten'), scribe=B['scribe']['t0'], then=W('scribe', 'then'), messy=W('scribe', 'messy'),
         rushed=W('scribe', 'rushed'), punnett=W('scribe', 'punnett'), secret=B['secret']['t0'], your=W('secret', 'your'), end=B['end']['t0'],
         ten3=W('end', 'ten'), come=W('end', 'come'), baby=W('end', 'baby'))
T['card'] = T['baby'] + 0.55
CUTS = [T['tabs'], T['two'] - 0.25, T['drink'], T['zero'] - 0.25, T['hl'], T['its'] - 0.05, T['bed'], T['hmm'] - 0.1, T['turn'], T['ten1'] - 0.3,
        T['scribe'], T['then'] - 0.05, T['rushed'] + 0.15, T['your'] - 0.1, T['end']]
RATINGS = [(T['two'], 'low'), (T['zero'], 'low'), (T['minus'], 'low'), (T['six'], 'mid'), (T['ten1'], 'top'), (T['ten3'], 'top')]

# ---------------------------------------------------------------- music: "GOTH LO-FI" (80 bpm, E minor), enters on the first rating
BPM = 80; BEAT = 60 / BPM
IN = T['tabs'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Em7', 'Cmaj7', 'Am7', 'B7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Em7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 1, 2, 1, 3, 2, 1, 2],
             "vel": [[IN, 0.24], [T['scribe'], 0.28], [T['end'], 0.25], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [40, 52, 59, 62, 67], "level": 3.2, "attack": 1.6, "release": 1.2, "cutoff": 700, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.28, 0.14], [round(a + 0.1, 3), 83, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.42, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.26, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.22], "vel": 0.22, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -26, 0.0, pitch=1.7)
e(0.05, "pop", -21, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
for t, kind in RATINGS:   # the rating card pops (label, then the score 0.12 s later)
    e(t - 0.05, "pop", -20, 0.0, pitch=1.15); e(t + 0.07, "pop", -19, 0.0, pitch=0.9)
    if kind == 'low': e(t + 0.1, "low_swell", -25, 0.0, dur=0.7, pitch=0.65)
    elif kind == 'mid': e(t + 0.1, "boing", -27, 0.0, pitch=1.0, dur=0.3)
    else: e(t + 0.12, "gold_chime", -23, 0.1, notes=[76, 83, 88], spacing=0.07, vel=0.26, dur=0.6)
for m in (0.15, T['mommy']):
    if m > 0.5: e(m - 0.45, "breath", -22, 0.0, dur=0.55, inhale=True)
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[83, 90], spacing=0.06, vel=0.22, dur=0.5)
e(T['baby'] + 0.05, "gold_chime", -25, 0.1, notes=[79, 83, 90], spacing=0.08, vel=0.24, dur=0.6)   # the blown kiss
e(T['drink'] + 0.33, "metal_clang", -26, 0.3, size=0.25, pitch=1.8); e(T['drink'] + 0.47, "metal_clang", -32, 0.3, size=0.2, pitch=2.0)   # the third can lands
e(T['scribe'] + 0.5, "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['scribe'] + 0.51, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['messy'] - 0.25
while t < T['messy'] + 0.55: e(t, "scan_beep", -29, 0.1, pitch=1.3 + 0.05 * k, dur=0.05); t += 0.1; k += 1   # the slider ticking up
t = T['punnett'] - 0.4
while t < T['your'] - 0.2: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
e(T['your'] + 0.1, "breath", -24, 0.0, dur=0.6, inhale=False)                                     # "shh"
e(T['card'], "gold_chime", -23, 0.0, notes=[64, 71, 76], spacing=0.09, vel=0.28)

amb = [
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -36, "seed": 4},
    {"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.4, "fade_out": 0.8, "gain_db": -42, "args": {"darkness": 0.85, "gust": 0.15, "whistle": 0.0}, "seed": 5},
]
cues = {
    "title": "065 - mommy rates your study habits (Vex, GOTH LO-FI bed, 80 bpm E minor pluck, bedroom at dusk, rating pops + Fish Mommy ASMR)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
