// sim style (docs/STYLES.md → sim): slightly desaturated real-world materials painted on canvases (deterministic, no downloads).
// Every texture is cached by its arguments, so a set can ask for `simMat('carpet')` a hundred times for free.
//   simMat(kind, { color, repeat:[u,v], rough, side }) → MeshStandardMaterial
//   kinds: paint (drywall), carpet, wood (plank floor), lumber (pine joists/rafters), siding, shingle, grass, soil (the cut
//   ground slab), concrete, insulation (pink batts), brick, tile, fabric, plastic, metal, steel, chrome, glass, rubber, white
import * as THREE from 'three';
import { rng } from '../core.js';

const TEX = new Map();
const hex = (c) => '#' + new THREE.Color(c).getHexString();
const shade = (c, k) => { const o = new THREE.Color(c); o.multiplyScalar(k); return '#' + o.getHexString(); };
const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();

function tex(key, w, h, draw, { srgb = true } = {}) {
  if (TEX.has(key)) return TEX.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  TEX.set(key, t); return t;
}
/** speckle noise: n dots of random shade around the base */
function speckle(g, w, h, base, n, amp, seed, size = [1, 2.4]) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const k = 1 + (R() - 0.5) * 2 * amp; g.fillStyle = shade(base, k);
    const s = size[0] + R() * (size[1] - size[0]); g.globalAlpha = 0.35 + R() * 0.5; g.fillRect(R() * w, R() * h, s, s);
  }
  g.globalAlpha = 1;
}

