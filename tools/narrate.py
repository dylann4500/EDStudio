#!/usr/bin/env python3
"""Build-genre narration: videos/<slug>/script.json -> voice clips -> voice.wav + words.json + story.json.

    python3 -I tools/narrate.py 024-hole-subway            voice every beat (cached) + lay out story.json
    python3 -I tools/narrate.py 024-hole-subway --scratch  force the scratch voice (macOS `say`) even if a key is set
    python3 -I tools/narrate.py 024-hole-subway --layout   re-lay out story.json from words.json (callout edits; no voicing)
    python3 -I tools/narrate.py --voices                   list your ElevenLabs voices (name, id, labels)
    python3 -I tools/narrate.py --sample "text" id1 id2…   voice one line with several ElevenLabs voices -> scratchpad/sample-*.mp3
    python3 -I tools/narrate.py 058-slug --fish [--fish-voice ID]   voice with Fish Audio (FISH_API_KEY) instead of ElevenLabs
    python3 -I tools/narrate.py --fish-voices "deep narrator"     search Fish Audio's public voices (most used first)
    python3 -I tools/narrate.py --fish-sample "text" id1 id2…     voice one line with several Fish voices -> $TMPDIR/fish-sample-*.mp3

Why: build reels (docs/BUILD.md) are carried by a fast narrator, and the captions show ONE word at a time, so every word needs
a time. ElevenLabs' /with-timestamps endpoint returns per-character times with the audio; the scratch voice (until the user
sets ELEVENLABS_API_KEY in the env, ~/.config/edstudio/.env, or a git-ignored .env at the repo root) estimates them per syllable.
Clips are cached by a hash of (voice settings, text): re-running only voices beats whose text changed (ElevenLabs bills per char).
shots.js animates in beat-local time (story.beats[id]), so re-voicing stretches the animation automatically.
"""
import base64, hashlib, json, os, re, subprocess, sys, urllib.parse, urllib.request, urllib.error, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SR = 44100
API = 'https://api.elevenlabs.io/v1'


def api_key(name='ELEVENLABS_API_KEY'):
    k = os.environ.get(name)
    if k:
        return k.strip()
    roots = [os.path.expanduser('~/.config/edstudio'), ROOT]  # outside any repo first: a key there can never be committed
    try:  # a worktree also reads the main checkout's .env, so one key file serves every worktree
        common = subprocess.run(['git', '-C', ROOT, 'rev-parse', '--git-common-dir'], capture_output=True, text=True).stdout.strip()
        if common:
            roots.append(os.path.dirname(os.path.abspath(os.path.join(ROOT, common))))
    except OSError:
        pass
    for r in roots:
        env = os.path.join(r, '.env')
        if os.path.exists(env):
            for line in open(env):
                m = re.match(r'\s*' + name + r'\s*=\s*["\']?([^"\'\s]+)', line)
                if m:
                    return m.group(1)
    return None


def http_json(url, key, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'application/json'},
                                 method='POST' if body is not None else 'GET')
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f'ElevenLabs {e.code}: {e.read().decode(errors="replace")[:400]}')


# ---- Fish Audio (Nov 9 2026: ElevenLabs' free tier got blocked; the user switched to a Fish Audio key) ------------------
# FISH_API_KEY in the env, ~/.config/edstudio/.env or the repo's .env (same lookup as ElevenLabs). Per reel: script.json
# "voice": {"provider": "fish", ...} or the CLI flag --fish (re-voices a reel written for ElevenLabs without editing it). Voice
# settings come from script.json "fish": {"reference_id": "<Fish voice model id>", "model": "s2.1-pro", "speed": 1.0,
# "temperature": 0.7, "tempo": <atempo at assembly, default = script.json tempo>} — or --fish-voice <id>, or FISH_VOICE_ID in
# the .env. Word times come from /v1/tts/stream/with-timestamp (SSE: audio chunks + per-text-chunk word segments).
FISH_API = 'https://api.fish.audio'


def fish_cfg(cfg):
    f = dict(cfg.get('fish') or {})
    if os.environ.get('FISH_VOICE_OVERRIDE'):   # --fish-voice <id> on the command line
        f['reference_id'] = os.environ['FISH_VOICE_OVERRIDE']
    if not f.get('reference_id'):
        f['reference_id'] = os.environ.get('FISH_VOICE_ID') or api_key('FISH_VOICE_ID')
    f.setdefault('model', 's2.1-pro')
    return f


