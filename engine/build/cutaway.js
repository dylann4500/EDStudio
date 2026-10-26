// Cutaway diorama kit (docs/BUILD.md): the ground sliced open toward the camera — the signature shot of @wemakebuild's
// bridge reel. The cut face is the z = 0 plane (camera on +z). Holes (a shaft being dug, a tunnel, a cavern) are painted into
// an alpha mask at runtime, so digging / caving in / widening is just a different list of shapes each frame.
//   const cut = makeCutFace({ x0, x1, y0, y1, paint: (g, P) => { ...draw strata with P.x(), P.y(), P.s() } });
//   cut.setHoles([{ rect: [x0, y0, x1, y1], rough: 0.05 }, { poly: [[x, y], ...] }, { circle: [x, y, r] }]);
// A darker copy of the strata sits `depth` m behind (the back wall seen through holes); makeRim() adds side walls.
import * as THREE from 'three';
import { lerp } from '../core.js';

const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), ux), lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy) * 2 - 1;
}
/** Rough outline: subdivide a closed polygon and push each point along its normal by stable world-space noise. */
function roughen(pts, rough, step = 0.07) {
  if (!rough) return pts;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / step));
    const nx = (by - ay) / (L || 1), ny = -(bx - ax) / (L || 1);
    for (let k = 0; k < n; k++) {
      const f = k / n, x = lerp(ax, bx, f), y = lerp(ay, by, f);
      const d = (vnoise2(x * 3.1, y * 3.1) * 0.7 + vnoise2(x * 9.7, y * 9.7) * 0.3) * rough;
      out.push([x + nx * d, y + ny * d]);
    }
  }
  return out;
}
export const rectPts = ([x0, y0, x1, y1]) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** A plane (local x right, y up, centered) whose holes come from a canvas alpha mask. */
export function maskedPlane(w, h, material, mppm = 40) {
  const c = document.createElement('canvas'); c.width = Math.round(w * mppm); c.height = Math.round(h * mppm);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  const maskTex = new THREE.CanvasTexture(c);
  material.alphaMap = maskTex; material.alphaTest = 0.5; material.needsUpdate = true;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.receiveShadow = true; mesh.castShadow = true;
  let key = '';
  const px = (x) => (x + w / 2) * mppm, py = (y) => (h / 2 - y) * mppm;
  function setHoles(shapes, toLocal = (x, y) => [x, y]) {
    const k = JSON.stringify(shapes, (_, v) => (typeof v === 'number' ? Math.round(v * 200) / 200 : v));
    if (k === key) return; key = k;
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
    for (const s of shapes) {
      g.beginPath();
      if (s.circle) { const [x, y] = toLocal(s.circle[0], s.circle[1]); g.arc(px(x), py(y), s.circle[2] * mppm, 0, Math.PI * 2); }
      else {
        const pts = roughen(s.poly || rectPts(s.rect), s.rough ?? 0).map(([x, y]) => toLocal(x, y));
        pts.forEach(([x, y], i) => (i ? g.lineTo(px(x), py(y)) : g.moveTo(px(x), py(y))));
        g.closePath();
      }
      g.fill();
    }
    maskTex.needsUpdate = true;
  }
  return { mesh, setHoles, canvas: c };
}

