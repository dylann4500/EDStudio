// sim style: a one-storey suburban house cut away like a dollhouse (@officialwriteit's hit look). The front walls are gone (cut
// plane z = 0, the camera lives at +z), the floor sits on joists over a crawlspace, the ground under the lot is a cut slab of
// soil, the ceiling joists show pink insulation and the gable roof is cut through its rafters. Clean daylight from the front.
//
//   const H = buildSimHouse(studio, { sun, sky })      H.root at the origin; rooms left → right: bedroom | hall | kitchen | living
//   H.D             dims (floor FY, ceiling CY, room x-ranges, bed/nightstand/window/switch spots, kitchen counter…)
//   H.setDay(k)     1 day … 0 night (sky, sun, window views; turn the lamps on yourself)
//   H.setLight(room, k)   ceiling light of 'bed'|'hall'|'kit'|'liv' (bulb glow + a warm point light)
//   H.lamp.set(k)   the bedside lamp      H.setClock(h, m)      H.setCalendar(big, small)   H.switch.set(on)
//   H.aim(x, z, half)     the sun's shadow box per shot          H.update(t)  (curtain sway, sky clouds drift)
//   H.bed = { g (moves the whole bed), top (mattress top y), duvet, pillows, D }   H.nightstand, H.dresser, H.posters
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, lerp, clamp } from '../core.js';
import { simMat, boxUV } from './mats.js';
import { simLights } from './look.js';

const PI = Math.PI;
export const FY = 0.62, CY = FY + 2.5;            // floor top, ceiling (m)
export const D = {
  FY, CY, front: 0, back: -4.45, backOut: -4.6, xOut: 5.75,
  rooms: { bed: [-5.6, -1.62], hall: [-1.5, -0.3], kit: [-0.18, 2.7], liv: [2.82, 5.6] },
  walls: [-1.56, -0.24, 2.76],                    // interior wall centres (0.12 thick)
  ridgeY: CY + 0.18 + 2.1, eaveX: 6.15,
  bed: { x: -3.55, z0: -4.43, len: 2.05, w: 1.42, top: FY + 0.56 },   // headboard on the back wall, foot toward the camera
  nightstand: [-2.48, -4.18], dresser: [-5.33, -1.5],   // dresser against the left wall near the front (faces +x) lampTop: FY + 0.6 + 0.5,
  winL: { x: -5.75, z: [-4.1, -2.7], y: [FY + 0.95, FY + 2.15] },     // the bedroom's side window (left wall), beside the bed's head
  winB: { x: [-5.35, -4.6], y: [FY + 1.15, FY + 2.1] },               // a small back window left of the bed
  bedDoor: { x: -1.56, z: [-1.55, -0.68] }, kitDoor: { x: -0.24, z: [-2.55, -1.6] },
  switchPos: [-1.62 + 0.012, FY + 1.22, -1.82],   // light switch on the bedroom's right wall, next to the door
  counterY: FY + 0.92, counterZ: [-4.45, -3.82], fridgeX: 0.25, sinkX: 1.55, kitWin: [0.95, 2.15],
  couch: [4.2, -3.95],
};
export const ROOM_C = (r) => (D.rooms[r][0] + D.rooms[r][1]) / 2;

function box(w, h, d, m, parent, x, y, z, tile = 1, shadow = true) {
  const g = Array.isArray(m) ? new THREE.BoxGeometry(w, h, d) : boxUV(w, h, d, tile);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o;
}
/** box from corner ranges */
const span = (x0, x1, y0, y1, z0, z1, m, parent, tile = 1, shadow = true) => box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), m, parent, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, tile, shadow);
const rbox = (w, h, d, r, m, parent, x, y, z) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
const cyl = (r0, r1, h, m, parent, x, y, z, seg = 20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };

function canvasPlane(w, h, px, draw, parent, x, y, z, ry = 0, opts = {}) {
  const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * h / w); const g = c.getContext('2d'); draw(g, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: opts.rough ?? 0.7, ...(opts.basic ? {} : {}) }));
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; parent.add(m); m.userData = { c, g, t, draw }; return m;
}

