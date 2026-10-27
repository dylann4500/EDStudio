#!/usr/bin/env python3
"""Cue sheet for 033 (build genre) -> cues.json.   python3 -I videos/033-squirt-gun-fire-truck/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 033-squirt-gun-fire-truck

Sound identity: "FIREHOUSE OOM-PAH" — a brisk parade-band oom-pah (synth.py "bounce": bass on 1 + 3, soft chord stabs on 2 + 4)
on the piano in G major at 132 bpm (I–IV–ii–V, then vi–IV–I–V once the ladder goes up), a warm G pad under it (the music never
drops out), a light march tom on 1 and 3, booms on the big impacts, and the build genre's signature rising mallet "ta-da" on every
TERM (here G5–B5–D6). 024 was a marimba ostinato in F, 025 a desert shuffle in D, 026 a disco pluck in Bb, 032 a lounge walk in D.
The hook is backyard foley only (the grill roaring, the squirt-gun pews); the music drops in on "Congratulations". A fire bed
(synth.py amb_fire) burns under the grill and the hedge; water is water_rush; the siren is a soft low-passed wail. The narrator
sits on top: music ducks ~9 dB under every phrase, ambience ~5 dB. All foley soft + low-passed."""
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
    grill=W('hook', 'grill'), squirt=W('hook', 'squirt'), gun=W('hook', 'gun'),
    congrats=W('congrats', 'congratulations'), engine=W('congrats', 'engine'), one=W('congrats', 'one'), cup=W('congrats', 'cup'), catC=W('congrats', 'cat'), impressed=W('congrats', 'impressed'),
    garyG=W('grease', 'gary'), squirts=W('grease', 'squirts'), grease=W('grease', 'grease'), fireball=W('grease', 'fireball'),
    waterT=W('triangle', 'water'), explode=W('triangle', 'explode'), needs=W('triangle', 'needs'), heat=W('triangle', 'heat'), fuel=W('triangle', 'fuel'), air=W('triangle', 'air'), slam=W('triangle', 'slam'), lid=W('triangle', 'lid'),
    triangle=W('triangle', 'triangle'), hedge=W('triangle', 'hedge'),
    works=W('tank', 'works'), sides=W('hydrant', 'sides'), never2=W('rescue', 'never'), hedges=W('tank', 'hedges'), need=W('tank', 'need'), more=W('tank', 'more'), real=W('tank', 'real'), n750=W('tank', '750'), gallons=W('tank', 'gallons'), three=W('tank', 'three'), tons=W('tank', 'tons'),
    bye=max(W('tank', 'bye'), W('tank', 'wagon')),
    soK=W('truck', 'so'), bolt=W('truck', 'bolt'), truckW=W('truck', 'truck'), booster=W('truck', 'booster'), then=W('truck', 'then'), brake=W('truck', 'brake'), going=W('truck', 'going'), so2=W('truck', 'so', 2), garyK=W('truck', 'gary'),
    split=W('baffles', 'split'), walls=W('baffles', 'walls'), holes=W('baffles', 'holes'), baffles=W('baffles', 'baffles'), garys=W('baffles', 'garys'), pants=W('baffles', 'pants'), fireB=W('baffles', 'fire'),
    nowP=W('pump', 'but'), dribbles=W('pump', 'dribbles'), soP=W('pump', 'so'), addP=W('pump', 'add'), wheel=W('pump', 'wheel'), spins=W('pump', 'that'), flings=W('pump', 'flings'), centrifugal=W('pump', 'centrifugal'), n1500=W('pump', '1500'),
    minute=W('pump', 'minute'), garyP=W('pump', 'gary'), garyP2=W('pump', 'gary', 2),
    crew=W('deckgun', 'crew'), soD=W('deckgun', 'so'), boltD=W('deckgun', 'bolt'), nozzle=W('deckgun', 'nozzle'), roof=W('deckgun', 'roof'), deck=W('deckgun', 'deck'),
    hits=W('deckgun', 'hits'), blink=W('deckgun', 'blink'),
    empties=W('hydrant', 'empties'), n30=W('hydrant', '30'), seconds=W('hydrant', 'seconds'), tap=W('hydrant', 'tap'), main=W('hydrant', 'main'), hydrant=W('hydrant', 'hydrant'), five=W('hydrant', 'five'), random=W('hydrant', 'random'), cant=W('hydrant', 'cant'), person=W('hydrant', 'person'),
    withW=W('fireout', 'with'), wrench=W('fireout', 'wrench'), fires=W('fireout', 'fires'), out=W('fireout', 'out'),
    but=W('ladder', 'but'), cats=W('ladder', 'cats'), addL=W('ladder', 'add'), ladder1=W('ladder', 'ladder'), reaches=W('ladder', 'reaches'), feet=W('ladder', 'feet'), aerial=W('ladder2', 'aerial'), twenty=W('ladder2', 'twenty'),
    reachesT=W('tip', 'reaches'), outT=W('tip', 'out'), truckT=W('tip', 'truck'), tips=W('tip', 'tips'),
    addO=W('outriggers', 'add'), legs=W('outriggers', 'legs'), brace=W('outriggers', 'brace'), ground=W('outriggers', 'ground'), outriggers=W('outriggers', 'outriggers'), under=W('outriggers', 'under'), oneO=W('outriggers', 'one'),
    addF=W('finish', 'add'), siren=W('finish', 'siren'), pole=W('finish', 'pole'), dalmatian=W('finish', 'dalmatian'), dalmatians=W('finish', 'dalmatians'), run=W('finish', 'run'), horses=W('finish', 'horses'), dont=W('finish', 'dont'), horses2=W('finish', 'horses', 2),
    climbs=W('rescue', 'climbs'), catR=W('rescue', 'cat'), firefighters=W('rescue', 'firefighters'), never=W('rescue', 'never'), skeleton=W('rescue', 'skeleton'), treeR=W('rescue', 'tree'),
    end=W('end', 'congratulations'), truckE=W('end', 'truck'), burgers=W('end', 'burgers'), nowE=W('end', 'now'), n22=W('end', '22'), dollars=W('end', 'dollars'), charcoal=W('end', 'charcoal'), stuck=W('end', 'stuck'),
    ate=W('end2', 'ate'), burgers2=W('end2', 'burgers'))

