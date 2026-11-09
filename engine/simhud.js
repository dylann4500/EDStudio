// 055: the "Crazy What If" sim text layout (@okwhatifcrazy, docs/reference/okwhatifcrazy.md) in our house rules.
// The question opens ALONE in the middle (CLAUDE.md), then glides up once and stays as the header with a small kicker over
// it; a left HUD per beat (a coloured bar, a letter-spaced label, a big light number + unit, a coloured sub-label); bold white
// subtitles in the lower third; the Scribe end card. DOM in #ui (crisp, captured like the other overlays). Nothing pulses:
// each block fades in once and out once; the HUD swaps its label/number at beat cuts and only the number rolls.
//   const hud = makeSimHud(story.sim); hud.update(t)   (call from shots.js update(); pure in t)
//   story.sim = { kicker, title: {html, in, dock, out}, hudIn, hudOut,
//                 hud: [{t0, t1, label, from, to, r0, r1, unit, fmt: 'int'|'money'|'dec'|'text', text, sub, color: 'gold'|'red'}],
//                 subs: [[t0, t1, text]], end: {t, icon, tag, url, offer} }
import { clamp } from './core.js';

const CSS = `
@font-face { font-family: 'Inter'; font-weight: 300; src: url(/node_modules/@fontsource/inter/files/inter-latin-300-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 700; src: url(/node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url(/node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2) format('woff2'); }
@font-face { font-family: 'Fredoka'; font-weight: 700; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2) format('woff2'); }
.sh { position: absolute; pointer-events: none; color: #fff; z-index: 2;
  text-shadow: 0 3px 5px rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.6), 0 0 36px rgba(0,0,0,.4); }
.sh::before { content: ''; position: absolute; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(0,0,0,.46), rgba(0,0,0,.24) 55%, rgba(0,0,0,0)); }
.sh-title { left: 64px; right: 64px; top: 0; text-align: center; font-family: 'Inter'; font-weight: 800; font-size: 80px; line-height: 1.08;
  letter-spacing: -0.01em; transform-origin: 50% 0; opacity: 0; }
.sh-title em { font-style: normal; color: #f6c445; }
.sh-title::before { left: -60px; right: -60px; top: -60px; bottom: -60px; }
.sh-kick { left: 0; right: 0; top: 228px; text-align: center; font-family: 'Inter'; font-weight: 700; font-size: 22px; letter-spacing: .34em; color: rgba(255,255,255,.86); opacity: 0; }
.sh-hud { left: 66px; top: 520px; padding: 4px 0 6px 22px; border-left: 6px solid #f6c445; font-family: 'Inter'; opacity: 0; }
.sh-hud::before { left: -60px; top: -50px; width: 560px; height: 260px; }
.sh-hud .lab { font-weight: 700; font-size: 22px; letter-spacing: .22em; color: rgba(255,255,255,.92); }
.sh-hud .num { font-weight: 300; font-size: 92px; line-height: 1.0; margin: 4px 0 6px -3px; white-space: nowrap; }
.sh-hud .num small { font-size: 36px; font-weight: 400; margin-left: 8px; letter-spacing: .02em; }
.sh-hud .hsub { font-weight: 700; font-size: 21px; letter-spacing: .16em; color: #f6c445; }
.sh-sub { left: 60px; right: 60px; top: 1296px; text-align: center; font-family: 'Inter'; font-weight: 800; font-size: 54px; line-height: 1.16; opacity: 0; }
.sh-sub::before { left: -30px; right: -30px; top: -40px; bottom: -40px; }
.sh-end { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; text-shadow: none; z-index: 3; }
.sh-end::before { display: none; }
.sh-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.55), rgba(10,6,8,.88)); }
.sh-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.sh-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.sh-end .tag { position: relative; font-family: Georgia, serif; font-style: italic; font-size: 60px; margin-top: 26px; color: #f3e6d3; }
.sh-end .url { position: relative; margin-top: 56px; padding: 18px 46px 20px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-family: 'Fredoka'; font-weight: 700; font-size: 92px; box-shadow: 0 10px 0 rgba(0,0,0,.35); color: #fff; }
.sh-end .offer { position: relative; margin-top: 36px; font-family: 'Fredoka'; font-weight: 700; font-size: 56px; color: #ffd23f; }
`;
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const SIM_FONTS = ['800 80px Inter', '700 22px Inter', '300 92px Inter', '700 56px Fredoka'];

