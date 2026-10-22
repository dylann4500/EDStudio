# Tones: emotional vs funny

Every video declares its tone in `story.json` → `"tone": "emotional" | "funny" | "world" | "montage"`. Both tones use the same engine,
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

**Every tone (house rule): show what the subtitle says, in its own scene** — many locations per video, never one set on repeat.

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

## World: big thought experiments about the whole planet
`"tone": "world"` — "What if every nuclear weapon disappeared?" (`videos/005-no-nukes`). A hologram Earth whose dots ARE the HUD
number, intercut with a different real-world scene for every claim (silo, capsule, sunrise city, marching soldiers, border post,
tank hangar, power plant), Day-1 relief → the consequence nobody expected → time skip → the number comes back by one → a debate
question on the end card. **Vibe: curious and intriguing (documentary explainer), not sad** — mallet ostinato, major/lydian,
driving pulse for tension, an open unresolved last chord. Real numbers only, sourced and current; neutral on real countries.
Full playbook: **`docs/WORLD-WHATIF.md`**.

## Montage: the premise everywhere at once (`videos/007-twice-as-smart`)
`"tone": "montage"` — "What if every human became twice as smart?" The user wants these sims to **show the effect in lots of
different places instead of hovering around one scene**: every beat = a new location + one or two subtitles + a HUD time stamp
(SECOND 0 → +1 MINUTE → +1 HOUR → +1 DAY → +3 MONTHS → +1 YEAR → +5 YEARS → +12 YEARS → +20 YEARS), ~5.5–6 s each, hard cuts.
- Open on an ordinary place, show the premise *happening* (007: a blue glow wave passes through every head, the crowd strikes the same
  "hmm" pose), then escalate small → personal → societal → planetary (classroom → traffic → phones → peace deal → cures → energy → Mars).
- HUD: the premise number (AVERAGE HUMAN IQ 100 → 200) + the time stamp line + one stat line per beat ("TRAFFIC JAMS 0", "PEOPLE ON MARS 10,000").
- Keep each beat's action **one readable picture** (the board filling up, cars zippering, phones going down in sync, a banner + confetti).
- **Show the spectacle, don't just state it** (user steer on 007's first cut: "I want to see more cool stuff — cities growing,
  the Mars city actually being built"). Big claims get a TIME-LAPSE beat: build-ups with growth handles (towers rising with a crane
  riding the top, domes/tubes/solar fields popping up in order), fast day/night cycles (`city.setTime({day})` with cos), dusk → lights on.
  Budget ~6–8 s for each spectacle beat; they're the shareable moments.
- End on a human-scale button that undercuts the grandeur (+20 years… "Almost." — a genius loses to a fitted sheet), then a comment-bait
  question card ("What would you invent first?").
- Sound: its own identity — synth plucks + echo, a scene-specific bed per beat, synced foley (see audio/README.md → Sound identity).
- Multi-set technique: CLAUDE.md → Hard-won rules → "Montage across many locations". Reuse every set in `engine/sets/`.

## What-if ripple ladder (`"tone": "whatif"`, `videos/006-memory-loss`)
A sibling of **montage** (007): same many-places ladder, but each beat is a *consequence* with a real mechanism, the HUD number
crashes and climbs back, and the mix is sound-design-led (no score until the ending).
User steer (after 003): global what-ifs should show **the resounding effects in many places**, not one character's angle.
Reference: `docs/reference/simplysimulated.md` (841K likes). Not every video has to be emotional.
1. **One consequence per place, ~6 s each.** 006: New York street (everyone stops at 9:00) → the same street, two strangers
   (+10 s) → Seoul, cars stopped at a green light (+30 s) → Sydney bedroom (+2 min) → a phone's Face ID (+1 h) → "Do you know me?"
   posters (+1 day) → school for adults (+1 week) → soldiers shake hands (+1 month) → old couple on a bench (+1 year).
2. **HUD = a number that is the plot**, time line = the stamp ("+1 HOUR"), second line = the place ("SEOUL · 11:00 PM").
   The number crashes at SECOND 0 and climbs back as the world adapts (006: PEOPLE WHO KNOW THEIR OWN NAME 8.2 B → 0 → 8.2 B).
3. **Use real mechanisms + one sharp line per beat.** Amnesia keeps language and skills ("Nobody forgets how to talk, or walk.
   Only who they are."), Face ID still works ("Face ID knows who you are. You don't."). Comment bait comes from these.
4. **Reuse sets across beats**; dress them per beat (posters, chairs, cars, season, time of day). Four sets made nine places.
5. **End on one small human beat + a question end card** ("Who's the first person you'd *look for*?" / SEND THIS TO THEM).
6. **Sound-design-led:** the moment is subtractive (every voice + footstep stops at 9:00, traffic keeps going). See audio/README.md.
7. **Go dark when the premise is dark (user steer on 006 v1: "too tame… take a heavier doomer perspective").** v1 showed people
   adapting (phones, posters, a love story) and was rejected. v2 follows what breaks: cars running reds → planes with nowhere to
   land → leaders who don't know they lead → strangers beside a launch key → reactors nobody can run → blackout → tanks at the
   border → food riots → an overgrown city a year later. The HUD number crashes to 0 and **never recovers**; the second HUD line
   carries the escalating stat (PLANES IN THE AIR · 10,000+, NUCLEAR WARHEADS · 12,187). End on a debate question
   ("Would humanity survive the *first year*?"). Keep it non-graphic: wrecks, glows, crowds — no bodies, no blood.