# ---- derived times: SAME formulas as shots.js (keep them in sync)
FB = t['fireball'] - 0.04
DRV0, DRV1 = t['booster'] - 0.1, t['brake']
SPLAT = t['garyK'] - 0.02; FLY0 = max(t['so2'] - 0.1, SPLAT - 0.5)
SLAM, SQUISH = t['ground'] - 0.02, t['oneO'] - 0.05
OPEN = t['wrench'] - 0.05; MEGA = OPEN + 0.25
TOTE_IN, HOP0, HOP1 = t['more'] - 0.1, t['bolt'] - 0.15, t['truckW'] + 0.05
FILL0, FILL1, EMPTY0, EMPTY1 = t['real'] - 0.15, t['gallons'] + 0.15, t['empties'] - 0.1, t['seconds'] + 0.35
BAF1, BAF2 = t['walls'] - 0.05, t['holes'] - 0.05
PUMP0, DECK0, LAD0, OUT0, SIR0 = t['addP'] - 0.05, t['nozzle'] - 0.15, t['addL'] - 0.05, t['legs'] - 0.12, t['siren'] - 0.08
BODY0 = t['booster'] - 0.12
RET0 = t['truckE'] - 0.35
OUTL = t['outriggers'] - 0.15
gx = [-12.4, -10.3, -8.2, -6.1, -4.0, -1.9, 0.2]
ignite = [t['hedge'] - 0.3 + abs(x - -4.6) / 16 for x in gx]

# ---------------------------------------------------------------- music
BPM = 132
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur, cyc = [], IN, 0
progs = [['G', 'C', 'Am', 'D'], ['G', 'Em', 'C', 'D']]
while cur < D - 2.0:
    seq = progs[(cyc // 2) % 2] if cur < t['ladder1'] else (['Em', 'C', 'G', 'D'] if cur < t['end'] else ['C', 'D', 'G', 'G'])
    for sym in seq:
        if cur >= D - 2.0: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'G'])
