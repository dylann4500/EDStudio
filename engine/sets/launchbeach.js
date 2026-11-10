// Launch beach (077 Vex rocket-catch explainer): a pixel-look rocket launch site seen from a public viewing beach at sunset.
// Built from boxes + crisp pixel textures (engine/pixeltex.js) so it reads under engine/pixel.js like voxbeach.js, but a NEW place:
// sand + dunes + beach grass where she stands, the Gulf on +x with a foam line, a rope fence + LAUNCH VIEWING sign, spectators
// filming with phones, camp chairs, coolers, a tent, an RV + parked cars on the road, gulls; behind her (−z) the pad: a 146 m
// catch tower with two "chopstick" arms (makeCatchTower), the launch mount, a tank farm, an older tower, a big assembly bay,
// floodlight masts, all under a dusk sky dome that follows the camera (pink anti-sun band behind the tower, the sun behind the lens).
//   const L = buildLaunchBeach(studio);  L.root · L.D (positions) · L.tower {g, setArms(open 0..1), setArmY(y), armY}
//   makeBooster() → {g, height 72, pinY 63, engines} (origin = engine plane, +y up; pins on ±z) · makeShip() → {g, height 52, pinY 34,
//   cgY 20} (belly = local +x, so rotation.z = −π/2 is a belly-flop with the nose toward +x) · makePlume() → {g, set(k, L, r)}
//   makePuffs(parent, n) → {set(i, pos, size, a), hide()} soft sprites for steam/smoke · L.aim(cx, cz, half) moves the sun's shadows.
// Coordinates: Vex stands at the origin facing +z (camera side); the tower stands at D.tower; the catch point is D.catch (arms reach
// toward +x from the tower, so from the beach the caught rocket sits RIGHT of the tower). Set camera.far ≥ 2600.
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';
import { makeVoxPerson, randomOutfit, voxCar, voxSign, textCanvas } from '../voxel/index.js';

const PI = Math.PI;
export const D = { tower: [-62, -250], catch: [-40, -250], mountY: 22, towerH: 146, armLen: 30, armZ: 5.6, sea: 36, tripod: [-1.35, -0.6] };

