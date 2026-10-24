"""Low-level stimulus stats per video (confound check): motion energy, brightness, cut rate, audio loudness.

Usage: .venv/bin/python low_level.py   -> results/lowlevel.csv + results/lowlevel_ts.npz (per-second series)
Frames are decoded at 5 fps, 54x96 grayscale; audio as 16 kHz mono.
"""
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
W, H, FPS, SR = 54, 96, 5, 16000


def frames(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"fps={FPS},scale={W}:{H},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


def audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


rows, series = [], {}
for p in sorted((HERE / "videos").glob("*.mp4")):
    f = frames(p)
    d = np.abs(np.diff(f, axis=0)).mean((1, 2))  # mean abs frame difference, per 0.2 s
    a = audio(p)
    rms = np.sqrt(np.mean(a[: len(a) // SR * SR].reshape(-1, SR) ** 2, axis=1))  # per second
    n = len(rms)  # whole seconds
    per_s = lambda x: np.array([x[i * FPS:(i + 1) * FPS].mean() for i in range(n)])  # noqa: E731
    series[p.stem] = np.stack([per_s(f.mean((1, 2))), per_s(np.r_[0, d]), 20 * np.log10(rms + 1e-9)])
    rows.append({
        "slug": p.stem, "duration_s": len(a) / SR,
        "motion_energy": d.mean(), "cuts_per_min": (d > 25).sum() / (len(a) / SR) * 60,
        "brightness": f.mean(), "audio_rms_db": 20 * np.log10(rms.mean() + 1e-9),
        "audio_dynamics_db": 20 * np.log10((np.percentile(rms, 95) + 1e-9) / (np.percentile(rms, 10) + 1e-9)),
    })
df = pd.DataFrame(rows)
df.to_csv(HERE / "results/lowlevel.csv", index=False, float_format="%.4g")
np.savez(HERE / "results/lowlevel_ts.npz", **series)  # each (3, seconds): brightness, motion, loudness dB
print(df.to_string(index=False))
