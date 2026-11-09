#!/usr/bin/env python3
"""061 cue sheet -> cues.json. Sound-design-led like the original (no narrator): the beach, the clap and its rolling thunder,
gulls, car alarms, phones, the pen. Every time comes from story.json (make_story.py) — the same numbers shots.js animates.
    python3 -I videos/061-mg-everyone-claps/make_cues.py && python3 -I audio/synth.py 061-mg-everyone-claps
Music (user, Nov 8: minimal; the posted cut is out/nomusic.mp4 under a trending sound): a soft pad from the first frame + a light
mallet ostinato that ENTERS ON THE CLAP (quiet open, CLAUDE.md), continuous to the end, ~13 dB under the foley."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
T, E, D = story['T'], story['E'], story['duration']
CLAP = E['clap']

# ---------------------------------------------------------------- music: C – G – Am – F, 112 bpm, mallet 8ths from the clap
BPM = 112; BEAT = 60 / BPM
chords, cur = [], 0.0
prog = ['C', 'G', 'Am', 'F']
i = 0
while cur < D - 0.8:
    chords.append([round(cur, 3), prog[i % 4]]); cur += 4 * BEAT; i += 1
chords.append([round(cur, 3), 'C'])
TRI = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [60, 64, 69], 'F': [60, 65, 69]}
ARP = [0, 2, 1, 2, 0, 2, 1, 3]
mallet = []
for j, (ct, sym) in enumerate(chords[:-1]):
    k = 0
    while ct + k * BEAT / 2 < chords[j + 1][0] - 0.02:
        tt = ct + k * BEAT / 2
        if tt >= CLAP:
            a = ARP[k % 8]; note = TRI[sym][a] + 12 if a < 3 else TRI[sym][0] + 24
            mallet.append([round(tt, 3), note, 0.15 if k % 2 == 0 else 0.1, 0.16])
        k += 1
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 2.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -9.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords,
         "sections": [{"t0": 0.0, "t1": D, "style": "sparse", "vel": 0.2}], "melody": [], "mallet_melody": mallet,
         "pad": [{"t0": 0.0, "t1": D - 0.2, "notes": [48, 55, 60, 64], "level": 1.0, "attack": 1.2, "release": 1.0, "cutoff": 900, "hp": 40}],
         "drums": [],
         "drum_patterns": [{"t0": CLAP, "t1": D - 0.6, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": 0.3, "kind": "kick"},
                           {"t0": CLAP, "t1": D - 0.6, "step": BEAT / 2, "pattern": [0.35, 0.18], "vel": 0.2, "kind": "tick"}]}

ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)

# the countdown → THE CLAP
e(CLAP - 1.25, "low_swell", -14, 0.0, dur=1.25, pitch=1.0)
e(CLAP, "mass_clap", -3, 0.0, dur=6.5, size=1.0, tail=1.6)
e(CLAP, "hand_clap", -6, 0.0, size=1.5, pitch=0.9)
e(CLAP + 0.02, "distant_boom", -16, 0.0, size=0.6)
# the planet shot: soft pops as the city rings bloom
for k, d in enumerate([0.15, 0.32, 0.5, 0.71]): e(T['clap'] + 1.1 + d, "plip", -26, (-0.4, 0.3, -0.1, 0.45)[k])
# gulls lift off
e(E['gulls_go'], "wing_flutter", -10, 0.1, dur=1.8, n_birds=14)
for k, (d, p) in enumerate([(0.15, 1.0), (0.55, 1.12), (0.95, 0.92), (1.4, 1.05)]): e(E['gulls_go'] + d, "gull_cry", -17 - k, (-0.3, 0.35, 0.1, -0.2)[k], pitch=p)
# car alarms, one by one as the sound front passes each car (shots.js: x + 1700 − 120 over 1250 px/s)
for k, x in enumerate([-1000, -520, -40, 440, 920, 1400]):
    tt = T['alarms'] + (x + 1700 - 120) / 1250
    if tt < T['venice'] + 0.4: e(tt, "car_alarm", -17 - 0.5 * k, (-0.6 + 0.24 * k), dur=min(2.6, T['venice'] + 0.6 - tt), pitch=(1.0, 0.92, 1.07, 0.96, 1.03, 0.9)[k], rate=(2.8, 2.4, 3.1, 2.6, 2.9, 2.5)[k])
# Venice: the ring arrives
e(E['venice_hit'], "pop", -13, 0.2, pitch=1.15); e(E['venice_hit'] + 0.05, "plip", -18, 0.25)
# like thunder: the rolling tail you would hear
e(T['thunder'] + 0.15, "distant_boom", -9, -0.1, size=1.0)
# New York pins + the energy cans popping in (soft, rising)
e(T['newyork'] + 0.1, "pop", -18, 0.35, pitch=0.9); e(T['newyork'] + 0.4, "pop", -18, -0.35, pitch=1.05)
for k in range(10): e(T['energy'] + 0.25 + k * 0.12, "pop", -22, -0.5 + 0.1 * k, pitch=0.85 + 0.04 * k)
e(T['energy'] + 1.85, "plip", -18, -0.3)
# minutes later: the seismograph pen scratching
e(T['later'] + 0.1, "pen_scribble", -24, 0.3, dur=1.3)
# every phone buzzes (the crowd, then yours)
for k in range(9): e(T['buzz'] + 0.25 + k * 0.17, "phone_buzz", -21 - (k % 3), (-0.7 + 0.17 * k), dur=0.7, pulses=2)
e(T['buzz'] + 0.3, "phone_buzz", -11, 0.0, dur=1.0, pulses=2)
# notifications land
for k in range(5): e(T['teacher'] + 0.15 + k * 0.42, "plip", -15 - k * 0.6, 0.15)
# the stamp + the stack
e(E['stamp'], "knock", -9, 0.0); e(E['stamp'] + 0.01, "clunk", -14, 0.0, size=0.5, metal=0.0)
e(T['never'] + 0.05, "blanket_rustle", -18, 0.3)
e(E['app_home'], "pop", -16, 0.2, pitch=1.1)
# the photo, the app working, the pen
e(E['shutter'], "shutter", -9, 0.15)
e(E['scan0'] + 0.05, "scan_beep", -18, 0.1)
for k in range(8): e(E['solve0'] + k * 0.18, "plip", -22, 0.1 + 0.03 * k)
e(E['solve1'], "pop", -15, 0.1, pitch=1.2)
e(E['write0'], "pen_scribble", -12, 0.05, dur=1.3); e(E['write0'] + 1.25, "pen_scribble", -13, 0.1, dur=1.3)
# the slow clap (claps on clapCycle(t, slow0 − 0.3, 1.15): together at phase 0.42)
n = 0
while True:
    tt = E['slow0'] - 0.3 + (n + 0.42) / 1.15
    if tt >= T['joins']: break
    if tt > T['slowclap']: e(tt, "hand_clap", -7 + 0.5 * n, 0.0, size=1.3, pitch=0.95)
    n += 1
# the second clap, slowed down
e(E['mo_clap'] - 1.3, "low_swell", -13, 0.0, dur=1.3, pitch=0.8)
e(E['mo_clap'], "hand_clap", -5, 0.0, size=1.6, pitch=0.55)
e(E['mo_clap'] + 0.01, "distant_boom", -10, 0.0, size=0.9)
e(T['end'] + 0.1, "gold_chime", -17, 0.0, notes=[72, 76, 79, 84], spacing=0.08, vel=0.4, shimmer=0.25, dur=2.4)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": T['ready'] + 0.3, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -30, "seed": 1, "args": {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}},
    {"sound": "surf", "t0": T['ready'] - 0.2, "t1": T['alarms'] + 0.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -20, "seed": 2},
    {"sound": "crowd_cheer", "t0": T['ready'] - 0.1, "t1": CLAP + 1.2, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -27, "seed": 3, "args": {"excite": 0.5}},
    {"sound": "traffic_flow", "t0": T['alarms'] - 0.1, "t1": T['venice'] + 0.3, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -24, "seed": 4},
    {"sound": "room_tone", "t0": T['venice'], "t1": T['buzz'] + 0.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -32, "seed": 5},
    {"sound": "surf", "t0": T['buzz'] - 0.2, "t1": T['end'] + 0.3, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -22, "seed": 6},
    {"sound": "crowd_cheer", "t0": T['buzz'], "t1": T['teacher'] + 0.3, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -30, "seed": 7, "args": {"excite": 0.3}},
    {"sound": "applause", "t0": T['joins'], "t1": T['end'] + 1.2, "fade_in": 0.4, "fade_out": 1.0, "gain_db": -19, "seed": 8, "args": {"density": 60.0, "swell": 0.5}},
    {"sound": "crowd_cheer", "t0": T['joins'] + 0.1, "t1": T['end'] + 1.5, "fade_in": 0.5, "fade_out": 1.2, "gain_db": -23, "seed": 9, "args": {"excite": 1.0}},
]
cues = {"title": "061 everyone claps", "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.4, D],
        "stem_gain_db": {"music": -13.0, "sfx": 2.0, "amb": 3.0},
        "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
        "sfx_lowpass_hz": 5200,
        "shots": [T[b] for b in story['order']] + [D], "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x['t'])}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
