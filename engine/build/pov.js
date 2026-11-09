// 056 (Scribe dupe of @whatifpov): the "What if… POV" text layer (docs/reference/whatifpov.md), adapted to the house rules —
// a serif question title (alone, centered), a left HUD (caps label / big serif value / a tracked-caps fact line / a BPM + ECG
// line) kept top-left and steady, one italic serif subtitle per beat, the ⏪ rewind icon, and the product end card.
// DOM in #ui (captured crisp like every caption). Nothing pulses: each block fades in once and out once; the value only rolls.
//   const pov = createPov({ title: {html, t0, t1}, rewind: [[t0, t1]], hud: {show: [t0, t1], label: [[t, 'TEXT']],
//     value: (t) => 'Day 12', facts: [[t, 'TEXT', warn?]], bpm: (t) => 72}, subs: [{t0, t1, text}], end: {t, icon, tag, url, offer} })
//   pov.update(t)   (call it at the end of shots.js update(); it is pure in t)
// story.json "mode": "pov" (script.json "mode", passed through by tools/narrate.py) makes engine/main.js skip its own overlay.
import { clamp } from '../core.js';

const CSS = `
.pv { position: absolute; pointer-events: none; color: #f6f2ea; }
.pv-title { left: 90px; right: 90px; top: 41%; transform: translateY(-50%); text-align: center; font-family: 'Newsreader'; font-weight: 400;
  font-size: 86px; line-height: 1.1; letter-spacing: -0.005em; opacity: 0;
  text-shadow: 0 3px 6px rgba(0,0,0,.8), 0 0 18px rgba(0,0,0,.6), 0 0 44px rgba(0,0,0,.45); }
.pv-title::before, .pv-sub::before, .pv-hud::before { content: ''; position: absolute; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,.28) 55%, rgba(0,0,0,0)); }
.pv-title::before { left: -70px; right: -70px; top: -80px; bottom: -80px; }
.pv-hud { left: 62px; top: 452px; font-family: 'Inter'; opacity: 0; text-shadow: 0 2px 4px rgba(0,0,0,.85), 0 0 14px rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.4); }
.pv-hud::before { left: -80px; top: -60px; width: 640px; height: 290px; }
.pv-hud .lab { font-weight: 600; font-size: 24px; letter-spacing: .17em; color: rgba(255,255,255,.94); white-space: nowrap; }
.pv-hud .val { font-family: 'Newsreader'; font-weight: 400; font-size: 82px; line-height: 1.0; margin: 4px 0 8px -3px; white-space: nowrap; }
.pv-hud .fact { position: relative; height: 32px; }
.pv-hud .fact div { position: absolute; left: 0; top: 0; white-space: nowrap; font-weight: 600; font-size: 24px; letter-spacing: .13em; color: rgba(255,255,255,.86); opacity: 0; }
.pv-hud .fact div.warn { color: #f3b562; }
.pv-hud .vit { margin-top: 8px; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 22px; letter-spacing: .12em; color: rgba(255,255,255,.8); }
.pv-hud .vit i { width: 13px; height: 13px; border-radius: 50%; background: #e5484d; box-shadow: 0 0 8px rgba(229,72,77,.7); }
.pv-hud .vit canvas { width: 150px; height: 30px; }
.pv-sub { left: 140px; right: 140px; top: 1268px; text-align: center; font-family: 'Newsreader'; font-style: italic; font-weight: 400; font-size: 58px; line-height: 1.16;
  opacity: 0; text-shadow: 0 3px 6px rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.65), 0 0 36px rgba(0,0,0,.45); }
.pv-sub::before { left: -50px; right: -50px; top: -46px; bottom: -46px; }
.pv-rw { left: 92px; top: 214px; opacity: 0; filter: drop-shadow(0 2px 5px rgba(0,0,0,.7)); }
.pv-end { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.pv-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(26,16,14,.6), rgba(12,8,8,.9)); }
.pv-end img { width: 300px; height: 300px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.pv-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-size: 180px; letter-spacing: -2px; line-height: 1; margin-top: 4px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.pv-end .tag { position: relative; font-family: 'Newsreader'; font-style: italic; font-size: 62px; margin-top: 26px; color: #f3e6d3; }
.pv-end .url { position: relative; margin-top: 52px; padding: 16px 44px 18px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px;
  font-family: 'Inter'; font-weight: 600; font-size: 74px; letter-spacing: .01em; color: #fffdf6; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.pv-end .offer { position: relative; margin-top: 34px; font-family: 'Inter'; font-weight: 600; font-size: 44px; letter-spacing: .04em; color: #f3c46b; }
`;
const ss = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const win = (t, a, b, fin = 0.18, fout = 0.22) => (t < a || t > b ? 0 : ss((t - a) / fin) * (1 - ss((t - (b - fout)) / fout)));

