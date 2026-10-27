// SET: TIDETOWN — a New England fishing harbor built for TIDES (029, "What if the Moon were twice as close?"). A granite quay
// with bollards, lobster traps, buoys, benches, lamp posts and a giant painted TIDE STAFF on the quay wall; a street of parked cars;
// a row of clapboard shops (LOBSTER SHACK, BAIT & TACKLE, HARBOR INN, ICE CREAM…) with lit windows and three balconies; a hill of
// houses + a white church spire behind; a stone breakwater out to a lighthouse whose beam sweeps; moored boats that float on the
// tide and GROUND on the mud when it drains; gulls; a dusk / night / morning sky (the east horizon, where the Moon rises, is −z).
//
// Coordinates (meters, y up). y = 0 = today's mean sea level. Quay edge at z = 0, quay top y = DIMS.quayY (2.2), street z∈[6,14],
// sidewalk z∈[14,16.5] (+0.14), shopfronts at z = 16.5, x∈[-62,62]. Harbor mud floorY(x,z) for z < 0 (−2.4 at the wall, sloping
// down 5 cm per meter). setTide(level, t) raises/lowers the whole sea (it floods the street when level > 2.2); rideBoats(t, level)
// floats or grounds every boat; setMode('dusk'|'night'|'morning'); setMoon(dir, k) aims the moonlight (k = brightness ×);
// update(t) = lighthouse beam, gulls, flag, ripples. Camera far ≥ 2000 (sky dome r 1800).
import * as THREE from 'three';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';
import { makeCar } from '@engine/sets/city.js';

const PI = Math.PI;
export const DIMS = {
  quayY: 2.2, street: [6, 14], walk: 16.5, front: 16.5, staff: [0.9, -0.32], lighthouse: [-14, -232],
  balconies: [[-21.3, 16.5], [2.5, 16.5], [25.55, 16.5]], balconyY: 8.9, bench: [[-14, 3.2], [2, 3.2], [26, 3.2]],
};
export function floorY(x, z) { if (z >= 0) return DIMS.quayY; return Math.max(-14, -2.4 + 0.05 * z) + 0.25 * Math.sin(x * 0.13 + z * 0.07) + 0.15 * Math.sin(x * 0.31 - z * 0.19); }

