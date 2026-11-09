# Style library — every animation look EDStudio can make, and how to add one

The Scribe promo operation (docs/lanes/scribe.md) pairs viral concepts with looks; @officialwriteit rotates several looks and the
user wants a bigger library (Nov 8 2026). Each look below is real, merged code with a template or a reference reel. Everything
stays procedural (Three.js → headless Chrome → ffmpeg), deterministic (`rng`, never `Math.random`), no downloads at render time.

| Style | Look | Engine | Start from | Reference reels | Status |
|---|---|---|---|---|---|
| **toy3d** | toy-like rig people, warm sets, many places (the what-if sims) | `engine/rig.js`, `engine/sets/*`, `engine/props.js` | `npm run new -- NNN-slug` (`videos/_template`) or `--from 042-bellybutton-portal` | 002, 020, 035, 042 | merged |
| **toon** (build) | big-headed toon cast, punchy 60 fps camera + kicks, one word at a time, ElevenLabs narrator | `engine/build/*` (toon.js, captions.js, rail.js, fx.js, anim.js) | `/new-build` (docs/BUILD.md); promo story kit: 049 | 039 (build), 049 (promo story) | merged |
| **pixel** | any 3D scene rendered in chunky n×n blocks + mosaic cut transitions | `engine/pixel.js` (`addPixelPass`, `mosaicAt`), `engine/pixeltex.js` | `npm run new -- NNN-slug --from _pixel-template` | — | merged (a post pass, not a world) |
| **anime** (pixel) | cel-shaded goth anime tutor + pixel pass | `engine/goth.js` (branch `feat/goth-tutor`) | — | 054 (in progress) | building |
| **sim** | Sims-like realistic 3D: realistic proportions, cutaway house/ground slab, clean daylight (@officialwriteit's hit look) | `engine/sim/` (to build) | `videos/_sim-template` (to build) | 052 | building |
| **flat2d** | flat 2D cartoon (Canvas 2D, no WebGL): boiling ink outlines, flat fills + one cel step, big-headed puppets, bold in-world labels | `engine/flat2d/` (stage, ink, puppet, sets, fx, critters, endcard) | `npm run new -- NNN-slug --from _flat2d-template` | 053 | ready (branch `claude/053-flat2d-style-inventions-021e30`) |

Ideas for later builders: voxel/blocky (their counter-over-heads town), claymation (soft subsurface + thumbprint noise + 12 fps
stepped motion), paper cut-out (layered card planes, drop shadows), whiteboard doodle (line-draw reveal), low-poly flat-shaded,
retro VHS/90s cartoon, 2.5D diorama/tilt-shift.

## How to add a style (the contract a style-builder session delivers)
1. **Engine, additive:** a new module or folder (`engine/<style>.js` or `engine/<style>/`). New options only; never change the
   defaults of shared code (other reels must render byte-for-byte the same).
2. **A 10 s template:** `videos/_<style>-template/` (story.json, shots.js, cues.json) that renders with
   `npm run new -- NNN-slug --from _<style>-template` + `node tools/render.mjs NNN-slug` — the starting point for the next producer.
3. **A proof reel:** one finished Scribe promo in the style (docs/lanes/scribe.md) — a style isn't done until a real reel ships.
4. **Docs:** a row in the table above + a section below (look in one sentence, API cheat sheet, the gotchas that cost a stills
   round, render time per second of video); add the API lines to CLAUDE.md's engine cheat sheet too.
5. **Captions + end card:** reuse `engine/build/captions.js` (one word at a time) and the Scribe end card unless the look needs its
   own; text stays crisp (DOM overlay in `#ui`, never in the pixelated/stylised render).

## Per-style notes
(Builders: add your section here when your style merges — what it looks like, how to call it, what went wrong.)

### flat2d — the flat 2D cartoon (053 "Day N of inventing my way out of homework")
**Look:** a real 2D cartoon drawn with Canvas 2D in the page: every outline is a hand-drawn ink line whose points are re-jittered 8×
a second (line boil), fills are flat with ONE cel-shade crescent (lower right), big-headed puppets are drawn front-on and turn their
faces for 3/4, labels are bold Luckiest Guy words in the world, and nothing is post-processed (no bloom, grain or blur). Studied
against @officialwriteit's 2D "Chens / inventions" reel (a toon-shaded 3D render with heavy outlines + an `INVENTIONS: 41 ·
WORKING: 0` board); ours is truly flat, which is cheaper and more distinct from the toon/build look.
**How it renders:** `createStage(studio)` lays a 1080×1920 2D canvas over the idle WebGL canvas (studio.render becomes a no-op) and
under `#ui`, so the build one-word captions (`story.mode: 'build'`, narrate.py) stay DOM-crisp on top. World units = pixels at zoom 1;
a 2D camera `{x, y, z, r}` looks at world (x, y); shots are hard cuts on narration words (`beatClock`). Characters animate on twos
(`S.twos(t)`, 15 drawings/s) while the camera moves on ones. **Render cost: ≈0.08 s per frame at 30 fps (2.4 s per second of video:
the 50 s reel = 2–3 min, no motion blur)** — the cheapest look in the library.
**Start:** `npm run new -- NNN-slug --from _flat2d-template` (copies script.json + make_cues.py too) → edit script.json →
`python3 -I tools/narrate.py NNN-slug --scratch` → stills (`--stills …`, `tools/sheet.mjs`) + `node tools/render.mjs NNN-slug --qc` →
voice once with Eleven → `make_cues.py` → `audio/synth.py` → render → `sh tools/nomusic-copy.sh`. Copy 053's shots.js for a full reel
(26 shots, 6 places, inventions as plain functions, the Scribe product sequence).

API (all in `engine/flat2d/`):
- `stage.js` — `createStage(studio, {bg, boil, wob})` → `S.begin(t, cam, hits)` (clear + camera + `shake2d` hits `[t, px, s]`),
  draw the world with `S.I`, `S.screen()` for frame-px overlays, `S.end()`; `S.twos(t)`, `S.flash(k)`, `S.toScreen(x, y)`,
  `S.face(puppet.headAt(pose), name)` + `S.qcCaptions(update, story)` → `window.EDSTUDIO_QC` (render.mjs `--qc` lists faces under the
  caption band); `shotAt(t, shots, K)` = the shot + keyframed camera.
- `ink.js` — `makeInk(ctx)`: `I.shape(pts, {fill, shade, line, lw, wob, sharp})`, `I.rect/ellipse/circle/poly`, `I.limb(pts, w, color)`
  (outlined round-capped strokes: arms, legs, cables), `I.line/arc`, `I.text(str, x, y, {size, fill, line, font, rot, maxW})`,
  `I.group(seed, fn)` (stable wobble ids), `tone(hex, k)` (darken/lighten).
- `puppet.js` — `makePuppet({kind: 'kid'|'teen'|'adult', skin, hair, hairStyle: 'spiky'|'ponytail'|'short'|'bob'|'buzz'|'bun'|'curly'|
  'big80s'|'bald'|'long', shirt, top: 'tee'|'hoodie'|'sweater'|'cardigan'|'blazer'|'apron', logo: 'bolt'|'star'|'stripe', bottom:
  'pants'|'shorts'|'skirt'|'dress', shoes, mustache, nose: 'button'|'big'|'line', extras: {goggles, glasses, freckles, pencil, bow},
  body: {…overrides}, seed})` → `draw(I, pose)` with pose `{x, y (feet), s, flip, turn, lean, bob, sq, rot, arms: {L, R: {a, e, f, hand:
  'mitt'|'open'|'fist'|'point'|'thumb', behind}}, legs: {L, R: {a, lift, k}}, walk, sit, head: {tilt, dx, dy}, eyes: 'open'|'happy'|
  'closed'|'wide'|'half'|'angry'|'sad'|'sleepy'|'x'|'spiral', look, brows: 'neutral'|'up'|'angry'|'sad'|'skeptic', mouth: 'smile'|'grin'|
  'open'|'o'|'flat'|'frown'|'shout'|'smirk'|'wavy'|'teeth', open, blush, soot, puff, sweat, under/over/face callbacks}`; `ARM.*` tested
  presets (down, relax, hips, up, cheer, wave, out, shrug, point, hold, cross, chin, face, phone, thumb, back); `hand(pose, 'L'|'R')`,
  `foot(pose, side)`, `headAt(pose)`, `seatY(seatTopY, s)`; `talkAt(t, story.words)` = mouth flaps for an on-screen narrator.
- `sets.js` — `room({wall, pattern: 'stripes'|'dots'|'panel'|'brick'|'cinder', floor, kind: 'boards'|'tile'|'concrete'|'carpet', base,
  wainscot})` + window2d, door2d, frame2d, poster, clock2d, plant, lamp, couch, tv, coffeeTable, rug, bed, desk, chair, chalkboard,
  schoolDesk, teacherDesk, pegboard, tool, workbench, garageDoor, box, bulb, bunting, shelf, fridge2d, counter2d, kettle, mug,
  printer2d, laptop2d / phone2d / tablet2d (a `screen(ctx, x, y, w, h)` callback paints the display), paper2d (draws a page canvas),
  sign, nameTag ("LEO, 9" + a sub line), board (the `INVENTIONS: n | WORKING: n` counter in frame px).
- `fx.js` — burst (impact star), puffs (cloud puffs), explosion (+ a BOOM word), speedLines, radial (focus lines), sweat, vein, mark
  ('!'/'?'), sparkle, hearts, dizzy, confetti, zzz, motionArc. `critters.js` — makeDog2d (side-on, run/wag/bark/sit), makeRobotDog
  (`chomp` jaw). `endcard.js` — `drawEndCard(S, icon, age, {tag, url, offer, extra})`: the Scribe card drawn on the canvas.
- Scribe in 2D: `engine/build/scribe.js` `makeSheet(...).canvas` on `paper2d` (the real glyphs) and `makeScreen(G, icon, sheet,
  {n, name})` (new options, defaults = 049) on `laptop2d`.

Gotchas (each cost a stills round on 053):
- **Faces vs the one-word caption (y 950–1050):** frame each shot with `cam.y = headY − (targetY − 960) / z` (heads at 30–45 % or below
  58 %); the first sheet had half the faces on the caption line. Run `--qc` after every framing change.
- **Front-view props hide faces:** a laptop held at chest height, a tablet propped on a desk and a paper stack on a school desk all
  covered the face behind them. Hold props out to the side, or cheat them in front of the desk edge below the face.
- **Standing IN something:** a puppet inside a box needs its feet at the box bottom, or the head hides behind the front panel.
- **Draw order is depth:** draw a seated foreground audience AFTER the standing hero (Leo stood on a kid's head), and a person
  behind a board BEFORE it only if they are behind it (Max vanished behind the science-fair board).
- **The top band is busy:** the counter board sits at y ≈ 236 and DAY labels at 360. In-world tags must land below ~420 or pop after
  the DAY label is gone; chalkboards that fall in the top band carry doodles, not words.
- **Cartoon arms are short next to big heads:** hand-to-face needs a stretched forearm (`ARM.face` f 1.45); a raised trophy goes out
  to the side, not up (it covered the face).
- **Screen inserts:** let the camera ride the pen tip (053 `paper`) so the line being written stays at ~37 % of the frame, big.
- Music: soft bed only (manager relay, Nov 8) + `tools/nomusic-copy.sh` for the posted cut; 053's make_cues.py is the template.
