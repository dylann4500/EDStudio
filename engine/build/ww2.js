// 1944 kit for the toon/build look (084 "Could Cristiano Ronaldo end World War II?"). Everything generic: no insignia, no
// symbols, no real person's likeness. Sets (each builder returns its own `root`; park them at offsets, one visible per shot):
//   buildNormandy(studio)  sunny Normandy farmland at the origin: a big field, a dirt road along x at z = D.roadZ, hedgerows
//                          (bocage), a stone farmhouse + barn + two village houses, apple trees, a far church spire, haystacks,
//                          a cloud layer at 1.6–2.6 km (sprites) and a camera-following sky that darkens with altitude
//                          (`followSky(camera)` every frame). `aimSun(cx, cz, half)`, `fog`, `party` (bunting + table, hidden).
//   buildBeach(studio)     a landing beach at dawn: sand + wet sand + a moving sea, bluffs, beach obstacles, landing craft
//                          (`craft[i] = {g, ramp}`), ships on the horizon, barrage balloons, `fog`, `followSky(camera)`, `update(t)`.
//   buildRoom(studio)      a student's bedroom at night (2026): desk + lamp + chair, bed, posters, shelf, a night-city window.
// Props: makeBomber() (generic four-engine prop bomber, `update(t)` spins the props), makeSherman() (`update(dist)` rolls the
// wheels; a white star on the sides; `hatch` = where a crewman's chest sits), makeV2() (black/white test-pattern rocket,
// `flame`), makeTrail(parent, n) (a smoke trail: `set(i, pos, size, alpha)`), makeBall() (a football, r 0.11),
// makeHelmet('allied'|'blank') (a plain olive dome / a plain grey one), makePortal() (a swirl disc + glow: `set(t, open)`),
// makePhone(screenTex) (portrait phone: `scr` = the screen mesh).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, rng } from '../core.js';
import { lawnTexture } from './cutaway.js';
import { softTex } from './anim.js';

const PI = Math.PI, TAU = PI * 2;
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

export const D = {
  roadZ: 16, roadW: 5,
  house: [-34, -62], barn: [-12, -68], party: [-30, -50],
  church: [70, -260],
};

function skyDome(stops, r = 900, clouds = 30, seed = 1) {
  const t = tex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); for (const [k, c] of stops) gr.addColorStop(k, c); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < clouds; i++) { const cx = h2(i + seed, 5) * w, cy = h * (0.3 + h2(i, 6 + seed) * 0.15), s = 26 + h2(i, 7) * 40;
      for (let k = 0; k < 8; k++) { const x = cx + (h2(i, k) - 0.5) * s * 4, y = cy + (h2(k, i) - 0.5) * s * 0.7, rr = s * (0.6 + h2(i + k, 9) * 0.7);
        const cg = g.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); cg.addColorStop(0, 'rgba(255,255,255,.85)'); cg.addColorStop(0.7, 'rgba(255,255,255,.5)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false }));
  m.renderOrder = -2; m.frustumCulled = false; return m;
}

function roundTree(parent, x, z, s, color, trunk = 0x6b4a2e) {
  const g = new THREE.Group(); parent.add(g); g.position.set(x, 0, z); g.scale.setScalar(s);
  mk(new THREE.CylinderGeometry(0.22, 0.3, 2.4, 8), std(trunk, 0.9), g, 0, 1.2, 0);
  const cm = std(color, 0.85);
  for (const [dx, dy, dz, r] of [[0, 3.3, 0, 1.6], [0.9, 2.9, 0.3, 1.1], [-0.8, 3.0, -0.2, 1.15], [0.2, 4.1, -0.3, 1.0]]) mk(new THREE.SphereGeometry(r, 14, 10), cm, g, dx, dy, dz);
  return g;
}

function makeHouse(w, d, h, wall, roof, seed = 1) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(w, h, d), std(wall, 0.92), g, 0, h / 2, 0);
  const rf = new THREE.Shape(); rf.moveTo(-w / 2 - 0.4, 0); rf.lineTo(0, h * 0.75); rf.lineTo(w / 2 + 0.4, 0); rf.closePath();
  const rg = new THREE.ExtrudeGeometry(rf, { depth: d + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.6) / 2);
  mk(rg, std(roof, 0.7), g, 0, h, 0);
  mk(new THREE.BoxGeometry(0.7, 1.8, 0.7), std(0x8a8178, 0.9), g, w * 0.28, h + h * 0.55, -d * 0.15);
  const winM = std(0x2c3440, 0.3), shut = std(seed % 2 ? 0x4f7a5a : 0x5a6f8f, 0.7), frame = std(0xf0ece2, 0.7);
  const n = Math.max(2, Math.floor(w / 2.4));
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * (w / n);
    for (const y of h > 4.5 ? [1.6, 3.9] : [1.6]) { if (i === Math.floor(n / 2) && y < 2) { mk(new THREE.BoxGeometry(1.1, 2.1, 0.08), std(0x6b4a2e, 0.8), g, x, 1.05, d / 2 + 0.02); continue; }
      mk(new THREE.BoxGeometry(0.95, 1.15, 0.06), frame, g, x, y, d / 2 + 0.02); mk(new THREE.BoxGeometry(0.75, 0.95, 0.07), winM, g, x, y, d / 2 + 0.03);
      for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.42, 1.15, 0.05), shut, g, x + s * 0.72, y, d / 2 + 0.05); } }
  return g;
}

