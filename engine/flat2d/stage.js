// flat2d stage: a 1080×1920 Canvas 2D layered over the (idle) WebGL canvas, under #ui (captions stay DOM-crisp on top).
// World units are pixels at zoom 1 (the frame is 1080 wide); a 2D camera {x, y, z (zoom), r (roll)} looks at world (x, y).
// The WebGL studio is switched off (studio.render becomes a no-op), so a frame costs only the 2D drawing + the screenshot.
//
//   const S = await createStage(studio, { bg: '#f6e7c8', boil: 8, wob: 1.6 });
//   update(t): S.begin(t, { x, y, z, r }, shakeHits) → draw the world with S.I (ink) in world coords → S.screen() → HUD-like
//   drawing in frame px (counter boards, flashes) → S.end()
//   S.toScreen(x, y) = frame px of a world point (for QC + DOM labels); S.faces = [] heads registered this frame (puppet.js)
import { makeInk } from './ink.js';

export const FW = 1080, FH = 1920;
const FONTS = [
  ['Luckiest Guy', 400, '/node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2'],
  ['Fredoka', 600, '/node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2'],
  ['Fredoka', 700, '/node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2'],
];
export async function loadFlatFonts() {
  for (const [fam, w, url] of FONTS) {
    const have = [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && String(f.weight) === String(w) && f.status === 'loaded');
    if (have) continue;
    try { const f = new FontFace(fam, `url(${url}) format('woff2')`, { weight: String(w) }); await f.load(); document.fonts.add(f); } catch (e) { console.warn('flat2d font', fam, e); }
  }
  await document.fonts.ready;
}

const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const vn = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (h1(i) + (h1(i + 1) - h1(i)) * u) * 2 - 1; };

/** Screen shake from hits [[t0, amp px, dur s], …] → {x, y, r} (cartoon kicks: big, fast, gone in ~0.4 s) */
export function shake2d(t, hits = []) {
  let x = 0, y = 0, r = 0;
  for (const [t0, amp, dur = 0.45] of hits) {
    const a = t - t0; if (a < 0 || a > dur) continue;
    const e = amp * (1 - a / dur) ** 2;
    x += e * vn(a * 34 + t0 * 7); y += e * vn(a * 31 + t0 * 13 + 50); r += e * 0.0016 * vn(a * 25 + t0 * 3 + 90);
  }
  return { x, y, r };
}

export async function createStage(studio, o = {}) {
  await loadFlatFonts();
  const gl = document.getElementById('gl');
  const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; cv.id = 'flat2d';
  Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: FW + 'px', height: FH + 'px' });
  gl.after(cv);
  if (studio) { studio.render = () => {}; studio.renderer.setClearColor(0x000000, 1); }   // the 3D pipeline idles: nothing to light or bloom
  const ctx = cv.getContext('2d');
  const I = makeInk(ctx, { boil: o.boil ?? 8, wob: o.wob ?? 1.6 });
  const S = { cv, ctx, I, cam: { x: 0, y: 0, z: 1, r: 0 }, faces: [], bg: o.bg ?? '#f3e6cc', t: 0 };
  let M = null;
  /** start a frame: clear, set the camera (+ shake) */
  S.begin = (t, cam = {}, hits) => {
    S.t = t; I.frame(t); S.faces = [];
    const sh = shake2d(t, hits);
    S.cam = { x: cam.x ?? 0, y: cam.y ?? 0, z: cam.z ?? 1, r: (cam.r ?? 0) + sh.r };
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = cam.bg ?? S.bg; ctx.fillRect(0, 0, FW, FH);
    ctx.translate(FW / 2 + sh.x, FH / 2 + sh.y); ctx.rotate(S.cam.r); ctx.scale(S.cam.z, S.cam.z); ctx.translate(-S.cam.x, -S.cam.y);
    M = ctx.getTransform();
  };
  /** switch to frame-pixel space (HUD boards, flashes, the end card) */
  S.screen = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); };
  S.world = () => { if (M) ctx.setTransform(M); };
  S.toScreen = (x, y) => (M ? [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f] : [x, y]);
  S.end = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; };
  /** a full-frame flash (white pop on a camera flash / a cut to a new day) */
  S.flash = (k, color = '#fff') => { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, k); ctx.fillStyle = color; ctx.fillRect(0, 0, FW, FH); ctx.restore(); };
  /** animate characters "on twos" (15 drawings a second at 30 fps) while the camera moves on ones */
  S.twos = (t, fps = 15) => Math.floor(t * fps + 1e-6) / fps;
  /** register a face this frame (frame px) for the caption QC: S.face(puppet.headAt(pose), name) */
  S.face = (h, name = '') => { const [x, y] = S.toScreen(h.x, h.y); S.faces.push({ name, x, y, r: h.r * S.cam.z }); };
  /** QC (render.mjs --qc): every face that sits under the one-word caption (y 960–1040) while a word shows */
  S.qcCaptions = (update, story, step = 0.1) => {
    const out = [], words = story.words || [];
    for (let t = 0; t < story.duration; t += step) {
      const w = words.find((q) => t >= q.t0 && t < q.t1); if (!w) continue;
      update(t);
      for (const f of S.faces) if (f.x > 120 && f.x < 960 && f.y + f.r * 0.6 > 950 && f.y - f.r * 0.6 < 1050) out.push(`${t.toFixed(1)} s: ${f.name || 'a face'} under the caption "${w.w}" (y ${Math.round(f.y)})`);
    }
    return out;
  };
  return S;
}

/**
 * Shot list → camera. shots = [{ t0, set: 'garage', cam: {x,y,z,r} | keyframed {x:[[t,v],…], …} }] sorted by t0; a shot runs until
 * the next starts (hard cut). K = core.js K (eased keyframes). Returns { shot, cam, i }.
 */
export function shotAt(t, shots, K) {
  let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k].t0) i = k;
  const s = shots[i], c = {};
  for (const key of ['x', 'y', 'z', 'r']) { const v = s.cam[key]; c[key] = Array.isArray(v) ? K(t, v) : (v ?? (key === 'z' ? 1 : 0)); }
  return { shot: s, cam: c, i };
}
