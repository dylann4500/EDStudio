// 049 (Scribe promo): the product on screen. Scribe's real handwriting glyph set (videos/049-scribe-promo/hand.json, copied from
// the Scribe repo's demo: 89 characters × 2 variants, alpha masks + width/height/descent ratios to the x-height) laid out and
// "written" one glyph at a time onto canvas textures, plus the Scribe app on a laptop screen (cream paper, the red pen-nib S logo,
// Georgia wordmark, deep-red accent #9a1c25 — the colours of tryscribe.ink).
//   const G = await loadHand('/videos/049-scribe-promo/hand.json');
//   const sheet = makeSheet(G, {...}); sheet.draw(p)            p = items written so far (glyphs count 1, a graph path counts `w`)
//   const scr = makeScreen(G, iconImg, sheet); scr.draw({ mode, k })
import * as THREE from 'three';

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
export { loadImg };

export async function loadHand(url, ink = '#1b2760') {
  const j = await (await fetch(url)).json(), G = {};
  for (const [ch, vars] of Object.entries(j.glyphs)) G[ch] = await Promise.all(vars.map(async (v) => {
    const img = await loadImg(v.maskDataURL), c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = ink; g.fillRect(0, 0, c.width, c.height);
    return { c, w: v.widthRatio, h: v.heightRatio, d: v.descentRatio };
  }));
  return G;
}

/** Lay out handwriting: `^x` = superscript x, `_x` = subscript x (Nov 9), `^{..}` / `_{..}` = a group. Returns glyph items
 *  {c, x, y, w, h} in writing order (canvas px, y down). Symbols the glyph set lacks are skipped (see writeHand for the pen). */
export function layoutHand(G, text, o = {}) { return layoutCore(G, text, o, null); }

/**
 * Subject packs (Nov 9, additive): layoutHand + the symbols hand.json lacks, drawn WITH THE PEN where they stand (the Scribe
 * README §Chemistry: "the arrows no practice sheet asks for are drawn with the pen", "subscripts and charges are the writer's own
 * digits and signs made small and lowered"): a capital O (the glyph set has none, and H₂0 reads as a zero), → (a long pen arrow:
 * the 29 px glyph is a smudge at reel size; `penArrow: false` keeps the glyph), ⇌ (two harpoons), ↑ ↓, °, · •, ′ ', *, ×, μ, $, %.
 * Every item carries `kind`: 'g' = glyph {c, x, y, w, h, rot}, 'p' = pen polyline {pts, w = its time weight, line = px width}.
 * Never `.map(q => ({...q, kind: 'g'}))` the result (that turns the pen strokes into broken glyphs).
 */
export function writeHand(G, text, o = {}) { return layoutCore(G, text, o, { capO: o.capO ?? true, penArrow: o.penArrow ?? true, glyphs: o.penGlyphs ?? '' }); }
// penGlyphs: letters to draw with the pen although hand.json has them. The demo hand's H is two loose strokes that read as "lt"
// (CH₄ → "Clt₄"), so penKit and rich sheets pass 'H' by default; writeHand alone keeps the glyph.

const SUB_DROP = 0.3;   // a subscript's baseline sits 0.3 u under the line (README: "made small and lowered")
function layoutCore(G, text, { x, y, u = 24, lineH = 2.4, seed = 1, track = 0.14, jit = 1 } = {}, pen) {
  let R = seed * 7919 + 17; const rnd = () => (R = (R * 16807) % 2147483647) / 2147483647;
  const out = []; let cx = x, cy = y, grp = 0;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i], sup = false, sub = false;
    if (ch === '^') { sup = true; ch = text[++i]; } else if (ch === '_') { sub = true; ch = text[++i]; }
    if ((sup || sub) && ch === '{') { grp = sup ? 1 : -1; continue; }   // ^{2-}, _{net}: a group (no 049–058 text has a brace)
    if (grp && ch === '}') { grp = 0; continue; }
    if (grp === 1) sup = true; else if (grp === -1) sub = true;
    if (ch === '\n') { cx = x; cy += lineH * u; continue; }
    if (ch === ' ') { cx += (0.55 + rnd() * 0.15) * u; continue; }
    if (pen) {
      const sym = PEN_SYMS[ch];
      if (sym && !(ch === 'O' && (G.O || !pen.capO)) && !(ch === '→' && !pen.penArrow) && !(PEN_OPT.includes(ch) && !pen.glyphs.includes(ch))) {
        const uu = sup || sub ? u * 0.62 : u, base = cy - (sup ? 0.8 * u : sub ? -SUB_DROP * u : 0) + (rnd() - 0.5) * 0.14 * u * jit;
        const J = (a) => (rnd() - 0.5) * a * uu * jit, line = Math.max(1.8, 0.13 * uu);
        const push = (pts, w = 1, ln = line) => out.push({ kind: 'p', pts, w, line: ln });
        cx = sym({ x: cx, base, vb: base - 0.2 * uu, ax: base - 0.86 * uu, uu, J, push, line, rnd }) + track * uu + (rnd() - 0.5) * 0.08 * u * jit;
        continue;
      }
    }
    const vars = G[ch] || G[ch.toLowerCase()] || G[ch.toUpperCase()] || (ch === 'O' ? G['0'] : null) || (ch === '−' ? G['-'] : null) || (ch === '×' ? G.x : null);
    if (!vars) { cx += 0.5 * u; continue; }
    const v = vars[Math.floor(rnd() * vars.length) % vars.length], uu = sup || sub ? u * 0.62 : u;
    const base = cy - (sup ? 0.8 * u : sub ? -SUB_DROP * u : 0) + (rnd() - 0.5) * 0.14 * u * jit;
    // descentRatio = how far the glyph's foot sits BELOW the baseline (y/g/p > 0, '=' < 0; the Scribe app's render.js: top =
    // heightRatio - descentRatio). Canvas y runs down, so the foot is base + d. Until Nov 8 this was base - d: every y/g/p floated
    // up ("busy" on the app screen had its y up in the logo) and '=' sank below the line.
    const w = v.w * uu, h = v.h * uu, bottom = base + v.d * uu;
    const it = { c: v.c, x: cx, y: bottom - h, w, h, rot: (rnd() - 0.5) * 0.06 * jit };
    if (pen) it.kind = 'g';
    out.push(it);
    cx += w + track * uu + (rnd() - 0.5) * 0.08 * u * jit;
  }
  return out;
}

