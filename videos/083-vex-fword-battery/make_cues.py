#!/usr/bin/env python3
"""Cue sheet for 083 (Scribe lane, "Why your f*cking phone dies at 20%", Vex f-word explainer) -> cues.json.
python3 -I videos/083-vex-fword-battery/make_cues.py   then   python3 -I audio/synth.py 083-vex-fword-battery
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "DORM, 1:47 AM" — room tone, a lamp hum and a low fridge/AC hum under the hook (no music), a soft low-battery blip;
the music enters on "lithium": a dry pluck arpeggio (118 bpm, D minor: Dm7 → Bbmaj7 → F → C) with a soft kick + clap + shaker ticks
(minimal: the lane also posts the no-music cut). Foley: card pops + soft beeps on the callouts, tiny plips as the ions run, a zap
on "scrolling" (power), a needle tick on "voltage", a power-down drop + click each time a phone dies (hers, then Derek's, with a
cartoon boing), the charger chime on the stand, typing + the send click + pen scratches on the phone, taps on the Aa control and
on "Quick print", a fast scribble for the rewrite, a counter rolling the charge cycles, roof wind in the cold, a sizzle on
"cooks", chimes on her wink and on the end card. Voice (Fish "Dolly", regular pace) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(ions=B['ions']['t0'], lithium=W('ions', 'lithium'), charging=W('ions', 'charging'), shoves=W('ions', 'shoves'), scrolling=W('ions', 'scrolling'),
         guess=B['guess']['t0'], guessW=W('guess', 'guess'), reads=W('guess', 'reads'), voltage=W('guess', 'voltage'),
         dip=B['dip']['t0'], open=W('dip', 'open'), dips=W('dip', 'dips'), off=W('dip', 'off'), with_=W('dip', 'with'),
         derek=B['derek']['t0'], every=W('derek', 'every'), night=W('derek', 'night'), pivot=B['pivot']['t0'], cute=W('pivot', 'cute'),
         scribe=B['scribe']['t0'], scribeW=W('scribe', 'scribe'), writes=W('scribe', 'writes'), cell=W('scribe', 'cell'),
         swap=B['swap']['t0'], cant=W('swap', 'cant'), swapW=W('swap', 'swap'), age=B['age']['t0'], five=W('age', 'five'), eighty=W('age', 'eighty'),
         cold=B['cold']['t0'], heat=B['heat']['t0'], cooks=W('heat', 'cooks'), end=B['end']['t0'], phone=W('end', 'phone'))
T['card'] = T['phone'] + 0.55; T['dead'] = T['off']; T['derekDead'] = T['every']; T['send'] = T['scribeW'] + 0.12; T['page'] = T['writes'] - 0.08
T['tapAa'] = T['cant'] + 0.05; T['tapQP'] = T['swapW'] - 0.02; T['rewrite'] = T['swapW'] + 0.1
# the same cut list as shots.js SH
CUTS = [W('hook', 'twenty') - 0.12, T['ions'], T['charging'] - 0.06, T['guess'], T['reads'] - 0.35, T['dip'], T['dips'] - 0.05, T['with_'] - 0.12, T['derek'],
        T['every'] - 0.14, T['pivot'], T['scribe'], T['page'] - 0.04, T['cell'] - 0.12, T['swap'], T['swapW'] + 0.05, T['age'], T['five'] - 0.1, T['cold'], T['heat'], T['end']]

BPM = 118; BEAT = 60 / BPM
IN = T['lithium'] - 0.05                      # the music enters on "lithium"
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dm7', 'Bbmaj7', 'F', 'C']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dm7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2],
             "vel": [[IN, 0.25], [T['scribe'], 0.29], [T['age'], 0.26], [T['end'], 0.26], [D, 0.22]]}]
pad = [{"t0": IN - 0.3, "t1": D - 0.2, "notes": [38, 50, 57, 62, 65], "level": 3.0, "attack": 0.8, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 74, 0.26, 0.14], [round(a + 0.1, 3), 81, 0.28, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.15, 0.3, 0.15], "vel": 0.18, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.26, "boom"], [round(T['dead'], 3), 0.32, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -27, 0.0, pitch=1.7)
e(0.05, "pop", -22, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
e(0.35, "scan_beep", -24, -0.2, pitch=0.85, dur=0.16); e(0.55, "scan_beep", -26, -0.2, pitch=0.7, dur=0.2)        # the low-battery blip
t = T['lithium'] + 0.1
while t < T['guess'] - 0.3: e(t, "plip", -32, 0.25 * ((int(t * 4) % 3) - 1), pitch=1.1); t += 0.32               # the ions running
e(T['scrolling'] + 0.35, "zap", -26, 0.0, dur=0.5)                                                                  # "= power"
e(T['guessW'] + 0.05, "boing", -28, 0.0, pitch=1.3, dur=0.25)                                                      # the "?"
e(T['voltage'] + 0.02, "counter_tick", -21, 0.2)                                                                    # the needle
e(T['open'] + 0.05, "pop", -20, -0.1, pitch=1.2)                                                                    # the app opens
e(T['dips'] - 0.1, "low_swell", -25, 0.0, dur=1.1, pitch=0.8)
e(T['dead'] - 0.05, "pressure_drop", -17, 0.0, dur=1.0); e(T['dead'], "latch_click", -19, 0.0, kind="close", bright=0.9)   # her phone dies
e(T['derekDead'], "pressure_drop", -19, 0.15, dur=0.8); e(T['derekDead'] + 0.04, "latch_click", -21, 0.15, kind="close", bright=0.9)
e(T['derekDead'] + 0.12, "boing", -22, 0.15, pitch=0.6, dur=0.5); e(T['night'] + 0.25, "bonk", -26, 0.15)            # Derek: NOOO
e(T['pivot'] + 0.08, "gold_chime", -27, -0.2, notes=[76, 83], spacing=0.07, vel=0.2, dur=0.4)                         # the charger connects
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[86, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['scribe'] + 0.08, "keyboard_type", -23, 0.0, dur=round(T['send'] - T['scribe'] - 0.2, 2), rate=13.0)
e(T['send'] - 0.06, "latch_click", -18, 0.0, kind="close", bright=1.3); e(T['send'] - 0.02, "flash_swish", -25, 0.0, dur=0.2, peak=0.4)
t = T['page'] + 0.05
while t < T['tapAa'] - 0.3: e(t, "pen_scribble", -24, 0.0, dur=0.5); t += 0.5                                       # the page writing itself
e(T['tapAa'], "latch_click", -20, 0.1, kind="close", bright=1.4); e(T['tapQP'], "latch_click", -19, 0.1, kind="close", bright=1.5)
t = T['rewrite']
while t < T['rewrite'] + 1.45: e(t, "pen_scribble", -22, 0.0, dur=0.3); t += 0.25                                   # the rewrite in Quick print
t = T['five'] - 0.15
while t < T['eighty'] - 0.05: e(t, "counter_tick", -26, 0.25); t += 0.13                                           # cycles rolling
e(T['eighty'], "gold_chime", -27, 0.0, notes=[69, 76], spacing=0.06, vel=0.2, dur=0.4)
e(T['cold'] + 0.25, "breath", -24, 0.0)
e(T['cooks'] - 0.05, "sizzle", -20, 0.0, dur=0.9)
e(T['phone'] + 0.5, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[62, 69, 74], spacing=0.09, vel=0.28)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -38, "seed": 81},
    {"sound": "lamp_hum", "t0": 0.0, "t1": T['cold'], "fade_in": 0.2, "fade_out": 0.15, "gain_db": -42, "seed": 82},
    {"sound": "cabin_hum", "t0": 0.0, "t1": T['cold'], "fade_in": 0.3, "fade_out": 0.15, "gain_db": -36, "seed": 83},
    {"sound": "wind", "t0": T['cold'] - 0.05, "t1": T['heat'] + 0.1, "fade_in": 0.15, "fade_out": 0.2, "gain_db": -30, "args": {"darkness": 0.6, "gust": 0.6, "whistle": 0.12}, "seed": 84},
    {"sound": "lamp_hum", "t0": T['heat'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -42, "seed": 85},
    {"sound": "cabin_hum", "t0": T['heat'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -36, "seed": 86},
]
cues = {
    "title": "083 - why your f*cking phone dies at 20% (Vex f-word explainer, dorm at 1:47 AM bed, 118 bpm D minor pluck + Fish Dolly)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
# user, Nov 10: music from FRAME 1 (no quiet open on Scribe reels); every Vex reel plays the user's own CUTE track (tools/presets.json 'cute'; 1 = cute circus, 081 had ZOOM UP),
# entering on "lithium"; the synth score above is kept for reference only. ~8 dB under the voice.
cues['music'] = {'preset': 'cute', 'pick': 1, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -4.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
