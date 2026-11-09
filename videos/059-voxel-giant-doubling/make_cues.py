#!/usr/bin/env python3
"""Cue sheet for 059 (Scribe promo, VOXEL style: "What if you DOUBLED in size every 3 seconds?") -> cues.json.
python3 -I videos/059-voxel-giant-doubling/make_cues.py && python3 -I audio/synth.py 059-voxel-giant-doubling

Sound identity: SFX-LED like the @whatifpov original (no narrator, "Original audio": a street/wind bed + foley synced to the beats)
with a MINIMAL soft bed (manager steer, Nov 8: our music is weak; out/nomusic.mp4 is what gets posted under a trending sound).
The footsteps carry the premise: light sidewalk steps at 1.70 m that slow down and deepen into booms as you double (giant_step
size grows with the height), the crunch of the car, gasps on the plaza, wind at altitude, then the quiet product beat (the phone
shutter, Scribe's scan beeps, the pen writing, the classroom printer) and the clouds. Bed: a low pad from frame 0, a soft 120 bpm
pulse that enters when the doubling starts (one 3-s beat = 6 quarter notes: every cut lands on the grid), half-time while Scribe
reads, a marimba lift while it writes, resolving under the end card. Times mirror shots.js (TCRUNCH, TFLASH, TSCAN, TWRITE, TPRINT,
ENDC) — keep them in sync."""
import json, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
D = story['duration']
TCRUNCH, TFLASH, TSCAN0, TSCAN1, TWRITE0, TWRITE1, TPRINT0, TPRINT1, ENDC = 13.55, 25.15, 25.35, 26.9, 27.0, 29.7, 30.05, 31.3, 37.0
CUTS = [2.0, 3.0, 6.0, 9.0, 12.0, 15.0, 16.5, 18.0, 21.0, 24.0, 27.0, 30.0, 31.5, 33.0, 36.0]
BPM = 120; BEAT = 60 / BPM
IN = 6.0                              # the pulse enters on "Every 3 seconds, you double."
H = lambda t: 1.7 * 2 ** (max(0.0, t - 4.0) / 3)

# ---------------------------------------------------------------- music (minimal + soft)
chords = [[0.0, 'Dm'], [3.0, 'F'], [6.0, 'F'], [9.0, 'G'], [12.0, 'Am'], [15.0, 'Bb'], [18.0, 'C'], [21.0, 'Dm'], [24.0, 'Bb'], [25.5, 'C'],
          [27.0, 'F'], [28.5, 'C/E'], [30.0, 'Dm'], [31.5, 'Bb'], [33.0, 'F'], [34.5, 'C'], [36.0, 'Bb'], [37.0, 'F'], [39.0, 'Bb'], [40.0, 'F']]
TONES = {'Dm': [38, 50, 57, 62, 65], 'F': [41, 53, 57, 60, 65], 'G': [43, 55, 59, 62, 67], 'Am': [45, 57, 60, 64, 69], 'Bb': [46, 53, 58, 62, 65],
         'C': [48, 55, 60, 64, 67], 'C/E': [40, 52, 55, 60, 64]}
pad = []
for i, (ct, sym) in enumerate(chords):
    nxt = chords[i + 1][0] if i + 1 < len(chords) else D - 0.1
    lvl = 1.7 if ct < IN else 1.15
    pad.append({"t0": ct, "t1": nxt + 0.35, "notes": TONES[sym], "level": lvl, "attack": 0.6 if i == 0 else 0.25, "release": 0.6, "cutoff": 1100, "hp": 30})
