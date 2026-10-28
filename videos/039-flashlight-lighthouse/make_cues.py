#!/usr/bin/env python3
"""Cue sheet for 039 (build genre, TURBO pace) -> cues.json.   python3 -I videos/039-flashlight-lighthouse/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 039-flashlight-lighthouse

Sound identity: "SHANTY STOMP" — a plucked sea-shanty in D minor at 136 bpm in synth.py's continuous "disco" style (octave bass in
8ths + off-beat stabs), a stompy tom on every beat + a soft clap on 2 and 4, a dark D pad under everything (the music never thins
out), booms on the big impacts, and the build genre's rising mallet "ta-da" on every TERM (here D5–F#5–A5). 024 marimba in F, 025
desert shuffle in D, 026 disco pluck in Bb, 032 lounge walk in D, 033 oom-pah in G, 034 barn-dance piano in A.
The hook is sea + boat foley only; the music drops in on "Congratulations". The sea carries the sound (surf on the rock all
along, wind that grows into the storm, rain, the fog's hush), plus foley on everything (turbo bar ≥ 400 events): bonks, toots, the
gull, the bricks, the clockwork ticking, the mercury, the foghorn (synth.py foghorn: a soft diaphone BWAAH-oh), the giant wave.
The narrator sits on top: music ducks ~9 dB under every phrase, ambience ~5 dB. All foley soft + low-passed."""
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
    crashing=W('hook', 'crashing'), waves=W('hook', 'waves'), flashlight=W('hook', 'flashlight'), tugboat=W('hook', 'tugboat'), hits=W('hook', 'hits'),
    congrats=W('congrats', 'congratulations'), worst=W('congrats', 'worst'), seagull=W('congrats', 'seagull'), stole=W('congrats', 'stole'), batteries=W('congrats', 'batteries'), andC=W('congrats', 'its'), dark=W('congrats', 'dark'), yet=W('congrats', 'yet'),
    garyR=W('range', 'gary'), lights=W('range', 'lights'), oil=W('range', 'oil'), lamp=W('range', 'lamp'), ships=W('range', 'ships'), see=W('range', 'see'), deck=W('range', 'three'), three=W('range', 'three'), hides=W('range', 'curves'),
    soR=W('range', 'so'), build=W('range', 'build'), calledR=W('range', 'called'), geographic=W('range', 'geographic'), four=W('range', 'four'), far=W('range', 'far'), twenty=W('range', 'twenty'), miles=W('range', 'miles', 2),
    shines=W('reflector', 'shines'), everywhere=W('reflector', 'everywhere'), sky=W('reflector', 'everywhere') + 0.25, fish=W('reflector', 'everywhere') + 0.55, mirror=W('reflector', 'mirror'), parabolic=W('reflector', 'parabolic'), fourR=W('reflector', 'four'), brighter=W('reflector', 'brighter'), garyF=W('reflector', 'gary'), into=W('reflector', 'into'),
    garyL=W('lens', 'gary'), sunglasses=W('lens', 'sunglasses'), now=W('lens', 'now'), lensW=W('lens', 'lens'), big=W('lens', 'big'), boulder=W('lens', 'boulder'), sliced=W('lens', 'sliced'), rings=W('lens', 'rings'), calledL=W('lens', 'called'), fresnel2=W('lens', 'fresnel', 2), lens2=W('lens', 'lens', 2),
    same=W('lens', 'same'), bend=W('lens', 'bend'), way=W('lens', 'way'), glass2=W('lens', 'glass', 2), garyC=W('lens', 'gary', 2), carries=W('lens', 'carries'), tons=W('lens', 'tons'), upstairs=W('lens', 'upstairs'), eighty=W('lens', 'upstairs') + 0.3, candlepower=W('lens', 'upstairs') + 0.9,
    oneC=W('clock', 'one'), points=W('clock', 'points'), cruise=W('clock', 'cruise'), sneaks=W('clock', 'sneaks'), behind=W('clock', 'behind'), falling=W('clock', 'falling'), cuckoo=W('clock', 'cuckoo'), clockwork=W('clock', 'clockwork'), every=W('clock', 'every'), hours=W('clock', 'hours'),
    cranks=W('clock', 'cranks'), upK=W('clock', 'up', 2), allK=W('clock', 'up', 2) + 0.35, night=W('clock', 'up', 2) + 0.55,
    twoM=W('mercury', 'two'), barely=W('mercury', 'barely'), float=W('mercury', 'float'), bath=W('mercury', 'bath'), finger=W('mercury', 'finger'), spins=W('mercury', 'spins'), seagullM=W('mercury', 'seagull'), carousel=W('mercury', 'carousel'),
    thenC=W('char', 'ship') - 0.15, mistakes=W('char', 'mistakes'), door=W('char', 'door'), rhythm=W('char', 'rhythm'), characteristic=W('char', 'characteristic'), twoC=W('char', 'two'), seconds=W('char', 'seconds'), garys=W('char', 'garys'), help=W('char', 'help'),
    storm=W('storm', 'storm'), bricks=W('storm', 'bricks'), whole=W('storm', 'whole'), leans=W('storm', 'leans'),
    granite=W('smeaton', 'granite'), puzzle=W('smeaton', 'puzzle'), pieces=W('smeaton', 'pieces'), wide=W('smeaton', 'flared'), oak=W('smeaton', 'oak'), dovetailed=W('smeaton', 'dovetailing'), smeatons=W('smeaton', 'smeatons'), rockS=W('smeaton', 'rock'),
    fog=W('fog', 'fog'), inF=W('fog', 'in'), anything=W('fog', 'in') + 0.3, horn=W('fog', 'horn'), compressed=W('fog', 'compressed'), air=W('fog', 'air'), foghorn=W('fog', 'foghorn'), hear=W('fog', 'hear'), garyFg=W('fog', 'gary'), foot=W('fog', 'foot'), what=W('fog', 'what'),
    by=W('daymark', 'by'), stick=W('daymark', 'stick'), paint=W('daymark', 'paint'), daymark=W('daymark', 'daymark'), spiral=W('daymark', 'spiral'), polka=W('daymark', 'polka'), dots=W('daymark', 'dots'),
    bigW=W('wave', 'big'), taller=W('wave', 'swallows'), over=W('wave', 'swallows'),
    holds=W('hold', 'holds'), lensH=W('hold', 'holds') + 0.35, andH=W('hold', 'and'), once=W('hold', 'and') + 0.3, misses=W('hold', 'misses'), rockH=W('hold', 'rock'),
    radio=W('finish', 'radio'), helipad=W('finish', 'helipad'), perch=W('finish', 'perch'), birds=W('finish', 'birds'), lighthouses=W('finish', 'lighthouses'),
    end=W('end', 'congratulations'), lighthouseE=W('end', 'lighthouse'), rockE=W('end', 'rock'), fourE=W('end', 'four'), dollars=W('end', 'dollars'), blind=W('end', 'blind'), soaked=W('end', 'soaked'), deaf=W('end', 'deaf'), miss=W('end', 'miss'), seagullE=W('end', 'seagull'), doesnt=W('end', 'doesnt'),
    rockEnd=W('end2', 'rock'))
