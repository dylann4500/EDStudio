// sim style props for "upgrade my room" reels — realistic-ish, real materials (engine/sim/mats.js), each with a tiny API.
//   makeMiniFridge()   → { g, setDoor(rad), light }            origin: floor centre; door hinge on its left edge, opens toward +z
//   makeCan(color), makeChips(color), makePizzaBox(), makeBurgerBag()            hand-held things (origin = centre)
//   makePhone()        → { g, screen }                          a phone (screen = a mesh you can map)
//   makeLaptop(tex)    → { g, lid, setOpen(k) }                 origin: base centre; screen faces +z when open (tex = canvas texture)
//   makeRope(a, b)     → { set(a, b, sag) }                     a rope between two world points (a catenary-ish curve tube)
//   makePulley(r)      → Group                                  a ceiling pulley wheel in a bracket
//   makeBedDesk()      → { g, arm, top, setSwing(k) }           a swing-arm over-bed table on a floor post (k 0 parked → 1 over the lap)
//   makeChute(points, { r }) → { g, curve, at(u) }              an open stainless half-pipe along a curve (snack chute / slide)
//   makeRobotArm()     → { g, set({ yaw, a1, a2, a3, grip }), tip } a white 3-joint arm on a round base
//   makeDrone()        → { g, update(t, spin), hook }           a quadcopter (props spin), `hook` = where a payload hangs
//   makePrinter()      → { g, setPaper(k) }                     a small inkjet; setPaper slides a sheet out of the front
//   makeRails(len)     → Group                                  a pair of floor rails along x (the bed that drives)
//   makeGrassBox(len)  → Group                                  a window box of grass
//   makePaper(tex)     → Mesh                                   a letter-size sheet (0.216 × 0.279) with a texture
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { simMat } from './mats.js';
import { rng } from '../core.js';

const PI = Math.PI;
function m(geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; }
const rb = (w, h, d, r, mat, parent, x, y, z) => m(new RoundedBoxGeometry(w, h, d, 3, r), mat, parent, x, y, z);
const cy = (r0, r1, h, mat, parent, x, y, z, seg = 20) => m(new THREE.CylinderGeometry(r0, r1, h, seg), mat, parent, x, y, z);
function labelTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

export function makeMiniFridge(o = {}) {
  const g = new THREE.Group(), body = simMat('plastic', { color: o.color ?? 0xf0efec, rough: 0.35 }), dark = simMat('plastic', { color: 0x2a2b2e, rough: 0.6 });
  const W = 0.48, Hh = 0.62, Dd = 0.5;
  // a box open at the front (5 walls) so the inside shows when the door opens
  m(new THREE.BoxGeometry(W, 0.03, Dd), body, g, 0, 0.015 + 0.03, 0); m(new THREE.BoxGeometry(W, 0.03, Dd), body, g, 0, Hh - 0.015, 0);
  for (const s of [-1, 1]) m(new THREE.BoxGeometry(0.03, Hh, Dd), body, g, s * (W / 2 - 0.015), Hh / 2, 0);
  m(new THREE.BoxGeometry(W, Hh, 0.03), body, g, 0, Hh / 2, -Dd / 2 + 0.015);
  m(new THREE.BoxGeometry(W - 0.06, Hh - 0.06, 0.01), simMat('white', { color: 0xf7f7f4 }), g, 0, Hh / 2, -Dd / 2 + 0.035, false);
  m(new THREE.BoxGeometry(W - 0.06, 0.01, Dd - 0.06), simMat('glass', { opacity: 0.4 }), g, 0, 0.3, 0.0, false);
  for (const s of [-1, 1]) cy(0.012, 0.012, 0.03, dark, g, s * 0.2, 0.012, s * 0.2);
  const door = new THREE.Group(); door.position.set(-W / 2, 0, Dd / 2); g.add(door);
  rb(W, Hh - 0.02, 0.04, 0.012, body, door, W / 2, Hh / 2, 0.02);
  cy(0.008, 0.008, 0.22, simMat('chrome'), door, W - 0.05, Hh * 0.62, 0.05);
  m(new THREE.BoxGeometry(W - 0.08, 0.02, 0.05), simMat('plastic', { color: 0xdcdcd8 }), door, W / 2, 0.42, -0.03);   // door shelf
  const light = new THREE.PointLight(0xe8f4ff, 0, 1.2, 2); light.position.set(0, Hh - 0.1, 0.05); g.add(light);
  // drinks inside: two rows of cans
  const R = rng(6); for (let i = 0; i < 6; i++) { const c = makeCan([0xc8322c, 0x2f6fb5, 0xe8b12a, 0x3a9a55][i % 4]); c.position.set(-0.15 + (i % 3) * 0.15, i < 3 ? 0.11 : 0.38, -0.08 + (R() - 0.5) * 0.04); g.add(c); }
  return { g, door, light, setDoor: (a) => { door.rotation.y = -a; light.intensity = Math.min(1, a) * 0.6; } };
}

