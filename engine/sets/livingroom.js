// SET: a cozy apartment living room + dining area (built for video 016, talking pets; reusable for any home scene).
// Dressed on purpose (user steer: no bare scenes): armchair, sofa, coffee table + magazines + popcorn, rug, a big window with a
// painted view, bookshelf, floor lamp, side table, plants, framed pictures, a TV on the right wall, a dog bed, a pet perch spot,
// and a dining area (table, 4 chairs, sideboard, pendant lamp, wall art, a window on the left wall).
//
// Coordinates (meters, y up). Room x∈[-5,3], z∈[-2.8,2.8], ceiling 2.7. Camera usually from +z looking −z.
//   Living area x∈[-1.6,3]: armchair at DIMS.armchair (seat top 0.45, faces +z) — its group's origin is the BACK-BOTTOM edge
//   so `armchair.rotation.x = −θ` tips it over backwards. Sofa against the back wall (x∈[0.9,2.7]). Window x∈[-0.7,1.5].
//   Dog bed at DIMS.dogBed, perch spot DIMS.perch, side table (top DIMS.sideTop) at DIMS.side, coffee table at DIMS.coffee.
//   Dining area x∈[-5,-1.7]: table centered DIMS.dining (top DIMS.diningTop, 1.6 × 0.9), chairs `diningChairs[]` =
//   [left end (faces +x), back-left, back-right (face +z), right end (faces −x)].
// setMode('evening' | 'dinner' | 'night'): golden 7 PM sun / dusk with the pendant on / a moonlit night with the lamps on.
// opts.home = true (021, Pip's house; defaults unchanged without it): the dining area becomes a stair hall — a staircase up the
//   left wall (bottom step at z=+1.7, top landing at z=−2.2, y=2.67) into a hole in the ceiling with a switchable upstairs
//   light (setUpstairs(v)), photo frames up the stair wall, a console table + lamp (setConsole(v)) and Pip's corner (bowls,
//   toy basket, a moon nightlight) along the back wall, a wall clock with real hands (setClock(h, m)), and a sunrise:
//   setMode('morning') or setDawn(k 0..1) blends the night into morning (lights, window view, the sun patch sweeping the floor).
//   DIMS.home = { stairX, stairZ0 (bottom), rise, tread, steps, crate (suggested crate spot), console, bowls, basket }.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp } from '@engine/core.js';

export const DIMS = {
  room: { x0: -5, x1: 3, z0: -2.8, z1: 2.8, h: 2.7 },
  armchair: [-0.35, -1.5], seat: 0.45, sofa: [1.8, -2.25], dogBed: [-0.78, -0.55], perch: [0.6, -1.85],
  side: [-1.15, -1.75], sideTop: 0.62, coffee: [0.45, -0.45], coffeeTop: 0.4,
  dining: [-3.4, -0.95], diningTop: 0.75, diningSize: [1.6, 0.9],
  home: { stairX: [-5, -4.05], stairZ0: 1.7, rise: 0.205, tread: 0.3, steps: 13, crate: [-3.0, -1.55], console: [-3.45, -2.6], bowls: [-2.45, -2.2], basket: [-2.2, -1.95], nightlight: [-2.75, 0.32] },
};

function viewTex(mode) {
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    if (mode === 'evening') { gr.addColorStop(0, '#6f9fd8'); gr.addColorStop(0.45, '#f6c48a'); gr.addColorStop(0.75, '#f59a6a'); }
    else if (mode === 'dinner') { gr.addColorStop(0, '#2c3f78'); gr.addColorStop(0.6, '#6a64a8'); gr.addColorStop(0.85, '#d98a8a'); }
    else if (mode === 'morning') { gr.addColorStop(0, '#8fbde8'); gr.addColorStop(0.45, '#f8d9b0'); gr.addColorStop(0.72, '#ffc98a'); }
    else { gr.addColorStop(0, '#0d1838'); gr.addColorStop(0.7, '#1f3566'); gr.addColorStop(1, '#2f4a7a'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(3);
    if (mode === 'night') { g.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.4 + R() * 0.6; g.beginPath(); g.arc(R() * w, R() * h * 0.55, 0.8 + R() * 1.4, 0, 7); g.fill(); } g.globalAlpha = 1; g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(w * 0.72, h * 0.22, 26, 0, 7); g.fill(); }
    if (mode === 'evening') { g.fillStyle = 'rgba(255,236,190,.9)'; g.beginPath(); g.arc(w * 0.3, h * 0.66, 40, 0, 7); g.fill(); }
    if (mode === 'morning') { const sg = g.createRadialGradient(w * 0.38, h * 0.7, 10, w * 0.38, h * 0.7, 190); sg.addColorStop(0, 'rgba(255,248,220,1)'); sg.addColorStop(0.25, 'rgba(255,226,160,.85)'); sg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); }
    // far skyline + near rooftops + trees
    for (let i = 0; i < 16; i++) { const bw = 40 + R() * 70, bh = 60 + R() * 150, x = i * 66 - 10; g.fillStyle = mode === 'evening' ? '#9a7f9a' : mode === 'morning' ? '#c99a9a' : mode === 'dinner' ? '#3a3a62' : '#1a2340'; g.fillRect(x, h * 0.78 - bh, bw, bh + 200);
      if (mode !== 'evening' && mode !== 'morning') for (let y = h * 0.78 - bh + 10; y < h * 0.76; y += 18) for (let xx = x + 6; xx < x + bw - 8; xx += 14) if (R() < 0.45) { g.fillStyle = R() < 0.5 ? '#ffd98a' : '#ffe9b8'; g.fillRect(xx, y, 7, 9); } }
    g.fillStyle = mode === 'evening' ? '#5f7f4f' : mode === 'morning' ? '#7d9a62' : mode === 'dinner' ? '#2a3a3a' : '#141c26';
    for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(i * 95 + 20, h * 0.86, 55 + (i % 3) * 14, 0, 7); g.fill(); }
    g.fillRect(0, h * 0.86, w, h);
  });
}

