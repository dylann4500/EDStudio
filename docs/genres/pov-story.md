# POV story: breakdown of the reference reel

**Reel:** instagram.com/reels/DfooX7sRz3b (@trz_ftb). Studied Nov 12–13 2026 from a local copy, for analysis only (never repost
it). 122 s, 1080×1920, 30 fps. About 506K likes and 6.8K comments when downloaded (Instagram hid the view count).
**Recipe for making one in ED Studio:** [`docs/POVSTORY.md`](../POVSTORY.md). **Test reel:** `videos/086-pov-library-lockin`.

The reel is a first-person thriller. You are a student ("Noah") sitting a biology final when something goes wrong in the
building. There is no narrator. Five characters talk, you can tell each one apart by voice and caption colour, and a phone in
your hand carries a second thread of the story. It ends on a two-button choice card ("WHAT WOULD YOU DO?") and asks for comments
to unlock Part 2. The topic is a school lockdown. **We copy the format and never the topic** (see Plug patterns → topic rules).

## 1. The hook (0–2 s)
- Frame 1 is already the story: you're at your desk mid-exam, your hands are on the answer sheet, and the classroom spreads out
  in a fisheye lens. Nothing has to load and there's no title card.
- A **place/time stamp** sits top-left for about 4 s: the day and time in white bold, then the room and what's happening there
  in yellow (e.g. "Room 214 — Biology final"). It's the only HUD the reel has.
- The first voice comes in on frame 1, an authority figure (the teacher) saying something routine. A loud bang lands at 5 s.
  The routine-then-wrong shape is the hook: you're settled in a normal moment and it breaks right away.

## 2. Structure and beats (timings from a whisper transcript)
| t (s) | Beat | Who speaks | Picture |
|---|---|---|---|
| 0–3.4 | Normal: an exam, a routine reminder | Teacher | POV at the desk, answer sheet, classmates' backs |
| 5–10 | **Inciting noise** (a bang). A friend shrugs it off | You, Friend | Head whips right to the friend, then back |
| 11–15 | A second bang. The friend stops joking | Friend | The friend's face, eyes huge |
| 16–26 | **The code**: an odd PA announcement, repeated | PA (filtered) | The class looks up at the ceiling speaker |
| 26–34 | Someone decodes it and the teacher takes charge | Friend, Teacher | The teacher snaps into action: everybody down |
| 35–45 | **Rules of the new world**: lights off, phones silent, no sound | Teacher, Friend | The room goes blue-dark; POV drops to the floor by the desks |
| 46–52 | **The stakes get a name**: a friend (Zoe) is missing, out in the hall | You, Friend | Under the desks, looking at Zoe's empty chair |
| 53–63 | **The phone thread**: her texts come in (she's hiding, she's scared); you're told to keep her where she is | (texts), Friend | Phone in your hand, notification banners at top |
| 64–67 | You type the reply live, letter by letter | (typing banner) | The phone close-up |
| 68–80 | Footsteps; someone is checking doors | Friend | The door with light under it; heads turn |
| 82–88 | Sirens and red/blue light through the blinds; the teacher says stay down | You, Teacher | Lighting changes colour, blinds glow |
| 89–100 | **The twist**: Zoe's voice at the door, begging to come in. The class wants to open; the teacher refuses | Zoe (door), You, Teacher | The teacher's face close; the door |
| 101–108 | **The contradiction**: a new text from Zoe's phone says she's still hiding and asks who's knocking | (text), Friend | The phone, a red "DON'T OPEN" in the banner |
| 108–117 | You reason it out aloud (if she's there, who's at the door?); the voice begs once more | Friend, You, Zoe | Faces, the door |
| 116–118 | Cut to black | — | — |
| 118–122 | **Choice card**: WHAT WOULD YOU DO? A green "OPEN THE DOOR" pill, OR, a red "KEEP IT LOCKED" pill, then "Comment for Part 2 ↓" | — | Dimmed, blurred last frame behind |

Shape: **normal → wrong → rules → stakes (a named person) → a second channel (the phone) → the threat closes in → two
sources of truth contradict each other → a binary dilemma → cut before the answer.** Every ~10 s something escalates (a new
sound, a new rule, a new message, a light change), and the last 20 s pile two contradictions on top of each other.

## 3. POV framing and camera
- **The camera is your head.** It sits at seated eye height with a strong **fisheye** (straight lines bow outward, the
  ceiling and the desk both show). Your **arms come up from the bottom of the frame**: grey hoodie sleeves and simple flat
  hands. The left hand holds the phone, with round fingertip blobs around its edge and the thumb on the other side.
- **One continuous take.** The scene detector found only ~7 real changes in 122 s. Everything else is head moves: quick
  whip-turns toward whoever speaks, a duck to the floor, looking down at the phone, back up at the door. A whip-turn is a
  hard re-frame, ~0.2 s, with no transition effect.
- Breathing drift and small handheld wobble the whole time; it gets bigger when you're scared.
- **Phone close-ups** fill the frame: the screen is readable and the hand holds it in-shot.
- **Lighting tells the story:** bright classroom → a dark blue room with a lit door gap → red/blue sirens through the
  blinds. The darkness stays readable (blue-tinted, never black).

