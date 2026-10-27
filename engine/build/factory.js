// Car-factory cutaway set (build genre, video 026 "How a Garage Becomes a Car Factory"). A dollhouse cut: every building's
// FRONT wall is sliced away at z = 0 and the ground under the floor slab is cut open like 024's strata (the e-coat dip tank is
// a pit seen in section). Camera lives on +z. Left → right (x, meters):
//   your house (x −16…−8.6), your garage (x −7.4…−1.2): pegboard, workbench, shelves, lawnmower, a roll-up door in its RIGHT
//   wall (it opens onto the yard that becomes the factory).
//   the hall (x −1.2…48.4, 9.5 m deep, 6.4 m tall) pops up bay by bay over the yard (setHall). The story marches +x along it:
//   a floor-flush slat conveyor at z = D.line.z (it starts inside the garage), stations, the stamping press, robot arms, the
//   e-coat dip tank (in FRONT of the line, so the cut face shows the bath in section) + its hoist, a loading dock in the back
//   wall (the parts avalanche), the paint booth, the QC gate, the crash lane + crash wall, the CEO's corner office on a
//   mezzanine, a shipping door in the end wall, a test track on the roof.
//   QUIK FIX AUTO (x 51.6…59.0), the mechanic: a four-post lift (your old car ends up on it), counter, price board.
// Props: makeKitCar (a toy convertible built from parts: chassis → body → doors → seats; rust, e-coat grey, paint, crumple),
// makeJunkCar (three wheels + a lawnmower engine), makeRobotArm, makeRoomba (badge / tie / top hat / flag), makeSteeringWheel,
// makeTire, makeAirbag, makeTugger, makeVacuum, makeEasel, makeInvoice.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, mk, rng, clamp, lerp } from '../core.js';
import { makeCutFace, makeSky, maskedPlane, lawnTexture } from './cutaway.js';
import { makeTree } from './subway.js';
import { easeOutBack, drop } from './anim.js';

const PI = Math.PI;
export const D = {
  face: { x0: -30, x1: 72, y0: -7, y1: 0 },
  house: { x0: -16.0, x1: -8.6 },
  garage: { x0: -7.4, x1: -1.2, back: -5.2, h: 2.75, ridge: 4.0, door: [-4.5, -1.9] },   // door = z range of the roll-up door in the right wall
  hall: { x0: -1.2, x1: 48.4, back: -9.5, h: 6.4, bay: 6.2 },
  line: { z: -3.2, y: 0.08, x0: -4.4, x1: 41.0, pitch: 4.6 },             // cars start in the garage, roll +x, leave through the end-wall door
  work: -4.9,                                                  // where workers stand (behind the line, facing the lens)
  st: { body: 0.4, doors: 5.0, paint: 9.6, gary: 18.8 },       // stations (x); cars are spaced line.pitch apart
  press: 21.3, cadillac: [14.2, 18.8, 23.4], robot: 23.4,      // the stamping press, the three Cadillac-test cars, Gary's bolt station
  tank: { x0: 27.4, x1: 32.1, y0: -3.0, z0: -2.5, level: -0.22, dipZ: -1.35 },   // it stands in the basement
  base: { y0: -3.4, y1: -0.3, z1: -4.0, conv: -2.1, lifts: [0.4, 5.0, 9.6, 20.4, 23.4, 35.6, 40.0, 44.4] },   // the basement under the hall (cut open by the face)
  dock: { x0: 33.8, x1: 38.0 }, jit: 35.6,                     // roll-up door in the back wall (the parts avalanche)
  booth: { x0: 38.6, x1: 42.6 },                               // the paint booth (back wall, pops in on "paint shop")
  qc: { x: 45.0, z: -2.05 },                                 // the QC gate at the end of the line (under the office floor)
  vend: [43.25, -0.55],                                        // the meatloaf vending machine (front aisle, beside the QC gate)
  crash: { x0: 42.0, wall: 47.0, z: -1.0 },
  office: { x0: 43.4, x1: 48.2, y: 3.0, z0: -1.4, z1: -6.4 }, // the CEO's corner office on a mezzanine
  exit: { z0: -4.8, z1: -1.9, h: 3.0 },                        // the shipping door in the hall's end wall (x = hall.x1)
  shop: { x0: 51.6, x1: 59.0, back: -5.6, h: 3.5 },           // QUIK FIX AUTO (the hook's tow truck takes your car there)
  road: 50.1,                                                  // finished cars leave the end door and drive off (−z) along x ≈ road
  roof: { y: 6.4, top: 6.78, track: [22.0, 47.6] },             // the test track on the roof (x range)
};
const H = D.hall, G = D.garage, S = D.shop, L = D.line;
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
const signTex = (text, { w = 512, h = 160, bg = '#c0392b', fg = '#fff', px = 96, border = null } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); }
  let s = px; g.font = font(s); while (g.measureText(text).width > w * 0.88 && s > 20) { s -= 4; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + s * 0.06);
});
const sign = (parent, text, w, h, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(text, { w: Math.round(160 * w / h), h: 160, ...o }), roughness: 0.6 })); m.receiveShadow = true; parent.add(m); return m; };
const steel = (c = 0x8d969f, r = 0.4) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.55 });
// a wall's cut end (the dollhouse slice): light section colour so the cut reads as a diagram
const SECTION = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.9 });
const houseCols2 = ['#f2d49b', '#a9cbe0', '#e8a7a0', '#c6dcb0', '#f0c9a8', '#d7c4e8', '#f4e1b5'];
const officeWallTex = () => tex(512, 256, (g, w, h) => { g.fillStyle = '#2b3a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9b44a'; g.fillRect(0, h * 0.78, w, 5); for (let i = 0; i < 9; i++) { g.fillStyle = '#34495e'; g.fillRect(14 + i * 56, 18, 46, h * 0.7); } });

// ---------------------------------------------------------------- the ground under the floors (cut face)
const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
function paintGround(g, P) {
  const x0 = D.face.x0, x1 = D.face.x1, wave = (x, k) => 0.06 * Math.sin(x * 0.9 + k) + 0.04 * Math.sin(x * 2.7 + 2 * k);
  const layers = [[0.05, '#6a4329'], [-0.9, '#9c6a40'], [-2.6, '#a8865f'], [-4.6, '#8d735a']];
  layers.forEach(([top, col], i) => { g.fillStyle = col; g.beginPath(); g.moveTo(P.x(x0), P.y(top + (i ? wave(x0, i) : 0))); for (let x = x0; x <= x1; x += 0.25) g.lineTo(P.x(x), P.y(top + (i ? wave(x, i) : 0))); g.lineTo(P.x(x1), P.H); g.lineTo(P.x(x0), P.H); g.closePath(); g.fill(); });
  const R = rng(26);
  const blot = (yT, yB, cols, n, rx, ry) => { for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = yB + R() * (yT - yB); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(rx * (0.5 + R())), P.s(ry * (0.5 + R())), 0, 0, 7); g.fill(); } };
  blot(-0.4, -0.95, ['rgba(40,24,12,.22)', 'rgba(110,72,44,.2)'], 260, 0.6, 0.05);
  blot(-1.0, -2.6, ['rgba(120,70,38,.2)', 'rgba(200,140,95,.16)'], 380, 0.9, 0.06);
  blot(-2.7, -7, ['rgba(130,104,72,.2)', 'rgba(200,172,130,.16)', 'rgba(105,80,60,.2)'], 520, 1.1, 0.08);
  for (let i = 0; i < 22000; i++) { const x = x0 + R() * (x1 - x0), y = -0.3 - R() * 6.7, L = 0.025 + R() * 0.06; g.strokeStyle = R() < 0.55 ? `rgba(55,32,18,${0.1 + R() * 0.16})` : `rgba(255,220,170,${0.05 + R() * 0.1})`; g.lineWidth = P.s(0.008 + R() * 0.01); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.lineTo(P.x(x + (R() - 0.5) * 0.03), P.y(y - L)); g.stroke(); }
  const pebble = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(r), P.s(r * 0.7), R() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(P.x(x - r * 0.25), P.y(y + r * 0.2), P.s(r * 0.35), P.s(r * 0.2), 0, 0, 7); g.fill(); };
  for (let i = 0; i < 460; i++) pebble(x0 + R() * (x1 - x0), -0.5 - R() * 6.4, 0.03 + R() * 0.07, ['#8c7a68', '#b2a184', '#6f665c'][i % 3]);
  // pipes in section: a sewer, a water main, a power conduit bundle
  const pipe = (x, y, r, ring, inner) => { g.fillStyle = ring; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r), 0, 7); g.fill(); g.fillStyle = inner; g.beginPath(); g.arc(P.x(x), P.y(y), P.s(r * 0.78), 0, 7); g.fill(); };
  pipe(-12, -1.3, 0.2, '#3d7fc2', '#1c3550'); pipe(4.5, -1.1, 0.15, '#5b5b5b', '#e0b13a'); pipe(4.85, -1.1, 0.15, '#5b5b5b', '#e0b13a'); pipe(24.6, -1.6, 0.22, '#3d7fc2', '#1c3550'); pipe(44.5, -1.0, 0.12, '#d9822b', '#4a2a10'); pipe(-4.5, -0.9, 0.1, '#d9822b', '#4a2a10');
  // a fossil Model T in the deep layer (the reel's dinosaur), a lost wrench, a buried hubcap, a coin
  g.save(); g.translate(P.x(6.5), P.y(-5.1)); const s = P.ppm / 100; g.scale(s, s); g.fillStyle = '#efe4c8'; g.strokeStyle = '#c9b88f'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-95, 10); g.lineTo(-95, -22); g.lineTo(-40, -22); g.lineTo(-30, -60); g.lineTo(30, -60); g.lineTo(34, -22); g.lineTo(90, -18); g.lineTo(95, 10); g.closePath(); g.fill(); g.stroke();
  for (const wx of [-62, 62]) { g.beginPath(); g.arc(wx, 14, 24, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#c9b88f'; g.beginPath(); g.arc(wx, 14, 8, 0, 7); g.fill(); g.fillStyle = '#efe4c8'; }
  g.fillStyle = '#7a5f3e'; g.fillRect(-22, -52, 44, 26); g.restore();
  g.save(); g.translate(P.x(-2.2), P.y(-2.2)); g.rotate(0.5); g.fillStyle = '#9aa3ad'; g.fillRect(-P.s(0.2), -P.s(0.025), P.s(0.4), P.s(0.05)); g.beginPath(); g.arc(P.s(0.21), 0, P.s(0.055), 0, 7); g.fill(); g.restore();
  g.fillStyle = '#c8cdd2'; g.beginPath(); g.arc(P.x(19.5), P.y(-3.6), P.s(0.16), 0, 7); g.fill(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.arc(P.x(19.5), P.y(-3.6), P.s(0.07), 0, 7); g.fill();
  g.fillStyle = '#e8c547'; g.beginPath(); g.arc(P.x(-10.4), P.y(-2.9), P.s(0.05), 0, 7); g.fill();
  // the floor slabs in section (concrete with rebar dots) under every building
  const slab = (a, b, th) => { g.fillStyle = '#c9c5bd'; g.fillRect(P.x(a), P.y(0), P.s(b - a), P.s(th)); g.fillStyle = '#9b968d'; for (let x = a + 0.15; x < b; x += 0.3) { g.beginPath(); g.arc(P.x(x), P.y(-th * 0.55), P.s(0.018), 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(P.x(a), P.y(-th), P.s(b - a), P.s(0.025)); };
  slab(S.x0, S.x1, 0.22); slab(G.x0, G.x1, 0.2); slab(D.house.x0, D.house.x1, 0.2);
  return { slab };
}

// ---------------------------------------------------------------- props
/** Toy convertible built from parts, front toward +x. parts: chassis, body {nose, tail, floor, dash, rear}, doors [near(+z), far],
 *  seats, wheel (steering), glass, lamps. set({stage 0..4, finish 'steel'|'ecoat'|'paint', color, rust 0..1, crumple 0..1, doorOff}). */
export function makeKitCar(color = 0xd94b3d) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.15 }), paintD = paint.clone(), paintT = paint.clone(), paints = [paint, paintD, paintT];
  const base = new THREE.Color(color), STEEL = new THREE.Color(0xa9b0b7), ECOAT = new THREE.Color(0x5f666e), RUST = new THREE.Color(0xa0522d);
  const rustMap = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const R = rng(7); for (let i = 0; i < 120; i++) { const x = R() * w, y = R() * h, r = 6 + R() * 26; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,66,22,.95)'); gr.addColorStop(0.6, 'rgba(170,90,40,.6)'); gr.addColorStop(1, 'rgba(170,90,45,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  const rustM = new THREE.MeshStandardMaterial({ map: rustMap, color: 0xffffff, roughness: 0.9, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const tireM = mat(0x1c1c1e, 0.8), chrome = steel(0xd5d9de, 0.25), dark = mat(0x2a2d31, 0.6), seatM = mat(0x3b2f2a, 0.7), glassM = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false });
  const painted = [];
  const P = (geo, parent, x, y, z, pm = paint) => { const m = mk(geo, pm, parent, x, y, z); painted.push(m); const r = new THREE.Mesh(geo, rustM); r.scale.setScalar(1.004); m.add(r); return m; };
  // chassis: two rails + cross members + axles + wheels
  const chassis = new THREE.Group(); g.add(chassis);
  for (const z of [-0.45, 0.45]) mk(new THREE.BoxGeometry(3.1, 0.1, 0.12), dark, chassis, 0, 0.3, z);
  for (const x of [-1.2, 0, 1.2]) mk(new THREE.BoxGeometry(0.1, 0.08, 0.9), dark, chassis, x, 0.3, 0);
  const wheels = [];
  for (const [x, z] of [[1.08, 0.7], [1.08, -0.7], [-1.08, 0.7], [-1.08, -0.7]]) {
    const w = new THREE.Group(); w.position.set(x, 0.32, z); chassis.add(w); wheels.push(w);
    mk(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 22), tireM, w).rotation.x = PI / 2;
    mk(new THREE.CylinderGeometry(0.17, 0.17, 0.25, 14), chrome, w).rotation.x = PI / 2;
  }
  // body: nose (3 slices → it folds like an accordion), cabin floor, dash, rear deck, tail
  const nose = new THREE.Group(); body.add(nose); nose.position.set(0.62, 0, 0);
  const slices = [0, 1, 2].map((i) => { const s = new THREE.Group(); nose.add(s); s.position.x = 0.17 + i * 0.34; P(new RoundedBoxGeometry(0.36, 0.5, 1.52, 2, 0.08), s, 0, 0.62, 0); return s; });
  mk(new RoundedBoxGeometry(0.12, 0.16, 1.5, 2, 0.05), chrome, slices[2], 0.2, 0.42, 0);                  // bumper
  const lamps = [-0.48, 0.48].map((z) => { const l = new THREE.Group(); slices[2].add(l); l.position.set(0.19, 0.72, z); mk(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.6, roughness: 0.2 }), l); return l; });
  mk(new THREE.BoxGeometry(0.02, 0.18, 0.6), dark, slices[2], 0.19, 0.58, 0);                              // grille
  const hazT = tex(256, 64, (c, w, h) => { for (let i = -2; i < 12; i++) { c.fillStyle = i % 2 ? '#111' : '#ffd23f'; c.beginPath(); c.moveTo(i * 24, h); c.lineTo(i * 24 + 24, h); c.lineTo(i * 24 + 48, 0); c.lineTo(i * 24 + 24, 0); c.fill(); } });
  const hazards = slices.map((sl) => { const d = mk(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshStandardMaterial({ map: hazT, roughness: 0.6 }), sl, 0, 0.66, 0.765); d.castShadow = false; return d; });   // the crumple-zone car's nose
  P(new RoundedBoxGeometry(1.36, 0.14, 1.5, 2, 0.05), body, -0.05, 0.4, 0);                               // cabin floor
  P(new RoundedBoxGeometry(0.12, 0.5, 1.5, 2, 0.05), body, 0.56, 0.62, 0);                                // dash / firewall
  P(new RoundedBoxGeometry(0.12, 0.5, 1.5, 2, 0.05), body, -0.68, 0.62, 0);                               // seat back wall
  const tail = new THREE.Group(); body.add(tail); tail.position.set(-1.12, 0, 0);
  P(new RoundedBoxGeometry(0.88, 0.52, 1.52, 2, 0.1), tail, 0, 0.62, 0, paintT);
  mk(new RoundedBoxGeometry(0.12, 0.16, 1.5, 2, 0.05), chrome, tail, -0.46, 0.42, 0);
  for (const z of [-0.5, 0.5]) mk(new THREE.BoxGeometry(0.02, 0.1, 0.22), new THREE.MeshBasicMaterial({ color: 0xff3a2a, toneMapped: false }), tail, -0.445, 0.72, z);
  // doors (separate so they can fall off / be swapped / hold Gary)
  const doors = [1, -1].map((s) => { const d = new THREE.Group(); body.add(d); d.position.set(-0.06, 0, s * 0.7); P(new RoundedBoxGeometry(1.14, 0.46, 0.1, 2, 0.04), d, 0, 0.62, 0, paintD); mk(new THREE.BoxGeometry(0.16, 0.035, 0.04), chrome, d, 0.3, 0.74, s * 0.06); return d; });
  // interior
  const inner = new THREE.Group(); body.add(inner);
  for (const z of [0.34, -0.34]) { mk(new RoundedBoxGeometry(0.5, 0.18, 0.5, 2, 0.06), seatM, inner, -0.3, 0.55, z); mk(new RoundedBoxGeometry(0.14, 0.55, 0.5, 2, 0.06), seatM, inner, -0.55, 0.82, z).rotation.z = 0.12; }
  const steer = new THREE.Group(); inner.add(steer); steer.position.set(0.32, 0.92, 0.34); steer.rotation.z = 0.9;
  mk(new THREE.TorusGeometry(0.16, 0.025, 8, 24), dark, steer).rotation.y = PI / 2; mk(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), dark, steer, 0.2, 0, 0).rotation.z = PI / 2;
  const glass = new THREE.Group(); body.add(glass); glass.position.set(0.56, 0.86, 0); glass.rotation.z = 0.45;
  mk(new THREE.PlaneGeometry(0.42, 1.36), glassM, glass, 0, 0.21, 0).rotation.y = PI / 2;
  for (const z of [-0.69, 0.69]) mk(new THREE.BoxGeometry(0.04, 0.44, 0.04), chrome, glass, 0, 0.21, z);
  mk(new THREE.BoxGeometry(0.04, 0.04, 1.42), chrome, glass, 0, 0.43, 0);
  const api = {
    g, body, chassis, nose, slices, tail, doors, inner, steer, glass, wheels, lamps, paint, paints, rustM,
    seat: (side = 1) => new THREE.Vector3(-0.28, 0.6, side * 0.34),   // local seat point (a toon sits here)
    set({ stage = 4, finish = 'paint', color: c, mix = null, rust = 0, crumple = 0, doorOff = 0, spin = 0, stripes = 0 } = {}) {
      body.visible = stage >= 1; doors.forEach((d) => (d.visible = stage >= 2)); inner.visible = stage >= 3; glass.visible = stage >= 3; lamps.forEach((l) => (l.visible = stage >= 1));
      const col = finish === 'steel' ? STEEL : finish === 'ecoat' ? ECOAT : c != null ? new THREE.Color(c) : base;
      paints.forEach((m, i) => { m.color.copy(mix && finish === 'paint' ? new THREE.Color(mix[i]) : col); m.roughness = finish === 'paint' ? 0.3 : finish === 'ecoat' ? 0.55 : 0.4; m.metalness = finish === 'steel' ? 0.55 : 0.15; });
      hazards.forEach((d) => (d.visible = stripes > 0.01));
      rustM.opacity = clamp(rust); rustM.visible = rust > 0.01;
      // crumple: the three nose slices squeeze toward the dash and zig-zag (an accordion); the headlights pop out on springs
      slices.forEach((s, i) => { s.position.x = (0.17 + i * 0.34) * (1 - 0.62 * crumple); s.scale.x = 1 - 0.55 * crumple; s.rotation.z = (i % 2 ? -1 : 1) * 0.42 * crumple; s.position.y = (i % 2 ? 0.06 : -0.03) * crumple; });
      lamps.forEach((l, i) => { l.position.x = 0.19 + 0.28 * crumple; l.position.y = 0.72 + 0.12 * crumple; l.rotation.y = (i ? 1 : -1) * 0.6 * crumple; });
      const d0 = doors[0]; d0.position.y = -0.55 * clamp(doorOff); d0.rotation.x = 0.9 * clamp(doorOff); d0.position.z = 0.7 + 0.45 * clamp(doorOff);
      for (const w of wheels) w.rotation.z = -spin;
    },
  };
  api.set({});
  return api;
}

