// 049 (Scribe promo, "No Nut November" battle royale): a toy island in lighthouse.js's open sea. Re-uses buildLighthouse() for the
// sky dome, the ocean, the moods (golden/day/dusk/night/dawn), the sun + env map, and hides the rock, tower, shack and coast.
// Places (x, z) on the island (top view, north = −z): the peach orchard (W), the wifi hill (E), the drop meadow (centre-N),
// the library on its rise (N), the beach where Trevor sits (S shore, facing the dusk sun; the library hill sits behind him).
//   const I = await buildIsland(studio); I.groundY(x, z); I.P.orchard → [x, y, z]; I.setMood('dusk'); I.aimSun(cx, cy, cz, half)
import * as THREE from 'three';
import { clamp, lerp, mk, rng } from '../core.js';
import { buildLighthouse, tex } from './lighthouse.js';

const PI = Math.PI, TAU = PI * 2;
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const prism = (w, h, d) => { const sh = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]); return new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2); };
const gauss = (dx, dz, s) => Math.exp(-(dx * dx + dz * dz) / (2 * s * s));
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

/** Shoreline radius (in the island's oval space: x / 1.15) for an angle. */
export const shoreR = (th) => 46 * (1 + 0.07 * Math.sin(3 * th + 0.6) + 0.05 * Math.sin(5 * th + 2.1) + 0.03 * Math.sin(9 * th + 1.0));
/** 0 at the shore, 1 at the centre, < 0 offshore. */
export const inland = (x, z) => { const th = Math.atan2(z, x / 1.15), r = Math.hypot(x / 1.15, z), R = shoreR(th); return (R - r) / R; };
export const shorePoint = (th, e = 0) => { const r = shoreR(th) * (1 - e); return [1.15 * r * Math.cos(th), r * Math.sin(th)]; };

export const SPOT = {
  orchard: [-17, 8], wifi: [17, -4], drop: [-5, -13], library: [5, -28], beach: shorePoint(1.35, 0.075), center: [0, 0],
};

export function groundY(x, z) {
  const e = inland(x, z);
  let h = e < 0 ? e * 30 : 1.5 * sstep(0, 0.16, e);
  const land = sstep(0.08, 0.3, e);
  h += land * (4.2 * gauss(x - 17, z + 4, 6.5) + 2.0 * gauss(x - 5, z + 28, 8.5) + 1.0 * gauss(x + 3, z - 1, 10) + 0.9 * gauss(x + 27, z + 12, 7) + 0.7 * gauss(x - 26, z - 18, 6));
  h += land * 0.16 * Math.sin(x * 0.31 + 1.3) * Math.sin(z * 0.27 + 0.4);
  // flat pads where things happen (the orchard rows, the drop meadow, the library forecourt)
  const pad = (cx, cz, s, y) => { const f = gauss(x - cx, z - cz, s); h = lerp(h, y, f * f); };
  pad(SPOT.drop[0], SPOT.drop[1], 5, 1.75);
  return h;
}

function islandMesh(root) {
  const geo = new THREE.PlaneGeometry(150, 130, 240, 210); geo.rotateX(-PI / 2);
  const P = geo.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color();
  const sand = new THREE.Color(0xf0d9a0), wet = new THREE.Color(0xcdb27c), g1 = new THREE.Color(0x6cc24a), g2 = new THREE.Color(0x8fd65a), g3 = new THREE.Color(0x4fae45);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), z = P.getZ(i), y = groundY(x, z), e = inland(x, z); P.setY(i, y);
    const n = 0.5 + 0.5 * Math.sin(x * 0.21 + Math.sin(z * 0.17) * 2) * Math.sin(z * 0.23 + 1.1), n2 = 0.5 + 0.5 * Math.sin(x * 0.9 + z * 0.7) * Math.sin(z * 1.1 - x * 0.4);
    c.copy(g1).lerp(g2, n * 0.8).lerp(g3, n2 * 0.25);
    const s = 1 - sstep(0.06, 0.12, e); c.lerp(sand, s);
    if (e < 0.02) c.lerp(wet, sstep(0.02, -0.02, e));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const m = mk(geo, std(0xffffff, 0.92, { vertexColors: true }), root); m.castShadow = false;
  return m;
}

