---
description: Make the next Vex ("goth mommy") Scribe reel end to end — topic → format → script → Fish voice → set + Vex → stills → cute-track audio → render → QC → upload copies → commit
argument-hint: "[topic or angle], e.g. 'why you can't sleep before an exam' (optional: format = explainer | pov | rating | grwm | trend | crossover | sim)"
---
Make one complete **Vex** reel for: **$ARGUMENTS**

Vex is the goth anime tutor (a VRoid model under a pixel-art pass) who headlines Scribe-lane reels and plugs Scribe inside
the video. Everything she needs is in the repo: the model `videos/054-goth-tutor/vex.vrm` + body atlases `vex-body.png` /
`vex-body2.png`, `engine/vroid.js` (posing, faces, lip-sync, `dressGoth`), `engine/pixel.js` + `engine/pixelcaps.js`, the
sets (`engine/sets/*`, `engine/build/dorm.js`, `feast.js`, …), `engine/build/scribe.js` (the app screens + handwriting), the
voice/music presets in `tools/presets.json`, and 17 shipped Vex reels (054, 064–083) to copy from. Rules live in three places — read them first:
- **CLAUDE.md** → "Scribe lane defaults" + every Engine-cheat-sheet paragraph that mentions Vex (054 → 083: the VRoid model,
  064–067 faces/breath, 066 hold kit, 071 lighter persona, 072/076/077 explainers, 078 squats + `frac` face framing, 079–083).
- **docs/lanes/scribe.md** (voices, music, captions, what's off-limits, which Scribe features are already used).
- **tools/presets.json** (`"preset": "vex"` voice, `"cute"` music).

1. **Number + worktree** (CLAUDE.md → Parallel sessions): `git fetch`, check `videos/`, `origin/main`, `.claude/worktrees/`,
   `ops/ledger.csv` + `ops/ideas.md`; take the next free NNN. `git worktree add -b video/NNN-vex-slug
   .claude/worktrees/NNN-vex-slug main`, symlink `node_modules` from the main checkout (never commit it), `npm run doctor`
   (it must show python3 + numpy + scipy and the cute tracks). Renders and git writes need the sandbox disabled.
2. **Topic**: something 18–24-year-olds live or saw THIS week, with real numbers (web-search 2+ dated sources; cite them in the
   shots.js header + a caption.md comment). Off-limits: AI data centers, real brands/logos/OS screens, real people as jokes.
3. **Format — change it every reel** (FORMAT, PLACE and Scribe FEATURE all differ from the last Vex reel): the **explainer**
   is the user's favourite (model `videos/076-vex-energy-drinks`, newest `videos/083-vex-fword-battery`: Vex IN the place,
   sourced numbers on pixel cards, Scribe on screen by ~55 %); others: 3 AM POV (064), rating list (065), GRWM with props (066),
   this week's meme/trend (067), feed vs reality (071), crossover with Derek/other casts (073, 081, 083), what-if sim (074).
   Pick a Scribe feature from docs/lanes/scribe.md's "not shown yet" list; check every claim against the Scribe README.
4. **Persona**: the lighter Vex by default — confident, teasing, deadpan, a "Cute." here and there; no mommy/baby lines, no
   sighs, no sexual lines (swimwear only). Profane only if the reel is an f-word explainer (083: `swap` + `wordColor` so the
   captions read F*CKING in red).
5. **Scaffold**: `npm run new -- NNN-vex-slug --from <closest reel>` (copies story/shots/cues/caption/script.json/make_cues.py,
   never the voice takes or final.mp4). Keep the shared asset paths (`/videos/054-goth-tutor/vex.vrm`, `vex-body2.png` via
   `shadeBody`, `/videos/049-scribe-promo/hand.json` + `scribe-icon.png`) and her current proportions: `makeVroid(url, { textures:
   { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 })` + `dressGoth(V)`; resting face
   `relaxed 0.1, angry 0.12` (never `happy` at rest — it shuts her eyes).
6. **Script → voice**: write script.json with `"preset": "vex"` (Fish Dolly, ~3.3 words/s) or `"vex-sua"`; voice it with
   `python3 -I tools/narrate.py NNN-vex-slug --fish` (needs `FISH_API_KEY` in `~/.config/edstudio/.env`; cached takes in
   `voice/` are reused, so commit them). Check pace in words.json (≈ 3.3–3.6 words/s) and the words with
   `python3 -I tools/check_voice.py NNN-vex-slug`; re-roll a bad take by moving its `voice/fish-<beat>-*` files aside.
7. **Shots + stills loop**: one place per beat, her eyes framed with `frac` (≈ 0.29–0.36; cards sit at 0.44–0.69), pixel pass
   4 px (`pixel.set(1)` on Scribe screen shots so the app reads crisp), `makePixelOverlay(story, { crisp: true, … })`.
   **Props ride hand bones** (`VEX.attach`) with a real grip and never pass through her (CLAUDE.md 066/076/083); check every
   prop beat with stills every 0.25 s plus a side debug view (`DBG = 'side'`, never ship it set). Render
   `node tools/render.mjs NNN-vex-slug --stills …` + `node tools/sheet.mjs`, LOOK at the sheet, fix, repeat; check long pixel
   callouts at `--full`.
8. **Music**: cues.json (make_cues.py) `"music": {"preset": "cute"}` from **frame 1** (`file_in 0`), ~8 dB under the voice
   (measure the stems); never the phonk under Vex. The tracks are the user's ripped MP3s in the main checkout's gitignored
   `exports/music/` (never commit them; on a new machine copy that folder over). `python3 -I audio/synth.py NNN-vex-slug`.
9. **Render + QC**: `node tools/render.mjs NNN-vex-slug`; pull frames from final.mp4 (ffmpeg -ss) and check the CLAUDE.md QC
   list (no black blocks, captions clear of her face, end card ≥ 3.5 s). Then `sh tools/nomusic-copy.sh videos/NNN-vex-slug`,
   `sh tools/upload-copy.sh videos/NNN-vex-slug`, `sh tools/preview-copy.sh videos/NNN-vex-slug`, and copy the upload + caption +
   no-music cut into `exports/TO-UPLOAD/`.
10. **Caption**: hook + one emoji + 5 hashtags, NO link and NO plug (`python3 -I tools/caption.py videos/NNN-vex-slug` must pass).
11. **Deliver**: commit the reel folder (script.json, story.json, shots.js, make_cues.py, cues.json, words.json, voice/,
    caption.md, final.mp4 — never out/, stills/, audio.wav, voice.wav, music). Send the preview to the user with the caption
    pasted in full; the user reviews and posts by hand (no scheduling, no uploads).
12. **Update the harness**: any new Vex lesson goes into CLAUDE.md's Vex paragraphs, docs/lanes/scribe.md (add the Scribe
    feature you showed to its list), and this command.
