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

## Fourth video: 029 "What if the Moon were twice as close?"
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

## Fifth video: 037 "What if the oxygen in the air doubled?"
- **Shape (62.0 s):** mile 26 of a marathon (title over the pack) → SECOND 0 (HUD OXYGEN IN THE AIR 20.95 → 41.90 %) → a
  time-stamped ladder, one place + one physical line per beat: the runners surge and the leader snaps the tape · +1 MIN a grandpa
  on a park bench takes a huge breath and stands (pigeons explode up) · +10 MIN birthday candles flare, the kid blows, WHOOMP ·
  +30 MIN a grill becomes a 4 m column (fire code 23.5 %) · +2 H a campfire leaps, marshmallows become torches · +1 DAY the forest
  ("How much more? Scientists still argue.") · +1 DAY a hot-dog cart fire hosed out by a pumper crew · +10 YEARS rust time-lapse
  (dad grays, the bumper falls) · + MILLIONS OF YEARS crow-sized dragonflies (70 cm) over a playground, one beside a crow →
  the birthday wish: the candle roars, dad's extinguisher, laughs → "Would you breathe *double* the oxygen?".
- **Model:** the extra O₂ replaces nitrogen at 1 atm, so the O₂ partial pressure doubles (0.21 → 0.42 atm). Adding it on top gives
  1.21 atm and 34.6 % at the SAME 0.42 atm, so the effects are identical — say so in the header; partial pressure is what lungs
  and flames respond to. Say what the evidence says, not more: 0.42 atm is *under* the ~0.5 atm pulmonary-toxicity line for long
  exposure ("still under the level that hurts lungs"), wildfire escalation is DEBATED (25–35 % fire-window estimates), rust is
  "faster" (no factor), giant insects take millions of years (one lab generation at 31 % = up to ~15 % bigger).
- **Picture rule that made it read:** human-scale, bright DAY places with faces close, a physical gag per beat (flames are the
  impact). Daylight fire = `engine/oxygen.js` `makeFlames` (layered unlit teardrops, width capped with `maxW`); additive glow
  sprites wash out on a bright sky.
- **TRIBE cut1 = 0.0595 / first 60 s 0.0599, no dead zone → TARGET MET first try.** Fire beats with faces close topped it
  (bbq 0.117, campfire 0.113, truck 0.075); the marathon open was the low (race 0.001, title −0.042): small side-on runners.
  Next science reel: open on one close face reacting, not a pack.

## Sixth video: 036 "What if the Sun disappeared?"
- **Shape (65.0 s):** title over a busy Phoenix pool → the Sun pops out of existence over a sunlit Earth (SECOND 0, 2.9 s, faceless)
  → **8 min 19 s of borrowed daylight**: HUD `fmt: 'clock'` countdown LAST SUNLIGHT ARRIVES IN 8:19 → 0:00 across four bright places
  (the pool: a dad tossing his kid; London: a goal + the home end erupting; Tuscany: a golden-hour wedding photo; the pool again: a kid
  jumps off the diving board and it goes dark in mid-air) → LIGHTS OUT, everywhere at once: the wedding under a black sky full of
  stars at 4 PM, lit by the photographer's flash → Bangkok (night side): a phone photo of the half Moon goes black at +1.3 s, Jupiter
  at +70 min (HUD `fmt: 'dur'`) → dark Earth (city lights) leaves on a straight line (3 s, faceless) → the cold ladder (HUD
  `fmt: 'temp'`): +1 DAY the same pool, frost + towels round a fire drum; +1 WEEK −18 °C Chicago fire barrels; +1 MONTH a frozen
  Maine harbor, an ice fisherman pulls a fish out of the liquid water below; +1 YEAR −73 °C faces in Iceland's steaming geothermal
  lagoon → a kid points up, the camera tilts to the Milky Way → "What would you do in the last 8 minutes?".
