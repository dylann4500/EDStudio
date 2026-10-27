# Design: the "build" genre ("How a ___ Becomes a ___")

Date: 2026-10-26 · Status: approved to build (user: "you can do everything other than the voice narration before then")
Reference analysis: `docs/reference/wemakebuild.md`. Working rulebook (after it exists): `docs/BUILD.md`.

## Goal
A new EDStudio genre that reproduces @wemakebuild's high-retention format with our own scripts, mascot and topics:
a humble object upgrades step by step into a giant machine; every step fails in a funny physical way, gets fixed, and the fix
gets its real engineering name. Narrated by an ElevenLabs voice (user's choice; a scratch voice stands in until the key is set).
First video: **024 "How a Hole Becomes a Subway 🤔"**, ~100 s.

## Decisions
| Question | Decision | Why |
|---|---|---|
| Engine | Extend the Three.js engine additively (`engine/build/*`, new tool, new docs) | One pipeline; deterministic; reuses render.mjs, synth.py, sets. Blender = closest look but a huge new dependency + minutes/frame; Remotion would duplicate the engine. |
| Voice | ElevenLabs `with-timestamps` API, key from `ELEVENLABS_API_KEY` (env or git-ignored `.env`) | User choice; word timings come back with the audio, so captions sync exactly. Genre exception to "no paid tools". |
| Before the key exists | Scratch voice = macOS `say`, word times estimated per syllable | Lets timing, captions, audio mix and a full render work end to end now; one command swaps in the real voice. |
| Mascot | **Gary** (our everyman since 002) as a new big-headed toon | Our own recurring victim, not their Kevin. |
| Text | Word-by-word center captions + callouts (term / stamp / money / sfx / label) | That *is* the style. |
| House rules | Genre-specific exemptions (below) | User: "an entirely new harness, entirely new design process". |

## Pipeline / data flow
```
script.json ──tools/narrate.py──► voice/<clip>.mp3|wav (cached by text hash) ─► voice.wav + words.json ─► story.json
                                                                                                            │
shots.js (3D, beat-local time) ◄────────────── story.beats[id] = {t0, t1} ◄─────────────────────────────────┘
cues.json (music bed + SFX, times may reference beats/words) + voice.wav ──audio/synth.py──► audio.wav (−14 LUFS)
render.mjs (unchanged) ──► final.mp4
```
- **script.json** (hand-written): `title`, `voice` {provider settings}, `scratch` {voice, rate}, `lead`, `gap`, `tail`, `look`,
  `beats: [{id, say, gap?, callouts: [{at, text, style, until?, hold?, pos?}]}]`. `at` = a word of `say` (case/punctuation
  insensitive, optional `nth`); a callout runs from that word to `until` (word) / `hold` (s) / the end of the beat.
- **words.json** (generated): `{provider, duration, beats: [{id, t0, t1, clip, words: [{w, t0, t1}]}]}`, absolute seconds.
- **story.json** (generated; never hand-edit): `{tone: "build", mode: "build", duration, fps, look, beats: {id: {t0, t1, i}},
  order: [ids], words: [{w, t0, t1}], callouts: [{text, style, t0, t1, pos?}]}`.
- `python3 -I tools/narrate.py NNN-slug` = voice (cached) + layout. `--scratch` forces the scratch voice; `--layout` re-lays
  out from words.json without voicing (callout edits). With a key and no `--scratch`, ElevenLabs is used.

## Engine kit (`engine/build/`, all new files; existing videos unaffected)
- `captions.js` — build-mode overlay (core.js `createOverlay` delegates when `story.mode === 'build'`). Center word at
  ~52 % height (Fredoka 700, white, dark stroke + shadow, tiny pop on each word), TERM callout at ~31 % (Luckiest Guy, yellow,
  dark stroke), stamp (red, tilted, slam-in), money (green), sfx (small yellow comic word at a screen position), label.
- `toon.js` — big-headed mascot rig: head ≈ 40 % of height, big eyes with pupils/lids (`open|wide|squint|closed|spiral|x`),
  brows, mouths (`smile|grin|o|scream|flat|wavy`), hard hat option, squash/stretch, the same pose idea as rig.js
  (`x,z,y,rotY,armA/armB,legs walk,lean`), `dizzy` stars.
- `diorama.js` — cutaway ground block (soil strata with texture, the cut face toward the camera, water table), striped lawn,
  round trees, houses, road, sky; helpers to cut a shaft/tunnel into the section and to flood a cavity.
- `anim.js` — `popIn`, `dropIn` (fall + bounce), `slideIn`, `collapse` (deterministic tumble), camera `shake`, `punch`,
  per-beat helpers (`beatT(story, id, t)` → local seconds and 0..1).
- `fx.js` — sprite pools: dust, debris, splash, water spray, confetti, sparks, dizzy stars, force arrows (chevrons along a path).

## Genre rules (docs/BUILD.md) — exemptions from the house rules, and what still holds
Exempt: opening question card (the hook is spoken on frame 1), HUD, lower-third subtitles, "no popping text", end card
(end on the punchline + ~1.5 s hold). Still holds: deterministic renders, sourced real numbers, caption.md with the course
link pasted in every delivery, music continuous and never harsh, stills before every full render, no hard cuts to black.
Pace: ~3 words/s narration, ~300 words, 90–110 s, 6–8 fix steps, a gag + SFX on every step, something moving every frame,
a cut or a big camera move every 1–3 s.

## 024 outline (Gary)
Hook: Gary wants to cross town without traffic → digs a hole with a shovel → "Congratulations, you've built a subway…"
1. Walls cave in on Gary → **SHORING**. 2. Deeper: groundwater floods → **PUMPS** + waterproof lining.
3. By hand it would take centuries → **TUNNEL BORING MACHINE**. 4. The bakery above sinks → **SEGMENT RINGS** + grout.
5. Gary passes out underground → **VENTILATION SHAFTS**. 6. Trains need power → **THIRD RAIL** ("don't touch it, Gary").
7. Finishing list: stations, escalators, turnstiles, a map. Callback: the money (green) + the fare + Gary's last indignity.
All numbers web-searched and cited in shots.js + caption.md.

## Verification
- narrate.py validates: every callout anchor found, no word shown < 0.12 s, beats ordered, duration = voice + tail.
- Stills sheet per beat (`--stills` at each beat's middle + gag moments); 1 fps scan of the render for static runs.
- synth self-check: `music dropouts: none`, ≈ −14 LUFS, voice clearly on top (music ≥ 12 dB under the voice).
- Genre QC checklist in docs/BUILD.md; render.mjs skips the end-card warning for `tone: "build"`.
