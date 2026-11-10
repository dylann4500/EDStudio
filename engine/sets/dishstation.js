// Deep-space dish station (079 Vex Voyager explainer): a generic desert antenna complex at dusk, in the pixel/Vex look.
// Built from boxes, lathes + crisp pixel textures (engine/pixeltex.js) so it reads under engine/pixel.js like launchbeach.js.
// Vex stands on a gravel VISITOR OVERLOOK at the origin facing +z (the camera side); behind her (−z) a chain-link fence, then the
// station: a 70 m dish (makeDish: pedestal, alidade, a paraboloid reflector of panels, quadripod + subreflector, feed cone, red
// beacon) pointing up into the sunset sky over the lens, two 34 m dishes, a low control building with lit windows + a DEEP SPACE
// STATION sign, a parking lot, utility poles, Joshua trees, creosote bushes, rocks, mountains all round, a dusk dome with stars.
// Her camp table (a tablet on a stand = the Scribe screen, a lantern, a thermos, a mug, a star chart), a camp chair, a cooler, a
// telescope and her car dress the overlook.
//   const S = buildDishStation(studio);  S.root · S.D · S.dish {g, setPoint(az, el), focus(), vertex()} · S.small[] · S.aim(cx, cz, half)
//   S.tablet (Group: screen faces +z; add the screen mesh to it) · S.waves(t, k) = faint radio rings falling into the big dish
//   S.update(t) · S.fog (save it) · camera.far ≥ 2600. Nothing here is a real agency's logo or name.
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';
import { voxCar, voxSign, textCanvas } from '../voxel/index.js';

const PI = Math.PI;
export const D = { dish: [-24, -132], dishAxisY: 40, small: [[66, -176], [-118, -214]], table: [1.32, -0.42], fence: -16, building: [34, -70], scope: [-2.1, -1.5], car: [-5.6, 0.6] };

const lam = (o) => new THREE.MeshLambertMaterial(o);
const box = (parent, w, h, d, m, x, y, z, shadow = true) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = shadow; b.receiveShadow = true; parent.add(b); return b; };
const cyl = (parent, rt, rb, h, m, x, y, z, seg = 16, open = false) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; parent.add(c); return c; };
const Y = new THREE.Vector3(0, 1, 0);
/** a round strut from a to b (local coords of parent) */
function strut(parent, a, b, r, m) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), m); c.position.copy(A).add(B).multiplyScalar(0.5);
  c.quaternion.setFromUnitVectors(Y, B.clone().sub(A).normalize()); c.castShadow = true; parent.add(c); return c;
}

