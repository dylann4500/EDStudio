// PIPMART — dresses engine/sets/supermarket.js as "Sunny Market" for Pip ep. 4 (video 031, "What if Pip worked at the
// supermarket for one day?"). Additive: supermarket.js is untouched; dressMarket() adds to its root and returns handles.
//
//   const market = buildSupermarket(studio);  const M = dressMarket(studio, market);
//   Layout (the set's local meters): aisles 1-2-3 at x = −4, 0, 4 (shelves z −10…2), checkouts at x −5, −1.5, 2 (z 2.8…5.2),
//   a LOBBY at x 3…8, z 2.4…6 (the open floor right of the lanes), the glass FRONT wall at z = 6 with automatic doors at
//   x 4.4…6.6 (M.setDoors(0..1)), a sunny parking lot outside (M.setSunset(0..1) warms it), hanging aisle signs.
//   M.bin       — the open sausage cooler in aisle 3 (x 4, z −4.5; top of the pile at M.bin.topY): Pip sits ON it.
//   M.lane      — checkout 3 dressed on the x = 2 counter: belt (setBelt(m) scrolls it), scanner glass, bagging well,
//                 register screen (setScreen(n) lists n scanned "items"), lane light; M.lane.D = its key coordinates.
//   M.clock     — back-wall clock in aisle 3's sight line: setClock(h, m).
//   M.eotm      — EMPLOYEE OF THE MONTH board on the right wall (x 8): photoSlot (a group to pin the Polaroid into).
//   M.balloons  — a net of balloons under the lobby ceiling: update(t, tDrop) drops them (deterministic), M.balloons.LAND.
// Props: makeStaffVest(pip) (green working-dog vest with STAFF on both flanks, a top handle, a name badge: setBadge(k)),
// makeScanner() (handheld; setBeep(k) = red window flash + laser fan), makeShopCart(), makeHandBasket(), makePolaroidCam(),
// makePolaroid(tex) (setDevelop(k)), makeGroceries(parent, n) (instanced cans/boxes/bottles/oranges: set(i, pos, rx, ry, rz)),
// makeScentTrail(parent, n) (golden dotted ribbon: set(points, reveal, t)), makePumpkin(r).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';

const PI = Math.PI;
const FONT = 'Helvetica, Arial, sans-serif';
const textTex = (w, h, draw) => { const t = canvasTex(w, h, draw); t.anisotropy = 8; return t; };
const plane = (w, h, m, p, x, y, z, ry = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry; p.add(o); return o; };
const signM = (tex, glow = 0.35) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow });

// ---------------------------------------------------------------- the store
export function dressMarket(studio, market, o = {}) {
  const { scene } = studio;
  const root = market.root, R = rng(o.seed ?? 131);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const FZ = 6.0;                              // front wall plane
  const DOOR = { x0: 4.4, x1: 6.6, h: 2.55 };

  // the set's wireframe carts → hidden (we bring real ones)
  for (const c of [...root.children]) if (c.isGroup && c.children.some((m) => m.material && m.material.wireframe)) c.visible = false;

  // products get a printed label band (multiplies each instance's color)
  const label = canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,1)'; g.fillRect(0, h * 0.34, w, h * 0.3);
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, w, h * 0.1);
    g.fillStyle = '#f7f3e8'; g.fillRect(w * 0.12, h * 0.38, w * 0.76, h * 0.22);
    g.fillStyle = 'rgba(40,30,20,.55)'; g.fillRect(w * 0.2, h * 0.44, w * 0.6, h * 0.04); g.fillRect(w * 0.28, h * 0.51, w * 0.44, h * 0.03);
  });
  root.traverse((m) => { if (m.isInstancedMesh && m.count > 200 && m.geometry.type === 'BoxGeometry') { m.material.map = label; m.material.needsUpdate = true; } });

  // ---------------------------------------------------------------- floor details: entry mats, a warm tile band in the lobby
  const mat1 = mk(new THREE.PlaneGeometry(2.4, 1.4), mat(0x4a4f57, 0.95), root, 5.5, 0.004, 5.25); mat1.rotation.x = -PI / 2; mat1.receiveShadow = true;
  const matT = textTex(512, 256, (g, w, h) => { g.fillStyle = '#3d6b4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2c14e'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = '#f7efd8'; g.font = `bold 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WELCOME', w / 2, h / 2 + 4); });
  const mat2 = mk(new THREE.PlaneGeometry(1.8, 0.9), new THREE.MeshStandardMaterial({ map: matT, roughness: 0.95 }), root, 5.5, 0.006, 5.25); mat2.rotation.x = -PI / 2; mat2.rotation.z = PI; mat2.receiveShadow = true;

  // ---------------------------------------------------------------- the front: kick wall, big windows, header with a sign, automatic doors
  const wallM = mat(0xf1ede4, 0.9), frameM = mat(0x7d8691, 0.35, { metalness: 0.5 });
  const glassM = new THREE.MeshStandardMaterial({ color: 0xcfe6f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false });
  const front = new THREE.Group(); root.add(front);
  box(16.4, 4.4 - 2.95, 0.2, wallM, 0, 2.95 + (4.4 - 2.95) / 2, FZ + 0.1, front);
  // the kick wall stops at the door opening
  box(DOOR.x0 + 8.2, 0.45, 0.2, wallM, (-8.2 + DOOR.x0) / 2, 0.225, FZ + 0.1, front);
  box(8.2 - DOOR.x1, 0.45, 0.2, wallM, (8.2 + DOOR.x1) / 2, 0.225, FZ + 0.1, front);
  box(DOOR.x1 - DOOR.x0, 2.95 - DOOR.h, 0.24, frameM, (DOOR.x0 + DOOR.x1) / 2, (DOOR.h + 2.95) / 2, FZ + 0.1, front);   // door header box
  const win = (x0, x1) => {
    const g = plane(x1 - x0, 2.5, glassM, front, (x0 + x1) / 2, 1.7, FZ + 0.1); g.castShadow = false; g.receiveShadow = false; g.renderOrder = 2;
    for (let x = x0; x <= x1 + 1e-6; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 1.6))) box(0.06, 2.5, 0.12, frameM, x, 1.7, FZ + 0.1, front);
  };
  win(-8, DOOR.x0 - 0.06); win(DOOR.x1 + 0.06, 8);
  box(16, 0.06, 0.14, frameM, 0, 0.46, FZ + 0.1, front); box(16, 0.06, 0.14, frameM, 0, 2.95, FZ + 0.1, front);
  // window posters (stuck on the inside of the glass, readable from the store)
  const poster = (lines, bg, fg, w, h) => textTex(384, Math.round(384 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach(([t, s], i) => { g.font = `bold ${s}px ${FONT}`; g.fillText(t, W / 2, H * (i + 0.6) / (lines.length + 0.2)); }); });
  [[-6.6, ['FALL', 90], ['SALE!', 110], '#d2483f', '#fff6e0'], [-3.4, ['APPLES', 70], ['99¢/lb', 90], '#f2c14e', '#7a2a1a'], [0.6, ['PUMPKINS', 64], ['2 FOR $5', 84], '#f08a3a', '#fff6e0'], [7.2, ['FRESH', 74], ['BREAD', 92], '#3f8a4a', '#fff6e0']].forEach(([x, a, b, bg, fg]) => {
    plane(0.9, 1.15, new THREE.MeshStandardMaterial({ map: poster([a, b], bg, fg, 0.9, 1.15), roughness: 0.7 }), front, x, 1.25, FZ - 0.005, PI);
  });
  // inside the header: the store name
  const nameT = textTex(1024, 192, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(120, h / 2, 62, 0, 7); g.fill(); g.strokeStyle = '#f2c14e'; g.lineWidth = 9; for (let i = 0; i < 12; i++) { const a = i * PI / 6; g.beginPath(); g.moveTo(120 + Math.cos(a) * 72, h / 2 + Math.sin(a) * 72); g.lineTo(120 + Math.cos(a) * 88, h / 2 + Math.sin(a) * 88); g.stroke(); } g.fillStyle = '#fff6e0'; g.font = `bold 108px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SUNNY MARKET', 240, h / 2 + 6); });
  plane(4.2, 0.79, signM(nameT, 0.3), front, 5.5, 3.45, FZ - 0.01, PI);
  // outside face of the header: the same sign (seen through the doors from the lot)
  plane(4.2, 0.79, signM(nameT, 0.3), front, 5.5, 3.45, FZ + 0.215, 0);
  // automatic doors: two glass leaves that slide apart
  const leaves = [-1, 1].map((s) => {
    const g = new THREE.Group(); front.add(g);
    const w = (DOOR.x1 - DOOR.x0) / 2;
    const gl = plane(w - 0.06, DOOR.h - 0.08, glassM, g, 0, DOOR.h / 2, 0); gl.castShadow = false; gl.renderOrder = 2;
    box(w, 0.06, 0.06, frameM, 0, DOOR.h - 0.03, 0, g); box(w, 0.08, 0.06, frameM, 0, 0.04, 0, g);
    box(0.05, DOOR.h, 0.06, frameM, -w / 2 + 0.025, DOOR.h / 2, 0, g); box(0.05, DOOR.h, 0.06, frameM, w / 2 - 0.025, DOOR.h / 2, 0, g);
    const dot = mk(new THREE.CircleGeometry(0.06, 20), mat(0x3d6b4a, 0.5), g, 0, 1.3, -0.035); dot.rotation.y = PI;
    return { g, s, w };
  });
  const setDoors = (k) => leaves.forEach((L) => { const c = (DOOR.x0 + DOOR.x1) / 2 + L.s * L.w / 2; L.g.position.set(c + L.s * L.w * 0.95 * clamp(k), 0, FZ + 0.02); });
  setDoors(0);
  // WELCOME banner inside, over the lobby
  const welT = textTex(1024, 200, (g, w, h) => { g.fillStyle = '#f2c14e'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6b45'; g.font = `bold 120px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WELCOME!', w / 2, h / 2 + 8); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#d2483f' : '#3d7bd9'; g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 32, 26); g.lineTo(i * 64 + 64, 0); g.fill(); } });

  // ---------------------------------------------------------------- outside: sidewalk, parking lot, cars, lamp posts, trees, a painted horizon
  const out = new THREE.Group(); root.add(out);
  const lotT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#8a8d93'; g.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,40,46' : '200,200,205'},${0.05 + r() * 0.08})`; g.fillRect(r() * w, r() * h, 2, 2); } g.fillStyle = 'rgba(250,250,245,.85)'; for (let i = 0; i < 8; i++) g.fillRect(i * 64 + 2, 120, 5, 150); g.fillStyle = 'rgba(250,250,245,.85)'; g.fillRect(0, 118, w, 5); }, [6, 4]);
  const lot = mk(new THREE.PlaneGeometry(90, 60), new THREE.MeshStandardMaterial({ map: lotT, roughness: 0.92 }), out, 0, -0.01, FZ + 32); lot.rotation.x = -PI / 2;
  mk(new THREE.BoxGeometry(40, 0.12, 3.2), mat(0xd8d4cc, 0.9), out, 0, -0.055, FZ + 1.8);   // sidewalk, flush with the store floor
  box(40, 0.14, 0.18, mat(0xf2c14e, 0.6), 0, 0.02, FZ + 3.45, out);   // painted curb
  const carCols = [0xd2483f, 0x3d7bd9, 0xf4f1ea, 0x2f4f73, 0x58b368, 0xf2c14e, 0x9aa3ad, 0xa77bd1];
  const carM = carCols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35 }));
  const glass2 = new THREE.MeshStandardMaterial({ color: 0x2a3644, roughness: 0.15 }), tireM = mat(0x1c1c1e, 0.8);
  const car = (x, z, i, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; out.add(g);
    mk(new RoundedBoxGeometry(1.8, 0.62, 3.9, 3, 0.22), carM[i % carM.length], g, 0, 0.62, 0);
    mk(new RoundedBoxGeometry(1.56, 0.58, 2.0, 3, 0.22), carM[i % carM.length], g, 0, 1.14, -0.2);
    mk(new RoundedBoxGeometry(1.6, 0.4, 1.86, 2, 0.15), glass2, g, 0, 1.17, -0.2);
    for (const [wx, wz] of [[0.82, 1.25], [-0.82, 1.25], [0.82, -1.25], [-0.82, -1.25]]) mk(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 16), tireM, g, wx, 0.36, wz).rotation.z = PI / 2;
  };
  for (let i = 0; i < 14; i++) car(-12 + i * 2.7 + (i > 6 ? 2.2 : 0), FZ + 8.6 + (i % 3) * 0.15, i, PI + (i % 2) * 0.06);
  for (let i = 0; i < 12; i++) car(-10 + i * 2.7, FZ + 15.4, i + 3, (i % 2) * 0.05);
  const poleM = mat(0x5a626c, 0.4, { metalness: 0.4 }), leafM = [0x5aa04a, 0x4f8a3a, 0x6fb055].map((c) => mat(c, 0.85)), trunkM = mat(0x7a5a3a, 0.9);
  for (const x of [-9, 0, 9, 18]) { box(0.14, 6, 0.14, poleM, x, 3, FZ + 12, out); box(1.2, 0.12, 0.3, poleM, x, 6, FZ + 12, out); }
  for (let i = 0; i < 9; i++) { const x = -16 + i * 4.3, z = FZ + 3.0; mk(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 8), trunkM, out, x, 0.8, z); const c = mk(new THREE.SphereGeometry(0.9, 14, 10), leafM[i % 3], out, x, 2.2, z); c.scale.set(1, 1.15, 1); }
  // painted horizon (sky + far trees + rooftops) on a big curved card
  // painted horizon (sky + clouds + far rooftops + trees) on a tall curved card: v = 0 at y −9, the horizon (v 0.075) at y ≈ 0
  const skyT = canvasTex(2048, 1024, (g, w, h) => {
    const HZ = h * 0.925;
    const gr = g.createLinearGradient(0, 0, 0, HZ); gr.addColorStop(0, '#6fb0e8'); gr.addColorStop(0.7, '#a9d4f2'); gr.addColorStop(1, '#e4f0f2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(9);
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 16; i++) { const x = r() * w, y = h * 0.55 + r() * h * 0.3; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 34, y + (k % 2) * 10, 46 + r() * 20, 20 + r() * 8, 0, 0, 7); g.fill(); } }
    for (let i = 0; i < 26; i++) { g.fillStyle = ['#b9c4cc', '#c8d0d6', '#aab6c0'][i % 3]; const x = i * 82 + r() * 30, bw = 50 + r() * 70, bh = 14 + r() * 36; g.fillRect(x, HZ - bh, bw, bh); }
    g.fillStyle = '#5f8f55'; for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(i * 23 + r() * 10, HZ, 10 + r() * 9, 0, 7); g.fill(); }
    g.fillStyle = '#6f9a5c'; g.fillRect(0, HZ, w, h - HZ);
  });
  const skyMat = new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false });
  const sky = mk(new THREE.CylinderGeometry(70, 70, 120, 48, 1, true, -1.25, 2.5), skyMat, out, 0, 51, FZ + 2);
  sky.castShadow = false; sky.receiveShadow = false;
  const outLight = new THREE.DirectionalLight(0xffc48a, 0); outLight.position.set(-8, 7, FZ + 30); outLight.target.position.set(2, 0.8, FZ - 4); out.add(outLight, outLight.target);
  const setSunset = (k) => {
    skyMat.color.setRGB(lerp(1, 1.3, k), lerp(1, 0.82, k), lerp(1, 0.55, k));
    outLight.intensity = 2.4 * k;   // a low warm light through the front glass (unshadowed: sunset on faces)
  };
  setSunset(0);

  // ---------------------------------------------------------------- hanging aisle signs (double-sided, one per aisle) + department banners
  const AISLES = [[-4, '1', 'PRODUCE', 'BREAD'], [0, '2', 'CEREAL', 'SNACKS'], [4, '3', 'MEAT', 'DELI']];
  AISLES.forEach(([x, n, a, b]) => {
    const T = textTex(512, 220, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(100, h / 2, 74, 0, 7); g.fill(); g.fillStyle = '#2f6b45'; g.font = `bold 112px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 100, h / 2 + 6); g.fillStyle = '#fff6e0'; g.textAlign = 'left'; g.font = `bold 64px ${FONT}`; g.fillText(a, 196, h * 0.33); g.fillText(b, 196, h * 0.72); });
    const m = signM(T, 0.25);
    plane(1.5, 0.64, m, root, x, 3.05, 1.6, 0); plane(1.5, 0.64, m, root, x, 3.05, 1.598, PI);
    for (const s of [-1, 1]) box(0.015, 1.0, 0.015, frameM, x + s * 0.6, 3.85, 1.6);
  });

  // aisle-end (z = 2) panels: colourful SALE cards
  [-6, -2, 2, 6].forEach((x, i) => {
    const T = poster([[['SALE', 'NEW', 'YUM', 'SALE'][i], 96], [['2 for 1', 'FLAVOR!', 'DEALS', '$1.99'][i], 64]], ['#d2483f', '#3d7bd9', '#f08a3a', '#a77bd1'][i], '#fff6e0', 0.9, 1.1);
    plane(0.9, 1.1, new THREE.MeshStandardMaterial({ map: T, roughness: 0.7 }), root, x, 1.25, 2.04, 0);
  });

  // ---------------------------------------------------------------- aisle 3: the open sausage cooler (Pip's post)
  const bin = new THREE.Group(); bin.position.set(4, 0, -4.5); root.add(bin);
  const BW = 1.0, BL = 1.7, BH = 0.6;
  const enamel = mat(0xf4f6f8, 0.35), stripeM = mat(0xd2483f, 0.5), chromeM = new THREE.MeshStandardMaterial({ color: 0xd6dade, roughness: 0.25, metalness: 0.8 });
  mk(new RoundedBoxGeometry(BW, BH - 0.06, BL, 3, 0.04), enamel, bin, 0, (BH - 0.06) / 2, 0);
  for (const s of [-1, 1]) { box(0.005, 0.1, BL - 0.1, stripeM, s * (BW / 2 + 0.002), 0.34, 0, bin); box(BW - 0.1, 0.1, 0.005, stripeM, 0, 0.34, s * (BL / 2 + 0.002), bin); }
  box(BW + 0.02, 0.03, 0.03, chromeM, 0, BH - 0.04, BL / 2, bin); box(BW + 0.02, 0.03, 0.03, chromeM, 0, BH - 0.04, -BL / 2, bin);
  box(0.03, 0.03, BL, chromeM, BW / 2, BH - 0.04, 0, bin); box(0.03, 0.03, BL, chromeM, -BW / 2, BH - 0.04, 0, bin);
  box(BW - 0.06, 0.02, BL - 0.06, mat(0xbcc8d2, 0.4), 0, BH - 0.07, 0, bin);
  box(BW - 0.06, 0.08, 0.06, mat(0x2a2d31, 0.6), 0, 0.04, BL / 2 - 0.03, bin);   // kick plate
  // sausage packs: white trays + 4 links each, piled into a low mound
  const packs = [];
  for (let iz = 0; iz < 8; iz++) for (let ix = 0; ix < 4; ix++) for (let L = 0; L < 2; L++) {
    if (L === 1 && (ix === 0 || ix === 3 || iz === 0 || iz === 7)) continue;
    packs.push({ x: -0.36 + ix * 0.24 + (R() - 0.5) * 0.03, z: -0.73 + iz * 0.21 + (R() - 0.5) * 0.03, y: BH - 0.05 + L * 0.045, ry: (R() - 0.5) * 0.35 + (L ? 0.5 : 0), c: R() });
  }
  const trayM = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.5 });
  const trays = new THREE.InstancedMesh(new THREE.BoxGeometry(0.21, 0.025, 0.15), trayM, packs.length); bin.add(trays);
  const links = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.017, 0.11, 4, 10), new THREE.MeshStandardMaterial({ roughness: 0.45 }), packs.length * 4); bin.add(links);
  const film = new THREE.InstancedMesh(new THREE.BoxGeometry(0.212, 0.04, 0.152), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, transparent: true, opacity: 0.18, depthWrite: false }), packs.length); bin.add(film);
  const lblT = textTex(128, 64, (g, w, h) => { g.fillStyle = '#f2c14e'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a2a1a'; g.font = `bold 26px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$3.99', w / 2, h / 2 + 2); });
  const lbls = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.03), new THREE.MeshStandardMaterial({ map: lblT, roughness: 0.6 }), packs.length); bin.add(lbls);
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    const sausCols = [0xc2553a, 0xb44a33, 0xd06a48, 0xa8452f];
    packs.forEach((p, i) => {
      e.set(0, p.ry, 0); q.setFromEuler(e); v.set(p.x, p.y, p.z); m4.compose(v, q, s); trays.setMatrixAt(i, m4);
      v.set(p.x, p.y + 0.012, p.z); m4.compose(v, q, s); film.setMatrixAt(i, m4);
      for (let k = 0; k < 4; k++) {
        const off = new THREE.Vector3(0, 0.022, -0.05 + k * 0.033).applyEuler(new THREE.Euler(0, p.ry, 0));
        e.set(0, p.ry, PI / 2); q.setFromEuler(e); v.set(p.x + off.x, p.y + off.y, p.z + off.z); m4.compose(v, q, s); links.setMatrixAt(i * 4 + k, m4);
        links.setColorAt(i * 4 + k, new THREE.Color(sausCols[(i + k) % 4]));
      }
      const lo = new THREE.Vector3(0.05, 0.034, 0.03).applyEuler(new THREE.Euler(0, p.ry, 0));
      e.set(-PI / 2, 0, p.ry); q.setFromEuler(e); v.set(p.x + lo.x, p.y + lo.y, p.z + lo.z); m4.compose(v, q, s); lbls.setMatrixAt(i, m4);
    });
    [trays, links, film, lbls].forEach((m) => { m.castShadow = m !== film; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; });
  }
  // the SAUSAGES sign hanging above it (double-sided) + a cartoon sausage
  const sausT = textTex(768, 256, (g, w, h) => {
    g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2483f'; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#c2553a'; g.beginPath(); g.ellipse(130, h / 2, 90, 34, -0.35, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(112, h / 2 - 12, 50, 8, -0.35, 0, 7); g.fill();
    g.fillStyle = '#d2483f'; let fs = 112; do { g.font = `bold ${fs}px ${FONT}`; fs -= 4; } while (g.measureText('SAUSAGES').width > w - 270 && fs > 40); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SAUSAGES', 238, h / 2 + 6);
  });
  const sausSign = new THREE.Group(); sausSign.position.set(4, 2.35, -4.5); root.add(sausSign);
  plane(1.5, 0.5, signM(sausT, 0.3), sausSign, 0, 0, 0.005, 0); plane(1.5, 0.5, signM(sausT, 0.3), sausSign, 0, 0, -0.005, PI);
  for (const s of [-1, 1]) box(0.012, 1.8, 0.012, frameM, s * 0.6, 1.15, 0, sausSign);
  bin.topY = BH + 0.04;

  // ---------------------------------------------------------------- back wall clock (aisle 3's sight line)
  const clockG = new THREE.Group(); clockG.position.set(4, 3.25, -11.88); root.add(clockG);
  const faceT = textTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = '#2f6b45'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke(); g.fillStyle = '#2a2a2a'; for (let i = 0; i < 12; i++) { const a = i * PI / 6; g.save(); g.translate(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); g.rotate(a); g.fillRect(-4, -12, 8, 24); g.restore(); } });
  mk(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 40), mat(0x2f6b45, 0.5), clockG, 0, 0, 0).rotation.x = PI / 2;
  const cf = mk(new THREE.CircleGeometry(0.31, 40), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.5, emissive: 0xffffff, emissiveMap: faceT, emissiveIntensity: 0.25 }), clockG, 0, 0, 0.032);
  const hand = (len, w) => { const p = new THREE.Group(); p.position.z = 0.04; clockG.add(p); mk(new THREE.BoxGeometry(w, len, 0.01), mat(0x1e1e1e, 0.4), p, 0, len / 2 - 0.03, 0); return p; };
  const hH = hand(0.18, 0.03), hM = hand(0.26, 0.02);
  const setClock = (h, m) => { hM.rotation.z = -(m / 60) * PI * 2; hH.rotation.z = -((h % 12) + m / 60) / 12 * PI * 2; };
  setClock(11, 0);

  // ---------------------------------------------------------------- checkout 3, dressed on the x = 2 counter
  const LX = 2.0, LZ0 = 2.8, LZ1 = 5.2, TOP = 0.97;
  const lane = new THREE.Group(); root.add(lane);
  const beltT = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#26282c'; g.fillRect(0, 0, w, h); g.fillStyle = '#34373c'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 32, w, 6); }, [1, 6]);
  const belt = mk(new THREE.PlaneGeometry(0.66, 1.75), new THREE.MeshStandardMaterial({ map: beltT, roughness: 0.6 }), lane, LX, TOP + 0.004, LZ0 + 0.95); belt.rotation.x = -PI / 2;
  for (const s of [-1, 1]) box(0.04, 0.05, 1.8, chromeM, LX + s * 0.36, TOP + 0.02, LZ0 + 0.95, lane);
  const scanGlass = mk(new THREE.BoxGeometry(0.6, 0.012, 0.32), new THREE.MeshStandardMaterial({ color: 0x1a1f26, roughness: 0.05, emissive: 0x401010, emissiveIntensity: 0.6 }), lane, LX, TOP + 0.008, LZ0 + 2.0);
  box(0.62, 0.04, 0.4, mat(0x2d3036, 0.4), LX, TOP - 0.01, LZ0 + 2.2, lane).visible = false;
  box(0.66, 0.05, 0.25, mat(0x5a646e, 0.4), LX, TOP - 0.06, LZ1 - 0.13, lane);   // bagging well floor
  // register: pole + screen facing the customer side (+x), card reader, receipt printer, a cash drawer
  const regM = mat(0x2b2f35, 0.45);
  box(0.06, 0.38, 0.06, regM, LX - 0.24, TOP + 0.19, LZ0 + 2.15, lane);
  const scrG = new THREE.Group(); scrG.position.set(LX - 0.22, TOP + 0.48, LZ0 + 2.15); scrG.rotation.order = 'YXZ'; scrG.rotation.y = PI / 2 - 0.25; scrG.rotation.x = -0.12; lane.add(scrG);
  mk(new RoundedBoxGeometry(0.42, 0.32, 0.04, 2, 0.015), regM, scrG, 0, 0, -0.02);
  let scrRows = -1;
  const ITEMS = ['SNEAKER (L)', 'SNEAKER (R)', 'BOOT (L)', 'BOOT (R)', 'SLIPPER', 'SLIPPER', 'SANDAL', 'HIGH HEEL', 'RAIN BOOT', 'SNEAKER', 'SNEAKER', 'LOAFER', 'LOAFER', 'FLIP-FLOP'];
  const scrT = textTex(512, 384, () => {});
  const drawScreen = (n) => {
    const g = scrT.image.getContext('2d'), w = 512, h = 384;
    g.fillStyle = '#f4f7f2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, 64); g.fillStyle = '#fff6e0'; g.font = `bold 34px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SUNNY MARKET · LANE 3', 20, 34);
    const rows = []; for (let i = 0; i < n; i++) rows.push(ITEMS[i % ITEMS.length]);
    const vis = rows.slice(-5);
    vis.forEach((r, i) => { const y = 96 + i * 44; g.fillStyle = i === vis.length - 1 ? '#fff1b8' : 'rgba(0,0,0,0)'; g.fillRect(8, y - 21, w - 16, 42); g.fillStyle = '#1e2a22'; g.font = `bold 32px ${FONT}`; g.textAlign = 'left'; g.fillText(r, 22, y + 2); g.textAlign = 'right'; g.fillText('$0.00', w - 22, y + 2); });
    g.fillStyle = '#1e2a22'; g.fillRect(0, h - 70, w, 70); g.fillStyle = '#f2c14e'; g.font = `bold 38px ${FONT}`; g.textAlign = 'left'; g.fillText(`ITEMS ${n}`, 22, h - 34); g.textAlign = 'right'; g.fillText('TOTAL $0.00', w - 22, h - 34);
    scrT.needsUpdate = true;
  };
  const setScreen = (n) => { n = Math.max(0, Math.round(n)); if (n !== scrRows) { scrRows = n; drawScreen(n); } };
  setScreen(0);
  const scr = plane(0.39, 0.29, new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) }), scrG, 0, 0, 0.002);
  scr.castShadow = false;
  box(0.09, 0.14, 0.05, regM, LX + 0.38, TOP + 0.07, LZ0 + 1.95, lane).rotation.y = 0.3;          // card reader (customer side)
  mk(new THREE.PlaneGeometry(0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0x7fd0a0 }), lane, LX + 0.39, TOP + 0.12, LZ0 + 1.975).rotation.y = 0.3;
  // lane light pole with a lit "3"
  box(0.05, 1.4, 0.05, frameM, LX - 0.33, TOP + 0.7, LZ0 + 0.1, lane);
  const lnT = textTex(128, 128, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.font = `bold 96px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3', w / 2, h / 2 + 6); });
  const lnB = new THREE.Group(); lnB.position.set(LX - 0.33, TOP + 1.5, LZ0 + 0.1); lane.add(lnB);
  mk(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshStandardMaterial({ map: lnT, emissive: 0xffffff, emissiveMap: lnT, emissiveIntensity: 0.55, roughness: 0.5 }), lnB);
  // the customer side of the counter: a printed panel (THANK YOU + the sun logo)
  const thxT = textTex(1024, 352, (g, w, h) => {
    g.fillStyle = '#e8f2e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6b45'; g.fillRect(0, h - 60, w, 60); g.fillStyle = '#f2c14e'; g.fillRect(0, h - 74, w, 14);
    g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(150, 140, 78, 0, 7); g.fill(); g.strokeStyle = '#f2c14e'; g.lineWidth = 12; for (let i = 0; i < 12; i++) { const a = i * PI / 6; g.beginPath(); g.moveTo(150 + Math.cos(a) * 92, 140 + Math.sin(a) * 92); g.lineTo(150 + Math.cos(a) * 112, 140 + Math.sin(a) * 112); g.stroke(); }
    g.fillStyle = '#2f6b45'; g.font = `bold 92px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('THANK YOU!', 290, 112); g.font = `bold 52px ${FONT}`; g.fillText('come again soon', 296, 196);
  });
  plane(2.3, 0.79, new THREE.MeshStandardMaterial({ map: thxT, roughness: 0.6 }), lane, LX + 0.405, 0.48, (LZ0 + LZ1) / 2, PI / 2);
  // candy + gum rack on the cashier side of the lane mouth (faces lane 2's walkway)
  const rack = new THREE.Group(); rack.position.set(LX - 0.62, 0, LZ0 + 0.35); rack.rotation.y = PI / 2; lane.add(rack);
  box(0.6, 1.25, 0.3, mat(0xd2483f, 0.5), 0, 0.625, 0, rack);
  const candyT = canvasTex(256, 256, (g, w, h) => { const c = ['#f2c14e', '#3d7bd9', '#58b368', '#e58fa6', '#f08a3a', '#a77bd1', '#ffffff']; for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { g.fillStyle = c[(r * 3 + k) % c.length]; g.fillRect(k * 42 + 4, r * 64 + 10, 36, 48); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(k * 42 + 8, r * 64 + 26, 28, 6); } });
  plane(0.56, 1.05, new THREE.MeshStandardMaterial({ map: candyT, roughness: 0.6 }), rack, 0, 0.62, -0.152, PI);
  // the cashier's stool + bag carousel (cashier side)
  const stool = new THREE.Group(); stool.position.set(LX - 0.75, 0, LZ0 + 1.9); lane.add(stool);
  mk(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20), mat(0x2f6b45, 0.6), stool, 0, 0.72, 0); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), chromeM, stool, 0, 0.36, 0); mk(new THREE.CylinderGeometry(0.22, 0.25, 0.04, 20), chromeM, stool, 0, 0.02, 0);
  const D = { x: LX, z0: LZ0, z1: LZ1, top: TOP, beltZ0: LZ0 + 0.08, beltZ1: LZ0 + 1.82, scanZ: LZ0 + 2.0, walkX: LX + 0.75, screen: scrG };
  let beltOff = 0;
  const setBelt = (m) => { beltOff = m; beltT.offset.y = (m / 1.75) * 6; };

  // ---------------------------------------------------------------- lobby dressing: pumpkins, flowers, gumball machine, cart corral, kiddie ride, water cases
  const pumpkinsG = new THREE.Group(); pumpkinsG.position.set(-3.3, 0, 5.45); root.add(pumpkinsG);
  mk(new THREE.BoxGeometry(1.0, 0.42, 0.75), mat(0x9a7448, 0.9), pumpkinsG, 0, 0.21, 0);
  for (let i = 0; i < 9; i++) { const p = makePumpkin(0.13 + (i % 3) * 0.025, i); p.position.set(-0.32 + (i % 3) * 0.32 + (R() - 0.5) * 0.05, 0.47 + Math.floor(i / 3) * 0.04, -0.22 + Math.floor(i / 3) * 0.22); p.rotation.y = R() * 6; pumpkinsG.add(p); }
  const pT = textTex(256, 128, (g, w, h) => { g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#d2483f'; g.font = `bold 44px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PUMPKINS', w / 2, 42); g.fillText('2 for $5', w / 2, 92); });
  plane(0.5, 0.25, new THREE.MeshStandardMaterial({ map: pT, roughness: 0.6 }), pumpkinsG, 0, 0.26, -0.38, PI);
  plane(0.5, 0.25, new THREE.MeshStandardMaterial({ map: pT, roughness: 0.6 }), pumpkinsG, -0.505, 0.26, 0, -PI / 2);
  // flower buckets along the window by lane 2
  const flowersG = new THREE.Group(); flowersG.position.set(-0.2, 0, 5.55); root.add(flowersG);
  const petalCols = [0xe58fa6, 0xf2c14e, 0xffffff, 0xd2483f, 0xa77bd1, 0xf08a3a];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Group(); b.position.set(-0.75 + i * 0.3, 0, (i % 2) * 0.12); flowersG.add(b);
    mk(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 14), mat(0x3a5a7a, 0.5), b, 0, 0.15, 0);
    for (let k = 0; k < 7; k++) { const a = k * 0.9 + i, r = 0.04 + (k % 3) * 0.025; mk(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 5), leafM[1], b, Math.cos(a) * r, 0.42, Math.sin(a) * r); mk(new THREE.SphereGeometry(0.045, 10, 8), mat(petalCols[(i + k) % 6], 0.7), b, Math.cos(a) * r * 1.4, 0.66 + (k % 3) * 0.04, Math.sin(a) * r * 1.4); }
  }
  // gumball machine by the doors
  const gum = new THREE.Group(); gum.position.set(4.05, 0, 5.62); root.add(gum);
  mk(new THREE.CylinderGeometry(0.05, 0.12, 0.7, 12), mat(0xd2483f, 0.4), gum, 0, 0.35, 0); mk(new RoundedBoxGeometry(0.22, 0.18, 0.22, 2, 0.03), mat(0xd2483f, 0.4), gum, 0, 0.78, 0);
  mk(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }), gum, 0, 1.02, 0);
  { const gb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.3 }), 60); const m4 = new THREE.Matrix4(); let k = 0; for (let i = 0; i < 200 && k < 60; i++) { const x = (R() - 0.5) * 0.26, y = (R() - 0.5) * 0.26, z = (R() - 0.5) * 0.26; if (x * x + y * y + z * z > 0.13 * 0.13 || y > 0.06) continue; m4.makeTranslation(x, 1.02 + y, z); gb.setMatrixAt(k, m4); gb.setColorAt(k, new THREE.Color(petalCols[k % 6])); k++; } gb.count = k; gum.add(gb); }
  mk(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), mat(0xd6dade, 0.3, { metalness: 0.7 }), gum, 0, 1.19, 0);
  // cart corral against the right wall (nested carts) + water-case stack + a coin-op kiddie ride
  const corral = [];
  for (let i = 0; i < 5; i++) { const c = makeShopCart(); c.position.set(7.45, 0, 1.0 + i * 0.32); c.rotation.y = PI; root.add(c); corral.push(c); }
  const waterG = new THREE.Group(); waterG.position.set(7.4, 0, -0.8); root.add(waterG);
  for (let L = 0; L < 4; L++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { mk(new THREE.BoxGeometry(0.4, 0.22, 0.28), mat(0x8fc3e8, 0.25, { transparent: true, opacity: 0.85 }), waterG, i * 0.42 - 0.21, 0.11 + L * 0.23, j * 0.3 - 0.15); }
  const ride = new THREE.Group(); ride.position.set(7.35, 0, 5.35); ride.rotation.y = -PI / 2 - 0.4; root.add(ride);
  mk(new THREE.CylinderGeometry(0.42, 0.45, 0.16, 24), mat(0x3d7bd9, 0.5), ride, 0, 0.08, 0);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), chromeM, ride, 0, 0.4, 0);
  const horseM = mat(0xf2c14e, 0.4);
  const hb = mk(new THREE.CapsuleGeometry(0.15, 0.4, 6, 14), horseM, ride, 0, 0.72, 0); hb.rotation.x = PI / 2;
  const hn = mk(new THREE.CapsuleGeometry(0.08, 0.25, 6, 12), horseM, ride, 0, 0.92, 0.26); hn.rotation.x = 0.5;
  mk(new THREE.SphereGeometry(0.11, 14, 10), horseM, ride, 0, 1.06, 0.38).scale.set(0.8, 0.85, 1.3);
  for (const s of [-1, 1]) for (const z of [-0.16, 0.16]) { const l = mk(new THREE.CapsuleGeometry(0.04, 0.22, 4, 8), horseM, ride, s * 0.09, 0.47, z); l.rotation.x = z > 0 ? -0.35 : 0.35; }
  mk(new THREE.BoxGeometry(0.3, 0.05, 0.22), mat(0xd2483f, 0.5), ride, 0, 0.88, -0.02);
  // wet-floor sign (aisle 2's mouth) — dressing
  const wet = new THREE.Group(); wet.position.set(-1.1, 0, 1.3); wet.rotation.y = 0.5; root.add(wet);
  const wetT = textTex(128, 256, (g, w, h) => { g.fillStyle = '#f2c14e'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e1e1e'; g.font = `bold 30px ${FONT}`; g.textAlign = 'center'; g.fillText('CAUTION', w / 2, 46); g.font = `bold 26px ${FONT}`; g.fillText('WET', w / 2, 170); g.fillText('FLOOR', w / 2, 204); g.beginPath(); g.moveTo(w / 2, 70); g.lineTo(w / 2 + 34, 130); g.lineTo(w / 2 - 34, 130); g.closePath(); g.lineWidth = 6; g.strokeStyle = '#1e1e1e'; g.stroke(); });
  for (const s of [-1, 1]) { const p = plane(0.3, 0.62, new THREE.MeshStandardMaterial({ map: wetT, roughness: 0.5, side: THREE.DoubleSide }), wet, 0, 0.3, s * 0.08, s > 0 ? 0 : PI); p.rotation.x = s * 0.24; }

  // ---------------------------------------------------------------- EMPLOYEE OF THE MONTH board (right wall, x = 8, faces −x)
  const eotm = new THREE.Group(); eotm.position.set(7.97, 1.55, 3.9); eotm.rotation.y = -PI / 2; root.add(eotm);
  const corkT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c99a62'; g.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '120,80,40' : '230,200,150'},${0.15 + r() * 0.25})`; g.fillRect(r() * w, r() * h, 2, 2); } }, [2, 1.5]);
  mk(new THREE.BoxGeometry(1.5, 1.1, 0.03), mat(0x8a6040, 0.7), eotm, 0, 0, -0.015);
  plane(1.42, 1.02, new THREE.MeshStandardMaterial({ map: corkT, roughness: 0.95 }), eotm, 0, 0, 0.002);
  const headT = textTex(1024, 160, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.font = `bold 88px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EMPLOYEE OF THE MONTH', w / 2, h / 2 + 4); });
  plane(1.36, 0.21, signM(headT, 0.2), eotm, 0, 0.38, 0.006);
  const staff = [['DEB', 'JUN', '#e7b48a', '#6a3a22', '#7fb0d8'], ['RAY', 'JUL', '#8d5a3b', '#1a1210', '#f2c14e'], ['ANA', 'AUG', '#f0c4a2', '#c8822a', '#e58fa6'], ['SAM', 'SEP', '#c68863', '#3a2418', '#9ad0a0']];
  staff.forEach(([n, mo, skin, hair, bg], i) => {
    const T = textTex(128, 160, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(8, 8, w - 16, 112); g.fillStyle = skin; g.beginPath(); g.arc(w / 2, 66, 30, 0, 7); g.fill(); g.fillStyle = hair; g.beginPath(); g.arc(w / 2, 56, 31, PI, 0); g.fill(); g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(w / 2 - 11, 68, 3.5, 0, 7); g.arc(w / 2 + 11, 68, 3.5, 0, 7); g.fill(); g.strokeStyle = '#2a1a12'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, 76, 10, 0.2, PI - 0.2); g.stroke(); g.fillStyle = skin; g.fillRect(w / 2 - 30, 98, 60, 22); g.fillStyle = '#2a2a2a'; g.font = `bold 24px ${FONT}`; g.textAlign = 'center'; g.fillText(`${n} · ${mo}`, w / 2, 145); });
    const p = plane(0.16, 0.2, new THREE.MeshStandardMaterial({ map: T, roughness: 0.6 }), eotm, -0.58 + (i % 2) * 0.2, 0.08 - Math.floor(i / 2) * 0.3, 0.008); p.rotation.z = (i % 2 ? 1 : -1) * 0.05;
    mk(new THREE.SphereGeometry(0.012, 8, 6), mat([0xd2483f, 0x3d7bd9, 0xf2c14e, 0x58b368][i], 0.4), eotm, p.position.x, p.position.y + 0.085, 0.016);
  });
  // the big gold frame for this month + a star
  const goldM = new THREE.MeshStandardMaterial({ color: 0xe8b84a, roughness: 0.3, metalness: 0.75 });
  const frameG = new THREE.Group(); frameG.position.set(0.28, -0.08, 0.01); eotm.add(frameG);
  for (const [w, h, x, y] of [[0.5, 0.05, 0, 0.29], [0.5, 0.05, 0, -0.29], [0.05, 0.63, -0.225, 0], [0.05, 0.63, 0.225, 0]]) mk(new THREE.BoxGeometry(w, h, 0.03), goldM, frameG, x, y, 0.012);
  plane(0.4, 0.53, mat(0xf4efe4, 0.8), frameG, 0, 0, 0.004);
  const octT = textTex(256, 64, (g, w, h) => { g.fillStyle = '#2a2a2a'; g.font = `bold 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('OCTOBER', w / 2, h / 2 + 2); });
  plane(0.3, 0.075, new THREE.MeshStandardMaterial({ map: octT, transparent: true, roughness: 0.6 }), frameG, 0, -0.215, 0.006);
  const starShape = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * PI / 5 + PI / 2, r = i % 2 ? 0.035 : 0.08; i ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const star = mk(new THREE.ExtrudeGeometry(starShape, { depth: 0.012, bevelEnabled: false }), goldM, frameG, 0.2, 0.27, 0.02);
  const photoSlot = new THREE.Group(); photoSlot.position.set(0, 0.03, 0.02); frameG.add(photoSlot);

  // ---------------------------------------------------------------- the balloon drop (net under the lobby ceiling)
  const NB = 64, BC = new THREE.Vector3(5.5, 4.05, 4.2);
  const balloonM = new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.05 });
  const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 16, 12), balloonM, NB); balls.castShadow = true; balls.frustumCulled = false; root.add(balls);
  const knots = new THREE.InstancedMesh(new THREE.ConeGeometry(0.025, 0.04, 8), balloonM, NB); knots.frustumCulled = false; root.add(knots);
  const balCols = [0xd2483f, 0xf2c14e, 0x3d7bd9, 0x58b368, 0xe58fa6, 0xffffff, 0xf08a3a];
  const BS = [];
  for (let i = 0; i < NB; i++) {
    const a = R() * PI * 2, r = Math.sqrt(R());
    const p0 = new THREE.Vector3(BC.x + Math.cos(a) * r * 1.25, 3.85 + R() * 0.33, BC.z + Math.sin(a) * r * 0.95);
    const land = new THREE.Vector3(BC.x + (R() - 0.5) * 4.2, 0.17, BC.z + (R() - 0.5) * 3.2);
    land.x = clamp(land.x, 3.1, 6.3); land.z = clamp(land.z, 2.5, 5.75);
    BS.push({ p0, land, v: 1.3 + R() * 0.7, delay: R() * 0.5, ph: R() * 6, c: balCols[i % balCols.length] });
    balls.setColorAt(i, new THREE.Color(balCols[i % balCols.length])); knots.setColorAt(i, new THREE.Color(balCols[i % balCols.length]));
  }
  const netM = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 });
  const net = mk(new THREE.SphereGeometry(1, 16, 8, 0, PI * 2, PI / 2, PI / 2), netM, root, BC.x, 4.39, BC.z); net.scale.set(1.5, 0.78, 1.2); net.castShadow = false;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1.15, 1), _v = new THREE.Vector3();
  const updateBalloons = (t, tDrop = 1e9) => {
    BS.forEach((b, i) => {
      const age = t - tDrop - b.delay;
      let x = b.p0.x, y = b.p0.y, z = b.p0.z, tilt = 0;
      if (age > 0) {
        const fall = b.p0.y - b.land.y, T = fall / b.v;
        const u = clamp(age / T), uu = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
        x = lerp(b.p0.x, b.land.x, uu) + Math.sin(age * 2.2 + b.ph) * 0.12 * (1 - u);
        z = lerp(b.p0.z, b.land.z, uu) + Math.cos(age * 1.7 + b.ph) * 0.1 * (1 - u);
        y = lerp(b.p0.y, b.land.y, u);
        if (u >= 1) { const a2 = age - T; y = b.land.y + Math.abs(Math.sin(a2 * 6)) * 0.18 * Math.exp(-a2 * 3); }
        tilt = Math.sin(age * 3 + b.ph) * 0.3 * (1 - u);
      } else { x += Math.sin(t * 0.7 + b.ph) * 0.01; }
      _e.set(tilt, b.ph, tilt * 0.7); _q.setFromEuler(_e); _v.set(x, y, z); _m.compose(_v, _q, _s); balls.setMatrixAt(i, _m);
      const k = new THREE.Vector3(0, -0.17, 0).applyQuaternion(_q); _v.set(x + k.x, y + k.y, z + k.z); _m.compose(_v, _q, new THREE.Vector3(1, 1, 1)); knots.setMatrixAt(i, _m);
    });
    balls.instanceMatrix.needsUpdate = true; knots.instanceMatrix.needsUpdate = true;
    net.visible = t < tDrop + 0.15;
  };
  updateBalloons(0);

  // brighter store: a warm-white fill over the lobby + lane, cool fill down the aisles
  const lobbyL = new THREE.PointLight(0xfff6ea, 7, 10, 1.6); lobbyL.position.set(5.4, 3.7, 4.0); root.add(lobbyL);
  const aisleL = new THREE.PointLight(0xf4f8ff, 5, 9, 1.6); aisleL.position.set(0, 3.6, -4.5); root.add(aisleL);
  // more fluorescent panels over the lobby
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8ff).multiplyScalar(1.6), toneMapped: false });
  for (const x of [4.6, 6.6]) for (const z of [3.2, 5.0]) mk(new THREE.BoxGeometry(0.6, 0.04, 1.2), panelM, root, x, 4.38, z).castShadow = false;
  // the welcome banner hangs above the doors inside
  plane(2.6, 0.5, signM(welT, 0.25), root, 5.5, 2.75, FZ - 0.06, PI);

  return { root, FZ, DOOR, setDoors, setSunset, outLight, lobbyL, aisleL, sky, bin, sausSign, clock: { g: clockG, setClock }, lane: { g: lane, D, setBelt, setScreen, scanGlass, belt }, eotm: { g: eotm, frame: frameG, photoSlot, star }, balloons: { update: updateBalloons, BS, net }, corral, pumpkins: pumpkinsG, flowers: flowersG, gum, ride, wet };
}