// Pen-drawn symbols for writeHand: each gets {x (pen position), base (glyph baseline), vb (visual baseline), ax (the + / = axis),
// uu (size), J(a) (jitter ±a·uu/2), push(pts, weight, line)} and returns the x where the next character starts.
const arc = (cx, cy, rx, ry, a0, a1, n, J = () => 0, rot = 0) => { const pts = [], c = Math.cos(rot), s = Math.sin(rot); for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * (k / n), px = Math.cos(a) * rx + J(0.02), py = Math.sin(a) * ry + J(0.02); pts.push([cx + px * c - py * s, cy + px * s + py * c]); } return pts; };
const PEN_OPT = 'H';   // pen versions of letters the glyph set HAS: used only when asked for (writeHand penGlyphs)
const PEN_SYMS = {
  H: ({ x, vb, uu, J, push }) => { push([[x + 0.1 * uu + J(0.04), vb - 1.3 * uu], [x + 0.08 * uu, vb + J(0.03)]], 0.4); push([[x + 0.66 * uu + J(0.04), vb - 1.32 * uu], [x + 0.68 * uu, vb + J(0.03)]], 0.4);
    push([[x + 0.06 * uu, vb - 0.66 * uu + J(0.05)], [x + 0.72 * uu, vb - 0.7 * uu + J(0.05)]], 0.3); return x + 0.84 * uu; },
  O: ({ x, vb, uu, J, push }) => { push(arc(x + 0.5 * uu, vb - 0.64 * uu, 0.45 * uu, 0.64 * uu, -1.75, -1.75 - 2 * Math.PI - 0.3, 26, J), 1.1); return x + 1.0 * uu; },
  '→': ({ x, ax, uu, J, push }) => { const y0 = ax + J(0.06), x0 = x + 0.12 * uu, x1 = x + 1.75 * uu, y1 = y0 + J(0.08), hl = 0.36 * uu;
    const sh = []; for (let k = 0; k <= 8; k++) { const t = k / 8; sh.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * 0.04 * uu]); }
    push([...sh, [x1 - hl, y1 - 0.24 * uu + J(0.06)], [x1, y1], [x1 - hl + J(0.06), y1 + 0.24 * uu]], 1.5); return x + 1.95 * uu; },
  '⇌': ({ x, ax, uu, J, push }) => { const x0 = x + 0.12 * uu, x1 = x + 1.75 * uu, ya = ax - 0.17 * uu, yb = ax + 0.17 * uu;
    push([[x0, ya + J(0.04)], [(x0 + x1) / 2, ya - 0.03 * uu], [x1, ya + J(0.04)], [x1 - 0.34 * uu, ya - 0.24 * uu + J(0.05)]], 1);
    push([[x1 + J(0.06), yb], [(x0 + x1) / 2, yb + 0.03 * uu], [x0 + J(0.06), yb + J(0.04)], [x0 + 0.34 * uu, yb + 0.24 * uu + J(0.05)]], 1); return x + 1.95 * uu; },
  '↑': ({ x, vb, uu, J, push }) => { const cx = x + 0.3 * uu, y0 = vb, y1 = vb - 1.1 * uu; push([[cx + J(0.05), y0], [cx, y1], [cx - 0.22 * uu, y1 + 0.3 * uu], [cx, y1], [cx + 0.22 * uu + J(0.04), y1 + 0.3 * uu]], 0.8); return x + 0.65 * uu; },
  '↓': ({ x, vb, uu, J, push }) => { const cx = x + 0.3 * uu, y0 = vb - 1.1 * uu, y1 = vb; push([[cx + J(0.05), y0], [cx, y1], [cx - 0.22 * uu, y1 - 0.3 * uu], [cx, y1], [cx + 0.22 * uu + J(0.04), y1 - 0.3 * uu]], 0.8); return x + 0.65 * uu; },
  '°': ({ x, vb, uu, J, push }) => { push(arc(x + 0.18 * uu, vb - 1.15 * uu, 0.13 * uu, 0.13 * uu, -1.6, -1.6 - 2 * Math.PI - 0.2, 12, J), 0.4); return x + 0.42 * uu; },
  '·': ({ x, ax, uu, push }) => { push([[x + 0.15 * uu, ax], [x + 0.16 * uu, ax + 0.01 * uu]], 0.2, 0.2 * uu); return x + 0.33 * uu; },
  '•': ({ x, ax, uu, push }) => { push([[x + 0.18 * uu, ax], [x + 0.19 * uu, ax + 0.01 * uu]], 0.2, 0.3 * uu); return x + 0.4 * uu; },
  '′': ({ x, vb, uu, J, push }) => { push([[x + 0.24 * uu, vb - 1.3 * uu + J(0.05)], [x + 0.1 * uu, vb - 0.9 * uu]], 0.3); return x + 0.3 * uu; },
  "'": ({ x, vb, uu, J, push }) => { push([[x + 0.24 * uu, vb - 1.3 * uu + J(0.05)], [x + 0.1 * uu, vb - 0.9 * uu]], 0.3); return x + 0.3 * uu; },
  '*': ({ x, vb, uu, push }) => { const cx = x + 0.3 * uu, cy = vb - 1.0 * uu, r = 0.22 * uu;
    push([[cx, cy - r], [cx, cy + r]], 0.2); push([[cx - r * 0.87, cy - r * 0.5], [cx + r * 0.87, cy + r * 0.5]], 0.2); push([[cx - r * 0.87, cy + r * 0.5], [cx + r * 0.87, cy - r * 0.5]], 0.2); return x + 0.62 * uu; },
  '×': ({ x, ax, uu, J, push }) => { const cx = x + 0.32 * uu, r = 0.2 * uu; push([[cx - r, ax - r + J(0.04)], [cx + r, ax + r]], 0.3); push([[cx + r, ax - r], [cx - r + J(0.04), ax + r]], 0.3); return x + 0.66 * uu; },
  'μ': ({ x, vb, uu, J, push }) => { const L = x + 0.08 * uu, T = vb - 0.62 * uu;
    push([[L + J(0.03), vb + 0.42 * uu], [L, T], [L + 0.01 * uu, vb - 0.22 * uu], [L + 0.12 * uu, vb - 0.02 * uu], [L + 0.27 * uu, vb + 0.01 * uu], [L + 0.42 * uu, vb - 0.14 * uu], [L + 0.47 * uu, T + J(0.04)], [L + 0.47 * uu, vb - 0.12 * uu], [L + 0.56 * uu, vb + 0.01 * uu]], 0.8); return x + 0.72 * uu; },
  $: ({ x, vb, uu, J, push }) => { const P = [[0.56, -1.04], [0.4, -1.18], [0.18, -1.14], [0.08, -0.94], [0.2, -0.74], [0.46, -0.6], [0.58, -0.36], [0.5, -0.1], [0.28, 0], [0.04, -0.1]];
    push(P.map(([a, b]) => [x + a * uu + J(0.02), vb + b * uu]), 0.8); push([[x + 0.32 * uu, vb - 1.38 * uu], [x + 0.3 * uu + J(0.03), vb + 0.16 * uu]], 0.3); return x + 0.72 * uu; },
  '%': ({ x, vb, uu, J, push }) => { push(arc(x + 0.18 * uu, vb - 1.0 * uu, 0.13 * uu, 0.17 * uu, -1.6, -1.6 - 2 * Math.PI, 12, J), 0.4);
    push([[x + 0.66 * uu, vb - 1.25 * uu], [x + 0.08 * uu + J(0.04), vb + 0.05 * uu]], 0.4); push(arc(x + 0.58 * uu, vb - 0.22 * uu, 0.13 * uu, 0.17 * uu, -1.6, -1.6 - 2 * Math.PI, 12, J), 0.4); return x + 0.84 * uu; },
};

