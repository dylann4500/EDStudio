# Style library — every animation look EDStudio can make, and how to add one

The Scribe promo operation (docs/lanes/scribe.md) pairs viral concepts with looks; @officialwriteit rotates several looks and the
user wants a bigger library (Nov 8 2026). Each look below is real, merged code with a template or a reference reel. Everything
stays procedural (Three.js → headless Chrome → ffmpeg), deterministic (`rng`, never `Math.random`), no downloads at render time.

| Style | Look | Engine | Start from | Reference reels | Status |
|---|---|---|---|---|---|
| **toy3d** | toy-like rig people, warm sets, many places (the what-if sims) | `engine/rig.js`, `engine/sets/*`, `engine/props.js` | `npm run new -- NNN-slug` (`videos/_template`) or `--from 042-bellybutton-portal` | 002, 020, 035, 042, 055 (Scribe dupe) | merged |
| **toon** (build) | big-headed toon cast, punchy 60 fps camera + kicks, one word at a time, ElevenLabs narrator | `engine/build/*` (toon.js, captions.js, rail.js, fx.js, anim.js) | `/new-build` (docs/BUILD.md); promo story kit: 049 | 039 (build), 049 (promo story), 050 (upgrade-every-day promo: `campus.js` + `dayhud.js`) | merged |
| **pixel** | any 3D scene rendered in chunky n×n blocks + mosaic cut transitions | `engine/pixel.js` (`addPixelPass`, `mosaicAt`), `engine/pixeltex.js` | `npm run new -- NNN-slug --from _pixel-template` | 057 (homework doubling) | merged (a post pass, not a world) |
| **anime** (pixel) | the @allythetutor look: a VRoid Studio anime girl (VRM 1.0, `engine/vroid.js` — poses, walk, lip-sync, blink, hair sway) on ONE sunny voxel beach with every fact as a prop/diorama beside her, the pixel pass at ~4 px, yellow pixel-font title/fact cards on top + lowercase pixel captions (`engine/pixelcaps.js`) | `engine/vroid.js`, `engine/sets/voxbeach.js`, `engine/pixelcaps.js`, `videos/054-goth-tutor` (branch `feat/goth-tutor`) | — | 054 (first cut Nov 9; the 2-D puppet and the procedural models were rejected) | built |
| **sim** | Sims-like realistic 3D: realistic proportions, cutaway house/ground slab, clean daylight (@officialwriteit's hit look) | `engine/sim/` (person.js, house.js, props.js, mats.js, look.js, hud.js) | `npm run new -- NNN-slug --from _sim-template` (narrated: `--from 052-bedroom-never-leave`) | 052 | built (branch `claude/052-sim-style-bedroom-d80346`) |
| **flat2d** | flat 2D cartoon (Canvas 2D, no WebGL): boiling ink outlines, flat fills + one cel step, big-headed puppets, bold in-world labels | `engine/flat2d/` (stage, ink, puppet, sets, fx, critters, endcard) | `npm run new -- NNN-slug --from _flat2d-template` | 053 | ready (branch `claude/053-flat2d-style-inventions-021e30`) |
| **voxel** | a blocky-game world: everything is 1 m cubes with 16 px pixel-art tiles + baked corner AO, square-headed people with 8 × 8 pixel faces, flat chunky clouds, bright flat daylight, crisp edges | `engine/voxel/` (tex, vox, person, world, props, town, rooms) | `npm run new -- NNN-slug --from _voxel-template` (a whatifpov-style promo: `--from 059-voxel-giant-doubling`) | 059 | built (branch `claude/059-voxel-style-9b1f2e`) |
| **iso** | isometric tilt-shift DIORAMA: floating slabs of world with a cut soil edge over a gradient void, miniature low-poly buildings + tiny people, a long lens at ~35° that drifts, a depth-aware tilt-shift blur | `engine/iso/` (tiltshift, base, camera, look, people, props, room, italy, fx, hud) | `npm run new -- NNN-slug --from _iso-template` | 060 | built (branch `claude/060-isometric-style-37e0d0`) |
| **mg** (motion graphics) | Kurzgesagt-like flat vector explainer: soft-gradient shapes with long subtle shadows on a deep-blue backdrop, round-headed people, a globe of people-dots, charts/maps/counters that build themselves, kinetic words, parallax + zoom/iris/wipe transitions | `engine/mg/` (stage, draw, people, icons, charts, geo, type, overlay, fx, scenes, scribe2d, endcard) | `npm run new -- NNN-slug --from _mg-template` | 061 (everyone claps) | built (branch `claude/061-motion-graphics-style-ffbeda`) |
| **rbx** (blocky avatars) | a blocky-avatar game look (our own design, no game's assets/names/UI): classic blocky avatars (rounded-cylinder head with a printed face decal, box torso + stiff box limbs, bright shirt/pants, hair + hats), glossy plastic, a grey studded baseplate under a bright painted sky, obby props, floating name tags, chat bubbles + a chat log, the "oof" (the avatar breaks into its parts) | `engine/rbx/` (mats, avatar, world, obby, chat, props, fx, stadium, rooms) | `npm run new -- NNN-slug --from _rbx-template` (narrated meme reel: `--from 069-rbx-corgi-loose`) | 069 (runaway corgi meme) | built (branch `claude/069-roblox-style-meme-432a88`) |

Ideas for later builders: claymation (soft subsurface + thumbprint noise + 12 fps
stepped motion), paper cut-out (layered card planes, drop shadows), whiteboard doodle (line-draw reveal), low-poly flat-shaded,
retro VHS/90s cartoon.

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

### rbx — the blocky-avatar game (069 "This corgi had one f*cking job", the runaway corgi at the Nov 8 NFL halftime corgi race)
**Look:** a generic blocky-avatar sandbox game in our own design: classic blocky avatars ~5.2 studs tall (S = 0.34 m: 2-stud legs,
a 2 × 2 × 1 torso, 1 × 2 × 1 arms, a rounded-cylinder head with a printed face DECAL — two oval eyes + an arc smile, swapped per
emotion), box limbs that swing stiffly from the shoulder/hip (no elbows, no knees), bright shirt/pants colours with a pants-coloured
waistband, a shirt print, hair and hats as simple accessory meshes; smooth slightly glossy plastic (a RoomEnvironment IBL gives every
part a soft highlight); a grey studded baseplate under a bright painted sky with puffy clouds; obby props; floating name tags; chat
bubbles + a translucent chat log; the "oof" = the avatar breaks into its parts, which bounce and settle flat. Neutral tone mapping
(ACES greyed the sky). No game's logo, name, sounds or UI: our own faces, palette, tag/bubble/log design, and our own "oof" sound
(a padded thud + a bonk + plastic bits, 069 make_cues.py `oof()`). All text that must read is DOM (captions, chat log, end card) or
canvas sprites sized for the lens every frame.
**Start:** `npm run new -- NNN-slug --from _rbx-template` (10 s, no narration: walk + wave + "hi chat" → hop the bricks → lava → the
oof → respawn at the checkpoint; t ≥ 200 = lineups of faces, arm presets, dogs + debris, a course wide). For a narrated meme reel
fork 069 (`--from 069-rbx-corgi-loose`: script.json with the f-word swap, make_cues.py, the stadium/bedroom/classroom sets parked at
offsets, the Scribe sequence — app on a laptop, a POV phone, the pen writing a Punnett square — and the brhud end card); copy
`voice/` only if you keep the lines.
**API (`import * as R from '@engine/rbx/index.js'`; all new files, no shared defaults changed):**
- `mats.js` — `S` (one stud, m), `rbxEnv(studio)` (scene.environment), `plastic(color, {rough, map, normalMap, env})` (cached),
  `neon(color, k)`, `matFor(kind, color)` (plastic | smooth | neon | studs | wood | grass | brick | metal | sand | glass),
  `part([w, h, d], {color, mat, top: 'studs', parent, pos, rot, radius})` (UVs in studs via `boxUV`: one stud per texture repeat at any
  size), `cyl(r, h, {...})`, `studMaps()` (stud colour + normal tile), `canvasTexture`, `shade`, `prng`.
- `avatar.js` — `makeAvatar({skin, shirt, pants, shoes, sleeve 0..1, print: 'star'|'heart'|'bolt'|'stripe'|'number:7'|'text:HI'|fn,
  printColor, tie, belt, hair: 'short'|'swoop'|'spiky'|'long'|'pony'|'bun'|'afro'|'buzz'|'none', hairColor, hat: 'cap'|'beanie'|
  'tophat'|'crown'|'headphones'|'party'|'hardhat'|'halo'|'helmet'|'dogears'|'bandana', hatColor, hatColor2, glasses, face})` →
  `P.pose({x, y, z, rotY, scale, walk: P.phaseFor(dist), run, stride, idle: t, jump 0..1 (both arms up), sit + seat (seat top y),
  climb, lean, twist, tilt, tip + tipDir (a stiff fall: π/2 = flat on the ground; dives), bob, armL/armR/legL/legR {a forward, s outward,
  t twist}, head {yaw, pitch, roll}, face, noHat, visible})`; `P.shatter(t, t0, pose0, {dir, power, up, floor, seed})` = the oof
  (stateless: simulates the parts from t0 every frame); `P.addHat(kind, c1, c2)` (a toggled second accessory), `P.hand.L/R`,
  `P.headWorld`, `P.tagWorld`; `FACES` (smile grin open shock scream angry worried smirk happy wink cool cry dizzy talk sleepy evil shy
  meh oof), `ARMS` (down point up out hips hold phone cheer shrug facepalm + wave(t) flail(t) dance(t)), `makeHat(kind)` (on anything),
  `headShell(yb(θ))` (a shell that hugs the head from a hairline up), `DIM`.
- `world.js` — `rbxWorld(studio, {size, color, fog, sun, sky, plate})` → `{root, sky, plate, lights: {sun, hemi, aim}, aim(x, z, half),
  setFog, update(t)}`; `RBX_LOOK` (story.look), `SKY`, `rbxSky`, `baseplate`, `rbxLights`, `rbxTree('round'|'pine')`.
- `obby.js` — `makeSpinner({len})` (update(t)), `makeKillBrick`, `makeLava([w, d])` (update(t)), `makeCheckpoint({n, color})` (setOn, update),
  `makeTruss(h)`, `makeJumpPad()` (setPress), `makeCoin()` (update(t, y0)), `makeSign(lines, {w, h, bg, fg})`, `obbyCourse(parent, steps)`.
- `chat.js` — `makeTags(scene)` → `add(avatar | object, name, {color, px, sub, at(v)})` + `update(camera)` (steady on-screen size,
  clamped 26–70 px); `makeBubbles(scene)` → `say(target, text, t0, t1, {px, at})` + `update(camera, t)` (boing in, float out, stacks);
  `makeChatLog({lines: [[t, user, colour, text]], top, max, show})` (DOM, `rbx-*` classes) + `update(t)`; `sizeFor(camera, pos, px)`.
- `props.js` — `makeBlockDog({coat, white, dark (tricolour saddle), jersey, number, scale})` (a corgi: `pose({x, z, rotY, run: phaseFor(d,
  scale), sit, mouth, look, headRoll, wag, t})`), `rbxCrowd(parent, seats, {seed})` (instanced seated crowd, 4 draw calls; `update(t, f)`
  with f → {jump, arms, turn, hide}), `rbxDesk`, `rbxChair` (userData.seat), `rbxLaptop(tex)` (hinge −0.28 open, screen faces +z),
  `rbxPhone(tex)`, `rbxPaper(tex)` (top of the page → −z), `rbxLamp` (light), `rbxBed`, `rbxPen` (origin = the nib).
- `fx.js` — `makeRbxFX(scene)`: `confetti(t0, pos)`, `puff(t0, pos)`, `studs(t0, pos)` (plastic bits), `pow(t0, pos, 'OOF!')` (a comic
  starburst sized for the lens), `update(t, camera)` — all analytic.
- `stadium.js` — `buildStadium(studio, {world})`: a blocky football stadium, field along x (`yardX(40)` = the 40 on the +x half; painted
  numbers read from the +z sideline), 12-row stands + end stands with `crowd`/`endCrowd`, a padded wall with our own ad boards, a
  jumbotron at the −x end (`setScreen(lines, bg)`), goal posts, a race START gate (`gateBar`) + FINISH arch with a ribbon (`snap(k)`),
  a dashed lane line (`setLane(i, k)`), a TV camera. `rooms.js` — `rbxBedroom({clock})` (night: window with a moon, desk in the room so
  the sitter faces +z, lamp, shelf, corgi poster, clock `setClock`, bed + plush, `moon` light) and `rbxClassroom({board})` (chalkboard,
  sunny windows, teacher's desk, 6 student desks `D.desks[i] = {x, z, chair, g, ch}`).
**Gotchas (each cost a stills round on 069):**
- **ACES turned the bright blue sky grey** and 26 overlapping painted clouds covered the band a level camera sees (elevation 0–25°):
  `neutral` tone mapping + 16 separate small cumulus with blue between them.
- **Avatars are 1.36 m wide across the arms:** a lineup at 1.05 m spacing interpenetrated (z-fighting stripes); use ≥ 1.6 m.
- **The baseplate at y = 0 z-fights any floor slab** (turf, a room floor): drop it (`W.plate.position.y = −0.3`) or hide it indoors.
- **A night interior in the same scene as a day set:** the world's sun/hemi reach it too — set sun ≈ 0.25 (blue), hemi ≈ 0.4 (dark
  blue), the room's lamp + moon on, hide the sky dome, background dark, `scene.environmentIntensity` 0.3 per shot (069 `useSet`).
- **POV arms read as giant blocks** (0.19 m boxes 0.2 m from the lens filled the frame): a phone held in front of the lens alone reads
  fine (069 `povPhone`, the phone 0.27–0.29 m out, oriented with the camera's quaternion).
- **`pose()` sets `root.visible`** — pass `visible: false` for a rig a POV shot must hide (setting `root.visible` before pose is undone).
- **A sitting handler holding the dog at his chest hid his face:** put the dog on the turf in front of him (arms 'hold' reach it).
- **Arms-up hands only reach the top of the head** (blocky proportions): a dog "held overhead" sits on his head — lift it ~0.34 m
  above the hands and shoot from low (0.6 m) with the head at 72 % so the dog clears the one-word caption.
- **Painted yard numbers read upright only from their own sideline** (as in real stadiums): frame them from the sideline side.
- **A POV lens in the stands ends up inside a jumping spectator** (069's phone shot went solid purple mid-shot): hide every `rbxCrowd`
  seat within ~1.8 m of the lens (`f → { hide: true }`), including the rows behind it.
- **A laptop screen is wider than a vertical frame at < 1 m:** back off to ~1 m (fov 40) and favour the side with the progress tiles.
- **Dives:** `tip` rotates the body about the feet, so a dive = root flies a parabola while tip goes 0 → π/2 in the first half; the
  landing pose (tip π/2, arms up) is `pose0` for `shatter()`. Shoot a dive along its line (he flies at the lens) — a side camera lost him.
- Faces vs the one-word caption (52 %): `aimF(pos, subj, f, fov)` in 069 shots.js puts a point at a frame fraction; heads at 36–40 %
  or 62–72 %.
**Render time:** ≈ 0.08 s per frame at 1080×1920, 30 fps, motionBlur 2 (two sub-frames per frame) on the shared Mac: 069's 47.4 s
(1,421 frames) took ~1:50 of frames, 2:10 with the encode (≈ 2.7 s per second of video); a 34-still sheet ≈ 7 s. The stadium's ~4,000
instanced spectators are rewritten every frame and still cost almost nothing.

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


### iso — the isometric tilt-shift diorama (060 "What if Italy rebuilt the Leaning Tower of Pisa with pizza?")
**Look:** every place is a chunky slab of world cut out of the ground and floating in a soft gradient void — the world on top,
a cut edge of soil strata on the sides (grass lip with a ragged fringe, roots, sandy/clay layers, pebbles, grey rock), rounded
edges, a soft shadow far below — shot from above at ~35° on a long lens (a near-orthographic photo of a tabletop miniature),
with a strong depth-aware tilt-shift blur (sharp at the subject, melting toward the near soil edge and the far side), warm
saturated toy colours, peg-figure crowds and toy-proportioned rig heroes, and a gentle drift. Rooms are dollhouse slices (floor +
two walls with visible thickness). Text = @okwhatifcrazy's landmark layout (kicker with a running T+ clock, pinned "What if"
title, a left HUD per beat, one bold subtitle per beat) in DOM — never blurred.
**Start:** `npm run new -- NNN-slug --from _iso-template` (10 s toy town, no narration) → stills → `node tools/render.mjs NNN-slug`.
For a full reel copy 060 (`videos/060-iso-pisa-pizza`: 5 dioramas parked at `OFF[...]`, one visible per shot, SHOTS with
keyframed iso cameras + a focus point, a make_cues.py that reads the event constants from shots.js, the Scribe product
sequence: phone viewfinder → laptop app → the page written with Scribe's real glyphs + a free-body diagram spliced into the
writing order).
**API (all in `engine/iso/`, additive; rig.js/core.js defaults untouched):**
- `tiltshift.js` — `addTiltShift(studio, {blur, range, ramp, band, bandH, bandMix, debug})` inserts a pass BEFORE bloom (linear
  HDR): a colour-less depth render (sprites, `transparent && !depthWrite` meshes and `userData.noDepth` objects left out; shadow
  maps not re-rendered), CoC from |z − focus| − range (full blur `ramp` m further) + an optional screen-y strip, a half-res
  golden-angle gather (far samples can't bleed over sharper near pixels) and a full-res composite. Per frame: `ts.focusOn([x,y,z])`
  (world), per shot `ts.set({ range: frame·0.09·k, ramp: frame·0.36·k })` — scale the depth band with the frame width (k ≈ 1 for
  dioramas, 2–3 for screen/paper inserts). `debug: true` tints the CoC.
- `camera.js` — `isoCam(studio, {target, az, el, frame, fov})` frames by WIDTH (m across the frame at the target; fov 16° default,
  near/far from the frame); `isoAt(t, [[t, {tx, ty, tz, az, el, frame}], …], {drift})` = an eased keyframed shot; `isoView` = the maths.
- `look.js` — `ISO_LOOK` (story.look values: ACES, exposure 1.12, saturation 1.22, warm 0.1, bloom 0.16, fill 0), `isoLights(studio,
  {sun, half})` (RoomEnvironment IBL + hemi + a 4096 soft sun; `focus(x, z, half)` per shot, `setNight(k)`), `isoBackdrop(studio,
  {top, bottom, glow, glowA})` (screen-space gradient void; `set()` per place), `makeMotes()` (bokeh dust for parallax).
- `base.js` — `makeBase({shape: 'square'|'round', w, d, r, h, top, topMap, soil: 'earth'|'sand'|'rock'|'paving', seed})` → `{g, world
  (y = 0 = top), slab, update(t) (bob), D}`; `soilTexture`, `groundTexture` (tileable speckle), `makeFloatShadow(w, d, y)`.
- `people.js` — `makeMini(o)` = rig.js person × 0.6 with a big head (`mini.pose(p)`: p in parent units, dist/speed in metres),
  `makePeg({top, pants, hat: 'chef'|'cap'|'hard'|'sun', apron, scale})` (jointed figure: `set({x, z, rotY, walk, armL, armR, spreadL,
  spreadR, hop, lean, headYaw})`), `makePegCrowd(parent, n, {seed, s})` (instanced, 4 draw calls: `set(i, {x, y, z, rotY, hop})` + `commit()`).
- `props.js` — makeTree('round'|'cypress'|'pine'|'bush'), makeHouse (ochre walls + shutters + terracotta), makeLamp, makeBench,
  makeStall (striped awning + souvenirs), makeCar, makeFence, makeFlagPole, makeCrane (lattice tower crane: `setSlew/setTrolley/setHook`,
  `hook`), makePlane (cargo plane, `setProps(t)`, rear `door`), makeTruck({tank}), windowTex.
- `room.js` — `makeRoom({w, d, h, wall, wall2, floor: 'wood'|'tile'|'terrazzo'|'carpet', windows: [{side, at, y, w, h, view: 'night'|'day'}]})`
  (real openings from boxes + a view card; `walls.back/left` to hide per shot), isoDesk, isoChair({seatH}) (rig proper seat), isoBed,
  isoShelf, isoRug (a group: keep its 12 mm lift), isoPoster(tex), isoDeskLamp ({light}).
- `italy.js` — makePisaTower (`setLean(deg)` pivots on the low foot: 3.97 → 90 = fallen), makeDuomo, makeBaptistery, makeCityWall,
  makeColosseum (`setOven(build, glow)`: brick dome + chimney + glowing arcades), `arcadeTex`.
- `fx.js` — `makePuffs(parent)` analytic puff bursts/streams (`burst({t0, at, n, …})`, `stream(...)`, `update(t)`), `boing(u)`, `kick(t, times, amp)`.
- `hud.js` — `makeIsoHud(story.iso)` = kicker (`{T}` = running clock) + the question alone in the middle that glides up to the header,
  a left HUD per beat (`label, from/to, r0/r1, unit, fmt int|dec|text, sub, sub2 + subAt, color`), subtitles, the Scribe end card
  (`ask` line on top). Hides the core text layer; load `ISO_FONTS` in build().
**Gotchas (each cost a stills round on 060):**
- **A hero who faces a landmark hides behind it** from most azimuths (he pushes the tower, his face points at it). His face shows
  only with the lens within ±90° of where he faces, and the landmark blocks it while the angle between the lens and his line to the
  landmark is under asin(r / d). 060's push shot at az 86 showed only the tower; az 60 shows him in profile-front.
- **Stair-step "blur artifacts" on a rug were z-fighting**: `rug.position.set(x, 0, z)` overwrote its 12 mm lift. Tell blur bugs
  from scene bugs with `ts.set({blur: 0})` before touching the shader (isoRug now returns a group).
- **Inserts need a deeper focus band** (`dof` 2–3): at k = 1 a 0.3 m laptop screen and a sheet of paper were soft.
- **Over-the-shoulder at desk scale fails** (the head fills a long lens): shoot the phone top-down (el ≈ 84, az 180 so the top of the
  page is up) and hide the person — the viewfinder canvas shows the worksheet.
- **A flat disc in the sky is a blob**: texture it (flour, bubbles) and tilt it toward the lens (a YXZ group: y = camera az, x = 0.5).
- **Text bands:** docked title 11–23 %, HUD (left) 28–37 %, subtitles 67–71 %. Keep subjects in 38–64 % (a tossed disc under the HUD
  and a plane under the title were the first-sheet misses); a long-lens camera's `ty` keyframes are how you keep a rising object there.
- The depth pass draws alpha-tested meshes as full quads (the override material ignores alphaTest): fine for arcades, but a big
  alpha-cut card in front of the subject would read as sharp/blurred by its quad — flag it `userData.noDepth`.
- Each place is its own island at `OFF[...]` (one visible per shot): islands can have different scales (060's piazza is toy scale with
  1 m people, Luca's room is real scale) — the tilt-shift scales with the frame, so the look stays consistent.
**Render time:** ≈ 0.07 s per frame at 1080×1920, 30 fps, motionBlur 2 (two sub-frames, each with the tilt-shift's extra depth
pass + half-res gather) on an M5 Pro: 060's 59.6 s (1,788 frames) rendered in ~130 s of frames, ~2.5 min with the encode; a 25-still
sheet takes ~4 s. The tilt-shift is cheap (half-res gather, ≤ 260 taps); shadows at 4096 cost more than the blur.

### mg — motion graphics (061 "What if every human on Earth clapped at the same time?")
**Look:** a Kurzgesagt-style explainer drawn with Canvas 2D (no WebGL, like flat2d): every shape is a point list filled with a soft
two-tone gradient (lighter top-left) and, where it sits on a backdrop, a long 45° shadow that fades out; no outlines. A deep-blue
starfield is the house backdrop; bright places (a golden-hour beach, a palm avenue) use the same palette (`PAL`). Round-headed
people (head = 40·s px, dot eyes, sleeves + skin hands), a hologram-free Earth (ocean gradient, flat land, terminator, glowing
people-dots), maps from Natural Earth 110m, charts that build, icons. Text is the whatif overlay (title → HUD → lower-third
subtitles, steady, top-left HUD) restyled in Fredoka/Inter with kinetic word-by-word rises (`engine/mg/overlay.js`); in-world
labels are pills with leader lines. Static film grain + vignette on top. Constant motion: every shot pushes/pans, layers parallax.
**Render cost: ≈0.07 s per frame at 30 fps (2.1 s per second of video; 061's 50.7 s = 1,520 frames in 105 s).** Stills are instant.
**Start:** `npm run new -- NNN-slug --from _mg-template` (10.5 s: title over the globe → zoom into a beach crowd + POV clap →
wipe to a bar chart → the Scribe end card; copies make_cues.py too) → `python3 -I videos/NNN-slug/make_cues.py` →
`python3 -I audio/synth.py NNN-slug` → stills / `--qc` → render → `sh tools/nomusic-copy.sh`. For a full reel copy 061: its
`make_story.py` writes story.json from a beat table (subtitle, seconds) and event times `T`/`E` that shots.js and make_cues.py
both read, so a retime moves picture and foley together. Text-led like the what-if accounts (no narrator, 0 Eleven chars).
API (`engine/mg/`, all new files; shared code only gained `fmt: 'hms'` in core.js and five synth sounds):
- `stage.js` — `createMG(studio)` → `M.render(t, SHOTS)`: SHOTS = `[{t0, id, draw(g, t), tr: {kind: 'cut'|'fade'|'zoom'|'zoomout'|'slide'|'iris'|'wipe', dur, x, y, dir, color}}]`
  (transitions draw both shots into buffers; 'zoom' flies through (x, y) and reveals the next shot in a growing circle);
  `M.view(g, cam, depth, fn)` = a parallax layer (depth 1 focal, 3 far, 0.7 foreground; cam = {x, y, z, r} = the world point at
  the frame centre); `M.sky`, `M.stars`, `M.flash`, `M.hits = [[t, px, dur]]` (shake), `M.markS(x, y, r, name)` / `M.mark` +
  `M.qc(update, story)` → `render.mjs --qc` lists faces under the subtitle band or the HUD box; `PAL` (the palette).
- `ease.js` — `E.*` easings (io3, outExpo, back, spring…), `tw(t, t0, dur, ease)`, `env`, `seqv` (keyframes: numbers/arrays/hex),
  `morph(A, B, k)` (any two closed shapes), `mixc`/`shade`, `rng`/`hash`/`noise1`, `roll` (rolling numbers).
- `draw.js` — `shape(g, pts, {fill, light, grad, gdir, shadow, glow, hi, alpha, flat})`, `circle/rrect/ellipse/poly/star`,
  `line(g, pts, {w, color, k (draw-on), dash, glow})`, `ring`, `glow`, `contact`, `cloud`, `qpts`, `blobPts`, `longShadow`, `hull`.
- `people.js` — `makeFolk({skin, shirt, pants, hair, hairStyle: short|bob|long|bun|curly|spiky|cap|bald, glasses, dress, seed})`
  → `draw(g, {x, y (feet), s, arms: {L, R: {a, e} | {to: [x, y] in head radii}}, eyes: open|happy|closed|wide|half, look, mouth:
  smile|grin|o|flat|frown, blink, bob, lean, flat, hold(g, hand, R)})` returns `{head: [x, y, r] screen px, hands}`; `ARMS.*`,
  `clapArms(k)`, `clapCycle(t, t0, hz)`, `makeCrowd(seed, n, {x0, x1, y0, y1, s0, s1})` + `drawCrowd(g, crowd, t, fn, {haze})`,
  `drawHandsPOV(g, k, {y, rise, spread, sleeve})` (the viewer's own hands: 0 apart … 1 clapping).
- `icons.js` — gull (flying) + gullStand, car (`lights` = hazard flash), phone (`screen` callback) + handPhone, laptop, building,
  palm, ferris, sun, speaker, check, pin, plane, paperStack, pencil, gascan, battery, clockFace, siren, ear.
- `charts.js` — `bars`, `lineChart` (draws on), `axes`, `gauge`, `meter`, `progressRing`. `type.js` — `txt`, `ktext` (rise|wipe|
  scale|type per word), `label` (pill + leader line + sub line), `bigNum`. `fx.js` — `soundRings`, `burst`, `confetti`, `makeFlock`
  + `flock`, `sparkle`, `buzz`.
- `geo.js` — `makeWorld()` → `W.globe(g, x, y, r, {lon0, lat0, dots, dotFn(d, i, p), highlight: {ADM0: colour}, night})` (the
  people-dots: a land grid + clusters on 60 big cities), `W.globeXY`, `W.project`, `W.mapView/mapXY/map` (flat maps by country
  code), `gcPts`/`gcKm` (great circles), `CITIES`.
- `scenes.js` — `space` (starfield + planets), `beach` (golden-hour beach: sun, headland, sea bands with moving foam, pier +
  Ferris wheel, sand) + `beachFG` (foreground palms), `street` (buildings, palms, road).
- `scribe2d.js` — `makeWorksheet(G, {title, note, name, problems: [{q, a: ['line', …], box, fig(F)}]})`: answers AND figures
  (F.line/arc/curve/dot/text) written stroke by stroke in Scribe's glyphs; `draw(p)` returns the pen tip. `scribeApp(g, x, y, w, h,
  {mode: home|camera|scan|solve|write|done, k, sheet, icon, n, name})` = the app as a phone screen. `endcard.js` —
  `drawEndCard(M, g, icon, age, {top: ['fact line', …], tag, url, offer})`.
Gotchas (each cost a stills round on 061):
- **The HUD box (x < 600, y 430–690) eats in-world labels and chart titles.** Put titles at y ≥ 700 or right of x ≈ 440, pin labels
  to the RIGHT of their pin, and keep a page/phone's important top row out of it (phones live at x ≈ 680).
- **Hero faces vs the subtitle band (1270–1430):** a 1.5-scale person standing at world y 640 with cam.y 150 put the face at
  y 1305. Frame with cam.y ≈ feetY − 320 at z 1.2 (head ≈ 1060) and run `--qc`.
- **A phone's notch covers the app's header:** start an app screen ~0.11·w below the top (`scribeApp(g, x0, y0 + sw * 0.11, …)`)
  and give the phone `bg` the app's colour.
- **The first POV hands read as fists:** separate fingers (rounded capsules with small gaps, a slight fan) + a thumb angled out.
- **'zoom' transitions showed the incoming frame's rectangular edge** (drawn small over the old one) — it now reveals inside a
  growing circle. Chart value labels sit on the bar tops: leave ~70 px between a title and the tallest bar.
- Notification/app text overflows silently (canvas clips at the card edge): keep lines ≤ ~24 characters at 0.055·w.
- Small rings centred on people's chests read as targets/buttons; put sound rings at the hands or high above the crowd.
- `make_story.py`'s per-second HUD loop hung on float equality (`int(a − CLAP)` stuck at the boundary): step an integer counter.
- Audio: the five new synth sounds (`hand_clap`, `mass_clap` = the whole planet's clap with a rolling thunder tail, `phone_buzz`,
  `gull_cry`, `shutter`) live at the end of synth.py; the masking warnings in the onset table (overlapping alarms, cries under the
  flock) are fine.
