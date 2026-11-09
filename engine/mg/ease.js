// Motion-graphics timing kit (engine/mg, docs/STYLES.md → mg). Everything is a pure function of t: any frame renders on its own.
//   tw(t, t0, dur, ease)        0..1 tween (eased)               seqv(t, [[t, v], …], ease)  keyframed number / array / colour
//   morph(A, B, k)              point lists of any length → one shape (resampled by arc length, then lerped)
//   mixc('#hex', '#hex', k)     colour mix → 'rgb(…)'          shade('#hex', k)  k < 0 darker, > 0 lighter
//   hash(n) / noise1(x)         deterministic noise (never Math.random: renders must be identical)
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const inv = (x, a, b) => clamp((x - a) / (b - a));

// ---------------------------------------------------------------- easings (u in 0..1)
export const E = {
  lin: (u) => clamp(u),
  in2: (u) => clamp(u) ** 2,
  out2: (u) => 1 - (1 - clamp(u)) ** 2,
  out3: (u) => 1 - (1 - clamp(u)) ** 3,
  io2: (u) => { u = clamp(u); return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2; },
  io3: (u) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; },
  io5: (u) => { u = clamp(u); return u < 0.5 ? 16 * u ** 5 : 1 - (-2 * u + 2) ** 5 / 2; },
  outExpo: (u) => { u = clamp(u); return u >= 1 ? 1 : 1 - 2 ** (-10 * u); },
  inExpo: (u) => { u = clamp(u); return u <= 0 ? 0 : 2 ** (10 * u - 10); },
  ioExpo: (u) => { u = clamp(u); if (u <= 0 || u >= 1) return u; return u < 0.5 ? 2 ** (20 * u - 10) / 2 : (2 - 2 ** (-20 * u + 10)) / 2; },
  /** a soft overshoot (motion-graphics "settle"), s = overshoot */
  back: (u, s = 1.4) => { u = clamp(u); return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; },
  /** damped spring settle 0 → 1 (one gentle overshoot + a smaller one) */
  spring: (u, f = 2.2, d = 5.5) => { u = clamp(u); return 1 - Math.exp(-d * u) * Math.cos(f * Math.PI * u); },
  smooth: (u) => { u = clamp(u); return u * u * (3 - 2 * u); },
};

/** eased 0..1 between t0 and t0 + dur */
export const tw = (t, t0, dur = 0.5, ease = E.io3) => ease((t - t0) / dur);
/** in-hold-out envelope: 0 → 1 over fi after a, 1 → 0 over fo before b */
export const env = (t, a, b, fi = 0.3, fo = fi) => E.smooth((t - a) / fi) * (1 - E.smooth((t - (b - fo)) / fo));

/** keyframes [[t, value], …] (numbers, arrays of numbers or '#rrggbb' colours), eased per segment; holds outside */
export function seqv(t, keys, ease = E.io3) {
  if (t <= keys[0][0]) return keys[0][1];
  const L = keys[keys.length - 1]; if (t >= L[0]) return L[1];
  let i = 0; while (t > keys[i + 1][0]) i++;
  const [a, va] = keys[i], [b, vb] = keys[i + 1], k = ease((t - a) / (b - a));
  if (typeof va === 'string') return mixc(va, vb, k);
  if (Array.isArray(va)) return va.map((x, j) => lerp(x, vb[j], k));
  return lerp(va, vb, k);
}

// ---------------------------------------------------------------- colour
const HX = {};
export function rgb(hex) {
  if (HX[hex]) return HX[hex];
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16); return (HX[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
export const css = ([r, g, b], a = 1) => (a >= 1 ? `rgb(${r | 0},${g | 0},${b | 0})` : `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`);
const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
/** mix two colours (hex) → hex */
export function mixc(a, b, k) { const A = rgb(a), B = rgb(b); return toHex([lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)]); }
/** k > 0 toward white, k < 0 toward black */
export const shade = (hex, k) => (k >= 0 ? mixc(hex, '#ffffff', k) : mixc(hex, '#000000', -k));
/** hex + alpha → rgba() */
export const alpha = (hex, a) => css(rgb(hex), a);

// ---------------------------------------------------------------- noise (deterministic)
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
/** seeded PRNG (mulberry32) */
export function rng(seed = 1) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- shapes as point lists (for morphs)
export const circlePts = (cx, cy, r, n = 64) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
export function rrectPts(x, y, w, h, r, n = 64) {
  r = Math.min(r, w / 2, h / 2); const out = [], per = n / 4;
  const corners = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of corners) for (let i = 0; i < per; i++) { const a = a0 + (i / per) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
}
export const starPts = (cx, cy, r0, r1, k = 5, rot = -Math.PI / 2) => Array.from({ length: k * 2 }, (_, i) => { const a = rot + (i / (k * 2)) * Math.PI * 2, r = i % 2 ? r1 : r0; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
/** resample a closed polygon to n points evenly spaced by arc length (start = the point nearest the top-centre) */
export function resample(P, n = 96) {
  const L = [0]; for (let i = 1; i <= P.length; i++) { const a = P[i - 1], b = P[i % P.length]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const tot = L[L.length - 1], out = []; let j = 0;
  for (let i = 0; i < n; i++) {
    const d = (i / n) * tot; while (L[j + 1] < d) j++;
    const a = P[j], b = P[(j + 1) % P.length], u = (d - L[j]) / Math.max(1e-9, L[j + 1] - L[j]);
    out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  // rotate so index 0 is the top-most point (stable morphs between unrelated shapes)
  let best = 0; for (let i = 1; i < n; i++) if (out[i][1] < out[best][1] - 1e-6) best = i;
  return out.slice(best).concat(out.slice(0, best));
}
/** shape morph: A, B any closed point lists; k 0..1 */
export function morph(A, B, k, n = 96) {
  const a = A.length === n && A._rs ? A : resample(A, n), b = B.length === n && B._rs ? B : resample(B, n);
  return a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k)]);
}

// ---------------------------------------------------------------- numbers
export const commas = (n) => Math.round(n).toLocaleString('en-US');
/** a number that rolls from a to b between t0 and t1 (eased), printed with commas or `dec` decimals */
export function roll(t, t0, t1, a, b, { dec = 0, ease = E.io3 } = {}) { const v = lerp(a, b, ease((t - t0) / (t1 - t0))); return dec ? v.toFixed(dec) : commas(v); }