function shoreFoam(root) {   // a white surf band hugging the coastline (the sea shader's own foam ring sits at the hidden rock)
  const N = 360, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * TAU;
    for (const [k, e] of [[0, 0.03], [1, -0.035]]) { const [x, z] = shorePoint(th, e); pos.push(x, 0.06, z); uv.push(i / N * 40, k); }
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const t = tex(256, 64, (g, w, h) => { for (let y = 0; y < h; y++) { const v = y / h, a = Math.sin(v * PI) ** 0.7 * 0.85; for (let x = 0; x < w; x += 4) { const n = 0.6 + 0.4 * Math.sin(x * 0.11 + y * 0.3) * Math.sin(x * 0.037 - y * 0.2); g.fillStyle = `rgba(255,255,255,${(a * n).toFixed(3)})`; g.fillRect(x, y, 4, 1); } } });
  t.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: true }));
  m.renderOrder = 2; root.add(m);
  return { mesh: m, tex: t };
}

/** Instanced forest: low-poly pines + round trees + bushes, scattered with a seeded rng, kept out of the action zones. */
function forest(root, zones) {
  const R = rng(4049), pines = [], rounds = [], bushes = [];
  const ok = (x, z, pad = 0) => zones.every(([zx, zz, r]) => Math.hypot(x - zx, z - zz) > r + pad);
  for (let k = 0; k < 2600 && pines.length + rounds.length < 300; k++) {
    const x = (R() - 0.5) * 120, z = (R() - 0.5) * 100, e = inland(x, z);
    if (e < 0.13 || !ok(x, z)) continue;
    const s = 0.75 + R() * 0.75, y = groundY(x, z);
    (R() < 0.62 ? pines : rounds).push([x, y, z, s, R() * TAU]);
  }
  for (let k = 0; k < 1200 && bushes.length < 160; k++) { const x = (R() - 0.5) * 120, z = (R() - 0.5) * 100, e = inland(x, z); if (e < 0.1 || !ok(x, z, -1.5)) continue; bushes.push([x, groundY(x, z), z, 0.35 + R() * 0.45, R() * TAU]); }
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const inst = (geo, m, list, f) => { const im = new THREE.InstancedMesh(geo, m, list.length); im.castShadow = true; im.receiveShadow = true; list.forEach((p, i) => { f(p, V, S); Q.setFromAxisAngle(Y, p[4]); M4.compose(V, Q, S); im.setMatrixAt(i, M4); }); root.add(im); return im; };
  const trunkM = std(0x7a5634, 0.9), pineM = std(0x2f8a45, 0.85, { flatShading: true }), pineM2 = std(0x3a9d4e, 0.85, { flatShading: true }), roundM = std(0x5cb84a, 0.85, { flatShading: true }), bushM = std(0x4aa845, 0.9, { flatShading: true });
  const cyl = new THREE.CylinderGeometry(0.12, 0.18, 1, 7), cone = new THREE.ConeGeometry(1, 1, 7), ico = new THREE.IcosahedronGeometry(1, 1);
  inst(cyl, trunkM, [...pines, ...rounds], (p, v, s) => { v.set(p[0], p[1] + 0.5 * p[3], p[2]); s.set(p[3], p[3], p[3]); });
  inst(cone, pineM, pines, (p, v, s) => { v.set(p[0], p[1] + 1.9 * p[3], p[2]); s.set(1.25 * p[3], 2.2 * p[3], 1.25 * p[3]); });
  inst(cone, pineM2, pines, (p, v, s) => { v.set(p[0], p[1] + 3.0 * p[3], p[2]); s.set(0.85 * p[3], 1.7 * p[3], 0.85 * p[3]); });
  inst(ico, roundM, rounds, (p, v, s) => { v.set(p[0], p[1] + 2.0 * p[3], p[2]); s.set(1.3 * p[3], 1.15 * p[3], 1.3 * p[3]); });
  inst(ico, bushM, bushes, (p, v, s) => { v.set(p[0], p[1] + 0.2 * p[3], p[2]); s.set(p[3], 0.7 * p[3], p[3]); });
  return { pines, rounds, bushes };
}

export function makePeach(r = 0.14) {
  const g = new THREE.Group();
  const b = mk(new THREE.SphereGeometry(r, 20, 14), std(0xffa266, 0.55), g, 0, 0, 0); b.scale.set(1, 0.95, 1);
  const cleft = mk(new THREE.TorusGeometry(r * 0.98, r * 0.05, 6, 24, PI), std(0xf07e4e, 0.6), g, 0, 0, 0); cleft.rotation.y = PI / 2;
  const blush = mk(new THREE.SphereGeometry(r * 1.005, 20, 14, 0, PI, 0, PI * 0.6), std(0xff6f5a, 0.6), g, 0, 0, 0); blush.rotation.y = -PI / 2;
  const stem = mk(new THREE.CylinderGeometry(r * 0.06, r * 0.06, r * 0.3, 6), std(0x6b4a2a), g, 0, r * 1.02, 0);
  const leaf = mk(new THREE.SphereGeometry(r * 0.32, 10, 6), std(0x5cb84a, 0.7), g, r * 0.25, r * 1.05, 0); leaf.scale.set(1.4, 0.25, 0.6); leaf.rotation.z = -0.5;
  return g;
}

