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

T = dict(tell1=B['tell1']['t0'], more=W('tell1', 'more'), handwritten=W('tell1', 'handwritten'), and1=W('tell1', 'and'), crime=W('tell1', 'crime'),
         tell2=B['tell2']['t0'], em=W('tell2', 'em'), dashes=W('tell2', 'dashes'), delve=W('tell2', 'delve'), nobody=W('tell2', 'nobody'),
         tell3=B['tell3']['t0'], d1=W('tell3', 'd'), d2=W('tell3', 'd', 2), hundred=W('tell3', 'hundred'), overnight=W('tell3', 'overnight'),
         turn=B['turn']['t0'], scribe=B['scribe']['t0'], then=W('scribe', 'then'), snap=W('scribe', 'snap'), it=W('scribe', 'it'), solves=W('scribe', 'solves'), and2=W('scribe', 'and'),
         messy=W('scribe', 'your', 3), payoff=B['payoff']['t0'], your=W('payoff', 'your'), perfect=W('payoff', 'perfect'), end=B['end']['t0'], me=W('end', 'me'),
         let=W('hook', 'let'), babe=W('hook', 'babe'))
T['card'] = T['me'] + 0.35
CUTS = [T['tell1'], T['more'] - 0.05, T['and1'] - 0.05, T['tell2'], T['em'] - 0.05, T['nobody'] - 0.05, T['tell3'], T['overnight'] - 0.05, T['turn'], T['scribe'],
        T['then'] - 0.05, T['it'] - 0.05, T['and2'] - 0.05, T['messy'] - 0.05, T['payoff'], T['your'] - 0.05, T['perfect'] - 0.05, T['end']]

# ---------------------------------------------------------------- music: minimal "MIDNIGHT TUTOR" (100 bpm, A minor)
BPM = 100; BEAT = 60 / BPM
IN = T['let'] - 0.05
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
e(T['babe'] - 0.35, "breath", -22, 0.0, dur=0.6, inhale=True)
# tell 1: chalk underline, the crime scene
e(T['handwritten'] + 0.02, "chalk_write", -20, -0.1, dur=0.35, strokes=2)
e(T['crime'], "knock", -16, -0.2); e(T['crime'] + 0.12, "knock", -17, 0.2)
e(T['crime'] + 0.05, "siren", -30, 0.4, dur=0.9, cycles=0.6)
# tell 2: phone taps, highlighter pops on the em dashes, the circle round "delve", the meter alarm
e(T['tell2'] + 0.4, "plip", -24, 0.2); e(T['tell2'] + 0.65, "plip", -25, 0.2)
for k in range(3): e(T['em'] + 0.25 + k * 0.3, "pop", -19, -0.2 + 0.2 * k, pitch=1.1 + 0.1 * k)
e(T['delve'], "pen_scribble", -18, 0.0, dur=0.4)
e(T['nobody'] - 0.35, "alarm_beep", -27, 0.1)
# tell 3: chalk grades + the "?!" boing
for k in ('d1', 'd2'): e(T[k], "chalk_write", -18, 0.0, dur=0.32, strokes=2)
e(T['hundred'], "chalk_write", -17, 0.1, dur=0.4, strokes=3); e(T['hundred'] + 0.35, "boing", -20, 0.2, pitch=1.2, dur=0.45)
# the turn: a close whisper
e(T['turn'] - 0.25, "breath", -20, 0.0, dur=0.7, inhale=True)
e(T['turn'], "low_swell", -24, 0.0, dur=1.3, pitch=1.2)
# Scribe: practice page, the snap, solving ticks, the pen writing
for k in range(5): e(T['scribe'] + 0.15 + k * 0.62, "pen_scribble", -22, -0.1, dur=0.55)
e(T['snap'], "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['snap'] + 0.01, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['solves']
while t < T['and2'] - 0.1: e(t, "scan_beep", -26, 0.15, pitch=1.6 + 0.02 * (k % 6), dur=0.07); t += 0.16; k += 1
t = T['and2']
while t < T['payoff'] - 0.3: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
# payoff: paper slide, the magnifier, PERFECT MATCH
e(T['payoff'] + 0.15, "flash_swish", -22, -0.2, dur=0.4, peak=0.3)
e(T['perfect'] + 0.05, "gold_chime", -21, 0.1, notes=[81, 84, 88], spacing=0.07, vel=0.3)
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)

amb = [
    {"sound": "surf", "t0": 0.0, "t1": T['tell1'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -26, "args": {"size": 0.7}, "seed": 1},
    {"sound": "room_tone", "t0": T['tell1'], "t1": T['tell2'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "seed": 2},
    {"sound": "room_tone", "t0": T['tell2'], "t1": T['tell3'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 3},
    {"sound": "clock", "t0": T['tell2'], "t1": T['tell3'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -38, "pan": 0.2, "seed": 4},
    {"sound": "kids_laugh", "t0": T['tell3'], "t1": T['turn'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -40, "seed": 5},
    {"sound": "room_tone", "t0": T['turn'], "t1": T['payoff'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "seed": 6},
    {"sound": "clock", "t0": T['turn'], "t1": T['payoff'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -40, "pan": -0.2, "seed": 7},
    {"sound": "room_tone", "t0": T['payoff'], "t1": T['end'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "seed": 8},
    {"sound": "surf", "t0": T['end'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -27, "args": {"size": 0.6}, "seed": 9},
]
cues = {
    "title": "054 - Scribe promo: goth cheat-tutor (minimal MIDNIGHT TUTOR bed, 100 bpm A minor, pixel foley + Sarah)",
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
