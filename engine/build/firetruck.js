// Front-yard + fire-truck cutaway set (build genre, video 033 "How a Squirt Gun Becomes a Fire Truck"). Late-afternoon
// suburb: the ground is sliced at the curb (z = 0, camera on +z), so the cut face shows the strata, the CITY WATER MAIN cut
// lengthwise (along x) and the fire hydrant's dry barrel in section rising out of it (stem + main valve at the bottom).
// Behind the curb: the grass verge with the hydrant, the sidewalk, Gary's lawn (the gas grill, the tall tree with the CAT
// on its branch ≈ 20 ft up, a hedge row behind the grill), the bungalow + garage, neighbours, a far ring of roofs.
// Left → right (x, m): neighbour (−24…−12.5) · tree (−8.6) · hedge (−13…1) · grill (−4.6) · hydrant (−1.6) · truck
// (parks with its tail at x −0.5, cab to +x) · driveway (4.8…8) · garage · right neighbour (12…22).
// Props: makeFireTruck (a rollback flatbed that grows into a ladder truck, near side cut open: the tank water is a section
// polygon = level ∩ tank, the centrifugal pump spins in section, deck gun, mid-air turntable + 4-section 100-ft ladder,
// four outriggers, light bar), makeTank (tote → booster tank), makeSectionWater, makeFires (instanced sprite flames +
// smoke + fireballs), makeJet (a ballistic water stream as a tube), makeTube (any tube along points: hoses),
// makeGrill, makeHydrant, makeWagon, makeSquirtGun, makeNozzle, makeWrench, makeTriangleSign, makeYardCat, makeDalmatian.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, mk, rng, clamp, lerp } from '../core.js';
import { makeCutFace, maskedPlane, lawnTexture } from './cutaway.js';
import { makeArrows } from './fx.js';

const PI = Math.PI;
export const D = {
  face: { x0: -26, x1: 28, y0: -5, y1: 0 },
  curb: { z1: -0.3, h: 0.14 }, walk: { z0: -1.25, z1: -2.55 }, lawnZ: -2.55,
  main: { y: -1.45, z: -0.12, r: 0.32, band: [-1.75, -1.15] },   // the city water main (cut lengthwise; the face hole is its chord)
  hyd: { x: -1.6, z: -0.42, bz: -0.06, br: 0.11 },                 // the hydrant; its buried barrel axis sits at bz (cut in half)
  grill: { x: -4.6, z: -5.6 },
  tree: { x: -8.6, z: -6.4, branch: [[-8.45, 5.3, -6.3], [-6.4, 6.0, -4.75]] },
  hedge: { z: -8.6, x0: -13.5, x1: 1.2, h: 1.45, d: 0.9 },
  truck: { z: -4.3, tail0: 8.55, tail: 4.55, len: 7.05 },   // the tail end's x (the cab faces −x): parked at tail0, drives 4 m to tail
  wagon: [7.05, -2.35],
  house: { x0: -7.5, x1: 3.8, z0: -12.0, z1: -18.0, h: 3.1 },
  garage: { x0: 4.4, x1: 9.2, z0: -12.6 },
  drive: { x0: 4.9, x1: 8.6 },
};
{ const [S, E] = D.tree.branch, u = 0.83; D.cat = [lerp(S[0], E[0], u), lerp(S[1], E[1], u) + 0.09, lerp(S[2], E[2], u)]; }   // the cat sits on the branch top (≈ 6.05 m = 20 ft)

const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
const steel = (c = 0xb9c0c7, r = 0.3) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.7 });
const SECTION = new THREE.MeshStandardMaterial({ color: 0xf3ece0, roughness: 0.9 });
const signTex = (text, { w = 512, h = 160, bg = '#c0392b', fg = '#fff', px = 96, border = null } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); }
  let s = px; g.font = font(s); while (g.measureText(text).width > w * 0.88 && s > 20) { s -= 4; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + s * 0.06);
});

// ---------------------------------------------------------------- the ground in section
function paintYard(g, P) {
  const { x0, x1 } = D.face, wave = (x, k) => 0.05 * Math.sin(x * 0.8 + k) + 0.035 * Math.sin(x * 2.3 + 2 * k);
  const layers = [[0.0, '#4f3420'], [-0.45, '#7a5232'], [-1.0, '#a06a3e'], [-2.45, '#b99464'], [-3.7, '#8f8a80']];
  layers.forEach(([top, col], i) => { g.fillStyle = col; g.beginPath(); g.moveTo(P.x(x0), P.y(top + (i ? wave(x0, i) : 0))); for (let x = x0; x <= x1; x += 0.25) g.lineTo(P.x(x), P.y(top + (i ? wave(x, i) : 0))); g.lineTo(P.x(x1), P.H); g.lineTo(P.x(x0), P.H); g.closePath(); g.fill(); });
  const R = rng(33);
  const blot = (yT, yB, cols, n, rx, ry) => { for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = yB + R() * (yT - yB); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(rx * (0.5 + R())), P.s(ry * (0.5 + R())), 0, 0, 7); g.fill(); } };
  blot(-0.1, -0.45, ['rgba(20,12,6,.25)', 'rgba(110,72,44,.2)'], 220, 0.5, 0.04);
  blot(-0.5, -1.0, ['rgba(60,36,18,.2)', 'rgba(160,110,70,.18)'], 240, 0.7, 0.05);
  blot(-1.0, -2.45, ['rgba(130,70,30,.2)', 'rgba(210,150,95,.16)'], 380, 0.9, 0.06);
  blot(-2.5, -3.7, ['rgba(150,120,80,.2)', 'rgba(220,196,150,.18)'], 380, 1.0, 0.07);
  blot(-3.7, -5, ['rgba(100,96,90,.25)', 'rgba(170,166,158,.2)'], 260, 1.2, 0.12);
  for (let i = 0; i < 20000; i++) { const x = x0 + R() * (x1 - x0), y = -0.05 - R() * 4.9, L = 0.025 + R() * 0.06; g.strokeStyle = R() < 0.55 ? `rgba(50,30,16,${0.1 + R() * 0.15})` : `rgba(255,224,176,${0.05 + R() * 0.1})`; g.lineWidth = P.s(0.008 + R() * 0.01); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.lineTo(P.x(x + (R() - 0.5) * 0.03), P.y(y - L)); g.stroke(); }
  const pebble = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(r), P.s(r * 0.7), R() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(P.x(x - r * 0.25), P.y(y + r * 0.2), P.s(r * 0.35), P.s(r * 0.2), 0, 0, 7); g.fill(); };
  for (let i = 0; i < 420; i++) pebble(x0 + R() * (x1 - x0), -0.5 - R() * 4.4, 0.03 + R() * 0.07, ['#8c7a68', '#b2a184', '#6f665c'][i % 3]);
  // the curb's gravel base + the bedding sand around the main
  g.fillStyle = '#9a958c'; g.fillRect(P.x(x0), P.y(0), P.s(x1 - x0), P.s(0.2)); for (let i = 0; i < 900; i++) pebble(x0 + R() * (x1 - x0), -0.02 - R() * 0.16, 0.012 + R() * 0.02, ['#6f6a62', '#c2bdb2', '#8a857c'][i % 3]);
  const [b0, b1] = D.main.band;
  g.fillStyle = '#d8c49a'; g.fillRect(P.x(x0), P.y(b1 + 0.24), P.s(x1 - x0), P.s(b1 - b0 + 0.48)); for (let i = 0; i < 700; i++) pebble(x0 + R() * (x1 - x0), b0 - 0.22 + R() * (b1 - b0 + 0.44), 0.012 + R() * 0.018, ['#b9a57c', '#efe0bd'][i % 2]);
  // the main's iron wall in section (above + below the hole) and the hydrant barrel's walls
  g.fillStyle = '#3c5f84'; g.fillRect(P.x(x0), P.y(b1 + 0.08), P.s(x1 - x0), P.s(0.08)); g.fillRect(P.x(x0), P.y(b0), P.s(x1 - x0), P.s(0.08));
  g.fillStyle = '#5c86b0'; g.fillRect(P.x(x0), P.y(b1 + 0.08), P.s(x1 - x0), P.s(0.02)); g.fillRect(P.x(x0), P.y(b0), P.s(x1 - x0), P.s(0.02));
  for (let x = x0 + 3.5; x < x1; x += 6.0) { g.fillStyle = '#2f4a68'; g.fillRect(P.x(x - 0.08), P.y(b1 + 0.13), P.s(0.16), P.s(b1 - b0 + 0.26)); }   // pipe joints (bells)
  const hx = D.hyd.x;
  g.fillStyle = '#8e2a22'; g.fillRect(P.x(hx - 0.15), P.y(0), P.s(0.05), P.s(-b1)); g.fillRect(P.x(hx + 0.1), P.y(0), P.s(0.05), P.s(-b1));
  g.fillStyle = '#8e2a22'; g.beginPath(); g.moveTo(P.x(hx - 0.15), P.y(b1)); g.lineTo(P.x(hx - 0.3), P.y(b1 + 0.02)); g.lineTo(P.x(hx - 0.3), P.y(b1 + 0.1)); g.lineTo(P.x(hx - 0.15), P.y(b1 + 0.2)); g.fill();
  g.beginPath(); g.moveTo(P.x(hx + 0.15), P.y(b1)); g.lineTo(P.x(hx + 0.3), P.y(b1 + 0.02)); g.lineTo(P.x(hx + 0.3), P.y(b1 + 0.1)); g.lineTo(P.x(hx + 0.15), P.y(b1 + 0.2)); g.fill();   // the "shoe" flange onto the main
  g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `bold ${P.s(0.13)}px Arial`; g.textAlign = 'left'; g.fillText('FROST LINE', P.x(hx + 0.4), P.y(-0.92)); g.setLineDash([P.s(0.12), P.s(0.08)]); g.strokeStyle = 'rgba(220,240,255,.55)'; g.lineWidth = P.s(0.02); g.beginPath(); g.moveTo(P.x(hx - 3.5), P.y(-1.0)); g.lineTo(P.x(hx + 3.5), P.y(-1.0)); g.stroke(); g.setLineDash([]);
  // roots under the tree (branching, tapering)
  const root = (x, y, a, len, w, d) => { if (d > 5 || w < 0.008) return; const xe = x + Math.cos(a) * len, ye = y + Math.sin(a) * len; g.strokeStyle = '#6b4a2e'; g.lineCap = 'round'; g.lineWidth = P.s(w); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.quadraticCurveTo(P.x((x + xe) / 2 + (R() - 0.5) * 0.2), P.y((y + ye) / 2), P.x(xe), P.y(ye)); g.stroke(); root(xe, ye, a + (R() - 0.5) * 0.9 - 0.15, len * 0.75, w * 0.62, d + 1); if (R() < 0.75) root(xe, ye, a + (R() - 0.5) * 1.3 + 0.2, len * 0.6, w * 0.5, d + 1); };
  for (let k = 0; k < 6; k++) root(D.tree.x + (k - 2.5) * 0.12, -0.05, -PI / 2 + (k - 2.5) * 0.42, 0.55, 0.11, 0);
  // pipes in section: gas (yellow), a cable conduit, the sewer
  const pipe = (x, y, r, ring, inner) => { g.fillStyle = ring; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r), 0, 7); g.fill(); g.fillStyle = inner; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r * 0.75), 0, 7); g.fill(); };
  pipe(5.6, -0.75, 0.09, '#e3b52b', '#5a4510'); pipe(13.5, -2.8, 0.34, '#7d6a58', '#2c241c'); pipe(-14.5, -0.6, 0.07, '#d9822b', '#4a2a10'); pipe(-14.25, -0.6, 0.07, '#d9822b', '#4a2a10');
  // buried stuff (easter eggs): a horseshoe (no horses here), a dog bone, an old squirt gun, a toy fire truck
  g.save(); g.translate(P.x(9.3), P.y(-2.2)); g.rotate(0.4); g.strokeStyle = '#8b8f94'; g.lineWidth = P.s(0.05); g.beginPath(); g.arc(0, 0, P.s(0.13), 0.35 * PI, 2.65 * PI); g.stroke(); g.restore();
  g.save(); g.translate(P.x(-3.3), P.y(-0.72)); g.rotate(-0.3); g.fillStyle = '#efe6d2'; g.fillRect(-P.s(0.14), -P.s(0.025), P.s(0.28), P.s(0.05)); for (const s of [-1, 1]) for (const t of [-1, 1]) { g.beginPath(); g.arc(s * P.s(0.14), t * P.s(0.03), P.s(0.035), 0, 7); g.fill(); } g.restore();
  g.save(); g.translate(P.x(-17.5), P.y(-1.7)); g.rotate(0.2); g.fillStyle = '#ff8a2b'; g.fillRect(-P.s(0.12), -P.s(0.04), P.s(0.24), P.s(0.07)); g.fillRect(-P.s(0.1), P.s(0.02), P.s(0.05), P.s(0.08)); g.fillStyle = '#4fbf5a'; g.beginPath(); g.arc(-P.s(0.02), -P.s(0.07), P.s(0.045), 0, 7); g.fill(); g.restore();
  g.save(); g.translate(P.x(19.5), P.y(-3.3)); const s = P.ppm / 100; g.scale(s, s); g.fillStyle = '#efe4c8'; g.strokeStyle = '#c9b88f'; g.lineWidth = 3; g.fillRect(-60, -30, 120, 32); g.strokeRect(-60, -30, 120, 32); g.fillRect(20, -52, 40, 24); g.strokeRect(20, -52, 40, 24); for (const wx of [-38, 38]) { g.beginPath(); g.arc(wx, 8, 14, 0, 7); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(-58, -36); g.lineTo(18, -60); g.stroke(); g.restore();
}

// ---------------------------------------------------------------- generic dynamic tube (hoses, water jets)
/** A tube through points (rebuilt every frame, no allocation): set(pts: Vector3[seg + 1], radius: number | (u) => r). */
export function makeTube(parent, material, { seg = 32, rad = 8 } = {}) {
  const N = (seg + 1) * (rad + 1), pos = new Float32Array(N * 3), nor = new Float32Array(N * 3), uv = new Float32Array(N * 2), idx = [];
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  for (let i = 0; i <= seg; i++) for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; uv[k * 2] = i / seg; uv[k * 2 + 1] = j / rad; }
  const geo = new THREE.BufferGeometry(); geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(geo, material); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
  const T = new THREE.Vector3(), Nv = new THREE.Vector3(), Bv = new THREE.Vector3(), tmp = new THREE.Vector3();
  return {
    mesh,
    set(pts, radius) {
      Nv.set(0, 1, 0);
      for (let i = 0; i <= seg; i++) {
        const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(seg, i + 1)];
        T.subVectors(b, a); if (T.lengthSq() < 1e-10) T.set(1, 0, 0); T.normalize();
        if (i === 0) { Nv.set(0, 1, 0); if (Math.abs(T.y) > 0.9) Nv.set(1, 0, 0); }
        Nv.addScaledVector(T, -Nv.dot(T)); if (Nv.lengthSq() < 1e-8) Nv.set(0, 0, 1); Nv.normalize(); Bv.crossVectors(T, Nv);
        const r = typeof radius === 'function' ? radius(i / seg) : radius;
        for (let j = 0; j <= rad; j++) {
          const ang = (j / rad) * PI * 2, c = Math.cos(ang), s = Math.sin(ang), k = (i * (rad + 1) + j) * 3;
          tmp.copy(Nv).multiplyScalar(c).addScaledVector(Bv, s);
          nor[k] = tmp.x; nor[k + 1] = tmp.y; nor[k + 2] = tmp.z;
          pos[k] = p.x + tmp.x * r; pos[k + 1] = p.y + tmp.y * r; pos[k + 2] = p.z + tmp.z * r;
        }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere();
    },
  };
}

