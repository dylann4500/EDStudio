#!/usr/bin/env python3
"""Cue sheet for 077 (Scribe lane, "How to catch a rocket with chopsticks", Vex explainer) -> cues.json.
python3 -I videos/077-vex-rocket-catch/make_cues.py   then   python3 -I audio/synth.py 077-vex-rocket-catch
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "LAUNCH BEACH" — the viewing beach at sunset carries it (surf + a soft sea wind + a crowd murmur + gull cries) under
the hook; a warm, upbeat pluck arpeggio (112 bpm, E minor: Em7 → Cmaj7 → G → D) enters on "this tower is the catcher" with a soft
kick + clap + shaker; minimal (the lane also posts the no-music cut). Foley: card pops, the arms' steel clank on every catch with a
crowd cheer swelling after it, the booster's double sonic boom as it falls back, rocket rumble + steam hiss for the landing burns,
space = near silence + a low swell, the reentry plasma = a fire roar, orbit ticks, phone typing + the send pop, pen scratches while
the page writes itself, a chime on the end card. Voice (Fish "Dolly", less-breathy) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(tower=B['tower']['t0'], its=W('tower', 'its'), chop2=W('tower', 'chopsticks'), booster=B['booster']['t0'], half=W('booster', 'half'),
         s72=W('booster', 'seventytwo'), t33=W('booster', 'thirtythree'), falls=W('booster', 'falls'), brakes=W('booster', 'brakes'),
         slides=W('booster', 'slides'), armsB=W('booster', 'arms'), catches=B['catches']['t0'], three=W('catches', 'three'),
         ship=B['ship']['t0'], circles=W('ship', 'circles'), times=W('ship', 'times'), then=W('ship', 'then'), pivot=B['pivot']['t0'],
         your=W('pivot', 'your'), friday=W('pivot', 'friday'), cute=W('pivot', 'cute'), scribe=B['scribe']['t0'], hand=W('scribe', 'handwriting'),
         want=W('scribe', 'want'), ask=W('scribe', 'ask'), flip=B['flip']['t0'], flips=W('flip', 'flips'), fand=W('flip', 'and'),
         fcatch=W('flip', 'catch'), end=B['end']['t0'], refuel=W('end', 'refuel'), fly=W('end', 'fly'), ill=W('end', 'ill'), beach=W('end', 'beach'))
T['card'] = T['beach'] + 0.55
CUTS = [T['tower'] - 1.23, T['tower'], T['its'] - 0.05, T['chop2'] - 0.05, T['booster'], T['s72'] - 0.05, T['t33'] - 0.1, T['falls'] - 0.06,
        T['brakes'] - 0.04, T['slides'] - 0.04, T['catches'], T['ship'], T['circles'] - 0.05, T['then'] - 0.05, T['pivot'], T['your'] - 0.04,
        T['cute'] - 0.08, T['scribe'], T['flip'], T['flips'] - 0.05, T['fand'] - 0.04, T['end'], T['ill'] - 0.05]

BPM = 112; BEAT = 60 / BPM
IN = T['tower'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Em7', 'Cmaj7', 'G', 'D']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Em7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 1, 2, 3, 2, 1, 2, 3],
             "vel": [[IN, 0.22], [T['falls'], 0.27], [T['scribe'], 0.26], [T['end'], 0.24], [D, 0.2]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [40, 52, 59, 64, 67], "level": 3.0, "attack": 1.8, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.28, 0.14], [round(a + 0.1, 3), 83, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.38, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.35, 0.18], "vel": 0.2, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.28, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -27, 0.0, pitch=1.7)
e(0.05, "pop", -21, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['s72'], T['three'], T['circles'], T['end']): e(t0 + 0.02, "pop", -20, 0.0, pitch=1.05)                     # a diagram card lands
e(T['tower'] - 1.1, "metal_groan", -28, -0.1, dur=1.0)                                                                 # the arms chopping
for i in range(3): e(T["tower"] - 1.0 + i * 0.36, "clunk", -26, 0.1, size=0.7, metal=0.9)
e(T['chop2'] + 0.5, "metal_clang", -22, 0.0, size=0.8, pitch=1.1)                                                       # the arms close
e(T['half'], "low_swell", -26, 0.0, dur=1.0, pitch=1.2)                                                                # the ship lifts off the booster
for i in range(3): e(T['t33'] + i * 0.22, "whoomp", -24 + i, 0.0, size=0.5 + 0.15 * i)                                 # 33 engines ripple alight
e(T['falls'] + 0.05, "distant_boom", -16, -0.2, dur=1.6, size=0.8); e(T['falls'] + 0.45, "distant_boom", -18, 0.2, dur=1.6, size=0.7)   # the double sonic boom
e(T['falls'], "flash_swish", -24, 0.0, dur=0.8, peak=0.5)                                                               # falling past the clouds
e(T['armsB'], "metal_clang", -15, 0.0, size=1.4, pitch=0.8); e(T['armsB'] + 0.02, "kick", -18)                           # caught
e(T['armsB'] + 0.15, "hiss", -24, 0.1, dur=2.0)
t = T['circles'] + 0.1
while t < T['times'] + 0.4: e(t, "scan_beep", -31, 0.0, pitch=1.6, dur=0.03); t += 0.14                                   # the orbit counter
e(T['circles'] - 0.05, "low_swell", -24, 0.0, dur=2.2, pitch=0.7)
e(T['then'] - 0.05, "whoomp", -18, 0.0, size=1.2)                                                                       # reentry
t = T['your'] + 0.1
while t < T['friday'] - 0.4: e(t, "keyboard_type", -27, 0.15, dur=0.5, rate=12.0); t += 0.5                               # typing on the phone
e(T['friday'] - 0.15, "pop", -18, 0.0, pitch=1.4)                                                                        # send
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[88, 95], spacing=0.06, vel=0.22, dur=0.5)
t = T['scribe'] + 0.05
while t < T['want'] - 0.3: e(t, "pen_scribble", -24, 0.0, dur=0.6); t += 0.6                                             # the page writes itself on screen
t = T['want'] + 0.3
while t < T['ask'] - 0.2: e(t, "keyboard_type", -27, 0.15, dur=0.5, rate=13.0); t += 0.5
e(T['ask'] - 0.1, "pop", -17, 0.0, pitch=1.45); e(T['ask'] + 0.1, "flash_swish", -24, 0.0, dur=0.3, peak=0.4)
t = T['ask'] + 0.6
while t < T['flip'] - 0.4: e(t, "pen_scribble", -24, 0.0, dur=0.6); t += 0.6
e(T['flip'] + 0.1, "flash_swish", -22, 0.0, dur=1.6, peak=0.45)                                                         # belly flop falling
e(T['flips'] + 0.2, "whoomp", -17, 0.0, size=1.1)                                                                       # engines relight for the flip
e(T['fcatch'], "metal_clang", -14, 0.0, size=1.5, pitch=0.75); e(T['fcatch'] + 0.02, "kick", -17)
e(T['fcatch'] + 0.2, "hiss", -24, -0.1, dur=2.0)
for i, t0 in enumerate((T['end'], T['refuel'], T['fly'])): e(t0 + 0.03, "pop", -21, 0.0, pitch=1.2 + 0.15 * i)
for i, t0 in enumerate((0.9, 9.3, 34.0, 50.8)): e(t0, "gull_cry", -30, -0.4 + 0.25 * i, pitch=1.0 + 0.06 * i)
e(T['beach'] + 0.1, "gold_chime", -25, 0.1, notes=[83, 88, 95], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[64, 71, 76], spacing=0.09, vel=0.28)

beach = [(0.0, T['booster']), (T['s72'] - 0.05, T['t33'] - 0.1), (T['catches'], T['circles'] - 0.05), (T['pivot'], D)]
amb = [{"sound": "surf", "t0": a, "t1": b, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -30, "args": {"size": 0.8}, "seed": 31 + i} for i, (a, b) in enumerate(beach)]
amb += [{"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -36, "args": {"darkness": 0.7, "gust": 0.35, "whistle": 0.0}, "seed": 41},
        {"sound": "crowd_cheer", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -40, "args": {"excite": 0.25}, "seed": 42},
        {"sound": "crowd_cheer", "t0": T['armsB'] + 0.1, "t1": T['armsB'] + 3.0, "fade_in": 0.2, "fade_out": 1.0, "gain_db": -27, "args": {"excite": 1.0}, "seed": 43},
        {"sound": "crowd_cheer", "t0": T['fcatch'] + 0.1, "t1": T['fcatch'] + 3.2, "fade_in": 0.2, "fade_out": 1.0, "gain_db": -27, "args": {"excite": 1.0}, "seed": 44},
        {"sound": "rocket_rumble", "t0": T['brakes'] - 0.1, "t1": T['armsB'] + 0.3, "fade_in": 0.15, "fade_out": 0.3, "gain_db": -24, "args": {"rise": 0.3}, "seed": 45},
        {"sound": "rocket_rumble", "t0": T['flips'] + 0.1, "t1": T['fcatch'] + 0.3, "fade_in": 0.15, "fade_out": 0.3, "gain_db": -24, "args": {"rise": 0.3}, "seed": 46},
        {"sound": "fire", "t0": T['then'] - 0.05, "t1": T['pivot'], "fade_in": 0.15, "fade_out": 0.2, "gain_db": -27, "args": {"size": 1.0}, "seed": 47},
        {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -40, "seed": 48}]
cues = {
    "title": "077 - how to catch a rocket with chopsticks (Vex explainer, LAUNCH BEACH bed, 112 bpm E minor pluck, surf + crowd + booms + Fish Dolly)",
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
