// River-canyon dam cutaway (build genre, video 025 "How a Kiddie Pool Becomes a Dam"). A sunny desert canyon sliced open
// ALONG the river at z = 0, so the dam reads in section: the reservoir rises on the left (upstream, −x), the river runs on to
// the right (downstream, +x). Camera lives on +z. Every stage of the dam is its own handle the shots animate:
//   creek channel (z 0..−D.SW, bed D.bed) in front of a sandy canyon floor (y 0) up to the back canyon wall (z −D.CW, D.wallH tall);
//   strata cut face below the bed (gravel, sand, bedrock) with runtime holes (the diversion tunnel);
//   water volumes as translucent boxes (makeWaterBody: set(x0, x1, level, t)) seen in section at z = 0;
//   kiddie pool → earth dam (+ piping) → cutoff wall → concrete gravity dam in columns (heat glow, cooling pipes) → spillway chute,
//   penstock + powerhouse + turbine, fish ladder, road/visitor center/gift shop; the drowned town upstream, the town with the
//   (closed) public pool downstream, the beaver's dam between them.
// Reusable props: makeKiddiePool, makeBeaver, makeSalmon, makeHouse, makeChurch, signTex.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mat, mk, rng, clamp, lerp } from '../core.js';
import { makeCutFace, grainTexture } from './cutaway.js';
import { makeTree } from './subway.js';
import { makeCar } from '../sets/city.js';

export const D = {
  CW: 9, SW: 2.2, bed: -0.55, wallH: 12.5,
  face: { x0: -50, x1: 50, y0: -14 },
  layer: { gravel: -1.4, sand: -2.5 },
  // diversion tunnel centre line (x, y) in the cut face, radius R
  tunnel: { R: 0.8, z: -0.25, path: [[-11.9, -0.66], [-11.2, -1.05], [-10.4, -2.2], [-9.2, -3.25], [-7.6, -3.65], [0.4, -3.65], [1.7, -3.25], [2.7, -2.2], [3.3, -1.05], [3.8, -0.66]] },
  dam: { heel: -8.5, toe: 0, crest: 9.4, crestX: -7.3, cols: 6 },
  earth: { x0: -7.4, x1: -1.4, t0: -5.1, t1: -3.7, h: 3.0 },
  cutoff: { x0: -4.7, x1: -4.1, y1: -5.6 },
  kp: { x: -2.6, z: -1.15, r: 0.9 },
  beaver: { x: 6.2 },
  power: { x0: 1.6, x1: 4.8, z0: -2.4, z1: -6.2, turb: [3.2, 1.15, -3.05], R: 0.95 },
  ladder: { z0: -2.6, z1: -4.2 },
  pool: { x0: 8.7, x1: 12.9, z0: -3.25, z1: -6.4 },
  shop: { x: 6.6, z: -3.15 }, visitor: { x: 6.9, z: -5.6 },
  gate: 9.45, thermo: [7.35, -2.3], noSwim: [8.15, -2.4], pylon: [13.9, -6.6],
};
const T = D.tunnel;
/** y of the gravity dam's downstream face at x (crest edge → toe). */
/** The back canyon wall's surface z at (x, y) (it is displaced for relief; things stuck to it use this). */
export function wallDisp(x, y) { const yl = y - (D.wallH / 2 - 1); const ledge = Math.sin((yl + 9) * 1.7) > 0.86 ? 0.35 : 0; return 0.45 * Math.sin(x * 0.37 + yl * 0.2) + 0.3 * Math.sin(x * 1.3 - yl * 0.7) + ledge + (yl < -D.wallH / 2 + 1.5 ? 0.6 * (1 - (yl + D.wallH / 2 + 1) / 2.5) : 0); }
export const wallZ = (x, y) => -D.CW - 0.45 + wallDisp(x, y);
export const slopeY = (x) => lerp(8.55, D.bed, clamp((x - D.dam.crestX) / (D.dam.toe - D.dam.crestX)));

const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const signTex = (w, h, text, { bg = '#ffffff', fg = '#1b1b1b', border = '#1b1b1b', font = 'Luckiest Guy', size = 0.62, pad = 0.08 } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, Math.min(w, h) * 0.12); g.fill();
  if (border) { g.strokeStyle = border; g.lineWidth = Math.min(w, h) * 0.05; g.beginPath(); g.roundRect(4 + h * pad, 4 + h * pad, w - 8 - 2 * h * pad, h - 8 - 2 * h * pad, Math.min(w, h) * 0.1); g.stroke(); }
  const lines = String(text).split('\n'); let fs = h * size / lines.length;
  g.font = `${fs}px "${font}", Arial Black`; const wmax = Math.max(...lines.map((l) => g.measureText(l).width));
  if (wmax > w * 0.86) { fs *= (w * 0.86) / wmax; g.font = `${fs}px "${font}", Arial Black`; }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.08 + fs * 0.06));
});
const board = (w, h, text, o) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(Math.round(256 * w / h), 256, text, o), roughness: 0.6 }));
/** Move a group's pivot to c (its children were placed in world coordinates) so it can pop/scale in place. */
const recenter = (g, c) => { for (const ch of g.children) ch.position.sub(new THREE.Vector3(...c)); g.position.set(...c); return g; };
const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- strata (the cut face below the creek bed)
function paintStrata(g, P, x0, x1) {
  const R = rng(25), W = x1 - x0;
  const wave = (x, k) => 0.08 * Math.sin(x * 0.9 + k) + 0.05 * Math.sin(x * 2.7 + 2 * k);
  const layers = [[D.bed + 0.2, '#8d8273'], [D.layer.gravel, '#c9a46e'], [D.layer.sand, '#8a4f36']];
  layers.forEach(([top, col], i) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(P.x(x0), P.y(top + (i ? wave(x0, i) : 0)));
    for (let x = x0; x <= x1; x += 0.25) g.lineTo(P.x(x), P.y(top + (i ? wave(x, i) : 0)));
    g.lineTo(P.x(x1), P.H); g.lineTo(P.x(x0), P.H); g.closePath(); g.fill();
  });
  const blot = (yTop, yBot, cols, n, rx, ry) => { for (let i = 0; i < n; i++) { const x = x0 + R() * W, y = yBot + R() * (yTop - yBot); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(rx * (0.5 + R())), P.s(ry * (0.5 + R())), 0, 0, 7); g.fill(); } };
  // sand lenses, bedrock bands (long flat strokes read as sediment; round blotches read as leopard print — 024's look review)
  blot(D.layer.gravel - 0.1, D.layer.sand + 0.1, ['rgba(150,110,60,.22)', 'rgba(235,200,150,.2)', 'rgba(170,125,75,.18)'], 380, 1.0, 0.06);
  blot(D.layer.sand - 0.2, -14, ['rgba(60,28,18,.22)', 'rgba(170,96,64,.2)', 'rgba(120,62,40,.22)', 'rgba(196,128,90,.14)'], 900, 1.6, 0.1);
  for (let i = 0; i < 30000; i++) {
    const x = x0 + R() * W, y = D.bed - 0.05 - R() * 13.4, L = 0.02 + R() * 0.05, dark = R() < 0.55;
    g.strokeStyle = dark ? `rgba(50,24,14,${0.1 + R() * 0.16})` : `rgba(255,225,180,${0.05 + R() * 0.1})`;
    g.lineWidth = P.s(0.007 + R() * 0.01); g.beginPath(); g.moveTo(P.x(x), P.y(y)); g.lineTo(P.x(x + (R() - 0.5) * 0.04), P.y(y - L)); g.stroke();
  }
  // river gravel: round cobbles with a highlight
  const pebble = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(P.x(x), P.y(y), P.s(r), P.s(r * 0.72), R() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(P.x(x - r * 0.25), P.y(y + r * 0.2), P.s(r * 0.35), P.s(r * 0.2), 0, 0, 7); g.fill(); };
  for (let i = 0; i < 2200; i++) pebble(x0 + R() * W, D.bed - 0.05 - R() * (D.bed - D.layer.gravel - 0.1), 0.03 + R() * 0.09, ['#a49a8c', '#7d7468', '#b9ad98', '#6d655c', '#c2b6a2'][i % 5]);
  for (let i = 0; i < 300; i++) pebble(x0 + R() * W, D.layer.gravel - R() * 1.0, 0.02 + R() * 0.04, ['#a08a6a', '#8c7a5e'][i % 2]);
  // bedrock joints + cracks
  g.strokeStyle = 'rgba(30,14,8,.5)'; g.lineWidth = P.s(0.025);
  for (let i = 0; i < 140; i++) { let x = x0 + R() * W, y = D.layer.sand - 0.3 - R() * 11; g.beginPath(); g.moveTo(P.x(x), P.y(y)); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 0.7; y -= R() * 0.4; g.lineTo(P.x(x), P.y(y)); } g.stroke(); }
  for (let i = 0; i < 160; i++) pebble(x0 + R() * W, D.layer.sand - 0.6 - R() * 11, 0.15 + R() * 0.3, ['rgba(120,60,40,.55)', 'rgba(70,34,22,.45)', 'rgba(170,100,70,.4)'][i % 3]);
  // the bed line (wet, darker)
  g.strokeStyle = 'rgba(40,30,22,.55)'; g.lineWidth = P.s(0.05); g.beginPath(); g.moveTo(P.x(x0), P.y(D.bed - 0.02)); g.lineTo(P.x(x1), P.y(D.bed - 0.02)); g.stroke();
  // easter eggs: a fish skeleton, a lost flip-flop, a cow skull, an old boot, a coin
  g.save(); g.translate(P.x(-1.6), P.y(-1.95)); g.strokeStyle = '#f1e6cc'; g.lineWidth = P.s(0.025); g.lineCap = 'round';
  g.beginPath(); g.moveTo(-P.s(0.35), 0); g.lineTo(P.s(0.3), 0); g.stroke(); for (let k = 0; k < 6; k++) { const x = -P.s(0.25) + k * P.s(0.09); g.beginPath(); g.moveTo(x, -P.s(0.1)); g.lineTo(x, P.s(0.1)); g.stroke(); }
  g.fillStyle = '#f1e6cc'; g.beginPath(); g.ellipse(P.s(0.38), 0, P.s(0.1), P.s(0.08), 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-P.s(0.35), 0); g.lineTo(-P.s(0.5), -P.s(0.12)); g.lineTo(-P.s(0.5), P.s(0.12)); g.closePath(); g.fill(); g.restore();
  g.save(); g.translate(P.x(12.6), P.y(-1.15)); g.rotate(0.3); g.fillStyle = '#ff5fa2'; g.beginPath(); g.ellipse(0, 0, P.s(0.17), P.s(0.06), 0, 0, 7); g.fill(); g.strokeStyle = '#3ec7ff'; g.lineWidth = P.s(0.02); g.beginPath(); g.moveTo(-P.s(0.04), 0); g.lineTo(P.s(0.06), -P.s(0.05)); g.lineTo(P.s(0.06), P.s(0.05)); g.closePath(); g.stroke(); g.restore();
  g.save(); g.translate(P.x(-20.5), P.y(-2.0)); g.fillStyle = '#efe4c8'; g.beginPath(); g.ellipse(0, 0, P.s(0.16), P.s(0.2), 0, 0, 7); g.fill(); g.fillStyle = '#4a2a18'; g.beginPath(); g.arc(-P.s(0.06), -P.s(0.04), P.s(0.035), 0, 7); g.arc(P.s(0.06), -P.s(0.04), P.s(0.035), 0, 7); g.fill();
  g.strokeStyle = '#efe4c8'; g.lineWidth = P.s(0.04); g.beginPath(); g.moveTo(-P.s(0.14), -P.s(0.12)); g.quadraticCurveTo(-P.s(0.35), -P.s(0.3), -P.s(0.3), -P.s(0.05)); g.moveTo(P.s(0.14), -P.s(0.12)); g.quadraticCurveTo(P.s(0.35), -P.s(0.3), P.s(0.3), -P.s(0.05)); g.stroke(); g.restore();
  g.fillStyle = '#4a3428'; g.beginPath(); g.ellipse(P.x(19.1), P.y(-1.9), P.s(0.16), P.s(0.08), 0.2, 0, 7); g.fill(); g.fillRect(P.x(18.95), P.y(-1.65), P.s(0.08), P.s(0.22));
  g.fillStyle = '#e8c547'; g.beginPath(); g.arc(P.x(-11.2), P.y(-1.7), P.s(0.05), 0, 7); g.fill();
}

