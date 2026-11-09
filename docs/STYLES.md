# Style library — every animation look EDStudio can make, and how to add one

The Scribe promo operation (docs/lanes/scribe.md) pairs viral concepts with looks; @officialwriteit rotates several looks and the
user wants a bigger library (Nov 8 2026). Each look below is real, merged code with a template or a reference reel. Everything
stays procedural (Three.js → headless Chrome → ffmpeg), deterministic (`rng`, never `Math.random`), no downloads at render time.

| Style | Look | Engine | Start from | Reference reels | Status |
|---|---|---|---|---|---|
| **toy3d** | toy-like rig people, warm sets, many places (the what-if sims) | `engine/rig.js`, `engine/sets/*`, `engine/props.js` | `npm run new -- NNN-slug` (`videos/_template`) or `--from 042-bellybutton-portal` | 002, 020, 035, 042 | merged |
| **toon** (build) | big-headed toon cast, punchy 60 fps camera + kicks, one word at a time, ElevenLabs narrator | `engine/build/*` (toon.js, captions.js, rail.js, fx.js, anim.js) | `/new-build` (docs/BUILD.md); promo story kit: 049 | 039 (build), 049 (promo story), 050 (upgrade-every-day promo: `campus.js` + `dayhud.js`) | merged |
| **pixel** | any 3D scene rendered in chunky n×n blocks + mosaic cut transitions | `engine/pixel.js` (`addPixelPass`, `mosaicAt`), `engine/pixeltex.js` | `npm run new -- NNN-slug --from _pixel-template` | — | merged (a post pass, not a world) |
| **anime** (pixel) | a polished 2-D anime illustration (generated locally with Animagine XL 4.0, `tools/anime/gen.py`, CreativeML Open RAIL++-M) animated as a puppet in voxel sets under the pixel pass | `engine/puppet.js`, `engine/sets/voxbeach.js` (branch `feat/goth-tutor`) | — | 054 (in progress; replaced a procedural cel-shaded model the user rejected) | building |
| **sim** | Sims-like realistic 3D: realistic proportions, cutaway house/ground slab, clean daylight (@officialwriteit's hit look) | `engine/sim/` (to build) | `videos/_sim-template` (to build) | 052 | building |
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
