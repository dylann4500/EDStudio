// The motion-graphics text layer (DOM, crisp): the whatif overlay (core.js createOverlay: title, HUD, subtitles) restyled for the
// look (rounded Fredoka numbers, Inter caps labels) + KINETIC title and subtitles: each word rises in once (staggered), the line
// fades out once — no pulsing, no popping (CLAUDE.md text rules). Scoped by body.mg so no other reel changes.
//   const T = mgOverlay(story);  update(t): T.update(t)   (core.js keeps driving the HUD; #title/#sub are hidden and redrawn here)
//   story.subs = [[t0, t1, 'text'], …]; '*word*' = highlighted (yellow) in titles and subtitles.
const CSS = `
@font-face { font-family: 'Fredoka'; font-weight: 500; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-500-normal.woff2) format('woff2'); }
@font-face { font-family: 'Fredoka'; font-weight: 600; src: url(/node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 700; src: url(/node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url(/node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2) format('woff2'); }
body.mg #title, body.mg #sub, body.mg #end { display: none !important; }
body.mg .hud { left: 66px; top: 462px; }
body.mg .hud .label { font-family: 'Inter'; font-weight: 800; font-size: 19px; letter-spacing: .16em; color: rgba(255,255,255,.92); }
body.mg .hud .num { font-family: 'Fredoka'; font-weight: 600; font-size: 74px; line-height: 1.0; margin: 4px 0 6px -2px; letter-spacing: .01em; }
body.mg .hud .small { font-family: 'Inter'; font-weight: 700; font-size: 16px; letter-spacing: .15em; color: rgba(255,255,255,.85); }
body.mg .hud::before { left: -80px; top: -60px; width: 600px; height: 250px; background: radial-gradient(closest-side, rgba(6,12,36,.55), rgba(6,12,36,.3) 55%, rgba(6,12,36,0)); }
.mgt, .mgs { position: absolute; left: 70px; right: 70px; text-align: center; color: #fff; z-index: 1; pointer-events: none;
  text-shadow: 0 3px 6px rgba(4,10,30,.85), 0 0 18px rgba(4,10,30,.6), 0 0 36px rgba(4,10,30,.4); }
.mgt { top: 50%; transform: translateY(-50%); font-family: 'Fredoka'; font-weight: 600; font-size: 86px; line-height: 1.12; letter-spacing: .005em; }
.mgs { top: 1310px; font-family: 'Fredoka'; font-weight: 500; font-size: 50px; line-height: 1.22; }
.mgt::before, .mgs::before { content: ''; position: absolute; z-index: -1; pointer-events: none; background: radial-gradient(closest-side, rgba(6,12,36,.55), rgba(6,12,36,.3) 55%, rgba(6,12,36,0)); }
.mgt::before { left: -70px; right: -70px; top: -90px; bottom: -90px; }
.mgs::before { left: -50px; right: -50px; top: -50px; bottom: -50px; }
.mgt span, .mgs span { display: inline-block; white-space: pre; will-change: transform, opacity; }
.mgt .hi, .mgs .hi { color: #ffd23f; }
`;
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const out3 = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;

function wordsHTML(el, text) {
  el.innerHTML = '';
  const parts = String(text).replace(/<em>(.*?)<\/em>/g, (m, a) => a.split(' ').map((w) => `*${w}*`).join(' ')).split(' ');
  return parts.map((w, i) => { const s = document.createElement('span'); const hi = /^\*.*\*[.,!?…]*$/.test(w); s.textContent = w.replace(/\*/g, '') + (i < parts.length - 1 ? ' ' : ''); if (hi) s.className = 'hi'; el.appendChild(s); return s; });
}

export function mgOverlay(story, o = {}) {
  document.body.classList.add('mg');
  if (!document.getElementById('mg-css')) { const st = document.createElement('style'); st.id = 'mg-css'; st.textContent = CSS + (o.css ?? ''); document.head.appendChild(st); }
  const ui = document.getElementById('ui');
  const tEl = document.createElement('div'); tEl.className = 'mgt'; ui.appendChild(tEl);
  const sEl = document.createElement('div'); sEl.className = 'mgs'; ui.appendChild(sEl);
  const title = story.title ? wordsHTML(tEl, story.title.html ?? story.title.text) : [];
  let cur = null, spans = [];
  const st = o.stagger ?? 0.06;
  function update(t) {
    // title: words rise in one by one after title.in, the block fades out once before title.out
    if (story.title) {
      const a = story.title.in ?? 0, b = story.title.out ?? 3, fo = 1 - sm((t - (b - 0.35)) / 0.35);
      tEl.style.opacity = fo;
      title.forEach((s, i) => { const u = out3((t - a - i * (o.titleStagger ?? 0.07)) / 0.45); s.style.opacity = u; s.style.transform = `translateY(${(1 - u) * 34}px)`; });
    }
    const after = story.title ? sm((t - story.title.out) / 0.35) : 1;
    const s = (story.subs || []).find(([a, b]) => t >= a && t < b);
    if (!s) { sEl.style.opacity = 0; return; }
    if (cur !== s) { cur = s; spans = wordsHTML(sEl, s[2]); }
    sEl.style.opacity = after * (1 - sm((t - (s[1] - 0.22)) / 0.22));
    spans.forEach((sp, i) => { const u = out3((t - s[0] - i * st) / 0.32); sp.style.opacity = u; sp.style.transform = `translateY(${(1 - u) * 22}px)`; });
  }
  return { update, tEl, sEl };
}