def mono(keys):   # scratch word times can come out of order (shots.js mono)
    for a, b in zip(keys, keys[1:]): t[b] = max(t[b], t[a] + 0.12)
mono(['same', 'bend', 'way', 'glass2', 'garyC', 'carries', 'tons', 'upstairs', 'eighty', 'candlepower'])
mono(['characteristic', 'twoC', 'seconds'])
lerp = lambda a, b, u: a + (b - a) * u

# ---- derived times: SAME formulas as shots.js (keep them in sync)
SB, TUG = t['crashing'] + 0.05, t['hits'] + 0.04
FL0 = TUG + 0.06; SPL = FL0 + 0.55
CL0 = SPL + 0.3; CL1 = max(CL0 + 0.7, t['worst'] - 0.25)
GIN, GLAND, BAT = t['seagull'] - 0.55, t['seagull'] + 0.05, t['batteries'] + 0.02; GOFF = BAT + 0.18
LIGHT, PICK = t['oil'], t['see']
GROW0 = t['soR'] - 0.05; GROW1 = max(GROW0 + 1.0, t['calledR']); TOPPOP = GROW1; LAMPSET = GROW1 + 0.35; SPOT = t['geographic'] + 0.3
RAYS0, MIR = t['shines'] - 0.05, t['mirror'] - 0.05; BEAM0 = MIR + 0.18; BLAST = t['into']
SHADES, SLIDE0 = t['sunglasses'] - 0.05, t['now']; SLIDE1 = t['boulder'] - 0.45; BARGE0, THUD = t['garyL'] - 0.6, t['boulder']
CUTS = [t['sliced'] - 0.12, t['sliced'] + 0.2, t['sliced'] + 0.5]; SPLIT = t['rings'] + 0.05; ASM0, ASM1 = t['calledL'] - 0.1, t['lens2'] + 0.15
LIFT = t['way'] - 0.05; HOP0 = LIFT + 0.45; CLIMB0 = HOP0 + 0.25; CLIMB1 = max(CLIMB0 + 1.2, t['eighty'] - 0.35); SET = CLIMB1 + 0.18; LIT = t['eighty']
CBONK, WT0, CUCKOO, BOT, CR0, CR1, NIGHT0 = t['behind'] + 0.05, t['falling'] - 0.05, t['cuckoo'] - 0.08, t['hours'] + 0.1, t['cranks'] - 0.15, t['upK'] + 0.25, t['allK'] - 0.05
STUCK0, POUR0, POUR1, POKE, CAR0 = t['twoM'], t['float'] - 0.1, t['bath'] + 0.05, t['finger'], t['seagullM'] - 0.35
SAIL_BONK, BULL, MORSE0, MORSE1 = t['door'] + 0.02, t['rhythm'] - 0.25, t['garys'] - 0.05, t['help'] + 0.65
STORM, BRK, LEAN0, LEAN1 = t['storm'], t['bricks'] - 0.05, t['whole'] - 0.05, t['leans'] + 0.45
SK0_ = t['granite'] - 0.15; FALL0 = t['leans'] + 0.05; FALLE = FALL0 + 0.7   # shots.js: Gary slides off the leaning lantern
SK0, SK1, OAK = t['granite'] - 0.15, t['pieces'] + 0.35, t['oak'] - 0.3
FOG0, FOG1, FBONK, HORN, PUMP0, PUMP1, HB1, HB2 = t['fog'] - 0.1, t['inF'] + 0.4, t['anything'] + 0.02, t['horn'] - 0.05, t['compressed'] - 0.25, t['air'] + 0.25, t['foghorn'], t['foot']
CLEAR0, CHAIR0 = t['by'] - 0.35, t['paint'] - 0.2; PAINT1 = t['spiral'] + 0.35; DOT = [t['polka'] - 0.15, t['polka'] + 0.05, t['dots'] + 0.02]
WV0, IMPACT = t['bigW'] - 0.2, t['over'] - 0.08; WASH1 = IMPACT + 1.05
FLIP = t['rockH'] - 0.4
GBONK = t['doesnt'] + 0.02; GFALL0 = GBONK + 0.12; GLAND2 = GFALL0 + 0.75; CARD0 = GBONK
MORSE = '.... . .-.. .--.'

