// Pixel-font text overlay for pixel-art reels (054 goth tutor; the reference reels use chunky pixel captions + title cards).
// A built-in 5×7 bitmap font (no font download): each text is drawn into a tiny canvas (1 texel = 1 font pixel, with a 1-px ink
// outline + a drop shadow) and shown scaled up with `image-rendering: pixelated`, so it stays razor-crisp pixel art.
//   const ov = makePixelOverlay(story, { title: {text, t0, t1}, end: {t0, icon, lines}, wordY: 0.62, calloutY: 0.43 });
//   ov.update(t)   (call from shots.js update(t); story.json words/callouts come from tools/narrate.py like the build genre)
// Pops: each element pops in ONCE (a 2-step pixel scale) and never pulses after (house rule).
const G = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'], D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'], H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'], J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'], X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'], Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'], 1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'], 3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'], 5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'], 7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'], 9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'], ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'], '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'], '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'], '%': ['##...', '##..#', '...#.', '..#..', '.#...', '#..##', '...##'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'], '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'], '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'], ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '*': ['..#..', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '..#..'], '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....'],
  '·': ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'], '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'], '$': ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
  // lowercase (the reference reels caption in lowercase)
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'], b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  c: ['.....', '.....', '.####', '#....', '#....', '#....', '.####'], d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'], f: ['..##.', '.#...', '####.', '.#...', '.#...', '.#...', '.#...'],
  g: ['.....', '.####', '#...#', '#...#', '.####', '....#', '.###.'], h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  i: ['..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.'], j: ['...#.', '.....', '..##.', '...#.', '...#.', '#..#.', '.##..'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'], l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'], n: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'], p: ['.....', '####.', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.####', '#...#', '#...#', '.####', '....#', '....#'], r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'], t: ['.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'], v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'], x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '#...#', '#...#', '#...#', '.####', '....#', '.###.'], z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
};
const ALIAS = { '’': "'", '‘': "'", '“': '"', '”': '"', '—': '-', '–': '-', '✦': '*', '…': '.' };
const NARROW = new Set(['.', ',', '!', "'", ':', '(', ')', '·', '"']);
function glyph(ch) {
  const c0 = ALIAS[ch] ?? ch, c = G[c0] ? c0 : c0.toUpperCase(), g = G[c] || G['?'];
  if (!NARROW.has(c)) return g;
  let a = 5, b = -1; for (const r of g) for (let i = 0; i < r.length; i++) if (r[i] === '#') { a = Math.min(a, i); b = Math.max(b, i); }
  return g.map((r) => r.slice(a, b + 1));
}

