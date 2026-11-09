// Motion-graphics shape kit: every shape is a point list, filled with a SOFT GRADIENT (lighter top-left → darker bottom-right),
// optionally casting a LONG SUBTLE SHADOW (the extruded hull fading out at 45°) and a soft glow. No outlines: the look is flat
// fills + light, Kurzgesagt-style. Point lists also feed morphs (ease.js morph()).
//   shape(g, pts, { fill, light: 0.14, grad: [c0, c1], gdir: 'v'|'d'|'h', shadow: 90 | {len, ang, a}, glow: {r, color, a}, alpha })
//   circle / rrect / ellipse / poly / star → shape(); line(g, pts, {w, color, k (draw-on 0..1), dash, cap}); ring(); glow(); text helpers live in type.js
import { clamp, lerp, shade, alpha as rgba, circlePts, rrectPts, starPts } from './ease.js';

export { circlePts, rrectPts, starPts };
export const TAU = Math.PI * 2;

function bbox(P) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
/** convex hull (monotone chain) */
export function hull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop(); return lo.concat(up);
}
export function tracePts(g, P, close = true) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); if (close) g.closePath(); }

/** the house long shadow: 45° down-right, fading to nothing; on dark backdrops it reads as depth, never as a hard edge */
export function longShadow(g, P, o = {}) {
  const len = typeof o === 'number' ? o : o.len ?? 120, ang = o.ang ?? Math.PI / 4, a = o.a ?? 0.22, col = o.color ?? '#050b1e';
  if (len <= 0) return;
  const dx = Math.cos(ang) * len, dy = Math.sin(ang) * len, H = hull(P.concat(P.map(([x, y]) => [x + dx, y + dy])));
  const [x0, y0, x1, y1] = bbox(P), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const gr = g.createLinearGradient(cx, cy, cx + dx, cy + dy); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
  g.save(); g.fillStyle = gr; tracePts(g, H); g.fill(); g.restore();
}
/** soft round glow (radial gradient); add: true = additive light */
export function glow(g, x, y, r, color = '#ffd23f', a = 0.5, add = false) {
  if (r <= 0 || a <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.45, rgba(color, a * 0.35)); gr.addColorStop(1, rgba(color, 0));
  g.save(); if (add) g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
}
function fillStyle(g, P, o) {
  const f = o.fill ?? '#ffffff';
  if (o.flat || typeof f !== 'string' || !f.startsWith('#')) return f;
  const [x0, y0, x1, y1] = bbox(P), L = o.light ?? 0.14, c0 = o.grad ? o.grad[0] : shade(f, L), c1 = o.grad ? o.grad[1] : shade(f, -L);
  const d = o.gdir ?? 'd';
  const gr = d === 'v' ? g.createLinearGradient(0, y0, 0, y1) : d === 'h' ? g.createLinearGradient(x0, 0, x1, 0) : g.createLinearGradient(x0, y0, x1 * 0.6 + x0 * 0.4, y1);
  gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr;
}
/** fill a point list with the house look */
export function shape(g, P, o = {}) {
  if (!P || P.length < 2) return P;
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= clamp(o.alpha);
  if (o.shadow) longShadow(g, P, o.shadow);
  if (o.glow) { const [x0, y0, x1, y1] = bbox(P); glow(g, (x0 + x1) / 2, (y0 + y1) / 2, o.glow.r ?? Math.max(x1 - x0, y1 - y0), o.glow.color ?? o.fill, o.glow.a ?? 0.4, o.glow.add); }
  g.fillStyle = fillStyle(g, P, o); tracePts(g, P); g.fill();
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw ?? 4; g.lineJoin = 'round'; g.stroke(); }
  if (o.hi) { g.save(); tracePts(g, P); g.clip(); g.globalAlpha *= o.hi; g.fillStyle = '#ffffff'; const [x0, y0, x1, y1] = bbox(P); g.beginPath(); g.ellipse(x0 + (x1 - x0) * 0.3, y0 + (y1 - y0) * 0.22, (x1 - x0) * 0.5, (y1 - y0) * 0.28, -0.5, 0, TAU); g.fill(); g.restore(); }
  g.restore(); return P;
}
export const circle = (g, x, y, r, o = {}) => (r > 0.2 ? shape(g, circlePts(x, y, r, r > 60 ? 72 : r > 14 ? 40 : 20), o) : null);
export const rrect = (g, x, y, w, h, r, o = {}) => (w > 0 && h > 0 ? shape(g, rrectPts(x, y, w, h, r, 48), o) : null);
export const ellipse = (g, x, y, rx, ry, o = {}, rot = 0) => shape(g, Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * TAU, c = Math.cos(rot), s = Math.sin(rot), px = Math.cos(a) * rx, py = Math.sin(a) * ry; return [x + px * c - py * s, y + px * s + py * c]; }), o);
export const poly = (g, P, o = {}) => shape(g, P, o);
export const star = (g, x, y, r0, r1, k = 5, o = {}) => shape(g, starPts(x, y, r0, r1, k), o);
/** a flat contact shadow under something standing (soft ellipse) */
export function contact(g, x, y, rx, ry = rx * 0.22, a = 0.28) { const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, `rgba(5,11,30,${a})`); gr.addColorStop(1, 'rgba(5,11,30,0)'); g.save(); g.fillStyle = gr; g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.beginPath(); g.arc(x, y, rx, 0, TAU); g.fill(); g.restore(); }

