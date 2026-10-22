# Reference: @whatifpov (analyzed 2026-10-21)

Faceless "What if…" escalation Reels. Low-poly 3D look, set in a NYC street, first-person POV with a coffee cup in hand.
The bio credits **@higgsfield.ai**, so the shots are probably AI-generated (image-to-video in a game-engine 3D style).
The overlays (title, HUD, subtitles, rewind effect) are added in post, and the HUD numbers follow exact math.

**Profile:** 15.8K followers · 0 following · 14 posts (per meta; 12 visible logged out).
The bio has 4 lines: tagline ("Exploring the impossible, one video at a time"), the Higgsfield credit, and a Payhip link selling a
"recreate my What IF videos" pack. Avatar: a cartoon "WHAT IF?" logo over the Earth.
**Cadence:** 12 posts in 6 days (Oct 16–21: 2, 1, 2, 2, 2, 3), so **~2 per day**. The account is about 1 week old,
and its 2nd post went viral (264K likes).
**Data limits:** logged out, so no view counts. Likes and comments come from og:description.
I couldn't listen to the audio. The sound notes below come from analysing the decoded audio track (loudness envelope, mid/side balance,
pitch tracking) and are inferences.

## Post stats (newest first, age at capture)

| Date | Hook (caption) | Len | VO | Likes | Comments | Cmt/1K |
|---|---|---|---|---|---|---|
| Oct 21 (0d) | aging reversed | 39.6 s | yes | 2,133 | 16 | 7.5 |
| Oct 21 (0d) | your dog 2x bigger every 3 s | 39.2 s | ? | 2,061 | 7 | 3.4 |
| Oct 21 (0d) | you cloned yourself every 3 s | 36.2 s | ? | 853 | 7 | 8.2 |
| Oct 20 (1d) | you became a magnet, 2x stronger every 3 s | 37.2 s | ? | 2,064 | 18 | 8.7 |
| Oct 20 (1d) | **didn't shower for 365 days** | 40.1 s | yes | **51.1K** | **434** | 8.5 |
| Oct 19 (2d) | Earth spun faster every 3 s | 40.0 s | ? | 8,158 | 40 | 4.9 |
| Oct 19 (2d) | **you got 2x smaller every 3 s** | 40.0 s | yes | **34K** | 67 | 2.0 |
| Oct 18 (3d) | gravity halved every 3 s | 32.7 s | ? | 3,567 | 20 | 5.6 |
| Oct 18 (3d) | zombies double every 3 s (no "What if") | 33.0 s | ? | 902 | 10 | 11 |
| Oct 17 (4d) | **you DOUBLED in size every 3 s** + "TAG that tall friend!" | 33.9 s | no | **94.4K** | 454 | 4.8 |
| Oct 16 (5d) | **your speed DOUBLED every 3 s** | 34.2 s | no | **264.2K** | **1,216** | 4.6 |
| Oct 16 (5d) | AI took over TODAY | 33.0 s | — | 695 | 4 | 5.8 |

Every post uses "Original audio". The 3 posts from Oct 21 are too young to judge.

**Why the winners win**
1. **One variable on *your* body, compounding:** your speed, your size, you shrinking, your hygiene. Viewers picture themselves in it.
   The low performers are abstract or about other things: AI takeover (695), zombies (902), clones (853).
2. **Exponential escalation is the retention engine.** The value goes ×2 every 3 s, about 10 doublings (×1,000) in 30 s,
   so every beat tops the last one. The cold open shows the absurd end state first, which promises the payoff.
3. **A mundane baseline with real-world benchmarks:** walking to work with a coffee. Each new beat is a comparison viewers already know
   ("Faster than Usain Bolt", "Taller than the Empire State", the sound barrier, "Hotter than lava").
4. **An everyday or taboo topic brings tags.** The shower post's comments are mostly @-tags and confessions ("I'm on day 55"),
   with the best velocity (51K in 1 day). The size post's explicit "TAG that tall friend!" CTA is the only CTA in any caption.
5. **Nitpick bait:** the HUD silently switches units at the climax (meters → mph), which drew a "how'd it go from meters to mph" comment.
   Comments also pitch sequels ("Next one shorter every second"), and the account shipped "2x smaller" 2 days later.

