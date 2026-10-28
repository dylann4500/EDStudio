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
- **Blackout kit (038, Pip ep. 5):** `pip.update(t, { shine })` = dog eyeshine (additive green-gold over the pupils). 038
  shots.js has camera-following rain, window rain, a lit/dark storm window view, battery candles + box, a lantern, a blanket
  fort, Pip's raincoat, an umbrella, a quilt hood. city.js at the origin + suburb/livingroom parked at offsets works in one scene.
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

## User's taste (direct feedback — non-negotiable)
- **Every video delivery includes its caption, pasted in full in the final message** (user: "where's the caption? make sure every
  video generation has a caption"). That means every first cut AND every revision: write or update `caption.md`, commit it with
  the video, and paste the caption text (paste-ready, without the sources comment) in the report next to the file path.
  `tools/render.mjs` warns when caption.md is missing or still the template. If a revision changes what the video shows,
  update the caption to match.
- **Every caption carries the course link (user rule, Oct 23)** — this exact line as its own block — a blank line after
  "Send this to your ___", the line, a blank line, then the hashtags (question + share = one block, the course offer = another): `🎬 Want to make 3D animations like this? Learn how 👉 payhip.com/b/rim0Q`
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
- **LatheGeometry profiles: no two consecutive equal points** (zero-length segment → NaN normals → black blocks).
- **A prop you add can swallow the camera (022):** a press-room reverse shot rendered black because the camera sat behind a
  presentation screen just added to the set. Run bearing.py on new props as well as people. And never fade a cap mesh in by
  `scale.y` (it sinks inside its parent and never shows); fade its opacity.
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

**020 (butt doubling, 60 s) cut1: whole-brain 0.068, first 60 s 0.068, 20.9 % above, no dead zone → TARGET MET first try.** Per beat:
faces + a physical gag in a bright place top the chart (the neighbors shoving a butt stuck in a doorway, then the cork pop: 0.147 — the
best beat measured so far; bus 0.125; kitchen 0.104; traffic 0.101). Faceless spectacle sags (the Moon from space 0.019, the ISS 0.050
even with an astronaut), and so does the sleeping title shot (−0.033). Keep the faceless space beat short and put a face beat after it.
**028 (Earth stops spinning, science, 60.6 s) cut1: wc 0.0667 / first 60 s 0.0675 / 21.7 % above, no dead zone → TARGET MET first
try,** the best science score: every beat a bright day place with faces close and the world streaking past a free-frame camera
(Texas wind storm 0.115, NYC aftermath 0.111); the faceless/frozen early beats (Quito intro −0.007, first slide 0.030) were the low.
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
- [ ] caption.md: hook + emoji, 2–3 sentence summary, question CTA 👇, "Send this to your ___", a blank line, the course-link line (payhip.com/b/rim0Q) as its own block, exactly 5 hashtags incl. #animation.
