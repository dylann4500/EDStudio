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

## Lessons from 025 (kiddie pool → dam; each cost a stills round)
- **A cut ALONG a river** reads a dam in section: the lake is a translucent box on one side, the river on the other, the dam's
  profile (and its guts: cutoff wall, cooling pipes, penstock, tunnel) is the cut face. `engine/build/dam.js` `makeWaterBody`
  generalizes 024's `setWater` (`set(x0, x1, level, t)`, z 0..−CW, a foam texture scrolls with the flow).
- **`CatmullRomCurve3.getPoint(u)` is NOT arc-length**: equal `u` steps per control-point segment, so a character sent along a
  path with uneven points zips through the long segment in a few frames (Gary "vanished" in the diversion tunnel). Use
  `getPointAt(u)` for anything that travels, digs or reveals along a path.
- **Groups whose children were placed in world coordinates scale around the world origin** — a popping powerhouse or fish-ladder
  step flies across the set. `recenter(group, c)` (dam.js) moves the pivot first.
- **A vertical frame can't hold two places > ~8 m apart.** Plan the ending's last three items (sign, gift shop, closed pool) inside
  one 4–5 m frame; a finishing list that spans the set is a sweep (pass keys), not a hold. Check with `tools/bearing.py` first.
- **A canyon wall behind the cut** dominates every low frame: fat strata bands read as bacon/curtains. Thin (1–3 % of its height),
  low-contrast bands + a pale haze overlay, a wall only ~12 m tall (sky shows in the wides), greenery and boulders at its foot.
- **A concrete section facing the sun washes out to white paper** — mid-grey base (≈ 0x86847e). "Red-hot" = an orange emissive
  AND a darker base color (`color × (1 − 0.5·heat)`); orange emissive on grey reads pink.
- **Never route a pipe across the front channel**: 025 v1's penstock feed crossed the creek and blocked every downstream gag
  (salmon, the ladder slap). Draw it in section under the creek bed and let a riser come up behind the channel.
- **Two faces at different heights (a toon sitting low, a beaver at a counter) straddle the 52 % caption band** — lower the look
  point until BOTH sit above ~45 %; and give stamps a `y` (0.63) when their default band covers the sign they're about.
- **Pluck "walk" music decays between notes**: the dropout check (12 dB under median per 50 ms) failed until the pad came up
  (`pad_db` +4). Signature mallet notes on hook callouts BEFORE the music enters make the checker start early — skip them.
- **025's review loop** (logic · look · pacing · camera · comedy): v1 6.5 · 6 · 7 · 6 · 7.5 (a much better first cut than 024's
  4 · 4 · 6 · 3 · 5 — the 024 lessons above were applied up front). Round-1 wins: the camera reviewer's framings (it simulated
  planRail against the word times: the named thing in frame ON its word, peak zoom 108 → 69 %/s, a town shot at yaw 21° not 33°);
  "show what's said" fixes (the finger really stops the leak; the beaver's cards turned to the lens; the salmon bonk the dam
  BEFORE they "blame Gary"; "Exactly once." = a head-first landing); a line for a beat that had no joke (the drowned town:
  "The beaver sells it as lakefront."); water with an opaque deep-blue back face (a translucent box over an orange wall read lavender).
- **`planRail.strict = true`** (rail.js, opt-in) also warns on crash zooms (> 50 %/s framed-size change) and fast pans (> 0.7 frame
  widths/s) — the metre rule alone let a far-away push-in pass lint while reading as a cut.
- **Turn a held card to the lens every frame** (`card.quaternion = parentWorldQuat⁻¹ · camera.quaternion`, after the camera is
  set): a card in a toon's hand is edge-on in half the framings.
- **Things a character "uses" should be where he already is**: Gary had to teleport for the water slide until the "week of rain"
  became an on-screen climb up the dam face (a time skip the line already gives you).
- 025 round 2: v2 7.3 · 6.4 · 7.5 · 7 · 7.8. Wins for v3: the camera reviewer's simulated rail again (the hook holds Gary through
  the heave, then a follow-pan locked on the flying pool — ease the pool's x/z so it stays framed); the drowned town finally
  underwater; Gary off the air above a slope; cards above heads; Gary shoulder-charging the dam on "too heavy to bully".
- **An opaque back face for a translucent box needs `side: BackSide`**: the box's −z face points away from the lens and is culled,
  so the "deep blue" never drew and the orange wall kept showing through the water. Keep that back face in front of any displaced
  wall relief (025: lake depth 7.5 m in a 9 m canyon) or rock pokes through it.
- **Lerping `material.color` only tints its `map`** — a brown rock texture can't turn concrete-grey that way; set `map = null`
  (+ `needsUpdate`) when the surface changes what it is.