/** A hand-drawn polyline (a wobbly sketch): pts in canvas px. */
const TAU2 = Math.PI * 2;
const TAU = Math.PI * 2;
const BOLD = [[0, 0], [0.9, 0], [0, 0.9], [-0.6, 0.4]];   // a ballpoint is darker than the 29 px masks: draw each glyph four times, offset
const wobble = (pts, seed = 3, amp = 1.6) => { let R = seed; const r = () => (R = (R * 16807) % 2147483647) / 2147483647 - 0.5; return pts.map(([x, y]) => [x + r() * amp, y + r() * amp]); };

/**
 * A worksheet page (letter paper, 1024 × 1325). problems: [{ q: 'printed question', a: 'handwritten answer' | null, graph: bool, pre: bool }]
 * pre = written by Tyler before (always shown); the rest is written in order as p grows. Returns {canvas, tex, items, total, draw(p)}.
 */
export function makeSheet(G, { title = 'MATH 1B · PROBLEM SET 9', note = 'Due Nov 30, 11:59 PM  ·  HANDWRITTEN WORK ONLY', problems = [], name = 'Tyler', seed = 1, page = '', w = 1024, h = 1325, ink = '#26346b', rich = false, qFont = '500 28px Georgia, serif', qLineH = 36, subject = null } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const items = [], pre = [];
  const nameIt = layoutHand(G, name, { x: 196, y: 196, u: 26, seed: seed * 3 + 1 }).map((q) => ({ ...q, kind: 'g' }));
  pre.push(...nameIt);
  // 062 (additive): P.rows = how many row heights a problem takes (default 1, so old sheets lay out exactly as before)
  let y = 300; const rowH = (h - 340) / Math.max(1, problems.reduce((s2, P) => s2 + (P.rows ?? 1), 0));
  // rich (subject packs, Nov 9): rows sized by P.h (relative weights, default 1), answers through writeHand, P.fig(ctx) figures
  const sumH = problems.reduce((s, P) => s + (P.h ?? 1), 0), rowAt = (P) => (rich ? (h - 340) * (P.h ?? 1) / Math.max(1, sumH) : rowH);
  const printed = [];
  problems.forEach((P, i) => {
    printed.push({ text: P.q, y });
    const ax = 120, ay = y + 74;
    if (rich) {   // answer text (P.a at P.at = [x, dy] in the row, size P.au) then the figure P.fig(ctx), all in writing order
      const rh = rowAt(P), out = [], [tx, ty] = P.at ?? [ax, 74 + Math.max(0, String(P.q ?? '').split('\n').length - 1) * qLineH];
      if (P.a) out.push(...writeHand(G, P.a, { x: tx, y: y + ty, u: P.au ?? 30, lineH: P.lineH ?? 2.1, seed: seed * 23 + i, penGlyphs: P.penGlyphs ?? 'H' }));
      if (P.fig) out.push(...P.fig({ G, k: penKit(G, seed * 31 + i * 7 + 3), x: ax, y, w, h: rh, top: y + 28 + String(P.q ?? '').split('\n').length * qLineH, i, seed }));
      (P.pre ? pre : items).push(...out.map((q) => ({ ...q, pi: i })));
      y += rh;
      return;
    }
    if (P.graph) {   // axes + a parabola through (1,0) and (3,0), drawn as hand strokes
      const ox = 600, oy = y + 150, sx = 46, sy = 30;
      const axes = [[[ox - 40, oy], [ox + 260, oy]], [[ox + 0, oy + 70], [ox + 0, oy - 150]]].map((L, k) => ({ kind: 'p', pts: wobble(L, seed * 11 + k, 1.2), w: 5 }));
      // P.graph: true = the parabola y = x² − 4x + 3; or { fn: X → Y, x0, x1, label, xl, yl } (054: alertness vs hours awake)
      const GR = typeof P.graph === 'object' ? P.graph : { fn: (X) => X * X - 4 * X + 3, x0: -0.3, x1: 4.3, label: 'y=x^2-4x+3' };
      const par = []; for (let k = 0; k <= 40; k++) { const X = GR.x0 + (GR.x1 - GR.x0) * (k / 40), Y = GR.fn(X); par.push([ox + X * sx, oy - Y * sy]); }
      const curve = { kind: 'p', pts: wobble(par, seed * 13, 1.0), w: 14 };
      const lab = [GR.label && [GR.label, ox + 150, oy - 110], GR.yl && [GR.yl, ox + 8, oy - 158], GR.xl && [GR.xl, ox + 150, oy + 40]].filter(Boolean)
        .flatMap(([txt, lx, ly], j) => layoutHand(G, txt, { x: lx, y: ly, u: 20, seed: seed * 17 + i + j }).map((q) => ({ ...q, kind: 'g' })));
      const ans = P.a ? layoutHand(G, P.a, { x: ax, y: ay + 20, u: 28, seed: seed * 19 + i }).map((q) => ({ ...q, kind: 'g' })) : [];
      (P.pre ? pre : items).push(...[...ans, ...axes, curve, ...lab].map((q) => ({ ...q, pi: i })));
    } else if (P.lewis) {   // 055: a Lewis structure drawn by the pen — atoms in the hand, bond lines, lone-pair dots — + a short answer
      const ox = 660, oy = y + 62, U = 36;
      const atom = (ch, cx, cy, s) => { const it = layoutHand(G, ch, { x: 0, y: 0, u: U, seed: s, jit: 0.4 })[0]; return it ? { ...it, x: cx - it.w / 2, y: cy - it.h / 2, kind: 'g' } : null; };
      const bond = (x0, y0, x1, y1, s) => ({ kind: 'p', pts: wobble([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2], [x1, y1]], s, 0.9), w: 3, line: 4.5 });
      const dot = (x, yy) => ({ kind: 'p', pts: [[x, yy], [x + 0.7, yy + 0.5]], w: 0.6, line: 9 });
      const its = [];
      if (P.lewis === 'H2O') {   // bent: O with two single bonds to H and two lone pairs
        its.push(atom('O', ox, oy, seed * 31 + i), bond(ox - 24, oy + 14, ox - 82, oy + 42, seed * 43), atom('H', ox - 104, oy + 54, seed * 37 + i),
          bond(ox + 24, oy + 14, ox + 82, oy + 42, seed * 47), atom('H', ox + 104, oy + 54, seed * 41 + i),
          dot(ox - 32, oy - 26), dot(ox - 18, oy - 36), dot(ox + 18, oy - 36), dot(ox + 32, oy - 26));
      } else if (P.lewis === 'CO2') {   // linear: O=C=O, two lone pairs on each O
        const cy = oy + 14;
        its.push(atom('O', ox - 124, cy, seed * 53 + i), bond(ox - 102, cy - 6, ox - 24, cy - 6, seed * 59), bond(ox - 102, cy + 6, ox - 24, cy + 6, seed * 61), atom('C', ox, cy, seed * 67 + i),
          bond(ox + 24, cy - 6, ox + 102, cy - 6, seed * 71), bond(ox + 24, cy + 6, ox + 102, cy + 6, seed * 73), atom('O', ox + 124, cy, seed * 79 + i));
        for (const x0 of [ox - 124, ox + 124]) its.push(dot(x0 - 9, cy - 34), dot(x0 + 9, cy - 34), dot(x0 - 9, cy + 34), dot(x0 + 9, cy + 34));
      }
      const ans = P.a ? layoutHand(G, P.a, { x: ax, y: ay + 20, u: 28, seed: seed * 19 + i }).map((q) => ({ ...q, kind: 'g' })) : [];
      (P.pre ? pre : items).push(...[...ans, ...its.filter(Boolean)].map((q) => ({ ...q, pi: i })));
    } else if (P.chain) {   // 063 (additive): a hand-drawn food chain — each organism written + circled, hand arrows between them
      const cu = P.u ?? 26, cy = y + (P.dy ?? 104), out = []; let cx = P.x0 ?? 118;
      P.chain.forEach((label, k) => {
        const hs = layoutHand(G, label, { x: cx, y: cy, u: cu, seed: seed * 31 + i * 7 + k }).map((q) => ({ ...q, kind: 'g' }));
        const x0 = Math.min(...hs.map((q) => q.x)), x1 = Math.max(...hs.map((q) => q.x + q.w)), y0 = Math.min(...hs.map((q) => q.y)), y1 = Math.max(...hs.map((q) => q.y + q.h));
        const ex = (x0 + x1) / 2, ey = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 16, ry = (y1 - y0) / 2 + 14, ring = [];
        for (let j = 0; j <= 30; j++) { const a = -2.2 + (j / 30) * (TAU2 + 0.35); ring.push([ex + Math.cos(a) * rx, ey + Math.sin(a) * ry]); }
        out.push(...hs, { kind: 'p', pts: wobble(ring, seed * 37 + k, 1.4), w: 6, line: 3.4 });
        if (k < P.chain.length - 1) {
          const ax0 = x1 + 22, ax1 = ax0 + (P.gap ?? 54), ay = ey + 2;
          out.push({ kind: 'p', pts: wobble([[ax0, ay], [(ax0 + ax1) / 2, ay - 3], [ax1, ay]], seed * 41 + k, 1), w: 3, line: 4 },
            { kind: 'p', pts: wobble([[ax1 - 13, ay - 10], [ax1, ay], [ax1 - 13, ay + 10]], seed * 43 + k, 0.8), w: 2, line: 4 });
          cx = ax1 + 26;
        } else cx = x1;
      });
      if (P.caption) out.push(...layoutHand(G, P.caption, { x: P.x0 ?? 118, y: cy + 70, u: 24, seed: seed * 47 + i }).map((q) => ({ ...q, kind: 'g' })));
      (P.pre ? pre : items).push(...out.map((q) => ({ ...q, pi: i })));
    } else if (P.fbd) {   // 062: a free-body diagram drawn by hand — a little plane + four labelled arrows (items tagged body|lift|weight|thrust|drag|work)
      const cx = P.fbd.x ?? 700, cy = y + (P.fbd.dy ?? 200), A = P.fbd.len ?? 120, S2 = seed * 31 + i;
      const T = (tag, list) => list.map((q) => ({ ...q, tag, pi: i }));
      const stroke = (pts, wt, k) => ({ kind: 'p', pts: wobble(pts, S2 + k, 1.1), w: wt });
      const fus = []; for (let k = 0; k <= 28; k++) { const a = (k / 28) * TAU; fus.push([cx + Math.cos(a) * 74 * (Math.cos(a) > 0 ? 1 : 0.92), cy + Math.sin(a) * (Math.cos(a) > 0 ? 15 : 18)]); }
      const body = [stroke(fus, 9, 1), stroke([[cx - 58, cy - 12], [cx - 80, cy - 48], [cx - 62, cy - 48], [cx - 38, cy - 14]], 4, 2), stroke([[cx + 14, cy + 4], [cx - 22, cy + 30], [cx - 40, cy + 30], [cx - 16, cy + 6]], 4, 3)];
      const arrow = (x0, y0, x1, y1, k) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hx = -uy, hy = ux, hs = 20;
        return [stroke([[x0, y0], [x1, y1]], 6, k), stroke([[x1 - ux * hs + hx * hs * 0.6, y1 - uy * hs + hy * hs * 0.6], [x1, y1], [x1 - ux * hs - hx * hs * 0.6, y1 - uy * hs - hy * hs * 0.6]], 3, k + 1)].map((q) => ({ ...q, line: 5 })); };
      const lab = (text, x, yy, k) => layoutHand(G, text, { x, y: yy, u: 26, seed: S2 * 7 + k }).map((q) => ({ ...q, kind: 'g' }));
      const lift = [...arrow(cx, cy - 22, cx, cy - 22 - A, 10), ...lab('Lift', cx + 16, cy - A + 6, 1)];
      const weight = [...arrow(cx, cy + 22, cx, cy + 22 + A, 20), ...lab('Weight', cx + 16, cy + A + 4, 2)];
      const thrust = [...arrow(cx + 82, cy, cx + 82 + A * 0.85, cy, 30), ...lab('Thrust', cx + 92, cy - 18, 3)];
      const drag = [...arrow(cx - 88, cy, cx - 88 - A * 0.85, cy, 40), ...lab('Drag', cx - 88 - A * 0.85, cy - 18, 4)];
      const work = P.a ? layoutHand(G, P.a, { x: ax, y: ay + 6, u: 28, seed: seed * 19 + i }).map((q) => ({ ...q, kind: 'g' })) : [];
      (P.pre ? pre : items).push(...T('body', body), ...T('lift', lift), ...T('weight', weight), ...T('thrust', thrust), ...T('drag', drag), ...T('work', work));
    } else if (P.a) {
      const hs = layoutHand(G, P.a, { x: ax, y: ay, u: 30, seed: seed * 23 + i }).map((q) => ({ ...q, kind: 'g' }));
      (P.pre ? pre : items).push(...hs.map((q) => ({ ...q, pi: i })));
      if (P.cross) { const xs = hs.slice(0, P.cross); const x0 = xs[0].x - 4, x1 = xs[xs.length - 1].x + xs[xs.length - 1].w + 4, yy = ay - 10; (P.pre ? pre : items).push({ kind: 'p', pts: wobble([[x0, yy], [x1, yy - 4]], seed * 29 + i, 1), w: 3, line: 3, pi: i }); }
    }
    // 059 (additive): a hand-drawn figure after the answer — P.fig({G, x, y, top, rowH, seed, wobble, layoutHand}) → items
    // ({kind:'g'} glyphs from layoutHand, {kind:'p', pts, w} pen strokes). punnettFig() below draws a Punnett square.
    if (P.fig) (P.pre ? pre : items).push(...P.fig({ G, x: ax, y: ay, top: y, rowH, seed: seed * 31 + i, wobble, layoutHand }).map((q) => ({ ...q, pi: i })));
    y += rowH * (P.rows ?? 1);
  });
  const weight = (it) => (it.kind === 'p' ? it.w : 1);
  const total = items.reduce((s, it) => s + weight(it), 0);
  const drawItem = (it, f = 1) => {
    if (it.kind === 'g') {
      if (f >= 1) { g.save(); g.translate(it.x + it.w / 2, it.y + it.h / 2); g.rotate(it.rot || 0); for (const [ox, oy] of BOLD) g.drawImage(it.c, -it.w / 2 + ox, -it.h / 2 + oy, it.w, it.h); g.restore(); return; }
      g.save(); g.beginPath(); g.rect(it.x - 2, it.y - 4, (it.w + 4) * f, it.h + 8); g.clip(); for (const [ox, oy] of BOLD) g.drawImage(it.c, it.x + ox, it.y + oy, it.w, it.h); g.restore(); return;
    }
    const P = it.pts, n = Math.max(2, Math.ceil(P.length * f));
    g.strokeStyle = ink; g.lineWidth = it.line ?? 4.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    for (let k = 0; k < n; k++) { const [x, yy] = P[k]; k ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    if (f < 1 && n < P.length) { const a = P[n - 1], b = P[n], r = P.length * f - (n - 1); g.lineTo(a[0] + (b[0] - a[0]) * Math.max(0, r), a[1] + (b[1] - a[1]) * Math.max(0, r)); }
    g.stroke();
  };
  let lastKey = null;
  /** p = how much is written (in item weights); returns the canvas px of the pen tip (for the floating pen). */
  function draw(p = 0, force = false) {
    const key = Math.round(p * 6) / 6;
    let tip = [w / 2, h / 2];
    if (key === lastKey && !force) return draw.tip;
    lastKey = key;
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,150,200,.28)'; g.lineWidth = 1.5; for (let ly = 300; ly < h - 40; ly += 44) { g.beginPath(); g.moveTo(60, ly); g.lineTo(w - 60, ly); g.stroke(); }
    g.strokeStyle = 'rgba(220,90,90,.45)'; g.beginPath(); g.moveTo(96, 250); g.lineTo(96, h - 30); g.stroke();
    g.fillStyle = '#1d1d1d'; g.font = '600 38px Inter, Arial'; g.fillText(title, 60, 92);
    g.font = '500 24px Inter, Arial'; g.fillStyle = '#b3261e'; g.fillText(note, 60, 134);
    g.fillStyle = '#333'; g.font = '500 26px Inter, Arial'; g.fillText('Name:', 60, 196); g.fillRect(140, 202, 300, 2);
    if (page) { g.font = '500 22px Inter, Arial'; g.fillStyle = '#777'; g.fillText(page, w - 160, 92); }
    g.font = '500 30px Georgia, serif'; g.fillStyle = '#1d1d1d';
    if (rich) { g.font = qFont; printed.forEach((P2) => String(P2.text ?? '').split('\n').forEach((L, k) => g.fillText(L, 60, P2.y + 20 + k * qLineH))); }
    else printed.forEach((P2) => g.fillText(P2.text, 60, P2.y + 20));
    for (const it of pre) drawItem(it, 1);
    let acc = 0;
    for (const it of items) {
      const wt = weight(it); if (acc >= p) break;
      const f = Math.min(1, (p - acc) / wt); drawItem(it, f);
      if (it.kind === 'g') tip = [it.x + it.w * f, it.y + it.h * 0.6]; else { const k = Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f)); tip = it.pts[k]; }
      acc += wt;
    }
    tex.needsUpdate = true; draw.tip = tip; return tip;
  }
  draw.tip = [w / 2, h / 2];
  draw(0, true);
  const out = { canvas, tex, items, pre, total, draw, w, h };
  if (rich || subject) Object.assign(out, { problems, subject });   // subject packs: makeScreen reads the class + count from it
  return out;
}

