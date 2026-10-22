# EDStudio — instructions for AI agents (Claude Code, etc.)

You are making **faceless 3D story Reels** (1080×1920, 45–80 s) in two tones:
- **emotional** (@tinyplanetlab style, `videos/001-bedroom-door`): toy-like characters, warm night lighting, a counter, a time skip, a gut-punch ending.
- **funny** ("What if…" crowd sims, `videos/002-everyone-pregnant`): a named everyman + a crowd in sync, deadpan subtitles, one gag per era, a warm last beat.
Set `"tone"` in story.json and follow **`docs/TONES.md`** for what changes between them.
Every video OPENS with only the main question, centered on screen, nothing else — then the story starts.
Everything is procedural code: **Three.js scene → headless Chrome → ffmpeg**. No paid tools, no downloads at render time.

Read `docs/FORMAT.md` (the style bible) and `docs/TONES.md` before writing any story. `schedule/` has the 30-day plan of concepts.

**Keep the harness current (user request).** Whenever you learn something, hit a bug, add an engine feature, or the user steers
you, write it down where the next agent will find it — this file (rules/cheat sheet), `docs/TONES.md` / `docs/FORMAT.md` (style),
`audio/README.md` (sound), `.claude/commands/new-video.md` (the workflow). Short, concrete, with the *why*.

## One video = one folder
```
videos/NNN-slug/
  story.json   text layer: opening title (the question), HUD counter segments, subtitles, dips, end card, timing
  shots.js     3D layer: SHOTS (time ranges), CAMS (camera moves), pose functions, build()/update(t)
  cues.json    audio cue sheet (SFX + music sections) -> audio/synth.py -> audio.wav
  caption.md   Instagram caption
  final.mp4    the deliverable (committed)
```
`videos/001-bedroom-door/` (emotional) and `videos/002-everyone-pregnant/` (funny, outdoor crowd) are complete reference videos.
`videos/_template/` is a minimal 10 s working example.

## The pipeline (exact commands, from the repo root)
1. **Setup (once):** `npm install` then `npm run doctor`. Fix every ❌.
2. **Scaffold:** `npm run new -- 002-short-slug` (or `--from 001-bedroom-door` to fork the reference).
3. **Write `story.json`** — keep the format rules in docs/FORMAT.md. Timings are seconds.
4. **Write `shots.js`** — reuse sets in `engine/sets/`, characters from `engine/rig.js`, props from `engine/props.js`.
5. **Iterate with stills (most important loop):**
   `node tools/render.mjs 002-short-slug --stills 1,4.5,8,12,...` then `node tools/sheet.mjs 002-short-slug`,
   then **open `videos/002-short-slug/stills/_sheet.jpg` and actually look at it**. Fix framing, blocking, lighting, then re-render.
   Bird's-eye debug: add `--cam top` (shows where light lands and where people stand). Check every shot + every prop handoff.
   `--stills` clears old stills first (pass `--keep` to add to them), so the sheet is always just this batch.
   **Pose lineup trick** (002 `lineup()`): make `update(t)` render a debug lineup for t ≥ 200 (each arm preset on its own figure,
   overlay hidden) and render `--stills 200,201,…` — tune arm poses there, not inside the story shots.
6. **Audio:** write `cues.json`, run `python3 -I audio/synth.py 002-short-slug` → `videos/002-short-slug/audio.wav`.
7. **Full render:** `node tools/render.mjs 002-short-slug` → `out/silent.mp4` + `final.mp4` (audio muxed, size-capped for GitHub/IG).
   Draft first if unsure: `--preview` (15 fps, half size).
8. **QC** with the checklist at the bottom, write `caption.md`, commit `story.json shots.js cues.json caption.md final.mp4`.

## Engine cheat sheet
- `engine/core.js`: `K(t, [[t0,v0],[t1,v1]])` keyframes (eased), `walkLegs(t, start, [{t0,t1,pts}])` → {x,z,head,dist,speed},
  `faceToward(x,z,tx,tz)`, `lerpAngle`, `win(t,a,b)`, `rng(seed)` (**never Math.random / Date — renders must be deterministic**),
  `mat(color, roughness)`, `mk(geo, mat, parent, x,y,z)`, `canvasTex(w,h,draw)`. `createStudio` = renderer + bloom + grade + camera fill light.
