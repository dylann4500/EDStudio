#!/usr/bin/env python3
"""Cue sheet for 079 (Scribe lane, "A spaceship from 1977 is about to be one light-day away", Vex explainer) -> cues.json.
python3 -I videos/079-vex-voyager/make_cues.py   then   python3 -I audio/synth.py 079-vex-voyager
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "DEEP SPACE STATION" — a desert overlook at dusk carries it (a dry wind, crickets, the station's low hum) under the
hook; deep space is near silence with a low swell. A slow, dreamy pluck arpeggio (92 bpm, D major: Dmaj7 → Bm7 → Gmaj7 → A) enters
on "It's Voyager One" with a soft kick + a brushed tick; minimal (the lane also posts the no-music cut). Foley: card pops, soft radio
pings when the probe transmits and when the big dish listens, the dish slewing (a metal groan + clunks), the hours ticking on the
light-day card, a lamp click for the fridge bulb, tablet typing + the send pop, pen scratches while the pages write themselves, a
switch click for dark mode, little pops for the greetings off the golden record, chimes on the record + the end card.
Voice (Fish "Dolly", less-breathy) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(gets=W('hook', 'gets'), saying=W('hook', 'saying'), hi=W('hook', 'hi'),
         lightday=B['lightday']['t0'], voyager=W('lightday', 'voyager'), on=W('lightday', 'on'), sixteen=W('lightday', 'sixteen'), even=W('lightday', 'even'),
         twentyfour=W('lightday', 'twentyfour'), dish=B['dish']['t0'], dishes=W('dish', 'dishes'), seventy=W('dish', 'seventy'),
         radio=B['radio']['t0'], about=W('radio', 'about'), what=W('radio', 'what'), less=W('radio', 'less'), watt=W('radio', 'watt'),
         pivot=B['pivot']['t0'], still=W('pivot', 'still'), you=W('pivot', 'you'), cute=W('pivot', 'cute'),
         scribe=B['scribe']['t0'], ld2=W('scribe', 'lightday'), hand=W('scribe', 'handwriting'), both=W('scribe', 'both'), dark=W('scribe', 'dark'), obviously=W('scribe', 'obviously'),
         record=B['record']['t0'], golden=W('record', 'golden'), hello=W('record', 'hello'), anyone=W('record', 'anyone'),
         end=B['end']['t0'], every=W('end', 'every'), until=W('end', 'until'), im=W('end', 'im'), listening=W('end', 'listening'))
T['card'] = T['listening'] + 0.62
# the shot list (start, place) — mirrors shots.js SH
SHOTS = [(0, 'st'), (T['gets'] - 0.05, 'sp'), (T['saying'] - 0.05, 'st'), (T['lightday'], 'sp'), (T['on'] - 0.05, 'st'), (T['sixteen'] - 0.05, 'sp'),
         (T['even'] - 0.05, 'st'), (T['dish'], 'st'), (T['dishes'] - 0.04, 'st'), (T['seventy'] - 0.05, 'st'), (T['radio'], 'sp'), (T['about'] - 0.05, 'st'),
         (T['what'] - 0.05, 'st'), (T['less'] - 0.05, 'st'), (T['pivot'], 'sp'), (T['you'] - 0.04, 'st'), (T['cute'] - 0.08, 'st'), (T['scribe'], 'st'),
         (T['ld2'] - 0.06, 'st'), (T['hand'] - 0.04, 'st'), (T['both'] - 0.04, 'st'), (T['dark'] - 0.05, 'st'), (T['record'], 'sp'), (T['golden'] - 0.05, 'sp'),
         (T['anyone'] - 0.05, 'sp'), (T['end'], 'st'), (T['until'] - 0.05, 'st'), (T['im'] - 0.05, 'st')]
CUTS = [s[0] for s in SHOTS[1:]]
def spans(kind):
    out = []
    for i, (t0, k) in enumerate(SHOTS):
        t1 = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else D
        if k != kind: continue
        if out and abs(out[-1][1] - t0) < 1e-6: out[-1][1] = t1
        else: out.append([t0, t1])
    return out

BPM = 92; BEAT = 60 / BPM
IN = T['lightday'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dmaj7', 'Bm7', 'Gmaj7', 'A']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2],
             "vel": [[IN, 0.2], [T['dish'], 0.25], [T['scribe'], 0.26], [T['record'], 0.23], [T['end'], 0.22], [D, 0.18]]}]
pad = [{"t0": 0.3, "t1": D - 0.2, "notes": [38, 50, 57, 62, 66], "level": 3.2, "attack": 2.2, "release": 1.4, "cutoff": 760, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 78, 0.26, 0.14], [round(a + 0.1, 3), 85, 0.28, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.34, "kind": "kick"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.3, 0.16], "vel": 0.18, "kind": "tick"}]
drums = [[round(IN, 3), 0.28, "boom"], [round(T['scribe'], 3), 0.24, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -8.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -29, 0.0, pitch=1.7)
e(0.05, "pop", -22, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -26, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['voyager'], T['on'], T['even'], T['seventy'], T['about'], T['less'], T['pivot'], T['end']): e(t0 + 0.02, "pop", -21, 0.0, pitch=1.05)   # a diagram card lands
e(0.9, "scan_beep", -34, -0.2, pitch=0.9, dur=0.18); e(2.6, "scan_beep", -35, 0.2, pitch=0.9, dur=0.18)                 # the station's far pings under the hook
e(T['gets'] - 0.05, "flash_swish", -25, 0.0, dur=1.4, peak=0.6); e(T['gets'], "low_swell", -26, 0.0, dur=1.6, pitch=0.8)   # the probe drifts off
e(T['hi'], "gold_chime", -28, 0.15, notes=[88, 93], spacing=0.07, vel=0.2, dur=0.5)                                         # her little wave
e(T['sixteen'] - 0.05, "low_swell", -24, 0.0, dur=1.6, pitch=0.6)                                                           # the pull-back
t = T['even'] + 0.3
while t < T['dish'] - 0.2: e(t, "counter_tick", -30, 0.1, bright=0.8); t += 0.11                                            # the hours on the light card
e(T['dishes'] - 0.05, "metal_groan", -25, -0.1, dur=1.6, pitch=0.7)                                                         # the big dish slews
for i in range(3): e(T['dishes'] + 0.15 + i * 0.4, "clunk", -27, 0.1, size=0.9, metal=0.9)
e(T['seventy'], "low_swell", -27, 0.0, dur=1.2, pitch=0.9)
t = T['radio'] + 0.1
while t < T['about'] - 0.1: e(t, "scan_beep", -29, 0.0, pitch=1.9, dur=0.08); t += 0.42                                     # the probe transmits
e(T['about'] + 0.05, "lamp_switch_click", -20, 0.2)                                                                         # the fridge bulb
t = T['what'] + 0.1
while t < T['less'] - 0.1: e(t, "scan_beep", -33, -0.1, pitch=1.6, dur=0.07); t += 0.5                                      # the faint signal arriving at the dish
t = T['less'] + 0.2
while t < T['watt'] + 0.1: e(t, "counter_tick", -31, 0.0, bright=1.0); t += 0.09                                           # the zeros typing in
e(T['pivot'], "low_swell", -27, 0.0, dur=1.8, pitch=0.75)
t = T['you'] + 0.12
while t < T['cute'] - 0.4: e(t, "keyboard_type", -27, 0.15, dur=0.5, rate=12.0); t += 0.5                                   # typing on the tablet
e(T['cute'] - 0.3, "pop", -18, 0.0, pitch=1.4)                                                                              # send
e(T['cute'] + 0.1, "gold_chime", -26, 0.1, notes=[88, 95], spacing=0.06, vel=0.22, dur=0.5)
t = T['scribe'] + 0.15
while t < T['record'] - 0.3: e(t, "pen_scribble", -24, 0.0, dur=0.6); t += 0.6                                             # the pages write themselves
e(T['both'], "flash_swish", -27, 0.0, dur=0.35, peak=0.4)                                                                   # scroll to page 2
e(T['dark'] + 0.22, "lamp_switch_click", -18, 0.1); e(T['dark'] + 0.3, "low_swell", -27, 0.0, dur=1.0, pitch=0.7)          # dark mode
e(T['golden'], "gold_chime", -24, 0.0, notes=[81, 88, 93], spacing=0.08, vel=0.26, dur=1.2)
for i in range(6): e(T['hello'] - 0.1 + i * 0.28, "pop", -22, -0.3 + i * 0.12, pitch=1.1 + 0.1 * i)                        # greetings pop off the record
e(T['anyone'] - 0.05, "low_swell", -25, 0.0, dur=2.0, pitch=0.6)
e(T['end'] + 0.3, "pressure_drop", -30, 0.0, dur=1.6)                                                                       # the battery drains a little
t = T['until']
while t < T['im'] - 0.1: e(t + 0.05, "scan_beep", -32, 0.0, pitch=1.5, dur=0.08); t += 0.45                                  # still listening
e(T['listening'] + 0.1, "gold_chime", -25, 0.1, notes=[86, 90, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[62, 69, 74], spacing=0.09, vel=0.28)

amb = []
for i, (a, b) in enumerate(spans('st')):
    amb += [{"sound": "wind", "t0": a, "t1": b, "fade_in": 0.12, "fade_out": 0.12, "gain_db": -34, "args": {"darkness": 0.75, "gust": 0.3, "whistle": 0.05}, "seed": 51 + i},
            {"sound": "crickets", "t0": a, "t1": b, "fade_in": 0.12, "fade_out": 0.12, "gain_db": -38, "seed": 71 + i},
            {"sound": "lamp_hum", "t0": a, "t1": b, "fade_in": 0.12, "fade_out": 0.12, "gain_db": -44, "seed": 91 + i}]
for i, (a, b) in enumerate(spans('sp')):
    amb += [{"sound": "room_tone", "t0": a, "t1": b, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -42, "seed": 111 + i}]
cues = {
    "title": "079 - Voyager 1 one light-day away (Vex explainer, DEEP SPACE STATION bed, 92 bpm D major pluck, desert dusk + pings + Fish Dolly)",
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
cues['music'] = {'preset': 'cute', 'pick': 1, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -4.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
