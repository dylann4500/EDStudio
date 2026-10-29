#!/usr/bin/env python3
"""Camera speed of a rendered reel, measured on the PIXELS (not the camera keys) — the manager's "≤ ~2.2 frame widths/s" rule (041).

Phase correlation between consecutive frames (grey, 360x640) over four FULL-WIDTH bands that skip the caption row; the MEDIAN band
shift is the camera's image motion. Full-width bands matter: 041 r3's first version used 60 px blocks, which stop matching on fast
pans (the shift leaves the block) and under-read the worst moves by ~2x (the r4 camera reviewer's wide search found 7 windows over
2.2 that the block version called 1.7 max). Calibration: 039 (the reference cut) tops out at ~1.87 fw/s after its opener, 0 windows
over 2.2. It can't see zooms/dollies toward the lens or orbits around a held subject — judge those from the QC `cams:` line.
  python3 -I tools/flow.py video.mp4 [fps] [--top=N] [--from=SECONDS] [--save]
Prints the top N 0.5 s windows by net speed (direction-consistent) and by path speed (sum of |motion|), and the count over 2.2.
"""
import os, shutil, subprocess, sys, numpy as np

FF = shutil.which('ffmpeg') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'node_modules', '@ffmpeg-installer', 'darwin-arm64', 'ffmpeg')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
video, fps = args[0], int(args[1]) if len(args) > 1 else 30
opt = lambda k, d: next((a.split('=')[1] for a in sys.argv if a.startswith(f'--{k}=')), d)
top, t_from = int(opt('top', 8)), float(opt('from', 0))
W, H = 360, 640
raw = subprocess.run([FF, '-v', 'error', '-i', video, '-vf', f'fps={fps},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
BANDS = [(40, 180), (180, 300), (330, 470), (480, 620)]   # the centred one-word caption sits at ~300-330
win = {b: np.outer(np.hanning(b[1] - b[0]), np.hanning(W)).astype(np.float32) for b in BANDS}
rows, prev = [], None
for i, f in enumerate(F):
    cur = []
    for b in BANDS:
        g = f[b[0]:b[1]]; g = (g - g.mean()) * win[b]; cur.append((np.fft.fft2(g), g.std()))
    if prev is not None:
        ds = []
        for (G, sd), (P, sd0) in zip(cur, prev):
            if sd < 2 or sd0 < 2: continue   # a flat band (sky, wall): nothing to match
            R = G * np.conj(P); R /= np.abs(R) + 1e-6; r = np.fft.ifft2(R).real
            y, x = np.unravel_index(np.argmax(r), r.shape)
            if r[y, x] < 0.06: continue
            if x > W / 2: x -= W
            if y > r.shape[0] / 2: y -= r.shape[0]
            ds.append((x, y))
        rows.append((i / fps, *(np.median(np.array(ds, float), axis=0) / W if ds else (0.0, 0.0)), len(ds)))
    prev = cur
R = np.array(rows)
t, dx, dy, n = R.T
N = fps // 2
net = np.hypot(np.convolve(dx, np.ones(N), 'valid'), np.convolve(dy, np.ones(N), 'valid')) / 0.5
path = np.convolve(np.hypot(dx, dy), np.ones(N), 'valid') / 0.5
ok = t[:len(net)] >= t_from
def tops(v, label):
    idx = np.argsort(-np.where(ok, v, -1)); seen = []
    print(f'--- top {top} 0.5 s windows by {label} (frame widths/s)')
    for j in idx:
        if any(abs(t[j] - s) < 0.7 for s in seen): continue
        seen.append(t[j]); print(f'  {t[j]:6.2f}-{t[j] + 0.5:6.2f}  net {net[j]:.2f}  path {path[j]:.2f}  bands {n[j:j + N].mean():.1f}')
        if len(seen) >= top: break
tops(net, 'net'); tops(path, 'path')
print(f'windows > 2.2 fw/s net: {int(((net > 2.2) & ok).sum())} of {int(ok.sum())}')
if '--save' in sys.argv: np.save(os.path.basename(video).replace('.mp4', '') + '_flow.npy', R)
