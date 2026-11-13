# POV story: the genre recipe (multi-voice first-person thriller)

You ARE the main character. The camera is your head, your hands hold a phone, and five people talk around you, each in their
own voice and caption colour. A safe-but-tense situation escalates for ~55 s. Two sources of truth end up contradicting each
other, and the reel stops on a **"WHAT WOULD YOU DO?" choice card** that asks for comments to unlock Part 2. The product lives
**inside** the story (a character's advice, a phone action that moves the plot, a notification that becomes a beat).
**Why/what:** [`docs/genres/pov-story.md`](genres/pov-story.md) (breakdown of the reference reel). **Test reel:**
`videos/086-pov-library-lockin` (copy its script.json, shots.js and make_cues.py). **Command:** `/new-povstory`.
Status (Nov 13 2026): a **test** genre, voiced with free macOS voices. Not posted.

## House-rule differences (like build reels, this genre is exempt from some defaults)
- **No opening question card.** Frame 1 is the scene: the first line is spoken at ~0.3 s and a **place/time stamp** (day + time
  in white, place in yellow, top-left) shows for ~4 s. It is the only HUD.
- **Captions = dialogue:** 1–4 word phrases at ~67 % height, **coloured by speaker** (tools/narrate.py `phrases`). No lower-third
  subtitles, no centred one-word build captions.
- **End card = the choice card** (two answer pills + "Comment for Part 2 ↓"), fully visible ≥ 3.5 s (`tail` in script.json).
  The Scribe end card is optional; the 086 test keeps the plug in-story only.
- Still applies: no links/plugs in the caption, music that never drops out (a drone counts), every frame moving, no flashing or
  pulsing text, faces and the phone screen clear of the caption band when they need to read.

## Story template (55–65 s, ~120 words of dialogue)
| Beat | ~t | What happens | Rule |
|---|---|---|---|
| Normal | 0–4 | You're somewhere ordinary at a specific time; an authority voice says something routine | The stamp + the first line on frame 1 |
| Wrong | 4–10 | A sound or event breaks it (lights die, a bang, a call) | A big physical/sound change |
| Rules | 10–20 | Someone takes charge or explains the new situation | Short commands, 1–4 words each |
| Stakes | 15–25 | A **named** person or thing is at risk (a friend, the deadline) | A name, not "someone" |
| Second channel | 18–30 | The phone: a call, texts, a camera (**plug slot 1 + 2**) | The screen readable for ≥ 1.5 s |
| Closing in | 30–45 | The threat gets nearer: footsteps, a light, a voice | You change position (stand, duck, hide) |
| Product beat | 38–45 | The product's notification/action lands **as a plot event** (**plug slot 3**) | It makes things worse or better, never neutral |
| Contradiction | 42–52 | Two sources of truth disagree (a voice vs. a text, two people both claiming to help) | Say the contradiction out loud once |
| Dilemma | 50–55 | Both sides call you at once; whip between them | Whips ≤ 0.2 s, a zoom on each |
| Choice card | 55–60 | WHAT WOULD YOU DO? A / OR / B, "Comment for Part 2" | Two options people will argue about |
**Topics:** the *shape* of dread with a safe cause: locked in after closing, a power cut during finals, a sub nobody knows, a
swapped phone, a group chat that knows too much. **Never** shootings, assaults, kidnapping or a real tragedy. Keep any threat
ambiguous and non-violent. The comment fight should be about *who to trust*, not about real harm.

## Voices: multi-voice narration (`tools/narrate.py`, additive)
script.json gets a `cast` and every beat gets a `who`:
```json
"mode": "pov", "fps": 30, "motionBlur": 2, "lead": 0.35, "gap": 0.18, "tail": 5.4, "phraseMax": 4,
"voice": {"provider": "scratch"},
"cast": {
  "you":   {"name": "Sam",   "color": "#ffffff", "scratch": {"voice": "Samantha", "rate": 198}},
  "theo":  {"name": "Theo",  "color": "#5fe3ff", "scratch": {"voice": "Daniel", "rate": 212}, "fx": "phone"},
  "pa":    {"name": "PA",    "color": "#ffa63d", "scratch": {"voice": "Karen", "rate": 184}, "fx": "pa", "gain_db": -1.5},
  "guard": {"name": "Guard", "color": "#ffd84a", "scratch": {"voice": "Grandpa (English (US))", "rate": 174}, "fx": "far"},
  "jules": {"name": "Jules", "color": "#ff8fcf", "scratch": {"voice": "Moira", "rate": 212}, "fx": "far", "gain_db": 1.5}
},
"beats": [{"id": "pa1", "who": "pa", "say": "Attention. The library is now closed.", "gap": 0.25}, …]
```
- `python3 -I tools/narrate.py NNN-slug --scratch` voices every line with its speaker (cached per speaker + text), runs the
  speaker's **fx** (`phone` = a call on speaker, `radio`, `pa` = ceiling-speaker slapbacks + a hall, `far` = across a big room,
  `room` = a few metres off, `muffled` = through a door; a beat can override with its own `fx`/`gain_db`), lets reverb tails
  ring under the next line (they don't push it later), and writes story.json with `cast` + **`phrases`** (the coloured captions)
  + `beats[id].who`.
- **Free scratch voices that stay intelligible** (checked with faster-whisper): Samantha (US f), Daniel (UK m), Karen (AU f),
  Moira (IE f), Tessa (ZA f), Rishi (IN m), Grandpa (English (US)) (old m). Distinct accents = distinct people with the sound
  off and on. Run `say -v '?'` for the rest. A `far`/`pa` fx on a long line muddies words: keep those lines short and check
  them with check_voice/whisper (086: "Library's closed!" read "Why are you close"; rewritten).
- **Paid voices** (ask first: anything that costs money needs the user's OK). Per speaker, add a `fish` block (`reference_id`,
  `model: "s2.1-pro"`, `speed`) and set `"voice": {"provider": "fish"}` (or `voice_id` + provider `eleven`). Only changed lines
  re-voice. 086's 21 lines are 643 characters, so one full voicing ≈ **$0.01 on Fish** (s2.1-pro $15 / 1M UTF-8 bytes) or
  **≈ $0.06 on ElevenLabs** Multilingual v2 (~$0.10 / 1K characters list; Flash ~$0.05). Even with 3× re-rolls a reel stays
  under $0.30. ElevenLabs v3 tags (`[whispers]`, `[shouting]`) fit the hiding lines best.
- Caption colours that read on dark blue: white (you), cyan `#5fe3ff`, yellow `#ffd84a` (authority), orange `#ffa63d`
  (PA/system), pink `#ff8fcf`. Keep one colour per person for the whole reel.

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
SFX-led like the reference. A **drone pad that never stops** (`notes: [26, 38, 45, 50]`, hp 30), **braams** (add the tritone)
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
