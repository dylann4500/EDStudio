#!/usr/bin/env python3
"""Cue sheet for 080 (Scribe lane, "What Thanksgiving dinner does to your body", Vex explainer) -> cues.json.
python3 -I videos/080-vex-thanksgiving/make_cues.py   then   python3 -I audio/synth.py 080-vex-thanksgiving
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "THANKSGIVING HOUSE" — the hook is the dinner table: an indistinct family murmur, cutlery clinks, room tone, no music;
the music ENTERS on "Four PM" (the HUD clock starts): a cosy pluck arpeggio (100 bpm, D major: Dmaj7 → Bm7 → Gmaj7 → A) with a soft
kick + clap + shaker (minimal: the lane also posts the no-music cut). Places carry the rest: a far TV crowd + the uncle's snores in the
lounge, the phone taps + pen scratches for Scribe, a ticking clock + crickets at 10 PM, the fridge hum + crickets at 2 AM, the drumstick
whoosh + a bin lid clank on "toss them", chimes on the wink and the end card. Foley on the cards: food plops on "plate two", a counter
run while the calorie bar fills, a stretch swell for the stomach. Voice (Fish "Mommy", less-breathy) on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(here=W('hook', 'heres'), hour=W('hook', 'hour'), plate=B['plate']['t0'], two=W('plate', 'two'), about=W('plate', 'about'), three=W('plate', 'three'),
         calories=W('plate', 'calories'), thats=W('plate', 'thats'), half=W('plate', 'half'), stomach=B['stomach']['t0'], fist=W('stomach', 'fist'),
         it=W('stomach', 'it'), stretch=W('stomach', 'stretch'), four=W('stomach', 'four'), myth=B['myth']['t0'], everyone=W('myth', 'everyone'),
         turkey=W('myth', 'turkey'), but=W('myth', 'but'), trypto=W('myth', 'tryptophan'), chicken=W('myth', 'chicken'), size=B['size']['t0'],
         carbs=W('size', 'carbs'), pivot=B['pivot']['t0'], cute=W('pivot', 'cute'), scribe=B['scribe']['t0'], dark=W('scribe', 'dark'),
         writes=W('scribe', 'writes'), feedback=W('scribe', 'feedback'), fatty=B['fatty']['t0'], six=W('fatty', 'six'), late=B['leftovers']['t0'],
         out=W('leftovers', 'out'), usda=W('leftovers', 'usda'), toss=W('leftovers', 'toss'), end=B['end']['t0'], close=W('end', 'close'),
         watching=W('end', 'watching'), you=W('end', 'you'))
T['card'] = T['you'] + 0.6; T['release'] = T['toss'] + 0.12
# the same cut list as shots.js SH
CUTS = [T['here'] - 0.1, T['plate'], T['about'] - 0.05, T['thats'] - 0.1, T['stomach'], T['it'] - 0.1, T['myth'], T['everyone'] - 0.1, T['turkey'] - 0.15,
        T['but'] - 0.1, T['size'], T['carbs'] - 0.3, T['pivot'], T['scribe'], T['dark'] - 0.05, T['writes'] - 0.25, T['feedback'] - 0.1, T['fatty'],
        T['six'] - 0.1, T['late'], T['out'] - 0.1, T['toss'] - 0.15, T['end']]

BPM = 100; BEAT = 60 / BPM
IN = T['plate'] + 0.04                        # the music enters with the clock: "Four PM"
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dmaj7', 'Bm7', 'Gmaj7', 'A']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 1, 2, 3, 2, 1, 3, 2],
             "vel": [[IN, 0.25], [T['scribe'], 0.28], [T['fatty'], 0.22], [T['late'], 0.2], [T['end'], 0.24], [D, 0.2]]}]
pad = [{"t0": IN - 0.3, "t1": D - 0.2, "notes": [38, 50, 57, 62, 66], "level": 3.0, "attack": 0.8, "release": 1.2, "cutoff": 760, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 74, 0.24, 0.14], [round(a + 0.1, 3), 78, 0.26, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.38, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.2, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.35, 0.12, 0.25, 0.12], "vel": 0.18, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.24, "boom"], [round(T['late'], 3), 0.22, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.5, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -28, 0.0, pitch=1.7)
e(0.05, "pop", -23, 0.0, pitch=1.3)
for c in story['callouts']:
    if c['style'] != 'stamp': e(c['t0'], "scan_beep", -26, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['plate'], T['stomach'], T['myth'], T['pivot'], T['fatty'], T['late'], T['end']): e(t0 + 0.04, "counter_tick", -21, -0.3)   # the HUD clock jumps
# the hook: cutlery on china at the table
for i, t in enumerate([0.35, 1.1, 1.9, 2.6, 3.4, 4.3, 5.0]): e(t, "metal_clang", -36, [-0.4, 0.3, -0.2, 0.45, -0.35, 0.2, 0.0][i], size=0.12, pitch=3.2 + 0.2 * (i % 3), dur=0.25)
# plate two: three plops of food
for i in range(3): e(T['two'] + 0.02 + i * 0.11, "plip", -22, 0.1 * (i - 1), pitch=0.55 + 0.12 * i)
e(T['two'] + 0.05, "pop", -22, 0.0, pitch=0.8)
# the calorie bar fills: a counter run; day 2 drops in
t = T['three'] - 0.05
while t < T['calories'] + 0.35: e(t, "counter_tick", -30, 0.15); t += 0.09
e(T['thats'] + 0.35, "pop", -24, 0.2, pitch=1.1)
# the stomach: a tiny fist "boop", then it stretches
e(T['fist'] - 0.2, "pop", -24, -0.2, pitch=1.3)
e(T['stretch'] - 0.1, "low_swell", -23, 0.0, dur=1.4, pitch=1.25); e(T['four'] + 0.05, "boing", -24, 0.0, pitch=0.9, dur=0.4)
# the lounge: snores (the far TV crowd is a bed), the turkey insert sizzles, the bars pop
t = T['myth'] + 0.3
while t < T['scribe'] - 0.8: e(t, "snore", -26, 0.35, dur=2.0, size=1.0); t += 2.6
e(T['turkey'] - 0.1, "sizzle", -30, 0.0, dur=1.0)
e(T['trypto'] + 0.05, "pop", -24, -0.25, pitch=1.0); e(T['trypto'] + 0.35, "pop", -24, 0.25, pitch=1.05)
for i in range(4): e(T['size'] + 0.25 + i * 0.42, "plip", -27, 0.2 * ((i % 3) - 1), pitch=0.7 + 0.05 * i)            # the carbs pile up
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[86, 90], spacing=0.06, vel=0.22, dur=0.5)
# Scribe: a tap on the account initial, the moon tap + the dark flip, then the pen writing
e(T['dark'] - 0.02, "latch_click", -22, 0.0, kind="close", bright=1.4)
e(T['dark'] + 0.45, "latch_click", -19, 0.0, kind="close", bright=1.3); e(T['dark'] + 0.6, "flash_swish", -26, 0.0, dur=0.3, peak=0.4)
t = T['writes'] - 0.1
while t < T['fatty'] - 0.4: e(t, "pen_scribble", -24, 0.0, dur=0.55); t += 0.55
# 10 PM: a heavy swell under "six hours"
e(T['six'] - 0.15, "low_swell", -24, 0.0, dur=1.3, pitch=0.7)
# 2 AM: the fridge seal, the rule card ticks, the toss (whoosh, then the bin lid off screen)
e(T['late'] + 0.02, "latch_click", -20, -0.2, kind="open", bright=0.8)
t = T['out'] - 0.05
while t < T['usda'] + 0.15: e(t, "counter_tick", -31, 0.1); t += 0.12
e(T['release'] - 0.05, "flash_swish", -21, 0.3, dur=0.35, peak=0.55)
e(T['release'] + 0.55, "metal_clang", -24, 0.6, size=0.35, pitch=1.6, dur=0.6); e(T['release'] + 0.72, "knock", -28, 0.6, pitch=1.4)
e(T['watching'] + 0.05, "gold_chime", -25, 0.1, notes=[78, 85, 90], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[62, 69, 74], spacing=0.09, vel=0.28)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -38, "seed": 81},
    {"sound": "city_day", "t0": 0.0, "t1": T['myth'], "fade_in": 0.2, "fade_out": 0.4, "gain_db": -33, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 82},   # the family talking
    {"sound": "crowd_cheer", "t0": T['myth'], "t1": T['scribe'], "fade_in": 0.2, "fade_out": 0.3, "gain_db": -39, "args": {"excite": 0.5}, "seed": 83},       # the game on TV
    {"sound": "city_day", "t0": T['scribe'], "t1": T['fatty'], "fade_in": 0.3, "fade_out": 0.3, "gain_db": -40, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 84},
    {"sound": "clock", "t0": T['fatty'], "t1": T['late'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -34, "seed": 85},
    {"sound": "crickets", "t0": T['fatty'], "t1": D, "fade_in": 0.4, "fade_out": 0.8, "gain_db": -44, "seed": 86},
    {"sound": "cabin_hum", "t0": T['late'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -36, "seed": 87},                                              # the open fridge
]
cues = {
    "title": "080 - what Thanksgiving dinner does to your body (Vex explainer, THANKSGIVING HOUSE bed, 100 bpm D major pluck enters on 4 PM + Fish Mommy)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.5, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