// ---------------------------------------------------------------- props
/** A pie-ribbed pumpkin (radius r) with a stem; origin at its bottom. */
export function makePumpkin(r = 0.14, seed = 1) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(r, 24, 16), pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const a = Math.atan2(v.z, v.x), k = 1 - 0.07 * Math.pow(Math.abs(Math.cos(a * 4)), 0.5); v.x *= k; v.z *= k; v.y *= 0.78; pos.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  mk(geo, mat([0xe8781e, 0xf08a2a, 0xd96a18][seed % 3], 0.55), g, 0, r * 0.78, 0);
  const st = mk(new THREE.CylinderGeometry(r * 0.08, r * 0.12, r * 0.4, 8), mat(0x6a5a2a, 0.8), g, 0, r * 1.62, 0); st.rotation.z = 0.25;
  return g;
}

/** A shopping cart (front = +z, handle at −z, basket top ≈ 1.0 m) with a child seat flap. */
export function makeShopCart({ color = 0xd2483f } = {}) {
  const g = new THREE.Group(), wire = mat(0xc9ccd2, 0.3, { metalness: 0.6 });
  const gridT = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#e8ebef'; c.lineWidth = 6; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 16); c.lineTo(w, i * 16); c.stroke(); } });
  const basketM = new THREE.MeshStandardMaterial({ map: gridT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.5 });
  const b = mk(new THREE.BoxGeometry(0.55, 0.42, 0.85), basketM, g, 0, 0.78, 0); b.castShadow = true;
  mk(new THREE.BoxGeometry(0.55, 0.02, 0.85), wire, g, 0, 0.57, 0);
  mk(new THREE.BoxGeometry(0.6, 0.035, 0.035), mat(color, 0.5), g, 0, 1.06, -0.47);
  for (const x of [-0.25, 0.25]) { mk(new THREE.BoxGeometry(0.025, 0.55, 0.025), wire, g, x, 0.3, -0.38); mk(new THREE.BoxGeometry(0.025, 0.025, 0.8), wire, g, x, 0.08, 0); }
  mk(new THREE.BoxGeometry(0.5, 0.012, 0.6), wire, g, 0, 0.2, 0.02);       // bottom rack
  for (const [x, z] of [[-0.22, 0.34], [0.22, 0.34], [-0.22, -0.34], [0.22, -0.34]]) mk(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), mat(0x222222, 0.6), g, x, 0.05, z).rotation.z = PI / 2;
  mk(new THREE.BoxGeometry(0.5, 0.012, 0.2), mat(color, 0.5), g, 0, 0.995, -0.32);   // child-seat flap (red)
  const load = new THREE.Group(); g.add(load); g.userData.load = load;
  return g;
}
/** Fill a cart's basket with n colourful grocery boxes (deterministic). */
export function loadCart(cart, n = 6, seed = 1) {
  const L = cart.userData.load, r = rng(seed), cols = [0xd2483f, 0xf2c14e, 0x3d7bd9, 0x58b368, 0xf08a4b, 0xa77bd1, 0xffffff];
  for (let i = 0; i < n; i++) { const w = 0.12 + r() * 0.1, h = 0.12 + r() * 0.18, d = 0.08 + r() * 0.08; const b = mk(new THREE.BoxGeometry(w, h, d), mat(cols[Math.floor(r() * cols.length)], 0.6), L, (r() - 0.5) * 0.36, 0.59 + h / 2, (r() - 0.5) * 0.62); b.rotation.y = (r() - 0.5) * 0.8; }
  return cart;
}
/** A red plastic hand basket (origin = the handle grip). */
export function makeHandBasket(color = 0xd2483f) {
  const g = new THREE.Group(), m = mat(color, 0.45);
  const b = mk(new THREE.BoxGeometry(0.4, 0.2, 0.28), m, g, 0, -0.3, 0);
  const hTorus = mk(new THREE.TorusGeometry(0.15, 0.012, 6, 20, PI), mat(0x2a2a2a, 0.5), g, 0, -0.2, 0); hTorus.scale.set(1, 1.3, 1);
  const cols = [0xf2c14e, 0x58b368, 0x3d7bd9];
  for (let i = 0; i < 3; i++) mk(new THREE.BoxGeometry(0.1, 0.14, 0.07), mat(cols[i], 0.6), g, -0.11 + i * 0.11, -0.2, 0.02 * i);
  return g;
}

