#!/usr/bin/env python3
"""Cue sheet for 071 (Scribe lane, "My study feed vs reality", the 'Me vs My Insta Feed' trend, her apartment) -> cues.json.
python3 -I videos/071-vex-feed-vs-reality/make_cues.py   then   python3 -I audio/synth.py 071-vex-feed-vs-reality
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "FEED vs REALITY" — a quiet apartment (room tone, a fridge hum) under the hook; a bright, bouncy pluck groove
(96 bpm, F major: Fmaj7 → Dm7 → Gm7 → C7) enters on the first "my feed" with a soft kick + clap + shaker; minimal (the lane also
posts the no-music cut). The two halves sound different: each MY FEED shot lands with a soft sparkle + a phone "like" tick, each
REALITY shot with a dull thud of a mood drop (low swell). Foley: candle crackle, the sticky note, the pizza box lid, cans, the pen
on the legal pad, a paper-swatch click on "yellow", a camera shutter on the final post. Voice (Fish "Dolly") on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(morning=B['morning']['t0'], real1=W('morning', 'reality'), woke=W('morning', 'woke'), notes=B['notes']['t0'], real2=W('notes', 'reality'),
         says=W('notes', 'says'), snacks=B['snacks']['t0'], real3=W('snacks', 'reality'), fromW=W('snacks', 'from'), turn=B['turn']['t0'],
         looks=W('turn', 'looks'), scribe=B['scribe']['t0'], andS=W('scribe', 'and'), yellow=W('scribe', 'yellow'), because=W('scribe', 'because'),
         end=B['end']['t0'], honestly=W('end', 'honestly'), tryW=W('end', 'try'), up=W('end', 'up'))
T['card'] = T['up'] + 0.55
FEED = [T['morning'], T['notes'], T['snacks'], T['turn'], T['end']]
REAL = [T['real1'] - 0.1, T['real2'] - 0.1, T['real3'] - 0.1, T['looks'] + 0.4]
CUTS = sorted(FEED + REAL + [T['says'] + 0.6, T['fromW'] - 0.05, T['scribe'], T['andS'] - 0.05, T['because'] - 0.1])

# ---------------------------------------------------------------- music: "FEED vs REALITY" (96 bpm, F major), enters on the first feed post
BPM = 96; BEAT = 60 / BPM
IN = T['morning'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Fmaj7', 'Dm7', 'Gm7', 'C7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Fmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2],
             "vel": [[IN, 0.24], [T['scribe'], 0.28], [T['end'], 0.26], [D, 0.22]]}]
pad = [{"t0": 0.2, "t1": D - 0.2, "notes": [41, 53, 57, 60, 64], "level": 3.0, "attack": 1.6, "release": 1.2, "cutoff": 800, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 77, 0.28, 0.14], [round(a + 0.1, 3), 84, 0.3, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.26, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 2, "pattern": [0.5, 0.25], "vel": 0.22, "kind": "tick"}]
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
for t in FEED: e(t + 0.03, "gold_chime", -26, 0.2, notes=[86, 93], spacing=0.05, vel=0.2, dur=0.4); e(t + 0.5, "scan_beep", -29, 0.25, pitch=1.9, dur=0.05)   # sparkle + a "like"
for t in REAL[:3]: e(t + 0.05, "low_swell", -25, 0.0, dur=0.7, pitch=0.6)                                                                      # the mood drop
e(T['real2'] + 0.3, "blanket_rustle", -28, -0.2, dur=0.3, intensity=0.4)           # the sticky note
e(T['real3'] + 0.2, "knock", -26, 0.2, pitch=0.7)                                   # the pizza box lid
e(T['real1'] + 1.2, "breath", -30, 0.0, dur=0.6, inhale=True)                       # a yawn-ish stretch (soft)
e(T['scribe'] + 0.1, "pen_scribble", -21, 0.0, dur=0.6); e(T['scribe'] + 0.65, "pen_scribble", -22, 0.0, dur=0.6); e(T['scribe'] + 1.2, "pen_scribble", -22, 0.0, dur=0.6)
e(T['yellow'] - 0.05, "latch_click", -21, 0.1, kind="open", bright=1.5)            # the legal-pad swatch
e(T['up'] + 0.1, "latch_click", -18, 0.0, kind="close", bright=1.4); e(T['up'] + 0.11, "flash_swish", -22, 0.0, dur=0.18, peak=0.45)   # posted
e(T['card'], "gold_chime", -23, 0.0, notes=[65, 72, 77], spacing=0.09, vel=0.28)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -33, "seed": 11},
    {"sound": "lamp_hum", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -44, "seed": 12},
]
cues = {
    "title": "071 - my study feed vs reality (Vex, FEED vs REALITY bed, 96 bpm F major pluck, apartment, feed sparkles / reality thuds + Fish Dolly)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.0, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
# user, Nov 10: music from FRAME 1 (no quiet open on Scribe reels) and every Vex reel plays the user's own CUTE
# track (tools/presets.json 'cute'); the synth score above is kept for reference only. ~8 dB under the voice.
cues['music'] = {'preset': 'cute', 'pick': 0, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -4.8}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
