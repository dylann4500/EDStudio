#!/usr/bin/env python3
"""Cue sheet for 020 (funny doubling-POV, unhinged weird tier): "What if your butt doubled in size every minute?" -> cues.json
Run: python3 -I videos/020-butt-doubling/make_cues.py

Sound identity (new — not 018's E-minor heist, 016's gossip jazz, 013's pluck slip or 010's kaiju march):
  an ESCALATION POLKA — a bouncy piano oom-pah over soft spiccato strings that steps UP A KEY ON EVERY DOUBLING (C → Db → D … the
  "truck-driver gear change", the joke told by the music) and speeds up as the butt leaves the planet (120 → 133 → 150 bpm).
  Every doubling = a low swell sucking in → a soft BOOM + a low cartoon "bwomp" (plush_squeak 0.5) + the beat's foley (chair
  snap, wall burst, bus crunch, the splash). A 2-note octave-leap "boing" motif on the mallet marks each doubling and climbs
  with the key. The dream wake-up turns into a music-box lullaby in C… until 7:01 (BOOM) and the polka starts over (loop).
  - 0–5.5 s: quiet bedroom only (room tone, a snore, the alarm clock at 7:00). Music ENTERS at the first doubling (5.5).
  - one bed per place: kitchen clock, suburb street, traffic + horns, pool chatter, high wind + jet, near-silence in orbit,
    a city crowd, the bedroom again. Steady mix, the music never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 60.0
SCENES = [0, 3.4, 8.0, 12.6, 17.8, 22.4, 27.0, 31.6, 36.4, 41.0, 43.4, 45.2, 50.2, 56.0]
# doublings (mirrors BOOM in shots.js) → each one is a key change
BOOMS = [5.5, 10.0, 12.6, 15.3, 20.5, 25.0, 29.3, 31.6, 32.9, 34.2, 36.4, 38.7, 41.0, 43.4, 47.3]
WAKE, WAKE_BOOM, END = 50.2, 54.4, 56.0
KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"]
PC = {"C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
def deg(key, semis): return NAMES[(PC[key] + semis) % 12]
def step_at(t): return 0.5 if t < 22.4 else 0.45 if t < 31.6 else 0.4     # 120 → 133 → 150 bpm

# ---------------------------------------------------------------- music: chords (I – IV – V – I per key, one chord per bar)
chords, sections, pad, mallet = [], [], [], []
segs = list(zip(BOOMS, BOOMS[1:] + [WAKE], KEYS))
for k, (t0, t1, key) in enumerate(segs):
    st = step_at(t0)
    prog = [key, deg(key, 5), deg(key, 7), key]
    t, i = t0, 0
    while t < t1 - 0.05:
        chords.append([round(t, 3), prog[i % 4]]); t += 4 * st; i += 1
    sections.append({"t0": t0, "t1": t1, "style": "bounce", "vel": 0.34 if t0 < 31.6 else 0.38, "step": st, "bass_hold": 1.8, "stab_hold": 0.9})
    sections.append({"t0": t0, "t1": t1, "style": "strings", "vel": 0.2 if t0 < 22.4 else 0.26, "step": st / 2, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.4})
    pad.append({"t0": t0 - 0.05, "t1": t1 + 0.5, "chord": key, "level": 1.15, "attack": 0.12, "release": 0.6, "cutoff": 1200})
    # the "boing": an octave leap on the key's root, climbing with each doubling
    r = 60 + (PC[key] + (12 if k >= 12 else 0)) % 24
    mallet += [[round(t0 + 0.02, 3), r, 0.3, 0.12], [round(t0 + 0.16, 3), r + 12, 0.34, 0.45]]
    # the wind-up: a rising 4-note run (crescendo) into the next doubling — fills the bar end and tells you it's coming
    if t1 - t0 > 1.0 and t1 < WAKE:
        for j in range(4):
            mallet.append([round(t1 - 0.48 + j * 0.12, 3), r + [0, 4, 7, 11][j] + 12, 0.18 + 0.05 * j, 0.14])
    # a cheeky 4-note hook in each key, one bar after the doubling (if there's room)
    h = t0 + 4 * st
    if h + 4 * st < t1:
        for j, (dt, iv) in enumerate([(0, 7), (st, 9), (2 * st, 7), (3 * st, 4)]):
            mallet.append([round(h + dt, 3), r + 12 + iv, 0.2, st * 0.8])
# braam at the premise
pad.insert(0, {"t0": 5.5, "t1": 7.5, "notes": [24, 36, 43, 48, 55], "level": 1.4, "attack": 0.1, "release": 0.8, "cutoff": 900, "hp": 30})
# the dream: music-box lullaby in C (slow arp + the hook, softly), a held pad
chords += [[WAKE, "C"], [52.2, "F"], [53.4, "G"], [WAKE_BOOM, "C"], [56.4, "F"], [57.6, "G"], [58.8, "C"]]
sections.append({"t0": WAKE, "t1": WAKE_BOOM, "style": "arp", "vel": [[WAKE, 0.34], [53.8, 0.38]], "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]})
pad.append({"t0": WAKE - 0.05, "t1": WAKE_BOOM + 0.35, "chord": "C", "level": 1.1, "attack": 0.3, "release": 0.6})
for j in range(4):
    mallet.append([round(WAKE_BOOM - 0.48 + j * 0.12, 3), [72, 76, 79, 83][j], 0.18 + 0.05 * j, 0.14])
for j, (t, m) in enumerate([(50.4, 79), (50.7, 81), (51.0, 79), (51.3, 76), (52.3, 77), (52.6, 81), (53.45, 79), (53.75, 74), (54.05, 79)]):
    mallet.append([t, m, 0.26, 0.28])
# 7:01 — the polka starts over, in C, for the end card; a final plonk
sections.append({"t0": WAKE_BOOM, "t1": D, "style": "bounce", "vel": 0.4, "step": 0.5, "bass_hold": 1.8, "stab_hold": 0.9})
sections.append({"t0": WAKE_BOOM, "t1": D, "style": "strings", "vel": 0.2, "step": 0.25, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.4})
pad.append({"t0": WAKE_BOOM - 0.05, "t1": D, "chord": "C", "level": 1.2, "attack": 0.1, "release": 0.8})
mallet += [[WAKE_BOOM + 0.02, 60, 0.3, 0.12], [WAKE_BOOM + 0.16, 72, 0.34, 0.45]]
mallet += [[56.6, 79, 0.22, 0.3], [57.0, 81, 0.22, 0.3], [57.4, 79, 0.22, 0.3], [57.8, 76, 0.22, 0.5], [58.6, 74, 0.24, 0.3], [58.75, 79, 0.26, 0.3], [58.9, 84, 0.3, 0.9]]   # the hook, then a last octave "boing" home

drums = [[t, 0.6 if t in (5.5, 15.3, 29.3, 47.3) else 0.45, "boom"] for t in BOOMS] + [[WAKE_BOOM, 0.55, "boom"], [59.5, 0.3, "taiko"]]
drum_patterns = []
for k, (t0, t1, key) in enumerate(segs):   # soft taiko on beat 1 of every bar (the polka's kick)
    st = step_at(t0)
    if t1 - t0 > 2 * st:
        drum_patterns.append({"t0": round(t0 + 4 * st, 3), "t1": round(t1 - 0.1, 3), "step": 2 * st, "pattern": [1, 0.55], "vel": 0.22 if t0 < 31.6 else 0.27, "kind": "taiko"})

# ---------------------------------------------------------------- ambience (one bed per place)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("room_tone", 0.0, 8.05, -36, fi=0.4, seed=1),
    bed("room_tone", 8.0, 12.65, -37, seed=2), bed("clock", 8.0, 12.65, -50, seed=2),
    bed("city_day", 12.6, 22.45, -40, args={"murmur": 0.35, "traffic": 0.5}, seed=3), bed("wind", 12.6, 22.45, -50, args={"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, seed=3),
    bed("traffic_flow", 22.4, 27.05, -40, args={"density": 0.7}, seed=4), bed("city_day", 22.4, 27.05, -44, args={"murmur": 0.8, "traffic": 0.3}, seed=4),
    bed("city_day", 27.0, 31.65, -40, args={"murmur": 1.0, "traffic": 0.0}, seed=5),
    bed("wind", 31.6, 36.45, -40, args={"darkness": 0.45, "gust": 0.4, "whistle": 0.0}, seed=6), bed("turbines", 33.2, 36.45, -40, fi=1.2, seed=6),
    bed("cabin_hum", 36.4, 41.05, -48, seed=7),
    bed("city_day", 41.0, 45.25, -37, args={"murmur": 1.0, "traffic": 0.3}, seed=8),
    bed("wind", 45.2, 50.25, -50, args={"darkness": 0.8, "gust": 0.1, "whistle": 0.0}, seed=9),
    bed("room_tone", 50.2, D, -36, fo=0.6, seed=10),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})
def doubling(t, g=-24, swell=0.45, bw=0.5):
    """every doubling: a low swell sucking in, then a low cartoon 'bwomp' (the boom itself is a drum on the music bus)"""
    if t > swell + 0.1: E(t - 0.02, "low_swell", g - 2, 0.0, {"dur": swell, "pitch": 0.6})
    E(t + 0.01, "plush_squeak", g, 0.0, {"pitch": bw})

# 0. title: asleep — a snore, then the alarm at 7:00
E(0.4, "snore", -30, 0.1); E(1.9, "snore", -31, 0.1); E(3.02, "alarm_beep", -28, -0.3, {"n": 2})
# 1. stand: a stretch (a soft creak), the first doubling, the dog barks
E(3.7, "floorboard_creak", -33, 0.1); doubling(5.5, -22); E(5.53, "giant_step", -26, 0.0, {"size": 0.35, "surface": "wood"})
E(5.8, "dog_bark", -27, -0.3, {"pitch": 1.2}); E(6.25, "dog_bark", -28, -0.3, {"pitch": 1.25})
# 2. kitchen: steps in, sits (creak), CHAIR SNAP + the belt, the button pings the vase, the mug lands
steps(8.0, 9.0, -32, 2.0, 0.3, 0.0); E(9.35, "floorboard_creak", -29, 0.0)
doubling(10.0, -22); E(10.02, "wood_snap", -21, 0.0, {"size": 0.6}); E(10.05, "wood_snap", -28, -0.2, {"size": 0.2})
E(10.55, "bonk", -27, -0.4, {"dur": 0.3}); E(10.72, "metal_clang", -31, -0.3, {"size": 0.22, "pitch": 2.4})
for k, t in enumerate([10.6, 10.85, 11.1]): E(t, "giant_step", -31, 0.2 * (k - 1), {"size": 0.18, "surface": "wood"})
# 3. door: jammed (the cut is a doubling), denim strains with each push, the dog barks; CORK POP, the wall bursts, the landing
doubling(12.6, -23, swell=0.0); E(12.62, "giant_step", -25, 0.0, {"size": 0.5, "surface": "wood"})
for t in (13.25, 14.22, 15.05): E(t, "blanket_rustle", -28, 0.0, {"dur": 0.35, "softness": 0.6, "intensity": 0.7})
for t in (13.6, 14.6): E(t, "dog_bark", -30, 0.4, {"pitch": 1.15})
doubling(15.3, -21); E(15.31, "car_crash", -23, 0.0, {"weight": 0.2}); E(15.33, "wood_snap", -22, 0.0, {"size": 0.9})
E(15.92, "giant_step", -21, 0.0, {"size": 0.9, "surface": "ground"}); E(16.3, "giant_step", -27, 0.0, {"size": 0.5, "surface": "ground"})
for k, t in enumerate([16.0, 16.15, 16.4, 16.6]): E(t, "wood_snap", -31, 0.3 * (k - 1.5), {"size": 0.15})
# 4. bus: it pulls in (a pass + a soft brake sigh), the driver bolts, the CRUNCH, a far horn
E(18.7, "car_pass", -26, 0.6, {"dur": 2.2, "size": 1.8}, room=-18); E(19.7, "low_swell", -33, 0.3, {"dur": 0.5, "pitch": 1.6})
steps(19.5, 22.0, -31, 3.2, -0.2, -0.6)
doubling(20.5, -21); E(20.52, "car_crash", -20, 0.1, {"weight": 0.45}); E(20.6, "metal_groan", -27, 0.1, {"dur": 0.6, "pitch": 0.8})
E(21.6, "car_horn", -33, -0.5, {"dur": 0.5, "pitch": 0.9, "distance": 0.8})
# 5. traffic: honks, the cop, the doubling knocks a car back + the signal falls
E(22.9, "car_horn", -32, 0.4, {"dur": 0.35, "pitch": 1.0, "distance": 0.6}); E(23.6, "car_horn", -33, -0.3, {"dur": 0.6, "pitch": 0.85, "distance": 0.7})
doubling(25.0, -21); E(25.03, "car_crash", -22, 0.2, {"weight": 0.3}); E(25.3, "metal_groan", -28, 0.5, {"dur": 0.6, "pitch": 1.3})
E(25.75, "metal_clang", -25, 0.4, {"size": 1.0, "pitch": 0.9}); E(26.1, "car_crash", -26, 0.1, {"weight": 0.15})
E(26.3, "car_horn", -31, -0.2, {"dur": 1.2, "pitch": 1.0, "distance": 0.5})
# 6. pool: chatter, the descent (a long low swell), SPLASH, rain of water
E(29.28, "low_swell", -24, 0.0, {"dur": 1.6, "pitch": 0.45})
doubling(29.3, -22, swell=0.0); E(29.31, "cartoon_splash", -17, 0.0, {"size": 1.6}); E(30.1, "cartoon_splash", -27, -0.4, {"size": 0.5}); E(30.5, "cartoon_splash", -28, 0.4, {"size": 0.4})
# 7. flight: two doublings over the wind, the jet roars past
doubling(31.6, -24, swell=0.0); doubling(32.9, -22); doubling(34.2, -21)
E(35.3, "car_pass", -27, -0.5, {"dur": 2.2, "size": 2.2}, room=-18)
# 8. orbit: near-silence, the doubling (felt more than heard), the shutter
doubling(36.4, -25, swell=0.0); doubling(38.7, -22); E(40.1, "lamp_switch_click", -25, 0.3); E(40.12, "phone_pickup", -33, 0.3)
# 9–10. the crowd: an "ooh", every phone goes up (shutter clicks), the doubling, a gasp
doubling(41.0, -25, swell=0.0)
for k in range(9): E(42.12 + k * 0.07, "lamp_switch_click", -31 - (k % 3), ((k % 5) - 2) * 0.2)
doubling(43.4, -21)
for k in range(10): E(43.7 + k * 0.11, "lamp_switch_click", -32 - (k % 3), ((k % 5) - 2) * 0.25)
# 11. the Moon: one huge doubling
E(47.28, "low_swell", -22, 0.0, {"dur": 1.2, "pitch": 0.45}); doubling(47.3, -21, swell=0.0); E(47.32, "distant_boom", -24, 0.0, {"size": 1.2})
# 12. the dream: alarm, relief, the dog snores… 7:01 — doubling, the dog yelps + lands
E(50.25, "alarm_beep", -26, -0.3, {"n": 3}); E(50.3, "blanket_rustle", -30, 0.0, {"dur": 0.5, "softness": 0.6, "intensity": 0.6})
E(52.0, "snore", -33, 0.2); E(53.3, "snore", -34, 0.2)
doubling(WAKE_BOOM, -21); E(WAKE_BOOM + 0.2, "dog_bark", -25, 0.1, {"pitch": 1.45}); E(55.15, "mattress_sit", -27, 0.1)

cues = {
    "title": "020 - What if your butt doubled in size every minute? (funny doubling-POV: escalation polka — oom-pah that climbs a key every doubling)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [59.4, D],
    "stem_gain_db": {"music": -8.0, "sfx": 11.0, "amb": 7.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 1.5, "pad_reverb_db": -6.0, "strings_db": 5.0, "mallet_db": -2.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": [], "mallet_melody": mallet, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -2.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(chords), "chords")
