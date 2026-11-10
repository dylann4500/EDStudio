// 078 — IRON MOON 24/7, a gym at night (pixel/Vex look; every brand made up). Built for a vertical frame shot mostly from +z toward
// the back wall (−z), with a reverse angle onto the front desk + windows (+z).
//   const GYM = buildNightGym(studio);  scene.add(GYM.root) is done for you;  GYM.setMode('night'|'morning');  GYM.setClock(h, m);
//   GYM.update(t) (treadmill belts, fan, neon flicker-free hum);  GYM.D = spots + dims;  GYM.fog (save it if you swap fogs).
// Layout (m): floor x −6.5…6.5, z −6.5…5, ceiling 5.2 (black, ducts, hanging LED bars).
//   back wall z −6.5: brick, IRON MOON mural + a pink LEG DAY neon, the HUD clock; three power racks (front uprights z −3.9, back
//     z −5.1) on wood platforms at x −3.3 / 0 / 3.3 (`D.racks`), a barbell on the J-hooks of each (bar y `D.barY`);
//   left wall x −6.5: mirror wall + a two-tier dumbbell rack (instanced), kettlebells, a plate tree, foam rollers;
//   right side: steel stairs up the right wall (x 5.3…6.3, from z 3.1 at the floor to z −1.4 at the mezzanine deck y `D.deckY`)
//     → a cardio mezzanine (x 2.9…6.5, z −6.5…−1.4) with three treadmills facing high windows; under it a cable stack;
//   middle: two flat benches (`D.benches`), a plyo box stack, med-ball rack, a punching bag, a chalk stand, wipe station;
//   front z 5: night windows, glass doors, the front desk (`D.desk`) with made-up tubs (GRRR, KAPOW, MOONDUST), shakers, towels.
// Lights: a cool hemi, six ceiling points 4 m up (≥ 2.4 m above any head), a soft shadow key; neon/LED/screens are MeshBasic only
// (076 rule: Vex's toon ramp floor is 0.7, so ANY light near her lights her front — keep glow out of her space).
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';

