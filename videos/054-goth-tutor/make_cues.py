#!/usr/bin/env python3
"""Cue sheet for 054 (Scribe promo, goth cheat-tutor, anime/pixel look) -> cues.json.   python3 -I videos/054-goth-tutor/make_cues.py
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js. Then: python3 -I audio/synth.py 054-goth-tutor

Sound identity: "MIDNIGHT TUTOR" — a minimal, sultry bed (the lane posts the no-music cut under a trending sound; user, Nov 8: keep our
music minimal): a dark A-minor pluck groove at 100 bpm (soft kick on 1 + 3, claps on 2 + 4, 16th felt hats, a low pad) that enters on
"Let mommy explain". Places carry the rest: beach surf, a library at night (room tone + clock), a classroom murmur, the office.
Pixel foley: a soft retro pop on every mosaic cut, scan beeps on callouts, chalk on the boards, the crime-scene tape slaps + a far
siren chirp, highlighter pops on the em dashes, a marker squeak round "delve", the detector's alarm, a breath before the whisper,
pen scratch while Scribe writes, the phone shutter, solve ticks, paper slide, a soft chime on PERFECT MATCH. Voice on top (ducks the bed)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(come=W('hook', 'come'), mommy1=W('hook', 'mommy'), h17=B['h17']['t0'], drinks=W('h17', 'drinks'), h20=B['h20']['t0'], thats=W('h20', 'thats'), chips=W('h20', 'chips'),
         h22=B['h22']['t0'], naps=W('h22', 'naps'), withW=W('h22', 'with'), h24=B['h24']['t0'], forty=W('h24', 'forty'), so=W('h24', 'so'), gone=W('h24', 'gone'),
         turn=B['turn']['t0'], mommy2=W('turn', 'mommy'), you=W('turn', 'you'), scribe=B['scribe']['t0'], scribeW=W('scribe', 'scribe'), and2=W('scribe', 'and'), even=W('scribe', 'even'),
         payoff=B['payoff']['t0'], mommy3=W('payoff', 'mommys'), end=B['end']['t0'], dreams=W('end', 'dreams'))
T['card'] = T['dreams'] + 0.55
CUTS = [T['h17'], T['h20'], T['h22'], T['h24'], T['forty'] - 0.05, T['so'] - 0.05, T['turn'], T['scribe'], T['scribeW'] - 0.05, T['and2'] - 0.05, T['even'] - 0.05, T['payoff'], T['end']]
T['let'] = T['come']; T['perfect'] = T['even']

# ---------------------------------------------------------------- music: minimal "MIDNIGHT TUTOR" (100 bpm, A minor)
BPM = 100; BEAT = 60 / BPM
IN = T['come'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Am', 'F', 'Dm', 'E']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Am'])
sections = [{"t0": IN, "t1": D, "style": "bounce", "step": BEAT / 2, "vel": [[IN, 0.3], [T['scribe'], 0.34], [T['end'], 0.32], [D, 0.3]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [33, 45, 52, 57, 60], "level": 3.0, "attack": 1.2, "release": 1.0, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.3, 0.14], [round(a + 0.09, 3), 81, 0.32, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.5, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.36, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": 0.3, "kind": "tick"}]
drums = [[round(IN, 3), 0.4, "boom"], [round(T['scribe'], 3), 0.35, "boom"], [round(T['perfect'], 3), 0.35, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": 2.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -6.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -25, 0.0, pitch=1.7)                                   # pixel blip on each mosaic cut
e(0.05, "pop", -20, 0.0, pitch=1.3)                                                 # the title card
for c in story['callouts']: e(c['t0'], "scan_beep", -24, 0.2, pitch=1.4, dur=0.12)
# every "mommy": a breath in just before, a soft sparkle as the hearts pop
for m in (T['mommy1'], T['mommy2'], T['mommy3']):
    e(m - 0.45, "breath", -21, 0.0, dur=0.55, inhale=True)
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[88, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['you'] + 0.1, "gold_chime", -26, -0.1, notes=[86, 91], spacing=0.07, vel=0.22, dur=0.5)   # the blown kiss
e(T['dreams'] + 0.05, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)
# hour 17: an ice clink in the cocktail; hour 20: the chip bag crinkle + a crunch; hour 22: a nodding-off swell, then a jolt
e(T['h17'] + 0.3, "metal_clang", -30, -0.3, size=0.2, pitch=2.2)
e(T['h20'] + 0.4, "blanket_rustle", -22, 0.3, dur=0.6, intensity=0.9); e(T['chips'] + 0.05, "crumble", -20, 0.2)
e(T['naps'], "low_swell", -24, 0.0, dur=1.2, pitch=0.8); e(T['withW'] + 0.02, "boing", -22, 0.0, pitch=1.3, dur=0.35)
# hour 24: the SAVE FAILED glitch
for k in range(4): e(T['forty'] + k * 0.11, "zap", -27, 0.1, dur=0.08)
e(T['gone'], "low_swell", -24, 0.0, dur=0.9, pitch=0.7)
# Scribe: the phone shutter, solve ticks, the pen writing (the graph)
e(T['scribe'] + 0.4, "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['scribe'] + 0.41, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['scribeW'] + 0.25
while t < T['and2'] - 0.1: e(t, "scan_beep", -26, 0.15, pitch=1.6 + 0.02 * (k % 6), dur=0.07); t += 0.16; k += 1
t = T['and2']
while t < T['payoff'] - 0.3: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)

amb = [
    {"sound": "surf", "t0": 0.0, "t1": T['scribe'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -26, "args": {"size": 0.7}, "seed": 1},
    {"sound": "surf", "t0": T['scribe'], "t1": T['payoff'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -32, "args": {"size": 0.5}, "seed": 2},
    {"sound": "surf", "t0": T['payoff'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -27, "args": {"size": 0.6}, "seed": 3},
]
cues = {
    "title": "054 v2 - 24 hours without sleep (Vex, minimal MIDNIGHT TUTOR bed, 100 bpm A minor, pixel foley + Sarah)",
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
