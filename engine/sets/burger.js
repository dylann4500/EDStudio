// SET: CHOMPY'S, a roadside burger joint, inside and out (055, the hippo's first shift). One building at the origin:
//   interior x∈[-7,7], z∈[-6,6], ceiling 3.4 — the street (+z) side is the dining room, a counter across z≈0.6 with three
//   registers and hanging menu boards, the kitchen behind it (grill line + fryers + hood on the back wall, a prep table on the left
//   wall, a drive-thru window in the right wall at z −3); a self-serve FIZZ soda fountain on the right wall, a salad bar island,
//   booths along the left windows, 4-top tables with chairs, posters, plants, a wall clock, an EMPLOYEE OF THE MONTH frame.
//   Outside: a cream + brick facade with the CHOMPY'S sign and a NOW HIRING banner, a parking lot with parked cars and lamp
//   posts, a drive-thru lane along x ≈ 9.6 (menu board + speaker), a road at z ≈ 24, houses + trees across it, a pylon sign,
//   low-poly trees, a sky dome. East of the lane (center DIMS.pond) a pond that digs itself: setPond(dig 0..1, fill 0..1).
// The main door (x∈[-0.6,0.6] in the front wall) is narrower than the hippo (1.6 m): `doorFrame` (group) can pop off.
// Handles: chairs[i] = {g, home:{x,z,ry}, table}, tables[i] = {g, x, z, top}, booths, salad (setEaten 0..1 empties the bins,
//   bins[i].pos = world-ish spot of each bin), fizz {g, nozzles[] (local spots for spray)}, registers, menu boards,
//   clock.setClock(h, m), eotm (photo slot plane), setNight(k), setMess(k), setPond(dig, fill, level), setFlood(level) (a water
//   sheet over the kitchen + dining floor), aimSun(cx, cz, half), update(t), fog, lights {hemi, sun}.
// camera.far ≥ 320 (sky dome r 300).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';
import { makeCar } from '@engine/sets/city.js';

export const DIMS = {
  room: { x0: -7, x1: 7, z0: -6, z1: 6, h: 3.4 }, door: { x0: -0.65, x1: 0.65, h: 2.3, z: 6 },
  counter: { z: 0.6, x0: -4.6, x1: 2.9, h: 1.05, d: 0.7 }, gap: [2.9, 4.7],
  fizz: { x: 6.55, z0: 0.9, z1: 2.9, top: 0.92 }, salad: { x: 3.9, z: 4.1, len: 2.8, top: 0.86 },
  drive: { x: 9.6, window: [7, -3] }, pond: { x: 18.0, z: -2.2, r: 6 }, lane: { x: 9.6 },
  road: { z: 24 }, seat: 0.46, tableTop: 0.76,
};

