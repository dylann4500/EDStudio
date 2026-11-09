// Motion-graphics icons + props, all flat soft-gradient vector shapes, centred on (x, y) and sized by s (≈ px / 100).
// gull(g, x, y, s, flap 0..1 (wing phase), o)   car(g, x, y, s, {color, lights 0..1})   phone(g, x, y, w, {screen(g, x0, y0, w, h)})
// laptop / building / palm / ferris / sun / speaker / ear / gascan / battery / clock / bell / check / pin / plane / paperStack / pencil / siren / wave
import { clamp, lerp, shade, E } from './ease.js';
import { shape, circle, rrect, ellipse, line, ring, glow, qpts, TAU, circlePts, contact } from './draw.js';
import { PAL } from './stage.js';

/** a seagull in flight (front-ish 3/4): flap = wing phase 0..1 (0 up, 0.5 down) */
export function gull(g, x, y, s = 1, flap = 0, o = {}) {
  const w = Math.sin(flap * TAU) * 0.55, S = 100 * s;
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  for (const sd of [-1, 1]) {
    const tip = [sd * S * 0.95, -S * w * 0.9 - S * 0.05], mid = [sd * S * 0.45, -S * w * 0.35 - S * 0.12];
    shape(g, [[sd * S * 0.08, -S * 0.06], mid, tip, [sd * S * 0.62, -S * w * 0.5 + S * 0.06], [sd * S * 0.1, S * 0.08]], { fill: o.wing ?? '#e9f1ff', light: 0.08 });
    shape(g, [mid, tip, [sd * S * 0.82, -S * w * 0.72 + S * 0.02]], { fill: '#2a3550', flat: true });
  }
  ellipse(g, 0, 0, S * 0.2, S * 0.13, { fill: '#ffffff' }); circle(g, S * 0.16, -S * 0.08, S * 0.1, { fill: '#ffffff' });
  shape(g, [[S * 0.24, -S * 0.1], [S * 0.36, -S * 0.06], [S * 0.24, -S * 0.04]], { fill: PAL.orange, flat: true });
  g.restore();
}
/** a car, side view, facing +x. lights 0..1 = hazard/alarm flash (orange lamps + glow) */
export function car(g, x, y, s = 1, o = {}) {
  const S = 100 * s, col = o.color ?? PAL.red;
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1);
  contact(g, 0, 0, S * 1.1, S * 0.12, 0.35);
  shape(g, [[-S * 1.1, -S * 0.18], [-S * 1.08, -S * 0.5], [-S * 0.6, -S * 0.56], [-S * 0.38, -S * 0.92], [S * 0.4, -S * 0.92], [S * 0.7, -S * 0.56], [S * 1.08, -S * 0.5], [S * 1.12, -S * 0.18]], { fill: col, shadow: o.shadow ? { len: o.shadow, a: 0.2 } : null });
  shape(g, [[-S * 0.32, -S * 0.58], [-S * 0.2, -S * 0.84], [S * 0.0, -S * 0.84], [S * 0.0, -S * 0.58]], { fill: '#bfe6ff', light: 0.2 });
  shape(g, [[S * 0.08, -S * 0.58], [S * 0.08, -S * 0.84], [S * 0.36, -S * 0.84], [S * 0.58, -S * 0.58]], { fill: '#bfe6ff', light: 0.2 });
  for (const wx of [-0.68, 0.68]) { circle(g, wx * S, -S * 0.16, S * 0.24, { fill: '#1d2236' }); circle(g, wx * S, -S * 0.16, S * 0.11, { fill: '#9aa6c6', flat: true }); }
  const L = clamp(o.lights ?? 0);
  ellipse(g, S * 1.06, -S * 0.4, S * 0.06, S * 0.08, { fill: L > 0.5 ? '#fff4c2' : '#fff7e0', flat: true });
  ellipse(g, -S * 1.06, -S * 0.4, S * 0.05, S * 0.08, { fill: L > 0.5 ? '#ffb02e' : '#c2394a', flat: true });
  if (L > 0) { glow(g, S * 1.08, -S * 0.4, S * 0.6, '#ffd26b', 0.55 * L, true); glow(g, -S * 1.08, -S * 0.4, S * 0.6, '#ff9e2e', 0.55 * L, true); }
  g.restore();
}
/** a phone, upright, w wide (h = 2.05 w); screen(g, x0, y0, sw, sh) paints the display (clipped). o: {rot, color, glow, buzz} */
export function phone(g, x, y, w, o = {}) {
  const h = w * 2.05, r = w * 0.16;
  g.save(); g.translate(x + (o.buzz ? Math.sin(o.buzz * 90) * w * 0.03 : 0), y); if (o.rot) g.rotate(o.rot);
  if (o.glow) glow(g, 0, 0, w * 1.5, o.glowColor ?? '#9fd0ff', o.glow, true);
  rrect(g, -w / 2, -h / 2, w, h, r, { fill: o.color ?? '#1b2340', shadow: o.shadow ? { len: o.shadow, a: 0.25 } : null, light: 0.08 });
  const bx = w * 0.055, x0 = -w / 2 + bx, y0 = -h / 2 + bx, sw = w - 2 * bx, sh = h - 2 * bx;
  g.save(); g.beginPath(); g.roundRect(x0, y0, sw, sh, r * 0.75); g.clip();
  g.fillStyle = o.bg ?? '#0e1630'; g.fillRect(x0, y0, sw, sh);
  if (o.screen) o.screen(g, x0, y0, sw, sh);
  g.restore();
  rrect(g, -w * 0.13, -h / 2 + bx + w * 0.03, w * 0.26, w * 0.06, w * 0.03, { fill: '#0b1020', flat: true });
  g.restore();
}
/** a laptop seen from the front: screen w wide; screen(g, x0, y0, sw, sh) paints the display */
export function laptop(g, x, y, w, o = {}) {
  const h = w * 0.64;
  g.save(); g.translate(x, y);
  rrect(g, -w / 2, -h, w, h, w * 0.03, { fill: '#2a3150', shadow: o.shadow ? { len: o.shadow, a: 0.22 } : null });
  const b = w * 0.035; g.save(); g.beginPath(); g.rect(-w / 2 + b, -h + b, w - 2 * b, h - 2 * b); g.clip(); g.fillStyle = '#fff'; g.fillRect(-w / 2 + b, -h + b, w - 2 * b, h - 2 * b);
  if (o.screen) o.screen(g, -w / 2 + b, -h + b, w - 2 * b, h - 2 * b); g.restore();
  shape(g, [[-w * 0.62, 0], [w * 0.62, 0], [w * 0.56, w * 0.05], [-w * 0.56, w * 0.05]], { fill: '#c9d2ea' });
  g.restore();
}
/** a flat building (front), w × h, window grid; lit = fraction of lit windows (seeded) */
export function building(g, x, y, w, h, o = {}) {
  const col = o.color ?? '#2b4a8a';
  shape(g, [[x, y], [x, y - h], [x + w, y - h], [x + w, y]], { fill: col, gdir: 'v', light: 0.1, shadow: o.shadow ? { len: o.shadow, a: 0.2 } : null });
  const cols = Math.max(2, Math.round(w / (o.cell ?? 34))), rows = Math.max(2, Math.round(h / (o.cellH ?? 46))), cw = w / cols, ch = h / rows;
  g.save(); for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols; c++) {
    const lit = ((Math.sin((r * 7.1 + c * 3.3 + (o.seed ?? 1)) * 12.9) + 1) / 2) < (o.lit ?? 0.35);
    g.fillStyle = lit ? (o.litColor ?? '#ffd98a') : shade(col, 0.16); g.fillRect(x + c * cw + cw * 0.22, y - h + r * ch + ch * 0.35, cw * 0.56, ch * 0.42);
  } g.restore();
}
/** a palm tree: trunk from (x, y) curving up h px, fronds sway with t */
export function palm(g, x, y, h, t = 0, o = {}) {
  const lean = o.lean ?? 0.25, sw = Math.sin(t * 1.3 + (o.ph ?? 0)) * 0.04;
  const top = [x + h * lean, y - h], trunk = qpts([x, y], [x + h * lean * 0.1, y - h * 0.55], top, 16);
  line(g, trunk, { w: h * 0.07, color: o.trunk ?? '#8a5a3c' });
  for (let i = 1; i < trunk.length - 1; i += 2) line(g, [[trunk[i][0] - h * 0.035, trunk[i][1]], [trunk[i][0] + h * 0.035, trunk[i][1] - h * 0.01]], { w: h * 0.012, color: '#6d4429', alpha: 0.7 });
  const fr = o.leaf ?? '#2fae6a';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.52 + sw * (i % 2 ? 1 : -1), L = h * (0.48 + (i % 2) * 0.1), droop = 0.55;
    const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.6 + L * droop * Math.abs(Math.cos(a))];
    const c = [top[0] + Math.cos(a) * L * 0.5, top[1] + Math.sin(a) * L * 0.5 - L * 0.15];
    const P = qpts(top, c, tip, 10), Q = P.map(([px, py], k) => [px + Math.sin(a) * h * 0.05 * Math.sin((k / 10) * Math.PI), py - Math.cos(a) * h * 0.05 * Math.sin((k / 10) * Math.PI)]);
    shape(g, P.concat(Q.reverse()), { fill: i % 2 ? fr : shade(fr, -0.12), light: 0.1 });
  }
  circle(g, top[0], top[1] + h * 0.02, h * 0.035, { fill: '#7a4a2a' });
}
/** a Ferris wheel (spinning), hub at (x, y), radius r */
export function ferris(g, x, y, r, t = 0, o = {}) {
  const col = o.color ?? '#f5f9ff', n = 16, a0 = t * 0.12;
  line(g, [[x - r * 0.55, y + r * 1.25], [x, y], [x + r * 0.55, y + r * 1.25]], { w: r * 0.05, color: shade(col, -0.25) });
  ring(g, x, y, r, { w: r * 0.04, color: col }); ring(g, x, y, r * 0.92, { w: r * 0.02, color: col, alpha: 0.7 });
  for (let i = 0; i < n; i++) { const a = a0 + (i / n) * TAU; line(g, [[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w: r * 0.012, color: col, alpha: 0.75 }); }
  for (let i = 0; i < n; i++) { const a = a0 + (i / n) * TAU, cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r; rrect(g, cx - r * 0.06, cy, r * 0.12, r * 0.12, r * 0.03, { fill: PAL.shirts[i % PAL.shirts.length], flat: true }); }
  circle(g, x, y, r * 0.08, { fill: shade(col, -0.1) });
}
export function sun(g, x, y, r, t = 0, o = {}) { glow(g, x, y, r * 4, o.glow ?? '#ffcf6e', 0.45, false); circle(g, x, y, r, { fill: o.color ?? '#ffe08a', light: 0.08 }); }
/** a speaker icon with k (0..1) of three sound arcs */
export function speaker(g, x, y, s = 1, k = 1, o = {}) {
  const S = 100 * s, col = o.color ?? PAL.white;
  shape(g, [[x - S * 0.5, y - S * 0.2], [x - S * 0.25, y - S * 0.2], [x + S * 0.05, y - S * 0.48], [x + S * 0.05, y + S * 0.48], [x - S * 0.25, y + S * 0.2], [x - S * 0.5, y + S * 0.2]], { fill: col });
  for (let i = 0; i < 3; i++) { const a = clamp(k * 3 - i); if (a > 0) ring(g, x + S * 0.05, y, S * (0.3 + i * 0.22), { w: S * 0.08, color: col, a0: -0.75, a1: 0.75, alpha: a }); }
}
export function check(g, x, y, s = 1, k = 1, o = {}) { circle(g, x, y, 50 * s, { fill: o.fill ?? PAL.green }); line(g, [[x - 22 * s, y + 2 * s], [x - 6 * s, y + 18 * s], [x + 24 * s, y - 16 * s]], { w: 12 * s, color: '#fff', k }); }
/** a map pin; the tip sits at (x, y) */
export function pin(g, x, y, s = 1, o = {}) {
  const S = 100 * s, col = o.color ?? PAL.red, d = S * 0.62, r = S * 0.34, ac = Math.acos(r / d), P = [[x, y]];
  for (let i = 0; i <= 28; i++) { const a = Math.PI / 2 + ac + (i / 28) * (2 * Math.PI - 2 * ac); P.push([x + Math.cos(a) * r, y - d + Math.sin(a) * r]); }
  shape(g, P, { fill: col, shadow: o.shadow ? { len: o.shadow, a: 0.2 } : null }); circle(g, x, y - d, S * 0.13, { fill: '#fff', flat: true });
}
/** an airliner seen from below/side, nose +x */
export function plane(g, x, y, s = 1, o = {}) {
  const S = 100 * s; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
  shape(g, [[-S * 0.25, -S * 0.02], [S * 0.15, -S * 0.02], [-S * 0.2, -S * 0.42], [-S * 0.34, -S * 0.42]], { fill: shade(o.color ?? '#e8eef9', -0.12) });
  rrect(g, -S * 0.9, -S * 0.1, S * 1.8, S * 0.2, S * 0.1, { fill: o.color ?? '#e8eef9' });
  shape(g, [[-S * 0.25, S * 0.02], [S * 0.15, S * 0.02], [-S * 0.2, S * 0.5], [-S * 0.34, S * 0.5]], { fill: o.color ?? '#e8eef9' });
  shape(g, [[-S * 0.88, -S * 0.08], [-S * 0.72, -S * 0.08], [-S * 0.86, -S * 0.36], [-S * 0.95, -S * 0.36]], { fill: o.tail ?? PAL.red });
  g.restore();
}
/** a stack of n sheets of paper (homework pile), grows with n; bottom-centre at (x, y) */
export function paperStack(g, x, y, w, n, o = {}) {
  const th = o.th ?? 7;
  for (let i = 0; i < n; i++) { const jx = Math.sin(i * 12.9898) * w * 0.05, rot = Math.sin(i * 78.233) * 0.04; g.save(); g.translate(x + jx, y - i * th); g.rotate(rot);
    rrect(g, -w / 2, -th - 2, w, th + 2, 3, { fill: i % 2 ? '#fffaf0' : '#f1ead9', flat: true }); g.restore(); }
  if (n > 0 && o.top !== false) { g.save(); g.translate(x, y - n * th); rrect(g, -w / 2, -w * 0.02, w, w * 0.02 + 2, 2, { fill: '#fffdf6', flat: true }); g.restore(); }
}
export function pencil(g, x, y, len, rot = 0, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); const w = len * 0.11;
  shape(g, [[0, 0], [len * 0.14, -w / 2], [len * 0.14, w / 2]], { fill: '#f3d2a4', flat: true }); shape(g, [[0, 0], [len * 0.05, -w * 0.18], [len * 0.05, w * 0.18]], { fill: '#2a2a3a', flat: true });
  rrect(g, len * 0.14, -w / 2, len * 0.72, w, 2, { fill: o.color ?? PAL.yellow, gdir: 'v' }); rrect(g, len * 0.86, -w / 2, len * 0.14, w, w * 0.3, { fill: '#ff8fa3' });
  g.restore();
}
/** a gas can (jerry can), bottom-centre at (x, y), fill 0..1 shows the level */
export function gascan(g, x, y, s = 1, fill = 1, o = {}) {
  const S = 100 * s; rrect(g, x - S * 0.42, y - S * 1.0, S * 0.84, S * 1.0, S * 0.1, { fill: o.color ?? PAL.red, shadow: o.shadow ? { len: o.shadow, a: 0.2 } : null });
  rrect(g, x - S * 0.3, y - S * 1.12, S * 0.24, S * 0.14, S * 0.04, { fill: '#2a2a3a' }); rrect(g, x + S * 0.02, y - S * 1.1, S * 0.3, S * 0.1, S * 0.05, { fill: shade(o.color ?? PAL.red, -0.2) });
  if (fill < 1) { g.save(); g.globalAlpha = 0.85; g.fillStyle = shade(o.color ?? PAL.red, -0.45); g.fillRect(x - S * 0.34, y - S * 0.92, S * 0.68, S * 0.84 * (1 - fill)); g.restore(); }
  line(g, [[x - S * 0.26, y - S * 0.7], [x + S * 0.26, y - S * 0.3]], { w: S * 0.07, color: shade(o.color ?? PAL.red, 0.25) }); line(g, [[x + S * 0.26, y - S * 0.7], [x - S * 0.26, y - S * 0.3]], { w: S * 0.07, color: shade(o.color ?? PAL.red, 0.25) });
}
/** a smartphone battery icon (level 0..1) */
export function battery(g, x, y, s = 1, level = 1, o = {}) { const S = 100 * s; rrect(g, x - S * 0.5, y - S * 0.25, S, S * 0.5, S * 0.1, { fill: '#2a3150' }); rrect(g, x + S * 0.5, y - S * 0.1, S * 0.08, S * 0.2, S * 0.03, { fill: '#2a3150' }); rrect(g, x - S * 0.42, y - S * 0.17, S * 0.84 * clamp(level), S * 0.34, S * 0.06, { fill: o.color ?? PAL.green }); }
/** a wall clock showing seconds s (hands sweep) */
export function clockFace(g, x, y, r, secs, o = {}) { circle(g, x, y, r, { fill: o.face ?? PAL.white, shadow: o.shadow ? { len: o.shadow, a: 0.2 } : null }); ring(g, x, y, r * 0.92, { w: r * 0.06, color: o.rim ?? PAL.navy }); for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; line(g, [[x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74], [x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84]], { w: r * 0.05, color: PAL.navy }); } const am = (secs / 3600) * TAU - Math.PI / 2, as = (secs / 60) * TAU - Math.PI / 2; line(g, [[x, y], [x + Math.cos(am) * r * 0.55, y + Math.sin(am) * r * 0.55]], { w: r * 0.08, color: PAL.navy }); line(g, [[x, y], [x + Math.cos(as) * r * 0.75, y + Math.sin(as) * r * 0.75]], { w: r * 0.04, color: PAL.red }); circle(g, x, y, r * 0.07, { fill: PAL.red, flat: true }); }
/** a siren / alarm light: k 0..1 brightness */
export function siren(g, x, y, s = 1, k = 0) { const S = 100 * s; if (k > 0) glow(g, x, y - S * 0.4, S * 2, '#ff5a3d', 0.5 * k, true); rrect(g, x - S * 0.5, y - S * 0.15, S, S * 0.15, S * 0.04, { fill: '#2a3150' }); shape(g, [...circlePts(x, y - S * 0.15, S * 0.4, 32).slice(16, 32), [x + S * 0.4, y - S * 0.15]], { fill: k > 0.5 ? '#ff7a5c' : '#c23a3a' }); }
/** an ear (side view), for "your ears" beats */
export function ear(g, x, y, s = 1, o = {}) { const S = 100 * s; shape(g, [[x, y - S * 0.6], [x + S * 0.35, y - S * 0.5], [x + S * 0.45, y - S * 0.1], [x + S * 0.25, y + S * 0.25], [x + S * 0.1, y + S * 0.55], [x - S * 0.1, y + S * 0.45], [x - S * 0.05, y + S * 0.1], [x - S * 0.15, y - S * 0.3]], { fill: o.skin ?? '#f0bf93' }); line(g, qpts([x + S * 0.05, y - S * 0.35], [x + S * 0.32, y - S * 0.3], [x + S * 0.12, y + S * 0.15], 12), { w: S * 0.06, color: '#c98b5e' }); }
/** a gull standing on the sand, side view facing +x (flip: face −x); feet at (x, y). hop 0..1 = a crouch before take-off */
export function gullStand(g, x, y, s = 1, o = {}) {
  const S = 100 * s; g.save(); g.translate(x, y - (o.lift ?? 0) * S); if (o.flip) g.scale(-1, 1); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  line(g, [[-S * 0.06, -S * 0.32], [-S * 0.08, 0]], { w: S * 0.035, color: PAL.orange }); line(g, [[S * 0.08, -S * 0.32], [S * 0.1, 0]], { w: S * 0.035, color: PAL.orange });
  ellipse(g, 0, -S * 0.48, S * 0.36, S * 0.2, { fill: '#ffffff', light: 0.06 }, -0.12);
  shape(g, [[-S * 0.3, -S * 0.56], [S * 0.12, -S * 0.64], [S * 0.2, -S * 0.5], [-S * 0.2, -S * 0.42], [-S * 0.55, -S * 0.5]], { fill: '#9aa8c4', light: 0.08 });
  shape(g, [[-S * 0.55, -S * 0.5], [-S * 0.3, -S * 0.5], [-S * 0.42, -S * 0.42]], { fill: '#2a3550', flat: true });
  circle(g, S * 0.3, -S * 0.72, S * 0.15, { fill: '#ffffff', light: 0.05 }); circle(g, S * 0.35, -S * 0.75, S * 0.025, { fill: PAL.ink, flat: true });
  shape(g, [[S * 0.42, -S * 0.74], [S * 0.6, -S * 0.7], [S * 0.42, -S * 0.66]], { fill: PAL.yellow, flat: true });
  g.restore();
}
/** a small phone held in a hand (crowd shots): screen glows k 0..1 */
export function handPhone(g, x, y, h, k = 0, o = {}) { const w = h * 0.5; if (k > 0) glow(g, x, y, h * 1.4, o.glow ?? '#9fd0ff', 0.4 * k, true); rrect(g, x - w / 2, y - h / 2, w, h, w * 0.18, { fill: '#1b2340', flat: true }); rrect(g, x - w * 0.4, y - h * 0.44, w * 0.8, h * 0.88, w * 0.12, { fill: k > 0 ? (o.screen ?? '#9fd0ff') : '#33405e', flat: true, alpha: 0.5 + 0.5 * k }); }
