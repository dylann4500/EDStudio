#!/usr/bin/env python3
"""Cue sheet for 084 (Scribe promo, "Could Cristiano Ronaldo end World War II?") -> cues.json.
    python3 -I videos/084-ronaldo-ww2/make_cues.py && python3 -I audio/synth.py 084-ronaldo-ww2

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every
sound on its picture.

Sound identity: the user's TIKI TIKI phonk (Nov 10: phonk only under the accent-narrator reels) as the bed, from the hook on,
ducked under the Fish "chinese" narrator (the voice leads, the bed sits ~16 dB under it); the places carry their own sound
(the time tunnel's wub, wind over a Normandy field, a far bomber drone, the tank's rumble, the V-2's roar, Derek's room tone,
surf at the beach, a crowd at the victory party) and every gag gets foley (the kick, the BONK, the race, the bicycle-kick
crash, the stamp, Scribe's shutter + beeps + pen). The landing beat stays respectful: surf, wind, boat engines, no booms.
The MP3 lives in the gitignored exports/music (never committed: the repo is public)."""
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
    could=W('hook', 'could'), we=W('hook', 'we'), sent=W('hook', 'sent'), y1944=W('hook', '1944'),
    planA=W('kick', 'plan'), bombers1=W('kick', 'bombers'), his1=W('kick', 'his'), k130=W('kick', '130'),
    the1=W('high', 'the'), seven=W('high', 'seven'), up=W('high', 'up'), sixty=W('high', 'sixtysix'), and1=W('high', 'and', 2), gary=W('high', 'gary'),
    planB=W('tank', 'plan'), tanks=W('tank', 'tanks'), a1=W('tank', 'a'), sherman=W('tank', 'sherman'), he=W('tank', 'he'), lapped=W('tank', 'lapped'), tank=W('tank', 'tank'),
    planC=W('v2', 'plan'), fifty=W('v2', 'fiftyseven'), his3=W('v2', 'his'), header=W('v2', 'header'), two=W('v2', 'two'),
    nothing=W('stop', 'nothing'), definitely=W('stop', 'definitely'), bicycle=W('stop', 'bicycle'), kick2=W('stop', 'kick'),
    back=W('hw', 'back'), y2026=W('hw', '2026'), handwritten=W('hw', 'handwritten'), cooked=W('hw', 'cooked'),
    so1=W('scribe', 'so'), scribe=W('scribe', 'scribe'), photo=W('scribe', 'photo'), it1=W('scribe', 'it'), draws=W('scribe', 'draws'), trajectory=W('scribe', 'trajectory'), handwriting=W('scribe', 'handwriting'),
    so2=W('answer', 'so'), no=W('answer', 'no'),
    on=W('dday', 'on'), hundred=W('dday', 'hundred'), fourteen=W('dday', 'fourteen'),
    thats2=W('party', 'thats'), ronaldo=W('party', 'ronaldo'), victory=W('party', 'victory'))
LASTW = B['party']['w'][-1][2]

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = LASTW + 0.45
LANDH = t['y1944'] + 0.02
KICK, LAND = t['k130'] - 0.02, t['gary']
GO, STOP0 = t['tanks'], t['lapped'] + 0.15
V2T0, V2C0 = t['planC'] - 0.2, t['fifty'] - 0.3
JUMP0, BKHIT = t['header'] - 0.12, t['kick2']
STAMP, FLASH = t['handwritten'] + 0.04, t['photo'] + 0.06
SOLVE0, SOLVE1, WRITE0, WRITE1 = t['it1'] - 0.05, t['draws'] - 0.12, t['draws'], t['so2'] - 0.32

# ---------------------------------------------------------------- music: the user's phonk track (file), nothing synthesized
# (the track: sparse intro 0–10 s with a break at 5–7 s, full 10–43 s, a softer bridge 44–55 s, full 55–117 s)
MUSIC_FILE = '/Users/dylan/Documents/GitHub/EDStudio/exports/music/tiki-phonk.mp3'
music = {"gain_db": 0.0, "instrument": "pluck", "end": D, "chords": [[0.0, 'Am']], "sections": [], "melody": [], "pad": [],
         "file": MUSIC_FILE, "file_start": 55.0, "file_in": 0.2, "file_gain_db": 0.0, "file_fade_in": 0.15, "file_fade_out": 2.0,
         "ducks": [{"t0": t['on'] - 0.15, "t1": t['thats2'] - 0.1, "db": -4.0, "ramp": 0.3}]}   # 55 s in = the track's dense second half (its intro breaks at 5–7 s); a gentle −4 dB under the landing

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=6.0, gain=-24, p0=0.0, p1=0.0):
    if b > a + 0.15: ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})

