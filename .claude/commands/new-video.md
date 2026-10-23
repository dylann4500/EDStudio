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
   details). Montage (the premise in many places, 007) or Funny → the TONES.md rules (named everyman, crowd in sync, deadpan lines, picture delivers the punch, music never cuts out, warm last beat).
   Respect the originality rule. Choose the harness per concept (user steer): **global what-ifs ("what if everyone…") → a
   many-places ladder — tone `montage` (007) or `whatif` (006: consequence per place, HUD crashes + recovers, sound-design-led)**.
   **Biographies ("The story of [Name]") are their own category → use `/new-biography` and `docs/BIOGRAPHY.md` instead.**
   Personal what-ifs ("…except you") can keep ONE human thread and a reunion that flips the HUD counter (004: 8.2 B → 1 → 2). If a reference video link is given, sample frames every ~5 s in the browser
   (TikTok: dismiss the login modal, seek `video.currentTime`) and save the takeaways to `docs/reference/<account>.md`.
   World-scale what-ifs (the whole planet, geopolitics, science — 005): follow `docs/WORLD-WHATIF.md` (war room + hologram
   globe, `engine/globe.js`) and web-search every real number for the latest sourced figure.
   Every tone: plan a shot list where **each subtitle's claim is shown in its own scene** (4+ locations; reuse `engine/sets/*`),
   and score it to fit the reel's vibe (tender / funny / curious / ominous — audio/README.md); never reuse 001's sad piano for a non-emotional video.
3. Work in your own worktree/branch if other sessions may be active (CLAUDE.md → Parallel sessions). Pick the next free number
   (`git fetch`, check `videos/`, `origin/main` and `.claude/worktrees/`) and scaffold: `npm run new -- NNN-slug` (use `--from 001-bedroom-door` / `--from 002-everyone-pregnant` to fork a reference).
   If the story needs a new location, build `engine/sets/<name>.js` modeled on `bedroom.js` (indoor) or `street.js` (outdoor).
4. Write story.json (all text + HUD + timing, `"tone"`; end card fully visible ≥ 3.5 s), then shots.js (shots, cameras, poses, props).
   **Lean on drama:** every beat should end in something big and physical (collapse, crush, snap, time-lapse) — CLAUDE.md.
   **New places:** if the story goes somewhere the existing sets don't cover (or a set was used in the last videos), build a new
   `engine/sets/<name>.js` and new props. **Dress every scene** — never ship a bare still (CLAUDE.md → No bare scenes).
5. Stills loop until every shot looks right: render 10–18 stills covering every shot, every gag beat and every prop handoff,
   build the sheet, **view the sheet image**, fix, repeat. Use `--cam top` for blocking/light problems and a t ≥ 200 pose lineup
   for arm poses. Check that no text sits over a face or a sign. If the premise is a readable prop (cards, signs, screens), check that
   every one you mean to be read is actually legible in the still at half size — compute frame width from distance + fov (CLAUDE.md). Do not full-render before the sheet looks good;
   a `--preview` render is a cheap motion check.
6. Pick this video's **sound identity** (audio/README.md → Sound identity: piano / bouncy piano / synth pluck / SFX-led — not a copy of
   the last video), write cues.json (a `make_cues.py` generator for long sheets) and run `python3 -I audio/synth.py NNN-slug`;
   it must report `music dropouts: none`.
7. Full render: `node tools/render.mjs NNN-slug`. Spot-check 6 frames of `final.mp4` (ffmpeg -ss) for black blocks/flicker.
8. Run the QC checklist in CLAUDE.md; fix anything failing.
9. Write `caption.md`. Commit the video folder (not out/ or stills/) with a message like `video NNN: <title>` and push.
10. **Update the harness:** anything you learned, any new engine feature, any user steering → CLAUDE.md / docs / this command.
11. Report: title, duration, file path, caption, and anything you couldn't finish.
