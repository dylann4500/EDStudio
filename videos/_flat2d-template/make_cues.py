#!/usr/bin/env python3
"""Cue sheet for the flat2d template -> cues.json (copy 053's make_cues.py for a full reel).
    python3 -I videos/NNN-slug/make_cues.py && python3 -I audio/synth.py NNN-slug
Times come from story.json with the SAME formulas as shots.js. Music: a soft 140 bpm bed (marimba arp + light drums + pad) under the
voice; SFX carry the gags (user, Nov 8: minimal music; the posted cut is out/nomusic.mp4 with a trending sound: tools/nomusic-copy.sh)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]
T = dict(every=W('hook', 'every'), today=W('gag', 'today'), robot=W('gag', 'robot'), lasted=W('gag', 'lasted'), seconds=W('gag', 'seconds'))
BOOM = T['seconds'] + 0.08; ENDCARD = BOOM + 1.1          # SAME as shots.js

BPM = 140; BEAT = 60 / BPM; IN = 0.0
chords, cur = [], IN
while cur < D - 1.0:
    for sym in ['F', 'C', 'Dm', 'Bb']:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'F'])
TRI = {'F': [65, 69, 72], 'C': [64, 67, 72], 'Dm': [65, 69, 74], 'Bb': [65, 70, 74]}; ARP = [0, 1, 2, 3, 2, 1, 0, 1]
mallet = []
for i, (ct, sym) in enumerate(chords[:-1]):
    k = 0
    while ct + k * BEAT / 2 < chords[i + 1][0] - 0.02:
        a = ARP[k % 8]; mallet.append([round(ct + k * BEAT / 2, 3), TRI[sym][a] if a < 3 else TRI[sym][0] + 12, 0.17 if k % 2 == 0 else 0.12, 0.15]); k += 1
music = {"gain_db": 0.0, "reverb_db": -14.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -3.0, "drums_db": -6.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords,
         "sections": [{"t0": IN, "t1": D, "style": "sparse", "vel": 0.22}], "melody": [], "mallet_melody": mallet,
         "pad": [{"t0": IN, "t1": D - 0.2, "notes": [41, 53, 60, 65], "level": 0.6, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30}], "drums": [],
         "drum_patterns": [{"t0": IN, "t1": D - 0.6, "step": BEAT, "pattern": [1], "vel": 0.42, "kind": "kick"},
                           {"t0": IN + BEAT, "t1": D - 0.6, "step": 2 * BEAT, "pattern": [1], "vel": 0.3, "kind": "clap"},
                           {"t0": IN, "t1": D - 0.6, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.75, 0.25], "vel": 0.28, "kind": "tick"}]}
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
e(0.4, "pop", -16, -0.2, pitch=0.9); e(0.44, "gold_chime", -22, -0.2, notes=[84, 88], spacing=0.06, vel=0.35)   # the name tag
e(T['robot'], "pop", -16, 0.2, pitch=1.0)
for k in range(8): e(T['robot'] + k * 0.15, "clunk", -24, 0.2, size=0.25, metal=0.9)
for k in range(5): e(T['lasted'] + k * 0.11, "zap", -24, 0.3 * (1 if k % 2 else -1), dur=0.25)
e(BOOM, "fireball", -8, 0.0, size=1.0); e(BOOM + 0.02, "distant_boom", -11, 0.0, size=0.9); e(BOOM + 0.05, "crumble", -17, 0.0, dur=0.9, size=0.7)
e(ENDCARD, "gold_chime", -15, 0.0, notes=[77, 81, 84, 89], spacing=0.07, vel=0.45, shimmer=0.3, dur=2.4)
amb = [{"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -33, "seed": 1},
       {"sound": "lamp_hum", "t0": 0.0, "t1": ENDCARD, "fade_in": 0.05, "fade_out": 0.2, "gain_db": -40, "seed": 2}]
cues = {"title": "flat2d template", "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
        "stem_gain_db": {"music": -12.0, "sfx": 3.5, "amb": 4.0, "voice": 0.0},
        "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                          "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
        "sfx_lowpass_hz": 5200, "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -7.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
        "shots": [B[b]['t0'] for b in story['order']] + [D], "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x['t'])}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