- **Honest physics on screen:** the day side goes dark AT ONCE (sunlight stops arriving everywhere within ~0.02 s), not place by
  place; the night side only notices through the Moon (a QUARTER Moon = +1.28 s; a full Moon would be ~2.6 s) and the planets.
  Gravity's speed = c is the second half of the hook ("Earth keeps circling a Sun that isn't there", GW170817). Cooling numbers are
  "scientists estimate"; the day-1 and month-1 HUD values are interpolations (said in the shots.js header + caption comment).
- **Same place, before and after:** the pool appears bright (title, toss, dive) and again at +1 DAY with the same swimmers in towels
  — the callback sells the change better than a new set would.
- New engine pieces: `engine/sets/lagoon.js` (+ `nightSkyTexture()` for any day set), core.js HUD formats (CLAUDE.md cheat sheet).
- **TRIBE: target NOT met after 3 cuts; shipped cut2 (wc 0.0321 / first 60 s 0.0345, dead zone 37–45 s).** The bright first
  half carried it (goal + home end 0.069, dive 0.062–0.066, wedding 0.057–0.059); everything after LIGHTS OUT sat at 0.01–0.04.
  cut2 (same timeline + audio: rooftop party lights + extras, phone flashlights at the dark wedding, a frost orbit, kids running,
  diamond dust) lifted wedDark/moonA/moonB/orbit/frost 30–110 % but the ripple dropped the ice beat 0.054 → 0.038: net +3 %.
  cut3 re-framed frost + fires so the faces sat mid-frame and the fire drum dropped to the bottom (narrower lens, level gaze) —
  both went NEGATIVE (−0.009) and the whole cut fell to 0.029. **Lesson: in a dark scene the fire IS the subject — a big,
  bright, moving flame in the middle of the frame scored better than centered faces lit by it.** A premise whose second half
  is night everywhere is a structural handicap: next time give the dark half ≤ 1/3 of the runtime, or keep the payoff places
  bright (fires, lit interiors, a lit stadium crowd) instead of starlit.
- **cut4 + cut5 (Oct 28, manager-approved retime):** cut4 0.0394 (bright 37 s at 0.06–0.11, tail dead zone); cut5 **0.0581, target
  met** — same first 37 s, epilogue cut to ~2 s per rung with crowd voices under it, end card over the lagoon faces. Shipped cut5
  (51.8 s). See CLAUDE.md → TRIBE notes for the lessons (crowd-voice beds, short epilogues, end card over a live scene).

## Seventh video: 043 "What if Earth had rings like Saturn?"
- **Shape (65.4 s):** a Quito tourist's face looking up (title) → ringed Earth from space + skimming the ice (HUD RING WIDTH 6,560
  km) → a sky ladder by LATITUDE (HUD number = latitude, line 2 = what the arch does): Quito 0° (edge-on hairline through the
  zenith, the painted equator line meets the line in the sky), New York 40.7° (an arch over the avenue), Tokyo 35.7° at sunset
  (Earth's shadow slides across the arch), Ohio 39.9° at night (ringshine + shooting stars, a kid drawing it) → the ground:
  Miami's pool July → December (NOON SUNLIGHT 100 → 0.1 %, the sun slides behind the B ring), the shadow swaps hemispheres
  (space, Dec → Jun), a launch under the arch + a satellite sandblasted crossing the ring plane → a classroom: "Scientists
  propose Earth once had a ring" (Tomkins et al. 2024, 466 Ma) → a Tuscany wedding under the arch ("Two rings for them. One for
  the planet.") → "Would you want Earth to have rings?" over the live wedding (finalFade depth 0.35).
- **Model:** Saturn's main rings scaled by planet radius (1.239–2.269 R = 1,520–8,085 km up), inside Earth's Roche limit; every
  sky is ray-cast (engine/rings.js), so the HUD numbers (arch heights, 0.1 % sunlight) come from the same code as the picture.
- **Honesty traps found while building:** the summer hemisphere sees the LIT face (northern skies set in July, Miami's shadow
  in December); near the horizon you mostly see the faint C ring (τ ≈ 0.1) — aim at the bright B ring; a ring 10 m thick
  exactly edge-on vanishes, so the Quito lens sits 0.1° off the plane (still "0.0°").
