# Style library — every animation look EDStudio can make, and how to add one

The Scribe promo operation (docs/lanes/scribe.md) pairs viral concepts with looks; @officialwriteit rotates several looks and the
user wants a bigger library (Nov 8 2026). Each look below is real, merged code with a template or a reference reel. Everything
stays procedural (Three.js → headless Chrome → ffmpeg), deterministic (`rng`, never `Math.random`), no downloads at render time.

| Style | Look | Engine | Start from | Reference reels | Status |
|---|---|---|---|---|---|
| **toy3d** | toy-like rig people, warm sets, many places (the what-if sims) | `engine/rig.js`, `engine/sets/*`, `engine/props.js` | `npm run new -- NNN-slug` (`videos/_template`) or `--from 042-bellybutton-portal` | 002, 020, 035, 042 | merged |
| **toon** (build) | big-headed toon cast, punchy 60 fps camera + kicks, one word at a time, ElevenLabs narrator | `engine/build/*` (toon.js, captions.js, rail.js, fx.js, anim.js) | `/new-build` (docs/BUILD.md); promo story kit: 049 | 039 (build), 049 (promo story) | merged |
| **pixel** | any 3D scene rendered in chunky n×n blocks + mosaic cut transitions | `engine/pixel.js` (`addPixelPass`, `mosaicAt`), `engine/pixeltex.js` | `npm run new -- NNN-slug --from _pixel-template` | 057 (homework doubling) | merged (a post pass, not a world) |
| **anime** (pixel) | cel-shaded goth anime tutor + pixel pass | `engine/goth.js` (branch `feat/goth-tutor`) | — | 054 (in progress) | building |
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