const lam = (o) => new THREE.MeshLambertMaterial(o);
const box = (parent, w, h, d, m, x, y, z, shadow = true) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = shadow; b.receiveShadow = true; parent.add(b); return b; };
const cyl = (parent, rt, rb, h, m, x, y, z, seg = 16, open = false) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; parent.add(c); return c; };
function softTex(stops, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach(([k, col]) => r.addColorStop(k, col));
  g.fillStyle = r; g.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let SMOKE = null, FIRE = null;
const smokeT = () => (SMOKE ??= softTex([[0, 'rgba(255,255,255,0.95)'], [0.5, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]));
const fireT = () => (FIRE ??= softTex([[0, 'rgba(255,255,235,1)'], [0.25, 'rgba(255,214,130,0.95)'], [0.6, 'rgba(255,120,40,0.5)'], [1, 'rgba(140,40,0,0)']]));

/** soft camera-facing puffs (steam, smoke, plasma): set(i, pos, size, alpha, color?) per frame, hide() first */
export function makePuffs(parent, n, { fire = false } = {}) {
  const items = Array.from({ length: n }, () => {
    const m = new THREE.SpriteMaterial({ map: fire ? fireT() : smokeT(), transparent: true, depthWrite: false, toneMapped: !fire, blending: fire ? THREE.AdditiveBlending : THREE.NormalBlending });
    const s = new THREE.Sprite(m); s.visible = false; parent.add(s); return s;
  });
  return { items, hide: () => items.forEach((s) => (s.visible = false)),
    set(i, p, size, a, color) { const s = items[i]; if (!s) return; s.visible = a > 0.01; s.position.copy(p); s.scale.setScalar(size); s.material.opacity = a; if (color) s.material.color.copy(color); } };
}

// ---------------------------------------------------------------- textures
const steelT = () => pixelTex(64, 128, (g, w, h) => {
  speckle(g, w, h, '#c4c8cf', ['#b8bcc4', '#ccd0d6', '#d6d9de'], 260, 11);
  for (let x = 0; x < w; x += 8) { g.fillStyle = '#a9adb5'; g.fillRect(x, 0, 1, h); }
  for (let y = 0; y < h; y += 12) { g.fillStyle = '#9da1aa'; g.fillRect(0, y, w, 1); g.fillStyle = '#dfe2e6'; g.fillRect(0, y + 1, w, 1); }
}, { k: 1 });
const sootSteelT = () => pixelTex(64, 128, (g, w, h) => {   // a flown booster: soot streaks rising from the engines
  speckle(g, w, h, '#c4c8cf', ['#b8bcc4', '#ccd0d6', '#d6d9de'], 260, 13);
  for (let x = 0; x < w; x += 8) { g.fillStyle = '#a9adb5'; g.fillRect(x, 0, 1, h); }
  for (let y = 0; y < h; y += 12) { g.fillStyle = '#9da1aa'; g.fillRect(0, y, w, 1); }
  for (let i = 0; i < 26; i++) { const x = (i * 23) % w, L = 10 + ((i * 37) % 30); g.fillStyle = i % 3 ? 'rgba(70,60,56,.55)' : 'rgba(40,34,32,.7)'; g.fillRect(x, h - L, 2 + (i % 3), L); }
  g.fillStyle = 'rgba(40,34,30,.8)'; g.fillRect(0, h - 6, w, 6);
}, { k: 1 });
const shipT = () => pixelTex(128, 128, (g, w, h) => {   // u 0…0.5 = the +x half = black hex tiles (the belly); the rest steel
  speckle(g, w, h, '#c6cad0', ['#bcc0c7', '#d0d3d8'], 300, 17);
  for (let x = 0; x < w; x += 8) { g.fillStyle = '#aaaeb6'; g.fillRect(x, 0, 1, h); }
  for (let y = 0; y < h; y += 12) { g.fillStyle = '#9fa3ab'; g.fillRect(0, y, w, 1); }
  g.fillStyle = '#17181c'; g.fillRect(0, 0, w / 2, h);
  for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w / 2; x += 4) { g.fillStyle = (x * 7 + y * 3) % 11 ? '#23252b' : '#2e3038'; g.fillRect(x, y, 3, 3); }
  for (let i = 0; i < 9; i++) { g.fillStyle = '#e6e8ea'; g.fillRect((i * 13) % (w / 2), (i * 29) % h, 3, 3); }   // a few white replacement tiles
}, { k: 1 });
const latticeT = () => { const t = pixelTex(32, 32, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#4a4f58'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(1, 1); g.lineTo(w - 1, h - 1); g.moveTo(w - 1, 1); g.lineTo(1, h - 1); g.stroke();
  g.fillStyle = '#565c66'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
}, { k: 2 }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

// ---------------------------------------------------------------- the catch tower ("chopsticks")
export function makeCatchTower({ h = D.towerH, arms = true } = {}) {
  const g = new THREE.Group(), S = 12, lt = latticeT(), legM = lam({ color: 0x3e434b });
  lt.repeat.set(2, Math.round(h / 6));
  const faceM = lam({ map: lt, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, 1.4, h, 1.4, legM, (x * S) / 2, h / 2, (z * S) / 2);
  for (const [rx, ry, x, z] of [[0, 0, 0, S / 2], [0, PI, 0, -S / 2], [0, PI / 2, S / 2, 0], [0, -PI / 2, -S / 2, 0]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(S, h), faceM); f.position.set(x, h / 2, z); f.rotation.set(rx, ry, 0); f.castShadow = true; g.add(f); }
  box(g, S + 2, 1.2, S + 2, legM, 0, h, 0); box(g, 0.5, 22, 0.5, legM, 0, h + 11, 0);   // roof + lightning mast
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30, toneMapped: false })); red.position.set(0, h + 22.4, 0); g.add(red);
  box(g, 2, 8, 2, lam({ color: 0xd8d4c8 }), -S / 2 - 1, 8, 0);                          // elevator housing at the foot
  const out = { g, h, setArms: () => {}, setArmY: () => {}, armY: 90 };
  if (!arms) return out;
  // carriage + two arms on hinges at the +x face; open = 1 swings them outward (±z), closed = 0 = parallel, hugging a 9 m body
  const car = new THREE.Group(); g.add(car);
  const armM = lam({ color: 0x8a9099 }), darkM = lam({ color: 0x2b2f36 }), padM = lam({ color: 0xf2c230 });
  box(car, S + 3, 7, S + 3, darkM, 0, 0, 0);
  const at = latticeT(); at.repeat.set(6, 1);
  const armFace = lam({ map: at, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivs = [-1, 1].map((s) => {
    const piv = new THREE.Group(); piv.position.set(S / 2 + 0.5, 0, s * D.armZ); car.add(piv);
    const a = new THREE.Group(); piv.add(a);
    box(a, D.armLen, 0.7, 2.0, armM, D.armLen / 2, 1.5, 0); box(a, D.armLen, 0.7, 2.0, armM, D.armLen / 2, -1.5, 0);   // top + bottom chords
    for (const zz of [-0.95, 0.95]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(D.armLen, 3.2), armFace); f.position.set(D.armLen / 2, 0, zz); a.add(f); }
    box(a, 14, 0.5, 1.3, padM, 16, 2.0, -s * 0.5);   // the yellow rail the pins land on
    box(a, 0.8, 4, 2.2, darkM, D.armLen, 0, 0);
    return { piv, s };
  });
  let armY = 90;
  out.setArms = (open) => pivs.forEach(({ piv, s }) => (piv.rotation.y = -s * open * 0.5));
  out.setArmY = (y) => { armY = y; car.position.y = y; out.armY = y; };
  out.setArmY(90); out.setArms(1);
  return out;
}

// ---------------------------------------------------------------- the booster (72 m, 33 engines, 3 grid fins) and the ship (52 m)
export function makeBooster({ soot = false } = {}) {
  const g = new THREE.Group(), H = 72, R = 4.5;
  const body = cyl(g, R, R, H - 3, lam({ map: soot ? sootSteelT() : steelT() }), 0, (H - 3) / 2 + 1.5, 0, 32, false);
  body.material.map.repeat.set(3, 2);
  const dark = lam({ color: 0x2c3036 });
  cyl(g, R + 0.05, R + 0.05, 2.6, dark, 0, H - 1.5, 0, 32);                         // hot-staging ring
  cyl(g, R * 0.98, R + 0.1, 1.6, dark, 0, 0.8, 0, 32);                               // engine skirt
  const finM = lam({ map: pixelTex(16, 16, (q, w, h) => { q.fillStyle = '#3a3e45'; q.fillRect(0, 0, w, h); q.fillStyle = '#16181c'; for (let y = 2; y < h; y += 4) for (let x = 2; x < w; x += 4) q.fillRect(x, y, 2, 2); }, { k: 1 }) });
  for (let i = 0; i < 3; i++) { const a = PI / 2 + i * (2 * PI / 3) + PI / 3; const f = box(g, 0.5, 6.5, 6, finM, Math.cos(a) * (R + 3.2), H - 7, Math.sin(a) * (R + 3.2)); f.rotation.y = -a; }
  for (const s of [-1, 1]) box(g, 1.4, 1.0, 1.6, dark, 0, 63, s * (R + 0.6));       // catch pins (±z: they ride the arms)
  // 33 engines: 3 centre, 10 inner ring, 20 outer ring (bells open downward)
  const bell = new THREE.CylinderGeometry(0.42, 0.62, 1.4, 12, 1, true), bellM = new THREE.MeshLambertMaterial({ color: 0x5a5e66, side: THREE.DoubleSide });
  const eng = new THREE.InstancedMesh(bell, bellM, 33), m4 = new THREE.Matrix4(); let k = 0;
  for (const [n, r] of [[3, 0.85], [10, 2.15], [20, 3.65]]) for (let i = 0; i < n; i++) { const a = (i / n) * 2 * PI + (n === 10 ? 0.3 : 0); m4.makeTranslation(Math.cos(a) * r, -0.6, Math.sin(a) * r); eng.setMatrixAt(k++, m4); }
  g.add(eng);
  const hot = new THREE.Mesh(new THREE.CircleGeometry(R * 0.95, 32), new THREE.MeshBasicMaterial({ color: 0x0c0d10 })); hot.rotation.x = PI / 2; hot.position.y = 0.05; g.add(hot);
  return { g, height: H, pinY: 63, R };
}
export function makeShip() {
  const g = new THREE.Group(), R = 4.5, tex = shipT();
  const m = lam({ map: tex });
  cyl(g, R, R, 40, m, 0, 20, 0, 40, false).material.map.repeat.set(1, 3);
  const prof = []; for (let i = 0; i <= 14; i++) { const v = i / 14; prof.push(new THREE.Vector2(Math.max(0.05, R * Math.cos(v * PI / 2) ** 0.7), v * 12)); }
  const nose = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), lam({ map: shipT() })); nose.position.y = 40; nose.castShadow = true; g.add(nose);
  const flapM = lam({ color: 0x1c1d22 });
  const flaps = [];
  for (const s of [-1, 1]) {   // flaps on ±z (hinged at the body), forward pair nudged leeward (−x) like V3
    const af = new THREE.Group(); af.position.set(-0.6, 2.5, s * R); g.add(af); box(af, 0.5, 10, 4.6, flapM, 0, 5, s * 2.2); flaps.push(af);
    const ff = new THREE.Group(); ff.position.set(-1.6, 40, s * (R - 0.5)); g.add(ff); box(ff, 0.4, 6.5, 3.2, flapM, 0, 3, s * 1.6); flaps.push(ff);
    box(g, 1.2, 0.9, 1.4, lam({ color: 0x2c3036 }), 0, 34, s * (R + 0.55));            // catch pins
  }
  cyl(g, R * 0.97, R, 1.2, lam({ color: 0x2c3036 }), 0, 0.6, 0, 32);
  const bellM = new THREE.MeshLambertMaterial({ color: 0x5a5e66, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) { const big = i >= 3, a = (i % 3) * (2 * PI / 3) + (big ? PI / 3 : 0), r = big ? 2.9 : 1.1; cyl(g, big ? 0.7 : 0.42, big ? 1.25 : 0.62, big ? 2.4 : 1.4, bellM, Math.cos(a) * r, big ? -1.2 : -0.7, Math.sin(a) * r, 12, true); }
  return { g, height: 52, pinY: 34, cgY: 20, R, flaps };
}
/** engine plume pointing down from the group's origin: set(k 0..1, length m, radius m) */
export function makePlume() {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff9a40).multiplyScalar(2.2), transparent: true, opacity: 0.75, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  outer.position.y = -0.5; g.add(outer);
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2c8).multiplyScalar(3), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  core.position.y = -0.5; g.add(core);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireT(), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); g.add(glow);
  const light = new THREE.PointLight(0xffa860, 0, 300, 1.4); light.position.y = -4; g.add(light);
  function set(k, L = 30, r = 3.4, t = 0) {
    g.visible = k > 0.01; if (!g.visible) { light.intensity = 0; return; }
    const fl = 1 + 0.06 * Math.sin(t * 47) + 0.04 * Math.sin(t * 83);
    g.scale.set(r * k, L * k * fl, r * k); glow.position.y = -0.12; glow.scale.setScalar(2.6); light.intensity = 900 * k;
  }
  set(0);
  return { g, set };
}

