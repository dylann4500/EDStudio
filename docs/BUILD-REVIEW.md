# BUILD-REVIEW — the subagent review loop that took 024 from ~4/10 to "really good"

The loop that turned 024's first cut (logic 4 · look 4 · pacing 6 · camera 3 · comedy 5) into the version the user called
"really good… way better than before" (v5: 8 · 6.5 · 8.5 · 7 · 8.5, then one fix pass). User steer: "spawn sub agents to review
different parts of the video, critique / score, then iteratively improve until the video is best / great… have the claudes
rank and stuff". Use it for every build reel (docs/BUILD.md, `/new-build` step 8b); it works for any EDStudio tone.

## One round (≈ 45–75 min; 024 needed 5 rounds)
1. **Review cut** (~8 min for 100 s): `node tools/render.mjs NNN-slug --fps 30 --blur 1` (writes final.mp4; no motion blur —
   reviewers judge path/framing/speed; the real final is 60 fps + blur). Run `--qc` and check the log has no `[rail] … m in`.
2. **Kit** (~1 min): `python3 -I tools/review_kit.py NNN-slug <scratchpad>/reviewN --video videos/NNN-slug/final.mp4
   --ref <ref1.mp4> --ref <ref2.mp4>` → 2 fps contact sheets per 10 s, a frame every 0.5 s, `timeline.txt` (every word with
   its second + the callouts), the reference sheets + 6 fps camera strips. Then copy `videos/NNN-slug/script.json` and
   `docs/reference/<account>.md` (as `reference_analysis.md`) into the kit folder.
   Reference reels: 1–3 of the account's top posts (links in `docs/reference/*.md`), downloaded into the SCRATCHPAD only —
   never commit someone else's video. 024 used the bridge (98 s, 1.85M likes), coaster and skyscraper reels.
3. **Dispatch 5 reviewers in ONE message** (they run in parallel, ~8–10 min, ~150–200k tokens each): `general-purpose`
   agents, read-only, one dimension each, briefs from the templates below. Each brief carries: the round + version, the
   dimension's score history, **the list of claims** ("v3's issue → what v4 changed") for the reviewer to VERIFY, the kit
   paths, the output format. Never hand them your diagnosis as fact — an agent handed a hypothesis tends to confirm it; give
   claims to check and frames to look at.
4. **Look yourself while they run** (you are the one fixing it): read every sheet, scan for runs of 2+ s with nothing new,
   faces under text, props popping. Their claims need checking too — reviewers misread small frames (one swore the train
   pull-out "barely reads" while another missed the snorkel); confirm each finding on a frame before acting on it.
5. **Merge** into one ranked list, in this order — each layer shifts the next:
   1. **Script / voice** (re-voicing moves every word time; `narrate.py` only re-bills changed beats),
   2. **camera framings** (planRail; the camera reviewer returns framings `{t (word), pos, look, fov}` in set coordinates),
   3. **logic / continuity** (entrances, exits, causes, order of events at their words),
   4. **look** (materials, lighting, sprites, text placement).
   Skip fixes that fight a user steer (no cuts, quiet open, music never stops) and anything that costs a day for a 0.5 point.
6. **Verify the fix pass**: stills at every changed beat (`--stills a,b,c` → `tools/sheet.mjs` → LOOK at `_sheet.jpg`),
   `--qc` clean (no face under text ≥ 0.5 s), no `[rail]` speed warnings, `node --check` on edited JS, then audio
   (`make_cues.py` mirrors any timing you changed → `synth.py`: −14 LUFS, `music dropouts: none`).
7. **Write down** the round's scores + biggest wins in docs/BUILD.md → "The review loop" and any reusable rule where the next
   video will hit it (BUILD.md rules, CLAUDE.md cheat sheet). That's how this file and BUILD.md were written.

