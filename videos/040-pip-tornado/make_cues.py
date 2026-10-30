# Generates cues.json for video 040 (Pip ep. 6, lane 3 @ed._.sims): "What if a tornado hit while Pip was home alone?"
# Run: python3 -I videos/040-pip-tornado/make_cues.py videos/040-pip-tornado/cues.json
#
# Sound identity — PIP'S THEME, "STORM SHELTER" ARRANGEMENT (the series voice from 021: music box over a soft piano + warm pad),
# a disaster episode that stays cozy: SFX-led open, wind and rain beds, a far low-passed siren, no hits, no stings.
#   - 0–18.9 s: NO music. Room tone, paws, the bunny squeak, a boof, the car leaving, the wind rising, a far rumble,
#     the pressure drop under "his ears went up", rain on the glass, then a far siren on Maple St.
#   - 18.95 s TORNADO WARNING: the music ENTERS — a pad drone + held D-minor piano chords, a slow music-box line in minor.
#   - the packing: a busy little piano pulse in D minor, each drop (bunny / bowl / Bubbles) gets its own music-box note.
#   - the storm outside: wind + rain up front, the music low (Dm/Bb/Gm drone, a soft low ostinato); cartoon foley only
#     (chairs clonk, the trampoline boings, the gnome ticks, the porch roof creaks + folds).
#   - the tub: the hush, the theme's shape in minor on the music box, a lick.
#   - 49.3 s the sun: the turn to F major — the waltz starts, the theme on the music box; the car pulls up.
#   - 56.15 s the door: a held swell + ta-da; the hug = the waltz in F, fullest, family giggles (crowd murmur), licks.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.3, 7.6, 11.4, 15.4, 18.8, 20.6, 22.4, 25.6, 30.6, 34.0, 36.2, 38.6, 41.8, 44.8, 48.8, 52.6, 55.6, 59.0]
IN_M = EV["warn"]
PACK, TUB, OUT, HOLD, CALM, RUSH, FIND, HUG, END = 25.6, 34.0, 38.6, 44.8, 48.8, 52.6, 55.6, 59.0, story["end"]["in"]
BEAT = 0.55; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "A7": (45, [55, 61, 64], [45, 55, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
    "Eb": (39, [58, 63, 67], [51, 58, 63, 67]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.22, stac=0.36, beat=BEAT):
    bar = 3 * beat
    for i, c in enumerate(bars):
        tb = t0 + i * bar; b, tri, _ = CH[c]
        chords.append([round(tb, 3), c])
        melody.append([round(tb, 3), b + 12 if b < 40 else b, vel, False, bar * 0.95])
        for k in (1, 2):
            for j, m in enumerate(tri):
                melody.append([round(tb + k * beat + 0.008 * j, 3), m, vel * (0.62 if k == 1 else 0.52), False, stac])
    return t0 + len(bars) * bar

def held(t0, seq, vel=0.2):
    t = t0
    for c, L in seq:
        b, tri, _ = CH[c]; chords.append([round(t, 3), c])
        melody.append([round(t, 3), b + 12 if b < 40 else b, vel, False, L + 0.3])
        for j, m in enumerate(tri):
            melody.append([round(t + 0.07 * (j + 1), 3), m, vel * 0.7, False, L + 0.2])
        t += L
    return t

def pulse(t0, t1, c, vel=0.13, step=BEAT / 2):
    """A soft busy pulse (the packing / the storm): repeated low chord tones, short."""
    b, tri, _ = CH[c]; chords.append([round(t0, 3), c]); k = 0
    while t0 + k * step < t1 - 0.05:
        m = (b + 12 if b < 40 else b) if k % 4 == 0 else tri[k % 3]
        melody.append([round(t0 + k * step, 3), m, vel * (1.0 if k % 4 == 0 else 0.7), False, step * 0.8]); k += 1

def box(t0, notes, vel=0.42, beat=BEAT, shift=0):
    t = t0
    for m, nb in notes:
        if m:
            bell.append([round(t, 3), m + shift, vel, max(1.2, nb * beat + 0.9)])
        t += nb * beat
    return t

def pads(seq, level=0.85, att=0.3, rel=0.7):
    for t0, t1, c in seq:
        pad.append({"t0": round(t0, 3), "t1": round(t1 + 0.35, 3), "notes": CH[c][2], "level": level, "attack": att, "release": rel})

def barpads(t0, bars, level=1.0, bar=BAR):
    cur = t0
    for c in bars:
        pads([(cur, cur + bar, c)], level, 0.12, 0.7); cur += bar
    return cur

def fit(bars, t0, t1, bar=BAR):
    n = max(1, int(round((t1 - t0) / bar)))
    return (bars * (n // len(bars) + 1))[:n]

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]
MINOR = [(74, 2), (69, 1), (72, 2), (70, 1), (69, 3), (65, 2), (69, 1), (74, 3)]
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
RUN_UP = [(65, 0.25), (69, 0.25), (72, 0.25), (77, 0.25), (81, 0.25), (84, 0.25), (89, 1)]

# ---- A: the warning (18.95 … 25.6): pad drone + held minor chords, the minor line; the store = the hush, a little higher
seqA = [("Dm", IN_M, 20.6), ("Bb", 20.6, 22.4), ("Gm", 22.4, 24.0), ("A", 24.0, PACK)]
for c, a, b in seqA:
    chords.append([round(a, 3), c]); bs = CH[c][0]; k = 0
    while a + k * 2 * BEAT < b - 0.05:
        melody.append([round(a + k * 2 * BEAT, 3), bs + 12 if bs < 40 else bs, 0.17 if k % 2 == 0 else 0.12, False, BEAT * 1.7]); k += 1
    melody.append([round(a + 0.06, 3), CH[c][1][1], 0.14, False, b - a])
pads([(c0, c1, c) for c, c0, c1 in seqA], 1.15, 0.6, 0.8)
melody.append([IN_M, 26, 0.2, False, 3.0])
box(IN_M + 0.4, MINOR, 0.3, 0.6)
# ---- B: the packing (25.6 … 34.0): a busy soft pulse in D minor, one music-box note per drop, rising
for c, a, b in [("Dm", PACK, 27.3), ("Bb", 27.3, 28.9), ("Gm", 28.9, 30.6), ("A", 30.6, 32.3), ("Dm", 32.3, TUB)]:
    pulse(a, b, c, 0.13); pads([(a, b, c)], 1.05, 0.2, 0.6)
for t0, m in [(EV["dropBunny"], 74), (EV["dropBowl"], 77), (EV["dropFish"], 81)]:
    bell.append([round(t0, 3), m, 0.36, 1.6]); bell.append([round(t0 + 0.14, 3), m + 5, 0.26, 1.4])
box(30.7, [(69, 1), (70, 1), (72, 1), (74, 2), (72, 1), (69, 3)], 0.3, 0.5)
# ---- C: the tub (34.0 … 38.6): hush, held Dm / Bb, the minor line on the music box
held(TUB, [("Dm", 2.2), ("Bb", OUT - TUB - 2.2)], 0.16)
pads([(TUB, TUB + 2.2, "Dm"), (TUB + 2.2, OUT, "Bb")], 1.15, 0.3, 0.8)
box(TUB + 0.2, [(69, 2), (70, 1), (69, 2), (65, 3)], 0.26, 0.6)
# ---- D: the storm outside (38.6 … 44.8): low drone + a soft low ostinato under the wind
for c, a, b in [("Gm", OUT, 40.2), ("Dm", 40.2, 41.8), ("Bb", 41.8, 43.4), ("A", 43.4, HOLD)]:
    pulse(a, b, c, 0.11, BEAT / 2); pads([(a, b, c)], 1.2, 0.3, 0.7)
# ---- E: holding on in the tub (44.8 … 48.8): the hush, lowest; the theme's shape in minor; a little lift at the lick
held(HOLD, [("Dm", 1.6), ("Gm", 1.4), ("A", CALM - HOLD - 3.0)], 0.15)
pads([(HOLD, HOLD + 1.6, "Dm"), (HOLD + 1.6, HOLD + 3.0, "Gm"), (HOLD + 3.0, CALM, "A")], 1.15, 0.3, 0.8)
box(HOLD + 0.2, MINOR[:5], 0.28, 0.6)
box(EV["lick"] + 0.05, [(81, 1), (77, 2)], 0.3, 0.4)
# ---- F: the sun (48.8 … 55.6): the turn to F major — the waltz, the theme on the music box; the car pulls up
held(CALM, [("C7", EV["sun"] - CALM + 0.2)], 0.17)
pads([(CALM, EV["sun"] + 0.2, "C7")], 1.0, 0.3, 0.7)
f0 = EV["sun"] + 0.2
fbars = fit(["F", "Bb", "C7", "F", "F", "Bb", "C", "F"], f0, FIND)
end_f = waltz(f0, fbars, 0.2)
barpads(f0, fbars, 0.95)
box(f0 + 0.05, THEME_A, 0.42)
box(RUSH + 0.1, [(m + 5, n) for m, n in THEME_A[:7]], 0.36)
# ---- G: the door (55.6 … 59.0): a held swell, ta-da as it flies open
held(end_f, [("Gm", 0.6), ("C7", EV["doorOpen"] - end_f - 0.6 + 0.4), ("F", HUG - EV["doorOpen"] - 0.4)], 0.2)
pads([(end_f, end_f + 0.6, "Gm"), (end_f + 0.6, EV["doorOpen"] + 0.4, "C7"), (EV["doorOpen"] + 0.4, HUG, "F")], 1.0, 0.25, 0.7)
box(EV["doorOpen"] + 0.05, TADA, 0.42, 0.3)
box(57.4, RUN_UP, 0.34, 0.5)
# ---- H: the hug (59.0 … end): the waltz in F, fullest; the end card resolves on F
hbars = fit(["F", "C", "Bb", "F", "Bb", "C7", "F"], HUG, END + 0.2)
end_h = waltz(HUG, hbars, 0.24)
barpads(HUG, hbars, 0.9)
box(HUG, THEME_B, 0.46)
held(end_h, [("Bb", 1.3), ("C7", 1.1), ("F", max(1.2, D - end_h - 2.4))], 0.2)
box(end_h + 0.05, [(74, 1), (76, 1), (77, 3)], 0.38, 0.8)
pads([(end_h, end_h + 1.3, "Bb"), (end_h + 1.3, end_h + 2.4, "C7"), (end_h + 2.4, D - 0.2, "F")], 0.85, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

W_IN = {"darkness": 0.7, "gust": 0.6, "whistle": 0.06}
W_OUT = {"darkness": 0.75, "gust": 0.9, "whistle": 0.08}
amb = [amb_("room_tone", 0.0, D, -40, None, 12, fi=0.3, fo=1.5),
       amb_("lamp_hum", 0.0, 15.45, -48, None, 11, fi=0.4, fo=0.3),
       amb_("city_day", 0.0, 9.0, -38, {"murmur": 0.15, "traffic": 0.35}, 10, fi=0.3, fo=1.5),    # a quiet Saturday street through the window
       amb_("wind", 6.0, 15.45, -37, W_IN, 13, fi=3.0, fo=0.1),                                   # the wind picks up
       amb_("rain_window", 12.0, 15.45, -36, {"intensity": 0.7}, 14, fi=1.2, fo=0.1),
       # Maple St, green sky: wind + rain up front, the far siren starts
       amb_("wind", 15.4, 18.85, -31, W_OUT, 15, fi=0.1, fo=0.1),
       amb_("rain_window", 15.4, 18.85, -34, {"intensity": 1.0}, 16, fi=0.1, fo=0.1),
       amb_("dry_leaves", 15.4, 18.85, -40, {"density": 0.8}, 17, fi=0.1, fo=0.1),
       amb_("siren", EV["sirenIn"], CALM + 1.5, -43, {"distance": 2.4}, 18, fi=1.5, fo=1.5),
       # inside, everything through the walls
       amb_("wind", 18.8, 22.45, -38, W_IN, 19, fi=0.1, fo=0.1),
       amb_("rain_window", 18.8, 22.45, -36, {"intensity": 0.9}, 20, fi=0.1, fo=0.1),
       amb_("city_day", 22.4, 25.65, -40, {"murmur": 0.8, "traffic": 0.0}, 21, fi=0.1, fo=0.1),     # the store
       amb_("wind", 25.6, 34.05, -37, W_IN, 22, fi=0.1, fo=0.1),
       amb_("rain_window", 25.6, 34.05, -35, {"intensity": 1.0}, 23, fi=0.1, fo=0.1),
       amb_("wind", 34.0, 38.65, -43, W_IN, 24, fi=0.1, fo=0.1),                                    # the inside room: muffled
       amb_("rain_window", 34.0, 38.65, -44, {"intensity": 0.7}, 25, fi=0.1, fo=0.1),
       amb_("wind", 38.6, 44.85, -27, W_OUT, 26, fi=0.1, fo=0.1),                                   # outside: the loudest
       amb_("rain_window", 38.6, 44.85, -31, {"intensity": 1.3}, 27, fi=0.1, fo=0.1),
       amb_("dry_leaves", 38.6, 44.85, -36, {"density": 1.2}, 28, fi=0.1, fo=0.1),
       amb_("wind", 44.8, 48.85, -40, W_IN, 29, fi=0.1, fo=0.1),
       amb_("rain_window", 44.8, 48.85, -42, {"intensity": 0.8}, 30, fi=0.1, fo=0.1),
       amb_("wind", 48.8, 51.0, -33, W_OUT, 31, fi=0.1, fo=1.6),                                    # the wind dies
       amb_("rain_window", 48.8, 50.6, -36, {"intensity": 0.6}, 32, fi=0.1, fo=1.2),
       amb_("city_day", 49.8, 55.65, -44, {"murmur": 0.3, "traffic": 0.2}, 33, fi=1.0, fo=0.1),
       amb_("crowd_cheer", 59.0, D, -42, {"excite": 0.25}, 34, fi=0.4, fo=1.5)]                     # family giggles

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def paws(t0, t1, rate=0.14, g=-37, pan=0.0):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g + (1 if k % 2 else 0), pan + 0.1 * ((k % 3) - 1), {"weight": 0.22, "scuff": 0.2})); k += 1

def steps(t0, t1, rate=0.42, g=-36, w=0.45, pan=0.0):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g, pan, {"weight": w, "scuff": 0.4})); k += 1

