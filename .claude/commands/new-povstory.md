---
description: Make a POV story reel (first person, many natural voices; day in the life, skill, job, journey, big moment or suspense) end to end — concept → cast + script → multi-voice narration → POV shots → stills → sound → render → QC → commit
argument-hint: "[who you are + what you're doing, e.g. 'a pastry chef racing a wedding-cake deadline' + the product]"
---

Make one POV story reel for: **$ARGUMENTS**

Follow `CLAUDE.md`, then **`docs/POVSTORY.md`** (the recipe) and `docs/genres/pov-story.md` (why it works). The reference
implementation is `videos/086-pov-library-lockin`: copy its script.json, shots.js and make_cues.py.

1. **Concept + mode** (docs/POVSTORY.md → Story modes): a person doing something interesting, seen through their eyes: day in
   the life, skill, job, journey, big moment, or suspense. Brand-safe and professional by default, humour light. Pick: who
   you are, the place + a specific time (the stamp), the goal, 4–6 escalating moments with someone talking to you in each, the
   product as the tool you reach for (shown working 2–4 s), the payoff, and the ending (a question card, the choice card for
   suspense, or the brand's end card). Suspense: safe dread only, never a real-violence premise.
2. **Cast + script** (`script.json`, mode `pov`, fps 30, motionBlur 2): 3–5 speakers (+ the "Narrator" voice if the mode is
   narrated), each a **natural, professional Fish voice** from the table in docs/POVSTORY.md → Voices, with a caption colour and an
   fx (phone / pa / far / room / muffled). **Never the accent presets** (narrator-chinese / -2 / narrator-indian) or clones. 18–24
   lines of 1–10 words, ~120 words, gaps for the silent beats, and a `tail` of 5+ s for the ending. Draft with `--scratch`
   (free), then voice once with Fish (`python3 -I tools/narrate.py NNN-slug`; the user's standing OK covers it, keep it to one
   pass + one fix pass and report the bytes and cost). Check every line with faster-whisper (tools/check_voice.py); for a
   filtered line that blurs, transcribe the raw take before re-voicing.
3. **Set.** Reuse a set (`engine/sets/*`, `engine/build/*`, `engine/povstory/stacks.js`) or build `engine/povstory/<place>.js`:
   one deep sightline for things to happen in, the surface in front of your hands dressed with props, and lights that tell the
   mode (a bright kitchen at dawn, a stadium at night, a dark library for suspense).
4. **shots.js:** the `T` table from story.json, `HEAD` + `PHONE` move lists, the phone screen states (canvas UI + render
   targets for a call or the camera), silhouettes via `makeToon` + `tint`, `addInk` + `addFisheyePass`, and the hud
   (stamp, banners, choice). Frame the end of every whip on something.
5. **Stills loop:** `node tools/render.mjs NNN-slug --stills …` (one per beat + every phone state + every whip end) →
   `node tools/sheet.mjs NNN-slug` → look at it. Check that hands aren't blown out, the phone screen reads, nothing blocks a whip
   target, the beam/light reads, and captions clear the phone text. `--full` for any screen text.
6. **Sound:** `make_cues.py` with the same T formulas and foley for every visible event. The bed fits the mode: a warm moving
   synth bed + the place's ambience for the bright modes; for suspense, a drone that never stops, braams on the reveals and a
   heartbeat while hiding. `python3 -I audio/synth.py NNN-slug` must say `music dropouts: none`. Never
   use the ripped tracks in exports/music for anything that could become an ad.
7. **Render** `node tools/render.mjs NNN-slug`, pull 6 frames from final.mp4, run the QC list (CLAUDE.md, with this genre's
   exemptions in docs/POVSTORY.md), write `caption.md` (no links/plugs; end on the reel's question 👇), commit the folder.
8. Update docs/POVSTORY.md with anything you learned. Report: path, duration, the caption pasted in full, and what's left.