**When to stop:** every dimension ≥ 8, or a round moves nothing by ≥ 0.5. Once logic, pacing and comedy plateau, fold them
into ONE reviewer (024's round 5: camera · look · logic+pacing+comedy = 3 agents) and finish with a fix pass instead of a 6th
round. The look score plateaus at ~6.5 (Three.js vs the reference's Blender renders) — don't chase it with heavy passes
(AO was tried and left off, docs/BUILD.md).

**Then the final:** `node tools/render.mjs NNN-slug` (60 fps + blur, ~25 min) and **check the actual render**, not just stills:
`ffmpeg -ss <t> -t 8 -i final.mp4 -vf "fps=2.5,scale=180:-1,tile=10x2" -frames:v 1 end.jpg` on the last 8 s and a 1 fps sheet of
the whole thing. 024's first final hid Gary behind the departing train in the last second — invisible in every still.

## 024's arc (what each round fixed)
| Round | logic · look · pacing · camera · comedy | biggest wins |
|---|---|---|
| v1 → v2 | 4·4·6·3·5 → 6·5·7.5·6·6.5 | ONE continuous camera (no cuts), ElevenLabs voice, continuity (one hole that only deepens, visible exits) |
| v2 → v3 | → 7·6·8·6.5·7.5 | `planRail` (no whip moves), re-voiced punch-ups, mid-grey tunnel with cables + lamps |
| v3 → v4 | → 8·6.5·8.5·6.5·8 | callbacks (the stuck driver with a 100-year beard), croissants first, explainer props living in the world |
| v4 → v5 | → 8·6.5·8.5·7·8.5 | soft holds (no stop-and-go), `--qc` face-under-text check, the hose whips into the car ON "drain" |
| v5 → v6 | fix pass only | carry gag held in frame (`until`), 3 spaced swipes, callback driver looks like the hook's, Gary ends wedged |

## Reviewer brief templates
Fill the `{…}`. Keep every brief self-contained (the agent has no context but the brief). Shared header for all five:

> You are reviewing version {N} of a 3D animated reel for {DIMENSION}. Do NOT modify any files — read and report only.
>
> Context: EDStudio (procedural Three.js reels) copies Instagram {@account} ("{format one-liner}": {what the format is}). Video
> {NNN "Title"}, v{N} ({duration} s, ElevenLabs narrator, ONE continuous camera, no cuts). This review cut is 30 fps without
> motion blur (final: 60 fps + blur).
>
> {Dimension} scores: v1 {a}, v2 {b}, … v{N−1}'s top issues and the v{N} claims: {bullet list "issue → what changed"}
>
> Materials (Read tool), under {kit dir}: ours/sheet_000-010s.jpg … (10 s at 2 fps, 10 per row), ours/frames/tSSS.S.jpg
> (every 0.5 s, 360 px), timeline.txt (word times + callouts), script.json, reference_analysis.md, ref/*.jpg. The full cut is
> {path to final.mp4} (you may extract extra frames with ffmpeg into {kit dir}).

Then one of these dimension blocks:

**1 · Logic & continuity** — "Your dimension: physical and narrative LOGIC — appearing/disappearing without cause,
floating/clipping, state jumps, scale, impossible actions, picture vs narration at its word. Materials behave physically:
every fluid fills its container to a flat level (touching every wall and slope — no air triangles or gaps at corners, never
through solid), things fall and land, sand/dirt piles slope. Inspect FULL-SIZE frames at the times listed for each fluid
(360 px sheets hide these — the user caught water gaps on 025 that three rounds missed). Verify each claim rather than
trusting it. Timestamps. Output (under ~600 words): SCORE: x/10. VERIFIED / NOT FIXED. TOP ISSUES (ranked, max 10):
timestamp — problem — concrete fix."

**2 · Rendering & look** — "Your dimension: how it LOOKS — artifacts, readability of captions/callouts (and whether they cover
faces), composition (subject size, clutter, empty frames), overall look vs the reference. Verify the claims. Prioritize cheap,
high-impact fixes (Three.js). Output (under ~600 words): SCORE: x/10. VERIFIED / NOT FIXED. TOP ISSUES (ranked, max 10):
timestamp — problem — concrete fix."

**3 · Pacing & density** (add the reference sheets: ref/{name}_sheet_*.jpg, ref/{name}_6fps_*.jpg) — "Your dimension: PACE
and DENSITY — events per 10 s vs the reference, static stretches (2+ s with nothing new), drag, momentum. Where to add/cut.
Output (under ~600 words): SCORE: x/10. EVENT COUNTS per 10 s (short table). TOP ISSUES (ranked, max 8) with timestamps +
fixes."

**4 · Camera & transitions** ("You are a cinematographer reviewing…") — add **the set's coordinates** (cut face z = 0, camera
z > 0, where each location sits in x/y — 024's brief listed the hole, shafts, tunnel band, bakery, vents, station, street) and
point it at the camera code (`shots.js`, search "the camera: ONE continuous take", and `engine/build/rail.js`; it may evaluate
the path numerically from story.json). "Output (under ~700 words): SCORE: x/10. WHAT WORKS. TOP ISSUES (ranked, max 8) with
timestamps. SPECIFIC FIXES as framings {t (word), pos, look, fov} in our coordinates." (Its framings drop straight into
planRail; round 5's reviewer also simulated planner changes — near-still time 36 → 14 s.)

**5 · Comedy & show-what's-said** ("You are a comedy writer + animation director reviewing…") — "Your dimension: is it FUNNY
and is every line SHOWN at its word? Which gags still don't read? Cheap punch-ups (line edits only if strongly better).
Output (under ~600 words): SCORE: x/10. BEST GAGS. TOP ISSUES (ranked, max 8) with timestamps + fixes."

Round 1 (no history yet) adds to each brief: the user's steer for the video, the reference analysis, and "rank fixes by
impact/effort". The full original briefs are in 024's session transcript; the templates above are them, generalized.
