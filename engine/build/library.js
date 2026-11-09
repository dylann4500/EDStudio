// 049 (Scribe promo): the library at 11 PM on Day 30 (Tyler has been here since Halloween) + the professor's office.
// Room (root-local): floor y 0, back wall of books at z = −4, an arched night window on the left wall (x = −4.5), the desk in the
// middle (top y = D.deskY, Tyler sits behind it at D.seat facing +z = the lens side). Office: a second root (chalkboard, desk).
//   const R = await buildLibraryRoom(studio, { sheetTex, screenTex, iconImg }); R.root.position.set(...); R.setClock(h, m)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, rng } from '../core.js';
import { tex } from './lighthouse.js';

const PI = Math.PI, TAU = PI * 2;
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const D = { deskY: 0.76, desk: [0, -0.6], seat: [0, -1.32], sheet: [-0.3, -0.72], laptop: [0.42, -0.9], stack: [0.62, -0.42], lamp: [-0.78, -0.98], jack: [-0.9, -0.3], cans: [0.95, -0.95] };

function books(parent, x0, x1, y0, z, rows, seed, depth = 0.3) {
  const R = rng(seed), cols = [0xb83a3a, 0x2f5ea8, 0x3f8f5a, 0xd9a441, 0x6b3fa0, 0x8a5a3a, 0x2a2f36, 0xc96a3a, 0x3a7c8c, 0xe8dcc0];
  const list = [];
  for (let r = 0; r < rows; r++) { let x = x0; const yb = y0 + r * 0.42; while (x < x1 - 0.05) { const w = 0.035 + R() * 0.045, h = 0.24 + R() * 0.12; if (R() < 0.06) { x += 0.08; continue; } list.push([x + w / 2, yb + h / 2, z, w, h, cols[Math.floor(R() * cols.length)], (R() - 0.5) * (R() < 0.08 ? 0.5 : 0.04)]); x += w + 0.004; } }
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, depth), std(0xffffff, 0.75), list.length); im.castShadow = true; im.receiveShadow = true;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color();
  list.forEach((b, i) => { M.compose(new THREE.Vector3(b[0], b[1], b[2]), Q.setFromEuler(E.set(0, 0, b[6])), new THREE.Vector3(b[3], b[4], 1)); im.setMatrixAt(i, M); im.setColorAt(i, C.setHex(b[5])); });
  parent.add(im); return im;
}
function shelf(parent, x, z, w, h, rotY, seed) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; parent.add(g);
  const wood = std(0x6e4a2c, 0.7);
  mk(new THREE.BoxGeometry(w, h, 0.05), std(0x4f3420, 0.8), g, 0, h / 2, -0.17);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.06, h, 0.4), wood, g, s * (w / 2 - 0.03), h / 2, 0);
  const rows = Math.floor((h - 0.1) / 0.42);
  for (let r = 0; r <= rows; r++) mk(new THREE.BoxGeometry(w, 0.04, 0.4), wood, g, 0, 0.06 + r * 0.42, 0);
  books(g, -w / 2 + 0.07, w / 2 - 0.07, 0.08, 0, rows, seed);
  return g;
}

export function makeClockFace() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  let key = '';
  function set(h, m) {
    const k = h + ':' + Math.round(m * 4); if (k === key) return; key = k;
    g.fillStyle = '#fbf7ec'; g.beginPath(); g.arc(256, 256, 250, 0, TAU); g.fill(); g.lineWidth = 22; g.strokeStyle = '#2a2f36'; g.stroke();
    g.fillStyle = '#2a2f36'; g.font = '600 64px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * TAU; g.fillText(String(i), 256 + Math.sin(a) * 180, 256 - Math.cos(a) * 180); }
    const hand = (a, L, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.sin(a) * L, 256 - Math.cos(a) * L); g.stroke(); };
    hand(((h % 12) + m / 60) / 12 * TAU, 115, 18, '#2a2f36'); hand((m / 60) * TAU, 175, 11, '#2a2f36'); g.fillStyle = '#c1121f'; g.beginPath(); g.arc(256, 256, 14, 0, TAU); g.fill();
    t.needsUpdate = true;
  }
  set(11, 3);
  return { tex: t, set };
}