export function makeCan(color = 0xc8322c) {
  const g = new THREE.Group();
  const t = labelTex(128, 64, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(color).getHexString(); c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(0, h * 0.42, w, h * 0.16); c.beginPath(); c.arc(w * 0.25, h * 0.5, h * 0.18, 0, 7); c.fill(); });
  m(new THREE.CylinderGeometry(0.033, 0.033, 0.122, 18), new THREE.MeshStandardMaterial({ map: t, roughness: 0.3, metalness: 0.5 }), g, 0, 0, 0);
  m(new THREE.CylinderGeometry(0.03, 0.033, 0.008, 18), simMat('steel'), g, 0, 0.065, 0);
  return g;
}
export function makeChips(color = 0xe7a61c) {
  const g = new THREE.Group(), geo = new THREE.BoxGeometry(0.2, 0.28, 0.07, 6, 6, 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 - Math.pow(Math.abs(y) / 0.14, 4); p.setZ(i, z * Math.max(0.1, k)); }
  geo.computeVertexNormals();
  const t = labelTex(128, 180, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(color).getHexString(); c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '800 30px Inter, Arial'; c.textAlign = 'center'; c.fillText('CRUNCH', w / 2, h * 0.38); c.fillStyle = '#f6d36b'; c.beginPath(); c.ellipse(w / 2, h * 0.65, 34, 24, 0.3, 0, 7); c.fill(); });
  m(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.2 }), g, 0, 0, 0);
  return g;
}
export function makePizzaBox() { const g = new THREE.Group(); rb(0.36, 0.05, 0.36, 0.005, simMat('lumber', { color: 0xc8a272 }), g, 0, 0, 0); const t = labelTex(128, 128, (c, w, h) => { c.fillStyle = '#c8a272'; c.fillRect(0, 0, w, h); c.fillStyle = '#b3261e'; c.font = '800 26px Inter, Arial'; c.textAlign = 'center'; c.fillText('PIZZA', w / 2, h / 2 + 8); }); const top = m(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }), g, 0, 0.026, 0, false); top.rotation.x = -PI / 2; return g; }

export function makePhone() {
  const g = new THREE.Group();
  rb(0.075, 0.155, 0.009, 0.008, simMat('plastic', { color: 0x1b1c1f, rough: 0.25 }), g, 0, 0, 0);
  const screen = m(new THREE.PlaneGeometry(0.066, 0.142), new THREE.MeshBasicMaterial({ color: 0x9ccaf0, toneMapped: false }), g, 0, 0, 0.0047, false);
  return { g, screen };
}