/** A hose through control points (CatmullRom, arc-length spaced). set(ctrl: [[x,y,z],…], r). */
export function makeHose(parent, { r = 0.05, color = 0xe8d23a, seg = 40 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const tube = makeTube(parent, m, { seg, rad: 8 }), pts = Array.from({ length: seg + 1 }, () => new THREE.Vector3());
  return {
    mesh: tube.mesh, m,
    set(ctrl, rr = r) { const c = new THREE.CatmullRomCurve3(ctrl.map((p) => new THREE.Vector3(...p)), false, 'centripetal'); const sp = c.getSpacedPoints(seg); for (let i = 0; i <= seg; i++) pts[i].copy(sp[i]); tube.set(pts, rr); },
  };
}

// ---------------------------------------------------------------- water: a ballistic jet, section water (level ∩ container)
let streakT = null;
function streakTex() {
  if (streakT) return streakT;
  streakT = tex(256, 64, (g, w, h) => { g.fillStyle = '#cfeeff'; g.fillRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + R() * 0.5})`; g.fillRect(R() * w, R() * h, 18 + R() * 60, 1.5 + R() * 3); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,150,210,${0.15 + R() * 0.2})`; g.fillRect(R() * w, R() * h, 20 + R() * 50, 2 + R() * 3); } });
  streakT.wrapS = streakT.wrapT = THREE.RepeatWrapping; return streakT;
}
/** A water stream from a nozzle: set(t, p0, v0, {k, age, off, floor, stop, g, r}). The arc is ballistic (p0 + v0·τ + ½g τ²): it
 *  grows from the nozzle at the water's speed (age = s since on), detaches when the valve shuts (off = s since off) and ends where
 *  it hits the floor / a stop(p) test. Drops spray from the end; `end` = the last impact point (for splashes). */
export function makeJet(parent, { r = 0.06, seg = 30, drops = 46 } = {}) {
  const tx = streakTex().clone(); tx.needsUpdate = true; tx.repeat.set(3, 1);
  const m = new THREE.MeshBasicMaterial({ color: 0xe6f6ff, map: tx, transparent: true, opacity: 0.93, depthWrite: false });   // unlit: a lit glossy tube read as a glass rod (033 look review)
  const tube = makeTube(parent, m, { seg, rad: 10 }); tube.mesh.castShadow = false; tube.mesh.renderOrder = 4;
  const sheath = makeTube(parent, new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.3, depthWrite: false }), { seg, rad: 10 }); sheath.mesh.castShadow = false; sheath.mesh.renderOrder = 4;
  const mistT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const mists = Array.from({ length: 12 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistT, color: 0xf2faff, transparent: true, depthWrite: false })); sp.renderOrder = 5; parent.add(sp); return sp; });
  const pts = Array.from({ length: seg + 1 }, () => new THREE.Vector3());
  const dm = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.1, transparent: true, opacity: 0.85 }), drops);
  dm.frustumCulled = false; dm.castShadow = false; parent.add(dm);
  const end = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p = new THREE.Vector3();
  const api = {
    end, on: false, mesh: tube.mesh,
    set(t, p0, v0, { k = 1, age = 99, off = -1, floor = 0, stop = null, g = 9.8, r: rr = r, spray = 1 } = {}) {
      api.on = k > 0.01 && age > 0 && (off < 0 || off < 3);
      tube.mesh.visible = sheath.mesh.visible = api.on; dm.visible = api.on; mists.forEach((sp) => (sp.visible = false)); if (!api.on) { dm.count = 0; return; }
      const at = (tau, out) => out.set(p0.x + v0.x * tau, p0.y + v0.y * tau - 0.5 * g * tau * tau, p0.z + v0.z * tau);
      let tHit = (v0.y + Math.sqrt(Math.max(0, v0.y * v0.y + 2 * g * (p0.y - floor)))) / g;
      if (stop) { for (let i = 1; i <= 80; i++) { const tau = (i / 80) * tHit; if (stop(at(tau, p))) { tHit = tau; break; } } }
      const t1 = Math.min(age * 1.0, tHit), t0 = off >= 0 ? Math.min(off, t1) : 0;
      if (t1 - t0 < 0.01) { tube.mesh.visible = sheath.mesh.visible = false; dm.visible = false; return; }
      for (let i = 0; i <= seg; i++) at(lerp(t0, t1, i / seg), pts[i]);
      at(t1, end);
      const rad = (u) => rr * k * (0.75 + 0.55 * u) * (1 + 0.08 * Math.sin(u * 40 - t * 30)) * (off >= 0 && u < 0.08 ? u / 0.08 : 1) * (u > 0.97 ? 0.6 : 1);
      tube.set(pts, rad); sheath.set(pts, (u) => rad(u) * 1.7);
      if (rr * k > 0.03) mists.forEach((sp, j) => { const u = 0.62 + 0.38 * ((j / mists.length + t * 0.9) % 1); at(lerp(t0, t1, u), sp.position); sp.position.x += (h2(j, 41) - 0.5) * rr * 4; sp.position.y += (h2(j, 42) - 0.3) * rr * 4; const sz = rr * k * (5 + 6 * u); sp.scale.setScalar(sz); sp.material.opacity = 0.32 * Math.sin(PI * u); sp.visible = true; });
      tx.offset.x = -t * 2.4;
      // spray: drops fly off the impact point (only once the stream has landed)
      let n = 0; const landed = age > tHit && t1 >= tHit - 1e-3;
      if (landed) for (let j = 0; j < drops; j++) {
        const ph = (t * (1.6 + h2(j) * 1.4) + h2(j, 3)) % 1, a = ph * 0.55, dir = h2(j, 5) * PI * 2, sp = (1.2 + h2(j, 7) * 2.2) * k * spray;
        p.set(end.x + Math.cos(dir) * sp * a, end.y + (2.2 + h2(j, 9) * 2) * a * k - 4.9 * a * a, end.z + Math.sin(dir) * sp * a);
        if (p.y < floor) continue;
        const sz = (0.025 + h2(j, 11) * 0.03) * (1 - ph) * (0.6 + 0.6 * k);
        m4.compose(p, q, s3.setScalar(sz)); dm.setMatrixAt(n++, m4);
      }
      dm.count = n; dm.instanceMatrix.needsUpdate = true;
    },
  };
  return api;
}

/** Water as level ∩ container, seen in section (docs/BUILD.md → fluids fill their container). set(cells, t): each cell
 *  {x0, x1, y0, y1, L, s} is a rectangle (the tank compartment, local coords) and the free surface y = L + s·(x − xc); the
 *  polygon is the rect clipped below that line → front face at z = +depth/2 (the cut), a closed prism behind, a surface. */
export function makeSectionWater(parent, { depth = 1.1, opacity = 0.74 } = {}) {
  const gradT = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, '#1e5f9c'); gr.addColorStop(0.75, '#4aa8e2'); gr.addColorStop(1, '#8fd3f7'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();   // shape UVs are metres: v 0…1 = the tank's height
  const front = new THREE.MeshStandardMaterial({ color: 0xffffff, map: gradT, roughness: 0.15, transparent: true, opacity, emissive: 0x0f4f82, emissiveIntensity: 0.25, depthWrite: false, side: THREE.DoubleSide });
  const back = new THREE.MeshStandardMaterial({ color: 0x1c5f97, roughness: 0.2, emissive: 0x0b3a66, emissiveIntensity: 0.35, side: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  const topM = new THREE.MeshStandardMaterial({ color: 0x9fdcff, roughness: 0.05, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
  const g = new THREE.Group(); parent.add(g);
  const secF = new THREE.Mesh(new THREE.BufferGeometry(), front), secB = new THREE.Mesh(new THREE.BufferGeometry(), back), top = new THREE.Mesh(new THREE.BufferGeometry(), topM);
  const lineM = new THREE.MeshBasicMaterial({ color: 0xe8f8ff, transparent: true, opacity: 0.9, depthWrite: false }), line = new THREE.Mesh(new THREE.BufferGeometry(), lineM);
  secF.renderOrder = 3; top.renderOrder = 4; line.renderOrder = 5; g.add(secB, secF, top, line);
  const clip = (c) => {   // the rect, clipped below the line y = L + s(x − xc)
    const xc = (c.x0 + c.x1) / 2, f = (x, y) => y - (c.L + c.s * (x - xc)), R = [[c.x0, c.y0], [c.x1, c.y0], [c.x1, c.y1], [c.x0, c.y1]], out = [];
    for (let i = 0; i < 4; i++) { const a = R[i], b = R[(i + 1) % 4], fa = f(...a), fb = f(...b); if (fa <= 0) out.push(a); if ((fa < 0) !== (fb < 0) && fa !== fb) { const u = fa / (fa - fb); out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } }
    return out;
  };
  return {
    g, front,
    set(cells, t = 0) {
      const shapes = [], tops = [];
      for (const c of cells) {
        const poly = clip(c); if (poly.length < 3) continue;
        shapes.push(new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y))));
        const xc = (c.x0 + c.x1) / 2, ya = clamp(c.L + c.s * (c.x0 - xc), c.y0, c.y1), yb = clamp(c.L + c.s * (c.x1 - xc), c.y0, c.y1);
        if (Math.max(ya, yb) > c.y0 + 0.005 && Math.min(ya, yb) < c.y1 - 0.005) tops.push([c.x0, ya, c.x1, yb]);
      }
      g.visible = shapes.length > 0; if (!g.visible) return;
      secF.geometry.dispose(); secF.geometry = new THREE.ShapeGeometry(shapes); secF.position.z = depth / 2 - 0.004;
      const vol = new THREE.ExtrudeGeometry(shapes, { depth: depth - 0.01, bevelEnabled: false, curveSegments: 1 }); vol.translate(0, 0, -depth / 2 + 0.002);
      secB.geometry.dispose(); secB.geometry = vol;
      const P = [], I = []; tops.forEach(([xa, ya, xb, yb], i) => { const w = 0.012 * Math.sin(t * 6 + i); P.push(xa, ya + w, -depth / 2, xb, yb - w, -depth / 2, xb, yb - w, depth / 2, xa, ya + w, depth / 2); const o = i * 4; I.push(o, o + 1, o + 2, o, o + 2, o + 3); });
      top.geometry.dispose(); top.geometry = new THREE.BufferGeometry(); top.geometry.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); top.geometry.setIndex(I); top.geometry.computeVertexNormals();
      const Q = [], J = []; tops.forEach(([xa, ya, xb, yb], i) => { const z = depth / 2 + 0.003, o = i * 4; Q.push(xa, ya - 0.035, z, xb, yb - 0.035, z, xb, yb + 0.005, z, xa, ya + 0.005, z); J.push(o, o + 1, o + 2, o, o + 2, o + 3); });   // the bright surface line at the cut
      line.geometry.dispose(); line.geometry = new THREE.BufferGeometry(); line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(Q, 3)); line.geometry.setIndex(J);
    },
  };
}

// ---------------------------------------------------------------- fire: instanced sprite flames + smoke + fireballs
function flameTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 92, 2, 32, 80, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.85)'); gr.addColorStop(0.7, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(32, 2); g.bezierCurveTo(60, 50, 62, 96, 32, 126); g.bezierCurveTo(2, 96, 4, 50, 32, 2); g.fill();
  const t = new THREE.CanvasTexture(c); return t;
}
function puffTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  for (let k = 0; k < 6; k++) { const x = 64 + Math.cos(k * 1.1) * 18, y = 64 + Math.sin(k * 1.7) * 14, r = 34 + (k % 3) * 8; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  return new THREE.CanvasTexture(c);
}
const alphaPatch = (m) => { m.onBeforeCompile = (sh) => { sh.vertexShader = 'attribute float aAlpha;\nvarying float vAlpha;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlpha = aAlpha;'); sh.fragmentShader = 'varying float vAlpha;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= vAlpha;'); }; };
/** Fires: add(id, {pos, box, n, size, height, rate, smoke}) once; per frame set(id, k[, pos]) (0 = out) and update(t, camera).
 *  fireball(t0, pos, R, dur) schedules a blooming ball of flame + a dark puff. Flames are additive and never tone-mapped. */
