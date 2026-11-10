#!/usr/bin/env python3
"""Cue sheet for 069 (Scribe promo, the runaway corgi in the blocky-avatar game look) -> cues.json.
    python3 -I videos/069-rbx-corgi-loose/make_cues.py && python3 -I audio/synth.py 069-rbx-corgi-loose

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Sound identity: "HALFTIME OBBY" — a bright game-lobby bounce (140 bpm, a pluck ostinato in C over four-on-the-floor + claps + felt
hats, a warm pad; per the lane: upbeat, fast, percussive, low under the voice), a stadium that breathes with the chase (a crowd bed
that murmurs at the start line, roars when she breaks loose and erupts at the catch), and toy foley on every gag: little paws, the
gate clunk, whooshes, our own "oof" (a padded thud + a bonk + plastic bits clattering, never the game's sound), the ribbon snap +
confetti pops, a like-pop on the phone. The pivot cuts to night: crickets, a ticking clock, the bed drops to Am–F–C–G and comes back
up for Scribe (chime, scan beeps, the app's pen scribbling the page on screen, a Done chime), the teacher's oof, the A+ chime, applause under the end card. Soft + low-passed."""
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
    job=W('hook', 'job'), straight=W('hook', 'straight'), line=W('hook', 'line'),
    sunday=W('race', 'sunday'), halftime=W('race', 'halftime'), theRace=W('race', 'the', 1), race=W('race', 'race'), other=W('race', 'the', 2), quinn=W('race', 'quinn'), absolutely=W('race', 'absolutely'), not_=W('race', 'not'),
    quinnL=W('loose', 'quinn'), field=W('loose', 'field'), forty=W('loose', 'forty'), fortyfive=W('loose', 'fortyfive'), midfield=W('loose', 'midfield'),
    handlers=W('dive', 'handlers'), dive1=W('dive', 'dive', 1), miss1=W('dive', 'miss', 1), dive2=W('dive', 'dive', 2), miss2=W('dive', 'miss', 2),
    second=W('delay', 'the'), delayed=W('delay', 'delayed'), by=W('delay', 'by'),
    they=W('caught', 'they'), grab=W('caught', 'grab'), ollie=W('caught', 'ollie'), winsO=W('caught', 'wins', 1), raceC=W('caught', 'race'), quinnC=W('caught', 'quinn'), internet=W('caught', 'internet'),
    even=W('team', 'even'), good=W('team', 'good'),
    meanwhile=W('pivot', 'meanwhile'), twenty=W('pivot', 'twenty'), handwritten=W('pivot', 'handwritten'), due=W('pivot', 'due'), midnight=W('pivot', 'midnight'),
    so=W('scribe', 'so'), quinnS=W('scribe', 'quinn'), snap=W('scribe', 'snap'), photo=W('scribe', 'photo'), scribe=W('scribe', 'scribe'), solves=W('scribe', 'solves'), in_=W('scribe', 'in'), too=W('scribe', 'too'),
    your=W('end', 'your'), dives=W('end', 'dives'), mistake=W('end', 'mistake'), misses=W('end', 'misses'), stillE=W('end', 'still'), though=W('end', 'though'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['though'] + 0.5
STACK_HIT = t['twenty'] + 0.22
TLAUNCH, TLAND = t['mistake'] - 0.12, t['misses']
APLUS = t['stillE'] - 0.5
DONE = t['too'] + 0.16                     # the app's page is finished → Done. 20/20 · Download PDF
NIGHT0, CLASS0 = t['meanwhile'], t['your']

# ---------------------------------------------------------------- music: a game-lobby bounce, 140 bpm, C major (night run: Am–F–C–G)
BPM = 140
BEAT = 60 / BPM
IN = t['sunday'] - 0.02
TENSE0, TENSE1 = NIGHT0 - 0.05, t['so'] - 0.05
chords, cur = [], IN
while cur < D - 0.8:
    seq = ['Am', 'F', 'C', 'G'] if TENSE0 - 0.6 <= cur < TENSE1 - 0.6 else ['C', 'G', 'Am', 'F']
    for sym in seq:
        if cur >= D - 0.8: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'C'])
VEL = [[IN, 0.24], [t['quinnL'], 0.27], [TENSE0, 0.18], [TENSE1, 0.26], [ENDCARD, 0.24], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "ostinato", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 4, 2, 1, 3], "vel": VEL, "bass_every": 4, "bass_vel": 0.7, "len": 0.75}]
mallet = []
for a in [t['forty'], t['fortyfive'], t['midfield']]:            # a rising two-note "yard call" lift
    mallet += [[round(a + 0.02, 3), 76, 0.28, 0.12], [round(a + 0.1, 3), 83, 0.3, 0.22]]
