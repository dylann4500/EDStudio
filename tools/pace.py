#!/usr/bin/env python3
"""Narration pace report (034, the turbo build reel): words/s, word gaps, silence — measured from words.json.

    python3 -I tools/pace.py 034-go-kart-tank [another-slug | path/to/words.json …]

speech span = first word start → last word end. A "pause" is any gap between consecutive words; the turbo bar (docs/BUILD.md →
Turbo pace) is no gap > 0.25 s anywhere and 4.3–4.5 words/s over the span. Caption blanks = gaps the one-word caption can't
bridge (narrate.py keeps a word up to 0.35 s past its end).
"""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def report(slug):
    wj = json.load(open(slug if slug.endswith('.json') else os.path.join(ROOT, 'videos', slug, 'words.json')))
    ws = [w for b in wj['beats'] for w in b['words']]
    gaps = [(ws[i + 1]['t0'] - ws[i]['t1'], ws[i]['w'], ws[i + 1]['w'], ws[i]['t1']) for i in range(len(ws) - 1)]
    span = ws[-1]['t1'] - ws[0]['t0']
    big = sorted([g for g in gaps if g[0] > 0.25], reverse=True)
    print(f"{slug}: {len(ws)} words, {wj['duration']:.2f} s file, speech span {span:.2f} s → {len(ws) / span:.2f} words/s "
          f"({len(ws) / wj['duration']:.2f} over the file)")
    print(f"  max word gap {max(g[0] for g in gaps):.3f} s; gaps > 0.25 s: {len(big)} (total {sum(g[0] for g in big):.2f} s); "
          f"gaps > 0.3 s: {sum(g[0] > 0.3 for g in gaps)}; total silence between words {sum(max(0, g[0]) for g in gaps):.2f} s")
    print(f"  caption blanks (gap > 0.35 s): {sum(g[0] > 0.35 for g in gaps)}; lead {ws[0]['t0']:.2f} s, tail {wj['duration'] - ws[-1]['t1']:.2f} s")
    for g, a, b, t in big[:8]:
        print(f"    {g:.2f} s at {t:6.2f} s: '{a}' → '{b}'")


for a in [x for x in sys.argv[1:] if not x.startswith('--')]:
    report(a if a.endswith('.json') else os.path.basename(a.rstrip('/')))
