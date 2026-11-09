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
  Nov 9: + `writeHand` (subscripts, pen-drawn symbols), `penKit` (pen figures), `makeSheet({rich: true})`, `makeScreen({subject})`
  and `subjects.js` (ready chemistry / biology / physics / economics pages) → **Subject packs** below.
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

## Subject packs: how to pick and use one (Nov 9, `engine/build/subjects.js`)
The user (Nov 9): "this shit is all math homework still… are we gonna do bio homework, chemistry homework?" Rotate the subject every
reel (docs/lanes/scribe.md) and fit it to the story; each pack is a ready page whose FIGURE the pen draws in order with the rest.
All of them on one frame: `videos/_subjects-demo/packs.jpg` (re-render: `node tools/render.mjs _subjects-demo --stills 200 --full`).

| key | page (problems, `pi` order) | the money shot | fits stories about |
|---|---|---|---|
| `chemistry` | CHEM 1A · PS 4: balance CH₄ + 2O₂ → CO₂ + 2H₂O (boxed) · Lewis H₂O · molar mass CO₂ = 44.01 g/mol · ICE H₂ + I₂ ⇌ 2HI (Kc = 49 → [HI] = 0.78 M) | H–Ö–H with its lone pairs, the ICE grid | labs, fire, cooking, mad science |
| `biology` | BIO 1 · PS 6: Punnett Bb × Bb (1 BB : 2 Bb : 1 bb, 3 black : 1 white) · food chain grass → cricket → frog → hawk · labelled animal cell | the Punnett grid filling in | pets, animals, nature, babies/genes |
| `physics` | PHYS 1 · PS 5: FBD of a 5.0 kg block on a 30° ramp (mg, N, f_k) + ΣF = ma → a = 3.2 m/s² · a plane's FBD (L = W, T = D) · F = ma for a car (3.0 × 10³ N) | the force arrows on the ramp | cars, sports, falling, flying, the gym |
| `economics` | ECON 1 · PS 3: a frost shifts S → S′ (P₁ → P₂ up, Q₁ → Q₂ down, dotted drops) + 4 lines of reasoning · payoff matrix, best responses underlined, Nash (Low, Low) circled | the supply curve jumping left | money, hustles, business, rivalries |
| `math` | 049's calculus page, byte for byte | the parabola | at most one reel in four |

```js
import { subjectSheet, FIG } from '@engine/build/subjects.js';
const sheet = subjectSheet(G, 'chemistry', { name: 'Max' });   // any makeSheet option overrides the pack's: name, seed, title, note, page
const screen = makeScreen(G, icon, sheet);                        // "CHEMISTRY · PROBLEM SET 4" + one tile per problem (Balance, Lewis…)
sheet.draw(p);                                                    // p = 0 → sheet.total, as for 049's sheet
const lewis0 = sheet.items.findIndex((i) => i.pi === 1);          // weight of everything before problem 2 = where to start p for "the Lewis structure"
```
- **Lengths** (glyph = 1 unit, a pen stroke = its length / 55 px): chemistry 286, biology 238, physics 188, economics 243, math 73.
  The demo writes each page in 4.6 s; to show only the figure, sum the weights up to its first item and ramp p from there.
- **The 40-problem drama:** `makeScreen(G, icon, sheet, { n: 40 })` keeps the class line with 049's 40 tiles; `{ subject: false }`
  is 049's screen exactly.
