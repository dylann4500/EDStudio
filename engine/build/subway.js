// Subway cutaway set (build genre, video 015 "How a Hole Becomes a Subway"). A sunny city verge + street sliced open at
// z = 0: strata down to bedrock, the water table, and everything a subway needs, each piece with a handle the shots animate.
// Layout (meters): the cut face spans x -16..34, y -11..0. Tunnel axis along x at (y = T.y, z = T.z), cut off-center so the
// visible back part is wide enough for a train. Camera lives on +z. Reusable pieces: makeTBM, makeTrain, makeShovel,
// makeCroissant, makeBuilding, makeTree, ring/track builders.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, mk, rng } from '../core.js';
import { makeCutFace, makeRim, lawnTexture, makeSky, maskedPlane, grainTexture } from './cutaway.js';
import { makeCar } from '../sets/city.js';

export const D = {
  face: { x0: -16, x1: 34, y0: -24, y1: 0 }, depth: 3.6,
  layer: { grass: -0.12, topsoil: -1.3, clay: -3.6, wet: -8.8 },
  T: { y: -6.1, z: -0.6, R: 1.8, x0: -4.2, floor: -7.35, ring: 0.9 },     // tunnel
  hole: [-7.6, -5.8], launch: [-10.0, -4.2],                              // Gary's hole → the TBM launch shaft
  plug: [1.0, 5.0],                                                         // the block under the bakery that settles
  vents: [[8.0, 9.2], [13.0, 14.2]],
  station: { x0: 17, x1: 26, y0: -8.1, y1: -3.3, platY: -7.0 },
  esc: { bot: [24.0, 25.7], top: [30.6, 32.3] },
  verge: [0, -3.4], walk: [-3.4, -4.8], road: [-4.8, -10.2], farWalk: [-10.2, -11.6],
  lanes: [-6.2, -8.8],
};
const T = D.T;
export const tunnelHalf = Math.sqrt(T.R * T.R - T.z * T.z); // half-height of the tunnel band on the cut face
const ARC = Math.acos(T.z / T.R); // the tunnel is cut off-center: angles within ±ARC of straight-back lie behind z = 0

// ---------------------------------------------------------------- strata painting
const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
function paintStrata(g, P) {
  const wave = (x, k) => 0.09 * Math.sin(x * 1.1 + k) + 0.05 * Math.sin(x * 3.3 + 2 * k);
  const layers = [[0.2, '#5aa848'], [D.layer.grass, '#6a4329'], [D.layer.topsoil, '#ab6e40'], [D.layer.clay, '#a3825c'], [D.layer.wet, '#8a6d55']];
  const x0 = -16, x1 = 34;
  layers.forEach(([top, col], i) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(P.x(x0), P.y(top + (i ? wave(x0, i) : 0)));
    for (let x = x0; x <= x1; x += 0.25) g.lineTo(P.x(x), P.y(top + (i ? wave(x, i) : 0)));
    g.lineTo(P.x(x1), P.H); g.lineTo(P.x(x0), P.H); g.closePath(); g.fill();
  });
  const R = rng(15);
  // soft color blotches per layer
  const blot = (yTop, yBot, cols, n, rx, ry) => { for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = yBot + R() * (yTop - yBot); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(rx * (0.5 + R())), P.s(ry * (0.5 + R())), 0, 0, 7); g.fill(); } };
  // long flat lenses (sediment layering) — round blotches read as leopard print (v2/v3 look review)
  blot(-0.2, -1.25, ['rgba(40,24,12,.22)', 'rgba(110,72,44,.2)'], 260, 0.7, 0.06);
  blot(-1.4, -3.5, ['rgba(120,70,38,.2)', 'rgba(200,140,95,.16)', 'rgba(110,64,32,.18)'], 420, 1.0, 0.07);
  blot(-3.7, -8.7, ['rgba(130,104,72,.2)', 'rgba(200,172,130,.16)', 'rgba(112,90,66,.18)'], 520, 1.1, 0.07);
  blot(-8.9, -24, ['rgba(105,80,60,.26)', 'rgba(160,128,100,.2)'], 560, 1.3, 0.14);
  // fibrous vertical streaks (the reference's soil reads as combed earth, not blotches)
  for (let i = 0; i < 26000; i++) {
    const x = x0 + R() * 50, y = -0.15 - R() * 23.5, L = 0.025 + R() * 0.07, dark = R() < 0.55;
    g.strokeStyle = dark ? `rgba(55,32,18,${0.12 + R() * 0.18})` : `rgba(255,220,170,${0.06 + R() * 0.12})`;
    g.lineWidth = P.s(0.008 + R() * 0.012); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.lineTo(P.x(x + (R() - 0.5) * 0.03), P.y(y - L)); g.stroke();
  }
  // wet sand: blue tint + droplets + the water-table line
  const gr = g.createLinearGradient(0, P.y(D.layer.clay), 0, P.y(D.layer.wet)); gr.addColorStop(0, 'rgba(70,150,215,.22)'); gr.addColorStop(1, 'rgba(70,150,215,.04)');
  g.fillStyle = gr; g.fillRect(0, P.y(D.layer.clay - 0.1), P.W, P.y(D.layer.wet) - P.y(D.layer.clay - 0.1));
  for (let i = 0; i < 260; i++) { const x = x0 + R() * 50, y = D.layer.clay - 0.1 - R() * R() * 2.2; g.fillStyle = 'rgba(120,200,255,.4)'; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(0.025), P.s(0.035), 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(95,185,240,.9)'; g.lineWidth = P.s(0.05); g.beginPath();
  for (let x = x0; x <= x1; x += 0.2) { const y = D.layer.clay + wave(x, 3) + 0.03 * Math.sin(x * 8); x === x0 ? g.moveTo(P.x(x), P.y(y)) : g.lineTo(P.x(x), P.y(y)); }
  g.stroke();
  // pebbles + rocks
  const pebble = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(r), P.s(r * 0.7), R() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(P.x(x - r * 0.25), P.y(y + r * 0.2), P.s(r * 0.35), P.s(r * 0.2), 0, 0, 7); g.fill(); };
  for (let i = 0; i < 420; i++) { const y = -1.4 - R() * 9.4; pebble(x0 + R() * 50, y, 0.03 + R() * 0.07, y < D.layer.wet ? '#a59a8c' : ['#8c7a68', '#b2a184', '#6f665c'][i % 3]); }
  for (let i = 0; i < 120; i++) pebble(x0 + R() * 50, -9.0 - R() * 14.6, 0.2 + R() * 0.35, ['#a08c78', '#7d6a58'][i % 2]);
  g.strokeStyle = 'rgba(40,40,48,.5)'; g.lineWidth = P.s(0.025);
  for (let i = 0; i < 70; i++) { let x = x0 + R() * 50, y = -9 - R() * 14.5; g.beginPath(); g.moveTo(P.x(x), P.y(y)); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 0.6; y -= R() * 0.35; g.lineTo(P.x(x), P.y(y)); } g.stroke(); }
  // roots in the topsoil, worms
  g.strokeStyle = 'rgba(70,45,28,.85)'; g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { let x = x0 + R() * 50, y = -0.12; g.lineWidth = P.s(0.012 + R() * 0.02); g.beginPath(); g.moveTo(P.x(x), P.y(y)); for (let k = 0; k < 4; k++) { x += (R() - 0.5) * 0.25; y -= 0.1 + R() * 0.18; g.lineTo(P.x(x), P.y(y)); } g.stroke(); }
  g.strokeStyle = '#e48a8f'; g.lineWidth = P.s(0.03);
  for (let i = 0; i < 14; i++) { const x = x0 + R() * 50, y = -0.4 - R() * 2.6; g.beginPath(); for (let k = 0; k <= 10; k++) { const xx = x + k * 0.025, yy = y + Math.sin(k * 0.9) * 0.03; k ? g.lineTo(P.x(xx), P.y(yy)) : g.moveTo(P.x(xx), P.y(yy)); } g.stroke(); }
  // pipes (seen in section): a sewer, a water main, a cable bundle
  const pipe = (x, y, r, ring, inner) => { g.fillStyle = ring; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r), 0, 7); g.fill(); g.fillStyle = inner; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r * 0.78), 0, 7); g.fill(); };
  pipe(-12.5, -1.2, 0.22, '#3d7fc2', '#1c3550'); pipe(15.8, -0.9, 0.16, '#5b5b5b', '#e0b13a');
  pipe(-1.0, -1.0, 0.12, '#d9822b', '#4a2a10'); pipe(-0.75, -1.0, 0.12, '#d9822b', '#4a2a10');
  // a dinosaur fossil (the "Gary is now a fossil" neighbor) + a few bones, a boot, a coin
  g.save(); g.translate(P.x(-4.75), P.y(-2.5)); g.scale(-P.ppm / 100, P.ppm / 100); g.fillStyle = '#efe4c8'; g.strokeStyle = '#c9b88f'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-60, -10); g.quadraticCurveTo(-40, -45, 10, -40); g.quadraticCurveTo(60, -36, 70, -8); g.lineTo(52, 2); g.lineTo(40, -6); g.lineTo(30, 4); g.lineTo(18, -4); g.lineTo(6, 6); g.lineTo(-8, -2); g.lineTo(-20, 10); g.quadraticCurveTo(-50, 16, -60, -10); g.fill(); g.stroke();
  g.fillStyle = '#5e3d26'; g.beginPath(); g.ellipse(-28, -22, 10, 8, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(22, -24, 6, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#efe4c8'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-80 - i * 22, 6 + i * 5, 10, 6, 0.3, 0, 7); g.fill(); g.stroke(); }
  g.restore();
  const bone = (x, y, a) => { g.save(); g.translate(P.x(x), P.y(y)); g.rotate(a); g.fillStyle = '#efe4c8'; g.fillRect(-P.s(0.14), -P.s(0.025), P.s(0.28), P.s(0.05)); for (const s of [-1, 1]) for (const t of [-1, 1]) { g.beginPath(); g.arc(s * P.s(0.14), t * P.s(0.03), P.s(0.035), 0, 7); g.fill(); } g.restore(); };
  bone(6.8, -2.8, 0.4); bone(-13.5, -5.2, -0.7); bone(19.5, -9.6, 0.2);
  g.fillStyle = '#4a3428'; g.beginPath(); g.ellipse(P.x(11.9), P.y(-2.7), P.s(0.16), P.s(0.08), 0.2, 0, 7); g.fill(); g.fillRect(P.x(11.75), P.y(-2.45), P.s(0.08), P.s(0.22));
  g.fillStyle = '#e8c547'; g.beginPath(); g.arc(P.x(-10.2), P.y(-3.1), P.s(0.05), 0, 7); g.fill();
}

// ---------------------------------------------------------------- props
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

export function makeShovel() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.022, 0.022, 1.0, 10), mat(0xb98a55, 0.7), g, 0, 0.62, 0);
  mk(new THREE.BoxGeometry(0.14, 0.035, 0.035), mat(0x2a2a2a, 0.5), g, 0, 1.12, 0);
  const blade = mk(new RoundedBoxGeometry(0.24, 0.3, 0.03, 2, 0.012), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.6, roughness: 0.35 }), g, 0, 0.0, 0);
  blade.rotation.x = 0.15; mk(new THREE.CylinderGeometry(0.035, 0.025, 0.14, 10), mat(0x7d8790, 0.4), g, 0, 0.18, 0);
  return g; // blade tip at y ≈ -0.15; grip at y ≈ 1.12
}