# ---------------------------------------------------------------- music: 136 bpm shanty stomp, D minor (pluck)
BPM = 136
BEAT = 60 / BPM
IN = t['congrats'] - 0.02
chords, cur, cyc = [], IN, 0
while cur < D - 1.6:
    seq = ['Dm', 'C', 'Bb', 'A'] if cyc % 2 == 0 else ['Dm', 'F', 'C', 'A']
    if cur > STORM - 0.5 and cur < t['by']: seq = ['Dm', 'Bb', 'Gm', 'A'] if cyc % 2 == 0 else ['Dm', 'Bb', 'A', 'A']
    if cur > t['end'] - 0.5: seq = ['F', 'C', 'Dm', 'A'] if cyc % 2 == 0 else ['Bb', 'C', 'Dm', 'Dm']
    for sym in seq:
        if cur >= D - 1.6: break
        chords.append([round(cur, 3), sym]); cur += 4 * BEAT
    cyc += 1
chords.append([round(cur, 3), 'Dm'])
sections = [{"t0": IN, "t1": D, "style": "disco", "step": BEAT / 2, "vel": [[IN, 0.3], [t['shines'], 0.32], [STORM, 0.37], [t['by'], 0.33], [t['bigW'], 0.38], [t['end'], 0.36], [D, 0.32]],
             "bass_hold": 0.95, "stab_vel": 0.5, "stab_hold": 0.85}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue
    if c['style'] == 'term':
        mallet += [[round(a, 3), 74, 0.36, 0.16], [round(a + 0.08, 3), 78, 0.36, 0.16], [round(a + 0.16, 3), 81, 0.4, 0.36]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 69, 0.3, 0.14], [round(a + 0.09, 3), 74, 0.32, 0.26]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 69, 0.3, 0.12], [round(a + 0.11, 3), 62, 0.3, 0.26]]
for k in range(10): mallet.append([round(CAR0 + 0.1 + k * 0.13, 3), [74, 78, 81, 86, 81, 78, 74, 78, 81, 86][k], 0.28, 0.12])   # the carousel tootle
pad = [{"t0": IN, "t1": D - 0.2, "notes": [26, 38, 45, 50, 53], "level": 0.5, "attack": 0.3, "release": 0.8, "cutoff": 900, "hp": 30}]
booms = [IN, TUG, THUD, CBONK, STORM, LEAN1, IMPACT, t['end'], GBONK]
drums = [[round(b, 3), 0.45, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0.55, 0.8, 0.55], "vel": 0.12, "kind": "tom"},
                 {"t0": IN + 0.02 + BEAT, "t1": D - 1.0, "step": 2 * BEAT, "pattern": [1], "vel": 0.12, "kind": "clap"}]