/** The garage car: a crate on three mismatched wheels, a lawnmower engine on the back, a lawn-chair seat. Gary's head pops
 *  out of a hole in the hood (`hornHole` local point). */
export function makeJunkCar() {
  const g = new THREE.Group();
  const plank = tex(256, 128, (c, w, h) => { c.fillStyle = '#c49158'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#b98547' : '#cf9c63'; c.fillRect(0, i * h / 4, w, h / 4 - 3); c.fillStyle = '#7a5233'; c.fillRect(0, (i + 1) * h / 4 - 3, w, 3); } c.fillStyle = '#5a3a22'; for (const x of [12, w - 18]) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x, i * h / 4 + 14, 3, 0, 7); c.fill(); } c.fillStyle = '#3a2412'; c.font = 'bold 34px Arial'; c.fillText('FRAGILE', 70, 78); });
  const crateM = new THREE.MeshStandardMaterial({ map: plank, roughness: 0.85 });
  mk(new THREE.BoxGeometry(2.0, 0.62, 1.3), crateM, g, 0, 0.66, 0);
  // the hood hole (Gary is the horn)
  mk(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 20), mat(0x1a1208, 1), g, 0.62, 0.975, 0);
  const tireM = mat(0x1c1c1e, 0.8);
  const w1 = mk(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 20), tireM, g, -0.68, 0.33, 0.72); w1.rotation.x = PI / 2;
  const w2 = mk(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 20), tireM, g, -0.68, 0.33, -0.72); w2.rotation.x = PI / 2;
  for (const z of [0.84, -0.84]) mk(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16), steel(0xc8cdd2, 0.3), g, -0.68, 0.33, z).rotation.x = PI / 2;   // hubcaps
  const bike = new THREE.Group(); g.add(bike); bike.position.set(0.82, 0.3, 0);   // a bicycle wheel on a fork, front centre
  mk(new THREE.TorusGeometry(0.28, 0.025, 8, 28), tireM, bike); for (let i = 0; i < 6; i++) mk(new THREE.BoxGeometry(0.55, 0.006, 0.006), steel(0xcccccc), bike).rotation.z = (i * PI) / 6;
  for (const z of [-0.06, 0.06]) mk(new THREE.BoxGeometry(0.03, 0.45, 0.03), steel(0xcf3b2e), g, 0.82, 0.52, z).rotation.z = -0.2;
  // the lawnmower engine (red, pull cord) on the back + exhaust
  const eng = new THREE.Group(); g.add(eng); eng.position.set(-0.75, 0.97, 0);
  mk(new RoundedBoxGeometry(0.5, 0.36, 0.5, 2, 0.06), mat(0xcf2e2e, 0.45), eng, 0, 0.18, 0); mk(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 14), mat(0x222222, 0.5), eng, 0, 0.42, 0);
  mk(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), mat(0x111111), eng, 0.05, 0.38, 0.2); const cord = mk(new THREE.TorusGeometry(0.05, 0.012, 6, 12), mat(0xffd23f), eng, -0.1, 0.26, 0.27);
  const pipe = mk(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), steel(0x777777), eng, -0.25, 0.35, -0.15); pipe.rotation.z = 0.5;
  // lawn-chair seat + a steering wheel on a stick
  const chairM = mat(0x58b368, 0.7); mk(new THREE.BoxGeometry(0.5, 0.06, 0.5), chairM, g, -0.15, 1.0, 0); mk(new THREE.BoxGeometry(0.06, 0.5, 0.5), chairM, g, -0.42, 1.25, 0).rotation.z = 0.15;
  const stick = mk(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), mat(0x7a5233), g, 0.25, 1.15, 0); stick.rotation.z = 0.5;
  const sw = mk(new THREE.TorusGeometry(0.14, 0.022, 8, 20), mat(0x2a2d31), g, 0.36, 1.33, 0); sw.rotation.y = PI / 2; sw.rotation.x = 0.4;
  return { g, eng, cord, wheels: [w1, w2, bike], hornHole: new THREE.Vector3(0.62, 0.98, 0) };
}

/** Yellow six-axis robot arm. pose(yaw, shoulder, elbow, wrist) (rad); tip(v) → world position of the weld gun's tip. */
export function makeRobotArm(color = 0xf2b21e) {
  const g = new THREE.Group(), Y = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.2 }), DK = mat(0x2f3338, 0.5);
  mk(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 24), DK, g, 0, 0.15, 0);
  const turret = new THREE.Group(); g.add(turret); turret.position.y = 0.3;
  mk(new THREE.CylinderGeometry(0.34, 0.38, 0.45, 22), Y, turret, 0, 0.22, 0);
  const sh = new THREE.Group(); turret.add(sh); sh.position.set(0, 0.62, 0);
  mk(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 18), DK, sh).rotation.x = PI / 2;
  mk(new RoundedBoxGeometry(0.28, 1.3, 0.3, 3, 0.1), Y, sh, 0, 0.62, 0);
  const el = new THREE.Group(); sh.add(el); el.position.set(0, 1.25, 0);
  mk(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 16), DK, el).rotation.x = PI / 2;
  mk(new RoundedBoxGeometry(0.22, 0.22, 1.1, 3, 0.08), Y, el, 0, 0, 0.5);
  const wr = new THREE.Group(); el.add(wr); wr.position.set(0, 0, 1.08);
  mk(new THREE.SphereGeometry(0.12, 14, 10), DK, wr);
  const gun = new THREE.Group(); wr.add(gun);
  mk(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 10), steel(0x9aa3ad), gun, 0, -0.14, 0.1).rotation.x = 0.4;
  mk(new THREE.TorusGeometry(0.13, 0.03, 8, 16, PI * 1.3), steel(0x707a84), gun, 0, -0.3, 0.2).rotation.y = PI / 2;
  const tipP = new THREE.Object3D(); gun.add(tipP); tipP.position.set(0, -0.42, 0.24);
  const cable = mk(new THREE.TorusGeometry(0.35, 0.03, 6, 18, PI), mat(0x222222, 0.6), sh, 0.18, 0.9, 0); cable.rotation.y = PI / 2;
  return {
    g, turret, sh, el, wr,
    pose(yaw = 0, a = 0.3, b = 1.2, c = 0.6) { turret.rotation.y = yaw; sh.rotation.x = a; el.rotation.x = b - PI / 2; wr.rotation.x = c; },
    tip(v = new THREE.Vector3()) { g.updateMatrixWorld(true); return tipP.getWorldPosition(v); },
    /** Point the weld gun straight down at a world point (2-link IK in the turret plane). */
    reach(p, { lift = 0 } = {}) {
      g.updateMatrixWorld(true); const l = g.worldToLocal(new THREE.Vector3(p.x ?? p[0], (p.y ?? p[1]) + lift, p.z ?? p[2]));
      const yaw = Math.atan2(l.x, l.z), r = Math.hypot(l.x, l.z), Wy = l.y + 0.4837 - 0.92, Wz = r - 0.0, d = Math.min(2.3, Math.hypot(Wy, Wz)), L1 = 1.25, L2 = 1.08;
      const gam = Math.atan2(Wz, Wy), del = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), al = gam - del;
      const be = Math.atan2(Wz - L1 * Math.sin(al), Wy - L1 * Math.cos(al));
      this.pose(yaw, al, be - al + PI / 2 - PI / 2 + 0, 0); el.rotation.x = be - al - PI / 2 + PI / 2 - PI / 2; wr.rotation.x = 0.519 - be + PI / 2;
    },
  };
}

/** The Roomba (r ≈ 0.3 m so it reads): bumper, LED "eyes" that blink, and its career: badge, tie, top hat, a flag on a mast. */
export function makeRoomba() {
  const g = new THREE.Group(), R = 0.3;
  mk(new THREE.CylinderGeometry(R, R, 0.1, 40), mat(0x2b2e33, 0.35), g, 0, 0.06, 0);
  mk(new THREE.CylinderGeometry(R * 0.82, R * 0.86, 0.012, 40), mat(0x4a4f57, 0.25), g, 0, 0.115, 0);
  const bump = mk(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.07, 40, 1, true, -PI / 2.2, PI / 1.1), mat(0x8d949c, 0.4), g, 0, 0.055, 0); bump.rotation.y = PI / 2;
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), mat(0xdfe3e8, 0.3), g, 0, 0.125, 0);
  const ring = mk(new THREE.TorusGeometry(0.075, 0.008, 6, 24), new THREE.MeshBasicMaterial({ color: 0x46e07a, toneMapped: false }), g, 0, 0.13, 0); ring.rotation.x = PI / 2;
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x8ef0ff, toneMapped: false });
  const eyes = [-0.07, 0.07].map((z) => { const e = mk(new THREE.SphereGeometry(0.028, 10, 8), eyeM, g, R * 0.62, 0.125, z); e.scale.y = 0.6; return e; });
  const acc = new THREE.Group(); g.add(acc);
  const badge = new THREE.Group(); acc.add(badge); badge.position.set(R * 0.35, 0.13, 0);
  mk(new THREE.CylinderGeometry(0.17, 0.2, 0.09, 18), mat(0xffc21a, 0.35), badge, 0, 0.05, 0); mk(new THREE.CylinderGeometry(0.21, 0.21, 0.012, 18), mat(0xffc21a, 0.35), badge, 0.03, 0.006, 0);   // a tiny supervisor hard hat
  const tie = new THREE.Group(); acc.add(tie); tie.position.set(R * 0.86, 0.2, 0);   // a big red bow tie standing on the front rim, facing out (a flat tie on top read as a sliver)
  { const tm = mat(0xd12f3a, 0.45); for (const sd of [-1, 1]) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.15, 0.08); s.lineTo(0.15, -0.08); s.closePath(); const w = mk(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), tm, tie); w.rotation.y = -PI / 2; w.scale.x = sd; w.position.x = 0.015; }
    mk(new THREE.SphereGeometry(0.045, 12, 10), mat(0xa8202b, 0.45), tie, 0.01, 0, 0); }
  const hat = new THREE.Group(); acc.add(hat); hat.position.set(0, 0.13, 0);
  mk(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 24), mat(0x141414, 0.4), hat, 0, 0.006, 0); mk(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 20), mat(0x141414, 0.4), hat, 0, 0.11, 0); mk(new THREE.CylinderGeometry(0.102, 0.102, 0.03, 20), mat(0xb3202b, 0.5), hat, 0, 0.03, 0);
  const flag = new THREE.Group(); acc.add(flag); flag.position.set(-R * 0.5, 0.12, 0);
  mk(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), mat(0x999999), flag, 0, 0.35, 0);
  const chk = tex(64, 48, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { c.fillStyle = (i + j) % 2 ? '#111' : '#fff'; c.fillRect(i * 8, j * 8, 8, 8); } });
  const cloth = mk(new THREE.PlaneGeometry(0.34, 0.24, 6, 1), new THREE.MeshStandardMaterial({ map: chk, side: THREE.DoubleSide, roughness: 0.8 }), flag, 0.17, 0.58, 0);
  const pos0 = cloth.geometry.attributes.position.array.slice();
  return {
    g, eyes, badge, tie, hat, flag,
    set({ x = 0, z = 0, rotY = 0, t = 0, badge: b = 0, tie: ti = 0, hat: h = 0, flag: f = 0, wave = 0, scale = 1.2, blinkAt = 0 } = {}) {
      g.position.set(x, 0, z); g.rotation.y = rotY; g.scale.setScalar(scale);
      badge.visible = b > 0.01; badge.scale.setScalar(Math.max(0.001, b)); tie.visible = ti > 0.01; tie.scale.setScalar(Math.max(0.001, ti)); hat.visible = h > 0.01; hat.scale.setScalar(Math.max(0.001, h));
      flag.visible = f > 0.01; flag.scale.setScalar(Math.max(0.001, f)); flag.rotation.x = wave * 0.5 * Math.sin(t * 9);
      const a = cloth.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const px = pos0[i * 3]; a.array[i * 3 + 2] = 0.03 * Math.sin(t * 8 + px * 18) * (px + 0.17) * 3; } a.needsUpdate = true;
      const bl = (t % 3.1) < 0.12 || Math.abs(t - blinkAt) < 0.08; eyes.forEach((e) => (e.scale.y = bl ? 0.12 : 0.6));
    },
  };
}