export function makeLaptop(tex, o = {}) {
  const g = new THREE.Group(), al = simMat('metal', { color: o.color ?? 0xb9bcc1, rough: 0.35 });
  const W = 0.34, Dd = 0.235;
  rb(W, 0.016, Dd, 0.006, al, g, 0, 0.008, 0);
  m(new THREE.PlaneGeometry(W - 0.04, Dd * 0.45), simMat('plastic', { color: 0x1e1f22, rough: 0.6 }), g, 0, 0.0165, -0.03, false).rotation.x = -PI / 2;
  m(new THREE.PlaneGeometry(0.1, 0.06), simMat('plastic', { color: 0xa9adb3, rough: 0.4 }), g, 0, 0.0165, 0.07, false).rotation.x = -PI / 2;
  const lid = new THREE.Group(); lid.position.set(0, 0.016, -Dd / 2); g.add(lid);
  rb(W, Dd, 0.008, 0.006, al, lid, 0, Dd / 2, -0.004);
  const scr = m(new THREE.PlaneGeometry(W - 0.024, Dd - 0.03), tex ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshBasicMaterial({ color: 0x111111 }), lid, 0, Dd / 2 + 0.004, 0.0005, false);
  return { g, lid, screen: scr, setOpen: (k) => { lid.rotation.x = -(1 - k) * 1.62 + 0.0 * k - 0.22 * k; } };
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3();
export function makeRope(o = {}) {
  const mat = simMat('fabric', { color: o.color ?? 0xcdb48c, rough: 1 }), r = o.r ?? 0.008;
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); mesh.castShadow = true; mesh.frustumCulled = false;
  function set(a, b, sag = 0.1) {
    _a.set(...a); _b.set(...b);
    const mid = _a.clone().lerp(_b, 0.5); mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(_a.clone(), mid, _b.clone());
    mesh.geometry.dispose(); mesh.geometry = new THREE.TubeGeometry(curve, 24, r, 6, false);
  }
  return { mesh, set };
}
export function makePulley(r = 0.07) {
  const g = new THREE.Group(), met = simMat('metal', { color: 0x8c9096 });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 8, 24), met); wheel.castShadow = true; g.add(wheel);
  cy(0.012, 0.012, 0.06, met, g, 0, 0, 0).rotation.x = PI / 2;
  for (const s of [-1, 1]) { const p = m(new THREE.BoxGeometry(0.012, r * 2 + 0.06, 0.012), met, g, 0, r * 0.5, s * 0.03); }
  m(new THREE.BoxGeometry(0.06, 0.012, 0.08), met, g, 0, r * 1.55, 0);
  g.wheel = wheel; return g;
}

export function makeBedDesk() {
  const g = new THREE.Group(), met = simMat('metal', { color: 0x9da2a8 }), wood = simMat('wood', { color: 0xb88a5c, rough: 0.6 });
  rb(0.5, 0.03, 0.5, 0.01, met, g, 0, 0.015, 0);
  cy(0.025, 0.025, 0.8, met, g, 0, 0.42, 0);
  const arm = new THREE.Group(); arm.position.y = 0.82; g.add(arm);
  cy(0.03, 0.03, 0.06, met, arm, 0, 0, 0);
  m(new THREE.BoxGeometry(0.05, 0.035, 0.7), met, arm, 0, 0.02, 0.35);
  const top = new THREE.Group(); top.position.set(0, 0.04, 0.62); arm.add(top);
  rb(0.75, 0.025, 0.42, 0.01, wood, top, 0, 0.013, 0);
  return { g, arm, top, setSwing: (k) => { arm.rotation.y = (1 - k) * -1.5; } };
}

/** An open stainless half-pipe (snack chute) along world points; `at(u)` = a point on the trough floor. */
export function makeChute(pts, o = {}) {
  const r = o.r ?? 0.13, n = o.seg ?? 120, ring = 14, curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.3);
  const fr = curve.computeFrenetFrames(n, false), pos = [], idx = [], up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(), dn = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const u = i / n, c = curve.getPointAt(u), T = curve.getTangentAt(u);
    side.crossVectors(T, up).normalize(); dn.crossVectors(side, T).normalize().negate();   // dn = the trough's "down" (perp. to T, toward −y)
    for (let j = 0; j <= ring; j++) { const a = PI * (j / ring); const v = c.clone().addScaledVector(side, Math.cos(a) * r).addScaledVector(dn, Math.sin(a) * r); pos.push(v.x, v.y, v.z); }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < ring; j++) { const a = i * (ring + 1) + j, b = a + ring + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const mat = simMat('steel', { color: 0xd8dbdf, side: THREE.DoubleSide, rough: 0.28 });
  const g = new THREE.Group(); const mesh = m(geo, mat, g); mesh.frustumCulled = false;
  // rolled lips along both edges
  for (const s of [-1, 1]) { const lip = []; for (let i = 0; i <= 60; i++) { const u = i / 60, c = curve.getPointAt(u), T = curve.getTangentAt(u); side.crossVectors(T, up).normalize(); lip.push(c.clone().addScaledVector(side, s * r)); } m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lip), 80, 0.012, 6), mat, g); }
  const at = (u) => { const c = curve.getPointAt(Math.min(1, Math.max(0, u))), T = curve.getTangentAt(Math.min(1, Math.max(0, u))); side.crossVectors(T, up).normalize(); dn.crossVectors(side, T).normalize().negate(); return c.addScaledVector(dn, r * 0.7); };
  return { g, curve, at, mesh };
}

