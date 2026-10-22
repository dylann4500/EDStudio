# Tones: emotional vs funny

Every video declares its tone in `story.json` → `"tone": "emotional" | "funny"`. Both tones use the same engine,
the same text kit (centered serif question, small top-left HUD, italic subtitles with shadow + backdrop) and the
same house rules (CLAUDE.md). What changes is the **story shape, the timing, the acting, the music and the ending**.

| | **Emotional** (`videos/001-bedroom-door`) | **Funny** (`videos/002-everyone-pregnant`) |
|---|---|---|
| Title | "What your [person] did [moment]" | "What if [everyone / you] [absurd but physical premise]?" |
| Protagonist | a parent seen through *you* ("your mom") | a recurring **everyman with a name** (Gary) + a crowd |
| HUD number | something sentimental (nights, visits left) | a **progress clock** for the premise (weeks, days, %) + a deadpan stat line that changes every era ("PICKLE JARS LEFT ON EARTH 1") |
| Structure | ritual → repetition across ages → change → time skip → reunion | normal baseline → the premise hits → **one gag per era (rule of escalation)** → everything peaks the same day → twist ending |
| Shot length | 4–9 s, slow push-ins | 2.5–8 s, **hard cuts** (no dips to black), a new gag every ~6–8 s |
| Subtitle voice | tender, specific ("She checked on you eleven times.") | **deadpan narrator**, specific absurd numbers ("Earth runs out of pickles in 41 minutes.") |
| Acting | slow, small (lean, tuck, a tear) | **big readable poses, everyone in sync** (whole crowd looks down / turns heads / freezes at once) |
| Faces | smile / closed eyes / tear | flat mouth (deadpan), `mouth: 'o'` (shocked), green skin (nausea), the stare at camera |
| Music | soft piano held/arp, swell at the reveal | **bouncy piano** (`style: "bounce"`) over a quiet pad bed, a staccato melody motif per era, one soft low "plonk" sting as the button — **music never drops out** |
| Foley | door, steps, blanket | still minimal: crowd steps, soft low "boops" (plush_squeak, pitch 0.55–0.8) for a cartoon moment, a plop |
| Ending | reunion that echoes shot 1, a quiet line | the premise resolves + **one warm turn** that makes it shareable ("And every single human calls their mom." → "Call your mom. Say thank you.") |
| Caption CTA | "Send this to your mom" | "Send this to the Gary in your life" / "Tag someone who…" |

## Funny: the rules that made 002 work
1. **One named everyman.** "Yes. Even Gary." A name + a mustache + a bald head = instant character. He gets the gag in every era
   (hot dog → trash can, last pickle jar, can't reach shoes, last in the bathroom line, baby + phone). Recurring character = the
   comedy version of the emotional "ritual".
2. **Synchrony is the joke.** 8 billion people doing the same thing at the same moment: all stop, all look down, all bellies
   pop, all heads track the guy with the last jar, the whole line shuffles 20 cm at once. Code it as one keyframe shared by the
   crowd with a tiny per-person delay (`e.seed * 0.12 s`).
3. **Setup line → beat → visual punch.** The subtitle sets it up, the picture delivers (Gary stares at the camera, gives up,
   grabs his own belly), a soft low note buttons it. Never put the punch in the text when the picture can do it.
   **Do NOT stop the music for the beat** — the user heard 002's first-cut −40 dB rests as the music "cutting in and out".
   At most a gentle −4 dB dip with a slow ramp (≥ 0.3 s).
4. **Specific absurd numbers, deadpan.** "41 minutes", "2.1 miles · 3.4 km", "since July". The HUD's second line is a running
   joke stat, swapped each era. Label units both ways (whatif reference lesson).
5. **Rule of three.** Three reaches for the shoe, three rocks to stand up, the third one fails.
6. **Visible time skip.** Seasons on the set (spring → summer → autumn leaves → snow) + the HUD date.
7. **Land on warmth.** The last 8–10 s turn sincere (one warm music section) so people share it. Funny but kind — never mean,
   never gross; body comedy stays cartoon (no fluids, nothing medical on screen).
8. **Cartoon readability over realism.** Bellies are big from week 1 (`belly` 0.7) so the premise reads in a thumbnail; arms
   splay around the bump automatically (rig).

## Emotional: see `docs/FORMAT.md` (the original style bible).

## Choosing a reference
- Funny "what if" crowd sims: `docs/reference/whatiflab.md` (@what.if.lab_, 441K-like gravity reel), `docs/reference/whatifpov.md`.
- Emotional family stories: `docs/FORMAT.md` (@tinyplanetlab).
- Science/scale POVs: `docs/reference/realityrendered.md`.