sections = [{"t0": IN, "t1": D - 0.3, "style": "held", "vel": [[IN, 0.16], [24.0, 0.2], [27.0, 0.24], [ENDC, 0.22], [D, 0.2]], "roll": 0.05}]
END_D = ENDC + 2 * BEAT * 2
drum_patterns = [
    {"t0": IN, "t1": 24.0, "step": BEAT, "pattern": [1], "vel": [[IN, 0.3], [12.0, 0.38], [18.0, 0.46], [24.0, 0.5]], "kind": "kick"},
    {"t0": 9.0, "t1": 15.0, "step": BEAT / 2, "pattern": [0.5, 1.0], "vel": [[9.0, 0.16], [15.0, 0.24]], "kind": "tick"},
    {"t0": 15.0, "t1": 24.0, "step": BEAT / 4, "pattern": [0.45, 0.25, 0.85, 0.3], "vel": [[15.0, 0.24], [24.0, 0.3]], "kind": "tick"},
    {"t0": 15.0 + BEAT, "t1": 24.0, "step": 2 * BEAT, "pattern": [1], "vel": [[15.0, 0.28], [24.0, 0.36]], "kind": "clap"},
    {"t0": 24.0, "t1": 27.0, "step": 2 * BEAT, "pattern": [1], "vel": 0.28, "kind": "kick"},                       # half-time while Scribe reads
    {"t0": 27.0, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[27.0, 0.44], [33.0, 0.48], [ENDC, 0.4]], "kind": "kick"},
    {"t0": 27.0 + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.34, "kind": "clap"},
    {"t0": 27.0, "t1": END_D, "step": BEAT / 4, "pattern": [0.45, 0.25, 0.85, 0.3], "vel": 0.28, "kind": "tick"},
]
drums = [[ENDC, 0.3, "boom"]]
TRI = {'F': [65, 69, 72], 'C/E': [64, 67, 72], 'Dm': [62, 65, 69], 'Bb': [62, 65, 70], 'C': [64, 67, 72]}
ARP = [0, 1, 2, 1]
mallet = []
for i, (ct, sym) in enumerate(chords):
    if ct < 27.0 or ct >= ENDC + 2.0: continue
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
def paper(tt, gain=-24, pan=0.0, dur=0.3):
    e(tt, "blanket_rustle", gain, pan, dur=dur, intensity=0.9, softness=0.15, contact=0.9)
def stomp(tt, h, gain_base=-21, pan=0.0):
    """a footstep whose weight follows the height: a sidewalk step at 1.7 m, a building-shaking boom at 1 km"""
    k = min(1.0, math.log2(max(1.0, h / 1.7)) / 9.0)          # 0 at 1.7 m … 1 at ~870 m
    e(tt, "giant_step", gain_base + 6 * k, pan, size=round(0.12 + 1.15 * k, 3))

# COLD OPEN + LOOP (36–37 = 0–2): the giant's slow steps shake the street, people gasp, wind high up
for tt in (0.55, 1.75): stomp(tt, 3000, -16)
e(0.6, "distant_boom", -24, 0.0); e(0.7, "whimper", -27, -0.3, pitch=1.4, dur=0.4); e(1.0, "whimper", -28, 0.3, pitch=1.6, dur=0.35)
# REWIND: near-silence, a low tape drag, a soft clunk as it stops
e(2.02, "low_swell", -25, 0.0, dur=0.95, pitch=0.55)
e(2.97, "knock", -22, 0.0, pitch=0.6)
# B2 POV walk (1.70 m): light steps, the worksheet rustles, a kid waves
t = 3.08
while t < 6.0: e(t, "footstep", -27, -0.08 if int(t * 2) % 2 else 0.08); t += 0.52
for k in range(3): paper(3.3 + k * 0.9, -27, 0.2, 0.25)
# B3-B4: the doubling begins — steps slow down and deepen with the height
t = 6.1
while t < 12.0:
    stomp(t, H(t), -24, 0.0); t += 0.5 + 0.35 * (t - 6.0) / 6.0
e(7.35, "whimper", -25, -0.35, pitch=0.9, dur=0.45)                    # the neighbour: "huh?!"
e(10.1, "whimper", -24, 0.25, pitch=1.5, dur=0.35); e(10.45, "whimper", -25, 0.35, pitch=1.7, dur=0.3)   # the kids on the sidewalk
for tt in (6.0, 9.0, 12.0): e(tt + 0.02, "low_swell", -28, 0.0, dur=0.9, pitch=1.6)   # each doubling swells under the cut
# B5 the crunch
e(12.4, "low_swell", -22, 0.0, dur=1.15, pitch=1.2)                    # the shoe's shadow comes down
e(TCRUNCH, "car_crash", -9, 0.05, weight=1.25); e(TCRUNCH + 0.01, "giant_step", -11, 0.0, size=1.0); e(TCRUNCH + 0.03, "crumble", -17, 0.0, dur=0.8, size=0.8)
e(TCRUNCH + 0.05, "glass_crack", -21, 0.3, dur=0.6, n_pings=3)
e(TCRUNCH + 0.35, "car_alarm", -27, 0.4, dur=1.1)
e(13.75, "whimper", -22, -0.4, pitch=1.4, dur=0.5)                     # the passer-by runs
# B6 the school: gasps from the plaza, then the wide (a heavy weight shift)
e(15.05, "whimper", -24, -0.2, pitch=1.6, dur=0.35); e(15.25, "whimper", -25, 0.2, pitch=1.3, dur=0.4); e(15.5, "whimper", -24, 0.0, pitch=1.8, dur=0.3)
stomp(16.6, H(16.6), -18, 0.0); e(16.62, "distant_boom", -26, 0.0)
# B7 POV down at the roof banner: wind, a far murmur
stomp(18.3, H(18.3), -22)
# B8 the grain of rice: the zoom
e(21.1, "low_swell", -24, 0.0, dur=2.6, pitch=1.3)
# B9 one photo with Scribe
e(24.15, "phone_pickup", -20, 0.2)
e(TFLASH - 0.02, "lamp_switch_click", -13, 0.15); e(TFLASH + 0.06, "lamp_switch_click", -19, 0.15)
for k in range(6): e(TSCAN0 + 0.15 + k * 0.25, "scan_beep", -26, 0.15, pitch=1.15 + 0.06 * k, dur=0.08)
# B10 solved, in your handwriting: the pen
k = 0
while TWRITE0 + 0.1 + k * 0.5 < TWRITE1 + 0.2:
    e(TWRITE0 + 0.1 + k * 0.5, "pen_scribble", -16, -0.05 + 0.05 * (k % 3), dur=0.55); k += 1
