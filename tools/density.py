#!/usr/bin/env python3
"""Turbo-pace density report (034): how often something NEW happens on screen.

    node tools/render.mjs NNN-slug --qc > qc.log   (the video's EDSTUDIO_QC prints `counts:` and `events: {fx, kicks, frames}`)
    python3 -I tools/density.py NNN-slug qc.log

An "event" = a callout appearing (story.json), an effect burst/stream starting, a screen kick, a camera framing's word, or an SFX
cue (cues.json). Reports events per 10 s and every stretch longer than --gap (default 0.8 s) with no new visual event (SFX don't
count as visual). The turbo bar (docs/BUILD.md → Turbo pace): something new on screen at least every 0.8 s.
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
a = [x for x in sys.argv[1:] if not x.startswith('--')]
gap = float(next((x.split('=')[1] for x in sys.argv[1:] if x.startswith('--gap=')), 0.8))
slug, log = os.path.basename(a[0].rstrip('/')), a[1]
vd = os.path.join(ROOT, 'videos', slug)
story = json.load(open(os.path.join(vd, 'story.json')))
cues = json.load(open(os.path.join(vd, 'cues.json'))) if os.path.exists(os.path.join(vd, 'cues.json')) else {'events': []}
ev = {}
for line in open(log):
    m = re.search(r'events: (\{.*\})', line)
    if m: ev = json.loads(m.group(1))
    if 'counts:' in line: print(line.strip().split('] ', 1)[-1])
D = story['duration']
vis = sorted([c['t0'] for c in story['callouts']] + ev.get('fx', []) + ev.get('kicks', []) + ev.get('frames', []))
vis = [x for x in vis if 0 <= x <= D]
sfx = sorted(e.get('t', e.get('t0', 0)) for e in cues['events'])
print(f"visual events {len(vis)} ({len(vis) / D:.2f}/s), sfx cues {len(sfx)} ({len(sfx) / D:.2f}/s), callouts {len(story['callouts'])}")
print('per 10 s (visual / sfx):', ' '.join(f"{int(s)}:{sum(s <= x < s + 10 for x in vis)}/{sum(s <= x < s + 10 for x in sfx)}" for s in range(0, int(D) + 1, 10)))
holes = [(a, b) for a, b in zip([0.0] + vis, vis + [D]) if b - a > gap]
print(f"stretches > {gap} s with nothing new on screen: {len(holes)}" + (' — ' + ', '.join(f'{a:.1f}–{b:.1f} ({b - a:.1f})' for a, b in holes) if holes else ''))