/**
 * Pen figures for rich sheets (subject packs, Nov 9). Drawn the way the Scribe README (§Physics "How it looks") says a student
 * draws on an iPad: bare geometry, lines that bow once and land a little off their mark, open arrowheads that never repeat,
 * labels in the writer's own hand. Every call returns items (kind 'g' | 'p') in writing order; concatenate them in the order
 * the pen should draw them. Deterministic: the jitter comes from `seed` and the call order.
 *   const k = penKit(G, seed, { u: 26 });
 *   k.line(a, b) · k.poly(pts, {close}) · k.arrow(a, b, {head}) · k.dashed(a, b) · k.ellipse(cx, cy, rx, ry, {rot}) · k.dot(x, y)
 *   k.pair(x, y, 'h'|'v') (a lone pair) · k.text(str, x, y, {u, align: 'left'|'center'|'right', valign: 'middle' = y is the ink's centre}) (writeHand)
 *   k.grid(x, y, [colW…], [rowH…], {outer}) · k.ring(items, {pad}) (the hurried answer loop) · k.under(items) · k.bbox(items)
 *   k.label(str, at, to, {u}) = text + a leader line to a point (a labelled diagram) · k.vecArrow(from, to, label, {side})
 */
export function penKit(G, seed = 1, { u = 26, line = 3.6, amp = 1, penGlyphs = 'H' } = {}) {
  let R = (seed * 48271 + 11) % 2147483647 || 1; const rnd = () => (R = (R * 16807) % 2147483647) / 2147483647;
  const J = (a) => (rnd() - 0.5) * a * amp;
  let ts = seed * 13 + 5;
  const len = (pts) => { let L = 0; for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L; };
  const P = (pts, o = {}) => ({ kind: 'p', pts, w: o.w ?? Math.min(14, Math.max(0.4, len(pts) / 55)), line: o.line ?? line });
  // one bowed stroke a → b (bow = fraction of its length; miss = how far it lands off its mark, px)
  const seg = (a, b, o = {}) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
    const off = J(2) * (o.bow ?? 0.025) * L, m = o.miss ?? Math.min(3, L * 0.03), e = [b[0] + J(m), b[1] + J(m)], n = Math.max(4, Math.round(L / 14));
    const pts = []; for (let k = 0; k <= n; k++) { const t = k / n, s = 4 * t * (1 - t) * off; pts.push([a[0] + (e[0] - a[0]) * t + nx * s + J(0.5), a[1] + (e[1] - a[1]) * t + ny * s + J(0.5)]); }
    return pts;
  };
  const shift = (its, dx, dy) => its.map((it) => (it.kind === 'p' ? { ...it, pts: it.pts.map(([px, py]) => [px + dx, py + dy]) } : { ...it, x: it.x + dx, y: it.y + dy }));
  const bbox = (its) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const it of its) { if (it.kind === 'p') for (const [px, py] of it.pts) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } else { x0 = Math.min(x0, it.x); y0 = Math.min(y0, it.y); x1 = Math.max(x1, it.x + it.w); y1 = Math.max(y1, it.y + it.h); } }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
  const head = (tip, dir, hl, o = {}) => { const a = Math.atan2(dir[1], dir[0]), s1 = (o.spread ?? 0.42) + J(0.12), s2 = (o.spread ?? 0.42) + J(0.12), l1 = hl * (1 + J(0.2)), l2 = hl * (1 + J(0.2));
    return [[tip[0] - Math.cos(a - s1) * l1, tip[1] - Math.sin(a - s1) * l1], tip, [tip[0] - Math.cos(a + s2) * l2, tip[1] - Math.sin(a + s2) * l2]]; };
  const k = {
    rnd, J, bbox, shift,
    line: (a, b, o = {}) => [P(seg(a, b, o), o)],
    poly(pts, o = {}) { const all = [], Q = o.close ? [...pts, pts[0]] : pts; for (let i = 1; i < Q.length; i++) { const s = seg(Q[i - 1], Q[i], { ...o, miss: o.miss ?? 1.2 }); all.push(...(i > 1 ? s.slice(1) : s)); } return [P(all, o)]; },
    /** an arrow a → b with an open head (hl px); one stroke: shaft, then the two barbs */
    arrow(a, b, o = {}) { const s = seg(a, b, { ...o, miss: o.miss ?? 1.5 }), tip = s[s.length - 1], prev = s[Math.max(0, s.length - 3)];
      const hl = o.head ?? Math.min(18, Math.max(10, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.18));
      const hd = head(tip, [tip[0] - prev[0], tip[1] - prev[1]], hl, o); return [P([...s, hd[0], tip, hd[2]], o)]; },
    dashed(a, b, o = {}) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), d = o.dash ?? 11, gp = o.gap ?? 8, out = [];
      for (let s = 0; s < L; s += d + gp) { const t0 = s / L, t1 = Math.min(1, (s + d) / L); out.push(P([[a[0] + (b[0] - a[0]) * t0 + J(0.8), a[1] + (b[1] - a[1]) * t0 + J(0.8)], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]], { w: 0.15, line: o.line ?? line * 0.8 })); }
      return out; },
    ellipse(cx, cy, rx, ry, o = {}) { const a0 = o.start ?? -1.9 + J(0.3), over = o.over ?? 0.35, n = o.n ?? Math.max(16, Math.round((rx + ry) / 5));
      const pts = []; for (let i = 0; i <= n; i++) { const a = a0 - (2 * Math.PI + over) * (i / n), wob = 1 + J(o.wob ?? 0.03) + (i / n) * (o.drift ?? 0.04);
        const e = 2 / (o.sq ?? 2), ca = Math.cos(a), sa = Math.sin(a);   // sq > 2 = a superellipse (a squarer loop round a line of text)
        const px = Math.sign(ca) * Math.abs(ca) ** e * rx * wob, py = Math.sign(sa) * Math.abs(sa) ** e * ry * wob, r = o.rot ?? 0; pts.push([cx + px * Math.cos(r) - py * Math.sin(r), cy + px * Math.sin(r) + py * Math.cos(r)]); }
      return [P(pts, o)]; },
    dot: (x, y, o = {}) => [P([[x + J(1), y + J(1)], [x + 0.6, y + 0.4]], { w: o.w ?? 0.12, line: o.r ? o.r * 2 : 6.5 })],
    /** a lone pair: two dots 9 px apart, side by side ('h') or stacked ('v') */
    pair: (x, y, dir = 'h', o = {}) => { const g2 = (o.gap ?? 10) / 2; return dir === 'h' ? [...k.dot(x - g2, y, o), ...k.dot(x + g2, y, o)] : [...k.dot(x, y - g2, o), ...k.dot(x, y + g2, o)]; },
    text(str, x, y, o = {}) { const its = writeHand(G, str, { x, y, u: o.u ?? u, seed: o.seed ?? ts++, lineH: o.lineH ?? 2.1, jit: o.jit ?? 1, penGlyphs: o.penGlyphs ?? penGlyphs });
      if (!its.length || ((!o.align || o.align === 'left') && o.valign !== 'middle')) return its; const b = bbox(its);
      return shift(its, o.align === 'center' ? x - b.cx : o.align === 'right' ? x - b.x1 : 0, o.valign === 'middle' ? y - b.cy : 0); },
    grid(x, y, cols, rows, o = {}) { const W = cols.reduce((s, c) => s + c, 0), H = rows.reduce((s, r) => s + r, 0), out = [], run = o.run ?? 7, outer = o.outer ?? true;
      let yy = y; for (let r = 0; r <= rows.length; r++) { if (outer || (r > 0 && r < rows.length)) out.push(...k.line([x - J(run) - (outer ? 3 : 0), yy + J(2)], [x + W + J(run) + 3, yy + J(3)], { bow: 0.012, ...o })); yy += rows[r] ?? 0; }
      let xx = x; for (let c = 0; c <= cols.length; c++) { if (outer || (c > 0 && c < cols.length)) out.push(...k.line([xx + J(2), y - J(run) - 3], [xx + J(3), y + H + J(run) + 3], { bow: 0.012, ...o })); xx += cols[c] ?? 0; }
      return out; },
    ring(its, o = {}) { const b = bbox(its), pad = o.pad ?? 10;   // a squarish hurried loop (superellipse) that holds a line of text without growing tall
      return k.ellipse(b.cx, b.cy, b.w / 2 + pad + 8, b.h / 2 + pad * 0.6 + 3, { over: 0.5, drift: 0.05, sq: 3.2, n: 40, line: o.line ?? line * 0.9, w: o.w ?? 1.4, ...o }); },
    box(its, o = {}) { const b = bbox(its), p = o.pad ?? 9; return k.poly([[b.x0 - p, b.y0 - p], [b.x1 + p, b.y0 - p], [b.x1 + p, b.y1 + p], [b.x0 - p, b.y1 + p]], { close: true, ...o }); },
    under(its, o = {}) { const b = bbox(its); return k.line([b.x0 - 3, b.y1 + (o.dy ?? 6)], [b.x1 + 4, b.y1 + (o.dy ?? 6) + J(2)], { bow: 0.04, line: o.line ?? line * 0.85, ...o }); },
    /** a label written at `at` with a leader line from its near edge to `to` (a labelled cell, a force) */
    label(str, at, to, o = {}) { const t = k.text(str, at[0], at[1], o), b = bbox(t), from = [to[0] < b.x0 ? b.x0 - 8 : to[0] > b.x1 ? b.x1 + 8 : b.cx, to[0] < b.x0 || to[0] > b.x1 ? b.cy : (to[1] < b.y0 ? b.y0 - 6 : b.y1 + 6)];
      return [...t, ...k.line(from, to, { bow: 0.05, line: o.line ?? line * 0.75 })]; },
    /** a force/vector arrow from → to with its label written past the head (side: offset px along the arrow's normal) */
    vecArrow(from, to, str, o = {}) { const d = [to[0] - from[0], to[1] - from[1]], L = Math.hypot(...d) || 1, ux = d[0] / L, uy = d[1] / L, gap = o.gap ?? 16, side = o.side ?? 0;
      const lx = to[0] + ux * gap - uy * side, ly = to[1] + uy * gap + ux * side, its = k.text(str, 0, 0, o), b = bbox(its);
      return [...k.arrow(from, to, o), ...shift(its, lx - b.cx + (ux > 0.3 ? b.w / 2 : ux < -0.3 ? -b.w / 2 : 0), ly - b.cy + (uy > 0.3 ? b.h / 2 : uy < -0.3 ? -b.h / 2 : 0))]; },
  };
  return k;
}

