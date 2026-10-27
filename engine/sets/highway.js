// SET: a sunny Texas interstate — a divided 4-lane freeway that runs straight toward −z, then sweeps right (+x) on a big curve,
// dry-grass plains with mesquite trees, a ranch fence, guardrails on the outside of the curve, light poles, a green overhead
// sign gantry, billboards, a water tower, slowly turning wind turbines on the horizon, clouds. Built for video 017 (gravity off:
// the cars float off their springs and go straight while the road curves away).
//
// Coordinates (meters, y up). Road centerline (median) = DIMS.center(s): s < 0 is the straight (x = 0, z = −s, i.e. it comes
// from +z), s ≥ 0 follows a circle of radius DIMS.R around (R, 0, 0). DIMS.frame(s, off) → {x, z, head} gives a point offset
// `off` meters to the right of the median (+ = toward the inside of the curve) and the heading (rotation.y for a car facing +z
// that drives toward increasing s). Lanes (offsets): southbound (driving toward +s) +4.25 / +7.95; northbound −4.25 / −7.95.
// update(t) turns the turbines. aimSun(cx, cz, half). Set camera.far ≥ 1200.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI, R0 = 160;
function center(s) {
  if (s < 0) return { x: 0, z: -s, hx: 0, hz: -1 };
  const a = s / R0;
  return { x: R0 - R0 * Math.cos(a), z: -R0 * Math.sin(a), hx: Math.sin(a), hz: -Math.cos(a) };
}
/** point `off` m to the right of the median at arc length s (+off = inside of the curve), heading for a +z-facing model */
function frame(s, off = 0) { const c = center(s); return { x: c.x - c.hz * off, z: c.z + c.hx * off, head: Math.atan2(c.hx, c.hz) }; }
export const DIMS = { R: R0, center, frame, lanes: { sb: [4.25, 7.95], nb: [-4.25, -7.95] } };