export function makeFires(parent, { max = 900, smokeMax = 420 } = {}) {
  const mkPool = (map, n, additive) => {
    const geo = new THREE.PlaneGeometry(1, 1); geo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(new Float32Array(n), 1));
    const m = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !additive, fog: true }); alphaPatch(m);
    const mesh = new THREE.InstancedMesh(geo, m, n); mesh.frustumCulled = false; mesh.castShadow = false; mesh.renderOrder = additive ? 6 : 5;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); parent.add(mesh); return { mesh, n, live: 0 };
  };
  const F = mkPool(flameTex(), max, false), G = mkPool(flameTex(), max, true), S = mkPool(puffTex(), smokeMax, false);   // outer flames are normal-blended (additive alone washed out on a sunny wall); a small additive core glows inside each
  F.mesh.material.toneMapped = false; F.mesh.renderOrder = 6; G.mesh.renderOrder = 7;
  const src = new Map(), balls = [];
  const cA = new THREE.Color(0xfff0a0), cB = new THREE.Color(0xff8a1c), cC = new THREE.Color(0xd8300f), RIM = new THREE.Color(0x6e2410), CORE = new THREE.Color(0xffd84a), col = new THREE.Color(), sm = new THREE.Color();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3();
  const put = (P, pos, sx, sy, alpha, c) => { if (P.live >= P.n || alpha < 0.005) return; m4.compose(pos, q, s3.set(sx, sy, 1)); P.mesh.setMatrixAt(P.live, m4); P.mesh.setColorAt(P.live, c); P.mesh.geometry.attributes.aAlpha.array[P.live] = alpha; P.live++; };
  return {
    add(id, o) { src.set(id, { n: 20, size: 0.45, height: 0.9, rate: 1.5, smoke: 0, box: [0.5, 0.1, 0.5], seed: src.size * 37 + 5, k: 0, ...o, pos: new THREE.Vector3(...o.pos) }); },
    set(id, k, pos) { const s = src.get(id); s.k = k; if (pos) s.pos.set(...pos); },
    fireball(t0, pos, R = 1.2, dur = 0.9) { balls.push({ t0, pos: new THREE.Vector3(...pos), R, dur }); },
    update(t, camera) {
      F.live = 0; G.live = 0; S.live = 0; q.copy(camera.quaternion); up.set(0, 1, 0);
      for (const s of src.values()) {
        if (s.k <= 0.01) continue;
        const kk = Math.sqrt(s.k);
        for (let j = 0; j < s.n; j++) {
          const sd = s.seed + j * 13, rate = s.rate * (0.75 + 0.5 * h2(sd)), a = (t * rate + h2(sd, 1)) % 1;
          const hj = s.height * (0.6 + 0.7 * h2(sd, 4));
          p.set(s.pos.x + (h2(sd, 2) - 0.5) * s.box[0] * (1 - 0.55 * a) + Math.sin(t * 4.3 + j) * 0.05 * a, s.pos.y + h2(sd, 3) * s.box[1] + a * hj * kk, s.pos.z + (h2(sd, 5) - 0.5) * s.box[2] * (1 - 0.5 * a));
          const sz = s.size * (0.55 + 0.6 * h2(sd, 6)) * (1 - 0.55 * a) * kk;
          if (a < 0.4) col.copy(cA).lerp(cB, a / 0.4); else col.copy(cB).lerp(cC, (a - 0.4) / 0.6);
          const al = s.k * Math.pow(1 - a, 1.1) * Math.min(1, a * 9);
          put(F, p, sz, sz * 1.55, al * 0.92, col);
          if (a < 0.55) put(G, p, sz * 0.5, sz * 0.75, al * 0.85, cA);
        }
        if (s.smoke > 0) for (let j = 0; j < Math.round(s.n * 0.35 * s.smoke); j++) {
          const sd = s.seed + 500 + j * 7, a = (t * 0.32 * (0.8 + 0.4 * h2(sd)) + h2(sd, 1)) % 1;
          p.set(s.pos.x + (h2(sd, 2) - 0.5) * s.box[0] * 0.9 + a * 0.6, s.pos.y + s.height * 0.8 + a * Math.min(4, s.height * 2.2), s.pos.z + (h2(sd, 5) - 0.5) * s.box[2]);
          const sz = s.size * (0.8 + a * 1.5) * (0.7 + 0.5 * h2(sd, 3)); sm.setRGB(0.22, 0.21, 0.2).lerp(new THREE.Color(0.45, 0.43, 0.41), a);
          put(S, p, sz, sz, 0.5 * s.k * Math.sin(PI * a) * (1 - a * 0.4), sm);
        }
      }
      for (const b of balls) {
        const a = (t - b.t0) / b.dur; if (a < 0 || a > 2.2) continue;
        if (a <= 1) for (let j = 0; j < 70; j++) {
          const th = h2(j, 21) * PI * 2, ph = Math.acos(1 - 2 * h2(j, 22)) * 0.85, r = b.R * (1 - Math.pow(1 - a, 3)) * (0.35 + 0.65 * h2(j, 23));
          p.set(b.pos.x + Math.sin(ph) * Math.cos(th) * r, b.pos.y + Math.cos(ph) * r * 0.9 + a * b.R * 0.7, b.pos.z + Math.sin(ph) * Math.sin(th) * r * 0.8);
          const sz = b.R * (0.45 + 0.5 * h2(j, 24)) * (0.45 + 0.9 * a) * Math.pow(1 - a, 0.35);
          col.copy(cA).lerp(cB, clamp(a * 1.6)).lerp(cC, clamp(a * 1.4 - 0.5)).lerp(RIM, clamp(a * 1.6 - 0.9));
          put(F, p, sz, sz * 1.2, Math.pow(1 - a, 1.3), col); if (a < 0.3) put(G, p, sz * 0.55, sz * 0.65, (1 - a / 0.3) * 0.9, CORE);   // a yellow core for the first ~0.3 s (white read as a flashbulb)
        }
        if (a > 0.4) for (let j = 0; j < 30; j++) {
          const u = (a - 0.4) / 1.8; if (u > 1) continue;
          const th = h2(j, 31) * PI * 2, r = b.R * (0.5 + 0.7 * u) * (0.4 + 0.6 * h2(j, 32));
          p.set(b.pos.x + Math.cos(th) * r, b.pos.y + b.R * 0.9 + u * b.R * 2.2 + h2(j, 33) * b.R * 0.5, b.pos.z + Math.sin(th) * r * 0.6);
          const sz = b.R * (0.9 + 1.4 * u) * (0.7 + 0.5 * h2(j, 34)); sm.setRGB(0.1, 0.09, 0.09).lerp(new THREE.Color(0.38, 0.36, 0.34), u);
          put(S, p, sz, sz, 0.7 * Math.sin(PI * u) * (u < 0.15 ? u / 0.15 : 1), sm);
        }
      }
      for (const P of [F, G, S]) { P.mesh.count = P.live; P.mesh.instanceMatrix.needsUpdate = true; P.mesh.instanceColor.needsUpdate = true; P.mesh.geometry.attributes.aAlpha.needsUpdate = true; }
    },
  };
}

// ---------------------------------------------------------------- yard props
/** Gas grill (front +z). setLid(open 0..1). Handles: lid, grate, burgers[], plate + plateBurgers[] (right shelf), knobs. */
export function makeGrill() {
  const g = new THREE.Group(), red = mat(0xc8322a, 0.35), black = mat(0x222224, 0.5), st = steel(0xc5ccd3, 0.3);
  const cart = new THREE.Group(); g.add(cart);
  for (const x of [-0.42, 0.42]) for (const z of [-0.22, 0.22]) mk(new THREE.BoxGeometry(0.05, 0.78, 0.05), black, cart, x, 0.39, z);
  mk(new THREE.BoxGeometry(0.9, 0.03, 0.48), black, cart, 0, 0.22, 0);
  const tankP = mk(new THREE.CapsuleGeometry(0.13, 0.18, 6, 14), mat(0xf2f2ee, 0.4), cart, -0.2, 0.47, 0); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), st, cart, -0.2, 0.7, 0);
  for (const x of [-0.42, 0.42]) { const w = mk(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 14), black, cart, x, 0.07, 0.22); w.rotation.x = PI / 2; }
  const box = mk(new RoundedBoxGeometry(1.0, 0.34, 0.56, 2, 0.04), red, g, 0, 0.95, 0);
  mk(new THREE.BoxGeometry(0.92, 0.06, 0.02), st, g, 0, 0.88, 0.285);
  const knobs = [-0.25, 0, 0.25].map((x) => { const k = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), black, g, x, 0.88, 0.3); k.rotation.x = PI / 2; return k; });
  const grate = new THREE.Group(); g.add(grate); grate.position.y = 1.11;
  for (let i = 0; i < 9; i++) mk(new THREE.BoxGeometry(0.015, 0.012, 0.5), st, grate, -0.4 + i * 0.1, 0, 0);
  const burgerM = mat(0x6b3b22, 0.8), bunM = mat(0xe0a95a, 0.6), cheeseM = mat(0xffc93a, 0.5);
  const burgers = [-0.27, -0.09, 0.09, 0.27].map((x, i) => { const b = mk(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 16), burgerM, grate, x, 0.024, (i % 2 ? 0.08 : -0.06)); return b; });
  // the lid: a half cylinder hinged at the back top edge (rotation.x −1.75 = wide open)
  const lid = new THREE.Group(); g.add(lid); lid.position.set(0, 1.12, -0.28);
  const lidMesh = mk(new THREE.CylinderGeometry(0.28, 0.28, 1.0, 24, 1, false, 0, PI), red, lid, 0, 0, 0.28); lidMesh.rotation.z = PI / 2; lidMesh.rotation.y = PI / 2;
  lidMesh.material = red.clone(); const sootIn = mk(new THREE.CylinderGeometry(0.272, 0.272, 0.99, 24, 1, true, 0, PI), new THREE.MeshStandardMaterial({ color: 0x1a1716, roughness: 0.9, side: THREE.BackSide }), lid, 0, 0, 0.28); sootIn.rotation.z = PI / 2; sootIn.rotation.y = PI / 2;   // a soot-black inside so the flames pop
  for (const s of [-1, 1]) { const cap = mk(new THREE.CircleGeometry(0.28, 20, 0, PI), lidMesh.material, lid, s * 0.5, 0, 0.28); cap.rotation.y = s * PI / 2; }
  const handle = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), st, lid, 0, 0.0, 0.62); handle.rotation.z = PI / 2;
  mk(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10), mat(0x9aa0a6, 0.4), lid, 0, 0.29, 0.28);   // thermometer
  // side shelves: left = spatula + sauce; right = a plate of burgers (the cat's ending) + ketchup
  const shelfM = mat(0x3a3c40, 0.6);
  mk(new THREE.BoxGeometry(0.34, 0.03, 0.48), shelfM, g, -0.68, 1.08, 0); mk(new THREE.BoxGeometry(0.34, 0.03, 0.48), shelfM, g, 0.68, 1.08, 0);
  const spat = new THREE.Group(); g.add(spat); spat.position.set(-0.68, 1.1, 0.05); mk(new THREE.BoxGeometry(0.1, 0.01, 0.08), st, spat, 0, 0, 0.1); mk(new THREE.BoxGeometry(0.02, 0.02, 0.22), black, spat, 0, 0.005, -0.06);
  mk(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 12), mat(0x7a2a12, 0.5), g, -0.6, 1.17, -0.12);
  const plate = new THREE.Group(); g.add(plate); plate.position.set(0.66, 1.1, 0.02);
  mk(new THREE.CylinderGeometry(0.16, 0.13, 0.02, 24), mat(0xffffff, 0.3), plate, 0, 0, 0);
  const plateBurgers = [0, 1, 2].map((i) => { const b = new THREE.Group(); plate.add(b); b.position.set((i - 1) * 0.07, 0.03 + (i === 1 ? 0.06 : 0), i === 1 ? 0 : 0.03); mk(new THREE.SphereGeometry(0.07, 14, 8, 0, PI * 2, 0, PI / 2), bunM, b, 0, 0.03, 0).scale.y = 0.7; mk(new THREE.CylinderGeometry(0.072, 0.072, 0.025, 14), burgerM, b, 0, 0.02, 0); mk(new THREE.BoxGeometry(0.11, 0.008, 0.11), cheeseM, b, 0, 0.034, 0).rotation.y = 0.4; mk(new THREE.CylinderGeometry(0.068, 0.068, 0.02, 14), bunM, b, 0, 0.005, 0); return b; });
  mk(new THREE.CylinderGeometry(0.035, 0.04, 0.18, 12), mat(0xd8261c, 0.4), g, 0.82, 1.18, -0.14);
  const setLid = (k) => { lid.rotation.x = -1.75 * clamp(k); };
  setLid(1);
  return { g, lid, grate, burgers, plate, plateBurgers, knobs, box, setLid, red };
}

/** Fire hydrant (above ground): base at y 0; the pentagon operating nut on top (5 radial segments), a steamer port toward +x. */
export function makeHydrant() {
  const g = new THREE.Group(), red = mat(0xd7342a, 0.4), cap = steel(0xd9dde2, 0.3), nutM = steel(0x9aa3ad, 0.35);
  mk(new THREE.CylinderGeometry(0.19, 0.2, 0.06, 24), red, g, 0, 0.03, 0);
  mk(new THREE.CylinderGeometry(0.13, 0.135, 0.5, 24), red, g, 0, 0.31, 0);
  mk(new THREE.CylinderGeometry(0.155, 0.155, 0.05, 24), red, g, 0, 0.58, 0);
  const bonnet = mk(new THREE.SphereGeometry(0.14, 24, 12, 0, PI * 2, 0, PI / 2), red, g, 0, 0.6, 0); bonnet.scale.y = 0.85;
  const nut = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 5), nutM, g, 0, 0.75, 0);   // FIVE sides
  const ports = [];
  for (const [ry, r, len] of [[0, 0.075, 0.12], [PI / 2, 0.05, 0.09], [-PI / 2, 0.05, 0.09]]) {
    const p = new THREE.Group(); g.add(p); p.position.y = 0.4; p.rotation.y = ry;
    mk(new THREE.CylinderGeometry(r, r, len, 18), red, p, len / 2 + 0.1, 0, 0).rotation.z = PI / 2;
    const c = mk(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.04, 18), cap, p, len + 0.12, 0, 0); c.rotation.z = PI / 2;
    mk(new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.03, 5), nutM, p, len + 0.155, 0, 0).rotation.z = PI / 2;
    ports.push({ p, c });
  }
  return { g, nut, ports, red };
}

/** Kid's red wagon (front +x, handle out front). setCrush(k): the tub pancakes, the wheels splay. top() = tub top y. */
export function makeWagon() {
  const g = new THREE.Group(), red = mat(0xd2302a, 0.4), black = mat(0x1d1d1f, 0.6), st = steel(0xc9ced4, 0.35);
  const tub = mk(new RoundedBoxGeometry(0.95, 0.22, 0.52, 2, 0.03), red, g, 0, 0.26, 0);
  mk(new THREE.BoxGeometry(0.8, 0.02, 0.4), mat(0xffffff, 0.6), g, 0, 0.375, 0.262).scale.set(1, 1, 0.05);
  const wheels = []; for (const x of [-0.33, 0.33]) for (const z of [-0.27, 0.27]) { const w = new THREE.Group(); g.add(w); w.position.set(x, 0.09, z); const t = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), black, w); t.rotation.x = PI / 2; mk(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 10), st, w).rotation.x = PI / 2; wheels.push(w); }
  const handle = new THREE.Group(); g.add(handle); handle.position.set(0.48, 0.2, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 8), black, handle, 0.36, 0.0, 0).rotation.z = PI / 2 - 0.35; mk(new THREE.BoxGeometry(0.04, 0.04, 0.2), black, handle, 0.71, 0.13, 0);
  const setCrush = (k) => { k = clamp(k); tub.scale.y = 1 - 0.78 * k; tub.position.y = 0.26 - 0.19 * k; wheels.forEach((w, i) => { const s = i % 2 ? 1 : -1; w.rotation.x = s * 1.2 * k; w.position.y = 0.09 - 0.05 * k; w.position.z = s * (0.27 + 0.1 * k); }); handle.rotation.z = -0.35 * k; };
  setCrush(0);
  return { g, tub, wheels, handle, setCrush, top: () => tub.position.y + 0.11 * tub.scale.y };
}

/** A big tote tank → the booster tank (local: bottom-center at 0; interior x ±1.12, y 0.06…1.0, z ±0.55). setLook(k): 0 = a
 *  translucent white tote in a galvanized cage, 1 = an opaque grey booster tank with its near wall cut away (the section).
 *  water.set(cells) fills it; baffles(k) grows two baffle walls (holes in them) that split it into three cells. */
