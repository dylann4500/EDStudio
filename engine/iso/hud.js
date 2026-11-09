// iso style (060): the text layer — the landmark "What if" sim layout (@okwhatifcrazy's Pisa reel: a small letter-spaced kicker
// with a running T+ clock, the question pinned at the top with "What if" in colour, a left HUD per beat (coloured bar, label,
// a big thin number + unit, coloured sub-label), one bold white subtitle per beat, a dark end card), adapted from 055's
// engine/simhud.js (branch claude/055-hippo-first-shift) with our house rules: the question opens ALONE in the middle, then
// glides up once and stays; every block fades in once and out once; only the HUD number rolls (tabular figures: it never jitters).
// DOM in #ui (never blurred by the tilt-shift). Classes are prefixed `ih-` (index.html styles .sub/.num/.hud for other tones).
//   const hud = makeIsoHud(story.iso); hud.update(t)   (from shots.js update(); pure in t)
//   story.iso = { kicker: 'SIMULATION · PISA, ITALY · T+{T}', clock0, title: {html, in, dock, out}, hudIn, hudOut,
//     hud: [{t0, t1, label, from, to, r0, r1, unit, fmt: 'int'|'dec'|'text', dec, text, sub, color: 'gold'|'red'|'green'|'blue', ease}],
//     subs: [[t0, t1, text]], end: {t, icon, tag, url, offer, ask} }
import { clamp } from '../core.js';

const CSS = `
@font-face { font-family: 'Inter'; font-weight: 300; src: url(/node_modules/@fontsource/inter/files/inter-latin-300-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 700; src: url(/node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url(/node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2) format('woff2'); }
@font-face { font-family: 'Fredoka'; font-weight: 700; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2) format('woff2'); }
.ih { position: absolute; pointer-events: none; color: #fff; z-index: 2;
  text-shadow: 0 3px 5px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.55), 0 0 36px rgba(0,0,0,.35); }
.ih::before { content: ''; position: absolute; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,.2) 55%, rgba(0,0,0,0)); }
.ih-title { left: 70px; right: 70px; top: 0; text-align: center; font-family: 'Inter'; font-weight: 800; font-size: 80px; line-height: 1.08;
  letter-spacing: -0.01em; transform-origin: 50% 0; opacity: 0; }
.ih-title em { font-style: normal; color: #ff7a45; }
.ih-title::before { left: -60px; right: -60px; top: -60px; bottom: -60px; }
.ih-kick { left: 0; right: 0; top: 214px; text-align: center; font-family: 'Inter'; font-weight: 700; font-size: 22px; letter-spacing: .3em;
  color: rgba(255,255,255,.88); opacity: 0; font-variant-numeric: tabular-nums; }
.ih-hud { left: 66px; top: 540px; padding: 4px 0 6px 22px; border-left: 6px solid #f6c445; font-family: 'Inter'; opacity: 0; }
.ih-hud::before { left: -60px; top: -50px; width: 560px; height: 260px; }
.ih-hud .ih-lab { font-weight: 700; font-size: 22px; letter-spacing: .22em; color: rgba(255,255,255,.94); }
.ih-hud .ih-num { font-weight: 300; font-size: 92px; line-height: 1.0; margin: 4px 0 6px -3px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.ih-hud .ih-num small { font-size: 36px; font-weight: 400; margin-left: 8px; letter-spacing: .02em; }
.ih-hud .ih-hsub { font-weight: 700; font-size: 21px; letter-spacing: .16em; color: #f6c445; }
.ih-sub { left: 60px; right: 60px; top: 1290px; text-align: center; font-family: 'Inter'; font-weight: 800; font-size: 56px; line-height: 1.16; opacity: 0; }
.ih-sub::before { left: -30px; right: -30px; top: -40px; bottom: -40px; }
.ih-end { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; text-shadow: none; z-index: 3; }
.ih-end::before { display: none; }
.ih-end .ih-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.5), rgba(10,6,8,.86)); }
.ih-end .ih-ask { position: relative; font-family: 'Inter'; font-weight: 800; font-size: 54px; line-height: 1.12; margin: 0 90px 70px; color: #fff; }
.ih-end .ih-ask small { display: block; margin-top: 18px; font-weight: 700; font-size: 24px; letter-spacing: .3em; color: #ff9a6a; }
.ih-end img { width: 300px; height: 300px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.ih-end .ih-wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-size: 180px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.ih-end .ih-tag { position: relative; font-family: Georgia, serif; font-style: italic; font-size: 58px; margin-top: 24px; color: #f3e6d3; }
.ih-end .ih-url { position: relative; margin-top: 50px; padding: 18px 46px 20px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-family: 'Fredoka'; font-weight: 700; font-size: 88px; box-shadow: 0 10px 0 rgba(0,0,0,.35); color: #fff; }
.ih-end .ih-offer { position: relative; margin-top: 34px; font-family: 'Fredoka'; font-weight: 700; font-size: 54px; color: #ffd23f; }
`;
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const ISO_FONTS = ['800 80px Inter', '700 22px Inter', '300 92px Inter', '700 56px Fredoka'];
const COL = { gold: '#f6c445', red: '#ff6b57', green: '#7ee08a', blue: '#7cc8ff', orange: '#ff9a4a' };

