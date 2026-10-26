#!/usr/bin/env python3
"""Cue sheet for 015 (build genre) -> cues.json.   python3 -I videos/015-hole-subway/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 015-hole-subway

Sound identity: "WORKSHOP" — a bright marimba ostinato in F major at 118 bpm (I–V–vi–IV) with a piano bass, a soft F pad
under everything (the music never drops out), a very light taiko pulse, and a rising marimba "ta-da" (F–A–C) on every
engineering TERM callout — the build genre's audio signature. The hook is traffic + shovel only; the music drops in on
"Congratulations" (house rule: quiet open, music enters on the premise). The narrator sits on top: music ducks ~9 dB under
every phrase, ambience ~5 dB. Construction foley is soft and low-passed (audio/synth.py section 6b)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    hits = [w[1] for w in B[beat]['w'] if w[0] == norm(word)]
    return hits[n - 1]


s0 = lambda b: B[b]['t0']
s1 = lambda b: B[b]['t1']
T = lambda w, bt: W(bt, w)
t = dict(traffic=T('traffic', 'hook'), shovel=T('shovel', 'hook'), dig=T('dig', 'hook'), digEnd=s1('hook') + 0.35, congrats=T('congratulations', 'congrats'),
         nowhere=T('nowhere', 'congrats'), racc=T('raccoon', 'congrats'), already=T('already', 'congrats'),
         send=T('send', 'cavein'), down=T('down', 'cavein'), inspect=T('inspect', 'cavein'), walls=T('walls', 'cavein'), imm=T('immediately', 'cavein'), give=T('give', 'cavein'), fossil=T('fossil', 'cavein'),
         digOut=T('dig', 'shoring'), out=T('out', 'shoring'), planks=T('planks', 'shoring'), beams=T('beams', 'shoring'), bouncer=T('bouncer', 'shoring'), dirt=T('dirt', 'shoring'), dirt2=W('shoring', 'dirt', 2), notW=T('not', 'shoring'), list=T('list', 'shoring'),
         digs=T('digs', 'water'), floor=T('floor', 'water'), leak=T('leaking', 'water'), table=T('table', 'water'), sponge=T('sponge', 'water'), cant=T('cant', 'water'), brought=T('brought', 'water'), floatie=T('floatie', 'water'),
         install=T('install', 'pumps'), never=T('never', 'pumps'), ny=T('new', 'pumps'), n13=T('13', 'pumps'), yours=T('yours', 'pumps'), drain=T('drain', 'pumps'), trafficP=T('car', 'pumps'), car=T('car', 'pumps'), day=T('day', 'pumps'),
         now=T('now', 'byhand'), sideways=T('sideways', 'byhand'), withB=T('with', 'byhand'), n100=T('100', 'byhand'), years=T('years', 'byhand'), load=T('longer', 'byhand'),
         soT=T('so', 'tbm'), buy=T('buy', 'tbm'), machine=T('machine', 'tbm'), spinning=T('spinning', 'tbm'), cheese=T('cheese', 'tbm'), chews=T('chews', 'tbm'), snail=T('snail', 'tbm'), lapped=T('lapped', 'tbm'),
         bad=T('bad', 'sink'), isNow=T('now', 'sink'), holding=T('holding', 'sink'), settle=T('settlement', 'sink'), sinking=T('sinking', 'sink'), tunnelS=T('tunnel', 'sink'), crois=T('croissants', 'sink'), first=T('first', 'sink'),
         soR=T('so', 'rings'), digsR=T('digs', 'rings'), bolts=T('bolts', 'rings'), segment=T('segment', 'rings'), ringsW=T('rings', 'rings'), n60=T('60', 'rings'), they=T('they', 'rings'), up=T('up', 'rings'),
         load2=T('loadbearing', 'rings'), donuts=T('donuts', 'rings'), garyR=T('gary', 'rings'), carry=T('carry', 'rings'), pancake=T('pancake', 'rings'),
         miles=T('miles', 'air'), zero=T('zero', 'air'), passesG=T('gary', 'air'), passes=T('passes', 'air'), pigeon=T('pigeon', 'air'), fine=T('fine', 'air'), add=T('add', 'air'), shafts=T('shafts', 'air'),
         fans=T('fans', 'air'), giant=T('giant', 'air'), outA=T('out', 'air'), blast=T('blast', 'air'), street=T('street', 'air'), wakes=T('wakes', 'air'), midair=T('midair', 'air'),
         trains=T('trains', 'power'), power=T('power', 'power'), third=T('third', 'power'), v625=T('625', 'power'), garyD2=W('power', 'gary', 2), touched=T('touched', 'power'), night=T('nightlight', 'power'),
         addF=T('add', 'finish'), stations=T('stations', 'finish'), esc=T('escalators', 'finish'), turn=T('turnstiles', 'finish'), map=T('map', 'finish'), puddle=T('puddle', 'finish'),
         end=T('congratulations', 'end'), subwayE=T('subway', 'end'), skip=T('skip', 'end'), trafficE=T('traffic', 'end'), nowE=T('now', 'end'), mile=T('mile', 'end'), stuck=T('stuck', 'end'), train=T('train', 'end'),
         garyE=T('gary', 'end'), n43=T('43', 'end'), built=T('built', 'end'), pays=T('pays', 'end'), n3=T('3', 'end'), dollars2=W('end', 'dollars', 2), ride=T('ride', 'end'), hole=T('hole', 'end'), dug=T('dug', 'end'), andE=T('and', 'end'), racE=T('raccoon', 'end'), rides=T('rides', 'end'), free=T('free', 'end'))

# ---- derived times + paths: SAME formulas as shots.js (keep them in sync)
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
lerp = lambda a, b, u: a + (b - a) * clamp(u)
u01 = lambda tt, a, b: clamp((tt - a) / (b - a))
smooth = lambda u: u * u * (3 - 2 * u)
def tbmX(tt):
    if tt < t['chews']: return -5.6
    if tt < t['bad']: return -5.6 + 1.25 * smooth(u01(tt, t['chews'], t['bad']))
    if tt < t['soR']: return lerp(-4.35, 10.5, u01(tt, t['bad'], t['soR']))
    if tt < t['ringsW'] + 0.5: return lerp(10.5, 13.5, u01(tt, t['soR'], t['ringsW'] + 0.5))
    if tt < t['miles']: return lerp(13.5, 15.5, u01(tt, t['ringsW'] + 0.5, t['miles']))
    return 15.5 + (tt - t['miles']) ** 2 * 30
tail = lambda tt: tbmX(tt) - 4.2
SHRED = next(x / 100 for x in range(int(t['chews'] * 100), int(t['bad'] * 100)) if tbmX(x / 100) + 0.74 >= -4.27)
PANC, POOF = t['pancake'] - 0.25, t['miles'] - 0.4
SLIP, LAND = t['first'] - 0.12, t['first'] + 0.42
BLOWN, LAND_A = t['blast'] + 0.2, t['midair'] + 0.68
TRK0 = LAND_A + 0.05; TP0, DEP = TRK0 + 0.25, t['night'] + 0.75
FLING = DEP + ((17.3 - 12.2) / 40) ** 0.5; SCOOP = DEP + (1.0 / 40) ** 0.5; FLAND = FLING + 0.85
BUMP = t['stuck']; GW_through = t['subwayE'] + 0.1
ring_x = [-4.2 + 0.45 + 0.9 * i for i in range(60) if -4.2 + 0.45 + 0.9 * i < 34]
tailR = tail(t['soR'])
def ringT(x):
    if x < 1.0: return lerp(t['digsR'], t['bolts'], (1.0 - x) / (1.0 + 4.2))
    if x < 5.0: return lerp(t['they'] - 0.1, t['up'], (x - 1.0) / 4.0)
    if x < tailR: return t['bolts'] - 0.1 + (tailR - x) * 0.15
    tt = t['soR']
    while tt < D:
        if tail(tt) - 0.45 > x: return tt
        tt += 0.02
    return 1e9
ring_t = [r for r in (ringT(x) for x in ring_x) if r < t['miles']]
TR1_a, TR1_b = t['end'] - 0.6, t['subwayE'] + 1.0

# ---------------------------------------------------------------- music
BPM = 118
BEAT = 60 / BPM
E8 = BEAT / 2
IN = t['congrats'] - 0.02
chords, k = [], 0
prog = [['F', 'C', 'Dm', 'Bb'], ['Dm', 'Bb', 'F', 'C']]
cur, cyc = IN, 0
while cur < D - 2.5:
    seq = prog[(cyc // 2) % 2] if cur < t['stations'] else ['Bb', 'C', 'F', 'F']
    for sym in seq:
        if cur >= D - 2.5: break
        chords.append([round(cur, 3), sym]); cur += 2 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'F'])
sections = [{"t0": IN, "t1": D, "style": "ostinato", "inst": "mallet", "step": E8, "pattern": [0, 2, 1, 2, 4, 2, 1, 2],
             "vel": [[IN, 0.26], [t['soT'], 0.3], [t['stations'], 0.33], [D, 0.3]], "len": 0.85, "bass_every": 4, "bass_vel": 0.7}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    if c['style'] == 'term':
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 77, 0.36, 0.18], [round(a + 0.09, 3), 81, 0.36, 0.18], [round(a + 0.18, 3), 84, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 72, 0.3, 0.16], [round(a + 0.1, 3), 77, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        a = c['t0'] + 0.02
        mallet += [[round(a, 3), 70, 0.3, 0.14], [round(a + 0.12, 3), 65, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [29, 41, 48, 53, 57], "level": 0.42, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, t['give'], t['machine'], t['sinking'] + 0.2, t['pancake'] - 0.5, t['stations'], t['end']]
drums = [[round(b, 3), 0.42, "boom"] for b in booms] + [[round(t['touched'], 3), 0.3, "taiko"]]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.55, 0], "vel": 0.12, "kind": "taiko"}]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": -5.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "piano",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, room=None, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if room is not None: d["room"] = room
    if args: d["args"] = args
    ev.append(d)
e(0.3, "car_horn", -22, -0.35, pitch=1.0, distance=1.3); e(t['traffic'] + 0.05, "car_horn", -19, 0.35, pitch=1.15, distance=1.0)
e(t['shovel'] + 0.28, "dig", -16, -0.1)
for k in range(5): e(t['dig'] + (k + 0.6) / 5 * (t['digEnd'] - t['dig']) - 0.05, "dig", -14, -0.1 + 0.05 * k)
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -16, -0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -24, 0.2, dur=1.4, intensity=0.6)
e(t['nowhere'] - 0.1, "knock", -18, 0.2, pitch=1.1)
e(t['racc'] - 0.15, "pop", -16, -0.3, pitch=1.7); e(t['racc'] + 0.4, "plush_squeak", -24, -0.3, pitch=1.4); e(t['already'] - 0.1, "pop", -20, -0.2, pitch=1.4)
e(t['send'] - 0.25, "knock", -17, 0.1, pitch=0.9); e(t['send'] + 0.15, "knock", -20, 0.1, pitch=0.8)          # the ladder lands
ev.append({"t0": t['send'] - 0.05, "t1": t['down'] - 0.1, "sound": "footsteps", "rate": 3.4, "gain_db": -24, "pan0": 0.3, "pan1": 0.0})
for k in range(4): e(t['down'] + 0.1 + k * 0.12, "knock", -24, 0.0, pitch=1.3 + 0.05 * k)
e(t['inspect'] + 0.1, "pen_scribble", -24, 0.1, dur=0.6)
e(t['walls'] - 0.05, "crumble", -20, 0.0, dur=0.9, size=0.5); e(t['walls'] + 0.1, "bonk", -22, 0.0); e(t['imm'] + 0.05, "slurp", -24, 0.0, dur=0.25)   # pebble on the hat, gulp
e(t['give'], "crumble", -9, 0.0, dur=1.8, size=1.4); e(t['give'] + 0.05, "giant_step", -12, 0.0, size=1.2)
e(t['fossil'] - 0.15, "pop", -18, 0.2, pitch=0.9); e(t['fossil'] + 0.55, "plush_squeak", -22, 0.2, pitch=0.8)
e(t['out'] - 0.12, "dig", -14, -0.1)
e(t['out'], "pop", -9, 0.0, pitch=0.6); e(t['out'] + 0.02, "crumble", -12, 0.0, dur=1.0, size=1.0); e(t['out'] + 0.85, "giant_step", -16, 0.0, size=0.45); e(t['out'] + 0.9, "knock", -18, -0.4, pitch=0.8)
for i in range(16): e(t['planks'] + i * 0.04, "knock", -19 - (i % 3), -0.5 + i / 16, pitch=0.9 + 0.1 * (i % 4))
for i in range(6): e(t['beams'] - 0.15 + i * 0.06, "knock", -15, -0.3 + 0.12 * i, pitch=0.7)
e(t['bouncer'] - 0.3, "crumble", -22, -0.3, dur=0.5, size=0.3); e(t['dirt'], "bonk", -16, -0.2); e(t['dirt'] + 0.02, "knock", -15, -0.3, pitch=0.8)
e(t['dirt2'] - 0.15, "crumble", -24, 0.4, dur=0.4, size=0.25); e(t['notW'], "plush_squeak", -24, 0.0, pitch=0.9); e(t['list'] + 0.05, "crumble", -25, 0.4, dur=0.4, size=0.25)
for k in range(4): e(t['digs'] + k * 0.22, "dig", -14, 0.05 * k)
e(t['floor'] - 0.1, "splash", -16, 0.0, size=0.8)
e(t['sponge'], "slurp", -16, 0.2, dur=0.6)
for k in range(7): e(t['cant'] + k * 0.3, "splash", -21 + (k % 2), -0.2 + 0.08 * k, size=0.5)
e(t['brought'] - 0.05, "splash", -11, -0.3, size=1.4); e(t['floatie'] - 0.1, "plush_squeak", -21, -0.3, pitch=1.6)
e(t['install'] + 0.3, "splash", -13, 0.0, size=1.3); e(t['install'] + 0.35, "clunk", -15, 0.0, size=0.8, metal=0.7)
e(t['never'] + 0.2, "slurp", -15, 0.0, dur=1.0)
e(t['day'] - 0.3, "pop", -21, -0.2, pitch=1.5); e(t['drain'] - 0.2, "knock", -17, -0.2, pitch=0.8)   # the hose whips up into his window
for k in range(3): e(t['drain'] + 0.1 + k * 0.35, "slurp", -18, -0.2, dur=0.3)   # three glugs
e(t['car'] - 0.15, "splash", -14, -0.2, size=1.3)
e(t['trafficP'] + 0.05, "car_horn", -16, -0.3, pitch=0.95, distance=0.9); e(t['trafficP'] + 0.5, "car_horn", -21, 0.3, pitch=1.1, distance=1.2)
for k in range(4): e(t['now'] + k * 0.2, "dig", -18, -0.1)
for k in range(10): e(t['withB'] + 0.1 + k * 0.28, "dig", -22, 0.2, size=0.6)
e(t['n100'] - 0.15, "blanket_rustle", -21, -0.2, dur=1.0, intensity=0.6); e(t['years'] - 0.3, "low_swell", -20, 0.0, dur=2.0)
e(t['load'] - 0.15, "blanket_rustle", -21, -0.2, dur=1.0, intensity=0.7)   # the beard unrolls out of the tunnel
e(t['soT'] + 0.05, "crumble", -12, 0.0, dur=1.2, size=1.0)
e(t['buy'], "metal_groan", -20, 0.0, dur=1.0, pitch=0.9); e(t['buy'] + 0.25, "knock", -20, 0.3, pitch=0.8)
e(t['machine'], "clunk", -8, 0.0, size=2.2, metal=0.9); e(t['machine'] + 0.02, "giant_step", -10, 0.0, size=1.8)
e(t['spinning'] + 0.2, "grate", -18, 0.2, dur=0.5); e(t['cheese'] + 0.05, "grate", -15, 0.2, dur=1.0)
for k in range(int((SHRED - t['chews']) / 0.12)): e(t['chews'] + 0.05 + k * 0.12, "knock", -24, 0.3, pitch=1.3)
e(SHRED, "grate", -15, 0.3, dur=0.6); e(SHRED + 0.02, "crumble", -18, 0.3, dur=0.5, size=0.4)
e(t['snail'] - 0.6, "plush_squeak", -21, -0.3, pitch=1.8); e(t['lapped'], "plush_squeak", -21, 0.3, pitch=2.0); e(SHRED + 0.4, "giant_step", -19, 0.2, size=0.35)
e(t['holding'] - 0.2, "crumble", -17, 0.1, dur=0.9, size=0.5)
e(t['settle'] - 0.3, "crumble", -14, 0.0, dur=1.0, size=0.8); e(t['settle'] - 0.25, "metal_groan", -18, 0.1, dur=1.2, pitch=1.2)
e(t['isNow'] - 0.2, "crumble", -10, 0.0, dur=1.8, size=1.2); e(t['isNow'] - 0.1, "metal_groan", -16, -0.1, dur=1.6, pitch=1.0)
e(SLIP, "plush_squeak", -20, -0.2, pitch=1.3); e(LAND, "giant_step", -15, -0.1, size=0.5)
for i in range(5): e(t['crois'] - 0.4 + i * 0.08 + 0.93, "plush_squeak", -24, -0.2 + 0.08 * i, pitch=0.9 + 0.1 * i)   # croissants land first
e(LAND + 0.02, "plush_squeak", -18, 0.0, pitch=0.6)   # Gary lands on the pile
for i, rt in enumerate(sorted(ring_t)): e(rt + 0.08, "clunk", -18, -0.3 + 0.6 * (i % 2), size=0.9, metal=0.6)
for k in range(6): e(t['segment'] - 0.15 + k * 0.07 + 0.28, "clunk", -15, -0.3 + 0.12 * k, size=1.0, metal=0.5)
e(t['n60'], "clunk", -9, 0.0, size=1.9, metal=0.5); e(t['n60'] + 0.02, "giant_step", -13, 0.0, size=1.2)
e(t['they'] - 0.1, "crumble", -20, 0.2, dur=0.6, size=0.35)   # the ring rolls under the bakery
e(t['they'] + 0.1, "crumble", -16, 0.0, dur=1.0, size=0.7); e(t['they'] + 0.2, "metal_groan", -19, 0.1, dur=1.0, pitch=0.8)
e(t['garyR'] - 0.2, "crumble", -21, 0.5, dur=0.9, size=0.3)   # …and rolls off down the tunnel
e(t['load2'] - 0.15, "slurp", -18, 0.0, dur=0.5); e(t['donuts'] - 0.12, "pop", -13, 0.0, pitch=0.85)
e(t['carry'], "plush_squeak", -23, 0.1, pitch=0.7)
e(PANC, "clunk", -9, 0.0, size=1.8, metal=0.4); e(PANC + 0.02, "giant_step", -12, 0.0, size=1.4); e(t['pancake'], "slurp", -20, 0.0, dur=0.4)
e(POOF, "pop", -14, 0.0, pitch=1.2)
ev.append({"t0": POOF + 0.3, "t1": t['passesG'], "sound": "footsteps", "rate": 6.0, "gain_db": -23, "pan0": -0.3, "pan1": 0.2})
e(t['passes'] + 0.2, "giant_step", -18, 0.0, size=0.4); e(t['passes'] - 0.1, "blanket_rustle", -25, 0.4, dur=0.6, intensity=0.6); e(t['fine'], "plush_squeak", -22, 0.3, pitch=1.2)
e(t['add'], "crumble", -15, 0.0, dur=0.9, size=0.6)
e(t['giant'] - 0.1, "clunk", -17, -0.2, size=0.8, metal=0.8); e(t['giant'] + 0.02, "clunk", -17, 0.2, size=0.8, metal=0.8)
for i in range(2): e(t['shafts'] + 0.2 + i * 0.15, "crumble", -19, -0.2 + 0.4 * i, dur=0.4, size=0.4)
e(BLOWN, "plush_squeak", -21, 0.2, pitch=1.0); e(t['blast'] + 0.3, "pop", -20, 0.3, pitch=1.4)
e(t['wakes'], "pop", -17, 0.2, pitch=1.5); e(t['midair'], "plush_squeak", -19, 0.2, pitch=1.6)
e(LAND_A, "giant_step", -15, 0.2, size=0.5); e(LAND_A + 0.3, "knock", -17, 0.2, pitch=0.9)
for i in range(12): e(TRK0 + i * 0.1, "knock", -23, -0.4 + i * 0.07, pitch=1.2)
e(t['power'] - 0.4, "metal_groan", -20, -0.3, dur=0.8, pitch=1.3)
for i in range(8): e(t['third'] - 0.1 + i * 0.1, "knock", -21, -0.4 + i * 0.1, pitch=1.5)
e(t['v625'] + 0.05, "zap", -20, -0.1, dur=0.35)
e(t['touched'], "zap", -11, 0.0, dur=0.75); e(t['night'] - 0.3, "low_swell", -18, 0.0, dur=1.4, pitch=1.3)
e(DEP, "car_horn", -15, -0.2, pitch=0.6, distance=0.8); e(SCOOP, "bonk", -17, 0.0); e(FLING, "plush_squeak", -19, 0.2, pitch=1.4); e(FLAND, "giant_step", -16, 0.1, size=0.45)
e(t['stations'], "pop", -12, 0.0, pitch=0.8); e(t['esc'], "clunk", -16, 0.2, size=1.0, metal=0.6); e(t['esc'] + 0.15, "pop", -17, 0.3, pitch=1.2)
for i in range(3): e(t['turn'] + 0.08 * i, "knock", -18, -0.2 + 0.2 * i, pitch=1.6)
e(t['map'] - 0.1, "knock", -16, -0.2, pitch=0.9); e(t['map'] + 0.2, "plush_squeak", -21, -0.2, pitch=1.1); e(t['puddle'] + 0.35, "splash", -16, 0.1, size=0.9)
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -22, 0.0, dur=1.6, intensity=0.6)
e(t['skip'], "car_horn", -18, -0.2, pitch=1.0, distance=1.0); e(t['trafficE'] + 0.05, "car_horn", -16, 0.3, pitch=1.2, distance=0.9)
for k in range(4): e(t['nowE'] + 0.2 + k * 0.6, "blanket_rustle", -24, -0.3 + 0.2 * k, dur=0.7, intensity=0.5)
e(GW_through - 0.1, "knock", -21, 0.2, pitch=1.4)
e(t['skip'] + 0.2, "car_horn", -17, 0.0, pitch=0.8, distance=0.7)   # the 100-year driver's tired honk
e(BUMP, "clunk", -12, -0.2, size=1.4, metal=0.8); e(BUMP + 0.45, "clunk", -13, -0.4, size=1.4, metal=0.8)
e(t['train'], "car_horn", -15, -0.2, pitch=0.6, distance=0.8); e(t['train'] + 0.35, "car_horn", -16, -0.4, pitch=0.55, distance=0.8)
for k in (t['pays'] + 0.1, t['pays'] + 0.47, t['pays'] + 0.84): e(k + 0.02, "knock", -18, 0.1, pitch=1.8); e(k + 0.12, "bonk", -22, 0.1)   # = shots.js TAPS
e(t['ride'], "metal_groan", -20, 0.1, dur=0.5, pitch=1.3); e(t['dug'], "bonk", -15, 0.1)
for k in range(3): e(t['dug'] + 0.6 + k * 0.4, "knock", -23, 0.1, pitch=1.1)
e(t['rides'] + 0.2, "knock", -17, -0.2, pitch=1.1); e(t['free'] + 0.6, "metal_groan", -22, -0.2, dur=0.6, pitch=1.4)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "traffic_flow", "t0": 0.0, "t1": IN + 0.6, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -26, "args": {"density": 0.8}, "seed": 1},
    {"sound": "city_day", "t0": 0.0, "t1": IN + 0.6, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -34, "args": {"murmur": 0.3, "traffic": 0.6}, "seed": 2},
    {"sound": "room_tone", "t0": IN, "t1": D, "fade_in": 0.5, "fade_out": 0.5, "gain_db": -40},
    {"sound": "water_rush", "t0": t['floor'] - 0.2, "t1": t['table'] + 0.6, "fade_in": 0.1, "fade_out": 0.8, "gain_db": -21, "seed": 3},
    {"sound": "drill", "t0": t['install'] + 0.4, "t1": t['ny'], "fade_in": 0.3, "fade_out": 0.4, "gain_db": -32, "args": {"rate": 4.0}, "seed": 4},
    {"sound": "water_rush", "t0": t['ny'] + 0.3, "t1": s1('pumps'), "fade_in": 0.2, "fade_out": 0.3, "gain_db": -22, "seed": 5},
    {"sound": "traffic_flow", "t0": t['ny'] + 0.3, "t1": s1('pumps'), "fade_in": 0.2, "fade_out": 0.3, "gain_db": -30, "seed": 6},
    {"sound": "drill", "t0": t['spinning'], "t1": t['miles'] + 1.0, "fade_in": 0.6, "fade_out": 0.9, "gain_db": -25, "args": {"rate": 7.0}, "seed": 7},
    {"sound": "fan", "t0": t['fans'], "t1": s1('air'), "fade_in": 0.8, "fade_out": 0.3, "gain_db": -26, "seed": 8},
    {"sound": "wind", "t0": t['blast'] - 0.3, "t1": t['midair'] + 0.6, "fade_in": 0.4, "fade_out": 0.3, "gain_db": -26, "args": {"darkness": 0.4, "gust": 0.6, "whistle": 0.0}, "seed": 9},
    {"sound": "lamp_hum", "t0": t['v625'] - 0.1, "t1": t['touched'] + 1.0, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -30, "seed": 10},
    {"sound": "city_day", "t0": t['stations'], "t1": D, "fade_in": 0.6, "fade_out": 0.5, "gain_db": -36, "args": {"murmur": 1.0, "traffic": 0.0}, "seed": 11},
    {"sound": "drill", "t0": t['add'] - 0.1, "t1": t['shafts'] + 0.5, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -27, "args": {"rate": 9.0}, "seed": 17},
    {"sound": "train", "t0": TP0, "t1": t['power'] + 0.3, "fade_in": 0.6, "fade_out": 0.5, "gain_db": -24, "seed": 18},
    {"sound": "train", "t0": DEP, "t1": DEP + 1.6, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -20, "seed": 19},
    {"sound": "train", "t0": t['free'] - 0.05, "t1": t['free'] + 1.3, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -21, "seed": 21},   # the last train pulls out with the raccoon
    {"sound": "train", "t0": TR1_a, "t1": TR1_b + 0.6, "fade_in": 0.8, "fade_out": 1.0, "gain_db": -23, "seed": 12},
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['skip'] + 0.3, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -26, "seed": 14},
    {"sound": "traffic_flow", "t0": t['skip'] - 0.4, "t1": t['nowE'] + 0.6, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -30, "seed": 15},
    {"sound": "train", "t0": t['nowE'] + 0.3, "t1": BUMP + 0.9, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -25, "seed": 13},
]

cues = {
    "title": "015 - How a Hole Becomes a Subway (build genre: WORKSHOP marimba groove + construction foley + narrator)",
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
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes, {len(ring_t)} ring clunks")
