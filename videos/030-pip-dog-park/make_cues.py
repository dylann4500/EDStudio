# Generates cues.json for video 030 (Pip ep. 3, lane 3 @ed._.sims): "What if nobody at the dog park wanted to play with Pip?"
# Run: python3 -I videos/030-pip-dog-park/make_cues.py videos/030-pip-dog-park/cues.json
#
# Sound identity — PIP'S THEME, SUNNY-PARK ARRANGEMENT (the series voice from 021: music box over a soft piano waltz + warm pad),
# re-arranged as a bright Saturday-morning waltz: playful, never sad for long.
#   - 0–4.4 s: a quiet park (a breeze in the big tree, leaves, a far murmur, a few soft far-off boofs). No music.
#   - 4.45 s the gate swings and Pip charges in: Pip's theme enters in F (music box + waltz) — the premise moment.
#   - the husky band: their howls ARE the band (three pitches = a chord on the downbeats); Pip's audition is one tiny high
#     "awoo"; the waltz holds one soft chord for the stare, then the falling "uh-oh" from 021, and the howling resumes.
#   - the poodles: the waltz moves to Bb, the music box goes prissy and high; splashes, the wet-dog shake, three soft "poofs"
#     (pop) as the pom-poms frizz, tippy-tap paws as they flounce off.
#   - Moose: a C7 pedal with quivering repeated notes (the stare at the ball), heavy paws + a gust on each pass, a music-box
#     spin-down for each of Pip's spins, "uh-oh" on "Twice."
#   - the fence: held Dm → Bb → Gm → C, a slow music-box line, happy barks far away (the contrast), a soft sigh.
#   - Bean + the gift: the theme slowly on the piano in F, the bunny's squeak on the nudge, Bean's tiny boof.
#   - the turn (Bean's tail): a swelling arp into the full waltz in F, brightest of the episode, for the zoomies — a stampede
#     of paws, a soft boof as each dog joins, owners laughing and clapping.
#   - the pile: the theme as a lullaby on the music box; a tiny snore; the end card resolves on F.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.4, 7.6, 11.8, 15.6, 20.0, 23.6, 28.0, 31.6, 35.4, 38.0, 41.0, 43.6, 48.8, 52.4, 56.4, 58.8, 61.8]
IN_M = EV["gate"] + 0.45                   # music enters: the gate swings, Pip charges in
BEAT = 0.6; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]), "F/C": (36, [57, 60, 65], [48, 57, 60, 65]),
    "Eb": (39, [58, 63, 67], [51, 58, 63, 67]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.24, stac=0.42):
    """Piano oom-pah-pah: bass on 1 (held), chord on 2 and 3 (short)."""
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

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]           # F F Bb F
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]           # F C Bb-C F
POSH = [(82, 0.5), (81, 0.5), (82, 0.5), (86, 1.5), (84, 0.5), (82, 0.5), (81, 0.5), (79, 0.5), (77, 2)]   # the theme, in Bb, on tiptoe
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
UHOH = [(77, 0.75), (74, 1.5)]
SPIN = [(89, 0.2), (86, 0.2), (84, 0.2), (81, 0.2), (77, 0.2), (74, 0.2), (72, 0.2), (69, 1)]