export const TANK = { x0: -1.12, x1: 1.12, y0: 0.06, y1: 1.0, d: 1.1 };
export function makeTank() {
  const g = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: 0xf4f6f6, roughness: 0.35, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
  const W = TANK.x1 - TANK.x0 + 0.06, Hh = TANK.y1 + 0.04, Dd = TANK.d + 0.06;
  const panels = {
    near: mk(new THREE.PlaneGeometry(W, Hh), wall, g, 0, Hh / 2, Dd / 2), far: mk(new THREE.PlaneGeometry(W, Hh), wall, g, 0, Hh / 2, -Dd / 2),
    l: mk(new THREE.PlaneGeometry(Dd, Hh), wall, g, -W / 2, Hh / 2, 0), r: mk(new THREE.PlaneGeometry(Dd, Hh), wall, g, W / 2, Hh / 2, 0),
    top: mk(new THREE.PlaneGeometry(W, Dd), wall, g, 0, Hh, 0), bot: mk(new THREE.PlaneGeometry(W, Dd), wall, g, 0, 0.02, 0),
  };
  panels.l.rotation.y = PI / 2; panels.r.rotation.y = PI / 2; panels.top.rotation.x = -PI / 2; panels.bot.rotation.x = -PI / 2;
  for (const p of Object.values(panels)) { p.renderOrder = 5; p.castShadow = false; }
  const opaque = new THREE.MeshStandardMaterial({ color: 0x5b6168, roughness: 0.55, side: THREE.DoubleSide });
  const inside = new THREE.MeshStandardMaterial({ color: 0x8c949b, roughness: 0.6, side: THREE.DoubleSide });
  const cage = new THREE.Group(); g.add(cage); const gal = steel(0xb8bec4, 0.45);
  for (let x = -W / 2; x <= W / 2 + 1e-3; x += W / 7) for (const z of [-Dd / 2 - 0.02, Dd / 2 + 0.02]) mk(new THREE.BoxGeometry(0.035, Hh, 0.035), gal, cage, x, Hh / 2, z);
  for (const y of [0.05, Hh / 2, Hh]) for (const z of [-Dd / 2 - 0.02, Dd / 2 + 0.02]) mk(new THREE.BoxGeometry(W, 0.035, 0.035), gal, cage, 0, y, z);
  for (const y of [0.05, Hh]) for (const x of [-W / 2, W / 2]) mk(new THREE.BoxGeometry(0.035, 0.035, Dd), gal, cage, x, y, 0);
  const pallet = mk(new THREE.BoxGeometry(W + 0.05, 0.12, Dd + 0.05), mat(0x2a2a2c, 0.8), g, 0, -0.06, 0);
  const capM = mk(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 18), mat(0xf4f4f0, 0.4), g, 0, Hh + 0.04, 0);
  const valve = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), mat(0x2f3134, 0.5), g, W / 2 + 0.05, 0.12, 0.3); valve.rotation.z = PI / 2;
  const water = makeSectionWater(g, { depth: TANK.d });
  // baffles: two plates with round holes (alpha-mapped), standing across the tank at 1/3 and 2/3
  const holeT = tex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (const [x, y] of [[0.3, 0.3], [0.7, 0.3], [0.3, 0.72], [0.7, 0.72]]) { c.beginPath(); c.arc(x * w, y * h, 15, 0, 7); c.fill(); } });
  const bafM = new THREE.MeshStandardMaterial({ color: 0x9aa2a9, roughness: 0.5, alphaMap: holeT, alphaTest: 0.5, side: THREE.DoubleSide });
  const bx = [lerp(TANK.x0, TANK.x1, 1 / 3), lerp(TANK.x0, TANK.x1, 2 / 3)];
  const bafEdge = mat(0x7d858c, 0.5), HB = TANK.y1 - TANK.y0;
  const baffles = bx.map((x) => { const b = new THREE.Group(); g.add(b); b.position.set(x, TANK.y0, 0); const p = mk(new THREE.PlaneGeometry(TANK.d, HB), bafM, b, 0, HB / 2, 0); p.rotation.y = PI / 2; for (let k = 0; k < 5; k++) mk(new THREE.BoxGeometry(0.06, HB / 5 * 0.55, 0.05), bafEdge, b, 0, HB * (k + 0.5) / 5, TANK.d / 2 + 0.01); return b; });   // in section: dashes = the holes
  const lip = mk(new THREE.BoxGeometry(W, 0.05, 0.05), SECTION, g, 0, Hh, Dd / 2); const lip2 = mk(new THREE.BoxGeometry(W, 0.05, 0.05), SECTION, g, 0, 0.02, Dd / 2);
  const lipL = mk(new THREE.BoxGeometry(0.05, Hh, 0.05), SECTION, g, -W / 2, Hh / 2, Dd / 2), lipR = mk(new THREE.BoxGeometry(0.05, Hh, 0.05), SECTION, g, W / 2, Hh / 2, Dd / 2);
  const cutLips = [lip, lip2, lipL, lipR];
  return {
    g, water, panels, cage, baffles, bx, pallet,
    setLook(k) {
      const booster = k > 0.5; cage.visible = !booster; pallet.visible = !booster; capM.visible = !booster;
      panels.near.visible = !booster; cutLips.forEach((l) => (l.visible = booster));
      for (const [n, p] of Object.entries(panels)) if (n !== 'near') p.material = booster ? (n === 'far' ? inside : opaque) : wall;
    },
    setBaffles(k) { baffles.forEach((b) => { b.visible = k > 0.01; b.scale.y = Math.max(0.01, k); }); },
  };
}

/** Squirt gun (orange, green tank), grip at the origin, muzzle toward +x. tip = the muzzle (Object3D). */
export function makeSquirtGun() {
  const g = new THREE.Group(), o = mat(0xff7a1a, 0.35), gr = mat(0x3fbf4f, 0.3);
  mk(new RoundedBoxGeometry(0.2, 0.065, 0.04, 2, 0.015), o, g, 0.06, 0.06, 0);
  mk(new RoundedBoxGeometry(0.05, 0.11, 0.035, 2, 0.012), o, g, -0.01, 0.0, 0).rotation.z = 0.25;
  mk(new THREE.SphereGeometry(0.045, 14, 10), gr, g, 0.06, 0.12, 0);
  mk(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 10), mat(0xffd23f, 0.4), g, 0.18, 0.06, 0).rotation.z = PI / 2;
  const tip = new THREE.Object3D(); g.add(tip); tip.position.set(0.21, 0.06, 0);
  return { g, tip };
}
/** Fire-hose nozzle (brass + red bail), back at the origin, spout toward +x. tip = the spout. */
export function makeNozzle() {
  const g = new THREE.Group(), brass = new THREE.MeshStandardMaterial({ color: 0xd8b04a, roughness: 0.3, metalness: 0.7 });
  mk(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 16), brass, g, 0.07, 0, 0).rotation.z = PI / 2;
  mk(new THREE.CylinderGeometry(0.035, 0.055, 0.22, 16), mat(0x2a2a2c, 0.5), g, 0.25, 0, 0).rotation.z = PI / 2;
  mk(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 12), brass, g, 0.39, 0, 0).rotation.z = PI / 2;
  const bail = mk(new THREE.TorusGeometry(0.07, 0.012, 6, 14, PI), mat(0xd42a22, 0.4), g, 0.12, 0.04, 0); bail.rotation.y = PI / 2;
  const tip = new THREE.Object3D(); g.add(tip); tip.position.set(0.43, 0, 0);
  return { g, tip };
}
/** A wrench: sides 6 = the hex wrench Gary owns, 5 = a hydrant (pentagon) wrench (yellow). Handle along +y. */
export function makeWrench(sides = 6) {
  const g = new THREE.Group(), m = sides === 5 ? mat(0xffc21a, 0.35) : steel(0xc3cad1, 0.3);
  mk(new THREE.BoxGeometry(0.045, 0.42, 0.02), m, g, 0, 0.2, 0);
  const head = mk(new THREE.TorusGeometry(0.06, 0.022, 6, sides), m, g, 0, 0.44, 0); head.rotation.z = PI / 2;
  return { g, head };
}
/** The fire-triangle sign on a stake (faces +z): HEAT, FUEL, AIR corners; the AIR corner (top) breaks off: air.g. */
export function makeTriangleSign() {
  const g = new THREE.Group(), S = 1.3;
  const T = tex(512, 460, (c, w, h) => {
    c.clearRect(0, 0, w, h); const P = [[w / 2, 20], [w - 20, h - 20], [20, h - 20]];
    c.fillStyle = '#fff6e6'; c.strokeStyle = '#d42a22'; c.lineWidth = 26; c.lineJoin = 'round'; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#3a2a1e'; c.font = font(52); c.textAlign = 'center'; c.fillText('FIRE', w / 2, h * 0.62); c.font = font(30); c.fillText('NEEDS ALL 3', w / 2, h * 0.72);
  });
  const board = mk(new THREE.PlaneGeometry(S, S * 0.9), new THREE.MeshStandardMaterial({ map: T, transparent: true, alphaTest: 0.05, roughness: 0.7, side: THREE.DoubleSide }), g, 0, 1.05, 0.02);
  mk(new THREE.BoxGeometry(0.06, 0.8, 0.04), mat(0x8a5a32, 0.8), g, 0, 0.4, -0.01);
  const badge = (txt, icon, col) => {
    const gg = new THREE.Group(); g.add(gg);
    const t2 = tex(256, 256, (c, w, h) => { c.fillStyle = col; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 6, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 10; c.stroke(); icon(c, w, h); c.fillStyle = '#fff'; c.font = font(46); c.textAlign = 'center'; c.fillText(txt, w / 2, h * 0.86); });
    mk(new THREE.CircleGeometry(0.21, 28), new THREE.MeshStandardMaterial({ map: t2, roughness: 0.6 }), gg, 0, 0, 0.03); return { g: gg };
  };
  const heat = badge('HEAT', (c, w) => { c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(w / 2, 40); c.bezierCurveTo(w * 0.78, 100, w * 0.72, 165, w / 2, 170); c.bezierCurveTo(w * 0.28, 165, w * 0.22, 100, w / 2, 40); c.fill(); }, '#e2401a');
  const fuel = badge('FUEL', (c, w) => { c.fillStyle = '#c98b4a'; c.fillRect(w * 0.22, 92, w * 0.56, 44); c.fillStyle = '#e8c08a'; c.beginPath(); c.arc(w * 0.78, 114, 22, 0, 7); c.fill(); }, '#7a4a22');
  const air = badge('AIR', (c, w) => { c.strokeStyle = '#fff'; c.lineWidth = 12; c.lineCap = 'round'; for (const [y, l] of [[78, 0.6], [112, 0.75], [146, 0.5]]) { c.beginPath(); c.moveTo(w * 0.2, y); c.lineTo(w * (0.2 + l * 0.6), y); c.arc(w * (0.2 + l * 0.6), y - 14, 14, PI / 2, -PI / 2, true); c.stroke(); } }, '#3e9be0');
  heat.g.position.set(-S * 0.42, 1.05 - S * 0.33, 0); fuel.g.position.set(S * 0.42, 1.05 - S * 0.33, 0); air.g.position.set(0, 1.05 + S * 0.38, 0);
  return { g, heat, fuel, air, board };
}

// ---------------------------------------------------------------- the cat + the Dalmatian
/** Toon tabby (faces +z, feet at y 0, ~0.55 m tall sitting). set({x,y,z,rotY, scale, sit 0..1, walk (phase), walkAmt, lids
 *  0 open…1 shut (0.55 = unimpressed), look [x,y], yawn 0..1, eat 0..1, headYaw, headPitch, tail (swish), t, climb 0..1}) */
export function makeYardCat() {
  const o = mat(0xf0923a, 0.8), cr = mat(0xfbe7cc, 0.8), stp = mat(0xc4621e, 0.8), pink = mat(0xef8f9b, 0.6), dark = mat(0x1d1410, 0.3), white = mat(0xffffff, 0.25);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 0.24;
  const hips = new THREE.Group(); body.add(hips); hips.position.z = -0.17;
  const torso = new THREE.Group(); hips.add(torso);
  const tor = mk(new THREE.CapsuleGeometry(0.15, 0.24, 8, 16), o, torso, 0, 0.0, 0.17); tor.rotation.x = PI / 2; tor.scale.set(1, 1, 0.92);
  mk(new THREE.SphereGeometry(0.12, 14, 10), cr, torso, 0, -0.05, 0.27).scale.set(0.9, 0.8, 1);
  for (let k = 0; k < 3; k++) { const s = mk(new THREE.TorusGeometry(0.15, 0.022, 6, 16, PI * 0.9), stp, torso, 0, 0.0, 0.05 + k * 0.11); s.rotation.set(0, PI / 2, PI * 0.55); }
  const head = new THREE.Group(); torso.add(head); head.position.set(0, 0.13, 0.4);
  mk(new THREE.SphereGeometry(0.165, 22, 16), o, head).scale.set(1.12, 0.95, 1);
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.07, 12, 10), cr, head, s * 0.05, -0.06, 0.12).scale.set(1, 0.8, 0.8);
  mk(new THREE.SphereGeometry(0.022, 10, 8), pink, head, 0, -0.025, 0.16);
  const mouth = mk(new THREE.SphereGeometry(0.035, 12, 8), mat(0x5a1714, 0.6), head, 0, -0.09, 0.135); mouth.scale.set(1, 0.1, 0.5);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.06, 0.012, 0.012), stp, head, s * 0.06, 0.11, 0.12).rotation.z = s * 0.3;
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); head.add(eg); eg.position.set(s * 0.068, 0.02, 0.128); eg.rotation.y = s * 0.3;
    const wh = mk(new THREE.SphereGeometry(0.05, 16, 12), mat(0xd9f06a, 0.25), eg); wh.scale.set(1, 1.05, 0.55); wh.castShadow = false;
    const pg = new THREE.Group(); eg.add(pg); const pu = mk(new THREE.SphereGeometry(0.03, 12, 10), dark, pg, 0, 0, 0.022); pu.scale.set(0.42, 1.0, 0.5); pu.castShadow = false;
    mk(new THREE.SphereGeometry(0.009, 8, 6), white, pg, 0.008, 0.015, 0.035).castShadow = false;
    const lid = mk(new THREE.SphereGeometry(0.053, 16, 10, 0, PI * 2, 0, PI / 2), o, eg); lid.scale.set(1, 1.06, 0.62); lid.castShadow = false;
    const ear = mk(new THREE.ConeGeometry(0.065, 0.13, 4), o, head, s * 0.1, 0.15, -0.02); ear.rotation.set(0, PI / 4, -s * 0.32);
    const inner = mk(new THREE.ConeGeometry(0.038, 0.08, 4), pink, head, s * 0.097, 0.14, 0.0); inner.rotation.set(0, PI / 4, -s * 0.32);
    for (let k = -1; k <= 1; k++) { const w = mk(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 4), white, head, s * 0.12, -0.05 + k * 0.014, 0.12); w.rotation.z = PI / 2 + k * 0.15 * s; w.castShadow = false; }
    eyes.push({ s, eg, pg, lid });
  }
  const legs = [];
  for (const [x, z, front] of [[-0.07, 0.3, 1], [0.07, 0.3, 1], [-0.08, 0.0, 0], [0.08, 0.0, 0]]) {
    const L = new THREE.Group(); (front ? torso : hips).add(L); L.position.set(x, -0.03, front ? z : 0.0);
    mk(new THREE.CapsuleGeometry(0.042, 0.13, 4, 8), o, L, 0, -0.1, 0); mk(new THREE.SphereGeometry(0.045, 10, 8), cr, L, 0, -0.2, 0.015).scale.set(1, 0.65, 1.25);
    if (!front) mk(new THREE.SphereGeometry(0.075, 12, 10), o, L, 0, -0.02, 0.02).scale.set(0.75, 1, 1.2);
    legs.push(L);
  }
  const tail = []; let prev = hips;
  for (let k = 0; k < 7; k++) { const s = new THREE.Group(); s.position.set(0, k ? 0.07 : 0.02, k ? 0 : -0.06); prev.add(s); mk(new THREE.CapsuleGeometry(0.03 - k * 0.002, 0.06, 4, 8), k > 4 ? stp : o, s, 0, 0.035, 0); tail.push(s); prev = s; }
  function set(p = {}) {
    const t = p.t ?? 0, sit = clamp(p.sit ?? 0), wk = p.walk, wa = p.walkAmt ?? 1;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1);
    root.rotation.x = p.pitch ?? 0;
    hips.rotation.x = -0.95 * sit; body.position.y = 0.24 - 0.11 * sit;
    const sw = wk == null ? 0 : Math.sin(wk) * 0.6 * wa;
    legs.forEach((L, i) => { const front = i < 2; L.rotation.x = front ? 0.95 * sit + (i === 0 ? sw : -sw) * (1 - sit) : -0.65 * sit + (i === 2 ? -sw : sw) * (1 - sit); if (!front) L.position.y = -0.03 + 0.05 * sit; else L.scale.y = 1 + 0.55 * sit; });   // sitting: the front legs reach the ground
    body.position.y += wk == null ? 0 : Math.abs(Math.cos(wk)) * 0.015 * wa;
    const yawn = clamp(p.yawn ?? 0), eat = clamp(p.eat ?? 0);
    head.rotation.set(0.95 * sit - 0.45 * yawn + (p.headPitch ?? 0) + eat * (0.55 + 0.25 * Math.sin(t * 14)), p.headYaw ?? 0, 0);
    mouth.scale.set(1 + 0.4 * yawn, 0.1 + 1.5 * yawn + 0.6 * eat * Math.max(0, Math.sin(t * 14)), 0.5);
    const lids = clamp(Math.max(p.lids ?? 0.15, yawn * 0.9)), [lx, ly] = p.look || [0, 0];
    for (const e of eyes) { e.lid.rotation.x = lerp(-1.25, 1.55, lids); e.pg.position.set(clamp(lx, -1, 1) * 0.018, clamp(ly, -1, 1) * 0.02, 0); }
    const sws = p.tail ?? 1;
    tail.forEach((s, k) => { s.rotation.x = k === 0 ? -1.3 + 0.9 * sit : lerp(0.22, -0.04, sit); s.rotation.z = (k ? lerp(0, 0.4, sit) : 0) + Math.sin(t * 2.4 - k * 0.6) * (0.2 - 0.12 * sit) * sws; });   // sitting: it lies back along the ground and curls round the side
  }
  set({});
  return { root, head, set, eyes };
}

