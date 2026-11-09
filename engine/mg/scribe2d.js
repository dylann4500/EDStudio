// Scribe in the motion-graphics look (Scribe promos, docs/lanes/scribe.md): a worksheet whose answers AND FIGURES are written
// stroke by stroke in Scribe's real handwriting glyphs (videos/049-scribe-promo/hand.json via engine/build/scribe.js layoutHand),
// and the Scribe phone app drawn flat (cream paper, the red pen-nib logo, Georgia wordmark, #9a1c25 — tryscribe.ink's colours).
//   const sheet = makeWorksheet(G, { subject: 'PHYSICS', title, note, name, problems: [{ q, a: ['line', …], fig: (F) => {...} }] })
//     fig(F) builds figure strokes: F.line([[x,y],…]), F.arc(cx, cy, r, a0, a1), F.curve(fn, x0, x1, …), F.text('I', x, y, u)
//     sheet.draw(p) writes p units (a glyph = 1, a stroke = its weight) and returns the pen tip [x, y] (page px)
//   scribeApp(g, x, y, w, h, { mode: 'home'|'camera'|'scan'|'solve'|'write'|'done', k, sheet, icon, n, name })   paints a phone screen
import { layoutHand } from '../build/scribe.js';

const BOLD = [[0, 0], [0.9, 0], [0, 0.9], [-0.6, 0.4]];
export const SCRIBE = { red: '#9a1c25', cream: '#f3f1eb', paper: '#fffdf6', ink: '#26346b' };

function wob(P, seed = 3, amp = 1.4) { let R = seed * 9301 + 49297; const r = () => ((R = (R * 16807) % 2147483647) / 2147483647) - 0.5; return P.map(([x, y]) => [x + r() * amp, y + r() * amp]); }

