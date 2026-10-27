#!/usr/bin/env python3
"""Build-genre narration: videos/<slug>/script.json -> voice clips -> voice.wav + words.json + story.json.

    python3 -I tools/narrate.py 024-hole-subway            voice every beat (cached) + lay out story.json
    python3 -I tools/narrate.py 024-hole-subway --scratch  force the scratch voice (macOS `say`) even if a key is set
    python3 -I tools/narrate.py 024-hole-subway --layout   re-lay out story.json from words.json (callout edits; no voicing)
    python3 -I tools/narrate.py --voices                   list your ElevenLabs voices (name, id, labels)
    python3 -I tools/narrate.py --sample "text" id1 id2…   voice one line with several ElevenLabs voices -> scratchpad/sample-*.mp3

Why: build reels (docs/BUILD.md) are carried by a fast narrator, and the captions show ONE word at a time, so every word needs
a time. ElevenLabs' /with-timestamps endpoint returns per-character times with the audio; the scratch voice (until the user
sets ELEVENLABS_API_KEY in the env, ~/.config/edstudio/.env, or a git-ignored .env at the repo root) estimates them per syllable.
Clips are cached by a hash of (voice settings, text): re-running only voices beats whose text changed (ElevenLabs bills per char).
shots.js animates in beat-local time (story.beats[id]), so re-voicing stretches the animation automatically.
"""
import base64, hashlib, json, os, re, subprocess, sys, urllib.request, urllib.error, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SR = 44100
API = 'https://api.elevenlabs.io/v1'


def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
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
                m = re.match(r'\s*ELEVENLABS_API_KEY\s*=\s*["\']?([^"\'\s]+)', line)
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

def voice_beat(vdir, provider, cfg, beat, prev_text, next_text, key):
    text = beat['say'].strip()
    if provider == 'eleven':
        v = cfg['voice']
        if not v.get('voice_id'):
            sys.exit('script.json voice.voice_id is empty — pick one with: python3 -I tools/narrate.py --voices')
        sig = json.dumps([v['voice_id'], v.get('model'), v.get('settings'), text], sort_keys=True)
    else:
        s = cfg.get('scratch', {})
        sig = json.dumps([s.get('voice'), s.get('rate'), text], sort_keys=True)
    h = hashlib.sha1(sig.encode()).hexdigest()[:10]
    stem = os.path.join(vdir, f"{'eleven' if provider == 'eleven' else 'scratch'}-{beat['id']}-{h}")
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
        tempo = cfg.get('tempo', 1.0) if provider == 'eleven' else 1.0
        words = [{'w': w['w'], 't0': w['t0'] / tempo, 't1': w['t1'] / tempo} for w in words]
        x, words = trim(decode(path, tempo), words)
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
        for w in wb['words']:
            d = display(w['w'])
            if d:  # 'p': the word ends a clause ("it," "Gary.") — captions never join across it ("It Gary" in v2)
                words.append({'w': d, 't0': w['t0'], 't1': w['t1'], 'p': bool(re.search(r'[.,!?:;]["\')]*$', w['w'].strip()))})
        sb = next(b for b in cfg['beats'] if b['id'] == wb['id'])
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
            e = min(e, t1 + 0.1, dur)
            co = {'text': c['text'], 'style': c.get('style', 'term'), 't0': round(a, 3), 't1': round(e, 3)}
            for k2 in ('pos', 'x', 'y'):  # sfx position / a callout's own height (frame fraction) when the default band hides the subject
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
        if nxt - w['t0'] < 0.12 and len(w['w']) <= 3 and k + 1 < len(words) and not w['p']: merged[-1]['_join'] = True
    for m in merged: m.pop('_join', None); m.pop('p', None)
    words = merged
    # a caption word stays up until the next one starts (no blank flicker inside a sentence), max 0.35 s past its end
    for k, w in enumerate(words):
        nxt = words[k + 1]['t0'] if k + 1 < len(words) else dur
        w['t1'] = round(min(nxt, w['t1'] + 0.35) if nxt - w['t1'] > 0.12 else nxt, 3)
    short = [w['w'] for w in words if w['t1'] - w['t0'] < 0.1]
    story = {'tone': 'build', 'mode': 'build', 'title': cfg.get('title', ''), 'fps': cfg.get('fps', 60), 'motionBlur': cfg.get('motionBlur', 2), 'duration': round(dur, 2),
             'look': cfg.get('look', {}), 'voice': {'provider': wj['provider'], 'file': 'voice.wav'},
             'beats': beats, 'order': order, 'words': words, 'callouts': callouts}
    if cfg.get('debugView'):
        story['debugView'] = cfg['debugView']
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
    slug = os.path.basename(a[0].rstrip('/'))
    vd = os.path.join(ROOT, 'videos', slug)
    if '--layout' in a:
        cfg = json.load(open(os.path.join(vd, 'script.json')))
        return layout(slug, cfg, json.load(open(os.path.join(vd, 'words.json'))))
    provider = 'eleven' if key and '--scratch' not in a and json.load(open(os.path.join(vd, 'script.json')))['voice'].get('provider') == 'eleven' else 'scratch'
    if provider == 'scratch':
        print('(scratch voice: macOS say — set ELEVENLABS_API_KEY for the real narrator)')
    cfg, wj = narrate(slug, provider, key)
    layout(slug, cfg, wj)


if __name__ == '__main__':
    main()