// ---------------------------------------------------------------- canyon wall (behind the river) — layered sandstone
function canyonTex(w, h) {
  return tex(w, h, (g) => {
    const R = rng(5), pal = ['#dfae80', '#d29468', '#e6c29a', '#c88660', '#dba57a', '#c27c58', '#e2b48a', '#cd8d66', '#e9caa4', '#bb7656'];
    // ~26 thin sediment bands (fine layering reads as a real canyon; 5 fat waves read as bacon — first test sheet)
    let y = 0, i = 0;
    while (y < h) { const th = h * (0.008 + R() * 0.026), c = pal[(i * 7 + Math.floor(R() * 3)) % pal.length], ph = R() * 9;
      g.fillStyle = c; g.beginPath(); g.moveTo(0, y + Math.sin(ph) * 3); for (let x = 0; x <= w; x += 24) g.lineTo(x, y + Math.sin(x * 0.004 + ph) * 4 + Math.sin(x * 0.017 + i) * 2); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(80,36,18,.28)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= w; x += 24) { const yy = y + Math.sin(x * 0.004 + ph) * 4 + Math.sin(x * 0.017 + i) * 2; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
      y += th; i++; }
    for (let k = 0; k < 2600; k++) { const x = R() * w, yy = R() * h; g.strokeStyle = R() < 0.6 ? `rgba(90,40,20,${0.05 + R() * 0.1})` : `rgba(255,236,200,${0.05 + R() * 0.1})`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 20 + R() * 90, yy + (R() - 0.5) * 3); g.stroke(); }
    // desert varnish streaks running down from the rim + joints/cracks
    for (let k = 0; k < 340; k++) { const x = R() * w, y0 = R() * h * 0.5, L = 60 + R() * 380; const gr = g.createLinearGradient(x, y0, x, y0 + L); gr.addColorStop(0, 'rgba(60,26,16,.15)'); gr.addColorStop(1, 'rgba(60,26,16,0)'); g.fillStyle = gr; g.fillRect(x, y0, 2 + R() * 7, L); }
    g.strokeStyle = 'rgba(55,22,10,.11)'; for (let k = 0; k < 80; k++) { let x = R() * w, yy = R() * h; g.lineWidth = 1 + R() * 2.5; g.beginPath(); g.moveTo(x, yy); for (let q = 0; q < 4; q++) { x += (R() - 0.5) * 16; yy += 10 + R() * 26; g.lineTo(x, yy); } g.stroke(); }
    g.fillStyle = 'rgba(246,226,204,.28)'; g.fillRect(0, 0, w, h);
    // a darker damp band at the foot of the wall
    const fg = g.createLinearGradient(0, h * 0.86, 0, h); fg.addColorStop(0, 'rgba(70,35,20,0)'); fg.addColorStop(1, 'rgba(70,35,20,.35)'); g.fillStyle = fg; g.fillRect(0, h * 0.86, w, h * 0.14);
  });
}

// ---------------------------------------------------------------- props
/** Inflatable kiddie pool (three rings + a printed floor). r = inner radius. setWater(k) fills it. */
export function makeKiddiePool(r = 1.08) {
  const g = new THREE.Group(), t = 0.14;
  const blue = mat(0x3ea8f0, 0.3), white = mat(0xf5f7fb, 0.3), yel = mat(0xffd23f, 0.3);
  [[blue, t], [white, t * 3], [yel, t * 5]].forEach(([m, y]) => mk(new THREE.TorusGeometry(r + t, t, 14, 48), m, g, 0, y, 0).rotation.x = Math.PI / 2);
  const floorT = tex(256, 256, (c, w, h) => { c.fillStyle = '#6cc6ff'; c.fillRect(0, 0, w, h); const R = rng(3);
    for (let i = 0; i < 9; i++) { const x = 30 + R() * 196, y = 30 + R() * 196; c.fillStyle = ['#ff8a3d', '#ffd23f', '#ff5fa2'][i % 3]; c.beginPath(); c.ellipse(x, y, 16, 10, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x - 26, y - 9); c.lineTo(x - 26, y + 9); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 8, y - 2, 2.5, 0, 7); c.fill(); } });
  mk(new THREE.CircleGeometry(r + t, 40), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.4 }), g, 0, 0.02, 0).rotation.x = -Math.PI / 2;
  const water = mk(new THREE.CylinderGeometry(r, r, 1, 40), new THREE.MeshStandardMaterial({ color: 0x5ec3ef, roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false }), g, 0, 0, 0);
  water.castShadow = false;
  const setWater = (k) => { water.visible = k > 0.01; water.scale.y = Math.max(0.01, k * 0.62); water.position.y = 0.03 + k * 0.31; };
  setWater(0);
  return { g, setWater, r, h: t * 6 };
}

/** Toon beaver (~0.55 m on all fours, ~0.75 m standing). set({x,y,z,rotY, stand, write, card, point, slap, swim, look, glasses, t, scale}) */
export function makeBeaver() {
  const fur = new THREE.MeshStandardMaterial({ color: 0x8a5530, roughness: 0.9 }), belly = new THREE.MeshStandardMaterial({ color: 0xc89466, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.6 }), white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const tailT = tex(128, 256, (c, w, h) => { c.fillStyle = '#4a3428'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(20,12,8,.6)'; c.lineWidth = 3; for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 0 : 8; x < w; x += 16) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8, y + 8); c.lineTo(x + 16, y); c.stroke(); } });
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const torso = mk(new THREE.SphereGeometry(0.22, 20, 14), fur, body, 0, 0.25, 0); torso.scale.set(0.95, 0.9, 1.25);
  mk(new THREE.SphereGeometry(0.16, 16, 12), belly, body, 0, 0.22, 0.12).scale.set(0.85, 0.85, 1);
  const head = new THREE.Group(); body.add(head); head.position.set(0, 0.44, 0.22);
  mk(new THREE.SphereGeometry(0.16, 20, 16), fur, head).scale.set(1.12, 0.98, 1);
  const muzzle = mk(new THREE.SphereGeometry(0.09, 14, 10), belly, head, 0, -0.05, 0.12); muzzle.scale.set(1.15, 0.8, 0.9);
  mk(new THREE.SphereGeometry(0.035, 10, 8), dark, head, 0, -0.01, 0.2);
  for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.045, 0.07, 0.02, 2, 0.008), white, head, s * 0.024, -0.12, 0.185);
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(0.045, 12, 10), white, head, s * 0.065, 0.045, 0.12); e.scale.z = 0.6;
    const p = mk(new THREE.SphereGeometry(0.024, 10, 8), dark, head, s * 0.065, 0.045, 0.148); eyes.push(p);
    mk(new THREE.SphereGeometry(0.04, 10, 8), fur, head, s * 0.12, 0.12, -0.02).scale.set(1, 1, 0.6);
    const brow = mk(new THREE.CapsuleGeometry(0.01, 0.045, 4, 6), dark, head, s * 0.065, 0.105, 0.135); brow.rotation.z = Math.PI / 2 + s * 0.25; eyes.push(brow);
  }
  // reading glasses (the engineer)
  const glasses = new THREE.Group(); head.add(glasses); glasses.position.set(0, 0.045, 0.16);
  for (const s of [-1, 1]) mk(new THREE.TorusGeometry(0.042, 0.007, 6, 18), dark, glasses, s * 0.065, 0, 0);
  mk(new THREE.BoxGeometry(0.04, 0.008, 0.008), dark, glasses, 0, 0.005, 0);
  const tail = new THREE.Group(); body.add(tail); tail.position.set(0, 0.12, -0.25);
  const paddle = mk(new RoundedBoxGeometry(0.22, 0.04, 0.36, 2, 0.018), new THREE.MeshStandardMaterial({ map: tailT, roughness: 0.7 }), tail, 0, 0, -0.2);
  const arms = [-1, 1].map((s) => { const a = new THREE.Group(); body.add(a); a.position.set(s * 0.13, 0.32, 0.18); mk(new THREE.CapsuleGeometry(0.035, 0.1, 4, 8), fur, a, 0, -0.07, 0); const hand = new THREE.Group(); a.add(hand); hand.position.y = -0.15; mk(new THREE.SphereGeometry(0.035, 10, 8), dark, hand); return { a, hand }; });
  for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.1, 0.03, 0.16, 2, 0.01), dark, body, s * 0.11, 0.015, 0.05);
  // clipboard (left hand) + pencil (right hand) + the judge's card "2/10"
  const clip = new THREE.Group(); arms[0].hand.add(clip); clip.position.set(0.02, 0.02, 0.06); clip.rotation.x = -0.5;
  mk(new THREE.BoxGeometry(0.2, 0.26, 0.015), mat(0xa77b4f, 0.7), clip); mk(new THREE.BoxGeometry(0.17, 0.2, 0.008), mat(0xffffff, 0.8), clip, 0, -0.01, 0.01);
  for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.12 - (i % 2) * 0.04, 0.008, 0.004), mat(0x555555), clip, -0.01, 0.05 - i * 0.035, 0.016);
  const pencil = new THREE.Group(); arms[1].hand.add(pencil); pencil.position.set(-0.02, 0.03, 0.05); pencil.rotation.set(0.6, 0, 0.5);
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), mat(0xffc21a, 0.5), pencil); mk(new THREE.ConeGeometry(0.012, 0.03, 6), mat(0xe8c99a, 0.6), pencil, 0, -0.095, 0).rotation.x = Math.PI;
  const card = new THREE.Group(); arms[1].hand.add(card); card.position.set(0, 0.2, 0.03);
  mk(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), mat(0x8a5a3a), card, 0, -0.1, 0);
  const cardFace = mk(new THREE.PlaneGeometry(0.36, 0.26), new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide }), card, 0, 0.12, 0.01);
  const cardTex = {}; const cardMap = (k) => (cardTex[k] ??= signTex(256, 186, k, { fg: '#d8231c', border: '#d8231c' }));
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  function set(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1);
    const st = p.stand ?? 0, t = p.t ?? 0, wr = p.write ?? 0, cd = p.card ?? 0, pt = p.point ?? 0, sw = p.swim ?? 0;
    body.rotation.x = -st * 1.2 + sw * 0.2; body.position.set(0, st * 0.14 - sw * 0.22, -st * 0.1);
    head.rotation.set(st * 1.05 + (p.nod ?? 0) - sw * 0.2, p.headY ?? 0, Math.sin(t * 1.7) * 0.04);
    glasses.visible = p.glasses ?? true;
    arms[0].a.rotation.set(-0.9 * st - 0.3 * wr, 0, 0.2); arms[1].a.rotation.set(-1.0 * st - 0.6 * wr - 1.8 * Math.min(1, cd) - 1.4 * pt, 0, -0.25 - 0.4 * pt);
    if (wr > 0) { arms[1].hand.position.set(0.02 * Math.sin(t * 26) * wr, -0.15, 0.015 * Math.cos(t * 19) * wr); } else arms[1].hand.position.set(0, -0.15, 0);
    card.position.set(0, 0.2 + (p.cardLift ?? 0), 0.03 + (p.cardFwd ?? 0));
    clip.visible = (p.clip ?? 1) > 0.5; pencil.visible = clip.visible && cd < 0.5; card.visible = cd > 0.01; card.scale.setScalar(Math.max(0.01, cd));
    if (card.visible) { const m = cardMap(p.cardText || '2/10'); if (cardFace.material.map !== m) { cardFace.material.map = m; cardFace.material.needsUpdate = true; } }
    tail.rotation.x = (p.slap ?? 0) * -0.9 * Math.abs(Math.sin(t * 14)) + Math.sin(t * 2.1) * 0.06 + st * 0.9; tail.rotation.y = Math.sin(t * 1.3) * 0.15;
    const [lx, ly] = p.look || [0, 0]; eyes.forEach((e, i) => { if (i % 2) return; const s = i ? 1 : -1; e.position.set(s * 0.065 + lx * 0.014, 0.045 + ly * 0.014, 0.148); });
    void paddle;
  }
  set({});
  return { root, set, head, card, hand: (s) => arms[s < 0 ? 0 : 1].hand };
}

