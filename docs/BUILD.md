# BUILD — "How a ___ Becomes a ___" (EDStudio's build genre)

A fast, narrated, joke-dense explainer: a humble object upgrades step by step into a giant machine. Every step **fails in a
funny physical way**, gets **fixed**, and the fix gets its **real engineering name**. Its own category (user, Oct 26 2026:
"an entirely new harness, entirely new design process"). Reference account + full analysis: `docs/reference/wemakebuild.md`.
Design spec: `docs/superpowers/specs/2026-10-26-build-genre-design.md`. First video: `videos/015-hole-subway`.
User steer: "their videos are really dense with lots of good animation, actions, items… make the best video and highest
matching video possible." Density is the point: something new pops, breaks, floods or flies on almost every phrase.

## How it differs from the other EDStudio tones
| | other tones | build |
|---|---|---|
| Voice | none (subtitles are the narrator) | **ElevenLabs narrator** (funny male, fast), scratch `say` voice until the key is set |
| Text | title card, HUD, lower-third serif subtitles | **one spoken word at a time, dead center** + yellow TERM callouts, red stamps, green money, comic SFX words |
| Opening | the question alone on screen | **no title card** — the hook is spoken on frame 1 over action (the title lives in the IG caption) |
| Timing | fixed shot clock | **the voice sets the clock**: `tools/narrate.py` lays out story.json from per-word times |
| Ending | end card ≥ 3.5 s | the callback punchline + ~1.5 s hold, no end card |
| Length | 45–80 s | 95–120 s (theirs: 98–118 s), ~3.1 words/s, ~300–350 words |
| Camera | composed holds | always moving; a cut or a big move every 1–3 s; shake on every impact |
| World | many sets | **one cutaway diorama** (the ground sliced open) + close-ups/angles on it, plus a few street-level shots |

House rules that still hold: deterministic renders (no Math.random/Date), real numbers web-searched and cited, caption.md
with the course link pasted in every delivery, music continuous and never harsh, stills before every full render.
Exempt: opening question card, HUD, lower-third subtitles, "no popping text" (pops ONCE on entry are this genre's look;
still nothing pulses or flickers after), end card.

## The script formula (write this first — it IS the video)
1. **Hook (1 line):** the dumbest possible version, second person. "You're tired of traffic, so you grab a shovel and dig a hole."
2. **"Congratulations, you've built a [thing]."** + a roast ("It goes nowhere, and a raccoon already lives in it.").
3. **The loop, 6–8×:** failure gag that hurts **Gary** (our recurring victim; their Kevin) → **"So…"** + the fix → **"This is
   called [TERM]"** (yellow callout) → one plain sentence on what it does → a simile/joke. Escalate stakes each loop.
4. **One real, sourced number per 2–3 loops** as a label callout ("13,000,000 GALLONS", "60 TONS EACH", "625 VOLTS").
5. **Finishing list** in one breath ("Add stations, escalators, turnstiles, a map nobody understands…").
6. **Callback ending:** "Congratulations, you've built a [thing]. You started with [step 1] because [petty reason]. Now
   [the money, green callout], [absurd consequence], and Gary is [final indignity]." + one last tiny gag (the raccoon rides free).
Write jokes of our own — never reuse theirs (wet biscuit, depressed banana, emotional damage…).

## Pipeline
```
videos/NNN-slug/script.json   beats: [{id, say, callouts:[{at, text, style, until?|hold?, pos?}]}], voice + scratch settings, look
python3 -I tools/narrate.py NNN-slug        → voice/ clips (cached by text hash) + voice.wav + words.json + story.json
python3 -I tools/narrate.py NNN-slug --layout   re-layout only (callout edits, no voicing / no API cost)
shots.js                      3D: author every gag against B.W(beat, word) (when that word is spoken) — survives re-voicing
cues.json → python3 -I audio/synth.py NNN-slug    music bed + SFX + the voice → audio.wav (−14 LUFS, voice on top)
node tools/render.mjs NNN-slug [--stills …]       same renderer as every video
```
- **ElevenLabs:** put `ELEVENLABS_API_KEY=…` in a git-ignored `.env` at the repo root (or the env). `python3 -I tools/narrate.py
  --voices` lists voices; set `voice.voice_id` in script.json; re-run narrate (only beats whose text changed are re-billed).
  The `with-timestamps` endpoint returns per-character times → exact word timing. Commit `voice/eleven-*.mp3|json`.