## Rules to copy

Frame is 1080×1920. y = % of frame height from the top; x = % of width. Measured on frames drawn at full resolution.

### Concept + hook
- **Formula:** "What if [you / your X] [doubled / 2x bigger / 2x smaller / halved] every 3 seconds?" Alternative: "[habit] for 365 days".
- **On-screen title ≠ caption.** On video it's a second-person statement ("Your speed doubles every 3 seconds",
  "You get 2x smaller every 3 seconds", "No shower for 365 days"). The caption asks it as a question ("What if…?").
  Newer posts also use the question on screen.
- **Beat sheet (34–40 s):**
  - **0–2.0 s cold open** of the climax (end state), with the title and the HUD already at an extreme value (1,581 °C; Day 365; 1,133 mph).
  - **~2.0–3.2 s VHS rewind:** a ⏪ icon (~60 px, x≈10%, y≈12.5%), horizontal tracking tear, and the counter spinning backward.
    The audio drops to near-silence for ~0.5 s.
  - **3 s normal start** at a baseline value ("Just walking. 3 mph."). The title fades out by ~4 s.
  - **3–27 s escalation:** one doubling = one shot = one subtitle every ~3 s.
  - **Last ~25%:** switch the HUD to a *consequence* metric (speed → Mach → air temperature °C; height → head speed mph).
    The physical destruction peaks.
  - **Last ~0.5 s matches frame 0**, so the loop is seamless (the end flows into the cold open).
- **Counter math is exact:** v(t) = v₀·2^((t−t₀)/3), interpolated smoothly (not stepped).
  Speed: 4.0 mph at 4.5 s → 32 at 13.5 → Mach 1.05 at 27.5. Size: 2.35 m → 425 m at 27 s.
  For "365 days", ease in and out across ~30 s and land on 364 at the loop point.

### Text layer (one type system, all serif, no boxes)
| Element | y | x / align | Spec |
|---|---|---|---|
| Title | 23–34% (2 lines at ~26% / ~31%) | centered, ≤70% width | Garamond-class serif (EB/Cormorant Garamond look), ~85 px (cap ~57 px), line height ~96 px; warm white #F3EFE7-ish; soft dark shadow ~10 px blur. On screen 0 → ~3.5 s, then a ~0.4 s fade. |
| HUD label | ~47% | left, x≈6% | ~28 px sans caps, tracking ~+15%, white ("YOUR SPEED", "YOUR HEIGHT", "WITHOUT A SHOWER", "AIR HITTING YOU") |
| HUD value | ~50.5% | left, x≈6% | **same serif, ~85–90 px** (as big as the title); number + unit with a space, thousands commas ("1,259 °C", "Day 141", "4.70 m") |
| HUD comparison | ~55% | left, x≈6% | ~22 px tracked caps, light grey; updates per beat ("WALKING PACE", "HOT ENOUGH TO CHAR CLOTH") |
| HUD vitals | ~57% | left, x≈6% | ~18 px: red dot + "64 BPM" → "301 BPM" + a red ECG squiggle (a stress meter that rises with the number) |
| HUD scrim | 45–59% | left ~40% | faint translucent dark panel, soft edges (legibility only) |
| Subtitle | ~66% | centered, ≤45% width | **italic** serif ~58 px, white, soft shadow, no box; 3–6 words, second person, present tense; often a number prefix ("Day 30: …", "70: …") |
- The HUD is **persistent from frame 0 to the end** and the label changes when the metric switches.
- Subtitle cadence is **1 line per 3-s beat**, each held ~1.5–3 s. Short gaps between lines are fine.
- Nothing below ~70% (Reels UI zone). Nothing above 20% except the rewind icon.

### Visuals + pacing
- **Camera:** mostly first-person POV (blocky low-poly hands holding the **recurring coffee cup**, the brand prop in nearly every video:
  it spills, grows, or towers over you). The POV is intercut with a side tracking shot, a rear follow, and a wide or aerial shot for scale.
- **Shots change about every 3 s** (~18–20 shots/min), locked to the doubling beat.
  The 365-day video uses seasons (summer → autumn trees → snow) as time cues.