/** Normandy farmland at the origin. */
export async function buildNormandy(studio) {
  const { scene, camera } = studio;
  camera.far = 2600; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  const fog = new THREE.Fog(0xcfe2ee, 160, 1900);
  const sky = skyDome([[0, '#2e74c9'], [0.32, '#6ba8e2'], [0.47, '#cfe2f0'], [0.5, '#e4eef2'], [1, '#e4eef2']], 900, 12, 3);
  root.add(sky);
  const skyCol = new THREE.Color();
  function followSky(cam) {
    root.updateMatrixWorld(true); const p = root.worldToLocal(cam.position.clone()); sky.position.copy(p);
    const k = Math.min(1, Math.max(0, (p.y - 300) / 6000)); sky.material.color.copy(skyCol.setRGB(1 - 0.45 * k, 1 - 0.35 * k, 1 - 0.12 * k));
    fog.color.setRGB(0.81 - 0.12 * k, 0.886 - 0.08 * k, 0.933 - 0.03 * k);
  }
  const hemi = new THREE.HemisphereLight(0xe8f1ff, 0x7d8a52, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d8, 2.8); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cz, half = 12, cy = 0) { sun.position.set(cx - 14, cy + 22, cz + 16); sun.target.position.set(cx, cy, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 120 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 0);

  // ground: field + a mowed patch (the free-kick spot) + the dirt road
  const grassT = lawnTexture('#8cbf5e', '#80b453'); grassT.repeat.set(1500, 1500);
  const field = mk(new THREE.PlaneGeometry(6000, 6000), std(0xffffff, 0.95, { map: grassT }), root, 0, 0, 0); field.rotation.x = -PI / 2; field.castShadow = false; field.receiveShadow = true;
  const dirtT = tex(512, 128, (c, w, h) => { c.fillStyle = '#a5845a'; c.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 1600; i++) { c.fillStyle = ['rgba(120,92,60,.5)', 'rgba(185,150,108,.5)', 'rgba(95,72,46,.35)'][i % 3]; c.beginPath(); c.ellipse(R() * w, R() * h, 1 + R() * 4, 1 + R() * 2, 0, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(80,60,38,.35)'; c.fillRect(0, h * 0.22, w, h * 0.1); c.fillRect(0, h * 0.68, w, h * 0.1); c.fillStyle = 'rgba(110,150,70,.55)'; c.fillRect(0, h * 0.44, w, h * 0.12); });
  dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping; dirtT.repeat.set(300, 1);
  const road = mk(new THREE.PlaneGeometry(1600, D.roadW), std(0xffffff, 0.95, { map: dirtT }), root, 300, 0.012, D.roadZ); road.rotation.x = -PI / 2; road.castShadow = false;

  // hedgerows (bocage): instanced bushy lumps
  const hedgePts = [];
  const hedge = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 1.6); for (let i = 0; i <= n; i++) { const u = i / n; hedgePts.push([x0 + (x1 - x0) * u + (h2(i, x0) - 0.5) * 0.8, z0 + (z1 - z0) * u + (h2(i, z0) - 0.5) * 0.8, 1.3 + h2(i, x1 + z1) * 0.9]); } };
  hedge(-160, -40, -47, -40); hedge(-13, -40, 160, -40); hedge(-160, -40, -160, 9); hedge(160, -40, 160, 9); hedge(-400, 22, 900, 22); hedge(-400, 10, -170, 10); hedge(170, 10, 900, 10);
  hedge(-160, -120, 160, -120); hedge(-400, -200, 400, -200);
  { const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std(0x4f8a3a, 0.9, { flatShading: true }), hedgePts.length), m4 = new THREE.Matrix4(), C = new THREE.Color();
    hedgePts.forEach(([x, z, s], i) => { m4.compose(new THREE.Vector3(x, s * 0.75, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(h2(i, 1), h2(i, 2) * 6, 0)), new THREE.Vector3(s * 1.3, s, s * 1.1)); im.setMatrixAt(i, m4); im.setColorAt(i, C.setHex([0x4f8a3a, 0x5a9842, 0x467e34][i % 3])); });
    im.castShadow = true; im.receiveShadow = true; root.add(im); }
  for (let i = 0; i < 26; i++) { const x = -150 + i * 12 + h2(i, 3) * 4; if (x > -50 && x < -10) continue; roundTree(root, x, -41 - h2(i, 4) * 3, 1.2 + h2(i, 5) * 0.6, [0x4a8f3c, 0x5aa84a, 0x3f8a36][i % 3]); }
  for (let i = 0; i < 40; i++) roundTree(root, -380 + i * 30 + h2(i, 6) * 10, 24 + h2(i, 7) * 6, 1.3 + h2(i, 8) * 0.6, [0x4a8f3c, 0x5aa84a][i % 2]);
  for (let i = 0; i < 30; i++) roundTree(root, -300 + i * 22 + h2(i, 9) * 10, -122 - h2(i, 1) * 8, 1.6 + h2(i, 2), 0x4a8f3c);
  // apple orchard by the farm
  for (let i = 0; i < 12; i++) { const t = roundTree(root, -70 + (i % 4) * 7, -78 - Math.floor(i / 4) * 7, 0.8, 0x5d9c45); for (let k = 0; k < 6; k++) mk(new THREE.SphereGeometry(0.13, 8, 6), std(0xc8322a, 0.5), t, (h2(i, k) - 0.5) * 2.6, 2.6 + h2(k, i) * 1.4, (h2(k, i + 3) - 0.5) * 2.6); }
  // farm: house, barn, two village houses, a cart, haystacks, a fence along the road
  const house = makeHouse(11, 7, 5.2, 0xd9cdb4, 0x5b6470, 1); root.add(house); house.position.set(D.house[0], 0, D.house[1]);
  const v1 = makeHouse(8, 6, 4.6, 0xe2d6bd, 0x8a4a34, 2); root.add(v1); v1.position.set(D.house[0] - 14, 0, D.house[1] + 2); v1.rotation.y = 0.12;
  const v2 = makeHouse(9, 6, 4.8, 0xcfc2a8, 0x5b6470, 3); root.add(v2); v2.position.set(D.house[0] + 13, 0, D.house[1] + 1); v2.rotation.y = -0.1;
  const barn = new THREE.Group(); root.add(barn); barn.position.set(D.barn[0], 0, D.barn[1]);
  mk(new THREE.BoxGeometry(12, 6, 8), std(0x8a5a3a, 0.9), barn, 0, 3, 0);
  { const s = new THREE.Shape(); s.moveTo(-6.6, 0); s.lineTo(0, 3.6); s.lineTo(6.6, 0); s.closePath(); const g2 = new THREE.ExtrudeGeometry(s, { depth: 8.8, bevelEnabled: false }); g2.translate(0, 0, -4.4); mk(g2, std(0x5a4a3e, 0.8), barn, 0, 6, 0); }
  mk(new THREE.BoxGeometry(4, 4.4, 0.1), std(0x5a3a26, 0.85), barn, 0, 2.2, 4.02);
  for (const [x, z, r] of [[-4, -24, 0.3], [6, -30, 1.2], [20, -27, 0.6], [-22, -30, 0.2], [34, -33, 0.9]]) { const hs = new THREE.Group(); root.add(hs); hs.position.set(x, 0, z); hs.rotation.y = r;
    mk(new THREE.CylinderGeometry(1.1, 1.5, 1.8, 14), std(0xd8b862, 0.95), hs, 0, 0.9, 0); mk(new THREE.ConeGeometry(1.15, 1.2, 14), std(0xcfae58, 0.95), hs, 0, 2.3, 0); }
  const fenceM = std(0x8b6a44, 0.85);
  for (let x = -200; x < 600; x += 3) { mk(new THREE.BoxGeometry(0.14, 1.1, 0.14), fenceM, root, x, 0.55, D.roadZ + 3.4); }
  for (const y of [0.45, 0.85]) mk(new THREE.BoxGeometry(800, 0.08, 0.06), fenceM, root, 200, y, D.roadZ + 3.4);
  const cart = new THREE.Group(); root.add(cart); cart.position.set(-8, 0, -34); cart.rotation.y = 0.6;
  mk(new THREE.BoxGeometry(3, 0.8, 1.6), std(0x8b6a44, 0.85), cart, 0, 1.0, 0); for (const z of [-0.9, 0.9]) mk(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 16), std(0x5a3a26, 0.8), cart, 0, 0.6, z).rotation.x = PI / 2;
  // church + spire far away, a windmill-free skyline of village roofs
  const church = new THREE.Group(); root.add(church); church.position.set(D.church[0], 0, D.church[1]);
  mk(new THREE.BoxGeometry(14, 10, 26), std(0xd8ccb2, 0.9), church, 0, 5, 0); mk(new THREE.BoxGeometry(6, 22, 6), std(0xd2c5aa, 0.9), church, 0, 11, 14); mk(new THREE.ConeGeometry(4.4, 14, 4), std(0x5b6470, 0.7), church, 0, 29, 14).rotation.y = PI / 4;
  for (let i = 0; i < 10; i++) { const hz = makeHouse(7 + h2(i, 1) * 4, 6, 4.5, [0xe2d6bd, 0xd9cdb4, 0xcfc2a8][i % 3], [0x8a4a34, 0x5b6470][i % 2], i); root.add(hz); hz.position.set(D.church[0] - 60 + i * 13, 0, D.church[1] + 30 + h2(i, 2) * 10); }
  for (let i = 0; i < 9; i++) { const hl = mk(new THREE.SphereGeometry(1, 32, 16), std(0x86b85a, 0.95), root, -900 + i * 230, -6, -700 - h2(i, 3) * 300); hl.scale.set(260 + h2(i, 1) * 120, 50 + h2(i, 2) * 40, 160); hl.castShadow = false; }

  // the cloud layer (1.6–2.6 km): soft camera-facing puffs, the crane to the bombers flies through it
  const puffT = softTex('255,255,255', 128);
  const clouds = new THREE.Group(); root.add(clouds);
  for (let i = 0; i < 160; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, opacity: 0.85, fog: false }));
    const a = h2(i, 1) * TAU, r = 60 + Math.sqrt(h2(i, 2)) * 2400; sp.position.set(Math.cos(a) * r, 1600 + h2(i, 3) * 1000, Math.sin(a) * r); sp.scale.setScalar(260 + h2(i, 4) * 420); clouds.add(sp); }

  // the victory party (hidden until the last beat): bunting between poles, a long table, string lights
  const party = new THREE.Group(); root.add(party); party.position.set(D.party[0], 0, D.party[1]); party.visible = false;
  { const poleM = std(0x7a5a3a, 0.8), cols = [0xd8262e, 0xffffff, 0x2f5fbf, 0xffd23f, 0x3fae5a];
    const poles = [[-9, -6], [9, -6], [-9, 6], [9, 6], [0, -8]];
    for (const [x, z] of poles) mk(new THREE.CylinderGeometry(0.08, 0.1, 5.4, 8), poleM, party, x, 2.7, z);
    const flagG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.22, 0, 0), new THREE.Vector3(0.22, 0, 0), new THREE.Vector3(0, -0.42, 0)]); flagG.setIndex([0, 2, 1]); flagG.computeVertexNormals();
    const string = (a, b, sag) => { const n = 22; for (let i = 0; i <= n; i++) { const u = i / n, x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u, y = 5.2 - sag * 4 * u * (1 - u);
      if (i < n) { const f = new THREE.Mesh(flagG, new THREE.MeshStandardMaterial({ color: cols[i % cols.length], roughness: 0.7, side: THREE.DoubleSide })); f.position.set(x, y, z); f.rotation.y = Math.atan2(-(b[1] - a[1]), b[0] - a[0]); party.add(f); }
      if (i % 3 === 0) mk(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }), party, x, y - 0.05, z); } };
    string(poles[0], poles[1], 1.0); string(poles[2], poles[3], 1.0); string(poles[0], poles[3], 1.4); string(poles[1], poles[2], 1.4); string(poles[4], poles[2], 1.2); string(poles[4], poles[3], 1.2);
    const tab = new THREE.Group(); party.add(tab); tab.position.set(-4.5, 0, -2.5);
    mk(new THREE.BoxGeometry(6, 0.08, 1.2), std(0xffffff, 0.8), tab, 0, 0.78, 0); mk(new THREE.BoxGeometry(6.04, 0.35, 1.24), std(0xf4f1ea, 0.85), tab, 0, 0.62, 0);
    for (const x of [-2.6, 2.6]) for (const z of [-0.45, 0.45]) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.78, 6), std(0x6b4a2e), tab, x, 0.39, z);
    for (let i = 0; i < 9; i++) { const x = -2.6 + i * 0.65; if (i % 3 === 0) mk(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 10), std(0x2f6b3a, 0.2), tab, x, 0.97, 0.1);
      else if (i % 3 === 1) mk(new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), std(0xd29a52, 0.7), tab, x, 0.9, -0.15).rotation.z = PI / 2; else mk(new THREE.CylinderGeometry(0.16, 0.14, 0.06, 16), std(0xe8e2d4, 0.5), tab, x, 0.85, 0.2); }
    const ban = mk(new THREE.PlaneGeometry(7, 1.3), new THREE.MeshStandardMaterial({ map: tex(1024, 190, (c, w, h) => { c.fillStyle = '#fff8e6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8262e'; c.font = '120px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VICTORY!', w / 2, h / 2 + 8); c.strokeStyle = '#2f5fbf'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); }), roughness: 0.7, side: THREE.DoubleSide }), party, 0, 4.2, -8.02); void ban; }

  return { root, fog, sky, followSky, aimSun, sun, hemi, clouds, party, house };
}

