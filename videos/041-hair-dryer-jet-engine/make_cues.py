#!/usr/bin/env python3
"""Cue sheet for 041 (build genre, TURBO pace like 039) -> cues.json.   python3 -I videos/041-hair-dryer-jet-engine/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 041-hair-dryer-jet-engine

Sound identity: "JET SET" — a bright bell disco in E major at 124 bpm (synth.py's continuous "disco" style: octave bass in 8ths +
off-beat stabs), a soft E pad under everything (the music never thins out), a light tom pulse + clap on 2 and 4, booms on the big
impacts, and the build genre's rising mallet "ta-da" on every TERM (here E5–G#5–B5). 024 marimba F, 025 desert shuffle D, 026
disco pluck Bb, 032 lounge walk D, 033 oom-pah G, 034 barn-dance piano A, 039 shanty pluck Dm 136 — 041 is the airy one.
The hook is bathroom foley only (the hair dryer whirr, the duck); the music drops in on "Congratulations". The machine carries the
sound: the dryer's whirr grows into a ducted-fan rush, a compressor whine, the combustor's roar, the jet (synth.py amb_jet: a low
roar + a soft, low-passed turbine whine — never shrill), the spool-ups (rising swells), the flight's wind, the runway. Foley on
everything (turbo bar ≥ 400 events). The narrator sits on top: music ducks ~9 dB under every phrase, ambience ~5 dB."""
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
    gives=W('hook', 'gives'), tapes=W('hook', 'tapes'), blowout=W('hook', 'blowout'), duckH=W('hook', 'duck'),
    congrats=W('congrats', 'congratulations'), youve=W('congrats', 'youve'), worst=W('congrats', 'worst'), thrustC=W('congrats', 'thrust'), egg=W('congrats', 'egg'), weighs=W('congrats', 'weighs'), thousand=W('congrats', 'thousand'),
    swap=W('duct', 'swap'), fanD=W('duct', 'fan'), air=W('duct', 'air'), toilet=W('duct', 'toilet'), mummifies=W('duct', 'mummifies'), soWrap=W('duct', 'so', 2), wrap=W('duct', 'wrap'), tube=W('duct', 'tube'),
    ducted=W('duct', 'ducted'), all=W('duct', 'all'), oneway=W('duct', 'way'), creeps=W('duct', 'creeps'), duckD=W('duct', 'duck'), faster=W('duct', 'faster'),
    squeezed=W('squeeze', 'squeezed'), stack=W('squeeze', 'stack'), axial=W('squeeze', 'axial'), compressor=W('squeeze', 'compressor'), sucks=W('squeeze', 'sucks'), garyS=W('squeeze', 'gary'),
    burns=W('burn', 'burns'), soB=W('burn', 'so'), heater=W('burn', 'heater'), coil=W('burn', 'coil'), fuel=W('burn', 'fuel'), flame=W('burn', 'flame'), garyB=W('burn', 'gary'), behindB=W('burn', 'behind'),
    but=W('cord', 'but'), cord=W('cord', 'cord'), rolls=W('cord', 'rolls'), driveway=W('cord', 'driveway'), plug=W('cord', 'plug'), out=W('cord', 'out'),
    soT=W('turbine', 'so'), windmill=W('turbine', 'windmill'), exhaustT=W('turbine', 'exhaust'), shaft=W('turbine', 'shaft'), turbineW=W('turbine', 'turbine'), fansT=W('turbine', 'fans'), whittle=W('turbine', 'whittle'), afford=W('turbine', 'afford'), five=W('turbine', 'five'), cuts=W('turbine', 'more'),
    blobs=W('nozzle', 'blobs'), soN=W('nozzle', 'so'), pinch=W('nozzle', 'pinch'), thumb=W('nozzle', 'thumb'), hose=W('nozzle', 'hose'), nozzleW=W('nozzle', 'nozzle'), came=W('nozzle', 'came'), now=W('nozzle', 'now'), goes=W('nozzle', 'goes'),
    melts=W('cool', 'melts'), sixteen=W('cool', 'sixteen'), make=W('cool', 'so'), holes=W('cool', 'holes'), blanket=W('cool', 'blankets'), film=W('cool', 'film'), drips=W('cool', 'dripped'),
    works=W('fan', 'works'), screams=W('fan', 'screams'), rattle=W('fan', 'rattle'), add=W('fan', 'add'), around=W('fan', 'around'), turbofan=W('fan', 'turbofan'), quieter=W('fan', 'quieter'),
    waddles=W('duck', 'waddles'), inD=W('duck', 'in', 2),
    flings=W('duck2', 'flings'), back=W('duck2', 'back'), fine=W('duck2', 'fine'), engines=W('duck2', 'engines'), birds=W('duck2', 'birds'), jelly=W('duck2', 'jelly'), behindJ=W('duck2', 'behind'), again=W('duck2', 'again'),
    starter=W('finish', 'starter'), bottles=W('finish', 'bottles'), swirl=W('finish', 'swirl'),
    nowF=W('fly', 'now'), hang=W('fly', 'hang'), planeF=W('fly', 'plane'), takeoff=W('fly', 'takeoff'), thrustF=W('fly', 'thrust'), garyF=W('fly', 'gary'), flies=W('fly', 'flies'),
    landing=W('land', 'landing'), stop=W('land', 'stop'), doors=W('land', 'doors'), flip=W('land', 'flip'), forward=W('land', 'forward'), reverser=W('land', 'reverser'), stops=W('land', 'stops'), doesnt=W('land', 'doesnt'),
    end=W('end', 'congratulations'), forty=W('end', 'forty'), millionE=W('end', 'million', 2), eggs=W('end', 'eggs'), singed=W('end', 'singed'), jellied=W('end', 'jellied'), squished=W('end', 'squished'), duckE=W('end', 'duck'), whole=W('end', 'whole'), timeE=W('end', 'time'),
    blowout2=W('end2', 'blowout'))
