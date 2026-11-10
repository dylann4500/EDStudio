// Blocky-avatar game style (069): the classic blocky avatar, our own design. A rounded-cylinder head with a printed face decal,
// a box torso, box arms and legs that swing stiffly from the shoulder/hip (no elbows, no knees), bright shirt/pants colours,
// hair and hats as simple accessory meshes, smooth glossy plastic. ~5.2 studs (1.77 m) tall; feet at y = 0.
//   const P = makeAvatar({ skin: 0xf2c79b, shirt: 0x2f7cf6, pants: 0x2b2f3a, hair: 'short', hairColor: 0x3a2618, hat: 'cap', face: 'smile' });
//   scene.add(P.root);
//   P.pose({ x, z, rotY, walk: P.phaseFor(dist), face: 'grin', armR: ARMS.wave(t), head: { yaw: 0.3 } });
//   P.pose({ ..., jump: 1 })          // the classic jump / fall pose: both arms straight up
//   P.shatter(t, t0, pose0, { dir: [0, 0, 1] })   // the "oof": the avatar breaks into its parts, which tumble and settle
// Conventions: faces +z. armL / legL = its LEFT (+x). Limb { a, s, t }: a = forward raise (π/2 = pointing ahead, π = straight up),
// s = outward raise (both sides), t = twist about the limb. Head { yaw, pitch (> 0 looks down), roll }. lean > 0 tips forward.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { S, plastic, shade, makeCanvas } from './mats.js';

export const DIM = {
  legH: 2 * S, torsoH: 2 * S, torsoW: 2 * S, depth: 1 * S, limbW: 1 * S,
  headR: 0.6 * S, headH: 1.2 * S, round: 0.035,
  get neck() { return this.legH + this.torsoH; },
  get height() { return this.legH + this.torsoH + this.headH; },
};
const HIP_Y = DIM.legH - 0.25 * S, SHOULDER_Y = DIM.legH + DIM.torsoH - 0.5 * S;

// ---------------------------------------------------------------- the head: a rounded cylinder (lathe) + a printed face decal
const RC = 0.25 * S;                              // corner radius of the head's rim
function headProfile(R = DIM.headR, hh = DIM.headH / 2, rc = RC, n = 8) {
  const pts = [new THREE.Vector2(0.0001, -hh)];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rc + rc * Math.cos(a), -hh + rc + rc * Math.sin(a))); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - rc + rc * Math.cos(a), hh - rc + rc * Math.sin(a))); }
  pts.push(new THREE.Vector2(0.0001, hh));
  // drop consecutive duplicates (LatheGeometry NaN normals = black blocks, CLAUDE.md)
  return pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 1e-6);
}
let HEAD_GEO = null;
const headGeo = () => HEAD_GEO || (HEAD_GEO = new THREE.LatheGeometry(headProfile(), 40));