- **Look:** a bright daylight NYC street, low-poly crowds and cars, clean game-engine shading.
  At the climax: motion blur, heat glow, and white-out (light at the end of the street).
- **Length:** 33–34 s for the two biggest hits; newer posts run 36–40 s.

### Sound
- **Oct 16–18 posts (both mega-hits): no voiceover.** A continuous ambient city/wind bed (−20 to −25 dBFS RMS)
  with SFX synced to beats: footsteps that speed up with the speed, a loud transient peak at Mach 1 (~28 s, about +13 dB, a sonic boom),
  and wide stereo wind and roar during the cold open and climax. The on-screen text carries all the narration.
- **From Oct 19: a deep male voiceover** (median pitch ~130 Hz, near-mono, voiced ~35% of the time) reads the subtitle lines,
  with 0.3–0.7 s pauses between them, over a quiet bed. The VO posts still did well (51K, 34K), but the two no-VO originals
  remain the top performers, so VO isn't the driver.
- Never a trending sound: always "Original audio".

### Caption + CTA
- `What if …?` + optional 1–2 emoji (☕️🐜, 🌍⬆️) + blank line + **5–9 hashtags**:
  `#whatif #science #physics #shorts` + one of `#animation/#animationart/#3danimation` + 1–3 topical tags + often `#shortstory`.
  (`#shorts` means it's cross-posted to YouTube Shorts.)
- At most one CTA, and only when the topic is taggable ("TAG that tall friend!"). The monetization link lives in the bio.

## What not to copy
- **Abstract or other-people premises** (AI takeover, zombies, clones). Keep the stake on the viewer's own body or daily life.
- **Multi-metric HUDs.** The AI video switched between 5 unrelated counters and flopped (695). Use one number, plus at most one consequence switch.
- **Silent unit switches** (m → mph) unless you label the switch on screen. It reads as an error.
- **Their props and set** (NYC sidewalk + coffee cup) and their exact phrasing ("every 3 seconds" titles). That's their brand and they sell it.
  Copy the mechanics (doubling clock, cold open + rewind, loop), not the skin.
- **Loud whoosh/boom-heavy mixes** if your house style is soft (see below).
- **The unreadable 18 px BPM line.** It's decoration. Drop it or make it ≥ 28 px.
- **Junk hashtags** (`#coffeecoffeecoffee`, the typo `#spacer`). Keep tags relevant.

## Fit with EDStudio house rules (CLAUDE.md)
- **Already matches:** a serif title in the top third, italic serif subtitles with a soft shadow at ~66% (house y≈1340 ≈ 70%),
  the left-side HUD, and the seamless loop.
- **Conflicts:**
  - Their HUD sits **mid-left (47–58%) at ~88 px** and never dims. House rule: small, top-left (y≈470 ≈ 24%), dims when idle.
    Keep the 4-line HUD *structure* (label / value / comparison / vitals), shrink it, and move it to the top-left.
  - Their audio is SFX-forward. House style is piano-led and soft.
- **Worth stealing:**
  - The **0–2 s cold open of the climax + ~1 s VHS rewind**. It works for emotional stories too (show the gut-punch end state, rewind to "Day 1").
  - The **comparison line under the counter**, which gives every number a meaning.
  - **One beat = one shot = one subtitle** on a fixed clock.

## vs @tinyplanetlab
- **Same overlay grammar:** a centered serif title, a left HUD (caps label + big serif number), italic serif subtitles.
  @realityrendered__'s Template B uses the same kit, down to the coffee-mug prop.
  The Payhip "recreate my videos" pack suggests a shared or sold toolkit is spreading.
- **Differences:**
  - whatifpov has **no gold keyword** (all warm white) and a bigger HUD placed mid-frame, with an extra comparison line and a BPM/ECG line.
  - It adds cold open + rewind + loop.
  - The content is **compounding physics and absurdity** (awe and comedy, a 3-s clock, second-person POV).
  - tinyplanetlab sells **emotion** (toy-like family characters, a counter with emotional meaning, piano).
- **Takeaway:** whatifpov proves the same visual kit can go viral (264K likes in 5 days on a brand-new account) when the counter *is* the plot
  and the stake is "you".
