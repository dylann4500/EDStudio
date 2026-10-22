---
description: Make the next EDStudio video end to end (concept → story → 3D → stills review → audio → render → QC → commit)
argument-hint: "[day number from schedule, or a concept in your own words]"
---

Make one complete EDStudio video for: **$ARGUMENTS**

Follow `CLAUDE.md` exactly. Steps:

1. Read `CLAUDE.md`, `docs/FORMAT.md`, and `videos/001-bedroom-door/` (story.json + shots.js) as the reference implementation.
2. Pick the concept: if $ARGUMENTS is a day number, take that day from `schedule/30-day-plan.md`; otherwise develop $ARGUMENTS
   into a concept that follows the format bible (title with one gold keyword, TOLD BY object, a HUD number that changes across a
   time skip, 2–4 eras, reversal/reunion ending, hyper-specific details). Respect the originality rule.
3. Pick the next free number and scaffold: `npm run new -- NNN-slug` (use `--from 001-bedroom-door` if it's a bedroom story).
   If the story needs a new location, build `engine/sets/<name>.js` modeled on `engine/sets/bedroom.js`.
4. Write story.json (all text + HUD + timing), then shots.js (shots, cameras, poses, props).
5. Stills loop until every shot looks right: render 10–14 stills covering every shot and every prop handoff, build the sheet,
   **view the sheet image**, fix, repeat. Use `--cam top` for blocking/light problems. Do not full-render before the sheet looks good.
6. Write cues.json and run `python3 -I audio/synth.py NNN-slug`.
7. Full render: `node tools/render.mjs NNN-slug`. Spot-check 6 frames of `final.mp4` (ffmpeg -ss) for black blocks/flicker.
8. Run the QC checklist in CLAUDE.md; fix anything failing.
9. Write `caption.md`. Commit the video folder (not out/ or stills/) with a message like `video NNN: <title>` and push.
10. Report: title, duration, file path, caption, and anything you couldn't finish.