def fish_get(path, key):
    req = urllib.request.Request(FISH_API + path, headers={'Authorization': f'Bearer {key}'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f'Fish Audio {e.code}: {e.read().decode(errors="replace")[:400]}')


def fish_tts(text, f, key):
    """One Fish Audio take with word timings: (mp3 bytes, [{text, start, end}] in seconds on the take's own timeline)."""
    body = {'text': text, 'format': 'mp3', 'mp3_bitrate': 192, 'sample_rate': 44100, 'latency': 'normal',
            'temperature': f.get('temperature', 0.7), 'top_p': f.get('top_p', 0.7), 'language': f.get('language', 'en'),
            'prosody': {'speed': f.get('speed', 1.0), 'volume': 0}}
    if f.get('reference_id'):
        body['reference_id'] = f['reference_id']
    req = urllib.request.Request(FISH_API + '/v1/tts/stream/with-timestamp', data=json.dumps(body).encode(), method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json',
                                          'model': f.get('model', 's2.1-pro'), 'Accept': 'text/event-stream'})
    audio, aligns = bytearray(), {}
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            for raw in r:
                line = raw.decode('utf-8', 'replace').strip()
                if not line.startswith('data:'):
                    continue
                payload = line[5:].strip()
                if not payload or payload == '[DONE]':
                    continue
                ev = json.loads(payload)
                if ev.get('audio_base64'):
                    audio += base64.b64decode(ev['audio_base64'])
                if ev.get('alignment'):   # the latest cumulative snapshot for this text chunk: replace, don't append
                    aligns[ev.get('chunk_seq', 0)] = (ev.get('chunk_audio_offset_sec', 0.0), ev['alignment'])
    except urllib.error.HTTPError as e:
        sys.exit(f'Fish Audio {e.code}: {e.read().decode(errors="replace")[:400]}')
    segs = []
    for seq in sorted(aligns):
        off, al = aligns[seq]
        segs += [{'text': s['text'], 'start': off + s['start'], 'end': off + s['end']} for s in al.get('segments', [])]
    if not audio:
        sys.exit('Fish Audio returned no audio')
    return bytes(audio), segs


def words_from_segments(text, segs):
    """Fish segments -> [{w, t0, t1}] for each whitespace token of OUR text (captions show our spelling, not the TTS's
    normalized one). Tokens are matched to segments in order on letters/digits; unmatched tokens share their neighbours' gap."""
    import difflib
    toks = text.split()
    if not segs:
        return []
    seg_words = []
    for s in segs:   # a segment may hold several words: split it, its time shared by letter count
        parts = s['text'].split() or [s['text']]
        L = sum(max(1, len(norm(p))) for p in parts); t = s['start']
        for p in parts:
            d = (s['end'] - s['start']) * max(1, len(norm(p))) / L
            seg_words.append({'n': norm(p), 't0': t, 't1': t + d}); t += d
    a, b = [norm(t) for t in toks], [s['n'] for s in seg_words]
    times = [None] * len(toks)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (seg_words[blk.b + k]['t0'], seg_words[blk.b + k]['t1'])
    end = seg_words[-1]['t1']
    i = 0
    while i < len(toks):   # fill runs of unmatched tokens between the matched neighbours, by syllables
        if times[i] is not None:
            i += 1; continue
        j = i
        while j < len(toks) and times[j] is None:
            j += 1
        lo = times[i - 1][1] if i else seg_words[0]['t0']
        hi = times[j][0] if j < len(toks) else end
        syl = [syllables(t) for t in toks[i:j]]; tot = sum(syl) or 1; t = lo
        for k, sy in enumerate(syl):
            d = (hi - lo) * sy / tot; times[i + k] = (t, t + d); t += d
        i = j
    return [{'w': tok, 't0': t0, 't1': max(t1, t0 + 0.02)} for tok, (t0, t1) in zip(toks, times)]


def decode(path, tempo=1.0):
    """Any audio file -> mono float32 at SR (via ffmpeg). tempo > 1 speeds speech up without changing pitch (atempo)."""
    af = ['-af', f'atempo={tempo:.4f}'] if abs(tempo - 1) > 1e-3 else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, *af, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


# ---- words ----------------------------------------------------------------------------------------------------------

TAG = re.compile(r'\[[^\]]*\]')   # Eleven v3 audio tags ("[shouting]", "[excited]") steer the delivery; never shown, timed or sent as context


def untag(s):
    return re.sub(r'\s{2,}', ' ', TAG.sub(' ', s or '')).strip()


def display(tok):
    """Caption form of a spoken token: no edge punctuation (keeps $ % and inner apostrophes), first letter capitalized."""
    t = re.sub(r"^[^\w$]+|[^\w%]+$", '', tok)
    return t[:1].upper() + t[1:] if t else ''


def norm(tok):
    return re.sub(r'[^a-z0-9]', '', tok.lower())


