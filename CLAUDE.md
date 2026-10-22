# EDStudio — instructions for AI agents (Claude Code, etc.)

You are making **faceless 3D story Reels** (1080×1920, 45–80 s) in several tones (all listed in `docs/TONES.md`):
- **emotional** (@tinyplanetlab style, `videos/001-bedroom-door`): toy-like characters, warm night lighting, a counter, a time skip, a gut-punch ending.
- **funny** ("What if…" crowd sims, `videos/002-everyone-pregnant`): a named everyman + a crowd in sync, deadpan subtitles, one gag per era, a warm last beat.
- **world** (planet-scale thought experiments, `videos/005-no-nukes`): hologram globe whose dots are the HUD number, real sourced facts, a debate-question end card (`docs/WORLD-WHATIF.md`).
- **whatif** (global "What if everyone…" ripple ladder, `videos/006-memory-loss`): one consequence per place, time-stamped in the HUD
  (SECOND 0 → +1 YEAR), many sets/cities, sound-design-led audio, a small human beat to end on.
Set `"tone"` in story.json and follow **`docs/TONES.md`** for what changes between them. **Pick the harness per concept** (user steer): global what-ifs show the
ripple in many places; don't carry them on one character (003 was felt to be too single-angle).
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
- `engine/sets/city.js` (004): night toy city — main street + intersection, ~48 blocks out to a downtown skyline, a rooftop
  (`DIMS.roof`, `ROOF_Y`), `makeCar(color)` (`setLights`, `setRust`). Controls: `setTime({day, golden, milky, moon})`,
  `setPower(1→0)` (blackout far→near, streetlamps last), `setGrowth(0..1)` (grass, trees in the road, vines, cracks),
  `setSnow`, `setWeather(t, season)` (roof only), `setSignal('red'|'yellow'|'green'|'off')`, `setAnswer(v, glow)` (one lit window
  in a far tower, sight line kept clear), `setShadowFocus(x, z, half)` per shot. Video must set `camera.far ≈ 1500`.
  People on the roof: put the rig in a carrier group at `y = ROOF_Y` (or use `floor`); never `pose.y = 16` (the leg IK reaches for y=0).
- `engine/props.js` `makeFlashlight({length, radius})`: `aim(pos, target)`, `setOn(v, beamOpacity)`. The beam is a shader cone
  (fades along its length) — a texture gradient on an open cone read as a solid grey tube with an end cap.
