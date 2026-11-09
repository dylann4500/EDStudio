# Style library — every animation look EDStudio can make, and how to add one

The Scribe promo operation (docs/lanes/scribe.md) pairs viral concepts with looks; @officialwriteit rotates several looks and the
user wants a bigger library (Nov 8 2026). Each look below is real, merged code with a template or a reference reel. Everything
stays procedural (Three.js → headless Chrome → ffmpeg), deterministic (`rng`, never `Math.random`), no downloads at render time.

| Style | Look | Engine | Start from | Reference reels | Status |
|---|---|---|---|---|---|
| **toy3d** | toy-like rig people, warm sets, many places (the what-if sims) | `engine/rig.js`, `engine/sets/*`, `engine/props.js` | `npm run new -- NNN-slug` (`videos/_template`) or `--from 042-bellybutton-portal` | 002, 020, 035, 042, 055 (Scribe dupe) | merged |
| **toon** (build) | big-headed toon cast, punchy 60 fps camera + kicks, one word at a time, ElevenLabs narrator | `engine/build/*` (toon.js, captions.js, rail.js, fx.js, anim.js) | `/new-build` (docs/BUILD.md); promo story kit: 049 | 039 (build), 049 (promo story), 050 (upgrade-every-day promo: `campus.js` + `dayhud.js`) | merged |
| **pixel** | any 3D scene rendered in chunky n×n blocks + mosaic cut transitions | `engine/pixel.js` (`addPixelPass`, `mosaicAt`), `engine/pixeltex.js` | `npm run new -- NNN-slug --from _pixel-template` | 057 (homework doubling) | merged (a post pass, not a world) |
| **anime** (pixel) | a polished 2-D anime illustration (generated locally with Animagine XL 4.0, `tools/anime/gen.py`, CreativeML Open RAIL++-M) animated as a puppet in voxel sets under the pixel pass | `engine/puppet.js`, `engine/sets/voxbeach.js` (branch `feat/goth-tutor`) | — | 054 (in progress; replaced a procedural cel-shaded model the user rejected) | building |
| **sim** | Sims-like realistic 3D: realistic proportions, cutaway house/ground slab, clean daylight (@officialwriteit's hit look) | `engine/sim/` (person.js, house.js, props.js, mats.js, look.js, hud.js) | `npm run new -- NNN-slug --from _sim-template` (narrated: `--from 052-bedroom-never-leave`) | 052 | built (branch `claude/052-sim-style-bedroom-d80346`) |
| **flat2d** | flat 2D cartoon (Canvas 2D, no WebGL): boiling ink outlines, flat fills + one cel step, big-headed puppets, bold in-world labels | `engine/flat2d/` (stage, ink, puppet, sets, fx, critters, endcard) | `npm run new -- NNN-slug --from _flat2d-template` | 053 | ready (branch `claude/053-flat2d-style-inventions-021e30`) |
| **voxel** | a blocky-game world: everything is 1 m cubes with 16 px pixel-art tiles + baked corner AO, square-headed people with 8 × 8 pixel faces, flat chunky clouds, bright flat daylight, crisp edges | `engine/voxel/` (tex, vox, person, world, props, town, rooms) | `npm run new -- NNN-slug --from _voxel-template` (a whatifpov-style promo: `--from 059-voxel-giant-doubling`) | 059 | built (branch `claude/059-voxel-style-9b1f2e`) |

Ideas for later builders: claymation (soft subsurface + thumbprint noise + 12 fps
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

### sim — Sims-like realistic 3D (052, `engine/sim/`)
**Look:** @officialwriteit's 2M/1.4M/751K reels decoded (Nov 8): a one-storey house cut away like a dollhouse — front walls gone,
the floor on joists over a dark crawlspace, a cut slab of streaky soil under the lot, pink insulation between the ceiling joists,
a gable roof cut through its rafters, white lap siding — lit by clean neutral daylight from the front; realistic adult proportions
(head ≈ 1/7.5 of a 1.77 m body) with small simple faces; mid-wide cameras that hold and push slowly; one white word at a time in
the centre and a steady white `DAY N` counter top-centre (their top labels: "23 MINUTES", "FARADAY CAGE").
**Start:** `npm run new -- NNN-slug --from _sim-template` (10 s, no narration: hand-timed `story.words`). For a narrated promo fork
the proof reel instead: `--from 052-bedroom-never-leave` (copies script.json + make_cues.py too), copy `hand.json` +
`scribe-icon.png` from 049/052, fix the `/videos/052-…` asset paths in shots.js, rewrite script.json → `narrate.py --scratch`.
**API (all additive; rig.js/core.js defaults untouched):**
- `look.js`: `SIM_LOOK` (story.look: neutral tone map, sat 0.9, bloom 0.05, fill 0.18) and `simLights(studio, {sun, target, half})` =
  RoomEnvironment IBL (scene.environment, intensity 0.42) + hemi + one soft-shadow sun; `L.focus(x, z, half)` per shot, `L.setDay(k)`.
- `person.js`: `makeSim({skin, hair, hairStyle:'short'|'swoop'|'bun'|'long'|'bald', top:'hoodie'|'tee'|'shirt'|'cardigan', topColor,
  pants, shoes, sole, eyes, female, beard, glasses})` builds a realistic body on **rig.js's skeleton**, so `applyPose`/`basePose`/
  `blink`/`handWorld` and every arm preset + sitting value in CLAUDE.md drive it. Extras after applyPose: `simFace(P, {open, look:[yaw,
  pitch], brows −1…1})` (jaw open for yells, eyes that look, brows), `legsOut(P)` (sitting up in bed: legs out + hidden under the duvet;
  `legsShow` undoes the hiding), `lift(pose, FY)` (stand/sit on the raised house floor), `SIM.eye/top/shoulder`.
- `house.js`: `buildSimHouse(studio)` — rooms left→right bedroom | hall | kitchen | living (`D.rooms` x-ranges, floor `FY` 0.62, ceiling
  `CY`), `H.bed {g, top, duvet, legBump, D}` (headboard on the back wall; move `bed.g` and everything parented to it rides along),
  nightstand + `lamp.set(k)`, dresser, posters, `setClock(h, m)`, `setCalendar(n)`, light `switch.set(on)`, `setLight(room, k)`,
  side window `winL.sash` (raise `.position.y`), back windows, hall door, a dressed kitchen (counters, sink, cooktop, fridge, table) and
  living room, the backyard (fence, trees, shrubs, patio + umbrella, neighbour houses), sky dome + clouds, `setDay(k)`, `aim(x, z, half)`.
- `props.js` (the upgrade kit): `makeMiniFridge` (`setDoor`), `makeCan`, `makeChips`, `makePizzaBox`, `makePhone`, `makeLaptop(tex)`
  (`setOpen`, `screen`), `makeRope().set(a, b, sag)`, `makePulley`, `makeBedDesk` (swing arm), `makeChute(points, {r})` (an open
  half-pipe, `at(u)` = a point on its floor), `makeRobotArm()` (`set({yaw, a1, a2, a3, grip})`, `tip`; 052 has a 2-link `armIK`),
  `makeDrone()` (`update(t)`, `hook`), `makePrinter` (`setPaper(k, tex)`), `makeRails`, `makeGrassBox`, `makePaper(tex)`.
- `mats.js`: `simMat(kind, {color, repeat, rough})` — paint, carpet, wood, lumber, siding, shingle, grass, soil, concrete, insulation,
  brick, tile, fabric, plastic, metal, steel, chrome, glass, rubber, white (canvas textures, cached); `boxUV` (UVs in meters).
- `hud.js`: `makeSimHud({show, day:[[t, n]], end:{t, icon, url, tag, offer}})` — restyles the build captions for this look (scoped by
  `body.sim`), the DAY counter and the Scribe end card.
**Gotchas (each cost a stills round):**
- The house floor is raised (FY 0.62): pose people with `lift(p, FY)` — the first lineup stood everyone in the crawlspace.
- Hair caps must hug the skull: the tilt is applied on the unit sphere BEFORE the skull deformation (`skullGeo(..., tilt)`); tilting
  the finished mesh exposed a bald crown on the bun. Hairline ≈ capLen·180° − tilt° from vertical: 'short'/'swoop' 0.5π/−0.62, 'bun'/'long' 0.58π/−0.85.
- A face from primitives reads toy-like if the nose ball is big, the brow is under a fringe or a chin sphere bulges: keep the nose tip
  r ≈ 8.6 mm, brows on the forehead, no chin ball on women.
- In bed, legs straight out stick through the duvet — `legsOut` hides them and `H.bed.legBump` stands in.
- Dollhouse walls run front-to-back: an angled camera sees only one room; a move from room to room must run straight on along x
  (052's chute pan tracks the bag's x at z ≈ 2.9) or the hall disappears behind its wall.
- Screen inserts: a 0.32 m laptop screen needs the lens ~0.8 m out at fov 40 (0.6 m cropped the left of the email).
- A gag the wide can't show gets its own angle: "touch grass" only read from OUTSIDE the window (hand on the window box).
- Long hair = an OPEN shell around the sides + back only: CylinderGeometry's theta 0 is +z (the face), so the opening goes at theta 0
  (052 v1 put it at +x and the teacher read as wearing a balaclava, manager review). The template lineup (t 206/207) checks it front +
  three-quarter; check every new hair style there before a reel.
- A seated close-up has three bands to clear: the DAY counter (10–15 %), a stamp (29 %, or its own `y`) and the caption (52 %). Aim so
  the face sits at 31–38 % (052 teacher: look y ≈ face − 0.2 m at 1.4 m, fov 44) and lift the stamp to `y: 0.2` if she looks up.
- Lineup frames render in one page after story frames: reset state each frame (`legsShow`, visibility) or a leg hidden at t = 1 stays hidden at t = 200.
- Arms crossed with rig.js presets: `A(-0.42, 0.1, -1.7, 1.3)` + `A(-0.55, 0.1, -1.6, -1.3)` (the hand-on-chest pair read as prayer hands).
**Render time:** ~0.10 s per frame at 1080×1920, 30 fps, motionBlur 1 (≈ 3 s per second of video; 052's 52.9 s ≈ 2.7 min on an M5 Pro).

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

### voxel — the blocky-game world (059 "What if you DOUBLED in size every 3 seconds?")
**Look:** a world built from 1 m blocks, each face a 16 × 16 px pixel-art tile sampled NEAREST (crisp texels up close), with baked
ambient occlusion in every block corner (the soft dark creases that make a block world read) and a fixed per-direction face shade;
square-headed people (8 × 8 × 8 px head, 8 × 12 × 4 torso, 4 × 12 × 4 limbs, 32 px tall) painted from one 64 × 64 "skin" canvas with
8 × 8 pixel faces; flat chunky clouds (instanced slabs); one crisp sun + a sky hemi, neutral tone mapping, almost no bloom, no grain.
Our own tiles, palette, outfits and faces (no game's assets or characters). Text stays DOM (`#ui`), never in the render.
**Start:** `npm run new -- NNN-slug --from _voxel-template` (10 s: a tracked street walk + the bedroom; t ≥ 200 = a lineup of every
arm preset × face, t = 203 a wide of the town). For a whatifpov-format promo fork 059 instead (`--from 059-voxel-giant-doubling`,
copies make_cues.py too): the HUD/⏪/end-card DOM layer, the VHS rewind pass, the Scribe phone app (`makeApp`, portrait) and a
doubling clock are all in its shots.js.
**API (all in `engine/voxel/`, one import: `import * as V from '@engine/voxel/index.js'`):**
- `tex.js` — `blockAtlas()` (the shared atlas: 60+ tiles in 32 px cells with wrapped borders so mipmaps don't bleed), `BLOCKS` (grass,
  dirt, stone, cobble, asphalt, road_line, crosswalk, sidewalk, water, log, leaves(_b/_pink), hedge, brick(_tan), planks(_light/_dark),
  plaster(_cream), concrete, siding_white/blue/yellow/mint/pink/gray, roof_red/gray/blue/brown, window(_dark/_lit), glass, tower_glass/
  stone, door/door_top/door_red/door_glass, metal, bookshelf, chalkboard, checker, floor_tile, carpet(_red), wallpaper(_blue), hay,
  pumpkin, plain, smooth + cross sprites tuft/flower_*), `tileTexture(name, repeat)` (one tile as a repeating texture: ground planes),
  `pixelCanvas(w, h, draw)` + `nearestTex(canvas)` (signs, posters, item sprites), `SOLID_COLORS`.
- `vox.js` — `new VoxGrid()` (sparse, grows to fit; block coords = metres / bs): `set/get/fill(x0,y0,z0,x1,y1,z1, b, {ifEmpty})`,
  `walls`, `blob(cx,cy,cz, rx,ry,rz, b, jag, seed)` (crowns, bushes), `stamp(grid, ox,oy,oz, {rot, flipX})`; blocks by name or
  `colorBlock(hex)` (any colour = the plain tile tinted) / `tintBlock(name, hex)`. `meshGrid(G, {bs, ao, faceShade})` → ONE merged
  mesh per grid (+ cross plants + water): hidden faces culled, per-corner AO, a flipped quad diagonal where AO is uneven.
  `boxModel([[x0,y0,z0,x1,y1,z1,hex], …], {bs})` = a colour-voxel prop at any grain (cars 0.25 m, desks 0.125 m, a printer 1/14 m),
  `itemFromCanvas(canvas, {bs, depth})` = a pixel sprite extruded into a held item, `instanceModel(model, [{x,y,z,s,r}], parent)`.
- `person.js` — `makeVoxPerson({height, skin, hair, hairStyle: 'short'|'long'|'bob'|'spiky'|'messy'|'buzz'|'bun'|'ponytail'|'cap'|'afro'|
  'bald', eyes, top: 'tee'|'hoodie'|'shirt'|'cardigan'|'dress'|'vest', shirt, under, tie, logo, sleeves, pants, shorts, shoes, shoeH,
  glasses, beard, blush, cap, backpack})` → `P.pose({x, y, z, rotY, scale, walk: P.phaseFor(dist, scale), stride, lean, twist, crouch,
  head: {yaw, pitch, roll}, armL/armR: {x, z, bend} | ARMS.*, legL/legR: {x, z, bend}, face})`; faces `FACES` = idle, blink, happy, grin,
  shock, scream, worried, angry, talk, smirk, wow, sleepy (`P.setFace`); `ARMS` presets (down, point, pointUp, wave, cheer, phone, hold,
  reach, shock, shrug, hips, facepalm, megaphone); `P.hand.L/R` groups, `P.gripWorld(side, along, fwd)` (a point in the fist; fwd 2 =
  the fist's top face when the forearm is raised), `P.eyeWorld(out, fwd)` (POV cameras), `P.headMesh`/`P.torso` (hide them for POV),
  `randomOutfit(seed, extra)` for crowds. Figure faces +z; armL = its left (+x); arm x < 0 swings forward, z > 0 raises outward, bend
  < 0 lifts the forearm; head pitch > 0 looks down.
- `world.js` — `voxWorld(studio, {size, clouds: {y, cell, thick, area, cover, clear: [[x, z, r]]} | false, far: {forest, hills,
  city, cityAt, citySpread}, fogNear, fogFar})` → ground to the horizon, gradient sky dome that follows the camera, flat block
  clouds, sun + hemi (`W.aim(x, z, half)` per shot = where the crisp shadows fall), sky-coloured fog (`W.setFog(near, far)`),
  instanced far forests / green hills / a downtown of window-textured towers; `voxTree(kind)`, `VOX_LOOK` (story.look values).
- `town.js` — `buildVoxTown(studio, {school, world})`: a main street along x (road z −4…4, sidewalks at z ±6, a side street at
  x = −60), two rows of gabled houses with yards, hedges, trees, flower beds, driveways, lamp posts, mailboxes, curb + driveway cars
  (`T.cars[i].setCrush(k)`), a hoop, hydrants, benches, and MAPLE HIGH SCHOOL (x 62–111, front at z = 17 with an entrance block +
  clock tower, `T.clock.set(h, m)`, a plaza, flag `T.flag`, bus `T.bus`); `T.setBanner(canvas, {w, h, x, z})` lays a canvas on the
  school roof (readable from a giant's POV); `T.D` dims; `stampHouse / stampTree / stampSchool` reuse the prefabs in your own grid.
- `rooms.js` — `buildVoxClassroom(studio, {board})` (Room 4: chalkboard `setBoard(lines)`, 12 desks, teacher's desk + apple, a
  printer on a cart `C.printer` (`userData.out` = where pages land), clock, posters, windows with a painted view + real lawn) and
  `buildVoxBedroom(studio)` (bed, desk + lamp, chair, window, poster, rug, bookshelf). Open front (+z) = the camera side.
- `props.js` — `voxCar(color)`, `voxBus()`, `voxLamp()`, `voxHoop()`, `voxMailbox()`, `voxHydrant()`, `voxBench()`, `voxFlagpole()`
  (`wave(t)`), `voxDesk()`, `voxPrinter()`, `voxPencil()`, `voxPaper(tex)` (a sheet as a thin box, any canvas on top: makeSheet),
  `voxPhone(tex)` (screen faces +z; `lookAt(eye)` it), `voxSign(canvas)`, `textCanvas(lines, {w, h, bg, fg, font})`.
**Gotchas (each cost a stills round on 059):**
- **The sun must come from the camera side:** the first sheet lit everything from behind (sun from +z, cameras on the street looking
  +z at the north side) and every face was in shade. `voxLights` now defaults to a sun from −z; aim your cameras with the sun behind.
- **Props parented to a scaled rig scale twice:** `hand.localToWorld(offset)` already applies the rig's scale — 0.1·s offsets put the
  phone 1.6 km away (a speck). Pass offsets in the rig's own units, or place unscaled props in world space at `gripWorld()` points.
- **POV hands:** at ±6 px the hands sit outside a 74° vertical frame's ±20° width; bring the arms inward (`z ≈ −0.45…−0.6`), put
  the camera 1 px BEHIND the eyes (`eyeWorld(v, −1)`), hide `headMesh` + hair + `torso` (the hoodie drawstrings poked into the
  frame), and aim between the hands and a point ahead (lerp 0.5–0.6).
- **Flat props on a raised fist:** the fist's top face is tilted with the forearm — orient the sheet to the forearm's +z (`onFist`
  in 059) or it sinks into the block. A narrow zoom (fov 42 → 4.5°) must aim exactly at the prop: a 10 % lerp toward the other fist
  pushed it out of frame.
- **A giant several km tall:** park him km away (4.2 km in 059) or one leg fills the frame; `camera.far` ≥ 60 km, fog 2.5–26 km,
  `W.aim(x, z, 0.6·H)`. Clouds between the lens and his face: carve a hole with `clouds.clear`.
- **Readable screens next to the HUD and the subtitle:** the HUD owns 23–36 % on the left, the italic subtitle 66–69 %; 059's phone
  sits right-aligned from 33 % to 99 % of the frame, and the app puts the important figure (the Punnett square) in the card's TOP third
  (42–60 % of the frame). A paper on a tray reads upright only when its text lines run along the camera's right vector (059: yaw −0.78).
- **Picking a prop by position:** "the first car with z > 2" found a driveway car 12 m behind the curb — the crunch shot showed a lawn.
- **A giant seen through a classroom window reads as a grey wall** (the leg at km scale is a flat jeans block): 059 dropped it for a
  shake + the teacher's shock. Show scale from outside, not through a 2 m window.
- Biology sheets: scribe.js's `punnettFig()` (additive, makeSheet's new `fig` option) draws a Punnett square stroke by stroke; keep
  the square inside its problem's row (rowH = (1325 − 340) / n) or it collides with the next question.
**Render time:** 059 (41.2 s, 30 fps, 1080 × 1920, no motion blur): 1,236 frames in 92 s ≈ **0.075 s per frame** (≈ 2.2 s per
second of video; a still sheet of 15 frames ≈ 3 s) — cheaper than sim, about flat2d's cost. The whole town is one draw call.

### pixel (057 homework doubling — the first reel in it)
- **Block size: 8 px at 1080 wide** (135 blocks across). The template's 5 px is invisible on a phone (a 5 px block is under 2 pt
  at phone size; half-size stills hide it too — check a `--full` still crop). Drop to **3–5 px for shots whose text must read**
  (the phone app close-up 3, the POV phone 5) and ramp the size inside a shot to "de-res" (`lerp(3, 8, smooth(...))`).
- `pixel.set(n, { avg: 4 })` (block mean) for moving cameras; `mosaicAt(t, CUTS, 0.34, 40)` on every cut except a rewind.
- All text stays DOM in `#ui` (title, subtitles, HUD, the end card) so it is never pixelated. A VHS rewind = a ShaderPass added
  AFTER the pixel pass (057 `VHS`: banded horizontal tears, chroma split, rolling bright lines) + a DOM ⏪ icon.
- Crisp texel props: `pixelTex` for brick/grass/asphalt/concrete (engine/sets/school.js), `paintPixels` for tiny sheet textures.
- A "wave" across a surface = one patched Lambert material (057 `sweepMat`): world-space distance from a centre picks texture A
  or B and adds an emissive band at the front; UVs from world xz (`uTile`) keep texel size constant while the mesh scales.
- Render time (057: two sets + 700 instanced sheets, 30 fps): 1,242 full-size frames in 143–237 s (≈ 0.1–0.2 s per frame), so
  a 41 s reel renders in ~3–4 min; the HEVC upload copies take longer than the render when the Mac is shared.

