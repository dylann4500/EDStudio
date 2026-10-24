# TRIBE v2 brain-response experiment: EDStudio TikToks

**Question.** Do the videos that performed best on TikTok also get a stronger, more sustained *predicted* brain response from
Meta's TRIBE v2 model? If so, could a TRIBE score gate what gets published?

**Short answer.** The ranking lines up surprisingly well: the whole-brain average tracks views with a rank correlation of
**0.93 across all 9 videos**. But almost everything that could explain that *other* than "the brain likes this video more"
is tangled up in the same 9 data points: which account a video was posted on, how long it is, and what kind of video it is.
Inside the one account where the comparison is fair (5 videos), the link is weaker and not statistically significant
(0.80, p = 0.10; 0.50 on a length-matched window). The control case shows the account matters far more than the
video: the same video, with one identical brain score, got 986 / 253 / 12 views.
**Treat this as a lead worth testing properly, not as a publish/don't-publish gate.**

---

## 1. What was run

| | |
|---|---|
| Model | TRIBE v2 (`facebook/tribev2`, CC BY-NC 4.0, used for a personal non-commercial experiment). Predicts an *average person's* fMRI response on the fsaverage5 cortex (20,484 surface points), one value per second, already shifted 5 s for blood-flow lag |
| Machine | MacBook, Apple M5 Pro, 24 GB. Everything ran locally; no video left the machine |
| Videos | the 9 `final.mp4` files in this repo (`videos/NNN-*/final.mp4`). *If a published TikTok was an earlier cut than the committed file, its brain score is for the committed version* |
| Encoders actually used | **video**: V-JEPA 2 giant (64-frame clips, 2 per second); **audio**: w2v-BERT 2.0; **text**: none (see below) |
| Run time | ~3 h of encoding for all 9 (≈7 s per 64-frame clip), after the setup work below |

**Three things differ from a stock GPU run. None of them change what the model computes:**

