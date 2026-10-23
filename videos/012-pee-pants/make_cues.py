#!/usr/bin/env python3
"""Cue sheet for 012 (tone: funny, wacky) -> cues.json.   python3 -I videos/012-pee-pants/make_cues.py

Sound identity: "MISCHIEF" — sneaky pizzicato strings (style "strings", short notes) + a marimba-like mallet with a recurring
two-note "uh-oh" (E5 → C#5, a falling minor third) at the top of every beat. E minor, 104 bpm. Not 002's bouncy piano, not 010's march.
Quiet open (user steer): classroom murmur + chalk only; at 10:14 every voice in the room STOPS (subtractive beat), a low cartoon
boop, then the music sneaks in. Warm turn for "we were all in it together" (sustained strings + mallet), a bright G-major party.
Never drops out once it starts; foley soft and low-passed."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 69.0
MOMENT = 5.0
IN = 5.55                           # the music enters right after the moment
BEAT = 60 / 104.0                   # 0.577 s
E8 = BEAT / 2
B = [0, 8.0, 13.6, 19.0, 24.6, 30.4, 35.8, 41.4, 46.8, 52.2, 58.2, 64.4, D]
chords = []
def bar(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bar(IN, 8.0, ["Em"])
for k, (a, b) in enumerate(zip(B[1:9], B[2:10])):
    bar(a, b, [["Em", "C", "Am", "B7"], ["Em", "G", "Am", "B7"]][k % 2])
bar(52.2, 58.2, ["C", "G", "Am", "D"])                       # the warm turn
bar(58.2, 64.4, ["G", "C", "D", "G"])                        # party
bar(64.4, D, ["G"])
pizz = [0, 1, 2, 1]
sections = [
    {"t0": IN, "t1": 52.2, "style": "strings", "vel": [[IN, 0.26], [24.6, 0.3], [52.2, 0.32]], "step": E8, "pattern": pizz, "octave": 1, "len": 0.45, "sustain": 0.12},
    {"t0": 52.2, "t1": 58.2, "style": "strings", "vel": [[52.2, 0.2], [58.2, 0.24]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "len": 1.0, "sustain": 0.45},
    {"t0": 58.2, "t1": 64.4, "style": "strings", "vel": [[58.2, 0.24], [64.4, 0.26]], "step": E8, "pattern": [0, 1, 2, 1], "octave": 1, "len": 0.5, "sustain": 0.3},
    {"t0": 64.4, "t1": D, "style": "strings", "vel": 0.24, "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "len": 1.0, "sustain": 0.4},
]
# the mallet: "uh-oh" at the start of every beat + a sneaky walking line under the comedy beats
mallet = []
for t0 in [IN] + B[1:10]:
    mallet += [[round(t0 + 0.05, 3), 76, 0.42, 0.35], [round(t0 + 0.05 + 0.33, 3), 73, 0.4, 0.6]]
walk = [64, 67, 69, 70, 71, 69, 67, 64]
for a, b in zip(B[1:9], B[2:10]):
    t = a + 1.2
    k = 0
    while t < b - 0.3:
        mallet.append([round(t, 3), walk[k % len(walk)], 0.26, 0.22]); t += BEAT; k += 1
for k, t in enumerate([58.25 + i * E8 for i in range(int((64.3 - 58.25) / E8))]):   # party: a bright arpeggio
    mallet.append([round(t, 3), [67, 71, 74, 79, 74, 71][k % 6], 0.22, 0.2])
pad = [{"t0": IN, "t1": 52.25, "notes": [28, 40, 47, 52], "level": 0.6, "attack": 0.25, "release": 0.6, "cutoff": 700, "hp": 30},
       {"t0": 52.2, "t1": 58.25, "chord": "C", "level": 0.45, "attack": 0.8, "release": 0.6},
       {"t0": 58.2, "t1": D - 0.3, "notes": [31, 43, 50, 55], "level": 0.5, "attack": 0.5, "release": 1.0, "cutoff": 900, "hp": 30}]
drums = [[IN, 0.35, "taiko"], [B[9], 0.4, "boom"], [58.2, 0.5, "boom"], [64.4, 0.45, "boom"]]
drum_patterns = [{"t0": 58.2, "t1": 64.3, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": 0.3, "kind": "taiko"}]

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": 8.05, "fade_in": 0.5, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 0.0, "t1": MOMENT + 0.05, "fade_in": 0.6, "fade_out": 0.08, "gain_db": -38, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 1},   # kids chatting → cut at the moment
    {"sound": "room_tone", "t0": 8.0, "t1": 13.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 9.1, "t1": 13.65, "fade_in": 0.3, "fade_out": 0.06, "gain_db": -42, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 2},   # the press room murmurs
    {"sound": "city_day", "t0": 13.6, "t1": 19.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -48, "args": {"murmur": 0.6, "traffic": 0.1}, "seed": 3},
    {"sound": "applause", "t0": 17.7, "t1": 19.05, "fade_in": 0.2, "fade_out": 0.06, "gain_db": -36, "args": {"density": 30.0}, "seed": 1},
    {"sound": "city_day", "t0": 19.0, "t1": 24.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.8, "traffic": 0.0}, "seed": 4},
    {"sound": "wind", "t0": 19.0, "t1": 24.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"darkness": 0.3, "gust": 0.2, "whistle": 0.0}, "seed": 1},
    {"sound": "room_tone", "t0": 24.6, "t1": 35.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "turbines", "t0": 35.8, "t1": 41.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42, "args": {"rate": 1.6}, "seed": 2},   # tumbling drums
    {"sound": "lamp_hum", "t0": 35.8, "t1": 41.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52},
    {"sound": "traffic_flow", "t0": 41.4, "t1": 46.0, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -44, "seed": 1},
    {"sound": "wind", "t0": 41.4, "t1": 46.85, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.8, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "room_tone", "t0": 46.8, "t1": 52.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40},
    {"sound": "city_day", "t0": 46.8, "t1": 52.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 5},
    {"sound": "crowd_cheer", "t0": 52.2, "t1": 58.25, "fade_in": 0.1, "fade_out": 0.06, "gain_db": -40, "args": {"excite": 0.5}, "seed": 2},
    {"sound": "city_day", "t0": 52.2, "t1": D, "fade_in": 0.05, "fade_out": 1.0, "gain_db": -46, "seed": 6},
    {"sound": "crowd_cheer", "t0": 58.2, "t1": 64.5, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -34, "seed": 3},
]
ev = []
for t0 in (0.6, 2.2, 3.6):
    ev.append({"t": t0, "sound": "chalk_write", "args": {"dur": 0.9, "strokes": 5}, "gain_db": -26, "pan": 0.3, "room": -14})
ev.append({"t": MOMENT + 0.02, "sound": "plush_squeak", "args": {"dur": 0.22, "pitch": 0.45}, "gain_db": -24, "pan": 0.0, "room": -16})   # the cartoon "boop"
ev.append({"t": MOMENT + 0.35, "sound": "blanket_rustle", "args": {"dur": 0.4, "softness": 0.6, "intensity": 0.5, "strokes": 2}, "gain_db": -30, "pan": 0.0, "room": -16})
for k in range(14):                                        # press: a storm of shutter clicks
    ev.append({"t": round(9.0 + k * 0.17 + (k % 3) * 0.03, 3), "sound": "lamp_switch_click", "gain_db": -30 - (k % 3) * 2, "pan": ((k * 37) % 9 - 4) / 6.0, "room": -14})
ev.append({"t": 16.95, "sound": "blanket_rustle", "args": {"dur": 0.5, "softness": 0.7, "intensity": 0.5}, "gain_db": -32, "pan": 0.0})
for k, tt in enumerate((20.2, 20.25, 20.35, 20.4)):          # swimmers' shrug splashes (soft rustles)
    ev.append({"t": tt, "sound": "blanket_rustle", "args": {"dur": 0.35, "softness": 0.2, "intensity": 0.6}, "gain_db": -32, "pan": (k - 1.5) * 0.3})
ev.append({"t": 28.0, "sound": "mattress_sit", "args": {"dur": 0.5}, "gain_db": -32, "pan": 0.1})   # chairs creak as they stand
ev.append({"t": 28.65, "sound": "blanket_rustle", "args": {"dur": 0.5, "softness": 0.8, "intensity": 0.5}, "gain_db": -30, "pan": 0.0})
ev.append({"t": 31.7, "sound": "dog_bark", "args": {"pitch": 0.75}, "gain_db": -28, "pan": 0.2})     # a single offended "hmph"
for tt in (42.8, 43.6, 44.3, 44.9, 45.4):                   # the grid: far thumps as districts drop
    ev.append({"t": tt, "sound": "distant_boom", "args": {"size": 0.35}, "gain_db": -30, "pan": ((tt * 10) % 3 - 1) * 0.3})
ev.append({"sound": "footsteps", "t0": 47.0, "t1": 52.0, "pan0": -0.2, "pan1": 0.2, "gain_db": -36, "rate": 2.2})
ev.append({"t": 55.7, "sound": "lamp_switch_click", "gain_db": -24, "pan": 0.0})   # the high-five
for e in ev:
    if e.get("room") is None:
        e.pop("room", None)

cues = {
    "title": "012 - What if everyone on Earth suddenly peed their pants? (mischief: pizzicato + mallet 'uh-oh')",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.6, D],
    "stem_gain_db": {"music": -4.0, "sfx": 14.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -6.0}},
    "sfx_lowpass_hz": 5000,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": -6.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "mallet_db": -2.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D,
              "chords": chords, "sections": sections, "melody": [], "mallet_melody": mallet, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(mallet), "mallet notes")
