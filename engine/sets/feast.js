// Thanksgiving house (080 Vex explainer "what Thanksgiving dinner does to your body"): ONE open-plan ground floor built from boxes +
// crisp pixel textures (engine/pixeltex.js) so it reads under engine/pixel.js like 076's convenience store. Three areas along x:
//   DINING (x −3…3): a long table spread for 8 (roast turkey on a platter, mashed potatoes + butter, gravy boat, stuffing, cranberry
//            sauce with its can ridges, green bean casserole, sweet potatoes with marshmallows, a roll basket, pumpkin + apple lattice
//            pies, taper candles, a gourd centrepiece on a plaid runner), 8 chairs, a chandelier, a sideboard with more pies, a
//            GIVE THANKS pennant banner, two windows onto a dusk street (crossfade to night), framed pictures, a rug;
//   LOUNGE (x 3.4…8.6): a free-standing couch facing +z (gap behind it for a reverse shot), coffee table (chip bowl, a phone on a
//            little stand), a generic TV on a console showing an animated football game (no teams, no logos), a floor lamp, plant,
//            bookshelf, throw blanket, cushions;
//   KITCHEN (x −8.6…−3.4): a fridge you can film FROM INSIDE (door hinge group, lit shelves, generic jars/tubs/milk, a kid's hand-
//            turkey drawing + magnets on the door), counters + upper cabinets, stove with pots, microwave with a clock, sink under a
//            window, an island with the 2 AM leftovers (turkey carcass, tubs, half a pie, foil).
//   const F = buildFeast(studio);  F.root · F.D (spots) · F.setMode('dusk'|'night'|'late') · F.setFridge(open 0..1)
//   F.update(t) (TV game, candle flicker) · F.turkey {g, setCarved(0..1)} · F.plate {g, setHelping(0..2)} · F.phone {g, scr, W, H}
//   F.family [{P, seat}] (voxel relatives) · F.uncle (voxel, on the couch) · makeDrumstick() → Group (origin = the grip, +y = meat end)
// Coordinates: y up; the back wall is z −2.9 and the front wall z 3.4; Vex's table spot is D.vex.table (facing +z, camera side).
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';
import { makeVoxPerson } from '../voxel/index.js';

const PI = Math.PI;
export const D = {
  room: { x0: -8.6, x1: 8.6, z0: -2.9, z1: 3.4, h: 2.75 },
  table: { x: 0, z: -0.6, w: 2.7, d: 1.1, y: 0.76 },
  couch: { x: 6.1, z: -0.95, seatY: 0.44 },
  tv: { x: 6.1, z: 1.95, y: 0.95 },
  fridge: { x: -5.2, z: -2.5, front: -2.12, w: 0.92, h: 1.86 },
  island: { x: -5.2, z: -0.25, y: 0.92 },
  vex: { table: { x: 0, z: 0.42 }, lounge: { x: 5.12, z: -0.1 }, island: { x: -5.2, z: 0.55 }, fridge: { x: -5.2, z: -1.32 } },
};

const lam = (o) => new THREE.MeshLambertMaterial(o);
const toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
const basic = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
const bx = (p, w, h, d, m, x, y, z, sh = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (sh) o.castShadow = o.receiveShadow = true; p.add(o); return o; };
const cy = (p, rt, rb, h, m, x, y, z, seg = 16) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
const sp = (p, r, m, x, y, z, sx = 1, sy = 1, sz = 1, seg = 12) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg >> 1)), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; p.add(o); return o; };
const plane = (p, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0, 'YXZ'); p.add(o); return o; };
const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** the held drumstick: origin = the grip (radius ≈ 0.027 there), +y = toward the meat; the bone + knob stick out below the fist */
export function makeDrumstick({ bite = false } = {}) {
  const g = new THREE.Group();
  const prof = [[0.0, -0.035], [0.024, -0.034], [0.027, -0.01], [0.031, 0.03], [0.042, 0.075], [0.047, 0.11], [0.043, 0.14], [0.03, 0.165], [0.012, 0.178], [0.0, 0.18]].map(([r, y]) => new THREE.Vector2(r, y));
  const meat = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), toon(0xb8662a, 0x1a0800)); meat.castShadow = true; g.add(meat);
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), toon(0x8a4418)); s.position.set(Math.cos(i * 1.9) * 0.04, 0.06 + i * 0.022, Math.sin(i * 1.9) * 0.04); s.scale.set(1, 0.5, 1); g.add(s); }   // crispy skin spots
  const bone = toon(0xf2ead8); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.075, 10), bone); b.position.y = -0.065; g.add(b);
  for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 8), bone); k.position.set(s * 0.008, -0.105, 0); g.add(k); }
  if (bite) { const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), toon(0xf0d6b8)); m2.position.set(0.034, 0.13, 0); m2.scale.set(0.6, 1, 1); g.add(m2); }
  return g;
}

/** a roast turkey on a platter; setCarved(0..1) = the 2 AM carcass (drumsticks + breast gone, ribs showing) */
export function makeTurkey() {
  const g = new THREE.Group(), skin = toon(0xc0702e, 0x200a00), dark = toon(0x9a5220);
  const platter = cy(g, 0.36, 0.3, 0.025, toon(0xf4f1ea), 0, 0.0125, 0, 28); platter.scale.z = 0.72;
  const lettuce = toon(0x5aa04a); for (let i = 0; i < 14; i++) { const a = i / 14 * 2 * PI; sp(g, 0.05, lettuce, Math.cos(a) * 0.29, 0.035, Math.sin(a) * 0.2, 1, 0.45, 1, 8); }
  const orange = toon(0xffa030); for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * PI + 0.3; const o = cy(g, 0.032, 0.032, 0.012, orange, Math.cos(a) * 0.31, 0.05, Math.sin(a) * 0.22, 12); o.rotation.z = 0.5; }
  const red = toon(0xc0182a); for (let i = 0; i < 18; i++) { const a = hash(i) * 2 * PI, r = 0.24 + hash(i + 3) * 0.06; sp(g, 0.012, red, Math.cos(a) * r, 0.04, Math.sin(a) * r * 0.72, 1, 1, 1, 6); }
  const body = new THREE.Group(); body.position.y = 0.025; g.add(body);
  const breast = sp(body, 0.2, skin, 0, 0.12, 0, 1.18, 0.78, 0.95, 20);
  sp(body, 0.06, skin, 0, 0.2, 0.0, 2.6, 0.5, 1.4, 12);                 // the breastbone ridge
  const legs = []; for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(0.12, 0.1, s * 0.15); leg.rotation.set(-s * 0.35, 0, -0.95); body.add(leg);
    sp(leg, 0.075, skin, 0, 0.0, 0, 1, 1.5, 1, 12); const bn = cy(leg, 0.014, 0.014, 0.08, toon(0xf2ead8), 0, 0.13, 0, 8); void bn;
    sp(leg, 0.018, toon(0xf2ead8), 0.006, 0.175, 0, 1, 1, 1, 8); legs.push(leg); }
  for (const s of [-1, 1]) sp(body, 0.07, dark, -0.1, 0.1, s * 0.17, 1.3, 0.6, 0.6, 10);       // wings tucked
  const ribs = new THREE.Group(); ribs.position.set(0, 0.12, 0); body.add(ribs); ribs.visible = false;
  const bone = toon(0xeee4cc); for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 5, 14, PI * 0.9), bone); r.position.x = -0.15 + i * 0.06; r.rotation.y = PI / 2; r.rotation.z = PI * 0.05; ribs.add(r); }
  const setCarved = (k) => { legs.forEach((l) => (l.visible = k < 0.5)); breast.scale.set(1.18 - 0.35 * k, 0.78 - 0.4 * k, 0.95 - 0.3 * k); ribs.visible = k >= 0.5; breast.material = k >= 0.5 ? dark : skin; };
  return { g, setCarved, legs };
}