export const TEXTURES = {
  paint: (c = 0xdfe3e2) => tex('paint' + c, 256, 256, (g, w, h) => { g.fillStyle = hex(c); g.fillRect(0, 0, w, h); speckle(g, w, h, c, 2600, 0.035, 11); }),
  carpet: (c = 0x8d8f91) => tex('carpet' + c, 512, 512, (g, w, h) => {
    g.fillStyle = hex(c); g.fillRect(0, 0, w, h); speckle(g, w, h, c, 26000, 0.22, 7, [1, 2.2]);
    const R = rng(3); for (let i = 0; i < 90; i++) { g.fillStyle = shade(c, 0.9 + R() * 0.2); g.globalAlpha = 0.18; g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 40, 12 + R() * 30, R() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }),
  wood: (c = 0xa8794e) => tex('wood' + c, 512, 512, (g, w, h) => {   // plank floor: 8 planks across, staggered ends
    const R = rng(5), pw = w / 6;
    for (let i = 0; i < 6; i++) {
      let y = -R() * 200;
      while (y < h) {
        const L = 180 + R() * 220, k = 0.84 + R() * 0.3; g.fillStyle = shade(c, k); g.fillRect(i * pw, y, pw, L);
        for (let j = 0; j < 14; j++) { g.strokeStyle = shade(c, k * (0.82 + R() * 0.12)); g.globalAlpha = 0.35; g.lineWidth = 0.8 + R() * 1.4; const x = i * pw + R() * pw; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + (R() - 0.5) * 8, y + L * 0.3, x + (R() - 0.5) * 8, y + L * 0.7, x + (R() - 0.5) * 6, y + L); g.stroke(); }
        g.globalAlpha = 1; g.fillStyle = shade(c, 0.55); g.fillRect(i * pw, y, pw, 2); y += L;
      }
      g.fillStyle = shade(c, 0.5); g.fillRect(i * pw, 0, 2, h);
    }
  }),
  lumber: (c = 0xc9a477) => tex('lumber' + c, 256, 256, (g, w, h) => {
    g.fillStyle = hex(c); g.fillRect(0, 0, w, h); const R = rng(9);
    for (let j = 0; j < 40; j++) { g.strokeStyle = shade(c, 0.78 + R() * 0.15); g.globalAlpha = 0.4; g.lineWidth = 0.6 + R() * 1.6; const y = R() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (R() - 0.5) * 10, w * 0.7, y + (R() - 0.5) * 10, w, y + (R() - 0.5) * 6); g.stroke(); }
    for (let j = 0; j < 3; j++) { g.fillStyle = shade(c, 0.6); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(R() * w, R() * h, 4 + R() * 4, 2 + R() * 3, 0, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }),
  siding: (c = 0xe9e7e1) => tex('siding' + c, 256, 256, (g, w, h) => {   // lap siding: 8 boards per tile, a shadow under each lap
    const n = 8, bh = h / n;
    for (let i = 0; i < n; i++) {
      const gr = g.createLinearGradient(0, i * bh, 0, (i + 1) * bh); gr.addColorStop(0, shade(c, 0.86)); gr.addColorStop(0.18, shade(c, 1.0)); gr.addColorStop(1, shade(c, 0.97));
      g.fillStyle = gr; g.fillRect(0, i * bh, w, bh); g.fillStyle = shade(c, 0.7); g.fillRect(0, i * bh, w, 1.5);
    }
    speckle(g, w, h, c, 1500, 0.04, 21);
  }),
  shingle: (c = 0x5d5f63) => tex('shingle' + c, 512, 512, (g, w, h) => {
    const R = rng(13), rows = 12, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = (r % 2) * 20 - 30;
      while (x < w) { const sw = 34 + R() * 26; g.fillStyle = shade(c, 0.8 + R() * 0.35); g.fillRect(x, r * rh, sw - 2, rh); x += sw; }
      g.fillStyle = shade(c, 0.45); g.fillRect(0, r * rh + rh - 3, w, 3);
    }
    speckle(g, w, h, c, 9000, 0.3, 17, [1, 2]);
  }),
  grass: (c = 0x6f9a4a) => tex('grass' + c, 512, 512, (g, w, h) => {
    g.fillStyle = hex(c); g.fillRect(0, 0, w, h); const R = rng(19);
    for (let i = 0; i < 160; i++) { g.fillStyle = shade(c, 0.86 + R() * 0.26); g.globalAlpha = 0.25; g.beginPath(); g.ellipse(R() * w, R() * h, 18 + R() * 50, 14 + R() * 40, R() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    for (let i = 0; i < 9000; i++) { const x = R() * w, y = R() * h; g.strokeStyle = shade(c, 0.7 + R() * 0.55); g.globalAlpha = 0.55; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 3, y - 3 - R() * 5); g.stroke(); }
    g.globalAlpha = 1;
  }),
  soil: () => tex('soil', 512, 1024, (g, w, h) => {   // the cut ground slab: topsoil → clay, vertical root fibres (the reference's look)
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3f2c1d'); gr.addColorStop(0.18, '#4e3624'); gr.addColorStop(0.55, '#5f4129'); gr.addColorStop(1, '#6a4a2e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(23);
    for (let i = 0; i < 2600; i++) { const x = R() * w, y = R() * h, L = 20 + R() * 120; g.strokeStyle = R() < 0.5 ? 'rgba(30,18,10,.35)' : 'rgba(140,100,64,.22)'; g.lineWidth = 0.8 + R() * 2.2; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + (R() - 0.5) * 14, y + L * 0.3, x + (R() - 0.5) * 14, y + L * 0.7, x + (R() - 0.5) * 10, y + L); g.stroke(); }
    for (let i = 0; i < 260; i++) { g.fillStyle = R() < 0.6 ? 'rgba(120,104,90,.55)' : 'rgba(40,28,20,.5)'; g.beginPath(); g.ellipse(R() * w, h * 0.2 + R() * h * 0.8, 2 + R() * 6, 2 + R() * 4, R() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(60,90,40,.55)'; g.fillRect(0, 0, w, 10);   // the root mat under the grass
  }),
  concrete: (c = 0xa9a7a2) => tex('concrete' + c, 512, 512, (g, w, h) => { g.fillStyle = hex(c); g.fillRect(0, 0, w, h); speckle(g, w, h, c, 30000, 0.1, 29, [1, 2]); const R = rng(31); for (let i = 0; i < 40; i++) { g.fillStyle = shade(c, 0.9 + R() * 0.15); g.globalAlpha = 0.2; g.beginPath(); g.ellipse(R() * w, R() * h, 30 + R() * 60, 20 + R() * 40, 0, 0, 7); g.fill(); } g.globalAlpha = 1; }),
  insulation: () => tex('insul', 256, 256, (g, w, h) => { g.fillStyle = '#e9a7ad'; g.fillRect(0, 0, w, h); const R = rng(37); for (let i = 0; i < 900; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,215,220,.5)' : 'rgba(190,120,128,.4)'; g.beginPath(); g.ellipse(R() * w, R() * h, 3 + R() * 9, 2 + R() * 6, R() * 3, 0, 7); g.fill(); } }),
  brick: (c = 0x9a5440) => tex('brick' + c, 512, 512, (g, w, h) => { g.fillStyle = '#cfc6b8'; g.fillRect(0, 0, w, h); const R = rng(41), bh = 32, bw = 96; for (let r = 0; r < h / bh; r++) for (let x = -((r % 2) * bw) / 2; x < w; x += bw) { g.fillStyle = shade(c, 0.8 + R() * 0.35); g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6); } speckle(g, w, h, c, 6000, 0.25, 43); }),
  tile: (c = 0xe8e4dc) => tex('tile' + c, 256, 256, (g, w, h) => { g.fillStyle = shade(c, 0.78); g.fillRect(0, 0, w, h); const R = rng(47), n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = shade(c, 0.95 + R() * 0.08); g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); } }),
  fabric: (c = 0x2f3d63) => tex('fabric' + c, 256, 256, (g, w, h) => { g.fillStyle = hex(c); g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = shade(c, y % 4 ? 1.04 : 0.95); g.fillRect(0, y, w, 1); } speckle(g, w, h, c, 3000, 0.12, 53); }),
};

