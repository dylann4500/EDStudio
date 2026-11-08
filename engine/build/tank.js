// Farm test-track cutaway + the go-kart that becomes a tank (build genre, video 034 "How a Go-Kart Becomes a Tank").
// Sunny farm, midday. The ground is sliced along the near edge of a dirt test track (z = 0, camera on +z): the cut face
// shows the strata, the MUD PIT at the start (x −2.6…2.6) in section and the CREEK (x 41.6…50.4) in section (its water =
// level ∩ channel). The track runs along x at z = D.TZ. Left → right (x, m): the watermelon target bale (2.6, z −5.4) ·
// mud pit (0) · the goose's fence post · the red barn, cut open at the front (12.5…18.5) · the bump field (24…36, a scarecrow,
// a bullseye bale) · the creek + its little wooden bridge (MLC 3) · the far bank (a fence across the track at 58).
// Behind: a rail fence, a cornfield, a windmill, the farmhouse, a silo, the neighbours' pumpkin patch + PUMPKIN CANNON on a
// hill, rolling hills, a painted sky.
// Props: makeKartTank (one vehicle in stages: kart → tracks → flat/sloped armour → hull gun → turret → turbine → periscopes →
// finishing kit; near hull side + far turret side cut open: driver, turret basket + breech + recoil cylinders, engine bay;
// tracks animate by distance so the links on the ground stay put), makeGoose, makeChicken, makeHorse, makePumpkin,
// makeMelon, makeLemonade, makeMowerEngine, makeBridge (sags, snaps, the halves swing down onto the bed), makeCreekWater,
// makeBarn (tank-shaped holes appear in its end walls), makeScarecrow.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, mk, rng, clamp, lerp } from '../core.js';
import { makeCutFace, maskedPlane, lawnTexture } from './cutaway.js';

const PI = Math.PI;
export const D = {
  face: { x0: -24, x1: 72, y0: -8, y1: 0 },
  TZ: -1.95,                                        // the track's centre line
  track: { z0: -0.04, z1: -3.9 },
  mud: { x0: -2.6, x1: 2.6, z1: -4.1, depth: 0.6 },
  melon: [-3.2, -4.4],                              // the target bale (the melon sits on top)
  post: [3.6, -4.75], postH: 1.05,                  // the goose's fence post
  barn: { x0: 12.5, x1: 18.5, z0: -0.3, z1: -8.2, eave: 3.6, ridge: 6.3 },
  bumps: { x0: 24, x1: 36, h: 0.3, p: 2.0 },
  scare: [31.8, -4.45], bull: [39.8, -5.7], cloud: [31, 13, -18],
  creek: { xl: 41.6, xr: 50.4, bl: 43.4, br: 48.6, bed: -1.75, level: -0.5, depth: 40 },
  bridge: { x0: 41.6, x1: 50.4, z0: -0.45, z1: -3.45, y: 0.22 },
  mlc: [40.5, -0.42],
  cannon: [24, -40],
  endFence: 57.6, t2: [26.2, -7.2],   // the recoil demo's target bale
};
export const bumpH = (x) => { const B = D.bumps; return x < B.x0 || x > B.x1 ? 0 : B.h * Math.sin(PI * (x - B.x0) / B.p) ** 2; };
/** Ground height under (x) on the track line: bumps, the creek's banks + bed. */
export function groundY(x) {
  const C = D.creek;
  if (x > C.xl && x < C.xr) { if (x < C.bl) return lerp(0, C.bed, (x - C.xl) / (C.bl - C.xl)); if (x > C.br) return lerp(C.bed, 0, (x - C.br) / (C.xr - C.br)); return C.bed; }
  return bumpH(x);
}

const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
const steel = (c = 0x9aa3a8, r = 0.45, m = 0.55) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const SECTION = new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.7, metalness: 0.2 });   // cut steel edges
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const signTex = (text, { w = 512, h = 160, bg = '#c0392b', fg = '#fff', px = 96, border = null, round = false } = {}) => tex(w, h, (g) => {
  g.clearRect(0, 0, w, h);
  if (round) { g.fillStyle = bg; g.beginPath(); g.arc(w / 2, h / 2, Math.min(w, h) / 2 - 4, 0, 7); g.fill(); if (border) { g.strokeStyle = border; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, h / 2, Math.min(w, h) / 2 - 12, 0, 7); g.stroke(); } }
  else { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); } }
  let s = px; g.font = font(s); while (g.measureText(text).width > w * 0.84 && s > 20) { s -= 4; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + s * 0.06);
});
/** A box between two points (beams, rails, struts). */
function beam(parent, a, b, w, h, m) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); const o = mk(new THREE.BoxGeometry(L, h, w), m, parent, 0, 0, 0); o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), B.clone().sub(A).normalize()); return o; }

// ---------------------------------------------------------------- the ground in section
function paintFarm(g, P) {
  const { x0, x1 } = D.face, wave = (x, k) => 0.06 * Math.sin(x * 0.7 + k) + 0.04 * Math.sin(x * 2.1 + 2 * k);
  const layers = [[0.0, '#4a3020'], [-0.38, '#6e4a2c'], [-1.1, '#9a6a3c'], [-2.3, '#b8925e'], [-3.5, '#8a857c']];
  layers.forEach(([top, col], i) => { g.fillStyle = col; g.beginPath(); g.moveTo(P.x(x0), P.y(top + (i ? wave(x0, i) : 0))); for (let x = x0; x <= x1; x += 0.25) g.lineTo(P.x(x), P.y(top + (i ? wave(x, i) : 0))); g.lineTo(P.x(x1), P.H); g.lineTo(P.x(x0), P.H); g.closePath(); g.fill(); });
  const R = rng(34);
  const blot = (yT, yB, cols, n, rx, ry) => { for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = yB + R() * (yT - yB); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(rx * (0.5 + R())), P.s(ry * (0.5 + R())), 0, 0, 7); g.fill(); } };
  blot(-0.05, -0.38, ['rgba(20,12,6,.25)', 'rgba(110,72,44,.2)'], 300, 0.5, 0.04);
  blot(-0.4, -1.1, ['rgba(60,36,18,.2)', 'rgba(160,110,70,.18)'], 340, 0.7, 0.05);
  blot(-1.1, -2.3, ['rgba(130,70,30,.2)', 'rgba(210,150,95,.16)'], 480, 0.9, 0.06);
  blot(-2.3, -3.5, ['rgba(150,120,80,.2)', 'rgba(220,196,150,.18)'], 480, 1.0, 0.07);
  blot(-3.5, -8, ['rgba(100,96,90,.25)', 'rgba(170,166,158,.2)'], 340, 1.2, 0.12);
  for (let i = 0; i < 30000; i++) { const x = x0 + R() * (x1 - x0), y = -0.05 - R() * 7.9, L = 0.025 + R() * 0.06; g.strokeStyle = R() < 0.55 ? `rgba(50,30,16,${0.1 + R() * 0.15})` : `rgba(255,224,176,${0.05 + R() * 0.1})`; g.lineWidth = P.s(0.008 + R() * 0.01); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.lineTo(P.x(x + (R() - 0.5) * 0.03), P.y(y - L)); g.stroke(); }
  const pebble = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(r), P.s(r * 0.7), R() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(P.x(x - r * 0.25), P.y(y + r * 0.2), P.s(r * 0.35), P.s(r * 0.2), 0, 0, 7); g.fill(); };
  for (let i = 0; i < 600; i++) pebble(x0 + R() * (x1 - x0), -0.6 - R() * 4.3, 0.03 + R() * 0.07, ['#8c7a68', '#b2a184', '#6f665c'][i % 3]);
  // grass roots in the topsoil
  for (let i = 0; i < 2600; i++) { const x = x0 + R() * (x1 - x0); g.strokeStyle = `rgba(214,190,140,${0.25 + R() * 0.3})`; g.lineWidth = P.s(0.006); g.beginPath(); g.moveTo(P.x(x), P.y(-0.01)); g.quadraticCurveTo(P.x(x + (R() - 0.5) * 0.06), P.y(-0.08), P.x(x + (R() - 0.5) * 0.1), P.y(-0.08 - R() * 0.16)); g.stroke(); }
  // the mud pit: a wet, glossy pocket in section (the go-kart sinks into it)
  { const M = D.mud; g.fillStyle = '#2f1f14'; g.beginPath(); g.moveTo(P.x(M.x0 - 0.3), P.y(0)); for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(M.x0 - 0.3, M.x1 + 0.3, u); g.lineTo(P.x(x), P.y(-M.depth * Math.sin(PI * u) ** 0.6 - 0.03 * Math.sin(u * 37))); } g.closePath(); g.fill();
    for (let i = 0; i < 160; i++) { const u = R(), x = lerp(M.x0, M.x1, u), y = -R() * M.depth * Math.sin(PI * u) ** 0.6 * 0.9; g.fillStyle = R() < 0.5 ? 'rgba(90,60,38,.5)' : 'rgba(20,12,8,.5)'; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(0.08 + R() * 0.15), P.s(0.02 + R() * 0.03), 0, 0, 7); g.fill(); }
    for (let i = 0; i < 26; i++) { const x = lerp(M.x0 + 0.3, M.x1 - 0.3, R()), y = -0.05 - R() * 0.35; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(0.015 + R() * 0.02), 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = P.s(0.006); g.beginPath(); g.arc(P.x(x), P.y(y), P.s(0.03), 0, 7); g.stroke(); }   // bubbles
  }
  // a mole tunnel, potatoes + carrots near the top, worms, buried farm junk (easter eggs)
  { const y0 = -0.62; g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(P.x(6), P.y(y0)); for (let x = 6; x <= 11; x += 0.1) g.lineTo(P.x(x), P.y(y0 - 0.12 * Math.sin(x * 1.3))); for (let x = 11; x >= 6; x -= 0.1) g.lineTo(P.x(x), P.y(y0 - 0.12 * Math.sin(x * 1.3) - 0.14)); g.fill();
    g.fillStyle = '#5b5148'; g.beginPath(); g.ellipse(P.x(10.6), P.y(y0 - 0.13), P.s(0.1), P.s(0.06), 0, 0, 7); g.fill(); g.fillStyle = '#f2a0a8'; g.beginPath(); g.arc(P.x(10.7), P.y(y0 - 0.13), P.s(0.015), 0, 7); g.fill(); }
  for (let i = 0; i < 18; i++) { const x = -20 + i * 4.6 + R() * 2; if (x > -3 && x < 3 || x > 41 && x < 51) continue; g.fillStyle = '#b8864e'; g.beginPath(); g.ellipse(P.x(x), P.y(-0.25 - R() * 0.1), P.s(0.07), P.s(0.05), R(), 0, 7); g.fill(); }
  for (const x of [-15.5, 22.3, 61.5]) { g.fillStyle = '#f08a2b'; g.beginPath(); g.moveTo(P.x(x - 0.04), P.y(-0.05)); g.lineTo(P.x(x + 0.04), P.y(-0.05)); g.lineTo(P.x(x), P.y(-0.42)); g.fill(); g.fillStyle = '#4fae3c'; g.fillRect(P.x(x - 0.04), P.y(0), P.s(0.08), P.s(0.05)); }
  for (let i = 0; i < 14; i++) { const x = x0 + R() * (x1 - x0), y = -0.3 - R() * 0.8; g.strokeStyle = '#d98a8a'; g.lineWidth = P.s(0.018); g.lineCap = 'round'; g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.bezierCurveTo(P.x(x + 0.05), P.y(y + 0.05), P.x(x + 0.1), P.y(y - 0.05), P.x(x + 0.16), P.y(y)); g.stroke(); }
  g.save(); g.translate(P.x(-9.5), P.y(-1.6)); g.rotate(0.3); g.strokeStyle = '#8b8f94'; g.lineWidth = P.s(0.05); g.beginPath(); g.arc(0, 0, P.s(0.13), 0.35 * PI, 2.65 * PI); g.stroke(); g.restore();   // a horseshoe
  g.save(); g.translate(P.x(27.5), P.y(-2.2)); g.fillStyle = '#2b2b2b'; g.beginPath(); g.arc(0, 0, P.s(0.22), 0, 7); g.fill(); g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(0, 0, P.s(0.1), 0, 7); g.fill(); g.restore();   // an old go-kart tyre
  g.save(); g.translate(P.x(64), P.y(-2.9)); const s = P.ppm / 100; g.scale(s, s); g.strokeStyle = '#efe6d2'; g.lineWidth = 5; g.lineCap = 'round';   // a fossil goose (they were always like this)
  g.beginPath(); g.ellipse(0, 0, 40, 22, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(34, -10); g.quadraticCurveTo(52, -40, 46, -64); g.stroke(); g.beginPath(); g.moveTo(46, -64); g.lineTo(70, -60); g.stroke(); for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 12, -20); g.lineTo(k * 12, 20); g.stroke(); } g.beginPath(); g.moveTo(-10, 20); g.lineTo(-14, 44); g.moveTo(10, 20); g.lineTo(14, 44); g.stroke(); g.restore();
}

// ---------------------------------------------------------------- the vehicle: a go-kart that becomes a tank
/** Convex hull loop around circles (track path), CCW in the x–y plane; returns { pts, L, at(u) → {x, y, a} }. */
function trackLoop(circles) {
  const P = [];
  for (const [x, y, r] of circles) for (let k = 0; k < 64; k++) { const a = (k / 64) * PI * 2; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const hull = lo.slice(0, -1).concat(up.slice(0, -1));
  const cum = [0]; for (let i = 0; i < hull.length; i++) { const a = hull[i], b = hull[(i + 1) % hull.length]; cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[cum.length - 1];
  return {
    L,
    at(s) { s = ((s % L) + L) % L; let i = 0; while (cum[i + 1] < s) i++; const a = hull[i], b = hull[(i + 1) % hull.length], f = (s - cum[i]) / (cum[i + 1] - cum[i] || 1); return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), a: Math.atan2(b[1] - a[1], b[0] - a[0]) }; },
  };
}