// ---------------------------------------------------------------- the whole place
export function buildLaunchBeach(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  // ---- ground: beach sand near, scrub flats toward the pad, the Gulf on +x
  const sand = pixelTex(32, 32, (g, w, h) => speckle(g, w, h, '#e3c98f', ['#d7bc80', '#ecd7a2', '#cfb173', '#f0dcaa'], 240, 3), { k: 1, repeat: [160, 160] });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(640, 640), lam({ map: sand })); ground.rotation.x = -PI / 2; ground.position.set(-150, 0, -150); ground.receiveShadow = true; root.add(ground);
  const scrub = pixelTex(32, 32, (g, w, h) => speckle(g, w, h, '#b7a777', ['#a49a68', '#8e9460', '#c2b282', '#9aa06a'], 260, 5), { k: 1, repeat: [300, 300] });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), lam({ map: scrub })); far.rotation.x = -PI / 2; far.position.set(-1500 + D.sea, -0.02, -1460); far.receiveShadow = true; root.add(far);
  const seaT = pixelTex(32, 32, (g, w, h) => { speckle(g, w, h, '#3b7fb8', ['#4a90c8', '#336fa6', '#5aa2d6', '#6c8fc0'], 200, 9); for (let i = 0; i < 7; i++) { g.fillStyle = '#e8f4ff'; g.fillRect((i * 11) % w, (i * 7) % h, 5, 1); } }, { k: 1, repeat: [120, 240] });
  seaT.wrapS = seaT.wrapT = THREE.RepeatWrapping;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 2400), lam({ map: seaT, color: 0xd8c8e8 })); sea.rotation.x = -PI / 2; sea.position.set(D.sea + 600, 0.03, -400); root.add(sea);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(6, 2400), lam({ color: 0xbfa478 })); wet.rotation.x = -PI / 2; wet.position.set(D.sea - 3, 0.015, -400); root.add(wet);
  const foamM = lam({ color: 0xf6f2ff, emissive: 0x332a33 }), foams = [];
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2400), foamM); f.rotation.x = -PI / 2; f.position.set(D.sea + 1 + i * 5, 0.05, -400); root.add(f); foams.push(f); }
  // dunes + grass
  const sandM = lam({ map: pixelTex(32, 32, (g, w, h) => speckle(g, w, h, '#dcc186', ['#d0b377', '#e8d29c', '#c9ab6e'], 220, 4), { k: 1, repeat: [4, 2] }) });
  const grassT = pixelTex(16, 16, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#6f8f4c' : '#8fae5a'; const x = 1 + i * 1.7; g.fillRect(x, 4 + (i * 5) % 7, 1, 12 - (i * 5) % 7); } }, { k: 1 });
  const grassM = lam({ map: grassT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const DUNES = [[-9, -4, 6, 4, 0.9], [-14, -10, 8, 5, 1.4], [12, -9, 7, 4, 1.0], [17, -2, 5, 6, 0.7], [-20, 3, 6, 6, 1.1], [-30, -18, 12, 8, 2.0], [26, -20, 8, 10, 1.2], [-8, 9, 4, 3, 0.5], [10, 7, 5, 3, 0.45]];
  for (const [x, z, w, d, h] of DUNES) { box(root, w, h, d, sandM, x, h / 2, z); box(root, w * 0.6, h * 0.5, d * 0.6, sandM, x + 0.3, h + h * 0.25, z - 0.2); }
  let gs = 7;
  for (let i = 0; i < 90; i++) { gs = (gs * 16807) % 2147483647; const r1 = gs / 2147483647; gs = (gs * 16807) % 2147483647; const r2 = gs / 2147483647;
    const x = -34 + r1 * 62, z = -26 + r2 * 40; if (Math.hypot(x, z) < 3.2 || Math.abs(x - D.tripod[0]) < 1 && Math.abs(z) < 1.5) continue;
    const dn = DUNES.find(([dx, dz, w, d]) => Math.abs(x - dx) < w / 2 && Math.abs(z - dz) < d / 2), y = dn ? dn[4] * 1.25 : 0;
    const q = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), grassM); q.position.set(x, y + 0.42, z); q.rotation.y = i * 1.3; root.add(q); }
  // driftwood + a rocket-shaped sandcastle by her feet
  const woodM = lam({ color: 0x9a7d5c });
  for (const [x, z, r] of [[-4.5, 2.2, 0.6], [6, 4, -0.3], [-12, -2, 1.1]]) { const lg = cyl(root, 0.14, 0.18, 2.6, woodM, x, 0.15, z, 8); lg.rotation.set(0, r, PI / 2); }
  { const sc = new THREE.Group(); sc.position.set(-1.7, 0, 1.4); root.add(sc); cyl(sc, 0.32, 0.4, 0.2, sandM, 0, 0.1, 0); cyl(sc, 0.12, 0.13, 0.75, sandM, 0, 0.55, 0); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), sandM); tip.position.y = 1.05; sc.add(tip);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), lam({ color: 0xff4f6a, side: THREE.DoubleSide })); fl.position.set(0.09, 1.25, 0); sc.add(fl); box(sc, 0.012, 0.25, 0.012, woodM, 0.01, 1.15, 0); }
  // ---- the road + parked cars + an RV on the −x side
  const roadT = pixelTex(16, 32, (g, w, h) => { speckle(g, w, h, '#4a4c52', ['#45474d', '#525459'], 60, 2); g.fillStyle = '#f2c230'; g.fillRect(7, 2, 2, 12); }, { k: 1, repeat: [1, 120] });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 480), lam({ map: roadT })); road.rotation.x = -PI / 2; road.position.set(-24, 0.02, -200); road.receiveShadow = true; root.add(road);
  const cars = [];
  [[0xd8413a, -19.5, -6], [0x3c6fd8, -19.5, -12], [0xf3f1ec, -19.5, -18], [0x2fa05a, -28.5, -9], [0xf2b51d, -28.5, -16], [0x26282c, -19.5, -24]].forEach(([c, x, z], i) => { const o = voxCar(c, { seed: i + 3 }); o.position.set(x, 0, z); o.rotation.y = PI / 2; root.add(o); cars.push(o); });
  { const rv = new THREE.Group(); rv.position.set(-19, 0, 2); rv.rotation.y = 0.12; root.add(rv); box(rv, 2.5, 3.1, 8.5, lam({ color: 0xf1ede4 }), 0, 1.95, 0); box(rv, 2.55, 0.5, 8.6, lam({ color: 0x8a55c9 }), 0, 1.7, 0);
    box(rv, 2.56, 0.8, 1.6, lam({ color: 0x2a3d55 }), 0, 2.7, 3.2); box(rv, 2.56, 0.8, 2.4, lam({ color: 0x2a3d55 }), 0, 2.7, -1); for (const z of [-2.8, 2.6]) for (const x of [-1.2, 1.2]) cyl(rv, 0.45, 0.45, 0.4, lam({ color: 0x1d1d22 }), x, 0.45, z, 12).rotation.z = PI / 2;
    const aw = box(rv, 2.0, 0.06, 5, lam({ color: 0x3fb8c8 }), 2.1, 3.1, 0); aw.rotation.z = -0.12; for (const z of [-2.3, 2.3]) box(rv, 0.06, 3, 0.06, lam({ color: 0xbdbdb8 }), 3.0, 1.5, z); }
  // ---- viewing area: rope fence, LAUNCH VIEWING sign, chairs, coolers, a tent, an umbrella, a telescope
  const postM = lam({ color: 0x7a5a3a }), ropeM = lam({ color: 0xf2c230 });
  for (let x = -12; x <= 16; x += 2.5) { box(root, 0.12, 1.0, 0.12, postM, x, 0.5, -5.5); if (x < 16) box(root, 2.5, 0.05, 0.05, ropeM, x + 1.25, 0.88, -5.5, false); }
  const sign = voxSign(textCanvas(['LAUNCH VIEWING', 'STAY BEHIND THE ROPE'], { w: 256, h: 80, bg: '#f3f1ec', fg: '#26282c', font: 'bold 22px monospace', border: '#d8413a' }), { w: 3.2, h: 1.0, post: 1.4, color: 0x6b4a2c });
  sign.position.set(-6.8, 0, -6.2); sign.rotation.y = 0.25; root.add(sign);
  const fab = [0x3c6fd8, 0xd8413a, 0x2fa05a, 0xf2b51d, 0x8a55c9];
  const chair = (x, z, ry, c) => { const ch = new THREE.Group(); ch.position.set(x, 0, z); ch.rotation.y = ry; root.add(ch); box(ch, 0.6, 0.06, 0.5, lam({ color: c }), 0, 0.42, 0); const bk = box(ch, 0.6, 0.6, 0.06, lam({ color: c }), 0, 0.72, -0.26); bk.rotation.x = -0.2; for (const sx of [-0.28, 0.28]) for (const sz of [-0.22, 0.22]) box(ch, 0.04, 0.42, 0.04, lam({ color: 0x9aa0a8 }), sx, 0.21, sz); return ch; };
  [[-3.2, -7.4, PI, 0], [4.6, -7.2, PI + 0.3, 1], [8.8, -8.5, PI - 0.2, 2], [-9.5, -8.6, PI + 0.2, 3], [2.4, 3.4, 2.4, 4]].forEach(([x, z, r, c]) => chair(x, z, r, fab[c]));
  const cooler = (x, z, c) => { box(root, 0.7, 0.42, 0.42, lam({ color: c }), x, 0.21, z); box(root, 0.72, 0.08, 0.44, lam({ color: 0xf3f1ec }), x, 0.46, z); };
  cooler(-2.4, -6.9, 0xd8413a); cooler(5.6, -7.0, 0x3c6fd8); cooler(3.2, 3.0, 0x2fa05a);
  { const tent = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.6, 4), lam({ color: 0xf08a35 })); tent.position.set(11, 0.8, -12); tent.rotation.y = PI / 4; tent.castShadow = true; root.add(tent); }
  { const um = new THREE.Group(); um.position.set(7.4, 0, -3.5); root.add(um); box(um, 0.05, 2.2, 0.05, lam({ color: 0xe0e0e0 }), 0, 1.1, 0); const top = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 8), lam({ map: pixelTex(16, 4, (g, w, h) => { for (let x = 0; x < w; x++) { g.fillStyle = (x >> 1) % 2 ? '#f3f1ec' : '#d8413a'; g.fillRect(x, 0, 1, h); } }, { k: 1 }) })); top.position.y = 2.3; top.castShadow = true; um.add(top); }
  { const ts = new THREE.Group(); ts.position.set(-5.4, 0, -6.6); ts.rotation.y = PI - 0.3; root.add(ts); for (let i = 0; i < 3; i++) { const a = i * 2.1, lg = box(ts, 0.03, 1.3, 0.03, lam({ color: 0x26282c }), Math.cos(a) * 0.25, 0.62, Math.sin(a) * 0.25); lg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); }
    const tube = cyl(ts, 0.08, 0.1, 0.9, lam({ color: 0xf3f1ec }), 0, 1.35, 0.1, 10); tube.rotation.x = PI / 2 - 0.35; }
  // ---- spectators (blocky), mostly watching the pad; a few filming
  const people = [];
  const SPOTS = [[-1.6, -8.2, PI, 'phone'], [1.2, -8.8, PI + 0.2, null], [3.4, -8.0, PI - 0.1, 'phone'], [6.2, -9.4, PI, 'pointUp'], [-4.4, -9.6, PI + 0.3, null], [-7.8, -8.0, PI - 0.4, 'phone'],
    [9.6, -6.8, PI + 0.5, null], [-10.6, -6.6, PI + 0.6, 'phone'], [12.4, -9.0, PI - 0.3, null], [-2.8, -11.5, PI, null], [0.4, -12.2, PI + 0.1, 'phone'], [7.6, -12.6, PI - 0.2, null],
    [5.0, 4.6, 2.6, null], [-6.4, 4.0, -2.4, 'phone']];
  SPOTS.forEach(([x, z, ry, arm], i) => { const p = makeVoxPerson({ ...randomOutfit(i * 7 + 3), height: 1.6 + ((i * 37) % 30) / 100 }); p.pose({ x, z, rotY: ry, armR: arm ?? 'down', armL: 'down' }); root.add(p.root); people.push({ p, arm, x, z, ry, i }); });
  // ---- Vex's tripod + phone (the phone films the pad; its screen faces +z, toward the lens)
  const tri = new THREE.Group(); tri.position.set(D.tripod[0], 0, D.tripod[1]); root.add(tri);
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.4, lg = box(tri, 0.025, 1.36, 0.025, lam({ color: 0x1d1d22 }), Math.cos(a) * 0.2, 0.64, Math.sin(a) * 0.2); lg.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
  box(tri, 0.035, 0.24, 0.035, lam({ color: 0x1d1d22 }), 0, 1.3, -0.02);
  const phone = new THREE.Group(); phone.position.set(0, 1.52, 0); phone.rotation.x = -0.08; tri.add(phone);
  box(phone, 0.024, 0.04, 0.012, lam({ color: 0x1d1d22 }), 0, -0.07, -0.014);   // the clamp under the phone (behind the screen)
  // ---- the pad: concrete, mount, tower, an older tower, tanks, the assembly bay, floodlights, a water tower
  const concrete = lam({ map: pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#a9a69e', ['#9c998f', '#b4b1a8'], 50, 6), { k: 1, repeat: [12, 12] }) });
  box(root, 130, 0.4, 110, concrete, D.tower[0] + 14, 0.2, D.tower[1], false);
  const tower = makeCatchTower(); tower.g.position.set(D.tower[0], 0, D.tower[1]); root.add(tower.g);
  const mount = new THREE.Group(); mount.position.set(D.catch[0], 0, D.catch[1]); root.add(mount);
  const mM = lam({ color: 0xbcb8ae }), mD = lam({ color: 0x5a5e66 });
  for (let i = 0; i < 6; i++) { const a = i * PI / 3; box(mount, 2.4, D.mountY - 2, 2.4, mM, Math.cos(a) * 9.5, (D.mountY - 2) / 2, Math.sin(a) * 9.5); }
  for (let i = 0; i < 12; i++) { const a = i * PI / 6, b = box(mount, 5.4, 2.6, 2.2, mD, Math.cos(a) * 7.6, D.mountY - 1.3, Math.sin(a) * 7.6); b.rotation.y = -a + PI / 2; }
  box(mount, 22, 0.6, 22, lam({ color: 0x8a877e }), 0, 0.6, 0);
  const old = makeCatchTower({ h: 140, arms: false }); old.g.position.set(-190, 0, -330); root.add(old.g);
  { const om = new THREE.Group(); om.position.set(-170, 0, -330); root.add(om); for (let i = 0; i < 6; i++) { const a = i * PI / 3; box(om, 2.2, 18, 2.2, mM, Math.cos(a) * 8, 9, Math.sin(a) * 8); } box(om, 20, 2, 20, mD, 0, 19, 0); }
  const tankM = lam({ map: steelT() }), whiteM = lam({ color: 0xf0eee8 });
  for (let i = 0; i < 10; i++) { const x = D.tower[0] - 70 + (i % 5) * 11, z = D.tower[1] - 30 - Math.floor(i / 5) * 12, hh = 24 + (i % 3) * 4; cyl(root, 4, 4, hh, i % 4 ? tankM : whiteM, x, hh / 2, z, 20); const top = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 8, 0, 2 * PI, 0, PI / 2), i % 4 ? tankM : whiteM); top.position.set(x, hh, z); root.add(top); }
  { const sph = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 14), whiteM); sph.position.set(D.tower[0] - 92, 11, D.tower[1] + 8); root.add(sph); for (let i = 0; i < 6; i++) { const a = i * PI / 3; box(root, 0.8, 6, 0.8, mD, D.tower[0] - 92 + Math.cos(a) * 7, 3, D.tower[1] + 8 + Math.sin(a) * 7); } }
  const bayM = lam({ map: pixelTex(16, 32, (g, w, h) => { speckle(g, w, h, '#d9dbe0', ['#cfd2d8', '#e2e4e8'], 40, 8); for (let x = 0; x < w; x += 2) { g.fillStyle = '#c4c7ce'; g.fillRect(x, 0, 1, h); } }, { k: 1, repeat: [12, 4] }) });
  box(root, 70, 95, 50, bayM, -300, 47.5, -470); box(root, 22, 80, 0.6, lam({ color: 0x3a3f48 }), -282, 40, -444.8);
  box(root, 80, 40, 40, bayM, -220, 20, -520);
  for (const [x, z] of [[-10, -215], [-20, -300], [-100, -205], [-120, -290], [-45, -190]]) { box(root, 0.8, 40, 0.8, mD, x, 20, z); box(root, 4, 1.6, 1.0, lam({ color: 0xfff2c8, emissive: 0x9a8a50 }), x, 40, z); }
  { const wt = new THREE.Group(); wt.position.set(-140, 0, -180); root.add(wt); for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) box(wt, 0.6, 24, 0.6, mD, x, 12, z); cyl(wt, 5, 5, 8, whiteM, 0, 28, 0, 20); }
  // far shore: a low line of hills + a town glinting
  for (let i = 0; i < 18; i++) box(root, 120, 8 + (i % 4) * 5, 30, lam({ color: 0x8e8a78 }), -900 + i * 70, 4, -1300 - (i % 3) * 40, false);
  // ---- sky dome (follows the camera): dusk gradient, pink anti-sun band behind the tower, warm glow toward the sun (+x, +z)
  const SUN = new THREE.Vector3(240, 150, 420).normalize();
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 256; const sg = sc.getContext('2d');
  const phiSun = Math.atan2(SUN.z, -SUN.x);
  for (let x = 0; x < 512; x++) {
    const phi = (x / 512) * 2 * PI; let d = Math.abs(phi - phiSun); d = Math.min(d, 2 * PI - d); const warm = Math.max(0, 1 - d / 1.6) ** 1.5;
    const gr = sg.createLinearGradient(0, 0, 0, 256);
    const mix = (a, b, k) => { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, k).getHexString(); };
    gr.addColorStop(0, mix('#1c2a5e', '#2a3a74', warm)); gr.addColorStop(0.3, mix('#4b5a9a', '#7a78b8', warm)); gr.addColorStop(0.43, mix('#c88fb0', '#ffb07a', warm));
    gr.addColorStop(0.49, mix('#f5b3a0', '#ffd890', warm)); gr.addColorStop(0.5, '#e8c8a8'); gr.addColorStop(1, '#a89880');
    sg.fillStyle = gr; sg.fillRect(x, 0, 1, 256);
  }
  const skyT = new THREE.CanvasTexture(sc); skyT.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -2; sky.frustumCulled = false; sky.onBeforeRender = (r, s, cam) => sky.position.copy(cam.position); root.add(sky);
  // block clouds (lit pink from the low sun) + a pixel sun disc toward +z
  const cloudM = lam({ color: 0xffffff, emissive: 0xc88aa0, emissiveIntensity: 0.55 });
  const clouds = new THREE.Group(); root.add(clouds);
  for (let i = 0; i < 16; i++) { const cx = -700 + ((i * 173) % 1300), cz = -900 + ((i * 311) % 1300), cy = 330 + (i % 4) * 40; for (let j = 0; j < 4; j++) box(clouds, 40 + (j * 13) % 30, 10, 26 + (j * 7) % 18, cloudM, cx + j * 22 - 30, cy + (j % 2) * 6, cz + ((j * 17) % 20) - 10, false); }
  const sunDisc = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: pixelTex(16, 16, (g) => { g.fillStyle = '#fff2c0'; g.beginPath(); g.arc(8, 8, 6.5, 0, 2 * PI); g.fill(); g.fillStyle = '#ffe08a'; g.fillRect(3, 9, 10, 2); }, { k: 4 }), transparent: true, alphaTest: 0.5, fog: false, toneMapped: false }));
  sunDisc.frustumCulled = false; sunDisc.onBeforeRender = (r, s, cam) => { sunDisc.position.copy(cam.position).addScaledVector(SUN, 1300); sunDisc.lookAt(cam.position); }; root.add(sunDisc);
  // gulls: little pixel Vs that wheel over the beach
  const gullT = pixelTex(16, 8, (g) => { g.fillStyle = '#f6f4ef'; g.fillRect(2, 2, 4, 1); g.fillRect(5, 3, 2, 1); g.fillRect(7, 4, 2, 1); g.fillRect(9, 3, 2, 1); g.fillRect(10, 2, 4, 1); g.fillStyle = '#3a3f48'; g.fillRect(2, 2, 1, 1); g.fillRect(13, 2, 1, 1); }, { k: 2 });
  const gulls = Array.from({ length: 7 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gullT, transparent: true, alphaTest: 0.5 })); s.scale.set(1.0, 0.5, 1); root.add(s); return { s, r: 8 + i * 3, h: 9 + (i % 3) * 3, ph: i * 0.9, sp: 0.18 + (i % 4) * 0.05, cx: -6 + (i % 3) * 10, cz: -14 - (i % 2) * 8 }; });
  // ---- light: a low warm sun from behind the lens (+z, +x), a lavender sky fill, warm bounce off the sand
  const hemi = new THREE.HemisphereLight(0xa8b0e8, 0xd8a878, 1.05); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc89a, 2.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; root.add(sun, sun.target);
  function aim(cx, cz, half = 20, y = 0) { sun.target.position.set(cx, y, cz); sun.position.copy(sun.target.position).addScaledVector(SUN, 400); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 900 }); sun.shadow.camera.updateProjectionMatrix(); }
  aim(0, -2, 14);
  const fog = new THREE.Fog(0xd8b0b4, 260, 2400);
  function update(t) {
    seaT.offset.set(t * 0.02, t * 0.01); foams.forEach((f, i) => { f.position.x = D.sea + 1 + i * 5 + Math.sin(t * 0.7 + i) * 1.2; f.material.opacity = 1; });
    for (const g of gulls) { const a = t * g.sp + g.ph; g.s.position.set(g.cx + Math.cos(a) * g.r, g.h + Math.sin(t * 1.3 + g.ph) * 0.6, g.cz + Math.sin(a) * g.r * 0.6); g.s.scale.set(1.0, 0.5 * (0.7 + 0.3 * Math.abs(Math.sin(t * 6 + g.ph))), 1); }
  }
  return { root, D, tower, mount, old, sky, sun, hemi, fog, aim, update, phone, tripod: tri, people, cars, SUN };
}
