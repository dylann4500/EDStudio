// SET: a seismology monitoring room (built for video 035) — a drum seismograph ("helicorder") on a table in front (paper drum
// you draw on every frame, a pen arm `pen` that pivots, so a trace can swing off the paper), two scientists' rolling chairs
// behind it (`chairs[]`, they face +z = the lens), a back counter with three wall monitors (`screens[]` = canvases you redraw),
// a big world map with fault lines, a QUAKE WATCH sign, a wall clock, binders, a filing cabinet, plants, mugs, a ceiling lamp
// on a cord (`lamp`, swing it), fluorescent panels.
// Coordinates (meters, y up): room x∈[-3,3], z∈[-2.6,2.4], ceiling 2.8. Drum table at DIMS.table (top DIMS.tableY), drum axis
// along x at DIMS.drum. Scientists sit at DIMS.seats (seat 0.48) facing +z. Camera from +z (z ≈ 2), a little high, looking −z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, mat, mk, canvasTex } from '@engine/core.js';

export const DIMS = { table: [0, 0.35], tableY: 0.8, drum: { x: 0, y: 1.0, z: 0.35, r: 0.15, len: 0.95 }, seats: [[-0.55, -0.55], [0.55, -0.55]], seat: 0.48 };

function liveCanvas(w, h) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d'); const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { canvas, ctx, tex, w, h };
}