export function makeIsoHud(o) {
  // the iso layer replaces the core text layer (title / HUD / subtitles / end card of engine/index.html)
  for (const id of ['title', 'hud', 'sub', 'end']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const e = document.createElement('div'); e.className = 'ih ' + cls; e.innerHTML = html; ui.appendChild(e); return e; };
  const title = el('ih-title', o.title.html), kick = el('ih-kick', '');
  const hud = el('ih-hud', '<div class="ih-lab"></div><div class="ih-num"></div><div class="ih-hsub"></div>');
  const lab = hud.querySelector('.ih-lab'), num = hud.querySelector('.ih-num'), sub = hud.querySelector('.ih-hsub');
  const subEl = el('ih-sub');
  const E = o.end;
  const end = E ? el('ih-end', `<div class="ih-bg"></div>${E.ask ? `<div class="ih-ask">${E.ask}${E.askSmall ? `<small>${E.askSmall}</small>` : ''}</div>` : ''}<img src="${E.icon}"><div class="ih-wm">Scribe</div><div class="ih-tag">${E.tag}</div><div class="ih-url">${E.url}</div><div class="ih-offer">${E.offer}</div>`) : null;
  let lastSeg = null, lastNum = '', lastSub = null, lastKick = '', titleH = 0;
  const fmtN = (seg, n) => {
    if (seg.fmt === 'text') return seg.text;
    const v = seg.dec ? n.toFixed(seg.dec) : Math.round(n).toLocaleString('en-US');
    return (seg.sign && n > 0 ? '+' : '') + v;
  };
  function update(t) {
    const T = o.title, outT = o.hudOut ?? 1e9;
    if (!titleH) titleH = title.offsetHeight || 180;
    const d = ss((t - T.dock) / 0.55), sc = 1 - 0.32 * d;
    const yC = 960 - titleH / 2, yTop = o.titleTop ?? 262;
    title.style.transform = `translateY(${yC + (yTop - yC) * d}px) scale(${sc})`;
    title.style.opacity = ss((t - T.in) / 0.4) * (1 - ss((t - T.out) / 0.4));
    const shown = ss((t - (o.hudIn ?? T.dock + 0.4)) / 0.35) * (1 - ss((t - outT) / 0.35));
    // kicker with a running clock ("T+00:07"): only the digits change
    if (o.kicker) {
      const sec = Math.max(0, Math.floor(t - (o.clock0 ?? 0)));
      const txt = o.kicker.replace('{T}', `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`);
      if (txt !== lastKick) { kick.textContent = txt; lastKick = txt; }
      kick.style.opacity = shown;
    }
    const segs = o.hud || [], seg = segs.find((s) => t >= s.t0 && t < s.t1) || null;
    hud.style.opacity = seg ? shown : 0;
    if (seg) {
      if (seg !== lastSeg) { lab.textContent = seg.label; sub.textContent = seg.sub || ''; const c = COL[seg.color || 'gold']; hud.style.borderLeftColor = c; sub.style.color = c; lastSeg = seg; lastNum = ''; }
      const u = seg.r0 === undefined ? 1 : clamp((t - seg.r0) / (seg.r1 - seg.r0));
      const k = seg.ease === 'linear' ? u : u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const txt = fmtN(seg, (seg.from ?? 0) + ((seg.to ?? seg.from ?? 0) - (seg.from ?? 0)) * k) + (seg.unit ? `<small>${seg.unit}</small>` : '');
      if (txt !== lastNum) { num.innerHTML = txt; lastNum = txt; }
      // a second sub-label can swap in once (e.g. "TOWER · STRAIGHT" → "BACK TO NORMAL") at seg.subAt
      const sl = seg.sub2 && t >= seg.subAt ? seg.sub2 : seg.sub || '';
      if (sub.textContent !== sl) sub.textContent = sl;
    }
    const s = (o.subs || []).find(([a, b]) => t >= a && t < b);
    if (s) {
      if (lastSub !== s[2]) { subEl.textContent = s[2]; lastSub = s[2]; }
      subEl.style.opacity = ss((t - s[0]) / 0.2) * (1 - ss((t - (s[1] - 0.2)) / 0.2));
      subEl.style.transform = `translateY(${(1 - ss((t - s[0]) / 0.28)) * 12}px)`;
    } else subEl.style.opacity = 0;
    if (end) { const age = t - E.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, title, hud, sub: subEl, end };
}
