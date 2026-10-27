#!/usr/bin/env python3
"""Cue sheet for 025 (build genre) -> cues.json.   python3 -I videos/025-kiddie-pool-dam/make_cues.py

Every time comes from story.json (the narration's word times, tools/narrate.py), mirroring shots.js — re-voicing the narration
(scratch → ElevenLabs) and re-running this keeps every sound on its picture. Then: python3 -I audio/synth.py 025-kiddie-pool-dam

Sound identity: "DESERT SHUFFLE" — a lazy walking bass + off-beat plucked comps (the synth's warm pluck, not 024's marimba
groove) in D major at 104 bpm, I–IV–I–V turning to vi–IV–I–V once the concrete goes in, a soft D pad under everything (the
music never drops out), a light tom pulse. The build genre's audio signature stays: a rising marimba "ta-da" on every TERM
callout, a two-note lift on labels/money, a falling pair on stamps. The hook is heat only (cicada buzz, a dry wind, the
creek); the music drops in on "Congratulations". The narrator sits on top: music ducks ~9 dB under every phrase. Foley is
soft and low-passed (audio/synth.py §6b: dig, crumble, splash, clunk, knock, pop, zap, plip, grate; beds water_rush, drill)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
story = json.load(open(os.path.join(HERE, 'story.json')))
B = story['beats']
D = story['duration']
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum())


def W(beat, word, n=1):
    return [w[1] for w in B[beat]['w'] if w[0] == norm(word)][n - 1]


s1 = lambda b: B[b]['t1']
t = {k: W(b, w, n) for k, (b, w, n) in {
    'n104': ('hook', '104', 1), 'so0': ('hook', 'so', 1), 'closed': ('hook', 'closed', 1), 'shove': ('hook', 'shove', 1), 'creek': ('hook', 'creek', 1),
    'congrats': ('congrats', 'congratulations', 1), 'six': ('congrats', 'six', 1), 'inches': ('congrats', 'inches', 1), 'beaver': ('congrats', 'beaver', 1), 'already0': ('congrats', 'already', 1), 'notes': ('congrats', 'notes', 1),
    'hops': ('float', 'hops', 1), 'inF': ('float', 'in', 1), 'lifts': ('float', 'lifts', 1), 'floats': ('float', 'floats', 1), 'lost': ('float', 'lost', 1), 'flip': ('float', 'flipflop', 1),
    'cant': ('divert', 'cant', 1), 'running': ('divert', 'running', 1), 'river': ('divert', 'river', 1), 'dig': ('divert', 'dig', 1), 'diversion': ('divert', 'diversion', 1), 'four': ('divert', 'four', 1), 'got': ('divert', 'got', 1),
    'pile': ('piping', 'pile', 1), 'wallP': ('piping', 'wall', 1), 'dirt': ('piping', 'dirt', 1), 'sneaks': ('piping', 'sneaks', 1), 'carves': ('piping', 'carves', 1), 'piping': ('piping', 'piping', 1),
    'plugs': ('piping', 'plugs', 1), 'finger': ('piping', 'finger', 1), 'garyP2': ('piping', 'gary', 2), 'cork': ('piping', 'cork', 1),
    'drive': ('cutoff', 'drive', 1), 'bedrock': ('cutoff', 'bedrock', 1), 'already': ('cutoff', 'already', 1), 'oneC': ('cutoff', 'one', 1),
    'lake': ('push', 'lake', 1), 'shoves': ('push', 'shoves', 1), 'downstream': ('push', 'downstream', 1), 'included': ('push', 'included', 1), 'pour': ('push', 'pour', 1),
    'n660': ('push', '660', 1), 'gravity': ('push', 'gravity', 1), 'bully': ('push', 'bully', 1),
    'concreteH': ('heat', 'concrete', 1), 'hot': ('heat', 'hot', 1), 'hoovers': ('heat', 'hoovers', 1), 'n125': ('heat', '125', 1), 'sat': ('heat', 'sat', 1), 'medium': ('heat', 'medium', 1),
    'run': ('cool', 'run', 1), 'inside': ('cool', 'inside', 1), 'cooling': ('cool', 'cooling', 1),
    'rains': ('spill', 'rains', 1), 'week': ('spill', 'week', 1), 'pours': ('spill', 'pours', 1), 'spillway': ('spill', 'spillway', 1), 'exit': ('spill', 'exit', 1), 'garyS': ('spill', 'gary', 1), 'once': ('spill', 'once', 1), 'heavy': ('push', 'heavy', 1), 'blame': ('fish', 'blame', 1), 'home': ('fish', 'home', 1),
    'rent': ('power', 'rent', 1), 'send': ('power', 'send', 1), 'pipesW': ('power', 'pipes', 1), 'spin': ('power', 'spin', 1), 'turbines': ('power', 'turbines', 1), 'penstocks': ('power', 'penstocks', 1),
    'garyW': ('power', 'gary', 1), 'cycle': ('power', 'cycle', 1),
    'salmon': ('fish', 'salmon', 1), 'fishW': ('fish', 'fish', 1), 'pools': ('fish', 'pools', 1), 'climb': ('fish', 'climb', 1), 'cantF': ('fish', 'cant', 2),
    'also': ('town', 'your', 1), 'drowned': ('town', 'drowned', 1), 'happened': ('town', 'happened', 1), 'only': ('lake', 'only', 1), 'up': ('lake', 'up', 1), 'droughts': ('lake', 'droughts', 1), 'sells': ('lake', 'sells', 1), 'lakefront': ('lake', 'lakefront', 1),
    'add': ('finish', 'add', 1), 'road': ('finish', 'road', 1), 'visitor': ('finish', 'visitor', 1), 'gift': ('finish', 'gift', 1), 'sign': ('finish', 'sign', 1),
    'end': ('end', 'congratulations', 1), 'coolE': ('end', 'cool', 1), 'n49': ('end', '49', 1), 'money': ('end', 'money', 1), 'illegal': ('end', 'illegal', 1),
    'bestseller': ('end', 'bestseller', 1), 'closedE': ('end', 'closed', 1),
}.items()}

# ---- derived times: SAME formulas as shots.js (keep them in sync)
THROW = t['shove'] - 0.1; LANDK = max(t['congrats'] - 0.1, THROW + 0.9)
FLOAT0 = t['floats'] - 0.15; FLOAT1 = max(t['flip'] + 0.55, FLOAT0 + 1.6)
DIG0, DIG1 = t['dig'] - 0.05, W('divert', 'hoover') + 0.05     # Gary digs the tunnel; breaks through on "Hoover"
RUN1 = max(t['four'], DIG1 + 0.9)
SUCK = t['got'] - 0.2; OUT = SUCK + 1.5; ONPILE = OUT + 0.55
DUMPS = [x + 0.05 for x in (t['pile'], t['wallP'], t['dirt'])]
PLUG = t['dirt'] + 0.45; JET = t['carves'] + 0.9; POPC = t['cork']; LANDC = POPC + 0.7
SLAM = t['drive'] + 0.3
HAM = [W('cutoff', 'wall'), 0, t['bedrock']]; HAM[1] = (HAM[0] + HAM[2]) / 2      # Gary's three mallet hits
SLIDE0, SLIDE1 = t['shoves'], t['included'] - 0.1; CRUMB = t['included'] + 0.05; CRUMB1 = CRUMB + 0.65
COL0, COLDT, COLDUR = t['pour'], 0.5, 0.4                       # the cableway bucket (Gary riding it) pours each column
FILL0, FILL1 = t['n660'] + 0.8, t['bully'] - 0.15
SIT, LEAP = t['sat'] - 0.1, t['medium'] - 0.05
PIPE0, PIPE1 = t['run'], t['inside'] + 0.4
RAIN0, RAIN1, OVER = t['rains'] - 0.4, t['spillway'] + 0.6, t['pours'] - 0.05
HSP = W('spill', 'add') + 0.05                                   # Gary's mallet notches the crest
VW0, VW1 = t['pipesW'] - 0.3, t['turbines'] + 0.2              # Gary cranks the penstock valve
SLD0 = t['garyS'] + 0.25; SLD1 = max(SLD0 + 1.0, t['once'] - 1.05); SPLASH = max(SLD1 + 0.45, t['once'] + 0.02)
PH = t['pipesW'] - 0.05; SUCKT = t['garyW'] + 0.15; SPIT = t['cycle'] + 0.55; SPLAT = SPIT + 0.5
LAD0, LAD1, SLAP = t['fishW'] - 0.05, t['pools'] + 0.1, t['cantF'] - 0.02
DRY0, DRY1, WET0, WET1 = t['only'] - 0.05, t['up'] + 0.25, t['lakefront'] + 0.5, t['visitor'] + 0.4
NCOLS = 6
BKIN = CRUMB1 + 0.25; BKEND = COL0 + (NCOLS - 1) * COLDT + COLDUR; BKOUT = BKEND + 0.15
GAG0 = DRY0 + 0.1                                                # the drought: Gary on a roof with his flip-flop
CL0 = t['cooling'] + 1.05; CL1 = max(t['week'] + 0.5, CL0 + 1.3)

# ---------------------------------------------------------------- music
BPM = 104
BEAT = 60 / BPM
BAR = 4 * BEAT
IN = t['congrats'] - 0.02
chords, cur, k = [], IN, 0
progA, progB = ['D', 'G', 'D', 'A'], ['Bm', 'G', 'D', 'A']
while cur < D - 2.5:
    seq = progA if cur < COL0 else progB if cur < t['add'] else ['G', 'A', 'D', 'D']
    chords.append([round(cur, 3), seq[k % 4]]); cur += BAR; k += 1
chords.append([round(cur, 3), 'D'])
sections = [{"t0": IN, "t1": D, "style": "walk", "step": BEAT, "vel": [[IN, 0.3], [COL0, 0.34], [t['add'], 0.36], [D, 0.32]],
             "swing": 0.14, "comp_vel": 0.36, "bass_vel": 0.85, "bass_hold": 1.0, "stab_hold": 0.8}]
mallet = []
for c in story['callouts']:                                  # the build-genre signature: a rising "ta-da" on every TERM
    a = c['t0'] + 0.02
    if a < IN: continue                                      # the hook is foley only (the music enters on "Congratulations")
    if c['style'] == 'term':
        mallet += [[round(a, 3), 74, 0.36, 0.18], [round(a + 0.09, 3), 78, 0.36, 0.18], [round(a + 0.18, 3), 81, 0.4, 0.4]]
    elif c['style'] in ('money', 'label'):
        mallet += [[round(a, 3), 69, 0.3, 0.16], [round(a + 0.1, 3), 74, 0.32, 0.3]]
    elif c['style'] == 'stamp':
        mallet += [[round(a, 3), 71, 0.3, 0.14], [round(a + 0.12, 3), 66, 0.3, 0.3]]
pad = [{"t0": IN, "t1": D - 0.2, "notes": [38, 50, 57, 62, 66], "level": 0.8, "attack": 0.4, "release": 0.8, "cutoff": 1000, "hp": 30}]
booms = [IN, SLAM, CRUMB, COL0 + NCOLS * COLDT, FILL1, t['end']]
drums = [[round(b, 3), 0.4, "boom"] for b in booms]
drum_patterns = [{"t0": IN + 0.02, "t1": D - 1.0, "step": BEAT, "pattern": [1, 0, 0.5, 0], "vel": 0.1, "kind": "tom"}]
music = {"gain_db": 0.0, "reverb_db": -12.0, "pad_db": 4.0, "pad_reverb_db": -6.0, "mallet_db": 0.0, "drums_db": -9.0, "instrument": "pluck",
         "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3}, "end": D, "chords": chords, "sections": sections, "melody": [],
         "mallet_melody": sorted(mallet), "pad": pad, "drums": drums, "drum_patterns": drum_patterns}

# ---------------------------------------------------------------- foley (all from the narration)
ev = []
def e(tt, sound, gain, pan=0.0, **args):
    d = {"t": round(tt, 3), "sound": sound, "gain_db": gain, "pan": pan}
    if args: d["args"] = args
    ev.append(d)
# hook: heat, the thermometer pegs, the CLOSED sign slaps on, the pool is flung into the creek
for k2 in range(5): e(0.35 + k2 * 0.45, "plip", -27, 0.2, pitch=1.3)
e(t['n104'] - 0.05, "pop", -17, 0.3, pitch=1.6)
e(t['closed'] - 0.05, "knock", -13, 0.2, pitch=0.8); e(t['closed'], "bonk", -20, 0.2)
e(THROW, "blanket_rustle", -18, 0.0, dur=0.9, intensity=0.8); e(LANDK, "splash", -11, -0.2, size=1.3)
ev.append({"t0": THROW + 0.4, "t1": min(t['beaver'] - 0.5, t['hops'] - 0.8), "sound": "footsteps", "rate": 4.5, "gain_db": -27, "pan0": 0.4, "pan1": -0.2})   # Gary walks over
# congrats: confetti; the yardstick; the beaver surfaces, scribbles, holds up its card
e(t['congrats'], "pop", -12, 0.0); e(t['congrats'] + 0.12, "pop", -15, -0.3, pitch=1.3); e(t['congrats'] + 0.2, "blanket_rustle", -23, 0.2, dur=1.4, intensity=0.6)
e(t['six'] - 0.2, "knock", -18, -0.3, pitch=1.2)
e(t['beaver'] - 0.35, "splash", -17, 0.3, size=0.6); e(t['beaver'] + 0.15, "plush_squeak", -24, 0.3, pitch=1.6)
e(t['already0'], "pen_scribble", -21, 0.3, dur=0.6); e(t['notes'] - 0.03, "pop", -16, 0.3, pitch=1.4)
# float
e(t['inF'], "splash", -12, -0.1, size=1.1); e(t['lifts'], "plush_squeak", -22, 0.0, pitch=0.8)
e(t['lost'] - 0.1, "pop", -22, 0.2, pitch=1.8); e(FLOAT1 - 0.2, "bonk", -15, 0.3); e(FLOAT1 - 0.15, "knock", -19, 0.3, pitch=0.7)
e(FLOAT1 + 0.2, "pen_scribble", -23, 0.4, dur=0.8)
# divert: the hard hat lands, the tunnel is dug back to the inlet, Gary runs, the portals pop, the flush
e(t['dig'] + 0.25, "clunk", -18, 0.2, size=0.5, metal=0.8)
e(DIG0 + 0.3, "splash", -15, 0.4, size=0.7)                                           # Gary jumps into the outlet
for k2 in range(22): e(DIG0 + 0.35 + (k2 + 0.5) * (DIG1 - DIG0 - 0.35) / 22, "dig", -16 - (k2 % 2), 0.4 - 0.04 * k2)   # his shovel, stroke by stroke
e(DIG1, "crumble", -13, -0.4, dur=0.6, size=1.0); e(DIG1, "splash", -14, -0.4, size=1.0); e(DIG1 + 0.55, "plush_squeak", -21, -0.4, pitch=1.3)   # breakthrough
ev.append({"t0": RUN1, "t1": SUCK - 0.1, "sound": "footsteps", "rate": 4.0, "gain_db": -26, "pan0": -0.4, "pan1": -0.4})
for i in range(4): e(t['four'] - 0.15 + i * 0.09, "pop", -18, -0.4 + 0.1 * i, pitch=1.0 + 0.15 * i)
e(SUCK, "slurp", -11, -0.3, dur=0.9); e(OUT, "splash", -12, 0.3, size=1.1); e(ONPILE, "giant_step", -16, -0.1, size=0.4); e(ONPILE + 0.05, "plush_squeak", -21, -0.1, pitch=0.9)
# piping: three dirt loads, the plug, the leak, the finger, the cork
for d in DUMPS: e(d - 0.25, "dig", -17, -0.1)                  # Gary's shovel throw
for d in DUMPS: e(d - 0.05, "crumble", -13, -0.1, dur=0.7, size=0.9); e(d + 0.05, "giant_step", -16, -0.1, size=0.9)
e(PLUG - 0.1, "clunk", -18, -0.5, size=1.0, metal=0.4)
e(t['sneaks'], "grate", -21, 0.0, dur=1.6)
e(t['finger'] - 0.03, "plush_squeak", -20, 0.1, pitch=1.4); e(t['garyP2'], "metal_groan", -22, 0.0, dur=0.8, pitch=1.4)
e(POPC, "pop", -10, 0.0, pitch=0.6); e(POPC + 0.03, "splash", -13, 0.1, size=1.0); e(LANDC, "giant_step", -18, -0.1, size=0.4)
for k2 in range(4): e(LANDC + 0.25 + k2 * 0.35, "plip", -24, -0.1, pitch=1.2 + 0.1 * k2)   # the cork drips
# cutoff: the wall slams through to bedrock; the beaver taps its twig wall
e(SLAM, "clunk", -9, 0.0, size=2.0, metal=0.35); e(SLAM + 0.02, "giant_step", -12, 0.0, size=1.4)
for h in HAM: e(h, "clunk", -11, 0.0, size=1.6, metal=0.3); e(h + 0.03, "crumble", -16, 0.0, dur=0.35, size=0.8)   # mallet: CLONK, the wall sinks
for k2 in range(3): e(t['already'] + 0.05 + k2 * 0.22, "knock", -19, 0.4, pitch=1.6)
# push: the dam strains, slides, crumbles; the flood
e(t["lake"] - 0.1, "low_swell", -20, -0.3, dur=1.4, pitch=0.8)
e(SLIDE0, "metal_groan", -16, 0.0, dur=1.3, pitch=0.6); e(SLIDE0 + 0.05, "crumble", -15, 0.0, dur=1.3, size=1.0)
e(CRUMB, "crumble", -9, 0.0, dur=1.6, size=1.5); e(CRUMB + 0.05, "splash", -12, 0.2, size=1.6)
e(CRUMB - 0.2, "metal_groan", -24, -0.4, dur=1.0, pitch=1.3)                          # the cableway bucket comes down
e(BKIN, "bonk", -14, -0.3); e(BKIN + 0.02, "clunk", -17, -0.3, size=0.8, metal=0.9)        # Gary lands in it
for i in range(NCOLS): e(COL0 + i * COLDT - 0.05, "knock", -19, -0.5 + 0.2 * i, pitch=1.4); e(COL0 + i * COLDT + 0.1, "splash", -20, -0.5 + 0.2 * i, size=0.45)   # trip rope, glop
e(BKOUT + 0.35, "metal_groan", -24, 0.4, dur=1.2, pitch=1.4); e(BKOUT + 0.5, "giant_step", -19, 0.3, size=0.35)   # bucket up, Gary down
# the concrete columns rise in lifts; 660 ft; the lake slams it on "bully"
for i in range(NCOLS):
    for l in range(3): e(COL0 + i * COLDT + (l + 1) / 3 * COLDUR, "clunk", -20 + (l == 2) * 4, -0.5 + 0.2 * i, size=1.1, metal=0.15)
for k2 in range(8): e(t['n660'] - 0.15 + k2 * 0.05, "knock", -24, -0.1 - 0.08 * k2, pitch=1.8)   # the tape zips out
e(t['bully'] - 0.05, "bonk", -13, 0.3); e(t['bully'], "giant_step", -19, 0.3, size=0.4)   # Gary shoulder-charges the dam
e(FILL0 + 0.1, "slurp", -18, -0.5, dur=1.2); e(FILL1, "splash", -9, -0.5, size=1.8); e(FILL1 + 0.05, "giant_step", -15, -0.4, size=1.2)
# heat: the sizzle (a short rain bed), the leap; cooling pipes pop in, drip, frost
e(t['hoovers'], "plip", -20, 0.3, pitch=0.7); e(t['n125'] - 0.1, "pop", -17, 0.2, pitch=1.1)
e(LEAP, "plush_squeak", -16, 0.2, pitch=1.5); e(LEAP + 0.7, "giant_step", -20, 0.2, size=0.35)
e(PIPE0 - 0.1, "plush_squeak", -20, 0.1, pitch=0.8); e(PIPE0, "slurp", -18, 0.0, dur=0.8)   # Gary's garden hose
ev.append({"t0": CL0, "t1": CL1, "sound": "footsteps", "rate": 5.0, "gain_db": -26, "pan0": 0.1, "pan1": -0.4})   # the climb up the dam in the rain
for k2 in range(10): e(PIPE0 + k2 * (PIPE1 - PIPE0 - 0.3) / 10, "pop", -21 - (k2 % 3), -0.4 + 0.08 * k2, pitch=1.0 + 0.06 * k2)
for k2 in range(4): e(t['cooling'] - 0.2 + k2 * 0.25, "plip", -22, 0.0, pitch=1.4)
# spill: thunder far off, the overtopping roar, the spillway + EXIT, the water slide, the splash
e(t['rains'] - 0.3, "distant_boom", -22, -0.2, size=0.8)
for k2 in range(10): e(RAIN0 + 0.4 + k2 * (RAIN1 - RAIN0 - 0.6) / 10, "plip", -25, -0.5 + 0.1 * k2, pitch=0.9 + 0.05 * (k2 % 4))
e(HSP, "clunk", -12, -0.3, size=1.3, metal=0.3); e(HSP + 0.03, "crumble", -17, -0.3, dur=0.4, size=0.7)   # the notch
e(t['spillway'] - 0.12, "clunk", -14, 0.0, size=1.4, metal=0.3); e(t['exit'] - 0.1, "pop", -16, 0.1, pitch=1.2)
e(SLD0, "slurp", -18, -0.2, dur=SLD1 - SLD0 + 0.2); e(SLD1, "pop", -18, 0.1, pitch=0.9); e(SPLASH, "splash", -10, 0.2, size=1.4); e(SPLASH + 0.02, "bonk", -16, 0.2)   # exactly once
# power: the RENT DUE card, the penstock, the powerhouse pops, the spin cycle, the spit
e(t['rent'] - 0.15, "pop", -16, 0.4, pitch=1.4)
for k2 in range(3): e(VW0 + 0.1 + k2 * (VW1 - VW0 - 0.2) / 3, "metal_groan", -22, 0.4, dur=0.35, pitch=1.6)   # the valve wheel squeaks round
e(PH, "pop", -13, 0.2, pitch=0.8); e(PH + 0.05, "clunk", -17, 0.2, size=1.2, metal=0.7)
e(t['turbines'] + 0.2, "zap", -24, 0.6, dur=0.4)
e(SUCKT, "slurp", -14, 0.2, dur=0.6)
for k2 in range(3): e(SUCKT + 0.35 + k2 * 0.3, "plush_squeak", -22, 0.2, pitch=1.2 + 0.2 * k2)   # round and round
e(SPIT, "pop", -15, 0.3, pitch=0.9); e(SPLAT, "splash", -13, 0.3, size=1.0)
# fish: angry leaps, the ladder pops step by step, the climb, the slap
for k2 in range(6): e(t['salmon'] - 0.2 + k2 * 0.32, "splash", -21, 0.2 - 0.05 * k2, size=0.35)
for k2 in range(9): e(LAD0 + (LAD1 - 0.3 - LAD0) * k2 / 8, "knock", -18, -0.2 - 0.04 * k2, pitch=0.9 + 0.08 * k2)
for k2 in range(9): e(t['climb'] - 0.2 + k2 * 0.3, "plip", -21, -0.3, pitch=1.0 + 0.05 * k2)
e(SLAP, "bonk", -12, 0.0); e(SLAP + 0.5, "splash", -13, 0.1, size=1.0)
for k2 in range(3): e(t['home'] - 0.1 + k2 * 0.22, "bonk", -20, -0.2)   # salmon bonk the dam
e(t['blame'] + 0.1, "bonk", -15, 0.3)   # …then Gary
# town: under the lake (a low swell), the drought, the refill
e(t['drowned'] - 0.2, "low_swell", -18, -0.3, dur=1.8, pitch=0.7)
e(DRY0, "slurp", -17, -0.3, dur=1.0); e(WET0, "slurp", -18, -0.3, dur=1.0)
e(GAG0 + 0.6, "splash", -17, -0.4, size=0.7); e(DRY1, "plush_squeak", -20, -0.4, pitch=1.6); e(t['sells'] + 0.05, "plush_squeak", -22, -0.4, pitch=0.7)   # Gary + the flip-flop
for k2 in range(4): e(DRY1 + 0.3 + k2 * 0.45, "plip", -25, -0.4, pitch=1.3)
for k2 in range(3): e(t['lakefront'] - 0.35 + k2 * 0.16, "knock", -17, -0.3, pitch=1.2)   # the FOR SALE sign hammered in
# finish: the road, the visitor center, the gift shop, the sign
ev.append({"t0": t['gift'] - 0.3, "t1": W('finish', 'sign') - 0.2, "sound": "footsteps", "rate": 4.5, "gain_db": -26, "pan0": 0.6, "pan1": 0.3})   # Gary walks to the sign
for k2 in range(3): e(W('finish', 'sign') - 0.2 + (k2 + 0.5) * 0.35, "knock", -16, 0.3, pitch=0.9)   # mallets it in
e(W('finish', 'swimming') + 0.05, "splash", -12, 0.4, size=1.0)   # flops into his pool
e(t['road'] - 0.12, "pop", -14, -0.3, pitch=0.9); e(W('finish', 'center') + 0.25, "pop", -14, 0.2, pitch=1.1); e(t['gift'] - 0.1, "pop", -14, 0.3, pitch=1.3); e(t['sign'] - 0.1, "knock", -15, 0.3, pitch=1.0)
# the end: confetti + cheer, money, the sign wobble, the bestseller pop, the pool deflates
e(t['end'], "pop", -12, 0.0); e(t['end'] + 0.1, "pop", -15, 0.3, pitch=1.3); e(t['end'] + 0.15, "blanket_rustle", -22, 0.0, dur=1.6, intensity=0.6)
for k2 in range(4): e(t['n49'] + 0.2 + k2 * 0.6, "blanket_rustle", -24, -0.3 + 0.2 * k2, dur=0.7, intensity=0.5)
for k2 in range(3): e(t['end'] + 0.3 + k2 * 0.25, "pop", -20, -0.3 + 0.3 * k2, pitch=1.4 + 0.15 * k2)
e(t['bestseller'] + 0.1, "pen_scribble", -22, -0.3, dur=0.6)
e(t['illegal'], "bonk", -18, -0.1); e(t['bestseller'] - 0.3, "pop", -16, -0.3, pitch=1.5)
e(t['closedE'] + 0.1, "slurp", -15, 0.0, dur=0.9); e(t['closedE'] + 0.15, "low_swell", -21, 0.0, dur=1.2, pitch=0.6)

# ---------------------------------------------------------------- beds
amb = [
    {"sound": "crickets", "t0": 0.0, "t1": IN + 0.8, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -30, "args": {"count": 6, "density": 0.9, "fc_range": [3200, 4200]}, "seed": 1},   # cicada heat buzz
    {"sound": "wind", "t0": 0.0, "t1": D, "fade_in": 0.3, "fade_out": 0.5, "gain_db": -36, "args": {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, "seed": 2},
    {"sound": "water_rush", "t0": 0.0, "t1": DIG1, "fade_in": 0.2, "fade_out": 0.6, "gain_db": -31, "args": {"intensity": 0.5}, "seed": 3},
    {"sound": "water_rush", "t0": DIG1, "t1": PLUG + 0.3, "fade_in": 0.2, "fade_out": 0.4, "gain_db": -24, "seed": 4},
    {"sound": "water_rush", "t0": PLUG, "t1": t['piping'], "fade_in": 0.4, "fade_out": 0.6, "gain_db": -28, "seed": 5},
    {"sound": "water_rush", "t0": JET, "t1": SLAM + 0.3, "fade_in": 0.1, "fade_out": 0.3, "gain_db": -27, "args": {"intensity": 0.6}, "seed": 6},
    {"sound": "water_rush", "t0": CRUMB, "t1": CRUMB1 + 0.8, "fade_in": 0.05, "fade_out": 0.6, "gain_db": -20, "seed": 7},
    {"sound": "water_rush", "t0": FILL0, "t1": FILL1 + 0.5, "fade_in": 0.3, "fade_out": 0.4, "gain_db": -24, "seed": 8},
    {"sound": "rain_window", "t0": SIT + 0.1, "t1": LEAP + 0.5, "fade_in": 0.05, "fade_out": 0.3, "gain_db": -22, "args": {"intensity": 1.0}, "seed": 9},   # the sizzle
    {"sound": "rain_window", "t0": RAIN0, "t1": RAIN1 + 0.4, "fade_in": 0.3, "fade_out": 0.6, "gain_db": -22, "args": {"intensity": 1.0}, "seed": 10},
    {"sound": "water_rush", "t0": OVER, "t1": t['spillway'] + 0.5, "fade_in": 0.2, "fade_out": 0.5, "gain_db": -19, "seed": 11},
    {"sound": "water_rush", "t0": t['spillway'] + 0.3, "t1": D, "fade_in": 0.6, "fade_out": 0.5, "gain_db": -32, "args": {"intensity": 0.5}, "seed": 12},
    {"sound": "drill", "t0": t['spin'], "t1": SPLAT + 0.5, "fade_in": 0.5, "fade_out": 0.6, "gain_db": -26, "args": {"rate": 5.0}, "seed": 13},   # the turbine
    {"sound": "lamp_hum", "t0": t['turbines'], "t1": t['salmon'] + 0.5, "fade_in": 0.4, "fade_out": 0.6, "gain_db": -32, "seed": 14},
    {"sound": "crowd_cheer", "t0": t['end'], "t1": t['coolE'] + 0.3, "fade_in": 0.1, "fade_out": 0.6, "gain_db": -27, "seed": 15},
    {"sound": "crickets", "t0": t['coolE'] - 0.5, "t1": D, "fade_in": 0.6, "fade_out": 0.6, "gain_db": -34, "args": {"count": 6, "density": 0.9, "fc_range": [3200, 4200]}, "seed": 16},
]

cues = {
    "title": "025 - How a Kiddie Pool Becomes a Dam (build genre: DESERT SHUFFLE pluck walk + construction foley + narrator)",
    "duration": D, "target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.35, D],
    "stem_gain_db": {"music": -8.0, "sfx": 5.0, "amb": 5.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -6.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -14.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0},
                      "voice": {"comp_thr_dbfs": -10.0, "ratio": 3.0, "win": 0.006, "limit_dbfs": -2.5}},
    "sfx_lowpass_hz": 5200,
    "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -8.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    "shots": [B[b]['t0'] for b in story['order']] + [D],
    "music": music, "ambience": amb, "events": sorted(ev, key=lambda x: x.get('t', x.get('t0'))),
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"cues.json: {len(ev)} events, {len(amb)} beds, {len(chords)} chords, {len(mallet)} mallet notes")