export function makeSimHud(o) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const e = document.createElement('div'); e.className = 'sh ' + cls; e.innerHTML = html; ui.appendChild(e); return e; };
  const title = el('sh-title', o.title.html), kick = el('sh-kick', o.kicker || '');
  const hud = el('sh-hud', '<div class="lab"></div><div class="num"></div><div class="hsub"></div>');
  const lab = hud.querySelector('.lab'), num = hud.querySelector('.num'), sub = hud.querySelector(".hsub");
  const subEl = el('sh-sub');
  const end = o.end ? el('sh-end', `<div class="bg"></div><img src="${o.end.icon}"><div class="wm">Scribe</div><div class="tag">${o.end.tag}</div><div class="url">${o.end.url}</div><div class="offer">${o.end.offer}</div>`) : null;
  const COL = { gold: '#f6c445', red: '#ff6b57', green: '#7ee08a', blue: '#7cc8ff' };
  let lastSeg = null, lastNum = '', lastSub = null, titleH = 0;
  const fmtN = (seg, n) => {
    if (seg.fmt === 'text') return seg.text;
    const v = seg.dec ? n.toFixed(seg.dec) : Math.round(n).toLocaleString('en-US');
    return (seg.fmt === 'money' ? '$' : seg.sign && n > 0 ? '+' : '') + v;
  };
  function update(t) {
    const T = o.title, outT = o.hudOut ?? 1e9;
    // title: fades in centered, glides to the header at T.dock, fades out once at the end card
    if (!titleH) titleH = title.offsetHeight || 180;
    const d = ss((t - T.dock) / 0.55), sc = 1 - 0.3 * d;
    const yC = 960 - titleH / 2, yTop = 268;
    title.style.transform = `translateY(${yC + (yTop - yC) * d}px) scale(${sc})`;
    title.style.opacity = ss((t - T.in) / 0.4) * (1 - ss((t - T.out) / 0.4));
    const shown = ss((t - (o.hudIn ?? T.dock + 0.4)) / 0.35) * (1 - ss((t - outT) / 0.35));
    kick.style.opacity = shown;
    // HUD
    const segs = o.hud || [], seg = segs.find((s) => t >= s.t0 && t < s.t1) || null;
    hud.style.opacity = seg ? shown : 0;
    if (seg) {
      if (seg !== lastSeg) { lab.textContent = seg.label; sub.textContent = seg.sub || ''; const c = COL[seg.color || 'gold']; hud.style.borderLeftColor = c; sub.style.color = c; lastSeg = seg; lastNum = ''; }
      const u = seg.r0 === undefined ? 1 : clamp((t - seg.r0) / (seg.r1 - seg.r0));
      const k = seg.ease === 'linear' ? u : u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const txt = fmtN(seg, (seg.from ?? 0) + ((seg.to ?? seg.from ?? 0) - (seg.from ?? 0)) * k) + (seg.unit ? `<small>${seg.unit}</small>` : '');
      if (txt !== lastNum) { num.innerHTML = txt; lastNum = txt; }
    }
    // subtitles
    const s = (o.subs || []).find(([a, b]) => t >= a && t < b);
    if (s) {
      if (lastSub !== s[2]) { subEl.textContent = s[2]; lastSub = s[2]; }
      subEl.style.opacity = ss((t - s[0]) / 0.2) * (1 - ss((t - (s[1] - 0.2)) / 0.2));
      subEl.style.transform = `translateY(${(1 - ss((t - s[0]) / 0.28)) * 12}px)`;
    } else subEl.style.opacity = 0;
    if (end) { const age = t - o.end.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, title, hud, sub: subEl, end };
}