def syllables(tok):
    w = norm(tok)
    if not w:
        return 0.5
    if w.isdigit():  # "625" ~ "six hundred twenty five"
        return 1.6 * len(w) + (1 if len(w) > 2 else 0)
    n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'):
        n -= 1
    return max(1, n)


def words_from_alignment(al):
    """ElevenLabs alignment (per character) -> [{w, t0, t1}] for each whitespace-separated token; [audio tags] are skipped."""
    out, cur, t0, t1, depth = [], '', None, None, 0
    for ch, a, b in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch == '[':
            depth += 1
        if depth or ch.isspace():
            if ch == ']':
                depth = max(0, depth - 1)
            if cur:
                out.append({'w': cur, 't0': t0, 't1': t1})
            cur, t0 = '', None
            continue
        if not cur:
            t0 = a
        cur += ch
        t1 = b
    if cur:
        out.append({'w': cur, 't0': t0, 't1': t1})
    return out


def estimate_words(text, x):
    """Scratch voice: phrase boundaries snap to the pauses found in the audio; words split a phrase by syllables."""
    toks = text.split()
    n = len(x)
    win = int(0.01 * SR)
    e = np.sqrt(np.convolve(x * x, np.ones(win) / win, mode='same')) + 1e-9
    quiet = 20 * np.log10(e) < -38
    # quiet runs >= 70 ms = candidate pauses (their middles)
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) / SR >= 0.07 and i > 0 and j < n:
                runs.append(((i + j) / 2 / SR, i / SR, j / SR))
            i = j
        else:
            i += 1
    loud = np.nonzero(np.abs(x) > 10 ** (-46 / 20))[0]
    s0, dur = (loud[0] / SR, loud[-1] / SR) if len(loud) else (0.0, n / SR)
    runs = [r for r in runs if s0 < r[0] < dur]
    phrases, cur = [], []
    for k, tok in enumerate(toks):
        cur.append(k)
        if re.search(r'[,.;:!?]$', tok) and k < len(toks) - 1:
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    weights = [sum(syllables(toks[k]) for k in p) for p in phrases]
    total = sum(weights)
    # expected boundary times, then snap each to the nearest unused pause
    bounds, acc, used = [], 0.0, set()
    for w in weights[:-1]:
        acc += w
        guess = s0 + acc / total * (dur - s0)
        best = min((r for r in runs if r not in used), key=lambda r: abs(r[0] - guess), default=None)
        if best and abs(best[0] - guess) < 0.9:
            used.add(best)
            bounds.append((best[1], best[2]))
        else:
            bounds.append((guess, guess))
    spans, start = [], s0
    for b in bounds:
        spans.append((start, b[0]))
        start = b[1]
    spans.append((start, dur))
    out = []
    for p, (a, b) in zip(phrases, spans):
        sw = [syllables(toks[k]) for k in p]
        tot, t = sum(sw), a
        for k, s in zip(p, sw):
            d = (b - a) * s / tot
            out.append({'w': toks[k], 't0': round(t, 3), 't1': round(t + d, 3)})
            t += d
    return out


def squeeze(x, words, max_pause, fade=0.012, floor_db=None, guard=0.03):
    """Turbo pace (034, script.json "maxPause"): shorten every gap between two words to max_pause s by cutting the middle of
    the gap (short crossfade), and shift the word times to match. v3 reads ~0.3–0.9 s pauses at periods and before yells."""
    cuts = []
    for a, b in zip(words, words[1:]):
        g = b['t0'] - a['t1']
        if g > max_pause:
            c0 = a['t1'] + max_pause / 2
            cuts.append((c0, c0 + g - max_pause))
    if floor_db is not None:   # 034 r2: the timestamps can be wrong (a shouted "Bye," began 150 ms before its stamp and lost its
        safe = safe_blocks(x, floor_db, guard)   # attack) — keep each cut inside true silence (see squeeze_audio's guard)
        cuts = [c for c in (clip_to_safe(c0, c1, safe) for c0, c1 in cuts) if c]
    return cut_out(x, words, cuts, fade)


def safe_blocks(x, floor_db, guard, hop=0.005):
    """5 ms blocks of true silence: under floor_db and ≥ guard s from any trace of sound (a block above floor_db − 10)."""
    H = int(hop * SR); n = len(x) // H
    pk = np.abs(x[:n * H]).reshape(n, H).max(1)
    G = int(round(guard / hop))
    near = np.convolve((pk >= 10 ** ((floor_db - 10) / 20)).astype(float), np.ones(2 * G + 1), 'same') > 0
    return (pk < 10 ** (floor_db / 20)) & ~near


