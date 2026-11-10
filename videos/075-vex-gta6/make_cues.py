#!/usr/bin/env python3
"""Cue sheet for 075 (Scribe lane, "Why GTA 6 took 13 years", Vex explainer) -> cues.json.
python3 -I videos/075-vex-gta6/make_cues.py   then   python3 -I audio/synth.py 075-vex-gta6
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "NEON STRIP" — a sunset synthwave-ish bed (110 bpm, A minor: Am7 → Fmaj7 → C → G) with a pluck arpeggio, a soft
four-on-the-floor kick, claps on 2 and 4 and 16th ticks; under it the places carry the sound: surf + far traffic + gulls on the beach
strip, a stage's HVAC fan + room tone in the capture volume. Foley: the coupe passing the lens, punch thumps on the sparring actors,
the stunt actor's thud on the crash mat, pixel pops per diagram card, a counter ticking while the staff icons fill, pen scratches
while the page writes on the phone, two taps in the pen picker, faster scratches for the purple rewrite, coin-ish ticks as the
bill stacks rise, the $1B counter rolling, a chime on the end card. Voice (Fish "Dolly", less-breathy) on top. Minimal: the lane
also posts the no-music cut."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(thirteen=W('hook', 'thirteen'), heres=W('hook', 'heres'), team=B['team']['t0'], nearly=W('team', 'nearly'),
         mocap=B['mocap']['t0'], suits=W('mocap', 'suits'), theres=W('mocap', 'theres'), just=W('mocap', 'just'),
         pivot=B['pivot']['t0'], your=W('pivot', 'your'), handwritten=W('pivot', 'handwritten'), rude=W('pivot', 'rude'),
         scribe=B['scribe']['t0'], chart=W('scribe', 'chart'), dont=W('scribe', 'dont'), sw=W('scribe', 'switch'), purple=W('scribe', 'purple'),
         page=W('scribe', 'page'), money=B['money']['t0'], over=W('money', 'over'), gta5=W('money', 'gta'), end=B['end']['t0'],
         billion=W('end', 'billion'), see=W('end', 'see'), nineteenth=W('end', 'nineteenth'))
T['card'] = T['nineteenth'] + 0.6
T['fall'] = T['nearly'] + 0.5
T['close'] = T['purple'] - 0.05
kS, kE = T['dont'] - 0.1, T['close']
# the same cut list as shots.js (phone → phone changes are not cuts)
CUTS = [T['thirteen'] - 0.05, T['heres'] - 0.1, T['nearly'] - 0.1, T['mocap'], T['suits'] - 0.12, T['theres'] - 0.1, T['just'] - 0.1,
        T['pivot'], T['handwritten'] - 0.12, T['scribe'], T['money'], T['gta5'] - 0.1, T['end']]
STRIP = [(0, T['heres'] - 0.1), (T['just'] - 0.1, T['pivot']), (T['money'], D)]

BPM = 110; BEAT = 60 / BPM
IN = 0.0
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Am7', 'Fmaj7', 'C', 'G']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Am7'])
sections = [{"t0": 0.0, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 1, 2, 3, 2, 1, 2, 3],
             "vel": [[0.0, 0.2], [T['heres'], 0.24], [T['scribe'], 0.27], [T['end'], 0.24], [D, 0.2]]}]
pad = [{"t0": 0.1, "t1": D - 0.2, "notes": [45, 57, 64, 67, 72], "level": 3.0, "attack": 1.2, "release": 1.2, "cutoff": 820, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.28, 0.14], [round(a + 0.1, 3), 81, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": 0.0, "t1": END_D, "step": BEAT, "pattern": [1], "vel": 0.36, "kind": "kick"},
                 {"t0": BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": 0.0, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.15, 0.3, 0.15], "vel": 0.18, "kind": "tick"}]
drums = [[round(T['heres'] - 0.1, 3), 0.28, "boom"], [round(T['scribe'], 3), 0.3, "boom"], [round(T['money'], 3), 0.26, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -26, 0.0, pitch=1.7)
e(0.05, "pop", -21, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
e(2.2, "car_pass", -22, 0.5, dur=1.6, size=0.9)                                                                   # the coupe passing the lens
for t0 in (T['thirteen'], T['nearly'], T['money'] + 0.2, T['billion']): e(t0 + 0.02, "pop", -20, 0.0, pitch=1.05)    # a diagram card lands
t = T['thirteen'] + 0.1
while t < T['thirteen'] + 1.8: e(t, "scan_beep", -31, 0.0, pitch=1.6, dur=0.025); t += 0.14                         # the years bar filling
t = T['nearly'] + 0.1
while t < T['nearly'] + 2.2: e(t, "scan_beep", -31, 0.0, pitch=1.7, dur=0.025); t += 0.09                           # staff icons filling
e(T['fall'] + 0.5, "knock", -21, -0.3, pitch=0.55); e(T['fall'] + 0.52, "blanket_rustle", -24, -0.3, dur=0.4, intensity=0.6)   # thud on the mat
for n in range(14, 21):                                                                                            # punches land (same clock as shots.js)
    th = -9.3 + 1.4 * n + 0.08
    if T['mocap'] <= th < T['suits'] - 0.12: e(th, "bonk", -25, 0.1, dur=0.25)
e(T['suits'] + 0.1, "low_swell", -27, 0.0, dur=1.0, pitch=1.1)
e(T['just'] + 0.05, "pop", -22, 0.0, pitch=1.4); e(T['just'] + 0.25, "pop", -23, 0.1, pitch=1.5)               # NPC tags pop
e(T['rude'] + 0.05, "boing", -27, 0.0, pitch=1.15, dur=0.3)
t = T['scribe'] + 0.15
while t < T['dont'] - 0.1: e(t, "pen_scribble", -24, 0.0, dur=0.6); t += 0.6                                    # the page writing itself on screen
e(kS + 0.02, "flash_swish", -26, 0.0, dur=0.2, peak=0.35)                                                          # the popover opens
for u in (0.37, 0.61): e(kS + u * (kE - kS), "latch_click", -19, 0.0, kind="close", bright=1.5)                     # tap Fountain pen, tap Purple
t = T['close'] + 0.05
while t < T['page'] - 0.15: e(t, "pen_scribble", -23, 0.0, dur=0.4); t += 0.38                                  # the purple rewrite (faster)
t = T['over'] - 0.15
while t < T['over'] + 0.8: e(t, "scan_beep", -30, 0.2, pitch=1.9, dur=0.02); t += 0.07                           # bills stacking
e(T['gta5'] + 0.1, "gold_chime", -27, -0.1, notes=[79, 84], spacing=0.06, vel=0.2, dur=0.4)
t = T['billion'] + 0.05
while t < T['billion'] + 1.4: e(t, "scan_beep", -31, 0.0, pitch=1.8, dur=0.02); t += 0.06                        # the $1B counter rolling
e(T['billion'] + 1.45, "gold_chime", -24, 0.0, notes=[81, 88], spacing=0.07, vel=0.24, dur=0.5)
e(T['nineteenth'] + 0.2, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)
for t0 in (1.0, T['money'] + 1.4, T['end'] + 1.0): e(t0, "gull_cry", -31, -0.4, pitch=1.1)

amb = []
for i, (a, b) in enumerate(STRIP):
    amb.append({"sound": "surf", "t0": a, "t1": b, "fade_in": 0.15, "fade_out": 0.15, "gain_db": -31, "args": {"size": 0.7}, "seed": 31 + i})
    amb.append({"sound": "traffic_flow", "t0": a, "t1": b, "fade_in": 0.15, "fade_out": 0.15, "gain_db": -36, "args": {"density": 0.4}, "seed": 41 + i})
for i, (a, b) in enumerate([(T['heres'] - 0.1, T['just'] - 0.1), (T['pivot'], T['money'])]):
    amb.append({"sound": "fan", "t0": a, "t1": b, "fade_in": 0.15, "fade_out": 0.15, "gain_db": -36, "seed": 51 + i})
amb.append({"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -40, "seed": 24})
cues = {
    "title": "075 - why GTA 6 took 13 years (Vex explainer, NEON STRIP bed, 110 bpm A minor pluck, surf/traffic + stage fan, Fish Dolly)",
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