export function buildHighway(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 10);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xe9e4d6, 180, 1100);
  const sky = makeSkyDome(0x3f86d6, 0xf0ece0, 1150); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 16; i++) { const a = -PI * 0.2 - R() * PI * 1.1, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 800, 150 + R() * 140, Math.sin(a) * 800); root.add(cg); for (let k = 0; k < 6; k++) { const p = mk(new THREE.SphereGeometry(26 + R() * 22, 12, 8), cloudM, cg, (k - 2.5) * 30, R() * 10, R() * 20); p.scale.y = 0.45; p.castShadow = false; } }

  // dry grass plain
  const grassT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b5ad6a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = ['rgba(120,130,60,.35)', 'rgba(210,190,120,.4)', 'rgba(90,100,50,.3)'][i % 3]; g.fillRect(R() * w, R() * h, 3, 2); } }, [180, 180]);
  const ground = mk(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ map: grassT, roughness: 1 }), root, 0, -0.02, 0); ground.rotation.x = -PI / 2; ground.castShadow = false;

  // road ribbon (one per carriageway) with lane markings baked into a texture: u across, v along (12 m dash period)
  const roadT = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#55575c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},${0.04 + R() * 0.06})`; g.fillRect(R() * w, R() * h, 2, 2); }
    const U = (m) => (m / 11.6) * w;   // 11.6 m wide: 1.2 inner shoulder, 2 × 3.7 lanes, 3.0 outer shoulder
    g.fillStyle = '#f2c14e'; g.fillRect(U(1.05), 0, U(0.15), h);
    g.fillStyle = '#f4f2ea'; g.fillRect(U(8.5), 0, U(0.15), h);
    g.fillRect(U(4.85), 0, U(0.13), h * 0.25);
  });
  roadT.wrapS = roadT.wrapT = THREE.RepeatWrapping;
  const roadM = new THREE.MeshStandardMaterial({ map: roadT, roughness: 0.9, side: THREE.DoubleSide });
  function ribbon(s0, s1, offA, offB, y, material, vScale = 12) {
    const pos = [], uv = [], idx = []; let n = 0;
    for (let s = s0; s <= s1 + 0.01; s += 2) {
      const a = frame(s, offA), b = frame(s, offB);
      pos.push(a.x, y, a.z, b.x, y, b.z); uv.push(0, s / vScale, 1, s / vScale);
      if (n > 0) { const i = n * 2; idx.push(i - 2, i - 1, i, i - 1, i + 1, i); }
      n++;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, material); m.receiveShadow = true; root.add(m); return m;
  }
  ribbon(-700, 320, 1.2, 12.8, 0.02, roadM);            // southbound (inside of the curve), inner shoulder at the median
  ribbon(-700, 320, -1.2, -12.8, 0.02, roadM);          // northbound (outside)
  ribbon(-700, 320, -1.2, 1.2, 0.01, mat(0x9a9a8a, 1, { side: THREE.DoubleSide }));
  // concrete median barrier + outside guardrail (instanced segments along the curve)
  const segGeo = new THREE.BoxGeometry(0.6, 0.85, 2.1), barM = mat(0xcfccc2, 0.9), railGeo = new THREE.BoxGeometry(0.12, 0.32, 4.1), postGeo = new THREE.BoxGeometry(0.15, 0.75, 0.15), railM = mat(0xb8bcc2, 0.35, { metalness: 0.6 });
  const nSeg = 510, bar = new THREE.InstancedMesh(segGeo, barM, nSeg), rail = new THREE.InstancedMesh(railGeo, railM, 400), posts = new THREE.InstancedMesh(postGeo, railM, 400);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < nSeg; i++) { const s = -700 + i * 2, f = frame(s, 0); M.compose(V.set(f.x, 0.42, f.z), Q.setFromEuler(E.set(0, f.head, 0)), S1); bar.setMatrixAt(i, M); }
  let nr = 0;
  for (let s = -200; s < 320 && nr < 400; s += 4) { const f = frame(s, -14.2); M.compose(V.set(f.x, 0.6, f.z), Q.setFromEuler(E.set(0, f.head, 0)), S1); rail.setMatrixAt(nr, M); M.compose(V.set(f.x, 0.38, f.z), Q, S1); posts.setMatrixAt(nr, M); nr++; }
  rail.count = posts.count = nr;
  [bar, rail, posts].forEach((m) => { m.castShadow = true; m.receiveShadow = true; root.add(m); });
  // light poles on the median
  const poleM = mat(0x9aa0a8, 0.4, { metalness: 0.5 });
  for (let s = -300; s < 320; s += 45) { const f = frame(s, 0); const g = new THREE.Group(); g.position.set(f.x, 0, f.z); g.rotation.y = f.head; root.add(g); mk(new THREE.CylinderGeometry(0.12, 0.18, 12, 8), poleM, g, 0, 6.85, 0); for (const sd of [-1, 1]) { const arm = mk(new THREE.BoxGeometry(3.2, 0.12, 0.12), poleM, g, sd * 1.6, 12.6, 0); mk(new THREE.BoxGeometry(0.9, 0.18, 0.4), mat(0x3a3d42, 0.5), g, sd * 3.1, 12.5, 0); void arm; } }
  // overhead sign gantry over the southbound lanes at s = −60
  { const f = frame(-60, 7), g = new THREE.Group(); g.position.set(f.x, 0, f.z); g.rotation.y = f.head; root.add(g);
    for (const x of [-6.5, 6.5]) mk(new THREE.BoxGeometry(0.35, 7.5, 0.35), poleM, g, x, 3.75, 0); mk(new THREE.BoxGeometry(13.5, 0.5, 0.5), poleM, g, 0, 7.2, 0);
    const signT = canvasTex(512, 220, (c, w, h) => { c.fillStyle = '#1f6b3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#fff'; c.font = 'bold 44px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('10 WEST', w / 2, 66); c.font = 'bold 54px Helvetica, Arial, sans-serif'; c.fillText('San Antonio', w / 2, 138); c.font = 'bold 40px Helvetica, Arial, sans-serif'; c.fillText('45 mi', w / 2, 192); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.8), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.5 })); sg.position.set(0, 8.9, 0.3); g.add(sg); sg.rotation.y = 0; }
  // billboards, ranch fence, mesquite trees, water tower, distant hills, wind turbines
  const bbT = canvasTex(512, 200, (c, w, h) => { c.fillStyle = '#f2c14e'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a2a1c'; c.font = 'bold 66px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText("NEWTON'S BBQ", w / 2, 92); c.fillStyle = '#1d2a3a'; c.font = 'bold 40px Helvetica, Arial, sans-serif'; c.fillText('EXIT 17 · KEEPS YOU GROUNDED', w / 2, 160); });
  for (const [s, off] of [[-120, -40], [90, -48]]) { const f = frame(s, off), g = new THREE.Group(); g.position.set(f.x, 0, f.z); g.rotation.y = f.head + PI * 0.85; root.add(g); for (const x of [-4, 4]) mk(new THREE.BoxGeometry(0.4, 8, 0.4), mat(0x6a5a48, 0.8), g, x, 4, 0); const b = new THREE.Mesh(new THREE.PlaneGeometry(13, 5), new THREE.MeshStandardMaterial({ map: bbT, roughness: 0.6, side: THREE.DoubleSide })); b.position.y = 9.5; g.add(b); }
  const fenceM = mat(0x8a6a48, 0.9);
  for (let s = -300; s < 320; s += 6) { const f = frame(s, -30); mk(new THREE.BoxGeometry(0.15, 1.3, 0.15), fenceM, root, f.x, 0.65, f.z); }
  for (const off of [-30]) for (const y of [0.6, 1.05]) ribbon(-300, 320, off - 0.03, off + 0.03, y, mat(0x6a5a48, 0.9, { side: THREE.DoubleSide }), 50);
  const treeM = [mat(0x6f8a3f, 0.9), mat(0x5f7a3a, 0.9), mat(0x86924a, 0.9)], trunkM = mat(0x6a503a, 0.9);
  for (let i = 0; i < 160; i++) {
    const s = -400 + R() * 1100, side = R() < 0.5 ? -1 : 1, off = side * (24 + R() * 160), f = frame(s, off);
    if (Math.abs(off) < 30) continue;
    const g = new THREE.Group(); g.position.set(f.x, 0, f.z); g.scale.setScalar(0.8 + R() * 0.9); root.add(g);
    mk(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6), trunkM, g, 0, 1.1, 0);
    for (let k = 0; k < 4; k++) { const b = mk(new THREE.SphereGeometry(1.6 + R(), 8, 6), treeM[(i + k) % 3], g, (R() - 0.5) * 2.4, 2.6 + R() * 0.8, (R() - 0.5) * 2.4); b.scale.y = 0.6; }
  }
  { const g = new THREE.Group(); g.position.set(-150, 0, -260); root.add(g); for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) mk(new THREE.CylinderGeometry(0.25, 0.25, 26, 6), poleM, g, x, 13, z); const tank = mk(new THREE.SphereGeometry(7, 20, 14), mat(0xe9e6e0, 0.5), g, 0, 30, 0); tank.scale.y = 0.75; const wt = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), new THREE.MeshStandardMaterial({ map: canvasTex(256, 80, (c, w, h) => { c.fillStyle = '#e9e6e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f5fb3'; c.font = 'bold 54px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('SEGUIN', w / 2, 58); }), transparent: true })); wt.position.set(0, 30.5, 7.05); g.add(wt); }
  const hillM = mat(0x9aa58a, 1);
  for (let i = 0; i < 26; i++) { const a = -PI * 0.15 - (i / 26) * PI * 1.3, d = 700 + R() * 200; const h = mk(new THREE.SphereGeometry(80 + R() * 90, 16, 8), hillM, root, Math.cos(a) * d, -40, Math.sin(a) * d); h.scale.y = 0.35 + R() * 0.2; h.castShadow = false; }
  const turbines = [];
  for (let i = 0; i < 9; i++) {
    const a = -PI * 0.45 - i * 0.12, d = 520 + (i % 3) * 60, g = new THREE.Group(); g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); g.rotation.y = -a - PI / 2; root.add(g);
    mk(new THREE.CylinderGeometry(1.0, 1.8, 80, 10), mat(0xf4f4f2, 0.5), g, 0, 40, 0); mk(new THREE.BoxGeometry(2.4, 2.4, 7), mat(0xf4f4f2, 0.5), g, 0, 81, 0);
    const hub = new THREE.Group(); hub.position.set(0, 81, 3.8); g.add(hub);
    for (let k = 0; k < 3; k++) { const b = mk(new THREE.BoxGeometry(1.6, 36, 0.4), mat(0xf4f4f2, 0.5), hub, 0, 18, 0); b.geometry.translate(0, 0, 0); const piv = new THREE.Group(); piv.rotation.z = k * PI * 2 / 3; hub.add(piv); piv.add(b); }
    turbines.push({ hub, ph: R() * 6 });
  }
  function update(t) { turbines.forEach((w) => (w.hub.rotation.z = w.ph + t * 1.1)); }

  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x9a8a5a, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.8); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004;
  function aimSun(cx = 0, cz = 0, half = 40) { sun.target.position.set(cx, 0, cz); sun.position.set(cx + 60, 110, cz + 70); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 400 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, fog, sky, update, aimSun, lights: { hemi, sun } };
}
