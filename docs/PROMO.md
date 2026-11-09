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

## 056: Scribe dupe of @whatifpov's "What if you didn't shower for 365 days?" (45 s, toon look + the reference's text layer)
- Copy the format, not the skin: cold open on the gross end state (the train car emptied around you, HUD hidden under the title) →
  0.8 s VHS rewind (⏪, Day 183 → 1, near-silence + tape hiss) → "Homework's due at eight. Skip the shower. Just this once." → one
  escalation per shot with the reference's own fact lines (sebum, bacteria make the smell, nose-blind, dermatitis neglecta, body
  lice), seasons as the time cue (street.js `setSeason`), the train car emptying → our plug: the reason is homework; Day 220 the
  professor (clothespin on his nose) hands over 40 handwritten problems on a 10-ft pole → Scribe at 64 % → "Day 221: you finally
  shower. It takes three hours." (the counter rewinds to Day 0) → the end card over the steamy bathroom.
- **Eleven reads slower than the scratch estimate:** Adam v3 at tempo 1.12 put Scribe at 71 %. Tempo 1.3 + gap 0.32 tightened the
  ladder for free (cached takes); a 2 s gap after the shower line + a longer tail moved the plug to 64 % without cutting a beat.
- The centered title hid the crowd packed at the vanishing point of the subway car: title block at 41 % + the camera pitched up
  so the far end sits at ~58 %.
- Steam = fx `smoke` in white, but ≥ 0.5 m puffs (grow 2) whited out a 2.6 m bathroom: 0.22–0.45 m, ~12/s, kept behind the subject.
- Toon "hands behind the head" (049's lean-back arms) reads as hands in front of the chest from the side: arms spread along the
  seat back (`{x: 0.35, z: 1.45, el: 0.25}`) says "the whole car is mine".
- A toon face from 1.2 m fills a vertical frame edge to edge: face close-ups at 1.6–2.2 m, fov 34–40.
- The top-left HUD covers a laptop screen's logo/nav when the screen sits high (049's screenCam): look at the screen centre, d 1.75.
- `finally` is a Python keyword: a word-time dict in make_cues.py can't use it as a kwarg (rename it).
- No music under the cold open: a soft pre-roll pad tripped synth.py's dropout check; letting the bed ENTER on Day 1 passes.
- **The handwriting macro whip-panned into blur at 60 fps + motion blur** when 049's tight pen-tracker chased six problems in
  1.6 s: frame the line being written from ~0.55 m (camera keyed to the tip averaged over 0.4 s, x pinned near the page's
  left half, aimed a little down the page so the line sits above the subtitle) and write only problems 1–4 on camera.
- Deliverable for a trending sound: `out/nomusic.mp4` = `out/silent.mp4` + amix(voice, sfx, amb stems, `normalize=0`), AAC 192k.
