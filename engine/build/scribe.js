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

/** Lay out handwriting: `^x` = superscript x. Returns glyph items {c, x, y, w, h} in writing order (canvas px, y down). */
export function layoutHand(G, text, { x, y, u = 24, lineH = 2.4, seed = 1, track = 0.14, jit = 1 } = {}) {
  let R = seed * 7919 + 17; const rnd = () => (R = (R * 16807) % 2147483647) / 2147483647;
  const out = []; let cx = x, cy = y;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i], sup = false;
    if (ch === '^') { sup = true; ch = text[++i]; }
    if (ch === '\n') { cx = x; cy += lineH * u; continue; }
    if (ch === ' ') { cx += (0.55 + rnd() * 0.15) * u; continue; }
    const vars = G[ch] || G[ch.toLowerCase()] || G[ch.toUpperCase()] || (ch === 'O' ? G['0'] : null) || (ch === '−' ? G['-'] : null) || (ch === '×' ? G.x : null);
    if (!vars) { cx += 0.5 * u; continue; }
    const v = vars[Math.floor(rnd() * vars.length) % vars.length], uu = sup ? u * 0.62 : u;
    const base = cy - (sup ? 0.8 * u : 0) + (rnd() - 0.5) * 0.14 * u * jit;
    // descentRatio = how far the glyph's foot sits BELOW the baseline (y/g/p > 0, '=' < 0; the Scribe app's render.js: top =
    // heightRatio - descentRatio). Canvas y runs down, so the foot is base + d. Until Nov 8 this was base - d: every y/g/p floated
    // up ("busy" on the app screen had its y up in the logo) and '=' sank below the line.
    const w = v.w * uu, h = v.h * uu, bottom = base + v.d * uu;
    out.push({ c: v.c, x: cx, y: bottom - h, w, h, rot: (rnd() - 0.5) * 0.06 * jit });
    cx += w + track * uu + (rnd() - 0.5) * 0.08 * u * jit;
  }
  return out;
}

/** A hand-drawn polyline (a wobbly sketch): pts in canvas px. */
const BOLD = [[0, 0], [0.9, 0], [0, 0.9], [-0.6, 0.4]];   // a ballpoint is darker than the 29 px masks: draw each glyph four times, offset
const wobble = (pts, seed = 3, amp = 1.6) => { let R = seed; const r = () => (R = (R * 16807) % 2147483647) / 2147483647 - 0.5; return pts.map(([x, y]) => [x + r() * amp, y + r() * amp]); };

/**
 * A worksheet page (letter paper, 1024 × 1325). problems: [{ q: 'printed question', a: 'handwritten answer' | null, graph: bool, pre: bool }]
 * pre = written by Tyler before (always shown); the rest is written in order as p grows. Returns {canvas, tex, items, total, draw(p)}.
 */
