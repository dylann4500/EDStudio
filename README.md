# EDStudio

Procedural 3D story Reels — toy-like characters, warm night light, a counter on screen, a time skip, a gut-punch ending.
Each video is code (Three.js) rendered frame-by-frame in headless Chrome and encoded with ffmpeg. Music + sound effects are
synthesized in Python (royalty-free). Built to be driven by Claude Code: `/new-video 2` makes the next video end to end.

**Video 001:** `videos/001-bedroom-door/final.mp4` — *"What your mom did every night after you fell asleep — told by your bedroom door."*

## Quick start (any Mac / Windows / Linux with a GPU)
Needs: **Node 18+**, **Google Chrome**, **Python 3 + numpy + scipy** (`python3 -m pip install numpy scipy`).
```bash
git clone https://github.com/dylann4500/EDStudio.git
cd EDStudio
npm install
npm run doctor
node tools/render.mjs _template --stills 2,6,9 && node tools/sheet.mjs _template
```
Then open `videos/_template/stills/_sheet.jpg`. If it looks like a bedroom with a parent walking in, you're set.

## Make a video with Claude Code (fastest)
Open this folder in Claude Code and type:
```
/new-video 2
```
(or `/new-video what your grandpa did every morning before you woke up`). It reads `CLAUDE.md` (the full instructions),
picks the concept from `schedule/`, writes the story + 3D shots, reviews still frames, makes the audio, renders, QCs and commits.

## Make a video by hand
```bash
npm run new -- 002-my-video                          # scaffold from the template
# edit videos/002-my-video/story.json + shots.js
node tools/render.mjs 002-my-video --stills 1,5,9   # still frames -> videos/002-my-video/stills/
node tools/sheet.mjs 002-my-video                    # one contact-sheet image of all stills
python3 -I audio/synth.py 002-my-video               # music + SFX from cues.json -> audio.wav
node tools/render.mjs 002-my-video                   # -> videos/002-my-video/final.mp4
```
Useful flags: `--preview` (fast draft), `--from 20 --to 28` (time range), `--cam top` (bird's-eye debug view).

## Layout
```
engine/      core (renderer, timeline helpers, text overlay), rig (characters), props, sets/ (locations), sky
videos/      one folder per video: story.json (text/HUD/timing) + shots.js (3D) + cues.json (audio) + final.mp4
audio/       synth.py — procedural piano + SFX library; sfx/ = reusable sound pack
tools/       render, sheet, new-video, doctor
docs/        FORMAT.md (style bible + what performs), reference analysis
schedule/    30-day content plan
CLAUDE.md    step-by-step instructions + hard-won rules for AI agents
```
