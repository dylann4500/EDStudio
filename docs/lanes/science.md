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
- **Shape (69.4 s, TRIBE target met on v4):** title over a stadium → the moment it happens (a goal, the crowd mid-jump) → SECOND 0 → a slow-motion ladder
  (HUD = TIME WITHOUT GRAVITY 0.0 → 5.0 s, one new place per 0.5 s: stadium, kitchen, pool, highway, ocean, bungee bridge, the
  equator, the ISS, back to the stadium) → GRAVITY BACK in real time, five landings → a human button (judges: 10 · 10 · 10)
  → debate end card ("Would you survive the *landing*?").
- **Physics:** pick a model, state it in the shots.js header and the caption comment (017: rigid planet). Compute every HUD
  number from the same formulas the animation uses (see `tauAt()` in 017). Prefer mechanisms a viewer can check in one line:
  "moving things keep moving", "squeezed things spring back", "the ground curves away under you", v = √(2gh).
- **Slow motion needs motion:** a 0.5 s slice of physics stretched over 4.8 s barely moves — give every slow-mo beat a camera
  move (dolly/crane/track) and secondary motion (flailing arms, wobbling water blobs, spinning fans, drifting confetti), and keep
  the early slow-mo beats SHORT (3–4 s) with faces close (017 v4: tightening 14.4 s → 10 s took TRIBE from 0.045 to 0.049).
- Keep the cut ≤ 69.5 s: longer reels run TRIBE's audio encoder over the shared memory cap (CLAUDE.md).

## Second video: 027 "What if every electron disappeared?"
- **Shape (65.2 s):** a live Tokyo crossing → SECOND 0 replayed in four places at the same instant (13:00 UTC: Tokyo 10 PM, Rio
  10 AM, Chicago 8 AM, New York 9 AM — check the local times against each other) → ONE log clock (HUD `ease:'log'` + `timefmt`)
  from 10 attoseconds to 8 min 17 s, one new SCALE per step (an atom, a street, Paris, Earth from orbit, Earth + Moon, the Sun)
  → rewind to 9:59 PM for the human button (a hug: "Every hug was electrons pushing back") → "Which would you rather lose:
  gravity or electrons?" (cross-promotes 017 on the same account).
- **When the honest physics is too fast to see, slow the clock, not the physics:** everything electrons do stops at τ = 0, so at
  femtoseconds the world is a paused video (honest AND cheap: frozen poses + bullet-time camera moves). The visible change is
  driven by one rule from the shots.js header (blast front: displacement = max(0, cτ − depth)), so the HUD and the picture agree.
- **Subtractive SECOND 0:** no electrons = no sound (air molecules can't bump), so every bed stops dead and the score enters.
- State the stylization (bare nuclei don't reflect light; we keep drawing things lit) and the honest limit (the energy exceeds
  Earth's mass-energy → general relativity; we show only the light-speed front) in the header + the caption comment.
- **TRIBE (027):** cut1 0.0416 (no dead zone). A fix pass that SHORTENED the weak beats (retimed everything after them) lifted
  those beats but dropped the untouched late beats by half in their new slots (cut2 0.0392). Fix weak beats in place (camera
  moves, faces, brightness) and keep the timeline when the late part already scores well. cut3 did that: 0.0441 / first 60 s
  0.0430 (beats 013), no dead zone, 0.0006 under the whole-brain target — the frozen dark Tokyo beat (0.006) and the pool (0.023)
  stay the weakest: a night street with frozen people sags even with close faces.

## Third video: 028 "What if Earth stopped spinning for one second?"
- **Shape (60.6 s):** Quito's equator plaza (title + a selfie on the line) → SECOND 0 → ONE clock τ = 0 → 1.000 s (HUD 3 decimals,
  linear per segment) with one place per step and the dramatic moment of each place inside its window: Quito 0–0.03 (the plaza
  slides away under the crowd), Rio pool 0.03–0.07 (the water reaches the deep end at 0.058), New York 0.07–0.13, Texas wind
  0.13–0.22, Maine 0.22–0.6 (the sea edge passes the lighthouse at 0.26), South Pole 0.6–1.0 (nothing happens) → EARTH SPINS
  AGAIN → real-time aftermath per place (tumble + sit up, cart tips, the pool water comes back down, dad 402 m east, the Atlantic
  comes back) → Dave at the pole raises his coffee → "Where on Earth would you want to be standing?".
- **Model:** the solid Earth stops for exactly 1 s then spins again; everything free keeps v = 465.1 m/s × cos(lat) east, so for
  that second it slides v metres relative to the ground. Free things at one place keep their places relative to each other —
  only bolted things move (in their frame) — and the air moves with them (no wind felt; the bolted world meets Mach 1).
- **Picture rule that made it read:** a FREE-FRAME camera that rides with the sliding things (faces stay close, the bolted world
  streaks past: monument, storefronts, bent trees). Pick each place's τ window so its event (water hits the wall, edge passes the
  lighthouse) happens on screen; a 25 m pool only has 0.058 s of story, so the swimmers start at the shallow end.
- Kind cartoon of a violent premise: frozen deadpan faces inside the ~0.2 s reaction time, comic tumbles + sitting up dazed in
  the aftermath (a still of people lying flat read as bodies — make the fall 0.3 s and sit them up by ~1 s).
- **TRIBE (028): cut1 met the target first try — wc 0.0667, first 60 s 0.0675, 21.7 % above, no dead zone (017 0.0487, 027 0.0441).**
  Top beats: the Texas wind (dad calm in a cloud of leaves + pickets while bent trees streak past, 0.115), the New York aftermath
  (people knocked down on the sidewalk, 0.111), the pool water coming back down (0.102). Weakest after the title: the Quito
  intro before SECOND 0 (−0.007) and the first slide beat (0.030) — early beats sag in every reel; the bright, busy, face-filled
  middle carried it. A bright DAY ladder with a free-frame camera (faces close, the world streaking past) beat both dark/space reels.

