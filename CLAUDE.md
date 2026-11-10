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
- **build** ("How a ___ Becomes a ___", `videos/024-hole-subway`) — **its own category: follow `docs/BUILD.md` and `/new-build`**
  (user, Oct 26: "an entirely new harness"; reference account analyzed in `docs/reference/wemakebuild.md`). An ElevenLabs
  narrator (scratch macOS voice until `ELEVENLABS_API_KEY` is set) roasts a humble object upgrading into a giant machine,
  fix by fix, each with its real engineering name; Gary the toon gets hurt by every failure; ONE word at a time dead
  center + yellow TERM callouts; one cutaway diorama; ONE continuous gliding camera, NO cuts (user tried punch-in cuts on 025/026 and
  rejected them: "much easier to follow" without) + hard impact kicks (`makeKick`, engine/build/cuts.js) at 60 fps + motion blur; improved by a
  5-subagent review loop (`docs/BUILD-REVIEW.md`, brief templates inside). Exempt from the opening question card, HUD, lower-third subtitles,
  "no popping text" and the end card (see BUILD.md for what still holds).
- **promo** (a product ad in the build look, `videos/049-scribe-promo`) — **follow `docs/PROMO.md`**: copy a reference ad's story beat for
  beat but reach the product sooner, ElevenLabs narrator at ~the reference's pace, toon look, hard cuts between places (one gliding rail
  each), no build loop/Gary; product claims checked against the product's own repo/site. Kit: `engine/build/island.js`, `brprops.js`
  (instanced toon crowd, chutes, beams, blimp, plane, crate), `brhud.js` (battle-royale HUD + product end card), `scribe.js`, `library.js`.
Set `"tone"` in story.json and follow **`docs/TONES.md`** for what changes between them. **Pick the harness per concept** (user steer): global what-ifs show the
ripple in many places; don't carry them on one character (003 was felt to be too single-angle).
Every video OPENS with only the main question, centered on screen, nothing else — then the story starts (build reels excepted:
their hook is spoken on frame 1, docs/BUILD.md).
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
  **A kid on an adult bench (029):** that formula left the kid standing (legs too short to reach the ground → straight legs). Seat
  the pelvis at `rootY = seat − s·(HIP_H − 0.07)` and dangle the feet with `p.floor = 0.42` (local) + `footFwd 0.42` (029 `putKid`).
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
- `engine/sets/playground.js` (014): sunny downtown playground (rubber floor, slide tower, 3 swings, merry-go-round, seesaw,
  spring riders, climbing dome, sandbox, benches, towers + a banner `setBanner(text)`), laid out in DEPTH for a vertical frame
  (camera at z ≈ +5…+6). `setBuild(0..1)` pops the pieces up in order (time-lapse), `update(t, s)` swings/spins/rocks them;
  `swings[i]`, `carousel`, `seesaw`, `riders[i]` handles let riders follow the motion (014 `parkPose`).