export function makeCroissant() {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0xd99a4a, roughness: 0.55 });
  const b = mk(new THREE.TorusGeometry(0.085, 0.045, 10, 16, 2.5), m, g); b.rotation.z = 0.32; b.scale.set(1, 1, 0.8);
  for (let i = 0; i < 3; i++) { const r = mk(new THREE.TorusGeometry(0.047, 0.006, 4, 12), mat(0xb87a35, 0.6), g); const a = 0.6 + i * 0.6; r.position.set(Math.cos(a + 0.32) * 0.085, Math.sin(a + 0.32) * 0.085, 0); r.rotation.y = Math.PI / 2; r.rotation.x = a; }
  return g;
}

export function makeTree(seed = 1, s = 1) {
  const R = rng(seed), g = new THREE.Group();
  const trunk = mk(new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 1.6 * s, 8), mat(0x6e5236, 0.9), g, 0, 0.8 * s, 0); trunk.rotation.z = (R() - 0.5) * 0.15;
  const greens = [0x5f9e3c, 0x6fb046, 0x4f8a33, 0x7abf52];
  for (let i = 0; i < 7; i++) {
    const b = mk(new THREE.IcosahedronGeometry((0.55 + R() * 0.4) * s, 1), new THREE.MeshStandardMaterial({ color: greens[i % 4], roughness: 0.9, flatShading: true }), g,
      (R() - 0.5) * 1.1 * s, (1.8 + R() * 0.9) * s, (R() - 0.5) * 0.9 * s);
    b.scale.set(1, 0.85, 1);
  }
  return g;
}

/** A row-house / shop facade box with windows + an awning. Front faces +z. */
export function makeBuilding({ w = 5, h = 8, d = 5, color = '#e9b38a', seed = 1, shop = '' } = {}) {
  const R = rng(seed), g = new THREE.Group();
  const floors = Math.max(2, Math.round(h / 2.6)), cols = Math.max(2, Math.round(w / 1.4));
  const ft = tex(256, Math.round(256 * h / w), (c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H);
    for (let f = 0; f < floors - 1; f++) for (let k = 0; k < cols; k++) {
      const x = (k + 0.2) * W / cols, y = (f + 0.22) * H / floors, ww = W / cols * 0.6, hh = H / floors * 0.52;
      c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      const gl = c.createLinearGradient(x, y, x + ww, y + hh); gl.addColorStop(0, '#9fd1ef'); gl.addColorStop(1, '#4f86b3'); c.fillStyle = gl; c.fillRect(x, y, ww, hh);
      if (R() > 0.6) { c.fillStyle = 'rgba(255,230,180,.6)'; c.fillRect(x, y + hh * 0.5, ww, hh * 0.5); }
    }
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, H - H / floors, W, H / floors);
    c.fillStyle = '#3d2f2a'; c.fillRect(W * 0.08, H - H / floors * 0.85, W * 0.5, H / floors * 0.85);
    c.fillStyle = '#7fb6d8'; c.fillRect(W * 0.6, H - H / floors * 0.8, W * 0.32, H / floors * 0.55);
    if (shop) { c.fillStyle = '#fff'; c.font = `bold ${Math.round(W / 9)}px Arial`; c.textAlign = 'center'; c.fillText(shop, W * 0.5, H - H / floors * 1.02); }
  });
  const side = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const front = new THREE.MeshStandardMaterial({ map: ft, roughness: 0.85 });
  const box = mk(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side], g, 0, h / 2, 0);
  mk(new THREE.BoxGeometry(w + 0.2, 0.3, d + 0.2), mat(0xf2ede4, 0.8), g, 0, h + 0.15, 0);
  const aw = mk(new THREE.BoxGeometry(w * 0.9, 0.08, 0.9), mat(['#d8423a', '#2f8f6a', '#3a6fd8', '#e0a12a'][seed % 4], 0.7), g, 0, h / floors * 0.95, d / 2 + 0.42); aw.rotation.x = 0.28;
  if (R() > 0.5) { const wt = new THREE.Group(); g.add(wt); wt.position.set((R() - 0.5) * w * 0.5, h + 0.3, 0); mk(new THREE.CylinderGeometry(0.6, 0.6, 1.1, 14), mat(0x8a5a3a, 0.9), wt, 0, 1.3, 0); mk(new THREE.ConeGeometry(0.65, 0.5, 14), mat(0x6a4a30, 0.9), wt, 0, 2.1, 0); for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), mat(0x444444), wt, x, 0.4, z); }
  void box;
  return g;
}

