# EDStudio — instructions for AI agents (Claude Code, etc.)

You are making **faceless emotional 3D story Reels** (1080×1920, 45–80 s) in the style of @tinyplanetlab:
toy-like characters, warm night lighting, a counter on screen, a time skip, a gut-punch ending.
Everything is procedural code: **Three.js scene → headless Chrome → ffmpeg**. No paid tools, no downloads at render time.

Read `docs/FORMAT.md` (the style bible) before writing any story. `schedule/` has the 30-day plan of concepts.

## One video = one folder
```
videos/NNN-slug/
  story.json   text layer: title, TOLD BY tag, HUD counter segments, subtitles, dips, end card, timing
  shots.js     3D layer: SHOTS (time ranges), CAMS (camera moves), pose functions, build()/update(t)
  cues.json    audio cue sheet (SFX + music sections) -> audio/synth.py -> audio.wav
  caption.md   Instagram caption
  final.mp4    the deliverable (committed)
```
`videos/001-bedroom-door/` is the complete reference video. `videos/_template/` is a minimal 10 s working example.

## The pipeline (exact commands, from the repo root)
1. **Setup (once):** `npm install` then `npm run doctor`. Fix every ❌.
2. **Scaffold:** `npm run new -- 002-short-slug` (or `--from 001-bedroom-door` to fork the reference).
3. **Write `story.json`** — keep the format rules in docs/FORMAT.md. Timings are seconds.
4. **Write `shots.js`** — reuse sets in `engine/sets/`, characters from `engine/rig.js`, props from `engine/props.js`.
5. **Iterate with stills (most important loop):**
   `node tools/render.mjs 002-short-slug --stills 1,4.5,8,12,...` then `node tools/sheet.mjs 002-short-slug`,
   then **open `videos/002-short-slug/stills/_sheet.jpg` and actually look at it**. Fix framing, blocking, lighting, then re-render.
   Bird's-eye debug: add `--cam top` (shows where light lands and where people stand). Check every shot + every prop handoff.
6. **Audio:** write `cues.json`, run `python3 -I audio/synth.py 002-short-slug` → `videos/002-short-slug/audio.wav`.
7. **Full render:** `node tools/render.mjs 002-short-slug` → `out/silent.mp4` + `final.mp4` (audio muxed, size-capped for GitHub/IG).
   Draft first if unsure: `--preview` (15 fps, half size).
8. **QC** with the checklist at the bottom, write `caption.md`, commit `story.json shots.js cues.json caption.md final.mp4`.

## Engine cheat sheet
- `engine/core.js`: `K(t, [[t0,v0],[t1,v1]])` keyframes (eased), `walkLegs(t, start, [{t0,t1,pts}])` → {x,z,head,dist,speed},
  `faceToward(x,z,tx,tz)`, `lerpAngle`, `win(t,a,b)`, `rng(seed)` (**never Math.random / Date — renders must be deterministic**),
  `mat(color, roughness)`, `mk(geo, mat, parent, x,y,z)`, `canvasTex(w,h,draw)`. `createStudio` = renderer + bloom + grade + camera fill light.
- `engine/rig.js`: `makePerson({skin, top, collar, pants, hair, hairStyle:'bob'|'short'|'messy', glasses})`, `basePose()`,
  `applyPose(rig, pose)`, `handWorld(rig, -1|1)`, `blink(t)`, `makeSleeper({r, hairStyle, beanie})` (head on pillow; body = blanket bump).
  Pose fields: `x,z,y,rotY,dist,speed,lean,crouch,footFwd,headPitch/Yaw/Roll, armA/armB {sx,sz,el,twist,free}, smile, eyes, tear, glasses`.
  Model faces +z; `rotY = PI/2` faces +x. armA = figure's local −x arm. `sx<0` swings the arm forward, `el<0` bends the elbow,
  `sz>0` raises it outward. Hand-on-chest (armB): `{sx:-0.05, sz:0.2, el:-2.0, twist:-0.9}` (mirror twist for armA).
  Sitting: `y:-0.22, footFwd:0.4`. Crouch to the floor: `crouch:0.34, lean:0.6`. Props follow hands via `handWorld()` — precompute
  grab/release positions at build time (see 001 `handAt`).
- `engine/props.js`: `Blanket` (drapes over a mattress + body bump; animate `zHead` to "tuck"), `makeBunny`, `makePhone`, toys, boxes, fabric textures.
- `engine/sets/bedroom.js`: child bedroom + hallway. `setDoor(θ)` (1.25 = open), lamp, nightlight, christmas lights,
  `setSeason('summer'|'autumn'|'winter'|'rain'|'xmas', t)` for the window, dust motes in the door beam, era decor groups.
  **New sets:** copy bedroom.js's structure into `engine/sets/<name>.js` (kitchen, porch, car, living room…); export `DIMS` + handles.
- `engine/sky.js`: painted night skies + weather particles.

## User's taste (direct feedback — non-negotiable)
- **Persistent text stays out of the way.** The HUD is small, top-left, and dims when idle (brightens only when the number changes).
  Never put persistent text in the middle of the frame or over faces/action. Subtitles sit in the lower third with a subtle shadow.
- **Sound is minimal and soft.** Piano-led, few quiet low-passed foley hits only on story beats. No ticks/whooshes/chimes.
  See `audio/README.md` → House style. If anything sounds harsh, cut it rather than fix it.
- Reference accounts: `docs/FORMAT.md` (@tinyplanetlab) and `docs/reference/*.md` (other accounts the user likes).

## Hard-won rules (each one cost a debugging round)
- **Look at stills before every full render.** A full render is ~3–6 min; a still sheet is ~30 s.
- **Never append code after a `//` comment on the same line** when editing with scripts/sed — it silently comments the code out
  (that once deleted the main light). Re-render stills after every batch of edits.
- **Doors/furniture must not block the camera or the key light.** The bedroom door swings out into the hallway for this reason.
  Use `--cam top` to verify. People standing in the hallway stay at z > 0.25 (outside the door's swing arc).
- **Black rectangles** = NaN pixels smeared by bloom. core.js scrubs them, but also fix the source (degenerate normals: clamp them).
- **Faces need light:** the camera carries a soft fill (story.look.fill, default 0.5). Backlit silhouettes are fine in doorways.
- **Text safe zones:** title in the top 25 %, HUD top-left (y≈470, never right side — IG buttons), subtitles y≈1340, nothing below y≈1450.
- **Claude Code sandbox:** headless Chrome and `git` writes into `.git/` are blocked by the macOS sandbox → run those commands
  with the sandbox disabled. `npm install` needs `--cache ./.npm-cache` inside the sandbox.
- GitHub rejects files > 100 MB: `final.mp4` is encoded at ~6 Mbps (≈45 MB / min). Don't commit `out/` or `stills/`.

## QC checklist (all must pass before committing final.mp4)
- [ ] Frame 1 is a hook: title readable, scene legible, something already slightly wrong/curious.
- [ ] Every subtitle readable (≥ 0.3 s per word), never over a face, never overlapping the HUD.
- [ ] HUD numbers are correct math and change across the time skip; final value lands with the emotional beat.
- [ ] No character clips through doors/furniture; props stay in hands; no popping between shots unless it's a cut.
- [ ] No black blocks, flicker, or blown-out white areas behind text.
- [ ] Audio: minimal + soft (house style), the few cues land on actions, music swells at the reveal, ends clean; ≈ −15 LUFS.
- [ ] Duration matches story.json; 1080×1920, 30 fps, H.264 + AAC, < 100 MB.
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", exactly 5 hashtags incl. #animation.