/** A landing beach at dawn. Land at −z (bluffs), the sea toward +z. */
export function buildBeach(studio) {
  const root = new THREE.Group(); studio.scene.add(root);
  const fog = new THREE.Fog(0xe7c9ae, 200, 2400);
  const sky = skyDome([[0, '#5f86b8'], [0.3, '#a8b8cc'], [0.44, '#f2c9a0'], [0.5, '#f7dcc0'], [1, '#f7dcc0']], 900, 22, 9);
  root.add(sky);
  function followSky(cam) { root.updateMatrixWorld(true); sky.position.copy(root.worldToLocal(cam.position.clone())); }
  const hemi = new THREE.HemisphereLight(0xf2e6dc, 0x9a8a6a, 1.2); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9b0, 2.4); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cz, half = 40) { sun.position.set(cx + 40, 30, cz + 50); sun.target.position.set(cx, 0, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 220 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 0);
  const sandT = tex(256, 256, (c, w, h) => { c.fillStyle = '#d9c49a'; c.fillRect(0, 0, w, h); const R = rng(8); for (let i = 0; i < 2600; i++) { c.fillStyle = ['rgba(190,168,128,.5)', 'rgba(235,216,176,.5)', 'rgba(170,148,110,.3)'][i % 3]; c.fillRect(R() * w, R() * h, 2, 2); } });
  sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(200, 60);
  const sand = mk(new THREE.PlaneGeometry(1400, 400), std(0xffffff, 0.95, { map: sandT }), root, 0, 0, -140); sand.rotation.x = -PI / 2; sand.castShadow = false;
  const wet = mk(new THREE.PlaneGeometry(1400, 30), std(0xb09a76, 0.35), root, 0, 0.01, 45); wet.rotation.x = -PI / 2; wet.castShadow = false;
  const seaT = tex(512, 512, (c, w, h) => { c.fillStyle = '#5b7f8f'; c.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 900; i++) { c.strokeStyle = ['rgba(255,255,255,.18)', 'rgba(40,70,85,.35)', 'rgba(200,220,225,.22)'][i % 3]; c.lineWidth = 2; const x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 3, x + 22, y); c.stroke(); } });
  seaT.wrapS = seaT.wrapT = THREE.RepeatWrapping; seaT.repeat.set(120, 120);
  const sea = mk(new THREE.PlaneGeometry(4000, 3000), new THREE.MeshStandardMaterial({ map: seaT, roughness: 0.25, metalness: 0.1, color: 0xdde8ee }), root, 0, 0.05, 1555); sea.rotation.x = -PI / 2; sea.castShadow = false;
  const foam = mk(new THREE.PlaneGeometry(1400, 2.2), new THREE.MeshBasicMaterial({ color: 0xf4f1ea, transparent: true, opacity: 0.85 }), root, 0, 0.07, 56); foam.rotation.x = -PI / 2;
  // bluffs at the back with grass on top
  for (let i = 0; i < 16; i++) { const b = mk(new THREE.SphereGeometry(1, 28, 14), std(0xa79270, 0.95), root, -700 + i * 95, -6, -150 - h2(i, 1) * 20); b.scale.set(70 + h2(i, 2) * 30, 34 + h2(i, 3) * 8, 40); b.castShadow = false;
    const gr = mk(new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, PI * 0.28), std(0x7f9a52, 0.95), root, b.position.x, b.position.y + 0.4, b.position.z); gr.scale.copy(b.scale); gr.castShadow = false; }
  // beach obstacles (steel crosses)
  const obM = std(0x4a4a4c, 0.6, { metalness: 0.4 });
  const obstacle = () => { const g = new THREE.Group(); for (let k = 0; k < 3; k++) { const b = mk(new THREE.BoxGeometry(0.18, 2.4, 0.18), obM, g, 0, 0.8, 0); b.rotation.set(k === 0 ? 0.95 : k === 1 ? -0.95 : 0, k === 2 ? 0 : 0, k === 2 ? 0.95 : 0); } return g; };
  for (let i = 0; i < 40; i++) { const o = obstacle(); root.add(o); o.position.set(-300 + h2(i, 1) * 600, 0, 8 + h2(i, 2) * 34); o.rotation.y = h2(i, 3) * 3; }
  // landing craft: a box hull with a front ramp (at −z); g.position = the boat's centre on the water
  const craftM = std(0x7d8780, 0.6), craftDark = std(0x5d665f, 0.7);
  const craft = [];
  for (let i = 0; i < 36; i++) { const g = new THREE.Group(); root.add(g);
    mk(new THREE.BoxGeometry(3.2, 1.9, 9.5), craftM, g, 0, 0.75, 0.6); mk(new THREE.BoxGeometry(2.8, 0.2, 9.0), craftDark, g, 0, 0.0, 0.6);
    mk(new THREE.BoxGeometry(1.4, 0.9, 1.0), craftDark, g, 0, 2.1, 4.8);
    const ramp = new THREE.Group(); g.add(ramp); ramp.position.set(0, -0.15, -4.15); mk(new THREE.BoxGeometry(3.0, 2.0, 0.18), craftM, ramp, 0, 1.0, 0);
    const row = Math.floor(i / 9), x = -110 + (i % 9) * 27 + h2(i, 4) * 8, z = 52 + row * 70 + h2(i, 5) * 30;
    g.position.set(x, 0, z); g.userData = { x, z, row }; craft.push({ g, ramp }); }
  // ships on the horizon
  for (let i = 0; i < 16; i++) { const g = new THREE.Group(); root.add(g); g.position.set(-900 + i * 120 + h2(i, 1) * 60, 0, 700 + h2(i, 2) * 600); const s = 0.7 + h2(i, 3) * 0.7; g.scale.setScalar(s);
    mk(new THREE.BoxGeometry(110, 9, 16), std(0x6f7a80, 0.7), g, 0, 4, 0); mk(new THREE.BoxGeometry(30, 10, 12), std(0x7a858a, 0.7), g, -6, 13, 0); mk(new THREE.CylinderGeometry(3, 3.4, 12, 12), std(0x5f686c, 0.7), g, 8, 20, 0); mk(new THREE.BoxGeometry(1, 22, 1), std(0x5f686c), g, -20, 25, 0); }
  // barrage balloons over the ships + beach (with their cables)
  const balloons = [];
  for (let i = 0; i < 12; i++) { const g = new THREE.Group(); root.add(g); const x = -500 + i * 95 + h2(i, 6) * 40, z = 160 + h2(i, 7) * 700, y = 110 + h2(i, 8) * 120;
    g.position.set(x, y, z); const bm = std(0xb9bec2, 0.5);
    const body = mk(new THREE.SphereGeometry(1, 24, 14), bm, g); body.scale.set(9, 4.2, 4.2);
    for (const [ry, rz] of [[0, 0], [0, PI / 2], [0, -PI / 2]]) { const f = mk(new THREE.BoxGeometry(4, 3.2, 0.3), bm, g, -9, 0, 0); f.rotation.set(rz, ry, 0); f.position.set(-8.5, rz === 0 ? 2.6 : 0, rz > 0 ? 2.6 : rz < 0 ? -2.6 : 0); }
    const cab = mk(new THREE.CylinderGeometry(0.06, 0.06, y, 4), std(0x333333), root, x, y / 2, z); cab.castShadow = false; balloons.push(g); }
  function update(t) { seaT.offset.set(t * 0.004, -t * 0.02); for (const [i, b] of balloons.entries()) { b.position.y += 0; b.rotation.y = 0.2 * Math.sin(t * 0.3 + i); } }
  return { root, fog, sky, followSky, aimSun, sun, hemi, craft, balloons, update };
}

