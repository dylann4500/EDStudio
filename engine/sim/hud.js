// sim style text: the build captions (engine/build/captions.js, one spoken word at a time) restyled like @officialwriteit's
// sims reels (plain heavy white sans, thin black outline), a steady DAY counter top-centre, and the Scribe end card.
// Everything is DOM in #ui (captured crisp by render.mjs). Nothing pulses: the counter only changes its number, the end card
// fades in once. Scoped by `body.sim`, so other reels' captions are untouched.
//   const hud = makeSimHud({ show: [t0, t1], day: [[t, 1], [t, 2], …], end: { t, icon, url, tag, offer } }); hud.update(t)
const CSS = `
@font-face { font-family: 'Inter'; font-weight: 800; src: url(/node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 900; src: url(/node_modules/@fontsource/inter/files/inter-latin-900-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 700; src: url(/node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2) format('woff2'); }
body.sim .bw { font-family: 'Inter'; font-weight: 800; font-size: 74px; letter-spacing: -0.01em; -webkit-text-stroke: 9px #111;
  text-shadow: 0 5px 0 rgba(0,0,0,.35), 0 0 22px rgba(0,0,0,.35); top: 1010px; }
body.sim .bc { font-family: 'Inter'; font-weight: 900; letter-spacing: .02em; }
body.sim .bc.term, body.sim .bc.label { top: 330px; font-size: 64px; color: #fff; -webkit-text-stroke: 9px #111; text-shadow: 0 5px 0 rgba(0,0,0,.35), 0 0 24px rgba(0,0,0,.45); }
body.sim .bc.term { color: #ffe066; }
body.sim .bc.stamp { top: 560px; font-size: 92px; color: #ff3b30; -webkit-text-stroke: 12px #2a0606; }
body.sim .bc.sfx { font-size: 58px; color: #fff; -webkit-text-stroke: 9px #111; }
.sim-day { position: absolute; left: 0; right: 0; top: 196px; text-align: center; font-family: 'Inter'; font-weight: 900; font-size: 96px; line-height: 1;
  color: #fff; -webkit-text-stroke: 11px #111; paint-order: stroke fill; letter-spacing: .01em; text-shadow: 0 6px 0 rgba(0,0,0,.35), 0 0 26px rgba(0,0,0,.4); opacity: 0; }
.sim-end { position: absolute; inset: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #fff; font-family: 'Inter'; font-weight: 700; }
.sim-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.5), rgba(10,6,8,.84)); }
.sim-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.sim-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.sim-end .tag { position: relative; font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: 60px; margin-top: 26px; color: #f3e6d3; }
.sim-end .url { position: relative; margin-top: 56px; padding: 18px 46px 20px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-size: 92px; font-weight: 800; letter-spacing: .01em; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.sim-end .offer { position: relative; margin-top: 36px; font-size: 56px; font-weight: 800; color: #ffd23f; }
`;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const easeOutBack = (u) => { const c = 1.9; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const SIM_FONTS = ['800 74px Inter', '900 96px Inter', '700 40px Inter'];

export function makeSimHud(o = {}) {
  document.body.classList.add('sim');
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const ui = document.getElementById('ui');
  const day = document.createElement('div'); day.className = 'sim-day'; ui.insertBefore(day, ui.firstChild);
  let end = null;
  if (o.end) {
    end = document.createElement('div'); end.className = 'sim-end';
    end.innerHTML = `<div class="bg"></div><img src="${o.end.icon}"><div class="wm">Scribe</div><div class="tag">${o.end.tag}</div><div class="url">${o.end.url}</div><div class="offer">${o.end.offer}</div>`;
    ui.appendChild(end);
  }
  let last = null;
  function update(t) {
    const [s0, s1] = o.show || [0, 1e9], vis = t >= s0 && t < s1;
    day.style.opacity = vis ? ss((t - s0) / 0.2) * (1 - ss((t - (s1 - 0.25)) / 0.25)) : 0;
    if (o.day && o.day.length) { let n = o.day[0][1]; for (const [a, v] of o.day) if (t >= a) n = v; const txt = typeof n === 'number' ? `DAY ${n}` : n; if (txt !== last) { day.textContent = txt; last = txt; } }
    if (end) { const age = t - o.end.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, day, end };
}
