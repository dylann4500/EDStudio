# PROMO — product ads in the build look (first one: `videos/049-scribe-promo`, Scribe)

A promo reel copies a reference ad's STORY beat for beat (user, Nov 8: "the exact same storyline… but in our animation style",
"get to the end faster": the trope part is cut so the product shows up sooner) and plugs the user's own product at the end.
What it takes from the build genre (manager brief, relayed from the user): **the ElevenLabs narrator, a pace a tiny bit slower
than 039 (≈ the reference's), and the toon look** (toon.js cast, fx, kicks, 60 fps + blur, 039's `look`). What it does NOT take:
the fix → "This is called…" loop, Gary, "Congratulations, you've built…", the one-take rule (hard cuts between places are fine;
one gliding `planRail` per place), the 5-reviewer gate. The product claims must be true (read the product repo/site first).

## 049: Scribe ("No Nut November" battle royale → a Scribe ad), 54 s
- Reference: @officialwriteit's NNN reel (62 s; the product appears at 39 s). Ours: island part 0–23 s, Scribe on screen at 31 s.
- **Studying an age-restricted Instagram reel without downloading it**: open it in Claude in Chrome (the user's logged-in browser),
  then in-page JS: pause the `<video>`, seek it (`await seeked`), `drawImage` each frame into a grid canvas shown as a full-page
  overlay, screenshot. 1 fps full frames for the story + 4 fps crops of the caption band (y 56–83 %) for the narration word by word.
- Pace: the reference measured 4.06 w/s / 5.6 syl/s; Adam v3 at tempo 1.55 + maxPause 0.17 gave 3.85 w/s / 5.45 syl/s (one
  voicing, 1,167 chars; tempo changes are free). Dropping a whole beat later cost nothing (cached clips per beat).
- Product on screen: Scribe's REAL handwriting (`hand.json` from the Scribe repo's demo: 89 glyph masks × 2 variants, 29 px each)
  written glyph by glyph onto a worksheet canvas, a floating pen nib on the tip, the app (logo, Georgia wordmark, #9a1c25 accent,
  cream paper) on a laptop screen canvas. End card = the logo + `tryscribe.ink` + the site's own offer ("10 free assignments").

- **Music (user, Nov 8): upbeat, fast and percussive.** The first cut's 120 bpm pluck groove with a light tom "felt a little bit slow";
  v2 = 140 bpm, four-on-the-floor `kick`, `clap` on 2 + 4, 16th `tick` hats, a `tom` fill every 4 bars, a marimba 8th-note arp, and
  a hat/kick build under the hook that drops into the full groove on the premise line (`drums_db` −4, music ≈ −21 LUFS under a
  −16 voice). A quiet pre-roll trips the dropout check: lay a soft rising pad under it. Audio-only fixes: `node tools/mux.mjs NNN`.

## Kit (all additive, `engine/build/`)
- `island.js` `buildIsland(studio)`: a toy island in lighthouse.js's sea (reuses its sky, ocean, moods, sun, env map; hides the rock
  and tower). `groundY(x, z)`, `SPOT` (orchard, wifi hill, drop meadow, library on its rise, the beach), `shoreR(θ)` (also draws the
  minimap), a peach orchard (`makePeach`), a router + glowing wifi symbol (`makeRouter`), the library exterior (portico, LIBRARY
  frieze, double doors as hinge groups, one lit window with a silhouette, lamp posts), the beach log + gull post, an instanced forest
  with exclusion zones (add a zone for every camera path — the first twist push ran through a pine and a lamp post).
- `brprops.js`: `makeCrowd(parent, n)` = instanced mini toons with toon.js proportions (face, pupils that look, arms, sit, tumble,
  phone, score cards) — 100 people for ~20 draw calls; `makeChutes`, `makeBeams` (elimination light columns), `makePlane` (rear
  ramp), `makeBlimp` (SPECTATORS band that follows the envelope, an open grandstand gondola with `seats`, spotlights), `makeCrate`
  (supply drop that bursts: `burst(k)`, two cantaloupes on velvet), `makeSpecs`.
- `brhud.js` `makeHud({...})`: DOM battle-royale HUD (minimap, ALIVE + DAY/time box, kill feed, the "eliminated himself" banner, the
  product end card). It lives in `#ui`, so it is captured crisp like the captions; everything pops in once, nothing pulses.
- `scribe.js`: `loadHand`, `layoutHand` (`^x` superscript), `makeSheet` (worksheet canvas; `draw(p)` writes p items, glyph by glyph,
  graphs as hand strokes; items carry `pi` = problem index so shots can key "the sevens" / "the graph" to words), `makeScreen`.
- `library.js`: `buildLibraryRoom` (desk, laptop with lid hinge + screen canvas + logo on the back, worksheet, can tower, a rotting
  jack-o'-lantern, wall clock `setClock`, crossed-out November calendar, sleeping bag) and `buildOffice` (chalkboard, diploma).

## Lessons (each cost a stills round)
- **Props parented to a parked set root take LOCAL coordinates** (again): the professor's two sheets were placed with `O(...)`
  world coords inside the office root at x = 3040 → they rendered 3 km away and the gag was invisible.
- **Additive light columns add up**: 20–30 elimination beams at once turned frames milky white. Base intensity 0.2 (outer) / 0.42
  (core), ×0.45 and a thinner radius when a crowd goes at once, and fade each beam out after ~0.8 s.
- **A pull-back must clear every prop parked for that shot**: the "Zero alive" crane flew through the blimp's grandstand (it hangs
  in front of the library for the stare). Check the path against big props, not only the set.
