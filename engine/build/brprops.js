// 049 (Scribe promo): battle-royale props in the toon style.
//   makeCrowd(parent, n)   instanced mini toons (same proportions as toon.js: head ≈ 40 % of 1.42 m) — 100 seniors in red tees,
//                          set(i, {x,y,z,rotY,scale, sit, armL/armR {x,z}, look [dx,dy], tumble [rx,rz], phone, card, vis}) + commit()
//   makeChutes(parent, n)  instanced striped canopies + 4 lines each: set(i, canopyPos, bodyPos, open 0..1, color) + commit()
//   makeBeams(parent, n)   elimination light columns (additive): set(i, x, y, z, k) + commit()
//   makePlane()            cargo plane, nose +x, rear ramp (`ramp.rotation.z`), props spin with update(t)
//   makeBlimp()            the SPECTATORS blimp (nose +x) + an open grandstand gondola facing +z (`seats` = local seat spots)
//   makeCrate()            supply drop crate + parachute + panels that blow off (`burst(k)`), two cantaloupes on a velvet pillow
import * as THREE from 'three';
import { clamp, lerp, mk, rng } from '../core.js';
import { tex } from './lighthouse.js';

const PI = Math.PI, TAU = PI * 2;
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

export const SKINS = [0xf2c29a, 0xe0a97e, 0xc68863, 0x9c6644, 0x7a4a2e, 0xf6d2b0];
export const HAIRS = [0x2b1d14, 0x6b3f22, 0x3a2a1c, 0xd8a55a, 0x1a1a1a, 0x8a5a2b, 0xb5502c];
export const PANTS = [0x2f3e5a, 0x34495e, 0x3d3d3d, 0x5a4a3a, 0x24324a, 0x6a7a8a];

