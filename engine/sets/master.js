// SET: a sunny grown-up bedroom at 7 AM (built for video 035) — a double bed (headboard, two pillows, a puffy duvet you can
// lift/fly via `duvet`), two nightstands with lamps, a bedside alarm clock (`clock`, its group can hop), a window with
// curtains + a warm morning sun patch, a dresser with a mirror, a laundry chair, a rug, plants, framed art over the bed, slippers.
// Coordinates (meters, y up). Room x∈[-2.6,2.6], z∈[-2.5,2.6], ceiling 2.7. Headboard against the back wall (z = −2.45).
// Bed: x∈[-0.85,0.85], z∈[-2.4,-0.25], mattress top DIMS.top. Sleepers' heads at DIMS.pillows (on the pillows, y ≈ top + 0.14).
// Camera usually at the foot of the bed (+z), a little high, looking −z at both faces.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, mat, mk, canvasTex } from '@engine/core.js';

export const DIMS = { room: { x0: -2.6, x1: 2.6, z0: -2.5, z1: 2.6, h: 2.7 }, bed: { x0: -0.85, x1: 0.85, z0: -2.4, z1: -0.25 }, top: 0.55,
  pillows: [[-0.4, -2.1], [0.4, -2.1]], stands: [[-1.18, -2.18], [1.18, -2.18]], standH: 0.55 };