/** The bakery on the verge (front faces +z, toward the camera). */
export async function makeBakery() {
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const g = new THREE.Group(), W = 3.8, H = 2.8, Dp = 2.6;
  const wallM = new THREE.MeshStandardMaterial({ color: 0xf6e3c0, roughness: 0.85 });
  mk(new THREE.BoxGeometry(W, H, Dp), wallM, g, 0, H / 2, 0);
  mk(new THREE.BoxGeometry(W + 0.2, 0.22, Dp + 0.2), mat(0xc85a4a, 0.7), g, 0, H + 0.11, 0);
  const chim = mk(new THREE.BoxGeometry(0.4, 0.8, 0.4), mat(0xb0584a, 0.8), g, 1.2, H + 0.5, -0.6); void chim;
  const sign = tex(512, 128, (c, w, h) => { c.fillStyle = '#7a2e22'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 24); c.fill(); c.fillStyle = '#ffe3a3'; c.font = '86px "Luckiest Guy", Arial Black'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BAKERY', w / 2, h / 2 + 6); });
  mk(new THREE.PlaneGeometry(2.6, 0.62), new THREE.MeshStandardMaterial({ map: sign, roughness: 0.6 }), g, 0, H - 0.42, Dp / 2 + 0.02);
  const awn = tex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff4ea' : '#e2483f'; c.fillRect((i * w) / 8, 0, w / 8, h); } });
  const aw = mk(new THREE.BoxGeometry(W * 0.95, 0.06, 0.8), [mat(0xe2483f), mat(0xe2483f), new THREE.MeshStandardMaterial({ map: awn }), new THREE.MeshStandardMaterial({ map: awn }), mat(0xe2483f), mat(0xe2483f)], g, 0, H - 0.95, Dp / 2 + 0.38); aw.rotation.x = 0.32;
  mk(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({ color: 0x3b5a73, roughness: 0.15, metalness: 0.2 }), g, -0.7, 1.0, Dp / 2 + 0.015);
  mk(new THREE.BoxGeometry(1.9, 0.08, 0.3), mat(0xffffff, 0.6), g, -0.7, 0.45, Dp / 2 + 0.06);
  const door = mk(new THREE.BoxGeometry(0.8, 1.7, 0.06), mat(0x8a4b2e, 0.6), g, 1.15, 0.85, Dp / 2 + 0.02); void door;
  const display = new THREE.Group(); g.add(display); display.position.set(-0.7, 0.6, Dp / 2 + 0.12);
  const crs = [];
  for (let i = 0; i < 5; i++) { const c = makeCroissant(); c.position.set(-0.7 + i * 0.35, 0.02, 0); c.rotation.x = -0.6; display.add(c); crs.push(c); }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, croissants: crs, W, H, D: Dp };
}

/** Tunnel boring machine, axis +x (cutterhead at +x), ~4.4 m shield + a 3 m trailing gantry. spin(t), conveyor(t). */
export function makeTBM(R = 1.78, gantries = 1) {
  const g = new THREE.Group();
  const yel = new THREE.MeshStandardMaterial({ color: 0xf0a53a, roughness: 0.45, metalness: 0.25 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x5c636c, roughness: 0.4, metalness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.6, metalness: 0.4 });
  const L = 4.2;
  const shield = mk(new THREE.CylinderGeometry(R, R, L, 48, 1, false), yel, g, -L / 2, 0, 0); shield.rotation.z = Math.PI / 2;
  for (const x of [-L + 0.15, -0.35]) { const b = mk(new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.18, 48), dark, g, x, 0, 0); b.rotation.z = Math.PI / 2; }
  const stripes = tex(512, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#1d1d1d' : '#f5c63c'; c.beginPath(); c.moveTo(i * 32, h); c.lineTo(i * 32 + 32, h); c.lineTo(i * 32 + 64, 0); c.lineTo(i * 32 + 32, 0); c.fill(); } });
  stripes.wrapS = THREE.RepeatWrapping; stripes.repeat.set(4, 1);
  const st = mk(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.45, 48, 1, true), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.5 }), g, -L * 0.55, 0, 0); st.rotation.z = Math.PI / 2;
  const head = new THREE.Group(); g.add(head); head.position.x = 0.15;
  const disc = mk(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.32, 48), steel, head, 0, 0, 0); disc.rotation.z = Math.PI / 2;
  const cone = mk(new THREE.ConeGeometry(0.42, 0.45, 24), dark, head, 0.36, 0, 0); cone.rotation.z = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, sp = new THREE.Group(); head.add(sp); sp.rotation.x = a;
    mk(new THREE.BoxGeometry(0.16, R * 0.96, 0.26), yel, sp, 0.2, R * 0.5, 0);
    for (let k = 0; k < 4; k++) { const cut = mk(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 16), steel, sp, 0.32, 0.45 + k * 0.36, 0.0); cut.rotation.z = Math.PI / 2; }
  }
  // trailing gear: two gantries + conveyor + Gary's seat
  const gear = new THREE.Group(); g.add(gear); gear.position.x = -L;
  for (let k = 0; k < gantries; k++) {
    const x = -1.6 - k * 3.0;
    for (const z of [-0.9, 0.9]) for (const dx of [-1.2, 1.2]) mk(new THREE.BoxGeometry(0.12, 1.9, 0.12), yel, gear, x + dx, -0.25, z);
    mk(new THREE.BoxGeometry(2.7, 0.12, 2.0), yel, gear, x, 0.72, 0);
    mk(new THREE.BoxGeometry(2.7, 0.1, 2.0), dark, gear, x, -0.4, 0);
    mk(new RoundedBoxGeometry(1.2, 0.7, 0.9, 2, 0.08), mat(0x3d79c9, 0.5), gear, x - 0.5, 0.15, -0.35);
    for (const dx of [-1.0, 1.0]) for (const z of [-0.75, 0.75]) { const w = mk(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 14), dark, gear, x + dx, -1.25, z); w.rotation.x = Math.PI / 2; }
  }
  const beltTex = tex(256, 32, (c, w, h) => { c.fillStyle = '#1f1f1f'; c.fillRect(0, 0, w, h); for (let i = 0; i < 24; i++) { c.fillStyle = ['#6b4426', '#8f6a45', '#5a3a20'][i % 3]; c.beginPath(); c.ellipse((i * w) / 24 + 5, h / 2, 6, 9, 0, 0, 7); c.fill(); } });
  beltTex.wrapS = THREE.RepeatWrapping; beltTex.repeat.set(6, 1);
  const belt = mk(new THREE.BoxGeometry(3.0 * gantries + 1.0, 0.08, 0.5), [dark, dark, new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 }), dark, dark, dark], gear, -1.4 - 1.5 * (gantries - 1), 0.82, 0.55);
  const seat = new THREE.Group(); gear.add(seat); seat.position.set(-1.2, 0.78, 0.45);
  mk(new RoundedBoxGeometry(0.5, 0.12, 0.5, 2, 0.04), mat(0x222222, 0.6), seat, 0, 0.06, 0);
  mk(new RoundedBoxGeometry(0.5, 0.5, 0.1, 2, 0.04), mat(0x222222, 0.6), seat, 0, 0.3, -0.25);
  const lever = mk(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), steel, seat, 0.35, 0.25, 0.1); lever.rotation.z = -0.3;
  // segment erector arm in the shield's tail
  const arm = new THREE.Group(); g.add(arm); arm.position.x = -L + 0.6;
  mk(new THREE.BoxGeometry(0.3, 1.3, 0.3), mat(0xd23c32, 0.5), arm, 0, 0.55, 0);
  mk(new THREE.BoxGeometry(0.5, 0.2, 0.6), dark, arm, 0, 1.2, 0);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, head, seat, arm, gear, length: L, spin: (a) => (head.rotation.x = a), conveyor: (t) => (beltTex.offset.x = -t * 0.8) };
}

