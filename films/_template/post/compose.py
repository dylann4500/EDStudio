#!/usr/bin/env python3
"""The edit and the finish: frames from the farm -> one film file.

    python3 post/compose.py rough            # frames/rough/<set>/<frame>.jpg  -> out/rough.mp4
    python3 post/compose.py final --preview  # also out/final_1080.mp4 (small, for sending)
    options: --no-finish (clean frames, no grade)  --no-sound  --shots A01,A02 (only these, no cards)

The frames from Blender are clean. The finish gives them the small faults of a real camera: a warm glow round the
brightest areas (halation), a gentle S-curve, darker corners and fine grain that changes every frame. Then the film
fades up from black, the closing line sits over the last shot, and the picture cross-fades to the end card.
Missing frames are shown as black (and listed), so a rough cut with unfinished sets still has the right length.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

OUT = os.path.join(ROOT, "out")
CLOSING_IN, FADE_UP, FADE_OUT = 1.1, 0.5, 0.5        # closing line: seconds into the last shot; fades at head and tail


def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True)
    w, h = r.stdout.strip().split(",")[:2]
    return int(w), int(h)


def main():
    tag = sys.argv[1]
    only = opt("--shots")
    only = only.split(",") if only else None
    shots = [s[0] for s in tl.SHOTS if (not only or s[0] in only)]
    os.makedirs(OUT, exist_ok=True)
    # 1. the frame list, in film order
    files, missing, size = [], {}, None
    for sid in shots:
        set_name = tl.shot(sid)[1]
        for i in tl.cut(sid):                          # the edit: which rendered frames of the shot the film shows
            p = os.path.join(ROOT, "frames", tag, set_name, "%06d.jpg" % tl.bframe(sid, i))
            if os.path.exists(p):
                files.append(p)
                size = size or probe(p)
            else:
                files.append(None)
                missing[sid] = missing.get(sid, 0) + 1
    if size is None:
        sys.exit("no frames for tag '%s' in frames/%s/" % (tag, tag))
    W, H = size
    black = os.path.join(OUT, "_black_%dx%d.jpg" % (W, H))
    if not os.path.exists(black):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=black:s=%dx%d" % (W, H), "-frames:v", "1", black], check=True)
    lst = os.path.join(OUT, "_%s_frames.txt" % tag)
    with open(lst, "w") as f:
        for p in files:
            f.write("file '%s'\nduration %.8f\n" % (p or black, 1.0 / tl.FPS))
        f.write("file '%s'\n" % (files[-1] or black))
    n = len(files)
    film = n / tl.FPS
    for sid, k in missing.items():
        print("MISSING %s: %d of %d frames (black)" % (sid, k, len(tl.cut(sid))))

    # 2. the finish
    finish = "--no-finish" not in sys.argv
    cards = only is None
    closing = os.path.join(OUT, "cards", "closing.png")
    endcard = os.path.join(OUT, "cards", "endcard.png")
    have_closing, have_end = cards and os.path.exists(closing), cards and os.path.exists(endcard)
    inputs = ["-f", "concat", "-safe", "0", "-i", lst]
    fc = []
    v = "[0:v]fps=%d,format=gbrp" % tl.FPS
    if finish:
        sig = max(2.0, W * 0.010)
        fc.append(v + ",split=2[base][hl]")
        fc.append("[hl]lutrgb=r='clip((val-185)*3.6,0,255)':g='clip((val-185)*3.6,0,255)':b='clip((val-185)*3.6,0,255)',gblur=sigma=%.1f,colorchannelmixer=rr=1.0:gg=0.82:bb=0.62[glow]" % sig)
        fc.append("[base][glow]blend=all_mode=screen:all_opacity=0.34[v1]")
        fc.append("[v1]curves=all='0/0 0.20/0.175 0.50/0.50 0.80/0.83 1/1',vignette=angle=0.42,format=yuv444p,noise=c0s=6:c0f=t+u:c1s=2:c1f=t+u:c2s=2:c2f=t+u[v2]")
    else:
        fc.append(v + "[v2]")
    cur = "[v2]"
    k = 1
    last = shots[-1]
    t_last = sum(len(tl.cut(s)) for s in shots[:-1]) / tl.FPS
    if have_closing:
        inputs += ["-loop", "1", "-t", "%.3f" % film, "-i", closing]
        t0 = t_last + CLOSING_IN
        # the line leaves before the cross-fade into the end card, which carries the same words: no double exposure
        gone = ",fade=t=out:st=%.3f:d=0.40:alpha=1" % (film - tl.XFADE - 0.40) if have_end else ""
        fc.append("[%d:v]scale=%d:%d,format=rgba,fade=t=in:st=%.3f:d=0.6:alpha=1%s[cl]" % (k, W, H, t0, gone))
        fc.append("%s[cl]overlay=0:0:enable='gte(t,%.3f)'[v3]" % (cur, t0))
        cur = "[v3]"
        k += 1
    total = film
    if have_end:
        inputs += ["-loop", "1", "-t", "%.3f" % (tl.END_CARD + 0.1), "-i", endcard]
        fc.append("[%d:v]scale=%d:%d,fps=%d,format=yuv444p,trim=duration=%.3f,setpts=PTS-STARTPTS[ec]" % (k, W, H, tl.FPS, tl.END_CARD))
        fc.append("%sformat=yuv444p,trim=duration=%.3f,setpts=PTS-STARTPTS[fm]" % (cur, film))
        fc.append("[fm][ec]xfade=transition=fade:duration=%.3f:offset=%.3f[v4]" % (tl.XFADE, film - tl.XFADE))
        cur = "[v4]"
        total = film + tl.END_CARD - tl.XFADE
        k += 1
    if cards:
        fc.append("%sfade=t=in:st=0:d=%.2f,fade=t=out:st=%.3f:d=%.2f[v5]" % (cur, FADE_UP, total - FADE_OUT, FADE_OUT))
        cur = "[v5]"
    fc.append("%sformat=yuv420p[vout]" % cur)
    mix = os.path.join(OUT, "mix.wav")
    sound = cards and os.path.exists(mix) and "--no-sound" not in sys.argv
    out = os.path.join(OUT, "%s%s.mp4" % (tag, "" if cards else "_" + "_".join(shots[:3])))
    cmd = ["ffmpeg", "-v", "error", "-stats", "-y"] + inputs
    if sound:
        cmd += ["-i", mix]
    cmd += ["-filter_complex", ";".join(fc), "-map", "[vout]"]
    if sound:
        # the mix's wooden knocks overshoot by about 1.7 dB when AAC rebuilds them: 1 dB of room keeps the encoded
        # film's true peak under 0 dBFS (measured: -0.4 dBFS, -17.4 LUFS)
        cmd += ["-map", "%d:a" % k, "-c:a", "aac", "-b:a", "256k", "-af", "volume=-1.0dB,afade=t=out:st=%.3f:d=%.2f" % (total - FADE_OUT, FADE_OUT)]
    big = W >= 3000                                   # film grain is expensive to encode: cap the master's bitrate
    cmd += ["-t", "%.3f" % total, "-r", str(tl.FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "16"] + (["-maxrate", "60M", "-bufsize", "120M"] if big else []) + ["-pix_fmt", "yuv420p",
            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print("FILM %s  %.1f s  %dx%d  %.1f MB%s" % (out, total, W, H, os.path.getsize(out) / 1e6, "" if sound else "  (no sound)"))
    if "--preview" in sys.argv:
        small = out.replace(".mp4", "_1080.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", "scale=1920:-2:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "16M", "-bufsize", "32M",
                        "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", small], check=True)
        print("PREVIEW %s  %.1f MB" % (small, os.path.getsize(small) / 1e6))
        tiny = out.replace(".mp4", "_phone.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", "scale=1280:-2:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-b:v", "520k", "-maxrate", "700k", "-bufsize", "1400k",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-af", "volume=-1.5dB", "-movflags", "+faststart", tiny], check=True)   # (96k AAC overshoots: keep it under 0 dBFS)
        print("PHONE %s  %.1f MB" % (tiny, os.path.getsize(tiny) / 1e6))


main()