# ---- A: the gate + the plan (4.45–11.8): Pip's theme in F
bA = ["F", "Bb", "F", "C"]
end = waltz(IN_M, bA, 0.22)
barpads(IN_M - 0.15, bA, 0.85)
box(IN_M, THEME_A, 0.44)
box(EV["bow"] - 0.05, TADA, 0.36, 0.3)                                       # the play bow
HUSK = end                                                                   # 11.65
# ---- B: the husky band (11.65–20.0): the waltz under the howls; a held chord for the stare; uh-oh; the band carries on
bB = ["F", "Dm", "Bb"]
e = waltz(HUSK, bB, 0.2, 0.5)
barpads(HUSK, bB, 0.95)
box(HUSK + 0.05, THEME_B[:5], 0.32)
STARE = e                                                                    # 17.05
held(STARE, [("C", EV["howls"][2][0] - 0.3 - STARE)], 0.2)
pads([(STARE, EV["howls"][2][0] - 0.3, "C")], 0.95, 0.3, 0.6)
box(EV["howls"][2][0] - 0.3 - 0.05, UHOH, 0.42)
melody.append([round(EV["howls"][2][0] - 0.3, 3), 38, 0.26, False, 1.0])
bB2 = ["Bb"]
waltz(EV["howls"][2][0] - 0.3, bB2, 0.2, 0.5)
barpads(EV["howls"][2][0] - 0.3, bB2, 0.95)
POOD = EV["howls"][2][0] - 0.3 + BAR                                         # 20.1
# ---- C: the poodles (20.1–28.0): Bb waltz, music box on tiptoe; three poofs; a sniffy two-note "hmph"
bC = ["Bb", "Eb", "Bb", "F"]
e = waltz(POOD, bC, 0.2, 0.4)
barpads(POOD, bC, 1.0)
box(POOD + 0.05, POSH, 0.34)
box(EV["frizz"], [(84, 0.25), (88, 0.25), (91, 1)], 0.34, 0.4)
box(26.2, [(82, 1), (77, 2)], 0.36)                                          # hmph
LAB = e                                                                      # 27.3
# ---- D: Moose (27.3–35.4): a C7 pedal with quivering repeated notes, then the throw, two passes, two spins, uh-oh
k = 0
t = LAB
while t < EV["throws"][0] - 0.05:
    rate = 0.3 - 0.18 * (t - LAB) / (EV["throws"][0] - LAB)                  # the quiver speeds up
    melody.append([round(t, 3), 60 if k % 2 == 0 else 58, 0.15 + 0.06 * (t - LAB) / (EV["throws"][0] - LAB), False, rate * 1.4]); t += rate; k += 1
held(LAB, [("C7", EV["throws"][0] - LAB)], 0.18)
pads([(LAB, EV["throws"][0], "C7")], 1.0, 0.4, 0.5)
box(LAB + 0.3, [(76, 2), (79, 2), (82, 3)], 0.3)
bD = ["F", "C"]
e = waltz(EV["throws"][0], bD, 0.24, 0.42)
barpads(EV["throws"][0], bD, 0.95)
for p in EV["past"]:
    box(p + 0.08, SPIN, 0.36, 1.0)
box(34.3, UHOH, 0.42)
melody.append([34.3, 38, 0.26, False, 1.0])
FENCE = e                                                                    # 34.8
# ---- E: the fence (35.4→ 41.0): held, hushed; a slow music-box line; the perk asks a question
seqE = [("Dm", FENCE, FENCE + 2.4), ("Bb", FENCE + 2.4, FENCE + 4.0), ("Gm", FENCE + 4.0, EV["perk"]), ("C", EV["perk"], 41.0)]
for c, a, b in seqE:
    chords.append([a, c]); bs = CH[c][0]
    kk = 0
    while a + kk * 2 * BEAT < b - 0.05:
        melody.append([round(a + kk * 2 * BEAT, 3), bs + 12 if bs < 40 else bs, 0.18 if kk % 2 == 0 else 0.13, False, BEAT * 1.6]); kk += 1
    melody.append([round(a + 0.05, 3), CH[c][1][1], 0.14, False, b - a])
pads([(a, b, c) for c, a, b in seqE], 0.95, 0.35, 0.7)
box(FENCE + 0.7, [(74, 2), (72, 1), (70, 2), (69, 3)], 0.26)
box(EV["perk"] + 0.02, [(72, 1), (77, 2)], 0.34)                             # ?
# ---- F: Bean + the gift (41.0–EV.wag): the theme slowly on the piano, music box an octave up
GIFT = 41.0
held(GIFT, [("F", 1.8), ("Bb", 1.8), ("F/C", 1.8), ("C7", EV["wag"] - GIFT - 5.4)], 0.2)
slow = 0.75
for m, nb, tt in [(72, 1, 0), (69, 1, 1), (72, 1, 2), (77, 2, 3), (76, 1, 5), (74, 1, 6), (72, 1, 7), (70, 1, 8)]:
    melody.append([round(GIFT + 0.1 + tt * slow, 3), m, 0.28, False, nb * slow + 0.2])
box(GIFT + 0.1, [(84, 1), (81, 1), (84, 1), (89, 2), (88, 1), (86, 1), (84, 1), (82, 1), (81, 3)], 0.22, slow)
pads([(GIFT, GIFT + 1.8, "F"), (GIFT + 1.8, GIFT + 3.6, "Bb"), (GIFT + 3.6, GIFT + 5.4, "F/C"), (GIFT + 5.4, EV["wag"], "C7")], 0.9, 0.5, 0.8)
# ---- G: the turn + the zoomies (EV.wag → 58.8): a swelling arp, then the full waltz in F, brightest
W = EV["wag"]
for c, a, b in [("Bb", W, W + 0.6), ("C", W + 0.6, W + 1.2)]:
    chords.append([a, c]); tri = CH[c][1]
    kk = 0
    while a + kk * 0.15 < b - 0.02:
        melody.append([round(a + kk * 0.15, 3), (tri + [m + 12 for m in tri])[kk % 6], 0.22 + 0.1 * (a - W) / 0.6, False, 0.45]); kk += 1
