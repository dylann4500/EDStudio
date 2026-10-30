# Generates cues.json for video 044 (Pip ep. 7, lane 3 @ed._.sims): "What if Pip saw snow for the first time?"
# Run: python3 -I videos/044-pip-first-snow/make_cues.py videos/044-pip-first-snow/cues.json
#
# Sound identity — PIP'S THEME, SNOW-DAY ARRANGEMENT (the series voice from 021: music box over a soft piano waltz + warm pad),
# dressed for winter: the music box plays high and sparkly, faint sleigh bells drift past outside, the yard is hushed by snow
# (soft wind, crunchy little paws) and full of kids giggling.
#   - 0–3.6 s: quiet — a soft winter wind outside the glass, room tone, a tiny curious "hm?" and the nose bump on the glass.
#   - 3.6 s the window reveal: Pip's theme enters in F (music box + waltz).
#   - the door: a held C with a rising arp into the leap; the drift landing = a soft snow "flump" + crumble; the waltz takes off.
#   - the tongue catches: each crystal he catches is one music-box note climbing the F chord (5 catches = F A C F A).
#   - the sneeze: a held chord, two rising "ah… ah…" notes, the sneeze, a tiny TADA.
#   - angel + zoomies: the full waltz, giggles, crunchy paws; Bean: a shivery music-box tremolo in Dm; the scarf: the theme slowly
#     on the piano; the snowball fight: the bounciest waltz + a rising bell per catch + kids laughing; the snowman: stack thumps,
#     the carrot steal = TADA + laughter + a small cheer; "Mostly." = a crunch; the hall: a towel rustle; the nap: the theme as a
#     lullaby, a tiny snore, kids still playing faintly outside under the end card.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [s["t0"] for s in [{"t0": x} for x in [0, 3.4, 7.8, 11.4, 15.4, 19.8, 23.2, 27.0, 31.0, 34.8, 38.8, 43.0, 46.6, 50.6, 55.2, 58.6, 61.4]]]
IN_M = 3.6
BEAT = 0.6; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "F/C": (36, [57, 60, 65], [48, 57, 60, 65]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.24, stac=0.42):
    for i, c in enumerate(bars):
        tb = t0 + i * BAR; b, tri, _ = CH[c]
        chords.append([round(tb, 3), c])
        melody.append([round(tb, 3), b + 12 if b < 40 else b, vel, False, BAR * 0.95])
        for k in (1, 2):
            for j, m in enumerate(tri):
                melody.append([round(tb + k * BEAT + 0.008 * j, 3), m, vel * (0.62 if k == 1 else 0.52), False, stac])
    return t0 + len(bars) * BAR

def held(t0, seq, vel=0.22):
    t = t0
    for c, L in seq:
        b, tri, _ = CH[c]; chords.append([round(t, 3), c])
        melody.append([round(t, 3), b + 12 if b < 40 else b, vel, False, L + 0.3])
        for j, m in enumerate(tri):
            melody.append([round(t + 0.07 * (j + 1), 3), m, vel * 0.7, False, L + 0.2])
        t += L
    return t

def box(t0, notes, vel=0.42, beat=BEAT):
    t = t0
    for m, nb in notes:
        if m:
            bell.append([round(t, 3), m, vel, max(1.2, nb * beat + 0.9)])
        t += nb * beat
    return t

def pads(seq, level=0.85, att=0.3, rel=0.7):
    for t0, t1, c in seq:
        pad.append({"t0": round(t0, 3), "t1": round(t1 + 0.35, 3), "notes": CH[c][2], "level": level, "attack": att, "release": rel})

def barpads(t0, bars, level=0.9):
    cur = t0
    for c in bars:
        pads([(cur, cur + BAR, c)], level, 0.2, 0.7); cur += BAR
    return cur

def heldpads(t0, seq, level=0.9):
    t = t0
    for c, L in seq:
        pads([(t, t + L, c)], level, 0.35, 0.7); t += L
    return t

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
up8 = lambda seq: [(m + 12 if m else m, nb) for m, nb in seq]

# ---- A: the window (3.6–7.2): Pip's theme in F, the music box an octave up (sparkly)
bA = ["F", "Bb"]
waltz(IN_M, bA, 0.2)
barpads(IN_M - 0.15, bA, 0.85)
box(IN_M, up8(THEME_A[:6]), 0.36)
box(EV["boop"], [(89, 1)], 0.3)
# ---- the door (7.2–10.6): held C, then a rising arp into the leap
held(7.2, [("C", 1.8)], 0.2); heldpads(7.2, [("C", 1.8), ("C7", 1.6)], 0.9)
t = 9.0; k = 0
while t < EV["land"] - 0.05:
    tri = CH["C7"][1]
    melody.append([round(t, 3), (tri + [m + 12 for m in tri] + [m + 24 for m in tri])[k % 9], 0.2 + 0.012 * k, False, 0.4]); t += 0.13; k += 1
