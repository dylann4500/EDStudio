# EDStudio — instructions for AI agents (Claude Code, etc.)

You are making **faceless 3D story Reels** (1080×1920, 45–80 s) in several tones (all listed in `docs/TONES.md`):
- **emotional** (@tinyplanetlab style, `videos/001-bedroom-door`): toy-like characters, warm night lighting, a counter, a time skip, a gut-punch ending.
- **funny** ("What if…" crowd sims, `videos/002-everyone-pregnant`): a named everyman + a crowd in sync, deadpan subtitles, one gag per era, a warm last beat.
- **world** (planet-scale thought experiments, `videos/005-no-nukes`): hologram globe whose dots are the HUD number, real sourced facts, a debate-question end card (`docs/WORLD-WHATIF.md`).
- **whatif** (global "What if everyone…" ripple ladder, `videos/006-memory-loss`): one consequence per place, time-stamped in the HUD
  (SECOND 0 → +1 YEAR), many sets/cities, sound-design-led audio, a small human beat to end on.
- **biography** ("The story of [Name]", `videos/009-abe-lincoln`) — **its own category: follow `docs/BIOGRAPHY.md` and
  `/new-biography`**. A narrator tells one real life birth → death in full connected sentences; `tools/biography.py` turns a
  beat table (`script.json`) into story.json with shot lengths set by the narration. HUD = AGE + date + place.
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
  `makeSearchBubble({query, history, width, maxChars, offX})` (008): camera-facing search card (sprite) with optional history rows;
  put `sprite.position` on top of a head each frame (008 `stick()`), `setRows(n)` reveals rows, `setPop(k)` scales it (boing pop).
- `engine/sets/bedroom.js`: child bedroom + hallway. `setDoor(θ)` (1.25 = open), lamp, nightlight, christmas lights,
  `setSeason('summer'|'autumn'|'winter'|'rain'|'xmas', t)` for the window, dust motes in the door beam, era decor groups.
  **New sets:** copy bedroom.js's structure into `engine/sets/<name>.js` (kitchen, porch, car, living room…); export `DIMS` + handles.
- `engine/sets/street.js`: sunny toy-city street (both sides built, hazy skyline, sky dome, fog). Storefronts: HOSPITAL, CAFÉ +
  RESTROOM door, MARKET ("PICKLES SOLD OUT" poster), hot-dog cart, bench, trash can (`DIMS.spots`). `aimSun(cx, cz, half)` per shot
  (sharp shadows where the action is), `setSeason('spring'|'summer'|'autumn'|'winter', t, center)` (leaf color, bare trees, snow).
  Everyone on the sidewalk stands at `y = floor = SIDEWALK_H`. Vertical frames are narrow (~3 m wide at 6 m): shoot crowds
  side-on from across the street, or along the sidewalk with a long lens (fov 30–40).
- `engine/sets/mars.js` (007): Mars terrain + mesas, butterscotch sky (blue dusk), landing pad (`DIMS.pad`), lander + `setDust(age)`,
  and a colony that builds itself: `setBuild(0..1)` grows solar fields → glass domes (with houses/trees inside) → tubes → towers;
  `setDusk(0..1)` turns on the lights. Set `camera.far` ≥ 900.
- `engine/sets/suburb.js` (010): sunny bungalow street — `houses[i]` {door (hinge group: `rotation.y = 1.45` opens it), doorPos, drive,
  garage}, porches (top `DIMS.porchY`), mailboxes, picket fences, flower beds, power poles + wires (`opts.poleClear` x-list keeps
  them out of shots), a kid's bike, gnome, doghouse, far-curb cars, clouds, a pocket park with a two-half bench
  (`bench.userData.halves` → rotate `.z` ±0.55 to snap it), a driveway hoop (`hoop.rim` local). `aimSun(cx, cz, half)`, own `fog`.
- `engine/sets/supermarket.js` (010): 4 aisles of instanced products, `setStock(0..1)` (a time-lapse emptying in one call), `setSoldOut(v)`
  banners, checkouts, carts, produce bins, fluorescent panels. Ceiling 4.4 m (a 3.3 m giant still fits).
- `engine/props.js` (010): `makeBus({sign})` → `setSag(k)` (body sinks + rolls, tires squash), `setSign(text)`; `makeHoop()` (rim at
  3.05 m), `makeBasketball()`.