/** Toon Dalmatian (faces +z, ~0.62 m at the head). set({x,y,z,rotY, scale, sit 0..1, run (phase), runAmt, headYaw, headPitch,
 *  tongue 0..1, t, pole 0..1 (hugging a pole: upright)}) */
export function makeDalmatian() {
  const w = mat(0xf7f5f0, 0.75), blk = mat(0x161616, 0.6), pink = mat(0xe8707e, 0.6), red = mat(0xd42a22, 0.5), gold = steel(0xe0b84a, 0.3);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 0.36;
  const tor = mk(new THREE.CapsuleGeometry(0.12, 0.34, 8, 14), w, body, 0, 0, 0); tor.rotation.x = PI / 2;
  const R = rng(61); for (let i = 0; i < 26; i++) { const a = R() * PI * 2, z = (R() - 0.5) * 0.42, s = mk(new THREE.SphereGeometry(0.03 + R() * 0.025, 8, 6), blk, body, Math.cos(a) * 0.118, Math.sin(a) * 0.118, z); s.scale.set(Math.abs(Math.cos(a)) > 0.5 ? 0.25 : 1, Math.abs(Math.sin(a)) > 0.5 ? 0.25 : 1, 1); }
  const neck = new THREE.Group(); body.add(neck); neck.position.set(0, 0.08, 0.24);
  mk(new THREE.CapsuleGeometry(0.07, 0.12, 6, 10), w, neck, 0, 0.08, 0.02).rotation.x = -0.5;
  mk(new THREE.TorusGeometry(0.075, 0.018, 8, 18), red, neck, 0, 0.06, 0.02).rotation.x = PI / 2 - 0.5; mk(new THREE.CylinderGeometry(0.025, 0.025, 0.008, 12), gold, neck, 0, 0.0, 0.1).rotation.x = PI / 2;
  const head = new THREE.Group(); neck.add(head); head.position.set(0, 0.2, 0.06);
  mk(new THREE.SphereGeometry(0.12, 18, 14), w, head).scale.set(1, 0.95, 1.05);
  const snout = mk(new THREE.CapsuleGeometry(0.065, 0.1, 6, 10), w, head, 0, -0.04, 0.12); snout.rotation.x = PI / 2;
  mk(new THREE.SphereGeometry(0.032, 10, 8), blk, head, 0, -0.02, 0.23);
  for (const [x, y, z] of [[0.06, 0.07, 0.08], [-0.05, 0.09, 0.02], [0.03, 0.02, 0.17]]) mk(new THREE.SphereGeometry(0.025, 8, 6), blk, head, x, y, z).scale.z = 0.3;
  const eyes = []; for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.032, 12, 10), mat(0xffffff, 0.25), head, s * 0.055, 0.03, 0.095).scale.z = 0.6; eyes.push(mk(new THREE.SphereGeometry(0.018, 10, 8), blk, head, s * 0.057, 0.03, 0.112)); }
  const ears = [-1, 1].map((s) => { const e = new THREE.Group(); head.add(e); e.position.set(s * 0.1, 0.07, -0.01); mk(new THREE.SphereGeometry(0.06, 10, 8), blk, e, s * 0.02, -0.07, 0).scale.set(0.35, 1.1, 0.8); return e; });
  const tongue = mk(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), pink, head, 0, -0.1, 0.17); tongue.rotation.x = 0.4;
  const legs = [];
  for (const [x, z] of [[-0.07, 0.17], [0.07, 0.17], [-0.07, -0.17], [0.07, -0.17]]) { const L = new THREE.Group(); body.add(L); L.position.set(x, -0.05, z); mk(new THREE.CapsuleGeometry(0.035, 0.24, 4, 8), w, L, 0, -0.16, 0); mk(new THREE.SphereGeometry(0.02, 6, 6), blk, L, 0.02, -0.12, 0.03); mk(new THREE.SphereGeometry(0.04, 10, 8), w, L, 0, -0.3, 0.02).scale.set(1, 0.6, 1.3); legs.push(L); }
  const tail = new THREE.Group(); body.add(tail); tail.position.set(0, 0.06, -0.26); mk(new THREE.CapsuleGeometry(0.02, 0.2, 4, 8), w, tail, 0, 0.1, 0).rotation.x = -0.3;
  function set(p = {}) {
    const t = p.t ?? 0, sit = clamp(p.sit ?? 0), rn = p.run, ra = p.runAmt ?? 1, pole = clamp(p.pole ?? 0);
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1);
    body.rotation.x = -0.6 * sit - 1.25 * pole; body.position.y = 0.36 - 0.1 * sit + (rn == null ? 0 : Math.abs(Math.sin(rn)) * 0.05 * ra) + 0.18 * pole;
    legs.forEach((L, i) => { const front = i < 2; const g2 = rn == null ? 0 : Math.sin(rn + (front ? 0 : PI) + (i % 2) * 0.5) * 0.8 * ra; L.rotation.x = g2 + (front ? 0.6 * sit - 1.2 * pole : 1.3 * sit + 0.6 * pole); });
    head.rotation.set((p.headPitch ?? 0) + 0.6 * sit + 1.0 * pole, p.headYaw ?? 0, 0);
    ears.forEach((e, i) => (e.rotation.z = (i ? -1 : 1) * (0.1 + (rn == null ? 0 : 0.5 * Math.abs(Math.sin(rn))))));
    tongue.visible = (p.tongue ?? 0) > 0.1; tail.rotation.z = Math.sin(t * 13) * 0.5;
  }
  set({});
  return { root, head, set };
}

// ---------------------------------------------------------------- the fire truck
/** The truck (local: x 0 = the tail end, the cab toward −x (it faces the fire), ground y 0, near side = +z, cut open). Starts as a
 *  rusty flatbed and grows: setStage({body, pump, deck, ladder, outr, siren}) each 0..1 (grow-in). pitch(angle, pivotX) tips the
 *  whole body about a wheel line (angle > 0 lifts everything on the +x side of pivotX: a braking dive / the tip-over about the
 *  front wheels at x −5.55). Handles: tankSeat (the tank's bottom-centre on the deck), pump imp (spin about z), deckGun yaw/pitch
 *  + dgTip, ladder.set(ext, yaw, elevation) (mid-mount turntable at x −4.0; yaw 0 = bedded toward the tail, π = over the cab),
 *  outr[] (rear pair x −0.35, front pair x −6.6: set(extend, jackLength)), cab door, lights.update(t, on). */
