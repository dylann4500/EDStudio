# World-scale "what if" videos (tone: `world`)

For big, general thought experiments about the whole world ("What if every nuclear weapon disappeared?", "What if the
internet went down for a year?", "What if every country had the same army?"). Reference build: `videos/005-no-nukes/`.
Same engine, same text kit, same house rules as the emotional format (CLAUDE.md, docs/FORMAT.md). What changes:

| | Emotional (`001`) | **World what-if (`005`)** |
|---|---|---|
| Title | "What your mom did…" | "What if every [thing] [disappeared / doubled / stopped]?" — gold keyword = the thing |
| Stage | a home | **a war room with a hologram Earth** (`engine/sets/warroom.js` + `engine/globe.js`) plus ONE human-scale cutaway set (005: a launch capsule) |
| HUD number | sentimental count | **the premise itself, counted for real** (warheads on Earth 12,187 → 0 → 1). Time line = "TONIGHT / DAY 1 / MONTH 6 / YEAR 3"; second line = who holds it |
| Structure | ritual → eras → reunion | baseline fact → the premise hits (number rolls, visibly) → one human witness → **Day 1 relief** → **the twist consequence** (power shifts) → time skip → **reversal: the number comes back by one** → open question |
| Ending | warm line | a debate question on the end card ("Safer — or just *different*?") + "SEND THIS TO SOMEONE WHO'LL DISAGREE" — comments are the growth engine for this tone |
| Music | soft piano | same piano, minor key (Dm), descending arp as the thing vanishes, pulse for tension, a soft held 'thin' bar right before the reversal (**never a rest — the music must stay continuous**), swell + pad on it |

## Rules that made 005 work
1. **The number on screen IS the picture.** Each warhead is one dot on the globe (12,187 instanced dots); dot *k* is visible
   while *k* < the HUD count, so the counter and the globe drain together, frame-exact (`makeDots` + a seeded permutation).
2. **Every real-world number has a source** (put it in the shots.js header + an HTML comment in caption.md). 005: SIPRI Yearbook
   2026 (12,187; RUS 5,420 + USA 5,042 = 86 %), IISS (troops), IAEA PRIS (31 reactor countries). Check the *latest* edition with
   a web search — the 2025 total (12,241) was already out of date. Round only when the text says "about".
3. **Stay neutral on real countries.** No flags, no real leaders, no villain. The thing that comes back appears in the open ocean
   ("Nobody knows whose it is"). Leaders are generic toy figures in different suits.
4. **One human-scale witness** (a launch crew watching their panel go dark) keeps it from being a lecture. Give them one small
   gesture (sit back, look at each other, tiny smile).
5. **Show consequences as glowing data on the globe**: gold columns = army sizes, blue dots = reactor countries. No 3D text labels:
   the subtitle names what the viewer sees.
6. **Leaders are hidden in globe close-ups** (`root.visible = roomShot`): behind a globe they only show up as cropped heads at
   the frame edge.

## Globe framing (9:16)
- Camera 2.6–2.9 m from the globe center, fov 40, look-at nudged **+0.1 m above** center: the globe (r 0.5) fills ~80 % of the
  width and sits slightly low, clear of the HUD (top-left) and just touching the subtitle line.
- Turn the globe, not the camera: `globe.g.rotation.order = 'YXZ'`, yaw = camera azimuth, x = tilt, `spin.rotation.y = faceLon(lon)`.
  A point at latitude φ faces the camera when `tilt = φ − camera elevation` (005 reveal: lat −12, elev 0.16 → tilt −0.37).
- Keep the action dot **above y≈1250 px** so the subtitle never covers it.
- In room shots, nothing (sconce, screen, bar) should sit directly behind the globe on the camera axis: it reads as a light-saber.
