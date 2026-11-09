// flat2d ink: the pen every flat2d drawing goes through (docs/STYLES.md → flat2d). Canvas 2D, no WebGL.
// Every outline is a hand-drawn line: shapes are sampled to points, each point jittered by a seeded hash that changes
// `boil` times a second (the classic 2D "line boil"), then traced as a smooth quadratic curve. Fills are flat with at most ONE
// cel-shade step (the shape filled in its shade colour, then re-filled in its base colour shifted up-left and clipped to the
// shape = a crescent of shade on the lower right). Everything is a pure function of the frame (deterministic renders).
//
//   const I = makeInk(ctx, { boil: 8, wob: 1.6 });   I.frame(t)  (once per frame: sets the boil step, resets ids)
//   I.ellipse(cx, cy, rx, ry, { fill, shade, line, lw })     I.rect(x, y, w, h, { r, fill, ... })     I.poly(pts, { ... })
//   I.limb([[x,y],[x,y],…], width, color)  outlined round-capped stroke (arms, legs, pipes)
//   I.line([[x,y],…], { line, lw })  a single wobbly ink line       I.text('LEO, 9', x, y, { size, fill, line })
//   I.group(seed, () => …)  draw with stable wobble ids (a puppet's lines don't re-boil when something else appears)
export const INK = '#151515';

const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** A colour helper: shade('#ffcc00', 0.8) darkens, shade(c, 1.2) lightens (toward white). */
export function tone(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k <= 1) { r *= k; g *= k; b *= k; } else { const u = k - 1; r += (255 - r) * u; g += (255 - g) * u; b += (255 - b) * u; }
  const c = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

