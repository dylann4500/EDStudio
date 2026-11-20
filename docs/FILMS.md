# Photoreal films: the method

How to make a short film that reads as photographed (miniatures, toys, products, objects, rooms) entirely from
code: Python builds every scene in **Blender 5.2 (Cycles)**, a render farm on **Modal** (or your own computer)
renders 4K frames, and Python grades, cuts and mixes them. Any story, any subject: nothing here is tied to a
character or a set. Start a film with `/new-film` (`.claude/commands/new-film.md`) or by hand:

```bash
python3 films/_template/tools/new_film.py my-film      # films/my-film: the engine + a 3-shot example that renders
```

The template's example (a wooden top spinning on a table at golden hour) is there to be deleted. The first film
made this way was a 64-second launch film of wooden toy knights (Nov 2026, not in this repo); its lessons are
written into this document.

Separate from the reels: none of EDStudio's reel rules (HUD, captions, opening question card, end card length)
apply to films. Films are 16:9 4K by default (vertical works too: set `W, H` in `timeline.py`).

## Contents

1. [What makes it read as a photograph](#1-what-makes-it-read-as-a-photograph)
2. [The pipeline](#2-the-pipeline)
3. [A film's folder](#3-a-films-folder)
4. [Story, shots and the clock](#4-story-shots-and-the-clock)
5. [Music first, then picture](#5-music-first-then-picture)
6. [Building a set](#6-building-a-set)
7. [Pace: movement inside the shot](#7-pace-movement-inside-the-shot)
8. [Physical truth: the sweep](#8-physical-truth-the-sweep)
9. [Rendering: drafts, finals, cost](#9-rendering-drafts-finals-cost)
10. [Sound](#10-sound)
11. [Screens](#11-screens)
12. [The finish and delivery](#12-the-finish-and-delivery)
13. [Working with a team of agents](#13-working-with-a-team-of-agents)
14. [Hard-won rules](#14-hard-won-rules)

## 1. What makes it read as a photograph

In order of importance. Every one of these was the difference between "a render" and "a photograph" in review.

1. **Real sizes.** Everything in metres at its true size: a toy figure 45 mm, a phone 147 mm, a desk 75 cm high.
   Light falloff, depth of field and motion blur then behave like a real lens on a real object.
2. **A real camera, placed like a photographer would.** 36 mm sensor (`C.new_cam`). For miniatures the lens sits
   1–8 cm above the surface the subject stands on, lenses 24–85 mm. **Focus on the subject's face or most important
   surface, tracked every frame** (`C.cam_set(..., focus=point)`). At 15 cm and f/2.8 the depth of field is about
   1 mm: focusing on the middle of a figure leaves its face soft. Closer than about 25 cm, stop down to f/4–f/11.
   A subject out of focus is a failed shot.
3. **Scanned surfaces, bevelled edges.** Every surface is a photo scan (Poly Haven, CC0: `C.scan`, box-projected, no
   UVs). Every edge is bevelled (0.3–0.7 mm on small things, 2–4 mm on furniture). A plain coloured box is not a
   wall; a plain plane is not a floor.
4. **One motivated light per scene,** plus the sky: a window, a lamp, a low sun, a screen, a torch. The subject sits
   in front of something darker or cooler than it, with a key or a rim. Night is "movie night": moody, but every
   face readable.
5. **Dress every frame.** An empty still is a fake one: add 4–6 real things at the right scale (a pencil, a coin, a
   cable, crumbs, a book) and furniture behind. Keep them off the action's path (the sweep checks it).
6. **Colour discipline.** A small palette per film. Under AgX (the view transform, `C.setup_render`) a bright
   saturated red turns pink: lower the light on it, never change the paint.
7. **Motion that obeys physics.** Weight, anticipation, squash on landing, overlap (a hat lags the head). Nothing
   slides, floats or passes through anything (section 8). The 180° shutter gives true motion blur for free.
8. **The camera always travels** (section 7): one clear, motivated move per shot; a small bump on every impact.
9. **A film finish** in post (section 12): halation round highlights, a gentle S-curve, vignette, moving grain.

## 2. The pipeline

```
story ─► shot list (timeline.py) ─► music + beats ─► sets (blender/set_*.py) ─► stills sheets ─► fix ─► sweep
      ─► quarter-size draft of the whole film ─► fix ─► 4K on Modal ─► sound mix ─► edit + finish ─► checks ─► deliver
```

| Step | Command (from the film's folder) | Time |
|---|---|---|
| Scans | `python3 tools/fetch_assets.py` (`--find wood table` searches Poly Haven) | minutes, once |
| Sound library | `python3 sound/fetch_lib.py` | a minute, once |
| Build a set | `python3 tools/film.py build <set> [--shots S01,S02]` | seconds |
| Look at it | `python3 tools/film.py sheet <set> --per 3 --tag v1` · `stills <set> S01@1.2 …` · `cuts <set>` | ~1 s a still |
| Physics check | `python3 tools/film.py sweep <set>` | seconds |
| Pace check | `python3 tools/motion.py <tag>` | seconds |
| Whole-film draft | `python3 tools/finish.py draft --pct 25` (Modal) or `--local` | 10–30 min |
| Final | `python3 tools/finish.py final` (or `--local`, slowly) | ~1.5–2 h for 60 s |

`tools/finish.py` does everything after the sets are right, unattended and safe to run again: build and upload
every set, render on Modal, download, mix, cut, and check (missing frames, motion per shot, loudness, a contact
sheet). `--from render|pull|cut` resumes a run that stopped.

**Requirements:** Blender 5.2 (`/Applications/Blender.app` or `$BLENDER`), Python 3 with numpy and scipy, ffmpeg.
For the farm: the Modal CLI, logged in (`modal setup`). For screens: Node and EDStudio's `puppeteer-core`.

## 3. A film's folder

```
films/<name>/
  timeline.py          the shot list and the clock: every other file reads it (story clock, edit, music, cues)
  blender/core.py      render settings, materials (scan, paint, metal, glass), meshes, lights, camera, the Baker
  blender/anim.py      timing and motion maths (keyframes K, eases, Path, HopWalk, pulse, wobble, noise)
  blender/set_<x>.py   one per set: build(), animate(sid, t, i), events(), main()
  tools/film.py        build / stills / sheet / cuts / sweep / render / push / pull
  tools/finish.py      the unattended rest; tools/motion.py, beats.py, sweep.py, fetch_assets.py, new_film.py
  farm.py              the Modal render farm (FILM = its app and volume; a spending guard)
  post/mix.py          the sound mix; post/compose.py the edit and the finish
  sound/               cues.json (the sound department's sheet), fetch_lib.py (starter CC0 library), credits.json
  assets.json          the Poly Haven scans this film uses (downloaded into films/_assets, shared by every film)
  BRIEF.md             (write it) the contract for everyone building the film: story, look, layout, what "done" means
  build/ stills/ frames/ out/   not in git: built .blend files, test stills, rendered frames, the film
```

## 4. Story, shots and the clock

- **One clock.** `timeline.SHOTS` lists every shot: id, set, seconds, light state, and one line saying what happens
  (the line a builder animates to). 2–3 s a shot is a good default for a lively film. `CUES` holds moments more
  than one department needs (a door slams at 1.20 s: the animation, the screen and the sound all read it).
- **Frame blocks are fixed per shot** (`BLOCK_ORDER`): each shot owns 1000 Blender frames, so adding, cutting or
  reordering shots never renumbers frames already rendered. Append new shots at the end of `BLOCK_ORDER`.
- **Two clocks: story and cut.** Shots are animated and rendered whole (story clock). `timeline.EDIT` (trim and
  speed per shot) is the cut, so the film can be tightened and laid on the music without rendering again. Only
  the edit and the mix read the film clock (`cut`, `cut_start`, `film_time`).
- Show the product or the point early and plainly. A viewer who scrolls in halfway should still understand it.

## 5. Music first, then picture

What made the first film feel alive was not the cutting rate: it was the picture landing on the music.

1. **Pick the track first.** Whimsical and fast, sombre and slow: it sets the rhythm of everything. **Check the
   licence before falling in love with it:** many famous pieces are still in copyright (Leroy Anderson's "Plink,
   Plank, Plunk!", 1951, was asked for and could not be used; a social platform can mute or remove a film that uses
   it). Public-domain compositions in public-domain recordings are safe: Musopen's orchestral recordings on
   Wikimedia Commons (Mozart, Mendelssohn, Grieg, Tchaikovsky, Rossini overtures and scherzos).
2. **Find its beats:** `python3 tools/beats.py sound/music/track.flac` (tempo, beats, bars, loudness per bar;
   `--count T0 T1 N` pins a stretch to a known number of beats). Real orchestras breathe: the beat is not a grid.
   Two trackers disagreed in two stretches of the first film; counting bars in the score settled it.
3. **Map the music's shape onto the story** (`ACCENTS`): the soft opening, the first full entry, the quiet passage,
   the big chords. Put the story's big moments on them.
4. **Cut on beats** (`CUT_AT`: where each shot starts on the film clock, each on a beat; `EDIT` is derived).
5. **Animate to the beats:** `python3 timeline.py --music [set]` prints each shot's beats and accents in the
   shot's own seconds. Hops, hits, landings and key presses land on beat times, within a frame (the picture may
   lead the sound by a frame, never lag). The biggest moves land on the accents.
6. **End the music musically:** the mix can splice the recording's own final cadence onto the film's end at a bar
   line (`sound/cues.json` → `music.track.splices`), instead of a fade in the middle of a phrase.

## 6. Building a set

Copy `blender/set_table.py`'s shape:

```python
def build():               # make everything once (room, props, cast, camera, lights). No animation here.
def animate(sid, t, i):    # place EVERYTHING for one frame of shot `sid` (t = seconds from the shot's start)
def events():              # the sound events: [{"shot", "t", "kind", "gain", "dur"?}]
def main():                # Baker: add what moves; C.bake(B, shots, animate); C.save(sc, SET, events())
```

- `animate` runs for every frame of every shot plus one spare frame each end (t = −1/24 and t = duration): keep
  motion continuous there, so motion blur never smears across a cut.
- Things that are not in every shot: `B.add(obj, park=True)` — each frame they start **parked 500 m under the
  floor**, and `animate` places the ones in the shot. Never switch things with `hide_render` (it rebuilds the scene
  each frame: one film rendered 5× slower). Moving parts: `B.add(obj)`. Animated values: `B.prop(datablock, path)`.
- **Deterministic only:** no `random`, no `time`. Use `anim.rnd(i, seed)` and `anim.vnoise`.
- Meshes from `core` (bmesh), never `bpy.ops.mesh.*`. Keep `build()` to seconds and the .blend under ~400 MB.
- **Rigs:** give each moving thing a hierarchy that keys cleanly. A fast spin is its own child rotating about one
  axis (never decompose a spinning, tilting body into one Euler: it flips). Keep a camera's direction continuous.
- **Resting poses come from the geometry, not from a guess.** The template's top lies where its centre of mass is
  lowest, lifted so its lowest point just touches (`lift()`): a guessed angle sank it 0.4 mm into the table.
- Characters: build them from lathes, boxes and spheres (`core`), give them a `pose(...)` method and a `face()`
  point for focus. Peg figures with no legs move in hops: crouch, spring, stretch, land with a squash.
- **The look loop:** `build`, then `sheet --per 3`, then **look at every still** (read the image), fix, repeat. Then
  6 moments per shot for motion, then `cuts` for the joins. Typical first-pass faults: subject soft or too small,
  camera inside an object, murky light, a saturated colour gone pink, an empty background, a prop floating or sunk.

## 7. Pace: movement inside the shot

The first version of the first film cut every 2.4 s (faster than its 3.2 s reference) and still felt slow. It was
the movement **inside** shots. `python3 tools/motion.py <tag>` scores it: the mean difference between neighbouring
frames at 320 × 180. **Calibrate the target on the film you are measuring yourself against:**
`python3 tools/motion.py --film reference.mp4` scores it cut by cut; hold every shot near its median except a
deliberate calm. The score depends on content as well as speed (soft, low-contrast, shallow-focus pictures score
lower for the same camera move): the first film's lively reference had a median shot of 6.6 (stretches of 10–18),
so its target was 6+; the template's calm golden-hour example sits at 3–4. Version 2 of the first film went from
13 of 25 shots under its target to one, by:

- **A camera that always travels:** a track, a push, a crane, an arc. A bump on every impact. Never locked off.
- **Start in motion, end in motion:** the action is under way on frame 0 and the shot is cut before it settles.
  Put the main beat in the first half: the edit can trim a tail, it cannot invent a head.
- **More going on:** every figure in frame doing something specific, actions overlapping, background business.
- **Faster, with physics:** short anticipation, hard landings, follow-through.
- **One small gag per shot** where it fits.

## 8. Physical truth: the sweep

Viewers notice things passing through each other and things floating, even when the reviewer did not. In the
first film the owner spotted a clock floating 5 cm over a desk and figures passing through a playing card; a
test of every frame then found more in every set (wings dipping into a sill, a figure inside a horse's neck, a
box floating off the floor, figures sinking whenever they leaned). **Test it; do not trust the eye:**

```bash
python3 tools/film.py sweep <set> [--shots S03] [--pile rug:7.5] [--skip beam,glow]
```

It checks every frame the film shows: surfaces that cross (PEN, with depth and the part), things sunk into what
they stand on (SNK), things at rest that do not touch (HOV), and how near the lens comes to anything (`--cam`),
each with whether it is in the picture. Run it after every animation change. Not every hit is a fault (a hand on
a pole); look at the frame. Traps: a light beam or haze modelled as a mesh is "solid" to the test (`--skip`), and a
rug's pile stands above its mesh (`--pile`).

## 9. Rendering: drafts, finals, cost

- **Settings** (`C.setup_render`): Cycles, 4K, adaptive sampling (threshold 0.02), OpenImageDenoise, 128–176
  samples, motion blur with a 180° shutter, AgX "Medium High Contrast", JPEG 96. Set the device after the scene is
  loaded (`read_factory_settings` resets it, and it silently renders on the CPU).
- **Local:** one Blender renders on a computer at a time (`tools/film.py` takes a lock). Measured on an M5 Pro:
  **1 min 47 s per 4K frame** at 176 samples, so a 60-second film is **about 50 hours** nonstop.
  `python3 tools/film.py render <tag> [--pct 25 --samples 32]` renders the film locally (a draft is ~16× faster).
- **Modal** (`farm.py`): each container opens one set once and renders a chunk of its frames; frames already on
  the volume are skipped, so a run that died is simply started again. Only the frames the edit shows are rendered.
  Measured: L40S ~27 s a frame (44 s for the busiest set); **1,539 4K frames in 94 minutes, about $34** with 7–10
  GPUs. A quarter-size draft (`--pct 25 --samples 48`) costs about 1/16. A spending guard reads the bill before
  starting (`FILM_LIMIT_METERED`). Never push a set while it is rendering: containers reload a newer .blend.
- **Draft first, always:** a quarter-size draft of the whole film, cut to the music, is what the owner reacts to.

## 10. Sound

- **Events, not timelines:** each set writes `build/<set>/events.json` (what its animation does); `post/mix.py`
  turns each kind into a recording through its `KINDS` table, places it on the film clock, and drops what the edit
  cut out. Ambience per shot or light state, a music track, one fixed level per layer, no compressor.
- **The library:** `sound/fetch_lib.py` builds a starter set (steps on wood, rug, stone, grass, snow; wood, metal,
  glass and plate hits; cloth, paper, creaks, doors, clicks; room tone, whooshes, a spin). Add your own families
  the same way. **CC0 or public domain only, every file credited in `sound/credits.json`.** Kenney packs (CC0) and
  Wikimedia Commons (check each file's licence) are the sources that worked.
- **Accents:** the few big moments (a key press in a quiet bar, a thud on the orchestra's entry) should stand
  clearly over the music: measure them. A crowd of footfalls on the same frame as a big hit buries it: delay the
  crowd 50 ms (`accent_guard`).
- **Loudness:** about −16 LUFS for phones and laptops, true peak under −1 dBTP. Wooden knocks are all peak: the mix
  may bend their tips with a fixed curve (`peak_round_db`), never a limiter. AAC rebuilds knocks about 1.7 dB above
  the WAV's peak: the edit takes 1 dB off.
- Pitched effects are tuned to the key the music is in at that moment (the mix measures it).

## 11. Screens

A lit screen in a film (a laptop page, a phone feed) is a web page photographed once per frame: a headless browser
draws the page for each frame and saves `build/<set>/screens/<screen>/<blender frame>.jpg`; `C.screen_mat(name,
dir, strength)` plays the sequence on the screen mesh. Keep the page a pure function of (shot, frame) so it is
deterministic. **Emission 1.0–1.8 under AgX** (2–3 washes the colours out). For a phone that plays a clip of the
film's own shot, render that shot first, crop the frames into the clip, then capture the screen. Draw no real
platform's logo or name.

## 12. The finish and delivery

`post/compose.py` takes the rendered frames in edit order and gives them the small faults of a real camera:
halation (a warm glow round the brightest areas), a gentle S-curve, darker corners, fine grain that changes every
frame; fades, an optional closing line and end card (`out/cards/closing.png`, `endcard.png`). Deliver:

- `out/<tag>.mp4`: the 4K master (capped at 60 Mbps: grain is expensive to encode)
- `out/<tag>_1080.mp4`: for posting
- `out/<tag>_phone.mp4`: a small preview. **Chat apps and phones often cap files at ~30 MB:** a 4K master never
  reaches a phone; send a 1080p under 30 MB plus a few seconds of true 4K to show the detail.

Then check: no missing or black frames, the only frozen stretch is the end card, loudness of the **encoded** film,
and a one-frame-a-second sheet of the whole film. Watch it and listen to it before calling it done.

## 13. Working with a team of agents

The first film was made by a lead session and seven builder agents. What worked:

- **The lead** owns `timeline.py`, the music, the brief, the farm, the edit and the review. It writes
  `films/<name>/BRIEF.md`: the story, the look rules (section 1, with the film's palette and sizes), the layout of
  the world, how a set file works, what "done" means, and what each builder must report.
- **One builder per set,** one for screens, one for sound. Each owns its files only; shared files (`core.py`,
  `timeline.py`) change only through the lead or as additive helpers.
- **Review:** builders render their own sheets and dense strips and must look at them; the lead looks at every
  sheet, scores pace (`motion.py`) and physics (`sweep`), and sends specific fix lists. Briefs quote the owner's
  words and give the measurement behind every request.
- **Rules for builders:** one local render at a time (the lock); never touch Modal or git; never move another
  department's cue; key everything to beats once the music is set; front-load shots.
- **Budget the model allowance:** long builder passes can exhaust a model's weekly limit mid-task (two builders
  stopped that way). Back up the sources before a long pass (copy `blender/`, `timeline.py`), and keep the last
  mile unattended (`tools/finish.py`) so any model, or a person, can finish.

## 14. Hard-won rules

- Things not in a shot are parked 500 m under the floor, never hidden.
- Frame blocks fixed per shot; one spare frame baked each end of every shot.
- Choose the GPU after loading the scene (`read_factory_settings` resets the device).
- AgX turns bright saturated red pink: lower the light, keep the paint.
- Focus on the face, not the figure; stop down closer than 25 cm.
- Screen emission 1.0–1.8.
- Never push a set to the farm while it renders.
- Cap the 4K master's bitrate; check the encoded film's true peak, not only the mix's.
- A scan may come only in colour variants (no "Diffuse" map): `fetch_assets.py` takes the first variant.
- Shared scans live in `films/_assets` (a film that already has a scan in its own `assets/` lends it by hard link).
- A fast spin keys cleanly only as a child spinning about one axis; under ~180° a frame, with motion blur.
- Resting and contact poses are computed from the outline, not guessed; then the sweep confirms them.
- A light beam or haze mesh is not a solid; a rug's pile sits above its mesh.
- Music: licence first. Beats: measured, cross-checked against the score's bars.
- Back up before long agent passes; make the end of the pipeline one command.