export function buildBurger(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 55), D = DIMS, Rm = D.room;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const cyl = (rt, rb, h, m, x, y, z, p = root, seg = 18) => mk(new THREE.CylinderGeometry(rt, rb, h, seg), m, p, x, y, z);
  const flat = (o) => { o.castShadow = false; return o; };
  const RED = 0xd8392b, YEL = 0xf4c430, CREAM = 0xf6ecd8, DARK = 0x2b2a2e;
  const mRed = mat(RED, 0.55), mYel = mat(YEL, 0.5), mCream = mat(CREAM, 0.85), mSteel = mat(0xc9ced4, 0.3, { metalness: 0.55 });
  const mWood = mat(0xb07a4a, 0.6), mDark = mat(DARK, 0.6), mWhite = mat(0xfafafa, 0.6), mGreen = mat(0x3f8f5a, 0.6);
  const label = (w, h, draw) => canvasTex(w, h, draw);
  const plane = (w, h, tex, p, x, y, z, ry = 0, basic = false) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; p.add(m); return m;
  };

  // ============================================================== OUTSIDE: sky, ground, road, lot, lane, pond
  const skyTex = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5d9fe0'); gr.addColorStop(0.42, '#a9d2f2'); gr.addColorStop(0.5, '#f4e7d2'); gr.addColorStop(1, '#f4e7d2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat); sky.renderOrder = -2; root.add(sky);
  // clouds: soft sprites high in the sky
  const cloudTex = canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 7; i++) { const x = 40 + i * 28, y = 70 - Math.sin(i * 0.9) * 18, r = 34 + (i % 3) * 10; const gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  const clouds = new THREE.Group(); root.add(clouds);
  for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, opacity: 0.9 })); const a = -1.2 + i * 0.32 + R() * 0.2; s.position.set(Math.sin(a) * 200, 55 + R() * 40, -Math.cos(a) * 200 + 40); s.scale.set(70 + R() * 40, 30 + R() * 14, 1); clouds.add(s); }

  // grass ground with a round hole where the pond goes
  const grassTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#79b04f'; g.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 900; i++) { g.fillStyle = `hsl(${88 + r() * 20},${42 + r() * 12}%,${34 + r() * 12}%)`; g.fillRect(r() * w, r() * h, 2, 5); } }, [60, 60]);
  const gShape = new THREE.Shape(); gShape.moveTo(-150, -150); gShape.lineTo(150, -150); gShape.lineTo(150, 150); gShape.lineTo(-150, 150); gShape.lineTo(-150, -150);
  const hole = new THREE.Path(); hole.absarc(D.pond.x, -D.pond.z, D.pond.r, 0, Math.PI * 2, true); gShape.holes.push(hole);   // shape y = −world z (the plane is rotated −π/2 about x)
  const groundGeo = new THREE.ShapeGeometry(gShape, 48);
  { const uv = groundGeo.attributes.uv, pos = groundGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 300 + 0.5, pos.getY(i) / 300 + 0.5); }
  const ground = mk(groundGeo, new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }), root); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  // asphalt: parking lot in front, the drive-thru lane on the east side, a strip behind; road + sidewalks at z ≈ 24
  const asphaltTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4b4d52'; g.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${0.04 + r() * 0.06})`; g.fillRect(r() * w, r() * h, 2, 2); } }, [8, 8]);
  const mAsph = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.9 });
  const pave = (x0, x1, z0, z1, y = 0.006, m = mAsph) => { const p = mk(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, root, (x0 + x1) / 2, y, (z0 + z1) / 2); p.rotation.x = -Math.PI / 2; p.castShadow = false; return p; };
  pave(-22, 11.2, 6, 21);   // lot
  pave(8.0, 11.2, -12, 6);   // drive-thru lane
  pave(-22, 8.0, -12, -6);   // service strip behind
  pave(-120, 120, 21.5, 27);  // road
  const mWalk = mat(0xcfc9bd, 0.85);
  pave(-120, 120, 20.6, 21.5, 0.012, mWalk); pave(-120, 120, 27, 28.4, 0.012, mWalk); pave(-7.6, 7.6, 6, 7.4, 0.012, mWalk);
  const mLine = new THREE.MeshBasicMaterial({ color: 0xf2f2ea }), mYLine = new THREE.MeshBasicMaterial({ color: 0xf2c94c });
  for (let x = -110; x < 110; x += 6) flat(box(3, 0.01, 0.16, mYLine, x, 0.012, 24.25));
  for (let x = -19; x <= 6; x += 2.9) flat(box(0.12, 0.01, 4.6, mLine, x, 0.012, 11.0));
  for (let x = -19; x <= 6; x += 2.9) flat(box(0.12, 0.01, 4.6, mLine, x, 0.012, 18.4));
  const arrowTex = label(128, 256, (g, w, h) => { g.fillStyle = '#f2f2ea'; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w - 10, 110); g.lineTo(w * 0.66, 110); g.lineTo(w * 0.66, h - 10); g.lineTo(w * 0.34, h - 10); g.lineTo(w * 0.34, 110); g.lineTo(10, 110); g.closePath(); g.fill(); });
  for (const z of [2, -7]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true })); a.rotation.x = -Math.PI / 2; a.rotation.z = Math.PI; a.position.set(D.lane.x, 0.014, z); root.add(a); }
  // curbs around the lane island
  const mCurb = mat(0xd9d4c8, 0.8);
  box(0.25, 0.14, 15.6, mCurb, 7.95, 0.07, -3.9); box(0.25, 0.14, 18, mCurb, 11.25, 0.07, -3.0);

  // trees: low-poly crowns (flat shaded icosahedra), like a toy town
  const trunkM = mat(0x7a5236, 0.8), leafMs = [0x4f9a3f, 0x5fae47, 0x3f8a3a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true }));
  const tree = (x, z, s = 1, k = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); root.add(g);
    cyl(0.14, 0.2, 2.2, trunkM, 0, 1.1, 0, g, 8);
    mk(new THREE.IcosahedronGeometry(1.5, 0), leafMs[k % 3], g, 0, 3.0, 0).rotation.set(R(), R(), 0);
    mk(new THREE.IcosahedronGeometry(1.1, 0), leafMs[(k + 1) % 3], g, 0.7, 3.7, 0.2).rotation.set(R(), R(), 0);
    mk(new THREE.IcosahedronGeometry(1.0, 0), leafMs[(k + 2) % 3], g, -0.6, 3.6, -0.3).rotation.set(R(), R(), 0);
    return g;
  };
  const trees = [];
  [[-10, 4, 1.2], [-14, -2, 1.4], [-11, -9, 1.3], [-18, 8, 1.1], [13, 9, 1.2], [24, 6, 1.4], [26, -6, 1.3], [22, -12, 1.5], [12, -12, 1.2],
    [-24, 14, 1.3], [4, -14, 1.4], [-4, -15, 1.2], [30, 12, 1.5], [-30, 2, 1.6]].forEach(([x, z, s], i) => trees.push(tree(x, z, s, i)));
  for (let i = 0; i < 18; i++) trees.push(tree(-60 + i * 7.5 + R() * 3, 33 + R() * 3, 1.2 + R() * 0.5, i));
  // houses + low shops across the road, hills far off
  const houseCols = [0xe9d9b8, 0xc9dbe6, 0xf0c9b0, 0xd7e3c3, 0xf2e2a5, 0xe6c3c3];
  for (let i = 0; i < 12; i++) {
    const x = -55 + i * 10 + R() * 2, z = 38 + R() * 3, w = 6 + R() * 2, h = 3.6 + R() * 2.4, d = 6;
    box(w, h, d, mat(houseCols[i % 6], 0.85), x, h / 2, z);
    const roof = mk(new THREE.ConeGeometry(w * 0.75, 2.2, 4), mat([0x9a4a3a, 0x5a5a6a, 0x7a5a3a][i % 3], 0.8), root, x, h + 1.1, z); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, d / w);
    for (const wx of [-w * 0.25, w * 0.25]) flat(box(0.9, 0.9, 0.05, mat(0x3a4a5a, 0.3), x + wx, h * 0.55, z - d / 2 - 0.01));
  }
  const hillM = new THREE.MeshStandardMaterial({ color: 0x8fb87a, roughness: 1, flatShading: true });
  for (let i = 0; i < 7; i++) { const h = mk(new THREE.SphereGeometry(40 + R() * 25, 10, 6), hillM, root, -150 + i * 50, -18, 120 + R() * 40); h.scale.y = 0.55; h.castShadow = false; }
  for (let i = 0; i < 6; i++) { const h = mk(new THREE.SphereGeometry(35 + R() * 20, 10, 6), hillM, root, -140 + i * 55, -16, -110 - R() * 30); h.scale.y = 0.5; h.castShadow = false; }

  // lamp posts, a pylon sign by the road, planters, a bike rack, parked cars
  const mPole = mat(0x3a3d44, 0.4, { metalness: 0.4 });
  for (const [x, z] of [[-16, 14.6], [-6, 14.6], [4, 14.6], [9.6, 14.6]]) { cyl(0.07, 0.09, 6, mPole, x, 3, z); box(1.1, 0.12, 0.3, mPole, x + 0.45, 6.0, z); flat(box(0.7, 0.04, 0.22, new THREE.MeshBasicMaterial({ color: 0xfff6dc }), x + 0.6, 5.93, z)); }
  const logoTex = label(1024, 360, (g, w, h) => {
    g.fillStyle = '#d8392b'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 70); g.fill();
    g.strokeStyle = '#f4c430'; g.lineWidth = 18; g.beginPath(); g.roundRect(26, 26, w - 52, h - 52, 56); g.stroke();
    g.font = '900 190px Inter, Arial'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = '#7a1a12'; g.strokeText("CHOMPY'S", w / 2, 222); g.fillStyle = '#f4c430'; g.fillText("CHOMPY'S", w / 2, 222);
    g.font = '800 52px Inter, Arial'; g.fillStyle = '#fff6e0'; g.fillText('BURGERS · FRIES · SHAKES', w / 2, 304);
  });
  const pylon = new THREE.Group(); pylon.position.set(-13, 0, 19.6); root.add(pylon);
  box(0.4, 7.5, 0.4, mPole, 0, 3.75, 0, pylon); box(5.2, 1.9, 0.4, mRed, 0, 8.2, 0, pylon);
  plane(4.9, 1.72, logoTex, pylon, 0, 8.2, 0.21, 0, true); plane(4.9, 1.72, logoTex, pylon, 0, 8.2, -0.21, Math.PI, true);
  const burgerIcon = new THREE.Group(); burgerIcon.position.set(0, 9.9, 0); pylon.add(burgerIcon);
  for (const [y, r, h, c] of [[-0.42, 0.95, 0.3, 0xd8a050], [-0.2, 1.0, 0.18, 0x6a3a1e], [-0.08, 1.05, 0.08, 0x5fae47], [0.02, 1.0, 0.07, 0xf4c430], [0.3, 0.95, 0.5, 0xe0a95a]]) cyl(r, r, h, mat(c, 0.6), 0, y, 0, burgerIcon, 24).scale.z = 0.35;
  const planters = [];
  for (const x of [-6.6, -2.2, 2.2, 6.6]) { const p = rbox(0.9, 0.55, 0.6, 0.06, mat(0x8a6a4a, 0.7), x, 0.28, 6.9); planters.push(p); for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.16, 8, 6), mat([0xe2574c, 0xf4c430, 0xffffff][k % 3], 0.7), root, x - 0.32 + k * 0.16, 0.62, 6.9 + (k % 2 ? 0.1 : -0.1)); }
  const cars = [];
  [[-17.5, 11, 0xd2483f], [-11.7, 11, 0x3d7bd9], [-8.8, 18.4, 0xf2c14e], [-3.0, 11, 0xe8e4dc], [-14.6, 18.4, 0x4f9a6a]].forEach(([x, z, c], i) => { const car = makeCar(c, i + 3); car.g.position.set(x, 0, z); car.g.rotation.y = z < 15 ? Math.PI : 0; root.add(car.g); cars.push(car); });
  // drive-thru menu board + speaker post on the lane
  const dtTex = label(512, 640, (g, w, h) => { g.fillStyle = '#2b2a2e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4c430'; g.font = '900 64px Inter, Arial'; g.textAlign = 'center'; g.fillText('ORDER HERE', w / 2, 84); g.font = '700 38px Inter, Arial'; g.fillStyle = '#fff'; ['CHOMP STACK  6.49', 'DOUBLE CHOMP  7.99', 'FRIES  2.79', 'SHAKE  3.49', 'SALAD  5.29'].forEach((s, i) => g.fillText(s, w / 2, 170 + i * 82)); });
  const dtb = new THREE.Group(); dtb.position.set(11.6, 0, 2.4); root.add(dtb);
  box(0.16, 1.2, 0.16, mPole, 0, 0.6, 0, dtb); box(1.6, 2.0, 0.2, mDark, 0, 2.1, 0, dtb); plane(1.5, 1.88, dtTex, dtb, -0.11, 2.1, 0, -Math.PI / 2, true);
  const dtSign = label(512, 160, (g, w, h) => { g.fillStyle = '#f4c430'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1a12'; g.font = '900 86px Inter, Arial'; g.textAlign = 'center'; g.fillText('DRIVE-THRU ➜', w / 2, 112); });
  const dtPost = new THREE.Group(); dtPost.position.set(8.4, 0, 9.2); root.add(dtPost); box(0.12, 2.2, 0.12, mPole, 0, 1.1, 0, dtPost); plane(1.6, 0.5, dtSign, dtPost, 0, 2.3, 0.07, 0, true);

  // ============================================================== THE BUILDING
  const b = new THREE.Group(); root.add(b);
  const brickTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#e6dccb'; g.fillRect(0, 0, w, h); const r = rng(9); for (let row = 0; row < 8; row++) for (let c = -1; c < 9; c++) { const x = c * 64 + (row % 2) * 32, y = row * 32; g.fillStyle = `hsl(${10 + r() * 10},${48 + r() * 12}%,${40 + r() * 10}%)`; g.fillRect(x + 3, y + 3, 58, 26); } }, [6, 1]);
  const mBrick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
  const stucco = mat(0xf3ead8, 0.9), wallIn = mat(0xfbf3e4, 0.9), wains = mat(RED, 0.6);
  const glassM = new THREE.MeshStandardMaterial({ color: 0xbfd8e8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false });
  const mFrame = mat(0x2f3136, 0.4, { metalness: 0.3 });
  const H = Rm.h, T = 0.22;
  // floor: cream + terracotta tiles in the dining room, red quarry tile in the kitchen
  const tileTex = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f1e3cb' : '#d9774c'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(80,50,30,.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [14 / 1.6, 6.4 / 1.6]);
  const dining = mk(new THREE.PlaneGeometry(14, 6.4), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.32 }), b, 0, 0.003, 2.8); dining.rotation.x = -Math.PI / 2; dining.castShadow = false;
  const quarryTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a8432e'; g.fillRect(0, 0, w, h); const r = rng(11); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = `hsl(${10 + r() * 6},${50 + r() * 8}%,${36 + r() * 6}%)`; g.fillRect(x * 32 + 1.5, y * 32 + 1.5, 29, 29); } }, [7, 3.2]);
  const kfloor = mk(new THREE.PlaneGeometry(14, 5.6), new THREE.MeshStandardMaterial({ map: quarryTex, roughness: 0.45 }), b, 0, 0.003, -3.2); kfloor.rotation.x = -Math.PI / 2; kfloor.castShadow = false;
  // walls: back + sides (inside face cream with a red wainscot + yellow rail; outside face stucco + brick base)
  const wall = (w, x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; b.add(g);
    box(w, H, T, wallIn, 0, H / 2, 0, g);
    box(w, 1.0, 0.02, wains, 0, 0.5, T / 2 + 0.01, g); box(w, 0.07, 0.04, mYel, 0, 1.02, T / 2 + 0.02, g);
    box(w, 1.0, 0.02, mBrick, 0, 0.5, -T / 2 - 0.01, g); box(w, H - 1.0, 0.02, stucco, 0, (H + 1.0) / 2, -T / 2 - 0.01, g);
    return g;
  };
  wall(14 + T, 0, Rm.z0 - T / 2, 0);                 // back wall (inside face toward +z)
  wall(12, Rm.x0 - T / 2, 0, Math.PI / 2);         // left wall (inside face toward +x)
  // right wall with the drive-thru window opening at z ∈ [-3.7, -2.3], y ∈ [0.95, 2.05]
  {
    const g = new THREE.Group(); g.position.set(Rm.x1 + T / 2, 0, 0); g.rotation.y = -Math.PI / 2; b.add(g);
    // rotation −π/2: local +x = world +z, local +z = world −x (the inside)
    const seg = (lx0, lx1, y0, y1) => { const w = lx1 - lx0, h = y1 - y0, cx = (lx0 + lx1) / 2, cy = (y0 + y1) / 2; box(w, h, T, wallIn, cx, cy, 0, g); if (y0 < 1.0) { const wh = Math.min(1.0, y1) - y0; box(w, wh, 0.02, wains, cx, y0 + wh / 2, T / 2 + 0.01, g); box(w, wh, 0.02, mBrick, cx, y0 + wh / 2, -T / 2 - 0.01, g); } if (y1 > 1.0) { const s0 = Math.max(1.0, y0); box(w, y1 - s0, 0.02, stucco, cx, (y1 + s0) / 2, -T / 2 - 0.01, g); } };
    seg(-6, -3.7, 0, H); seg(-2.3, 6, 0, H); seg(-3.7, -2.3, 0, 0.95); seg(-3.7, -2.3, 2.05, H);
    box(1.5, 0.07, 0.3, mFrame, -3.0, 0.95, 0, g); box(1.5, 0.07, 0.3, mFrame, -3.0, 2.05, 0, g); box(0.07, 1.1, 0.3, mFrame, -2.3, 1.5, 0, g); box(0.07, 1.1, 0.3, mFrame, -3.7, 1.5, 0, g);
    box(1.6, 0.06, 0.6, mSteel, -3.0, 0.98, -0.25, g);   // the pickup ledge outside
  }
  // front wall: windows left/right of the door, the door opening x ∈ [-0.65, 0.65]
  const front = new THREE.Group(); front.position.set(0, 0, Rm.z1 + T / 2); b.add(front);
  const fseg = (x0, x1, y0, y1, inside = wallIn) => { const w = x1 - x0, h = y1 - y0; box(w, h, T, inside, (x0 + x1) / 2, (y0 + y1) / 2, 0, front); if (y0 < 1) box(w, Math.min(1, y1) - y0, 0.02, mBrick, (x0 + x1) / 2, (y0 + Math.min(1, y1)) / 2, T / 2 + 0.01, front); else box(w, h, 0.02, stucco, (x0 + x1) / 2, (y0 + y1) / 2, T / 2 + 0.01, front); };
  for (const [x0, x1] of [[-7.1, -0.65], [0.65, 7.1]]) {
    fseg(x0, x1, 0, 0.85); fseg(x0, x1, 2.6, H);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 1.75), glassM); gl.position.set((x0 + x1) / 2, 1.725, 0); front.add(gl);
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 3) box(0.08, 1.75, 0.16, mFrame, x, 1.725, 0, front);
    box(x1 - x0, 0.08, 0.3, mFrame, (x0 + x1) / 2, 0.87, 0, front);
  }
  fseg(-0.65, 0.65, D.door.h, H);
  // the door frame (pops off when the hippo squeezes through) + a glass door swung open against the outside wall
  const doorFrame = new THREE.Group(); doorFrame.position.set(0, 0, Rm.z1 + T / 2); b.add(doorFrame);
  box(0.12, D.door.h, 0.3, mFrame, -0.62, D.door.h / 2, 0, doorFrame); box(0.12, D.door.h, 0.3, mFrame, 0.62, D.door.h / 2, 0, doorFrame); box(1.36, 0.12, 0.3, mFrame, 0, D.door.h, 0, doorFrame);
  const doorLeaf = new THREE.Group(); doorLeaf.position.set(0.6, 0, 0.16); doorFrame.add(doorLeaf);
  box(0.07, 2.2, 0.06, mFrame, -0.035, 1.1, 0, doorLeaf); box(0.07, 2.2, 0.06, mFrame, -1.13, 1.1, 0, doorLeaf); box(1.16, 0.08, 0.06, mFrame, -0.58, 2.16, 0, doorLeaf); box(1.16, 0.08, 0.06, mFrame, -0.58, 0.05, 0, doorLeaf);
  const dg = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.05), glassM); dg.position.set(-0.58, 1.1, 0); doorLeaf.add(dg);
  box(0.04, 0.5, 0.05, mSteel, -0.95, 1.05, 0.05, doorLeaf);
  doorLeaf.rotation.y = 2.6;   // propped wide open, angled out along the facade
  // ceiling + roof + parapet + the CHOMPY'S sign + awnings + NOW HIRING banner
  box(14.4, 0.12, 12.4, mat(0xf7f2ea, 0.9), 0, H + 0.06, 0);
  const roofTop = box(14.6, 0.3, 12.6, mat(0x8a8d93, 0.9), 0, H + 0.27, 0);
  box(14.7, 1.8, 0.3, mRed, 0, H + 0.9, Rm.z1 + 0.3); box(0.3, 1.8, 12.6, mRed, Rm.x1 + 0.3, H + 0.9, 0); box(0.3, 1.8, 12.6, mRed, Rm.x0 - 0.3, H + 0.9, 0); box(14.7, 1.8, 0.3, mRed, 0, H + 0.9, Rm.z0 - 0.3);
  box(14.8, 0.12, 0.4, mYel, 0, H + 1.83, Rm.z1 + 0.3);
  plane(4.9, 1.72, logoTex, b, 0, H + 0.92, Rm.z1 + 0.47, 0, true);
  plane(4.6, 1.62, logoTex, b, Rm.x1 + 0.47, H + 0.92, 0, Math.PI / 2, true);
  const stripeTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f4c430' : '#d8392b'; g.fillRect(i * 32, 0, 32, h); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h - 10, w, 10); }, [3, 1]);
  for (const [x0, x1] of [[-6.9, -0.9], [0.9, 6.9]]) { const aw = mk(new THREE.PlaneGeometry(x1 - x0, 1.1), new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.8, side: THREE.DoubleSide }), b, (x0 + x1) / 2, 2.6, Rm.z1 + 0.62); aw.rotation.x = -0.75; }
  const hireTex = label(1024, 256, (g, w, h) => { g.fillStyle = '#f4c430'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8392b'; g.lineWidth = 14; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = '#c62e22'; g.font = '900 150px Inter, Arial'; g.textAlign = 'center'; g.fillText('NOW HIRING', w / 2, 180); });
  const hiring = plane(1.8, 0.45, hireTex, b, 0, 2.88, Rm.z1 + 0.3, 0); hiring.material.side = THREE.DoubleSide;   // right over the door
  // a little welcome mat
  flat(box(1.4, 0.015, 0.9, mat(0x5a3a2a, 0.95), 0, 0.012, Rm.z1 + 0.75));

  // ============================================================== INSIDE
  // ceiling light panels + a few hanging pendants over the booths
  const panelM = new THREE.MeshBasicMaterial({ color: 0xfff6e2 });
  const panels = [];
  for (const x of [-4.5, 0, 4.5]) for (const z of [-3.6, 0.6, 3.8]) { const p = flat(box(1.6, 0.04, 0.6, panelM, x, H - 0.03, z, b)); panels.push(p); }
  const pend = [];
  for (const z of [1.9, 3.6, 5.2]) { cyl(0.008, 0.008, 1.1, mDark, -6.2, H - 0.55, z, b, 6); const sh = mk(new THREE.ConeGeometry(0.22, 0.24, 16, 1, true), mat(RED, 0.5, { side: THREE.DoubleSide }), b, -6.2, H - 1.2, z); pend.push(sh); flat(mk(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe6b0 }), b, -6.2, H - 1.27, z)); }

  // counter with three registers, a tray stack, napkins, straws, a tip jar; ORDER HERE sign
  const C = D.counter, counter = new THREE.Group(); b.add(counter);
  box(C.x1 - C.x0, C.h - 0.05, C.d, mRed, (C.x0 + C.x1) / 2, (C.h - 0.05) / 2, C.z, counter);
  box(C.x1 - C.x0, 0.06, 0.02, mYel, (C.x0 + C.x1) / 2, 0.75, C.z + C.d / 2 + 0.01, counter);
  box(C.x1 - C.x0, 0.07, 0.02, mYel, (C.x0 + C.x1) / 2, 0.25, C.z + C.d / 2 + 0.01, counter);
  const cTop = box(C.x1 - C.x0 + 0.1, 0.06, C.d + 0.12, mat(0xeee3cf, 0.3), (C.x0 + C.x1) / 2, C.h, C.z, counter);
  const registers = [];
  for (const x of [-3.4, -1.6, 0.4]) {
    const r = new THREE.Group(); r.position.set(x, C.h + 0.03, C.z - 0.05); counter.add(r);
    rbox(0.42, 0.12, 0.36, 0.02, mDark, 0, 0.06, 0, r); box(0.06, 0.18, 0.06, mDark, 0, 0.2, -0.05, r);
    const scr = rbox(0.4, 0.28, 0.04, 0.015, mDark, 0, 0.36, -0.05, r); scr.rotation.x = -0.35;
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.24), new THREE.MeshBasicMaterial({ color: 0x3a8ad6 })); sc.position.set(0, 0.365, -0.068); sc.rotation.set(-0.35, Math.PI, 0); r.add(sc);
    const sc2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.08), new THREE.MeshBasicMaterial({ color: 0x9fe08a })); sc2.position.set(0, 0.2, 0.031); r.add(sc2);
    registers.push(r);
  }
  for (let k = 0; k < 8; k++) rbox(0.36, 0.02, 0.28, 0.008, mat([0xd8392b, 0xf4c430][k % 2], 0.5), 2.2, C.h + 0.04 + k * 0.022, C.z);
  rbox(0.14, 0.16, 0.1, 0.02, mSteel, 1.6, C.h + 0.11, C.z + 0.15); cyl(0.05, 0.05, 0.22, mat(0xeaf2f5, 0.1, { transparent: true, opacity: 0.6 }), -2.5, C.h + 0.14, C.z + 0.2);
  for (let k = 0; k < 9; k++) cyl(0.004, 0.004, 0.24, mat([0xd8392b, 0xffffff][k % 2], 0.5), -2.5 + (k % 3 - 1) * 0.02, C.h + 0.2, C.z + 0.2 + (Math.floor(k / 3) - 1) * 0.02, root, 5);
  // menu boards hanging over the counter
  const menuDraw = (title, items, icon) => label(768, 320, (g, w, h) => {
    g.fillStyle = '#25302b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4c430'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f4c430'; g.font = '900 54px Inter, Arial'; g.fillText(title, 34, 70);
    g.font = '700 32px Inter, Arial'; items.forEach(([n, p], i) => { g.fillStyle = '#fff'; g.fillText(n, 34, 124 + i * 46); g.fillStyle = '#f4c430'; g.textAlign = 'right'; g.fillText(p, w * 0.62, 124 + i * 46); g.textAlign = 'left'; });
    icon(g, w * 0.82, h * 0.56);
  });
  const burgerDraw = (g, x, y) => { g.fillStyle = '#e0a95a'; g.beginPath(); g.ellipse(x, y - 30, 90, 50, 0, Math.PI, 0); g.fill(); g.fillStyle = '#5fae47'; g.fillRect(x - 95, y - 30, 190, 14); g.fillStyle = '#f4c430'; g.fillRect(x - 90, y - 16, 180, 12); g.fillStyle = '#6a3a1e'; g.beginPath(); g.roundRect(x - 92, y - 6, 184, 30, 14); g.fill(); g.fillStyle = '#d8a050'; g.beginPath(); g.roundRect(x - 88, y + 26, 176, 30, 12); g.fill(); };
  const friesDraw = (g, x, y) => { g.fillStyle = '#f4c430'; for (let i = 0; i < 7; i++) g.fillRect(x - 60 + i * 18, y - 80 + (i % 3) * 10, 12, 80); g.fillStyle = '#d8392b'; g.beginPath(); g.moveTo(x - 75, y - 20); g.lineTo(x + 75, y - 20); g.lineTo(x + 55, y + 80); g.lineTo(x - 55, y + 80); g.closePath(); g.fill(); };
  const cupDraw = (g, x, y) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - 60, y - 70); g.lineTo(x + 60, y - 70); g.lineTo(x + 45, y + 85); g.lineTo(x - 45, y + 85); g.closePath(); g.fill(); g.fillStyle = '#d8392b'; g.fillRect(x - 55, y - 20, 110, 40); g.fillStyle = '#ddd'; g.fillRect(x - 66, y - 84, 132, 16); g.fillStyle = '#f4c430'; g.fillRect(x + 10, y - 140, 10, 60); };
  const menus = [
    ['BURGERS', [['CHOMP STACK', '6.49'], ['DOUBLE CHOMP', '7.99'], ['VEGGIE', '5.99'], ['KIDS', '3.99']], burgerDraw],
    ['SIDES', [['FRIES', '2.79'], ['ONION RINGS', '3.29'], ['SALAD BAR', '5.29'], ['NUGGETS', '4.49']], friesDraw],
    ['DRINKS', [['FIZZ', '1.99'], ['SHAKES', '3.49'], ['ICED TEA', '1.79'], ['WATER', '0.99']], cupDraw],
  ].map(([t, it, ic], i) => { const m = plane(2.3, 0.96, menuDraw(t, it, ic), b, -3.3 + i * 2.45, 2.82, 0.05, 0, true); box(2.36, 1.02, 0.06, mDark, -3.3 + i * 2.45, 2.82, 0.01, b); cyl(0.008, 0.008, 0.25, mDark, -3.3 + i * 2.45 - 0.9, 3.36, 0.03, b, 5); cyl(0.008, 0.008, 0.25, mDark, -3.3 + i * 2.45 + 0.9, 3.36, 0.03, b, 5); return m; });

  // kitchen: grill line on the back wall (flat-top with patties, fryers), a hood, shelves with boxes, a prep table on the left wall
  const kit = new THREE.Group(); b.add(kit);
  const grill = new THREE.Group(); grill.position.set(-2.6, 0, -5.45); kit.add(grill);
  box(2.4, 0.86, 0.8, mSteel, 0, 0.43, 0, grill); box(2.3, 0.05, 0.72, mat(0x2a2a2c, 0.35, { metalness: 0.4 }), 0, 0.885, 0, grill);
  const patties = [];
  for (let k = 0; k < 8; k++) { const p = cyl(0.1, 0.1, 0.035, mat(0x5a2e16, 0.7), -0.9 + (k % 4) * 0.55, 0.93, -0.15 + Math.floor(k / 4) * 0.33, grill, 14); patties.push(p); }
  for (let k = 0; k < 4; k++) { const p = cyl(0.11, 0.11, 0.04, mat(0xe0a95a, 0.7), 1.3 + 0.0, 0.93 + k * 0.045, 0.0, kit, 14); p.position.set(-1.0, 0.93 + k * 0.045, -5.3); }
  const fry = new THREE.Group(); fry.position.set(0.3, 0, -5.45); kit.add(fry);
  box(1.4, 0.9, 0.8, mSteel, 0, 0.45, 0, fry); box(1.2, 0.04, 0.6, mat(0xc9a54a, 0.2), 0, 0.9, 0, fry);
  for (const x of [-0.3, 0.3]) { box(0.4, 0.18, 0.3, mat(0x9aa0a8, 0.3, { metalness: 0.7 }), x, 1.0, -0.05, fry); box(0.03, 0.03, 0.4, mDark, x, 1.12, 0.25, fry); }
  const hood = box(4.6, 0.6, 1.2, mSteel, -1.2, 2.5, -5.3, kit);
  for (const [x, w] of [[3.0, 2.4], [5.6, 1.6]]) for (const y of [1.35, 1.95]) { box(w, 0.04, 0.45, mSteel, x, y, -5.7, kit); for (let k = 0; k < Math.floor(w / 0.45); k++) rbox(0.38, 0.3, 0.36, 0.02, mat([0xc9a274, 0xb98a5a][k % 2], 0.85), x - w / 2 + 0.25 + k * 0.45, y + 0.17, -5.7, kit); }
  box(0.8, 0.9, 3.0, mSteel, -6.4, 0.45, -3.2, kit);   // prep table
  for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.09, 10, 8), mat([0xd8392b, 0x5fae47, 0xf4c430][k % 3], 0.6), kit, -6.4, 0.98, -4.3 + k * 0.5);
  // walk-in cooler door + EMPLOYEES ONLY sign
  rbox(1.2, 2.2, 0.08, 0.03, mSteel, 5.4, 1.1, Rm.z0 + 0.05, kit);
  plane(0.8, 0.22, label(400, 110, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8392b'; g.font = '800 40px Inter, Arial'; g.textAlign = 'center'; g.fillText('EMPLOYEES ONLY', w / 2, 70); }), kit, 5.4, 1.75, Rm.z0 + 0.1);
  // a heat-lamp pass shelf right behind the counter with wrapped burgers
  box(3.0, 0.04, 0.35, mSteel, -1.6, 1.5, 0.05, kit); for (let k = 0; k < 6; k++) rbox(0.18, 0.1, 0.18, 0.04, mat([0xf4c430, 0xd8392b][k % 2], 0.6), -2.8 + k * 0.45, 1.57, 0.05, kit);
  for (let k = 0; k < 3; k++) flat(box(0.5, 0.05, 0.12, new THREE.MeshBasicMaterial({ color: 0xffb070 }), -2.6 + k * 1.0, 1.95, 0.05, kit));

  // FIZZ soda fountain on the right wall (dining side): cabinet, tower with six nozzles + levers, backlit panel, cups, lids
  const F = D.fizz, fizz = new THREE.Group(); fizz.position.set(F.x, 0, (F.z0 + F.z1) / 2); fizz.rotation.y = -Math.PI / 2; b.add(fizz);
  rbox(2.0, F.top, 0.75, 0.03, mat(0x2b7a4b, 0.55), 0, F.top / 2, 0, fizz);
  box(2.05, 0.05, 0.8, mat(0xdadfe3, 0.3), 0, F.top + 0.02, 0, fizz);
  const tower = rbox(1.5, 0.75, 0.42, 0.04, mSteel, 0, F.top + 0.42, -0.12, fizz);
  const fizzTex = label(768, 320, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2b7a4b'); gr.addColorStop(1, '#3fae6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f4c430'; g.font = '900 150px Inter, Arial'; g.fillText('FIZZ', 40, 160); g.fillStyle = '#fff'; g.font = '700 40px Inter, Arial'; g.fillText('COLA · ORANGE · LEMON', 44, 230); for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(560 + (i % 4) * 50, 60 + Math.floor(i / 4) * 60, 10 + (i % 3) * 6, 0, 7); g.stroke(); } });
  plane(1.5, 0.62, fizzTex, fizz, 0, F.top + 1.15, -0.3, 0, true); box(1.56, 0.68, 0.05, mat(0x1f5a37, 0.5), 0, F.top + 1.15, -0.34, fizz);
  const nozzles = [], noz = [0xd8392b, 0xf28a2a, 0xf4e04a, 0x7a3a1a, 0x5fae47, 0x9fd0ff];
  for (let k = 0; k < 6; k++) { const x = -0.6 + k * 0.24; cyl(0.03, 0.025, 0.08, mat(0x9aa0a8, 0.3, { metalness: 0.7 }), x, F.top + 0.13, 0.04, fizz, 10); rbox(0.08, 0.14, 0.04, 0.01, mat(noz[k], 0.4), x, F.top + 0.3, 0.1, fizz); nozzles.push(new THREE.Vector3(x, F.top + 0.08, 0.04)); }
  for (let k = 0; k < 3; k++) for (let j = 0; j < 6; j++) cyl(0.05, 0.04, 0.12, mWhite, 0.85, F.top + 0.08 + j * 0.03, -0.25 + k * 0.12, fizz, 12);

  // salad bar: island counter, sneeze guard, six bins of produce (each a little instanced pile that empties with setEaten)
  const S = D.salad, salad = new THREE.Group(); salad.position.set(S.x, 0, S.z); b.add(salad);
  rbox(S.len, S.top, 0.95, 0.04, mat(0xb07a4a, 0.55), 0, S.top / 2, 0, salad);
  box(S.len + 0.05, 0.05, 1.0, mat(0xdadfe3, 0.3), 0, S.top + 0.02, 0, salad);
  const guard = new THREE.Mesh(new THREE.PlaneGeometry(S.len, 0.5), glassM); guard.position.set(0, S.top + 0.55, 0); guard.rotation.x = -Math.PI / 2 + 0.5; salad.add(guard);
  for (const x of [-S.len / 2 + 0.05, 0, S.len / 2 - 0.05]) cyl(0.015, 0.015, 0.5, mSteel, x, S.top + 0.3, 0, salad, 8);
  plane(1.0, 0.24, label(500, 120, (g, w, h) => { g.fillStyle = '#5fae47'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 72px Inter, Arial'; g.textAlign = 'center'; g.fillText('SALAD BAR', w / 2, 88); }), salad, 0, S.top + 0.66, 0.0, 0, true).rotation.x = -0.5;
  const binCols = [[0x6fbf4a, 'leaf'], [0xd9412f, 'tomato'], [0xf28a2a, 'carrot'], [0xb9e08a, 'cuke'], [0xd9a860, 'crouton'], [0xf4d03a, 'corn']];
  const bins = [], pieceGeo = { leaf: new THREE.IcosahedronGeometry(0.04, 0), tomato: new THREE.SphereGeometry(0.03, 8, 6), carrot: new THREE.CylinderGeometry(0.012, 0.012, 0.05, 6), cuke: new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), crouton: new THREE.BoxGeometry(0.03, 0.03, 0.03), corn: new THREE.SphereGeometry(0.014, 6, 5) };
  binCols.forEach(([c, kind], i) => {
    const bx = -S.len / 2 + 0.3 + (i % 3) * (S.len - 0.6) / 2 + (i >= 3 ? 0.0 : 0), bz = i < 3 ? -0.22 : 0.22;
    const bg = new THREE.Group(); bg.position.set(bx * 0.95, S.top, bz); salad.add(bg);
    box(0.52, 0.12, 0.34, mSteel, 0, 0.0, 0, bg);
    const N = 60, im = new THREE.InstancedMesh(pieceGeo[kind], new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, flatShading: kind === 'leaf' }), N); im.castShadow = true;
    const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), base = [];
    for (let k = 0; k < N; k++) { const p = new THREE.Vector3((R() - 0.5) * 0.44, 0.07 + R() * 0.07, (R() - 0.5) * 0.26); base.push(p); q.setFromEuler(e.set(R() * 6, R() * 6, R() * 6)); mm.compose(p, q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(k, mm); }
    bg.add(im); im.frustumCulled = false;
    bins.push({ g: bg, im, base, N, kind, color: c });
  });
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  let eatenK = -1;
  function setEaten(k) {
    if (Math.abs(k - eatenK) < 0.004) return; eatenK = k;
    bins.forEach((B, bi) => { const kk = clamp(k * 1.15 - bi * 0.03); for (let i = 0; i < B.N; i++) { const gone = (i / B.N) < kk; const R2 = rng(bi * 100 + i); _q.setFromEuler(_e.set(R2() * 6, R2() * 6, R2() * 6)); _s.setScalar(gone ? 0.0001 : 1); _m4.compose(B.base[i], _q, _s); B.im.setMatrixAt(i, _m4); } B.im.instanceMatrix.needsUpdate = true; });
  }

  // booths along the left windows, 4-top tables with chairs, ketchup/mustard on every table
  const mSeat = mat(0xc93a2c, 0.5), mTable = mat(0xf2e6cf, 0.35);
  const tables = [], chairs = [], booths = [];
  const condiments = (p, x, z) => { cyl(0.03, 0.03, 0.16, mat(0xd8392b, 0.4), x - 0.05, D.tableTop + 0.08, z, p, 10); cyl(0.03, 0.03, 0.16, mat(0xf4c430, 0.4), x + 0.05, D.tableTop + 0.08, z, p, 10); rbox(0.1, 0.11, 0.06, 0.01, mSteel, x, D.tableTop + 0.055, z + 0.1, p); };
  for (const z of [1.9, 3.6, 5.2]) {
    const g = new THREE.Group(); g.position.set(-6.15, 0, z); b.add(g); booths.push(g);
    box(1.3, 0.05, 0.75, mTable, 0.0, D.tableTop, 0, g); cyl(0.05, 0.05, D.tableTop, mSteel, 0, D.tableTop / 2, 0, g, 10);
    for (const s of [-1, 1]) { rbox(1.3, 0.12, 0.48, 0.04, mSeat, 0, D.seat - 0.06, s * 0.65, g); rbox(1.3, 0.62, 0.14, 0.05, mSeat, 0, D.seat + 0.28, s * 0.88, g); box(1.3, D.seat - 0.12, 0.45, mat(0x7a2a20, 0.6), 0, (D.seat - 0.12) / 2, s * 0.65, g); }
    condiments(g, 0.35, 0);
  }
  const chair = (x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; b.add(g);
    rbox(0.44, 0.05, 0.42, 0.02, mSeat, 0, D.seat, 0, g); rbox(0.44, 0.42, 0.05, 0.02, mSeat, 0, D.seat + 0.24, -0.2, g);
    for (const [lx, lz] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) cyl(0.017, 0.017, D.seat, mSteel, lx, D.seat / 2, lz, g, 8);
    const c = { g, home: { x, z, ry } }; chairs.push(c); return c;
  };
  for (const [x, z] of [[-3.7, 2.5], [-3.7, 4.7], [-1.9, 4.7]]) {
    const g = new THREE.Group(); g.position.set(x, 0, z); b.add(g);
    box(0.95, 0.05, 0.95, mTable, 0, D.tableTop, 0, g); cyl(0.05, 0.05, D.tableTop, mSteel, 0, D.tableTop / 2, 0, g, 10); cyl(0.3, 0.32, 0.03, mSteel, 0, 0.015, 0, g, 16);
    condiments(g, 0, 0);
    const T2 = { g, x, z, top: D.tableTop, chairs: [] }; tables.push(T2);
    for (const [dx, dz, ry] of [[0, 0.68, Math.PI], [0, -0.68, 0], [0.68, 0, -Math.PI / 2], [-0.68, 0, Math.PI / 2]]) { const c = chair(x + dx, z + dz, ry); c.table = T2; T2.chairs.push(c); }
  }
  // chairs flipped up on the tables (night): built once, shown by setNight
  const upChairs = new THREE.Group(); b.add(upChairs);
  for (const T2 of tables) for (let k = 0; k < 2; k++) {
    const g = new THREE.Group(); g.position.set(T2.x + (k ? 0.22 : -0.22), D.tableTop + 0.03 + D.seat + 0.02, T2.z); g.rotation.set(Math.PI, k ? Math.PI / 2 : -Math.PI / 2, 0); upChairs.add(g);
    rbox(0.44, 0.05, 0.42, 0.02, mSeat, 0, D.seat, 0, g); rbox(0.44, 0.42, 0.05, 0.02, mSeat, 0, D.seat + 0.24, -0.2, g);
    for (const [lx, lz] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) cyl(0.017, 0.017, D.seat, mSteel, lx, D.seat / 2, lz, g, 8);
  }
  upChairs.visible = false;

  // decor: posters, a clock, EMPLOYEE OF THE MONTH, plants, trash station, a high chair
  const poster = (text, sub, bg, fg, x, y, z, ry, w = 1.1, h = 1.4) => {
    const t = label(440, 560, (g, W, Hh) => { g.fillStyle = bg; g.fillRect(0, 0, W, Hh); g.fillStyle = fg; g.font = '900 64px Inter, Arial'; g.textAlign = 'center'; text.split('\n').forEach((s, i) => g.fillText(s, W / 2, 90 + i * 70)); burgerDraw(g, W / 2, Hh * 0.62); g.font = '700 34px Inter, Arial'; g.fillText(sub, W / 2, Hh - 50); });
    const p = plane(w, h, t, b, x, y, z, ry); box(w + 0.06, h + 0.06, 0.03, mDark, x - Math.sin(ry) * 0.02, y, z - Math.cos(ry) * 0.02, b).rotation.y = ry; return p;
  };
  poster('TRY THE\nCHOMP STACK', 'ONLY $6.49', '#f4c430', '#c62e22', -7 + 0.13, 1.9, 0.9, Math.PI / 2);
  poster('BIG\nBITES', 'SINCE 1987', '#d8392b', '#fff6e0', 7 - 0.13, 1.95, 4.4, -Math.PI / 2, 1.0, 1.25);
  poster('FRESH\nDAILY', 'SALAD BAR ➜', '#5fae47', '#fff', 7 - 0.13, 1.95, 5.6, -Math.PI / 2, 0.8, 1.0);
  const clockC = document.createElement('canvas'); clockC.width = clockC.height = 256; const clockTex = new THREE.CanvasTexture(clockC); clockTex.colorSpace = THREE.SRGBColorSpace;
  const clock = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32), [mDark, new THREE.MeshStandardMaterial({ map: clockTex, roughness: 0.4 }), mDark], b, 3.9, 2.55, Rm.z0 + 0.06); clock.rotation.x = Math.PI / 2; clock.rotation.y = Math.PI / 2;
  let lastClock = '';
  clock.setClock = (hh, mm2) => {
    const key = `${hh}:${mm2.toFixed(1)}`; if (key === lastClock) return; lastClock = key;
    const g = clockC.getContext('2d'); g.fillStyle = '#fffaf0'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#d8392b'; g.lineWidth = 14; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#333'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(128 + Math.sin(a) * 96 - 3, 128 - Math.cos(a) * 96 - 8, 6, 16); }
    const hand = (a, L, w) => { g.lineWidth = w; g.lineCap = 'round'; g.strokeStyle = '#222'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(a) * L, 128 - Math.cos(a) * L); g.stroke(); };
    hand(((hh % 12) + mm2 / 60) / 12 * Math.PI * 2, 56, 10); hand(mm2 / 60 * Math.PI * 2, 86, 6); clockTex.needsUpdate = true;
  };
  clock.rotation.set(Math.PI / 2, 0, 0); clock.setClock(9, 0);
  // EMPLOYEE OF THE MONTH frame on the left wall near the counter (photoSlot = plane you can re-texture)
  const eotmG = new THREE.Group(); eotmG.position.set(Rm.x0 + 0.13, 1.85, -0.3); eotmG.rotation.y = Math.PI / 2; b.add(eotmG);
  box(0.82, 1.02, 0.04, mat(0xc9a25a, 0.35, { metalness: 0.5 }), 0, 0, -0.01, eotmG);
  plane(0.74, 0.2, label(370, 100, (g, w, h) => { g.fillStyle = '#fff8e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a5200'; g.font = '800 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('EMPLOYEE', w / 2, 40); g.fillText('OF THE MONTH', w / 2, 82); }), eotmG, 0, 0.38, 0.015);
  const photoSlot = plane(0.6, 0.66, label(300, 330, (g, w, h) => { g.fillStyle = '#cfd8dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#9aa7ad'; g.beginPath(); g.arc(w / 2, h * 0.42, 70, 0, 7); g.fill(); g.fillRect(w / 2 - 100, h * 0.7, 200, 120); }), eotmG, 0, -0.1, 0.015);
  const plant = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); b.add(g); cyl(0.2, 0.16, 0.4, mat(0xd8392b, 0.6), 0, 0.2, 0, g, 14); for (let k = 0; k < 7; k++) { const l = mk(new THREE.SphereGeometry(0.16, 8, 6), leafMs[k % 3], g, Math.sin(k * 2.4) * 0.14, 0.55 + (k % 3) * 0.14, Math.cos(k * 2.4) * 0.14); l.scale.set(0.7, 1.5, 0.35); l.rotation.set(Math.cos(k) * 0.5, k, Math.sin(k) * 0.5); } return g; };
  plant(-6.6, 0.75); plant(6.55, 5.6); plant(1.4, 5.65, 0.9); plant(-1.4, 5.65, 0.9);
  const trash = new THREE.Group(); trash.position.set(6.55, 0, 3.6); b.add(trash);
  rbox(0.55, 1.05, 0.55, 0.04, mat(0x8a5a3a, 0.6), 0, 0.525, 0, trash); box(0.4, 0.2, 0.02, mDark, -0.28, 0.85, 0, trash).rotation.y = Math.PI / 2;
  plane(0.4, 0.12, label(200, 60, (g, w, h) => { g.fillStyle = '#8a5a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '700 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('THANK YOU', w / 2, 42); }), trash, -0.285, 0.66, 0, -Math.PI / 2);

  // water sheet for the flood (a rippled translucent plane over both floors)
  const ripTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7fc4e8'; g.fillRect(0, 0, w, h); const r = rng(7); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`; g.lineWidth = 2; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 30, 3 + r() * 6, 0, 0, 7); g.stroke(); } }, [10, 8]);
  const floodM = new THREE.MeshStandardMaterial({ map: ripTex, color: 0xbfe6ff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.6, depthWrite: false });
  const flood = mk(new THREE.PlaneGeometry(13.8, 11.8), floodM, b, 0, 0.01, 0); flood.rotation.x = -Math.PI / 2; flood.castShadow = false; flood.visible = false; flood.renderOrder = 2;
  function setFlood(level, t = 0) { flood.visible = level > 0.004; flood.position.y = 0.006 + level; ripTex.offset.set(t * 0.03, t * 0.02); }
  // mess (after the shift): puddles + litter on the floor
  const mess = new THREE.Group(); b.add(mess); mess.visible = false;
  const pudM = new THREE.MeshStandardMaterial({ color: 0x9fd0f0, roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false });
  for (let k = 0; k < 9; k++) { const p = mk(new THREE.CircleGeometry(0.5 + R() * 0.7, 24), pudM, mess, -5 + R() * 11, 0.012, 1.4 + R() * 4.2); p.rotation.x = -Math.PI / 2; p.scale.set(1, 0.6 + R() * 0.4, 1); p.castShadow = false; }
  for (let k = 0; k < 40; k++) { const p = mk(pieceGeo[['leaf', 'tomato', 'crouton', 'corn'][k % 4]], mat(binCols[[0, 1, 4, 5][k % 4]][0], 0.6), mess, -4 + R() * 9, 0.02, 1.6 + R() * 4); p.rotation.set(R() * 6, R() * 6, R() * 6); }
  for (let k = 0; k < 7; k++) { const c = cyl(0.05, 0.04, 0.12, mWhite, -4 + R() * 9, 0.05, 1.6 + R() * 4, mess, 10); c.rotation.set(Math.PI / 2, 0, R() * 6); }
  function setMess(k) { mess.visible = k > 0.5; }

  // ============================================================== POND (digs itself, fills, floods the lane)
  const P = D.pond, pond = new THREE.Group(); pond.position.set(P.x, 0, P.z); root.add(pond);
  const dirtM = mat(0x7a5a3a, 0.95), mudM = mat(0x5a4230, 0.9);
  const bowl = mk(new THREE.SphereGeometry(P.r, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6a4e34, roughness: 0.95, side: THREE.BackSide }), pond); bowl.scale.y = 1.6 / P.r; bowl.castShadow = false;
  const cover = mk(new THREE.RingGeometry(0.001, P.r + 0.02, 64, 1), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }), pond, 0, 0.004, 0); cover.rotation.x = -Math.PI / 2; cover.castShadow = false;
  const rim = new THREE.Group(); pond.add(rim);
  for (let k = 0; k < 26; k++) { const a = (k / 26) * Math.PI * 2, rr = P.r + 0.3 + R() * 0.4; const s = mk(new THREE.DodecahedronGeometry(0.25 + R() * 0.35, 0), new THREE.MeshStandardMaterial({ color: k % 3 ? 0x9a9488 : 0x7d776c, roughness: 0.9, flatShading: true }), rim, Math.cos(a) * rr, 0.1, Math.sin(a) * rr); s.scale.y = 0.6; }
  for (let k = 0; k < 14; k++) { const a = R() * Math.PI * 2, rr = P.r + 0.1; const reed = new THREE.Group(); reed.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); rim.add(reed); for (let j = 0; j < 4; j++) { const st = cyl(0.012, 0.018, 1.0 + R() * 0.6, mat(0x6a8a3a, 0.8), (R() - 0.5) * 0.2, 0.55, (R() - 0.5) * 0.2, reed, 5); st.rotation.set((R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3); } mk(new THREE.CapsuleGeometry(0.035, 0.14, 4, 8), mat(0x6a3e22, 0.8), reed, 0, 1.15, 0); }
  const piles = new THREE.Group(); pond.add(piles);
  for (let k = 0; k < 8; k++) { const a = 0.4 + k * 0.7; const p = mk(new THREE.SphereGeometry(0.9 + R() * 0.4, 12, 8), dirtM, piles, Math.cos(a) * (P.r + 1.6), -0.25, Math.sin(a) * (P.r + 1.6)); p.scale.y = 0.55; }
  const pondWaterTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4fa3c8'; g.fillRect(0, 0, w, h); const r = rng(17); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(255,255,255,${0.12 + r() * 0.22})`; g.lineWidth = 2.2; g.beginPath(); g.ellipse(r() * w, r() * h, 14 + r() * 28, 4 + r() * 6, 0, 0, 7); g.stroke(); } }, [3, 3]);
  const pwM = new THREE.MeshStandardMaterial({ map: pondWaterTex, color: 0xa8dcf4, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.9 });
  const pwater = mk(new THREE.CircleGeometry(P.r, 64), pwM, pond, 0, -1.2, 0); pwater.rotation.x = -Math.PI / 2; pwater.castShadow = false;
  // lane flood (the displacement gag): a big water sheet over the lane + lot that rises
  const laneFlood = mk(new THREE.PlaneGeometry(22.7, 30), new THREE.MeshStandardMaterial({ map: pondWaterTex, color: 0xcfeeff, roughness: 0.05, metalness: 0.15, transparent: true, opacity: 0.8, depthWrite: false }), root, 18.65, 0, 0); laneFlood.rotation.x = -Math.PI / 2; laneFlood.castShadow = false; laneFlood.visible = false; laneFlood.renderOrder = 2;
  // HIPPO LANE sign (shown once the pond is open)
  const hlTex = label(768, 220, (g, w, h) => { g.fillStyle = '#2b7a4b'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 30); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.roundRect(22, 22, w - 44, h - 44, 22); g.stroke(); g.fillStyle = '#fff'; g.font = '900 120px Inter, Arial'; g.textAlign = 'center'; g.fillText('HIPPO LANE', w / 2, 152); });
  const hippoLane = new THREE.Group(); hippoLane.position.set(11.6, 0, 7.6); root.add(hippoLane);
  for (const x of [-1.3, 1.3]) cyl(0.07, 0.07, 3.4, mPole, x, 1.7, 0, hippoLane, 8);
  plane(3.2, 0.92, hlTex, hippoLane, 0, 3.0, 0.03, 0, true); plane(3.2, 0.92, hlTex, hippoLane, 0, 3.0, -0.03, Math.PI, true);
  hippoLane.visible = false;
  function setPond(dig = 0, fill = 0, level = null, t = 0) {
    const d = clamp(dig), f = clamp(fill);
    const ck = Math.round(d * 200); if (ck !== cover.userData.k) { cover.userData.k = ck; cover.geometry.dispose(); cover.geometry = new THREE.RingGeometry(Math.max(0.001, P.r * ck / 200), P.r + 0.02, 64, 1); }
    cover.visible = ck < 200;
    bowl.visible = d > 0.001; piles.visible = d > 0.05; piles.scale.setScalar(Math.max(0.01, Math.min(1, d * 1.4)));
    pwater.visible = f > 0.001 && d > 0.5; pwater.position.y = level ?? lerp(-1.25, -0.16, f); pondWaterTex.offset.set(t * 0.02, t * 0.013);
    rim.visible = d > 0.98;
  }
  function setLaneFlood(level, t = 0) { laneFlood.visible = level > 0.003; laneFlood.position.y = level; }
  setPond(0, 0);

  // ============================================================== LIGHTS + fog + night mode
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x9a8a72, opts.ambient ?? 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, opts.sun ?? 2.6); root.add(sun, sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  const inner = new THREE.PointLight(0xfff0dc, 0, 16, 1.6); inner.position.set(0, 3.0, 2.4); root.add(inner);
  const inner2 = new THREE.PointLight(0xfff0dc, 0, 14, 1.6); inner2.position.set(-1.5, 3.0, -2.6); root.add(inner2);
  function aimSun(cx = 0, cz = 0, half = 12, inside = false) {
    sun.position.set(cx + 14, 22, cz + 18); sun.target.position.set(cx, 0, cz); sun.target.updateMatrixWorld();
    const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = 80; c.updateProjectionMatrix();
    inner.intensity = inside ? 14 : 0; inner2.intensity = inside ? 10 : 0;
  }
  aimSun();
  const fog = new THREE.Fog(0xe9e2d4, 60, 260); scene.fog = fog;
  let nightK = 0;
  const panelDay = new THREE.Color(0xfff6e2);
  function setNight(k) {
    nightK = k;
    hemi.intensity = lerp(opts.ambient ?? 1.15, 0.16, k); hemi.color.setHex(k > 0.5 ? 0x7a8ab8 : 0xfff4e6);
    sun.intensity = lerp(opts.sun ?? 2.6, 0, k);
    panelM.color.copy(panelDay).multiplyScalar(lerp(1, 0.12, k));
    skyMat.color.setRGB(lerp(1, 0.06, k), lerp(1, 0.08, k), lerp(1, 0.16, k));
    upChairs.visible = k > 0.5; chairs.forEach((c) => (c.g.visible = k <= 0.5));
    clouds.visible = k < 0.5;
    fog.color.setRGB(lerp(0.91, 0.03, k), lerp(0.89, 0.04, k), lerp(0.83, 0.09, k));
  }
  function update(t) { void t; }
  return {
    root, D, fog, sky, ground, building: b, menuBoard: dtb, dtPost, front, doorFrame, doorLeaf, counter, cTop, registers, menus, kit, grill, patties, fizz, nozzles, salad, bins, setEaten,
    tables, chairs, booths, upChairs, clock, eotm: photoSlot, hiring, cars, pylon, trees, planters, pond, pwater, hippoLane, mess, flood,
    setFlood, setMess, setPond, setLaneFlood, setNight, aimSun, update, lights: { hemi, sun, inner, inner2 }, roofTop,
  };
}
