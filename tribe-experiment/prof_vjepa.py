"""Profile one V-JEPA 2 clip on the Mac GPU with chunked attention, and check chunked == stock SDPA.

Usage: .venv/bin/python -u prof_vjepa.py <fp32|fp16>
"""
import sys
import time
import numpy as np
import torch
import mac_patches  # noqa: F401  (registers chunked attention)
from moviepy import VideoFileClip
from neuralset.extractors.video import _HFVideoModel
from neuralset.extractors.image import _fix_pixel_values

DT = torch.float16 if sys.argv[1] == "fp16" else torch.float32
m = _HFVideoModel(model_name="facebook/vjepa2-vitg-fpc64-256")
m.model.to("mps", dtype=DT)
print(f"dtype={m.model.dtype} attn={m.model.config._attn_implementation} weights alloc {torch.mps.current_allocated_memory()/1e9:.1f} GB", flush=True)
v = VideoFileClip("videos/012-pee-pants.mp4")
frames = np.array([v.get_frame(max(0, 6 - k / 64 * 4)) for k in reversed(range(64))]).astype("uint8")
inp = m.processor(videos=list(frames), return_tensors="pt")
_fix_pixel_values(inp)
inp = {k: x.to("mps", DT) for k, x in inp.items()}

# equivalence on a short 8-frame clip (1024 tokens), where stock SDPA is cheap
small = {k: x[:, :8] for k, x in inp.items()}
with torch.inference_mode():
    a = m.model(**small).last_hidden_state
    m.model.set_attn_implementation("sdpa")
    b = m.model(**small).last_hidden_state
    m.model.set_attn_implementation("chunked_sdpa")
    import mac_patches as mp; mp.Q_CHUNK = 256  # force several chunks on the short clip
    c = m.model(**small).last_hidden_state
    mp.Q_CHUNK = 512
print(f"max |chunked-sdpa| = {(c - b).abs().max().item():.2e} (scale {b.abs().max().item():.1f}); single-chunk diff {(a - b).abs().max().item():.2e}", flush=True)

for i in range(3):
    t0 = time.time()
    with torch.inference_mode():
        hs = m.predict_hidden_states(frames)
    torch.mps.synchronize()
    print(f"forward {time.time()-t0:.1f}s  peak-ish driver {torch.mps.driver_allocated_memory()/1e9:.1f} GB", flush=True)
    if i == 2:
        np.save(f"results/_prof_{sys.argv[1]}.npy", hs.float().cpu().numpy())
    del hs
