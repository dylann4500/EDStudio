# POV story: the genre recipe (first person, many voices)

You ARE the main character: the camera is your head, your hands are in frame, and the people around you talk *to* you, each
in their own natural voice and caption colour. It shows **a person doing something interesting**: a day in their life, a
skill, a job, a journey, a big moment. **Suspense** (the reference reel) is one mode of several. The default is **brand-safe,
professional, good production quality**, something a brand would actually run. Humour is light and never the point (user,
Nov 13: "keep it professional… good production quality for these videos that brands would actually use, not leaning too
much into funny"). The product lives **inside** the story: the tool the person reaches for, a notification that lands as a
beat, or a character's advice. Never an ad break.
**Why/what:** [`docs/genres/pov-story.md`](genres/pov-story.md) (the genre + a breakdown of the reference). **Test reel:**
`videos/086-pov-library-lockin` (suspense mode; copy its script.json, shots.js and make_cues.py). **Command:** `/new-povstory`.
Status (Nov 13 2026): in the toolbox. 086 is a test cut (Fish voices), not posted.

## House-rule differences (like build reels, this genre is exempt from some defaults)
- **No opening question card.** Frame 1 is the scene: the first line is spoken at ~0.3 s and a **place/time stamp** (day + time
  in white, place in yellow, top-left) shows for ~4 s. It is the only HUD (a mode may add a small counter: shift time, km, reps).
- **Captions = dialogue:** 1–4 word phrases at ~67 % height, **coloured by speaker** (tools/narrate.py `phrases`). No lower-third
  subtitles, no centred one-word build captions.
- **The ending fits the mode** and stays fully visible ≥ 3.5 s (`tail` in script.json): suspense = the **choice card** (two answer
  pills + "Comment for Part 2 ↓"); the other modes = the payoff moment held for a beat, then a question card built from the same
  component ("Would you do this job?" YES / NO WAY), or the brand's end card when the video is an ad.
- Still applies: no links/plugs in the caption, music that never drops out (a drone or a bed counts), every frame moving, no
  flashing or pulsing text, faces and the phone screen clear of the caption band when they need to read.

## Story modes (55–65 s, ~110–130 words of speech)
Every mode keeps the same skeleton: **a specific person, place and time → a goal → 4–6 escalating moments, each with someone
talking to you → the product as a tool at the moment it's needed → a payoff → an ending that invites a reply.** Put a visible
change in every 3–5 s (a new place, a whip to a new voice, a phone screen, a light, a result).
| Mode | Example | Beats (≈ seconds) | Voices that talk to you |
|---|---|---|---|
| **Day in the life** | "POV: you're a pastry chef and the wedding cake is due at noon" | 4 AM start (0–5) → the first problem (5–15) → the rush, 3–4 quick stations (15–40) → the save, with the product as a tool (40–48) → the finished thing + the reaction (48–55) → "Would you do this job?" | the boss, a coworker, a customer, a phone call |
| **Skill** | "POV: you land your first kickflip after 300 tries" | the attempt count + a fall (0–8) → advice from people around you (8–25) → near misses (25–40) → it works (40–50) → the crowd (50–55) | a coach, friends, a stranger filming |
| **Job** | "POV: you're the lifeguard on the busiest day of summer" | the shift starts (0–5) → requests pile up (5–30) → the one that matters (30–45) → handled (45–55) | radio calls, swimmers, a supervisor |
| **Journey** | "POV: your first week living alone in Tokyo" | arrival (0–6) → 4–5 places, each a new look + a stranger (6–45) → the moment it feels like home (45–55) | locals, a parent on FaceTime, an announcement |
| **Big moment** | "POV: it's 30 seconds to your first launch on stage" | the countdown (0–10) → voices pushing you on (10–35) → the moment (35–45) → the reaction (45–55) | a stage manager, a friend, the crowd |
| **Suspense** (086) | "POV: you fell asleep in the library during finals week" | normal (0–4) → wrong (4–10) → rules (10–20) → a named person at risk (15–25) → the phone (18–30) → closing in (30–45) → the product beat (38–45) → two truths disagree (42–52) → the dilemma (50–55) → the choice card | an authority, a friend on the phone, a PA, a stranger |
**Suspense topics:** the *shape* of dread with a safe cause (locked in after closing, a power cut during finals, a sub nobody
knows, a swapped phone). **Never** shootings, assaults, kidnapping or a real tragedy; keep any threat ambiguous and non-violent.
**All modes:** one real-feeling person, specific details (a time, a name, a number), the product shown working for 2–4 s, said
or shown once.

## Voices: professional and natural (multi-voice narration, `tools/narrate.py`)
**Rule (user, Nov 13):** brand POV videos use **regular, natural, professional voices only**. **Never the accent presets**
(`narrator-chinese`, `narrator-chinese-2`, `narrator-indian` or any accent-comedy voice): those belong to the separate Scribe
comedy lane. No novelty voices, no clones of real people or game/anime characters (Fish's public search is full of them, e.g.
Markiplier, Smash / Mortal Kombat announcers, FNAF, "Sua from Alien Stage": read each model's description with the free
`GET /model/<id>` before using it). **Default provider: Fish** (`FISH_API_KEY` in `~/.config/edstudio/.env`); ElevenLabs is
fine too.
| Role | Fish voice (s2.1-pro) | id | Notes |
|---|---|---|---|
| **Narrator** (the default for any narrated mode) | "Narrator" | `0327fdb5da9e4fd782899a8058c8ae2b` | deep, calm, measured, standard American; the POV person's inner voice or an outside storyteller |
| young woman | "Sarah" | `933563129e564b19a115bedd57b7406a` | soft, conversational (086's Sam, speed 1.05) |
| man, clear | "Slax" | `c5f56a6cc2ec4fa8920cb4c5889a3fb7` | clear, crisp, American (086's Theo on the phone, 1.1) |
| young woman, British | "Dolly" | `ce3b16c14af54adebba5ebe50a3d4417` | warm, bright; a good announcer through the `pa` fx (086's PA, 1.0) |
| man, deep | "Adrian" | `bf322df2096a46f18c579d0baa36f41d` | slow, measured; authority or a stranger (086's guard, 0.95) |
| young woman | "Polo" | `f48d143a59a946ab87c0130fd081f349` | brighter (296 Hz median), so it reads apart from Sarah (086's Jules, 1.1) |
Pick voices that differ in gender, age or pitch so people can tell them apart with the sound on, and give each its own caption
colour for sound-off viewers. Settings that worked: temperature 0.6 + script pacing `maxPause 0.3, endPad 0.25, headPad 0.1,
pauseByWords, breath {db -9, keep 0.25, margin 0.06}`.

script.json gets a `cast` and every line gets a `who`:
```json
"mode": "pov", "fps": 30, "motionBlur": 2, "lead": 0.35, "gap": 0.18, "tail": 5.4, "phraseMax": 4,
"voice": {"provider": "fish"}, "maxPause": 0.3, "endPad": 0.25, "headPad": 0.1, "pauseByWords": true,
"cast": {
  "you":   {"name": "Sam",  "color": "#ffffff", "fish": {"reference_id": "933563129e564b19a115bedd57b7406a", "model": "s2.1-pro", "speed": 1.05, "temperature": 0.6},
            "scratch": {"voice": "Samantha", "rate": 198}},
  "theo":  {"name": "Theo", "color": "#5fe3ff", "fish": {"reference_id": "c5f56a6cc2ec4fa8920cb4c5889a3fb7", "model": "s2.1-pro", "speed": 1.1}, "fx": "phone"},
  "pa":    {"name": "PA",   "color": "#ffa63d", "fish": {"reference_id": "ce3b16c14af54adebba5ebe50a3d4417", "model": "s2.1-pro"}, "fx": "pa", "gain_db": -1.5}
},
"beats": [{"id": "pa1", "who": "pa", "say": "Attention. The library is now closed.", "gap": 0.25}, …]
```
- `python3 -I tools/narrate.py NNN-slug` voices every line with its speaker's Fish voice (cached per speaker + text, so only
  changed lines re-bill; `--scratch` = the free macOS `say` cut for a draft), runs the speaker's **fx** (`phone` = a call on
  speaker, `radio`, `pa` = ceiling-speaker slapbacks + a hall, `far` = across a big room, `room` = a few metres off, `muffled` =
  through a door; a beat can override with its own `fx`/`gain_db`), lets reverb tails ring under the next line (they don't
  push it later), and writes story.json with `cast` + **`phrases`** (the coloured captions) + `beats[id].who`.
- **Cost:** spending needs the user's OK. Their standing OK (Nov 13) covers Fish voicing for videos, so keep it small: one pass
  + at most one fix pass. 086's 21 lines = 643 bytes ≈ **$0.0096 on Fish** ($15 / 1M UTF-8 bytes, s2.1-pro). ElevenLabs
  Multilingual v2 would be ≈ $0.06 (~$0.10 / 1K characters list; Flash ~$0.05).
- **A filtered line that blurs: transcribe the RAW take first** (`voice/fish-<beat>-*.mp3`, faster-whisper / check_voice.py).
  086's Jules line read "You sent me… the bathrooms are open" through the `far` fx while the raw take was clean: switching her to
  `room` fixed it for $0. Re-voice only when the raw take itself is wrong. Keep `far`/`pa` lines short.
- Free scratch voices for drafts (all intelligible in whisper): Samantha (US f), Daniel (UK m), Karen (AU f), Moira (IE f),
  Tessa (ZA f), Grandpa (English (US)) (old m). Drafts only: ship with the professional voices.
- Caption colours that read on dark or bright frames: white (you), cyan `#5fe3ff`, yellow `#ffd84a` (authority), orange
  `#ffa63d` (PA/system), pink `#ff8fcf`. Keep one colour per person for the whole reel.

## Engine kit: `engine/povstory/` (all opt-in; no shared defaults changed)
- `look.js`: `addFisheyePass(studio, {k})` (barrel distortion before the grade; render the camera ~10–20° wider; k 0.42–0.5)
  and `addInk(root, {width, filter})` (inverted-hull ink outlines, a child hull per solid mesh so it follows visibility; flat
  planes/transparent/shader materials skipped; `userData.noInk` opts out). Width 0.0026 world, 0.004 for POV hands.
- `pov.js`: `makePovArms(camera, {sleeve, cuff, skin})` (`L/R.set({cam, rot, pose: rest|flat|point|fist|hidden})`,
  `L.hold(phone)` = the left hand becomes the phone's grip), `makePhone({w, h, light, skin})` (screen + transparent `ui` overlay:
  `setMap(tex)` for a canvas or a render target, `setUI(tex)`, `setOn(k)`), `moves(t, start, list)` (head/phone tracks: each
  move arrives at `t` after `d` s and holds; eases `io|out|whip|lin`), `shake(t, amp)` (breathing + nerves), `setHead(camera, h, sh)`.
- `hud.js`: `createPovStoryHud(story, {stamp, banners, choice, capTop})` (speaker-coloured phrase captions, the stamp, iOS-style
  notification banners `{t0, t1, icon|iconText, app, title, text}` and the choice card `{t, q, a: {text, color, icon}, b}`;
  icons `flashlight|run|door|lock|stairs` are inline SVG (no emoji). `hideCaptions(t0, t1)` keeps a phone close-up clean.
- `stacks.js`: `buildStacks(studio)` = a university library's 4th floor at night for a seated POV: one long aisle of
  instanced-book ranges with cross aisles, 7 ceiling light banks (`setBanks([...])` far → near), a banker's lamp, your table
  (`sheet` mesh for a worksheet texture), a stairwell door that opens onto a lit stairwell (`setDoor`, `setStair`), EXIT sign,
  clock, windows onto a night campus, a book cart, a QUIET FLOOR sign.
- **Any mode, any place:** look.js, pov.js and hud.js don't care about the set. Put the POV head in an existing set
  (`engine/sets/kitchen.js`, `pool.js`, `street.js`, `restaurant.js`, `stadium.js`, `supermarket.js`, `engine/build/campus.js`,
  `engine/build/airport.js`…)
  and dress the surface in front of the hands, or build `engine/povstory/<place>.js` with one deep sightline.
- Reused: `engine/build/toon.js` `makeToon` (cast; `tint: [0x0b0d14, 0.9]` = a **silhouette** whose eye whites stay white: the
  best "who is that?" figure), `engine/props.js` `makeFlashlight`, `engine/build/subjects.js` `subjectSheet` (the worksheet
  blank on the table, done in the notification thumbnail).

## shots.js pattern (copy 086)
- **Every time is read from story.json** (`BT(id).s0/s1`, `WT(id, word, n)` = a word's start) into one `T` table. make_cues.py
  repeats the same formulas, so a re-voice re-times picture and foley together.
- **One continuous take:** `HEAD` and `PHONE` are `moves()` lists. Look at whoever talks; whip (≤ 0.24 s, `ease: 'whip'`) on
  surprises, 0.35–0.6 s on deliberate looks. Duck/stand by moving `p`. Zoom with `fov` (a whip to fov ~26 is a "focus" on a far
  thing). `shake` amplitude 1 → 1.6 → 2.4 as the fear rises. Fisheye a touch stronger when hiding.
- **The phone is a screen with states:** draw each UI into a canvas only when its key changes. A **video call** = a toon in a
  small set parked far away (x = 200) rendered into a `WebGLRenderTarget` every frame he's on screen (mouth flaps on his word
  times). A **camera viewfinder** = a camera at the phone's back lens rendered into a target. A **photo** = the same render with
  the scene posed at the flash time (`phoneWorld(T.flash)` computed at build without touching the real camera), so a figure can
  be *in the photo but not in the room*. Pinch-zoom = the render target texture's `repeat/offset`.
- Lights you toggle per frame stay in the scene with intensity 0 (adding/removing lights recompiles every shader).

## Sound (make_cues.py → audio/synth.py)
**Match the mode** (audio/README.md → Sound identity): a day-in-the-life or skill reel gets a warm, moving bed (synth plucks or
bells + a pad, `instrument: "pluck"|"bell"`) under the place's own sound (a kitchen, a beach, a crowd). A big moment
builds to one hit. Suspense is SFX-led like the reference. Never the ripped tracks in exports/music for anything a brand could run.
**Suspense (086)**: SFX-led like the reference. A **drone pad that never stops** (`notes: [26, 38, 45, 50]`, hp 30), **braams** (add the tritone)
on the two reveals, `boom` drums on the reveal/choice, a **heartbeat** that speeds up while hiding, and foley that tells the
story: `clunk` + `lamp_switch_click` per light bank (louder as they get closer), `lamp_hum` bed that dies with the last bank,
`phone_buzz` (call + the product notification), `shutter`, `footstep` runs with pans that walk toward you, `latch_click` +
`door_open`. 086: −14.2 LUFS, LRA 4.3, music dropouts none. synth.py's onset self-check crashes on an event before 0.06 s:
start the first event at ≥ 0.1 s.

## Gotchas from 086's stills rounds
- A phone `PointLight` 0.12 m from the hand blew the hands to white: keep it ≤ 0.05 (the screen is unlit MeshBasic anyway).
- A video-call camera for a 9:19.5 screen is very narrow horizontally: at 0.95 m it showed only Theo's eyes. Use ~1.75 m, fov 50.
- A torch beam aimed from a cross aisle *down* the main aisle went through a shelf range (invisible): aim it *across* the aisle.
  Additive cone opacity needs ~0.4 to read in the dark; fade it to ~0.04 when it points into the lens (or the frame hazes) and
  sell the glare with a small additive sprite at the lens (`pow(dot, 10)`).
- A single back-wall plane hid the stairwell behind an open door: build walls around openings.
- A table crossbar sits right in an under-table POV: remove it from YOUR table.
- `makeToon` faces +z: `rotY = PI` turned the guard's back to us on his scariest line.
- A whip-zoom target needs a clear line: the guard stood between the lens and the door; step him aside first.
**Render:** 086 (60.3 s, 30 fps, motion blur 2, up to two extra render targets per frame) took **123 s** for the full render on the M5 Pro
(~2 s per second of video); a 13-still batch ≈ 40 s.

## For Avalon (making this genre without a GPU)
Avalon's code-video pipeline renders only the 2D `mg` kit on Vercel (Canvas 2D) with one narrator. The parts of this genre that
carry it are **not** 3D: the multi-voice script, the speaker-coloured captions, the phone UI (banners, chat, call, camera),
the choice card and the SFX bed. A 2D version needs: (1) the writer to output `cast` + `who` per line; (2) per-speaker voices
(Gemini/ElevenLabs voice per cast member) + the voice fx (a band-pass for phone/PA, a low-pass for "behind a door"); (3) a
`pov` scene in the mg kit: a flat POV room with `drawHandsPOV` holding a phone, a head-turn = a horizontal pan across a wide
illustrated panorama, a duck = a vertical pan; (4) the hud.js layer ported to the mg overlay (captions coloured by `who`, the
stamp, banners, choice card); (5) a phone-UI draw kit (lock screen, call, camera viewfinder, notification). The 3D look
(fisheye + ink + render-target phone screens) needs a GPU worker, or pre-rendered set plates (render the set's head-pan
panoramas once on a GPU and reuse them as 2D backgrounds).
