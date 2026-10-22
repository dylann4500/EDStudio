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

## Funny tone (002) — same softness, different timing
- `style: "bounce"` section = staccato "oom-pah" piano (short bass on 1+3, soft chord stabs on 2+4), `step` 0.5 s = 120 bpm.
- Melody entries take an optional 5th element = note length: `[t, midi, vel, false, 0.16]` → staccato motif.
- **Comedic silence:** a `music.ducks` entry `{t0, t1, db: -40, ramp: 0.05}` right before each punch line, then one soft low
  `stings` note (midi 36–41, vel ~0.33) as the button. Silence is funnier than any sound effect.
- Cartoon moment ("bellies pop"): 4–5 `plush_squeak` with `pitch` 0.55–0.8, −27 dB, staggered 60 ms — soft boops, not boings.
- Turn warm for the ending (arp + pad) so the last line lands sincerely.
- Ambience `city_day` (`murmur`, `traffic` args): far traffic rumble + indistinct crowd murmur, around −44 dB.
- Generate long cue sheets with a small script (`videos/002-everyone-pregnant/make_cues.py`) rather than hand-typing JSON.

## cues.json schema (short)
- `duration`, `target_lufs`, `stem_gain_db {music,sfx,amb}`, `sfx_lowpass_hz`
- `ambience`: `[{sound, t0, t1, fade_in, fade_out, gain_db, args?, seed?}]` — sounds: room_tone, city_day, crickets, clock, wind, dry_leaves, rain_window, sleigh_bells, lamp_hum
- `events`: `[{t, sound, args?, gain_db, pan, room?, hall?}]` — sounds: door_open, door_close, latch_click, footstep, floorboard_creak,
  blanket_rustle, mattress_sit, plush_pickup, plush_squeak, plush_place, phone_pickup, phone_set_down_wood, lamp_switch_click,
  counter_tick, gold_chime, whoosh_timeskip, flash_swish. Generators: `{sound: "footsteps", t0, t1, pan0, pan1, gain_db}`,
  `{sound: "tick_roll", t0, t1, peak_rate}`.
- `music`: `chords [[t, "F"], [t, "C/E"], ...]`, `sections [{t0, t1, style: held|arp|thin|pulse|swell|sparse|cadence|bounce, vel, ...}]`,
  `melody [[t, midi, vel, octave_double?]]`, `pad`, `stings`, `eq`, `auto_duck`.