export function buildTidetown(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 29);
  const Q = DIMS.quayY;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0x9aa6c4, 260, 1700);

  // ---------------------------------------------------------------- sky (shader dome: zenith → horizon, east/west different)
  const SU = { uTop: { value: new THREE.Color() }, uEast: { value: new THREE.Color() }, uWest: { value: new THREE.Color() }, uBand: { value: new THREE.Color() }, uBandK: { value: 0 }, uLow: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uTop, uEast, uWest, uBand, uLow; uniform float uBandK; varying vec3 vD;
      void main(){ float h = clamp(vD.y, -1.0, 1.0); float e = smoothstep(0.6, -0.9, vD.z);   // 1 toward −z (east)
        vec3 hor = mix(uWest, uEast, e); vec3 c = mix(hor, uTop, smoothstep(0.0, 0.55, h));
        c = mix(c, uBand, uBandK * e * exp(-pow((h - 0.1) / 0.07, 2.0)));   // Belt of Venus over the eastern horizon at dusk
        c = mix(c, uLow, smoothstep(0.0, -0.05, h)); gl_FragColor = vec4(c, 1.0); }`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);
  const SG = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 1600; i++) { const u = 0.05 + R() * 0.95, a = R() * PI * 2, s = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * s * 1700, u * 1700, Math.sin(a) * s * 1700); }
  SG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const dotT = canvasTex(32, 32, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const stars = new THREE.Points(SG, new THREE.PointsMaterial({ size: 2.2, map: dotT, transparent: true, depthWrite: false, fog: false, sizeAttenuation: false, color: 0xdfe8ff, opacity: 0 }));
  stars.renderOrder = -9; stars.frustumCulled = false; root.add(stars);
  const _cl = new THREE.Vector3();
  const followCam = () => { root.worldToLocal(_cl.copy(studio.camera.position)); sky.position.copy(_cl); stars.position.copy(_cl); };   // the root may be parked at an offset
  sky.onBeforeRender = followCam;
  // a few soft clouds low over the hills (west) and far headlands on both sides of the eastern horizon
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.85 });
  const clouds = new THREE.Group(); root.add(clouds);
  for (let i = 0; i < 9; i++) { const a = PI * 0.15 + R() * PI * 0.7, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 1300, 180 + R() * 180, Math.sin(a) * 1300); clouds.add(cg); for (let k = 0; k < 5; k++) { const p = mk(new THREE.SphereGeometry(40 + R() * 30, 12, 8), cloudM, cg, (k - 2) * 45, R() * 14, R() * 20); p.scale.y = 0.38; p.castShadow = false; } }
  const headM = mat(0x2c3a3a, 1);
  for (const [x, z, w] of [[-760, -1100, 260], [-420, -1250, 150], [680, -1150, 300], [1000, -900, 200]]) { const m = mk(new THREE.SphereGeometry(w, 16, 8), headM, root, x, -w * 0.82, z); m.scale.y = 0.5; m.castShadow = false; }

  // ---------------------------------------------------------------- sea + harbor floor
  const nrmT = canvasTex(256, 256, (g, w, h) => {   // tiled ripple normal map (encoded rgb), the moonlight glitters on it
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = x / w * PI * 2, b = y / h * PI * 2;
      const dx = 0.5 * Math.cos(a * 3 + b * 2) + 0.35 * Math.cos(a * 7 - b * 3) + 0.2 * Math.cos(a * 13 + b * 5), dy = 0.5 * Math.cos(b * 4 - a) + 0.35 * Math.cos(b * 9 + a * 4) + 0.2 * Math.cos(b * 11 - a * 6);
      const i = (y * w + x) * 4; img.data[i] = 128 + dx * 70; img.data[i + 1] = 128 + dy * 70; img.data[i + 2] = 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, [90, 90]);
  nrmT.colorSpace = THREE.NoColorSpace;
  const seaM = new THREE.MeshStandardMaterial({ color: 0x1f4c62, roughness: 0.42, metalness: 0.0, normalMap: nrmT, normalScale: new THREE.Vector2(1.1, 1.1), emissive: 0x0a1a28 });
  const sea = mk(new THREE.PlaneGeometry(4000, 4000), seaM, root, 0, 0, -400); sea.rotation.x = -PI / 2; sea.castShadow = false; sea.receiveShadow = true;
  const mudT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#5e5142'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '40,34,26' : '120,108,88'},${0.08 + R() * 0.12})`; g.beginPath(); g.ellipse(R() * w, R() * h, 4 + R() * 26, 2 + R() * 8, R() * 3, 0, 7); g.fill(); } for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(52,84,40,${0.15 + R() * 0.25})`; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 10, 0, 7); g.fill(); } }, [30, 30]);
  const floorGeo = new THREE.PlaneGeometry(500, 420, 120, 100); floorGeo.rotateX(-PI / 2);
  { const p = floorGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 210; p.setZ(i, z); p.setY(i, floorY(x, Math.min(z, -0.4))); } floorGeo.computeVertexNormals(); }
  const mud = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: mudT, color: 0xb8aa94, roughness: 0.45, metalness: 0.05 })); mud.receiveShadow = true; root.add(mud);
  // rocks + seaweed at the foot of the wall and along the breakwater
  const rockM = [mat(0x6a655c, 0.95), mat(0x5a5650, 0.95), mat(0x7a7268, 0.95)], weedM = mat(0x3a4a26, 0.9);
  for (let i = 0; i < 70; i++) { const x = -70 + R() * 140, z = -0.8 - R() * 5; const r = mk(new THREE.IcosahedronGeometry(0.5 + R() * 0.9, 0), rockM[i % 3], root, x, floorY(x, z) + 0.2, z); r.scale.y = 0.6; r.rotation.set(R(), R(), R()); }

  // ---------------------------------------------------------------- quay wall + deck + tide staff
  const graniteT = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#4a4741'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let c = -1; c < 4; c++) { const o = (r % 2) * 32, v = 92 + R() * 34; g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.fillRect(c * 64 + o + 3, r * 32 + 3, 58, 26); } }, [40, 3]);
  const wallM = new THREE.MeshStandardMaterial({ map: graniteT, roughness: 0.9 });
  box(150, Q + 7, 1.0, wallM, 0, (Q - 7) / 2, -0.5);
  const weedBand = mk(new THREE.PlaneGeometry(150, 3.2), new THREE.MeshStandardMaterial({ color: 0x2f3b22, roughness: 0.95, transparent: true, opacity: 0.85 }), root, 0, -1.2, -1.01); weedBand.castShadow = false;
  const deckT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a49c8e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(70,64,56,.35)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(k * 64 + (i % 2) * 32, i * 32); g.lineTo(k * 64 + (i % 2) * 32, i * 32 + 32); g.stroke(); } } }, [36, 4]);
  const deck = mk(new THREE.PlaneGeometry(150, 6), new THREE.MeshStandardMaterial({ map: deckT, roughness: 0.85 }), root, 0, Q + 0.005, 3); deck.rotation.x = -PI / 2; deck.castShadow = false;
  box(150, 0.25, 0.6, mat(0xb8b2a6, 0.8), 0, Q + 0.12, 0.3);   // coping stones
  const asphaltT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3c3e42'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},${R() * 0.06})`; g.fillRect(R() * w, R() * h, 2, 2); } }, [30, 2]);
  const road = mk(new THREE.PlaneGeometry(150, 8), new THREE.MeshStandardMaterial({ map: asphaltT, roughness: 0.75 }), root, 0, Q + 0.01, 10); road.rotation.x = -PI / 2; road.castShadow = false;
  for (let x = -72; x < 72; x += 6) { const l = mk(new THREE.PlaneGeometry(3, 0.15), mat(0xe8d070, 0.6), root, x, Q + 0.02, 10); l.rotation.x = -PI / 2; l.castShadow = false; }
  box(150, 0.14, 2.5, mat(0xb4ada2, 0.85), 0, Q + 0.07, 15.25); box(150, 0.16, 0.18, mat(0x9a948a, 0.8), 0, Q + 0.08, 14.05);
  box(150, 0.3, 120, mat(0x55604a, 1), 0, Q - 0.2, 76);   // ground under the town
  // the TIDE STAFF: meters 0..8 painted on a board bolted to the wall face, from y −6.5 up to the coping (0 = y −6.5)
  const SH = Q + 6.5 - 0.2;
  const staffT = canvasTex(128, 1024, (g, w, h) => {
    g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h); const px = h / SH;
    for (let m = 0; m <= 9; m++) { const y = h - m * px; g.fillStyle = '#1d2a3a'; g.fillRect(0, y - 4, w, 8); for (let k = 1; k < 5; k++) g.fillRect(0, y - k * px / 5 - 2, w * 0.38, 4); if (m > 0 && m < 9) { g.fillStyle = m % 2 ? '#c8302c' : '#1d2a3a'; g.font = 'bold 70px Helvetica, Arial, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(String(m), w - 6, y - px / 2); } }
  });
  const staff = mk(new THREE.PlaneGeometry(0.8, SH), new THREE.MeshStandardMaterial({ map: staffT, roughness: 0.6 }), root, DIMS.staff[0], -6.5 + SH / 2, -1.04); staff.rotation.y = PI; staff.castShadow = false;
  box(0.9, SH + 0.1, 0.06, mat(0x2a2d31, 0.6), DIMS.staff[0], -6.5 + SH / 2, -1.0);
  // ladders + fender tyres + rings on the wall
  for (const x of [-38, -8, 20, 44]) for (let k = 0; k < 10; k++) box(0.5, 0.05, 0.12, mat(0x2a2d31, 0.4, { metalness: 0.6 }), x, Q - 0.4 - k * 0.8, -1.08);
  const tyreM = mat(0x1c1c1e, 0.8);
  for (let x = -60; x <= 60; x += 9) { const ty = mk(new THREE.TorusGeometry(0.42, 0.16, 8, 16), tyreM, root, x + 3, Q - 1.0, -1.1); void ty; }

  // ---------------------------------------------------------------- quay furniture
  const iron = mat(0x23262b, 0.5, { metalness: 0.4 });
  for (let x = -66; x <= 66; x += 7) { mk(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 12), iron, root, x, Q + 0.3, 0.6); mk(new THREE.SphereGeometry(0.25, 12, 8), iron, root, x, Q + 0.62, 0.6); }
  const lampHeadM = new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffc878, emissiveIntensity: 0 });
  const lamps = [], lampLights = [];
  for (let x = -63; x <= 63; x += 14) { const g = new THREE.Group(); g.position.set(x, Q, 1.6); root.add(g); mk(new THREE.CylinderGeometry(0.07, 0.11, 4.2, 8), iron, g, 0, 2.1, 0); box(0.6, 0.06, 0.06, iron, 0.25, 4.1, 0, g); mk(new THREE.SphereGeometry(0.26, 14, 10), lampHeadM, g, 0.5, 3.85, 0); lamps.push(g); }
  for (const x of [-21, 7, 35]) { const L = new THREE.PointLight(0xffc27a, 0, 22, 1.6); L.position.set(x + 0.5, Q + 3.7, 1.8); root.add(L); lampLights.push(L); }
  const trapT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#4f7a5a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a3d2e'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * 8, 0); g.lineTo(i * 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 8); g.lineTo(w, i * 8); g.stroke(); } });
  const trapM = [new THREE.MeshStandardMaterial({ map: trapT, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: trapT, color: 0xe8c860, roughness: 0.8 })];
  const traps = new THREE.Group(); root.add(traps);
  for (const [x0, n] of [[-44, 9], [12, 6], [33, 8]]) for (let i = 0; i < n; i++) box(1.1, 0.55, 0.75, trapM[i % 2], x0 + (i % 3) * 1.15, Q + 0.28 + Math.floor(i / 3) * 0.56, 4.4 + (i % 2) * 0.05, traps);
  const buoyCols = [0xe8462e, 0xf2c12e, 0xffffff, 0x3a7bd5, 0x5fb35a];
  for (let i = 0; i < 14; i++) { const b = mk(new THREE.CapsuleGeometry(0.16, 0.38, 4, 10), mat(buoyCols[i % 5], 0.5), traps, -44 + (i % 7) * 0.5, Q + 1.95 + Math.floor(i / 7) * 0.5, 5.0); b.rotation.z = 0.2 * Math.sin(i); }
  for (const [x, z] of DIMS.bench) { const g = new THREE.Group(); g.position.set(x, Q, z); root.add(g); const wood = mat(0x8a5a32, 0.7); box(2.2, 0.08, 0.5, wood, 0, 0.48, 0, g); box(2.2, 0.5, 0.06, wood, 0, 0.78, 0.26, g); for (const s of [-1, 1]) box(0.08, 0.48, 0.5, iron, s * 1.0, 0.24, 0, g); }
  // harbormaster hut + flag pole
  const hut = new THREE.Group(); hut.position.set(48, Q, 3.6); root.add(hut);
  box(4, 2.8, 3, mat(0xf2efe6, 0.7), 0, 1.4, 0, hut); const hr = box(4.5, 0.2, 3.6, mat(0x2f5a8a, 0.6), 0, 3.0, 0, hut); void hr; box(2.2, 1.0, 0.08, mat(0x9ec4e6, 0.2), 0, 1.7, -1.52, hut);
  const hmT = canvasTex(512, 96, (g, w, h) => { g.fillStyle = '#2f5a8a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 58px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HARBORMASTER', w / 2, h / 2 + 3); });
  const hms = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.65), new THREE.MeshStandardMaterial({ map: hmT })); hms.position.set(0, 2.55, -1.53); hms.rotation.y = PI; hut.add(hms);
  mk(new THREE.CylinderGeometry(0.06, 0.08, 9, 8), mat(0xf2f2f2, 0.5), root, 52, Q + 4.5, 1.8);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1, 12, 4), new THREE.MeshStandardMaterial({ map: canvasTex(128, 80, (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#fff' : '#c8302c'; g.fillRect(0, i * h / 7, w, h / 7 + 1); } g.fillStyle = '#2a3f73'; g.fillRect(0, 0, w * 0.42, h * 0.55); }), side: THREE.DoubleSide, roughness: 0.8 }));
  flag.position.set(52.9, Q + 8.3, 1.8); root.add(flag); const flagBase = flag.geometry.attributes.position.array.slice();

  // ---------------------------------------------------------------- parked cars
  const cars = [];
  for (const [x, c, s] of [[-46, 0xd2483f, 1], [-25, 0x3d7bd9, -1], [5.5, 0xe9e6e0, 1], [-0.5, 0xf1c24a, -1], [29, 0x2f6a4a, 1], [56, 0x8f6fb8, -1], [-8, 0xc8473c, 1], [12, 0x3d7bd9, -1]]) { const car = makeCar(c, Math.abs(x) + 3); car.g.position.set(x, Q, 7.6 + (s < 0 ? 4.8 : 0)); car.g.rotation.y = s * PI / 2; root.add(car.g); cars.push({ ...car, x, z: car.g.position.z, ry: car.g.rotation.y }); }

  // ---------------------------------------------------------------- shopfronts (clapboard, lit windows, signs, balconies)
  const SHOPS = [
    ['LOBSTER SHACK', 0xc8473c, '#c8302c'], ['BAIT & TACKLE', 0x4f7a9a, '#1d3f73'], ['HARBOR INN', 0xf2efe6, '#2f5a8a'], ['ICE CREAM', 0xf3c9d4, '#c8476c'],
    ['FISH MARKET', 0x8fb3a0, '#2f5a3a'], ['FUDGE', 0xf2d48a, '#8a4a20'], ['CHANDLERY', 0x9a5a3c, '#f2efe6'], ['CAFÉ', 0xb8d4e8, '#2f5a8a'], ['GALLERY', 0xe8e4da, '#3a3d42'], ['POST OFFICE', 0xc9b48e, '#2a2d31'],
  ];
  const winMats = [];
  const facade = (w, h, floors, seed) => {
    const S = 256, Rf = rng(seed), lit = [];
    const cols = Math.max(2, Math.round(w / 2.6));
    for (let i = 0; i < cols * floors; i++) lit.push(Rf() < 0.75);
    const draw = (em) => canvasTex(S, S, (g) => {
      g.fillStyle = em ? '#000' : 'rgba(0,0,0,0)'; if (em) g.fillRect(0, 0, S, S); else g.clearRect(0, 0, S, S);
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        if (f === 0) continue;
        const x = (c + 0.5) / cols * S, y = S - (f + 0.55) / floors * S, ww = S / cols * 0.42, hh = S / floors * 0.5;
        if (em) { if (lit[f * cols + c]) { g.fillStyle = ['#ffcf86', '#ffe0a8', '#ffd28f'][(f + c) % 3]; g.fillRect(x - ww / 2, y - hh / 2, ww, hh); } }
        else { g.fillStyle = '#f6f3ea'; g.fillRect(x - ww / 2 - 5, y - hh / 2 - 5, ww + 10, hh + 10); g.fillStyle = '#25303c'; g.fillRect(x - ww / 2, y - hh / 2, ww, hh); g.fillStyle = '#f6f3ea'; g.fillRect(x - 2, y - hh / 2, 4, hh); g.fillRect(x - ww / 2, y - 2, ww, 4); }
      }
    });
    return { map: draw(false), em: draw(true) };
  };
  const clapT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.13)'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 8 + 6, w, 2); }, [6, 6]);
  const town = new THREE.Group(); root.add(town);
  let x = -62;
  SHOPS.forEach(([name, col, signCol], i) => {
    const w = 10 + (i % 3) * 1.5, floors = 2 + (i % 2), h = floors * 3.1 + 0.6, cx = x + w / 2; x += w + 0.4;
    const g = new THREE.Group(); g.position.set(cx, Q + 0.14, DIMS.front + 5); town.add(g);
    box(w, h, 10, new THREE.MeshStandardMaterial({ map: clapT, color: col, roughness: 0.8 }), 0, h / 2, 0, g);
    const f = facade(w, h, floors, 100 + i);
    const wm = new THREE.MeshStandardMaterial({ map: f.map, transparent: true, emissiveMap: f.em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.4 });
    winMats.push(wm);
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); fp.position.set(0, h / 2, -5.02); fp.rotation.y = PI; fp.castShadow = false; g.add(fp);
    // pitched roof
    const roofM = mat([0x3a3d42, 0x5a3a2a, 0x2f3a4a][i % 3], 0.75);
    const r1 = box(w + 0.6, 0.25, 6.2, roofM, 0, h + 1.5, -2.6, g); r1.rotation.x = -0.55; const r2 = box(w + 0.6, 0.25, 6.2, roofM, 0, h + 1.5, 2.6, g); r2.rotation.x = 0.55;
    box(w - 0.2, 3.0, 9.4, new THREE.MeshStandardMaterial({ map: clapT, color: col, roughness: 0.8 }), 0, h + 1.2, 0, g).scale.y = 1;
    if (i % 3 === 1) { mk(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 8), mat(0x8a4a3a, 0.8), g, w * 0.3, h + 3.2, 1); }
    // ground floor: big shop window + door + sign
    const shopEm = new THREE.MeshStandardMaterial({ color: 0x2a3440, emissive: 0xb88a58, emissiveIntensity: 0, roughness: 0.2 });
    winMats.push(shopEm);
    box(w * 0.5, 1.9, 0.1, shopEm, -w * 0.15, 1.45, -5.05, g); box(1.2, 2.3, 0.1, mat(0x4a3a2a, 0.6), w * 0.3, 1.15, -5.05, g);
    const sT = canvasTex(512, 96, (c, ww, hh) => { c.fillStyle = signCol; c.fillRect(0, 0, ww, hh); c.fillStyle = signCol === '#f2efe6' ? '#2a2d31' : '#fffdf4'; c.font = `bold ${name.length > 11 ? 50 : 60}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, ww / 2, hh / 2 + 3); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 0.85, 7.5), 0.95), new THREE.MeshStandardMaterial({ map: sT, roughness: 0.6, emissive: 0xffffff, emissiveMap: sT, emissiveIntensity: 0 })); winMats.push(sign.material);
    sign.position.set(0, 3.05, -5.08); sign.rotation.y = PI; g.add(sign);
    // striped awning on a few
    if (i % 2 === 0) { const aT = canvasTex(64, 16, (c, ww, hh) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#fffdf4' : signCol; c.fillRect(k * 8, 0, 8, hh); } }); const aw = mk(new THREE.PlaneGeometry(w * 0.55, 1.3), new THREE.MeshStandardMaterial({ map: aT, side: THREE.DoubleSide, roughness: 0.8 }), g, -w * 0.15, 2.6, -5.6); aw.rotation.x = -0.9; aw.rotation.y = PI; }
    // flower boxes
    for (let k = 0; k < 3; k++) { const fx = (k - 1) * w * 0.3; box(1.1, 0.25, 0.3, mat(0x6a4a30, 0.8), fx, 3.75, -5.2, g); for (let q = 0; q < 4; q++) mk(new THREE.SphereGeometry(0.12, 8, 6), mat([0xe2574c, 0xf2c12e, 0xe58fa6, 0xffffff][(q + k + i) % 4], 0.7), g, fx - 0.4 + q * 0.27, 3.95, -5.25); }
  });
  // balconies (people stand on them in the flood)
  for (const [bx, bz] of DIMS.balconies) { const g = new THREE.Group(); g.position.set(bx, DIMS.balconyY, bz - 0.1); root.add(g); box(4.2, 0.18, 1.4, mat(0xf2efe6, 0.6), 0, 0, -0.7, g); for (let k = 0; k <= 10; k++) box(0.05, 0.95, 0.05, mat(0xf2efe6, 0.6), -2.05 + k * 0.41, 0.5, -1.35, g); box(4.2, 0.07, 0.07, mat(0xf2efe6, 0.6), 0, 0.98, -1.35, g); for (const s of [-1, 1]) box(0.05, 0.95, 1.3, mat(0xf2efe6, 0.6), s * 2.07, 0.5, -0.7, g); }
  // hill of houses + church behind
  const hill = new THREE.Group(); root.add(hill);
  const hillM = mat(0x56704a, 1);
  const hm = mk(new THREE.SphereGeometry(160, 24, 12), hillM, hill, 0, -118, 150); hm.scale.set(1.4, 0.55, 0.6); hm.castShadow = false;
  const houseCols = [0xf2efe6, 0xc8473c, 0x4f7a9a, 0xf2d48a, 0x8fb3a0, 0xe8e4da];
  const hemT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd08a'; g.fillRect(10, 20, 14, 16); g.fillRect(38, 20, 14, 16); });
  const hillWin = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveMap: hemT, emissiveIntensity: 0, map: canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3440'; g.fillRect(10, 20, 14, 16); g.fillRect(38, 20, 14, 16); }) }); winMats.push(hillWin);
  for (let i = 0; i < 46; i++) {
    const hx = -110 + R() * 220, hz = 32 + R() * 70, hy = Q - 0.2 + (hz - 28) * 0.24 + Math.cos(hx / 90) * 3, s = 5 + R() * 3;
    const g = new THREE.Group(); g.position.set(hx, hy, hz); g.rotation.y = (R() - 0.5) * 0.4; hill.add(g);
    box(s, s * 0.75, s * 0.8, mat(houseCols[i % 6], 0.8), 0, s * 0.37, 0, g);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.8, s * 0.5), hillWin); fr.position.set(0, s * 0.4, -s * 0.41); fr.rotation.y = PI; g.add(fr);
    const rf = mk(new THREE.ConeGeometry(s * 0.72, s * 0.5, 4), mat([0x3a3d42, 0x5a3a2a][i % 2], 0.8), g, 0, s * 0.75 + s * 0.24, 0); rf.rotation.y = PI / 4; rf.scale.z = 0.8;
  }
  const treeM = [mat(0x3e6a3a, 0.9), mat(0x4a7a40, 0.9), mat(0x2f5a32, 0.9)];
  for (let i = 0; i < 70; i++) { const tx = -130 + R() * 260, tz = 30 + R() * 80, ty = Q + (tz - 28) * 0.24 + Math.cos(tx / 90) * 3; const t = mk(new THREE.SphereGeometry(2 + R() * 2.2, 10, 8), treeM[i % 3], hill, tx, ty + 2.5, tz); t.scale.y = 1.25; }
  const church = new THREE.Group(); church.position.set(-24, Q + 13, 70); root.add(church);
  box(9, 7, 14, mat(0xf6f4ee, 0.7), 0, 3.5, 0, church); const cr = box(9.8, 0.3, 8, mat(0x3a3d42, 0.7), 0, 8.4, -2, church); cr.rotation.x = -0.6; const cr2 = box(9.8, 0.3, 8, mat(0x3a3d42, 0.7), 0, 8.4, 2, church); cr2.rotation.x = 0.6;
  box(3.4, 10, 3.4, mat(0xf6f4ee, 0.7), 0, 5, -8, church); mk(new THREE.ConeGeometry(2.2, 9, 4), mat(0xf6f4ee, 0.7), church, 0, 14.5, -8).rotation.y = PI / 4;
  const clockFace = mk(new THREE.CircleGeometry(0.9, 24), new THREE.MeshStandardMaterial({ color: 0xf2e6c8, emissive: 0xffe0a0, emissiveIntensity: 0 }), church, 0, 8.6, -9.72); clockFace.rotation.y = PI; winMats.push(clockFace.material);

  // ---------------------------------------------------------------- breakwater + lighthouse
  const bw = new THREE.Group(); root.add(bw);
  const bwPts = [[-58, -1], [-56, -60], [-52, -130], [-42, -190], [-24, -224]];
  for (let k = 0; k < bwPts.length - 1; k++) {
    const [x0, z0] = bwPts[k], [x1, z1] = bwPts[k + 1], L = Math.hypot(x1 - x0, z1 - z0);
    const b = box(7, 12, L + 1, wallM, (x0 + x1) / 2, Q - 5.4, (z0 + z1) / 2, bw); b.rotation.y = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < L / 3; i++) { const u = i / (L / 3), rx = lerp(x0, x1, u) + (R() - 0.5) * 9, rz = lerp(z0, z1, u); const r = mk(new THREE.IcosahedronGeometry(1.4 + R() * 1.4, 0), rockM[i % 3], bw, rx, -1.5 + R() * 2.5, rz); r.rotation.set(R(), R(), R()); }
  }
  const lh = new THREE.Group(); lh.position.set(DIMS.lighthouse[0], Q, DIMS.lighthouse[1]); root.add(lh);
  mk(new THREE.CylinderGeometry(4.5, 5.5, 2, 20), wallM, lh, 0, 0, 0);
  const white = mat(0xf6f4ee, 0.6), red = mat(0xc8302c, 0.6);
  mk(new THREE.CylinderGeometry(1.7, 2.3, 12, 20), white, lh, 0, 7, 0); mk(new THREE.CylinderGeometry(2.05, 2.17, 2.5, 20), red, lh, 0, 6, 0);   // just outside the tapered tower (z-fight flecks otherwise)
  mk(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 20), mat(0x22252a, 0.5), lh, 0, 13.1, 0);
  const lantern = mk(new THREE.CylinderGeometry(1.2, 1.2, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffd890, emissiveIntensity: 0.4 }), lh, 0, 14.1, 0);
  mk(new THREE.ConeGeometry(1.6, 1.4, 16), red, lh, 0, 15.7, 0);
  const beamT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,240,200,.85)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beam = new THREE.Group(); beam.position.set(0, 14.1, 0); lh.add(beam);
  for (const s of [1, -1]) { const b = new THREE.Mesh(new THREE.ConeGeometry(9, 140, 20, 1, true), new THREE.MeshBasicMaterial({ map: beamT, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); b.rotation.z = s * PI / 2; b.position.x = s * 70; beam.add(b); }

  // ---------------------------------------------------------------- boats (float on the tide, ground on the mud)
  const boats = [];
  const lobster = (hullC, trim) => { const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
    const hull = mk(new THREE.BoxGeometry(3, 1.5, 9), mat(hullC, 0.5), body, 0, 0.35, 0); void hull; mk(new THREE.ConeGeometry(1.5, 2.2, 4, 1), mat(hullC, 0.5), body, 0, 0.35, 5.4).rotation.set(PI / 2, PI / 4, 0);
    box(3.05, 0.3, 9.05, mat(trim, 0.5), 0, 1.0, 0, body); box(2.3, 1.8, 2.6, white, 0, 2.0, 1.6, body); box(2.1, 0.6, 2.62, mat(0x9ec4e6, 0.2), 0, 2.4, 1.62, body);
    box(2.5, 0.1, 2.9, mat(trim, 0.5), 0, 2.95, 1.6, body); for (let k = 0; k < 4; k++) box(0.8, 0.5, 0.6, trapM[k % 2], (k % 2 - 0.5) * 1.1, 1.4, -2 - Math.floor(k / 2) * 0.8, body);
    mk(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), iron, body, 0, 4.2, 1.0); return { g, body, draft: 1.0 }; };
  const sailboat = (hullC) => { const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
    const hull = mk(new THREE.CylinderGeometry(1.1, 0.55, 7, 10, 1), mat(hullC, 0.5), body, 0, 0.35, 0); hull.rotation.x = PI / 2; hull.scale.set(1, 1, 0.55);
    box(1.6, 0.25, 5.8, mat(0xb07a4a, 0.6), 0, 0.65, 0, body); mk(new THREE.CylinderGeometry(0.07, 0.09, 9, 6), mat(0xd8d4cc, 0.5), body, 0, 5.1, 0.5);
    mk(new THREE.BoxGeometry(0.1, 1.2, 0.5), mat(0x2a2d31, 0.5), body, 0, -0.5, 0); return { g, body, draft: 1.5 }; };
  const dinghy = (c) => { const g = new THREE.Group(); const body = new THREE.Group(); g.add(body); const h = mk(new THREE.CylinderGeometry(0.75, 0.45, 3, 10, 1, true), mat(c, 0.5, { side: THREE.DoubleSide }), body, 0, 0.2, 0); h.rotation.x = PI / 2; h.scale.set(1, 1, 0.45); box(1.1, 0.08, 0.3, mat(0xb07a4a, 0.6), 0, 0.25, 0, body); return { g, body, draft: 0.35 }; };
  const specs = [
    [lobster(0xf4f1ea, 0x2f6aa8), 4, -11, 0.15], [lobster(0x2f5a8a, 0xf4f1ea), -18, -13, -0.1], [lobster(0xc8473c, 0xf4f1ea), 24, -16, 0.2],
    [sailboat(0xf4f1ea), -6, -26, 0.5], [sailboat(0x1d3f73), 26, -40, -0.3], [sailboat(0xf2d48a), -32, -30, 0.8],
    [dinghy(0xe8462e), -2, -4.5, 1.3], [dinghy(0xf2c12e), 10, -5.0, -1.4], [lobster(0x5fb35a, 0xf4f1ea), 38, -24, -0.4],
  ];
  for (const [b, bx, bz, ry] of specs) { root.add(b.g); boats.push({ ...b, x: bx, z: bz, ry, seed: R() * 6 }); }

  // ---------------------------------------------------------------- gulls
  const gullM = mat(0xf4f4f2, 0.7), gulls = [];
  for (let i = 0; i < 10; i++) { const g = new THREE.Group(); root.add(g); mk(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), gullM, g, 0, 0, 0).rotation.x = PI / 2; const wl = new THREE.Group(), wr = new THREE.Group(); g.add(wl, wr); mk(new THREE.BoxGeometry(0.7, 0.02, 0.22), gullM, wl, -0.35, 0, 0); mk(new THREE.BoxGeometry(0.7, 0.02, 0.22), gullM, wr, 0.35, 0, 0); gulls.push({ g, wl, wr, cx: -40 + i * 9, cz: -20 - (i % 4) * 12, y: 12 + (i % 3) * 4, r: 8 + (i % 3) * 5, w: 0.25 + (i % 4) * 0.06, ph: i * 1.7 }); }

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0xb8c4e8, 0x4a4238, 0.8); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc89a, 1.0); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  const moon = new THREE.DirectionalLight(0xbcd0ff, 0.0); root.add(moon, moon.target); moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.03;
  let focus = [0, 0, 40], moonDir = new THREE.Vector3(0.1, 0.2, -1).normalize(), moonK = 1;
  const MODES = {
    dusk:    { top: 0x243f78, east: 0x5f6a9c, west: 0xf2a878, band: 0xd890a8, bandK: 0.42, low: 0x4a5070, hemi: [0xb8c0e8, 0x5a4a40, 0.85], sun: [0xffb070, 0.9, [0.1, 0.12, 1]], moonBase: 0.5, win: 0.9, lamp: 1, fog: 0x8a90b0, sea: 0x24506a, seaE: 0x1a2a40, stars: 0.0 },
    night:   { top: 0x0d1d44, east: 0x2a3f74, west: 0x1c2a52, band: 0x000000, bandK: 0, low: 0x10182c, hemi: [0x7f98d8, 0x2a2a30, 0.6], sun: [0x000000, 0, [0, 1, 0]], moonBase: 0.45, win: 1.2, lamp: 1, fog: 0x22305a, sea: 0x3a6a8a, seaE: 0x0c2036, stars: 0.6 },
    morning: { top: 0x3f86d6, east: 0xf2e6d0, west: 0xbcd8f0, band: 0xffd8b0, bandK: 0.25, low: 0x8aa0b8, hemi: [0xd6e8ff, 0x7a6a58, 1.1], sun: [0xfff0d8, 2.6, [0.35, 0.55, -0.75]], moonBase: 0, win: 0, lamp: 0, fog: 0xd4e2ec, sea: 0x2d6f8e, seaE: 0x08202c, stars: 0 },
  };
  let mode = 'dusk';
  function aim() {
    const M = MODES[mode];
    const sd = new THREE.Vector3(...M.sun[2]).normalize();
    sun.target.position.set(focus[0], 0, focus[1]); sun.position.copy(sun.target.position).addScaledVector(sd, 300);
    moon.target.position.set(focus[0], 0, focus[1]); moon.position.copy(moon.target.position).addScaledVector(moonDir, 300);
    for (const L of [sun, moon]) { const h = focus[2]; Object.assign(L.shadow.camera, { left: -h, right: h, top: h, bottom: -h, near: 50, far: 700 }); L.shadow.camera.updateProjectionMatrix(); }
  }
  function setMode(m) {
    mode = m; const M = MODES[m];
    SU.uTop.value.set(M.top); SU.uEast.value.set(M.east); SU.uWest.value.set(M.west); SU.uBand.value.set(M.band); SU.uBandK.value = M.bandK; SU.uLow.value.set(M.low);
    hemi.color.set(M.hemi[0]); hemi.groundColor.set(M.hemi[1]); hemi.intensity = M.hemi[2];
    sun.color.set(M.sun[0]); sun.intensity = M.sun[1]; sun.castShadow = M.sun[1] > 0.5;
    winMats.forEach((w) => (w.emissiveIntensity = M.win)); lampHeadM.emissiveIntensity = 2.2 * M.lamp; lampLights.forEach((L) => (L.intensity = 60 * M.lamp));
    fog.color.set(M.fog); seaM.color.set(M.sea); seaM.emissive.set(M.seaE); stars.material.opacity = M.stars;
    cloudM.color.set(m === 'night' ? 0x3a4a70 : m === 'dusk' ? 0xf2c0b0 : 0xffffff);
    beam.children.forEach((b) => (b.material.opacity = m === 'morning' ? 0 : m === 'night' ? 0.22 : 0.12)); lantern.material.emissiveIntensity = m === 'morning' ? 0.3 : 2.5;
    setMoon(moonDir, moonK);
  }
  /** Moonlight from world direction dir (toward the Moon), k = brightness multiplier (4 = the doubled Moon). */
  function setMoon(dir, k = 1) { moonDir.copy(dir).normalize(); moonK = k; const M = MODES[mode]; moon.intensity = M.moonBase * k; moon.castShadow = moon.intensity > 0.6 && !sun.castShadow; hemi.intensity = M.hemi[2] * (1 + 0.12 * (k - 1) * (M.moonBase > 0 ? 1 : 0)); aim(); }
  const aimAt = (x, z, half = 40) => { focus = [x, z, half]; aim(); };
  function setTide(level, t = 0) {
    sea.position.y = level; nrmT.offset.set(t * 0.012, t * 0.007);
    const fl = Math.max(0, level - Q - 0.25); traps.position.set(fl * 0.15, fl, fl * 0.4); traps.rotation.z = fl > 0 ? 0.03 * Math.sin(t * 1.3) : 0;   // traps + buoys float off the quay
  }
  function rideBoats(t, level) {
    boats.forEach((b, i) => {
      const fy = floorY(b.x, b.z), float = level - fy > b.draft, sw = float ? 1 : 0;
      const y = float ? level - 0.1 + 0.06 * Math.sin(t * 1.3 + b.seed) : fy + b.draft * 0.55;
      b.g.position.set(b.x, y, b.z); b.g.rotation.set(0.03 * Math.sin(t * 1.1 + i) * sw, b.ry + 0.02 * Math.sin(t * 0.3 + i) * sw, sw ? 0.04 * Math.sin(t * 0.9 + i * 2) : (i % 2 ? 0.32 : -0.3));
    });
  }
  function update(t) {
    beam.rotation.y = t * 1.1;
    gulls.forEach((g) => { const a = g.ph + t * g.w; g.g.position.set(g.cx + Math.cos(a) * g.r, g.y + 0.6 * Math.sin(t * 0.8 + g.ph), g.cz + Math.sin(a) * g.r); g.g.rotation.y = -a; const f = Math.sin(t * 6 + g.ph); g.wl.rotation.z = 0.5 * f; g.wr.rotation.z = -0.5 * f; });
    const p = flag.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const fx = flagBase[i * 3] + 0.9; p.setZ(i, 0.18 * fx * Math.sin(fx * 3 - t * 6)); } p.needsUpdate = true;
    nrmT.offset.set(t * 0.012, t * 0.007);
  }
  setMode('dusk'); setTide(0, 0); rideBoats(0, 0); aimAt(0, 0, 40);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.isShaderMaterial)) { o.castShadow = false; o.receiveShadow = false; } });
  void clamp;
  return { root, D: DIMS, fog, sky, stars, sea, mud, boats, cars, lamps, town, hill, traps, staff, lighthouse: lh, gulls,
    lights: { hemi, sun, moon, lampLights }, setMode, setMoon, aimAt, setTide, rideBoats, update, floorY };
}
