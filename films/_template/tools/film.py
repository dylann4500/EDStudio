#!/usr/bin/env python3
"""The film's command line (run from the film's folder, e.g. films/my-film).

    python3 tools/film.py build desk                 run blender/set_desk.py: build the set, bake every shot, save build/desk/desk.blend
    python3 tools/film.py stills desk A04@0.5 A05@1.2 [--pct 25] [--samples 32] [--tag look]
                                                     render moments (shot@seconds) to stills/desk/<tag>/
    python3 tools/film.py sheet desk [--per 3] [--shots A04,A05] [--pct 25] [--samples 32] [--tag v1]
                                                     every shot at `per` moments, on one labelled sheet: stills/desk/sheet_<tag>.jpg
    python3 tools/film.py cuts desk                  first and last frame of every shot, on one sheet (to check the cuts)
    python3 tools/film.py render <tag> [--sets a,b] [--pct 100] [--samples 0]
                                                     render every frame the edit shows on THIS computer (no Modal):
                                                     frames/<tag>/<set>/<frame>.jpg, skipping frames already there (slow:
                                                     about 2 min a 4K frame on an M5 Pro; a quarter-size draft is ~16x faster)
    python3 tools/film.py sweep desk [--shots A04] [--pile rug:7.5]
                                                     test every frame the film shows for things passing through each
                                                     other, sinking into or hovering over what they stand on (no render)
    python3 tools/film.py push desk|all              upload build/<set> to the Modal volume (lead only)
    python3 tools/film.py pull <tag> [set]           download the farm's frames for a tag (or one set of it) into frames/<tag>/ (lead only)

Local renders take a lock, so only ONE Blender renders on this Mac at a time (several at once froze the
reference film's Mac). Stills are quarter size and 32 samples by default: look at them, fix, repeat.
"""
import fcntl
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

BLENDER = os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender")
LOCK = "/tmp/edstudio-film-render.lock"           # one Blender rendering on this Mac at a time, whichever film it is
VOLUME = re.search(r'^FILM = "([^"]+)"', open(os.path.join(ROOT, "farm.py")).read(), re.M).group(1)    # the Modal volume: farm.py's FILM


def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def run(cmd, lock=False, keep=("RENDER", "FRAME", "BAKED", "SAVED", "WARNING", "Error", "Traceback", "  File", "error")):
    lf = None
    if lock:
        lf = open(LOCK, "w")
        fcntl.flock(lf, fcntl.LOCK_EX)
    try:
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, cwd=ROOT)
        tail = []
        for line in p.stdout:
            tail.append(line)
            tail = tail[-40:]
            if line.startswith(keep) or "Error" in line or "error:" in line:
                print(line.rstrip(), flush=True)
        if p.wait() != 0:
            print("".join(tail[-25:]))
            sys.exit("FAILED (exit %d): %s" % (p.returncode, " ".join(cmd[:6])))
    finally:
        if lf:
            fcntl.flock(lf, fcntl.LOCK_UN)
            lf.close()


def blend(set_name):
    p = os.path.join(ROOT, "build", set_name, set_name + ".blend")
    if not os.path.exists(p):
        sys.exit("no %s: run  python3 tools/film.py build %s" % (p, set_name))
    return p


def render(set_name, moments, tag, pct, samples):
    """moments = [(shot, seconds)]"""
    out = os.path.join(ROOT, "stills", set_name, tag)
    os.makedirs(out, exist_ok=True)
    frames, names = [], []
    for sid, t in moments:
        i = max(0, min(tl.frames(sid) - 1, int(round(t * tl.FPS))))
        frames.append(str(tl.bframe(sid, i)))
        names.append("%s_%.2f" % (sid, i / tl.FPS))
    run([BLENDER, "-b", blend(set_name), "-P", os.path.join(ROOT, "tools", "render_blend.py"), "--", "--frames", ",".join(frames),
         "--names", ",".join(names), "--out", out, "--pct", str(pct), "--samples", str(samples), "--stamp"], lock=True)
    return [os.path.join(out, n + ".jpg") for n in names]


