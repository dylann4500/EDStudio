# Generates cues.json for video 038 (Pip ep. 5, lane 3 @ed._.sims): "What if the whole town lost power… and only Pip wasn't scared?"
# Run: python3 -I videos/038-pip-power-outage/make_cues.py videos/038-pip-power-outage/cues.json
#
# Sound identity — PIP'S THEME, "STORM LULLABY" ARRANGEMENT (the series voice from 021: music box over a soft piano waltz + warm pad),
# this time a disaster episode: a quiet rain-led open, a hushed D-minor stretch in the dark, and the turn to F major when Pip
# takes charge. Cozy, never scary: thunder is only a far, low-passed rumble (`distant_boom`), no flashes, no stings.
#   - 0–8.7 s: rain on the window, room tone, two far rumbles, paws, a boof, the bunny squeak. No music.
#   - 8.7 s the blackout: the music ENTERS — a soft pad drone + held D-minor piano chords, a slow music-box line in minor.
#     The three scared gags each get a small falling music-box "uh-oh"; Mrs. Rosa's room = the hush, lowest.
#   - 25.4 s "But Pip wasn't scared.": the turn — the waltz starts in F, the theme on the music box. CLICK (the flashlight) =
#     a ta-da; each battery candle clicks on with its own rising music-box note.
#   - the bunny: the theme tender (B section). Maple St in the rain: the waltz in Bb, softer, rain + wind up front.
#   - 46.6 s the door opens: a held swell; Bean's wag = a happy run. The fort: the waltz in F, fullest.
#   - 55.7 s the power comes back street by street: a rising music-box arpeggio over the swell, ta-da at 12,400.
#   - asleep: the theme as a lullaby; the end card resolves on F.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.4, 8.4, 11.6, 14.2, 16.8, 19.4, 22.0, 25.4, 29.6, 31.7, 33.4, 37.4, 41.4, 45.6, 49.8, 52.6, 55.4, 58.4, 63.0]
IN_M = EV["blackout"][0]                    # music enters with the blackout
ROSA, TURN, BUNNY, STREET, DOOR, FORT, BACK, SLEEP, END = 22.0, 25.4, 37.4, 41.4, 45.6, 49.8, 55.4, 58.4, 63.0
BEAT = 0.55; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "A7": (45, [55, 61, 64], [45, 55, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
    "Eb": (39, [58, 63, 67], [51, 58, 63, 67]), "F7": (41, [57, 63, 65], [53, 57, 63, 65]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.22, stac=0.36, beat=BEAT):
    """Piano oom-pah-pah: bass on 1 (held), chord on 2 and 3 (short)."""
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

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]           # F F Bb F
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]           # F C Bb-C F
MINOR = [(74, 2), (69, 1), (72, 2), (70, 1), (69, 3), (65, 2), (69, 1), (74, 3)]                       # the theme's shape in D minor, slower
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
UHOH = [(76, 1), (73, 2)]
RUN_UP = [(65, 0.25), (69, 0.25), (72, 0.25), (77, 0.25), (81, 0.25), (84, 0.25), (89, 1)]

# ---- A: the dark (8.7 … 25.4): pad drone + held minor chords, a slow minor music-box line; uh-ohs on the gags
seqA = [("Dm", IN_M, 11.6), ("Bb", 11.6, 14.2), ("Gm", 14.2, 16.8), ("Dm", 16.8, 19.4), ("A", 19.4, ROSA)]
for c, a, b in seqA:
    chords.append([round(a, 3), c]); bs = CH[c][0]
    k = 0
    while a + k * 2 * BEAT < b - 0.05:
        melody.append([round(a + k * 2 * BEAT, 3), bs + 12 if bs < 40 else bs, 0.17 if k % 2 == 0 else 0.12, False, BEAT * 1.7]); k += 1
    melody.append([round(a + 0.06, 3), CH[c][1][1], 0.14, False, b - a])
