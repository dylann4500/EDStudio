# audio/synth.py — procedural score + foley (royalty-free, numpy/scipy only)

    python3 -I audio/synth.py <video>        # reads videos/<video>/cues.json -> videos/<video>/audio.wav (+ out/stems/)
    python3 -I audio/synth.py --dump-cues    # print the full default cue sheet (every option, documented by example)
    python3 -I audio/synth.py                # regenerate the reusable SFX pack in audio/sfx/

## House style (from user feedback — follow it)
- **Minimal and soft.** Piano leads; foley is a whisper underneath. ~8–15 events per minute, not 60.
- Keep only sounds that sell a story beat: a door latch, a few steps when someone enters, the blanket tuck, one prop.
- **No** counter ticks, whooshes, swishes, chimes, clock ticks, sleigh bells or crickets unless the user asks.
- Foley bus low-passed (`"sfx_lowpass_hz": 4200`), sfx stem around −9 dB, ambience around −8 dB, master ≈ −15 LUFS.
- Copy `videos/001-bedroom-door/cues.json` (emotional) or `videos/002-everyone-pregnant/cues.json` (funny) as the starting point.

## Match the music to the reel's vibe (user rule)
Pick the score from what the story *feels* like, not from the last video: tender family story → soft piano (001); comedy →
bouncy piano (002); curious science → mallet explainer; **high-stakes / ominous world what-if → cinematic drama (005)**.
005 took three tries: 001's sad piano ("too sad"), a calm mallet explainer ("too calm for how dramatic/ominous it is"), then this.

## Dramatic world tone (005) — cinematic, ominous
- `style: "strings"` = low spiccato string-section ostinato (the "Zimmer drive") on the chord: `step` 0.125 (16ths at 120 bpm),
  `pattern` indexes [bass, chord tones], `accent` per-step multipliers, **`octave: 1`** (an octave up — at the raw register the
  drive sits at 40–110 Hz, which K-weighted loudness and phone speakers barely register), `sustain` adds a held upper chord,
  `len` = note length in steps (≥ 0.9 for slow pulses so there are no gaps). Level with `strings_db` (005: +8).
- `drums: [[t, vel, kind]]` single hits and `drum_patterns: [{t0, t1, step, pattern: [vel mult...], vel, kind}]`; kinds
  `taiko` (warm low boom), `tom` (rolls into a hit), `boom` (huge sub hit: midnight / the reveal / the end card), `tick`.
  Soft, low-passed, no snap. Drums are ~7× louder than strings per note, so set `drums_db` low (005: −7) and re-check the arc.
- Pad `notes: [26, 38, 45, 50, 57]` + `"hp": 30` = sub drone you can also hear on a phone (the pad's default 110 Hz high-pass
  removes anything lower). A "braam" = the same with more low notes, `level` 1.5, `attack` 0.15, on the reveal.
