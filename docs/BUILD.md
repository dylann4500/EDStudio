# BUILD — "How a ___ Becomes a ___" (EDStudio's build genre)

A fast, narrated, joke-dense explainer: a humble object upgrades step by step into a giant machine. Every step **fails in a
funny physical way**, gets **fixed**, and the fix gets its **real engineering name**. Its own category (user, Oct 26 2026:
"an entirely new harness, entirely new design process"). Reference account + full analysis: `docs/reference/wemakebuild.md`.
Design spec: `docs/superpowers/specs/2026-10-26-build-genre-design.md`. First video: `videos/024-hole-subway`.
User steer: "their videos are really dense with lots of good animation, actions, items… make the best video and highest
matching video possible." Density is the point: something new pops, breaks, floods or flies on almost every phrase.

## How it differs from the other EDStudio tones
| | other tones | build |
|---|---|---|
| Voice | none (subtitles are the narrator) | **ElevenLabs narrator** (funny male, fast), scratch `say` voice until the key is set |
| Text | title card, HUD, lower-third serif subtitles | **one spoken word at a time, dead center** + yellow TERM callouts, red stamps, green money, comic SFX words |
| Opening | the question alone on screen | **no title card** — the hook is spoken on frame 1 over action (the title lives in the IG caption) |
| Timing | fixed shot clock | **the voice sets the clock**: `tools/narrate.py` lays out story.json from per-word times |
| Ending | end card ≥ 3.5 s | the callback punchline + ~1.5 s hold, no end card |
| Length | 45–80 s | 95–120 s (theirs: 98–118 s), ~3.1 words/s, ~300–350 words |
| Camera | composed holds | **ONE continuous take, no cuts** (user steer) — always gliding, a new framing every 2–4 s (`planRail`); shake on every impact |
| World | many sets | **one cutaway diorama** (the ground sliced open) + close-ups/angles on it, plus a few street-level shots |
| Frame rate | 30 fps | **60 fps + 2-sample motion blur** (user: "theirs feel like 60 fps") |
| Iteration | stills + self-QC | stills + `--qc` + **a 5-subagent review loop** (docs/BUILD-REVIEW.md) until every dimension ≥ 8 |

House rules that still hold: deterministic renders (no Math.random/Date), real numbers web-searched and cited, caption.md
with the course link pasted in every delivery, music continuous and never harsh, stills before every full render.
Exempt: opening question card, HUD, lower-third subtitles, "no popping text" (pops ONCE on entry are this genre's look;
still nothing pulses or flickers after), end card.

## The script formula (write this first — it IS the video)
1. **Hook (1 line):** the dumbest possible version, second person. "You're tired of traffic, so you grab a shovel and dig a hole."
2. **"Congratulations, you've built a [thing]."** + a roast ("It goes nowhere, and a raccoon already lives in it.").
3. **The loop, 6–8×:** failure gag that hurts **Gary** (our recurring victim; their Kevin) → **"So…"** + the fix → **"This is
   called [TERM]"** (yellow callout) → one plain sentence on what it does → a simile/joke. Escalate stakes each loop.
4. **One real, sourced number per 2–3 loops** as a label callout ("13,000,000 GALLONS", "60 TONS EACH", "625 VOLTS").
5. **Finishing list** in one breath ("Add stations, escalators, turnstiles, a map nobody understands…").
6. **Callback ending:** "Congratulations, you've built a [thing]. You started with [step 1] because [petty reason]. Now
   [the money, green callout], [absurd consequence], and Gary is [final indignity]." + one last tiny gag (the raccoon rides free).
Write jokes of our own — never reuse theirs (wet biscuit, depressed banana, emotional damage…).

## Pipeline
```
videos/NNN-slug/script.json   beats: [{id, say, callouts:[{at, text, style, until?|hold?, pos?}]}], voice + scratch settings, look
python3 -I tools/narrate.py NNN-slug        → voice/ clips (cached by text hash) + voice.wav + words.json + story.json
python3 -I tools/narrate.py NNN-slug --layout   re-layout only (callout edits, no voicing / no API cost)
shots.js                      3D: author every gag against B.W(beat, word) (when that word is spoken) — survives re-voicing
cues.json → python3 -I audio/synth.py NNN-slug    music bed + SFX + the voice → audio.wav (−14 LUFS, voice on top)
node tools/render.mjs NNN-slug [--stills …]       same renderer as every video
```
- **ElevenLabs:** put `ELEVENLABS_API_KEY=…` in `~/.config/edstudio/.env` (outside every repo; a git-ignored repo-root `.env` or the env also work). `python3 -I tools/narrate.py
  --voices` lists voices; set `voice.voice_id` in script.json; re-run narrate (only beats whose text changed are re-billed).
  The `with-timestamps` endpoint returns per-character times → exact word timing. Commit `voice/eleven-*.mp3|json`.
- **Scratch voice** (no key): macOS `say` (`scratch.voice`, `scratch.rate` ≈ 205 → ~3 w/s). Word times are estimated
  (phrases snap to the pauses found in the audio, words split by syllables) — good enough to time animation and captions.
  Scratch clips are git-ignored. Re-voicing changes beat lengths: that's why shots.js must use `B.W()` / beat-local time.