pads([(c0, c1, c) for c, c0, c1 in seqA], 1.15, 0.6, 0.8)
melody.append([IN_M, 26, 0.2, False, 3.0])                                          # one low piano note as the town goes dark
box(IN_M + 0.4, MINOR, 0.3, 0.6)
box(14.6, UHOH, 0.3, 0.4)                                                           # Mia hid
box(EV["bump"] + 0.05, UHOH, 0.32, 0.4); melody.append([round(EV["bump"] + 0.05, 3), 33, 0.2, False, 1.0])   # the shin
box(EV["rummage"][1] + 0.05, [(74, 1)], 0.26, 0.4); box(EV["rummage"][2] + 0.05, UHOH, 0.3, 0.4)            # a remote… a sock
# Rosa (22.0 … 25.4): the hush — held Dm / Bb, lowest, one soft line
held(ROSA, [("Dm", 1.7), ("Bb", TURN - ROSA - 1.7)], 0.16)
pads([(ROSA, ROSA + 1.7, "Dm"), (ROSA + 1.7, TURN, "Bb")], 1.15, 0.3, 0.8)
box(ROSA + 0.2, [(69, 2), (70, 1), (69, 2), (65, 3)], 0.24, 0.6)
# ---- B: the turn (25.4 … 37.4): "But Pip wasn't scared." — the waltz in F, the theme on the music box
bbars = fit(["F", "Bb", "C7", "F", "F", "Bb", "C", "F"], TURN, BUNNY)
end_b = waltz(TURN, bbars, 0.2)
barpads(TURN, bbars, 0.95)
box(TURN + 0.05, THEME_A, 0.42)
box(EV["click"] + 0.03, TADA, 0.4, 0.3)                                              # CLICK
box(32.4, [(77, 1), (76, 1), (74, 1), (72, 2)], 0.3)
for i, c0 in enumerate(EV["candles"]):                                               # each candle: its own note up the F chord
    bell.append([round(c0, 3), [72, 77, 81, 84, 89, 93][i], 0.34, 1.6])
# ---- C: the bunny (37.4 … 41.4): the B section, tender
cbars = fit(["Bb", "F", "C7", "F"], end_b, STREET)
end_c = waltz(end_b, cbars, 0.19)
barpads(end_b, cbars, 0.95)
box(BUNNY + 0.1, THEME_B, 0.4)
box(EV["peek"] + 0.05, [(81, 0.5), (84, 0.5), (89, 2)], 0.36, 0.35)
# ---- D: Maple St in the rain (41.4 … 45.6): the waltz in Bb, softer
dbars = fit(["Bb", "Eb", "F7", "Bb"], end_c, DOOR)
end_d = waltz(end_c, dbars, 0.18)
barpads(end_c, dbars, 0.95)
box(end_c + 0.05, [(m + 5, n) for m, n in THEME_A[:7]], 0.36)
# ---- E: the door (45.6 … 49.8): knock knock, a held swell as it opens, Bean's wag = a happy run
held(end_d, [("Gm", 1.0), ("C7", EV["open"] - end_d - 1.0 + 0.6), ("F", 1.2)], 0.2)
pads([(end_d, end_d + 1.0, "Gm"), (end_d + 1.0, EV["open"] + 0.6, "C7"), (EV["open"] + 0.6, EV["open"] + 1.8, "F")], 1.0, 0.25, 0.7)
e0 = EV["open"] + 1.8
ebars = fit(["Bb", "C7", "F"], e0, FORT)
end_e = waltz(e0, ebars, 0.2)
barpads(e0, ebars, 0.95)
box(EV["open"] + 0.1, [(77, 2), (76, 1), (77, 3)], 0.36, 0.45)
box(EV["beanWag"] + 0.05, RUN_UP, 0.34, 0.5)
# ---- F: the fort (49.8 … 55.4): the waltz in F, fullest
fbars = fit(["F", "C", "Bb", "F", "F", "Bb", "C7", "F"], end_e, BACK)
end_f = waltz(end_e, fbars, 0.24)
barpads(end_e, fbars, 0.9)
box(end_e, THEME_B, 0.46)
# ---- G: the power comes back (55.4 … 58.4): held swell + a rising arpeggio that climbs with the lights, ta-da at 12,400
a0, a1 = EV["powerBack"]
held(end_f, [("Bb", 1.0), ("C7", BACK + 0.6 - end_f - 1.0 + 1.0), ("F", SLEEP - BACK - 1.6)], 0.22)
pads([(end_f, end_f + 1.0, "Bb"), (end_f + 1.0, a0 + 1.2, "C7"), (a0 + 1.2, SLEEP, "F")], 1.0, 0.3, 0.7)
for i in range(16):
    bell.append([round(a0 + i * (a1 - a0) / 16, 3), [65, 69, 72, 77, 81, 84, 89, 93][i % 8] - (0 if i < 8 else 0), 0.26 + 0.008 * i, 1.4])