for a, nn in [(t['winsO'] + 0.05, [72, 76, 79, 84]), (t['internet'], [76, 79, 84, 88])]:
    mallet += [[round(a + k * 0.07, 3), n, 0.3, 0.25] for k, n in enumerate(nn)]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [36, 48, 55, 60, 64], "level": 0.5, "attack": 0.4, "release": 0.8, "cutoff": 900, "hp": 30},
       {"t0": 0.05, "t1": IN + 0.3, "notes": [48, 55, 60, 64], "level": 1.4, "attack": 0.5, "release": 0.4, "cutoff": 800, "hp": 30}]   # a riser under the hook
drums = [[round(b, 3), 0.34, "boom"] for b in [IN, t['quinnL'], t['midfield'], t['miss1'], t['miss2'], t['grab'], NIGHT0, t['scribe'], TLAND]]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.18 + 0.05 * k, "tick"] for k in range(4)]
END_D = D - 0.6
drum_patterns = [{"t0": 0.1, "t1": IN - BEAT, "step": BEAT / 4, "pattern": [0.5, 0.25, 0.8, 0.3], "vel": [[0.1, 0.12], [IN, 0.24]], "kind": "tick"},
                 {"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.38], [TENSE0, 0.26], [TENSE1, 0.4], [D, 0.34]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.24], [TENSE0, 0.15], [TENSE1, 0.26], [D, 0.22]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[IN, 0.26], [TENSE0, 0.18], [TENSE1, 0.28], [D, 0.26]], "kind": "tick"}]
music = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -1.0, "drums_db": -5.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=6.0, gain=-24, p0=0.0, p1=0.0):
    if b > a + 0.15: ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})
def oof(tt, pan=0.0, g=0.0):
    """our own 'oof': a padded thud + a bonk + plastic bits clattering + a pop for the burst"""
    e(tt, "giant_step", -12 + g, pan, size=0.55); e(tt + 0.01, "bonk", -15 + g, pan, dur=0.45)
    for k in range(7): e(tt + 0.05 + k * 0.045, "knock", -21 - (k % 3) * 2 + g, pan - 0.4 + 0.13 * k, pitch=1.2 + 0.12 * (k % 4))
    e(tt + 0.03, "pop", -18 + g, pan, pitch=0.9)

# HOOK: the start line — a happy yip, the crowd murmur
e(0.5, "dog_bark", -24, 0.1, pitch=1.6); e(t['job'] + 0.05, "dog_bark", -26, -0.2, pitch=1.75)
e(t['straight'] - 0.1, "flash_swish", -22, 0.0, dur=0.6, peak=0.5)
# RACE: gate clunk + the start, little paws, she stops; "not" → she bolts
e(t['race'] + 0.02, "clunk", -16, 0.0); e(t['race'] + 0.04, "boing", -24, 0.0, pitch=1.3, dur=0.35)
steps(t['race'] + 0.05, t['quinn'], 11.0, -30, -0.2, 0.2)
e(t['quinn'] + 0.05, "plush_squeak", -26, 0.0, pitch=1.4)
e(t['absolutely'] + 0.25, "dog_bark", -22, 0.0, pitch=1.5)
e(t['not_'] + 0.05, "flash_swish", -15, 0.4, dur=0.35, peak=0.9)
# LOOSE: she flies; paws; whooshes past the lens on each yard call
steps(t['quinnL'], t['handlers'], 12.0, -29, 0.3, -0.3)
for a in [t['forty'], t['fortyfive']]: e(a - 0.05, "flash_swish", -20, 0.0, dur=0.3, peak=0.6)
# DIVES: launch swish → oof
for d0, d1, p in [(t['dive1'], t['miss1'], -0.2), (t['dive2'], t['miss2'], 0.2)]:
    e(d0, "flash_swish", -16, p, dur=0.4, peak=0.8); oof(d1, p)
    e(d1 + 0.25, "dog_bark", -24, -p, pitch=1.7)