e(TWRITE1 + 0.05, "scan_beep", -24, 0.1, pitch=1.6, dur=0.1)
# B11 Room 4: the printer, the teacher's "wow", then the room shakes
for k in range(6): e(TPRINT0 + (k / 6) * (TPRINT1 - TPRINT0) + 0.12, "knock", -27, 0.25, pitch=1.6); paper(TPRINT0 + (k / 6) * (TPRINT1 - TPRINT0) + 0.15, -25, 0.25, 0.22)
e(31.7, "whimper", -24, 0.1, pitch=1.1, dur=0.45)
e(32.25, "distant_boom", -17, 0.0); e(32.27, "giant_step", -19, 0.0, size=1.2); e(32.4, "crumble", -26, 0.0, dur=0.6, size=0.4)
# B12 the clouds + END
e(33.05, "low_swell", -20, 0.0, dur=2.8, pitch=0.9)
for tt in (34.2, 35.5): stomp(tt, 2500, -20)
for tt in (36.55, 37.75): stomp(tt, 3000, -18)
e(36.6, "whimper", -27, -0.3, pitch=1.4, dur=0.4)

amb = [
    {"sound": "wind", "t0": 0.0, "t1": 2.05, "fade_in": 0.02, "fade_out": 0.15, "gain_db": -27, "args": {"darkness": 0.45, "gust": 0.7, "whistle": 0.06}, "seed": 1},
    {"sound": "city_day", "t0": 0.0, "t1": 2.05, "fade_in": 0.02, "fade_out": 0.15, "gain_db": -31, "args": {"murmur": 0.6, "traffic": 0.3}, "seed": 2},
    {"sound": "city_day", "t0": 3.0, "t1": 15.05, "fade_in": 0.15, "fade_out": 0.1, "gain_db": -28, "args": {"murmur": 0.4, "traffic": 0.5}, "seed": 3},
    {"sound": "crowd_cheer", "t0": 15.0, "t1": 21.05, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -34, "args": {"excite": 0.3}, "seed": 4},
    {"sound": "kids_laugh", "t0": 15.0, "t1": 18.05, "fade_in": 0.1, "fade_out": 0.1, "gain_db": -38, "args": {"density": 0.4}, "seed": 5},
    {"sound": "wind", "t0": 15.0, "t1": 30.05, "fade_in": 0.3, "fade_out": 0.1, "gain_db": -30, "args": {"darkness": 0.5, "gust": 0.6, "whistle": 0.05}, "seed": 6},
    {"sound": "fan", "t0": TPRINT0 - 0.05, "t1": TPRINT1 + 0.15, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -33, "seed": 7},
    {"sound": "room_tone", "t0": 30.0, "t1": 33.05, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -34, "seed": 8},
    {"sound": "wind", "t0": 33.0, "t1": D, "fade_in": 0.1, "fade_out": 0.8, "gain_db": -25, "args": {"darkness": 0.45, "gust": 0.8, "whistle": 0.08}, "seed": 9},
    {"sound": "city_day", "t0": 36.0, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -32, "args": {"murmur": 0.6, "traffic": 0.3}, "seed": 10},
]

cues = {
    "title": "059 - Scribe promo: you double in size every 3 s (voxel) - SFX-led, minimal soft pad + 120 bpm pulse",
    "duration": D, "target_lufs": -14.5, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.4, D],
    "stem_gain_db": {"music": -10.0, "sfx": 3.0, "amb": 4.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5200,
    "shots": [0.0] + CUTS + [ENDC, D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
