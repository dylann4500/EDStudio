# Lane: science what-ifs — @ed_.studios

**User steer (Oct 26):** "sciency stuff (what if gravity disappeared, what if electrons disappeared, etc) — there's a lot
of stuff on this in the current science what-if sims".

## What a video is
- One physics / space / body premise, followed second by second: "What if gravity turned off for 5 seconds?", "What if every
  electron disappeared?", "What if the Moon were twice as close?". **The science is real**: every number comes from a source
  (NASA, USGS, NOAA, peer-reviewed papers, textbooks) cited in the `shots.js` header and as a comment in `caption.md`.
  When physics is uncertain, the text says so ("scientists estimate…"). Never invent a mechanism.
- Escalates from human scale to planet scale: one street → a city → the oceans → Earth from orbit.
- 60–80 s · question title alone 3 s · countdown or "SECOND 0" · **time-stamped ladder** (+0.5 s, +2 s, +5 s… or +1 DAY…)
  with **two HUD lines** max: time + one physical number (ALTITUDE 14 m · SPEED 78 km/h · TEMPERATURE −40 °C) ·
  deadpan one-line subtitles · end card = a debate question ("Would you survive the first 5 seconds?").
- Every beat shows the line: things float, the atmosphere peels off, the ocean bulges. Big visible effects with impacts.

## Reference accounts + videos
`docs/reference/whatiflab.md` ("gravity switched off for 10 s", 441K likes — copy the text kit, not the glitches),
`docs/reference/realityrendered.md` (science sims at 2–3 a day; rogue wave 15.6K, hole through Earth 15.2K),
`videos/005-no-nukes` (world tone, hologram globe), `videos/007-twice-as-smart` (montage, Mars colony),
`videos/011-elon-musk` (`engine/sets/tech.js`: Earth from space, launch pads). Do our own premise or our own twist on a
proven one, never a scene-by-scene copy.

## Sound
Curious → cinematic: synth pluck/mallet ostinato, sub drones, soft taiko on the big beats, plus immersive scene sound
(wind, sirens, rumble). Low-passed and soft, like every EDStudio mix. Quiet open; music enters on SECOND 0.

## Caption
Hook + emoji · 2–3 sentences with one real fact · question CTA 👇 · "Send this to your ___" · blank · the course line ·
blank · 5 hashtags incl. #animation (e.g. #whatif #science #physics #space #animation). Sources as an HTML comment.

## First video: 017 "What if gravity turned off for 5 seconds?" (reference build)
- **Shape:** title over a stadium → the moment it happens (a goal, the crowd mid-jump) → SECOND 0 → a slow-motion ladder
  (HUD = TIME WITHOUT GRAVITY 0.0 → 5.0 s, one new place per 0.5 s: stadium, kitchen, pool, highway, ocean, bungee bridge, the
  equator, the ISS, back to the stadium) → GRAVITY BACK in real time, five landings → a human button (judges: 10 · 10 · 10)
  → debate end card ("Would you survive the *landing*?").
- **Physics:** pick a model, state it in the shots.js header and the caption comment (017: rigid planet). Compute every HUD
  number from the same formulas the animation uses (see `tauAt()` in 017). Prefer mechanisms a viewer can check in one line:
  "moving things keep moving", "squeezed things spring back", "the ground curves away under you", v = √(2gh).
- **Slow motion needs motion:** a 0.5 s slice of physics stretched over 4.8 s barely moves — give every slow-mo beat a camera
  move (dolly/crane/track) and secondary motion (flailing arms, wobbling water blobs, spinning fans, drifting confetti).
