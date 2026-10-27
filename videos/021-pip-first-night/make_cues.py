# Generates cues.json for video 021 (Pip ep. 1, lane 3 @ed._.sims): "What if your new puppy cried all night on his first night home?"
# Run: python3 -I videos/021-pip-first-night/make_cues.py videos/021-pip-first-night/cues.json
#
# Sound identity — "COZY LULLABY" (the Pip series' own voice; new: not 016's gossip jazz or 014's music box tour):
#   - 0–3.4 s: the question over a quiet room (room tone, one tiny whimper). No music.
#   - 3.6 s "This is Pip.": PIP'S THEME enters — a music box (celesta voice, new synth `bell_melody`) over a soft piano waltz
#     in F (3/4, 100 bpm, bass on 1, chord on 2 + 3) and a warm pad. The theme is the series' signature; reuse it every episode.
#   - 11.3 s lights out: the waltz stops, the pad + three sleepy music-box notes carry it (never a hole).
#   - 13.8 s the howl: the same waltz turns D minor — a comic lullaby; each attempt starts with a hopeful music-box phrase and
#     ends with a soft falling "uh-oh" third + a low piano note on the failure (the alarm, the bonk, the roll).
#   - 2:58 AM: held minor chords, slower. 3 AM: a heartbeat-slow piano pulse up the stairs, a rising music-box line on the perk.
#   - 47.0 s "She didn't say a word.": the turn to F major, the theme slowly on piano; the sunrise = a swelling arp;
#     morning = the waltz back in F, brighter; the end card resolves on F.
# Foley (story.json → "pip" holds the shared event times): soft low-passed whimpers (new `whimper`), a tiny howl (new
# `puppy_howl`), the "ticking clock" as a muffled heartbeat (new `heartbeat`), a twin-bell alarm under a towel (new
# `alarm_muffled`), plush squeaks on every sob, paw patter, the crate door, a bonk, licks.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.4, 9.4, 12.4, 15.0, 17.2, 19.8, 24.2, 26.6, 30.4, 32.8, 36.6, 38.8, 41.0, 44.4, 47.0, 49.3, 51.4, 53.4, 56.0, 59.6, 62.6]
IN_M = 3.6                                # music enters ("This is Pip.")
OFF, HOWL = 11.3, EV["howl"][0]           # lights out, the howl
TURN, SUN, MORN, END = 47.0, 51.4, 53.4, 62.6
BEAT = 0.6; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "A7": (45, [55, 61, 64], [45, 55, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
    "F/C": (36, [57, 60, 65], [48, 57, 60, 65]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.24, stac=0.42):
    """Piano oom-pah-pah: bass on 1 (held), chord on 2 and 3 (short). bars = [chord, ...]."""
    for i, c in enumerate(bars):
        tb = t0 + i * BAR; b, tri, _ = CH[c]
        chords.append([round(tb, 3), c])
        melody.append([round(tb, 3), b + 12 if b < 40 else b, vel, False, BAR * 0.95])
        for k in (1, 2):
            for j, m in enumerate(tri):
                melody.append([round(tb + k * BEAT + 0.008 * j, 3), m, vel * (0.62 if k == 1 else 0.52), False, stac])
    return t0 + len(bars) * BAR

def held(t0, seq, vel=0.24):
    """Rolled held chords: seq = [(chord, length_s), ...]."""
    t = t0
    for c, L in seq:
        b, tri, _ = CH[c]; chords.append([round(t, 3), c])
        melody.append([round(t, 3), b + 12 if b < 40 else b, vel, False, L + 0.3])
        for j, m in enumerate(tri):
            melody.append([round(t + 0.07 * (j + 1), 3), m, vel * 0.7, False, L + 0.2])
        t += L
    return t

def box(t0, notes, vel=0.42, beat=BEAT):
    """Music-box line: notes = [(midi, beats), ...] starting at t0."""
    t = t0
    for m, nb in notes:
        if m:
            bell.append([round(t, 3), m, vel, max(1.2, nb * beat + 0.9)])
        t += nb * beat
    return t

def pads(seq, level=0.6, att=0.4, rel=0.7):
    for t0, t1, c in seq:
        pad.append({"t0": round(t0, 3), "t1": round(t1 + 0.35, 3), "notes": CH[c][2], "level": level, "attack": att, "release": rel})

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]           # bars 1–4: F F Bb F
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]           # bars 5–8: F C Bb-C F

