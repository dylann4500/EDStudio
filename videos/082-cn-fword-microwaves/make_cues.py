#!/usr/bin/env python3
"""Cue sheet for 082 (Scribe promo, "How f*cking microwaves f*cking work") -> cues.json.
    python3 -I videos/082-cn-fword-microwaves/make_cues.py && python3 -I audio/synth.py 082-cn-fword-microwaves

Every time comes from story.json (the narration's word times) with the SAME formulas as shots.js, so a re-voice keeps every sound on
its picture.

Music (Nov 10, user via the manager): the user's own TIKI TIKI phonk (slowed), tools/presets.json "phonk" — ONLY for the accent-narrator
reels; the synth score below is kept for reference but not used. Mix: the track ~14 dB under the voice while he talks (stem −13 dB), voice duck −6 dB.
Sound identity: "DEADPAN EXPLAINER, 3 AM DORM EDITION" — the voice and the foley carry it (user, Nov 8: the no-music cut is what gets
posted under a trending sound). The microwave's own hum is the bed under every microwave shot (a lamp-hum drone + the cooling fan in
the magnetron bay), the dorm has its night room tone, 1945 a ticking clock. Music: a small, bouncy pluck ostinato in G (G–D–Em–C,
132 bpm — not 062's F loop) with a soft kick, a dance clap on 2 + 4 and felt hats, a warm pad under it (keeps the bed continuous),
~13 dB under the voice; it enters on the second line (the hook is spoken over the hum alone) and thins to E minor + sparse drums for
the homework → "microwaved" stretch, then Scribe lifts it back. Foley on every gag: the magnetron's zap, the molecule pop + boing,
whoosh flips, the heat sizzle, the burrito split, the lava SIZZLE and the frozen CRUNCH (glass crack + crumble), the plate whirr, a
fork tap → crackle → LIGHTNING (zap + boom), the candy bar's drip, the stack slam + stamp, Scribe's chime + shutter + scan beeps + pen,
the microwave's three BEEPs, the last crunch, the end card chime. All soft + low-passed."""
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
    microwaves=W('hook', 'microwaves'), work=W('hook', 'work'),
    a1=W('mag', 'a'), magnetron=W('mag', 'magnetron'), fires=W('mag', 'fires'), into=W('mag', 'into'), box=W('mag', 'box'),
    water1=W('water', 'water'), magnet=W('water', 'magnet'),
    the1=W('spin', 'the'), field=W('spin', 'field'), flips=W('spin', 'flips'), so1=W('spin', 'so'), spins1=W('spin', 'spins'), spinning=W('spin', 'spinning'), heat=W('spin', 'heat'),
    but=W('deep', 'but'), inch=W('deep', 'inch'), outside=W('deep', 'outside'), lava=W('deep', 'lava'), middle=W('deep', 'middle'), frozen1=W('deep', 'frozen'),
    waves=W('spots', 'waves'), cold=W('spots', 'cold'), so2=W('spots', 'so'), spins2=W('spots', 'spins'),
    fork=W('fork', 'fork'), charge=W('fork', 'charge'), points=W('fork', 'points'), f8=W('fork', 'fucking'), lightning=W('fork', 'lightning'),
    invented=W('history', 'invented'), candy=W('history', 'candy'), melted=W('history', 'melted'), pocket=W('history', 'pocket'),
    now=W('teacher', 'now'), homework1=W('teacher', 'homework'), draw=W('teacher', 'draw'), by=W('teacher', 'by'), hand1=W('teacher', 'hand'),
    you=W('cooked', 'you'), microwaved=W('cooked', 'microwaved'),
    so3=W('scribe', 'so'), open_=W('scribe', 'open'), scribe=W('scribe', 'scribe'), one=W('scribe', 'one'), photo=W('scribe', 'photo'), it1=W('scribe', 'it'), sheet=W('scribe', 'sheet'),
    it2=W('hand', 'it'), bent=W('hand', 'bent'), two=W('hand', 'two'), does=W('hand', 'does'), math=W('hand', 'math'), all_=W('hand', 'all'), handwriting=W('hand', 'handwriting'),
    homework2=W('end', 'homework'), done=W('end', 'done'), burrito=W('end', 'burrito'), frozen2=W('end', 'frozen'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ENDCARD = t['frozen2'] + 0.6
HEAT0 = t['heat'] - 0.12
SPLIT = t['but'] + 0.1
BITE1, BITE2 = t['outside'] + 0.25, t['frozen1'] - 0.05
ZAP = t['lightning'] - 0.08
SLAM, STAMP = t['homework1'] + 0.05, t['hand1'] + 0.04
PHOTO, SOLVE0, SOLVE1 = t['photo'] + 0.04, t['it1'] + 0.02, t['sheet'] + 0.3
WRITE0, WRITE1 = t['it2'] - 0.08, t['handwriting'] + 0.25

# ---------------------------------------------------------------- music: a small bouncy pluck bed, 132 bpm, G major
BPM = 132
BEAT = 60 / BPM
IN = t['a1'] - 0.02
TENSE0, TENSE1 = t['now'] - 0.1, t['so3'] - 0.1
chords, cur = [], IN
while cur < D - 1.0:
    seq = ['Em', 'C', 'G', 'D'] if TENSE0 - 0.5 <= cur < TENSE1 - 0.5 else ['G', 'D', 'Em', 'C']
    for sym in seq:
        if cur >= D - 1.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
chords.append([round(cur, 3), 'G'])
VEL = [[IN, 0.2], [t['spins1'], 0.24], [TENSE0, 0.17], [TENSE1, 0.25], [t['done'], 0.27], [ENDCARD, 0.23], [D, 0.2]]
sections = [{"t0": IN, "t1": D, "style": "ostinato", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 4, 2, 1, 3], "vel": VEL, "bass_every": 4, "bass_vel": 0.7, "len": 0.7}]
mallet = []
for c in story['callouts']:                                  # a two-note lift on every label, a rising "ta-da" on TERM callouts
    a = c['t0'] + 0.02
    if a < IN - 0.1: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 79, 0.3, 0.16], [round(a + 0.08, 3), 83, 0.3, 0.16], [round(a + 0.16, 3), 86, 0.34, 0.36]]
    elif c['style'] == 'label':
        mallet += [[round(a, 3), 74, 0.26, 0.14], [round(a + 0.09, 3), 79, 0.28, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 76, 0.26, 0.12], [round(a + 0.11, 3), 67, 0.26, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [43, 55, 59, 62, 67], "level": 0.5, "attack": 0.4, "release": 0.8, "cutoff": 850, "hp": 30}]
