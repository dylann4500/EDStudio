#!/usr/bin/env python3
"""Cue sheet for 026 (build genre) -> cues.json.   python3 -I videos/026-garage-car-factory/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 026-garage-car-factory

Sound identity: "FACTORY HOUSE" — an octave-bouncing bass in 8ths + off-beat chord stabs (the synth.py "disco" style: a machine
pulse) on the soft synth pluck in B-flat at 126 bpm (I–vi–IV–V), a low factory hum bed under everything once the hall exists, a light taiko pulse, booms on the big impacts,
and the build genre's signature rising mallet "ta-da" on every TERM callout (here D5–F5–Bb5). 024 was a marimba ostinato in F;
this one pumps like a press line (a walking-bass version left 50–100 ms gaps under the ducked voice). The hook is foley only (the tow truck idling, the invoice); the music drops in on "Congratulations". The narrator
sits on top: music ducks ~9 dB under every phrase, ambience ~5 dB. All foley soft + low-passed (audio/synth.py §6b)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


s1 = lambda b: B[b]['t1']
t = dict(
    n900=W('hook', '900'), fix=W('hook', 'fix'), soH=W('hook', 'so'), newH=W('hook', 'new'), garage=W('hook', 'garage'),
    congrats=W('congrats', 'congratulations'), three=W('congrats', 'three'), mower=W('congrats', 'lawnmower'), engine=W('congrats', 'engine'), horn=W('congrats', 'horn'), garyC=W('congrats', 'gary'),
    now=W('queue', 'now'), everyone=W('queue', 'everyone'), builds=W('queue', 'builds'), alone=W('queue', 'alone'), roll=W('line', 'roll'), stations=W('line', 'stations'),
    n12=W('line', '12'), minutes=W('line', 'minutes'), pulls=W('line', 'pulls'), rope=W('line', 'rope'), promoted=W('line', 'promoted'),
    but=W('fits', 'but'), fits=W('fits', 'fits'), hammering=W('fits', 'hammering'), soP=W('parts', 'so'), make=W('parts', 'make'), exactly=W('parts', 'exactly'), alike=W('parts', 'alike'), inter=W('parts', 'interchangeable'), partsW=W('parts', 'parts'),
    mixed=W('parts', 'mixed'), pile=W('parts', 'pile'), rebuilt=W('parts', 'rebuilt'), three2=W('parts', 'three', 2), pile2=W('parts', 'pile', 2), hood=W('parts', 'hood'),
    garys=W('robots', 'garys'), bolt=W('robots', 'bolt'), day=W('robots', 'day'), asleep=W('robots', 'asleep'), up=W('robots', 'up'), robot=W('robots', 'robot'), arms=W('robots', 'arms'), buy=W('robots', 'buy'), soR=W('robots', 'so'), never=W('robots', 'never'),
    welded=W('robots', 'welded'), garyW=W('robots', 'gary'), doorW=W('robots', 'door'),
    thenE=W('ecoat', 'then'), carsE=W('ecoat', 'cars'), rusts=W('ecoat', 'rusting'), rain=W('ecoat', 'rain'), soE=W('ecoat', 'so'), dip=W('ecoat', 'dip'), body=W('ecoat', 'body'), electrified=W('ecoat', 'electrified'), seals=W('ecoat', 'seals'),
    crack=W('ecoat', 'crack'), ecoating=W('ecoat', 'ecoating'), garyE=W('ecoat', 'gary'), doorE=W('ecoat', 'door'), rustproof=W('ecoat', 'rustproof'),
    n30000=W('jit', '30000'), allJ=W('jit', 'all'), once=W('jit', 'once'), buried=W('jit', 'buried'), soJ=W('jit', 'so'), arrives=W('jit', 'arrives'), needed=W('jit', 'needed'),
    jitW=W('jit', 'justintime'), toyota=W('jit', 'toyota'), roombaJ=W('jit', 'roomba'), manager=W('jit', 'manager'),
    safe=W('crash', 'safe'), crashW=W('crash', 'crash'), wall=W('crash', 'wall'), dummy=W('crash', 'dummy'), fine=W('crash', 'fine'), notX=W('crash', 'not'),
    soX=W('crumple', 'so'), front=W('crumple', 'front'), fold=W('crumple', 'fold'), can=W('crumple', 'can'), crumple=W('crumple', 'crumple'), zone=W('crumple', 'zone'), garyX3=W('crumple', 'gary'), walks=W('crumple', 'walks'), away=W('crumple', 'away'), off=W('crumple', 'off'),
    thenQ=W('qc', 'then'), carQ=W('qc', 'car'), ships=W('qc', 'ships'), inside=W('qc', 'inside'), soQ=W('qc', 'so'), check=W('qc', 'check'), endQ=W('qc', 'end'), quality=W('qc', 'quality'), inspector=W('qc', 'inspector'), rejects=W('qc', 'rejects'), twice=W('qc', 'twice'),
    vending=W('finish', 'vending'), meatloaf=W('finish', 'meatloaf'), test=W('finish', 'test'), track=W('finish', 'track'), parking=W('finish', 'parking'), town=W('finish', 'town'),
    end=W('end', 'congratulations'), factory=W('end', 'factory'), didnt=W('end', 'didnt'), pay=W('end', 'pay'), n76=W('end', '76'), billion=W('end', 'billion'), makeE=W('end', 'make'), n53=W('end', '53'),
    dollars2=W('end', 'dollars'), garyEnd=W('end', 'gary'), roombaE=W('end', 'roomba'), shop=W('end', 'shop'), mechanicE=W('end', 'mechanic'), n1400=W('end', '1400'))

# ---- derived times + the line: SAME formulas as shots.js (keep them in sync)
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
lerp = lambda a, b, u: a + (b - a) * u
u01 = lambda tt, a, b: clamp((tt - a) / (b - a))
smooth = lambda u: (lambda v: v * v * (3 - 2 * v))(clamp(u))
LX0, P, HOLD = -4.4, 4.6, 23.4 + 4.4
SEG = [(t['roll'], t['promoted'] + 0.4, 0, HOLD), (t['garys'] - 0.05, t['garys'] + 0.95, HOLD, HOLD + P), (t['bolt'] + 0.05, t['day'] + 0.35, HOLD + P, HOLD + 2 * P),
       (t['doorW'] + 0.1, t['soE'] + 0.1, HOLD + 2 * P, HOLD + 2 * P + 6.35), (t['rustproof'] + 0.4, t['thenQ'] - 0.3, HOLD + 2 * P + 6.35, HOLD + 4 * P + 6.35)]
_s5 = SEG[-1][3]; _sQ = _s5 + P; _xg = 45.0
_best = max(LX0 + _sQ - k * P for k in range(60) if LX0 + _sQ - k * P < _xg); _s7 = _sQ + (_xg - _best)
SEG += [(t['carQ'] - 0.3, t['inside'] + 0.4, _s5, _sQ), (t['check'] - 0.1, t['endQ'] + 0.3, _sQ, _s7), (t['n53'] - 0.8, D + 1, _s7, _s7 + 40)]
def lineS(tt):
    s = 0
    for i, (a, b, s0, s1_) in enumerate(SEG):
        if tt <= a: return s
        s = s1_
        if tt < b:
            u = (tt - a) / (b - a)
            return lerp(s0, s1_, u * u * 0.4 + u * 0.6 if i == len(SEG) - 1 else smooth(u))
    return s
def crossT(k, x):
    tt = t['roll']
    while tt < D:
        if LX0 + lineS(tt) - k * P >= x: return tt
        tt += 0.01
    return None
PILE_IN, PILE_AT, PILE_OUT, PILE_BACK = t['mixed'], t['pile'] - 0.05, t['rebuilt'] - 0.05, t['three2'] + 0.1
ORN, WELD = t['hood'] - 0.25, t['welded']
PIT0, LIFT0, DIP0, OUT0, OUT1, SET1 = t['dip'] - 0.15, t['dip'] + 0.2, t['body'] + 0.05, t['garyE'] - 0.05, t['doorE'] - 0.05, t['rustproof'] - 0.15
AVA0, DRAIN0, DRAIN1 = t['allJ'], t['soJ'] + 0.05, t['needed'] - 0.2
L1, HIT1 = t['crashW'], t['wall']; L2 = max(t['can'] + 0.7, t['crumple'] - 0.5); HIT2 = max(t['crumple'] + 0.05, L2 + 0.35); BAG = t['off'] - 0.08
LANDQ, HOPQ, STAMP, STAMP2 = t['ships'] + 0.25, t['soQ'] - 0.1, t['rejects'], t['twice']
EP_desk = t['n53'] + 0.1

# ---------------------------------------------------------------- music
BPM = 126
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur, cyc = [], IN, 0
progs = [['Bb', 'Gm', 'Eb', 'F'], ['Gm', 'Eb', 'Bb', 'F']]
while cur < D - 2.0:
    seq = progs[(cyc // 2) % 2] if cur < t['end'] else ['Eb', 'F', 'Bb', 'Bb']
    for sym in seq:
        if cur >= D - 2.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'Bb'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2, "vel": [[IN, 0.3], [t['roll'], 0.34], [t['end'], 0.38], [D, 0.34]],
             "bass_hold": 1.0, "stab_vel": 0.4, "stab_hold": 0.9}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue                                      # the hook is foley only (the music enters on "Congratulations")
    if c['style'] == 'term':
        mallet += [[round(a, 3), 74, 0.36, 0.18], [round(a + 0.09, 3), 77, 0.36, 0.18], [round(a + 0.18, 3), 82, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 70, 0.3, 0.16], [round(a + 0.1, 3), 77, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 70, 0.3, 0.14], [round(a + 0.12, 3), 65, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [34, 46, 53, 58, 62], "level": 0.38, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, t['roll'] + 0.3, t['make'] + 0.84, PILE_AT, t['robot'] + 0.32, PIT0 + 0.1, AVA0 + 0.2, HIT1, HIT2, BAG, t['parking'] + 0.2, t['end']]
drums = [[round(b, 3), 0.42, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.5, 0], "vel": 0.1, "kind": "taiko"}]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": -2.5, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
# hook: the invoice unrolls, Gary's jaw drops, the tow truck pulls away with your car
e(t['n900'] - 0.15, "blanket_rustle", -18, 0.3, dur=0.5, intensity=0.8); e(t['n900'] + 0.1, "plush_squeak", -20, -0.3, pitch=0.8)
e(t['fix'], "knock", -22, 0.3, pitch=1.2)
e(t['soH'] + 0.2, "car_pass", -16, 0.5, dur=1.8, size=1.1); e(t['soH'] + 0.1, "metal_groan", -24, 0.5, dur=0.6, pitch=1.4)
ev.append({"t0": t['soH'] + 0.1, "t1": t['garage'] + 0.2, "sound": "footsteps", "rate": 6.0, "gain_db": -24, "pan0": 0.2, "pan1": -0.3})
# the junk car pops together
e(t['newH'] - 0.1, "pop", -13, -0.1, pitch=0.8); e(t['newH'] + 0.05, "knock", -18, -0.1, pitch=0.9)
for i in range(3): e(t['garage'] - 0.1 + i * 0.1, "pop", -18, -0.2 + 0.2 * i, pitch=1.2 + 0.15 * i)
e(t['garage'] + 0.3, "clunk", -16, -0.3, size=0.7, metal=0.7); e(t['congrats'] - 0.1, "clunk", -15, -0.1, size=0.8, metal=0.6)
for k in range(5): e(t['newH'] + 0.2 + k * 0.17, "knock", -20, 0.1, pitch=1.1)
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -16, 0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -24, 0.2, dur=1.4, intensity=0.6)
e(t['three'] + 0.05, "metal_groan", -22, -0.1, dur=0.5, pitch=1.6)
e(t['mower'] + 0.05, "blanket_rustle", -20, -0.2, dur=0.3, intensity=0.9); e(t['engine'] - 0.05, "pop", -18, -0.2, pitch=0.7)
e(t['horn'] - 0.15, "plush_squeak", -18, 0.0, pitch=1.5); e(t['garyC'], "car_horn", -14, 0.0, pitch=1.35, distance=0.8)
# the queue, Gary alone, the hall slamming up bay by bay, the line running
e(t['now'] - 0.2, "metal_groan", -20, 0.3, dur=0.7, pitch=1.5)
for k in range(6): e(t['builds'] + k * 0.2, "knock", -19, -0.2, pitch=1.0 + 0.08 * (k % 3))
e(t['everyone'], "blanket_rustle", -21, 0.4, dur=0.8, intensity=0.6)   # the queue waves cash
e(t['roll'] - 0.3, "metal_groan", -19, -0.2, dur=0.4, pitch=1.6); e(t['roll'] - 0.05, "clunk", -14, -0.2, size=0.9, metal=0.8)   # Gary yanks the start lever
for i in range(8): e(t['roll'] - 0.25 + i * 0.12, "giant_step", -15 - (i % 2), -0.5 + i * 0.14, size=0.9); e(t['roll'] - 0.2 + i * 0.12, "clunk", -18, -0.5 + i * 0.14, size=1.2, metal=0.8)
for k in range(22):
    for x, snd in ((0.4, "knock"), (5.0, "clunk")):
        tc = crossT(k, x)
        if tc is not None and tc < D - 0.5: e(tc, snd, -24, -0.3 + 0.03 * (k % 10), **({"pitch": 1.4} if snd == "knock" else {"size": 0.5, "metal": 0.8}))
e(t['pulls'] - 0.1, "grate", -20, 0.3, dur=0.8); e(t['promoted'] - 0.05, "pop", -15, 0.3, pitch=1.6); e(t['promoted'] + 0.05, "plush_squeak", -20, 0.3, pitch=1.8)
# parts: the door bonks off, hammered into the sunroof, the press, the Cadillac pile, the hood ornament
e(t['fits'], "bonk", -14, 0.0)
for k in range(4): e(t['hammering'] + 0.1 + k * 0.3, "metal_clang", -19, 0.0, size=0.5, pitch=1.4)
for k, a in enumerate((t['make'], t['exactly'], t['alike'])): e(a - 0.03, "knock", -18, 0.1, pitch=1.6)   # Gary slams the press buttons
for k in range(3): e(t['make'] + k * 0.42 + 0.12, "metal_clang", -13, 0.3, size=1.4, pitch=0.8); e(t['make'] + k * 0.42 + 0.14, "giant_step", -17, 0.3, size=0.8)
e(t['inter'] + 0.35, "knock", -16, 0.0, pitch=1.3); e(t['inter'] + 0.38, "pop", -18, 0.0, pitch=1.4)
e(PILE_IN, "crumble", -15, 0.0, dur=1.0, size=0.8)
for k in range(10): e(PILE_IN + 0.08 + k * 0.08, "clunk", -20, -0.4 + 0.08 * k, size=0.6, metal=0.8)
e(PILE_AT, "metal_clang", -12, 0.0, size=1.6, pitch=0.7)
for k in range(12): e(PILE_OUT + k * 0.05, "knock", -20, 0.4 - 0.07 * k, pitch=1.5)
e(PILE_BACK, "pop", -14, 0.0, pitch=0.9); e(t['pile2'] - 0.2, "plush_squeak", -21, 0.0, pitch=1.1); e(t['pile2'], "slurp", -17, 0.2, dur=0.35)   # the Roomba slurps up Gary's shoe
e(ORN, "pop", -15, 0.1, pitch=1.2); e(ORN + 0.3, "low_swell", -20, 0.1, dur=1.2, pitch=1.4)
# robots: the line rushes, the bolt, the snore, the robots drop in, welding, Gary welded
e(t['garys'], "car_pass", -21, 0.2, dur=1.0, size=0.8); e(t['bolt'] + 0.1, "car_pass", -20, 0.2, dur=1.0, size=0.8)
for k in range(6): e(t['bolt'] + 0.1 + k * 0.22, "knock", -24, 0.0, pitch=1.8)
e(t['asleep'] - 0.1, "snore", -17, 0.0, dur=2.0, size=0.8)
e(t['robot'] + 0.32, "giant_step", -14, -0.3, size=1.1); e(t['robot'] + 0.34, "metal_clang", -16, -0.3, size=1.2, pitch=0.9)   # robot 1 drops in
e(t['soR'] - 0.05, "plush_squeak", -18, 0.2, pitch=1.5)   # Gary jolts awake
e(t['buy'] + 0.05, "giant_step", -15, 0.3, size=0.8); e(t['buy'] + 0.07, "knock", -16, 0.3, pitch=0.6)   # the crate lands
e(t['arms'], "wood_snap", -13, 0.3, size=1.0); e(t['arms'] + 0.05, "crumble", -19, 0.3, dur=0.5, size=0.4)   # he rips it open
for k in range(4): e(t['arms'] + 0.25 + k * 0.15, "knock", -21, 0.3, pitch=1.7)   # bolts it down
for k in range(5): e(t['never'] - 0.1 + k * 0.45, "zap", -27, -0.3 + 0.15 * k, dur=0.3)
e(WELD, "zap", -14, 0.0, dur=0.6); e(t['garyW'], "plush_squeak", -17, 0.0, pitch=1.3)
for k in range(3): e(t['doorW'] - 0.25 + k * 0.2, "metal_groan", -23, 0.0, dur=0.3, pitch=1.6)
# e-coat: the leak, the rust, a door drops, the pit opens, the hoist, the dip, the zaps, bubbles, out, rustproof
e(t['thenE'] - 0.1, "low_swell", -20, 0.1, dur=1.0, pitch=0.8)   # the indoor rain cloud rolls in
for k in range(8): e(t['carsE'] + k * 0.18, "plip", -22, 0.1, pitch=1.0 + 0.1 * (k % 3))
e(t['rusts'] - 0.1, "metal_groan", -18, 0.1, dur=1.0, pitch=0.9); e(t['rusts'] + 0.5, "clunk", -15, 0.1, size=0.9, metal=0.8)
e(PIT0 + 0.05, "crumble", -11, 0.0, dur=1.2, size=1.2); e(PIT0 + 0.1, "giant_step", -13, 0.0, size=1.2)
e(LIFT0, "metal_groan", -19, 0.0, dur=1.2, pitch=1.1); e(DIP0 + 0.3, "splash", -11, 0.0, size=1.4)
for k in range(3): e(t['electrified'] + k * 0.35, "zap", -20, -0.2 + 0.2 * k, dur=0.4)
for k in range(4): e(t['seals'] + k * 0.4, "fish_blub", -18, 0.0, n_bub=3)
e(OUT0 + 0.1, "splash", -15, 0.0, size=0.9)
for k in range(5): e(OUT1 + k * 0.15, "plip", -21, 0.0, pitch=1.2)
e(t['rustproof'] - 0.05, "plip", -15, 0.1, pitch=1.6); e(t['rustproof'] + 0.35, "pop", -17, 0.1, pitch=1.3)
# JIT: the dock door, the avalanche, buried, the drain, the tugger, the Roomba's promotion
e(t['n30000'] + 0.2, "metal_groan", -18, 0.3, dur=0.8, pitch=1.3)
e(AVA0 + 0.1, "crumble", -9, 0.0, dur=1.8, size=1.6); e(AVA0 + 0.2, "giant_step", -12, 0.0, size=1.4)
for k in range(18): e(AVA0 + 0.15 + k * 0.05, "knock", -21, -0.5 + 0.06 * k, pitch=0.8 + 0.05 * (k % 5))
e(t['buried'], "plush_squeak", -22, 0.0, pitch=0.8)
e(DRAIN0 + 0.05, "crumble", -14, 0.0, dur=1.0, size=1.0)
for k in range(10): e(DRAIN0 + 0.1 + k * 0.06, "knock", -23, 0.5 - 0.1 * k, pitch=1.2)
for a in (t['needed'] - 0.1, t['jitW'] - 0.1): e(a, "blanket_rustle", -23, 0.2, dur=0.3, intensity=0.7); e(a + 0.45, "clunk", -16, 0.2, size=0.6, metal=0.6); e(a + 0.47, "pop", -19, 0.2, pitch=1.6)   # Gary tosses parts in, just in time
e(t['roombaJ'] - 0.5, "pop", -18, 0.2, pitch=1.4); e(t['manager'] - 0.05, "pop", -15, 0.2, pitch=1.6); e(t['manager'] + 0.05, "plush_squeak", -20, 0.2, pitch=1.9)
# crash test: the flag, run 1 (rigid) + the splat, towed back, the new nose, run 2 (it crumples), the airbag
e(t['crashW'] - 0.3, "blanket_rustle", -22, -0.2, dur=0.4, intensity=0.8)
e(L1, "car_pass", -15, -0.3, dur=0.9, size=1.0); e(HIT1, "car_crash", -9, 0.2, weight=1.1); e(HIT1 + 0.02, "metal_clang", -15, 0.2, size=1.5, pitch=0.8)
e(HIT1 + 0.22, "slurp", -17, 0.3, dur=0.3); e(HIT1 + 0.24, "bonk", -16, 0.3)
e(t['dummy'] - 0.3, "blanket_rustle", -22, 0.3, dur=0.6, intensity=0.6); e(t['fine'] - 0.1, "pop", -20, 0.1, pitch=2.0)
e(t['notX'], "plush_squeak", -21, 0.3, pitch=0.7)
e(t['notX'] + 0.2, "metal_groan", -19, 0.0, dur=1.4, pitch=1.2); e(t['front'] - 0.05, "pop", -14, 0.1, pitch=1.0); e(t['front'] - 0.03, "bonk", -18, 0.1)   # winched back; Gary slaps the striped nose on
e(t['fold'], "metal_groan", -17, 0.1, dur=0.7, pitch=1.8); e(t['can'] + 0.2, "plush_squeak", -21, 0.1, pitch=1.4)   # squeezed like a soda can
ev.append({"t0": t['notX'] + 0.35, "t1": t['front'] - 0.1, "sound": "footsteps", "rate": 4.5, "gain_db": -24, "pan0": 0.3, "pan1": -0.1})
e(L2, "car_pass", -15, -0.3, dur=0.9, size=1.0); e(HIT2, "car_crash", -11, 0.2, weight=0.8); e(HIT2 + 0.03, "crumble", -15, 0.2, dur=0.6, size=0.6); e(HIT2 + 0.05, "metal_groan", -16, 0.2, dur=0.6, pitch=1.4)
e(t['garyX3'], "pop", -21, 0.2, pitch=1.3); e(t['away'], "plush_squeak", -21, 0.2, pitch=1.5)
e(BAG, "pop", -9, 0.3, pitch=0.55); e(BAG + 0.05, "bonk", -14, 0.3); e(BAG + 0.2, "plush_squeak", -18, 0.0, pitch=1.6); e(BAG + 0.6, "blanket_rustle", -22, 0.3, dur=0.9, intensity=0.4)   # the airbag deflates
# qc: Gary drops into a car leaving through the end door, rides out, walks back in, stamped twice
e(t['carQ'] - 0.3, "car_pass", -17, 0.5, dur=1.8, size=0.9); e(LANDQ, "giant_step", -15, 0.4, size=0.6); e(LANDQ + 0.03, "plush_squeak", -19, 0.4, pitch=1.2)
e(HOPQ, "knock", -20, 0.5, pitch=0.9)
ev.append({"t0": HOPQ + 0.35, "t1": t['inspector'] - 0.15, "sound": "footsteps", "rate": 5.5, "gain_db": -23, "pan0": 0.5, "pan1": 0.1})
e(t['check'], "pop", -16, 0.1, pitch=1.2); e(t['check'] + 0.05, "low_swell", -22, 0.1, dur=0.8, pitch=1.6)   # the QC gate lights up
for a in (STAMP, STAMP2): e(a, "knock", -13, 0.0, pitch=0.7); e(a + 0.02, "bonk", -17, 0.0)
# finish: the meatloaf machine, the roof racer, the town turns into a parking lot
e(t['vending'] - 0.15, "pop", -14, -0.1, pitch=0.8); e(t['meatloaf'] + 0.15, "slurp", -18, -0.1, dur=0.3); e(t['meatloaf'] + 0.17, "knock", -19, -0.1, pitch=0.6)
e(t['test'] - 0.15, "pop", -16, 0.1, pitch=1.1); e(t['track'] - 0.1, "car_pass", -15, 0.3, dur=1.3, size=0.9)
for k in range(10): e(t['parking'] + k * 0.12, "pop", -21, -0.5 + 0.1 * k, pitch=0.9 + 0.05 * k)
e(t['parking'] + 0.1, "crumble", -18, 0.0, dur=1.2, size=0.8)
# the ending: confetti + cheer, money, Gary up the stairs, the desk, the vacuum, the mechanic wakes + flips the sign
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -22, 0.0, dur=1.6, intensity=0.6)
for k in range(4): e(t['n76'] + k * 0.5, "blanket_rustle", -23, -0.3 + 0.2 * k, dur=0.7, intensity=0.5)
ev.append({"t0": t['pay'] + 0.6, "t1": t['billion'] + 0.35, "sound": "footsteps", "rate": 5.0, "gain_db": -24, "pan0": 0.0, "pan1": 0.2})
e(EP_desk + 0.3, "knock", -18, 0.1, pitch=1.0); e(EP_desk + 0.45, "pop", -16, 0.1, pitch=1.5)
e(t['shop'] - 0.3, "plush_squeak", -20, 0.3, pitch=0.9)
e(t['n1400'] - 0.3, "knock", -16, 0.3, pitch=1.1); e(t['n1400'], "pop", -13, 0.3, pitch=0.85); e(t['n1400'] + 0.25, "blanket_rustle", -21, 0.3, dur=0.5, intensity=0.8)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "turbines", "t0": 0.0, "t1": t['soH'] + 0.8, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -30, "args": {"rate": 0.9}, "seed": 1},   # the tow truck idling
    {"sound": "city_day", "t0": 0.0, "t1": IN + 0.6, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -34, "args": {"murmur": 0.2, "traffic": 0.5}, "seed": 2},
    {"sound": "room_tone", "t0": IN, "t1": D, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -40},
    {"sound": "drill", "t0": t['engine'] - 0.05, "t1": t['horn'], "fade_in": 0.1, "fade_out": 0.3, "gain_db": -26, "args": {"rate": 14.0}, "seed": 3},   # the lawnmower engine sputters
    {"sound": "city_day", "t0": t['now'] - 0.1, "t1": t['roll'] + 0.4, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -30, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 4},   # the queue
    {"sound": "turbines", "t0": t['roll'], "t1": D, "fade_in": 1.0, "fade_out": 0.8, "gain_db": -33, "args": {"rate": 0.45}, "seed": 5},   # the factory hum
    {"sound": "drill", "t0": t['never'] - 0.2, "t1": t['doorW'] + 0.5, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -31, "args": {"rate": 9.0}, "seed": 6},   # the robots' servos
    {"sound": "rain_window", "t0": t['carsE'] - 0.2, "t1": t['dip'] + 0.5, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -27, "args": {"intensity": 0.7}, "seed": 7},   # the leak
    {"sound": "water_rush", "t0": PIT0 + 0.4, "t1": t['body'] + 0.6, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -24, "seed": 8},   # the bath fills
    {"sound": "lamp_hum", "t0": t['electrified'] - 0.1, "t1": t['crack'] + 0.5, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -29, "seed": 9},
    {"sound": "drill", "t0": t['arrives'] - 0.4, "t1": t['toyota'] + 0.8, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -32, "args": {"rate": 12.0}, "seed": 10},   # the tugger
    {"sound": "wind", "t0": BAG + 0.1, "t1": LANDQ + 0.1, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -27, "args": {"darkness": 0.4, "gust": 0.7, "whistle": 0.0}, "seed": 11},   # Gary in flight
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['didnt'] + 0.4, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "seed": 12},
    {"sound": "drill", "t0": EP_desk + 0.6, "t1": t['shop'] + 0.4, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -30, "args": {"rate": 20.0}, "seed": 13},   # Gary's vacuum
]

cues = {
    "title": "026 - How a Garage Becomes a Car Factory (build genre: FACTORY HOUSE pluck + factory foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -8.0, "sfx": 5.0, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