# DELAY: the jumbotron flips; she zooms past the players' legs
e(t['delayed'] - 0.02, "lamp_switch_click", -16, -0.2); e(t['delayed'], "low_swell", -20, 0.0, dur=0.8, pitch=0.7)
e(t['by'] + 0.55, "flash_swish", -13, 0.5, dur=0.45, peak=1.0); steps(t['by'], t['they'], 13.0, -26, -0.5, 0.6)
# CAUGHT: the dive that lands, the ribbon, the crown, the lift
e(t['grab'] - 0.36, "flash_swish", -17, 0.2, dur=0.35, peak=0.7)
e(t['grab'], "giant_step", -13, 0.0, size=0.5); e(t['grab'] + 0.02, "blanket_rustle", -20, 0.0, dur=0.5, intensity=0.8); e(t['grab'] + 0.06, "pop", -18, 0.0, pitch=1.1)
e(t['grab'] + 0.5, "dog_bark", -22, 0.0, pitch=1.6)
e(t['winsO'] + 0.02, "wood_snap", -20, 0.2, size=0.25)
for k in range(9): e(t['winsO'] + 0.05 + k * 0.05, "pop", -22 - (k % 3), -0.6 + 0.15 * k, pitch=1.2 + 0.1 * (k % 4))
e(t['raceC'], "gold_chime", -17, 0.2, notes=[84, 88, 91], spacing=0.06, vel=0.4)
e(t['quinnC'] + 0.1, "boing", -21, 0.0, pitch=1.1, dur=0.4)
for k in range(10): e(t['internet'] - 0.05 + k * 0.045, "pop", -22 - (k % 3), -0.7 + 0.15 * k, pitch=1.3 + 0.1 * (k % 4))
# TEAM: a phone, the like
e(t['even'] + 0.05, "phone_buzz", -24, 0.1)
e(t['good'], "pop", -15, 0.0, pitch=1.35); e(t['good'] + 0.02, "gold_chime", -21, 0.0, notes=[88, 93], spacing=0.05, vel=0.3)
# PIVOT: hard cut to night — the stack, the stamp, the clock
e(STACK_HIT - 0.18, "flash_swish", -20, 0.0, dur=0.25, peak=0.5); e(STACK_HIT, "giant_step", -11, 0.0, size=0.7); e(STACK_HIT + 0.02, "blanket_rustle", -19, 0.0, dur=0.6, intensity=0.9)
e(t['handwritten'] + 0.05, "knock", -12, 0.0, pitch=0.6); e(t['handwritten'] + 0.06, "giant_step", -16, 0.0, size=0.45)
e(t['midnight'] + 0.25, "counter_tick", -18, 0.0)
# SCRIBE: dog ears, the photo, the app, the pen
e(t['quinnS'] - 0.02, "boing", -18, 0.0, pitch=1.4, dur=0.4); e(t['quinnS'] + 0.1, "dog_bark", -24, 0.0, pitch=1.9)
e(t['photo'] - 0.03, "shutter", -14, 0.1); e(t['photo'], "flash_swish", -19, 0.1, dur=0.25, peak=0.6)
e(t['scribe'] + 0.02, "gold_chime", -15, 0.2, notes=[76, 83, 88], spacing=0.08, vel=0.45)
for k in range(12): e(t['solves'] + k * (t['in_'] - 0.2 - t['solves']) / 12, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 5), dur=0.07)
e(t['in_'] - 0.18, "gold_chime", -16, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.45)
k = 0
while t['in_'] + k * 0.55 < DONE - 0.3:
    e(t['in_'] + k * 0.55, "pen_scribble", -15, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
e(DONE, "pop", -20, 0.2, pitch=1.3); e(DONE + 0.02, "gold_chime", -18, 0.2, notes=[84, 91], spacing=0.06, vel=0.35)
# END: the teacher's dive, oof, A+, end card
e(t['dives'], "breath", -18, 0.0, dur=0.4, inhale=True)
e(TLAUNCH, "flash_swish", -15, 0.0, dur=0.5, peak=0.9); oof(TLAND, 0.0, 1.0)
e(APLUS, "knock", -14, 0.2, pitch=1.0); e(APLUS + 0.02, "gold_chime", -14, 0.2, notes=[79, 84, 88, 91, 96], spacing=0.06, vel=0.5, shimmer=0.4, dur=1.4)
e(t['stillE'] + 0.35, "boing", -22, 0.0, pitch=1.2, dur=0.35)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[72, 76, 79, 84], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

def crowd(a, b, gain, excite, seed, fi=0.08, fo=0.15):
    return {"sound": "crowd_cheer", "t0": round(a, 3), "t1": round(b, 3), "fade_in": fi, "fade_out": fo, "gain_db": gain, "args": {"excite": excite}, "seed": seed}
amb = [
    crowd(0.0, t['race'], -28, 0.5, 1, fi=0.3),
    crowd(t['race'], t['quinnL'], -25, 0.9, 2),
    crowd(t['quinnL'], t['grab'], -22, 1.2, 3),
    crowd(t['grab'], t['even'], -18, 1.5, 4),
    crowd(t['even'], NIGHT0, -27, 0.8, 5, fo=0.05),
    {"sound": "crickets", "t0": NIGHT0, "t1": CLASS0, "fade_in": 0.05, "fade_out": 0.1, "gain_db": -30, "seed": 6},
    {"sound": "room_tone", "t0": NIGHT0, "t1": D, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -33, "seed": 7},
    {"sound": "clock", "t0": NIGHT0 + 0.3, "t1": t['so'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -27, "pan": -0.2, "seed": 8},
    {"sound": "applause", "t0": APLUS + 0.2, "t1": D, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -27, "seed": 9},
]

cues = {
    "title": "069 - Scribe promo: the runaway corgi (blocky game look; 140 bpm lobby bounce + stadium crowd + toy foley + Slax)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -12.0, "sfx": 3.0, "amb": 4.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -7.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
