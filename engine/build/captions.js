// Build-genre text overlay (docs/BUILD.md): ONE spoken word at a time dead center + callouts, like @wemakebuild.
// Driven by story.json from tools/narrate.py: words [{w,t0,t1}], callouts [{text, style, t0, t1, pos?}].
// Styles: term (yellow caps, the engineering word), label (orange caps, a number/fact), money (green), stamp (red, tilted,
// slams in), sfx (small yellow comic word at pos [x,y] in frame fractions). Pops are part of this genre's look (the house
// "no popping text" rule is exempt here) — but each element pops ONCE on entry and never pulses after.

const CSS = `
@font-face { font-family: 'Fredoka'; font-weight: 600; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2) format('woff2'); }
@font-face { font-family: 'Fredoka'; font-weight: 700; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2) format('woff2'); }
@font-face { font-family: 'Luckiest Guy'; font-weight: 400; src: url(/node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2) format('woff2'); }
.bw { position: absolute; left: 0; right: 0; top: 1000px; text-align: center; transform-origin: 50% 50%;
  font-family: 'Fredoka'; font-weight: 700; font-size: 80px; line-height: 1; color: #fff; white-space: nowrap;
  -webkit-text-stroke: 11px #161616; paint-order: stroke fill; text-shadow: 0 7px 0 rgba(0,0,0,.38), 0 0 26px rgba(0,0,0,.25); }
.bc { position: absolute; left: 0; right: 0; text-align: center; white-space: nowrap; transform-origin: 50% 50%; opacity: 0;
  font-family: 'Luckiest Guy'; font-weight: 400; line-height: 1; letter-spacing: .02em; paint-order: stroke fill; }
.bc.term  { top: 600px; font-size: 92px; color: #ffd43b; -webkit-text-stroke: 13px #2b1a05; text-shadow: 0 8px 0 rgba(0,0,0,.4); }
.bc.label { top: 470px; font-size: 74px; color: #ffad2e; -webkit-text-stroke: 11px #2b1405; text-shadow: 0 7px 0 rgba(0,0,0,.4); }
.bc.money { top: 520px; font-size: 84px; color: #74e35a; -webkit-text-stroke: 12px #0d2a0a; text-shadow: 0 8px 0 rgba(0,0,0,.4); }
.bc.stamp { top: 560px; font-size: 100px; color: #ff3b30; -webkit-text-stroke: 13px #2a0606; text-shadow: 0 8px 0 rgba(0,0,0,.45); }
.bc.sfx   { font-size: 66px; color: #ffe14d; -webkit-text-stroke: 10px #2b1a05; text-shadow: 0 6px 0 rgba(0,0,0,.4); left: auto; right: auto; }
`;

export const BUILD_FONTS = ['700 80px Fredoka', '600 40px Fredoka', '400 92px "Luckiest Guy"'];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOutBack = (u) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

export function createBuildOverlay(story) {
  const ui = document.getElementById('ui');
  for (const id of ['title', 'hud', 'sub', 'end']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  const word = document.createElement('div'); word.className = 'bw'; ui.appendChild(word);
  const callouts = (story.callouts || []).map((c) => {
    const el = document.createElement('div'); el.className = 'bc ' + c.style; el.textContent = c.text; ui.appendChild(el);
    if (c.style === 'sfx') { const [x, y] = c.pos || [0.5, 0.4]; el.style.left = `${x * 1080}px`; el.style.top = `${y * 1920}px`; el.style.transform = 'translate(-50%,-50%)'; }
    return { c, el, fit: 1 };
  });
  const words = story.words || [];
  let wi = 0, shown = null, fitted = false;

  function measureText(o) { // width of the text itself (block is full-width)
    const r = document.createRange(); r.selectNodeContents(o.el); return r.getBoundingClientRect().width;
  }

  function update(t) {
    if (!fitted && document.fonts.status === 'loaded') { for (const o of callouts) { o.el.style.opacity = 1; o.el.style.transform = "none"; o.fit = Math.min(1, 960 / Math.max(1, measureText(o))); o.el.style.opacity = 0; } fitted = true; }
    // the spoken word
    while (wi > 0 && words[wi] && t < words[wi].t0) wi--;
    while (wi < words.length - 1 && t >= words[wi + 1].t0) wi++;
    const w = words[wi];
    if (w && t >= w.t0 && t < w.t1) {
      if (shown !== wi) { word.textContent = w.w; shown = wi; }
      const u = clamp((t - w.t0) / 0.075);
      word.style.opacity = 1; word.style.transform = `translateY(-50%) scale(${0.86 + 0.14 * easeOutBack(u)})`;
    } else word.style.opacity = 0;
    // callouts: pop in once, hold steady, quick fade out
    for (const o of callouts) {
      const { c, el } = o;
      if (t < c.t0 || t > c.t1) { el.style.opacity = 0; continue; }
      const a = t - c.t0, out = clamp((c.t1 - t) / 0.12);
      let s, rot = 0;
      if (c.style === 'stamp') { const u = clamp(a / 0.14); s = 2.1 - 1.1 * u * u + (u >= 1 ? 0.06 * Math.exp(-(a - 0.14) * 30) * Math.sin((a - 0.14) * 60) : 0); rot = -8; }
      else if (c.style === 'sfx') { s = easeOutBack(clamp(a / 0.16)); rot = -7; }
      else s = easeOutBack(clamp(a / 0.2));
      el.style.opacity = out * clamp(a / 0.05);
      const base = c.style === 'sfx' ? 'translate(-50%,-50%) ' : 'translateY(-50%) ';
      el.style.transform = `${base}rotate(${rot}deg) scale(${Math.max(0.01, s * o.fit)})`;
    }
  }
  return { update };
}