export function buildFeast(studio, { family = true } = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const R = D.room, T = D.table;
  // ---------------------------------------------------------------- shell: plank floor, wallpaper + wainscot, ceiling, front + back walls
  const floorT = pixelTex(32, 16, (g, w, h) => { g.fillStyle = '#9a6a40'; g.fillRect(0, 0, w, h); const c = ['#8e6038', '#a87448', '#946640', '#a06c42'];
    for (let r = 0; r < 4; r++) { g.fillStyle = c[r]; g.fillRect(0, r * 4, w, 3); g.fillStyle = '#6a4626'; g.fillRect(0, r * 4 + 3, w, 1); g.fillRect(((r * 13) % 28) + 2, r * 4, 1, 3); } }, { k: 1, repeat: [17, 13] });
  const floor = plane(root, R.x1 - R.x0, R.z1 - R.z0, lam({ map: floorT }), 0, 0, (R.z0 + R.z1) / 2, 0, -PI / 2); floor.receiveShadow = true;
  plane(root, R.x1 - R.x0, R.z1 - R.z0, lam({ color: 0xf2ece0 }), 0, R.h, (R.z0 + R.z1) / 2, 0, PI / 2);
  const paperT = (a, b) => pixelTex(16, 16, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; g.fillRect(3, 0, 2, h); g.fillRect(11, 0, 1, h); g.fillRect(7, 5, 1, 1); g.fillRect(7, 12, 1, 1); }, { k: 1, repeat: [40, 6] });
  const wallM = lam({ map: paperT('#efd9b0', '#e2c494') }), kitWallM = lam({ color: 0xe9e2d2 });
  const wains = toon(0xf6f2ea), trim = toon(0xe8e0d0);
  const wall = (x0, x1, z, ry, m) => { const w = x1 - x0; plane(root, w, R.h, m, (x0 + x1) / 2, R.h / 2, z, ry); };
  wall(-3.4, R.x1, R.z0 + 0.001, 0, wallM); wall(R.x0, -3.4, R.z0 + 0.001, 0, kitWallM);
  wall(R.x0, R.x1, R.z1 - 0.001, PI, wallM);
  plane(root, R.z1 - R.z0, R.h, kitWallM, R.x0 + 0.001, R.h / 2, (R.z0 + R.z1) / 2, PI / 2); plane(root, R.z1 - R.z0, R.h, wallM, R.x1 - 0.001, R.h / 2, (R.z0 + R.z1) / 2, -PI / 2);
  for (const [x0, x1] of [[-3.4, R.x1]]) { bx(root, x1 - x0, 0.9, 0.04, wains, (x0 + x1) / 2, 0.45, R.z0 + 0.02, false); bx(root, x1 - x0, 0.05, 0.06, trim, (x0 + x1) / 2, 0.92, R.z0 + 0.03, false); }
  bx(root, R.x1 - R.x0, 0.9, 0.04, wains, 0, 0.45, R.z1 - 0.02, false); bx(root, R.x1 - R.x0, 0.05, 0.06, trim, 0, 0.92, R.z1 - 0.03, false);
  bx(root, R.x1 - R.x0, 0.12, 0.05, trim, 0, R.h - 0.06, R.z0 + 0.03, false); bx(root, R.x1 - R.x0, 0.12, 0.05, trim, 0, R.h - 0.06, R.z1 - 0.03, false);
  // ---------------------------------------------------------------- windows (dusk ↔ night views crossfade in setMode)
  const skyTex = (night) => crisp(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h * 0.72);
    if (night) { gr.addColorStop(0, '#070a1c'); gr.addColorStop(1, '#141a3a'); } else { gr.addColorStop(0, '#3a2a6a'); gr.addColorStop(0.45, '#b85a7a'); gr.addColorStop(0.8, '#ffa858'); gr.addColorStop(1, '#ffd08a'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (night) { g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(hash(i) * w, hash(i + 9) * h * 0.6, 2, 2); g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(196, 52, 16, 0, 7); g.fill(); }
    g.fillStyle = night ? '#0a0c16' : '#3a2438'; g.fillRect(0, h * 0.7, w, h * 0.3);                               // neighbour houses
    for (let i = 0; i < 4; i++) { const x = i * 70 - 10; g.beginPath(); g.moveTo(x, h * 0.72); g.lineTo(x + 30, h * 0.6); g.lineTo(x + 60, h * 0.72); g.fill(); g.fillRect(x, h * 0.71, 60, 60);
      g.fillStyle = night ? '#ffcf6a' : '#ffd890'; g.fillRect(x + 12, h * 0.78, 10, 10); g.fillRect(x + 38, h * 0.78, 10, 10); g.fillStyle = night ? '#0a0c16' : '#3a2438'; }
    g.strokeStyle = night ? '#05060c' : '#2a1a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, h); g.lineTo(52, h * 0.3); g.moveTo(50, h * 0.5); g.lineTo(20, h * 0.25); g.moveTo(52, h * 0.38); g.lineTo(90, h * 0.15); g.moveTo(51, h * 0.42); g.lineTo(70, h * 0.3); g.stroke(); });
  const skyDusk = skyTex(false), skyNight = skyTex(true);
  const winMats = [];
  const windowAt = (x, z, ry, w = 1.1, h = 1.3, y = 1.5) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    const m = basic({ map: skyDusk }); winMats.push(m); plane(g, w, h, m, 0, y, 0.005);
    const fr = toon(0xf6f2ea); bx(g, w + 0.12, 0.07, 0.09, fr, 0, y + h / 2, 0.04, false); bx(g, w + 0.18, 0.06, 0.16, fr, 0, y - h / 2 - 0.02, 0.07, false);
    bx(g, 0.06, h, 0.09, fr, -w / 2, y, 0.04, false); bx(g, 0.06, h, 0.09, fr, w / 2, y, 0.04, false); bx(g, 0.04, h, 0.06, fr, 0, y, 0.04, false); bx(g, w, 0.04, 0.06, fr, 0, y + 0.1, 0.04, false);
    const cur = toon(0x8a2a2a); for (const s of [-1, 1]) { const c = bx(g, 0.32, h + 0.5, 0.06, cur, s * (w / 2 + 0.2), y - 0.12, 0.08); c.castShadow = false; }
    bx(g, w + 1.0, 0.04, 0.04, toon(0x5a3a22), 0, y + h / 2 + 0.2, 0.12, false); return g; };
  windowAt(-1.55, R.z0, 0); windowAt(1.55, R.z0, 0); windowAt(-7.6, R.z0, 0, 1.0, 0.9, 1.65); windowAt(3.0, R.z1, PI); windowAt(6.1, R.z1, PI); windowAt(-6.4, R.z1, PI); windowAt(-2.6, R.z1, PI, 0.9, 1.2, 1.5);
  // ---------------------------------------------------------------- the dining table
  const tbl = new THREE.Group(); tbl.position.set(T.x, 0, T.z); root.add(tbl);
  const wood = toon(0x6a3a1e), woodL = toon(0x8a5028);
  bx(tbl, T.w, 0.05, T.d, wood, 0, T.y - 0.025, 0); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(tbl, 0.07, T.y - 0.05, 0.07, wood, x * (T.w / 2 - 0.1), (T.y - 0.05) / 2, z * (T.d / 2 - 0.1));
  const cloth = plane(tbl, T.w + 0.2, T.d + 0.2, lam({ color: 0xf6f0e2 }), 0, T.y + 0.002, 0, 0, -PI / 2); cloth.receiveShadow = true;
  for (const s of [-1, 1]) { const sk = plane(tbl, T.w + 0.2, 0.22, lam({ color: 0xf0e8d6, side: THREE.DoubleSide }), 0, T.y - 0.11, s * (T.d / 2 + 0.1), 0); sk.receiveShadow = true; }
  for (const s of [-1, 1]) plane(tbl, T.d + 0.2, 0.22, lam({ color: 0xf0e8d6, side: THREE.DoubleSide }), s * (T.w / 2 + 0.1), T.y - 0.11, 0, PI / 2);
  const plaid = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#c0582a'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a3418'; g.fillRect(0, 6, w, 3); g.fillRect(6, 0, 3, h); g.fillStyle = '#e8a040'; g.fillRect(0, 12, w, 1); g.fillRect(12, 0, 1, h); }, { k: 1, repeat: [12, 2] });
  plane(tbl, T.w + 0.1, 0.36, lam({ map: plaid }), 0, T.y + 0.004, 0, 0, -PI / 2).receiveShadow = true;
  // place settings: 3 on each long side + 1 at each end
  const SEATS = [[-0.85, -1], [0, -1], [0.85, -1], [-0.85, 1], [0, 1], [0.85, 1], [-1, 0, 'end'], [1, 0, 'end']].map(([x, s, e]) => (e ? { x: x * (T.w / 2 - 0.18), z: 0, end: x } : { x, z: s * (T.d / 2 - 0.17), side: s }));
  const china = toon(0xfbf8f0), rim = toon(0xc8a04a), glassM = new THREE.MeshToonMaterial({ color: 0xd8ecff, transparent: true, opacity: 0.55 }), silver = toon(0xc8ccd4);
  const settings = SEATS.map((S, i) => { const g = new THREE.Group(); g.position.set(S.x, T.y + 0.006, S.z); if (S.end) g.rotation.y = S.end > 0 ? -PI / 2 : PI / 2; else if (S.side < 0) g.rotation.y = PI; tbl.add(g);
    cy(g, 0.135, 0.12, 0.016, rim, 0, 0.008, 0, 24); cy(g, 0.12, 0.1, 0.018, china, 0, 0.012, 0, 24);
    bx(g, 0.02, 0.006, 0.17, silver, -0.17, 0.004, 0, false); bx(g, 0.016, 0.006, 0.19, silver, 0.17, 0.004, 0, false);
    const gl = cy(g, 0.035, 0.03, 0.12, glassM, 0.17, 0.06, -0.17, 12); gl.castShadow = false;
    bx(g, 0.12, 0.012, 0.12, toon(0xb0402a), -0.2, 0.004, 0.08, false);
    return g; });
  // the food (big dishes along the middle)
  const turkey = makeTurkey(); turkey.g.position.set(0, T.y + 0.005, 0); turkey.g.rotation.y = 0.2; tbl.add(turkey.g);
  const bowl = (x, z, r, c, fill, top) => { const g = new THREE.Group(); g.position.set(x, T.y, z); tbl.add(g); cy(g, r, r * 0.7, r * 0.75, toon(c), 0, r * 0.375, 0, 20);
    const f = sp(g, r * 0.92, toon(fill), 0, r * 0.72, 0, 1, 0.42, 1, 16); if (top) top(g, r); return g; };
  bowl(-0.62, -0.08, 0.13, 0xf4f1ea, 0xfaf4e2, (g, r) => { bx(g, 0.05, 0.02, 0.05, toon(0xffe070), 0.02, r * 1.12, 0, false); sp(g, 0.03, toon(0xc8a060), -0.05, r * 1.05, 0.03, 1, 0.3, 1, 8); });   // mashed potatoes + butter
  bowl(0.62, 0.1, 0.12, 0x2a5a8a, 0x8a5a2a, (g, r) => { for (let i = 0; i < 16; i++) bx(g, 0.03, 0.03, 0.03, toon(i % 3 ? 0x9a6630 : 0x6a8a3a), (hash(i) - 0.5) * r * 1.2, r * 0.95 + hash(i + 5) * 0.02, (hash(i + 2) - 0.5) * r * 1.2, false); });   // stuffing
  { const g = new THREE.Group(); g.position.set(-0.32, T.y, 0.28); tbl.add(g); cy(g, 0.09, 0.09, 0.012, china, 0, 0.006, 0, 18);   // cranberry sauce with the can ridges
    const c = cy(g, 0.042, 0.042, 0.1, toon(0xa0102a, 0x300008), 0, 0.06, 0, 18); void c; for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.003, 4, 18), toon(0x80081e)); r.rotation.x = PI / 2; r.position.y = 0.03 + i * 0.03; g.add(r); } }
  { const g = new THREE.Group(); g.position.set(0.36, T.y, -0.28); tbl.add(g); const d = bx(g, 0.32, 0.06, 0.22, toon(0xf4f1ea), 0, 0.03, 0); void d;   // green bean casserole
    bx(g, 0.29, 0.02, 0.19, toon(0x5a8a3a), 0, 0.06, 0, false); for (let i = 0; i < 18; i++) bx(g, 0.03, 0.012, 0.015, toon(0xd89a3a), (hash(i) - 0.5) * 0.26, 0.075, (hash(i + 4) - 0.5) * 0.16, false); }
  { const g = new THREE.Group(); g.position.set(-0.98, T.y, 0.22); tbl.add(g); bx(g, 0.28, 0.06, 0.2, toon(0xf4f1ea), 0, 0.03, 0);   // sweet potatoes + marshmallows
    bx(g, 0.25, 0.02, 0.17, toon(0xe8782a), 0, 0.06, 0, false); for (let i = 0; i < 14; i++) sp(g, 0.016, toon(0xfff4e0), (hash(i + 7) - 0.5) * 0.22, 0.075, (hash(i + 1) - 0.5) * 0.14, 1, 0.8, 1, 6); }
  { const g = new THREE.Group(); g.position.set(0.98, T.y, -0.18); tbl.add(g); cy(g, 0.13, 0.1, 0.07, toon(0x8a5a2a), 0, 0.035, 0, 14);   // roll basket
    for (let i = 0; i < 7; i++) sp(g, 0.04, toon(0xd8a050), Math.cos(i) * 0.06 * (i ? 1 : 0), 0.085 + (i ? 0 : 0.02), Math.sin(i) * 0.05 * (i ? 1 : 0), 1, 0.8, 1, 8); }
  { const g = new THREE.Group(); g.position.set(0.3, T.y, 0.3); tbl.add(g);   // gravy boat
    const b = sp(g, 0.06, china, 0, 0.04, 0, 1.6, 0.7, 1, 12); void b; sp(g, 0.05, toon(0x7a4a22), 0, 0.065, 0, 1.4, 0.15, 0.85, 10); bx(g, 0.04, 0.01, 0.015, china, 0.11, 0.07, 0, false); }
  const pie = (p, x, y, z, apple) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); cy(g, 0.13, 0.11, 0.035, toon(0xd89a50), 0, 0.018, 0, 22);
    if (apple) { cy(g, 0.12, 0.12, 0.012, toon(0xc8883a), 0, 0.04, 0, 22); for (let i = -2; i <= 2; i++) { bx(g, 0.022, 0.012, 0.22 - Math.abs(i) * 0.03, toon(0xe8b060), i * 0.045, 0.05, 0, false); bx(g, 0.22 - Math.abs(i) * 0.03, 0.012, 0.022, toon(0xe8b060), 0, 0.052, i * 0.045, false); } }
    else { cy(g, 0.115, 0.115, 0.012, toon(0xd8742a), 0, 0.04, 0, 22); sp(g, 0.025, toon(0xfffaf0), 0, 0.05, 0, 1.2, 0.6, 1.2, 8); } return g; };
  pie(tbl, -1.08, T.y, -0.24, false); pie(tbl, 1.12, T.y, 0.22, true);
  // candles + centrepiece (gourds and leaves) on the runner
  const flames = []; const flameM = basic({ color: 0xffd070, transparent: true, opacity: 0.95 });
  for (const x of [-0.42, 0.44]) { cy(tbl, 0.03, 0.035, 0.03, toon(0xc8a04a), x, T.y + 0.015, 0.0, 12); cy(tbl, 0.012, 0.012, 0.26, toon(0xfff4dc), x, T.y + 0.16, 0, 10);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), flameM); f.scale.set(1, 2.2, 1); f.position.set(x, T.y + 0.31, 0); tbl.add(f); flames.push(f); }
  const leafC = [0xd8582a, 0xe8a030, 0xa8321e, 0xc8781e];
  for (let i = 0; i < 16; i++) { const l = plane(tbl, 0.07, 0.05, basic({ color: leafC[i % 4], side: THREE.DoubleSide, toneMapped: true }), -0.75 + hash(i) * 1.5, T.y + 0.008 + i * 0.0003, (hash(i + 3) - 0.5) * 0.25, hash(i + 5) * 6, -PI / 2); void l; }
  for (const [x, z, r, c] of [[-0.18, 0.05, 0.05, 0xe8782a], [0.16, -0.07, 0.04, 0xf4e8c8], [-0.06, -0.1, 0.035, 0x5a8a3a], [0.24, 0.08, 0.035, 0xe8a030]]) { sp(tbl, r, toon(c), x - 0.62, T.y + r * 0.7, z + 0.4, 1, 0.8, 1, 10); }
  // chairs (pulled up to every seat), the occupied ones are where the family sits
  const chairM = toon(0x7a4422), cushion = toon(0xa83a2a);
  const chair = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    bx(g, 0.46, 0.05, 0.44, chairM, 0, 0.45, 0); bx(g, 0.42, 0.03, 0.4, cushion, 0, 0.485, 0, false);
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(g, 0.04, 0.45, 0.04, chairM, lx * 0.19, 0.225, lz * 0.18);
    bx(g, 0.46, 0.08, 0.04, chairM, 0, 1.0, -0.2); for (const s of [-1, 1]) bx(g, 0.05, 0.55, 0.04, chairM, s * 0.2, 0.74, -0.2); for (const s of [-0.08, 0.08]) bx(g, 0.035, 0.45, 0.03, chairM, s, 0.74, -0.2); return g; };
  const chairs = SEATS.map((S) => chair(T.x + S.x, T.z + (S.end ? 0 : S.side * (T.d / 2 + 0.28)), S.end ? (S.end > 0 ? -PI / 2 : PI / 2) : S.side < 0 ? 0 : PI));
  chairs.forEach((c, i) => { if (SEATS[i].end) c.position.x += SEATS[i].end * 0.42; });
  // the near side's chairs are pushed back toward the lens: move the middle one out of her spot
  chairs[4].visible = false; chairs[3].position.x -= 0.15; chairs[5].position.x += 0.15;
  // chandelier
  const chand = new THREE.Group(); chand.position.set(T.x, 2.15, T.z); root.add(chand);
  cy(chand, 0.008, 0.008, 0.6, toon(0x2a2018), 0, 0.3, 0, 6); const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 6, 24), toon(0x3a2a1a)); ringC.rotation.x = PI / 2; chand.add(ringC);
  const bulbM = basic({ color: 0xffe6b0 }); const bulbs = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * PI; const b = sp(chand, 0.035, bulbM, Math.cos(a) * 0.32, 0.05, Math.sin(a) * 0.32, 1, 1.3, 1, 8); b.castShadow = false; bulbs.push(b); }
  const chandL = new THREE.PointLight(0xffd8a0, 1.4, 5.5, 1.6); chandL.position.set(T.x, 1.95, T.z - 0.4); root.add(chandL);
  // sideboard with pies + pumpkins, the GIVE THANKS pennants, framed pictures, a rug
  const sb = new THREE.Group(); sb.position.set(0, 0, R.z0 + 0.3); root.add(sb);
  bx(sb, 1.7, 0.85, 0.45, toon(0x5a3018), 0, 0.425, 0); bx(sb, 1.76, 0.04, 0.5, toon(0x6a3a1e), 0, 0.87, 0);
  pie(sb, -0.5, 0.89, 0.02, false); pie(sb, 0.0, 0.89, 0.04, true); pie(sb, 0.5, 0.89, 0.0, false);
  for (const [x, r] of [[-0.78, 0.09], [0.78, 0.11]]) { sp(sb, r, toon(0xe8782a), x, 0.89 + r * 0.8, 0, 1, 0.8, 1, 12); cy(sb, 0.008, 0.01, 0.05, toon(0x4a6a2a), x, 0.89 + r * 1.55, 0, 6); }
  const letters = 'GIVE THANKS', penM = [0xd8582a, 0xe8a030, 0xa8321e];
  [...letters].forEach((ch, i) => { if (ch === ' ') return; const x = -1.6 + i * 0.32, y = 2.38 - Math.sin(i / (letters.length - 1) * PI) * 0.12;
    const tx = crisp(64, 80, (g, w, h) => { g.fillStyle = '#' + penM[i % 3].toString(16).padStart(6, '0'); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w / 2, h); g.closePath(); g.fill(); g.fillStyle = '#fff4dc'; g.font = '900 34px Inter, Arial'; g.textAlign = 'center'; g.fillText(ch, w / 2, 36); });
    plane(root, 0.26, 0.32, basic({ map: tx, transparent: true, alphaTest: 0.5, toneMapped: true }), x, y, R.z0 + 0.05); });
  const frame = (x, y, z, ry, w, h, draw) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; root.add(g); bx(g, w + 0.06, h + 0.06, 0.03, toon(0x3a2416), 0, 0, 0, false);
    plane(g, w, h, lam({ map: crisp(128, Math.round(128 * h / w), draw) }), 0, 0, 0.017); return g; };
  frame(-3.0, 1.65, R.z0 + 0.03, 0, 0.6, 0.45, (g, w, h) => { g.fillStyle = '#e8c890'; g.fillRect(0, 0, w, h); g.fillStyle = '#d87830'; g.beginPath(); g.arc(64, 60, 30, 0, 7); g.fill(); g.fillStyle = '#5a8a3a'; g.fillRect(60, 22, 8, 12); });
  frame(3.05, 1.7, R.z0 + 0.03, 0, 0.5, 0.62, (g, w, h) => { g.fillStyle = '#7aa0c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a7a3a'; g.fillRect(0, h * 0.6, w, h); g.fillStyle = '#c84a2a'; g.fillRect(40, h * 0.42, 48, 34); });
  frame(-2.25, 1.55, R.z1 - 0.03, PI, 0.7, 0.5, (g, w, h) => { g.fillStyle = '#f0e0c0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = ['#c86a3a', '#6a4a8a', '#3a6a8a', '#8a3a4a', '#4a8a5a'][i]; g.beginPath(); g.arc(18 + i * 23, 58, 9, 0, 7); g.fill(); g.fillRect(10 + i * 23, 66, 16, 22); } });
  const rug = pixelTex(32, 32, (g, w, h) => { g.fillStyle = '#7a2a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8883a'; g.fillRect(2, 2, w - 4, 1); g.fillRect(2, h - 3, w - 4, 1); g.fillRect(2, 2, 1, h - 4); g.fillRect(w - 3, 2, 1, h - 4); g.fillStyle = '#a84a2a'; for (let i = 0; i < 6; i++) g.fillRect(6 + i * 4, 8, 2, 16); }, { k: 1 });
  plane(root, 3.9, 2.6, lam({ map: rug }), T.x, 0.004, T.z, 0, -PI / 2).receiveShadow = true;
  // ---------------------------------------------------------------- the lounge: couch, coffee table + phone, TV with the game, lamp, shelf
  const C = D.couch, couch = new THREE.Group(); couch.position.set(C.x, 0, C.z); root.add(couch);
  const sofa = toon(0x4a6a8a), sofaD = toon(0x3a5878);
  bx(couch, 2.3, 0.3, 0.9, sofaD, 0, 0.2, 0); bx(couch, 2.3, 0.62, 0.22, sofa, 0, 0.62, -0.36);
  for (const s of [-1, 1]) bx(couch, 0.22, 0.6, 0.9, sofa, s * 1.04, 0.42, 0);
  for (const s of [-0.48, 0.48]) bx(couch, 0.9, 0.14, 0.66, sofa, s, 0.42, 0.08);
  for (const [x, c] of [[-0.7, 0xe8a030], [0.75, 0xc8582a]]) { const p = bx(couch, 0.38, 0.36, 0.12, toon(c), x, 0.68, -0.18); p.rotation.set(-0.25, 0, x > 0 ? 0.2 : -0.15); }
  const blanket = bx(couch, 0.5, 0.04, 0.95, toon(0xd8c8a8), 0.85, 0.52, 0.0); blanket.rotation.z = -0.1;
  const behind = bx(root, 2.0, 0.75, 0.38, toon(0x5a3018), C.x, 0.375, C.z - 0.72);   // console table behind the couch
  void behind; cy(root, 0.09, 0.12, 0.28, toon(0xe8e0d0), C.x - 0.75, 0.89, C.z - 0.72, 12); sp(root, 0.16, toon(0xfff0d0, 0x302010), C.x - 0.75, 1.12, C.z - 0.72, 1, 0.8, 1, 12);
  const ct = new THREE.Group(); ct.position.set(C.x, 0, 0.42); root.add(ct);
  bx(ct, 1.2, 0.05, 0.6, toon(0x6a3a1e), 0, 0.42, 0); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(ct, 0.05, 0.4, 0.05, toon(0x5a3018), x * 0.55, 0.2, z * 0.25);
  cy(ct, 0.13, 0.09, 0.07, toon(0xf4f1ea), 0.3, 0.48, 0.05, 16); for (let i = 0; i < 12; i++) bx(ct, 0.04, 0.008, 0.04, toon(0xe8c050), 0.3 + (hash(i) - 0.5) * 0.16, 0.515 + hash(i + 1) * 0.01, 0.05 + (hash(i + 2) - 0.5) * 0.16, false);
  // the phone on a little stand on the coffee table (the stand sits BEHIND the screen; the screen tilts up toward +z)
  const PW = 0.072, PH = 0.15, phone = new THREE.Group(); phone.position.set(C.x - 0.28, 0.5, 0.42); phone.rotation.set(-0.95, 0.15, 0, 'YXZ'); root.add(phone);
  bx(phone, PW + 0.008, PH + 0.012, 0.009, toon(0x2a1a34), 0, 0, -0.005); const stand = bx(ct, 0.05, 0.05, 0.04, toon(0x1a1a1e), -0.28, 0.47, -0.04); void stand;
  // the TV: a console + a screen canvas with a generic football game (field, two pixel teams, a ball, a scoreboard strip)
  const TV = D.tv, tvG = new THREE.Group(); tvG.position.set(TV.x, 0, TV.z); tvG.rotation.y = PI; root.add(tvG);
  bx(tvG, 1.9, 0.5, 0.42, toon(0x3a2416), 0, 0.25, 0); bx(tvG, 1.5, 0.88, 0.06, toon(0x121216), 0, TV.y, 0.05);
  const tvT = crisp(320, 180); const tvS = plane(tvG, 1.42, 0.8, basic({ map: tvT }), 0, TV.y, 0.081); void tvS;
  for (const s of [-1, 1]) bx(tvG, 0.12, 0.3, 0.12, toon(0x1a1a1e), s * 0.8, 0.65, 0.05);
  let tvKey = -1;
  const drawTV = (t) => { const k = Math.floor(t * 10); if (k === tvKey) return; tvKey = k; const g = tvT.canvas.getContext('2d'), w = 320, h = 180, scroll = (t * 26) % 40;
    g.fillStyle = '#2e7a34'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a8a3e'; for (let x = -scroll; x < w; x += 40) g.fillRect(x, 0, 20, h);
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let x = -scroll; x < w; x += 40) g.fillRect(x, 0, 2, h);
    for (let i = 0; i < 11; i++) { const px = 60 + i * 20 + Math.sin(t * 2.2 + i) * 14, py = 30 + (i * 37) % 110 + Math.cos(t * 1.7 + i * 2) * 8;
      g.fillStyle = '#c8302a'; g.fillRect(px, py, 7, 10); g.fillStyle = '#f0e0c0'; g.fillRect(px + 1, py - 4, 5, 4);
      const qx = 80 + i * 18 + Math.sin(t * 2.0 + i * 1.3) * 12, qy = 40 + (i * 53) % 100 + Math.sin(t * 1.5 + i) * 9; g.fillStyle = '#2a4ac8'; g.fillRect(qx, qy, 7, 10); g.fillStyle = '#f0e0c0'; g.fillRect(qx + 1, qy - 4, 5, 4); }
    g.fillStyle = '#7a4a1e'; g.beginPath(); g.ellipse(160 + Math.sin(t * 2.4) * 40, 80 + Math.sin(t * 3.1) * 20, 5, 3, 0.4, 0, 7); g.fill();
    g.fillStyle = 'rgba(10,10,20,.85)'; g.fillRect(0, h - 26, w, 26); g.fillStyle = '#fff'; g.font = '800 15px Inter, Arial'; g.fillText('HOME 17', 10, h - 8); g.fillText('AWAY 14', 90, h - 8);
    g.fillStyle = '#ffd43b'; g.fillText(`4TH  ${Math.max(0, 2 - Math.floor(t / 60))}:${String(Math.max(0, 7 - Math.floor(t) % 60) % 60).padStart(2, '0')}`, 180, h - 8); g.fillStyle = '#7cf05f'; g.fillText('3RD & 4', 262, h - 8);
    tvT.needsUpdate = true; };
  const tvGlow = new THREE.PointLight(0x9ac0ff, 0.5, 2.2, 1.6); tvGlow.position.set(TV.x, TV.y, TV.z - 0.6); root.add(tvGlow);
  // floor lamp, plant, bookshelf
  const lampG = new THREE.Group(); lampG.position.set(7.7, 0, -1.2); root.add(lampG); cy(lampG, 0.15, 0.18, 0.04, toon(0x2a2a2e), 0, 0.02, 0, 14); cy(lampG, 0.015, 0.015, 1.5, toon(0x2a2a2e), 0, 0.77, 0, 8);
  const shade = cy(lampG, 0.16, 0.24, 0.3, toon(0xf6ead0, 0x504030), 0, 1.6, 0, 16); shade.castShadow = false;
  const lampL = new THREE.PointLight(0xffd8a0, 0.9, 3.5, 1.6); lampL.position.set(7.7, 1.45, -1.2); root.add(lampL);
  const plantG = new THREE.Group(); plantG.position.set(3.7, 0, -2.45); root.add(plantG); cy(plantG, 0.17, 0.13, 0.36, toon(0xc8683a), 0, 0.18, 0, 12);
  for (let i = 0; i < 9; i++) { const l = sp(plantG, 0.09, toon(i % 2 ? 0x3a7a3a : 0x2e6a32), Math.cos(i * 2.4) * 0.14, 0.5 + hash(i) * 0.5, Math.sin(i * 2.4) * 0.14, 0.7, 1.6, 0.7, 8); l.rotation.z = Math.cos(i * 2.4) * 0.5; }
  const shelf = new THREE.Group(); shelf.position.set(R.x1 - 0.2, 0, 0.6); shelf.rotation.y = -PI / 2; root.add(shelf); bx(shelf, 1.0, 1.9, 0.35, toon(0x5a3018), 0, 0.95, 0);
  const bookC = [0xa83a2a, 0x2a5a8a, 0xe8a030, 0x3a7a3a, 0x6a3a8a, 0xf0e0c0];
  for (let r = 0; r < 4; r++) { bx(shelf, 0.92, 0.03, 0.3, toon(0x6a3a1e), 0, 0.3 + r * 0.42, 0.03, false); for (let i = 0; i < 10; i++) { const hgt = 0.2 + hash(r * 10 + i) * 0.12; bx(shelf, 0.07, hgt, 0.22, toon(bookC[(r * 3 + i) % 6]), -0.4 + i * 0.085, 0.315 + r * 0.42 + hgt / 2, 0.06, false); } }
  // ---------------------------------------------------------------- the kitchen: fridge (filmable from inside), counters, stove, sink, island
  const FR = D.fridge, fr = new THREE.Group(); fr.position.set(FR.x, 0, FR.z); root.add(fr);
  const white = toon(0xf4f4f0), inner = toon(0xeef4f8, 0x10161c);
  const fd = 0.76, fw = FR.w, fh = FR.h, wall2 = 0.04;
  bx(fr, fw, fh, wall2, white, 0, fh / 2, -fd / 2 + wall2 / 2); bx(fr, wall2, fh, fd, white, -fw / 2 + wall2 / 2, fh / 2, 0); bx(fr, wall2, fh, fd, white, fw / 2 - wall2 / 2, fh / 2, 0);
  bx(fr, fw, wall2, fd, white, 0, fh - wall2 / 2, 0); bx(fr, fw, 0.1, fd, white, 0, 0.05, 0);
  plane(fr, fw - 0.08, fh - 0.14, lam({ color: 0xe8f0f6, emissive: 0x202830 }), 0, fh / 2, -fd / 2 + wall2 + 0.002);
  const glassS = new THREE.MeshToonMaterial({ color: 0xe0f0ff, transparent: true, opacity: 0.45 });
  const SHELVES = [0.48, 0.86, 1.24, 1.62];
  for (const y of SHELVES) { const s = bx(fr, fw - 0.08, 0.012, fd - 0.08, glassS, 0, y, -0.02, false); s.renderOrder = 2; bx(fr, fw - 0.08, 0.02, 0.012, toon(0xd8dce4), 0, y, fd / 2 - 0.07, false); }
  bx(fr, fw - 0.1, 0.22, fd - 0.12, new THREE.MeshToonMaterial({ color: 0xd8ecf8, transparent: true, opacity: 0.6 }), 0, 0.24, -0.02, false);   // crisper drawer
  const jar = (x, y, z, r, h, c, lid) => { const j = cy(fr, r, r, h, toon(c), x, y + h / 2, z, 12); if (lid) cy(fr, r * 1.02, r * 1.02, 0.015, toon(lid), x, y + h + 0.007, z, 12); return j; };
  // contents: kept to the BACK half and the sides so a lens at the middle shelf sees out
  jar(-0.3, SHELVES[2] + 0.006, -0.22, 0.05, 0.22, 0xfafaf8, 0x2a6ac8);   // milk jug
  jar(0.3, SHELVES[2] + 0.006, -0.24, 0.04, 0.12, 0xd83a2a, 0xf0e8d0); jar(0.2, SHELVES[2] + 0.006, -0.26, 0.035, 0.15, 0x4a8a3a, 0xf0d040);
  jar(-0.28, SHELVES[1] + 0.006, -0.2, 0.08, 0.09, 0xe8f0f8, 0x3a8ac8); jar(0.26, SHELVES[1] + 0.006, -0.18, 0.08, 0.08, 0xe8f0f8, 0xc83a3a);
  jar(-0.25, SHELVES[3] + 0.006, -0.22, 0.06, 0.1, 0xf8d860, 0x8a5a2a); jar(0.25, SHELVES[3] + 0.006, -0.22, 0.05, 0.14, 0xe8e4d8, 0x2a2a2e);
  jar(-0.34, SHELVES[2] + 0.006, 0.22, 0.045, 0.2, 0xfafaf8, 0xe8a030); jar(0.33, SHELVES[2] + 0.006, 0.24, 0.05, 0.1, 0xe8f0f8, 0x4ab84a);   // front corners (fridge-cam framing)
  jar(-0.33, SHELVES[3] + 0.006, 0.2, 0.04, 0.16, 0xc83a2a, 0xf0e8d0); jar(0.32, SHELVES[3] + 0.006, 0.22, 0.06, 0.08, 0xf8d860, 0x8a5a2a);
  { const p2 = new THREE.Group(); p2.position.set(0.05, SHELVES[0] + 0.006, -0.2); fr.add(p2); cy(p2, 0.13, 0.11, 0.04, toon(0xd8d8d8), 0, 0.02, 0, 16); }   // a pie in foil
  for (let i = 0; i < 4; i++) jar(-0.3 + i * 0.2, 0.1, -0.05, 0.06, 0.1, [0xf8f8f8, 0x8ac85a, 0xffa030, 0xd83a3a][i]);
  const fLight = new THREE.PointLight(0xe4f0ff, 0, 2.6, 1.4); fLight.position.set(0, fh - 0.18, -0.15); fr.add(fLight);
  const fBulb = sp(fr, 0.03, basic({ color: 0xf4fbff }), 0, fh - 0.1, -0.2, 1, 0.6, 1, 8); fBulb.castShadow = false;
  // the door: a hinge on the fridge's −x edge; open = rotation.y −1.95 (it swings toward +z on the −x side)
  const door = new THREE.Group(); door.position.set(-fw / 2, 0, fd / 2); fr.add(door);
  bx(door, fw, fh, 0.06, white, fw / 2, fh / 2, 0.03); bx(door, 0.03, 0.7, 0.04, toon(0xc8ccd4), fw - 0.08, 1.15, 0.08);
  for (const y of [0.55, 0.95, 1.35]) { bx(door, fw - 0.12, 0.012, 0.11, glassS, fw / 2, y, -0.06, false); bx(door, fw - 0.12, 0.06, 0.012, glassS, fw / 2, y + 0.03, -0.115, false); }
  const hand = crisp(128, 160, (g, w, h) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a5a2a'; g.beginPath(); g.ellipse(64, 104, 30, 36, 0, 0, 7); g.fill();
    ['#e83a2a', '#f0a030', '#f8d838', '#4ab84a', '#3a7ad8'].forEach((c, i) => { g.fillStyle = c; g.save(); g.translate(64, 96); g.rotate(-0.9 + i * 0.45); g.fillRect(-7, -70, 14, 44); g.restore(); });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(56, 92, 5, 0, 7); g.fill(); g.fillStyle = '#000'; g.fillRect(55, 91, 3, 3); g.fillStyle = '#f0a030'; g.beginPath(); g.moveTo(44, 100); g.lineTo(30, 104); g.lineTo(44, 108); g.fill();
    g.fillStyle = '#c83a2a'; g.font = '900 16px Inter, Arial'; g.textAlign = 'center'; g.fillText('MIA  AGE 6', 64, 154); });
  plane(door, 0.26, 0.32, lam({ map: hand }), fw / 2, 1.4, 0.061);
  for (const [x, y, c] of [[0.2, 1.62, 0xe83a2a], [0.7, 1.58, 0x3a7ad8], [0.62, 0.95, 0xf0c030]]) sp(door, 0.02, toon(c), x, y, 0.07, 1, 1, 0.5, 8);
  const setFridge = (k) => { door.rotation.y = -1.95 * k; fLight.intensity = k > 0.02 ? 1.5 * Math.min(1, k * 3) : 0; fBulb.visible = k > 0.02; };
  // counters + uppers along the back wall, the stove, microwave clock, sink + window
  const cab = toon(0x6a8a7a), ctop = toon(0xe8e2d4), tile = lam({ map: pixelTex(8, 8, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); }, { k: 1, repeat: [20, 4] }) });
  for (const [x0, x1] of [[R.x0, FR.x - fw / 2 - 0.02], [FR.x + fw / 2 + 0.02, -3.5]]) { const w = x1 - x0, x = (x0 + x1) / 2;
    bx(root, w, 0.88, 0.62, cab, x, 0.44, R.z0 + 0.31); bx(root, w + 0.02, 0.05, 0.66, ctop, x, 0.905, R.z0 + 0.33);
    plane(root, w, 0.55, tile, x, 1.2, R.z0 + 0.005); bx(root, w, 0.7, 0.36, cab, x, 2.0, R.z0 + 0.18);
    for (let i = 0; i < Math.floor(w / 0.6); i++) { bx(root, 0.03, 0.12, 0.03, toon(0xc8ccd4), x0 + 0.3 + i * 0.6, 0.72, R.z0 + 0.63, false); bx(root, 0.03, 0.12, 0.03, toon(0xc8ccd4), x0 + 0.3 + i * 0.6, 1.78, R.z0 + 0.37, false); } }
  const stove = new THREE.Group(); stove.position.set(-6.6, 0.93, R.z0 + 0.34); root.add(stove);
  bx(stove, 0.76, 0.02, 0.6, toon(0x2a2a2e), 0, 0, 0, false); for (const [x, z] of [[-0.18, -0.12], [0.18, -0.12], [-0.18, 0.14], [0.18, 0.14]]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 4, 16), toon(0x5a5a5e)); r.rotation.x = PI / 2; r.position.set(x, 0.015, z); stove.add(r); }
  cy(stove, 0.15, 0.15, 0.24, toon(0xb8bcc4), -0.18, 0.13, -0.12, 16); cy(stove, 0.12, 0.12, 0.1, toon(0x3a3a3e), 0.18, 0.06, 0.14, 16);
  const mw = new THREE.Group(); mw.position.set(-6.6, 1.55, R.z0 + 0.22); root.add(mw); bx(mw, 0.7, 0.38, 0.4, toon(0x2a2a2e), 0, 0, 0); plane(mw, 0.42, 0.26, basic({ color: 0x101418 }), -0.08, 0, 0.201);
  const mwT = crisp(96, 40); plane(mw, 0.14, 0.06, basic({ map: mwT }), 0.24, 0.08, 0.202);
  const setMicro = (txt) => { const g = mwT.canvas.getContext('2d'); g.fillStyle = '#081008'; g.fillRect(0, 0, 96, 40); g.fillStyle = '#5aff7a'; g.font = '800 28px monospace'; g.textAlign = 'center'; g.fillText(txt, 48, 30); mwT.needsUpdate = true; };
  setMicro('4:00');
  bx(root, 0.62, 0.02, 0.44, toon(0xb8bcc4), -7.6, 0.93, R.z0 + 0.34, false); cy(root, 0.012, 0.012, 0.3, toon(0xc8ccd4), -7.6, 1.08, R.z0 + 0.12, 8);
  for (let i = 0; i < 4; i++) { const p = cy(root, 0.11, 0.11, 0.015, toon(0xfbf8f0), -8.1 + i * 0.02, 1.02, R.z0 + 0.4 - i * 0.03, 16); p.rotation.x = 1.2; }   // dish rack plates
  cy(root, 0.06, 0.06, 0.28, toon(0xfafaf8), -4.3, 1.08, R.z0 + 0.3, 12);   // paper towels
  // the island + stools (the 2 AM leftovers live here; the dusk shots hide them)
  const I = D.island, isl = new THREE.Group(); isl.position.set(I.x, 0, I.z); root.add(isl);
  bx(isl, 1.9, 0.88, 0.85, cab, 0, 0.44, 0); bx(isl, 2.0, 0.05, 0.95, ctop, 0, 0.905, 0);
  for (const s of [-1, 1]) { const st = new THREE.Group(); st.position.set(s * 1.25, 0, 0); isl.add(st); cy(st, 0.18, 0.18, 0.05, toon(0x6a3a1e), 0, 0.68, 0, 14); cy(st, 0.025, 0.04, 0.66, toon(0x2a2a2e), 0, 0.33, 0, 8); }
  const left = new THREE.Group(); left.position.set(0, I.y + 0.0, 0); isl.add(left);
  const carcass = makeTurkey(); carcass.setCarved(1); carcass.g.position.set(-0.3, 0, -0.08); carcass.g.scale.setScalar(0.9); left.add(carcass.g);
  const foil = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4, 6, 5), new THREE.MeshToonMaterial({ color: 0xd8dce4, side: THREE.DoubleSide }));
  { const p = foil.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, (hash(i) - 0.5) * 0.03); foil.geometry.computeVertexNormals(); }
  foil.rotation.set(-PI / 2 + 0.25, 0, 0.3); foil.position.set(-0.05, 0.16, -0.12); left.add(foil);
  for (let i = 0; i < 5; i++) { const c = new THREE.Group(); c.position.set(0.32 + (i % 3) * 0.17, (i > 2 ? 0.075 : 0), -0.1 + (i > 2 ? 0.0 : 0.05) + Math.floor(i / 3) * 0.02); left.add(c);
    cy(c, 0.075, 0.07, 0.07, new THREE.MeshToonMaterial({ color: 0xf0f4f8, transparent: true, opacity: 0.75 }), 0, 0.035, 0, 14); cy(c, 0.065, 0.065, 0.045, toon([0xfaf4e2, 0x8a5a2a, 0xe8782a, 0xa0102a, 0x5a8a3a][i]), 0, 0.03, 0, 12); cy(c, 0.078, 0.078, 0.012, toon([0x3a8ac8, 0xc83a3a, 0x4ab84a, 0xf0c030, 0x8a5ac8][i]), 0, 0.074, 0, 14); }
  const halfPie = pie(left, 0.35, 0, 0.22, false); halfPie.scale.set(1, 1, 0.55); halfPie.position.z = 0.25;
  cy(left, 0.04, 0.04, 0.3, toon(0xd8dce4), -0.65, 0.04, 0.25, 12).rotation.z = PI / 2;   // a foil roll
  left.visible = false;
  // ---------------------------------------------------------------- lights (set by setMode): hemi + the chandelier + lamp + TV + fridge
  const hemi = new THREE.HemisphereLight(0xffe8cc, 0x6a5040, 1.0); root.add(hemi);
  const ceil = []; for (const [x, z] of [[-6, -0.8], [-3.2, 1.2], [3.2, 1.2], [6.2, 0.6]]) { const L = new THREE.PointLight(0xffe0b0, 0.9, 6, 1.6); L.position.set(x, 2.5, z); root.add(L); ceil.push(L); }
  const under = new THREE.PointLight(0xffe0a8, 0, 1.6, 1.6); under.position.set(-6.0, 1.55, R.z0 + 0.55); root.add(under);
  let mode = '';
  function setMode(m) {
    if (m === mode) return; mode = m;
    const dusk = m === 'dusk', late = m === 'late';
    winMats.forEach((w) => (w.map = dusk ? skyDusk : skyNight));
    hemi.intensity = dusk ? 1.0 : late ? 0.16 : 0.42; hemi.color.set(late ? 0x8aa0d8 : 0xffe8cc); hemi.groundColor.set(late ? 0x1a1a2a : 0x6a5040);
    chandL.intensity = dusk ? 1.4 : late ? 0 : 0.85; bulbs.forEach((b) => (b.material.color.set(late ? 0x3a3428 : 0xffe6b0)));
    ceil.forEach((L) => (L.intensity = dusk ? 0.9 : late ? 0 : 0.35)); lampL.intensity = late ? 0 : dusk ? 0.9 : 0.7; shade.material.emissive.set(late ? 0x000000 : 0x504030);
    tvGlow.intensity = late ? 0 : 0.5; under.intensity = late ? 0.55 : 0;
    flames.forEach((f, i) => { f.visible = !late; f.position.y = T.y + (dusk ? 0.31 : 0.2); });
    turkey.setCarved(dusk ? 0 : 1); turkey.g.visible = !late; left.visible = late;
    setMicro(late ? '2:00' : dusk ? '4:00' : '10:00');
  }
  setMode('dusk');
  // ---------------------------------------------------------------- the family (voxel relatives): 4 at the table, the uncle on the couch
  const fam = [];
  if (family) {
    const mk = (o, seat) => { const P = makeVoxPerson({ height: 1.72, ...o }); root.add(P.root); fam.push({ P, seat }); return P; };
    const seatAt = (i, dz = 0) => { const S = SEATS[i], c = chairs[i]; return { x: c.position.x, z: c.position.z + dz, rotY: S.end ? (S.end > 0 ? -PI / 2 : PI / 2) : S.side < 0 ? 0 : PI }; };
    mk({ skin: 0xf0c8a8, hair: 0xd8d8d8, hairStyle: 'bun', top: 'cardigan', shirt: 0x8a4a8a, pants: 0x4a3a5a, glasses: 0x2a2a2a }, seatAt(0));           // grandma
    mk({ skin: 0xc89070, hair: 0x2a1c14, hairStyle: 'short', top: 'shirt', shirt: 0xb8322a, pants: 0x3a4058, glasses: true, beard: 0x3a2618 }, seatAt(2));   // dad
    mk({ skin: 0x8a5a3a, hair: 0x1a1210, hairStyle: 'long', top: 'dress', shirt: 0x3a8a5a, legs: 0x8a5a3a }, seatAt(7));                                 // aunt (end)
    mk({ skin: 0xe0ac86, hair: 0x5a3a1a, hairStyle: 'cap', cap: 0xe8a030, top: 'hoodie', shirt: 0x2a5a9a, pants: 0x34405c }, seatAt(6));                 // cousin (end)
  }
  const uncle = family ? makeVoxPerson({ height: 1.75, skin: 0xd8a080, hair: 0x6a4a2a, hairStyle: 'buzz', top: 'tee', shirt: 0xe8e0c8, pants: 0x4a5a3a, beard: 0x6a4a2a }) : null;
  if (uncle) root.add(uncle.root);

  const update = (t) => { drawTV(t); flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 13 + i) * 0.08, 2.2 + Math.sin(t * 9 + i * 2) * 0.3, 1); }); };
  update(0);
  return { root, D, SEATS, chairs, settings, turkey, family: fam, uncle, setMode, setFridge, setMicro, update, tbl,
    phone: { g: phone, W: PW, H: PH }, fridge: { g: fr, door, light: fLight, shelves: SHELVES }, island: isl, leftovers: left, couch, lights: { hemi, chandL, ceil, lampL, tvGlow, under } };
}
