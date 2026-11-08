#!/usr/bin/env python3
"""Cue sheet for 034 (build genre, TURBO pace) -> cues.json.   python3 -I videos/034-go-kart-tank/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 034-go-kart-tank

Sound identity: "BARN-DANCE BOOGIE" — honky-tonk piano in A major at 140 bpm in synth.py's continuous "disco" style (octave
bass in 8ths + off-beat chord stabs), a soft clap on 2 and 4 and a tom on every beat (the turbo drive), a warm A pad under
everything (the music never thins out), booms on the big impacts, and the build genre's rising mallet "ta-da" on every TERM
(here A5–C#6–E6). 024 marimba in F, 025 desert shuffle in D, 026 disco pluck in Bb, 032 lounge walk in D, 033 oom-pah in G.
The hook is mud + engine foley only; the music drops in on "Congratulations". Foley on everything (turbo bar ≥ 400 events):
the kart engine and the lawnmower (drill beds), the tracks (a clank bed + a clank per link-hit), the goose (synth.py
goose_honk), pumpkins, the cannon, the barn, the chickens, the bumps, the turbine (rocket_rumble), the bridge, the creek.
The narrator sits on top: music ducks ~9 dB under every phrase, ambience ~5 dB. All foley soft + low-passed."""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


t = dict(
    stuck=W('hook', 'stuck'), garyH=W('hook', 'gary'), floors=W('hook', 'floors'), wins=W('hook', 'wins'),
    congrats=W('congrats', 'congratulations'), sprinkler=W('congrats', 'sprinkler'), gooseC=W('congrats', 'goose'), judging=W('congrats', 'judging'),
    sink=W('tracks', 'sink'), four=W('tracks', 'four'), soT=W('tracks', 'so'), wrap=W('tracks', 'wrap'), steelT=W('tracks', 'steel'), platesT=W('tracks', 'plates'), continuous=W('tracks', 'continuous'),
    spreads=W('tracks', 'spreads'), wide=W('tracks', 'wide'), horse=W('tracks', 'horse'),
    nowS=W('steer', 'now'), straight=W('steer', 'straight'), slow=W('steer', 'slow'), around=W('steer', 'around'), skid=W('steer', 'skid'), opposite=W('steer', 'opposite'), spin=W('steer', 'spin'), place=W('steer', 'place'), soDo=W('steer', 'so'), eyeballs=W('steer', 'eyeballs'),
    goose=W('goose', 'goose'), blocks=W('goose', 'blocks'), road=W('goose', 'road'), honk=W('goose', 'honk'), honks=W('goose', 'honks'), louder=W('goose', 'louder'), gets=W('goose', 'gets'), shoo=W('goose', 'shoo'), goose2=W('goose', 'goose', 2), garyG2=W('goose', 'gary', 2),
    opens=W('armor', 'cannon'), fireA=W('armor', 'cannon') + 0.35, bolt=W('armor', 'bolt'), steelA=W('armor', 'steel'), platesA=W('armor', 'plates'), take=W('armor', 'take'), headon=W('armor', 'headon'), tilt=W('armor', 'tilt'), them=W('armor', 'them'),
    sixty=W('armor', 'sixty'), twice=W('armor', 'twice'), pumpkins=W('armor', 'pumpkins'), bounce=W('armor', 'bounce'),
    cannonT=W('turret', 'cannon'), aiming=W('turret', 'aiming'), whole=W('turret', 'whole'), tankT=W('turret', 'tank'), soR=W('turret', 'so'), ring=W('turret', 'ring'), target=W('turret', 'target'), fireT=W('turret', 'fire'), explodes=W('turret', 'explodes'), flies=W('turret', 'flies'), barn=W('turret', 'barn'),
    soB=W('recoil', 'so'), shock=W('recoil', 'shock'), recoilW=W('recoil', 'recoil'), gun=W('recoil', 'gun'), put=W('recoil', 'put'), chicken=W('recoil', 'chicken'), head=W('recoil', 'head'),
    but=W('stab', 'every'), hit=W('stab', 'hit'), andS=W('stab', 'and'), cloud=W('stab', 'cloud'), gyros=W('stab', 'gyros'), full=W('stab', 'full'), glass=W('stab', 'glass'), fine=W('stab', 'fine'), isnt=W('stab', 'isnt'),
    heavy=W('turbine', 'heavy'), lawnmower=W('turbine', 'lawnmower'), faster=W('turbine', 'faster'), drop=W('turbine', 'drop'), jet=W('turbine', 'jet'), gas=W('turbine', 'gas'), fifteen=W('turbine', 'fifteen'),
    never=W('behind', 'never'), behind=W('behind', 'behind'), byeE=min(W('behind', 'bye'), W('behind', 'eyebrows')),
    weighs=W('bridge', 'weighs'), little=W('bridge', 'little'), three=W('bridge', 'three'), second=W('bridge', 'second'),
    circle=W('mlc', 'circle'), says=W('mlc', 'says'), eighty=W('mlc', 'eighty'), garyM=W('mlc', 'gary'), submarine=W('mlc', 'submarine'),
    climb=W('peri', 'out'), shut=W('peri', 'shut'), hatch=W('peri', 'hatch'), blind=W('peri', 'blind'), mirror=W('peri', 'mirror'), roof=W('peri', 'tubes'), finds=W('peri', 'looks'), immediately=W('peri', 'in'),
    addF=W('finish', 'add'), radio=W('finish', 'radio'), cup=W('finish', 'cup'), horn=W('finish', 'horn'), honksF=W('finish', 'honks'), gooseF=W('finish', 'goose'),
    end=W('end', 'congratulations'), mudE=W('end', 'mud'), nineteen=W('end', 'nineteen'), creekE=W('end', 'creek'), garyE=W('end', 'gary'), eyebrowsE=W('end', 'eyebrows'), gooseE=W('end', 'goose'), driving=W('end', 'driving'),
    back=W('end2', 'back'), mudEnd=W('end2', 'mud'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
XS = 5.6
TR0, TR1 = t['wrap'] - 0.05, t['platesT'] + 0.3
OUT0, OUT1 = t['continuous'], t['horse'] + 0.1
SP0 = t['opposite'] + 0.1; SP1 = max(SP0 + 1.1, t['soDo'] + 0.15)
JUMP0, JUMP1 = t['gets'] + 0.05, t['shoo'] - 0.05
CH0 = max(t['goose2'], JUMP1 + 0.4); CH1 = CH0 + 1.5; BACK1 = min(t['fireA'] - 0.15, CH1 + 0.7)
PK = [(t['opens'] - 0.1, 'gary'), (t['take'] - 1.1, 'flat'), (t['headon'] - 1.1, 'flat'), (t['pumpkins'] - 1.1, 'slope'), (t['bounce'] - 1.05, 'slope')]
PK_T = 1.1
PKF = lambda i: 0.65 if PK[i][1] == 'gary' else PK_T   # r2: the one on Gary is quick (shots.js PKF)
PL = [t['steelA'], t['platesA'], t['platesA'] + 0.2, t['platesA'] + 0.4]
TILT0, TILT1 = t['tilt'], t['them'] + 0.25
HG = t['cannonT'] - 0.1
PIV0, PIV1, RET1 = t['aiming'], t['tankT'] + 0.2, t['ring']
TUR0 = t['soR'] + 0.15
SHOT = t['fireT'] + 0.08; HITM = min(t['explodes'] - 0.03, SHOT + 0.5)   # fires on "fire"; a 0.5 s shell
RCX = 22.4   # r4 (shots.js): a lurch on the shot, the flight on "flies", the barn, a braking slide
FLY0 = t['flies'] - 0.3; INW = FLY0 + 0.42; OUTW = INW + 0.8; X_OUT = 18.5 - 2.75; VOUT = 6.0 / 0.8
RC1 = OUTW + 2 * (RCX - X_OUT) / VOUT; IN0, IN1 = INW - 0.02, OUTW - 0.02
TUR2, SHOT2 = t['soB'] + 0.1, t['gun']
DRV0 = t['but'] - 0.1
MISS1, MISS2 = t['hit'] - 0.12, t['andS'] - 0.05
HITS, POOF = MISS1 + 0.18, MISS2 + 0.4
GYRO, STAB = t['gyros'] - 0.05, t['gyros'] + 0.3
GLASS0, GLASS1 = t['full'] - 0.3, t['glass'] + 0.25
BOUNCE0, BOUNCE1 = t['isnt'] - 0.42, t['isnt'] + 0.05
MOW, TB, SPIN, HP = t['drop'] + 0.05, t['jet'] - 0.1, t['gas'] - 0.2, t['fifteen']
OFF0, OFF1, BLAST = t['never'] + 0.05, t['never'] + 0.45, t['byeE'] - 0.06
AB0, AB1 = BLAST + 0.5, t['weighs'] + 0.45
BR0, BR1 = t['weighs'], t['three'] - 0.1
SNAP = t['second'] - 0.05; LAND = SNAP + 0.62
CL0, CL1 = t['climb'] - 0.1, t['blind']
HATCH0, HATCH1 = t['shut'] - 0.05, t['hatch']
PERI0 = t['mirror'] - 0.1
GHOP0, GHOP1 = t['finds'] - 0.7, t['finds'] - 0.1
POPUP = max(t['addF'] - 0.15, t['immediately'] + 0.38)   # r2: the periscope jerk-back gets 0.3 s
OUTG, OUTG1 = t['creekE'] - 0.1, t['garyE'] - 0.1
GOOSEIN, DRIVE = t['gooseE'] - 0.45, t['driving'] + 0.45
FALL1 = DRIVE + 0.55
XB1 = 36.6


def drv(tt, a, b, x0, x1, e=0.6):   # shots.js drv(): constant speed with soft ends
    u = min(1, max(0, (tt - a) / (b - a))); r = min(0.45, e / (b - a))
    f = u * u / (2 * r * (1 - r)) if u < r else 1 - (1 - u) ** 2 / (2 * r * (1 - r)) if u > 1 - r else (u - r / 2) / (1 - r)
    return x0 + (x1 - x0) * f


bumps = []   # the tank's front over each bump crest (shots.js tAtDrive)
for k in range(6):
    x = 25 + 2 * k
    tt = DRV0
    while tt < t['heavy'] and drv(tt, DRV0, t['heavy'], RCX, XB1 - 1.3) < x: tt += 0.02
    if tt < t['heavy']: bumps.append(tt)

# ---------------------------------------------------------------- music: 140 bpm barn-dance boogie, A major
BPM = 140
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur, cyc = [], IN, 0
while cur < D - 1.6:
    seq = ['A', 'E', 'F#m', 'D'] if cyc % 2 == 0 else ['A', 'D', 'E', 'E']
    if cur > t['soB']: seq = ['F#m', 'D', 'A', 'E'] if cyc % 2 == 0 else ['D', 'E', 'A', 'A']
    if cur > t['end']: seq = ['D', 'E', 'A', 'A']
    for sym in seq:
        if cur >= D - 1.6: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'A'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2, "vel": [[IN, 0.3], [t['soR'], 0.33], [t['weighs'], 0.36], [t['end'], 0.38], [D, 0.34]],
             "bass_hold": 0.95, "stab_vel": 0.5, "stab_hold": 0.85}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 81, 0.36, 0.16], [round(a + 0.08, 3), 85, 0.36, 0.16], [round(a + 0.16, 3), 88, 0.4, 0.36]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 76, 0.3, 0.14], [round(a + 0.09, 3), 81, 0.32, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 76, 0.3, 0.12], [round(a + 0.11, 3), 69, 0.3, 0.26]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [33, 45, 52, 57, 61], "level": 0.5, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, PK[0][0] + PKF(0), SHOT, IN0, IN1, SHOT2, MISS1, BLAST, SNAP, LAND, CL1, t['end'], FALL1]
