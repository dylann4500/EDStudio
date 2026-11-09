// 050 (Scribe promo, "I upgraded my backyard shed every day until it became a university"): a sunny suburban backyard whose
// shed grows, stage by stage, into a campus. Toon/build look (engine/build). Everything sits at the origin (root-local = world
// unless you park the root). Camera lives on +z looking −z; x runs left → right:
//   our house (D.house, back facade facing +z, back door + deck) · the gate in the left fence (D.gate) · Mom's folding table
//   the SHED at the origin (front gable + door facing +z): `shed.front` (hide it to film inside), `shed.floor2` (the 2nd floor,
//   drop it in), `shed.roof` (rides on top), `shed.sign` (cardboard UNIVERSITY sign, pivot on its right nail), `shed.board`
//   (whiteboard), `shed.desk`; the trampoline, the trash can (`can.lid`), the garden gnome (`gnome`, squash it)
//   the bell tower (`bell.g`, swing `bell.swing.rotation.z`) — on the shed ridge, later on the hall roof
//   the brick HALL (D.hall): `hall.body` (walls: grow with scale.y), `hall.cols[4]` (drop them), `hall.top` (entablature +
//   pediment + SHED UNIVERSITY frieze), `hall.ivy[]` (patches that pop in), `hall.banner`, `hall.podium`
//   the neighbor's yard (x > 5.5): house with an upstairs back window (`nwin`: `open` dark rectangle + `glass`), the pool, a
//   lounger + umbrella + grill; the STADIUM over it (`stadium.rows[]` pop, `stadium.seats` = crowd seat spots, field, goalposts,
//   scoreboard)
//   day 100: the clock tower (`tower.g`, rise it), extra halls (`campus[]`), lamp posts with banners, brick paths, grad chairs
//   (`chairs` instanced + `chairSpots`), ivy on every wall (houses too).
//   const C = buildCampus(studio); C.aimSun(cx, cy, cz, half); C.setDay(k)  (k: 0 = early, 1 = day-100 dressing)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mk, rng } from '../core.js';
import { makeSky, lawnTexture } from './cutaway.js';
import { makeTree } from './subway.js';
import { makeClockFace } from './library.js';

const PI = Math.PI, TAU = PI * 2;
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const tex = (w, h, draw, repeat) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
};
const rep = (t, x, y) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); return c; };

export const D = {
  shed: { w: 2.6, d: 2.2, h: 2.2, h2: 2.0, rise: 0.75, doorW: 0.86, doorH: 1.72 },
  win2: [0.6, 3.45, 1.1],                          // the 2nd-floor front window (the fire exit), centre
  tramp: [1.2, 2.6], trampY: 0.5, can: [2.1, 0.75], gnome: [2.7, 2.6],
  hall: { x0: -4, x1: 4, z0: -4.6, z1: 1.2, h: 6.0, colX: [-2.7, -0.95, 0.95, 2.7], colZ: 2.6, colH: 5.5, door: 1.2 },
  house: { x: -9.2, z: -6.6, w: 8, d: 6, h: 5.4 }, nhouse: { x: 12.2, z: -7.0, w: 7.2, d: 6, h: 5.2 },
  nwin: [10.6, 4.05, -3.98],                       // the neighbor's upstairs back window (he leans out of it)
  pool: [11.6, 1.0, 5.0, 3.0], field: [11.8, 1.1, 9.0, 6.4],
  fenceL: -13.6, fenceM: 5.5, fenceR: 18.6, fenceB: -10.6, gate: [-13.6, 3.7],
  table: [-6.3, 1.4], tower: [0, -7.8], deck: [-9.2, -3.6],
  podium: [0, 0.12, 2.15],
};

// ---------------------------------------------------------------- textures
const h1 = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function brickTex() {   // 1.2 m square: 16 courses of 7.5 cm bricks (stagger), sandy mortar
  return tex(512, 512, (g, w, h) => {
    g.fillStyle = '#d9c8b0'; g.fillRect(0, 0, w, h);
    const rows = 16, bh = h / rows, bw = w / 5;
    const cols = ['#a8452f', '#b4513a', '#9b3c2a', '#b85a3f', '#a34a33', '#8f3a29', '#c0644a'];
    for (let r = 0; r < rows; r++) for (let c = -1; c < 6; c++) {
      const x = c * bw + (r % 2) * bw / 2, y = r * bh;
      g.fillStyle = cols[Math.floor(h1(r, c + 9) * cols.length)]; g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x + 3, y + 3, bw - 6, 4); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 3, y + bh - 7, bw - 6, 4);
    }
  });
}
function sidingTex(base = '#9cc0a6', line = 'rgba(40,60,45,.35)') {   // 1 m square of 12 cm lap boards
  return tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += h / 8) { g.fillStyle = line; g.fillRect(0, y + h / 8 - 5, w, 5); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y, w, 4); } for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(0,0,0,${0.03 + h1(i, 2) * 0.04})`; g.fillRect(h1(i, 3) * w, h1(i, 4) * h, 30 + h1(i, 5) * 60, 2); } });
}
function shingleTex(base = '#5b4a4a') {
  return tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = -1; c < 9; c++) { const x = c * 32 + (r % 2) * 16, y = r * 32; g.fillStyle = `rgba(0,0,0,${0.05 + h1(r, c) * 0.18})`; g.fillRect(x + 1, y + 1, 30, 30); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y + 29, 32, 3); g.fillRect(x, y, 2, 30); } });
}
function plyTex() { return tex(256, 256, (g, w, h) => { g.fillStyle = '#e2c79a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(150,105,55,${0.12 + h1(i, 7) * 0.15})`; g.lineWidth = 2; g.beginPath(); const y = h1(i, 8) * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 12, w * 0.6, y - 12, w, y + 4); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(w / 2 - 1, 0, 2, h); }); }
function ivyTex(seed = 1) {   // transparent leaves (alphaTest), denser at the bottom
  return tex(256, 320, (g, w, h) => {
    let s = seed * 9973 + 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = '#3f5a24'; g.lineWidth = 3; for (let k = 0; k < 7; k++) { g.beginPath(); let x = r() * w, y = h; g.moveTo(x, y); for (let j = 0; j < 9; j++) { x += (r() - 0.5) * 50; y -= h / 9 * (0.7 + r() * 0.5); g.lineTo(x, y); } g.stroke(); }
    const greens = ['#3e7d2a', '#4c9433', '#5aa83b', '#356e24', '#68b546'];
    for (let i = 0; i < 520; i++) { const y = h * (1 - Math.pow(r(), 0.8)), x = r() * w, rr = 7 + r() * 8; g.fillStyle = greens[Math.floor(r() * greens.length)]; g.save(); g.translate(x, y); g.rotate(r() * TAU); g.beginPath(); g.ellipse(0, 0, rr, rr * 0.7, 0, 0, TAU); g.fill(); g.restore(); }
  });
}
const signText = (text, { w = 1024, h = 160, bg = '#7a1f2b', fg = '#f6e7c8', font = 'Georgia, serif', weight = '700', px = 110, border = null, letter = 0 } = {}) => tex(w, h, (g) => {
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  if (border) { g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20); }
  let s = px; const f = () => `${weight} ${s}px ${font}`; g.font = f(); while (g.measureText(text).width + letter * text.length > w * 0.9 && s > 20) { s -= 4; g.font = f(); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (!letter) g.fillText(text, w / 2, h / 2 + s * 0.04);
  else { const tw = g.measureText(text).width + letter * (text.length - 1); let x = w / 2 - tw / 2; g.textAlign = 'left'; for (const ch of text) { g.fillText(ch, x, h / 2 + s * 0.04); x += g.measureText(ch).width + letter; } }
});