// ---------------------------------------------------------------- textures
const panelT = (rings = 9, spokes = 48) => pixelTex(128, 64, (g, w, h) => {   // u = around the dish, v = vertex → rim
  speckle(g, w, h, '#f3f4f6', ['#eaebef', '#fafafb', '#e2e4e8'], 300, 21);
  for (let i = 0; i < spokes; i++) { const x = Math.round((i / spokes) * w); g.fillStyle = '#b9bcc4'; g.fillRect(x, 0, 1, h); }
  for (let j = 1; j < rings; j++) { const y = Math.round((j / rings) * h); g.fillStyle = '#b4b7bf'; g.fillRect(0, y, w, 1); }
}, { k: 1 });
const concreteT = (rep = [6, 2]) => pixelTex(32, 32, (g, w, h) => { speckle(g, w, h, '#c9c3b6', ['#bdb7aa', '#d3cdc1', '#b5ae9f'], 120, 7); g.fillStyle = '#ada69a'; g.fillRect(0, 15, w, 1); }, { k: 1, repeat: rep });
const latticeT = (rep = [6, 2]) => { const t = pixelTex(32, 32, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#7d828c'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(1, 1); g.lineTo(w - 1, h - 1); g.moveTo(w - 1, 1); g.lineTo(1, h - 1); g.stroke();
  g.fillStyle = '#8a8f98'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h); g.fillRect(0, h - 3, w, 3);
}, { k: 2, repeat: rep }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const chainT = (rep) => { const t = pixelTex(16, 16, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = '#a7acb3';
  for (let i = 0; i < w; i++) { g.fillRect(i, (i * 1) % h, 1, 1); g.fillRect(i, (h - 1 - i + h) % h, 1, 1); }
}, { k: 1, repeat: rep }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

// ---------------------------------------------------------------- the dish (70 m by default)
export function makeDish({ R = 35, f = 23, axisY = D.dishAxisY, ped = 11, beacon = true } = {}) {
  const g = new THREE.Group(), s = R / 35;
  const conc = lam({ map: concreteT([8, 2]) }), steel = lam({ color: 0xd9dbe0 }), grey = lam({ color: 0x9a9fa8 }), dark = lam({ color: 0x4a4f58 });
  // pedestal: a concrete drum with a door + small windows, a ring of rail on top
  const pH = 12 * s; cyl(g, ped, ped * 1.04, pH, conc, 0, pH / 2, 0, 28);
  box(g, 2.2 * s, 3.2 * s, 0.3, dark, 0, 1.6 * s, ped + 0.05);
  for (let i = 0; i < 6; i++) { const a = i * PI / 3 + 0.3, w = box(g, 1.4 * s, 0.9 * s, 0.25, lam({ color: 0x3a4660, emissive: 0x6a5530 }), Math.sin(a) * (ped + 0.05), pH * 0.68, Math.cos(a) * (ped + 0.05)); w.rotation.y = a; }
  cyl(g, ped + 0.6, ped + 0.6, 0.8 * s, dark, 0, pH + 0.4 * s, 0, 28);
  // azimuth turntable + alidade (two braced towers carrying the elevation bearings)
  const az = new THREE.Group(); az.position.y = pH + 0.8 * s; g.add(az);
  box(az, 30 * s, 2.4 * s, 20 * s, grey, 0, 1.2 * s, 0);
  const tw = 11 * s, tH = axisY - az.position.y;
  for (const sx of [-1, 1]) {
    for (const [dz, lean] of [[-7 * s, 0.25], [7 * s, -0.25]]) { const leg = box(az, 1.6 * s, tH, 1.6 * s, steel, sx * tw, tH / 2, dz * 0.62); leg.rotation.x = lean; }
    box(az, 3.4 * s, 4 * s, 4 * s, grey, sx * tw, tH - 1.2 * s, 0);                          // bearing house
    for (let k = 1; k < 4; k++) box(az, 0.6 * s, 0.6 * s, 11 * s * (1 - k * 0.18), steel, sx * tw, (tH * k) / 4, 0);   // braces
    const lt = lam({ map: latticeT([2, 6]), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(8 * s, tH), lt); face.position.set(sx * tw, tH / 2, 0); face.rotation.y = PI / 2; az.add(face);
  }
  box(az, 2 * tw + 2 * s, 1.4 * s, 1.4 * s, steel, 0, 3.4 * s, 6 * s); box(az, 2 * tw + 2 * s, 1.4 * s, 1.4 * s, steel, 0, 3.4 * s, -6 * s);
  box(az, 6 * s, 5 * s, 6 * s, lam({ color: 0xf0eee8 }), 0, 4.8 * s, -10 * s);               // equipment room on the turntable
  // elevation group: boresight = local +z (el rotates it up toward +y)
  const el = new THREE.Group(); el.position.y = tH; az.add(el);
  const vz = 4 * s;   // the reflector vertex sits 4 m ahead of the elevation axis
  const prof = []; const N = 18; for (let i = 0; i <= N; i++) { const r = 2.6 * s + (R - 2.6 * s) * (i / N); prof.push(new THREE.Vector2(r, (r * r) / (4 * f))); }
  const ref = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), lam({ map: panelT(), side: THREE.DoubleSide, emissive: 0x3a3448 }));
  ref.rotation.x = PI / 2; ref.position.z = vz; ref.castShadow = true; ref.receiveShadow = true; el.add(ref);
  const depth = (R * R) / (4 * f);
  // rim band + the backup truss behind the surface
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.35 * s, 6, 64), grey); rim.position.z = vz + depth; el.add(rim);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.82, 5 * s, depth * 0.95, 24, 1, true), lam({ map: latticeT([24, 2]), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  back.rotation.x = -PI / 2; back.position.z = vz + depth * 0.2; el.add(back);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * PI, r1 = R * 0.95; strut(el, [Math.cos(a) * 4 * s, Math.sin(a) * 4 * s, vz - 3 * s], [Math.cos(a) * r1, Math.sin(a) * r1, vz + (r1 * r1) / (4 * f) - 0.6], 0.28 * s, grey); }
  cyl(el, 5 * s, 6 * s, 8 * s, grey, 0, 0, vz - 3 * s, 16).rotation.x = PI / 2;                // hub
  box(el, 2 * tw - 4 * s, 2.4 * s, 2.4 * s, dark, 0, 0, 0);                                     // elevation axle
  box(el, 16 * s, 8 * s, 6 * s, lam({ color: 0x6b7079 }), 0, -6 * s, -6 * s);                   // counterweight
  // feed cone at the vertex, quadripod to the apex, subreflector facing back down
  cyl(el, 1.2 * s, 1.9 * s, 7 * s, lam({ color: 0xf2f1ec }), 0, 0, vz + 3.5 * s, 16).rotation.x = PI / 2;
  const apex = vz + f * 0.97;
  for (let i = 0; i < 4; i++) { const a = PI / 4 + i * PI / 2, r1 = R * 0.62; strut(el, [Math.cos(a) * r1, Math.sin(a) * r1, vz + (r1 * r1) / (4 * f)], [Math.cos(a) * 2.4 * s, Math.sin(a) * 2.4 * s, apex - 1.5 * s], 0.42 * s, steel); }
  const sub = new THREE.Mesh(new THREE.SphereGeometry(4.2 * s, 24, 8, 0, 2 * PI, 0, 0.55), lam({ color: 0xe6e7ea, side: THREE.DoubleSide })); sub.rotation.x = -PI / 2; sub.position.z = apex + 2.6 * s; el.add(sub);
  box(el, 4 * s, 4 * s, 3 * s, lam({ color: 0xc9ccd2 }), 0, 0, apex);
  let lamp = null;
  if (beacon) { lamp = new THREE.Mesh(new THREE.SphereGeometry(0.55 * s, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30, toneMapped: false })); lamp.position.z = apex + 3.4 * s; el.add(lamp); }
  const out = {
    g, az, el, R, f, s, apex, vz,
    setPoint(azRad, elRad) { az.rotation.y = azRad; el.rotation.x = -elRad; },
    focus: (v = new THREE.Vector3()) => { g.updateMatrixWorld(true); return el.localToWorld(v.set(0, 0, apex)); },
    vertex: (v = new THREE.Vector3()) => { g.updateMatrixWorld(true); return el.localToWorld(v.set(0, 0, vz + depth * 0.4)); },
    boresight: (v = new THREE.Vector3()) => { g.updateMatrixWorld(true); return v.set(0, 0, 1).transformDirection(el.matrixWorld); },
    blink: (t) => { if (lamp) lamp.visible = (t % 1.6) < 0.8; },
  };
  out.setPoint(0, 0.5);
  return out;
}