# ---- A: home (3.6–10.8): the theme over the waltz in F
t = waltz(IN_M, ["F", "F", "Bb", "F"], 0.22)
box(IN_M, THEME_A, 0.44)
pads([(IN_M - 0.2, IN_M + BAR * 2, "F"), (IN_M + BAR * 2, IN_M + BAR * 3, "Bb"), (IN_M + BAR * 3, OFF, "F")], 0.55)
# ---- B: lights out (11.3–13.8): pad + three sleepy notes
chords.append([OFF, "F"])
box(OFF + 0.1, [(77, 1.4), (72, 1.4), (69, 1.4)], 0.3)
pads([(OFF, HOWL, "F")], 0.75)
# ---- C: the long night (13.8–36.6): D-minor comic lullaby
night = ["Dm", "Gm", "C", "F", "Bb", "Gm", "A7", "Dm", "Dm", "Gm", "C", "F", "Bb"]
t = waltz(HOWL, night, 0.19, 0.5)
cur = HOWL
for c in night:
    pads([(cur, cur + BAR, c)], 0.9, 0.2, 0.7); cur += BAR
# a hopeful phrase as each attempt starts, an "uh-oh" fall on each failure
for ta in (17.25, 24.25, 30.45):
    box(ta, [(69, 0.5), (74, 0.5), (77, 1), (76, 0.5), (74, 1.5)], 0.38)
for tf in (EV["ring"][0] + 0.05, EV["bonk"] + 0.05, 34.6):
    box(tf, [(77, 0.75), (74, 1.5)], 0.42)
melody += [[EV["ring"][0], 38, 0.3, False, 1.2], [EV["bonk"], 38, 0.28, False, 1.0], [34.6, 41, 0.26, False, 1.0]]
box(HOWL + 0.05, [(74, 1), (77, 1), (81, 1), (79, 2), (77, 1)], 0.34)        # the lullaby's minor head under "So Pip fixed that."
# ---- D: 2:58 AM (36.6–41.0): held, slow, soft
t = held(cur, [("Dm", 1.1), ("Bb", 1.1), ("Gm", 1.1), ("A", 41.0 - cur - 3.3)], 0.2)
pads([(cur, cur + 1.1, "Dm"), (cur + 1.1, cur + 2.2, "Bb"), (cur + 2.2, cur + 3.3, "Gm"), (cur + 3.3, 41.0, "A")], 0.7, 0.3, 0.6)
box(37.0, [(74, 2), (73, 2), (69, 3)], 0.26)
# ---- E: the stairs (41.0–47.0): a slow heartbeat pulse, a rising line on the perk
seqE = [("Dm", 41.0, 42.8), ("Bb", 42.8, 44.4), ("F/C", 44.4, 45.6), ("C", 45.6, TURN)]
for c, a, b in seqE:
    chords.append([a, c]); bs = CH[c][0]
    k = 0
    while a + k * BEAT < b - 0.05:
        melody.append([round(a + k * BEAT, 3), bs + 12 if bs < 40 else bs, 0.2 if k % 2 == 0 else 0.15, False, BEAT * 0.9]); k += 1
    melody.append([round(a + 0.05, 3), CH[c][1][1], 0.16, False, b - a])
pads([(a, b, c) for c, a, b in seqE], 0.7, 0.3, 0.6)
box(41.3, [(69, 2), (70, 2), (72, 2.5)], 0.3)
box(44.45, [(72, 0.5), (77, 0.5), (81, 1), (84, 2)], 0.4)
# ---- F: the turn (47.0–51.4): F major, the theme slowly on the piano, the music box an octave up
held(TURN, [("F", 1.8), ("Bb", 1.8), ("F", SUN - TURN - 3.6)], 0.2)
slow = 0.7
for m, nb, tt in [(72, 1, 0), (69, 1, 1), (72, 1, 2), (77, 2, 3), (76, 1, 5)]:
    melody.append([round(TURN + 0.05 + tt * slow, 3), m, 0.3, False, nb * slow + 0.2])
box(TURN + 0.05, [(84, 1), (81, 1), (84, 1), (89, 2), (88, 1)], 0.24, slow)
pads([(TURN, TURN + 1.8, "F"), (TURN + 1.8, TURN + 3.6, "Bb"), (TURN + 3.6, SUN, "F")], 0.85, 0.5, 0.8)
# ---- G: sunrise (51.4–53.4): swelling arp Bb → C → F
for c, a, b in [("Bb", SUN, SUN + 0.7), ("C", SUN + 0.7, SUN + 1.4), ("F", SUN + 1.4, MORN)]:
    chords.append([a, c]); tri = CH[c][1]
    k = 0
    while a + k * 0.175 < b - 0.02:
        melody.append([round(a + k * 0.175, 3), (tri + [m + 12 for m in tri])[k % 6], 0.2 + 0.12 * (a - SUN) / 2.0, False, 0.5]); k += 1
