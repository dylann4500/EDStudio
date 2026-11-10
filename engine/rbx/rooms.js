// Blocky-avatar game style (069): two interiors built from plastic parts. Both open toward +z and +x (the camera sides), floor at
// y = 0, built at the origin: park them with root.position and show one root per shot (world lights reach them too: dim the sun
// and hemi for the night room — lights() returns the room's own lamp/moon lights).
//   const BR = rbxBedroom({ clock: [11, 58] })   desk (BR.D.desk = top centre), chair, lamp (BR.lamp.light), laptop slot, bed, window
//                                                (night sky + moon), corgi poster, wall clock (BR.setClock(h, m)), rug, shelf
//   const CL = rbxClassroom({ board: ['BIO 1 · GENETICS', 'Ff × Ff'] })  chalkboard, teacher's desk (CL.D.tdesk), student desks
//                                                (CL.D.desks[i]), sunny windows, clock, posters
import * as THREE from 'three';
import { part, cyl, plastic, canvasTexture, prng } from './mats.js';
import { rbxDesk, rbxChair, rbxLamp, rbxBed, makeBlockDog } from './props.js';

function wallBox(parent, size, pos, color, mat = 'plastic') { return part(size, { color, mat, parent, pos }); }
function framedPicture(parent, tex, w, h, pos, rotY = 0, frame = 0x2b2f36) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  part([w + 0.08, h + 0.08, 0.04], { color: frame, parent: g });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); m.position.z = 0.022; g.add(m);
  return g;
}
function clockFace(h, m) {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#2b2f36'; g.stroke();
    g.fillStyle = '#2b2f36'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 2, 4, 4); }
    const hand = (a, l, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(a) * l, 64 - Math.cos(a) * l); g.stroke(); };
    hand(((h % 12) + m / 60) / 12 * Math.PI * 2, 30, 7); g.strokeStyle = '#e5384f'; hand(m / 60 * Math.PI * 2, 44, 5);
  });
}