export function buildMaster(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 35), Dm = DIMS.room;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 3, r), m, p, x, y, z);

  // floor planks, walls (soft sage), ceiling, baseboards
  const floorTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b98a5c'; g.fillRect(0, 0, w, h); const r = rng(4); for (let y = 0; y < h; y += 32) { g.fillStyle = `hsl(30,${36 + r() * 10}%,${46 + r() * 8}%)`; g.fillRect(0, y, w, 30); g.fillStyle = 'rgba(60,35,15,.4)'; g.fillRect(r() * w, y, 2, 30); } }, [4, 4]);
  const floor = mk(new THREE.PlaneGeometry(Dm.x1 - Dm.x0, Dm.z1 - Dm.z0), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }), root, 0, 0, (Dm.z0 + Dm.z1) / 2); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const wallM = mat(0xcfdcc8, 0.92), trim = mat(0xf6f2ea, 0.6);
  box(5.2, Dm.h, 0.1, wallM, 0, Dm.h / 2, Dm.z0 - 0.05); box(0.1, Dm.h, 5.1, wallM, Dm.x0 - 0.05, Dm.h / 2, 0.05); box(0.1, Dm.h, 5.1, wallM, Dm.x1 + 0.05, Dm.h / 2, 0.05);
  box(5.3, 0.08, 5.3, mat(0xf6f3ec, 0.95), 0, Dm.h + 0.04, 0.05);
  box(5.2, 0.1, 0.03, trim, 0, 0.05, Dm.z0 + 0.01); box(0.03, 0.1, 5.1, trim, Dm.x0 + 0.01, 0.05, 0.05); box(0.03, 0.1, 5.1, trim, Dm.x1 - 0.01, 0.05, 0.05);
  // rug
  const rugTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9dcc4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c46b5a'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.strokeStyle = '#5c7c84'; g.lineWidth = 5; g.strokeRect(34, 34, w - 68, h - 68); });
  const rug = mk(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 }), root, 0, 0.004, 0.4); rug.rotation.x = -Math.PI / 2; rug.castShadow = false; rug.receiveShadow = true;

  // the bed: frame, headboard (tufted), mattress, two pillows, a duvet group (lift it / fly it), a folded throw at the foot
  const B = DIMS.bed, T = DIMS.top, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2, bw = B.x1 - B.x0, bd = B.z1 - B.z0;
  const woodM = mat(0x7a5236, 0.5);
  rbox(bw + 0.1, 0.3, bd + 0.06, 0.03, woodM, cx, 0.2, cz);
  const head = rbox(bw + 0.2, 1.2, 0.1, 0.05, mat(0x3f5f7a, 0.85), cx, 0.6, B.z0 - 0.04);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) mk(new THREE.SphereGeometry(0.02, 8, 6), mat(0x2f4a60, 0.6), root, cx - 0.6 + i * 0.4, 0.85 + j * 0.25, B.z0 + 0.012);
  void head;
  rbox(bw, 0.22, bd, 0.06, mat(0xf6f3ee, 0.9), cx, T - 0.11, cz);
  const pillowM = mat(0xfbfaf6, 0.95);
  const pillows = DIMS.pillows.map(([x, z]) => { const p = rbox(0.62, 0.2, 0.42, 0.08, pillowM, x, T + 0.16, z - 0.05); p.rotation.x = -0.75; return p; });
  const duvet = new THREE.Group(); duvet.position.set(cx, T, -0.25); root.add(duvet);   // origin at the foot edge, top of the mattress
  const duvetTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2c46b'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.55)'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 32) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } }, [3, 3]);
  const duvetM = new THREE.MeshStandardMaterial({ map: duvetTex, roughness: 0.95 });
  const duvetBody = rbox(bw + 0.14, 0.3, 1.62, 0.14, duvetM, 0, 0.15, -0.81, duvet);
  const fold = rbox(bw + 0.16, 0.08, 0.24, 0.04, mat(0xfbfaf6, 0.9), 0, 0.29, -1.5, duvet);   // the turned-down sheet edge
  void duvetBody; void fold;
  const throwB = rbox(bw + 0.18, 0.06, 0.4, 0.03, mat(0x5c7c84, 0.9), cx, T + 0.03, B.z1 - 0.22); void throwB;

  // nightstands, lamps (warm), the alarm clock (right stand), a book + glasses (left), slippers
  const stands = DIMS.stands.map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); rbox(0.48, DIMS.standH, 0.42, 0.02, mat(0xe9e2d4, 0.6), 0, DIMS.standH / 2, 0, g); box(0.4, 0.015, 0.02, mat(0xb8a27a, 0.4), 0, DIMS.standH * 0.62, 0.21, g); return g; });
  const lamps = stands.map((g, i) => { const l = new THREE.Group(); l.position.set(i ? 0.1 : -0.1, DIMS.standH, -0.05); g.add(l); mk(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 16), mat(0xc96f4a, 0.5), l, 0, 0.11, 0); mk(new THREE.CylinderGeometry(0.12, 0.17, 0.2, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffd9a0, emissiveIntensity: 0.6, side: THREE.DoubleSide, roughness: 0.9 }), l, 0, 0.34, 0); return l; });
  const clock = new THREE.Group(); clock.position.set(-0.08, DIMS.standH, 0.08); stands[1].add(clock);
  rbox(0.16, 0.09, 0.07, 0.015, mat(0x2a2d31, 0.5), 0, 0.045, 0, clock);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.06), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#120a08'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff6a3a'; g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7:00', w / 2, h / 2 + 2); }) }));
  face.position.set(0, 0.047, 0.036); clock.add(face);
  box(0.16, 0.03, 0.22, mat(0x3d7bd9, 0.6), 0.08, DIMS.standH + 0.015, 0.05, stands[0]);
  const mug = mk(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 14), mat(0xf4f1ea, 0.4), stands[0], -0.12, DIMS.standH + 0.045, 0.1); void mug;
  for (const [x, z, c] of [[0.55, 0.05, 0x8fb6d6], [0.75, 0.0, 0x8fb6d6], [-0.7, 0.1, 0xe58fa6], [-0.5, 0.05, 0xe58fa6]]) rbox(0.11, 0.06, 0.26, 0.03, mat(c, 0.9), x, 0.03, z).rotation.y = (R() - 0.5) * 0.5;

  // window (right of the bed, back wall) with a morning sky + curtains; framed art over the headboard
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.3), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8cc0ec'); gr.addColorStop(0.7, '#f6e2c0'); gr.addColorStop(1, '#f4c890'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#7fa86a'; for (let x = 0; x < w; x += 18) { const hh = 30 + Math.sin(x * 0.07) * 14; g.beginPath(); g.arc(x, h - hh * 0.4, hh * 0.6, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(70, 60, 40, 14, 0, 0, 7); g.fill(); }) }));
  sky.position.set(1.85, 1.55, Dm.z0 - 0.02); root.add(sky);
  for (const [w, h, x, y] of [[1.5, 0.07, 1.85, 2.22], [1.5, 0.07, 1.85, 0.88], [0.07, 1.4, 1.13, 1.55], [0.07, 1.4, 2.57, 1.55], [0.04, 1.3, 1.85, 1.55]]) box(w, h, 0.06, trim, x, y, Dm.z0 + 0.02);
  const curtM = mat(0xf2e6d2, 0.9, { side: THREE.DoubleSide });
  const curtains = [-1, 1].map((s) => { const c = new THREE.Group(); c.position.set(1.85 + s * 0.78, 2.35, Dm.z0 + 0.1); root.add(c); for (let k = 0; k < 5; k++) mk(new THREE.CylinderGeometry(0.035, 0.05, 1.8, 8), curtM, c, s * 0.035 * k, -0.9, 0.015 * (k % 2)); return c; });
  box(1.9, 0.03, 0.03, mat(0xb8a27a, 0.4), 1.85, 2.37, Dm.z0 + 0.12);
  const artTex = canvasTex(320, 200, (g, w, h) => { g.fillStyle = '#f4ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8a05a'; g.beginPath(); g.arc(w * 0.7, h * 0.4, 34, 0, 7); g.fill(); g.fillStyle = '#5c7c84'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.35, h * 0.45); g.lineTo(w * 0.6, h); g.fill(); g.fillStyle = '#3f5f7a'; g.beginPath(); g.moveTo(w * 0.35, h); g.lineTo(w * 0.7, h * 0.55); g.lineTo(w, h); g.fill(); });
  const art = new THREE.Group(); art.position.set(cx, 1.62, Dm.z0 + 0.03); root.add(art);
  box(0.98, 0.64, 0.03, mat(0x2a2d31, 0.5), 0, 0, 0, art); mk(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.8 }), art, 0, 0, 0.017);

  // dresser + mirror (left wall), a chair with laundry, plants, a ceiling light
  const dr = new THREE.Group(); dr.position.set(Dm.x0 + 0.3, 0, -0.4); dr.rotation.y = Math.PI / 2; root.add(dr);
  rbox(1.2, 0.85, 0.5, 0.02, mat(0xe9e2d4, 0.6), 0, 0.425, 0, dr); for (let k = 0; k < 3; k++) box(1.1, 0.012, 0.01, mat(0xb8a27a, 0.5), 0, 0.25 + k * 0.25, 0.255, dr);
  box(0.7, 0.9, 0.03, mat(0x7a5236, 0.5), 0, 1.4, -0.2, dr); mk(new THREE.PlaneGeometry(0.62, 0.82), new THREE.MeshStandardMaterial({ color: 0xcfe0ec, roughness: 0.05, metalness: 0.9 }), dr, 0, 1.4, -0.18);
  for (let k = 0; k < 3; k++) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.12 + k * 0.04, 10), mat([0xe58fa6, 0x8fb6d6, 0xf2b632][k], 0.4), dr, -0.4 + k * 0.1, 0.91 + k * 0.02, 0.05);
  const chair = new THREE.Group(); chair.position.set(Dm.x1 - 0.55, 0, 0.6); chair.rotation.y = -Math.PI / 2 - 0.4; root.add(chair);
  rbox(0.5, 0.08, 0.5, 0.03, mat(0xc96f4a, 0.8), 0, 0.44, 0, chair); rbox(0.5, 0.55, 0.08, 0.03, mat(0xc96f4a, 0.8), 0, 0.75, -0.22, chair);
  for (const [x, z] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) box(0.04, 0.42, 0.04, woodM, x, 0.21, z, chair);
  rbox(0.46, 0.1, 0.4, 0.05, mat(0x6fa84f, 0.95), 0.02, 0.52, 0.02, chair).rotation.z = 0.08; rbox(0.3, 0.3, 0.06, 0.03, mat(0x3d7bd9, 0.95), 0, 0.8, -0.16, chair).rotation.z = -0.2;
  for (const [x, z, s] of [[Dm.x1 - 0.35, -2.1, 1.1], [Dm.x0 + 0.35, -2.1, 0.9]]) { const pl = new THREE.Group(); pl.position.set(x, 0, z); pl.scale.setScalar(s); root.add(pl); mk(new THREE.CylinderGeometry(0.17, 0.13, 0.32, 14), mat(0xe9e2d4, 0.5), pl, 0, 0.16, 0); for (let k = 0; k < 9; k++) mk(new THREE.SphereGeometry(0.16, 10, 8), mat(0x4f8a3f, 0.8), pl, Math.sin(k * 2.4) * 0.14, 0.45 + (k % 3) * 0.16, Math.cos(k * 2.4) * 0.14).scale.set(1, 1.4, 0.6); }
  mk(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d8, emissiveIntensity: 0.5 }), root, 0, Dm.h - 0.04, 0);

  // lights: warm morning sun through the window (sharp patch across the bed), sky hemi, a soft room fill
  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x8a6a4a, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9a8, 2.4); sun.position.set(3.4, 4.2, -6.5); sun.target.position.set(-0.2, 0.4, -1.0); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 }); sun.shadow.bias = -0.0004;
  const room = new THREE.PointLight(0xfff0dc, 3.0, 8, 1.4); room.position.set(0.2, 2.3, 0.8); root.add(room);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, duvet, pillows, clock, stands, lamps, curtains, art, lights: { hemi, sun, room } };
}
