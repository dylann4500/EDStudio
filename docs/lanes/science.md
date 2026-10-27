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

## Third video: 029 "What if the Moon were twice as close?"
- **Shape (61.4 s):** a Maine harbor at dusk, faces on the quay → a 9° lens on the full moonrise; SECOND 0 it doubles (HUD 384,400 →
  192,200 km) → one consequence per place, a day-and-night ladder (Day 1 → Day 11): the faces (2× wide), a New York rooftop (4× the
  moonlight: a reader holds up MOON MOVES CLOSER), the harbor at 1 AM (8× the tidal pull floods the street; HUD = sea level rolling
  0 → 6 m), the harbor at dawn (−6 m, boats keeled over, faces peering 8 m down), the Bay of Fundy (a time-lapse tide front, then the
  bay climbs the flowerpot stacks; 16 → ~130 m "rough estimate"), Quito (a half-hour total eclipse; glasses come off at totality,
  crickets start), an Ohio kitchen (10-day months: 37 full moons a year, the kid howls), Earth + Moon to scale, back to the harbor on
  Day 11 (craters by eye) → "Would you want the *bigger* Moon?".
- **Honest size:** the Moon is drawn at its true angular size (engine/moon.js). Twice the Moon is still only ~1° — the "giant moon"
  shots are long lenses (fov 3.5–9°), as in real moonrise photos; the faces get their own shots. Say so in the header.
- **Uncertain numbers say so on screen:** tides scaled ×8 are a rough linear estimate (resonance, friction) → "Roughly 130 meters",
  HUD "×8 · ROUGH ESTIMATE"; the eclipse count isn't printed ("far more often"), only the computed half-hour totality.
- New engine pieces: `engine/moon.js`, `engine/sets/tidetown.js`, `engine/sets/fundy.js` (CLAUDE.md cheat sheet).
- **TRIBE:** cut1 0.0428 / first 60 s 0.0421, dead zone 39–53 s: a static calendar wall (0.007), a near-static Earth + Moon
  two-shot (0.002), a static Dad + kid two-shot on a bench (−0.01) and the faceless crater telephoto (0.007). cut2 = the SAME timeline
  and audio, visual-only fixes: a push-in on a hopping kid, an Earthrise (the camera rises so Earth climbs over the Moon's limb), a
  camera arc + the kid jumping on the bench with a couple behind, a 1.4 s close-up of the kid's awed face after the craters, a 1.1 s
  faces insert before the doubling → 0.0471 / 0.0469, no dead zone, TARGET MET. Peaks: faces in eclipse glasses as the light drains
  (0.145 — the best beat measured so far), the eclipse sky with the crowd silhouetted (0.10), Fundy's tide front chasing tourists
  (0.095). Static two-shots sag even with close faces; give every face beat a camera move AND body motion.