export function makeWorksheet(G, o = {}) {
  const w = o.w ?? 1024, h = o.h ?? 1325, ink = o.ink ?? SCRIBE.ink, seed = o.seed ?? 1;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; const g = canvas.getContext('2d');
  const items = [], pre = [], printed = [];
  pre.push(...layoutHand(G, o.name ?? 'Sam', { x: 196, y: 214, u: 28, seed: seed * 3 + 1 }).map((q) => ({ ...q, kind: 'g' })));
  const probs = o.problems ?? [];
  let y = o.top ?? 318; const rowH = (h - y - 40) / Math.max(1, probs.length);
  probs.forEach((P, i) => {
    printed.push({ text: P.q, y, size: P.qSize ?? 28 });
    const list = [];
    // figure first or after the working (P.figFirst)
    const fig = [];
    if (P.fig) {
      const F = {
        line: (pts, wt = 6, lw = 4) => fig.push({ kind: 'p', pts: wob(pts, seed * 31 + fig.length, 1.1), w: wt, line: lw }),
        arc: (cx, cy, r, a0, a1, wt = 5, lw = 4, n = 28) => fig.push({ kind: 'p', pts: wob(Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * (k / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }), seed * 37 + fig.length, 0.9), w: wt, line: lw }),
        curve: (fn, x0, x1, ox, oy, sx, sy, wt = 12, lw = 4.5, n = 40) => fig.push({ kind: 'p', pts: wob(Array.from({ length: n + 1 }, (_, k) => { const X = x0 + (x1 - x0) * (k / n); return [ox + X * sx, oy - fn(X) * sy]; }), seed * 41 + fig.length, 0.9), w: wt, line: lw }),
        text: (s, tx, ty, u = 22) => fig.push(...layoutHand(G, s, { x: tx, y: ty, u, seed: seed * 43 + fig.length }).map((q) => ({ ...q, kind: 'g' }))),
        dot: (cx, cy, r = 6) => fig.push({ kind: 'p', pts: Array.from({ length: 13 }, (_, k) => [cx + Math.cos(k / 12 * Math.PI * 2) * r, cy + Math.sin(k / 12 * Math.PI * 2) * r]), w: 2, line: 5 }),
        y0: y, rowH,
      };
      P.fig(F);
    }
    const ax = P.ax ?? 110, u = P.u ?? 28; let ay = y + (P.ay ?? 70);
    const work = [];
    for (const L of P.a ?? []) { work.push(...layoutHand(G, L, { x: ax, y: ay, u, seed: seed * 23 + i * 7 + work.length }).map((q) => ({ ...q, kind: 'g' }))); ay += u * (P.lineH ?? 2.05); }
    if (P.box) { const last = work[work.length - 1], first = work.find((q) => q.y > last.y - u * 1.2) ?? last; if (last) { const x0 = first.x - 10, x1 = last.x + last.w + 12, y0 = last.y - 12, y1 = last.y + last.h + 10; work.push({ kind: 'p', pts: wob([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0 + 2]], seed * 47 + i, 1.2), w: 5, line: 3.5 }); } }
    list.push(...(P.figFirst ? [...fig, ...work] : [...work, ...fig]));
    (P.pre ? pre : items).push(...list.map((q) => ({ ...q, pi: i })));
    y += P.h ?? rowH;
  });
  const weight = (it) => (it.kind === 'p' ? it.w : 1), total = items.reduce((s, it) => s + weight(it), 0);
  const drawItem = (it, f = 1) => {
    if (it.kind === 'g') {
      if (f >= 1) { g.save(); g.translate(it.x + it.w / 2, it.y + it.h / 2); g.rotate(it.rot || 0); for (const [ox, oy] of BOLD) g.drawImage(it.c, -it.w / 2 + ox, -it.h / 2 + oy, it.w, it.h); g.restore(); return; }
      g.save(); g.beginPath(); g.rect(it.x - 2, it.y - 4, (it.w + 4) * f, it.h + 8); g.clip(); for (const [ox, oy] of BOLD) g.drawImage(it.c, it.x + ox, it.y + oy, it.w, it.h); g.restore(); return;
    }
    const P = it.pts, n = Math.max(2, Math.ceil(P.length * f));
    g.strokeStyle = ink; g.lineWidth = it.line ?? 4.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    for (let k = 0; k < Math.min(n, P.length); k++) { const [x, yy] = P[k]; k ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  };
  let lastKey = null;
  function draw(p = 0, force = false) {
    const key = Math.round(p * 8) / 8; if (key === lastKey && !force) return draw.tip; lastKey = key;
    let tip = [w / 2, h / 2];
    g.fillStyle = SCRIBE.paper; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,150,200,.26)'; g.lineWidth = 1.5; for (let ly = 300; ly < h - 40; ly += 46) { g.beginPath(); g.moveTo(56, ly); g.lineTo(w - 56, ly); g.stroke(); }
    g.strokeStyle = 'rgba(220,90,90,.42)'; g.beginPath(); g.moveTo(92, 250); g.lineTo(92, h - 30); g.stroke();
    g.fillStyle = '#1d1d1d'; g.font = '700 40px Inter, Arial'; g.textBaseline = 'alphabetic'; g.fillText(o.title ?? 'PHYSICS · PROBLEM SET 7', 56, 96);
    g.font = '600 24px Inter, Arial'; g.fillStyle = '#b3261e'; g.fillText(o.note ?? '40 PROBLEMS  ·  HANDWRITTEN WORK ONLY  ·  DUE 11:59 PM', 56, 142);
    g.fillStyle = '#333'; g.font = '600 26px Inter, Arial'; g.fillText('Name:', 56, 214); g.fillRect(140, 220, 300, 2);
    if (o.page) { g.font = '600 22px Inter, Arial'; g.fillStyle = '#777'; g.fillText(o.page, w - 150, 96); }
    g.fillStyle = '#1d1d1d';
    for (const P of printed) { g.font = `500 ${P.size}px Georgia, serif`; wrap(g, P.text, 56, P.y + 18, w - 112, P.size * 1.25); }
    for (const it of pre) drawItem(it, 1);
    let acc = 0;
    for (const it of items) { const wt = weight(it); if (acc >= p) break; const f = Math.min(1, (p - acc) / wt); drawItem(it, f);
      if (it.kind === 'g') tip = [it.x + it.w * f, it.y + it.h * 0.6]; else { const k = Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f)); tip = it.pts[k]; }
      acc += wt; }
    draw.tip = tip; return tip;
  }
  draw.tip = [w / 2, h / 2]; draw(0, true);
  return { canvas, items, total, draw, w, h };
}
function wrap(g, text, x, y, maxW, lh) { const ws = text.split(' '); let line = ''; for (const wd of ws) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = wd; } else line = t; } if (line) g.fillText(line, x, y); }