export function createPov(o) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const e = document.createElement('div'); e.className = 'pv ' + cls; e.innerHTML = html; ui.appendChild(e); return e; };
  const title = o.title ? el('pv-title', o.title.html) : null;
  const H = o.hud;
  const hud = el('pv-hud', `<div class="lab"></div><div class="val"></div><div class="fact"></div><div class="vit"><i></i><span></span><canvas width="300" height="60"></canvas></div>`);
  const lab = hud.querySelector('.lab'), val = hud.querySelector('.val'), factBox = hud.querySelector('.fact'), bpmEl = hud.querySelector('.vit span');
  { // a static ECG squiggle (decoration; it never animates)
    const g = hud.querySelector('canvas').getContext('2d'); g.strokeStyle = '#e5484d'; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath();
    const pts = [[0, 34], [40, 34], [52, 30], [62, 34], [80, 34], [90, 8], [100, 54], [110, 34], [140, 34], [152, 28], [164, 34], [200, 34], [212, 12], [222, 50], [232, 34], [300, 34]];
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  }
  const facts = (H.facts || []).map(([t, text, warn], i, a) => { const d = document.createElement('div'); d.textContent = text; if (warn) d.className = 'warn'; factBox.appendChild(d); return { t, t1: a[i + 1] ? a[i + 1][0] : 1e9, d }; });
  const subs = (o.subs || []).map((s) => ({ ...s, e: el('pv-sub', s.text) }));
  const rw = el('pv-rw', `<svg width="96" height="64" viewBox="0 0 96 64"><path d="M46 4 L4 32 L46 60 Z M92 4 L50 32 L92 60 Z" fill="#fff"/></svg>`);
  const end = o.end ? el('pv-end', `<div class="bg"></div><img src="${o.end.icon}"><div class="wm">Scribe</div><div class="tag">${o.end.tag}</div><div class="url">${o.end.url}</div>${o.end.offer ? `<div class="offer">${o.end.offer}</div>` : ''}`) : null;
  const keyed = (list, t) => { let v = list[0][1]; for (const [a, x] of list) if (t >= a) v = x; return v; };
  let lastLab = null, lastVal = null, lastBpm = null;

  function update(t) {
    if (title) title.style.opacity = win(t, o.title.t0, o.title.t1, 0.12, 0.35);
    const [h0, h1] = H.show;
    hud.style.opacity = t < h0 || t > h1 ? 0 : ss((t - h0) / 0.2) * (1 - ss((t - (h1 - 0.3)) / 0.3));
    const L = keyed(H.label, t); if (L !== lastLab) { lab.textContent = L; lastLab = L; }
    const v = H.value(t); if (v !== lastVal) { val.textContent = v; lastVal = v; }
    const b = H.bpm ? Math.round(H.bpm(t)) + ' BPM' : ''; if (b !== lastBpm) { bpmEl.textContent = b; lastBpm = b; }
    for (const f of facts) f.d.style.opacity = t < f.t || t > f.t1 ? 0 : ss((t - f.t) / 0.16) * (1 - ss((t - (f.t1 - 0.12)) / 0.12));
    for (const s of subs) s.e.style.opacity = win(t, s.t0, s.t1, 0.14, 0.2);
    let r = 0; for (const [a, z] of o.rewind || []) r = Math.max(r, win(t, a, z, 0.06, 0.12)); rw.style.opacity = r;
    if (end) { const age = t - o.end.t; end.style.opacity = age < 0 ? 0 : ss(age / 0.45); end.querySelector('img').style.transform = `scale(${age < 0 ? 0.6 : 0.6 + 0.4 * easeOutBack(age / 0.5)})`; }
  }
  return { update, hud, subs, end };
}
