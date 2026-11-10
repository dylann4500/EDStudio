#!/usr/bin/env python3
"""Cue sheet for 067 (Scribe lane, "Why would I deceive you?", the Nov 2026 trend, a sunny campus library) -> cues.json.
python3 -I videos/067-vex-deceive/make_cues.py   then   python3 -I audio/synth.py 067-vex-deceive
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "DEADPAN LIBRARY" — a hushed library (room tone, a far clock, faint page turns) under the hook; a sly, sparse pluck
arpeggio (84 bpm, A minor: Am7 → Dm7 → G7 → Cmaj7) enters on the first setup card with a soft kick + rim; minimal (the lane also
posts the no-music cut). Each meme card = a pixel pop; every deadpan "why would I deceive you?" gets a little record-scratch-free
"bwomp" (low swell); the clock ticks while its hands race; the shrink-wrap crinkles; the party beat brings a muffled thump from
"next door"; "that one was a lie" = a boing; the phone shutter, solve beeps, the pen drawing the force diagram, an ink-swatch click.
Voice (Fish "Mommy") on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(mommy1=W('hook', 'mommy'), phone=B['phone']['t0'], my=W('phone', 'my'), why1=W('phone', 'why'), chapter=B['chapter']['t0'], why2=W('chapter', 'why'),
         theres=W('chapter', 'theres'), party=B['party']['t0'], tonight=W('party', 'tonight'), why3=W('party', 'why'), physics=B['physics']['t0'],
         okay=W('physics', 'okay'), lie=W('physics', 'lie'), scribe=B['scribe']['t0'], snapped=W('scribe', 'snapped'), scribeW=W('scribe', 'scribe'),
         drew=W('scribe', 'drew'), andS=W('scribe', 'and'), purple=W('scribe', 'purple'), end=B['end']['t0'], mommy2=W('end', 'mommy'), baby=W('end', 'baby'))
T['card'] = T['baby'] + 0.55
CUTS = [T['phone'], T['my'] + 0.7, T['why1'] - 0.1, T['chapter'], T['why2'] - 0.1, T['theres'] - 0.1, T['party'], T['why3'] - 0.15, T['physics'],
        T['okay'] - 0.15, T['scribe'], T['scribeW'] - 0.05, T['drew'] - 0.1, T['andS'] - 0.05, T['purple'] - 0.2, T['end']]

# ---------------------------------------------------------------- music: "DEADPAN LIBRARY" (84 bpm, A minor), enters on the first setup
BPM = 84; BEAT = 60 / BPM
IN = T['phone'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Am7', 'Dm7', 'G7', 'Cmaj7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Am7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 3, 2, 1, 2],
             "vel": [[IN, 0.22], [T['scribe'], 0.28], [T['end'], 0.24], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [45, 57, 60, 64, 67], "level": 3.2, "attack": 1.6, "release": 1.2, "cutoff": 750, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 76, 0.28, 0.14], [round(a + 0.1, 3), 81, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.38, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.22, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.45, 0.2], "vel": 0.2, "kind": "tick"}]
drums = [[round(IN, 3), 0.28, "boom"], [round(T['scribe'], 3), 0.3, "boom"]]
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
for t0 in (T['phone'], T['chapter'], T['party'], T['physics']): e(t0 + 0.02, "pop", -19, 0.0, pitch=1.05)   # the meme card lands
for w in (T['why1'], T['why2'], T['why3']): e(w + 0.9, "low_swell", -27, 0.0, dur=0.7, pitch=0.62)      # the deadpan "bwomp"
for m in (T['mommy1'], T['mommy2']):
    e(m + 0.05, "gold_chime", -26, 0.15, notes=[84, 91], spacing=0.06, vel=0.22, dur=0.5)
e(T['baby'] + 0.05, "gold_chime", -25, 0.1, notes=[79, 84, 91], spacing=0.08, vel=0.24, dur=0.6)       # the blown kiss
t = T['my'] + 0.75
while t < T['why1'] - 0.2: e(t, "scan_beep", -30, 0.3, pitch=0.9, dur=0.03); t += 0.09                 # the clock racing
e(T['why2'] + 0.1, "blanket_rustle", -27, -0.2, dur=0.5, intensity=0.5)                                # shrink-wrap crinkle
for i in range(6): e(T['party'] + 0.3 + i * 0.68, "knock", -31, 0.6, pitch=0.55)                       # a party thumping next door
e(T['why3'] - 0.05, "latch_click", -22, 0.0, kind="close", bright=1.2)                                 # shades down
e(T['lie'] + 0.05, "boing", -24, 0.0, pitch=1.15, dur=0.35)                                            # "that one was a lie"
e(T['snapped'] + 0.15, "latch_click", -16, 0.1, kind="close", bright=1.4); e(T['snapped'] + 0.16, "flash_swish", -20, 0.1, dur=0.18, peak=0.5)
k, t = 0, T['scribeW'] + 0.2
while t < T['drew'] - 0.2: e(t, "scan_beep", -27, 0.15, pitch=1.6 + 0.02 * (k % 6), dur=0.07); t += 0.18; k += 1
t = T['drew'] - 0.1
while t < T['purple'] - 0.3: e(t, "pen_scribble", -21, 0.0, dur=0.6); t += 0.55
e(T['purple'] + 0.1, "latch_click", -22, 0.1, kind="open", bright=1.5)                                 # the Purple swatch
e(T['card'], "gold_chime", -23, 0.0, notes=[69, 76, 81], spacing=0.09, vel=0.28)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -33, "seed": 8},
    {"sound": "clock", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -40, "seed": 9},
]
cues = {
    "title": "067 - why would I deceive you (Vex, DEADPAN LIBRARY bed, 84 bpm A minor pluck, library hush, meme pops + Fish Mommy)",
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