export function rbxBedroom({ clock = [11, 58], wall = 0x6b6fd6, floor = 0xb07a4a, w = 6, d = 5, h = 3 } = {}) {
  const root = new THREE.Group();
  wallBox(root, [w, 0.2, d], [0, -0.1, 0], floor, 'wood');
  wallBox(root, [w, h, 0.2], [0, h / 2, -d / 2 - 0.1], wall);
  wallBox(root, [0.2, h, d], [-w / 2 - 0.1, h / 2, 0], wall);
  part([w, 0.12, 0.06], { color: 0xf2f2f2, parent: root, pos: [0, 0.06, -d / 2 + 0.03] });
  // window (night sky, stars, a moon, a blocky skyline) on the back wall, left of the desk
  const sky = canvasTexture(512, 384, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#0b1240'); gr.addColorStop(1, '#2b2f7a'); g.fillStyle = gr; g.fillRect(0, 0, 512, 384);
    const r = prng(5); g.fillStyle = '#ffffff'; for (let i = 0; i < 80; i++) { const s = r() < 0.15 ? 3 : 2; g.fillRect(r() * 512, r() * 260, s, s); }
    g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(380, 90, 40, 0, 7); g.fill(); g.fillStyle = '#20286c'; g.beginPath(); g.arc(398, 78, 36, 0, 7); g.fill();
    g.fillStyle = '#141a4a'; let x = 0; while (x < 512) { const bw = 30 + r() * 50, bh = 60 + r() * 120; g.fillRect(x, 384 - bh, bw, bh); g.fillStyle = '#ffd76a'; for (let k = 0; k < 6; k++) if (r() < 0.5) g.fillRect(x + 6 + (k % 3) * 10, 384 - bh + 10 + Math.floor(k / 3) * 18, 5, 8); g.fillStyle = '#141a4a'; x += bw + 4; }
  });
  const win = new THREE.Group(); win.position.set(-1.3, 1.65, -d / 2 + 0.01); root.add(win);
  part([1.5, 1.2, 0.08], { color: 0xf2f2f2, parent: win });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.06), new THREE.MeshBasicMaterial({ map: sky })); view.position.z = 0.045; win.add(view);
  part([0.05, 1.06, 0.06], { color: 0xf2f2f2, parent: win, pos: [0, 0, 0.06] }); part([1.36, 0.05, 0.06], { color: 0xf2f2f2, parent: win, pos: [0, 0, 0.06] });
  // the desk against the back wall (right), chair, lamp, shelf, clock, poster
  const desk = rbxDesk({ w: 1.7, d: 0.8 }); desk.position.set(0.9, 0, -1.0); root.add(desk);       // in the room, so the sitter faces the camera (+z)
  const chair = rbxChair({ color: 0xe5384f }); chair.position.set(0.9, 0, -1.75); root.add(chair);
  const lamp = rbxLamp({ color: 0xffc73b }); lamp.g.position.set(1.55, desk.userData.top, -1.25); root.add(lamp.g);
  const shelf = new THREE.Group(); shelf.position.set(1.0, 2.0, -d / 2 + 0.16); root.add(shelf);
  part([1.6, 0.06, 0.3], { color: 0x8a5a33, mat: 'wood', parent: shelf });
  const r = prng(9); for (let i = 0; i < 12; i++) { const bh = 0.22 + r() * 0.1; part([0.08, bh, 0.22], { color: [0xe5384f, 0x2f7cf6, 0x2fd06a, 0xffc73b, 0x9b5cf6][i % 5], parent: shelf, pos: [-0.7 + i * 0.1, 0.03 + bh / 2, 0] }); }
  const clk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32), new THREE.MeshStandardMaterial({ roughness: 0.4 })); clk.rotation.x = Math.PI / 2; clk.position.set(-0.05, 2.35, -d / 2 + 0.03); root.add(clk);
  const clkFace = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({ map: clockFace(...clock) })); clkFace.position.set(-0.05, 2.35, -d / 2 + 0.06); root.add(clkFace);
  const poster = canvasTexture(256, 340, (g) => {
    g.fillStyle = '#ffc73b'; g.fillRect(0, 0, 256, 340); g.fillStyle = '#d9893a'; g.fillRect(58, 70, 140, 120); g.fillStyle = '#f6f1e8'; g.fillRect(108, 90, 40, 100); g.fillRect(88, 150, 80, 50);
    g.fillStyle = '#d9893a'; g.beginPath(); g.moveTo(62, 76); g.lineTo(80, 20); g.lineTo(108, 72); g.fill(); g.beginPath(); g.moveTo(194, 76); g.lineTo(176, 20); g.lineTo(148, 72); g.fill();
    g.fillStyle = '#16181d'; g.fillRect(96, 118, 12, 14); g.fillRect(148, 118, 12, 14); g.fillRect(118, 156, 20, 12);
    g.font = '700 46px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('GOOD BOY', 128, 270); g.font = '600 26px Fredoka, sans-serif'; g.fillText('(still)', 128, 310);
  });
  framedPicture(root, poster, 0.62, 0.82, [-w / 2 + 0.02, 1.7, 0.3], Math.PI / 2, 0xffffff);
  const bed = rbxBed({ color: 0x2f7cf6 }); bed.position.set(-1.9, 0, 0.6); root.add(bed);
  part([2.0, 0.02, 1.4], { color: 0x2fd06a, parent: root, pos: [0.6, 0.01, 0.6], radius: 0 });
  const plush = makeBlockDog({ scale: 0.55 }); plush.pose({ x: -1.6, y: 0.57, z: -0.1, rotY: 0.6, sit: true, mouth: 'closed' }); root.add(plush.root);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0.0); moon.position.set(-3, 4, 3); moon.target.position.set(0, 0, 0); root.add(moon, moon.target);
  return {
    root, desk, chair, lamp, bed, win, plush,
    D: { desk: [0.9, desk.userData.top, -1.0], chair: [0.9, 0, -1.75], seat: chair.userData.seat, w, d, h },
    setClock(hh, mm) { clkFace.material.map = clockFace(hh, mm); clkFace.material.needsUpdate = true; },
    moon,
  };
}

