# Reference: @wemakebuild (analyzed 2026-10-26)

The account behind EDStudio's **build** genre (`docs/BUILD.md`). User: "I really like the style… I think it's high retention.
We should just copy their animation style… adapting it to our own." We copy the *format*; scripts, jokes, characters and
topics are our own.

Profile: 97.7K followers. Every post is titled **"How a [humble everyday thing] Becomes a [giant machine/structure] 🤔"** +
`#funny #animation #explanation`. Likes on the 13 posts we saw (Oct 2026):

| Post | Likes |
|---|---|
| Wooden Plank → Bridge (`/p/Deiz8tguWYI/`, 98 s) | **1.85M** |
| Shopping Cart → Roller Coaster (`/reel/Deld1yCOssA/`, 118 s) | 511K |
| Treehouse → Skyscraper (`/reel/Desc-OlucOb/`, 118 s) | 286K |
| Cardboard Box → Airplane | 184K |
| Bathtub → Cruise Ship | 179K |
| Wheelbarrow → Monster Truck · Laundry Basket → Cable Car | ~105K |
| Trash Can → Submarine | 90K |
| Bicycle → F1 car · Garden Hose → Water Park · Rope Swing → Ferris Wheel · Barrel → Rocket · Ladder → Crane | 24–43K |

Topics they've already done — **don't repeat these pairs**.

## Script (the engine of the format)
~300 words in 98 s (**≈ 3.1 words/s**, no pauses), second person ("you"), a funny male ElevenLabs narrator, deadpan roast.
1. **Hook = the dumbest possible version, in the first second.** "You throw a plank across a river and walk over it."
2. **"Congratulations, you've built a [thing]…"** + a roast simile (*"with the structural integrity of a wet biscuit"*).
3. **The loop, 6–8×:** the current version **fails in a funny, physical way** that hurts the recurring victim (their **Kevin**:
   he falls in, gets washed downstream, launched into a pool) → **"So…"** + the fix → **"These are called [TERM]"** (a real
   engineering word, shown as a yellow callout) → one plain sentence on what it does → a joke/simile ("bending like a
   depressed banana", "fold like a cheap camping chair", "buckle like a folding table at a family barbecue").
4. **Escalation by stakes:** a bigger river, cars, a maniac truck driver who ignores the weight sign, summer heat, a flood.
   Side characters land single gags (Grandma wakes up with the bridge in her living room; a neighbor wants one too).
5. **Finishing pass** in one fast list ("add guardrails, road markings, lights and a toll booth").
6. **Callback ending:** "Congratulations, you've built a [thing]. You started with [step 1] because [petty reason]. Now you've
   spent **$6,000,000**, [absurd consequence], and Kevin is suing for emotional damage." The money is a green callout.

## Visuals
- **Bridge reel = ONE continuous cutaway diorama**: the ground is sliced open toward the camera (brown soil face with
  texture), the river is a translucent water volume seen in section, olive trees + white houses with red roofs behind, a
  one-point-perspective view down the channel. The structure **upgrades in place**; the camera drifts, pushes in, and
  re-frames (low side views for the expansion joint, a deep view for the piles). No hard cuts in 98 s.
- **Newer reels cut a lot more**: continuous follow-cams + a cut every ~1–3 s, face close-ups (dazed eyes, spiral eyes),
  interiors, crowd shots, the cutaway ground for foundations/piles.
- **Characters:** big-headed toon (head ≈ 40 % of height), huge white eyes with pupils, brown spiky hair, orange hoodie,
  blue jeans. Expressions do the comedy (spiral eyes, screaming, smug). Grandma (purple dress), a cap-wearing friend,
  police, an employee.
- **World kit reused every video:** striped mown lawn, round olive trees, white houses with red roofs, a red-signed
  supermarket, bright overcast-sunny light, soft clouds. Near-photoreal environment (Blender) + cartoon characters.
- **FX on every gag:** crack + snapping plank, rain + rising water + the deck floating away, confetti on "congratulations",
  DO NOT CROSS crime-scene tape, a splash, force arrows (orange chevrons) running along the truss members, money piles,
  fireworks, dizzy stars.

## Text
- **One word at a time, dead center** (~52 % of frame height), white rounded bold sans (Fredoka-like), thin dark outline +
  soft shadow, no box, swaps instantly on each spoken word.
- **TERM callout** above it (~31 %): big yellow ALL-CAPS with a dark outline (Luckiest-Guy-like), held for the sentence.
- **Stamp** (red, tilted, slams in: "REJECTED", "NO BRAKES"), **money** (green: "$6,000,000"), **comic SFX** (small yellow
  "CRACK!" next to the action), **labels** ("17 COMPLAINTS", "FREQUENT FLYER", "500 STAIRS").
- No title card, no HUD, no end card — the first word is spoken on frame 1, the last line is the punchline.

## Audio
Voice-forward and flat: **−14.1 LUFS integrated, LRA 1.6 LU**, no silent windows (a music bed runs the whole way under
the voice), SFX on every gag (crack, splash, crowd, truck).

## How it was analyzed (repeatable)
Instagram's embed page (`/p/<id>/embed/captioned/`) carries the `video_url`; curl it into its own scratch folder. The
captions are burned in one word at a time, so the transcript comes from the frames: crop the caption band, binarize
(`y > 232`), keep a frame whenever > 5 % of pixels change, tile the crops and read them. Cut rate from 1 fps contact
sheets (`fps=1,scale=180:-1,tile=12x10`), loudness from `ebur128`.