/** A student's bedroom at night, 2026. Desk against the back wall (z −1.6), the student sits at (0, 0, −0.95) facing −z. */
export function buildRoom(studio) {
  const root = new THREE.Group(); studio.scene.add(root);
  const hemi = new THREE.HemisphereLight(0x8fa6d8, 0x3a3040, 0.75); root.add(hemi);
  const key = new THREE.DirectionalLight(0xbfd0ff, 0.7); key.position.set(-2, 4, 3); root.add(key);
  const lampL = new THREE.PointLight(0xffc27a, 2.6, 6, 1.6); lampL.position.set(-0.45, 1.35, -1.45); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); root.add(lampL);
  const floorT = tex(256, 256, (c, w, h) => { c.fillStyle = '#8a6444'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.05)'; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, i * 32, w, 1.5); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(3, 3);
  const floor = mk(new THREE.PlaneGeometry(6, 6), std(0xffffff, 0.8, { map: floorT }), root, 0, 0, 0); floor.rotation.x = -PI / 2;
  const wallM = std(0x46557a, 0.9);
  mk(new THREE.BoxGeometry(6, 2.8, 0.1), wallM, root, 0, 1.4, -2.05); mk(new THREE.BoxGeometry(0.1, 2.8, 6), wallM, root, -3, 1.4, 1); mk(new THREE.BoxGeometry(0.1, 2.8, 6), wallM, root, 3, 1.4, 1);
  mk(new THREE.PlaneGeometry(6, 6), std(0x2e3650, 0.9), root, 0, 2.8, 1).rotation.x = PI / 2;
  // window with a night city
  const winT = tex(512, 384, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1430'); gr.addColorStop(1, '#2a2f5a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const R = rng(3); for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(R() * w, R() * h * 0.5, 1.5, 1.5); }
    for (let i = 0; i < 16; i++) { const bw = 20 + R() * 40, bh = 60 + R() * 200, x = i * 34 - 10; c.fillStyle = '#141a33'; c.fillRect(x, h - bh, bw, bh); for (let k = 0; k < 30; k++) if (R() < 0.45) { c.fillStyle = R() < 0.7 ? '#ffd27a' : '#9fd0ff'; c.fillRect(x + 3 + (k % 3) * (bw / 3), h - bh + 6 + Math.floor(k / 3) * 14, 4, 6); } }
    c.fillStyle = '#f2f2e8'; c.beginPath(); c.arc(410, 70, 26, 0, 7); c.fill(); });
  mk(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshBasicMaterial({ map: winT }), root, 1.3, 1.65, -1.995);
  const frM = std(0xe8e4dc, 0.6); for (const [x, y, w2, h3] of [[1.3, 2.22, 1.6, 0.08], [1.3, 1.08, 1.6, 0.08], [0.53, 1.65, 0.08, 1.2], [2.07, 1.65, 0.08, 1.2], [1.3, 1.65, 0.05, 1.1]]) mk(new THREE.BoxGeometry(w2, h3, 0.06), frM, root, x, y, -1.98);
  // desk + lamp + chair + shelf + bed + posters
  const deskM = std(0xc9a77c, 0.7);
  mk(new THREE.BoxGeometry(1.5, 0.05, 0.7), deskM, root, -0.2, 0.76, -1.62); for (const x of [-0.9, 0.5]) mk(new THREE.BoxGeometry(0.05, 0.76, 0.66), deskM, root, x, 0.38, -1.62);
  const lamp = new THREE.Group(); root.add(lamp); lamp.position.set(-0.75, 0.785, -1.75);
  mk(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 16), std(0x2a2a30, 0.4), lamp, 0, 0.015, 0); mk(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), std(0x2a2a30, 0.4), lamp, 0.05, 0.24, 0.02).rotation.z = -0.2;
  mk(new THREE.ConeGeometry(0.12, 0.16, 18, 1, true), std(0x2a2a30, 0.4, { side: THREE.DoubleSide }), lamp, 0.12, 0.48, 0.1).rotation.z = 0.5;
  mk(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), lamp, 0.15, 0.44, 0.1);
  const chair = new THREE.Group(); root.add(chair); chair.position.set(-0.2, 0, -0.85);
  mk(new THREE.BoxGeometry(0.5, 0.06, 0.5), std(0x2b2f3a, 0.6), chair, 0, 0.46, 0); mk(new THREE.BoxGeometry(0.5, 0.6, 0.06), std(0x2b2f3a, 0.6), chair, 0, 0.78, 0.25); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8), std(0x777777), chair, 0, 0.22, 0);
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; mk(new THREE.BoxGeometry(0.3, 0.03, 0.04), std(0x333333), chair, Math.cos(a) * 0.15, 0.03, Math.sin(a) * 0.15).rotation.y = -a; }
  const bed = new THREE.Group(); root.add(bed); bed.position.set(-2.1, 0, 0.6);
  mk(new THREE.BoxGeometry(1.4, 0.45, 2.1), std(0x6b4a2e, 0.8), bed, 0, 0.22, 0); mk(new THREE.BoxGeometry(1.38, 0.18, 2.0), std(0xd8dde8, 0.8), bed, 0, 0.53, 0); mk(new THREE.BoxGeometry(1.42, 0.12, 1.4), std(0xc8323a, 0.85), bed, 0, 0.6, 0.3);
  mk(new THREE.BoxGeometry(0.6, 0.14, 0.35), std(0xffffff, 0.8), bed, 0, 0.66, -0.75);
  const shelf = new THREE.Group(); root.add(shelf); shelf.position.set(-1.4, 1.75, -1.9);
  mk(new THREE.BoxGeometry(1.0, 0.04, 0.25), deskM, shelf, 0, 0, 0); for (let i = 0; i < 9; i++) mk(new THREE.BoxGeometry(0.05 + h2(i, 1) * 0.03, 0.22 + h2(i, 2) * 0.08, 0.18), std([0xc8323a, 0x2f6fd1, 0xffd23f, 0x3fae5a, 0x8e5bd0][i % 5], 0.7), shelf, -0.42 + i * 0.09, 0.14, 0);
  const posterT = (draw) => tex(256, 360, draw);
  mk(new THREE.PlaneGeometry(0.62, 0.86), std(0xffffff, 0.8, { map: posterT((c, w, h) => { c.fillStyle = '#1d6b3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(20, 20, w - 40, h - 40); c.beginPath(); c.moveTo(20, h / 2); c.lineTo(w - 20, h / 2); c.stroke(); c.beginPath(); c.arc(w / 2, h / 2, 45, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h * 0.3, 22, 0, 7); c.fill(); }) }), root, -0.25, 1.75, -1.995);
  mk(new THREE.PlaneGeometry(0.5, 0.7), std(0xffffff, 0.8, { map: posterT((c, w, h) => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1d1d'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.fillText('F = ma', w / 2, h / 2); c.font = '28px Arial'; c.fillText('(probably)', w / 2, h / 2 + 50); }) }), root, -2.94, 1.6, -0.6).rotation.y = PI / 2;
  // a rug, a laundry pile, a backpack
  mk(new THREE.CircleGeometry(1.0, 32), std(0x7a3f5a, 0.95), root, -0.5, 0.005, 0.2).rotation.x = -PI / 2;
  mk(new THREE.SphereGeometry(0.35, 12, 8), std(0x5f7fae, 0.95), root, 2.2, 0.12, -0.8).scale.set(1.3, 0.45, 1);
  mk(new RoundedBoxGeometry(0.35, 0.45, 0.2, 3, 0.06), std(0xd8462c, 0.8), root, 0.95, 0.22, -1.15);
  return { root, lampL, hemi };
}

// ---------------------------------------------------------------- props
/** Generic four-engine prop bomber, nose +x, wingspan ~31 m. update(t) spins the props. */
export function makeBomber(color = 0x6b7046) {
  const g = new THREE.Group(), M = std(color, 0.6), belly = std(0x9aa0a0, 0.6), glass = std(0x9fc8de, 0.15, { metalness: 0.3 });
  const fus = new THREE.LatheGeometry([[0, -11.5], [0.45, -11], [0.9, -6], [1.25, 0], [1.25, 6], [1.0, 9.6], [0.45, 11.1], [0, 11.4]].map(([r, y]) => new THREE.Vector2(r, y)), 20);
  const f = mk(fus, M, g); f.rotation.z = -PI / 2;
  mk(new THREE.SphereGeometry(0.62, 16, 10), glass, g, 11.15, 0.0, 0).scale.set(0.9, 0.85, 0.85);
  mk(new THREE.SphereGeometry(0.55, 14, 8, 0, TAU, 0, PI / 2), glass, g, 7.3, 1.0, 0).scale.set(1.6, 0.8, 0.9);
  const wing = new THREE.Shape(); wing.moveTo(3.2, 0.3); wing.lineTo(0.6, 15.8); wing.lineTo(-1.3, 15.8); wing.lineTo(-3.2, 0.3); wing.lineTo(-3.2, -0.3); wing.lineTo(-1.3, -15.8); wing.lineTo(0.6, -15.8); wing.lineTo(3.2, -0.3); wing.closePath();
  const wg = new THREE.ExtrudeGeometry(wing, { depth: 0.36, bevelEnabled: false }); wg.translate(0, 0, -0.18); wg.rotateX(PI / 2);
  mk(wg, M, g, 1.2, -0.25, 0);
  const tail = new THREE.Shape(); tail.moveTo(1.2, 0); tail.lineTo(-0.8, 5.6); tail.lineTo(-0.8, -5.6); tail.closePath();
  const tg = new THREE.ExtrudeGeometry(tail, { depth: 0.24, bevelEnabled: false }); tg.translate(0, 0, -0.12); tg.rotateX(PI / 2); mk(tg, M, g, -9.8, 0.4, 0);
  const fin = new THREE.Shape(); fin.moveTo(2.6, 0); fin.lineTo(-1.2, 5.2); fin.lineTo(-2.6, 5.2); fin.lineTo(-2.4, 0); fin.closePath();
  const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.28, bevelEnabled: false }); fg.translate(0, 0, -0.14); mk(fg, M, g, -9.2, 0.7, 0);
  mk(new THREE.BoxGeometry(14, 0.4, 2.0), belly, g, 0.5, -1.05, 0);
  const props = [];
  for (const z of [-8.2, -3.8, 3.8, 8.2]) {
    const n = mk(new THREE.CylinderGeometry(0.62, 0.5, 4.2, 14), M, g, 3.3, -0.05, z); n.rotation.z = PI / 2;
    const p = new THREE.Group(); g.add(p); p.position.set(5.5, -0.05, z);
    mk(new THREE.SphereGeometry(0.28, 10, 8), std(0x2a2a2a, 0.5), p, 0, 0, 0);
    for (let k = 0; k < 3; k++) { const b = mk(new THREE.BoxGeometry(0.06, 1.9, 0.26), std(0x1d1d1d, 0.5), p, 0, 0.95, 0); const pv = new THREE.Group(); p.add(pv); pv.rotation.x = k / 3 * TAU; pv.add(b); }
    const disc = mk(new THREE.CircleGeometry(1.9, 24), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }), p, 0.02, 0, 0); disc.rotation.y = PI / 2; disc.castShadow = false;
    props.push(p);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, update(t) { props.forEach((p, i) => (p.rotation.x = t * 40 + i)); } };
}

/** A medium tank (generic, olive, a white star in a circle on each side), nose +x, ~5.9 m long. update(dist) rolls the wheels. */
export function makeSherman() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const O = std(0x5f6b3b, 0.75), dark = std(0x2b2c28, 0.85), steel = std(0x3e4236, 0.6, { metalness: 0.3 });
  const prof = new THREE.Shape(); prof.moveTo(-2.9, 0.7); prof.lineTo(-2.9, 1.95); prof.lineTo(1.1, 1.95); prof.lineTo(2.95, 1.05); prof.lineTo(2.95, 0.7); prof.closePath();
  const hg = new THREE.ExtrudeGeometry(prof, { depth: 2.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 }); hg.translate(0, 0, -1.15); mk(hg, O, body);
  const wheels = [];
  for (const s of [-1, 1]) {
    mk(new RoundedBoxGeometry(6.1, 1.05, 0.55, 3, 0.25), dark, body, 0, 0.55, s * 1.25);
    for (let i = 0; i < 6; i++) { const w = mk(new THREE.CylinderGeometry(0.33, 0.33, 0.2, 16), steel, body, -2.1 + i * 0.84, 0.42, s * 1.56); w.rotation.x = PI / 2; wheels.push(w); }
    const sp = mk(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 10), steel, body, 2.75, 0.85, s * 1.56); sp.rotation.x = PI / 2; wheels.push(sp);
    const star = mk(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#f4f2ea'; c.lineWidth = 14; c.beginPath(); c.arc(w / 2, h / 2, w * 0.42, 0, 7); c.stroke(); c.fillStyle = '#f4f2ea'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, r = k % 2 ? w * 0.15 : w * 0.38; k ? c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r) : c.moveTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.fill(); }), transparent: true, roughness: 0.7 }), body, -0.6, 1.45, s * 1.21);
    star.rotation.y = s > 0 ? 0 : PI;
  }
  const turret = new THREE.Group(); body.add(turret); turret.position.set(-0.35, 1.95, 0);
  const tr = mk(new THREE.SphereGeometry(1.15, 24, 14, 0, TAU, 0, PI / 2), O, turret); tr.scale.set(1.15, 0.72, 1.0);
  mk(new THREE.BoxGeometry(0.5, 0.55, 0.9), O, turret, 1.2, 0.32, 0);
  const gun = mk(new THREE.CylinderGeometry(0.075, 0.09, 2.8, 12), steel, turret, 2.75, 0.34, 0); gun.rotation.z = -PI / 2;
  const hatchRing = mk(new THREE.TorusGeometry(0.34, 0.06, 8, 20), steel, turret, -0.25, 0.83, -0.25); hatchRing.rotation.x = PI / 2;
  const lid = mk(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 18), O, turret, -0.25, 1.1, -0.66); lid.rotation.x = 1.2;
  mk(new THREE.BoxGeometry(0.3, 0.3, 0.6), O, body, -2.6, 2.05, 0.6);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(1.2, 0.08, 0.5), O, body, -2.2, 1.98, s * 0.7);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const hatch = new THREE.Vector3(-0.6, 2.75, -0.25);   // body-local: where a crewman's chest sits in the hatch
  return { g, body, turret, hatch, exhaust: new THREE.Vector3(-3.0, 1.2, 0.6), update(dist) { for (const w of wheels) w.rotation.y = -dist / 0.33; } };
}

/** A V-2-style rocket in the black/white test pattern, nose +y, 14 m tall. flame = the exhaust (scale it). */
export function makeV2() {
  const g = new THREE.Group();
  const pts = [[0.001, 14], [0.22, 13.2], [0.5, 11.8], [0.74, 9.8], [0.83, 7.6], [0.83, 3.0], [0.72, 1.2], [0.6, 0.0]].map(([r, y]) => new THREE.Vector2(r, y));
  const t = tex(512, 512, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#1d1d1f' : '#f2f0ea'; c.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); } });
  const body = mk(new THREE.LatheGeometry(pts, 24), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }), g);
  const finM = std(0x1d1d1f, 0.5);
  for (let k = 0; k < 4; k++) { const s = new THREE.Shape(); s.moveTo(0.6, 0); s.lineTo(2.0, -0.4); s.lineTo(2.0, 1.2); s.lineTo(0.7, 3.4); s.closePath(); const fg = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); fg.translate(0, 0, -0.06);
    const f = mk(fg, finM, g); f.rotation.y = k * PI / 2 + PI / 4; }
  const flame = new THREE.Group(); g.add(flame);
  const ft = softTex('255,220,150', 128);
  const fl = mk(new THREE.ConeGeometry(0.55, 4.5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), flame, 0, -2.3, 0); fl.rotation.x = PI;
  const core = mk(new THREE.ConeGeometry(0.3, 2.6, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), flame, 0, -1.4, 0); core.rotation.x = PI;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: ft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); glow.scale.setScalar(5); glow.position.y = -1.2; flame.add(glow);
  body.castShadow = true;
  return { g, flame };
}