music = {"gain_db": 5.0, "reverb_db": -13.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -8.0, "instrument": "pluck",
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
def gull(tt, gain=-16, pan=0.0, pitch=1.0): e(tt, "goose_honk", gain, pan, pitch=1.9 * pitch, dur=0.16, angry=0.4)   # a short "kyow"
def toot(tt, gain=-16, pan=0.3, pitch=0.42, dur=0.35): e(tt, "car_horn", gain, pan, pitch=pitch, dur=dur)
def bonk(tt, pan=0.0, big=1.0):
    e(tt, "bonk", -10 + 2 * (big - 1), pan); e(tt + 0.01, "clunk", -14, pan, size=0.9 * big, metal=0.3); e(tt + 0.03, "splash", -15, pan, size=0.6 * big); e(tt + 0.25, "plip", -22, pan, pitch=0.7)
def laps(a, b, every=0.9, gain=-27):   # water slapping the rock
    k = 0
    while a + k * every < b: e(a + k * every + 0.17 * (k % 3), "plip", gain, -0.4 + 0.2 * (k % 5), pitch=0.45 + 0.07 * (k % 4)); k += 1

laps(0.2, D - 0.5, 0.85)
# HOOK: the sailboat bonks, the flashlight clicks, the tug toots, hits, Gary flies → SPLOOSH
bonk(SB, -0.5); gull(0.6, -24, -0.6)
e(t['waves'] + 0.05, "blanket_rustle", -24, 0.3, dur=0.5, intensity=0.6)
e(t['flashlight'], "lamp_switch_click", -14, 0.3)
toot(t['tugboat'] - 0.05, -14, 0.6); toot(t['tugboat'] + 0.3, -16, 0.6)
bonk(TUG, 0.5, 1.3); e(TUG + 0.02, "metal_clang", -16, 0.5, size=0.8, pitch=0.8)
e(FL0, "flash_swish", -20, 0.3, dur=0.4, peak=0.6); e(FL0 + 0.05, "plush_squeak", -16, 0.2, pitch=1.5)
e(SPL, "water_splash", -10, 0.2, size=1.0); e(SPL + 0.02, "splash", -12, 0.2, size=0.9)
# CONGRATS: the ladder, ta-da, the gull lands, YOINK, the battery plops, gulp
for k in range(4): e(CL0 + 0.1 + k * (CL1 - CL0) / 4, "knock", -20, 0.1, pitch=0.7 + 0.05 * k)
for k in range(5): e(CL0 + 0.2 + k * 0.3, "plip", -22, 0.1, pitch=0.9 + 0.1 * k)   # dripping
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -15, 0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -23, 0.0, dur=1.2, intensity=0.6)
gull(GIN, -18, -0.5); e(GIN + 0.1, "blanket_rustle", -22, -0.4, dur=0.5, intensity=0.8)   # wings
gull(GLAND, -14, 0.0, 1.1); e(GLAND, "knock", -18, 0.0, pitch=1.6)
for k in range(3): e(t['stole'] + k * 0.12, "knock", -19, 0.0, pitch=1.9)   # peck peck peck
e(BAT, "pop", -10, 0.0, pitch=1.2); e(BAT + 0.03, "pop", -13, 0.2, pitch=1.6); gull(GOFF + 0.1, -15, -0.3, 1.2)
e(BAT + 0.6, "plip", -16, 0.3, pitch=0.6); e(BAT + 0.62, "knock", -20, 0.3, pitch=1.1)
e(t['dark'] - 0.2, "low_swell", -22, 0.0, dur=1.0, pitch=0.7)   # the sun dives
# RANGE: footsteps, the match + whoomp, the far tug's toot, the rise (bricks!), the lantern pops, the lookout
steps(t['garyR'] - 0.15, t['lights'], 9.0, -23, 0.2, 0.0)
e(LIGHT - 0.05, "zap", -24, 0.0, dur=0.2); e(LIGHT, "pop", -14, 0.0, pitch=0.6); e(LIGHT + 0.05, "low_swell", -22, 0.0, dur=0.6, pitch=1.4)
toot(t['deck'], -30, 0.7, 0.4, 0.5)
for k in range(10): tk = GROW0 + k * (GROW1 - GROW0) / 10; e(tk, "knock", -17, -0.3 + 0.06 * k, pitch=0.6 + 0.04 * k); e(tk + 0.04, "clunk", -21, 0.0, size=0.5, metal=0.0)
e(GROW0, "crumble", -20, 0.0, dur=GROW1 - GROW0, size=0.6); e(GROW0, "low_swell", -20, 0.0, dur=GROW1 - GROW0 + 0.3, pitch=1.6)
e(TOPPOP, "metal_clang", -12, 0.0, size=1.0, pitch=1.1); e(TOPPOP + 0.03, "pop", -13, 0.0, pitch=1.0); e(TOPPOP + 0.06, "gold_chime", -20, 0.0, notes=[86, 90, 93], spacing=0.06, vel=0.4)
e(LAMPSET, "knock", -18, 0.1, pitch=1.4); e(SPOT, "gold_chime", -22, 0.6, notes=[93, 98], spacing=0.08, vel=0.3); toot(SPOT + 0.25, -26, 0.7, 0.45, 0.25)
# REFLECTOR: rays (swells), the fish, CLANG, the beam, FWOOM
e(RAYS0, "low_swell", -18, 0.0, dur=1.6, pitch=1.3); gull(t['sky'], -18, -0.4, 0.9)
e(t['fish'] - 0.35, "splash", -16, 0.4, size=0.5); e(t['fish'], "fish_blub", -16, 0.4); e(t['fish'] + 0.55, "splash", -16, 0.5, size=0.5)
e(MIR, "metal_clang", -10, 0.0, size=0.9, pitch=1.2); e(MIR + 0.03, "clunk", -15, 0.0, size=0.7, metal=1.0)
e(BEAM0, "low_swell", -16, 0.3, dur=1.0, pitch=1.6); e(t['fourR'], "low_swell", -18, 0.3, dur=0.9, pitch=2.0)
e(BLAST - 0.03, "flash_swish", -12, 0.0, dur=0.5, peak=0.9); e(BLAST, "distant_boom", -16, 0.0, size=0.5); e(BLAST + 0.1, "zap", -22, 0.0, dur=0.4); e(BLAST + 0.4, "whimper", -18, 0.0, pitch=1.1)
# LENS: shades, the banister slide, the barge + crane, THUD, slices, the split (glass), the assembly, the climb, the set, the light
e(SHADES, "pop", -16, 0.2, pitch=1.8); e(SHADES + 0.05, "knock", -22, 0.2, pitch=2.2)
e(SLIDE0, "flash_swish", -16, -0.3, dur=SLIDE1 - SLIDE0, peak=0.5); e(SLIDE0 + 0.1, "plush_squeak", -18, -0.3, pitch=1.4); e(SLIDE1, "knock", -16, -0.2, pitch=0.8)
toot(BARGE0 + 0.4, -22, 0.7, 0.55, 0.3)
e(THUD - 0.3, "metal_groan", -18, 0.5, dur=0.4, pitch=1.6); e(THUD, "giant_step", -8, 0.3, size=1.2); e(THUD + 0.02, "crumble", -14, 0.3, dur=0.6, size=0.8); e(THUD + 0.1, "splash", -16, 0.6, size=0.6)
for k, c in enumerate(CUTS): e(c, "grate", -15, 0.3, dur=0.25); e(c + 0.05, "knock", -20, 0.3, pitch=2.0)
e(SPLIT, "candy_rattle", -10, 0.3, dur=0.9, density=40.0, size=1.2); e(SPLIT + 0.02, "crumble", -16, 0.3, dur=0.5, size=0.5)
for k in range(8): e(ASM0 + 0.1 + k * (ASM1 - ASM0) / 8, "pop", -19, 0.2 - 0.05 * k, pitch=1.0 + 0.1 * k)
e(ASM1, "gold_chime", -16, 0.2, notes=[81, 86, 90, 93], spacing=0.05, vel=0.45)
e(LIFT + 0.3, "whimper", -18, 0.0, pitch=0.7, dur=0.5); steps(CLIMB0, CLIMB1, 14.0, -18, -0.2, 0.2)
for k in range(6): e(CLIMB0 + k * (CLIMB1 - CLIMB0) / 6, "knock", -22, 0.0, pitch=0.9 + 0.05 * k)
e(CLIMB1 - 0.2, "metal_clang", -18, -0.3, size=0.7, pitch=1.4); e(SET, "metal_clang", -12, 0.0, size=1.1, pitch=0.9);   # the mirror parked; the lens set down
e(SET + 0.03, "clunk", -14, 0.0, size=0.9, metal=0.8)
e(LIT, "low_swell", -12, 0.0, dur=1.2, pitch=1.2); e(LIT + 0.05, "gold_chime", -16, 0.0, notes=[86, 90, 93, 98], spacing=0.06, vel=0.5)
# CLOCK: the cruise ship's horn + BONK + passengers' clink, the weight drops, the clockwork ticks, CUCKOO, the bottom, the crank, yawn
e(t['cruise'] - 0.3, "car_horn", -18, -0.6, pitch=0.3, dur=0.9); bonk(CBONK, -0.6, 1.4); e(CBONK + 0.05, "car_crash", -18, -0.6, weight=0.5)
for k in range(6): e(CBONK + 0.1 + k * 0.08, "knock", -21, -0.5 + 0.1 * k, pitch=2.4 + 0.1 * k)   # glasses clinking
e(CBONK + 0.25, "whimper", -24, -0.5, pitch=1.4)
e(WT0, "clunk", -12, 0.0, size=0.8, metal=1.0); e(WT0 + 0.05, "metal_groan", -18, 0.0, dur=0.8, pitch=1.4)
k = 0
while WT0 + 0.3 + k * 0.25 < STORM - 0.2:
    tk = WT0 + 0.3 + k * 0.25
    if not (CR0 < tk < t['night'] + 0.6): e(tk, "counter_tick", -27, 0.1, bright=0.6)
    k += 1
