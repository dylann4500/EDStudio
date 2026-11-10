#!/usr/bin/env python3
"""Cue sheet for 076 (Scribe lane, "What 3 energy drinks do to your body", Vex explainer) -> cues.json.
python3 -I videos/076-vex-energy-drinks/make_cues.py   then   python3 -I audio/synth.py 076-vex-energy-drinks
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "ALL-NITE MART" — a 2 AM convenience store: the fluorescent hum, the fridge-wall compressor (a low cabin-hum bed) and
room tone under the hook, no music; the music DROPS on the can crack ("can one"): a bright pluck arpeggio (112 bpm, A minor:
Am7 → Fmaj7 → Cmaj7 → G) with a soft kick + clap + shaker ticks (minimal: the lane also posts the no-music cut). Foley: the can
crack + fizz, a counter tick each time the HUD clock jumps, soft ticks while adenosine piles up, a racing heartbeat at can three,
card pops, typing + the send click + soft pen scratches on the phone, a morning street bed outside, the crash (a pressure drop +
a boom), the dropped can clanking on the sidewalk, a chime on her wink and on the end card. Voice (Fish "Mommy", less-breathy) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(here=W('hook', 'heres'), can1=B['can1']['t0'], canOne=W('can1', 'can'), two=W('can1', 'two'), block=B['block']['t0'], blocks=W('block', 'blocks'),
         youre=W('block', 'youre'), can3=B['can3']['t0'], six=W('can3', 'six'), fdas=W('can3', 'fdas'), pivot=B['pivot']['t0'], cute=W('pivot', 'cute'), scribe=B['scribe']['t0'],
         writes=W('scribe', 'writes'), graph=W('scribe', 'graph'), morning=B['morning']['t0'], at8=W('morning', 'at'), whole=W('morning', 'whole'),
         crash=B['crash']['t0'], wears=W('crash', 'wears'), hits=W('crash', 'hits'), thats=W('crash', 'thats'), crashW=W('crash', 'crash'),
         end=B['end']['t0'], go=W('end', 'go'), ill=W('end', 'ill'), know=W('end', 'know'))
T['card'] = T['know'] + 0.55; T['send'] = T['writes'] - 0.75; T['page'] = T['writes'] - 0.05
# the same cut list as shots.js SH
CUTS = [T['here'] - 0.1, T['can1'], T['two'] - 0.1, T['block'], T['blocks'] - 0.25, T['youre'] - 0.1, T['can3'], T['six'] - 0.1, T['fdas'] - 0.1, T['pivot'], T['scribe'], T['page'] - 0.05,
        T['graph'] - 0.1, T['morning'], T['morning'] + 1.6, T['at8'] - 0.1, T['crash'], T['thats'] - 0.05, T['end']]

BPM = 112; BEAT = 60 / BPM
IN = T['canOne'] + 0.05                       # the music drops on the can crack
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Am7', 'Fmaj7', 'Cmaj7', 'G']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Am7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 3, 2, 1, 3, 2, 3],
             "vel": [[IN, 0.26], [T['scribe'], 0.29], [T['crash'], 0.24], [T['end'], 0.26], [D, 0.22]]}]
pad = [{"t0": IN - 0.3, "t1": D - 0.2, "notes": [45, 57, 64, 69, 72], "level": 3.0, "attack": 0.8, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.26, 0.14], [round(a + 0.1, 3), 81, 0.28, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.42, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.24, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.15, 0.3, 0.15], "vel": 0.2, "kind": "tick"}]
drums = [[round(IN, 3), 0.32, "boom"], [round(T['scribe'], 3), 0.26, "boom"], [round(T['hits'], 3), 0.36, "boom"]]
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
for c in story['callouts']:
    if c['style'] != 'stamp': e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['can1'], T['block'], T['can3'], T['morning'], T['crash'], T['end']): e(t0 + 0.04, "counter_tick", -20, -0.3)    # the HUD clock jumps
e(T['canOne'] + 0.03, "pop", -15, 0.15, pitch=0.75); e(T['canOne'] + 0.07, "hiss", -21, 0.15, dur=0.55)                         # the can crack + fizz
t = T['blocks'] + 0.1
while t < T['can3'] - 0.3: e(t, "plip", -31, 0.25 * ((int(t * 4) % 3) - 1), pitch=0.8); t += 0.3                                 # adenosine piling up
for i in range(3): e(T['six'] - 0.1 + i * 1.5 / 3.2 + 0.02, "pop", -22, 0.0, pitch=1.0 + 0.12 * i)                                # the meter stacks can by can
t = T['six'] + 0.2
while t < T['pivot'] - 0.2: e(t, "heartbeat", -18, 0.0, size=0.9); t += 0.48                                                       # a racing heart (~125 bpm)
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[88, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['scribe'] + 0.1, "keyboard_type", -22, 0.0, dur=round(T['send'] - T['scribe'] - 0.25, 2), rate=13.0)                          # typing the problem
e(T['send'] - 0.1, "latch_click", -18, 0.0, kind="close", bright=1.3); e(T['send'] - 0.04, "flash_swish", -25, 0.0, dur=0.2, peak=0.4)
t = T['send'] + 0.1
while t < T['morning'] - 0.5: e(t, "pen_scribble", -24, 0.0, dur=0.55); t += 0.55                                                 # the page writing itself
e(T['morning'] + 0.3, "car_pass", -30, -0.5)
e(T['whole'] + 0.05, "boing", -26, 0.0, pitch=1.2, dur=0.3)
e(T['wears'] - 0.1, "low_swell", -24, 0.0, dur=1.2, pitch=0.7)
e(T['hits'] - 0.15, "pressure_drop", -18, 0.0, dur=1.6)                                                                            # the crash
land = T['crashW'] + 0.3
e(land, "metal_clang", -19, 0.2, size=0.25, pitch=2.2, dur=0.5); e(land + 0.22, "knock", -26, 0.25, pitch=1.9); e(land + 0.4, "knock", -30, 0.3, pitch=2.1)
e(T['know'] + 0.1, "gold_chime", -25, 0.1, notes=[81, 88, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)

amb = [
    {"sound": "lamp_hum", "t0": 0.0, "t1": T['morning'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -40, "seed": 31},
    {"sound": "cabin_hum", "t0": 0.0, "t1": T['morning'], "fade_in": 0.3, "fade_out": 0.2, "gain_db": -34, "seed": 32},
    {"sound": "city_day", "t0": T['morning'], "t1": T['end'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -33, "args": {"murmur": 0.2, "traffic": 0.5}, "seed": 33},
    {"sound": "lamp_hum", "t0": T['end'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -40, "seed": 34},
    {"sound": "cabin_hum", "t0": T['end'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -34, "seed": 35},
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -38, "seed": 36},
]
cues = {
    "title": "076 - what 3 energy drinks do to your body (Vex explainer, ALL-NITE MART bed, 112 bpm A minor pluck, can crack drop + Fish Mommy)",
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
