# Get started: run your own EDStudio

EDStudio makes faceless 3D "What if…?" reels **entirely from code**. Claude writes each video as a Three.js scene, renders it
frame by frame, synthesizes the music and sound, and checks it. Then a **manager Claude** runs it as a daily TikTok operation:
- it hands each video to its own Claude session;
- it scores each video with TRIBE v2 (Meta's model of how a brain responds to video) and fixes the dull stretches;
- it sends you a preview to approve on your phone;
- it schedules the post (e.g. 1 PM + 6 PM, every day, per account).

You approve videos, and Claude does everything else.

## What you need
- **The Claude desktop app** (Code tab) on a paid plan. Each video is a multi-hour Claude session, so expect heavy usage.
- **Google Chrome** with the **Claude in Chrome** extension connected. The manager uses it to upload to TikTok Studio.
- **Your TikTok account(s)**, signed in to Chrome. Claude never types passwords; you sign in once yourself.
- **A computer that can stay on.**
  - Videos render on any Mac, Windows or Linux machine with a GPU.
  - The optional brain score (TRIBE v2) needs Apple Silicon with ≥ 24 GB, or a CUDA GPU.
- Node 18+, Python 3 with numpy and scipy, and ffmpeg. Claude installs and checks these with you.
- Optional: the **Gmail** connector, to approve from your phone by email (see `docs/OPERATION.md` §6). Otherwise just say
  "yes" in the chat.

## Start in 3 steps
1. Clone it. The full history is big because the videos are committed; `--depth 1` skips the old versions:
   `git clone --depth 1 https://github.com/dylann4500/EDStudio.git`
2. Open the `EDStudio` folder in the Claude desktop app → **Code** tab.
3. Paste the prompt below. Claude asks you a few questions (your accounts, your niche, how you approve) and walks you
   through the rest. Your first video takes an afternoon. After that, it runs daily.

**License:** EDStudio is [PolyForm Noncommercial](LICENSE). It's free to use for personal, non-commercial projects.
Monetized channels, selling it or teaching it commercially need written permission from Dylan, so just ask. The rendered
videos and brand assets in the repo aren't yours to reuse.

**Pick your own niches.** TikTok holds back videos it has seen before (a re-upload of a 117K-view video got 205 views), and
we shouldn't compete for the same viewers. So never post a video or a premise that's already in `ops/ideas.md`, and never
post one video on two of your own accounts.

## The prompt to paste into a fresh Claude

```text
Set up EDStudio for me and become the manager of my own daily TikTok operation. This folder is a clone of
github.com/dylann4500/EDStudio. It makes faceless 3D "what if" reels from code (Three.js → headless Chrome → ffmpeg) and runs
them as a daily posting operation with a manager Claude, producer sessions, a TRIBE v2 brain-score gate and approval before
every post. Keep me posted with short updates, and ask me questions in one list, not one at a time.

1. Read LICENSE, README.md, CLAUDE.md, docs/OPERATION.md, docs/lanes/README.md and .claude/commands/operation.md. The
   license is PolyForm Noncommercial: if I plan to monetize, remind me to get written permission from the author first.
   Never reuse the repo's rendered videos or brand assets.
2. Install and check: `npm install` and `npm run doctor`. Fix every ❌ (Node 18+, Python 3 with numpy + scipy, ffmpeg,
   Chrome). Ask before installing system software. Then prove the pipeline: render stills of `_template`, open the sheet
   and look at it, then do one full render of `_template`.
3. Make it mine. Ask me:
   - my TikTok handle(s) and how many posts a day per account (the default is 1 PM + 6 PM in my time zone);
   - one content lane per account. The three in docs/lanes/ are examples from the original operation; my lanes and premises
     must differ from them. Offer to start a lane-scout session that researches a niche for me.
   - the promo line at the end of every caption: keep it, swap in my own link, or drop it. It lives in tools/caption.py,
     tools/new-video.mjs, tools/render.mjs and CLAUDE.md.
   - how I approve posts: "yes" in this chat, or the email loop in docs/OPERATION.md §6 (I reply from my phone).
   Then make the repo mine:
   - Rewrite docs/OPERATION.md §2 and docs/lanes/ for my accounts.
   - Reset ops/ledger.csv to its header row.
   - In ops/ideas.md, keep every existing premise (made AND backlog) as taken and replace the backlogs with mine.
   - The video numbers continue after the last folder in videos/.
   - Point git's origin at a repo of my own, or none. Never push to dylann4500/EDStudio.
4. Brain score: TRIBE v2 runs locally in tribe-experiment/ (setup notes in tribe-experiment/results/report.md and
   CLAUDE.md → Brain-response check). The model is CC BY-NC 4.0, non-commercial; explain what that means for my use.
   - Set it up if my machine can run it (Apple Silicon ≥ 24 GB or a CUDA GPU) and I agree.
   - Otherwise turn the gate off in docs/OPERATION.md and the producer brief.
5. List what only I can do, all at once:
   - install Claude in Chrome and connect it;
   - sign in to my TikTok account(s) in Chrome (Switch account → Add account for more);
   - connect Gmail if I chose email approval;
   - keep the computer awake with the Claude app open.
6. Make ONE video end to end with /new-video in my first lane. Show me the result with its caption and fix what I don't
   like. That calibrates the house style to my taste before anything runs on its own.
7. Then run /operation setup: the daily research task, the producers, previews to me, and scheduled posts after my approval.

Hard rules:
- never type my passwords or solve CAPTCHAs (ask me);
- never post without my approval;
- never post one video to two accounts;
- everything stays procedural: no paid tools, no downloads at render time;
- write every lesson down in CLAUDE.md and docs/ like the harness says, so the next session knows it.
```

## Where things are
- `CLAUDE.md`: the full rule book for Claude (style rules, engine cheat sheet, hard-won lessons).
- `docs/OPERATION.md`: how the manager, producers, research and approval fit together.
- `docs/lanes/`: one brief per account.
- `ops/`: the ledger, the idea backlog and the research digests.
- `videos/NNN-*/`: every video ever made: its story, 3D shots, sound cues, caption and `final.mp4`.
- `/new-video`: make one video. `/operation`: run the whole thing.