def mono(keys):   # scratch word times can come out of order (shots.js mono)
    for a, b in zip(keys, keys[1:]): t[b] = max(t[b], t[a] + 0.12)
mono(['thrustC', 'egg', 'weighs', 'thousand']); mono(['ducted', 'all', 'oneway', 'creeps', 'duckD', 'faster']); mono(['axial', 'compressor', 'sucks', 'garyS']); mono(['stop', 'doors', 'flip', 'forward', 'reverser', 'stops', 'doesnt'])

# ---- derived times: SAME formulas as shots.js (keep them in sync)
ON, BLOW, EGG1, EGGS = t['gives'] - 0.08, t['blowout'], t['egg'], t['thousand']
YANK = t['swap']; FANON = max(t['fanD'], YANK + 0.5); SPRAY, TP0, TP1 = t['air'], t['toilet'] - 0.3, t['mummifies'] + 0.45
RING0 = t['soWrap'] - 0.05; RING1 = max(RING0 + 3.2, t['creeps'] - 0.35); ONEWAY, CREEP, DHOP = t['all'], t['creeps'] - 0.1, t['creeps'] - 0.55; SLEEK = t['stack'] - 0.75
SQK, STG0 = t['squeezed'], t['stack'] - 0.05; STG1 = max(STG0 + 3.0, t['compressor'] + 0.3); SUCK0, SUCK1 = t['sucks'] - 0.25, t['garyS'] + 0.45
COMB0, COMB1, COIL0, COIL1, POUR0, POUR1, IGN = SUCK1 - 0.3, t['flame'] - 0.1, t['heater'] - 0.1, t['coil'] + 0.45, t['fuel'] - 0.55, t['fuel'] + 0.25, t['flame'] + 0.05; LAVA = IGN + 0.55
BEH0, BLAST = t['garyB'] - 0.75, t['behindB'] - 0.05
DOOR0 = t['but'] - 0.2; DOOR1 = DOOR0 + 0.9; HOP0, HOP1, ROLL0, ROLL1, PLUG = t['but'], t['but'] + 0.75, t['rolls'] - 0.35, t['plug'], t['out'] + 0.04
TC0 = t['soT'] + 0.3; TC1 = TC0 + 0.5; TD0, TD1 = TC1, TC1 + 0.3; TB0 = TD1; TB1 = max(TB0 + 2.0, t['fansT'] - 0.35); SH0, SH1 = t['shaft'] - 0.5, t['shaft'] + 0.1
HAND0 = TB1 - 0.05; IGN2 = max(HAND0 + 0.45, t['fansT']); SNIP = t['cuts'] + 0.15
BLOB, PET0 = t['blobs'] - 0.15, t['soN'] - 0.05; PET1 = max(PET0 + 3.2, t['nozzleW'] + 0.5); TINY, SEAT, GO = t['came'] - 0.35, t['now'] - 0.55, t['goes'] - 0.05
FENCE, SHRED, CATCH = GO + 0.42, GO + 0.52, GO + 1.2; GLAND, DLAND = CATCH + 0.1, CATCH + 0.25
MELT0 = max(t['melts'] + 0.05, CATCH + 0.15); DRILL0 = t['make']; DRILL1 = max(DRILL0 + 2.6, t['film'] - 0.3); FILM0 = t['blanket'] - 0.1
TEND = lambda txt: next((c['t1'] for c in story['callouts'] if c['text'] == txt), 0)   # mirrors shots.js: a TERM line's end
BOOTH0, RUN, RATTLE, OUT0, HUB0 = t['works'] + 0.05, t['works'], t['rattle'] - 0.1, t['add'] - 0.45, t['add'] - 0.1; HUB1 = HUB0 + 0.45; BLD0 = HUB1; BLD1 = max(BLD0 + 2.4, t['turbofan'] - 0.1); NAC0 = BLD0 + 0.4; NAC1 = max(NAC0 + 2.4, t['turbofan'] + 0.4, TEND('TURBOFAN') + 0.02); QUIET = t['quieter'] - 0.15
DW0, SUCKD, THRU1 = t['waddles'] - 0.7, t['inD'] - 0.2, t['back']; DOUT = THRU1 + 0.45; RUN0, RUN1 = t['flings'] - 0.1, t['back'] - 0.15
CAN0, CAN1, FIRE = t['engines'], t['birds'], W('duck2', 'test', 2) - 0.05; HOPJ = W('duck2', 'bird') - 0.35; JIN = FIRE + 0.4; JOUT = JIN + 0.55; SPLAT = max(JOUT + 0.2, t['behindJ'] + 0.02)   # mirrors shots.js (r3)
STARTER, BOTTLES, SWIRL = t['starter'], t['bottles'], t['swirl']
FORK0, LIFT0 = t['nowF'] - 0.5, t['nowF']; DRIVE0 = LIFT0 + 0.3; DRIVE1 = max(DRIVE0 + 0.85, t['planeF']); BOLT = DRIVE1; WING0, WING1 = BOLT - 0.15, BOLT + 0.35   # mirrors shots.js (r5b)
TO = max(t['takeoff'] - 0.05, WING1 + 0.02); LIFTOFF = TO + 0.55; CLOUD_IN = LIFTOFF + 0.45; ABOVE = CLOUD_IN + 0.25; DIVE = t['landing'] + 0.15; TELE = DIVE + 0.2; TOUCH = max(TELE + 0.8, t['stop'] + 0.05)
FLIP, STOP = t['flip'] - 0.05, max(t['stops'], TEND('THRUST REVERSER') + 0.04); GFLY0 = t['doesnt'] - 0.08; GSPLAT = GFLY0 + 0.45
MONEY, EGGBLOW, DFLY0, DLAND2, POOF = t['forty'], t['millionE'] + 0.1, t['duckE'] - 0.3, t['blowout2'] - 0.1, t['blowout2']

