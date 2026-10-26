# EDStudio

**A 3D animation studio run by Claude.** Every video is code:
- a Three.js scene rendered frame by frame in headless Chrome;
- music and sound effects synthesized in Python;
- encoded with ffmpeg.

No stock footage, no AI video, no paid tools. Claude Code writes the story, builds the 3D shots, reviews still frames, mixes
the audio, renders and checks the result. In operation mode it runs whole TikTok channels: daily research, several videos
in production at once, a brain-response score, your approval from your phone, and scheduled posts.

**New here? Read [GET-STARTED.md](GET-STARTED.md):** what you need, and one prompt to paste into Claude Code that sets up
your own channel.

## What it makes

| Format | Examples (`videos/`) |
|---|---|
| Funny "what if everyone on Earth…" sims | *What if every human became twice as smart?* (187K views), *…woke up pregnant?* (141K), *…search history floated above their head?* (34K) |
| Science what-ifs | *What if every nuclear weapon vanished?* (hologram globe, sourced facts); *gravity off for 5 seconds* in production |
| Series with a recurring character | Pip the corgi puppy: every disaster ends well (`docs/lanes/lane3.md`) |
| Emotional stories | *What your mom did every night after you fell asleep* |
| Biographies | *The story of Abraham Lincoln*, *The story of Elon Musk* |

View counts are from TikTok on Oct 26, 2026. Each format has its own look, pacing and sound identity (`docs/TONES.md`), and the
engine grows with every video: 20 sets so far (`engine/sets/`), a posable character rig, a prop library and a globe.

## Make a video with Claude Code
Open this folder in Claude Code and type:
```
/new-video what if everyone on Earth could hear each other's thoughts
```
It reads `CLAUDE.md` (the rule book), writes the story and the 3D shots, reviews still frames, makes the audio, renders,
runs the QC checklist, writes the caption and commits. Optionally it scores the video with TRIBE v2, Meta's predicted
brain-response model, and fixes the stretches that sag.

## Run a channel: the operation
```
/operation setup
```
Claude becomes the **manager** of a daily posting operation (`docs/OPERATION.md`):
- one content lane per account (`docs/lanes/`);
- a research task every morning;
- a producer session per video, several building in parallel;
- a brain-score gate;
- a phone preview for your approval;
- posts scheduled in TikTok Studio at fixed times.

State lives in `ops/`, so any new session can pick it up with `/operation resume`.

## Quick start (any Mac / Windows / Linux with a GPU)
Needs: **Node 18+**, **Google Chrome**, **Python 3 + numpy + scipy** (`python3 -m pip install numpy scipy`).
```bash
git clone --depth 1 https://github.com/dylann4500/EDStudio.git
cd EDStudio
npm install
npm run doctor
node tools/render.mjs _template --stills 2,6,9 && node tools/sheet.mjs _template
```
Then open `videos/_template/stills/_sheet.jpg`. If it shows a lit bedroom with a parent walking in, you're set.

## Make a video by hand
```bash
npm run new -- 020-my-video                          # scaffold from the template
# edit videos/020-my-video/story.json + shots.js
node tools/render.mjs 020-my-video --stills 1,5,9   # still frames -> videos/020-my-video/stills/
node tools/sheet.mjs 020-my-video                    # one contact sheet of all stills
python3 -I audio/synth.py 020-my-video               # music + SFX from cues.json -> audio.wav
node tools/render.mjs 020-my-video                   # -> videos/020-my-video/final.mp4
```
Useful flags: `--preview` (fast draft), `--from 20 --to 28` (time range), `--cam top` (bird's-eye debug view).

## Layout
```
engine/            core (renderer, timeline helpers, text overlay), rig (characters), props, sets/ (20 locations), globe, sky
videos/            one folder per video: story.json (text/HUD/timing) + shots.js (3D) + cues.json (audio) + caption.md + final.mp4
audio/             synth.py: procedural music (piano, mallet, pluck, strings, drums) + a sound-effects library
tools/             render, stills sheet, new video, doctor, TRIBE lock, upload/preview copies, caption check
docs/              FORMAT.md + TONES.md (style), lanes/ (one brief per channel), OPERATION.md, reference/ (competitor notes)
ops/               the operation's state: ledger, idea backlog, research digests
tribe-experiment/  local TRIBE v2 brain-response scoring, plus the study against real views
brand/             channel handles, bios and avatars
schedule/          the original 30-day plan (emotional series)
CLAUDE.md          the rule book for AI agents: style rules, engine cheat sheet, hard-won lessons
```

TRIBE v2 (`facebook/tribev2`) is licensed CC BY-NC 4.0 (non-commercial). It runs locally, and its model and code are not in
this repo; see `tribe-experiment/results/report.md` to set it up.
