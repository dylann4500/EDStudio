#!/usr/bin/env python3
"""How much moves in each shot: the number the pace-and-energy pass is judged by (BRIEF.md, Revision 2).

    python3 tools/motion.py rough                 every shot that has frames in frames/rough/
    python3 tools/motion.py final --shots A01,A03
    python3 tools/motion.py --film some.mp4       a finished film, cut by cut (cuts found by ffmpeg's scene detector)

Score = mean absolute difference between neighbouring frames, both shrunk to 320 x 180 grey (0-255). It rises with
camera travel and with action and does not care which. The reference film's median shot scores 6.6 and its lively
stretches 10-18; our target is 6 or more for every shot. Frames of the story clock are measured (the whole rendered
shot), not the cut.
"""
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

W, H = 320, 180


def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def grey(args):
    r = subprocess.run(["ffmpeg", "-v", "error"] + args + ["-vf", "scale=%d:%d:flags=area,format=gray" % (W, H), "-f", "rawvideo", "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, H, W).astype(np.float32)


def score(fr):
    d = np.abs(fr[1:] - fr[:-1]).mean(axis=(1, 2))
    return d


def shots(tag, only):
    rows = []
    for s in tl.SHOTS:
        sid, set_name = s[0], s[1]
        if only and sid not in only:
            continue
        files = [os.path.join(ROOT, "frames", tag, set_name, "%06d.jpg" % tl.bframe(sid, i)) for i in range(tl.frames(sid))]
        files = [f for f in files if os.path.exists(f)]
        if len(files) < 3:
            continue
        lst = os.path.join(ROOT, "out", "_motion.txt")
        os.makedirs(os.path.dirname(lst), exist_ok=True)
        with open(lst, "w") as f:
            for p in files:
                f.write("file '%s'\nduration 0.04\n" % p)
        d = score(grey(["-f", "concat", "-safe", "0", "-i", lst]))
        third = max(1, len(d) // 3)
        rows.append((sid, len(files), float(d.mean()), float(d[:third].mean()), float(d[third:2 * third].mean()), float(d[2 * third:].mean())))
    return rows


def film(path):
    fr = grey(["-i", path])
    d = score(fr)
    cuts = [0] + [i + 1 for i in range(1, len(d) - 1) if d[i] > 18 and d[i] > 3.5 * max(d[i - 1], d[i + 1], 0.5)] + [len(fr)]
    rows = []
    for a, b in zip(cuts, cuts[1:]):
        if b - a < 4:
            continue
        x = d[a + 1:b - 1]
        rows.append(("%5.1fs" % (a / tl.FPS), b - a, float(x.mean()), 0, 0, 0))
    return rows


def main():
    if "--film" in sys.argv:
        rows = film(opt("--film"))
    else:
        only = opt("--shots")
        rows = shots(sys.argv[1], only.split(",") if only else None)
    for sid, n, m, a, b, c in rows:
        bar = "#" * int(round(min(m, 24)))
        flag = "" if m >= 6 else "   << below 6"
        print("%-7s %3d fr  %5.1f  (thirds %4.1f %4.1f %4.1f)  %s%s" % (sid, n, m, a, b, c, bar, flag))
    if rows:
        v = sorted(r[2] for r in rows)
        print("median %.1f   mean %.1f   lowest %.1f   shots below 6: %d of %d" % (v[len(v) // 2], sum(v) / len(v), v[0], sum(1 for x in v if x < 6), len(v)))


main()
