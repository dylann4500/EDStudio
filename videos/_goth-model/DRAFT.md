# Draft — Scribe × goth cheat-tutor (pixel-art reel)

Reference: @allythetutor's reel "does ai cause global warming?" (68 s): an MMD-style anime tutor in a bikini explains one question
in a Minecraft-like voxel world. Pixel-font title card, yellow pixel-font fact cards, one-word pixel captions, mosaic
transitions between places (beach, microwave, data-center corridor, a cutaway power-grid diorama), ending on a sunset pose.
Theirs is a "good girl" tutor that teaches. Ours is the opposite: **a goth, rebellious "mommy" cheat-tutor** who tells you how
not to get caught, and the answer is always Scribe.

## The character (v3, Nov 8: matches the user's benchmark image)
- Working name **Vex**. A 2-D anime illustration, not a 3-D model: the user's bar is a polished anime picture (auburn messy
  layered hair, black rectangular shades pushed up, heavy winged liner + purple shadow, plum lips, studded choker with a cross,
  layered silver chains, black lace/fishnet O-ring halter bikini with a bat charm, chain belt, side-tie bottoms, studded cuffs,
  black nails). v1 (engine/goth.js) and v2 (Blender body + engine/anime.js) were code-built 3-D and never got close.
- Pipeline: `tools/anime/gen.py` (Animagine XL 4.0 on the Mac's GPU) → poses + face frames (blink / talk / wink by inpainting
  only the face) → `tools/anime/cut.py` cut-out → `engine/puppet.js` (breath, hair sway, head tilt, face swaps) standing in voxel
  sets under the pixel pass (`engine/sets/voxbeach.js` = the benchmark's beach house). Dev scene: `videos/_puppet-dev`.
- Each new pose = one generation + 3 face inpaints (~5–15 min on a busy Mac). Plan ~6–8 poses per reel.

## Format (copied from the ref)
- Pixel pass (5 px blocks) + mosaic swell at every cut; a voxel world (pixel textures via `engine/pixeltex.js`).
- One pixel-font title card with the question, yellow pixel-font fact cards, one-word pixel captions.
- Her voice narrates (ElevenLabs, a low, dry, slightly bored female read). ~55–60 s. Chill game-lofi music (our own synth).
- Copy aimed at college ("your professor"): it matches Scribe's site (MIT / Princeton / Harvard) and keeps the persona for adults.

## Concept A (recommended): "CAN YOUR PROFESSOR TELL YOU USED AI?"
| # | Place (voxel) | VO (draft) | On screen |
|---|---|---|---|
| 1 | Black-sand goth beach, purple sunset; Vex on a beach chair, shades up | "Can your professor tell you used AI? …Babe. Yes." | title card; eye-roll |
| 2 | Giant voxel printer spitting a typed essay | "Tell one: it's typed. Half your classes want it handwritten, and your handwriting looks like a seismograph." | HANDWRITTEN ONLY |
| 3 | Lecture hall; a detector meter on the projector goes red | "Tell two: you pasted a chatbot answer, and the detector lights up like a Christmas tree." | AI DETECTOR |
| 4 | Gradebook wall: F, F, D, A+ | "Tell three: you went from a D to a hundred overnight. Suspicious." | (fact card, sourced) |
| 5 | She lowers the shades, mosaic cut to her dorm desk at night | "So here's what mommy does." | wink |
| 6 | Dorm desk: laptop with Scribe, phone snaps the worksheet, the floating pen writes | "Snap the worksheet. Scribe solves every problem, then writes it in YOUR handwriting. On paper. Your messy sevens. Even the graphs." | YOUR HANDWRITING |
| 7 | Professor's office: two pages side by side | "Your professor holds it next to last week's. Perfect match." | NOTHING TO DETECT |
| 8 | Back on the beach at sunset; shades down, peace sign | "Do your own homework? Couldn't be me." | end card: Scribe · tryscribe.ink · 10 free assignments |

## Concept B: "HOW MUCH OF YOUR LIFE IS HOMEWORK?"
She does the math on a voxel calendar (hours per week × weeks × years = a sourced total in days), stacks the days as blocks
into a tower, then knocks it over: "Scribe gives you that back." Same Scribe beat + ending.

## Concept C: "IS IT CHEATING IF IT'S IN YOUR HANDWRITING?"
A mock debate: she argues both sides with two hand puppets (angel and devil Vex), the devil wins every round, Scribe demo, ending.

## Before the full port
- Pick the concept, her name, and a voice (I'll sample 2–3 ElevenLabs female voices on one line first).
- Every number on a fact card gets web-searched and sourced (the ref leans on real stats).
- ElevenLabs is on the free tier (~6,400 characters left this month after 049); commercial ads need a paid plan.
- Build: a voxel black-sand beach, a voxel lecture hall + dorm desk, the professor's office re-textured; reuse `engine/build/scribe.js`
  (Scribe's real handwriting glyphs + the app screen) from the 049 branch.