## Engine kit (`engine/build/`)
- `captions.js` — the build overlay (main.js picks it when `story.mode === 'build'`). Fonts: Fredoka 700 (words),
  Luckiest Guy (callouts), from `@fontsource/*` in node_modules (run `npm install` after pulling). Styles (band tops in px of 1920): `term` (yellow,
  390), `label` (orange, 262, stacks above a term), `money` (green, 318), `stamp` (red, tilted, slams in, 560), `sfx` (small yellow
  comic word centred at `pos` [x, y] frame fractions); any callout can take `y` — or `x` + `y` (centred there) — when its band
  would cover the subject (024: "$3 A RIDE" at x 0.7 / y 0.66 off Gary's face, RIDES FREE at x 0.5 / y 0.6). The one-word
  caption sits at 1000 px (52 %); `render.mjs --qc` lists faces under any of them. Long callouts auto-shrink to 960 px. Label/money are big with a
  wide dark halo (an orange label vanished on the orange TBM).
- `toon.js` — `makeToon({skin, shirt, pants, hair, hairStyle 'tuft'|'messy'|'side'|'none', hat 'hardhat'|'chef'|'cap', mustache})`
  (`glow: [color, k]` in `set()` = emissive glow; `beard`, `gray` age him)
  → `set({x,y,z,rotY, rx,rz (tilt about the belly), walk (phase), armL/armR {x,z,el}, legL/legR {x,kn}, head {x,y,z},
  eyes 'open'|'wide'|'half'|'closed'|'spiral'|'x', look [dx,dy], brows -1..1, mouth 'smile'|'grin'|'o'|'scream'|'flat'|'frown'|
  'wavy'|'teeth', beard 0..1, gray, hairUp, xray, char, tint [color, k], faceTint, squash [sx, sy], hatLift, noHat, t})`. The hard hat
  sits high and tipped back so the brim never hides the eyes (v2: the face stopped acting under it). `makeShades()` (cool-guy
  glasses: parent to `toon.head`), `makeRaccoon()` (`shades`), `makePigeon()` (`flap` 0..1, `shades`).
  ~1.42 m tall, head ≈ 40 % of height. Faces carry the comedy: wide eyes + scream on every failure, spiral/X when hurt.
- `cutaway.js` — `makeCutFace({x0,x1,y0,y1, paint})` = the ground sliced at z = 0 with a canvas strata texture and a runtime
  **alpha mask for holes** (`setHoles([{rect}, {poly}, {circle}], rough)`), a darker back wall `depth` m behind, `makeRim()`
  side walls, `maskedPlane()` (any plane with holes — the lawn on top), `lawnTexture()` (mown stripes), `makeSky()`.
- `anim.js` — `pop/unpop/drop/squash/wobble/shake`, `beatClock(story)` (`B.T(id)`, `B.lt`, `B.u`, `B.W(id, word)`), `camAt()`.
- `fx.js` — analytic particles (pure functions of age → any frame renders alone): `fx.burst(kind, t0, {pos, n, dir, spread,
  speed, box, floor})`, `fx.stream(kind, t0, t1, {rate,…})`; kinds dirt, rock, crumb, drops, confetti, dust, smoke, stink,
  mist, spark, glow. `makeArrows(path)` (flow chevrons), `makeDizzy()` (stars around a head).
- `subway.js` — the 024 set (see its header): strata, street + traffic jam, bakery block that settles, TBM, lining rings,
  track + third rail, vent fans + grates, station, escalator, train, pumps + hose, shoring, water. Reusable props:
  `makeTBM`, `makeTrain`, `makeShovel`, `makeCroissant`, `makeTree`, `makeBuilding`, `makeHalfRing`, `makeFan`.

## Camera: ONE continuous take, no cuts (user steer, Oct 26; the 1.85M-like bridge reel has zero cuts)
- `engine/build/rail.js` `makeRail(keys)`: keys `{t, pos, look, fov, pass?}` set with `W(beat, word)`. A normal key is a STOP
  (eases in, settles); `pass: true` flows through (long travels go wide → across → in). Slow breathing drift is built in.
- **Author FRAMINGS, not keys: `makeRail(planRail(frames))`.** Each framing `{t, pos, look, fov}` is the frame you want ON its
  word; planRail holds it with a slow push-in and LEAVES EARLY so every move takes ≥ `0.6 + d/8` s (d = metres). v2 keyed
  arrivals AND departures to words → 11 moves of 9–26 m in < 1.3 s that read as cuts (camera review 6/10). The render log prints
  `[rail]` warnings for any move faster than that — fix them by dropping a framing or moving it to a later word.
- ~1 framing per 2–4 s; a framing that can't be reached in time is a sign two gags need ONE wider frame.
- **No stop-and-go** (v3/v4 camera reviews: dead stops + in/out "pumping"): planRail turns any framing it could hold
  < 1.3 s into a pass-through point (`keep: true` holds it anyway — use it on gag frames), and every hold is SOFT: the camera
  already drifts a few % toward the NEXT framing (aim half as much) and the arrive/depart keys carry that velocity, so it never
  comes to a dead stop and never pushes in just to pull back out. `stop: true` only on the last frame. With
  `planRail.verbose = true` the render log lists each framing that became a pass — read it, and `keep` the ones that carry a gag.
- **Glide out early** (v5 camera review: near-still time 36 → 14 s): a framing departs `max(need, min(1.6·need, 0.55·gap))`
  before the next word, not at the last legal moment, and drifts `lead 0.06/s` (max 15 %) toward the next frame while held.
  When a gag must FINISH in frame (Gary flattened → springs back), pass `until: t` (`Fk(t, pos, look, fov, until)`): the hold
  lasts to t as long as the next move stays legal. 024's carry gag left frame mid-pancake before `until`.
- The render log must show NO `[rail] … m in … s` warnings. (Until Oct 26 tools/render.mjs dropped them: Puppeteer reports
  `console.warn` as type `'warn'`, not `'warning'` — every lint warning from page code was silently lost.)
- **Vary the angle**: a three-quarter view down the bore that follows a jogging character (camera ~3 m in front of the cut, x
  behind him, look ~5 m ahead) sold "miles of tunnel"; a side three-quarter (≈27° yaw) made a finger-on-the-rail poke read.
- **Run `node tools/render.mjs NNN --qc`** after every camera change: it runs the video's `window.EDSTUDIO_QC` (024's shots.js
  end), which steps the take every 0.25 s and lists each moment a tracked face (Gary, plus any other face the ending leans on —
  024's old driver) sits under the one-word caption (±0.045) or a callout (±0.065, only near its x for placed/sfx callouts).
  Fix runs ≥ 0.5 s; single 0.25 s hits during a move are fine. Callouts take `pos` (sfx), `x`/`y` (frame fractions) to dodge.
- **Framing math for toons:** the toon's head centre is root + 1.12 m (≈1.45 m tall with a hat). Aim the look point ≥ ~1 m
  below head height so faces sit at ≤ 42 % of frame height — the one-word caption is at 52 % (v3 still had captions across
  rows of commuters' faces).
- **Home frame:** centred, frontal on the cut face, near ground height, tilted down ≤ 8°; soil fills the bottom 35–45 %, sky/
  street the top 25–35 %. Push in for each gag/term, pull back out for reveals. Closest framing = full body (≤ 60 % of frame
  height); faces sit at 38–45 % height (above the one-word caption at 52 %, below the TERM callout at 31 %).
- **Arrive early:** the move is mostly done before its word; the named subject is in the central 70 % on its word. Gags play in
  a HELD frame (the camera arrives, then the thing breaks).
- **Speed limits:** ≤ ~30°/s rotation, ≤ 0.7 frame widths/s lateral (frame width = 0.41·d at fov 40, 0.45·d at 44); travel in
  +x along the build; |yaw| ≤ 25–30° so the cut still reads as a cutaway; camera always at z > 0 (in front of the cut).
- Follow-cams (the TBM chewing) = pass keys every 0.5 s computed from the subject's path.
- A thing seen edge-on (the lining rings from the front) can't carry a gag — 024's donut gag became one giant donut popping
  face-on around the tunnel mouth.

## Smoothness: 60 fps + motion blur (user steer: "theirs feel like 60 fps, ours felt choppier")
- The reel Instagram serves is 30 fps; theirs feels smooth because Blender renders motion blur + every move is eased. We render
  **60 fps with 2-sample motion blur** (script.json `fps: 60`, `motionBlur: 2` → story.json; `render.mjs --fps --blur --shutter`).
  `window.renderAtBlur` averages sub-frames across a 180° shutter on a 2-D canvas; the text overlay is drawn once (crisp).
  Cost: ~4× a 30 fps render (~20–25 min for 95 s). Review cuts: `--fps 30` (no blur); stills/previews never blur.

## Continuity rules (v1 review: logic 4/10 — each line here was a reviewer finding)
- **One hole that only gets deeper**; it stays visible in every wide. The ladder that Gary climbs down is the same ladder he
  climbs out on later.
- **Nobody teleports on screen**: walk, climb, hop, get launched; reposition only while the camera is elsewhere.
- **Physical truth in the cartoon:** groundwater rises only to the water-table line; debris lands on floors (fx `floor`) and
  dies fast after cave-ins (`life` 0.5–0.9 s) so chunks never float in solid soil; a sunk building stays sunk.
- **Clipped geometry needs `clipShadows: true`** (a hidden third rail kept casting a "black rail on posts" shadow in solid soil).
- Big parts that enter from inside the ground (the TBM, trains) are clipped at the shaft wall so they slide out of the soil.
- Keep side characters threaded through (the raccoon: tenant → floatie → rides free; the pigeon is "fine") — and give them
  **visible entrances and exits** (v2 round-2 logic review flagged every pop): the raccoon walks back into its burrow, cannonballs
  into the flooded hole, rides the water down; the pigeon flies off the car roof, flies in to land by Gary, is blown away.
- **Every new thing has a cause on screen:** the ladder slides in when Gary arrives and is eaten by the cutterhead; Gary's hand-dug
  tunnel is where the TBM later bores; the TBM passing UNDER the bakery is what sinks it, and the rings shove the block back up
  ("they hold the street up"); Gary gets into the tunnel by falling through the crack; a vehicle never moves through a person
  (the powered train scoops Gary off the track on its nose and flings him onto the new platform).
- **Counters land on the right value on the word** (the 100-year calendar must read 2126 on "years", not flip back to 2026).
- **Order follows the words**: "sinking into your tunnel, croissants FIRST" → the croissants fall, THEN Gary slips in after them
  (v3 had Gary first). The crack must run UNDER the thing that sinks (the bakery block's edge sits under the shop wall).
- **Explainer props live in the world**: the face-on "segment ring" first floated in front of the diorama and clipped below the
  tunnel floor; standing it ON the tunnel floor in the tunnel mouth (it rolls aside, rolls back, rolls off) fixed logic AND
  gave the beat motion. Nothing vanishes by shrinking to a dot — it rolls/walks/flies off.
- **Vehicles and rails enter in view**: lay the track while the camera can see it (the character hops as it zips under him),
  then the train rolls in on it. A side character crossing a gate (exit lane → pay lane) must do it while the camera can see.
- **Explainer props come FROM the machine and stay IN the world**: the face-on segment ring assembles right behind the boring
  machine's tail ("as it digs, it bolts in"), rolls under the sinking bakery and holds it up ("they hold the street up"), gets
  frosted there ("load-bearing donuts"), then rolls off down the tunnel. One prop, four lines shown, a visible exit.
- **Hide the payoff until its word**: v4's hose visibly entered the car 4 s before "Yours drain into that guy's car" — v5 runs
  it into a storm drain first and whips it into the window ON "drain" (then three glugs, a snorkel, a goldfish, it floats).
- **A character that IS the light**: dim the scene ~85 % and give the toon `glow: [color, k]` (emissive on every material) +
  a short-range point light — a tint alone read as "pale statue in daylight".
- **A touch must touch**: crouch, fingertip ON the rail cover, sparks at the fingertip, then the ZAP callout (anchor it on the
  word after the verb — "touched IT").
- Put gags on surfaces that face the camera: the snail crawls ON the cut face (rotation.x = +π/2 — −π/2 put its foot toward the
  camera and only the belly showed); a glass-roofed car shows its driver only if his head sits in the window band.
- Gary transforms on a running gag (fossil → pancake → nightlight) — say it, then SHOW it the same second.
- **A doorway a character uses needs something behind it, on a surface facing the lens** (the user caught this on the
  shipped cut): 024's burrow was a circle cut in the cut face beside the shaft with nothing behind it, so the raccoon rose
  through the floor and backed out through the shaft's solid side wall. v6 paints a dark arch on the shaft's BACK wall (a
  decal at z = −depth + 0.01) and the raccoon scurries out of it toward the lens and backs into it: the opaque back wall hides
  whatever is behind the arch, so it reads as a real hole. Check entrances/exits frame by frame, not only the held pose.

## The review loop (how 024 went from ~4/10 to …)
**Full playbook + the five reviewer brief templates: docs/BUILD-REVIEW.md.** The short version:
1. Render a 30 fps review cut; build a kit: 2 fps contact sheets per 10 s (`fps=2,scale=200:-1,tile=10x2`), single frames at
   0.5 s, the word timeline (story.json → text), the reference sheets (incl. 6 fps strips of the camera).
2. Dispatch 5 reviewer agents in parallel, one dimension each, each scoring /10 with ranked, timestamped fixes: logic &
   continuity · rendering & look · pacing & density (events per 10 s vs the reference) · camera & transitions (designs the rail) ·
   comedy & show-what's-said (rewrites the script). Tell them they're read-only.
3. Merge: script first (narrate), then the camera rail, then logic, then look; stills sheet per camera key; repeat until every
   dimension scores ≥ 8.
4. Look at the frames yourself while the reviewers run — you're the one fixing it, and their claims need checking.

024's scores (logic · look · pacing · camera · comedy): v1 4 · 4 · 6 · 3 · 5 → v2 (one take, ElevenLabs, continuity) 6 · 5 · 7.5 · 6 · 6.5 →
v3 (planRail, visible exits, re-voiced punch-ups) 7 · 6 · 8 · 6.5 · 7.5 → v4 (croissants-first, ring in the world, bearded stuck
driver, turnstile swipes) 8 · 6.5 · 8.5 · 6.5 · 8 → v5 (QC hook for faces under text, soft holds, money bills, nightlight
dark + glowing Gary) 8 · 6.5 · 8.5 · 7 · 8.5; v6 = the round-5 fixes below, shipped without a 6th review round. The camera stayed at 6.5 until the soft holds; the look reviewers keep asking for
AO/DoF/sky — the biggest remaining gap to the Blender reference.
Round-2's biggest wins for v3: planRail (no whips), visible exits, line punch-ups re-voiced for ~600 characters ("A snail just
lapped it", "Basically, load-bearing donuts", "Gary wakes up. Mid-air.", "Dirt is not on the list"), cutting a size claim the
picture couldn't show ("as long as a football field"), mid-grey tunnel concrete with cables + lamps (the light grey washed out
to a white void), hard hat off the eyes.
Round-3's: callbacks beat new jokes (the ending's "you just wanted to skip traffic" → a car above the station is STILL stuck, its
driver now has a 100-year beard and a cobweb on the window); a line should name what's on screen ("drain into that guy's car"
beat "into traffic"); never reuse a punch word ("load-bearing" twice → the beard became "longer than the tunnel", shown by the
beard trailing out of the tunnel and up the wall); end on a held tableau with every character in frame (raccoon surfing the
roof, Gary still stuck at the turnstile).
Round-5's: words that sit next to each other are < 0.5 s apart — three swipes on "pays / 3 / dollars" read as ONE; space
repeated actions ≥ 0.35 s apart and ARRIVE in the close-up before the first one. A screen/sign on a prop must sit clear of the
head in the close-up (the turnstile's SWIPE AGAIN hid behind Gary's head). A callback character must LOOK like the original
(the stuck driver in a white car with a white beard read as Gary; v6 = the hook's blue car, red shirt, yellow cap, grey beard).
End on the protagonist's predicament: the last train now whooshes out on "free" with the raccoon, leaving Gary wedged. It
has to be FAST (x += 11·t²): the platform sits below the train roof, so a train passing in front hides everyone on it — the
first whoosh (4.5·t²) hid Gary until the last 0.2 s. Check the final second of the actual render, not just a still at the end.

## Audio (make_cues.py → audio/synth.py)
- **The narrator sits on top.** cues.json `"voice": {file, duck_db ≈ −9, amb_duck_db ≈ −5, presence_db 2, hp 75}` loads
  voice.wav as its own stem; music + ambience duck under every phrase. Measured on 024: voice ≈ −15.4, sfx ≈ −19.9,
  music ≈ −23.8, amb ≈ −23.9 LUFS; master −14.0 LUFS, LRA 2.0 (the reference: −14.1 / 1.6). Measure stems with
  `ffmpeg -i out/stems/<k>.wav -af ebur128 -f null -`.
- **make_cues.py computes every cue from story.json** (same word anchors as shots.js), so re-voicing never desyncs sound.
- **Music identity "WORKSHOP"** (024): marimba `ostinato` 8ths in F major, 118 bpm, I–V–vi–IV, piano bass every 4 steps,
  a soft F pad under everything, a very light taiko pulse (vel 0.12), booms on the big impacts. **The genre's audio
  signature: a rising marimba "ta-da" (F5–A5–C6) on every TERM callout**, a two-note lift on money/labels, a falling pair on
  stamps. The hook is foley only (traffic, horns, shovel); the music drops in on "Congratulations". Never stops after.
- **Construction foley** (synth.py §6b, all soft + low-passed): `dig`, `crumble`, `splash`, `clunk` (size, metal), `knock`
  (plank pops, track "zips"), `pop` (things popping into existence, party popper), `zap` (soft buzz, never a crack), `plip`
  (drips), `grate`; beds `water_rush`, `drill` (TBM / pump motor), `fan`, `train`. Plus the house SFX (car_horn, giant_step,
  bonk, metal_groan, slurp, plush_squeak, blanket_rustle, low_swell) and beds (traffic_flow, city_day, wind, lamp_hum,
  crowd_cheer). The onset checker reports many "--" in this genre — expected, it was built for foley over music.

## The narrator: ElevenLabs "Adam" (user's pick for meme / exaggerated videos)
- Voice `pNInz6obpgDQGcFmaJgB` ("Adam – Dominant, Firm"), model `eleven_multilingual_v2`, settings stability 0.35,
  similarity 0.8, style 0.45, speaker boost, speed 1.12 — plus script.json **`"tempo": 1.15`**: Adam reads ~2.9 words/s
  even at speed 1.12, so narrate.py time-stretches each clip at assembly (ffmpeg `atempo`, pitch kept, cached clips reused —
  no extra credits) → ~3.3 words/s. Change the tempo freely; only changed TEXT costs credits.
- The key lives in `~/.config/edstudio/.env` (outside every repo). A full voicing of a ~1,800-character script ≈ 1,800 credits
  (Starter = 30k/month). Commit `voice/eleven-*.mp3|json` so nobody pays for the same lines twice.
- Captions: ElevenLabs gives "a"/"to" ~0.05 s, so narrate.py joins any word shown < 0.12 s to the next one ("A Raccoon") —
  never across a comma or period (v2 showed "It Gary" and "It Bad").

## Upgrading the scratch voice to ElevenLabs (one pass)
1. Put `ELEVENLABS_API_KEY=…` in `~/.config/edstudio/.env` (outside the repo, so it can never be committed; a git-ignored `.env` at the repo root also works). `python3 -I tools/narrate.py --voices` → pick a
   funny, energetic male narrator; optionally A/B with `--sample "Congratulations, you've built a subway." <id1> <id2>`.
2. Set `voice.voice_id` in script.json (`speed` ≈ 1.05–1.1 for ~3.1 words/s), run `python3 -I tools/narrate.py NNN-slug`.
3. `python3 -I videos/NNN-slug/make_cues.py && python3 -I audio/synth.py NNN-slug`, re-render stills at a few word-synced gags
   (shots are keyed to words, so they follow), then the full render. Commit `voice/eleven-*` + words.json + story.json.

## In the operation (docs/OPERATION.md)
- Claim the video number with the manager before starting (one-line message); it records build reels in `ops/ledger.csv`
  (lane "build") and asks the user which account/slot they go on.
- **The TRIBE gate doesn't fit build reels as-is:** at 95–120 s they exceed the ~70 s TRIBE's audio encoder handles at the
  default memory cap. Scoring one needs a ≤ 70 s cut or a one-off run with a raised cap — the 5-reviewer loop
  (docs/BUILD-REVIEW.md) is this genre's quality gate.

## QC checklist (build)
- [ ] The hook is spoken on frame 1 over action; no title card, no HUD, no end card; the last line is the punchline.
- [ ] One word on screen at a time, center, never under a callout; every TERM callout appears on its word and is shown on screen.
- [ ] Every line is SHOWN (a prop, a failure, an effect) — scan the preview at 1 fps: no run of 2+ s without something new.
- [ ] Gary's face is readable in every close-up (wide eyes / spiral / X / scream); no shot where machinery hides him.
- [ ] No sprite (dust, stink, drops, glow) fills the lens; no void under the ground block; no prop between camera and subject.
- [ ] Numbers are sourced (shots.js header + caption.md comment) and match the narration.
- [ ] Audio: −14 LUFS, voice clearly on top, `music dropouts: none`, nothing harsh (zap/crack soft, all foley low-passed).
- [ ] `--qc` lists no face-under-text run ≥ 0.5 s; the render log has no `[rail] … m in … s` warning.
- [ ] 1080×1920, 60 fps (motion blur 2), H.264 + AAC, < 100 MB; caption.md in house format with the course line, pasted in the report.

## Lessons from 024 (each cost a stills round)
- A cutaway needs the cut **off-center** through round things so the visible part is big enough (tunnel axis at z = −0.6:
  the train fits). Rings/bore use the matching arc (`ARC = acos(T.z / R)`).
- Anything that replaces a region of the face (the bakery block that sinks) must be **masked out of the face always**, or
  it z-fights / shows seams. The set's `setHoles()` adds that region itself.
- Keep the face deep (y −24) so wide shots never see under the block; check every wide for a white void at the bottom.
- Canvas text on props (BAKERY, GARY ST, SUBWAY, the G bullet) needs `await document.fonts.load(...)` in the builder —
  build() runs before main.js waits for fonts.
- **Sprites near the lens are the #1 still-killer**: a dust puff spawned 1 m from a close-up camera became a giant blur that
  hid the raccoon; stink haze turned whole frames green; the sponge's water burst filled the frame. Spawn sprites behind the
  subject (z < subject), small (0.25–0.6 m), and recheck every close-up that follows an effect.
- **Vertical frames are narrow**: at fov 40 the frame is ±12° wide. A 3.4 m ring 4 m away doesn't fit (the donut gag needed
  ~8 m); the TBM shield fills the frame at 8 m — frame the rider (seat x), not the machine.