- **A held prop in a toon's hand moves in the hand's rotated frame**: a "lift" offset pushed 025's cards down over the beaver's face.
  Place such props in world space (`parent.worldToLocal(target)`) above the head, then billboard them.
- **A camera move from a low framing to a high one carries every face across the 52 % caption band.** If `--qc` flags the transit,
  move the face out of the move (025: the crumble dumps Gary in the pond; he surfaces once the camera has settled).
- **Check where a character stands against the geometry's real profile**: 025 v2 had Gary 0.85 m above the earth dam's slope for
  4.5 s because his x was past the crest edge; compute y from the slope when in doubt.
- 025 round 3: v3 logic 7.9 · look 6.6 · pacing 7.6 · comedy 8.1 · camera 7.5. Wins for v4: **frames closer than ~4 m apart read as
  one shot** (660 → bully → hot held one grey wedge for 10 s with Gary at 3 % of the frame) — replace the middle with one LOW
  ground-level frame at the subject (Gary 2.3× larger; the egg + the hot slope in the same frame); **`until` can't hold a frame
  the next move needs**: planRail leaves at `next.t − 0.8·moveTime`, so a 12 m crane after a 2 s line ate the whole LAKEFRONT
  hold — bring the next framing closer (shorter move) instead of pushing `until`; **show the gag where the camera already is**
  (the lake's shove now starts on "deeper" with push arrows on the upstream slope inside the frame, riding the dam's slide);
  **backfill what you dug** (a plugged tunnel kept reading as a white pipe for 40 s — hide the bore, plug and holes once the
  next set piece covers it); **submerged buildings need a tint, not just a see-through front**: lerp their colors toward the
  water blue by depth; **a hand-held book in front of a face hides it** — hold it out beside the head.
