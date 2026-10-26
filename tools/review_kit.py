#!/usr/bin/env python3
"""Build a review kit for reviewer agents (docs/BUILD.md → The review loop).

    python3 -I tools/review_kit.py NNN-slug OUT_DIR [--video path.mp4] [--ref ref.mp4 ...]

Writes into OUT_DIR:
  ours/sheet_000-010s.jpg …   one sheet per 10 s: 2 frames/s, 10 per row, row-major (first frame = the sheet's start second)
  ours/frames/tSSS.S.jpg       every 0.5 s, 360 px wide (for close inspection)
  timeline.txt                 every beat's words with the second each is spoken + the on-screen callouts (from story.json)
  ref/<name>_sheet_*.jpg       the same 2 fps sheets for each --ref video, plus 6 fps strips of its first 12 s (camera motion)
Reviewers read images with their Read tool; tell them the layout above and that they are read-only.
"""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def ff(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)


def sheets(video, out, name):
    os.makedirs(out, exist_ok=True)
    d = duration(video)
    for s in range(0, int(d) + 1, 10):
        ff('-ss', str(s), '-t', '10', '-i', video, '-vf', 'fps=2,scale=200:-1,tile=10x2:padding=3:color=white', '-frames:v', '1', os.path.join(out, f'{name}sheet_{s:03d}-{s + 10:03d}s.jpg'))


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    slug, out = os.path.basename(a[0].rstrip('/')), os.path.abspath(a[1])
    vd = os.path.join(ROOT, 'videos', slug)
    video = a[a.index('--video') + 1] if '--video' in a else os.path.join(vd, 'out', 'silent.mp4')
    refs = [a[i + 1] for i, x in enumerate(a) if x == '--ref']
    ours = os.path.join(out, 'ours'); frames = os.path.join(ours, 'frames'); os.makedirs(frames, exist_ok=True)
    for f in os.listdir(frames):
        os.remove(os.path.join(frames, f))
    sheets(video, ours, '')
    ff('-i', video, '-vf', 'fps=2,scale=360:-1', '-start_number', '0', os.path.join(frames, 'f%04d.jpg'))
    for f in sorted(os.listdir(frames)):
        i = int(f[1:5]); os.rename(os.path.join(frames, f), os.path.join(frames, f't{i * 0.5:05.1f}.jpg'))
    s = json.load(open(os.path.join(vd, 'story.json')))
    lines = [f'{slug} timeline (seconds). Narration provider: {s.get("voice", {}).get("provider", "?")}.', '']
    for i in s['order']:
        b = s['beats'][i]
        lines.append(f"[{b['t0']:6.2f}-{b['t1']:6.2f}] beat '{i}': " + ' '.join(f'{w[0]}@{w[1]:.1f}' for w in b['w']))
    lines += ['', 'CALLOUTS (on-screen text besides the one-word captions):'] + [f"  {c['t0']:6.2f}-{c['t1']:6.2f} {c['style']:6s} {c['text']}" for c in s['callouts']]
    open(os.path.join(out, 'timeline.txt'), 'w').write('\n'.join(lines))
    for r in refs:
        name = os.path.splitext(os.path.basename(r))[0] + '_'
        sheets(r, os.path.join(out, 'ref'), name)
        ff('-ss', '0', '-t', '12', '-i', r, '-vf', 'fps=6,scale=160:-1,tile=12x6:padding=2:color=white', '-frames:v', '1', os.path.join(out, 'ref', f'{name}6fps_000-012s.jpg'))
    print(f'review kit → {out}  ({len(os.listdir(frames))} frames)')


if __name__ == '__main__':
    main()
