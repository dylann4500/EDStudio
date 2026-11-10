#!/usr/bin/env python3
"""Cue sheet for 078 (Scribe lane, "What one leg day does to your body", Vex explainer) -> cues.json.
python3 -I videos/078-vex-leg-day/make_cues.py   then   python3 -I audio/synth.py 078-vex-leg-day
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "IRON MOON 24/7" — a gym at night: the HVAC hum (a low cabin-hum bed), the room tone, a far plate clank now and then
and the treadmills' whir under the hook, no music; the music DROPS on "Squats" (a plate-on-floor clunk + a boom): an upbeat gym pluck
arpeggio (118 bpm, E minor: Em7 → Cmaj7 → G → D) with a four-on-the-floor kick + clap + shaker ticks (minimal under the voice: the
lane also posts the no-music cut). Foley: an exhale at the bottom of every squat rep, little plips as the micro-tears pop in, a soft
double knock on "Not lactic acid", a rising swell for the soreness peak, a steel-stair clang on her one step down, a boing when she
pops back up from the bench, a chime on "Cute", typing + the send click + a tap and a soft swish for the dark-mode flip + pen
scratches on the phone, the shaker rattling, a chime on the wink and on the end card. Voice (Fish "Mommy", less-breathy) on top."""
import json, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(here=W('hook', 'heres'), body=W('hook', 'body'), squat=B['squat']['t0'], squats=W('squat', 'squats'), every=W('squat', 'every'), down=W('squat', 'down'),
         stretch=W('squat', 'stretch'), load=W('squat', 'load'), tears=B['tears']['t0'], micro=W('tears', 'microscopic'), fibers=W('tears', 'fibers'), totally=W('tears', 'totally'),
         myth=B['myth']['t0'], not_=W('myth', 'not'), thats=W('myth', 'thats'), hour1=W('myth', 'hour'), peak=B['peak']['t0'], peaks=W('peak', 'peaks'), three=W('peak', 'three'),
         stairs=W('peak', 'stairs'), good=W('peak', 'good'), pivot=B['pivot']['t0'], sit=W('pivot', 'sit'), downP=W('pivot', 'down'), anatomy=W('pivot', 'anatomy'), cute=W('pivot', 'cute'),
         scribe=B['scribe']['t0'], dark=W('scribe', 'dark'), obviously=W('scribe', 'obviously'), hand=W('scribe', 'handwriting'), diagram=W('scribe', 'diagram'),
         rebuild=B['rebuild']['t0'], protein=W('rebuild', 'protein'), two=W('rebuild', 'two'), rebuilding=W('rebuild', 'rebuilding'),
         bout=B['bout']['t0'], next=W('bout', 'next'), hurt=W('bout', 'hurt'), one=W('bout', 'one'), protects=W('bout', 'protects'), weeks=W('bout', 'weeks'),
         end=B['end']['t0'], skip=W('end', 'skip'), ill=W('end', 'ill'), know=W('end', 'know'))
T['card'] = T['know'] + 0.55; T['send'] = T['dark'] - 0.68; T['tap'] = T['dark'] + 0.06; T['page'] = T['obviously'] + 0.15
# the same cut list as shots.js SH
CUTS = [T['here'] - 0.1, T['squat'], T['squats'] - 0.1, T['stretch'] - 0.1, T['tears'], T['totally'] - 0.1, T['myth'], T['not_'] - 0.1, T['peak'], T['stairs'] - 0.1,
        T['pivot'], T['cute'] - 0.25, T['scribe'], T['send'] + 0.2, T['hand'] - 0.25, T['diagram'] - 0.1, T['rebuild'], T['protein'] - 0.1, T['bout'], T['one'] - 0.1, T['end']]
# squat reps, mirrored from shots.js squatK: [t0, t1] per rep, bottom at 58 %
REPS = [(T['every'] - 0.05, T['down'] + 0.45), (T['down'] + 0.62, T['load'] + 0.42), (T['next'] - 0.1, T['hurt'] + 0.3), (T['hurt'] + 0.45, T['one'] - 0.15)]

BPM = 118; BEAT = 60 / BPM
IN = T['squats'] - 0.02                       # the music drops on "Squats"
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Em7', 'Cmaj7', 'G', 'D']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Em7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 3, 2, 1, 3, 2, 3],
             "vel": [[IN, 0.26], [T['scribe'], 0.29], [T['rebuild'], 0.26], [T['end'], 0.26], [D, 0.22]]}]