drums = [[round(b, 3), 0.45, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0.55, 0.8, 0.55], "vel": 0.12, "kind": "tom"},
                 {"t0": IN + 0.02 + BEAT, "t1": D - 1.0, "step": 2 * BEAT, "pattern": [1], "vel": 0.12, "kind": "clap"}]
music = {"gain_db": 5.0, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -8.0, "instrument": "piano",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
def steps(a, b, rate=6.0, gain=-24, p0=0.0, p1=0.0):
    if b > a + 0.15: ev.append({"t0": round(a, 3), "t1": round(b, 3), "sound": "footsteps", "rate": rate, "gain_db": gain, "pan0": p0, "pan1": p1})
def honk(tt, gain=-14, pan=0.3, pitch=1.0, angry=1.0): e(tt, "goose_honk", gain, pan, pitch=pitch, angry=angry)
def clanks(a, b, rate, gain=-24, pan=0.0):   # track links slapping the ground
    k = 0
    while a + k / rate < b: e(a + k / rate, "knock", gain, pan, pitch=0.55 + 0.08 * (k % 3)); k += 1

# HOOK: the kart engine screams, mud flies, SPLAT
for k in range(12): e(0.12 + k * 0.22, "slurp", -24, -0.2, dur=0.3)   # mud spraying off the wheels
e(t['floors'] - 0.05, "car_horn", -30, 0.0, dur=0.18, pitch=0.5)
for k in range(5): e(t['floors'] + k * 0.15, "splash", -22, -0.2, size=0.3)
e(t['wins'] - 0.12, "splash", -10, 0.0, size=0.7); e(t['wins'] - 0.1, "plush_squeak", -16, 0.0, pitch=0.7); e(t['wins'] - 0.08, "slurp", -14, 0.0, dur=0.5)
# CONGRATS: confetti, the sprinkler, the goose's judgment
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -15, 0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -23, 0.0, dur=1.2, intensity=0.6)
for k in range(6): e(t['sprinkler'] + k * 0.1, "plip", -20, -0.3 + 0.1 * k, pitch=0.6 + 0.05 * k)
honk(t['gooseC'], -14, 0.5, 1.1); e(t['judging'] - 0.15, "plip", -20, 0.5, pitch=0.7); e(t['judging'], "knock", -18, 0.5, pitch=1.4)
# TRACKS: bubbles, the arrows' pops, the wraps (CLANK ×3), the rise out of the mud, the horse's SPLOOT
for k in range(4): e(t['sink'] + k * 0.18, "plip", -19, -0.3 + 0.2 * k, pitch=0.5)
e(t['sink'], "slurp", -18, 0.0, dur=0.6)
for k in range(4): e(t['four'] + k * 0.1, "pop", -17, -0.3 + 0.2 * k, pitch=0.8 + 0.1 * k)
for k, w in enumerate((t['wrap'], t['steelT'], t['platesT'])): e(w, "metal_clang", -12, -0.3 + 0.3 * k, size=0.8, pitch=0.9 + 0.1 * k); e(w + 0.03, "clunk", -14, -0.3 + 0.3 * k, size=0.8, metal=0.9); e(w + 0.05, "splash", -22, 0.0, size=0.3)
e(t['continuous'], "low_swell", -22, 0.0, dur=0.8, pitch=1.2)
for k in range(5): e(OUT0 + k * 0.2, "slurp", -22, -0.1, dur=0.35)
clanks(OUT0, OUT1, 9.0, -25)
for k in range(9): e(t['spreads'] + k * 0.05, "pop", -21, -0.4 + 0.1 * k, pitch=1.4)
e(t['horse'] + 0.05, "splash", -13, -0.5, size=0.6); e(t['horse'] + 0.08, "slurp", -15, -0.5, dur=0.4); e(t['horse'] + 0.3, "whimper", -22, -0.5, pitch=0.7)
# STEER: yanking, the swing turn, the spin, dizzy
for k in range(4): e(t['nowS'] + 0.1 + k * 0.2, "knock", -20, 0.0, pitch=1.2)
clanks(t['nowS'], SP0, 8.0, -26)
e(t['slow'], "metal_groan", -18, -0.2, dur=0.8, pitch=1.4)
e(SP0, "metal_groan", -14, 0.0, dur=SP1 - SP0, pitch=1.1); clanks(SP0, SP1, 14.0, -22)
for k in range(5): e(SP0 + k * 0.28, "giant_step", -22, -0.6 + 0.3 * k, size=0.5)
for k in range(5): e(t['place'] + k * 0.12, "plush_squeak", -18, 0.2, pitch=1.6 + 0.2 * k)
e(t['eyeballs'], "gold_chime", -20, 0.2, notes=[84, 88, 91, 96], spacing=0.05, vel=0.4)
# GOOSE: it runs in, meep, HONK!!, Gary hops down, shoo, the chase (honk honk honk), Gary leaps back on
steps(t['place'], t['blocks'], 9.0, -24, -0.5, 0.4)
for k in range(3): honk(t['place'] + 0.4 + k * 0.5, -20, -0.2 + 0.2 * k, 1.15)
e(t['honk'], "car_horn", -15, 0.0, dur=0.16, pitch=2.3)   # meep.
honk(t['honks'], -8, 0.4, 0.95, 1.6); honk(t['louder'] + 0.1, -9, 0.4, 0.9, 1.8)
e(JUMP1, "knock", -16, 0.2, pitch=0.8); e(JUMP1 + 0.02, "plush_squeak", -20, 0.2, pitch=1.2)
for k in range(4): e(JUMP1 + 0.15 + k * 0.14, "blanket_rustle", -24, 0.2, dur=0.12, intensity=0.6)   # shoo shoo
for k in range(7): honk(CH0 + k * 0.22, -11 - (k % 2) * 3, 0.4 - 0.1 * k, 1.0 + 0.06 * (k % 3), 1.4)
steps(CH0, CH1, 11.0, -21, 0.3, -0.4)
e(BACK1, "clunk", -15, 0.0, size=0.6, metal=0.7); e(BACK1 + 0.02, "plush_squeak", -18, 0.0, pitch=1.0)
# ARMOR: FOOMP ×5, whistles, SPLATs, CLANG ×4, the tilt, the 60° pop, BOINGs
for k, (f, what) in enumerate(PK):
    e(f, "distant_boom", -20, 0.5, size=0.4); e(f + 0.02, "pop", -14, 0.5, pitch=0.5)
    e(f + 0.25 * PKF(k) / PK_T, "flash_swish", -26, 0.3, dur=PKF(k) - 0.3 * PKF(k) / PK_T, peak=0.5)
    a = f + PKF(k)
    if what == 'gary': e(a, "splash", -9, 0.0, size=0.6); e(a + 0.02, "slurp", -14, 0.0, dur=0.45); e(a + 0.05, "plush_squeak", -16, 0.0, pitch=0.6)
    elif what == 'flat': e(a, "metal_clang", -9, 0.1, size=1.0, pitch=0.7); e(a + 0.02, "splash", -14, 0.1, size=0.5); e(a + 0.05, "plush_squeak", -18, 0.0, pitch=0.8)
    else: e(a, "metal_clang", -13, 0.1, size=0.6, pitch=1.3); e(a + 0.03, "plush_squeak", -12, 0.2, pitch=2.0); e(a + 0.08, "flash_swish", -24, 0.3, dur=0.5, peak=0.2)