export function makeMowerEngine() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.42, 0.34, 0.36, 3, 0.05), std(0xd8382c, 0.5), g, 0, 0.17, 0);
  mk(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 18), steel(0x3b3d40, 0.5, 0.4), g, 0.02, 0.39, 0);   // the pull-start
  mk(new THREE.TorusGeometry(0.05, 0.012, 6, 12), steel(0x222222, 0.5, 0.2), g, 0.02, 0.46, 0.0).rotation.x = PI / 2;
  mk(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 10), steel(0x8b9196, 0.4, 0.7), g, -0.25, 0.25, 0.08).rotation.z = PI / 2.4;   // muffler
  const lb = mk(new THREE.PlaneGeometry(0.36, 0.11), new THREE.MeshStandardMaterial({ map: signTex('MOW-MASTER', { w: 384, h: 112, bg: '#f2e7c9', fg: '#2a2a2a', px: 64 }), roughness: 0.6 }), g, 0, 0.19, 0.182);
  lb.castShadow = false;
  return { g };
}

export function makeKartTank() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const red = std(0xd63a2b, 0.45), black = std(0x222326, 0.6), tyre = std(0x1d1d1f, 0.85), olive = std(0x6f7a3e, 0.62, { metalness: 0.15 }), oliveD = std(0x58622f, 0.68, { metalness: 0.15 });
  const inner = std(0xd9d6c4, 0.75), floorM = std(0x4a4d47, 0.8), linkM = steel(0x56585b, 0.55, 0.6), wheelM = steel(0x6d7072, 0.5, 0.5), hubM = steel(0x9aa0a4, 0.35, 0.7);
  // --- the go-kart: tube frame, 4 wheels, seat, steering wheel, bumper, number plate
  const kart = new THREE.Group(); body.add(kart);
  const tube = (a, b) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); const m = mk(new THREE.CylinderGeometry(0.025, 0.025, L, 10), red, kart, 0, 0, 0); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; };
  for (const z of [-0.36, 0.36]) tube([-0.8, 0.13, z], [0.85, 0.13, z * 0.8]);
  tube([-0.8, 0.13, -0.36], [-0.8, 0.13, 0.36]); tube([0.85, 0.13, -0.29], [0.85, 0.13, 0.29]); tube([0.2, 0.13, -0.33], [0.2, 0.13, 0.33]);
  tube([0.95, 0.12, -0.42], [0.95, 0.12, 0.42]); tube([0.85, 0.13, 0.29], [0.95, 0.12, 0.42]); tube([0.85, 0.13, -0.29], [0.95, 0.12, -0.42]);   // front bumper
  mk(new THREE.BoxGeometry(1.5, 0.02, 0.62), std(0x2b2d31, 0.7), kart, 0.0, 0.11, 0);   // floor pan
  const seat = new THREE.Group(); kart.add(seat); seat.position.set(-0.22, 0.17, 0);
  mk(new RoundedBoxGeometry(0.42, 0.08, 0.42, 3, 0.03), std(0x26282c, 0.55), seat, 0, 0.04, 0);
  const sb = mk(new RoundedBoxGeometry(0.08, 0.42, 0.42, 3, 0.03), std(0x26282c, 0.55), seat, -0.24, 0.24, 0); sb.rotation.z = 0.22;
  const column = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8), steel(0x8b9196), kart, 0.36, 0.3, 0); column.rotation.z = 0.95;
  const wheel = new THREE.Group(); kart.add(wheel); wheel.position.set(0.22, 0.46, 0); wheel.rotation.z = 0.95 - PI / 2;
  mk(new THREE.TorusGeometry(0.13, 0.02, 8, 24), black, wheel).rotation.y = PI / 2; mk(new THREE.BoxGeometry(0.02, 0.24, 0.025), black, wheel);
  const numPlate = mk(new THREE.PlaneGeometry(0.34, 0.18), new THREE.MeshStandardMaterial({ map: signTex('34', { w: 256, h: 136, bg: '#ffd23f', fg: '#1b1b1b', px: 110 }), roughness: 0.6 }), kart, 0.97, 0.22, 0); numPlate.rotation.y = PI / 2;
  const kWheels = [];
  for (const [x, z] of [[-0.62, -0.46], [-0.62, 0.46], [0.66, -0.42], [0.66, 0.42]]) { const w = new THREE.Group(); kart.add(w); w.position.set(x, 0.14, z); const r = x < 0 ? 0.15 : 0.13; mk(new THREE.CylinderGeometry(r, r, x < 0 ? 0.17 : 0.12, 22), tyre, w).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(r * 0.55, r * 0.55, (x < 0 ? 0.17 : 0.12) + 0.01, 14), hubM, w).rotation.x = PI / 2; w.userData.r = r; kWheels.push(w); }
  // --- the tracks: idler (front), sprocket (rear), 5 road wheels, 2 return rollers; links instanced along the loop
  const TW = 0.5, TZs = [-0.98, 0.98];
  const loop = trackLoop([[2.05, 0.42, 0.33], [-2.05, 0.46, 0.33], ...[-1.5, -0.75, 0, 0.75, 1.5].map((x) => [x, 0.265, 0.27]), [-1.0, 0.685, 0.095], [1.0, 0.685, 0.095]]);
  const NL = Math.round(loop.L / 0.16), pitch = loop.L / NL;
  const linkG = new THREE.BoxGeometry(pitch * 0.92, 0.05, TW); const gr = new THREE.BoxGeometry(0.035, 0.035, TW * 0.92); gr.translate(0, -0.035, 0);
  const tracks = TZs.map((z) => {
    const grp = new THREE.Group(); body.add(grp); grp.position.z = z;
    const links = new THREE.InstancedMesh(linkG, linkM, NL), grous = new THREE.InstancedMesh(gr, linkM, NL); links.castShadow = grous.castShadow = true; links.receiveShadow = true; links.frustumCulled = grous.frustumCulled = false; grp.add(links, grous);
    const wheels = [];
    const addW = (x, y, r, m = wheelM) => { const w = new THREE.Group(); grp.add(w); w.position.set(x, y, 0); mk(new THREE.CylinderGeometry(r, r, TW * 0.8, 24), m, w).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(r * 0.5, r * 0.5, TW * 0.82, 14), hubM, w).rotation.x = PI / 2; for (let k = 0; k < 5; k++) { const b = mk(new THREE.BoxGeometry(r * 0.12, r * 0.12, TW * 0.84), black, w, Math.cos(k * 1.257) * r * 0.32, Math.sin(k * 1.257) * r * 0.32, 0); b.castShadow = false; } w.userData.r = r; wheels.push(w); return w; };
    addW(2.05, 0.42, 0.28); const spr = addW(-2.05, 0.46, 0.3, steel(0x4a4c4e, 0.5, 0.6));
    for (let k = 0; k < 10; k++) { const a = (k / 10) * PI * 2; const tth = mk(new THREE.BoxGeometry(0.08, 0.07, TW * 0.5), steel(0x3a3c3e, 0.5, 0.6), spr, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0); tth.rotation.z = a; }
    for (const x of [-1.5, -0.75, 0, 0.75, 1.5]) addW(x, 0.265, 0.24);
    for (const x of [-1.0, 1.0]) addW(x, 0.685, 0.07);
    return { grp, links, grous, wheels };
  });
  const deck = mk(new THREE.BoxGeometry(4.1, 0.1, 1.46), oliveD, body, 0, 0.62, 0);   // the deck the kart rides on, between the tracks
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const zero = new THREE.Vector3(0.0001, 0.0001, 0.0001);
  /** k: 0..1 the whole kit; build: [far, near] 0..1 = how much of each chain is wrapped on (links appear along the loop, wheels pop as it reaches them) */
  function setTracks(sFar, sNear, k = 1, build = [1, 1]) {
    [sFar, sNear].forEach((s, i) => {
      const T = tracks[i], b = clamp(build[i]); T.grp.visible = k > 0.01 && b > 0.001; if (!T.grp.visible) return;
      T.grp.scale.set(1, 1, 1);
      for (let j = 0; j < NL; j++) { const p = loop.at(j * pitch - s), on = j / NL < b; e.set(0, 0, p.a); q.setFromEuler(e); v.set(p.x, p.y, 0); m4.compose(v, q, on ? one : zero); T.links.setMatrixAt(j, m4); T.grous.setMatrixAt(j, m4); }
      T.wheels.forEach((w, wi) => { const f = clamp((b - (wi / T.wheels.length) * 0.8) / 0.2); w.scale.setScalar(Math.max(0.01, f < 1 ? 1 + 1.6 * (1 - f) * f : 1) * (f > 0 ? 1 : 0.01)); });
      T.links.instanceMatrix.needsUpdate = T.grous.instanceMatrix.needsUpdate = true;
      for (const w of T.wheels) w.rotation.z = -s / w.userData.r;
    });
    deck.visible = k > 0.6; deck.scale.set(1, 1, 1);
  }

  // --- the hull: flat plates first, then the glacis tilts back 60°; near side (+z) cut open over the driver, turret basket, engine bay
  const hull = new THREE.Group(); body.add(hull);
  // lower hull between the tracks (y 0.42…0.84, z ±0.72) + sponsons over the tracks (y 0.84…1.45, z ±1.32): the window never shows a track
  const HYL = 0.42, HY0 = 0.84, HY1 = 1.45, HX0 = -2.45, HXF = 2.85, GY0 = 0.55, HZ = 1.32, HZL = 0.72, T = 0.06;
  const plate = (w, h, d, x, y, z, m = olive) => mk(new THREE.BoxGeometry(w, h, d), m, hull, x, y, z);
  const P = {};
  const HXS = 1.29;   // the side plates end where the glacis meets the roof (else they poke through the tilted plate)
  P.far = plate(HXS - HX0, HY1 - HY0, T, (HX0 + HXS) / 2, (HY0 + HY1) / 2, -HZ);
  P.lowF = plate(4.4, HY0 - HYL, T, (HX0 + 1.95) / 2, (HYL + HY0) / 2, -HZL, oliveD); P.lowN = plate(4.4, HY0 - HYL, T, (HX0 + 1.95) / 2, (HYL + HY0) / 2, HZL, oliveD); P.lowN.visible = false;   // cut away (the near track is in front of it anyway)
  P.belly = plate(4.4, T, HZL * 2, (HX0 + 1.95) / 2, HYL, 0, oliveD);
  P.spon = [-1, 1].map((s) => plate(4.9, T, HZ - HZL, (HX0 + 2.45) / 2, HY0, s * (HZ + HZL) / 2, oliveD));   // sponson floors over each track
  P.rear = plate(T, HY1 - HYL, HZ * 2, HX0, (HYL + HY1) / 2, 0);
  // the near side: a frame around the window (sill, top rail, rear post), cut edges in SECTION colour
  P.nearB = plate(HXS - HX0, 0.07, T, (HX0 + HXS) / 2, HY0 + 0.035, HZ); P.nearT = plate(HXS - HX0, 0.07, T, (HX0 + HXS) / 2, HY1 - 0.035, HZ);
  P.nearR = plate(0.14, HY1 - HY0, T, HX0 + 0.07, (HY0 + HY1) / 2, HZ);
  P.sec = [HY0 + 0.07, HY1 - 0.07].map((y) => mk(new THREE.BoxGeometry(HXS - HX0 - 0.14, 0.025, T + 0.01), SECTION, hull, (HX0 + 0.14 + HXS) / 2, y, HZ));
  P.secF = mk(new THREE.BoxGeometry(0.03, HY1 - HY0, T + 0.01), SECTION, hull, HXS, (HY0 + HY1) / 2, HZ);
  // the front wedge on each side: a quad whose front edge follows the glacis as it tilts
  const wedgeGeo = (zz) => { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3)); gg.setIndex([0, 1, 2, 0, 2, 3, 0, 2, 1, 0, 3, 2]); gg.userData.z = zz; return gg; };
  const wedges = [-HZ, HZ].map((zz) => { const m = new THREE.Mesh(wedgeGeo(zz), new THREE.MeshStandardMaterial({ color: 0x6f7a3e, roughness: 0.62, metalness: 0.15, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; hull.add(m); return m; });
  // roof (main + the front strip that vanishes as the glacis tilts), hatch hole at x 1.0, the hatch lid
  P.roof = plate(1.29 + 1.2, T, HZ * 2, (1.29 - 1.2) / 2, HY1, 0);
  const engDeck = new THREE.Group(); hull.add(engDeck); engDeck.position.set(-1.2, HY1, -HZ);   // hinged along its far edge
  mk(new THREE.BoxGeometry(HX0 * -1 - 1.2, T, HZ * 2), olive, engDeck, -(-HX0 - 1.2) / 2, 0, HZ);
  P.roofF = plate(1, T, HZ * 2, 2, HY1, 0);
  const hatchHole = mk(new THREE.CylinderGeometry(0.27, 0.27, T + 0.02, 24), std(0x1b1c1a, 0.8), hull, 1.0, HY1 + 0.002, 0); hatchHole.scale.y = 0.4;
  const hatch = new THREE.Group(); hull.add(hatch); hatch.position.set(0.72, HY1 + 0.03, 0);   // hinged at its rear edge
  mk(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), olive, hatch, 0.28, 0, 0); mk(new THREE.BoxGeometry(0.16, 0.04, 0.04), steel(0x3b3d40), hatch, 0.28, 0.05, 0);
  // the glacis: hinged at its bottom front edge (x HXF, y GY0); length (HY1 − GY0)/cos(a) so its top always meets the roof line
  const glacis = new THREE.Group(); hull.add(glacis); glacis.position.set(HXF, GY0, 0);
  const gl = mk(new THREE.BoxGeometry(T * 1.4, 1, HZ * 2 + 0.02), olive, glacis, 0, 0.5, 0);
  const splats = new THREE.Group(); glacis.add(splats);   // pumpkin goo stuck to the flat plate (it tilts with it)
  const dents = [];
  for (let k = 0; k < 3; k++) { const d = mk(new THREE.SphereGeometry(0.12, 14, 8), std(0x5d6732, 0.7), glacis, 0.03, 0.3 + k * 0.22, -0.6 + k * 0.6); d.scale.set(0.25, 1, 1); d.visible = false; dents.push(d); }
  // the far-side skirt over the upper track run
  P.skirt = plate(4.7, 0.3, 0.04, -0.05, 0.69, -HZ - 0.02, oliveD);
  // interior: floor, far wall paint, the driver's seat (the kart seat stays: it IS the driver's seat), engine bay bulkhead, ammo rack
  const interior = new THREE.Group(); hull.add(interior);
  mk(new THREE.BoxGeometry(4.3, 0.02, HZL * 2 - 0.06), floorM, interior, -0.2, HYL + 0.04, 0);
  mk(new THREE.PlaneGeometry(4.3, HY1 - HY0 - 0.06), inner, interior, -0.2, (HY0 + HY1) / 2, -HZ + 0.04);
  mk(new THREE.PlaneGeometry(4.3, HY0 - HYL), std(0xc9c6b4, 0.75), interior, -0.2, (HYL + HY0) / 2, -HZL + 0.04);
  mk(new THREE.BoxGeometry(0.05, HY1 - HYL - 0.06, HZ * 2 - 0.1), std(0xbfbcab, 0.75), interior, -1.2, (HYL + HY1) / 2, 0);   // engine-bay firewall
  for (let k = 0; k < 6; k++) { const c = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12), std(k % 2 ? 0xc9a24a : 0xb08a3a, 0.4, { metalness: 0.5 }), interior, -0.95 + (k % 3) * 0.14, HY0 + 0.12 + Math.floor(k / 3) * 0.14, -HZ + 0.26); c.rotation.x = PI / 2; }   // the shells' rack (brass caps)
  const gauges = []; for (let k = 0; k < 3; k++) { const gg = new THREE.Group(); interior.add(gg); gg.position.set(1.18, 1.2, -0.95 + k * 0.32); gg.rotation.y = -0.5; mk(new THREE.CircleGeometry(0.07, 18), std(0xf4f0e4, 0.5), gg); mk(new THREE.RingGeometry(0.07, 0.085, 18), std(0x2b2b2b, 0.5), gg); const n = mk(new THREE.BoxGeometry(0.008, 0.055, 0.005), std(0xd42a22, 0.5), gg, 0, 0.0, 0.005); n.geometry.translate(0, 0.0275, 0); gauges.push(n); }
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 14), std(0xd42a22, 0.45), interior, 0.3, HY0 + 0.25, -HZ + 0.15);   // fire extinguisher
  for (let k = 0; k < 4; k++) beam(interior, [-1.1, HY1 - 0.08 - k * 0.04, -HZ + 0.07], [1.25, HY1 - 0.08 - k * 0.04, -HZ + 0.07], 0.025, 0.025, std([0x2f6fd6, 0xd42a22, 0xffc21a, 0x2b2b2b][k], 0.5));   // cable runs
  const mapP = mk(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshStandardMaterial({ map: signTex('NO GEESE', { w: 256, h: 180, bg: '#fff3c4', fg: '#c0392b', px: 60, border: '#c0392b' }), roughness: 0.6 }), interior, 0.75, 1.12, -HZ + 0.06); mapP.castShadow = false;
  const bay = mk(new THREE.PlaneGeometry(1.15, HY1 - HYL - 0.06), new THREE.MeshStandardMaterial({ color: 0x3b3e42, roughness: 0.6, metalness: 0.3, emissive: 0x5a2a08, emissiveIntensity: 0.35 }), interior, -1.83, (HYL + HY1) / 2, -HZ + 0.05);   // the engine bay: dark gunmetal, a warm glow
  mk(new THREE.PlaneGeometry(0.85, HY1 - HYL - 0.06), std(0x6f8fb0, 0.6, { metalness: 0.2 }), interior, 0.85, (HYL + HY1) / 2, -HZ + 0.05);   // the driver's bay: blue steel
  mk(new THREE.BoxGeometry(1.15, 0.02, HZ * 2 - 0.12), std(0x2b2d30, 0.7), interior, -1.83, HYL + 0.05, 0);
  // --- the hull gun (bolted on the front plate before the turret) and the turret (ring, basket, shell cut open on its local −z side)
  const hullGun = new THREE.Group(); hull.add(hullGun); hullGun.position.set(1.95, 1.35, 0);
  mk(new THREE.BoxGeometry(0.5, 0.3, 0.5), olive, hullGun, 0, 0.05, 0); const hgB = mk(new THREE.CylinderGeometry(0.07, 0.08, 2.0, 16), steel(0x4b5230, 0.5, 0.4), hullGun, 1.15, 0.08, 0); hgB.rotation.z = -PI / 2;
  const tur = new THREE.Group(); body.add(tur); tur.position.set(-0.7, HY1, 0);
  const ring = mk(new THREE.TorusGeometry(0.86, 0.05, 10, 48), steel(0xc2c6c8, 0.3, 0.8), tur, 0, 0.0, 0); ring.rotation.x = PI / 2;
  const ringTeeth = mk(new THREE.TorusGeometry(0.8, 0.03, 6, 72), steel(0x8a8f92, 0.4, 0.7), tur, 0, -0.04, 0); ringTeeth.rotation.x = PI / 2;
  const basket = new THREE.Group(); tur.add(basket); { const bm = steel(0xb8bec4, 0.35, 0.7); for (let k = 0; k < 14; k++) { const a = (k / 14) * PI * 2; mk(new THREE.CylinderGeometry(0.018, 0.018, 0.78, 6), bm, basket, Math.cos(a) * 0.78, -0.42, Math.sin(a) * 0.78); } const fl = mk(new THREE.TorusGeometry(0.78, 0.025, 6, 40), bm, basket, 0, -0.8, 0); fl.rotation.x = PI / 2; mk(new THREE.CircleGeometry(0.77, 32), std(0x4a4d47, 0.8), basket, 0, -0.8, 0).rotation.x = -PI / 2; }   // the turret basket: a cage that turns with the turret
  const shell = new THREE.Group(); tur.add(shell);
  { const TH = 0.62, roofM = olive;
    // top-view outline (x forward): a wedge nose, straight sides, a bustle at the back
    const out = [[1.05, 0.3], [0.65, 0.9], [-0.85, 0.9], [-1.1, 0.6], [-1.1, -0.6], [-0.85, -0.9], [0.65, -0.9], [1.05, -0.3]];   // corner reach ≤ 1.25 m: clears Gary's head in every yaw
    const shp = new THREE.Shape(out.map(([x, z]) => new THREE.Vector2(x, z)));
    const roof = mk(new THREE.ShapeGeometry(shp), roofM, shell, 0, TH, 0); roof.rotation.x = PI / 2;
    const wall = (a, b, m = olive) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const w = mk(new THREE.BoxGeometry(L, TH, 0.06), m, shell, (a[0] + b[0]) / 2, TH / 2, (a[1] + b[1]) / 2); w.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); return w; };
    for (let i = 0; i < out.length; i++) { const a = out[i], b = out[(i + 1) % out.length]; if (i === 1) continue; wall(a, b); }   // skip the local +z side: the cutaway window (it faces the lens whenever the gun points forward-ish)
    mk(new THREE.BoxGeometry(1.5, 0.05, 0.065), SECTION, shell, -0.1, TH - 0.02, 0.9); mk(new THREE.BoxGeometry(1.5, 0.05, 0.065), SECTION, shell, -0.1, 0.02, 0.9);
    mk(new THREE.PlaneGeometry(2.0, TH - 0.05), std(0x59606a, 0.6), shell, -0.1, TH / 2, -0.84);   // back wall (r2: lighter) : the breech + springs read against it
    const cupola = mk(new THREE.CylinderGeometry(0.26, 0.28, 0.16, 20), olive, shell, -0.55, TH + 0.08, 0.42);
  }
  // the gun: trunnion at the turret front; elevation group → recoil group (barrel + breech slide back together)
  const gunEl = new THREE.Group(); tur.add(gunEl); gunEl.position.set(0.95, 0.38, 0);
  const recoil = new THREE.Group(); gunEl.add(recoil);
  mk(new RoundedBoxGeometry(0.42, 0.42, 0.62, 3, 0.06), oliveD, gunEl, 0.05, 0, 0);   // the mantlet (stays put)
  const barrel = mk(new THREE.CylinderGeometry(0.075, 0.09, 3.1, 20), steel(0x5c6436, 0.5, 0.35), recoil, 1.7, 0, 0); barrel.rotation.z = -PI / 2;
  mk(new THREE.CylinderGeometry(0.115, 0.115, 0.5, 20), steel(0x5c6436, 0.5, 0.35), recoil, 1.6, 0, 0).rotation.z = -PI / 2;   // fume extractor
  mk(new THREE.CylinderGeometry(0.1, 0.09, 0.14, 20), steel(0x3e4422, 0.5, 0.35), recoil, 3.2, 0, 0).rotation.z = -PI / 2;
  const muzzle = new THREE.Object3D(); recoil.add(muzzle); muzzle.position.set(3.3, 0, 0);
  const glassSpot = new THREE.Object3D(); recoil.add(glassSpot); glassSpot.position.set(2.25, 0.085, 0);
  const breech = mk(new THREE.BoxGeometry(0.62, 0.3, 0.32), steel(0x6c7072, 0.4, 0.7), recoil, -0.42, 0, 0);
  const cyl = [], springs = [], springM = new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.35, metalness: 0.3, emissive: 0x6a4a00, emissiveIntensity: 0.25 });
  // the recoil springs (r2: big + inside the turret window, x −0.95…−0.25 = turret x 0…0.7): fixed rear plate on the cradle, front collar on
  // the recoil group, so the coils squash as the barrel comes back
  const SP0 = -0.95, SPL = 0.7, SPY = -0.13;   // below the barrel axis and the window's top rail
  for (const z of [-0.3, 0.3]) { const c = mk(new THREE.CylinderGeometry(0.075, 0.075, 0.62, 18), steel(0xc9ced2, 0.25, 0.85), gunEl, -0.64, SPY, z); c.rotation.z = PI / 2; const rod = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 10), steel(0xeeeeee, 0.2, 0.9), recoil, -0.05, SPY, z); rod.rotation.z = PI / 2; cyl.push(c);
    mk(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 20), steel(0x2c3034, 0.5, 0.5), gunEl, SP0 - 0.02, SPY, z).rotation.z = PI / 2;   // rear plate
    mk(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 20), steel(0x2c3034, 0.5, 0.5), recoil, SP0 + SPL + 0.025, SPY, z).rotation.z = PI / 2;   // front collar (slides with the barrel)
    const pts = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * PI * 2 * 6; pts.push(new THREE.Vector3(k / 160 * SPL, Math.cos(a) * 0.125, Math.sin(a) * 0.125)); }
    const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.03, 8), springM); sp.position.set(SP0, SPY, z); gunEl.add(sp); springs.push(sp); }
  const gyro = new THREE.Group(); tur.add(gyro); gyro.position.set(-0.47, 0.31, 0.12); gyro.userData.k = 1.15;   // the stabilizer's gyro (seen through the window; r2: bigger + nearer the window, clear of the springs at x ≥ 0)
  const gyroDisc = mk(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.3, metalness: 0.6, emissive: 0x7a4a00, emissiveIntensity: 0.5 }), gyro); gyroDisc.rotation.x = PI / 2; for (let k = 0; k < 6; k++) { const sp = mk(new THREE.BoxGeometry(0.36, 0.03, 0.065), std(0xd42a22, 0.4), gyro, 0, 0, 0.0); sp.rotation.z = k * PI / 6; } mk(new THREE.TorusGeometry(0.26, 0.016, 6, 32), steel(0xc9ced2, 0.3, 0.8), gyro); const gyroRing2 = mk(new THREE.TorusGeometry(0.26, 0.016, 6, 32), steel(0xc9ced2, 0.3, 0.8), gyro); gyroRing2.rotation.y = PI / 2;
  // finishing kit: periscopes, antenna, smoke launchers, cup holder + cup, horn
  const peris = []; for (const [x, z] of [[1.05, -0.5], [1.18, 0], [1.22, 0.55]]) { const p = new THREE.Group(); hull.add(p); p.position.set(x, HY1, z); mk(new THREE.BoxGeometry(0.17, 0.36, 0.15), oliveD, p, 0, 0.18, 0); mk(new THREE.BoxGeometry(0.19, 0.04, 0.17), std(0xffc21a, 0.4), p, 0, 0.37, 0); const gls = mk(new THREE.PlaneGeometry(0.13, 0.12), new THREE.MeshStandardMaterial({ color: 0x8fd8ff, roughness: 0.05, metalness: 0.3, emissive: 0x2d7ab0, emissiveIntensity: 0.6 }), p, 0.087, 0.27, 0); gls.rotation.y = PI / 2; mk(new THREE.BoxGeometry(0.11, 0.2, 0.11), oliveD, p, 0, -0.1, 0); mk(new THREE.BoxGeometry(0.16, 0.12, 0.14), std(0x2b2d30, 0.6), p, -0.02, -0.25, 0); const eye = mk(new THREE.PlaneGeometry(0.09, 0.07), new THREE.MeshStandardMaterial({ color: 0x8fd8ff, roughness: 0.05, emissive: 0x2d7ab0, emissiveIntensity: 0.7 }), p, -0.101, -0.26, 0); eye.rotation.y = -PI / 2; p.scale.setScalar(0.01); peris.push(p); }   // tall mirror tubes, yellow caps (they must read from 5 m); r2: + an eyepiece under the roof (Gary looks out)
  const antenna = new THREE.Group(); tur.add(antenna); antenna.position.set(-0.95, 0.62, -0.45); mk(new THREE.CylinderGeometry(0.008, 0.014, 1.7, 6), std(0x1d1d1f, 0.5), antenna, 0, 0.85, 0); mk(new THREE.SphereGeometry(0.025, 8, 6), std(0xd42a22, 0.5), antenna, 0, 1.7, 0);
  const smokeL = []; for (const s of [-1, 1]) { const gg = new THREE.Group(); tur.add(gg); gg.position.set(0.55, 0.42, s * 0.9); gg.rotation.y = s * 0.5; for (let k = 0; k < 4; k++) { const c = mk(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 10), oliveD, gg, 0.05 * (k % 2), 0.06 * Math.floor(k / 2), 0.1 * (k % 2) - 0.05); c.rotation.z = -1.1; } gg.scale.setScalar(0.01); smokeL.push(gg); }
  const cup = new THREE.Group(); hull.add(cup); cup.position.set(0.42, 1.22, 1.46);   // r4: on the near side plate beside the hatch (on the turret it sat off-frame on "cup holder")
  mk(new THREE.TorusGeometry(0.16, 0.02, 8, 24), steel(0x8b9196), cup, 0, 0, 0).rotation.x = PI / 2;
  mk(new THREE.CylinderGeometry(0.15, 0.12, 0.5, 20), std(0xe94b3c, 0.5), cup, 0, 0.2, 0); mk(new THREE.CylinderGeometry(0.155, 0.155, 0.04, 20), std(0xffffff, 0.4), cup, 0, 0.46, 0); const straw = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8), std(0xffffff, 0.4), cup, 0.03, 0.6, 0); straw.rotation.z = 0.25; cup.scale.setScalar(0.01);
  const horn = new THREE.Group(); hull.add(horn); horn.position.set(1.95, 1.25, 1.42);   // r2: on the near side plate, clear of the goose on the glacis
  const hornM = steel(0xd9a83a, 0.25, 0.85); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), hornM, horn, -0.1, 0.04, 0).rotation.z = PI / 2; mk(new THREE.ConeGeometry(0.12, 0.2, 18, 1, true), hornM, horn, 0.12, 0.04, 0).rotation.z = PI / 2; mk(new THREE.SphereGeometry(0.06, 12, 10), std(0x1b1b1b, 0.6), horn, -0.3, 0.04, 0); horn.scale.setScalar(0.01);
  // turbine (replaces the mower engine in the bay): housing + spinning compressor face + recuperator; exhaust grille in the rear plate
  const turbine = new THREE.Group(); hull.add(turbine); turbine.position.set(-1.85, 0.98, 0.1); turbine.rotation.y = -PI / 2;   // r4: axis across the hull, intake fan facing the lens (side-on it read as a box)
  const tbHouse = mk(new THREE.CylinderGeometry(0.3, 0.34, 0.85, 28, 1, true, PI / 2, PI), steel(0xc9ccce, 0.25, 0.85), turbine, 0, 0, 0); tbHouse.rotation.z = PI / 2; tbHouse.material.side = THREE.DoubleSide;   // cut open on the lens side: the blades show
  const fan = new THREE.Group(); turbine.add(fan); fan.position.set(0.3, 0, 0);
  const rotor = new THREE.Group(); turbine.add(rotor);   // three compressor/turbine stages on one shaft, seen in section
  mk(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 10), steel(0x8a9096, 0.3, 0.8), rotor).rotation.z = PI / 2;
  for (const [x, r, c] of [[0.18, 0.26, 0xe8c46a], [0.0, 0.23, 0xd8a43a], [-0.2, 0.2, 0xff8a3a]]) { const st = new THREE.Group(); rotor.add(st); st.position.x = x; for (let k = 0; k < 12; k++) { const bl = mk(new THREE.BoxGeometry(0.025, r, 0.05), steel(c, 0.25, 0.85), st, 0, 0, 0); bl.position.set(0, Math.cos(k * 0.5236) * r / 2, Math.sin(k * 0.5236) * r / 2); bl.rotation.set(k * 0.5236, 0.45, 0); } }
  for (let k = 0; k < 14; k++) { const b = mk(new THREE.BoxGeometry(0.02, 0.27, 0.07), steel(0xe8c46a, 0.2, 0.9), fan, 0, 0.14, 0); b.geometry.translate(0, 0, 0); b.position.set(0, Math.cos(k * 0.449) * 0.14, Math.sin(k * 0.449) * 0.14); b.rotation.x = k * 0.449; b.rotation.y = 0.5; }
  mk(new THREE.SphereGeometry(0.07, 14, 10), steel(0xd8a43a, 0.2, 0.9), fan, 0.02, 0, 0);
  const glowM = new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0, toneMapped: false });
  const burner = mk(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 24, 1, true), glowM, turbine, -0.2, 0, 0); burner.rotation.z = PI / 2;
  const tbLabel = mk(new THREE.PlaneGeometry(0.5, 0.13), new THREE.MeshStandardMaterial({ map: signTex('1,500 HP', { w: 384, h: 100, bg: '#1b1b1b', fg: '#ffd23f', px: 70 }), roughness: 0.5 }), turbine, 0, 0.36, 0); tbLabel.rotation.y = PI / 2; tbLabel.castShadow = false;
  turbine.scale.setScalar(0.01);
  const grille = new THREE.Group(); hull.add(grille); grille.position.set(HX0 - 0.035, 1.05, 0);
  mk(new THREE.BoxGeometry(0.02, 0.5, 1.6), std(0x4a4e52, 0.6, { metalness: 0.4 }), grille); for (let k = 0; k < 7; k++) mk(new THREE.BoxGeometry(0.035, 0.035, 1.6), std(0x8a9096, 0.4, { metalness: 0.6 }), grille, 0.012, -0.21 + k * 0.07, 0);
  const grilleGlow = mk(new THREE.PlaneGeometry(1.5, 0.42), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0, toneMapped: false }), grille, -0.02, 0, 0); grilleGlow.rotation.y = -PI / 2;
  const mower = makeMowerEngine(); hull.add(mower.g); mower.g.position.set(-1.8, HYL + 0.06, 0.2); mower.g.rotation.y = 0;
  // anchors
  const seatAnchor = new THREE.Object3D(); seat.add(seatAnchor); seatAnchor.position.set(0, 0.08, 0);

  const ease = (u, s = 1.8) => { u = clamp(u); return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; };
  const setPop = (o, k) => { const s = Math.max(0.01, k); o.scale.setScalar(s); o.visible = k > 0.01; };
  /** st: { kart 0..1 (wheels visible), tr 0..1 (tracks pop on), plates: [front, sides, roof, rear] 0..1, slope 0..1 (glacis tilts to 60°),
   *  hullGun 0..1, tur 0..1, turYaw, gunEl, rec (m, the barrel slides back), tb 0..1 (turbine pops in), mower 0..1, peri 0..1,
   *  kit: [antenna, smoke, cup, horn] 0..1, hatch 0..1 (open), sink (m), splat 0..1, dents 0..3, glow 0..1 (exhaust), fan (rad) } */
  function setStage(st) {
    const tr = clamp(st.tr ?? 0);
    kart.position.set(lerp(0, 1.22, tr), lerp(0, 0.6, tr), 0);
    for (const w of kWheels) { w.visible = tr < 0.6; w.scale.setScalar(Math.max(0.01, 1 - tr)); }
    const pl = st.plates || [0, 0, 0, 0];
    const fr = ease(pl[0]), sd = ease(pl[1]), rf = ease(pl[2]), rr = ease(pl[3]);
    glacis.visible = fr > 0.01; glacis.position.y = GY0 + (1 - fr) * 1.2;
    const a = (st.slope ?? 0) * (PI / 3), Lg = (HY1 - GY0) / Math.cos(a);
    glacis.rotation.z = a; gl.scale.y = Lg; gl.position.y = Lg / 2;
    for (const o of [P.far, P.nearB, P.nearT, P.nearR, P.skirt, P.lowF, P.belly, ...P.spon, ...P.sec, P.secF]) { o.visible = sd > 0.01; o.scale.y = Math.max(0.01, sd); }
    const xg = (y) => HXF - (y - GY0) * Math.tan(a), xt = xg(HY1);   // the glacis line; the top-front corner of the side wedge
    for (const w of wedges) { w.visible = sd > 0.01; const z = w.geometry.userData.z, A = w.geometry.attributes.position, yb = HY0, yt = lerp(HY0, HY1, sd);
      A.setXYZ(0, HXS, yb, z); A.setXYZ(1, xg(yb), yb, z); A.setXYZ(2, Math.max(HXS, xg(yt)), yt, z); A.setXYZ(3, HXS, yt, z); A.needsUpdate = true; w.geometry.computeVertexNormals(); w.geometry.computeBoundingSphere(); }
    P.roof.visible = P.roofF.visible = hatchHole.visible = hatch.visible = engDeck.visible = rf > 0.01; P.roof.position.y = P.roofF.position.y = engDeck.position.y = HY1 + (1 - rf) * 0.8; engDeck.rotation.x = -(st.deckOpen ?? 0) * 1.9;
    P.roofF.scale.x = Math.max(0.01, xt - 1.29); P.roofF.position.x = (1.29 + xt) / 2; P.roofF.visible = rf > 0.01 && xt - 1.29 > 0.02;
    P.rear.visible = grille.visible = rr > 0.01; P.rear.scale.y = Math.max(0.01, rr);
    interior.visible = sd > 0.5;
    hatch.rotation.z = (st.hatch ?? 1) * 1.9;
    setPop(hullGun, ease(st.hullGun ?? 0));
    const tu = ease(st.tur ?? 0, 2); tur.visible = tu > 0.01; tur.scale.setScalar(Math.max(0.01, tu)); tur.position.y = HY1 + (1 - clamp(st.tur ?? 0)) * 1.5;
    tur.rotation.y = st.turYaw ?? 0; gunEl.rotation.z = st.gunEl ?? 0; recoil.position.x = -(st.rec ?? 0);
    for (const sp of springs) { sp.scale.x = Math.max(0.2, (SPL - (st.rec ?? 0)) / SPL); } springM.emissiveIntensity = 0.25 + 1.2 * (st.springGlow ?? 0);   // the springs squash as the barrel comes back
    gyro.visible = (st.gyro ?? 0) > 0.01; gyro.scale.setScalar(gyro.userData.k * Math.max(0.01, ease(st.gyro ?? 0, 2.4))); gyro.rotation.z = (st.gyroSpin ?? 0);
    { const k = clamp(st.tb ?? 0); turbine.visible = k > 0.001; turbine.scale.setScalar(1); turbine.position.y = 0.98 + 2.6 * (1 - k * k); } fan.rotation.x = st.fan ?? 0; rotor.rotation.x = st.fan ?? 0; glowM.opacity = 0.9 * clamp(st.glow ?? 0) * clamp(st.tb ?? 0); grilleGlow.material.opacity = 0.85 * clamp(st.glow ?? 0);   // r2: the turbine is dropped in from above (lands at tb = 1)
    mower.g.visible = (st.mower ?? 0) > 0.01; mower.g.position.set(lerp(-0.66, -1.8, tr), lerp(0.13, HYL + 0.06, tr), lerp(0, 0.2, tr)); mower.g.scale.setScalar(lerp(0.8, 1, tr));   // on the kart's tail, then in the engine bay
    peris.forEach((p, i) => setPop(p, ease(clamp((st.peri ?? 0) * 3 - i * 0.6), 2.4)));
    const kit = st.kit || [0, 0, 0, 0];
    antenna.visible = kit[0] > 0.01; antenna.scale.set(1, Math.max(0.01, ease(kit[0], 1.4)), 1); antenna.rotation.z = (st.sway ?? 0);
    smokeL.forEach((s) => setPop(s, ease(kit[1], 2.4))); setPop(cup, ease(kit[2], 2.4)); setPop(horn, ease(kit[3], 2.4));
    dents.forEach((d, i) => (d.visible = (st.dents ?? 0) > i && (st.slope ?? 0) < 0.05));
    splats.visible = true;
    body.position.y = -(st.sink ?? 0);
    gauges.forEach((n, i) => (n.rotation.z = st.gauge != null ? st.gauge - i * 0.3 : 0.8));
  }
  setStage({});
  /** add a pumpkin-goo splat on the flat glacis (its local frame: x out, y up the plate, z across) */
  function addSplat(y, z, s = 1) { const gS = new THREE.Group(); splats.add(gS); const m = new THREE.MeshStandardMaterial({ color: 0xf08a2b, roughness: 0.35 }); const sp = mk(new THREE.CircleGeometry(0.22 * s, 16), m, gS, 0.05, y, z); sp.rotation.y = PI / 2; sp.scale.set(1, 0.8, 1); for (let k = 0; k < 6; k++) { const d = mk(new THREE.CircleGeometry(0.06 * s, 10), m, gS, 0.05, y + Math.cos(k * 1.1) * 0.26 * s, z + Math.sin(k * 1.1) * 0.28 * s); d.rotation.y = PI / 2; } for (let k = 0; k < 3; k++) { const dr = mk(new THREE.PlaneGeometry(0.05 * s, 0.22 * s), m, gS, 0.05, y - 0.2 * s - k * 0.03, z - 0.1 + k * 0.1); dr.rotation.y = PI / 2; } // goo + drips (r3: no seed — it read as a yellow marble)
    gS.visible = false; return gS; }
  return { g, body, kart, kWheels, engDeck, seat, seatAnchor, hull, tur, gunEl, recoil, muzzle, glassSpot, breech, cyl, hatch, glacis, turbine, fan, grille, mower, peris, antenna, horn, cup, smokeL, tracks, setTracks, setStage, addSplat, HY1, len: 4.9 };
}

