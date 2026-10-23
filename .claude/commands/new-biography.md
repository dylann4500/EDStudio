---
description: Make the next EDStudio biography reel ("The story of [Name]") end to end — research → narration → beat table → sets → stills → audio → render → QC → commit
argument-hint: "[person's name]"
---
Make one complete EDStudio **biography** video for: **$ARGUMENTS**

Biographies are their own category (user, Oct 23 2026). Read **`docs/BIOGRAPHY.md`** first, then `CLAUDE.md` (house rules,
engine cheat sheet, hard-won rules). Reference video: `videos/009-abe-lincoln` (script.json, shots.js, make_cues.py).

1. **Worktree + number** (CLAUDE.md → Parallel sessions): `git fetch`, check `videos/`, `origin/main`, `.claude/worktrees/`,
   take the next free NNN, `git worktree add -b video/NNN-slug .claude/worktrees/NNN-slug main`, symlink node_modules.
   Scaffold `npm run new -- NNN-slug`.
2. **Research** the whole life (web-search, primary/official sources). List 20–30 candidate beats with a specific, visual,
   surprising detail each. Keep the ones that tell the arc: birth/childhood → formative hardship → first break → rise →
   the defining achievement(s) → the turning point → death → legacy. Note sources.
3. **Narration**: write the script as a narrator (docs/BIOGRAPHY.md §2) — full connected present-tense sentences, 1–2 per
   scene, ≤ 95 chars per line. Read it top to bottom out loud: it must flow as one story, never fragments.
4. **Beat table**: write `videos/NNN-slug/script.json` (cam, set, age, date, place, lines, extra) and run
   `python3 -I tools/biography.py NNN-slug`. Fix every warning. Title = `The story of <em>Name</em>`; end card
   "Whose story should we tell <em>next</em>?" / TELL US BELOW.
5. **Sets + cast**: reuse `engine/sets/frontier.js` / `capital.js` where the era fits, otherwise build new set builders
   (each returns its own `root`; park at offsets). Rigs per age; wardrobe per era; a signature feature + prop.
6. **shots.js**: one camera + performance per beat, reading shot times from story.json (or a `src` clock, BIOGRAPHY.md §5).
7. **Stills loop**: `node tools/render.mjs NNN-slug --stills …` (one or two per shot), `node tools/sheet.mjs NNN-slug`, look.
   Check the physical-logic list (BIOGRAPHY.md §4), the HUD never over a face, readable props above the subtitle band,
   and that the death beat reads without the subtitle.
8. **Audio**: `make_cues.py` → `python3 -I audio/synth.py NNN-slug` (≈ −15 LUFS, `music dropouts: none`). A theme that returns.
9. **Render** `node tools/render.mjs NNN-slug`, spot-check frames, run the CLAUDE.md QC checklist (length rule excepted).
10. **caption.md** (BIOGRAPHY.md §8 incl. the payhip.com/b/rim0Q course line, sources in a comment). Commit the video folder (incl. script.json + make_cues.py), merge
    to main, push.
11. **Update the harness**: new lessons → docs/BIOGRAPHY.md (biography-specific) / CLAUDE.md (engine-wide).
12. Report: title, duration, path, **the full caption text pasted in the message (paste-ready — every first cut and every revision,
    user rule)**, anything unfinished.