/** Pip's working-dog vest: a green shell over his back, STAFF on both flanks, a carry handle on top, a name badge on his chest.
 *  Lives on pip.T (rolls with his body). setBadge(k) pops the badge on (0 = not yet clipped). */
export function makeStaffVest(pip, { name = 'PIP' } = {}) {
  const g = new THREE.Group(); pip.T.add(g);
  const green = new THREE.MeshStandardMaterial({ color: 0x2f7a4c, roughness: 0.75, side: THREE.DoubleSide });
  const shell = mk(new THREE.CylinderGeometry(0.091, 0.091, 0.2, 28, 1, true, PI - 1.9, 3.8), green, g); shell.rotation.x = PI / 2; shell.scale.set(1.07, 1, 0.98); shell.position.set(0, 0.004, 0.0);
  const trim = mat(0xf2c14e, 0.5);
  for (const z of [-0.1, 0.1]) { const t = mk(new THREE.CylinderGeometry(0.093, 0.093, 0.012, 28, 1, true, PI - 1.9, 3.8), new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.5, side: THREE.DoubleSide }), g, 0, 0.004, z); t.rotation.x = PI / 2; t.scale.set(1.07, 1, 0.98); }
  const stT = textTex(256, 96, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#fff6e0'; c.font = `bold 74px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAFF', w / 2, h / 2 + 4); });
  const stM = new THREE.MeshStandardMaterial({ map: stT, transparent: true, roughness: 0.7, depthWrite: false });
  for (const s of [-1, 1]) { const p = plane(0.13, 0.05, stM, g, s * 0.096, 0.024, 0.0, s * PI / 2); p.rotation.order = 'YXZ'; p.rotation.x = -0.25; p.castShadow = false; }
  // carry handle on top (the toddler holds it)
  const handle = mk(new THREE.TorusGeometry(0.03, 0.0065, 6, 16, PI), mat(0x1e2a22, 0.6), g, 0, 0.096, 0); handle.rotation.y = PI / 2;
  // name badge on the chest (front, slightly right), hanging under the collar
  const badgeT = textTex(256, 192, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f6b45'; c.fillRect(0, 0, w, 62); c.fillStyle = '#fff6e0'; c.font = `bold 40px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("HI, I'M", w / 2, 33); c.fillStyle = '#1e2a22'; c.font = `bold 104px ${FONT}`; c.fillText(name, w / 2, 128); c.strokeStyle = '#f2c14e'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); });
  const badge = new THREE.Group(); badge.position.set(0.045, -0.005, 0.168); badge.rotation.set(-0.15, 0.32, 0); pip.T.add(badge);
  mk(new THREE.BoxGeometry(0.064, 0.048, 0.004), mat(0xffffff, 0.5), badge, 0, 0, -0.002);
  plane(0.062, 0.046, new THREE.MeshStandardMaterial({ map: badgeT, roughness: 0.45 }), badge, 0, 0, 0.0005);
  const setBadge = (k) => { const s = Math.max(0.0001, k); badge.scale.setScalar(s); badge.visible = k > 0.001; };
  const setOn = (v) => { g.visible = !!v; };
  return { g, badge, handle, setBadge, setOn };
}

/** A handheld barcode scanner (pistol grip). Origin at the grip's middle; the window points +z. setBeep(k) lights it. */
export function makeScanner() {
  const g = new THREE.Group(), body = mat(0x30343a, 0.4), yel = mat(0xf2c14e, 0.5);
  mk(new RoundedBoxGeometry(0.05, 0.05, 0.13, 2, 0.015), body, g, 0, 0.04, 0.04);
  mk(new RoundedBoxGeometry(0.04, 0.1, 0.04, 2, 0.012), yel, g, 0, -0.01, -0.005).rotation.x = -0.35;
  const winM = new THREE.MeshBasicMaterial({ color: 0x401010 });
  const w = mk(new THREE.PlaneGeometry(0.042, 0.04), winM, g, 0, 0.04, 0.106);
  const fanT = canvasTex(128, 128, (c, W, H) => { const gr = c.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, 'rgba(255,60,50,.9)'); gr.addColorStop(1, 'rgba(255,60,50,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(W / 2, H); c.lineTo(0, 0); c.lineTo(W, 0); c.closePath(); c.fill(); });
  const fan = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.32), new THREE.MeshBasicMaterial({ map: fanT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  fan.geometry.translate(0, 0.16, 0); fan.rotation.x = PI / 2 - 0.25; fan.position.set(0, 0.04, 0.11); g.add(fan);
  const glow = new THREE.PointLight(0xff5040, 0, 0.6, 2); glow.position.set(0, 0.04, 0.16); g.add(glow);
  const setBeep = (k) => { winM.color.setRGB(0.25 + 2.2 * k, 0.06 + 0.35 * k, 0.06 + 0.25 * k); fan.material.opacity = 0.85 * k; fan.visible = k > 0.01; glow.intensity = 0.6 * k; };
  setBeep(0);
  return { g, setBeep, fan };
}

/** A boxy instant camera (lens +z). setFlash(k) fires the flash (emissive pane + a short point light). */
export function makePolaroidCam() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.15, 0.11, 0.11, 2, 0.02), mat(0xf4f1ea, 0.5), g, 0, 0, 0);
  mk(new THREE.BoxGeometry(0.15, 0.025, 0.112), mat(0x2a2a2a, 0.5), g, 0, -0.035, 0);
  mk(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 20), mat(0x1e1e1e, 0.3), g, -0.02, 0.0, 0.065).rotation.x = PI / 2;
  mk(new THREE.CircleGeometry(0.02, 18), mat(0x2a3a5a, 0.1), g, -0.02, 0.0, 0.081);
  for (let i = 0; i < 5; i++) mk(new THREE.BoxGeometry(0.022, 0.006, 0.004), mat([0xd2483f, 0xf08a3a, 0xf2c14e, 0x58b368, 0x3d7bd9][i], 0.5), g, -0.05 + i * 0.022, 0.044, 0.056);
  const fM = new THREE.MeshBasicMaterial({ color: 0x777777 });
  mk(new THREE.PlaneGeometry(0.035, 0.022), fM, g, 0.045, 0.032, 0.0565);
  const L = new THREE.PointLight(0xfff8f0, 0, 4, 1.6); L.position.set(0.045, 0.03, 0.12); g.add(L);
  const setFlash = (k) => { fM.color.setScalar(0.47 + 2.5 * k); L.intensity = 9 * k; };
  return { g, setFlash };
}