- **Toddlers / shrinking people (014):** the normal rig at `root.scale 0.5` + `rig.headG.scale 1.6` (a toddler's head is ~80 %
  of an adult's — 1.35 read as small adults). One rig plays adult ↔ toddler by animating both (`sizeAt` boing). Pose with a
  `put(rig, key, p, s, rootY, groundY)` helper (010's `putG` with a variable scale); sitting root = ground − s·(HIP_H − 0.17).
  **Keep the camera at ADULT eye level after a shrink** — dropping it with them made the shrink invisible.
- `supermarket.setStock(k, belowY)` (014): only shelves lower than `belowY` empty ("everything below 3 feet: gone").
- **Sunny Market (031, `engine/pipmart.js`):** `dressMarket(studio, buildSupermarket(studio))` dresses the 010 store for a
  job episode: glass front wall at z = 6 with automatic doors (`setDoors(0..1)`) + a sunny parking lot and a painted horizon
  card (`setSunset(k)` = a low warm light through the glass), a LOBBY at x 3…8, z 2.4…6, hanging aisle signs (1 PRODUCE · 2 CEREAL ·
  3 MEAT), printed labels on every product, a sausage cooler in aisle 3 (`M.bin`, pile top `bin.topY`), checkout 3 on the
  x = 2 counter (`lane.setBelt(m)`, `lane.setScreen(n)` = a register listing n "items", `lane.D`), a back-wall clock
  (`clock.setClock`), an EMPLOYEE OF THE MONTH board on the right wall (`eotm.photoSlot`), a balloon net (`balloons.update(t,
  tDrop)`), pumpkins, flowers, gumball machine, cart corral, kiddie ride. Props: `makeStaffVest(pip)` (green working-dog vest,
  STAFF on both flanks, top handle a toddler can hold, `setBadge(k)` HI, I'M PIP), `makeScanner()` (`setBeep`), `makeShopCart` +
  `loadCart`, `makeHandBasket`, `makePolaroidCam` (`setFlash`) + `makePolaroid(tex)` (`setDevelop`), `makeGroceries(parent, n)`
  (instanced cans/boxes/bottles/oranges for a belt jam → avalanche: 031 `scan()`), `makeScentTrail` (golden dotted ribbon).
  **An in-world photo of a rig = render it to a texture once at build (031 `photoRT`):** a second `makePip` posed in an offscreen
  "photo booth" root (backdrop + key light) far from the set, `renderer.setRenderTarget(rt); renderer.render(scene, cam)`,
  then hide that root; the Polaroid/frame uses `rt.texture` (it stays valid for every later frame).
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
- **Talking pets (016):** `engine/props.js` `makeSpeechBubble({lines, accent, width, maxChars, offX, soft, tail, name})` = a
  camera-facing speech bubble (`setRows(n)` reveals lines chat-style, `setPop(k)` boing; `tail` px lengthens the pointer so a
  card can float above a crowd and still point at a goldfish). Size it from the camera distance EVERY frame (016 `say()`:
  `pop = k · frac · frameW(d)`, frac ≈ 0.45–0.6) so every bubble reads the same on screen whatever the lens. Pets:
  `makeCat()` (sitting; `talk/paw/squint`, tail swish), `makeParrot()` + `makePerch(h)`, `makeFishBowl({r})` (`update(t, face)`
  swims the fish / brings it to the glass, `talk`), `makeHamster()` (`stand(k)` rears up, `paws[]` attach points) +
  `makeHamsterWheel()` (`spin(a)`), `makeDog` gained `setLie(k)` (lying in a bed) + `setWag(rate)`. Scale hamsters ×1.5 to read.
  New sets: `engine/sets/livingroom.js` (apartment + dining area; armchair group pivots at its back edge so it tips over
  backward; `setMode('evening'|'dinner'|'night')`), `engine/sets/petshop.js` (`buildPetShop`: fish-tank wall, hamster table,
  food-bag shelves, bird cages; `buildVet`: waiting chairs, EXAM 1 `examDoor` hinge, EXIT, posters). Synth: `walk` section
  style (walking bass + off-beat comps = "gossip jazz") and soft pet voices `cat_meow`, `parrot_chirp`, `fish_blub`,
  `hamster_squeak` (audio/README.md).
- **Pip, lane 3's recurring hero (021, `engine/pip.js`; full API + rules in `docs/lanes/lane3.md`):** `makePip({size, fur, white,
  cream, earStyle:'up'|'flop', name})` → `{g, R, T, H, update(t, state), anchors:{hat, mouth, back, tag}}`. Every frame
  `pip.update(t, {walk|run + dist, wag, wagRate, ears 0..1, sit, lie, beg, sleep, roll, hop, whimper, howl, headPitch/Yaw, tilt,
  mouth:'smile'|'open'|'pant'|'o', open, tongue, lick, eyes:'open'|'closed'|'happy'|'wide'|'sad'|'sleepy', lids, sad, lookX/Y,
  sniff, shiver, tailDown})` — he breathes, blinks, flicks an ear and sways his tail on an empty state (pass `still:true` for a
  lineup). Legs are stretched cylinders between the torso and planted paws, so every pose stays grounded; the head's rotation
  is absolute (posing never fights the body pitch). `pulseAt(t, times)` turns event times into 0→1→0 pulses — put the times
  in story.json (`"pip": {whimpers, ring, …}`) so `make_cues.py` reads the SAME numbers for the foley. Size 0.92 next to Mia.
  `makeCrate()` = the big wire crate (door +z, `setDoor(θ)`, `floorY`, `panels.{left,right,back,top,door}` to hide per shot).
  Family: `makeMia({outfit:'pajamas'|'day'})` (kid rig ×0.68, pigtails, bunny slippers), `makeMom({outfit:'robe'})` (robe =
  `dress` — hide `mom.dress` when she sits), `makeDad()` (glasses: pass `glasses:true` in every pose, applyPose resets it);
  `poseScaled(rig, pose, rootY)` poses the scaled kid. Home base: `buildLivingRoom(studio, {home:true})` = stairs up the left
  wall (`DIMS.home`, `stairY(z)`), `setUpstairs(v)`, `setConsole(v)` lamp, `setNightlight(v)` (moon plug-in), Pip's corner
  (bowls, toy basket, paw rug — the crate goes at `DIMS.home.crate`), photos up the stairs, `setClock(h, m)` with real hands,
  and a sunrise: `setDawn(0..1)` / `setMode('morning')` (window view crossfades, the sun patch sweeps the floor = a time-lapse).
  021 `shots.js` helpers: `sideLie()` (a rig lying on its side/back/tummy via a carrier basis: x = up × face; root = feet),
  the towel "ghost" drape that follows Pip's head (`drapeGhost`), steam sprites, a twin-bell alarm clock.
- **Halloween kit (023, `engine/halloween.js`):** `dressHalloween(studio, suburb, {dark:[i]})` turns suburb.js into a dusk
  trick-or-treat street (violet → tangerine sky + moon, autumn trees, porch STEPS, lanterns, carved jack-o'-lanterns, string
  lights, window glow with paper bats, cobwebs, hay bales, tree ghosts, street lamps); `hw.houses[i].setLit(0..1)` per house
  (cascade = "the street lit up"), `hw.setDoorOpen(i, θ)` also shows a lit hallway plane in the doorway (the suburb houses are
  solid boxes — without it an open door shows siding; people "in the doorway" stand at z ≥ −8.9 so the plane hides their back),
  `hw.groundY(x, z)` = floor height on walks / steps / porches (0.3), `hw.aimSun` = a LOW sun. Props: `makePumpkinCostume(pip)`
  (Pip IS the candy bucket: ribbed shell + printed jack face on both flanks, open top with `heap.setFill(n)`; a plain orange
  shell blended into his fur — the printed face is what makes it read), `makeCandyHeap/makeCandyBowl/makeFlyingCandy` (instanced
  wrapped candies; `fly()` in 023 shots.js = ballistic arcs that vanish into the heap on arrival), `makeInflatableCat()`
  (`setDeflate(k, t)` slow comic slump), `makeSkeleton()` (`setCollapse(k)`, `legBone` to steal, holds a `bowl`), `makeBone()`
  (a bone-shaped dog biscuit — never a real cooked bone on screen), `makeJackOLantern`, `makeStringLights`, `makeCobweb`,
  `makeSign(text, {lines})`, `costume(rig, 'witch'|'ghost'|'dino'|'hero'|'skeleton'|'pumpkin'|'vampire'|'catEars')`.
- **Winter kit (044, Pip ep. 7, `engine/winter.js`):** `dressWinter(studio, buildSuburb(studio))` snows in suburb.js (lawns,
  sidewalks, a road with slushy tire tracks, snow slabs on roofs / porch roofs / mailboxes / cars / fence rails / bench, trees +
  shrubs turned dark evergreen with white caps, flower beds buried, icicles + a wreath + snowy porch steps on lot 0, a pale winter
  sky, cool bright light whose hemi ground colour is near-white = snow bounce); returns `{SY: 0.1 (snow top), fog, porchTop}`.
  `makeSnowfall(parent, {n, box, speed, size})` = deterministic flakes that wrap round a center each frame (a box that follows the
  camera = snow everywhere; drop flakes within ~0.7 m of the lens or they read as giant blobs — 044 `update`), `makeHeroFlake()`
  (six-armed crystal sprite for close-ups), `makeDrift`, `makeSnowman()` (`setBuild(0..1)` stacks it with a boing, `nose`
  group to steal, `wave(t, k)` stick arm), `winterWear(P, {coat, hat, pom, scarf, mitten, boots})`, `makeDogScarf()` (parent it to
  `dog.collar`: it follows the neck), `makeDogSweater(dog)`, `makeSnowBeard(pip)` (`setBeard`, `setCap`), `snowViewTex()` (a
  snowy street for any window view plane). 044 shots.js: `lieBack()` (a rig on its back in a carrier: snow angel), a room seen
  from OUTSIDE its window (facade boxes round the opening + frost glass + a nose-fog spot — and give the room a front wall, or
  the open +z side shows black through the window), instanced snow `burst`/`puff` poofs, a leash TubeGeometry rebuilt per frame.
- **Blackout kit (038, Pip ep. 5):** `pip.update(t, { shine })` = dog eyeshine (additive green-gold over the pupils). 038
  shots.js has camera-following rain, window rain, a lit/dark storm window view, battery candles + box, a lantern, a blanket
  fort, Pip's raincoat, an umbrella, a quilt hood. city.js at the origin + suburb/livingroom parked at offsets works in one scene.
- **Tornado kit (040, Pip ep. 6):** `engine/sets/bathroom.js` `buildBathroom(studio)` = a windowless family bathroom (the
  "interior room away from windows"): alcove tub along the back wall (`DIMS.rimY` 0.55, basin floor 0.1, `DIMS.basin`), duck
  shower curtain, vanity + mirror, toilet, towels, Mia's stool, a fish picture where a window would be, a ceiling light
  `setLight(k)` (flicker), and a door whose hinge group `door` swings OUT into a lit hallway (`rotation.y = −1.45`; swung in, it
  blocked the tub's view of the doorway). Room is 2.6 × 2.5 m: a 4-person hug only fits a vertical frame stacked — Mia kneels IN
  the tub with Pip on her knees, Mom + Dad perch on the two tub ends (040 `hug`; kneeling at the apron put a parent's back over
  everything). 040 shots.js helpers: `makeWagon` (Mia's red wagon, `setHandle(worldPoint)` aims the grip at Pip's mouth),
  `makeTrampoline` (cartwheel = `rotation.set(PI/2, 0, dist/r, 'ZYX')`), `makeGnome`, `makeFunnel` (lathe cone with curved
  swirl-band strokes scrolling in u + a dark cloud skirt + dust + orbiting debris; vertical streaks read as a water fountain),
  `makeLeaves` (instanced wind-blown leaves that follow the camera), a slanted `makeRain`, a storm dome inside suburb.js's
  sky (renderOrder −1 or the far funnel draws first and gets covered), window views + an overlay that crossfades to a green
  storm, `tvCard()` TORNADO WARNING, phone alert screens, a fish bowl with a carry handle (`holdFish`).
- **Dog park + breeds (030, Pip ep. 3):** `engine/sets/dogpark.js` `buildDogPark(studio)` = a sunny fenced BARK PARK (chain-link
  panels via an alpha-tested canvas texture — `fence.{front,back,left,right,vest}` groups to hide per shot), a double-gate
  vestibule (`gates.inner/outer` hinge groups, `rotation.y > 0` swings into the park), the arch sign (`setSign`), a big shade
  tree `DIMS.tree`, A-frame, weave poles, tunnel, jump bar, tire jump, a pause table (`DIMS.table`, top `DIMS.tableY`), a blue
  kiddie pool with ripples + a bobbing duck (`DIMS.pool`, `waterY` 0.09 — a corgi's back is 0.18 m, deeper water hides him),
  a dog fountain, 4 benches (`DIMS.benches`, seat 0.45: adults `y −0.345, footFwd 0.42`, Mia `y −0.133`), bag station, toys,
  a parking lot, a tree ring, rooftops + hills; `aimSun`, `update(t)`. `engine/dogbreeds.js` `makeBreed(kind, opts)` = breed
  presets on `makePip` (husky, poodle, lab, chihuahua, dalmatian, beagle, dachshund, pug, samoyed) with the same pose driver;
  poodles carry pom-poms and `frizz(k)` puffs them (the after-the-splash gag). `makePip` gained additive body options:
  `legs` (leg length), `snout` (m; < 0 = flat face), `long` (body length), `stride` (gait length; pass the size for big dogs).
- 013 `shots.js` has reusable bits (copy them): `makeCrow(seed)` (`flap(k,t)`, hop/snatch/perch logic in `crowAt`), `makeJet()`
  (airliner, nose +z), **skywriting** (instanced contrail puffs revealed along a 2-D path in a vertical plane — a giant "?"), circling
  jets with trailing puffs, a desktop monitor whose screen swaps canvas textures (password field → scam popup) + an instanced
  money fountain, kid **two-sided signs** (two planes back to back = readable from the teacher's AND the camera's side), a
  tic-tac-toe hologram replacing the war-room globe, a press-room bell-curve screen, a leash (`TubeGeometry` on a bezier rebuilt
  per frame), a boomerang rocket (up → hover → lands back on its pad).
- **Tails (015):** `addTail(rig, {color, tip, len, r, seed})` (rig.js) → `rig.tail.update(t, wag 0..1, {rate, sprout, lift, side, curl,
  spin, still})`: a bushy fur chain on the pelvis that idles with a lazy sway (motion in every frame), whips side to side on `wag`,
  pops in with `sprout` (boing it), points out past a high chair back with `side` (±1.3), and `lift ≈ 1.05` + `curl` + `spin`
  turns it into a helicopter rotor (015 car lot). Tail color = hair (bald → a fur color); kids get `len 0.95, r 0.13`.
- **New sets (015):** `restaurant.js` (evening bistro: brick wall + night-city window, string lights, 6 two-top tables with
  `tables[i] = {g, cloth, dishes, flame, chairs}`, low-backed chairs, bar, `update(t)` candles), `carlot.js` (used-car lot: two rows
  of `makeCar`s with price stickers + balloons, pennant strings, HONEST BOB'S sign, sales trailer, a flailing inflatable tube man
  `tube` — `update(t)` animates both; `aimSun`, own `fog`, far ≥ 330), `casino.js` (poker room laid out for a vertical frame: shoot
  down the table's long axis from +x, high; slot wall + neon POKER behind the dealer; `stacks[i]`, `pot`, `table`, `update(t)`),
  `courtroom.js` (judge's bench + `gavel` (pivot at the handle: `rotation.x` slams it), seal, flags, witness stand, counsel tables,
  jury box, bar rail, gallery benches, daylight windows).
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
- **New sets (018):** `engine/sets/subway.js` (elevated subway car: steel poles `DIMS.poles`, overhead grab bars, orange bench
  seats `DIMS.seatY/seatX`, doors, silly ad cards, `update(t, speed)` scrolls a sunny skyline past the windows), `mri.js` (MRI
  suite: scanner with a glowing bore `DIMS.bore/boreFront/boreR`, sliding `table`, control window, MAGNET warnings, `iv`, `cart`,
  `chair` groups that can fly, `setGlow(k)`), `paris.js` (72 m toy Eiffel Tower of instanced iron beams + Champ de Mars lawn,
  kiosks, Haussmann ring, `legPoint(leg, y, u)` / `shaftPoint` = spots on the tower to stick things to, `aimSun`, own `fog`;
  `camera.far` ≈ 700). `audio/synth.py` `metal_clang` (size, pitch): a soft low-passed "CLONG" for anything hitting steel.
- **018 `shots.js` helpers worth copying:** `showC(rig, key, pose, center, yaw, tilt, roll)` poses a rig by its BODY CENTER with a
  whole-body orientation (flying, stuck to a wall, a pile of people; legs dangle) — needs `rig.root.rotation.order = 'YXZ'`;
  `showQ` + `basisQ(up, front)` for any orientation (heads radiating from a point); `flight()` = magnetic pull (u³: slow start,
  slam); `impact(t, m, key, pos, size)` = cartoon starburst sprite + dust puffs (pair it with a camera jolt); `flyProp()` = a prop
  flying onto a moving rig part (spine/head) and staying there (no reparenting); props `makeCart` (wire basket), `makeCompass`
  (`needle.rotation.y`), `makeFork(spoon)`, `makeToaster` (toast pops), `makePan`, `makeMic`, `makeBackpack`; an instanced
  crowd of 1,800 capsule "tourists" that fly in and stick (cheap swarm).
- **New sets (019):** `library.js` (sunny reading room: 3 tall windows, ~1,500 instanced books, two reading tables with green
  banker's lamps `lampShades[]`, 16 `chairs` (index = table·8 + seat·2 + side>0), librarian's desk at the far end, a tipping
  QUIET PLEASE `sign` (pivot at its foot), a book `cart` + `cartBooks[]`, globe, ladder, card catalog), `surgery.js` (operating
  room: OR table along x with a draped patient whose `feet`/`footL`/`footR` kick, a ceiling `lamp` pivot + `lampLight`, an ECG
  `monitor` you redraw per frame `setECG(t, bpm, wild)`, instrument `tray`/`trayTop`, X-ray box, OR 3 sign), `cemetery.js`
  (sunny funeral: lawn + hills, instanced headstones, oaks, chapel, iron fence, white canopy over the grave, folding chairs
  `DIMS.rows × seats`, `wreaths[]`, a black `hearse`; own fog), `stadium.js` (dusk concert bowl: one LatheGeometry two-deck
  bowl, ~16k instanced fans `updateFans(t, f)` where `f(info) → {y, arms, sway}` per fan (jumps, the wave, arms up), stage +
  LED wall `setScreen(t, beat)`, `beams[]`, floodlight towers, jumbotrons; camera on the stage looking +x sees every face;
  `camera.far` ≈ 600).
- **019 `shots.js` = the dance kit:** one beat clock (`M1`, `BEAT` = 0.5 s at 120 bpm; make_cues.py uses the same grid) and
  `MOVES` — groove, disco point, robot, jump (arms up), YMCA, twist, shimmy, sprinkler, body roll — each mutates a pose and
  returns `{sz, sy, legs}` (side bend, shoulder twist, PER-LEG IK `{fz, lift, splay}` via a local `legIK` copy: step-touch,
  knee pops, conga side kicks, a moonwalk). `dancer(rig, key, t, o)` = pose + move + `then(p, q, b)` override + per-leg legs.
  Tested arm presets at the top: `GOAL` A(−1.57, 1.57, −1.57) = upper arm out, forearm UP; `FWD`, `PT_UP/PT_DN` (disco),
  `HIP_A/B`, `HEAD_A/B`, `C_A/C_B`, `TOP_A/B` (YMCA letters), `SPR_A/B` (sprinkler), `CONGA_A/B`, `SLOW_A/B`, `FLEX_A/B`,
  `PUSH_A/B` (the worm: showC-style body tilt). Also `makeMini(parent, n)` = a cheap instanced crowd (body + head + raised-arm V,
  seated or standing), `burst(t, t0, center, …)` = one instanced confetti/petal/cereal burst per shot, `note()` = a gold ♪ that
  pops over a head, accessories built once per crowd rig and toggled per beat (`wear(rig, {cap, mask, gloves, shades})`,
  `outfit(rig, top, pants)` recolors; `hideAll` restores), props `makeCoffin`, `makeBowl`, `makeSpoon`, `makeCerealBox`,
  `makeSheet(text)` (a stamped paper: HIRED).
- **Science-lane sets (017, gravity off):** `engine/sets/football.js` (football stadium — renamed from stadium.js at merge, 019's concert bowl is `stadium.js`: striped pitch + markings, goals with a
  deformable back net `setBulge(k, y, z)`, LED ad boards, 4 stands of ~22k instanced fans — `stands.east.fans[i]` world coords,
  `setFan(i, dy, tilt, rotY)` + `commit()`, `hide(pred)` where rigs stand in — roof + floodlights, `setScore(text)` (call only on
  change: it builds a canvas), `aimSun`), `highway.js` (Texas interstate: straight then a R=160 m right curve; `DIMS.frame(s, off)`
  → {x, z, head} for any lane, billboards, sign gantry, turbines `update(t)`; set far ≥ 1550), `coast.js` (Maine headland + islet
  lighthouse; `setSea(level, t)` raises the whole ocean, `rideBoats(t, level)`, `waveAt`), `gorge.js` (basalt gorge + steel-arch
  bridge with a bungee platform, rapids `update(t)`, falls + mist + rainbow), `plaza.js` (Quito equator plaza: yellow line,
  monument + globe, arcades, bunting, fountain `jets[]`, Andes + volcano).
- **HUD clock with decimals (017):** a hud segment can carry `dec` (decimals), `unit` (" s") and `ease: 'linear'` (no ease
  per segment, so consecutive segments read as one steady clock). 017 runs TIME WITHOUT GRAVITY 0.0 → 5.0 s across 10 places.
- **Slow-motion ladder (017):** one physical moment shown in many places = a physics clock τ that the HUD displays; shots.js
  derives τ(t) from story.hud (`tauAt`) and computes every position from τ with the real formulas (heights, speeds, sea level),
  so HUD numbers and pictures can't disagree. Return shots restart τ at the shared instant (5 s) per place, at ~1× speed.
- **Body-absurd premises without anatomy (022):** `engine/haul.js` — `makeCensor({seed, n})` = a camera-facing pixel mosaic
  sprite (denim blues, `depthTest: false`, drawn over everything like an edit in post; `setSize(m)`), `makeTarpBall({squash})`
  = ONE lumpy blue tarp mound with ropes (diameter via `setSize`, origin at the bottom; never a two-lobed shape), plus the
  logistics props `makeWheelbarrow` (`setCrush(k)`), `makeBoxTruck` (26 ft; `setBulge(k)`, `setBurst(seconds)` blows the walls
  + roof off), `makeTowerCrane` (`setTrolley/setCable/setBuckle`, read `hook` world pos), `makeLawnChair`, `makeTape` (ribbon
  between two points), `makeClothesRack` (`tip`, `suits[]`), `makeRoadSign(lines)`, `makeMosaicFlag`. New sets: `elevator.js`
  (filmed from the lobby, no front wall, `setFloor(n)`), `clinic.js` (exam room, door at the back right for a crowd of doctors),
  `tailor.js` (fabric-bolt wall, fitting pedestal, dress forms that topple). core.js HUD `fmt: 'len'` (value in cm → cm/m/km)
  + `geo: true` (a doubling rolls geometrically). A far-away giant in suburb.js: scale the 300 m sky dome ×30, far 14000, and
  give the giant `fog: false` materials with a haze-blue emissive (the set's 220 m fog would erase it); its smoke sprites too.
- **Doubling-POV kit (020, butt doubling):** `engine/props.js` `makeButt({denim, stitch, belt})` = a cartoon butt in jeans (two cheeks with
  back pockets + yoke seam, a hip block, waistband + brown belt) that scales from 0.36 m to a planet: `setWidth(W m)`, `setBelt(on)`
  (off = it snapped), `setSquash(k)` (+ flat / − stretched, bottom stays put), `button` (fly it off). Origin = top-center-front of the
  waistband: parent it to `rig.pelvis` at (0, 0.06, 0) for small sizes; for big ones place it in the set (anchor y = ground + 0.565·W)
  and pose the rig's pelvis at the anchor (020 `landmark()`, legs tucked into the denim). Pockets face the rig's −z: **turn the butt
  so its back faces the lens** in every big shot (a front view of two giant spheres reads wrong). HUD: story.json segments take
  `fmt: "len"` (value in cm, printed 36 cm / 1.44 m / 11.8 km / 6,040 km) + `geo: true` (rolls geometrically — a doubling, not a ramp).
  `grow(t, tb, n)` / `squash()` in 020 shots.js = the boing every doubling uses. Copy 020's `impact()` + angular `jolts` (shake scales
  with the shot's distance, so a 40 m wide shot shakes as much as a 2 m one).
- **Per-shot `--cam top` (020):** in `update(t)` set `story.debugView = {center: OFF[set] + local, height}` per shot (020 `DBG`) — the
  bird's-eye view then follows every set parked at an offset. It found a bus parked inside the door shot (a green slab over the lens).
- **Space at human scale (020 ISS):** scale `tech.js` `buildSpace` root ×10 (Earth R = 4000 m) and put the ISS + an astronaut rig in
  meters next to the camera; set `camera.far ≈ 30000`. Put the camera over the **sub-solar point** (`(1000,250,300).normalize()`) or the
  ground is a dark night side, and set `studio.camera.up` to the local vertical there (else the whole frame is rolled / upside down);
  reset `camera.up` to (0,1,0) in every other shot. Pose rigs with `basisQ(up, front)` (018) there.
- **A giant thing in a street's sky (020 crowd):** street.js's sky dome (r 150) hides anything beyond it — set its `depthWrite = false`
  + `renderOrder = −1`, raise `camera.far` for that shot, swap in a thin fog (80 → 9000), give the far object an emissive map (it sits
  in the set's shadow side) and lift it so its readable part clears the skyline. A cartoon water splash = an open cylinder ring with a
  jagged-top alpha texture (020 `crown`) — soft puffs alone read as cotton balls.
- **Fog + far plane per set:** street and city each set `scene.fog` + `camera.far`: save each set's fog right after building it
  and swap fog/far/exposure per shot (006 `useSet`). Call `city.setTime/setPower` and `street.setSeason` only while their fog is active.

- **Matter falling apart (027, `engine/nuclei.js`):** `patchDissolve(root, U)` patches every Standard/Lambert/Basic/Phong material
  under a root (instanced too) with a world-space noise dissolve + glowing edge, driven by shared uniforms (`U.uDis.value` 0 → 1;
  patch AFTER everything is added to that root — later meshes aren't patched). `makeNucleiCloud(parent, {max})` = one additive
  dot cloud for many sources: `add(objects, n, {group, gain, pick})` samples the visible meshes (area-weighted, material colors,
  world space — pose first), `addPlanet(c, R, n, colorAt)` fills a sphere, and per frame `set(camera, t, {reach, thick, size,
  gain, groups: [{on, reach, thick}]})` moves every dot along its normal by max(0, reach − depth) in the vertex shader (no CPU
  per frame; 250k dots are fine). `makeAtomLattice()` = electron clouds + nuclei. Additive dots blow out to white fast: keep
  gain ≈ 0.75–1 and dot size small (pixel size = size·1920/(2·tan(fov/2))/depth).
- **HUD extras (027, core.js, additive):** a hud segment can carry `text` (a literal string, e.g. "~10⁸⁰"), `label` (overrides
  `hudLabel` from that segment on), `timefmt: true` (the number is seconds, printed "320 femtoseconds" / "8 min 17 s") and
  `ease: 'log'` (from·(to/from)^u — one clock that sweeps 20 decades, 10 as → 8 min). shots.js reads the same segments for τ.
- **South Pole + "the ground slides away" kit (028):** `engine/sets/southpole.js` (`buildSouthPole`: white plateau + sastrugi,
  ceremonial barber pole with a chrome globe (canvas env map), 12 treaty flags `update(t, wind)`, survey marker + sign, a station
  on stilts, snowcat, cargo, flag-lined road, twinkling diamond dust, low 13° sun + 22° halo; `aimSun`, own fog, far ≥ 1700).
  028 `shots.js`: a **free-frame camera** (`CAMS.*.free`) rides with everything that slides (adds `V·τ` along the set's east axis)
  so faces stay close while the bolted world streaks past — the cheapest way to show "the ground moved, you didn't"; `put(rig, key,
  p, {dx, tx, back, s})` tilts a rig in WORLD x (`tx`) or backward in its own frame (`back`) with `rotation.order = 'YXZ'`; a red
  parka with a hood + fur ruff (`parka(rig)`: the SphereGeometry gap is at phi = π/2 = the face side, no rotation needed); a pool
  whose water slides into the deep end and goes up the wall (slab + sheet), a receding ocean (own sea plane with its near edge at
  the shore + a sloped seabed + an edge wall: coast.js `setSea` only moves the level), a debris cloud that rides with the free frame.
- **Build genre kit (024, `engine/build/`, docs/BUILD.md):** `captions.js` (word-by-word overlay, picked by main.js when
  `story.mode === 'build'`), `toon.js` (`makeToon` big-headed cast with face states, `makeShades`, `makeRaccoon`, `makePigeon` with `flap`),
  `cutaway.js` (`makeCutFace` strata + runtime hole mask, `makeRim`, `maskedPlane`, `lawnTexture`, `makeSky`), `anim.js`
  (`beatClock` → `B.W(beat, word)`, `pop/drop/squash/wobble/shake`, `camAt`), `rail.js` (one continuous camera:
  `makeRail(planRail(frames))` — framings on words, moves ≥ 0.6 + d/8 s, `keep`/`until` holds, `[rail]` warnings; `render.mjs --qc` runs
  the video's `window.EDSTUDIO_QC` = faces under caption/callouts), `fx.js` (analytic particles: dirt, drops,
  confetti, dust, smoke, stink, mist, spark, glow, bill (banknotes); `makeArrows`, `makeDizzy`), `subway.js` (the 024 set + `makeTBM`,
  `makeTrain`, `makeShovel`, `makeCroissant`, `makeTree`, `makeBuilding`, `makeHalfRing`, `makeFan`). Narration:
  `tools/narrate.py` (script.json → voice.wav + words.json + story.json). synth.py: a `"voice"` cue = narrator stem with the
  music/ambience ducked under it, + construction foley (§6b: dig, crumble, splash, clunk, knock, pop, zap, plip, grate;
  beds water_rush, drill, fan, train). `renderer.localClippingEnabled` is on in the subway set (clip planes reveal the
  tunnel/track as they're built).
- **Vex in a what-if sim + the paper-weather kit (074, "What if it rained homework?", `videos/074-vex-sim-homework-rain/shots.js`):**
  voxbeach at the origin + `buildVoxTown` parked at x 4000 in one scene (`useSet`: toggle roots, swap fog, far 800 / 12500); a storm
  that greys both skies (own gradient canvases swapped onto the domes) and dims both light rigs; a pixel weather-alert HUD (time ·
  rolling SHEETS FALLEN · condition · depth, img elements redrawn only when the text changes). Copy: `makeRain` (instanced sheets
  that fall OR fly back up in a box that follows the lens; skip sheets < 0.7–1.4 m from it), `makeLitter` (sheets lying on a surface),
  a 520 m paper SEA plane whose vertices bob, a paper TORNADO (two streaky open cylinders scrolling in u + 2,600 orbiting sheets), a
  35 m paper WAVE (a curling profile extruded 220 m, vertex-coloured: white crest, dark curl underside — without that it read as a
  grey hill), Vex's umbrella (opens, flips inside out) and phone placed at her right grip every frame, a sheet that lands on her
  head (`VEX.attach('head', …)`), and the Scribe app on a portrait phone canvas (scanner → "Scanned pages · 12 pages" chip →
  solving tiles → the page written ON SCREEN with a pen cursor + a zoom onto the Lewis figure → Download PDF), filmed POV with the
  head bone scaled to 0.001 (the lens sits where her eyes are). Town cameras stay on the street (z ≈ −8…0): south-side houses fill
  z −12…−20 and a 3/4 crane there rendered a brick wall.
- **Censored captions over an uncensored voice (058, script.json opt-in):** `"swap": {"fucking": "F*CKING"}` (narrate.py shows a spoken
  word differently in the one-word captions) + `"wordColor": {"F*CKING": "#ff4f6a"}` (captions.js colours that word, even inside a
  joined caption). `makeScreen(G, icon, sheet, { name })` names the student in the Scribe app (default 'Tyler'). docs/PROMO.md → 058.
- **Lighthouse kit (039, `engine/build/lighthouse.js`):** open sea (a JS mirror of the shader waves: `seaH`/`floatPose`, an
  exaggerated curve `R`, a big wave), 7 moods, a cutaway rock lighthouse that grows (`setGrow` clip plane) and leans, a hatch ladder
  to the lantern, Fresnel lens/mirror/beams, boats (tug/sailboat/cruise/freighter/barge), gull, foam spray crown, far coast. A camera
  riding a boat: mount it on the boat body, steady the boat, shake for the foreground distance (039 tug deck). rail.js `swoop`
  (fast one-way dolly to a far place) and `lead/maxLead`; `tools/scenes.py` counts new looks (docs/BUILD.md → Lessons from 039).
- **Other build sets (all in `engine/build/`, lessons per reel in docs/BUILD.md):** `station.js` (032: a backyard on a toy planet,
  `makeFeeder`, squirrel, songbird, treadmill), `firetruck.js` (033: `makeFireTruck` cutaway, `makeSectionWater().set(cells)` =
  water that stays level in a tilting tank, `makeJet` ballistic hose stream, `makeFires`, grill, hydrant, dalmatian, yard cat),
  `tank.js` (034: `makeKartTank().setStage({...})` grows a go-kart into a tank, tracks built link by link, goose, barn, bridge),
  `jet.js` (041: `makeEngine().set({...})` = a staged turbofan half-section, `makeHairDryer`, bird cannon, forklift). Turbo checks:
  `tools/pace.py` (syllables/s, gaps), `density.py` (visual events/s), `scenes.py` (new looks), `flow.py` (camera speed on the
  pixels of a render), `check_voice.py` (whisper transcript + yell levels). `tools/narrate.py` reuses a finished reel's committed
  `voice/eleven-*` takes when there's no key, so any clone can rebuild voice.wav.
- **Factory cutaway (026, `engine/build/factory.js`):** a dollhouse cut (front walls sliced at z = 0, floor slab + ground cut
  below) along x: house, garage (roll-up door in its right wall), a 50 m hall that pops up bay by bay (`setHall(k)`), the
  conveyor `D.line` (z −3.2, cars every `pitch` m), stations `D.st`, a stamping press, an e-coat pit in FRONT of the line seen in
  section (`setPit(k)` cuts floor + lawn + slab strip + face; `tank.setBath(level)`; a hoist `setHoist(z, carY)`), a loading
  dock (`dock.setDock(k)`), a paint booth, QC gate, crash lane + wall, a CEO office on a mezzanine + stairs, a roof test track,
  QUIK FIX AUTO at the far end (four-post lift, `prices` board). Props: `makeKitCar` (toy convertible from parts: `set({stage
  0..4, finish 'steel'|'ecoat'|'paint', mix [3 colours], rust, crumple, doorOff, stripes, spin})`), `makeJunkCar`,
  `makeRobotArm` (`pose()`, `reach(point)` IK), `makeRoomba` (badge/tie/hat/flag accessories, LED eyes), `makeTowTruck`,
  `makeSteeringWheel`, `makeTire`, `makeAirbag`, `makeTugger`, `makeVacuum`, `makeEasel`, `makeInvoice`.
- **Moon kit (029, `engine/moon.js`):** `moonTexture()` (procedural near side: maria at real positions, Tycho/Copernicus rays),
  `makeMoonBody({r})` (+ `faceToward(earth)`), `makeSkyMoon()` = the Moon in ANY set's sky at a TRUE angular size —
  `setSky(camera, dir, angDeg, dist)` every frame after `setCamera` (keep `dist` inside the sky dome and the far plane), `setPhase(null|sunDir)`,
  `setTint`, `setGain`, `setGlow`; `ANG0` 0.518° (today) / `ANG1` 1.036° (half the distance). 1° is SMALL: "giant moon" shots need a
  long lens (fov 3.5–9°, like real moonrise photos) and the faces get their own shots. `makeEclipse()` → `setSky(camera, dir, angSun,
  angMoon, dist, cover 0..1)` = Sun disc + streaky additive corona + a black Moon (totality at cover 1).
- `engine/sets/tidetown.js` (029): a New England harbor built for tides — granite quay (top `DIMS.quayY` 2.2, edge z 0) with a painted
  TIDE STAFF, bollards, lobster traps + buoys (they float off when the tide tops the quay), benches, lamp posts; a street of `cars[]`;
  ten clapboard shops (LOBSTER SHACK … POST OFFICE, lit windows) with 3rd-floor balconies `DIMS.balconies` at `balconyY` 8.9; a hill of
  houses + a white church; a breakwater out to a lighthouse whose beam sweeps; `boats[]` that float or keel over on the mud (`floorY`).
  `setTide(level, t)` (y 0 = mean sea level; floods the street above 2.2), `rideBoats(t, level)`, `setMode('dusk'|'night'|'morning')`
  (a shader sky dome: Belt of Venus over the eastern −z horizon at dusk), `setMoon(dir, k)` moonlight (k = ×brightness), `aimAt`, `update(t)`.
- `engine/sets/fundy.js` (029): the Bay of Fundy ocean floor at low tide — red mud, five sandstone "flowerpot" stacks (noise-displaced
  columns with a narrow waist and the old tide line baked into vertex colors, firs on top), a layered cliff + forest, a steel
  staircase with a landing (`DIMS.stairFoot/landing/stairTop`), an OCEAN FLOOR sign, `setSea(level, t, frontZ)` (silty water + foam
  rings at the stacks + an optional foam line). 029 clips the sea plane at an advancing z (`material.clippingPlanes` +
  `renderer.localClippingEnabled`) so the tide front races over the floor before the bay rises.
- **Sound-led doubling kit (035, farts 2× louder):** `engine/sets/master.js` (`buildMaster`: a sunny grown-up bedroom at 7 AM —
  double bed, a `duvet` group you can lift/fly, pillows, two nightstands + lamps, an alarm `clock` group that can hop off, window +
  `curtains`, `art` over the bed, dresser, laundry chair, plants), `engine/sets/quakelab.js` (`buildQuakeLab`: seismology room —
  a drum seismograph whose paper is a live canvas (`paper`), a pivoting `pen` arm, three wall monitors `screens[]` = live
  canvases, rolling `chairs[]`, mugs, a swinging `lamp`; the ink at drum angle φ sits at u = 0.25 + φ/2π, canvas rows map to
  world x along the drum: 035 `drawPaper`). synth.py (035): `toot` (size 0..1: a 380 Hz squeak → a tuba bwaaamp with a sub
  thump; soft, low-passed — the cartoon fart), `car_alarm`, `wing_flutter` (a flock lifting off), `glass_crack`. 035 shots.js:
  `ripple()` = the cartoon pressure ring (camera-facing ring sprites + floor rings) — the most a gross-out premise shows at its
  source; `blow(rig, k)` sweeps the hair back + widens the eyes/raises the brows (reset every frame); `hat()` = hats posed on a
  head that fly ballistic at a blast; `burst()` = analytic debris pools (papers, books, petals, glass, popcorn); `lie()` = a rig on
  its back by its hip (tilt −π/2 flat → 0 sitting up; −1.2 = propped on pillows, the only way faces clear a duvet from the foot
  of the bed); an apartment facade built from brick boxes around real window openings with neighbors leaning out.

- **Portal kit (042 belly-button portal, all in `videos/042-bellybutton-portal/shots.js`, copy it):** `portalMaterial()` = a
  swirl disc as a tiny ShaderMaterial (polar spiral arms, deep center, bright rim, values > 1 so bloom glows; `uA/uB/uC` colors,
  `P.warm(true)` = gold); `makePortal(r, light)` = disc + additive glow sprite (keep the glow ≤ 2.4·r on big portals — 4.5·r
  washed a whole Mars shot) + a PointLight; `exitAt(e, key, p, n, t, open)` places one anywhere facing n. **Front half of a
  body into a portal = a clipping plane** on that body's (cloned) materials: `plane.set(n, −n·portalPos)` while it's inside,
  `plane.set(up, 1e5)` otherwise (+ `renderer.localClippingEnabled = true`) — 042's cat goes in front-first and gets pulled
  out with a fish. Items going IN = `suck()` (cubic ease to the disc, shrink + spin); people going in = `showC` with a scale
  (a head-first dive that shrinks to 5 %); people coming OUT = `showC` from 15 % scale with `easeOutBack` → a standing pose.
  The "rolled-up T-shirt" = a skin-colored cylinder band around the lower torso (`spine` local y 0.15–0.35, scale 1.13 × 0.8)
  + a shirt-colored torus roll above it; hands hold the roll with `A(-0.05, 0.3, -1.75, 0)` (both arms). A small sphere
  patch on the front read as a hole in the shirt; crossed-arm hem poses hid the navel. Under a purple key a mustard shirt
  read as skin: give the hero a saturated BLUE shirt when a colored glow lights the torso.
- **Pose lineup for ONE rig (042):** render `you` alone at t = 200, 201, … with a different arm preset per frame (`HEMS[page]`)
  and a close camera — five pool figures in a row were too small to judge where the hands land on the body.
- **Fire kit (037, `engine/oxygen.js`):** `makeFlames({n, r, seed})` = cartoon flames that read in DAYLIGHT (3 nested
  teardrop tongues red → orange → yellow, unlit, transparent, `depthWrite:false`, renderOrder 5/6/7 so the inner bands draw
  over the outer shell; additive glow sprites wash out to white on a bright sky). Call `update(t, h, {wind:[x,z], width, maxW,
  spread})` every frame (h = height m, 0 hides it); **always cap `maxW`** for tall columns (a 4 m column at the default width was
  2 m wide and hid every face). Props: `makeCake({candles})` (`wicks`), `makePartyHat`, `makeBalloon`, `makeGrill()` (`lid` hinge,
  `patties[]`), `makeCampfire`, `makeTent`, `makeStick` (marshmallow), `makeFireTruck` (`setLights(t)`), `makeHelmet`,
  `makeExtinguisher` (`nozzle`), `makeDragonfly({span})` (`update(t, rate)`), `makeCrow`, `makeFinishArch(text)` (`setTape(k)`
  snaps the tape), `makeBarrier`, `makeBib(n)`. synth.py §6c: `fire` bed (size), `whoomp` (flames leaping), `siren` bed (far,
  low-passed), `hiss` (steam/extinguisher), `breath` (inhale/exhale), `buzz` bed (big wings). 037 shots.js: `runLegs()` = a run
  cycle (longer stride + knee lift than the walk; local legIK copy), `stream()` = a hose arc of water blobs, `sootify(rig)` /
  `ageHair(rig)` tint a face / gray the hair, `seatKid()` / `seatAdult()`.
- **Ring kit (043, `engine/rings.js`):** Saturn's main rings scaled to Earth (C/B/Cassini/A, 1.239–2.269 R, real-ish optical
  depths). `makeRingSky()` = a camera-centred sky sphere whose shader RAY-CASTS the ring plane for an observer at any latitude
  (`set({lat, sun: sunECEF(dec, hour), E, U, gain, haze})`, `follow(camera, r)` after `setCamera`): the equator gets an edge-on
  hairline through the zenith, mid-latitudes an arch (NYC 26°, Tokyo 32°), Earth's shadow eats the arch after sunset, the lit/unlit
  face flips with the season (the north sees the LIT face only in its summer). `ringTransmit(lat, sun)` = sunlight through the
  rings (the ground shadow: Miami's Dec noon = 0.1 %), `archStats(lat)` = the arch's elevations for the HUD.
  `makeSpaceRings(R)` = lit rings + the rings' shadow on Earth (a shell shader) for tech.js `buildSpace`. 043 shots.js:
  camera-facing meteor `streak()` quads, a satellite sandblast (sparks + flying bits), an Ordovician debris ring (instanced).
- `engine/sets/lagoon.js` (036): an Icelandic geothermal lagoon at night — opaque milky-blue water glowing from below (swimmers
  at rig y ≈ −1.22 show heads + shoulders only), steam sprites (`update(t, camLocal)` thins the puffs near the lens), lava rocks
  with snow caps, a lit LAGOON BAR hut + boardwalk, lamp posts, a pink-lit geothermal greenhouse, a power plant with plumes,
  mountains, Milky Way sky (r 400, far ≥ 460). **`nightSkyTexture()`** = the same 4096 px star sky as a texture: swap it onto ANY
  day set's sky dome (`sky.material = new MeshBasicMaterial({map, side: BackSide, fog: false})`) + hemi ≈ 0.06, sun 0 for an
  instant "stars at 4 PM" (036 `dayNight()` does pool.js + wedding.js).
- **HUD formats (036, core.js, additive):** `fmt: 'clock'` = seconds as a m:ss countdown (rounded up, 0:00 only when it has run
  out), `fmt: 'dur'` = elapsed "+1.3 s" / "+8 min 19 s" / "+1 h 10 min", `fmt: 'temp'` = "−18 °C" with a real minus sign.
- **Day → instant night in one set (036):** lights to ~0, sky dome → `nightSkyTexture`, fog colour → near-black, clouds hidden, and
  give faces something to be lit by (a flash `PointLight` ≤ 16 at ~1.7 m — 55 blew faces to white; string-light PointLights ~5;
  a fire drum PointLight ≈ 3.6 at 0.8 m — 9 turned the face across the fire into a white blob). Fire sprites rising past y + 0.45
  cover the face on the far side of the drum: keep flames low.
- **A phone photo of the Moon (036 moonA):** make the camera ride the PHONE (hand world pos) but freeze that rig (no idle, no
  react) for the shot — when the camera rode a hand that moved at the reaction, it ended up inside the head.
- **End card over a live scene (036 cut4, core.js additive):** `finalFade: [start, end, depth]` — `depth < 1` only dims the frame
  (0.4 in 036), so the end card sits over the moving sky + shooting stars instead of black (the black end card was the lowest
  TRIBE stretch of every reel). The HUD still fades out at `finalFade[0]`; default depth 1 = the old fade to black.
- **A dark premise can still stay lit (036 cut4):** "the power still works" — after the blackout most beats went INSIDE (a
  stadium whose floodlights bang on bank by bank, a supermarket rush, a laundromat crowd backed against the dryers); only the
  must-show outdoor beats (stars at 4 PM, the Moon going dark, the ice) stayed dark, each ≤ 3.2 s. Each place = 2–3 quick
  angles (≈1.5 s) instead of one 5 s shot. football.js in the dark: swap the sky dome to `nightSkyTexture`, hide the clouds, find
  the roof floodlights (MeshBasic boxes 5 × 0.9) and reuse `lights.sun` as the far floodlight bank (036 `stadScene`).
  A camera near a goal: the net spans x 52.5–54.5, |z| < 3.66 — 036's first close-up of the home end sat inside it.

- **Backyard → university kit (050, Scribe promo, `engine/build/campus.js` + `engine/build/dayhud.js`):** `buildCampus(studio)` = a
  sunny backyard whose shed upgrades in stages (shed `front` wall to hide for a classroom shot, `floor2`, `roof`, cardboard `sign`;
  trampoline, trash can `lid`, gnome, bell tower `swing`), a brick hall (`body` grows, `cols[4]` drop, `top` drops, `ivy[]` pop,
  banner, podium), the neighbor's house with a lean-out window (`nwin.open`), pool → stadium (`rows[]`, `seats`), Mom's table, a
  clock tower that rises, far halls + grad chairs (`setDay(1)`). `makeDayHud` = an "upgrade every day" HUD (DAY number + a count or
  clock line that ROLL, the Scribe end card; classes are `dh-*` because index.html already styles `.sub/.num/.hud`). Lessons: docs/PROMO.md.
- `engine/sets/school.js` (057): a sunny HIGH-SCHOOL FRONT built with pixel textures — road along x (z 6–13) + crosswalk, near
  sidewalk (z 3–6, top `SW_H`), lawn + entrance path, 2-floor brick school (x ±24, facade z −12) with a portico on four columns,
  double doors, a WESTFIELD HIGH SCHOOL band + clock, a gym block, a side wing, flagpole with a waving flag `DIMS.flag`, a FINALS
  WEEK marquee, benches, bike rack, lamp posts (none in front of the lot), a parking lot of `cars` (makeCar, nose −z), a yellow
  SCHOOL BUS at the curb, `houses` across the street, hills + clouds; `aimSun`, `update(t)` (flag), own `fog` (save it).
- **A doubling premise that needs more doublings than real time allows (057):** keep "every 3 seconds" honest with a STORY CLOCK —
  T(t) piecewise-linear (real time for the first two beats to set the rule, then fast-forward), value = 2^(T/3), and a HUD clock
  line ("T+0:36") so the math checks out. 1 sheet → a buried school is ~31 doublings (1:33 of story time in 21 s of screen).
- **Voxel / blocky-game look (059, `engine/voxel/`, template `videos/_voxel-template`, docs/STYLES.md → voxel):** `VoxGrid` +
  `meshGrid(G, {bs})` = one merged mesh per grid of 1 m blocks (16 px NEAREST tiles from `blockAtlas()`, culled faces, baked corner
  AO); `boxModel(boxes, {bs})` / `itemFromCanvas` = colour-voxel props at any grain; `makeVoxPerson({...})` = a square-headed person
  (8 × 8 px faces, `FACES`, `ARMS` presets, `pose({walk, scale, armL/R, legL/R, head, face})`, `gripWorld`, `eyeWorld` for POV);
  `voxWorld` (sky, block clouds, sun from −z: `W.aim(x, z, half)` per shot), `buildVoxTown` (street + houses + MAPLE HIGH SCHOOL,
  `setBanner`, crushable `cars`), `buildVoxClassroom` (Room 4 + printer), `buildVoxBedroom`. `look`: neutral tone map, bloom 0.04, no
  grain. scribe.js `punnettFig()` + makeSheet `fig` (059, additive) = a hand-drawn Punnett square for biology sheets.

- **Voxel polar bear + night/1960 kit (068, `engine/voxel/bear.js`, reel `videos/068-mc-november-bear`):** `makeVoxBear()` = a blocky
  polar bear (bs 1/20, ~2.5 m) — `pose({mode: 'four'|'sit'|'upright', walk: phaseFor(d, s), pitch, head, jaw 0..1, eyes:
  'open'|'blink'|'happy'|'squint'|'wide', pawL/pawR: {x: WORLD angle, 0 = down}})`, `eyeWorld()`, `pawWorld()`. 068 shots.js has a
  night `voxWorld` (snow ground, a star + aurora sky texture swapped onto `W.sky`, moonlight via `W.hemi`/`W.sun`, pixel flakes that
  follow the camera), a 1960 film ShaderPass (warm grey + grain + vignette), a dream-bubble sprite, a bedside clock + flipping wall
  calendar, and the Scribe app as a portrait phone canvas (cam → flash → scan → 40 tiles → write with a zoom onto the Lewis figure).
  **Seated students in `buildVoxClassroom`: set each desk group's `rotation.y = 0`** (the set turns them so the chair faces the
  board; kids would sit with their backs to it) — find them by `room.D.desks` positions.
- **Isometric tilt-shift diorama look (060, `engine/iso/`; template `videos/_iso-template`; docs/STYLES.md → iso):** each place is a
  floating slab `makeBase({shape, w, d, h, top, soil})` (world on `B.world`, y = 0; cut soil strata on the sides; `B.update(t)` bobs)
  or a dollhouse room `makeRoom({w, d, h, floor, windows})`, over `isoBackdrop` (screen-space gradient void), lit by `isoLights`
  (`focus(x, z, half)` per shot), shot with `isoCam(studio, isoAt(t, keys))` (long lens framed by WIDTH: `frame` m, az/el degrees)
  and blurred by `addTiltShift(studio)` (a depth-aware pass before bloom: `ts.focusOn(worldPoint)` every frame, `ts.set({range:
  frame·0.09·k, ramp: frame·0.36·k})` per shot, k 2–3 for screen/paper inserts). People: `makeMini` (rig × 0.6, big head),
  `makePeg` (jointed toy figure with hats), `makePegCrowd` (instanced). Props: trees, houses, stalls, crane, plane, truck
  (`engine/iso/props.js`), Italy landmarks (`italy.js`: Pisa tower `setLean`, Duomo, Baptistery, city wall, Colosseum `setOven`),
  room furniture (`room.js`), analytic puffs (`fx.js`). Text: `makeIsoHud(story.iso)` (the @okwhatifcrazy landmark layout: kicker
  with a T+ clock, pinned title, left HUD per beat, subtitles, Scribe end card). DOM text is never blurred. Render ≈ 0.07 s/frame with motionBlur 2 (060's 60 s reel ≈ 2.5 min).

- **Motion-graphics look (`engine/mg/`, docs/STYLES.md → mg; template `videos/_mg-template`; proof reel 061):** a Kurzgesagt-like
  flat vector explainer on Canvas 2D (no WebGL, ≈0.07 s/frame). `createMG(studio)` → `M.render(t, SHOTS)` with transitions
  (`tr.kind` cut|fade|zoom|zoomout|slide|iris|wipe), `M.view(g, cam, depth, fn)` parallax layers; `draw.js` soft-gradient shapes +
  long shadows (`shape/circle/rrect/line(k draw-on)/ring/glow`); `people.js` round-headed `makeFolk` (IK arms `{to: [x, y]}`,
  `clapArms`, `drawHandsPOV`), `makeCrowd`/`drawCrowd`; `geo.js` `makeWorld()` globe with people-dots + flat maps + great circles;
  `charts.js` bars/lineChart/gauge; `type.js` `ktext`/`label`; `scenes.js` space/beach/street; `scribe2d.js` `makeWorksheet`
  (handwritten answers AND figures, stroke by stroke) + `scribeApp` (the app as a phone screen); `overlay.js` `mgOverlay(story)` =
  the whatif title/HUD/subtitles restyled with kinetic words; `endcard.js` the Scribe card. core.js HUD gained `fmt: 'hms'`
  (an h:mm:ss countdown); synth.py gained `hand_clap`, `mass_clap`, `phone_buzz`, `gull_cry`, `shutter`.
  In-world labels stay out of the HUD box (x < 600, y 430–690) and faces out of the subtitle band: `render.mjs --qc`.
- **Low-poly pixel-art look (`engine/pixel.js`, `engine/pixeltex.js`; template `videos/_pixel-template`):** `const pixel =
  addPixelPass(studio)` in build() appends a post pass after the grade; `pixel.set(n)` renders every frame in n×n blocks (1 = off,
  3–6 = the crunchy pixel-art look at 1080 wide), `pixel.set(n, {levels: 24})` posterizes, `{avg: 4}` averages each block (softer
  stair-steps that don't crawl on a moving camera). `mosaicAt(t, CUTS)` = a mosaic cut transition (blocks swell to ~54 px and back
  over 0.36 s): `pixel.set(Math.max(PIXEL, mosaicAt(t, CUTS)))` every frame. Pair it with crisp texel textures: `pixelTex(w, h,
  draw, {k, repeat})` paints at k× and keeps each block's MAJORITY colour (hard edges, no muddy blends), NEAREST-magnified;
  `speckle(g, w, h, base, palette, n, seed)` = seeded texture noise. Scaffold: `npm run new -- NNN-slug --from _pixel-template`.
- **VRoid anime characters = the anime look (054 Vex, Nov 9; supersedes the 2-D puppets below):** the user wants a real animated 3-D
  character like the reference reels ("an actual character rendered sprite that could move around… not a still image"). Build her
  in **VRoid Studio** (installed; a Unity app that ignores background clicks → needs full-screen control, ~30 min: ask the user
  first) from presets: face/eyes/eyeliner/lips/eyelid colour = makeup, hairstyle + hex colour, body sliders (drag with
  mouse-down → move → up; typing into the value boxes doesn't stick), Outfit → Tops/Bottoms = none leaves VRoid's black
  bandeau + briefs (= a bikini). Export → VRM 1.0 (faces +z) → `videos/NNN/x.vrm`; save the `.vroid` project in ~/Documents.
  `engine/vroid.js` `makeVroid(url, {textures, bust, thigh})` reads VRMC_vrm itself (no new dependency): humanoid bones, expression
  presets (happy/relaxed/angry/sad/surprised, aa/ih/ou/ee/oh visemes, blink/blinkLeft), cel shading (MToon's unlit fallback →
  MeshToonMaterial + emissive floor so shadows keep their hue) + an ink hull; `update(t, {x, z, rotY, pose, walk:{dist,speed},
  lean, tilt, nod, turn, look, mouth, vowel, face, hands, aim})` = AIM posing (bone directions in her frame) + finger shapes
  (relax/open/fist/point/peace/hold) + a walk cycle + procedural hair/bust sway. `dressGoth(V)` = shades, choker + cross, chains,
  chain belt, O-ring bat charm, side ties, spiked cuffs. Swap a texture at runtime (`textures: {Body_00_SKIN: png}`) — 054's
  goth lace bikini is painted on the 2048² body atlas (`vex-body.png`). Lip-sync = the active word's vowels (054 `lips()`).
  **The Ally (@allythetutor) look the user means = ONE sunny voxel beach for the whole reel** (pixel sun, block clouds, stilt huts
  with red/blue roofs, dunes, grass tufts, the sea BEHIND her — cameras look toward the sea, key light from behind the lens),
  every fact a prop/diorama on the sand beside her, the pixel pass at ~4 px, a small yellow pixel-font title + yellow fact
  cards at the top, one-word lowercase white pixel captions at ~72 %. 054's first cut used 3 px blocks + our old indoor sets
  (office/library/classroom) and the user said it "looks like our old video stuff": the PR (engine/pixel.js, pixeltex.js,
  _pixel-template) is only the post pass + textures — the world and the character are on us. 054 builds "stations" (turned
  180° so the sea is behind her) on `engine/sets/voxbeach.js`; `engine/pixelcaps.js` = the pixel text (lowercase, plain title).
  **v2 (Nov 9, user: "thin bikini, big boobs, big ass… as hot as possible"; manager: indirect viral topic, platform-safe):**
  the outfit is painted on VRoid's 2048² body atlas — render a labelled UV grid first (054 `uvdebug.png` trick: front centre
  x ≈ 1024, bust ≈ y 390–630, hips string ≈ y 1010, the back = the strip's two edges); erase VRoid's black bandeau/briefs by
  blending each column's skin above/below, then draw triangle cups + strings. Proportions = `makeVroid({bust: 1.2, thigh: 1.18})`.
  "Mommy" moments = a push-in that stays in (`bump`) + pixel hearts + a wink/kiss + a breath before the word. **Check
  stations against voxbeach's dunes** (a dune swallowed the desk: the shot rendered as flat sand).
  **064 (3 AM POV, Nov 9, user: "not informative… comfort you… make her thicker, bigger eyes, cuter but still goth"):** a cuter,
  thicker Vex IN CODE (no VRoid trip): `makeVroid({bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.07, eyes: 1.12})` + `vex-body2.png`
  (the bikini atlas minus the inner-thigh strip that read as a flap). Eyes scale x/y only (`setScalar` pushed the eyeballs out
  through the lids = goggles); half-lidded = `relaxed ≈ 0.15–0.35` + `blink ≈ 0.12` (relaxed 0.5 + blink 0.25 shut her eyes).
  Night: `voxbeach.setNight(1)` (navy sky, 700 stars at 5 px — 2 px vanished under the 4 px pixel pass, a pixel moon via
  `setSun(camPos, dir)` up-left of the aim) — **never call `setMood` after it** (setNight clears the mood cache, setMood(0)
  repaints a day sky). Night faces: a fill light AT the lens with intensity ∝ d^1.6 (camera→subject) = the same exposure at
  any distance (a fixed fill 0.4 m ahead blew close-ups white and hot-spotted the paper in the macro; off when she's not in shot).
  Smooth gestures: `ARMS` is exported; 064 `glide()` re-evaluates the shot's pose fn 0.04–0.32 s back and blends the arm
  directions over 0.28 s via `armL/armR` (pure, no state) — pose switches no longer snap. `makeScreen` on a `subjectSheet`:
  leave `subject` unset (a string subject printed the class line twice over the pack's). Shrink the magic pen's glow in a macro
  (`pen.glow` 0.022, it hid the H of H–O–H). Copy: the Scribe beat stays the product demo; the rest is comfort/tease (roast the
  homework → "aww" → "come here" → a wink → Scribe → "mommy won't tell" → bed) — flirty, adult, no kink lines, no promises.
  **065/066 (Nov 9, user via manager: "make sure there's some variance… we can do another thingy"):** each Vex reel changes FORMAT,
  PLACE and Scribe FEATURE, not just the subject — 064 POV on the night beach (snap → solve → write), 065 a RATING list in her goth
  bedroom (pixel rating cards = `pxbox` + two `pixelText` images at y ≈ 0.095, above her head in every medium shot; 0.165 sat on her
  hair; feature = one practice sheet + the Messiness slider), 066 a GRWM at a golden-hour café (step cards = callouts; feature = PDF
  upload → blanks + table cells filled ON the worksheet, Pencil ink, Download PDF; a custom worksheet canvas + penKit/FIG.market drawn
  in a graphite `loadHand(url, '#55575e')`). Check every feature claim against the Scribe README (§Worksheets, §Teaching it your
  handwriting, §The handwriting picker). Scribe screens on a laptop: design them inside the middle ~620 px of the 1280 canvas (a
  vertical frame crops the rest). **Never call `layoutHand` inside update()**: it makes a canvas per glyph, so 065's per-frame preview
  crashed Chrome at frame 271 ("Target closed") — lay out once, redraw a canvas only when its value changes. Hand props (liner,
  lipstick, latte) ride the bones (`VEX.bpos('rightIndexDistal')`) after `update`; keep the hand BESIDE the face (a hand in front of it
  hid the face) and aim the prop at the eye/mouth (`H.rightEye`). A render that fails with "WS endpoint" / "captureScreenshot timed
  out" while other sessions render is load (avg 50–90), not your code: retry.
  **067 (Nov 9, user via manager): real, current memes + new look + new voices.** Vex voices ALTERNATE between the user's two Fish
  picks, "Mommy" `5233336f5f44460ea0902b0802375451` (067) and "Dolly" `ce3b16c14af54adebba5ebe50a3d4417` (breathy British, next);
  never "Authentic Conversational Storyteller" (its own description says a young girl). Check a library voice with
  `GET api.fish.audio/model/<id>` (title/description/tags) before using it. "Mommy" trails seconds of breathy sighs after a line:
  script.json `"endPad": 0.35` (narrate.py, opt-in) ends each clip 0.35 s after its last word (the hook went 6.9 → 2.3 s). Trends:
  research the week's TikTok trends (newengen.com/insights/tiktok-trends, trendhaus.ai) and pick one that fits her (067 = "Why Would
  I Deceive You?": meme setup cards in white pixel text + her deadpan line, our own voice saying it, never the trend audio). Look:
  eyes 1.24 + head 1.08 for "bigger, cuter, still dominant" — and **never `happy` for her resting face** (VRoid's happy closes the
  eyes into arcs); dominant = `relaxed 0.1, angry 0.12` (a brow arch), `happy` only for a laugh. The chest shading (067
  `shadeBody`) is a runtime canvas pass on the body atlas: blurred rose strokes (cleavage line, inner-cup shade, under-cup crescents)
  multiplied on once — same coverage. `dressGoth` now returns `M.shades` (the hair shades); a clone on her eyes in neon pink reads as
  party shades (black ones read as a censor bar).
  **Re-voicing a Vex reel (Nov 9, 065/066/_vex-golden-pov):** a new Fish voice re-lays the whole reel for free (shots + cues anchor on
  word times) — set `fish.reference_id` + 067 v2's voice block (`temperature 0.58`, `"breath": {"db": -9, "keep": 0.25, "margin": 0.06}`,
  `endPad 0.2`, `maxPause 0.25`) and `"headPad": 0.1` (narrate.py, opt-in: drops the hum/inhale "Mommy" ad-libs BEFORE the first word;
  `"pauseByWords": true` = cut pauses by Fish's word times when breath fills them). Fish's word times match the audio (whisper's starts
  run 0.3–0.5 s early after a pause — don't "fix" the timings from whisper); re-roll a flagged take by moving its voice/fish-<beat>-<hash>
  files away and re-running (zsh: quote `"slug:hook"` — `$s:h` is a zsh modifier). Dolly's pauses are silent, so the shared settings
  run her ~8 % shorter than a 0.4 s cap. **Product shots render crisp: `pixel.set(sh.screen || sh.write ? 1 : Math.max(PIXEL,
  mosaicAt(t, CUTS)))`** — block 2 plus a mosaic swell at both ends of a 1.9 s Punnett macro read as pixel mush (draft fix).
  **Props a Vex hand holds (Nov 9, user on 066: "that shit's just floating or going through her") = 066's hold kit (copy it from
  videos/066-vex-grwm-econ/shots.js):** contact points are face-mesh VERTICES found from the Face_00_SKIN boundary loops (the outer corner
  of the right eye opening, the lower lip's inner edge — `fpos(i)` follows blinks + mouth shapes); `holdPose(t, P, side, {target, axis,
  palmN, grip: 'pinch'|'palm', pole, shape})` = a two-bone reach (`armR`/`armL`) + hand aim + palm twist (split 55/45 forearm/hand),
  iterated 5× on the MEASURED grip; the prop is then placed from that hand's bones every frame (pencil/lipstick through the pinch,
  compact on the palm, cup centre = palm + N·0.05 with its up = the knuckle line). vroid.js hands take a raw curl array
  `[thumb, index, middle, ring, little]` (PINCH 0.62/0.7/1.15/1.3/1.35, cup grip 0.35…0.74). **054's `kiss` preset puts the hand ON her
  chest with the forearm inside her bust at 067's proportions** (065 heart, 066 + 067 endings): reach the fingertips to the lips (7.8 cm
  below + 8.2 cm in front of the eye bones in head space) with the elbow OUT AND FORWARD (pole her (−0.9, −0.35, 0.75)) and blend from
  the neighbouring preset, never through the kiss preset. Check every held prop with `--cam side|side2|above|close|wide|wide2` (066).
  A hand-held phone prop seen from overhead needs fingers + thumb curled OVER its long edges with the nails on top (065/067 snap).
  **Breath, user (Nov 9, on 067): "a tiny bit less breathing and moaning… we don't want to scare off our viewers" — the default for
  EVERY Vex reel:** script.json `"endPad": 0.2`, `"maxPause": 0.25`, `"breath": {"db": -9, "keep": 0.25, "margin": 0.06}` (narrate.py
  `soften_breaths`, opt-in: between two words the take drops 9 dB and any gap over 0.25 s loses its middle; words untouched; a beat
  with `"breathy": true` keeps its sigh), Fish `"temperature": 0.58`. 067 went 46.9 → 39.4 s with the same lines. Lower temperature
  slurred one take ("mommy deceive" → "mom need to see"): run check_voice and re-roll a bad take (move its voice/ files aside).
  **071 (Nov 9, user: "cut down on the mommy stuff… the big titty hot anime girl is already good enough… experiment"): the LIGHTER
  persona** — no mommy/baby lines, no sighs, Vex confident and teasing (and a hook/caption without "mommy", to compare against
  064–067). Format "Me vs My Insta Feed": a DOM canvas post frame (a generic avatar/likes/caption layout, never a real app's logo) +
  a CSS `filter` on `studio.renderer.domElement` per shot (feed warm/saturated, reality flat) — the render screenshots the page, so
  CSS filters land in the video; MY FEED / REALITY pixel labels. Canvas text: no emoji (headless Chrome may lack a colour-emoji font).
  A yellow legal pad = the sheet canvas MULTIPLIED onto a yellow, ruled, red-margined canvas (no scribe.js change).
  **Props rule for EVERY Vex reel (user, Nov 9, on 066's GRWM: props "floating or going through her… make sure the stuff is rendered
  properly"):** every handheld prop is parented to the hand bone (`VEX.attach('rightHand', …)`) with a real grip shape, not placed
  near the hand each frame; anything that touches the face TOUCHES it (lipstick on the lip, liner at the eye corner, a straw at the
  lips) and never passes inside; cups, phones and books never intersect her body. Check it before the full render with stills every
  0.25 s through each prop beat PLUS a side debug view (071: a temporary camera override in update() for two still times, rendered,
  then the file restored from a copy).
  **072 (Nov 9): the EXPLAINER format** ("explainer vids are really good… like data centers… with goth mommy"): true, sourced numbers
  (caption.md comment), Vex in the place (an AI data hall: two rack rows whose LEDs are ONE InstancedMesh blinking by `hash(i,
  floor(t·rate))`, thin red/blue coolant pipes with scrolling textures, a compute tray that slides OUT only for its close-up — pulled
  out it sat between the lens and her), a campus aerial at dusk, and **pixel diagram cards**: an overlay canvas drawn at 270 × 480 and
  shown ×4 with `image-rendering: pixelated` (houses lighting up, a counter, a steaming chat bubble, a battery + drops), placed low
  (y ≈ 0.41–0.69) so her face clears them. **Scribe on screen by ~60 %** (docs/lanes/scribe.md): an explainer runs long — reorder
  (072 moved its "five drops" fact after Scribe as the closer). **Scribe writes ON SCREEN, never a pen on paper by itself** (user,
  Nov 9): a portrait phone screen canvas (fits the vertical frame) where `sheet.draw(p)` lands stroke by stroke with an on-screen pen
  cursor at the tip, then the desk row (pages · Shuffle · Replay · Export PDF); the camera rides the screen (`phoneCam(u, v, d)`).
  **076 (Nov 9, energy drinks, hour-by-hour explainer):** a HANDHELD CAN that stands upright = attach it to `leftHand` with its axis
  along the knuckle line (index − little proximal; a fist holds a cylinder that way), centred in the palm (`cross(fwd, axis)` for the
  left hand), then search `aim: {'twist.leftLowerArm': tw, leftHand: dir}` per arm preset at build for the can's most upright axis and
  blend tw/dir with the arm glide (076 `CANFIX`); the knuckle-line can with no twist search sat at 45°. Card beats: frame her face at
  ≈ 0.27–0.36 of the frame (cards 0.44–0.69, a clock HUD at 0.165–0.235 left) — close-ups go only where no card shows. A dropped prop =
  a copy that starts at the held one's world pose at the release time (pose her at that t once at build). Half-size `--stills` garble
  the pixel callouts after a colon (downsampling); check them with `--full`. Scribe feature shown: a TYPED problem (README §The
  composer) → the desk's waiting page (logo + "Be patient…" in the hand) → the page. Made-up can brands only (BZZT, ZOOMR, YIKES…).
  **Lights BEHIND Vex blow her skin to flat white** (076 review): her toon ramp starts at 0.7, so a point light at her back still
  lights her front at 70 %; the fridge glow 0.6 m behind her turned her face into a white mask. Keep glow lights inside the prop
  (cabinet) with a short `distance` that ends before her, and compare cheek RGB against a shaded reference shot (076: ~235/213/205).
- **Mocap stage + neon beach strip (075, Vex "Why GTA 6 took 13 years" explainer):** `engine/sets/mocap.js` `buildMocap(studio)` = a
  performance-capture stage (taped 9 m volume, a truss ring of ~30 cameras with red IR rings `update(t)`, crash mats, a pipe-frame car
  buck `D.buck` (`seatY`, `wheel`), apple boxes, suit rack, QUIET sign, a big retarget screen `wall` + three video-village `monitors`
  (canvas textures; `drawSolve(ctx, w, h, joints2d)` = a dot-and-bone skeleton), the director's desk `D.desk` facing −x with a phone on
  a stand (`phScr`/`phT` 720 × 1500 = the Scribe screen), 4 `actors` = makePerson rigs in black marker suits). `engine/sets/neonstrip.js`
  `buildNeonStrip(studio)` = a generic 1980s Florida beach boulevard at sunset (pastel deco hotels with neon word signs, palms
  `makePalm`, low coupes `makeCoupe`, a banded synthwave sun over the sea at −z, umbrellas, a lifeguard tower, `walkers` rigs,
  `aimSun`, own `fog`, far ≥ 700). Lessons: **`Vector3.project(studio.camera)` inside update() needs `studio.camera.updateMatrixWorld()`
  after `setCamera`** (matrixWorldInverse is a frame stale: 075's NPC tags landed where the previous shot's camera was); a vertical
  frame shows a 16:9 screen only in part — pan across it (075 `screen`); a moving car's lane must stay ≥ 2 m off every lens in its
  time window (075's first coupe drove through the sunset camera); keep pixel cards above the caption word (panel bottom ≤ 0.675 of
  the frame: 072's cards ran to 0.745, under the word). `engine/pixelcaps.js` gained `$` (additive).
- **2-D anime characters as puppets (054 goth cheat-tutor, Nov 8):** the user's bar is a polished anime ILLUSTRATION (benchmark
  in `videos/_goth-model/`); code-built 3-D (engine/goth.js, then a Blender body + engine/anime.js) never got close ("ugly").
  So the art is generated LOCALLY: `tools/anime/gen.py job.json` = Animagine XL 4.0 (SDXL, Open RAIL++-M, commercial OK) via
  diffusers on MPS, venv `~/.cache/edstudio/sdxl` (python 3.12; model in the HF cache, ~7 GB, run with `HF_HUB_OFFLINE=1`).
  Character block `CHAR` + quality tail + negative live in gen.py; prompts are encoded in 75-token chunks (SDXL's CLIP stops
  at 77 — the long character block silently cut the pose + background until then). Jobs: txt2img (+ `hires`), img2img
  (`init` + `strength`), inpaint (`init` + `mask` ellipses: blink / talk frames; the result is composited back so ONLY the
  mask changes — the VAE round trip shifts colours elsewhere = flicker on a swap). Put composition tags FIRST (1girl, solo,
  cowboy shot, pose, white background) then `{char}`. `tools/anime/cut.py` = rembg isnet-anime cut-out (variants reuse the
  base alpha). `engine/puppet.js` `makePuppet({base, faces, height, rig})` = the cut-out on a subdivided plane whose vertex
  shader breathes the chest, sways hair ellipses, tilts/bobs the head round the neck and leans the body; `update(t, {camera,
  talk, face, headA, bob, sway})` billboards it and swaps face frames (auto-blink). It sits in any voxel set under the pixel
  pass (`engine/sets/voxbeach.js` = the benchmark's beach house; dev scene `videos/_puppet-dev`). A cowboy-shot cut-out ends
  at the thighs: frame its bottom edge out of shot (or use full-body art for wides). Generation on a busy Mac: ~1–7 min/image.
- **Penguins + Antarctic sea ice (063, `engine/build/penguins.js`, toon look):** `makePenguin({tuft, bow, fat, chest, ear})` = an
  emperor penguin with the toon face kit (`set({x, z, rotY, waddle, lie 0..1 = belly slide, flipL/flipR {z out, x fwd}, head, eyes
  'open'|'wide'|'half'|'closed'|'happy'|'spiral'|'x', look, brows, mouth 'flat'|'o'|'scream'|'smile', drift (snowed in to the beak),
  ice (frozen in a block), frost (cap + icicles), thin (starving), pouch (the brood fold over an egg), hot, shades, squash, t})`;
  `makePenguinCrowd(parent, n)` = an instanced huddle of hundreds (`set(i, {...})` + `commit(n)`), `makeEgg()` (greenish, oversized:
  a cream egg vanished on white snow), `makeLeopardSeal()` (`set({rise, open, lunge})`, a toothy grin), `buildIce(studio)` = colony
  plain, a floe edge + a tongue at `D.edgeX/tongueX` with open water, ice cliffs + bergs, mountains inland (−x), pastel polar sky,
  `setNight(k)` (stars + an aurora for a time-lapse), `setWeather(k)` (blizzard fog, geometric), `aimSun`, `update(t, camera)`; far ≥ 2600.
  Pair with winter.js `makeSnowfall` (center the box ~6 m AHEAD of the lens). An egg on a penguin's feet sits at local z ≈ 0.27 (the
  belly hides anything further back). scribe.js (063, additive): a problem `{chain: ['algae', 'krill', …], u, gap}` = a hand-drawn
  food chain (each label written + circled, hand arrows between) — make it the LAST problem and lift the macro lens off the pen tip
  to frame the whole row as it's drawn; `makeScreen(…, {subject: 'Biology'})` = a subject chip + "BIOLOGY · showing work + diagrams".

- **Airport kit (062, `engine/build/airport.js`, toon look):** `buildAirfield(studio)` = ONE world at the origin: runway along +x
  (threshold x 0, 45 m, markings, edge + approach lights), a perimeter fence across the approach with a planespotter spot outside it
  (`AD.spot`), apron + gate (`AD.gate`: park jet.js `makeAirliner` there nose +x), a glass AIRPORT terminal + jet bridges, tower,
  hangar, tug + carts, fuel truck, cones, windsock, far hills; a camera-following sky (`setMood('day'|'air')`) and a CLOUD LAYER for
  flight shots (`'air'` shows a deck at `AD.cloudY` and hides the ground). `buildSecurity(studio)` = a checkpoint (walk-through
  arch `detector.setLight('green'|'red')`, x-ray belt + `bins[]`, stanchions, SECURITY sign, departures board). `makeCockpit()` =
  a flight deck (x = nose): live panel `setSpeed(knots, alt, pitch)`, `setThrottle(0..1)`, seats `S.seatL/R`, yokes, windshield —
  parent it to the airliner body at its nose, hide the airliner's own parts, and set `camera.up` to the plane's up (the world tilts,
  not the cockpit). `relivery(air, name)` repaints jet.js's GARY AIR livery + fin logo. Props: `makePretzel`, `makePretzelBag`
  (`open(k)`), `makeCup` (`setLevel`), `makePaperPlane(map)`, `makeWand`, `makeSuitcase`, `makeTug`, `makeBoxers(toon)` (heart
  boxers + the dropped pants round the ankles). jet.js's `makeEngine` doubles as a closed turbofan on any shot: full `set({...})` +
  `updateClip()` then `clip.constant = 1e6` (no cut); leave the clip for the cutaway. `engine/build/scribe.js` (062, additive):
  problems take `rows: n` (taller rows) and `fbd: {x, dy, len}` = a hand-drawn free-body diagram (a little plane + labelled
  Lift/Weight/Thrust/Drag arrows, items tagged `body|lift|weight|thrust|drag|work` so shots key each arrow to its spoken word);
  `makeScreen(…, { subject: 'Physics' })` adds a subject chip to the solve/write panels.
- **Sim style — Sims-like realistic 3D (052, `engine/sim/`; docs/STYLES.md → sim; template `videos/_sim-template`):** @officialwriteit's
  hit look. `buildSimHouse(studio)` = a dollhouse-cut ranch house (front walls gone at z = 0, floor `FY` 0.62 on joists over a crawlspace,
  a cut soil slab, pink ceiling insulation, a gable roof cut through its rafters; rooms bedroom | hall | kitchen | living, `D.rooms`) with
  handles for a bedroom you upgrade (`H.bed.g` moves the bed + its children, lamp, switch, clock, calendar, side-window sash, `setDay`).
  `makeSim({...})` = a realistic-proportion person on **rig.js's skeleton** (drive it with `applyPose`; then `simFace` for jaw/eyes/brows,
  `legsOut` for sitting up in bed, `lift(p, FY)` to stand on the raised floor). `simMat(kind)` = real-world canvas materials,
  `simLights` = IBL + soft sun, `SIM_LOOK` = the grade, `engine/sim/props.js` = upgrade props (mini fridge, rope/pulley, swing desk,
  half-pipe chute, robot arm, drone, printer, rails…), `makeSimHud` = sim-styled one-word captions + DAY counter + Scribe end card.
  ~0.1 s/frame at 30 fps.

- **Flat 2D cartoon look (053, `engine/flat2d/`, docs/STYLES.md → flat2d; template `videos/_flat2d-template`):** Canvas 2D, no
  WebGL — `const S = await createStage(studio)` lays a 2D canvas over the idle GL one (studio.render → no-op) under `#ui` (the build
  one-word captions stay on top). `S.begin(t, {x, y, z, r}, hits)` → draw the world with `S.I` (`makeInk`: `shape/rect/ellipse/limb/
  line/text`, outlines boil 8×/s, one cel-shade step) → `S.screen()` for frame-px overlays → `S.end()`; `shotAt(t, SHOTS, K)` cuts on
  words. Cast: `makePuppet({kind: 'kid'|'teen'|'adult', hairStyle, top, bottom, extras: {goggles, glasses, freckles}})` → `draw(I,
  pose)` (eyes/brows/mouth sets, `ARM.*` presets, `hand/foot/headAt/seatY`, `talkAt` mouth flaps); sets.js rooms + furniture +
  laptop2d/phone2d/tablet2d/paper2d (Scribe's `makeSheet().canvas`), `nameTag`, `board` (the INVENTIONS counter); fx.js (burst, puffs,
  explosion, confetti…); critters.js (dog, robot dog); `drawEndCard(S, icon, age)`. `S.face(P.headAt(pose))` + `S.qcCaptions` →
  `render.mjs --qc` lists faces under the caption band. ≈0.08 s/frame at 30 fps (the cheapest look). `npm run new -- NNN --from
  _flat2d-template` now also copies script.json + make_cues.py.

