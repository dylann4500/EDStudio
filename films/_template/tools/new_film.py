#!/usr/bin/env python3
"""Start a new film from the template.

    python3 films/_template/tools/new_film.py my-film        -> films/my-film/ (a copy of the template, ready to build)

It copies the template (code, cue sheet, asset list; never builds, frames or renders), names the film's Modal app and
volume film-<name> in farm.py, and prints the next steps. The example set (blender/set_table.py) and its three
shots come along so the copy builds and renders at once: replace them with your own film (docs/FILMS.md).
"""
import os
import re
import shutil
import sys

TEMPLATE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILMS = os.path.dirname(TEMPLATE)
SKIP = {"build", "frames", "out", "stills", "assets", "__pycache__", "raw", "lib", "music"}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    name = sys.argv[1].strip().lower()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", name):
        sys.exit("name: lowercase letters, digits and dashes (e.g. night-shift)")
    dest = os.path.join(FILMS, name)
    if os.path.exists(dest):
        sys.exit("%s already exists" % dest)
    shutil.copytree(TEMPLATE, dest, ignore=lambda d, fs: [f for f in fs if f in SKIP or f.endswith((".blend1", ".pyc"))])
    os.makedirs(os.path.join(dest, "sound", "music"), exist_ok=True)
    fp = os.path.join(dest, "farm.py")
    s = open(fp).read()
    s2 = re.sub(r'^FILM = "[^"]+"', 'FILM = "film-%s"' % name, s, count=1, flags=re.M)
    assert s2 != s, "farm.py has no FILM line"
    open(fp, "w").write(s2)
    print("NEW FILM %s" % dest)
    print("""next, from %s:
    python3 tools/fetch_assets.py              the scans (CC0, Poly Haven) into films/_assets
    python3 sound/fetch_lib.py                 the starter sound library (CC0)
    python3 tools/film.py build table          the example set; then: python3 tools/film.py sheet table --tag v1
then write your own film over it: timeline.py (the shot list), blender/set_<name>.py (one per set), sound/cues.json.
The method: docs/FILMS.md (in the repo root).""" % dest)


main()
