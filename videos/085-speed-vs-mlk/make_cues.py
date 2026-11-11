#!/usr/bin/env python3
"""Cue sheet for 085 (Scribe promo, "IShowSpeed vs Martin Luther King Jr.: who can pull the bigger crowd?") -> cues.json.
    python3 -I videos/085-speed-vs-mlk/make_cues.py && python3 -I audio/synth.py 085-speed-vs-mlk

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every
sound on its picture.

Sound identity: the user's TIKI TIKI phonk (phonk preset: accent-narrator reels only) from FRAME 1 (user, Nov 10: "the music
should start immediately"), ducked under the Fish "Amir" narrator, with a gentle extra -4 dB dip under every Dr. King line
(respect, like 084's D-Day beat; continuous, never a dropout). The streamer's half is loud and silly (a cheering street crowd,
confetti pops, chat pings, the stampede, Gary's BONK + boing); the 1955/1963 half is told straight: a church office (room tone,
a mimeograph's soft clunk, paper), a 1955 street (the bus pulling away, footsteps), the March (a vast crowd murmur, warm
applause), never an impact or a gag sound under him. The MP3 lives in the gitignored exports/music (never committed)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


t = dict(
    versus=W('hook', 'versus'), who=W('hook', 'who'), crowd1=W('hook', 'crowd'),
    speed=W('speed', 'speed'), sixty=W('speed', 'sixty'), one1=W('speed', 'one'), million2=W('speed', 'million', 2), live=W('speed', 'live'),
    in1=W('streets', 'in'), tens=W('streets', 'tens'), chase=W('streets', 'chase'), gary=W('streets', 'gary'), flattened=W('streets', 'flattened'),
    now=W('king', 'now'), no1=W('king', 'no'), algorithm=W('king', 'algorithm'), in2=W('king', 'in'), montgomery=W('king', 'montgomery'), people1=W('king', 'people'), three=W('king', 'three'),
    in3=W('march', 'in'), march=W('march', 'march'), two=W('march', 'two'), in4=W('march', 'in', 2), person=W('march', 'person'),
    he1=W('speech', 'he'), dream=W('speech', 'dream'), calling=W('speech', 'calling'), every=W('speech', 'every'),
    back=W('hw', 'back'), handwritten=W('hw', 'handwritten'), so1=W('hw', 'so'), scribe=W('hw', 'scribe'), photo=W('hw', 'photo'), and1=W('hw', 'and'), fills=W('hw', 'fills'), handwriting=W('hw', 'handwriting'),
    so2=W('answer', 'so'), no2=W('answer', 'no'),
    then=W('legacy', 'then'), civil2=W('legacy', 'civil'), nobel=W('legacy', 'nobel'), voting=W('legacy', 'voting'),
    king3=W('end', 'king'), zero=W('end', 'zero'), speed3=W('end', 'speed'), taking=W('end', 'taking'), notes=W('end', 'notes'))
LASTW = B['end']['w'][-1][2]

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = LASTW + 0.45
CH0 = t['in1'] - 0.1
TRIP, STOMP = t['gary'] + 0.12, t['gary'] + 0.36
BUS0 = t['in2'] - 0.05
FLY0, FLYP = t['no1'] - 0.25, 0.055
STAMP, FLASH, FOUND0 = t['handwritten'] + 0.04, t['photo'] + 0.06, t['and1'] - 0.05
WRITE0, WRITE1 = t['fills'] - 0.05, t['so2'] - 0.22
NEWS_T = [t['civil2'] - 0.3, t['nobel'] - 0.2, t['voting'] - 0.3]
MEDAL_T = t['nobel'] + 0.75
VERDICT = t['no2'] - 0.02

# ---------------------------------------------------------------- music: the user's phonk track (preset), from frame 1
music = {"preset": "phonk", "file_in": 0.0, "file_fade_in": 0.1, "gain_db": 0.0, "end": D,
         "ducks": [{"t0": t['now'] - 0.2, "t1": t['back'] - 0.1, "db": -10.5, "ramp": 0.35},          # under Dr. King (1955-1963): the track is ~7 dB louder here: this levels it and sits ~2 dB lower than the streamer lines
                   {"t0": t['back'] - 0.1, "t1": t['then'] - 0.15, "db": -10.5, "ramp": 0.3},          # Derek + Scribe: the track's dense part, levelled to ~8 dB under the voice
                   {"t0": t['then'] - 0.15, "t1": t['speed3'] - 0.1, "db": -11.5, "ramp": 0.35}]}    # under the laws + the Nobel + "moved a country"

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=6.0, gain=-24, p0=0.0, p1=0.0):
    if b > a + 0.15: ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})

# HOOK: the VS split slams in, the street crowd hypes
e(0.1, "flash_swish", -15, 0.0, dur=0.35, peak=0.9); e(0.12, "knock", -17, 0.0, pitch=0.7)
e(t['versus'], "pop", -19, 0.25, pitch=0.9)
e(t['who'] - 0.04, "flash_swish", -19, -0.1, dur=0.5, peak=0.6)       # the cut inside the 1963 half (the crane)
# SPEED: the bench, confetti, chat pings, the counter hitting 1,043,028
for k in range(5): e(t['speed'] + 0.05 + k * 0.32, "pop", -21, -0.3 + 0.15 * k, pitch=1.1 + 0.08 * k)
for k in range(6): e(t['one1'] + 0.12 + k * 0.17, "scan_beep", -26, -0.3, pitch=1.8 + 0.05 * (k % 3), dur=0.05)
e(t['live'] + 0.02, "gold_chime", -17, 0.0, notes=[79, 84, 88, 91], spacing=0.04, vel=0.4)
e(t['live'] + 0.02, "pop", -16, 0.0, pitch=0.8)
# STREETS: the stampede, Gary slips, gets run over, BONK, dizzy stars
steps(CH0, t['gary'] + 0.9, 13.0, -17, 0.2, -0.2)
steps(CH0, t['gary'] + 0.9, 9.0, -20, -0.2, 0.2)
e(TRIP - 0.02, "flash_swish", -16, 0.1, dur=0.3, peak=0.9); e(TRIP + 0.2, "giant_step", -16, 0.0, size=0.5)
e(STOMP, "giant_step", -11, 0.0, size=0.8); e(STOMP + 0.11, "giant_step", -14, 0.1, size=0.6); e(STOMP + 0.22, "giant_step", -15, -0.1, size=0.6)
e(STOMP + 0.02, "bonk", -12, 0.0)
e(t['flattened'] + 0.02, "boing", -17, 0.0, pitch=0.8, dur=0.5)
e(STOMP + 0.35, "gold_chime", -23, 0.0, notes=[88, 91, 95], spacing=0.06, vel=0.25)
# 1955: back in time to a church office — told straight
e(t['now'] - 0.18, "whoosh_timeskip", -16, 0.0, pre=0.3, post=0.25)
k = 0
while FLY0 - 0.6 + k * 0.45 < t['in2'] - 0.1:                          # the mimeograph's drum turning (a soft clunk per turn)
    e(FLY0 - 0.6 + k * 0.45, "clunk", -25, 0.2, size=0.3, metal=0.4); k += 1
for k in range(0, 40, 4): e(FLY0 + k * FLYP, "blanket_rustle", -24, 0.15 - 0.03 * (k % 5), dur=0.25, intensity=0.5)
e(t['algorithm'] + 0.1, "flash_swish", -22, 0.0, dur=0.4, peak=0.4)
# 1955: Montgomery — the bus pulls away nearly empty, people walk
e(BUS0 + 0.15, "car_pass", -19, -0.4, dur=1.8, size=1.6)
steps(t['in2'], t['in3'] - 0.05, 3.2, -22, 0.0, 0.0)
steps(t['people1'], t['in3'] - 0.05, 2.6, -24, -0.2, 0.2)
# 1963: the March on Washington
steps(t['in3'], t['two'] - 0.05, 3.0, -21, 0.0, 0.0)
e(t['two'] - 0.05, "low_swell", -17, 0.0, dur=2.2, pitch=0.8)
e(t['in4'] + 0.05, "pop", -22, 0.0, pitch=0.7)                         # the streamer's jaw drops (his side of the cut)
e(t['every'] + 0.3, "low_swell", -22, 0.0, dur=1.2, pitch=1.1)
# 2026: Derek + Scribe
e(t['back'] - 0.15, "whoosh_timeskip", -14, 0.0, pre=0.3, post=0.25)
e(STAMP, "knock", -11, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
e(t['so1'] + 0.05, "gold_chime", -15, 0.0, notes=[77, 84, 89], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "shutter", -12, 0.0); e(FLASH, "flash_swish", -18, 0.0, dur=0.25, peak=0.6)
for k in range(4): e(FOUND0 + 0.02 + k * 0.05, "scan_beep", -22, 0.1, pitch=1.4 + 0.08 * k, dur=0.05)
k = 0
while WRITE0 + k * 0.42 < WRITE1 - 0.1:
    e(WRITE0 + k * 0.42, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.48); k += 1
e(t['handwriting'] + 0.1, "gold_chime", -15, 0.0, notes=[79, 84, 88, 91], spacing=0.05, vel=0.45)
# THE VERDICT: the 1963 half shoves the street half up
e(VERDICT, "whoomp", -15, 0.0, size=0.6); e(VERDICT + 0.02, "flash_swish", -16, 0.0, dur=0.4, peak=0.8)
# THE LAWS + THE NOBEL: newspapers land (paper, no impacts)
for tn in NEWS_T: e(tn, "flash_swish", -20, 0.1, dur=0.45, peak=0.5); e(tn + 0.4, "blanket_rustle", -19, 0.0, dur=0.35, intensity=0.6)
e(MEDAL_T + 0.32, "metal_clang", -24, 0.1, size=0.15, pitch=2.2, dur=0.4)
e(t['nobel'] + 0.05, "gold_chime", -19, 0.0, notes=[72, 77, 81, 84], spacing=0.07, vel=0.3)
# THE END: the crowd at the March, then today on the steps; the pen; the end card
e(t['king3'] + 0.3, "low_swell", -19, 0.0, dur=2.4, pitch=0.9)
k = 0
while t['taking'] + k * 0.4 < D - 1.5:
    e(t['taking'] + k * 0.4, "pen_scribble", -24, -0.2, dur=0.38); k += 1
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 77, 81, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "city_day", "t0": 0.0, "t1": t['now'] - 0.05, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"murmur": 0.5, "traffic": 0.5}, "seed": 1},
    {"sound": "crowd_cheer", "t0": 0.0, "t1": t['now'] - 0.05, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -25, "args": {"excite": 1.0}, "seed": 2},
    {"sound": "room_tone", "t0": t['now'] - 0.05, "t1": t['in2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 3},
    {"sound": "city_day", "t0": t['in2'] - 0.05, "t1": t['in3'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -31, "args": {"murmur": 0.25, "traffic": 0.35}, "seed": 4},
    {"sound": "dry_leaves", "t0": t['in2'] - 0.05, "t1": t['in3'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -36, "args": {"density": 0.4}, "seed": 5},
    {"sound": "crowd_cheer", "t0": t['in3'] - 0.05, "t1": t['in4'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -25, "args": {"excite": 0.35}, "seed": 6},   # the March: a vast murmur
    {"sound": "crowd_cheer", "t0": t['in4'] - 0.05, "t1": t['he1'], "fade_in": 0.05, "fade_out": 0.05, "gain_db": -31, "args": {"excite": 0.6}, "seed": 7},   # the streamer's street, hushed
    {"sound": "crowd_cheer", "t0": t['he1'] - 0.05, "t1": t['back'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"excite": 0.2}, "seed": 8},   # listening
    {"sound": "wind", "t0": t['he1'] - 0.05, "t1": t['back'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -35, "args": {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, "seed": 9},
    {"sound": "applause", "t0": t['every'] - 0.1, "t1": t['back'], "fade_in": 0.5, "fade_out": 0.15, "gain_db": -30, "args": {"density": 30.0, "swell": 0.3}, "seed": 10},
    {"sound": "room_tone", "t0": t['back'], "t1": t['so2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 11},
    {"sound": "lamp_hum", "t0": t['back'], "t1": t['so2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -36, "seed": 12},
    {"sound": "crowd_cheer", "t0": t['so2'] - 0.05, "t1": t['then'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -26, "args": {"excite": 0.8}, "seed": 13},
    {"sound": "room_tone", "t0": t['then'] - 0.05, "t1": t['king3'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -31, "seed": 14},
    {"sound": "crowd_cheer", "t0": t['king3'] - 0.05, "t1": t['speed3'], "fade_in": 0.1, "fade_out": 0.3, "gain_db": -25, "args": {"excite": 0.9}, "seed": 15},
    {"sound": "applause", "t0": t['king3'] + 0.2, "t1": t['speed3'] + 0.4, "fade_in": 0.4, "fade_out": 0.5, "gain_db": -27, "args": {"density": 40.0, "swell": 0.5}, "seed": 16},
    {"sound": "city_day", "t0": t['speed3'] - 0.05, "t1": D, "fade_in": 0.3, "fade_out": 1.2, "gain_db": -32, "args": {"murmur": 0.3, "traffic": 0.2}, "seed": 17},
    {"sound": "wind", "t0": t['speed3'] - 0.05, "t1": D, "fade_in": 0.3, "fade_out": 1.2, "gain_db": -36, "args": {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, "seed": 18},
]

cues = {
    "title": "085 - Scribe promo: IShowSpeed vs MLK (the user's phonk bed from frame 1 + place sound + foley + the 'Amir' narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -8.0, "sfx": 3.0, "amb": 4.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -6.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds")
