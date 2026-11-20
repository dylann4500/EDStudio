# Film template

The starting point for a photoreal film made from code: Blender 5.2 (Cycles) builds every scene from Python, Modal
(or this computer) renders 4K frames, Python mixes the sound and cuts the film. **The method is in
[`docs/FILMS.md`](../../docs/FILMS.md); read it first.**

Start a new film (never edit the template itself):

```bash
python3 films/_template/tools/new_film.py my-film
cd films/my-film
python3 tools/fetch_assets.py          # the example's scans (CC0, Poly Haven) into films/_assets
python3 sound/fetch_lib.py             # the starter sound library (CC0)
python3 tools/film.py build table      # build the example set (seconds)
python3 tools/film.py sheet table --tag v1      # quarter-size stills of every shot: look at stills/table/sheet_v1.jpg
```

The example is a wooden top spinning on a table at golden hour, three shots (`timeline.py`, `blender/set_table.py`).
It is there to show every technique in a few hundred lines; replace it with your own film:

1. `timeline.py`: your shot list, sets and cues (and the music, when you have it).
2. `blender/set_<name>.py`: one file per set, shaped like `set_table.py`.
3. `sound/cues.json` + `post/mix.py`'s `KINDS`: what the film sounds like.
4. `BRIEF.md` (write it): the contract for everyone building the film (docs/FILMS.md, section 13).

Then: `python3 tools/film.py sweep <set>` (things passing through or floating), `python3 tools/finish.py draft --pct 25`
(the whole film at quarter size), `python3 tools/finish.py final` (4K, mixed, cut and checked: `out/final.mp4`).

| File | What it is |
|---|---|
| `timeline.py` | the shot list and the clock (story, edit, music, cues) |
| `blender/core.py` | render settings, scanned/painted/metal/glass materials, meshes, lights, camera, the Baker |
| `blender/anim.py` | keyframes, eases, paths, hops, noise |
| `blender/set_table.py` | the example set |
| `tools/film.py` | build · stills · sheet · cuts · sweep · render (local) · push · pull |
| `tools/finish.py` | everything after the sets are right, unattended |
| `tools/motion.py` · `beats.py` · `sweep.py` | pace check · a music file's beats · the physics check (in Blender) |
| `tools/fetch_assets.py` · `new_film.py` · `render_blend.py` | scans · a new film · the in-Blender renderer |
| `farm.py` | the Modal render farm (`FILM` = this film's app and volume; a spending guard) |
| `post/mix.py` · `post/compose.py` | the sound mix · the edit and the film finish |
| `sound/` | the cue sheet, the starter library builder, the credits |