## 4. The voice cast
| Voice | Who | How you tell them apart |
|---|---|---|
| Teacher | Adult woman, firm | Yellow captions; mid-pitch, clipped commands |
| Friend | Teen boy, the explainer | Cyan captions; fast, scared, voices the viewer's thoughts |
| You ("Noah") | The POV | White captions; few lines, mostly questions and reactions |
| PA | Building intercom | Orange captions; band-limited speaker sound, calm and robotic |
| Zoe | Behind the door / in texts | Pink captions; muffled through the door; her texts arrive as banners |
- **Five voices, no narrator.** Each one gets its own **caption colour** (you can follow the reel muted) and its own **sound
  space**: the PA is band-passed, Zoe is muffled behind a door, everyone else is dry and close.
- **Who speaks when:** the authority (teacher) opens and closes each phase, the friend reacts and explains, you ask the
  questions the viewer is asking, and the PA and the door voice are the outside world pushing in. Dialogue is short: 1–6 words
  per line, mostly one line at a time with a 0.4–1.5 s gap. Silence is part of the rhythm.
- **Texts are a sixth voice with no audio:** notification banners (avatar, name, time, message), typed replies shown letter
  by letter, and one red warning word.

## 5. Visual style and how it's rendered
- **3D, toon-shaded:** flat colours with one soft shading step, **black ink outlines** on every object, big googly eyes on the
  speaking characters, faceless background classmates. Low-poly props: lockers, a bookshelf, a chalkboard, lockdown posters.
- **A fisheye lens** (a post distortion over a wide render), probably Blender or Unity with a toon shader and an outline pass.
- **The closest ED Studio style is `toon` (the build look, `engine/build/toon.js`).** It has the same big-headed cast and the
  same face states. What's new for this genre: the **fisheye pass**, **ink outlines**, **POV arms + a held phone**, a
  **speaker-coloured caption layer**, **notification banners** and the **choice card** (all now in `engine/povstory/`).
  `sim` (realistic) and `flat2d` would also work. The look matters less than the voices + POV + phone.

## 6. Captions, music, sound, pacing
- **Captions:** 1–4 word phrases, centred at ~67 % of frame height, a bold rounded font (Fredoka-like) with a heavy dark stroke,
  **coloured by speaker**. They cut on and off with no pop or animation.
- **No melodic music.** The spectrogram shows a low drone/rumble bed from ~38 s, sub-heavy bangs at 5 s and 11 s, a phone buzz
  (54 s), a siren sweep (82–100 s), knocks and footsteps. It's sound-design-led, and the drone never drops out.
- **Pacing:** ~1 word/s overall (slow, with lots of tense silence) against a constant feed of picture events. Lines are short
  and get shorter as the panic rises.

## 7. Why it holds attention
1. **You're in it.** Second person by camera: your hands, your phone, your choice. The ending asks *you* what you'd do.
2. **Information drip.** Every 8–10 s there's a new clue (a sound, the code, a missing friend, a text, footsteps, sirens, a voice).
   You watch to resolve it.
3. **Two sources of truth that disagree** (the voice at the door vs. the texts from her phone). That's the hook of the last 20 s
   and what the comments argue about.
4. **A named person at risk.** Zoe gets a name early, so the stakes are personal, not abstract.
5. **The cliffhanger choice + "Comment for Part 2"** turns the ending into a comment prompt: 6.8K comments on this one, and the
   series is built in.
6. **Readable with the sound off** (colour-coded captions, banners), and **better with sound on** (the door voice, the PA filter).

## 8. Plugging a product without breaking the story
The rule from Scribe, Ally the Tutor and Write It: **the product is a prop that does something in the plot, never a break in it.**
Three patterns, all used in the 086 test:
1. **A character recommends it, in character.** A friend on the phone tells you to just snap the worksheet and Scribe will
   write it in your handwriting. It's said the way people actually talk, at a moment when the character has the problem.
   (Write It's 8M-view reel did this: its product typed on a laptop in the last 5 s, inside the reel's own premise.)
2. **The product's action is a plot device.** Taking the scan photo is what *reveals the twist*: the camera flash lights a
   figure at the end of the aisle, and you only see it zoomed into the scan. The scan has to happen for the story to move, so
   the product shows on screen for ~3 s without anyone selling it.
3. **The product's notification is a story beat.** While you hide, the phone buzzes with Scribe's "Worksheet done ✓, 20/20,
   in your handwriting", and the buzz gives your position away. The banner shows the benefit word for word, and the scene
   gets tenser instead of stopping for an ad.
- Also available: the product on a background screen (a classmate's laptop), a wallpaper/sticker, or the cliffhanger's
  stakes resting on it (the deadline is real *because* the worksheet is due at 8 AM).
- **Topic rules for plugged versions:** no real-violence premises (shootings, assaults, kidnapping): the platform and the
  brand risk aren't worth it. Use the same *shape* with safe dread: locked in after hours, a power cut during finals, a
  substitute nobody knows, a mystery text, a swapped phone. Never mock a real tragedy, and keep the threat ambiguous and
  non-violent.
