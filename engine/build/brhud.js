// 049 (Scribe promo): a battle-royale HUD laid over the build captions (DOM in #ui, so render.mjs captures it crisp, like the
// captions; nothing in it pulses: the feed rows and the banner pop/slide in ONCE and fade out once, the counter only rolls).
//   const hud = makeHud({ show:[t0,t1], alive:[[t,n],…], day:[[t,'DAY 1 · 9:00 AM'],…], feed:[{t, name, by}], banner:{t,name,text},
//                         end:{t, icon, url, tag, offer}, map:{ shoreR, spots:[[x,z,label]], dots(t) → [[x,z],…] } })
//   hud.update(t)   (call it from shots.js update(); it is pure in t)
import { clamp } from '../core.js';

const CSS = `
.br { position: absolute; font-family: 'Fredoka'; font-weight: 700; color: #fff; pointer-events: none; }
.br-alive { right: 44px; top: 150px; width: 250px; padding: 14px 20px 12px 22px; background: rgba(14,17,24,.86); border-radius: 18px; border-left: 12px solid #ffd23f;
  box-shadow: 0 8px 0 rgba(0,0,0,.35); text-align: right; }
.br-alive .lab { font-size: 26px; letter-spacing: .14em; color: #ffd23f; line-height: 1; }
.br-alive .num { font-family: 'Luckiest Guy'; font-weight: 400; font-size: 104px; line-height: .95; margin-top: 6px; }
.br-alive .day { font-size: 25px; letter-spacing: .06em; color: #dfe6ee; margin-top: 4px; white-space: nowrap; }
.br-map { left: 44px; top: 150px; width: 210px; height: 210px; border-radius: 22px; overflow: hidden; border: 6px solid rgba(255,255,255,.92); box-shadow: 0 8px 0 rgba(0,0,0,.35); }
.br-map canvas { width: 100%; height: 100%; }
.br-feed { right: 44px; text-align: right; white-space: nowrap; font-size: 32px; line-height: 1; padding: 11px 16px 10px; background: rgba(14,17,24,.82); border-radius: 12px; opacity: 0; }
.br-feed b { color: #fff; } .br-feed i { font-style: normal; color: #c9d1db; font-weight: 600; } .br-feed em { font-style: normal; color: #ffd23f; }
.br-banner { left: 0; right: 0; top: 590px; text-align: center; opacity: 0; transform-origin: 50% 50%; }
.br-banner .box { display: inline-block; padding: 20px 56px 24px; background: #e2302f; border: 8px solid #fff; border-radius: 26px; box-shadow: 0 12px 0 rgba(0,0,0,.4); }
.br-banner .nm { font-family: 'Luckiest Guy'; font-weight: 400; font-size: 132px; line-height: 1; letter-spacing: .03em; }
.br-banner .tx { font-size: 50px; line-height: 1.1; color: #ffe9a8; }
.br-end { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.br-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.55), rgba(10,6,8,.86)); }
.br-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.br-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.br-end .tag { position: relative; font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: 60px; margin-top: 26px; color: #f3e6d3; }
.br-end .url { position: relative; margin-top: 56px; padding: 18px 46px 20px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-size: 92px; letter-spacing: .01em; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.br-end .offer { position: relative; margin-top: 36px; font-size: 56px; color: #ffd23f; }
`;
const easeOutBack = (u) => { const c = 1.9; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

export function makeHud(o) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const e = document.createElement('div'); e.className = 'br ' + cls; e.innerHTML = html; ui.insertBefore(e, ui.firstChild); return e; };
  // 051 (opt-in): without `alive` the battle-royale boxes (ALIVE counter, minimap) are not built — e.g. only the Scribe end card
  const BR = !!o.alive;
  const alive = BR ? el('br-alive', '<div class="lab">ALIVE</div><div class="num">100</div><div class="day">DAY 1 · 9:00 AM</div>') : null;
  const num = BR ? alive.querySelector('.num') : null, day = BR ? alive.querySelector('.day') : null;
  const map = BR ? el('br-map', '<canvas width="420" height="420"></canvas>') : null, mc = BR ? map.querySelector('canvas') : null, mg = BR ? mc.getContext('2d') : null;
  const feed = (o.feed || []).map((f) => ({ ...f, e: el('br-feed', `<b>${f.name}</b> <i>${f.by ? 'eliminated by' : 'eliminated himself'}</i>${f.by ? ' <em>' + f.by + '</em>' : ''}`) }));
  const banner = o.banner ? el('br-banner', `<div class="box"><div class="nm">${o.banner.name}</div><div class="tx">${o.banner.text}</div></div>`) : null;
  const end = o.end ? el('br-end', `<div class="bg"></div><img src="${o.end.icon}"><div class="wm">Scribe</div><div class="tag">${o.end.tag}</div><div class="url">${o.end.url}</div><div class="offer">${o.end.offer}</div>`) : null;
  // the end card sits ABOVE the captions/callouts (appended last); the rest below them
  if (end) ui.appendChild(end);
  const keys = (list, t) => { if (t <= list[0][0]) return list[0][1]; for (let i = 0; i < list.length - 1; i++) { const [a, va] = list[i], [b, vb] = list[i + 1]; if (t < b) return typeof va === 'number' ? va + (vb - va) * ss((t - a) / Math.max(1e-3, b - a)) : va; } return list[list.length - 1][1]; };
  // minimap: the island shape, place names, dots for the players still in
  const M = o.map, S = 420, sc = S / 140;
  const toMap = (x, z) => [S / 2 + x * sc, S / 2 + (z + 4) * sc];
  let mapKey = '';
  function drawMap(t) {
    const dots = M.dots ? M.dots(t) : [], key = dots.map((d) => d.join(',')).join(';');
    if (key === mapKey) return; mapKey = key;
    mg.fillStyle = '#2e8fb8'; mg.fillRect(0, 0, S, S);
    for (const [k, col] of [[1.06, '#5fb7d6'], [1.0, '#f0d9a0'], [0.9, '#6cc24a']]) { mg.fillStyle = col; mg.beginPath(); for (let i = 0; i <= 120; i++) { const th = (i / 120) * Math.PI * 2, r = M.shoreR(th) * k, [x, y] = toMap(1.15 * r * Math.cos(th), r * Math.sin(th)); i ? mg.lineTo(x, y) : mg.moveTo(x, y); } mg.fill(); }
    mg.font = '700 22px Fredoka'; mg.textAlign = 'center';
    for (const [x, z, label] of M.spots) { const [px, py] = toMap(x, z); mg.fillStyle = 'rgba(0,0,0,.55)'; const w = mg.measureText(label).width + 14; mg.fillRect(px - w / 2, py - 30, w, 28); mg.fillStyle = '#fff'; mg.fillText(label, px, py - 9); mg.fillStyle = '#ffd23f'; mg.beginPath(); mg.arc(px, py + 6, 6, 0, 7); mg.fill(); }
    for (const [x, z] of dots) { const [px, py] = toMap(x, z); mg.fillStyle = '#e2302f'; mg.strokeStyle = '#fff'; mg.lineWidth = 3; mg.beginPath(); mg.arc(px, py, 9, 0, 7); mg.fill(); mg.stroke(); }
  }
  let lastN = null, lastDay = null;
  function update(t) {
    const [s0, s1] = o.show || [0, 0], vis = t >= s0 && t < s1, a = ss((t - s0) / 0.25) * (1 - ss((t - (s1 - 0.3)) / 0.3));
    if (BR) {
      for (const e of [alive, map]) { e.style.opacity = vis ? a : 0; e.style.transform = `translateY(${(1 - ss((t - s0) / 0.3)) * -30}px)`; }
      const n = Math.round(keys(o.alive, t)); if (n !== lastN) { num.textContent = String(n); lastN = n; }
      const d = keys(o.day, t); if (d !== lastDay) { day.textContent = d; lastDay = d; }
      if (vis) drawMap(t);
    }
    // kill feed: newest on top, up to 3 rows, each lives ~2.4 s
    const live = feed.filter((f) => t >= f.t && t < f.t + (f.life ?? 2.4) && t < s1).sort((x, y) => y.t - x.t);
    for (const f of feed) {
      const i = live.indexOf(f);
      if (i < 0 || i > 2) { f.e.style.opacity = 0; continue; }
      const age = t - f.t, life = f.life ?? 2.4, op = ss(age / 0.12) * (1 - ss((age - (life - 0.35)) / 0.35));
      f.e.style.opacity = op; f.e.style.top = `${400 + i * 62}px`; f.e.style.transform = `translateX(${(1 - ss(age / 0.18)) * 60}px)`;
    }
    if (banner) { const b = o.banner, age = t - b.t; banner.style.opacity = age < 0 || t > (b.t1 ?? 1e9) ? 0 : ss(age / 0.1) * (1 - ss((t - ((b.t1 ?? 1e9) - 0.3)) / 0.3)); banner.style.transform = `scale(${age < 0 ? 1.6 : 1.6 - 0.6 * easeOutBack(age / 0.22)}) rotate(-3deg)`; }
    if (end) { const age = t - o.end.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, alive, map, feed, banner, end };
}