# HOOK: the time tunnel, the portal spits him into a 1944 field
e(0.12, "portal_wub", -18, 0.0, dur=1.6, pitch=0.7)
e(0.3, "low_swell", -22, 0.0, dur=1.8, pitch=1.2)
e(t['sent'] - 0.05, "portal_wub", -14, 0.0, dur=0.7, pitch=1.1, swallow=0.0)
e(t['sent'], "flash_swish", -16, 0.0, dur=0.4, peak=0.8)
e(LANDH, "giant_step", -12, 0.0, size=0.8); e(LANDH + 0.02, "blanket_rustle", -21, 0.0, dur=0.4, intensity=0.8)
e(LANDH + 0.25, "portal_wub", -22, 0.0, dur=0.5, pitch=1.4, swallow=1.0)
# PLAN A: the free kick, the climb to the bombers, the ball on Gary's helmet
steps(t['his1'] + 0.15, KICK - 0.05, 7.5, -24)
e(KICK - 0.01, "kick", -10, 0.0); e(KICK + 0.02, "flash_swish", -15, 0.0, dur=0.5, peak=0.9)
e(t['the1'], "low_swell", -17, 0.0, dur=1.6, pitch=1.4)
e(t['seven'] - 0.1, "pressure_drop", -18, 0.0, dur=1.4)
e(t['up'] - 0.05, "flash_swish", -22, 0.0, dur=0.6, peak=0.5)
e(t['and1'], "flash_swish", -18, 0.0, dur=0.9, peak=0.7)      # the ball coming back down
e(LAND, "bonk", -10, 0.2); e(LAND + 0.01, "metal_clang", -16, 0.2, size=0.5, pitch=1.6, dur=0.6)
e(LAND + 0.2, "gold_chime", -22, 0.2, notes=[88, 91, 95], spacing=0.06, vel=0.25)   # dizzy stars
# PLAN B: the race
e(GO - 0.02, "flash_swish", -16, -0.2, dur=0.35, peak=0.8)
steps(GO, STOP0 + 0.6, 9.5, -21, -0.2, 0.2)
e(t['sherman'], "clunk", -17, -0.2, size=0.6, metal=0.8)
e(t['he'], "whoomp", -18, 0.0, size=0.5)                        # the exhaust puff
e(t['tank'] - 0.05, "breath", -16, 0.1, dur=0.8, inhale=False)  # wheezing in the dust
# PLAN C: the V-2
e(t['fifty'] - 0.08, "pressure_drop", -13, 0.0, dur=1.8); e(t['fifty'] - 0.04, "flash_swish", -14, 0.3, dur=0.6, peak=1.0)
e(JUMP0, "flash_swish", -19, 0.0, dur=0.4, peak=0.6); e(t['two'], "pop", -17, 0.2, pitch=1.2)
e(t['definitely'] - 0.05, "flash_swish", -16, 0.0, dur=0.5, peak=0.8)
e(BKHIT, "giant_step", -9, 0.0, size=1.0); e(BKHIT + 0.01, "bonk", -15, 0.0); e(BKHIT + 0.02, "blanket_rustle", -19, 0.0, dur=0.5, intensity=1.0)
e(BKHIT + 0.3, "gold_chime", -23, 0.0, notes=[88, 91, 95], spacing=0.06, vel=0.25)
# 2026: Derek
e(t['back'] - 0.15, "whoosh_timeskip", -14, 0.0, pre=0.3, post=0.25)
e(STAMP, "knock", -11, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
e(t['cooked'], "hiss", -16, 0.0, dur=0.9); e(t['cooked'] + 0.05, "whimper", -19, 0.0, pitch=1.1, dur=0.4)
# SCRIBE (on his phone)
e(t['so1'] + 0.05, "gold_chime", -15, 0.0, notes=[77, 84, 89], spacing=0.08, vel=0.45)
e(FLASH - 0.02, "shutter", -12, 0.0); e(FLASH, "flash_swish", -18, 0.0, dur=0.25, peak=0.6)
for k in range(8): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 8, "scan_beep", -22, 0.1, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.1, notes=[84, 89, 93, 96], spacing=0.05, vel=0.45)
k = 0
while WRITE0 + k * 0.5 < WRITE1 - 0.1:
    e(WRITE0 + k * 0.5, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.55); k += 1