for k, p in enumerate(PL): e(p + 0.08, "metal_clang", -11 - (3 if k else 0), -0.3 + 0.2 * k, size=1.1 if not k else 0.8, pitch=0.8 + 0.08 * k); e(p + 0.1, "clunk", -14 - (3 if k else 0), -0.3 + 0.2 * k, size=1.0, metal=1.0)
e(TILT0, "metal_groan", -13, 0.2, dur=TILT1 - TILT0, pitch=0.8); e(TILT1 - 0.05, "clunk", -11, 0.2, size=1.2, metal=0.9)
e(t['sixty'], "pop", -17, 0.2, pitch=1.6); e(t['twice'], "pop", -17, 0.2, pitch=1.9)
honk(t['bounce'] + 0.25, -17, -0.5, 1.2)
# TURRET: bolting the hull gun, the pivot groan, the turret drop + ring whirr, the laser, BOOM, SPLOOSH, the slide, the barn
for k in range(2): e(HG + 0.15 + k * 0.25, "metal_clang", -15, 0.2, size=0.6, pitch=1.2)
e(PIV0, "metal_groan", -12, 0.0, dur=PIV1 - PIV0 + 0.3, pitch=0.7); clanks(PIV0, RET1, 11.0, -22)
e(TUR0 + 0.4, "giant_step", -9, 0.0, size=1.0); e(TUR0 + 0.42, "metal_clang", -12, 0.0, size=1.3, pitch=0.7)
e(t['ring'], "gold_chime", -21, 0.0, notes=[88, 93], spacing=0.07, vel=0.35)
e(t['target'], "scan_beep", -22, -0.4, pitch=1.4)
e(t['fireT'], "knock", -18, 0.0, pitch=1.6)                  # the lanyard
e(SHOT, "distant_boom", -5, -0.2, size=1.2); e(SHOT + 0.01, "car_crash", -14, -0.2, weight=0.5); e(SHOT + 0.02, "pop", -10, -0.4, pitch=0.4)
e(HITM, "splash", -9, -0.6, size=0.8); e(HITM + 0.02, "slurp", -13, -0.6, dur=0.4); e(HITM + 0.05, "crumble", -18, -0.6, dur=0.5, size=0.4); honk(HITM + 0.25, -18, -0.7, 1.3)
e(SHOT + 0.05, "metal_groan", -16, 0.3, dur=0.5, pitch=1.6); e(SHOT + 0.04, "crumble", -17, 0.2, dur=0.3, size=0.4)   # the lurch
e(FLY0, "distant_boom", -10, 0.2, size=0.9); e(FLY0 + 0.02, "flash_swish", -18, 0.3, dur=0.4, peak=0.6); clanks(FLY0, RC1, 13.0, -20, 0.3)   # r4: the launch
for k, w in enumerate((IN0, IN1)):
    e(w, "wood_snap", -7, 0.3 + 0.2 * k, size=1.3); e(w + 0.02, "car_crash", -12, 0.3 + 0.2 * k, weight=0.6); e(w + 0.05, "crumble", -15, 0.3, dur=0.8, size=0.7)
