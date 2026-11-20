"""The render farm on Modal: every final frame, and the quarter-size rough cut.

    modal run farm.py --sets table --pct 25 --samples 48 --tag draft         # one or more sets, comma separated
    modal run farm.py --sets all --tag final                                  # 4K, each set's own sample count
    modal run farm.py --sets table --shots S02,S03 --tag final                # only some shots (a re-render)
    python3 tools/film.py push table       # upload build/table to the volume (do this first, after every build)
    python3 tools/film.py pull final       # download frames/<tag> into frames/<tag>/
(python3 tools/finish.py does all of it.) Only the frames the edit shows are rendered (--all-frames: whole shots).

Each container opens one set's .blend once and renders a chunk of its frames (every Nth frame of the set, so a
container that dies loses only its share). Frames already on the volume are skipped, so a re-run only fills gaps;
pass --redo to render them again. At most 10 GPUs run at once (raise max_containers if your account allows more).

A spending guard reads the account's bill before starting and refuses to run past LIMIT_METERED.
"""
import json
import os
import subprocess
import sys
import time

import modal

FILM = "film-template"                    # this film's Modal app and volume (tools/new_film.py sets it to film-<folder>)
APP = VOLUME = FILM
LIMIT_METERED = float(os.environ.get("FILM_LIMIT_METERED", "320"))   # the spending guard: no run starts once the account's metered bill this cycle is past this ($)

app = modal.App(APP)
vol = modal.Volume.from_name(VOLUME, create_if_missing=True)
image = (
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("xorg", "libxkbcommon0", "libgl1", "libegl1", "libsm6")
    .uv_pip_install("bpy==5.2.1")
)

_loaded = {}


def _render(set_name, frames, pct, samples, tag, redo, threshold):
    import bpy

    t0 = time.time()
    vol.reload()
    out = "/vol/frames/%s/%s" % (tag, set_name)
    os.makedirs(out, exist_ok=True)
    todo = [f for f in frames if redo or not os.path.exists("%s/%06d.jpg" % (out, f))]
    if not todo:
        return {"set": set_name, "rendered": 0, "skipped": len(frames), "seconds": 0, "per_frame": 0, "gpu": ""}
    blend = "/vol/build/%s/%s.blend" % (set_name, set_name)
    stamp = os.path.getmtime(blend)
    if _loaded.get("key") != (set_name, stamp):
        bpy.ops.wm.open_mainfile(filepath=blend)
        _loaded["key"] = (set_name, stamp)
    sc = bpy.context.scene
    prefs = bpy.context.preferences.addons["cycles"].preferences
    backend = "CPU"
    for b in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = b
            prefs.refresh_devices()
        except Exception:
            continue
        if any(d.type == b for d in prefs.devices):
            for d in prefs.devices:
                d.use = d.type == b
            sc.cycles.device = "GPU"
            backend = b
            break
    if backend == "CPU":
        raise RuntimeError("no GPU device in this container")
    sc.render.resolution_percentage = pct
    if samples:
        sc.cycles.samples = samples
    if threshold:
        sc.cycles.adaptive_threshold = threshold
    sc.render.use_persistent_data = True
    sc.render.use_stamp = False
    times = []
    for i, f in enumerate(todo):
        t1 = time.time()
        sc.frame_set(f)
        sc.render.filepath = "%s/%06d.jpg" % (out, f)
        bpy.ops.render.render(write_still=True)
        times.append(time.time() - t1)
        if i % 8 == 7:
            vol.commit()
    vol.commit()
    gpu = ""
    try:
        gpu = subprocess.run(["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"], capture_output=True, text=True, timeout=20).stdout.strip()
    except Exception:
        pass
    warm = sorted(times)[len(times) // 2]
    print("DONE %s %d frames, median %.1fs, %s %s" % (set_name, len(todo), warm, backend, gpu), flush=True)
    return {"set": set_name, "rendered": len(todo), "skipped": len(frames) - len(todo), "seconds": round(time.time() - t0, 1), "per_frame": round(warm, 2), "gpu": gpu + " " + backend}


COMMON = dict(image=image, volumes={"/vol": vol}, timeout=90 * 60, cpu=4, memory=24576, retries=2)


@app.function(gpu="L40S", max_containers=10, **COMMON)
def render_l40s(set_name, frames, pct, samples, tag, redo=False, threshold=0.0):
    return _render(set_name, frames, pct, samples, tag, redo, threshold)


@app.function(gpu="RTX-PRO-6000", max_containers=10, **COMMON)
def render_pro(set_name, frames, pct, samples, tag, redo=False, threshold=0.0):
    return _render(set_name, frames, pct, samples, tag, redo, threshold)


def metered():
    r = subprocess.run(["modal", "billing", "summary", "--json"], capture_output=True, text=True)
    return float(json.loads(r.stdout)["metered_cost"])


@app.local_entrypoint()
def main(sets: str = "all", tag: str = "rough", pct: int = 100, samples: int = 0, shots: str = "", gpu: str = "L40S", chunk: int = 20,
         redo: bool = False, threshold: float = 0.0, workers: int = 10, all_frames: bool = False):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import timeline as tl

    spent = metered()
    print("account metered this cycle: $%.2f (limit for this film: $%.0f)" % (spent, LIMIT_METERED))
    if spent >= LIMIT_METERED:
        raise SystemExit("spending guard: not starting")
    names = tl.SETS if sets == "all" else sets.split(",")
    only = set(shots.split(",")) if shots else None
    fn = render_pro if gpu.upper().startswith("RTX") or gpu.lower() == "pro" else render_l40s
    jobs, total = [], 0
    for s in names:
        fr = []
        for sid in tl.shots_of(s):
            if only and sid not in only:
                continue
            # only the frames the edit shows (timeline.EDIT trims heads and tails); --all-frames renders whole shots
            idx = range(tl.frames(sid)) if all_frames else tl.cut(sid)
            fr += [tl.bframe(sid, i) for i in idx]
        if not fr:
            continue
        total += len(fr)
        n = max(1, min(workers, (len(fr) + chunk - 1) // chunk))
        strides = [fr[k::n] for k in range(n)]                    # every Nth frame per worker
        for st in strides:
            for a in range(0, len(st), chunk):
                jobs.append((s, st[a:a + chunk], pct, samples, tag, redo, threshold))
    print("%d frames in %d jobs on %s, tag '%s', %d%% size, samples %s" % (total, len(jobs), gpu, tag, pct, samples or "per set"))
    t0 = time.time()
    done = rendered = 0
    gpu_s = 0.0
    for res in fn.starmap(jobs, order_outputs=False, return_exceptions=True):
        done += 1
        if isinstance(res, Exception):
            print("JOB FAILED:", repr(res)[:300])
            continue
        rendered += res["rendered"]
        gpu_s += res["seconds"]
        print("[%3d/%d] %-5s +%d frames  %.1fs/frame  %s  (%.0fs elapsed)" % (done, len(jobs), res["set"], res["rendered"], res["per_frame"], res["gpu"], time.time() - t0), flush=True)
    rate = 3.03 if fn is render_pro else 1.95
    print("FARM DONE: %d frames rendered in %.1f min wall, %.2f GPU-hours, about $%.2f (GPU only)" % (rendered, (time.time() - t0) / 60, gpu_s / 3600, gpu_s / 3600 * (rate + 0.38)))
