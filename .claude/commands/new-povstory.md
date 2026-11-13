---
description: Make a POV story reel (multi-voice first-person thriller with a cliffhanger choice card) end to end — concept → cast + script → multi-voice narration → POV shots → stills → SFX bed → render → QC → commit
argument-hint: "[a situation in your own words, e.g. 'locked in the gym after a game' + the product, e.g. Scribe]"
---

Make one POV story reel for: **$ARGUMENTS**

Follow `CLAUDE.md`, then **`docs/POVSTORY.md`** (the recipe) and `docs/genres/pov-story.md` (why it works). The reference
implementation is `videos/086-pov-library-lockin`: copy its script.json, shots.js and make_cues.py.

1. **Concept.** A safe situation with dread (locked in, a power cut, a stranger who knows your name, a swapped phone). No
   real-violence premise, ever. Pick: the place + a specific time (the stamp), the named person at risk, the second channel
   (a phone: call, texts, camera), the **contradiction** (two sources of truth), the binary **choice** (two options people will
   argue about) and the 3 **plug slots** (a character's advice in character, the product's action as a plot device, its
   notification as a beat).
2. **Cast + script** (`script.json`, mode `pov`, fps 30, motionBlur 2): 4–5 speakers with distinct accents + a caption colour
   each + an fx (phone / pa / far / room / muffled), 18–24 lines of 1–10 words, ~120 words, gaps for the silent beats, and a
   `tail` of 5+ s for the choice card. Run `python3 -I tools/narrate.py NNN-slug --scratch` (free macOS voices) and check every
   filtered line with faster-whisper (tools/check_voice.py); reword lines that blur. Paid voices (Fish/ElevenLabs) only with
   the user's OK: show the character count and the estimate (docs/POVSTORY.md → Voices).
3. **Set.** Reuse `engine/povstory/stacks.js` or build a new `engine/povstory/<place>.js` for a seated/standing POV: one deep
   sightline (an aisle, a hallway, a dark yard) for things to appear in, a door or opening for the twist, practical lights
   you can kill one by one, and props on the surface in front of you.
4. **shots.js:** the `T` table from story.json, `HEAD` + `PHONE` move lists, the phone screen states (canvas UI + render
   targets for a call or the camera), silhouettes via `makeToon` + `tint`, `addInk` + `addFisheyePass`, and the hud
   (stamp, banners, choice). Frame the end of every whip on something.
5. **Stills loop:** `node tools/render.mjs NNN-slug --stills …` (one per beat + every phone state + every whip end) →
   `node tools/sheet.mjs NNN-slug` → look at it. Check that hands aren't blown out, the phone screen reads, nothing blocks a whip
   target, the beam/light reads, and captions clear the phone text. `--full` for any screen text.
6. **Sound:** `make_cues.py` with the same T formulas: a drone that never stops, braams on the reveals, a heartbeat while
   hiding, and foley for every visible event. `python3 -I audio/synth.py NNN-slug` must say `music dropouts: none`. Never
   use the ripped tracks in exports/music for anything that could become an ad.
7. **Render** `node tools/render.mjs NNN-slug`, pull 6 frames from final.mp4, run the QC list (CLAUDE.md, with this genre's
   exemptions in docs/POVSTORY.md), write `caption.md` (no links/plugs; end on the choice question 👇), commit the folder.
8. Update docs/POVSTORY.md with anything you learned. Report: path, duration, the caption pasted in full, and what's left.
