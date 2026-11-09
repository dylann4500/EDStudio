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
  gr.addColorStop(0, '#4f9fe8'); gr.addColorStop(0.55, '#86c2f2'); gr.addColorStop(1, '#d4ebfb'); sg.fillStyle = gr; sg.fillRect(0, 0, 4, 256);
  const skyT = new THREE.CanvasTexture(sc); skyT.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; root.add(sky);
  const cm = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xc8dcf0, emissiveIntensity: 0.55 });
  for (let i = 0; i < 18; i++) { const c = new THREE.Group(), side = i % 2 ? 1 : -1, x = -150 + (i * 37) % 300, z = side * (110 + (i * 13) % 50), y = 34 + (i * 7) % 16; for (let k = 0; k < 4; k++) box(8 + k * 2, 3, 6, cm, (k - 1.5) * 5, (k % 2) * 2.5, (k % 3) - 1, c); c.position.set(x, y, z); root.add(c); }
  // the pixel sun (a camera-facing sprite the shot places in its sky: setSun(dirFromCamera))
  const sunT = pixelTex(24, 24, (g) => { g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(12, 12, 11, 0, 7); g.fill(); g.fillStyle = '#f7cf3c'; g.beginPath(); g.arc(12, 12, 9, 0, 7); g.fill(); }, { k: 4 });
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunT, fog: false, depthWrite: false, toneMapped: false })); sunS.scale.setScalar(18); sunS.renderOrder = -1; root.add(sunS);
  // beach huts on stilts along the shore (pastel walls, red / blue pyramid roofs) + dunes + grass
  const hutCols = [[0x86b3e0, 0xd0453a], [0x9fd0b4, 0x3d6fb8], [0xe8d9a8, 0xd0453a], [0x7fb8c8, 0x3d6fb8], [0xd9a0a0, 0x3d6fb8], [0xa8c88f, 0xd0453a]];
  const post = lam(pixelTex(8, 8, (g, w, h) => speckle(g, w, h, '#8a6a4a', ['#7a5a3c', '#9a7a58'], 12, 3), { k: 1 }));
  for (let i = 0; i < 12; i++) {
    const side = i < 8 ? 1 : -1, x = side > 0 ? -28 + i * 8 + ((i * 3) % 3) : -22 + (i - 8) * 14, z = side > 0 ? 15 + (i % 3) * 1.6 : -26 - (i % 2) * 3, [wc, rc] = hutCols[i % hutCols.length];
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side > 0 ? Math.PI : 0; root.add(g);
    for (const [px, pz] of [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]]) box(0.2, 1.6, 0.2, post, px, 0.8, pz, g);
    box(3, 0.2, 2.6, post, 0, 1.7, 0, g);
    const wm = lam(pixelTex(16, 16, (g2, w, h) => { g2.fillStyle = '#' + new THREE.Color(wc).getHexString(); g2.fillRect(0, 0, w, h); g2.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 3; y < h; y += 4) g2.fillRect(0, y, w, 1); }, { k: 1 }));
    box(2.6, 2.0, 2.2, wm, 0, 2.8, 0, g); box(0.7, 1.2, 0.05, lam(pixelTex(4, 8, (g2) => { g2.fillStyle = '#3a3a48'; g2.fillRect(0, 0, 4, 8); }, { k: 1 })), 0, 2.5, 1.12, g);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.3, 4), new THREE.MeshLambertMaterial({ color: rc })); roof.rotation.y = Math.PI / 4; roof.position.set(0, 4.45, 0); roof.castShadow = true; g.add(roof);
  }
  const duneM = lam(sand);
  for (const [x, z, r, h] of [[-14, -14, 9, 2.6], [12, -16, 11, 3.0], [-30, -8, 12, 3.4], [30, -6, 10, 2.8], [-20, 10, 8, 1.6], [22, 9, 9, 1.8]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), duneM); d.scale.y = h / r; d.position.set(x, -0.05, z); d.receiveShadow = true; root.add(d); }
  for (let i = 0; i < 70; i++) { const ang = i * 2.39996, rr = 3 + (i * 0.37) % 1 * 14 + (i % 7) * 1.6, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr * 0.8 + 3; if (Math.abs(x) < 1.6 && Math.abs(z - 2) < 3) continue; const q = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), grassM); q.position.set(x, 0.42, z); q.rotation.y = i; root.add(q); const q2 = q.clone(); q2.rotation.y = i + Math.PI / 2; root.add(q2); }

  // ---- light: bright midday sun from the front-left (her face lit), cool sky bounce
  const hemi = new THREE.HemisphereLight(0xdcecff, 0xf0dcae, 1.45); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.0); sun.position.set(-6, 12, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 60 }); sun.target.position.set(0, 0, -2); root.add(sun, sun.target);
  scene.background = new THREE.Color(0x4a92ee);
  studio.camera.far = Math.max(studio.camera.far, 700); studio.camera.updateProjectionMatrix();
  // mood: 0 = midday, 1 = sunset (violet top, tangerine horizon, a low warm sun from the sea side)
  const SKY = [['#4f9fe8', '#86c2f2', '#d4ebfb'], ['#5a3a8a', '#e0708a', '#ffc070']];
  const mixC = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  let moodK = -1;
  function setMood(k) {
    if (Math.abs(k - moodK) < 1e-3) return; moodK = k;
    const g2 = sg.createLinearGradient(0, 0, 0, 256); [0, 0.55, 1].forEach((u, i) => g2.addColorStop(u, mixC(SKY[0][i], SKY[1][i], k))); sg.fillStyle = g2; sg.fillRect(0, 0, 4, 256); skyT.needsUpdate = true;
    sun.color.set(mixC('#fff3e0', '#ff9a5a', k)); sun.intensity = 2.0 - 0.6 * k; sun.position.set(-6 + 2 * k, 12 - 7 * k, 10 + 6 * k);
    hemi.color.set(mixC('#cfe4ff', '#c7a0d8', k)); hemi.groundColor.set(mixC('#e8d3a3', '#e0a070', k)); hemi.intensity = 1.45 - 0.3 * k;
    cm.emissive.set(mixC('#9ab4d8', '#ff9a7a', k));
  }
  /** place the pixel sun in the sky relative to the camera: dir = direction from the camera (world), at 250 m */
  const setSun = (camPos, dir) => { sunS.position.copy(camPos).addScaledVector(dir.clone().normalize(), 250).sub(root.position); };
  // night (064, "3 AM"): navy sky, stars, the pixel sun swaps for a pale moon, moonlight + a low violet bounce. setNight(0) = day.
  const moonT = pixelTex(24, 24, (g) => { g.fillStyle = '#f2f0ff'; g.beginPath(); g.arc(12, 12, 11, 0, 7); g.fill(); g.fillStyle = '#c9c6e0'; for (const [x, y, r] of [[8, 9, 2.5], [15, 14, 3], [10, 16, 1.6], [16, 7, 1.4]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }, { k: 4 });
  const starPos = []; for (let i = 0; i < 700; i++) { const a = i * 2.39996, e = 0.15 + ((i * 0.618) % 1) * 1.25; starPos.push(Math.cos(a) * Math.cos(e) * 280, Math.sin(e) * 280, Math.sin(a) * Math.cos(e) * 280); }
  const starG = new THREE.BufferGeometry(); starG.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 5, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false })); stars.visible = false; stars.renderOrder = -1; root.add(stars);
  const NIGHT = ['#060a20', '#121b46', '#2a3870'];
  let nightK = -1;
  function setNight(k) {
    if (Math.abs(k - nightK) < 1e-3) return; nightK = k; moodK = -1;
    const g2 = sg.createLinearGradient(0, 0, 0, 256); [0, 0.55, 1].forEach((u, i) => g2.addColorStop(u, mixC(SKY[0][i], NIGHT[i], k))); sg.fillStyle = g2; sg.fillRect(0, 0, 4, 256); skyT.needsUpdate = true;
    sun.color.set(mixC('#fff3e0', '#a8b8ff', k)); sun.intensity = 2.0 - 0.75 * k;
    hemi.color.set(mixC('#dcecff', '#5a5a9a', k)); hemi.groundColor.set(mixC('#f0dcae', '#3a2a40', k)); hemi.intensity = 1.45 - 0.7 * k;
    cm.emissive.set(mixC('#c8dcf0', '#2a3060', k)); cm.color.set(mixC('#ffffff', '#5a6290', k));
    stars.visible = k > 0.5; sunS.material.map = k > 0.5 ? moonT : sunT; sunS.material.needsUpdate = true; sunS.scale.setScalar(k > 0.5 ? 14 : 18);
  }
  return { root, sun, hemi, house: H, DIMS, setMood, setSun, setNight, sunSprite: sunS };
}
