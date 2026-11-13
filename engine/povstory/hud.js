// POV story text layer (086, docs/POVSTORY.md) — DOM in #ui, captured crisp like every caption. Decoded from the reference
// reel (docs/genres/pov-story.md): no narrator box, no question card; the dialogue IS the caption.
//   • captions: one short phrase at a time (tools/narrate.py "phrases": 1–4 words split at punctuation), centred at ~67 % of
//     the frame, in the SPEAKER's colour (story.cast[who].color) with a heavy dark stroke — the colour is how you tell five
//     voices apart with the sound off;
//   • stamp: a day/time line + a place line, top-left, for the first seconds only (the reel's only "HUD");
//   • banners: iOS-style notification cards that slide down from the top (a text, an app finishing) — the in-story plug slot;
//   • choice: the cliffhanger end card — "WHAT WOULD YOU DO?", two answer pills, "Comment for Part 2" — over a dimmed frame.
// Nothing pulses: each element fades/slides in once and out once.
//   const hud = createPovStoryHud(story, { stamp: {t0, t1, day, place}, banners: [{t0, t1, icon, app, title, text, time}],
//                                          choice: {t, q, a: {text, color, icon}, b: {…}, foot}, capTop: 1290 })
//   hud.update(t)      (end of shots.js update(); pure in t)
//   hud.hideCaptions(t0, t1) / hud.captionTop(px) …   (optional per-shot tweaks)
import { clamp } from '../core.js';

const CSS = `
@font-face { font-family: 'Fredoka'; font-weight: 600; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2) format('woff2'); }
@font-face { font-family: 'Fredoka'; font-weight: 700; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2) format('woff2'); }
@font-face { font-family: 'Luckiest Guy'; font-weight: 400; src: url(/node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2) format('woff2'); }
.ps { position: absolute; pointer-events: none; }
.ps-cap { left: 40px; right: 40px; text-align: center; font-family: 'Fredoka'; font-weight: 700; font-size: 78px; line-height: 1.06;
  -webkit-text-stroke: 12px #111017; paint-order: stroke fill; letter-spacing: .005em;
  text-shadow: 0 6px 0 rgba(0,0,0,.42), 0 0 26px rgba(0,0,0,.5); opacity: 0; transform: translateY(-50%); }
.ps-stamp { left: 58px; top: 418px; opacity: 0; font-family: 'Fredoka'; font-weight: 700; white-space: nowrap;
  -webkit-text-stroke: 9px #111017; paint-order: stroke fill; text-shadow: 0 5px 0 rgba(0,0,0,.4), 0 0 18px rgba(0,0,0,.45); }
.ps-stamp .d { font-size: 62px; color: #fff; letter-spacing: .01em; }
.ps-stamp .p { font-size: 38px; color: #ffd84a; margin-top: 2px; -webkit-text-stroke: 7px #111017; }
.ps-ban { left: 46px; right: 46px; top: 236px; opacity: 0; border-radius: 34px; background: rgba(250,248,244,.97);
  box-shadow: 0 14px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.06); padding: 24px 30px 26px; display: flex; gap: 22px; align-items: flex-start; }
.ps-ban .ic { width: 84px; height: 84px; border-radius: 20px; flex: none; background: #2b2b33 center/cover no-repeat; display: flex;
  align-items: center; justify-content: center; font-family: 'Fredoka'; font-weight: 700; font-size: 44px; color: #fff; }
.ps-ban .bx { flex: 1; min-width: 0; font-family: 'Fredoka'; }
.ps-ban .hd { display: flex; justify-content: space-between; font-weight: 600; font-size: 28px; color: #6b6a72; letter-spacing: .02em; }
.ps-ban .hd b { color: #2a2930; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.ps-ban .tt { font-weight: 700; font-size: 40px; color: #16151b; margin-top: 4px; line-height: 1.12; }
.ps-ban .tx { font-weight: 600; font-size: 36px; color: #2d2c33; margin-top: 4px; line-height: 1.18; }
.ps-ban .tx em { font-style: normal; color: #1f9d55; }
.ps-ch { left: 0; right: 0; top: 0; bottom: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ps-ch .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 48%, rgba(8,10,22,.5), rgba(4,5,12,.82)); }
.ps-ch .q { position: relative; font-family: 'Luckiest Guy'; font-size: 124px; line-height: 1.0; color: #fff; text-align: center;
  -webkit-text-stroke: 14px #111017; paint-order: stroke fill; text-shadow: 0 9px 0 rgba(0,0,0,.45); letter-spacing: .01em; }
.ps-ch .opt { position: relative; margin-top: 46px; min-width: 760px; padding: 26px 46px 22px; border-radius: 30px; display: flex; align-items: center; justify-content: center; gap: 22px;
  font-family: 'Luckiest Guy'; font-size: 66px; color: #fff; letter-spacing: .02em; -webkit-text-stroke: 8px rgba(0,0,0,.55); paint-order: stroke fill;
  box-shadow: 0 10px 0 rgba(0,0,0,.4), inset 0 -8px 0 rgba(0,0,0,.18); }
.ps-ch .opt svg { width: 70px; height: 70px; flex: none; }
.ps-ch .or { position: relative; margin-top: 30px; font-family: 'Luckiest Guy'; font-size: 58px; color: #ffd84a; -webkit-text-stroke: 8px #111017; paint-order: stroke fill; }
.ps-ch .ft { position: relative; margin-top: 54px; font-family: 'Fredoka'; font-weight: 700; font-size: 48px; color: #fff; text-align: center;
  -webkit-text-stroke: 8px #111017; paint-order: stroke fill; }
.ps-ch .ft span { color: #ffd84a; }
.ps-ch .ft .ar { display: block; font-size: 64px; color: #ffd84a; margin-top: 2px; }
`;