// ---------------------------------------------------------------- small builders
const WHITE = std(0xf6f3ea, 0.6), GLASS = new THREE.MeshStandardMaterial({ color: 0x5f88a8, roughness: 0.12, metalness: 0.2, emissive: 0x1b2a3a, emissiveIntensity: 0.25 });
const DARK = std(0x1c1a1f, 0.95);
/** A window facing +z at (x, y, z): white frame + glass + a cross muntin. */
function windowAt(parent, x, y, z, w, h, { frame = WHITE, glass = GLASS, sill = true, cross = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const t = 0.07;
  mk(new THREE.BoxGeometry(w + t * 2, t, 0.08), frame, g, 0, h / 2 + t / 2, 0); mk(new THREE.BoxGeometry(w + t * 2, t, 0.08), frame, g, 0, -h / 2 - t / 2, 0);
  mk(new THREE.BoxGeometry(t, h, 0.08), frame, g, -w / 2 - t / 2, 0, 0); mk(new THREE.BoxGeometry(t, h, 0.08), frame, g, w / 2 + t / 2, 0, 0);
  const gl = mk(new THREE.PlaneGeometry(w, h), glass, g, 0, 0, -0.01); gl.castShadow = false;
  if (cross) { mk(new THREE.BoxGeometry(0.035, h, 0.05), frame, g, 0, 0, 0.005); mk(new THREE.BoxGeometry(w, 0.035, 0.05), frame, g, 0, 0, 0.005); }
  if (sill) mk(new THREE.BoxGeometry(w + 0.24, 0.06, 0.18), frame, g, 0, -h / 2 - t - 0.03, 0.06);
  return { g, glass: gl };
}
/** Gable roof with its ridge along x, wall top at y = 0 (origin = centre of the wall top). Returns a group. */
function gableRoof(w, d, rise, roofMat, wallMat, over = 0.25) {
  const g = new THREE.Group(), half = d / 2, ang = Math.atan2(rise, half), slope = Math.hypot(half, rise);
  for (const s of [-1, 1]) { const slab = mk(new THREE.BoxGeometry(w + over * 2, 0.08, slope + over), roofMat, g, 0, rise / 2 + 0.02, s * (half / 2 + over * 0.25)); slab.rotation.x = s * ang; }
  const sh = new THREE.Shape(); sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  const tri = new THREE.ExtrudeGeometry(sh, { depth: w - 0.02, bevelEnabled: false }); tri.translate(0, 0, -(w - 0.02) / 2);
  const gab = mk(tri, wallMat, g); gab.rotation.y = PI / 2;
  mk(new THREE.BoxGeometry(w + over * 2, 0.1, 0.16), std(0x3a3030, 0.7), g, 0, rise + 0.05, 0);
  return g;
}
/** A simple suburban house: back facade faces +z (toward the yard). */
function makeHouse({ w, d, h, siding, roof, door = true, seed = 1 }) {
  const g = new THREE.Group(), wm = std(0xffffff, 0.85, { map: rep(siding, w, h) });
  const box = mk(new THREE.BoxGeometry(w, h, d), [wm, wm, std(0x8a7a6a), std(0x8a7a6a), wm, wm], g, 0, h / 2, 0);
  const rf = gableRoof(w, d, 2.0, std(0xffffff, 0.85, { map: rep(shingleTex('#6a5048'), w / 2, 3) }), wm, 0.4); rf.position.y = h; g.add(rf);
  mk(new THREE.BoxGeometry(w + 0.1, 0.18, d + 0.1), WHITE, g, 0, h - 0.09, 0);
  const z = d / 2 + 0.04, wins = [];
  for (const [x, y] of [[-w * 0.3, h * 0.73], [w * 0.3, h * 0.73], [-w * 0.3, h * 0.3], [w * 0.28, h * 0.3]]) wins.push(windowAt(g, x, y, z, 1.1, 1.2));
  let doorM = null;
  if (door) { mk(new THREE.BoxGeometry(1.2, 2.2, 0.1), WHITE, g, 0, 1.1, z); doorM = mk(new THREE.BoxGeometry(1.0, 2.05, 0.1), std(0x7a2f2a, 0.6), g, 0, 1.06, z + 0.02); mk(new THREE.SphereGeometry(0.04, 8, 6), std(0xd9b44a, 0.3, { metalness: 0.8 }), g, 0.35, 1.05, z + 0.09); }
  // gutters + a downspout
  mk(new THREE.BoxGeometry(w + 0.5, 0.1, 0.12), WHITE, g, 0, h + 0.02, d / 2 + 0.45);
  mk(new THREE.CylinderGeometry(0.05, 0.05, h, 8), WHITE, g, w / 2 - 0.2, h / 2, d / 2 + 0.08);
  return { g, box, wins, doorM };
}
function makeFence(parent, x0, z0, x1, z1, { h = 1.8, color = 0xc49a6c } = {}) {
  const L = Math.hypot(x1 - x0, z1 - z0), g = new THREE.Group(); parent.add(g); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); g.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  const ft = tex(128, 128, (c, w, hh) => { c.fillStyle = '#c49a6c'; c.fillRect(0, 0, w, hh); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? 'rgba(90,55,25,.18)' : 'rgba(255,240,210,.08)'; c.fillRect(i * 16, 0, 16, hh); c.fillStyle = 'rgba(60,35,15,.5)'; c.fillRect(i * 16, 0, 2, hh); } c.fillStyle = 'rgba(60,35,15,.3)'; c.fillRect(0, 0, w, 6); });
  mk(new THREE.BoxGeometry(L, h, 0.05), std(color, 0.9, { map: rep(ft, L / 1, 1) }), g, 0, h / 2, 0);
  for (let s = -L / 2; s <= L / 2 + 0.01; s += 2.4) mk(new THREE.BoxGeometry(0.1, h + 0.12, 0.1), std(0x9c7448, 0.9), g, s, (h + 0.12) / 2, 0.05);
  return g;
}
function makeTrashCan() {
  const g = new THREE.Group(), m = std(0x7d8a86, 0.45, { metalness: 0.55 });
  mk(new THREE.CylinderGeometry(0.29, 0.25, 0.74, 24), m, g, 0, 0.37, 0);
  for (const y of [0.18, 0.4, 0.62]) mk(new THREE.TorusGeometry(0.28, 0.012, 6, 24), m, g, 0, y, 0).rotation.x = PI / 2;
  for (const s of [-1, 1]) mk(new THREE.TorusGeometry(0.06, 0.012, 6, 12, PI), m, g, s * 0.29, 0.62, 0).rotation.set(0, PI / 2, 0);
  const lid = new THREE.Group(); lid.position.y = 0.74; g.add(lid);
  const dome = mk(new THREE.SphereGeometry(0.31, 24, 10, 0, TAU, 0, PI / 2), m, lid, 0, -0.02, 0); dome.scale.y = 0.32;
  mk(new THREE.TorusGeometry(0.06, 0.014, 6, 12, PI), m, lid, 0, 0.08, 0);
  const inside = mk(new THREE.CircleGeometry(0.27, 20), DARK, g, 0, 0.72, 0); inside.rotation.x = -PI / 2;
  return { g, lid };
}
function makeTrampoline() {
  const g = new THREE.Group(), blue = std(0x2f7fd6, 0.4), Y = D.trampY;
  mk(new THREE.TorusGeometry(0.9, 0.05, 8, 40), blue, g, 0, Y, 0).rotation.x = PI / 2;
  const pad = mk(new THREE.TorusGeometry(0.82, 0.07, 6, 40), std(0x3fb6e0, 0.6), g, 0, Y + 0.02, 0); pad.rotation.x = PI / 2; pad.scale.z = 0.5;
  const mat = new THREE.Group(); mat.position.y = Y - 0.02; g.add(mat);
  const m = mk(new THREE.CircleGeometry(0.74, 32), std(0x17181c, 0.8), mat); m.rotation.x = -PI / 2;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; const l = mk(new THREE.CylinderGeometry(0.03, 0.03, Y, 6), std(0x9aa3ad, 0.4, { metalness: 0.6 }), g, Math.cos(a) * 0.88, Y / 2, Math.sin(a) * 0.88); l.castShadow = true; }
  return { g, mat };
}
export function makeGnome() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  mk(new THREE.ConeGeometry(0.13, 0.3, 14), std(0x2f5fb3, 0.6), body, 0, 0.15, 0);
  mk(new THREE.SphereGeometry(0.075, 14, 10), std(0xf2c29a, 0.6), body, 0, 0.34, 0.01);
  const beard = mk(new THREE.ConeGeometry(0.075, 0.16, 12), std(0xf4f4f0, 0.9), body, 0, 0.27, 0.05); beard.rotation.x = PI;
  mk(new THREE.ConeGeometry(0.08, 0.22, 14), std(0xd23a2e, 0.55), body, 0, 0.49, -0.01).rotation.x = -0.15;
  mk(new THREE.SphereGeometry(0.02, 8, 6), std(0xe8908a, 0.5), body, 0, 0.33, 0.085);
  return { g, body };
}
function makeBellTower() {
  const g = new THREE.Group(), white = WHITE, gold = std(0xe2b34a, 0.28, { metalness: 0.85 });
  mk(new THREE.BoxGeometry(1.0, 0.5, 1.0), white, g, 0, 0.25, 0);
  for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) mk(new THREE.BoxGeometry(0.1, 0.9, 0.1), white, g, x, 0.95, z);
  mk(new THREE.BoxGeometry(1.1, 0.12, 1.1), white, g, 0, 1.44, 0);
  const cap = mk(new THREE.ConeGeometry(0.82, 0.8, 4), std(0x5b4a4a, 0.7), g, 0, 1.9, 0); cap.rotation.y = PI / 4;
  mk(new THREE.SphereGeometry(0.06, 10, 8), gold, g, 0, 2.34, 0);
  const swing = new THREE.Group(); swing.position.y = 1.36; g.add(swing);
  const prof = [[0.001, 0], [0.09, -0.02], [0.14, -0.12], [0.18, -0.3], [0.26, -0.44], [0.27, -0.48], [0.001, -0.47]].map(([x, y]) => new THREE.Vector2(x, y));
  mk(new THREE.LatheGeometry(prof, 24), gold, swing, 0, 0, 0);
  mk(new THREE.SphereGeometry(0.05, 10, 8), gold, swing, 0, -0.5, 0);
  return { g, swing };
}
function makeColumn(h) {
  const g = new THREE.Group(), m = std(0xf3efe6, 0.55);
  mk(new THREE.BoxGeometry(0.82, 0.22, 0.82), m, g, 0, 0.11, 0); mk(new THREE.CylinderGeometry(0.36, 0.38, 0.14, 24), m, g, 0, 0.29, 0);
  mk(new THREE.CylinderGeometry(0.3, 0.33, h - 0.66, 20), m, g, 0, 0.36 + (h - 0.66) / 2, 0);
  mk(new THREE.CylinderGeometry(0.4, 0.3, 0.14, 24), m, g, 0, h - 0.23, 0); mk(new THREE.BoxGeometry(0.86, 0.16, 0.86), m, g, 0, h - 0.08, 0);
  return g;
}
/** A far campus hall (cheap: facade texture on a box + cornice + optional dome or gable). Front faces +z. */
function makeFarHall({ w = 10, d = 7, h = 8, dome = false, gable = true, name = '' }) {
  const g = new THREE.Group();
  const fac = tex(512, 512, (c, W, H) => { const bt = brickTex().image; c.drawImage(bt, 0, 0, W, H); c.fillStyle = '#f3efe6'; const nx = 4, ny = 3; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = (i + 0.5) * W / nx, y = (j + 0.5) * H / ny; c.fillStyle = '#f3efe6'; c.fillRect(x - 30, y - 50, 60, 100); c.fillStyle = '#3e5f7a'; c.fillRect(x - 22, y - 42, 44, 84); c.fillStyle = '#f3efe6'; c.fillRect(x - 2, y - 42, 4, 84); c.fillRect(x - 22, y - 2, 44, 4); } });
  const fm = std(0xffffff, 0.85, { map: fac });
  mk(new THREE.BoxGeometry(w, h, d), [fm, fm, std(0x6a5d55), std(0x6a5d55), fm, fm], g, 0, h / 2, 0);
  mk(new THREE.BoxGeometry(w + 0.3, 0.35, d + 0.3), WHITE, g, 0, h + 0.17, 0);
  if (dome) { mk(new THREE.CylinderGeometry(2.4, 2.4, 1.2, 24), WHITE, g, 0, h + 0.9, 0); const dm = mk(new THREE.SphereGeometry(2.4, 24, 12, 0, TAU, 0, PI / 2), std(0x6fa595, 0.4, { metalness: 0.4 }), g, 0, h + 1.5, 0); dm.scale.y = 0.9; }
  else if (gable) { const r = gableRoof(w, d, 2.4, std(0x4f4a52, 0.8), fm, 0.3); r.position.y = h + 0.35; g.add(r); }
  if (name) { const s = mk(new THREE.PlaneGeometry(w * 0.6, 0.6), std(0xffffff, 0.6, { map: signText(name, { bg: '#f3efe6', fg: '#3a2a22', px: 90, letter: 8 }) }), g, 0, h - 0.6, d / 2 + 0.02); s.castShadow = false; }
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) mk(new THREE.CylinderGeometry(0.28, 0.3, h * 0.55, 16), WHITE, g, s * (0.9 + i * 1.6), h * 0.275, d / 2 + 0.6);
  mk(new THREE.BoxGeometry(5.6, 0.4, 1.6), WHITE, g, 0, h * 0.55 + 0.2, d / 2 + 0.6);
  return g;
}

