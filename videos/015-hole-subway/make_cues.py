#!/usr/bin/env python3
"""Cue sheet for 015 (build genre) -> cues.json.   python3 -I videos/015-hole-subway/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 015-hole-subway

Sound identity: "WORKSHOP" — a bright marimba ostinato in F major at 118 bpm (I–V–vi–IV) with a piano bass, a soft F pad
under everything (the music never drops out), a very light taiko pulse, and a rising marimba "ta-da" (F–A–C) on every
engineering TERM callout — the build genre's audio signature. The hook is traffic + shovel only; the music drops in on
"Congratulations" (house rule: quiet open, music enters on the premise). The narrator sits on top: music ducks ~9 dB under
every phrase, ambience ~5 dB. Construction foley is soft and low-passed (audio/synth.py section 6b)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


s0 = lambda b: B[b]['t0']
s1 = lambda b: B[b]['t1']
t = dict(shovel=W('hook', 'shovel'), dig=W('hook', 'dig'), digEnd=s1('hook') + 0.15, congrats=W('congrats', 'congratulations'),
         racc=W('congrats', 'raccoon'), walkIn=W('cavein', 'your') - 0.15, climbs=W('cavein', 'climbs'), inspect=W('cavein', 'inspect'),
         walls=W('cavein', 'walls'), cave=W('cavein', 'cave'), fossil=W('cavein', 'gary', 2),
         digOut=W('shoring', 'dig'), out=W('shoring', 'out'), brace=W('shoring', 'brace'), beams=W('shoring', 'beams'), hug=W('shoring', 'hug'),
         deeper=W('water', 'dig'), pours=W('water', 'water'), sponge=W('water', 'sponge'), back=W('water', 'gary'),
         install=W('pumps', 'install'), never=W('pumps', 'never'), ny=W('pumps', 'new'),
         withOne=W('byhand', 'with'), years=W('byhand', 'years'), floor=W('byhand', 'floor'),
         bring=W('tbm', 'bring'), tunnel=W('tbm', 'tunnel'), giant=W('tbm', 'giant'), cheese=W('tbm', 'cheese'), longer=W('tbm', 'longer'), chews=W('tbm', 'it'),
         settle=W('sink', 'settlement'), sinking=W('sink', 'sinking'), crois=W('sink', 'croissants'),
         behind=W('rings', 'behind'), place=W('rings', 'place'), tons=W('rings', '60'), holds=W('rings', 'holds'), donut=W('rings', 'donut'),
         awful=W('air', 'awful'), passed=W('air', 'gary'), vent=W('air', 'add'), fans=W('air', 'fans'), fresh=W('air', 'fresh'),
         trains=W('power', 'trains'), third=W('power', 'third'), volts=W('power', '625'), zap=W('power', 'touched'),
         stations=W('finish', 'stations'), esc=W('finish', 'escalators'), turn=W('finish', 'turnstiles'), map=W('finish', 'map'), puddle=W('finish', 'puddle'),
         end=W('end', 'congratulations'), started=W('end', 'started'), traffic=W('end', 'traffic'), now=W('end', 'now'), ride=W('end', 'every'),
         stuck=W('end', 'gary'), racEnd=W('end', 'raccoon'), free=W('end', 'free'))

# the TBM path + ring times (same formulas as shots.js)
lerp = lambda a, b, u: a + (b - a) * min(1.0, max(0.0, u))
def tbmX(tt):
    if tt < t['chews']: return -4.75
    if tt < s1('sink'): return lerp(-4.75, 9.0, (tt - t['chews']) / (s1('sink') - t['chews']))
    if tt < s0('air'): return lerp(9.0, 12.5, (tt - s1('sink')) / (s0('air') - s1('sink')))
    return 12.5 + max(0, tt - s0('air')) ** 2 * 30
batchEnd = tbmX(t['place']) - 4.2
ring_x = [-4.2 + 0.45 + 0.9 * i for i in range(60) if -4.2 + 0.45 + 0.9 * i < 34]
ring_t = [lerp(t['behind'] + 0.2, t['place'] + 0.2, (batchEnd - x) / max(1, batchEnd + 4.2)) for x in ring_x if x < batchEnd]
TR_arr1, TR_dep1, TR_arr2 = t['end'] - 0.4, t['now'], t['racEnd'] + 0.45
TR_dep2 = max(t['free'] + 0.5, TR_arr2 + 0.8 + 0.6)

# ---------------------------------------------------------------- music
BPM = 118
BEAT = 60 / BPM
E8 = BEAT / 2
IN = t['congrats'] - 0.02
chords, k = [], 0
prog = [['F', 'C', 'Dm', 'Bb'], ['Dm', 'Bb', 'F', 'C']]
cur, cyc = IN, 0
while cur < D - 2.5:
    seq = prog[(cyc // 2) % 2] if cur < t['stations'] else ['Bb', 'C', 'F', 'F']
    for sym in seq:
        if cur >= D - 2.5: break
        chords.append([round(cur, 3), sym]); cur += 2 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'F'])
sections = [{"t0": IN, "t1": D, "style": "ostinato", "inst": "mallet", "step": E8, "pattern": [0, 2, 1, 2, 4, 2, 1, 2],
             "vel": [[IN, 0.26], [t['bring'], 0.3], [t['stations'], 0.33], [D, 0.3]], "len": 0.85, "bass_every": 4, "bass_vel": 0.7}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    if c['style'] == 'term':
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 77, 0.36, 0.18], [round(a + 0.09, 3), 81, 0.36, 0.18], [round(a + 0.18, 3), 84, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 72, 0.3, 0.16], [round(a + 0.1, 3), 77, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 70, 0.3, 0.14], [round(a + 0.12, 3), 65, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [29, 41, 48, 53, 57], "level": 0.42, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, t['cave'], t['tunnel'], t['sinking'] + 0.2, t['tons'], t['stations'], t['end']]
drums = [[round(b, 3), 0.42, "boom"] for b in booms] + [[round(t['zap'], 3), 0.3, "taiko"]]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": 0.12, "kind": "taiko"}]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": -5.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "piano",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, room=None, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if room is not None: d["room"] = room
    if args: d["args"] = args
    ev.append(d)
e(0.85, "car_horn", -22, -0.35, pitch=1.0, distance=1.3); e(W('hook', 'traffic') + 0.05, "car_horn", -19, 0.35, pitch=1.15, distance=1.0)
e(2.2, "car_horn", -27, 0.1, pitch=0.9, distance=1.8)
e(t['shovel'] + 0.28, "dig", -16, -0.1)
for k in range(5):
    tk = t['dig'] + (k + 0.6) / 5 * (t['digEnd'] - t['dig']); e(tk - 0.05, "dig", -14, -0.1 + 0.05 * k)
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -16, -0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -24, 0.2, dur=1.4, intensity=0.6)
e(t['racc'] - 0.15, "pop", -16, -0.3, pitch=1.7); e(t['racc'] + 0.4, "plush_squeak", -24, -0.3, pitch=1.4)
ev.append({"t0": t['walkIn'] + 0.1, "t1": t['climbs'] - 0.1, "sound": "footsteps", "rate": 3.4, "gain_db": -24, "pan0": 0.3, "pan1": -0.1})
e(t['climbs'] + 0.55, "giant_step", -18, 0.0, size=0.45)
e(t['inspect'] + 0.1, "pen_scribble", -24, 0.1, dur=0.6)
e(t['walls'], "crumble", -20, 0.0, dur=0.9, size=0.5)
e(t['cave'], "crumble", -9, 0.0, dur=1.8, size=1.4); e(t['cave'] + 0.05, "giant_step", -12, 0.0, size=1.2)
e(t['fossil'] + 0.75, "plush_squeak", -22, 0.2, pitch=0.8)
e(t['digOut'], "dig", -14, -0.1); e(t['out'] - 0.1, "dig", -12, 0.1); e(t['out'] + 0.05, "pop", -14, 0.0, pitch=0.9)
e(t['out'] + 0.75, "giant_step", -17, 0.0, size=0.45)
for i in range(16): e(t['brace'] + (i % 16) * 0.055, "knock", -19 - (i % 3), -0.5 + i / 16, pitch=0.9 + 0.1 * (i % 4))
for i in range(6): e(t['beams'] - 0.2 + i * 0.07, "knock", -15, -0.3 + 0.12 * i, pitch=0.7)
e(t['hug'], "plush_squeak", -24, 0.0, pitch=0.9)
e(t['deeper'] + 0.1, "dig", -13, -0.1); e(t['deeper'] + 0.35, "dig", -12, 0.1)
e(t['pours'] - 0.3, "splash", -12, -0.2, size=1.4); e(t['pours'] + 0.2, "splash", -14, 0.2, size=1.2)
e(t['sponge'], "slurp", -16, 0.2, dur=0.6)
for k in range(3): e(t['back'] + 0.2 + 0.7 * k, "splash", -22, -0.2 + 0.2 * k, size=0.5)
e(t['install'] + 0.45, "splash", -13, 0.0, size=1.3); e(t['install'] + 0.5, "clunk", -15, 0.0, size=0.8, metal=0.7)
e(t['never'] + 0.2, "slurp", -15, 0.0, dur=1.0)
e(t['ny'] + 0.6, "car_horn", -20, -0.3, pitch=0.95, distance=1.0); e(t['ny'] + 2.2, "car_horn", -21, 0.3, pitch=1.1, distance=1.1)
for k in range(9): e(t['withOne'] + 0.2 + k * 0.42, "dig", -24, 0.2, size=0.6)
e(t['years'] - 0.3, "low_swell", -20, 0.0, dur=2.0)
e(t['floor'], "plush_squeak", -22, 0.0, pitch=0.7)
e(t['bring'] + 0.05, "crumble", -12, 0.0, dur=1.2, size=1.0)
e(t['tunnel'], "clunk", -8, 0.0, size=2.2, metal=0.9); e(t['tunnel'] + 0.02, "giant_step", -10, 0.0, size=1.8)
e(t['cheese'] + 0.05, "grate", -15, 0.2, dur=1.1)
e(t['longer'], "pop", -16, -0.3, pitch=1.1); e(t['longer'] + 0.15, "pop", -16, 0.3, pitch=1.2)
e(t['settle'] - 0.45, "crumble", -14, 0.0, dur=1.0, size=0.8); e(t['settle'] - 0.4, "metal_groan", -18, 0.1, dur=1.2, pitch=1.2)
e(t['sinking'] + 0.2, "crumble", -10, 0.0, dur=1.8, size=1.2); e(t['sinking'] + 0.3, "metal_groan", -16, -0.1, dur=1.6, pitch=1.0)
for i in range(4): e(t['crois'] - 0.6 + i * 0.12 + 1.1, "bonk", -22, -0.2 + 0.13 * i)
for i, rt in enumerate(sorted(ring_t)): e(rt + 0.1, "clunk", -18, -0.3 + 0.6 * (i % 2), size=0.9, metal=0.6)
e(t['tons'], "clunk", -9, 0.0, size=1.8, metal=0.5); e(t['tons'] + 0.02, "giant_step", -12, 0.0, size=1.4)
e(t['donut'] - 0.12, "pop", -14, 0.0, pitch=1.0); e(t['donut'] + 0.2, "slurp", -20, 0.1, dur=0.5)
e(t['passed'] - 0.1, "giant_step", -18, 0.0, size=0.4)
e(t['vent'], "crumble", -15, 0.0, dur=0.9, size=0.6)
e(t['fans'] - 0.15, "clunk", -17, -0.2, size=0.8, metal=0.8); e(t['fans'] - 0.03, "clunk", -17, 0.2, size=0.8, metal=0.8)
e(t['fresh'] + 0.3, "plush_squeak", -22, 0.3, pitch=1.2)
for i in range(12): e(t['trains'] - 0.2 + i * 0.11, "knock", -22, -0.4 + i * 0.07, pitch=1.2)
for i in range(8): e(t['third'] - 0.1 + i * 0.12, "knock", -21, -0.4 + i * 0.1, pitch=1.5)
e(t['zap'], "zap", -11, 0.0, dur=0.75); e(t['zap'] + 1.1, "bonk", -16, 0.0)
e(t['stations'], "pop", -12, 0.0, pitch=0.8); e(t['esc'], "clunk", -16, 0.2, size=1.0, metal=0.6); e(t['esc'] + 0.15, "pop", -17, 0.3, pitch=1.2)
for i in range(3): e(t['turn'] + 0.08 * i, "knock", -18, -0.2 + 0.2 * i, pitch=1.6)
e(t['map'] + 0.2, "plush_squeak", -21, -0.2, pitch=1.1)
for k in range(5):
    tk = t['puddle'] + 0.55 + k * 1.1
    if tk < s1('finish'): e(tk, "plip", -21, 0.1, pitch=1.0 + 0.05 * k)
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -22, 0.0, dur=1.6, intensity=0.6)
e(t['started'] + 0.9, "car_horn", -18, -0.2, pitch=1.0, distance=1.0); e(t['traffic'] + 0.05, "car_horn", -16, 0.3, pitch=1.2, distance=0.9)
for k in range(4): e(t['now'] + 0.2 + k * 0.6, "blanket_rustle", -24, -0.3 + 0.2 * k, dur=0.7, intensity=0.5)
e(t['ride'] + 0.45, "knock", -17, -0.2, pitch=1.5)
for k in range(3): e(t['stuck'] + 0.2 + k * 0.5, "bonk", -18, -0.1)
e(t['racEnd'] - 0.1, "pop", -16, 0.2, pitch=1.6); e(t['racEnd'] + 0.45, "knock", -19, 0.2, pitch=1.4)
e(TR_arr2 + 0.8 + 0.45, "knock", -17, 0.2, pitch=1.1)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "traffic_flow", "t0": 0.0, "t1": IN + 0.6, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -26, "args": {"density": 0.8}, "seed": 1},
    {"sound": "city_day", "t0": 0.0, "t1": IN + 0.6, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -34, "args": {"murmur": 0.3, "traffic": 0.6}, "seed": 2},
    {"sound": "room_tone", "t0": IN, "t1": D, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -40},
    {"sound": "water_rush", "t0": t['pours'] - 0.3, "t1": t['pours'] + 2.3, "fade_in": 0.1, "fade_out": 0.8, "gain_db": -20, "seed": 3},
    {"sound": "drill", "t0": t['install'] + 0.5, "t1": s0('byhand'), "fade_in": 0.3, "fade_out": 0.4, "gain_db": -32, "args": {"rate": 4.0}, "seed": 4},
    {"sound": "water_rush", "t0": t['ny'] - 0.05, "t1": s1('pumps'), "fade_in": 0.1, "fade_out": 0.3, "gain_db": -20, "seed": 5},
    {"sound": "traffic_flow", "t0": t['ny'] - 0.05, "t1": s1('pumps'), "fade_in": 0.1, "fade_out": 0.3, "gain_db": -30, "seed": 6},
    {"sound": "drill", "t0": t['giant'] - 0.1, "t1": s0('air') + 1.2, "fade_in": 0.6, "fade_out": 1.0, "gain_db": -24, "args": {"rate": 7.0}, "seed": 7},
    {"sound": "fan", "t0": t['fans'], "t1": s1('air'), "fade_in": 0.8, "fade_out": 0.3, "gain_db": -26, "seed": 8},
    {"sound": "wind", "t0": t['fresh'] - 0.3, "t1": s1('air'), "fade_in": 0.4, "fade_out": 0.3, "gain_db": -26, "args": {"darkness": 0.4, "gust": 0.6, "whistle": 0.0}, "seed": 9},
    {"sound": "lamp_hum", "t0": t['volts'] - 0.1, "t1": t['zap'] + 1.0, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -30, "seed": 10},
    {"sound": "city_day", "t0": t['stations'], "t1": D, "fade_in": 0.6, "fade_out": 0.5, "gain_db": -36, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 11},
    {"sound": "train", "t0": TR_arr1, "t1": TR_arr1 + 2.4, "fade_in": 0.6, "fade_out": 0.9, "gain_db": -22, "seed": 12},
    {"sound": "train", "t0": TR_dep1, "t1": TR_dep1 + 2.0, "fade_in": 0.5, "fade_out": 1.2, "gain_db": -24, "seed": 13},
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['started'] + 0.3, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "seed": 14},
    {"sound": "traffic_flow", "t0": t['started'] - 0.05, "t1": t['now'], "fade_in": 0.2, "fade_out": 0.3, "gain_db": -30, "seed": 15},
    {"sound": "train", "t0": TR_arr2 - 0.3, "t1": D, "fade_in": 0.4, "fade_out": 0.3, "gain_db": -22, "seed": 16},
]

cues = {
    "title": "015 - How a Hole Becomes a Subway (build genre: WORKSHOP marimba groove + construction foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -10.0, "sfx": 5.0, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes, {len(ring_t)} ring clunks")