- **Scratch voice** (no key): macOS `say` (`scratch.voice`, `scratch.rate` ≈ 205 → ~3 w/s). Word times are estimated
  (phrases snap to the pauses found in the audio, words split by syllables) — good enough to time animation and captions.
  Scratch clips are git-ignored. Re-voicing changes beat lengths: that's why shots.js must use `B.W()` / beat-local time.

## Engine kit (`engine/build/`)
- `captions.js` — the build overlay (main.js picks it when `story.mode === 'build'`). Fonts: Fredoka 700 (words),
  Luckiest Guy (callouts), from `@fontsource/*` in node_modules (run `npm install` after pulling). Styles: `term` (yellow,
  y≈600), `label` (orange, y≈470, stacks above a term), `money` (green), `stamp` (red, tilted, slams in), `sfx` (small yellow
  comic word at `pos` [x, y] frame fractions). Long callouts auto-shrink to 960 px.
- `toon.js` — `makeToon({skin, shirt, pants, hair, hairStyle 'tuft'|'messy'|'side'|'none', hat 'hardhat'|'chef'|'cap', mustache})`
  → `set({x,y,z,rotY, rx,rz (tilt about the belly), walk (phase), armL/armR {x,z,el}, legL/legR {x,kn}, head {x,y,z},
  eyes 'open'|'wide'|'half'|'closed'|'spiral'|'x', look [dx,dy], brows -1..1, mouth 'smile'|'grin'|'o'|'scream'|'flat'|'frown'|
  'wavy'|'teeth', beard 0..1, gray, hairUp, xray, char, tint [color, k], squash [sx, sy], t})`. Also `makeRaccoon()`, `makePigeon()`.
  ~1.42 m tall, head ≈ 40 % of height. Faces carry the comedy: wide eyes + scream on every failure, spiral/X when hurt.
- `cutaway.js` — `makeCutFace({x0,x1,y0,y1, paint})` = the ground sliced at z = 0 with a canvas strata texture and a runtime
  **alpha mask for holes** (`setHoles([{rect}, {poly}, {circle}], rough)`), a darker back wall `depth` m behind, `makeRim()`
  side walls, `maskedPlane()` (any plane with holes — the lawn on top), `lawnTexture()` (mown stripes), `makeSky()`.
- `anim.js` — `pop/unpop/drop/squash/wobble/shake`, `beatClock(story)` (`B.T(id)`, `B.lt`, `B.u`, `B.W(id, word)`), `camAt()`.
- `fx.js` — analytic particles (pure functions of age → any frame renders alone): `fx.burst(kind, t0, {pos, n, dir, spread,
  speed, box, floor})`, `fx.stream(kind, t0, t1, {rate,…})`; kinds dirt, rock, crumb, drops, confetti, dust, smoke, stink,
  mist, spark, glow. `makeArrows(path)` (flow chevrons), `makeDizzy()` (stars around a head).
- `subway.js` — the 015 set (see its header): strata, street + traffic jam, bakery block that settles, TBM, lining rings,
  track + third rail, vent fans + grates, station, escalator, train, pumps + hose, shoring, water. Reusable props:
  `makeTBM`, `makeTrain`, `makeShovel`, `makeCroissant`, `makeTree`, `makeBuilding`, `makeHalfRing`, `makeFan`.

## Audio (make_cues.py → audio/synth.py)
- **The narrator sits on top.** cues.json `"voice": {file, duck_db ≈ −9, amb_duck_db ≈ −5, presence_db 2, hp 75}` loads
  voice.wav as its own stem; music + ambience duck under every phrase. Measured on 015: voice ≈ −15.4, sfx ≈ −19.9,
  music ≈ −23.8, amb ≈ −23.9 LUFS; master −14.0 LUFS, LRA 2.0 (the reference: −14.1 / 1.6). Measure stems with
  `ffmpeg -i out/stems/<k>.wav -af ebur128 -f null -`.
- **make_cues.py computes every cue from story.json** (same word anchors as shots.js), so re-voicing never desyncs sound.
- **Music identity "WORKSHOP"** (015): marimba `ostinato` 8ths in F major, 118 bpm, I–V–vi–IV, piano bass every 4 steps,
  a soft F pad under everything, a very light taiko pulse (vel 0.12), booms on the big impacts. **The genre's audio
  signature: a rising marimba "ta-da" (F5–A5–C6) on every TERM callout**, a two-note lift on money/labels, a falling pair on
  stamps. The hook is foley only (traffic, horns, shovel); the music drops in on "Congratulations". Never stops after.