for k in range(10): e(IN0 + 0.1 + k * 0.14, "parrot_chirp", -20, -0.4 + 0.1 * k, pitch=0.55 + 0.05 * (k % 3))   # chickens BAWK
for k in range(6): e(IN0 + 0.15 + k * 0.2, "blanket_rustle", -24, 0.3, dur=0.2, intensity=0.7)   # wings
e(RC1, "giant_step", -12, 0.5, size=0.8)
# RECOIL: the springs glow (a low swell), the second shot (the barrel slides back), the bale explodes, BAWK
e(t['shock'], "low_swell", -20, 0.2, dur=1.0, pitch=0.9)
for k in range(3): e(t['shock'] + 0.15 + k * 0.18, "metal_groan", -24, 0.2, dur=0.15, pitch=2.2)   # spring boings
for k, p in enumerate([t['shock'] + 0.02, t['shock'] + 0.45]): e(p + 0.02, "clunk", -15, 0.2, size=0.8, metal=0.9); e(p + 0.2, "plush_squeak", -20, 0.2, pitch=1.4 + 0.2 * k)   # r3: the barrel pumps (shots.js PUMPS)
e(SHOT2, "distant_boom", -7, 0.3, size=1.0); e(SHOT2 + 0.02, "metal_clang", -14, 0.2, size=0.8, pitch=0.6); e(SHOT2 + 0.06, "metal_groan", -18, 0.2, dur=0.35, pitch=2.0)
e(SHOT2 + 0.15, "crumble", -12, -0.3, dur=0.7, size=0.6); e(SHOT2 + 0.17, "pop", -14, -0.3, pitch=0.6)
e(t['put'] - 0.1, "pop", -20, 0.0, pitch=1.8)
e(t['chicken'], "parrot_chirp", -12, 0.2, pitch=0.6); e(t['chicken'] + 0.18, "parrot_chirp", -14, 0.2, pitch=0.55); e(t['head'], "knock", -20, 0.2, pitch=2.0)
# STAB: bumps (clunks), two misses (BOOM … straw / POOF), the gyro whirr, the glass clink, Gary bounced out
for b in bumps: e(b, "clunk", -14, 0.0, size=1.0, metal=0.6); e(b + 0.04, "giant_step", -18, 0.0, size=0.6)
clanks(DRV0, t['heavy'], 10.0, -23)
for k, s in enumerate((MISS1, MISS2)): e(s, "distant_boom", -8, 0.2, size=0.9); e(s + 0.02, "pop", -13, 0.2, pitch=0.5)
e(HITS, "crumble", -12, 0.5, dur=0.6, size=0.5); e(HITS + 0.03, "plush_squeak", -16, 0.5, pitch=0.7); e(HITS + 0.3, "flash_swish", -22, 0.5, dur=0.6, peak=0.4)
e(POOF, "pop", -10, 0.3, pitch=0.35); e(POOF + 0.05, "blanket_rustle", -20, 0.3, dur=0.8, intensity=0.8)
e(GYRO + 0.1, "low_swell", -20, 0.0, dur=1.2, pitch=1.6); e(GYRO + 0.2, "zap", -24, 0.0, dur=0.3)
e(GLASS1, "knock", -17, 0.2, pitch=2.4); e(GLASS1 + 0.05, "plip", -22, 0.2, pitch=1.6)
e(BOUNCE0, "plush_squeak", -14, 0.0, pitch=1.6); e(BOUNCE1, "giant_step", -10, -0.3, size=0.8); e(BOUNCE1 + 0.02, "plush_squeak", -14, -0.3, pitch=0.6)
# TURBINE: the mower coughs + dies, the goose waddles past (honk), the mower is yanked + lands, the turbine drops in, spins up, 1,500 hp, FWOOSH
for k in range(5): e(t['heavy'] + k * 0.32, "pop", -17, -0.4, pitch=0.35 + 0.05 * k)   # cough cough
steps(t['heavy'] - 1.6, t['drop'] + 0.6, 7.0, -25, -0.6, 0.6)
honk(t['faster'], -14, 0.2, 1.15, 0.8)
e(MOW, "grate", -20, -0.3, dur=0.25); e(MOW + 0.75, "clunk", -12, -0.6, size=0.8, metal=0.5); e(MOW + 0.78, "metal_clang", -18, -0.6, size=0.5, pitch=1.4)
e(TB + 0.25, "metal_clang", -9, -0.2, size=1.4, pitch=0.6); e(TB + 0.27, "giant_step", -12, -0.2, size=1.0)
e(SPIN, "low_swell", -16, -0.2, dur=1.4, pitch=1.4)
e(HP, "distant_boom", -10, -0.2, size=0.8); e(HP + 0.05, "clunk", -14, -0.2, size=1.0, metal=0.8); e(HP + 0.2, "gold_chime", -22, 0.0, notes=[81, 88, 93], spacing=0.06, vel=0.35)
e(OFF1, "knock", -16, -0.4, pitch=0.9); e(OFF1 + 0.4, "plush_squeak", -24, -0.4, pitch=1.4)
e(BLAST, "distant_boom", -6, -0.4, size=1.0); e(BLAST + 0.02, "flash_swish", -12, -0.4, dur=0.9, peak=0.3); e(BLAST + 0.05, "plush_squeak", -14, -0.4, pitch=0.5)
e(BLAST + 0.35, "parrot_chirp", -14, -0.6, pitch=0.6); e(BLAST + 0.55, "parrot_chirp", -16, -0.7, pitch=0.5)   # the singed chicken flees
# BRIDGE: Gary leaps aboard, the creaks, SNAP, the fall, SPLOOSH, the creek rises, blub
e(AB1, "clunk", -12, 0.0, size=0.9, metal=0.7)   # r3: THUNK, Gary lands back in the hatch
clanks(BR0, BR1, 13.0, -21)
for k in range(4): e(t['little'] + 0.2 + k * 0.38, "floorboard_creak", -12 - k, 0.0, dur=0.42)
e(SNAP, "wood_snap", -5, 0.0, size=1.5); e(SNAP + 0.03, "crumble", -14, 0.0, dur=0.6, size=0.7)
e(LAND, "cartoon_splash", -6, 0.0, size=1.2); e(LAND + 0.02, "giant_step", -10, 0.0, size=1.4); e(LAND + 0.3, "water_splash", -14, 0.0, size=0.8)
for k in range(6): e(t['garyM'] + k * 0.22, "fish_blub", -18, 0.2, n_bub=2)
e(t['circle'], "pop", -16, -0.4, pitch=1.2); e(t['says'], "knock", -18, -0.4, pitch=1.6); e(t['eighty'] + 0.02, "metal_clang", -12, 0.2, size=0.9, pitch=1.1)   # r3: the 80 disc slams down
e(W('mlc', 'three') + 0.82, "splash", -12, -0.3, size=0.7); e(W('mlc', 'number') + 0.05, "splash", -17, 0.1, size=0.3); e(W('mlc', 'three') - 0.05, "metal_groan", -17, -0.4, dur=0.5, pitch=1.3)   # r3: Gary spits water; the 3 sign creaks
honk(t['submarine'] + 0.05, -18, 0.4, 1.2, 0.6)
# PERI: the climb out (water pours off), the hatch clang, the blind CRUNCH, periscope pops, the goose hops on, HONK
e(CL0, "metal_groan", -16, 0.0, dur=1.2, pitch=0.8); clanks(CL0, CL1, 12.0, -21)
e(HATCH1 - 0.05, "metal_clang", -12, 0.0, size=0.9, pitch=1.0)
e(CL1, "wood_snap", -7, 0.5, size=1.1); e(CL1 + 0.02, "car_crash", -12, 0.5, weight=0.5); e(CL1 + 0.04, "crumble", -16, 0.5, dur=0.5, size=0.5)
for k in range(3): e(PERI0 + 0.15 + k * 0.33, "pop", -12, -0.2 + 0.2 * k, pitch=1.0 + 0.2 * k); e(PERI0 + 0.17 + k * 0.33, "clunk", -19, -0.2 + 0.2 * k, size=0.4, metal=0.9)
e(GHOP1, "knock", -16, 0.4, pitch=0.9); e(GHOP0 + 0.1, "blanket_rustle", -22, 0.4, dur=0.3, intensity=0.8)
honk(t['immediately'], -8, 0.3, 0.95, 1.8)
# FINISH: the antenna boing, smoke launchers POOF, the cup, the horn, the honk duel
e(POPUP, "metal_clang", -15, 0.0, size=0.7, pitch=1.2)
e(t['radio'], "pop", -14, -0.2, pitch=1.3); e(t['radio'] + 0.05, "metal_groan", -20, -0.2, dur=0.4, pitch=2.6)
e(t['cup'], "pop", -14, -0.3, pitch=1.5); e(t['cup'] + 0.15, "slurp", -20, -0.3, dur=0.4)
e(t['horn'], "pop", -14, 0.4, pitch=1.2)
honk(t['honksF'], -10, 0.4, 0.85, 1.2); honk(t['gooseF'] + 0.1, -9, 0.2, 1.0, 1.8)
# END: confetti + cheer, money, Gary out on the deck, the goose drops into the hatch, the lurch, Gary lands in the mud
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -23, 0.0, dur=1.2, intensity=0.6)
for k in range(5): e(t['nineteen'] + k * 0.3, "blanket_rustle", -22, -0.3 + 0.15 * k, dur=0.6, intensity=0.5)
e(t['nineteen'], "gold_chime", -20, 0.0, notes=[84, 88, 91], spacing=0.06, vel=0.4)
e(OUTG1, "knock", -18, 0.2, pitch=1.0)
e(GOOSEIN + 0.3, "clunk", -14, 0.0, size=0.5, metal=0.8); honk(GOOSEIN + 0.45, -12, 0.0, 1.05, 1.4)
for k in range(5): honk(DRIVE + 0.2 + k * 0.35, -14 - k, 0.2 + 0.15 * k, 1.0 + 0.05 * (k % 2), 1.2)
e(DRIVE, "metal_groan", -14, 0.2, dur=1.0, pitch=0.8); clanks(DRIVE, D - 0.4, 12.0, -22, 0.4)
e(FALL1, "splash", -7, -0.2, size=0.9); e(FALL1 + 0.02, "slurp", -11, -0.2, dur=0.6); e(FALL1 + 0.05, "plush_squeak", -14, -0.2, pitch=0.5)
e(t['mudEnd'], "slurp", -16, -0.2, dur=0.5); e(t['mudEnd'] + 0.4, "plip", -22, -0.2, pitch=0.6)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "drill", "t0": 0.0, "t1": TR1, "fade_in": 0.05, "fade_out": 0.2, "gain_db": -26, "args": {"rate": 9.0}, "seed": 1},   # the kart engine revving
    {"sound": "drill", "t0": t['floors'], "t1": t['wins'] + 0.3, "fade_in": 0.05, "fade_out": 0.2, "gain_db": -22, "args": {"rate": 14.0}, "seed": 2},   # floored
    {"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -38, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 3},   # the open field
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -46, "seed": 4},
    {"sound": "drill", "t0": TR1, "t1": MOW, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -32, "args": {"rate": 7.0}, "seed": 5},   # the lawnmower engine, all along
    {"sound": "rocket_rumble", "t0": SPIN, "t1": D, "fade_in": 0.8, "fade_out": 0.6, "gain_db": -30, "args": {"rise": 0.6}, "seed": 6},   # the turbine
    {"sound": "rocket_rumble", "t0": BLAST - 0.05, "t1": BLAST + 1.2, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -20, "args": {"rise": 0.3}, "seed": 7},   # FWOOSH
    {"sound": "water_rush", "t0": t['weighs'], "t1": CL0 + 1.6, "fade_in": 0.6, "fade_out": 0.6, "gain_db": -32, "seed": 8},   # the creek
    {"sound": "water_rush", "t0": LAND, "t1": LAND + 1.4, "fade_in": 0.05, "fade_out": 0.8, "gain_db": -22, "seed": 9},
    {"sound": "water_rush", "t0": CL0, "t1": CL0 + 1.5, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "seed": 10},   # water pours off the climb
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['end'] + 1.4, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -30, "seed": 11},
]

ev = [x for x in ev if x is not None]
cues = {
    "title": "034 - How a Go-Kart Becomes a Tank (build genre, TURBO: BARN-DANCE BOOGIE piano 140 bpm + farm/tank foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -8.0, "sfx": 3.5, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
n_steps = sum(1 for x in ev if x.get('sound') == 'footsteps')
print(f"cues.json: {len(ev)} events ({n_steps} footstep runs), {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