export function makeFireTruck() {
  const g = new THREE.Group(), pivot = new THREE.Group(), inner = new THREE.Group(); g.add(pivot); pivot.add(inner);
  const paint = new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 0.38, metalness: 0.12 }), dark = mat(0x2a2c30, 0.6), chrome = steel(0xe3e7ea, 0.18), tire = mat(0x1b1b1d, 0.85);
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fd0ef, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.3, depthWrite: false });
  const PAINT0 = new THREE.Color(0xe8e2d6), PAINT1 = new THREE.Color(0xd3241e);
  for (const z of [-0.42, 0.42]) mk(new THREE.BoxGeometry(6.8, 0.2, 0.12), dark, inner, -3.5, 0.82, z);
  const wheels = [];
  for (const x of [-1.45, -5.55]) for (const s of [-1, 1]) {
    const w = new THREE.Group(); inner.add(w); w.position.set(x, 0.52, s * 0.98);
    const tr = mk(new THREE.CylinderGeometry(0.52, 0.52, 0.36, 28), tire, w); tr.rotation.x = PI / 2;
    const hub = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.38, 20), chrome, w); hub.rotation.x = PI / 2;
    for (let k = 0; k < 6; k++) { const nut = mk(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 6), dark, w, Math.cos(k * PI / 3) * 0.18, Math.sin(k * PI / 3) * 0.18, 0); nut.rotation.x = PI / 2; }
    mk(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 14), mat(0xd3241e, 0.4), w).rotation.x = PI / 2;
    wheels.push(w);
  }
  const fenderM = dark.clone(); fenderM.side = THREE.DoubleSide;
  for (const x of [-1.45, -5.55]) for (const s of [-1, 1]) { const f = mk(new THREE.CylinderGeometry(0.62, 0.62, 0.42, 24, 1, true, -PI / 2, PI), fenderM, inner, x, 0.55, s * 0.98); f.rotation.x = PI / 2; }
  // ---- the cab (cab-over, front at x −6.95): shell, windshield, an open near door frame so Gary reads inside
  const cab = new THREE.Group(); inner.add(cab);
  const shell = (w, h, d, x, y, z) => mk(new RoundedBoxGeometry(w, h, d, 2, 0.06), paint, cab, x, y, z);
  shell(2.45, 0.7, 2.25, -5.7, 1.3, 0); shell(0.18, 1.05, 2.25, -6.86, 2.1, 0); shell(2.45, 0.16, 2.25, -5.7, 2.62, 0); shell(0.18, 1.05, 2.25, -4.55, 2.1, 0); shell(2.45, 1.05, 0.12, -5.7, 2.1, -1.06);
  for (const x of [-5.15, -6.25]) shell(0.12, 1.05, 0.12, x, 2.1, 1.07);
  const ws = mk(new THREE.PlaneGeometry(2.0, 0.85), glass, cab, -6.97, 2.12, 0); ws.rotation.y = -PI / 2; ws.castShadow = false;
  mk(new THREE.BoxGeometry(0.04, 0.42, 1.2), chrome, cab, -6.94, 1.3, 0);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xfff4c8, emissive: 0xfff0b0, emissiveIntensity: 0.8 }), cab, -6.96, 1.32, s * 0.82).rotation.z = PI / 2;
  mk(new RoundedBoxGeometry(0.22, 0.24, 2.4, 2, 0.06), chrome, cab, -7.02, 0.88, 0);
  mk(new THREE.BoxGeometry(1.6, 0.9, 1.9), mat(0x3a3d42, 0.7), cab, -5.5, 1.0, 0);
  const seat = new THREE.Group(); cab.add(seat); seat.position.set(-5.55, 1.45, 0.35);
  mk(new RoundedBoxGeometry(0.55, 0.14, 0.55, 2, 0.04), mat(0x2b2f36, 0.7), seat, 0, 0, 0); mk(new RoundedBoxGeometry(0.12, 0.7, 0.55, 2, 0.04), mat(0x2b2f36, 0.7), seat, 0.3, 0.38, 0);
  const wheelS = mk(new THREE.TorusGeometry(0.2, 0.03, 8, 22), dark, cab, -6.35, 2.0, 0.35); wheelS.rotation.set(0, PI / 2, -0.5);
  mk(new THREE.BoxGeometry(0.3, 0.4, 2.0), dark, cab, -6.7, 1.75, 0);
  const door = new THREE.Group(); cab.add(door); door.position.set(-6.25, 1.6, 1.12);   // the near door, hinged at its front edge
  const doorT = tex(512, 256, (c, w, h) => { c.fillStyle = '#d3241e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f7c948'; c.lineWidth = 10; c.strokeRect(36, 52, w - 72, h - 104); c.fillStyle = '#f7c948'; c.font = font(84); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARY F.D.', w / 2, h / 2 + 6); });
  const doorFace = new THREE.MeshStandardMaterial({ map: doorT, roughness: 0.4, transparent: true, opacity: 0 });
  const doorPanel = mk(new THREE.BoxGeometry(1.05, 0.62, 0.06), [paint, paint, paint, paint, doorFace, paint], door, 0.53, -0.25, 0);
  const doorWin = mk(new THREE.PlaneGeometry(0.95, 0.5), glass, door, 0.53, 0.32, 0.0); doorWin.castShadow = false;
  // ---- the flatbed (stage 0, under everything): hinged at its front (x −4.35); setBed(k) tilts the tail end down
  const bed = new THREE.Group(); inner.add(bed); bed.position.set(-4.35, 1.0, 0);
  const deckT = tex(256, 128, (c, w, h) => { c.fillStyle = '#7c8086'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let x = 0; x < w; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.fillStyle = 'rgba(150,70,30,.35)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc((i * 53) % w, (i * 37) % h, 6 + (i % 4) * 3, 0, 7); c.fill(); } });
  deckT.wrapS = deckT.wrapT = THREE.RepeatWrapping; deckT.repeat.set(3, 1);
  mk(new THREE.BoxGeometry(4.35, 0.12, 2.3), new THREE.MeshStandardMaterial({ map: deckT, roughness: 0.75, metalness: 0.3 }), bed, 2.175, 0.06, 0);
  const rails = new THREE.Group(); bed.add(rails); for (const s of [-1, 1]) mk(new THREE.BoxGeometry(4.35, 0.12, 0.08), mat(0xc49a2a, 0.5), rails, 2.175, 0.17, s * 1.12);
  const tankSeat = new THREE.Object3D(); bed.add(tankSeat); tankSeat.position.set(2.85, 0.18, 0);
  const setBed = (k) => { bed.rotation.z = -0.255 * clamp(k); };
  // ---- the fire body (stage body): far wall (grey lining inside), a low near skirt with roll-up compartments, a cut window
  const body = new THREE.Group(); inner.add(body);
  const bodyY0 = 1.12, bodyY1 = 2.38;
  const comp = tex(512, 256, (c, w, h) => { c.fillStyle = '#d3241e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const x = 16 + i * 168; c.fillStyle = '#cfd4d9'; c.fillRect(x, 20, 150, h - 40); c.fillStyle = '#b4bac0'; for (let y = 28; y < h - 24; y += 14) c.fillRect(x + 4, y, 142, 3); c.fillStyle = '#7d848b'; c.fillRect(x + 60, h - 46, 30, 8); } });
  const skirtM = new THREE.MeshStandardMaterial({ map: comp, roughness: 0.4, metalness: 0.2 }), lining = mat(0xc9ced3, 0.6);
  mk(new THREE.BoxGeometry(4.25, bodyY1 - bodyY0, 0.08), [paint, paint, paint, paint, lining, paint], body, -2.25, (bodyY0 + bodyY1) / 2, -1.12);
  mk(new THREE.BoxGeometry(4.25, 0.36, 0.1), [paint, paint, paint, paint, skirtM, paint], body, -2.25, bodyY0 - 0.06, 1.12);
  mk(new THREE.BoxGeometry(2.85, 0.1, 0.1), paint, body, -1.55, bodyY1 - 0.05, 1.12);
  for (const x of [-0.17, -4.32]) mk(new THREE.BoxGeometry(0.14, bodyY1 - bodyY0, 0.1), paint, body, x, (bodyY0 + bodyY1) / 2, 1.12);
  for (const x of [-0.17, -4.32]) mk(new THREE.BoxGeometry(0.15, bodyY1 - bodyY0 - 0.08, 0.02), SECTION, body, x, (bodyY0 + bodyY1) / 2, 1.18);   // the cut, in section colour
  mk(new THREE.BoxGeometry(2.9, 0.04, 0.02), SECTION, body, -1.55, bodyY1 - 0.1, 1.18);
  mk(new THREE.BoxGeometry(0.08, bodyY1 - bodyY0 + 0.3, 2.3), paint, body, -0.1, (bodyY0 + bodyY1) / 2 - 0.15, 0);
  mk(new THREE.BoxGeometry(4.3, 0.08, 2.32), paint, body, -2.25, bodyY1 + 0.04, 0);
  mk(new THREE.BoxGeometry(4.25, 0.07, 0.11), mat(0xf7c948, 0.4), body, -2.25, bodyY0 + 0.06, 1.13);
  mk(new THREE.BoxGeometry(0.42, 0.06, 2.3), chrome, body, 0.12, 0.72, 0);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), chrome, body, -0.02, 1.45, s * 0.95);
  for (let i = 0; i < 6; i++) mk(new RoundedBoxGeometry(1.05, 0.1, 0.32, 2, 0.04), mat(i % 2 ? 0xf4f1ea : 0xe8c547, 0.7), body, -2.6, bodyY1 + 0.13 + (i % 3) * 0.1, -0.7 + Math.floor(i / 3) * 0.36);
  const gauges = new THREE.Group(); body.add(gauges); gauges.position.set(-4.32, 1.75, 1.2);
  for (const y of [0.2, -0.18]) { const gt = tex(128, 128, (cc) => { cc.fillStyle = '#222'; cc.beginPath(); cc.arc(64, 64, 62, 0, 7); cc.fill(); cc.fillStyle = '#fff'; cc.beginPath(); cc.arc(64, 64, 52, 0, 7); cc.fill(); cc.strokeStyle = '#222'; cc.lineWidth = 4; for (let k = 0; k < 9; k++) { const a = PI * 0.8 + (k / 8) * PI * 1.4; cc.beginPath(); cc.moveTo(64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40); cc.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); cc.stroke(); } }); mk(new THREE.CircleGeometry(0.09, 24), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.3 }), gauges, 0, y, 0.03); }
  const needles = [0.2, -0.18].map((y) => { const n = mk(new THREE.BoxGeometry(0.07, 0.008, 0.006), mat(0xd42a22, 0.4), gauges, 0, y, 0.04); n.geometry.translate(0.035, 0, 0); n.castShadow = false; return n; });
  const discharge = mk(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 14), chrome, body, -3.85, 1.0, 1.2); discharge.rotation.x = PI / 2;
  const intake = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 14), chrome, body, -3.25, 0.98, 1.2); intake.rotation.x = PI / 2;
  const compDoor = new THREE.Group(); body.add(compDoor); compDoor.position.set(-2.9, bodyY0 - 0.06, 1.18);   // a roll-up compartment door (the hydrant wrench lives here)
  const compPanel = mk(new THREE.BoxGeometry(0.62, 0.3, 0.02), mat(0xcfd4d9, 0.35, { metalness: 0.4 }), compDoor, 0, 0, 0);
  // ---- the pump in section (between the tank and the cab): volute casing + a spinning impeller (stage pump)
  const pumpG = new THREE.Group(); inner.add(pumpG); pumpG.position.set(-3.6, 1.7, 0.2);
  const vol = mk(new THREE.CylinderGeometry(0.46, 0.46, 0.42, 32), mat(0xb5402a, 0.4, { metalness: 0.4 }), pumpG, 0, 0, -0.2); vol.rotation.x = PI / 2;
  const voluteT = tex(256, 256, (c) => { c.fillStyle = '#3a1410'; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill(); c.strokeStyle = '#f3ece0'; c.lineWidth = 9; c.beginPath(); for (let a = 0; a < PI * 2.1; a += 0.05) { const r = 70 + a * 8.5; a ? c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r) : c.moveTo(128 + r, 128); } c.stroke(); });
  mk(new THREE.CircleGeometry(0.455, 32), new THREE.MeshStandardMaterial({ map: voluteT, roughness: 0.6 }), pumpG, 0, 0, 0.012);
  const pumpWater = mk(new THREE.CircleGeometry(0.4, 32), new THREE.MeshBasicMaterial({ color: 0x4aa8e2, transparent: true, opacity: 0, depthWrite: false }), pumpG, 0, 0, 0.02); pumpWater.castShadow = false;
  const imp = new THREE.Group(); pumpG.add(imp); imp.position.z = 0.03;
  const vaneM = mat(0xe8c060, 0.3, { metalness: 0.6 });
  for (let k = 0; k < 7; k++) { const a = (k / 7) * PI * 2; const v = mk(new THREE.BoxGeometry(0.26, 0.035, 0.05), vaneM, imp, Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0); v.rotation.z = a; const tv = mk(new THREE.BoxGeometry(0.1, 0.035, 0.05), vaneM, imp, Math.cos(a) * 0.32 - Math.sin(a) * 0.03, Math.sin(a) * 0.32 + Math.cos(a) * 0.03, 0); tv.rotation.z = a + 0.45; }
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16), steel(0xd0d5da), imp, 0, 0, 0).rotation.x = PI / 2;
  const pipeM = steel(0xa9b1b8, 0.35);
  mk(new THREE.CylinderGeometry(0.075, 0.075, 0.7, 12), pipeM, pumpG, 0.62, -0.42, -0.15).rotation.z = PI / 2;   // the intake from the tank's foot
  const flow = makeArrows(inner, [[-2.75, 1.28, 0.75], [-3.25, 1.28, 0.75], [-3.6, 1.62, 0.75], [-3.95, 1.95, 0.75], [-3.6, 2.2, 0.75], [-3.6, 2.6, 0.75]], { color: 0xffffff, count: 6, size: 0.13, speed: 1.8, emissive: 0.8 });
  const setRun = (k, t) => { pumpWater.material.opacity = 0.55 * clamp(k); flow.update(t, clamp(k)); };
  mk(new THREE.CylinderGeometry(0.075, 0.075, 0.55, 12), pipeM, pumpG, 0.0, 0.64, -0.15);                       // the riser to the roof
  // ---- the deck gun on the roof over the tank (stage deck), near side; yaw/pitch groups; dgTip = the nozzle mouth (points −x at yaw 0)
  const deckGun = new THREE.Group(); inner.add(deckGun); deckGun.position.set(-1.6, bodyY1 + 0.08, 0.72);
  mk(new THREE.CylinderGeometry(0.12, 0.15, 0.14, 16), chrome, deckGun, 0, 0.07, 0);
  const dgYaw = new THREE.Group(); deckGun.add(dgYaw); dgYaw.position.y = 0.16; dgYaw.rotation.y = PI;
  mk(new THREE.SphereGeometry(0.11, 14, 10), mat(0xd3241e, 0.4), dgYaw, 0, 0.04, 0);
  const dgPitch = new THREE.Group(); dgYaw.add(dgPitch); dgPitch.position.y = 0.06;
  mk(new THREE.CylinderGeometry(0.07, 0.08, 0.55, 14), chrome, dgPitch, 0.28, 0, 0).rotation.z = PI / 2;
  mk(new THREE.CylinderGeometry(0.05, 0.075, 0.2, 14), new THREE.MeshStandardMaterial({ color: 0xd8b04a, roughness: 0.3, metalness: 0.7 }), dgPitch, 0.64, 0, 0).rotation.z = PI / 2;
  const dgTip = new THREE.Object3D(); dgPitch.add(dgTip); dgTip.position.set(0.76, 0, 0);
  // ---- mid-mount turntable + 4-section ladder (stage ladder): yaw 0 = bedded toward the tail, resting on a post at the tail
  const tt = new THREE.Group(); inner.add(tt); tt.position.set(-4.0, bodyY1 + 0.08, 0);
  mk(new THREE.CylinderGeometry(0.62, 0.66, 0.2, 28), mat(0x3a3d42, 0.5), tt, 0, 0.1, 0);
  const turn = new THREE.Group(); tt.add(turn); turn.position.y = 0.2;
  mk(new THREE.CylinderGeometry(0.58, 0.58, 0.12, 28), paint, turn, 0, 0.06, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.5, 0.55, 0.1), paint, turn, 0, 0.38, s * 0.42);
  const pedestal = new THREE.Group(); turn.add(pedestal); pedestal.position.set(0.15, 0.12, 0.62);
  mk(new RoundedBoxGeometry(0.32, 0.75, 0.24, 2, 0.04), mat(0x3a3d42, 0.5), pedestal, 0, 0.37, 0);
  const levers = [-0.08, 0.0, 0.08].map((x) => { const l = new THREE.Group(); pedestal.add(l); l.position.set(x, 0.76, 0); mk(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), chrome, l, 0, 0.1, 0); mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0xd42a22, 0.4), l, 0, 0.2, 0); return l; });
  const elev = new THREE.Group(); turn.add(elev); elev.position.set(0, 0.62, 0);
  const lad = new THREE.Group(); elev.add(lad);
  const ALU = new THREE.MeshStandardMaterial({ color: 0xdfe3e7, roughness: 0.25, metalness: 0.65 }), LRED = new THREE.MeshStandardMaterial({ color: 0xd3241e, roughness: 0.4, metalness: 0.2 });
  const SEC = [{ L: 7.6, w: 1.0, h: 0.32 }, { L: 7.4, w: 0.86, h: 0.27 }, { L: 7.2, w: 0.72, h: 0.23 }, { L: 7.0, w: 0.6, h: 0.19 }];
  const secs = SEC.map((s, i) => {
    const sg = new THREE.Group(); lad.add(sg); sg.position.y = i * 0.06;
    const geos = [];
    const rungs = [];
    for (const z of [-s.w / 2, s.w / 2]) { const rb = new THREE.BoxGeometry(s.L, 0.09, 0.075); rb.translate(s.L / 2, 0, z); geos.push(rb); const tb = new THREE.BoxGeometry(s.L, 0.06, 0.06); tb.translate(s.L / 2, s.h, z); geos.push(tb); for (let x = 0.2; x < s.L - 0.1; x += 0.6) { const post = new THREE.BoxGeometry(0.045, s.h, 0.045); post.translate(x, s.h / 2, z); geos.push(post); const dg = new THREE.BoxGeometry(0.62, 0.035, 0.035); dg.rotateZ(Math.atan2(s.h, 0.6)); dg.translate(x + 0.3, s.h / 2, z); geos.push(dg); } }
    for (let x = 0.18; x < s.L - 0.05; x += 0.34) { const r = new THREE.CylinderGeometry(0.025, 0.025, s.w, 8); r.rotateX(PI / 2); r.translate(x, 0.0, 0); rungs.push(r); }
    mk(mergeGeometries(geos), LRED, sg); mk(mergeGeometries(rungs), ALU, sg);
    return { g: sg, ...s };
  });
  const ladderTip = new THREE.Object3D(); secs[3].g.add(ladderTip); ladderTip.position.set(SEC[3].L - 0.1, 0.02, 0);
  const restPost = mk(new THREE.BoxGeometry(0.14, 0.78, 0.9), mat(0x3a3d42, 0.5), inner, -0.35, bodyY1 + 0.47, 0);
  const SL = SEC.map((s, i) => (i ? SEC[i - 1].L - 0.6 : 0));
  const ladder = {
    tt, turn, elev, secs, tip: ladderTip, pedestal, levers, SEC,
    /** ext 0..1 (0 = nested, 1 = ~90 ft), yaw (rad), elevation (rad). Returns the reach from the elevation pivot (m). */
    set(ext, yaw, el) { turn.rotation.y = yaw; elev.rotation.z = el; let x = 0; secs.forEach((s, i) => { x += clamp(ext) * SL[i]; s.g.position.x = x; }); return x + SEC[3].L; },
    reach: (ext) => SL.reduce((a, b) => a + b, 0) * clamp(ext) + SEC[3].L,
  };
  // ---- outriggers (stage outr): rear pair behind the rear axle, front pair ahead of the front axle; beams slide out in z
  const CHEV = tex(256, 64, (c, w, h) => { c.fillStyle = '#f2c418'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1d1f'; for (let x = -h; x < w; x += 44) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 20, h); c.lineTo(x + 20 + h, 0); c.lineTo(x + h, 0); c.fill(); } });
  const outr = [[-0.35, 1], [-0.35, -1], [-6.6, 1], [-6.6, -1]].map(([x, s]) => {
    const o = new THREE.Group(); inner.add(o); o.position.set(x, 0.66, 0);
    mk(new THREE.BoxGeometry(0.3, 0.26, 2.0), mat(0x3a3d42, 0.5), o, 0, 0, 0);
    const beam = new THREE.Group(); o.add(beam);
    mk(new THREE.BoxGeometry(0.22, 0.2, 1.5), new THREE.MeshStandardMaterial({ map: CHEV, roughness: 0.45 }), beam, 0, 0, s * 0.45);
    const jack = new THREE.Group(); beam.add(jack); jack.position.z = s * 1.18;
    mk(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 14), mat(0x3a3d42, 0.5), jack, 0, 0.0, 0);
    const rod = mk(new THREE.CylinderGeometry(0.065, 0.065, 1, 12), chrome, jack, 0, -0.5, 0);
    const pad = mk(new RoundedBoxGeometry(0.5, 0.07, 0.5, 2, 0.02), mat(0xf7c948, 0.5), jack, 0, -1, 0);
    return { o, s, beam, jack, rod, pad, x, set(e, len) { beam.position.z = s * 1.05 * clamp(e); const L = Math.max(0.02, len); rod.scale.y = L; rod.position.y = -L / 2; pad.position.y = -L - 0.03; } };
  });
  // ---- light bar + siren (stage siren)
  const lights = new THREE.Group(); inner.add(lights); lights.position.set(-5.75, 2.74, 0);
  mk(new THREE.BoxGeometry(0.3, 0.1, 1.8), dark, lights, 0, 0, 0);
  const lamps = [-0.7, -0.35, 0, 0.35, 0.7].map((z, i) => mk(new RoundedBoxGeometry(0.26, 0.14, 0.3, 2, 0.04), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffffff : 0xff2a1a, emissive: i % 2 ? 0xffffff : 0xff2a1a, emissiveIntensity: 0.1, roughness: 0.2 }), lights, 0, 0.1, z));
  const siren = mk(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 18), chrome, cab, -7.12, 1.2, -0.75); siren.rotation.z = PI / 2;
  lights.update = (t, on) => { lamps.forEach((l, i) => { const ph = Math.sin(t * 11 + i * 1.9 + (i % 2) * PI) > 0.2 ? 1 : 0; l.material.emissiveIntensity = on ? 0.15 + 2.8 * ph : 0.08; }); };
  // ---- staging: groups grow in; the paint turns red with the body; the flatbed's rails stay under the body
  const grow = (o, k, mode = 'y') => { o.visible = k > 0.005; const s = Math.max(0.001, k); if (mode === 'y') o.scale.set(1, s, 1); else o.scale.setScalar(s); };
  const setStage = ({ body: kb = 0, pump: kp = 0, deck: kd = 0, ladder: kl = 0, outr: ko = 0, siren: ks = 0 } = {}) => {
    grow(body, kb); rails.visible = kb < 0.5;
    paint.color.copy(PAINT0).lerp(PAINT1, clamp(kb * 1.4)); doorFace.opacity = clamp(kb * 2 - 0.6);
    grow(pumpG, kp, 's'); grow(deckGun, kd, 's'); grow(tt, kl, 's'); restPost.visible = kl > 0.3;
    outr.forEach((o) => (o.o.visible = ko > 0.005));
    grow(lights, ks, 's'); siren.visible = ks > 0.005;
  };
  setStage({}); setBed(0); ladder.set(0, 0, -0.03);
  const pitch = (angle, px) => { pivot.position.set(px, 0, 0); inner.position.set(-px, 0, 0); pivot.rotation.z = angle; };
  const spin = (a) => wheels.forEach((w) => (w.rotation.z = a));
  return { g, inner, pivot, cab, door, seat, wheels, spin, bed, setBed, tankSeat, body, pumpG, imp, setRun, deckGun, dgYaw, dgPitch, dgTip, ladder, outr, lights, siren, setStage, pitch, paint, discharge, intake, compDoor, needles, gauges, levers, bodyY1 };
}