- **Construction foley** (synth.py §6b, all soft + low-passed): `dig`, `crumble`, `splash`, `clunk` (size, metal), `knock`
  (plank pops, track "zips"), `pop` (things popping into existence, party popper), `zap` (soft buzz, never a crack), `plip`
  (drips), `grate`; beds `water_rush`, `drill` (TBM / pump motor), `fan`, `train`. Plus the house SFX (car_horn, giant_step,
  bonk, metal_groan, slurp, plush_squeak, blanket_rustle, low_swell) and beds (traffic_flow, city_day, wind, lamp_hum,
  crowd_cheer). The onset checker reports many "--" in this genre — expected, it was built for foley over music.

## Upgrading the scratch voice to ElevenLabs (one pass)
1. Put `ELEVENLABS_API_KEY=…` in `.env` at the repo root (git-ignored). `python3 -I tools/narrate.py --voices` → pick a
   funny, energetic male narrator; optionally A/B with `--sample "Congratulations, you've built a subway." <id1> <id2>`.
2. Set `voice.voice_id` in script.json (`speed` ≈ 1.05–1.1 for ~3.1 words/s), run `python3 -I tools/narrate.py NNN-slug`.
3. `python3 -I videos/NNN-slug/make_cues.py && python3 -I audio/synth.py NNN-slug`, re-render stills at a few word-synced gags
   (shots are keyed to words, so they follow), then the full render. Commit `voice/eleven-*` + words.json + story.json.

## QC checklist (build)
- [ ] The hook is spoken on frame 1 over action; no title card, no HUD, no end card; the last line is the punchline.
- [ ] One word on screen at a time, center, never under a callout; every TERM callout appears on its word and is shown on screen.
- [ ] Every line is SHOWN (a prop, a failure, an effect) — scan the preview at 1 fps: no run of 2+ s without something new.
- [ ] Gary's face is readable in every close-up (wide eyes / spiral / X / scream); no shot where machinery hides him.
- [ ] No sprite (dust, stink, drops, glow) fills the lens; no void under the ground block; no prop between camera and subject.
- [ ] Numbers are sourced (shots.js header + caption.md comment) and match the narration.
- [ ] Audio: −14 LUFS, voice clearly on top, `music dropouts: none`, nothing harsh (zap/crack soft, all foley low-passed).
- [ ] 1080×1920, 30 fps, H.264 + AAC, < 100 MB; caption.md in house format with the course line, pasted in the report.

## Lessons from 015 (each cost a stills round)
- A cutaway needs the cut **off-center** through round things so the visible part is big enough (tunnel axis at z = −0.6:
  the train fits). Rings/bore use the matching arc (`ARC = acos(T.z / R)`).
- Anything that replaces a region of the face (the bakery block that sinks) must be **masked out of the face always**, or
  it z-fights / shows seams. The set's `setHoles()` adds that region itself.
- Keep the face deep (y −24) so wide shots never see under the block; check every wide for a white void at the bottom.
- Canvas text on props (BAKERY, GARY ST, SUBWAY, the G bullet) needs `await document.fonts.load(...)` in the builder —
  build() runs before main.js waits for fonts.
- **Sprites near the lens are the #1 still-killer**: a dust puff spawned 1 m from a close-up camera became a giant blur that
  hid the raccoon; stink haze turned whole frames green; the sponge's water burst filled the frame. Spawn sprites behind the
  subject (z < subject), small (0.25–0.6 m), and recheck every close-up that follows an effect.
- **Vertical frames are narrow**: at fov 40 the frame is ±12° wide. A 3.4 m ring 4 m away doesn't fit (the donut gag needed
  ~8 m); the TBM shield fills the frame at 8 m — frame the rider (seat x), not the machine.
- **Trailing machinery hides people.** Keep the TBM's trailing gear short (one gantry) and schedule big moving things
  (the train) so they're never between the camera and the gag (the train now leaves before the turnstile shots and returns
  for the raccoon, who rides on the roof — visible above the train instead of hidden inside it).
- Something "behind" the character (the third rail on the far side) makes them turn their back to the camera; put the gag
  object between the character and the camera (rail moved to the front edge) so the face reads.
- Reuse beats: Gary's fossil next to the dinosaur in the strata, the shovel stuck in the lawn until the ending callback, the
  raccoon from the first gag riding free at the end — callbacks make the ending land.
- Camera keyframes `[0, …]` inside a shot mean "the shot's start" (shots.js rewrites them) — otherwise a later shot eases from
  t = 0 and arrives nearly finished.
- Stills render in ~0.15 s and a 15 fps preview in ~100 s: iterate on whole-video still sheets (one still per shot), not
  single frames.
