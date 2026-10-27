# Generates cues.json for video 023 (Pip ep. 2, lane 3 @ed._.sims): "What if Pip went trick-or-treating?"
# Run: python3 -I videos/023-pip-trick-or-treat/make_cues.py videos/023-pip-trick-or-treat/cues.json
#
# Sound identity — PIP'S THEME, HALLOWEEN ARRANGEMENT (the series voice from 021: music box over a soft piano waltz + warm pad),
# re-arranged as a "spooky-cute" waltz: never scary, never sad.
#   - 0–4.5 s: a quiet dusk porch (crickets, dry leaves, a breeze). No music.
#   - 4.55 s the costume pops on: Pip's theme enters in F (music box + waltz) — the premise moment.
#   - 8.9 s the street lights up: the same waltz turns D minor, bouncier (the Halloween colour); each door's gag lands on a
#     music-box "ta-da" (the bowl, Pip: 1, the candy rain) or the falling "uh-oh" from 021 (wrong kind of bone).
#   - 35.0 s house four: held, hushed chords (Dm → Bb → Gm → A) over a low pad + a slow two-note piano pulse — suspense, not dread.
#   - 46.0 s the shake: a tumbling music-box run; 47.6 s the turn: F major, the theme slowly on the piano (021's turn, reused).
#   - 52.35 s house four lights up: a swelling arp into the full waltz in F, brightest of the episode; home: the theme as a
#     lullaby on the music box; the end card resolves on F.
# Foley (story.json → "pip" holds the shared event times): paws, knocks, door creaks, two soft boofs, candy pouring into the
# pumpkin (new `candy_rattle`), the inflatable cat sighing flat (new `deflate`), the skeleton clattering down (new
# `bone_clatter`), the wet-dog shake, kids cheering, a tiny snore.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.4, 8.9, 11.9, 15.0, 18.4, 22.4, 25.3, 26.05, 28.0, 31.0, 35.0, 37.3, 39.2, 43.0, 47.6, 52.2, 54.9, 56.8, 61.0]
IN_M = EV["costume"]                       # music enters: the costume pops on
STREET, GRUMP, TURN, LIGHTS, HOME, END = 8.9, 35.0, 47.6, EV["lights"], 56.8, 61.0
BEAT = 0.6; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "A7": (45, [55, 61, 64], [45, 55, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
    "F/C": (36, [57, 60, 65], [48, 57, 60, 65]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
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
SPOOK = [(74, 1), (77, 1), (81, 1), (79, 1.5), (77, 0.5), (76, 1), (74, 1), (73, 1), (74, 3)]         # the theme's minor cousin
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
UHOH = [(77, 0.75), (74, 1.5)]

# ---- A: the costume (4.55–8.9): Pip's theme in F
waltz(IN_M, ["F", "Bb"], 0.22)
box(IN_M, THEME_A[:6], 0.44)
barpads(IN_M - 0.15, ["F", "Bb"], 0.75)
STREET = IN_M + 2 * BAR                    # the waltz turns minor right on the bar line, just before the street cut
# ---- B: the street + three doors (8.9–35.0): spooky-cute D-minor waltz, gags land on music-box hits
bars = ["Dm", "Gm", "C", "F", "Dm", "Gm", "A7", "Dm"] * 2
bars = (bars * 2)[: int(-(-(GRUMP - STREET) // BAR))]
waltz(STREET, bars, 0.2, 0.56)
barpads(STREET, bars, 1.05)
box(STREET + 0.05, SPOOK, 0.36)
box(STREET + 8 * BAR + 0.05, SPOOK, 0.32)
box(15.3, [(74, 1), (77, 1), (81, 2), (79, 1), (77, 1), (76, 2)], 0.3)       # Mrs. Rosa's door opens
box(29.4, [(81, 1), (79, 1), (77, 1), (76, 1), (74, 1), (76, 1), (77, 2)], 0.3)   # the skeleton's porch
box(EV["pour"][0] + 0.2, TADA, 0.42, 0.3)                                   # the whole bowl
box(EV["deflate"][0] + 0.1, [(81, 0.5), (79, 0.5), (77, 0.5), (74, 0.5), (69, 2)], 0.36, 0.35)   # the cat sighs flat
box(EV["deflate"][1] - 0.15, TADA, 0.42, 0.3)                               # Pip: 1
melody.append([EV["deflate"][0] + 0.7, 38, 0.3, False, 1.2])
box(EV["rain"][0], [(84, 0.25), (81, 0.25), (79, 0.25), (77, 0.25), (76, 0.25), (74, 0.25), (72, 1)], 0.34, 0.4)   # candy rain
box(34.25, UHOH, 0.42)                                                       # wrong kind of bone
melody.append([34.25, 38, 0.26, False, 1.0])
# ---- C: house four (35.0–43.0): held hush + a slow two-note pulse
seqC = [("Dm", 35.0, 37.3), ("Bb", 37.3, 39.2), ("Gm", 39.2, 41.0), ("A", 41.0, 43.0)]
for c, a, b in seqC:
    chords.append([a, c]); bs = CH[c][0]
    k = 0
    while a + k * 2 * BEAT < b - 0.05:
        melody.append([round(a + k * 2 * BEAT, 3), bs + 12 if bs < 40 else bs, 0.19 if k % 2 == 0 else 0.14, False, BEAT * 1.6]); k += 1
    melody.append([round(a + 0.05, 3), CH[c][1][1], 0.15, False, b - a])
pads([(a, b, c) for c, a, b in seqC], 0.95, 0.3, 0.6)
box(35.3, [(74, 2), (73, 2), (74, 3)], 0.26)
box(EV["door4"] + 0.05, [(70, 1.5), (69, 3)], 0.28)
# ---- D: Pip thinks… then shakes (43.0–47.6): an A7 pedal, then a tumbling run
held(43.0, [("A7", 1.8), ("Dm", 1.2), ("A7", 47.6 - 46.0)], 0.2)
pads([(43.0, 44.8, "A7"), (44.8, 46.0, "Dm"), (46.0, TURN, "A7")], 0.95, 0.3, 0.6)
box(43.3, [(76, 1), (77, 1), (76, 1), (73, 2)], 0.3)
box(EV["shake"][0], [(88, 0.25), (84, 0.25), (81, 0.25), (79, 0.25), (77, 0.25), (76, 0.25), (74, 0.25), (72, 0.25), (69, 1)], 0.36, 0.42)
# ---- E: the turn (47.6–52.35): F major, the theme slowly on the piano, music box an octave up
held(TURN, [("F", 1.8), ("Bb", 1.6), ("F", LIGHTS - TURN - 3.4)], 0.2)
slow = 0.7
for m, nb, tt in [(72, 1, 0), (69, 1, 1), (72, 1, 2), (77, 2, 3), (76, 1, 5)]:
    melody.append([round(TURN + 0.1 + tt * slow, 3), m, 0.3, False, nb * slow + 0.2])
box(TURN + 0.1, [(84, 1), (81, 1), (84, 1), (89, 2), (88, 1)], 0.24, slow)
pads([(TURN, TURN + 1.8, "F"), (TURN + 1.8, TURN + 3.4, "Bb"), (TURN + 3.4, LIGHTS, "F")], 0.9, 0.5, 0.8)
# ---- F: house four lights up (52.35–56.8): a swelling arp, then the waltz in F, brightest
for c, a, b in [("Bb", LIGHTS, LIGHTS + 0.6), ("C", LIGHTS + 0.6, LIGHTS + 1.2)]:
    chords.append([a, c]); tri = CH[c][1]
    k = 0
    while a + k * 0.15 < b - 0.02:
        melody.append([round(a + k * 0.15, 3), (tri + [m + 12 for m in tri])[k % 6], 0.22 + 0.1 * (a - LIGHTS) / 0.6, False, 0.45]); k += 1
pads([(LIGHTS, LIGHTS + 0.6, "Bb"), (LIGHTS + 0.6, LIGHTS + 1.2, "C")], 1.0, 0.2, 0.6)
FW = LIGHTS + 1.2
fbars = ["F", "C", "Bb", "F"]
waltz(FW, fbars, 0.25)
barpads(FW, fbars, 0.85)
box(FW, THEME_B, 0.46)
box(EV["refill"][0] + 0.1, TADA, 0.4, 0.3)
# ---- G: home (56.8–61.0): the theme as a lullaby on the music box
hb = ["F", "Bb", "F"]
held(HOME + 0.15, [("F", 1.5), ("Bb", 1.4), ("F", END - HOME - 3.05)], 0.18)
pads([(HOME, HOME + 1.65, "F"), (HOME + 1.65, HOME + 3.05, "Bb"), (HOME + 3.05, END, "F")], 0.85, 0.4, 0.8)
box(HOME + 0.15, THEME_A[:5], 0.38, 0.75)
# ---- H: end card (61.0–D): Bb → C7 → F
held(END, [("Bb", 1.3), ("C7", 1.1), ("F", D - END - 2.4)], 0.22)
box(END + 0.05, [(74, 1), (76, 1), (77, 3)], 0.4, 0.8)
pads([(END, END + 1.3, "Bb"), (END + 1.3, END + 2.4, "C7"), (END + 2.4, D - 0.2, "F")], 0.8, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

out = [(0.0, 3.45), (8.85, 56.85)]
amb = []
for i, (a, b) in enumerate(out):
    amb += [amb_("crickets", a, b, -44, {"count": 3, "density": 0.45}, 10 + i, fi=0.3),
            amb_("dry_leaves", a, b, -50, {"density": 0.6}, 20 + i, fi=0.4),
            amb_("wind", a, b, -54, {"darkness": 0.7, "gust": 0.25, "whistle": 0.0}, 30 + i, fi=0.5)]
amb += [amb_("crowd_cheer", 9.2, 34.9, -50, {"excite": 0.25}, 40, fi=1.0, fo=0.6),      # far-off trick-or-treaters
        amb_("room_tone", 3.4, 8.95, -40, seed=50), amb_("room_tone", HOME - 0.05, D, -40, seed=51, fo=1.2)]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def paws(t0, t1, rate=0.14, g=-37):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g + (1 if k % 2 else 0), 0.1 * ((k % 3) - 1), {"weight": 0.22, "scuff": 0.2})); k += 1

def steps(t0, t1, rate=0.42, g=-35, w=0.45):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g, 0.0, {"weight": w, "scuff": 0.4})); k += 1

ev = []
# thumb: a tiny curious "hm?" with the head tilt
ev.append(ev_(1.0, "whimper", -34, 0.0, {"pitch": 1.35, "dur": 0.3}))
# costume: the pop, the spin, a pant
ev += [ev_(IN_M, "plush_place", -28, 0.0), ev_(IN_M + 0.02, "blanket_rustle", -32, 0.0, {"dur": 0.3, "softness": 0.6, "intensity": 0.5})]
paws(5.3, 7.05, 0.11, -36)
ev.append(ev_(7.35, "slurp", -36, 0.0, {"dur": 0.3}))
# street: the lights come on with a low swell; paws + small steps down the walk
ev.append(ev_(9.1, "low_swell", -30, 0.0, {"dur": 2.0, "pitch": 1.0}))
paws(8.95, 11.9, 0.15, -40); steps(9.0, 11.9, 0.4, -40, 0.4)
# rules: two pats on the pumpkin
ev += [ev_(12.45, "plush_place", -32, 0.1), ev_(12.85, "plush_place", -33, 0.1)]
# door 1: knock knock knock, the door, the boof, the whole bowl
for tk in EV["knock"]:
    ev.append(ev_(tk, "giant_step", -30, 0.0, {"size": 0.12, "surface": "wood"}))
ev.append(ev_(EV["door1"], "door_open", -32, 0.0, {"creak": 0.6}))
ev.append(ev_(EV["barks"][0], "dog_bark", -27, 0.0, {"pitch": 1.5}))
ev.append(ev_(EV["pour"][0] + 0.3, "candy_rattle", -27, 0.0, {"dur": EV["pour"][1] - EV["pour"][0], "density": 28}))
ev.append(ev_(EV["pour"][0] + 0.75, "candy_rattle", -33, -0.2, {"dur": 0.6, "density": 14, "size": 1.3}))
ev.append(ev_(20.62, "plush_place", -31, 0.0))
# house 2: paws up the lawn, the boof, the cat sighs flat, the vampire's handful lands
paws(22.4, 23.5, 0.14, -37)
ev.append(ev_(EV["barks"][1], "dog_bark", -26, 0.0, {"pitch": 1.45}))
ev.append(ev_(EV["deflate"][0], "deflate", -24, 0.1, {"dur": EV["deflate"][1] - EV["deflate"][0]}))
paws(27.05, 27.6, 0.12, -37)
ev.append(ev_(EV["toss"] + 0.5, "candy_rattle", -29, 0.0, {"dur": 0.35, "density": 22}))
# house 3: kids grab + run, Pip climbs the steps, the tug, the clatter, the candy rain, a tiny sad "hnn"
ev += [ev_(28.3, "candy_rattle", -34, -0.2, {"dur": 0.3, "density": 14}), ev_(28.6, "candy_rattle", -34, 0.2, {"dur": 0.3, "density": 14})]
steps(29.3, 30.9, 0.22, -36, 0.35)
paws(28.3, 30.6, 0.15, -38)
ev.append(ev_(EV["tug"][0] + 0.1, "blanket_rustle", -33, 0.0, {"dur": 0.4, "softness": 0.5, "intensity": 0.5}))
ev.append(ev_(EV["collapse"], "bone_clatter", -25, 0.1, {"dur": 0.9}))
ev.append(ev_(EV["rain"][0] + 0.25, "candy_rattle", -28, 0.0, {"dur": EV["rain"][1] - EV["rain"][0], "density": 24}))
ev.append(ev_(34.45, "whimper", -33, 0.0, {"pitch": 1.25, "dur": 0.35}))
# house 4: kids hurry past, Pip trots up, scratch scratch scratch, a long grumpy creak
steps(35.0, 37.3, 0.2, -38, 0.35)
paws(38.5, 39.2, 0.15, -37)
for ts in EV["scratch"]:
    ev.append(ev_(ts, "blanket_rustle", -33, 0.0, {"dur": 0.16, "softness": 0.2, "intensity": 0.6}))
ev.append(ev_(EV["door4"], "door_open", -28, 0.0, {"creak": 2.2}))
# the shake: fur + every candy hitting the porch
ev.append(ev_(EV["shake"][0], "blanket_rustle", -27, 0.0, {"dur": 1.0, "softness": 0.4, "intensity": 0.9}))
ev.append(ev_(EV["shake"][0] + 0.35, "candy_rattle", -26, 0.0, {"dur": 0.9, "density": 30, "size": 1.2}))
# the bone: knees creak as he kneels, a happy boof, tail thumps
ev.append(ev_(49.25, "floorboard_creak", -33, 0.0, {"dur": 0.4}))
ev.append(ev_(EV["bone"] + 0.5, "plush_place", -32, 0.0))
ev.append(ev_(EV["bone"] + 0.75, "dog_bark", -30, 0.0, {"pitch": 1.65}))
for j in range(5):
    ev.append(ev_(51.4 + j * 0.17, "giant_step", -36, 0.1, {"size": 0.1, "surface": "wood"}))
# the lights: a click, a swell, kids cheering, the refill
ev += [ev_(LIGHTS, "lamp_switch_click", -32, 0.0), ev_(LIGHTS + 0.05, "low_swell", -28, 0.0, {"dur": 1.8, "pitch": 1.1})]
steps(52.4, 54.2, 0.18, -37, 0.35)
ev.append(ev_(EV["refill"][0] + 0.15, "candy_rattle", -26, 0.0, {"dur": EV["refill"][1] - EV["refill"][0], "density": 30}))
# home: a tiny snore, a wrapper
ev += [ev_(57.4, "snore", -36, 0.0, {"dur": 1.2, "size": 0.35}), ev_(59.1, "candy_rattle", -38, 0.2, {"dur": 0.25, "density": 10}), ev_(59.9, "snore", -37, 0.0, {"dur": 1.2, "size": 0.35})]
amb.append(amb_("crowd_cheer", LIGHTS + 0.2, 56.8, -36, {"excite": 0.7}, 41, fi=0.4, fo=0.5))

cues = {
    "title": "023 - What if Pip went trick-or-treating? (Pip ep. 2: Pip's theme, Halloween arrangement — music box + spooky-cute waltz)",
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
