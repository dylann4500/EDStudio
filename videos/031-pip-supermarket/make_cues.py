# Generates cues.json for video 031 (Pip ep. 4, lane 3 @ed._.sims): "What if Pip worked at the supermarket for one day?"
# Run: python3 -I videos/031-pip-supermarket/make_cues.py videos/031-pip-supermarket/cues.json
#
# Sound identity — PIP'S THEME, "SHOP WALTZ" ARRANGEMENT (the series voice from 021: music box over a soft piano waltz + warm pad),
# re-arranged as cheerful in-store music: brighter and bouncier than ep. 1's lullaby or ep. 2's spooky-cute minor.
#   - 0–4.5 s: a quiet store (murmur, fluorescent hum, a far cart). No music.
#   - 4.55 s the badge clicks on: Pip's theme enters in F (music box + waltz) — the premise moment.
#   - each job gets its own key + a music-box "ta-da" on its gag: GREETER in F (a tumbling run on the zoomies), SAUSAGES in Bb
#     (the time-lapse plays the waltz at double speed), CHECKOUT back in F with soft scanner boops in the foley.
#   - 33.6 s 4 PM: held, hushed chords (Dm → Bb → Gm → A) — the low point, suspense, never sad for long.
#   - 39.0 s the toddler: the theme slowly on the music box (warming to F); 44.0 s the scent trail = a rising music-box arpeggio,
#     then the waltz rebuilds under the walk; 51.3 s the hug: the theme in full, brightest; the cheer + balloons: full waltz.
#   - the staff wall: ta-da on the pin and on the biscuit; home: the theme as a lullaby; the end card resolves on F.
# Foley (story.json → "pip" holds the shared event times): paws, the badge click, the instant camera, a boof, zoomies, sausage
# packs, scanner boops (new `scan_beep`), the grocery avalanche (cans, boxes, oranges), a sigh, two tiny sobs, the bunny
# squeak, sniffs, applause + a soft cheer, balloon bumps, a happy boof, a snore.
import json, sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve().parent
story = json.loads((ROOT / "story.json").read_text())
EV = story["pip"]
D = story["duration"]
SCENES = [0, 3.4, 8.6, 11.4, 14.2, 16.8, 19.4, 22.4, 25.6, 28.2, 30.2, 33.6, 36.6, 39.0, 42.6, 46.0, 48.2, 49.3, 53.4, 56.4, 58.2, 60.2, 63.0]
IN_M = EV["badge"]                          # music enters: the badge clicks on
SAUS, LAPSE0, LAPSE1, CHECK, LOW, TOD, TRAIL, HUG, CHEER, EOTM, HOME, END = 16.8, EV["lapse"][0], EV["lapse"][1], 25.6, 33.6, 39.0, EV["trail"][0], EV["hug"], 53.4, 56.4, 60.2, 63.0
BEAT = 0.5; BAR = 3 * BEAT

CH = {  # bass, chord tones (piano), pad notes
    "F": (41, [57, 60, 65], [53, 57, 60, 65]), "Bb": (46, [58, 62, 65], [46, 58, 62, 65]), "C": (36, [55, 60, 64], [48, 55, 60, 64]),
    "C7": (36, [58, 60, 64], [48, 55, 58, 64]), "Dm": (38, [57, 62, 65], [50, 57, 62, 65]), "Gm": (43, [58, 62, 67], [43, 55, 58, 62]),
    "A": (45, [57, 61, 64], [45, 57, 61, 64]), "A7": (45, [55, 61, 64], [45, 55, 61, 64]), "Am": (45, [57, 60, 64], [45, 57, 60, 64]),
    "Eb": (39, [58, 63, 67], [51, 58, 63, 67]), "F7": (41, [57, 63, 65], [53, 57, 63, 65]), "Gm7": (43, [58, 62, 65], [43, 55, 58, 65]),
}
melody, bell, chords, pad = [], [], [], []

def waltz(t0, bars, vel=0.24, stac=0.36, beat=BEAT):
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

def held(t0, seq, vel=0.22):
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

def barpads(t0, bars, level=1.05, bar=BAR):
    cur = t0
    for c in bars:
        pads([(cur, cur + bar, c)], level, 0.12, 0.7); cur += bar
    return cur