// ---------------------------------------------------------------- desert dressing
function joshuaTree(seed, { h = 4.2 } = {}) {
  const g = new THREE.Group(); let R = seed * 9301 + 49297; const rnd = () => ((R = (R * 16807) % 2147483647) / 2147483647);
  const bark = lam({ color: 0x7a6650 }), leaf = lam({ color: 0x6f8c4a }), tip = lam({ color: 0x9fb862 });
  const trunk = box(g, 0.45, h * 0.55, 0.45, bark, 0, h * 0.275, 0);
  const n = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) {
    const a = rnd() * 2 * PI, up = 0.35 + rnd() * 0.5, L = h * (0.35 + rnd() * 0.25), y0 = h * (0.45 + rnd() * 0.1);
    const br = new THREE.Group(); br.position.set(0, y0, 0); br.rotation.set(0, a, -(1 - up) * 1.2); g.add(br);
    box(br, 0.32, L, 0.32, bark, 0, L / 2, 0); box(br, 0.9, 0.7, 0.9, leaf, 0, L + 0.25, 0); box(br, 0.5, 0.45, 0.5, tip, 0, L + 0.75, 0);
    for (let k = 0; k < 4; k++) box(br, 0.14, 0.5, 0.14, tip, (k % 2 ? 0.45 : -0.45), L + 0.2, (k < 2 ? 0.45 : -0.45)).rotation.set(k < 2 ? 0.6 : -0.6, 0, k % 2 ? -0.6 : 0.6);
  }
  box(g, 0.8, 0.6, 0.8, leaf, 0, h * 0.55 + 0.25, 0); box(g, 0.45, 0.4, 0.45, tip, 0, h * 0.55 + 0.7, 0);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } }); void trunk;
  return g;
}
function telescope() {
  const g = new THREE.Group(), blk = lam({ color: 0x26282c }), wh = lam({ color: 0xf2f1ec });
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.3, lg = box(g, 0.03, 1.25, 0.03, blk, Math.cos(a) * 0.24, 0.6, Math.sin(a) * 0.24); lg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); }
  box(g, 0.12, 0.1, 0.12, blk, 0, 1.24, 0);
  const tube = cyl(g, 0.085, 0.1, 0.95, wh, 0, 1.4, 0.05, 12); tube.rotation.x = PI / 2 - 0.62;
  const cap = cyl(g, 0.1, 0.1, 0.08, blk, 0, 1.4 + Math.cos(0.62) * 0.48, 0.05 + Math.sin(0.62) * 0.48, 12); cap.rotation.x = PI / 2 - 0.62;
  return g;
}