def clip_to_safe(c0, c1, safe, hop=0.005):
    """The longest stretch of [c0, c1) made of safe blocks (or None if < 10 ms)."""
    best, run = None, None
    for k in range(int(c0 / hop), min(len(safe), int(np.ceil(c1 / hop)))):
        if safe[k]:
            run = (run[0], k + 1) if run else (k, k + 1)
            if not best or run[1] - run[0] > best[1] - best[0]:
                best = run
        else:
            run = None
    if not best:
        return None
    a, b = max(c0, best[0] * hop), min(c1, best[1] * hop)
    return (a, b) if b - a > 0.01 else None


def squeeze_audio(x, words, max_pause, floor_db=-45, hop=0.005, fade=0.012, pad=0.04, guard=0.03, cuts_out=None, soft_db=None):
    """Turbo pace, measured on the AUDIO (034 r2, script.json "pauseFloor"): v3's word timestamps run past the real word ends, so
    after squeeze() the voice still had 30 silences of 0.25–0.43 s. Find every run of 5 ms blocks whose peak is under floor_db and
    cut it down to max_pause (middle cut, short crossfade); the clip's head and tail silences down to pad. Word times follow.
    Guard (manager, r2): a cut never comes within `guard` s of any trace of sound (a block above floor_db − 10: a soft f/h/s/th
    onset or a breathy tail), so it only lands in true silence. cuts_out (a list) collects the cuts for checking."""
    H = int(hop * SR); n = len(x) // H
    if n < 3:
        return x, words
    pk = np.abs(x[:n * H]).reshape(n, H).max(1)
    quiet = pk < 10 ** (floor_db / 20)
    soft = pk >= 10 ** ((floor_db - 10 if soft_db is None else soft_db) / 20)   # any trace of sound (041, opt-in per beat "pauseSoft": a v3 clip with a
    # −51…−55 dBFS noise floor between two sentences reads as 'sound' at the default floor − 10, so its 0.23 s pause could never be cut)
    G = int(round(guard / hop))
    near = np.convolve(soft.astype(float), np.ones(2 * G + 1), 'same') > 0   # within the guard of a trace of sound
    cuts, i = [], 0
    while i < n:
        if not quiet[i]:
            i += 1; continue
        j = i
        while j < n and quiet[j]:
            j += 1
        ok = [k for k in range(i, j) if not near[k]]   # blocks of true silence, ≥ guard from any sound
        L = (j - i) * hop
        if j == n and i > 0 and L > pad:   # the clip's tail: keep pad s (trim() measures single samples and can leave ~0.3 s)
            last = max([k for k in range(i, j) if soft[k]], default=i - 1)   # the last trace of sound in the tail
            end = min(len(x), int(max(i * hop + pad, (last + 1) * hop + guard) * SR))
            x = x[:end]; words = [{**w, 't0': min(w['t0'], end / SR), 't1': min(w['t1'], end / SR)} for w in words]
        elif i == 0 and L > pad:
            first = min([k for k in range(i, j) if soft[k]], default=j)
            c1 = min(L - pad, first * hop - guard)
            if c1 > 0.01:
                cuts.append((0.0, c1))
        elif 0 < i and j < n and L > max_pause and ok:
            a0, a1 = ok[0] * hop, (ok[-1] + 1) * hop   # the cut must stay inside [a0, a1]
            Lc = min(L - max_pause, a1 - a0)
            c0 = min(max(i * hop + max_pause / 2, a0), a1 - Lc)
            if Lc > 0.01:
                cuts.append((c0, c0 + Lc))
        i = j
    if cuts_out is not None:
        cuts_out.extend(cuts)
    return cut_out(x, words, cuts, fade)


def cut_out(x, words, cuts, fade=0.012):
    """Remove the [c0, c1) spans (s) from x with short fades at every join; remap the word times."""
    F = int(fade * SR)
    if not cuts:
        return x, words
    parts, prev = [], 0
    for c0, c1 in cuts:
        i0, i1 = int(c0 * SR), int(c1 * SR)
        seg = x[prev:i0].copy()
        if parts and F and len(seg) > F:   # fade the join in
            seg[:F] *= np.linspace(0, 1, F)
        if F and len(seg) > F:
            seg[-F:] *= np.linspace(1, 0, F)
        parts.append(seg); prev = i1
    tail = x[prev:].copy()
    if F and len(tail) > F:
        tail[:F] *= np.linspace(0, 1, F)
    parts.append(tail)

    def tm(t):
        s = 0.0
        for c0, c1 in cuts:
            if t >= c1:
                s += c1 - c0
            elif t > c0:
                return c0 - s
        return t - s
    return np.concatenate(parts), [{'w': w['w'], 't0': tm(w['t0']), 't1': tm(w['t1'])} for w in words]