/** Fine soil grain for bump maps (tiles; set repeat ≈ meters). */
export function grainTexture(seed = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = hash2(i, seed) * 256, y = hash2(seed, i * 1.7) * 256, r = 0.6 + hash2(i * 3.3, seed * 2) * 2.4, v = Math.round(60 + hash2(i, i + seed) * 140);
    g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/**
 * The cut face: x0..x1 × y0..y1 at z = 0. paint(g, P) draws the strata (P.x(wx), P.y(wy) → canvas px, P.s(m) → px, P.W/P.H).
 * Returns { group, face, back, setHoles, P, canvas }.
 */
export function makeCutFace({ x0, x1, y0, y1, ppm = 96, mppm = 40, depth = 2.2, backShade = 0.5, paint }) {
  const W = x1 - x0, H = y1 - y0;
  const cv = document.createElement('canvas'); cv.width = Math.round(W * ppm); cv.height = Math.round(H * ppm);
  const g = cv.getContext('2d');
  const P = { x: (wx) => (wx - x0) * ppm, y: (wy) => (y1 - wy) * ppm, s: (m) => m * ppm, W: cv.width, H: cv.height, ppm };
  paint(g, P);
  const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const grain = grainTexture(3); grain.repeat.set(W * 1.5, H * 1.5);
  const faceM = new THREE.MeshStandardMaterial({ map, roughness: 0.97, bumpMap: grain, bumpScale: 1.4 });
  const face = maskedPlane(W, H, faceM, mppm);
  const group = new THREE.Group();
  face.mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); group.add(face.mesh);
  // the back wall: the same strata, darker (it is in the hole's shade)
  const bc = document.createElement('canvas'); bc.width = cv.width; bc.height = cv.height; const bg = bc.getContext('2d');
  bg.drawImage(cv, 0, 0); bg.fillStyle = `rgba(20,12,6,${backShade})`; bg.fillRect(0, 0, bc.width, bc.height);
  const bmap = new THREE.CanvasTexture(bc); bmap.colorSpace = THREE.SRGBColorSpace;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: bmap, roughness: 1, bumpMap: grain, bumpScale: 1.2 }));
  back.position.set((x0 + x1) / 2, (y0 + y1) / 2, -depth); back.receiveShadow = true; group.add(back);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { group, face: face.mesh, back, P, canvas: cv, setHoles: (shapes) => face.setHoles(shapes, (x, y) => [x - cx, y - cy]) };
}

/** Side walls of a rectangular hole (left, right, floor, ceiling), depth m deep into the cut. set([x0,y0,x1,y1], {l,r,b,t}). */
export function makeRim(parent, depth = 2.2, color = 0x7a5436) {
  const grain = grainTexture(7);
  const walls = ['l', 'r', 'b', 't'].map((k) => {
    const tx = grain.clone(); tx.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color, roughness: 1, bumpMap: tx, bumpScale: 1.5 }));
    m.receiveShadow = true; parent.add(m); return { k, m, tx };
  });
  return {
    set([x0, y0, x1, y1], show = { l: 1, r: 1, b: 1, t: 0 }) {
      for (const { k, m, tx } of walls) {
        m.visible = !!show[k] && x1 > x0 + 0.01 && y1 > y0 + 0.01; if (!m.visible) continue;
        if (k === 'l' || k === 'r') { m.position.set(k === 'l' ? x0 : x1, (y0 + y1) / 2, -depth / 2); m.rotation.set(0, k === 'l' ? Math.PI / 2 : -Math.PI / 2, 0); m.scale.set(depth, y1 - y0, 1); tx.repeat.set(depth, y1 - y0); }
        else { m.position.set((x0 + x1) / 2, k === 'b' ? y0 : y1, -depth / 2); m.rotation.set(k === 'b' ? -Math.PI / 2 : Math.PI / 2, 0, 0); m.scale.set(x1 - x0, depth, 1); tx.repeat.set(x1 - x0, depth); }
      }
    },
  };
}

/** Mown-lawn stripes (the reference world's look). Repeat in meters / stripe width. */
export function lawnTexture(a = '#7fc65a', b = '#6db44c') {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = a; g.fillRect(0, 0, 32, 64); g.fillStyle = b; g.fillRect(32, 0, 32, 64);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${hash2(i, 1) > 0.5 ? '255,255,255' : '0,40,0'},.06)`; g.fillRect(hash2(i, 2) * 64, hash2(i, 3) * 64, 1, 3); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; return t;
}

/** Sky dome: soft blue gradient + painted puffy clouds (MeshBasic, not fogged). */
export function makeSky(parent, r = 300) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, c.height);
  gr.addColorStop(0, '#5aa8e8'); gr.addColorStop(0.42, '#8ec8f2'); gr.addColorStop(0.5, '#d6ecf8'); gr.addColorStop(1, '#d6ecf8');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 26; i++) {
    const cx = hash2(i, 5) * c.width, cy = 120 + hash2(i, 6) * 330, s = 40 + hash2(i, 7) * 70;
    for (let k = 0; k < 9; k++) {
      const x = cx + (hash2(i, k) - 0.5) * s * 4, y = cy + (hash2(k, i) - 0.5) * s * 0.9, rr = s * (0.6 + hash2(i + k, 9) * 0.7);
      const cg = g.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(0.7, 'rgba(255,255,255,.7)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }));
  parent.add(sky); return sky;
}