export function buildQuakeLab(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 14);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);

  // room: grey-blue vinyl floor, pale walls, ceiling + fluorescent panels
  const floorTex = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#9aa6ae' : '#8c99a2'; g.fillRect(x * 64, y * 64, 64, 64); } }, [6, 6]);
  const floor = mk(new THREE.PlaneGeometry(6, 5), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.5 }), root, 0, 0, -0.1); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const wallM = mat(0xe8e6df, 0.9);
  box(6.2, 2.8, 0.1, wallM, 0, 1.4, -2.65); box(0.1, 2.8, 5.2, wallM, -3.05, 1.4, -0.1); box(0.1, 2.8, 5.2, wallM, 3.05, 1.4, -0.1);
  box(6.2, 0.08, 5.3, mat(0xf2f0ea, 0.95), 0, 2.84, -0.1);
  for (const x of [-1.6, 1.6]) for (const z of [-1.6, 0.6]) mk(new THREE.BoxGeometry(1.1, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f8ff, emissiveIntensity: 0.9 }), root, x, 2.79, z);

  // back wall: world map with glowing fault lines, QUAKE WATCH sign, a clock
  const mapTex = canvasTex(1024, 480, (g, w, h) => {
    g.fillStyle = '#1d3550'; g.fillRect(0, 0, w, h); g.fillStyle = '#6f9a6a'; const r = rng(3);
    for (const [x, y, rx, ry] of [[0.2, 0.32, 0.12, 0.13], [0.27, 0.68, 0.06, 0.15], [0.5, 0.3, 0.07, 0.08], [0.52, 0.6, 0.07, 0.14], [0.7, 0.32, 0.17, 0.12], [0.84, 0.72, 0.06, 0.05]]) { g.beginPath(); for (let k = 0; k <= 24; k++) { const a = (k / 24) * Math.PI * 2, q = 1 + (r() - 0.5) * 0.3; g.lineTo((x + Math.cos(a) * rx * q) * w, (y + Math.sin(a) * ry * q) * h); } g.fill(); }
    g.strokeStyle = '#ff8a4a'; g.lineWidth = 4; g.setLineDash([10, 6]);
    for (const pts of [[[0.08, 0.2], [0.13, 0.42], [0.2, 0.62], [0.24, 0.9]], [[0.62, 0.2], [0.78, 0.25], [0.92, 0.4]], [[0.88, 0.45], [0.86, 0.7], [0.95, 0.85]]]) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.stroke(); }
    g.setLineDash([]); g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 60) g.fillRect(0, y, w, 1);
  });
  const map = mk(new THREE.PlaneGeometry(2.6, 0.78), new THREE.MeshLambertMaterial({ map: mapTex, emissive: 0x223344, emissiveIntensity: 0.4 }), root, -0.9, 2.36, -2.59); void map;
  box(2.7, 0.88, 0.03, mat(0x2a2d31, 0.5), -0.9, 2.36, -2.61);
  const sign = mk(new THREE.PlaneGeometry(1.5, 0.3), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(512, 102, (g, w, h) => { g.fillStyle = '#c8302c'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('QUAKE WATCH', w / 2, h / 2 + 3); }) }), root, 1.75, 2.42, -2.59); void sign;
  const clockF = mk(new THREE.CircleGeometry(0.17, 32), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 26); g.moveTo(64, 64); g.lineTo(92, 64); g.stroke(); }) }), root, 2.6, 1.95, -2.59); void clockF;

  // back counter + three wall monitors (live canvases) + keyboards
  rbox(5.6, 0.06, 0.6, 0.02, mat(0x6a7680, 0.5), 0, 0.92, -2.3); box(5.5, 0.88, 0.55, mat(0xd8dde2, 0.6), 0, 0.45, -2.3);
  const screens = [-1.9, 0.05, 1.75].map((x, i) => {
    const lc = liveCanvas(512, 288), g = new THREE.Group(); g.position.set(x, 1.62, -2.42); root.add(g);
    rbox(1.02, 0.6, 0.05, 0.02, mat(0x1d1d22, 0.4), 0, 0, 0, g);
    const scr = mk(new THREE.PlaneGeometry(0.94, 0.53), new THREE.MeshBasicMaterial({ map: lc.tex, toneMapped: false }), g, 0, 0, 0.027); void scr;
    box(0.06, 0.4, 0.06, mat(0x2a2d31, 0.5), 0, -0.48, -0.02, g);
    box(0.45, 0.02, 0.15, mat(0x2a2d31, 0.5), x, 0.96, -2.12);
    return lc;
  });

  // the drum seismograph: a steel base, two posts, the paper drum (live canvas), a pen arm pivoting at the back
  const D = DIMS.drum, steel = mat(0xb8bdc4, 0.3, { metalness: 0.6 });
  const [tx, tz] = DIMS.table;
  rbox(1.6, 0.06, 0.8, 0.02, mat(0x4a5560, 0.5), tx, DIMS.tableY - 0.03, tz); for (const sx of [-0.72, 0.72]) for (const sz of [-0.32, 0.32]) box(0.05, DIMS.tableY - 0.06, 0.05, mat(0x3a3d42, 0.5), tx + sx, (DIMS.tableY - 0.06) / 2, tz + sz);
  rbox(1.15, 0.05, 0.5, 0.01, steel, D.x, DIMS.tableY + 0.025, D.z);
  for (const s of [-1, 1]) box(0.04, D.y - DIMS.tableY + 0.02, 0.06, steel, D.x + s * (D.len / 2 + 0.04), (D.y + DIMS.tableY) / 2, D.z);
  const paper = liveCanvas(1024, 256);
  paper.tex.wrapS = THREE.RepeatWrapping;
  const drum = new THREE.Group(); drum.position.set(D.x, D.y, D.z); root.add(drum);
  const dm = mk(new THREE.CylinderGeometry(D.r, D.r, D.len, 48, 1, true), new THREE.MeshStandardMaterial({ map: paper.tex, roughness: 0.8, emissive: 0xffffff, emissiveIntensity: 0.08, emissiveMap: paper.tex }), drum);
  dm.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const c = mk(new THREE.CircleGeometry(D.r, 32), steel, drum, s * D.len / 2, 0, 0); c.rotation.y = s * Math.PI / 2; }
  const axle = mk(new THREE.CylinderGeometry(0.015, 0.015, D.len + 0.12, 8), steel, drum); axle.rotation.z = Math.PI / 2;
  // pen arm: pivot behind + above the drum; the stylus touches the drum top at x = penX (the arm swings along x)
  const pen = new THREE.Group(); pen.position.set(D.x + 0.1, D.y + D.r + 0.02, D.z - 0.42); root.add(pen);
  box(0.06, 0.06, 0.06, mat(0x2a2d31, 0.4), 0, 0, 0, pen);
  const arm = box(0.012, 0.012, 0.42, mat(0x3a3d42, 0.4, { metalness: 0.5 }), 0, 0, 0.21, pen); void arm;
  const tip = mk(new THREE.ConeGeometry(0.012, 0.04, 8), mat(0xc8302c, 0.4), pen, 0, -0.015, 0.42); tip.rotation.x = Math.PI;
  box(0.05, D.r + 0.05, 0.05, mat(0x2a2d31, 0.4), 0, -(D.r + 0.05) / 2 - 0.02, 0, pen);
  // mugs + papers on the drum table, a binder stack
  const mugs = [[-0.6, 0.55, 0xf2b632], [0.62, 0.5, 0x3d7bd9]].map(([x, z, c]) => { const m = new THREE.Group(); m.position.set(tx + x, DIMS.tableY, z); root.add(m); mk(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 14), mat(c, 0.4), m, 0, 0.05, 0); const h = mk(new THREE.TorusGeometry(0.03, 0.008, 6, 12), mat(c, 0.4), m, 0.05, 0.05, 0); h.rotation.y = Math.PI / 2; return m; });
  for (let k = 0; k < 4; k++) box(0.21, 0.003, 0.29, mat(0xfbfaf6, 0.8), tx - 0.45 + k * 0.02, DIMS.tableY + 0.002 + k * 0.003, 0.55).rotation.y = (k - 1.5) * 0.12;

  // two rolling office chairs (groups at the seat spots; push them back by moving the group)
  const chairs = DIMS.seats.map(([x, z]) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); root.add(c); const m = mat(0x2a2d31, 0.7);
    rbox(0.5, 0.08, 0.48, 0.03, m, 0, DIMS.seat - 0.04, 0, c); rbox(0.48, 0.55, 0.07, 0.03, m, 0, DIMS.seat + 0.32, -0.24, c);
    mk(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 8), steel, c, 0, 0.24, 0);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2, l = box(0.03, 0.03, 0.28, steel, Math.sin(a) * 0.13, 0.06, Math.cos(a) * 0.13, c); l.rotation.y = a; mk(new THREE.SphereGeometry(0.03, 8, 6), m, c, Math.sin(a) * 0.26, 0.03, Math.cos(a) * 0.26); }
    return c;
  });

  // dressing: filing cabinet, binder shelf, plants, a water cooler, a hanging lamp on a cord
  const fc = new THREE.Group(); fc.position.set(-2.6, 0, -1.2); root.add(fc); box(0.5, 1.3, 0.6, mat(0x8a96a0, 0.5, { metalness: 0.3 }), 0, 0.65, 0, fc); for (let k = 0; k < 4; k++) box(0.4, 0.02, 0.02, mat(0x3a3d42, 0.4), 0.26, 0.25 + k * 0.3, 0, fc).rotation.y = Math.PI / 2;
  const sh = new THREE.Group(); sh.position.set(2.75, 0, -0.9); sh.rotation.y = -Math.PI / 2; root.add(sh);
  box(1.4, 1.8, 0.32, mat(0xd8dde2, 0.6), 0, 0.9, 0, sh); for (let lv = 0; lv < 3; lv++) for (let b = 0; b < 10; b++) box(0.09, 0.3, 0.26, mat([0xc8302c, 0x3d7bd9, 0xf2b632, 0x58b368, 0x2f3a4a][Math.floor(R() * 5)], 0.6), -0.6 + b * 0.13, 0.35 + lv * 0.55, 0.02, sh);
  for (const [x, z] of [[-2.55, 1.4], [2.55, 1.4], [-2.6, -2.2]]) { const pl = new THREE.Group(); pl.position.set(x, 0, z); root.add(pl); mk(new THREE.CylinderGeometry(0.2, 0.15, 0.38, 14), mat(0xf4f1ea, 0.5), pl, 0, 0.19, 0); for (let k = 0; k < 9; k++) mk(new THREE.SphereGeometry(0.2, 10, 8), mat(0x3f7a3a, 0.8), pl, Math.sin(k * 2.4) * 0.16, 0.5 + (k % 3) * 0.2, Math.cos(k * 2.4) * 0.16).scale.set(1, 1.5, 0.6); }
  const lamp = new THREE.Group(); lamp.position.set(0, 2.8, 0.2); root.add(lamp);
  box(0.01, 0.75, 0.01, mat(0x222222, 0.5), 0, -0.375, 0, lamp);
  mk(new THREE.ConeGeometry(0.22, 0.2, 20, 1, true), mat(0x3d7bd9, 0.5, { side: THREE.DoubleSide }), lamp, 0, -0.82, 0);
  mk(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff4d8 }), lamp, 0, -0.88, 0);

  // lights
  const hemi = new THREE.HemisphereLight(0xf4f8ff, 0x6a6a72, 1.2); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff6ea, 1.6); key.position.set(1.5, 4.5, 3.5); key.target.position.set(0, 0.6, -0.4); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 15 }); key.shadow.bias = -0.0004;
  const panel = new THREE.PointLight(0xf4f8ff, 3.2, 8, 1.4); panel.position.set(0, 2.5, -0.4); root.add(panel);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, drum, pen, paper, screens, chairs, mugs, lamp, lights: { hemi, key, panel } };
}
