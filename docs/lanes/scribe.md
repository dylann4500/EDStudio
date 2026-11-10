# Lane: Scribe promos (the user's product, tryscribe.ink)

Started Nov 8 2026. The user: "take viral video ideas, incorporate Scribe into them, and pump out as many reels and TikToks as
possible to drive as much eyes on our product as possible." A manager session ("Scribe promo video animation styles") assigns
concept × style pairs to producer sessions and collects new animation styles into `docs/STYLES.md`. This is NOT the old
content farm: **never plug the course** (user, Nov 8), every reel sells Scribe.

Read with: `docs/PROMO.md` (049's kit and lessons), `docs/reference/officialwriteit.md` (the account we emulate),
`docs/STYLES.md` (which look to use and how), and the genre doc of your style (`docs/BUILD.md` for the toon/build look).

## What Scribe is (claims you may make — check anything else against the Scribe README / tryscribe.ink)
Repo: `~/Documents/GitHub/math hw grift` (README.md, `web/`, `sites/`). A student writes one practice sheet once → Scribe learns
their handwriting. Then: a photo or PDF of the homework (+ a plain instruction) → every problem solved with worked steps →
**written out on paper in the student's own handwriting, drawn stroke by stroke** like a pen → a PDF. Maths (pre-algebra →
analysis), physics, chemistry, biology, economics, with the diagrams those need (free-body diagrams, Lewis structures, supply
and demand…). Free plan to start ("10 free assignments" on the site), paid plan monthly/yearly. If a claim isn't in the README or
on tryscribe.ink, don't make it.

Brand: red pen-nib "S" logo (`videos/049-scribe-promo/scribe-icon.png`), Georgia wordmark "Scribe", accent #9a1c25, cream paper.
Real handwriting: `videos/049-scribe-promo/hand.json` (the repo's demo glyphs) via `engine/build/scribe.js` (`loadHand`,
`layoutHand`, `makeSheet` = a worksheet written glyph by glyph, `makeScreen` = the app on a laptop). End card pattern: logo +
"Your homework, in your handwriting." + tryscribe.ink + the free offer (`engine/build/brhud.js`).

## The formula (decoded from @officialwriteit: 2M / 1.4M / 751K views)
1. **Frame 1: the trend premise, spoken.** "Upgrading my ___ every day until ___", "everyone in my town has a number above their
   head", "stay in bed 30 days for $10K", a battle royale (049)… A viral FORMAT, not a niche joke.