export function makeSteeringWheel() { const g = new THREE.Group(), m = mat(0x2a2d31, 0.55); mk(new THREE.TorusGeometry(0.17, 0.028, 8, 22), m, g); for (let i = 0; i < 3; i++) mk(new THREE.BoxGeometry(0.17, 0.03, 0.02), m, g, 0, 0, 0).rotation.z = (i * 2 * PI) / 3 - PI / 2; mk(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12), mat(0xcf3b2e, 0.5), g).rotation.x = PI / 2; return g; }
export function makeTire() { const g = new THREE.Group(); mk(new THREE.TorusGeometry(0.24, 0.1, 10, 22), mat(0x1c1c1e, 0.8), g); mk(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16), steel(0xc8cdd2, 0.3), g).rotation.x = PI / 2; return g; }
/** White airbag that inflates out of a car (set(k) 0..1; it overshoots). */
export function makeAirbag() { const g = new THREE.Group(); const b = mk(new THREE.SphereGeometry(0.5, 24, 16), new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.75 }), g); return { g, set(k) { g.visible = k > 0.01; b.scale.set(Math.max(0.01, k), Math.max(0.01, k * 0.9), Math.max(0.01, k)); } }; }
/** The JIT tugger: a little electric cart pulling two parts trailers. */
export function makeTugger() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.9, 0.55, 0.7, 2, 0.08), mat(0x2f6fd6, 0.45), g, 0, 0.42, 0); mk(new THREE.BoxGeometry(0.05, 0.6, 0.6), mat(0x222222, 0.5), g, -0.3, 0.95, 0);
  mk(new RoundedBoxGeometry(0.5, 0.06, 0.6, 2, 0.02), mat(0x222222, 0.5), g, -0.05, 1.25, 0); mk(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffa31a, toneMapped: false }), g, -0.05, 1.32, 0);
  const trailers = [0, 1].map((i) => { const tr = new THREE.Group(); g.add(tr); tr.position.x = -1.05 - i * 1.0; mk(new THREE.BoxGeometry(0.85, 0.08, 0.66), steel(0x8d969f), tr, 0, 0.32, 0); for (const z of [-0.3, 0.3]) mk(new THREE.BoxGeometry(0.85, 0.3, 0.03), steel(0x8d969f), tr, 0, 0.5, z); return tr; });
  for (const x of [0.3, -0.3, -0.8, -1.3, -1.8, -2.3]) for (const z of [-0.3, 0.3]) mk(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), mat(0x1c1c1e, 0.8), g, x, 0.12, z).rotation.x = PI / 2;
  return { g, trailers };
}
/** QUIK FIX AUTO's tow truck (front +x): a cab, a bed, a boom with a hook. hook = local point the towed car's nose hangs from. */
export async function makeTowTruck() {
  await document.fonts.load(font(60));
  const g = new THREE.Group(), blue = mat(0x2f6fd6, 0.4), tireM = mat(0x1c1c1e, 0.8);
  const doorT = tex(256, 128, (c, w, h) => { c.fillStyle = '#2f6fd6'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.font = font(40); c.textAlign = 'center'; c.fillText('QUIK FIX', w / 2, 58); c.fillText('AUTO', w / 2, 102); });
  mk(new RoundedBoxGeometry(1.5, 1.35, 1.8, 3, 0.15), [blue, blue, blue, blue, new THREE.MeshStandardMaterial({ map: doorT, roughness: 0.4 }), blue], g, 1.15, 1.2, 0);
  mk(new RoundedBoxGeometry(1.0, 0.75, 1.75, 3, 0.12), blue, g, 2.3, 0.9, 0);
  mk(new RoundedBoxGeometry(0.9, 0.5, 1.82, 2, 0.08), new THREE.MeshStandardMaterial({ color: 0x9fd1ef, roughness: 0.1 }), g, 1.25, 1.62, 0);
  mk(new THREE.BoxGeometry(2.4, 0.45, 1.85), steel(0x3a3e44, 0.5), g, -0.85, 0.78, 0);
  const boom = mk(new THREE.BoxGeometry(0.18, 1.9, 0.18), mat(0xffc21a, 0.4), g, -1.6, 1.75, 0); boom.rotation.z = 0.7;
  mk(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), mat(0x222222), g, -2.25, 2.05, 0);
  mk(new THREE.TorusGeometry(0.08, 0.02, 6, 12, PI * 1.4), mat(0x222222), g, -2.25, 1.62, 0);
  const lb = mk(new THREE.BoxGeometry(0.4, 0.12, 0.9), new THREE.MeshBasicMaterial({ color: 0xffa31a, toneMapped: false }), g, 1.1, 1.95, 0);
  const wheels = [[2.1, 0.8], [2.1, -0.8], [-0.9, 0.8], [-0.9, -0.8]].map(([x, z]) => { const w = mk(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 20), tireM, g, x, 0.38, z); w.rotation.x = PI / 2; return w; });
  return { g, wheels, beacon: lb, hook: new THREE.Vector3(-2.25, 1.55, 0) };
}
/** Upright vacuum cleaner (Gary's job at the end). */
export function makeVacuum() { const g = new THREE.Group(); mk(new RoundedBoxGeometry(0.34, 0.1, 0.24, 2, 0.03), mat(0x7a4fd6, 0.45), g, 0, 0.05, 0); mk(new RoundedBoxGeometry(0.2, 0.42, 0.16, 2, 0.05), mat(0x7a4fd6, 0.45), g, -0.08, 0.32, 0).rotation.z = 0.25; mk(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), steel(0xbbbbbb), g, -0.2, 0.75, 0).rotation.z = 0.25; return g; }
/** A small whiteboard easel (the Roomba's "MY IDEA" chart). */
export function makeEasel(text = 'MY IDEA') {
  const g = new THREE.Group(), wood = mat(0x9a6a3e, 0.7);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6), wood, g, s * 0.25, 0.5, 0.05).rotation.z = s * 0.12;
  const t = tex(256, 200, (c, w, h) => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2f6fd6'; c.lineWidth = 8; c.beginPath(); c.moveTo(30, 160); c.lineTo(90, 120); c.lineTo(140, 135); c.lineTo(220, 50); c.stroke(); c.fillStyle = '#2f6fd6'; c.beginPath(); c.moveTo(225, 40); c.lineTo(200, 52); c.lineTo(220, 68); c.fill(); c.fillStyle = '#d12f3a'; c.font = font(44); c.textAlign = 'center'; c.fillText(text, w / 2, 48); });
  mk(new THREE.BoxGeometry(0.6, 0.46, 0.02), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), g, 0, 0.82, 0.08).rotation.x = -0.1;
  return g;
}
/** The mechanic's invoice: a long paper strip with a red total. */
export function makeInvoice(total = '$900') {
  const t = tex(128, 320, (c, w, h) => { c.fillStyle = '#fffdf4'; c.fillRect(0, 0, w, h); c.fillStyle = '#9aa'; for (let y = 40; y < h - 60; y += 18) c.fillRect(12, y, w - 24 - ((y * 7) % 40), 5); c.fillStyle = '#d12f3a'; c.font = font(40); c.textAlign = 'center'; c.fillText(total, w / 2, h - 22); });
  return mk(new THREE.PlaneGeometry(0.28, 0.7), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.8 }), new THREE.Group(), 0, 0, 0).parent;
}