- **Two sets in one video:** build both, toggle `set.root.visible` per section (hidden lights don't render). See 003.
- `engine/globe.js` (world-scale what-ifs): `makeGlobe({r})` hologram Earth (Natural Earth borders baked in `engine/data/world110.js`,
  no network), `makeDots(globe, [{lat,lon}])` instanced glowing dots (`set(i, scale)`/`setAll(fn)` + `commit()`; 12k+ is fine),
  `makeBars` (glowing columns), `scatter(rng, sites, n)`, `faceLon(lon)`. `engine/sets/warroom.js`: round war room + table + globe
  (`setGlobeLight`) and a launch capsule (`buildCapsule`, `setPanel(lit)`). Playbook: **docs/WORLD-WHATIF.md** (reference: 005).
- `engine/sets/military.js` (005): `buildSilo` (missile `setDissolve(t, t0, t1)`: clipping plane + rising embers), `buildBase`
  (parade ground, 30 `soldiers`, hangar, 4 `tanks`), `buildBorder` (dusk border post, barrier, one `guard`, tank row on a ridge
  `setTanksAdvance`), `buildPlant` (cooling towers + steam, `update(t, day)` time-lapse), `makeTank`, `makeSoldier`, `makeSkyDome`.
  Each builder returns its own `root` at the origin; the video shows one per shot and sets `scene.fog` per shot (city only).
- **Fog + far plane per set:** street and city each set `scene.fog` + `camera.far`: save each set's fog right after building it
  and swap fog/far/exposure per shot (006 `useSet`). Call `city.setTime/setPower` and `street.setSeason` only while their fog is active.

## User's taste (direct feedback — non-negotiable)
- **Opening = the main question alone, centered in the middle of the screen** (story.json `title`, ~3–3.6 s). No HUD, no
  subtitles, no other text while it's up (the engine hides them until `title.out`). Then the story begins.
- **Never use a "TOLD BY YOUR ___" tag or any other subtext/tagline.** The engine no longer supports `tag`; don't add one.
- **Persistent text stays out of the way.** The HUD is small, top-left, and steady.
  Never put persistent text in the middle of the frame or over faces/action. Subtitles sit in the lower third. **All text has a strong shadow + a soft dark backdrop** (engine/index.html) so it reads over bright areas — never remove it.
- **Every video type gets its own sound identity — EDStudio makes sims of all kinds, not only nostalgia** (user steer after 002 sounded
  like 001). Pick the voice for the tone: emotional = soft piano; funny = bouncy piano; montage/science/tech = synth plucks + echo
  (`music.instrument: "pluck"|"bell"`) and **immersive scene sound design** (traffic, chalk, applause, rocket, wind) — successful sim
  accounts are often SFX-led with little or no music. Never harsh: everything low-passed, no ear-piercing highs, no ticks/whooshes/chimes.
  See audio/README.md → Sound identity. Don't reuse the previous video's progression/voice unchanged.
- **The music is continuous — it never cuts out** once it has started (no hard rests/ducks for comedic timing; gentle −4 dB dips at
  most). `audio/synth.py` now prints `music dropouts: none` (or the first gap) in its self-check — it must say none.
  See `audio/README.md` → House style. If anything sounds harsh, cut it rather than fix it.
- Reference accounts: `docs/FORMAT.md` (@tinyplanetlab) and `docs/reference/*.md` (other accounts the user likes, incl. whatiflab.md).
- **The end card must stay up long enough to read:** fully visible for **≥ 3.5 s** (set `duration ≥ end.in + 4.0`).
  001 shipped with ~1 s and the user called it out. `tools/render.mjs` warns when it's too short.
- **Tone is per video** (emotional / funny / world / montage / whatif, `docs/TONES.md`). Funny still means minimal/soft sound and kind humor.
  **Each tone has its own vibe and harness — only emotional videos sound sad/nostalgic.** Never copy 001's cue sheet into
  another tone (user, on 005's first score: "why is the music sad… it doesn't fit"). World what-ifs = curious explainer
  energy (mallet ostinato, major/lydian, driving pulse, open ending) — see audio/README.md.
- **Scene variety (all videos):** cut between many distinct locations, and **show what each subtitle says** — "countries build
  armies" → soldiers marching, tanks leaving a hangar; never keep returning to one set (user, on 005's first cut). Plan 4+
  locations per video; reuse `engine/sets/*` from earlier videos (they can all live in one scene, one `root` visible per shot).
- **Sound-design-led mixes are allowed** (user noticed top what-if accounts often skip music): places carry the sound (crowd,
  traffic, room tone, a far horn), a pad bed ~9 dB under the ambience, piano only for the ending. Still soft. See audio/README.md.

- **No flickering, pulsing, dimming or popping text.** Every text element fades in once and out once; the HUD stays at a steady
  opacity the whole time (numbers may roll, nothing else changes). Anything that blinks or breathes is distracting.

## Hard-won rules (each one cost a debugging round)
- **Look at stills before every full render.** A full render is ~3–6 min; a still sheet is ~30 s.
- **Real-world facts must be current and sourced** (web-search the latest edition: SIPRI/IISS/IAEA/UN…); cite in the shots.js header +
  a comment in caption.md. 005's first draft used last year's warhead total.
- **Emissive "screens/holograms" use Lambert or Basic materials**, not Standard: a warm key light gives a Standard material's dark
  areas a tan specular haze (005's globe oceans turned brown).
- **Hide characters that would only appear as cropped heads** at a frame edge in close-ups (set `root.visible` per shot).
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
- **Montage across many locations (007):** build several sets in one scene and park each set's `root` at its own offset
  (`OFF = {street: [1500,0,0], cls: [3000,0,0], …}`), then per shot show only that root (hidden roots also switch off their lights),
  swap `scene.fog` to that set's fog (save `scene.fog` right after each build — builders overwrite it), and set `camera.far`.
  **city.js must stay at the origin** (its sky domes follow the camera in world space). Add OFF to every character + camera position
  (camera coords in CAMS stay local to the set). Hide extras with `root.visible=false` and re-place them per shot.
- Outdoor sets: `studio.camera.far` defaults to 80 m — street.js raises it to 400 (sky dome + skyline). Raise it in any big set.
- Keep crowd extras out of the lens between the camera and the hero (check the frames where the hero walks — 002's market shot
  hid Gary behind a watcher). Hide set props per shot when they clutter a long lens (002 hides the cart in the queue shot).
- **Frame the hero by bearing, not by eye** (004 lost the hero off-frame twice): a vertical 50° fov is only ±15° wide. Put the camera
  behind the hero along their facing line (3–4 m back, ~1 m to the side) and aim ≤ 10° off that line; check that no parked car
  sits on the camera path (004's day shot started *inside* a car).
- Big painted skies on a 700 m dome need 4096-px textures and soft round stars (2-px squares showed as a grid at fov 50; big stars read as snow).
- **After resolving a merge in a shared file, run `node --check`** (copy to `.mjs` first). Two sessions appending to props.js lost a
  closing brace in the merge. Also `git fetch` + `ls .claude/worktrees` before picking NNN — numbers get claimed in worktrees before they're pushed.
- **Readable props (phone screens, posters, signs)** must sit in the clear band: ≈38–65 % of frame height and right of x≈40 %,
  so the HUD (top-left) and subtitles (≈70 %) never cover their text. Phones read best as a POV shot: camera 0.17 m in front of
  the face, aimed at the screen (006). Keep any line of card text above the subtitle band.
- GitHub rejects files > 100 MB: `final.mp4` is encoded at ~6 Mbps (≈45 MB / min). Don't commit `out/` or `stills/`.

## QC checklist (all must pass before committing final.mp4)
- [ ] Opening is ONLY the main question, centered, ~3 s; no tag/subtext anywhere; first subtitle starts after title.out.
- [ ] Every subtitle readable (≥ 0.3 s per word), never over a face, never overlapping the HUD.
- [ ] HUD numbers are correct math and change across the time skip; final value lands with the emotional beat.
- [ ] No character clips through doors/furniture; props stay in hands; no popping between shots unless it's a cut.
- [ ] No black blocks or flicker; no text opacity/scale pulsing (scrub the HUD across a roll to check); every text block clearly readable (shadow + backdrop present, nothing blown-out behind it).
- [ ] Audio: minimal + soft (house style), the few cues land on actions, music swells at the reveal, ends clean; ≈ −15 LUFS;
      the music never drops out mid-video (no 50 ms window of the music stem > 10 dB under its median, see audio/README.md).
- [ ] End card fully visible ≥ 3.5 s before the video ends (no render warning).
- [ ] Duration matches story.json; 1080×1920, 30 fps, H.264 + AAC, < 100 MB.
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", exactly 5 hashtags incl. #animation.
