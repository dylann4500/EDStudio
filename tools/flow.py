#!/usr/bin/env python3
"""Camera speed of a rendered reel, measured on the PIXELS (not the camera keys) — the manager's "≤ ~2.2 frame widths/s" rule (041).

Per-block phase correlation between consecutive frames (grey, 180x320, 3 x 5 blocks, Hann window); the MEDIAN block motion is the
camera's image motion, so static captions/callouts (a minority of blocks) don't count. Calibration: 039 (the reference cut) tops out
at 1.73 fw/s with 0 windows > 2.2. Camera-key math (rail.py-style) is useless after a parked-frame ride (the flight), this isn't.
Output: per-frame dx, dy in frame WIDTHS per frame; then 0.5 s windows in frame widths per second.
  python3 -I tools/flow.py video.mp4 [fps] [--top=N] [--save]
Prints the top N 0.5 s windows by path speed (sum of |motion|) and by net speed (direction-consistent), plus near-static runs.
"""
import subprocess, sys, numpy as np

import os, shutil
FF = shutil.which('ffmpeg') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'node_modules', '@ffmpeg-installer', 'darwin-arm64', 'ffmpeg')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
video, fps = args[0], int(args[1]) if len(args) > 1 else 30
top = int(next((a.split('=')[1] for a in sys.argv if a.startswith('--top=')), 8))
W, H = 180, 320
raw = subprocess.run([FF, '-v', 'error', '-i', video, '-vf', f'fps={fps},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
BW, BH = 60, 64   # 3 x 5 blocks: the median block motion ignores the static caption/callouts (they are a minority of blocks)
bwin = np.outer(np.hanning(BH), np.hanning(BW)).astype(np.float32)
def sub(a, b, c): d = a - 2 * b + c; return 0.0 if abs(d) < 1e-9 else 0.5 * (a - c) / d
def blocks(f):
    out = []
    for by in range(0, H - BH + 1, BH):
        for bx in range(0, W - BW + 1, BW):
            g = f[by:by + BH, bx:bx + BW]; g = (g - g.mean()) * bwin; out.append((np.fft.fft2(g), g.std()))
    return out
rows = []
prev = None
for i, f in enumerate(F):
    cur = blocks(f)
    if prev is not None:
        ds = []
        for (G, sd), (P, sd0) in zip(cur, prev):
            if sd < 2 or sd0 < 2: continue   # flat sky/wall: no texture to match
            Rr = G * np.conj(P); Rr /= np.abs(Rr) + 1e-6
            r = np.fft.ifft2(Rr).real
            y, x = np.unravel_index(np.argmax(r), r.shape)
            if r[y, x] < 0.08: continue
            dx = x + sub(r[y, (x - 1) % BW], r[y, x], r[y, (x + 1) % BW]); dy = y + sub(r[(y - 1) % BH, x], r[y, x], r[(y + 1) % BH, x])
            if dx > BW / 2: dx -= BW
            if dy > BH / 2: dy -= BH
            ds.append((dx, dy))
        if ds:
            d = np.array(ds); mx, my = np.median(d[:, 0]), np.median(d[:, 1])
            rows.append((i / fps, mx / W, my / W, len(ds)))
        else: rows.append((i / fps, 0.0, 0.0, 0))
    prev = cur
R = np.array(rows)
t, dx, dy, pk = R.T
N = fps // 2
path = np.convolve(np.hypot(dx, dy), np.ones(N), 'valid') / 0.5
nx = np.convolve(dx, np.ones(N), 'valid') / 0.5; ny = np.convolve(dy, np.ones(N), 'valid') / 0.5
net = np.hypot(nx, ny)
def tops(v, label):
    idx = np.argsort(-v); seen = []
    print(f'--- top {top} 0.5 s windows by {label} (frame widths/s)')
    for j in idx:
        if any(abs(t[j] - s) < 0.7 for s in seen): continue
        seen.append(t[j]); print(f'  {t[j]:6.2f}-{t[j] + 0.5:6.2f}  {label} {v[j]:.2f}  (net {net[j]:.2f}, path {path[j]:.2f}, blocks {pk[j:j + N].mean():.1f})')
        if len(seen) >= top: break
tops(net, 'net'); tops(path, 'path')
print(f'windows > 2.2 fw/s net: {int((net > 2.2).sum())} of {len(net)}; > 2.2 path: {int((path > 2.2).sum())}')
st = path < 0.03; runs = []; a = None
for j in range(len(st)):
    if st[j] and a is None: a = j
    if (not st[j] or j == len(st) - 1) and a is not None:
        if t[j] - t[a] > 0.1: runs.append((round(t[a], 2), round(t[j] + 0.5, 2)))
        a = None
print('near-static (0.5 s windows with path < 0.03 fw/s):', runs)
if '--save' in sys.argv: np.save(video.rsplit('/', 1)[-1].replace('.mp4', '') + '_flow.npy', R)