def shelf_tail(x, words, beat, db, hz, fade=0.03):
    """High-shelf (ffmpeg `highshelf`) from the first word after the beat's first [shouting]/[excited] tag to the clip's end, with a
    short crossfade in; the calm part before it is untouched (a whole-beat shelf would dull both and keep the difference)."""
    m = re.search(r'\[(shouting|excited)\]', beat['say'])
    if not m or not db:
        return x
    n = len(untag(beat['say'][:m.start()]).split())
    if n >= len(words):
        return x
    i0 = max(0, int((words[n]['t0'] - fade) * SR))
    seg = (np.clip(x[i0:], -1, 1) * 32767).astype('<i2').tobytes()
    y = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'highshelf=f={hz}:g={db}:width_type=q:width=0.7',
                        '-f', 's16le', '-ar', str(SR), '-ac', '1', '-'], input=seg, capture_output=True, check=True).stdout
    y = np.frombuffer(y, '<i2').astype(np.float32)[:len(x) - i0] / 32768
    out = x.copy(); F = min(len(y), int(fade * SR)); w = np.linspace(0, 1, F)
    out[i0:i0 + len(y)] = y; out[i0:i0 + F] = x[i0:i0 + F] * (1 - w) + y[:F] * w
    return out


def trim(x, words, pad=0.04):
    """Cut leading/trailing silence from a clip; shift its word times to match."""
    loud = np.nonzero(np.abs(x) > 10 ** (-46 / 20))[0]
    if not len(loud):
        return x, words
    a = max(0, loud[0] - int(pad * SR))
    b = min(len(x), loud[-1] + int(pad * SR))
    off = a / SR
    return x[a:b], [{'w': w['w'], 't0': max(0.0, w['t0'] - off), 't1': max(0.0, w['t1'] - off)} for w in words]


# ---- voicing ----------------------------------------------------------------------------------------------------------

def clip_stem(vdir, provider, cfg, beat):
    """The cache path of one beat's take (without extension): voice/<provider>-<beat id>-<sha1 of voice + settings + text>."""
    text = beat['say'].strip()
    if provider == 'eleven':
        v = cfg['voice']
        if not v.get('voice_id'):
            sys.exit('script.json voice.voice_id is empty — pick one with: python3 -I tools/narrate.py --voices')
        sig = json.dumps([v['voice_id'], v.get('model'), v.get('settings'), text], sort_keys=True)
    elif provider == 'fish':
        f = fish_cfg(cfg)
        sig = json.dumps([f.get('reference_id'), f.get('model'), f.get('speed', 1.0), f.get('temperature', 0.7),
                          f.get('top_p', 0.7), text], sort_keys=True)
    else:
        s = cfg.get('scratch', {})
        sig = json.dumps([s.get('voice'), s.get('rate'), text], sort_keys=True)
    h = hashlib.sha1(sig.encode()).hexdigest()[:10]
    return os.path.join(vdir, f"{provider if provider in ('eleven', 'fish') else 'scratch'}-{beat['id']}-{h}")


def voice_beat(vdir, provider, cfg, beat, prev_text, next_text, key):
    text = beat['say'].strip()
    stem = clip_stem(vdir, provider, cfg, beat)
    if os.path.exists(stem + '.json'):
        meta = json.load(open(stem + '.json'))
        return stem + meta['ext'], meta['words'], False
    if provider == 'eleven':
        v = cfg['voice']
        body = {'text': text, 'model_id': v.get('model', 'eleven_multilingual_v2'), 'voice_settings': v.get('settings', {})}
        if not body['model_id'].startswith('eleven_v3'):   # v3 rejects previous/next_text ("not yet supported")
            if prev_text:
                body['previous_text'] = untag(prev_text)
            if next_text:
                body['next_text'] = untag(next_text)
        r = http_json(f"{API}/text-to-speech/{v['voice_id']}/with-timestamps?output_format=mp3_44100_128", key, body)
        open(stem + '.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
        words = words_from_alignment(r.get('alignment') or r['normalized_alignment'])
        ext = '.mp3'
    elif provider == 'fish':
        spoken = untag(text)   # Eleven v3 [audio tags] mean nothing to Fish: never send or time them
        audio, segs = fish_tts(spoken, fish_cfg(cfg), key)
        open(stem + '.mp3', 'wb').write(audio)
        words = words_from_segments(spoken, segs) or estimate_words(spoken, decode(stem + '.mp3'))
        ext = '.mp3'
    else:
        s = cfg.get('scratch', {})
        subprocess.run(['say', '-v', s.get('voice', 'Eddy (English (US))'), '-r', str(s.get('rate', 190)),
                        '-o', stem + '.aiff', untag(text)], check=True)
        words = estimate_words(untag(text), decode(stem + '.aiff'))
        ext = '.aiff'
    json.dump({'text': text, 'ext': ext, 'words': words}, open(stem + '.json', 'w'), indent=1)
    return stem + ext, words, True


def write_wav(path, x):
    y = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())