- **A page of your own:** `makeSheet(G, { rich: true, problems: [{ q: '1.  …\n     …', h: 1.4, a: 'answer', fig: ({ k, y }) => [...] }] })`.
  `h` = row height weight, `q` may have `\n`, `a` goes through `writeHand`, `fig(ctx)` returns pen/glyph items in writing order
  (`ctx.k` = a `penKit`, `ctx.y` = the row's top). `FIG.punnett / ice / lewis ('H2O'|'CO2') / fbdRamp / fbdDot / market (4 shifts) /
  payoff / foodChain / animalCell` work their numbers out from the inputs (the cross, m/θ/μ, the curves, the payoffs), so a figure
  can't contradict its own working; `penKit`: `line arrow dashed poly ellipse dot pair text grid ring box under label vecArrow`.
- **Handwriting markup (writeHand):** `_2` / `_{net}` subscript, `^2` / `^{2-}` superscript; hand.json lacks a capital O (H₂0 reads
  as zero), ⇌, °, μ, ×, $, % — the pen draws them where they stand (README §Chemistry), → too (the 29 px glyph is a smudge at reel
  size; `penArrow: false` keeps it). This demo hand's H is two loose strokes that read as "lt" ("Clt₄"), so rich sheets and penKit
  draw H with the pen as well (`penGlyphs: 'H'`).
- **Content stays inside what Scribe does** (its README §Physics / §Chemistry / §Biology / §Economics, cited in subjects.js): FBDs
  for every ΣF, Lewis structures with lone pairs, ICE tables, Punnett squares with the ratios under them, food chains, labelled
  animal cells, market shifts with P₁/P₂ dropped to the axes, payoff matrices with underlined best responses and a circled Nash.
- **Old reels are untouched:** `node tools/scribe-check.mjs` (sandbox off) rebuilds every makeSheet / makeScreen / layoutHand call
  in videos/*/shots.js with the working tree's scribe.js AND main's and compares pixels: 25 cases identical (049–058) on Nov 9;
  050's laptop + sheet frames also rendered byte-identical. Run it after ANY scribe.js change.
- Lessons: an answer ring is a superellipse (a plain ellipse big enough to hold a line of text ran into the line above and struck
  through the next question); centre text in a cell with `k.text(…, { valign: 'middle' })` (this hand's ink sits ~0.9 u above its
  baseline); keep ~35–45 px between a ringed answer and the text before it; this hand's `=` sits at cap mid-height, so lowercase
  after a tall `ΣF =` looks dropped — that is the real glyph metric, leave it.

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
- The posted cut is the no-music one (a trending sound goes under it in the app): `sh tools/nomusic-copy.sh videos/NNN-slug` →
  out/nomusic.mp4 + out/upload-nomusic.mp4. Check it stands on voice + SFX: 056's only quiet stretches without music were the
  intended near-silent VHS rewind and the last fade; ambience beds under every scene kept voice pauses at ~−21 dBFS.

## 055: a hippo's first shift (toy3d dupe of @okwhatifcrazy's 1.1M-view hippo reel), 60 s
- The original has NO narrator (TikTok's `claInfo.noCaptionReason` 3 = no speech; read it from `__UNIVERSAL_DATA_FOR_REHYDRATION__`):
  so no ElevenLabs. Its text layout (kicker + pinned "What if" title, a left HUD per beat with a sub-label, deadpan subtitles) became
  `engine/simhud.js`; the question still opens alone in the middle (CLAUDE.md) and glides up to the header.
- The plug sits where the original turns ("the manager has questions" → "new hire, new rules"): last chance = a HANDWRITTEN worksheet
  → pencils snap in his jaws → one photo (phone viewfinder showing the sheet) → the laptop app (HUD count rolls on the SAME times as
  the screen's solve count: they disagreed in the first stills) → his handwriting stroke by stroke → 20/20, promoted → back to the
  original's ending (the pond drive-thru + the displacement flood). Scribe on screen at 33.8 s (56 %).
- Toy3d staging lessons: a vertical frame can't hold a 12 m pond from a 3/4 crane — go near top-down; a salad bar / door frame / table
  bottles in the lens line were hidden per shot (film cheats); a hippo's dark nostrils read as a second pair of eyes from the front
  (smaller, pinker nostrils + bigger eyes fixed it); POV inserts (sheet, laptop, handwriting) hide the hippo, whose head is where the
  camera sits.
- Music (user steer Nov 8): a minimal soft bed under SFX-led foley; `out/nomusic.mp4` = the picture with sfx + amb only (for a
  trending sound at upload).
- Revision (user, Nov 9: "this shit is all math homework still… bio, chemistry?"): the worksheet became night-class CHEMISTRY —
  the grill burner's combustion balanced in his hand (CH₄ + 2O₂ → CO₂ + 2H₂O), H₂O and CO₂ Lewis structures drawn by the pen, moles,
  kelvin, pH. Only 28.4–44.8 s was re-rendered (`render.mjs --from/--to` writes out/silent.mp4 = the segment: save the full one
  first, splice with ffmpeg `trim=start_frame/end_frame` + concat at shot cuts, then `tools/mux.mjs`).

## 060: "What if Italy rebuilt the Leaning Tower of Pisa with pizza?" (iso diorama dupe of @okwhatifcrazy, 1.4M views), 59.6 s
- Original (tiktok.com/@okwhatifcrazy/video/7694373909105347863, 75 s, studied Nov 9 with in-page frame grids in the built-in
  browser — logged out works; `claInfo.noCaptionReason: 3` = no speech, so no ElevenLabs): beat sheet in docs/reference/okwhatifcrazy.md.
  Ours keeps all 13 beats at ~4 s each (75 → 55 s before the card) and inserts the plug where the rebuild would stall: after the
  foundation lands, "Then the city wants proof it won't lean" (an inspector's STOP · SHOW THE MATH sign, PERMIT BLOCKED) → Luca's night
  room ("40 physics problems. Handwritten. By morning.") → one photo (phone viewfinder) → the laptop app with a PHYSICS chip (SOLVED
  0 → 40) → the page written stroke by stroke: lever arm, a free-body diagram (weight from the centre of mass, the pivot, N, the lever
  arm d, θ), torque → "Permit: approved." → back to the original's beats (stack, finishing touches, straight, the pose, the pigeon).
  Obstacle at 51 %, Scribe on screen at 60 %.
- Manager steer (Nov 9): every reel shows the subject's FIGURE being drawn — the FBD strokes are spliced into makeSheet's writing
  order (`addFBD` in 060 shots.js: push items with `pi` after problem 1's, recompute the total) — no change to scribe.js.
- Physics on the page is real (W ≈ 1.45×10^8 N, centre of mass ≈ 22.6 m up, d = 22.6 sin 3.97° ≈ 1.56 m, torque ≈ 2.3×10^8 N·m,
  d < base radius 7.7 m → stable); sources in caption.md's comment.
- Music: a minimal soft F-major pluck bounce (stem −17 dB under SFX-led foley); `tools/nomusic-copy.sh` makes the posted cut.

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

## 062: "How f*cking airplanes f*cking fly" (f-word explainer #2 → Scribe), 46 s, Fish Audio "Slax"
- Same harness as 058 (script.json swap/wordColor, a kick on every F*CKING, hard cuts, 058's end card), new places: the planespotter
  under a landing jet, the security line (shoes → belt → pants → still beeps), the cutaway engine at the gate (a ramp agent's cap goes
  through it and out of the back on fire), the takeoff roll (blue arrows = the air shoved DOWN, then a giant yellow LIFT arrow), the
  cockpit in the clouds (throttle doubled → 4× lift → the plane rockets up), the cabin (turbulence + coffee splash, one pretzel, the
  landing) → pivot at 55 %: the one guy who claps is your physics teacher (ten lift problems, handwritten) → Scribe at 65 % → the pen
  DRAWS the free-body diagram arrow by arrow on "lift, weight, thrust, drag" (manager steer: that's the money shot) → the homework
  folds into a paper plane that lands on the teacher's head (A+), he claps. 36 shots. Kit: `engine/build/airport.js` (CLAUDE.md).
- **`B.W(beat, word)` takes the FIRST match:** "You fold **it** into a plane. **It** flies" — `W('fold','it')` started the flight
  shot 1.4 s early. Use `W(beat, word, 2)` (and mirror it in make_cues.py) whenever a word repeats in a beat.
- **Toon heads vs a vertical frame:** the frame is only ≈ 0.43 × distance wide at fov 42, so a toon head (0.54 m; 0.6 m ×1.12) fills
  it from 1.2 m. Close-ups need ≥ 1.6–2 m or fov 50+; a two-shot of toons 0.5 m apart needs ~3 m.
- **plane.js's cabin is sized for the wooden rig:** seat backs (1.22 m) hide a seated toon's mouth, the trays sit behind the row in
  front, and toon arms are too short to clap above their own heads. Fixes: toons ×1.12 in the cabin (never two side by side), shoot
  faces from the front aisle (camera ~1.7 m high) or across from the left seats, POV/insert shots for anything on a tray, and put the
  action that must read full-body (the clapper) STANDING IN THE AISLE.
- A coffee splash on a toon: the toon's `mud` shells cover the whole head (it read as leopard spots from behind) — use a partial
  sphere decal on the front of the face only (062 `coffeeMask`: splats + drips, eyes and mouth left clear).
- Flow arrows (makeArrows) streaming past a wingtip read as nothing from 30 m; chunky force arrows (blue = air pushed down under the
  trailing edge, yellow = lift pushing up under the wing) read instantly.
- ElevenLabs (Nov 9, 01:20): the fresh free-tier key returned 401 `detected_unusual_activity` ("Free Tier access has been
  disabled") on the first call, 0 chars spent — an account flag only the user can clear (paid plan / support). Finish on scratch.
- **Voiced with Fish Audio (Nov 9, main a7f2afc):** `--fish --fish-voice c5f56a6cc2ec4fa8920cb4c5889a3fb7` ("Slax", the user's pick).
  At script.json's tempo 1.6 Slax read 4.76 syl/s (058: 5.46); `"fish": {"tempo": 1.84}` (atempo at assembly — not in the clip
  hash, so free) matched it at 5.45 syl/s, 46.1 s. Measure pace as syllables/s over the spoken span (first word → last word): the
  caption-word count in narrate's summary is after `joinLen` merges ("Your F*CKING" = 1), not the spoken word count.