/** A soft smoke trail: n camera-facing puffs you place each frame. */
export function makeTrail(parent, n = 60, color = 0xffffff) {
  const t = softTex('255,255,255', 128), list = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color, transparent: true, depthWrite: false, opacity: 0, fog: true })); s.visible = false; parent.add(s); list.push(s); }
  return { list, set(i, pos, size, alpha) { const s = list[i]; if (!s) return; s.visible = alpha > 0.01; s.position.set(...pos); s.scale.setScalar(size); s.material.opacity = alpha; }, hide() { list.forEach((s) => (s.visible = false)); } };
}

/** A football (r 0.11 m): white with black patches. */
export function makeBall(r = 0.11) {
  const t = tex(512, 256, (c, w, h) => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1b1d';
    const pent = (x, y, R) => { for (const dx of [-w, 0, w]) { c.beginPath(); for (let k = 0; k < 5; k++) { const a = -PI / 2 + k * TAU / 5; const px = x + dx + Math.cos(a) * R * 1.0, py = y + Math.sin(a) * R * 0.95; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.fill(); } };
    pent(w * 0.25, h * 0.5, 30); pent(w * 0.75, h * 0.5, 30); pent(0, h * 0.5, 30); pent(w * 0.5, h * 0.5, 30);
    for (let k = 0; k < 5; k++) { pent(w * (0.1 + k * 0.2), h * 0.18, 24); pent(w * (0.0 + k * 0.2), h * 0.82, 24); }
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let k = 0; k < 10; k++) { c.beginPath(); c.moveTo(k * w / 10, 0); c.lineTo(k * w / 10 + 26, h); c.stroke(); } });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }));
  m.castShadow = true; return m;
}