/** A salmon (~0.45 m) with angry brows. set({x,y,z,rotY, pitch, t, flap}) */
export function makeSalmon(seed = 1) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = new THREE.MeshStandardMaterial({ color: [0xf07a6a, 0xe8695e, 0xf38c74][seed % 3], roughness: 0.45 }), belly = new THREE.MeshStandardMaterial({ color: 0xe8edf2, roughness: 0.35, metalness: 0.2 });
  mk(new THREE.SphereGeometry(0.11, 16, 12), skin, body, 0, 0, 0).scale.set(0.75, 0.85, 2.0);
  mk(new THREE.SphereGeometry(0.09, 14, 10), belly, body, 0, -0.035, 0.02).scale.set(0.7, 0.6, 1.9);
  const tail = new THREE.Group(); body.add(tail); tail.position.z = -0.21;
  const tf = new THREE.Shape(); tf.moveTo(0, 0); tf.lineTo(0.09, -0.12); tf.lineTo(0, -0.07); tf.lineTo(-0.09, -0.12); tf.closePath();
  mk(new THREE.ShapeGeometry(tf), new THREE.MeshStandardMaterial({ color: 0xc8504a, roughness: 0.5, side: THREE.DoubleSide }), tail).rotation.set(Math.PI / 2, 0, 0);
  for (const s of [-1, 1]) {
    mk(new THREE.SphereGeometry(0.026, 10, 8), mat(0xffffff, 0.2), body, s * 0.065, 0.03, 0.13);
    mk(new THREE.SphereGeometry(0.014, 8, 6), mat(0x111111, 0.3), body, s * 0.08, 0.03, 0.14);
    const b = mk(new THREE.BoxGeometry(0.008, 0.01, 0.05), mat(0x222222), body, s * 0.07, 0.065, 0.13); b.rotation.x = s * 0; b.rotation.z = s * -0.5;
  }
  mk(new THREE.ConeGeometry(0.03, 0.07, 6), skin, body, 0, 0.09, 0).rotation.x = -0.4;
  function set(p = {}) { g.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); g.rotation.set(p.pitch ?? 0, p.rotY ?? 0, p.roll ?? 0); g.scale.setScalar(p.scale ?? 1); tail.rotation.y = Math.sin((p.t ?? 0) * (p.flap ?? 18)) * 0.5; }
  return { g, set };
}

/** A small adobe house (front faces +z). */
export function makeHouse(seed = 1, { w = 2.0, h = 1.7, d = 1.8, color } = {}) {
  const R = rng(seed), g = new THREE.Group();
  const cols = ['#e9c59a', '#f2dcb8', '#e3a983', '#f0d2a0', '#d9b38c', '#f4e3c8'];
  const c = color || cols[seed % cols.length];
  const ft = tex(256, Math.round(256 * h / w), (x, W, H) => { x.fillStyle = c; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(${R() > 0.5 ? '255,255,255' : '120,70,40'},.06)`; x.fillRect(R() * W, R() * H, 6, 3); }
    x.fillStyle = '#5a3a28'; x.fillRect(W * 0.12, H * 0.42, W * 0.22, H * 0.58);
    x.fillStyle = '#7fb6d8'; x.fillRect(W * 0.52, H * 0.32, W * 0.3, H * 0.28); x.strokeStyle = '#fff'; x.lineWidth = 5; x.strokeRect(W * 0.52, H * 0.32, W * 0.3, H * 0.28);
    x.beginPath(); x.moveTo(W * 0.67, H * 0.32); x.lineTo(W * 0.67, H * 0.6); x.stroke(); });
  const side = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }), front = new THREE.MeshStandardMaterial({ map: ft, roughness: 0.85 });
  mk(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side], g, 0, h / 2, 0);
  const roofC = [0xb5513a, 0x8a5a3a, 0xc8683f][seed % 3];
  if (seed % 2) { const r = mk(new THREE.ConeGeometry(Math.hypot(w, d) * 0.62, 0.8, 4), mat(roofC, 0.7), g, 0, h + 0.4, 0); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.hypot(w, d) * 1.45, 1, d / Math.hypot(w, d) * 1.45); }
  else { mk(new THREE.BoxGeometry(w + 0.12, 0.14, d + 0.12), mat(0xf6ead6, 0.8), g, 0, h + 0.07, 0); for (let i = 0; i < 4; i++) mk(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 6), mat(0x6b4a30), g, -w / 2 + 0.25 + i * (w - 0.5) / 3, h - 0.25, d / 2 + 0.1).rotation.x = Math.PI / 2; }
  return g;
}
export function makeChurch() {
  const g = new THREE.Group(), white = mat(0xf4efe4, 0.85);
  mk(new THREE.BoxGeometry(2.0, 2.2, 3.0), white, g, 0, 1.1, 0);
  const r = mk(new THREE.ConeGeometry(1.9, 1.0, 4), mat(0x8a5a3a, 0.7), g, 0, 2.7, 0); r.rotation.y = Math.PI / 4; r.scale.set(0.75, 1, 1.12);
  mk(new THREE.BoxGeometry(0.8, 1.6, 0.8), white, g, 0, 2.9, 1.0); mk(new THREE.ConeGeometry(0.6, 1.4, 4), mat(0x8a5a3a, 0.7), g, 0, 4.4, 1.0).rotation.y = Math.PI / 4;
  mk(new THREE.BoxGeometry(0.06, 0.4, 0.06), mat(0xf2c418, 0.4), g, 0, 5.25, 1.0); mk(new THREE.BoxGeometry(0.25, 0.06, 0.06), mat(0xf2c418, 0.4), g, 0, 5.3, 1.0);
  mk(new THREE.PlaneGeometry(0.7, 1.1), mat(0x5a3a28), g, 0, 0.55, 1.51);
  mk(new THREE.CircleGeometry(0.22, 18), mat(0x7fb6d8, 0.2), g, 0, 3.05, 1.41);
  return g;
}

// ---------------------------------------------------------------- water bodies (translucent boxes seen in section)
let waterT = null;
function waterMat(opacity = 0.6) {
  if (!waterT) waterT = tex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ee6ff'); gr.addColorStop(0.04, '#3fb2ea'); gr.addColorStop(0.35, '#1f86cc'); gr.addColorStop(1, '#0f4f88'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const r = rng(9); for (let i = 0; i < 26; i++) { const y = 18 + r() * (h - 30); c.strokeStyle = `rgba(200,240,255,${0.1 + r() * 0.12})`; c.lineWidth = 1.5 + r() * 2; c.beginPath(); for (let x = 0; x <= w; x += 8) { const yy = y + Math.sin(x * 0.09 + i) * 3; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); } });
  return new THREE.MeshStandardMaterial({ map: waterT, roughness: 0.05, transparent: true, opacity, depthWrite: false, emissive: 0x0f5a9a, emissiveIntensity: 0.22 });
}
let foamT = null;
/** A body of water between x0 and x1 from the bed up to `level`, z 0..−CW (behind the bank it hides inside the ground). */
export function makeWaterBody(parent, { opacity = 0.74, bottom = D.bed - 0.02, flow = 0, depth = D.CW } = {}) {
  if (!foamT) { foamT = tex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.4})`; c.beginPath(); c.ellipse(r() * w, r() * h, 6 + r() * 16, 1.5 + r() * 2, 0, 0, 7); c.fill(); } }); foamT.wrapS = foamT.wrapT = THREE.RepeatWrapping; }
  const hid = new THREE.MeshBasicMaterial({ visible: false }), front = waterMat(opacity);
  const backM = new THREE.MeshStandardMaterial({ color: 0x1b5f96, roughness: 0.2, emissive: 0x0d3f6e, emissiveIntensity: 0.35, side: THREE.BackSide });   // the −z face points away from the lens: draw its inside
  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [hid, hid, hid, hid, front, backM]); box.renderOrder = 3; parent.add(box);
  const sg = new THREE.PlaneGeometry(1, 1, 30, 8); sg.rotateX(-Math.PI / 2);
  const ft = foamT.clone(); ft.needsUpdate = true;
  const surf = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x8fd3f5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55, depthWrite: false, map: ft })); surf.renderOrder = 4; parent.add(surf);
  const base = sg.attributes.position.array.slice();
  const lip = new THREE.Mesh(new THREE.BoxGeometry(1, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0xc8f0ff, roughness: 0.3, transparent: true, opacity: 0.7 })); parent.add(lip);
  // the section is a polygon (water = its level ∩ its container): the cut-face side at z = 0, the far side at z = −depth;
  // a box can't meet a sloped dam face — it leaves a triangle of air or pokes through the slope (user, 025)
  box.visible = false;
  const backF = backM.clone(); backF.side = THREE.FrontSide;
  const secF = new THREE.Mesh(new THREE.BufferGeometry(), front), secB = new THREE.Mesh(new THREE.BufferGeometry(), backF);
  secF.renderOrder = 3; secB.position.z = -depth; parent.add(secF, secB);
  let last = '';
  const api = {
    box, surf, front,
    /** a rectangle from x0 to x1 (open water between two vertical walls) */
    set(x0, x1, level, t = 0, f = flow) { api.setPoly([[x0, bottom], [x1, bottom], [x1, level], [x0, level]], x0, x1, level, t, f); },
    /** pts: the water's section [[x, y], …] (its top edge at y = level from xl to xr) */
    setPoly(pts, xl, xr, level, t = 0, f = flow) {
      const on = pts.length >= 3 && level > bottom + 0.01 && xr > xl + 0.02; secF.visible = secB.visible = surf.visible = lip.visible = on; if (!on) return;
      const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))), P = g.attributes.position, UV = g.attributes.uv, Hh = level - bottom;
      for (let i = 0; i < P.count; i++) UV.setXY(i, (P.getX(i) - xl) / (xr - xl), (P.getY(i) - bottom) / Hh);   // the gradient runs surface → bed
      secF.geometry.dispose(); secF.geometry = g; secB.geometry.dispose(); secB.geometry = g.clone();
      const x0 = xl, x1 = xr, W = x1 - x0;
      surf.scale.set(W, 1, D.CW); surf.position.set((x0 + x1) / 2, level, -D.CW / 2);
      lip.scale.set(W, 1, 1); lip.position.set((x0 + x1) / 2, level - 0.005, 0.0);
      ft.repeat.set(W / 4, D.CW / 3); ft.offset.x = -t * 0.12 * f;
      const k = `${W.toFixed(2)}`; const a = sg.attributes.position;
      for (let i = 0; i < a.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; a.setY(i, (0.035 * Math.sin(x * W * 1.7 + t * 3) * Math.cos(z * 9 + t * 2.3)) / 1); }
      a.needsUpdate = true; if (k !== last) last = k; sg.computeVertexNormals();
    },
  };
  return api;
}

