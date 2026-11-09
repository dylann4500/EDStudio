// Motion-graphics FX (all analytic: a pure function of t, no state between frames).
//   soundRings(g, x, y, age, { n, gap (s), speed (px/s), max, color, w })   expanding rings from a source (a clap, a speaker)
//   burst(g, x, y, age, { n, r, color, seed })  a clean starburst of rays (the clap impact), gone in ~0.4 s
//   confetti(g, x0, y0, age, { n, spread, seed, colors })   flock(g, birds, t)   sparkle(g, x, y, k, s)   ripple(g, x, y, age, …)
import { clamp, lerp, E, rng, hash, alpha as rgba } from './ease.js';
import { line, ring, circle, rrect, shape, TAU, starPts } from './draw.js';
import { PAL } from './stage.js';
import { gull } from './icons.js';

export function soundRings(g, x, y, age, o = {}) {
  if (age < 0) return;
  const n = o.n ?? 4, gap = o.gap ?? 0.12, sp = o.speed ?? 900, max = o.max ?? 1400, col = o.color ?? PAL.white, w = o.w ?? 10;
  for (let i = 0; i < n; i++) { const a = age - i * gap; if (a <= 0) continue; const r = a * sp; if (r > max) continue;
    ring(g, x, y, r, { w: w * (1 - (r / max) * 0.6), color: col, alpha: (o.a ?? 0.85) * (1 - r / max) ** 1.3 * (1 - i * 0.18), a0: o.a0, a1: o.a1 }); }
}
export function burst(g, x, y, age, o = {}) {
  const dur = o.dur ?? 0.42; if (age < 0 || age > dur) return;
  const u = age / dur, n = o.n ?? 12, r0 = (o.r ?? 140) * lerp(0.3, 1.25, E.out3(u)), r1 = r0 * lerp(0.35, 0.9, E.out2(u)), R = rng(o.seed ?? 5);
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + (o.rot ?? 0.2) + (R() - 0.5) * 0.2, L = R() * 0.3 + 0.85;
    line(g, [[x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a) * r0 * L, y + Math.sin(a) * r0 * L]], { w: (o.w ?? 12) * (1 - u), color: i % 2 ? (o.color ?? PAL.yellow) : (o.color2 ?? PAL.white) }); }
  if (u < 0.35) circle(g, x, y, (o.r ?? 140) * 0.32 * (1 - u / 0.35), { fill: '#ffffff', flat: true, alpha: 0.9 });
}
/** confetti pieces thrown up from (x0, y0) at age 0, falling with gravity + flutter */
export function confetti(g, x0, y0, age, o = {}) {
  if (age < 0) return; const n = o.n ?? 80, R = rng(o.seed ?? 9), cols = o.colors ?? [PAL.yellow, PAL.pink, PAL.teal, PAL.orange, PAL.purple, PAL.white], grav = o.g ?? 1400;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (R() - 0.5) * (o.spread ?? 1.6), v = (o.v ?? 1500) * (0.5 + R() * 0.6), t0 = R() * (o.stagger ?? 0.15), tt = age - t0; if (tt < 0) { R(); R(); continue; }
    const drag = 1 - Math.exp(-tt * 1.6), vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const x = x0 + (vx / 1.6) * drag + Math.sin(tt * 5 + i) * 30, y = y0 + (vy / 1.6) * drag + grav * 0.35 * tt * tt * 0.5 + 220 * tt;
    const s = (o.size ?? 22) * (0.6 + R() * 0.6), rot = tt * (4 + R() * 6) + i, fl = Math.abs(Math.cos(tt * 7 + i));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, 0.25 + 0.75 * fl); g.fillStyle = cols[i % cols.length]; g.fillRect(-s / 2, -s * 0.3, s, s * 0.6); g.restore();
  }
}
/** a flock of gulls lifting off: birds = [{x, y, s, t0, vx, vy, ph}] (makeFlock) */
export function makeFlock(seed, n, { x0 = -500, x1 = 500, y = 0, s = 0.5 } = {}) { const R = rng(seed); return Array.from({ length: n }, (_, i) => ({ x: lerp(x0, x1, R()), y: y + (R() - 0.5) * 60, s: s * (0.7 + R() * 0.6), t0: R() * 0.5, vx: (R() - 0.35) * 240, vy: -(320 + R() * 300), ph: R(), i })); }
export function flock(g, birds, t, tGo, o = {}) {
  for (const b of birds) {
    const a = t - tGo - b.t0;
    if (a < 0) { if (o.sitting !== false) gull(g, b.x, b.y, b.s * 0.75, 0.25, { alpha: o.alpha }); continue; }
    const x = b.x + b.vx * a + Math.sin(a * 2 + b.i) * 20, y = b.y + b.vy * a * (1 - Math.exp(-a * 1.5)) / 1 * 0.9 - 40 * a * a;
    gull(g, x, y, b.s * (1 + a * 0.15), (a * (3.2 + b.ph) + b.ph) % 1, { rot: b.vx * 0.0006, alpha: o.alpha });
  }
}
/** a four-point sparkle (k 0..1 pops it in and out once) */
export function sparkle(g, x, y, k, s = 30, color = '#ffffff') { if (k <= 0 || k >= 1) return; const e = Math.sin(k * Math.PI); shape(g, starPts(x, y, s * e, s * 0.22 * e, 4, 0), { fill: color, flat: true }); }
/** vibration marks around a buzzing object (phone): ((( ))) */
export function buzz(g, x, y, w, h, t, o = {}) { const k = 0.5 + 0.5 * Math.sin(t * 40); for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) ring(g, x, y, w * 0.5 + 18 + i * 22, { w: 6, color: o.color ?? PAL.white, alpha: (0.5 + 0.4 * k) * (1 - i * 0.35), a0: sd < 0 ? Math.PI - 0.5 : -0.5, a1: sd < 0 ? Math.PI + 0.5 : 0.5 }); }