/** The back part of one lining ring (5 segments, ±amax around straight back), axis along x, centered at the origin, width w.
 *  opts.dress adds tunnel services on the inner face (a cable bundle; a work lamp when opts.lamp) — children 5+ of the group.
 *  Concrete is mid-grey with a speckle map: the v1/v2 light grey (0xbdbab2) washed out to flat white under the sun. */
let concreteTex = null;
export function makeHalfRing(R = 1.8, thick = 0.2, w = 0.86, seed = 1, amax = Math.PI / 2, opts = {}) {
  const g = new THREE.Group(), n = 5, gap = 0.02;
  const shades = opts.shades || [0xbdbab2, 0xb3b0a7, 0xc5c2ba];
  if (opts.dress && !concreteTex) {
    concreteTex = tex(256, 256, (c, W, H) => { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); const r = rng(77);
      for (let i = 0; i < 2600; i++) { const v = 200 + Math.floor(r() * 55); c.fillStyle = `rgba(${v},${v},${v - 4},.55)`; c.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,118,112,.25)'; c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2.5, 0, 7); c.fill(); } });
    concreteTex.wrapS = concreteTex.wrapT = THREE.RepeatWrapping; concreteTex.colorSpace = THREE.SRGBColorSpace;
  }
  for (let i = 0; i < n; i++) {
    const a0 = -amax + (i / n) * 2 * amax + gap, a1 = -amax + ((i + 1) / n) * 2 * amax - gap;
    const s = new THREE.Shape(); s.absarc(0, 0, R, a0, a1, false); s.absarc(0, 0, R - thick, a1, a0, true);
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.022, bevelSegments: 2, curveSegments: 10 });
    geo.translate(0, 0, -w / 2);
    const m = mk(geo, new THREE.MeshStandardMaterial({ color: shades[(i + seed) % 3], roughness: 0.92, map: opts.dress ? concreteTex : null }), g);
    m.rotation.y = Math.PI / 2; // shape's +x (the back side) → world -z
  }
  if (opts.dress) { // a point on the inner face at angle a (0 = straight back, + = up): (0, r·sin a, −r·cos a)
    const ri = R - thick - 0.04, at = (a, r = ri) => [0, r * Math.sin(a), -r * Math.cos(a)];
    const cab = new THREE.Group(); g.add(cab);
    [[0x222428, 0.3], [0x3a3d42, 0.36], [0x8a2a22, 0.42]].forEach(([c, a]) => { const p = at(a); const cy = mk(new THREE.CylinderGeometry(0.035, 0.035, w + 0.02, 8), mat(c, 0.5), cab, ...p); cy.rotation.z = Math.PI / 2; });
    const br = mk(new THREE.BoxGeometry(0.04, 0.2, 0.05), mat(0x6b7077, 0.5), cab, ...at(0.36, ri + 0.01)); br.rotation.x = 0.36;
    if (opts.lamp) { const p = at(0.95); mk(new RoundedBoxGeometry(0.34, 0.09, 0.09, 2, 0.03), new THREE.MeshStandardMaterial({ color: 0xfff3d0, emissive: 0xffd98a, emissiveIntensity: 1.6 }), g, ...p).rotation.x = 0.95; }
  }
  return g;
}

/** Subway train (cars along x, front at +x). */
export async function makeTrain(cars = 2) {
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const g = new THREE.Group(), L = 6.4, Hh = 2.25, Wd = 1.85;
  const body = new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.35, metalness: 0.55 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0x2f6fd6, roughness: 0.5 });
  const win = new THREE.MeshStandardMaterial({ color: 0x2d3a48, emissive: 0xffe9b8, emissiveIntensity: 0.55, roughness: 0.2 });
  const doorM = new THREE.MeshStandardMaterial({ color: 0xaeb4bd, roughness: 0.35, metalness: 0.6 });
  const bullet = tex(128, 128, (c, w) => { c.fillStyle = '#6cbe45'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 4, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '86px "Luckiest Guy", Arial Black'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('G', w / 2, w / 2 + 6); });
  for (let k = 0; k < cars; k++) {
    const cg = new THREE.Group(); g.add(cg); cg.position.x = -k * (L + 0.25);
    mk(new RoundedBoxGeometry(L, Hh, Wd, 3, 0.18), body, cg, 0, Hh / 2 + 0.25, 0);
    mk(new THREE.BoxGeometry(L - 0.1, 0.16, Wd + 0.02), stripe, cg, 0, 1.0, 0);
    for (const side of [1, -1]) {
      for (let i = 0; i < 6; i++) { const x = -L / 2 + 0.6 + i * 1.05; if (i % 3 === 1) { mk(new THREE.BoxGeometry(0.62, 1.55, 0.02), doorM, cg, x, 1.08, side * (Wd / 2 + 0.005)); mk(new THREE.BoxGeometry(0.26, 0.5, 0.025), win, cg, x - 0.15, 1.5, side * (Wd / 2 + 0.008)); mk(new THREE.BoxGeometry(0.26, 0.5, 0.025), win, cg, x + 0.15, 1.5, side * (Wd / 2 + 0.008)); } else mk(new THREE.BoxGeometry(0.75, 0.55, 0.025), win, cg, x, 1.5, side * (Wd / 2 + 0.008)); }
      mk(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: bullet, transparent: true }), cg, L / 2 - 0.5, 1.95, side * (Wd / 2 + 0.02)).rotation.y = side > 0 ? 0 : Math.PI;
    }
    for (const dx of [-L / 2 + 0.9, L / 2 - 0.9]) { const b = mk(new THREE.BoxGeometry(1.0, 0.3, 1.4), mat(0x2b2b2b, 0.7), cg, dx, 0.18, 0); void b; }
  }
  const front = new THREE.Group(); g.add(front); front.position.x = L / 2;
  mk(new THREE.PlaneGeometry(1.1, 0.7), win, front, 0.012, 1.7, 0).rotation.y = Math.PI / 2;
  const hl = new THREE.MeshBasicMaterial({ color: 0xfff3c8, toneMapped: false });
  for (const z of [-0.6, 0.6]) mk(new THREE.CircleGeometry(0.1, 16), hl, front, 0.015, 0.75, z).rotation.y = Math.PI / 2;
  mk(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: bullet, transparent: true }), front, 0.016, 2.2, 0).rotation.y = Math.PI / 2;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, length: cars * (L + 0.25) };
}

/** A big face-on fan (axis z). spin(a). */
export function makeFan(r = 0.5) {
  const g = new THREE.Group(), rotor = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x8d969f, roughness: 0.4, metalness: 0.6 });
  mk(new THREE.TorusGeometry(r, 0.06, 10, 32), steel, g);
  mk(new THREE.CylinderGeometry(r, r, 0.3, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x5f666d, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide }), g).rotation.x = Math.PI / 2;
  g.add(rotor);
  for (let i = 0; i < 5; i++) { const b = mk(new THREE.BoxGeometry(0.2, r * 0.82, 0.02), mat(0xdfe5ea, 0.4), rotor, 0, 0, 0); b.geometry.translate(0, r * 0.43, 0); b.rotation.set(0, 0.45, (i / 5) * Math.PI * 2); }
  mk(new THREE.SphereGeometry(0.1, 12, 10), mat(0xd23c32, 0.4), rotor, 0, 0, 0.06);
  return { g, spin: (a) => (rotor.rotation.z = a) };
}