- **@whatifpov text layer + VHS rewind (056, Scribe dupe):** script.json `"mode": "pov"` (+ a `"sub"` line per beat, numerals allowed:
  "Day 3: nobody notices.") → `tools/narrate.py` passes both to story.json and `engine/main.js` skips its own overlay; shots.js draws
  `createPov({title, rewind, hud: {show, label, value(t), facts: [[t, text, warn]], bpm(t)}, subs, end})` (`engine/build/pov.js`: serif
  question title, top-left HUD = caps label / big serif "Day N" / a tracked-caps fact line (amber = warning) / a red-dot BPM + static
  ECG, italic serif subtitles at 66 %, the ⏪ icon, the Scribe end card) and `addVhsPass(studio).set(k, t)` (`engine/build/vhs.js`:
  tracking tears, a rolling noise bar, chroma split, scanlines). **Cold open + rewind for free:** keep `update(t)` pure and render
  the picture at a remapped story time τ — the cold open replays a LATER state (τ = the train after it emptied), the rewind plays
  earlier shots backwards (τ runs down through 3–4 shots in 0.8 s) under the VHS pass. 056 shots.js also has: a fly swarm
  (instanced bodies + flapping wings orbiting a point, `flee` scatters them), wavy stink-line sprites drawn AFTER the camera and
  pushed away from the lens (they crossed faces otherwise), soap-bubble sprites, a homework tower (`makeStack(n)` of paper reams,
  `setN(k)`), a POV forearm + coffee cup in camera space (cup tilted by the camera pitch so it stays upright), a 10-ft pole.
