# Reference: @realityrendered__ (analyzed 2026-10-21)

Faceless "What if…?" science-simulation Reels, fully procedural 3D (game-engine / Three.js look, not generative-AI
video: geometry is consistent and every HUD number is computed). Same production class as EDStudio.

**Profile:** 71K followers · 34 following · 56 posts · bio = 3 lines: "What if X, Y, or Z happened?" / "Exploring different
simulations of events!" / suggestion CTA + 👇. Avatar = "?" over an Earth horizon (reused as the on-video watermark).
**Cadence:** 12 posts in 5 days (Oct 17–21: 2, 2, 3, 3, 2), i.e. **2–3 per day**. At that pace the account is roughly 3–4 weeks old,
so it reached 71K very fast.
**Data limits:** logged out, only the latest 12 posts load. No view counts (likes and comments only), and audio can't be heard.

## Post stats (newest first)

Two templates are alternated, close to an A/B test: **A = "Data-HUD" (bold sans)** and **B = "Cinematic POV" (serif)**.

| Date | Hook (= caption) | Tpl | Len | Likes | Comments | Cmt/1K likes |
|---|---|---|---|---|---|---|
| Oct 21 | moon made of cheese | A | 65 s | 1,369 | 10 | 7 |
| Oct 21 | the sun was black | B | 69 s | 7,674 | 83 | 11 |
| Oct 20 | Yellowstone erupted today | B | 83 s | 4,744 | 32 | 7 |
| Oct 20 | **an 84-foot rogue wave hit your ship** | B | 82 s | **15.6K** | 91 | 6 |
| Oct 20 | **you jumped into a hole through Earth** | A | 68 s | **15.2K** | 85 | 6 |
| Oct 19 | the Sun turned green | B | 85 s | 1,635 | 15 | 9 |
| Oct 19 | you fell into Jupiter's Great Red Spot | A | 66 s | 466 | 10 | 21 |
| Oct 19 | Earth had a ring of fire | B | 82 s | 906 | 6 | 7 |
| Oct 18 | you stood on a comet | B | 84 s | 755 | 3 | 4 |
| Oct 18 | **you stacked every human on Earth** | A | 65 s | **30.8K** | **381** | **12** |
| Oct 17 | Earth had 3 moons | B | 84 s | 1,455 | 11 | 8 |
| Oct 17 | the dinosaurs survived | B | 83 s | 9,314 | 47 | 5 |

Every post uses "Original audio" (their own track, never a trending sound).
Excluding the two posts from today, the averages are **A ≈ 15.5K likes (3 posts) vs B ≈ 4.9K (7 posts)**.

**Why the winners win**
1. **The viewer is in it and the scale is grounded on Earth:** stack *you* + everyone, *you* fall through Earth, a wave hits *your* ship.
   Jupiter and the comet are also "you", but they're remote and have no anchor, so they flopped (466 and 755). "You" alone is not enough.
2. **It escalates through real landmarks:** Statue of Liberty → Eiffel Tower → Everest → edge of space → Moon; or Kola Superdeep → mantle → core.
   Each step is a new "wow" every ~5 s.
3. **A twist near the end:** "we'd all fit inside Puerto Rico"; the tunnel comes out in the Indian Ocean; the radar line "Not a ship. Not land."
4. **Comment bait comes from the concept itself.** Viewers place themselves in it ("I'm position 38479", "I'm the guy at the bottom"),
   nitpick the physics ("terminal velocity"), and notice the loop ("Nice loop"). The stack post has the highest comment rate (1.2%).
5. **"Recolor the sky" concepts lose** (green sun, ring of fire, 3 moons, comet), even though they look pretty: 0.7–1.6K.

## Rules to copy

Frame is 1080×1920. y = % of frame height from the top; x = % of width. Measured from pixels on the original frames.

### Universal
- **The hook is in frame 0.** The title is fully visible on the very first frame (no fade-in or black intro), so the grid thumbnail is the title card.
  It holds until **~3 s** and fades out by **4 s**.
- **Title formula:** "What if you [verb] [extreme but physical thing]?" Add a concrete number when there is one ("84-foot"). Keep it to 6–10 words.
  The caption is the title, word for word.
- **Text-free zones:** keep text out of the bottom 25% and out of the right ~10% below y 40% (the Reels UI covers them).
  Subtitles are **centered on x ≈ 45%, not 50%** (shifted about 55 px left to clear the right-side buttons). Both templates do this.
- **Persistent HUD:** a left counter that runs the **whole** video and always moves. It switches units as the value grows (ft → mi → million → billion)
  and shows both unit systems (mph · km/s, °F / °C). A comment complained when a video used imperial units only.
- **Text beats:** about one new line every **5 s** (11–12 lines per 65 s). Each line stays **3–5 s**, with gaps between lines. ≤ 8 words, sentence case.
- **Length 65–68 s** (Template A winners). The B posts that ran 82–85 s mostly lost.
- **Caption:** the title + **exactly 5 hashtags**: `#pov #whatif #science #simulation #<topic>`. No emoji, no CTA. The CTA lives in the bio.
- **Sound:** an original track. A comment praises "the bass", so expect a bass-heavy cinematic bed plus impact SFX. **No voiceover:**
  the on-screen text is the whole narration, and no comment mentions a voice. Design the video to work with sound off.