chords.append([9.0, "C7"])
# ---- B: drift → tongue catches (10.6–23.2): the waltz takes off; the catches climb the F chord on the music box
bB = ["F", "C", "Dm", "Bb", "F", "C", "F"]
waltz(EV["land"] + 0.05, bB, 0.22)
barpads(EV["land"] + 0.05, bB, 0.88)
box(EV["land"] + 0.05, up8(THEME_B), 0.36)
for i, c in enumerate(EV["catches"]):
    bell.append([round(c, 3), [77, 81, 84, 89, 93][i], 0.36, 1.6])
# ---- C: the sneeze (23.2–27.0)
held(23.2, [("Bb", 1.8), ("C7", EV["sneeze"] - 25.0), ("F", 27.0 - EV["sneeze"])], 0.2)
heldpads(23.2, [("Bb", 1.8), ("C7", EV["sneeze"] - 25.0), ("F", 27.0 - EV["sneeze"])], 0.9)
bell.append([EV["ah"][0], 84, 0.28, 1.0]); bell.append([EV["ah"][1], 86, 0.3, 1.0])
box(EV["sneeze"] + 0.15, TADA, 0.32, 0.3)
# ---- D: angel + zoomies (27.0–34.8): the full waltz
bD = ["F", "Bb", "C", "F"]
e = waltz(27.0, bD, 0.24)
barpads(27.0, bD, 0.9)
box(27.05, up8(THEME_A), 0.38)
held(e, [("F", 34.8 - e)], 0.2); heldpads(e, [("F", 34.8 - e)], 0.85)
box(EV["zoom"] + 0.05, TADA, 0.34, 0.3)
# ---- E: Bean shivering (34.8–39.0): a shivery tremolo on the music box in Dm → Bb
held(34.8, [("Dm", 1.8), ("Bb", 2.4)], 0.18); heldpads(34.8, [("Dm", 1.8), ("Bb", 2.4)], 0.9)
t = 34.9; k = 0
while t < 38.9:
    bell.append([round(t, 3), [81, 82][k % 2] if t < 36.6 else [82, 86][k % 2], 0.17, 1.2]); t += 0.12; k += 1
# ---- F: the scarf (39.0–43.0): the theme slowly on the piano, warm
held(39.0, [("F", 1.4), ("Bb", 1.2), ("F/C", 0.8), ("C7", 0.6)], 0.2)
heldpads(39.0, [("F", 1.4), ("Bb", 1.2), ("F/C", 0.8), ("C7", 0.6)], 0.9)
slow = 0.5
for m, nb, tt in [(72, 1, 0), (69, 1, 1), (72, 1, 2), (77, 2, 3), (76, 1, 5), (74, 1, 6), (72, 1, 7)]:
    melody.append([round(39.05 + tt * slow, 3), m, 0.26, False, nb * slow + 0.2])
box(EV["drape"], [(84, 1), (89, 2)], 0.3, 0.4)
# ---- G: the snowball fight (43.0–50.6): bouncy waltz; a rising bell per catch
bG = ["F", "C", "Bb", "C"]
e = waltz(43.0, bG, 0.25, 0.36)
barpads(43.0, bG, 0.9)
held(e, [("F", 50.6 - e)], 0.22); heldpads(e, [("F", 50.6 - e)], 0.9)
for i, c in enumerate(EV["sbCatch"]):
    bell.append([round(c, 3), [77, 79, 81, 82, 84, 89][i], 0.36, 1.4])
