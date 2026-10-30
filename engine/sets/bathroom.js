// SET: a cozy family bathroom with NO window (built for video 040, Pip's tornado shelter: "an interior room away from windows").
// Dressed on purpose (no bare scenes): mint subway tile + cream wallpaper, a white alcove tub with a duck shower curtain bunched at
// the end, tap + spout, a shampoo shelf, a rubber duck on the rim, a bath mat, a vanity + mirror + toothbrush cup, a toilet,
// a towel bar with towels, Mia's step stool, a wicker hamper, a plant, a framed fish picture where a window would be, a ceiling
// light, and a door in the front wall that opens onto a lit hallway.
//
// Coordinates (meters, y up). Room x∈[-1.3,1.3], z∈[-1.2,1.3], ceiling 2.5. Cameras live INSIDE the room (all four walls exist).
//   Tub along the back wall: outer x∈[-1.3,0.35], z∈[-1.2,-0.45], rim top DIMS.rimY 0.55, basin floor DIMS.tubFloor 0.1;
//   the dry basin (inside the rim) is DIMS.basin {x0,x1,z0,z1}. Vanity on the right wall (faces −x) at z −0.65, toilet at z 0.3.
//   Door: in the front wall (z = 1.3), opening x∈[0.05,0.95]; `door` = hinge group at its −x edge: rotation.y = −1.45 swings it
//   out into the hallway (clear of the tub's sight line to the doorway); +1.5 swings it into the room. The hallway behind it runs to z ≈ 3.6 (lit, a runner rug + a picture).
// Handles: door, lights {hemi, ceil, fill, hall}, setLight(k) (0 = power flicker off … 1 = on), duck (group on the rim).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex } from '@engine/core.js';

export const DIMS = {
  room: { x0: -1.3, x1: 1.3, z0: -1.2, z1: 1.3, h: 2.5 },
  tub: { x0: -1.3, x1: 0.35, z0: -1.2, z1: -0.45 }, rimY: 0.55, tubFloor: 0.1,
  basin: { x0: -1.2, x1: 0.25, z0: -1.1, z1: -0.55 },
  door: { x0: 0.05, x1: 0.95 }, vanity: [1.02, -0.65], toilet: [1.0, 0.32],
};

