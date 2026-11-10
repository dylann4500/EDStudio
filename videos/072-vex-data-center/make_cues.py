#!/usr/bin/env python3
"""Cue sheet for 072 (Scribe lane, "How an AI data center actually works", Vex explainer) -> cues.json.
python3 -I videos/072-vex-data-center/make_cues.py   then   python3 -I audio/synth.py 072-vex-data-center
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "DATA HALL" — the hall's fan roar (a cabin-hum bed + room tone, low-passed) under the hook; a cool, driving bell
arpeggio (100 bpm, D minor: Dm9-ish Dm7 → Bbmaj7 → Fmaj7 → C) enters on "every one of these racks" with a soft kick + rim + shaker;
minimal (the lane also posts the no-music cut). Foley: a server-tray slide, a pixel pop + soft tick per diagram card, a counter
ticking while the homes light up, the coolant whoosh (low swell), steam hiss at the towers, five water plips, the on-screen writing
(soft pen scratches), the Shuffle click, a chime on the end card. Voice (Fish "Mommy", less-breathy) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(rack=B['rack']['t0'], andR=W('rack', 'and'), thats=W('rack', 'thats'), oneRack=W('rack', 'rack'), campus=B['campus']['t0'], thats2=W('campus', 'thats'),
         heat=B['heat']['t0'], liquid=W('heat', 'liquid'), so=W('heat', 'so'), warm=W('heat', 'warm'), pivot=B['pivot']['t0'], cute=W('pivot', 'cute'),
         scribe=B['scribe']['t0'], graph=W('scribe', 'graph'), hit=W('scribe', 'hit'), shuffle=W('scribe', 'shuffle'), prompt=B['prompt']['t0'],
         five=W('prompt', 'five'), end=B['end']['t0'], dismissed=W('end', 'dismissed'))
T['card'] = T['dismissed'] + 0.55
CUTS = [T['rack'], T['andR'] - 0.1, T['thats'] - 0.1, T['campus'], T['heat'], T['liquid'] + 0.8, T['so'] - 0.1, T['pivot'], T['scribe'], T['graph'] - 0.1,
        T['hit'] - 0.2, T['prompt'], T['end']]

BPM = 100; BEAT = 60 / BPM
IN = T['rack'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dm7', 'Bbmaj7', 'Fmaj7', 'C']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dm7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 3, 2, 1, 2, 3, 2],
             "vel": [[IN, 0.24], [T['scribe'], 0.28], [T['end'], 0.25], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [38, 50, 57, 62, 65], "level": 3.0, "attack": 1.6, "release": 1.2, "cutoff": 750, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 74, 0.28, 0.14], [round(a + 0.1, 3), 81, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.24, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.15, 0.3, 0.15], "vel": 0.2, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "bell",
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
e(T['rack'] + 0.1, "blanket_rustle", -26, 0.3, dur=0.4, intensity=0.5); e(T['rack'] + 0.4, "knock", -24, 0.3, pitch=1.2)   # the tray slides out, clicks
for t0 in (T['thats'], T['thats2'], T['so'], T['prompt']): e(t0 + 0.02, "pop", -20, 0.0, pitch=1.05)                     # a diagram card lands
t = T['thats'] + 0.1
while t < T['oneRack'] - 0.1: e(t, "scan_beep", -30, 0.0, pitch=1.5, dur=0.03); t += 0.12                                # homes lighting up
t = T['thats2'] + 0.1
while t < T['thats2'] + 2.4: e(t, "scan_beep", -31, 0.0, pitch=1.7, dur=0.025); t += 0.08                               # the counter rolling
e(T['liquid'] - 0.1, "low_swell", -24, 0.0, dur=1.2, pitch=0.8)                                                          # coolant
e(T['liquid'] + 0.9, "hiss", -27, -0.2, dur=1.8)                                                                         # steam at the towers
e(T['warm'] + 0.05, "boing", -26, 0.0, pitch=1.2, dur=0.3)
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[86, 93], spacing=0.06, vel=0.22, dur=0.5)
t = T['scribe'] + 0.2
while t < T['hit'] - 0.4: e(t, "pen_scribble", -24, 0.0, dur=0.6); t += 0.6                                             # the page writing itself on screen
e(T['shuffle'] - 0.02, "latch_click", -18, 0.0, kind="close", bright=1.4); e(T['shuffle'] + 0.05, "flash_swish", -24, 0.0, dur=0.2, peak=0.4)
for i in range(5): e(T['five'] + 0.12 + i * 0.22, "plip", -22, 0.2 * (i - 2), pitch=1.1 + 0.05 * i)                      # five drops
e(T['dismissed'] + 0.1, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[62, 69, 74], spacing=0.09, vel=0.28)

amb = [
    {"sound": "cabin_hum", "t0": 0.0, "t1": T['campus'], "fade_in": 0.3, "fade_out": 0.2, "gain_db": -30, "seed": 21},
    {"sound": "wind", "t0": T['campus'], "t1": T['heat'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -34, "args": {"darkness": 0.7, "gust": 0.3, "whistle": 0.0}, "seed": 22},
    {"sound": "cabin_hum", "t0": T['heat'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -30, "seed": 23},
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -38, "seed": 24},
]
cues = {
    "title": "072 - how an AI data center works (Vex explainer, DATA HALL bed, 100 bpm D minor bell, fan roar, card pops + Fish Mommy)",
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