export function buildLivingRoom(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 16), Dm = DIMS.room, home = !!opts.home;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 3, r), m, p, x, y, z);
  const cylGeo = (r, h) => new THREE.CylinderGeometry(r, r, h, 10);
  const plane = (w, h, tex, x, y, z, ry = 0, basic = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };

  // ---------------------------------------------------------------- shell: wood floor, wallpaper, ceiling
  const floorTex = canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#b98a5e', '#c4956a', '#ad7f55', '#bf9064'][i % 4]; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(70,40,20,.25)'; g.fillRect(0, i * 64, w, 3); g.fillRect(((i * 197) % 400) + 40, i * 64, 3, 64); } }, [4, 3]);
  const floor = mk(new THREE.PlaneGeometry(8, 5.6), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }), root, -1, 0, 0); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const paper = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9dcc4'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(190,150,110,.22)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 10, h); g.fillStyle = 'rgba(160,110,90,.25)'; for (let y = 16; y < h; y += 64) for (let x = 21; x < w; x += 32) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } }, [8, 2]);
  const wallM = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 }), trim = mat(0xf6f1e6, 0.6);
  const WX0 = -0.7, WX1 = 1.5, WY0 = 0.85, WY1 = 2.25;   // big living-room window in the back wall
  box(WX0 - Dm.x0, Dm.h, 0.12, wallM, (Dm.x0 + WX0) / 2, Dm.h / 2, Dm.z0 - 0.06); box(Dm.x1 - WX1, Dm.h, 0.12, wallM, (WX1 + Dm.x1) / 2, Dm.h / 2, Dm.z0 - 0.06);
  box(WX1 - WX0, WY0, 0.12, wallM, (WX0 + WX1) / 2, WY0 / 2, Dm.z0 - 0.06); box(WX1 - WX0, Dm.h - WY1, 0.12, wallM, (WX0 + WX1) / 2, (Dm.h + WY1) / 2, Dm.z0 - 0.06);
  const LZ0 = -1.9, LZ1 = -0.4;   // dining window in the left wall
  if (home) box(0.12, Dm.h + 2.3, 5.6, wallM, Dm.x0 - 0.06, (Dm.h + 2.3) / 2, 0);   // the stair wall (no dining window), up past the ceiling
  else {
  box(0.12, Dm.h, LZ0 - Dm.z0, wallM, Dm.x0 - 0.06, Dm.h / 2, (Dm.z0 + LZ0) / 2); box(0.12, Dm.h, Dm.z1 - LZ1, wallM, Dm.x0 - 0.06, Dm.h / 2, (LZ1 + Dm.z1) / 2);
  box(0.12, 0.95, LZ1 - LZ0, wallM, Dm.x0 - 0.06, 0.475, (LZ0 + LZ1) / 2); box(0.12, Dm.h - 2.15, LZ1 - LZ0, wallM, Dm.x0 - 0.06, (Dm.h + 2.15) / 2, (LZ0 + LZ1) / 2);
  }
  box(0.12, Dm.h, 5.6, wallM, Dm.x1 + 0.06, Dm.h / 2, 0);
  if (home) { const cm = mat(0xf8f4ec, 0.95); box(8.3 - 1.1, 0.1, 5.8, cm, -1 + 0.55, Dm.h + 0.05, 0); box(1.1, 0.1, 2.15, cm, Dm.x0 + 0.4, Dm.h + 0.05, 0.75 + 1.075); }   // stairwell hole x<−3.95, z<0.75
  else box(8.3, 0.1, 5.8, mat(0xf8f4ec, 0.95), -1, Dm.h + 0.05, 0);
  box(8, 0.12, 0.03, trim, -1, 0.06, Dm.z0 + 0.015);                                     // baseboard
  // window frames + sill + curtains + the painted view
  const views = { evening: viewTex('evening'), dinner: viewTex('dinner'), night: viewTex('night'), morning: viewTex('morning') };
  const viewM = new THREE.MeshBasicMaterial({ map: views.evening, toneMapped: false });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), viewM); view.position.set(0.4, 1.5, Dm.z0 - 2.4); root.add(view);
  if (!home) { const view2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), viewM); view2.position.set(Dm.x0 - 1.8, 1.5, -1.15); view2.rotation.y = Math.PI / 2; root.add(view2); }
  for (const x of [WX0, (WX0 + WX1) / 2, WX1]) box(0.06, WY1 - WY0, 0.08, trim, x, (WY0 + WY1) / 2, Dm.z0 + 0.01);
  box(WX1 - WX0 + 0.1, 0.06, 0.08, trim, (WX0 + WX1) / 2, WY1, Dm.z0 + 0.01); box(WX1 - WX0 + 0.2, 0.05, 0.22, trim, (WX0 + WX1) / 2, WY0, Dm.z0 + 0.08);
  if (!home) { box(0.08, 0.06, LZ1 - LZ0, trim, Dm.x0 + 0.03, 2.15, (LZ0 + LZ1) / 2); box(0.2, 0.05, LZ1 - LZ0 + 0.1, trim, Dm.x0 + 0.08, 0.95, (LZ0 + LZ1) / 2); }
  const curtM = mat(0x5f8f8a, 0.95, { side: THREE.DoubleSide });
  for (const x of [WX0 - 0.28, WX1 + 0.28]) { const c = mk(new THREE.PlaneGeometry(0.5, 2.3), curtM, root, x, 1.4, Dm.z0 + 0.07); c.castShadow = false; }
  box(WX1 - WX0 + 1.4, 0.03, 0.03, mat(0x3a2e26, 0.4), (WX0 + WX1) / 2, 2.5, Dm.z0 + 0.1);
  // a little succulent row + a cactus on the sill
  for (let i = 0; i < 3; i++) { mk(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 10), mat([0xe2574c, 0xf2efe8, 0x4f9bd9][i], 0.6), root, WX0 + 0.3 + i * 0.75, WY0 + 0.065, Dm.z0 + 0.1); mk(new THREE.SphereGeometry(0.05, 8, 6), mat(0x4f8a3f, 0.8), root, WX0 + 0.3 + i * 0.75, WY0 + 0.13, Dm.z0 + 0.1).scale.set(1, 0.7 + (i % 2) * 0.6, 1); }

  // ---------------------------------------------------------------- living area
  const rugTex = canvasTex(512, 340, (g, w, h) => { g.fillStyle = '#c75b4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2d8a8'; g.lineWidth = 14; g.strokeRect(20, 20, w - 40, h - 40); g.strokeStyle = '#2f5f6a'; g.lineWidth = 8; g.strokeRect(50, 50, w - 100, h - 100); g.fillStyle = '#f2d8a8'; for (let i = 0; i < 5; i++) { g.save(); g.translate(110 + i * 75, h / 2); g.rotate(Math.PI / 4); g.fillRect(-16, -16, 32, 32); g.restore(); } });
  const rug = mk(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }), root, 0.4, 0.004, -0.75); rug.rotation.x = -Math.PI / 2; rug.castShadow = false;
  // armchair (origin = back-bottom edge, tips backwards)
  const [ax, az] = DIMS.armchair, chairM = mat(0x3f7d8c, 0.85), legM = mat(0x4a3324, 0.6);
  const armchair = new THREE.Group(); armchair.position.set(ax, 0, az - 0.42); root.add(armchair);
  const C = new THREE.Group(); C.position.z = 0.42; armchair.add(C);
  rbox(0.82, 0.2, 0.78, 0.06, chairM, 0, 0.3, 0, C); rbox(0.66, 0.1, 0.62, 0.05, mat(0x4c90a0, 0.85), 0, 0.42, 0.05, C);
  rbox(0.82, 0.62, 0.18, 0.07, chairM, 0, 0.62, -0.32, C); for (const s of [-1, 1]) rbox(0.14, 0.32, 0.74, 0.06, chairM, s * 0.36, 0.5, 0.0, C);
  for (const [lx, lz] of [[-0.34, -0.32], [0.34, -0.32], [-0.34, 0.32], [0.34, 0.32]]) box(0.05, 0.2, 0.05, legM, lx, 0.1, lz, C);
  mk(new THREE.SphereGeometry(0.13, 12, 10), mat(0xf2c14e, 0.9), C, 0.22, 0.6, -0.15).scale.set(1, 1, 0.45);   // cushion
  // sofa against the back wall (right of the window, under a painting)
  const [sx, sz] = DIMS.sofa, sofaM = mat(0x8f6aa8, 0.9);
  rbox(1.9, 0.24, 0.85, 0.07, sofaM, sx, 0.3, sz); rbox(1.9, 0.6, 0.2, 0.07, sofaM, sx, 0.62, sz - 0.33); for (const s of [-1, 1]) rbox(0.18, 0.38, 0.85, 0.07, sofaM, sx + s * 0.86, 0.5, sz);
  for (let i = 0; i < 2; i++) rbox(0.78, 0.1, 0.62, 0.05, mat(0x9d7ab5, 0.9), sx - 0.4 + i * 0.8, 0.46, sz + 0.06);
  [[0xf2c14e, -0.55], [0x58b3a8, 0.6]].forEach(([c, dx]) => { const p = mk(new THREE.SphereGeometry(0.15, 12, 10), mat(c, 0.9), root, sx + dx, 0.66, sz - 0.18); p.scale.set(1, 1, 0.4); p.rotation.z = dx * 0.4; });
  const throwB = rbox(0.5, 0.03, 0.7, 0.015, mat(0xd9c7a0, 0.95), sx + 0.55, 0.53, sz + 0.05); throwB.rotation.z = 0.05;
  // coffee table: magazines, remote, popcorn, a mug
  const [cx, cz] = DIMS.coffee, wood = mat(0x8a5a36, 0.55);
  rbox(1.0, 0.05, 0.56, 0.02, wood, cx, DIMS.coffeeTop - 0.025, cz); for (const [lx, lz] of [[-0.44, -0.22], [0.44, -0.22], [-0.44, 0.22], [0.44, 0.22]]) box(0.04, DIMS.coffeeTop - 0.05, 0.04, wood, cx + lx, (DIMS.coffeeTop - 0.05) / 2, cz + lz);
  [0xd2483f, 0x3d7bd9, 0xf2efe8].forEach((c, i) => { const mg = box(0.22, 0.012, 0.3, mat(c, 0.6), cx - 0.25 + i * 0.03, DIMS.coffeeTop + 0.006 + i * 0.012, cz + 0.02); mg.rotation.y = i * 0.25; });
  box(0.05, 0.02, 0.16, mat(0x222222, 0.4), cx + 0.1, DIMS.coffeeTop + 0.01, cz + 0.1).rotation.y = 0.4;
  const pop = mk(new THREE.CylinderGeometry(0.1, 0.08, 0.1, 16, 1, true), mat(0xd2483f, 0.6, { side: THREE.DoubleSide }), root, cx + 0.3, DIMS.coffeeTop + 0.05, cz - 0.05);
  for (let k = 0; k < 14; k++) mk(new THREE.SphereGeometry(0.022, 6, 5), mat(0xfff3d6, 0.9), root, cx + 0.3 + Math.cos(k * 1.7) * 0.06 * (k % 3) / 2, DIMS.coffeeTop + 0.1 + (k % 4) * 0.012, cz - 0.05 + Math.sin(k * 1.7) * 0.06 * (k % 3) / 2);
  void pop;
  // side table (with a lamp at the back) — the fish bowl goes on it
  const [stx, stz] = DIMS.side;
  mk(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 20), wood, root, stx, DIMS.sideTop - 0.02, stz); mk(new THREE.CylinderGeometry(0.03, 0.05, DIMS.sideTop - 0.04, 10), wood, root, stx, (DIMS.sideTop - 0.04) / 2, stz); mk(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 16), wood, root, stx, 0.015, stz);
  // floor lamp (left of the side table) + table lamp on the bookshelf
  const lampX = -1.6, lampZ = -2.3;
  mk(new THREE.CylinderGeometry(0.15, 0.17, 0.03, 16), mat(0x2a2a2a, 0.5), root, lampX, 0.015, lampZ); mk(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 6), mat(0x2a2a2a, 0.5), root, lampX, 0.75, lampZ);
  const lampShade = mk(new THREE.CylinderGeometry(0.15, 0.22, 0.28, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xf6e3b8, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xffc777, emissiveIntensity: 0.5 }), root, lampX, 1.6, lampZ); lampShade.castShadow = false;
  // bookshelf on the back wall, left of the window
  const bsx = -2.05;
  box(0.9, 1.9, 0.32, wood, bsx, 0.95, Dm.z0 + 0.18);
  for (let s = 0; s < 4; s++) { box(0.84, 0.03, 0.3, mat(0x6e4a2e, 0.6), bsx, 0.25 + s * 0.45, Dm.z0 + 0.34); for (let b = 0; b < 9; b++) { if (R() < 0.15) continue; const bh = 0.2 + R() * 0.12; box(0.06 + R() * 0.03, bh, 0.2, mat([0xd2483f, 0x3d7bd9, 0xf2c14e, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xf2efe8][(b + s * 3) % 7], 0.7), bsx - 0.36 + b * 0.09, 0.27 + s * 0.45 + bh / 2, Dm.z0 + 0.3); } }
  // framed pictures (one big painting over the sofa, small ones over the dining sideboard)
  const art = (w, h, draw) => canvasTex(Math.round(256 * w / h), 256, draw);
  const paint = art(1.4, 0.8, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4c27a'); gr.addColorStop(1, '#e2786a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#3f6a8a'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.3, h * 0.45); g.lineTo(w * 0.55, h); g.fill(); g.fillStyle = '#2f5070'; g.beginPath(); g.moveTo(w * 0.35, h); g.lineTo(w * 0.7, h * 0.3); g.lineTo(w, h); g.fill(); g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(w * 0.75, h * 0.25, 22, 0, 7); g.fill(); });
  box(1.5, 0.9, 0.04, mat(0x3a2a20, 0.5), sx, 1.75, Dm.z0 + 0.03); plane(1.4, 0.8, paint, sx, 1.75, Dm.z0 + 0.055);
  // TV on the right wall (faces −x) on a low console
  box(0.45, 0.5, 1.6, wood, Dm.x1 - 0.25, 0.25, -0.4); const tv = box(0.05, 0.62, 1.1, mat(0x111111, 0.3), Dm.x1 - 0.1, 1.2, -0.4);
  const tvScreen = plane(1.02, 0.55, canvasTex(256, 140, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a6fb0'); gr.addColorStop(1, '#7ac0d8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(w * 0.3, h * 0.55, 26, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 22px Helvetica'; g.fillText('NEWS', w * 0.55, h * 0.4); }), Dm.x1 - 0.13, 1.2, -0.4, -Math.PI / 2, true);
  void tv; void tvScreen;
  // dog bed
  const [dbx, dbz] = DIMS.dogBed;
  const bed = mk(new THREE.TorusGeometry(0.33, 0.1, 10, 24), mat(0x7a5a8a, 0.95), root, dbx, 0.09, dbz); bed.rotation.x = Math.PI / 2; bed.scale.set(1, 0.8, 1);
  mk(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 24), mat(0xe9dcc8, 0.95), root, dbx, 0.04, dbz).scale.set(1, 1, 0.8);
  const bone = new THREE.Group(); bone.position.set(dbx + 0.45, 0.025, dbz + 0.25); bone.rotation.y = 0.7; root.add(bone);
  box(0.16, 0.03, 0.035, mat(0xf2efe8, 0.6), 0, 0, 0, bone); for (const s of [-1, 1]) for (const t of [-1, 1]) mk(new THREE.SphereGeometry(0.022, 8, 6), mat(0xf2efe8, 0.6), bone, s * 0.08, 0, t * 0.02);
  mk(new THREE.SphereGeometry(0.05, 12, 10), mat(0xd2483f, 0.5), root, dbx - 0.5, 0.05, dbz + 0.35);   // a ball
  // plants (corners)
  const plant = (px, pz, s, c = 0x4f8a3f) => { const pg = new THREE.Group(); pg.position.set(px, 0, pz); pg.scale.setScalar(s); root.add(pg); mk(new THREE.CylinderGeometry(0.2, 0.15, 0.35, 14), mat(0xd9d4c8, 0.6), pg, 0, 0.17, 0); for (let k = 0; k < 9; k++) { const lf = mk(new THREE.SphereGeometry(0.2, 10, 8), mat(c, 0.8), pg, Math.sin(k * 2.4) * 0.16, 0.55 + (k % 3) * 0.17, Math.cos(k * 2.4) * 0.16); lf.scale.set(0.45, 1.6, 0.3); lf.rotation.z = Math.sin(k) * 0.3; } };
  plant(2.65, -2.45, 1.15); if (!home) plant(-1.55, -0.2, 0.75, 0x5f9a4a); if (!home) plant(-4.65, -2.45, 1.0); plant(2.6, 1.6, 0.9);

  const [dx, dz] = DIMS.dining, [dw, dd] = DIMS.diningSize, dwood = mat(0x7a4e30, 0.55);
  const diningChairs = [];
  if (!home) {
  // ---------------------------------------------------------------- dining area
  rbox(dw, 0.05, dd, 0.02, dwood, dx, DIMS.diningTop - 0.025, dz);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.06, DIMS.diningTop - 0.05, 0.06, dwood, dx + lx * (dw / 2 - 0.08), (DIMS.diningTop - 0.05) / 2, dz + lz * (dd / 2 - 0.08));
  for (const [ccx, ccz, r] of [[dx - dw / 2 - 0.2, dz, Math.PI / 2], [dx - 0.4, dz - dd / 2 - 0.2, 0], [dx + 0.4, dz - dd / 2 - 0.2, 0], [dx + dw / 2 + 0.2, dz, -Math.PI / 2]]) {
    const c = new THREE.Group(); c.position.set(ccx, 0, ccz); c.rotation.y = r; root.add(c);
    rbox(0.44, 0.05, 0.44, 0.015, dwood, 0, 0.45, 0, c); for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) box(0.035, 0.45, 0.035, dwood, lx, 0.225, lz, c);
    for (const lx of [-0.19, 0.19]) box(0.035, 0.52, 0.035, dwood, lx, 0.72, -0.2, c); box(0.42, 0.14, 0.03, dwood, 0, 0.9, -0.2, c);
    rbox(0.38, 0.04, 0.38, 0.015, mat(0xc75b4a, 0.9), 0, 0.49, 0.01, c);
    diningChairs.push(c);
  }
  // sideboard + candles + a bowl, wall art, pendant lamp
  box(1.5, 0.8, 0.42, dwood, dx, 0.4, Dm.z0 + 0.23); for (let i = 0; i < 3; i++) box(0.44, 0.6, 0.01, mat(0x8a5e3e, 0.5), dx - 0.48 + i * 0.48, 0.42, Dm.z0 + 0.445);
  for (let i = 0; i < 3; i++) { mk(new THREE.CylinderGeometry(0.025, 0.025, 0.18 + i * 0.05, 10), mat(0xf6efe0, 0.6), root, dx + 0.3 + i * 0.1, 0.8 + (0.18 + i * 0.05) / 2, Dm.z0 + 0.2); }
  mk(new THREE.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(0x58b3a8, 0.4, { side: THREE.DoubleSide }), root, dx - 0.35, 0.95, Dm.z0 + 0.22);
  const smallArt = [['#6fa8d8', '#f2c14e'], ['#e58fa6', '#3d7bd9'], ['#9fd27a', '#d2483f']];
  smallArt.forEach(([a, b], i) => { box(0.5, 0.5, 0.03, mat(0xf6f1e6, 0.5), dx - 0.6 + i * 0.6, 1.65, Dm.z0 + 0.03); plane(0.4, 0.4, canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; g.beginPath(); g.arc(w * (0.3 + i * 0.2), h * 0.55, 30, 0, 7); g.fill(); }), dx - 0.6 + i * 0.6, 1.65, Dm.z0 + 0.05); });
  mk(new THREE.CylinderGeometry(0.005, 0.005, 0.85, 4), mat(0x222222, 0.5), root, dx, Dm.h - 0.42, dz);
  const pendShade = mk(new THREE.SphereGeometry(0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf2b632, roughness: 0.6, side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.5 }), root, dx, Dm.h - 0.95, dz);
  pendShade.castShadow = false;
  }
  // a clock between the window and the bookshelf + a coat rack corner + a "HOME" sign
  const clockT = canvasTex(128, 128, (g) => { g.fillStyle = '#fffdf6'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 6; g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 30); g.stroke(); g.beginPath(); g.moveTo(64, 64); g.lineTo(90, 76); g.stroke(); });
  const clk = mk(new THREE.CircleGeometry(0.17, 28), new THREE.MeshStandardMaterial({ map: home ? canvasTex(128, 128, (g) => { g.fillStyle = '#fffdf6'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#333'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.arc(64 + Math.sin(a) * 47, 64 - Math.cos(a) * 47, i % 3 ? 2.5 : 4.5, 0, 7); g.fill(); } }) : clockT, roughness: 0.6 }), root, -1.2, 2.05, Dm.z0 + 0.01); clk.castShadow = false;
  const hands = [];
  if (home) for (const [L, W] of [[0.085, 0.016], [0.125, 0.01]]) { const hg = new THREE.Group(); hg.position.set(-1.2, 2.05, Dm.z0 + 0.02); root.add(hg); box(W, L, 0.006, mat(0x2a2a2a, 0.5), 0, L / 2 - 0.012, 0, hg).castShadow = false; hands.push(hg); }
  const setClock = (h, m) => { if (!hands.length) return; hands[0].rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2; hands[1].rotation.z = -(m / 60) * Math.PI * 2; };
  setClock(9, 0);
  plane(0.6, 0.18, canvasTex(256, 76, (g, w, h) => { g.fillStyle = '#f6efe0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a4e30'; g.font = 'bold 50px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HOME', w / 2, h / 2 + 3); }), -1.2, 1.6, Dm.z0 + 0.01);

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0xfff1e0, 0x8a6e58, 1.0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc89a, 2.0); sun.position.set(-1.2, 3.6, -7.5); sun.target.position.set(0.0, 0, -0.6); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 4, bottom: -4, near: 1, far: 18 }); sun.shadow.bias = -0.0005;
  const lampL = new THREE.PointLight(0xffc27a, 2.0, 5.5, 1.6); lampL.position.set(lampX + 0.15, 1.5, lampZ + 0.35); root.add(lampL);
  const pend = new THREE.PointLight(0xffc98a, 2.0, 5, 1.6); pend.position.set(dx, Dm.h - 1.15, dz); root.add(pend);
  const fillL = new THREE.PointLight(0xfff0e0, 1.8, 8, 1.4); fillL.position.set(0.2, 2.2, 1.6); root.add(fillL);
  const fillD = new THREE.PointLight(0xfff0e0, 1.2, 7, 1.4); fillD.position.set(dx, 2.1, 1.4); root.add(fillD);

  // ---------------------------------------------------------------- home (021, Pip's house): stairs, upstairs, photos, console, Pip's corner
  const HM = DIMS.home, extra = {};
  const dawnM = new THREE.MeshBasicMaterial({ map: views.morning, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const dawnView = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), dawnM); dawnView.position.set(0.4, 1.5, Dm.z0 - 2.38); root.add(dawnView);
  if (home) {
    const [sx0, sx1] = HM.stairX, sw = sx1 - sx0, scx = (sx0 + sx1) / 2, stepM = mat(0xb07a4c, 0.6), riserM = mat(0xf3eee4, 0.75), runner = mat(0x6e3f5a, 0.95), rail = mat(0x6b4428, 0.5);
    const stairY = (z) => clamp(Math.floor((HM.stairZ0 - z) / HM.tread) + 1, 0, HM.steps) * HM.rise;
    for (let i = 0; i < HM.steps; i++) {
      const top = (i + 1) * HM.rise, zf = HM.stairZ0 - i * HM.tread, zb = zf - HM.tread;
      box(sw, top, HM.tread, riserM, scx, top / 2, (zf + zb) / 2);
      box(sw + 0.03, 0.03, HM.tread + 0.025, stepM, scx + 0.015, top + 0.015, (zf + zb) / 2 + 0.012);
      box(0.56, 0.012, HM.tread + 0.03, runner, scx, top + 0.036, (zf + zb) / 2 + 0.01);
      box(0.56, HM.rise - 0.03, 0.012, runner, scx, top - HM.rise / 2 + 0.01, zf + 0.019);
      for (const k of [0.25, 0.75]) mk(cylGeo(0.013, 0.86), mat(0xf6f1e6, 0.6), root, sx1 + 0.03, top + 0.03 + 0.43, zf - HM.tread * k);   // spindles
    }
    const zTop = HM.stairZ0 - HM.steps * HM.tread, yTop = HM.steps * HM.rise;
    box(sw, 0.1, zTop - Dm.z0, stepM, scx, yTop - 0.05, (zTop + Dm.z0) / 2);   // top landing
    const r0 = new THREE.Vector3(sx1 + 0.03, HM.rise + 0.95, HM.stairZ0 - 0.1), r1 = new THREE.Vector3(sx1 + 0.03, yTop + 0.95, zTop + 0.05);
    const handrail = mk(cylGeo(0.028, 1), rail, root); handrail.position.lerpVectors(r0, r1, 0.5); handrail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), r1.clone().sub(r0).normalize()); handrail.scale.y = r0.distanceTo(r1);
    box(0.1, 1.15, 0.1, rail, sx1 + 0.03, 0.575, HM.stairZ0 + 0.05); mk(new THREE.SphereGeometry(0.065, 14, 10), rail, root, sx1 + 0.03, 1.2, HM.stairZ0 + 0.05);   // newel post
    // the little cupboard under the stairs
    box(0.03, 1.1, 0.55, mat(0xe9e3d6, 0.55), sx1 + 0.016, 0.55, -0.45); mk(new THREE.SphereGeometry(0.025, 10, 8), mat(0xc9a25a, 0.3, { metalness: 0.7 }), root, sx1 + 0.04, 0.55, -0.62);
    // upstairs: walls around the stairwell above the ceiling + a light that pours down the stairs
    const upM = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9, emissive: 0xffa95c, emissiveIntensity: 0 });
    box(0.12, 2.4, 3.6, upM, -3.89, Dm.h + 1.2, -1.03); box(1.1, 2.4, 0.12, upM, sx0 + 0.5, Dm.h + 1.2, 0.81); box(1.1, 2.4, 0.12, upM, sx0 + 0.5, Dm.h + 1.2, Dm.z0 - 0.06);
    box(1.2, 0.1, 3.7, mat(0xf8f4ec, 0.95), sx0 + 0.5, Dm.h + 2.4, -1.03);
    const upLight = new THREE.PointLight(0xffc98a, 0, 6, 1.5); upLight.position.set(sx0 + 0.5, Dm.h + 1.5, -1.6); root.add(upLight);
    extra.setUpstairs = (v) => { upLight.intensity = 3.2 * v; upM.emissiveIntensity = 0.32 * v; };
    // photos climbing the stair wall
    const photo = (draw, z, y, w, h) => { box(0.03, h + 0.06, w + 0.06, mat(0x3a2a20, 0.5), sx0 + 0.015, y, z); const pl = plane(w, h, canvasTex(Math.round(160 * w / h), 160, draw), sx0 + 0.033, y, z, Math.PI / 2); pl.castShadow = false; };
    const sky = (g, w, h, c) => { g.fillStyle = c; g.fillRect(0, 0, w, h); };
    const fig = (g, x, y, s, c, head = '#f0c4a2') => { g.fillStyle = c; g.fillRect(x - 9 * s, y, 18 * s, 34 * s); g.fillStyle = head; g.beginPath(); g.arc(x, y - 10 * s, 10 * s, 0, 7); g.fill(); };
    photo((g, w, h) => { sky(g, w, h, '#9fc8e8'); g.fillStyle = '#e9d6a0'; g.fillRect(0, h * 0.7, w, h); fig(g, w * 0.3, h * 0.42, 1.4, '#3f7d6a'); fig(g, w * 0.55, h * 0.45, 1.3, '#c75b6a'); fig(g, w * 0.75, h * 0.6, 0.8, '#f2c14e'); }, 1.15, 0.0 + 1.55, 0.36, 0.28);
    photo((g, w, h) => { sky(g, w, h, '#f6e7d0'); g.fillStyle = '#f0c4a2'; g.beginPath(); g.arc(w / 2, h * 0.48, 34, 0, 7); g.fill(); g.fillStyle = '#4a2c1a'; g.beginPath(); g.arc(w / 2, h * 0.36, 30, Math.PI, 0); g.fill(); g.fillStyle = '#e8a0b0'; g.fillRect(w / 2 - 40, h * 0.68, 80, 60); }, 0.35, HM.rise * 4 + 1.45, 0.26, 0.34);
    photo((g, w, h) => { sky(g, w, h, '#cfe3c0'); g.fillStyle = '#c75b4a'; g.fillRect(w * 0.25, h * 0.45, w * 0.5, h * 0.4); g.fillStyle = '#7a3a2a'; g.beginPath(); g.moveTo(w * 0.2, h * 0.47); g.lineTo(w / 2, h * 0.2); g.lineTo(w * 0.8, h * 0.47); g.fill(); g.fillStyle = '#f2efe8'; g.fillRect(w * 0.45, h * 0.62, w * 0.1, h * 0.23); }, -0.45, HM.rise * 8 + 1.35, 0.34, 0.3);
    photo((g, w, h) => { sky(g, w, h, '#fff6e0'); g.strokeStyle = '#dc8434'; g.lineWidth = 8; g.fillStyle = '#dc8434'; g.beginPath(); g.ellipse(w / 2, h * 0.62, 50, 30, 0, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2 + 40, h * 0.42, 26, 0, 7); g.fill(); g.beginPath(); g.moveTo(w / 2 + 22, h * 0.3); g.lineTo(w / 2 + 28, h * 0.12); g.lineTo(w / 2 + 40, h * 0.3); g.fill(); g.beginPath(); g.moveTo(w / 2 + 44, h * 0.3); g.lineTo(w / 2 + 56, h * 0.12); g.lineTo(w / 2 + 62, h * 0.32); g.fill(); g.fillStyle = '#d2483f'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('PIP!!', w / 2, h * 0.94); }, -1.25, HM.rise * 11 + 1.3, 0.3, 0.36);
    // console table + lamp + a family portrait above it
    const [ccx, ccz] = HM.console, cw = mat(0x6e4a30, 0.55);
    rbox(1.15, 0.04, 0.36, 0.012, cw, ccx, 0.78, ccz); for (const lx of [-0.52, 0.52]) for (const lz of [-0.14, 0.14]) box(0.035, 0.76, 0.035, cw, ccx + lx, 0.38, ccz + lz); box(1.05, 0.03, 0.3, cw, ccx, 0.2, ccz);
    mk(new THREE.CylinderGeometry(0.06, 0.08, 0.26, 16), mat(0x58b3a8, 0.4), root, ccx - 0.32, 0.93, ccz);
    const cShadeM = new THREE.MeshStandardMaterial({ color: 0xf6e3b8, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xffc777, emissiveIntensity: 0 });
    const cShade = mk(new THREE.CylinderGeometry(0.12, 0.17, 0.2, 18, 1, true), cShadeM, root, ccx - 0.32, 1.15, ccz); cShade.castShadow = false;
    const consoleL = new THREE.PointLight(0xffc27a, 0, 4.5, 1.6); consoleL.position.set(ccx - 0.32, 1.12, ccz + 0.3); root.add(consoleL);
    extra.setConsole = (v) => { consoleL.intensity = 2.6 * v; cShadeM.emissiveIntensity = 0.9 * v; };
    box(0.2, 0.16, 0.02, mat(0x3a2a20, 0.5), ccx + 0.05, 0.88, ccz - 0.06).rotation.x = -0.15; mk(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 14), mat(0xd9c7a0, 0.6), root, ccx + 0.35, 0.825, ccz + 0.02);
    for (const [k, c] of [[0, 0xc9a25a], [1, 0x9aa3ad]]) box(0.04, 0.01, 0.02, mat(c, 0.3, { metalness: 0.7 }), ccx + 0.33 + k * 0.03, 0.855, ccz + 0.02);
    box(0.95, 0.66, 0.04, mat(0x3a2a20, 0.5), ccx, 1.68, Dm.z0 + 0.03);
    plane(0.85, 0.56, canvasTex(260, 172, (g, w, h) => { sky(g, w, h, '#f4dcb8'); g.fillStyle = '#e9c39a'; g.fillRect(0, h * 0.72, w, h); fig(g, w * 0.3, h * 0.36, 2.0, '#3f7d6a', '#d9a27c'); fig(g, w * 0.52, h * 0.4, 1.8, '#7fa6c4', '#e9b896'); fig(g, w * 0.72, h * 0.56, 1.2, '#b9a3e3'); g.fillStyle = '#dc8434'; g.beginPath(); g.ellipse(w * 0.84, h * 0.86, 18, 11, 0, 0, 7); g.fill(); g.beginPath(); g.arc(w * 0.88, h * 0.79, 9, 0, 7); g.fill(); }), ccx, 1.68, Dm.z0 + 0.055);
    // Pip's corner: bowls on a mat, a toy basket, a round rug, the moon nightlight
    const [bx, bz] = HM.bowls;
    rbox(0.5, 0.012, 0.3, 0.006, mat(0xd2483f, 0.8), bx, 0.006, bz);
    const bowlTex = canvasTex(256, 48, (g, w, h) => { g.fillStyle = '#3d7bd9'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 4; i++) g.fillText('PIP', w * (i + 0.5) / 4, h / 2 + 2); });
    for (const [k, fill] of [[-1, 0x7fc4e8], [1, 0x8a5a36]]) {
      mk(new THREE.CylinderGeometry(0.075, 0.06, 0.055, 24, 1, true), new THREE.MeshStandardMaterial({ map: bowlTex, roughness: 0.4, side: THREE.DoubleSide }), root, bx + k * 0.12, 0.04, bz);
      mk(new THREE.CircleGeometry(0.07, 20), mat(fill, fill === 0x7fc4e8 ? 0.1 : 0.9), root, bx + k * 0.12, 0.055, bz).rotation.x = -Math.PI / 2;
    }
    const [kx, kz] = HM.basket;
    mk(new THREE.CylinderGeometry(0.2, 0.17, 0.22, 20, 1, true), new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#b8874f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a5f32'; g.lineWidth = 3; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 4, h); g.stroke(); } for (let y = 4; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [3, 1]), roughness: 0.9, side: THREE.DoubleSide }), root, kx, 0.11, kz);
    mk(new THREE.CircleGeometry(0.17, 18), mat(0x8a5f32, 0.9), root, kx, 0.01, kz).rotation.x = -Math.PI / 2;
    mk(new THREE.SphereGeometry(0.05, 12, 10), mat(0xf2c14e, 0.5), root, kx - 0.05, 0.21, kz + 0.04); mk(new THREE.SphereGeometry(0.045, 12, 10), mat(0x58b3a8, 0.5), root, kx + 0.07, 0.2, kz - 0.03);
    const rope = mk(new THREE.CapsuleGeometry(0.02, 0.22, 4, 8), mat(0xe2574c, 0.9), root, kx + 0.02, 0.24, kz + 0.06); rope.rotation.z = 0.9;
    const pawRug = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = '#c9a77a'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); g.fillStyle = 'rgba(160,110,70,.35)'; for (const [x, y, a] of [[80, 70, 0.4], [170, 100, -0.3], [100, 170, 0.8], [180, 180, 0.1]]) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 6, 13, 11, 0, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-13 + k * 8.7, -10 - (k % 3 ? 4 : 0), 4.5, 0, 7); g.fill(); } g.restore(); } });
    const cr = mk(new THREE.CircleGeometry(0.95, 40), new THREE.MeshStandardMaterial({ map: pawRug, roughness: 1, transparent: true }), root, HM.crate[0], 0.005, HM.crate[1] + 0.25); cr.rotation.x = -Math.PI / 2; cr.castShadow = false;
    const nlM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a8).multiplyScalar(1.5), toneMapped: false });
    const moonG = new THREE.Group(); moonG.position.set(HM.nightlight[0], HM.nightlight[1], Dm.z0 + 0.018); root.add(moonG);
    box(0.07, 0.11, 0.02, mat(0xf2efe8, 0.6), 0, 0, -0.005, moonG);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), nlM); moon.position.z = 0.008; moonG.add(moon);
    const bite = new THREE.Mesh(new THREE.CircleGeometry(0.04, 24), mat(0xf2efe8, 0.6)); bite.position.set(0.022, 0.012, 0.009); moonG.add(bite);
    const nightL = new THREE.PointLight(0xffd59a, 0, 2.6, 1.8); nightL.position.set(HM.nightlight[0], HM.nightlight[1] + 0.02, Dm.z0 + 0.3); root.add(nightL);
    extra.setNightlight = (v) => { nightL.intensity = 0.9 * v; nlM.color.setRGB(1.5 * (0.35 + 0.65 * v), 1.31 * (0.35 + 0.65 * v), 0.99 * (0.35 + 0.65 * v)); };
    // shoe bench at the foot of the stairs (Dad's, Mom's and Mia's little pink sneakers)
    rbox(0.42, 0.04, 0.95, 0.01, cw, -3.75, 0.42, 1.25); for (const lz of [-0.42, 0.42]) box(0.4, 0.42, 0.04, cw, -3.75, 0.21, 1.25 + lz);
    [[0.98, 0x5a4636, 1.15], [1.22, 0x9a5a6a, 1.0], [1.45, 0xf3a6b8, 0.68]].forEach(([z, c, sc]) => { for (const dz of [-0.05, 0.05]) { const sh = rbox(0.24 * sc, 0.07 * sc, 0.09 * sc, 0.02, mat(c, 0.7), -3.72, 0.035 * sc, z + dz); sh.rotation.y = Math.PI / 2 + 0.1; } });
    extra.stairY = stairY;
  }
  if (home) pend.position.set(-3.55, 2.1, 0.4);   // the dining pendant's light becomes a hall light by the stairs
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) o.castShadow = false; });

  // night ↔ morning blend (021): setDawn(0) = moonlit night with the lamps on, setDawn(1) = sunrise through the window
  const N = { hemi: [0.55, 0xd8d8ff], sun: [0.35, 0x9ab0ff, [-1.2, 3.6, -7.5]], lampL: 3.2, pend: 0.6, fillL: 1.0, fillD: 0.4 };
  const Mo = { hemi: [1.15, 0xfff0e2], sun: [3.4, 0xffc286, [-3.2, 2.3, -7.5]], lampL: 0, pend: 0, fillL: 1.5, fillD: 1.1 };
  const _c = new THREE.Color(), _d = new THREE.Color();
  function setDawn(k) {
    k = clamp(k);
    if (viewM.map !== views.night) { viewM.map = views.night; viewM.needsUpdate = true; }
    dawnM.opacity = k;
    hemi.intensity = N.hemi[0] + (Mo.hemi[0] - N.hemi[0]) * k; hemi.color.copy(_c.set(N.hemi[1]).lerp(_d.set(Mo.hemi[1]), k));
    sun.intensity = N.sun[0] + (Mo.sun[0] - N.sun[0]) * k; sun.color.copy(_c.set(N.sun[1]).lerp(_d.set(Mo.sun[1]), k));
    const sw = Math.sin(k * Math.PI) * 2.5;   // the light patch sweeps across the floor while the night turns
    sun.position.set(N.sun[2][0] + (Mo.sun[2][0] - N.sun[2][0]) * k - sw, N.sun[2][1] + (Mo.sun[2][1] - N.sun[2][1]) * k, N.sun[2][2]);
    lampL.intensity = N.lampL * (1 - k); pend.intensity = N.pend * (1 - k); fillL.intensity = N.fillL + (Mo.fillL - N.fillL) * k; fillD.intensity = N.fillD + (Mo.fillD - N.fillD) * k;
  }
  function setMode(mode) {
    if (mode === 'morning') { setDawn(1); return; }
    dawnM.opacity = 0;
    viewM.map = views[mode] || views.evening; viewM.needsUpdate = true;
    if (mode === 'evening') { hemi.intensity = 1.05; hemi.color.set(0xfff1e0); sun.intensity = 2.2; sun.color.set(0xffc08a); lampL.intensity = 1.2; pend.intensity = 0.8; fillL.intensity = 1.8; fillD.intensity = 1.0; }
    else if (mode === 'dinner') { hemi.intensity = 0.85; hemi.color.set(0xffe6cc); sun.intensity = 0.5; sun.color.set(0x8a9ad8); lampL.intensity = 2.0; pend.intensity = 4.2; fillL.intensity = 1.2; fillD.intensity = 1.8; }
    else { hemi.intensity = 0.55; hemi.color.set(0xd8d8ff); sun.intensity = 0.35; sun.color.set(0x9ab0ff); lampL.intensity = 3.2; pend.intensity = 0.6; fillL.intensity = 1.0; fillD.intensity = 0.4; }
  }
  setMode('evening');
  return { root, D: DIMS, armchair, diningChairs, setMode, setDawn, setClock, lights: { hemi, sun, lampL, pend, fillL, fillD },
    setUpstairs: extra.setUpstairs || (() => {}), setConsole: extra.setConsole || (() => {}), setNightlight: extra.setNightlight || (() => {}), stairY: extra.stairY || (() => 0) };
}