export function makeSheet(G, { title = 'MATH 1B · PROBLEM SET 9', note = 'Due Nov 30, 11:59 PM  ·  HANDWRITTEN WORK ONLY', problems = [], name = 'Tyler', seed = 1, page = '', w = 1024, h = 1325, ink = '#26346b' } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const items = [], pre = [];
  const nameIt = layoutHand(G, name, { x: 196, y: 196, u: 26, seed: seed * 3 + 1 }).map((q) => ({ ...q, kind: 'g' }));
  pre.push(...nameIt);
  let y = 300; const rowH = (h - 340) / Math.max(1, problems.length);
  const printed = [];
  problems.forEach((P, i) => {
    printed.push({ text: P.q, y });
    const ax = 120, ay = y + 74;
    if (P.graph) {   // axes + a parabola through (1,0) and (3,0), drawn as hand strokes
      const ox = 600, oy = y + 150, sx = 46, sy = 30;
      const axes = [[[ox - 40, oy], [ox + 260, oy]], [[ox + 0, oy + 70], [ox + 0, oy - 150]]].map((L, k) => ({ kind: 'p', pts: wobble(L, seed * 11 + k, 1.2), w: 5 }));
      const par = []; for (let k = 0; k <= 40; k++) { const X = -0.3 + 4.6 * (k / 40), Y = X * X - 4 * X + 3; par.push([ox + X * sx, oy - Y * sy]); }
      const curve = { kind: 'p', pts: wobble(par, seed * 13, 1.0), w: 14 };
      const lab = layoutHand(G, 'y=x^2-4x+3', { x: ox + 150, y: oy - 110, u: 20, seed: seed * 17 + i }).map((q) => ({ ...q, kind: 'g' }));
      const ans = P.a ? layoutHand(G, P.a, { x: ax, y: ay + 20, u: 28, seed: seed * 19 + i }).map((q) => ({ ...q, kind: 'g' })) : [];
      (P.pre ? pre : items).push(...[...ans, ...axes, curve, ...lab].map((q) => ({ ...q, pi: i })));
    } else if (P.a) {
      const hs = layoutHand(G, P.a, { x: ax, y: ay, u: 30, seed: seed * 23 + i }).map((q) => ({ ...q, kind: 'g' }));
      (P.pre ? pre : items).push(...hs.map((q) => ({ ...q, pi: i })));
      if (P.cross) { const xs = hs.slice(0, P.cross); const x0 = xs[0].x - 4, x1 = xs[xs.length - 1].x + xs[xs.length - 1].w + 4, yy = ay - 10; (P.pre ? pre : items).push({ kind: 'p', pts: wobble([[x0, yy], [x1, yy - 4]], seed * 29 + i, 1), w: 3, line: 3, pi: i }); }
    }
    y += rowH;
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
    printed.forEach((P2) => g.fillText(P2.text, 60, P2.y + 20));
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
  return { canvas, tex, items, pre, total, draw, w, h };
}

/** Scribe on a laptop (1280 × 800): modes home | scan | solve | write | done; k = progress 0..1 inside a mode. */
export function makeScreen(G, icon, sheet, { w = 1280, h = 800 } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const busy = layoutHand(G, 'busy', { x: 0, y: 0, u: 52, seed: 5 });
  const sig = layoutHand(G, 'Tyler', { x: 0, y: 0, u: 30, seed: 7 });
  const hand = (list, ox, oy, s = 1) => { for (const it of list) g.drawImage(it.c, ox + it.x * s, oy + it.y * s, it.w * s, it.h * s); };
  const bar = () => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, 30, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', 88, 52);
    g.fillStyle = '#e8e2d6'; g.beginPath(); g.arc(w - 50, 39, 22, 0, 7); g.fill(); g.fillStyle = RED; g.font = '600 22px Inter, Arial'; g.textAlign = 'center'; g.fillText('T', w - 50, 47); g.textAlign = 'left';
  };
  const button = (x, y, bw, bh, text) => { g.fillStyle = RED; g.beginPath(); g.roundRect(x, y, bw, bh, 16); g.fill(); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.textAlign = 'center'; g.fillText(text, x + bw / 2, y + bh / 2 + 11); g.textAlign = 'left'; };
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
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif';
      const n = mode === 'solve' ? Math.round(40 * k) : 0;
      g.fillText(mode === 'scan' ? 'Reading 40 problems…' : n >= 40 ? 'All 40 solved.' : `Solving… ${n}/40`, 680, 190);
      for (let i = 0; i < 40; i++) {
        const cx = 680 + (i % 8) * 64, cy = 240 + Math.floor(i / 8) * 64, done = i < n;
        g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx, cy, 54, 54, 10); g.fill();
        g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 22px Inter, Arial'; g.textAlign = 'center'; g.fillText(done ? '✓' : String(i + 1), cx + 27, cy + 35); g.textAlign = 'left';
      }
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(680, 590, 500, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(680, 590, 500 * (mode === 'scan' ? k * 0.15 : 0.15 + 0.85 * k), 18, 9); g.fill();
    } else if (mode === 'write' || mode === 'done') {
      g.drawImage(sheet.canvas, 150, 110, 500, 647); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(150, 110, 500, 647);
      g.fillStyle = '#1d1d1d'; g.font = '46px Georgia, serif'; g.fillText(mode === 'done' ? 'Done. 40/40.' : 'Writing it in', 720, 200);
      if (mode !== 'done') g.fillText('your handwriting…', 720, 258);
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