sections = [{"t0": IN, "t1": D, "style": "bounce", "step": BEAT, "vel": [[IN, 0.3], [t['booster'], 0.33], [t['ladder1'], 0.36], [t['end'], 0.38], [D, 0.34]],
             "bass_hold": 2.2, "stab_hold": 1.0}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue                                      # the hook is foley only (the music enters on "Congratulations")
    if c['style'] == 'term':
        mallet += [[round(a, 3), 79, 0.36, 0.18], [round(a + 0.09, 3), 83, 0.36, 0.18], [round(a + 0.18, 3), 86, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 74, 0.3, 0.16], [round(a + 0.1, 3), 79, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 74, 0.3, 0.14], [round(a + 0.12, 3), 67, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [31, 43, 50, 55, 59], "level": 0.5, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, FB, t['lid'], t['bye'], HOP1, DRV1, SPLAT, t['crew'], t['person'] - 0.05, MEGA + 0.5, t['tips'], SLAM, SQUISH, t['end']]
drums = [[round(b, 3), 0.42, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": 0.1, "kind": "tom"}]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "piano",
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
# hook: the grill flares, squirt-gun pews hiss into steam
e(0.12, "fireball", -22, -0.2, size=0.5); e(0.15, "sizzle", -24, -0.2, dur=0.6)
for k in range(5): e(t['squirt'] - 0.05 + k * 0.2, "plip", -18, -0.2, pitch=1.8 + 0.1 * (k % 2)); e(t['squirt'] + 0.05 + k * 0.2, "sizzle", -27, -0.3, dur=0.3)
# congrats: confetti, the one-cup dribble, the cat's yawn
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -16, 0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -23, 0.0, dur=1.4, intensity=0.6)
e(t['cup'], "plip", -16, 0.0, pitch=0.9); e(t['cup'] + 0.15, "plip", -20, 0.0, pitch=0.7)
e(t['impressed'] - 0.2, "cat_meow", -19, -0.4, pitch=0.7)
# grease: the squirt, the FIREBALL
for k in range(4): e(t['squirts'] + k * 0.11, "plip", -18, -0.2, pitch=1.7)
e(t['squirts'] + 0.25, "sizzle", -18, -0.2, dur=0.6)
e(FB, "fireball", -6, -0.1, size=1.2); e(FB + 0.02, "distant_boom", -14, -0.1); e(FB + 0.1, "plush_squeak", -18, 0.2, pitch=0.8)
for k in range(5): e(FB + 0.15 + k * 0.12, "pop", -22, -0.3 + 0.15 * k, pitch=0.6 + 0.1 * k)   # burgers flip in the blast
e(FB + 0.7, "knock", -18, 0.2, pitch=0.5)   # Gary lands
# triangle: the replay (water → steam), the sign + its three badges, SLAM, the AIR badge flies, the hedge goes up
e(t['waterT'] + 0.1, "sizzle", -16, -0.1, dur=0.7); e(t['explode'], "fireball", -14, -0.1, size=0.6)
e(t['needs'] - 0.1, "pop", -14, 0.3, pitch=0.9); e(t['needs'] - 0.05, "knock", -18, 0.3, pitch=0.7)
for k, a in enumerate((t['heat'], t['fuel'], t['air'])): e(a, "pop", -16, 0.2 + 0.1 * k, pitch=1.2 + 0.2 * k)
e(t['slam'], "metal_groan", -22, -0.1, dur=0.3, pitch=1.5); e(t['lid'], "metal_clang", -9, -0.1, size=1.0, pitch=0.9); e(t['lid'] + 0.02, "bonk", -16, -0.1)
e(t['lid'] + 0.05, "wood_snap", -18, 0.3, size=0.5); e(t['lid'] + 0.3, "sizzle", -20, -0.1, dur=1.0)
for k in range(7): e(ignite[k], "fireball", -15 - (k % 2) * 3, -0.8 + 0.25 * k, size=0.6)
# tank: one last squirt at the hedge (tss); Gary's dash, the tote pops onto the wagon, the garden hose fills it, the wagon creaks … CRUNCH
for k in range(3): e(t['works'] + k * 0.15, "plip", -20, -0.4, pitch=1.9)
e(t['works'] + 0.35, "sizzle", -22, -0.5, dur=0.4); e(t['need'], "blanket_rustle", -21, -0.3, dur=0.4, intensity=0.9)
steps(t['need'], t['more'] + 0.1, 9.0, -22, -0.4, 0.4)
e(TOTE_IN + 0.1, "pop", -13, 0.4, pitch=0.7); e(TOTE_IN + 0.15, "clunk", -16, 0.4, size=1.0, metal=0.3)
for k in range(3): e(t['three'] + k * 0.22, "metal_groan", -20 + k, 0.4, dur=0.35, pitch=1.4 - 0.1 * k)
e(t['bye'], "car_crash", -10, 0.4, weight=0.5); e(t['bye'] + 0.03, "splash", -15, 0.4, size=0.8); e(t['bye'] + 0.05, "wood_snap", -16, 0.4, size=0.8)
for k in range(4): e(t['bye'] + 0.1 + k * 0.09, "knock", -22, 0.3 + 0.05 * k, pitch=1.5)   # wagon wheels bounce away
# truck: the boing, the tote slams onto the bed, three bolts, the body grows, the drive, the BRAKE, the surge, Gary's splat
e(HOP0 + 0.03, "plush_squeak", -14, 0.4, pitch=0.6); e(HOP0 + 0.05, "metal_groan", -20, 0.4, dur=0.3, pitch=2.0)
e(HOP1, "clunk", -8, 0.3, size=1.3, metal=0.5); e(HOP1 + 0.02, "splash", -16, 0.3, size=0.6)
for k in range(3): e(HOP1 + 0.18 + k * 0.22, "zap", -24, 0.2, dur=0.15); e(HOP1 + 0.18 + k * 0.22, "knock", -17, 0.2, pitch=1.6)
e(BODY0 + 0.15, "pop", -12, 0.1, pitch=0.7); e(BODY0 + 0.25, "clunk", -15, 0.1, size=1.1, metal=0.8); e(BODY0 + 0.3, "pop", -16, 0.2, pitch=1.4)
e(DRV0, "car_pass", -14, 0.4, dur=max(0.6, DRV1 - DRV0 + 0.2), size=1.3)
e(DRV1 - 0.05, "metal_groan", -12, -0.1, dur=0.6, pitch=1.9); e(DRV1, "kick", -16, -0.1)   # the brakes
e(t['going'] - 0.3, "splash", -10, 0.0, size=1.4); e(t['going'], "splash", -15, 0.0, size=0.9)
for k in range(5): e(t['going'] + 0.2 + k * 0.18, "plip", -22, 0.0, pitch=0.8 + 0.1 * k)
e(FLY0 + 0.05, "plush_squeak", -18, -0.2, pitch=1.4); e(SPLAT, "bonk", -10, -0.2); e(SPLAT + 0.02, "clunk", -16, -0.2, size=0.8, metal=0.8); e(SPLAT + 0.3, "plush_squeak", -20, -0.2, pitch=0.7)
# baffles: two plates slot in (hammer), the cells calm; his pants sizzle; he runs a lap
for k, a in enumerate((BAF1, BAF2)): e(a, "pop", -14, 0.0, pitch=1.0 + 0.2 * k); e(a + 0.18, "metal_clang", -15, 0.0, size=0.7, pitch=1.2)
for k in range(5): e(BAF1 + 0.1 + k * 0.28, "knock", -20, 0.1, pitch=1.3)
for k in range(4): e(BAF2 + 0.4 + k * 0.3, "plip", -24, 0.0, pitch=1.0 + 0.15 * k)
e(t['pants'], "sizzle", -15, 0.2, dur=0.8); e(t['fireB'] - 0.1, "plush_squeak", -16, 0.2, pitch=1.7)
steps(t['fireB'] - 0.2, t['nowP'], 9.0, -23, 0.1, 0.3)
# pump: the dribble on his pants (sizzle out), the pump drops in, spins up, flings; 1,500 gpm; the hose holds Gary
for k in range(4): e(t['dribbles'] - 0.1 + k * 0.15, "plip", -18, 0.1, pitch=0.6 + 0.1 * k)
e(t['dribbles'] + 0.35, "sizzle", -13, 0.1, dur=0.9)
e(PUMP0 + 0.15, "clunk", -11, -0.1, size=1.2, metal=0.9); e(PUMP0 + 0.2, "pop", -17, -0.1, pitch=0.8)
e(t['spins'], "low_swell", -18, -0.1, dur=1.0, pitch=1.6); e(t['flings'], "splash", -16, -0.1, size=0.7)
e(t['n1500'] - 0.05, "pop", -12, 0.0, pitch=0.6); e(t['n1500'], "splash", -12, -0.2, size=1.2)
steps(t['garyP'], t['garyP2'], 7.0, -23, 0.1, 0.2)
e(t['garyP2'] - 0.05, "plush_squeak", -14, 0.0, pitch=1.6)
for k in range(6): e(t['garyP2'] + 0.15 + k * 0.42, "splash", -19, -0.6 + 0.24 * k, size=0.5)
e(t['crew'], "giant_step", -12, 0.1, size=0.9); e(t['crew'] + 0.02, "bonk", -16, 0.1)
# deck gun: Gary hops up, bolts it on (hammer), BLAST; the steam off the hedge; the level drops, the stream dies
e(t['soD'] + 0.4, "knock", -18, 0.2, pitch=0.8)
for k in range(2): e(t['boltD'] + k * 0.4, "metal_clang", -15, 0.1, size=0.6, pitch=1.3); e(t['boltD'] + k * 0.4 + 0.02, "zap", -26, 0.1, dur=0.15)
e(DECK0 + 0.1, "pop", -14, 0.1, pitch=0.8)
e(t['deck'] - 0.03, "pop", -12, 0.1, pitch=0.5)
for k in range(4): e(t['deck'] + 0.9 + k * 0.35, "sizzle", -16 - k, -0.6 + 0.1 * k, dur=0.8)
e(t['hits'], "splash", -11, -0.5, size=1.0); e(t['hits'] + 0.1, "cat_meow", -26, -0.5, pitch=0.5)
for k in range(6): e(t['hits'] + 0.5 + k * 0.28, "plip", -23, -0.5, pitch=1.2)
e(t['blink'] + 0.5, "blanket_rustle", -18, -0.5, dur=0.5, intensity=1.0); e(t['blink'] + 0.55, "splash", -20, -0.5, size=0.4)   # the wet-cat shake
for k in range(6): e(t['empties'] + k * 0.25, "plip", -21, 0.1, pitch=1.4 - 0.12 * k)
e(t['seconds'] + 0.2, "slurp", -15, 0.1, dur=0.5)   # the tank sucks dry
for k in range(3): e(EMPTY1 + 0.3 + k * 0.2, "fireball", -17, -0.6 + 0.2 * k, size=0.5)   # the fire flares back
for k in range(3): e(EMPTY1 + k * 0.3, "plip", -21, 0.1, pitch=0.7)   # the last dribble
# hydrant: the hose dragged + coupled, the hex wrench skids on the pentagon nut, BONK; the right wrench, the valve, the rush, OUT
steps(t['tap'] - 0.1, t['main'], 8.0, -22, 0.2, -0.3)
e(t['main'], "clunk", -14, -0.3, size=0.8, metal=0.9); e(t['main'] + 0.05, "knock", -18, -0.3, pitch=1.4)
e(t['five'] - 0.1, "metal_clang", -17, -0.3, size=0.4, pitch=1.6); e(t['five'], "grate", -22, -0.3, dur=0.25); e(t['sides'], "grate", -22, -0.3, dur=0.25)
for k in range(6): e(t['random'] + k * 0.13, "knock", -19, -0.3, pitch=1.8 + 0.05 * (k % 3))
e(t['cant'], "metal_groan", -19, -0.3, dur=0.4, pitch=2.0)
e(t['person'] - 0.05, "bonk", -8, -0.3); e(t['person'] - 0.03, "metal_clang", -16, -0.3, size=0.5, pitch=1.4)
e(t['withW'], "grate", -20, 0.2, dur=0.3); e(t['wrench'] - 0.05, "knock", -16, -0.3, pitch=1.1)
e(OPEN, "metal_groan", -15, -0.3, dur=0.5, pitch=1.2); e(OPEN + 0.1, "clunk", -14, -0.3, size=1.0, metal=0.9)
e(MEGA, "pop", -11, 0.1, pitch=0.5)
for k in range(7): e(MEGA + 0.5 + k * 0.05, "sizzle", -13 - (k % 3) * 2, -0.8 + 0.25 * k, dur=1.2)
# ladder: the turntable pops, the ladder swings up, four sections clank out, the cat looks up; it tips
e(LAD0 + 0.1, "pop", -13, 0.1, pitch=0.8); e(LAD0 + 0.15, "clunk", -15, 0.1, size=1.1, metal=0.9)
e(t['ladder1'], "metal_groan", -16, 0.0, dur=1.0, pitch=1.1)
for k in range(3): e(t['reaches'] + 0.15 + k * 0.28, "metal_clang", -15 - k, -0.2 - 0.15 * k, size=1.0, pitch=1.2 + 0.15 * k)
e(t['feet'] - 0.2, "low_swell", -18, -0.3, dur=1.4, pitch=1.4)
e(t['twenty'] + 0.1, "cat_meow", -21, -0.5, pitch=0.6)
e(t['reachesT'], "metal_groan", -13, 0.0, dur=1.5, pitch=0.8)
steps(t['outT'] - 0.1, t['tips'] - 0.1, 9.0, -23, -0.1, 0.4)
e(t['tips'], "car_crash", -9, 0.2, weight=0.6); e(t['tips'] + 0.05, "metal_groan", -12, 0.2, dur=0.9, pitch=0.7)
# outriggers: four beams shoot out, the front jacks plant, the tail slams down, Gary is flung, the near jack lands on him
for k in range(4): e(OUT0 + 0.05 + k * 0.06, "metal_groan", -20, -0.3 + 0.2 * k, dur=0.25, pitch=1.9)
for k in range(4): e(OUT0 + 0.2 + k * 0.06, "clunk", -17, -0.3 + 0.2 * k, size=0.7, metal=0.9)
e(t['brace'] + 0.05, "clunk", -12, -0.4, size=1.2, metal=0.7); e(t['brace'] + 0.1, "metal_groan", -16, -0.3, dur=0.7, pitch=0.9)
e(SLAM, "giant_step", -6, 0.1, size=1.6); e(SLAM + 0.02, "car_crash", -12, 0.1, weight=0.4); e(SLAM + 0.05, "plush_squeak", -16, 0.4, pitch=1.6)
e(OUTL, "knock", -15, 0.4, pitch=0.5); e(OUTL + 0.03, "plush_squeak", -19, 0.4, pitch=0.9)
e(SQUISH - 0.15, "metal_groan", -20, 0.4, dur=0.2, pitch=1.8); e(SQUISH, "clunk", -10, 0.4, size=1.1, metal=0.6); e(SQUISH + 0.02, "plush_squeak", -12, 0.4, pitch=0.5)
# finish: the siren, the light bar, the fire pole, the Dalmatian slides down, runs ahead, looks for horses
e(SIR0 + 0.05, "pop", -15, -0.4, pitch=1.0); e(t['siren'], "siren", -16, -0.4, dur=1.6)
e(t['pole'] - 0.05, "pop", -14, 0.0, pitch=1.2); e(t['pole'], "metal_clang", -18, 0.0, size=0.5, pitch=1.9)
e(t['dalmatian'] - 0.05, "pop", -14, 0.0, pitch=1.4); e(t['dalmatian'] + 0.1, "grate", -20, 0.0, dur=0.25)   # a 0.3 s slide down a three-foot pole
e(t['dalmatian'] + 0.4, "knock", -16, 0.0, pitch=0.9); e(t['dalmatians'], "dog_bark", -15, 0.0)
steps(t['run'] - 0.25, t['horses'], 10.0, -24, 0.0, -0.5)
e(t['horses'] + 0.1, "dog_bark", -18, -0.5); e(t['horses2'] + 0.1, "whimper", -20, -0.5)
e(t['dalmatians'] + 0.12, "plush_squeak", -14, 0.4, pitch=1.8)   # Gary pops back into shape
steps(t['dalmatians'] + 0.55, t['dont'], 8.0, -24, 0.4, 0.1)
# rescue: up the ladder (rung knocks), the cat walks off, backs down the trunk (scratching)
for k in range(8): e(t['climbs'] - 0.1 + k * 0.2, "knock", -21, 0.1 - 0.08 * k, pitch=1.6 + 0.05 * (k % 2))
e(t['firefighters'] + 0.1, "cat_meow", -18, -0.5, pitch=0.8); e(t['never2'], "plush_squeak", -22, -0.5, pitch=0.6)
e(t['never'], "grate", -18, -0.6, dur=max(0.4, t['treeR'] - t['never'])); e(t['treeR'], "knock", -20, -0.6, pitch=1.3)
# end: the Dalmatian hits the lever, the ladder pulls away, Gary grabs the branch; money; STUCK; the cat eats
e(RET0 - 0.3, "dog_bark", -18, 0.1); e(RET0, "knock", -14, 0.1, pitch=0.9); e(RET0 + 0.05, "metal_groan", -15, -0.2, dur=1.2, pitch=1.3)
e(RET0 + 0.35, "plush_squeak", -14, -0.5, pitch=1.9); e(RET0 + 0.4, "crumble", -22, -0.5, dur=0.5, size=0.3)
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -23, 0.0, dur=1.4, intensity=0.6)
e(t['stuck'] + 0.02, "wood_snap", -20, -0.5, size=0.4); e(t['stuck'] + 0.1, "blanket_rustle", -24, -0.5, dur=0.6, intensity=0.5)
steps(t['end'], RET0 - 0.45, 9.0, -25, -0.3, 0.2)
steps(t['treeR'] + 0.1, t['burgers'] - 0.25, 7.0, -27, -0.5, -0.2)
e(t['burgers'] - 0.1, "knock", -19, -0.2, pitch=0.8)
for k in range(5): e(t['n22'] + k * 0.4, "blanket_rustle", -22, -0.3 + 0.15 * k, dur=0.7, intensity=0.5)
e(t['stuck'], "knock", -13, 0.0, pitch=0.7); e(t['stuck'] + 0.02, "bonk", -18, 0.0)
for k in range(4): e(t['nowE'] + 0.3 + k * 0.55, "plush_squeak", -27, -0.2, pitch=2.2)   # the cat sniffs the plate
for k in range(3): e(t['burgers2'] - 0.25 + k * 0.32, "slurp", -14, -0.2, dur=0.25); e(t['burgers2'] - 0.2 + k * 0.32, "knock", -20, -0.2, pitch=1.6)
e(t['burgers2'] + 0.6, "cat_meow", -18, -0.2, pitch=0.9)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "fire", "t0": 0.0, "t1": t['lid'] + 0.2, "fade_in": 0.1, "fade_out": 0.3, "gain_db": -27, "args": {"intensity": 1.0}, "seed": 1},   # the grill
    {"sound": "city_day", "t0": 0.0, "t1": IN + 0.8, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -36, "args": {"murmur": 0.0, "traffic": 0.4}, "seed": 2},
    {"sound": "crickets", "t0": 0.0, "t1": D, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -44, "seed": 3},
    {"sound": "fire", "t0": ignite[3], "t1": MEGA + 1.0, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -26, "args": {"intensity": 1.4}, "seed": 4},   # the hedge
    {"sound": "water_rush", "t0": FILL0, "t1": t['bye'], "fade_in": 0.2, "fade_out": 0.2, "gain_db": -32, "seed": 5},   # the garden hose
    {"sound": "drill", "t0": DRV0, "t1": DRV1 + 0.3, "fade_in": 0.2, "fade_out": 0.2, "gain_db": -30, "args": {"rate": 5.0}, "seed": 6},   # the engine
    {"sound": "drill", "t0": t['spins'], "t1": MEGA + 2.6, "fade_in": 0.6, "fade_out": 0.6, "gain_db": -36, "args": {"rate": 18.0}, "seed": 7},   # the pump whine (low)
    {"sound": "water_rush", "t0": t['n1500'] - 0.05, "t1": t['crew'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -26, "seed": 8},   # the handline
    {"sound": "wind", "t0": t['garyP2'], "t1": t['crew'], "fade_in": 0.1, "fade_out": 0.2, "gain_db": -29, "args": {"darkness": 0.5, "gust": 0.8, "whistle": 0.0}, "seed": 9},
    {"sound": "water_rush", "t0": t['deck'] - 0.05, "t1": EMPTY1 - 0.2, "fade_in": 0.1, "fade_out": 0.5, "gain_db": -25, "seed": 10},   # the deck gun
    {"sound": "water_rush", "t0": OPEN, "t1": MEGA + 2.6, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -22, "seed": 11},   # the hydrant + the mega blast
    {"sound": "crowd_cheer", "t0": t['out'], "t1": t['out'] + 1.6, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -30, "seed": 12},
    {"sound": "wind", "t0": t['feet'] - 0.6, "t1": t['twenty'] + 0.4, "fade_in": 0.4, "fade_out": 0.4, "gain_db": -32, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 13},   # up at 100 ft
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['end'] + 1.6, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -29, "seed": 14},
]

cues = {
    "title": "033 - How a Squirt Gun Becomes a Fire Truck (build genre: FIREHOUSE OOM-PAH piano + fire/water foley + narrator)",
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