export function buildBathroom(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const Dm = DIMS.room, T = DIMS.tub;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 3, r), m, p, x, y, z);

  // ---------------------------------------------------------------- shell
  const floorTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d9d4ca'; g.fillRect(0, 0, w, h);
    const r = 18, dx = r * 1.5, dy = r * Math.sqrt(3);
    for (let i = -1; i < w / dx + 1; i++) for (let j = -1; j < h / dy + 1; j++) {
      const cx = i * dx, cy = j * dy + (i % 2 ? dy / 2 : 0);
      g.fillStyle = (i * 7 + j * 3) % 11 === 0 ? '#9fd0c4' : '#f6f3ec';
      g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.lineTo(cx + (r - 1.5) * Math.cos(a), cy + (r - 1.5) * Math.sin(a)); } g.fill();
    }
  }, [5, 5]);
  const floor = mk(new THREE.PlaneGeometry(2.6, 2.5), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4 }), root, 0, 0, 0.05); floor.rotation.x = -Math.PI / 2;
  const tile = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e2efe9'; g.fillRect(0, 0, w, h); g.fillStyle = '#a9d3c6'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < w; x += 64) { g.fillRect(x + 2, y + 2, 60, 28); } g.fillStyle = 'rgba(255,255,255,.35)'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < w; x += 64) g.fillRect(x + 6, y + 5, 30, 4); }, [3, 3]);
  const paper = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f4e9d4'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(232,150,120,.35)'; for (let y = 20; y < h; y += 64) for (let x = 20; x < w; x += 64) { g.beginPath(); g.arc(x + ((y / 64) % 2) * 32, y, 6, 0, 7); g.fill(); } g.fillStyle = 'rgba(120,180,160,.3)'; for (let y = 52; y < h; y += 64) for (let x = 52; x < w; x += 64) { g.beginPath(); g.ellipse(x - ((y / 64) % 2) * 32, y, 3, 8, 0.6, 0, 7); g.fill(); } }, [3, 2]);
  const tileM = new THREE.MeshStandardMaterial({ map: tile, roughness: 0.25 }), paperM = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 });
  const trim = mat(0xf6f1e6, 0.5);
  const TY = 1.25;   // tile height
  const wall = (w, x, z, ry, holes = null) => {
    // a wall plane pair (tile below TY, paper above), facing into the room; `holes` = [x0, x1, yTop] cut for the door
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    const seg = (a, b, y0, y1, m) => { if (b - a < 0.005 || y1 - y0 < 0.005) return; const p = mk(new THREE.PlaneGeometry(b - a, y1 - y0), m, g, (a + b) / 2, (y0 + y1) / 2, 0); p.castShadow = false; };
    const parts = holes ? [[-w / 2, holes[0], 0, Dm.h], [holes[1], w / 2, 0, Dm.h], [holes[0], holes[1], holes[2], Dm.h]] : [[-w / 2, w / 2, 0, Dm.h]];
    for (const [a, b, y0, y1] of parts) { seg(a, b, y0, Math.max(y0, Math.min(y1, TY)), tileM); seg(a, b, Math.max(y0, TY), y1, paperM); }
    for (const [a, b, y0] of parts) if (y0 < TY) { box(b - a, 0.05, 0.035, trim, (a + b) / 2, TY, 0.017, g); box(b - a, 0.1, 0.02, trim, (a + b) / 2, 0.05, 0.01, g); }
    return g;
  };
  wall(2.6, 0, Dm.z0, 0);                                  // back (behind the tub)
  wall(2.5, Dm.x0, 0.05, Math.PI / 2);                     // left (tub end)
  wall(2.5, Dm.x1, 0.05, -Math.PI / 2);                    // right (vanity + toilet)
  const D = DIMS.door;
  wall(2.6, 0, Dm.z1, Math.PI, [-D.x1, -D.x0, 2.1]);        // front (rotated π: local x = −world x)
  box(2.6, 0.06, 2.5, mat(0xfbf8f2, 0.95), 0, Dm.h + 0.03, 0.05);
  // outer skin so nothing sees through from the hallway side
  box(2.7, Dm.h + 0.1, 0.04, paperM, 0, Dm.h / 2, Dm.z0 - 0.04); box(0.04, Dm.h + 0.1, 2.6, paperM, Dm.x0 - 0.04, Dm.h / 2, 0.05); box(0.04, Dm.h + 0.1, 2.6, paperM, Dm.x1 + 0.04, Dm.h / 2, 0.05);

  // ---------------------------------------------------------------- the tub (white enamel, built-in, apron toward +z)
  const enamel = mat(0xfbfbf8, 0.18), tw = 0.09;
  const tcx = (T.x0 + T.x1) / 2, tcz = (T.z0 + T.z1) / 2, tL = T.x1 - T.x0, tD = T.z1 - T.z0;
  rbox(tL, DIMS.rimY, 0.08, 0.03, enamel, tcx, DIMS.rimY / 2, T.z1 - 0.04);                       // apron
  rbox(tw + 0.04, DIMS.rimY, tD, 0.03, enamel, T.x1 - (tw + 0.04) / 2, DIMS.rimY / 2, tcz);        // foot end
  rbox(tw, DIMS.rimY, tD, 0.03, enamel, T.x0 + tw / 2, DIMS.rimY / 2, tcz);                        // tap end
  rbox(tL, DIMS.rimY, tw, 0.03, enamel, tcx, DIMS.rimY / 2, T.z0 + tw / 2);                        // back
  const basinM = mat(0xf2f4f2, 0.2);
  rbox(tL - 0.12, DIMS.tubFloor, tD - 0.1, 0.03, basinM, tcx, DIMS.tubFloor / 2, tcz);              // basin floor
  mk(new THREE.CircleGeometry(0.025, 14), mat(0x9aa3ad, 0.3, { metalness: 0.8 }), root, T.x0 + 0.2, DIMS.tubFloor + 0.002, tcz).rotation.x = -Math.PI / 2;   // drain
  // tap + spout + knobs on the left wall
  const chrome = mat(0xd8dde2, 0.15, { metalness: 0.9 });
  const sp = mk(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 12), chrome, root, Dm.x0 + 0.08, 0.78, tcz); sp.rotation.z = Math.PI / 2;
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10), chrome, root, Dm.x0 + 0.15, 0.755, tcz);
  for (const s of [-1, 1]) { mk(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12), chrome, root, Dm.x0 + 0.03, 0.98, tcz + s * 0.13).rotation.z = Math.PI / 2; mk(new THREE.SphereGeometry(0.014, 8, 6), mat(s < 0 ? 0xd2483f : 0x3d7bd9, 0.4), root, Dm.x0 + 0.06, 0.98, tcz + s * 0.13); }
  const head = mk(new THREE.CylinderGeometry(0.06, 0.04, 0.04, 14), chrome, root, Dm.x0 + 0.14, 1.95, tcz); head.rotation.z = -1.1;
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), chrome, root, Dm.x0 + 0.07, 1.98, tcz).rotation.z = Math.PI / 2;
  // shower curtain rod + the curtain bunched at the tap end (ducks on it)
  const rod = mk(new THREE.CylinderGeometry(0.012, 0.012, tL, 10), chrome, root, tcx, 2.02, T.z1 + 0.02); rod.rotation.z = Math.PI / 2;
  const curtTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fd0e8'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); for (let y = 30; y < h; y += 64) for (let x = 20; x < w; x += 64) { g.fillStyle = '#f2c14e'; g.beginPath(); g.ellipse(x + ((y / 64) % 2) * 32, y, 13, 9, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + ((y / 64) % 2) * 32 + 9, y - 10, 7, 0, 7); g.fill(); g.fillStyle = '#e8762b'; g.fillRect(x + ((y / 64) % 2) * 32 + 15, y - 11, 6, 3); } }, [2, 3]);
  const cg = new THREE.PlaneGeometry(0.45, 1.75, 24, 1); { const p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.05 * Math.sin(p.getX(i) * 42)); cg.computeVertexNormals(); }
  const curt = mk(cg, new THREE.MeshStandardMaterial({ map: curtTex, roughness: 0.8, side: THREE.DoubleSide }), root, T.x0 + 0.3, 2.02 - 0.875, T.z1 + 0.02); curt.castShadow = false;
  // shampoo shelf on the back wall + bottles, a rubber duck on the rim
  rbox(0.7, 0.03, 0.12, 0.01, trim, -0.45, 1.15, Dm.z0 + 0.06);
  [[0xe2574c, 0.16, 0.035], [0x58b3a8, 0.2, 0.03], [0xf2c14e, 0.13, 0.04], [0xb9a3e3, 0.18, 0.028]].forEach(([c, h, r], i) => { mk(new THREE.CylinderGeometry(r, r, h, 12), mat(c, 0.35), root, -0.72 + i * 0.17, 1.165 + h / 2, Dm.z0 + 0.06); mk(new THREE.CylinderGeometry(r * 0.4, r * 0.5, 0.03, 8), mat(0xf6f1e6, 0.4), root, -0.72 + i * 0.17, 1.18 + h, Dm.z0 + 0.06); });
  const duck = new THREE.Group(); duck.position.set(T.x1 - 0.12, DIMS.rimY, T.z0 + 0.08); duck.rotation.y = -0.6; root.add(duck);
  const yel = mat(0xf6c832, 0.35);
  mk(new THREE.SphereGeometry(0.05, 14, 10), yel, duck, 0, 0.04, 0).scale.set(1.2, 0.85, 1);
  mk(new THREE.SphereGeometry(0.032, 12, 10), yel, duck, 0.035, 0.095, 0);
  mk(new THREE.ConeGeometry(0.014, 0.03, 8), mat(0xe8762b, 0.4), duck, 0.072, 0.09, 0).rotation.z = -Math.PI / 2;
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.006, 6, 5), mat(0x111111, 0.3), duck, 0.052, 0.105, s * 0.02);
  // bath mat
  const matTex = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#e8a0a8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 4; x < w; x += 10) g.fillRect(x, 0, 4, h); });
  rbox(0.8, 0.015, 0.45, 0.006, new THREE.MeshStandardMaterial({ map: matTex, roughness: 1 }), -0.45, 0.008, -0.12);

  // ---------------------------------------------------------------- vanity + mirror + toilet (right wall)
  const wood = mat(0x7fb3a6, 0.6), top = mat(0xf2efe8, 0.25);
  const [vx, vz] = DIMS.vanity;
  rbox(0.52, 0.8, 0.8, 0.02, wood, vx, 0.4, vz); rbox(0.56, 0.05, 0.84, 0.015, top, vx - 0.02, 0.825, vz);
  for (const s of [-1, 1]) { box(0.01, 0.6, 0.36, mat(0x6fa396, 0.6), vx - 0.265, 0.42, vz + s * 0.2); mk(new THREE.SphereGeometry(0.015, 8, 6), chrome, root, vx - 0.28, 0.6, vz + s * 0.05); }
  mk(new THREE.CylinderGeometry(0.17, 0.13, 0.06, 20), mat(0xfbfbf8, 0.2), root, vx - 0.02, 0.86, vz);
  const fau = mk(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 10), chrome, root, vx + 0.18, 0.92, vz); fau.rotation.z = 0.9;
  box(0.03, 0.7, 0.55, mat(0x3a5a52, 0.5), Dm.x1 - 0.015, 1.55, vz);
  const mir = mk(new THREE.PlaneGeometry(0.5, 0.64), new THREE.MeshStandardMaterial({ color: 0xcfe2ea, roughness: 0.05, metalness: 0.6 }), root, Dm.x1 - 0.034, 1.55, vz); mir.rotation.y = -Math.PI / 2;
  mk(new THREE.CylinderGeometry(0.03, 0.025, 0.09, 12), mat(0xf2c14e, 0.4), root, vx + 0.1, 0.895, vz + 0.27);
  [[0xe2574c, 0.02], [0x3d7bd9, -0.02], [0xf3a6b8, 0]].forEach(([c, dz], i) => { const b = mk(new THREE.CylinderGeometry(0.006, 0.006, 0.17, 6), mat(c, 0.4), root, vx + 0.1 + (i - 1) * 0.012, 0.98, vz + 0.27 + dz); b.rotation.z = (i - 1) * 0.15; });
  rbox(0.08, 0.04, 0.05, 0.015, mat(0xf3d6e0, 0.6), vx + 0.05, 0.87, vz - 0.3);
  const [tx, tz] = DIMS.toilet, por = mat(0xfbfbf8, 0.2);
  rbox(0.2, 0.42, 0.42, 0.03, por, tx + 0.18, 0.62, tz);                                   // tank
  mk(new THREE.CylinderGeometry(0.17, 0.13, 0.38, 20), por, root, tx - 0.08, 0.19, tz).scale.set(1.25, 1, 1);
  const seat = mk(new THREE.TorusGeometry(0.16, 0.035, 8, 22), por, root, tx - 0.1, 0.4, tz); seat.rotation.x = Math.PI / 2; seat.scale.set(1.2, 1, 1);
  rbox(0.4, 0.035, 0.36, 0.015, por, tx - 0.1, 0.42, tz);                                  // lid down
  // toilet paper on a holder
  mk(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 14), mat(0xffffff, 0.9), root, Dm.x1 - 0.1, 0.72, tz - 0.42).rotation.x = Math.PI / 2;

  // ---------------------------------------------------------------- towel bar + towels (front wall, left of the door), stool, hamper, plant, picture
  box(0.8, 0.02, 0.02, chrome, -0.62, 1.15, Dm.z1 - 0.06);
  const towel = (x, c, w) => { const tg = new THREE.PlaneGeometry(w, 0.62, 8, 6); const p = tg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, -0.015 * Math.sin(p.getX(i) * 18) - 0.02 * (0.31 - p.getY(i))); tg.computeVertexNormals(); const m = mk(tg, mat(c, 0.95, { side: THREE.DoubleSide }), root, x, 0.86, Dm.z1 - 0.075); m.rotation.y = Math.PI; m.castShadow = false; };
  towel(-0.82, 0xf2b8a0, 0.34); towel(-0.44, 0x9fd0c4, 0.32);
  const stool = new THREE.Group(); stool.position.set(0.72, 0, 0.82); stool.rotation.y = -0.3; root.add(stool);
  rbox(0.38, 0.04, 0.25, 0.01, mat(0xe9a6b8, 0.6), 0, 0.22, 0, stool); for (const s of [-1, 1]) box(0.03, 0.2, 0.22, mat(0xe9a6b8, 0.6), s * 0.16, 0.1, 0, stool);
  const lab = mk(new THREE.PlaneGeometry(0.2, 0.06), new THREE.MeshStandardMaterial({ map: canvasTex(128, 40, (g, w, h) => { g.fillStyle = '#e9a6b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MIA', w / 2, h / 2 + 2); }), roughness: 0.7 }), stool, 0, 0.243, 0); lab.rotation.x = -Math.PI / 2;
  const ham = mk(new THREE.CylinderGeometry(0.17, 0.15, 0.5, 18, 1, true), new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#c8a26a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 4, h); g.stroke(); } for (let y = 4; y < h; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [3, 1]), roughness: 0.9, side: THREE.DoubleSide }), root, -1.08, 0.25, 0.95);
  mk(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 18), mat(0xb08a52, 0.8), root, -1.08, 0.51, 0.95); void ham;
  mk(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 12), mat(0xe2574c, 0.6), root, 0.25, 1.21, Dm.z0 + 0.08);
  for (let k = 0; k < 6; k++) { const lf = mk(new THREE.SphereGeometry(0.05, 8, 6), mat(0x4f8a3f, 0.8), root, 0.25 + Math.cos(k) * 0.05, 1.32 + (k % 3) * 0.04, Dm.z0 + 0.1 + Math.sin(k) * 0.04); lf.scale.set(0.6, 1.3, 0.6); }
  // the framed fish picture (where a window would be — this room has none)
  box(0.62, 0.48, 0.03, mat(0xc9a25a, 0.4), -0.45, 1.75, Dm.z0 + 0.016);
  const pic = mk(new THREE.PlaneGeometry(0.54, 0.4), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(270, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bfe6f2'); gr.addColorStop(1, '#5fa8c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f28a2a'; g.beginPath(); g.ellipse(w * 0.45, h * 0.5, 50, 30, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * 0.62, h * 0.5); g.lineTo(w * 0.78, h * 0.32); g.lineTo(w * 0.78, h * 0.68); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(w * 0.36, h * 0.45, 9, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(w * 0.35, h * 0.45, 4, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; for (const [x, y, r] of [[60, 40, 8], [80, 22, 5], [52, 16, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.fillStyle = '#3f9a4a'; for (let i = 0; i < 5; i++) g.fillRect(180 + i * 14, h - 60 + (i % 2) * 12, 6, 60); }) }), root, -0.45, 1.75, Dm.z0 + 0.033);
  void pic;
  // a wall cabinet on the left wall above the hamper
  rbox(0.18, 0.5, 0.45, 0.01, wood, Dm.x0 + 0.09, 1.65, 0.75);

  // ---------------------------------------------------------------- the door + the hallway behind it
  const door = new THREE.Group(); door.position.set(D.x0, 0, Dm.z1 - 0.03); root.add(door);   // hinge at the −x edge
  rbox(D.x1 - D.x0 - 0.02, 2.06, 0.045, 0.01, mat(0xfbf8f2, 0.5), (D.x1 - D.x0) / 2, 1.04, 0, door);
  for (const [y, h] of [[1.5, 0.7], [0.55, 0.75]]) box(0.62, h, 0.012, mat(0xf1ece2, 0.5), (D.x1 - D.x0) / 2, y, -0.028, door);
  mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0xc9a25a, 0.3, { metalness: 0.7 }), door, (D.x1 - D.x0) - 0.08, 1.0, -0.04);
  box(0.06, 2.12, 0.08, trim, D.x0 - 0.03, 1.06, Dm.z1); box(0.06, 2.12, 0.08, trim, D.x1 + 0.03, 1.06, Dm.z1); box(D.x1 - D.x0 + 0.12, 0.06, 0.08, trim, (D.x0 + D.x1) / 2, 2.13, Dm.z1);
  const hall = new THREE.Group(); root.add(hall);
  const hpaper = new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9dcc4'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(190,150,110,.22)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 10, h); }, [4, 2]), roughness: 0.9 });
  const hfloor = mk(new THREE.PlaneGeometry(2.0, 2.6), new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#b98a5e', '#c4956a', '#ad7f55', '#bf9064'][i % 4]; g.fillRect(i * 32, 0, 32, h); } }, [2, 2]), roughness: 0.55 }), hall, 0.5, 0, Dm.z1 + 1.3); hfloor.rotation.x = -Math.PI / 2;
  mk(new THREE.PlaneGeometry(0.6, 2.4), mat(0x6e3f5a, 0.95), hall, 0.5, 0.004, Dm.z1 + 1.3).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) { const w2 = mk(new THREE.PlaneGeometry(2.6, Dm.h), hpaper, hall, 0.5 + s * 1.0, Dm.h / 2, Dm.z1 + 1.3); w2.rotation.y = -s * Math.PI / 2; }
  const hb = mk(new THREE.PlaneGeometry(2.0, Dm.h), hpaper, hall, 0.5, Dm.h / 2, Dm.z1 + 2.6); hb.rotation.y = Math.PI;
  box(2.0, 0.05, 2.6, mat(0xfbf8f2, 0.95), 0.5, Dm.h + 0.025, Dm.z1 + 1.3, hall);
  box(0.5, 0.4, 0.03, mat(0x3a2a20, 0.5), 0.5, 1.5, Dm.z1 + 2.58, hall);
  const hpic = mk(new THREE.PlaneGeometry(0.44, 0.34), new THREE.MeshStandardMaterial({ map: canvasTex(220, 170, (g, w, h) => { g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#dc8434'; g.beginPath(); g.ellipse(w / 2, h * 0.62, 50, 30, 0, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2 + 40, h * 0.42, 26, 0, 7); g.fill(); g.fillStyle = '#d2483f'; g.font = 'bold 24px Georgia'; g.textAlign = 'center'; g.fillText('PIP', w / 2, h * 0.95); }), roughness: 0.8 }), hall, 0.5, 1.5, Dm.z1 + 2.56); hpic.rotation.y = Math.PI;

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0xb8d8cc, opts.ambient ?? 0.95); root.add(hemi);
  const ceilM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(1.6), toneMapped: false });
  mk(new THREE.SphereGeometry(0.16, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), ceilM, root, -0.1, Dm.h, 0.05).castShadow = false;
  const ceil = new THREE.PointLight(0xffe6c4, 3.0, 7, 1.4); ceil.position.set(-0.1, Dm.h - 0.3, 0.05); ceil.castShadow = true; ceil.shadow.mapSize.set(1024, 1024); ceil.shadow.bias = -0.002; root.add(ceil);
  const fill = new THREE.PointLight(0xfff0e0, 1.0, 6, 1.4); fill.position.set(0.6, 1.8, 1.0); root.add(fill);
  const hallL = new THREE.PointLight(0xffd29a, 1.6, 5, 1.5); hallL.position.set(0.5, 2.1, Dm.z1 + 1.4); hall.add(hallL);
  const base = { hemi: hemi.intensity, ceil: 3.0, fill: 1.0 };
  function setLight(k) { hemi.intensity = base.hemi * (0.45 + 0.55 * k); ceil.intensity = base.ceil * k; fill.intensity = base.fill * (0.4 + 0.6 * k); ceilM.color.setRGB(1.6 * (0.3 + 0.7 * k), 1.52 * (0.3 + 0.7 * k), 1.38 * (0.3 + 0.7 * k)); }
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) o.castShadow = false; if (o.isMesh) o.receiveShadow = true; });
  return { root, D: DIMS, door, hall, duck, setLight, lights: { hemi, ceil, fill, hall: hallL } };
}
