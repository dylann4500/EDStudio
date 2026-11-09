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
- **ElevenLabs budget (a new FREE-tier key since Nov 8: 10K chars, resets Dec 9, shared by every producer; free = non-commercial):** draft and
  time everything with the scratch voice (`python3 -I tools/narrate.py NNN-slug --scratch` = macOS `say`, free), lock the script, then voice it ONCE with Eleven (≤ 1,300 chars). Tempo changes are free; beats are cached, so re-voice only the
  beat you changed. If the quota runs out, finish on the scratch voice, say so in your report, and the manager re-voices later.
- **Music: upbeat, fast, percussive** (user steer on 049: 140 bpm four-on-the-floor + claps + hats + a marimba arp, music ≈ −21 LUFS
  under a −16 voice). Continuous, never harsh (CLAUDE.md sound rules still hold).
- **No TRIBE gate** for promos (volume wins; @officialwriteit posts 5–9 a day). The QC checklist, still sheets and the full-res
  final still apply.
- **Caption:** hook + emoji, 2–3 sentences, a 👇 question, "Send this to your ___", a blank line, the Scribe line (e.g.
  `✍️ Scribe: your homework, in your handwriting. 10 free assignments 👉 tryscribe.ink`), a blank line, 5 hashtags.
  **No course line.** `python3 -I tools/caption.py videos/NNN-slug` must pass. Paste the caption in full in your report.
- Copy the reference's FORMAT and beats freely; all art, lines and characters are ours. No real brands' logos besides Scribe
  (fictional detectors/teachers/apps are fine), nothing that impersonates a real person.

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
