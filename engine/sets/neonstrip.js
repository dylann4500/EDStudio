// Neon beach strip at sunset (075, "Why GTA 6 took 13 years"): a generic 1980s-style Florida beach boulevard for the pixel look —
// the "game world" of an open-world crime game, ours (no real place names, no game's art).
//   const N = buildNeonStrip(studio);  N.root (origin on the road's centre line; the street runs along x)
//   z: sea (z < −46) · beach (−46…−4.5) · beach sidewalk (−4.5…−1.5, top N.SW) · road (−1.5…4.5) · hotel sidewalk (4.5…7.5, top N.SW) ·
//      hotel facades from z = 7.5 back. The sun sits low over the sea (−z), so the pastel facades take the warm light head-on.
//   N.cars = low sports coupes {g, setX(x)}, N.walkers = makePerson rigs (pose them with applyPose, floor = N.SW), N.palms,
//   N.fog (save it: per-shot swaps), N.update(t) = neon flicker-free shimmer of the sea glints + the moving car.
// Everything generic: hotel signs are plain words (SUNSET, PALMS, CORAL INN, SEA BREEZE, CAFE, HOTEL), no logos.
import * as THREE from 'three';
import { makePerson } from '../rig.js';
import { pixelTex, speckle } from '../pixeltex.js';

const PI = Math.PI;
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function makeCoupe(color = 0xff4fa3) {
  const g = new THREE.Group(), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const paint = toon(color), dark = toon(0x16161c), glass = toon(0x2a2440, 0x120c20), chrome = toon(0xd8dce4);
  const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  bx(1.9, 0.42, 4.5, paint, 0, 0.5, 0);                         // body (nose +z)
  const hood = bx(1.86, 0.16, 1.5, paint, 0, 0.74, 1.45); hood.rotation.x = 0.08;
  const cab = bx(1.6, 0.4, 1.7, glass, 0, 0.9, -0.35); cab.scale.set(1, 1, 1);
  bx(1.62, 0.06, 1.2, paint, 0, 1.12, -0.45);                   // roof
  bx(1.92, 0.1, 0.4, dark, 0, 0.92, -2.15);                     // spoiler
  for (const s of [-1, 1]) bx(0.08, 0.14, 0.12, dark, s * 0.75, 0.82, -2.15);
  bx(1.92, 0.08, 4.52, dark, 0, 0.3, 0);                        // sill stripe
  for (const s of [-1, 1]) { bx(0.4, 0.1, 0.04, new THREE.MeshBasicMaterial({ color: 0xfff6dc, toneMapped: false }), s * 0.62, 0.6, 2.26); bx(0.5, 0.1, 0.04, new THREE.MeshBasicMaterial({ color: 0xff2040, toneMapped: false }), s * 0.6, 0.62, -2.26); }
  bx(1.6, 0.06, 0.05, chrome, 0, 0.4, 2.27);
  const wheels = [];
  for (const [x, z] of [[-0.9, 1.45], [0.9, 1.45], [-0.9, -1.4], [0.9, -1.4]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14), dark); w.rotation.z = PI / 2; w.position.set(x, 0.33, z); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.25, 10), chrome); hub.rotation.z = PI / 2; hub.position.copy(w.position); g.add(hub); wheels.push(w); }
  return { g, wheels };
}

export function makePalm(h = 7, seed = 1) {
  const g = new THREE.Group(), trunkM = new THREE.MeshToonMaterial({ color: 0x8a6a48 }), leafM = new THREE.MeshToonMaterial({ color: 0x2f8a4a }), leafD = new THREE.MeshToonMaterial({ color: 0x24703a });
  const lean = (hash(seed) - 0.5) * 0.3, n = 9; let top = new THREE.Vector3();
  for (let i = 0; i < n; i++) { const u = i / n, y = u * h, x = Math.sin(u * 1.4) * lean * h * 0.4;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - u * 0.05, 0.19 - u * 0.05, h / n * 1.05, 7), trunkM); s.position.set(x, y + h / n / 2, 0); s.rotation.z = -lean * 0.4; s.castShadow = true; g.add(s); top.set(x, y + h / n, 0); }
  const crown = new THREE.Group(); crown.position.copy(top); g.add(crown);
  for (let k = 0; k < 9; k++) { const a = (k / 9) * 2 * PI + hash(seed + k) * 0.4, f = new THREE.Group(); f.rotation.y = a; crown.add(f);
    const len = 2.4 + hash(seed * 3 + k) * 0.8;
    for (let j = 0; j < 4; j++) { const seg = new THREE.Mesh(new THREE.BoxGeometry(0.42 - j * 0.07, 0.04, len / 4), j % 2 ? leafD : leafM); const u = (j + 0.5) / 4; seg.position.set(0, 0.25 - u * u * 1.6, (j + 0.5) * len / 4 * 0.92); seg.rotation.x = 0.15 + u * 0.9; seg.castShadow = true; f.add(seg); } }
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshToonMaterial({ color: 0x5a4028 })); c.position.set(Math.cos(k * 1.6) * 0.16, -0.15, Math.sin(k * 1.6) * 0.16); crown.add(c); }
  return g;
}