- **Scribe subject packs (Nov 9, `engine/build/subjects.js`; docs/PROMO.md → Subject packs):** `subjectSheet(G, 'chemistry' |
  'biology' | 'physics' | 'economics' | 'math', over)` = a ready worksheet written in Scribe's hand WITH its pen-drawn figure
  (balanced equation + Lewis H₂O + ICE · Punnett Bb × Bb + food chain + labelled cell · ramp FBD + plane FBD · supply shift + payoff
  matrix · 049's calculus page); `makeScreen(G, icon, sheet)` then shows the class line + one captioned tile per problem. Build your
  own page with `makeSheet({ rich: true, problems: [{ q, h, a, fig: ({ k, y }) => FIG.x(k, …) }] })`; scribe.js adds `writeHand`
  (`_sub`, `^{..}`, pen-drawn O → ⇌ ° μ × $ % and H — the demo hand's H reads "lt") and `penKit` (line, arrow, grid, ring…).
  All packs on one frame: `videos/_subjects-demo/packs.jpg`. **After any scribe.js change run `node tools/scribe-check.mjs`**
  (every shipped reel's sheets + screens must stay pixel-identical to main's).

- **Hippo + burger joint + sim text layout (055, Scribe dupe of @okwhatifcrazy's hippo reel):** `engine/hippo.js` `makeHippo({name})`
  → `{g, headG, jawL, legs, cap, badge.set(text, gold), anchors.{mouth, nose, head, back, jaw}, update(t, s)}` with `s = {walk|run +
  dist, open 0..1 (1 = a real 150° gape: 35 % head up + 65 % jaw down), chew, pitch/yaw/roll, eyes 'open'|'closed'|'happy'|'wide'|'sad',
  lids, lookX/Y, ears 0..1 (pinned back), squeeze 0..1 (cartoon squash through a door), lean (+ nose down; −0.3 + `y` 0.27 = rearing
  at a counter so the yawn clears it), sink (m, into water), wet 0..1, wag}`; 4 m long, 1.6 m wide, 1.7 m to the ears; set
  `g.rotation.order = 'YXZ'` to roll him (belly flop). `engine/sets/burger.js` `buildBurger(studio)` = CHOMPY'S inside and out
  (dining room with booths + 4-tops `tables[i] = {g, chairs, cond}`, counter + registers + menu boards, kitchen, FIZZ fountain
  `nozzles`, salad bar `setEaten(0..1)`, `doorFrame` that can pop off, `setFlood`, `setMess`, `setNight` (chairs up), outside: facade +
  NOW HIRING, lot, cars, drive-thru lane + `menuBoard`, a pond that digs itself `setPond(dig, fill)` + `setLaneFlood`, `hippoLane`
  sign; far ≥ 320). `engine/simhud.js` `makeSimHud(story.sim)` = the "What if" sim layout (question alone in the middle, then it
  glides up once and stays as the header; a left HUD per beat with a coloured bar, label, big number + unit, coloured sub-label; bold
  white subtitles in the lower third; the Scribe end card) — hide the core `title/hud/sub/end` elements when you use it. `makeScreen`
  (scribe.js) takes `{n, name, subject}` (problem count, the student's name, a CHEMISTRY · 20 PROBLEMS label; defaults = 049).
- **Chemistry worksheets (055, user steer Nov 9: not always math):** `layoutHand` takes `_x` = subscript (CH_4, H_2O); `makeSheet`
  problems take `lewis: 'H2O'|'CO2'` = a Lewis structure drawn by the pen (atoms in the hand, bond lines, lone-pair dots) next to the
  answer. The demo hand has NO capital O (it falls back to a small o: CO_2 reads "Co₂", cobalt) — build one per video from the o +
  the C's cap height (055 shots.js, `G.O`), as Scribe's own sheet has a capital-O box for exactly this.
- **A scripted replace that appends `// comment` after the code it matched still comments out the REST of that line (055, twice):**
  `gShape.holes.push(hole)` vanished (the pond rendered as grass) and so did a banner's `side = DoubleSide`. Put the comment at the
  very end of the line, and run both comment greps (Hard-won rules) after every scripted edit.

- **Blocky-avatar game look (069, `engine/rbx/`, docs/STYLES.md → rbx; template `videos/_rbx-template`):** `import * as R from
  '@engine/rbx/index.js'`. `R.rbxWorld(studio)` = studded grey baseplate + painted sky + sun/hemi + plastic IBL (`W.aim(x, z, half)`
  per shot; story.look = `R.RBX_LOOK`, neutral tone mapping). `R.makeAvatar({skin, shirt, pants, sleeve, print, hair, hat, face})` →
  `P.pose({x, z, rotY, walk: P.phaseFor(d), run, jump, sit + seat, tip (dive/fall), armL/armR {a forward, s outward}, head, face})`,
  `P.shatter(t, t0, pose0, {dir})` = the "oof" (parts tumble + settle, stateless), `R.FACES` / `R.ARMS`, `P.addHat('dogears')`.
  `R.makeTags/makeBubbles/makeChatLog` (name tags, chat bubbles sized for the lens, a DOM chat log), obby props (`makeSpinner`,
  `makeLava`, `makeCheckpoint`, `makeTruss`, `makeCoin`, `makeSign`), `makeBlockDog` (a corgi), `rbxCrowd` (instanced seated crowd),
  `makeRbxFX` (confetti, puffs, plastic bits, `pow('OOF!')`), `buildStadium` (football stadium, jumbotron `setScreen`, race gate +
  finish ribbon), `rbxBedroom` (night) / `rbxClassroom`. Our own design only: no game's logo/name/UI/sounds (our "oof" = thud + bonk +
  plastic bits). `pose()` resets `root.visible` (pass `visible`); drop the baseplate under any floor slab (z-fight).

## User's taste (direct feedback — non-negotiable)
- **Every video delivery includes its caption, pasted in full in the final message** (user: "where's the caption? make sure every
  video generation has a caption"). That means every first cut AND every revision: write or update `caption.md`, commit it with
  the video, and paste the caption text (paste-ready, without the sources comment) in the report next to the file path.
  `tools/render.mjs` warns when caption.md is missing or still the template. If a revision changes what the video shows,
  update the caption to match.
- **Captions NEVER carry a link or a plug (user rule, Nov 8 — supersedes the Oct 23 course-link rule and the tryscribe.ink
  caption line):** "a lot of my videos never performed well because we put links in them… TikTok is gonna destroy our videos if
  they have links or very clear advertisement in the captions. In the videos, it can't tell." So: no URL of any kind (no
  payhip.com course line, no tryscribe.ink, no "link in bio"), no "try Scribe / 10 free assignments" pitch, no sales line. A
  caption = hook + emoji, optionally 1–2 short sentences / a 👇 question / "Send this to your ___", then the hashtags — e.g. the
  Scribe TikToks: `What if your balls doubled in size every minute? 😳 #fyp #balls #homework #college #cheating`. The plug lives
  ONLY in the video (end card, on-screen product). `tools/caption.py` fails and `render.mjs` warns on any link or plug line.
  Scribe lane brief: `docs/lanes/scribe.md`.
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
- **Never rename a sound a shipped reel uses (Nov 8, merging 033 into main):** synth.py seeds every bed's noise with its NAME
  (`seeded("amb", sound, seed)`), so 033's fire renamed to `fire_roar` re-rolled its whole ambience (stem corr 0.44). When two
  branches register one name with different parameters, keep the name and route by the arguments (`amb_fire`: `intensity` → 033,
  `size` → 037). After a merge, re-synthesize every reel whose sounds were touched and `cmp` audio.wav with the shipped one.
- **Look at stills before every full render.** A full render is ~3–6 min; a still sheet is ~30 s.
- **Anything aimed at the camera (`lookAt(camera.position)`) must be posed AFTER `setCamera` in update() (074):** before it, the
  camera still holds the previous frame — in a still batch that is another shot's camera, so 074's held worksheet turned edge-on and
  hid behind her. Same for billboards/cards placed from the camera position.
- **A sky dome that follows the camera in `onBeforeRender` must convert the camera into its root's LOCAL space** when the set is parked
  at an offset (`root.worldToLocal`) — 029's harbor sky copied the world position into a child of a root at x = 6000 and rendered
  pure black. city.js gets away with it only because it stays at the origin. Also set `frustumCulled = false` on it.
- **Additive glows are drawn after every opaque mesh, whatever `renderOrder` says** (opaque and transparent lists sort separately):
  029's black eclipse Moon (an opaque MeshBasic disc) was washed white by the additive corona sprite. Make the disc `transparent: true`
  so `renderOrder` puts it on top.
- **Ride the lens on a rising water level** (029 floodB: `P.y = level + 0.55`, aim fixed relative to it): the water fills the bottom of
  the frame and the rise is felt; a fixed camera over a rising flat plane just looks like a blue floor coming up.
- **The render log now shows page `console.warn`** (`[page] …`): Puppeteer reports it as type `'warn'`, and tools/render.mjs only
  printed `'warning'`/`'error'`, so every lint warning from page code (e.g. engine/build/rail.js speed checks) was silently lost.
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
  064 hit it AGAIN through a Python `replace` that added `// comment` before `const c = …` on a one-line block (the coffee and the
  mug handle vanished, no error): grep `//.*(const|let) [A-Za-z_]+ = ` too.
  It misses `…}); // note foo.bar(x);` (no `;` inside the comment before the code): also run
  `grep -nE "//.*[A-Za-z_]+(\.[A-Za-z_]+)*\([^)]*\);\s*$|//.*[A-Za-z_]+\.[A-Za-z_.]+ = [^;]+;\s*$"` and read each hit (039 lost a character to it).
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
- **Scripted block splices: search the END anchor from the START anchor's index** (`s.index(end, a)`) — 028 spliced to an
  `if (cam === 'pool')` that also appeared earlier in the file and duplicated 300 lines (`node --check`: "Identifier 'cab' has
  already been declared"). Assert `b > a` and that each anchor is unique before writing.
- **After resolving a merge in a shared file, run `node --check`** (copy to `.mjs` first). Two sessions appending to props.js lost a
  closing brace in the merge. Also `git fetch` + `ls .claude/worktrees` + `ops/ledger.csv` before picking NNN — numbers get claimed in worktrees before they're pushed,
  and the operation's manager assigns them (ask it): the build reel took 015 while the manager gave 015 to tail-lies → renumbered 024 at merge.
- **Readable props (phone screens, posters, signs)** must sit in the clear band: ≈38–65 % of frame height and right of x≈40 %,
  so the HUD (top-left) and subtitles (≈70 %) never cover their text. Phones read best as a POV shot: camera 0.17 m in front of
  the face, aimed at the screen (006). Keep any line of card text above the subtitle band.
- **Floating labels/cards above heads (008) must be sized for the lens:** frame width at distance d = 2·d·tan(fov/2)·9/16
  (≈1.6 m at 3.5 m, fov 48). A hero card reads at ~50–70 % of that width; 008's first sheet had 0.8 m cards at 7 m = unreadable.
  Move the camera in (≈3 m for heroes) instead of only scaling the card. In crowds, **stagger card heights** (3 lifts) or they
  form one row that hides itself. `clamp(x)` is 0..1 — never use it for a row count (008's history rows never appeared).
- **Props that live inside a set's root use the set's LOCAL space** (009: the muzzle flash was posed with world coordinates
  inside the theatre root parked at x=7000 → rendered 7 km away). 038 hit it again: a prop posed with `W()` world coords but added to
  `liv.root` simply never appeared (no error) — if a prop is missing from a still, check its parent before anything else. Convert with `set.root.worldToLocal(v)`. And call
  `rig.root.updateMatrixWorld(true)` before `localToWorld` on anything in a rig you just posed (matrices are a frame stale).
- **To film into an enclosed space (a theatre box, a booth), hide one wall/post for that shot only** — a film cheat no viewer
  notices; better than a camera angle where the key action is hidden behind a head (009 theatre).
- **Page never becomes ready / render times out with no error = an infinite loop in build()** (009: iterating `crown.children`
  while adding snow caps to it). Iterate over a copy (`[...g.children]`). Bisect with `console.log` between builders.
- **A mesh that renders flat white = undefined material** (three.js falls back to a white MeshBasicMaterial). 009: `arr[i % 3]`
  with a negative `i` → `arr[-1]`. Use `((i % n) + n) % n`. To identify any mystery pixel, serve the repo
  (`python3 -m http.server`), open the page in the browser pane, expose `window.__studio = studio` temporarily, and raycast
  from `studio.camera` at that pixel (prints geometry, world point, material).
- **Frame every camera with `python3 -I tools/bearing.py checks.py` BEFORE the first still** (015: half the first sheet missed its
  subjects — a court with nobody in it, a poker table showing only the dealer). It prints each named point's x%/y% in the 9:16 frame
  and flags OUT / under-the-HUD. Two people side by side need the camera ≥ 2.9 m away at fov 54 for ±0.5 m; a 3.5 m poker table
  only fits shot down its long axis; an over-the-shoulder two-shot in a vertical frame hides the far person behind the near head.
- **Hiding set pieces by position? Filter `o.isMesh`.** Lights are children of the set root too: 015 hid street.js's hemisphere
  light (it sits at (0,1,0)) with a "hide the lamp posts near z≈0" rule, and every shadow in the shot went pitch black.
- **Shooting a pet in a crate/cage (021):** people outside it have their faces ABOVE the crate's top (0.68 m), so a lens inside
  the crate sees them through the top bars — hide `crate.panels.top` for those shots (and the panel between the lens and Pip
  for his close-ups). Wires across a face read as noise; the remaining bars still say "crate". From inside, keep the hero
  low (lying) so only his ears sit in the bottom of the frame and the human face carries the shot.
- **Pose lineup at t ≥ 200 must hide `#ui`** (`document.getElementById('ui').style.display = 'none'`) — past `duration` the
  end card + final fade cover every lineup frame (021's first lineup sheet was 18 black end cards).
- **Never put a camera where a character can walk (023):** two first-sheet shots rendered as one flat colour — the lens sat
  inside a crouching neighbor and inside a kid standing on the sidewalk. When a shot looks like a solid wall of colour, check
  every rig's position against the camera's, and keep walkers' paths (Mia following Pip) off the lens line.
- **A small dog + a tall object in a vertical frame needs 2–3 quick angles, not one** (023's 3.6 m inflatable cat): over his
  shoulder up at it, a reverse close-up on his face for the gag line, then a wide for the payoff. One wide made Pip a speck.
- **Pip close-ups: keep the lens ≥ 0.8 m and never use `eyes: 'closed'`/`'sad'` lids in a face-filling shot (030):** at 0.5 m
  his pupils poke through a fully closed lid and read as "X" eyes (a dead/hurt cartoon cue — off-brand). Use `eyes: 'open'` +
  `lids ≤ 0.6` + `sad` brows for a sad close-up, `'happy'` arcs for closed-and-content.
- **Give side dogs a coat that isn't Pip's (030):** a tan-and-white chihuahua read as a mini Pip in every still; black-and-tan
  fixed it (a red husky also read as a corgi → silver). Pip is the only orange-and-white dog on screen.
- **A stampede in a vertical frame (030 zoomies):** 15 dogs spread evenly round a 20 m loop read as specks from any crane.
  Pack them tight (three lanes, ~0.5 m apart, right behind the leader) and shoot it with a lens that runs backwards just ahead
  of the pack, inside the loop, aimed back at it (030 `zoomB`), then a static low pass where the leader goes by the lens.
- **`bearing.py` is meaningless for near-straight-down cameras** (yaw is undefined): check overhead shots with a still.
- **Fire, smoke, steam and clouds = soft camera-facing sprites, never stacked spheres** (011: nested transparent spheres read
  as rings/bubbles). `makeSpritePool(parent, n, 'fire'|'smoke')` in tech.js: additive radial-gradient fire, soft alpha smoke;
  offset each puff from the center so they read as separate lumps. Same for planet clouds: radial-gradient puffs in a canvas.
- **State the physics model in the shots.js header (017).** "Gravity off" has two honest answers: with a rigid planet (the usual
  thought experiment) moving things keep going and squeezed things spring back; with an elastic Earth the ground rebounds at g and
  carries everything (equivalence principle) so nothing visibly floats. We use the rigid model and say so — physics commenters
  will ask. Time stamps in subtitles ("+1.5 s.") eat the 0.3 s/word budget; put the clock in the HUD number instead.
- **A diver/jumper launched straight up comes straight back down on the board (017)** — give anything that "falls back" the
  small horizontal speed it really had, and check where it lands before staging the splash.
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
- **Speech bubbles / cards in a vertical frame (016): aim the camera AT the bubble height, not at the speaker.** Put the
  speaker's head at ≈ 60–65 % of the frame so its bubble lands in the 38–60 % band; first sheet aimed at the pets and 5 of 11
  bubbles sat at 25–35 % on top of the HUD. A bubble that rises above ~37 % must stay right of x ≈ 55 %. In a crowd, pop the
  bubbles one after another (each ~1.1 s) instead of three at once, keep floor pets' bubbles under the owners' faces, and never
  anchor one on a lap pet (it lands on the owner's face). A topple that drops out of frame: keyframe the camera's aim down with
  it (CAMS `ay`/`y`, 016 press beat) — v1 left an empty backdrop.
  **Pets have faces too:** small animals live at 60–80 % of the frame — exactly the subtitle band (≈ 70 %). 016 v1 had the
  subtitle across the goldfish, the vet's dogs and Biscuit; scan every subtitle moment for a pet face and move the pet (raise the
  bowl on books, re-aim) so it sits above ≈ 64 % or below ≈ 76 %.
- **Vertical frames are only ±15° wide**: before placing people for a shot, check the bearing from the camera to each one vs
  the aim direction (009's road + war shots had the hero 19–25° off-axis = out of frame).
- **Things that stick to a surface must face the lens: put the surface BEHIND them relative to the camera** (018 v1 stuck people
  to parked-car doors seen edge-on from the sidewalk = unreadable profiles; v2 put the camera in the street looking at a bus
  shelter + a steel shutter, so everyone is yanked backward and lands back-first, facing us).
- **Bodies radiating from a point (heads in an MRI bore) don't fit under a 2.8 m ceiling:** tilt them ~50° toward the camera —
  foreshortening keeps the flower shape (018). Same for any "human sunflower".
- **A pointing prop must not be ambiguous:** a compass whose N already points at the target can't show "it points at him" —
  rotate the dial so N points elsewhere, then swing the needle (018). Keep such props above the subtitle band and off the HUD.
- **Sync foley to physics computed in shots.js by mirroring the formula in make_cues.py** (018's cart pile-up times `TK` are
  solved the same way in both) — and keep collisions inside the beat (v1's carts arrived 2 s after the cut).
- **Beat-timed events: compute them from the beat index, `t = M1 + n·BEAT`, the same way in shots.js and make_cues.py** (019's
  can pyramid was keyed to "bar 38" instead of beat 39 → scheduled at 83 s, the cans never fell in the first stills).
- **Arm presets: check the math before "fixing" one** — a cropped still made 019's robot goal post look wrong; a 10-line node
  script of the shoulder → elbow → hand chain (`rotation.set(sx, twist, s·sz)`, `elbow.rotation.x = el`) proved it right.
  The t ≥ 200 pose lineup must hide `#ui` (019: the end card + finalFade covered it); show ≤ 5 figures per lineup frame.
- **Additive light cones (stage beams) that pass near the camera wash out the whole frame** (019 stadium): hide the beams
  over the camera path, keep the rest at opacity ≈ 0.09.
- **city.js rooftop props** — stairwell box at (−14.6, 15.6) 2.6 × 2.4, water tower at (−11.2, 16) with legs ±1 m, AC units at
  x ≈ −15.5, a vent at (−12.8, 12.8). Keep dancers + camera cranes clear of them (019's first crane flew through the tower).
  A crane that stays above the roof footprint is safe; the neighbors are taller.
- **street.js generic storefronts have an awning at y 2.75** that hides any sign you hang above the window — hide it
  (019 IRON GYM). Canvas text wider than its canvas is silently clipped ("LOSED FOREVE") — shrink the font or measure it.
- **Instances you move at runtime need `frustumCulled = false` (031):** an InstancedMesh computes its bounding sphere ONCE from
  the matrices it has at the first render; 031's groceries started hidden at y −50, so the whole avalanche was culled forever
  (and fallen balloons outside the net's sphere vanished at frame edges). Same for any pool you re-place per frame.
- **A sky seen through a store's windows from a low camera needs a TALL card (031):** a 46 m sky cylinder left the top of a
  low, upward doors shot black. Make the card ~120 m tall (horizon at v ≈ 0.075) and set `scene.background` to the sky colour.
- **A toddler/kid sitting ON THE FLOOR = `y −0.68, footFwd 0.62`** (in the rig's own units); `y −0.22` is chair height (031).
- **A close-up of a lying/sitting pet puts his face in the subtitle band** unless the aim is LOW (031 sob shot: aim y 0.13 for a
  head at 0.3 m); when he stands up mid-shot, dolly back + lift the aim in `update()` or the head leaves the top of the frame.
- **Hiding a set's furniture by position also hides its FLOOR (035):** office.js's floor plane sits at the origin, so a "hide
  everything near the desk" filter turned the bottom of every office still black. Exclude big PlaneGeometry meshes from such filters.
- **A facade with alpha-cut window holes (`destination-out` + `alphaTest`) rendered solid in 035** — build a wall with openings
  from boxes around the windows (UVs scaled per box) instead; and a room box behind an opening must not reach into the set's own
  buildings (street.js front facades start at z = 10: hide them for that shot).
- **A staccato pluck "bounce" fails the music-dropout check on its own (035):** the plucks decay 14 dB between stabs. A chord
  pad per chord at level ≈ 3 under the bounce fixed it (level 1.1–1.6 wasn't enough).
- **LatheGeometry profiles: no two consecutive equal points** (zero-length segment → NaN normals → black blocks).
- **A prop you add can swallow the camera (022):** a press-room reverse shot rendered black because the camera sat behind a
  presentation screen just added to the set. Run bearing.py on new props as well as people. And never fade a cap mesh in by
  `scale.y` (it sinks inside its parent and never shows); fade its opacity.
- **`root.traverse()` while adding children to the meshes you visit = an endless loop** ("Maximum call stack size exceeded" in
  `traverse`, 044's first `dressWinter`): collect the meshes into an array first, then add the snow caps.
- **A camera inside a set reads as one flat colour (044 sleep shot: the livingroom armchair, teal):** before re-aiming, check the
  lens against the set's furniture (`DIMS.armchair` etc.), not just the rigs.
- **A lens high over a city sidewalk sits inside the storefront awnings (037):** street.js awnings (y ≈ 2.75) and the hot-dog
  cart's umbrella (y 2.45, r 0.95) rendered the whole downtown shot as one pink wall. Hide them for that shot (filter meshes by
  position, restore them after) or keep the camera under 2.3 m there.
- **Anything drawn in a set's SKY (043 rings, moons, giants) needs the set's sky dome to stop writing depth** (`depthWrite =
  false`, `renderOrder −3`; 043 does it for every BackSide sphere ≥ 100 m) — and then check what ELSE sits there: street.js's
  "hazy skyline" boxes at 110–135 m are fogged to exactly the sky colour (invisible) but still occlude the sky (the NYC arch
  vanished until they were hidden). Raycast from the camera along the missing direction to find the blocker.
- **A vertical frame from 1 m away is ±0.27 m wide (043 classroom):** the kids sat just outside it and the still showed empty
  desks. Back the lens off to ~2 m (or widen the fov) before blaming visibility; `bearing.py` catches it.
- **A back-hinged lid opening toward the sky becomes a disc between the lens and the cook (037 grill):** slide it off to the side.
- **A flying insect head-on is invisible (037):** 70 cm dragonfly wings seen edge-on read as nothing next to a crow; turn it
  broadside (nose across the frame) and roll it ~0.8 rad so the wing surfaces face the lens, and give the wings ≥ 0.7 alpha.
- GitHub rejects files > 100 MB: `final.mp4` is capped at 6 Mbps (≈45 MB / min) and, for reels longer than ~115 s, lower —
  `finalRateArgs(duration)` in tools/lib.mjs keeps it ≈ 90 MB (009's 2:19 cut hit 101 MB at a flat 6M). Don't commit `out/` or `stills/`.

## The operation (manager + producers, Oct 26 2026)
EDStudio now runs as a daily operation: a **manager** Claude assigns numbered concepts from `ops/ideas.md`, starts one **producer**
session per video (own worktree, commits on its branch, never merges/pushes/posts), gates each video through QC + TRIBE, emails
the user a phone preview, and schedules approved posts in TikTok Studio (1 PM + 6 PM PT, three accounts, one lane each:
`docs/lanes/`). A daily research task feeds the backlogs. Playbook: **`docs/OPERATION.md`**; entry point: **`/operation`**.
If a brief from the manager conflicts with this file's merge/push habits, the brief wins.

## Brain-response check (TRIBE v2 experiment, Oct 2026)
`tribe-experiment/` runs Meta's TRIBE v2 (predicted fMRI response, CC BY-NC → personal use only) on our `final.mp4`s, locally
on the Mac. Read `tribe-experiment/results/report.md` first. **It is not a publish gate:** the whole-brain mean ranked the 10
original uploads like their views (rho 0.84), but on @ed._.studios views follow posting order (−0.94) and the brain score
doesn't (same-account rho 0.37, n=6; 013 scored highest yet was 5th of 6). Re-uploads of one file to other accounts always
rank in upload order (TikTok suppresses copies), so don't cross-post. Useful as a dead-zone finder. Mac gotchas, all handled in `run_tribe.py` + `mac_patches.py`:
encoders only accept cuda/cpu (set `mps` after load), torch 2.6 MPS attention needs 6 GB per V-JEPA layer (chunk queries),
`num_workers: 20` spawns 20 slow processes on macOS (set 0), run it under `nohup` (quitting the app killed a 3 h batch), and
our videos have no speech, so the Llama text stream is empty (no HuggingFace token needed).
**Keep TRIBE-gated reels ≤ 70 s** (019): the w2v-BERT audio encoder attends over the WHOLE clip (memory ∝ length²); at
the 0.5 MPS watermark a 71.5 s reel ran out of GPU memory in the audio step (`MPS backend out of memory … Tried to allocate
780 MB`), while 70.0 s (015-v2) and 69 s (018) passed. Trim the ending rather than touch the TRIBE setup.
Re-scoring under the same tag used to reuse the old extracted `$NAME.wav` (the extractor skips an existing WAV), so 019's
trimmed cut failed again with the identical 780 MB request; `tools/tribe-score.sh` now deletes `$NAME.wav/.tsv` first.
**Optimization loop (014, `tribe-experiment/results/014-optimization.md`):** `sh tools/tribe-score.sh videos/NNN-slug cutN` (in the
background; it holds a global lock so only ONE TRIBE run happens at a time across all sessions — two at once swap the Mac;
~20 min idle, ~60 min when the Mac swaps) → `videos/NNN-slug/tribe-cutN.txt` (cutN = the video's Nth cut, not a TRIBE version): headline metrics vs the best posted video, a
per-beat table and dead zones. **In the operation (docs/OPERATION.md) the user made it the gate (Oct 26)**, reach still unproven:
`study.py` keeps testing it per account from `ops/ledger.csv`. Target: beat 013 on whole-brain + first-60-s mean, no dead zone. What scores: bright places, crowds of faces, motion in
**Slow motion scores low unless the camera moves (017):** v1's slow-mo ladder (a 0.5 s slice of physics stretched over 4.8 s)
gave a 22 s dead zone (wc 0.032). Bullet-time camera ORBITS around the frozen-ish subjects, a tracking shot behind a runner and a
crane up through the floating crowd lifted those beats 2–6× (v2 wc 0.0447, a hair under 013). v3 filmed the diver from the
water with the frame mostly sky (−0.029) and fell to 0.0414. **v4 met the target (0.0487 / first 60 s 0.0458 / no dead zone)** by
TIGHTENING the weak stretch instead of decorating it: 14.4 s → 10 s (fans 3.8 s, a family table panned across three faces 3.2 s,
the rising diver 1.6 s + a 1.4 s close-up of a judge's face looking up and pointing). Shorter slow-mo beats = faster motion per
second + a new face every ~1.5 s. Other lessons: a title over people's BACKS scored −0.05 vs −0.02 over a wide bright crowd;
commit every scored version so you can ship the best one, not the last one.
**Keep reels ≤ 69.5 s for TRIBE — trim, don't raise the memory cap (017, manager rule):** w2v-BERT's relative-position attention
grows with clip length²; 69–70 s fit under the shared MPS cap (`PYTORCH_MPS_HIGH_WATERMARK_RATIO` 0.5 = 8.88 GB), a 73.8 s cut
needed ~9.5 GB and crashed in "Preparing extractor: audio" within a minute. Never raise the cap to get a run through (it can swap
the Mac while other producers render): tighten the slowest stretch until the cut is ≤ 69.5 s and score that.
**Optimization loop (014, `tribe-experiment/results/014-optimization.md`):** `cp final.mp4 tribe-experiment/videos/NNN-vK.mp4`,
`nohup caffeinate -i .venv/bin/python -u run_tribe.py videos/NNN-vK.mp4 &` (~20 min idle, ~60 min when the Mac swaps), then
`.venv/bin/python score.py results/NNN-vK.npy <shots.js>` → headline metrics vs the best posted video, a per-beat table and dead
zones. Target: beat 013 on whole-brain + first-60-s mean, no dead zone. What scores: bright places, crowds of faces, motion in
every frame, a steady mix (LRA ≈ 4). What sags: anything that stands still (014 v1's staring plane cabin: motion network −0.19).
One fix pass is enough — edits ripple into neighboring beats (v2: targeted beats +8…+46 %, untouched beats −4…−11 %, net +1 %).
**015 (tail-lies) confirmed it: faces + motion lift the weak beats.** v1 met the target (0.056) but a kitchen two-shot and a court
seen from behind the defendant sat at 0.015 (busy face-filled beats: 0.08–0.10). v2 moved the kitchen camera closer, added the family
dog and fidgets (0.031), and cut the court to a reverse angle on the defendant's face + a gallery of reacting onlookers + the gavel
slamming in the foreground (0.040/0.043). Net: whole-brain +1 %, first 60 s +7 %; the untouched ending dipped (0.050 → 0.035).
**021 (Pip ep. 1, a NIGHT reel) met the target on cut1 (wc 0.064, first 60 s 0.065):** dark doesn't sag when every shot is a
close face in constant motion — the crate close-ups, the stairs and the 3 AM shots scored 0.09–0.11. The weakest beats were the
BRIGHT wide ones with small faces (9 PM family + zoomies 0.035, the morning discovery 0.044): get close, not bright.
**Keep TRIBE videos ≤ 70 s (016):** with the lowered MPS cap the audio encoder (w2v-BERT relative-position attention, whole
soundtrack at once) ran out of GPU memory on a 71.4 s render (`MPS backend out of memory … max allowed 8.88 GB`) while 70.0 s
(015) passed. Trim the video rather than raising the shared watermark. (`tribe-score.sh` used to copy `final.mp4` before waiting
for the lock, so a re-render while queued scored the old file; it now copies after it takes the lock.)
It also reused a stale `tribe-experiment/videos/NNN-vK.wav` from the earlier cut (the 70 s re-run failed with the 71.4 s audio);
`tribe-score.sh` now deletes the tag's `.wav`/`.tsv` before each run.
**023 (Pip ep. 2, Halloween at dusk) met the target on cut1 (wc 0.0625, first 60 s 0.0661):** the peaks were the busy close
porch beats — the skeleton collapsing on Pip (0.117) and kids hurrying past the dark house four in the foreground (0.124);
the weakest (besides the title) was the static look-up at the grumpy old man in his doorway (0.039) and the slow home ending.
**031 (Pip ep. 4, supermarket job) = 0.0849, the new best (first 60 s 0.0888), cut1:** a bright store with a crowd of faces in
every job beat (herded shoppers 0.130, the walk to Mom past watching shoppers 0.120–0.132, the reunion 0.125); weakest were the
title, a two-shot dominated by a back (0.037) and the near-empty 4 PM aisle (0.053). One location dressed densely scored as
well as many locations.
**019 (dance montage) = 0.0806:** the top beats were close crowds of full-rig faces moving in sync (press corps
robot 0.158, conga 0.141, coffin dance 0.142); a stadium of 16k tiny instanced fans scored half that (0.064) and the quiet open
0.002. Close faces in motion beat spectacle at a distance.
**029 (Moon twice as close) cut2 = 0.0471, TARGET MET after one in-place fix pass:** the dead zone (static calendar wall, a
near-static Earth + Moon, a static two-shot on a bench, a faceless telephoto) lifted by camera moves + body motion on the SAME
timeline (027's rule held: no retiming, untouched beats barely moved). Faces in eclipse glasses as the daylight drains scored 0.145.
**022 (ballsack doubling, logistics POV) = 0.0788, cut1 met the target:** the close, face-filled slapstick beats scored highest
(wheelbarrow + staring neighbors 0.147, tailor 0.140, doctor faint 0.110–0.128), while the faceless planet-scale finale sagged
(ZIP horizon 0.060, Earth 0.057) and the quiet elevator title open went negative (−0.013). Body-absurd ladders score best
while they stay human-scale. Keep the cosmic end short, or put a face in it.

**030 (Pip ep. 3, dog park) cut1 = 0.0940 / first 60 s 0.0944, no dead zone — the best so far:** 15 toy dogs + 6 owners
in one sunny park, a new gag every ~4 s, faces in every shot; the gag beats sat at 0.11–0.13 (poodle frizz 0.134, zoomies
0.135). The weakest were the title (−0.036) and the gate wide shot from behind Mia (0.027): open on a face, not a back.

**044 (Pip ep. 7, first snow) cut1 = 0.0816 / first 60 s 0.0898, no dead zone:** a bright white yard, Pip's face close in
every gag (tongue flakes 0.157, sneeze 0.137, door zoom into the drift 0.129); the snowball fight + snowman wides sagged to
0.044–0.058 and the window nap + end card to 0.021. Snow = bright + faces: a winter episode scores like a sunny one.

**038 (Pip ep. 5, blackout) cut1 = 0.0450 / first 60 s 0.0488 — met by a hair:** the dark first 17 s (wide family shots,
faces 2–4 m away, a faceless rooftop) scored 0.01–0.03 and the sleeping ending 0.016; the close action beats after the flashlight
scored 0.07–0.10. Dark only works when the faces are CLOSE (021); a dim wide is the weakest thing we make.
**020 (butt doubling, 60 s) cut1: whole-brain 0.068, first 60 s 0.068, 20.9 % above, no dead zone → TARGET MET first try.** Per beat:
faces + a physical gag in a bright place top the chart (the neighbors shoving a butt stuck in a doorway, then the cork pop: 0.147 — the
best beat measured so far; bus 0.125; kitchen 0.104; traffic 0.101). Faceless spectacle sags (the Moon from space 0.019, the ISS 0.050
even with an astronaut), and so does the sleeping title shot (−0.033). Keep the faceless space beat short and put a face beat after it.
**028 (Earth stops spinning, science, 60.6 s) cut1: wc 0.0667 / first 60 s 0.0675 / 21.7 % above, no dead zone → TARGET MET first
try,** the best science score: every beat a bright day place with faces close and the world streaking past a free-frame camera
(Texas wind storm 0.115, NYC aftermath 0.111); the faceless/frozen early beats (Quito intro −0.007, first slide 0.030) were the low.
**035 (farts 2× louder, sound-led doubling POV, 66 s) cut1: wc 0.0721 / first 60 s 0.0746 / 21.6 % above, no dead zone → TARGET MET
first try.** The street beat (every car alarm flashing + pigeons bursting up + hats flying around a hot-dog cart, faces close) hit
0.152, the best beat measured so far; the apartment windows 0.126, library 0.112. Sagging: the near-static sleeping title (0.011),
the faceless orbit ring (0.015) and the dinner wide two-beat (0.015) — keep the quiet open short and give the finale a close face.
**037 (oxygen doubles, science, 62 s) cut1: wc 0.0595 / first 60 s 0.0599 / 20.0 % above, no dead zone → TARGET MET first try.**
The fire beats with faces right by the flames topped it (barbecue column 0.117, campfire leap 0.113); the weakest were the
marathon before/at SECOND 0 (0.001: small runners side-on, the title over the pack) and the grandpa's bench (0.042). Open on a
close face, not a crowd of small figures.
**036 (Sun disappears, science, 65 s) = target NOT met in 3 cuts; shipped cut2 (wc 0.0321 / first 60 s 0.0345):** the bright
half before LIGHTS OUT scored 0.04–0.07, the 40 s after it 0.01–0.04 however we lit it (party lights, flashlights, diamond dust,
an orbiting camera = +3 %). cut3 centered the faces at the fire drums and pushed the flames to the bottom of the frame → those
beats went negative (−0.009) and the cut fell to 0.029. In the dark, the big moving flame in mid-frame is what scores; and a
premise that is night everywhere for half the reel caps the score — keep dark stretches ≤ 1/3 of the runtime.
**036 cut4 → cut5 = TARGET MET (wc 0.0581 / first 60 s 0.0581, no dead zone) after the manager allowed a full retime:** cut4
rebuilt it as ~1.5 s angles (the bright countdown across pool, London goal, a new Chicago playground, Tuscany; the dark half
mostly lit interiors) and the first 37 s jumped to 0.06–0.11 — but everything after the faceless orbit shot fell to 0.00–0.03
(wc 0.0394, dead zone 41–57 s), even the BRIGHT supermarket and laundromat full of faces. cut5 kept 0–37 s identical, cut the
tail from 19 s to 9 s (one ~2 s shot per rung of the day ladder) and put CROWD VOICES under every tail beat (crowd_cheer
murmur/cheer at −26…−28 dB, applause under the end card), and put the end card over the lagoon faces instead of empty sky: the
tail rose to 0.03–0.044 and every early beat rose too (wc +47 %). Lessons: (1) the beats with a roaring crowd / applause in the
mix scored highest all along — vocal crowd beds are a cheap lift for any beat (no speech needed); (2) a long low tail drags
the mean and is where dead zones live: compress the epilogue to ~2 s per rung; (3) the end card over a live, face-filled
scene (`finalFade` depth 0.3) beat black (−0.026 → +0.018 for the stars + card stretch).
**040 (Pip ep. 6, tornado home alone, 67.4 s) cut1 = 0.0524 / first 60 s 0.0505, no dead zone → TARGET MET first try.** A
bright green-gray storm (never black) scored like a day reel: the street with the far funnel 0.078, the TV warning 0.075, the
yard chaos 0.072, the pile-in hug in the tub 0.066. Weakest: the sleeping-Pip title (0.001), the quiet sunny street after the
storm (0.035, a wide with no face) and the three-trip pack (0.038, Pip small in a wide living room). Storms work if they stay lit.
**042 (belly-button portal, POV escalation — not a doubling, 68 s) cut1: wc 0.0629 / first 60 s 0.0706 / 17.4 % above, no dead zone → TARGET
MET first try.** The busy face-filled middle topped it (laundromat pigeon + socks 0.135, the Pacific jet 0.143, tourist close-up 0.121,
mariachi 0.109, the queue 0.10); the dark 3 AM couch open (−0.024 → +0.012: one face, a purple glow, slow) and the 11 s Grandma's-kitchen
epilogue with the end card over a near-static hug (0.022) were the lows. Same lesson again: a quiet single-face night open and a long
held ending sag — keep the hug ≤ 5 s before the card and open on something already moving.
**043 (Earth rings, science, 65.4 s) cut2 = 0.0452 / first 60 s 0.0451, no dead zone → TARGET MET after one in-place pass**
(cut1 0.0431): faceless sky wides and crowds seen from behind sagged (0.02–0.03); turning the nearest people to the lens, a
bouncing party + an arcing camera, and opening the wide on two close faces before craning up to the sky lifted them 2–3×.
**The TRIBE lock is a poll race, not a queue:** 020 lost it twice (to 017 and 022) and waited 60 min. Make the upload/preview copies
and write the docs while waiting; you can still re-render while queued (the script copies final.mp4 only once it holds the lock).

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
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", a blank line, exactly 5 hashtags (incl. #animation, except Scribe promos). NO link and NO plug line anywhere (no payhip.com, no tryscribe.ink — user rule Nov 8: links in captions tank TikTok reach).