def fit(bars, t0, t1, bar=BAR):
    n = max(1, int(round((t1 - t0) / bar)))
    return (bars * (n // len(bars) + 1))[:n]

THEME_A = [(72, 1), (69, 1), (72, 1), (77, 2), (76, 1), (74, 1), (72, 1), (70, 1), (69, 3)]           # F F Bb F
THEME_B = [(72, 1), (69, 1), (72, 1), (79, 2), (77, 1), (76, 1), (74, 1), (76, 1), (77, 3)]           # F C Bb-C F
TADA = [(72, 0.5), (77, 0.5), (81, 0.5), (84, 2)]
RUN_DN = [(88, 0.25), (84, 0.25), (81, 0.25), (79, 0.25), (77, 0.25), (76, 0.25), (74, 0.25), (72, 0.25), (69, 1)]
RUN_UP = [(65, 0.25), (69, 0.25), (72, 0.25), (77, 0.25), (81, 0.25), (84, 0.25), (89, 1)]

# ---- A: badge + greeter (4.55–16.8): the shop waltz in F
fbars = fit(["F", "Bb", "C7", "F", "F", "Bb", "C", "F"], IN_M, SAUS)
end_a = waltz(IN_M, fbars, 0.22)
barpads(IN_M - 0.1, fbars, 0.9)
box(IN_M, THEME_A, 0.44)
box(IN_M + 8 * BAR, THEME_B, 0.4)
box(EV["flash"] + 0.05, [(84, 0.5), (89, 1.5)], 0.34)                     # the flash: a little sparkle
box(10.6, [(74, 1), (72, 1)], 0.3)                                         # (pickup: no hole before the zoomies)
box(EV["herd"][0] - 0.05, RUN_DN + RUN_UP, 0.32, 0.5)                      # zoomies
box(EV["herd"][1] - 0.05, TADA, 0.42, 0.3)                                 # the huddle is complete
box(15.9, [(76, 1), (77, 1)], 0.3)                                         # pickup into the key change
# ---- B: sausages (start of bar after end_a … lapse): the waltz in Bb; ta-da when he sits on the pile; the look = two low notes
bbars = fit(["Bb", "Eb", "F7", "Bb"], end_a, LAPSE0)
end_b = waltz(end_a, bbars, 0.21)
barpads(end_a, bbars, 0.95)
box(end_a + 0.02, [(m + 5, n) for m, n in THEME_A[:6]], 0.4)
box(18.95, [(77, 0.5), (82, 0.5), (86, 0.5), (89, 2)], 0.4, 0.3)          # on top of the sausages
for r in EV["reach"]:
    box(r + 0.3, [(70, 1), (65, 2)], 0.34, 0.45)                          # "the look"
# ---- the time-lapse: the waltz at double speed
lbars = fit(["Bb", "F7", "Bb", "Eb", "F7", "Bb"], end_b, LAPSE1, 3 * 0.25)
end_l = waltz(end_b, lbars, 0.2, 0.16, 0.25)
barpads(end_b, lbars, 0.95, 0.75)
box(end_b + 0.02, [(m + 5, n) for m, n in THEME_B], 0.36, 0.25)
# ---- C: checkout (… 33.6): back to F; the avalanche = a tumbling run + a low thump
cbars = fit(["F", "C7", "F", "Bb", "F", "C7", "F", "F"], end_l, LOW)
end_c = waltz(end_l, cbars, 0.2)
barpads(end_l, cbars, 0.95)
box(end_l + 0.05, [(84, 1), (81, 1), (84, 1), (89, 2), (88, 1)], 0.3)
box(28.6, [(77, 1), (76, 1), (74, 1), (72, 2)], 0.3)                       # under the register screen
box(EV["spill"] + 0.05, RUN_DN, 0.38, 0.45)
melody.append([round(EV["spill"] + 0.55, 3), 29, 0.32, False, 1.2])
# ---- D: 4 PM, the low point (… 39.0): held hush + a slow two-note pulse
seqD = [("Dm", end_c, 35.4), ("Bb", 35.4, 37.0), ("Gm", 37.0, 38.2), ("A", 38.2, TOD)]
for c, a, b in seqD:
    chords.append([round(a, 3), c]); bs = CH[c][0]
    k = 0
    while a + k * 2 * BEAT < b - 0.05:
        melody.append([round(a + k * 2 * BEAT, 3), bs + 12 if bs < 40 else bs, 0.19 if k % 2 == 0 else 0.14, False, BEAT * 1.6]); k += 1
    melody.append([round(a + 0.05, 3), CH[c][1][1], 0.15, False, b - a])
pads([(a, b, c) for c, a, b in seqD], 1.12, 0.15, 0.7)
box(35.5, [(77, 2), (76, 1), (74, 3), (73, 3)], 0.24, 0.6)   # a soft music-box line over the hush (no gaps)
box(end_c + 0.3, [(74, 2), (73, 2), (74, 3)], 0.26)
box(EV["sobs"][1] + 0.1, [(76, 1), (77, 1), (79, 2)], 0.26)               # ears up
# ---- E: the toddler (39.0 … trail): warming chords, the theme slowly on the music box; the bunny = a tender ta-da
held(TOD, [("Dm", 1.2), ("Bb", 1.2), ("F", 1.2), ("C", TRAIL - TOD - 3.6)], 0.2)
pads([(TOD, TOD + 1.2, "Dm"), (TOD + 1.2, TOD + 2.4, "Bb"), (TOD + 2.4, TOD + 3.6, "F"), (TOD + 3.6, TRAIL + 0.2, "C")], 1.05, 0.15, 0.8)
box(TOD + 0.1, THEME_A[:5], 0.34, 0.6)
box(EV["bunny"] + 0.05, [(81, 0.5), (84, 0.5), (89, 2)], 0.36, 0.35)
box(43.0, [(76, 1), (77, 1), (79, 1)], 0.3, 0.4)                            # pickup into the trail
# ---- F: the scent trail + the walk (trail … 49.3): a rising arpeggio, then the waltz rebuilds
for i in range(14):
    bell.append([round(TRAIL + i * 0.11, 3), [65, 69, 72, 77, 81, 84, 89][i % 7], 0.3 + 0.01 * i, 1.4])   # two passes up the F arpeggio
held(TRAIL, [("F", 1.6)], 0.2)
pads([(TRAIL, TRAIL + 1.6, "F")], 1.05, 0.12, 0.8)
wbars = fit(["F", "Bb", "C", "F"], TRAIL + 1.6, 49.3)
end_w = waltz(TRAIL + 1.6, wbars, 0.2)
barpads(TRAIL + 1.6, wbars, 0.95)
box(TRAIL + 1.6, THEME_B, 0.36)
# ---- G: the reunion (… hug … cheer … EOTM): a held swell into the hug, then the full theme, brightest
held(end_w, [("Bb", 0.9), ("C7", HUG - end_w - 0.9)], 0.22)
pads([(end_w, end_w + 0.9, "Bb"), (end_w + 0.9, HUG, "C7")], 1.0, 0.25, 0.6)
gbars = fit(["F", "C", "Bb", "F", "F", "Bb", "C7", "F"], HUG, EOTM)
end_g = waltz(HUG, gbars, 0.26)
barpads(HUG, gbars, 0.9)
box(HUG, THEME_B, 0.48)
box(HUG + 6 * BAR, THEME_A, 0.44)
box(EV["balloons"] + 0.1, RUN_DN, 0.36, 0.45)
# ---- H: the staff wall (… home): ta-da on the pin, ta-da on the biscuit
hbars = fit(["Bb", "F", "C7", "F"], end_g, HOME)
end_h = waltz(end_g, hbars, 0.22)
barpads(end_g, hbars, 0.9)
box(EV["pin"] + 0.05, TADA, 0.42, 0.3)
box(EV["biscuit"] + 0.05, [(77, 0.5), (81, 0.5), (84, 0.5), (89, 2)], 0.42, 0.3)
# ---- I: home (… end card): the theme as a lullaby; J: the end card resolves on F
held(end_h, [("F", 1.2), ("Bb", 1.0), ("F", END - end_h - 2.2)], 0.18)
pads([(end_h, end_h + 1.2, "F"), (end_h + 1.2, end_h + 2.2, "Bb"), (end_h + 2.2, END, "F")], 0.9, 0.4, 0.8)
box(end_h + 0.1, THEME_A[:4], 0.36, 0.7)
held(END, [("Bb", 1.3), ("C7", 1.1), ("F", D - END - 2.4)], 0.22)
box(END + 0.05, [(74, 1), (76, 1), (77, 3)], 0.4, 0.8)
pads([(END, END + 1.3, "Bb"), (END + 1.3, END + 2.4, "C7"), (END + 2.4, D - 0.2, "F")], 0.85, 0.3, 0.9)
chords.sort(key=lambda c: c[0])

# ---------------------------------------------------------------- ambience: the store all day, the lot through the open doors
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [amb_("city_day", 0.0, D, -40, {"murmur": 1.0, "traffic": 0.0}, 10, fi=0.4, fo=1.5),        # shoppers' murmur
       amb_("lamp_hum", 0.0, D, -52, None, 11, fi=0.5, fo=1.5),
       amb_("room_tone", 0.0, D, -44, None, 12, fi=0.3, fo=1.5),
       amb_("city_day", 8.7, 11.6, -42, {"murmur": 0.3, "traffic": 0.9}, 13, fi=0.4, fo=0.8),       # the lot through the doors
       amb_("crowd_cheer", 14.2, 16.8, -46, {"excite": 0.25}, 14, fi=0.3, fo=0.5),                  # the huddle laughs
       amb_("crowd_cheer", 30.8, 33.5, -46, {"excite": 0.3}, 15, fi=0.3, fo=0.6),                   # the queue laughs
       amb_("applause", CHEER, EOTM + 0.6, -35, {"density": 45, "swell": 0.7}, 16, fi=0.3, fo=0.9),
       amb_("crowd_cheer", CHEER, EOTM + 0.2, -40, {"excite": 0.55}, 17, fi=0.3, fo=0.7)]

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
# thumb: a tiny "hm?" on the head tilt; a far cart
ev.append(ev_(1.0, "whimper", -35, 0.0, {"pitch": 1.35, "dur": 0.3}))
ev.append(ev_(1.6, "keyboard_type", -44, 0.4, {"dur": 1.6, "rate": 9}))
steps(0.3, 3.3, 0.48, -42, 0.4, -0.3)
# badge: the clip, a wiggle, the manager's steps, the instant camera (click + the print whirring out)
ev += [ev_(IN_M, "lamp_switch_click", -30, 0.0), ev_(IN_M + 0.03, "plush_place", -32, 0.0)]
paws(5.2, 6.3, 0.12, -38)
steps(5.6, 6.6, 0.42, -36, 0.5, -0.2)
ev += [ev_(EV["flash"], "lamp_switch_click", -27, -0.1), ev_(EV["flash"] + 0.3, "keyboard_type", -37, -0.1, {"dur": 0.5, "rate": 30})]
# greeter: shoppers walk in, a boof, zoomies, carts
steps(8.95, 11.4, 0.36, -38, 0.45, 0.1)
ev.append(ev_(EV["barks"][0], "dog_bark", -27, 0.0, {"pitch": 1.5}))
paws(10.3, 16.6, 0.085, -37)
ev.append(ev_(11.2, "keyboard_type", -40, 0.3, {"dur": 1.4, "rate": 16}))
# sausages: paws up the aisle, two hops, pack crinkles, the look
paws(16.8, 18.0, 0.14, -37)
ev += [ev_(18.3, "plush_place", -33, 0.0), ev_(18.72, "plush_place", -32, 0.0), ev_(18.75, "blanket_rustle", -36, 0.0, {"dur": 0.3, "softness": 0.3, "intensity": 0.5})]
for r in EV["reach"]:
    ev.append(ev_(r + 0.25, "blanket_rustle", -34, 0.2, {"dur": 0.35, "softness": 0.25, "intensity": 0.6}))
    ev.append(ev_(r + 0.45, "whimper", -36, 0.0, {"pitch": 1.4, "dur": 0.25}))
    ev.append(ev_(r + 0.85, "blanket_rustle", -36, -0.1, {"dur": 0.25, "softness": 0.25, "intensity": 0.5}))
# the time-lapse: fast steps, carts
steps(LAPSE0, LAPSE1, 0.11, -41, 0.35, 0.2)
ev.append(ev_(LAPSE0 + 0.2, "keyboard_type", -42, -0.3, {"dur": 2.8, "rate": 22}))
ev.append(ev_(LAPSE0, "low_swell", -34, 0.0, {"dur": 3.0, "pitch": 1.2}))
# checkout: the scanner boops; the avalanche
for b in EV["beeps"]:
    ev.append(ev_(b, "scan_beep", -29, 0.0, {"pitch": 1.0}))
steps(26.8, 27.75, 0.4, -37, 0.4)
steps(27.3, 28.2, 0.42, -38, 0.4, 0.3)
sp = EV["spill"]
ev.append(ev_(sp + 0.1, "candy_rattle", -27, 0.0, {"dur": 1.3, "density": 22, "size": 2.2}))
for k, (dt, pan) in enumerate([(0.35, -0.2), (0.48, 0.1), (0.6, 0.3), (0.74, -0.1), (0.9, 0.2), (1.05, -0.3), (1.25, 0.0)]):
    ev.append(ev_(sp + dt, "metal_clang", -32 - (k % 3), pan, {"size": 0.22 + 0.04 * (k % 3), "pitch": 2.4 + 0.3 * (k % 2)}))
ev += [ev_(sp + 0.52, "bonk", -33, 0.1), ev_(sp + 0.82, "plush_place", -31, -0.1), ev_(sp + 1.1, "bonk", -34, 0.2), ev_(sp + 0.45, "giant_step", -33, 0.0, {"size": 0.14, "surface": "wood"})]
# 4 PM: a sigh, carts passing, two tiny sobs
ev.append(ev_(35.15, "whimper", -36, 0.0, {"pitch": 1.05, "dur": 0.6}))
ev.append(ev_(33.8, "keyboard_type", -43, 0.4, {"dur": 2.2, "rate": 10}))
for s in EV["sobs"]:
    ev.append(ev_(s, "whimper", -34, -0.3, {"pitch": 1.75, "dur": 0.35}))
paws(38.4, 40.15, 0.15, -37)
# the toddler: sniffles, the bunny, a giggle squeak
ev += [ev_(39.4, "whimper", -37, -0.2, {"pitch": 1.8, "dur": 0.3}), ev_(40.2, "whimper", -38, -0.2, {"pitch": 1.85, "dur": 0.25})]
ev += [ev_(EV["bunny"] + 0.3, "plush_squeak", -30, 0.0), ev_(EV["giggle"], "plush_squeak", -34, -0.1)]
# sniffs, the trail, the walk
for s in EV["sniff"]:
    ev.append(ev_(s, "blanket_rustle", -35, 0.0, {"dur": 0.1, "softness": 0.15, "intensity": 0.7}))
paws(46.0, 49.3, 0.16, -38)
steps(46.0, 49.3, 0.26, -41, 0.18, -0.2)
# the reunion: running steps, the scoop, a low swell
steps(50.6, EV["hug"], 0.16, -38, 0.2, -0.1)
ev += [ev_(EV["hug"], "low_swell", -30, 0.0, {"dur": 2.0, "pitch": 1.0}), ev_(EV["hug"] + 0.05, "blanket_rustle", -34, 0.0, {"dur": 0.4, "softness": 0.7, "intensity": 0.5})]
# the cheer: balloons bump down, the bunny back
for k in range(12):
    ev.append(ev_(EV["balloons"] + 1.6 + k * 0.18 + 0.05 * (k % 3), "plush_place", -38 - (k % 3), 0.15 * ((k % 5) - 2)))
ev.append(ev_(EV["bunnyBack"] + 0.15, "plush_squeak", -32, 0.0))
# the staff wall: the pin, the biscuit, a happy boof, tail thumps
ev.append(ev_(EV["pin"], "lamp_switch_click", -32, 0.1))
ev += [ev_(EV["biscuit"], "plush_place", -32, 0.0), ev_(EV["biscuit"] + 0.3, "dog_bark", -30, 0.0, {"pitch": 1.7})]
for j in range(5):
    ev.append(ev_(59.6 + j * 0.16, "giant_step", -38, 0.1, {"size": 0.08, "surface": "wood"}))
# home: the cart rolls, the doors, a tiny snore
ev.append(ev_(HOME + 0.1, "keyboard_type", -43, 0.0, {"dur": 2.4, "rate": 8}))
ev += [ev_(60.8, "snore", -36, 0.0, {"dur": 1.2, "size": 0.35}), ev_(62.4, "snore", -38, 0.0, {"dur": 1.2, "size": 0.35})]

cues = {
    "title": "031 - What if Pip worked at the supermarket for one day? (Pip ep. 4: Pip's theme, shop-waltz arrangement — music box + piano waltz)",
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