export function rbxClassroom({ board = ['BIO 1 · GENETICS', 'Ff × Ff'], wall = 0xf2e6c9, floor = 0xc9ccd2, w = 9, d = 7, h = 3.4 } = {}) {
  const root = new THREE.Group();
  wallBox(root, [w, 0.2, d], [0, -0.1, 0], floor, 'plastic');
  for (let i = 0; i < 9; i++) for (let j = 0; j < 7; j++) if ((i + j) % 2) part([1, 0.012, 1], { color: 0xb3b7be, parent: root, pos: [-w / 2 + 0.5 + i, 0.006, -d / 2 + 0.5 + j], shadow: false });
  wallBox(root, [w, h, 0.2], [0, h / 2, -d / 2 - 0.1], wall);
  wallBox(root, [0.2, h, d], [-w / 2 - 0.1, h / 2, 0], wall);
  part([w, 0.9, 0.06], { color: 0x6aa2d8, parent: root, pos: [0, 0.45, -d / 2 + 0.03] });
  // chalkboard
  const bt = canvasTexture(1024, 400, (g) => {
    g.fillStyle = '#2f5d46'; g.fillRect(0, 0, 1024, 400); g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % 1024, (i * 53) % 400, 120, 4);
    g.fillStyle = '#f4f4ee'; g.textAlign = 'center'; g.font = '600 80px Fredoka, sans-serif'; g.fillText(board[0] ?? '', 512, 120); g.font = '600 64px Fredoka, sans-serif'; g.fillText(board[1] ?? '', 512, 230);
    if (board[2]) { g.font = '500 48px Fredoka, sans-serif'; g.fillText(board[2], 512, 320); }
  });
  const cb = new THREE.Group(); cb.position.set(0.3, 1.75, -d / 2 + 0.02); root.add(cb);
  part([4.6, 1.9, 0.08], { color: 0x8a5a33, mat: 'wood', parent: cb });
  const cbf = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.72), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.85 })); cbf.position.z = 0.045; cb.add(cbf);
  part([4.4, 0.06, 0.12], { color: 0x8a5a33, parent: cb, pos: [0, -0.9, 0.08] });
  // windows on the left wall (a sunny sky)
  const day = canvasTexture(256, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#2f78e0'); gr.addColorStop(1, '#a9d4fb'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = '#ffffff'; for (const [x, y, r] of [[60, 80, 26], [90, 70, 32], [124, 84, 24], [190, 150, 20], [214, 140, 26]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.fillStyle = '#4ca83a'; g.fillRect(0, 210, 256, 46); });
  for (const z of [-1.6, 1.2]) {
    const wg = new THREE.Group(); wg.position.set(-w / 2 + 0.01, 1.8, z); wg.rotation.y = Math.PI / 2; root.add(wg);
    part([1.8, 1.5, 0.08], { color: 0xf2f2f2, parent: wg });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(1.64, 1.34), new THREE.MeshBasicMaterial({ map: day })); v.position.z = 0.045; wg.add(v);
    part([0.05, 1.34, 0.06], { color: 0xf2f2f2, parent: wg, pos: [0, 0, 0.06] });
  }
  const clk = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32), new THREE.MeshBasicMaterial({ map: clockFace(9, 5) })); clk.position.set(3.3, 2.75, -d / 2 + 0.03); root.add(clk);
  const dna = canvasTexture(200, 300, (g) => { g.fillStyle = '#eaf3ff'; g.fillRect(0, 0, 200, 300); g.lineWidth = 8; for (let s = 0; s < 2; s++) { g.strokeStyle = s ? '#e5384f' : '#2f7cf6'; g.beginPath(); for (let y = 20; y < 240; y += 4) g.lineTo(100 + Math.sin(y / 30 + s * Math.PI) * 50, y); g.stroke(); } g.strokeStyle = '#9aa3ad'; g.lineWidth = 4; for (let y = 30; y < 240; y += 20) { g.beginPath(); g.moveTo(100 + Math.sin(y / 30) * 50, y); g.lineTo(100 - Math.sin(y / 30) * 50, y); g.stroke(); } g.fillStyle = '#16181d'; g.font = '700 34px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('DNA', 100, 285); });
  framedPicture(root, dna, 0.6, 0.9, [-2.9, 1.8, -d / 2 + 0.02], 0, 0xffffff);
  // teacher's desk (front of the room, facing +z) + student desks in rows
  const tdesk = rbxDesk({ w: 1.8, d: 0.85, color: 0x8a5a33 }); tdesk.position.set(0.6, 0, -d / 2 + 1.7); root.add(tdesk);
  part([1.8, 0.7, 0.06], { color: 0x6b4a2a, mat: 'wood', parent: root, pos: [0.6, 0.38, -d / 2 + 1.7 + 0.4] });
  const apple = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), plastic(0xe5384f, { rough: 0.3 })); apple.position.set(1.25, tdesk.userData.top + 0.07, -d / 2 + 1.6); root.add(apple);
  const desks = [];
  for (let rr = 0; rr < 2; rr++) for (let c = 0; c < 3; c++) {
    const x = -2.6 + c * 2.0, z = -d / 2 + 3.6 + rr * 1.7, dk = rbxDesk({ w: 1.0, d: 0.6, h: 0.72, color: 0xc89660 }); dk.position.set(x, 0, z); root.add(dk);
    const ch = rbxChair({ color: [0x2f7cf6, 0x2fd06a, 0xffc73b][c] }); ch.position.set(x, 0, z + 0.55); ch.rotation.y = Math.PI; root.add(ch);
    desks.push({ x, z, top: 0.72, chair: [x, 0, z + 0.55], g: dk, ch });
  }
  return { root, tdesk, desks, apple, D: { tdesk: [0.6, tdesk.userData.top, -d / 2 + 1.7], desks, w, d, h } };
}