ev = []
# the bye: a boof, Mia's boop (squeak), steps out, the door, the car leaving
ev += [ev_(1.4, "plush_squeak", -36, 0.0), ev_(EV["bye"][0], "plush_squeak", -33, 0.1), ev_(EV["boofs"][0], "dog_bark", -30, 0.0, {"pitch": 1.6})]
steps(6.2, 7.6, 0.3, -37, 0.4, 0.3)
ev += [ev_(7.7, "door_close", -38, 0.4), ev_(9.0, "car_pass", -44, 0.5, {"dur": 2.4, "size": 0.7})]
# alone: a far rumble, then the pressure drop under the ears
ev += [ev_(EV["rumbles"][0], "distant_boom", -36, 0.2, {"dur": 3.2, "size": 0.6}), ev_(EV["perk"], "pressure_drop", -36, 0.0, {"dur": 2.0})]
ev += [ev_(EV["rumbles"][1], "distant_boom", -33, -0.2, {"dur": 3.2, "size": 0.7}), ev_(EV["rumbles"][2], "distant_boom", -32, 0.1, {"dur": 3.0, "size": 0.8})]
ev.append(ev_(13.1, "whimper", -36, 0.0, {"pitch": 1.4, "dur": 0.35}))
# the warning: a soft swell, three round alert beeps from the TV, the phone buzzes on the console
ev += [ev_(IN_M, "low_swell", -33, 0.0, {"dur": 3.0, "pitch": 0.8}), ev_(IN_M + 0.05, "alarm_beep", -38, 0.3, {"dur": 1.4, "n": 3, "pitch": 0.8})]
amb.append(amb_("buzz", EV["buzz"][0], EV["buzz"][0] + 0.45, -40, {"rate": 32.0}, 40, fi=0.02, fo=0.05))
amb.append(amb_("buzz", EV["buzz"][0] + 0.6, EV["buzz"][0] + 1.05, -41, {"rate": 32.0}, 41, fi=0.02, fo=0.05))
ev.append(ev_(21.6, "whimper", -37, 0.0, {"pitch": 1.5, "dur": 0.3}))
# the store: every phone buzzes, one after another
for i, b0 in enumerate(EV["buzz"][1:]):
    amb.append(amb_("buzz", b0, b0 + 0.5, -40 - i, {"rate": 30.0 + 2 * i}, 42 + i, fi=0.02, fo=0.05))
    ev.append(ev_(b0 + 0.02, "alarm_beep", -42 - i, 0.25 * ((i % 3) - 1), {"dur": 0.6, "n": 1, "pitch": 0.75 + 0.05 * i}))