2. **Escalation:** a new upgrade / day / gag every 3–4 s, a counter or label on screen, comedy in every beat.
3. **The obstacle, 50–65 % in: handwriting.** "HANDWRITTEN ONLY", "show your work", 40 problems due at midnight, a teacher who
   checks handwriting. (Write It's obstacle is an AI detector; ours is the pen.) Lean into the cheating angle — the user loved
   "he one-shots his homework because he's cooked".
4. **Scribe clears it, shown for real:** a photo of the sheet → the app → problems solving → his OWN handwriting appearing stroke
   by stroke. Scribe must be on screen by ~31 s (049) and never later than ~60 % of the runtime.
5. **Payoff:** the biggest upgrade / the win, a last gag, then the end card (≥ 3.5 s, no course line).

## House rules for this lane
- **45–65 s**, 1080×1920. 60 fps + motion blur in the build/toon look; 30 fps is fine for other styles.
- **Narrated** (ElevenLabs, Adam v3, docs/PROMO.md pace ≈ 3.9 words/s). The hook is spoken on frame 1; no silent title card.
  Captions: one word at a time in the center (`engine/build/captions.js`) unless your style has a better native caption.
- **ElevenLabs budget (a new FREE-tier key since Nov 8: 10K chars, resets Dec 9, shared by every producer; the user cleared the plan's use with ElevenLabs, Nov 8 — don't raise its terms):** draft and
  time everything with the scratch voice (`python3 -I tools/narrate.py NNN-slug --scratch` = macOS `say`, free), lock the script, then voice it ONCE with Eleven (≤ 1,300 chars). Tempo changes are free; beats are cached, so re-voice only the
  beat you changed. If the quota runs out, finish on the scratch voice, say so in your report, and the manager re-voices later.
- **The f-word explainer is a series (user, Nov 9, on 058: "we need more fucking ones like that, even if it's like unrelated scenes
  that go to Scribe, it's just funny"):** a deadpan explainer of ANY topic with "fucking" between every word, then a hard pivot to
  Scribe at ~60–70 %. Fork `npm run new -- NNN-slug --from 058-fword-explainer`; keep the homework in a subject Scribe covers.
- **Not just math (user, Nov 9: "this shit is all math homework still… are we gonna do bio homework, chemistry homework?"):**
  rotate the subject every reel and fit it to the story — chemistry (a balanced equation with →, a hand-drawn Lewis structure, an
  ICE table), biology (a Punnett square, a labelled cell), physics (a free-body diagram with ΣF), economics (a supply-and-demand
  shift, a payoff matrix), and math at most one reel in four. Show the subject's FIGURE being drawn by the pen — that's the money
  shot. All true per the Scribe README (§Physics, §Chemistry, §Biology, §Economics). Ready-made sheets: `engine/build/subjects.js`
  (`subjectSheet(G, 'chemistry')` etc.; docs/PROMO.md → Subject packs; all packs on one frame: `videos/_subjects-demo/packs.jpg`).
- **Vary format, place AND the Scribe feature between reels (user, Nov 9: "make sure there's some variance between them"):** not
  POV after POV. Rotate formats (POV, "rating your ___ 1–10", GRWM/storytime, tier list, doubling, day-N counter, explainer) and
  show a different real feature each time: one practice sheet → your handwriting, the messiness slider, pencil vs ballpoint ink,
  filling a worksheet's blanks/tables, photo/PDF upload, Download PDF, drawn figures (README §Worksheets, §Teaching it your handwriting).
- **Real-world memes and trends (user, Nov 9: "Roblox and Minecraft… real world memes or trends… somehow plugging in Scribe at
  the end"):** this week's viral moments, redone in a blocky-game look, with a hard pivot to Scribe. Lines we hold: nothing built on
  child-abuse or sexual-misconduct stories (e.g. predator stings), no invented claims about real people (a public figure's moment
  only as it actually happened), no Minecraft/Roblox logos or names on screen (generic blocky look).
- **Fish voices (user's picks, Nov 9):** Dolly `ce3b16c14af54adebba5ebe50a3d4417` (breathy British), Mommy
  `5233336f5f44460ea0902b0802375451` (soft, breathy), Authentic Conversational Storyteller `da1eeaa6379e491da2ea7d203d2d4b05`, plus
  Slax for the f-word series. **Who gets which voice (user, Nov 9): narration = a MALE voice (Fish "Slax", or ElevenLabs Adam
  if a paid key returns), never a female one; Vex = a female voice (Dolly or Mommy). The Storyteller voice is out.** **Vex: a notch less breathy** (user, Nov 9: "a tiny
  bit less breathing and moaning… we don't want to scare off our viewers"): endPad ≈ 0.2 s, mid-line breaths capped (maxPause
  ≈ 0.25 s + pauseFloor, or a gate ~8–10 dB on breaths), Fish temperature ≈ 0.55–0.6.
  **Experiment (user, Nov 9):** fewer "mommy" lines — "the fact there's a hot anime girl talking about this stuff is already
  good enough". Try lighter-persona Vex reels (confident, funny, teasing; no mommy/baby, no sighs) against 064–067. Vex uses Dolly or Mommy ONLY — the Storyteller voice's own
  description says "a young girl", so it never voices a flirty reel.
- **Focus from Nov 9 (user: "I'm going to be focusing on Roblox and Minecraft videos and memes and current events, and the goth
  mommy videos, because those are going to be high converting"):** most new reels = (a) Roblox-/Minecraft-style takes on this
  week's memes and current events with a Scribe pivot, and (b) Vex, the goth tutor, as a recurring character.
- **The user posts by hand (Nov 9: "from now on I'm going to post them manually… scheduled uploads from the Claude are like
  driving down views"):** no uploader session, no scheduling. Deliver: preview + paste-ready caption, and copy the reel into
  **`exports/TO-UPLOAD/`** (gitignored): `NNN-name.mp4` (upload.mp4, with music) + `NNN-name.txt` (caption) + the no-music copy
  in its subfolder — one folder with everything finished and not yet posted (user, Nov 9). Re-renders replace the old file.
- **Posting = the user's call (Nov 9: "Hold for my review"):** a finished reel goes to the user first (phone preview + caption);
  the manager queues it with the TikTok uploads session only after they OK it, quoting that OK.
- **Swear in every narrated non-Vex reel (user, Nov 9: "we got to use like fucking. You can change how much you use it, but using
  it drives more than without"):** every narrated reel that isn't Vex gets "fucking" in the narration. Vary the dose per reel, from
  every-other-word (the f-word series) to a few well-placed ones. On screen it reads F*CKING in its own colour; captions censor it
  (f*cking). Vex keeps her own persona. ElevenLabs Adam is unavailable (free tier blocked): the narrator stand-in is Fish "Slax".
- **Props must be held properly (user, Nov 9, on 066's GRWM: "floating or going through her… make sure the stuff is rendered
  properly"):** every handheld prop is parented to the hand bone with a real grip; things that touch the face TOUCH it (a lipstick
  on the lip, a liner at the eye corner, a straw at the lips) and never pass inside; cups and phones never intersect the body.
  Check with stills every 0.25 s through each prop beat + a side debug view before the full render.
- **Vex can headline ANY format (user, Nov 9: "explainer vids are really good… we can do that too with goth mommy, because it's
  just funny when she's the character. Builder vids or simulation… anything really"):** explainers (how a data center works),
  build reels with Vex as the builder/narrator, what-if sims, trends. The builder-format ban is for generic builder reels; with
  Vex as the character it's allowed. Vex keeps her female voice (Dolly/Mommy), the new look and the prop rules.
- **Show the handwriting being generated IN THE APP, on screen (user, Nov 9: "some of the animations are a pencil doing it on
  paper, but can't we show it just being generated on the computer like the app would actually do?"):** Scribe writes the page
  on screen, stroke by stroke (README: "draws them on screen as if a pen were doing it"), then exports a PDF. So the money shot
  is the phone/laptop screen close-up: `makeScreen(...)` in write mode with `sheet.draw(p)` filling the page inside the app, an
  on-screen pen cursor at `sheet.draw.tip`, the figure appearing on the page. NEVER a real pencil writing on physical paper by
  itself (that's not what the product does). Paper may appear only as the printed/turned-in result after Download PDF.
- **No builder-format reels (user, Nov 8):** "I don't want to make another generic builder vid… make like a funny vid and then copy
  that exactly, a funny vid that went viral." The toon/build LOOK is fine; the "How a ___ Becomes a ___" engineering format is not.
- **Voice = Fish Audio since Nov 9** (ElevenLabs blocked the free-tier keys for "unusual activity"). `FISH_API_KEY` sits next to
  the old key in `~/.config/edstudio/.env`. Voice a reel with `python3 -I tools/narrate.py NNN-slug --fish --fish-voice <id>` (or
  script.json `"voice": {"provider": "fish"}` + `"fish": {"reference_id": …, "speed": 1.0, "tempo": …}`). Word timings come
  from Fish's /v1/tts/stream/with-timestamp, so the one-word captions still work. Never use a library voice that clones a real
  person (the Fish library is full of them: Elon, Markiplier, rappers): generic narrators only. Find more with `--fish-voices`.
  **The narrator is "Slax"** (`c5f56a6cc2ec4fa8920cb4c5889a3fb7`, user's pick Nov 9: "use slax its the funnies") — it's the
  default (`FISH_VOICE_ID` in the .env), so `--fish` alone uses it. Vex (054/064) keeps her own female voice.
- **What actually posts (uploads session, Nov 9):** TikTok's web uploader has no trending sounds, so it posts `upload.mp4` WITH our
  music when one exists — make the music decent and always ship both `upload.mp4` and `upload-nomusic.mp4`.
- **Music (user, Nov 8): "most of the background music's kind of ass."** Keep our bed minimal under the voice (SFX carry the
  reel), and run `sh tools/nomusic-copy.sh videos/NNN-slug` → `out/nomusic.mp4` + `out/upload-nomusic.mp4` (every stem except
  music.wav, on final.mp4's picture). **The no-music cut is what we post** (user, Nov 8: "yes, trending sounds"): add a
  trending TikTok / Instagram sound in the app at upload, low under the voice. When a bed is used: **upbeat, fast, percussive** (user steer on 049: 140 bpm four-on-the-floor + claps + hats + a marimba arp, music ≈ −21 LUFS
  under a −16 voice). Continuous, never harsh (CLAUDE.md sound rules still hold).
- **No TRIBE gate** for promos (volume wins; @officialwriteit posts 5–9 a day). The QC checklist, still sheets and the full-res
  final still apply.
- **Caption: NO link, NO plug** (user rule, Nov 8: "TikTok is gonna destroy our videos if they have links or very clear
  advertisement in the captions. In the videos, it can't tell… never plug it"). No tryscribe.ink, no "10 free assignments", no
  course line, no "link in bio". Write the hook (the video's opening question) + one emoji, then 5 hashtags — the shape of the
  posted ones: `POV you get 2x gay every second 💅 #fyp #homework #gay #school #funnyreels`. Scribe shows up in the VIDEO
  (end card, on-screen product), never in the caption. `python3 -I tools/caption.py videos/NNN-slug` must pass. Paste the
  caption in full in your report.
- **A LIVE post's caption can be edited in TikTok Studio (pencil icon; it re-enters a short review); a scheduled post can't (Nov 9).**
- **Posting by hand in TikTok Studio (web, Nov 8):** pick each hashtag from the suggestion list (type `#tag`, wait ~3 s, Enter)
  so it links — a plain typed tag stays plain text, and Enter before the list loads inserts a line break. Scheduled posts
  can't be edited (only deleted + re-uploaded); a LIVE post's caption can (Posts → pencil → Save; it re-enters review, and
  the list may show an emoji as `\ud83d…` until you reload — the saved text is fine, Nov 9 on 064). The web uploader has no
  trending sounds (only a stock library), so post the `_with-music` file unless the user adds a sound in the phone app. The Chrome extension's file upload caps at 10 MB per call: split a bigger
  video into ≤ 9 MB parts, push each into a temporary page file input, rebuild a `File` in the page and set it on TikTok's input.
- Copy the reference's FORMAT and beats freely; all art, lines and characters are ours. No real brands' logos besides Scribe
  (fictional detectors/teachers/apps are fine), nothing that impersonates a real person.

- **Off-limits topic: AI data centers / AI infrastructure** (user, Nov 9: a friend already made that video and copying it would
  be "shameless"; our 072 is shelved). The Vex EXPLAINER format (072: sourced numbers, Vex in the place, pixel diagram cards,
  Scribe by ~60 %) stays: use it for OTHER topics that are current this week for 18–24-year-olds (075–077).

- **The Vex EXPLAINER is the user's favourite format** (Nov 9, on 076 energy drinks: "informative and it's like turning me on…
  the educational informative ones where the goth mommy's just explaining it to me is really good"). Model: `videos/076-vex-energy-drinks`
  (a topic college students live, sourced numbers, an hour-by-hour HUD, Vex in the place, the "Mommy" voice, Scribe ~55 %).

- **Scribe features the Vex reels have already shown** (pick a different one next time, README in `~/Documents/GitHub/math hw grift`):
  snap → solve → write (064, 070), practice sheet + Messiness slider (065), PDF upload + fill + pencil ink + Download PDF (066),
  Shuffle (072), pen/ink picker (075), typed problem in the composer (076), follow-up prompts (077), dark mode (078 AND 080 —
  used twice, retire it for a while), scanned-pages chip of 12 pages (074).

- **Voices + pace (user, Nov 10 — supersedes the Nov 9 voice lines above where they differ):**
  - **Narrated non-Vex reels:** the user's new favourite is the Chinese-accent English narrator **"chinese"**
    `654f19c7820c4c26a0ac74c0fbfeb70e` (Fish, "funny"); rotate it with Slax `c5f56a6cc2ec4fa8920cb4c5889a3fb7`. Fast-paced:
    `"fish": {"speed": 1.1, "temperature": 0.6}` + `maxPause 0.2`. The jokes stay about the TOPIC, never about the accent or
    ethnicity (no stereotype lines, no fake "broken English" in the script). "Chinese accent" `fe2e4e24a3a544dc95e8e5eb7dba7c82`
    sounds like Uncle Roger (a real comedian's character): NOT used in Scribe ads unless the user confirms (a sound-alike of a
    famous person in an ad reads as an endorsement).
  - **Vex = Dolly** `ce3b16c14af54adebba5ebe50a3d4417` until the user sends their own cute-girl voices. **Not breathy/sexy by
    default, just a normal cute girl narrating at a regular pace** ("right now it's too slow"): `"fish": {"speed": 1.2,
    "temperature": 0.58, "tempo": 1.0}`, `"maxPause": 0.15`, `"gap": 0.1`, `"breath": {"db": -12, "keep": 0.15, "margin": 0.05}`,
    `"endPad": 0.15`, `"headPad": 0.1` → ≈ 3.4 words/s (076/077 ran 2.6–2.8). The "Mommy" voice is retired for now.

## Producer brief template (manager fills it)
> Make Scribe promo **NNN — "TITLE"** in the **STYLE** style. Number + premise reserved; slug `NNN-slug`.
> Read: CLAUDE.md, docs/lanes/scribe.md, docs/PROMO.md, docs/STYLES.md, docs/reference/officialwriteit.md, + your style's doc.
> Setup: own worktree, `ln -s /Users/dylan/Documents/GitHub/EDStudio/node_modules node_modules` (never commit it), `npm run doctor`;
> renders + git writes need the sandbox disabled.
> Angle: … Deliverables: final.mp4, caption.md, script.json/story.json/shots.js/cues.json, `sh tools/upload-copy.sh` +
> `sh tools/preview-copy.sh` copies; commit on your branch. Don't merge, push, post, email, or use the user's Chrome.
> Report (≤ 25 lines): branch, paths, duration, ElevenLabs chars used, caption in full, one line per beat, what to check.

## Made / assigned
See `ops/ideas.md` → "Scribe promos" (numbers are shared with the rest of EDStudio: check it before taking one).