/** a shell that hugs the head from a hairline yb(θ) up over the crown (θ = 0 is the face side). scale > 1 sits outside the head. */
export function headShell(yb, { scale = 1.07, scaleY = 1.06, seg = 40, rows = 14, lift = 0 } = {}) {
  const prof = headProfile();
  const L = [0]; for (let i = 1; i < prof.length; i++) L.push(L[i - 1] + prof[i].distanceTo(prof[i - 1]));
  const tot = L[L.length - 1];
  const at = (s) => { let i = 1; while (i < L.length - 1 && L[i] < s) i++; const k = (s - L[i - 1]) / Math.max(1e-9, L[i] - L[i - 1]); return [prof[i - 1].x + (prof[i].x - prof[i - 1].x) * k, prof[i - 1].y + (prof[i].y - prof[i - 1].y) * k]; };
  const sAtY = (y) => { for (let i = 1; i < prof.length; i++) if (prof[i].y >= y && prof[i].x > 0.001) { const k = (y - prof[i - 1].y) / Math.max(1e-9, prof[i].y - prof[i - 1].y); return L[i - 1] + (L[i] - L[i - 1]) * Math.min(1, Math.max(0, k)); } return tot * 0.5; };
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * Math.PI * 2, s0 = sAtY(yb(th));
    for (let j = 0; j <= rows; j++) {
      const s = s0 + (tot - s0) * (j / rows), [r, y] = at(Math.min(s, tot - 1e-5));
      pos.push(Math.sin(th) * r * scale, y * scaleY + lift, Math.cos(th) * r * scale); uv.push(i / seg, j / rows);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rows; j++) { const a = i * (rows + 1) + j, b = (i + 1) * (rows + 1) + j; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

// faces: a 320 × 256 transparent canvas mapped round the front of the head (decal cylinder, θ ±0.95 rad)
const FW = 320, FH = 256, FACE_TH = 1.9;
export const FACES = ['smile', 'grin', 'open', 'shock', 'scream', 'angry', 'worried', 'smirk', 'happy', 'wink', 'cool', 'cry', 'dizzy', 'talk', 'sleepy', 'evil', 'shy', 'meh', 'oof'];
const FACE_CACHE = new Map();
function faceTex(name, ink = 0x1b1b1f) {
  const key = name + ':' + ink;
  if (FACE_CACHE.has(key)) return FACE_CACHE.get(key);
  const c = makeCanvas(FW, FH, (g) => paintFace(g, name, '#' + ink.toString(16).padStart(6, '0')));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  FACE_CACHE.set(key, t); return t;
}
function paintFace(g, name, ink) {
  const E = [128, 192], EY = 104;                 // eye centres (x), eye line (y)
  g.lineCap = 'round'; g.lineJoin = 'round'; g.fillStyle = ink; g.strokeStyle = ink;
  const ell = (x, y, rx, ry, fill = ink) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ink; };
  const eyes = (rx = 11, ry = 22, dy = 0, glint = false) => { for (const x of E) { ell(x, EY + dy, rx, ry); if (glint) ell(x - rx * 0.3, EY + dy - ry * 0.4, rx * 0.32, ry * 0.2, '#ffffff'); } };
  const arcEyes = (up = true) => { g.lineWidth = 9; for (const x of E) { g.beginPath(); if (up) g.arc(x, EY + 10, 15, Math.PI * 1.15, Math.PI * 1.85); else g.arc(x, EY - 10, 15, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); } };
  const brows = (kind) => {
    g.lineWidth = 9;
    const seg = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
    if (kind === 'angry') { seg(E[0] - 22, 62, E[0] + 16, 76); seg(E[1] + 22, 62, E[1] - 16, 76); }
    else if (kind === 'worried') { seg(E[0] - 20, 74, E[0] + 16, 60); seg(E[1] + 20, 74, E[1] - 16, 60); }
    else if (kind === 'up') { seg(E[0] - 18, 58, E[0] + 16, 56); seg(E[1] + 18, 58, E[1] - 16, 56); }
    else if (kind === 'raise') { seg(E[0] - 18, 70, E[0] + 16, 70); g.beginPath(); g.moveTo(E[1] - 18, 60); g.quadraticCurveTo(E[1], 46, E[1] + 20, 56); g.stroke(); }
    else if (kind === 'flat') { seg(E[0] - 18, 68, E[0] + 16, 68); seg(E[1] + 18, 68, E[1] - 16, 68); }
  };
  const smile = (r = 62, a0 = 0.2, a1 = 0.8, cy = 118, w = 9) => { g.lineWidth = w; g.beginPath(); g.arc(160, cy, r, Math.PI * a0, Math.PI * a1); g.stroke(); };
  const frown = (cy = 212, r = 46) => { g.lineWidth = 9; g.beginPath(); g.arc(160, cy, r, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); };
  const dMouth = (y0 = 150, w = 54, h = 50, teeth = true) => {
    g.beginPath(); g.moveTo(160 - w, y0); g.quadraticCurveTo(160, y0 + 10, 160 + w, y0); g.quadraticCurveTo(160 + w * 0.8, y0 + h * 1.25, 160, y0 + h); g.quadraticCurveTo(160 - w * 0.8, y0 + h * 1.25, 160 - w, y0); g.fill();
    if (teeth) { g.save(); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(160 - w, y0 - 4, 2 * w, 14); g.restore(); g.fillStyle = ink; }
  };
  const blush = () => { ell(E[0] - 26, EY + 42, 18, 9, 'rgba(255,110,130,.55)'); ell(E[1] + 26, EY + 42, 18, 9, 'rgba(255,110,130,.55)'); };
  switch (name) {
    case 'grin': eyes(); dMouth(); break;
    case 'open': case 'talk': eyes(); ell(160, 172, name === 'talk' ? 20 : 24, name === 'talk' ? 16 : 26); break;
    case 'shock': brows('up'); eyes(15, 27, -2, true); ell(160, 182, 22, 30); break;
    case 'scream': brows('worried'); eyes(13, 24, 0, true); ell(160, 182, 34, 44); ell(160, 208, 20, 12, '#d44a5a'); break;
    case 'angry': brows('angry'); eyes(11, 18, 4); frown(214, 44); break;
    case 'worried': brows('worried'); eyes(11, 20); g.lineWidth = 8; g.beginPath(); g.moveTo(124, 182); g.quadraticCurveTo(142, 168, 160, 182); g.quadraticCurveTo(178, 196, 196, 182); g.stroke(); break;
    case 'smirk': brows('raise'); eyes(11, 20); g.lineWidth = 9; g.beginPath(); g.moveTo(130, 178); g.quadraticCurveTo(175, 186, 205, 160); g.stroke(); break;
    case 'happy': arcEyes(true); smile(64, 0.12, 0.88, 120, 10); blush(); break;
    case 'wink': ell(E[0], EY, 11, 22); g.lineWidth = 9; g.beginPath(); g.arc(E[1], EY + 10, 15, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); smile(); break;
    case 'cool': {
      g.fillStyle = ink; const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
      rr(84, 82, 82, 46, 14); rr(154 + 0, 82, 82, 46, 14); g.fillRect(150, 88, 20, 8);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(98, 90, 22, 6); g.fillRect(168, 90, 22, 6); g.fillStyle = ink;
      g.lineWidth = 9; g.beginPath(); g.moveTo(132, 180); g.quadraticCurveTo(178, 190, 206, 164); g.stroke(); break;
    }
    case 'cry': brows('worried'); eyes(11, 20); for (const x of E) { g.fillStyle = 'rgba(70,160,255,.9)'; g.beginPath(); g.roundRect(x - 7, EY + 18, 14, 96, 7); g.fill(); } g.fillStyle = ink; frown(222, 40); break;
    case 'dizzy': g.lineWidth = 6; for (const x of E) { g.beginPath(); for (let a = 0; a < 12; a += 0.25) { const r = 2 + a * 1.9; g.lineTo(x + Math.cos(a) * r, EY + Math.sin(a) * r); } g.stroke(); }
      g.lineWidth = 8; g.beginPath(); g.moveTo(122, 186); for (let i = 1; i <= 8; i++) g.lineTo(122 + i * 10, 186 + (i % 2 ? -9 : 9)); g.stroke(); break;
    case 'sleepy': g.lineWidth = 9; for (const x of E) { g.beginPath(); g.moveTo(x - 16, EY + 4); g.lineTo(x + 16, EY + 4); g.stroke(); } ell(160, 178, 10, 12); break;
    case 'evil': brows('angry'); eyes(11, 18, 4); dMouth(150, 62, 46, true); break;
    case 'shy': brows('worried'); arcEyes(true); g.lineWidth = 8; g.beginPath(); g.arc(160, 160, 24, Math.PI * 0.25, Math.PI * 0.75); g.stroke(); blush(); break;
    case 'meh': brows('flat'); g.lineWidth = 9; for (const x of E) { g.beginPath(); g.moveTo(x - 14, EY + 2); g.lineTo(x + 14, EY + 2); g.stroke(); ell(x, EY + 12, 9, 10); } g.beginPath(); g.moveTo(132, 182); g.lineTo(188, 182); g.stroke(); break;
    case 'oof': brows('worried'); g.lineWidth = 8; for (const x of E) { g.beginPath(); g.moveTo(x - 14, EY - 14); g.lineTo(x + 14, EY + 14); g.moveTo(x + 14, EY - 14); g.lineTo(x - 14, EY + 14); g.stroke(); } ell(160, 182, 18, 22); break;
    default: eyes(); smile();
  }
}

// ---------------------------------------------------------------- hair + hats (accessory meshes)
const front = (th) => (1 + Math.cos(th)) / 2;      // 1 at the face, 0 at the back
function hairMesh(style, color) {
  const m = plastic(color, { rough: 0.55 }), g = new THREE.Group(), hh = DIM.headH / 2;
  const shell = (yb, o) => { const s = new THREE.Mesh(headShell(yb, o), m); s.castShadow = true; g.add(s); return s; };
  const lineY = (f, b) => (th) => b + (f - b) * front(th);
  if (style === 'none' || !style) return null;
  if (style === 'short') shell(lineY(hh * 0.55, -hh * 0.35));
  else if (style === 'swoop') { shell((th) => lineY(hh * 0.52, -hh * 0.35)(th) - 0.07 * Math.max(0, Math.cos(th)) * Math.max(0, Math.sin(th + 0.4) * 1.4)); }
  else if (style === 'spiky') {
    shell(lineY(hh * 0.58, -hh * 0.3));
    for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), m); cone.position.set(Math.sin(a) * 0.12, hh + 0.04 + (i % 2) * 0.015, Math.cos(a) * 0.06 - 0.02); cone.rotation.set(0.5 * Math.cos(a) - 0.3, 0, -0.6 * Math.sin(a)); cone.castShadow = true; g.add(cone); }
  } else if (style === 'long' || style === 'pony' || style === 'bun') {
    shell(lineY(hh * 0.5, -hh * 0.9));
    if (style === 'long') { const back = new THREE.Mesh(new RoundedBoxGeometry(DIM.headR * 2.05, 0.42, 0.1, 2, 0.04), m); back.position.set(0, -hh - 0.08, -DIM.headR * 0.78); back.castShadow = true; g.add(back); }
    if (style === 'pony') { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 10), m); p.position.set(0, -0.02, -DIM.headR - 0.08); p.rotation.x = 0.45; p.castShadow = true; g.add(p); }
    if (style === 'bun') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), m); b.position.set(0, hh + 0.04, -DIM.headR * 0.55); b.castShadow = true; g.add(b); }
  } else if (style === 'afro') {
    shell(lineY(hh * 0.55, -hh * 0.55), { scale: 1.32, scaleY: 1.2, lift: hh * 0.28 });
  } else if (style === 'buzz') shell(lineY(hh * 0.6, -hh * 0.2), { scale: 1.025, scaleY: 1.02 });
  return g;
}
/** a hat/accessory mesh on its own (e.g. a crown on a dog's head): origin = the head centre of an avatar */
export function makeHat(kind, color, color2) { return hatMesh(kind, color, color2); }
function hatMesh(kind, color, color2) {
  const g = new THREE.Group(), hh = DIM.headH / 2, R = DIM.headR;
  const m = plastic(color, { rough: 0.5 }), m2 = plastic(color2 ?? shade(color, -0.3), { rough: 0.5 });
  const add = (geo, mm, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mm); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  if (kind === 'cap') {
    g.add(new THREE.Mesh(headShell(() => hh * 0.42, { scale: 1.09, scaleY: 1.12 }), m)); g.children[0].castShadow = true;
    const visor = add(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.025, 24, 1, false, -Math.PI / 2, Math.PI), m2, 0, hh * 0.47, R * 0.62); visor.scale.set(1, 1, 0.9); visor.rotation.x = 0.12;
  } else if (kind === 'beanie') {
    g.add(new THREE.Mesh(headShell(() => hh * 0.32, { scale: 1.1, scaleY: 1.16 }), m)); g.children[0].castShadow = true;
    add(new THREE.CylinderGeometry(R * 1.13, R * 1.13, 0.07, 32, 1, true), m2, 0, hh * 0.4, 0);
    add(new THREE.SphereGeometry(0.065, 14, 10), m2, 0, hh * 1.2 + 0.05, 0);
  } else if (kind === 'tophat') {
    add(new THREE.CylinderGeometry(R * 1.45, R * 1.45, 0.025, 32), m, 0, hh + 0.01, 0);
    add(new THREE.CylinderGeometry(R * 0.92, R * 0.95, 0.34, 32), m, 0, hh + 0.18, 0);
    add(new THREE.CylinderGeometry(R * 0.955, R * 0.955, 0.05, 32), m2, 0, hh + 0.05, 0);
  } else if (kind === 'crown') {
    const gold = plastic(color ?? 0xf5c33b, { rough: 0.25, env: 1.6 });
    add(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.08, 24, 1, true), gold, 0, hh + 0.02, 0).material.side = THREE.DoubleSide;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.ConeGeometry(0.035, 0.1, 4), gold, Math.sin(a) * R * 0.9, hh + 0.1, Math.cos(a) * R * 0.9); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; add(new THREE.SphereGeometry(0.018, 8, 6), plastic(i % 2 ? 0xe5384f : 0x2fb3ff, { rough: 0.1 }), Math.sin(a) * R * 0.93, hh + 0.02, Math.cos(a) * R * 0.93); }
  } else if (kind === 'headphones') {
    const band = add(new THREE.TorusGeometry(R * 1.08, 0.022, 8, 28, Math.PI), m, 0, 0.02, 0); band.rotation.set(0, 0, 0);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 18), m2, s * R * 1.08, 0.0, 0, 0, 0, Math.PI / 2);
  } else if (kind === 'party') {
    const cone = add(new THREE.ConeGeometry(R * 0.55, 0.32, 20), m, 0.03, hh + 0.15, 0, 0, 0, -0.12);
    add(new THREE.SphereGeometry(0.04, 10, 8), m2, 0.05, hh + 0.33, 0); void cone;
  } else if (kind === 'hardhat') {
    add(new THREE.SphereGeometry(R * 1.08, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, hh * 0.45, 0);
    add(new THREE.CylinderGeometry(R * 1.28, R * 1.28, 0.025, 28), m, 0, hh * 0.45, 0.03);
  } else if (kind === 'halo') {
    const h = add(new THREE.TorusGeometry(R * 0.7, 0.025, 10, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff3a0).multiplyScalar(1.8) }), 0, hh + 0.16, 0, Math.PI / 2); h.castShadow = false;
  } else if (kind === 'helmet') {                  // a football helmet: a shell down to the jaw at the back, a stripe, a grey face mask
    g.add(new THREE.Mesh(headShell((th) => hh * 0.34 - hh * 1.1 * (1 - front(th)), { scale: 1.16, scaleY: 1.14 }), m)); g.children[0].castShadow = true;
    const stripe = add(new THREE.BoxGeometry(0.06, 0.03, R * 2.1), m2, 0, hh * 1.14 + 0.005, -0.02); stripe.scale.set(1, 1, 1);
    const grey = plastic(0xb9bdc4, { rough: 0.3, env: 1.3 });
    for (const y of [-0.06, -0.13]) { const bar = add(new THREE.TorusGeometry(R * 1.12, 0.012, 6, 24, Math.PI * 0.62), grey, 0, y, 0, Math.PI / 2, 0, Math.PI * 0.69); bar.castShadow = false; }
    add(new THREE.BoxGeometry(0.014, 0.12, 0.014), grey, 0, -0.095, R * 1.12).castShadow = false;
  } else if (kind === 'dogears') {                 // a headband with two pointy dog ears (the "pull a Quinn" gag)
    g.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.018, 8, 28, Math.PI), m2)); g.children[0].rotation.set(0, Math.PI / 2, 0); g.children[0].position.y = hh * 0.55;
    for (const s of [-1, 1]) {
      const e = add(new THREE.ConeGeometry(0.075, 0.2, 4), m, s * R * 0.62, hh + 0.08, 0, 0, Math.PI / 4, -s * 0.28); e.scale.set(1, 1, 0.38);
      const inner = add(new THREE.ConeGeometry(0.05, 0.14, 4), plastic(0xf2a2a8, { rough: 0.5 }), s * R * 0.62 + s * 0.004, hh + 0.07, 0.016, 0, Math.PI / 4, -s * 0.28); inner.scale.set(1, 1, 0.2);
    }
  } else if (kind === 'bandana') {
    g.add(new THREE.Mesh(headShell(() => hh * 0.45, { scale: 1.06, scaleY: 1.08 }), m)); g.children[0].castShadow = true;
  } else return null;
  return g;
}