export function buildNeonStrip(studio) {
  const { scene } = studio;
  const root = new THREE.Group();
  const toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const lam = (o) => new THREE.MeshLambertMaterial(o);
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const SW = 0.15, X0 = -90, X1 = 90, LEN = X1 - X0;

  // ---- sky dome (purple → pink → orange at the horizon) with a big low banded sun over the sea (−z)
  const skyT = crisp(32, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1c1440'); gr.addColorStop(0.3, '#4a2a78'); gr.addColorStop(0.42, '#c04a8a'); gr.addColorStop(0.48, '#ff8a5a'); gr.addColorStop(0.5, '#ffc070'); gr.addColorStop(0.52, '#7a3a6a'); gr.addColorStop(1, '#241a30'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false })); sky.renderOrder = -3; sky.frustumCulled = false; root.add(sky);
  const sunT = crisp(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe27a'); gr.addColorStop(0.6, '#ff8a5a'); gr.addColorStop(1, '#ff4f8a'); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, 2 * PI); g.fill();
    g.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 6; k++) { const y = h * 0.56 + k * 18, th = 3 + k * 2.2; g.fillRect(0, y, w, th); } });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshBasicMaterial({ map: sunT, transparent: true, fog: false, toneMapped: false, depthWrite: false })); sun.position.set(-60, 30, -520); sun.renderOrder = -2; root.add(sun);
  const clouds = [];
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(60 + hash(i) * 70, 6 + hash(i + 4) * 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9ac0 : 0xc06aa8, fog: false, toneMapped: false, transparent: true, opacity: 0.75, depthWrite: false })); c.position.set(-300 + i * 75 + hash(i + 9) * 30, 55 + hash(i + 2) * 80, -500); c.renderOrder = -2; root.add(c); clouds.push(c); }

  // ---- the sea (glint stripes toward the sun), the beach, a lifeguard tower, umbrellas
  const seaT = pixelTex(32, 32, (g, w, h) => { g.fillStyle = '#3a2a6a'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { g.fillStyle = hash(k) > 0.5 ? '#6a4a9a' : '#ff9a7a'; g.fillRect(Math.floor(hash(k * 3) * w), Math.floor(hash(k * 5) * h), 3 + Math.floor(hash(k * 7) * 4), 1); } }, { k: 1, repeat: [40, 30] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 600), lam({ map: seaT, emissive: 0x1a1030 })); sea.rotation.x = -PI / 2; sea.position.set(0, -0.15, -346); root.add(sea);
  const sandT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#e8b48a', ['#dca47c', '#f0c09a', '#d89a74'], 50, 5), { k: 1, repeat: [90, 21] });
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(LEN * 2, 42), lam({ map: sandT })); sand.rotation.x = -PI / 2; sand.position.set(0, -0.02, -25.5); sand.receiveShadow = true; root.add(sand);
  { const foam = new THREE.Mesh(new THREE.PlaneGeometry(LEN * 2, 1.2), glow(0xffd8e8)); foam.rotation.x = -PI / 2; foam.position.set(0, -0.01, -46.2); root.add(foam); }
  { const tw = new THREE.Group(); tw.position.set(-14, 0, -22); root.add(tw); const pk = toon(0xff7ab0), wd = toon(0xf2e6d0);
    for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) bx(tw, 0.12, 2.2, 0.12, wd, x, 1.1, z); bx(tw, 2.0, 0.12, 2.0, wd, 0, 2.2, 0); bx(tw, 1.8, 1.4, 1.8, pk, 0, 2.95, 0); const rf = bx(tw, 2.3, 0.12, 2.3, toon(0x2ec4b6), 0, 3.7, 0); rf.rotation.z = 0.05;
    const ramp = bx(tw, 0.8, 0.06, 3.0, wd, 0, 1.1, 2.2); ramp.rotation.x = 0.75; }
  const UMB = [0xff4fa3, 0x2ec4b6, 0xffd43b, 0xff7a3c];
  for (let i = 0; i < 14; i++) { const x = -70 + i * 11 + hash(i) * 4, z = -12 - hash(i + 3) * 22, u = new THREE.Group(); u.position.set(x, 0, z); root.add(u);
    bx(u, 0.05, 2.1, 0.05, toon(0xf2e6d0), 0, 1.05, 0); const c = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), toon(UMB[i % 4])); c.position.y = 2.2; c.castShadow = true; u.add(c);
    if (i % 2 === 0) { const towel = bx(u, 0.7, 0.02, 1.6, toon(UMB[(i + 1) % 4]), 0.9, 0.01, 0.3); towel.rotation.y = 0.3; } }

  // ---- sidewalks, the road, the beach wall
  const swT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#d8c8c0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0b0a8'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillStyle = '#e8d8d0'; g.fillRect(4, 4, 2, 2); }, { k: 1, repeat: [LEN / 1.5, 2] });
  for (const z of [-3, 6]) { const s = bx(root, LEN, SW, 3, lam({ map: swT }), 0, SW / 2, z); s.castShadow = false; }
  const roadT = pixelTex(32, 16, (g, w, h) => { speckle(g, w, h, '#3a3442', ['#363040', '#3e3848', '#342e3c'], 60, 9); g.fillStyle = '#ffd43b'; g.fillRect(0, 7, 14, 2); }, { k: 1, repeat: [LEN / 6, 1] });
  { const r = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 6), lam({ map: roadT })); r.rotation.x = -PI / 2; r.position.set(0, 0.002, 1.5); r.receiveShadow = true; root.add(r); }
  { const wall = bx(root, LEN, 0.6, 0.3, toon(0xf2e6d0), 0, 0.3, -4.65); wall.castShadow = false; }

  // ---- hotels: pastel art-deco facades with eyebrow ledges, corner towers, neon trim + neon word signs
  const PAL = [[0x7ad8d0, 0xff6ab0], [0xffb0c8, 0x5cf0ff], [0xfff0a8, 0xff4fa3], [0xc8f0d0, 0xff6ab0], [0xd8c0f0, 0x5cf0ff], [0xffc8a0, 0xff4fa3]];
  const NAMES = ['SUNSET', 'PALMS', 'CORAL INN', 'SEA BREEZE', 'CAFE', 'HOTEL', 'SUNSET', 'PALMS', 'TACOS', 'SURF SHOP', 'HOTEL', 'CORAL INN', 'CAFE', 'SEA BREEZE', 'MOTEL', 'PALMS', 'SUNSET', 'HOTEL'];
  const winT = (base, trim) => pixelTex(16, 16, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd88a'; g.fillRect(3, 4, 4, 6); g.fillRect(9, 4, 4, 6); g.fillStyle = '#5a4a7a'; g.fillRect(3, 4, 4, 2); g.fillRect(9, 4, 4, 2); g.fillStyle = trim; g.fillRect(0, 13, w, 2); }, { k: 1 });
  const hex = (c) => '#' + c.toString(16).padStart(6, '0');
  const neons = [];
  let hx = X0 + 4, hi = 0;
  while (hx < X1 - 8) {
    const [base, neonC] = PAL[hi % PAL.length], wid = 10 + Math.floor(hash(hi * 3) * 3) * 2, flo = 2 + Math.floor(hash(hi * 5) * 3), H = flo * 3.2 + 1.2, cx = hx + wid / 2;
    const t = winT(hex(base), hex(new THREE.Color(base).multiplyScalar(0.8).getHex())); t.repeat.set(wid / 2.6, flo);
    const m = lam({ map: t }), side = lam({ color: new THREE.Color(base).multiplyScalar(0.85) }), top = lam({ color: new THREE.Color(base).multiplyScalar(0.7) });
    bx(root, wid, H, 10, [side, side, top, top, m, side], cx, H / 2, 12.5);
    for (let f = 1; f <= flo; f++) bx(root, wid + 0.3, 0.12, 0.6, toon(0xf8f4ee), cx, f * 3.2 + 0.2, 7.3);   // eyebrow ledges
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, H + 2.2, 14), toon(new THREE.Color(base).multiplyScalar(1.02).getHex())); tower.position.set(cx + (hi % 2 ? wid / 2 - 1.1 : -wid / 2 + 1.1), (H + 2.2) / 2, 8.1); tower.castShadow = true; root.add(tower);
    bx(root, 1.0, 1.2, 0.2, toon(0x2a2440), cx, 1.0 + SW, 7.45);                    // door
    for (const s of [-1, 1]) { const n = bx(root, 0.08, H - 0.4, 0.08, glow(neonC), cx + s * (wid / 2 - 0.15), H / 2, 7.42); n.castShadow = false; neons.push(n); }
    const nr = bx(root, wid - 0.2, 0.08, 0.08, glow(neonC), cx, H - 0.25, 7.42); nr.castShadow = false; neons.push(nr);
    const name = NAMES[hi % NAMES.length], sT = crisp(512, 128, (g, w, h) => { g.font = '800 84px Inter, Arial'; g.textAlign = 'center'; g.shadowColor = hex(neonC); g.shadowBlur = 18; g.fillStyle = '#fff4fb'; g.fillText(name, w / 2, 96); g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = hex(neonC); g.strokeText(name, w / 2, 96); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(wid - 1, 7.5), Math.min(wid - 1, 7.5) / 4), new THREE.MeshBasicMaterial({ map: sT, transparent: true, toneMapped: false })); sg.position.set(cx, H + 0.75, 7.48); root.add(sg);
    // a café awning + two little tables on some fronts
    if (hi % 3 === 1) { const aw = bx(root, 4, 0.08, 1.4, toon(neonC === 0xff4fa3 ? 0xff4fa3 : 0x2ec4b6), cx - 2, 2.7, 6.9); aw.rotation.x = -0.25;
      for (const dx of [-3.2, -1.0]) { bx(root, 0.05, 0.75, 0.05, toon(0xf2e6d0), cx + dx, SW + 0.37, 6.4); const tt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 12), toon(0xf8f4ee)); tt.position.set(cx + dx, SW + 0.76, 6.4); root.add(tt); } }
    hx += wid + 0.6; hi++;
  }

  // ---- palms along the beach sidewalk, street lamps along the hotel side
  const palms = [];
  for (let x = X0 + 3; x < X1; x += 9) { const p = makePalm(6.5 + hash(x) * 2.5, Math.round(x + 200)); p.position.set(x + hash(x + 1) * 2, SW, -3.4); root.add(p); palms.push(p); }
  for (let x = X0 + 7; x < X1; x += 14) { const l = new THREE.Group(); l.position.set(x, SW, 4.9); root.add(l); bx(l, 0.1, 4.6, 0.1, toon(0x2a2440), 0, 2.3, 0); bx(l, 0.1, 0.1, 0.9, toon(0x2a2440), 0, 4.6, -0.4); bx(l, 0.35, 0.12, 0.35, glow(0xffe0b0), 0, 4.5, -0.8).castShadow = false; }

  // ---- cars: parked coupes + one driving along
  const cars = [];
  const CC = [0xff4fa3, 0x2ec4b6, 0xf8f4ee, 0xffd43b, 0x7a5cff, 0xff4fa3, 0x2ec4b6];
  for (let i = 0; i < 7; i++) { const c = makeCoupe(CC[i]); c.g.position.set(-56 + i * 17 + hash(i) * 3, 0, i % 2 ? 3.6 : -0.6); c.g.rotation.y = i % 2 ? PI / 2 : -PI / 2; root.add(c.g); cars.push(c); }
  const driver = makeCoupe(0x5cf0ff); root.add(driver.g); driver.g.rotation.y = -PI / 2; driver.g.position.set(30, 0, 2.9);

  // ---- walkers ("the randoms on the street")
  const OUT = [[0xff6ab0, 0x2a2440, 0x3a2a1a], [0x5cf0ff, 0xf2e6d0, 0x111114], [0xffd43b, 0x3a5a8a, 0x8a5a3a], [0xf8f4ee, 0xff7a3c, 0x5a3a2a], [0x7a5cff, 0x2a2a2a, 0xd8b070], [0x2ec4b6, 0xf8f4ee, 0x2a1a10], [0xff7a3c, 0x2a3a5a, 0x111114], [0xffb0c8, 0x5a4a3a, 0x8a6a40]];
  const SKINS = [0xf0c8a8, 0xc68a5e, 0x8d5a3a, 0xe8b894, 0xa86a48, 0xf4d0b0, 0x7a4a30, 0xd8a07a];
  const walkers = OUT.map(([top, pants, hair], i) => { const r = makePerson({ skin: SKINS[i], top, pants, hair, hairStyle: ['short', 'bob', 'messy', 'short', 'bob', 'messy', 'short', 'bob'][i], glasses: i === 3, headR: 0.135 }); root.add(r.root); return r; });

  // ---- light: the low sun (warm key from −z), a purple sky fill
  const hemi = new THREE.HemisphereLight(0xb08ad8, 0x6a3a4a, 0.85); root.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffb27a, 1.6); sunL.position.set(-30, 18, -60); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 160 }); root.add(sunL, sunL.target);
  const fog = new THREE.Fog(0xb0608a, 60, 420);
  function aimSun(x, z) { sunL.target.position.set(x, 0, z); sunL.position.set(x - 30, 18, z - 60); sunL.target.updateMatrixWorld(); }
  function update(t) { driver.g.position.x = 30 - 11 * t; driver.wheels.forEach((w) => (w.rotation.x = t * 11 / 0.33)); }   // drives −x once (passes x = 0 at t ≈ 2.7)
  return { root, SW, cars, driver, walkers, palms, neons, sky, sun, fog, hemi, sunL, aimSun, update };
}
