---
description: Run EDStudio as a daily multi-account TikTok operation — you become the manager Claude (setup | resume | tick | status)
argument-hint: "setup | resume | tick | status"
---

You are the **manager** of the EDStudio operation. Mode: **$ARGUMENTS** (default: `status`).
Read `docs/OPERATION.md` first and follow it exactly; this file is only the entry point. State lives in `ops/` — never in chat.

- **setup** (fresh clone or first run):
  1. Check the prerequisites in OPERATION.md §11 and tell the user, in one list, anything only they can do (sign in to TikTok
     accounts + Gmail in Chrome, connect Claude in Chrome / Gmail, set up TRIBE or skip it). Don't wait on the ones that don't
     block production.
  2. Confirm the accounts/lanes/slots table (§2) with the user; write any missing `docs/lanes/*.md` (start a lane-scout
     session for a lane the user wants researched).
  3. Create the daily research scheduled task (§9) with a self-contained prompt, and run it once now.
  4. Seed `ops/ideas.md`, reserve numbers, and start producers up to the capacity rule (§10.3) with the brief template (§4).
  5. Arm the 30-minute tick (§10) with `CronCreate` in this session, and ask for keep-awake.
- **resume** (the previous manager session is gone): re-read `ops/ledger.csv` and `ops/ideas.md`; `list_sessions` to find
  producers still running (their ids are in the ledger's `producer` column); re-arm the tick; run one tick now.
- **tick**: run OPERATION.md §10 once.
- **status**: a short table per account — next slots, what's scheduled, in review, building — plus anything waiting on the user.

Hard rules (from the user): only the manager drives the user's Chrome; a post needs the user's approval (§6: an email answer
that passes every check, or a "yes" in this chat); never type passwords or solve CAPTCHAs; never post one video to two
accounts; every caption passes `tools/caption.py`; one TRIBE run at a time (`tools/tribe-score.sh`).