e(CUCKOO, "gold_chime", -12, -0.3, notes=[79, 76], spacing=0.22, vel=0.5); e(CUCKOO + 0.05, "knock", -18, -0.3, pitch=1.3); gull(CUCKOO + 0.5, -16, -0.3, 1.1)
e(BOT, "clunk", -11, 0.0, size=1.0, metal=1.0); e(BOT + 0.03, "giant_step", -16, 0.0, size=0.6)
for k in range(int((CR1 - CR0) / 0.11)): e(CR0 + k * 0.11, "knock", -19, 0.2, pitch=1.6 + 0.05 * (k % 3))   # ratchet
e(t['night'], "whimper", -16, 0.2, pitch=0.6, dur=0.6)   # yawn
# MERCURY: the grinding, the silver pour, the float, the poke, the carousel
e(STUCK0, "grate", -14, 0.0, dur=0.9); e(STUCK0 + 0.1, "metal_groan", -16, 0.0, dur=0.8, pitch=0.8); e(STUCK0 + 0.3, "whimper", -20, 0.2, pitch=0.8, dur=0.4)
e(POUR0 + 0.1, "slurp", -14, 0.2, dur=POUR1 - POUR0); [e(POUR0 + 0.2 + k * 0.15, "plip", -18, 0.2, pitch=1.2 + 0.1 * k) for k in range(6)]
e(POUR1, "low_swell", -18, 0.0, dur=0.8, pitch=1.8)
e(POKE, "pop", -12, 0.2, pitch=1.4); e(POKE + 0.05, "flash_swish", -16, 0.0, dur=0.8, peak=0.4)
gull(CAR0 + 0.1, -14, 0.0, 1.2); gull(t['carousel'] + 0.05, -12, 0.0, 1.3)
# CHAR: the sailboat (its sailor), BONK, the bullseye clicks in, blink blink, the morse
e(t['thenC'] - 0.3, "car_horn", -16, -0.6, pitch=0.22, dur=1.0); e(t['mistakes'], "car_horn", -18, -0.6, pitch=0.22, dur=0.5)   # the freighter's horn
bonk(SAIL_BONK, -0.6, 1.6); e(SAIL_BONK + 0.03, "metal_clang", -12, -0.6, size=1.4, pitch=0.6); e(SAIL_BONK + 0.08, "car_crash", -18, -0.6, weight=0.6)
e(BULL + 0.1, "knock", -12, 0.1, pitch=1.6); e(BULL + 0.15, "pop", -15, 0.1, pitch=1.2)
for k in range(2): e(t['rhythm'] + k * 0.25, "scan_beep", -22, 0.2, pitch=1.2)
u = 0.0
for ch in MORSE:   # the blinks (shots.js morseOn: dot = 1 unit of 0.075 s, dash = 3, gap = 1, space = 2)
    L = 1 if ch == '.' else 3 if ch == '-' else 2
    if ch != ' ': e(MORSE0 + u * 0.075, "scan_beep", -21, 0.1, pitch=1.6, dur=0.06 if L == 1 else 0.2)
    u += L + 1
