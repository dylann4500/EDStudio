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
| **sim** | Sims-like realistic 3D: realistic proportions, cutaway house/ground slab, clean daylight (@officialwriteit's hit look) | `engine/sim/` (person.js, house.js, props.js, mats.js, look.js, hud.js) | `npm run new -- NNN-slug --from _sim-template` (narrated: `--from 052-bedroom-never-leave`) | 052 | built (branch `claude/052-sim-style-bedroom-d80346`) |
| **flat2d** | flat 2D cartoon: thick black outlines, flat colour, big heads, bold labels | `engine/flat2d/` (to build) | `videos/_flat2d-template` (to build) | 053 | building |

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
- Arms crossed with rig.js presets: `A(-0.42, 0.1, -1.7, 1.3)` + `A(-0.55, 0.1, -1.6, -1.3)` (the hand-on-chest pair read as prayer hands).
**Render time:** ~0.10 s per frame at 1080×1920, 30 fps, motionBlur 1 (≈ 3 s per second of video; 052's 52.9 s ≈ 2.7 min on an M5 Pro).