box(a1 + 0.05, TADA, 0.42, 0.3)
# ---- H: asleep (58.4 … end card): the theme as a lullaby; the end card resolves on F
held(SLEEP, [("F", 1.4), ("Bb", 1.3), ("F", 1.3), ("C7", END - SLEEP - 4.0)], 0.17)
pads([(SLEEP, SLEEP + 1.4, "F"), (SLEEP + 1.4, SLEEP + 2.7, "Bb"), (SLEEP + 2.7, SLEEP + 4.0, "F"), (SLEEP + 4.0, END, "C7")], 0.95, 0.4, 0.8)
box(SLEEP + 0.1, THEME_A, 0.34, 0.6)
held(END, [("Bb", 1.3), ("C7", 1.1), ("F", D - END - 2.4)], 0.2)
box(END + 0.05, [(74, 1), (76, 1), (77, 3)], 0.38, 0.8)
pads([(END, END + 1.3, "Bb"), (END + 1.3, END + 2.4, "C7"), (END + 2.4, D - 0.2, "F")], 0.85, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience: rain everywhere (inside on the glass, outside up front)
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [amb_("rain_window", 0.0, 8.45, -33, {"intensity": 0.8}, 10, fi=0.3, fo=0.1),
       amb_("room_tone", 0.0, D, -45, None, 12, fi=0.3, fo=1.5),
       amb_("lamp_hum", 0.0, 8.45, -52, None, 11, fi=0.4, fo=0.1),                            # the fridge/lamp hum dies with the power
       amb_("rain_window", 8.4, 11.6, -32, {"intensity": 1.2}, 13, fi=0.1, fo=0.15),          # the rooftop: rain up front
       amb_("wind", 8.4, 11.6, -38, {"darkness": 0.75, "gust": 0.5, "whistle": 0.05}, 14, fi=0.2, fo=0.15),
       amb_("rain_window", 11.55, 41.45, -33, {"intensity": 0.85}, 15, fi=0.1, fo=0.1),       # inside, on the glass
       amb_("rain_window", 41.4, 49.85, -30, {"intensity": 1.3}, 16, fi=0.1, fo=0.1),         # Maple St
       amb_("wind", 41.4, 49.85, -38, {"darkness": 0.75, "gust": 0.45, "whistle": 0.05}, 17, fi=0.2, fo=0.1),
       amb_("rain_window", 49.8, 55.45, -36, {"intensity": 0.7}, 18, fi=0.1, fo=0.1),
       amb_("rain_window", 55.4, 58.45, -35, {"intensity": 0.6}, 19, fi=0.1, fo=0.8),          # the storm is passing
       amb_("lamp_hum", 56.0, D, -52, None, 20, fi=1.5, fo=1.5),                              # the hum comes back
       amb_("rain_window", 58.4, D, -42, {"intensity": 0.4}, 21, fi=0.3, fo=2.0),
       amb_("crowd_cheer", 50.4, 54.9, -47, {"excite": 0.2}, 22, fi=0.4, fo=0.6)]           # giggles in the fort

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def paws(t0, t1, rate=0.14, g=-37):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g + (1 if k % 2 else 0), 0.1 * ((k % 3) - 1), {"weight": 0.22, "scuff": 0.2})); k += 1