# STORM: thunder, the wave on the base, CRUNCH, the lean (groan + snap)
e(STORM, "distant_boom", -6, -0.3, size=1.4); e(STORM + 0.35, "distant_boom", -12, 0.3, size=1.0)
e(BRK - 0.1, "water_splash", -9, -0.3, size=1.2); e(BRK, "crumble", -10, -0.3, dur=0.9, size=1.0); e(BRK + 0.05, "wood_snap", -14, -0.3, size=0.8)
e(LEAN0, "metal_groan", -10, 0.2, dur=LEAN1 - LEAN0 + 0.4, pitch=0.6); e(LEAN1, "giant_step", -10, 0.3, size=1.0); e(LEAN1 + 0.05, "crumble", -14, 0.3, dur=0.6)
e(LEAN0 + 0.2, "plush_squeak", -16, 0.3, pitch=0.9); e(LEAN1 + 0.05, "distant_boom", -12, 0.0, size=0.9)
e(FALL0, "whimper", -14, 0.3, pitch=1.6, dur=0.6); e(FALL0 + 0.05, "flash_swish", -18, 0.3, dur=FALLE - FALL0, peak=0.6); e(FALLE, "giant_step", -9, 0.3, size=1.0); e(FALLE + 0.02, "plush_squeak", -13, 0.3, pitch=0.6)
# SMEATON: granite blocks THUNK, click (dovetails), the oak pops up, waves just splash now
for k in range(5): tk = SK0 + k * (SK1 - SK0) / 5; e(tk, "giant_step", -12, -0.3 if k % 2 else 0.3, size=0.9); e(tk + 0.04, "knock", -16, 0.0, pitch=0.7)
e(t['puzzle'], "knock", -12, 0.0, pitch=1.8); e(t['puzzle'] + 0.08, "knock", -14, 0.0, pitch=2.1)
for k in range(8): e(SK0 + 0.1 + k * 0.22, "knock", -22, -0.2, pitch=1.3)   # Gary's mallet
e(OAK + 0.1, "pop", -12, -0.4, pitch=0.8); e(OAK + 0.12, "blanket_rustle", -18, -0.4, dur=0.6, intensity=1.0)
for k in range(3): e(t['smeatons'] - 0.2 + k * 0.45, "splash", -16, -0.3 + 0.3 * k, size=0.8)
e(t['rockS'] - 0.5, "crumble", -11, 0.4, dur=0.6, size=1.0); e(t['rockS'] + 0.15, "water_splash", -10, 0.5, size=1.2); e(t['rockS'] - 0.4, "whimper", -18, 0.4, pitch=1.4)   # the rock edge crumbles under Gary
# FOG: the hush, a muffled toot, BONK, the horn bolts on, the pump, BWAAAH ×2, Gary's ears, WHAT?
toot(t['fog'] + 0.4, -26, 0.6, 0.38, 0.6); bonk(FBONK, 0.6, 1.1)
e(HORN, "metal_clang", -12, 0.3, size=0.9, pitch=1.2); e(HORN + 0.03, "clunk", -16, 0.3, size=0.7, metal=0.9)
for k in range(int((PUMP1 - PUMP0) / 0.17)): e(PUMP0 + k * 0.17, "slurp", -21, 0.2, dur=0.12)
e(HB1, "foghorn", -6, 0.4, dur=1.3); e(HB2, "foghorn", -3, 0.5, dur=1.0, pitch=1.04)
e(HB2 + 0.3, "plush_squeak", -16, 0.5, pitch=2.0); e(HB2 + 0.5, "zap", -26, 0.5, dur=0.4)   # ear ring
toot(t['hear'] + 0.2, -26, 0.7, 0.45, 0.25)
# DAYMARK: roller strokes, PLOP PLOP
for k in range(7): e(CHAIR0 + 0.3 + k * 0.45, "slurp", -20, 0.3, dur=0.25)
gull(DOT[0] - 0.5, -16, 0.3, 1.0)
for k, d in enumerate(DOT): e(d, "plip", -12, 0.2 - 0.1 * k, pitch=0.8 + 0.1 * k); e(d + 0.02, "slurp", -18, 0.2, dur=0.15)
# WAVE: the rumble, the roar, KA-SPLOOSH, the cascade, Gary washed off (wheee), SPLAT
e(WV0, "low_swell", -12, 0.5, dur=IMPACT - WV0, pitch=0.5); e(t['taller'], "whimper", -18, 0.2, pitch=1.3)
e(IMPACT, "cartoon_splash", -4, 0.0, size=1.5); e(IMPACT + 0.02, "distant_boom", -8, 0.0, size=1.4); e(IMPACT + 0.05, "water_splash", -8, 0.0, size=1.4)
e(IMPACT + 0.3, "flash_swish", -18, -0.3, dur=0.7, peak=0.5); e(WASH1, "splash", -10, -0.3, size=0.9); e(WASH1 + 0.02, "plush_squeak", -14, -0.3, pitch=0.6)
# HOLD / FINISH: the sail passes, the card flip (+ chime), radio beep, helipad clang, perch knock, the gull lands
e(t['once'], "blanket_rustle", -22, -0.4, dur=0.8, intensity=0.6); e(FLIP, "knock", -14, -0.3, pitch=1.2); e(FLIP + 0.1, "gold_chime", -14, -0.3, notes=[86, 90, 93], spacing=0.06, vel=0.45)
e(t['radio'], "scan_beep", -16, 0.3, pitch=1.4); e(t['radio'] + 0.15, "scan_beep", -18, 0.3, pitch=1.7)
e(t['helipad'], "metal_clang", -12, 0.0, size=1.2, pitch=0.9); e(t['perch'], "knock", -14, -0.4, pitch=1.4); gull(t['perch'] + 0.35, -16, -0.4)
# END: confetti, money rain, the stamps, the boats toot as they pass, the gull: BONK, slide, fall, BONK, the card
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -14, 0.3, pitch=1.3); e(t['end'] + 0.2, "blanket_rustle", -22, 0.0, dur=1.2, intensity=0.6)
e(t['fourE'], "candy_rattle", -18, 0.0, dur=1.2, density=20.0, size=0.6); e(t['fourE'] + 0.05, "blanket_rustle", -20, 0.0, dur=1.5, intensity=0.5)
for w in ('blind', 'soaked', 'deaf'): e(t[w], "knock", -14, 0.0, pitch=0.9)
e(t['soaked'] - 0.1, "splash", -12, -0.1); e(t['soaked'] - 0.12, "bonk", -13, -0.2)   # BLIND: into the sign post   # r2: a wave slaps over the edge onto Gary
GLB = t['lighthouses'] + 0.02; e(GLB, "bonk", -11, -0.2); e(GLB + 0.03, "knock", -16, -0.2, pitch=1.8); gull(GLB + 0.08, -17, -0.2, 1.4)   # r2: the gull bonks the lantern glass
toot(t['miss'] - 0.6, -18, 0.6); toot(t['miss'] - 0.25, -20, 0.6)
gull(t['seagullE'], -14, -0.3, 1.1); e(GBONK, "bonk", -6, -0.2); e(GBONK + 0.02, "knock", -12, -0.2, pitch=2.2); e(GBONK + 0.1, "plush_squeak", -14, -0.2, pitch=0.8)
e(GFALL0, "flash_swish", -18, -0.3, dur=GLAND2 - GFALL0, peak=0.5); e(GLAND2, "bonk", -8, -0.4); e(GLAND2 + 0.05, "plush_squeak", -14, -0.4, pitch=1.2)
e(CARD0, "knock", -14, -0.4, pitch=1.2); e(CARD0 + 0.15, "gold_chime", -18, -0.4, notes=[81, 77], spacing=0.12, vel=0.4)
# ---------------------------------------------------------------- density fill (soft, low-passed: the turbo bar wants a sound on almost every frame)
steps(CL1, CL1 + 0.35, 9.0, -24, 0.1, 0.0); steps(SLIDE1, THUD - 0.3, 10.0, -23, -0.2, 0.1); steps(LIFT + 0.3, HOP0, 9.0, -21, 0.1, -0.2)
steps(t['by'] - 0.4, CHAIR0, 9.0, -24, 0.4, 0.2); steps(WASH1 + 0.5, FLIP - 0.35, 9.0, -23, -0.3, -0.4)
def flaps(a, b, gain=-26, pan=0.0):   # the gull's wingbeats
    k = 0
    while a + k * 0.16 < b: e(a + k * 0.16, "blanket_rustle", gain, pan, dur=0.1, intensity=0.9, softness=0.3); k += 1