// ---------------------------------------------------------------- the set
export async function buildSubway(studio) {
  const { scene, renderer, camera } = studio;
  renderer.localClippingEnabled = true;
  camera.far = 700; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xd6ecf8);
  scene.fog = new THREE.Fog(0xd6ecf8, 70, 260);
  makeSky(root, 320);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  // light: soft sky fill + a warm sun from the front-left (it lights the cut face)
  const hemi = new THREE.HemisphereLight(0xe2f1ff, 0x9a8a68, 1.05); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.1); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cy, half = 8) {
    sun.position.set(cx - 7, cy + 13, 12); sun.target.position.set(cx, cy, -1);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 60 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun(0, -3);

  // the cut face + its back wall
  const F = D.face;
  const cut = makeCutFace({ ...F, ppm: 96, mppm: 40, depth: D.depth, backShade: 0.18, paint: paintStrata });
  root.add(cut.group);
  const rims = { shaft: makeRim(root, D.depth, 0x9a6a44), v0: makeRim(root, D.depth, 0x9a6a44), v1: makeRim(root, D.depth, 0x9a6a44), station: makeRim(root, D.depth, 0x8a6040), burrow: null };

  // ground top: verge (masked: holes for the shaft, vents, escalator), sidewalk, road, far side
  const lawn = lawnTexture(); lawn.repeat.set(50 / 1.6, 3.4 / 1.6);
  const vergeM = new THREE.MeshStandardMaterial({ map: lawn, roughness: 0.95 });
  const verge = maskedPlane(50, 3.4, vergeM, 40); verge.mesh.rotation.x = -Math.PI / 2; verge.mesh.position.set(9, 0, -1.7); root.add(verge.mesh);
  const setVergeHoles = (shapes) => verge.setHoles(shapes, (x, z) => [x - 9, -(z + 1.7)]);
  const tileT = tex(128, 128, (c, w, h) => { c.fillStyle = '#cfcac1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b3ada3'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); });
  tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(50 / 1.2, 1.4 / 1.2);
  mk(new THREE.BoxGeometry(50, 0.14, 1.4), new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.9 }), root, 9, 0.07, -4.1);
  const roadT = tex(512, 256, (c, w, h) => { c.fillStyle = '#4a4d52'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; c.fillRect((i * 37) % w, (i * 91) % h, 2, 2); } c.fillStyle = '#f2d14a'; c.fillRect(0, h / 2 - 3, w, 6); c.fillStyle = '#eee'; for (let x = 0; x < w; x += 64) { c.fillRect(x, h * 0.04, 34, 5); c.fillRect(x, h * 0.95, 34, 5); } });
  roadT.wrapS = THREE.RepeatWrapping; roadT.repeat.set(50 / 8, 1);
  const road = mk(new THREE.PlaneGeometry(50, 5.4), new THREE.MeshStandardMaterial({ map: roadT, roughness: 0.85 }), root, 9, 0.0, -7.5); road.rotation.x = -Math.PI / 2;
  mk(new THREE.BoxGeometry(50, 0.14, 1.4), new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.9 }), root, 9, 0.07, -10.9);
  const far = mk(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: (() => { const l = lawnTexture('#86c862', '#79bb56'); l.repeat.set(200, 200); return l; })(), roughness: 1 }), root, 9, -0.02, -310); far.rotation.x = -Math.PI / 2;
  // ground beyond the cut's ends (so wide shots don't see the edge of the world)
  for (const [x, w] of [[-16 - 40, 80], [34 + 40, 80]]) { const p = mk(new THREE.PlaneGeometry(w, 12), new THREE.MeshStandardMaterial({ map: (() => { const l = lawnTexture(); l.repeat.set(w / 1.6, 12 / 1.6); return l; })(), roughness: 1 }), root, x, -0.01, -6); p.rotation.x = -Math.PI / 2; }

  // far side: buildings, trees, lamps; skyline far away
  const cols = ['#e9b38a', '#f2d49b', '#a9cbe0', '#e8a7a0', '#c6dcb0', '#f0c9a8', '#d7c4e8', '#f4e1b5'];
  let bx = -24, bi = 0;
  while (bx < 44) { const w = 4.5 + (bi % 3) * 1.2, h = 6 + ((bi * 7) % 5) * 1.8; const b = makeBuilding({ w, h, d: 5, color: cols[bi % cols.length], seed: bi + 3, shop: ['', 'DELI', '', 'PIZZA', 'BOOKS', '', 'CAFÉ', ''][bi % 8] }); b.position.set(bx + w / 2, 0.14, -14.4); root.add(b); bx += w + 0.25; bi++; }
  for (let i = 0; i < 18; i++) { const h = 30 + ((i * 37) % 50); const s = mk(new THREE.BoxGeometry(14 + (i % 4) * 4, h, 12), new THREE.MeshStandardMaterial({ color: 0xb9cfe0, roughness: 1 }), root, -90 + i * 13, h / 2, -110 - (i % 3) * 25); s.castShadow = false; }
  for (const [x, z, s] of [[-15.5, -2.6, 1.0], [11.6, -1.8, 0.95], [16.0, -1.4, 0.8], [-9, -11.0, 1.1], [3, -11.0, 1.0], [18, -11.0, 1.1], [27, -11.0, 0.9]]) { const tr = makeTree(Math.round(x * 7 + 50), s); tr.position.set(x, 0, z); root.add(tr); }
  const lampM = new THREE.MeshStandardMaterial({ color: 0x3b4a44, roughness: 0.5, metalness: 0.5 });
  for (const x of [-1, 11, 23]) { mk(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 10), lampM, root, x, 2.1, -3.7); const a = mk(new THREE.BoxGeometry(0.8, 0.08, 0.08), lampM, root, x, 4.15, -3.35); a.rotation.y = Math.PI / 2; mk(new THREE.BoxGeometry(0.3, 0.12, 0.45), mat(0xfff3d0, 0.3, { emissive: 0xfff0c0, emissiveIntensity: 0.3 }), root, x, 4.05, -3.0); }
  const hyd = new THREE.Group(); root.add(hyd); hyd.position.set(-3.6, 0.14, -3.6); mk(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), mat(0xd43c2f, 0.5), hyd, 0, 0.3, 0); mk(new THREE.SphereGeometry(0.13, 12, 8), mat(0xd43c2f, 0.5), hyd, 0, 0.62, 0);
  const bench = new THREE.Group(); root.add(bench); bench.position.set(7.0, 0, -2.6);
  mk(new THREE.BoxGeometry(1.6, 0.08, 0.45), mat(0x9a6a3e, 0.7), bench, 0, 0.45, 0); mk(new THREE.BoxGeometry(1.6, 0.4, 0.06), mat(0x9a6a3e, 0.7), bench, 0, 0.75, -0.2);
  for (const x of [-0.7, 0.7]) mk(new THREE.BoxGeometry(0.06, 0.45, 0.4), lampM, bench, x, 0.22, 0);

  // traffic jam (both lanes, bumper to bumper)
  const carCols = [0xd94b3d, 0x3d7bd9, 0xf2c14e, 0x58b368, 0xe8e8ec, 0x8a5bd9, 0xff8a3d, 0x2f2f33, 0x4fc2c9];
  const cars = [];
  for (let lane = 0; lane < 2; lane++) for (let i = 0; i < 12; i++) {
    const c = makeCar(carCols[(i * 5 + lane * 3) % carCols.length], i * 3 + lane + 1);
    const x = -16 + i * 4.55 + lane * 2.1; c.g.position.set(x, 0, D.lanes[lane]); c.g.rotation.y = lane ? -Math.PI / 2 : Math.PI / 2; root.add(c.g);
    c.g.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.blending === THREE.AdditiveBlending) o.visible = false; });
    cars.push({ ...c, x, lane, ph: i * 1.7 + lane });
  }

  // the bakery block (settles into the tunnel): its own strata face, sides, lawn top, the bakery
  const [px0, px1] = D.plug, crown = T.y + tunnelHalf;
  const plug = new THREE.Group(); root.add(plug);
  const pf = new THREE.PlaneGeometry(px1 - px0, -crown), uv = pf.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const lx = pf.attributes.position.getX(i) + (px0 + px1) / 2, ly = pf.attributes.position.getY(i) + crown / 2; uv.setXY(i, (lx - F.x0) / (F.x1 - F.x0), (ly - F.y0) / (F.y1 - F.y0)); }
  const plugFace = mk(pf, new THREE.MeshStandardMaterial({ map: cut.face.material.map, roughness: 0.97, bumpMap: cut.face.material.bumpMap, bumpScale: 1.4 }), plug, (px0 + px1) / 2, crown / 2, 0.001);
  void plugFace;
  const soilSide = new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 1 });
  for (const x of [px0 + 0.012, px1 - 0.012]) mk(new THREE.BoxGeometry(0.02, -crown, 3.38), soilSide, plug, x, crown / 2, -1.71);
  mk(new THREE.BoxGeometry(px1 - px0 - 0.03, 0.02, 3.38), soilSide, plug, (px0 + px1) / 2, crown + 0.012, -1.71);
  const plugLawn = lawn.clone(); plugLawn.needsUpdate = true; plugLawn.repeat.set((px1 - px0) / 1.6, 3.4 / 1.6);
  mk(new THREE.PlaneGeometry(px1 - px0, 3.4), new THREE.MeshStandardMaterial({ map: plugLawn, roughness: 0.95 }), plug, (px0 + px1) / 2, 0.001, -1.7).rotation.x = -Math.PI / 2;
  const bakery = await makeBakery(); bakery.g.position.set(3.0, 0, -1.75); plug.add(bakery.g);

  // tunnel: bored soil surface (back part of a cylinder, clipped at the TBM face), invert slab, track, third rail
  const clipFace = new THREE.Plane(new THREE.Vector3(-1, 0, 0), T.x0);
  const boreT = grainTexture(11); boreT.repeat.set(30, 4);
  const boreMap = tex(512, 256, (c, w, h) => { const r = rng(21); c.fillStyle = '#7b5c43'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const y = r() * h, L = 20 + r() * 120; c.strokeStyle = r() < 0.6 ? `rgba(40,24,14,${0.1 + r() * 0.2})` : `rgba(210,170,120,${0.06 + r() * 0.12})`; c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(r() * w, y); c.lineTo(r() * w + L, y + (r() - 0.5) * 4); c.stroke(); }
    for (let i = 0; i < 160; i++) { c.fillStyle = ['#8c7a68', '#a69a8a', '#5f5146'][i % 3]; c.beginPath(); c.ellipse(r() * w, r() * h, 2 + r() * 4, 1.5 + r() * 3, r() * 3, 0, 7); c.fill(); } });
  boreMap.wrapS = boreMap.wrapT = THREE.RepeatWrapping; boreMap.repeat.set(8, 1);
  const boreM = new THREE.MeshStandardMaterial({ color: 0xc9b6a2, map: boreMap, roughness: 1, side: THREE.BackSide, bumpMap: boreT, bumpScale: 2, clippingPlanes: [clipFace], clipShadows: true });
  const bores = [[T.x0, D.station.x0 - 0.2], [D.station.x0 - 0.2, D.station.x1 + 0.2], [D.station.x1 + 0.2, 40]].map(([a, b]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(T.R, T.R, b - a, 48, 1, true, Math.PI - ARC, 2 * ARC), boreM);
    m.rotation.z = -Math.PI / 2; m.position.set((a + b) / 2, T.y, T.z); m.receiveShadow = true; root.add(m); return m;
  });
  const bore = bores[1]; // the station section: hide it once the station is dug
  const ringG = new THREE.Group(); root.add(ringG);
  const rings = [];
  for (let x = T.x0 + T.ring / 2; x < F.x1; x += T.ring) { const r = makeHalfRing(T.R + 0.01, 0.2, T.ring - 0.03, rings.length, ARC, { dress: true, lamp: rings.length % 3 === 1, shades: [0x9d9a93, 0x95928b, 0xa5a29b] }); r.position.set(x, T.y, T.z); ringG.add(r); rings.push({ g: r, x }); }
  const track = new THREE.Group(); root.add(track);
  const slab = mk(new THREE.BoxGeometry(40, 0.5, 2.2), mat(0x9d9a92, 0.95), track, T.x0 + 20, T.floor - 0.25, -1.1); void slab;
  const railM = new THREE.MeshStandardMaterial({ color: 0x8c8f94, roughness: 0.3, metalness: 0.8 });
  for (const dz of [-0.46, 0.46]) mk(new THREE.BoxGeometry(40, 0.1, 0.07), railM, track, T.x0 + 20, T.floor + 0.12, T.z + dz);
  const tieGeo = new THREE.BoxGeometry(0.2, 0.08, 1.4), tieM = mat(0x5e4a3a, 0.9);
  const ties = new THREE.InstancedMesh(tieGeo, tieM, 64); ties.receiveShadow = true;
  for (let i = 0; i < 64; i++) ties.setMatrixAt(i, new THREE.Matrix4().makeTranslation(T.x0 + 0.3 + i * 0.62, T.floor + 0.04, T.z));
  track.add(ties);
  const third = new THREE.Group(); root.add(third);
  const thirdM = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.35, metalness: 0.7, emissive: 0x58c8ff, emissiveIntensity: 0 });
  const TZ = T.z + 1.05; // third rail: on the front edge of the track (just outside the cut) so close-ups see Gary's face
  mk(new THREE.BoxGeometry(40, 0.09, 0.09), thirdM, third, T.x0 + 20, T.floor + 0.2, TZ);   // low, beside the running rails
  const coverM = mat(0xf2c418, 0.6);
  mk(new THREE.BoxGeometry(40, 0.03, 0.26), coverM, third, T.x0 + 20, T.floor + 0.29, TZ + 0.02);
  for (let i = 0; i < 30; i++) mk(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8), mat(0xeeeeee, 0.4), third, T.x0 + 0.5 + i * 1.3, T.floor + 0.08, TZ);
  const trackClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), T.x0), thirdClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), T.x0);
  // clipShadows: a clipped part must not keep casting its shadow (v1 showed a phantom third rail in solid ground)
  for (const [grp, cp] of [[track, trackClip], [third, thirdClip]]) grp.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [cp]; o.material.clipShadows = true; } });
  const thirdMat = third.children[0].material;
  ties.material = ties.material.clone(); ties.material.clippingPlanes = [trackClip]; ties.material.clipShadows = true;

  // vent shafts: fans + street grates
  const fans = D.vents.map(([a, b]) => { const f = makeFan(0.48); f.g.position.set((a + b) / 2, -2.1, -1.4); root.add(f.g); return f; });
  const grates = D.vents.map(([a, b]) => {
    const gr = new THREE.Group(); root.add(gr); gr.position.set((a + b) / 2, 0.02, -1.8);
    for (let i = 0; i <= 10; i++) mk(new THREE.BoxGeometry(b - a + 0.1, 0.04, 0.04), mat(0x3a3d42, 0.5), gr, 0, 0, -1.8 + i * 0.36);
    for (let i = 0; i <= 4; i++) mk(new THREE.BoxGeometry(0.04, 0.05, 3.7), mat(0x3a3d42, 0.5), gr, -(b - a) / 2 + (i * (b - a)) / 4, 0, 0);
    return gr;
  });

  // station: tiled back wall + sign + map, platform, columns, lights, bench, turnstiles, escalator, puddle
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const S = D.station, stn = new THREE.Group(); root.add(stn);
  const wallT = tex(1024, 512, (c, w, h) => {
    c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d8d3c8'; c.lineWidth = 2;
    for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 0 : 16; x < w; x += 32) c.strokeRect(x, y, 32, 16);
    c.fillStyle = '#2f9e6b'; c.fillRect(0, h * 0.62, w, h * 0.05);
    c.fillStyle = '#20232a'; c.beginPath(); c.roundRect(w * 0.42, h * 0.2, w * 0.36, h * 0.2, 12); c.fill();
    c.fillStyle = '#fff'; c.font = '64px "Luckiest Guy", Arial Black'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARY ST', w * 0.6, h * 0.31);
    c.fillStyle = '#6cbe45'; c.beginPath(); c.arc(w * 0.47, h * 0.3, 26, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '40px "Luckiest Guy", Arial Black'; c.fillText('G', w * 0.47, h * 0.31);
  });
  const wall = mk(new THREE.PlaneGeometry(S.x1 - S.x0, S.y1 - S.y0), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.6 }), stn, (S.x0 + S.x1) / 2, (S.y0 + S.y1) / 2, -D.depth + 0.04); void wall;
  // the map nobody understands: its own plane (a video can slam it onto the wall on its word)
  const mapT = tex(512, 400, (c, w, h) => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, w, h); c.strokeStyle = '#333'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
    const lc = ['#e8423a', '#2f6fd6', '#f2b21c', '#6cbe45', '#a24fd8', '#ff8a3d', '#22a6b3'], R2 = rng(4);
    for (let i = 0; i < 9; i++) { c.strokeStyle = lc[i % lc.length]; c.lineWidth = 10; c.lineJoin = 'round'; c.beginPath(); let x = w * (0.05 + R2() * 0.9), y = h * (0.05 + R2() * 0.9); c.moveTo(x, y); for (let k = 0; k < 7; k++) { x = Math.min(w * 0.95, Math.max(w * 0.05, x + (R2() - 0.5) * 140)); y = Math.min(h * 0.95, Math.max(h * 0.05, y + (R2() - 0.5) * 140)); c.lineTo(x, y); } c.stroke(); } });
  const map = mk(new THREE.PlaneGeometry((S.x1 - S.x0) * 0.26, (S.y1 - S.y0) * 0.42), new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.6 }), root, S.x0 + (S.x1 - S.x0) * 0.19, S.y1 - (S.y1 - S.y0) * 0.33, -D.depth + 0.06);
  const plat = mk(new THREE.BoxGeometry(S.x1 - S.x0 - 0.2, S.platY - S.y0, 1.75), mat(0xb9b5ad, 0.9), stn, (S.x0 + S.x1) / 2, (S.platY + S.y0) / 2, -D.depth + 0.9); void plat;
  mk(new THREE.BoxGeometry(S.x1 - S.x0 - 0.2, 0.02, 0.2), mat(0xf2d12a, 0.6), stn, (S.x0 + S.x1) / 2, S.platY + 0.011, -D.depth + 1.68);
  for (const x of [20.35, 24.6]) { mk(new THREE.BoxGeometry(0.22, S.y1 - S.platY, 0.22), mat(0x2f6fd6, 0.45), stn, x, (S.y1 + S.platY) / 2, -D.depth + 0.5); }
  for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(1.5, 0.06, 0.18), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6e0, emissiveIntensity: 1.2 }), stn, 18.3 + i * 2.3, S.y1 - 0.08, -1.4);
  const sb = new THREE.Group(); stn.add(sb); sb.position.set(22.8, S.platY, -3.1);
  mk(new THREE.BoxGeometry(1.4, 0.07, 0.4), mat(0x8a5a3a, 0.7), sb, 0, 0.45, 0); for (const x of [-0.6, 0.6]) mk(new THREE.BoxGeometry(0.06, 0.45, 0.35), lampM, sb, x, 0.22, 0);
  const puddle = mk(new THREE.CircleGeometry(0.45, 32), new THREE.MeshStandardMaterial({ color: 0x5c8fb0, roughness: 0.02, metalness: 0.3, transparent: true, opacity: 0.85 }), stn, 20.6, S.platY + 0.012, -2.5);
  puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.5, 0.8, 1);
  const drip = mk(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8fd8f7, roughness: 0.05, transparent: true, opacity: 0.9 }), stn, 20.6, S.y1, -2.5);
  const turnstiles = [];
  for (let i = 0; i < 3; i++) {
    const ts = new THREE.Group(); stn.add(ts); ts.position.set(23.3, S.platY, -3.25 + i * 0.62);
    mk(new RoundedBoxGeometry(0.5, 0.95, 0.22, 2, 0.05), new THREE.MeshStandardMaterial({ color: 0xa7adb5, metalness: 0.6, roughness: 0.3 }), ts, 0, 0.47, 0);
    const arms = new THREE.Group(); ts.add(arms); arms.position.set(0.28, 0.8, 0.12);
    for (let k = 0; k < 3; k++) { const a = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xd8dde3, metalness: 0.7, roughness: 0.25 }), arms, 0, 0, 0); a.geometry.translate(0, 0.25, 0); a.rotation.x = Math.PI / 2 + (k * 2 * Math.PI) / 3 * 0; a.rotation.set(Math.PI / 2, 0, (k * 2 * Math.PI) / 3); }
    turnstiles.push({ g: ts, arms });
  }
  // fare line: a fence across the platform with the turnstiles in it (escalator side = paid side)
  const fence = new THREE.Group(); stn.add(fence); fence.position.set(23.3, S.platY, 0);
  const fenceM = new THREE.MeshStandardMaterial({ color: 0x8d969f, metalness: 0.6, roughness: 0.35 });
  for (const z of [-3.55, -1.68]) mk(new THREE.BoxGeometry(0.06, 1.0, 0.06), fenceM, fence, 0, 0.5, z);
  mk(new THREE.BoxGeometry(0.05, 0.05, 1.9), fenceM, fence, 0, 1.0, -2.62);
  mk(new THREE.BoxGeometry(D.station.x1 - D.station.x0, 0.3, D.depth), mat(0xcfcac0, 0.9), stn, (D.station.x0 + D.station.x1) / 2, S.y1 - 0.15, -D.depth / 2);
  const esc = new THREE.Group(); root.add(esc);
  const [eb0, eb1] = D.esc.bot, [et0, et1] = D.esc.top;
  const eLen = Math.hypot(et0 - eb0, -S.platY) + 0.6, eAng = Math.atan2(-S.platY, et0 - eb0);
  const stepT = tex(64, 64, (c, w, h) => { c.fillStyle = '#5b6066'; c.fillRect(0, 0, w, h); c.fillStyle = '#3f4348'; for (let y = 0; y < h; y += 8) c.fillRect(0, y, w, 3); c.fillStyle = '#f2d12a'; c.fillRect(0, 0, w, 4); });
  stepT.wrapS = stepT.wrapT = THREE.RepeatWrapping; stepT.repeat.set(1, eLen / 0.4);
  const ramp = mk(new THREE.BoxGeometry(eLen, 0.2, 1.2), [mat(0x40444a), mat(0x40444a), new THREE.MeshStandardMaterial({ map: stepT, roughness: 0.6 }), mat(0x40444a), mat(0x50555c), mat(0x50555c)], esc, 0, 0, 0);
  void ramp; stepT.rotation = Math.PI / 2;
  for (const dz of [-0.65, 0.65]) { mk(new THREE.BoxGeometry(eLen, 0.9, 0.08), mat(0x8d969f, 0.4, { metalness: 0.5 }), esc, 0, 0.45, dz); mk(new THREE.BoxGeometry(eLen, 0.08, 0.12), mat(0x1d1d1d, 0.5), esc, 0, 0.92, dz); }
  esc.position.set(((eb0 + eb1) / 2 + (et0 + et1) / 2) / 2, S.platY / 2 - 0.05, -2.2); esc.rotation.z = eAng;
  const entrance = new THREE.Group(); root.add(entrance); entrance.position.set((et0 + et1) / 2, 0, -1.7);
  for (const dz of [-1.6, 1.6]) mk(new THREE.BoxGeometry(2.0, 0.9, 0.06), new THREE.MeshStandardMaterial({ color: 0x2f6b4a, roughness: 0.5, metalness: 0.4 }), entrance, 0, 0.45, dz);
  for (const dx of [-1.0, 1.0]) { mk(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), lampM, entrance, dx, 1.1, 1.6); mk(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5ddc7a, emissive: 0x3fd166, emissiveIntensity: 0.9 }), entrance, dx, 2.35, 1.6); }
  const subSign = tex(512, 128, (c, w, h) => { c.fillStyle = '#20232a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '78px "Luckiest Guy", Arial Black'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SUBWAY', w / 2, h / 2 + 6); });
  mk(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshStandardMaterial({ map: subSign }), entrance, 0, 1.6, 1.62);

  // pumps + hose (reveal along the curve), shoring timbers, the shovel
  const pumpG = new THREE.Group(); root.add(pumpG);
  const pump = new THREE.Group(); pumpG.add(pump);
  mk(new RoundedBoxGeometry(0.9, 0.6, 0.7, 3, 0.08), mat(0xe0533a, 0.45), pump, 0, 0.3, 0);   // not hard-hat yellow (Gary's hat vanished into it)
  mk(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 18), mat(0x3d7bd9, 0.4), pump, -0.1, 0.75, 0).rotation.z = Math.PI / 2;
  const hoseCurve = new THREE.CatmullRomCurve3([[0.3, 0.6, 0], [0.4, 1.4, -0.4], [0.3, 3.5, -0.6], [0.4, 5.6, -0.8], [0.8, 6.15, -1.6], [1.8, 6.12, -3.2], [2.6, 6.2, -4.6], [3.2, 6.4, -5.2]].map((p) => new THREE.Vector3(...p)));
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 120, 0.07, 10, false);
  const hose = mk(hoseGeo, mat(0x2a8a4a, 0.5), pumpG); const hoseIdx = hoseGeo.index.count;
  const shoring = new THREE.Group(); root.add(shoring);
  const timber = mat(0xc49158, 0.8), plank = mat(0xb07f4a, 0.85);
  shoring.userData.parts = [];
  // shoring is built for the hole's final size (x -7.6..-5.8, down to -3.0); parts pop in one by one
  for (let i = 0; i < 6; i++) { const p = mk(new THREE.BoxGeometry(0.28, 3.0, 0.05), plank, shoring, -7.45 + i * 0.3, -1.5, -D.depth + 0.04); shoring.userData.parts.push(p); }
  for (const x of [-7.58, -5.82]) for (let k = 0; k < 5; k++) { const p = mk(new THREE.BoxGeometry(0.05, 3.0, 0.5), plank, shoring, x, -1.5, -0.4 - k * 0.68); shoring.userData.parts.push(p); }
  // front struts (z −0.9) stay clear of a standing person's face (≈ −1.5 below the lawn): above the head + at the belly
  for (const [y, z] of [[-0.45, -0.9], [-2.2, -0.9], [-0.6, -2.6], [-1.5, -2.6], [-2.4, -2.6]]) { const s = mk(new THREE.CylinderGeometry(0.08, 0.08, 1.74, 10), timber, shoring, -6.7, y, z); s.rotation.z = Math.PI / 2; shoring.userData.parts.push(s); }
  const shovel = makeShovel(); root.add(shovel);

  // water in the shaft: a translucent box seen in section + a rippling surface
  const waterT = tex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a8ecff'); gr.addColorStop(0.06, '#56bce8'); gr.addColorStop(0.5, '#2f8ac8'); gr.addColorStop(1, '#1d5f8c'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const r = rng(9); for (let i = 0; i < 26; i++) { const y = 18 + r() * (h - 30); c.strokeStyle = `rgba(200,240,255,${0.12 + r() * 0.14})`; c.lineWidth = 1.5 + r() * 2; c.beginPath(); for (let x = 0; x <= w; x += 8) { const yy = y + Math.sin(x * 0.09 + i) * 3; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); } });
  const waterM = new THREE.MeshStandardMaterial({ map: waterT, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.62, depthWrite: false, emissive: 0x1a5a8a, emissiveIntensity: 0.12 });
  const water = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), waterM); water.renderOrder = 3; root.add(water);
  const surfGeo = new THREE.PlaneGeometry(1, 1, 24, 24); surfGeo.rotateX(-Math.PI / 2);
  const surf = new THREE.Mesh(surfGeo, new THREE.MeshStandardMaterial({ color: 0x8fd3f5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.6, depthWrite: false })); surf.renderOrder = 4; root.add(surf);
  const surfBase = surfGeo.attributes.position.array.slice();
  const foam = new THREE.Mesh(new THREE.BoxGeometry(1, 0.035, 0.05), new THREE.MeshStandardMaterial({ color: 0xbfeaff, roughness: 0.4, transparent: true, opacity: 0.6 })); root.add(foam);
  function setWater(x0, x1, y0, level, t) {
    const on = level > y0 + 0.01; water.visible = surf.visible = foam.visible = on; if (!on) return;
    foam.scale.set(x1 - x0 - 0.02, 1, 1); foam.position.set((x0 + x1) / 2, level + 0.01, 0.02);
    water.scale.set(x1 - x0 - 0.02, level - y0, D.depth - 0.02); water.position.set((x0 + x1) / 2, (y0 + level) / 2, -D.depth / 2);
    surf.scale.set(x1 - x0 - 0.02, 1, D.depth - 0.02); surf.position.set((x0 + x1) / 2, level, -D.depth / 2);
    const a = surfGeo.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = surfBase[i * 3], z = surfBase[i * 3 + 2]; a.setY(i, 0.03 * Math.sin(x * 9 + t * 3) * Math.cos(z * 7 + t * 2.3) / Math.max(1, x1 - x0)); }
    a.needsUpdate = true; surfGeo.computeVertexNormals();
  }

  // the boring machine + the train
  const tbm = makeTBM(T.R - 0.03, 1); tbm.g.position.set(-4.5, T.y, T.z); root.add(tbm.g);
  const train = await makeTrain(2); train.g.position.set(40, T.floor + 0.02, T.z); root.add(train.g);

  // holes: the plug (bakery block) region is always cut out of the main face/verge — the plug draws itself there
  const plugRect = { rect: [px0, crown, px1, 0.5] }, plugTop = { rect: [px0, -3.4, px1, 0.1] };
  const setHoles = (shapes) => cut.setHoles([...shapes, plugRect]);
  const setVerge = (shapes) => setVergeHoles([...shapes, plugTop]);
  setHoles([]); setVerge([]);
  return {
    root, cut, rims, setHoles, setVergeHoles: setVerge, aimSun, sun, hemi, cars, plug, bakery, bore, clipFace, trackClip, thirdClip, rings, track, third, thirdMat,
    fans, grates, stn, map, turnstiles, esc, entrance, puddle, drip, pumpG, pump, hose, hoseIdx, shoring, shovel, setWater, tbm, train,
  };
}