// ---------------------------------------------------------------- the set
export async function buildFactory(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96));
  renderer.localClippingEnabled = true;
  camera.far = 700; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xd6ecf8); scene.fog = new THREE.Fog(0xd6ecf8, 80, 300);
  makeSky(root, 330);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  const hemi = new THREE.HemisphereLight(0xeaf4ff, 0x9a8a72, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cy, half = 9) { sun.position.set(cx - 6, cy + 11, 15); sun.target.position.set(cx, cy, -3); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 70 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 1);

  // ---- ground: cut face + the floor/lawn tops
  const F = D.face;
  const cut = makeCutFace({ ...F, ppm: 80, mppm: 40, depth: 3.0, backShade: 0.22, paint: paintGround });
  root.add(cut.group); cut.back.visible = false;   // the back wall is only seen through the tank pit — the pit has its own walls
  // the hall's slab in section: drawn on a strip that grows with the hall (in front of the face)
  const hallSlabT = tex(1024, 32, (g, w, h) => { g.fillStyle = '#c9c5bd'; g.fillRect(0, 0, w, h); g.fillStyle = '#9b968d'; for (let x = 6; x < w; x += 14) { g.beginPath(); g.arc(x, h * 0.55, 2.2, 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, h - 3, w, 3); });
  hallSlabT.wrapS = THREE.RepeatWrapping; hallSlabT.repeat.set((H.x1 - H.x0) / 3, 1);
  const hallSlabM = new THREE.MeshStandardMaterial({ map: hallSlabT, roughness: 0.9 });
  const slabClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), H.x0);
  hallSlabM.clippingPlanes = [slabClip];
  const slabMP = maskedPlane(H.x1 - H.x0, 0.3, hallSlabM, 40); slabMP.mesh.position.set((H.x0 + H.x1) / 2, -0.15, 0.004); slabMP.mesh.castShadow = false; root.add(slabMP.mesh);
  const lawnT = lawnTexture(); lawnT.repeat.set(104 / 1.6, 30 / 1.6);
  const outside = maskedPlane(104, 30, new THREE.MeshStandardMaterial({ map: lawnT, roughness: 0.95 }), 10);
  outside.mesh.rotation.x = -PI / 2; outside.mesh.position.set(21, -0.005, -15); root.add(outside.mesh);
  // the far lawn + suburb behind everything
  const far = mk(new THREE.PlaneGeometry(700, 400), new THREE.MeshStandardMaterial({ map: (() => { const l = lawnTexture('#86c862', '#79bb56'); l.repeat.set(220, 120); return l; })(), roughness: 1 }), root, 10, -0.03, -230); far.rotation.x = -PI / 2;

  // ---- QUIK FIX AUTO (the mechanic, far right — the hook's tow truck takes your car here; the last shot finds it on the lift)
  // built in local x (0 = the shop's left wall), the group sits at D.shop.x0
  const shop = new THREE.Group(); root.add(shop); shop.position.x = S.x0;
  const SW = S.x1 - S.x0;
  const shopFloorT = tex(256, 256, (g, w, h) => { g.fillStyle = '#9fa3a6'; g.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(30,30,30,${0.05 + R() * 0.12})`; g.beginPath(); g.ellipse(R() * w, R() * h, 8 + R() * 30, 5 + R() * 18, R() * 3, 0, 7); g.fill(); } });
  shopFloorT.wrapS = shopFloorT.wrapT = THREE.RepeatWrapping; shopFloorT.repeat.set(2, 2);
  mk(new THREE.PlaneGeometry(SW, -S.back), new THREE.MeshStandardMaterial({ map: shopFloorT, roughness: 0.8 }), shop, SW / 2, 0.003, S.back / 2).rotation.x = -PI / 2;
  const shopWallM = mat(0xe9d7b0, 0.9), shopWallT = tex(512, 256, (g, w, h) => { g.fillStyle = '#e9d7b0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9b48c'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#b39a70'; g.fillRect(0, h * 0.6, w, 6); });
  mk(new THREE.PlaneGeometry(SW, S.h), new THREE.MeshStandardMaterial({ map: shopWallT, roughness: 0.9 }), shop, SW / 2, S.h / 2, S.back);
  for (const x of [0, SW]) mk(new THREE.BoxGeometry(0.22, S.h, -S.back), [shopWallM, shopWallM, shopWallM, shopWallM, SECTION, shopWallM], shop, x + (x === 0 ? -0.11 : 0.11), S.h / 2, S.back / 2);
  mk(new THREE.BoxGeometry(SW + 0.44, 0.3, -S.back + 0.2), [mat(0x8a8f96), mat(0x8a8f96), mat(0x5a5f66), mat(0xdedad2), SECTION, mat(0x8a8f96)], shop, SW / 2, S.h + 0.15, S.back / 2 + 0.1);
  const shopSign = sign(shop, 'QUIK FIX AUTO', 4.2, 0.8, { bg: '#2f6fd6', border: '#ffd23f' }); shopSign.position.set(SW / 2, S.h + 0.75, -0.6); shopSign.castShadow = true;
  // a four-post lift: runways under the wheels, posts at the corners (no post between the lens and the car)
  const lift = new THREE.Group(); shop.add(lift); lift.position.set(3.7, 0, -2.9);
  for (const x of [-2.15, 2.15]) for (const z of [-1.15, 1.15]) { mk(new THREE.BoxGeometry(0.2, 2.9, 0.2), mat(0xd12f3a, 0.5), lift, x, 1.45, z); mk(new THREE.BoxGeometry(0.4, 0.1, 0.4), mat(0x444444), lift, x, 0.05, z); }
  const liftArms = new THREE.Group(); lift.add(liftArms);
  for (const z of [-0.7, 0.7]) mk(new THREE.BoxGeometry(4.0, 0.1, 0.42), steel(0x666c72), liftArms, 0, -0.05, z);
  for (const x of [-2.05, 2.05]) mk(new THREE.BoxGeometry(0.14, 0.14, 2.3), steel(0x555a60), liftArms, x, -0.05, 0);
  // shop dressing: counter + register, price board, tire stacks, oil cans, a red toolbox, signs, a cobweb for the ending
  const counter = new THREE.Group(); shop.add(counter); counter.position.set(0.75, 0, -3.9);
  mk(new RoundedBoxGeometry(1.4, 1.0, 0.6, 2, 0.04), mat(0x6b4a33, 0.7), counter, 0, 0.5, 0); mk(new RoundedBoxGeometry(0.4, 0.28, 0.32, 2, 0.04), mat(0x3a3e44, 0.5), counter, 0.3, 1.14, 0);
  counter.rotation.y = PI / 2;
  const priceBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), new THREE.MeshStandardMaterial({ roughness: 0.7 })); priceBoard.position.set(0.75, 2.35, S.back + 0.03); priceBoard.scale.setScalar(0.87); shop.add(priceBoard);
  const priceTex = (price) => tex(300, 200, (g, w, h) => { g.fillStyle = '#1d2b22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a0743d'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.fillStyle = '#fff'; g.font = font(40); g.textAlign = 'center'; g.fillText('YOUR CAR', w / 2, 66); g.fillStyle = '#ffd23f'; g.font = font(78); g.fillText(price, w / 2, 160); });
  const prices = { '$900': priceTex('$900'), '$1,400': priceTex('$1,400') }; priceBoard.material.map = prices['$900'];
  for (let i = 0; i < 5; i++) { const tr = makeTire(); tr.rotation.x = PI / 2; tr.position.set(6.7, 0.12 + i * 0.21, -4.6); shop.add(tr); }
  for (let i = 0; i < 4; i++) { const tr = makeTire(); tr.rotation.x = PI / 2; tr.position.set(6.2, 0.12 + i * 0.21, -5.0); shop.add(tr); }
  for (let i = 0; i < 8; i++) mk(new THREE.CylinderGeometry(0.1, 0.1, 0.26, 12), mat([0x2f6fd6, 0xd12f3a, 0xffc21a][i % 3], 0.4), shop, 2.6 + (i % 4) * 0.25, 1.33 + Math.floor(i / 4) * 0.4, -5.35);
  mk(new THREE.BoxGeometry(1.2, 0.04, 0.4), mat(0x6b4a33), shop, 2.95, 1.18, -5.35); mk(new THREE.BoxGeometry(1.2, 0.04, 0.4), mat(0x6b4a33), shop, 2.95, 1.58, -5.35);
  mk(new RoundedBoxGeometry(0.7, 1.0, 0.45, 2, 0.04), mat(0xd12f3a, 0.45), shop, 4.4, 0.5, -5.2);
  sign(shop, 'NO REFUNDS', 1.2, 0.4, { bg: '#ffd23f', fg: '#222' }).position.set(5.6, 2.5, S.back + 0.03);
  sign(shop, 'OIL CHANGE $99', 1.4, 0.45, { bg: '#fff', fg: '#d12f3a', border: '#d12f3a' }).position.set(4.3, 2.9, S.back + 0.03);
  const webT = tex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; for (let k = 0; k < 9; k++) { const a = (k / 8) * PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * w, Math.sin(a) * h); g.stroke(); } for (let r = 30; r < w; r += 34) { g.beginPath(); for (let k = 0; k <= 8; k++) { const a = (k / 8) * PI / 2, rr = r * (0.92 + 0.08 * (k % 2)); k ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); } });
  const cobwebs = [[1.65, 2.9, -1.85, 0], [5.75, 2.9, -1.85, PI / 2]].map(([x, y, z, r]) => { const w = mk(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide }), shop, x, y, z); w.rotation.z = PI + r; w.castShadow = false; return w; });

  // ---- the garage
  const garage = new THREE.Group(); root.add(garage);
  const gFloorT = tex(256, 256, (g, w, h) => { g.fillStyle = '#b9b5ae'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.fillStyle = 'rgba(30,25,20,.25)'; g.beginPath(); g.ellipse(w * 0.55, h * 0.5, 50, 30, 0.3, 0, 7); g.fill(); });
  gFloorT.wrapS = gFloorT.wrapT = THREE.RepeatWrapping; gFloorT.repeat.set(2, 2);
  mk(new THREE.PlaneGeometry(G.x1 - G.x0, -G.back), new THREE.MeshStandardMaterial({ map: gFloorT, roughness: 0.85 }), garage, (G.x0 + G.x1) / 2, 0.004, G.back / 2).rotation.x = -PI / 2;
  const peg = tex(512, 256, (g, w, h) => { g.fillStyle = '#c8a172'; g.fillRect(0, 0, w, h); g.fillStyle = '#8f6b44'; for (let x = 8; x < w; x += 16) for (let y = 8; y < h; y += 16) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } });
  const gWallT = tex(512, 256, (g, w, h) => { g.fillStyle = '#dfe6e9'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < h; y += 24) g.fillRect(0, y, w, 2); });
  mk(new THREE.PlaneGeometry(G.x1 - G.x0, G.h), new THREE.MeshStandardMaterial({ map: gWallT, roughness: 0.9 }), garage, (G.x0 + G.x1) / 2, G.h / 2, G.back);
  const gWallM = mat(0xdfe6e9, 0.9);
  mk(new THREE.BoxGeometry(0.2, G.h, -G.back), [gWallM, gWallM, gWallM, gWallM, SECTION, gWallM], garage, G.x0 - 0.1, G.h / 2, G.back / 2);
  // right wall with the roll-up door opening (z D.garage.door)
  const gRight = new THREE.Group(); garage.add(gRight);
  const [dz0, dz1] = G.door, doorH = 2.2;
  mk(new THREE.BoxGeometry(0.2, G.h, dz0 - G.back), gWallM, gRight, G.x1 + 0.1, G.h / 2, (G.back + dz0) / 2);
  mk(new THREE.BoxGeometry(0.2, G.h, -dz1), [gWallM, gWallM, gWallM, gWallM, SECTION, gWallM], gRight, G.x1 + 0.1, G.h / 2, dz1 / 2);
  mk(new THREE.BoxGeometry(0.2, G.h - doorH, dz1 - dz0), gWallM, gRight, G.x1 + 0.1, doorH + (G.h - doorH) / 2, (dz0 + dz1) / 2);
  const rollT = tex(128, 256, (g, w, h) => { g.fillStyle = '#eef1f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9ced1'; for (let y = 0; y < h; y += 22) g.fillRect(0, y, w, 4); });
  const rollDoor = mk(new THREE.PlaneGeometry(dz1 - dz0, doorH), new THREE.MeshStandardMaterial({ map: rollT, roughness: 0.7, side: THREE.DoubleSide }), gRight, G.x1 + 0.12, doorH / 2, (dz0 + dz1) / 2); rollDoor.rotation.y = -PI / 2;
  const setRollDoor = (k) => { rollDoor.scale.y = Math.max(0.02, 1 - k); rollDoor.position.y = doorH - (doorH * rollDoor.scale.y) / 2; };
  // gable roof (in section at the front)
  const roofShape = new THREE.Shape(); roofShape.moveTo(G.x0 - 0.45, G.h); roofShape.lineTo((G.x0 + G.x1) / 2, G.ridge + 0.25); roofShape.lineTo(G.x1 + 0.45, G.h); roofShape.lineTo(G.x1 + 0.45, G.h + 0.12); roofShape.lineTo((G.x0 + G.x1) / 2, G.ridge + 0.4); roofShape.lineTo(G.x0 - 0.45, G.h + 0.12); roofShape.closePath();
  mk(new THREE.ExtrudeGeometry(roofShape, { depth: -G.back + 0.3, bevelEnabled: false }), [SECTION, mat(0xb5523b, 0.8)], garage, 0, 0, G.back - 0.3);
  const gable = new THREE.Shape(); gable.moveTo(G.x0, G.h); gable.lineTo((G.x0 + G.x1) / 2, G.ridge + 0.2); gable.lineTo(G.x1, G.h); gable.closePath();
  mk(new THREE.ShapeGeometry(gable), mat(0xd9cbb4, 0.9), garage, 0, 0, G.back + 0.01);
  mk(new THREE.BoxGeometry(G.x1 - G.x0, 0.06, -G.back), mat(0xcfc4b0, 0.9), garage, (G.x0 + G.x1) / 2, G.h - 0.03, G.back / 2).material.side = THREE.DoubleSide;
  // garage dressing: pegboard + tools, workbench + vise, shelves + paint cans, a bike, a fridge, hose reel, a bare bulb
  const pegboard = mk(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshStandardMaterial({ map: peg, roughness: 0.85 }), garage, -4.1, 1.75, G.back + 0.02);
  const tools = new THREE.Group(); garage.add(tools); tools.position.set(-4.1, 1.75, G.back + 0.06);
  const toolM = steel(0x9aa3ad, 0.35), handleM = mat(0xd12f3a, 0.5);
  [[-1.0, 0.25], [-0.6, 0.3], [-0.2, 0.2], [0.25, 0.28], [0.7, 0.22], [1.05, 0.3]].forEach(([x, y], i) => { const tg = new THREE.Group(); tools.add(tg); tg.position.set(x, y, 0);
    if (i % 3 === 0) { mk(new THREE.BoxGeometry(0.05, 0.32, 0.03), toolM, tg); mk(new THREE.BoxGeometry(0.14, 0.05, 0.04), toolM, tg, 0, 0.16, 0); } else if (i % 3 === 1) { mk(new THREE.BoxGeometry(0.04, 0.34, 0.03), handleM, tg, 0, -0.06, 0); mk(new THREE.BoxGeometry(0.16, 0.06, 0.05), toolM, tg, 0, 0.13, 0); } else { mk(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), handleM, tg); mk(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), toolM, tg, 0, 0.22, 0); } });
  [[-0.9, -0.35], [-0.3, -0.4], [0.4, -0.38], [0.95, -0.3]].forEach(([x, y]) => { const w = mk(new THREE.TorusGeometry(0.07, 0.015, 6, 14), toolM, tools, x, y, 0); });
  const bench = new THREE.Group(); garage.add(bench); bench.position.set(-4.1, 0, G.back + 0.4);
  mk(new THREE.BoxGeometry(2.6, 0.08, 0.7), mat(0x9a6a3e, 0.7), bench, 0, 0.9, 0); for (const x of [-1.2, 1.2]) for (const z of [-0.3, 0.3]) mk(new THREE.BoxGeometry(0.07, 0.9, 0.07), mat(0x7a5233), bench, x, 0.45, z);
  mk(new THREE.BoxGeometry(2.4, 0.04, 0.6), mat(0x7a5233), bench, 0, 0.25, 0); mk(new RoundedBoxGeometry(0.22, 0.18, 0.2, 2, 0.03), steel(0x2f6fd6, 0.4), bench, 0.9, 1.03, 0);
  for (let i = 0; i < 5; i++) mk(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 12), mat([0x58b368, 0xffc21a, 0x2f6fd6, 0xd12f3a, 0xffffff][i], 0.4), bench, -0.9 + i * 0.25, 0.4, 0);
  const shelf = new THREE.Group(); garage.add(shelf); shelf.position.set(-6.85, 0, -2.6);
  for (const y of [0.5, 1.15, 1.8]) mk(new THREE.BoxGeometry(0.5, 0.04, 2.2), steel(0x6b737b), shelf, 0, y, 0); for (const z of [-1.08, 1.08]) for (const x of [-0.23, 0.23]) mk(new THREE.BoxGeometry(0.04, 2.1, 0.04), steel(0x6b737b), shelf, x, 1.05, z);
  const R = rng(11); for (let i = 0; i < 12; i++) mk(new RoundedBoxGeometry(0.4, 0.3 + R() * 0.2, 0.4 + R() * 0.3, 2, 0.03), mat([0xc9a26b, 0xb8905a, 0x2f6fd6, 0x58b368][i % 4], 0.8), shelf, 0, [0.5, 1.15, 1.8][i % 3] + 0.18, -0.8 + Math.floor(i / 3) * 0.55);
  const bikeG = new THREE.Group(); garage.add(bikeG); bikeG.position.set(-6.9, 1.5, -4.2); bikeG.rotation.y = PI / 2;
  for (const x of [-0.42, 0.42]) mk(new THREE.TorusGeometry(0.3, 0.025, 8, 24), mat(0x1c1c1e), bikeG, x, 0, 0); mk(new THREE.BoxGeometry(0.8, 0.04, 0.04), mat(0x2bb3a3), bikeG, 0, 0.2, 0).rotation.z = 0.2;
  const fridge = new THREE.Group(); garage.add(fridge); fridge.position.set(-1.9, 0, -4.7); mk(new RoundedBoxGeometry(0.75, 1.7, 0.65, 3, 0.06), mat(0xf4f4f0, 0.35), fridge, 0, 0.85, 0); mk(new THREE.BoxGeometry(0.03, 0.4, 0.03), steel(0xaaaaaa), fridge, 0.3, 1.15, 0.34);
  const bulb = mk(new THREE.SphereGeometry(0.08, 12, 10), new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xfff0c0, emissiveIntensity: 1.4 }), garage, -4.3, G.h - 0.35, -2.4); mk(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4), mat(0x222222), garage, -4.3, G.h - 0.15, -2.4);
  const lawnmower = new THREE.Group(); garage.add(lawnmower); lawnmower.position.set(-6.2, 0, -0.9);
  mk(new RoundedBoxGeometry(0.6, 0.2, 0.5, 2, 0.05), mat(0x58b368, 0.5), lawnmower, 0, 0.22, 0); const lmEng = mk(new RoundedBoxGeometry(0.3, 0.22, 0.3, 2, 0.04), mat(0xcf2e2e, 0.45), lawnmower, 0, 0.43, 0);
  for (const [x, z] of [[0.25, 0.25], [0.25, -0.25], [-0.25, 0.25], [-0.25, -0.25]]) { mk(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), mat(0x3a3a3e), lawnmower, x, 0.09, z).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 10), mat(0xf2c418, 0.4), lawnmower, x, 0.09, z).rotation.x = PI / 2; }
  mk(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), steel(0x999999), lawnmower, -0.45, 0.55, 0).rotation.z = 0.9;
  // ---- the back yard (before the hall): a fence, a tree, a BBQ, a shed — they pop away as the hall grows
  const yard = new THREE.Group(); root.add(yard);
  const fenceM = mat(0xf2ede4, 0.8);
  for (let x = H.x0 + 0.3; x < 22; x += 0.32) mk(new THREE.BoxGeometry(0.12, 1.1, 0.04), fenceM, yard, x, 0.55, -8.0);
  for (let z = -7.9; z < -0.2; z += 0.32) mk(new THREE.BoxGeometry(0.04, 1.1, 0.12), fenceM, yard, 22.0, 0.55, z);
  mk(new THREE.BoxGeometry(23, 0.06, 0.05), fenceM, yard, 10.6, 0.85, -7.97); mk(new THREE.BoxGeometry(23, 0.06, 0.05), fenceM, yard, 10.6, 0.35, -7.97);
  const yardTree = makeTree(77, 1.1); yardTree.position.set(9.5, 0, -6.2); yard.add(yardTree);
  const bbq = new THREE.Group(); yard.add(bbq); bbq.position.set(5.0, 0, -5.4); mk(new THREE.SphereGeometry(0.35, 16, 10, 0, PI * 2, 0, PI / 2), mat(0x222222, 0.4), bbq, 0, 0.85, 0).rotation.x = PI; for (let i = 0; i < 3; i++) mk(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), mat(0x222222), bbq, Math.cos(i * 2.1) * 0.22, 0.42, Math.sin(i * 2.1) * 0.22);
  const shed = new THREE.Group(); yard.add(shed); shed.position.set(15.5, 0, -6.6); mk(new THREE.BoxGeometry(2.2, 2.0, 1.8), mat(0xb5523b, 0.8), shed, 0, 1.0, 0); mk(new THREE.ConeGeometry(1.7, 0.7, 4), mat(0x6b4a33, 0.8), shed, 0, 2.35, 0).rotation.y = PI / 4;
  const yardItems = [yardTree, bbq, shed];

  // ---- the hall (pops up bay by bay)
  const hall = new THREE.Group(); root.add(hall);
  const floorT = tex(512, 512, (g, w, h) => { g.fillStyle = '#a9aeb2'; g.fillRect(0, 0, w, h); const R2 = rng(5); for (let i = 0; i < 800; i++) { g.fillStyle = `rgba(${R2() > 0.5 ? '255,255,255' : '0,0,0'},.04)`; g.fillRect(R2() * w, R2() * h, 3, 3); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set((H.x1 - H.x0) / 4, -H.back / 4);
  const hallFloor = maskedPlane(H.x1 - H.x0, -H.back, new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.32, metalness: 0.05 }), 40);
  hallFloor.mesh.rotation.x = -PI / 2; hallFloor.mesh.position.set((H.x0 + H.x1) / 2, 0.006, H.back / 2); hall.add(hallFloor.mesh);
  const setFloorHoles = (shapes) => hallFloor.setHoles(shapes, (x, z) => [x - (H.x0 + H.x1) / 2, -(z - H.back / 2)]);
  const floorClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), H.x0); hallFloor.mesh.material.clippingPlanes = [floorClip];
  // floor paint: yellow walkway lines either side of the line, green aisle
  const stripeM = mat(0xf2c418, 0.6); stripeM.clippingPlanes = [floorClip];
  for (const z of [L.z + 1.35, L.z - 1.35]) { const s = mk(new THREE.PlaneGeometry(L.x1 - H.x0 + 0.5, 0.1), stripeM, hall, (H.x0 + L.x1) / 2, 0.012, z); s.rotation.x = -PI / 2; s.receiveShadow = true; }
  // the conveyor: a floor-flush slat line (its texture scrolls with the line)
  const slatT = tex(256, 64, (g, w, h) => { g.fillStyle = '#5c636b'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3f45'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 4, h); g.fillStyle = 'rgba(255,255,255,.1)'; for (let x = 8; x < w; x += 32) g.fillRect(x, 4, 18, 3); });
  slatT.wrapS = THREE.RepeatWrapping; slatT.repeat.set((L.x1 - H.x0) / 2, 1);
  const convM = new THREE.MeshStandardMaterial({ map: slatT, roughness: 0.5, metalness: 0.3 }); convM.clippingPlanes = [floorClip];
  const conveyor = mk(new THREE.BoxGeometry(L.x1 - H.x0 + 0.4, 0.08, 1.9), [mat(0x3a3f45), mat(0x3a3f45), convM, mat(0x3a3f45), mat(0x3a3f45), mat(0x3a3f45)], hall, (H.x0 + L.x1) / 2, 0.04, L.z);
  for (const m of conveyor.material) m.clippingPlanes = [floorClip];
  const setLine = (s) => { slatT.offset.x = -s / 2; };
  // the bays: back wall panel, back column, roof slab, a truss, two light panels
  const wallT = tex(512, 512, (g, w, h) => { g.fillStyle = '#b9c3cc'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 24) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(x, 0, 6, h); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 8, 0, 3, h); } g.fillStyle = '#2f6fd6'; g.fillRect(0, h * 0.86, w, h * 0.14); g.fillStyle = '#9fd3f5'; for (let x = 20; x < w; x += 128) g.fillRect(x, 26, 88, 60); g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = 20; x < w; x += 128) g.fillRect(x, 26, 88, 8); });
  const bays = [], nB = Math.ceil((H.x1 - H.x0) / H.bay);
  const roofM = mat(0x9aa1a8, 0.7), trussM = steel(0x5d656e, 0.5), colM = steel(0x2f6fd6, 0.45), panelM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f8ff, emissiveIntensity: 1.5, roughness: 0.4 });
  for (let i = 0; i < nB; i++) {
    const x0 = H.x0 + i * H.bay, x1 = Math.min(H.x1, x0 + H.bay), cx = (x0 + x1) / 2, w = x1 - x0;
    const bay = { x0, x1, wall: new THREE.Group(), roof: new THREE.Group() }; hall.add(bay.wall, bay.roof);
    bay.wall.position.set(cx, 0, H.back); bay.roof.position.set(cx, 0, 0);
    const wt = wallT.clone(); wt.needsUpdate = true; wt.wrapS = THREE.RepeatWrapping; wt.repeat.set(w / 6.2, 1);
    mk(new THREE.PlaneGeometry(w, H.h), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.75 }), bay.wall, 0, H.h / 2, 0);
    mk(new THREE.BoxGeometry(0.3, H.h, 0.3), colM, bay.wall, -w / 2 + 0.15, H.h / 2, 0.2);
    mk(new THREE.BoxGeometry(w, 0.38, -H.back + 0.3), [roofM, roofM, roofM, mat(0xe8ecef, 0.8), SECTION, roofM], bay.roof, 0, H.h + 0.19, H.back / 2 + 0.15);
    const tr = mk(new THREE.BoxGeometry(0.2, 0.6, -H.back), trussM, bay.roof, -w / 2 + 0.2, H.h - 0.3, H.back / 2);
    for (const z of [-2.2, -6.2]) mk(new THREE.BoxGeometry(Math.min(3.4, w * 0.6), 0.08, 0.5), panelM, bay.roof, 0, H.h - 0.55, z);
    bays.push(bay);
  }
  // the right end wall (a cut wall) + a roof parapet
  const endWall = new THREE.Group(); hall.add(endWall); endWall.position.x = H.x1 + 0.15;
  { const ewM = mat(0xd7dee3, 0.8), E = D.exit, sec = [ewM, ewM, ewM, ewM, SECTION, ewM];
    mk(new THREE.BoxGeometry(0.3, H.h, E.z0 - H.back), ewM, endWall, 0, H.h / 2, (H.back + E.z0) / 2);
    mk(new THREE.BoxGeometry(0.3, H.h, -E.z1), sec, endWall, 0, H.h / 2, E.z1 / 2);
    mk(new THREE.BoxGeometry(0.3, H.h - E.h, E.z1 - E.z0), ewM, endWall, 0, E.h + (H.h - E.h) / 2, (E.z0 + E.z1) / 2);
    for (const z of [E.z0 - 0.1, E.z1 + 0.1]) { const st = mk(new THREE.BoxGeometry(0.34, E.h, 0.2), mat(0xf2c418, 0.5), endWall, 0, E.h / 2, z); }
    sign(endWall, 'SHIPPING', 1.6, 0.4, { bg: '#2f6fd6', fg: '#fff' }).position.set(-0.16, E.h + 0.35, (E.z0 + E.z1) / 2); endWall.children[endWall.children.length - 1].rotation.y = -PI / 2; }
  // logo banner + signs on the back wall (shown when their bays exist)
  const banner = sign(hall, 'GARAGE MOTORS', 7.0, 1.2, { bg: '#ffffff', fg: '#2f6fd6', border: '#2f6fd6' }); banner.position.set(7.0, 5.4, H.back + 0.04);
  const daysSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ roughness: 0.6 })); daysSign.position.set(1.6, 2.9, H.back + 0.04); hall.add(daysSign);
  const daysTex = [0, 1].map((n) => tex(320, 160, (g, w, h) => { g.fillStyle = '#1e7d3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = font(30); g.textAlign = 'center'; g.fillText('DAYS WITHOUT A', w / 2, 40); g.fillText('GARY ACCIDENT', w / 2, 72); g.fillStyle = '#ffd23f'; g.font = font(70); g.fillText(String(n), w / 2, 140); }));
  daysSign.material.map = daysTex[0];
  const daysSign2 = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ map: daysTex[0], roughness: 0.6 })); daysSign2.position.set(44.6, 2.0, H.back + 0.04); hall.add(daysSign2);
  const safety = sign(hall, 'SAFETY FIRST!', 2.4, 0.6, { bg: '#1e7d3a', fg: '#fff' }); safety.position.set(25.0, 3.9, H.back + 0.04);
  const tpsSign = sign(hall, 'JUST-IN-TIME ZONE', 3.0, 0.55, { bg: '#2f6fd6', fg: '#fff' }); tpsSign.position.set(D.jit, 4.5, H.back + 0.04);
  const qcSign = sign(hall, 'QUALITY CONTROL', 2.6, 0.5, { bg: '#d12f3a', fg: '#fff' }); qcSign.position.set(D.qc.x, 2.95, L.z + 1.32); qcSign.scale.setScalar(0.7); qcSign.visible = false;
  const clock = new THREE.Group(); hall.add(clock); clock.position.set(17.0, 4.6, H.back + 0.05);
  mk(new THREE.CircleGeometry(0.42, 32), mat(0xffffff, 0.4), clock); mk(new THREE.TorusGeometry(0.42, 0.04, 8, 32), mat(0x222222, 0.4), clock);
  const hands = [0.3, 0.2].map((l) => { const h = new THREE.Group(); clock.add(h); mk(new THREE.BoxGeometry(0.03, l, 0.01), mat(0x222222), h, 0, l / 2, 0.01); return h; });
  // stations behind the line: parts racks + bins (dressing), a stamping press (interchangeable parts)
  const racks = new THREE.Group(); hall.add(racks);
  for (const [x, col] of [[1.0, 0x2f6fd6], [5.0, 0xd12f3a], [9.0, 0x2f6fd6], [20.6, 0xd12f3a], [31.0, 0x2f6fd6]]) {
    const rk = new THREE.Group(); racks.add(rk); rk.position.set(x, 0, -7.9);
    for (const y of [0.4, 1.3, 2.2]) mk(new THREE.BoxGeometry(2.2, 0.06, 0.9), steel(0xf2a81e, 0.5), rk, 0, y, 0);
    for (const sx of [-1.07, 1.07]) mk(new THREE.BoxGeometry(0.08, 2.6, 0.9), steel(0x2f6fd6, 0.5), rk, sx, 1.3, 0);
    for (let k = 0; k < 9; k++) mk(new RoundedBoxGeometry(0.6, 0.35, 0.6, 2, 0.04), mat([col, 0x58b368, 0xffc21a][k % 3], 0.6), rk, -0.7 + (k % 3) * 0.7, 0.6 + Math.floor(k / 3) * 0.9, 0);
  }
  const press = new THREE.Group(); hall.add(press); press.position.set(D.press, 0, -7.5);
  mk(new THREE.BoxGeometry(2.4, 0.9, 1.6), steel(0x2f6fd6, 0.45), press, 0, 0.45, 0); for (const x of [-1.0, 1.0]) mk(new THREE.BoxGeometry(0.35, 3.6, 0.35), steel(0x2f6fd6, 0.45), press, x, 2.1, 0); mk(new THREE.BoxGeometry(2.6, 0.7, 1.4), steel(0x2f6fd6, 0.45), press, 0, 3.9, 0);
  const ram = new THREE.Group(); press.add(ram); mk(new THREE.BoxGeometry(1.7, 0.5, 1.2), steel(0x8d969f, 0.4), ram, 0, 0, 0); ram.position.y = 2.9;
  mk(new THREE.BoxGeometry(1.7, 0.08, 1.2), mat(0xf2c418, 0.5), press, 0, 0.94, 0);
  const pressSign = sign(press, 'EXACTLY ALIKE', 1.8, 0.35, { bg: '#2f6fd6', fg: '#fff' }); pressSign.position.set(0, 4.45, 0.71);

  // ---- the e-coat dip tank: a pit in front of the line, cut open by the face (the bath is seen in section)
  const T = D.tank, tank = new THREE.Group(); root.add(tank);
  const pitM = mat(0x6b7078, 0.9);
  const pitBack = mk(new THREE.PlaneGeometry(T.x1 - T.x0, -T.y0), pitM, tank, (T.x0 + T.x1) / 2, T.y0 / 2, T.z0);
  for (const x of [T.x0, T.x1]) { const p = mk(new THREE.PlaneGeometry(-T.z0, -T.y0), pitM, tank, x, T.y0 / 2, T.z0 / 2); p.rotation.y = x === T.x0 ? PI / 2 : -PI / 2; }
  const pitFloor = mk(new THREE.PlaneGeometry(T.x1 - T.x0, -T.z0), pitM, tank, (T.x0 + T.x1) / 2, T.y0, T.z0 / 2); pitFloor.rotation.x = -PI / 2;
  { const hz = tex(256, 32, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#111' : '#ffd23f'; g.beginPath(); g.moveTo(i * 16, h); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 32, 0); g.lineTo(i * 16 + 16, h); g.fill(); } }); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(4, 1);
    mk(new THREE.PlaneGeometry(T.x1 - T.x0, 0.22), new THREE.MeshStandardMaterial({ map: hz, roughness: 0.6 }), tank, (T.x0 + T.x1) / 2, -0.13, T.z0 + 0.01); }   // a hazard rim along the pit's back wall
  const bathM = new THREE.MeshStandardMaterial({ color: 0x2f8fe0, emissive: 0x1f5fa0, emissiveIntensity: 0.35, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.FrontSide });
  const bath = mk(new THREE.BoxGeometry(T.x1 - T.x0 - 0.04, 1, -T.z0 - 0.08), bathM, tank, (T.x0 + T.x1) / 2, 0, T.z0 / 2 - 0.04); bath.castShadow = false; bath.renderOrder = 3;   // 4 cm behind the cut face (it z-fought the face)
  const setBath = (level) => { const hh = Math.max(0.001, level - T.y0); bath.scale.y = hh; bath.position.y = T.y0 + hh / 2; bath.visible = level > T.y0 + 0.01; };
  setBath(T.y0);
  const tankRail = new THREE.Group(); tank.add(tankRail);
  for (const x of [T.x0 - 0.12, T.x1 + 0.12]) { mk(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), mat(0xf2c418, 0.5), tankRail, x, 0.5, T.z0 - 0.1); mk(new THREE.CylinderGeometry(0.035, 0.035, -T.z0 + 0.2, 8), mat(0xf2c418, 0.5), tankRail, x, 1.0, T.z0 / 2).rotation.x = PI / 2; }
  mk(new THREE.CylinderGeometry(0.035, 0.035, T.x1 - T.x0 + 0.24, 8), mat(0xf2c418, 0.5), tankRail, (T.x0 + T.x1) / 2, 1.0, T.z0 - 0.1).rotation.z = PI / 2;
  // the hoist gantry over the tank: a bridge on two legs, a trolley that runs in z, a hook block + a C-hanger (set from the shots)
  const hoist = new THREE.Group(); root.add(hoist); hoist.position.set((T.x0 + T.x1) / 2, 0, 0);
  for (const x of [-2.7, 2.7]) mk(new THREE.BoxGeometry(0.22, 5.2, 0.22), steel(0xf2a81e, 0.5), hoist, x, 2.6, -4.8);
  mk(new THREE.BoxGeometry(5.7, 0.4, 0.4), steel(0xf2a81e, 0.5), hoist, 0, 5.3, -4.8);
  const beam = new THREE.Group(); hoist.add(beam); mk(new THREE.BoxGeometry(0.4, 0.35, 4.6), steel(0xf2a81e, 0.5), beam, 0, 5.1, -2.6);
  const trolley = new THREE.Group(); hoist.add(trolley); mk(new THREE.BoxGeometry(0.7, 0.4, 0.6), mat(0x3a3e44, 0.5), trolley, 0, 4.75, 0);
  const cable = mk(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), mat(0x222222, 0.5), trolley, 0, 0, 0);
  const hanger = new THREE.Group(); trolley.add(hanger);
  for (const x of [-1.25, 1.25]) { mk(new THREE.BoxGeometry(0.08, 1.35, 0.08), steel(0x3a3e44), hanger, x, 0.62, 0); mk(new THREE.BoxGeometry(0.08, 0.08, 1.7), steel(0x3a3e44), hanger, x, -0.05, 0); }
  mk(new THREE.BoxGeometry(2.6, 0.1, 0.1), steel(0x3a3e44), hanger, 0, 1.3, 0);
  const setHoist = (z, carY) => { trolley.position.z = z; hanger.position.y = carY; cable.scale.y = Math.max(0.01, 4.6 - carY - 1.3); cable.position.y = carY + 1.3 + cable.scale.y / 2; };   // carY = the hung car's floor height
  setHoist(L.z, 2.0);

  // ---- the leak in the roof over the tank (drips set from the shots)
  const crack = mk(new THREE.BoxGeometry(0.9, 0.05, 0.12), mat(0x1d1d1d, 1), root, (D.tank.x0 + D.tank.x1) / 2 - 0.6, H.h - 0.01, -2.4); crack.rotation.y = 0.4; crack.visible = false;

  // ---- loading dock (back wall roll-up door) + the QC gate + crash lane + crash wall + shipping door + the roof test track
  const dock = new THREE.Group(); root.add(dock); dock.position.set((D.dock.x0 + D.dock.x1) / 2, 0, H.back + 0.06);
  const dockDoor = mk(new THREE.PlaneGeometry(D.dock.x1 - D.dock.x0, 3.6), new THREE.MeshStandardMaterial({ map: rollT.clone(), roughness: 0.6, color: 0xcfd6db }), dock, 0, 1.8, 0.01);
  { const bayT = tex(256, 220, (g, w, h) => { g.fillStyle = '#56616c'; g.fillRect(0, 0, w, h); g.fillStyle = '#3d4650'; g.fillRect(18, 30, w - 36, h - 30); g.fillStyle = '#e8eef2'; g.fillRect(18, 22, w - 36, 6); const R3 = rng(9); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) if (R3() > 0.2) { g.fillStyle = R3() > 0.5 ? '#c9a06b' : '#b58b55'; g.fillRect(26 + c * 34, h - 34 - r * 30, 30, 27); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(26 + c * 34, h - 34 - r * 30 + 12, 30, 3); } });   // a lit trailer full of boxes (pure black read as a hole)
    mk(new THREE.PlaneGeometry(D.dock.x1 - D.dock.x0, 3.6), new THREE.MeshStandardMaterial({ map: bayT, roughness: 0.9, emissive: 0xffffff, emissiveMap: bayT, emissiveIntensity: 0.25 }), dock, 0, 1.8, 0.0); }
  const dockSign = sign(dock, 'DOCK 1', 1.4, 0.4, { bg: '#ffd23f', fg: '#222' }); dockSign.position.set(0, 3.95, 0.02);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.6), new THREE.MeshStandardMaterial({ map: tex(32, 256, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#111' : '#ffd23f'; g.fillRect(0, i * 16, 32, 16); } }) })); st.position.set(s * ((D.dock.x1 - D.dock.x0) / 2 + 0.12), 1.8, 0.01); dock.add(st); }
  const setDock = (k) => { dockDoor.scale.y = Math.max(0.02, 1 - k); dockDoor.position.y = 3.6 - (3.6 * dockDoor.scale.y) / 2; };
  // QC gate: an arch of light tubes the cars roll through
  const qcGate = new THREE.Group(); root.add(qcGate); qcGate.position.set(D.qc.x, 0, L.z);
  const tubeM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.6 });
  for (const z of [-1.2, 1.2]) mk(new THREE.BoxGeometry(0.12, 2.6, 0.12), steel(0x3a3e44), qcGate, 0, 1.3, z);
  mk(new THREE.BoxGeometry(0.12, 0.12, 2.5), steel(0x3a3e44), qcGate, 0, 2.6, 0); for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.05, 0.05, 2.2), tubeM, qcGate, 0.08, 2.48 - i * 0.12, 0);
  { // a portal that faces the lens (the gate alone read edge-on as one black pole): green-lit posts + a header across x
    const gM = new THREE.MeshStandardMaterial({ color: 0x7cf05f, emissive: 0x4fd040, emissiveIntensity: 1.2 });
    for (const x of [-1.9, 1.9]) { mk(new THREE.BoxGeometry(0.16, 2.7, 0.16), steel(0x3a3e44), qcGate, x, 1.35, -1.25); mk(new THREE.BoxGeometry(0.05, 2.5, 0.03), gM, qcGate, x, 1.3, -1.155); }   // behind the car: nobody walks into it
    mk(new THREE.BoxGeometry(3.96, 0.22, 0.2), steel(0x3a3e44), qcGate, 0, 2.75, -1.25); mk(new THREE.BoxGeometry(3.6, 0.04, 0.03), gM, qcGate, 0, 2.66, -1.14);
    const qs = sign(qcGate, 'QC', 0.7, 0.3, { bg: '#1f6f3a', fg: '#fff' }); qs.position.set(0, 3.03, -1.14); }
  const crash = new THREE.Group(); root.add(crash);
  const C = D.crash;
  const laneT = tex(512, 64, (g, w, h) => { g.fillStyle = '#3d4248'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c418'; g.fillRect(0, 4, w, 5); g.fillRect(0, h - 9, w, 5); g.fillStyle = '#ddd'; for (let x = 0; x < w; x += 48) g.fillRect(x, h / 2 - 2, 26, 4); });
  const lane = mk(new THREE.PlaneGeometry(C.wall - C.x0, 2.2), new THREE.MeshStandardMaterial({ map: laneT, roughness: 0.6 }), crash, (C.x0 + C.wall) / 2, 0.014, C.z); lane.rotation.x = -PI / 2;
  const wallTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#bdb8ae'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; for (let y = 0; y < h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#111' : '#ffd23f'; g.fillRect(i * 32, h - 36, 32, 36); } });
  const crashWall = mk(new THREE.BoxGeometry(1.2, 2.3, 1.8), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }), crash, C.wall + 0.6, 1.15, -0.9);   // z −1.8…0: the line cars (and Gary's walk at z −2.15) pass behind it
  const target = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshStandardMaterial({ map: tex(128, 128, (g, w) => { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#111' : '#ffd23f'; g.beginPath(); g.moveTo(w / 2, w / 2); g.arc(w / 2, w / 2, w / 2, (k * PI) / 2, ((k + 1) * PI) / 2); g.fill(); } }) }));
  target.position.set(C.wall - 0.005, 1.25, C.z); target.rotation.y = -PI / 2; crash.add(target);
  const crashSign = sign(crash, 'CRASH TEST', 1.2, 0.36, { bg: '#111', fg: '#ffd23f' }); crashSign.position.set(C.wall + 0.6, 1.9, 0.012);
  const mphSign = sign(crash, '35 MPH', 0.9, 0.4, { bg: '#fff', fg: '#111', border: '#d12f3a' }); mphSign.position.set(C.x0 + 1.2, 2.2, -3.6);
  for (const x of [C.x0 + 1.0, C.x0 + 1.4]) mk(new THREE.BoxGeometry(0.05, 2.0, 0.05), mat(0x444444), crash, x, 1.0, -3.62);
  const camStands = [[C.x0 + 3.4, C.z - 2.1], [C.x0 + 5.6, C.z - 2.3]].map(([x, z]) => { const s = new THREE.Group(); crash.add(s); s.position.set(x, 0, z); for (let i = 0; i < 3; i++) mk(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), mat(0x222222), s, Math.cos(i * 2.1) * 0.25, 0.7, Math.sin(i * 2.1) * 0.25).rotation.set(Math.sin(i * 2.1) * 0.3, 0, -Math.cos(i * 2.1) * 0.3); mk(new RoundedBoxGeometry(0.4, 0.3, 0.5, 2, 0.05), mat(0x222222, 0.5), s, 0, 1.55, 0); const l = mk(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 14), mat(0x111111, 0.3), s, 0, 1.55, 0.3); l.rotation.x = PI / 2; return s; });
  const roofTrack = new THREE.Group(); root.add(roofTrack); roofTrack.visible = false;
  { const ring = new THREE.Shape(); const rr = (x0, z0, x1, z1, r) => { const s = new THREE.Path(); s.moveTo(x0 + r, z0); s.lineTo(x1 - r, z0); s.absarc(x1 - r, z0 + r, r, -PI / 2, 0); s.lineTo(x1, z1 - r); s.absarc(x1 - r, z1 - r, r, 0, PI / 2); s.lineTo(x0 + r, z1); s.absarc(x0 + r, z1 - r, r, PI / 2, PI); s.lineTo(x0, z0 + r); s.absarc(x0 + r, z0 + r, r, PI, 1.5 * PI); return s; };
    const o = rr(D.roof.track[0], -9.0, D.roof.track[1], -0.6, 3.6), inn = rr(D.roof.track[0] + 3.0, -6.6, D.roof.track[1] - 3.0, -3.0, 1.6); ring.curves = o.curves; ring.holes.push(inn); ring.currentPoint = o.currentPoint;
    const geo = new THREE.ShapeGeometry(ring, 24); geo.rotateX(PI / 2); const m = mk(geo, new THREE.MeshStandardMaterial({ color: 0x3d4248, roughness: 0.7, side: THREE.DoubleSide }), roofTrack, 0, D.roof.top + 0.01, 0); m.scale.z = 1;
    for (let x = D.roof.track[0] + 4; x < D.roof.track[1] - 4; x += 1.2) mk(new THREE.PlaneGeometry(0.6, 0.12), mat(0xffffff), roofTrack, x, D.roof.top + 0.02, -0.6 - 1.2).rotation.x = -PI / 2;
    // the front straight's guard rail + a TEST TRACK sign standing on the roof edge (it reads from below, over the edge)
    for (let x = D.roof.track[0] + 3.6; x < D.roof.track[1] - 3.6; x += 2.0) mk(new THREE.BoxGeometry(0.08, 0.5, 0.08), mat(0xd12f3a, 0.5), roofTrack, x, D.roof.top + 0.25, -0.45);
    mk(new THREE.BoxGeometry(D.roof.track[1] - D.roof.track[0] - 7.2, 0.12, 0.06), mat(0xffffff, 0.5), roofTrack, (D.roof.track[0] + D.roof.track[1]) / 2, D.roof.top + 0.42, -0.45);
    const ts = sign(roofTrack, 'TEST TRACK', 3.2, 0.8, { bg: '#111', fg: '#ffd23f', border: '#ffd23f' }); ts.position.set(D.roof.track[1] - 6.5, D.roof.top + 1.25, -0.3);
    for (const x of [D.roof.track[1] - 8.0, D.roof.track[1] - 5.0]) mk(new THREE.BoxGeometry(0.1, 1.3, 0.1), mat(0x333333), roofTrack, x, D.roof.top + 0.65, -0.32); }
  // outside dressing: neighbour houses behind the garage + shop, trees, a parking lot right of the hall
  const houseCols = ['#f2d49b', '#a9cbe0', '#e8a7a0', '#c6dcb0'];
  [[-12.0, -10.5], [-4.0, -10.0], [-20.5, -10.5], [54.0, -11.0]].forEach(([x, z], i) => { const h = new THREE.Group(); root.add(h); h.position.set(x, 0, z); mk(new THREE.BoxGeometry(6.0, 4.6, 5), mat(new THREE.Color(houseCols[i]).getHex(), 0.9), h, 0, 2.3, 0); const rf = mk(new THREE.ConeGeometry(4.6, 2.0, 4), mat(0xb5523b, 0.8), h, 0, 5.6, 0); rf.rotation.y = PI / 4; rf.scale.set(1, 1, 0.8); for (const wx of [-1.6, 1.6]) mk(new THREE.PlaneGeometry(1.0, 1.0), mat(0x9fd1ef, 0.2), h, wx, 3.2, 2.51); });
  for (const [x, z, s] of [[-18.5, -2.2, 1.0], [-8.2, -7.0, 0.9], [59.5, -2.5, 1.1], [62.5, -6.5, 1.0], [-25.5, -4.5, 1.1], [49.3, -7.5, 0.8]]) { const tr = makeTree(Math.round(x * 3 + 90), s); tr.position.set(x, 0, z); root.add(tr); }
  const lotT = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a4d52'; g.fillRect(0, 0, w, h); g.fillStyle = '#eee'; for (let x = 0; x < w; x += 42) g.fillRect(x, 0, 4, h * 0.42); });
  lotT.wrapS = lotT.wrapT = THREE.RepeatWrapping; lotT.repeat.set(3, 1);
  const lot = mk(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ map: lotT, roughness: 0.85 }), root, 43.5, 0.008, -5.0); lot.rotation.x = -PI / 2;


  // ---- your house (left of the garage): a cutaway kitchen-den behind a section wall
  const house = new THREE.Group(); root.add(house);
  { const X0 = D.house.x0, X1 = D.house.x1, hb = -6.0, hh = 2.9, wallM = mat(0xf3e3c3, 0.9);
    mk(new THREE.PlaneGeometry(X1 - X0, -hb), new THREE.MeshStandardMaterial({ map: (() => { const t = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b8875a' : '#c6966a'; g.fillRect(0, i * 32, w, 31); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; })(), roughness: 0.7 }), house, (X0 + X1) / 2, 0.004, hb / 2).rotation.x = -PI / 2;
    mk(new THREE.PlaneGeometry(X1 - X0, hh), new THREE.MeshStandardMaterial({ map: tex(512, 256, (g, w, h) => { g.fillStyle = '#f3e3c3'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6cfa3'; for (let x = 0; x < w; x += 20) g.fillRect(x, 0, 8, h); g.fillStyle = '#9fd1ef'; g.fillRect(w * 0.12, h * 0.25, w * 0.22, h * 0.35); g.fillRect(w * 0.62, h * 0.25, w * 0.22, h * 0.35); g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(w * 0.12, h * 0.25, w * 0.22, h * 0.35); g.strokeRect(w * 0.62, h * 0.25, w * 0.22, h * 0.35); }), roughness: 0.9 }), house, (X0 + X1) / 2, hh / 2, hb);
    mk(new THREE.BoxGeometry(0.22, hh, -hb), [wallM, wallM, wallM, wallM, SECTION, wallM], house, X0 - 0.11, hh / 2, hb / 2);
    mk(new THREE.BoxGeometry(0.22, hh, -hb), [wallM, wallM, wallM, wallM, SECTION, wallM], house, X1 + 0.11, hh / 2, hb / 2);
    mk(new THREE.BoxGeometry(X1 - X0 + 0.44, 0.28, -hb + 0.1), [mat(0xb5523b), mat(0xb5523b), mat(0xb5523b), mat(0xf6efe3), SECTION, mat(0xb5523b)], house, (X0 + X1) / 2, hh + 0.14, hb / 2 + 0.05);
    const up = mk(new THREE.BoxGeometry(X1 - X0 + 0.2, 2.2, -hb), mat(0xf2d49b, 0.9), house, (X0 + X1) / 2, hh + 1.38, hb / 2); up.material = [mat(0xf2d49b), mat(0xf2d49b), mat(0xb5523b), mat(0xf2d49b), SECTION, mat(0xf2d49b)];
    const sofa = new THREE.Group(); house.add(sofa); sofa.position.set(-12.4, 0, -4.9); mk(new RoundedBoxGeometry(2.4, 0.45, 0.9, 3, 0.12), mat(0x5b7fc2, 0.8), sofa, 0, 0.32, 0); mk(new RoundedBoxGeometry(2.4, 0.7, 0.25, 3, 0.1), mat(0x5b7fc2, 0.8), sofa, 0, 0.75, -0.35);
    mk(new RoundedBoxGeometry(1.2, 0.08, 0.6, 2, 0.03), mat(0x8a5a32, 0.6), house, -12.4, 0.45, -3.4); mk(new RoundedBoxGeometry(1.0, 0.7, 0.08, 2, 0.03), mat(0x1d1d1d, 0.4), house, -9.3, 1.3, -5.9);
    const lamp = mk(new THREE.CylinderGeometry(0.2, 0.28, 0.35, 16, 1, true), mat(0xfff2c8, 0.7, { emissive: 0xfff0c0, emissiveIntensity: 0.5 }), house, -14.8, 1.55, -4.8); lamp.material.side = THREE.DoubleSide; mk(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), mat(0x333333), house, -14.8, 0.7, -4.8);
    for (let i = 0; i < 3; i++) mk(new THREE.PlaneGeometry(0.5, 0.4), mat([0xd12f3a, 0x58b368, 0x2f6fd6][i], 0.7), house, -13.6 + i * 0.7, 2.0, hb + 0.02); }

  // ---- the conveyor's first stretch runs inside the garage (the line starts where the junk car was built)
  const garageLine = mk(new THREE.BoxGeometry(L.x0 - 0.4 - H.x0 < 0 ? H.x0 - L.x0 + 0.4 : 0.1, 0.08, 1.9), [mat(0x3a3f45), mat(0x3a3f45), convM, mat(0x3a3f45), mat(0x3a3f45), mat(0x3a3f45)], garage, (L.x0 - 0.4 + H.x0) / 2, 0.04, L.z);
  garageLine.visible = false;

  // ---- the paint booth (back wall): a glass box with coloured mist, pops in on "paint shop"
  const booth = new THREE.Group(); root.add(booth); booth.position.set((D.booth.x0 + D.booth.x1) / 2, 0, -7.6);
  { const BW = D.booth.x1 - D.booth.x0, glassB = new THREE.MeshStandardMaterial({ color: 0xcfefff, roughness: 0.05, transparent: true, opacity: 0.28, depthWrite: false });
    mk(new THREE.BoxGeometry(BW, 0.25, 3.2), steel(0x3a3e44), booth, 0, 3.3, 0); mk(new THREE.BoxGeometry(BW, 3.1, 0.02), glassB, booth, 0, 1.6, 1.6).castShadow = false;
    for (const x of [-BW / 2, BW / 2]) mk(new THREE.BoxGeometry(0.12, 3.3, 0.12), steel(0x3a3e44), booth, x, 1.65, 1.6);
    const bs = sign(booth, 'PAINT SHOP', 2.4, 0.5, { bg: '#ff8a3d', fg: '#fff' }); bs.position.set(0, 3.75, 1.62);
    const pc = makeKitCar(0xff4d8d); pc.set({ stage: 4 }); booth.add(pc.g); pc.g.position.set(0, 0, 0); booth.userData.car = pc;
    const arm = makeRobotArm(0xff8a3d); booth.add(arm.g); arm.g.position.set(-1.2, 0, -1.2); arm.pose(0.6, 0.5, 1.3, 0.9); booth.userData.arm = arm; }
  const boothMist = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: [0xff4d8d, 0x3ec7ff, 0xffd23f][i % 3], transparent: true, opacity: 0.25, depthWrite: false })); booth.add(m); boothMist.push(m); }

  // ---- the CEO's corner office: a glass box on a mezzanine at the hall's far end + the stairs up to it
  const O = D.office, office = new THREE.Group(); root.add(office);
  const OW = O.x1 - O.x0, OD = O.z0 - O.z1, ocx = (O.x0 + O.x1) / 2, ocz = (O.z0 + O.z1) / 2;
  mk(new THREE.BoxGeometry(OW, 0.25, OD), [mat(0x5d656e), mat(0x5d656e), mat(0x8a2531, 0.95), mat(0x5d656e), SECTION, mat(0x5d656e)], office, ocx, O.y - 0.125, ocz);
  for (const x of [O.x0 + 0.15]) for (const z of [O.z0 - 0.15, O.z1 + 0.15]) mk(new THREE.BoxGeometry(0.22, O.y, 0.22), colM, office, x, O.y / 2, z);
  const oGlass = new THREE.MeshStandardMaterial({ color: 0xd8f2ff, roughness: 0.04, transparent: true, opacity: 0.08, depthWrite: false });
  mk(new THREE.BoxGeometry(OW, 2.6, 0.03), oGlass, office, ocx, O.y + 1.3, O.z0).castShadow = false;
  mk(new THREE.BoxGeometry(0.03, 2.6, OD), oGlass, office, O.x0, O.y + 1.3, ocz).castShadow = false;
  for (const x of [O.x0, O.x1 - 0.05]) mk(new THREE.BoxGeometry(0.08, 2.6, 0.08), steel(0x2b2e33), office, x, O.y + 1.3, O.z0);
  mk(new THREE.BoxGeometry(OW, 0.1, 0.1), steel(0x2b2e33), office, ocx, O.y + 2.6, O.z0);
  mk(new THREE.PlaneGeometry(OW, 3.2), new THREE.MeshStandardMaterial({ map: officeWallTex(), roughness: 0.8 }), office, ocx, O.y + 1.6, O.z1 + 0.02);
  const oDesk = new THREE.Group(); office.add(oDesk); oDesk.position.set(ocx + 0.3, O.y, ocz - 0.6);
  mk(new RoundedBoxGeometry(2.0, 0.08, 0.9, 2, 0.03), mat(0x5a3a22, 0.4), oDesk, 0, 0.72, 0); mk(new RoundedBoxGeometry(1.9, 0.66, 0.06, 2, 0.02), mat(0x4a2e1a, 0.5), oDesk, 0, 0.37, 0.4);
  const plate = sign(oDesk, 'CEO', 0.6, 0.18, { bg: '#d9b44a', fg: '#2a1d0a' }); plate.position.set(-0.5, 0.86, 0.36); plate.rotation.x = -0.3;
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshStandardMaterial({ map: tex(200, 240, (g, w, h) => { g.fillStyle = '#d9b44a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8dcc0'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#2b2e33'; g.beginPath(); g.ellipse(w / 2, h * 0.66, 62, 22, 0, 0, 7); g.fill(); g.fillStyle = '#8ef0ff'; g.beginPath(); g.ellipse(w / 2 - 22, h * 0.62, 6, 4, 0, 0, 7); g.ellipse(w / 2 + 22, h * 0.62, 6, 4, 0, 0, 7); g.fill(); g.fillStyle = '#141414'; g.fillRect(w / 2 - 22, h * 0.3, 44, 54); g.fillRect(w / 2 - 34, h * 0.3 + 50, 68, 6); }), roughness: 0.6 }));
  portrait.position.set(ocx - 1.2, O.y + 1.9, O.z1 + 0.04); office.add(portrait);
  const framedBill = new THREE.Group(); office.add(framedBill); framedBill.position.set(ocx + 1.0, O.y + 1.9, O.z1 + 0.04);
  mk(new THREE.BoxGeometry(0.5, 0.9, 0.04), mat(0xd9b44a, 0.4), framedBill); framedBill.add(makeInvoice('$900')); framedBill.children[1].position.z = 0.03; framedBill.children[1].scale.setScalar(1.1);
  const osign = sign(office, 'CORNER OFFICE', 2.2, 0.42, { bg: '#2b3a4a', fg: '#d9b44a', border: '#d9b44a' }); osign.position.set(ocx, O.y + 2.95, O.z0 + 0.02);
  { const p = new THREE.Group(); office.add(p); p.position.set(O.x1 - 0.5, O.y, O.z1 + 0.5); mk(new THREE.CylinderGeometry(0.22, 0.18, 0.4, 14), mat(0xb5523b, 0.7), p, 0, 0.2, 0); for (let i = 0; i < 5; i++) mk(new THREE.IcosahedronGeometry(0.26, 1), mat(0x4f8a33, 0.9), p, Math.sin(i * 2.4) * 0.15, 0.6 + i * 0.12, Math.cos(i * 2.4) * 0.15); }
  const stairs = new THREE.Group(); root.add(stairs);
  { const n = 12, sx0 = O.x0 - 2.6, zz = -5.3; for (let i = 0; i < n; i++) mk(new THREE.BoxGeometry(0.26, 0.06, 1.0), steel(0x8d969f), stairs, sx0 + (i + 0.5) * 0.22, (i + 1) * (O.y / n), zz);
    for (const z of [zz - 0.5, zz + 0.5]) { const r = mk(new THREE.BoxGeometry(2.9, 0.05, 0.05), mat(0xf2c418, 0.5), stairs, sx0 + 1.32, O.y / 2 + 0.95, z); r.rotation.z = Math.atan2(O.y, n * 0.22); } }
  // the far suburb: rows of houses + trees + a hazy skyline (wide shots look past the roofs)
  const suburb = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) { const x = -30 + i * 6.8 + (r % 2) * 3.4, z = -22 - r * 13; const hgt = 3.6 + ((i * 7 + r) % 3) * 0.7; const h = new THREE.Group(); root.add(h); h.position.set(x, 0, z); suburb.push(h);
    mk(new THREE.BoxGeometry(5.0, hgt, 4.5), mat(new THREE.Color(houseCols2[(i + r) % houseCols2.length]).getHex(), 0.9), h, 0, hgt / 2, 0); const rf = mk(new THREE.ConeGeometry(3.8, 1.8, 4), mat(0xb5523b, 0.8), h, 0, hgt + 0.9, 0); rf.rotation.y = PI / 4; rf.scale.set(1, 1, 0.85);
    if ((i + r) % 2 === 0) { const tr = makeTree(i * 13 + r * 7 + 3, 0.95 + 0.1 * (i % 3)); tr.position.set(x + 3.4, 0, z + 1.5); root.add(tr); suburb.push(tr); } }
  { const winT = tex(64, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(30,50,80,.45)'; for (let y = 6; y < h; y += 12) for (let x = 5; x < w; x += 14) g.fillRect(x, y, 8, 7); }); winT.wrapS = winT.wrapT = THREE.RepeatWrapping;
    const tc = [0x8fb3d6, 0x7aa0c8, 0xa9c4de, 0x6f92b8, 0x9ab8d4];   // windowed towers in varied blues (flat pale boxes left the top of the end wide empty)
    for (let i = 0; i < 18; i++) { const hh2 = 20 + ((i * 37) % 32), wt = winT.clone(); wt.needsUpdate = true; wt.repeat.set(3, hh2 / 9); mk(new THREE.BoxGeometry(12 + (i % 4) * 3, hh2, 10), new THREE.MeshStandardMaterial({ color: tc[i % tc.length], map: wt, roughness: 0.8 }), root, -60 + i * 9.5, hh2 / 2, -150 - (i % 3) * 20).castShadow = false; } }


  // ---- the start lever (Gary starts the line), the press's two-hand control pedestal, the meatloaf vending machine
  const lever = new THREE.Group(); root.add(lever); lever.position.set(-2.25, 0, -1.85);
  mk(new RoundedBoxGeometry(0.34, 0.9, 0.3, 2, 0.04), mat(0xf2c418, 0.5), lever, 0, 0.45, 0); const lvArm = new THREE.Group(); lever.add(lvArm); lvArm.position.set(0, 0.85, 0.05);
  mk(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), steel(0x9aa3ad), lvArm, 0, 0.3, 0); mk(new THREE.SphereGeometry(0.07, 12, 10), mat(0xd12f3a, 0.4), lvArm, 0, 0.62, 0);
  const pedal = new THREE.Group(); root.add(pedal); pedal.position.set(D.press - 1.1, 0, -1.65);
  mk(new THREE.CylinderGeometry(0.06, 0.08, 0.66, 10), steel(0x3a3e44), pedal, 0, 0.33, 0); mk(new RoundedBoxGeometry(0.62, 0.14, 0.3, 2, 0.04), mat(0xf2c418, 0.5), pedal, 0, 0.7, 0);   // waist height (it hid Gary's face)
  const pButtons = [-0.18, 0.18].map((x) => mk(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 16), mat(0xd12f3a, 0.35), pedal, x, 0.8, 0));
  const vend = new THREE.Group(); root.add(vend); vend.position.set(D.vend[0], 0, D.vend[1] - 0.45);
  let vendLabel; { const vT = tex(256, 128, (g, w, h) => { g.fillStyle = '#7a3b1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f'; g.font = font(54); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MEATLOAF', w / 2, h / 2 + 4); });
    mk(new RoundedBoxGeometry(1.0, 1.95, 0.8, 3, 0.06), mat(0xd12f3a, 0.45), vend, 0, 0.98, 0);
    vendLabel = mk(new THREE.PlaneGeometry(0.9, 0.36), new THREE.MeshStandardMaterial({ map: vT, roughness: 0.5 }), vend, 0, 1.74, 0.41);   // blank red until "meatloaf"
    mk(new THREE.PlaneGeometry(0.66, 1.0), mat(0x2a1a14, 0.9), vend, -0.1, 1.05, 0.405);   // the dark recess (the loaves sat inside the cabinet)
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) mk(new RoundedBoxGeometry(0.15, 0.08, 0.1, 2, 0.03), mat(0x8a4a24, 0.8), vend, -0.3 + c * 0.2, 0.7 + r * 0.22, 0.44);
    for (let r = 0; r < 4; r++) mk(new THREE.BoxGeometry(0.62, 0.015, 0.06), steel(0x9aa1a8), vend, -0.1, 0.65 + r * 0.22, 0.43);
    mk(new THREE.PlaneGeometry(0.66, 1.0), new THREE.MeshStandardMaterial({ color: 0xcfefff, roughness: 0.05, transparent: true, opacity: 0.25 }), vend, -0.1, 1.05, 0.47);
    mk(new THREE.BoxGeometry(0.12, 0.2, 0.03), mat(0x3a3e44, 0.4), vend, 0.36, 1.2, 0.41); mk(new THREE.BoxGeometry(0.02, 0.07, 0.01), mat(0x111111), vend, 0.36, 1.24, 0.43);   // the coin slot
    mk(new THREE.BoxGeometry(0.5, 0.14, 0.05), mat(0x111111, 0.6), vend, -0.1, 0.3, 0.405); }
  // ---- a parking lot the size of a town: the suburb behind the factory pops out row by row, parked cars pop in
  const lotM = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 }), NLOT = 520;
  const lotCars = new THREE.InstancedMesh(new RoundedBoxGeometry(1.6, 0.9, 3.0, 2, 0.25), lotM, NLOT); lotCars.castShadow = false; lotCars.frustumCulled = false; root.add(lotCars);
  const lotSpots = []; { const RL = rng(33), cols = [0xd94b3d, 0x2f6fd6, 0xf2c14e, 0x58b368, 0xb36bff, 0xff8a3d, 0xe8e8ec, 0x2f2f33]; let i = 0;
    for (let row = 0; row < 13 && i < NLOT; row++) for (let c = 0; c < 40 && i < NLOT; c++, i++) { lotSpots.push([-28 + c * 2.3 + (row % 2) * 0.4, -14 - row * 3.6]); lotCars.setColorAt(i, new THREE.Color(cols[Math.floor(RL() * cols.length)])); } }
  const lotPave = mk(new THREE.PlaneGeometry(100, 48), new THREE.MeshStandardMaterial({ map: (() => { const t2 = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a4d52'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8e8e8'; for (let y = 0; y < h; y += 37) g.fillRect(0, y, w, 3); for (let x = 0; x < w; x += 12) g.fillRect(x, 0, 2, h); }); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(8, 4); return t2; })(), roughness: 0.9 }), root, 18, 0.012, -36); lotPave.rotation.x = -PI / 2; lotPave.castShadow = false;
  function setLot(k) {
    lotPave.visible = k > 0.001; lotPave.scale.set(1, Math.max(0.001, clamp(k * 1.5)), 1); lotPave.position.z = -12 - 24 * clamp(k * 1.5);
    suburb.forEach((h) => { const u = clamp((k * 1.4 - (-14 - h.position.z) / 50) / 0.25); h.visible = u < 1; h.scale.setScalar(Math.max(0.001, 1 - u * u)); });
    const m4 = new THREE.Matrix4();
    lotSpots.forEach(([x, z], i) => { const u = clamp((k * 1.4 - (-14 - z) / 50 - 0.08) / 0.2), e = u > 0 ? Math.max(0.001, easeOutBack(u, 2.2)) : 0.001; m4.makeScale(e, e, e); m4.setPosition(x, 0.45 * e, z); lotCars.setMatrixAt(i, m4); });
    lotCars.visible = k > 0.001; lotCars.instanceMatrix.needsUpdate = true;
  }
  setLot(0);

  // ---- growth: the hall pops up bay by bay over the yard (k 0..1), the slab section + floor wipe in along x
  function setHall(k) {
    const xEdge = lerp(H.x0, H.x1 + 0.5, clamp(k * 1.15)); hallEdge = xEdge; hallK = k; if (typeof applyHoles === 'function') applyHoles();
    floorClip.constant = xEdge; slabClip.constant = xEdge;   // plane (−1,0,0)·p + c ≥ 0  ⇔  x ≤ c
    hallFloor.mesh.visible = k > 0.001; conveyor.visible = k > 0.001; slabMP.mesh.visible = k > 0.001;
    bays.forEach((b, i) => { const u = clamp((k - i / nB * 0.8) / 0.25), e = easeOutBack(u, 1.6); b.wall.visible = b.roof.visible = u > 0.001;
      b.wall.scale.set(1, Math.max(0.001, e), 1); b.roof.position.y = drop(u * 0.45, 0, 7, 0.45) * (u < 1 ? 1 : 0); });
    endWall.visible = k > 0.95; endWall.scale.y = Math.max(0.001, easeOutBack(clamp((k - 0.95) / 0.05), 1.6));
    yardItems.forEach((o, i) => { const u = clamp((k - (o.position.x - H.x0) / (H.x1 - H.x0) * 0.8 + 0.05) / 0.12); o.visible = u < 1; o.scale.setScalar(Math.max(0.001, 1 - u * u)); });
    yard.children.forEach((o) => { if (yardItems.includes(o)) return; o.visible = k < 0.05 || o.position.x > xEdge + 1; });
    const show = (o, x) => (o.visible = k > 0.02 && x < xEdge);
    show(banner, 3.5); show(daysSign, 0.6); show(daysSign2, 43.5); show(safety, 24);   show(clock, 16); show(racks, 1); show(press, D.press - 1.2); show(dock, D.dock.x0); show(qcGate, D.qc.x); show(crash, D.crash.x0); show(booth, D.booth.x0); show(pedal, D.press - 1.5); garageLine.visible = k > 0.001;
  }

  // ---- the basement (x hall.x0 … the growth edge): back wall, floor, ceiling (the floor slab's underside, with hatches), a parts
  // conveyor with parts riding it, lifts carrying parts up through floor hatches to the stations, pipes, cable trays, lights,
  // signs, the Roomba's charging dock. It shows through the cut face below the floor and fills the band that was plain soil.
  const BS = D.base, basement = new THREE.Group(); root.add(basement);
  const bLen = H.x1 - H.x0, bcx = (H.x0 + H.x1) / 2, bH = BS.y1 - BS.y0;
  const bWallT = tex(512, 256, (g, w, h) => { g.fillStyle = '#6b7078'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, 0, 3, h); } g.fillStyle = '#f2c418'; g.fillRect(0, h - 26, w, 12); g.fillStyle = '#222'; for (let x = 0; x < w; x += 36) { g.beginPath(); g.moveTo(x, h - 26); g.lineTo(x + 14, h - 26); g.lineTo(x + 2, h - 14); g.lineTo(x - 12, h - 14); g.fill(); } });
  bWallT.wrapS = THREE.RepeatWrapping; bWallT.repeat.set(bLen / 6, 1);
  const bMats = [];
  const bm = (m) => { bMats.push(m); return m; };
  mk(new THREE.PlaneGeometry(bLen, bH), bm(new THREE.MeshStandardMaterial({ map: bWallT, roughness: 0.9 })), basement, bcx, (BS.y0 + BS.y1) / 2, BS.z1);
  const bFloorT = tex(256, 256, (g, w, h) => { g.fillStyle = '#5d6168'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }); bFloorT.wrapS = bFloorT.wrapT = THREE.RepeatWrapping; bFloorT.repeat.set(bLen / 3, 1.4);
  mk(new THREE.PlaneGeometry(bLen, -BS.z1), bm(new THREE.MeshStandardMaterial({ map: bFloorT, roughness: 0.85 })), basement, bcx, BS.y0 + 0.002, BS.z1 / 2).rotation.x = -PI / 2;
  const ceil2 = maskedPlane(bLen, -BS.z1, bm(new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.9, side: THREE.DoubleSide })), 30); ceil2.mesh.rotation.x = PI / 2; ceil2.mesh.position.set(bcx, BS.y1, BS.z1 / 2); basement.add(ceil2.mesh);
  const ceilHoles = (shapes) => ceil2.setHoles(shapes, (x, z) => [x - bcx, (z - BS.z1 / 2)]);
  for (const x of [H.x0, H.x1]) { const sw = mk(new THREE.PlaneGeometry(-BS.z1, bH), bm(mat(0x6b7078, 0.9)), basement, x, (BS.y0 + BS.y1) / 2, BS.z1 / 2); sw.rotation.y = x === H.x0 ? PI / 2 : -PI / 2; }
  // pipes + cable tray along the back, strip lights on the ceiling, columns
  [[0xf2c418, -0.6, BS.z1 + 0.25, 0.12], [0x2f6fd6, -0.9, BS.z1 + 0.3, 0.16], [0xd12f3a, -1.25, BS.z1 + 0.22, 0.1]].forEach(([c, y, z, r]) => mk(new THREE.CylinderGeometry(r, r, bLen, 14), bm(mat(c, 0.45)), basement, bcx, y, z).rotation.z = PI / 2);
  mk(new THREE.BoxGeometry(bLen, 0.06, 0.4), bm(steel(0x6b737b)), basement, bcx, -1.55, BS.z1 + 0.3);
  const bLampM = bm(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 1.6 }));
  for (let x = H.x0 + 2; x < H.x1; x += 4.5) mk(new THREE.BoxGeometry(1.4, 0.06, 0.18), bLampM, basement, x, BS.y1 - 0.06, -1.6).castShadow = false;
  for (let x = H.x0 + 3.1; x < H.x1; x += 6.2) mk(new THREE.BoxGeometry(0.25, bH, 0.25), bm(mat(0x7d7b75, 0.9)), basement, x, (BS.y0 + BS.y1) / 2, BS.z1 + 0.13);
  const bLights = [8, 24, 40].map((x) => { const l = new THREE.PointLight(0xfff0d8, 7, 16, 1.4); l.position.set(x, -1.0, -1.2); basement.add(l); return l; });
  // the parts conveyor (split at the dip tank) + the parts riding it (instanced: crates + tyres)
  const bConvT = slatT.clone(); bConvT.needsUpdate = true; bConvT.wrapS = THREE.RepeatWrapping;
  const bConvM = bm(new THREE.MeshStandardMaterial({ map: bConvT, roughness: 0.5, metalness: 0.3 }));
  const segs = [[H.x0 + 0.4, D.tank.x0 - 0.5], [D.tank.x1 + 0.5, H.x1 - 0.4]];
  segs.forEach(([a, b]) => { const cv = mk(new THREE.BoxGeometry(b - a, 0.32, 0.9), [bm(mat(0x3a3f45)), bm(mat(0x3a3f45)), bConvM, bm(mat(0x3a3f45)), bm(mat(0x3a3f45)), bm(mat(0x3a3f45))], basement, (a + b) / 2, BS.y0 + 0.16, BS.conv); bConvT.repeat.set((b - a) / 2, 1); });
  const NB = 70, bCrates = new THREE.InstancedMesh(new RoundedBoxGeometry(0.5, 0.36, 0.5, 2, 0.04), bm(new THREE.MeshStandardMaterial({ roughness: 0.7 })), NB);
  bCrates.frustumCulled = false; basement.add(bCrates); { const cc = [0xc49158, 0x2f6fd6, 0xd12f3a, 0x58b368, 0xf2c418]; for (let i = 0; i < NB; i++) bCrates.setColorAt(i, new THREE.Color(cc[i % cc.length])); }
  // lifts: a platform + a part rising from the conveyor through a floor hatch at each station (z just in front of the line)
  const LZ = -1.95, lifts = BS.lifts.map((x, i) => { const g2 = new THREE.Group(); basement.add(g2); g2.position.set(x, 0, LZ);
    for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) mk(new THREE.BoxGeometry(0.05, bH, 0.05), bm(mat(0xf2c418, 0.5)), g2, dx, (BS.y0 + BS.y1) / 2, dz);
    const plat = new THREE.Group(); g2.add(plat); mk(new THREE.BoxGeometry(0.76, 0.06, 0.76), bm(steel(0x5d656e)), plat); const part = mk(new RoundedBoxGeometry(0.42, 0.3, 0.42, 2, 0.04), bm(mat([0xc49158, 0xd12f3a, 0x2f6fd6][i % 3], 0.7)), plat, 0, 0.18, 0);
    return { g: g2, plat, part, ph: (i * 0.37) % 1 }; });
  const hatchHoles = BS.lifts.map((x) => ({ rect: [x - 0.42, LZ - 0.42, x + 0.42, LZ + 0.42] }));
  const signB = sign(basement, 'B1 · PARTS EXPRESS', 3.2, 0.5, { bg: '#2f6fd6', fg: '#fff' }); signB.position.set(4.2, -1.75, BS.z1 + 0.02); bMats.push(signB.material);
  const signB2 = sign(basement, 'WATCH YOUR HEAD', 2.4, 0.42, { bg: '#ffd23f', fg: '#222' }); signB2.position.set(16.5, -1.75, BS.z1 + 0.02); bMats.push(signB2.material);
  const dock2 = new THREE.Group(); basement.add(dock2); dock2.position.set(12.4, BS.y0, -2.9);   // the Roomba's charging dock (ROOMBA ONLY)
  mk(new RoundedBoxGeometry(0.7, 0.34, 0.3, 2, 0.05), bm(mat(0x2b2e33, 0.4)), dock2, 0, 0.17, 0); mk(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: 0x46e07a, toneMapped: false }), dock2, 0, 0.3, 0.16);
  const signB3 = sign(dock2, 'ROOMBA ONLY', 1.0, 0.24, { bg: '#2b2e33', fg: '#46e07a' }); signB3.position.set(0, 0.62, -0.12); bMats.push(signB3.material);
  bMats.forEach((m) => { m.clippingPlanes = [floorClip]; });   // grows with the hall
  function setBasement(tt) {   // motion in every frame: parts ride the conveyor, lifts carry parts up through the hatches
    basement.visible = hallK > 0.001;
    bConvT.offset.x = -tt * 0.6;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), p3 = new THREE.Vector3();
    for (let i = 0; i < NB; i++) { const span = bLen - 1.0, x = H.x0 + 0.5 + (((i * span) / NB + tt * 1.2) % span); const onTank = x > D.tank.x0 - 0.5 && x < D.tank.x1 + 0.5;
      p3.set(x, BS.y0 + 0.5, BS.conv + (i % 2 ? 0.15 : -0.15)); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.7); sc.setScalar(onTank || x > hallEdge ? 0.001 : 1); m4.compose(p3, q, sc); bCrates.setMatrixAt(i, m4); }
    bCrates.instanceMatrix.needsUpdate = true;
    lifts.forEach((L2, i) => { const u = ((tt * 0.32 + L2.ph) % 1), up = u < 0.45 ? smoothU(u / 0.45) : u < 0.6 ? 1 : 1 - smoothU((u - 0.6) / 0.4);
      L2.plat.position.y = lerp(BS.y0 + 0.4, -0.05, up); L2.part.visible = u < 0.5; });
  }
  const smoothU = (u) => u * u * (3 - 2 * u);
  // ---- holes: the face (basement + pit), the floor + slab strip + lawn + basement ceiling (pit + hatches), composed in one place
  const lawnHole = (shapes) => outside.setHoles(shapes, (x, z) => [x - 21, -(z + 15)]);
  const slabHole = (shapes) => slabMP.setHoles(shapes, (x, y) => [x - (H.x0 + H.x1) / 2, y + 0.15]);
  let hallEdge = H.x0, hallK = 0, pitK = 0;
  function applyHoles() {
    const k = pitK, cx = (T.x0 + T.x1) / 2, hw = (T.x1 - T.x0) / 2 * clamp(k * 1.3), dz = T.z0 * clamp(k * 1.3), dy = T.y0 * clamp(k * 1.1 - 0.1);
    const pitTop = k > 0.001 ? [{ rect: [cx - hw, dz, cx + hw, 0.05], rough: 0.02 }] : [], hatches = hallK > 0.001 ? hatchHoles.filter((h2) => h2.rect[2] < hallEdge) : [];
    hallFloor.setHoles([...pitTop, ...hatches], (x, z) => [x - (H.x0 + H.x1) / 2, -(z - H.back / 2)]);
    lawnHole([...pitTop, ...hatches.map((h2) => ({ rect: h2.rect }))]);
    slabHole(k > 0.001 ? [{ rect: [cx - hw, -0.4, cx + hw, 0.05] }] : []);
    ceilHoles([...(k > 0.001 ? [{ rect: [cx - hw, dz, cx + hw, 0.05] }] : []), ...hatches]);
    const face = []; if (hallK > 0.001 && hallEdge > H.x0 + 0.2) face.push({ rect: [H.x0, BS.y0, Math.min(hallEdge, H.x1), BS.y1], rough: 0.02 });
    if (k > 0.001 && dy < -0.05) face.push({ rect: [cx - hw, dy, cx + hw, 0.05], rough: 0.02 });
    cut.setHoles(face);
  }
  function setPit(k) { tank.visible = hoist.visible = k > 0.001; pitK = k; applyHoles(); pitBack.scale.y = 1; const u = clamp(k * 1.3); tank.position.y = T.y0 * (1 - u * u * (3 - 2 * u)) * 1.15; }   // rises out of the basement floor as the pit opens (it popped in)
  setPit(0);
  setHall(0);

  return {
    root, cut, aimSun, setPit, setBasement, basement, lifts, sun, hemi, setHall, setLine, setFloorHoles, setFaceHoles: (shapes) => cut.setHoles(shapes),
    shop: { g: shop, lift, liftArms, priceBoard, prices, counter, cobwebs }, garage: { g: garage, setRollDoor, tools, lawnmower, lmEng, bulb, pegboard },
    yard, bays, conveyor, banner, daysSign, daysSign2, daysTex, safety, tpsSign, pressSign, clock, hands, press, ram, tank: { g: tank, setBath, bath, rail: tankRail }, hoist: { g: hoist, setHoist, trolley, hanger },
    crack, dock: { g: dock, setDock }, qcGate, lever, lvArm, pedal, pButtons, vend, vendLabel, officeSign: osign, setLot, booth, boothMist, office: { g: office, desk: oDesk, glass: oGlass, invoice: framedBill }, stairs, garageLine, endWall, house, crash: { g: crash, wall: crashWall, target, camStands }, roofTrack, racks,
  };
}
