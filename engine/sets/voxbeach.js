// Voxel beach (054 goth cheat-tutor): the pixel-art beach of the user's benchmark image — a blue clapboard beach house with a
// white porch railing, a grey picket fence, blocky sand dunes with beach grass, the sea, a deep-blue sky with block clouds.
// Built from boxes + crisp pixel textures (engine/pixeltex.js) so it reads as a voxel world under engine/pixel.js.
//   const B = buildVoxBeach(studio);  B.root (origin = where the character stands; she faces +z, the house is behind her at −z)
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';

export const DIMS = { stand: [0, 0], houseZ: -3.2, porchY: 0.5 };

export function buildVoxBeach(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const lam = (map, extra = {}) => new THREE.MeshLambertMaterial({ map, ...extra });
  const box = (w, h, d, m, x, y, z, parent = root) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b; };

  // ---- textures
  const sand = pixelTex(32, 32, (g, w, h) => speckle(g, w, h, '#e7cf94', ['#dcc183', '#f0dca8', '#d4b877', '#efd9a0'], 260, 3), { repeat: [24, 24], k: 1 });
  const siding = pixelTex(32, 32, (g, w, h) => { g.fillStyle = '#6f93c4'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { g.fillStyle = '#5a7cad'; g.fillRect(0, y + 6, w, 2); g.fillStyle = '#86a8d6'; g.fillRect(0, y, w, 1); } }, { repeat: [5, 4], k: 1 });
  const white = pixelTex(8, 8, (g, w, h) => speckle(g, w, h, '#f1efe9', ['#e2e0da', '#fbfaf6'], 10, 5), { k: 1 });
  const grey = pixelTex(8, 16, (g, w, h) => speckle(g, w, h, '#bdbdb8', ['#a9a9a4', '#cfcfca'], 20, 7), { k: 1 });
  const deck = pixelTex(32, 32, (g, w, h) => { g.fillStyle = '#b7a58c'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { g.fillStyle = '#9c8a72'; g.fillRect(x + 7, 0, 1, h); } }, { repeat: [3, 1], k: 1 });
  const sea = pixelTex(32, 32, (g, w, h) => { speckle(g, w, h, '#3d8fd0', ['#4aa0dd', '#3483c4', '#5bb0e6'], 160, 9); for (let i = 0; i < 6; i++) { g.fillStyle = '#d8f0ff'; g.fillRect((i * 11) % w, (i * 7) % h, 4, 1); } }, { repeat: [30, 8], k: 1 });
  const grass = pixelTex(16, 16, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#6f8f4c' : '#86a75a'; const x = 1 + i * 1.7; g.fillRect(x, 4 + (i * 5) % 7, 1, 12 - (i * 5) % 7); } }, { k: 1 });

  // ---- ground: sand + dunes, the sea beyond a foam line
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), lam(sand)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 160), lam(sea)); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.02, 98); root.add(water);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.8), new THREE.MeshLambertMaterial({ color: 0xeef8ff })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, 0.03, 18.2); root.add(foam);
  const sandM = lam(sand);
  for (const [x, z, w, d, h] of [[-7, -1, 4, 3, 0.5], [-9.5, -2.5, 3, 3, 0.9], [7.5, -1.5, 4, 3, 0.6], [10, 1, 3, 4, 0.4], [-6, 4, 3, 2, 0.3]]) box(w, h, d, sandM, x, h / 2, z);
  const grassM = new THREE.MeshLambertMaterial({ map: grass, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 22; i++) { const x = (i % 2 ? -1 : 1) * (4.5 + (i * 1.37) % 6), z = -4 + (i * 2.3) % 7, q = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), grassM); q.position.set(x, 0.3 + (Math.abs(x) > 6.5 ? 0.5 : 0), z); q.rotation.y = i; root.add(q); }

  // ---- the beach house behind her (blue clapboard, white trim + porch railing on a deck)
  const H = new THREE.Group(); H.position.set(1.4, 0, DIMS.houseZ); root.add(H);
  box(8, 4.4, 4, lam(siding), 1.5, 2.2 + DIMS.porchY, -2.6, H);
  box(8.4, 0.25, 4.4, lam(white), 1.5, 4.75 + DIMS.porchY, -2.6, H);                   // eave
  box(9, 0.5, 2.6, lam(deck), 0.8, DIMS.porchY / 2, 0.6, H);                            // porch deck
  const wm = lam(white);
  for (let x = -3.6; x <= 5.2; x += 0.2) box(0.07, 0.9, 0.07, wm, x, DIMS.porchY + 0.45, 1.85, H);  // balusters
  box(9, 0.09, 0.14, wm, 0.8, DIMS.porchY + 0.92, 1.85, H); box(9, 0.07, 0.1, wm, 0.8, DIMS.porchY + 0.08, 1.85, H);
  for (const x of [-3.7, -0.2, 3.2, 5.25]) box(0.16, 3.6, 0.16, wm, x, DIMS.porchY + 1.8, 1.85, H);   // porch posts
  box(9.2, 0.18, 2.8, wm, 0.8, DIMS.porchY + 3.7, 0.6, H);                                           // porch roof
  // windows (dark glass + white frames) + a door
  const glass = new THREE.MeshLambertMaterial({ color: 0x2a3d55 });
  for (const x of [-1.2, 3.6]) { box(1.3, 1.3, 0.06, wm, x, 2.3, -0.58, H); box(1.1, 1.1, 0.08, glass, x, 2.3, -0.56, H); }
  box(1.0, 2.1, 0.08, lam(white), 1.2, DIMS.porchY + 1.05, -0.56, H);

  // ---- grey picket fence running off to the left
  const gm = lam(grey);
  for (let i = 0; i < 30; i++) box(0.12, 1.1 + (i % 2) * 0.08, 0.05, gm, -3.2 - i * 0.22, 0.55, -1.6);
  box(6.8, 0.08, 0.05, gm, -6.4, 0.8, -1.62); box(6.8, 0.08, 0.05, gm, -6.4, 0.3, -1.62);

  // ---- sky: a deep blue gradient dome + block clouds
  const sc = document.createElement('canvas'); sc.width = 4; sc.height = 256; const sg = sc.getContext('2d'), gr = sg.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#1f63d8'); gr.addColorStop(0.55, '#4a92ee'); gr.addColorStop(1, '#9cc8f5'); sg.fillStyle = gr; sg.fillRect(0, 0, 4, 256);
  const skyT = new THREE.CanvasTexture(sc); skyT.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; root.add(sky);
  const cm = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x9ab4d8, emissiveIntensity: 0.35 });
  for (let i = 0; i < 9; i++) { const c = new THREE.Group(), x = -90 + i * 23, z = -120 + (i % 3) * 25, y = 40 + (i * 7) % 18; for (let k = 0; k < 4; k++) box(10 + k * 2, 3, 6, cm, (k - 1.5) * 6, (k % 2) * 2.5, 0, c); c.position.set(x, y, z); root.add(c); }

  // ---- light: bright midday sun from the front-left (her face lit), cool sky bounce
  const hemi = new THREE.HemisphereLight(0xcfe4ff, 0xe8d3a3, 1.2); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.0); sun.position.set(-6, 12, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 60 }); sun.target.position.set(0, 0, -2); root.add(sun, sun.target);
  scene.background = new THREE.Color(0x4a92ee);
  studio.camera.far = Math.max(studio.camera.far, 700); studio.camera.updateProjectionMatrix();
  return { root, sun, hemi, house: H, DIMS };
}