// ---------------------------------------------------------------- the goose, a chicken, a horse
/** Cartoon goose (~0.85 m tall). set({x,y,z,rotY, walk (phase), run 0..1, honk 0..1, wings 0..1, flap (rad), swim 0..1, look [dx,dy], t, scale}) */
export function makeGoose() {
  const white = std(0xf4f3ee, 0.75), grey = std(0xd7d6d0, 0.8), orange = std(0xf08a1f, 0.5), black = std(0x141414, 0.3), eyeW = std(0xffffff, 0.25);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const torso = mk(new THREE.SphereGeometry(0.22, 24, 16), white, body, 0, 0.36, 0); torso.scale.set(0.85, 0.8, 1.35);
  const tail = mk(new THREE.ConeGeometry(0.1, 0.2, 12), white, body, 0, 0.42, -0.32); tail.rotation.x = -1.9;
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); body.add(w); w.position.set(s * 0.17, 0.42, 0.02); const m = mk(new THREE.SphereGeometry(0.17, 16, 10), grey, w, s * 0.02, -0.02, -0.08); m.scale.set(0.25, 0.6, 1.25); w.userData.s = s; return w; });
  const neck = []; let parent = body; const NS = 5;
  for (let i = 0; i < NS; i++) { const n = new THREE.Group(); parent.add(n); n.position.set(0, i ? 0.085 : 0.52, i ? 0 : 0.2); neck.push(n); parent = n; }
  // one smooth tapered neck (a chain of beads read as a caterpillar): a tube through the joints, rebuilt in set()
  const NR = 10, NSEG = 16, npos = new Float32Array((NSEG + 1) * (NR + 1) * 3), nidx = [];
  for (let i = 0; i < NSEG; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; nidx.push(a, b, a + 1, b, b + 1, a + 1); }
  const ngeo = new THREE.BufferGeometry(); ngeo.setIndex(nidx); ngeo.setAttribute('position', new THREE.BufferAttribute(npos, 3));
  const neckMesh = new THREE.Mesh(ngeo, white); neckMesh.castShadow = true; neckMesh.frustumCulled = false; body.add(neckMesh);
  mk(new THREE.SphereGeometry(0.085, 14, 10), white, body, 0, 0.52, 0.2);   // the neck's root, blended into the chest
  const head = new THREE.Group(); parent.add(head); head.position.set(0, 0.09, 0.02);
  mk(new THREE.SphereGeometry(0.1, 20, 14), white, head).scale.set(0.9, 0.9, 1.15);
  const beakU = new THREE.Group(), beakL = new THREE.Group(); head.add(beakU, beakL); beakU.position.set(0, -0.005, 0.09); beakL.position.set(0, -0.025, 0.08);
  const bu = mk(new THREE.ConeGeometry(0.045, 0.16, 12), orange, beakU, 0, 0, 0.07); bu.rotation.x = PI / 2; bu.scale.set(1.15, 0.6, 1);
  const bl = mk(new THREE.ConeGeometry(0.038, 0.12, 12), orange, beakL, 0, 0, 0.055); bl.rotation.x = PI / 2; bl.scale.set(1.05, 0.5, 1);
  const tongue = mk(new THREE.SphereGeometry(0.02, 8, 6), std(0xe85a6a, 0.5), beakL, 0, 0.012, 0.04);
  const eyes = [];
  for (const s of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.03, 12, 10), eyeW, head, s * 0.065, 0.03, 0.06); const p = mk(new THREE.SphereGeometry(0.018, 10, 8), black, head, s * 0.07, 0.03, 0.08); const br = mk(new THREE.BoxGeometry(0.06, 0.014, 0.02), black, head, s * 0.06, 0.07, 0.07); br.rotation.z = s * 0.45; eyes.push({ e, p, br, s }); }   // angry brows: always
  const legs = [-1, 1].map((s) => { const l = new THREE.Group(); body.add(l); l.position.set(s * 0.08, 0.22, 0.02); mk(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 8), orange, l, 0, -0.1, 0); const f = mk(new THREE.ConeGeometry(0.06, 0.12, 3), orange, l, 0, -0.21, 0.05); f.rotation.x = PI / 2; f.scale.set(1, 0.25, 1); return l; });
  function set(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1); root.visible = p.visible ?? true;
    const t = p.t ?? 0, wk = p.walk, run = p.run ?? 0, hk = clamp(p.honk ?? 0), sw = clamp(p.swim ?? 0), wg = clamp(Math.max(p.wings ?? 0, run * 0.7));
    const step = wk == null ? 0 : Math.sin(wk);
    body.position.y = wk == null ? 0 : Math.abs(Math.cos(wk)) * 0.025;
    const rc = clamp(p.reach ?? 0);   // reach (034 r2): body tips forward, neck straight out + down (peering into something low)
    body.rotation.set(0.15 * run + 0.25 * hk + 0.15 * rc, 0, wk == null ? 0 : step * 0.12);
    legs.forEach((l, i) => { l.rotation.x = (i ? -1 : 1) * step * 0.7; l.visible = sw < 0.5; });
    // neck: S-curve resting, straight + forward when honking / running
    neck.forEach((n, i) => { n.rotation.x = lerp(i === 0 ? -0.15 : i < 3 ? 0.18 : -0.12, i === 0 ? 0.95 : 0.12, Math.max(hk, run * 0.6, rc)) + (p.nod ?? 0) * (i === NS - 1 ? 1 : 0); n.rotation.y = i === 1 ? (p.turn ?? 0) : 0; });
    head.rotation.set(lerp(-0.1, -0.8, Math.max(hk, run * 0.6)) + (p.headUp ?? 0), p.headTurn ?? 0, 0);
    beakU.rotation.x = -0.35 * hk; beakL.rotation.x = 0.45 * hk; tongue.visible = hk > 0.3;
    wings.forEach((w) => { w.rotation.z = w.userData.s * (wg * 1.3 + (wg > 0.1 ? 0.35 * Math.sin((p.flap ?? t * 22)) * wg : 0)); w.rotation.x = -0.25 * wg; });
    const [lx, ly] = p.look || [0, 0]; eyes.forEach((o) => { o.p.position.set(o.s * 0.07 + lx * 0.008, 0.03 + ly * 0.012, 0.08); o.br.rotation.z = o.s * (0.45 + 0.2 * hk); });
    body.position.y -= sw * 0.25;
    // rebuild the neck tube through the joint origins (in body space)
    body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert();
    const pts = neck.map((n) => new THREE.Vector3().setFromMatrixPosition(n.matrixWorld).applyMatrix4(inv)); pts.push(new THREE.Vector3().setFromMatrixPosition(head.matrixWorld).applyMatrix4(inv));
    const cv = new THREE.CatmullRomCurve3(pts), up = new THREE.Vector3(1, 0, 0), nn = new THREE.Vector3(), bb = new THREE.Vector3();
    for (let i = 0; i <= NSEG; i++) { const u = i / NSEG, P = cv.getPointAt(u), Tg = cv.getTangentAt(u); nn.crossVectors(up, Tg).normalize(); bb.crossVectors(Tg, nn); const r = lerp(0.082, 0.062, u);
      for (let j = 0; j <= NR; j++) { const a = (j / NR) * PI * 2, k = (i * (NR + 1) + j) * 3; npos[k] = P.x + (nn.x * Math.cos(a) + bb.x * Math.sin(a)) * r; npos[k + 1] = P.y + (nn.y * Math.cos(a) + bb.y * Math.sin(a)) * r; npos[k + 2] = P.z + (nn.z * Math.cos(a) + bb.z * Math.sin(a)) * r; } }
    ngeo.attributes.position.needsUpdate = true; ngeo.computeVertexNormals();
  }
  set({});
  return { root, body, head, set };
}
/** Toon hen (~0.45 m). set({x,y,z,rotY, flap 0..1, peck 0..1, t, scale}) */
export function makeChicken() {
  const fe = std(0xf2ece0, 0.8), brown = std(0xb5743a, 0.8), red = std(0xd6262a, 0.6), orange = std(0xf0a21f, 0.5), black = std(0x141414, 0.3);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mk(new THREE.SphereGeometry(0.14, 18, 12), fe, body, 0, 0.18, 0).scale.set(0.9, 0.85, 1.2);
  const tl = mk(new THREE.ConeGeometry(0.08, 0.14, 10), brown, body, 0, 0.25, -0.15); tl.rotation.x = -2.3;
  const head = new THREE.Group(); body.add(head); head.position.set(0, 0.32, 0.1);
  mk(new THREE.SphereGeometry(0.075, 14, 10), fe, head);
  for (let k = 0; k < 3; k++) mk(new THREE.SphereGeometry(0.025, 8, 6), red, head, 0, 0.07, -0.03 + k * 0.03);
  mk(new THREE.SphereGeometry(0.02, 8, 6), red, head, 0, -0.06, 0.06);
  const bk = mk(new THREE.ConeGeometry(0.025, 0.06, 8), orange, head, 0, -0.01, 0.09); bk.rotation.x = PI / 2;
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.014, 8, 6), black, head, s * 0.045, 0.015, 0.06);
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); body.add(w); w.position.set(s * 0.12, 0.2, 0); mk(new THREE.SphereGeometry(0.1, 12, 8), brown, w, 0, 0, -0.02).scale.set(0.25, 0.6, 1); w.userData.s = s; return w; });
  const legs = [-1, 1].map((s) => mk(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), orange, body, s * 0.05, 0.05, 0));
  function set(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1); root.visible = p.visible ?? true;
    const t = p.t ?? 0, fl = clamp(p.flap ?? 0);
    wings.forEach((w) => (w.rotation.z = w.userData.s * (fl * (1.1 + 0.6 * Math.sin(t * 30)))));
    head.rotation.x = (p.peck ?? 0) * 0.8 + 0.08 * Math.sin(t * 5); head.position.z = 0.1 + 0.02 * Math.sin(t * 7);
    legs.forEach((l) => (l.visible = !p.sit));
  }
  set({});
  return { root, set };
}
/** Toon horse (~1.6 m). set({x,y,z,rotY, sink (m: hooves into the mud), t, nod}) */
export function makeHorse() {
  const coat = std(0x8a5a32, 0.7), dark = std(0x3a2618, 0.75), white = std(0xffffff, 0.3), black = std(0x141414, 0.3);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mk(new THREE.CapsuleGeometry(0.33, 0.95, 8, 18), coat, body, 0, 1.08, 0).rotation.x = PI / 2;
  const neck = new THREE.Group(); body.add(neck); neck.position.set(0, 1.25, 0.55); neck.rotation.x = 0.65;
  mk(new THREE.CapsuleGeometry(0.17, 0.5, 6, 14), coat, neck, 0, 0.32, 0);
  const mane = mk(new THREE.BoxGeometry(0.07, 0.68, 0.14), dark, neck, 0, 0.32, -0.16);
  const head = new THREE.Group(); neck.add(head); head.position.set(0, 0.68, 0.0); head.rotation.x = 1.25;
  mk(new THREE.CapsuleGeometry(0.15, 0.38, 6, 14), coat, head, 0, 0.18, 0);
  mk(new THREE.SphereGeometry(0.16, 14, 10), std(0xb07a4c, 0.7), head, 0, 0.45, 0.02).scale.set(1, 0.8, 0.9);
  for (const s of [-1, 1]) { mk(new THREE.ConeGeometry(0.05, 0.14, 8), coat, head, s * 0.08, -0.1, -0.1).rotation.x = -0.6; mk(new THREE.SphereGeometry(0.045, 10, 8), white, head, s * 0.13, 0.08, 0.06); mk(new THREE.SphereGeometry(0.024, 8, 6), black, head, s * 0.15, 0.09, 0.08); }
  const tail = mk(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), dark, body, 0, 0.95, -0.85); tail.rotation.x = 0.35;
  const legs = [];
  for (const [x, z] of [[-0.2, 0.55], [0.2, 0.55], [-0.2, -0.55], [0.2, -0.55]]) { const l = new THREE.Group(); body.add(l); l.position.set(x, 0.85, z); mk(new THREE.CapsuleGeometry(0.075, 0.68, 4, 10), coat, l, 0, -0.4, 0); mk(new THREE.CylinderGeometry(0.085, 0.09, 0.1, 12), dark, l, 0, -0.82, 0); legs.push(l); }
  function set(p = {}) {
    root.position.set(p.x ?? 0, (p.y ?? 0) - (p.sink ?? 0), p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1); root.visible = p.visible ?? true;
    const t = p.t ?? 0; neck.rotation.x = 0.65 + 0.06 * Math.sin(t * 1.3) + (p.nod ?? 0); tail.rotation.z = 0.25 * Math.sin(t * 2.1);
    legs.forEach((l, i) => (l.rotation.x = p.walk == null ? 0 : 0.45 * Math.sin(p.walk + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0))));   // a trot
  }
  set({});
  return { root, set };
}