def steps(t0, t1, rate=0.42, g=-36, w=0.45, pan=0.0):
    k = 0
    while t0 + k * rate < t1:
        ev.append(ev_(t0 + k * rate, "footstep", g, pan, {"weight": w, "scuff": 0.4})); k += 1

ev = []
# far thunder: soft, low, no crack
for k, th in enumerate(EV["thunder"]):
    ev.append(ev_(th, "distant_boom", -31 if k != 3 else -29, 0.15 * ((k % 3) - 1), {"dur": 3.2, "size": 0.7}))
# the evening: a boof, paws, the bunny squeak, the lamp flicker
paws(3.6, 6.4, 0.2, -38)
ev.append(ev_(EV["boofs"][0], "dog_bark", -29, 0.1, {"pitch": 1.6}))
ev += [ev_(6.62, "plush_squeak", -31, 0.1), ev_(7.1, "plush_squeak", -35, 0.1)]
ev += [ev_(EV["flicker"][0], "lamp_switch_click", -38, -0.2), ev_(EV["flicker"][0] + 0.25, "lamp_switch_click", -40, -0.2)]
# the blackout: a soft swell, the lamp dies at home
ev.append(ev_(IN_M, "low_swell", -33, 0.0, {"dur": 3.0, "pitch": 0.8}))
ev += [ev_(11.65, "lamp_switch_click", -38, -0.2), ev_(EV["homeOut"], "lamp_switch_click", -33, -0.2)]
# Mia hides, Dad shuffles + bonk, Mom rummages
ev += [ev_(14.5, "blanket_rustle", -31, -0.1, {"dur": 0.6, "softness": 0.7, "intensity": 0.6}), ev_(15.3, "blanket_rustle", -38, -0.1, {"dur": 0.3, "softness": 0.7, "intensity": 0.4})]
steps(16.9, EV["bump"], 0.38, -37, 0.4, 0.15)
ev += [ev_(EV["bump"], "bonk", -29, 0.1), ev_(EV["bump"] + 0.02, "giant_step", -35, 0.1, {"size": 0.12, "surface": "wood"})]
for j in range(4):
    ev.append(ev_(EV["bump"] + 0.3 + j * 0.42, "footstep", -37, 0.1, {"weight": 0.5, "scuff": 0.2}))     # hop, hop
for k in range(7):
    ev.append(ev_(19.55 + k * 0.17, "plush_place", -38 - (k % 3), -0.2 + 0.1 * (k % 3)))                 # rummaging
ev += [ev_(EV["rummage"][1], "phone_pickup", -36, -0.2), ev_(EV["rummage"][2], "blanket_rustle", -37, -0.2, {"dur": 0.2, "softness": 0.6, "intensity": 0.4})]
# Rosa's room: Bean's tiny whimpers, the thunder makes her hug him
ev += [ev_(22.6, "whimper", -37, 0.0, {"pitch": 2.0, "dur": 0.3}), ev_(23.7, "whimper", -36, 0.0, {"pitch": 2.05, "dur": 0.35}), ev_(24.6, "whimper", -38, 0.0, {"pitch": 2.0, "dur": 0.25})]
ev.append(ev_(23.5, "blanket_rustle", -38, 0.0, {"dur": 0.4, "softness": 0.8, "intensity": 0.4}))
# Pip in the dark: calm tail thumps; then the flashlight
for j in range(4):
    ev.append(ev_(26.0 + j * 0.5, "giant_step", -41, 0.0, {"size": 0.07, "surface": "wood"}))
