#!/usr/bin/env python3
"""Cue sheet for the motion-graphics template -> cues.json (copy 061's make_cues.py for a full reel).
    python3 -I videos/NNN-slug/make_cues.py && python3 -I audio/synth.py NNN-slug
Sound-design-led (no narrator): times come from story.json / shots.js constants. A soft pad from frame 1, a light mallet that
ENTERS on the premise (the clap), the foley carries it. The posted cut is out/nomusic.mp4 (tools/nomusic-copy.sh)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
D = story['duration']; CLAP = 4.4; END = story['end']['in']          # CLAP = shots.js CLAP
BPM = 112; BEAT = 60 / BPM
chords, cur, i = [], 0.0, 0
while cur < D - 0.8: chords.append([round(cur, 3), ['C', 'G', 'Am', 'F'][i % 4]]); cur += 4 * BEAT; i += 1
chords.append([round(cur, 3), 'C'])
TRI = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [60, 64, 69], 'F': [60, 65, 69]}
mallet = []
for j, (ct, sym) in enumerate(chords[:-1]):
    k = 0
    while ct + k * BEAT / 2 < chords[j + 1][0] - 0.02:
        tt = ct + k * BEAT / 2
        if tt >= CLAP: mallet.append([round(tt, 3), TRI[sym][[0, 2, 1, 2][k % 4]] + 12, 0.15 if k % 2 == 0 else 0.1, 0.16])
        k += 1
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 2.0, "pad_reverb_db": -6.0, "mallet_db": -4.0, "drums_db": -9.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords,
         "sections": [{"t0": 0.0, "t1": D, "style": "sparse", "vel": 0.2}], "melody": [], "mallet_melody": mallet,
         "pad": [{"t0": 0.0, "t1": D - 0.2, "notes": [48, 55, 60, 64], "level": 1.0, "attack": 1.2, "release": 1.0, "cutoff": 900, "hp": 40}], "drums": [], "drum_patterns": []}
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
e(CLAP - 1.2, "low_swell", -14, 0.0, dur=1.2)
e(CLAP, "mass_clap", -3, 0.0, dur=4.0, size=1.0, tail=1.2); e(CLAP, "hand_clap", -6, 0.0, size=1.5, pitch=0.9)
for k in range(6): e(5.65 + k * 0.12, "pop", -22, -0.4 + 0.15 * k, pitch=0.9 + 0.05 * k)   # bars growing
e(END + 0.1, "gold_chime", -17, 0.0, notes=[72, 76, 79, 84], spacing=0.08, vel=0.4, shimmer=0.25, dur=2.4)
amb = [{"sound": "wind", "t0": 0.0, "t1": 4.1, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -30, "seed": 1, "args": {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}},
       {"sound": "surf", "t0": 3.6, "t1": 5.8, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -20, "seed": 2},
       {"sound": "crowd_cheer", "t0": 3.7, "t1": 5.8, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -26, "seed": 3, "args": {"excite": 0.6}},
       {"sound": "applause", "t0": END, "t1": D, "fade_in": 0.4, "fade_out": 1.0, "gain_db": -26, "seed": 4, "args": {"density": 40.0, "swell": 0.5}}]
cues = {"title": "mg template", "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
        "stem_gain_db": {"music": -13.0, "sfx": 2.0, "amb": 3.0},
        "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -4.0}},
        "sfx_lowpass_hz": 5200, "shots": [0, 3.8, 5.4, END, D], "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x['t'])}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds")