- 025 round 4: v5 logic 8.0 · look 6.7 · pacing 8.1 · camera 7.5 · comedy 8.2 (3 reviewers: logic+pacing+comedy folded, camera, look).
  **Series rule (user, via the manager): Gary is THE BUILDER.** Every "you ___" line shows Gary doing it with a tool, then the
  failure hits him — no build step happens by itself. 025's map: shove → he heaves the pool; dig → he digs the tunnel IN SECTION
  from the outlet back to the inlet and breaks through into the river on the next line (the flush is then his own doing); pile up
  dirt → three shovel throws, the last one comes back down on him; drive a wall → three overhead mallet hits, the wall sinks a third
  per hit; pour → the crumble flings him into a cableway bucket and he trips it over every column; cooling pipes → a garden hose
  on the toe; spillway → one mallet notch in the crest; penstock → he cranks a red valve wheel; fish ladder → he mallets each step
  as it pops. Props live in the hand (`gary.hand(1).add(prop)`), visible only in their beat.
  **A camera can't catch a gag that happens faster than the speed rule allows** — re-time the gag instead (the flush was shortened
  to 1.5 s and started 0.2 s early so the follow pass keeps him in frame; the bucket's last stop sits lower so his face clears the
  caption band). **Density bar (manager, = 024's):** ≥ 22 callouts, ≥ 70 `fx.burst|stream` call sites, ~45–50 framings, ≥ 250 cue
  events, beaver/side character in ≥ 4 beats, no 2 s static run. Footsteps beds, per-stroke tool foley and drips are the cheap
  way to the cue count; mirror every new time in make_cues.py.
- **025 cuts pass (the first build reel cut in the new style): 31 face close-ups + 11 inserts = 42 cuts, 83 shots, average 1.29 s, 44
  kicks.** What broke on the first stills (render one at the middle of every cut — 025's EDSTUDIO_QC prints `cutmids …` + the cut
  stats, so `--stills $(… cutmids)` does them all in one command):
  - **A close-up of a character facing away shows the back of a head.** Gary cranking a valve and walking to the ladder faced
    −z/−x; turn the POSE toward the lens for his reaction beats (cheaper than hunting a yaw). For a side character whose facing
    changes beat to beat (the beaver), use `facing: true` so the yaw is measured from its own front.
  - **A side character holding a card/sign:** `scale ≈ 1.3, faceY ≈ 0.63` puts the card above the head, the face below the
    caption and the caption between them; with nothing held, `faceY 0.42` (caption on the chin) like Gary.
  - **Signs between the lens and the face** (LAKEFRONT, NO SWIMMING): pick the yaw side away from the sign (`facing: false`,
    negative yaw).
  - **Hold the reaction through the cut:** the frost-sit close-up showed his back because the climb started 0.1 s into it —
    delay the next action (CL0 +0.5 s) rather than shrink the cut.
  - Tumbling heads (cork pop, head-first splash) read as chaos — fine, keep those ≤ 0.6 s.
  - Kicks: old metre-based `shake()` only on the rail (`if (cam.cut == null)`), `kick.apply` everywhere; the dam's shove and the
    flood at 1.5, slams 1.0–1.2, landings 0.5–0.8, pops 0.4.
- 025 round 5 (v6, first cut-heavy version): camera+cuts 7.3 (≈ 7.8 with `facing: true` on the side-on close-ups) · logic 7.9 ·
  pacing 8.3 · comedy 8.4. Fix pass → 56 cuts, 105 shots, average 1.02 s (≈ "Bicycle → F1"). Lessons: **a 0.05–0.2 s gap
  between two cuts is a FLASH FRAME of the master** — make cuts adjacent (`t1` of one = `t0` of the next) or ≥ 0.3 s apart; 025's
  EDSTUDIO_QC prints `[cuts] … flash` for any gap < 0.3 s. **Two close-ups of the same face with 0.3 s of wide between = a jump
  cut** — merge them into one medium shot. **Fill every 4+ s stretch with a cut on its own word** (the yardstick on "six", the egg on
  "hot", the drowned church on "drowned", the bills on "dollars"). **Callback the cold open:** cut back to the same finished-dam
  wide on the ending's "Congratulations". A tumbling head-first dive reads better as an INSERT of the legs sticking out of the water.
- **User verdict on the cuts pass (Oct 26): "i dont really like [the cuts] i liked our older continuous style it was much easier to
  follow."** 025 went back to ONE take (`const CUTS = false` keeps the cut list for reference). The user kept everything else: "the new
  effects / density / screen shakes are good its just the cuts that make it weird" — the frame-relative kicks stay at FULL strength.
  The take then has to carry every gag alone: push the rail in on each one (025: the yardstick on "six", Gary shovelling + buried on
  the pile, a two-pass ride with the concrete bucket, the overtop on the crest, the ending in his pool at ~3–4 m) and make held
  cards big enough for a wide (`card: 2.3–2.6`, lifted 0.8 m above the head). The engine's `cuts.js` stays available.
- **Water volumes (user: "overlapping elements and weird water cutoff things"):** a `makeWaterBody` front face ends with a hard
  vertical edge wherever its x-range ends — never end one in the open. Two bodies at a pool/dam: end BOTH at the obstacle's centre
  (the pool sits in continuous water, the level step hides behind it), not at its walls (that left a dry strip under the pool).
  Before a thrown prop lands, run the creek whole up to a real wall (the beaver's sticks). Keep a creek's surface BELOW the bank
  top (the surface plane spans the whole canyon width: at level 0 it z-fights the floor and reads as water on the ground). When a
  dam vanishes (the crumble), run the water's end on to the next body instead of leaving it standing in the air.
- **Hook staging: one thing at a time.** A held prop sits IN the raised hands (the pool floated 0.3 m above them); the
  thermometer, the CLOSED board and the see-through fence each get their own patch of frame (fence starts right of the gate).
- **Water = its level ∩ its container (user, 025: "it doesn't fill in corners, clips… a triangle of empty space against the
  wedge").** A box of water can only meet vertical walls. `makeWaterBody(...).setPoly(pts, xl, xr, level, t)` (dam.js) takes the
  water's SECTION polygon; 025's `setWater(body, fL, fR, L)` builds it from two wall functions x(y) — up the left wall from the
  bed to the level, along the flat level, down the right wall — so it rides every slope (the dirt dam's faces, the wedge's
  downstream face, the beaver lodge's silhouette) and slides along it as the level moves. Walls per era live in one `walls(t)`.
  A tunnel's water fills its bore (a thinner tube leaves an air ring). Review missed it twice on 360 px sheets: check water with
  CLOSE stills on each contact line (025's `INSPECT` table of debug cameras keyed by time) and a reviewer on full-size frames.
- **025 fluid review (full-size frames, explicit checklist) found what 360 px sheets hid:** a tunnel's top poking above the creek
  bed at its inlet (clip the bore + its water with a plane at the bed); a dome-shaped obstacle drawn as if it were a ridge (make
  obstacles uniform across the channel so their cut-face section = the wall function); a flood front racing ahead of a dam that
  shrinks slower (follow the slope up to the CURRENT crest, then run over it); a pond leaning on a wedge that isn't poured yet (the
  last poured column is the wall); two water bodies at different levels with nothing between them (one level once the pool floats);
  an overflow sheet starting below the brink (a curtain from the lake level down the crest face); a translucent front showing the
  sunken floor as a pale "air" layer (tint the submerged floor deep blue). Also: a water volume must be a CLOSED prism drawn from
  inside with a small polygon offset (it lies exactly on dam faces; a lone back face let sight lines exit past sloped walls), and
  ONE body per continuous level (an inner wall hides everything under the lake behind it).
