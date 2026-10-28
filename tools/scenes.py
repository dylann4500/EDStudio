#!/usr/bin/env python3
"""Scene changes in a build reel's one take (039, user ask: "lots of scene changes like mr beast").

Usage: python3 -I tools/scenes.py qc.log [-v]   (qc.log = the output of `node tools/render.mjs NNN-slug --qc`)
Needs the video's EDSTUDIO_QC to print a `cams:` line: [t, pos xyz, look xyz, fov, mood] every 0.1 s (039 shots.js).
A "new look" = the view moved far from the last counted one (aim turned > 35 deg, the aim point or the lens moved
> 0.6 / 0.8 of the subject distance, fov x2) or the weather/time of day changed. Target: one every ~6-8 s, none > 10 s.
"""
import json, math, sys
cs = json.loads([l for l in open(sys.argv[1]) if l.startswith('cams: ')][0][6:])
def sub(a, b): return [x - y for x, y in zip(a, b)]
def norm(v): return math.sqrt(sum(x * x for x in v))
def ang(a, b): return math.degrees(math.acos(max(-1, min(1, sum(x * y for x, y in zip(a, b)) / (norm(a) * norm(b))))))
ev, anc = [], None
for s in cs:
    t, P, L, fov, mood = s[0], s[1:4], s[4:7], s[7], s[8]
    if anc is None: anc = s; ev.append((t, 'start', L, mood)); continue
    Pa, La = anc[1:4], anc[4:7]; d = max(2, norm(sub(La, Pa)))
    why = []
    if mood != anc[8]: why.append(f'{anc[8]}->{mood}')
    a = ang(sub(L, P), sub(La, Pa))
    if a > 35: why.append(f'turn {a:.0f}')
    if norm(sub(L, La)) / d > 0.6: why.append(f'aim moved {norm(sub(L, La)):.1f} m')
    if norm(sub(P, Pa)) / d > 0.8: why.append(f'lens moved {norm(sub(P, Pa)):.1f} m')
    if max(fov, anc[7]) / min(fov, anc[7]) > 2: why.append(f'fov {anc[7]:.0f}->{fov:.0f}')
    if why: ev.append((t, ', '.join(why), L, mood)); anc = s
places = []   # distinct subjects: aim points > 4 m apart
for _, _, L, _ in ev:
    if not any(norm(sub(L, q)) < 4 for q in places): places.append(L)
combos = set()
for _, _, L, mood in ev: combos.add((min(range(len(places)), key=lambda i: norm(sub(L, places[i]))), mood))
END = cs[-1][0] + 0.1
times = [e[0] for e in ev] + [END]
gaps = sorted(((b - a, a, b) for a, b in zip(times, times[1:])), reverse=True)
print(f'new looks: {len(ev)} over {END:.1f} s (one every {END / len(ev):.1f} s on average)')
print(f'distinct subjects (aim points > 4 m apart): {len(places)}; distinct subject x weather looks: {len(combos)}')
print('longest stretches without a new look: ' + ', '.join(f'{g:.1f} s ({a:.1f}-{b:.1f})' for g, a, b in gaps[:5]))
print('stretches > 8 s: ' + (', '.join(f'{a:.1f}-{b:.1f}' for g, a, b in gaps if g > 8) or 'none'))
if '-v' in sys.argv:
    for t, why, L, mood in ev: print(f'{t:5.1f}  {mood:7s} {why}')