/** A canvas card with a big number/word (judges' score cards, GG signs). */
export const cardTex = (text, { bg = '#ffffff', fg = '#1b1b1b', w = 256, h = 256, px = 190, font = '"Luckiest Guy", "Arial Black"' } = {}) => tex(w, h, (c) => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#1b1b1b'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
  c.fillStyle = fg; c.font = `${px}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + px * 0.08);
});

export function makeCrowd(parent, n, { seed = 1, shirt = 0xd8393b, cards = ['3', '2', '1', '0'] } = {}) {
  const R = rng(seed);
  const people = Array.from({ length: n }, () => ({ skin: SKINS[Math.floor(R() * SKINS.length)], hair: HAIRS[Math.floor(R() * HAIRS.length)], pants: PANTS[Math.floor(R() * PANTS.length)], shirt, bald: R() < 0.12, card: Math.floor(R() * cards.length), ph: R() * TAU }));
  const G = {
    leg: new THREE.CapsuleGeometry(0.062, 0.26, 4, 8), shoe: new THREE.BoxGeometry(0.13, 0.085, 0.21), pelvis: new THREE.SphereGeometry(0.165, 14, 10),
    chest: new THREE.CapsuleGeometry(0.168, 0.14, 6, 14), arm: new THREE.CapsuleGeometry(0.052, 0.26, 4, 8), hand: new THREE.SphereGeometry(0.064, 10, 8),
    head: new THREE.SphereGeometry(0.27, 22, 16), hair: new THREE.SphereGeometry(0.278, 20, 10, 0, TAU, 0, PI * 0.38), white: new THREE.SphereGeometry(0.085, 12, 10),
    pupil: new THREE.SphereGeometry(0.043, 10, 8), mouth: new THREE.CapsuleGeometry(0.014, 0.07, 3, 6), phone: new THREE.BoxGeometry(0.085, 0.16, 0.014), card: new THREE.PlaneGeometry(0.42, 0.42),
  };
  const M = {
    pants: std(0xffffff, 0.85), shirt: std(0xffffff, 0.8), skin: std(0xffffff, 0.55), hair: std(0xffffff, 0.75), shoe: std(0x2b2018, 0.6), white: std(0xffffff, 0.25),
    pupil: std(0x1d1612, 0.2), mouth: std(0x3a1a14, 0.6), phone: std(0x15161a, 0.3, { emissive: 0x9fd2ff, emissiveIntensity: 0 }),
  };
  const meshes = {}, add = (key, geo, m, count = n, colors = null) => { const im = new THREE.InstancedMesh(geo, m, count); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; if (colors) { im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3); } parent.add(im); meshes[key] = im; return im; };
  add('leg', G.leg, M.pants, n * 2, true); add('shoe', G.shoe, M.shoe, n * 2); add('pelvis', G.pelvis, M.pants, n, true); add('chest', G.chest, M.shirt, n, true);
  add('arm', G.arm, M.shirt, n * 2, true); add('hand', G.hand, M.skin, n * 2, true); add('head', G.head, M.skin, n, true); add('hair', G.hair, M.hair, n, true);
  add('white', G.white, M.white, n * 2); add('pupil', G.pupil, M.pupil, n * 2); add('mouth', G.mouth, M.mouth, n); add('phone', G.phone, M.phone, n);
  meshes.white.castShadow = meshes.pupil.castShadow = meshes.mouth.castShadow = false;
  const cardMeshes = cards.map((c) => { const im = new THREE.InstancedMesh(G.card, new THREE.MeshStandardMaterial({ map: cardTex(c), roughness: 0.6, side: THREE.DoubleSide }), n); im.frustumCulled = false; parent.add(im); return im; });
  const C = new THREE.Color();
  people.forEach((p, i) => {
    for (const k of [0, 1]) { meshes.leg.setColorAt(i * 2 + k, C.setHex(p.pants)); meshes.arm.setColorAt(i * 2 + k, C.setHex(p.shirt)); meshes.hand.setColorAt(i * 2 + k, C.setHex(p.skin)); }
    meshes.pelvis.setColorAt(i, C.setHex(p.pants)); meshes.chest.setColorAt(i, C.setHex(p.shirt)); meshes.head.setColorAt(i, C.setHex(p.skin)); meshes.hair.setColorAt(i, C.setHex(p.hair));
  });
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const base = new THREE.Matrix4(), tum = new THREE.Matrix4(), part = new THREE.Matrix4(), out = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const put = (im, idx, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, parentM = null) => {
    e.set(rx, ry, rz, 'XYZ'); q.setFromEuler(e); part.compose(v.set(x, y, z), q, s.set(sx, sy, sz));
    out.multiplyMatrices(parentM || base, part); im.setMatrixAt(idx, out);
  };
  const limbEnd = new THREE.Matrix4();
  const state = people.map(() => ({ vis: false }));
  function hide(i) { for (const k of ['pelvis', 'chest', 'head', 'hair', 'mouth', 'phone']) meshes[k].setMatrixAt(i, ZERO); for (const k of ['leg', 'shoe', 'arm', 'hand', 'white', 'pupil']) { meshes[k].setMatrixAt(i * 2, ZERO); meshes[k].setMatrixAt(i * 2 + 1, ZERO); } for (const cm of cardMeshes) cm.setMatrixAt(i, ZERO); }
  /** p: {x,y,z,rotY,scale, sit 0..1, armL/armR {x (forward −), z (out +)}, look [dx,dy], tumble [rx, rz] (about the belly), phone, card (bool), cardUp 0..1, bob} */
  function set(i, p) {
    const P = people[i];
    if (!p || p.vis === false) { hide(i); return; }
    const sc = p.scale ?? 1;
    base.compose(v.set(p.x ?? 0, p.y ?? 0, p.z ?? 0), q.setFromAxisAngle(Y, p.rotY ?? 0), s.set(sc, sc, sc));
    if (p.tumble) { const [rx, rz] = p.tumble; tum.makeTranslation(0, 0.7, 0).multiply(new THREE.Matrix4().makeRotationFromEuler(e.set(rx, 0, rz))).multiply(new THREE.Matrix4().makeTranslation(0, -0.7, 0)); base.multiply(tum); }
    const sit = p.sit ?? 0, bob = p.bob ?? 0;
    // legs: hip at (±0.085, 0.42); standing = hang down, sitting = thighs forward (the shin hangs from the knee)
    for (const [k, sx] of [[0, -1], [1, 1]]) {
      const hx = sx * 0.085, hy = 0.42 + bob, th = -sit * PI / 2 + (p.kick ? Math.sin((p.t ?? 0) * 9 + P.ph + k * PI) * 0.4 * p.kick : 0);
      // thigh+shin as one capsule when standing; when sitting the thigh points forward and a shin capsule hangs (we fold: capsule centered along the thigh, shoe at knee-front-down)
      const L = 0.39, cx = hx, cy = hy - Math.cos(th) * L / 2, cz = -Math.sin(th) * L / 2;
      put(meshes.leg, i * 2 + k, cx, cy, cz, th, 0, 0);
      const ky = hy - Math.cos(th) * L, kz = -Math.sin(th) * L;
      put(meshes.shoe, i * 2 + k, hx, ky - 0.03 - sit * 0.3, kz + 0.035, 0, 0, 0, 1, 1, 1);
    }
    put(meshes.pelvis, i, 0, 0.47 + bob, 0, 0, 0, 0, 1, 0.72, 0.85);
    put(meshes.chest, i, 0, 0.66 + bob, 0, (p.lean ?? 0), 0, 0, 1, 1, 0.85);
    // arms from the shoulders (±0.19, 0.79): angles like toon.js (x: forward −, z: out +)
    for (const [k, sx, A] of [[0, -1, p.armL || {}], [1, 1, p.armR || {}]]) {
      const ax = A.x ?? 0, az = sx * (A.z ?? 0.12);
      e.set(ax, 0, az, 'XYZ'); q.setFromEuler(e); limbEnd.compose(v.set(sx * 0.19, 0.79 + bob, 0), q, s.set(1, 1, 1)); limbEnd.premultiply(base);
      put(meshes.arm, i * 2 + k, 0, -0.16, 0, 0, 0, 0, 1, 1, 1, limbEnd);
      put(meshes.hand, i * 2 + k, 0, -0.34, 0, 0, 0, 0, 1, 1, 0.85, limbEnd);
    }
    // head + face (look shifts the pupils)
    const hy = 1.12 + bob, [lx, ly] = p.look || [0, 0];
    const hb = new THREE.Matrix4().compose(v.set(0, hy, 0), q.setFromEuler(e.set(p.headX ?? 0, p.headY ?? 0, p.headZ ?? 0)), s.set(1, 1, 1)).premultiply(base);
    put(meshes.head, i, 0, 0, 0, 0, 0, 0, 1, 1, 1, hb);
    if (P.bald) put(meshes.hair, i, 0, 0, 0, 0, 0, 0, 0, 0, 0, hb); else put(meshes.hair, i, 0, 0.004, -0.01, -0.25, 0, 0, 1, 1, 1, hb);
    for (const [k, sx] of [[0, -1], [1, 1]]) {
      put(meshes.white, i * 2 + k, sx * 0.1, 0.045, 0.21, -0.14, sx * 0.38, 0, 0.9 * (p.wide ? 1.2 : 1), 1.12 * (p.wide ? 1.2 : 1), 0.55, hb);
      put(meshes.pupil, i * 2 + k, sx * 0.1 + lx * 0.028 + sx * 0.012, 0.045 + ly * 0.03, 0.262, 0, sx * 0.38, 0, 1, 1.1, 0.5, hb);
    }
    put(meshes.mouth, i, 0, -0.11, 0.245, -0.4, 0, PI / 2, p.mouthW ?? 1, 1, 1, hb);
    // phone held up at the face / a score card above the head
    if (p.phone) put(meshes.phone, i, 0.0, 0.0, 0.42, -0.25, 0, 0, 1, 1, 1, hb); else meshes.phone.setMatrixAt(i, ZERO);
    cardMeshes.forEach((cm, c) => { if (p.card && c === P.card) { const u = p.cardUp ?? 1; put(cm, i, 0, 0.25 + 0.45 * u, 0.3, -0.1, 0, Math.sin((p.t ?? 0) * 3 + P.ph) * 0.08, u, u, u, hb); } else cm.setMatrixAt(i, ZERO); });
  }
  function commit() { for (const k in meshes) { meshes[k].instanceMatrix.needsUpdate = true; if (meshes[k].instanceColor) meshes[k].instanceColor.needsUpdate = true; } for (const cm of cardMeshes) cm.instanceMatrix.needsUpdate = true; }
  function hideAll() { for (let i = 0; i < n; i++) hide(i); }
  function setGlow(k) { M.phone.emissiveIntensity = k; }
  hideAll(); commit();
  return { n, people, meshes, set, hide, hideAll, commit, setGlow, M };
}

/** Instanced striped canopies + suspension lines. set(i, canopy [x,y,z], body [x,y,z], open 0..1, swayZ) */
export function makeChutes(parent, n, { seed = 3 } = {}) {
  const R = rng(seed), cols = [0xff5a5f, 0x2ec4b6, 0xffb703, 0x8e7dff, 0x3a86ff, 0xff8fab, 0x06d6a0, 0xf77f00, 0xe63946, 0x48cae4];
  const stripe = tex(256, 64, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#d8d8d8'; c.fillRect((k * w) / 8, 0, w / 8 + 1, h); } c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, h - 6, w, 6); });
  const geo = new THREE.SphereGeometry(1, 24, 8, 0, TAU, 0, PI * 0.42); geo.translate(0, -Math.cos(PI * 0.42), 0);
  const can = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.7, side: THREE.DoubleSide }), n); can.frustumCulled = false; can.castShadow = true;
  can.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  const C = new THREE.Color(); for (let i = 0; i < n; i++) can.setColorAt(i, C.setHex(cols[Math.floor(R() * cols.length)]));
  const line = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4).translate(0, 0.5, 0), std(0xeeeeee, 0.6), n * 4); line.frustumCulled = false;
  parent.add(can, line);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), ZERO = new THREE.Matrix4().makeScale(0, 0, 0), E = new THREE.Euler();
  function set(i, c, b, open = 1, sway = 0) {
    if (!c || open <= 0.001) { can.setMatrixAt(i, ZERO); for (let k = 0; k < 4; k++) line.setMatrixAt(i * 4 + k, ZERO); return; }
    const r = 0.25 + 1.05 * open, h = 0.25 + 0.55 * open;
    M4.compose(V.set(...c), Q.setFromEuler(E.set(0, 0, sway)), S.set(r, h, r)); can.setMatrixAt(i, M4);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + PI / 4; A.set(c[0] + Math.cos(a) * r * 0.9, c[1] - 0.05, c[2] + Math.sin(a) * r * 0.9); B.set(b[0] + (k % 2 ? 0.15 : -0.15), b[1], b[2]);
      const d = A.clone().sub(B), L = d.length(); Q.setFromUnitVectors(UP, d.normalize()); M4.compose(B, Q, S.set(1, L, 1)); line.setMatrixAt(i * 4 + k, M4);
    }
  }
  function commit() { can.instanceMatrix.needsUpdate = true; line.instanceMatrix.needsUpdate = true; }
  for (let i = 0; i < n; i++) set(i, null); commit();
  return { set, commit, can, line };
}

/** Elimination beams: a column of light that lifts a player to the blimp. set(i, x, y, z, k 0..1) */
export function makeBeams(parent, n) {
  const t = tex(32, 256, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const geo = new THREE.CylinderGeometry(0.75, 0.75, 1, 24, 1, true).translate(0, 0.5, 0);
  const m = new THREE.MeshBasicMaterial({ map: t, color: 0xfff1b8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; im.renderOrder = 6;
  im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  const core = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.22, 1, 12, 1, true).translate(0, 0.5, 0), m.clone(), n); core.frustumCulled = false; core.renderOrder = 6; core.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  parent.add(im, core);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function set(i, x, y, z, k, H = 70, r = 1) {
    if (k <= 0.001) { im.setMatrixAt(i, ZERO); core.setMatrixAt(i, ZERO); return; }
    const w = r * (0.4 + 0.6 * clamp(k * 2));
    M4.compose(V.set(x, y, z), Q, S.set(w, H, w)); im.setMatrixAt(i, M4); im.setColorAt(i, C.setScalar(0.2 * k));
    M4.compose(V.set(x, y, z), Q, S.set(w, H, w)); core.setMatrixAt(i, M4); core.setColorAt(i, C.setScalar(0.42 * k));
  }
  function commit() { for (const o of [im, core]) { o.instanceMatrix.needsUpdate = true; o.instanceColor.needsUpdate = true; } }
  for (let i = 0; i < n; i++) set(i, 0, 0, 0, 0); commit();
  return { set, commit, im, core };
}

/** Cargo plane: nose +x, length ~16 m; the rear ramp (`ramp`) hinges at the tail floor (rotation.z +0.6 = open); update(t) spins the props. */
export function makePlane() {
  const g = new THREE.Group(), body = std(0x4d7fc2, 0.45), white = std(0xf2f4f6, 0.45), yel = std(0xffc93c, 0.45), dark = std(0x1d232b, 0.4), glass = std(0x1a2f4a, 0.1, { metalness: 0.4 });
  const fus = mk(new THREE.CylinderGeometry(1.25, 1.25, 10, 24), body, g, 0, 0, 0); fus.rotation.z = PI / 2;
  const tail = mk(new THREE.CylinderGeometry(0.5, 1.25, 3.4, 20), body, g, -6.6, 0.35, 0); tail.rotation.z = PI / 2 - 0.2;
  mk(new THREE.CylinderGeometry(1.27, 1.27, 2.2, 20, 1, true), white, g, 1.5, 0, 0).rotation.z = PI / 2;
  const nose = mk(new THREE.SphereGeometry(1.26, 20, 14, 0, TAU, 0, PI / 2), yel, g, 5.0, 0, 0); nose.rotation.z = -PI / 2;
  const wind = mk(new THREE.BoxGeometry(0.8, 0.45, 1.5), glass, g, 5.55, 0.78, 0); wind.rotation.z = -0.55;
  for (let k = 0; k < 7; k++) mk(new THREE.CircleGeometry(0.2, 14), glass, g, 4 - k * 1.25, 0.35, 1.26);
  mk(new THREE.BoxGeometry(3.0, 0.25, 19), body, g, 1.0, 1.0, 0);   // high wing
  const props = [];
  for (const z of [-6.2, -3.2, 3.2, 6.2]) { mk(new THREE.CylinderGeometry(0.42, 0.36, 2.2, 14), white, g, 1.9, 0.75, z).rotation.z = PI / 2; const p = new THREE.Group(); p.position.set(3.05, 0.75, z); g.add(p); for (let b = 0; b < 4; b++) { const bl = mk(new THREE.BoxGeometry(0.06, 1.5, 0.18), dark, p, 0, 0, 0); bl.rotation.x = (b / 4) * PI; } mk(new THREE.SphereGeometry(0.18, 10, 8), yel, p, 0.08, 0, 0); props.push(p); }
  const fin = mk(new THREE.BoxGeometry(2.6, 3.0, 0.22), body, g, -7.0, 2.4, 0); fin.rotation.z = 0.35;
  mk(new THREE.BoxGeometry(2.2, 0.18, 7.5), body, g, -7.4, 1.6, 0);
  // the open back: a dark hole + the ramp
  const hole = mk(new THREE.PlaneGeometry(2.4, 1.7), new THREE.MeshBasicMaterial({ color: 0x0c0f14, side: THREE.DoubleSide }), g, -6.2, -0.7, 0); hole.rotation.set(PI / 2, 0.42, PI / 2);
  const ramp = new THREE.Group(); ramp.position.set(-5.2, -1.15, 0); g.add(ramp); mk(new THREE.BoxGeometry(2.6, 0.12, 2.0), std(0x3d6aa8, 0.5), ramp, -1.3, 0, 0);
  const update = (t) => props.forEach((p, i) => (p.rotation.x = t * 38 + i));
  return { g, ramp, update, props };
}

/** The SPECTATORS blimp: envelope ~22 m along x, a big band with SPECTATORS on both sides, fins, and an open-front grandstand
 *  gondola facing +z under it (4 stepped rows of 16 seats; `seats` are local [x, y, z] of each seat surface). */
export function makeBlimp() {
  const g = new THREE.Group(), env = std(0xe9ecef, 0.45), red = std(0xe63946, 0.5), dark = std(0x2a2f36, 0.5), wood = std(0x9a6b42, 0.75);
  const pts = []; for (let k = 0; k <= 32; k++) { const u = k / 32, x = -11 + 22 * u, r = 4.2 * Math.sqrt(Math.max(0, 1 - ((x - 1.5) / 12.5) ** 2)) * (x < 1.5 ? 1 - 0.18 * ((1.5 - x) / 12.5) ** 1.5 : 1); pts.push(new THREE.Vector2(Math.max(0.02, r), x)); }
  const lathe = new THREE.LatheGeometry(pts, 40); lathe.rotateZ(-PI / 2);
  const envelope = mk(lathe, env, g, 0, 0, 0);
  // the red belly band follows the envelope (a second lathe over x −6…6); the text runs ALONG the hull on both sides (u = around, v = along)
  const band = tex(2048, 1024, (c, w, h) => {
    c.fillStyle = '#e63946'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, 26); c.fillRect(0, h - 26, w, 26);
    c.fillStyle = '#ffffff'; c.font = '150px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const [cx, rot] of [[w / 2, -PI / 2], [0, PI / 2], [w, PI / 2]]) { c.save(); c.translate(cx, h / 2); c.rotate(rot); c.fillText('SPECTATORS', 0, 14); c.restore(); }
  });
  const bpts = pts.filter((p) => p.y >= -6.2 && p.y <= 6.2).map((p) => new THREE.Vector2(p.x * 1.012, p.y));
  const bandGeo = new THREE.LatheGeometry(bpts, 64, PI, TAU); bandGeo.rotateZ(-PI / 2);
  mk(bandGeo, std(0xffffff, 0.5, { map: band }), g, 0, 0, 0);
  for (const [ry, rx] of [[0, 0], [0, PI / 2], [0, PI], [0, -PI / 2]]) { const f = new THREE.Group(); f.rotation.x = rx; f.position.x = -9.2; g.add(f); const fin = mk(new THREE.BoxGeometry(3.0, 2.6, 0.15), red, f, 0, 2.6, 0); fin.rotation.z = -0.25; }
  // grandstand gondola (open front, +z)
  const gond = new THREE.Group(); gond.position.set(0.5, -6.2, 0); g.add(gond);
  const Wd = 12.6, Dd = 4.2, Hd = 3.2;
  mk(new THREE.BoxGeometry(Wd, 0.25, Dd), dark, gond, 0, -Hd / 2, 0);
  mk(new THREE.BoxGeometry(Wd, Hd, 0.2), dark, gond, 0, 0, -Dd / 2);
  mk(new THREE.BoxGeometry(Wd, 0.25, Dd), dark, gond, 0, Hd / 2, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.2, Hd, Dd), dark, gond, s * Wd / 2, 0, 0);
  for (const s of [-1, 1]) for (const z of [-1.2, 1.2]) mk(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), dark, gond, s * 5, Hd / 2 + 1.6, z);   // struts up to the envelope
  const seats = [], rows = 4, cols = 16;
  for (let r = 0; r < rows; r++) {
    const y = -Hd / 2 + 0.12 + r * 0.42, z = Dd / 2 - 0.55 - r * 0.85;
    mk(new THREE.BoxGeometry(Wd - 0.4, 0.42 * (r + 1), 0.85), wood, gond, 0, -Hd / 2 + 0.12 + 0.21 * (r + 1), z - 0.0);
    for (let c = 0; c < cols; c++) seats.push([-Wd / 2 + 0.55 + c * ((Wd - 1.1) / (cols - 1)), -Hd / 2 + 0.12 + 0.42 * (r + 1), z + 0.1]);
  }
  mk(new THREE.BoxGeometry(Wd, 0.08, 0.08), std(0xffd23f, 0.4), gond, 0, -Hd / 2 + 0.95, Dd / 2);   // front rail
  for (let c = 0; c <= 12; c++) mk(new THREE.BoxGeometry(0.06, 0.85, 0.06), std(0xffd23f, 0.4), gond, -Wd / 2 + c * Wd / 12, -Hd / 2 + 0.55, Dd / 2);
  // under-lights + spotlights (cones aimed down/forward, opacity per shot)
  const spotM = new THREE.MeshBasicMaterial({ map: tex(32, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,.9)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }), color: 0xfff3c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const spots = [-3.5, 3.5].map((x) => { const sp = new THREE.Group(); sp.position.set(x, -Hd / 2 - 0.2, Dd / 2 - 0.3); gond.add(sp); const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 2.4, 1, 24, 1, true).translate(0, -0.5, 0), spotM); cone.renderOrder = 7; sp.add(cone); mk(new THREE.CylinderGeometry(0.3, 0.22, 0.4, 12), dark, sp, 0, 0.1, 0); return { sp, cone }; });
  const aimSpots = (targetWorld, len = 14) => { for (const s of spots) { s.sp.updateWorldMatrix(true, false); const p = new THREE.Vector3().setFromMatrixPosition(s.sp.matrixWorld); const d = targetWorld.clone().sub(p); const L = d.length(); s.cone.scale.set(1, L, 1); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); const pq = new THREE.Quaternion(); s.sp.parent.getWorldQuaternion(pq); s.cone.quaternion.copy(pq.invert().multiply(q)); } };
  return { g, gond, seats, envelope, spotM, spots, aimSpots, Hd, Dd };
}

export function cantaloupeTex() {
  return tex(512, 256, (c, w, h) => {
    c.fillStyle = '#d9c27a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(160,190,90,.35)'; c.fillRect((i * w) / 9, 0, 10, h); }
    c.strokeStyle = 'rgba(250,244,220,.95)'; c.lineWidth = 3;
    let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 340; k++) { const x = r() * w, y = r() * h, a = r() * TAU, L = 14 + r() * 16; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.6) * L * 0.6, y + Math.sin(a + 0.6) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); }
  });
}

/** Supply drop: a 1.2 m crate (FRAGILE / SUPPLY DROP stencils), a big striped parachute, panels that blow off (`burst(k)`), a velvet
 *  pillow with two cantaloupes inside. Origin = the crate's floor centre. */
export function makeCrate() {
  const g = new THREE.Group(), S = 1.2;
  const plank = tex(512, 512, (c, w, h) => { c.fillStyle = '#b07a46'; c.fillRect(0, 0, w, h); for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#a06c3b' : '#b8824c'; c.fillRect(0, k * h / 6, w, h / 6 - 6); c.fillStyle = 'rgba(60,35,15,.6)'; c.fillRect(0, (k + 1) * h / 6 - 6, w, 6); } c.strokeStyle = '#6b4424'; c.lineWidth = 34; c.strokeRect(17, 17, w - 34, h - 34); c.beginPath(); c.moveTo(30, 30); c.lineTo(w - 30, h - 30); c.stroke(); });
  const stencil = (txt, col = '#c1121f') => tex(512, 512, (c, w, h) => { c.drawImage(plank.image, 0, 0); c.save(); c.translate(w / 2, h / 2); c.rotate(-0.12); c.fillStyle = col; c.font = '96px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 10); c.restore(); });
  const plainM = std(0xffffff, 0.8, { map: plank }), fragM = std(0xffffff, 0.8, { map: stencil('FRAGILE') }), supM = std(0xffffff, 0.8, { map: stencil('SUPPLY', '#1d3557') });
  const box = new THREE.Group(); g.add(box);
  mk(new THREE.BoxGeometry(S, 0.08, S), plainM, box, 0, 0.04, 0);
  const panels = [];
  const panel = (w, h, m, x, y, z, ry, axis) => { const p = new THREE.Group(); p.position.set(x, y, z); box.add(p); const b = mk(new THREE.BoxGeometry(w, h, 0.07), m, p, 0, 0, 0); p.rotation.y = ry; panels.push({ p, x, y, z, ry, axis }); return p; };
  panel(S, S, fragM, 0, S / 2, S / 2, 0, [0, 0, 1]); panel(S, S, supM, 0, S / 2, -S / 2, PI, [0, 0, -1]); panel(S, S, plainM, S / 2, S / 2, 0, PI / 2, [1, 0, 0]); panel(S, S, fragM, -S / 2, S / 2, 0, -PI / 2, [-1, 0, 0]);
  const lid = new THREE.Group(); lid.position.set(0, S, 0); box.add(lid); mk(new THREE.BoxGeometry(S + 0.06, 0.08, S + 0.06), plainM, lid, 0, 0.04, 0); panels.push({ p: lid, x: 0, y: S, z: 0, ry: 0, axis: [0, 1, 0], lid: true });
  // inside: velvet pillow + two cantaloupes + a glow
  const inside = new THREE.Group(); g.add(inside);
  const pil = mk(new THREE.SphereGeometry(0.5, 20, 12), std(0xa4161a, 0.5), inside, 0, 0.18, 0); pil.scale.set(1.05, 0.28, 0.85);
  mk(new THREE.TorusGeometry(0.46, 0.035, 8, 32), std(0xffc93c, 0.3, { metalness: 0.6 }), inside, 0, 0.2, 0).rotation.x = PI / 2;
  const ct = cantaloupeTex(), melons = [-0.24, 0.24].map((x) => { const m = mk(new THREE.SphereGeometry(0.25, 28, 20), std(0xffffff, 0.75, { map: ct }), inside, x, 0.46, 0.02); m.scale.set(1, 0.96, 1); m.rotation.z = x > 0 ? -0.3 : 0.3; return m; });
  const glowT = tex(128, 128, (c, w) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(0.4, 'rgba(255,220,120,.4)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false })); glow.position.set(0, 0.55, -0.1); glow.scale.setScalar(2.4); inside.add(glow);
  // parachute (one big canopy) + 4 lines to the crate corners
  const chute = new THREE.Group(); g.add(chute);
  const stripes = tex(512, 64, (c, w, h) => { for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#e63946'; c.fillRect((k * w) / 12, 0, w / 12 + 1, h); } });
  const cgeo = new THREE.SphereGeometry(2.6, 32, 10, 0, TAU, 0, PI * 0.4); cgeo.translate(0, -2.6 * Math.cos(PI * 0.4), 0);
  const canopy = mk(cgeo, std(0xffffff, 0.7, { map: stripes, side: THREE.DoubleSide }), chute, 0, 4.6, 0); canopy.scale.y = 0.6;
  const lines = [];
  for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + PI / 4, A = new THREE.Vector3(Math.cos(a) * 2.3, 4.55, Math.sin(a) * 2.3), B = new THREE.Vector3((k % 3 ? 0.5 : -0.5) * 1.1, S, (k < 2 ? 0.5 : -0.5) * 1.1); const d = A.clone().sub(B); const l = mk(new THREE.CylinderGeometry(0.015, 0.015, d.length(), 4), std(0xeeeeee), chute, 0, 0, 0); l.position.copy(A).add(B).multiplyScalar(0.5); l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); lines.push(l); }
  /** k 0..1+: panels fly outward + up and spin (seconds since the burst ≈ k) */
  function burst(k) {
    for (const P of panels) {
      if (k <= 0) { P.p.position.set(P.x, P.y, P.z); P.p.rotation.set(0, P.ry, 0); continue; }
      const [ax, , az] = P.axis, sp = P.lid ? 0 : 4.5, up = P.lid ? 7 : 3.2;
      P.p.position.set(P.x + ax * sp * k, P.y + up * k - 4.9 * k * k + (P.lid ? 0 : 0), P.z + az * sp * k);
      P.p.rotation.set(P.ry === 0 || P.ry === PI ? (az || 1) * 2.6 * k : 0, P.ry, P.ry === 0 || P.ry === PI ? 0 : -(ax || 1) * 2.6 * k);
      if (P.lid) P.p.rotation.set(3.2 * k, 0, 1.4 * k);
    }
  }
  return { g, box, panels, lid, inside, melons, glow, chute, canopy, burst };
}

/** Round wire-rim glasses (the professor). Parent to a toon head at (0, 0.045, 0.255). */
export function makeSpecs() {
  const g = new THREE.Group(), m = std(0x3a2a1c, 0.4, { metalness: 0.3 }), lens = new THREE.MeshStandardMaterial({ color: 0xdff2ff, roughness: 0.05, transparent: true, opacity: 0.25 });
  for (const s of [-1, 1]) { mk(new THREE.TorusGeometry(0.075, 0.011, 6, 24), m, g, s * 0.1, 0, 0); mk(new THREE.CircleGeometry(0.075, 20), lens, g, s * 0.1, 0, 0).castShadow = false; }
  mk(new THREE.BoxGeometry(0.06, 0.012, 0.012), m, g, 0, 0.01, 0);
  return g;
}
