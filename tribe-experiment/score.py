"""Score one TRIBE-encoded video against the 10 posted EDStudio videos (the optimization loop for new videos).

Usage (from tribe-experiment/):  .venv/bin/python score.py results/014-v1.npy [path/to/shots.js]
Prints the headline metrics vs the best existing video, a per-beat table (from SHOTS in shots.js) and dead zones.
Reference numbers are fixed (from results/summary.csv + stats.json of the 10-video study) so scores stay comparable.
"""
import re
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
THRESH = 0.1625        # pooled 90th percentile of all 10 videos' predictions (stats.json threshold_p90)
WC_MED = 0.0185        # pooled median whole-cortex second (stats.json wc_pooled_median)
BEST = {"wc_mean": 0.04475, "wc_mean_first60": 0.04209, "pct_above_thresh": 15.7313}   # 013-twice-as-dumb (best of 10)
DEAD_S = 8             # a dead zone = this many consecutive seconds below WC_MED
SKIP = 4               # ignore the opening title card (house rule: the question alone on screen; every video is low there)


def shots_from(js):
    if not js:
        return []
    src = Path(js).read_text()
    return [(float(a), float(b), c) for a, b, c in re.findall(r"\{ t0: ([\d.]+), t1: ([\d.]+), cam: '(\w+)'", src)]


def main():
    p = np.load(sys.argv[1])
    wc = p.mean(1)
    n = len(wc)
    m = {"wc_mean": wc.mean(), "wc_mean_first60": wc[:60].mean(), "pct_above_thresh": 100 * (p > THRESH).mean(),
         "hook_0_3": wc[:3].mean(), "sustain_pooled_median": 100 * (wc > WC_MED).mean()}
    print(f"{Path(sys.argv[1]).stem}: {n} s")
    for k, v in m.items():
        b = BEST.get(k)
        print(f"  {k:24s} {v:+.4f}" + (f"   best existing {b:+.4f}  {'BEATS' if v > b else 'below'}" if b is not None else ""))
    # dead zones
    below = wc < WC_MED
    below[:SKIP] = False
    runs, s0 = [], None
    for i, b in enumerate(list(below) + [False]):
        if b and s0 is None:
            s0 = i
        if not b and s0 is not None:
            if i - s0 >= DEAD_S:
                runs.append((s0, i))
            s0 = None
    print(f"  dead zones (≥{DEAD_S} s below {WC_MED}, after {SKIP} s): " + (", ".join(f"{a}–{b} s" for a, b in runs) or "none"))
    shots = shots_from(sys.argv[2] if len(sys.argv) > 2 else None)
    if shots:
        print("  per beat (mean whole-cortex, min second):")
        for t0, t1, cam in shots:
            a, b = int(round(t0)), min(n, int(round(t1)))
            if b <= a:
                continue
            seg = wc[a:b]
            bar = "#" * max(0, int((seg.mean() + 0.05) * 200))
            print(f"    {t0:5.1f}–{t1:5.1f} {cam:9s} {seg.mean():+.4f}  min {seg.min():+.4f}  {bar}")
    target = m["wc_mean"] > BEST["wc_mean"] and m["wc_mean_first60"] > BEST["wc_mean_first60"] and not runs
    print(f"  TARGET {'MET' if target else 'NOT MET'} (beat 013 on whole-brain mean + first 60 s, no dead zones)")


if __name__ == "__main__":
    main()