### Template A, "Data-HUD" (the best performer; build this one)
| Element | y range | x / align | Type spec |
|---|---|---|---|
| Milestone line ("**59 people**: taller than the Statue of Liberty") | 9.6–10.7% | left, 7.2% | ~30 px semibold white; leading number in amber; swaps at each milestone (every 4–6 s) |
| Title | 15.5–25.1% (3 lines) | left 7.2%, max width 71% | ALL CAPS heavy geometric sans (Inter ExtraBold/Black class), ~66 px (48 px cap), line-height 1.0; white + one amber phrase; soft shadow (~25% black, ~10 px blur) |
| HUD label ("PEOPLE", "DEPTH") | 30.3–30.9% | left 7.2% | ~18 px bold caps, letter-spacing +15%, amber |
| HUD number | 32.3–37.8% | left 7.8% | ~145 px heavy white (105 px cap) |
| HUD stat lines (1–3) | 39.5 / 41.7 / 43.9% | left 7.2% | ~44 px bold white, e.g. "1,321 mph · 0.59 km/s", "gravity 1.00 g · sim +1.0 min" |
| Logo badge | center 12% | right margin 5% | ~100 px circle |
| Inset mini-map (optional) | 16–31% | right, 24% wide | dark rounded card: "TUNNEL MAP · SIM", a "YOU" dot, "???" at the destination (a curiosity gap) |
| Subtitle | 66–70% | centered on x 45% | ~42 px semibold white, one amber keyword, in a black ~55%-opacity rounded box (~14 px radius, ~22 px vertical padding) |
| In-scene labels | — | on objects | tiny caps tag + leader line ("STATUE OF LIBERTY · 305 FT"); amber outline around the subject |

- Amber = **#F8AC2C**. Everything else is white.
- **Camera:** one continuous move (crane-up/pull-back, or a POV fall). **0 hard cuts.** The milestones are the beats.
- **Look:** low-poly stylized city or terrain → satellite-texture Earth → starfield. Bright daylight that turns to black space as you go up.
  The color temperature carries the progress (the hole video goes dark → orange → red → white-hot core).
- **Structure:** title + unit state ("1 person: you") 0–3 s → escalation with a landmark every ~5 s → a twist line at ~85%
  ("Now stand everyone side by side…") → **fast rewind or fall-back into frame 0, so the loop is seamless** (last ~3–5 s).

### Template B, "Cinematic POV" (weaker; reuse only its devices)
- POV with first-person hands or gloves on a railing, plus a recurring prop (coffee mug, pocket watch, note on a table). Moody real-time lighting, 2–4 cuts.
- HUD top-left at x 6.4%: label in sans caps, letter-spaced (~12%) / big **serif** value ~68 px (13.2–15.7%) / grey sub-label in letter-spaced caps (17.6%, "NORTH SEA · STORM").
- Title: centered serif, sentence case, ~54 px, y 29–35%, max width 70%. Optional gold keyword **#DCC078** plus a small inline gold glyph.
- Subtitles: italic serif ~52 px, white, soft shadow, **no box**, y 58–64%, centered on x 45%.
- End card: black #111; the title repeats at y 43–47%, and a grey caps fact/citation line sits at 50–52% (e.g. the date a real event was recorded).
  Copy the **real-fact anchor**, but use 1.5 s, not their 5–10 s.

## What not to copy
- **Long static end cards** (5–10 s of black in B). They throw away the last 8–12% of the video. Loop back to frame 0 instead.
- **80–85 s runtimes.** Stay at 60–68 s.
- **Remote or cosmetic premises** (sky/sun recolors, other planets with no Earth anchor). Each needs a human-scale stake and landmark comparisons.
- **Their specific concepts** (stacking humanity, hole through Earth, rogue wave, black or green sun, cheese moon). Copy the formula, not the topics.
- **Mixing both type systems.** Each video uses one system: sans+amber+boxed subtitles OR serif+gold+italic subtitles.
- **Wrong physics as a hook.** Nitpicks drive comments, but label simplifications on screen ("· SIM") as they do, and keep the numbers defensible.
- **Imperial-only units.**

## Fit with EDStudio house rules (CLAUDE.md)
- **Already matches:** subtitles at y 66–70% (house rule y≈1340 = 70%), title in the top 25%, HUD on the left and never on the right.
- **Conflicts:** Template A's counter is large (a 145 px number at y 32–44%), and the user wants a small HUD that dims when idle.
  Their sound is bass-heavy, and the user wants minimal, soft sound. If we adopt A, keep its *structure* (continuous move, milestone line, loop)
  but shrink the HUD (number ≤ 90 px, block ending by y ≈ 30%) and keep the house audio style.

## vs @tinyplanetlab
- Template B **uses the same type system as tinyplanetlab**: serif title with a gold keyword, a left HUD (caps label + big serif number), italic serif subtitles.
  It's either the same toolkit or a clone. FORMAT.md notes that tinyplanetlab's own what-if sims got only ~480 likes. realityrendered makes the format
  work with POV, a continuously running number, and real-world landmarks.
- The difference: tinyplanetlab sells **emotion** (the counter carries meaning: visits left, nights carried; toy characters; piano).
  realityrendered sells **awe and scale** (the counter *is* the plot; no faces, just POV hands or feet and low-poly crowds; colder cinematic light).
- Their best format (A) is the infographic one (bold sans + boxed subtitles + data stats + a loop). That is a distinct second format EDStudio could add
  next to the emotional one, using the same engine (HUD counter, story.json beats, Three.js camera move).
