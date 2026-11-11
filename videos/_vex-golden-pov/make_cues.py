#!/usr/bin/env python3
"""Cue sheet for 065 (Scribe lane, "POV: you brought your bio homework to the beach and goth mommy found you") -> cues.json.
python3 -I videos/065-vex-golden-bio/make_cues.py   then   python3 -I audio/synth.py 065-vex-golden-bio
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "GOLDEN HOUR" — shore surf + a light sea wind + far gulls alone under the hook, then a warm, lazy pluck arpeggio
(84 bpm, F major: Fmaj7 → Am7 → Dm7 → Bbmaj7) enters on the first "mommy" with a soft kick + rim + shaker; minimal (the lane also
posts the no-music cut). Foley: a pixel blip per cut, a breath + sparkle on every "mommy", the textbook slam (a thump + sand),
the phone shutter, solve ticks, the pen drawing the Punnett square, her kick in the shallows (a small splash). Voice on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(mommy1=W('hook', 'mommy'), roast=B['roast']['t0'], golden=W('roast', 'golden'), sand=W('roast', 'sand'), lab=W('roast', 'lab'),
         andR=W('roast', 'and'), pity=B['pity']['t0'], come=B['come']['t0'], close=W('come', 'close'), tease=B['tease']['t0'],
         mommy2=W('tease', 'mommys'), scribe=B['scribe']['t0'], scribeW=W('scribe', 'scribe'), and2=W('scribe', 'and'), even=W('scribe', 'even'),
         secret=B['secret']['t0'], notices=W('secret', 'notices'), relax=B['relax']['t0'], swim=B['swim']['t0'], mommy3=W('swim', 'mommy'),
         end=B['end']['t0'], recessive=W('end', 'recessive'), baby=W('end', 'baby'))
T['card'] = T['baby'] + 0.55
CUTS = [T['roast'], T['lab'] - 0.05, T['andR'] - 0.05, T['pity'], T['come'], T['close'] - 0.05, T['tease'], T['scribe'], T['scribeW'] - 0.05,
        T['and2'] - 0.05, T['even'] - 0.05, T['secret'], T['relax'], T['swim'], T['end']]

# ---------------------------------------------------------------- music: "GOLDEN HOUR" (84 bpm, F major), enters on the first "mommy"
BPM = 84; BEAT = 60 / BPM
IN = T['mommy1'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Fmaj7', 'Am7', 'Dm7', 'Bbmaj7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Fmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2],
             "vel": [[IN, 0.24], [T['scribe'], 0.28], [T['relax'], 0.25], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [41, 53, 57, 60, 64], "level": 3.2, "attack": 1.6, "release": 1.2, "cutoff": 750, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 72, 0.28, 0.14], [round(a + 0.1, 3), 79, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.24, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.25], "vel": 0.22, "kind": "tick"}]
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
for m in (T['mommy1'], T['mommy2'], T['mommy3']):
    e(m - 0.45, "breath", -22, 0.0, dur=0.55, inhale=True)
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[84, 91], spacing=0.06, vel=0.22, dur=0.5)
e(T['baby'] + 0.05, "gold_chime", -25, 0.1, notes=[79, 84, 91], spacing=0.08, vel=0.24, dur=0.6)   # the blown kiss
e(T['golden'] + 0.1, "gull_cry", -30, -0.4, pitch=1.0)                                          # "golden hour"
e(T['andR'], "low_swell", -26, 0.0, dur=0.8, pitch=0.7)                                        # "...still on question one"
e(T['pity'] + 0.1, "low_swell", -25, 0.0, dur=1.0, pitch=0.85)                                  # "aww"
e(T['close'] + 0.3, "knock", -18, -0.1, pitch=0.8); e(T['close'] + 0.33, "crumble", -27, -0.1)  # the textbook slams, sand puffs
e(T['mommy2'] + 0.35, "boing", -27, 0.0, pitch=1.2, dur=0.3)                                    # the wink
e(T['scribe'] + 0.45, "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['scribe'] + 0.46, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['scribeW'] + 0.25
while t < T['and2'] - 0.1: e(t, "scan_beep", -27, 0.15, pitch=1.6 + 0.02 * (k % 6), dur=0.07); t += 0.16; k += 1
t = T['and2']
while t < T['secret'] - 0.3: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
e(T['notices'] + 0.1, "breath", -24, 0.0, dur=0.6, inhale=False)                               # "shh"
e(T['relax'] + 0.6, "gull_cry", -31, 0.4, pitch=0.9)
e(T['recessive'] + 0.05, "splash", -22, 0.1, size=0.35)                                         # her kick in the shallows
e(T['card'], "gold_chime", -23, 0.0, notes=[65, 72, 77], spacing=0.09, vel=0.28)

amb = [
    {"sound": "surf", "t0": 0.0, "t1": T['scribe'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -26, "args": {"size": 0.65}, "seed": 1},
    {"sound": "surf", "t0": T['scribe'], "t1": T['secret'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -32, "args": {"size": 0.5}, "seed": 2},
    {"sound": "surf", "t0": T['secret'], "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -25, "args": {"size": 0.7}, "seed": 3},
    {"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.4, "fade_out": 0.8, "gain_db": -38, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 4},
]
cues = {
    "title": "065 - golden-hour bio (Vex, minimal GOLDEN HOUR bed, 84 bpm F major pluck, shore surf + gulls, pixel foley + Fish Mommy ASMR)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
# user, Nov 10: music from FRAME 1 (no quiet open on Scribe reels) and every Vex reel plays the user's own CUTE
# track (tools/presets.json 'cute'); the synth score above is kept for reference only. ~8 dB under the voice.
cues['music'] = {'preset': 'cute', 'pick': 1, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -2.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
