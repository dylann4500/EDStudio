// 050 (Scribe promo): the HUD (class names are all dh-*: engine/index.html already styles .sub/.num/.hud) for "upgrade X every day" reels — a DAY counter box top-left whose number ROLLS to each new day,
// a second line that rolls a count (STUDENTS 1 → 10,000) or shows a clock ("11:02 PM"), and the Scribe end card (same look as
// brhud.js's). DOM in #ui (captured crisp like the captions). Nothing pulses: the box fades in once, numbers only roll.
//   const hud = makeDayHud({ show: [t0, t1], day: [[t, n], …], count: { label: 'STUDENTS', keys: [[t, n], …] },
//                            clock: [[t, '11:02 PM' | ''], …], end: { t, icon, url, tag, offer } });   hud.update(t)
import { clamp } from '../core.js';

const CSS = `
.dh { position: absolute; font-family: 'Fredoka'; font-weight: 700; color: #fff; pointer-events: none; }
.dh-box { left: 44px; top: 150px; min-width: 236px; padding: 12px 26px 14px 20px; background: rgba(14,17,24,.86); border-radius: 18px; border-left: 12px solid #ffd23f;
  box-shadow: 0 8px 0 rgba(0,0,0,.35); }
.dh-box .dh-row { display: flex; align-items: baseline; gap: 14px; }
.dh-box .dh-lab { font-size: 34px; letter-spacing: .12em; color: #ffd23f; line-height: 1; }
.dh-box .dh-num { font-family: 'Luckiest Guy'; font-weight: 400; font-size: 108px; line-height: .95; }
.dh-box .dh-sub { font-size: 34px; letter-spacing: .05em; color: #dfe6ee; margin-top: 2px; white-space: nowrap; }
.dh-box .dh-sub b { color: #fff; }
.dh-end { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.dh-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.55), rgba(10,6,8,.86)); }
.dh-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.dh-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.dh-end .tag { position: relative; font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: 60px; margin-top: 26px; color: #f3e6d3; }
.dh-end .url { position: relative; margin-top: 56px; padding: 18px 46px 20px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-size: 92px; letter-spacing: .01em; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.dh-end .offer { position: relative; margin-top: 36px; font-size: 56px; color: #ffd23f; }
`;
const easeOutBack = (u) => { const c = 1.9; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

/** keys [[t, n], …] → the value at t; each step rolls from the previous value over `dur` s (ease-out, geometric for big jumps). */
function rollAt(keys, t, dur) {
  if (!keys || !keys.length || t < keys[0][0]) return keys && keys.length ? keys[0][1] : 0;
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [t0, v1] = keys[i], v0 = i ? keys[i - 1][1] : v1, u = 1 - (1 - clamp((t - t0) / dur)) ** 3;
  if (v0 > 0 && v1 / v0 > 20) return v0 * Math.pow(v1 / v0, u);
  return v0 + (v1 - v0) * u;
}

export function makeDayHud(o) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const e = document.createElement('div'); e.className = 'dh ' + cls; e.innerHTML = html; ui.insertBefore(e, ui.firstChild); return e; };
  const box = el('dh-box', `<div class="dh-row"><span class="dh-lab">DAY</span><span class="dh-num">1</span></div><div class="dh-sub"></div>`);
  const num = box.querySelector('.dh-num'), sub = box.querySelector('.dh-sub');
  const end = o.end ? el('dh-end', `<div class="bg"></div><img src="${o.end.icon}"><div class="wm">Scribe</div><div class="tag">${o.end.tag}</div><div class="url">${o.end.url}</div><div class="offer">${o.end.offer}</div>`) : null;
  if (end) ui.appendChild(end);   // above the captions
  const strAt = (keys, t) => { let v = ''; for (const [a, s] of keys || []) if (t >= a) v = s; return v; };
  let lastN = null, lastSub = null;
  function update(t) {
    const [s0, s1] = o.show, vis = t >= s0 && t < s1, a = ss((t - s0) / 0.25) * (1 - ss((t - (s1 - 0.3)) / 0.3));
    box.style.opacity = vis ? a : 0; box.style.transform = `translateY(${(1 - ss((t - s0) / 0.3)) * -30}px)`;
    const n = Math.round(rollAt(o.day, t, o.dayRoll ?? 0.4)); if (n !== lastN) { num.textContent = String(n); lastN = n; }
    const ck = strAt(o.clock, t);
    const s = ck ? ck : o.count ? `${o.count.label} <b>${Math.round(rollAt(o.count.keys, t, o.count.roll ?? 0.8)).toLocaleString('en-US')}</b>` : '';
    if (s !== lastSub) { sub.innerHTML = s; lastSub = s; }
    if (end) { const age = t - o.end.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, box, end };
}