/** A plain helmet that sits on a toon head (head-local): 'allied' = olive dome + brim, 'blank' = a plain grey dome. */
export function makeHelmet(kind = 'allied') {
  const g = new THREE.Group(), M = std(kind === 'allied' ? 0x5c6638 : 0x6c7278, 0.75);
  const d = mk(new THREE.SphereGeometry(0.305, 26, 14, 0, TAU, 0, PI / 2), M, g, 0, 0.03, -0.01); d.scale.y = kind === 'allied' ? 0.86 : 0.95;
  mk(new THREE.CylinderGeometry(0.33, kind === 'allied' ? 0.35 : 0.34, 0.035, 28), M, g, 0, 0.035, -0.01);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** A swirl-disc time portal (faces +z) + a glow. set(t, open 0..1). */
export function makePortal(r = 1.6) {
  const g = new THREE.Group();
  const t = tex(512, 512, (c, w, h) => { const cx = w / 2; const gr = c.createRadialGradient(cx, cx, 0, cx, cx, cx); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.18, '#c8b6ff'); gr.addColorStop(0.6, '#6a3fd8'); gr.addColorStop(0.92, '#3a1a8a'); gr.addColorStop(1, 'rgba(58,26,138,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 9; for (let k = 0; k < 6; k++) { c.beginPath(); for (let i = 0; i < 80; i++) { const a = k * TAU / 6 + i * 0.07, rr = i * 3.0; i ? c.lineTo(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr) : c.moveTo(cx, cx); } c.stroke(); } });
  const disc = mk(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }), g); disc.castShadow = false;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('180,140,255', 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); glow.scale.setScalar(r * 3.2); g.add(glow);
  return { g, set(tt, open) { g.visible = open > 0.01; disc.rotation.z = -tt * 4; g.scale.setScalar(Math.max(0.001, open)); glow.material.opacity = 0.8 * open; } };
}

/** A portrait phone (screen faces +z, 7.4 × 15.6 cm). */
export function makePhone(screenTex) {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.078, 0.162, 0.009, 3, 0.008), std(0x1a1b20, 0.3), g);
  const scr = mk(new THREE.PlaneGeometry(0.072, 0.154), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), g, 0, 0, 0.0047); scr.castShadow = false;
  return { g, scr };
}
