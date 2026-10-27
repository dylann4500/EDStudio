---
description: Make the next EDStudio build reel ("How a ___ Becomes a ___") end to end — topic → sourced script → narration → cutaway set → shots → stills → audio → render → QC → commit
argument-hint: "[small thing] → [giant thing], e.g. 'bucket → dam'"
---
Make one complete EDStudio **build** video for: **$ARGUMENTS**

The build genre is its own category (user, Oct 26 2026: "an entirely new harness"). Read **`docs/BUILD.md`** first (the
rulebook + kit), then `docs/reference/wemakebuild.md` (what the reference account does and why it retains), then CLAUDE.md
(deterministic renders, worktrees, hard-won rules). Reference video: `videos/024-hole-subway` (script.json, shots.js,
make_cues.py). User steer: "their videos are really dense with lots of good animation, actions, items" — a new action, prop
or effect on almost every phrase.

1. **Worktree + number** (CLAUDE.md → Parallel sessions): `git fetch`, check `videos/`, `origin/main`, `.claude/worktrees/`
   AND `ops/ledger.csv` / `ops/ideas.md` (the operation's manager hands out numbers — ask it, docs/OPERATION.md), take the
   next free NNN and send the manager a one-line claim (SendMessage to the manager session: "claiming NNN for <title>") —
   the first build reel picked 015 while the manager gave 015 to another video, and was renumbered 024 at merge; `git worktree add -b video/NNN-slug .claude/worktrees/NNN-slug main`, then `npm install` in the
   worktree (it needs the @fontsource/fredoka + luckiest-guy fonts).
2. **Topic**: "How a [humble everyday thing] Becomes a [giant machine/structure]". Not a pair the reference already did
   (list in wemakebuild.md). Pick one whose steps are VISIBLE failures with real engineering names (6–8 of them) and
   that suits a cutaway (things in the ground, in water, in the air with a section view).
3. **Research**: web-search every number you will say (current edition, official/primary sources). One real number per
   2–3 steps. Note sources for the shots.js header + caption.md comment.
4. **Script** (docs/BUILD.md → script formula): hook in one line, "Congratulations, you've built a ___" + roast, the
   fail → "So…" → "This is called [TERM]" → plain sentence → joke loop, a finishing list, the callback ending with the
   money. ~300–350 words, second person, Gary is the victim, jokes of our own. Write `videos/NNN-slug/script.json` (beats +
   callouts anchored to words: term / label / money / stamp / sfx).
5. **Narration**: `python3 -I tools/narrate.py NNN-slug` (ElevenLabs if `ELEVENLABS_API_KEY` is set, else the scratch voice).
   Read the printed beat table; fix any "callout anchor not found".
6. **Set**: a cutaway diorama built on `engine/build/cutaway.js` (strata canvas + runtime hole mask) + the props the story
   needs. Reuse `engine/build/*` (toon, fx, anim) and `subway.js` props; new sets go in `engine/build/<name>.js`.
   Test the set alone first with a throwaway video folder and 4–6 camera views (fix seams, voids, blocking props).
7. **shots.js**: every gag keyed to `B.W(beat, word)`; holes as shapes per frame; punch-in cuts + impact kicks on top of the
   master take (`engine/build/cuts.js`, docs/BUILD.md → Cuts: ~25–35 face shots, ~8–12 TERM inserts, a cold-open flash); the master:
   `makeRail(planRail(frames))` with one framing per 2–4 s, each placed on the word it must show (planRail leaves early so
   no move is faster than 0.6 + d/8 s — fix every `[rail]` warning in the render log); a hit list for camera shake; effects
   scheduled at build time from the same word times. Every character/prop enters and leaves ON screen (docs/BUILD.md →
   Continuity).
8. **Stills loop**: `node tools/render.mjs NNN-slug --stills …` at the middle of every shot (they render in ~0.15 s each),
   `node tools/sheet.mjs NNN-slug`, look, fix, repeat. Typical fixes: a tree/lamp/car between camera and subject, sprites
   (dust/stink/drops) spawned right in front of the lens, the hero hidden behind trailing machinery, a ring/donut too
   close to fit the 9:16 frame. Then `--preview` and scan it at 1 fps (`fps=1,scale=150:-1,tile=12x5`).
   After every camera change: `node tools/render.mjs NNN-slug --qc` (copy 024's `window.EDSTUDIO_QC` into build()) — no face
   under the caption/callouts for ≥ 0.5 s — and no `[rail] … m in … s` line in the log.
8b. **Review loop — follow docs/BUILD-REVIEW.md** (it's what made 024 good): render a 30 fps cut (`--fps 30 --blur 1`),
   `python3 -I tools/review_kit.py NNN-slug <scratchpad>/reviewN --video videos/NNN-slug/final.mp4 --ref <reference.mp4>`,
   send 5 read-only reviewer agents in ONE message (logic, look, pacing, camera, comedy — brief templates in that file) scoring
   /10, look at the frames yourself meanwhile, merge their fixes (script → camera → logic → look), verify with stills + `--qc`,
   record the scores in BUILD.md, repeat until all ≥ 8 (fold logic/pacing/comedy into one agent once they plateau).
9. **Audio**: `make_cues.py` computes every cue from story.json (copy 024's) → `python3 -I audio/synth.py NNN-slug`.
   Check: −14 LUFS, `music dropouts: none`, voice on top (measure stems: voice ≈ −15, sfx ≈ −20, music ≈ −24 LUFS).
10. **Render** `node tools/render.mjs NNN-slug` (60 fps + blur, ~25 min), QC (docs/BUILD.md checklist) — scan the ACTUAL
    render (1 fps sheet + the last 8 s at 2.5 fps), not only stills — write caption.md (house format + course line), commit the
    folder incl. script.json, words.json, make_cues.py and only the `voice/eleven-*` takes the current script uses (older
    takes stay local). Merge to main / push only when the user says so (or the manager's brief does).
    Paste the caption in the report. If the narration was the scratch voice, say so and give the one-command upgrade path.