def narrate(slug, provider, key):
    vd = os.path.join(ROOT, 'videos', slug)
    cfg = json.load(open(os.path.join(vd, 'script.json')))
    vdir = os.path.join(vd, 'voice'); os.makedirs(vdir, exist_ok=True)
    beats = cfg['beats']
    clips, fresh = [], 0
    for i, b in enumerate(beats):
        prev_t = beats[i - 1]['say'] if i else None
        next_t = beats[i + 1]['say'] if i + 1 < len(beats) else None
        path, words, new = voice_beat(vdir, provider, cfg, b, prev_t, next_t, key)
        fresh += new
        # script.json "tempo": speed the delivery up at assembly (pitch kept; free — no re-voicing); word times scale with it
        tempo = (cfg.get('tempo', 1.0) if provider == 'eleven' else
                 fish_cfg(cfg).get('tempo', cfg.get('tempo', 1.0)) if provider == 'fish' else 1.0)
        words = [{'w': w['w'], 't0': w['t0'] / tempo, 't1': w['t1'] / tempo} for w in words]
        x, words = trim(decode(path, tempo), words)
        if cfg.get('maxPause'):   # turbo pace (034, opt-in): no silence between two words longer than maxPause s
            x, words = squeeze(x, words, cfg['maxPause'], floor_db=cfg.get('pauseFloor'))
            if cfg.get('pauseFloor'):   # 034 r2, opt-in: the same cap measured on the audio (dBFS floor)
                x, words = squeeze_audio(x, words, cfg['maxPause'], cfg['pauseFloor'], soft_db=b.get('pauseSoft'))
        ep = b.get('endPad', cfg.get('endPad'))   # 067, opt-in: a breathy voice (Fish "Mommy") trails seconds of sighs after its last word
        if ep is not None and words:              # → end each clip ep s after the last word (30 ms fade); internal pauses untouched
            cut = min(len(x), int((words[-1]['t1'] + ep) * SR))
            if cut < len(x):
                x = x[:cut].copy(); F = min(cut, int(0.03 * SR)); x[cut - F:] *= np.linspace(1, 0, F).astype(x.dtype)
        ys = cfg.get('yellShelf')   # 034, opt-in: v3 [shouting]/[excited] at stability 0 runs bright — a high-shelf on the tagged part only
        if ys and TAG.search(b['say']):
            x = shelf_tail(x, words, b, b.get('shelf', ys.get('db', -4)), ys.get('hz', 5000))
        clips.append((b, x, words, os.path.relpath(path, vd)))
    # assemble: lead + clip + gap + clip … + tail
    t = cfg.get('lead', 0.15)
    out_beats, chunks = [], [np.zeros(int(t * SR), np.float32)]
    for i, (b, x, words, rel) in enumerate(clips):
        L = len(x) / SR
        out_beats.append({'id': b['id'], 't0': round(t, 3), 't1': round(t + L, 3), 'clip': rel,
                          'words': [{'w': w['w'], 't0': round(t + w['t0'], 3), 't1': round(t + w['t1'], 3)} for w in words]})
        chunks.append(x)
        gap = b.get('gap', cfg.get('gap', 0.14)) if i + 1 < len(clips) else cfg.get('tail', 1.5)
        chunks.append(np.zeros(int(gap * SR), np.float32))
        t += L + gap
    audio = np.concatenate(chunks)
    write_wav(os.path.join(vd, 'voice.wav'), audio)
    wj = {'provider': provider, 'duration': round(len(audio) / SR, 3), 'beats': out_beats}
    json.dump(wj, open(os.path.join(vd, 'words.json'), 'w'), indent=1)
    print(f'voice: {provider}, {len(clips)} beats ({fresh} newly voiced) -> voice.wav {wj["duration"]:.2f} s')
    return cfg, wj


# ---- layout ------------------------------------------------------------------------------------------------------------