// ---------------------------------------------------------------- houses, trees, dressing
function makeHouse({ w, d, h, wall = '#f2e3b8', trim = '#ffffff', roof = 0x5a5f66, door = '#2f6fd6', windows = 4, porch = true, num = '' }) {
  const g = new THREE.Group();
  const wt = tex(512, 256, (c, W, H) => { c.fillStyle = wall; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 6; y < H; y += 14) c.fillRect(0, y, W, 2); });
  wt.wrapS = THREE.RepeatWrapping; wt.repeat.set(w / 4, 1);
  const wm = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.85 });
  mk(new THREE.BoxGeometry(w, h, d), wm, g, 0, h / 2, -d / 2);
  // gable roof along x
  const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 0.45, 0); rs.lineTo(0, h * 0.62); rs.lineTo(d / 2 + 0.45, 0); rs.lineTo(d / 2 + 0.45, 0.14); rs.lineTo(0, h * 0.62 + 0.18); rs.lineTo(-d / 2 - 0.45, 0.14); rs.closePath();
  const roofT = tex(256, 256, (c, W, H) => { c.fillStyle = '#' + new THREE.Color(roof).getHexString(); c.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 16) for (let x = (y / 16) % 2 ? 0 : 12; x < W; x += 24) { c.fillStyle = `rgba(0,0,0,${0.08 + ((x * 7 + y) % 5) * 0.02})`; c.fillRect(x, y, 22, 14); } });
  roofT.wrapS = roofT.wrapT = THREE.RepeatWrapping; roofT.repeat.set(w / 3, 2);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.6) / 2); rg.rotateY(PI / 2);
  mk(rg, new THREE.MeshStandardMaterial({ map: roofT, roughness: 0.8 }), g, 0, h, -d / 2);
  const gab = new THREE.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(0, h * 0.6); gab.lineTo(d / 2, 0); gab.closePath();
  for (const s of [-1, 1]) { const gm = mk(new THREE.ShapeGeometry(gab), wm, g, s * (w / 2 + 0.005), h, -d / 2); gm.rotation.y = s * PI / 2; }
  const winT = tex(128, 160, (c, W, H) => { c.fillStyle = trim; c.fillRect(0, 0, W, H); c.fillStyle = '#7fb3d5'; c.fillRect(10, 10, W - 20, H - 20); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(14, 14); c.lineTo(60, 14); c.lineTo(14, 80); c.fill(); c.fillStyle = trim; c.fillRect(W / 2 - 4, 10, 8, H - 20); c.fillRect(10, H / 2 - 4, W - 20, 8); });
  const winM = new THREE.MeshStandardMaterial({ map: winT, roughness: 0.3 });
  const shutM = mat(0x2f5a3a, 0.7);
  for (let i = 0; i < windows; i++) { const x = -w / 2 + (w / (windows + 1)) * (i + 1) + (i >= windows / 2 ? 0.6 : -0.6) * (porch ? 1 : 0); if (porch && Math.abs(x) < 1.2) continue; mk(new THREE.PlaneGeometry(1.0, 1.25), winM, g, x, h * 0.55, 0.01); for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.3, 1.25, 0.04), shutM, g, x + s * 0.68, h * 0.55, 0.02); mk(new THREE.BoxGeometry(1.2, 0.08, 0.14), mat(0xffffff, 0.6), g, x, h * 0.55 - 0.68, 0.05); }
  const dt = tex(128, 256, (c, W, H) => { c.fillStyle = door; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 6; c.strokeRect(16, 20, W - 32, H * 0.38); c.strokeRect(16, H * 0.5, W - 32, H * 0.42); c.fillStyle = '#e0b84a'; c.beginPath(); c.arc(W - 24, H * 0.52, 7, 0, 7); c.fill(); });
  mk(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshStandardMaterial({ map: dt, roughness: 0.6 }), g, 0, 1.05 + (porch ? 0.4 : 0), 0.012);
  if (porch) {
    const pm = mat(0xf4f1ea, 0.7), fl = mat(0x9a6a44, 0.7);
    mk(new THREE.BoxGeometry(4.2, 0.4, 1.6), fl, g, 0, 0.2, 0.8); for (let k = 0; k < 2; k++) mk(new THREE.BoxGeometry(1.4, 0.2, 0.3), fl, g, 0, 0.1 + k * 0.0, 1.75 + k * 0.0).scale.y = 1 - k * 0.5;
    for (const x of [-2.0, -0.7, 0.7, 2.0]) mk(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 10), pm, g, x, 1.55, 1.5);
    const pr = mk(new THREE.BoxGeometry(4.6, 0.12, 1.9), new THREE.MeshStandardMaterial({ map: roofT, roughness: 0.8 }), g, 0, 2.75, 0.85); pr.rotation.x = 0.12;
    if (num) { const nt = tex(256, 128, (c, W, H) => { c.fillStyle = '#2b2b2b'; c.fillRect(0, 0, W, H); c.fillStyle = '#e8c547'; c.font = font(96); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(num, W / 2, H / 2 + 6); }); mk(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshStandardMaterial({ map: nt, roughness: 0.5 }), g, 0.85, 2.3, 0.015); }
    const lamp = mk(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd890, emissiveIntensity: 1.0 }), g, -0.75, 2.2, 0.08);
  }
  mk(new THREE.BoxGeometry(0.6, 1.4, 0.6), mat(0x9a5a44, 0.85), g, w * 0.3, h + h * 0.5, -d * 0.3);   // chimney
  return g;
}
function bush(parent, x, z, r, col = 0x3f8f3a, y = 0) {
  const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9, flatShading: true });
  const g = new THREE.Group(); parent.add(g); g.position.set(x, y, z);
  for (let k = 0; k < 4; k++) mk(new THREE.IcosahedronGeometry(r * (0.6 + 0.3 * h2(x * 3 + k, z)), 1), m, g, (h2(k, x) - 0.5) * r, r * 0.55 + (h2(z, k) - 0.2) * r * 0.4, (h2(k * 3, z) - 0.5) * r * 0.6);
  return g;
}
function farTree(parent, x, z, s = 1) {
  const g = new THREE.Group(); parent.add(g); g.position.set(x, 0, z);
  mk(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 2.2 * s, 8), mat(0x6b4a32, 0.9), g, 0, 1.1 * s, 0);
  const m = new THREE.MeshStandardMaterial({ color: [0x4f9a43, 0x5aa84a, 0x3f8a3a][Math.floor(h2(x, z) * 3) % 3], roughness: 0.9, flatShading: true });
  for (let k = 0; k < 5; k++) mk(new THREE.IcosahedronGeometry((1.0 + 0.5 * h2(k, x)) * s, 1), m, g, (h2(k, z) - 0.5) * 1.4 * s, (2.6 + h2(x, k) * 1.4) * s, (h2(z, k) - 0.5) * 1.2 * s);
  return g;
}