// ---------------------------------------------------------------- the set
export function buildCampus(studio) {
  const { scene, renderer, camera } = studio;
  const root = new THREE.Group(); scene.add(root);
  camera.far = 900; camera.near = 0.05; camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0xd6ecf8); scene.fog = new THREE.Fog(0xd6ecf8, 90, 420);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xeaf4ff, 0x8f9a72, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun, sun.target);
  function aimSun(cx, cy, cz, half = 10) { sun.position.set(cx - 9, cy + 16, cz + 12); sun.target.position.set(cx, cy, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 90 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 1, 0, 10);
  const sky = makeSky(root, 400);

  // ground: our lawn + the neighbor's lawn + a far lawn
  const lawn = mk(new THREE.PlaneGeometry(80, 70), std(0xffffff, 1, { map: rep(lawnTexture('#86c862', '#79bb56'), 40, 35) }), root, 2, 0, 0); lawn.rotation.x = -PI / 2; lawn.castShadow = false;
  const far = mk(new THREE.PlaneGeometry(900, 600), std(0xffffff, 1, { map: rep(lawnTexture('#8dcc68', '#82c05e'), 300, 200) }), root, 0, -0.02, -120); far.rotation.x = -PI / 2; far.castShadow = false;
  // stepping stones from the deck to the shed
  const stoneM = std(0xb9b2a6, 0.9);
  for (let i = 0; i < 6; i++) { const u = i / 5, x = -8.2 + u * 7.4, z = -2.6 + u * 4.6; const s = mk(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 14), stoneM, root, x, 0.02, z); s.scale.set(1, 1, 0.8); }

  // ---- our house + deck (left back) and the neighbor's house (right back)
  const H = D.house, NH = D.nhouse;
  const house = makeHouse({ w: H.w, d: H.d, h: H.h, siding: sidingTex('#f0dca0', 'rgba(110,90,40,.3)') }); house.g.position.set(H.x, 0, H.z); root.add(house.g);
  const deck = new THREE.Group(); deck.position.set(D.deck[0], 0, D.deck[1]); root.add(deck);
  mk(new THREE.BoxGeometry(5, 0.3, 2.2), std(0xa0754c, 0.85), deck, 0, 0.15, 0.8);
  for (const x of [-2.4, 2.4]) mk(new THREE.BoxGeometry(0.08, 0.9, 2.2), std(0xf3efe6, 0.6), deck, x, 0.75, 0.8);
  const nh = makeHouse({ w: NH.w, d: NH.d, h: NH.h, siding: sidingTex('#a9c8e0', 'rgba(40,70,100,.3)') }); nh.g.position.set(NH.x, 0, NH.z); root.add(nh.g);
  // the neighbor's upstairs window: an "open" dark rectangle (he leans out in front of it) + the glass (hidden when open)
  const nwin = { g: new THREE.Group() }; nwin.g.position.set(...D.nwin); root.add(nwin.g);
  { const wv = windowAt(nwin.g, 0, 0, 0.03, 1.0, 1.0, { cross: false }); nwin.glass = wv.glass; nwin.open = mk(new THREE.PlaneGeometry(1.0, 1.0), std(0x2a2226, 0.95), nwin.g, 0, 0, 0.025); nwin.open.visible = false;
    const shL = mk(new THREE.BoxGeometry(0.5, 1.15, 0.05), std(0x2f5f8a, 0.7), nwin.g, -0.82, 0, 0.05), shR = mk(new THREE.BoxGeometry(0.5, 1.15, 0.05), std(0x2f5f8a, 0.7), nwin.g, 0.82, 0, 0.05); nwin.shutters = [shL, shR]; }
  // hide the house's own window that sits behind nwin
  for (const wv of nh.wins) { const p = wv.g.position; if (Math.abs(nh.g.position.x + p.x - D.nwin[0]) < 1.3 && p.y > 2.5) wv.g.visible = false; }
  // fences + the gate (left fence)
  const fences = {};
  fences.back = makeFence(root, D.fenceL, D.fenceB, D.fenceR, D.fenceB);
  fences.left = new THREE.Group(); root.add(fences.left);
  makeFence(fences.left, D.fenceL, -3.6, D.fenceL, D.gate[1] - 0.8); makeFence(fences.left, D.fenceL, D.gate[1] + 0.8, D.fenceL, 12);
  const gate = new THREE.Group(); gate.position.set(D.fenceL, 0, D.gate[1] - 0.78); root.add(gate);
  { const gm = std(0xb88a5a, 0.9); mk(new THREE.BoxGeometry(0.05, 1.7, 1.52), gm, gate, 0, 0.88, 0.76); mk(new THREE.BoxGeometry(0.07, 0.1, 1.5), std(0x8a6038), gate, 0.03, 1.4, 0.76); mk(new THREE.BoxGeometry(0.07, 0.1, 1.5), std(0x8a6038), gate, 0.03, 0.4, 0.76); }
  fences.mid = makeFence(root, D.fenceM, -4.1, D.fenceM, 12);
  fences.right = makeFence(root, D.fenceR, -4.1, D.fenceR, 12);

  // ---- the shed (front gable + door at +z)
  const S = D.shed, sid = sidingTex(), wall = (w, h) => std(0xffffff, 0.85, { map: rep(sid, w, h) }), trim = WHITE;
  const shed = { g: new THREE.Group() }; root.add(shed.g);
  const ply = std(0xffffff, 0.9, { map: rep(plyTex(), 2, 1) });
  mk(new THREE.BoxGeometry(S.w + 0.1, 0.12, S.d + 0.1), std(0x8a6a48, 0.9), shed.g, 0, 0.06, 0);   // skid floor
  const fl = mk(new THREE.PlaneGeometry(S.w - 0.1, S.d - 0.1), std(0xc9a273, 0.85), shed.g, 0, 0.125, 0); fl.rotation.x = -PI / 2;
  mk(new THREE.BoxGeometry(S.w, S.h, 0.08), wall(S.w, S.h), shed.g, 0, S.h / 2 + 0.12, -S.d / 2 + 0.04);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, S.h, S.d), wall(S.d, S.h), shed.g, s * (S.w / 2 - 0.04), S.h / 2 + 0.12, 0);
  for (const [x, z, w2, d2] of [[0, -S.d / 2 + 0.09, S.w - 0.2, 0.01], [-(S.w / 2 - 0.09), 0, 0.01, S.d - 0.2], [S.w / 2 - 0.09, 0, 0.01, S.d - 0.2]]) mk(new THREE.BoxGeometry(w2, S.h - 0.05, d2), ply, shed.g, x, S.h / 2 + 0.12, z);   // plywood inside
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mk(new THREE.BoxGeometry(0.1, S.h, 0.1), trim, shed.g, x * (S.w / 2 - 0.02), S.h / 2 + 0.12, z * (S.d / 2 - 0.02));
  windowAt(shed.g, S.w / 2 + 0.01, 1.45, 0.1, 0.6, 0.5).g.rotation.y = PI / 2;   // a little side window
  // front wall with the door opening (a group: hide it to film the classroom)
  shed.front = new THREE.Group(); shed.g.add(shed.front);
  { const dw = S.doorW, dh = S.doorH, z = S.d / 2 - 0.04, side = (S.w - dw) / 2;
    mk(new THREE.BoxGeometry(side, S.h, 0.08), wall(side, S.h), shed.front, -(dw / 2 + side / 2), S.h / 2 + 0.12, z);
    mk(new THREE.BoxGeometry(side, S.h, 0.08), wall(side, S.h), shed.front, dw / 2 + side / 2, S.h / 2 + 0.12, z);
    mk(new THREE.BoxGeometry(dw, S.h - dh, 0.08), wall(dw, S.h - dh), shed.front, 0, dh + 0.12 + (S.h - dh) / 2, z);
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, dh, 0.12), trim, shed.front, s * (dw / 2 + 0.04), dh / 2 + 0.12, z + 0.02);
    mk(new THREE.BoxGeometry(dw + 0.16, 0.08, 0.12), trim, shed.front, 0, dh + 0.16, z + 0.02);
    shed.door = new THREE.Group(); shed.door.position.set(-dw / 2, 0.12, z + 0.02); shed.front.add(shed.door);
    const dm = std(0xffffff, 0.8, { map: rep(sidingTex('#7fa88c'), 1, 2) });
    mk(new THREE.BoxGeometry(dw - 0.02, dh - 0.02, 0.05), dm, shed.door, dw / 2, dh / 2, 0);
    for (const y of [0.3, dh - 0.3]) mk(new THREE.BoxGeometry(dw - 0.1, 0.08, 0.03), trim, shed.door, dw / 2, y, 0.035);
    const zb = mk(new THREE.BoxGeometry(0.07, Math.hypot(dw - 0.1, dh - 0.6), 0.03), trim, shed.door, dw / 2, dh / 2, 0.035); zb.rotation.z = Math.atan2(dw - 0.1, dh - 0.6);
    mk(new THREE.SphereGeometry(0.035, 8, 6), std(0x2a2a2a, 0.4, { metalness: 0.6 }), shed.door, dw - 0.12, dh * 0.5, 0.06); }
  // the cardboard UNIVERSITY sign above the door: pivot on its right nail
  shed.sign = new THREE.Group(); shed.sign.position.set(0.66, S.doorH + 0.32, S.d / 2 + 0.03); shed.front.add(shed.sign);
  { const st = tex(512, 112, (g, w, h) => { g.fillStyle = '#c99a5e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,80,40,.25)'; for (let i = 0; i < 9; i++) g.fillRect(0, i * 13, w, 2); g.fillStyle = '#1a1a1a'; g.font = '700 74px Fredoka, Arial'; g.textBaseline = 'middle'; const t = 'UNIVERSITY'; let x = 26; for (let i = 0; i < t.length; i++) { g.save(); g.translate(x, h / 2 + 4 + Math.sin(i * 2.1) * 5); g.rotate(Math.sin(i * 1.7) * 0.08); g.fillText(t[i], 0, 0); g.restore(); x += g.measureText(t[i]).width + 3; } g.fillStyle = '#555'; g.beginPath(); g.arc(14, 18, 5, 0, TAU); g.arc(w - 14, 18, 5, 0, TAU); g.fill(); });
    mk(new THREE.BoxGeometry(1.3, 0.28, 0.02), std(0xffffff, 0.9, { map: st }), shed.sign, -0.63, -0.1, 0); }
  // roof group (rides on top: y = wall top) — ridge along z: build along x and turn it
  shed.roof = new THREE.Group(); shed.roof.position.y = S.h + 0.12; shed.g.add(shed.roof);
  { const r = gableRoof(S.d, S.w, S.rise, std(0xffffff, 0.85, { map: rep(shingleTex(), 2, 1) }), wall(S.w, 1), 0.22); r.rotation.y = PI / 2; shed.roof.add(r); }
  // the 2nd floor (sits between the walls and the roof): hollow, with the fire-exit window on the front
  shed.floor2 = new THREE.Group(); shed.floor2.position.y = S.h + 0.12; shed.g.add(shed.floor2); shed.floor2.visible = false;
  { const h2 = S.h2, wx = D.win2[0], ww = 0.8, wh = 0.86, wy = D.win2[1] - (S.h + 0.12), z = S.d / 2 - 0.04;
    mk(new THREE.BoxGeometry(S.w + 0.06, 0.12, S.d + 0.06), trim, shed.floor2, 0, 0.0, 0);
    mk(new THREE.BoxGeometry(S.w, h2, 0.08), wall(S.w, h2), shed.floor2, 0, h2 / 2, -S.d / 2 + 0.04);
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, h2, S.d), wall(S.d, h2), shed.floor2, s * (S.w / 2 - 0.04), h2 / 2, 0);
    const L = wx - ww / 2 + S.w / 2, R = S.w / 2 - (wx + ww / 2);
    mk(new THREE.BoxGeometry(L, h2, 0.08), wall(L, h2), shed.floor2, -S.w / 2 + L / 2, h2 / 2, z);
    mk(new THREE.BoxGeometry(R, h2, 0.08), wall(R, h2), shed.floor2, S.w / 2 - R / 2, h2 / 2, z);
    mk(new THREE.BoxGeometry(ww, wy - wh / 2, 0.08), wall(ww, 1), shed.floor2, wx, (wy - wh / 2) / 2, z);
    mk(new THREE.BoxGeometry(ww, h2 - wy - wh / 2, 0.08), wall(ww, 1), shed.floor2, wx, wy + wh / 2 + (h2 - wy - wh / 2) / 2, z);
    const fr = windowAt(shed.floor2, wx, wy, z + 0.03, ww, wh, { cross: false }); fr.glass.visible = false;
    mk(new THREE.PlaneGeometry(S.w - 0.2, h2 - 0.1), std(0x4a3a2e, 0.95), shed.floor2, 0, h2 / 2, -S.d / 2 + 0.1);   // dark back inside (the opening reads as a room)
    for (const s of [-1, 1]) windowAt(shed.floor2, s * (S.w / 2 + 0.01), 1.0, -0.2, 0.55, 0.5).g.rotation.y = s * PI / 2;
    for (const [x, z2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mk(new THREE.BoxGeometry(0.1, h2, 0.1), trim, shed.floor2, x * (S.w / 2 - 0.02), h2 / 2, z2 * (S.d / 2 - 0.02)); }
  // classroom inside: whiteboard on the back wall, a school desk-chair facing the lens
  shed.board = new THREE.Group(); shed.board.position.set(-0.25, 1.45, -S.d / 2 + 0.12); shed.g.add(shed.board);
  const boardCanvas = document.createElement('canvas'); boardCanvas.width = 512; boardCanvas.height = 300; const bg = boardCanvas.getContext('2d'), boardT = new THREE.CanvasTexture(boardCanvas); boardT.colorSpace = THREE.SRGBColorSpace;
  mk(new THREE.BoxGeometry(1.42, 0.86, 0.04), std(0xb9bfc6, 0.4, { metalness: 0.5 }), shed.board, 0, 0, 0);
  mk(new THREE.PlaneGeometry(1.34, 0.78), new THREE.MeshStandardMaterial({ map: boardT, roughness: 0.25 }), shed.board, 0, 0, 0.022);
  mk(new THREE.BoxGeometry(1.2, 0.04, 0.08), std(0xb9bfc6, 0.4, { metalness: 0.5 }), shed.board, 0, -0.45, 0.04);
  let boardKey = -1;
  shed.setBoard = (k) => {   // k 0..1 = how much of "WELCOME TO SHED U" is written
    const n = Math.round(k * 16); if (n === boardKey) return; boardKey = n;
    bg.fillStyle = '#fbfcfd'; bg.fillRect(0, 0, 512, 300); bg.fillStyle = '#1e4fb0'; bg.font = '700 64px Fredoka, Arial'; bg.textAlign = 'center';
    const full = 'WELCOME TO|SHED U'.split('|'); let left = n;
    full.forEach((line, i) => { const s = line.slice(0, Math.max(0, left)); left -= line.length; bg.fillText(s, 256, 110 + i * 100); });
    if (k >= 1) { bg.strokeStyle = '#d23a2e'; bg.lineWidth = 6; bg.beginPath(); bg.moveTo(150, 250); bg.quadraticCurveTo(256, 280, 362, 248); bg.stroke(); }
    boardT.needsUpdate = true;
  };
  shed.setBoard(0);
  shed.desk = new THREE.Group(); shed.desk.position.set(0.35, 0.12, 0.05); shed.g.add(shed.desk);
  { const metal = std(0x9aa3ad, 0.4, { metalness: 0.6 }), wood = std(0xd7b07a, 0.6), seatM = std(0x2f6fd1, 0.5);
    mk(new THREE.BoxGeometry(0.6, 0.035, 0.42), wood, shed.desk, 0, 0.7, 0.36);
    mk(new THREE.BoxGeometry(0.46, 0.05, 0.42), seatM, shed.desk, 0, 0.44, -0.02); mk(new THREE.BoxGeometry(0.46, 0.42, 0.05), seatM, shed.desk, 0, 0.7, -0.25);
    for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) mk(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6), metal, shed.desk, x, 0.22, z);
    mk(new THREE.BoxGeometry(0.03, 0.03, 0.4), metal, shed.desk, 0.26, 0.6, 0.18); mk(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 6), metal, shed.desk, 0.26, 0.55, 0.36);
    // an apple + a pencil on the desk
    mk(new THREE.SphereGeometry(0.045, 12, 10), std(0xd0302a, 0.4), shed.desk, -0.18, 0.76, 0.42); }
  // a broom, a rake and a paint can inside (it's still a shed)
  mk(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6), std(0xa77b4f, 0.7), shed.g, 1.1, 0.82, -0.85).rotation.z = 0.18;
  mk(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 14), std(0xd8d4cc, 0.5, { metalness: 0.4 }), shed.g, -1.0, 0.21, -0.75);

  // trampoline, trash can, gnome, bell tower
  const tramp = makeTrampoline(); tramp.g.position.set(D.tramp[0], 0, D.tramp[1]); root.add(tramp.g);
  const can = makeTrashCan(); can.g.position.set(D.can[0], 0, D.can[1]); root.add(can.g);
  const gnome = makeGnome(); gnome.g.position.set(D.gnome[0], 0, D.gnome[1]); gnome.g.rotation.y = -0.3; root.add(gnome.g);
  const bell = makeBellTower(); root.add(bell.g); bell.g.visible = false;

  // ---- the brick hall (day 30)
  const HL = D.hall, hw = HL.x1 - HL.x0, hd = HL.z1 - HL.z0, hcx = (HL.x0 + HL.x1) / 2, hcz = (HL.z0 + HL.z1) / 2;
  const hall = { g: new THREE.Group() }; root.add(hall.g); hall.g.visible = false;
  hall.body = new THREE.Group(); hall.g.add(hall.body);
  { const B = brickTex(), bm = (w, h) => std(0xffffff, 0.85, { map: rep(B, w / 1.2, h / 1.2) });
    // front wall (z1) with the door opening, back + sides
    const dw = 1.9, dh = 3.0, side = (hw - dw) / 2;
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(side, HL.h, 0.3), bm(side, HL.h), hall.body, hcx + s * (dw / 2 + side / 2), HL.h / 2, HL.z1 - 0.15);
    mk(new THREE.BoxGeometry(dw, HL.h - dh, 0.3), bm(dw, HL.h - dh), hall.body, hcx, dh + (HL.h - dh) / 2, HL.z1 - 0.15);
    mk(new THREE.BoxGeometry(hw, HL.h, 0.3), bm(hw, HL.h), hall.body, hcx, HL.h / 2, HL.z0 + 0.15);
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.3, HL.h, hd), bm(hd, HL.h), hall.body, hcx + s * (hw / 2 - 0.15), HL.h / 2, hcz);
    mk(new THREE.BoxGeometry(hw, 0.2, hd), std(0x8c8378, 0.9), hall.body, hcx, HL.h - 0.1, hcz);   // roof slab
    mk(new THREE.BoxGeometry(dw - 0.1, dh, 0.1), std(0x2a1c18, 0.9), hall.body, hcx, dh / 2, HL.z1 - 0.32);   // dark inside the doorway
    // the double doors (hinged at the jambs)
    hall.doors = [-1, 1].map((s) => { const d = new THREE.Group(); d.position.set(hcx + s * (dw / 2 - 0.02), 0, HL.z1 - 0.05); hall.body.add(d); mk(new THREE.BoxGeometry(dw / 2 - 0.04, dh - 0.05, 0.08), std(0x5a2a22, 0.55), d, -s * (dw / 4 - 0.01), dh / 2, 0); mk(new THREE.SphereGeometry(0.05, 8, 6), std(0xd9b44a, 0.3, { metalness: 0.8 }), d, -s * (dw / 2 - 0.2), 1.3, 0.06); return d; });
    mk(new THREE.BoxGeometry(dw + 0.3, 0.2, 0.36), WHITE, hall.body, hcx, dh + 0.1, HL.z1);
    // trim: a band between floors, cornice + parapet, corner quoins
    mk(new THREE.BoxGeometry(hw + 0.12, 0.16, hd + 0.12), WHITE, hall.body, hcx, 3.0, hcz);
    mk(new THREE.BoxGeometry(hw + 0.3, 0.3, hd + 0.3), WHITE, hall.body, hcx, HL.h + 0.05, hcz);
    for (const s of [-1, 1]) for (const z of [HL.z0 + 0.15, HL.z1 - 0.15]) mk(new THREE.BoxGeometry(0.42, HL.h, 0.42), WHITE, hall.body, hcx + s * (hw / 2 - 0.12), HL.h / 2, z);
    // windows: front (2 rows × 4, skipping the door bay), sides
    for (const y of [1.6, 4.5]) for (const x of [-3.1, -1.9, 1.9, 3.1]) windowAt(hall.body, hcx + x, y, HL.z1 + 0.01, 0.75, 1.5);
    windowAt(hall.body, hcx, 4.5, HL.z1 + 0.01, 1.0, 1.5);
    for (const s of [-1, 1]) for (const y of [1.6, 4.5]) for (const z of [-3.4, -1.8, -0.2]) windowAt(hall.body, hcx + s * (hw / 2 + 0.01), y, z, 0.75, 1.5).g.rotation.y = s * PI / 2;
    // the portico pad + two steps
    mk(new THREE.BoxGeometry(hw - 0.6, 0.12, 2.2), std(0xd8d2c6, 0.8), hall.body, hcx, 0.06, HL.z1 + 1.1);
    mk(new THREE.BoxGeometry(hw - 1.2, 0.06, 0.5), std(0xd8d2c6, 0.8), hall.body, hcx, 0.03, HL.z1 + 2.45); }
  hall.cols = HL.colX.map((x) => { const c = makeColumn(HL.colH); c.position.set(hcx + x, 0.12, HL.colZ); hall.g.add(c); return c; });
  hall.top = new THREE.Group(); hall.g.add(hall.top);
  { const m = std(0xf3efe6, 0.55), y0 = HL.colH + 0.12, zf = HL.colZ + 0.45;
    mk(new THREE.BoxGeometry(hw - 0.4, 0.55, zf - HL.z1 + 0.1), m, hall.top, hcx, y0 + 0.275, (zf + HL.z1) / 2 - 0.05);
    const fr = mk(new THREE.PlaneGeometry(hw - 1.0, 0.42), std(0xffffff, 0.6, { map: signText('SHED UNIVERSITY', { bg: '#f3efe6', fg: '#3a2c24', px: 100, letter: 10 }) }), hall.top, hcx, y0 + 0.28, zf + 0.01); fr.castShadow = false;
    const sh = new THREE.Shape(); sh.moveTo(-(hw - 0.2) / 2, 0); sh.lineTo((hw - 0.2) / 2, 0); sh.lineTo(0, 1.35); sh.closePath();
    const pg = new THREE.ExtrudeGeometry(sh, { depth: zf - HL.z1 + 0.1, bevelEnabled: false }); pg.translate(0, 0, -(zf - HL.z1 + 0.1));
    mk(pg, m, hall.top, hcx, y0 + 0.55, zf + 0.04);
    // a raccoon crest in the pediment (painted on a disc)
    const crest = tex(256, 256, (g, w) => { g.fillStyle = '#7a1f2b'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 6, 0, TAU); g.fill(); g.strokeStyle = '#e2b34a'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#e2b34a'; g.font = '700 120px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SU', w / 2, w / 2 + 6); });
    mk(new THREE.CircleGeometry(0.42, 28), std(0xffffff, 0.5, { map: crest }), hall.top, hcx, y0 + 1.05, zf + 0.06); }
  // graduation banner across the middle columns + the podium on the portico (day 100)
  hall.banner = mk(new THREE.PlaneGeometry(1.75, 0.55), std(0xffffff, 0.7, { map: signText('CLASS OF DAY 100', { bg: '#7a1f2b', fg: '#ffd96a', px: 90, font: '"Luckiest Guy", Arial', weight: '400' }), side: THREE.DoubleSide }), hall.g, hcx, 4.4, HL.colZ + 0.02); hall.banner.visible = false;
  hall.podium = new THREE.Group(); hall.podium.position.set(...D.podium); hall.g.add(hall.podium); hall.podium.visible = false;
  { mk(new RoundedBoxGeometry(0.7, 1.05, 0.5, 2, 0.04), std(0x6e4a2c, 0.55), hall.podium, 0, 0.525, 0); mk(new THREE.BoxGeometry(0.8, 0.06, 0.6), std(0x5a3a22, 0.55), hall.podium, 0, 1.08, -0.02).rotation.x = 0.12;
    const cr = mk(new THREE.CircleGeometry(0.18, 24), std(0xffffff, 0.5, { map: hall.top.children.find((c) => c.geometry?.type === 'CircleGeometry').material.map }), hall.podium, 0, 0.65, 0.255); cr.castShadow = false; }
  // ivy patches: on the hall (front, sides), both houses; each pops in from its foot
  const ivyMats = [1, 2, 3].map((s) => new THREE.MeshStandardMaterial({ map: ivyTex(s), transparent: false, alphaTest: 0.5, roughness: 0.85, side: THREE.DoubleSide }));
  const ivy = [];
  const addIvy = (parent, x, y0, z, w, h, rotY, k) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = rotY; parent.add(g); const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0); const m = new THREE.Mesh(geo, ivyMats[k % 3]); m.castShadow = false; m.receiveShadow = true; g.add(m); g.visible = false; ivy.push({ g, x, y0, z, k: ivy.length }); return g; };
  { const zf = HL.z1 + 0.17; for (const x of [-3.5, -2.3, 2.3, 3.5]) addIvy(hall.g, hcx + x, 0, zf, 1.5, 4.8 + h1(x, 3) * 1.0, 0, Math.round(x + 4));
    for (const s of [-1, 1]) for (const z of [-3.8, -2.0, -0.4]) addIvy(hall.g, hcx + s * (hw / 2 + 0.17), 0, z, 1.6, 4.4 + h1(z, s) * 1.4, s * PI / 2, Math.round(z + 5));
    for (const x of [-3.0, -0.6, 1.6, 3.2]) addIvy(root, H.x + x, 0, H.z + H.d / 2 + 0.06, 1.7, 3.2 + h1(x, 9) * 1.6, 0, Math.round(x + 7));
    for (const x of [-2.6, 0.8, 2.9]) addIvy(root, NH.x + x, 0, NH.z + NH.d / 2 + 0.06, 1.6, 3.0 + h1(x, 4) * 1.8, 0, Math.round(x + 2)); }
  hall.ivy = ivy;

  // ---- the neighbor's yard: pool, lounger, umbrella, grill
  const P = D.pool, pool = { g: new THREE.Group() }; root.add(pool.g);
  { const cop = std(0xe9e4da, 0.7);
    mk(new THREE.BoxGeometry(P[2] + 0.5, 0.06, 0.25), cop, pool.g, P[0], 0.03, P[1] - P[3] / 2 - 0.12); mk(new THREE.BoxGeometry(P[2] + 0.5, 0.06, 0.25), cop, pool.g, P[0], 0.03, P[1] + P[3] / 2 + 0.12);
    mk(new THREE.BoxGeometry(0.25, 0.06, P[3]), cop, pool.g, P[0] - P[2] / 2 - 0.12, 0.03, P[1]); mk(new THREE.BoxGeometry(0.25, 0.06, P[3]), cop, pool.g, P[0] + P[2] / 2 + 0.12, 0.03, P[1]);
    const wt = tex(256, 256, (g, w, h) => { g.fillStyle = '#5ec8e6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { g.beginPath(); const x = h1(i, 1) * w, y = h1(i, 2) * h; g.moveTo(x, y); g.bezierCurveTo(x + 14, y - 8, x + 28, y + 8, x + 44, y); g.stroke(); } });
    pool.water = mk(new THREE.PlaneGeometry(P[2], P[3]), new THREE.MeshStandardMaterial({ map: rep(wt, 2, 1.2), roughness: 0.1, metalness: 0.1, emissive: 0x1a6f8a, emissiveIntensity: 0.25 }), pool.g, P[0], 0.015, P[1]); pool.water.rotation.x = -PI / 2; pool.water.castShadow = false;
    const lad = std(0xc8cdd2, 0.3, { metalness: 0.8 }); for (const s of [-1, 1]) { const r = mk(new THREE.TorusGeometry(0.22, 0.025, 6, 12, PI), lad, pool.g, P[0] + P[2] / 2 - 0.5 + s * 0.22, 0.06, P[1] - P[3] / 2 - 0.05); r.rotation.y = PI / 2; }
    // lounger + umbrella + grill
    const lg = new THREE.Group(); lg.position.set(P[0] + 3.2, 0, P[1] + 0.4); lg.rotation.y = -0.4; pool.g.add(lg);
    mk(new THREE.BoxGeometry(0.62, 0.08, 1.4), std(0xf4f0e6, 0.7), lg, 0, 0.36, 0.2); const back = mk(new THREE.BoxGeometry(0.62, 0.08, 0.7), std(0xf4f0e6, 0.7), lg, 0, 0.6, -0.65); back.rotation.x = 0.8;
    for (let i = 0; i < 5; i++) mk(new THREE.BoxGeometry(0.64, 0.085, 0.07), std(0x2f7fd6, 0.6), lg, 0, 0.365, -0.3 + i * 0.25);
    for (const [x, z] of [[-0.27, -0.4], [0.27, -0.4], [-0.27, 0.8], [0.27, 0.8]]) mk(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6), std(0xc8cdd2, 0.4, { metalness: 0.6 }), lg, x, 0.18, z);
    const um = new THREE.Group(); um.position.set(P[0] + 3.8, 0, P[1] - 1.0); pool.g.add(um);
    mk(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), std(0xf4f0e6, 0.5), um, 0, 1.15, 0);
    const can2 = mk(new THREE.ConeGeometry(1.25, 0.5, 8, 1, true), std(0xe85d4a, 0.6, { side: THREE.DoubleSide }), um, 0, 2.2, 0); can2.castShadow = true;
    const gr = new THREE.Group(); gr.position.set(P[0] - 3.5, 0, P[1] - 2.0); pool.g.add(gr);
    const grill = mk(new THREE.SphereGeometry(0.35, 18, 10, 0, TAU, 0, PI / 2), std(0x1c1c1e, 0.4, { metalness: 0.4 }), gr, 0, 0.82, 0); grill.rotation.x = PI;
    mk(new THREE.SphereGeometry(0.35, 18, 10, 0, TAU, 0, PI / 2), std(0x1c1c1e, 0.4, { metalness: 0.4 }), gr, 0, 0.84, 0).scale.y = 0.7;
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; const l = mk(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), std(0x1c1c1e), gr, Math.cos(a) * 0.2, 0.3, Math.sin(a) * 0.2); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); } }

  // ---- the stadium (day 60): a field over the pool + bleachers that pop row by row
  const F = D.field, stadium = { g: new THREE.Group(), rows: [], seats: [] }; root.add(stadium.g); stadium.g.visible = false;
  { const ft = tex(512, 368, (g, w, h) => { for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#4fa83a' : '#5bb944'; g.fillRect(i * w / 10, 0, w / 10, h); } g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(14, 14, w - 28, h - 28); for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(14 + i * (w - 28) / 10, 14); g.lineTo(14 + i * (w - 28) / 10, h - 14); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 46px Fredoka'; g.textAlign = 'center'; g.fillText('SU', w / 2, h / 2 + 16); });
    stadium.field = mk(new THREE.PlaneGeometry(F[2], F[3]), std(0xffffff, 0.95, { map: ft }), stadium.g, F[0], 0.02, F[1]); stadium.field.rotation.x = -PI / 2; stadium.field.castShadow = false;
    const yel = std(0xf2c418, 0.5);
    for (const s of [-1, 1]) { const gp = new THREE.Group(); gp.position.set(F[0] + s * (F[2] / 2 - 0.1), 0, F[1]); stadium.g.add(gp); mk(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8), yel, gp, 0, 0.75, 0); mk(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), yel, gp, 0, 1.5, 0).rotation.x = PI / 2; for (const z of [-0.9, 0.9]) mk(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), yel, gp, 0, 2.3, z); }
    const benchM = std(0xb9c0c8, 0.4, { metalness: 0.5 }), riserM = std(0x7a1f2b, 0.7);
    // back stand (along x, behind the field, rising toward −z) + right stand (along z, rising toward +x)
    for (let r = 0; r < 5; r++) {
      const rg = new THREE.Group(); stadium.g.add(rg); stadium.rows.push(rg);
      const y = 0.42 + r * 0.42, zb = F[1] - F[3] / 2 - 0.55 - r * 0.62, x0 = F[0] - F[2] / 2 + 0.3, x1 = F[0] + F[2] / 2 + 0.6;
      mk(new THREE.BoxGeometry(x1 - x0, y, 0.62), riserM, rg, (x0 + x1) / 2, y / 2, zb); mk(new THREE.BoxGeometry(x1 - x0, 0.06, 0.4), benchM, rg, (x0 + x1) / 2, y + 0.03, zb + 0.05);
      for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.62) stadium.seats.push({ x, y: y + 0.06, z: zb + 0.02, rotY: 0, row: r, side: 'back' });
      const rg2 = new THREE.Group(); stadium.g.add(rg2); stadium.rows.push(rg2);
      const xb = F[0] + F[2] / 2 + 0.95 + r * 0.62, z0 = F[1] - F[3] / 2 + 0.2, z1 = F[1] + F[3] / 2 + 1.5;
      mk(new THREE.BoxGeometry(0.62, y, z1 - z0), riserM, rg2, xb, y / 2, (z0 + z1) / 2); mk(new THREE.BoxGeometry(0.4, 0.06, z1 - z0), benchM, rg2, xb - 0.05, y + 0.03, (z0 + z1) / 2);
      for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.62) stadium.seats.push({ x: xb - 0.02, y: y + 0.06, z, rotY: -PI / 2, row: r, side: 'right' });
    }
    const sb = new THREE.Group(); sb.position.set(F[0] + F[2] / 2 + 4.7, 0, F[1] - F[3] / 2 - 2.4); sb.rotation.y = -0.6; stadium.g.add(sb); stadium.board = sb;
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.16, 4.2, 0.16), std(0x3a3e44, 0.5), sb, s * 1.3, 2.1, 0);
    mk(new THREE.BoxGeometry(3.2, 1.6, 0.2), std(0x1c1c1e, 0.5), sb, 0, 4.4, 0);
    mk(new THREE.PlaneGeometry(3.0, 1.4), new THREE.MeshBasicMaterial({ map: tex(512, 240, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f'; g.font = '400 54px "Luckiest Guy", Arial'; g.textAlign = 'center'; g.fillText('SHED U', w * 0.27, 70); g.fillText('GUEST', w * 0.73, 70); g.fillStyle = '#ff5a3c'; g.font = '400 110px "Luckiest Guy", Arial'; g.fillText('42', w * 0.27, 190); g.fillText('0', w * 0.73, 190); }), toneMapped: false }), sb, 0, 4.4, 0.11); }

  // ---- Mom's dining hall: a folding table, a big pot, bowls, a cardboard sign
  const table = { g: new THREE.Group() }; table.g.position.set(D.table[0], 0, D.table[1]); root.add(table.g);
  { mk(new THREE.BoxGeometry(1.9, 0.05, 0.76), std(0xf4f2ec, 0.6), table.g, 0, 0.74, 0); for (const [x, z] of [[-0.85, -0.3], [0.85, -0.3], [-0.85, 0.3], [0.85, 0.3]]) mk(new THREE.CylinderGeometry(0.02, 0.02, 0.74, 6), std(0x9aa3ad, 0.4, { metalness: 0.6 }), table.g, x, 0.37, z);
    table.pot = mk(new THREE.CylinderGeometry(0.3, 0.27, 0.42, 22), std(0xc8cdd2, 0.25, { metalness: 0.85 }), table.g, -0.35, 0.98, -0.05);
    mk(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 22), std(0xd98a3a, 0.5), table.g, -0.35, 1.17, -0.05);
    for (let i = 0; i < 6; i++) mk(new THREE.CylinderGeometry(0.09, 0.06, 0.06, 12), std(0xf4f4f0, 0.4), table.g, 0.35 + (i % 3) * 0.2, 0.8 + Math.floor(i / 3) * 0.06, 0.1);
    mk(new THREE.BoxGeometry(0.36, 0.22, 0.26), std(0xd9b98a, 0.85), table.g, -0.8, 0.88, -0.1);
    const s = mk(new THREE.PlaneGeometry(1.1, 0.34), std(0xffffff, 0.9, { map: signText('DINING HALL', { bg: '#c99a5e', fg: '#1a1a1a', font: 'Fredoka, Arial', px: 96 }) }), table.g, 0, 0.55, 0.385); s.castShadow = false; }
  table.g.visible = false;

  // ---- day 100: the clock tower, far halls, lamp posts with banners, brick paths, grad chairs
  const tower = { g: new THREE.Group() }; tower.g.position.set(D.tower[0], 0, D.tower[1]); root.add(tower.g); tower.g.visible = false;
  { const B = brickTex(), th = 13; mk(new THREE.BoxGeometry(3, th, 3), std(0xffffff, 0.85, { map: rep(B, 2.5, th / 1.2) }), tower.g, 0, th / 2, 0);
    for (const y of [5, 9.5]) mk(new THREE.BoxGeometry(3.2, 0.2, 3.2), WHITE, tower.g, 0, y, 0);
    mk(new THREE.BoxGeometry(3.4, 0.4, 3.4), WHITE, tower.g, 0, th, 0);
    tower.clock = makeClockFace(); tower.clock.set(4, 0);
    for (let k = 0; k < 4; k++) { const a = (k * PI) / 2, f = new THREE.Group(); f.position.set(Math.sin(a) * 1.52, 11.2, Math.cos(a) * 1.52); f.rotation.y = a; tower.g.add(f); mk(new THREE.CircleGeometry(0.95, 32), WHITE, f, 0, 0, 0.0); mk(new THREE.CircleGeometry(0.82, 32), new THREE.MeshStandardMaterial({ map: tower.clock.tex, roughness: 0.5 }), f, 0, 0, 0.01); }
    for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) mk(new THREE.BoxGeometry(0.3, 2.0, 0.3), WHITE, tower.g, x, th + 1.2, z);
    mk(new THREE.BoxGeometry(3.0, 0.3, 3.0), WHITE, tower.g, 0, th + 2.3, 0);
    const sp = mk(new THREE.ConeGeometry(1.9, 4.2, 4), std(0x6fa595, 0.4, { metalness: 0.4 }), tower.g, 0, th + 4.55, 0); sp.rotation.y = PI / 4;
    mk(new THREE.SphereGeometry(0.15, 10, 8), std(0xe2b34a, 0.3, { metalness: 0.8 }), tower.g, 0, th + 6.8, 0); }
  const campus = [];
  for (const [x, z, ry, o] of [[-22, -9, 0.35, { w: 11, d: 8, h: 9, name: 'LIBRARY' }], [26, -10, -0.4, { w: 12, d: 9, h: 10, dome: true, name: 'SCIENCE' }], [-6, -22, 0, { w: 14, d: 8, h: 11, name: 'RACCOON HALL' }], [14, -24, -0.1, { w: 10, d: 8, h: 8, name: 'DORMS' }], [-30, 6, 0.9, { w: 10, d: 8, h: 8, name: 'GYM' }], [32, 6, -0.9, { w: 10, d: 8, h: 9, gable: true, name: 'ARTS' }]]) {
    const h = makeFarHall(o); h.position.set(x, 0, z); h.rotation.y = ry; root.add(h); h.visible = false; campus.push(h);
  }
  const lamps = [];
  { const black = std(0x1c1c1e, 0.4, { metalness: 0.4 }), globe = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.4, roughness: 0.3 });
    const ban = std(0xffffff, 0.7, { map: tex(128, 256, (g, w, h) => { g.fillStyle = '#7a1f2b'; g.fillRect(0, 0, w, h); g.fillStyle = '#e2b34a'; g.font = '700 70px Georgia'; g.textAlign = 'center'; g.fillText('S', w / 2, 110); g.fillText('U', w / 2, 190); }), side: THREE.DoubleSide });
    for (const [x, z] of [[-7.5, 4], [7.5, 4], [-7.5, 10], [7.5, 10], [-7.5, 16], [7.5, 16]]) { const l = new THREE.Group(); l.position.set(x, 0, z); root.add(l); lamps.push(l); l.visible = false;
      mk(new THREE.CylinderGeometry(0.06, 0.09, 3.6, 8), black, l, 0, 1.8, 0); mk(new THREE.SphereGeometry(0.22, 14, 10), globe, l, 0, 3.75, 0); const b = mk(new THREE.PlaneGeometry(0.5, 1.0), ban, l, 0.28, 2.6, 0); b.castShadow = false; } }
  const paths = new THREE.Group(); root.add(paths); paths.visible = false;
  { const pt = tex(256, 256, (g, w, h) => { g.fillStyle = '#c7a48a'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { g.fillStyle = ['#b8836a', '#c48d70', '#a9745c'][(r + c) % 3]; g.fillRect(c * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); } });
    const a = mk(new THREE.PlaneGeometry(3.2, 34), std(0xffffff, 0.9, { map: rep(pt, 2, 20) }), paths, 0, 0.012, 20); a.rotation.x = -PI / 2; a.castShadow = false;
    const b = mk(new THREE.PlaneGeometry(40, 2.4), std(0xffffff, 0.9, { map: rep(pt, 24, 1.5) }), paths, 0, 0.013, 19); b.rotation.x = -PI / 2; b.castShadow = false; }
  // folding chairs for the graduates (instanced): 12 × 10 on the quad
  const chairSpots = []; for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++) chairSpots.push({ x: -5.8 + c * 1.05 + (c >= 6 ? 0.9 : 0), z: 6.0 + r * 1.15, r, c });
  const chairG = new THREE.BoxGeometry(0.46, 0.05, 0.44), chairB = new THREE.BoxGeometry(0.46, 0.4, 0.04);
  const chairs = [new THREE.InstancedMesh(chairG, std(0xf4f2ec, 0.6), chairSpots.length), new THREE.InstancedMesh(chairB, std(0xf4f2ec, 0.6), chairSpots.length)];
  { const M4 = new THREE.Matrix4(); chairSpots.forEach((s, i) => { M4.makeTranslation(s.x, 0.44, s.z); chairs[0].setMatrixAt(i, M4); M4.makeTranslation(s.x, 0.68, s.z + 0.22); chairs[1].setMatrixAt(i, M4); }); for (const c of chairs) { c.castShadow = true; c.receiveShadow = true; root.add(c); c.visible = false; } }

  // ---- the far suburb (wide shots look past the fences) + trees
  const houseCols = ['#f2d49b', '#a9cbe0', '#e8a7a0', '#c6dcb0', '#f0c9a8', '#d7c4e8', '#f4e1b5'];
  const farHouses = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 14; i++) { const x = -44 + i * 7.2 + (r % 2) * 3.6, z = -18 - r * 12; const hgt = 3.8 + ((i * 7 + r) % 3) * 0.6; const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); farHouses.push(g);
    mk(new THREE.BoxGeometry(5.4, hgt, 5), std(new THREE.Color(houseCols[(i + r) % houseCols.length]).getHex(), 0.9), g, 0, hgt / 2, 0); const rf = mk(new THREE.ConeGeometry(4.0, 1.9, 4), std(0x9b5a48, 0.85), g, 0, hgt + 0.95, 0); rf.rotation.y = PI / 4; rf.scale.set(1, 1, 0.85); }
  const trees = [];
  for (const [x, z, s] of [[-15.5, -12.5, 1.7], [-3.5, -12.8, 1.9], [4.6, -12.2, 1.6], [19.5, -12, 1.8], [-16.5, 8, 1.6], [20.5, 6, 1.7], [-17, -2, 1.5], [21, -4, 1.6], [8.5, -12.6, 1.5], [-9.5, -13, 1.7]]) { const t = makeTree(Math.round(x * 7 + z), s); t.position.set(x, 0, z); root.add(t); trees.push(t); }
  // quad trees (day 100 only)
  const quadTrees = [];
  for (const [x, z] of [[-9.5, 7], [9.5, 7], [-9.5, 13], [9.5, 13], [-9.8, 19], [9.8, 19]]) { const t = makeTree(Math.round(x * 3 + z * 5), 1.5); t.position.set(x, 0, z); root.add(t); t.visible = false; quadTrees.push(t); }
  // a few clouds of flowers along our fence
  { const fM = [0xff6f91, 0xffd23f, 0xffffff, 0xb36bff].map((c) => std(c, 0.6)); const R = rng(50); for (let i = 0; i < 70; i++) { const x = D.fenceL + 0.4 + R() * 7, z = -3.2 + R() * 0.5; mk(new THREE.SphereGeometry(0.06 + R() * 0.04, 6, 5), fM[i % 4], root, x + (i % 2 ? 0 : 9.5), 0.3 + R() * 0.25, z - 6.6 - (i % 2 ? 0 : 0)); } }

  /** k = 1: day-100 dressing (far halls, lamps, paths, quad trees, fences gone except the back one). */
  function setDay(k) {
    const on = k >= 1;
    for (const h of campus) h.visible = on; for (const l of lamps) l.visible = on; paths.visible = on; for (const t of quadTrees) t.visible = on;
    for (const f of farHouses) f.visible = !on; fences.left.visible = !on; gate.visible = !on;
  }

  return { root, D, sky, lawn, sun, hemi, aimSun, house, deck, nh, nwin, fences, gate, shed, tramp, can, gnome, bell, hall, pool, stadium, table, tower, campus, lamps, paths, chairs, chairSpots, trees, quadTrees, farHouses, setDay };
}