/** the Scribe app as a phone screen, painted into the rect (x, y, w, h) of g. */
export function scribeApp(g, x, y, w, h, o = {}) {
  const { mode = 'home', k = 0, sheet, icon, n: N = 40, name = 'Sam' } = o, R = SCRIBE.red;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = mode === 'camera' ? '#111522' : SCRIBE.cream; g.fillRect(x, y, w, h);
  const bar = h * 0.085, S = w / 400;   // design at 400 px wide
  const T = (s, tx, ty, font, col = '#1d1d1d', al = 'left') => { g.fillStyle = col; g.font = font; g.textAlign = al; g.textBaseline = 'middle'; g.fillText(s, tx, ty); };
  if (mode !== 'camera') {
    g.fillStyle = '#fbfaf6'; g.fillRect(x, y, w, bar); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y + bar, w, 2 * S);
    if (icon) g.drawImage(icon, x + 16 * S, y + bar * 0.18, bar * 0.64, bar * 0.64);
    T('Scribe', x + 16 * S + bar * 0.75, y + bar * 0.52, `${30 * S}px Georgia, serif`);
    g.fillStyle = '#e8e2d6'; g.beginPath(); g.arc(x + w - 30 * S, y + bar / 2, 16 * S, 0, 7); g.fill(); T(name[0].toUpperCase(), x + w - 30 * S, y + bar / 2 + S, `600 ${17 * S}px Inter, Arial`, R, 'center');
  }
  const cy = y + bar, ch = h - bar;
  const page = (px, py, pw, rot = 0) => { if (!sheet) return; const ph = pw * sheet.h / sheet.w; g.save(); g.translate(px + pw / 2, py + ph / 2); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 14 * S; g.drawImage(sheet.canvas, -pw / 2, -ph / 2, pw, ph); g.restore(); return ph; };
  const button = (bx, by, bw, bh, text) => { g.fillStyle = R; g.beginPath(); g.roundRect(bx, by, bw, bh, bh / 2); g.fill(); T(text, bx + bw / 2, by + bh / 2 + S, `600 ${20 * S}px Inter, Arial`, '#fff', 'center'); };
  if (mode === 'home') {
    if (icon) g.drawImage(icon, x + w / 2 - 70 * S, cy + 70 * S, 140 * S, 140 * S);
    T('Your homework,', x + w / 2, cy + 260 * S, `${32 * S}px Georgia, serif`, '#1d1d1d', 'center'); T('in your handwriting.', x + w / 2, cy + 300 * S, `${32 * S}px Georgia, serif`, '#1d1d1d', 'center');
    button(x + 60 * S, cy + 360 * S, w - 120 * S, 64 * S, 'Upload assignment');
  } else if (mode === 'camera') {
    page(x + 30 * S, y + 120 * S, w - 60 * S, -0.04);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4 * S; const m = 40 * S, L = 40 * S;
    for (const [cx2, cy2, sx, sy] of [[x + m, y + 100 * S, 1, 1], [x + w - m, y + 100 * S, -1, 1], [x + m, y + h - 190 * S, 1, -1], [x + w - m, y + h - 190 * S, -1, -1]]) { g.beginPath(); g.moveTo(cx2, cy2 + sy * L); g.lineTo(cx2, cy2); g.lineTo(cx2 + sx * L, cy2); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, y + h - 150 * S, w, 150 * S);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w / 2, y + h - 78 * S, 38 * S * (1 - 0.15 * Math.sin(Math.min(1, k) * Math.PI)), 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 5 * S; g.beginPath(); g.arc(x + w / 2, y + h - 78 * S, 48 * S, 0, 7); g.stroke();
    T('PHOTO', x + w / 2, y + h - 140 * S, `700 ${15 * S}px Inter, Arial`, '#ffd23f', 'center');
  } else if (mode === 'scan' || mode === 'solve') {
    const ph = page(x + 70 * S, cy + 30 * S, w - 140 * S, -0.02) ?? 300 * S;
    if (mode === 'scan') { const sy = cy + 30 * S + ph * k; g.fillStyle = 'rgba(154,28,37,.18)'; g.fillRect(x + 70 * S, cy + 30 * S, w - 140 * S, ph * k); g.fillStyle = R; g.fillRect(x + 60 * S, sy - 3 * S, w - 120 * S, 6 * S); }
    const n = mode === 'solve' ? Math.round(N * k) : 0, gy = cy + 50 * S + ph;
    T(mode === 'scan' ? `Reading ${N} problems…` : n >= N ? `All ${N} solved.` : `Solving… ${n}/${N}`, x + w / 2, gy, `${26 * S}px Georgia, serif`, '#1d1d1d', 'center');
    const cols = 10, cell = (w - 60 * S) / cols;
    for (let i = 0; i < N; i++) { const cx2 = x + 30 * S + (i % cols) * cell, cy2 = gy + 30 * S + Math.floor(i / cols) * cell, done = i < n;
      g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx2 + 3 * S, cy2 + 3 * S, cell - 6 * S, cell - 6 * S, 7 * S); g.fill();
      T(done ? '✓' : String(i + 1), cx2 + cell / 2, cy2 + cell / 2 + S, `600 ${13 * S}px Inter, Arial`, done ? '#fff' : '#8a8578', 'center'); }
  } else if (mode === 'write' || mode === 'done') {
    page(x + 24 * S, cy + 22 * S, w - 48 * S, 0);
    g.fillStyle = 'rgba(251,250,246,.96)'; g.fillRect(x, y + h - 120 * S, w, 120 * S);
    if (mode === 'done') button(x + 60 * S, y + h - 96 * S, w - 120 * S, 60 * S, `Done · ${N}/${N} · PDF`);
    else T('Writing it in your handwriting…', x + w / 2, y + h - 66 * S, `${21 * S}px Georgia, serif`, '#1d1d1d', 'center');
  }
  g.restore();
}