export function makeInk(ctx, o = {}) {
  const I = { ctx, boil: o.boil ?? 8, amp: o.wob ?? 1.6, step: 0, id: 0, base: 0, lwScale: 1, t: 0 };
  I.frame = (t) => { I.t = t; I.step = Math.floor(t * I.boil + 1e-6); I.id = 0; I.base = 0; };
  const scaleNow = () => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  I.scaleNow = scaleNow;
  /** draw fn with wobble ids starting at seed (stable across frames whatever else is drawn before it) */
  I.group = (seed, fn) => { const sid = I.id, sb = I.base; I.id = 0; I.base = seed * 4099; try { fn(); } finally { I.id = sid; I.base = sb; } };
  const nextId = () => I.base + (++I.id);

  /** jitter points by `amp` SCREEN px (boils at I.boil per second) */
  function jit(pts, amp) {
    if (!amp) return pts;
    const id = nextId(), k = I.step, a = amp / scaleNow();
    return pts.map(([x, y], i) => [x + a * (h1(id * 91.7 + i * 13.1 + k * 7.31) * 2 - 1), y + a * (h1(id * 53.3 + i * 29.7 + k * 3.17 + 5.5) * 2 - 1)]);
  }
  I.jit = jit;
  /** smooth path through points (quadratic midpoints); sharp = straight segments */
  function trace(p, pts, closed, sharp) {
    const n = pts.length; if (n < 2) return;
    if (sharp) { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) p.lineTo(pts[i][0], pts[i][1]); if (closed) p.closePath(); return; }
    if (!closed) {
      p.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) p.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      p.lineTo(pts[n - 1][0], pts[n - 1][1]); return;
    }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = m(pts[n - 1], pts[0]); p.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); p.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); }
    p.closePath();
  }
  I.trace = trace;
  /** insert points along long edges so the wobble bends them (every `step` screen px) */
  function subdiv(pts, closed, step = 46) {
    const out = [], s = scaleNow(), n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) * s, k = Math.max(1, Math.round(L / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  I.subdiv = subdiv;

  /**
   * The core: a closed (or open) shape. o = { fill, shade, shadeOff:[fx,fy] (fraction of bbox), line (null = no outline), lw,
   * wob (screen px), sharp, alpha, sub (subdivide edges, default true for polys), inner: (path) => {} extra clipped drawing }
   */
  function shape(pts, o = {}) {
    const closed = o.closed !== false, sharp = !!o.sharp;
    let P = o.sub === false ? pts : subdiv(pts, closed, o.subStep ?? 46);
    P = jit(P, o.wob ?? I.amp);
    const path = new Path2D(); trace(path, P, closed, sharp);
    if (o.alpha != null) { ctx.save(); ctx.globalAlpha *= o.alpha; }
    if (closed && o.fill) {
      if (o.shade) {
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const [fx, fy] = o.shadeOff || [0.14, 0.1];
        ctx.fillStyle = o.shade; ctx.fill(path);
        ctx.save(); ctx.clip(path); ctx.translate(-(x1 - x0) * fx, -(y1 - y0) * fy); ctx.fillStyle = o.fill; ctx.fill(path); ctx.restore();
      } else { ctx.fillStyle = o.fill; ctx.fill(path); }
    }
    if (o.inner) { ctx.save(); ctx.clip(path); o.inner(path); ctx.restore(); }
    if (o.line !== null && o.line !== false) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = o.line || INK; ctx.lineWidth = (o.lw ?? 6) * I.lwScale; ctx.stroke(path);
    }
    if (o.alpha != null) ctx.restore();
    return path;
  }
  I.shape = shape;
  I.poly = (pts, o = {}) => shape(pts, o);

  /** ellipse sampled to n points (n from its on-screen size) */
  I.ellipsePts = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n) => {
    const s = scaleNow(), per = Math.PI * (Math.abs(rx) + Math.abs(ry)) * s * Math.abs(a1 - a0) / (Math.PI * 2);
    n = n ?? Math.max(10, Math.min(56, Math.round(per / 26)));
    const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-6, out = [];
    for (let i = 0; i < (full ? n : n + 1); i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  I.ellipse = (cx, cy, rx, ry, o = {}) => shape(I.ellipsePts(cx, cy, rx, ry), { ...o, sub: false });
  I.circle = (cx, cy, r, o = {}) => I.ellipse(cx, cy, r, r, o);
  /** rounded rect (x, y = top-left) */
  I.rectPts = (x, y, w, h, r = 0) => {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    if (r <= 0.5) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const out = [], c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    for (const [cx, cy, a0] of c) for (let k = 0; k <= 3; k++) { const a = a0 + (Math.PI / 2) * k / 3; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  };
  I.rect = (x, y, w, h, o = {}) => shape(I.rectPts(x, y, w, h, o.r ?? 8), { ...o, sharp: o.sharp ?? !(o.r > 0) });

  /** an outlined round-capped stroke along a polyline (arms, legs, cables, pipes) */
  I.limb = (pts, width, color, o = {}) => {
    const P = jit(pts, (o.wob ?? I.amp) * 0.6), path = new Path2D(); trace(path, P, false, o.sharp);
    ctx.lineJoin = 'round'; ctx.lineCap = o.cap || 'round';
    if (o.line !== null) { ctx.strokeStyle = o.line || INK; ctx.lineWidth = width + 2 * (o.lw ?? 6) * I.lwScale; ctx.stroke(path); }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(path);
    return path;
  };
  /** a plain wobbly ink line (no fill) */
  I.line = (pts, o = {}) => {
    let P = o.sub === false ? pts : subdiv(pts, false, o.subStep ?? 40);
    P = jit(P, o.wob ?? I.amp); const path = new Path2D(); trace(path, P, false, o.sharp);
    if (o.alpha != null) { ctx.save(); ctx.globalAlpha *= o.alpha; }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = o.line || INK; ctx.lineWidth = (o.lw ?? 6) * I.lwScale; ctx.stroke(path);
    if (o.alpha != null) ctx.restore();
    return path;
  };
  I.arc = (cx, cy, rx, ry, a0, a1, o = {}) => I.line(I.ellipsePts(cx, cy, rx, ry, a0, a1), { ...o, sub: false });

  /** bold cartoon text: thick ink outline under a flat fill (Luckiest Guy by default) */
  I.text = (str, x, y, o = {}) => {
    const size = o.size ?? 60;
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight ?? 400} ${size}px ${o.font ?? '"Luckiest Guy"'}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = o.base ?? 'middle';
    if (o.maxW) { const w = ctx.measureText(str).width; if (w > o.maxW) ctx.scale(o.maxW / w, o.maxW / w); }
    if (o.shadow !== false && o.line !== null) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillText(str, 0, size * 0.09); }
    if (o.line !== null) { ctx.lineJoin = 'round'; ctx.strokeStyle = o.line ?? INK; ctx.lineWidth = o.lw ?? size * 0.2; ctx.strokeText(str, 0, 0); }
    ctx.fillStyle = o.fill ?? '#fff'; ctx.fillText(str, 0, 0);
    ctx.restore();
  };
  I.measure = (str, size, font = '"Luckiest Guy"', weight = 400) => { ctx.save(); ctx.font = `${weight} ${size}px ${font}`; const w = ctx.measureText(str).width; ctx.restore(); return w; };
  /** a jittered scalar for hand-made variation (stable per key, boils with the step) */
  I.n = (key, boil = true) => h1(key * 17.13 + (boil ? I.step * 3.7 : 0)) * 2 - 1;
  return I;
}