export function makeJackOLantern() {   // carved on Oct 31, a month old: slumped, pale, mouldy, still grinning
  const g = new THREE.Group();
  const face = tex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9822b'); gr.addColorStop(1, '#b8651f'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(120,60,10,.25)'; c.fillRect((i * w) / 12, 0, 6, h); }
    c.fillStyle = '#2a1608'; const cx = w * 0.25;   // the face sits at u = 0.25 (sphere front, +z)
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 34, 92); c.lineTo(cx + s * 62, 128); c.lineTo(cx + s * 12, 128); c.fill(); }
    c.beginPath(); c.moveTo(cx - 70, 162); for (let k = 0; k <= 8; k++) c.lineTo(cx - 70 + k * 17.5, k % 2 ? 182 : 160); c.lineTo(cx + 70, 160); c.quadraticCurveTo(cx, 214, cx - 70, 162); c.fill();
    for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${150 + (i % 3) * 20},${170 + (i % 4) * 10},${130},${0.55})`; c.beginPath(); c.arc((i * 137) % w, 30 + ((i * 71) % (h - 40)), 6 + (i % 5) * 4, 0, TAU); c.fill(); }
  });
  const body = mk(new THREE.SphereGeometry(0.2, 28, 18), std(0xffffff, 0.75, { map: face }), g, 0, 0.13, 0); body.scale.set(1.15, 0.62, 1.0); body.rotation.z = 0.12;
  const stem = mk(new THREE.CylinderGeometry(0.025, 0.035, 0.08, 8), std(0x5a6a3a), g, 0.03, 0.27, 0); stem.rotation.z = 0.7;
  return g;
}

export function makeLaptop(screenTex, iconImg) {
  const g = new THREE.Group(), alu = std(0xc9cdd3, 0.35, { metalness: 0.6 });
  mk(new RoundedBoxGeometry(0.62, 0.025, 0.42, 2, 0.01), alu, g, 0, 0.0125, 0);
  mk(new THREE.PlaneGeometry(0.54, 0.25), std(0x2a2d33, 0.6), g, 0, 0.0262, -0.03).rotation.x = -PI / 2;
  const hinge = new THREE.Group(); hinge.position.set(0, 0.025, -0.21); g.add(hinge);   // lid hinge at the back edge: rotation.x π/2 = closed, −0.22 = open
  const lid = new THREE.Group(); hinge.add(lid);
  mk(new RoundedBoxGeometry(0.62, 0.41, 0.014, 2, 0.006), alu, lid, 0, 0.205, 0);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.363), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  scr.position.set(0, 0.205, 0.0075); lid.add(scr);
  const logoT = new THREE.CanvasTexture(iconImg); logoT.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), new THREE.MeshBasicMaterial({ map: logoT, transparent: true, toneMapped: false }));
  logo.position.set(0, 0.215, -0.0075); logo.rotation.y = PI; lid.add(logo);
  return { g, hinge, lid, scr };
}

/** Scribe's pen: a floating black fountain pen with a gold nib (the logo's nib), nib at the origin pointing −y. */
export function makePen() {
  const g = new THREE.Group(), body = std(0x1a1b20, 0.25, { metalness: 0.3 }), gold = std(0xe0b04a, 0.25, { metalness: 0.8 });
  const nib = mk(new THREE.ConeGeometry(0.012, 0.045, 12), gold, g, 0, 0.022, 0); nib.rotation.x = PI;
  mk(new THREE.CylinderGeometry(0.014, 0.012, 0.03, 14), gold, g, 0, 0.055, 0);
  mk(new THREE.CylinderGeometry(0.016, 0.014, 0.17, 14), body, g, 0, 0.155, 0);
  mk(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 14), std(0xc1121f, 0.4), g, 0, 0.225, 0);
  mk(new THREE.SphereGeometry(0.016, 12, 8), body, g, 0, 0.245, 0);
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,230,160,1)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); glow.scale.setScalar(0.07); g.add(glow);
  return { g, glow };
}

export async function buildLibraryRoom(studio, { sheetTex, screenTex, iconImg } = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const floorT = tex(512, 512, (c, w, h) => { for (let r = 0; r < 8; r++) { c.fillStyle = r % 2 ? '#8a5a34' : '#94633a'; c.fillRect(0, r * 64, w, 64); c.fillStyle = 'rgba(40,20,8,.35)'; c.fillRect(0, r * 64 + 62, w, 2); for (let k = 0; k < 3; k++) c.fillRect(((r * 173 + k * 197) % w), r * 64, 2, 64); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
  mk(new THREE.PlaneGeometry(14, 12), std(0xffffff, 0.7, { map: floorT }), root, 0, 0, -1).rotation.x = -PI / 2;
  const wallM = std(0xe8d9bf, 0.9), trim = std(0x5a3a22, 0.7);
  mk(new THREE.BoxGeometry(10, 4.4, 0.2), wallM, root, 0, 2.2, -4.15);
  mk(new THREE.BoxGeometry(0.2, 4.4, 9), wallM, root, 4.6, 2.2, -0.5);
  // the left wall with an arched window (boxes around the opening + a night view behind it)
  const L = new THREE.Group(); L.position.set(-4.6, 0, -0.5); root.add(L);
  mk(new THREE.BoxGeometry(0.2, 4.4, 3.0), wallM, L, 0, 2.2, -3.0); mk(new THREE.BoxGeometry(0.2, 4.4, 3.0), wallM, L, 0, 2.2, 3.0);
  mk(new THREE.BoxGeometry(0.2, 0.9, 3.0), wallM, L, 0, 0.45, 0); mk(new THREE.BoxGeometry(0.2, 0.7, 3.0), wallM, L, 0, 4.05, 0);
  const night = tex(512, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16224d'); gr.addColorStop(1, '#3a4c8a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,240,${0.4 + (i % 5) * 0.12})`; c.beginPath(); c.arc((i * 151) % w, (i * 83) % (h * 0.7), 1.5 + (i % 3), 0, TAU); c.fill(); } c.fillStyle = '#f4f1e4'; c.beginPath(); c.arc(w * 0.7, h * 0.25, 42, 0, TAU); c.fill(); c.fillStyle = '#1d2a1e'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 32) c.lineTo(x, h * 0.82 - Math.abs(Math.sin(x * 0.05)) * 60); c.lineTo(w, h); c.fill(); });
  mk(new THREE.PlaneGeometry(3.2, 2.8), new THREE.MeshBasicMaterial({ map: night }), L, -0.4, 2.3, 0).rotation.y = PI / 2;
  for (const z of [-1.5, 0, 1.5]) mk(new THREE.BoxGeometry(0.12, 2.8, 0.08), trim, L, 0.06, 2.3, z);
  mk(new THREE.BoxGeometry(0.12, 0.08, 3.0), trim, L, 0.06, 2.3, 0); mk(new THREE.BoxGeometry(0.3, 0.1, 3.1), trim, L, 0.1, 0.92, 0);
  // shelves: back wall full of books, the right wall too
  for (const x of [-3.4, -1.15, 1.15, 3.4]) shelf(root, x, -3.8, 2.2, 3.0, 0, 11 + x * 7);
  shelf(root, 4.35, -1.4, 2.4, 3.0, -PI / 2, 91); shelf(root, 4.35, 1.2, 2.4, 3.0, -PI / 2, 93);
  // QUIET sign + wall clock + the November calendar (every day crossed out)
  const clock = makeClockFace(); mk(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40), std(0x2a2f36), root, 1.2, 3.55, -4.0).rotation.x = PI / 2;
  mk(new THREE.CircleGeometry(0.38, 40), new THREE.MeshStandardMaterial({ map: clock.tex, roughness: 0.6 }), root, 1.2, 3.55, -3.965);
  const cal = tex(400, 460, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#c1121f'; c.fillRect(0, 0, w, 80); c.fillStyle = '#fff'; c.font = '600 46px Inter, Arial'; c.textAlign = 'center'; c.fillText('NOVEMBER', w / 2, 56); c.font = '500 26px Inter, Arial'; for (let d = 0; d < 30; d++) { const x = 30 + (d % 7) * 52, y = 120 + Math.floor(d / 7) * 64; c.fillStyle = '#333'; c.fillText(String(d + 1), x + 12, y + 24); c.strokeStyle = '#c1121f'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 32, y + 36); c.moveTo(x + 32, y); c.lineTo(x - 6, y + 36); c.stroke(); } });
  mk(new THREE.PlaneGeometry(0.62, 0.72), std(0xffffff, 0.7, { map: cal }), root, -1.25, 3.45, -3.96);
  const quiet = tex(512, 160, (c, w, h) => { c.fillStyle = '#2a2f36'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.font = '96px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QUIET PLEASE', w / 2, h / 2 + 6); });
  mk(new THREE.PlaneGeometry(1.3, 0.4), std(0xffffff, 0.6, { map: quiet }), root, 4.48, 3.4, -0.1).rotation.y = -PI / 2;
  // the desk + chair
  const deskM = std(0x7a4f2c, 0.55), dk = new THREE.Group(); dk.position.set(D.desk[0], 0, D.desk[1]); root.add(dk);
  mk(new THREE.BoxGeometry(2.3, 0.06, 1.15), deskM, dk, 0, D.deskY - 0.03, 0);
  for (const [x, z] of [[-1.08, -0.5], [1.08, -0.5], [-1.08, 0.5], [1.08, 0.5]]) mk(new THREE.BoxGeometry(0.08, D.deskY - 0.06, 0.08), deskM, dk, x, (D.deskY - 0.06) / 2, z);
  mk(new THREE.BoxGeometry(2.2, 0.28, 0.04), deskM, dk, 0, D.deskY - 0.2, 0.55);
  const chair = new THREE.Group(); chair.position.set(D.seat[0], 0, D.seat[1]); root.add(chair);
  mk(new THREE.BoxGeometry(0.55, 0.06, 0.5), std(0x5a3a22, 0.6), chair, 0, 0.47, 0);
  mk(new THREE.BoxGeometry(0.55, 0.7, 0.06), std(0x5a3a22, 0.6), chair, 0, 0.85, -0.25);
  for (const [x, z] of [[-0.24, -0.21], [0.24, -0.21], [-0.24, 0.21], [0.24, 0.21]]) mk(new THREE.BoxGeometry(0.05, 0.47, 0.05), std(0x5a3a22, 0.6), chair, x, 0.235, z);
  // desk dressing: lamp (+ the warm key light), the laptop, the worksheet, the finished-page stack, cans, crumpled balls, the jack-o'-lantern, a sticky note
  const Y = D.deskY;
  const lamp = new THREE.Group(); lamp.position.set(D.lamp[0], Y, D.lamp[1]); root.add(lamp);
  mk(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 20), std(0xc9a24a, 0.3, { metalness: 0.7 }), lamp, 0, 0.015, 0);
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), std(0xc9a24a, 0.3, { metalness: 0.7 }), lamp, 0, 0.2, 0);
  const shade = mk(new THREE.CylinderGeometry(0.06, 0.13, 0.1, 24, 1, true, 0, PI), std(0x1f6b45, 0.3, { side: THREE.DoubleSide }), lamp, 0, 0.4, 0.04); shade.rotation.set(PI / 2 - 0.25, 0, PI / 2);
  shade.scale.set(1, 2.2, 1);
  const bulb = mk(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false }), lamp, 0, 0.36, 0.05);
  const lampL = new THREE.PointLight(0xffc77a, 3.2, 7, 1.4); lampL.position.set(D.lamp[0] + 0.1, Y + 0.6, D.lamp[1] + 0.4); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -0.002; root.add(lampL);
  const laptop = makeLaptop(screenTex, iconImg); laptop.g.position.set(D.laptop[0], Y, D.laptop[1]); laptop.g.rotation.y = PI + 0.25; root.add(laptop.g);   // screen faces Tyler (−z)
  const scrL = new THREE.PointLight(0xdfe8ff, 0, 2.2, 1.6); scrL.position.set(D.laptop[0] - 0.05, Y + 0.32, D.laptop[1] - 0.45); root.add(scrL);
  const sheet = mk(new THREE.PlaneGeometry(0.432, 0.559), std(0xe4e0d8, 0.95, { map: sheetTex }), root, D.sheet[0], Y + 0.002, D.sheet[1]); sheet.rotation.set(-PI / 2, 0, 0.12); sheet.castShadow = false;
  const stack = new THREE.Group(); stack.position.set(D.stack[0], Y, D.stack[1]); root.add(stack);
  const R = rng(5), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color();
  const canCols = [0x37c24a, 0x2f7fd6, 0xffd23f, 0xe2302f, 0x9b59d0, 0x1a1a1a];
  const cans = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.033, 0.033, 0.122, 14), std(0xffffff, 0.35, { metalness: 0.5 }), 34); cans.castShadow = true; root.add(cans);
  let ci = 0; for (let lay = 0; lay < 4; lay++) for (let k = 0; k < 6 - lay; k++) for (let r2 = 0; r2 < 2 && ci < 30; r2++) { M4.compose(V.set(D.cans[0] - 0.2 + k * 0.07 + lay * 0.035, Y + 0.061 + lay * 0.122, D.cans[1] + r2 * 0.07), Q.identity(), S.set(1, 1, 1)); cans.setMatrixAt(ci, M4); cans.setColorAt(ci, C.setHex(canCols[ci % canCols.length])); ci++; }
  for (; ci < 34; ci++) { const x = -1.6 + R() * 3.4, z = -1.2 + R() * 2.4; M4.compose(V.set(x, 0.033, z), Q.setFromEuler(E.set(PI / 2, R() * TAU, 0)), S.set(1, 1, 1)); cans.setMatrixAt(ci, M4); cans.setColorAt(ci, C.setHex(canCols[ci % canCols.length])); }
  const balls = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), std(0xf4f1e8, 0.9, { flatShading: true }), 40); balls.castShadow = true; root.add(balls);
  for (let i = 0; i < 40; i++) { const onDesk = i < 14, x = onDesk ? -1.0 + R() * 2.0 : -2.2 + R() * 4.4, z = onDesk ? -0.15 + R() * 0.25 - 0.1 : -1.8 + R() * 3.0; M4.compose(V.set(x, (onDesk ? Y : 0) + 0.045, z), Q.setFromEuler(E.set(R() * 3, R() * 3, R() * 3)), S.setScalar(0.8 + R() * 0.6)); balls.setMatrixAt(i, M4); }
  const jack = makeJackOLantern(); jack.position.set(D.jack[0], Y, D.jack[1]); jack.rotation.y = 0.35; jack.scale.setScalar(1.5); root.add(jack);
  const note = tex(256, 256, (c, w, h) => { c.fillStyle = '#ffe66d'; c.fillRect(0, 0, w, h); c.fillStyle = '#c1121f'; c.font = '700 54px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('DUE', w / 2, 92); c.fillText('11:59', w / 2, 160); c.fillText('PM!!', w / 2, 226); });
  const sticky = mk(new THREE.PlaneGeometry(0.13, 0.13), std(0xffffff, 0.8, { map: note }), lamp, 0, 0.25, 0.02); sticky.rotation.set(0, 0, 0.12);
  // pizza boxes + a sleeping bag on the floor: he lives here now
  const pz = new THREE.Group(); pz.position.set(1.7, 0, -1.9); root.add(pz); for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.45, 0.05, 0.45), std(i % 2 ? 0xd9b98a : 0xcfae7c, 0.9), pz, (R() - 0.5) * 0.06, 0.025 + i * 0.052, (R() - 0.5) * 0.06).rotation.y = (R() - 0.5) * 0.3;
  const bag = mk(new THREE.CapsuleGeometry(0.25, 1.4, 6, 14), std(0x2f6fd1, 0.7), root, -2.2, 0.18, 0.6); bag.rotation.set(PI / 2, 0, 0.5); bag.scale.set(1.3, 1, 0.55);
  mk(new THREE.SphereGeometry(0.22, 14, 10), std(0xf0ece2, 0.9), root, -1.9, 0.12, -0.1).scale.set(1.3, 0.5, 0.9);
  // lights: a dim warm/cool hemisphere + moonlight through the window + a warm bounce over the camera side
  const hemi = new THREE.HemisphereLight(0xffe2c0, 0x3a2a24, 0.55); root.add(hemi);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0.6); moon.position.set(-8, 6, 2); moon.target.position.set(0, 0, -1); root.add(moon, moon.target);
  const bounce = new THREE.PointLight(0xffd7a8, 1.6, 9, 1.6); bounce.position.set(0.5, 2.2, 1.6); root.add(bounce);
  return { root, D, clock, laptop, scrL, sheet, stack, lamp, lampL, bulb, jack, chair, cans, balls, hemi, bounce, setClock: clock.set };
}