- **Trailing machinery hides people.** Keep the TBM's trailing gear short (one gantry) and schedule big moving things
  (the train) so they're never between the camera and the gag (the train now leaves before the turnstile shots and returns
  for the raccoon, who rides on the roof — visible above the train instead of hidden inside it).
- Something "behind" the character (the third rail on the far side) makes them turn their back to the camera; put the gag
  object between the character and the camera (rail moved to the front edge) so the face reads.
- Reuse beats: Gary's fossil next to the dinosaur in the strata, the shovel stuck in the lawn until the ending callback, the
  raccoon from the first gag riding free at the end — callbacks make the ending land.
- Camera keyframes `[0, …]` inside a shot mean "the shot's start" (shots.js rewrites them) — otherwise a later shot eases from
  t = 0 and arrives nearly finished.
- Stills render in ~0.15 s and a 15 fps preview in ~100 s: iterate on whole-video still sheets (one still per shot), not
  single frames.
- **Tunnel interiors wash out under a front key light**: light-grey concrete (0xbdbab2) read as a white void / bathroom tiles.
  Mid-grey (≈0x9d9a93) + a speckle map + cables and a lamp every third ring (`makeHalfRing(…, {dress, lamp, shades})`) reads as
  a real tunnel and sells "miles" in a three-quarter view down the bore.