// ---------------------------------------------------------------- small props
export function makePumpkin(r = 0.22) {
  const g = new THREE.Group();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * PI * 2; const s = mk(new THREE.SphereGeometry(r * 0.55, 14, 10), std(k % 2 ? 0xf08a1f : 0xe67812, 0.55), g, Math.cos(a) * r * 0.45, 0, Math.sin(a) * r * 0.45); s.scale.set(0.8, 1.15, 0.8); }
  mk(new THREE.CylinderGeometry(r * 0.08, r * 0.12, r * 0.4, 8), std(0x5a7a2a, 0.7), g, 0, r * 0.65, 0);
  return { g, r };
}
export function makeMelon() {
  const g = new THREE.Group();
  const mtex = tex(256, 128, (c, w, h) => { c.fillStyle = '#3f8f2f'; c.fillRect(0, 0, w, h); for (let k = 0; k < 12; k++) { c.fillStyle = '#1f5a1c'; c.beginPath(); for (let y = 0; y <= h; y += 4) { const x = k * w / 12 + 6 * Math.sin(y * 0.15 + k); c.lineTo(x, y); } for (let y = h; y >= 0; y -= 4) { const x = k * w / 12 + 9 + 6 * Math.sin(y * 0.15 + k); c.lineTo(x, y); } c.fill(); } });
  const m = mk(new THREE.SphereGeometry(0.28, 28, 18), new THREE.MeshStandardMaterial({ map: mtex, roughness: 0.4 }), g, 0, 0.24, 0); m.scale.set(1.25, 0.88, 0.95); m.rotation.z = PI / 2;
  return { g };
}
export function makeLemonade() {
  const g = new THREE.Group();
  const glass = mk(new THREE.CylinderGeometry(0.075, 0.06, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), g, 0, 0.1, 0);
  const juice = mk(new THREE.CylinderGeometry(0.07, 0.058, 0.17, 20), new THREE.MeshStandardMaterial({ color: 0xffe14a, roughness: 0.2, transparent: true, opacity: 0.85, emissive: 0x6a5a10, emissiveIntensity: 0.3 }), g, 0, 0.09, 0);
  mk(new THREE.CylinderGeometry(0.06, 0.058, 0.01, 20), std(0xffffff, 0.3), g, 0, 0.003, 0);
  const lem = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16), std(0xfff07a, 0.5), g, 0.06, 0.18, 0); lem.rotation.x = PI / 2;
  const straw = mk(new THREE.CylinderGeometry(0.007, 0.007, 0.26, 8), std(0xff5a7a, 0.4), g, -0.02, 0.2, 0); straw.rotation.z = 0.25;
  return { g, juice };
}
export function makeScarecrow() {
  const g = new THREE.Group(), wood = std(0x8b6a44, 0.85);
  mk(new THREE.CylinderGeometry(0.04, 0.05, 2.0, 8), wood, g, 0, 1.0, 0); mk(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), wood, g, 0, 1.4, 0).rotation.z = PI / 2;
  const top = new THREE.Group(); g.add(top);
  mk(new THREE.BoxGeometry(0.55, 0.6, 0.25), std(0x3f6fb8, 0.85), top, 0, 1.3, 0); for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.5, 0.16, 0.18), std(0x3f6fb8, 0.85), top, s * 0.45, 1.42, 0);
  mk(new THREE.SphereGeometry(0.17, 14, 10), std(0xd9c08a, 0.9), top, 0, 1.8, 0); mk(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 18), std(0xe0c060, 0.85), top, 0, 1.94, 0); mk(new THREE.CylinderGeometry(0.15, 0.18, 0.16, 16), std(0xe0c060, 0.85), top, 0, 2.02, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.04, 0.04, 0.02), std(0x1b1b1b, 0.5), top, s * 0.06, 1.83, 0.16);
  for (let k = 0; k < 6; k++) { const s = mk(new THREE.ConeGeometry(0.02, 0.18, 4), std(0xe8cf70, 0.8), top, (k < 3 ? -1 : 1) * 0.72, 1.42 - 0.03 * (k % 3), (k % 3 - 1) * 0.05); s.rotation.z = (k < 3 ? 1 : -1) * 1.5; }
  return { g, top };
}
export function makeHayBale(round = true, target = false) {
  const g = new THREE.Group(); const hayT = tex(256, 128, (c, w, h) => { c.fillStyle = '#e1bf5c'; c.fillRect(0, 0, w, h); const R = rng(6); for (let i = 0; i < 900; i++) { c.strokeStyle = ['#c9a443', '#f0d77c', '#b8933a'][i % 3]; c.lineWidth = 1 + R() * 1.5; const x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (R() - 0.5) * 24, y + (R() - 0.5) * 6); c.stroke(); } });
  const hm = new THREE.MeshStandardMaterial({ map: hayT, roughness: 0.95 });
  if (round) { const b = mk(new THREE.CylinderGeometry(0.62, 0.62, 1.1, 28), hm, g, 0, 0.62, 0); b.rotation.x = PI / 2; if (target) { const tg = mk(new THREE.CircleGeometry(0.58, 32), new THREE.MeshStandardMaterial({ map: tex(256, 256, (c, w, h) => { const cols = ['#ffffff', '#d42a22', '#ffffff', '#d42a22', '#ffffff']; for (let k = 0; k < 5; k++) { c.fillStyle = cols[k]; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - k * 25, 0, 7); c.fill(); } }), roughness: 0.7 }), g, 0, 0.62, 0.56); tg.castShadow = false; } }
  else mk(new THREE.BoxGeometry(1.0, 0.45, 0.5), hm, g, 0, 0.225, 0);
  return { g };
}