// ---------------------------------------------------------------- the set
export async function buildDam(studio) {
  const { scene, renderer, camera } = studio;
  renderer.localClippingEnabled = true;
  camera.far = 900; camera.near = 0.05; camera.updateProjectionMatrix();
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xf3dcc0);
  scene.fog = new THREE.Fog(0xf0dcc4, 90, 420);

  // sky: deep desert blue → pale peach horizon, a few soft clouds
  { const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#3f8fdc'); gr.addColorStop(0.38, '#7fbdee'); gr.addColorStop(0.5, '#f3dcc0'); gr.addColorStop(1, '#f3dcc0');
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 14; i++) { const cx = h2(i, 5) * c.width, cy = 140 + h2(i, 6) * 260, s = 30 + h2(i, 7) * 50;
      for (let k = 0; k < 8; k++) { const x = cx + (h2(i, k) - 0.5) * s * 4, y = cy + (h2(k, i) - 0.5) * s * 0.7, rr = s * (0.6 + h2(i + k, 9) * 0.7); const cg = g.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); cg.addColorStop(0, 'rgba(255,255,255,.9)'); cg.addColorStop(0.7, 'rgba(255,255,255,.6)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    root.add(new THREE.Mesh(new THREE.SphereGeometry(440, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }))); }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  const hemi = new THREE.HemisphereLight(0xe8f2ff, 0xb08860, 1.05); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.2); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun); root.add(sun.target);
  function aimSun(cx, cy, half = 8) {
    sun.position.set(cx - 8, cy + 15, 12); sun.target.position.set(cx, cy, -2);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 70 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun(0, 2);

  // ---- the cut face (below the creek bed) + its back wall (seen through the tunnel)
  const F = D.face;
  const cut = makeCutFace({ x0: F.x0, x1: F.x1, y0: F.y0, y1: D.bed, ppm: 80, mppm: 40, depth: 1.9, backShade: 0.42, paint: (g, P) => paintStrata(g, P, F.x0, F.x1) });
  root.add(cut.group);

  // ---- creek bed (z 0..−SW), the bank step, the canyon floor, the back canyon wall, the plateau on top
  const sandT = tex(256, 256, (c, w, h) => { c.fillStyle = '#e2bf8e'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(150,100,60,.22)' : 'rgba(255,240,210,.3)'; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); c.fill(); } for (let i = 0; i < 40; i++) { c.fillStyle = ['#a59a8c', '#8c7a68', '#c4b39a'][i % 3]; c.beginPath(); c.ellipse(r() * w, r() * h, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, 7); c.fill(); } });
  sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(240 / 3, (D.CW - D.SW) / 3);
  const gravT = tex(256, 256, (c, w, h) => { c.fillStyle = '#9a8c78'; c.fillRect(0, 0, w, h); const r = rng(12); for (let i = 0; i < 320; i++) { c.fillStyle = ['#b9ad98', '#7d7468', '#a49a8c', '#6d655c'][i % 4]; c.beginPath(); c.ellipse(r() * w, r() * h, 4 + r() * 9, 3 + r() * 6, r() * 3, 0, 7); c.fill(); } });
  gravT.wrapS = gravT.wrapT = THREE.RepeatWrapping; gravT.repeat.set(240 / 2, D.SW / 2);
  const bedM = new THREE.MeshStandardMaterial({ map: gravT, roughness: 0.95 });
  const bed = mk(new THREE.PlaneGeometry(240, D.SW), bedM, root, 0, D.bed, -D.SW / 2); bed.rotation.x = -Math.PI / 2;
  const bankM = new THREE.MeshStandardMaterial({ color: 0x9a6a44, roughness: 1, map: (() => { const t = grainTexture(5); t.repeat.set(120, 1); return t; })() });
  mk(new THREE.PlaneGeometry(240, -D.bed), bankM, root, 0, D.bed / 2, -D.SW);
  const floorM = new THREE.MeshStandardMaterial({ map: sandT, roughness: 1 });
  // the floor is a solid slab (y bed..0) so water hidden "inside the bank" never shows from above
  mk(new THREE.BoxGeometry(240, -D.bed, D.CW - D.SW), [bankM, bankM, floorM, bankM, bankM, bankM], root, 0, D.bed / 2, -(D.SW + D.CW) / 2);
  // canyon wall
  const wallT = canyonTex(4096, 1024); wallT.wrapS = THREE.RepeatWrapping; wallT.repeat.set(3, 1);
  const wg = new THREE.PlaneGeometry(240, D.wallH + 2, 240, 24), wp = wg.attributes.position;
  for (let i = 0; i < wp.count; i++) { const x = wp.getX(i), y = wp.getY(i); wp.setZ(i, wallDisp(x, y + D.wallH / 2 - 1)); }
  wg.computeVertexNormals();
  const canyon = mk(wg, new THREE.MeshStandardMaterial({ map: wallT, color: 0xe6e2e6, emissive: 0xf0dcc4, emissiveIntensity: 0.14, roughness: 1, bumpMap: (() => { const t = grainTexture(9); t.repeat.set(120, 9); return t; })(), bumpScale: 2 }), root, 0, D.wallH / 2 - 1, -D.CW - 0.45);
  void canyon;
  const plateau = mk(new THREE.PlaneGeometry(900, 500), new THREE.MeshStandardMaterial({ color: 0xd9a46f, roughness: 1 }), root, 0, D.wallH, -D.CW - 250); plateau.rotation.x = -Math.PI / 2;
  // rim boulders + desert shrubs along the canyon top; far mesas
  const R = rng(31);
  const shrubM = [mat(0x7a8f4a, 0.95), mat(0x93a35a, 0.95), mat(0x5f7a3c, 0.95)];
  for (let i = 0; i < 60; i++) { const x = -110 + R() * 220; mk(new THREE.IcosahedronGeometry(0.4 + R() * 0.6, 0), shrubM[i % 3], root, x, D.wallH + 0.2, -D.CW - 1.2 - R() * 6).scale.set(1, 0.6, 1); }
  for (let i = 0; i < 16; i++) { const h = 20 + R() * 40, w = 30 + R() * 50; const m = mk(new THREE.BoxGeometry(w, h, 30), mat([0xd08a5a, 0xc47a4c, 0xe0a070][i % 3], 1), root, -260 + i * 36 + R() * 10, D.wallH + h / 2 - 2, -150 - R() * 120); m.castShadow = false; }
  for (let i = 0; i < 44; i++) { const x = -110 + R() * 220, z = -D.SW - 0.4 - R() * (D.CW - D.SW - 1); if (Math.abs(x - 7) < 10 || (x > -9 && x < 1)) continue; mk(new THREE.IcosahedronGeometry(0.15 + R() * 0.35, 0), mat([0x8a6a4c, 0xa47c56, 0x6d5440][i % 3], 1), root, x, 0.05, z).scale.set(1, 0.6, 1); }
  // green along the water: willows / cottonwoods on the canyon floor (kept out of the dam site)
  const trees = [];
  for (const [x, z, s] of [[-30, -7.4, 0.9], [-24.6, -7.6, 0.8], [-18.8, -7.4, 0.85], [-12.6, -7.7, 0.75], [-27.6, -6.9, 0.7], [9.6, -7.8, 0.75], [15.6, -7.5, 0.8], [19.8, -7.6, 0.9], [27.2, -7.4, 1.0], [33, -7.2, 0.85]]) { const tr = makeTree(Math.round(x * 7 + 90), s); tr.position.set(x, 0, z); root.add(tr); trees.push(tr); }
  const cactusM = mat(0x5f8f3f, 0.8), joshM = mat(0x6e5236, 0.9), joshLeaf = mat(0x7aa24a, 0.9);
  const CR = rng(57);
  for (let i = 0; i < 70; i++) { const x = -60 + CR() * 120, z = -3.2 - CR() * 4.6; if (x > -9.4 && x < 14.6) continue; if (x > -28 && x < -9.4 && z > -6.4) continue; if (x > 14.6 && x < 31 && z > -6.6) continue;
    const c = new THREE.Group(); root.add(c); c.position.set(x, 0, z); const k = i % 3;
    if (k === 0) { const s2 = 0.7 + CR() * 0.6; mk(new THREE.CapsuleGeometry(0.14 * s2, 0.9 * s2, 4, 10), cactusM, c, 0, 0.6 * s2, 0); for (const sd of [-1, 1]) if (CR() > 0.3) { const a = new THREE.Group(); c.add(a); a.position.set(sd * 0.14 * s2, (0.45 + CR() * 0.3) * s2, 0); mk(new THREE.CapsuleGeometry(0.08 * s2, 0.18 * s2, 4, 8), cactusM, a, sd * 0.12 * s2, 0, 0).rotation.z = Math.PI / 2; mk(new THREE.CapsuleGeometry(0.08 * s2, 0.3 * s2, 4, 8), cactusM, a, sd * 0.24 * s2, 0.18 * s2, 0); } }
    else if (k === 1) { const s2 = 0.8 + CR() * 0.7; mk(new THREE.CylinderGeometry(0.07 * s2, 0.1 * s2, 1.3 * s2, 6), joshM, c, 0, 0.65 * s2, 0); for (let b = 0; b < 3; b++) { const br = new THREE.Group(); c.add(br); br.position.set(0, 1.2 * s2, 0); br.rotation.set((CR() - 0.5) * 1.2, CR() * 6, (CR() - 0.5) * 1.2); mk(new THREE.CylinderGeometry(0.05 * s2, 0.06 * s2, 0.6 * s2, 5), joshM, br, 0, 0.3 * s2, 0); mk(new THREE.IcosahedronGeometry(0.2 * s2, 0), joshLeaf, br, 0, 0.65 * s2, 0); } }
    else { mk(new THREE.IcosahedronGeometry(0.25 + CR() * 0.5, 0), mat([0xa47c5a, 0x8c6a4e, 0xb98f68][i % 3], 0.95), c, 0, 0.12, 0).scale.set(1.3, 0.7, 1); } }
  // a strip of green at the foot of the wall (willows, reeds, boulders) breaks the wall's base and gives the floor depth
  const greens = [mat(0x6f9a45, 0.95), mat(0x86ad52, 0.95), mat(0x5a8238, 0.95), mat(0x9bb865, 0.95)], boulderM = [mat(0xa47c5a, 0.95), mat(0x8c6a4e, 0.95), mat(0xb98f68, 0.95)];
  for (let i = 0; i < 150; i++) { const x = -60 + R() * 120, z = -D.CW + 0.35 + R() * 1.6; if (x > -9.2 && x < 1.6) continue;
    if (R() < 0.6) { const b = mk(new THREE.IcosahedronGeometry(0.28 + R() * 0.45, 1), greens[i % 4], root, x, 0.15, z); b.scale.set(1.2, 0.75 + R() * 0.5, 1); b.castShadow = true; }
    else { const b = mk(new THREE.IcosahedronGeometry(0.3 + R() * 0.6, 0), boulderM[i % 3], root, x, 0.1, z); b.scale.set(1.2, 0.7, 1); } }
  for (let i = 0; i < 70; i++) { const x = -60 + R() * 120; if (x > -9.2 && x < 7.2) continue; const r2 = mk(new THREE.ConeGeometry(0.05, 0.6 + R() * 0.5, 4), greens[(i + 1) % 4], root, x, 0.3, -D.SW - 0.15 - R() * 0.3); r2.rotation.z = (R() - 0.5) * 0.4; }

  // ---- the upstream town (drowned later): houses, a church, a store, a welcome sign, a parked truck
  const upTown = new THREE.Group(); root.add(upTown);
  const upHouses = [];
  [[-22.6, -4.4, 1], [-20.0, -4.9, 2], [-17.6, -4.3, 3], [-13.0, -4.6, 5], [-10.6, -4.5, 6]].forEach(([x, z, s]) => { const h = makeHouse(s); h.position.set(x, 0, z); upTown.add(h); upHouses.push(h); });
  const church = makeChurch(); church.position.set(-15.3, 0, -4.8); church.scale.setScalar(0.95); upTown.add(church);
  const store = makeHouse(4, { w: 2.6, h: 2.0, d: 2.0, color: '#f0d2a0' }); store.position.set(-25.4, 0, -4.4); upTown.add(store);
  const storeSign = board(1.8, 0.4, 'GENERAL STORE', { bg: '#7a2e22', fg: '#ffe3a3', border: null }); storeSign.position.set(-25.4, 1.75, -3.35); upTown.add(storeSign);
  const welcome = new THREE.Group(); upTown.add(welcome); welcome.position.set(-27.6, 0, -2.75);
  mk(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat(0x6b4a30), welcome, -0.55, 0.6, 0); mk(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat(0x6b4a30), welcome, 0.55, 0.6, 0);
  const wsign = board(1.5, 0.6, 'WELCOME\nPOP. 274', { bg: '#fff4dc', fg: '#3a2412', border: '#3a2412' }); wsign.position.set(0, 1.05, 0.03); welcome.add(wsign);
  const truck = makeCar(0x58b368, 7); truck.g.scale.setScalar(0.42); truck.g.position.set(-11.9, 0, -3.15); truck.g.rotation.y = Math.PI / 2; upTown.add(truck.g);
  truck.g.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.blending === THREE.AdditiveBlending) o.visible = false; });

  // ---- the downstream town: the PUBLIC POOL (closed), houses, a water tower
  const downTown = new THREE.Group(); root.add(downTown);
  const P = D.pool;
  const pool = new THREE.Group(); downTown.add(pool);
  const tileT = tex(128, 128, (c, w, h) => { c.fillStyle = '#e9f2f5'; c.fillRect(0, 0, w, h); c.strokeStyle = '#bfd3db'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } });
  tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set((P.x1 - P.x0) * 1.5, (P.z0 - P.z1) * 1.5);
  const deck = mk(new THREE.PlaneGeometry(P.x1 - P.x0 + 1.2, P.z0 - P.z1 + 1.0), new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.6 }), pool, (P.x0 + P.x1) / 2, 0.012, (P.z0 + P.z1) / 2); deck.rotation.x = -Math.PI / 2;
  const pw = mk(new THREE.PlaneGeometry(P.x1 - P.x0 - 0.6, P.z0 - P.z1 - 0.6), new THREE.MeshStandardMaterial({ color: 0x3ec0f0, roughness: 0.05, emissive: 0x1a6a9a, emissiveIntensity: 0.25 }), pool, (P.x0 + P.x1) / 2, 0.03, (P.z0 + P.z1) / 2); pw.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 3; i++) { const l = mk(new THREE.BoxGeometry(P.x1 - P.x0 - 0.7, 0.04, 0.04), mat([0xff4d5e, 0xffffff, 0xff4d5e][i], 0.4), pool, (P.x0 + P.x1) / 2, 0.06, P.z1 + 0.9 + i * 0.75); void l; }
  const dive = new THREE.Group(); pool.add(dive); dive.position.set(P.x1 - 0.4, 0, (P.z0 + P.z1) / 2);
  mk(new THREE.BoxGeometry(0.3, 0.6, 0.3), mat(0xdddddd, 0.6), dive, 0.2, 0.3, 0); mk(new THREE.BoxGeometry(1.4, 0.06, 0.35), mat(0x3e8fe0, 0.4), dive, -0.5, 0.62, 0);
  const chair = new THREE.Group(); pool.add(chair); chair.position.set(P.x0 + 0.3, 0, P.z1 + 0.5);
  for (const [dx, dz] of [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]]) mk(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), mat(0xffffff, 0.5), chair, dx, 0.8, dz);
  mk(new THREE.BoxGeometry(0.6, 0.06, 0.5), mat(0xff4d5e, 0.5), chair, 0, 1.6, 0); mk(new THREE.BoxGeometry(0.6, 0.5, 0.05), mat(0xff4d5e, 0.5), chair, 0, 1.85, -0.22);
  const umb = new THREE.Group(); pool.add(umb); umb.position.set(P.x0 + 1.6, 0, P.z1 + 0.6);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6), mat(0xeeeeee), umb, 0, 1.0, 0); mk(new THREE.ConeGeometry(0.9, 0.35, 10), mat(0xffd23f, 0.6), umb, 0, 2.05, 0);
  // the chain-link fence along the front with the CLOSED sign + a padlock
  const fenceM = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const fz = P.z0 + 0.3;
  const fx0 = D.gate + 0.25, fx1 = P.x1 + 0.6;   // the fence starts right of the gate: nothing behind Gary + the held pool
  mk(new THREE.PlaneGeometry(fx1 - fx0, 1.3), fenceM, pool, (fx0 + fx1) / 2, 0.65, fz).castShadow = false;
  for (let i = 0; i <= 5; i++) mk(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 6), mat(0x8d969f, 0.4, { metalness: 0.6 }), pool, fx0 + (i * (fx1 - fx0)) / 5, 0.7, fz);
  const closed = board(1.5, 0.85, 'POOL\nCLOSED', { bg: '#d8231c', fg: '#ffffff', border: '#ffffff' }); closed.position.set(D.gate + 1.7, 1.62, fz + 0.06); pool.add(closed);
  for (const s2 of [-0.7, 0.7]) mk(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), mat(0x6b4a30), pool, D.gate + 1.7 + s2 * 0.9, 1.0, fz + 0.03);
  const lock = mk(new THREE.BoxGeometry(0.16, 0.14, 0.06), mat(0xd4a017, 0.3, { metalness: 0.7 }), pool, D.gate + 0.35, 0.62, fz + 0.06);
  const downHouses = [];
  [[15.6, -4.6, 7], [18.4, -4.9, 8], [21.0, -4.5, 9], [25.8, -4.7, 10], [28.6, -4.4, 11]].forEach(([x, z, s]) => { const h = makeHouse(s); h.position.set(x, 0, z); downTown.add(h); downHouses.push(h); });
  const winMats = []; downHouses.forEach((h) => h.traverse((o) => { if (o.isMesh && Array.isArray(o.material)) { o.material = o.material.map((m) => (m.map ? m.clone() : m)); o.material.forEach((m) => { if (m.map) { m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffd27a); m.emissiveIntensity = 0; winMats.push(m); } }); } }));
  const tower = new THREE.Group(); downTown.add(tower); tower.position.set(23.4, 0, -6.0);
  for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) mk(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), mat(0x8d969f, 0.5), tower, dx, 2.1, dz);
  mk(new THREE.CylinderGeometry(1.1, 1.1, 1.5, 18), mat(0xdfe5ea, 0.5), tower, 0, 4.9, 0); mk(new THREE.ConeGeometry(1.2, 0.6, 18), mat(0xc0c8d0, 0.5), tower, 0, 5.95, 0);
  const tw = board(1.4, 0.45, 'DAMSVILLE', { bg: '#dfe5ea', fg: '#2f6fd6', border: null }); tw.position.set(0, 4.9, 1.12); tower.add(tw);

  // ---- the beaver's dam (between the dam site and the town): sticks + mud, holds every time; a twig cutoff wall under it
  const beaverDam = new THREE.Group(); root.add(beaverDam); beaverDam.position.set(D.beaver.x, D.bed, 0);
  const stickM = [mat(0x7a5233, 0.9), mat(0x5e3f26, 0.9), mat(0x8f6a45, 0.9)], mudM = mat(0x5a3d26, 1);
  mk(new THREE.SphereGeometry(0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mudM, beaverDam, 0, 0, -D.SW / 2).scale.set(1, 0.8, D.SW / 1.5);
  const BR = rng(41);
  for (let i = 0; i < 46; i++) { const s = mk(new THREE.CylinderGeometry(0.035, 0.04, 0.9 + BR() * 0.8, 6), stickM[i % 3], beaverDam, (BR() - 0.5) * 1.1, 0.15 + BR() * 0.5, -0.1 - BR() * (D.SW - 0.2)); s.rotation.set(BR() * 3, BR() * 3, 1.2 + (BR() - 0.5) * 0.9); }
  // its cutoff wall: a row of stakes driven into the gravel (painted on a decal in the cut face so it reads in section)
  const twig = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.25), new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.9, map: tex(128, 180, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 7; i++) { const x = 10 + i * 17; c.fillStyle = ['#7a5233', '#5e3f26', '#8f6a45'][i % 3]; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 11, 0); c.lineTo(x + 8, h - 18); c.lineTo(x + 5, h); c.lineTo(x + 2, h - 18); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,230,190,.25)'; c.fillRect(x + 2, 0, 2, h - 20); } }) }));
  twig.position.set(D.beaver.x, D.bed - 0.62, 0.006); root.add(twig);

  // ---- diversion tunnel: masked hole in the face + a half bore (back half, clipped at z = 0) + water + portals
  const tCurve = new THREE.CatmullRomCurve3(T.path.map(([x, y]) => new THREE.Vector3(x, y, T.z)), false, 'catmullrom', 0.2);
  const keepBack = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const digClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), T.path[0][0]);
  const rockT = tex(256, 256, (c, w, h) => { c.fillStyle = '#7d4a33'; c.fillRect(0, 0, w, h); const r = rng(19); for (let i = 0; i < 500; i++) { c.strokeStyle = r() < 0.6 ? `rgba(40,18,10,${0.1 + r() * 0.2})` : `rgba(220,160,120,${0.06 + r() * 0.1})`; c.lineWidth = 1 + r() * 3; c.beginPath(); const x = r() * w, y = r() * h; c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 10); c.stroke(); } });
  rockT.wrapS = rockT.wrapT = THREE.RepeatWrapping; rockT.repeat.set(16, 2);
  const bore = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 220, T.R, 28, false), new THREE.MeshStandardMaterial({ map: rockT, roughness: 1, side: THREE.BackSide, clippingPlanes: [keepBack, digClip], clipShadows: true }));
  bore.receiveShadow = true; root.add(bore);
  const tWaterM = waterMat(0.55); tWaterM.clippingPlanes = [keepBack]; tWaterM.side = THREE.DoubleSide;
  const tWater = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 220, T.R * 0.97, 20, false), tWaterM); tWater.renderOrder = 3; root.add(tWater);
  const tWaterIdx = tWater.geometry.index.count;
  // a concrete plug for the inlet (closing the diversion lets the lake fill)
  // the tunnel's two mouths in the creek bed (dark holes in the gravel, shown once it is dug)
  const mouths = [T.path[0][0] + 0.35, T.path[T.path.length - 1][0] - 0.35].map((x) => { const m = mk(new THREE.CircleGeometry(0.62, 28), new THREE.MeshBasicMaterial({ color: 0x1b120c }), root, x, D.bed + 0.006, -0.95); m.rotation.x = -Math.PI / 2; m.scale.set(1, 1.35, 1); m.castShadow = false; m.visible = false; return m; });
  const plug = mk(new THREE.CylinderGeometry(T.R + 0.05, T.R + 0.05, 0.9, 24), new THREE.MeshStandardMaterial({ color: 0x9d9a93, roughness: 0.9, clippingPlanes: [keepBack] }), root, -12.0, -3.85, T.z); plug.rotation.z = Math.PI / 2;
  // "Hoover Dam had four": four portals in the canyon wall above the inlet
  const portals = [0, 1, 2, 3].map((i) => { const p = new THREE.Group(); root.add(p); const px = -14.6 + i * 1.35, py = 3.3 + (i % 2) * 0.5; p.position.set(px, py, Math.max(wallZ(px - 0.6, py), wallZ(px + 0.6, py), wallZ(px, py + 0.6), wallZ(px, py - 0.6)) + 0.08);
    mk(new THREE.CircleGeometry(0.62, 28), new THREE.MeshBasicMaterial({ color: 0x1a0f0a }), p, 0, 0, 0.02); mk(new THREE.TorusGeometry(0.62, 0.09, 8, 28), mat(0x9d9a93, 0.9), p, 0, 0, 0.04);
    const n = board(0.36, 0.36, String(i + 1), { bg: '#ffd43b', fg: '#2b1a05', border: '#2b1a05' }); n.position.set(0, 0.95, 0.06); p.add(n); return p; });
  const tunnelHoles = (u) => { const out = []; if (u <= 0) return out; const n = 90; for (let i = 0; i <= n * u; i++) { const p = tCurve.getPoint(i / n); out.push({ circle: [p.x, p.y, T.R] }); } return out; };

  // ---- the earth dam (a trapezoid of dirt, full canyon width) + the piping tube carved through its base
  const E = D.earth;
  const eShape = new THREE.Shape(); eShape.moveTo(E.x0, D.bed); eShape.lineTo(E.x1, D.bed); eShape.lineTo(E.t1, D.bed + E.h); eShape.lineTo(E.t0, D.bed + E.h); eShape.closePath();
  const eGeo = new THREE.ExtrudeGeometry(eShape, { depth: D.CW, bevelEnabled: false }); eGeo.translate(0, 0, -D.CW + 0.012);
  const dirtT = tex(256, 256, (c, w, h) => { c.fillStyle = '#9b6a3e'; c.fillRect(0, 0, w, h); const r = rng(14); for (let i = 0; i < 700; i++) { c.fillStyle = ['rgba(60,35,18,.3)', 'rgba(200,150,100,.25)', 'rgba(120,80,45,.3)'][i % 3]; c.beginPath(); c.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 4, r() * 3, 0, 7); c.fill(); } for (let i = 0; i < 40; i++) { c.fillStyle = ['#8c7a68', '#a59a8c'][i % 2]; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 5, 0, 7); c.fill(); } });
  dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping; dirtT.repeat.set(0.5, 0.5);
  const earth = new THREE.Group(); root.add(earth);
  const earthMesh = mk(eGeo, new THREE.MeshStandardMaterial({ map: dirtT, roughness: 1 }), earth);
  void earthMesh;
  const pipePts = [[E.x0 + 0.5, D.bed + 0.25], [E.x0 + 1.4, D.bed + 0.1], [-4.6, D.bed + 0.32], [-3.4, D.bed + 0.12], [-2.4, D.bed + 0.3], [E.x1 - 0.32, D.bed + 0.42]];
  const pipeCurve = new THREE.CatmullRomCurve3(pipePts.map(([x, y]) => new THREE.Vector3(x, y, 0.03)));
  const pipeDark = mk(new THREE.TubeGeometry(pipeCurve, 120, 0.13, 8, false), mat(0x3a2414, 1), root); pipeDark.castShadow = false;
  const pipeWater = mk(new THREE.TubeGeometry(pipeCurve, 120, 0.085, 8, false), new THREE.MeshStandardMaterial({ color: 0x4fb8ea, roughness: 0.1, emissive: 0x2a8ac8, emissiveIntensity: 0.4 }), root); pipeWater.position.z = 0.04; pipeWater.castShadow = false;
  const pipeIdx = pipeDark.geometry.index.count;

  // ---- the cutoff wall (in section: a concrete band from the dam base into the bedrock) — a decal in the face, revealed top-down
  const C = D.cutoff;
  const concT = tex(256, 256, (c, w, h) => { c.fillStyle = '#a7a39b'; c.fillRect(0, 0, w, h); const r = rng(77); for (let i = 0; i < 2600; i++) { const v = 150 + Math.floor(r() * 80); c.fillStyle = `rgba(${v},${v},${v - 6},.5)`; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); } for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(90,88,82,.3)'; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); c.fill(); } });
  concT.wrapS = concT.wrapT = THREE.RepeatWrapping;
  const cutT = concT.clone(); cutT.needsUpdate = true; cutT.repeat.set(0.6, 6);
  const cutoff = mk(new THREE.PlaneGeometry(C.x1 - C.x0, 1), new THREE.MeshStandardMaterial({ map: cutT, color: 0x9a968e, roughness: 0.9 }), root, (C.x0 + C.x1) / 2, D.bed, 0.022);
  cutoff.geometry.translate(0, -0.5, 0); cutoff.castShadow = false;
  cutoff.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(C.x1 - C.x0, 1).translate(0, -0.5, 0)), new THREE.LineBasicMaterial({ color: 0x55534d })));
  const cutoffTop = mk(new THREE.BoxGeometry(C.x1 - C.x0, 0.6, D.CW), new THREE.MeshStandardMaterial({ map: concT, roughness: 0.9 }), root, (C.x0 + C.x1) / 2, D.bed + E.h + 0.25, -D.CW / 2);

  // ---- the gravity dam: N concrete columns (extruded slices of the profile), a section texture with lift lines + block edges
  const G = D.dam;
  const prof = [[G.heel, D.bed - 0.3], [G.toe + 0.15, D.bed - 0.3], [G.toe, D.bed], [G.crestX, 8.55], [G.crestX, G.crest], [G.heel, G.crest]];
  const secT = tex(512, 512, (c, w, h) => { c.fillStyle = '#958f84'; c.fillRect(0, 0, w, h); const r = rng(55); for (let i = 0; i < 9000; i++) { const v = 112 + Math.floor(r() * 80); c.fillStyle = `rgba(${v},${v},${v - 4},.4)`; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(70,68,64,.25)'; c.beginPath(); c.arc(r() * w, r() * h, 1.5 + r() * 3, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(60,56,50,.4)'; c.lineWidth = 3; for (let y = 0; y < h; y += 384) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.strokeStyle = 'rgba(255,250,240,.18)'; c.lineWidth = 2; for (let y = 4; y < h; y += 384) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let i = 0; i < 16; i++) { const x = r() * w, y = r() * h; const gr = c.createLinearGradient(x, y, x, y + 120); gr.addColorStop(0, 'rgba(70,60,50,.18)'); gr.addColorStop(1, 'rgba(70,60,50,0)'); c.fillStyle = gr; c.fillRect(x, y, 4 + r() * 6, 120); } });
  secT.wrapS = secT.wrapT = THREE.RepeatWrapping; secT.repeat.set(0.5, 0.5);
    const glowT = tex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w * 0.42, h * 0.62, 4, w * 0.42, h * 0.62, w * 0.62); gr.addColorStop(0, '#fff3c0'); gr.addColorStop(0.25, '#ffb43a'); gr.addColorStop(0.6, '#ff5a10'); gr.addColorStop(1, '#a01806'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glowT.repeat.set(1 / (G.toe + 0.15 - G.heel), 1 / (G.crest - D.bed + 0.3)); glowT.offset.set(-G.heel / (G.toe + 0.15 - G.heel), -(D.bed - 0.3) / (G.crest - D.bed + 0.3));
  const secM = new THREE.MeshStandardMaterial({ map: secT, roughness: 0.9, emissive: 0xffffff, emissiveMap: glowT, emissiveIntensity: 0 });
  const sideT = concT.clone(); sideT.needsUpdate = true; sideT.repeat.set(0.4, 0.4);
  const sideM = new THREE.MeshStandardMaterial({ map: sideT, color: 0x9a968e, roughness: 0.9, emissive: 0xff4a10, emissiveIntensity: 0 });
  const clipX = (pts, a, b) => { // Sutherland–Hodgman against a ≤ x ≤ b
    const cl = (P, keep, X) => { const o = []; for (let i = 0; i < P.length; i++) { const A = P[i], B = P[(i + 1) % P.length], ia = keep(A[0]), ib = keep(B[0]); if (ia) o.push(A); if (ia !== ib) { const u = (X - A[0]) / (B[0] - A[0]); o.push([X, A[1] + u * (B[1] - A[1])]); } } return o; };
    return cl(cl(pts, (x) => x >= a, a), (x) => x <= b, b);
  };
  const damCols = [];
  for (let i = 0; i < G.cols; i++) {
    const a = G.heel + ((G.toe + 0.15 - G.heel) * i) / G.cols, b = G.heel + ((G.toe + 0.15 - G.heel) * (i + 1)) / G.cols;
    const poly = clipX(prof, a - 0.001, b + 0.001); if (poly.length < 3) continue;
    const sh = new THREE.Shape(); poly.forEach(([x, y], k) => (k ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: D.CW, bevelEnabled: false }); geo.translate(0, 0, -D.CW + 0.006);
    const col = new THREE.Group(); root.add(col); const m = mk(geo, [secM, sideM], col); m.castShadow = true;
    // block edge lines on the section (a thin dark outline on the cap)
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(sh)), new THREE.LineBasicMaterial({ color: 0x55534d }));
    edge.position.z = 0.009; col.add(edge);
    const top = Math.max(...poly.map((p) => p[1]));
    damCols.push({ g: col, x0: a, x1: b, top });
  }
  // cooling pipes in section: dark rings with a cold-blue core, a grid inside the profile; pop in row by row
  const inProf = (x, y) => { let c = false; for (let i = 0, j = prof.length - 1; i < prof.length; j = i++) { const [xi, yi] = prof[i], [xj, yj] = prof[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const pipeSpots = [];
  for (let y = D.bed + 0.55; y < G.crest - 0.4; y += 0.85) for (let x = G.heel + 0.45; x < G.toe; x += 0.78) if (inProf(x - 0.25, y) && inProf(x + 0.25, y) && inProf(x, y + 0.3)) pipeSpots.push([x + ((Math.round(y / 0.85) % 2) * 0.2), y]);
  const coolRing = new THREE.InstancedMesh(new THREE.RingGeometry(0.1, 0.16, 20), new THREE.MeshStandardMaterial({ color: 0x44474c, roughness: 0.4, metalness: 0.6 }), pipeSpots.length);
  const coolCore = new THREE.InstancedMesh(new THREE.CircleGeometry(0.1, 20), new THREE.MeshStandardMaterial({ color: 0x6fd6ff, emissive: 0x3fb8ff, emissiveIntensity: 0.6, roughness: 0.2 }), pipeSpots.length);
  root.add(coolRing, coolCore); coolRing.castShadow = coolCore.castShadow = false;
  const m4 = new THREE.Matrix4();
  const setPipes = (fn) => { pipeSpots.forEach(([x, y], i) => { const s = Math.max(0.0001, fn(x, y)); m4.makeScale(s, s, 1).setPosition(x, y, 0.016); coolRing.setMatrixAt(i, m4); coolCore.setMatrixAt(i, m4); }); coolRing.instanceMatrix.needsUpdate = coolCore.instanceMatrix.needsUpdate = true; };
  setPipes(() => 0);

  // ---- spillway: a crest notch + a chute down the downstream face (front strip, z 0..−SPW), its back wall, an EXIT sign
  const SPW = 1.9, slopeLen = Math.hypot(G.toe - G.crestX, 8.55 - D.bed), slopeA = Math.atan2(8.55 - D.bed, G.toe - G.crestX);
  const spill = new THREE.Group(); root.add(spill);
  const chuteBack = mk(new THREE.BoxGeometry(slopeLen + 0.4, 0.55, 0.16), new THREE.MeshStandardMaterial({ map: concT, roughness: 0.85 }), spill, (G.crestX + G.toe) / 2 + 0.1, (8.55 + D.bed) / 2 + 0.3, -SPW);
  chuteBack.rotation.z = -slopeA;
  const ogee = mk(new THREE.CylinderGeometry(0.5, 0.5, SPW, 20, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ map: concT, roughness: 0.85 }), spill, G.crestX + 0.05, 8.55, -SPW / 2); ogee.rotation.x = Math.PI / 2; ogee.rotation.y = Math.PI / 2;
  const bucket = mk(new THREE.CylinderGeometry(0.7, 0.7, SPW, 20, 1, false, Math.PI * 0.5, Math.PI * 0.5), new THREE.MeshStandardMaterial({ map: concT, roughness: 0.85 }), spill, G.toe + 0.35, D.bed + 0.7, -SPW / 2); bucket.rotation.x = Math.PI / 2;
  const exitSign = new THREE.Group(); spill.add(exitSign); exitSign.position.set(G.crestX + 1.25, G.crest + 1.05, -0.25);
  const exitB = board(1.5, 0.62, 'EXIT', { bg: '#1f9e4a', fg: '#ffffff', border: '#ffffff' }); exitB.material.emissive = new THREE.Color(0x1f9e4a); exitB.material.emissiveIntensity = 0.35; exitSign.add(exitB);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), mat(0x55585e, 0.4), exitSign, s * 0.6, -0.6, -0.02);
  // water sheets: one full-width (overtopping, before the spillway) and one in the chute; both scroll foam downhill
  const sheetT = tex(512, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fd3f7'); gr.addColorStop(0.5, '#3fa9dd'); gr.addColorStop(1, '#7fd3f7'); c.fillStyle = gr; c.fillRect(0, 0, w, h); const r = rng(6); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`; c.beginPath(); c.ellipse(r() * w, r() * h, 8 + r() * 24, 2 + r() * 5, 0, 0, 7); c.fill(); } });
  sheetT.wrapS = sheetT.wrapT = THREE.RepeatWrapping;
  const mkSheet = (width, zc) => { const t2 = sheetT.clone(); t2.needsUpdate = true; t2.repeat.set(slopeLen / 2.5, width / 2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(slopeLen + 0.2, 0.14, width), new THREE.MeshStandardMaterial({ map: t2, roughness: 0.1, transparent: true, opacity: 0.85, emissive: 0x2a8ac8, emissiveIntensity: 0.2, depthWrite: false }));
    m.renderOrder = 4; m.rotation.z = -slopeA; m.position.set((G.crestX + G.toe) / 2, (8.55 + D.bed) / 2 + 0.08, zc); root.add(m); return { m, t2 }; };
  const sheetAll = mkSheet(D.CW, -D.CW / 2), sheetChute = mkSheet(SPW - 0.1, -SPW / 2);

  // ---- penstock (in section, through the dam into the powerhouse) + intake rack + powerhouse with the turbine (cut open)
  const PW = D.power;
  const penPts = [[G.heel - 0.15, 3.3], [G.heel + 1.4, 3.05], [-4.0, 1.7], [-1.6, 0.66], [-0.5, 0.25], [0.3, -1.0], [1.2, -1.25], [2.05, -1.25]];
  const penCurve = new THREE.CatmullRomCurve3(penPts.map(([x, y]) => new THREE.Vector3(x, y, 0.02)));
  const penstock = new THREE.Group(); root.add(penstock);
  const penOuter = mk(new THREE.TubeGeometry(penCurve, 100, 0.42, 12, false), new THREE.MeshStandardMaterial({ color: 0x4a4e55, roughness: 0.4, metalness: 0.6 }), penstock); penOuter.scale.z = 0.12;
  const penInner = mk(new THREE.TubeGeometry(penCurve, 100, 0.33, 12, false), new THREE.MeshStandardMaterial({ color: 0x3fa9dd, roughness: 0.1, emissive: 0x2a8ac8, emissiveIntensity: 0.35 }), penstock); penInner.scale.z = 0.12; penInner.position.z = 0.02;
  const penIdx = penOuter.geometry.index.count;
  const rack = new THREE.Group(); penstock.add(rack); rack.position.set(G.heel - 0.12, 3.3, -0.6);
  for (let i = 0; i < 7; i++) mk(new THREE.BoxGeometry(0.05, 1.2, 0.05), mat(0x3a3d42, 0.5), rack, 0, 0, 0.5 - i * 0.18);
  const power = new THREE.Group(); root.add(power);
  const phW = PW.x1 - PW.x0, phH = 3.1, phD = PW.z0 - PW.z1, phX = (PW.x0 + PW.x1) / 2, phZ = (PW.z0 + PW.z1) / 2;
  const phWallM = mat(0xe8dcc6, 0.85), phRoofM = mat(0x8a5a3a, 0.8), phIn = mat(0xb9b2a4, 0.9);
  mk(new THREE.BoxGeometry(phW, phH, 0.16), phIn, power, phX, phH / 2, PW.z1);
  for (const x of [PW.x0, PW.x1]) mk(new THREE.BoxGeometry(0.16, phH, phD), phWallM, power, x, phH / 2, phZ);
  mk(new THREE.BoxGeometry(phW + 0.3, 0.2, phD + 0.3), phRoofM, power, phX, phH + 0.1, phZ);
  mk(new THREE.BoxGeometry(phW, 0.3, 0.12), phWallM, power, phX, phH - 0.15, PW.z0);
  for (let i = 0; i < 3; i++) mk(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshStandardMaterial({ color: 0x7fb6d8, roughness: 0.2, emissive: 0xffd27a, emissiveIntensity: 0 }), power, PW.x0 + 0.7 + i * 0.9, 2.2, PW.z1 + 0.09);
  const phSign = board(2.2, 0.5, 'POWERHOUSE', { bg: '#2b2f36', fg: '#ffd43b', border: null }); phSign.position.set(phX, phH + 0.48, PW.z0 + 0.05); power.add(phSign);
  for (const s2 of [-1, 1]) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), mat(0x55585e, 0.4), power, phX + s2 * 0.8, phH + 0.25, PW.z0 + 0.02);
  // the generator sits on the turbine's shaft at the back; the turbine casing (a ring facing the lens) is Gary's washing machine
  const TP = PW.turb;
  const gen = mk(new THREE.CylinderGeometry(0.6, 0.6, 0.9, 24), mat(0xd23c32, 0.45), power, TP[0], 2.45, PW.z1 + 0.9);
  mk(new THREE.CylinderGeometry(0.66, 0.66, 0.1, 24), mat(0x3a3d42, 0.5), power, TP[0], 2.92, PW.z1 + 0.9);
  const turb = new THREE.Group(); power.add(turb); turb.position.set(TP[0], TP[1], TP[2]);
  mk(new THREE.TorusGeometry(PW.R, 0.12, 12, 40), mat(0x3a3d42, 0.4, { metalness: 0.6 }), turb);
  mk(new THREE.CylinderGeometry(PW.R + 0.05, PW.R + 0.05, 0.9, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x4a4e55, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide }), turb, 0, 0, -0.45).rotation.x = Math.PI / 2;
  mk(new THREE.CircleGeometry(PW.R, 40), mat(0x2b2e33, 0.6), turb, 0, 0, -0.88);
  const swirl = mk(new THREE.CircleGeometry(PW.R - 0.02, 40), new THREE.MeshStandardMaterial({ color: 0x3fa9dd, roughness: 0.1, transparent: true, opacity: 0, depthWrite: false, emissive: 0x2a8ac8, emissiveIntensity: 0.3 }), turb, 0, 0, -0.05);
  swirl.castShadow = false;
  const rotor = new THREE.Group(); turb.add(rotor); rotor.position.z = -0.6;
  for (let i = 0; i < 6; i++) { const b = mk(new THREE.BoxGeometry(0.14, 0.78, 0.05), mat(0xc9ced6, 0.3, { metalness: 0.7 }), rotor, 0, 0, 0); b.geometry.translate(0, 0.42, 0); b.rotation.set(0, 0.5, (i / 6) * Math.PI * 2); }
  mk(new THREE.SphereGeometry(0.16, 12, 10), mat(0xffd23f, 0.4), rotor, 0, 0, 0.05);
  mk(new THREE.BoxGeometry(0.5, 0.06, 0.06), mat(0xffd23f, 0.4), turb, 0, PW.R + 0.16, 0.05);
  // the pipe from the penstock's exit at the dam toe over the creek into the casing's side, and the draft-tube outlet into the creek
  const feedCurve = new THREE.CatmullRomCurve3([[2.05, -1.25, -0.25], [2.1, -1.0, -1.6], [2.12, -0.3, -2.35], [2.16, 0.6, -2.85], [TP[0] - PW.R - 0.05, TP[1], TP[2] - 0.45]].map((q) => new THREE.Vector3(...q)));
  const feed = mk(new THREE.TubeGeometry(feedCurve, 60, 0.3, 14, false), new THREE.MeshStandardMaterial({ color: 0x4a4e55, roughness: 0.4, metalness: 0.6 }), power);
  const draft = mk(new THREE.BoxGeometry(1.2, 0.5, 0.9), mat(0x55585e, 0.6), power, TP[0] + 0.3, 0.2, PW.z0 + 0.25); void draft; void feed;
  recenter(power, [phX, 0, phZ]);
  // transmission tower + wires to the town
  const pylon = new THREE.Group(); root.add(pylon); pylon.position.set(D.pylon[0], 0, D.pylon[1]);
  const steelM = mat(0x8d969f, 0.5, { metalness: 0.5 });
  for (const s of [-1, 1]) { const l = mk(new THREE.CylinderGeometry(0.05, 0.09, 6.2, 6), steelM, pylon, s * 0.55, 3.1, 0); l.rotation.z = s * 0.08; }
  for (let k = 0; k < 6; k++) { const b = mk(new THREE.BoxGeometry(1.1 - k * 0.07, 0.05, 0.05), steelM, pylon, 0, 0.8 + k * 0.95, 0); b.rotation.z = k % 2 ? 0.5 : -0.5; }
  mk(new THREE.BoxGeometry(2.2, 0.08, 0.08), steelM, pylon, 0, 6.0, 0);
  const wires = [-0.9, 0.9].map((dx) => { const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20, x = lerp(D.pylon[0] + dx, 30 + dx, u); pts.push(new THREE.Vector3(x, 6.0 - 1.4 * Math.sin(Math.PI * u), D.pylon[1])); } const m = mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.02, 4, false), mat(0x222222, 0.5), root); m.castShadow = false; return m; });
  const wireGlow = new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0 }); wires.forEach((w) => { const g2 = new THREE.Mesh(w.geometry, wireGlow); g2.scale.setScalar(1.0); root.add(g2); });

  // ---- fish ladder: stepped pools up the downstream face, at the back of the dam (z −4.3..−6.2)
  const ladder = [];
  const LZ0 = D.ladder.z0, LZ1 = D.ladder.z1, nSteps = 9;
  for (let i = 0; i < nSteps; i++) {
    const x1 = 1.3 - i * 0.82, x0 = x1 - 0.82, y0 = i === 0 ? 0 : Math.max(0, slopeY(x1) - 0.1), y1 = Math.max(0.35, slopeY(x0) + 0.15);
    const st = new THREE.Group(); root.add(st);
    const hgt = Math.max(0.3, y1 - y0 + 0.35);
    mk(new THREE.BoxGeometry(0.82, hgt, LZ0 - LZ1), new THREE.MeshStandardMaterial({ map: concT, roughness: 0.85 }), st, (x0 + x1) / 2, y0 + hgt / 2, (LZ0 + LZ1) / 2);
    const wtr = mk(new THREE.BoxGeometry(0.66, 0.26, LZ0 - LZ1 - 0.16), new THREE.MeshStandardMaterial({ color: 0x4fb8ea, roughness: 0.05, transparent: true, opacity: 0.8, emissive: 0x2a8ac8, emissiveIntensity: 0.25 }), st, (x0 + x1) / 2, y0 + hgt + 0.02, (LZ0 + LZ1) / 2);
    wtr.castShadow = false;
    recenter(st, [(x0 + x1) / 2, y0, (LZ0 + LZ1) / 2]);
    ladder.push({ g: st, x: (x0 + x1) / 2, y: y0 + hgt + 0.1, z: (LZ0 + LZ1) / 2 });
  }

  // ---- finishing: the road on the crest, a visitor center + gift shop on the bank downstream, a NO SWIMMING sign, a book stack
  const road = new THREE.Group(); root.add(road);
  const roadT = tex(256, 512, (c, w, h) => { c.fillStyle = '#4a4d52'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2d14a'; c.fillRect(w / 2 - 5, 0, 10, h); });
  mk(new THREE.BoxGeometry(G.crestX - G.heel + 0.1, 0.06, D.CW), new THREE.MeshStandardMaterial({ map: roadT, roughness: 0.8 }), road, (G.heel + G.crestX) / 2, G.crest + 0.03, -D.CW / 2);
  for (const x of [G.heel + 0.05, G.crestX - 0.05]) mk(new THREE.BoxGeometry(0.1, 0.4, D.CW), mat(0xd8d3c8, 0.8), road, x, G.crest + 0.2, -D.CW / 2);
  for (let i = 0; i < 3; i++) { const l = new THREE.Group(); road.add(l); l.position.set(G.crestX - 0.05, G.crest, -1.2 - i * 2.2); mk(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), mat(0x2f3542), l, 0, 0.75, 0); mk(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff3d0, emissive: 0xfff0c0, emissiveIntensity: 0.6 }), l, 0, 1.55, 0); }
  recenter(road, [(G.heel + G.crestX) / 2, G.crest, -D.CW / 2]);
  const crestCars = [0xd94b3d, 0x3d7bd9].map((c, i) => { const k = makeCar(c, 20 + i); k.g.scale.setScalar(0.3); k.g.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.blending === THREE.AdditiveBlending) o.visible = false; }); root.add(k.g); return k; });
  const SH = D.shop;
  const visitor = new THREE.Group(); root.add(visitor); visitor.position.set(D.visitor.x, 0, D.visitor.z);
  mk(new RoundedBoxGeometry(2.4, 2.4, 2.0, 2, 0.08), mat(0xf4efe4, 0.8), visitor, 0, 1.2, 0);
  mk(new THREE.BoxGeometry(2.6, 0.16, 2.2), mat(0x2f6fd6, 0.6), visitor, 0, 2.48, 0);
  const vs = board(2.2, 0.48, 'VISITOR CENTER', { bg: '#2f6fd6', fg: '#ffffff', border: null }); vs.position.set(0, 2.05, 1.02); visitor.add(vs);
  for (let i = 0; i < 3; i++) mk(new THREE.PlaneGeometry(0.5, 0.55), mat(0x7fb6d8, 0.2), visitor, -0.7 + i * 0.7, 1.15, 1.01);
  const shop = new THREE.Group(); root.add(shop); shop.position.set(SH.x, 0, SH.z);
  mk(new RoundedBoxGeometry(1.7, 0.85, 0.7, 2, 0.05), mat(0xc85a3e, 0.7), shop, 0, 0.42, 0);
  mk(new THREE.BoxGeometry(1.8, 0.06, 0.8), mat(0xf6ead6, 0.6), shop, 0, 0.87, 0);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), mat(0x6b4a30), shop, s * 0.8, 1.6, -0.2);
  const awnT = tex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff4ea' : '#e2483f'; c.fillRect((i * w) / 8, 0, w / 8, h); } });
  const aw = mk(new THREE.BoxGeometry(1.95, 0.05, 0.9), new THREE.MeshStandardMaterial({ map: awnT }), shop, 0, 2.35, 0.05); aw.rotation.x = 0.2;
  const gs = board(1.5, 0.42, 'GIFT SHOP', { bg: '#ffd43b', fg: '#2b1a05', border: '#2b1a05' }); gs.position.set(0, 2.05, 0.38); shop.add(gs);
  const books = new THREE.Group(); shop.add(books); books.position.set(0.42, 0.9, 0.05);
  const coverT = tex(128, 160, (c, w, h) => { c.fillStyle = '#2f6fd6'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd43b'; c.font = '30px "Luckiest Guy", Arial Black'; c.textAlign = 'center'; c.fillText('HOW TO', w / 2, 46); c.fillText('DAM', w / 2, 84); c.fillStyle = '#fff'; c.font = '17px "Luckiest Guy", Arial Black'; c.fillText('BY A BEAVER', w / 2, 124); });
  coverT.colorSpace = THREE.SRGBColorSpace;
  for (let i = 0; i < 5; i++) { const b = mk(new THREE.BoxGeometry(0.2, 0.05, 0.26), [mat(0xffffff), mat(0xffffff), new THREE.MeshStandardMaterial({ map: coverT }), mat(0xffffff), mat(0x2f6fd6), mat(0x2f6fd6)], books, (i % 2) * 0.01, 0.025 + i * 0.052, 0); b.rotation.y = (i % 3) * 0.06; }
  const heldBook = mk(new THREE.BoxGeometry(0.26, 0.34, 0.05), [mat(0x2f6fd6), mat(0x2f6fd6), mat(0xffffff), mat(0xffffff), new THREE.MeshStandardMaterial({ map: coverT }), mat(0x2f6fd6)], root);
  const noSwim = new THREE.Group(); root.add(noSwim); noSwim.position.set(D.noSwim[0], 0, D.noSwim[1]);
  const nsB = board(1.1, 0.85, 'NO\nSWIMMING', { bg: '#ffffff', fg: '#d8231c', border: '#d8231c' }); nsB.position.y = 1.55; noSwim.add(nsB);
  mk(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6), mat(0x55585e, 0.4), noSwim, 0, 0.65, -0.03);

  // ---- rain cloud + the drought's bathtub ring on the canyon wall (white mineral band above the low water line)
  const ringLo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ringHi = new THREE.Plane(new THREE.Vector3(0, -1, 0), 8.7), ringX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), D.dam.heel);
  const ring = mk(wg, new THREE.MeshStandardMaterial({ map: wallT, color: 0xfffaf2, emissive: 0xffffff, emissiveMap: wallT, emissiveIntensity: 0.45, roughness: 1, clippingPlanes: [ringLo, ringHi, ringX] }), root, 0, D.wallH / 2 - 1, -D.CW - 0.42);
  ring.castShadow = false; ring.visible = false;
  const setRing = (lo, hi) => { ring.visible = hi > lo + 0.05; ringLo.constant = -lo; ringHi.constant = hi; };
  // storm: a grey veil inside the sky dome (the dome is unlit, so lights can't darken it)
  const storm = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ color: 0x5d6670, transparent: true, opacity: 0, side: THREE.BackSide, fog: false, depthWrite: false }));
  storm.renderOrder = -1; root.add(storm);

  // thermometer (the hook's 104°F), on a post by the creek
  const thermo = new THREE.Group(); root.add(thermo); thermo.position.set(D.thermo[0], 0, D.thermo[1]); thermo.rotation.y = -0.3;
  mk(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), mat(0x6b4a30), thermo, 0, 0.8, 0);
  mk(new RoundedBoxGeometry(0.34, 1.0, 0.06, 2, 0.03), mat(0xffffff, 0.5), thermo, 0, 1.6, 0.05);
  const mercury = mk(new THREE.BoxGeometry(0.07, 0.7, 0.02), new THREE.MeshStandardMaterial({ color: 0xe8231c, emissive: 0xe8231c, emissiveIntensity: 0.3 }), thermo, 0, 1.6, 0.09);
  mercury.geometry.translate(0, 0.35, 0); mercury.position.y = 1.23;
  mk(new THREE.SphereGeometry(0.09, 12, 10), mat(0xe8231c, 0.4), thermo, 0, 1.22, 0.09);

  root.traverse((o) => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
  return {
    root, cut, aimSun, sun, hemi, setHoles: (shapes) => cut.setHoles(shapes), tunnelHoles, tCurve, bore, digClip, tWater, tWaterIdx, plug, portals, mouths,
    earth, pipeDark, pipeWater, pipeIdx, pipeCurve, cutoff, cutoffTop, damCols, secM, sideM, pipeSpots, setPipes, coolCore, coolRing,
    spill, chuteBack, ogee, bucket, exitSign, sheetAll, sheetChute, slopeA, slopeLen, SPW,
    penstock, penOuter, penInner, penIdx, penCurve, rack, power, phSign, turb, rotor, swirl, gen, pylon, wireGlow, winMats, feedCurve,
    ladder, road, crestCars, visitor, shop, books, heldBook, noSwim, ring, setRing, storm, thermo, mercury,
    upTown, upHouses, church, downTown, pool, closed, lock, beaverDam, twig, trees,
  };
}
