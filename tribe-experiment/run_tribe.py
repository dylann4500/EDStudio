"""Run TRIBE v2 on each video and cache the raw prediction array.

Usage (from tribe-experiment/):
    .venv/bin/python run_tribe.py videos/012-pee-pants.mp4 [more.mp4 ...]

Writes results/<stem>.npy  (n_seconds, 20484) and results/<stem>.times.json (segment start times).
A video whose .npy already exists is skipped (never re-run a finished video).

Local patches, applied from outside the tribev2 package (its code is untouched):
1. Device: the encoders only accept "cuda"/"cpu" and fall back to CPU on a Mac. We set the video (V-JEPA 2) and
   audio (w2v-BERT) encoders to Apple's "mps" GPU after loading. The device is excluded from the feature cache key,
   so this changes speed, not which features are computed (up to float rounding). mac_patches.py makes V-JEPA 2 fit
   in ~5 GB (chunked attention, token-mean first, fp16) — see its docstring for the equivalence checks.
2. Transcript: TRIBE transcribes speech with WhisperX (CUDA float16). EDStudio videos contain NO speech (procedural
   music + SFX; the "narration" is on-screen text), so we return an empty transcript instead of running Whisper.
   The text (Llama 3.2) stream therefore receives no words, exactly as it would for any wordless video.
"""
import json
import os
import sys
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
# hard cap on GPU memory (~9.5 GB of 24; 0.75 let the cache grow to 11 GB and swap): fail with an error instead of pushing the Mac into swap
os.environ.setdefault("PYTORCH_MPS_HIGH_WATERMARK_RATIO", "0.5")
os.environ.setdefault("PYTORCH_MPS_LOW_WATERMARK_RATIO", "0.4")

import numpy as np
import pandas as pd
import torch

import mac_patches  # noqa: F401  (V-JEPA 2 memory fixes)
from tribev2 import eventstransforms
from tribev2.demo_utils import TribeModel

HERE = Path(__file__).resolve().parent
RESULTS = HERE / "results"
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"


def _no_speech(wav_filename, language):
    print(f"  [patch] no speech in {Path(wav_filename).name}: empty transcript", flush=True)
    return pd.DataFrame(columns=["text", "start", "duration", "sequence_id", "sentence"])


eventstransforms.ExtractWordsFromAudio._get_transcript_from_audio = staticmethod(_no_speech)


def load_model():
    # num_workers 0: the config asks for 20 DataLoader workers; macOS spawns each one with a full re-import
    # (~1-2 min each), so loading cached features took >15 min. In-process loading takes seconds.
    model = TribeModel.from_pretrained("facebook/tribev2", cache_folder=str(HERE / "cache"),
                                       config_update={"data.num_workers": 0})
    data = model.data
    # bypass the Literal["auto","cpu","cuda"] validator: "mps" works everywhere torch accepts a device string
    object.__setattr__(data.video_feature.image, "device", DEVICE)
    object.__setattr__(data.audio_feature, "device", DEVICE)
    object.__setattr__(data.text_feature, "device", "cpu")  # never loaded: no words
    return model


def run(model, video: Path):
    out = RESULTS / f"{video.stem}.npy"
    if out.exists():
        print(f"skip {video.stem} (cached)")
        return
    t0 = time.time()
    print(f"== {video.stem}", flush=True)
    events = model.get_events_dataframe(video_path=str(video))
    print(f"  events: {events.type.value_counts().to_dict()}", flush=True)
    preds, segments = model.predict(events=events)
    np.save(out, preds.astype(np.float32))
    times = [float(s.start) for s in segments]
    (RESULTS / f"{video.stem}.times.json").write_text(json.dumps(times))
    print(f"  saved {out.name} shape={preds.shape} in {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    RESULTS.mkdir(exist_ok=True)
    m = load_model()
    for p in sys.argv[1:]:
        run(m, Path(p).absolute())
