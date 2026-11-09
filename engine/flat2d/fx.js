// flat2d effects: the cartoon vocabulary — impact stars, smoke puffs, explosions, speed lines, sweat, anger marks, "!",
// sparkles, dizzy stars, confetti, motion arcs. All pure functions of the age of the event (deterministic, any frame alone).
//   burst(I, x, y, r, age)          a spiky impact star that pops and shrinks (0.35 s)
//   puffs(I, x, y, r, age, o)       outlined cloud puffs that grow, drift and fade (smoke, dust; o.color, o.n, o.seed, o.rise)
//   explosion(I, x, y, size, age)   star flash + fireball + smoke ring + flying debris + optional BOOM word
//   speedLines(I, x, y, w, h, dir)  horizontal action streaks; radial(I, x, y, r0, r1, n) = focus lines toward a point
//   sweat / vein / mark('!'|'?') / sparkle / hearts / dizzy / confetti / zzz / motionArc
import { INK, tone } from './ink.js';
import { starPts } from './puppet.js';

const PI = Math.PI;
const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ob = (u, s = 2.2) => { u = clamp(u); return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };

export function burst(I, x, y, r, age, o = {}) {
  const dur = o.dur ?? 0.35; if (age < 0 || age > dur) return;
  const u = age / dur, k = u < 0.25 ? ob(u / 0.25) : 1 - (u - 0.25) / 0.75 * 0.6, a = 1 - Math.max(0, (u - 0.6) / 0.4);
  const n = o.n ?? 9, pts = starPts(x, y, r * k, r * k * 0.5, n, (o.rot ?? 0.2));
  I.shape(pts, { fill: o.fill ?? '#ffe14d', lw: 6, sharp: true, sub: false, alpha: a });
  I.shape(starPts(x, y, r * k * 0.55, r * k * 0.3, n, (o.rot ?? 0.2) + 0.3), { fill: o.inner ?? '#ffffff', line: null, sharp: true, sub: false, alpha: a });
}
export function puffs(I, x, y, r, age, o = {}) {
  const life = o.life ?? 1.1; if (age < 0 || age > life) return;
  const n = o.n ?? 7, seed = o.seed ?? 1, u = age / life;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2 + h1(seed * 7 + i) * 0.8, sp = (o.spread ?? 1) * r * (0.9 + h1(seed + i * 3) * 0.8);
    const d = sp * (1 - Math.pow(1 - u, 2.2)), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.55 - (o.rise ?? 60) * u;
    const rr = r * (0.35 + 0.3 * h1(seed * 5 + i)) * (0.5 + 0.8 * Math.min(1, u * 3)) * (1 - 0.55 * u * u);
    I.circle(px, py, rr, { fill: o.color ?? '#e8e2d8', shade: tone(o.color ?? '#e8e2d8', 0.85), lw: 5, alpha: 1 - Math.max(0, (u - 0.65) / 0.35) });
  }
}
export function explosion(I, x, y, size, age, o = {}) {
  if (age < 0 || age > 1.6) return;
  const ctx = I.ctx, u = age / 1.6;
  if (age < 0.18) { ctx.save(); ctx.globalAlpha = 1 - age / 0.18; ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(x, y, size * 2.2 * (0.4 + age * 4), 0, PI * 2); ctx.fill(); ctx.restore(); }
  puffs(I, x, y - size * 0.1, size * 1.05, age, { life: 1.6, n: 9, seed: o.seed ?? 3, color: '#8a8580', spread: 1.25, rise: size * 0.6 });
  if (age < 0.7) {
    const k = ob(age / 0.16), f = 1 - Math.max(0, (age - 0.35) / 0.35);
    I.shape(starPts(x, y, size * 0.95 * k, size * 0.6 * k, 11, 0.1), { fill: '#ff8a1f', lw: 7, sharp: false, sub: false, alpha: f });
    I.shape(starPts(x, y, size * 0.66 * k, size * 0.42 * k, 9, 0.5), { fill: '#ffd23f', line: null, sub: false, alpha: f });
    I.circle(x, y, size * 0.26 * k, { fill: '#fff6c8', line: null, alpha: f });
  }
  for (let i = 0; i < (o.debris ?? 8); i++) {   // debris: little rects on ballistic arcs
    const a = -PI / 2 + (h1(i * 9 + 1) - 0.5) * 2.6, v = size * (2.4 + h1(i * 5 + 2) * 2.2), t = age;
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 0.5 * size * 9 * t * t;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (6 + i)); I.rect(-size * 0.08, -size * 0.05, size * 0.16, size * 0.1, { fill: o.debrisColor?.[i % o.debrisColor.length] ?? ['#7d8590', '#ffc531', '#e5483d', '#4f86c6'][i % 4], lw: 4, r: 2, sharp: true, sub: false, alpha: 1 - u }); ctx.restore();
  }
  if (o.word) { const k = ob(clamp(age / 0.2)), a = 1 - Math.max(0, (age - 1.1) / 0.4); I.text(o.word, x + (o.wx ?? 0), y - size * 1.1 + (o.wy ?? 0), { size: size * 0.7 * k, fill: '#ffe14d', lw: size * 0.12, rot: -0.12, alpha: a }); }
}
export function speedLines(I, x, y, w, h, o = {}) {   // streaks across a box (x,y = centre), dir 1 = moving right (lines trail left)
  const ctx = I.ctx, n = o.n ?? 9, d = o.dir ?? 1, seed = I.step;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 0.85;
  for (let i = 0; i < n; i++) {
    const yy = y - h / 2 + h * (i + 0.5) / n + (h1(i + seed * 3) - 0.5) * h / n, L = w * (0.3 + 0.5 * h1(i * 7 + seed)), x0 = x - d * w / 2 + d * h1(i * 3 + seed) * w * 0.3;
    I.line([[x0, yy], [x0 + d * L, yy]], { line: o.color ?? INK, lw: o.lw ?? 5, sub: false });
  }
  ctx.restore();
}
export function radial(I, x, y, r0, r1, o = {}) {   // anime focus lines toward (x,y)
  const ctx = I.ctx, n = o.n ?? 40, seed = I.step; ctx.save(); ctx.globalAlpha = o.alpha ?? 0.5; ctx.fillStyle = o.color ?? INK;
  for (let i = 0; i < n; i++) { const a = (i / n) * PI * 2 + h1(i + seed) * 0.12, w = 0.012 + h1(i * 3 + seed) * 0.02, rr0 = r0 * (1 + h1(i * 5 + seed) * 0.4); ctx.beginPath(); ctx.moveTo(x + Math.cos(a - w) * r1, y + Math.sin(a - w) * r1); ctx.lineTo(x + Math.cos(a) * rr0, y + Math.sin(a) * rr0); ctx.lineTo(x + Math.cos(a + w) * r1, y + Math.sin(a + w) * r1); ctx.fill(); }
  ctx.restore();
}
export function sweat(I, x, y, s = 1, age = 0) {   // two flying sweat drops
  for (const [dx, dy, k] of [[0, 0, 1], [36, 26, 0.7]]) { const yy = y + dy + (age % 0.6) * 60 * s; I.shape([[x + dx * s, yy - 30 * s * k], [x + dx * s + 14 * s * k, yy], [x + dx * s, yy + 12 * s * k], [x + dx * s - 14 * s * k, yy]], { fill: '#8fd3ff', lw: 4.5, sub: false }); }
}
export function vein(I, x, y, s = 1) {   // the anime anger cross
  const a = 24 * s; for (const [dx, dy, r] of [[-1, -1, 0], [1, -1, PI / 2], [1, 1, PI], [-1, 1, PI * 1.5]]) I.arc(x + dx * a * 0.7, y + dy * a * 0.7, a * 0.6, a * 0.6, r + PI * 0.75, r + PI * 1.25, { line: '#e5483d', lw: 8 * s });
}
export function mark(I, x, y, ch = '!', s = 1, age = 1) {   // "!" or "?" over a head (pops once)
  const k = ob(clamp(age / 0.18)); I.text(ch, x, y, { size: 120 * s * k, fill: ch === '!' ? '#ffe14d' : '#ffffff', lw: 22 * s, rot: 0.1 });
}
export function sparkle(I, x, y, r, age = 0) {
  const k = Math.max(0, Math.sin(clamp(age / 0.5) * PI)); if (k <= 0) return;
  I.shape(starPts(x, y, r * k, r * k * 0.25, 4, 0), { fill: '#ffffff', lw: 4, sharp: true, sub: false });
}
export function hearts(I, x, y, s, age) {
  for (let i = 0; i < 3; i++) { const a = age - i * 0.15; if (a < 0) continue; const yy = y - a * 120 * s, xx = x + Math.sin(a * 5 + i * 2) * 30 * s + (i - 1) * 50 * s, r = 22 * s; I.shape([[xx, yy + r], [xx - r * 1.2, yy - r * 0.2], [xx - r * 0.6, yy - r], [xx, yy - r * 0.5], [xx + r * 0.6, yy - r], [xx + r * 1.2, yy - r * 0.2]], { fill: '#ff5a7a', lw: 4, sub: false, alpha: 1 - clamp((a - 0.8) / 0.4) }); }
}
export function dizzy(I, x, y, rx, t) {
  for (let i = 0; i < 4; i++) { const a = t * 5 + i * PI / 2, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * rx * 0.3; I.shape(starPts(px, py, 22, 10, 5), { fill: '#ffe14d', lw: 4, sharp: true, sub: false }); }
}
export function confetti(I, x, y, w, age, o = {}) {   // a falling confetti shower over a box w wide
  const ctx = I.ctx, n = o.n ?? 50, cols = o.colors ?? ['#e5483d', '#ffc531', '#4f86c6', '#4fae6d', '#7b5cd6', '#ff8ac0'];
  for (let i = 0; i < n; i++) {
    const t0 = h1(i * 3) * 0.6, a = age - t0; if (a < 0) continue;
    const px = x + (h1(i * 7) - 0.5) * w + Math.sin(a * 4 + i) * 30, py = y + a * (380 + h1(i) * 200) - (o.up ?? 0) * Math.max(0, 0.4 - a);
    ctx.save(); ctx.translate(px, py); ctx.rotate(a * 8 + i); ctx.scale(1, Math.cos(a * 9 + i)); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-12, -7, 24, 14); ctx.restore();
  }
}
export function zzz(I, x, y, t, s = 1) {
  for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); I.text('Z', x + u * 60 * s + i * 8, y - u * 160 * s, { size: (36 + 30 * u) * s, fill: '#ffffff', lw: 8 * s, alpha: Math.sin(u * PI) }); }
}
export function motionArc(I, pts, o = {}) {   // a swoosh trail behind a moving thing (pts = recent positions)
  const ctx = I.ctx; ctx.save(); ctx.globalAlpha = o.alpha ?? 0.6;
  for (let k = 0; k < 3; k++) I.line(pts.map(([x, y]) => [x, y + (k - 1) * (o.gap ?? 18)]), { line: o.color ?? INK, lw: o.lw ?? 4, sub: false });
  ctx.restore();
}