e(t['trajectory'] + 0.1, "low_swell", -21, 0.0, dur=0.8, pitch=1.6)
e(t['handwriting'] + 0.1, "gold_chime", -15, 0.0, notes=[79, 84, 88, 91], spacing=0.05, vel=0.45)
# THE ANSWER
e(t['no'] + 0.05, "giant_step", -15, 0.0, size=0.5); e(t['no'] + 0.08, "whimper", -20, 0.0, pitch=0.9, dur=0.5)
# D-DAY (respectful: no impacts)
e(t['hundred'], "low_swell", -18, 0.0, dur=2.0, pitch=0.8)
# THE PARTY
e(t['thats2'], "mass_clap", -16, 0.0, dur=3.5, size=0.8)
jk = 0
while t['ronaldo'] + jk / 2.4 < D - 0.5:                          # a soft tap every time the ball meets his knee
    e(t['ronaldo'] + jk / 2.4, "kick", -24, 0.1); jk += 1
e(t['victory'], "gold_chime", -18, 0.0, notes=[72, 77, 81, 84], spacing=0.06, vel=0.35)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 77, 81, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

amb = [
    {"sound": "rocket_rumble", "t0": 0.0, "t1": t['we'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -27, "args": {"rise": 0.6}, "seed": 1},   # the tunnel's roar
    {"sound": "wind", "t0": t['we'] - 0.05, "t1": t['back'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"darkness": 0.6, "gust": 0.4, "whistle": 0.05}, "seed": 2},
    {"sound": "dry_leaves", "t0": t['we'] - 0.05, "t1": t['back'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -34, "args": {"density": 0.6}, "seed": 3},
    {"sound": "jet", "t0": t['planA'], "t1": t['and1'], "fade_in": 0.6, "fade_out": 0.2, "gain_db": -28, "args": {"whine": 0.05, "pitch": 0.45}, "seed": 4},   # the bombers' far drone
    {"sound": "wind", "t0": t['the1'], "t1": t['up'], "fade_in": 0.3, "fade_out": 0.1, "gain_db": -24, "args": {"darkness": 0.3, "gust": 0.9, "whistle": 0.2}, "seed": 5},
    {"sound": "train", "t0": t['planB'], "t1": t['planC'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -27, "args": {"clack": 3.2}, "seed": 6},   # the tracks
    {"sound": "rocket_rumble", "t0": t['planB'], "t1": t['planC'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -29, "args": {"rise": 0.3}, "seed": 7},   # the tank engine
    {"sound": "rocket_rumble", "t0": t['planC'], "t1": t['his3'], "fade_in": 0.3, "fade_out": 0.15, "gain_db": -24, "args": {"rise": 1.0}, "seed": 8},
    {"sound": "room_tone", "t0": t['back'], "t1": t['so2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 9},
    {"sound": "lamp_hum", "t0": t['back'], "t1": t['so2'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -36, "seed": 10},
    {"sound": "wind", "t0": t['so2'], "t1": t['on'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.05}, "seed": 11},
    {"sound": "surf", "t0": t['on'] - 0.05, "t1": t['thats2'], "fade_in": 0.05, "fade_out": 0.15, "gain_db": -24, "args": {"size": 0.8}, "seed": 12},
    {"sound": "jet", "t0": t['on'] - 0.05, "t1": t['thats2'], "fade_in": 0.1, "fade_out": 0.15, "gain_db": -32, "args": {"whine": 0.0, "pitch": 0.35}, "seed": 13},   # boat engines
    {"sound": "crowd_cheer", "t0": t['thats2'] - 0.05, "t1": D, "fade_in": 0.1, "fade_out": 1.2, "gain_db": -24, "args": {"excite": 0.8}, "seed": 14},
    {"sound": "kids_laugh", "t0": t['ronaldo'], "t1": D, "fade_in": 0.2, "fade_out": 1.2, "gain_db": -28, "args": {"density": 0.8}, "seed": 15},
    {"sound": "applause", "t0": t['victory'], "t1": D, "fade_in": 0.3, "fade_out": 1.2, "gain_db": -27, "args": {"density": 30.0, "swell": 0.3}, "seed": 16},
]

cues = {
    "title": "084 - Scribe promo: could Ronaldo end WW2 (the user's phonk bed + place sound + gag foley + the 'chinese' narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -16.0, "sfx": 3.0, "amb": 4.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -6.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds")