- Hide trailing machinery that covers the gag (`S.tbm.gear.visible = false` once the rings must be seen being built).
- **Ambient occlusion (`look.ao`, GTAOPass in engine/core.js) was tried on 024 and left OFF**: on a flat cut face it barely shows,
  and at a usable radius it paints blocky squares on the tunnel lining. Opt-in for future sets with real corners (rooms, streets).
- **Scripted edits that append `// why` comments mid-line bit twice more in 024** (a money-rain stream lost its closing `});`
  = syntax error; a planner line lost `vel = …` = runtime ReferenceError that `node --check` can't see). Append comments only at
  the very end of a statement, and render one still after every scripted batch. (A 4th time in v6: a replacement that ended
  mid-line before `} }` got a comment appended → `Unexpected end of input`. Only add a comment when the replaced text ends
  its line.)

## Lessons from 026 (garage → car factory; each cost a stills round)
- **A building cutaway works like the ground one**: slice every FRONT wall at z = 0 (light "section" colour on the cut ends),
  keep the roofs/ceilings, and still cut the floor slab + ground below (`engine/build/factory.js`). A pit (the e-coat tank) needs
  holes in FOUR layers: the hall floor, the lawn under it, the slab strip in front of the face, and the cut face itself
  (`setPit(k)`), else a plane shows through.
- **A long horizontal build in a vertical frame: march the story +x and put the ending's callback place at the FAR end** —
  the first layout had the mechanic's shop at the start, so the ending needed a 50 m fly-back. The hook's tow truck now drives
  your car off to the right and the last shot finds it on the lift in the shop at the end of the factory.
- **One line of cars, one offset:** slot k sits at `x0 + s(t) − k·pitch`; s(t) is a list of eased segments with stops placed so
  the gag cars sit at their stations (the three Cadillac cars, Gary's bolt car, the dip). Station crossing times are solved from
  s(t) for puffs/sparks AND mirrored in make_cues.py for the clunks. Parts pop on by distance past the station (easeOutBack).
- **Instanced meshes that travel far need `frustumCulled = false`** — the parts avalanche vanished: its bounding sphere was
  computed once (with the parts packed in the dock door) and went stale.
- **Overlay textures need a transparent background** — a rust overlay drawn on white turned every car into white camo.
- **A character who faces the prop shows his back.** Stage the gag so he faces the lens: on the car's seat beside the door he
  hammers in (sunroof), leaning back on the door to nap (welded), behind the line like the crew.
- **Two crash cars on one lane drive through each other** — use ONE car: winched back, new striped crumple nose pops on.
- **A roof test track can't be seen from below the roof edge**: stand a TEST TRACK sign + a racing car on the front straight
  (they read over the edge); the high ending wide (camera y ≈ 11) shows the whole oval.
- **Faces under the one-word caption (52 %): aim ≈ 10 % of the frame height below the head** (≈ 0.6 m at d 8, 1.3 m at d 16,
  fov 44). The first QC pass had 18 runs; lowering the look points (not the camera) fixed all but one in-move run.
- **Lifts: four posts at the corners** — a two-post lift puts a post between the lens and the car.
- **Music: synth.py's "walk" style leaves 50–100 ms gaps under the ducked voice** (the dropout check failed); the "disco"
  style (8th-note octave bass + off-beat stabs) is continuous. Skip the callout stings before the music enters — a money sting
  in the hook made the checker count the music-free hook as dropouts.
- `makeRobotArm().reach(point)` (factory.js) = 2-link IK with the weld gun pointing down; robots weld a bobbing target on each
  car and one swings over to weld Gary to the door.
- The mid-line `//` hazard bit again: a replacement that ended mid-line got a comment appended and silently commented out
  `heapW.visible = …` (the heap never hid). Run the CLAUDE.md grep after every scripted batch.
- **Punch words land after the camera left** (026 round 1: Promoted, Manager, Twice, Meatloaf, CEO — comedy 6.5, camera 5.5).
  Root cause: `planRail` clamps a framing's `until` to `next.t − 0.8·need` when the next framing is far, silently. rail.js now
  prints `[rail] until … clamped to …` — treat it like a speed warning. The real fix is LAYOUT: put each punch's prop next to
  the next gag (the vending machine beside the QC gate; Gary's sunroof car = the lead car the Roomba pulls), so the move after
  the punch is short. `planRail(frames, { shortHoldPass: true })` (opt-in) turns ≤ 0.25 s holds into pass keys instead of
  zero-speed stops (the camera review found three dead stops followed by 8 m/s moves).
- **A tighter mid-line-comment lint**: the CLAUDE.md grep misses a comment that swallows code without a `;` before it
  (`…);   // deflates airbag.g.position.set(…)`, `// no cap … scene.add(mech.root);`, both 026). After every scripted batch
  also flag any line whose `//` part contains `{`, `}` or `);` — two real bugs in 026 round 1.
- **Lay the gag out so the important side faces the lens**: a door "into a sunroof" stuck upright in the cockpit was a blank
  slab — laid flat across the cockpit like a roof (blue, with a window + handle) it reads; plain black tori read as tyres —
  spokes + tan/red/steel rims make "steering wheels"; the Roomba at r 0.3 m vanished under the crew's legs — ×1.7 in its gags.
- **The Cadillac-style "three cars → one pile" needs a down-the-line view** (cars 4.6 m apart side by side don't fit 9:16):
  a three-quarter from the front-left, high (camera (7, 4.6, 3.5) → look (19.5, 0.6, −3.4)) shows all three + the pile.
- **The builder rule (user, Oct 26): Gary does what the narration says "you" do** — he builds the junk car, yanks the start
  lever, slams the press buttons, rips open the robot's crate and bolts it down (then it welds him), drives the JIT tugger,
  slaps on the crumple nose. Passive only when the line makes him the victim (welded → dipped).

- **Path keys must stay in time order after a re-voice** (026 round 2): a route keyed to `pay + 0.6` then `dollars − 0.3` was in
  order with the scratch voice and swapped with ElevenLabs (the words came 0.6 s closer) → `endPath` skipped a segment and
  teleported Gary onto the stairs. After every narration change assert `ROUTE[i][0] < ROUTE[i+1][0]` (or key on later words).
- **The scripted-edit comment trap, third flavour**: a replacement whose match ends MID-LINE and appends `// note` comments out
  the rest of that line (026 round 2, three times: `looseDoor.scale…`, a closing `}`, the tail of the ROUTE array). Only append a
  comment when the match runs to the end of the line; `node --check` (a `.mjs` copy) after every batch caught all three.
- **Anything built in the y–z plane is edge-on to the cutaway lens** (it looks down −z): the QC gate (posts at z ±1.2, a bar along z)
  read as one black pole, a horizontal scanner strip at eye height as a faint line. Give such props a camera-facing face — a
  green-lit portal BEHIND the car (posts at x ±1.9) so nobody walks into it, and a vertical additive light curtain in front.
- **`--qc` gives sfx callouts a wider margin (±6.5 %) than the caption (±4.5 %)**: put SZZT!/HELP! ≥ 7 % of the frame height
  away from the face they belong to, beside it, not on it.
- **Some caption crossings can't be framed away**: a move from a frame where the face sits below the caption to one where it
  sits above crosses the band (026's crane-down to the office). Make it quick — time the subject's own rise (Gary climbing
  the stairs) to overlap the camera's descent so the face moves through the band twice as fast (one 0.25 s sample).
- **One framing for "start → impact"**: "You crash one into a wall" framed only the wall, so the viewer saw a parked line car
  and the crash car rushed in from off-frame. Frame the start position AND the wall (fov 46 at ~10 m), then push in on the
  aftermath; the move from the previous punch (MANAGER) must fit, so trim its `until` rather than skip the start.

- **`python3 -I tools/lint_comments.py <files>`** flags a `//` that swallowed code (the three flavours above, plus a ✓ that lost its
  pop-in scale in 026 round 3). Run it with `node --check` after EVERY scripted batch; it found a real bug every round of 026.
- **Sample `--qc` at 0.1 s, not 0.25 s** (026's hook steps 0.1): two 0.25 s hits can be anything from 0.25 to 0.75 s. At 0.1 s a
  crossing during a crane-down measured 0.5 s; a pause at the foot of the stairs + a 0.7 s dash up (his own rise adding to the
  camera's descent) cut it to 0.3 s.
- **Anything that appears inside the cutaway section should GROW, not pop**: the e-coat tank's walls appeared full height in one
  frame and blanked the basement behind it (look review: a "blank grey box"). It now rises out of the basement floor with the
  pit (`tank.position.y = y0·(1 − ease(k))`), basement grey + a hazard rim.
- **Thin lines don't exist at 1080×1920**: lightning as zig-zag BOXES (0.1 m, additive yellow, rebuilt per frame from two end
  points + jitter), not `THREE.Line` (always 1 px) and not cyan on a cyan bath. Same for small props: a flat tie on top of the
  Roomba read as a red sliver → a big bow tie standing on its front rim, and the Roomba turned to the lens on "manager".
- **Props that hide the person using them**: the vending machine popped in exactly where the inspector walked (he vanished
  behind it). Stand the user beside the prop's front, on the lens side, and hand them the result (the meatloaf in his hand).
- **Moving the subject fixes framing faster than moving the camera**: a price board cut by a lift post from every camera x was
  fixed by sliding the board 0.35 m along the wall (and scaling it 0.87), not by another camera key.

026's scores (logic · look · pacing · camera · comedy): v1 (scratch voice) 7 · 6 · 7 · 5.5 · 6.5; v2 (Adam) 7.5 · 6.5 · 8 · 6.5 · 7.5;
v3 8 · 7 · 8 · 7 · 8 (logic/pacing/comedy folded into one reviewer, per the manager) → finalized (camera ≥ 7 = 024's best).
**USER VERDICT (Oct 27): the cuts were rejected** — "i dont really like [the cuts] i liked our older continuous style it was much
easier to follow". Build reels stay ONE continuous take. 026 shipped with `const CUTS = false` (the list stays in shots.js for
reference), the kicks kept at FULL strength (user: "the new effects / density / screen shakes are good its just the cuts that make it weird"), every cut-only cheat gated on CUTS, and soft rail push-ins
(`Fk(…, until)`) wherever a gag had relied on a close-up (the jaw drop, the face in the heap, flat on "not"). What follows is kept
as a record of what the cut style needs, if it is ever tried again.
**026's cuts pass (the newer cut-heavy style on top of the finished one-take, 45 cuts / 84 shots / avg 1.29 s):**
- **Face shots on the 1.1 m toon: `{ dist: 2.9, faceY: 0.36 }`** — the default faceY 0.40 put the one-word caption across the
  MOUTH (52 %) in most close-ups; 0.36 lands it on the chin, the hat top at ≈ 4 %. Spread one `GF` object into every face cut.
- **Join gaps < 0.35 s between consecutive cuts** (a `tight(list, 0.35)` pass before `makeCuts`): 1–3 frames of the master
  between two cuts read as stutters (five of them in the first pass); either butt them or leave ≥ 0.35 s of master.
- **Never put a face cut where something is held in front of the face** (the tugger's steering wheel, the Roomba carried in his
  arms — no yaw/pitch fixed either; drop the cut) and **never let a face cut replace the gag's own wide** (the airbag burst, the
  soda-can squeeze): cut to the face AFTER the physical gag lands. Inside a pile (buried in wheels) clear the instanced debris
  on the lens→head line for that cut only (`inLens()` scales them to 0) — a film cheat nobody sees.
- **`facing: true` swings the lens with the character**: when he turns (the shipping car rounding the end door) the lens went
  behind a wall → 4 grey frames. End the cut before the turn.
- **Close-ups into a transparent volume wash out** (the e-coat bath at opacity 0.55 filled the frame blue): shoot it from higher
  and wider, draw effects inside it after it (`renderOrder 5`, `depthTest false` for the additive bolts).
- **Cold open:** `const update = (tq) => update0(tq < 0.35 ? END - 0.8 : tq, tq)` + an insert for t < 0.3 — the scene renders
  the finished factory while the real time drives the cuts/captions.
- **A film-cheat window (a hidden wall) tied to a cut must end with the cut's REAL end**: `tight()` stretched the end-door insert
  by 0.3 s past its listed end, the crash block came back early, and its target filled the frame (caught only in the 60 fps
  final's last-8-s check). Key the window to the next cut's start.
026 v4 (cuts) review: logic 7.5 · pacing 8.5 · comedy 8 · camera 6.5 → one fix pass merged (the faces, gaps, drops above).