drums = [[round(b, 3), 0.32, "boom"] for b in [IN, t['heat'], ZAP, SLAM, t['microwaved'], t['done']]]
drums += [[round(IN - BEAT + k * BEAT / 4, 3), 0.16 + 0.05 * k, "tick"] for k in range(4)]   # a little hat pickup into the groove
END_D = D - 0.6
drum_patterns = [{"t0": IN, "t1": END_D, "step": BEAT, "pattern": [1], "vel": [[IN, 0.34], [TENSE0, 0.24], [TENSE1, 0.36], [D, 0.3]], "kind": "kick"},
                 {"t0": IN + BEAT, "t1": END_D, "step": 2 * BEAT, "pattern": [1], "vel": [[IN, 0.2], [TENSE0, 0.13], [TENSE1, 0.22], [D, 0.2]], "kind": "clap"},
                 {"t0": IN, "t1": END_D, "step": BEAT / 4, "pattern": [0.4, 0.2, 0.7, 0.25], "vel": [[IN, 0.24], [TENSE0, 0.16], [TENSE1, 0.26], [D, 0.24]], "kind": "tick"}]
score = {"gain_db": 0.0, "reverb_db": -13.0, "pad_db": 3.0, "pad_reverb_db": -6.0, "mallet_db": -1.0, "drums_db": -6.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}   # the synth score (unused since Nov 10)
# Nov 10 (user, via the manager): the accent-narrator reels run on the user's own TIKI TIKI phonk (slowed) instead of a synth score —
# tools/presets.json "phonk" (the file lives in the gitignored exports/music/, never committed). Foley + impacts stay in the sfx stem.
music = {"preset": "phonk", "end": D}