/** A Polaroid print (0.09 × 0.108 m, photo window on top) using `tex` as its photo; setDevelop(0..1) fades it in from cream. */
export function makePolaroid(tex) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(0.09, 0.108, 0.002), mat(0xfbfaf6, 0.7), g, 0, 0, 0);
  const pm = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff });
  const ph = plane(0.078, 0.078, pm, g, 0, 0.009, 0.0012);
  const cover = new THREE.MeshBasicMaterial({ color: 0xe9e2cf, transparent: true, opacity: 1, depthWrite: false });
  plane(0.078, 0.078, cover, g, 0, 0.009, 0.0016);
  const setDevelop = (k) => { cover.opacity = 1 - clamp(k); };
  return { g, setDevelop, photo: ph };
}

/** Groceries for the belt + the avalanche: n items cycling through can / box / bottle / orange (instanced, one mesh per kind).
 *  set(i, pos, rx, ry, rz) places item i (world or parent space), hide(i), commit(). kind(i) = 0 can, 1 box, 2 bottle, 3 orange. */
export function makeGroceries(parent, n = 48, seed = 3) {
  const r = rng(seed), kinds = 4, per = Math.ceil(n / kinds);
  const geos = [new THREE.CylinderGeometry(0.04, 0.04, 0.11, 14), new THREE.BoxGeometry(0.15, 0.21, 0.055), new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12), new THREE.SphereGeometry(0.042, 12, 10)];
  geos[2].translate(0, 0, 0);
  const lbl = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7f3e8'; g.fillRect(0, h * 0.3, w, h * 0.4); g.fillStyle = 'rgba(30,30,30,.45)'; g.fillRect(w * 0.15, h * 0.45, w * 0.7, h * 0.08); });
  const meshes = geos.map((geo, k) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: k === 3 ? 0.6 : 0.4, metalness: k === 0 ? 0.35 : 0, map: k === 3 ? null : lbl }), per); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; parent.add(m); return m; });
  const cols = [[0xd2483f, 0x3d7bd9, 0x58b368, 0xf2c14e], [0xf2c14e, 0xe58fa6, 0x3d7bd9, 0xf08a4b, 0xa77bd1], [0x58b368, 0xd2483f, 0x8fc3e8], [0xf08a2a, 0xf5a03a]];
  for (let i = 0; i < n; i++) { const k = i % kinds, j = Math.floor(i / kinds); meshes[k].setColorAt(j, new THREE.Color(cols[k][Math.floor(r() * cols[k].length)])); }
  meshes.forEach((m) => { m.instanceColor.needsUpdate = true; });
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3(0, 0, 0);
  const kind = (i) => i % kinds;
  const set = (i, p, rx = 0, ry = 0, rz = 0) => { const k = i % kinds, j = Math.floor(i / kinds); _e.set(rx, ry, rz); _q.setFromEuler(_e); _m.compose(p, _q, one); meshes[k].setMatrixAt(j, _m); };
  const hide = (i) => { const k = i % kinds, j = Math.floor(i / kinds); _m.compose(_v.set(0, -50, 0), _q.identity(), zero); meshes[k].setMatrixAt(j, _m); };
  const hideAll = () => { for (let i = 0; i < n; i++) hide(i); };
  const commit = () => meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // half-heights so things rest on a surface: can, box (standing), bottle, orange
  const halfH = [0.055, 0.105, 0.11, 0.042];
  hideAll(); commit();
  return { set, hide, hideAll, commit, kind, halfH, n, meshes };
}