const ICONS = {   // simple white glyphs (no emoji: headless Chrome may lack a colour-emoji font)
  flashlight: '<svg viewBox="0 0 64 64"><path d="M14 22h22l10-8h8v36h-8l-10-8H14z" fill="#fff" stroke="#111" stroke-width="4" stroke-linejoin="round"/><path d="M56 20l6-4M57 32h6M56 44l6 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
  run: '<svg viewBox="0 0 64 64"><circle cx="40" cy="10" r="7" fill="#fff" stroke="#111" stroke-width="3"/><path d="M36 20l-10 14 12 8-4 16M26 34l-12 4M36 20l12 10 10-2M38 42l14 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  door: '<svg viewBox="0 0 64 64"><rect x="14" y="6" width="36" height="52" rx="3" fill="#fff" stroke="#111" stroke-width="4"/><circle cx="41" cy="33" r="4" fill="#111"/></svg>',
  lock: '<svg viewBox="0 0 64 64"><path d="M20 28v-8a12 12 0 0124 0v8" fill="none" stroke="#fff" stroke-width="7"/><rect x="12" y="28" width="40" height="30" rx="5" fill="#fff" stroke="#111" stroke-width="4"/></svg>',
  stairs: '<svg viewBox="0 0 64 64"><path d="M6 56h14V44h12V32h12V20h14V8" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>',
};

export function createPovStoryHud(story, o = {}) {
  const ui = document.getElementById('ui');
  for (const id of ['title', 'hud', 'sub', 'end']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const d = document.createElement('div'); d.className = 'ps ' + cls; d.innerHTML = html; ui.appendChild(d); return d; };
  const cast = story.cast || {}, phrases = story.phrases || [];
  const capTop = o.capTop ?? 1290;
  const cap = el('ps-cap'); cap.style.top = capTop + 'px';

  // stamp
  const S = o.stamp, stamp = S ? el('ps-stamp', `<div class="d">${S.day}</div><div class="p">${S.place}</div>`) : null;
  // banners
  const bans = (o.banners || []).map((b) => {
    const ic = b.icon ? `<div class="ic" style="background-image:url(${b.icon})"></div>` : `<div class="ic" style="background:${b.iconBg || '#4b8dff'}">${b.iconText || ''}</div>`;
    const d = el('ps-ban', `${ic}<div class="bx"><div class="hd"><b>${b.app}</b><span>${b.time || 'now'}</span></div>${b.title ? `<div class="tt">${b.title}</div>` : ''}<div class="tx">${b.text}</div></div>`);
    return { b, d };
  });
  // choice card
  const C = o.choice;
  let ch = null;
  if (C) {
    const opt = (x) => `<div class="opt" style="background:${x.color}">${ICONS[x.icon] || ''}<span>${x.text}</span></div>`;
    ch = el('ps-ch', `<div class="bg"></div><div class="q">${C.q || 'WHAT WOULD<br>YOU DO?'}</div>${opt(C.a)}<div class="or">OR</div>${opt(C.b)}<div class="ft">${C.foot || 'Comment for <span>Part 2</span>'}<span class="ar">&#8595;</span></div>`);
  }
  const hidden = [];   // [t0, t1] windows with no captions (a phone close-up whose screen text must read)
  let pi = 0, shown = -1;
  function update(t) {
    // captions: the phrase whose window holds t (pi walks both ways so stills at any t work)
    while (pi > 0 && t < phrases[pi].t0) pi--;
    while (pi < phrases.length - 1 && t >= phrases[pi + 1].t0) pi++;
    const P = phrases[pi], hid = hidden.some(([a, b]) => t >= a && t < b), endCut = C && t >= C.t - 0.15;
    if (P && t >= P.t0 && t < P.t1 && !hid && !endCut) {
      if (shown !== pi) { cap.textContent = P.text; cap.style.color = (cast[P.who] || {}).color || '#fff'; shown = pi; }
      cap.style.opacity = clamp((t - P.t0) / 0.06);
    } else cap.style.opacity = 0;
    if (stamp) stamp.style.opacity = clamp((t - S.t0) / 0.25) * clamp((S.t1 - t) / 0.35);
    for (const { b, d } of bans) {
      const u = clamp((t - b.t0) / 0.32), v = clamp((b.t1 - t) / 0.3), k = Math.min(u, v);
      d.style.opacity = t >= b.t0 && t < b.t1 ? k : 0;
      d.style.transform = `translateY(${(1 - (1 - (1 - u) ** 3)) * -120}px)`;
    }
    if (ch) {
      const k = clamp((t - C.t) / 0.4);
      ch.style.opacity = k;
      const kids = ch.children;
      for (let i = 1; i < kids.length; i++) { const u = clamp((t - C.t - 0.12 * i) / 0.3); kids[i].style.opacity = u; kids[i].style.transform = `translateY(${(1 - u) * 26}px)`; }
    }
  }
  return { update, hideCaptions: (a, b) => hidden.push([a, b]), cap };
}