flaps(GIN, GLAND, -24, -0.3); flaps(GOFF, GOFF + 1.6, -25, -0.4); flaps(t['sky'] - 0.6, t['sky'] + 0.6, -26, 0.2); flaps(CAR0 - 0.8, CAR0, -26, 0.0)
flaps(DOT[0] - 0.9, DOT[2] + 0.9, -25, 0.3); flaps(t['perch'] - 0.8, t['perch'] + 0.4, -25, -0.3); flaps(t['end'] + 1.5, GBONK, -24, -0.2)
k = 0
while STORM + k * 0.62 < FOG0:   # storm waves slapping the rock
    e(STORM + 0.3 + k * 0.62, "splash", -18 - 3 * (k % 2), -0.5 + 0.25 * (k % 5), size=0.7 + 0.1 * (k % 3)); k += 1
k = 0
while STORM + k * 0.13 < FOG1:   # rain on the lantern + the rock
    e(STORM + k * 0.13, "plip", -27 - 2 * (k % 3), -0.6 + 0.12 * (k % 11), pitch=1.4 + 0.15 * (k % 5)); k += 1
for k in range(12): e(t['congrats'] + 0.3 + k * 0.11, "pop", -24, -0.5 + 0.09 * k, pitch=1.2 + 0.1 * (k % 4))   # confetti
for k in range(12): e(t['end'] + 0.3 + k * 0.11, "pop", -24, -0.5 + 0.09 * k, pitch=1.2 + 0.1 * (k % 4))
for k in range(10): e(TOPPOP + 0.1 + k * 0.08, "pop", -24, -0.4 + 0.08 * k, pitch=1.4 + 0.1 * (k % 3))
for k in range(8): e(LIT + 0.1 + k * 0.1, "pop", -25, -0.3 + 0.08 * k, pitch=1.5 + 0.1 * (k % 3))
for k in range(int((CLIMB1 - CLIMB0) / 0.09)): e(CLIMB0 + k * 0.09, "knock", -27, 0.0, pitch=1.1 + 0.05 * (k % 4))   # boots on iron steps
for k in range(int((SLIDE1 - SLIDE0) / 0.1)): e(SLIDE0 + k * 0.1, "plush_squeak", -28, -0.2, pitch=1.8 + 0.05 * (k % 5))   # bum on the banister
for k in range(int((PAINT1 - CHAIR0) / 0.3)): e(CHAIR0 + 0.15 + k * 0.3, "slurp", -26, 0.3, dur=0.12)   # roller
for k in range(6): e(WV0 + 0.2 + k * 0.3, "splash", -20, 0.2, size=1.2)   # the wall of water building
for k in range(8): e(IMPACT + 0.3 + k * 0.12, "plip", -20, -0.4 + 0.1 * k, pitch=0.6 + 0.05 * k)   # it rains back down
for k in range(6): e(t['fourE'] + 0.1 + k * 0.15, "blanket_rustle", -25, -0.3 + 0.12 * k, dur=0.12, intensity=0.5)   # bills
for k in range(8): e(t['twenty'] + 0.1 + k * 0.4, "plip", -27, 0.4, pitch=0.5)   # night water
# ---------------------------------------------------------------- beds
amb = [
    {"sound": "surf", "t0": 0.0, "t1": D, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -30, "args": {"size": 1.0}, "seed": 1},   # the sea on the rock, all along
    {"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -40, "args": {"darkness": 0.5, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "drill", "t0": t['tugboat'] - 1.5, "t1": TUG + 1.6, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -32, "args": {"rate": 6.0}, "seed": 3},   # the tug's engine
    {"sound": "drill", "t0": BARGE0, "t1": t['fresnel2'] + 2.0, "fade_in": 0.5, "fade_out": 0.8, "gain_db": -34, "args": {"rate": 5.0}, "seed": 4},   # the barge
    {"sound": "drill", "t0": t['oneC'], "t1": CBONK + 1.5, "fade_in": 0.6, "fade_out": 0.6, "gain_db": -34, "args": {"rate": 4.0}, "seed": 5},   # the cruise ship
    {"sound": "clock", "t0": WT0 + 0.3, "t1": STORM, "fade_in": 0.2, "fade_out": 0.3, "gain_db": -40, "pan": 0.1, "seed": 6},
    {"sound": "crickets", "t0": t['twenty'], "t1": STORM, "fade_in": 0.8, "fade_out": 0.4, "gain_db": -48, "seed": 7},
    {"sound": "rain_window", "t0": STORM - 0.2, "t1": FOG1, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -30, "seed": 8},
    {"sound": "wind", "t0": STORM - 0.3, "t1": FOG1, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -28, "args": {"darkness": 0.8, "gust": 0.8, "whistle": 0.15}, "seed": 9},
    {"sound": "surf", "t0": STORM - 0.3, "t1": FOG0 + 0.5, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -24, "args": {"size": 1.6}, "seed": 10},
    {"sound": "water_rush", "t0": WV0, "t1": WASH1 + 1.0, "fade_in": 0.5, "fade_out": 0.8, "gain_db": -22, "seed": 11},
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['end'] + 1.4, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -32, "seed": 12},
]

ev = [x for x in ev if x is not None]
cues = {
    "title": "039 - How a Flashlight Becomes a Lighthouse (build genre, TURBO: SHANTY STOMP pluck 136 bpm + sea/lighthouse foley + narrator)",
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