# ---------------------------------------------------------------- music: 124 bpm bell disco, E major
BPM = 124
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur, cyc = [], IN, 0
while cur < D - 1.6:
    seq = ['E', 'C#m', 'A', 'B'] if cyc % 2 == 0 else ['E', 'G#m', 'A', 'B']
    if TO - 0.5 < cur < TOUCH: seq = ['A', 'B', 'C#m', 'B']            # the flight lifts
    if cur > t['end'] - 0.5: seq = ['A', 'B', 'E', 'E'] if cyc % 2 == 0 else ['A', 'B', 'C#m', 'E']
    for sym in seq:
        if cur >= D - 1.6: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'E'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2, "vel": [[IN, 0.3], [t['burns'], 0.33], [GO, 0.37], [t['works'], 0.35], [TO, 0.39], [t['end'], 0.36], [D, 0.32]],
             "bass_hold": 0.95, "stab_vel": 0.46, "stab_hold": 0.8}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 76, 0.36, 0.16], [round(a + 0.08, 3), 80, 0.36, 0.16], [round(a + 0.16, 3), 83, 0.4, 0.36]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 71, 0.3, 0.14], [round(a + 0.09, 3), 76, 0.32, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 71, 0.3, 0.12], [round(a + 0.11, 3), 64, 0.3, 0.26]]
for k in range(8): mallet.append([round(ABOVE + 0.05 + k * 0.12, 3), [76, 80, 83, 88, 83, 80, 83, 88][k], 0.26, 0.12])   # above the clouds: a little sparkle run
pad = [{"t0": IN, "t1": D - 0.2, "notes": [28, 40, 47, 52, 56], "level": 0.5, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, BLAST, PLUG, GO, CATCH, NAC1, SUCKD + 0.25, SPLAT, LIFTOFF, TOUCH, GSPLAT, t['end']]
drums = [[round(b, 3), 0.45, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0.55, 0.8, 0.55], "vel": 0.12, "kind": "tom"},
                 {"t0": IN + 0.02 + BEAT, "t1": D - 1.0, "step": 2 * BEAT, "pattern": [1], "vel": 0.12, "kind": "clap"}]
