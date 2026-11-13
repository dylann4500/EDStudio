// Library stacks at night (086, the first POV story): the 4th floor of a university library, built for a SEATED POV at a
// study table looking down one long aisle. Toon look: flat Lambert colours (ink outlines come from look.js addInk).
// Root-local: floor y 0, ceiling D.ceil (3.0). You sit at D.seat facing −z; your table top is D.tableY with its near edge at
// z = D.tableZ1. The main aisle runs −z (|x| < D.aisle) between two long double-faced shelf ranges, broken by cross aisles
// at D.cross (z) — places for a flashlight to swing through. The back wall (z = D.back) has the stairwell door
// (`door` hinge group: rotation.y −1.2 = open into the room; `stair` = the lit stairwell behind it) under a green EXIT sign.
//   const L = buildStacks(studio);  L.setBanks([1, 1, 0, 0, …])  (ceiling banks far → near, 0 = off)  L.setLamp(k)  L.setStair(k)
//   L.setDoor(θ)  L.setClock(h, m)  L.sheet (the worksheet mesh: give it a texture)  L.lights { hemi, moon, banks[], lamp, exit, stair }
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, rng } from '../core.js';

const PI = Math.PI;
export const D = {
  ceil: 3.0, back: -18, front: 4, wallX: 6, aisle: 0.95, shelfH: 2.25, cross: [-5.6, -11.2], crossW: 1.3,
  seat: [0, 0.55], eye: 1.17, tableY: 0.74, tableZ0: -0.5, tableZ1: 0.3, tableX: 0.8,
  banks: [-16.2, -13.6, -10.0, -7.0, -4.0, -1.4, 1.2],   // ceiling light banks, far → near (the last one is over your table)
  door: [0, -18], lamp: [-0.52, -0.22], sheet: [0.02, 0.02], phoneRest: [0.36, 0.06],
};
const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });

function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

// books on one face of a shelf range: rows of thin boxes with a little jitter (colors per instance)
function bookRows(list, R, { x0, x1, z, rows, y0, rowH, face, along = 'z' }) {
  for (let r = 0; r < rows; r++) {
    let u = x0;
    while (u < x1 - 0.03) {
      const w = 0.03 + R() * 0.035, h = rowH * (0.62 + R() * 0.26), d = 0.18 + R() * 0.06;
      if (R() < 0.05) { u += 0.06 + R() * 0.1; continue; }   // gaps: a shelf that's been read
      const lean = R() < 0.05 ? (R() - 0.5) * 0.5 : 0;
      list.push({ along, u: u + w / 2, z: z + face * (0.25 - d / 2 - 0.01), y: y0 + r * rowH + h / 2 + 0.02, w, h, d, lean });
      u += w + 0.003;
    }
  }
}

