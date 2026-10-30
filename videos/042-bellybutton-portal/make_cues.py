#!/usr/bin/env python3
"""Cue sheet for 042 (funny POV escalation, unhinged): "What if your belly button turned into a portal?" -> cues.json
Run: python3 -I videos/042-bellybutton-portal/make_cues.py

Sound identity (new — not 035's pluck cartoon-sneak, 022's string fanfare, 020's mallet wind-ups or 016's piano gossip jazz):
  SPACE LOUNGE. A glassy `bell` voice plays a walking-bass lounge groove in E♭ (Ebmaj7–Cm7–Fm7–B♭7, 120 bpm) — easy-listening
  from a 1960s space-age record, as if the portal came with its own elevator music. Every item through the portal gets a
  soft `portal_wub` (a round swirling vwoom, new in synth.py) + a three-note mallet "woo": rising for things coming OUT,
  falling for things going IN. The mariachi band turns the groove into a fast B♭ oom-pah for one shot (mallet trumpet line);
  NASA gets a low string drive + soft taiko + a braam as the rover goes through; Grandma's kitchen is a slow warm bell arp.
  - 0–4.15 s: quiet night living room only (room tone, a clock, two snores, a TV murmur). The music ENTERS on the shirt lift.
  - every place has its own bed, and the busy ones carry VOICES (036 lesson): laundromat chatter + dryers, a cheering lawn,
    a press-room murmur, a street queue murmur; applause under the end card.
  - the music never drops out; gentle dips only."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = 68.0
M1 = 4.15              # the premise: the shirt goes up, the portal opens
BEAT = 0.5
BAR = 4 * BEAT
SCENES = [0, 3.6, 6.3, 8.8, 12.4, 15.2, 18.0, 21.2, 24.0, 26.4, 30.0, 35.6, 38.4, 41.0, 44.2, 47.0, 49.6, 52.4, 56.6]
# event times — mirror shots.js EV
EV = dict(lint=7.6, lintOut=9.75, keys=12.95, remote=14.15, cat=15.85, catOut=16.95, pigeon=18.55, socks=20.0, ocean=21.7,
          tourist=24.45, band=[26.6, 27.0, 27.4, 27.8, 28.2], duck=31.0, duckOut=31.15, bonk=31.35, tape=32.5, tapeOut=33.0,
          mic=38.75, papers=38.95, micOut=39.7, micBonk=39.95, dives=[41.85, 43.05], shuffle=44.3, rover=48.35, roverOut=49.95,
          roverLand=50.45, cookie=53.05, take=53.75, fold=55.6, foldIn=56.1, arrive=56.85, land=57.25, hug=58.9)

# ---------------------------------------------------------------- music
LOUNGE = ["Ebmaj7", "Cm7", "Fm7", "Bb7"]
MARIACHI = ["Bb", "F7", "Bb", "F7", "Bb", "Eb", "F7"]
EPIC = ["Cm", "Ab", "Eb", "Bb"]
WARM = [[52.4, "Ebmaj7"], [54.0, "Abmaj7"], [55.6, "Bb7"], [56.6, "Ebmaj7"], [58.2, "Abmaj7"], [59.8, "Gm7"], [61.0, "Cm7"], [62.2, "Fm7"],
        [63.2, "Bb7"], [63.8, "Ebmaj7"], [65.6, "Abmaj7"], [66.8, "Ebmaj7"]]
chords = [[0.2, "Ebmaj7"]]
def run(t0, t1, prog, bar):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
run(M1, 26.4, LOUNGE, BAR); run(26.4, 30.0, MARIACHI, 0.5); run(30.0, 47.0, LOUNGE, BAR); run(47.0, 52.4, EPIC, 1.35)
chords += WARM
sections = [
    {"t0": M1, "t1": 26.4, "style": "walk", "vel": [[M1, 0.3], [12.4, 0.28], [18.0, 0.32], [26.4, 0.33]], "step": BEAT,
     "bass_hold": 0.95, "bass_vel": 1.0, "comp_vel": 0.45, "stab_hold": 0.8, "swing": 0.12},
    {"t0": 26.4, "t1": 30.0, "style": "bounce", "vel": [[26.4, 0.36], [30.0, 0.4]], "step": 0.25, "bass_hold": 1.0, "stab_hold": 1.0},
    {"t0": 30.0, "t1": 47.0, "style": "walk", "vel": [[30.0, 0.3], [41.0, 0.33], [47.0, 0.36]], "step": BEAT,
     "bass_hold": 0.95, "bass_vel": 1.0, "comp_vel": 0.45, "stab_hold": 0.8, "swing": 0.12},
    {"t0": 47.0, "t1": 52.4, "style": "strings", "vel": [[47.0, 0.34], [49.95, 0.44], [52.4, 0.32]], "step": BEAT / 2, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
    {"t0": 52.4, "t1": D, "style": "arp", "vel": [[52.4, 0.34], [56.6, 0.42], [59.0, 0.46], [D, 0.38]], "step": 0.4, "pattern": [0, 1, 2, 3, 2, 1]},
]
layers = [
    {"t0": 41.0, "t1": 47.0, "style": "strings", "vel": [[41.0, 0.18], [47.0, 0.3]], "step": BEAT / 2, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.3},
]
# the "woo": three mallet notes per item — rising = OUT, falling = IN (E♭ pentatonic, high and soft)
OUT_T = [EV["lintOut"], EV["catOut"], EV["pigeon"], EV["socks"], EV["ocean"], EV["tourist"], EV["duckOut"], EV["micOut"], EV["roverOut"], EV["cookie"], EV["arrive"]]
IN_T = [EV["lint"], EV["keys"], EV["remote"], EV["cat"], EV["duck"], EV["tape"], EV["mic"], EV["rover"], EV["foldIn"]] + EV["dives"]
mallet = []
for t in OUT_T: mallet += [[t + 0.02, 75, 0.3, 0.16], [t + 0.12, 79, 0.3, 0.16], [t + 0.22, 82, 0.32, 0.4]]
for t in IN_T: mallet += [[t - 0.22, 82, 0.28, 0.14], [t - 0.12, 79, 0.28, 0.14], [t - 0.02, 75, 0.3, 0.35]]
# the mariachi "trumpet" line on the mallet over the oom-pah (B♭ major)
MAR = [(0, 70), (0.25, 74), (0.5, 77), (0.75, 74), (1.0, 82), (1.5, 81), (1.75, 79), (2.0, 77), (2.5, 74), (2.75, 77), (3.0, 82)]
for dt, m in MAR:
    if 26.65 + dt < 30.0: mallet.append([round(28.6 + dt * 0.48, 3), m, 0.34, 0.2])
melody = [[56.65, 79, 0.34, True, 1.4], [58.25, 84, 0.36, True, 1.4], [59.85, 82, 0.36, True, 1.0], [61.05, 79, 0.34, True, 1.0],
          [62.25, 77, 0.34, True, 0.9], [63.25, 74, 0.32, True, 0.6], [63.85, 75, 0.34, True, 2.4]]
drums = [[M1, 0.5, "boom"], [47.0, 0.42, "taiko"], [EV["roverOut"], 0.6, "boom"], [EV["land"], 0.35, "boom"], [EV["ocean"], 0.35, "boom"], [EV["bonk"], 0.2, "tom"],
         [EV["micBonk"], 0.2, "tom"]]
drum_patterns = [{"t0": 47.0, "t1": 52.4, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[47.0, 0.22], [52.4, 0.3]], "kind": "taiko"}]
pad = [{"t0": M1, "t1": M1 + 2.0, "notes": [27, 34, 39, 46, 51], "level": 1.3, "attack": 0.08, "release": 0.8, "cutoff": 900, "hp": 30},     # braam: the portal opens
       {"t0": 47.0, "t1": 52.45, "notes": [24, 36, 43, 48], "level": 0.8, "attack": 0.4, "release": 0.6, "cutoff": 750, "hp": 30},
       {"t0": EV["roverOut"], "t1": EV["roverOut"] + 1.6, "notes": [24, 31, 36, 43, 48], "level": 1.2, "attack": 0.06, "release": 0.8, "cutoff": 900, "hp": 30}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.2
    if c0 < M1 + 0.5 or 47.0 <= c0 < 52.4: continue
    pad.append({"t0": c0, "t1": c1 + 0.3, "chord": chords[i][1], "level": 2.2 if c0 < 52.4 else 2.0, "attack": 0.2, "release": 0.6})

# ---------------------------------------------------------------- ambience (one bed per place; voices where people are)
def bed(sound, t0, t1, g, fi=0.05, fo=0.06, args=None, seed=1):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    bed("room_tone", 0.0, 8.85, -34, fi=0.4), bed("clock", 0.0, 8.85, -48, seed=2), bed("city_day", 0.0, 8.85, -50, args={"murmur": 0.5, "traffic": 0.0}, seed=3),
    bed("city_day", 8.8, 12.45, -36, args={"murmur": 0.7, "traffic": 0.3}, seed=4),
    bed("room_tone", 12.4, 18.05, -36, seed=5), bed("city_day", 12.4, 18.05, -50, args={"murmur": 0.1, "traffic": 0.5}, seed=6),
    bed("fan", 18.0, 24.05, -40, seed=7), bed("city_day", 18.0, 24.05, -36, args={"murmur": 0.9, "traffic": 0.0}, seed=8),
    bed("water_rush", EV["ocean"], 23.6, -30, fi=0.08, fo=0.4, seed=9),
    bed("wind", 24.0, 30.05, -44, args={"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, seed=10), bed("city_day", 24.0, 30.05, -38, args={"murmur": 0.7, "traffic": 0.2}, seed=11),
    bed("crowd_cheer", 28.5, 30.05, -30, fi=0.3, args={"excite": 0.8}, seed=12), bed("applause", 28.6, 30.05, -32, fi=0.3, args={"density": 30.0}, seed=13),
    bed("room_tone", 30.0, 35.65, -36, seed=14), bed("lamp_hum", 30.0, 35.65, -50, seed=15), bed("city_day", 30.0, 35.65, -44, args={"murmur": 0.6, "traffic": 0.0}, seed=16),
    bed("city_day", 35.6, 41.05, -32, args={"murmur": 1.0, "traffic": 0.0}, seed=17), bed("crowd_cheer", 38.6, 41.05, -34, fi=0.3, args={"excite": 0.5}, seed=18),
    bed("city_day", 41.0, 47.05, -33, args={"murmur": 1.0, "traffic": 0.5}, seed=19), bed("crowd_cheer", 41.0, 47.05, -36, args={"excite": 0.4}, seed=20),
    bed("wind", 47.0, 49.65, -40, args={"darkness": 0.5, "gust": 0.4, "whistle": 0.0}, seed=21), bed("rocket_rumble", 47.0, 49.65, -46, seed=22),
    bed("wind", 49.6, 52.45, -38, args={"darkness": 0.8, "gust": 0.6, "whistle": 0.0}, seed=23),
    bed("room_tone", 52.4, 56.65, -36, seed=24), bed("clock", 52.4, 56.65, -48, seed=25),
    bed("room_tone", 56.6, D, -38, fi=0.1, fo=1.0, seed=26), bed("clock", 56.6, 60.0, -50, seed=27),
    bed("applause", 59.4, D, -34, fi=0.8, fo=1.2, args={"density": 25.0}, seed=28), bed("crowd_cheer", 63.4, D, -36, fi=0.8, fo=1.2, args={"excite": 0.6}, seed=29),
]

# ---------------------------------------------------------------- events
ev = []
def E(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    ev.append(e)
def steps(t0, t1, g, rate, p0=-0.2, p1=0.2):
    ev.append({"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate})
def wub(t, g=-27, pitch=1.0, swallow=False, dur=0.7, pan=0.0):
    E(t - (dur * 0.6 if swallow else 0.05), "portal_wub", g, pan, {"dur": dur, "pitch": pitch, "swallow": 1.0 if swallow else 0.0})

# 1. couch: snores, a TV murmur, the shirt rustle, the portal opens (big), the lint gulp
E(0.5, "snore", -36, 0.1, {"dur": 1.8, "size": 0.7}); E(2.4, "snore", -38, 0.1, {"dur": 1.4, "size": 0.6})
E(3.75, "blanket_rustle", -32, 0.0, {"dur": 0.5, "softness": 0.6, "intensity": 0.6})
wub(M1, -22, 0.8, dur=1.4); E(M1 + 0.1, "low_swell", -34, 0.0, {"dur": 0.6, "pitch": 1.2})
E(6.8, "plush_squeak", -40, 0.1, {"pitch": 1.8}); wub(EV["lint"], -30, 1.4, True, 0.5)
# 2. Paris: the little portal, the plop into the latte, the drops
wub(9.0, -32, 1.5, dur=0.6); E(EV["lintOut"], "plip", -30, -0.1, {"pitch": 1.2}); E(EV["lintOut"] + 0.02, "splash", -38, -0.1, {"size": 0.15})
# 3. keys (a jingle), the remote, the cat: a meow at the pounce, a muffled struggle, a pop out
E(12.65, "candy_rattle", -34, 0.1); wub(EV["keys"], -29, 1.3, True, 0.5); wub(EV["remote"], -29, 1.2, True, 0.5)
E(15.5, "cat_meow", -30, 0.0, {"pitch": 1.1, "dur": 0.5}); wub(EV["cat"], -28, 1.0, True, 0.5)
E(16.3, "cat_meow", -36, 0.0, {"pitch": 0.8, "dur": 0.4}); E(EV["catOut"], "pop", -28, 0.0, {"pitch": 0.9}); E(EV["catOut"] + 0.4, "cat_meow", -31, 0.0, {"pitch": 1.25, "dur": 0.45})
# 4. laundromat: the pigeon bursts out + flaps over the heads; the socks: a rustly fountain + soft pops; the Pacific
wub(EV["pigeon"], -27, 1.1); E(EV["pigeon"] + 0.05, "wing_flutter", -26, 0.0, {"dur": 1.8, "n_birds": 2}); E(EV["pigeon"] + 0.08, "pop", -32, 0.0, {"pitch": 1.2})
wub(EV["socks"], -27, 1.0, dur=0.9); E(EV["socks"] + 0.05, "blanket_rustle", -26, 0.0, {"dur": 1.4, "softness": 0.4, "intensity": 0.9})
for k in range(7): E(EV["socks"] + 0.1 + 0.11 * k, "pop", -35, (k % 3 - 1) * 0.4, {"pitch": 0.8 + 0.08 * k})
wub(EV["ocean"], -24, 0.7, dur=0.8); E(EV["ocean"] + 0.02, "cartoon_splash", -26, 0.0, {"size": 1.0}); E(EV["ocean"] + 0.3, "grate", -33, -0.4, {"dur": 0.5})
for k in range(4): E(22.05 + 0.3 * k, "plip", -34, 0.3, {"pitch": 0.9 + 0.1 * k})
# 5. lawn: the tourist pops out (boop), a camera's soft clunk; five band boops; applause
wub(EV["tourist"], -26, 0.95); E(EV["tourist"] + 0.42, "giant_step", -33, -0.1, {"size": 0.2, "surface": "ground"})
E(25.9, "knock", -36, 0.0, {"pitch": 1.8})
for k, t in enumerate(EV["band"]): wub(t, -30, 1.0 + 0.06 * k, dur=0.45); E(t + 0.4, "plush_squeak", -35, (k - 2) * 0.3, {"pitch": 0.6 + 0.05 * k})
# 6. lab: the duck (in), out of the ceiling, BONK + a squeak; the tape in + out
wub(EV["duck"], -30, 1.3, True, 0.5); wub(EV["duckOut"] - 0.05, -30, 1.4, dur=0.5)
E(EV["bonk"], "bonk", -27, -0.2); E(EV["bonk"] + 0.03, "plush_squeak", -30, -0.2, {"pitch": 1.4})
E(EV["tape"] - 0.2, "grate", -36, 0.3, {"dur": 0.5}); wub(EV["tape"], -32, 1.2, True, 0.5); E(EV["tapeOut"] + 0.05, "grate", -35, -0.2, {"dur": 0.8})
for k in range(3): E(30.4 + 1.7 * k, "pen_scribble", -40, -0.3, {"dur": 0.6})
# 7. press: the murmur; the mic + papers sucked in; the mic drops out on a back-row head
wub(EV["mic"], -26, 0.9, True, 0.6); E(EV["papers"], "blanket_rustle", -27, 0.0, {"dur": 1.0, "softness": 0.2, "intensity": 1.0})
wub(EV["micOut"], -32, 1.2, dur=0.5); E(EV["micBonk"], "bonk", -29, -0.2); E(EV["micBonk"] + 0.02, "metal_clang", -36, -0.2, {"size": 0.2, "pitch": 2.0})
# 8. the line: two head-first dives (a rising squeak = "wheee" kept low), the line shuffles in sync
for d in EV["dives"]: E(d - 0.5, "plush_squeak", -35, 0.2, {"pitch": 1.5, "dur": 0.3}); wub(d, -27, 1.0, True, 0.6)
steps(41.95, 42.45, -34, 3.0); steps(43.15, 43.65, -34, 3.0)
for k in range(3): steps(EV["shuffle"] + 1.1 * k, EV["shuffle"] + 1.1 * k + 0.5, -32, 3.0, 0.2, -0.2)
# 9. NASA + Mars: the rover in; it drops out on Mars, lands, bounces
wub(EV["rover"], -27, 0.9, True, 0.6); wub(EV["roverOut"] - 0.05, -24, 0.75, dur=0.9)
E(EV["roverLand"], "clunk", -27, 0.0, {"size": 0.5, "metal": 0.5}); E(EV["roverLand"] + 0.02, "distant_boom", -32, 0.0, {"size": 0.5})
for k in range(3): E(EV["roverLand"] + 0.45 * (k + 1) * 0.9, "knock", -34 - 2 * k, 0.0, {"pitch": 0.8})
# 10. night: the warm portal, Grandma's hand, a sniff, you fold in
wub(52.85, -28, 0.85, dur=0.8); E(54.6, "breath", -32, 0.0, {"dur": 0.6, "inhale": True})
wub(EV["foldIn"], -24, 0.8, True, 1.0); E(EV["foldIn"] - 0.2, "low_swell", -32, 0.0, {"dur": 0.5, "pitch": 1.4})
# 11. Grandma's: you pop out, land, the mitt, her steps, the hug
wub(EV["arrive"], -25, 0.9, dur=0.7); E(EV["land"], "giant_step", -28, 0.0, {"size": 0.4, "surface": "wood"}); E(EV["land"] + 0.03, "pop", -32, 0.0, {"pitch": 0.8})
E(57.7, "blanket_rustle", -34, -0.3, {"dur": 0.4, "softness": 0.7, "intensity": 0.5}); E(58.0, "giant_step", -38, -0.3, {"size": 0.15, "surface": "wood"})
steps(57.95, 58.85, -36, 2.2, -0.3, 0.0)
E(EV["hug"], "blanket_rustle", -33, 0.0, {"dur": 0.6, "softness": 0.8, "intensity": 0.5})

cues = {
    "title": "042 - What if your belly button turned into a portal? (funny POV, SPACE LOUNGE: a glassy bell walking-bass groove + a portal vwoom and a mallet woo per item)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [67.2, D],
    "stem_gain_db": {"music": -6.0, "sfx": 13.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": sorted(ev, key=lambda e: e.get("t", e.get("t0", 0))),
    "music": {"instrument": "bell", "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.0, "pad_reverb_db": -5.0, "strings_db": 5.0, "mallet_db": -3.0, "drums_db": -8.0,
              "echo": {"delay": 0.375, "feedback": 0.25, "mix": 0.18, "lp_hz": 2400},
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "layers": layers, "melody": melody, "mallet_melody": mallet, "pad": pad, "drums": drums, "drum_patterns": drum_patterns,
              "stings": [], "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.15, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "cues.json")
json.dump(cues, open(out, "w"), indent=1)
print("wrote", out, len(ev), "events,", len(chords), "chords")