# the packing: paws, pick-ups, drops; Bubbles sloshes
paws(PACK, EV["dropBunny"] - 0.25, 0.14, -37)
ev += [ev_(EV["dropBunny"], "plush_squeak", -31, 0.0), ev_(EV["dropBunny"] + 0.05, "plush_place", -36, 0.0)]
paws(EV["dropBunny"] + 0.3, EV["dropBowl"] - 0.25, 0.14, -38)
ev += [ev_(EV["dropBowl"], "clunk", -36, 0.0, {"size": 0.15, "metal": 0.6})]
paws(EV["dropBowl"] + 0.3, EV["dropFish"] - 0.3, 0.2, -39)
ev += [ev_(EV["dropFish"] - 0.6, "fish_blub", -38, 0.0, {"n_bub": 2}), ev_(EV["dropFish"], "plip", -34, 0.0, {"pitch": 0.8}), ev_(EV["dropFish"] + 0.15, "fish_blub", -37, 0.0, {"n_bub": 3})]
# the haul: the wagon rolls (soft clunks), paws; a lawn chair bumps past the window
paws(30.6, 33.9, 0.16, -38)
for k in range(8):
    ev.append(ev_(30.8 + k * 0.4, "giant_step", -44, 0.15, {"size": 0.05, "surface": "wood"}))