# ---------------------------------------------------------------- foley
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)

# HOOK: the hum is the bed; a soft swell under the question
e(0.05, "low_swell", -22, 0.0, dur=1.4, pitch=0.8)
# MAG: the magnetron fires, the waves hit the metal box
e(t['magnetron'] - 0.05, "zap", -21, 0.3, dur=0.35)
e(t['fires'], "low_swell", -18, 0.2, dur=0.9, pitch=1.3); e(t['fires'] + 0.02, "zap", -19, 0.2, dur=0.5)
e(t['box'] + 0.05, "metal_clang", -19, 0.0, size=0.5, pitch=1.2, dur=0.6)
# WATER: the molecule pops in, the charges boing on
e(t['water1'] - 0.03, "pop", -16, 0.0, pitch=0.9); e(t['magnet'] - 0.05, "boing", -17, 0.0, pitch=1.1, dur=0.45)
# SPIN: whoosh flips, faster and faster, then the heat
for k in range(7):
    e(t['flips'] + k * 0.32 * (0.9 ** k), "flash_swish", -23 - (k % 2), -0.4 + 0.13 * k, dur=0.2, peak=0.5)
for k in range(8):
    e(t['so1'] + 0.05 + k * 0.11, "knock", -26, -0.3 + 0.08 * k, pitch=1.4 + 0.05 * (k % 3))
e(HEAT0, "sizzle", -16, 0.0, dur=1.0); e(t['heat'] + 0.02, "whoomp", -17, 0.0, size=0.5)
# DEEP: the burrito splits, steam; the two bites
e(SPLIT, "crumble", -18, 0.0, dur=0.5, size=0.4); e(SPLIT + 0.1, "hiss", -22, 0.0, dur=0.7)
e(BITE1 - 0.02, "crumble", -19, 0.1, dur=0.3, size=0.3); e(t['lava'] - 0.05, "sizzle", -14, 0.2, dur=0.8); e(t['lava'], "whoomp", -18, 0.2, size=0.4)
e(t['lava'] + 0.1, "whimper", -19, 0.1, pitch=1.4, dur=0.4)
e(BITE2, "glass_crack", -14, -0.2, dur=0.6, n_pings=4); e(BITE2 + 0.02, "crumble", -16, -0.2, dur=0.5, size=0.5)
e(BITE2 + 0.2, "whimper", -20, -0.1, pitch=1.1, dur=0.4)
# SPOTS: the plate whirrs faster
e(t['so2'] + 0.1, "low_swell", -20, 0.0, dur=1.0, pitch=1.5); e(t['spins2'], "flash_swish", -18, 0.3, dur=0.5, peak=0.7)
# FORK: a tap, the charge crackles, LIGHTNING
e(t['fork'] + 0.1, "metal_clang", -24, 0.3, size=0.15, pitch=2.2, dur=0.3)
for k in range(4): e(t['charge'] + 0.15 + k * 0.17, "zap", -24 + k, 0.1 * k, dur=0.25)
e(ZAP, "zap", -12, 0.0, dur=0.9); e(ZAP + 0.02, "distant_boom", -16, 0.0, dur=2.0, size=0.6); e(ZAP + 0.05, "whoomp", -16, 0.0, size=0.7)
e(ZAP + 0.25, "glass_crack", -22, 0.3, dur=0.5, n_pings=3)
# 1945: the bar drips
e(t['melted'] + 0.05, "sizzle", -24, 0.2, dur=0.6)
for k in range(3): e(t['melted'] + 0.4 + k * 0.32, "plip", -20, 0.2, pitch=0.8 + 0.1 * k)
e(t['pocket'] + 0.02, "boing", -19, 0.0, pitch=0.8, dur=0.4)
# TEACHER: the stack slams onto the microwave, the stamp
e(t['now'], "flash_swish", -21, 0.2, dur=0.3, peak=0.5)
e(SLAM, "giant_step", -11, 0.1, size=0.7); e(SLAM + 0.01, "wood_snap", -17, 0.1, size=0.4); e(SLAM + 0.05, "blanket_rustle", -21, 0.1, dur=0.5, intensity=0.9)
e(STAMP, "knock", -12, 0.0, pitch=0.6); e(STAMP + 0.01, "giant_step", -15, 0.0, size=0.5)
# COOKED: spinning in the microwave
e(t['you'], "low_swell", -18, 0.0, dur=1.2, pitch=1.2); e(t['microwaved'], "sizzle", -15, 0.0, dur=0.9); e(t['microwaved'] + 0.05, "whimper", -18, 0.0, pitch=1.2, dur=0.5)
# SCRIBE: open, the shutter, scan beeps, solved
e(t['open_'] + 0.05, "gold_chime", -15, 0.2, notes=[79, 86, 91], spacing=0.08, vel=0.45)
e(PHOTO - 0.02, "shutter", -13, 0.1); e(PHOTO, "flash_swish", -18, 0.1, dur=0.25, peak=0.6)
for k in range(6): e(SOLVE0 + k * (SOLVE1 - SOLVE0) / 6, "scan_beep", -22, 0.2, pitch=1.4 + 0.05 * (k % 3), dur=0.07)
e(SOLVE1, "gold_chime", -16, 0.2, notes=[86, 91, 95, 98], spacing=0.05, vel=0.45)
# HAND: the pen on screen; a soft pop when the Lewis structure, "bent" and the answers land
k = 0
while WRITE0 + k * 0.55 < WRITE1 - 0.1:
    e(WRITE0 + k * 0.55, "pen_scribble", -16, -0.1 + 0.05 * (k % 3), dur=0.6); k += 1