function orchard(root) {
  const [cx, cz] = SPOT.orchard, trees = [], hanging = [];
  const R = rng(77);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = cx + (i - 1.5) * 4.6 + (R() - 0.5) * 0.5, z = cz + (j - 1.5) * 4.4 + (R() - 0.5) * 0.5, y = groundY(x, z), g = new THREE.Group(); g.position.set(x, y, z); root.add(g);
    const tr = mk(new THREE.CylinderGeometry(0.14, 0.22, 1.7, 8), std(0x7a5634, 0.9), g, 0, 0.85, 0); tr.rotation.z = (R() - 0.5) * 0.2;
    for (let k = 0; k < 4; k++) { const c = mk(new THREE.IcosahedronGeometry(0.95 + R() * 0.3, 1), std(k % 2 ? 0x7cc451 : 0x6ab845, 0.85, { flatShading: true }), g, (R() - 0.5) * 1.3, 2.25 + R() * 0.6, (R() - 0.5) * 1.2); c.scale.y = 0.8; }
    for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + R(), p = makePeach(0.15); p.position.set(Math.cos(a) * 1.15, 1.75 + R() * 0.7, Math.sin(a) * 1.05); p.rotation.y = R() * TAU; g.add(p); hanging.push(p); }
    trees.push(g);
  }
  // fallen giant peaches on the grass (the gag's ammo)
  const ground = [];
  for (let k = 0; k < 9; k++) { const x = cx + (R() - 0.5) * 15, z = cz + (R() - 0.5) * 14, p = makePeach(0.32 + R() * 0.12); p.position.set(x, groundY(x, z) + 0.3, z); p.rotation.set(0.3, R() * TAU, 0.2); root.add(p); ground.push(p); }
  // a hand-painted sign at the orchard gate
  const sign = new THREE.Group(); root.add(sign); const sx = cx + 7.5, sz = cz + 6.5; sign.position.set(sx, groundY(sx, sz), sz); sign.rotation.y = -0.5;
  mk(new THREE.BoxGeometry(0.12, 1.6, 0.12), std(0x7a5634), sign, -0.8, 0.8, 0); mk(new THREE.BoxGeometry(0.12, 1.6, 0.12), std(0x7a5634), sign, 0.8, 0.8, 0);
  const board = mk(new THREE.BoxGeometry(2.1, 0.75, 0.08), std(0xffffff, 0.7, { map: tex(512, 184, (g, w, h) => { g.fillStyle = '#c8874a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a4a24'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#fff6e0'; g.font = '86px "Luckiest Guy", "Arial Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PEACH ORCHARD', w / 2, h / 2 + 6); }) }), sign, 0, 1.45, 0);
  return { trees, hanging, ground, sign, board };
}

export function makeRouter() {
  const g = new THREE.Group();
  const stump = mk(new THREE.CylinderGeometry(0.42, 0.5, 0.45, 14), std(0x7a5634, 0.9), g, 0, 0.225, 0);
  mk(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 14), std(0xd8b483, 0.8), g, 0, 0.46, 0);
  const box = mk(new THREE.BoxGeometry(0.78, 0.18, 0.5), std(0xf2f2f2, 0.35), g, 0, 0.56, 0);
  const leds = [];
  for (let i = 0; i < 4; i++) { const l = mk(new THREE.BoxGeometry(0.06, 0.035, 0.01), new THREE.MeshBasicMaterial({ color: 0x2ee86a, toneMapped: false }), g, -0.2 + i * 0.13, 0.56, 0.255); leds.push(l); }
  for (let i = 0; i < 4; i++) { const a = mk(new THREE.CylinderGeometry(0.022, 0.026, 0.6, 6), std(0x23262c, 0.4), g, -0.3 + i * 0.2, 0.92, -0.18); a.rotation.z = (i - 1.5) * 0.25; }
  // the wifi symbol: three glowing arcs + a dot, standing over the router facing +z
  const arcs = [], arcM = (o) => new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: o, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const sym = new THREE.Group(); sym.position.set(0, 1.45, 0); sym.scale.setScalar(1.35); g.add(sym);
  for (let i = 0; i < 3; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.28 + i * 0.26, 0.07, 8, 32, PI * 0.55), arcM(0.9)); a.rotation.z = PI / 2 - PI * 0.275; sym.add(a); arcs.push(a); }
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), arcM(1)); dot.position.y = 0.0; sym.add(dot); arcs.unshift(dot);
  return { g, arcs, leds, sym };
}