const MAT = new Map();
/** A real-world material. color tints the painted texture where it has one (paint/carpet/wood/siding/shingle/...). */
export function simMat(kind, o = {}) {
  const key = kind + JSON.stringify(o);
  if (MAT.has(key)) return MAT.get(key);
  const P = { roughness: o.rough ?? 0.85, metalness: 0, side: o.side ?? THREE.FrontSide };
  let m;
  const withMap = (t, rep) => { const tt = t.clone(); tt.needsUpdate = true; tt.repeat.set(...(rep || [1, 1])); return tt; };
  switch (kind) {
    case 'metal': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0x9aa0a6, roughness: o.rough ?? 0.38, metalness: 0.75 }); break;
    case 'steel': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0xc9ccd0, roughness: o.rough ?? 0.3, metalness: 0.85 }); break;
    case 'chrome': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0xe9ecef, roughness: 0.12, metalness: 1 }); break;
    case 'plastic': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0xf2f2f0, roughness: o.rough ?? 0.42 }); break;
    case 'rubber': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0x26272a, roughness: 0.9 }); break;
    case 'glass': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0xcfe6f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: o.opacity ?? 0.22, depthWrite: false }); break;
    case 'white': m = new THREE.MeshStandardMaterial({ ...P, color: o.color ?? 0xf3f2ee, roughness: o.rough ?? 0.6 }); break;
    default: {
      const T = TEXTURES[kind]; if (!T) throw new Error('simMat: unknown kind ' + kind);
      const map = withMap(o.color != null ? T(o.color) : T(), o.repeat);
      const rough = { carpet: 1, grass: 1, soil: 1, insulation: 1, concrete: 0.92, shingle: 0.95, siding: 0.7, wood: 0.55, lumber: 0.8, paint: 0.88, tile: 0.35, brick: 0.95, fabric: 0.95 }[kind];
      m = new THREE.MeshStandardMaterial({ ...P, map, roughness: o.rough ?? rough });
    }
  }
  MAT.set(key, m); return m;
}

/** A box with its UVs scaled to world meters (so a texture of `tile` meters repeats evenly on every face). */
export function boxUV(w, h, d, tile = 1) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const [a, b] = nx > 0.5 ? [d, h] : ny > 0.5 ? [w, d] : [w, h];
    uv.setXY(i, (uv.getX(i) * a) / tile, (uv.getY(i) * b) / tile);
  }
  return g;
}
export { hex, shade, mix };
