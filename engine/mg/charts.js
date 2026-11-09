// Charts that build themselves: bars grow, lines draw on, gauges sweep, counters roll. All take k (0..1 build progress).
//   bars(g, x, y, w, h, [{v, label, color, icon(g, cx, cy, s)}], { max, k, valueFmt, gap })   x, y = bottom-left of the plot
//   lineChart(g, x, y, w, h, pts [[u 0..1, v 0..1], …], { k, color, fill, axes, xLabel, yLabel, dot })
//   gauge(g, x, y, r, v (0..1), { k, ticks, label, color, zones })   meter(g, …) = a dB bar meter with stacked segments
//   rollNum(t, t0, t1, a, b) is in ease.js (roll)
import { clamp, lerp, E, shade, alpha as rgba } from './ease.js';
import { shape, rrect, line, circle, ring, TAU } from './draw.js';
import { txt, FONT } from './type.js';
import { PAL } from './stage.js';

export function axes(g, x, y, w, h, o = {}) {
  const k = o.k ?? 1, col = o.color ?? 'rgba(220,232,255,.75)';
  line(g, [[x, y - h], [x, y], [x + w, y]], { w: o.lw ?? 6, color: col, k, cap: 'round' });
  if (o.xLabel) txt(g, o.xLabel, x + w, y + 52, { size: 30, font: FONT.body, weight: 700, align: 'right', color: col, alpha: clamp(k * 2 - 1), track: 3 });
  if (o.yLabel) txt(g, o.yLabel, x - 14, y - h - 30, { size: 30, font: FONT.body, weight: 700, align: 'left', color: col, alpha: clamp(k * 2 - 1), track: 3 });
}
export function bars(g, x, y, w, h, data, o = {}) {
  const k = o.k ?? 1, n = data.length, gap = o.gap ?? 0.32, bw = w / (n + (n + 1) * gap), max = o.max ?? Math.max(...data.map((d) => d.v));
  axes(g, x, y, w, h, { k: clamp(k * 3), color: o.axisColor });
  data.forEach((d, i) => {
    const u = clamp((k - i * 0.12) / 0.6), e = E.back(u, 0.9), bh = (d.v / max) * h * e, bx = x + gap * bw * (i + 1) + bw * i;
    if (u <= 0) return;
    rrect(g, bx, y - bh, bw, bh, Math.min(bw * 0.18, bh / 2), { fill: d.color ?? PAL.teal, gdir: 'v', light: 0.12, shadow: { len: bw * 0.6, a: 0.16 } });
    if (d.label) txt(g, d.label, bx + bw / 2, y + 44, { size: o.labelSize ?? 30, font: FONT.body, weight: 700, color: PAL.white, alpha: u, track: 2 });
    if (o.values !== false) txt(g, o.valueFmt ? o.valueFmt(d.v * E.out3(u), d) : String(Math.round(d.v * E.out3(u))), bx + bw / 2, y - bh - 40, { size: o.valueSize ?? 46, weight: 600, color: d.valueColor ?? PAL.white, alpha: u });
    if (d.icon) d.icon(g, bx + bw / 2, y - bh - (o.values !== false ? 110 : 60), u);
  });
}
/** a line chart drawn on (k); pts in unit space [u, v] (v up). fill = soft gradient area under the line */
export function lineChart(g, x, y, w, h, pts, o = {}) {
  const k = o.k ?? 1, col = o.color ?? PAL.yellow, P = pts.map(([u, v]) => [x + u * w, y - v * h]);
  if (o.axes !== false) axes(g, x, y, w, h, { k: clamp(k * 4), xLabel: o.xLabel, yLabel: o.yLabel, color: o.axisColor });
  const kk = clamp(k), n = Math.max(2, Math.ceil(P.length * kk)), Q = P.slice(0, n);
  if (o.fill !== false && Q.length > 1) {
    const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, rgba(col, o.fillA ?? 0.4)); gr.addColorStop(1, rgba(col, 0));
    g.save(); g.fillStyle = gr; g.beginPath(); g.moveTo(Q[0][0], y); for (const [a, b] of Q) g.lineTo(a, b); g.lineTo(Q[Q.length - 1][0], y); g.closePath(); g.fill(); g.restore();
  }
  const tip = line(g, Q, { w: o.w ?? 9, color: col });
  if (o.dot !== false && tip && kk < 1) { circle(g, tip[0], tip[1], (o.w ?? 9) * 1.6, { fill: col, flat: true }); }
  return tip;
}
/** a semicircle gauge (speedometer / dB meter), v 0..1; zones = [[v0, v1, color], …] */
export function gauge(g, x, y, r, v, o = {}) {
  const k = o.k ?? 1, a0 = Math.PI, a1 = TAU, zones = o.zones ?? [[0, 0.6, PAL.green], [0.6, 0.85, PAL.yellow], [0.85, 1, PAL.red]];
  for (const [z0, z1, c] of zones) ring(g, x, y, r, { w: r * 0.16, color: c, a0: lerp(a0, a1, z0), a1: lerp(a0, a1, Math.min(z1, z0 + (z1 - z0) * clamp(k * 2))), alpha: 0.9 });
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); line(g, [[x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8]], { w: r * 0.025, color: PAL.white, alpha: 0.7 * clamp(k * 2) }); }
  const a = lerp(a0, a1, clamp(v) * clamp(k * 1.5));
  line(g, [[x, y], [x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82]], { w: r * 0.05, color: o.needle ?? PAL.white });
  circle(g, x, y, r * 0.09, { fill: o.needle ?? PAL.white });
  if (o.label) txt(g, o.label, x, y + r * 0.3, { size: r * 0.16, font: FONT.body, weight: 700, color: PAL.white, track: 4, alpha: clamp(k * 2 - 0.5) });
}
/** a vertical stacked-segment level meter (a VU / dB meter): level 0..1, n segments */
export function meter(g, x, y, w, h, level, o = {}) {
  const n = o.n ?? 16, gap = h / n * 0.22, sh = h / n - gap;
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, on = u <= level, c = u > 0.85 ? PAL.red : u > 0.6 ? PAL.yellow : PAL.green;
    rrect(g, x, y - (i + 1) * (sh + gap), w, sh, sh * 0.3, { fill: on ? c : 'rgba(255,255,255,.08)', flat: !on, light: 0.1 }); }
}
/** a thin progress ring (0..1) with an optional centre text */
export function progressRing(g, x, y, r, k, o = {}) {
  ring(g, x, y, r, { w: r * 0.14, color: 'rgba(255,255,255,.14)' }); ring(g, x, y, r, { w: r * 0.14, color: o.color ?? PAL.green, a0: -Math.PI / 2, a1: -Math.PI / 2 + TAU * clamp(k) });
  if (o.text) txt(g, o.text, x, y + r * 0.04, { size: r * 0.5, weight: 600 });
}