- `engine/rig.js`: `makePerson({skin, top, collar, pants, hair, hairStyle:'bob'|'short'|'messy'|'none', glasses, mustache: color, headR})`, `basePose()`,
  `applyPose(rig, pose)`, `handWorld(rig, -1|1)`, `blink(t)`, `makeSleeper({r, hairStyle, beanie})` (head on pillow; body = blanket bump).
  Pose fields: `x,z,y,rotY,dist,speed,lean,crouch,footFwd,headPitch/Yaw/Roll, armA/armB {sx,sz,el,twist,free}, smile, eyes, tear, glasses`,
  plus `belly` (0–1.6 pregnancy bump; free arms splay around it), `waddle` (0–1 penguin sway, use with `lean<0`),
  `mouth: 'smile'|'flat'|'o'` (overrides `smile`), `floor` (ground height under the feet — **set it to the sidewalk height when
  standing/sitting on a raised surface**, or the leg IK reaches for y=0 and sitting reads as standing).
  Rig parts for props/tints: `rig.spine`, `rig.arms[].hand` (parent props to them), `rig.mats.skin/faceSkin` (e.g. green = nausea).
  Twist sign: the forearm bends toward +z rotated by `twist`; for armB (+x side) **negative twist = inward**, armA mirrors it.
  Tested arm presets live at the top of 002 shots.js (belly, lower back, hand-to-mouth, hug, cradle a baby, phone at ear, "calm down").
  Model faces +z; `rotY = PI/2` faces +x. armA = figure's local −x arm. `sx<0` swings the arm forward, `el<0` bends the elbow,
  `sz>0` raises it outward. Hand-on-chest (armB): `{sx:-0.05, sz:0.2, el:-2.0, twist:-0.9}` (mirror twist for armA).
  Sitting (floor at 0): `y:-0.22, footFwd:0.4`; on the street bench: `y:-0.185, floor:SIDEWALK_H, footFwd:0.42`. Crouch to the floor: `crouch:0.34, lean:0.6`. Props follow hands via `handWorld()` — precompute
  grab/release positions at build time (see 001 `handAt`).
- `engine/props.js`: `Blanket` (drapes over a mattress + body bump; animate `zHead` to "tuck"), `makeBunny`, `makePhone`, toys, boxes, fabric textures,
  `makeBabyBundle`, `makePickleJar`, `makeIceCreamTub`, `makeHotDog`.
- `engine/sets/bedroom.js`: child bedroom + hallway. `setDoor(θ)` (1.25 = open), lamp, nightlight, christmas lights,
  `setSeason('summer'|'autumn'|'winter'|'rain'|'xmas', t)` for the window, dust motes in the door beam, era decor groups.
  **New sets:** copy bedroom.js's structure into `engine/sets/<name>.js` (kitchen, porch, car, living room…); export `DIMS` + handles.
- `engine/sets/street.js`: sunny toy-city street (both sides built, hazy skyline, sky dome, fog). Storefronts: HOSPITAL, CAFÉ +
  RESTROOM door, MARKET ("PICKLES SOLD OUT" poster), hot-dog cart, bench, trash can (`DIMS.spots`). `aimSun(cx, cz, half)` per shot
  (sharp shadows where the action is), `setSeason('spring'|'summer'|'autumn'|'winter', t, center)` (leaf color, bare trees, snow).
  Everyone on the sidewalk stands at `y = floor = SIDEWALK_H`. Vertical frames are narrow (~3 m wide at 6 m): shoot crowds
  side-on from across the street, or along the sidewalk with a long lens (fov 30–40).
- `engine/sky.js`: painted night skies + weather particles.
- `engine/sets/classroom.js`: sunny kindergarten (Room 4), 24 desks (`DIMS.desks`), chalkboard `setBoard(text)`, clock, seasonal schoolyard
  `setSeason('autumn'|'winter'|'spring'|'summer')`, `setChairsUp(bool)`, `setAbandoned(0..1)`, door into the room `setDoor(1.8)`.
- **Kids:** `makePerson({headR: 0.175, ...})` + `rig.root.scale.setScalar(0.62)`. Walking: pass `dist/scale`. Sitting: after `applyPose`,
  set `root.position.y = pose.y * scale` (else feet float). See 003 `applyScaled`.