/** Draw lines of text into a 1-texel-per-font-pixel canvas: fill colour, 1-px outline, 1-px drop shadow, centred lines. */
export function pixelText(lines, { color = '#ffffff', edge = '#140c14', shadow = 'rgba(0,0,0,0.55)', gap = 3 } = {}) {
  lines = (Array.isArray(lines) ? lines : [lines]).map((l) => [...String(l)].map(glyph));
  const lw = lines.map((gs) => gs.reduce((s, g) => s + g[0].length + 1, -1));
  const W = Math.max(...lw) + 4, H = lines.length * (7 + gap) - gap + 5;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const dots = []; lines.forEach((gs, li) => { let x = 2 + Math.floor((W - 4 - lw[li]) / 2); const y = 2 + li * (7 + gap); for (const g of gs) { g.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') dots.push([x + i, y + j]); }); x += g[0].length + 1; } });
  c.fillStyle = shadow; for (const [x, y] of dots) c.fillRect(x - 1, y + 1, 3, 3);
  c.fillStyle = edge; for (const [x, y] of dots) c.fillRect(x - 1, y - 1, 3, 3);
  c.fillStyle = color; for (const [x, y] of dots) c.fillRect(x, y, 1, 1);
  return cv;
}

const CSS = `.px { position: absolute; left: 50%; image-rendering: pixelated; image-rendering: crisp-edges; transform-origin: 50% 50%; opacity: 0; pointer-events: none; }
.pxbox { position: absolute; left: 50%; transform: translate(-50%, -50%); background: rgba(16, 8, 20, 0.78); border: 8px solid #f2e6ff; box-shadow: 0 0 0 8px #160c1a, 0 14px 0 8px rgba(0,0,0,.35); opacity: 0; }`;

function place(el, cv, s, x, y) { el.style.width = `${cv.width * s}px`; el.style.height = `${cv.height * s}px`; el.style.left = `${x * 1080}px`; el.style.top = `${y * 1920}px`; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pop = (a) => (a < 0.05 ? 0.7 : a < 0.1 ? 1.12 : 1);   // a two-step pixel pop (no smooth scaling = no blurry in-betweens)

export function makePixelOverlay(story, o = {}) {
  const ui = document.getElementById('ui');
  const st = document.createElement('style'); st.textContent = CSS + '.bw, .bc { display: none !important; }'; document.head.appendChild(st);
  // 083 (opt-in o.crisp): each pixel text is scaled up HERE (nearest neighbour, integer factor) and shown 1:1, and pops by its width/height
  // instead of a scale transform. Without it, a full render (every frame from t = 0) showed long callouts at 5–6× with whole glyph columns
  // dropped ("VOLT?GE _NDER", 079's "16.1 BILLION MILES") while stills of the same frames were clean: never let Chrome scale these images.
  const crispSrc = (cv, s) => { const c2 = document.createElement('canvas'); c2.width = cv.width * s; c2.height = cv.height * s; const g = c2.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cv, 0, 0, c2.width, c2.height); return c2.toDataURL(); };
  const mk = (cv, s, x, y) => { const el = document.createElement('img'); el.className = 'px'; el.src = o.crisp ? crispSrc(cv, s) : cv.toDataURL(); place(el, cv, s, x, y); el.dataset.w = cv.width * s; el.dataset.h = cv.height * s; ui.appendChild(el); return el; };
  const fitS = (cv, s, max = 1000) => Math.min(s, Math.floor(max / cv.width));
  // the spoken word, one at a time. 083 (additive): story.wordColor / o.wordColor {"F*CKING": "#ff4f6a"} draws those words in their own
  // colour, also inside a joined caption ("your f*cking"); keys match case-insensitively (o.lower lowercases the caption)
  const WC = o.wordColor ?? story.wordColor ?? null, wcOf = (tk) => (WC ? Object.entries(WC).find(([k]) => k.toLowerCase() === tk.toLowerCase())?.[1] : null);
  const wordCanvas = (txt) => {
    const toks = txt.split(' ');
    if (!toks.some(wcOf)) return pixelText(txt, {});
    const cvs = toks.map((tk) => pixelText(tk, { color: wcOf(tk) ?? '#ffffff' })), xs = []; let x = 0;
    for (const cv of cvs) { xs.push(x); x += cv.width - 4 + 5; }   // a space = 3 px + the 1-px glyph gaps either side (as pixelText lays it out)
    const out = document.createElement('canvas'); out.width = xs[xs.length - 1] + cvs[cvs.length - 1].width; out.height = cvs[0].height;
    const c = out.getContext('2d'); cvs.forEach((cv, i) => c.drawImage(cv, xs[i], 0)); return out;
  };
  const words = (story.words || []).map((w) => { const cv = wordCanvas(o.lower ? w.w.toLowerCase() : w.w); return { ...w, cv, el: mk(cv, fitS(cv, o.wordS ?? 11), 0.5, o.wordY ?? 0.62) }; });
  // callouts (TERM yellow, LABEL orange, stamp red)
  const COL = { term: '#ffd43b', label: '#ffae3c', stamp: '#ff3b3b', sfx: '#ffe14d', money: '#7cf05f' };
  const calls = (story.callouts || []).map((c) => { const cv = pixelText(c.text, { color: o.calloutColor ?? COL[c.style] ?? '#ffd43b' }); return { c, cv, el: mk(cv, fitS(cv, c.style === 'sfx' ? 8 : (o.calloutS ?? 12)), c.pos ? c.pos[0] : 0.5, o.calloutY ?? c.y ?? 0.43) }; });
  // title card: the question, centred in a pixel box
  let title = null;
  if (o.title) { const cv = pixelText(o.title.lines, { color: o.title.color ?? '#fff4c2', gap: 4 }), s = fitS(cv, o.title.s ?? 10, 960), box = document.createElement('div'); box.className = 'pxbox'; if (o.title.plain) box.style.display = 'none'; box.style.width = `${cv.width * s + 70}px`; box.style.height = `${cv.height * s + 64}px`; box.style.top = `${(o.title.y ?? 0.42) * 1920}px`; ui.appendChild(box); title = { ...o.title, box, el: mk(cv, s, 0.5, o.title.y ?? 0.42) }; }
  // end card: panel + icon + pixel lines
  let end = null;
  if (o.end) {
    const box = document.createElement('div'); box.className = 'pxbox'; box.style.width = '820px'; box.style.height = '700px'; box.style.top = `${(o.end.y ?? 0.45) * 1920}px`; ui.appendChild(box);
    const icon = document.createElement('img'); icon.src = o.end.icon; icon.className = 'px'; icon.style.width = icon.style.height = '180px'; icon.style.left = '540px'; icon.style.top = `${(o.end.y ?? 0.45) * 1920 - 225}px`; icon.style.imageRendering = 'auto'; ui.appendChild(icon);
    const rows = o.end.lines.map(([text, color, s, dy]) => { const cv = pixelText(text, { color }); return mk(cv, fitS(cv, s, 780), 0.5, (o.end.y ?? 0.45) + dy); });
    end = { ...o.end, box, icon, rows };
  }
  const tx = (el, x) => { if (o.crisp && el.dataset.w) { const w = `${+el.dataset.w * x}px`, h = `${+el.dataset.h * x}px`; if (el.style.width !== w) { el.style.width = w; el.style.height = h; } el.style.transform = 'translate(-50%, -50%)'; } else el.style.transform = `translate(-50%, -50%) scale(${x})`; };
  function update(t) {
    const inTitle = title && t >= title.t0 && t < title.t1, inEnd = end && t >= end.t0;
    for (const w of words) { const on = !inTitle && !inEnd && t >= w.t0 && t < w.t1; w.el.style.opacity = on ? 1 : 0; if (on) tx(w.el, pop(t - w.t0)); }
    for (const k of calls) { const on = !inEnd && t >= k.c.t0 && t < k.c.t1; k.el.style.opacity = on ? clamp((k.c.t1 - t) / 0.1) : 0; if (on) tx(k.el, pop(t - k.c.t0)); }
    if (title) { const a = t - title.t0, on = t >= title.t0 && t < title.t1, op = on ? clamp((title.t1 - t) / 0.15) : 0; title.el.style.opacity = op; title.box.style.opacity = op; if (on) { tx(title.el, pop(a)); title.box.style.transform = `translate(-50%, -50%) scale(${pop(a)})`; } }
    if (end) { const a = t - end.t0, op = clamp(a / 0.2); end.box.style.opacity = op; end.icon.style.opacity = op; end.rows.forEach((r, i) => { const ai = a - 0.25 - i * 0.18; r.style.opacity = ai > 0 ? 1 : 0; tx(r, pop(ai)); }); end.box.style.transform = `translate(-50%, -50%) scale(${pop(a)})`; end.icon.style.transform = `translate(-50%, -50%) scale(${pop(a - 0.1)})`; }
  }
  return { update };
}