# ---- H: the snowman (50.6–58.6)
bH = ["F", "Dm", "Bb", "C"]
e = waltz(50.6, bH, 0.23)
barpads(50.6, bH, 0.9)
box(50.65, up8(THEME_B[:5]), 0.34)
box(EV["steal"], TADA, 0.38, 0.3)
held(e, [("F", 58.6 - e)], 0.22); heldpads(e, [("F", 58.6 - e)], 0.9)
box(EV["give"] + 0.05, [(84, 1), (81, 0.5), (89, 2)], 0.34, 0.4)
# ---- I: the hall (58.6–61.4)
held(58.6, [("Bb", 1.4), ("F", 1.4)], 0.18); heldpads(58.6, [("Bb", 1.4), ("F", 1.4)], 0.85)
box(58.65, THEME_A[:4], 0.3, 0.6)
# ---- J: the nap + end card (61.4–D): the theme as a lullaby, resolving on F
END = story["end"]["in"]
held(61.4, [("F", 1.8), ("Bb", END - 63.2), ("C7", 1.3), ("F", D - END - 1.3)], 0.18)
heldpads(61.4, [("F", 1.8), ("Bb", END - 63.2), ("C7", 1.3), ("F", D - END - 1.5)], 0.85)
box(61.45, up8(THEME_A[:6]), 0.3, 0.75)
box(END + 0.05, [(86, 1), (88, 1), (89, 3)], 0.34, 0.8)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

YARD = [(7.8, 58.6)]
amb = [amb_("room_tone", 0.0, 7.8, -50, None, 10, fi=0.4, fo=0.3),
       amb_("wind", 0.0, 7.8, -48, {"darkness": 0.8, "gust": 0.35, "whistle": 0.05}, 30, fi=0.6, fo=0.3),
       amb_("wind", 7.8, 58.6, -50, {"darkness": 0.75, "gust": 0.3, "whistle": 0.0}, 31, fi=0.2, fo=0.3),
       amb_("sleigh_bells", 15.0, 27.0, -52, {"period": 0.34}, 33, fi=1.5, fo=1.5),
       amb_("kids_laugh", 11.0, 34.8, -44, {"density": 0.6}, 41, fi=0.6, fo=0.6),
       amb_("kids_laugh", 43.0, 58.6, -38, {"density": 1.3}, 42, fi=0.4, fo=0.5),
       amb_("crowd_cheer", EV["steal"], 55.2, -44, {"excite": 0.45}, 43, fi=0.3, fo=0.6),
       amb_("crowd_cheer", EV["give"], 58.6, -43, {"excite": 0.5}, 44, fi=0.3, fo=0.4),
       amb_("room_tone", 58.6, D, -50, None, 11, fi=0.3, fo=1.0),
       amb_("wind", 61.4, D, -53, {"darkness": 0.85, "gust": 0.25, "whistle": 0.0}, 32, fi=0.8, fo=1.5),
       amb_("kids_laugh", 62.5, D, -47, {"density": 0.5}, 45, fi=1.2, fo=1.5)]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

ev = []
def paws(t0, t1, rate=0.14, g=-38, w=0.18, pan=0.0, scuff=0.9):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g + (1 if k % 2 else 0), pan + 0.1 * ((k % 3) - 1), {"weight": w, "scuff": scuff})); k += 1

# the window: "hm?", the nose bump on the glass (twice), Mia's steps
ev.append(ev_(1.0, "whimper", -36, 0.0, {"pitch": 1.4, "dur": 0.28}))
ev.append(ev_(1.6, "knock", -40, 0.0, {"pitch": 1.6}))
ev.append(ev_(EV["boop"], "knock", -37, 0.0, {"pitch": 1.5}))
ev.append(ev_(EV["boop"] + 0.4, "whimper", -36, 0.0, {"pitch": 1.55, "dur": 0.25}))
paws(3.6, 5.6, 0.45, -40, 0.5, 0.2, 0.3)
# the door: latch + creak, paws on the porch, the leap, the flump into the drift
ev.append(ev_(EV["door"], "door_open", -31, -0.1, {"creak": 0.4, "pitch": 1.1}))
paws(EV["out"], EV["leap"], 0.1, -36, 0.2, 0.0, 0.3)
ev.append(ev_(EV["land"], "dig", -29, 0.0, {"size": 0.7}))
ev.append(ev_(EV["land"] + 0.05, "crumble", -33, 0.0, {"dur": 0.9, "size": 0.5}))
# the drift: crunchy little paws under the snow, the pop out
paws(11.6, EV["pop"], 0.17, -41, 0.15, -0.1, 1.0)
ev.append(ev_(EV["pop"], "pop", -31, 0.0, {"pitch": 0.8}))
ev.append(ev_(EV["pop"] + 0.05, "crumble", -36, 0.0, {"dur": 0.5, "size": 0.3}))
# tongue: a snap per try, a tiny lick on each catch
for s in EV["snaps"]:
    ev.append(ev_(s, "slurp", -38, 0.0, {"dur": 0.15}))
for c in EV["catches"]:
    ev.append(ev_(c + 0.05, "plip", -36, 0.0, {"pitch": 1.6}))
