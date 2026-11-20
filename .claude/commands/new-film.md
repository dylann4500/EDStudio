---
description: Make a photoreal short film from code (Blender 5.2 Cycles + Modal) on ANY concept — story → shot list → music → sets → stills → sweep → draft → 4K → mix → deliver
argument-hint: "the concept, e.g. 'a paper boat crosses a kitchen sink at dawn' or 'a 45 s launch film for <product>'"
---
Make one complete photoreal film for: **$ARGUMENTS**

This is the **films** pipeline, not the reels: none of CLAUDE.md's reel rules (HUD, captions, opening question card, end
card length, 1080×1920) apply. Read **`docs/FILMS.md`** first, all of it: it is the method and the look, written for any
subject. Bring nothing from an earlier film unless the user asks for it: no characters, sets, palette or story are
fixed. The template's spinning top is an example to delete, not a style to follow.

1. **Understand the film before building anything.** Who it is for, where it will be posted (16:9 by default; vertical
   if asked), how long, what the viewer should feel and do at the end, what must be true about any product shown (check
   claims against the product's own site or repo; no partner or third-party names unless asked). If the user gave
   creative freedom, decide and say what you decided. Show early, not late: a short story outline, then a draft.
   **Ask where it will render and the budget** (docs/FILMS.md §9): **Modal** (`farm.py`, quickest to set up), **their
   own GPU machines on any cloud over SSH** (AWS, Azure, Google Cloud, RunPod, Lambda, a spare PC: `tools/farm_ssh.py`;
   help them rent and list the machines in `farm_hosts.json`, then `check` and `setup`), or **this computer** (slow:
   ~50 h for a minute of 4K on a fast Mac). Every render command below takes `--farm modal|ssh|local`. Set the budget
   guard (`FILM_LIMIT_METERED` for Modal, `budget` in farm_hosts.json for SSH) and remind them that rented machines
   cost money while they are on: set `"after"` to stop them.
2. **Start the folder:** `python3 films/_template/tools/new_film.py <slug>` (lowercase, dashes) → `films/<slug>/`, then
   from there `python3 tools/fetch_assets.py` and `python3 sound/fetch_lib.py`, and build + sheet the example once to
   prove the machine works (`python3 tools/film.py build table && python3 tools/film.py sheet table --tag check`).
   Work on a branch or worktree if other sessions share the checkout (CLAUDE.md → Parallel sessions).
3. **Story and shot list** (`timeline.py`): one line per shot saying what happens, 2–3 s a shot, a light state per shot,
   `SETS`, shared `CUES`, `BLOCK_ORDER` (append-only). Put the point of the film early and plainly. Delete the example
   shots and `blender/set_table.py` once your first set exists.
4. **Music first** (docs/FILMS.md §5): licence before taste (public domain or CC0, or licensed by the user: famous
   pieces are often still in copyright), `tools/beats.py` for its beats, map the music's shape to the story
   (`ACCENTS`), cut on beats (`CUT_AT`), and give every builder `python3 timeline.py --music`. Send the user a preview of
   the stretch of music you chose before building on it.
5. **The brief:** write `films/<slug>/BRIEF.md` — story, look rules from docs/FILMS.md §1 made specific (real sizes of
   every character and prop, palette, lenses, light states), the world's layout (where z = 0 is, where the light comes
   from, where the viewer is), how a set file works, sound events, what "done" means and what to report.
6. **Build the sets** — yourself for a small film, or one builder agent per set (+ screens, + sound) for a larger one
   (docs/FILMS.md §13). Each set: `build` → `sheet --per 3` → **look at every still** → fix → repeat; then 6 moments per
   shot for motion, `cuts` for the joins, `tools/film.py sweep <set>` for anything passing through, sinking or floating.
   Hold every shot to the look list and to pace (§7): a travelling camera, action under way on frame 0, something
   moving everywhere, a beat that lands on the music.
7. **Draft:** `python3 tools/finish.py draft --pct 25 --farm <modal|ssh|local>`, check `python3 tools/motion.py draft`
   against the reference's median shot (`tools/motion.py --film reference.mp4`; docs/FILMS.md §7) and the sweeps, then send
   the user the draft (a phone-sized copy) and ask for notes before the 4K render.
8. **Final:** `python3 tools/finish.py final --farm <modal|ssh|local>` → `out/final.mp4` (4K), `_1080.mp4`, `_phone.mp4`. Check its log: no missing
   frames, motion per shot, loudness of the encoded film (~−16 LUFS, true peak < 0), the contact sheet
   (`stills/final/whole_2fps.jpg`), and look at full-size crops of the moments that matter. Keep the render spending inside
   the user's budget, and after an SSH render make sure the rented machines were stopped (`"after"`, or tell the user).
9. **Deliver:** send the user the film (files over ~30 MB do not reach a phone: send a 1080p under 30 MB and a few
   seconds of true 4K), say what was checked and what was not (nobody has listened? say so), and the cost.
10. **Write down what you learned** in docs/FILMS.md (§14 hard-won rules, or the section it belongs to) — short, concrete,
    with the why — so the next film starts further on.
