---
description: Make the next EDStudio video end to end (concept → story → 3D → stills review → audio → render → QC → commit)
argument-hint: "[day number from schedule, or a concept in your own words (+ tone: funny | emotional)]"
---

Make one complete EDStudio video for: **$ARGUMENTS**

Follow `CLAUDE.md` exactly. Steps:

1. Read `CLAUDE.md`, `docs/FORMAT.md`, `docs/TONES.md`, and the reference video for the tone:
   `videos/001-bedroom-door/` (emotional) or `videos/002-everyone-pregnant/` (funny) — story.json + shots.js + cues.json.
2. Pick the concept + tone: if $ARGUMENTS is a day number, take that day from `schedule/30-day-plan.md` (emotional);
   otherwise develop $ARGUMENTS into a concept that follows the format bible (opening question alone + centered with one gold
   keyword, NO 'told by' tag/subtext, a HUD number that changes across a time skip, 2–4 eras, a strong ending, hyper-specific
   details). Funny → the TONES.md rules (named everyman, crowd in sync, deadpan lines, silence before punch lines, warm last beat).
   Respect the originality rule. Emotional what-ifs (003, 004): keep ONE human thread through the consequence ladder
   (a ritual the hero repeats) and end on a reunion beat that flips the HUD counter (004: PEOPLE ON EARTH 8.2 B → 1 → 2). If a reference video link is given, sample frames every ~5 s in the browser
   (TikTok: dismiss the login modal, seek `video.currentTime`) and save the takeaways to `docs/reference/<account>.md`.
3. Work in your own worktree/branch if other sessions may be active (CLAUDE.md → Parallel sessions). Pick the next free number
   (`git fetch`, check `videos/`, `origin/main` and `.claude/worktrees/`) and scaffold: `npm run new -- NNN-slug` (use `--from 001-bedroom-door` / `--from 002-everyone-pregnant` to fork a reference).
   If the story needs a new location, build `engine/sets/<name>.js` modeled on `bedroom.js` (indoor) or `street.js` (outdoor).
4. Write story.json (all text + HUD + timing, `"tone"`; end card fully visible ≥ 3.5 s), then shots.js (shots, cameras, poses, props).
5. Stills loop until every shot looks right: render 10–18 stills covering every shot, every gag beat and every prop handoff,
   build the sheet, **view the sheet image**, fix, repeat. Use `--cam top` for blocking/light problems and a t ≥ 200 pose lineup
   for arm poses. Check that no text sits over a face or a sign. Do not full-render before the sheet looks good;
   a `--preview` render is a cheap motion check.
6. Write cues.json and run `python3 -I audio/synth.py NNN-slug`.
7. Full render: `node tools/render.mjs NNN-slug`. Spot-check 6 frames of `final.mp4` (ffmpeg -ss) for black blocks/flicker.
8. Run the QC checklist in CLAUDE.md; fix anything failing.
9. Write `caption.md`. Commit the video folder (not out/ or stills/) with a message like `video NNN: <title>` and push.
10. **Update the harness:** anything you learned, any new engine feature, any user steering → CLAUDE.md / docs / this command.
11. Report: title, duration, file path, caption, and anything you couldn't finish.