paws(20.35, 20.6, 0.1, -40); paws(21.55, 21.8, 0.1, -40)
# the sneeze
ev.append(ev_(EV["noseFlake"], "plip", -36, 0.0, {"pitch": 1.8}))
ev.append(ev_(EV["sneeze"] - 0.32, "sneeze", -27, 0.0, {"pitch": 1.15}))
ev.append(ev_(EV["sneeze"] + 0.05, "crumble", -38, 0.0, {"dur": 0.5, "size": 0.25}))
# angel: snow swishes (blanket rustle) while she sweeps; the corgi wiggle
for k in range(5):
    ev.append(ev_(27.4 + k * 0.75, "blanket_rustle", -38, -0.15, {"dur": 0.6, "softness": 0.8, "intensity": 0.5}))
for k in range(4):
    ev.append(ev_(28.7 + k * 0.6, "blanket_rustle", -39, 0.2, {"dur": 0.4, "softness": 0.7, "intensity": 0.5}))
# zoomies: fast crunchy paws, a happy boof
paws(31.0, 34.8, 0.09, -38, 0.2, 0.0, 1.0)
ev.append(ev_(32.6, "dog_bark", -33, 0.1, {"pitch": 1.35}))
# Bean: Rosa's boots on the sidewalk, Bean's tiny trot, his teeth chattering (a soft fast knock), Pip trots over
paws(34.8, 37.4, 0.5, -39, 0.6, 0.3, 0.6)
paws(34.8, 37.6, 0.12, -42, 0.1, 0.25, 0.5)
t = 35.0
while t < EV["drape"]:
    ev.append(ev_(t, "knock", -46, 0.2, {"pitch": 2.4})); t += 0.09
paws(36.3, 38.4, 0.16, -40, 0.18, -0.2, 0.9)
# the scarf: a soft knit rustle, the drape, Bean's tiny boof + a lick
ev.append(ev_(EV["tug"], "blanket_rustle", -34, 0.0, {"dur": 0.5, "softness": 0.9, "intensity": 0.6}))
ev.append(ev_(EV["drape"], "blanket_rustle", -33, 0.1, {"dur": 0.4, "softness": 0.9, "intensity": 0.6}))
ev.append(ev_(EV["drape"] + 0.5, "dog_bark", -32, 0.15, {"pitch": 2.1}))
ev.append(ev_(EV["lick"], "slurp", -34, 0.1, {"dur": 0.2})); ev.append(ev_(EV["lick"] + 0.6, "slurp", -35, 0.1, {"dur": 0.2}))
# snowball fight: a soft "puff" pop + crumble per catch
for i, c in enumerate(EV["sbCatch"]):
    ev.append(ev_(c, "pop", -31, 0.1 * ((i % 3) - 1), {"pitch": 0.7 + 0.05 * i}))
    ev.append(ev_(c + 0.03, "crumble", -38, 0.0, {"dur": 0.4, "size": 0.25}))
# snowman: three stack thumps, the carrot poked in, the steal, the crunch ("Mostly."), the give back
for k, s in enumerate(EV["stack"]):
    ev.append(ev_(s, "dig", -33, 0.0, {"size": 0.5 - 0.1 * k}))
ev.append(ev_(EV["carrot"], "plip", -35, 0.0, {"pitch": 1.2}))
ev.append(ev_(EV["steal"], "pop", -32, 0.0, {"pitch": 1.2}))
paws(EV["steal"] + 0.45, 55.2, 0.09, -38, 0.2, 0.2, 1.0)
ev.append(ev_(EV["chomp"], "crumble", -36, 0.0, {"dur": 0.25, "size": 0.15}))
ev.append(ev_(EV["give"], "plip", -33, 0.0, {"pitch": 1.2}))
ev.append(ev_(57.6, "knock", -40, 0.0, {"pitch": 1.9}))
# hall: the towel rubs
for k in range(3):
    ev.append(ev_(EV["wipe"][0] + k * 0.42, "blanket_rustle", -35, 0.0, {"dur": 0.38, "softness": 0.6, "intensity": 0.7}))
ev.append(ev_(60.2, "slurp", -36, 0.0, {"dur": 0.2}))
# the nap: tiny snores
for s in EV["snore"]:
    ev.append(ev_(s, "snore", -37, 0.0, {"dur": 1.2, "size": 0.3}))

cues = {
    "title": "044 - What if Pip saw snow for the first time? (Pip ep. 7: Pip's theme, snow-day arrangement — music box + waltz + sleigh bells)",
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
