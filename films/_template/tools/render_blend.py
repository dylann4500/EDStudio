"""Runs INSIDE Blender on an opened set file: render some frames.

    Blender -b build/desk/desk.blend -P tools/render_blend.py -- --frames 1000,1012,2000-2010 --out DIR
            [--pct 25] [--samples 32] [--stamp] [--names A01_0.50,...] [--device METAL|OPTIX|CUDA|CPU]
"""
import os
import sys
import time

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "blender"))
import core  # noqa: E402


def arg(name, default=None):
    a = sys.argv[sys.argv.index("--") + 1:]
    return a[a.index(name) + 1] if name in a else default


def flag(name):
    return name in sys.argv[sys.argv.index("--") + 1:]


def main():
    sc = bpy.context.scene
    frames = []
    for part in arg("--frames").split(","):
        if "-" in part:
            a, b = part.split("-")
            frames += list(range(int(a), int(b) + 1))
        else:
            frames.append(int(part))
    names = arg("--names")
    names = names.split(",") if names else None
    out = arg("--out")
    os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = int(arg("--pct", "100"))
    if arg("--samples"):
        sc.cycles.samples = int(arg("--samples"))
    dev = core.pick_device(sc, arg("--device"))
    if flag("--stamp"):
        r = sc.render
        r.use_stamp = True
        for k in ("date", "time", "render_time", "frame", "frame_range", "memory", "hostname", "camera", "lens", "scene", "marker", "filename", "sequencer_strip"):
            if hasattr(r, "use_stamp_" + k):
                setattr(r, "use_stamp_" + k, False)
        r.use_stamp_note = True
        r.stamp_font_size = max(10, int(26 * sc.render.resolution_percentage / 25 * 0.55))
        r.stamp_background = (0, 0, 0, 0.6)
    print("RENDER device", dev, "frames", len(frames), "pct", sc.render.resolution_percentage, "samples", sc.cycles.samples, flush=True)
    for i, f in enumerate(frames):
        name = names[i] if names else "%06d" % f
        sc.frame_set(f)
        if flag("--stamp"):
            sc.render.stamp_note_text = name
        sc.render.filepath = os.path.join(out, name + ".jpg")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print("FRAME %s %d %.1fs" % (name, f, time.time() - t), flush=True)


main()