- **Two sets in one video:** build both, toggle `set.root.visible` per section (hidden lights don't render). See 003.

## User's taste (direct feedback — non-negotiable)
- **Opening = the main question alone, centered in the middle of the screen** (story.json `title`, ~3–3.6 s). No HUD, no
  subtitles, no other text while it's up (the engine hides them until `title.out`). Then the story begins.
- **Never use a "TOLD BY YOUR ___" tag or any other subtext/tagline.** The engine no longer supports `tag`; don't add one.
- **Persistent text stays out of the way.** The HUD is small, top-left, and steady.
  Never put persistent text in the middle of the frame or over faces/action. Subtitles sit in the lower third. **All text has a strong shadow + a soft dark backdrop** (engine/index.html) so it reads over bright areas — never remove it.
- **Sound is minimal and soft.** Piano-led, few quiet low-passed foley hits only on story beats. No ticks/whooshes/chimes.
  See `audio/README.md` → House style. If anything sounds harsh, cut it rather than fix it.
- Reference accounts: `docs/FORMAT.md` (@tinyplanetlab) and `docs/reference/*.md` (other accounts the user likes, incl. whatiflab.md).
- **The end card must stay up long enough to read:** fully visible for **≥ 3.5 s** (set `duration ≥ end.in + 4.0`).
  001 shipped with ~1 s and the user called it out. `tools/render.mjs` warns when it's too short.
- **Tone is per video** (funny or emotional, `docs/TONES.md`). Funny still means minimal/soft sound and kind humor.

- **No flickering, pulsing, dimming or popping text.** Every text element fades in once and out once; the HUD stays at a steady
  opacity the whole time (numbers may roll, nothing else changes). Anything that blinks or breathes is distracting.

## Hard-won rules (each one cost a debugging round)
- **Look at stills before every full render.** A full render is ~3–6 min; a still sheet is ~30 s.
- **Never append code after a `//` comment on the same line** when editing with scripts/sed — it silently comments the code out
  (that once deleted the main light). Re-render stills after every batch of edits.
- **Doors/furniture must not block the camera or the key light.** The bedroom door swings out into the hallway for this reason.
  The classroom door swings flat against the inside wall instead, so the camera sees people come through the opening (003).
  Use `--cam top` to verify. People standing in the hallway stay at z > 0.25 (outside the door's swing arc).
- **`Blanket` only drapes toward +z** (it needs `zHead > zFoot`). The bedroom bed's foot is at +z, so `zFoot: B.z1` gives a hanging sheet
  instead of a blanket (001 has this bug). Fix per video: `blanket.mesh.scale.z = -1` and pass negated z's (zFoot 0.5, zHead 1.93, body zA/zB > 0).
- **Black rectangles** = NaN pixels smeared by bloom. core.js scrubs them, but also fix the source (degenerate normals: clamp them).
- **Faces need light:** the camera carries a soft fill (story.look.fill, default 0.5). Backlit silhouettes are fine in doorways.
- **Text safe zones:** opening title centered (alone), HUD top-left (y≈470, never right side — IG buttons), subtitles y≈1340, nothing below y≈1450.
- **Claude Code sandbox:** headless Chrome and `git` writes into `.git/` are blocked by the macOS sandbox → run those commands
  with the sandbox disabled. `npm install` needs `--cache ./.npm-cache` inside the sandbox.
- **Parallel sessions:** more than one agent may work in this repo at once. Do your video in its own git worktree/branch
  (`git worktree add -b video/NNN-slug ../EDStudio-NNN main`, symlink `node_modules` into it — never commit the symlink),
  take the next free NNN, keep engine changes additive (new options, unchanged defaults), and merge to main when done.
- Outdoor sets: `studio.camera.far` defaults to 80 m — street.js raises it to 400 (sky dome + skyline). Raise it in any big set.
- Keep crowd extras out of the lens between the camera and the hero (check the frames where the hero walks — 002's market shot
  hid Gary behind a watcher). Hide set props per shot when they clutter a long lens (002 hides the cart in the queue shot).
- GitHub rejects files > 100 MB: `final.mp4` is encoded at ~6 Mbps (≈45 MB / min). Don't commit `out/` or `stills/`.

## QC checklist (all must pass before committing final.mp4)
- [ ] Opening is ONLY the main question, centered, ~3 s; no tag/subtext anywhere; first subtitle starts after title.out.
- [ ] Every subtitle readable (≥ 0.3 s per word), never over a face, never overlapping the HUD.
- [ ] HUD numbers are correct math and change across the time skip; final value lands with the emotional beat.
- [ ] No character clips through doors/furniture; props stay in hands; no popping between shots unless it's a cut.
- [ ] No black blocks or flicker; no text opacity/scale pulsing (scrub the HUD across a roll to check); every text block clearly readable (shadow + backdrop present, nothing blown-out behind it).
- [ ] Audio: minimal + soft (house style), the few cues land on actions, music swells at the reveal, ends clean; ≈ −15 LUFS.
- [ ] End card fully visible ≥ 3.5 s before the video ends (no render warning).
- [ ] Duration matches story.json; 1080×1920, 30 fps, H.264 + AAC, < 100 MB.
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", exactly 5 hashtags incl. #animation.
