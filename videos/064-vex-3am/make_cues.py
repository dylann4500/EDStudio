#!/usr/bin/env python3
"""Cue sheet for 064 (Scribe lane, "POV: it's 3 AM and goth mommy catches you doing homework") -> cues.json.
python3 -I videos/064-vex-3am/make_cues.py   then   python3 -I audio/synth.py 064-vex-3am
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "3 AM LO-FI" — night surf + crickets alone under the hook, then a slow, dreamy bell arpeggio (76 bpm, D minor:
Dm7 → Bbmaj7 → Gm7 → A7) enters on the first "mommy" with a soft lo-fi kick/rim/shaker; minimal (the lane also posts the
no-music cut under a trending sound). Foley carries the jokes: an ice clink in the cold coffee, a pencil crunch on "chewed-up",
a paper-stack thud on "forty", a soft swell on "aww", the pencil clattering down, a breath + sparkle on every "mommy", the phone
shutter, solve ticks, the pen writing the Lewis structure, a blanket rustle at the bed, a chime on the end card. Voice on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(mommy1=W('hook', 'mommy'), roast=B['roast']['t0'], cold=W('roast', 'cold'), chewed=W('roast', 'chewedup'), forty=W('roast', 'forty'),
         three=W('roast', 'three'), pity=B['pity']['t0'], cooked=W('pity', 'cooked'), come=B['come']['t0'], down=W('come', 'down'),
         tease=B['tease']['t0'], mommy2=W('tease', 'mommy'), notW=W('tease', 'not'), scribe=B['scribe']['t0'], scribeW=W('scribe', 'scribe'),
         and2=W('scribe', 'and'), even=W('scribe', 'even'), secret=B['secret']['t0'], mommy3=W('secret', 'mommy'), tell=W('secret', 'tell'),
         relax=B['relax']['t0'], bed=B['bed']['t0'], mommy4=W('bed', 'mommys'), end=B['end']['t0'], dreams=W('end', 'dreams'))
T['card'] = T['dreams'] + 0.55
CUTS = [T['roast'], T['chewed'] - 0.05, T['forty'] - 0.05, T['pity'], T['come'], T['tease'], T['scribe'], T['scribeW'] - 0.05, T['and2'] - 0.05,
        T['even'] - 0.05, T['secret'], T['relax'], T['bed'], T['end']]

# ---------------------------------------------------------------- music: "3 AM LO-FI" (76 bpm, D minor), enters on the first "mommy"
BPM = 76; BEAT = 60 / BPM
IN = T['mommy1'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dm7', 'Bbmaj7', 'Gm7', 'A7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dm7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 1, 2, 3, 2, 1, 2, 1],
             "vel": [[IN, 0.24], [T['scribe'], 0.28], [T['relax'], 0.24], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [38, 50, 57, 60, 65], "level": 3.2, "attack": 1.6, "release": 1.2, "cutoff": 700, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 74, 0.28, 0.14], [round(a + 0.1, 3), 81, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.42, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.26, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.22], "vel": 0.24, "kind": "tick"}]
drums = [[round(IN, 3), 0.32, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "bell",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -26, 0.0, pitch=1.7)                                   # pixel blip on each mosaic cut
e(0.05, "pop", -21, 0.0, pitch=1.3)                                                 # the title card
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
# every "mommy": a breath in just before, a soft sparkle as the hearts pop
for m in (T['mommy1'], T['mommy2'], T['mommy3'], T['mommy4']):
    e(m - 0.45, "breath", -22, 0.0, dur=0.55, inhale=True)
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[86, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['dreams'] + 0.05, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)   # the blown kiss
# the roast: an ice clink in the cold coffee, the pencil crunch, the paper stack thud
e(T['cold'] + 0.15, "metal_clang", -31, -0.2, size=0.15, pitch=2.6)
e(T['chewed'] + 0.1, "crumble", -22, 0.2)
e(T['forty'] + 0.02, "clunk", -22, 0.0, size=0.35, metal=0.0)
e(T['three'] + 0.05, "low_swell", -26, 0.0, dur=0.8, pitch=0.7)
e(T['cooked'], "low_swell", -25, 0.0, dur=1.0, pitch=0.85)                          # "aww"
# "put the pencil down": it clatters on the desk (the shot's little hop)
e(T['down'] - 0.02, "knock", -21, 0.15, pitch=1.6); e(T['down'] + 0.09, "knock", -26, 0.15, pitch=1.9)
e(T['notW'] + 0.15, "boing", -26, 0.0, pitch=1.2, dur=0.3)                          # "not homework" (the laugh)
# Scribe: the phone shutter, solve ticks, the pen writing
e(T['scribe'] + 0.45, "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['scribe'] + 0.46, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['scribeW'] + 0.25
while t < T['and2'] - 0.1: e(t, "scan_beep", -27, 0.15, pitch=1.6 + 0.02 * (k % 6), dur=0.07); t += 0.16; k += 1
t = T['and2']
while t < T['secret'] - 0.3: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
e(T['tell'] + 0.1, "breath", -24, 0.0, dur=0.6, inhale=False)                       # "shh"
e(T['bed'] + 0.2, "blanket_rustle", -22, 0.25, dur=0.8, intensity=0.7)
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)

amb = [
    {"sound": "surf", "t0": 0.0, "t1": T['scribe'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -27, "args": {"size": 0.55}, "seed": 1},
    {"sound": "surf", "t0": T['scribe'], "t1": T['secret'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -33, "args": {"size": 0.45}, "seed": 2},
    {"sound": "surf", "t0": T['secret'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -28, "args": {"size": 0.5}, "seed": 3},
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -36, "seed": 4},
]
cues = {
    "title": "064 - 3 AM goth mommy (Vex, minimal 3 AM LO-FI bed, 76 bpm D minor, night surf + crickets, pixel foley + Fish Mommy ASMR)",
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