/** The yard: build everything, return handles. */
export async function buildYard(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96)).catch(() => {});
  renderer.localClippingEnabled = true;
  camera.far = 900; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xf6dcc0); scene.fog = new THREE.Fog(0xf3dcc6, 70, 420);
  // sky: deep afternoon blue → a warm peach horizon, soft clouds
  { const c = document.createElement('canvas'); c.width = 4096; c.height = 2048; const g = c.getContext('2d'); g.scale(2, 2);
    const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#3f86d8'); gr.addColorStop(0.3, '#79b4ea'); gr.addColorStop(0.45, '#cfe0ef'); gr.addColorStop(0.5, '#f6dcc0'); gr.addColorStop(1, '#f6dcc0');
    g.fillStyle = gr; g.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 22; i++) { const cx = h2(i, 5) * 2048, cy = 120 + h2(i, 6) * 310, s = 36 + h2(i, 7) * 60;
      for (let k = 0; k < 8; k++) { const x = cx + (h2(i, k) - 0.5) * s * 4, y = cy + (h2(k, i) - 0.5) * s * 0.8, rr = s * (0.6 + h2(i + k, 9) * 0.7); const cg = g.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); cg.addColorStop(0, 'rgba(255,250,244,.97)'); cg.addColorStop(0.8, 'rgba(255,240,226,.9)'); cg.addColorStop(1, 'rgba(255,230,210,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    root.add(new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }))); }
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8a7656, 1.05); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffdcae, 2.8); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cy, half = 10) { sun.position.set(cx - 10, cy + 11, 13); sun.target.position.set(cx, cy, -4); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 80 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 1);

  // ---- the cut face: strata, the water main (a hole along its chord), the hydrant barrel (a vertical slot)
  const F = D.face, [b0, b1] = D.main.band, hx = D.hyd.x;
  const cut = makeCutFace({ ...F, ppm: 140, mppm: 40, depth: 1.0, backShade: 0.25, paint: paintYard });
  root.add(cut.group); cut.back.visible = false;
  cut.setHoles([{ rect: [F.x0 - 1, b0 + 0.08, F.x1 + 1, b1 - 0.0] }, { rect: [hx - 0.1, b1 - 0.02, hx + 0.1, -0.03] }]);
  // the main's inside (seen through the hole): an iron tube interior + the water in it + flow arrows
  const mainIn = mk(new THREE.CylinderGeometry(D.main.r, D.main.r, F.x1 - F.x0, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x24527e, roughness: 0.4, side: THREE.BackSide, emissive: 0x0b2a48, emissiveIntensity: 0.4 }), root, (F.x0 + F.x1) / 2, D.main.y, D.main.z);
  mainIn.rotation.z = PI / 2; mainIn.receiveShadow = false; mainIn.castShadow = false;
  const mainWater = mk(new THREE.PlaneGeometry(F.x1 - F.x0, b1 - b0 - 0.08), new THREE.MeshStandardMaterial({ color: 0x5cb8ee, roughness: 0.1, transparent: true, opacity: 0.42, emissive: 0x1d6aa8, emissiveIntensity: 0.35, depthWrite: false }), root, (F.x0 + F.x1) / 2, (b0 + 0.08 + b1) / 2, -0.012);
  mainWater.castShadow = false; mainWater.receiveShadow = false;
  const flowL = makeArrows(root, [[hx - 9, D.main.y, -0.18], [hx - 0.05, D.main.y, -0.18]], { color: 0xffffff, count: 10, size: 0.22, speed: 1.4, emissive: 0.8 });
  const flowR = makeArrows(root, [[hx + 9, D.main.y, -0.18], [hx + 0.05, D.main.y, -0.18]], { color: 0xffffff, count: 10, size: 0.22, speed: 1.4, emissive: 0.8 });
  const flowUp = makeArrows(root, [[hx, b1 - 0.05, -0.1], [hx, -0.1, -0.1]], { color: 0xffffff, count: 4, size: 0.12, speed: 1.6, emissive: 0.8 });
  // the barrel in section: interior half-pipe, the operating stem, the main valve at the bottom, the rising water
  const barrel = new THREE.Group(); root.add(barrel);
  const bIn = mk(new THREE.CylinderGeometry(D.hyd.br, D.hyd.br, -b1, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0x5a2a22, roughness: 0.6, side: THREE.BackSide }), barrel, hx, b1 / 2, D.hyd.bz); bIn.castShadow = false;
  const stem = mk(new THREE.CylinderGeometry(0.016, 0.016, -b1 - 0.1, 8), steel(0xc8ced4), barrel, hx, b1 / 2 + 0.02, D.hyd.bz - 0.02);
  const valve = mk(new THREE.CylinderGeometry(0.095, 0.08, 0.06, 18), mat(0x2a2a2c, 0.6), barrel, hx, b1 + 0.06, D.hyd.bz - 0.02);
  const bWater = mk(new THREE.BoxGeometry(0.2, 1, 0.14), new THREE.MeshStandardMaterial({ color: 0x5cb8ee, roughness: 0.1, transparent: true, opacity: 0.6, emissive: 0x1d6aa8, emissiveIntensity: 0.35, depthWrite: false }), barrel, hx, 0, -0.07);
  bWater.castShadow = false;
  const setBarrel = (open, level, t) => { const o = clamp(open); stem.position.y = b1 / 2 + 0.02 - 0.12 * o; valve.position.y = b1 + 0.06 - 0.16 * o; const top = lerp(b1 - 0.02, -0.04, clamp(level)); bWater.visible = level > 0.01; bWater.scale.y = Math.max(0.01, top - (b1 - 0.02)); bWater.position.y = (top + b1 - 0.02) / 2; flowUp.update(t, clamp(level * 2 - 1)); };
  const setMainFlow = (t, k) => { flowL.update(t, k); flowR.update(t, k); };
  setBarrel(0, 0, 0); setMainFlow(0, 0);

  // ---- ground on top: curb, verge, sidewalk, lawn, driveway, patio
  const conc = (rx, ry) => { const t = tex(256, 256, (c, w, h) => { c.fillStyle = '#cfcac0'; c.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '90,86,80' : '255,255,255'},${0.05 + R() * 0.08})`; c.fillRect(R() * w, R() * h, 2, 2); } c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 3, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  mk(new THREE.BoxGeometry(F.x1 - F.x0, D.curb.h, -D.curb.z1), [mat(0xc9c4ba, 0.85), mat(0xc9c4ba, 0.85), new THREE.MeshStandardMaterial({ map: conc((F.x1 - F.x0) / 1.5, 0.2), roughness: 0.85 }), mat(0xc9c4ba, 0.85), SECTION, mat(0xc9c4ba, 0.85)], root, (F.x0 + F.x1) / 2, D.curb.h / 2, D.curb.z1 / 2);
  const lawnT = lawnTexture('#7cc35a', '#6eb44d'); lawnT.repeat.set((F.x1 - F.x0) / 1.6, 13 / 1.6);
  const lawn = mk(new THREE.PlaneGeometry(F.x1 - F.x0, 13), new THREE.MeshStandardMaterial({ map: lawnT, roughness: 0.95 }), root, (F.x0 + F.x1) / 2, 0.004, -6.5); lawn.rotation.x = -PI / 2; lawn.castShadow = false;
  const swT = conc((F.x1 - F.x0) / 1.3, 1); const sw = mk(new THREE.BoxGeometry(F.x1 - F.x0, 0.06, D.walk.z0 - D.walk.z1), new THREE.MeshStandardMaterial({ map: swT, roughness: 0.85 }), root, (F.x0 + F.x1) / 2, 0.03, (D.walk.z0 + D.walk.z1) / 2);
  const drv = mk(new THREE.BoxGeometry(D.drive.x1 - D.drive.x0, 0.04, 10.2), new THREE.MeshStandardMaterial({ map: conc(1.5, 4), roughness: 0.85 }), root, (D.drive.x0 + D.drive.x1) / 2, 0.02, D.lawnZ - 5.1);
  mk(new THREE.BoxGeometry(D.drive.x1 - D.drive.x0, 0.05, 1.25), new THREE.MeshStandardMaterial({ map: conc(1.5, 0.5), roughness: 0.85 }), root, (D.drive.x0 + D.drive.x1) / 2, 0.025, -0.78);   // the driveway apron across the verge
  const patioT = tex(256, 256, (c, w, h) => { c.fillStyle = '#b8a48a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8f7d66'; c.lineWidth = 5; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } });
  patioT.wrapS = patioT.wrapT = THREE.RepeatWrapping; patioT.repeat.set(1.5, 1.2);
  mk(new THREE.BoxGeometry(3.6, 0.04, 2.6), new THREE.MeshStandardMaterial({ map: patioT, roughness: 0.85 }), root, D.grill.x - 0.6, 0.02, D.grill.z + 0.2);
  const back = mk(new THREE.PlaneGeometry(900, 500), new THREE.MeshStandardMaterial({ map: (() => { const l = lawnTexture('#86c862', '#79bb56'); l.repeat.set(280, 150); return l; })(), roughness: 1 }), root, 0, -0.02, -262); back.rotation.x = -PI / 2;

  // ---- the hydrant, a mailbox, a street lamp, the verge
  const hyd = makeHydrant(); root.add(hyd.g); hyd.g.position.set(hx, 0.0, D.hyd.z);
  const mailbox = new THREE.Group(); root.add(mailbox); mailbox.position.set(10.2, 0, -0.85);
  mk(new THREE.BoxGeometry(0.08, 1.05, 0.08), mat(0x6b4a32, 0.8), mailbox, 0, 0.52, 0); mk(new THREE.CapsuleGeometry(0.14, 0.32, 6, 12), mat(0x2f3a48, 0.5), mailbox, 0, 1.15, 0).rotation.z = PI / 2;   // side-on (end-on it read as a black lollipop)
  const flag = mk(new THREE.BoxGeometry(0.06, 0.18, 0.02), mat(0xd42a22, 0.5), mailbox, 0.12, 1.3, 0.15);
  const lampPost = new THREE.Group(); root.add(lampPost); lampPost.position.set(11.6, 0, -0.85);
  mk(new THREE.CylinderGeometry(0.06, 0.09, 4.4, 12), mat(0x2f3134, 0.4), lampPost, 0, 2.2, 0); mk(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff4d0, emissive: 0xffe2a0, emissiveIntensity: 0.4 }), lampPost, 0, 4.5, 0);

  // ---- the tree (trunk, limbs, the cat's branch out toward the lens, a canopy kept clear around the cat)
  const tree = new THREE.Group(); root.add(tree);
  const barkT = tex(128, 256, (c, w, h) => { c.fillStyle = '#6b4a32'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${i % 2 ? '40,26,16' : '140,104,72'},.35)`; c.fillRect((i * 37) % w, (i * 53) % h, 4 + (i % 3) * 3, 30 + (i % 5) * 18); } });
  barkT.wrapS = barkT.wrapT = THREE.RepeatWrapping; barkT.repeat.set(2, 3);
  const barkM = new THREE.MeshStandardMaterial({ map: barkT, roughness: 0.95 });
  const T = D.tree;
  mk(new THREE.CylinderGeometry(0.26, 0.44, 6.2, 16), barkM, tree, T.x, 3.1, T.z);
  for (let k = 0; k < 5; k++) { const a = k * 1.3; const r = mk(new THREE.ConeGeometry(0.16, 0.9, 8), barkM, tree, T.x + Math.cos(a) * 0.38, 0.18, T.z + Math.sin(a) * 0.38); r.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); }
  const limb = (a, b, r0, r1) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), L = A.distanceTo(Bv); const m = mk(new THREE.CylinderGeometry(r1, r0, L, 12), barkM, tree, 0, 0, 0); m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); return m; };
  const [BS, BE] = T.branch;
  limb(BS, BE, 0.16, 0.08); limb([T.x, 4.6, T.z], [T.x - 1.6, 7.6, T.z - 0.6], 0.18, 0.09); limb([T.x, 5.4, T.z], [T.x + 0.4, 8.6, T.z - 1.2], 0.17, 0.08); limb([T.x, 3.9, T.z], [T.x - 1.9, 5.6, T.z + 0.6], 0.14, 0.07);
  const leafA = new THREE.MeshStandardMaterial({ color: 0x4f9a3f, roughness: 0.9, flatShading: true }), leafB = new THREE.MeshStandardMaterial({ color: 0x3f8535, roughness: 0.9, flatShading: true }), leafC = new THREE.MeshStandardMaterial({ color: 0x67ad4a, roughness: 0.9, flatShading: true });
  const canopy = new THREE.Group(); tree.add(canopy);
  const cat = new THREE.Vector3(...D.cat), R = rng(17), leafBlobs = [];
  for (let i = 0; i < 46; i++) { const th = R() * PI * 2, ph = Math.acos(2 * R() - 1), rr = 2.7 * Math.cbrt(R()); const p = new THREE.Vector3(T.x - 0.5 + Math.sin(ph) * Math.cos(th) * rr * 1.15, 7.7 + Math.cos(ph) * rr * 0.75, T.z - 0.9 + Math.sin(ph) * Math.sin(th) * rr * 0.9); if (p.distanceTo(cat) < 1.45 || p.z > cat.z + 0.2 && p.y < 7.2) continue; const s = 0.7 + R() * 0.75; const m = mk(new THREE.IcosahedronGeometry(s, 1), [leafA, leafB, leafC][i % 3], canopy, p.x, p.y, p.z); leafBlobs.push(m); }
  for (let i = 0; i < 6; i++) { const u = 0.35 + i * 0.09, p = new THREE.Vector3().lerpVectors(new THREE.Vector3(...BS), new THREE.Vector3(...BE), u); if (p.distanceTo(cat) < 0.55) continue; mk(new THREE.IcosahedronGeometry(0.28 + 0.1 * (i % 2), 1), leafC, canopy, p.x + 0.05, p.y + 0.22, p.z - 0.2); }
  mk(new THREE.IcosahedronGeometry(0.26, 1), leafA, canopy, BE[0] + 0.12, BE[1] + 0.1, BE[2] - 0.05);

  // ---- the hedge (one long trimmed hedge; setChar(k) burns it to charcoal)
  const H = D.hedge;
  const hedgeT = tex(512, 128, (c, w, h) => { c.fillStyle = '#3f8a37'; c.fillRect(0, 0, w, h); const R2 = rng(3); for (let i = 0; i < 1600; i++) { c.fillStyle = ['#2f6f2a', '#56a447', '#3a7f33', '#6cb855'][i % 4]; c.beginPath(); c.ellipse(R2() * w, R2() * h, 3 + R2() * 4, 2 + R2() * 3, R2() * 3, 0, 7); c.fill(); } });
  hedgeT.wrapS = hedgeT.wrapT = THREE.RepeatWrapping; hedgeT.repeat.set((H.x1 - H.x0) / 2.5, 1);
  const hedgeM = new THREE.MeshStandardMaterial({ map: hedgeT, roughness: 0.95, bumpMap: hedgeT, bumpScale: 2 });
  const hedge = mk(new RoundedBoxGeometry(H.x1 - H.x0, H.h, H.d, 4, 0.3), hedgeM, root, (H.x0 + H.x1) / 2, H.h / 2, H.z);
  const hedgeBase = new THREE.Color(0xffffff), CHAR = new THREE.Color(0x141110);
  const setChar = (k) => { hedgeM.color.copy(hedgeBase).lerp(CHAR, clamp(k)); hedgeM.bumpScale = 2 + 4 * clamp(k); };

  // ---- Gary's house + garage, neighbours, far roofs, fences, beds, toys
  const house = makeHouse({ w: D.house.x1 - D.house.x0, d: D.house.z0 - D.house.z1, h: D.house.h, wall: '#f4e3b2', door: '#d3341e', windows: 4, porch: true, num: '33' });
  root.add(house); house.position.set((D.house.x0 + D.house.x1) / 2, 0, D.house.z0);
  const gar = new THREE.Group(); root.add(gar); gar.position.set((D.garage.x0 + D.garage.x1) / 2, 0, D.garage.z0);
  { const gw = D.garage.x1 - D.garage.x0; mk(new THREE.BoxGeometry(gw, 2.7, 5.4), mat(0xf4e3b2, 0.85), gar, 0, 1.35, -2.7); const gdT = tex(256, 192, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d6d2c8'; c.lineWidth = 6; for (let y = 0; y < h; y += 48) c.strokeRect(6, y + 4, w - 12, 40); }); mk(new THREE.PlaneGeometry(3.0, 2.2), new THREE.MeshStandardMaterial({ map: gdT, roughness: 0.6 }), gar, 0, 1.1, 0.01); const rs = mk(new THREE.BoxGeometry(gw + 0.5, 0.15, 6.0), mat(0x5a5f66, 0.8), gar, 0, 2.85, -2.6); rs.rotation.x = 0.0; }
  const left = makeHouse({ w: 11, d: 7, h: 3.2, wall: '#a9cbe0', door: '#ffffff', windows: 4, porch: true }); root.add(left); left.position.set(-19.0, 0, -12.5);
  const right = makeHouse({ w: 10, d: 7, h: 3.0, wall: '#f0c9a8', door: '#2f6f4a', windows: 4, porch: true }); root.add(right); right.position.set(16.8, 0, -12.8);
  for (let i = 0; i < 16; i++) { const x = -60 + i * 8 + h2(i) * 3, w = 7 + h2(i, 2) * 3; const hh = makeHouse({ w, d: 6, h: 3.0, wall: ['#f2d49b', '#a9cbe0', '#e8a7a0', '#c6dcb0', '#f0c9a8', '#d7c4e8'][i % 6], windows: 3, porch: false }); root.add(hh); hh.position.set(x, 0, -34 - h2(i, 3) * 4); }
  for (let i = 0; i < 26; i++) farTree(root, -70 + i * 5.6 + h2(i, 1) * 3, -26 - h2(i, 4) * 16, 0.9 + h2(i, 5) * 0.5);
  for (const [x, z, s] of [[-14.5, -8.5, 1.1], [10.8, -9.5, 1.0], [24, -8, 1.3], [-27, -9, 1.2]]) farTree(root, x, z, s);
  const picket = (x0, z0, x1, z1) => { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.24); const pm = mat(0xf7f4ee, 0.7); for (let i = 0; i <= n; i++) mk(new THREE.BoxGeometry(0.09, 0.95, 0.04), pm, root, lerp(x0, x1, i / n), 0.47, lerp(z0, z1, i / n)).rotation.y = Math.atan2(x1 - x0, z1 - z0) + PI / 2; mk(new THREE.BoxGeometry(Math.hypot(x1 - x0, z1 - z0), 0.07, 0.03), pm, root, (x0 + x1) / 2, 0.7, (z0 + z1) / 2).rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  picket(-13.6, -2.8, -13.6, -12); picket(10.9, -2.8, 10.9, -12);
  for (const [x, z, r, c] of [[-6.2, -11.4, 0.55, 0x3f8f3a], [-4.6, -11.4, 0.5, 0x4c9a3e], [1.8, -11.4, 0.55, 0x3f8f3a], [3.2, -11.5, 0.5, 0x4c9a3e], [-17, -11.6, 0.6, 0x3f8f3a], [13.5, -11.8, 0.6, 0x4c9a3e]]) bush(root, x, z, r, c);
  const flowers = new THREE.Group(); root.add(flowers); for (let i = 0; i < 40; i++) { const x = D.house.x0 + 0.3 + h2(i, 1) * (D.house.x1 - D.house.x0 - 0.6); if (x > -3.3 && x < 0.9) continue; mk(new THREE.SphereGeometry(0.06, 8, 6), mat([0xff5a7a, 0xffd23f, 0xffffff, 0xb36bff][i % 4], 0.6), flowers, x, 0.35 + h2(i, 2) * 0.2, -11.05 + h2(i, 3) * 0.3); }
  const gnome = new THREE.Group(); root.add(gnome); gnome.position.set(2.6, 0, -9.8); mk(new THREE.CylinderGeometry(0.1, 0.13, 0.26, 12), mat(0x2f6fd6, 0.6), gnome, 0, 0.13, 0); mk(new THREE.SphereGeometry(0.08, 12, 10), mat(0xf2c29a, 0.6), gnome, 0, 0.32, 0); mk(new THREE.ConeGeometry(0.09, 0.22, 12), mat(0xd42a22, 0.5), gnome, 0, 0.47, 0); mk(new THREE.SphereGeometry(0.07, 10, 8), mat(0xffffff, 0.8), gnome, 0, 0.27, 0.05);
  const hoseReel = new THREE.Group(); root.add(hoseReel); hoseReel.position.set(4.3, 0, -11.6); mk(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 18), mat(0x3fbf4f, 0.6), hoseReel, 0, 0.42, 0).rotation.x = PI / 2; for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.05, 0.6, 0.05), mat(0x2b2b2b, 0.6), hoseReel, 0, 0.3, s * 0.13);
  const picnic = new THREE.Group(); root.add(picnic); picnic.position.set(-6.9, 0, -3.3);
  { const wd = mat(0xa8744a, 0.75); mk(new THREE.BoxGeometry(1.7, 0.06, 0.8), wd, picnic, 0, 0.74, 0); const cl = tex(128, 128, (c, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#ffffff' : '#d84a3a'; c.fillRect(x * 16, y * 16, 16, 16); } }); mk(new THREE.BoxGeometry(1.75, 0.012, 0.85), new THREE.MeshStandardMaterial({ map: cl, roughness: 0.8 }), picnic, 0, 0.775, 0); for (const z of [-0.62, 0.62]) mk(new THREE.BoxGeometry(1.7, 0.05, 0.28), wd, picnic, 0, 0.44, z); for (const x of [-0.7, 0.7]) for (const s of [-1, 1]) { const l = mk(new THREE.BoxGeometry(0.06, 0.95, 0.06), wd, picnic, x, 0.38, s * 0.35); l.rotation.x = s * 0.55; } mk(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 12), mat(0xffc21a, 0.4), picnic, 0.35, 0.87, 0.1); mk(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 10), mat(0xd8261c, 0.4), picnic, -0.25, 0.88, -0.1); }
  const chair = (x, z, ry, col) => { const c = new THREE.Group(); root.add(c); c.position.set(x, 0, z); c.rotation.y = ry; const m = mat(col, 0.6); mk(new THREE.BoxGeometry(0.55, 0.05, 0.5), m, c, 0, 0.38, 0); const bk = mk(new THREE.BoxGeometry(0.55, 0.65, 0.05), m, c, 0, 0.68, -0.27); bk.rotation.x = -0.25; for (const sx of [-0.25, 0.25]) for (const sz of [-0.2, 0.2]) mk(new THREE.BoxGeometry(0.03, 0.38, 0.03), steel(0xd0d5da), c, sx, 0.19, sz); return c; };
  chair(-2.9, -7.2, -0.4, 0x3e9be0); chair(-9.7, -4.6, 0.6, 0xffc21a);
  const sprinkler = new THREE.Group(); root.add(sprinkler); sprinkler.position.set(9.6, 0, -7.0); mk(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 14), mat(0xffc21a, 0.4), sprinkler, 0, 0.04, 0);
  const pool = mk(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 28, 1, true), mat(0x4fb3e8, 0.4), root, 13.6, 0.15, -5.4); pool.material.side = THREE.DoubleSide; mk(new THREE.CircleGeometry(0.88, 28), new THREE.MeshStandardMaterial({ color: 0x7fd0f2, roughness: 0.1 }), root, 13.6, 0.22, -5.4).rotation.x = -PI / 2;
  const ball = mk(new THREE.SphereGeometry(0.16, 16, 12), mat(0xff5a7a, 0.4), root, 12.4, 0.16, -4.6);

  return { root, aimSun, sun, hemi, cut, setBarrel, setMainFlow, hyd, tree, canopy, leafBlobs, hedge, hedgeM, setChar, house, mailbox, flag, picnic, lawn };
}
