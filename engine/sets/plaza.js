// SET: an equator plaza in the Andes (in the spirit of Quito's "Middle of the World" park) — stone paving with a painted yellow
// equator line + "LATITUD 0° 0' 0''" lettering, a tall stone monument topped by a bronze globe, colonial arcades with souvenir
// shops, colorful bunting, a fountain whose jets are exposed for animation (`jets[i]` = {x, z, h}), benches, potted plants,
// green Andes slopes with a snowy volcano behind, morning sun. Built for video 017 (gravity off: the ground spins east at
// 1,670 km/h, everyone keeps going straight, so the ground drops away beneath their feet).
//
// Coordinates (meters, y up). The equator line runs along x at z = 0 (DIMS.line). Monument at DIMS.monument (x 0, z −24).
// Fountain at DIMS.fountain. Arcades along z = −34 (back) and x = ±22 (sides). Camera usually at z ≈ +6…+10 looking −z.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
export const DIMS = { line: 0, monument: [0, -24], fountain: [-9, -9] };

export function buildPlaza(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 3);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xdfe8f0, 120, 900);
  const sky = makeSkyDome(0x3a7ed6, 0xe6eef4, 1000); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 10; i++) { const a = -PI * 0.2 - R() * PI * 0.6, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 700, 160 + R() * 120, Math.sin(a) * 700); root.add(cg); for (let k = 0; k < 5; k++) { const p = mk(new THREE.SphereGeometry(26 + R() * 20, 12, 8), cloudM, cg, (k - 2) * 30, R() * 10, R() * 16); p.scale.y = 0.45; p.castShadow = false; } }

  // paving + the line
  const paveT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#cbbfa8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(110,95,75,.4)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64 + (i % 2) * 8); g.lineTo(w, i * 64 + (i % 2) * 8); g.stroke(); } for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${R() * 0.06})`; g.fillRect(R() * w, R() * h, 3, 3); } }, [40, 40]);
  const pave = mk(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ map: paveT, roughness: 0.9 }), root, 0, 0, -10); pave.rotation.x = -PI / 2; pave.castShadow = false;
  const line = mk(new THREE.PlaneGeometry(140, 0.45), mat(0xf2c12e, 0.6), root, 0, 0.012, DIMS.line); line.rotation.x = -PI / 2; line.castShadow = false;
  const letT = canvasTex(1024, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2c12e'; g.font = 'bold 92px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("LATITUD 0° 0' 0''", w / 2, h / 2 + 4); });
  for (const x of [-14, 10]) { const l = mk(new THREE.PlaneGeometry(7, 0.9), new THREE.MeshStandardMaterial({ map: letT, transparent: true, roughness: 0.6 }), root, x, 0.013, DIMS.line + 0.9); l.rotation.x = -PI / 2; l.castShadow = false; }
  const nsT = (txt) => canvasTex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2c12e'; g.font = 'bold 90px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); });
  for (const [txt, z] of [['N', -2.2], ['S', 2.2]]) { const l = mk(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshStandardMaterial({ map: nsT(txt), transparent: true }), root, -3, 0.013, z); l.rotation.x = -PI / 2; l.castShadow = false; }

  // monument: stepped base, tapering stone tower, bronze globe with a gold equator band
  const stone = mat(0xb8ad98, 0.9), stone2 = mat(0xa89c86, 0.9), bronze = mat(0x8a6a3a, 0.4, { metalness: 0.6 });
  const mon = new THREE.Group(); mon.position.set(DIMS.monument[0], 0, DIMS.monument[1]); root.add(mon);
  for (let k = 0; k < 3; k++) box(14 - k * 2.4, 0.5, 14 - k * 2.4, k % 2 ? stone2 : stone, 0, 0.25 + k * 0.5, 0, mon);
  const tw = mk(new THREE.CylinderGeometry(3.2, 5.0, 26, 4, 1), stone, mon, 0, 14.5, 0); tw.rotation.y = PI / 4;
  mk(new THREE.BoxGeometry(5.2, 1.2, 5.2), stone2, mon, 0, 28, 0);
  const globe = mk(new THREE.SphereGeometry(3.4, 32, 20), bronze, mon, 0, 32.2, 0);
  const band = mk(new THREE.TorusGeometry(3.45, 0.18, 8, 48), mat(0xd8b04a, 0.3, { metalness: 0.8 }), mon, 0, 32.2, 0); band.rotation.x = PI / 2;
  const doorT = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#5a4632'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c12e'; g.font = 'bold 22px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('MUSEO', w / 2, 38); });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshStandardMaterial({ map: doorT })); door.position.set(0, 2.9, 4.0); mon.add(door);
  void globe;

  // colonial arcades with shops (back + sides)
  const wallC = [0xf2ead8, 0xf0d9b5, 0xe8c9a6, 0xf6efe2], tileM = mat(0xb5562e, 0.8), woodM = mat(0x6a4a30, 0.8);
  const shops = ['ARTESANÍAS', 'CAFÉ', 'CHOCOLATE', 'SOMBREROS', 'HELADOS', 'POSTALES'];
  function arcade(x, z, len, ry, k0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    box(len, 7, 6, mat(wallC[k0 % 4], 0.9), 0, 3.5, -3, g);
    const roof = box(len + 1, 0.4, 8.5, tileM, 0, 7.6, -2.2, g); roof.rotation.x = 0.12;
    for (let i = 0; i <= Math.floor(len / 4); i++) { const px = -len / 2 + i * 4; box(0.5, 3.6, 0.5, mat(0xf6efe2, 0.8), px, 1.8, 1.2, g); }
    box(len, 0.5, 0.6, mat(0xf6efe2, 0.8), 0, 3.85, 1.2, g); box(len, 0.25, 2.4, mat(0xd9cdb4, 0.9), 0, 0.12, 0.1, g);
    for (let i = 0; i < Math.floor(len / 8); i++) {
      const sx = -len / 2 + 4 + i * 8, s = shops[(k0 + i) % shops.length];
      box(2.2, 2.8, 0.15, woodM, sx, 1.4, 0.02, g);
      const t = canvasTex(256, 64, (c, w, h) => { c.fillStyle = ['#2f6aa8', '#b5562e', '#2f7a3a', '#6a2f8a'][(k0 + i) % 4]; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 34px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, w / 2, h / 2 + 2); });
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); sg.position.set(sx, 3.25, 0.05); g.add(sg);
      for (let k = 0; k < 3; k++) box(0.6, 0.6, 0.6, mat([0xd2483f, 0xf2b632, 0x3d7bd9, 0x58b368][(i + k) % 4], 0.8), sx - 1.8 + k * 0.6, 0.3, 0.6, g);
      for (const wx of [-2.6, 2.6]) box(1.2, 1.4, 0.1, mat(0x9ec4e6, 0.2), sx + wx, 5.0, 0.05, g);
    }
  }
  arcade(0, -36, 60, 0, 0); arcade(-26, -8, 44, PI / 2, 1); arcade(26, -8, 44, -PI / 2, 2);
  // bunting between the side arcades (zigzag of little flags)
  const flagC = [0xd2483f, 0xf2c12e, 0x2f6aa8, 0x58b368, 0xe58fa6, 0xffffff];
  for (const z of [-14, -4]) for (let i = 0; i < 40; i++) { const x = -22 + i * 1.1, y = 7.2 - 1.4 * Math.sin((i / 39) * PI); const f = mk(new THREE.ConeGeometry(0.28, 0.6, 3), mat(flagC[i % 6], 0.7, { side: THREE.DoubleSide }), root, x, y - 0.3, z); f.rotation.x = PI; f.castShadow = false; }
  // fountain: round basin + the jets' nozzles; jets are animated by the video
  const [fx, fz] = DIMS.fountain;
  const fnt = new THREE.Group(); fnt.position.set(fx, 0, fz); root.add(fnt);
  mk(new THREE.CylinderGeometry(3.6, 3.8, 0.7, 32), stone, fnt, 0, 0.35, 0); const fw = mk(new THREE.CylinderGeometry(3.3, 3.3, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0x6fb5d8, roughness: 0.1, metalness: 0.2 }), fnt, 0, 0.6, 0); fw.castShadow = false;
  mk(new THREE.CylinderGeometry(0.5, 0.8, 1.6, 12), stone2, fnt, 0, 0.9, 0);
  const jets = [{ x: fx, z: fz, h: 1.7 }]; for (let k = 0; k < 6; k++) jets.push({ x: fx + Math.cos(k * PI / 3) * 2.2, z: fz + Math.sin(k * PI / 3) * 2.2, h: 0.65 });
  // benches, planters, lamp posts
  for (const [x, z, ry] of [[12, -6, -PI / 2], [-16, -14, PI / 2], [6, -18, 0]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(2.2, 0.1, 0.6, woodM, 0, 0.48, 0, g); box(2.2, 0.5, 0.08, woodM, 0, 0.8, -0.28, g); for (const sx of [-0.9, 0.9]) box(0.1, 0.48, 0.5, mat(0x2a2d31, 0.5), sx, 0.24, 0, g); }
  for (const [x, z] of [[-6, -20], [6, -20], [-18, 4], [18, 4], [15, -26], [-15, -26]]) { mk(new THREE.CylinderGeometry(0.8, 0.6, 0.8, 12), mat(0xb5672e, 0.8), root, x, 0.4, z); for (let k = 0; k < 5; k++) { const b = mk(new THREE.SphereGeometry(0.5, 8, 6), mat([0x4f8a3f, 0xd2483f, 0xe58fa6][k % 3], 0.8), root, x + Math.cos(k) * 0.3, 1.0 + (k % 2) * 0.3, z + Math.sin(k) * 0.3); b.castShadow = false; } }
  for (const [x, z] of [[-12, 3], [12, 3], [-12, -18], [12, -18]]) { mk(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), mat(0x2a2d31, 0.5), root, x, 2.1, z); mk(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffe0a0, emissiveIntensity: 0.3 }), root, x, 4.3, z); }
  // the Andes: green ridges + a snowy volcano
  const ridgeM = [mat(0x5f8a4a, 1), mat(0x6f9a52, 1), mat(0x7f9a6a, 1)];
  for (let i = 0; i < 18; i++) { const a = -PI * 0.12 - (i / 18) * PI * 0.76, d = 380 + R() * 160; const h = mk(new THREE.SphereGeometry(110 + R() * 80, 16, 10), ridgeM[i % 3], root, Math.cos(a) * d, -40, Math.sin(a) * d); h.scale.y = 0.6 + R() * 0.3; h.castShadow = false; }
  const vol = new THREE.Group(); vol.position.set(150, -20, -620); root.add(vol);
  mk(new THREE.ConeGeometry(260, 300, 28), mat(0x7a7a72, 1), vol, 0, 150, 0); mk(new THREE.ConeGeometry(92, 106, 28), mat(0xf6f8fa, 0.8), vol, 0, 248, 0);
  vol.traverse((o) => { if (o.isMesh) o.castShadow = false; });

  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x8a7a5a, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.7); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004;
  function aimSun(cx = 0, cz = -6, half = 22) { sun.target.position.set(cx, 0, cz); sun.position.set(cx + 50, 80, cz + 45); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 260 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, fog, sky, jets, aimSun, monument: mon, lights: { hemi, sun } };
}