export function makeRobotArm(o = {}) {
  const g = new THREE.Group(), wht = simMat('plastic', { color: o.color ?? 0xeeeeea, rough: 0.35 }), dk = simMat('plastic', { color: 0x2b2d31, rough: 0.5 }), acc = simMat('plastic', { color: o.accent ?? 0xe0702c, rough: 0.4 });
  const L1 = o.l1 ?? 0.42, L2 = o.l2 ?? 0.38;
  cy(0.12, 0.14, 0.08, dk, g, 0, 0.04, 0, 28);
  const yaw = new THREE.Group(); yaw.position.y = 0.08; g.add(yaw);
  cy(0.09, 0.1, 0.12, wht, yaw, 0, 0.06, 0, 24);
  const sh = new THREE.Group(); sh.position.y = 0.16; yaw.add(sh);
  m(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 20), acc, sh, 0, 0, 0).rotation.z = PI / 2;
  rb(0.085, L1, 0.085, 0.035, wht, sh, 0, L1 / 2, 0);
  const el = new THREE.Group(); el.position.y = L1; sh.add(el);
  m(new THREE.CylinderGeometry(0.05, 0.05, 0.11, 18), acc, el, 0, 0, 0).rotation.z = PI / 2;
  rb(0.07, L2, 0.07, 0.03, wht, el, 0, L2 / 2, 0);
  const wr = new THREE.Group(); wr.position.y = L2; el.add(wr);
  m(new THREE.SphereGeometry(0.04, 16, 12), dk, wr);
  const hand = new THREE.Group(); hand.position.y = 0.04; wr.add(hand);
  rb(0.08, 0.05, 0.05, 0.015, wht, hand, 0, 0.025, 0);
  const fingers = [-1, 1].map((s) => { const f = new THREE.Group(); f.position.set(s * 0.028, 0.05, 0); hand.add(f); rb(0.015, 0.07, 0.03, 0.006, dk, f, 0, 0.035, 0); return f; });
  const tip = new THREE.Object3D(); tip.position.y = 0.1; hand.add(tip);
  function set(q = {}) { yaw.rotation.y = q.yaw ?? 0; sh.rotation.x = q.a1 ?? 0; el.rotation.x = q.a2 ?? 0; wr.rotation.x = q.a3 ?? 0; hand.rotation.y = q.roll ?? 0; const gr = q.grip ?? 0; fingers.forEach((f, i) => { f.position.x = (i ? 1 : -1) * (0.028 - 0.016 * gr); }); }
  set({});
  return { g, set, tip, hand, L1, L2 };
}

