// SET: a doctor's exam room — padded exam table with a paper roll and a pull-out step, cabinets + sink + glove boxes, a window
// with blinds, an eye chart, a blood-pressure cuff, a hand-washing poster, a rolling stool, a sharps box, and an open door at the
// back right onto a bright hallway (colleagues can crowd it). Built for video 022.
// Coordinates (meters, y up): room x∈[-2.2, 2.2], z∈[-2.0, 2.6], ceiling 2.7. Exam table along x at DIMS.table (top DIMS.top);
// a patient sits on its front edge (z ≈ DIMS.table[1] + 0.32) facing +z. Door opening x∈[1.0, 1.95] in the back wall (z = -2).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { table: [-0.15, -0.95], top: 0.82, door: [1.48, -2.0], stool: [0.9, 0.2] };

export function buildClinic(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const R = rng(opts.seed ?? 12);
  const X0 = -2.2, X1 = 2.2, Z0 = -2.0, Z1 = 2.6, HH = 2.7;

  // floor (speckled vinyl), walls (pale mint), ceiling with light panels
  const vinyl = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d9d6cc'; g.fillRect(0, 0, w, h); const r = rng(1); for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,100,110,.18)' : 'rgba(255,255,255,.3)'; g.fillRect(r() * w, r() * h, 2, 2); } }, [4, 4]);
  const fl = mk(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshStandardMaterial({ map: vinyl, roughness: 0.45 }), root, 0, 0, (Z0 + Z1) / 2); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
  const wallM = mat(0xc6ddcf, 0.9), trim = mat(0xf4f4f2, 0.6);
  box(0.1, HH, Z1 - Z0, wallM, X0 - 0.05, HH / 2, (Z0 + Z1) / 2); box(0.1, HH, Z1 - Z0, wallM, X1 + 0.05, HH / 2, (Z0 + Z1) / 2);
  // back wall with a door opening x∈[1.0,1.95]
  box(1.0 - X0, HH, 0.1, wallM, (X0 + 1.0) / 2, HH / 2, Z0 - 0.05); box(X1 - 1.95, HH, 0.1, wallM, (1.95 + X1) / 2, HH / 2, Z0 - 0.05); box(0.95, HH - 2.15, 0.1, wallM, 1.475, 2.15 + (HH - 2.15) / 2, Z0 - 0.05);
  for (const x of [0.97, 1.98]) box(0.06, 2.18, 0.14, trim, x, 1.09, Z0 - 0.04); box(1.07, 0.06, 0.14, trim, 1.475, 2.16, Z0 - 0.04);
  const door = new THREE.Group(); door.position.set(1.95, 0, Z0 - 0.08); root.add(door);   // hinge at the right jamb, swung open into the hallway
  rbox(0.92, 2.1, 0.05, 0.01, mat(0xb88a5a, 0.55), -0.46, 1.05, 0, door); door.rotation.y = 1.6;
  // hallway beyond: bright, a handrail, a far wall
  box(4, 0.02, 3, mat(0xd9d6cc, 0.45), 1.5, 0.0, Z0 - 1.6); box(4, HH, 0.1, mat(0xcfe0ea, 0.9), 1.5, HH / 2, Z0 - 2.4);
  mk(new THREE.CylinderGeometry(0.025, 0.025, 4, 8), mat(0xb8bcc2, 0.3, { metalness: 0.6 }), root, 1.5, 0.95, Z0 - 2.3).rotation.z = Math.PI / 2;
  const hallL = new THREE.PointLight(0xf4f8ff, 3.5, 5, 1.6); hallL.position.set(1.5, 2.3, Z0 - 1.4); root.add(hallL);
  box(X1 - X0, 0.06, Z1 - Z0, mat(0xf4f4f2, 0.95), 0, HH + 0.03, (Z0 + Z1) / 2);
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8ff).multiplyScalar(1.0), toneMapped: false });
  for (const [x, z] of [[-0.8, -0.6], [0.8, -0.6], [-0.8, 1.2], [0.8, 1.2]]) box(0.6, 0.01, 0.6, panelM, x, HH - 0.005, z);
  // exam table: base cabinet, padded teal top (head end raised), paper roll strip, pull-out step
  const [tx, tz] = DIMS.table, T = DIMS.top;
  rbox(1.75, T - 0.12, 0.6, 0.03, mat(0xe8e4dc, 0.6), tx, (T - 0.12) / 2, tz);
  rbox(1.9, 0.1, 0.7, 0.04, mat(0x3f8a8a, 0.55), tx, T - 0.05, tz);
  const head = rbox(0.6, 0.1, 0.7, 0.04, mat(0x3f8a8a, 0.55), tx - 0.82, T + 0.12, tz); head.rotation.z = -0.5;
  box(1.6, 0.004, 0.5, mat(0xfbfaf6, 0.9), tx + 0.1, T + 0.003, tz);
  mk(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 14), mat(0xfbfaf6, 0.9), root, tx + 0.98, T - 0.04, tz).rotation.x = Math.PI / 2;
  rbox(0.5, 0.06, 0.3, 0.02, mat(0xb8bcc2, 0.4, { metalness: 0.5 }), tx + 0.2, 0.32, tz + 0.42);
  for (let i = 0; i < 3; i++) rbox(0.4, 0.14, 0.02, 0.01, mat(0xd8d4cc, 0.6), tx - 0.45 + i * 0.45, 0.45, tz + 0.305);
  // left wall: cabinets, counter, sink, glove boxes, jars, sharps box, paper towels
  const cab = mat(0xf2efe8, 0.6), ctr = mat(0x8a9aa4, 0.4);
  box(0.6, 0.88, 2.2, cab, X0 + 0.3, 0.44, 0.9); box(0.64, 0.04, 2.24, ctr, X0 + 0.32, 0.9, 0.9);
  box(0.36, 0.7, 2.2, cab, X0 + 0.18, 1.9, 0.9);
  for (let i = 0; i < 4; i++) box(0.01, 0.6, 0.5, mat(0xe2ddd2, 0.6), X0 + 0.605, 0.45, 0.1 + i * 0.55);
  mk(new THREE.CylinderGeometry(0.17, 0.15, 0.06, 20), mat(0xdfe3e6, 0.25, { metalness: 0.6 }), root, X0 + 0.32, 0.9, 1.5);
  mk(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), mat(0xc9ccd2, 0.25, { metalness: 0.8 }), root, X0 + 0.1, 1.05, 1.5);
  for (let i = 0; i < 3; i++) rbox(0.13, 0.08, 0.25, 0.01, mat([0x7fb6d6, 0xe58fa6, 0xf4f1ea][i], 0.6), X0 + 0.07, 1.62 + i * 0.09, 0.4);
  for (let i = 0; i < 3; i++) { mk(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 14), mat(0xcfe6f5, 0.05, { transparent: true, opacity: 0.6 }), root, X0 + 0.35, 1.0, 0.0 + i * 0.16); mk(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 14), mat(0xb8bcc2, 0.3, { metalness: 0.6 }), root, X0 + 0.35, 1.095, 0.0 + i * 0.16); }
  rbox(0.18, 0.26, 0.12, 0.02, mat(0xd2483f, 0.5), X0 + 0.1, 1.25, -0.4);
  // back wall dressing: a window with blinds (left), an eye chart (between), a BP cuff
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(220, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd0f0'); gr.addColorStop(1, '#e8f4f8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#7fae6a'; g.fillRect(0, h * 0.72, w, h * 0.28); for (let y = 0; y < h; y += 13) { g.fillStyle = 'rgba(244,244,242,.85)'; g.fillRect(0, y, w, 7); } }) }));
  win.position.set(-1.15, 1.6, Z0 + 0.001); root.add(win); box(1.18, 0.06, 0.06, trim, -1.15, 1.08, Z0 + 0.02); box(1.18, 0.06, 0.06, trim, -1.15, 2.12, Z0 + 0.02);
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.62), new THREE.MeshStandardMaterial({ roughness: 0.7, map: canvasTex(210, 310, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.textAlign = 'center';
    const rows = [['E', 70], ['F P', 46], ['T O Z', 34], ['L P E D', 26], ['P E C F D', 20], ['E D F C Z P', 15], ['F E L O P Z D', 12]];
    let y = 70; for (const [s, px] of rows) { g.font = `bold ${px}px Helvetica, Arial, sans-serif`; g.fillText(s, w / 2, y); y += px + 14; }
  }) }));
  chart.position.set(0.35, 1.55, Z0 + 0.002); root.add(chart);
  const cuff = new THREE.Group(); cuff.position.set(X1 - 0.02, 1.45, -0.9); root.add(cuff);
  rbox(0.05, 0.3, 0.22, 0.02, mat(0x3a3d42, 0.5), 0, 0, 0, cuff); mk(new THREE.CircleGeometry(0.07, 20), mat(0xf4f4f2, 0.4), cuff, -0.03, 0.04, 0).rotation.y = -Math.PI / 2;
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshStandardMaterial({ roughness: 0.7, map: canvasTex(200, 280, (g, w, h) => { g.fillStyle = '#e8f4fb'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6db5'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('WASH', w / 2, 50); g.fillText('YOUR', w / 2, 84); g.fillText('HANDS', w / 2, 118); g.fillStyle = '#f2c4a0'; g.beginPath(); g.ellipse(w / 2 - 28, 190, 26, 40, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2 + 28, 190, 26, 40, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(120,190,240,.7)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(50 + R() * 100, 150 + R() * 90, 6 + R() * 6, 0, 7); g.fill(); } }) }));
  poster.position.set(X1 - 0.002, 1.55, 0.6); poster.rotation.y = -Math.PI / 2; root.add(poster);
  // rolling stool, trash bin, coat hooks with a spare white coat
  const stool = new THREE.Group(); stool.position.set(DIMS.stool[0], 0, DIMS.stool[1]); root.add(stool);
  mk(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), mat(0x2a2d31, 0.5), stool, 0, 0.55, 0); mk(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), mat(0xb8bcc2, 0.3, { metalness: 0.6 }), stool, 0, 0.3, 0);
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; const l = mk(new THREE.BoxGeometry(0.03, 0.03, 0.26), mat(0x2a2d31, 0.5), stool, Math.sin(a) * 0.12, 0.06, Math.cos(a) * 0.12); l.rotation.y = a; }
  mk(new THREE.CylinderGeometry(0.15, 0.13, 0.36, 16), mat(0xd8d4cc, 0.6), root, X1 - 0.3, 0.18, 1.9);
  for (const z of [1.6, 1.9]) mk(new THREE.SphereGeometry(0.025, 8, 6), mat(0xb8bcc2, 0.3, { metalness: 0.6 }), root, X1 - 0.03, 1.75, z);
  rbox(0.08, 0.95, 0.42, 0.04, mat(0xfbfaf6, 0.85), X1 - 0.08, 1.25, 1.6);
  // lights
  const hemi = new THREE.HemisphereLight(0xf4f8ff, 0x8a8478, 0.5); root.add(hemi);
  const key = new THREE.SpotLight(0xfff6ea, 24, 0, 0.7, 0.5, 1.4); key.position.set(0.6, 2.6, 2.2); key.target.position.set(-0.1, 0.9, -0.9); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const fill = new THREE.PointLight(0xfff0e0, 2.2, 7, 1.4); fill.position.set(-1.4, 2.3, 1.2); root.add(fill);
  root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
  return { root, D: DIMS, door, stool, lights: { hemi, key, fill, hallL } };
}
