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
- **Glyph descent sign (fixed Nov 8, the user spotted it):** `layoutHand` placed each glyph's foot at base − descentRatio·u, so
  y/g/p floated UP (the app screen's handwritten "busy" had its y up in the logo) and '=' sank. descentRatio is how far the foot
  sits BELOW the baseline (the Scribe app's render.js: top = heightRatio − descentRatio); canvas y runs down → base + d·u.
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

## 050: Scribe ("I upgraded my backyard shed every day until it became a university"), 51.7 s
- The @officialwriteit "upgrade X every day" format in the toon look: a DAY counter, a new upgrade + gag every ~3 s (desk + whiteboard
  → a 2nd floor whose fire exit is a trampoline into the trash can → a bell tower the neighbor "loves" → the trash-can raccoon on a full
  scholarship → bricks + columns (one flattens the gnome) → students nobody invited, Mom as the dining hall → a stadium on the
  neighbor's pool), the obstacle at 47 % (the accreditation inspector: forty problems, handwritten, by midnight, the dean too — "I'm the
  dean"), the laptop with the Scribe logo on screen at 57 %, "I'm cooked. So I one-shot it with Scribe", day 100 (ivy, a clock tower,
  10,000 students, caps flying), the raccoon graduates top of the class, the neighbor wants his pool back. 29 shots, 1,027 Eleven chars.
- Kit (additive): `engine/build/campus.js` `buildCampus(studio)` (the backyard → university set: shed with a removable front wall,
  `floor2`, roof, cardboard sign; trampoline, trash can, gnome, bell tower; the brick hall (`body` grows, `cols` drop, `top` drops,
  `ivy[]` pops, banner, podium); our house + deck, the neighbor's house with a lean-out window, pool → stadium (`rows` pop,
  `seats` for the crowd), Mom's table, the clock tower, far halls, lamp posts, grad chairs; `setDay(1)` = the day-100 dressing) and
  `engine/build/dayhud.js` `makeDayHud` (DAY box whose number ROLLS, a count line or a clock line, the Scribe end card). synth.py
  gained `boing` (a cartoon trampoline spring). `makeScreen(…, { name })` signs the app's handwriting row with the hero's name.
- **The engine's index.html styles `.sub`, `.num`, `.hud`** (subtitles/HUD of the other tones): a HUD class named `.sub` rendered
  the STUDENTS line at the subtitle spot in italic serif. Prefix every class of a new overlay (dayhud uses `dh-*`).
- **A crowd that "shows up" must start near the door:** walkers starting 8–12 m outside the gate at 3 m/s were still outside when
  the shot ended (and the queue at Mom's table was empty). Start them ~3 m out, stagger 0.03 s, and let the queue walk in first.
- **Lenses inside seated rows:** the day-100 quad has 120 grads on chairs + 640 tiny grads behind — four of the first cameras sat
  inside a row (a cap or a head filling the frame). Put ground cameras in the aisle (x ≈ 0.4) or above the heads (y ≥ 3).
- **A prop held overhead (a protest sign) can't ride a raised hand's frame** — the stick pointed sideways out of shot. Place it in
  world space at the hand every frame, upright.
- **Someone leaning out of a window of a SOLID house box:** the body stays inside the box (hidden), only head + shoulders cross the
  facade (root ~0.4 m behind it, lean 0.5) — at 0.0 m the legs hung below the sill outside the wall.
- **`B.W(beat, 'the', n)` counts every "the" in the beat** ("…top of the class. The neighbor…" = the 3rd): the last shot started
  0.6 s early on the 2nd. Anchor shots on a rarer word when you can.
- Music (user, Nov 8: minimal): a 140 bpm bed at stem −11 dB, drums −7, mallet −6, foley carries the reel; a soft kick + hat build
  and a 1.0-level riser pad under the hook keep the dropout check clean (a quieter pre-roll failed it three times).

## 058: "How to f*cking survive f*cking finals week" (the f-word explainer → Scribe), 47 s
- Format (user's pick): a deadpan how-to narrator who puts "fucking" in front of every other word; six numbered steps, one toon gag
  each, the obstacle (the professor: forty problems, HANDWRITTEN, due at midnight) at ~46–53 %, Scribe on screen at 61 %. No single
  viral original was found to dupe (web search; TikTok search doesn't load logged out in the built-in browser).
- **Uncensored voice, censored text** (script.json, opt-in, additive): `"swap": {"fucking": "F*CKING"}` makes narrate.py show a
  spoken word differently in the one-word captions, `"wordColor": {"F*CKING": "#ff4f6a"}` (copied into story.json) makes
  `engine/build/captions.js` draw that word in its own colour, also inside a joined caption ("Your F*CKING"). The caption.md says f*cking.
- Pace: 39 f-words make the read long in syllables (each is two): Adam v3 at stability 0.5 + tempo 1.4 measured 4.57 syl/s; tempo
  1.6 (free) → 5.2 syl/s, 47 s. 946 chars for 12 beats. large-v3 check_voice only flagged numerals ("600" for "six hundred").
- Every F*CKING gets a tiny camera kick (`kick(t, 0.1, 0.18)` on every "fucking" word time) — the rhythm is felt in the picture.
- Sets: the 049 library (jack-o'-lantern hidden, the calendar swapped to a DECEMBER/FINALS page by finding its PlaneGeometry 0.62 ×
  0.72, the old sleeping bag + pillow hidden by geometry), kitchen.js for the coffee + the study group (day) and the buried group
  (night: sun 0, hemi 0.28, the window view plane tinted dark), the 049 office. `makeScreen(G, icon, sheet, { name })` (058,
  default 'Tyler') puts the student's name on the app's avatar + handwriting row.
- Music (manager relay of a user steer, Nov 8: "most of our background music is bad"): a minimal soft bed — a quiet mallet
  ostinato in C (C–G–Am–F) + soft kick/clap/hats at 120 bpm, a pad under it, music stem −13 dB (049: −8); the foley carries the
  gags. Deliver `out/nomusic.mp4` too (voice + sfx + amb stems, no music) so a trending sound can go under it at upload.
- Lessons: a lying toon (rx −π/2, rotY π/2, head toward −x) reads upright only from the FEET end, high, looking down along the
  body (the body runs up the vertical frame; from the side the face is turned 90°). A chugged carafe tilted toward the lens
  covers the whole face: tilt it sideways (rotation z) with its mouth at the corner of his mouth. A table chair between the lens
  and the counter hid half the coffee shot (hide `KIT.chairs[i]` per shot). A pizza lid opened to vertical hid the faces behind
  it: flip it flat (−3.05 rad).

## 063: "How f*cking penguins f*cking survive f*cking Antarctica" (f-word explainer #3 → Scribe, biology), 46 s
- 058's script.json/voice/bed, new topic: a deadpan nature doc on emperor penguins (snowed in on every F-word → the huddle: frozen on
  the edge, crowd-surfed into the +37 °C middle in shades → the egg: Mom flips it onto Dad's feet and leaves, two months of polar
  night, no food, a fish dream → the belly slide + a strike through ten penguins → the leopard seal: "never go in first. Push Kevin"
  → the one walking the wrong way), the pivot at 57 % (the biology teacher wants the penguin worksheet HANDWRITTEN), Scribe on screen
  at 67 %, the pen DRAWS the food chain on the worksheet (manager steer, Nov 9: show a figure, the screen says Biology), A+, and the
  wrong-way penguin looks back at the lens before the end card. Facts sourced in caption.md (AAD, Gilbert et al. 2006).
- Kit: `engine/build/penguins.js` (CLAUDE.md cheat sheet). Office → biology classroom by swapping the board + diploma textures
  (PlaneGeometry 3.4 × 1.7 and 0.7 × 0.52); the library calendar → a November page. Library at LO = [300, 0, 0], office at
  [360, 0, 0], ice at the origin: 058's code already used `L()`/`O()` for every world position, so parking them was a one-liner.
- Eleven: 951 chars for 12 beats ("You're fucking cooked." reused 058's cached take); tempo 1.6 → 45.9 s.
- Lessons: a cream egg on white snow is invisible — greenish + 25 % bigger + in FRONT of the belly; the leopard seal's first head
  (stacked skull + jaw spheres, teeth inside the skull) read as a burger: one big ellipsoid head, eyes half out of the surface on
  top, fangs on an arc just outside the snout; additive steam/dust puffs near a lens turn a close-up milky (keep `alpha ≤ 0.45`,
  short life, and no stream in a face shot); `B.W(beat, 'fucking', n)` — count the f-words per beat before keying a shot on one
  (the strike was keyed to the 3rd of 4).
