#!/usr/bin/env python3
"""Cue sheet for 057 (Scribe promo, pixel style: "What if your homework DOUBLED every 3 seconds?") -> cues.json.
python3 -I videos/057-homework-doubles/make_cues.py && python3 -I audio/synth.py 057-homework-doubles

Sound identity: SFX-LED like the @whatifpov original (no narrator, "Original audio": a city/wind bed + foley on every beat) with a
MINIMAL soft bed (manager steer, Nov 8: "most of our background music is bad — keep any bed minimal and soft, let SFX carry it";
out/nomusic.mp4 is delivered too so a trending sound can go under it). The bed: a low pad from frame 0 (keeps the music stem
continuous), a low-passed kick pulse that ENTERS on "Every 3 seconds, it doubles" and gains a layer every beat (8th ticks → 16ths
→ claps), a tom fill into the snap, a quiet half-time pulse while Scribe reads, then the groove + a soft marimba lift under SOLVED,
resolving on F under the end card. 120 bpm: one 3-s beat = 6 quarter notes, so every cut lands on the grid.
Foley: wind + paper flutter (cold open), a near-silent tape rewind, street + footsteps, paper pops on every doubling, a heavier
step + strain at 18 kg, schoolyard voices, the tower creaking in the wind, the 52 m column falling onto the cars (crash, crumble,
a soft boom, one car alarm), the avalanche, summit wind, the phone shutter + scan beeps, Scribe's pen, the wave's rising swell.
Times mirror shots.js (TCRASH, TPOP, SOLVE0/1, WAVE0/1, ENDC, the pops at round(2^(T/3)) = 2, 3, 4) — keep them in sync."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
D = story['duration']
TCRASH, TFALL, TPOP, SOLVE0, SOLVE1, WAVE0, WAVE1, ENDC = 20.05, 19.2, 25.62, 27.9, 32.8, 30.55, 33.0, 37.0
POPS = [5.15, 7.37, 8.82]            # the in-hand sheet count rounds up to 2, 3, 4 (2^(T/3), T = t - 3.4)
CUTS = [3.4, 6.4, 9.4, 12.4, 15.4, 18.4, 21.4, 24.4, 27.4, 30.4, 33.4]
BPM = 120; BEAT = 60 / BPM
IN = 6.4                              # the groove enters on "Every 3 seconds, it doubles."

# ---------------------------------------------------------------- music (minimal + soft)
chords = [[0.0, 'Dm'], [3.4, 'F'], [6.4, 'F'], [9.4, 'G'], [12.4, 'Am'], [15.4, 'Bb'], [18.4, 'C'], [21.4, 'Dm'], [24.4, 'Bb'], [25.9, 'C'],
          [27.4, 'F'], [28.9, 'C/E'], [30.4, 'Dm'], [31.9, 'Bb'], [33.4, 'F'], [34.9, 'C'], [36.4, 'Bb'], [37.0, 'F'], [39.0, 'Bb'], [40.0, 'F']]
TONES = {'Dm': [38, 50, 57, 62, 65], 'F': [41, 53, 57, 60, 65], 'G': [43, 55, 59, 62, 67], 'Am': [45, 57, 60, 64, 69], 'Bb': [46, 53, 58, 62, 65],
         'C': [48, 55, 60, 64, 67], 'C/E': [40, 52, 55, 60, 64]}
pad = []
for i, (ct, sym) in enumerate(chords):
    nxt = chords[i + 1][0] if i + 1 < len(chords) else D - 0.1
    lvl = 1.7 if ct < IN else 1.15
    pad.append({"t0": ct, "t1": nxt + 0.35, "notes": TONES[sym], "level": lvl, "attack": 0.6 if i == 0 else 0.25, "release": 0.6, "cutoff": 1100, "hp": 30})
sections = [{"t0": IN, "t1": D - 0.3, "style": "held", "vel": [[IN, 0.16], [24.4, 0.2], [27.4, 0.24], [ENDC, 0.22], [D, 0.2]], "roll": 0.05}]
END_D = ENDC + 2 * BEAT * 2       # the groove ends a bar into the end card; the pad + a last chord carry the rest
drum_patterns = [
    {"t0": IN, "t1": 24.4, "step": BEAT, "pattern": [1], "vel": [[IN, 0.34], [12.4, 0.42], [18.4, 0.5], [24.4, 0.55]], "kind": "kick"},
    {"t0": 9.4, "t1": 15.4, "step": BEAT / 2, "pattern": [0.5, 1.0], "vel": [[9.4, 0.18], [15.4, 0.26]], "kind": "tick"},
    {"t0": 15.4, "t1": 24.4, "step": BEAT / 4, "pattern": [0.45, 0.25, 0.85, 0.3], "vel": [[15.4, 0.26], [24.4, 0.34]], "kind": "tick"},
    {"t0": 15.4 + BEAT, "t1": 24.4, "step": 2 * BEAT, "pattern": [1], "vel": [[15.4, 0.3], [24.4, 0.4]], "kind": "clap"},
    {"t0": 24.4, "t1": 27.4, "step": 2 * BEAT, "pattern": [1], "vel": 0.3, "kind": "kick"},                       # half-time while Scribe reads
    {"t0": 27.4, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[27.4, 0.48], [33.4, 0.5], [ENDC, 0.42]], "kind": "kick"},
    {"t0": 27.4 + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.36, "kind": "clap"},
    {"t0": 27.4, "t1": END_D, "step": BEAT / 4, "pattern": [0.45, 0.25, 0.85, 0.3], "vel": 0.3, "kind": "tick"},
]
drums = [[round(23.4 + k * BEAT / 4, 3), 0.22 + 0.06 * k, "tom"] for k in range(8)]   # the fill into the snap
drums += [[TCRASH, 0.5, "boom"], [21.45, 0.28, "boom"], [ENDC, 0.32, "boom"]]
# a soft marimba lift once Scribe starts writing (8ths on the chord tones)
TRI = {'F': [65, 69, 72], 'C/E': [64, 67, 72], 'Dm': [62, 65, 69], 'Bb': [62, 65, 70], 'C': [64, 67, 72]}
ARP = [0, 1, 2, 1]
mallet = []
for i, (ct, sym) in enumerate(chords):
    if ct < 27.4 or ct >= ENDC + 2.0: continue
    nxt = chords[i + 1][0]; tri = TRI[sym]; k = 0
    while ct + k * BEAT / 2 < nxt - 0.02:
        mallet.append([round(ct + k * BEAT / 2, 3), tri[ARP[k % 4]], 0.15 if k % 2 == 0 else 0.11, 0.16]); k += 1
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": 2.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -9.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
         "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -5.0}]}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=3.6, gain=-26, p0=0.0, p1=0.0):
    ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})
def paper(tt, gain=-22, pan=0.0, dur=0.3):   # a crisp paper flutter (a short, bright fabric rustle)
    e(tt, "blanket_rustle", gain, pan, dur=dur, intensity=0.9, softness=0.15, contact=0.9)

# COLD OPEN: on top of the paper mountain in the wind
for k in range(9): paper(0.15 + k * 0.23, -24 - (k % 3), -0.7 + 0.17 * k, 0.28)
# REWIND: near-silence, a low tape drag, a soft clunk as it stops
e(2.22, "low_swell", -24, 0.0, dur=1.1, pitch=0.55)
e(3.36, "knock", -22, 0.0, pitch=0.6)
# B1-B3: the walk
steps(3.45, 6.4, 3.7, -27, -0.1, 0.1)
steps(6.45, 9.4, 3.6, -29, 0.3, -0.3)
for p in POPS: e(p, "pop", -19, 0.25, pitch=1.25); paper(p + 0.02, -21, 0.25, 0.25)
for k in range(8): paper(9.6 + k * 0.36, -27 + 1.3 * k, -0.2 + 0.06 * k, 0.3)     # the stack grows: rustle swells
for k in range(4): e(10.2 + k * 0.62, "giant_step", -30 + 2 * k, 0.0, size=0.25 + 0.05 * k)   # heavier steps at 18 kg
e(11.75, "whimper", -24, 0.0, pitch=0.75, dur=0.45)                                  # the strain
# B4-B5: the schoolyard, the tower
for k in range(6): paper(12.6 + k * 0.45, -25 + k, -0.3 + 0.12 * k, 0.35)
e(13.9, "whimper", -25, -0.2, pitch=1.0, dur=0.35)                                   # the teacher's "huh"
e(15.5, "low_swell", -22, 0.0, dur=2.6, pitch=0.9)
e(16.6, "metal_groan", -28, 0.1, dur=1.6, pitch=1.8)                                 # the column creaks in the wind
for k in range(7): paper(15.6 + k * 0.4, -24, -0.6 + 0.2 * k, 0.35)
# B6: the fall + the crash
e(18.5, "metal_groan", -24, -0.2, dur=1.2, pitch=1.5)
e(TFALL, "low_swell", -19, -0.2, dur=0.9, pitch=1.3)
e(TCRASH, "car_crash", -10, 0.1, weight=1.3); e(TCRASH + 0.01, "giant_step", -12, 0.0, size=1.3); e(TCRASH + 0.03, "crumble", -15, 0.0, dur=1.0, size=1.0)
e(TCRASH + 0.05, "glass_crack", -22, 0.3, dur=0.6, n_pings=3)
e(TCRASH + 0.35, "car_alarm", -27, 0.4, dur=1.0)
for k in range(8): paper(TCRASH + 0.15 + k * 0.14, -23, -0.7 + 0.2 * k, 0.3)
# B7: the avalanche buries the school
e(21.45, "crumble", -16, 0.0, dur=2.9, size=1.4)
e(22.6, "metal_groan", -27, -0.4, dur=1.2, pitch=1.1)                                  # the bus sags
for k in range(6): paper(21.6 + k * 0.45, -25, -0.5 + 0.2 * k, 0.35)
# B8: the summit, the phone, the snap
e(24.5, "phone_pickup", -20, 0.2)
e(TPOP - 0.02, "lamp_switch_click", -13, 0.15); e(TPOP + 0.06, "lamp_switch_click", -19, 0.15)
for k in range(5): e(TPOP + 0.3 + k * 0.28, "scan_beep", -26, 0.15, pitch=1.15 + 0.06 * k, dur=0.08)
# B9: Scribe writes; SOLVED races
e(SOLVE0, "low_swell", -21, 0.0, dur=1.4, pitch=1.5)
k = 0
while 27.55 + k * 0.5 < 30.3:
    e(27.55 + k * 0.5, "pen_scribble", -17, -0.05 + 0.05 * (k % 3), dur=0.55); k += 1
for k in range(10): e(28.0 + k * 0.45, "scan_beep", -29, 0.15, pitch=1.4 + 0.04 * (k % 4), dur=0.06)
# B10: the hero sheet finishes, the wave rolls down the mountain
e(30.45, "pen_scribble", -16, 0.0, dur=0.6)
e(30.8, "low_swell", -18, 0.0, dur=2.4, pitch=1.8)
for k in range(10): paper(31.0 + k * 0.22, -26 + 0.4 * k, -0.7 + 0.15 * k, 0.3)
# B11 + END: relief, wind settles
e(33.7, "breath", -22, 0.0, dur=0.9, inhale=False)
for k in range(6): paper(33.6 + k * 0.5, -27, -0.6 + 0.24 * k, 0.3)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": 2.3, "fade_in": 0.02, "fade_out": 0.15, "gain_db": -24, "args": {"darkness": 0.45, "gust": 0.8, "whistle": 0.08}, "seed": 1},
    {"sound": "city_day", "t0": 3.4, "t1": 12.45, "fade_in": 0.15, "fade_out": 0.1, "gain_db": -27, "args": {"murmur": 0.45, "traffic": 0.55}, "seed": 2},
    {"sound": "kids_laugh", "t0": 12.4, "t1": 18.45, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "args": {"density": 0.5}, "seed": 3},
    {"sound": "city_day", "t0": 12.4, "t1": 21.45, "fade_in": 0.1, "fade_out": 0.2, "gain_db": -33, "args": {"murmur": 0.3, "traffic": 0.4}, "seed": 4},
    {"sound": "wind", "t0": 15.4, "t1": 21.4, "fade_in": 0.3, "fade_out": 0.1, "gain_db": -31, "args": {"darkness": 0.5, "gust": 0.6, "whistle": 0.05}, "seed": 5},
    {"sound": "crowd_cheer", "t0": 15.6, "t1": 18.45, "fade_in": 0.4, "fade_out": 0.1, "gain_db": -36, "args": {"excite": 0.2}, "seed": 6},
    {"sound": "wind", "t0": 21.4, "t1": D, "fade_in": 0.1, "fade_out": 0.8, "gain_db": -27, "args": {"darkness": 0.45, "gust": 0.75, "whistle": 0.06}, "seed": 7},
]

cues = {
    "title": "057 - Scribe promo: homework doubles every 3 s (pixel) - SFX-led, minimal soft pad + 120 bpm pulse",
    "duration": D, "target_lufs": -14.5, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.4, D],
    "stem_gain_db": {"music": -9.0, "sfx": 3.0, "amb": 4.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5200,
    "shots": [0.0, 2.2] + CUTS + [ENDC, D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