pad = [{"t0": IN - 0.3, "t1": D - 0.2, "notes": [40, 52, 59, 64, 67], "level": 3.0, "attack": 0.8, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.26, 0.14], [round(a + 0.1, 3), 83, 0.28, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.24, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.15, 0.3, 0.15], "vel": 0.2, "kind": "tick"}]
drums = [[round(IN, 3), 0.34, "boom"], [round(T['scribe'], 3), 0.26, "boom"], [round(T['bout'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -27, 0.0, pitch=1.7)
e(0.05, "pop", -22, 0.0, pitch=1.3)
for c in story['callouts']:
    if c['style'] != 'stamp': e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['squat'], T['myth'], T['peak'], T['three'] - 0.1, T['rebuilding'], T['bout']): e(t0 + 0.04, "counter_tick", -20, -0.3)   # the HUD jumps
# the hook: a far plate clank + the bar settling in the J-hooks while the title is up
e(1.3, "metal_clang", -33, -0.6, size=0.4, pitch=1.6, dur=0.6); e(4.4, "clunk", -32, 0.5, size=0.6, metal=0.7)
e(IN, "clunk", -19, 0.0, size=1.2, metal=0.4)                                                                                     # the drop
for (a, b) in REPS:
    bot = a + 0.58 * (b - a); e(a + 0.05, "breath", -27, 0.0, dur=0.5, inhale=True); e(bot + 0.06, "breath", -24, 0.0, dur=0.55, inhale=False)
for j in range(8): e(T['micro'] - 0.05 + j * (T['fibers'] + 0.25 - T['micro']) / 8, "plip", -29, 0.25 * ((j % 3) - 1), pitch=1.1 + 0.05 * j)   # micro-tears pop in
e(T['not_'] - 0.02, "knock", -22, -0.1, pitch=0.9); e(T['not_'] + 0.16, "knock", -24, 0.1, pitch=0.8)                            # "Not" — nope
e(T['thats'] + 0.1, "gold_chime", -27, 0.1, notes=[84, 88], spacing=0.06, vel=0.2, dur=0.5)
e(T['peaks'] - 0.1, "low_swell", -23, 0.0, dur=1.5, pitch=0.8)
e(T['good'] + 0.12, "metal_clang", -22, 0.3, size=0.35, pitch=1.4, dur=0.6); e(T['good'] + 0.14, "kick", -24, 0.0)               # one step down the steel stairs
e(T['sit'] + 0.1, "breath", -22, 0.0, dur=0.45, inhale=True)                                                                       # the wince
e(T['sit'] + 0.4, "boing", -25, 0.0, pitch=0.8, dur=0.35)                                                                          # pops back up
e(T['cute'] + 0.05, "gold_chime", -26, 0.1, notes=[88, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['scribe'] + 0.1, "keyboard_type", -22, 0.0, dur=round(T['send'] - T['scribe'] - 0.25, 2), rate=13.0)                          # typing the lab
e(T['send'] - 0.1, "latch_click", -18, 0.0, kind="close", bright=1.3); e(T['send'] - 0.04, "flash_swish", -25, 0.0, dur=0.2, peak=0.4)
e(T['tap'] - 0.42, "flash_swish", -28, -0.2, dur=0.25, peak=0.3)                                                                    # the drawer slides in
e(T['tap'], "latch_click", -21, 0.0, kind="close", bright=1.5)                                                                      # the moon
e(T['tap'] + 0.06, "low_swell", -27, 0.0, dur=0.6, pitch=1.3)                                                                       # everything goes dark
t = T['page']
while t < T['rebuild'] - 0.4: e(t, "pen_scribble", -24, 0.0, dur=0.55); t += 0.55                                                 # the page writing itself
t = T['rebuild'] + 0.05
while t < T['protein'] - 0.25: e(t, "candy_rattle", -26, -0.15, dur=0.22, density=30.0, size=0.6); t += 0.24                      # the shaker
for i, x in enumerate([0, 1, 2]): e(T['protein'] + 0.2 + i * 0.55, "pop", -23, 0.0, pitch=1.0 + 0.12 * i)                          # the bars grow
e(T['protects'] + 0.05, "gold_chime", -26, 0.1, notes=[83, 88, 91], spacing=0.07, vel=0.22, dur=0.6)
e(T['know'] + 0.1, "gold_chime", -25, 0.1, notes=[81, 88, 93], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)
# far gym life: a plate clank every few seconds in the night stretches (never on a voice word's onset: soft + panned)
for i, t in enumerate([7.1, 13.6, 18.3, 45.2, 49.7]):
    if t < D - 1: e(t, "metal_clang", -36, -0.7 if i % 2 else 0.7, size=0.45, pitch=1.5 + 0.1 * (i % 3), dur=0.6)

amb = [
    {"sound": "cabin_hum", "t0": 0.0, "t1": T['scribe'], "fade_in": 0.3, "fade_out": 0.2, "gain_db": -34, "seed": 81},
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -37, "seed": 82},
    {"sound": "fan", "t0": 0.0, "t1": T['squats'], "fade_in": 0.3, "fade_out": 0.3, "gain_db": -42, "args": {"rate": 9.0}, "seed": 83},   # treadmills under the hook
    {"sound": "cabin_hum", "t0": T['rebuild'], "t1": D, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -34, "seed": 84},
    {"sound": "lamp_hum", "t0": T['scribe'], "t1": T['rebuild'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -42, "seed": 85},
]
cues = {
    "title": "078 - what one leg day does to your body (Vex explainer, IRON MOON 24/7 bed, 118 bpm E minor pluck, drop on 'Squats' + Fish Mommy)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