pads([(SUN, SUN + 0.7, "Bb"), (SUN + 0.7, SUN + 1.4, "C"), (SUN + 1.4, MORN, "F")], 1.0, 0.25, 0.6)
box(SUN + 1.4, [(77, 1), (81, 1), (84, 2)], 0.36, 0.33)
# ---- H: morning (53.4–62.6): the waltz in F, brighter; the theme's second half
t = waltz(MORN, ["F", "C", "Bb", "F", "F"], 0.24)
box(MORN, THEME_B, 0.46)
cur = MORN
for c in ["F", "C", "Bb", "F", "F"]:
    pads([(cur, cur + BAR + (0.6 if cur + BAR > END - 0.5 else 0), c)], 0.7, 0.3, 0.6); cur += BAR
# ---- I: end card (62.6–D): the theme's last phrase, slower, then a held F
held(END, [("Bb", 1.4), ("C7", 1.2), ("F", D - END - 2.6)], 0.22)
box(END + 0.05, [(74, 1), (76, 1), (77, 3)], 0.4, 0.8)
pads([(END, END + 1.4, "Bb"), (END + 1.4, END + 2.6, "C7"), (END + 2.6, D - 0.2, "F")], 0.75, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 15.05, -40, fi=0.3),
    amb_("wind", 9.4, 15.05, -54, {"darkness": 0.7, "gust": 0.15, "whistle": 0.0}, 2, fi=0.6),
    amb_("room_tone", 15.0, 17.25, -41, seed=3),
    amb_("room_tone", 17.2, 36.65, -40, seed=4), amb_("wind", 17.2, 36.65, -55, {"darkness": 0.7, "gust": 0.15, "whistle": 0.0}, 5),
    amb_("room_tone", 36.6, 41.05, -42, seed=6),
    amb_("room_tone", 41.0, SUN + 0.05, -41, seed=7), amb_("wind", 41.0, SUN, -56, {"darkness": 0.75, "gust": 0.1, "whistle": 0.0}, 8, fo=0.8),
    amb_("room_tone", SUN, D, -40, seed=9, fo=1.2),
]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

ev = []
for i, tw in enumerate(EV["whimpers"]):
    ev.append(ev_(tw, "whimper", -27 if tw > 3 else -30, 0.0, {"pitch": 1.0 + 0.06 * ((i % 3) - 1), "dur": 0.42}))
ev.append(ev_(EV["howl"][0] + 0.05, "puppy_howl", -27, 0.0, {"dur": EV["howl"][1] - EV["howl"][0] - 0.1}))
# home: paw patter during the zoomies, a soft boof on the pounce, the bunny squeak on the grab
k = 0
while 3.45 + k * 0.13 < 6.7:
    ev.append(ev_(3.45 + k * 0.13, "footstep", -36 + (1 if k % 2 else 0), 0.25 * ((k % 5) - 2) / 2, {"weight": 0.25, "scuff": 0.25})); k += 1
ev += [ev_(6.95, "dog_bark", -30, 0.0, {"pitch": 1.45}), ev_(7.35, "plush_squeak", -27, 0.0, {"pitch": 0.8}), ev_(7.75, "plush_squeak", -29, 0.0, {"pitch": 0.85})]
# bed1: the crate door, the lamp, Mia pads off
ev += [ev_(11.0, "latch_click", -29, 0.0), ev_(11.3, "lamp_switch_click", -30, -0.3)]
for j in range(4):
    ev.append(ev_(11.7 + j * 0.42, "footstep", -33 - j, -0.3 - 0.1 * j, {"weight": 0.45, "scuff": 0.5}))
# pop: two blankets rustle, the lamp clicks on
ev += [ev_(15.45, "blanket_rustle", -29, 0.0, {"dur": 0.4, "softness": 0.6, "intensity": 0.6}), ev_(15.95, "lamp_switch_click", -30, 0.25)]
# clock: the "ticking clock" = a muffled heartbeat until the alarm
tb = 18.6
while tb < EV["ring"][0] - 0.2:
    ev.append(ev_(tb, "heartbeat", -31, 0.0)); tb += 0.86