/** A golden scent trail: n soft glowing dots along a path. set(points[], reveal 0..1, t) re-lays them (wavy, drifting). */
export function makeScentTrail(parent, n = 140) {
  const dotT = canvasTex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,190,1)'); gr.addColorStop(0.35, 'rgba(255,200,90,.65)'); gr.addColorStop(1, 'rgba(255,180,60,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ map: dotT, size: 0.07, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, color: 0xffd27a });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; parent.add(pts);
  let curve = null, key = '';
  const set = (points, reveal, t) => {
    const k = points.map((p) => p.toArray().join(',')).join('|');
    if (k !== key) { curve = new THREE.CatmullRomCurve3(points); key = k; }
    const shown = Math.floor(n * clamp(reveal));
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), p = curve.getPointAt(u);
      const w = 0.06 + 0.05 * Math.sin(u * 40);
      const ox = Math.sin(u * 23 + t * 1.7) * w, oy = Math.sin(u * 31 + t * 2.3) * 0.05, oz = Math.cos(u * 19 + t * 1.3) * w;
      if (i < shown) { pos[i * 3] = p.x + ox; pos[i * 3 + 1] = p.y + oy; pos[i * 3 + 2] = p.z + oz; }
      else { pos[i * 3] = 0; pos[i * 3 + 1] = -50; pos[i * 3 + 2] = 0; }
    }
    geo.attributes.position.needsUpdate = true; pts.visible = shown > 0;
  };
  pts.visible = false;
  return { pts, set, mat: m };
}