paws(28.75, 30.75, 0.14, -37)
ev += [ev_(EV["grab"], "plush_pickup", -34, -0.1), ev_(EV["click"], "lamp_switch_click", -28, -0.1)]
paws(31.8, 32.6, 0.18, -39)
# the candles: the box scrapes out, the lid, six clicks
ev += [ev_(EV["tug"][0], "blanket_rustle", -34, -0.1, {"dur": 0.6, "softness": 0.2, "intensity": 0.6}), ev_(34.3, "plush_place", -34, 0.0), ev_(EV["lid"], "plush_place", -35, 0.0)]
for c0 in EV["candles"]:
    ev.append(ev_(c0, "lamp_switch_click", -36, 0.0))
paws(34.3, 34.9, 0.16, -39)
# the bunny: carried, dropped, Mia peeks, the hug
paws(EV["pickBunny"] + 0.3, EV["dropBunny"], 0.15, -38)
ev += [ev_(EV["pickBunny"], "plush_pickup", -34, 0.1), ev_(EV["dropBunny"], "plush_squeak", -31, 0.0), ev_(EV["peek"] + 0.1, "blanket_rustle", -36, 0.0, {"dur": 0.3, "softness": 0.8, "intensity": 0.4}),
       ev_(EV["hug"], "blanket_rustle", -32, 0.0, {"dur": 0.5, "softness": 0.8, "intensity": 0.6}), ev_(EV["hug"] + 0.2, "plush_squeak", -34, 0.0)]
# Maple St: little paws + Dad's steps on the wet walk
paws(STREET, 44.9, 0.15, -37)
steps(STREET + 0.1, 45.3, 0.45, -36, 0.5, 0.2)
# the porch: knock knock knock, the door, Bean's happy boof
for k0 in EV["knock"]:
    ev.append(ev_(k0, "knock", -27, 0.1, {"pitch": 0.55}))
ev += [ev_(EV["open"], "door_open", -31, 0.0), ev_(47.2, "whimper", -37, 0.0, {"pitch": 2.0, "dur": 0.3}), ev_(EV["beanWag"] + 0.2, "dog_bark", -32, 0.0, {"pitch": 2.3}), ev_(EV["beanWag"] + 0.5, "dog_bark", -30, -0.1, {"pitch": 1.6})]
# the fort: blankets, giggles (squeaks), Bean licks Pip
ev += [ev_(FORT + 0.2, "blanket_rustle", -36, 0.0, {"dur": 0.6, "softness": 0.8, "intensity": 0.4})]
for l in EV["laughs"]:
    ev.append(ev_(l, "plush_squeak", -36, 0.0))
ev += [ev_(53.4, "slurp", -38, 0.1), ev_(54.4, "slurp", -38, 0.1)]
# the power comes back: a swell under the arpeggio
ev.append(ev_(a0, "low_swell", -31, 0.0, {"dur": 2.6, "pitch": 1.1}))
# asleep: snores, a sleepy tail thump
for s in EV["snores"]:
    ev.append(ev_(s, "snore", -36, 0.0, {"dur": 1.2, "size": 0.45}))
ev += [ev_(60.9, "giant_step", -41, 0.0, {"size": 0.06, "surface": "wood"}), ev_(61.3, "giant_step", -42, 0.0, {"size": 0.06, "surface": "wood"})]

cues = {
    "title": "038 - What if the whole town lost power… and only Pip wasn't scared? (Pip ep. 5: Pip's theme, storm-lullaby arrangement — rain open, D minor in the dark, F major for the turn)",
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
              "stings": [], "ducks": [], "auto_duck": {"db": -1.5, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.25, "max_len": 1.2},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"{len(ev)} events, {len(melody)} piano notes, {len(bell)} music-box notes, {len(pad)} pad regions")