// ---------------------------------------------------------------- posters (our own art: no real brands)
const POSTERS = {
  summit: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2b45a'); gr.addColorStop(1, '#e7685a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff1d6'; g.beginPath(); g.arc(w / 2, h * 0.36, w * 0.2, 0, 7); g.fill(); g.fillStyle = '#3b3550'; g.beginPath(); g.moveTo(0, h * 0.78); g.lineTo(w * 0.32, h * 0.46); g.lineTo(w * 0.52, h * 0.66); g.lineTo(w * 0.72, h * 0.4); g.lineTo(w, h * 0.72); g.lineTo(w, h); g.lineTo(0, h); g.fill(); g.fillStyle = '#fff'; g.font = `700 ${w * 0.12}px Inter, Arial`; g.textAlign = 'center'; g.fillText('SUMMIT', w / 2, h * 0.93); },
  planet: (g, w, h) => { g.fillStyle = '#121626'; g.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.7})`; g.fillRect(R() * w, R() * h, 1.5, 1.5); } const gr = g.createRadialGradient(w * 0.42, h * 0.4, 4, w / 2, h * 0.45, w * 0.3); gr.addColorStop(0, '#f6c08a'); gr.addColorStop(1, '#b4562e'); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h * 0.45, w * 0.28, 0, 7); g.fill(); g.strokeStyle = 'rgba(240,210,170,.8)'; g.lineWidth = w * 0.03; g.beginPath(); g.ellipse(w / 2, h * 0.45, w * 0.45, w * 0.1, -0.3, 0, 7); g.stroke(); g.fillStyle = '#dfe6ff'; g.font = `600 ${w * 0.09}px Inter, Arial`; g.textAlign = 'center'; g.fillText('BEYOND', w / 2, h * 0.9); },
  band: (g, w, h) => { g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#c2362f'; for (let i = 0; i < 9; i++) { const bh = h * (0.12 + 0.3 * Math.abs(Math.sin(i * 1.7))); g.fillRect(w * 0.1 + i * w * 0.09, h * 0.62 - bh, w * 0.06, bh); } g.fillStyle = '#1d1d1d'; g.font = `800 ${w * 0.13}px Inter, Arial`; g.textAlign = 'center'; g.fillText('THE LOWS', w / 2, h * 0.78); g.font = `500 ${w * 0.06}px Inter, Arial`; g.fillText('WORLD TOUR', w / 2, h * 0.88); },
};

// ---------------------------------------------------------------- sky
function skyTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#3f7cc4'); gr.addColorStop(0.42, '#7fb0e2'); gr.addColorStop(0.5, '#cfe2f1'); gr.addColorStop(1, '#dfe9ef');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function cloudTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); const R = rng(8);
  for (let i = 0; i < 26; i++) { const x = 40 + R() * 176, y = 50 + R() * 40 - Math.abs(x - 128) * 0.15, r = 18 + R() * 26; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.6, 'rgba(250,250,252,.7)'); gr.addColorStop(1, 'rgba(240,244,250,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(0, 40, 0, 128); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(120,135,160,.35)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- trees + shrubs (lumpy foliage, Sims-like)
export function makeTree(R, h = 6, leaf = 0x5f8a3f) {
  const g = new THREE.Group(), mL = new THREE.MeshStandardMaterial({ color: leaf, roughness: 0.95, flatShading: false }), mB = simMat('lumber', { color: 0x6b5038 });
  cyl(0.14, 0.22, h * 0.55, mB, g, 0, h * 0.275, 0, 10);
  for (let i = 0; i < 9; i++) { const a = R() * PI * 2, r = 0.6 + R() * 1.0, y = h * (0.55 + R() * 0.35), s = 0.9 + R() * 0.9; const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), mL); b.position.set(Math.cos(a) * r, y, Math.sin(a) * r); b.scale.set(1, 0.85, 1); b.castShadow = true; b.receiveShadow = true; g.add(b); }
  return g;
}
export function makeShrub(R, s = 0.6, leaf = 0x557a3a) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: leaf, roughness: 0.95 });
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s * (0.55 + R() * 0.4), 1), m); b.position.set((R() - 0.5) * s, s * 0.45 + R() * s * 0.2, (R() - 0.5) * s * 0.6); b.castShadow = b.receiveShadow = true; g.add(b); }
  return g;
}

// ---------------------------------------------------------------- a neighbour house (closed box, gable roof)
function neighbour(parent, x, z, R, siding = 0xe2ded5, roof = 0x55585e, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  const w = 9 + R() * 3, d = 7, h = 3.0, mS = simMat('siding', { color: siding, repeat: [w / 2, h / 2] });
  span(-w / 2, w / 2, 0, h, -d / 2, d / 2, mS, g, 2);
  const s = 0.4, rise = (w / 2 + 0.3) * s;
  for (const sd of [-1, 1]) { const len = Math.hypot(w / 2 + 0.3, rise); const r = box(len, 0.12, d + 0.6, simMat('shingle', { color: roof }), g, sd * (w / 4 + 0.15), h + rise / 2, 0, 2); r.rotation.z = -sd * Math.atan(s); }
  const tri = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, rise)]);
  for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(tri), simMat('siding', { color: siding })); m.position.set(0, h, sd * d / 2); if (sd < 0) m.rotation.y = PI; g.add(m); }
  const mW = new THREE.MeshStandardMaterial({ color: 0x2a3644, roughness: 0.2, metalness: 0.2 });
  for (let i = 0; i < 3; i++) { const wx = -w / 2 + w * (0.2 + i * 0.3); box(1.1, 1.2, 0.05, mW, g, wx, 1.6, d / 2 + 0.02, 1, false); box(1.25, 0.08, 0.08, simMat('white'), g, wx, 0.98, d / 2 + 0.04, 1, false); }
  return g;
}

export function buildSimHouse(studio, o = {}) {
  const { scene, camera } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(o.seed ?? 52);
  camera.far = Math.max(camera.far, 420); camera.updateProjectionMatrix();

  // ---- materials
  const M = {
    soil: simMat('soil', { repeat: [14, 2] }), grass: simMat('grass', { repeat: [36, 36] }), crawl: new THREE.MeshStandardMaterial({ color: 0x3a2b1f, roughness: 1 }),
    concrete: simMat('concrete', { repeat: [3, 1] }), lumber: simMat('lumber'), ply: simMat('lumber', { color: 0xd2b48a }),
    insul: simMat('insulation'), cut: simMat('white', { color: 0xe7e3da, rough: 0.9 }),
    sidingOut: simMat('siding', { color: o.siding ?? 0xe9e7e1 }), shingle: simMat('shingle', { color: o.roof ?? 0x5b5e63 }), trim: simMat('white', { color: 0xf4f3ef, rough: 0.5 }),
    ceil: simMat('paint', { color: 0xf1f0ec }),
    wBed: simMat('paint', { color: o.bedWall ?? 0xb8c8cf }), wHall: simMat('paint', { color: 0xe3dccd }), wKit: simMat('paint', { color: 0xf0eadb }), wLiv: simMat('paint', { color: 0xc9cfb8 }),
    carpet: simMat('carpet', { color: 0x8f8f8c }), woodF: simMat('wood', { color: 0xb08457 }), tile: simMat('tile', { color: 0xe6e1d6 }),
    glass: simMat('glass'), wood: simMat('wood', { color: 0x8a5f3c, rough: 0.6 }), woodL: simMat('wood', { color: 0xb88a5c, rough: 0.6 }),
  };
  const wallMat = { bed: M.wBed, hall: M.wHall, kit: M.wKit, liv: M.wLiv };
  const roomAt = (x) => (x < -1.56 ? 'bed' : x < -0.24 ? 'hall' : x < 2.76 ? 'kit' : 'liv');

  // ---- ground: a cut slab of soil under the whole lot, grass on top, a dark crawlspace floor under the house
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.grass); lawn.rotation.x = -PI / 2; lawn.position.set(0, 0, -200); lawn.receiveShadow = true; root.add(lawn);
  M.grass.map.repeat.set(160, 160);
  span(-60, 60, -9, -0.004, -40, 0, M.soil, root, 4, false);
  { const sf = new THREE.Mesh(new THREE.PlaneGeometry(120, 9), simMat('soil', { repeat: [24, 1] })); sf.position.set(0, -4.5, 0.001); sf.receiveShadow = true; root.add(sf); }
  span(-5.6, 5.6, 0.0, 0.012, -4.45, 0, M.crawl, root, 1, false);
  // ---- foundation (stem walls back + sides), sill + rim joists, floor joists along z, plywood subfloor
  for (const [x0, x1, z0, z1] of [[-5.75, 5.75, -4.6, -4.4], [-5.75, -5.55, -4.6, 0], [5.55, 5.75, -4.6, 0]]) span(x0, x1, -0.05, 0.34, z0, z1, M.concrete, root, 1);
  for (let x = 2.5; x > -2.6; x -= 2.5) span(x - 0.12, x + 0.12, 0, 0.34, -2.4, -2.16, M.concrete, root);   // piers under the girder
  span(-5.6, 5.6, 0.22, 0.34, -2.36, -2.2, M.lumber, root);   // the girder
  for (let x = -5.6; x <= 5.61; x += 0.4) span(x - 0.023, x + 0.023, 0.34, 0.575, -4.45, 0, M.lumber, root);
  span(-5.75, 5.75, 0.34, 0.575, -4.6, -4.45, M.lumber, root);
  span(-5.75, 5.75, 0.575, 0.6, -4.6, 0, M.ply, root, 1.2);
  // finish floors per room
  const floors = { bed: M.carpet, hall: M.woodF, kit: M.tile, liv: M.woodF };
  for (const [r, [x0, x1]] of Object.entries(D.rooms)) span(x0 - 0.06, x1 + 0.06, 0.6, FY, D.back, 0, floors[r], root, r === 'kit' ? 0.6 : 1.4);

  // ---- walls (box pieces around every opening; cut faces at z = 0 in a pale drywall colour)
  const W = (x0, x1, y0, y1, z0, z1, mats) => { const m = Array.isArray(mats) ? mats : [mats, mats, mats, mats, mats, mats]; const o2 = span(x0, x1, y0, y1, z0, z1, m, root); const g = o2.geometry, uv = g.attributes.uv, nn = g.attributes.normal; const w = x1 - x0, h = y1 - y0, d = z1 - z0; for (let i = 0; i < uv.count; i++) { const ax = Math.abs(nn.getX(i)), ay = Math.abs(nn.getY(i)); const [a, b] = ax > 0.5 ? [d, h] : ay > 0.5 ? [w, d] : [w, h]; uv.setXY(i, uv.getX(i) * Math.abs(a) / 1.6, uv.getY(i) * Math.abs(b) / 1.6); } return o2; };
  // box face order: +x, −x, +y, −y, +z, −z
  // back wall, room by room (inner face = room paint, outer = siding), with window openings
  const backSeg = (x0, x1, y0, y1, r) => W(x0, x1, y0, y1, -4.6, -4.45, [M.cut, M.cut, M.cut, M.cut, wallMat[r], M.sidingOut]);
  const backWall = (x0, x1, r, win) => {
    if (!win) return backSeg(x0, x1, FY, CY, r);
    backSeg(x0, win[0], FY, CY, r); backSeg(win[1], x1, FY, CY, r); backSeg(win[0], win[1], FY, win[2], r); backSeg(win[0], win[1], win[3], CY, r);
  };
  backWall(-5.75, -1.56, 'bed', [D.winB.x[0], D.winB.x[1], D.winB.y[0], D.winB.y[1]]);
  backWall(-1.56, -0.24, 'hall');
  backWall(-0.24, 2.76, 'kit', [D.kitWin[0], D.kitWin[1], FY + 1.15, FY + 2.15]);
  backWall(2.76, 5.75, 'liv', [3.6, 4.8, FY + 1.0, FY + 2.15]);
  // side walls (exterior): bedroom window on the left
  const sideL = (z0, z1, y0, y1) => W(-5.75, -5.6, y0, y1, z0, z1, [wallMat.bed, M.sidingOut, M.cut, M.cut, M.cut, M.cut]);
  sideL(-4.6, D.winL.z[0], FY, CY); sideL(D.winL.z[1], 0, FY, CY); sideL(D.winL.z[0], D.winL.z[1], FY, D.winL.y[0]); sideL(D.winL.z[0], D.winL.z[1], D.winL.y[1], CY);
  W(5.6, 5.75, FY, CY, -4.6, 0, [M.sidingOut, wallMat.liv, M.cut, M.cut, M.cut, M.cut]);
  // sill band of siding under the exterior walls (rim + foundation face outside)
  // interior walls with door openings (top of door at FY + 2.05)
  const inner = (xc, rL, rR, door) => {
    const x0 = xc - 0.06, x1 = xc + 0.06, mm = [wallMat[rR], wallMat[rL], M.cut, M.cut, M.cut, M.cut];
    if (!door) return W(x0, x1, FY, CY, D.back, 0, mm);
    W(x0, x1, FY, CY, D.back, door[0], mm); W(x0, x1, FY, CY, door[1], 0, mm); W(x0, x1, FY + 2.05, CY, door[0], door[1], mm);
    // door casing (trim) on both faces
    for (const s of [-1, 1]) { span(xc + s * 0.065 - 0.01, xc + s * 0.065 + 0.01, FY, FY + 2.12, door[0] - 0.07, door[0], M.trim, root); span(xc + s * 0.065 - 0.01, xc + s * 0.065 + 0.01, FY, FY + 2.12, door[1], door[1] + 0.07, M.trim, root); span(xc + s * 0.065 - 0.01, xc + s * 0.065 + 0.01, FY + 2.05, FY + 2.12, door[0] - 0.07, door[1] + 0.07, M.trim, root); }
  };
  inner(D.walls[0], 'bed', 'hall', D.bedDoor.z);
  inner(D.walls[1], 'hall', 'kit', D.kitDoor.z);
  inner(D.walls[2], 'kit', 'liv', [-3.2, -1.0]);
  // baseboards
  for (const [r, [x0, x1]] of Object.entries(D.rooms)) span(x0, x1, FY, FY + 0.09, D.back, D.back + 0.015, M.trim, root);
  span(-5.6, -5.585, FY, FY + 0.09, D.back, 0, M.trim, root);

  // ---- windows: frame + glass + sill + a view of the yard behind (lit by the sun anyway)
  const windows = [];
  const windowXY = (x0, x1, y0, y1, z) => {   // in the back wall
    const g = new THREE.Group(); root.add(g);
    span(x0, x1, y0 - 0.04, y0, z, z + 0.2, M.trim, g); span(x0 - 0.05, x1 + 0.05, y0 - 0.06, y0 - 0.02, z + 0.15, z + 0.24, M.trim, g);
    span(x0, x1, y1, y1 + 0.04, z, z + 0.16, M.trim, g); span(x0 - 0.04, x0, y0, y1, z, z + 0.16, M.trim, g); span(x1, x1 + 0.04, y0, y1, z, z + 0.16, M.trim, g);
    span((x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, y0, y1, z + 0.06, z + 0.1, M.trim, g); span(x0, x1, (y0 + y1) / 2 - 0.02, (y0 + y1) / 2 + 0.02, z + 0.06, z + 0.1, M.trim, g);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), M.glass); gl.position.set((x0 + x1) / 2, (y0 + y1) / 2, z + 0.075); g.add(gl);
    windows.push(g); return g;
  };
  windowXY(D.winB.x[0], D.winB.x[1], D.winB.y[0], D.winB.y[1], -4.6);
  windowXY(D.kitWin[0], D.kitWin[1], FY + 1.15, FY + 2.15, -4.6);
  windowXY(3.6, 4.8, FY + 1.0, FY + 2.15, -4.6);
  const winL = new THREE.Group(); root.add(winL);   // the bedroom's side window (in the left wall), opens: winL.sash.position.y
  { const [z0, z1] = D.winL.z, [y0, y1] = D.winL.y, x = -5.75;
    span(x, x + 0.22, y0 - 0.04, y0, z0, z1, M.trim, winL); span(x, x + 0.16, y1, y1 + 0.04, z0, z1, M.trim, winL);
    span(x, x + 0.16, y0, y1, z0 - 0.04, z0, M.trim, winL); span(x, x + 0.16, y0, y1, z1, z1 + 0.04, M.trim, winL);
    const sash = new THREE.Group(); winL.add(sash); winL.sash = sash;
    span(x + 0.06, x + 0.1, (y0 + y1) / 2 - 0.03, (y0 + y1) / 2 + 0.01, z0, z1, M.trim, sash);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, (y1 - y0) / 2), M.glass); gl.rotation.y = PI / 2; gl.position.set(x + 0.08, y0 + (y1 - y0) * 0.25, (z0 + z1) / 2); sash.add(gl);
    const gl2 = gl.clone(); gl2.position.y = y0 + (y1 - y0) * 0.75; gl2.position.x = x + 0.04; winL.add(gl2);
    span(x + 0.02, x + 0.06, y0 + (y1 - y0) * 0.5 - 0.02, y0 + (y1 - y0) * 0.5 + 0.02, z0, z1, M.trim, winL);
  }

  // ---- ceiling, ceiling joists + pink batts, the roof (rafters, deck, shingles), attic gable wall
  { const c = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 4.6), M.ceil); c.rotation.x = PI / 2; c.position.set(0, CY, -2.3); c.receiveShadow = true; root.add(c);
    span(-5.75, 5.75, CY - 0.012, CY, -4.6, 0, M.ceil, root, 1, false); }
  for (let x = -5.6; x <= 5.61; x += 0.4) span(x - 0.023, x + 0.023, CY, CY + 0.18, -4.6, 0, M.lumber, root);
  for (let x = -5.6; x < 5.6; x += 0.4) span(x + 0.023, x + 0.377, CY, CY + 0.15, -4.6, 0, M.insul, root, 0.5, false);
  const slope = (D.ridgeY - (CY + 0.18)) / 5.75, ang = Math.atan(slope);
  const roofY = (x) => D.ridgeY - Math.abs(x) * slope;
  const roof = new THREE.Group(); root.add(roof);
  for (const sd of [-1, 1]) {
    const len = D.eaveX / Math.cos(ang);
    for (let z = -0.05; z > -4.7; z -= 0.6) { const r = box(len, 0.2, 0.045, M.lumber, roof, sd * D.eaveX / 2, (D.ridgeY + roofY(D.eaveX)) / 2 - 0.1, z); r.rotation.z = -sd * ang; }
    const deck = box(len + 0.02, 0.025, 4.9, M.ply, roof, sd * D.eaveX / 2, (D.ridgeY + roofY(D.eaveX)) / 2 + 0.013, -2.45, 1.2); deck.rotation.z = -sd * ang;
    const sh = box(len + 0.05, 0.035, 4.95, M.shingle, roof, sd * D.eaveX / 2 - Math.sin(ang) * 0.03 * sd, (D.ridgeY + roofY(D.eaveX)) / 2 + 0.043, -2.45, 2.2); sh.rotation.z = -sd * ang;
    const fascia = box(0.04, 0.22, 4.95, M.trim, roof, sd * (D.eaveX + 0.02), roofY(D.eaveX) - 0.02, -2.45); fascia.castShadow = false;
  }
  box(0.05, 0.24, 4.9, M.lumber, roof, 0, D.ridgeY - 0.02, -2.45);
  { const tri = new THREE.Shape([new THREE.Vector2(-5.75, 0), new THREE.Vector2(5.75, 0), new THREE.Vector2(0, D.ridgeY - CY - 0.02)]);
    const gw = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.15, bevelEnabled: false }), [simMat('siding', { color: 0xe9e7e1, repeat: [0.6, 0.6] }), M.cut]);
    gw.position.set(0, CY, -4.6); gw.receiveShadow = true; root.add(gw); }
  // siding band below the floor line outside (side walls + back): rim joist face
  span(-5.77, 5.77, 0.34, FY, -4.62, -4.6, M.sidingOut, root);
  span(-5.77, -5.75, 0.34, FY, -4.62, 0, M.sidingOut, root); span(5.75, 5.77, 0.34, FY, -4.62, 0, M.sidingOut, root);

  // ---- ceiling lights (a dome + a warm point light) per room
  const lights = {};
  for (const r of Object.keys(D.rooms)) {
    const x = ROOM_C(r), z = r === 'bed' ? -2.2 : -2.3;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 10, 0, PI * 2, PI / 2, PI / 2), new THREE.MeshStandardMaterial({ color: 0xfff6e8, emissive: 0xfff0d8, emissiveIntensity: 0, roughness: 0.4 }));
    dome.position.set(x, CY - 0.005, z); root.add(dome);
    const pl = new THREE.PointLight(0xffe2b8, 0, 7.5, 1.4); pl.position.set(x, CY - 0.35, z); pl.castShadow = r === 'bed'; if (pl.castShadow) { pl.shadow.mapSize.set(512, 512); pl.shadow.bias = -0.002; } root.add(pl);
    lights[r] = { dome, pl };
  }
  const setLight = (r, k) => { lights[r].dome.material.emissiveIntensity = 1.6 * k; lights[r].pl.intensity = 3.2 * k; };

  // ---------------------------------------------------------------- the bedroom
  const B = D.bed, bed = new THREE.Group(); root.add(bed); bed.position.set(B.x, FY, B.z0);   // origin: floor, centre of the headboard
  const mDuvet = simMat('fabric', { color: o.duvet ?? 0x2e3d66 }), mSheet = simMat('fabric', { color: 0xe9ecef }), mPillow = simMat('fabric', { color: 0xf2f1ec });
  rbox(B.w + 0.08, 1.05, 0.07, 0.02, M.wood, bed, 0, 0.525, 0.035);                               // headboard
  rbox(B.w + 0.08, 0.5, 0.06, 0.02, M.wood, bed, 0, 0.25, B.len + 0.03);                           // footboard
  for (const s of [-1, 1]) rbox(0.05, 0.2, B.len, 0.01, M.wood, bed, s * (B.w / 2 + 0.015), 0.27, B.len / 2 + 0.03);
  for (const [sx, sz] of [[-1, 0.06], [1, 0.06], [-1, B.len], [1, B.len]]) box(0.06, 0.18, 0.06, M.wood, bed, sx * (B.w / 2), 0.09, sz);
  rbox(B.w, 0.24, B.len - 0.02, 0.05, mSheet, bed, 0, 0.36, B.len / 2 + 0.04);                     // mattress (top at 0.48)
  const pillows = [-1, 1].map((s) => { const p = rbox(0.62, 0.16, 0.38, 0.07, mPillow, bed, s * 0.34, 0.55, 0.28); p.rotation.x = -0.35; return p; });
  // duvet: a subdivided slab with soft rumples, draped past the mattress sides
  const duvet = (() => {
    const w = B.w + 0.1, l = B.len - 0.62, g = new THREE.BoxGeometry(w, 0.08, l, 28, 2, 28), p = g.attributes.position, RR = rng(5);
    const bumps = Array.from({ length: 9 }, () => [(RR() - 0.5) * w, (RR() - 0.5) * l, 0.08 + RR() * 0.12, 0.012 + RR() * 0.02]);
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const edge = Math.abs(x) / (w / 2);
      let dy = 0; for (const [bx, bz, r, a] of bumps) dy += a * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (r * r));
      if (edge > 0.93) { const k = (edge - 0.93) / 0.07; y -= k * 0.22; x *= 1 + 0.01 * k; }
      p.setXYZ(i, x, y + dy, z);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mDuvet); m.position.set(0, 0.51, 0.62 + l / 2); m.castShadow = m.receiveShadow = true; bed.add(m); return m;
  })();
  // a folded-back top edge of the duvet (white sheet fold)
  const fold = rbox(B.w + 0.06, 0.05, 0.2, 0.02, mSheet, bed, 0, 0.53, 0.68);
  // a leg bump under the duvet (shown while someone sits in bed)
  const legBump = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.95, 6, 14), mDuvet); legBump.rotation.x = PI / 2; legBump.scale.set(1.25, 1, 0.55); legBump.position.set(0, 0.55, 1.25); legBump.castShadow = true; bed.add(legBump); legBump.visible = false;

  // nightstand + lamp
  const ns = new THREE.Group(); root.add(ns); ns.position.set(D.nightstand[0], FY, D.nightstand[1]);
  rbox(0.5, 0.58, 0.42, 0.015, M.woodL, ns, 0, 0.29, 0);
  for (const y of [0.18, 0.42]) { box(0.44, 0.005, 0.01, M.wood, ns, 0, y, 0.212); cyl(0.012, 0.012, 0.02, simMat('metal'), ns, 0, y + 0.07, 0.22).rotation.x = PI / 2; }
  const lampG = new THREE.Group(); ns.add(lampG); lampG.position.set(0.08, 0.58, -0.04);
  cyl(0.07, 0.09, 0.04, simMat('metal', { color: 0xb8a06a }), lampG, 0, 0.02, 0); cyl(0.012, 0.012, 0.28, simMat('metal', { color: 0xb8a06a }), lampG, 0, 0.18, 0);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2e6cc, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.8, side: THREE.DoubleSide })); shade.position.y = 0.38; lampG.add(shade);
  const lampL = new THREE.PointLight(0xffcf8c, 0, 4.5, 1.6); lampL.position.set(0, 0.36, 0.05); lampG.add(lampL);
  const lamp = { g: lampG, set: (k) => { shade.material.emissiveIntensity = 1.2 * k; lampL.intensity = 1.6 * k; } };
  // dresser + clutter, posters, clock, calendar, shelf, rug, laundry, trash can, beanbag, light switch
  const dr = new THREE.Group(); root.add(dr); dr.position.set(D.dresser[0], FY, D.dresser[1]); dr.rotation.y = PI / 2;
  rbox(0.9, 0.85, 0.45, 0.015, M.woodL, dr, 0, 0.425, 0);
  for (let i = 0; i < 3; i++) { box(0.84, 0.005, 0.01, M.wood, dr, 0, 0.27 + i * 0.25, 0.227); for (const s of [-1, 1]) cyl(0.012, 0.012, 0.02, simMat('metal'), dr, s * 0.22, 0.17 + i * 0.25, 0.235).rotation.x = PI / 2; }
  { const t = cyl(0.13, 0.11, 0.05, simMat('plastic', { color: 0x2c2c2c }), dr, -0.25, 0.875, 0); t.scale.z = 0.6; rbox(0.3, 0.2, 0.025, 0.005, simMat('plastic', { color: 0x1d1f22 }), dr, 0.18, 0.96, -0.1); }   // speaker + a picture frame
  const posters = [['summit', -4.25, FY + 1.75, 0.55, 0.75], ['planet', -2.95, FY + 1.8, 0.5, 0.7], ['band', -2.15, FY + 1.6, 0.42, 0.6]].map(([k, x, y, w, h]) => {
    const p = canvasPlane(w, h, 400, POSTERS[k], root, x, y, D.back + 0.008); p.castShadow = false; return p;
  });
  // wall clock (right part of the back wall) with real hands
  const clock = new THREE.Group(); root.add(clock); clock.position.set(-2.05, FY + 2.15, D.back + 0.02);
  { const face = cyl(0.14, 0.14, 0.03, simMat('white'), clock, 0, 0, 0, 32); face.rotation.x = PI / 2; const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 32), simMat('plastic', { color: 0x2a2a2a })); rim.position.z = 0.015; clock.add(rim);
    for (let i = 0; i < 12; i++) { const tk = box(0.008, 0.026, 0.004, simMat('plastic', { color: 0x222222 }), clock, Math.sin(i * PI / 6) * 0.115, Math.cos(i * PI / 6) * 0.115, 0.018, 1, false); tk.rotation.z = -i * PI / 6; } }
  const hHand = new THREE.Group(), mHand = new THREE.Group(); clock.add(hHand, mHand); hHand.position.z = mHand.position.z = 0.022;
  box(0.012, 0.07, 0.004, simMat('plastic', { color: 0x161616 }), hHand, 0, 0.03, 0, 1, false); box(0.008, 0.1, 0.004, simMat('plastic', { color: 0x161616 }), mHand, 0, 0.045, 0.004, 1, false);
  const setClock = (h, m) => { mHand.rotation.z = -(m / 60) * PI * 2; hHand.rotation.z = -((h % 12) / 12 + m / 720) * PI * 2; };
  // a tear-off calendar (big number = the DAY) under the clock
  const cal = canvasPlane(0.3, 0.38, 300, () => {}, root, -2.05, FY + 1.67, D.back + 0.008);
  const setCalendar = (big, small = 'NOVEMBER') => { const { g, c, t } = cal.userData, w = c.width, h = c.height; g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8322c'; g.fillRect(0, 0, w, h * 0.24); g.fillStyle = '#fff'; g.font = `700 ${w * 0.13}px Inter, Arial`; g.textAlign = 'center'; g.fillText(small, w / 2, h * 0.17); g.fillStyle = '#1d1d1d'; g.font = `700 ${w * 0.42}px Inter, Arial`; g.fillText(String(big), w / 2, h * 0.68); g.font = `500 ${w * 0.1}px Inter, Arial`; g.fillStyle = '#555'; g.fillText('DAY', w / 2, h * 0.88); t.needsUpdate = true; };
  setCalendar(1);
  // shelf with books above the dresser
  { const sh = new THREE.Group(); root.add(sh); sh.position.set(-5.48, FY + 1.6, D.dresser[1]); sh.rotation.y = PI / 2; box(0.8, 0.025, 0.2, M.woodL, sh, 0, 0, 0); const RR = rng(77); let x = -0.36; while (x < 0.3) { const bw = 0.03 + RR() * 0.03, bh = 0.16 + RR() * 0.08; box(bw, bh, 0.15, simMat('plastic', { color: new THREE.Color().setHSL(RR(), 0.35, 0.4).getHex(), rough: 0.8 }), sh, x + bw / 2, bh / 2 + 0.012, 0); x += bw + 0.004; } cyl(0.05, 0.04, 0.1, simMat('plastic', { color: 0xc9b38f }), sh, 0.33, 0.06, 0); }
  // rug, laundry pile, trash can, beanbag, guitar-free corner, light switch
  { const rug = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), simMat('carpet', { color: 0xb9a68a })); rug.rotation.x = -PI / 2; rug.scale.set(1.3, 1, 1); rug.position.set(-3.7, FY + 0.006, -1.35); rug.receiveShadow = true; root.add(rug); }
  const laundry = new THREE.Group(); root.add(laundry); laundry.position.set(-4.75, FY, -0.55);
  { const RR = rng(3); for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), simMat('fabric', { color: [0x6a7d8f, 0xc2c2bd, 0x3a3f46, 0x8e5d4d][i % 4] })); c.scale.set(1.2, 0.35, 0.9); c.position.set((RR() - 0.5) * 0.4, 0.05 + i * 0.03, (RR() - 0.5) * 0.4); c.rotation.y = RR() * 3; c.castShadow = c.receiveShadow = true; laundry.add(c); } }
  const can = cyl(0.14, 0.12, 0.34, simMat('plastic', { color: 0x4a4f55 }), root, -1.95, FY + 0.17, -3.6);
  // light switch plate + toggle (right wall, by the door)
  const sw = new THREE.Group(); root.add(sw); sw.position.set(...D.switchPos); sw.rotation.y = -PI / 2;
  box(0.075, 0.12, 0.01, simMat('white'), sw, 0, 0, 0, 1, false);
  const toggle = new THREE.Group(); sw.add(toggle); toggle.position.z = 0.006; box(0.016, 0.034, 0.016, simMat('white', { color: 0xfafafa }), toggle, 0, 0.0, 0.008, 1, false);
  const sw2 = { g: sw, toggle, set: (on) => { toggle.rotation.x = on ? -0.45 : 0.45; } }; sw2.set(true);

  // ---------------------------------------------------------------- hall: a closed bathroom door at the back, runner, photos, hooks
  { const hx = ROOM_C('hall'); const door = new THREE.Group(); root.add(door); door.position.set(hx, FY, D.back + 0.03);
    rbox(0.82, 2.02, 0.04, 0.008, simMat('white', { color: 0xf1efe8 }), door, 0, 1.01, 0); cyl(0.025, 0.025, 0.05, simMat('chrome'), door, 0.3, 1.0, 0.04).rotation.x = PI / 2;
    for (const s of [-1, 1]) span(hx + s * 0.44 - 0.02, hx + s * 0.44 + 0.02, FY, FY + 2.1, D.back, D.back + 0.04, M.trim, root);
    const run = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 3.6), simMat('carpet', { color: 0x7c4a3c })); run.rotation.x = -PI / 2; run.position.set(hx, FY + 0.005, -2.2); run.receiveShadow = true; root.add(run);
    canvasPlane(0.36, 0.28, 256, (g, w, h) => { g.fillStyle = '#3b3125'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8cfbf'; g.fillRect(w * 0.08, h * 0.1, w * 0.84, h * 0.8); g.fillStyle = '#7aa0c8'; g.fillRect(w * 0.08, h * 0.1, w * 0.84, h * 0.4); g.fillStyle = '#6b8f4e'; g.fillRect(w * 0.08, h * 0.5, w * 0.84, h * 0.4); for (let i = 0; i < 3; i++) { g.fillStyle = ['#c9a27e', '#a77b56', '#e1b896'][i]; g.beginPath(); g.arc(w * (0.32 + i * 0.18), h * 0.45, h * 0.1, 0, 7); g.fill(); } }, root, D.walls[1] - 0.065, FY + 1.6, -3.0, -PI / 2);
  }
  // ---------------------------------------------------------------- kitchen: counters + sink under the window, stove, fridge, uppers, table
  const kit = new THREE.Group(); root.add(kit);
  { const mCab = simMat('wood', { color: 0xd9d2c3, rough: 0.5 }), mTop = simMat('concrete', { color: 0x4d4b48 }), x0 = 0.75, x1 = 2.68, z = -4.13;
    span(x0, x1, FY, FY + 0.88, -4.45, -3.82, mCab, kit); span(x0 - 0.02, x1, FY + 0.88, D.counterY, -4.45, -3.8, mTop, kit);
    for (let x = x0 + 0.02; x < x1 - 0.1; x += 0.48) { span(x, x + 0.44, FY + 0.1, FY + 0.82, -3.82, -3.81, simMat('white', { color: 0xe6e0d2 }), kit, 1, false); cyl(0.008, 0.008, 0.1, simMat('metal'), kit, x + 0.38, FY + 0.74, -3.79); }
    span(D.sinkX - 0.3, D.sinkX + 0.3, D.counterY - 0.002, D.counterY + 0.003, -4.35, -3.9, simMat('steel'), kit, 1, false);
    const fau = cyl(0.015, 0.015, 0.3, simMat('chrome'), kit, D.sinkX, D.counterY + 0.15, -4.38); const spout = cyl(0.012, 0.012, 0.18, simMat('chrome'), kit, D.sinkX, D.counterY + 0.3, -4.29); spout.rotation.x = PI / 2;
    span(1.95, 2.55, D.counterY, D.counterY + 0.012, -4.4, -3.86, simMat('plastic', { color: 0x1c1c1e, rough: 0.2 }), kit);   // cooktop
    for (const [bx, bz] of [[2.1, -4.25], [2.4, -4.25], [2.1, -4.0], [2.4, -4.0]]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.006, 6, 20), simMat('metal', { color: 0x555555 })); r.rotation.x = PI / 2; r.position.set(bx, D.counterY + 0.016, bz); kit.add(r); }
    // upper cabinets, in two pieces around the window
    span(x0, D.kitWin[0] - 0.05, FY + 1.5, FY + 2.3, -4.45, -4.12, mCab, kit); span(D.kitWin[1] + 0.05, x1, FY + 1.5, FY + 2.3, -4.45, -4.12, mCab, kit);
    // fridge (left end)
    const fr = new THREE.Group(); kit.add(fr); fr.position.set(D.fridgeX, FY, -4.05);
    rbox(0.8, 1.82, 0.72, 0.03, simMat('steel', { color: 0xd4d6d8 }), fr, 0, 0.91, 0); box(0.78, 0.008, 0.01, simMat('rubber'), fr, 0, 1.2, 0.362);
    for (const y of [0.85, 1.5]) cyl(0.012, 0.012, 0.32, simMat('chrome'), fr, 0.33, y, 0.38);
    // table + two chairs + fruit bowl
    const tb = new THREE.Group(); kit.add(tb); tb.position.set(1.55, FY, -1.9);
    cyl(0.48, 0.48, 0.04, M.woodL, tb, 0, 0.74, 0, 32); cyl(0.05, 0.08, 0.72, M.wood, tb, 0, 0.36, 0); cyl(0.3, 0.3, 0.03, M.wood, tb, 0, 0.015, 0);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 10, 0, PI * 2, PI / 2, PI / 2), simMat('plastic', { color: 0xe8e2d4 })); bowl.position.set(0, 0.89, 0); tb.add(bowl);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), simMat('plastic', { color: [0xd8492c, 0xe9b43a, 0x8bb24a, 0xd8492c][i], rough: 0.5 })); f.position.set(Math.cos(i * 1.6) * 0.06, 0.82, Math.sin(i * 1.6) * 0.06); tb.add(f); }
    for (const s of [-1, 1]) { const ch = new THREE.Group(); tb.add(ch); ch.position.set(s * 0.68, 0, 0); ch.rotation.y = -s * PI / 2; rbox(0.42, 0.04, 0.42, 0.01, M.woodL, ch, 0, 0.45, 0); rbox(0.42, 0.5, 0.04, 0.01, M.woodL, ch, 0, 0.72, -0.19); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.035, 0.45, 0.035, M.wood, ch, a * 0.18, 0.225, b * 0.18); }
  }
  // ---------------------------------------------------------------- living room: couch, coffee table, floor lamp, plant, bookshelf, TV
  const liv = new THREE.Group(); root.add(liv);
  { const mC = simMat('fabric', { color: 0x8a8f7d }), cx = D.couch[0], cz = D.couch[1];
    rbox(2.1, 0.42, 0.85, 0.06, mC, liv, cx, FY + 0.21, cz); rbox(2.1, 0.55, 0.22, 0.08, mC, liv, cx, FY + 0.6, cz - 0.33);
    for (const s of [-1, 1]) rbox(0.22, 0.6, 0.85, 0.08, mC, liv, cx + s * 1.0, FY + 0.3, cz);
    for (const s of [-1, 1]) { const p = rbox(0.4, 0.38, 0.12, 0.05, simMat('fabric', { color: 0xc96f4a }), liv, cx + s * 0.6, FY + 0.6, cz - 0.15); p.rotation.x = -0.2; }
    rbox(1.1, 0.06, 0.55, 0.01, M.woodL, liv, cx, FY + 0.42, cz + 1.25); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.04, 0.4, 0.04, M.wood, liv, cx + a * 0.5, FY + 0.2, cz + 1.25 + b * 0.22);
    const pot = cyl(0.17, 0.13, 0.34, simMat('plastic', { color: 0xd9cfbf }), liv, 5.25, FY + 0.17, -4.1); liv.add(makeShrub(rng(9), 0.5)); liv.children[liv.children.length - 1].position.set(5.25, FY + 0.3, -4.1);
    cyl(0.015, 0.015, 1.5, simMat('metal', { color: 0x2b2b2b }), liv, 3.05, FY + 0.75, -4.15); cyl(0.12, 0.2, 0.3, new THREE.MeshStandardMaterial({ color: 0xf1e7d2, emissive: 0xffd9a0, emissiveIntensity: 0.3, side: THREE.DoubleSide }), liv, 3.05, FY + 1.55, -4.15);
    const tv = rbox(0.06, 0.62, 1.08, 0.01, simMat('plastic', { color: 0x111214, rough: 0.25 }), liv, 5.55, FY + 1.35, -1.6);
    rbox(0.42, 0.5, 1.4, 0.01, M.woodL, liv, 5.38, FY + 0.25, -1.6);
  }

  // ---------------------------------------------------------------- the yard + street behind: fence, trees, shrubs, neighbours, sky
  const yard = new THREE.Group(); root.add(yard);
  { const mF = simMat('lumber', { color: 0xb08a63 });
    for (let x = -16; x <= 16; x += 2.4) { box(2.4, 1.8, 0.04, mF, yard, x, 0.9, -14, 1); box(0.1, 1.9, 0.1, mF, yard, x - 1.2, 0.95, -13.96); }
    for (const z of [-14]) for (const sx of [-16.4, 16.4]) for (let zz = -14; zz < -5; zz += 2.4) { const p = box(0.04, 1.8, 2.4, mF, yard, sx, 0.9, zz + 1.2, 1); }
    const RT = rng(11);
    for (const [x, z, h] of [[-9, -10, 6.5], [9.5, -11, 7], [-13.5, -4, 5.5], [13, -3, 6], [3, -12, 5], [-4, -21, 8], [6, -22, 8.5], [-18, -20, 7.5], [17, -19, 7]]) { const t = makeTree(RT, h, [0x5f8a3f, 0x6b8f45, 0x557f3a][Math.floor(RT() * 3)]); t.position.set(x, 0, z); yard.add(t); }
    for (const [x, z] of [[-6.4, -1], [-6.5, -3], [6.4, -0.8], [6.5, -3.4], [-2, -5.2], [1.5, -5.3], [4.5, -5.2]]) { const s = makeShrub(RT, 0.55); s.position.set(x, 0, z); yard.add(s); }
    neighbour(yard, -14, -30, RT, 0xd9dccf, 0x4f5258); neighbour(yard, 2, -32, RT, 0xe7dccb, 0x5a4a44); neighbour(yard, 18, -30, RT, 0xcfd8de, 0x55585e);
    neighbour(yard, -26, -6, RT, 0xe3e0d4, 0x5d5f63, PI / 2); neighbour(yard, 26, -7, RT, 0xd6d0c4, 0x4d4f55, -PI / 2);
    // a patio + grill + kiddie stuff in the backyard so the window views are never empty
    span(-3, 0.5, 0.0, 0.03, -7.6, -4.6, simMat('concrete', { color: 0xb9b5ad, repeat: [2, 2] }), yard);
    { const tbl = new THREE.Group(); yard.add(tbl); tbl.position.set(-1.6, 0, -6.4); cyl(0.5, 0.5, 0.04, simMat('white'), tbl, 0, 0.72, 0, 24); cyl(0.03, 0.03, 0.72, simMat('white'), tbl, 0, 0.36, 0); const um = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.4, 16, 1, true), simMat('fabric', { color: 0xc9483f, side: THREE.DoubleSide })); um.position.set(0, 2.15, 0); um.castShadow = true; tbl.add(um); cyl(0.02, 0.02, 2.1, simMat('metal'), tbl, 0, 1.05, 0); }
  }
  // sky dome + clouds (fog-free), a soft distance haze
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(330, 32, 16), skyMat); sky.renderOrder = -2; root.add(sky);
  const clouds = new THREE.Group(); root.add(clouds); const cT = cloudTex();
  { const RC = rng(12); for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cT, fog: false, depthWrite: false, transparent: true, opacity: 0.95 })); const a = -PI / 2 + (RC() - 0.5) * 2.6, r = 160 + RC() * 120; s.position.set(Math.cos(a) * r * 0.9 + (RC() - 0.5) * 60, 28 + RC() * 55, Math.sin(a) * r); s.scale.set(50 + RC() * 40, 22 + RC() * 14, 1); s.renderOrder = -1; clouds.add(s); } }
  const fog = new THREE.Fog(0xd3e2ec, 90, 360); scene.fog = fog;
  const L = simLights(studio, { sun: o.sun ?? [-0.5, 1, 0.8], target: [-3.5, -1.5], half: 8, ...(o.light || {}) });
  scene.background = new THREE.Color(0xcfe0ec);

  // ---- day/night
  const nightSky = new THREE.Color(0x152038), dayCol = new THREE.Color(1, 1, 1);
  function setDay(k) {
    L.setDay(k); skyMat.color.copy(nightSky).lerp(dayCol, k); for (const c of clouds.children) c.material.opacity = 0.95 * Math.max(0.12, k);
    fog.color.setRGB(lerp(0.08, 0.83, k), lerp(0.11, 0.89, k), lerp(0.2, 0.93, k)); scene.background.copy(fog.color);
    M.glass.opacity = lerp(0.5, 0.22, k); M.glass.color.setHex(k > 0.5 ? 0xcfe6f2 : 0x1c2742);
  }
  const aim = (x, z, half = 8) => L.focus(x, z, half);
  function update(t) { clouds.position.x = (t * 0.6) % 40; }
  setDay(1); setClock(10, 10);
  return {
    root, D, M, L, lights, setLight, lamp, setClock, setCalendar, switch: sw2, aim, setDay, update, sky, clouds, fog, yard, kit, liv, winL, windows, roofY, roof,
    bed: { g: bed, top: FY + 0.48, duvet, fold, pillows, legBump, D: B }, nightstand: ns, dresser: dr, posters, laundry, can, roomAt,
  };
}