music = {"gain_db": 5.0, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -8.0, "instrument": "bell",
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
def quack(tt, gain=-15, pan=0.0, pitch=1.0): e(tt, "goose_honk", gain, pan, pitch=1.15 * pitch, dur=0.17, angry=0.5)
def bonk(tt, pan=0.0, big=1.0): e(tt, "bonk", -10 + 2 * (big - 1), pan); e(tt + 0.01, "clunk", -14, pan, size=0.9 * big, metal=0.5)
def clank(tt, pan=0.0, size=0.8, pitch=1.1): e(tt, "metal_clang", -15, pan, size=size, pitch=pitch); e(tt + 0.02, "clunk", -19, pan, size=0.6, metal=0.9)
def ratchet(a, b, every=0.1, gain=-22, pan=0.0):
    k = 0
    while a + k * every < b: e(a + k * every, "knock", gain, pan, pitch=1.6 + 0.08 * (k % 3)); k += 1

# HOOK: tape rips, CLICK, the dryer on (whirr bed), the blast at the duck, POOF + quack
for k in range(3): e(t['tapes'] + k * 0.14, "grate", -20, 0.2, dur=0.12)
e(ON - 0.02, "lamp_switch_click", -12, 0.1); e(ON + 0.05, "low_swell", -20, -0.2, dur=0.6, pitch=1.8)
quack(t['duckH'] - 0.1, -17, -0.5); e(BLOW, "pop", -11, -0.5, pitch=0.9); e(BLOW + 0.02, "blanket_rustle", -18, -0.5, dur=0.5, intensity=0.9); quack(BLOW + 0.2, -14, -0.5, 1.2)
# CONGRATS: pops, confetti, the egg plinks, the egg fountain clatter
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -15, 0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -22, 0.0, dur=1.2, intensity=0.6)
e(EGG1, "pop", -13, 0.3, pitch=1.8); e(EGG1 + 0.05, "knock", -18, 0.3, pitch=2.2)
e(EGGS, "candy_rattle", -13, 0.0, dur=0.8, density=30.0, size=0.8); [e(EGGS + 0.45 + k * 0.05, "knock", -22, -0.4 + 0.1 * k, pitch=1.8 + 0.1 * (k % 3)) for k in range(8)]
# DUCT: the yank (plastic crack), the fan slaps on, the storm (whoosh + towels + eggs scatter), the TP spin, 4 CLANKs, the focused jet, the creak, the waddle
e(YANK + 0.1, "wood_snap", -16, 0.4, size=0.4); e(FANON, "clunk", -13, -0.2, size=0.6, metal=0.2); e(FANON + 0.05, "low_swell", -16, -0.2, dur=0.8, pitch=1.4)
e(SPRAY, "flash_swish", -12, 0.0, dur=0.9, peak=0.7); e(SPRAY + 0.15, "blanket_rustle", -16, -0.4, dur=0.8, intensity=1.0); e(SPRAY + 0.3, "blanket_rustle", -18, 0.4, dur=0.6, intensity=1.0)
[e(SPRAY + 0.3 + k * 0.07, "knock", -22, 0.5 - 0.1 * k, pitch=2.0) for k in range(6)]
for k in range(10): e(TP0 + 0.1 + k * 0.1, "blanket_rustle", -21, 0.4 - 0.08 * k, dur=0.1, intensity=0.8, softness=0.2)
e(t['mummifies'], "plush_squeak", -14, 0.2, pitch=0.8)
for k in range(4): clank(RING0 + (k + 0.85) * (RING1 - RING0) / 4, -0.2 + 0.1 * k, 0.7, 1.0 + 0.1 * k)
e(ONEWAY, "flash_swish", -16, -0.4, dur=0.6, peak=0.4); e(CREEP, "metal_groan", -18, 0.2, dur=0.7, pitch=1.6)
for k in range(8): quack(t['faster'] - 0.1 + k * 0.6, -26, 0.0, 1.1) if k == 0 else e(DHOP + 0.5 + k * 0.17, "plip", -26, 0.2, pitch=0.9)
quack(t['faster'] + 0.05, -15, 0.3)
# SQUEEZE: the rubber duck squeak, stages CLICK in (6), the compressor whine rises, the TP sucked in (Gary spins: wheee)
e(SQK + 0.1, "plush_squeak", -12, 0.3, pitch=1.6); e(SQK + 0.12, "flash_swish", -20, 0.3, dur=0.2, peak=0.3)
for k in range(6): tk = STG0 + (k + 0.9) * (STG1 - STG0) / 6; e(tk, "knock", -13, -0.2, pitch=1.3 + 0.08 * k); e(tk + 0.03, "clunk", -18, -0.2, size=0.5, metal=0.9)
e(STG1 - 0.6, "low_swell", -18, 0.0, dur=1.0, pitch=2.2)
e(SUCK0, "slurp", -12, 0.2, dur=0.6); e(SUCK0 + 0.1, "flash_swish", -16, 0.2, dur=SUCK1 - SUCK0, peak=0.5); e(t['garyS'], "whimper", -16, 0.3, pitch=1.6, dur=0.6)
# BURN: casing clanks, the coil slides, glug glug, FWOOSH (roar starts), the lava flare, the blast on Gary (+ sizzle)
for k in range(2): clank(COMB0 + (k + 0.9) * (COMB1 - COMB0) / 2.4, -0.3, 0.7, 0.9)
e(COIL0 + 0.2, "grate", -20, -0.2, dur=0.4)
for k in range(4): e(POUR0 + 0.25 + k * 0.17, "slurp", -18, 0.3, dur=0.14)
e(IGN - 0.03, "zap", -22, -0.2, dur=0.2); e(IGN, "distant_boom", -14, -0.2, size=0.6); e(IGN + 0.02, "flash_swish", -13, -0.2, dur=0.5, peak=0.8)
e(LAVA, "low_swell", -16, -0.2, dur=0.8, pitch=0.8)
e(BLAST - 0.05, "flash_swish", -10, -0.4, dur=0.5, peak=0.9); e(BLAST, "distant_boom", -12, -0.4, size=0.8); e(BLAST + 0.15, "zap", -24, -0.4, dur=0.5); e(BLAST + 0.4, "whimper", -16, -0.4, pitch=1.2)
# CORD: the roll-up door, rolling wheels, the cord BOING taut, the plug PLINK on Gary's hat, flameout (wind-down)
e(DOOR0, "grate", -18, 0.5, dur=0.9); steps(HOP0, HOP1, 9.0, -23, -0.3, 0.1)
for k in range(int((ROLL1 - ROLL0) / 0.18)): e(ROLL0 + k * 0.18, "knock", -25, 0.3, pitch=0.7 + 0.05 * (k % 3))
e(PLUG - 0.5, "plush_squeak", -14, -0.3, pitch=0.5); bonk(PLUG, 0.2, 1.1); e(PLUG + 0.04, "knock", -14, 0.2, pitch=2.4)
e(PLUG + 0.1, "low_swell", -16, 0.0, dur=1.4, pitch=0.6); e(PLUG + 0.2, "whimper", -20, 0.0, pitch=0.7, dur=0.6)
# TURBINE: casing clanks, the shaft CLUNK, 14 blade clicks, the hand-spin, the relight + spool-up, the wallet joke, SNIP
for k in range(2): clank(TC0 + (k + 0.9) * (TC1 - TC0) / 2, -0.3, 0.6, 1.0)
e(SH0, "grate", -18, -0.2, dur=SH1 - SH0); e(SH1, "clunk", -11, -0.2, size=0.9, metal=1.0)
for k in range(14): e(TB0 + (k + 0.5) * (TB1 - TB0) / 14, "knock", -19, -0.3 + 0.04 * k, pitch=1.8 + 0.05 * (k % 4))
for k in range(5): e(HAND0 + 0.1 + k * 0.17, "flash_swish", -22, 0.3, dur=0.12, peak=0.3)
e(IGN2, "distant_boom", -13, 0.0, size=0.6); e(IGN2 + 0.05, "low_swell", -14, 0.0, dur=1.6, pitch=0.9); e(IGN2 + 0.6, "low_swell", -16, 0.0, dur=1.2, pitch=1.6)
e(SNIP - 0.05, "grate", -16, 0.4, dur=0.1); e(SNIP, "knock", -12, 0.4, pitch=2.6)
# NOZZLE: blobs (blorp), petals clack in (10), the jet tightens (swish), the tiny click, GO: ZOOM, the fence, the shred, the catch CLANG
for k in range(3): e(BLOB + k * 0.22, "slurp", -17, -0.4, dur=0.2)
for k in range(10): e(PET0 + (k + 0.6) * (PET1 - PET0) / 10, "knock", -17, -0.3, pitch=1.2 + 0.05 * k)
e(PET1, "flash_swish", -14, -0.3, dur=0.8, peak=0.6); e(t['came'], "lamp_switch_click", -15, 0.2)
e(GO - 0.05, "distant_boom", -10, 0.0, size=1.0); e(GO, "flash_swish", -9, 0.2, dur=1.0, peak=1.0); e(GO + 0.1, "whimper", -16, 0.2, pitch=1.8, dur=0.5)
e(FENCE, "metal_clang", -12, 0.3, size=1.0, pitch=0.8); e(FENCE + 0.03, "car_crash", -18, 0.3, weight=0.4); e(SHRED, "wood_snap", -14, 0.3, size=0.7); e(SHRED + 0.05, "blanket_rustle", -16, 0.3, dur=0.6, intensity=1.0)
e(CATCH, "metal_clang", -8, 0.0, size=1.4, pitch=0.7); e(CATCH + 0.03, "giant_step", -12, 0.0, size=1.0); e(GLAND, "giant_step", -14, -0.2, size=0.6); e(GLAND + 0.03, "plush_squeak", -16, -0.2, pitch=0.8)
# COOL: the melt (groan + sizzle), drips plink on the hat, the drill buzz, the cool air hiss, ahh
e(MELT0, "metal_groan", -14, -0.2, dur=1.2, pitch=0.7); e(MELT0 + 0.2, "zap", -22, -0.2, dur=0.6)
for k in range(6): e(MELT0 + 0.35 + k * 0.26, "plip", -14, -0.1, pitch=0.6 + 0.05 * k); e(MELT0 + 0.37 + k * 0.26, "knock", -20, -0.1, pitch=2.6)
e(MELT0 + 0.4, "whimper", -16, -0.1, pitch=1.4, dur=0.5)
for k in range(7): e(DRILL0 + k * (DRILL1 - DRILL0) / 7, "zap", -21, 0.2, dur=0.18)
e(FILM0, "flash_swish", -18, 0.0, dur=1.2, peak=0.3); e(FILM0 + 0.2, "low_swell", -20, 0.0, dur=1.0, pitch=2.4)
e(SLEEK, "blanket_rustle", -16, 0.3, dur=0.4, intensity=1.0); quack(SLEEK + 0.3, -18, 0.3, 1.2)
for k in range(int((OUT0 - RUN) / 0.09)): e(RUN + k * 0.09, "knock", -27, 0.4, pitch=2.2 + 0.1 * (k % 3))   # the booth window rattling
e(EGGBLOW, "candy_rattle", -14, -0.3, dur=0.9, density=24.0, size=1.0); e(t['millionE'] + 0.15, "candy_rattle", -12, 0.2, dur=1.0, density=30.0, size=1.2)   # r5: the egg avalanche onto Gary
for k in range(5): e(t['add'] - 0.3 + k * 0.22, "grate", -22, -0.4, dur=0.2)   # r5: HANGAR 1 rolls open
e(W('finish', 'starter') - 0.6, "low_swell", -19, 0.5, dur=3.0, pitch=0.7)   # r5b: GARY AIR taxis in behind the finishing list
e(EGGBLOW + 0.05, "flash_swish", -16, -0.3, dur=0.6, peak=0.6)
# FAN: the scream (the jet whine bed swells), the fillings PING, the hub clunk, 16 blade clicks, 6 nacelle clanks, the turbofan hum, ahh quiet
for k in range(4): e(RATTLE + k * 0.12, "knock", -15, 0.3, pitch=3.0 + 0.2 * k)
e(HUB1, "clunk", -11, 0.3, size=1.0, metal=1.0)
for k in range(16): e(BLD0 + (k + 0.5) * (BLD1 - BLD0) / 16, "knock", -18, 0.3 - 0.04 * k, pitch=1.4 + 0.05 * (k % 5))
for k in range(6): clank(NAC0 + (k + 0.9) * (NAC1 - NAC0) / 6, 0.2 - 0.07 * k, 0.9, 0.9 + 0.05 * k)
e(NAC1 + 0.05, "gold_chime", -16, 0.0, notes=[88, 92, 95], spacing=0.06, vel=0.4); e(QUIET, "low_swell", -18, 0.0, dur=1.0, pitch=1.2)
# DUCK + BIRD TEST: quack?, SHLOOP (sucked), the bypass tumble, FWUMP, ta-da quack, the cannon rolls in, BOOM, the jelly wobble, SPLAT
quack(t['waddles'], -15, 0.4); e(SUCKD, "slurp", -10, 0.3, dur=0.5); quack(SUCKD + 0.1, -13, 0.3, 1.3)
for k in range(5): e(SUCKD + 0.4 + k * 0.15, "knock", -22, 0.2 - 0.1 * k, pitch=1.2)
e(THRU1, "pop", -10, -0.3, pitch=0.8); e(THRU1 + 0.03, "blanket_rustle", -16, -0.3, dur=0.5, intensity=1.0); quack(DOUT + 0.1, -14, -0.4, 1.1); quack(t['fine'], -16, -0.4, 0.95)
for k in range(int((CAN1 - CAN0) / 0.18)): e(CAN0 + k * 0.18, "knock", -24, 0.5, pitch=0.8)
e(FIRE, "distant_boom", -9, 0.4, size=0.9); e(FIRE + 0.02, "flash_swish", -12, 0.3, dur=0.6, peak=0.8); e(HOPJ + 0.38, "plush_squeak", -16, 0.4, pitch=1.3); e(JIN, "cartoon_splash", -16, 0.0, size=0.3); e(W('turbine', 'renewal') + 0.05, "slurp", -14, 0.2, dur=0.35)
e(SPLAT, "cartoon_splash", -10, -0.4, size=0.6); e(SPLAT + 0.03, "slurp", -14, -0.4, dur=0.4); e(SPLAT + 0.3, "plush_squeak", -16, -0.4, pitch=0.7)
# FINISH: three pops
e(STARTER, "pop", -11, 0.1, pitch=1.0); e(STARTER + 0.03, "clunk", -18, 0.1, size=0.5, metal=0.8); e(BOTTLES, "pop", -11, 0.0, pitch=1.2); e(BOTTLES + 0.03, "metal_clang", -20, 0.0, size=0.4, pitch=1.6)
e(SWIRL - 0.25, "slurp", -18, 0.3, dur=0.25); e(SWIRL, "pop", -11, 0.3, pitch=1.5)
# FLY: the forklift (beep + whine), the lift, the bolt CLUNK, Gary clambers up, takeoff roar, liftoff, the clouds (whoosh), FLIES
for k in range(3): e(FORK0 + k * 0.25, "scan_beep", -22, -0.2, pitch=1.4)
e(LIFT0, "metal_groan", -18, 0.0, dur=0.5, pitch=1.6); e(BOLT, "metal_clang", -9, 0.2, size=1.3, pitch=0.8); e(BOLT + 0.03, "clunk", -13, 0.2, size=1.0, metal=1.0)
steps(WING0, WING1, 10.0, -22, 0.1, 0.2)
e(TO, "low_swell", -12, 0.0, dur=LIFTOFF - TO + 0.5, pitch=0.7); e(LIFTOFF, "distant_boom", -12, 0.0, size=1.0)
e(CLOUD_IN, "whoosh_timeskip", -14, 0.0); e(DIVE + 0.05, "whoosh_timeskip", -14, 0.0)
# LAND: the screech + smoke, reverser CLACK, the roar forward, the stop, Gary flies off → SPLAT
e(TOUCH, "car_crash", -16, 0.0, weight=0.4); e(TOUCH + 0.02, "giant_step", -12, 0.0, size=1.2); e(TOUCH + 0.05, "grate", -15, 0.0, dur=1.2)
e(FLIP, "metal_clang", -12, 0.2, size=1.0, pitch=1.1); e(FLIP + 0.03, "clunk", -15, 0.2, size=0.8, metal=1.0); e(FLIP + 0.1, "low_swell", -14, 0.0, dur=1.6, pitch=0.6)
e(STOP, "giant_step", -12, 0.0, size=0.9); e(GFLY0, "whimper", -14, 0.3, pitch=1.6, dur=0.6); e(GFLY0 + 0.05, "flash_swish", -16, 0.3, dur=0.6, peak=0.6)
e(GSPLAT, "bonk", -9, 0.3); e(GSPLAT + 0.02, "plush_squeak", -13, 0.3, pitch=0.6)
# END: pops, confetti, money (rattle + rustle), the stamps, the duck flies in (wing flaps), the blowout POOF + a happy quack
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -14, 0.3, pitch=1.3); e(t['end'] + 0.2, "blanket_rustle", -22, 0.0, dur=1.2, intensity=0.6)
e(MONEY, "candy_rattle", -18, 0.0, dur=1.2, density=20.0, size=0.6); e(MONEY + 0.05, "blanket_rustle", -20, 0.0, dur=1.5, intensity=0.5)
for w in ('singed', 'jellied', 'squished'): e(t[w], "knock", -14, 0.0, pitch=0.9)
quack(DLAND2, -14, -0.3, 1.1); e(POOF, "pop", -10, -0.3, pitch=0.85); e(POOF + 0.03, "blanket_rustle", -16, -0.3, dur=0.6, intensity=1.0); quack(POOF + 0.35, -15, -0.3, 1.25)
# ---------------------------------------------------------------- density fill (soft, low-passed)
def flaps(a, b, gain=-26, pan=0.0):
    k = 0
    while a + k * 0.14 < b: e(a + k * 0.14, "blanket_rustle", gain, pan, dur=0.1, intensity=0.9, softness=0.3); k += 1
