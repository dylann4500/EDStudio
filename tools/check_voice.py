#!/usr/bin/env python3
"""Check a build reel's narrator takes before re-syncing to them (032): did every beat say its line, and do the yells sit right?

    <venv>/bin/python -I tools/check_voice.py 032-bird-feeder-station [base.en|large-v3]

1. Transcribes every clip listed in words.json with faster-whisper (local models: Systran/faster-whisper-* in
   ~/.cache/huggingface; set HF_HUB_OFFLINE=1) and compares it to the beat's untagged `say` (match < 0.9 = listen to it).
   base.en mishears short words ("turns him blue" → "turns in blue"); re-check a flagged beat with large-v3 before re-voicing.
2. Per beat: the clip's peak + clipped samples, and for a beat with an [excited]/[shouting] tag the RMS + >4 kHz share of the
   calm part vs the tagged part (032's Eleven v3 yells: +1.5…+3.7 dB louder, no extra brightness = not oversaturated).
faster-whisper isn't in the repo's env: `python3 -m venv <scratchpad>/fw && <scratchpad>/fw/bin/pip install faster-whisper`.
"""
import difflib, json, os, re, subprocess, sys, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def pcm(path, sr):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float32) / 32768   # decoded here: faster-whisper's own PyAV decode breaks on newer av


def words(s):
    return re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace(',', '')).split()


def stats(x, sr, t0, t1):
    s = x[int(t0 * sr):int(t1 * sr)]
    rms = 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)
    S = np.abs(np.fft.rfft(s * np.hanning(len(s)))) ** 2; f = np.fft.rfftfreq(len(s), 1 / sr)
    return rms, 10 * np.log10(S[f > 4000].sum() / S[f > 100].sum() + 1e-12)


def main():
    from faster_whisper import WhisperModel
    slug, model = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'base.en')
    vd = os.path.join(ROOT, 'videos', slug)
    cfg, wj = json.load(open(os.path.join(vd, 'script.json'))), json.load(open(os.path.join(vd, 'words.json')))
    m = WhisperModel(model, device='cpu', compute_type='int8')
    w = wave.open(os.path.join(vd, 'voice.wav')); sr = w.getframerate()
    voice = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    bad = 0
    for b, wb in zip(cfg['beats'], wj['beats']):
        clip = os.path.join(vd, wb['clip'])
        segs, _ = m.transcribe(pcm(clip, 16000), language='en', beam_size=5)
        heard = ' '.join(s.text.strip() for s in segs)
        want = re.sub(r'\[[^\]]*\]\s*', '', b['say'])
        r = difflib.SequenceMatcher(None, words(want), words(heard)).ratio()
        x = pcm(clip, 44100)
        line = f"{b['id']:10} match {r:.2f}  peak {20 * np.log10(np.max(np.abs(x)) + 1e-9):5.1f} dBFS  clipped {int(np.sum(np.abs(x) > 0.985))}"
        tag = re.search(r'\[(shouting|excited)\]', b['say'])
        if tag:   # words.json times are on the assembled voice.wav (tempo applied)
            n = len(re.sub(r'\[[^\]]*\]', '', b['say'][:tag.start()]).split()); ws = wb['words']
            if 0 < n < len(ws):
                (c, ch), (y, yh) = stats(voice, sr, ws[0]['t0'], ws[n - 1]['t1']), stats(voice, sr, ws[n]['t0'], ws[-1]['t1'])
                line += f"  | {tag.group(1)}: {y - c:+.1f} dB vs calm, >4k {yh - ch:+.1f} dB"
        if r < 0.9:
            bad += 1; line += '  <-- LISTEN'
        print(line + (f"\n    want:  {want}\n    heard: {heard}" if r < 0.9 else ''))
    print(f'{bad} beat(s) to listen to')


if __name__ == '__main__':
    main()
