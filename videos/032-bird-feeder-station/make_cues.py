#!/usr/bin/env python3
"""Cue sheet for 032 (build genre) -> cues.json.   python3 -I videos/032-bird-feeder-station/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 032-bird-feeder-station

Sound identity: "SPACE LOUNGE" — the station's elevator music: a walking piano bass in quarter notes + lazy off-beat comps
(synth.py "walk" style) in D major at 116 bpm (I–vi–ii–V), a warm pad, a light tick pulse, and the build genre's signature
rising mallet "ta-da" on every TERM callout (here F#5–A5–D6). 024 was a marimba ostinato in F, 026 a disco pluck in Bb.
The hook is backyard foley only (birds, a lawn sprinkler of seed shells); the music drops in on "Congratulations". The yard
has a suburb bed + songbirds; space has a soft cabin hum (no air = no wind out there). The narrator sits on top: music ducks
~9 dB under every phrase, ambience ~5 dB. All foley soft + low-passed (audio/synth.py §6b)."""
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
    squirrels=W('hook', 'squirrels'), robbing=W('hook', 'robbing'), so0=W('hook', 'so'), hang=W('hook', 'hang'), higher=W('hook', 'higher'),
    c0=W('congrats', 'congratulations'), station0=W('congrats', 'restaurant'), gave=W('congrats', 'got'), five=W('congrats', 'five'), stars=W('congrats', 'stars'),
    bso=W('baffle', 'so'), cone=W('baffle', 'cone'), pole=W('baffle', 'pole'), bthis=W('baffle', 'this'), baffle=W('baffle', 'baffle'), bsq2=W('baffle', 'squirrel', 2), not_=W('baffle', 'not'), baffled=W('baffle', 'baffled'),
    jit=W('jump', 'it'), ten=W('jump', 'ten'), feet=W('jump', 'feet'), tree=W('jump', 'tree'), using=W('jump', 'using'), face=W('jump', 'face'), step=W('jump', 'step'),
    rso=W('rocket', 'so'), strap=W('rocket', 'strap'), rfeed=W('rocket', 'feeder'), rocket=W('rocket', 'rocket'), goes=W('rocket', 'goes'), up=W('rocket', 'up'), back=W('rocket', 'back'), down=W('rocket', 'down'), rgary=W('rocket', 'gary'),
    oso=W('orbit', 'so'), sideways=W('orbit', 'sideways'), really=W('orbit', 'really'), n17=W('orbit', '17500'), miles=W('orbit', 'miles'), hour=W('orbit', 'hour'), falls=W('orbit', 'falls'), earth=W('orbit', 'earth'), orbit=W('orbit', 'orbit'),
    fgary=W('float', 'gary'), floats=W('float', 'floats'), falling=W('float', 'falling'), too=W('float', 'too'), fso=W('float', 'so'), fsq=W('float', 'squirrel'),
    tiny=W('dock', 'tiny'), launch=W('dock', 'launch'), rooms=W('dock', 'rooms'), bolt=W('dock', 'bolt'), don=W('dock', 'on'), docking=W('dock', 'docking'), doorway=W('dock', 'doorway'),
    dthen=W('dark', 'then'), dark=W('dark', 'dark'), sixteen=W('dark', 'sixteen'), day=W('dark', 'day'), power=W('dark', 'power'), kgary=W('dark', 'gary'), opens=W('dark', 'opens'), hatch=W('dark', 'hatch'), kair=W('dark', 'air'), him=W('dark', 'him'),
    aso=W('airlock', 'so'), room=W('airlock', 'room'), empties=W('airlock', 'empties'), first=W('airlock', 'first'), airlock=W('airlock', 'airlock'), mudroom=W('airlock', 'mudroom'), aspace=W('airlock', 'space'),
    outside=W('solar', 'outside'), unfolds=W('solar', 'unfolds'), wings=W('solar', 'wings'), football=W('solar', 'football'), field=W('solar', 'field'), array=W('solar', 'array'), sit=W('solar', 'it'), swatted=W('solar', 'swatted'),
    inside=W('air', 'inside'), blue=W('air', 'blue'), ibreath=W('air', 'breath'), iso=W('air', 'so'), machines=W('air', 'machines'), iair=W('air', 'air'), recycle=W('air', 'recycle'), water=W('air', 'water'), life=W('air', 'life'),
    sweat=W('water', 'sweat'), wbreath=W('water', 'breath'), even=W('water', 'even'), pee=W('water', 'pee'), n98=W('water', '98'), wback=W('water', 'back'), yesterdays=W('water', 'yesterdays'), todays=W('water', 'todays'), c2=W('water', 'coffee', 2),
    hthen=W('hit', 'then'), hits=W('hit', 'hits'), hgary=W('hit', 'gary'), plug=W('hit', 'plug'),
    sheet=W('whipple', 'sheet'), vest=W('whipple', 'vest'), vapor=W('whipple', 'vapor'), whipple=W('whipple', 'whipple'), bulletproof=W('whipple', 'bulletproof'), tinfoil=W('whipple', 'tinfoil'),
    n23=W('finish', '23'), toilet=W('finish', 'toilet'), treadmill=W('finish', 'treadmill'), bungee=W('finish', 'bungee'), cords=W('finish', 'cords'), window=W('finish', 'window'), backyard=W('finish', 'backyard'),
    e0=W('end', 'congratulations'), still=W('end', 'still'), feed=W('end', 'feed'), ebirds=W('end', 'birds'), hundred=W('end', 'hundred'), billion=W('end', 'billion'), runs=W('end', 'runs'), place=W('end', 'place'), egary=W('end', 'gary'), eplug=W('end', 'plug'),
    e2birds=W('end2', 'birds'), got=W('end2', 'got'), seed=W('end2', 'seed'), fire=W('end2', 'fire'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
POLE_UP = t['higher'] - 0.05
CONE, BONK = t['cone'] - 0.05, t['bthis'] + 0.1
SLID = BONK + 0.45; ZIP0 = t['baffle'] + 0.45; ON_BRANCH = t['not_'] - 0.05
LEAP, FACE, STEP = t['tree'], t['face'], t['step']
GRAB, TAPED, IGN1 = t['rfeed'] - 0.05, t['rocket'] + 0.1, t['goes'] - 0.1
APEX = t['up'] + 0.55; FALL0 = APEX + 0.25; IMPACT = t['rgary']
POPOUT = t['oso'] + 0.12; UPRIGHT = POPOUT + 0.45; INCOCKPIT = UPRIGHT + 0.25; IGN2 = max(t['sideways'], INCOCKPIT + 0.2); ORBIT_IN = t['n17'] + 0.4
EXIT = t['fgary'] - 0.05
PUSH, M1_IN0, M1_IN1, BOLT1, BOLT2 = t['tiny'] + 0.2, t['launch'] - 0.35, t['rooms'] + 0.45, t['bolt'], t['don']
DIVE, M2_IN0, M2_CAP, LATCH = t['don'] + 0.35, t['docking'] - 1.1, t['docking'], t['doorway']
DOCK_T = [0, t['docking'], t['docking'] + 0.32, t['docking'] + 0.64, t['docking'] + 0.96]
SUNSET0, SUNSET1, LIGHTS_OFF, WHOOSH, TAUT = t['dthen'] - 0.1, t['dark'] + 0.1, t['dark'], t['kair'] - 0.05, t['him'] + 0.05
HATCH_OPEN = WHOOSH - 0.08
HAUL0, HAUL1, AL_IN0, AL_DOCK, INTO_AL, WIPE = t['aso'] - 0.1, t['room'] + 0.15, t['aso'] - 0.2, t['first'], t['airlock'] - 0.6, t['mudroom'] - 0.1
OUT0, UNF0, UNF1, SUNRISE1, POWER_ON, SWAT = t['outside'] - 0.1, t['unfolds'], t['field'] + 0.25, t['wings'] + 0.6, t['array'], t['swatted']
BLUE0, SCRUB, RECYC, PINK = t['blue'] - 0.2, t['machines'] - 0.05, t['recycle'] - 0.05, t['water'] + 0.2
PEE_IN, GAUGE0, GAUGE1, POUR, SIP, GULP = t['pee'] + 0.15, t['n98'] - 0.1, t['wback'], t['yesterdays'] - 0.05, t['todays'] - 0.1, t['c2']
HIT, SUCK0, PLUG, SHIELD, HIT2 = t['hits'], t['hgary'] - 0.3, t['plug'], t['sheet'] - 0.1, t['vapor'] - 0.12
TOILET, TREAD, CUPOLA = t['n23'] - 0.05, t['treadmill'] - 0.05, t['window'] - 0.05
SEED_OUT, SEED0, LAND = t['e2birds'], t['got'] - 0.1, t['fire'] - 0.04
NW = 8   # wing panels (engine/build/station.js D.wing.n)

# ---------------------------------------------------------------- music
BPM = 116
BEAT = 60 / BPM
IN = t['c0'] - 0.02
chords, cur, cyc = [], IN, 0
progs = [['D', 'Bm', 'Em', 'A'], ['G', 'A', 'F#m', 'Bm']]
while cur < D - 2.0:
    seq = progs[(cyc // 2) % 2] if cur < t['e0'] else ['G', 'A', 'D', 'D']
    for sym in seq:
        if cur >= D - 2.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'D'])
sections = [{"t0": IN, "t1": D, "style": "walk", "step": BEAT, "vel": [[IN, 0.3], [IGN2, 0.32], [t['e0'], 0.36], [D, 0.32]],
             "bass_vel": 0.95, "bass_hold": 0.9, "comp_vel": 0.4, "swing": 0.14, "stab_hold": 0.7}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue                                      # the hook is foley only (the music enters on "Congratulations")
    if c['style'] == 'term':
        mallet += [[round(a, 3), 78, 0.36, 0.18], [round(a + 0.09, 3), 81, 0.36, 0.18], [round(a + 0.18, 3), 86, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 74, 0.3, 0.16], [round(a + 0.1, 3), 81, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 74, 0.3, 0.14], [round(a + 0.12, 3), 69, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [38, 50, 57, 62, 66], "level": 0.36, "attack": 0.4, "release": 0.8, "cutoff": 950, "hp": 30}]
booms = [IN, IMPACT, IGN2, M1_IN1, LATCH, WHOOSH, AL_DOCK, SWAT, HIT, PLUG, t['e0'], LAND]
drums = [[round(b, 3), 0.4, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.5, 0], "vel": 0.1, "kind": "taiko"}]
music = {"gain_db": 0.0, "reverb_db": -11.0, "pad_db": -2.5, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "piano",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
# hook: the thief chomps and flings shells, the birds complain, the pole telescopes up
for k in range(7): e(t['squirrels'] + 0.1 + k * 0.32, "hamster_squeak", -24, -0.1, pitch=1.3 + 0.1 * (k % 3))   # chewing chitter
for k in range(6): e(t['squirrels'] + 0.2 + k * 0.4, "plip", -27, -0.1, pitch=1.8)   # shells hit the lawn
e(t['robbing'], "slurp", -21, -0.1, dur=0.3)
for k in range(3): e(t['robbing'] + 0.15 + k * 0.18, "parrot_chirp", -22, 0.4, pitch=1.4 + 0.15 * k)   # the birds protest
e(t['so0'] + 0.1, "blanket_rustle", -22, 0.2, dur=0.4, intensity=0.6)
e(POLE_UP - 0.1, "metal_groan", -20, 0.0, dur=0.3, pitch=1.8); e(POLE_UP + 0.12, "clunk", -13, 0.0, size=0.7, metal=0.9); e(POLE_UP + 0.15, "hamster_squeak", -19, 0.0, pitch=1.7)
# congrats: confetti, the ta-da, the review card
e(t['c0'], "pop", -12, 0.0); e(t['c0'] + 0.12, "pop", -16, 0.3, pitch=1.3); e(t['c0'] + 0.2, "blanket_rustle", -24, 0.0, dur=1.4, intensity=0.5)
e(t['gave'] - 0.2, "pop", -17, 0.0, pitch=1.7); e(t['five'] + 0.05, "pop", -18, 0.1, pitch=2.0)
for k in range(2): e(t['five'] + 0.35 + k * 0.25, "parrot_chirp", -23, 0.4, pitch=0.9)   # the birds, unimpressed
# baffle: shoo, the cone clamps on, the climb, the bonk, the slide, the zip up the oak, the deadpan
e(t['bso'] + 0.3, "hamster_squeak", -19, 0.0, pitch=1.9); e(t['bso'] + 0.35, "blanket_rustle", -22, 0.0, dur=0.5, intensity=0.8)
e(t['bso'] + 0.85, "giant_step", -24, 0.2, size=0.4)
e(CONE - 0.05, "metal_groan", -22, 0.0, dur=0.25, pitch=2.0); e(CONE, "metal_clang", -13, 0.0, size=0.7, pitch=1.3); e(CONE + 0.05, "knock", -18, 0.0, pitch=1.2)
ev.append({"t0": CONE + 0.4, "t1": BONK - 0.05, "sound": "footsteps", "rate": 14.0, "gain_db": -30, "pan0": 0.2, "pan1": 0.0})   # tiny claws on the pole
e(BONK, "metal_clang", -14, 0.0, size=0.6, pitch=1.6); e(BONK + 0.02, "bonk", -16, 0.0)
e(BONK + 0.05, "grate", -22, 0.0, dur=0.4)   # the slide down the pole
ev.append({"t0": ZIP0, "t1": ON_BRANCH - 0.1, "sound": "footsteps", "rate": 16.0, "gain_db": -27, "pan0": 0.0, "pan1": -0.5})
e(ZIP0 + 0.7, "wood_snap", -27, -0.5, size=0.3)
e(ON_BRANCH + 0.1, "hamster_squeak", -20, -0.4, pitch=1.2)
# jump: the dotted arc pops, the leap, the face, the step, Gary falls
for k in range(12): e(t['ten'] - 0.05 + k * 0.03, "pop", -27, -0.4 + 0.07 * k, pitch=1.6 + 0.05 * k)
e(LEAP, "blanket_rustle", -21, -0.4, dur=0.4, intensity=0.9); e(LEAP + 0.05, "hamster_squeak", -18, -0.4, pitch=2.0)
e(FACE, "bonk", -13, -0.2); e(FACE + 0.02, "plush_squeak", -18, -0.2, pitch=0.9)
e(STEP, "pop", -15, -0.1, pitch=0.8); e(STEP + 0.25, "giant_step", -13, -0.2, size=0.9); e(STEP + 0.4, "plush_squeak", -21, -0.2, pitch=0.7)
e(STEP + 0.55, "knock", -20, 0.0, pitch=1.3)   # the squirrel lands on the feeder
e(t['rso'] + 0.05, "metal_groan", -21, 0.0, dur=0.35, pitch=1.7); e(t['rso'] + 0.4, "clunk", -17, 0.0, size=0.6, metal=0.9)   # the pole telescopes back down
# rocket: it pops in, the feeder's yanked off the pole, duct tape, ignition, the hop, the fall, the crater
e(t['strap'] - 0.02, "pop", -12, 0.3, pitch=0.7); e(t['strap'], "giant_step", -15, 0.3, size=1.0)
e(GRAB, "metal_groan", -21, 0.0, dur=0.3, pitch=1.6); e(GRAB + 0.1, "hamster_squeak", -18, 0.0, pitch=1.8)
for k in range(2): e(TAPED - 0.1 + k * 0.2, "grate", -19, 0.3, dur=0.35)   # duct tape rips
e(IGN1 - 0.05, "zap", -24, 0.3, dur=0.3); e(IGN1 + 0.05, "distant_boom", -16, 0.3, dur=2.0, size=0.6)
e(APEX, "low_swell", -21, 0.2, dur=0.6, pitch=1.5)
e(FALL0 + 0.2, "metal_groan", -21, 0.2, dur=0.7, pitch=1.9)
e(t['back'], "plush_squeak", -19, 0.2, pitch=1.4)   # Gary sees it coming
e(IMPACT, "giant_step", -9, 0.2, size=1.6); e(IMPACT + 0.01, "crumble", -12, 0.2, dur=1.2, size=1.2); e(IMPACT + 0.02, "metal_clang", -15, 0.2, size=1.4, pitch=0.8)
for k in range(5): e(IMPACT + 0.35 + k * 0.12, "knock", -23, 0.2 + 0.05 * k, pitch=0.8)   # clods land
for k in range(3): e(IMPACT + 0.4 + k * 0.15, "parrot_chirp", -22, 0.5, pitch=1.8)   # the birds scatter
# orbit: pop out, the rocket rights itself, in the cockpit, LAUNCH, the climb, the cloud, space goes quiet, the arrows
e(POPOUT, "crumble", -15, 0.2, dur=0.6, size=0.7); e(POPOUT + 0.02, "pop", -15, 0.1, pitch=1.0)
e(UPRIGHT, "clunk", -15, 0.2, size=1.0, metal=0.6); e(INCOCKPIT, "latch_click", -18, 0.2)
e(INCOCKPIT - 0.2, "hamster_squeak", -20, 0.3, pitch=1.6)   # the squirrel grabs a fin
e(IGN2, "distant_boom", -11, 0.0, dur=3.0, size=1.0); e(IGN2 + 0.05, "kick", -15, 0.0)
e(t['really'], "low_swell", -18, 0.0, dur=1.4, pitch=0.7)
e(t['n17'] + 0.3, "pressure_drop", -22, 0.0, dur=1.6)   # through the cloud deck, the sky goes black
for k in range(4): e(t['falls'] + 0.1 + k * 0.45, "pop", -27, 0.2 + 0.1 * k, pitch=2.2)   # the arrows tick along the orbit
# float: the engine dies, the cockpit pops, the feeder lid, seeds drift, the squirrel paddles past
e(t['orbit'] + 0.3, "deflate", -24, 0.0, dur=0.8); e(EXIT, "latch_click", -18, -0.1)
e(EXIT + 0.1, "plush_squeak", -21, -0.1, pitch=1.4)
for k in range(6): e(EXIT + 0.3 + k * 0.35, "candy_rattle", -30, -0.2 + 0.08 * k, dur=0.4, density=12.0, size=0.5)   # seeds tumbling in zero-g
e(t['fso'] - 0.1, "hamster_squeak", -17, 0.2, pitch=1.5); e(t['fsq'], "hamster_squeak", -16, 0.2, pitch=1.9)
e(t['fsq'] - 0.35, "pop", -13, -0.2, pitch=1.4); e(t['fsq'] - 0.33, "candy_rattle", -20, -0.2, dur=0.5, density=25.0, size=0.3)   # the stowaway bursts out of the feeder (SQ_LET in shots.js)
# dock: push the rocket away, M1 rises on its thrusters, bolts, Gary dives in, M2 rises, capture, CLUNK
e(PUSH, "blanket_rustle", -22, -0.3, dur=0.4, intensity=0.8); e(PUSH + 0.2, "metal_groan", -25, -0.5, dur=1.2, pitch=0.8)
e(M1_IN0, "distant_boom", -18, 0.0, dur=1.8, size=0.5)
for k in range(6): e(M1_IN0 + 0.1 + k * 0.14, "kick", -22, 0.0)   # thruster puffs
e(M1_IN1 - 0.05, "clunk", -13, 0.0, size=1.3, metal=0.7)
for a in (BOLT1, BOLT2): e(a, "metal_clang", -16, 0.2, size=0.5, pitch=1.6); e(a + 0.05, "knock", -20, 0.2, pitch=1.4)
e(DIVE - 0.3, "latch_click", -20, 0.0); e(DIVE + 0.1, "blanket_rustle", -23, 0.0, dur=0.4, intensity=0.5)
e(M2_IN0, "distant_boom", -20, 0.0, dur=1.6, size=0.5)
for k in range(5): e(M2_IN0 + 0.2 + k * 0.15, "kick", -23, 0.0)
for i in range(1, 5): e(DOCK_T[i], "clunk", -14 - i, 0.0, size=1.1 - 0.1 * i, metal=0.8)   # the docking train: CLUNK x4
e(LATCH, "metal_clang", -10, 0.0, size=1.6, pitch=0.7); e(LATCH + 0.02, "plush_squeak", -15, 0.0, pitch=0.6); e(LATCH + 0.05, "giant_step", -15, 0.0, size=1.1)
for k in range(3): e(LATCH + 0.15 + k * 0.1, "knock", -20, -0.2 + 0.2 * k, pitch=1.1)   # the latches
e(LATCH + 0.45, "pop", -18, 0.0, pitch=1.3)   # he pops free
# dark: the sun sets, 16 sunsets (a time-lapse whir), the lights die with sparks, the hatch wheel, decompression
e(SUNSET0, "low_swell", -20, 0.0, dur=1.4, pitch=0.6)
for k in range(6): e(t['sixteen'] + k * 0.25, "pop", -28, -0.4 + 0.16 * k, pitch=0.9 + 0.1 * k)
for k in range(4): e(LIGHTS_OFF - 0.55 + k * 0.15, "zap", -24, 0.0, dur=0.15)
e(LIGHTS_OFF, "lamp_switch_click", -17, 0.0); e(LIGHTS_OFF + 0.05, "deflate", -24, 0.0, dur=0.7)
ev.append({"t0": t['kgary'], "t1": t['opens'] + 0.2, "sound": "footsteps", "rate": 7.0, "gain_db": -30, "pan0": -0.1, "pan1": 0.3})
for k in range(3): e(t['opens'] + k * 0.17, "metal_groan", -20, 0.3, dur=0.2, pitch=1.9)   # the wheel spins
e(HATCH_OPEN, "latch_click", -15, 0.3); e(HATCH_OPEN + 0.03, "metal_groan", -19, 0.3, dur=0.4, pitch=1.4)   # the door swings open
e(WHOOSH, "pressure_drop", -10, 0.4, dur=2.2); e(WHOOSH + 0.02, "kick", -14, 0.4)
e(WHOOSH + 0.05, "candy_rattle", -22, 0.5, dur=0.8, density=26.0, size=0.6); e(WHOOSH + 0.1, "blanket_rustle", -19, 0.6, dur=0.9, intensity=1.0)
e(WHOOSH + 0.1, "hamster_squeak", -18, 0.3, pitch=2.1)   # the squirrel clings on
e(TAUT, "wood_snap", -17, 0.7, size=0.5); e(TAUT + 0.02, "plush_squeak", -19, 0.7, pitch=0.8)   # the tether snaps taut
e(TAUT + 0.3, "alarm_beep", -26, 0.0, n=3, pitch=1.2)
# airlock: haul back, the module flies in, docks, vents, the mudroom (feet wiping), gear on
e(HAUL0, "grate", -22, 0.6, dur=0.9)
for k in range(5): e(AL_IN0 + 0.1 + k * 0.18, "kick", -24, 0.6)   # its thrusters
e(AL_DOCK, "clunk", -11, 0.4, size=1.2, metal=0.8); e(AL_DOCK + 0.03, "giant_step", -16, 0.4, size=0.9)
e(t['empties'] + 0.1, "pressure_drop", -20, 0.6, dur=1.4)
e(INTO_AL, "latch_click", -18, 0.4); e(INTO_AL + 0.2, "blanket_rustle", -24, 0.4, dur=0.4, intensity=0.5)
for k in range(5): e(WIPE + 0.05 + k * 0.17, "grate", -24, 0.4, dur=0.15)   # wipe, wipe, wipe
e(t['mudroom'] + 0.4, "blanket_rustle", -21, 0.4, dur=0.6, intensity=0.8); e(t['aspace'], "latch_click", -18, 0.4)   # the helmet clicks on
# solar: out the hatch, the wings unfold (a ratchet of clunks), sunrise, power back on, the swat, the fling, the bonk
e(OUT0, "pressure_drop", -24, 0.5, dur=0.8)
for k in range(NW):
    tt = UNF0 + (t['field'] + 0.25 - UNF0) * (k + 0.5) / NW
    e(tt, "clunk", -20, 0.3 + 0.07 * k, size=0.5, metal=0.6); e(tt + 0.02, "knock", -25, 0.3 + 0.07 * k, pitch=1.5)
e(SUNRISE1 - 0.4, "low_swell", -19, 0.0, dur=1.6, pitch=1.2)
for k in range(3): e(POWER_ON - 0.35 + k * 0.13, "zap", -24, 0.0, dur=0.12)
e(POWER_ON, "lamp_switch_click", -16, 0.0); e(POWER_ON + 0.05, "pop", -19, 0.0, pitch=1.6)
e(t['sit'] - 0.1, "knock", -21, 0.8, pitch=1.6)   # he pokes the stuck panel
e(SWAT - 0.05, "wood_snap", -12, 0.8, size=1.1); e(SWAT, "bonk", -11, 0.7); e(SWAT + 0.02, "metal_clang", -16, 0.7, size=1.0, pitch=1.2)
e(SWAT + 0.05, "plush_squeak", -17, 0.6, pitch=0.6)
e(SWAT + 0.7, "kick", -18, 0.3); e(SWAT + 0.95, "knock", -19, 0.1, pitch=0.9); e(SWAT + 1.05, "pop", -19, 0.0, pitch=0.9); e(SWAT + 1.3, "bonk", -14, -0.2); e(SWAT + 1.32, "plush_squeak", -19, -0.2, pitch=1.2)   # through the airlock, the helmet pops off, bonk
# life support: Gary turns blue (a strained wheeze), the scrubber + recycler pop in, the fan whirs, the haze is sucked in
e(BLUE0, "low_swell", -24, 0.0, dur=1.0, pitch=0.5); e(t['blue'] + 0.1, "whimper", -21, 0.0, pitch=1.3)
e(t['ibreath'] - 0.1, "deflate", -24, 0.0, dur=0.7)
e(SCRUB, "pop", -13, -0.2, pitch=0.8); e(SCRUB + 0.05, "clunk", -16, -0.2, size=0.8, metal=0.6)
e(t['iair'] - 0.1, "slurp", -21, -0.2, dur=0.8)   # the haze goes into the intake
e(RECYC, "pop", -13, 0.2, pitch=0.9); e(RECYC + 0.05, "clunk", -16, 0.2, size=0.8, metal=0.6)
for k in range(4): e(RECYC + 0.3 + k * 0.3, "fish_blub", -24, 0.2, n_bub=2)   # pipes gurgle
e(t['life'] - 0.05, "pop", -19, 0.0, pitch=1.4)
# water: sweat beads, a breath, the PEE bag, the gauge, the tap, the sip, the blob, the gulp
for k in range(3): e(t['sweat'] + k * 0.12, "plip", -21, 0.2, pitch=1.4 + 0.1 * k)
e(t['wbreath'], "deflate", -23, 0.1, dur=0.5)
e(t['even'] - 0.3, "hamster_squeak", -20, 0.3, pitch=1.6); e(PEE_IN, "slurp", -17, 0.3, dur=0.4); e(PEE_IN + 0.05, "plip", -20, 0.3, pitch=0.8)
for k in range(8): e(GAUGE0 + k * (GAUGE1 - GAUGE0) / 8, "knock", -27, 0.2, pitch=1.9)   # the needle ratchets to 98 %
e(GAUGE1, "pop", -17, 0.2, pitch=1.8)
e(POUR, "water_splash", -24, 0.3, dur=0.6, size=0.3)
e(SIP, "slurp", -18, 0.0, dur=0.3); e(SIP + 0.15, "fish_blub", -20, 0.0, n_bub=2)   # the coffee escapes as a blob
e(GULP - 0.05, "slurp", -14, 0.0, dur=0.4); e(GULP + 0.25, "plush_squeak", -21, 0.0, pitch=0.7)
# hit: the fleck, the hole, the alarm, the air rushes, Gary sucked onto it
e(HIT, "metal_clang", -12, -0.2, size=0.4, pitch=2.0); e(HIT + 0.02, "zap", -20, -0.2, dur=0.2)
e(HIT + 0.05, "pressure_drop", -14, -0.2, dur=3.0)
e(HIT + 0.3, "alarm_beep", -23, 0.0, n=4, pitch=1.0)
e(SUCK0, "candy_rattle", -21, -0.2, dur=0.9, density=22.0, size=0.6); e(SUCK0 + 0.1, "blanket_rustle", -20, -0.2, dur=0.9, intensity=1.0)
e(PLUG, "plush_squeak", -12, -0.2, pitch=0.5); e(PLUG + 0.02, "bonk", -15, -0.2); e(PLUG + 0.05, "kick", -17, -0.2)
e(PLUG + 0.5, "slurp", -22, -0.2, dur=0.5)   # the seal holds (a suction squeak)
# whipple: the foil wraps on (crinkle), a second fleck turns to vapor (poof), the term
e(SHIELD, "blanket_rustle", -16, -0.3, dur=0.9, intensity=1.0); e(SHIELD + 0.05, "candy_rattle", -24, -0.3, dur=0.6, density=30.0, size=0.4)
e(HIT2, "deflate", -15, -0.4, dur=0.5); e(HIT2 + 0.02, "pop", -14, -0.4, pitch=0.6)
e(t['vest'] - 0.08, "candy_rattle", -19, -0.1, dur=0.5, density=30.0, size=0.4); e(t['vest'] - 0.05, "pop", -16, -0.1, pitch=1.2)   # the tinfoil vest crinkles on
# finish: the toilet (+ its fan), the treadmill + bungees, the cupola
e(TOILET, "pop", -12, 0.3, pitch=0.8); e(TOILET + 0.05, "clunk", -16, 0.3, size=0.7, metal=0.5)
e(t['toilet'] + 0.1, "deflate", -18, 0.3, dur=0.7); e(t['toilet'] + 0.15, "slurp", -17, 0.3, dur=0.9)   # the money flushes
e(TREAD, "pop", -13, -0.3, pitch=0.9); e(TREAD + 0.05, "clunk", -17, -0.3, size=0.6, metal=0.4)
ev.append({"t0": TREAD + 0.3, "t1": t['backyard'] + 0.5, "sound": "footsteps", "rate": 11.0, "gain_db": -30, "pan0": -0.3, "pan1": -0.3})   # tiny feet on the belt
for k in range(2): e(t['bungee'] + 0.05 + k * 0.2, "wood_snap", -24, -0.3, size=0.3)   # boing, boing
e(CUPOLA, "pop", -13, 0.0, pitch=0.7); e(CUPOLA + 0.05, "clunk", -16, 0.0, size=1.0, metal=0.5)
# the ending: confetti hangs, money floats, the captain, Gary waves, the seed squeezes past, reentry, the birds, the sizzle
e(t['e0'], "pop", -12, 0.0); e(t['e0'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['e0'] + 0.15, "blanket_rustle", -22, 0.0, dur=1.6, intensity=0.5)
for k in range(3): e(t['feed'] - 0.3 + k * 0.4, "candy_rattle", -29, 0.2, dur=0.4, density=10.0, size=0.4)
for k in range(4): e(t['hundred'] + k * 0.45, "blanket_rustle", -23, -0.3 + 0.2 * k, dur=0.7, intensity=0.5)
e(t['runs'] - 0.1, "pop", -16, -0.2, pitch=1.6); e(t['runs'] + 0.05, "hamster_squeak", -18, -0.2, pitch=1.7)
e(t['egary'], "plush_squeak", -21, 0.0, pitch=0.9)
e(t['still'] - 0.1, "plush_squeak", -19, 0.0, pitch=1.3); e(t['still'] + 0.3, "slurp", -15, 0.0, dur=0.35); e(t['still'] + 0.33, "bonk", -18, 0.0)   # he tries to leave: yanked back
e(SEED_OUT - 0.45, "pop", -19, -0.2, pitch=1.8)   # the squirrel spits a shell
e(SEED_OUT - 0.05, "slurp", -16, 0.0, dur=0.4); e(SEED_OUT + 0.15, "plush_squeak", -19, 0.0, pitch=1.6)   # pfft: the seed squeezes past him
e(SEED0 + 0.2, "low_swell", -16, 0.0, dur=1.7, pitch=1.6); e(SEED0 + 0.3, "distant_boom", -22, 0.0, dur=1.8, size=0.3)
e(LAND - 0.3, "parrot_chirp", -22, 0.2, pitch=1.2)
e(LAND, "kick", -15, 0.0); e(LAND + 0.02, "zap", -17, 0.0, dur=0.9); e(LAND + 0.05, "pop", -18, 0.0, pitch=0.7)
e(LAND + 0.4, "parrot_chirp", -18, 0.0, pitch=1.6); e(LAND + 0.9, "kick", -24, 0.0); e(LAND + 0.92, "parrot_chirp", -21, 0.0, pitch=0.7);   # the cough e(LAND + 0.6, "plush_squeak", -21, 0.0, pitch=1.9); e(LAND + 1.0, "parrot_chirp", -20, 0.0, pitch=0.9)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "city_day", "t0": 0.0, "t1": IGN2 + 2.0, "fade_in": 0.2, "fade_out": 1.2, "gain_db": -33, "args": {"murmur": 0.15, "traffic": 0.35}, "seed": 1},   # the suburb
    {"sound": "dry_leaves", "t0": 0.0, "t1": IGN2 + 1.0, "fade_in": 0.2, "fade_out": 0.8, "gain_db": -36, "args": {"density": 0.5}, "seed": 2},   # the oak in the breeze
    {"sound": "rocket_rumble", "t0": IGN1, "t1": APEX + 0.4, "fade_in": 0.05, "fade_out": 0.4, "gain_db": -22, "args": {"rise": 0.6}, "seed": 3},   # the hop
    {"sound": "rocket_rumble", "t0": IGN2, "t1": t['hour'] + 0.6, "fade_in": 0.1, "fade_out": 1.0, "gain_db": -17, "args": {"rise": 1.0}, "seed": 4},   # the launch, fading as the air thins
    {"sound": "wind", "t0": IGN2 + 0.4, "t1": t['n17'] + 1.2, "fade_in": 0.3, "fade_out": 0.8, "gain_db": -27, "args": {"darkness": 0.5, "gust": 0.8, "whistle": 0.0}, "seed": 5},
    {"sound": "cabin_hum", "t0": ORBIT_IN, "t1": D - 3.5, "fade_in": 1.5, "fade_out": 1.0, "gain_db": -36, "seed": 6},   # the station's soft life-support hum
    {"sound": "fan", "t0": SCRUB + 0.2, "t1": D - 3.5, "fade_in": 0.4, "fade_out": 1.0, "gain_db": -36, "args": {"rate": 9.0}, "seed": 7},   # the scrubber fan
    {"sound": "wind", "t0": WHOOSH, "t1": TAUT + 0.6, "fade_in": 0.05, "fade_out": 0.5, "gain_db": -22, "args": {"darkness": 0.4, "gust": 1.0, "whistle": 0.0}, "seed": 8},   # air rushing out
    {"sound": "wind", "t0": PLUG + 0.4, "t1": SEED_OUT, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -33, "args": {"darkness": 0.2, "gust": 0.3, "whistle": 0.5}, "seed": 13},   # the plug leaks: a thin whistle to the end
    {"sound": "wind", "t0": HIT, "t1": PLUG + 0.15, "fade_in": 0.1, "fade_out": 0.25, "gain_db": -23, "args": {"darkness": 0.3, "gust": 1.0, "whistle": 0.0}, "seed": 9},
    {"sound": "crowd_cheer", "t0": t['e0'], "t1": t['feed'], "fade_in": 0.1, "fade_out": 0.8, "gain_db": -28, "seed": 10},
    {"sound": "wind", "t0": SEED0, "t1": LAND + 0.2, "fade_in": 0.3, "fade_out": 0.3, "gain_db": -22, "args": {"darkness": 0.5, "gust": 0.9, "whistle": 0.0}, "seed": 11},   # the dive
    {"sound": "city_day", "t0": LAND - 0.6, "t1": D, "fade_in": 0.5, "fade_out": 0.4, "gain_db": -34, "args": {"murmur": 0.1, "traffic": 0.3}, "seed": 12},   # back in the yard
]

cues = {
    "title": "032 - How a Bird Feeder Becomes a Space Station (build genre: SPACE LOUNGE walking piano + backyard/station foley + narrator)",
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
