#!/usr/bin/env python3
"""Cue sheet for 029 (SCIENCE lane, tone whatif) -> cues.json.   python3 -I videos/029-moon-twice-as-close/make_cues.py

Sound identity: LUNAR. 017 and 027 were pluck ostinatos in D / E minor; this one is a glassy BELL voice with a long echo in
E-flat major at 90 bpm — wonder first, weight later. A quiet open: a harbor at dusk (small surf, a crowd murmuring on the quay,
a breeze). SECOND 0 (6.2 s): a sinking pressure drop + a braam + a soft boom, and the bell "moon motif" (E♭ → B♭ → E♭, the
doubling) starts a slow arp over E♭ – A♭/E♭ – Cm – B♭ with a warm pad. The tide beats turn to C minor with a low string drive
and soft taiko (the water rises under it), a boom when the Bay of Fundy climbs the stacks and a tom roll into the eclipse.
Totality is a HUSH, never a dropout: the arp thins to one bell per bar over a held A♭ pad, the crowd gasps, crickets start (real
eclipse behaviour). The calendar beat is light (a playful bell figure, the kid's "awoo", the dog answers); orbit swells; the
ending turns warm (E♭ major arp + a slow bell melody) under the end card. Scene beds per place. Times match shots.js SHOTS."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 61.4
SW = 6.2                                       # SECOND 0
B = [0, 3.4, 8.6, 12.2, 16.4, 19.6, 22.4, 26.4, 32.4, 35.4, 39.0, 43.6, 48.2, 51.0, 54.0, D]   # shot boundaries (shots.js)
BEAT = 60 / 90.0
S8 = BEAT / 2

chords = []
def run(t0, t1, prog, step=2 * BEAT):
    t, k = t0, 0
    while t < t1 - 1e-6:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += step; k += 1
run(SW, 16.4, ["Eb", "Ab", "Cm", "Bb"])                        # wonder
run(16.4, 32.4, ["Cm", "Ab", "Eb", "Bb"])                      # the tides: weight
run(32.4, 39.0, ["Ab", "Ab", "Fm", "Ab"], step=4 * BEAT)       # the eclipse hush
run(39.0, 48.2, ["Eb", "Bb", "Cm", "Ab"])                      # calendar + orbit
run(48.2, D - 0.3, ["Eb", "Ab", "Eb", "Bb", "Eb", "Ab", "Eb"], step=1.9)   # home

sections = [
    {"t0": SW, "t1": 16.4, "style": "arp", "vel": [[SW, 0.26], [16.4, 0.28]], "step": S8, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": 16.4, "t1": 32.4, "style": "arp", "vel": [[16.4, 0.26], [26.4, 0.29], [32.4, 0.31]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": 32.4, "t1": 39.0, "style": "arp", "vel": [[32.4, 0.24], [34.2, 0.2], [39.0, 0.22]], "step": BEAT, "pattern": [0, 2, 3, 1]},
    {"t0": 39.0, "t1": 43.6, "style": "arp", "vel": 0.25, "step": S8, "pattern": [0, 2, 3, 2, 1, 3]},
    {"t0": 43.6, "t1": 48.2, "style": "arp", "vel": [[43.6, 0.26], [48.2, 0.3]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": 48.2, "t1": D, "style": "arp", "vel": [[48.2, 0.27], [D, 0.24]], "step": 0.475, "pattern": [0, 1, 2, 3, 2, 1]},
]
strings = [
    {"t0": 16.4, "t1": 26.4, "style": "strings", "vel": [[16.4, 0.16], [26.4, 0.28]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.25},
    {"t0": 26.4, "t1": 32.4, "style": "strings", "vel": [[26.4, 0.28], [32.4, 0.38]], "step": S8 / 2, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
    {"t0": 43.6, "t1": 48.2, "style": "strings", "vel": [[43.6, 0.16], [48.2, 0.24]], "step": S8, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
]
drums = [[SW, 0.8, "boom"], [16.4, 0.4, "taiko"], [19.6, 0.45, "taiko"], [22.4, 0.5, "boom"], [26.4, 0.45, "taiko"],
         [29.6, 0.85, "boom"], [32.4, 0.6, "boom"], [34.2, 0.45, "boom"], [43.6, 0.4, "taiko"], [48.2, 0.35, "boom"]]
drum_patterns = [
    {"t0": 19.6, "t1": 32.3, "step": BEAT * 2, "pattern": [1, 0.55], "vel": [[19.6, 0.16], [32.3, 0.3]], "kind": "taiko"},
    {"t0": 31.5, "t1": 32.35, "step": 0.09, "pattern": [1], "vel": [[31.5, 0.1], [32.35, 0.4]], "kind": "tom"},
]
# the moon motif: E♭5 → B♭5 → E♭6 rising at SECOND 0; once more, slower, for the full moon again; a bell per place
melody = [[SW + 0.05, 75, 0.32], [SW + 0.45, 82, 0.3], [SW + 0.85, 87, 0.33]]
for s0, top in zip([12.2, 16.4, 22.4, 26.4, 39.0, 43.6], [82, 79, 77, 84, 87, 86]):
    melody += [[s0 + 0.05, top, 0.22], [s0 + 0.38, top - 5, 0.18]]
melody += [[34.25, 80, 0.3], [34.9, 84, 0.26], [35.6, 87, 0.24]]                                  # totality: three slow bells
melody += [[41.55, 87, 0.24], [41.75, 84, 0.22], [41.95, 82, 0.22]]                               # 37 full moons: a playful fall
melody += [[48.5, 75, 0.3], [49.1, 82, 0.28], [49.7, 87, 0.3], [51.1, 84, 0.24], [52.3, 82, 0.24], [53.5, 79, 0.24], [54.9, 75, 0.26]]   # home

CHORD_PAD = {"Eb": [51, 55, 58], "Ab": [51, 56, 60], "Cm": [48, 51, 55], "Bb": [50, 53, 58], "Fm": [48, 53, 56]}
pad = [
    {"t0": SW, "t1": SW + 2.6, "notes": [27, 34, 39, 46, 51], "level": 1.35, "attack": 0.1, "release": 0.8, "cutoff": 900, "hp": 30},   # braam
    {"t0": SW + 0.3, "t1": 16.45, "notes": [27, 39, 46, 51], "level": 0.9, "attack": 0.9, "release": 0.6, "cutoff": 650, "hp": 30},
    {"t0": 16.4, "t1": 32.45, "notes": [24, 36, 43, 48], "level": 0.95, "attack": 0.6, "release": 0.6, "cutoff": 700, "hp": 30},
    {"t0": 32.4, "t1": 39.05, "notes": [32, 44, 51, 56], "level": 1.05, "attack": 0.5, "release": 0.6, "cutoff": 800, "hp": 30},
    {"t0": 39.0, "t1": 48.25, "notes": [27, 39, 46, 51], "level": 0.9, "attack": 0.5, "release": 0.6, "cutoff": 700, "hp": 30},
    {"t0": 48.2, "t1": D - 0.3, "notes": [27, 39, 46, 51, 55], "level": 1.0, "attack": 0.6, "release": 1.0, "cutoff": 850, "hp": 30},
]
for i, (ct, sym) in enumerate(chords):          # a soft chord pad under the bells (they ring long, the pad keeps the floor)
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": ct, "t1": c1 + 0.35, "notes": CHORD_PAD[sym], "level": 0.62 if (ct < 16.4 or ct >= 39.0) else 0.55, "attack": 0.25, "release": 0.6, "cutoff": 1400, "hp": 110})

amb = [
    # harbor at dusk: small surf on the wall, people murmuring on the quay, a breeze
    {"sound": "surf", "t0": 0.0, "t1": 12.25, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -40, "args": {"size": 0.35}, "seed": 1},
    {"sound": "city_day", "t0": 0.0, "t1": 12.25, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.9, "traffic": 0.0}, "seed": 2},
    {"sound": "wind", "t0": 0.0, "t1": 12.25, "fade_in": 0.4, "fade_out": 0.06, "gain_db": -50, "args": {"darkness": 0.7, "gust": 0.3, "whistle": 0.0}, "seed": 1},
    {"sound": "crowd_cheer", "t0": 6.4, "t1": 8.4, "fade_in": 0.25, "fade_out": 0.9, "gain_db": -42, "args": {"excite": 0.35}, "seed": 3},   # the gasp
    # New York rooftop: far traffic, a little wind
    {"sound": "traffic_flow", "t0": 12.2, "t1": 16.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "seed": 1},
    {"sound": "city_day", "t0": 12.2, "t1": 16.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"murmur": 0.4, "traffic": 0.5}, "seed": 4},
    {"sound": "wind", "t0": 12.2, "t1": 16.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -50, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    # the flood: rushing water rising, the surf bigger
    {"sound": "water_rush", "t0": 16.4, "t1": 22.45, "fade_in": 0.5, "fade_out": 0.06, "gain_db": -42, "args": {"intensity": 0.8}, "seed": 1},
    {"sound": "surf", "t0": 16.4, "t1": 22.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -40, "args": {"size": 0.8}, "seed": 2},
    # low tide, morning: wind over the mud, a few drips
    {"sound": "wind", "t0": 22.4, "t1": 26.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -46, "args": {"darkness": 0.4, "gust": 0.5, "whistle": 0.04}, "seed": 3},
    {"sound": "surf", "t0": 22.4, "t1": 26.45, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -52, "args": {"size": 0.2}, "seed": 3},
    # Fundy: tourists' voices, then the bay pouring in
    {"sound": "city_day", "t0": 26.4, "t1": 29.8, "fade_in": 0.05, "fade_out": 0.5, "gain_db": -46, "args": {"murmur": 0.8, "traffic": 0.0}, "seed": 5},
    {"sound": "water_rush", "t0": 26.4, "t1": 32.45, "fade_in": 1.2, "fade_out": 0.06, "gain_db": -38, "args": {"intensity": 1.0}, "seed": 2},
    {"sound": "surf", "t0": 26.4, "t1": 32.45, "fade_in": 0.6, "fade_out": 0.06, "gain_db": -38, "args": {"size": 1.1}, "seed": 4},
    # Quito: a crowd in the plaza going quiet; crickets at totality
    {"sound": "city_day", "t0": 32.4, "t1": 39.05, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -44, "args": {"murmur": 0.9, "traffic": 0.05}, "seed": 6},
    {"sound": "crowd_cheer", "t0": 34.1, "t1": 36.6, "fade_in": 0.3, "fade_out": 1.2, "gain_db": -44, "args": {"excite": 0.3}, "seed": 5},
    {"sound": "crickets", "t0": 34.6, "t1": 39.05, "fade_in": 1.2, "fade_out": 0.06, "gain_db": -48, "seed": 1},
    # Ohio kitchen at 7 AM
    {"sound": "room_tone", "t0": 39.0, "t1": 43.65, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -42},
    # space: almost nothing
    {"sound": "room_tone", "t0": 43.6, "t1": 48.25, "fade_in": 0.05, "fade_out": 0.06, "gain_db": -54},
    # the harbor at night, Day 11: gentle surf, crickets on the hill, a breeze
    {"sound": "surf", "t0": 48.2, "t1": D, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -42, "args": {"size": 0.3}, "seed": 6},
    {"sound": "crickets", "t0": 48.2, "t1": D, "fade_in": 0.3, "fade_out": 1.2, "gain_db": -52, "seed": 2},
    {"sound": "wind", "t0": 48.2, "t1": D, "fade_in": 0.05, "fade_out": 1.2, "gain_db": -52, "args": {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}, "seed": 4},
]

ev = []
def e(t, sound, gain, pan=0.0, args=None, room=None, hall=None):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    if room is not None: d["room"] = room
    if hall is not None: d["hall"] = hall
    ev.append(d)
e(SW, "pressure_drop", -13, 0.0, {"dur": 2.2}, hall=-12)                  # SECOND 0: the Moon jumps closer
e(SW + 0.9, "low_swell", -22, 0.0, {"dur": 1.6, "pitch": 0.8})             # it arrives at its new size (≈ 7.4)
e(12.75, "blanket_rustle", -28, 0.1, {"dur": 0.45, "softness": 0.3, "intensity": 0.9})   # the newspaper goes up
e(19.0, "low_swell", -24, 0.0, {"dur": 3.0, "pitch": 0.6}, hall=-14)       # the sea over the quay
e(18.9, "metal_groan", -34, 0.25, {"pitch": 1.3, "dur": 1.2})               # a car lifts off the street
e(20.4, "alarm_muffled", -40, -0.3, {"dur": 1.8})                           # …and its alarm, underwater-muffled
for k, tt in enumerate((23.0, 23.9, 24.7, 25.6)):                            # drips off the keeled-over boats
    e(tt, "fish_blub", -40, (k % 2 - 0.5) * 0.4, {"n_bub": 1})
e(28.6, "water_splash", -26, 0.0, {"size": 0.9})                            # the front reaches the stair foot
e(29.6, "distant_boom", -18, 0.0, {"size": 1.2})                             # the bay climbs the stacks
e(31.2, "low_swell", -22, 0.0, {"dur": 1.4, "pitch": 0.9})
e(34.2, "low_swell", -24, 0.0, {"dur": 2.0, "pitch": 0.55}, hall=-12)       # totality
e(41.6, "puppy_howl", -30, -0.15, {"pitch": 0.72, "dur": 1.2})               # the kid's werewolf "awoo"
e(42.6, "dog_bark", -30, 0.2, {"pitch": 1.1})                               # the dog answers
e(43.8, "low_swell", -26, 0.0, {"dur": 2.4, "pitch": 0.7}, hall=-12)        # out into space

cues = {
    "title": "029 - What if the Moon were twice as close? (science: quiet harbor -> lunar bell arp in E-flat -> C-minor tide drive + taiko -> eclipse hush -> warm home)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [60.8, D],
    "stem_gain_db": {"music": -3.0, "sfx": 6.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -16.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5200,
    "shots": B,
    "ambience": amb, "events": ev,
    "music": {"instrument": "bell", "echo": {"delay": BEAT * 0.75, "feedback": 0.36, "mix": 0.3, "lp_hz": 2800},
              "gain_db": -1.0, "reverb_db": -8.0, "pad_db": 1.0, "pad_reverb_db": -4.0, "strings_db": 6.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": strings, "echo_notes_only": True, "melody": melody, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": SW, "midi": 27, "vel": 0.45, "hold": 2.2}, {"t": 29.6, "midi": 24, "vel": 0.4, "hold": 1.8}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 0.8},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.5}, {"f": 6500, "q": 0.6, "db": -5.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events")