// ---------------------------------------------------------------- the creek water (level ∩ channel), the bridge
/** The creek's water in section: setLevel(L, t) — the polygon between the two bank slopes from the bed up to L, extruded back. */
export function makeCreekWater(parent) {
  const C = D.creek;
  const grad = tex(16, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fe2ff'); g.addColorStop(0.12, '#4fb6e6'); g.addColorStop(0.6, '#1f7fb6'); g.addColorStop(1, '#0f4a72'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(255,255,255,${0.05 + 0.04 * (k % 3)})`; c.fillRect(0, h * (0.15 + k * 0.09), w, 3); } });   // light at the surface, deep teal at the bed, faint caustic bands
  grad.wrapS = grad.wrapT = THREE.ClampToEdgeWrapping; grad.repeat.set(0.001, 1 / (0 - C.bed)); grad.offset.set(0, 1);   // ShapeGeometry uv = (x, y) in metres: v = 1 at y 0, 0 at the bed
  const front = new THREE.MeshStandardMaterial({ map: grad, color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.78, emissive: 0x0f3f66, emissiveIntensity: 0.25, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  const backM = new THREE.MeshStandardMaterial({ color: 0x1b5f86, roughness: 0.2, emissive: 0x0d3f5e, emissiveIntensity: 0.35, side: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const secF = new THREE.Mesh(new THREE.BufferGeometry(), front), secB = new THREE.Mesh(new THREE.BufferGeometry(), backM); secF.renderOrder = 3; parent.add(secF, secB);
  const sg = new THREE.PlaneGeometry(1, 1, 24, 40); sg.rotateX(-PI / 2); const base = sg.attributes.position.array.slice();
  const foamT = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.4})`; c.beginPath(); c.ellipse(r() * w, r() * h, 6 + r() * 16, 1.5 + r() * 2, 0, 0, 7); c.fill(); } }); foamT.wrapS = foamT.wrapT = THREE.RepeatWrapping;
  const surf = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x8fcfee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.6, depthWrite: false, map: foamT })); surf.renderOrder = 4; parent.add(surf);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(1, 0.035, 0.03), new THREE.MeshBasicMaterial({ color: 0xe6f8ff, transparent: true, opacity: 0.9, toneMapped: false })); lip.renderOrder = 5; parent.add(lip);   // the bright surface line on the cut
  const xAt = (y, side) => side < 0 ? lerp(C.xl, C.bl, (0 - y) / (0 - C.bed)) : lerp(C.xr, C.br, (0 - y) / (0 - C.bed));
  let lastL = null;
  return {
    surf, front, xAt,
    setLevel(L, t = 0) {
      const xl = xAt(L, -1), xr = xAt(L, 1);
      if (lastL === null || Math.abs(L - lastL) > 0.002) {
        lastL = L;
        const shape = new THREE.Shape([new THREE.Vector2(xl, L), new THREE.Vector2(C.bl, C.bed), new THREE.Vector2(C.br, C.bed), new THREE.Vector2(xr, L)]);
        secF.geometry.dispose(); secF.geometry = new THREE.ShapeGeometry(shape);
        const vol = new THREE.ExtrudeGeometry(shape, { depth: C.depth, bevelEnabled: false, curveSegments: 1 }); vol.translate(0, 0, -C.depth); secB.geometry.dispose(); secB.geometry = vol;
      }
      surf.scale.set(xr - xl, 1, C.depth); surf.position.set((xl + xr) / 2, L, -C.depth / 2); lip.scale.set(xr - xl, 1, 1); lip.position.set((xl + xr) / 2, L - 0.01, 0.005);
      foamT.repeat.set((xr - xl) / 3, C.depth / 3); foamT.offset.y = t * 0.05;
      const a = sg.attributes.position; for (let i = 0; i < a.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; a.setY(i, 0.025 * Math.sin(x * 9 + t * 2.4) * Math.cos(z * 30 + t * 1.7)); } a.needsUpdate = true; sg.computeVertexNormals();
    },
  };
}
/** The little wooden bridge: two halves hinged at the banks. set(sag 0..1, brk 0..1 (the halves swing down onto the bed)). */
export function makeBridge() {
  const B = D.bridge, C = D.creek, wood = std(0x9a7048, 0.85), woodD = std(0x6f4e32, 0.85), half = (B.x1 - B.x0) / 2, W = B.z0 - B.z1;
  const g = new THREE.Group(), halves = [];
  for (const s of [-1, 1]) {
    const h = new THREE.Group(); g.add(h); h.position.set(s < 0 ? B.x0 : B.x1, B.y, 0);
    const n = 12; for (let k = 0; k < n; k++) { const x = (s < 0 ? 1 : -1) * (k + 0.5) * half / n; mk(new THREE.BoxGeometry(half / n - 0.04, 0.07, W + 0.2), k % 3 ? wood : woodD, h, x, 0.035, (B.z0 + B.z1) / 2); }
    for (const z of [B.z0 - 0.15, B.z1 + 0.15]) mk(new THREE.BoxGeometry(half, 0.16, 0.14), woodD, h, (s < 0 ? 1 : -1) * half / 2, -0.08, z);
    for (const z of [B.z0 + 0.05, B.z1 - 0.05]) { for (let k = 0; k <= 4; k++) mk(new THREE.BoxGeometry(0.08, 0.8, 0.08), woodD, h, (s < 0 ? 1 : -1) * k * half / 4.2, 0.45, z); mk(new THREE.BoxGeometry(half, 0.07, 0.08), wood, h, (s < 0 ? 1 : -1) * half / 2, 0.82, z); }
    h.userData.s = s; halves.push(h);
  }
  // the centre trestle (snaps first)
  const tres = new THREE.Group(); g.add(tres); tres.position.set((B.x0 + B.x1) / 2, 0, 0);
  for (const z of [B.z0 - 0.3, B.z1 + 0.3]) mk(new THREE.BoxGeometry(0.16, B.y - C.bed, 0.16), woodD, tres, 0, (B.y + C.bed) / 2, z);
  mk(new THREE.BoxGeometry(0.2, 0.16, W), woodD, tres, 0, B.y - 0.1, (B.z0 + B.z1) / 2);
  const maxA = Math.asin((B.y - C.bed - 0.05) / half);
  return {
    g, halves, tres,
    set(sag = 0, brk = 0) {
      for (const h of halves) h.rotation.z = h.userData.s * (sag * 0.15 + clamp(brk) * (maxA - 0.15 * sag));   // the free ends drop toward the middle
      tres.visible = brk < 0.02; tres.scale.y = 1 - 0.04 * sag;
    },
  };
}

// ---------------------------------------------------------------- the barn (cut open at the front; tank-shaped holes in its end walls)
function boardsTex(col = '#b5352a', trim = '#f4efe6') { return tex(512, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, 0, 3, h); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x + 6, 0, 8, h); } const R = rng(2); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.08})`; c.fillRect(R() * w, R() * h, 2, 8 + R() * 30); } c.fillStyle = trim; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10); }); }
export function makeBarn() {
  const B = D.barn, g = new THREE.Group(), Wd = B.z0 - B.z1, Ht = B.eave, wallT = boardsTex();
  const sideM = (rx) => { const t = wallT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, side: THREE.DoubleSide }); };
  // the end walls at x0 and x1 (y–z plane): masked planes so a tank-shaped hole can open
  const ends = [B.x0, B.x1].map((x) => { const mp = maskedPlane(Wd, Ht, sideM(Wd / 2.2), 40); mp.mesh.material.side = THREE.DoubleSide; mp.mesh.position.set(x, Ht / 2, (B.z0 + B.z1) / 2); mp.mesh.rotation.y = PI / 2; g.add(mp.mesh); return mp; });
  const tankHole = (zc) => { const P = [[-1.45, 0.02], [1.45, 0.02], [1.5, 0.6], [1.35, 1.5], [0.95, 1.5], [0.95, 2.28], [-0.95, 2.28], [-0.95, 1.5], [-1.35, 1.5], [-1.5, 0.6]]; return P.map(([dz, y]) => [-(zc + dz - (B.z0 + B.z1) / 2), y - Ht / 2]); };   // in the plane's local frame (x = −(z − zc))
  // back wall (gable) with big doors, the gambrel roof (4 slopes along z), the cut front edge (section), hay loft
  const back = new THREE.Group(); g.add(back); back.position.set((B.x0 + B.x1) / 2, 0, B.z1);
  const gw = B.x1 - B.x0, gamb = new THREE.Shape([[-gw / 2, 0], [gw / 2, 0], [gw / 2, Ht], [gw * 0.32, B.ridge - 0.9], [0, B.ridge], [-gw * 0.32, B.ridge - 0.9], [-gw / 2, Ht]].map(([x, y]) => new THREE.Vector2(x, y)));
  mk(new THREE.ShapeGeometry(gamb), sideM(gw / 2.2), back, 0, 0, 0.02);
  mk(new THREE.PlaneGeometry(2.6, 2.8), std(0x8e2a22, 0.85), back, 0, 1.4, 0.04); for (const s of [-1, 1]) { beam(back, [s * 1.3, 0.05, 0.06], [-s * 1.3, 2.75, 0.06], 0.04, 0.12, std(0xf4efe6, 0.7)); }
  mk(new THREE.PlaneGeometry(1.1, 0.8), std(0x2a1d14, 0.9), back, 0, 4.4, 0.04);
  const roofM = new THREE.MeshStandardMaterial({ color: 0x5c6670, roughness: 0.55, metalness: 0.4, side: THREE.DoubleSide });
  const slope = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const r = mk(new THREE.BoxGeometry(L + 0.12, 0.07, Wd + 0.4), roofM, g, (B.x0 + B.x1) / 2 + (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (B.z0 + B.z1) / 2 + 0.1); r.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); return r; };
  slope([-gw / 2 - 0.2, Ht - 0.1], [-gw * 0.32, B.ridge - 0.9]); slope([-gw * 0.32, B.ridge - 0.9], [0, B.ridge]); slope([0, B.ridge], [gw * 0.32, B.ridge - 0.9]); slope([gw * 0.32, B.ridge - 0.9], [gw / 2 + 0.2, Ht - 0.1]);
  // the cut front: wall stubs in section colour along the gambrel outline (it reads as "sliced open")
  const cutM = std(0xe8d9c2, 0.8), fr = new THREE.Group(); g.add(fr); fr.position.set((B.x0 + B.x1) / 2, 0, B.z0);
  const outl = [[-gw / 2, 0], [-gw / 2, Ht], [-gw * 0.32, B.ridge - 0.9], [0, B.ridge], [gw * 0.32, B.ridge - 0.9], [gw / 2, Ht], [gw / 2, 0]];
  for (let i = 0; i < outl.length - 1; i++) beam(fr, [outl[i][0], outl[i][1], 0], [outl[i + 1][0], outl[i + 1][1], 0], 0.12, 0.14, cutM);
  const loft = mk(new THREE.BoxGeometry(gw - 0.1, 0.12, Wd * 0.55), std(0x9a7048, 0.85), g, (B.x0 + B.x1) / 2, 3.0, B.z1 + Wd * 0.275);
  for (let k = 0; k < 5; k++) { const hb = makeHayBale(false); g.add(hb.g); hb.g.position.set(B.x0 + 0.8 + k * 1.1, 3.06, B.z1 + 1.2 + (k % 2) * 0.6); hb.g.rotation.y = k * 0.4; }
  for (let k = 0; k < 4; k++) { const hb = makeHayBale(false); g.add(hb.g); hb.g.position.set(B.x0 + 0.9 + (k % 2) * 4.0, 0, B.z1 + 0.8 + Math.floor(k / 2) * 0.55); }
  const floor = mk(new THREE.PlaneGeometry(gw, Wd), std(0xb69c6a, 0.95), g, (B.x0 + B.x1) / 2, 0.01, (B.z0 + B.z1) / 2); floor.rotation.x = -PI / 2;
  const lamp = mk(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd27a, emissiveIntensity: 0.8 }), g, (B.x0 + B.x1) / 2, 2.6, (B.z0 + B.z1) / 2);
  const sign = mk(new THREE.PlaneGeometry(2.6, 0.6), new THREE.MeshStandardMaterial({ map: signTex("GARY'S FARM", { w: 640, h: 150, bg: '#f4efe6', fg: '#b5352a', px: 100, border: '#b5352a' }), roughness: 0.6 }), back, 0, Ht + 0.45, 0.06);
  let holes = '';
  return {
    g, ends, loft,
    setHoles(k0, k1, zc = D.TZ) { const key = `${k0 > 0}${k1 > 0}`; if (key === holes) return; holes = key; ends[0].setHoles(k0 > 0 ? [{ poly: tankHole(zc), rough: 0.06 }] : [], (x, y) => [x, y]); ends[1].setHoles(k1 > 0 ? [{ poly: tankHole(zc), rough: 0.06 }] : [], (x, y) => [x, y]); },
  };
}

