// Motion-graphics stage (engine/mg, docs/STYLES.md → mg): a Kurzgesagt-like flat vector explainer drawn with Canvas 2D.
// A 1080×1920 2-D canvas sits over the idle WebGL canvas (studio.render becomes a no-op) and under #ui, so the DOM text layer
// (title, HUD, subtitles: engine/mg/overlay.js) stays crisp on top. World units = frame px at zoom 1; y runs DOWN.
//
//   const M = await createMG(studio, { bg: '#0b1736' });
//   update(t): M.render(t, SHOTS)  — SHOTS = [{ t0, id, tr: {kind, dur, x, y}, draw(g, t, s) }] sorted by t0; a shot runs until the
//              next one starts. tr.kind: 'cut' | 'fade' | 'zoom' (zoom THROUGH a point into the next shot) | 'zoomout' | 'slide'
//              (push, dir ±1) | 'iris' (circle reveal from x, y) | 'wipe' (a coloured band sweeps across). Transitions draw both
//              shots into buffers and composite them, so every shot is a pure function of t.
//   inside draw(g, t, s): M.view(g, cam, depth, () => {...}) = parallax: a layer at depth d moves 1/d as much as the focal plane
//              (d = 1); cam = {x, y, z, r} (the world point at the frame centre, zoom, roll). M.sky / M.stars / M.vignette / M.grain
//              dress the frame; M.mark(g, x, y, r, name) registers a face (or anything readable) for the text-band QC.
import { clamp, lerp, E, hash, rng } from './ease.js';

export const FW = 1080, FH = 1920;
const FONTS = [
  ['Fredoka', 500, 'fredoka/files/fredoka-latin-500-normal.woff2'], ['Fredoka', 600, 'fredoka/files/fredoka-latin-600-normal.woff2'],
  ['Fredoka', 700, 'fredoka/files/fredoka-latin-700-normal.woff2'], ['Inter', 600, 'inter/files/inter-latin-600-normal.woff2'],
  ['Inter', 700, 'inter/files/inter-latin-700-normal.woff2'], ['Inter', 800, 'inter/files/inter-latin-800-normal.woff2'],
  ['Inter', 900, 'inter/files/inter-latin-900-normal.woff2'],
];
export async function loadMGFonts() {
  for (const [fam, w, url] of FONTS) {
    const have = [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && String(f.weight) === String(w) && f.status === 'loaded');
    if (have) continue;
    try { const f = new FontFace(fam, `url(/node_modules/@fontsource/${url}) format('woff2')`, { weight: String(w) }); await f.load(); document.fonts.add(f); } catch (e) { console.warn('mg font', fam, w, e); }
  }
  await document.fonts.ready;
}

/** the house palette (deep-blue backdrop + a few saturated accents). Use these, not ad-hoc colours, so every reel matches. */
export const PAL = {
  night: '#0b1736', navy: '#13265a', deep: '#1b3a7a', blue: '#2f6fd6', sky: '#5aa9f0', ice: '#bfe6ff', white: '#f5f9ff',
  teal: '#22c3b4', green: '#38c172', leaf: '#2a9d5c', yellow: '#ffd23f', gold: '#ffb627', orange: '#ff8a3d', red: '#ff4f5e',
  pink: '#ff6fa5', purple: '#8b5cf6', violet: '#5b3fd1', sand: '#f6cf8a', dune: '#e6ad62', sea: '#1e74c6', foam: '#e6f6ff',
  ink: '#0e1630', paper: '#fffaf0', grey: '#8a96b8',
  skins: ['#f6c9a0', '#e9b083', '#c98b5e', '#a8693f', '#7d4a2a', '#f2d1b5'],
  shirts: ['#ff4f5e', '#ffd23f', '#22c3b4', '#8b5cf6', '#ff8a3d', '#2f6fd6', '#ff6fa5', '#38c172', '#f5f9ff'],
};