for i, w in enumerate([t['bent'] - 0.05, t['two'], t['math'] + 0.35]): e(w, "pop", -20, -0.2 + 0.2 * i, pitch=1.0 + 0.1 * i)
# END: homework done (the microwave beeps), the last crunch, the end card
e(t['done'], "gold_chime", -15, 0.0, notes=[79, 83, 86, 91], spacing=0.05, vel=0.45)
e(t['done'] + 0.25, "alarm_beep", -17, 0.4, dur=1.0, n=3, pitch=1.25)
e(t['frozen2'] - 0.06, "glass_crack", -13, 0.0, dur=0.6, n_pings=5); e(t['frozen2'] - 0.04, "crumble", -15, 0.0, dur=0.5, size=0.5)
e(ENDCARD, "gold_chime", -14, 0.0, notes=[74, 79, 83, 86], spacing=0.07, vel=0.5, shimmer=0.3, dur=2.6)

# places: the microwave's hum (+ the bay's fan in the cutaways), the dorm's night room tone, 1945's clock
WAV0, WAV1 = 0.0, t['outside']
amb = [
    {"sound": "lamp_hum", "t0": 0.0, "t1": t['outside'], "fade_in": 0.05, "fade_out": 0.1, "gain_db": -22, "seed": 1},
    {"sound": "fan", "t0": t['a1'], "t1": t['water1'], "fade_in": 0.1, "fade_out": 0.1, "gain_db": -27, "args": {"rate": 14.0}, "seed": 2},
    {"sound": "room_tone", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -31, "seed": 3},
    {"sound": "lamp_hum", "t0": t['waves'], "t1": t['lightning'], "fade_in": 0.05, "fade_out": 0.05, "gain_db": -23, "seed": 4},
    {"sound": "crickets", "t0": t['outside'], "t1": t['invented'], "fade_in": 0.2, "fade_out": 0.1, "gain_db": -33, "seed": 5},
    {"sound": "clock", "t0": t['invented'], "t1": t['now'], "fade_in": 0.05, "fade_out": 0.05, "gain_db": -24, "args": {"rate": 1.0}, "seed": 6},
    {"sound": "crickets", "t0": t['now'], "t1": D, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -34, "seed": 7},
    {"sound": "lamp_hum", "t0": t['you'], "t1": t['so3'], "fade_in": 0.05, "fade_out": 0.05, "gain_db": -20, "seed": 8},
]

cues = {
    "title": "082 - Scribe promo: how f*cking microwaves f*cking work (the user's tiki phonk bed + microwave hum + gag foley + the 'chinese' narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -13.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -9.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -6.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
