#!/usr/bin/env python3
"""Everything from built sets to the finished 4K film, unattended and safe to run again.

    python3 tools/finish.py [tag]          default tag: final       (log: out/_finish_<tag>.log)
    python3 tools/finish.py final --from render      skip the rebuild and upload (steps: build, render, pull, cut)
    python3 tools/finish.py draft --pct 25           a quarter-size draft of the whole film (Modal; ~1/16 of the cost)
    python3 tools/finish.py final --local            render on this computer instead of Modal (slow: see tools/film.py render)

1. build + upload every set   2. render every shot at 4K on Modal under <tag> (frames already on the volume under
that tag are skipped, so a run that died is simply started again)   3. download the frames   4. the sound mix
5. the edit: out/<tag>.mp4 (4K), _1080.mp4, _phone.mp4   6. checks: missing frames, motion per shot, loudness, a sheet.
Nothing here needs a person or a model; it stops at the first step that fails and says which.
"""
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

VALUED = ("--from", "--pct")
tag = next((a for k, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and sys.argv[k - 1] not in VALUED), "final")
LOCAL = "--local" in sys.argv
PCT = sys.argv[sys.argv.index("--pct") + 1] if "--pct" in sys.argv else "100"
start = sys.argv[sys.argv.index("--from") + 1] if "--from" in sys.argv else "build"
STEPS = ["build", "render", "pull", "cut"]
LOG = os.path.join(ROOT, "out", "_finish_%s.log" % tag)
os.makedirs(os.path.dirname(LOG), exist_ok=True)


def say(msg):
    line = "%s  %s" % (time.strftime("%H:%M:%S"), msg)
    print(line, flush=True)
    with open(LOG, "a") as f:
        f.write(line + "\n")


def run(cmd, tail=3, stream=False):
    """Run a step; its last `tail` lines go to the log (every line as it comes when stream is set: the farm)."""
    say("$ " + " ".join(cmd))
    p = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    out = []
    for ln in p.stdout:
        ln = ln.rstrip("\n")
        out.append(ln)
        if stream and ln.strip():
            with open(LOG, "a") as f:
                f.write("    | " + ln[:220] + "\n")
    p.wait()
    if not stream:
        for ln in out[-tail:]:
            say("    " + ln[:220])
    if p.returncode != 0:
        say("FAILED (exit %d): %s" % (p.returncode, " ".join(cmd)))
        sys.exit(1)
    return out


def main():
    k0 = STEPS.index(start)
    if k0 <= 0:
        for s in tl.SETS:
            run(["python3", "tools/film.py", "build", s], 2)
            if not LOCAL:
                run(["python3", "tools/film.py", "push", s], 1)
    if k0 <= 1:
        if LOCAL:
            out = run(["python3", "tools/film.py", "render", tag, "--pct", PCT], 3, stream=True)
        else:
            out = run(["modal", "run", "farm.py", "--sets", "all", "--tag", tag] + (["--pct", PCT, "--samples", "48"] if PCT != "100" else []), 2, stream=True)
        bad = [ln for ln in out if "JOB FAILED" in ln or "spending guard" in ln]
        done = [ln for ln in out if "FARM DONE" in ln]
        for ln in bad + done:
            say("    " + ln[:220])
        if bad:
            say("FAILED: the farm reported failed jobs; run this script again with --from render")
            sys.exit(1)
    if k0 <= 2:
        if not LOCAL:
            run(["python3", "tools/film.py", "pull", tag], 1)
        miss = []
        for s in tl.SHOTS:
            for i in tl.cut(s[0]):
                if not os.path.exists(os.path.join(ROOT, "frames", tag, s[1], "%06d.jpg" % tl.bframe(s[0], i))):
                    miss.append((s[0], i))
        say("frames the cut needs that are missing: %d %s" % (len(miss), miss[:8]))
        if miss:
            say("FAILED: missing frames; run again with --from render")
            sys.exit(1)
    run(["python3", "post/mix.py"], 3)
    run(["python3", "post/compose.py", tag, "--preview"], 3)
    film = os.path.join("out", "%s.mp4" % tag)
    for ln in run(["python3", "tools/motion.py", tag], 2):
        if "below 6" in ln:
            say("    " + ln)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", film, "-af", "ebur128=peak=true", "-f", "null", "-"], cwd=ROOT, capture_output=True, text=True)
    for ln in r.stderr.splitlines():
        if ln.strip().startswith(("I:", "Peak:")):
            say("    loudness " + ln.strip())
    os.makedirs(os.path.join(ROOT, "stills", tag), exist_ok=True)
    rows = max(1, -(-int(2 * (tl.film_frames() / tl.FPS + tl.END_CARD) + 1) // 12))      # two frames a second, twelve to a row
    run(["ffmpeg", "-v", "error", "-y", "-i", film, "-vf", "fps=2,scale=320:-2,tile=12x%d" % rows, "-frames:v", "1", "-q:v", "3", os.path.join("stills", tag, "whole_2fps.jpg")], 1)
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_name,width,height,r_frame_rate", "-of", "default=nw=1", film], cwd=ROOT, capture_output=True, text=True)
    say("    " + " ".join(r.stdout.split()))
    say("DONE  %s  (+ _1080.mp4, _phone.mp4)   sheet: stills/%s/whole_2fps.jpg" % (film, tag))


main()