function wifiSign(root, x, z, rotY) {
  const g = new THREE.Group(); root.add(g); g.position.set(x, groundY(x, z), z); g.rotation.y = rotY;
  mk(new THREE.BoxGeometry(0.1, 1.5, 0.1), std(0x7a5634), g, 0, 0.75, 0);
  mk(new THREE.BoxGeometry(1.5, 0.6, 0.06), std(0xffffff, 0.6, { map: tex(512, 205, (c, w, h) => { c.fillStyle = '#1f6fd1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#fff'; c.font = '92px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FREE WIFI', w / 2, h / 2 + 8); }) }), g, 0, 1.5, 0);
  return g;
}

/** The library on its rise: red brick, a white portico with LIBRARY on the frieze, steps, double doors (hinge groups), windows;
 *  one front window always lit (Tyler's). Front faces +z. Origin = the forecourt in front of the steps. */
function library(root) {
  const [x0, z0] = SPOT.library, y0 = groundY(x0, z0 + 6) + 0.05;
  const g = new THREE.Group(); g.position.set(x0, y0, z0); root.add(g);
  const brick = tex(512, 512, (c, w, h) => { c.fillStyle = '#b5523b'; c.fillRect(0, 0, w, h); c.fillStyle = '#e9d6c4'; for (let r = 0; r < 16; r++) { c.fillRect(0, r * 32, w, 3); for (let k = 0; k < 9; k++) c.fillRect((k * 64 + (r % 2) * 32) % w, r * 32, 3, 32); } for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${i % 3 ? 120 : 200},${60 + (i % 5) * 8},40,0.18)`; c.fillRect((i * 97) % w, ((i * 61) % 16) * 32 + 3, 61, 29); } });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(4, 2);
  const brickM = std(0xffffff, 0.9, { map: brick }), white = std(0xf4efe6, 0.6), slate = std(0x3f4652, 0.8), stone = std(0xc9c2b4, 0.9);
  const W = 12, H = 5.6, Dp = 8, zf = -2.4;   // body front face at z = zf
  mk(new THREE.BoxGeometry(W + 1.2, 4, Dp + 1.6), stone, g, 0, -1.9, zf - Dp / 2 + 0.2);   // plinth down into the hill
  mk(new THREE.BoxGeometry(W, H, Dp), brickM, g, 0, H / 2 + 0.1, zf - Dp / 2);
  const roof = mk(prism(Dp + 0.7, 1.9, W + 0.7), slate, g, 0, H + 0.35, zf - Dp / 2); roof.rotation.y = PI / 2;
  mk(new THREE.BoxGeometry(W + 0.5, 0.35, Dp + 0.5), white, g, 0, H + 0.2, zf - Dp / 2);   // cornice
  // portico: a raised stone platform, steps down to the forecourt, 4 columns, a frieze with LIBRARY + a pediment
  mk(new THREE.BoxGeometry(7.6, 0.7, 2.6), stone, g, 0, 0.35, zf + 1.3);
  for (let s = 0; s < 3; s++) mk(new THREE.BoxGeometry(5.6, 0.7 - (s + 1) * 0.175, 0.42), stone, g, 0, (0.7 - (s + 1) * 0.175) / 2, zf + 2.6 + 0.21 + s * 0.42);
  const colG = new THREE.CylinderGeometry(0.24, 0.28, 3.7, 16);
  for (const cx of [-3.1, -1.3, 1.3, 3.1]) { mk(colG, white, g, cx, 0.7 + 1.85, zf + 2.1); mk(new THREE.BoxGeometry(0.66, 0.16, 0.66), white, g, cx, 4.48, zf + 2.1); mk(new THREE.BoxGeometry(0.66, 0.16, 0.66), white, g, cx, 0.78, zf + 2.1); }
  const signT = tex(1024, 160, (c, w, h) => { c.fillStyle = '#f4efe6'; c.fillRect(0, 0, w, h); c.fillStyle = '#5b2a1e'; c.font = 'bold 104px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('L I B R A R Y', w / 2, h / 2 + 6); });
  mk(new THREE.BoxGeometry(7.6, 0.9, 2.7), white, g, 0, 5.0, zf + 1.3);
  const frieze = mk(new THREE.PlaneGeometry(6.8, 0.8), std(0xffffff, 0.6, { map: signT }), g, 0, 5.0, zf + 2.66);
  mk(prism(7.8, 1.25, 2.7), white, g, 0, 5.45, zf + 1.3);
  // double doors (hinge groups at the outer edges; open = rotation.y ∓ 1.4) + a warm lit doorway behind
  const doorM = std(0x5a3a22, 0.6), doors = [];
  mk(new THREE.PlaneGeometry(2.0, 2.9), new THREE.MeshBasicMaterial({ color: 0xffc77a, toneMapped: false }), g, 0, 0.7 + 1.45, zf + 0.02);
  for (const s of [-1, 1]) { const h = new THREE.Group(); h.position.set(s * 1.0, 0.7, zf + 0.06); g.add(h); const d = mk(new THREE.BoxGeometry(1.0, 2.9, 0.08), doorM, h, -s * 0.5, 1.45, 0); mk(new THREE.SphereGeometry(0.05, 8, 6), std(0xd8b45a, 0.3, { metalness: 0.7 }), h, -s * 0.85, 1.4, 0.07); doors.push(h); }
  mk(new THREE.BoxGeometry(2.3, 0.2, 0.2), white, g, 0, 3.6, zf + 0.05);
  // windows: 2 rows; glass = a dark day glass, Tyler's = warm lit (emissive)
  const glassM = std(0x2b3d55, 0.15, { metalness: 0.2, emissive: 0xffc77a, emissiveIntensity: 0 }), litM = std(0xffd28a, 0.4, { emissive: 0xffbf66, emissiveIntensity: 1.2 });
  const wins = [];
  for (const row of [0, 1]) for (const wx of [-5.2, -4.25, 4.25, 5.2]) {
    const yy = row ? 4.0 : 1.9, lit = row === 0 && wx === -4.25;
    mk(new THREE.BoxGeometry(0.85, 1.5, 0.12), white, g, wx, yy, zf + 0.02);
    const gl = mk(new THREE.PlaneGeometry(0.68, 1.3), lit ? litM : glassM, g, wx, yy, zf + 0.09); wins.push(gl);
    mk(new THREE.BoxGeometry(0.06, 1.3, 0.04), white, g, wx, yy, zf + 0.11); mk(new THREE.BoxGeometry(0.68, 0.06, 0.04), white, g, wx, yy, zf + 0.11);
  }
  // Tyler at his desk, seen through the lit window: a dark silhouette (head + hunched shoulders) against the warm glow
  const sil = new THREE.Group(); g.add(sil); sil.position.set(-4.25, 1.62, zf + 0.1);   // in FRONT of the lit glass: a shadow on the blind
  const silM = new THREE.MeshBasicMaterial({ color: 0x3b2618 }), fl = (geo, x, y, sx, sy) => { const m = new THREE.Mesh(geo, silM); m.position.set(x, y, 0); m.scale.set(sx, sy, 1); sil.add(m); return m; };
  fl(new THREE.CircleGeometry(0.15, 24), 0.03, 0.36, 1, 1.05); fl(new THREE.CircleGeometry(0.3, 24, 0, PI), 0.0, -0.02, 1, 0.75);
  fl(new THREE.PlaneGeometry(0.6, 0.06), 0, -0.04, 1, 1);   // the desk edge
  // lamp posts down the path + a bench + a book-return box
  const lamps = [];
  for (const s of [-1, 1]) { const lx = x0 + s * 6.8, lz = z0 + 4.5, p = new THREE.Group(); p.position.set(lx - x0, groundY(lx, lz) - y0, lz - z0); g.add(p); mk(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 8), std(0x2b2e33, 0.4), p, 0, 1.6, 0); const bulb = mk(new THREE.SphereGeometry(0.22, 14, 10), std(0xfff1cc, 0.4, { emissive: 0xffd590, emissiveIntensity: 0.2 }), p, 0, 3.3, 0); lamps.push(bulb); }
  const ret = new THREE.Group(); g.add(ret); ret.position.set(5.6, 0, zf + 1.4); mk(new THREE.BoxGeometry(0.8, 1.1, 0.6), std(0x2f5ea8, 0.5), ret, 0, 0.55, 0); mk(new THREE.PlaneGeometry(0.6, 0.3), std(0xffffff, 0.6, { map: tex(256, 128, (c, w, h) => { c.fillStyle = '#2f5ea8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.fillText('BOOK', w / 2, 52); c.fillText('RETURN', w / 2, 100); }) }), ret, 0, 0.8, 0.31);
  return { g, doors, wins, glassM, litM, lamps, sil, zf, y0, frontZ: z0 + zf, doorWorld: [x0, y0 + 0.6, z0 + zf + 0.3], steps: [x0, y0, z0 + zf + 3.6], porch: [x0, y0 + 0.7, z0 + zf + 1.4] };
}

function beachProps(root) {
  const [bx, bz] = SPOT.beach, g = new THREE.Group(); root.add(g);
  const by = groundY(bx, bz); g.position.set(bx, by, bz);
  const log = mk(new THREE.CylinderGeometry(0.26, 0.28, 2.6, 12), std(0x8a6a48, 0.9), g, 0, 0.24, 0); log.rotation.z = PI / 2; log.rotation.y = 0.15;
  for (const s of [-1, 1]) mk(new THREE.CircleGeometry(0.25, 12), std(0xc9a477, 0.9), g, s * 1.3, 0.24, 0.2 * s).rotation.y = s * PI / 2 + 0.15;
  const post = new THREE.Group(); g.add(post); post.position.set(1.15, groundY(bx + 1.15, bz + 0.3) - by, 0.3);
  mk(new THREE.CylinderGeometry(0.11, 0.13, 0.9, 10), std(0x7c6248, 0.9), post, 0, 0.45, 0);
  mk(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 10), std(0xb59a78, 0.9), post, 0, 0.91, 0);
  const rocks = []; const R = rng(9); for (let i = 0; i < 6; i++) { const r = mk(new THREE.DodecahedronGeometry(0.25 + R() * 0.35, 0), std(0x8c8f93, 0.9, { flatShading: true }), g, -2.5 + R() * 6, 0.05, -1.5 + R() * 3); r.scale.y = 0.6; rocks.push(r); }
  const umb = new THREE.Group(); g.add(umb); umb.position.set(-2.4, 0, -1.2); mk(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), std(0xeeeeee), umb, 0, 1.15, 0); const can = mk(new THREE.ConeGeometry(1.2, 0.5, 10), std(0xff5a5f, 0.6), umb, 0, 2.3, 0);
  return { g, log, post, perch: [bx + 1.15, groundY(bx + 1.15, bz + 0.3) + 0.93, bz + 0.3], seat: [bx, by + 0.47, bz], umb };
}

export async function buildIsland(studio) {
  await document.fonts.load('86px "Luckiest Guy"').catch(() => {});
  const S = await buildLighthouse(studio);
  // keep the sky, the sea and the lights; hide the rock, the tower, the shack, the sign, the ladder, the coast, the rowboat, the spray
  const keep = new Set([S.sky.dome, S.sky.stars, S.sky.moon, S.sky.moonGlow, ...S.sky.clouds, S.ocean.mesh, S.hemi, S.sun, S.sun.target]);
  for (const o of S.root.children) if (!keep.has(o)) o.visible = false;
  const root = new THREE.Group(); S.root.add(root);
  const ground = islandMesh(root), foam = shoreFoam(root);
  const L = library(root), O = orchard(root), B = beachProps(root);
  const router = makeRouter(); root.add(router.g); { const [x, z] = SPOT.wifi; router.g.position.set(x, groundY(x, z), z); }
  const wsign = wifiSign(root, SPOT.wifi[0] + 1.3, SPOT.wifi[1] - 1.1, -0.15);
  const zones = [[SPOT.orchard[0], SPOT.orchard[1], 10.5], [SPOT.wifi[0], SPOT.wifi[1], 7], [SPOT.drop[0], SPOT.drop[1], 9], [SPOT.library[0], SPOT.library[1] - 3, 9], [SPOT.library[0], SPOT.library[1] + 6, 6], [SPOT.library[0], SPOT.library[1] + 14, 6.5], [SPOT.library[0] - 1, SPOT.library[1] + 22, 6], [SPOT.beach[0], SPOT.beach[1], 8], [SPOT.beach[0] - 2, SPOT.beach[1] - 8, 6], [0, 0, 4]];
  const F = forest(root, zones);
  return { S, root, ground, foam, L, O, B, router, wsign, F, groundY, SPOT, setMood: S.setMood, aimSun: S.aimSun };
}