- **A screen insert (laptop POV)**: hide the user and the chair (a film cheat) and back off to ~1.5 m at fov 40 for a 0.58 m screen;
  aim ~0.19 m below the screen centre so the UI sits above the one-word caption.
- **29 px glyph masks read as faint pencil** on a 1024 px page: draw each glyph 4× with sub-pixel offsets (a ballpoint) and darken
  the paper material (0xe4e0d8) — under the desk lamp the page washed out.
- **A toon beard hides the mouth** in a close-up: skip it on the hero whose face carries the gags (Trevor keeps a light one).
- Toon add-ons on the torso: `toon.armL.g.parent` is the torso group (the body's child order is not stable).
- Cuts are cheap in a promo: one framing per beat as its own shot (with a 2-key slow push) beat chaining framings across a room —
  planRail turned far-apart framings into passes and the "HANDWRITTEN" close-up became a pan across the bookshelves.

## 051: "Everyone in my town has a number above their head" (Scribe), 50 s
- The viral number-over-heads trope as a toon town tour, one gag per place, hard cuts (28 shots): street (the hook), a dog at 0
  ("he ate it"), the class president always at 0, a couple whose numbers match to the minute (copying), a 42-year-old dropout on
  the subway at 9,000 and climbing, a party liar at 61, Mr. Dawson's GRADING number → Tyler 312 → finals → 800 → cooked → Scribe
  (on screen at 28.4 s = 57 %) → his number crashes to 0, the library turns around → callback (the president had Scribe all
  along) → the town hits 0 in three waves → except Dawson (400 → 12,000, buried in paper) → end card.
- Kit (additive): `engine/build/numtags.js` `makeNumTags(parent, n, {minPx, maxPx, natH})` = number badges over heads (camera-
  facing sprites, canvas redrawn only when the text changes; `set(i, {pos, value | text, label, tier, pop, maxPx})`, then
  `update(camera)` sizes each one for the lens: its height stays between minPx and maxPx of the 1920 px frame); tiers colour
  themselves (0 green + glow, < 100 yellow, < 500 orange, else red). `engine/build/school.js` `buildHallway(studio, {banner})` =
  a high-school hallway (lockers, classroom doors, trophy case, fountain, VOTE MAYA posters, a FINALS WEEK banner, glass doors
  onto a sunny day at the far end; shoot from z ≈ +2 looking −z). `brhud.js makeHud({ end })` without `alive` = the Scribe end
  card alone. Sets reused at offsets: street.js, restaurant.js (the café), subway.js, livingroom.js `dinner` + party lights,
  049's library + office (a TEACHERS' LOUNGE sign on the board).
- ElevenLabs: 1,014 chars (16 beats, one pass), Adam v3 tempo 1.55 → 45.5 s of speech; large-v3 transcript matched every beat.
- Music per the Nov 8 steer: a minimal bed (C-major pad per chord, quarter-note marimba, soft kick + hats) at ≈ −28 LUFS under a
  −15 voice; the places (street, hallway, café, train, party crowd, cheering town) and the number foley (a tick per increment, a
  falling run of ticks into a bright "zero" chime) carry the reel. One long pad under changing chords tripped the dropout check
  (the voice-keyed duck + staccato bits): one soft pad per chord fixed it.

### Lessons from 051 (each cost a stills round)
- **Put the hero's head at 40 % of the frame by maths, not by eye** (`aimAt(C, H, fov, f)` in 051 shots.js: pitch the look point
  so the head projects at fraction f): four rounds of hand-aimed framings kept landing faces exactly under the one-word caption
  at 52 %. Raising the look point moves the subject DOWN the frame.
- **A big toon head + a number above it needs room:** the head is 0.54 m tall, so at 2 m (fov 44) it fills a third of a vertical
  frame and its tag leaves the top. Keep close-ups ≥ 2.4 m, the head at 0.42–0.44 and tags ≤ 190 px; the QC hook flags hero
  tags under the caption and any tag above 12 % of the frame.
- **Two people side by side at a café table are 1.3 m wide with toon heads:** a 2 m two-shot cut both in half. 2.5 m+ head-on,
  or a high three-quarter angle that stacks them in depth.
- **An extra next to the lens is a giant prop:** a seated subway rider's phone (0.42 m in front of its face) became a black slab
  across Doug's face. Skip every extra within ~1.5 m of the camera (`nearCam`), not only those on the lens line.
- **toon.js `hat: 'cap'` covers the eyes** (the dome's rim sits at eye height): lift it after `set()` (`hat.position.y = 0.1`).
- **Canvas text wider than its canvas is clipped** (the hallway banner read "NALS WEEK · YOU GOT TH"): shrink-to-fit the font.
- **A worksheet insert shows the whole page** (≈ 1 m above it at fov 46) and hides the hero for those frames: 049's 0.66 m framing
  showed only the title and a blurry hand.