// ---------------------------------------------------------------- dressing helpers
function roundTree(parent, x, z, s = 1, col = 0x4f9a3f) {
  const t = new THREE.Group(); parent.add(t); t.position.set(x, 0, z); t.scale.setScalar(s);
  mk(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 10), std(0x6b4a32, 0.9), t, 0, 1.1, 0);
  const lm = std(col, 0.9), lm2 = std(new THREE.Color(col).multiplyScalar(0.85).getHex(), 0.9);
  for (let k = 0; k < 5; k++) mk(new THREE.IcosahedronGeometry(1.0 + h2(x, k) * 0.4, 3), k % 2 ? lm : lm2, t, (h2(k, x) - 0.5) * 1.4, 2.8 + h2(z, k) * 0.9, (h2(x + k, z) - 0.5) * 1.2);
  return t;
}
function railFence(parent, x0, z0, x1, z1, m) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), a = Math.atan2(z1 - z0, x1 - x0), posts = [];
  for (let i = 0; i <= n; i++) posts.push(mk(new THREE.BoxGeometry(0.12, 1.15, 0.12), m, parent, lerp(x0, x1, i / n), 0.575, lerp(z0, z1, i / n)));
  const rails = []; for (const y of [0.45, 0.85]) { const r = mk(new THREE.BoxGeometry(L, 0.09, 0.05), m, parent, (x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.y = -a; rails.push(r); }
  return { posts, rails };
}

// ---------------------------------------------------------------- the set
export async function buildFarm(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96)).catch(() => {});
  camera.far = 1100; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xd9ecf6); scene.fog = new THREE.Fog(0xd6e8f2, 90, 520);
  // sky: deep blue → pale horizon, small soft clouds (big ones read as smudges on the lens)
  { const c = document.createElement('canvas'); c.width = 4096; c.height = 2048; const g = c.getContext('2d'); g.scale(2, 2);
    const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#2f7fd6'); gr.addColorStop(0.3, '#6fb0ea'); gr.addColorStop(0.46, '#cfe6f6'); gr.addColorStop(0.5, '#e8f2f6'); gr.addColorStop(1, '#e8f2f6');
    g.fillStyle = gr; g.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 60; i++) { const cx = h2(i, 5) * 2048, cy = 260 + h2(i, 6) * 200, s = 10 + h2(i, 7) * 18;
      for (let k = 0; k < 8; k++) { const x = cx + (h2(i, k) - 0.5) * s * 4, y = cy + (h2(k, i) - 0.5) * s * 0.8, rr = s * (0.6 + h2(i + k, 9) * 0.7); const cg = g.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); cg.addColorStop(0, 'rgba(255,255,255,1)'); cg.addColorStop(0.75, 'rgba(240,246,252,.92)'); cg.addColorStop(1, 'rgba(225,235,248,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    root.add(new THREE.Mesh(new THREE.SphereGeometry(800, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }))); }
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  const hemi = new THREE.HemisphereLight(0xe6f0ff, 0x8a7656, 1.1); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cy, half = 10) { sun.position.set(cx - 9, cy + 14, 12); sun.target.position.set(cx, cy, -3); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 90 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 1);

  // ---- the cut face (strata, mud pit, creek channel hole) + the bump-field skirt + the creek banks + bed
  const F = D.face, C = D.creek;
  const cut = makeCutFace({ ...F, ppm: 120, mppm: 40, depth: 1.0, backShade: 0.25, paint: paintFarm });
  root.add(cut.group); cut.back.visible = false;
  cut.setHoles([{ poly: [[C.xl, 0.05], [C.bl, C.bed], [C.br, C.bed], [C.xr, 0.05]] }]);
  { const B = D.bumps, pts = [new THREE.Vector2(B.x0 - 0.1, 0)]; for (let x = B.x0; x <= B.x1; x += 0.1) pts.push(new THREE.Vector2(x, bumpH(x))); pts.push(new THREE.Vector2(B.x1 + 0.1, 0)); const sk = mk(new THREE.ShapeGeometry(new THREE.Shape(pts)), std(0x4a3020, 0.95), root, 0, 0, 0.001); sk.castShadow = false; }
  const dirtT = tex(512, 256, (c, w, h) => { c.fillStyle = '#9b7a52'; c.fillRect(0, 0, w, h); const R = rng(12); for (let i = 0; i < 2600; i++) { c.fillStyle = ['rgba(120,90,58,.5)', 'rgba(170,138,98,.45)', 'rgba(90,66,42,.35)'][i % 3]; c.beginPath(); c.ellipse(R() * w, R() * h, 2 + R() * 6, 1 + R() * 3, R() * 3, 0, 7); c.fill(); } for (const y of [0.28, 0.72]) { c.fillStyle = 'rgba(70,50,32,.3)'; c.fillRect(0, y * h - 18, w, 36); for (let x = 0; x < w; x += 14) { c.fillStyle = 'rgba(60,42,26,.35)'; c.fillRect(x, y * h - 16, 6, 32); } } });
  dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping;
  const trackSeg = (x0, x1) => { const t = dirtT.clone(); t.needsUpdate = true; t.repeat.set((x1 - x0) / 4, 1); const m = mk(new THREE.PlaneGeometry(x1 - x0, D.track.z0 - D.track.z1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), root, (x0 + x1) / 2, 0.006, (D.track.z0 + D.track.z1) / 2); m.rotation.x = -PI / 2; m.castShadow = false; return m; };
  trackSeg(F.x0, D.mud.x0); trackSeg(D.mud.x1, D.bumps.x0); trackSeg(D.bumps.x1, C.xl); trackSeg(C.xr, F.x1);
  { const B = D.bumps, bg = new THREE.PlaneGeometry(B.x1 - B.x0, D.track.z0 - D.track.z1, 120, 1); bg.rotateX(-PI / 2); const a = bg.attributes.position; for (let i = 0; i < a.count; i++) a.setY(i, bumpH(a.getX(i) + (B.x0 + B.x1) / 2) + 0.006); bg.computeVertexNormals(); const t = dirtT.clone(); t.needsUpdate = true; t.repeat.set((B.x1 - B.x0) / 4, 1); const bm = mk(bg, new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), root, (B.x0 + B.x1) / 2, 0, (D.track.z0 + D.track.z1) / 2); bm.castShadow = false; }
  // the mud pit's top: dark glossy mud + puddles
  const mudT = tex(512, 512, (c, w, h) => { c.fillStyle = '#3d2817'; c.fillRect(0, 0, w, h); const R = rng(21); for (let i = 0; i < 260; i++) { c.fillStyle = ['rgba(90,60,36,.5)', 'rgba(30,18,10,.5)', 'rgba(120,86,56,.35)'][i % 3]; c.beginPath(); c.ellipse(R() * w, R() * h, 8 + R() * 30, 4 + R() * 14, R() * 3, 0, 7); c.fill(); } for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(25,16,10,.45)'; c.beginPath(); c.ellipse(R() * w, R() * h, 10 + R() * 24, 5 + R() * 10, R() * 3, 0, 7); c.fill(); } });
  const mudTop = mk(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ map: mudT, roughness: 0.18, metalness: 0.05 }), root, 0, 0.012, D.mud.z1 / 2 - 0.05); mudTop.rotation.x = -PI / 2; mudTop.scale.set((D.mud.x1 - D.mud.x0) / 2 + 0.3, -D.mud.z1 / 2 - 0.06, 1); mudTop.castShadow = false;   // its near edge ends at the cut (z 0)
  mk(new THREE.PlaneGeometry(D.mud.x1 - D.mud.x0 + 0.6, 0.02), std(0x2f1f14, 0.2), root, 0, 0.0, 0.002);
  // grass everywhere else (a big field), crop rows behind
  const grassT = lawnTexture('#86b467', '#7aa95c'); grassT.repeat.set((F.x1 - F.x0) / 2, 60 / 2);
  const field = mk(new THREE.PlaneGeometry(F.x1 - F.x0, 60), new THREE.MeshStandardMaterial({ map: grassT, roughness: 0.95 }), root, (F.x0 + F.x1) / 2, 0.0, -30); field.rotation.x = -PI / 2; field.castShadow = false;
  // the creek: a hole through the field (two field strips either side), banks + bed, its water
  field.visible = false;
  for (const [x0, x1] of [[F.x0, C.xl], [C.xr, F.x1]]) { const t = grassT.clone(); t.needsUpdate = true; t.repeat.set((x1 - x0) / 2, 30); const f = mk(new THREE.PlaneGeometry(x1 - x0, 60), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), root, (x0 + x1) / 2, 0.0, -30); f.rotation.x = -PI / 2; f.castShadow = false; f.receiveShadow = true; }
  const bankT = tex(256, 256, (c, w, h) => { c.fillStyle = '#6b5236'; c.fillRect(0, 0, w, h); const R = rng(7); for (let i = 0; i < 700; i++) { c.fillStyle = ['rgba(90,70,48,.6)', 'rgba(130,110,80,.5)', 'rgba(70,96,46,.45)'][i % 3]; c.beginPath(); c.ellipse(R() * w, R() * h, 2 + R() * 6, 1 + R() * 4, R() * 3, 0, 7); c.fill(); } }); bankT.wrapS = bankT.wrapT = THREE.RepeatWrapping; bankT.repeat.set(1, 20);
  for (const s of [-1, 1]) { const xa = s < 0 ? C.xl : C.xr, xb = s < 0 ? C.bl : C.br, L = Math.hypot(xb - xa, C.bed); const b = mk(new THREE.PlaneGeometry(L, 60), new THREE.MeshStandardMaterial({ map: bankT, roughness: 0.9, side: THREE.DoubleSide }), root, (xa + xb) / 2, C.bed / 2, -30); b.rotation.order = 'ZXY'; b.rotation.set(-PI / 2, 0, 0); b.rotation.y = 0; const ang = Math.atan2(C.bed, xb - xa); b.rotation.set(-PI / 2, -ang, 0, 'XYZ'); b.castShadow = false; b.receiveShadow = true; }
  const bedT = tex(256, 256, (c, w, h) => { c.fillStyle = '#7d7466'; c.fillRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 500; i++) { c.fillStyle = ['#9c9385', '#5f584e', '#b3a996'][i % 3]; c.beginPath(); c.ellipse(R() * w, R() * h, 3 + R() * 7, 2 + R() * 5, R() * 3, 0, 7); c.fill(); } }); bedT.wrapS = bedT.wrapT = THREE.RepeatWrapping; bedT.repeat.set(2, 24);
  const bed = mk(new THREE.PlaneGeometry(C.br - C.bl, 60), new THREE.MeshStandardMaterial({ map: bedT, roughness: 0.9 }), root, (C.bl + C.br) / 2, C.bed, -30); bed.rotation.x = -PI / 2; bed.castShadow = false;
  const water = makeCreekWater(root); water.setLevel(C.level, 0);
  for (let i = 0; i < 18; i++) { const s = h2(i, 3) < 0.5 ? -1 : 1, x = (s < 0 ? C.xl - 0.3 : C.xr + 0.3) + s * h2(i, 4) * 0.8, z = -4.5 - h2(i, 5) * 30; for (let k = 0; k < 5; k++) { const r = mk(new THREE.ConeGeometry(0.03, 0.9 + h2(i, k) * 0.6, 5), std(0x5f8a3a, 0.8), root, x + (h2(k, i) - 0.5) * 0.4, 0.45, z + (h2(i + k, 2) - 0.5) * 0.4); r.rotation.z = (h2(i, k + 3) - 0.5) * 0.4; } }   // cattails by the creek
  const bridge = makeBridge(); root.add(bridge.g);
  const mlc = new THREE.Group(); root.add(mlc); mlc.position.set(D.mlc[0], 0, D.mlc[1]);
  mk(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 10), steel(0x9aa0a6, 0.4, 0.6), mlc, 0, 0.85, 0);
  const mlcDisc = mk(new THREE.CircleGeometry(0.32, 32), new THREE.MeshStandardMaterial({ map: signTex('3', { w: 256, h: 256, bg: '#ffd21f', fg: '#1b1b1b', px: 190, round: true, border: '#1b1b1b' }), transparent: true, roughness: 0.5, side: THREE.DoubleSide }), mlc, 0, 1.72, 0.07);
  // ---- behind the track: rail fence (gap at the barn), the goose's post, the watermelon target bale, a pumpkin patch
  const woodM = std(0x8b6a44, 0.85);
  railFence(root, F.x0, -5.0, D.barn.x0 - 0.3, -5.0, woodM); railFence(root, D.barn.x1 + 0.3, -5.0, C.xl - 0.6, -5.0, woodM); railFence(root, C.xr + 0.6, -5.0, F.x1, -5.0, woodM);
  const gpost = mk(new THREE.BoxGeometry(0.2, D.postH, 0.2), woodM, root, D.post[0], D.postH / 2, D.post[1]);
  const endFence = railFence(root, D.endFence, -0.3, D.endFence, -4.4, woodM);
  const melonBale = makeHayBale(true, true); root.add(melonBale.g); melonBale.g.position.set(D.melon[0], 0, D.melon[1]); melonBale.g.rotation.y = 1.25;   // the bullseye faces the tank (+x), not the lens
  const bull = makeHayBale(true, true); root.add(bull.g); bull.g.position.set(D.bull[0], 0, D.bull[1]); bull.g.rotation.y = -0.15;
  for (const [x, z, r] of [[-7, -2.4, 0], [-8.6, -3.0, 0.4], [20.6, -4.2, 0.2], [-14, -6.5, 0], [9.5, -6.8, 0.6], [55, -6.6, 0.3]]) { const hb = makeHayBale(true); root.add(hb.g); hb.g.position.set(x, 0, z); hb.g.rotation.y = r; }
  const t2 = makeHayBale(true, true); root.add(t2.g); t2.g.position.set(D.t2[0], 0, D.t2[1]); t2.g.rotation.y = -0.6;
  const mud2 = mk(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ map: mudT, roughness: 0.18 }), root, D.creek.xr + 1.15, 0.012, -1.9); mud2.rotation.x = -PI / 2; mud2.scale.set(1.0, 1.9, 1); mud2.castShadow = false;   // the far bank's mud (the ending)
  const scare = makeScarecrow(); root.add(scare.g); scare.g.position.set(D.scare[0], 0, D.scare[1]);
  const barn = makeBarn(); root.add(barn.g);
  // the silo, the farmhouse, a windmill, a red tractor, a cornfield, trees, hills, the neighbours' pumpkin patch + cannon
  const silo = new THREE.Group(); root.add(silo); silo.position.set(-17, 0, -14);
  mk(new THREE.CylinderGeometry(1.5, 1.5, 9, 28), std(0xc9ccc8, 0.55, { metalness: 0.3 }), silo, 0, 4.5, 0); mk(new THREE.SphereGeometry(1.52, 28, 12, 0, PI * 2, 0, PI / 2), std(0x9aa3a8, 0.4, { metalness: 0.5 }), silo, 0, 9, 0);
  for (let k = 0; k < 6; k++) mk(new THREE.TorusGeometry(1.51, 0.03, 6, 40), std(0x8a8f92, 0.5), silo, 0, 1.2 + k * 1.4, 0).rotation.x = PI / 2;
  const house = new THREE.Group(); root.add(house); house.position.set(-12, 0, -16);
  mk(new THREE.BoxGeometry(8, 3.6, 6), std(0xf2ead6, 0.8), house, 0, 1.8, 0); const hr = mk(new THREE.ConeGeometry(6.0, 2.6, 4), std(0x4a5560, 0.6), house, 0, 4.9, 0); hr.rotation.y = PI / 4; hr.scale.set(1, 1, 0.75);
  for (const x of [-2.6, 0, 2.6]) { mk(new THREE.PlaneGeometry(1.0, 1.2), std(0x7fb6d8, 0.2), house, x, 2.0, 3.01); mk(new THREE.PlaneGeometry(1.2, 0.08), std(0xffffff, 0.5), house, x, 2.65, 3.02); }
  mk(new THREE.BoxGeometry(8.4, 0.12, 2.0), std(0xffffff, 0.6), house, 0, 2.7, 3.9); for (const x of [-3.9, -1.3, 1.3, 3.9]) mk(new THREE.BoxGeometry(0.12, 2.7, 0.12), std(0xffffff, 0.6), house, x, 1.35, 4.8);
  const mill = new THREE.Group(); root.add(mill); mill.position.set(46, 0, -21);
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) beam(mill, [dx * 1.3, 0, dz * 1.3], [dx * 0.2, 9, dz * 0.2], 0.12, 0.12, std(0x8f8f8c, 0.5, { metalness: 0.4 }));
  const rotor = new THREE.Group(); mill.add(rotor); rotor.position.set(0, 9.2, 0.4);
  for (let k = 0; k < 16; k++) { const b = mk(new THREE.BoxGeometry(0.28, 1.6, 0.03), std(0xd8d8d2, 0.5, { metalness: 0.3 }), rotor, 0, 0.9, 0); b.geometry.translate(0, 0, 0); const pv = new THREE.Group(); rotor.add(pv); pv.rotation.z = (k / 16) * PI * 2; pv.add(b); b.rotation.y = 0.4; }
  const vane = mk(new THREE.BoxGeometry(0.04, 1.0, 2.2), std(0xc0392b, 0.6), mill, 0, 9.2, -1.6);
  const tractor = new THREE.Group(); root.add(tractor); tractor.position.set(-11, 0, -8.6); tractor.rotation.y = 0.5;
  mk(new RoundedBoxGeometry(1.8, 0.8, 1.0, 3, 0.1), std(0xc8261e, 0.4), tractor, 0.3, 0.9, 0); mk(new THREE.BoxGeometry(0.9, 1.1, 1.0), std(0xc8261e, 0.4), tractor, -0.5, 1.6, 0); mk(new THREE.BoxGeometry(0.85, 0.7, 1.02), std(0x9fd0e8, 0.1), tractor, -0.5, 1.75, 0);
  for (const [x, r, z] of [[-0.6, 0.7, 0.6], [-0.6, 0.7, -0.6], [0.9, 0.42, 0.55], [0.9, 0.42, -0.55]]) { mk(new THREE.CylinderGeometry(r, r, 0.35, 22), std(0x1d1d1f, 0.85), tractor, x, r, z).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.37, 14), std(0xffc21a, 0.5), tractor, x, r, z).rotation.x = PI / 2; }
  { const corn = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 2.1, 5), std(0x6c9a32, 0.85, { flatShading: true }), 1600); const tas = new THREE.InstancedMesh(new THREE.ConeGeometry(0.08, 0.3, 4), std(0xe0c060, 0.8), 1600); const m4 = new THREE.Matrix4(); let n = 0;
    for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const x = 38 + i * 0.85 + h2(i, j) * 0.3, z = -26 - j * 0.85 + h2(j, i) * 0.3; if (x > 41 && x < 52) continue; m4.makeTranslation(x, 1.05, z); corn.setMatrixAt(n, m4); m4.makeTranslation(x, 2.15, z); tas.setMatrixAt(n, m4); n++; }
    corn.count = tas.count = n; root.add(corn, tas); }
  for (let i = 0; i < 34; i++) { const x = -40 + i * 3.4 + h2(i, 1) * 2, z = -13 - h2(i, 4) * 10; if (x > 11 && x < 24 || x > 39 && x < 52 || x > 26 && x < 36 && z > -20) continue; roundTree(root, x, z, 0.8 + h2(i, 5) * 0.5, [0x4f9a3f, 0x5aa84a, 0x3f8535][i % 3]); }
  for (let i = 0; i < 24; i++) roundTree(root, -80 + i * 8 + h2(i, 2) * 4, -48 - h2(i, 7) * 20, 1.4 + h2(i, 8), 0x4a8f3c);
  const hillM = std(0x86c15a, 0.95, { flatShading: false });
  for (let i = 0; i < 9; i++) { const hl = mk(new THREE.SphereGeometry(1, 32, 16), hillM, root, -120 + i * 34, -2, -95 - h2(i, 3) * 40); hl.scale.set(40 + h2(i, 1) * 30, 9 + h2(i, 2) * 10, 22); hl.castShadow = false; }
  // the neighbours' hill + pumpkin patch + PUMPKIN CANNON (the pumpkins come from here)
  const nb = new THREE.Group(); root.add(nb); nb.position.set(D.cannon[0], 0, D.cannon[1]);
  const knoll = mk(new THREE.SphereGeometry(1, 32, 16), std(0x7cb852, 0.95), nb, 0, -6, 0); knoll.scale.set(16, 14, 11); knoll.castShadow = false;
  const cannon = new THREE.Group(); nb.add(cannon); cannon.position.set(0, 7.95, 0.5); cannon.scale.setScalar(1.45);
  mk(new THREE.BoxGeometry(2.6, 0.5, 1.4), std(0x2f6fd6, 0.5), cannon, 0, 0.3, 0); for (const z of [-0.75, 0.75]) mk(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 18), std(0x1d1d1f, 0.85), cannon, -0.6, 0.0, z).rotation.x = PI / 2;
  const cTank = mk(new THREE.CylinderGeometry(0.35, 0.35, 1.8, 18), std(0xd9dcde, 0.3, { metalness: 0.6 }), cannon, 0, 0.85, 0); cTank.rotation.z = PI / 2;
  const cBarrel = new THREE.Group(); cannon.add(cBarrel); cBarrel.position.set(0.5, 1.0, 0); cBarrel.rotation.set(0, 0, 0);
  const cTube = mk(new THREE.CylinderGeometry(0.3, 0.3, 4.2, 18), std(0x3b4046, 0.5, { metalness: 0.4 }), cBarrel, 0, 2.1, 0); for (const y of [1.2, 2.6]) mk(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 18), std(0xff8a1f, 0.5), cBarrel, 0, y, 0); mk(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 18), std(0xd42a22, 0.5), cBarrel, 0, 4.2, 0);
  cBarrel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.32, 0.55, 0.77).normalize());   // aimed at the track
  const banner = mk(new THREE.PlaneGeometry(4.2, 0.9), new THREE.MeshStandardMaterial({ map: signTex('PUMPKIN CANNON', { w: 800, h: 170, bg: '#ff8a1f', fg: '#ffffff', px: 110, border: '#ffffff' }), roughness: 0.6, side: THREE.DoubleSide }), nb, -5.4, 9.4, 2.2); banner.rotation.y = 0.2; banner.scale.setScalar(1.6);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8), woodM, nb, -5.4 + s * 3.2, 7.6, 2.2);
  for (let i = 0; i < 60; i++) { const p = makePumpkin(0.22 + h2(i, 2) * 0.12); root.add(p.g); const x = D.cannon[0] - 14 + h2(i, 4) * 28, z = D.cannon[1] + 12 + h2(i, 5) * 8; p.g.position.set(x, 0.16, z); p.g.rotation.y = h2(i, 6) * 6; }
  const cannonMuzzle = new THREE.Vector3(); cBarrel.updateWorldMatrix(true, true); cBarrel.localToWorld(cannonMuzzle.set(0, 4.3, 0));

  return { root, aimSun, sun, hemi, cut, water, bridge, barn, mlc, mlcDisc, scare, melonBale, bull, t2, mud2, gpost, endFence, mill: rotor, cannonMuzzle, mudTop, tractor };
}
