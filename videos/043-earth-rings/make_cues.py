#!/usr/bin/env python3
"""Cue sheet for 043 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/043-earth-rings/make_cues.py

Sound identity: "SKY" — a glassy BELL ostinato in D LYDIAN at 96 bpm (D · E/D · Bm · G: the raised 4th = wonder), over soft
pluck basses (017 D-minor pluck, 027 E-minor pluck, 028/029 bells in F#m, 036 strings, 037 G-major mallets). Quiet open: Quito's
plaza (tourists murmuring, wind, a far street). The rings appear (3.2 s, ringed Earth from space) = a braam + a low swell and the
bells enter. A rising 3-note ping for every new sky (Quito, New York, Tokyo, Ohio). The shadow (31.4 s) turns the harmony to
D minor (Dm · Bb · F · C) with a low string drive + soft taiko through the swap and the satellites (a clang + boom on the hit),
the 466-million-year beat opens into a sparse wonder section (Bb · F · Gm · A), and the wedding resolves in D major with
applause + a crowd cheer under the end card. CROWD VOICES under every people beat (036 cut5 lesson). Music never drops out."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 65.4
M0 = 3.2                           # the rings appear: music enters
B = [0, 3.2, 5.6, 7.6, 10.4, 13.4, 16.3, 19.6, 22.4, 25.4, 28.3, 31.4, 34.1, 36.0, 38.0, 41.6, 43.2, 44.6, 47.6, 49.4, 51.0, 52.8, 55.0, 58.2, D]
BEAT = 60 / 96
END = 60.9
T_LIFT, T_HIT, T_KISS = 41.2, 45.9, 59.0
METEORS = [25.9, 26.8, 27.6, 28.9, 29.6, 30.3, 30.9]

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(M0, 31.4, ["D", "E", "Bm", "G"])                                    # wonder: the skies
run(31.4, 47.6, ["Dm", "Bb", "F", "C"])                                 # the shadow, seasons, orbits
run(47.6, 55.0, ["Bb", "F", "Gm", "A"], step=3 * BEAT)                  # 466 million years ago
run(55.0, D - 0.3, ["G", "D", "Em", "A", "G", "A", "D"], step=1.5)      # the wedding + end card

S8 = BEAT / 2
sections = [
    {"t0": M0, "t1": 31.4, "style": "ostinato", "inst": "bell", "vel": [[M0, 0.22], [19.6, 0.27], [31.4, 0.25]], "step": S8, "pattern": [0, 2, 4, 5, 4, 2, 1, 2], "bass_every": 4, "bass_vel": 0.65},
    {"t0": 31.4, "t1": 47.6, "style": "ostinato", "inst": "bell", "vel": [[31.4, 0.22], [41.6, 0.28], [47.6, 0.24]], "step": S8, "pattern": [0, 1, 2, 4, 2, 1], "bass_every": 2, "bass_vel": 0.85},
    {"t0": 47.6, "t1": 55.0, "style": "ostinato", "inst": "bell", "vel": [[47.6, 0.2], [55.0, 0.22]], "step": BEAT, "pattern": [0, 2, 4, 5, 4, 2], "bass_every": 3, "bass_vel": 0.6},
    {"t0": 55.0, "t1": D, "style": "ostinato", "inst": "bell", "vel": [[55.0, 0.24], [D, 0.2]], "step": S8, "pattern": [0, 2, 4, 2], "bass_every": 4, "bass_vel": 0.65},
]
strings = [
    {"t0": 19.6, "t1": 31.4, "style": "strings", "vel": [[19.6, 0.08], [25.4, 0.12], [31.4, 0.1]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.35},
    {"t0": 31.4, "t1": 47.6, "style": "strings", "vel": [[31.4, 0.12], [38.0, 0.2], [44.6, 0.26], [47.6, 0.18]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 55.0, "t1": D - 0.3, "style": "strings", "vel": [[55.0, 0.1], [59.0, 0.16], [D, 0.12]], "step": BEAT, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.35},
]
drums = [[M0, 0.6, "boom"], [31.4, 0.5, "boom"], [34.1, 0.35, "taiko"], [38.0, 0.5, "boom"], [T_LIFT + 0.5, 0.5, "boom"],
         [T_HIT, 0.85, "boom"], [T_HIT, 0.45, "taiko"], [47.6, 0.4, "boom"], [T_KISS + 0.2, 0.45, "boom"], [61.2, 0.3, "taiko"]]
drum_patterns = [
    {"t0": 34.1, "t1": 47.4, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[34.1, 0.12], [41.6, 0.22], [47.4, 0.18]], "kind": "taiko"},
    {"t0": 30.6, "t1": 31.35, "step": 0.1, "pattern": [1], "vel": [[30.6, 0.05], [31.35, 0.22]], "kind": "tom"},
]
melody = []
for s0, top in zip([7.6, 13.4, 19.6, 25.4], [86, 86, 88, 90]):          # a ping for every new sky
    melody += [[s0 + 0.08, top, 0.2], [s0 + 0.35, top - 5, 0.18], [s0 + 0.62, top - 3, 0.18]]
melody += [[55.2, 81, 0.2], [55.5, 85, 0.2], [55.8, 88, 0.22], [T_KISS + 0.3, 90, 0.22], [T_KISS + 0.6, 88, 0.2], [T_KISS + 0.9, 93, 0.24]]
CHORD_PAD = {"D": [50, 54, 57], "E": [52, 56, 59], "Bm": [47, 50, 54], "G": [55, 59, 62], "Dm": [50, 53, 57], "Bb": [46, 50, 53],
             "F": [53, 57, 60], "C": [48, 52, 55], "Gm": [55, 58, 62], "A": [45, 49, 52], "Em": [52, 55, 59]}
pad = [
    {"t0": M0, "t1": M0 + 2.4, "notes": [26, 38, 45, 50, 57], "level": 1.2, "attack": 0.15, "release": 0.9, "cutoff": 900, "hp": 30},    # braam: the rings
    {"t0": M0 + 0.3, "t1": 31.45, "notes": [26, 38, 45, 50], "level": 0.75, "attack": 0.9, "release": 0.5, "cutoff": 650, "hp": 30},
    {"t0": 31.4, "t1": 47.65, "notes": [26, 38, 45, 50], "level": 0.9, "attack": 0.6, "release": 0.5, "cutoff": 600, "hp": 30},
    {"t0": 47.6, "t1": 55.05, "notes": [34, 41, 46, 53], "level": 0.8, "attack": 0.8, "release": 0.6, "cutoff": 700, "hp": 30},
    {"t0": 55.0, "t1": D - 0.3, "notes": [26, 38, 45, 50], "level": 0.85, "attack": 0.6, "release": 1.0, "cutoff": 800, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.6, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

def bed(sound, t0, t1, gain, args=None, seed=1, fi=0.06, fo=0.08):
    d = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": gain, "seed": seed}
    if args: d["args"] = args
    return d
amb = [
    # Quito: tourists murmuring + wind + a far street (quiet open); an "ooh" swell at the line
    bed("crowd_cheer", 0.0, 3.25, -36, {"excite": 0.3}, 1, fi=0.5),
    bed("city_day", 0.0, 3.25, -42, {"murmur": 0.8, "traffic": 0.1}, 1, fi=0.5),
    bed("wind", 0.0, 3.25, -44, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 1),
    bed("crowd_cheer", 7.6, 13.45, -30, {"excite": 0.6}, 2),
    bed("city_day", 7.6, 13.45, -42, {"murmur": 0.8, "traffic": 0.1}, 2),
    # space: just the music + a low rumble of ice
    bed("wind", 5.6, 7.65, -46, {"darkness": 0.9, "gust": 0.1, "whistle": 0.0}, 2),
    # New York: traffic, a stopped street, phones up, chatter
    bed("traffic_flow", 13.4, 19.65, -38, None, 1),
    bed("city_day", 13.4, 19.65, -36, {"murmur": 1.0, "traffic": 0.5}, 3),
    bed("crowd_cheer", 13.4, 19.65, -33, {"excite": 0.5}, 3),
    # Tokyo rooftop party at sunset
    bed("crowd_cheer", 19.6, 25.45, -31, {"excite": 0.6}, 4),
    bed("city_day", 19.6, 25.45, -42, {"murmur": 0.5, "traffic": 0.4}, 4),
    bed("wind", 19.6, 25.45, -44, {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, 3),
    # Ohio night: crickets, a quiet porch, the lawn family gasps at each meteor
    bed("crickets", 25.4, 31.45, -36, None, 1),
    bed("crowd_cheer", 25.4, 31.45, -40, {"excite": 0.3}, 5),
    # Miami pool: splashing kids, then the cold
    bed("crowd_cheer", 31.4, 34.15, -30, {"excite": 0.8}, 6),
    bed("surf", 31.4, 38.05, -40, None, 1),
    bed("wind", 34.1, 38.05, -36, {"darkness": 0.5, "gust": 0.7, "whistle": 0.0}, 4, fi=0.6),
    bed("crowd_cheer", 36.0, 38.05, -38, {"excite": 0.2}, 7),
    # the launch: beach crowd + the rumble
    bed("crowd_cheer", 41.6, 44.65, -30, {"excite": 1.0}, 8),
    bed("rocket_rumble", 41.3, 44.65, -26, {"rise": 1.0}, 1, fi=0.3),
    bed("surf", 41.6, 44.65, -40, None, 2),
    # the classroom: room tone + kids
    bed("room_tone", 47.6, 55.05, -40, None, 1),
    bed("crowd_cheer", 47.6, 51.05, -38, {"excite": 0.3}, 9),
    bed("crowd_cheer", 52.8, 55.05, -38, {"excite": 0.4}, 10),
    bed("wind", 52.8, 55.05, -40, {"darkness": 0.5, "gust": 0.8, "whistle": 0.0}, 5),
    # the wedding: garden murmur → the kiss → cheer + applause under the end card
    bed("crowd_cheer", 55.0, T_KISS + 0.2, -36, {"excite": 0.3}, 11),
    bed("crowd_cheer", T_KISS + 0.2, D, -28, {"excite": 1.0}, 12, fi=0.3, fo=1.2),
    bed("applause", T_KISS + 0.3, D, -32, {"density": 30.0, "swell": 0.4}, 1, fi=0.3, fo=1.2),
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
e(M0, "low_swell", -20, 0.0, {"dur": 2.6, "pitch": 1.0}, hall=-14)
e(M0, "distant_boom", -20, 0.0, {"size": 1.2})
e(7.6, "low_swell", -30, 0.0, {"dur": 1.6, "pitch": 1.3})
for k, tt in enumerate(METEORS):
    e(tt, "flash_swish", -34, (k % 3 - 1) * 0.4)
e(31.4, "low_swell", -26, 0.0, {"dur": 2.0, "pitch": 0.8})
for k in range(4):
    e(31.6 + k * 0.6, "water_splash", -34, (k - 1.5) * 0.3, {"size": 0.3})
e(34.1, "low_swell", -22, 0.0, {"dur": 2.4, "pitch": 0.7})
e(36.2, "breath", -32, 0.1, {"dur": 0.6, "inhale": False})
e(38.0, "whoosh_timeskip", -30, 0.0)
e(T_LIFT + 0.4, "distant_boom", -18, 0.0, {"size": 1.4})
e(T_HIT - 0.3, "pop", -30, 0.1, {"pitch": 1.2})
e(T_HIT - 0.15, "pop", -30, -0.1, {"pitch": 1.4})
e(T_HIT, "metal_clang", -16, 0.0, {"size": 1.2, "pitch": 0.9})
e(T_HIT, "distant_boom", -16, 0.0, {"size": 1.0})
e(T_HIT + 0.1, "crumble", -26, 0.0, {"dur": 1.0})
e(51.0, "low_swell", -24, 0.0, {"dur": 1.8, "pitch": 0.9})
e(52.9, "breath", -30, -0.1, {"dur": 0.5, "inhale": False})
e(T_KISS + 0.2, "pop", -26, 0.0, {"pitch": 0.8})
e(T_KISS + 0.25, "blanket_rustle", -30, 0.0, {"dur": 1.2, "softness": 0.4, "intensity": 0.9, "strokes": 6})

cues = {
    "title": "043 - What if Earth had rings like Saturn? (science: D-Lydian bell ostinato 96 bpm -> D-minor shadow drive -> wonder -> D, crowd beds)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.5, D],
    "stem_gain_db": {"music": -5.5, "sfx": 6.0, "amb": 10.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": BEAT * 0.75, "feedback": 0.3, "mix": 0.22, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 5.0, "drums_db": -8.0, "mallet_db": -1.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": M0, "midi": 26, "vel": 0.42, "hold": 2.2}, {"t": 31.4, "midi": 26, "vel": 0.38, "hold": 2.0}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