pads([(W, W + 0.6, "Bb"), (W + 0.6, W + 1.2, "C")], 1.0, 0.2, 0.6)
ZW = W + 1.2
zb = ["F", "C", "Bb", "F", "F", "C", "Bb", "C", "F", "Dm"]
zb = zb[: int((58.8 - ZW) // BAR) + 1]
e = waltz(ZW, zb, 0.26)
barpads(ZW, zb, 0.9)
box(ZW, THEME_B, 0.46)
box(52.5, TADA, 0.4, 0.3)                                                    # zoomies are contagious
PILE = e
# ---- H: the pile (→ 61.8): the theme as a lullaby on the music box
END = 61.8
held(PILE, [("F", 1.4), ("Bb", END - PILE - 1.4)], 0.18)
pads([(PILE, PILE + 1.4, "F"), (PILE + 1.4, END, "Bb")], 0.85, 0.4, 0.8)
box(PILE + 0.1, THEME_A[:5], 0.38, 0.6)
# ---- I: end card (61.8–D): Bb → C7 → F
held(END, [("Bb", 1.3), ("C7", 1.1), ("F", D - END - 2.4)], 0.22)
box(END + 0.05, [(74, 1), (76, 1), (77, 3)], 0.4, 0.8)
pads([(END, END + 1.3, "Bb"), (END + 1.3, END + 2.4, "C7"), (END + 2.4, D - 0.2, "F")], 0.8, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [amb_("wind", 0.0, D, -50, {"darkness": 0.75, "gust": 0.3, "whistle": 0.0}, 30, fi=0.6, fo=1.5),
       amb_("dry_leaves", 0.0, D, -52, {"density": 0.45}, 20, fi=0.6, fo=1.5),
       amb_("city_day", 0.0, 58.8, -50, {"murmur": 0.35, "traffic": 0.15}, 40, fi=0.8, fo=1.0),
       amb_("wind", EV["past"][0] - 0.05, EV["past"][0] + 0.7, -38, {"darkness": 0.6, "gust": 1.0, "whistle": 0.0}, 31, fi=0.05, fo=0.4),
       amb_("wind", EV["past"][1] - 0.05, EV["past"][1] + 0.7, -38, {"darkness": 0.6, "gust": 1.0, "whistle": 0.0}, 32, fi=0.05, fo=0.4),
       amb_("crowd_cheer", 49.2, 58.9, -41, {"excite": 0.55}, 41, fi=0.8, fo=0.6),
       amb_("applause", 52.6, 58.7, -44, {"density": 14, "swell": 0.5}, 42, fi=0.8, fo=0.6)]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def paws(t0, t1, rate=0.14, g=-37, w=0.22, pan=0.0):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g + (1 if k % 2 else 0), pan + 0.1 * ((k % 3) - 1), {"weight": w, "scuff": 0.2})); k += 1

ev = []
# far-off happy boofs all morning (the park is busy) — never under a line that matters
import random
R = random.Random(30)
t = 0.8
while t < 48.0:
    if not (16.0 < t < 18.6 or 38.4 < t < 39.4):
        ev.append(ev_(t, "dog_bark", -42 - R.random() * 4, R.uniform(-0.6, 0.6), {"pitch": R.choice([0.85, 1.0, 1.15, 1.3, 1.5])}, room=-12))
    t += 1.6 + R.random() * 1.8
# thumb: a tiny curious "hm?" with the head tilt
ev.append(ev_(1.0, "whimper", -36, 0.0, {"pitch": 1.4, "dur": 0.28}))
# gate: the latch + a small creak; Pip's paws charging in
ev.append(ev_(EV["gate"], "door_open", -31, 0.1, {"creak": 0.7, "pitch": 1.25}))
ev.append(ev_(EV["gate"] + 0.72, "metal_clang", -40, 0.15, {"size": 0.25, "pitch": 1.6, "dur": 0.5}))
paws(4.45, 6.0, 0.1, -36); paws(6.0, 7.5, 0.16, -38)
# plan: the bunny set down, the play bow
ev.append(ev_(EV["drop"], "plush_place", -30, 0.0))
paws(EV["bow"] - 0.05, EV["bow"] + 0.35, 0.09, -38)
# huskies: their howls are the band (three voices, a chord), Pip's paws up, his one tiny awoo
for (a, d) in EV["howls"]:
    for i, (pt, pn) in enumerate([(0.6, -0.4), (0.67, -0.1), (0.75, 0.2)]):
        ev.append(ev_(a + i * 0.25, "puppy_howl", -33, pn, {"pitch": pt, "dur": d}))
paws(11.8, 13.6, 0.15, -37)
ev.append(ev_(13.9, "plush_place", -29, 0.1))
ev.append(ev_(EV["squeak"], "puppy_howl", -26, 0.15, {"pitch": 1.55, "dur": 0.42}))
# the poodles: splashes in the kiddie pool, the shake, three poofs, tippy-tap paws flouncing off
for i, s in enumerate(EV["splash"]):
    ev.append(ev_(s, "water_splash", -28 - (i % 2), -0.2 + 0.1 * i, {"size": 0.16, "dur": 0.9}))
paws(23.6, 24.4, 0.14, -38)
s0, s1 = EV["shake"]
ev.append(ev_(s0, "blanket_rustle", -29, 0.0, {"dur": s1 - s0, "softness": 0.4, "intensity": 0.9}))
for k in range(4):
    ev.append(ev_(s0 + 0.05 + k * 0.18, "plip", -36, 0.3 * ((k % 3) - 1), {"pitch": 1.0 + 0.15 * k}))
for i in range(3):
    ev.append(ev_(EV["frizz"] + i * 0.09, "pop", -30, -0.3 + 0.3 * i, {"pitch": 0.85 + 0.1 * i}))
for i in range(3):
    paws(26.65 + i * 0.14, 28.4, 0.11, -40, 0.12, -0.2 + 0.2 * i)
# Moose: two heavy gallops past Pip (+ the gust in the ambience), the ball landing
for p in EV["past"]:
    for k in range(7):
        ev.append(ev_(p - 0.12 + k * 0.085, "footstep", -31 + (1 if k % 2 else 0), 0.25 - 0.08 * k, {"weight": 1.0, "scuff": 0.5}))
ev.append(ev_(EV["throws"][0] + 0.9, "kick", -40, -0.2))
# the fence: a soft sigh
ev.append(ev_(EV["sigh"], "whimper", -37, 0.0, {"pitch": 0.9, "dur": 0.7}))
# the walk to the bench, the bunny set down, the nudge squeaks it, Bean's tiny happy boof
paws(41.5, 44.6, 0.15, -38)
ev.append(ev_(EV["place"], "plush_place", -30, 0.0))
ev.append(ev_(EV["place"] + 0.55, "plush_squeak", -25, 0.0, {"pitch": 1.1}))
ev.append(ev_(EV["wag"] + 0.35, "dog_bark", -31, 0.0, {"pitch": 2.1}))
ev.append(ev_(EV["grab"], "plush_squeak", -27, 0.1, {"pitch": 1.2}))
# zoomies: a stampede of paws that thickens as everyone joins; a boof as each one joins; a swell into the big lap
paws(EV["grab"] + 0.15, 52.4, 0.085, -37, 0.18)
paws(49.7, 52.4, 0.1, -38, 0.22, 0.15)
dens = 0.11
t = 52.4
while t < 58.8:
    n = sum(1 for j in EV["join"] if j <= t) + 2
    for kk in range(min(3, 1 + n // 4)):
        ev.append(ev_(t + kk * 0.023, "footstep", -38 + (1 if kk else 0), R.uniform(-0.5, 0.5), {"weight": 0.2 + 0.3 * R.random(), "scuff": 0.3}))
    t += 0.075
for i, j in enumerate(EV["join"]):
    ev.append(ev_(j + 0.1, "dog_bark", -34, R.uniform(-0.5, 0.5), {"pitch": [0.85, 0.9, 0.95, 1.3, 1.35, 1.25, 0.8, 1.1, 1.2][i]}))
ev.append(ev_(52.45, "low_swell", -32, 0.0, {"dur": 1.6, "pitch": 1.1}))
# the pile: two licks, a tiny snore
ev += [ev_(59.6, "slurp", -32, 0.0, {"dur": 0.25}), ev_(60.6, "slurp", -33, 0.0, {"dur": 0.25}), ev_(60.0, "snore", -34, 0.1, {"dur": 1.2, "size": 0.35})]

cues = {
    "title": "030 - What if nobody at the dog park wanted to play with Pip? (Pip ep. 3: Pip's theme, sunny-park arrangement — music box + waltz)",
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