// ---------------------------------------------------------------- the avatar
const RB = (w, h, d, r = DIM.round) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const limbGeoCache = new Map();
const limbGeo = (h) => { const k = h.toFixed(4); if (!limbGeoCache.has(k)) limbGeoCache.set(k, RB(DIM.limbW, h, DIM.depth)); return limbGeoCache.get(k); };

/** shirt print (a decal on the torso front): 'star' | 'heart' | 'bolt' | 'stripe' | 'number:7' | 'text:HI' | a draw(g, w, h) fn */
function printTex(print, color) {
  const c = makeCanvas(256, 256, (g) => {
    g.fillStyle = color; g.strokeStyle = color; g.lineJoin = 'round'; g.lineCap = 'round';
    if (typeof print === 'function') return print(g, 256, 256);
    if (print === 'star') { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 42 : 100; g.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } g.fill(); }
    else if (print === 'heart') { g.beginPath(); g.moveTo(128, 210); g.bezierCurveTo(10, 130, 70, 40, 128, 95); g.bezierCurveTo(186, 40, 246, 130, 128, 210); g.fill(); }
    else if (print === 'bolt') { g.beginPath(); [[150, 20], [70, 140], [122, 140], [100, 236], [190, 104], [136, 104], [160, 20]].forEach(([x, y]) => g.lineTo(x, y)); g.fill(); }
    else if (print === 'stripe') { g.fillRect(0, 96, 256, 34); g.fillRect(0, 150, 256, 16); }
    else if (typeof print === 'string' && print.startsWith('number:')) { g.font = '700 170px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(print.slice(7), 128, 140); }
    else if (typeof print === 'string' && print.startsWith('text:')) { const s = print.slice(5); let f = 110; g.font = `700 ${f}px Fredoka, sans-serif`; while (g.measureText(s).width > 236 && f > 20) g.font = `700 ${(f -= 6)}px Fredoka, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 128, 132); }
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function makeAvatar(o = {}) {
  const skin = o.skin ?? 0xf5cd30, shirt = o.shirt ?? 0x2f7cf6, pants = o.pants ?? 0x2b4c8c, shoes = o.shoes ?? shade(pants, -0.35);
  const sleeve = o.sleeve ?? 0.45;                // fraction of the arm covered by the sleeve (1 = long sleeves, 0 = bare)
  const root = new THREE.Group(); root.name = o.name || 'avatar';
  const tipY = new THREE.Group(), tipX = new THREE.Group(), unY = new THREE.Group(), body = new THREE.Group();
  root.add(tipY); tipY.add(tipX); tipX.add(unY); unY.add(body);
  const parts = {};
  const mesh = (geo, m, parent, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me; };

  // torso (+ a waistband in the pants colour) — hips group carries everything above the legs (lean / twist)
  const hips = new THREE.Group(); hips.position.y = DIM.legH; body.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const band = o.belt === false ? 0 : 0.28 * S;
  mesh(RB(DIM.torsoW, DIM.torsoH - band, DIM.depth), plastic(shirt), torso, 0, band + (DIM.torsoH - band) / 2);
  if (band) mesh(RB(DIM.torsoW, band + 0.02, DIM.depth * 0.995), plastic(pants), torso, 0, band / 2);
  if (o.print) {
    const pt = printTex(o.print, o.printColor ?? '#ffffff');
    const pm = new THREE.MeshStandardMaterial({ map: pt, transparent: true, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(DIM.torsoW * 0.7, DIM.torsoW * 0.7), pm); pl.position.set(0, DIM.torsoH * 0.56, DIM.depth / 2 + 0.002); torso.add(pl); parts.print = pl;
  }
  if (o.tie) { const tie = mesh(new THREE.BoxGeometry(0.07, DIM.torsoH * 0.62, 0.012), plastic(o.tie), torso, 0, DIM.torsoH * 0.6, DIM.depth / 2 + 0.006); tie.castShadow = false; }
  parts.torso = torso;

  // arms: pivot at the shoulder, sleeve block + skin block; a hand anchor at the bottom (props: P.hand.L.add(prop), local −y = along the arm)
  const arm = (side) => {
    const piv = new THREE.Group(); piv.position.set(side * (DIM.torsoW / 2 + DIM.limbW / 2), SHOULDER_Y - DIM.legH, 0); piv.rotation.order = 'XYZ'; torso.add(piv);
    const top = 0.5 * S, len = DIM.legH, sl = len * sleeve;
    if (sl > 0.001) mesh(limbGeo(sl + (sleeve < 1 ? 0.012 : 0)), plastic(shirt), piv, 0, top - sl / 2 + 0.006);
    if (sleeve < 1) mesh(limbGeo(len - sl), plastic(skin), piv, 0, top - sl - (len - sl) / 2);
    const hand = new THREE.Group(); hand.position.set(0, top - len, 0); piv.add(hand);
    return { piv, hand };
  };
  const A = { L: arm(1), R: arm(-1) };
  // legs: pivot at the hip, pants + shoes
  const leg = (side) => {
    const piv = new THREE.Group(); piv.position.set(side * DIM.limbW / 2, HIP_Y, 0); piv.rotation.order = 'XYZ'; body.add(piv);
    const top = DIM.legH - HIP_Y, sh = 0.28 * S;
    mesh(limbGeo(DIM.legH - sh + 0.01), plastic(pants), piv, 0, top - (DIM.legH - sh) / 2 + 0.005);
    mesh(limbGeo(sh), plastic(shoes), piv, 0, top - DIM.legH + sh / 2);
    return { piv };
  };
  const Lg = { L: leg(1), R: leg(-1) };

  // head: neck pivot on top of the torso
  const neck = new THREE.Group(); neck.position.y = DIM.torsoH; torso.add(neck);
  const head = new THREE.Group(); head.position.y = DIM.headH / 2 + 0.005; neck.add(head);
  mesh(headGeo(), plastic(skin, { rough: 0.38 }), head);
  const arc = DIM.headR * FACE_TH, fh = arc * FH / FW;
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(o.face ?? 'smile', o.ink), transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false });
  const decal = new THREE.Mesh(new THREE.CylinderGeometry(DIM.headR + 0.0025, DIM.headR + 0.0025, fh, 32, 1, true, -FACE_TH / 2, FACE_TH), faceMat);
  decal.position.y = -0.012; decal.renderOrder = 2; head.add(decal);
  const hair = hairMesh(o.hair ?? 'short', o.hairColor ?? 0x3a2618); if (hair) head.add(hair);
  const hat = hatMesh(o.hat, o.hatColor ?? 0xe5384f, o.hatColor2); if (hat) head.add(hat);
  if (o.glasses) {
    const gm = plastic(o.glasses === true ? 0x1b1b1f : o.glasses, { rough: 0.3 });
    for (const s of [-1, 1]) { const ring = mesh(new THREE.TorusGeometry(0.045, 0.009, 6, 20), gm, head, s * 0.07, 0.02, DIM.headR + 0.01); ring.castShadow = false; }
    mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), gm, head, 0, 0.03, DIM.headR + 0.012).castShadow = false;
  }
  parts.head = head; parts.hair = hair; parts.hat = hat;

  let curFace = o.face ?? 'smile';
  const setFace = (f) => { if (f && f !== curFace) { faceMat.map = faceTex(f, o.ink); faceMat.needsUpdate = true; curFace = f; } };
  /** a second accessory you can toggle (P.addHat('dogears', 0xd9893a, 0x2b2f36).visible = …); rides the head like the hat */
  const addHat = (kind, c1, c2) => { const h = hatMesh(kind, c1, c2); if (h) head.add(h); return h; };

  // debris copies for the "oof" (built once, hidden)
  const debris = new THREE.Group(); debris.visible = false;
  const pieceOf = (src, hx, hy, hz) => { const g = new THREE.Group(); src.children.forEach((c) => { if (c.isMesh) { const m = c.clone(); g.add(m); } else if (c.isGroup && c.children.some((k) => k.isMesh)) g.add(c.clone(true)); }); g.userData.half = [hx, hy, hz]; debris.add(g); return g; };
  const P = {
    root, body, hips, torso, neck, head, arms: A, legs: Lg, hand: { L: A.L.hand, R: A.R.hand }, parts, debris, faceMat,
    get face() { return curFace; }, setFace, addHat, opts: o,
    /** walk phase for a distance (m) at this scale: one full cycle ≈ 1.85 m of travel */
    phaseFor: (dist, scale = 1) => (dist / (1.85 * scale)) * Math.PI * 2,
  };
  // pieces: what the debris copies are made of (head = head mesh + decal + hair + hat)
  const pieces = [];
  P._buildDebris = () => {
    if (pieces.length) return;
    const H = new THREE.Group(); head.children.forEach((c) => H.add(c.clone(true))); H.userData.half = [DIM.headR, DIM.headH / 2, DIM.headR]; debris.add(H); pieces.push(['head', head, H]);
    pieces.push(['torso', torso, pieceOf(torso, DIM.torsoW / 2, DIM.torsoH / 2, DIM.depth / 2)]);
    for (const s of ['L', 'R']) pieces.push(['arm' + s, A[s].piv, pieceOf(A[s].piv, DIM.limbW / 2, DIM.legH / 2, DIM.depth / 2)]);
    for (const s of ['L', 'R']) pieces.push(['leg' + s, Lg[s].piv, pieceOf(Lg[s].piv, DIM.limbW / 2, DIM.legH / 2, DIM.depth / 2)]);
  };

  // ---------------------------------------------------------------- pose
  const setLimb = (piv, l, side) => { piv.rotation.set(-(l?.a ?? 0), l?.t ?? 0, side * (l?.s ?? 0)); };
  P.pose = (p = {}) => {
    root.visible = p.visible ?? true; body.visible = true; debris.visible = false;
    const sc = p.scale ?? 1; root.scale.setScalar(sc);
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(0, p.rotY ?? 0, 0);
    // stiff tip-over: tip = angle (0 → π/2 lies flat), tipDir = yaw of the fall in the figure's frame (0 = falls forward)
    const tip = p.tip ?? 0, td = p.tipDir ?? 0;
    tipY.rotation.y = td; tipX.rotation.x = tip; unY.rotation.y = -td; tipY.position.y = Math.abs(Math.sin(tip)) * DIM.depth / 2;
    hips.rotation.set(p.lean ?? 0, p.twist ?? 0, p.tilt ?? 0);
    body.position.y = (p.bob ?? 0) + (p.sit ? -HIP_Y + DIM.depth / 2 + (p.seat ?? 0) : 0);   // sit: thighs rest ON the seat (seat = its top y, local)
    const ph = p.walk, amp = p.run ? 1.05 : (p.stride ?? 0.78), sw = ph == null ? 0 : Math.sin(ph) * amp;
    let aL = { a: -sw * 0.9 }, aR = { a: sw * 0.9 }, lL = { a: sw }, lR = { a: -sw };
    if (p.idle != null && ph == null) { const b = 0.05 * Math.sin(p.idle * 1.6); aL = { a: b, s: 0.04 }; aR = { a: -b, s: 0.04 }; }
    if (p.jump) { const k = p.jump; aL = { a: lerpN(aL.a, Math.PI - 0.08, k), s: 0.12 * k }; aR = { a: lerpN(aR.a, Math.PI - 0.08, k), s: 0.12 * k }; lL = { a: lerpN(lL.a, 0.12, k) }; lR = { a: lerpN(lR.a, -0.05, k) }; }
    if (p.sit) { lL = { a: Math.PI / 2, s: 0.04 }; lR = { a: Math.PI / 2, s: 0.04 }; if (!p.armL) aL = { a: 0.55 }; if (!p.armR) aR = { a: 0.55 }; }
    if (p.climb != null) { const c = Math.sin(p.climb); aL = { a: 2.4 + 0.5 * c }; aR = { a: 2.4 - 0.5 * c }; lL = { a: 0.5 + 0.4 * c }; lR = { a: 0.5 - 0.4 * c }; }
    setLimb(A.L.piv, p.armL ?? aL, 1); setLimb(A.R.piv, p.armR ?? aR, -1);
    setLimb(Lg.L.piv, p.legL ?? lL, 1); setLimb(Lg.R.piv, p.legR ?? lR, -1);
    const h = p.head || {}; neck.rotation.set(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ');
    setFace(p.face);
    if (hat) hat.visible = !p.noHat;
  };
  P.pose({});

  // ---------------------------------------------------------------- "oof": break into parts (deterministic, stateless)
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _c = new THREE.Vector3();
  /** call every frame for t ≥ t0 instead of pose(): pose0 = the pose at the moment it breaks. floor = ground y (world).
   *  dir = push direction (world, normalised-ish), power m/s; the parts fly, bounce, tumble and settle flat. */
  P.shatter = (t, t0, pose0, { dir = [0, 0, 0], power = 2.5, up = 4.2, floor = 0, seed = 7, spin = 9, g = 22, rest = 0.42 } = {}) => {
    P._buildDebris(); P.pose(pose0); root.updateMatrixWorld(true);
    if (!debris.parent && root.parent) root.parent.add(debris);
    const r = rngF(seed), dt = 1 / 120, T = Math.max(0, t - t0);
    body.getWorldPosition(_c); _c.y += DIM.legH + DIM.torsoH * 0.5;
    const sc = root.scale.x;
    for (const [, src, dst] of pieces) {
      src.updateMatrixWorld(true);
      // the piece's own centre in world space (the source group's origin is its pivot)
      const half = dst.userData.half, centreLocal = src === head ? new THREE.Vector3() : new THREE.Vector3(0, centreY(src), 0);
      const p = centreLocal.clone().applyMatrix4(src.matrixWorld);
      src.matrixWorld.decompose(_p, _q, _s);
      const q = _q.clone();
      const out = p.clone().sub(_c).setY(0); if (out.lengthSq() < 1e-6) out.set(r() - 0.5, 0, r() - 0.5); out.normalize();
      const v = new THREE.Vector3(dir[0] * power + out.x * (1 + r() * 1.6), up * (0.6 + r() * 0.7), dir[2] * power + out.z * (1 + r() * 1.6));
      const w = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(spin * (0.6 + r() * 0.8));
      const hmin = Math.min(...half) * sc;
      let settled = false, flatQ = null;
      for (let s = 0; s < T; s += dt) {
        if (settled) break;
        v.y -= g * dt; p.addScaledVector(v, dt);
        if (w.lengthSq() > 1e-6) { const dq = new THREE.Quaternion().setFromAxisAngle(w.clone().normalize(), w.length() * dt); q.premultiply(dq); }
        if (p.y < floor + hmin) {
          p.y = floor + hmin; v.y = -v.y * 0.38; v.x *= 0.62; v.z *= 0.62; w.multiplyScalar(0.55);
          if (Math.abs(v.y) < rest * 3 && Math.hypot(v.x, v.z) < 0.6) { settled = true; flatQ = flatten(q); }
        }
      }
      if (settled) {
        // lie flat on the face closest to the floor; centre at floor + that half extent
        const ax = upAxis(flatQ); q.slerp(flatQ, 1); p.y = floor + half[ax] * sc;
      }
      // the debris group's origin = the source pivot: place it so its centre lands at p
      dst.position.copy(p).sub(centreLocal.clone().multiply(_s).applyQuaternion(q)); dst.quaternion.copy(q); dst.scale.copy(_s);
    }
    body.visible = false; debris.visible = true;
  };
  const centreY = (src) => { let mn = Infinity, mx = -Infinity; src.children.forEach((c) => { if (c.isMesh && c.geometry.parameters?.height) { const h = c.geometry.parameters.height; mn = Math.min(mn, c.position.y - h / 2); mx = Math.max(mx, c.position.y + h / 2); } }); return isFinite(mn) ? (mn + mx) / 2 : 0; };
  P.headWorld = (v = new THREE.Vector3()) => { head.updateWorldMatrix(true, false); return head.getWorldPosition(v); };
  P.tagWorld = (v = new THREE.Vector3()) => { root.updateMatrixWorld(true); head.getWorldPosition(v); v.y += (DIM.headH / 2 + 0.28) * root.scale.y; return v; };
  return P;
}
const lerpN = (a, b, k) => a + (b - a) * k;
function rngF(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
const AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
function upAxis(q) { let best = 0, bd = -1; AXES.forEach((a, i) => { const d = Math.abs(a.clone().applyQuaternion(q).y); if (d > bd) { bd = d; best = i; } }); return best; }
function flatten(q) {
  const i = upAxis(q), a = AXES[i].clone().applyQuaternion(q), target = new THREE.Vector3(0, Math.sign(a.y) || 1, 0);
  return new THREE.Quaternion().setFromUnitVectors(a.normalize(), target).multiply(q);
}

// ---------------------------------------------------------------- arm presets (limb objects; functions take t for motion)
const PI = Math.PI;
export const ARMS = {
  down: { a: 0 },
  point: { a: PI / 2, s: 0.05 },                  // straight ahead
  up: { a: PI - 0.06, s: 0.1 },                   // straight up (the jump arm)
  out: { a: 0, s: PI / 2 },                       // T-pose
  hips: { a: -0.25, s: 0.55, t: 0.4 },
  hold: { a: 1.25, s: -0.12 },                    // holding something in front (a phone, a sheet)
  phone: { a: 2.05, s: -0.45 },                   // phone at the ear (use on armR)
  cheer: { a: PI - 0.35, s: 0.55 },
  shrug: { a: 0.45, s: 0.7, t: 0.6 },
  facepalm: { a: 2.55, s: -0.55 },
  wave: (t) => ({ a: 0.3, s: 2.55 + 0.32 * Math.sin(t * 11) }),
  flail: (t, k = 0) => ({ a: 1.6 + 1.1 * Math.sin(t * 17 + k), s: 0.9 + 0.6 * Math.sin(t * 13 + k * 2) }),
  dance: (t, side = 1) => ({ a: PI / 2 + 0.9 * Math.sin(t * 8 + (side > 0 ? 0 : PI)), s: 0.3 }),
};
