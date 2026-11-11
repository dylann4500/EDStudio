#!/usr/bin/env python3
"""Cue sheet for 074 (Scribe lane, "What if it rained homework?", Vex in a what-if sim) -> cues.json.
python3 -I videos/074-vex-sim-homework-rain/make_cues.py   then   python3 -I audio/synth.py 074-vex-sim-homework-rain
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "PAPER STORM", sound-design led. The beach opens quiet (surf, a gull, a breeze); the paper rain is a granular
papery crackle (dry_leaves) whose density climbs with every beat (drizzle → showers → heavy → tornado wind → a rushing paper sea →
a rumbling wave); the music (a soft minor pluck pulse, 100 bpm, Am–F–C–G) ENTERS on the premise (the drizzle) and builds with a
kick from noon; it turns major for Scribe and the ending (F–G–C) and never drops out. Foley: a plip as the first sheet lands on her
head, the umbrella's pop and its cartoon boing when it flips, a muffled car alarm under the paper, a whoosh for the twister, a boom
for the wave, the phone's shutter, a tick per solved page, a pen on the screen, a flock-like flutter as the sheets fly back up, gold
chimes on "done" and the end card. Voice (Fish "Dolly") on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]
def WE(beat, word, n=1): return [w[2] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(actually=W('hook', 'actually'), drizzle=B['drizzle']['t0'], one=W('drizzle', 'one'), cute=W('drizzle', 'cute'),
         showers=B['showers']['t0'], showersW=W('showers', 'showers'), umbrella=W('showers', 'umbrella'), notW=W('showers', 'not'),
         noon=B['noon']['t0'], cars=W('noon', 'cars'), buried=W('noon', 'buried'), tornado=B['tornado']['t0'], made=W('tornado', 'made'),
         flood=B['flood']['t0'], underwater=W('flood', 'underwater'), wave=B['wave']['t0'], big=W('wave', 'big'),
         pivot=B['pivot']['t0'], babe=W('pivot', 'babe'), dont=W('pivot', 'dont'), scan=W('pivot', 'scan'),
         scribe=B['scribe']['t0'], twelve=W('scribe', 'twelve'), handwriting=W('scribe', 'handwriting'), lewis=W('scribe', 'lewis'),
         included=W('scribe', 'included'), includedE=WE('scribe', 'included'), clear=B['clear']['t0'], rains=W('clear', 'rains'),
         done=W('clear', 'done'), end=B['end']['t0'], zero=W('end', 'zero'), youre=W('end', 'youre'), welcomeE=WE('end', 'welcome'))
T['land'] = T['one'] + 0.25; T['pop'] = T['showersW'] + 0.1; T['flip'] = T['notW'] + 0.05; T['flash'] = T['scan'] + 0.3
T['card'] = T['welcomeE'] + 0.5
CUTS = sorted([T['drizzle'], T['one'] - 0.35, T['showers'], T['umbrella'] - 0.2, T['noon'], T['buried'] - 0.15, T['tornado'], T['made'] - 0.1,
               T['flood'], T['underwater'] + 0.55, T['wave'], T['big'] - 0.05, T['pivot'], T['dont'] - 0.1, T['scribe'], T['clear'], T['end'], T['youre'] - 0.15])

# ---------------------------------------------------------------- music: a minor pluck pulse that builds, then major for Scribe
BPM = 100; BEAT = 60 / BPM
IN = T['drizzle'] - 0.05
chords, cur = [], IN
while cur < T['scribe'] - 0.1:
    for sym in ['Am', 'F', 'C', 'G']:
        if cur >= T['scribe'] - 0.1: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
cur = T['scribe']
while cur < D - 0.8:
    for sym in ['F', 'G', 'C', 'C']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 0, 2, 1, 3],
             "vel": [[IN, 0.18], [T['noon'], 0.24], [T['wave'], 0.3], [T['pivot'], 0.22], [T['scribe'], 0.26], [T['end'], 0.24], [D, 0.2]]}]
pad = [{"t0": IN, "t1": T['scribe'] + 0.6, "notes": [45, 57, 60, 64], "level": 3.0, "attack": 1.4, "release": 1.0, "cutoff": 750, "hp": 30},
       {"t0": T['scribe'] - 0.2, "t1": D - 0.2, "notes": [48, 55, 60, 64], "level": 3.0, "attack": 0.8, "release": 1.2, "cutoff": 820, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 79, 0.28, 0.14], [round(a + 0.1, 3), 84, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": T['noon'], "t1": T['pivot'], "step": BEAT, "pattern": [1], "vel": 0.38, "kind": "kick"},
                 {"t0": T['noon'] + BEAT, "t1": T['pivot'], "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": T['scribe'], "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.34, "kind": "kick"},
                 {"t0": T['scribe'] + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.25], "vel": 0.18, "kind": "tick"}]
drums = [[round(T['noon'], 3), 0.32, "boom"], [round(T['wave'] + 0.1, 3), 0.4, "boom"], [round(T['big'], 3), 0.36, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -28, 0.0, pitch=1.7)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
e(1.2, "gull_cry", -30, -0.4, pitch=1.0); e(T['end'] + 0.6, "gull_cry", -31, 0.4, pitch=1.1)
e(T['land'], "plip", -22, 0.0, pitch=1.3); e(T['land'] + 0.02, "blanket_rustle", -27, 0.0, dur=0.25, intensity=0.5)       # the first sheet lands on her head
e(T['pop'], "pop", -20, 0.1, pitch=0.8); e(T['pop'] + 0.02, "flash_swish", -24, 0.1, dur=0.2, peak=0.3)                  # the umbrella opens
e(T['flip'], "boing", -21, 0.0, pitch=1.2, dur=0.5); e(T['flip'] + 0.08, "blanket_rustle", -21, 0.0, dur=0.7, intensity=1.0)   # it flips, the load dumps
e(T['cars'] + 0.1, "car_alarm", -33, 0.25, dur=2.2, pitch=0.85)                                                          # an alarm under the paper
e(T['tornado'] + 0.05, "low_swell", -24, 0.0, dur=1.4, pitch=0.6); e(T['made'] - 0.1, "whoosh_timeskip", -25, -0.2, pre=0.35, post=0.3)
e(T['wave'] + 0.1, "distant_boom", -20, 0.0, dur=3.0, size=1.6); e(T['big'] - 0.1, "crumble", -24, 0.0, dur=1.6, size=1.4)
e(T['big'] - 0.05, "low_swell", -22, 0.0, dur=1.6, pitch=0.5)
e(T['flash'], "shutter", -18, 0.15)                                                                                      # the scan
e(T['scribe'] + 0.6, "scan_beep", -26, 0.1, pitch=1.6, dur=0.08)                                                         # send
solve0, solve1 = T['scribe'] + 0.75, T['handwriting'] - 0.55
for i in range(12): e(solve0 + (solve1 - solve0) * (i + 1) / 12, "counter_tick", -27, 0.1, bright=1.2)
for k in range(4): e(T['handwriting'] - 0.3 + k * 0.85, "pen_scribble", -26, 0.0, dur=0.7)
e(T['includedE'] + 0.3, "gold_chime", -24, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.3)                           # Download PDF
e(T['clear'] + 0.15, "whoosh_timeskip", -23, 0.0, pre=0.5, post=0.3)
e(T['clear'] + 0.35, "wing_flutter", -22, -0.2, dur=1.8, n_birds=28); e(T['rains'] - 0.1, "wing_flutter", -23, 0.2, dur=1.8, n_birds=28)
e(T['done'] + 0.1, "gold_chime", -24, 0.0, notes=[84, 88, 91, 96], spacing=0.06, vel=0.25)
e(T['zero'], "scan_beep", -27, 0.0, pitch=1.9, dur=0.08)
e(T['card'], "gold_chime", -23, 0.0, notes=[65, 72, 77], spacing=0.09, vel=0.28)

amb = [
    {"sound": "surf", "t0": 0.0, "t1": T['noon'], "fade_in": 0.3, "fade_out": 0.3, "gain_db": -30, "seed": 11, "args": {"size": 0.6}},
    {"sound": "wind", "t0": 0.0, "t1": T['noon'], "fade_in": 0.5, "fade_out": 0.3, "gain_db": -36, "seed": 12, "args": {"darkness": 0.6, "gust": 0.4, "whistle": 0.05}},
    {"sound": "dry_leaves", "t0": T['drizzle'], "t1": T['showers'], "fade_in": 0.4, "fade_out": 0.2, "gain_db": -30, "seed": 13, "args": {"density": 0.35}},
    {"sound": "dry_leaves", "t0": T['showers'], "t1": T['noon'], "fade_in": 0.3, "fade_out": 0.2, "gain_db": -27, "seed": 14, "args": {"density": 1.6}},
    {"sound": "dry_leaves", "t0": T['noon'], "t1": T['clear'] + 0.4, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "seed": 15, "args": {"density": 2.6}},
    {"sound": "wind", "t0": T['noon'], "t1": T['clear'] + 1.0, "fade_in": 0.3, "fade_out": 1.0, "gain_db": -31, "seed": 16, "args": {"darkness": 0.7, "gust": 0.6, "whistle": 0.08}},
    {"sound": "wind", "t0": T['tornado'], "t1": T['flood'], "fade_in": 0.5, "fade_out": 0.5, "gain_db": -26, "seed": 17, "args": {"darkness": 0.55, "gust": 0.95, "whistle": 0.18}},
    {"sound": "water_rush", "t0": T['flood'], "t1": T['clear'] + 1.2, "fade_in": 0.6, "fade_out": 1.0, "gain_db": -34, "seed": 18, "args": {"intensity": 0.6}},
    {"sound": "surf", "t0": T['end'], "t1": D, "fade_in": 0.5, "fade_out": 0.8, "gain_db": -31, "seed": 19, "args": {"size": 0.5}},
]
cues = {
    "title": "074 - what if it rained homework (Vex what-if sim; paper-storm SFX, 100 bpm minor pluck -> major for Scribe + Fish Dolly)",
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
cues['music'] = {'preset': 'cute', 'pick': 0, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -3.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
