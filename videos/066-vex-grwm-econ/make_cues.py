#!/usr/bin/env python3
"""Cue sheet for 066 (Scribe lane, "GRWM: the econ final", get-ready-with-me format, a café at golden hour) -> cues.json.
python3 -I videos/066-vex-grwm-econ/make_cues.py   then   python3 -I audio/synth.py 066-vex-grwm-econ
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "CAFÉ GOLDEN HOUR" — a warm café (soft chatter + far street, room tone, an espresso steam hiss) under the hook,
then a breezy pluck bossa-ish arpeggio (92 bpm, D major: Dmaj7 → Bm7 → Em7 → A7) with a soft kick + rim + shaker enters on
"step one"; minimal (the lane also posts the no-music cut). Each GRWM step card = a pixel pop + a little cosmetic click; the latte's
ice rattles; the PDF lands with a soft drop; the pencil scratches while Scribe fills the blanks, the table and the graph; a click on
Download PDF + a chime. Voice on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(mommy1=W('hook', 'mommy'), liner=B['liner']['t0'], curve=W('liner', 'curve'), lip=B['lip']['t0'], mommy2=W('lip', 'mommys'), up=W('lip', 'up'),
         coffee=B['coffee']['t0'], iced=W('coffee', 'iced'), opp=W('coffee', 'opportunity'), sleep=W('coffee', 'sleep'), sheet=B['sheet']['t0'],
         the=W('sheet', 'the'), review=W('sheet', 'review'), scribe=B['scribe']['t0'], uploaded=W('scribe', 'uploaded'), andS=W('scribe', 'and'),
         blank=W('scribe', 'blank'), my=W('scribe', 'my'), pencil=W('scribe', 'pencil'), even=W('scribe', 'even'), download=B['download']['t0'],
         turned=W('download', 'turned'), end=B['end']['t0'], mommy3=W('end', 'mommy'), baby=W('end', 'baby'))
T['card'] = T['baby'] + 0.55
CUTS = [T['liner'], T['lip'], T['coffee'], T['opp'] - 0.05, T['sheet'], T['review'] - 0.05, T['scribe'], T['andS'] - 0.05, T['my'] - 0.15,
        T['even'] - 0.15, T['download'], T['turned'] - 0.1, T['end']]

# ---------------------------------------------------------------- music: "CAFÉ GOLDEN HOUR" (92 bpm, D major), enters on "step one"
BPM = 92; BEAT = 60 / BPM
IN = T['liner'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Dmaj7', 'Bm7', 'Em7', 'A7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Dmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 1, 2, 0, 3],
             "vel": [[IN, 0.25], [T['scribe'], 0.29], [T['end'], 0.25], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [38, 50, 54, 57, 61], "level": 3.2, "attack": 1.6, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 74, 0.28, 0.14], [round(a + 0.1, 3), 81, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.24, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.2, 0.35, 0.2], "vel": 0.22, "kind": "tick"}]
drums = [[round(IN, 3), 0.3, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -5.0, "drums_db": -7.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -26, 0.0, pitch=1.7)
e(0.05, "pop", -21, 0.0, pitch=1.3)
for c in story['callouts']: e(c['t0'], "scan_beep", -25, 0.2, pitch=1.4, dur=0.12)
for m in (T['mommy1'], T['mommy2'], T['mommy3']):
    if m > 0.5: e(m - 0.45, "breath", -22, 0.0, dur=0.55, inhale=True)
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[86, 93], spacing=0.06, vel=0.22, dur=0.5)
e(T['baby'] + 0.05, "gold_chime", -25, 0.1, notes=[81, 86, 93], spacing=0.08, vel=0.24, dur=0.6)   # the blown kiss
e(0.4, "hiss", -34, 0.5, dur=1.4)                                                                   # the espresso steam wand
e(T['liner'] + 0.25, "latch_click", -24, -0.1, kind="close", bright=1.6)                           # liner cap off
e(T['lip'] + 0.25, "latch_click", -24, -0.1, kind="open", bright=1.4)                              # lipstick twist
for i in range(3): e(T['iced'] + 0.05 + i * 0.09, "metal_clang", -33, 0.2, size=0.12, pitch=2.8 + 0.2 * i)   # the ice rattles
e(T['sleep'] + 0.1, "low_swell", -26, 0.0, dur=0.8, pitch=0.7)
e(T['uploaded'] + 0.1, "pop", -20, 0.0, pitch=0.8)                                                  # the PDF lands in the composer
k, t = 0, T['uploaded'] + 1.1
while t < T['andS'] - 0.1: e(t, "scan_beep", -28, 0.15, pitch=1.6 + 0.03 * (k % 5), dur=0.06); t += 0.18; k += 1   # finding the blanks
t = T['andS']
while t < T['my'] - 0.2: e(t, "pen_scribble", -22, 0.0, dur=0.6); t += 0.55
e(T['pencil'] - 0.1, "scan_beep", -24, 0.1, pitch=1.2, dur=0.1)
t = T['even'] - 0.1
while t < T['download'] - 0.2: e(t, "pen_scribble", -22, 0.0, dur=0.6); t += 0.55
e(T['download'] + 0.25, "latch_click", -18, 0.1, kind="close", bright=1.3); e(T['download'] + 0.45, "gold_chime", -24, 0.0, notes=[81, 88], spacing=0.07, vel=0.24, dur=0.5)
e(T['card'], "gold_chime", -23, 0.0, notes=[62, 69, 74], spacing=0.09, vel=0.28)

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -31, "args": {"murmur": 0.9, "traffic": 0.15}, "seed": 6},
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -38, "seed": 7},
]
cues = {
    "title": "066 - GRWM econ final (Vex, CAFÉ GOLDEN HOUR bed, 92 bpm D major pluck, café chatter, step pops + pencil + Fish Mommy ASMR)",
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