ev.append(ev_(EV["chair"] + 0.6, "metal_clang", -42, -0.3, {"size": 0.4, "pitch": 1.4}))
# the tub: into the bathroom, the wagon parks, the hop, the towel
paws(TUB, EV["hopIn"] - 0.35, 0.15, -38)
ev += [ev_(EV["hopIn"] + 0.5, "giant_step", -38, 0.0, {"size": 0.08, "surface": "wood"}), ev_(EV["hopIn"] + 0.55, "plush_squeak", -38, 0.0)]
ev += [ev_(EV["towel"][0], "blanket_rustle", -33, 0.0, {"dur": 0.7, "softness": 0.8, "intensity": 0.6})]
# outside: lawn chairs clonk past, the trampoline boings down the street, the gnome ticks along, the porch roof folds
for c0 in EV["chairs"] + [EV["chairs"][1] + 0.55]:
    ev.append(ev_(c0 + 0.7, "metal_clang", -36, -0.3, {"size": 0.5, "pitch": 1.3}))
for k, b0 in enumerate(EV["tramp"]):
    ev.append(ev_(b0, "clunk", -34 - k, 0.2 - 0.15 * k, {"size": 0.35, "metal": 0.3}))
for k in range(5):
    ev.append(ev_(42.0 + k * 0.38, "knock", -38, 0.3 - 0.15 * k, {"pitch": 1.5}))