export function buildStacks(studio, { seed = 86 } = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const R = rng(seed);
  // ---- room shell -------------------------------------------------------------------------------------------------
  const carpet = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#56637e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '30,36,54' : '150,160,190'},${0.08 + R() * 0.12})`; g.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
    g.strokeStyle = 'rgba(30,36,54,.35)'; g.lineWidth = 3; for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(k * 128, 0); g.lineTo(k * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, k * 128); g.lineTo(w, k * 128); g.stroke(); }
  }, [12, 22]);
  const W = D.wallX, L = D.front - D.back, zc = (D.front + D.back) / 2;
  const floor = mk(new THREE.PlaneGeometry(2 * W, L), lam(0xffffff, { map: carpet }), root, 0, 0, zc); floor.rotation.x = -PI / 2;
  const tiles = tex(256, 256, (g, w, h) => { g.fillStyle = '#d9d4c7'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,80,90,.35)'; g.lineWidth = 4; g.strokeRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(90,90,100,.18)'; g.fillRect(R() * w, R() * h, 2, 2); } }, [2 * W / 0.6, L / 0.6]);
  const ceil = mk(new THREE.PlaneGeometry(2 * W, L), lam(0xffffff, { map: tiles }), root, 0, D.ceil, zc); ceil.rotation.x = PI / 2;
  const wallM = lam(0xe9dfc8), trimM = lam(0x8a6a4a);
  {   // back wall in three pieces round the stairwell doorway (a single plane hid the stairwell behind the open door)
    const [dx0, hw, dh0] = [D.door[0], 0.96 / 2 + 0.08, 2.15 + 0.08];
    const lw = dx0 - hw + W, rw = W - (dx0 + hw);
    mk(new THREE.PlaneGeometry(lw, D.ceil), wallM, root, -W + lw / 2, D.ceil / 2, D.back);
    mk(new THREE.PlaneGeometry(rw, D.ceil), wallM, root, W - rw / 2, D.ceil / 2, D.back);
    mk(new THREE.PlaneGeometry(2 * hw, D.ceil - dh0), wallM, root, dx0, dh0 + (D.ceil - dh0) / 2, D.back);
  }
  const front = mk(new THREE.PlaneGeometry(2 * W, D.ceil), wallM, root, 0, D.ceil / 2, D.front); front.rotation.y = PI;
  const right = mk(new THREE.PlaneGeometry(L, D.ceil), wallM, root, W, D.ceil / 2, zc); right.rotation.y = -PI / 2;
  // left wall with four tall night windows (built from boxes around the openings, a campus card outside)
  const winZ = [-15.2, -10.8, -6.4, -2.0], winW = 2.0, winY0 = 0.9, winY1 = 2.55;
  const leftG = new THREE.Group(); root.add(leftG);
  const seg = (z0, z1, y0, y1) => { const b = mk(new THREE.BoxGeometry(0.2, y1 - y0, z1 - z0), wallM, leftG, -W - 0.1, (y0 + y1) / 2, (z0 + z1) / 2); b.userData.noInk = true; return b; };
  let zPrev = D.back;
  for (const z of winZ) { seg(zPrev, z - winW / 2, 0, D.ceil); seg(z - winW / 2, z + winW / 2, 0, winY0); seg(z - winW / 2, z + winW / 2, winY1, D.ceil); zPrev = z + winW / 2;
    for (const [a, b2] of [[z - winW / 2, z - winW / 2], [z + winW / 2, z + winW / 2]]) mk(new THREE.BoxGeometry(0.24, winY1 - winY0, 0.07), trimM, leftG, -W, (winY0 + winY1) / 2, a);
    mk(new THREE.BoxGeometry(0.3, 0.06, winW + 0.1), trimM, leftG, -W + 0.04, winY0, z); mk(new THREE.BoxGeometry(0.24, 0.07, winW), trimM, leftG, -W, winY1, z);
    mk(new THREE.BoxGeometry(0.06, winY1 - winY0, 0.04), trimM, leftG, -W, (winY0 + winY1) / 2, z); }
  seg(zPrev, D.front, 0, D.ceil);
  const night = tex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1230'); gr.addColorStop(0.7, '#1d2a5c'); gr.addColorStop(1, '#2c3a6e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`; const s = 1 + R() * 2; g.fillRect(R() * w, R() * h * 0.55, s, s); }
    g.fillStyle = '#f4f0dc'; g.beginPath(); g.arc(w * 0.72, h * 0.2, 34, 0, 2 * PI); g.fill(); g.fillStyle = '#1d2a5c'; g.beginPath(); g.arc(w * 0.72 + 14, h * 0.2 - 8, 30, 0, 2 * PI); g.fill();
    for (let i = 0; i < 9; i++) {   // campus buildings with a few lit windows
      const bx = i * 120 - 30 + R() * 40, bw = 90 + R() * 80, bh = 110 + R() * 140; g.fillStyle = '#121a3a'; g.fillRect(bx, h - bh, bw, bh);
      for (let yy = h - bh + 14; yy < h - 10; yy += 22) for (let xx = bx + 10; xx < bx + bw - 10; xx += 18) if (R() < 0.22) { g.fillStyle = R() < 0.5 ? '#ffd27a' : '#ffe9b0'; g.fillRect(xx, yy, 8, 11); }
    }
    g.fillStyle = '#0d142e'; for (let x = 0; x < w; x += 6) g.fillRect(x, h - 18 - Math.abs(Math.sin(x * 0.05)) * 12, 6, 30);   // treeline
  });
  const outside = mk(new THREE.PlaneGeometry(L, 9), basic(0xffffff, { map: night, fog: false }), root, -W - 1.6, 2.2, zc); outside.rotation.y = PI / 2;
  const glassM = new THREE.MeshBasicMaterial({ color: 0x9fb7ff, transparent: true, opacity: 0.08, depthWrite: false });
  for (const z of winZ) { const gl = mk(new THREE.PlaneGeometry(winW, winY1 - winY0), glassM, root, -W + 0.02, (winY0 + winY1) / 2, z); gl.rotation.y = PI / 2; }

  // ---- shelf ranges -----------------------------------------------------------------------------------------------
  const wood = lam(0xa8794c), woodD = lam(0x7c5636), list = [];
  const rows = 6, rowH = (D.shelfH - 0.12) / rows;
  function range(cx, z0, z1, { faces = [-1, 1], sign = null } = {}) {   // a double-faced range along z (faces ±x)
    const g = new THREE.Group(); root.add(g); const len = z1 - z0, zm = (z0 + z1) / 2;
    mk(new THREE.BoxGeometry(0.03, D.shelfH, len), woodD, g, cx, D.shelfH / 2, zm);                         // central divider
    mk(new THREE.BoxGeometry(0.54, 0.05, len + 0.04), wood, g, cx, D.shelfH, zm);                              // top cap
    for (const z of [z0, z1]) mk(new THREE.BoxGeometry(0.54, D.shelfH, 0.05), wood, g, cx, D.shelfH / 2, z);  // end panels
    for (let r = 0; r <= rows; r++) mk(new THREE.BoxGeometry(0.5, 0.025, len), wood, g, cx, 0.06 + r * rowH, zm);
    mk(new THREE.BoxGeometry(0.5, 0.07, len), woodD, g, cx, 0.035, zm);
    for (const f of faces) bookRows(list, R, { x0: z0 + 0.04, x1: z1 - 0.04, z: cx, rows, y0: 0.075, rowH, face: f, along: 'z' });
    if (sign) for (const z of [z0, z1]) {   // end-cap call-number card
      const st = tex(256, 128, (c, w, h) => { c.fillStyle = '#f6f1e3'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a3550'; c.fillRect(0, 0, w, 26); c.font = '700 54px Inter, Arial'; c.fillStyle = '#1e2433'; c.textAlign = 'center'; c.fillText(sign, w / 2, 96); });
      const p = mk(new THREE.PlaneGeometry(0.34, 0.17), lam(0xffffff, { map: st }), g, cx, 1.5, z + (z === z0 ? -0.027 : 0.027)); if (z === z0) p.rotation.y = PI;
    }
    return g;
  }
  const xA = D.aisle + 0.27, segs = [[D.back + 0.9, D.cross[1] - D.crossW / 2], [D.cross[1] + D.crossW / 2, D.cross[0] - D.crossW / 2], [D.cross[0] + D.crossW / 2, -1.3]];
  const calls = [['QD 1–71', 'QC 1–99'], ['QA 76–94', 'PZ 1–95'], ['QA 1–75', 'PS 1–3626']];
  segs.forEach(([a, b], i) => { range(-xA, a, b, { sign: calls[i][0] }); range(xA, a, b, { sign: calls[i][1] }); range(-xA - 1.9, a, b); range(xA + 1.9, a, b); range(-xA - 3.8, a, b, { faces: [1] }); range(xA + 3.8, a, b, { faces: [-1] }); });
  // instanced books (one mesh, per-instance colour)
  const cols = [0xb83a3a, 0x2f5ea8, 0x3f8f5a, 0xd9a441, 0x6b3fa0, 0x8a5a3a, 0x34495e, 0xc96a3a, 0x3a7c8c, 0xe8dcc0, 0x9b2f4f, 0x5c7a2e];
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam(0xffffff), list.length);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color(), V = new THREE.Vector3(), S = new THREE.Vector3();
  list.forEach((b, i) => {   // 'z' ranges: u runs along z, the face offset is in x
    V.set(b.z, b.y, b.u); S.set(b.d, b.h, b.w); Q.setFromEuler(E.set(b.lean, 0, 0)); M4.compose(V, Q, S); books.setMatrixAt(i, M4); books.setColorAt(i, C.setHex(cols[Math.floor(R() * cols.length)]));
  });
  root.add(books);

  // ---- back wall: stairwell door + EXIT + clock -------------------------------------------------------------------
  const [dx, dz] = D.door, dw = 0.96, dh = 2.15;
  const frameM = lam(0x6b5a4a);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, dh + 0.06, 0.14), frameM, root, dx + s * (dw / 2 + 0.04), (dh + 0.06) / 2, dz + 0.04);
  mk(new THREE.BoxGeometry(dw + 0.16, 0.08, 0.14), frameM, root, dx, dh + 0.04, dz + 0.04);
  const door = new THREE.Group(); door.position.set(dx - dw / 2, 0, dz + 0.03); root.add(door);   // hinge on the left jamb
  const doorM = lam(0x52617d);
  mk(new THREE.BoxGeometry(dw, dh, 0.05), doorM, door, dw / 2, dh / 2, 0);
  const winM = basic(0x2a2f3f);
  const dwin = mk(new THREE.PlaneGeometry(0.16, 0.7), winM, door, dw / 2 + 0.2, 1.45, 0.027);
  mk(new THREE.BoxGeometry(0.1, 0.03, 0.06), lam(0xc9c9cf), door, dw - 0.14, 1.02, 0.05);   // push bar handle
  mk(new THREE.BoxGeometry(0.66, 0.06, 0.08), lam(0xb8b8c0), door, dw / 2, 1.0, 0.05);
  // the stairwell behind it: a small lit box + a few steps going up
  const stair = new THREE.Group(); root.add(stair); stair.position.set(dx, 0, dz - 0.05);
  const sM = lam(0xd8c79a);
  mk(new THREE.BoxGeometry(2.2, 0.05, 2.6), lam(0x8d8a80), stair, 0, 0.0, -1.3);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.05, 3, 2.6), sM, stair, s * 1.1, 1.5, -1.3);
  mk(new THREE.BoxGeometry(2.2, 3, 0.05), sM, stair, 0, 1.5, -2.6);
  for (let i = 0; i < 7; i++) mk(new THREE.BoxGeometry(1.0, 0.17, 0.3), lam(0x9a9688), stair, 0.45, 0.085 + i * 0.17, -0.7 - i * 0.28).scale.y = 1 + i * 0;
  mk(new THREE.BoxGeometry(0.05, 0.05, 2.0), lam(0xd7b23a), stair, -0.05, 1.0, -1.4);   // yellow handrail
  const stairLight = new THREE.PointLight(0xffc77a, 0, 6, 2); stairLight.position.set(0, 2.5, -1.3); stair.add(stairLight);
  const exitT = tex(256, 96, (c, w, h) => { c.fillStyle = '#0f6a35'; c.fillRect(0, 0, w, h); c.font = '800 70px Inter, Arial'; c.fillStyle = '#d8ffe6'; c.textAlign = 'center'; c.fillText('EXIT', w / 2, 74); });
  const exitBox = mk(new THREE.BoxGeometry(0.46, 0.18, 0.08), basic(0xffffff, { map: exitT, toneMapped: false }), root, dx, dh + 0.32, dz + 0.06);
  const exitL = new THREE.PointLight(0x5cff8a, 1.4, 3.5, 2); exitL.position.set(dx, dh + 0.2, dz + 0.4); root.add(exitL);
  // a clock over the right side of the door
  const clockG = new THREE.Group(); clockG.position.set(dx + 1.5, 2.5, dz + 0.05); root.add(clockG);
  const face = mk(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32), lam(0xfaf7ee), clockG, 0, 0, 0); face.rotation.x = PI / 2;
  mk(new THREE.TorusGeometry(0.2, 0.025, 8, 32), lam(0x222222), clockG, 0, 0, 0.02);
  const hand = (len, w) => { const p = new THREE.Group(); p.position.z = 0.032; clockG.add(p); mk(new THREE.BoxGeometry(w, len, 0.01), basic(0x111111), p, 0, len / 2 - 0.02, 0); return p; };
  const hh = hand(0.11, 0.025), mh = hand(0.16, 0.016);
  const setClock = (h, m) => { mh.rotation.z = -(m / 60) * 2 * PI; hh.rotation.z = -((h % 12) / 12 + m / 720) * 2 * PI; };
  setClock(11, 58);
  // a fire extinguisher + a QUIET FLOOR sign hanging over the aisle + a water fountain on the right wall
  const ext = new THREE.Group(); ext.position.set(dx - 1.15, 0.9, dz + 0.15); root.add(ext);
  mk(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 16), lam(0xc22b2b), ext); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 10), lam(0x222222), ext, 0, 0.25, 0);
  const qT = tex(512, 160, (c, w, h) => { c.fillStyle = '#233050'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8dcc0'; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.font = '800 70px Inter, Arial'; c.fillStyle = '#f4ecd6'; c.textAlign = 'center'; c.fillText('QUIET FLOOR', w / 2, 106); });
  const quiet = mk(new THREE.BoxGeometry(1.1, 0.34, 0.03), lam(0xffffff, { map: qT }), root, 0, 2.62, -8.4);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 6), lam(0x333333), root, s * 0.45, 2.9, -8.4);

  // ---- ceiling light banks ---------------------------------------------------------------------------------------
  const panelOn = basic(0xfffbef, { toneMapped: false }), panelOff = lam(0x8d8a84);
  const banks = D.banks.map((z) => {
    const ms = [];
    for (const x of [-3.6, 0, 3.6]) { const p = mk(new THREE.BoxGeometry(x ? 0.6 : 0.5, 0.04, 1.4), panelOn, root, x, D.ceil - 0.025, z); p.userData.noInk = true; ms.push(p); }
    return ms;
  });
  const bankLights = [-13.6, -7.0, -2.2, 0.9].map((z) => { const l = new THREE.PointLight(0xfff3dc, 0, 14, 1.6); l.position.set(0, D.ceil - 0.3, z); root.add(l); return l; });
  const hemi = new THREE.HemisphereLight(0x9fb2ff, 0x30354a, 1.0); root.add(hemi);
  const moon = new THREE.DirectionalLight(0xa8b8ff, 0.35); moon.position.set(-14, 9, -4); moon.target.position.set(0, 0, -6); root.add(moon, moon.target);

  // ---- the study area: your table (+ two more), chairs, lamp, worksheet, props ------------------------------------
  const tableM = lam(0xb98b5a), legM = lam(0x4a4a52);
  function table(x, z, w = 1.6, d = 0.8) {
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    mk(new RoundedBoxGeometry(w, 0.05, d, 2, 0.012), tableM, g, 0, D.tableY - 0.025, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(new THREE.BoxGeometry(0.05, D.tableY - 0.05, 0.05), legM, g, sx * (w / 2 - 0.08), (D.tableY - 0.05) / 2, sz * (d / 2 - 0.08));
    if (x !== 0) mk(new THREE.BoxGeometry(w - 0.2, 0.06, 0.03), legM, g, 0, 0.15, 0);   // no crossbar under YOUR table (the under-table POV looks through it)
    return g;
  }
  function chair(x, z, rotY = 0, color = 0x3f5a8a) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; root.add(g);
    const M = lam(color);
    mk(new RoundedBoxGeometry(0.44, 0.05, 0.42, 2, 0.015), M, g, 0, 0.45, 0);
    mk(new RoundedBoxGeometry(0.44, 0.38, 0.04, 2, 0.015), M, g, 0, 0.73, -0.2);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6), legM, g, sx * 0.19, 0.225, sz * 0.18);
    return g;
  }
  const tz = (D.tableZ0 + D.tableZ1) / 2;
  const myTable = table(0, tz, 2 * D.tableX, D.tableZ1 - D.tableZ0);
  const otherChair = chair(0.62, D.tableZ0 - 0.32, 0.25);   // across from you, pushed right (the under-table POV looks down the aisle past it)
  const sideChair = chair(-0.75, D.tableZ1 + 0.3, PI + 0.25, 0x3f5a8a);
  table(-3.0, tz - 0.4); chair(-3.0, D.tableZ0 - 0.75, 0); chair(-3.3, D.tableZ1 + 0.1, PI);
  table(3.0, tz - 0.4); chair(3.2, D.tableZ1 + 0.1, PI); chair(2.6, D.tableZ0 - 0.75, 0.2);
  // banker's lamp
  const lampG = new THREE.Group(); lampG.position.set(D.lamp[0], D.tableY, D.lamp[1]); root.add(lampG);
  const brass = lam(0xc9a24a);
  mk(new THREE.CylinderGeometry(0.08, 0.09, 0.025, 20), brass, lampG, 0, 0.012, 0);
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), brass, lampG, 0, 0.16, 0);
  const shade = mk(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 24, 1, false, 0, PI), lam(0x1f6e43, { side: THREE.DoubleSide }), lampG, 0, 0.32, 0.02);
  shade.rotation.set(0, 0, PI / 2); shade.rotation.x = -PI / 2 + 0.3; shade.rotation.order = 'ZXY';
  const bulbM = basic(0xfff1c8, { toneMapped: false });
  const bulb = mk(new THREE.SphereGeometry(0.035, 12, 8), bulbM, lampG, 0, 0.29, 0.05); bulb.userData.noInk = true;
  const lampL = new THREE.PointLight(0xffc27a, 0, 4.5, 1.7); lampL.position.set(D.lamp[0] + 0.05, D.tableY + 0.24, D.lamp[1] + 0.15); root.add(lampL);
  // worksheet (texture set by the video), pencil, books, can, sticky note, backpack
  const sheet = mk(new THREE.PlaneGeometry(0.3, 0.39), lam(0xffffff), root, D.sheet[0], D.tableY + 0.002, D.sheet[1]); sheet.rotation.set(-PI / 2, 0, 0.06);
  const pencil = new THREE.Group(); pencil.position.set(0.22, D.tableY + 0.008, 0.08); pencil.rotation.y = 0.9; root.add(pencil);
  const pb = mk(new THREE.CylinderGeometry(0.0055, 0.0055, 0.17, 6), lam(0xf2c230), pencil); pb.rotation.z = PI / 2;
  const pt = mk(new THREE.ConeGeometry(0.0055, 0.022, 6), lam(0xe6c9a0), pencil, 0.096, 0, 0); pt.rotation.z = -PI / 2;
  const bk = [[0x2f5ea8, 0.045], [0xb83a3a, 0.035], [0xd9a441, 0.05]];
  let by = D.tableY; bk.forEach(([c, h], i) => { mk(new RoundedBoxGeometry(0.24, h, 0.32, 2, 0.006), lam(c), root, 0.58 + i * 0.01, by + h / 2, -0.24 + i * 0.012).rotation.y = 0.1 - i * 0.08; by += h; });
  const can = new THREE.Group(); can.position.set(-0.25, D.tableY, -0.36); root.add(can);
  const canT = tex(128, 128, (c, w, h) => { c.fillStyle = '#1e1e26'; c.fillRect(0, 0, w, h); c.fillStyle = '#3cff9e'; c.font = '900 40px Inter, Arial'; c.save(); c.translate(w / 2, h / 2); c.rotate(-PI / 2); c.textAlign = 'center'; c.fillText('ZAP', 0, 14); c.restore(); });
  mk(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 16), lam(0xffffff, { map: canT }), can, 0, 0.06, 0);
  const note = mk(new THREE.PlaneGeometry(0.075, 0.075), lam(0xffe36b), root, 0.2, D.tableY + 0.003, -0.3); note.rotation.set(-PI / 2, 0, -0.2);
  const pack = new THREE.Group(); pack.position.set(-0.75, 0.47, D.tableZ1 + 0.3); pack.rotation.y = 0.4; root.add(pack);
  mk(new RoundedBoxGeometry(0.34, 0.42, 0.2, 4, 0.06), lam(0x8a3b52), pack, 0, 0.21, 0); mk(new RoundedBoxGeometry(0.26, 0.16, 0.06, 3, 0.03), lam(0x6d2e41), pack, 0, 0.13, 0.11);
  // a book cart parked in the first cross aisle (half in the main aisle's view) + a step stool
  const cart = new THREE.Group(); cart.position.set(-1.65, 0, D.cross[0] + 0.1); cart.rotation.y = PI / 2; root.add(cart);
  for (const y of [0.25, 0.6, 0.95]) mk(new THREE.BoxGeometry(0.9, 0.03, 0.4), lam(0x9aa0aa), cart, 0, y, 0);
  for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(0.03, 0.95, 0.4), lam(0x9aa0aa), cart, sx * 0.44, 0.5, 0);
  const cl = []; for (const y of [0.27, 0.62]) bookRows(cl, R, { x0: -0.4, x1: 0.4, z: 0, rows: 1, y0: y - 0.02, rowH: 0.28, face: 1, along: 'x' });
  cl.forEach((b) => { mk(new THREE.BoxGeometry(b.w, b.h, b.d), lam(cols[Math.floor(R() * cols.length)]), cart, b.u, b.y, 0).rotation.z = b.lean; });
  const stool = mk(new THREE.CylinderGeometry(0.2, 0.24, 0.4, 18), lam(0xb83a3a), root, 0.55, 0.2, -9.0);

  // ---- state -------------------------------------------------------------------------------------------------------
  let bankState = D.banks.map(() => 1);
  const setBanks = (arr) => {
    bankState = arr;
    banks.forEach((ms, i) => { for (const m of ms) m.material = arr[i] > 0.5 ? panelOn : panelOff; });
    // four real lights cover the banks: far pair, mid pair, near pair, the one over your table
    const pairs = [[0, 1], [2, 3], [4, 5], [6]];
    bankLights.forEach((l, i) => { const k = pairs[i].reduce((a, j) => a + arr[j], 0) / pairs[i].length; l.intensity = 9 * k; });
    const lit = arr.reduce((a, b) => a + b, 0) / arr.length;
    hemi.intensity = 0.62 + 0.75 * lit;
  };
  setBanks(bankState);
  const setLamp = (k) => { lampL.intensity = 1.8 * k; bulbM.color.setScalar(0.25 + 0.75 * k); };
  setLamp(1);
  const setStair = (k) => { stairLight.intensity = 6 * k; winM.color.setHex(0x2a2f3f).lerp(new THREE.Color(0xffd79a), k); };
  const setDoor = (a) => { door.rotation.y = a; };
  return { root, D, books, door, stair, sheet, pencil, lampG, can, cart, quiet, exitBox, myTable, otherChair, sideChair, setBanks, setLamp, setStair, setDoor, setClock,
    lights: { hemi, moon, banks: bankLights, lamp: lampL, exit: exitL, stair: stairLight }, banks };
}