1. **No speech → no text stream.** EDStudio videos have no spoken words: the audio is synthesized music and sound effects,
   and even the biography "narration" is on-screen text. TRIBE's language input (Llama 3.2) only listens to *speech*, so it
   received nothing, exactly as for any wordless video. The video encoder sees the subtitles as pixels but was not trained to
   read them. (Nice side effect: the gated Llama download and the HuggingFace account weren't needed.)
2. **Mac GPU instead of CUDA**, via small patches in `../mac_patches.py` (TRIBE's own code is untouched):
   attention computed in query chunks (verified identical: max difference 0.0) and token-averaging each layer before
   stacking (identical by construction). Without these, one clip needed >20 GB and pushed the Mac into swap.
3. **V-JEPA 2 in half precision.** On a test clip its features matched full precision with correlation **0.999997** on every
   layer (max error 0.09%), at half the memory and about 2× the speed.

**Metrics** (all per-second means, so 63 s and 119 s videos are comparable):
- *Whole-brain mean*: the average predicted response over all 20,484 points and all seconds. *First 60 s mean*: same, over
  the first 60 s only (every video has them; the biographies run 109–119 s).
- *% above threshold*: share of point-seconds above **0.156**, the 90th percentile of all predictions pooled across all 9
  videos (one fixed number for every video).
- *Opening (hook)*: mean over seconds 0–3 (the title card); *opening minus rest*: that minus the mean of the rest.
- *Sustain*: % of seconds where the whole-brain mean is above **0.017**, the median second across all videos (a fixed bar).
  The suggested "% above the video's *own* median" is ≈50% for every video by definition (last column of table 2), so it
  can't tell videos apart.
- *Networks*: areas of the HCP-MMP1 atlas (Glasser 2016), selected the same way as TRIBE's own ROI helper. **Visual** =
  V1–V8, LO, ventral visual (2,149 points); **motion** = MT+ complex (MT, MST, FST, V4t; 168); **auditory** = A1 + belt +
  A4/A5 (590); **language** = left 44/45/47l/55b/IFJa/SFL/PSL/STS/TPOJ1/STGa (602); **default-mode** = posterior
  cingulate/precuneus/medial prefrontal/angular (1,679).

## 2. Results

Sorted by views (best account). The pee-pants video appears once with all three accounts' views.

| # | Video | Views (per account) | Length | Whole-brain mean | First 60 s mean | % above threshold | Opening 0–3 s | Opening minus rest | Sustain* |
|---|---|---|---|---|---|---|---|---|---|
| 002 | Everyone woke up pregnant | 73,800 | 63 s | +0.038 | +0.038 | 15.4% | -0.036 | -0.077 | 68% |
| 007 | Every human became twice as smart | 67,800 | 70 s | +0.034 | +0.022 | 15.3% | -0.048 | -0.085 | 64% |
| 008 | Search history floated above their head | 22,800 | 68 s | +0.037 | +0.037 | 11.4% | -0.015 | -0.055 | 75% |
| 012 | Everyone peed their pants | 986 / 253 / 12 | 69 s | +0.028 | +0.022 | 12.5% | -0.034 | -0.065 | 55% |
| 010 | Height doubled overnight | 892 | 71 s | +0.029 | +0.029 | 14.5% | -0.031 | -0.063 | 63% |
| 004 | Every human disappeared except you | 230 | 71 s | +0.003 | -0.007 | 8.1% | -0.035 | -0.040 | 24% |
| 005 | Every nuclear weapon vanished | 218 | 71 s | +0.026 | +0.026 | 11.4% | -0.048 | -0.078 | 82% |
| 009 | Abraham Lincoln biography | 76 | 119 s | -0.029 | -0.044 | 4.1% | -0.032 | -0.003 | 14% |
| 011 | Elon Musk biography | 15 | 109 s | -0.004 | +0.014 | 4.8% | -0.019 | -0.015 | 38% |

\*Sustain = % of seconds above the fixed pooled median (0.017).

| # | Visual mean / peak | Motion (MT+) mean / peak | Auditory mean / peak | Language mean / peak | Default-mode mean / peak | Sustain vs own median |
|---|---|---|---|---|---|---|
| 002 | +0.082 / +0.274 | -0.077 / +0.151 | +0.062 / +0.260 | -0.055 / +0.115 | -0.024 / +0.039 | 49% |
| 007 | +0.083 / +0.257 | -0.092 / +0.336 | +0.027 / +0.245 | -0.069 / +0.064 | -0.024 / +0.066 | 50% |
| 008 | +0.068 / +0.255 | -0.113 / +0.220 | +0.059 / +0.168 | -0.027 / +0.106 | +0.005 / +0.091 | 50% |
| 012 | +0.082 / +0.304 | -0.092 / +0.324 | +0.034 / +0.318 | -0.077 / +0.044 | -0.023 / +0.040 | 49% |
| 010 | +0.097 / +0.265 | -0.013 / +0.382 | -0.007 / +0.164 | -0.093 / +0.039 | -0.029 / +0.040 | 49% |
| 004 | +0.032 / +0.176 | -0.253 / +0.343 | +0.044 / +0.225 | -0.074 / +0.072 | -0.050 / +0.021 | 49% |
| 005 | +0.071 / +0.278 | -0.200 / +0.072 | +0.062 / +0.147 | -0.047 / +0.006 | -0.025 / +0.044 | 49% |
| 009 | -0.030 / +0.174 | -0.197 / +0.352 | +0.011 / +0.306 | -0.063 / +0.192 | -0.052 / +0.064 | 50% |
| 011 | +0.012 / +0.210 | -0.118 / +0.234 | -0.003 / +0.230 | -0.043 / +0.132 | -0.031 / +0.094 | 50% |

![Second-by-second predicted response](timecourses.png)

![Views vs three metrics](scatter.png)

![Brain maps](brain_maps.png)

### Top 3 vs bottom 3

Top 3 = 002, 007, 008 (all @ed._.studios). Bottom 3 = 005 (@ed_.studios), 009 and 011 (@ed._.sims).

| Metric | Top 3 | Bottom 3 | Exact permutation p |
|---|---|---|---|
| Whole-brain mean | +0.036 | −0.002 | 0.10 (the smallest p a 3-vs-3 test can give) |
| First 60 s mean | +0.032 | −0.001 | 0.20 |
| % above threshold | 14.1% | 6.8% | 0.10 |
| Opening minus rest (hook) | −0.073 | −0.032 | 0.30 |
| Sustain (fixed bar) | 69% | 45% | 0.40 |

The top 3 are higher on total activation and above-threshold share, and every top video beats every bottom video on
those two. **Hook strength and sustain don't separate the groups.** With 3 vs 3 videos, no result can reach p < 0.05.

### Correlation with views (Spearman rank, log views)

| Metric | All 9 videos (best account's views) | @ed._.studios only (n = 5) |
|---|---|---|
| Whole-brain mean | **0.93** (p < 0.001) | 0.80 (p = 0.10) |
| First 60 s mean (length-matched) | 0.70 (p = 0.04) | 0.50 (p = 0.39) |
| % above threshold | 0.90 (p = 0.001) | 0.60 (p = 0.29) |
| Opening minus rest | −0.65 (p = 0.06) | −0.60 (p = 0.29) |
| Opening 0–3 s alone | −0.25 | — |
| Visual network mean | 0.65 (p = 0.06) | −0.50 |
| Default-mode mean | 0.75 (p = 0.02) | 0.20 |
| Language peak | −0.18 | 0.90 (p = 0.04) ← see "chance" below |

Full numbers for all 18 metrics are in `stats.json`.

## 3. Why not to trust the headline number yet

1. **Account is the biggest confound.** Views are mostly sorted by account: @ed._.studios 892–73,800, @ed_.studios
   218–253, @ed._.sims 12–76. Each account also carries a different *kind* of video: funny what-ifs on the main account,
   ominous world what-ifs on @ed_.studios, long biographies on @ed._.sims. So "low brain score ↔ low views" can't be
   separated from "posted on a small account". **The control case settles how big the account effect is: one video, one
   brain score, 986 vs 253 vs 12 views, an 82× spread.**
2. **Length.** The two biographies are 109–119 s and everything else is 62–71 s. Musk's second minute sags (70–108 s), and Lincoln dips in its general-store / law-books / debates stretch (~40–55 s)
   and again at the assassination (~100–105 s). On the first 60 s only, the correlation drops from 0.93 to 0.70
   (Musk moves up from 8th to 7th of 9).
3. **The score is noisy within a video.** Rank the videos on the first half of each timecourse and again on the second
   half: the two rankings agree only weakly (split-half rank correlation 0.32). A different edit of the same idea could
   score quite differently.
4. **Partly it's tracking sound.** Second by second, the whole-brain response follows loudness (median within-video
   correlation 0.24) far more than brightness (0.01) or motion (0.04). Across videos, a wide quiet-to-loud range (the
   sound-design-led mixes of 004, 005, 009) goes with a lower score (−0.65) *and* with fewer views (−0.57).
5. **Chance.** 18 metrics × 3 comparisons ≈ 54 tests. A couple of p < 0.05 results are expected by luck alone. The
   language-peak 0.90 on the main account (p = 0.04) is exactly that kind of result; the language network got no speech
   to respond to.
6. **Not what the model was built for.** TRIBE predicts an *average brain's* fMRI response. Nobody has shown that more
   predicted activation means more watch time, rewatches or shares. The difference map (top 3 minus bottom 3) is a
   broad, almost whole-brain shift, not a specific "engagement" network.

## 4. What it *does* suggest

- **Every video's weakest stretch is its opening.** The whole-brain response is negative during the 0–3 s title card in all
  9 videos and climbs over the first ~10 s. The winners don't have stronger openings (opening-alone vs views: −0.25);
  they have stronger *middles*. This is a model prediction, not a measured drop-off. TikTok's retention graph for the first
  3 seconds is the way to check whether the quiet, text-only open actually costs viewers.
- **Dips line up with the house rules you already have.** The lowest stretches are the empty, dark world of 004, the dim
  indoor scenes in the middle of Lincoln, and Musk's long tail. That's the same "keep beats short and busy, no static
  holds" feedback already in CLAUDE.md. A TRIBE pass could serve as an automated **dead-zone detector**, flagging any
  stretch of ≥ 8 s below the pooled median, without trusting it as a gate.

## 5. How to actually test the gate idea

1. **Use retention curves, not views.** TikTok Studio shows per-second audience retention for each post. Correlating the
   per-second TRIBE response with per-second retention *within each video* removes the account and length confounds
   entirely (each video is its own control) and gives ~60–110 data points per video instead of 1.
2. **Compare inside one account.** Post the next 10+ videos on @ed._.studios only, score each before posting, and check
   whether the score predicts which ones break out. Pre-register the metric (e.g. *first 60 s whole-brain mean*) so you're
   not picking the best of 18 after the fact.
3. **Add a voice track test.** These reels give TRIBE's language pathway nothing. A narrated vs subtitle-only version of
   the same video would show whether speech changes the predicted response (and, posted on one account, the views).

## 6. Files

| File | What |
|---|---|
| `results/<slug>.npy` | raw predictions, shape (seconds, 20484), float32 (not committed; regenerate with `run_tribe.py`) |
| `results/summary.csv` | every metric per video + views |
| `results/stats.json` | all correlations, permutation tests, confound and reliability checks |
| `results/lowlevel.csv` | motion, cuts, brightness, loudness per video |
| `results/timecourses.png`, `scatter.png`, `brain_maps.png` | figures above |
| `run_tribe.py`, `mac_patches.py`, `analyze.py`, `low_level.py` | the pipeline (rerun: `.venv/bin/python run_tribe.py videos/*.mp4 && .venv/bin/python low_level.py && .venv/bin/python analyze.py`) |