flaps(DFLY0, DLAND2, -22, -0.3); flaps(DLAND2, D - 0.2, -27, -0.3)
steps(SUCK1 + 1.3, POUR0, 9.0, -24, 0.2, 0.3); steps(POUR1 + 0.2, BEH0 + 0.6, 9.0, -24, 0.3, -0.3); steps(RUN0, RUN1, 14.0, -21, 0.3, -0.4); steps(t['soT'] + 0.15, TC0 + 0.3, 9.0, -24, 0.2, -0.3)
for k in range(12): e(t['congrats'] + 0.3 + k * 0.11, "pop", -24, -0.5 + 0.09 * k, pitch=1.2 + 0.1 * (k % 4))
for k in range(12): e(t['end'] + 0.3 + k * 0.11, "pop", -24, -0.5 + 0.09 * k, pitch=1.2 + 0.1 * (k % 4))
for k in range(10): e(NAC1 + 0.1 + k * 0.08, "pop", -24, -0.4 + 0.08 * k, pitch=1.4 + 0.1 * (k % 3))
for k in range(6): e(t['forty'] + 0.1 + k * 0.15, "blanket_rustle", -25, -0.3 + 0.12 * k, dur=0.12, intensity=0.5)
ratchet(TC0 + 0.3, HAND0 - 0.45, 0.16, -25, -0.3); ratchet(PET0, PET1, 0.14, -25, -0.3); ratchet(RING0, RING1, 0.18, -26, -0.2)
k = 0
while DRILL0 + k * 0.05 < DRILL1: e(DRILL0 + k * 0.05, "knock", -28, 0.2, pitch=2.8); k += 1
for k in range(8): e(ROLL0 + 0.4 + k * 0.12, "plip", -27, 0.3, pitch=1.6)
for k in range(8): e(TOUCH + 0.3 + k * 0.3, "grate", -26, 0.0, dur=0.2)
# ---------------------------------------------------------------- beds
amb = [
    {"sound": "room_tone", "t0": 0.0, "t1": GO, "fade_in": 0.1, "fade_out": 0.5, "gain_db": -38, "seed": 1},   # inside the house
    {"sound": "city_day", "t0": ROLL0 - 0.6, "t1": TO, "fade_in": 0.8, "fade_out": 0.8, "gain_db": -38, "args": {"murmur": 0.2, "traffic": 0.4}, "seed": 2},
    {"sound": "hairdryer", "t0": ON, "t1": FANON + 0.2, "fade_in": 0.05, "fade_out": 0.2, "gain_db": -24, "pan": -0.1, "args": {"pitch": 1.0}, "seed": 3},   # the dryer on high
    {"sound": "fan", "t0": FANON - 0.1, "t1": PLUG + 0.6, "fade_in": 0.3, "fade_out": 1.0, "gain_db": -27, "args": {"rate": 14.0}, "seed": 4},       # the open fan → the ducted fan
    {"sound": "hairdryer", "t0": STG0, "t1": PLUG + 0.5, "fade_in": 1.5, "fade_out": 0.8, "gain_db": -30, "args": {"pitch": 1.8}, "seed": 5},        # the compressor whine
    {"sound": "jet", "t0": IGN, "t1": PLUG + 0.3, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -27, "args": {"whine": 0.4, "pitch": 0.8}, "seed": 6},
    {"sound": "jet", "t0": IGN2, "t1": GO + 1.2, "fade_in": 1.4, "fade_out": 0.6, "gain_db": -25, "args": {"whine": 0.5, "pitch": 1.0}, "seed": 7},
    {"sound": "jet", "t0": CATCH, "t1": TO, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -26, "args": {"whine": 0.6, "pitch": 1.1}, "seed": 8},
    {"sound": "wind", "t0": CATCH, "t1": TO + 0.2, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -36, "args": {"darkness": 0.4, "gust": 0.3, "whistle": 0.0}, "seed": 9},
    {"sound": "jet", "t0": TO - 0.2, "t1": STOP + 0.8, "fade_in": 0.6, "fade_out": 0.8, "gain_db": -21, "args": {"whine": 0.4, "pitch": 0.9}, "seed": 10},
    {"sound": "wind", "t0": LIFTOFF, "t1": TOUCH + 0.5, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -26, "args": {"darkness": 0.6, "gust": 0.6, "whistle": 0.1}, "seed": 11},
    {"sound": "jet", "t0": STOP + 0.4, "t1": D, "fade_in": 0.8, "fade_out": 0.5, "gain_db": -31, "args": {"whine": 0.3, "pitch": 0.8}, "seed": 12},   # idling at the gate
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['end'] + 1.4, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -32, "seed": 13},
]

ev = [x for x in ev if x is not None]
cues = {
    "title": "041 - How a Hair Dryer Becomes a Jet Engine (build genre, TURBO: JET SET bell disco 124 bpm + machine foley + narrator)",
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