// ---------------------------------------------------------------- the whole place
export function buildDishStation(studio) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  // ---- ground: desert floor, a gravel overlook, the dirt road to the gate, the station's asphalt
  const desertT = pixelTex(32, 32, (g, w, h) => speckle(g, w, h, '#c9a77a', ['#bf9b6c', '#d4b488', '#b38f62', '#d9bd92', '#a98a64'], 300, 3), { k: 1, repeat: [700, 700] });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), lam({ map: desertT })); ground.rotation.x = -PI / 2; ground.receiveShadow = true; root.add(ground);
  const gravelT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#a99c8c', ['#9b8e7e', '#b8ab9a', '#8c8072', '#c4b8a6'], 90, 5), { k: 1, repeat: [10, 7] });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), lam({ map: gravelT })); pad.rotation.x = -PI / 2; pad.position.set(0, 0.012, -1.5); pad.receiveShadow = true; root.add(pad);
  const dirtT = pixelTex(16, 32, (g, w, h) => { speckle(g, w, h, '#b29473', ['#a88a6a', '#bc9e7c', '#9c7f60'], 80, 4); g.fillStyle = '#9a7c5c'; g.fillRect(3, 0, 2, h); g.fillRect(11, 0, 2, h); }, { k: 1, repeat: [1, 60] });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 600), lam({ map: dirtT })); road.rotation.x = -PI / 2; road.position.set(8.5, 0.01, -60); road.receiveShadow = true; root.add(road);
  const asphT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#55575d', ['#4d4f55', '#5d5f65'], 50, 2), { k: 1, repeat: [20, 20] });
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), lam({ map: asphT })); lot.rotation.x = -PI / 2; lot.position.set(30, 0.015, -86); lot.receiveShadow = true; root.add(lot);
  for (let i = 0; i < 8; i++) box(root, 0.15, 0.02, 5, lam({ color: 0xf2f1ec }), 14 + i * 3.2, 0.03, -100, false);
  // ---- the station
  const dish = makeDish(); dish.g.position.set(D.dish[0], 0, D.dish[1]); root.add(dish.g);
  const small = D.small.map(([x, z], i) => { const d = makeDish({ R: 17, f: 11.5, axisY: 21, ped: 6, beacon: false }); d.g.position.set(x, 0, z); d.setPoint(i ? 0.5 : -0.35, i ? 0.62 : 0.8); root.add(d.g); return d; });
  // control building + sign + roof gear
  const wallT = pixelTex(32, 16, (g, w, h) => { speckle(g, w, h, '#efece4', ['#e6e2d8', '#f6f4ee'], 60, 9); g.fillStyle = '#d8d3c6'; g.fillRect(0, 0, w, 1); }, { k: 1, repeat: [6, 2] });
  const bld = new THREE.Group(); bld.position.set(D.building[0], 0, D.building[1]); root.add(bld);
  box(bld, 34, 7, 14, lam({ map: wallT }), 0, 3.5, 0); box(bld, 35, 0.6, 15, lam({ color: 0xa9a59c }), 0, 7.3, 0);
  const winM = lam({ color: 0xffd896, emissive: 0xc89a50, emissiveIntensity: 0.9 });
  for (let i = 0; i < 9; i++) box(bld, 2.2, 1.4, 0.12, winM, -14 + i * 3.5, 4.4, 7.02, false);
  box(bld, 2.4, 2.8, 0.15, lam({ color: 0x3a4660 }), 13.5, 1.4, 7.05, false);
  for (const [x, z] of [[-10, -2], [-4, 3], [6, -3]]) box(bld, 2.4, 1.4, 2.4, lam({ color: 0xb9bcc4 }), x, 8.3, z);
  { const m = cyl(bld, 0.08, 0.08, 6, lam({ color: 0x8a8f98 }), 12, 10.6, 0, 6); void m; const mini = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 6, 0, 2 * PI, 0, 0.9), lam({ color: 0xf2f1ec, side: THREE.DoubleSide })); mini.position.set(-14, 9.4, 2); mini.rotation.x = -0.9; root.add(mini); mini.position.add(bld.position); }
  const bsign = voxSign(textCanvas(['DEEP SPACE STATION', 'TRACKING · RECEIVING'], { w: 256, h: 64, bg: '#26324a', fg: '#f3f1ec', font: 'bold 20px monospace', border: '#f2c230' }), { w: 9, h: 2.2, post: 0.6, color: 0x26324a });
  bsign.position.set(-6, 7.2, 7.2); bld.add(bsign);
  // parked cars by the building + a white pickup
  [[0xf3f1ec, 16, -96], [0x3c6fd8, 19.2, -96], [0x2fa05a, 25.6, -96], [0x9aa0a8, 35, -96], [0xd8413a, 44.6, -96]].forEach(([c, x, z], i) => { const o = voxCar(c, { seed: i + 11 }); o.position.set(x, 0, z); o.rotation.y = 0; root.add(o); });
  // ---- chain-link fence (−z of the overlook) with a gate on the road, signs
  const postM = lam({ color: 0x8a8f98 }), chainM = lam({ map: chainT([20, 1]), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const fenceRun = (x0, x1, z) => { const L = x1 - x0, f = new THREE.Mesh(new THREE.PlaneGeometry(L, 2.2), chainM.clone()); f.material.map = chainT([L / 1.2, 1.4]); f.position.set((x0 + x1) / 2, 1.1, z); root.add(f);
    for (let x = x0; x <= x1 + 0.01; x += 3) { box(root, 0.08, 2.5, 0.08, postM, x, 1.25, z); }
    box(root, L, 0.05, 0.05, postM, (x0 + x1) / 2, 2.2, z, false); for (const dy of [2.38, 2.52]) box(root, L, 0.02, 0.02, lam({ color: 0x55585e }), (x0 + x1) / 2, dy, z - 0.08, false); };
  fenceRun(-60, 5, D.fence); fenceRun(12, 70, D.fence);
  for (const x of [5.2, 11.8]) box(root, 0.18, 2.8, 0.18, postM, x, 1.4, D.fence);
  { const gate = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.0), chainM.clone()); gate.material.map = chainT([3, 1.3]); gate.position.set(7, 1.05, D.fence - 1.4); gate.rotation.y = 0.9; root.add(gate); }
  const s1 = voxSign(textCanvas(['AUTHORIZED', 'PERSONNEL ONLY'], { w: 192, h: 64, bg: '#f3f1ec', fg: '#b3261e', font: 'bold 20px monospace', border: '#b3261e' }), { w: 1.6, h: 0.55, post: 0.95, color: 0x8a8f98 });
  s1.position.set(13.6, 0, D.fence + 0.15); root.add(s1);
  const s2 = voxSign(textCanvas(['VISITOR OVERLOOK', 'PLEASE STAY ON GRAVEL'], { w: 256, h: 64, bg: '#6b4a2c', fg: '#f3e6c8', font: 'bold 18px monospace', border: '#f3e6c8' }), { w: 2.6, h: 0.7, post: 1.1, color: 0x6b4a2c });
  s2.position.set(-4.9, 0, -3.4); s2.rotation.y = 0.35; root.add(s2);
  // ---- the overlook: low rock border, her camp table with the tablet, chair, cooler, telescope, her car
  const rockM = lam({ color: 0x9c8670 }), rockD = lam({ color: 0x86705c });
  for (let i = 0; i < 26; i++) { const a = i / 26, x = -8 + a * 16, z = -6.9 + Math.sin(i * 1.7) * 0.15; box(root, 0.5 + (i % 3) * 0.12, 0.3 + (i % 2) * 0.1, 0.45, i % 2 ? rockM : rockD, x, 0.15, z).rotation.y = i * 0.7; }
  const table = new THREE.Group(); table.position.set(D.table[0], 0, D.table[1]); table.rotation.y = -0.18; root.add(table);
  const alu = lam({ color: 0xb9bcc4 });
  box(table, 0.92, 0.04, 0.58, lam({ map: pixelTex(16, 8, (g, w, h) => { speckle(g, w, h, '#d8d6cf', ['#cfcdc5', '#e0ded8'], 20, 3); for (let x = 0; x < w; x += 4) { g.fillStyle = '#c4c2ba'; g.fillRect(x, 0, 1, h); } }, { k: 1 }) }), 0, 0.72, 0);
  for (const sx of [-0.4, 0.4]) for (const sz of [-0.24, 0.24]) box(table, 0.03, 0.72, 0.03, alu, sx, 0.36, sz);
  // the tablet (portrait) on a little stand; the video adds its screen mesh (S.tablet faces +z)
  const tablet = new THREE.Group(); tablet.position.set(0.12, 0.885, 0.06); tablet.rotation.x = -0.22; table.add(tablet);
  box(tablet, 0.176, 0.236, 0.008, lam({ color: 0x241a2c }), 0, 0, -0.0045);
  { const st = box(table, 0.12, 0.02, 0.1, lam({ color: 0x3a3d44 }), 0.12, 0.745, 0.02); void st; const arm = box(table, 0.03, 0.15, 0.015, lam({ color: 0x3a3d44 }), 0.12, 0.81, -0.03); arm.rotation.x = -0.22; }
  // a lantern (emissive only: no light behind her), a thermos, a mug, a star chart, a red flashlight
  { const ln = new THREE.Group(); ln.position.set(-0.32, 0.74, -0.12); table.add(ln); cyl(ln, 0.06, 0.07, 0.03, lam({ color: 0x2b2f36 }), 0, 0.015, 0, 10); cyl(ln, 0.05, 0.05, 0.13, lam({ color: 0xffe2a0, emissive: 0xffb04a, emissiveIntensity: 1.1 }), 0, 0.1, 0, 10); cyl(ln, 0.035, 0.06, 0.04, lam({ color: 0x2b2f36 }), 0, 0.185, 0, 10); }
  cyl(table, 0.035, 0.035, 0.24, lam({ color: 0x5a2a6a }), -0.16, 0.86, 0.12, 10); cyl(table, 0.04, 0.035, 0.09, lam({ color: 0xf2f1ec }), -0.38, 0.785, 0.16, 10);
  { const chart = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), lam({ map: pixelTex(32, 24, (g, w, h) => { g.fillStyle = '#1d2240'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = i % 5 ? '#c8d0ff' : '#ffe08a'; g.fillRect((i * 13) % w, (i * 7) % h, 1, 1); } g.strokeStyle = '#6a74b8'; g.beginPath(); g.arc(16, 12, 10, 0, 2 * PI); g.stroke(); }, { k: 2 }) }));
    chart.rotation.x = -PI / 2; chart.rotation.z = 0.3; chart.position.set(-0.12, 0.742, -0.14); table.add(chart); }
  const chair = new THREE.Group(); chair.position.set(2.35, 0, -0.9); chair.rotation.y = -0.7; root.add(chair);
  box(chair, 0.6, 0.06, 0.5, lam({ color: 0x5a2a6a }), 0, 0.42, 0); { const bk = box(chair, 0.6, 0.6, 0.06, lam({ color: 0x5a2a6a }), 0, 0.72, -0.26); bk.rotation.x = -0.2; }
  for (const sx of [-0.28, 0.28]) for (const sz of [-0.22, 0.22]) box(chair, 0.04, 0.42, 0.04, alu, sx, 0.21, sz);
  box(root, 0.7, 0.42, 0.42, lam({ color: 0x26282c }), 2.9, 0.21, -2.2); box(root, 0.72, 0.08, 0.44, lam({ color: 0xf3f1ec }), 2.9, 0.46, -2.2);
  const scope = telescope(); scope.position.set(D.scope[0], 0, D.scope[1]); scope.rotation.y = PI + 0.4; root.add(scope);
  const car = voxCar(0x2a1f36, { seed: 77 }); car.position.set(D.car[0], 0, D.car[1]); car.rotation.y = 0.5; root.add(car);
  // ---- desert plants + rocks (kept off the lens line toward the dish), utility poles along the road
  let rs = 17; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
  const trees = [];
  const TREES = [[-9.5, -9], [7, -10.5], [-14, -4], [12.5, -3.5], [-20, -22], [22, -26], [-35, -40], [40, -42], [-58, -30], [58, -12], [-70, -70], [85, -60], [-18, 8], [16, 10], [-30, 14], [34, 6], [-90, -130], [110, -120], [-150, -60], [140, -30]];
  TREES.forEach(([x, z], i) => { const t = joshuaTree(i + 3, { h: 3.4 + (i % 4) * 0.7 }); t.position.set(x, 0, z); t.rotation.y = i * 1.3; root.add(t); trees.push(t); });
  const bushG = new THREE.BoxGeometry(1, 1, 1), bushM = lam({ color: 0x5f7a44 }), bush2 = lam({ color: 0x7a8f4e });
  const bushes = [new THREE.InstancedMesh(bushG, bushM, 260), new THREE.InstancedMesh(bushG, bush2, 260)], rocks = new THREE.InstancedMesh(bushG, rockD, 160);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  let nb = [0, 0], nr = 0;
  for (let i = 0; i < 900 && (nb[0] < 260 || nb[1] < 260 || nr < 160); i++) {
    const x = -260 + rnd() * 520, z = -300 + rnd() * 330;
    if (Math.abs(x) < 9 && z > -8 && z < 6) continue;                  // the overlook
    if (Math.abs(x - 8.5) < 4) continue;                               // the road
    if (Math.hypot(x - D.dish[0], z - D.dish[1]) < 26) continue;
    if (x > -20 && x < 90 && z < -40 && z > -110) continue;            // building + lot
    if (Math.abs(x) < 26 && z > D.fence - 4 && z < -8) continue;       // keep the view past her clear
    const r = rnd();
    if (r < 0.75) { const k = r < 0.4 ? 0 : 1; if (nb[k] >= 260) continue; const s = 0.5 + rnd() * 0.9; q.setFromAxisAngle(Y, rnd() * PI); m4.compose(ps.set(x, s * 0.35, z), q, sc.set(s * 1.3, s * 0.7, s * 1.2)); bushes[k].setMatrixAt(nb[k]++, m4); }
    else { if (nr >= 160) continue; const s = 0.4 + rnd() * 1.6; q.setFromAxisAngle(Y, rnd() * PI); m4.compose(ps.set(x, s * 0.25, z), q, sc.set(s * 1.4, s * 0.6, s)); rocks.setMatrixAt(nr++, m4); }
  }
  bushes[0].count = nb[0]; bushes[1].count = nb[1]; rocks.count = nr;
  [...bushes, rocks].forEach((im) => { im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im); });
  const poleM = lam({ color: 0x6b5a48 });
  for (let i = 0; i < 9; i++) { const z = 30 - i * 30; box(root, 0.28, 10, 0.28, poleM, 12.2, 5, z); box(root, 2.4, 0.18, 0.18, poleM, 12.2, 9.4, z); if (i) for (const dx of [-1.0, 1.0]) box(root, 0.03, 0.03, 30, lam({ color: 0x2b2f36 }), 12.2 + dx, 9.5, z + 15, false); }
  // ---- mountains: a ring of blocky ridges, nearer ones browner, far ones lavender (the fog finishes them)
  const mtn = [lam({ color: 0x8a6f62 }), lam({ color: 0x7d6a74 }), lam({ color: 0x6f6582 })];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * 2 * PI + 0.07 * Math.sin(i * 3), d = 700 + ((i * 197) % 600), h = 90 + ((i * 131) % 160), w = 260 + ((i * 89) % 200);
    const m = new THREE.Mesh(new THREE.ConeGeometry(w * 0.5, h, 5), mtn[i % 3]); m.position.set(Math.sin(a) * d, h / 2 - 4, -Math.cos(a) * d); m.rotation.y = i; m.scale.z = 0.55; root.add(m);
  }
  // ---- sky dome (follows the camera): dusk, the sun just set behind the lens (+z), the Belt of Venus + earth shadow over −z, stars
  const SUN = new THREE.Vector3(0.28, 0.12, 0.95).normalize();
  const skc = document.createElement('canvas'); skc.width = 512; skc.height = 256; const sg = skc.getContext('2d');
  const phiSun = Math.atan2(SUN.z, -SUN.x);
  const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  for (let x = 0; x < 512; x++) {
    const phi = (x / 512) * 2 * PI; let d = Math.abs(phi - phiSun); d = Math.min(d, 2 * PI - d); const warm = Math.max(0, 1 - d / 1.7) ** 1.4;
    const gr = sg.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, mix('#141a3e', '#1e2552', warm)); gr.addColorStop(0.25, mix('#2c3470', '#46407e', warm)); gr.addColorStop(0.4, mix('#5a5694', '#a8709a', warm));
    gr.addColorStop(0.455, mix('#c88aa8', '#ff9a62', warm)); gr.addColorStop(0.48, mix('#7a7aa8', '#ffc078', warm)); gr.addColorStop(0.5, mix('#8a86a6', '#f0b080', warm)); gr.addColorStop(1, '#6a5a58');
    sg.fillStyle = gr; sg.fillRect(x, 0, 1, 256);
  }
  const skyT = new THREE.CanvasTexture(skc); skyT.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -3; sky.frustumCulled = false; sky.onBeforeRender = (r, s, cam) => sky.position.copy(root.worldToLocal(cam.position.clone())); root.add(sky);
  // stars: points on a shell, denser + brighter high up and away from the sunset (pixel pass needs ≥ 4 px points)
  const NS = 900, sp = new Float32Array(NS * 3), scol = new Float32Array(NS * 3);
  let n = 0;
  for (let i = 0; i < 4000 && n < NS; i++) {
    const u = rnd(), v = rnd(), th = 2 * PI * u, y = 0.06 + 0.94 * v, r = Math.sqrt(1 - y * y), dir = new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th));
    const awaySun = 1 - Math.max(0, dir.dot(SUN)); if (rnd() > (y * 0.85 + 0.15) * awaySun) continue;
    sp.set([dir.x * 1350, dir.y * 1350, dir.z * 1350], n * 3); const b = 0.55 + 0.45 * rnd(), warmS = rnd() < 0.2; scol.set(warmS ? [b, b * 0.88, b * 0.7] : [b * 0.9, b * 0.94, b], n * 3); n++;
  }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp.slice(0, n * 3), 3)); sgeo.setAttribute('color', new THREE.BufferAttribute(scol.slice(0, n * 3), 3));
  const stars = new THREE.Points(sgeo, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, fog: false, toneMapped: false }));
  stars.renderOrder = -2; stars.frustumCulled = false; stars.onBeforeRender = (r, s, cam) => stars.position.copy(root.worldToLocal(cam.position.clone())); root.add(stars);
  // ---- radio rings falling into the big dish (the faint signal arriving): set per frame with waves(t, k)
  const ringM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9fe8ff).multiplyScalar(1.6), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const rings = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), ringM.clone()); m.visible = false; root.add(m); return m; });
  const fP = new THREE.Vector3(), bS = new THREE.Vector3();
  function waves(t, k = 1) {
    dish.focus(fP); dish.boresight(bS);
    rings.forEach((m, i) => { const s = ((t * 0.32 + i / rings.length) % 1); m.visible = k > 0.01; if (!m.visible) return;
      const dist = 4 + (1 - s) * 46; m.position.copy(root.worldToLocal(fP.clone().addScaledVector(bS, dist))); m.lookAt(root.localToWorld(fP.clone()));
      m.scale.setScalar(3 + (1 - s) * 30); m.material.opacity = k * 0.9 * Math.sin(PI * s) * (0.45 + 0.55 * s); });
  }
  // ---- light: a low warm sun from behind the lens (+z), lavender sky fill, warm desert bounce
  const hemi = new THREE.HemisphereLight(0x9aa2dc, 0xc89a78, 1.05); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb98a, 1.9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; root.add(sun, sun.target);
  function aim(cx, cz, half = 20, y = 0) { sun.target.position.set(cx, y, cz); sun.position.copy(sun.target.position).addScaledVector(SUN, 500); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 1200 }); sun.shadow.camera.updateProjectionMatrix(); }
  aim(0, -2, 14);
  const fog = new THREE.Fog(0xb49ab4, 380, 2600);
  dish.setPoint(0.12, 0.42);
  function update(t) { dish.blink(t); }
  return { root, D, dish, small, sky, stars, sun, hemi, fog, aim, update, waves, tablet, table, chair, scope, car, trees, SUN };
}
