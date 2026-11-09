// flat2d Scribe end card, drawn on the stage canvas in FRAME px (crisp: nothing post-processes the 2D canvas).
// A cream page, a big outlined card, the real logo (videos/049-scribe-promo/scribe-icon.png), the Georgia wordmark, the line,
// tryscribe.ink in a red pill and the site's offer — every element pops in ONCE (staggered) and then holds still.
//   drawEndCard(S, icon, age, { tag, url, offer, extra: (I, k) => {} })   age = seconds since the card started (< 0 = hidden)
import { INK } from './ink.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ob = (u, s = 1.9) => { u = clamp(u); return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };

export function drawEndCard(S, icon, age, o = {}) {
  if (age < 0) return;
  const I = S.I, ctx = S.ctx; S.screen();
  const fade = clamp(age / 0.3);
  ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = o.bg ?? '#f3efe6'; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = 'rgba(154,28,37,.06)'; for (let y = 0; y < 1920; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < 1080; x += 64) { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  const pop = (d) => ob((age - d) / 0.4), at = (d) => clamp((age - d) / 0.12);
  const cy = o.cy ?? 820;
  // the card
  { const k = pop(0.05); ctx.save(); ctx.globalAlpha = at(0.05); ctx.translate(540, cy); ctx.scale(k, k); I.rect(-430, -560, 860, 1120, { fill: '#fffdf6', lw: 9, r: 46 }); ctx.restore(); }
  // logo
  { const k = pop(0.15); ctx.save(); ctx.globalAlpha = at(0.15); ctx.translate(540, cy - 300); ctx.scale(k, k); ctx.rotate(-0.04 * (1 - clamp((age - 0.15) / 0.5))); ctx.drawImage(icon, -150, -150, 300, 300); ctx.restore(); }
  // wordmark + tag
  { const a = at(0.3); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 168px Georgia, "Times New Roman", serif'; ctx.fillText('Scribe', 540, cy + 30);
    ctx.font = 'italic 400 46px Georgia, serif'; ctx.fillStyle = '#4a3f38'; ctx.fillText(o.tag ?? 'Your homework, in your handwriting.', 540, cy + 120); ctx.restore(); }
  // url pill
  { const k = pop(0.45); ctx.save(); ctx.globalAlpha = at(0.45); ctx.translate(540, cy + 260); ctx.scale(k, k);
    const url = o.url ?? 'tryscribe.ink'; ctx.font = '700 88px Fredoka'; const w = ctx.measureText(url).width + 110;
    I.rect(-w / 2, -72, w, 144, { fill: '#9a1c25', lw: 8, r: 72 }); ctx.fillStyle = '#fffdf6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(url, 0, 6); ctx.restore(); }
  // offer
  { const k = pop(0.6); ctx.save(); ctx.globalAlpha = at(0.6); ctx.translate(540, cy + 430); ctx.scale(k, k); I.text(o.offer ?? '10 free assignments', 0, 0, { size: 62, fill: '#ffd23f', lw: 13 }); ctx.restore(); }
  if (o.extra) o.extra(I, age);
}
