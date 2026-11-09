// The Scribe end card in the motion-graphics look: the deep-blue backdrop (slow parallax stars + soft planets), a cream card with
// the house long shadow, the real logo (videos/049-scribe-promo/scribe-icon.png), the Georgia wordmark, the tag line, tryscribe.ink
// in a red pill and the site's own offer. Each element eases in ONCE (staggered) and then holds still (≥ 3.5 s readable).
//   drawEndCard(M, g, icon, age, { tag, url, offer, top: 'small line above the card', t })   age = seconds since the card began
import { clamp, E } from './ease.js';
import { rrect, circle, glow, TAU } from './draw.js';
import { txt, ktext, FONT } from './type.js';
import { PAL } from './stage.js';

export function drawEndCard(M, g, icon, age, o = {}) {
  if (age < 0) return;
  const fade = clamp(age / 0.35), t = o.t ?? age;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fade;
  const bg = g.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, '#0d1d48'); bg.addColorStop(1, '#070f2a'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  M.view(g, { x: Math.sin(t * 0.2) * 40, y: t * 6 }, 3, (gg) => M.stars(gg, t, { n: 120, seed: 41 }));
  M.view(g, { x: t * 8 }, 1.6, (gg) => { circle(gg, -420, -700, 150, { fill: PAL.purple, shadow: { len: 260, a: 0.25 } }); circle(gg, 470, 760, 210, { fill: PAL.teal, shadow: { len: 300, a: 0.25 } }); circle(gg, 520, -820, 46, { fill: PAL.yellow }); });
  g.restore();
  const cy = o.cy ?? 900, at = (d, dur = 0.5) => clamp((age - d) / dur), pop = (d) => E.back(at(d, 0.55), 1.3);
  if (o.top) [].concat(o.top).forEach((line, i) => { g.save(); g.globalAlpha = at(0.2 + i * 0.12); ktext(g, line, 540, (o.topY ?? 250) + i * 54, { size: 36, font: FONT.body, weight: 700, k: at(0.2 + i * 0.12, 0.7), color: '#cfe0ff', track: 2 }); g.restore(); });   // a fact line (or lines) above the card
  { const k = pop(0.05); g.save(); g.globalAlpha = at(0.05, 0.25); g.translate(540, cy); g.scale(k, k); rrect(g, -420, -520, 840, 1040, 64, { fill: '#fffaf0', light: 0.03, shadow: { len: 420, a: 0.3 } }); g.restore(); }
  { const k = pop(0.18); g.save(); g.globalAlpha = at(0.18, 0.25); g.translate(540, cy - 260); g.scale(k, k); glow(g, 0, 0, 260, '#ff8f8f', 0.25); if (icon) g.drawImage(icon, -150, -150, 300, 300); g.restore(); }
  { g.save(); g.globalAlpha = at(0.32, 0.35); g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = '400 166px Georgia, "Times New Roman", serif'; g.fillText('Scribe', 540, cy + 70);
    g.font = 'italic 400 46px Georgia, serif'; g.fillStyle = '#4a3f38'; g.fillText(o.tag ?? 'Your homework, in your handwriting.', 540, cy + 160); g.restore(); }
  { const k = pop(0.48); g.save(); g.globalAlpha = at(0.48, 0.25); g.translate(540, cy + 300); g.scale(k, k); const url = o.url ?? 'tryscribe.ink';
    g.font = `600 84px ${FONT.head}`; const w = g.measureText(url).width + 110; rrect(g, -w / 2, -70, w, 140, 70, { fill: '#9a1c25' }); txt(g, url, 0, 4, { size: 84, weight: 600, color: '#fffaf0', shadow: false }); g.restore(); }
  { const k = pop(0.62); g.save(); g.globalAlpha = at(0.62, 0.25); g.translate(540, cy + 640); g.scale(k, k); txt(g, o.offer ?? '10 free assignments', 0, 0, { size: 62, weight: 600, color: PAL.yellow }); g.restore(); }
}
