#!/usr/bin/env python3
"""Cue sheet for 081 (Scribe lane, "What scrolling in bed does to your brain", Vex explainer, Sua voice) -> cues.json.
python3 -I videos/081-vex-doomscroll/make_cues.py   then   python3 -I audio/synth.py 081-vex-doomscroll
Every time comes from story.json (the narration's word times) with the SAME anchors as shots.js.

Sound identity: "DORM AT 2 AM" — the hook is the quiet room: room tone, crickets outside, the mini fridge's hum, soft phone swipes;
the music ENTERS on "Midnight" (the HUD clock starts): a dreamy lo-fi bell arpeggio (88 bpm, F major: Fmaj7 → Em7 → Dm7 → Cmaj7) over a
soft kick + snap + shaker (minimal: the lane also posts the no-music cut). Foley: swipes while she scrolls, a counter run on the student
grid, Derek's phone dropping on his face (a whoosh, a knock + a boing), phone taps + pen scratches for Scribe, a click on Finish now and
the page landing, the light switch on "go to sleep", chimes on the wink and the end card. Voice (Fish "Sua shy voice") on top."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B, D = story['beats'], story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())
def W(beat, word, n=1): return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]

T = dict(heres=W('hook', 'heres'), mid=B['midnight']['t0'], melatonin=W('midnight', 'melatonin'), about=W('midnight', 'about'), twice=W('midnight', 'twice'),
         study=B['study']['t0'], forty5=W('study', 'fortyfive'), students=W('study', 'students'), t24=W('study', 'twentyfour'), odds=B['odds']['t0'],
         f59=W('odds', 'fiftynine'), every=W('study', 'every'), memories=W('memory', 'memories'), derek=B['derek']['t0'], hard=W('derek', 'hard'), cute=W('derek', 'cute'), pivot=B['pivot']['t0'], scribe=B['scribe']['t0'],
         it=W('scribe', 'it'), graph=W('scribe', 'graph'), tap=W('scribe', 'tap'), finish=W('scribe', 'finish'), tipsy=B['tipsy']['t0'], awake=W('tipsy', 'awake'),
         test=W('tipsy', 'test'), mem=B['memory']['t0'], drop=W('memory', 'drop'), end=B['end']['t0'], down=W('end', 'down'), go=W('end', 'go'),
         ill=W('end', 'ill'), know=W('end', 'know'))
T['card'] = T['know'] + 0.6; T['dropT'] = T['hard'] - 0.05; T['bonk'] = T['dropT'] + 0.2; T['tapAt'] = T['finish'] + 0.02
# the same cut list as shots.js SH
CUTS = [T['heres'] - 0.12, T['mid'], T['melatonin'] - 0.45, T['study'], T['forty5'] - 0.1, T['every'] - 0.1, T['odds'], T['derek'], T['cute'] - 0.18, T['pivot'],
        T['scribe'], T['it'] - 0.06, T['graph'] - 0.12, T['tap'] - 0.3, T['tipsy'], T['test'] - 0.25, T['mem'], T['memories'] - 0.1, T['end']]

BPM = 88; BEAT = 60 / BPM
IN = T['mid'] + 0.04                          # the music enters with the clock: "Midnight"
chords, cur = [], IN
while cur < D - 0.8:
    for sym in ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7']:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'Fmaj7'])
sections = [{"t0": IN, "t1": D, "style": "arp", "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 0],
             "vel": [[IN, 0.24], [T['derek'], 0.27], [T['scribe'], 0.28], [T['tipsy'], 0.23], [T['end'], 0.2], [D, 0.18]]}]
pad = [{"t0": IN - 0.3, "t1": D - 0.2, "notes": [41, 53, 60, 64, 69], "level": 3.0, "attack": 0.9, "release": 1.2, "cutoff": 700, "hp": 30}]
mallet = []
for c in story['callouts']:
    a = c['t0'] + 0.02
    mallet += [[round(a, 3), 77, 0.22, 0.14], [round(a + 0.1, 3), 81, 0.24, 0.3]]
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.34, "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": 0.16, "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.3, 0.1, 0.22, 0.1], "vel": 0.15, "kind": "tick"}]
drums = [[round(IN, 3), 0.28, "boom"], [round(T['scribe'], 3), 0.22, "boom"], [round(T['tipsy'], 3), 0.2, "boom"]]
music = {"gain_db": 0.0, "reverb_db": -9.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "mallet_db": -6.0, "drums_db": -8.0, "instrument": "bell",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

ev = []
def e(t, sound, gain, pan=0.0, **args):
    d = {"t": round(t, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
for c in CUTS: e(c, "pop", -29, 0.0, pitch=1.7)
e(0.05, "pop", -24, 0.0, pitch=1.3)
for c in story['callouts']:
    if c['style'] != 'stamp': e(c['t0'], "scan_beep", -27, 0.2, pitch=1.4, dur=0.12)
for t0 in (T['mid'], T['study'], T['derek'], T['pivot'], T['tipsy'], T['mem'], T['end']): e(t0 + 0.04, "counter_tick", -22, -0.3)   # the HUD clock jumps
# scrolling: a soft swipe each time the feed flips (shots.js: clip i swipes at f 0.72..1, k = (t - 0.2) * 1.15)
k = 1
while True:
    t = 0.2 + (k - 1 + 0.75) / 1.15
    if t > T['scribe'] - 0.2: break
    if t < T['melatonin'] - 0.45 or T['study'] <= t < T['forty5']: e(t, "flash_swish", -33, 0.15, dur=0.18, peak=0.3)
    k += 1
# the student grid fills: a counter run; the -24 min pops in
t = T['forty5'] + 0.05
while t < T['students'] + 0.45: e(t, "counter_tick", -31, 0.15); t += 0.08
e(T['t24'] + 0.02, "pop", -23, 0.1, pitch=0.9)
e(T['f59'] + 0.05, "low_swell", -25, 0.0, dur=1.0, pitch=1.2)
# Derek: the phone slips, falls, BONK on his face, a dizzy boing
e(T['dropT'], "flash_swish", -25, -0.2, dur=0.2, peak=0.5)
e(T['bonk'], "knock", -17, -0.1, pitch=0.9); e(T['bonk'] + 0.04, "boing", -21, 0.0, pitch=1.1, dur=0.5)
e(T['cute'] + 0.1, "gold_chime", -26, 0.1, notes=[84, 88], spacing=0.06, vel=0.22, dur=0.5)
# Scribe: typing taps, the send tap, the pen writing, the Finish now click, the page landing
for i in range(6): e(T['scribe'] - 0.45 + i * 0.13, "latch_click", -31, 0.0, kind="close", bright=1.6)
e(T['it'] - 0.28, "latch_click", -21, 0.0, kind="close", bright=1.3)
t = T['it']
while t < T['tapAt'] - 0.1: e(t, "pen_scribble", -24, 0.0, dur=0.5); t += 0.5
e(T['tapAt'], "latch_click", -19, 0.0, kind="close", bright=1.3); e(T['tapAt'] + 0.08, "flash_swish", -25, 0.0, dur=0.3, peak=0.45)
e(T['tapAt'] + 0.12, "pop", -22, 0.0, pitch=1.1)
# 2:10: the awake bar fills (ticks), the tipsy wobble (a low swell); the memory bar drops
t = T['tipsy'] + 0.1
while t < T['awake'] + 0.3: e(t, "counter_tick", -31, 0.1); t += 0.1
e(T['test'] - 0.15, "low_swell", -24, 0.0, dur=1.4, pitch=0.8)
e(T['drop'] - 0.1, "low_swell", -24, 0.0, dur=1.2, pitch=0.7)
# lights out: the screen goes dark, the switch clicks, the wink, the end card
e(T['down'] + 0.02, "latch_click", -24, 0.2, kind="close", bright=1.2)
e(T['go'] - 0.1, "latch_click", -19, -0.4, kind="open", bright=0.8)
e(T['know'] + 0.1, "gold_chime", -25, 0.1, notes=[78, 85, 90], spacing=0.08, vel=0.24, dur=0.6)
e(T['card'], "gold_chime", -23, 0.0, notes=[65, 72, 77], spacing=0.09, vel=0.28)

amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -36, "seed": 811},
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.4, "fade_out": 0.8, "gain_db": -42, "seed": 812},
    {"sound": "cabin_hum", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -42, "seed": 813},   # the mini fridge
]
cues = {
    "title": "081 - what scrolling in bed does to your brain (Vex explainer, DORM AT 2 AM bed, 88 bpm F major bell lo-fi enters on Midnight + Fish Sua)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -11.5, "sfx": 2.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
# user, Nov 10: music from FRAME 1 (no quiet open on Scribe reels); every Vex reel plays the user's own CUTE track (tools/presets.json 'cute'; 0 = ZOOM UP – Kahimi Karie), entering
# with the clock at "Midnight"; the synth score above is kept for reference only.
cues['music'] = {'preset': 'cute', 'pick': 0, 'file_in': 0.0, 'file_fade_in': 0.1, 'file_gain_db': -8.5}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords")