- **Giants / scaled people (010):** `rig.root.scale.setScalar(2)` and pose them with a helper that passes the ground in LOCAL units:
  `p.y = 0; p.floor = (groundY − rootY) / s; applyPose(); root.position.y = rootY` (010 `putG`). Sitting on something at height h:
  `rootY = h − s·(HIP_H − 0.17)`. Walking: `dist/s`, `speed/s`. A doubled person under a 2.7 m ceiling needs `crouch ≈ 0.3, lean ≈ 0.5`.
- `engine/sets/kitchen.js` (010): morning kitchen, fully dressed (counters, sink under a sunny window, stove + kettle, coffee maker, toaster,
  fruit bowl, fridge with magnets + a kid's drawing, table + 4 `chairs`, pendant lamp, wall clock `setClock(h,m)`, calendar, plants, rug).
- `engine/sets/plane.js` (010): economy cabin, 12 rows × 6 seats (`seatPos(row, col)`; passengers face +z), bins, oval windows with
  clouds, light strip, galley curtain. Hide the front row (`rows.slice(0,6)`) when the camera sits at the front.
- `engine/props.js` (010 v2): `makeDog()` (`update(t, speed)` trot + tail, `bark(k)`), `makeCeilingFan()` (`update(t, wobble)`),
  `makeMug(color)`. suburb.js houses now expose `porchRoof` (hinge group: `rotation.z −0.42` = collapsed).
- Crush a `makeCar` without squashing its wheels: scale `body.children[1]` (cab) + `[2]` (glass) in y, not `body`.
- `audio/synth.py` (010 v2): `snore`, `dog_bark` (soft boof), `slurp`, `cabin_hum` ambience.
- **New sets (012):** `podium.js` (press-briefing room: fictional seal, flags, lectern + mics, teleprompters, TV camera, press
  chairs, `setFlashes(t, rate)` = a storm of camera flashes), `pool.js` (sunny public pool: see-through rippling water `update(t)`,
  lane ropes, lifeguard tower `DIMS.tower`, deck chairs, umbrellas, snack hut; swimmers stand on `DIMS.floor` with shoulders at the
  surface), `office.js` (interview office: skyline windows, desk + laptop + HR nameplate, two chairs `DIMS.boss/guest`, shelf, poster),
  `laundromat.js` (washer/dryer wall with tumbling drums `update(t, spin)`, chairs, vending machine, neon OPEN 24H), `wedding.js`
  (garden arch, aisle + petals, chairs with bows, string lights, cake; `DIMS.bride/groom/officiant`). supermarket `setSoldOut(v, text)`
  auto-fits custom text.
- `addWetPatch(rig, {color})` (rig.js, 012) → `setWet(0..1)`: a darker glossy patch spreads over the crotch + thighs. Cartoon only —
  no liquid, ever. Give crowds LIGHT pants so it reads; a dressed figure gets a separate darker spot on `rig.dress`.
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
- `audio/synth.py` voices: piano (default), `mallet` (`ostinato` style), cinematic `strings` style, `drums`/`drum_patterns`
  (taiko, tom, boom), pad `notes` + `hp` for sub drones/braams. 005's `make_cues.py` uses all of the dramatic ones.
- 013 `shots.js` has reusable bits (copy them): `makeCrow(seed)` (`flap(k,t)`, hop/snatch/perch logic in `crowAt`), `makeJet()`
  (airliner, nose +z), **skywriting** (instanced contrail puffs revealed along a 2-D path in a vertical plane — a giant "?"), circling
  jets with trailing puffs, a desktop monitor whose screen swaps canvas textures (password field → scam popup) + an instanced
  money fountain, kid **two-sided signs** (two planes back to back = readable from the teacher's AND the camera's side), a
  tic-tac-toe hologram replacing the war-room globe, a press-room bell-curve screen, a leash (`TubeGeometry` on a bezier rebuilt
  per frame), a boomerang rocket (up → hover → lands back on its pad).
- `engine/sets/frontier.js` (009, early-1800s America): `buildCabin` (log cabin inside + snowy night outside, fire `update(t)`,
  `setExterior(v)` window glow), `buildWoods` (`setMode('summer'|'autumn'|'night')`, chopping stump + `chips`, half-built cabin,
  grave knoll `DIMS.woods.grave`, dirt road z=9 to a far lit cabin), `buildRiver` (sunset river, flatboat `boat` + `sweep`,
  New Orleans skyline, `update(t)` scrolls water), `buildStore` (general store, counter at z=-0.8). Props: `makeAxe`, `makeBook`,
  `makeOpenBook`, `makeLantern` ({g, light}), `makeCoin`, `makeTree(kind, leafMat, R)`, `makeRailFence(x0,z0,x1,z1)`.
- `engine/sets/capital.js` (009, mid-1800s): `buildRoom` (office/study: desk + paper `setSign(k)` reveals a signature, candle,
  rocker, flag, portrait, `setClock(h,m)`, `setMode('candle'|'day'|'dawn')`, `setWallpaper(c1,c2)`), `buildSquare` (speaking
  platform deck y=1.0 + lectern + 6 `chairs`, bunting, `setBanner(text)`, `setDress({town, cemetery, dome, banner, bunting})`,
  `setMode('summer'|'autumn'|'spring')`), `buildBattlefield` (`update(t, [[time, cannon]])` recoil + flash + smoke, `heightAt`),
  `buildTheatre` (stage + house + the flag-draped box, `DIMS.theatre.box`), `buildMemorial` (marble temple, pedestal + chair for a
  5.2× statue at z=-5.45 on top of `floorY + 3`). Props: `makeTopHat`, `makeDerby`, `makeBonnet`, `makeKepi`, `makeRifle`,
  `makeQuill`, `makeCannon`, `makeFlag(w,h,poleH)` (`update(t)` waves it), `usFlagTexture()`.
- `engine/sets/tech.js` (011, spaceflight/tech): `buildSpace` (starfield + textured Earth R=400 at the origin, clouds,
  atmosphere, `setSpin`, `focusShadow`, `makeStarlinkSwarm(n, alt)`), `buildLaunch` (`setMode('island'|'landing'|'starbase',
  sky)`, `setExplosion(pos, age)`, `setPlume(pos, k, L, width, cloud)`, catch `tower.setArms(k)`), `buildFactory`
  (`setMode('day'|'night'|'showroom')`, turntable), `buildSuburb` (1970s Pretoria, jacarandas), `buildCampus` (sandstone
  arcade), `buildFlight` (above the clouds). FX: `makeSpritePool`, Earth city lights + `makeTrain` (Starlink train), factory `setSparks` (welding),
  flight `setTrail` (contrails), suburb `update(t)` (falling petals). Props: `makeFalcon('f1'|'f9')` (`setLegs`, `setFins`), `makeSuperHeavy`, `makeStarship`,
  `makeTower`, `makeDragon`, `makeISS`, `makeRoadster`, `makeModelS`, `makeCybertruck`, `makeJet`, `makeCRT` (canvas screen),
  `makeSink`, `makeSatellite`. Space scenes need `camera.far` ≈ 6000 and `near` ≈ 0.3.
- `engine/rig.js` (009): `makePerson({beard: color})` chin-curtain beard (`head.beard`, grow with `.scale` 0.62 → 1 and
  `.visible`), `makePerson({dress: color})` long skirt cone (`rig.dress`; hide it when seated — trouser legs in the dress color
  read as a skirt, the cone reads as standing). Marble statue = any rig with every mesh's material swapped to one marble mat,
  in a scaled carrier group. Proper seat: `y: -0.375, footFwd: 0.42` (thighs level, shins vertical; seat top at 0.42).
- `engine/sets/military.js` (005): `buildSilo` (missile `setDissolve(t, t0, t1)`: clipping plane + rising embers), `buildBase`
  (parade ground, 30 `soldiers`, hangar, 4 `tanks`), `buildBorder` (dusk border post, barrier, one `guard`, tank row on a ridge
  `setTanksAdvance`), `buildPlant` (cooling towers + steam, `update(t, day)` time-lapse), `makeTank`, `makeSoldier`, `makeSkyDome`.
  Each builder returns its own `root` at the origin; the video shows one per shot and sets `scene.fog` per shot (city only).
- **Fog + far plane per set:** street and city each set `scene.fog` + `camera.far`: save each set's fog right after building it
  and swap fog/far/exposure per shot (006 `useSet`). Call `city.setTime/setPower` and `street.setSeason` only while their fog is active.

## User's taste (direct feedback — non-negotiable)
- **Every video delivery includes its caption, pasted in full in the final message** (user: "where's the caption? make sure every
  video generation has a caption"). That means every first cut AND every revision: write or update `caption.md`, commit it with
  the video, and paste the caption text (paste-ready, without the sources comment) in the report next to the file path.
  `tools/render.mjs` warns when caption.md is missing or still the template. If a revision changes what the video shows,
  update the caption to match.
- **Every caption carries the course link (user rule, Oct 23)** — this exact line, on its own line right after "Send this to
  your ___" and before the hashtags: `🎬 Want to make 3D animations like this? Learn how 👉 payhip.com/b/rim0Q`
  (the user's "AI 3D Animation Masterclass Prompt Vault" for people who want to make their own reels). Keep the URL as
  written (short, no https://) — Instagram doesn't make caption links clickable, so it must be easy to read and type.
  Never put it in the video itself. `tools/render.mjs` warns when it's missing.
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
  another tone (user, on 005's first score: "why is the music sad… it doesn't fit"). **The music must fit the reel's vibe:**
  ominous/high-stakes (005 nukes) = cinematic drama — low string drive, soft taiko, sub drones, hits on the big beats
  (a calm explainer score was "too calm"); light science = curious mallet; family = soft piano. See audio/README.md.
- **Scene variety (all videos):** cut between many distinct locations, and **show what each subtitle says** — "countries build
  armies" → soldiers marching, tanks leaving a hangar; never keep returning to one set (user, on 005's first cut). Plan 4+
  locations per video; reuse `engine/sets/*` from earlier videos (they can all live in one scene, one `root` visible per shot).
- **Lean on drama + the biggest visible effect (user steer, 010):** every beat should end in something physically big —
  a collapse, a crush, a snap, a time-lapse — with an impact (camera shake + dust burst + a boom/foley hit). Deadpan text over an
  epic score + big physical consequences = the comedy. Low "ant's-eye" camera angles make giants/scale read.
- **New places, not repeats (user steer, 010):** build new sets/props when the story moves somewhere new — viewers don't want the
  same street every video. 010 added `suburb.js` + `supermarket.js` + `makeBus`/`makeHoop` instead of reusing street.js 5×.
- **No bare scenes (user steer, 010):** dress every shot — posters, a glowing alarm clock, slippers, laundry, plants indoors;
  power poles + wires, picket fences, flower beds, a kid's bike, a gnome, parked cars, clouds outdoors; carts and produce bins in a store.
  If a still looks empty, add 4–6 props before re-rendering. Keep them out of the hero's sightline (`poleClear` in suburb.js).
- **Open quiet (user steer after 010):** the first seconds are subtle sound only (room tone, crickets, a snore, a street) and the
  music ENTERS on the premise moment (007: the brain glow; 010: the growth at 4.2 s, with a braam + boom). Don't start the score at 0.
- **Keep beats short and busy (user, on 010 v1: "too bare… more different funny scenes"):** ~5 s per beat, 10–12 beats, something
  moving in every frame — cut away before a shot goes static (v1 held a crushed car / an empty room / a standing hero for 3–8 s).
  Scan the render at 1 fps (`ffmpeg -vf fps=1,scale=216:-1,tile=12x6`) and kill any run of near-identical frames.
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
- **Never append code after a `//` comment on the same line** (012 hit it again: an edit appended `// auto-fit` mid-line and commented out
  the rest of the line → `Unexpected end of input`; the grep below misses comments followed by `}` — when in doubt run `node --check` on a `.mjs` copy) when editing with scripts/sed (bit TWICE in 009: a pistol's
  placement and `letter.visible = true` vanished). After scripted edits run this check — it must print nothing:
  `grep -nE "//[^'\"]*;\s+[A-Za-z_.]+(\(|\s*=|\.)" videos/NNN-*/shots.js engine/**/*.js | grep -v ":\s*//"` — it silently comments the code out
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
- **Floating labels/cards above heads (008) must be sized for the lens:** frame width at distance d = 2·d·tan(fov/2)·9/16
  (≈1.6 m at 3.5 m, fov 48). A hero card reads at ~50–70 % of that width; 008's first sheet had 0.8 m cards at 7 m = unreadable.
  Move the camera in (≈3 m for heroes) instead of only scaling the card. In crowds, **stagger card heights** (3 lifts) or they
  form one row that hides itself. `clamp(x)` is 0..1 — never use it for a row count (008's history rows never appeared).
- **Props that live inside a set's root use the set's LOCAL space** (009: the muzzle flash was posed with world coordinates
  inside the theatre root parked at x=7000 → rendered 7 km away). Convert with `set.root.worldToLocal(v)`. And call
  `rig.root.updateMatrixWorld(true)` before `localToWorld` on anything in a rig you just posed (matrices are a frame stale).
- **To film into an enclosed space (a theatre box, a booth), hide one wall/post for that shot only** — a film cheat no viewer
  notices; better than a camera angle where the key action is hidden behind a head (009 theatre).
- **Page never becomes ready / render times out with no error = an infinite loop in build()** (009: iterating `crown.children`
  while adding snow caps to it). Iterate over a copy (`[...g.children]`). Bisect with `console.log` between builders.
- **A mesh that renders flat white = undefined material** (three.js falls back to a white MeshBasicMaterial). 009: `arr[i % 3]`
  with a negative `i` → `arr[-1]`. Use `((i % n) + n) % n`. To identify any mystery pixel, serve the repo
  (`python3 -m http.server`), open the page in the browser pane, expose `window.__studio = studio` temporarily, and raycast
  from `studio.camera` at that pixel (prints geometry, world point, material).
- **Fire, smoke, steam and clouds = soft camera-facing sprites, never stacked spheres** (011: nested transparent spheres read
  as rings/bubbles). `makeSpritePool(parent, n, 'fire'|'smoke')` in tech.js: additive radial-gradient fire, soft alpha smoke;
  offset each puff from the center so they read as separate lumps. Same for planet clouds: radial-gradient puffs in a canvas.
- **Black patches in an outdoor sky = the sky dome is beyond `camera.far`** (011's Pretoria: dome r=400, far=400, camera 13 m
  off-center → a clipped wedge of black). Keep `far` ≥ dome radius + camera offset (or shrink the dome). Raycast to confirm.
- **Screen glow lights (CRTs, phones) stay soft and ≥ 0.7 m out** — 1.6 at 0.45 m blew the beige bezel to white and lit a shirt
  bright blue; turn them off in daylight shots.
- **Point lights ≥ 0.7 m from walls**: a fire light 15 cm from log walls blew them out to white (009).
- **Overlaying a set's built-in sign/board with your own canvas plane: put it IN FRONT** (013: the classroom board plane is at
  z −2.96; a big-chalk overlay at −2.975 rendered behind it = a blank board). The set's own `setBoard` font is too small for a
  1-second read from the back of the room — overlay big text instead (and `setBoard('')`).
- **Tracking shots with two subjects (a dog walking a man, 013): aim between them** — aiming at the leader lost the follower
  off-frame; and park the destination prop (hydrant) where the leader actually stops (compute it from the walk), not a guess.
- **Check every still for the HUD (top-left, y≈470–640 at full size) covering a face** — 009's theatre box and riverA put a
  face exactly there; fix by re-aiming (raise the aim point so faces drop, or shift them right), never by moving the HUD.
- **Vertical frames are only ±15° wide**: before placing people for a shot, check the bearing from the camera to each one vs
  the aim direction (009's road + war shots had the hero 19–25° off-axis = out of frame).
- GitHub rejects files > 100 MB: `final.mp4` is capped at 6 Mbps (≈45 MB / min) and, for reels longer than ~115 s, lower —
  `finalRateArgs(duration)` in tools/lib.mjs keeps it ≈ 90 MB (009's 2:19 cut hit 101 MB at a flat 6M). Don't commit `out/` or `stills/`.

## Brain-response check (TRIBE v2 experiment, Oct 2026)
`tribe-experiment/` runs Meta's TRIBE v2 (predicted fMRI response, CC BY-NC → personal use only) on our `final.mp4`s, locally
on the Mac. Read `tribe-experiment/results/report.md` first. **It is not a publish gate:** the whole-brain mean ranked the 10
original uploads like their views (rho 0.84), but on @ed._.studios views follow posting order (−0.94) and the brain score
doesn't (same-account rho 0.37, n=6; 013 scored highest yet was 5th of 6). Re-uploads of one file to other accounts always
rank in upload order (TikTok suppresses copies), so don't cross-post. Useful as a dead-zone finder. Mac gotchas, all handled in `run_tribe.py` + `mac_patches.py`:
encoders only accept cuda/cpu (set `mps` after load), torch 2.6 MPS attention needs 6 GB per V-JEPA layer (chunk queries),
`num_workers: 20` spawns 20 slow processes on macOS (set 0), run it under `nohup` (quitting the app killed a 3 h batch), and
our videos have no speech, so the Llama text stream is empty (no HuggingFace token needed).

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
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", the course-link line (payhip.com/b/rim0Q), exactly 5 hashtags incl. #animation.