/** The professor's office: a green chalkboard full of calculus, a diploma, a bookcase, a desk with a mug; window daylight. */
export function buildOffice(studio) {
  const root = new THREE.Group(); studio.scene.add(root);
  const wallM = std(0xd9cdb4, 0.9);
  mk(new THREE.PlaneGeometry(10, 8), std(0x6e5a48, 0.8), root, 0, 0, -1).rotation.x = -PI / 2;
  mk(new THREE.BoxGeometry(8, 4.2, 0.2), wallM, root, 0, 2.1, -2.6);
  const board = tex(1024, 512, (c, w, h) => { c.fillStyle = '#2f4a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 211) % w, (i * 97) % h, 60, 0, 1); c.stroke(); } c.fillStyle = 'rgba(245,245,235,.9)'; c.font = '52px "Fredoka", Arial'; ['∫ x sin x dx = −x cos x + sin x + C', 'lim (sin 3x)/x = 3', 'd/dx ln(x² + 1) = 2x/(x² + 1)', 'Σ 1/n² = π²/6'].forEach((l, i) => c.fillText(l, 50, 100 + i * 105)); });
  mk(new THREE.BoxGeometry(3.6, 1.9, 0.08), std(0x6e4a2c, 0.6), root, -0.6, 2.25, -2.48);
  mk(new THREE.PlaneGeometry(3.4, 1.7), std(0xffffff, 0.9, { map: board }), root, -0.6, 2.25, -2.43);
  const dip = tex(320, 240, (c, w, h) => { c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, w, h); c.fillStyle = '#5b2a1e'; c.font = 'italic 34px Georgia'; c.textAlign = 'center'; c.fillText('Doctor of', w / 2, 90); c.fillText('Mathematics', w / 2, 132); c.fillStyle = '#c1121f'; c.beginPath(); c.arc(w / 2, 190, 22, 0, TAU); c.fill(); });
  mk(new THREE.BoxGeometry(0.8, 0.62, 0.05), std(0x2a2018, 0.4), root, 2.2, 2.6, -2.48); mk(new THREE.PlaneGeometry(0.7, 0.52), std(0xffffff, 0.7, { map: dip }), root, 2.2, 2.6, -2.45);
  const shelfG = shelf(root, 2.6, -2.25, 1.6, 2.1, 0, 133); shelfG.scale.setScalar(1);
  const desk = mk(new THREE.BoxGeometry(2.2, 0.08, 0.9), std(0x5a3a22, 0.5), root, 0, 0.78, 0.6);
  const front = mk(new THREE.BoxGeometry(2.1, 0.7, 0.05), std(0x5a3a22, 0.6), root, 0, 0.4, 1.02);
  const mug = mk(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 16), std(0xffffff, 0.4), root, 0.7, 0.875, 0.5); const handle = mk(new THREE.TorusGeometry(0.03, 0.01, 6, 12), std(0xffffff, 0.4), root, 0.75, 0.875, 0.5);
  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x5a4a3a, 1.1); root.add(hemi);
  const key = new THREE.DirectionalLight(0xffe9c8, 1.6); key.position.set(3, 5, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -4; key.shadow.camera.right = key.shadow.camera.top = 4; root.add(key, key.target);
  return { root, board, desk, front, mug, handle };
}