def layout(slug, cfg, wj):
    vd = os.path.join(ROOT, 'videos', slug)
    dur = wj['duration']
    beats, order, words, callouts, errors = {}, [], [], [], []
    B = wj['beats']
    for i, wb in enumerate(B):
        t0 = 0.0 if i == 0 else wb['t0']
        t1 = B[i + 1]['t0'] if i + 1 < len(B) else dur
        beats[wb['id']] = {'t0': round(t0, 3), 't1': round(t1, 3), 's0': wb['t0'], 's1': wb['t1'], 'i': i,
                           'w': [[norm(w['w']), w['t0'], w['t1']] for w in wb['words']]}  # shots.js syncs gags to spoken words
        order.append(wb['id'])
        swap = cfg.get('swap', {})   # 058, opt-in: {"fucking": "F*CKING"} = the caption shows a spoken word differently (censored on screen)
        for w in wb['words']:
            d = swap.get(norm(w['w'])) or display(w['w'])
            if d:  # 'p': the word ends a clause ("it," "Gary.") — captions never join across it ("It Gary" in v2)
                words.append({'w': d, 't0': w['t0'], 't1': w['t1'], 'p': bool(re.search(r'[.,!?:;]["\')]*$', w['w'].strip()))})
        sb = next(b for b in cfg['beats'] if b['id'] == wb['id'])
        if 'sub' in sb:   # 056: the beat's on-screen subtitle line (numerals: "Day 3: nobody notices.") for the pov text layer
            beats[wb['id']]['sub'] = sb['sub']
        for c in sb.get('callouts', []):
            hits = [k for k, w in enumerate(wb['words']) if norm(w['w']) == norm(c['at'])]
            nth = c.get('nth', 1)
            if len(hits) < nth:
                errors.append(f"beat '{wb['id']}': callout anchor '{c['at']}' not found in: {sb['say']}")
                continue
            k = hits[nth - 1]
            a = wb['words'][k]['t0'] - 0.04
            if 'until' in c:
                u = [j for j, w in enumerate(wb['words']) if j >= k and norm(w['w']) == norm(c['until'])]
                if not u:
                    errors.append(f"beat '{wb['id']}': callout until '{c['until']}' not found after '{c['at']}'")
                    continue
                e = wb['words'][u[0]]['t1'] + 0.3
            elif 'hold' in c:
                e = a + c['hold']
            else:
                e = wb['t1'] + 0.25
            e = max(e, a + c.get('min', 0))   # 041: a floor on the visible time (a fast read flashed DUCTED FAN for 0.44 s)
            e = min(e, t1 + 0.1, dur)
            co = {'text': c['text'], 'style': c.get('style', 'term'), 't0': round(a, 3), 't1': round(e, 3)}
            for k2 in ('pos', 'x', 'y', 'roll', 'rollDur'):  # sfx position / a callout's own height (frame fraction) when the default band hides the subject; 039: roll [from, to] counts {n} up
                if k2 in c:
                    co[k2] = c[k2]
            callouts.append(co)
    if errors:
        sys.exit('\n'.join(errors))
    # a word shown for < 0.12 s (ElevenLabs' "a", "to") joins the next word in one caption ("A Raccoon") instead of flashing
    merged = []
    for k, w in enumerate(words):
        if merged and merged[-1].get('_join') and w['t0'] - merged[-1]['t1'] < 0.25:
            m = merged[-1]; m['w'] = m['w'] + ' ' + w['w']; m['t1'] = w['t1']; m.pop('_join'); continue
        merged.append(dict(w))
        nxt = words[k + 1]['t0'] if k + 1 < len(words) else dur
        if nxt - w['t0'] < 0.12 and len(w['w']) <= cfg.get('joinLen', 3) and k + 1 < len(words) and not w['p']: merged[-1]['_join'] = True   # joinLen 4: a sped-up v3 read flashes "Then"/"want"
    for m in merged: m.pop('_join', None); m.pop('p', None)
    words = merged
    # a caption word stays up until the next one starts (no blank flicker inside a sentence), max 0.35 s past its end
    for k, w in enumerate(words):
        nxt = words[k + 1]['t0'] if k + 1 < len(words) else dur
        w['t1'] = round(min(nxt, w['t1'] + 0.35) if nxt - w['t1'] > 0.12 else nxt, 3)
    short = [w['w'] for w in words if w['t1'] - w['t0'] < 0.1]
    story = {'tone': 'build', 'mode': cfg.get('mode', 'build'),   # 056: 'pov' = the @whatifpov text layer (engine/build/pov.js), driven by shots.js
              'title': cfg.get('title', ''), 'fps': cfg.get('fps', 60), 'motionBlur': cfg.get('motionBlur', 2), 'duration': round(dur, 2),
             'look': cfg.get('look', {}), 'voice': {'provider': wj['provider'], 'file': 'voice.wav'},
             'beats': beats, 'order': order, 'words': words, 'callouts': callouts}
    if cfg.get('debugView'):
        story['debugView'] = cfg['debugView']
    if cfg.get('wordColor'):   # 058, opt-in: {"F*CKING": "#ff4f6a"} = caption words drawn in their own colour (engine/build/captions.js)
        story['wordColor'] = cfg['wordColor']
    json.dump(story, open(os.path.join(vd, 'story.json'), 'w'), indent=1)
    print(f'story.json: {dur:.1f} s, {len(words)} words ({len(words) / dur:.2f} w/s), {len(callouts)} callouts')
    for bid in order:
        b = beats[bid]
        print(f"  {bid:<10} {b['t0']:6.2f} → {b['t1']:6.2f}  ({b['t1'] - b['t0']:.1f} s)")
    if short:
        print(f'⚠️  {len(short)} caption words show < 0.1 s: {short[:8]}')


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    key = api_key()
    if a[0] == '--voices':
        if not key:
            sys.exit('no ELEVENLABS_API_KEY (env or .env at the repo root)')
        for v in http_json(f'{API}/voices', key)['voices']:
            print(f"{v['voice_id']}  {v['name']:<28} {json.dumps(v.get('labels', {}))}")
        return
    if a[0] == '--sample':
        if not key:
            sys.exit('no ELEVENLABS_API_KEY (env or .env at the repo root)')
        text, ids = a[1], a[2:]
        out = os.environ.get('TMPDIR', '/tmp')
        for vid in ids:
            r = http_json(f'{API}/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128', key,
                          {'text': text, 'model_id': 'eleven_multilingual_v2'})
            p = os.path.join(out, f'sample-{vid}.mp3'); open(p, 'wb').write(base64.b64decode(r['audio_base64'])); print(p)
        return
    if a[0] in ('--fish-voices', '--fish-sample'):
        fk = api_key('FISH_API_KEY')
        if not fk:
            sys.exit('no FISH_API_KEY (env, ~/.config/edstudio/.env, or .env at the repo root)')
        if a[0] == '--fish-voices':   # --fish-voices "deep male narrator" → public voice models, most used first
            q = urllib.parse.urlencode({'title': ' '.join(a[1:]), 'page_size': 20, 'sort_by': 'task_count', 'language': 'en'})
            for m in fish_get(f'/model?{q}', fk).get('items', []):
                print(f"{m['_id']}  {m.get('title', '')[:40]:<40} uses {m.get('task_count', 0):>9}  {','.join(m.get('tags', [])[:4])}")
            return
        text, ids = a[1], a[2:] or [None]   # --fish-sample "text" id1 id2 … → scratchpad/fish-sample-<id>.mp3
        out = os.environ.get('TMPDIR', '/tmp')
        for vid in ids:
            audio, _ = fish_tts(text, {'reference_id': vid, 'model': 's2.1-pro'}, fk)
            p = os.path.join(out, f'fish-sample-{vid or "default"}.mp3'); open(p, 'wb').write(audio); print(p)
        return
    slug = os.path.basename(a[0].rstrip('/'))
    vd = os.path.join(ROOT, 'videos', slug)
    if '--layout' in a:
        cfg = json.load(open(os.path.join(vd, 'script.json')))
        return layout(slug, cfg, json.load(open(os.path.join(vd, 'words.json'))))
    sc = json.load(open(os.path.join(vd, 'script.json')))
    if '--fish-voice' in a:
        os.environ['FISH_VOICE_OVERRIDE'] = a[a.index('--fish-voice') + 1]
    if '--scratch' not in a and ('--fish' in a or sc['voice'].get('provider') == 'fish'):
        fk = api_key('FISH_API_KEY')
        fcached = all(os.path.exists(clip_stem(os.path.join(vd, 'voice'), 'fish', sc, b) + '.json') for b in sc['beats'])
        if not fk and not fcached:
            sys.exit('no FISH_API_KEY (env, ~/.config/edstudio/.env, or .env at the repo root) — or run with --scratch')
        print(f"voice: Fish Audio ({fish_cfg(sc).get('reference_id') or 'default voice'}, {fish_cfg(sc)['model']})")
        cfg, wj = narrate(slug, 'fish', fk)
        return layout(slug, cfg, wj)
    want = '--scratch' not in a and sc['voice'].get('provider') == 'eleven'
    # a clone without a key can still rebuild a finished reel: its committed voice/eleven-* takes cover every beat
    cached = want and all(os.path.exists(clip_stem(os.path.join(vd, 'voice'), 'eleven', sc, b) + '.json') for b in sc['beats'])
    provider = 'eleven' if want and (key or cached) else 'scratch'
    if provider == 'eleven' and not key:
        print('(no ELEVENLABS_API_KEY: every beat has a committed ElevenLabs take in voice/, reusing them)')
    if provider == 'scratch':
        print('(scratch voice: macOS say — set ELEVENLABS_API_KEY for the real narrator)')
    cfg, wj = narrate(slug, provider, key)
    layout(slug, cfg, wj)


if __name__ == '__main__':
    main()
