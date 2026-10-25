# 014 "What if every adult woke up as a toddler?" — TRIBE optimization run

First video made with the TRIBE loop: build → render → `run_tribe.py` → `score.py` → fix the weakest stretches → re-score.
Target: beat the best posted video (013 "twice as dumb") on whole-brain mean AND first-60-s mean, with no dead zone
(≥ 8 s below the pooled median 0.0185, title card excluded).

| Metric | 013 (best posted) | 014 v1 | 014 v2 (shipped) |
|---|---|---|---|
| Whole-brain mean | 0.0447 | 0.0770 | **0.0777** |
| First 60 s | 0.0421 | 0.0752 | **0.0769** |
| % above threshold (0.1625) | 15.7% | 23.2% | **23.6%** |
| Seconds above pooled median | 68% | 89% | **90%** |
| Dead zones after the title | 4–16 s | none | none |

Per beat (mean whole-cortex):

| Beat | v1 | v2 | v2 change |
|---|---|---|---|
| open (title + shrink) | 0.011 | 0.015 | 2 cars pass behind the title |
| coffee | 0.053 | 0.052 | 3 hops before the chair |
| commute | 0.082 | 0.077 | — |
| board | 0.097 | 0.092 | — |
| press | 0.078 | 0.072 | — |
| market | 0.087 | 0.078 | — |
| plane | 0.069 | 0.075 | turn wave + bounce wave + dolly |
| wedding | 0.066 | 0.097 | falling petals + a flower girl |
| park | 0.111 | 0.120 | — |
| dogs | 0.122 | 0.118 | — |
| grow + end card | 0.094 | 0.088 | — |

## What we learned
- **What scored high from the start:** bright places, crowds of big-headed faces, motion in every frame, a steady mix
  (LRA ≈ 4 LU). The playground and the dog beat (busy, bright, faces, a dog) were the top beats in both versions.
- **What sagged:** stretches where nothing moves. In v1 the plane (everyone standing still, staring) took the motion
  network to −0.19 and the kitchen dipped while Gary slowly pushed a chair in a quiet room.
- **Targeted fixes work locally, but the whole-video gain is small.** v2 lifted the wedding by +46 % and the plane by +8 %,
  but beats that were not changed drifted down 4–11 %. TRIBE predicts each second in the context of ~100 s of input and
  the mix is re-normalized as a whole, so edits ripple. Net: +1 % whole-brain, +2 % first 60 s. Diminishing returns: one
  pass is enough once the target is met.
- Every video's lowest stretch is still the 0–3 s title card (house rule: the question alone on screen).
- Reminder (report.md): a higher predicted response is **not validated** against views — this is a quality signal, not a
  promise of reach.

Cost on a 24 GB M5 Pro: ~20 min per 70-s video when the Mac is idle, ~60 min under memory pressure. The per-clip cache
(`mac_patches.py`) makes later versions re-encode only the clips whose frames changed.