- Arc (LUFS per shot from the synth's table): quiet tension (−20) → hit (−14) → eerie dip that still has a drone (−22) →
  build (−17 … −12) → reveal (−12) → darker close (−17). Read the per-shot table after every change.
- Soft mallet voice (`ostinato` style, `mallet_melody`, `mallet_db`) is still there for calmer curious/science reels.
- Reference script: `videos/005-no-nukes/make_cues.py`.

## Sound identity per video (user steer, Oct 22)
EDStudio makes sims of every kind; the soundtrack must not sound like the last video. Choose per video:
| type | voice | bed / foley |
|---|---|---|
| emotional (001, 003) | soft piano (`instrument: "piano"`, held/arp/cadence) | room tone, a few quiet foley hits |
| funny (002) | bouncy piano (`style: "bounce"`) + pad | city murmur, cartoon boops |
| montage / science / tech (007) | **synth plucks** `instrument: "pluck"` (or `"bell"`) + `echo: {delay, feedback, mix, lp_hz}` + pad | **a different bed every scene** + synced foley |
| world (005) | soft **mallet** ostinato (`style: "ostinato"`), curious documentary feel | scene beds per location |
- Successful sim accounts are often **SFX-led** (little/no music, realistic immersive sound). 007 runs 6.6 s with no music at all —
  just a street — and the synth enters on the premise. You may go music-free for a whole video if the sound design carries it.
- Plucks decay fast: **never use `held`/`cadence` sections with `pluck`** (they leave gaps) — use slow `arp` (step 0.375–0.75)
  and a louder pad bed (`pad_db` ≈ +1, `level` 0.55–0.8).
- New beds: `applause` (density), `crowd_cheer`, `traffic_flow`, `rocket_rumble`, `turbines`. New events: `car_pass` (t = closest
  point, Doppler), `chalk_write`, `pen_scribble`, `low_swell` (anchor = peak). Sync event times to the picture (007 computes car
  crossings from the same formula as shots.js).
- Raise `stem_gain_db.sfx/amb` (≈ −4/−3) for SFX-led mixes; keep `sfx_lowpass_hz` ≤ 6000 so nothing gets harsh.
- Self-check: the synth prints `music dropouts: none` — anything else must be fixed before muxing.
- The onset checker flags overlapping/gradual sounds (car passes, stacked scribbles) as "--"; that's expected for beds of sound.

## Funny tone (002) — same softness, different timing
- `style: "bounce"` section = "oom-pah" piano (bass on 1+3, soft chord stabs on 2+4), `step` 0.5 s = 120 bpm; note lengths
  `bass_hold` (default 1.6 beats) / `stab_hold` (0.8) — keep them long enough that the groove doesn't sound choppy.
- Melody entries take an optional 5th element = note length: `[t, midi, vel, false, 0.16]` → staccato motif.
- **Never let the music drop out** (user feedback on 002: hard −40 dB rests before punch lines sounded like the music
  "cutting in and out"). Punch lines get at most a gentle `ducks` dip (`db: -4`, `ramp` ≥ 0.3), plus one soft low `stings`
  note (midi 36–41, vel ~0.33) as the button. Keep a quiet pad bed (`level` ~0.32) under staccato sections so there are no gaps.
- Check before muxing: compute 50 ms RMS windows of `out/stems/music.wav` — nothing mid-video should sit > 10 dB below the median.
- Cartoon moment ("bellies pop"): 4–5 `plush_squeak` with `pitch` 0.55–0.8, −27 dB, staggered 60 ms — soft boops, not boings.
- Turn warm for the ending (arp + pad) so the last line lands sincerely.
- Ambience `city_day` (`murmur`, `traffic` args): far traffic rumble + indistinct crowd murmur, around −44 dB.
- Generate long cue sheets with a small script (`videos/002-everyone-pregnant/make_cues.py`) rather than hand-typing JSON.

## cues.json schema (short)
- `duration`, `target_lufs`, `stem_gain_db {music,sfx,amb}`, `sfx_lowpass_hz`
- `ambience`: `[{sound, t0, t1, fade_in, fade_out, gain_db, args?, seed?}]` — sounds: room_tone, city_day, applause, crowd_cheer, traffic_flow, rocket_rumble, turbines, crickets, clock, wind, dry_leaves, rain_window, sleigh_bells, lamp_hum
- `events`: `[{t, sound, args?, gain_db, pan, room?, hall?}]` — sounds: door_open, door_close, latch_click, footstep, floorboard_creak,
  blanket_rustle, mattress_sit, car_pass, chalk_write, pen_scribble, low_swell, plush_pickup, plush_squeak, plush_place, phone_pickup, phone_set_down_wood, lamp_switch_click,
  counter_tick, gold_chime, whoosh_timeskip, flash_swish. Generators: `{sound: "footsteps", t0, t1, pan0, pan1, gain_db}`,
  `{sound: "tick_roll", t0, t1, peak_rate}`.
- `music`: `instrument` (piano|pluck|bell), `echo`, `chords [[t, "F"], [t, "C/E"], ...]`, `sections [{t0, t1, style: held|arp|thin|pulse|swell|sparse|cadence|bounce, vel, ...}]`,
  `melody [[t, midi, vel, octave_double?]]`, `pad`, `stings`, `eq`, `auto_duck`.

## Sound-design-led mix (whatif tone, 006) — little or no music
- The **places** carry the sound: `city_day` split into a voices layer (`murmur 1, traffic 0`) and a traffic layer (`murmur 0`)
  so the crowd can go silent on a beat while the street keeps rumbling; `room_tone` indoors; `wind`, `dry_leaves`.
- Music = a pad bed only (`pad` level ~0.25, leveler `ratio 1.0`), ~9 dB under the ambience; piano `sections` start on the last
  beats. Stem gains that balanced it: `music -16, sfx -2, amb +4` → LRA ≈ 6–8 LU, every shot window −16…−19 LUFS, ending −13.
  Check the per-shot table: if the ending sits > 4 dB above the ladder (LRA > 12), pull the music stem down.
- New SFX: `car_horn` (`dur`, `pitch`, `distance` → darker + more verb). Use 1–2, far away, ≤ −31 dB.
- `car_crash` (`weight`): low thump + short crunch + rattles, low-passed (≈ −24…−29 dB). `distant_boom` (`size`): far
  explosion, soft onset, long outdoor tail (≈ −24 dB). A stuck horn (`car_horn` `dur 3.3`) after a crash sells the aftermath.
- Hums (`lamp_hum`) get loud fast — keep them ≤ −50 dB or they become the loudest thing in the shot (006 capsule hit −12.7 LUFS).
- Don't put an event at t < 0.03 s (verify() slices a window before the cue and crashes on an empty array).
- Generate the sheet with a script (`videos/006-memory-loss/make_cues.py`).