/**
 * 059 (biology): a Punnett square drawn by the pen, for makeSheet's `fig` option. ox/oy = the square's top-left offset from the
 * answer origin (canvas px), cell = cell size; parents = [top, left] genotypes ('Bb' → alleles B, b). Writing order: the grid,
 * the parents' alleles, the four offspring, then `under` (e.g. '3 : 1') below the square. Returns fig(args) → items.
 */
export function punnettFig({ ox = 360, oy = -40, cell = 92, parents = ['Bb', 'Bb'], under = '', u = 30 } = {}) {
  return ({ G, x, y, seed, wobble: wb, layoutHand: lh }) => {
    const X = x + ox, Y = y + oy, n = cell, out = [];
    const line = (a, b, k) => out.push({ kind: 'p', pts: wb([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], seed * 7 + k, 1.6), w: 4, line: 4.2 });
    line([X, Y], [X + 2 * n, Y], 1); line([X + 2 * n, Y], [X + 2 * n, Y + 2 * n], 2); line([X + 2 * n, Y + 2 * n], [X, Y + 2 * n], 3); line([X, Y + 2 * n], [X, Y], 4);
    line([X + n, Y - 6], [X + n, Y + 2 * n + 6], 5); line([X - 6, Y + n], [X + 2 * n + 6, Y + n], 6);
    const top = parents[0].split(''), left = parents[1].split('');
    const txt = (s, cx, cy, k, uu = u) => { const it = lh(G, s, { x: 0, y: 0, u: uu, seed: seed * 13 + k }); const w = it.length ? it[it.length - 1].x + it[it.length - 1].w : 0; out.push(...it.map((q) => ({ ...q, x: q.x + cx - w / 2, y: q.y + cy + uu * 0.42, kind: 'g' }))); };
    top.forEach((a, k) => txt(a, X + n * (k + 0.5), Y - n * 0.32, 10 + k));
    left.forEach((a, k) => txt(a, X - n * 0.3, Y + n * (k + 0.5), 20 + k));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const g2 = [left[r], top[c]].sort((p, q) => (p === p.toUpperCase() ? -1 : 0) - (q === q.toUpperCase() ? -1 : 0)).join(''); txt(g2, X + n * (c + 0.5), Y + n * (r + 0.5), 30 + r * 2 + c, u * 1.05); }
    if (under) txt(under, X + n, Y + 2 * n + n * 0.5, 40, u * 1.1);
    return out;
  };
}