export async function createMG(studio, o = {}) {
  await loadMGFonts();
  const gl = document.getElementById('gl');
  const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; cv.id = 'mg';
  Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: FW + 'px', height: FH + 'px' });
  gl.after(cv);
  if (studio) { studio.render = () => {}; studio.renderer.setClearColor(0x000000, 1); }   // the 3-D pipeline idles
  const g = cv.getContext('2d');
  const mkBuf = () => { const c = document.createElement('canvas'); c.width = FW; c.height = FH; return c; };
  const bufA = mkBuf(), bufB = mkBuf(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');

  // static film grain (seeded) + vignette, rendered once
  const grain = mkBuf(); { const gg = grain.getContext('2d'), R = rng(77), im = gg.createImageData(FW, FH), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (R() - 0.5) * 120; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gg.putImageData(im, 0, 0); }
  const vig = mkBuf(); { const vg = vig.getContext('2d'), r = vg.createRadialGradient(FW / 2, FH * 0.46, FH * 0.22, FW / 2, FH / 2, FH * 0.72);
    r.addColorStop(0, 'rgba(4,8,24,0)'); r.addColorStop(1, 'rgba(4,8,24,1)'); vg.fillStyle = r; vg.fillRect(0, 0, FW, FH); }

  const M = { cv, g, FW, FH, bg: o.bg ?? PAL.night, t: 0, faces: [], grainK: o.grain ?? 0.055, vigK: o.vignette ?? 0.32, hits: [] };

  /** a camera shake from hits [[t, px, dur], …] (impacts: the clap) → {x, y, r} */
  M.shake = (t) => {
    let x = 0, y = 0, r = 0;
    for (const [t0, amp, dur = 0.5] of M.hits) { const a = t - t0; if (a < 0 || a > dur) continue; const e = amp * (1 - a / dur) ** 2;
      x += e * (hash(Math.floor(a * 60) + t0 * 13) - 0.5) * 2; y += e * (hash(Math.floor(a * 60) + t0 * 31 + 7) - 0.5) * 2; r += e * 0.0012 * (hash(Math.floor(a * 60) + 91) - 0.5); }
    return { x, y, r };
  };
  /** parallax view: fn() draws in world coords of a layer at depth d (1 = focal plane, 3 = far, 0.6 = foreground) */
  M.view = (gg, cam = {}, d = 1, fn) => {
    const cx = cam.x ?? 0, cy = cam.y ?? 0, z = cam.z ?? 1, sh = M._sh || { x: 0, y: 0, r: 0 };
    const zl = 1 + (z - 1) / d;
    gg.save(); gg.translate(FW / 2 + sh.x / d, FH / 2 + sh.y / d); gg.rotate((cam.r ?? 0) + sh.r); gg.scale(zl, zl); gg.translate(-cx / d, -cy / d);
    try { fn(gg); } finally { gg.restore(); }
  };
  /** vertical gradient over the whole frame (screen space). stops = ['#top', '#mid', '#bottom'] or [[0,'#..'],[1,'#..']] */
  M.sky = (gg, stops, y0 = 0, y1 = FH) => {
    const gr = gg.createLinearGradient(0, y0, 0, y1);
    stops.forEach((s, i) => (Array.isArray(s) ? gr.addColorStop(s[0], s[1]) : gr.addColorStop(i / (stops.length - 1), s)));
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.fillStyle = gr; gg.fillRect(0, 0, FW, FH); gg.restore();
  };
  /** soft round stars (seeded), very gentle twinkle; call inside a M.view layer for parallax or in screen space */
  M.stars = (gg, t, { n = 140, seed = 3, w = FW * 1.6, h = FH * 1.4, x0 = -FW * 0.8, y0 = -FH * 0.7, size = 2.6, a = 0.85 } = {}) => {
    const R = rng(seed); gg.save();
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * w, y = y0 + R() * h, s = (0.35 + R() ** 3 * 1.4) * size, ph = R() * 9, tw = 0.75 + 0.25 * Math.sin(t * (0.6 + R()) + ph);
      gg.globalAlpha = a * tw * (0.4 + 0.6 * R()); gg.fillStyle = R() < 0.15 ? '#ffe9b8' : '#e8f1ff';
      gg.beginPath(); gg.arc(x, y, s, 0, Math.PI * 2); gg.fill();
    }
    gg.restore();
  };
  M.vignette = (gg, k = M.vigK) => { if (k <= 0) return; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.drawImage(vig, 0, 0); gg.restore(); };
  M.grain = (gg, k = M.grainK) => { if (k <= 0) return; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.globalCompositeOperation = 'overlay'; gg.drawImage(grain, 0, 0); gg.restore(); };
  /** full-frame flash (the clap) */
  M.flash = (gg, k, color = '#ffffff') => { if (k <= 0) return; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = clamp(k); gg.fillStyle = color; gg.fillRect(0, 0, FW, FH); gg.restore(); };
  /** register something readable (a face, a sign) this frame, in the CURRENT transform of gg (for M.qc) */
  /** the same with SCREEN coordinates (people.js draw() returns head: [x, y, r] in screen px) */
  M.markS = (x, y, r, name = 'face') => M.faces.push({ name, x, y, r });
  M.mark = (gg, x, y, r, name = 'face') => { const m = gg.getTransform(), s = Math.hypot(m.a, m.b); M.faces.push({ name, x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, r: r * s }); };

  function drawShot(gg, s, t) {
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = 1; gg.globalCompositeOperation = 'source-over';
    gg.fillStyle = s.bg ?? M.bg; gg.fillRect(0, 0, FW, FH);
    s.draw(gg, t, s);
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = 1;
  }
  /** the shot director (see top). Returns the current shot. */
  M.render = (t, shots) => {
    M.t = t; M.faces = []; M._sh = M.shake(t);
    let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k].t0) i = k;
    const s = shots[i], tr = s.tr || { kind: 'cut' }, dur = tr.dur ?? 0.45, u = (t - s.t0) / dur;
    if (i === 0 || tr.kind === 'cut' || u >= 1) { drawShot(g, s, t); }
    else {
      const p = shots[i - 1];
      const facesB = (drawShot(gB, s, t), M.faces); M.faces = [];
      drawShot(gA, p, t); M.faces = facesB;   // QC sees the incoming shot
      composite(tr, u);
    }
    M.vignette(g); M.grain(g);
    return s;
  };
  function composite(tr, u) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    const k = E.io3(u), x = tr.x ?? FW / 2, y = tr.y ?? FH / 2;
    if (tr.kind === 'fade') { g.drawImage(bufA, 0, 0); g.globalAlpha = k; g.drawImage(bufB, 0, 0); }
    else if (tr.kind === 'zoom' || tr.kind === 'zoomout') {   // zoom THROUGH (x, y) into B (revealed in a growing circle), or back out of it
      const inw = tr.kind === 'zoom', ka = inw ? lerp(1, tr.scale ?? 3.4, E.in2(u)) : lerp(1, 0.4, E.io3(u)), kb = inw ? lerp(0.55, 1, E.out3(u)) : lerp(2.2, 1, E.out3(u));
      g.save(); g.translate(x, y); g.scale(ka, ka); g.translate(-x, -y); g.drawImage(bufA, 0, 0); g.restore();
      const R = Math.hypot(Math.max(x, FW - x), Math.max(y, FH - y)) * E.io3(Math.min(1, u * 1.15));
      g.save(); g.beginPath(); g.arc(x, y, Math.max(1, R), 0, Math.PI * 2); g.clip(); g.translate(x, y); g.scale(kb, kb); g.translate(-x, -y); g.drawImage(bufB, 0, 0); g.restore();
    } else if (tr.kind === 'slide') {
      const d = tr.dir ?? 1; g.drawImage(bufA, -d * FW * k * 0.35, 0); g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 40; g.drawImage(bufB, d * FW * (1 - k), 0); g.restore();
    } else if (tr.kind === 'iris') {
      g.drawImage(bufA, 0, 0); const R = Math.hypot(Math.max(x, FW - x), Math.max(y, FH - y)) * E.io3(u);
      g.save(); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.clip(); g.drawImage(bufB, 0, 0); g.restore();
      g.save(); g.strokeStyle = tr.color ?? '#ffd23f'; g.lineWidth = 18 * (1 - u); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.restore();
    } else if (tr.kind === 'wipe') {   // a coloured diagonal band sweeps; B is revealed behind it
      const X = lerp(-500, FW + 900, E.io3(u)), sl = 520;
      g.drawImage(bufA, 0, 0);
      g.save(); g.beginPath(); g.moveTo(-10, -10); g.lineTo(X - 160, -10); g.lineTo(X - 160 - sl, FH + 10); g.lineTo(-10, FH + 10); g.closePath(); g.clip(); g.drawImage(bufB, 0, 0); g.restore();
      g.save(); g.fillStyle = tr.color ?? '#ffd23f'; g.beginPath(); g.moveTo(X - 160, -10); g.lineTo(X, -10); g.lineTo(X - sl, FH + 10); g.lineTo(X - 160 - sl, FH + 10); g.closePath(); g.fill(); g.restore();
    } else g.drawImage(bufB, 0, 0);
  }

  /** QC (render.mjs --qc): readable marks under the subtitle band while a subtitle shows, or under the HUD while it shows */
  M.qc = (update, story, { step = 0.1, sub = [1270, 1430], hud = [0, 430, 600, 690] } = {}) => {
    const out = [];
    const subAt = (t) => (story.subs || []).find(([a, b]) => t >= a && t < b);
    const hudOn = (t) => (story.hud || []).length && t > (story.title ? story.title.out : 0) && t < (story.finalFade ? story.finalFade[0] : story.duration);
    for (let t = 0; t < story.duration; t += step) {
      update(t); const s = subAt(t), h = hudOn(t);
      for (const f of M.faces) {
        if (s && f.x > 90 && f.x < 990 && f.y + f.r * 0.7 > sub[0] && f.y - f.r * 0.7 < sub[1]) out.push(`${t.toFixed(1)} s: ${f.name} under the subtitle "${s[2]}" (y ${Math.round(f.y)})`);
        if (h && f.x - f.r * 0.7 < hud[2] && f.y + f.r * 0.7 > hud[1] && f.y - f.r * 0.7 < hud[3]) out.push(`${t.toFixed(1)} s: ${f.name} under the HUD (x ${Math.round(f.x)}, y ${Math.round(f.y)})`);
      }
    }
    return out;
  };
  return M;
}
