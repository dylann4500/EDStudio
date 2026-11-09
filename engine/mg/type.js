// Kinetic typography on the canvas (in-world labels, chart titles, big numbers). Subtitles + the HUD stay DOM (overlay.js).
// Every reveal is ONE smooth ease-in per word (rise + unmask), never a pulse or a blink (CLAUDE.md text rules).
//   ktext(g, 'SOUND TRAVELS', x, y, { size, weight, font, color, k (0..1 reveal), mode: 'rise'|'wipe'|'type'|'scale', align, stagger, shadow })
//   label(g, 'VENICE BEACH', x, y, { k, sub, leader: [x2, y2], color, bg, size })   a tag with a leader line to (x2, y2)
//   bigNum(g, '343', x, y, { size, unit: 'm/s', k })
import { clamp, lerp, E, alpha as rgba } from './ease.js';
import { line, circle, rrect } from './draw.js';
import { PAL } from './stage.js';

export const FONT = { head: 'Fredoka', body: 'Inter' };
const fontStr = (o) => `${o.weight ?? 600} ${o.size ?? 64}px ${o.font ?? FONT.head}`;

/** draw text with a soft shadow (readable over anything) */
export function txt(g, s, x, y, o = {}) {
  g.save(); g.font = fontStr(o); g.textAlign = o.align ?? 'center'; g.textBaseline = o.base ?? 'middle'; g.fillStyle = o.color ?? PAL.white;
  if (o.track) g.letterSpacing = `${o.track}px`;
  if (o.alpha !== undefined) g.globalAlpha *= clamp(o.alpha);
  if (o.shadow !== false) { g.shadowColor = o.shadowColor ?? 'rgba(4,10,30,.55)'; g.shadowBlur = o.shadowBlur ?? (o.size ?? 64) * 0.22; g.shadowOffsetY = (o.size ?? 64) * 0.05; }
  g.fillText(s, x, y); const w = g.measureText(s).width; g.restore(); return w;
}
export function measure(g, s, o = {}) { g.save(); g.font = fontStr(o); if (o.track) g.letterSpacing = `${o.track}px`; const w = g.measureText(s).width; g.restore(); return w; }

/** kinetic text: words rise in one after another (k 0..1 over the whole line) */
export function ktext(g, s, x, y, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return;
  const words = String(s).split(' '), size = o.size ?? 64, mode = o.mode ?? 'rise', st = o.stagger ?? 0.55;
  const sp = measure(g, ' ', o), ws = words.map((w) => measure(g, w, o)), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = (o.align ?? 'center') === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const n = words.length;
  words.forEach((w, i) => {
    const a0 = n > 1 ? (i / (n - 1)) * st : 0, u = clamp((k - a0) / Math.max(0.0001, 1 - st)), e = E.out3(u);
    if (u > 0) {
      g.save();
      if (mode === 'rise') { g.beginPath(); g.rect(cx - 10, y - size * 0.75, ws[i] + 20, size * 1.55); g.clip(); txt(g, w, cx, y + (1 - e) * size * 0.9, { ...o, align: 'left' }); }
      else if (mode === 'wipe') { g.beginPath(); g.rect(cx - 10, y - size, (ws[i] + 20) * e, size * 2); g.clip(); txt(g, w, cx, y, { ...o, align: 'left' }); }
      else if (mode === 'scale') { const sc = lerp(0.6, 1, E.back(u, 1.2)); g.translate(cx + ws[i] / 2, y); g.scale(sc, sc); txt(g, w, -ws[i] / 2, 0, { ...o, align: 'left', alpha: (o.alpha ?? 1) * clamp(u * 2) }); }
      else { const nc = Math.round(w.length * u); txt(g, w.slice(0, nc), cx, y, { ...o, align: 'left' }); }
      g.restore();
    }
    cx += ws[i] + sp;
  });
}
/** a tag: rounded pill with text (+ a small sub line under it), with a leader line drawn on toward (lx, ly) */
export function label(g, s, x, y, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return;
  const size = o.size ?? 40, pad = size * 0.55, w = measure(g, s, { ...o, size, weight: o.weight ?? 700, font: o.font ?? FONT.body, track: o.track ?? size * 0.08 }) + pad * 2, h = size * 1.6;
  if (o.leader) { const L = line(g, [[x, y], o.leader], { w: size * 0.12, color: o.lineColor ?? PAL.white, k: E.out3(k * 1.4), alpha: 0.9 }); if (k > 0.6) circle(g, o.leader[0], o.leader[1], size * 0.22 * E.back((k - 0.6) / 0.4), { fill: o.dot ?? o.bg ?? PAL.yellow, flat: true }); }
  const e = E.back(clamp(k / 0.7), 1.1);
  g.save(); g.translate(x, y); g.scale(e, e);
  rrect(g, -w / 2, -h / 2, w, h, h / 2, { fill: o.bg ?? PAL.yellow, shadow: o.shadow === false ? null : { len: size * 1.2, a: 0.18 }, light: 0.08 });
  txt(g, s, 0, size * 0.04, { size, weight: o.weight ?? 700, font: o.font ?? FONT.body, color: o.color ?? PAL.ink, shadow: false, track: o.track ?? size * 0.08 });
  if (o.sub) txt(g, o.sub, 0, h * 0.5 + size * 0.75, { size: size * 0.78, weight: 600, font: FONT.body, color: o.subColor ?? PAL.white, track: size * 0.05, alpha: clamp((k - 0.4) / 0.4) });
  g.restore();
}
/** a big number with a unit, rising in */
export function bigNum(g, s, x, y, o = {}) {
  const size = o.size ?? 200, k = clamp(o.k ?? 1);
  ktext(g, s, x, y, { size, weight: 600, mode: 'rise', k, ...o });
  if (o.unit) txt(g, o.unit, x + measure(g, s, { size, weight: 600 }) / 2 + size * 0.08, y + size * 0.12, { size: size * 0.32, weight: 700, font: FONT.body, align: 'left', color: o.unitColor ?? PAL.yellow, alpha: clamp((k - 0.5) * 2) });
}