/** a stroked polyline; k (0..1) draws it on by arc length (charts, routes, signatures) */
export function line(g, P, o = {}) {
  if (!P || P.length < 2) return;
  const k = o.k ?? 1; if (k <= 0) return;
  let pts = P;
  if (k < 1) {
    const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const want = L[L.length - 1] * k; pts = [P[0]];
    for (let i = 1; i < P.length; i++) { if (L[i] <= want) pts.push(P[i]); else { const u = (want - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); pts.push([lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]); break; } }
  }
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.strokeStyle = o.color ?? '#ffffff'; g.lineWidth = o.w ?? 6; g.lineCap = o.cap ?? 'round'; g.lineJoin = 'round';
  if (o.dash) { g.setLineDash(o.dash); g.lineDashOffset = o.dashOff ?? 0; }
  if (o.glow) { g.shadowColor = o.glowColor ?? o.color ?? '#fff'; g.shadowBlur = o.glow; }
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.restore();
  return pts[pts.length - 1];
}
/** a ring (stroked circle), optionally partial: a0..a1 */
export function ring(g, x, y, r, o = {}) {
  if (r <= 0) return; g.save(); if (o.alpha !== undefined) g.globalAlpha *= clamp(o.alpha);
  g.strokeStyle = o.color ?? '#ffffff'; g.lineWidth = o.w ?? 6; g.lineCap = 'round'; if (o.dash) g.setLineDash(o.dash);
  g.beginPath(); g.arc(x, y, r, o.a0 ?? 0, o.a1 ?? TAU); g.stroke(); g.restore();
}
/** quadratic-bezier point list (for arcs, wires, routes) */
export const qpts = (a, c, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; });
/** a rounded blob (organic hill / bush / cloud lump): n lobes around a centre */
export function blobPts(x, y, rx, ry, seed = 1, wob = 0.12, n = 56) { return Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, w = 1 + wob * Math.sin(a * 3 + seed) + wob * 0.6 * Math.sin(a * 5 + seed * 2.3); return [x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]; }); }
/** a fluffy cloud: overlapping circles flattened at the bottom (one fill, soft gradient) */
export function cloud(g, x, y, w, o = {}) {
  const h = w * 0.42, P = [];
  const bumps = [[-0.36, 0.05, 0.22], [-0.12, -0.18, 0.3], [0.16, -0.1, 0.26], [0.36, 0.06, 0.2]];
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const gr = g.createLinearGradient(0, y - h, 0, y + h * 0.4); gr.addColorStop(0, o.top ?? '#ffffff'); gr.addColorStop(1, o.bottom ?? '#d4e4ff'); g.fillStyle = gr;
  g.beginPath(); for (const [bx, by, r] of bumps) { g.moveTo(x + bx * w + r * w, y + by * w); g.arc(x + bx * w, y + by * w, r * w, 0, TAU); }
  g.rect(x - w * 0.36, y - h * 0.1, w * 0.72, h * 0.34); g.fill(); g.restore(); return P;
}