ev += [ev_(19.05, "blanket_rustle", -31, 0.0, {"dur": 0.4, "softness": 0.7, "intensity": 0.5})]
ev += [ev_(EV["ring"][0], "alarm_muffled", -25, 0.05, {"dur": EV["ring"][1] - EV["ring"][0]}), ev_(EV["ring"][0] + 0.06, "whimper", -29, 0.0, {"pitch": 1.35, "dur": 0.25}),
       ev_(EV["ring"][0] + 0.48, "plush_place", -31, 0.0)]
# towel: the drape, a tiny snore under it, the ghost's patter, BONK into the bars
ev += [ev_(25.85, "blanket_rustle", -27, 0.0, {"dur": 0.6, "softness": 0.7, "intensity": 0.7}), ev_(27.1, "snore", -36, 0.0, {"dur": 1.2, "size": 0.45})]
for j in range(5):
    ev.append(ev_(28.62 + j * 0.13, "footstep", -36, 0.0, {"weight": 0.25, "scuff": 0.2}))
ev += [ev_(EV["bonk"], "bonk", -25, 0.0, {"dur": 0.35}), ev_(EV["bonk"] + 0.01, "metal_clang", -33, 0.0, {"size": 0.3, "pitch": 2.0})]
# bunny: placed, then every sob squeaks it; the roll
ev += [ev_(31.6, "plush_place", -30, 0.0)]
for tq in EV["squeaks"]:
    ev.append(ev_(tq + 0.04, "plush_squeak", -28, 0.0, {"pitch": 0.75}))
ev.append(ev_(34.6, "blanket_rustle", -31, 0.0, {"dur": 0.5, "softness": 0.7, "intensity": 0.5}))
# 2:58: Dad snores under the pillow; Mia's blanket flies off
ev += [ev_(36.75, "snore", -35, -0.25, {"dur": 1.6, "size": 0.9}), ev_(40.35, "blanket_rustle", -26, 0.0, {"dur": 0.6, "softness": 0.4, "intensity": 0.9})]
# stairs: the flashlight click, small steps down, one creak
ev.append(ev_(41.08, "lamp_switch_click", -33, 0.0))
for j in range(8):
    ev.append(ev_(41.3 + j * 0.38, "footstep", -35 + 0.5 * j, 0.0, {"weight": 0.4, "scuff": 0.35}))
ev.append(ev_(42.35, "floorboard_creak", -34, 0.0, {"dur": 0.4}))
# perk: a happy little boof
ev.append(ev_(46.05, "dog_bark", -31, 0.0, {"pitch": 1.5}))
# stay: she lies down, two licks; later a tiny snore
ev += [ev_(47.2, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.7, "intensity": 0.5})]
for tl in EV["lick"][:2]:
    ev.append(ev_(tl, "slurp", -33, 0.0, {"dur": 0.25}))
ev.append(ev_(50.0, "snore", -37, 0.0, {"dur": 1.3, "size": 0.4}))
# sunrise swell
ev.append(ev_(SUN + 0.1, "low_swell", -27, 0.0, {"dur": 1.8, "pitch": 0.9}))
# morning: the phone photo (a soft click), Pip's yawn, licks, tail thumps on the cushion, Dad's sip
ev += [ev_(55.3, "lamp_switch_click", -33, 0.2), ev_(EV["wake"] + 0.05, "whimper", -31, 0.0, {"pitch": 0.75, "dur": 0.55})]
for tl in EV["lick"][2:]:
    ev.append(ev_(tl, "slurp", -32, 0.0, {"dur": 0.25}))
for j in range(6):
    ev.append(ev_(57.95 + j * 0.2, "giant_step", -34, 0.1, {"size": 0.1, "surface": "wood"}))
ev.append(ev_(60.05, "slurp", -31, 0.0, {"dur": 0.6}))

cues = {
    "title": "021 - What if your new puppy cried all night on his first night home? (Pip ep. 1: cozy lullaby, music box + piano waltz)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 1.0, D],
    "stem_gain_db": {"music": -8.0, "sfx": 10.0, "amb": 7.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 4800,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0,
              "bell_db": -3.0, "bell_lp": 4200, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.3}, "end": D,
              "chords": chords, "sections": [], "melody": melody, "bell_melody": bell, "pad": pad,
              "stings": [], "ducks": [], "auto_duck": {"db": -2.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.25, "max_len": 1.2},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"{len(ev)} events, {len(melody)} piano notes, {len(bell)} music-box notes, {len(pad)} pad regions")
