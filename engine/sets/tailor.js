// SET: an old-fashioned tailor's shop — a wall of fabric bolts in wooden cubbies, a round fitting pedestal, a three-way mirror,
// two dress forms in suit jackets (the right one can topple: `forms[i].pivot`), a rolling rack of suits (`rack`, from haul.js),
// a sewing table with a machine, a thread wall, a cutting table with scissors + chalk, a hanging ALTERATIONS sign.
// Built for video 022. Coordinates (meters, y up): room x∈[-3, 3], z∈[-2.5, 3], ceiling 3.0. The customer stands on the
// pedestal at DIMS.pedestal (top DIMS.pedY) facing +z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeClothesRack } from '@engine/haul.js';

export const DIMS = { pedestal: [0, -0.7], pedY: 0.2, rack: [1.25, -1.75], forms: [[-1.7, -1.75], [2.0, -1.35]] };

export function buildTailor(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const R = rng(opts.seed ?? 31);
  const X0 = -3, X1 = 3, Z0 = -2.5, Z1 = 3, HH = 3.0;

  const boards = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#8a5a34'; g.fillRect(0, 0, w, h); const r = rng(2); for (let y = 0; y < h; y += 32) { g.fillStyle = `hsl(25,${38 + r() * 10}%,${30 + r() * 9}%)`; g.fillRect(0, y, w, 30); } }, [3, 3]);
  const fl = mk(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshStandardMaterial({ map: boards, roughness: 0.55 }), root, 0, 0, (Z0 + Z1) / 2); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
  const paper = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(150,110,70,.12)'; g.fillRect(x, 0, 10, h); } }, [6, 3]);
  const wallM = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 });
  box(X1 - X0, HH, 0.1, wallM, 0, HH / 2, Z0 - 0.05); box(0.1, HH, Z1 - Z0, wallM, X0 - 0.05, HH / 2, (Z0 + Z1) / 2); box(0.1, HH, Z1 - Z0, wallM, X1 + 0.05, HH / 2, (Z0 + Z1) / 2);
  box(X1 - X0, 0.06, Z1 - Z0, mat(0xf2ead8, 0.95), 0, HH + 0.03, (Z0 + Z1) / 2);
  // fabric-bolt wall: wooden cubbies, each stuffed with 3–4 rolled bolts lying sideways
  const shelfM = mat(0x6a4024, 0.6), BOLTS = [0x2f3a4a, 0x6b5a48, 0x8a3a3a, 0x3f6a8a, 0xc9b48e, 0x2a4a3a, 0x7a5a8a, 0xb5462e, 0xd8cfb8, 0x45607a, 0x9a7a3a, 0x3a3d42];
  const CX = [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4], CY = [0.25, 0.85, 1.45, 2.05];
  for (const x of CX) for (const y of CY) {
    box(0.78, 0.04, 0.5, shelfM, x, y, Z0 + 0.25);
    for (let k = 0; k < 3 + (R() < 0.5 ? 1 : 0); k++) { const b = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.46, 14), mat(BOLTS[Math.floor(R() * BOLTS.length)], 0.85), root, x - 0.27 + k * 0.18, y + 0.11, Z0 + 0.27); b.rotation.x = Math.PI / 2; }
  }
  for (const x of [-2.8, -2.0, -1.2, -0.4, 0.4, 1.2, 2.0, 2.8]) box(0.04, 2.45, 0.5, shelfM, x, 1.22, Z0 + 0.25);
  box(5.7, 0.04, 0.5, shelfM, 0, 2.62, Z0 + 0.25);
  // fitting pedestal (round, carpeted top)
  const [px, pz] = DIMS.pedestal;
  mk(new THREE.CylinderGeometry(0.48, 0.52, DIMS.pedY, 32), mat(0x5a3a26, 0.5), root, px, DIMS.pedY / 2, pz);
  mk(new THREE.CylinderGeometry(0.47, 0.47, 0.012, 32), mat(0x8a2a34, 0.95), root, px, DIMS.pedY + 0.006, pz);
  // three-way mirror (left)
  const mirG = new THREE.Group(); mirG.position.set(-2.35, 0, -0.2); mirG.rotation.y = Math.PI / 2 - 0.1; root.add(mirG);
  const glass = mat(0xcfe0ea, 0.05, { metalness: 0.9 }), frame = mat(0xc9a25a, 0.35, { metalness: 0.6 });
  for (const [x, a] of [[-0.55, 0.45], [0, 0], [0.55, -0.45]]) { const p = new THREE.Group(); p.position.set(x, 0, Math.abs(x) * 0.2); p.rotation.y = a; mirG.add(p); rbox(0.56, 1.9, 0.05, 0.02, frame, 0, 1.05, 0, p); box(0.48, 1.8, 0.01, glass, 0, 1.05, 0.03, p); }
  // dress forms in jackets (pivot at the base so they can topple)
  const forms = DIMS.forms.map(([x, z], i) => {
    const pivot = new THREE.Group(); pivot.position.set(x, 0, z); root.add(pivot);
    mk(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 16), mat(0x2a2d31, 0.5), pivot, 0, 0.02, 0);
    mk(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), mat(0xc9a25a, 0.3, { metalness: 0.7 }), pivot, 0, 0.52, 0);
    const torso = mk(new THREE.CapsuleGeometry(0.17, 0.42, 6, 16), mat(i ? 0x3f6a8a : 0x6b5a48, 0.85), pivot, 0, 1.28, 0); torso.scale.set(1.15, 1, 0.75);
    mk(new THREE.SphereGeometry(0.05, 10, 8), mat(0xc9a25a, 0.3, { metalness: 0.7 }), pivot, 0, 1.66, 0);
    mk(new THREE.BoxGeometry(0.06, 0.24, 0.02), mat(0xf4f4f2, 0.8), pivot, 0, 1.4, 0.14);
    return { pivot };
  });
  // rack of suits
  const rack = makeClothesRack({ seed: 4 }); rack.g.position.set(DIMS.rack[0], 0, DIMS.rack[1]); rack.g.rotation.y = -0.15; root.add(rack.g);
  // sewing table + machine (right wall), thread wall
  const tbl = mat(0x7d4a2a, 0.5);
  rbox(1.2, 0.05, 0.6, 0.01, tbl, X1 - 0.35, 0.76, 0.9); for (const [dx, dz] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) box(0.04, 0.74, 0.04, tbl, X1 - 0.35 + dz, 0.37, 0.9 + dx);
  const sm = new THREE.Group(); sm.position.set(X1 - 0.4, 0.79, 0.9); sm.rotation.y = -Math.PI / 2; root.add(sm);
  rbox(0.42, 0.08, 0.2, 0.02, mat(0x2a2d31, 0.4), 0, 0.04, 0, sm); rbox(0.08, 0.24, 0.16, 0.02, mat(0x2a2d31, 0.4), 0.17, 0.2, 0, sm); rbox(0.4, 0.08, 0.14, 0.02, mat(0x2a2d31, 0.4), 0.0, 0.33, 0, sm);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), mat(0xd8d8d8, 0.3, { metalness: 0.7 }), sm, -0.17, 0.24, 0);
  const spoolM = [0xd2483f, 0x3d7bd9, 0xf2c14e, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f3a4a, 0xf4f1ea];
  box(0.04, 0.8, 1.3, shelfM, X1 - 0.02, 1.75, 1.9);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 10), mat(spoolM[(r * 3 + c) % spoolM.length], 0.7), root, X1 - 0.06, 1.45 + r * 0.14, 1.4 + c * 0.14).rotation.z = Math.PI / 2;
  // cutting table (front left) with a bolt unrolled, scissors, chalk
  rbox(1.4, 0.05, 0.8, 0.01, tbl, -1.9, 0.9, 1.6); for (const [dx, dz] of [[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]]) box(0.05, 0.88, 0.05, tbl, -1.9 + dx, 0.44, 1.6 + dz);
  box(1.2, 0.01, 0.6, mat(0x2f3a4a, 0.85), -1.9, 0.93, 1.6);
  for (const s of [-1, 1]) { const bl = mk(new THREE.BoxGeometry(0.2, 0.006, 0.025), mat(0xd8d8d8, 0.2, { metalness: 0.8 }), root, -1.7, 0.94, 1.5 + s * 0.012); bl.rotation.y = s * 0.15; }
  box(0.06, 0.012, 0.04, mat(0xf4f4f2, 0.8), -2.2, 0.94, 1.45);
  // hanging ALTERATIONS sign + a pendant lamp
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide, map: canvasTex(416, 102, (g, w, h) => { g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a25a'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#e8c76a'; g.font = 'bold 54px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ALTERATIONS', w / 2, h / 2 + 3); }) }));
  sign.position.set(0.95, 2.5, -2.2); root.add(sign);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 4), mat(0x333333, 0.5), root, 0.95 + s * 0.55, 2.83, -2.2);
  const shade = mk(new THREE.ConeGeometry(0.28, 0.22, 20, 1, true), mat(0x2a4a3a, 0.5, { side: THREE.DoubleSide }), root, 0.4, 2.55, 0.4); void shade;
  const bulb = mk(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c8).multiplyScalar(2), toneMapped: false }), root, 0.4, 2.47, 0.4); void bulb;
  // lights: warm shop light
  const hemi = new THREE.HemisphereLight(0xfff0dc, 0x5a4030, 0.9); root.add(hemi);
  const key = new THREE.SpotLight(0xfff0dc, 55, 0, 0.75, 0.5, 1.4); key.position.set(0.9, 2.85, 2.4); key.target.position.set(0, 1.0, -0.8); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const lamp = new THREE.PointLight(0xffe2b0, 4, 6, 1.5); lamp.position.set(0.4, 2.35, 0.4); root.add(lamp);
  root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
  return { root, D: DIMS, rack, forms, mirror: mirG, lights: { hemi, key, lamp } };
}