export function makeDrone(o = {}) {
  const g = new THREE.Group(), body = simMat('plastic', { color: o.color ?? 0xf1f1ee, rough: 0.3 }), dk = simMat('plastic', { color: 0x222326, rough: 0.5 });
  rb(0.22, 0.07, 0.3, 0.03, body, g, 0, 0, 0);
  m(new THREE.SphereGeometry(0.03, 12, 8), dk, g, 0, -0.02, 0.15);
  const props = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const arm = m(new THREE.BoxGeometry(0.025, 0.02, 0.24), dk, g, sx * 0.13, 0.0, sz * 0.12); arm.rotation.y = sx * sz * 0.8;
    const hub = new THREE.Group(); hub.position.set(sx * 0.2, 0.04, sz * 0.2); g.add(hub);
    cy(0.02, 0.02, 0.04, dk, hub, 0, -0.02, 0);
    const rotor = new THREE.Group(); hub.add(rotor);
    for (const k of [0, 1]) { const b = m(new THREE.BoxGeometry(0.2, 0.004, 0.022), dk, rotor, 0, 0.005, 0, false); b.rotation.y = k * PI / 2 * 0; b.rotation.y = k * PI; }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.18, depthWrite: false })); disc.rotation.x = -PI / 2; disc.position.y = 0.006; hub.add(disc);
    props.push(rotor);
    m(new THREE.BoxGeometry(0.012, 0.08, 0.012), dk, g, sx * 0.08, -0.07, sz * 0.1);
  }
  const hook = new THREE.Object3D(); hook.position.y = -0.12; g.add(hook);
  const led = m(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0x46e07a, toneMapped: false }), g, 0, 0.0, -0.152, false);
  return { g, hook, props, update(t, spin = 1) { props.forEach((p, i) => { p.rotation.y = t * 60 * spin * (i % 2 ? 1 : -1); }); g.position.y += 0; } };
}

export function makePrinter() {
  const g = new THREE.Group(), body = simMat('plastic', { color: 0x2e3034, rough: 0.45 }), lt = simMat('plastic', { color: 0x4a4d52, rough: 0.4 });
  rb(0.42, 0.16, 0.32, 0.02, body, g, 0, 0.08, 0);
  rb(0.36, 0.012, 0.16, 0.004, lt, g, 0, 0.163, -0.07);
  const tray = m(new THREE.BoxGeometry(0.3, 0.006, 0.14), lt, g, 0, 0.03, 0.2); tray.rotation.x = 0.08;
  const paper = m(new THREE.PlaneGeometry(0.216, 0.279), simMat('white', { color: 0xfbfaf6, rough: 0.9, side: THREE.DoubleSide }), g, 0, 0.05, 0.1, false); paper.rotation.x = -PI / 2 + 0.08;
  const led = m(new THREE.SphereGeometry(0.006, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5fd06f, toneMapped: false }), g, 0.17, 0.12, 0.161, false);
  return { g, paper, setPaper: (k, tex) => { paper.visible = k > 0.01; paper.position.z = 0.16 * k - 0.04; paper.position.y = 0.05 - 0.02 * k; if (tex && paper.material.map !== tex) { paper.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }); } } };
}

export function makeRails(len = 3) {
  const g = new THREE.Group(), st = simMat('steel', { color: 0xa9adb2 });
  for (const s of [-1, 1]) m(new THREE.BoxGeometry(len, 0.03, 0.05), st, g, 0, 0.015, s * 0.55);
  for (let x = -len / 2 + 0.1; x < len / 2; x += 0.45) m(new THREE.BoxGeometry(0.08, 0.012, 1.25), simMat('lumber', { color: 0x7a6048 }), g, x, 0.006, 0);
  return g;
}
export function makeGrassBox(len = 1.2) {
  const g = new THREE.Group();
  m(new THREE.BoxGeometry(0.2, 0.16, len), simMat('lumber', { color: 0x8a6a4a }), g, 0, 0.08, 0);
  const gr = m(new THREE.BoxGeometry(0.17, 0.05, len - 0.04), simMat('grass', { repeat: [0.4, 2] }), g, 0, 0.17, 0);
  const R = rng(4), blade = new THREE.MeshStandardMaterial({ color: 0x6f9a4a, roughness: 0.9 });
  for (let i = 0; i < 60; i++) { const b = m(new THREE.ConeGeometry(0.008, 0.08 + R() * 0.06, 4), blade, g, (R() - 0.5) * 0.15, 0.22, (R() - 0.5) * (len - 0.1), false); b.rotation.set((R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.4); }
  return g;
}
export function makePaper(tex) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.216, 0.279), new THREE.MeshStandardMaterial({ map: tex || null, color: tex ? 0xffffff : 0xfbfaf6, roughness: 0.9, side: THREE.DoubleSide }));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