ev += [ev_(EV["porch"], "wood_snap", -33, 0.1, {"size": 0.5}), ev_(EV["porch"] + 0.25, "floorboard_creak", -36, 0.1)]
# holding on: the light flickers (clicks), a rumble, Bubbles comes to the glass, a lick
for f in EV["flick"]:
    ev.append(ev_(f, "lamp_switch_click", -40, -0.1))
ev += [ev_(45.3, "distant_boom", -35, 0.0, {"dur": 3.0, "size": 0.8}), ev_(46.5, "fish_blub", -37, 0.0, {"n_bub": 3}), ev_(EV["lick"], "slurp", -35, 0.0)]
ev.append(ev_(46.0, "whimper", -38, 0.0, {"pitch": 1.4, "dur": 0.3}))
# the sun: the car races in and brakes
ev += [ev_(EV["sun"], "low_swell", -34, 0.0, {"dur": 2.4, "pitch": 1.1}), ev_(50.6, "car_pass", -34, 0.3, {"dur": 2.2, "size": 0.9}), ev_(EV["brake"], "clunk", -40, 0.0, {"size": 0.3, "metal": 0.2})]
ev += [ev_(51.9, "door_close", -38, 0.2), ev_(52.1, "door_close", -39, 0.25)]
# the rush: running feet up the walk
steps(RUSH, FIND - 0.1, 0.22, -35, 0.5, 0.0)
steps(RUSH + 0.1, FIND - 0.1, 0.26, -37, 0.6, 0.15)
# the door: it flies open; a happy boof
ev += [ev_(EV["doorOpen"] - 0.05, "door_open", -31, 0.2, {"creak": 0.4}), ev_(EV["boofs"][1], "dog_bark", -30, 0.0, {"pitch": 1.6})]
steps(57.5, 58.9, 0.22, -37, 0.5, 0.1)
# the hug: blankets of laughter, licks, the bunny squeak, tail thumps
ev += [ev_(HUG + 0.1, "blanket_rustle", -36, 0.0, {"dur": 0.5, "softness": 0.8, "intensity": 0.5})]
for l in EV["licks"]:
    ev.append(ev_(l, "slurp", -37, 0.1))
for l in EV["laugh"]:
    ev.append(ev_(l, "plush_squeak", -37, 0.0))
for j in range(6):
    ev.append(ev_(60.2 + j * 0.45, "giant_step", -43, 0.0, {"size": 0.06, "surface": "wood"}))

cues = {
    "title": "040 - What if a tornado hit while Pip was home alone? (Pip ep. 6: Pip's theme, storm-shelter arrangement — SFX open, D minor through the storm, F major when the sun comes out)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 1.0, D],
    "stem_gain_db": {"music": -10.5, "sfx": 11.0, "amb": 8.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 4800,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0,
              "bell_db": -3.0, "bell_lp": 4200, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.3}, "end": D,
              "chords": chords, "sections": [], "melody": melody, "bell_melody": bell, "pad": pad,
              "stings": [], "ducks": [], "auto_duck": {"db": -1.5, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.25, "max_len": 1.2},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"{len(ev)} events, {len(melody)} piano notes, {len(bell)} music-box notes, {len(pad)} pad regions")