/** Scribe on a laptop (1280 × 800): modes home | scan | solve | write | done; k = progress 0..1 inside a mode. */
export function makeScreen(G, icon, sheet, { w = 1280, h = 800, n, name = 'Tyler', subject } = {}) {   // additive: n problems (053) + name = signature + avatar initial (050/052); defaults = 049
  // subject (Nov 9, subject packs): a pack ({label, tags, n}) or a plain label string ('Chemistry · Problem Set 4'); defaults to
  // the sheet's own pack (subjectSheet), `false` = none. With one, the class line shows over the status, and N ≤ 8 problems get
  // big tiles captioned with the pack's tags. Without one (049–058) N = n ?? 40 and nothing changes.
  const S = subject === false ? null : (subject ?? sheet.subject ?? null), SL = S ? (typeof S === 'string' ? S : S.label) : null, TAGS = (S && S.tags) || [];
  const N = n ?? (S ? (S.n ?? sheet.problems?.length) : undefined) ?? 40;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const busy = layoutHand(G, 'busy', { x: 0, y: 0, u: 52, seed: 5 });
  const sig = layoutHand(G, name, { x: 0, y: 0, u: 30, seed: 7 });
  const hand = (list, ox, oy, s = 1) => { for (const it of list) g.drawImage(it.c, ox + it.x * s, oy + it.y * s, it.w * s, it.h * s); };
  const bar = () => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, 30, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', 88, 52);
    if (typeof subject === 'string') { g.font = '600 26px Inter, Arial'; const tw = g.measureText(subject).width; g.fillStyle = '#e7f2e4'; g.beginPath(); g.roundRect(w / 2 - tw / 2 - 26, 18, tw + 52, 44, 22); g.fill(); g.fillStyle = '#2f7d46'; g.textAlign = 'center'; g.fillText(subject, w / 2, 49); g.textAlign = 'left'; }
    g.fillStyle = '#e8e2d6'; g.beginPath(); g.arc(w - 50, 39, 22, 0, 7); g.fill(); g.fillStyle = RED; g.font = '600 22px Inter, Arial'; g.textAlign = 'center'; g.fillText(name[0].toUpperCase(), w - 50, 47); g.textAlign = 'left';
  };
  const button = (x, y, bw, bh, text) => { g.fillStyle = RED; g.beginPath(); g.roundRect(x, y, bw, bh, 16); g.fill(); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.textAlign = 'center'; g.fillText(text, x + bw / 2, y + bh / 2 + 11); g.textAlign = 'left'; };
  const chip = (x, y) => { if (!subject) return; g.font = '600 24px Inter, Arial'; const tw = g.measureText(subject.toUpperCase()).width + 36; g.fillStyle = 'rgba(154,28,37,.12)'; g.beginPath(); g.roundRect(x, y - 30, tw, 40, 20); g.fill(); g.fillStyle = RED; g.fillText(subject.toUpperCase(), x + 18, y - 2); };
  let lastKey = '';
  function draw({ mode = 'home', k = 0 } = {}) {
    const key = mode + ':' + Math.round(k * 40);
    if (key === lastKey && mode !== 'write') return; lastKey = key;
    g.fillStyle = CREAM; g.fillRect(0, 0, w, h); bar();
    if (mode === 'home') {
      g.drawImage(icon, w / 2 - 110, 140, 220, 220);
      g.fillStyle = '#1d1d1d'; g.font = '64px Georgia, serif'; g.textAlign = 'center';
      g.fillText('Never do', w / 2 - 330, 480); g.fillText('work again.', w / 2 + 210, 480);
      g.fillText('home', w / 2 - 82, 480); g.textAlign = 'left';
      g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2 - 160, 462); g.lineTo(w / 2 - 4, 456); g.stroke();
      hand(busy, w / 2 - 150, 412, 1); hand(busy, w / 2 - 149.2, 412, 1);
      g.fillStyle = '#555'; g.font = '500 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('Your homework, in your handwriting.', w / 2, 560); g.textAlign = 'left';
      button(w / 2 - 200, 610, 400, 84, 'Upload assignment');
    } else if (mode === 'scan' || mode === 'solve') {
      g.save(); g.translate(170, 140); g.rotate(-0.03); g.drawImage(sheet.canvas, 0, 0, 430, 556); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(0, 0, 430, 556);
      if (mode === 'scan') { const sy = 556 * k; g.fillStyle = 'rgba(154,28,37,.18)'; g.fillRect(0, 0, 430, sy); g.fillStyle = RED; g.fillRect(-8, sy - 3, 446, 6); }
      g.restore();
      if (SL) { g.fillStyle = RED; g.font = '700 24px Inter, Arial'; g.fillText(`${SL.toUpperCase()} · ${N} PROBLEMS`, 680, 132); }
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif';
      const n = mode === 'solve' ? Math.round(N * k) : 0;
      g.fillText(mode === 'scan' ? `Reading ${N} problem${N === 1 && S ? '' : 's'}…` : n >= N ? `All ${N} solved.` : `Solving… ${n}/${N}`, 680, 190);
      if (S && N <= 8) {   // a few problems: big tiles, each captioned with its kind (Balance, Lewis, ICE table…)
        const s = Math.min(112, (500 - (N - 1) * 14) / N);
        for (let i = 0; i < N; i++) {
          const cx = 680 + i * (s + 14), cy = 250, done = i < n;
          g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx, cy, s, s, 14); g.fill();
          g.fillStyle = done ? '#fff' : '#8a8578'; g.font = `600 ${Math.round(s * 0.36)}px Inter, Arial`; g.textAlign = 'center'; g.fillText(done ? '✓' : String(i + 1), cx + s / 2, cy + s * 0.62);
          if (TAGS[i] && s >= 64) { g.fillStyle = done ? '#2f6e48' : '#6b665c'; g.font = `500 ${s >= 96 ? 17 : 14}px Inter, Arial`; g.fillText(TAGS[i], cx + s / 2, cy + s + 28); }
          g.textAlign = 'left';
        }
      } else for (let i = 0; i < N; i++) {
        const cx = 680 + (i % 8) * 64, cy = 240 + Math.floor(i / 8) * 64, done = i < n;
        g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx, cy, 54, 54, 10); g.fill();
        g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 22px Inter, Arial'; g.textAlign = 'center'; g.fillText(done ? '✓' : String(i + 1), cx + 27, cy + 35); g.textAlign = 'left';
      }
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(680, 590, 500, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(680, 590, 500 * (mode === 'scan' ? k * 0.15 : 0.15 + 0.85 * k), 18, 9); g.fill();
    } else if (mode === 'write' || mode === 'done') {
      g.drawImage(sheet.canvas, 150, 110, 500, 647); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(150, 110, 500, 647);
      if (SL) { g.fillStyle = RED; g.font = '600 22px Inter, Arial'; g.fillText(SL.toUpperCase(), 722, 140); }
      g.fillStyle = '#1d1d1d'; g.font = '46px Georgia, serif'; g.fillText(mode === 'done' ? `Done. ${N}/${N}.` : 'Writing it in', 720, 200);
      if (mode !== 'done') g.fillText('your handwriting…', 720, 258);
      if (typeof subject === 'string') { g.fillStyle = '#2f7d46'; g.font = '600 26px Inter, Arial'; g.fillText(subject + ' · diagrams drawn by hand', 720, mode === 'done' ? 256 : 300); }
      g.fillStyle = '#6b665c'; g.font = '500 24px Inter, Arial';
      g.fillText('Handwriting', 720, 330); hand(sig, 900, 330, 1);
      g.fillText('Messiness', 720, 390); for (let i = 0; i < 5; i++) { g.fillStyle = i < 4 ? RED : '#d8d1c3'; g.fillRect(900 + i * 34, 372, 26, 22); }
      g.fillStyle = '#6b665c'; g.fillText('Ink', 720, 450); g.fillStyle = '#26346b'; g.beginPath(); g.arc(912, 442, 14, 0, 7); g.fill(); g.fillStyle = '#6b665c'; g.fillText('Ballpoint · navy', 940, 450);
      if (mode === 'done') button(720, 520, 420, 84, 'Download PDF');
    }
    tex.needsUpdate = true;
  }
  draw({ mode: 'home' });
  return { canvas, tex, draw };
}