const PI = Math.PI;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function buildNightGym(studio) {
  const { scene } = studio;
  const root = new THREE.Group(); root.name = 'nightgym'; scene.add(root);
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const basic = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (shadow) o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const cyl = (parent, r0, r1, h, m, x, y, z, seg = 14, shadow = true) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); if (shadow) o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0, 'YXZ'); parent.add(o); return o; };
  const sign = (w, h, bg, lines, o = {}) => crisp(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (o.border) { g.strokeStyle = o.border; g.lineWidth = o.bw ?? 8; g.strokeRect(6, 6, w - 12, h - 12); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach(([txt, col, size, y, font]) => { g.fillStyle = col; g.font = `${font ?? '900'} ${size}px Inter, Arial`; g.fillText(txt, w / 2, y); }); });
  const neonTex = (w, h, text, col, size, font = '800') => crisp(w, h, (g) => { g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${font} ${size}px Inter, Arial`;
    g.shadowColor = col; g.shadowBlur = size * 0.45; g.fillStyle = col; g.fillText(text, w / 2, h / 2); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = 0.55; g.fillText(text, w / 2, h / 2); });

  const D = { racks: [-3.3, 0, 3.3].map((x) => ({ x, zf: -3.9, zb: -5.1 })), barY: 1.38, deckY: 2.7, floorY: 0,
    benches: [{ x: 1.85, z: -2.45, rotY: PI / 2 + 0.1 }, { x: -3.1, z: 0.6, rotY: 0.2 }], desk: { x: -0.8, z: 3.6 }, stairs: { x0: 5.3, x1: 6.3, z0: 3.1, z1: -1.4, n: 15 } };
  D.stepY = (i) => (i + 1) * (D.deckY / D.stairs.n);                                     // top of step i (0 = lowest)
  D.stepZ = (i) => D.stairs.z0 - (i + 0.5) * ((D.stairs.z0 - D.stairs.z1) / D.stairs.n);  // centre z of step i

  // ---------------------------------------------------------------- shell: rubber floor, brick walls, black ceiling
  const rubberT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#2b2d33', ['#34363d', '#24262b', '#3c3f47', '#5a4a6a'], 70, 3); g.fillStyle = '#1c1d22'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); }, { k: 1, repeat: [13, 12] });
  const floor = plane(root, 13.2, 11.6, lam({ map: rubberT }), 0, 0, -0.75, 0, -PI / 2); floor.receiveShadow = true;
  const brickT = (base, mortar, rep) => pixelTex(16, 16, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, base, ['#3a2a30', '#4a3036', '#33262c'], 30, 7); g.fillStyle = mortar; for (let y = 0; y < h; y += 4) { g.fillRect(0, y, w, 1); for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 1, 4); } }, { k: 1, repeat: rep });
  const backM = lam({ map: brickT('#3e2c33', '#24181d', [10, 4]) }), sideM = lam({ map: brickT('#33303a', '#1e1c24', [9, 4]) });
  plane(root, 13.2, 5.2, backM, 0, 2.6, -6.5);
  plane(root, 11.6, 5.2, sideM, -6.6, 2.6, -0.75, PI / 2); plane(root, 11.6, 5.2, sideM, 6.6, 2.6, -0.75, -PI / 2);
  plane(root, 13.2, 11.6, lam({ color: 0x16161c }), 0, 5.2, -0.75, 0, PI / 2);
  bx(root, 13.2, 0.14, 0.06, toon(0xffd43b), 0, 0.07, -6.45, false);                               // a yellow kick stripe along the back wall
  // ducts + hanging LED bars (MeshBasic: they read as light without lighting her)
  const ductM = toon(0x8a8e98, 0x101014);
  for (const x of [-3.6, 1.2]) { const d = cyl(root, 0.32, 0.32, 11.4, ductM, x, 4.75, -0.75, 16, false); d.rotation.x = PI / 2; for (let z = -6; z < 5; z += 1.4) { const r = cyl(root, 0.335, 0.335, 0.05, toon(0x6a6e78), x, 4.75, z, 16, false); r.rotation.x = PI / 2; } }
  const ledM = basic({ color: 0xf2f6ff });
  for (const x of [-4.2, -1.4, 1.4]) for (const z of [-4.6, -1.6, 1.4]) { bx(root, 0.12, 0.05, 2.3, ledM, x, 4.25, z, false); for (const dz of [-0.9, 0.9]) bx(root, 0.01, 0.9, 0.01, toon(0x222222), x, 4.72, z + dz, false); }

  // ---------------------------------------------------------------- back wall: mural, neon, clock, posters
  const mural = crisp(1024, 300, (g, w, h) => { g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#e8e2f2'; g.beginPath(); g.arc(150, 150, 110, 0, 7); g.fill(); g.fillStyle = '#3e2c33'; g.beginPath(); g.arc(195, 120, 100, 0, 7); g.fill();   // crescent
    g.fillStyle = '#e8e2f2'; g.fillRect(60, 225, 190, 14); g.fillRect(70, 205, 16, 54); g.fillRect(224, 205, 16, 54); g.fillRect(50, 214, 12, 36); g.fillRect(248, 214, 12, 36);   // barbell
    g.font = '900 150px Inter, Arial'; g.fillStyle = '#e8e2f2'; g.fillText('IRON MOON', 640, 140); g.font = '800 54px Inter, Arial'; g.fillStyle = '#c8a8ff'; g.fillText('STRENGTH  ·  24/7', 640, 252); });
  plane(root, 7.2, 2.1, lam({ map: mural, transparent: true, emissive: 0x2a2630, emissiveMap: mural }), -0.4, 3.85, -6.47);
  const legNeon = plane(root, 1.9, 0.62, basic({ map: neonTex(760, 248, 'LEG DAY', '#ff4fa3', 150), transparent: true, depthWrite: false }), 1.62, 2.72, -6.44);
  const moonNeon = plane(root, 0.62, 0.62, basic({ map: crisp(256, 256, (g) => { g.shadowColor = '#b06aff'; g.shadowBlur = 30; g.strokeStyle = '#b06aff'; g.lineWidth = 18; g.beginPath(); g.arc(128, 128, 80, 0.6, 5.2); g.stroke(); g.shadowBlur = 0; g.strokeStyle = '#ffffff'; g.globalAlpha = 0.5; g.lineWidth = 6; g.stroke(); }), transparent: true, depthWrite: false }), -1.62, 2.72, -6.44);
  // the HUD clock over the middle rack
  const clk = new THREE.Group(); clk.position.set(0, 3.0, -6.42); root.add(clk);
  { const face = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), lam({ map: crisp(128, 128, (g) => { g.fillStyle = '#f4f2ea'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(64 + Math.sin(a) * 52 - 2, 64 - Math.cos(a) * 52 - 2, 5, 5); } }), emissive: 0x202020 })); clk.add(face);
    clk.add(new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.025, 8, 32), toon(0x1a1a1e))); }
  const hand = (len, w) => { const p = new THREE.Group(); bx(p, w, len, 0.01, basic({ color: 0x1a1a1a }), 0, len / 2 - 0.03, 0.012, false); clk.add(p); return p; };
  const clkH = hand(0.16, 0.024), clkM = hand(0.24, 0.016);
  const setClock = (h, m) => { clkM.rotation.z = -m / 60 * 2 * PI; clkH.rotation.z = -((h % 12) + m / 60) / 12 * 2 * PI; };
  const poster = (w, h, tex, x, y, z, ry = 0) => plane(root, w, h, lam({ map: tex, emissive: 0x181818, emissiveMap: tex }), x, y, z, ry);
  poster(0.8, 1.1, sign(300, 410, '#101014', [['RE-RACK', '#ffd43b', 62, 110], ['YOUR', '#ffffff', 54, 190], ['WEIGHTS', '#ffd43b', 62, 270], ['- MGMT', '#ff6a8a', 30, 360]], { border: '#ffd43b' }), -5.1, 1.75, -6.45);
  poster(0.8, 1.1, sign(300, 410, '#ff4fa3', [['NEVER', '#101014', 62, 110], ['SKIP', '#ffffff', 84, 205], ['LEG DAY', '#101014', 56, 300]], { border: '#101014' }), 5.0, 1.75, -6.45);

  // ---------------------------------------------------------------- power racks + barbells + plates
  const steel = toon(0x2b2e36, 0x0a0a0e), steelLt = toon(0x8a909c, 0x101014), chrome = toon(0xd0d4dc, 0x202024);
  const holeT = pixelTex(4, 16, (g, w, h) => { g.fillStyle = '#2b2e36'; g.fillRect(0, 0, w, h); g.fillStyle = '#0c0c10'; for (let y = 2; y < h; y += 4) g.fillRect(1, y, 2, 2); }, { k: 1, repeat: [1, 14] });
  const upM = new THREE.MeshToonMaterial({ map: holeT, emissive: 0x060608 });
  const PLATE = [[0.225, 0.075, 0xd8333a], [0.225, 0.065, 0x2a5ad8], [0.225, 0.055, 0xf0c020], [0.225, 0.045, 0x2a9a4a]];
  function barbell(nPlates = 2) {
    const g = new THREE.Group();
    const shaft = cyl(g, 0.014, 0.014, 1.31, chrome, 0, 0, 0, 10); shaft.rotation.z = PI / 2;
    for (const s of [-1, 1]) { const sl = cyl(g, 0.026, 0.026, 0.44, chrome, s * 0.88, 0, 0, 12); sl.rotation.z = PI / 2;
      const col = cyl(g, 0.034, 0.034, 0.02, steelLt, s * 0.66, 0, 0, 12); col.rotation.z = PI / 2;
      let x = 0.69; for (let i = 0; i < nPlates; i++) { const [r, th, c] = PLATE[i % PLATE.length]; const p = cyl(g, r, r, th, toon(c, 0x0c0c0c), s * (x + th / 2), 0, 0, 24); p.rotation.z = PI / 2;
        const hub = cyl(g, 0.06, 0.06, th + 0.006, steelLt, s * (x + th / 2), 0, 0, 12, false); hub.rotation.z = PI / 2; x += th + 0.004; } }
    return g; }
  const racks = [];
  D.racks.forEach((R, ri) => {
    const g = new THREE.Group(); root.add(g);
    const plat = crisp(64, 64, (c, w, h) => { c.fillStyle = '#16161a'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8864e'; c.fillRect(14, 0, 36, h); c.fillStyle = '#a0723e'; for (let y = 0; y < h; y += 8) c.fillRect(14, y, 36, 1); c.fillStyle = '#c8965e'; c.fillRect(30, 0, 1, h); });
    plat.magFilter = THREE.NearestFilter;
    bx(g, 2.6, 0.035, 2.5, lam({ map: plat }), R.x, 0.0175, (R.zf + R.zb) / 2 + 0.25, false).receiveShadow = true;
    for (const sx of [-0.62, 0.62]) for (const z of [R.zf, R.zb]) bx(g, 0.075, 2.3, 0.075, upM, R.x + sx, 1.15, z);
    for (const z of [R.zf, R.zb]) bx(g, 1.32, 0.075, 0.075, steel, R.x, 2.3, z);
    for (const sx of [-0.62, 0.62]) { bx(g, 0.075, 0.075, 1.27, steel, R.x + sx, 2.3, (R.zf + R.zb) / 2); bx(g, 0.05, 0.05, 1.5, steelLt, R.x + sx, 0.62, (R.zf + R.zb) / 2 + 0.1); }   // top rails + safety arms
    for (const sx of [-0.62, 0.62]) { const j = bx(g, 0.06, 0.05, 0.13, steelLt, R.x + sx, D.barY - 0.05, R.zf + 0.08); void j; bx(g, 0.06, 0.08, 0.02, steelLt, R.x + sx, D.barY - 0.01, R.zf + 0.14); }   // J-hooks
    for (const sx of [-0.62, 0.62]) for (let i = 0; i < 2; i++) { const peg = cyl(g, 0.025, 0.025, 0.3, steelLt, R.x + sx * 1.18, 0.32 + i * 0.5, R.zb, 10); peg.rotation.z = PI / 2;
      for (let k = 0; k < 3; k++) { const [r, th, c] = PLATE[(ri + i + k) % 4]; const p = cyl(g, r, r, th, toon(c, 0x0c0c0c), R.x + sx * (0.92 + k * (th + 0.006) + th / 2 + 0.06), 0.32 + i * 0.5, R.zb, 24); p.rotation.z = PI / 2; } }
    const bar = barbell(ri === 1 ? 2 : 1 + (ri % 2)); bar.position.set(R.x, D.barY + 0.012, R.zf + 0.1); g.add(bar);
    racks.push({ g, bar });
  });
  // stripes round the middle platform (yellow/black hazard tape)
  const tapeT = pixelTex(16, 4, (g, w, h) => { g.fillStyle = '#ffd43b'; g.fillRect(0, 0, w, h); g.fillStyle = '#18181c'; for (let x = -4; x < w; x += 8) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 4, 0); g.lineTo(x + 8, 0); g.lineTo(x + 4, h); g.fill(); } }, { k: 1, repeat: [8, 1] });
  for (const z of [-2.55, -6.2]) bx(root, 8.6, 0.004, 0.1, lam({ map: tapeT }), 0, 0.037, z, false);

  // ---------------------------------------------------------------- left wall: mirror + dumbbell rack + kettlebells + plate tree
  const mirT = crisp(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#5a6278'); gr.addColorStop(0.5, '#6c7690'); gr.addColorStop(1, '#4a5268'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.16)'; for (const x of [60, 90, 300, 330, 345]) { g.save(); g.translate(x, 0); g.transform(1, 0, -0.5, 1, 0, 0); g.fillRect(0, 0, x % 2 ? 8 : 22, h); g.restore(); }
    g.fillStyle = 'rgba(20,20,30,.35)'; for (let i = 0; i < 14; i++) g.fillRect(20 + i * 35, 150 + (i % 3) * 6, 12, 60); });
  plane(root, 8.0, 2.3, lam({ map: mirT, emissive: 0x101420 }), -6.56, 1.55, -1.6, PI / 2);
  bx(root, 0.06, 2.4, 8.1, toon(0x1a1a1e), -6.6, 1.55, -1.6, false);
  // two-tier dumbbell rack along the mirror, 2 × 12 pairs (instanced: heads + handles)
  const dbX = -5.95, dbZ0 = -5.2, dbZ1 = 1.8;
  for (const y of [0.42, 0.78]) { bx(root, 0.5, 0.04, dbZ1 - dbZ0, steel, dbX, y, (dbZ0 + dbZ1) / 2); }
  for (const z of [dbZ0, (dbZ0 + dbZ1) / 2, dbZ1]) bx(root, 0.5, 0.82, 0.05, steel, dbX, 0.41, z);
  const headGeo = new THREE.CylinderGeometry(1, 1, 1, 6), hndGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 8);
  const heads = new THREE.InstancedMesh(headGeo, toon(0x1c1c20, 0x08080a), 200), hnds = new THREE.InstancedMesh(hndGeo, chrome, 100);
  heads.count = 0; hnds.count = 0; root.add(heads, hnds); heads.castShadow = true;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), qx = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), PI / 2);
  for (const [tier, y] of [[0, 0.42], [1, 0.78]]) for (let i = 0; i < 12; i++) {
    const z = dbZ0 + 0.25 + i * ((dbZ1 - dbZ0 - 0.5) / 11), s = 0.055 + (tier ? 0.025 : 0.045) * (i / 11) + (tier ? 0 : 0.03), L = 0.14 + s * 0.9;
    m4.compose(V(dbX, y + 0.02 + s, z), qx, V(0.03 + 0, L, 0.03)).identity(); hnds.setMatrixAt(hnds.count++, m4.compose(V(dbX, y + 0.02 + s, z), qx, V(1, L, 1)));
    for (const sd of [-1, 1]) heads.setMatrixAt(heads.count++, m4.compose(V(dbX, y + 0.02 + s, z + sd * (L / 2 + s * 0.45)), qx, V(s, s * 0.9, s)));
  }
  heads.instanceMatrix.needsUpdate = true; hnds.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < 6; i++) { const kb = new THREE.Group(); kb.position.set(-5.2 + (i % 2) * 0.05, 0, -4.4 + i * 0.42); root.add(kb); const r = 0.1 + i * 0.012;
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), toon([0x1c1c20, 0xd8333a, 0x2a5ad8, 0xf0c020, 0x2a9a4a, 0x1c1c20][i])); b.position.y = r; b.castShadow = true; kb.add(b);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(r * 0.55, r * 0.14, 6, 14, PI), toon(0x1c1c20)); hd.position.y = r * 1.75; kb.add(hd); }
  { const tree = new THREE.Group(); tree.position.set(-4.6, 0, 1.5); root.add(tree); cyl(tree, 0.04, 0.04, 1.2, steel, 0, 0.6, 0, 8); cyl(tree, 0.3, 0.3, 0.04, steel, 0, 0.02, 0, 16);
    for (let i = 0; i < 4; i++) { const a = i * PI / 2 + 0.4, peg = cyl(tree, 0.022, 0.022, 0.24, steelLt, Math.cos(a) * 0.12, 0.35 + i * 0.22, Math.sin(a) * 0.12, 8); peg.rotation.set(0, -a, PI / 2);
      const [r, th, c] = PLATE[i]; const p = cyl(tree, r * 0.95, r * 0.95, th, toon(c, 0x0c0c0c), Math.cos(a) * 0.22, 0.35 + i * 0.22, Math.sin(a) * 0.22, 22); p.rotation.set(0, -a, PI / 2); } }
  for (let i = 0; i < 5; i++) { const fr = cyl(root, 0.075, 0.075, 0.45, toon([0x2a8ab8, 0xff4fa3, 0x1c1c20, 0x7cf05f, 0xb06aff][i]), -5.6 + i * 0.17, 0.075, 2.6, 12); fr.rotation.x = PI / 2; }

  // ---------------------------------------------------------------- middle: benches, plyo boxes, med balls, bag, chalk, wipe station
  const pad = toon(0x8a1c2e, 0x1a0408), benches = [];
  for (const B of D.benches) { const g = new THREE.Group(); g.position.set(B.x, 0, B.z); g.rotation.y = B.rotY; root.add(g);
    bx(g, 0.3, 0.09, 1.2, pad, 0, 0.44, 0); bx(g, 0.12, 0.36, 0.08, steel, 0, 0.21, -0.45); bx(g, 0.12, 0.36, 0.08, steel, 0, 0.21, 0.45); bx(g, 0.52, 0.05, 0.08, steel, 0, 0.03, -0.45); bx(g, 0.52, 0.05, 0.08, steel, 0, 0.03, 0.45);
    benches.push(g); }
  D.benchTop = 0.485;
  const box = (w, h, d, c, x, y, z, ry) => { const b = bx(root, w, h, d, lam({ map: crisp(64, 64, (g2) => { g2.fillStyle = c; g2.fillRect(0, 0, 64, 64); g2.fillStyle = 'rgba(0,0,0,.25)'; g2.fillRect(0, 0, 64, 3); g2.fillRect(0, 61, 64, 3); g2.fillStyle = '#ffffff'; g2.font = '900 22px Inter'; g2.textAlign = 'center'; g2.fillText(`${Math.round(h * 100 / 2.54)}"`, 32, 40); }) }), x, y, z); b.rotation.y = ry; return b; };
  box(0.75, 0.6, 0.6, '#2a5ad8', 3.0, 0.3, -0.4, 0.2); box(0.75, 0.5, 0.6, '#d8333a', 3.05, 0.85, -0.42, 0.1); box(0.75, 0.3, 0.6, '#1c1c22', 3.0, 1.25, -0.4, 0.3);
  { const rk = new THREE.Group(); rk.position.set(2.6, 0, 2.7); rk.rotation.y = -0.2; root.add(rk); bx(rk, 1.4, 0.04, 0.4, steel, 0, 0.5, 0); bx(rk, 1.4, 0.04, 0.4, steel, 0, 0.95, 0); for (const x of [-0.68, 0.68]) bx(rk, 0.04, 1.0, 0.4, steel, x, 0.5, 0);
    for (let t2 = 0; t2 < 2; t2++) for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), toon([0x3a3a40, 0x8a2a2a, 0x2a4a8a, 0x5a3a7a][(i + t2) % 4])); b.position.set(-0.5 + i * 0.33, 0.66 + t2 * 0.45, 0); b.castShadow = true; rk.add(b); } }
  const bag = new THREE.Group(); bag.position.set(-3.4, 0, 2.3); root.add(bag);
  { const chain = cyl(bag, 0.01, 0.01, 1.6, steelLt, 0, 4.4, 0, 6); void chain; const b = cyl(bag, 0.2, 0.2, 1.1, toon(0x8a1c2a, 0x140408), 0, 3.05, 0, 16); void b; cyl(bag, 0.205, 0.205, 0.08, toon(0x1c1c20), 0, 3.5, 0, 16); }
  bag.children.forEach((c) => (c.position.y -= 1.3));
  { const ch = new THREE.Group(); ch.position.set(1.35, 0, -3.2); root.add(ch); cyl(ch, 0.035, 0.035, 0.9, steel, 0, 0.45, 0, 8); cyl(ch, 0.2, 0.2, 0.03, steel, 0, 0.015, 0, 14);
    cyl(ch, 0.19, 0.15, 0.14, toon(0x3a3a40), 0, 0.97, 0, 16); cyl(ch, 0.17, 0.17, 0.02, toon(0xf4f4f4), 0, 1.035, 0, 16, false); }
  { const ws = new THREE.Group(); ws.position.set(-6.45, 0, 3.2); ws.rotation.y = PI / 2; root.add(ws); bx(ws, 0.5, 0.7, 0.3, toon(0xe8e8ec), 0, 1.05, 0.15);
    plane(ws, 0.48, 0.3, lam({ map: sign(320, 200, '#2a5ad8', [['WIPE', '#ffffff', 64, 70], ['IT DOWN', '#ffffff', 50, 140]]) }), 0, 1.15, 0.305); cyl(ws, 0.05, 0.05, 0.22, toon(0x2a9a4a), 0.12, 1.5, 0.15, 10); }
  // the cable stack under the mezzanine
  { const cs = new THREE.Group(); cs.position.set(4.3, 0, -5.4); root.add(cs); for (const x of [-0.5, 0.5]) bx(cs, 0.1, 2.4, 0.1, steel, x, 1.2, 0); bx(cs, 1.1, 0.1, 0.4, steel, 0, 2.45, 0);
    for (let i = 0; i < 14; i++) bx(cs, 0.36, 0.05, 0.2, toon(0x1c1c20), 0, 0.15 + i * 0.055, 0.0); cyl(cs, 0.01, 0.01, 1.3, steelLt, 0, 1.6, 0.1, 6); cyl(cs, 0.08, 0.08, 0.04, steelLt, 0, 2.38, 0.12, 12).rotation.x = PI / 2; }

  // ---------------------------------------------------------------- mezzanine + stairs (right side)
  const deckM = toon(0x3a3d46, 0x0a0a0e), railM = toon(0x9aa0aa, 0x141418);
  const MZ = { x0: 2.9, x1: 6.6, z0: -6.5, z1: -1.4 };
  bx(root, MZ.x1 - MZ.x0, 0.2, MZ.z1 - MZ.z0, deckM, (MZ.x0 + MZ.x1) / 2, D.deckY - 0.1, (MZ.z0 + MZ.z1) / 2);
  for (const [x, z] of [[MZ.x0 + 0.1, MZ.z1 - 0.1], [MZ.x0 + 0.1, -4.0]]) bx(root, 0.16, D.deckY - 0.2, 0.16, steel, x, (D.deckY - 0.2) / 2, z);
  // the deck edge railing (posts + two rails) along x = x0 and z = z1 (leaving the stair opening at x 5.3…6.3)
  const rail = (a, b, y) => { const d = b.clone().sub(a), L = d.length(), m = cyl(root, 0.022, 0.022, L, railM, 0, 0, 0, 8, false); m.position.copy(a.clone().add(b).multiplyScalar(0.5)).setY(y); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return m; };
  for (const y of [D.deckY + 0.5, D.deckY + 1.02]) { rail(V(MZ.x0, 0, MZ.z0), V(MZ.x0, 0, MZ.z1), y); rail(V(MZ.x0, 0, MZ.z1), V(D.stairs.x0, 0, MZ.z1), y); }
  for (let z = MZ.z0 + 0.4; z <= MZ.z1; z += 1.0) bx(root, 0.04, 1.04, 0.04, railM, MZ.x0, D.deckY + 0.52, z, false);
  for (let x = MZ.x0; x <= D.stairs.x0; x += 0.8) bx(root, 0.04, 1.04, 0.04, railM, x, D.deckY + 0.52, MZ.z1, false);
  const plateT = pixelTex(8, 8, (g, w, h) => { g.fillStyle = '#7a808c'; g.fillRect(0, 0, w, h); g.fillStyle = '#9aa0ac'; g.fillRect(1, 1, 2, 1); g.fillRect(5, 5, 2, 1); g.fillStyle = '#5a606c'; g.fillRect(1, 2, 2, 1); g.fillRect(5, 6, 2, 1); }, { k: 1, repeat: [4, 1] });
  const stepM = new THREE.MeshToonMaterial({ map: plateT, emissive: 0x0c0c10 }), S = D.stairs, run = (S.z0 - S.z1) / S.n, rise = D.deckY / S.n;
  for (let i = 0; i < S.n; i++) { bx(root, S.x1 - S.x0, 0.05, run + 0.04, stepM, (S.x0 + S.x1) / 2, D.stepY(i) - 0.025, D.stepZ(i)); bx(root, S.x1 - S.x0, 0.03, 0.03, toon(0xffd43b), (S.x0 + S.x1) / 2, D.stepY(i) - 0.012, D.stepZ(i) + run / 2); }
  // stringers (the slanted side beams) + the inner handrail
  { const L = Math.hypot(S.z0 - S.z1, D.deckY), ang = Math.atan2(D.deckY, S.z0 - S.z1);
    for (const x of [S.x0 - 0.04, S.x1 + 0.02]) { const s = bx(root, 0.06, 0.26, L, steel, x, D.deckY / 2 - 0.08, (S.z0 + S.z1) / 2); s.rotation.x = ang; }
    const hr0 = V(S.x0 - 0.05, 0.95, S.z0 + 0.1), hr1 = V(S.x0 - 0.05, D.deckY + 0.95, S.z1);
    const h = rail(hr0, hr1, 0); h.position.copy(hr0.clone().add(hr1).multiplyScalar(0.5));
    for (let i = 1; i < S.n; i += 3) bx(root, 0.035, 0.95, 0.035, railM, S.x0 - 0.05, D.stepY(i) + 0.47, D.stepZ(i), false);
    D.rail = { a: hr0.toArray(), b: hr1.toArray() }; }
  // three treadmills on the deck facing the right wall's high windows (+x), consoles glowing
  const belts = [];
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(4.7, D.deckY, -5.9 + i * 1.3); g.rotation.y = PI / 2; root.add(g);
    bx(g, 0.75, 0.18, 1.8, toon(0x2a2d33), 0, 0.09, 0); const bt = pixelTex(4, 16, (c, w, h) => { c.fillStyle = '#18181c'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a30'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1); }, { k: 1, repeat: [1, 4] });
    bt.wrapT = THREE.RepeatWrapping; plane(g, 0.55, 1.6, lam({ map: bt }), 0, 0.185, 0, 0, -PI / 2); belts.push(bt);
    for (const x of [-0.36, 0.36]) { const up = bx(g, 0.05, 1.3, 0.05, steel, x, 0.75, 0.8); up.rotation.x = -0.2; }
    bx(g, 0.8, 0.32, 0.12, toon(0x2a2d33), 0, 1.38, 0.95).rotation.x = -0.5;
    plane(g, 0.44, 0.2, basic({ map: sign(220, 100, '#0a2a3a', [['6.2 MPH', '#7ce8ff', 34, 50, '800']]) }), 0, 1.4, 0.88, PI, 0.5); }
  // high windows on the right wall above the deck + the front windows (night ↔ morning)
  const nightT = crisp(1024, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#070a1c'); gr.addColorStop(0.7, '#1a1f40'); gr.addColorStop(1, '#2a2440'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const bw = 30 + hash(i) * 60, bh = 80 + hash(i + 3) * 200, x = i * 40 + hash(i + 7) * 20; g.fillStyle = '#0c0e1c'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,214,140,.85)'; for (let k = 0; k < 18; k++) if (hash(i * 31 + k) > 0.55) g.fillRect(x + 4 + (k % 3) * (bw / 3), h - bh + 10 + Math.floor(k / 3) * 18, 6, 8); }
    g.fillStyle = '#f4f0e0'; g.beginPath(); g.arc(860, 70, 26, 0, 7); g.fill(); g.fillStyle = '#1a1f40'; g.beginPath(); g.arc(872, 62, 24, 0, 7); g.fill(); });
  const mornT = crisp(1024, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ab8e8'); gr.addColorStop(0.55, '#f8d8b0'); gr.addColorStop(1, '#f0b890'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,240,200,.9)'; g.beginPath(); g.arc(300, 250, 50, 0, 7); g.fill(); for (let i = 0; i < 26; i++) { const bw = 30 + hash(i) * 60, bh = 80 + hash(i + 3) * 200, x = i * 40 + hash(i + 7) * 20; g.fillStyle = '#7a7890'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 12; k++) g.fillRect(x + 4 + (k % 3) * (bw / 3), h - bh + 10 + Math.floor(k / 3) * 18, 6, 8); } });
  const winM = basic({ map: nightT }), frameM = toon(0x1a1a1e);
  plane(root, 6.0, 1.6, winM, 6.57, 4.0, -3.9, -PI / 2);
  for (let i = 0; i <= 4; i++) bx(root, 0.06, 1.7, 0.06, frameM, 6.52, 4.0, -6.9 + i * 1.5, false);
  plane(root, 13.0, 3.0, winM, 0, 1.75, 4.98, PI);
  for (let i = 0; i <= 8; i++) bx(root, 0.08, 3.1, 0.08, frameM, -6.4 + i * 1.6, 1.75, 4.92, false);
  bx(root, 13.0, 0.1, 0.1, frameM, 0, 3.25, 4.92, false); bx(root, 13.0, 1.95, 0.1, lam({ map: brickT('#33303a', '#1e1c24', [12, 2]) }), 0, 4.25, 4.97, false);
  plane(root, 1.6, 0.6, basic({ map: neonTex(640, 240, 'OPEN 24/7', '#7ce8ff', 110), transparent: true, depthWrite: false }), 3.6, 2.7, 4.9, PI);
  // the front desk (faces −z, toward the floor): counter, neon IRON MOON, made-up tubs, shakers, towels, a tablet, bananas
  const DK = D.desk, desk = new THREE.Group(); desk.position.set(DK.x, 0, DK.z); root.add(desk);
  bx(desk, 2.8, 1.05, 0.7, toon(0x1c1c22), 0, 0.525, 0); bx(desk, 2.9, 0.05, 0.8, toon(0x5a3a7a), 0, 1.075, 0);
  plane(desk, 2.4, 0.42, basic({ map: neonTex(1024, 180, 'IRON MOON', '#ff4fa3', 120, '900'), transparent: true, depthWrite: false }), 0, 0.62, -0.356, PI);
  const TUBS = [['GRRR', '#d8333a'], ['KAPOW', '#ffd43b'], ['MOONDUST', '#b06aff'], ['GRRR', '#d8333a'], ['KAPOW', '#ffd43b'], ['MOONDUST', '#b06aff']];
  const tubTex = {}; for (const [n, c] of TUBS) tubTex[n] ??= crisp(256, 128, (g) => { g.fillStyle = '#16161a'; g.fillRect(0, 0, 256, 128); g.fillStyle = c; g.fillRect(0, 30, 256, 68); g.fillStyle = '#16161a'; g.font = `900 ${n.length > 6 ? 30 : 42}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 64, 64); g.fillText(n, 192, 64); });
  bx(desk, 2.6, 0.04, 0.3, steel, 0, 1.55, 0.55); bx(desk, 2.6, 0.04, 0.3, steel, 0, 1.95, 0.55); bx(desk, 2.6, 2.1, 0.06, toon(0x24242a), 0, 1.05, 0.72);
  TUBS.forEach(([n], i) => { for (const sy of [1.57, 1.97]) { const tb = cyl(desk, 0.09, 0.09, 0.24, new THREE.MeshToonMaterial({ map: tubTex[n] }), -1.1 + i * 0.44 + (sy > 1.8 ? 0.2 : 0), sy + 0.12, 0.55, 16); tb.rotation.y = PI + 0.4 * hash(i); cyl(desk, 0.092, 0.092, 0.04, toon(0x16161a), tb.position.x, sy + 0.26, 0.55, 16, false); } });
  for (let i = 0; i < 4; i++) { const sh = cyl(desk, 0.042, 0.042, 0.19, toon([0xff4fa3, 0x2a5ad8, 0x7cf05f, 0xf4f4f4][i], 0x101010), 0.55 + i * 0.12, 1.195, -0.12, 14); void sh; cyl(desk, 0.044, 0.044, 0.04, toon(0x16161a), 0.55 + i * 0.12, 1.31, -0.12, 14, false); }
  for (let i = 0; i < 5; i++) bx(desk, 0.36, 0.06, 0.26, toon(i % 2 ? 0xf4f4f4 : 0xe8e2f2), -1.0, 1.13 + i * 0.062, -0.05, false);
  bx(desk, 0.3, 0.02, 0.22, toon(0x16161a), -0.2, 1.11, 0.0).rotation.x = -0.3;
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.14, 4, 8), toon(0xf4d43b)); b.position.set(0.0 + i * 0.05, 1.13, -0.2); b.rotation.set(PI / 2, 0, 0.6 + i * 0.3); desk.add(b); }
  // a water fountain + a fan on the left wall, speakers in the corners
  { const wf = new THREE.Group(); wf.position.set(-6.45, 0, 4.2); wf.rotation.y = PI / 2; root.add(wf); bx(wf, 0.5, 0.9, 0.35, toon(0xc8ccd4), 0, 0.85, 0.17); bx(wf, 0.4, 0.05, 0.3, toon(0x9aa0aa), 0, 1.31, 0.2); }
  const fan = new THREE.Group(); fan.position.set(-6.3, 3.2, -4.2); fan.rotation.y = PI / 2; root.add(fan);
  { cyl(fan, 0.36, 0.36, 0.05, toon(0x2a2d33), 0, 0, 0.0, 20).rotation.x = PI / 2; }
  const blades = new THREE.Group(); blades.position.z = 0.06; fan.add(blades); for (let i = 0; i < 3; i++) { const b = bx(blades, 0.1, 0.3, 0.01, toon(0x5a5f68), 0, 0.16, 0, false); b.position.set(Math.sin(i * 2.09) * 0.16, Math.cos(i * 2.09) * 0.16, 0); b.rotation.z = -i * 2.09; }
  for (const x of [-6.2, 6.2]) bx(root, 0.4, 0.6, 0.35, toon(0x16161a), x, 4.3, -6.2);

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0xf6f2f6, 0x4a4048, 1.25); root.add(hemi);
  const ceil = [];
  for (const [x, z] of [[-3.6, -4.4], [0, -4.4], [3.6, -4.4], [-3.6, -0.6], [0, -0.6], [3.6, -0.6], [-1.8, 2.8], [1.8, 2.8]]) { const L = new THREE.PointLight(0xfff6f0, 1.45, 7.5, 1.5); L.position.set(x, 4.0, z); root.add(L); ceil.push(L); }
  const key = new THREE.DirectionalLight(0xfff0e8, 0.65); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 26 }); root.add(key, key.target);
  const sun = new THREE.DirectionalLight(0xffe0b8, 0); sun.position.set(-2, 6, 14); sun.target.position.set(0, 1, -3); root.add(sun, sun.target);
  scene.background = new THREE.Color(0x0a0a10);
  const fog = new THREE.Fog(0x0e0c16, 14, 40); scene.fog = fog;

  let mode = 'night';
  function setMode(m) { if (m === mode) return; mode = m;
    winM.map = m === 'morning' ? mornT : nightT; winM.needsUpdate = true;
    hemi.color.set(m === 'morning' ? 0xfff4ea : 0xf6f2f6); hemi.groundColor.set(m === 'morning' ? 0x6a5a50 : 0x4a4048); hemi.intensity = m === 'morning' ? 1.25 : 1.25;
    ceil.forEach((L) => (L.intensity = m === 'morning' ? 0.95 : 1.45)); sun.intensity = m === 'morning' ? 0.45 : 0;
    fog.color.set(m === 'morning' ? 0x2a2630 : 0x0e0c16); }
  function update(t) { belts.forEach((b, i) => (b.offset.y = -t * (1.6 + i * 0.3))); blades.rotation.z = -t * 9; bag.rotation.z = Math.sin(t * 1.3) * 0.02; }
  setClock(19, 0);
  return { root, D, racks, benches, desk, key, sun, hemi, ceil, fog, setMode, setClock, update, legNeon, moonNeon, barbell };
}
