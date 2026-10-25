"""Make TRIBE v2's encoders run on an Apple Silicon GPU (MPS) inside ~8 GB, without editing tribev2/neuralset.

Import this before building the model. It changes HOW features are computed, never WHAT:
- chunked attention: torch 2.6's MPS SDPA materializes the full fp32 attention matrix (22 heads x 8192^2 tokens
  = 6 GB per V-JEPA 2 layer) and pushed a 24 GB Mac deep into swap. Softmax is per query row, so splitting the
  queries into chunks gives the same result with ~0.7 GB per chunk.
- token mean first: TRIBE keeps only the token-mean of each V-JEPA 2 layer (token_aggregation: mean), so we average
  each layer before stacking instead of stacking 41 x 8192 x 1408 floats (3.8 GB) and averaging after.
- fp16 V-JEPA 2: on one test clip, fp16 token-mean features matched fp32 with correlation 0.999997 on every layer
  (max relative error 0.09%), at half the memory (4.8 vs 9.7 GB) and ~1.5-2x the speed.
- per-clip cache (cache/clipcache/): identical 64-frame clips across versions of a video are encoded once.
"""
import hashlib
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from transformers import AttentionInterface

from neuralset.extractors import video as ns_video

Q_CHUNK = 512
VJEPA_DTYPE = torch.float16


def chunked_sdpa(module, query, key, value, attention_mask, scaling=None, dropout=0.0, is_causal=None, **_):
    """Drop-in for transformers' sdpa_attention_forward for non-causal, unmasked encoders (V-JEPA 2)."""
    if attention_mask is not None or (is_causal if is_causal is not None else getattr(module, "is_causal", False)):
        raise ValueError("chunked_sdpa only supports unmasked, non-causal attention")
    out = torch.cat([F.scaled_dot_product_attention(query[:, :, i:i + Q_CHUNK], key, value, scale=scaling)
                     for i in range(0, query.shape[2], Q_CHUNK)], dim=2)
    return out.transpose(1, 2).contiguous(), None


AttentionInterface.register("chunked_sdpa", chunked_sdpa)

_orig_init = ns_video._HFVideoModel.__init__


def _init(self, *a, **kw):
    _orig_init(self, *a, **kw)
    if "vjepa2" in self.model_name:
        self.model.set_attn_implementation("chunked_sdpa")
        self.model.to(dtype=VJEPA_DTYPE)
        # the processor returns float32 pixels: cast them to the model's dtype on the way in
        self.model.register_forward_pre_hook(
            lambda mod, a, kw: (a, {k: v.to(VJEPA_DTYPE) if torch.is_tensor(v) and v.is_floating_point() else v
                                    for k, v in kw.items()}), with_kwargs=True)


CLIP_CACHE = Path(__file__).resolve().parent / "cache" / "clipcache"


def _predict_hidden_states(self, images, audio=None):
    if "vjepa2" not in self.model_name:
        return _orig_phs(self, images, audio)
    # per-clip cache keyed by the frames themselves: when a new version of a video changes only a few beats, every 64-frame
    # clip that is byte-identical to an earlier version (sampled every 4th pixel) is reused instead of re-encoded
    key = hashlib.sha1(np.ascontiguousarray(np.asarray(images)[:, ::4, ::4]).tobytes()).hexdigest()
    f = CLIP_CACHE / f"{key}.npy"
    if f.exists():
        return torch.from_numpy(np.load(f))
    states = self.predict(images, audio).hidden_states  # each (B, tokens, D)
    out = torch.cat([x.mean(1, keepdim=True, dtype=torch.float32).unsqueeze(1) for x in states], 1)  # (B, L, 1, D)
    CLIP_CACHE.mkdir(parents=True, exist_ok=True)
    np.save(f, out.cpu().numpy())
    return out


_orig_phs = ns_video._HFVideoModel.predict_hidden_states
ns_video._HFVideoModel.__init__ = _init
ns_video._HFVideoModel.predict_hidden_states = _predict_hidden_states