def tile(files, out, cols):
    rows = (len(files) + cols - 1) // cols
    lst = out + ".txt"
    with open(lst, "w") as f:
        for p in files:
            f.write("file '%s'\nduration 1\n" % p)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", "scale=640:-1,tile=%dx%d:padding=4:color=black" % (cols, rows),
                    "-frames:v", "1", "-q:v", "3", out], check=True)
    os.remove(lst)
    print("SHEET", out)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cmd, set_name = sys.argv[1], sys.argv[2]
    pct, samples, tag = int(opt("--pct", "25")), int(opt("--samples", "32")), opt("--tag", "look")
    if cmd == "build":
        run([BLENDER, "-b", "-P", os.path.join(ROOT, "blender", "set_%s.py" % set_name), "--"] + sys.argv[3:])
    elif cmd == "stills":
        m = [(a.split("@")[0], float(a.split("@")[1])) for a in sys.argv[3:] if "@" in a]
        for p in render(set_name, m, tag, pct, samples):
            print("STILL", p)
    elif cmd in ("sheet", "cuts"):
        shots = opt("--shots")
        shots = shots.split(",") if shots else tl.shots_of(set_name)
        per = int(opt("--per", "3"))
        m = []
        for s in shots:
            d = tl.shot(s)[2]
            if cmd == "cuts":
                m += [(s, 0.0), (s, d)]
            else:
                m += [(s, d * (k + 0.5) / per) for k in range(per)]
        files = render(set_name, m, tag + ("_cuts" if cmd == "cuts" else "_sheet"), pct, samples)
        tile(files, os.path.join(ROOT, "stills", set_name, "%s_%s.jpg" % ("cuts" if cmd == "cuts" else "sheet", tag)), 2 if cmd == "cuts" else per)
    elif cmd == "sweep":
        p = subprocess.run([BLENDER, "-b", blend(set_name), "-P", os.path.join(ROOT, "tools", "sweep.py"), "--"] + sys.argv[3:], cwd=ROOT,
                           capture_output=True, text=True)
        out = [ln for ln in p.stdout.splitlines() if ln.startswith(("SWEEP", "PEN", "SNK", "HOV", "CAM", "STA", "GAP", "Traceback", "  File", "Error"))]
        print("\n".join(out))
        if p.returncode != 0:
            print(p.stdout[-3000:], p.stderr[-2000:])
            sys.exit("FAILED: sweep")
    elif cmd == "render":
        # the whole film (or some sets) on this computer: same frames and file names as the farm, so finish.py and
        # post/compose.py take them as they are. Here the second argument is the tag.
        tag, pct, samples = set_name, int(opt("--pct", "100")), int(opt("--samples", "0"))
        sets = opt("--sets")
        for s in (sets.split(",") if sets else tl.SETS):
            out = os.path.join(ROOT, "frames", tag, s)
            todo = [tl.bframe(sid, i) for sid in tl.shots_of(s) for i in tl.cut(sid)]
            todo = [f for f in todo if not os.path.exists(os.path.join(out, "%06d.jpg" % f))]
            if not todo:
                print("RENDERED %s: nothing to do" % s)
                continue
            args = ["--frames", ",".join(str(f) for f in todo), "--out", out, "--pct", str(pct)] + (["--samples", str(samples)] if samples else [])
            run([BLENDER, "-b", blend(s), "-P", os.path.join(ROOT, "tools", "render_blend.py"), "--"] + args, lock=True)
            print("RENDERED %s: %d frames -> %s" % (s, len(todo), out))
    elif cmd == "push":
        # upload a built set (its .blend, screens/ and events.json) to the farm's volume
        for s in (tl.SETS if set_name == "all" else [set_name]):
            blend(s)
            subprocess.run(["modal", "volume", "put", "--force", VOLUME, os.path.join(ROOT, "build", s), "/build/" + s], check=True)
            print("PUSHED", s)
    elif cmd == "pull":
        # download rendered frames for a tag (here the second argument is the tag): frames/<tag>/<set>/<frame>.jpg
        # a third word pulls only that set's frames: pull final camp
        one = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith("--") else None
        dest = os.path.join(ROOT, "frames", set_name) if one else os.path.join(ROOT, "frames")
        os.makedirs(dest, exist_ok=True)
        subprocess.run(["modal", "volume", "get", "--force", VOLUME, "/frames/" + set_name + ("/" + one if one else ""), dest], check=True)
        print("PULLED", os.path.join(ROOT, "frames", set_name, one or ""))
    else:
        sys.exit(__doc__)


main()
