// SET: the Maine coast on a bright morning — a granite headland (camera spot on top, pines), a rocky islet 90 m out with a
// white lighthouse (red lantern roof) and a keeper's house, an animated sea (`setSea(level)` raises the whole ocean; `update(t)`
// moves the swell), a sailboat and a lobster boat that ride the water, red/green buoys, gulls, far islands, clouds.
// Built for video 017 (gravity off: the ocean, squeezed by its own weight, springs up ~35 m — then drops back).
//
// Coordinates (meters, y up). Sea level y = 0 at rest. Headland: x∈[-70,70], z∈[8,80], top ≈ DIMS.cliffTop (camera at
// DIMS.cam, looking −z). Islet center DIMS.islet (rock top y≈9), lighthouse base DIMS.tower, lantern at y≈30–33.
// waveAt(x, z, t) = local swell height (add the sea level). boats[i] = {g, x, z, ry} — place them with rideBoats(t, level).
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
export const DIMS = { cliffTop: 38, cam: [4, 40, 14], islet: [-6, -78], tower: [-6, 9, -80], keeper: [4, 8, -74] };
export function waveAt(x, z, t) {
  return 0.55 * Math.sin(x * 0.045 + z * 0.06 + t * 0.9) + 0.35 * Math.sin(x * 0.11 - z * 0.04 + t * 1.4) + 0.18 * Math.sin(-x * 0.07 + z * 0.15 + t * 2.1);
}

export function buildCoast(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 21);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xdfe9ee, 220, 1300);
  const sky = makeSkyDome(0x3f86d6, 0xeef3f4, 1400); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 14; i++) { const a = -PI * 0.1 - R() * PI * 0.8, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 900, 140 + R() * 160, Math.sin(a) * 900); root.add(cg); for (let k = 0; k < 6; k++) { const p = mk(new THREE.SphereGeometry(30 + R() * 25, 12, 8), cloudM, cg, (k - 2.5) * 34, R() * 12, R() * 20); p.scale.y = 0.45; p.castShadow = false; } }

  // the sea: one big displaced plane, moved up/down as a whole by setSea
  const seaT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#2d6f8e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + R() * 0.1})`; g.fillRect(R() * w, R() * h, 14 + R() * 50, 2); } for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(10,40,60,${R() * 0.12})`; g.fillRect(R() * w, R() * h, 30 + R() * 60, 3); } }, [60, 60]);
  const seaGeo = new THREE.PlaneGeometry(2400, 2400, 150, 150); seaGeo.rotateX(-PI / 2);
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ map: seaT, color: 0xbfe4f0, roughness: 0.2, metalness: 0.15 }));
  sea.receiveShadow = true; root.add(sea);
  const base = seaGeo.attributes.position.array.slice();

  // granite: the headland (camera) and the islet — lumpy boxes + spheres in warm grey/pink granite
  const granite = [mat(0x9a948c, 0.95), mat(0xa89a8c, 0.95), mat(0x8a857e, 0.95)];
  const lump = (x, y, z, sx, sy, sz, k, p = root) => { const m = mk(new THREE.IcosahedronGeometry(1, 1), granite[k % 3], p, x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(R(), R(), R()); return m; };
  const head = new THREE.Group(); root.add(head);
  for (let i = 0; i < 40; i++) lump(-80 + R() * 160, DIMS.cliffTop * (0.2 + R() * 0.6), 30 + R() * 50, 14 + R() * 10, 12 + R() * 14, 12 + R() * 8, i, head);
  for (let i = 0; i < 26; i++) lump(-70 + R() * 140, 4 + R() * 30, 12 + R() * 12, 7 + R() * 6, 6 + R() * 8, 6 + R() * 5, i + 1, head);
  const top = mk(new THREE.BoxGeometry(170, 6, 70), mat(0x6f7a4a, 1), head, 0, DIMS.cliffTop - 3, 50); top.castShadow = false;
  const pineM = [mat(0x2f5a3a, 0.9), mat(0x3a6a42, 0.9)], trunkM = mat(0x5a4030, 0.9);
  const pine = (x, y, z, s, p = root) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); mk(new THREE.CylinderGeometry(0.25, 0.35, 3, 6), trunkM, g, 0, 1.5, 0); for (let k = 0; k < 4; k++) mk(new THREE.ConeGeometry(2.4 - k * 0.45, 3.2, 8), pineM[k % 2], g, 0, 3 + k * 1.8, 0); return g; };
  for (let i = 0; i < 46; i++) { const x = -80 + R() * 160, z = 26 + R() * 50; if (Math.abs(x - DIMS.cam[0]) < 10 && z < 34) continue; pine(x, DIMS.cliffTop, z, 0.9 + R() * 0.9, head); }
  // the islet + lighthouse + keeper's house
  const isl = new THREE.Group(); isl.position.set(DIMS.islet[0], 0, DIMS.islet[1]); root.add(isl);
  for (let i = 0; i < 16; i++) lump((R() - 0.5) * 26, -2 + R() * 7, (R() - 0.5) * 22, 6 + R() * 5, 4 + R() * 6, 5 + R() * 4, i, isl);
  const islTop = mk(new THREE.CylinderGeometry(9, 12, 4, 14), mat(0x7a8a4a, 1), isl, 2, 7.5, 0); islTop.castShadow = false;
  const white = mat(0xf6f4ee, 0.6), red = mat(0xb5322c, 0.6), black = mat(0x22252a, 0.5);
  const tower = new THREE.Group(); tower.position.set(...DIMS.tower); root.add(tower);
  mk(new THREE.CylinderGeometry(2.0, 2.8, 20, 24), white, tower, 0, 10, 0);
  mk(new THREE.CylinderGeometry(3.0, 3.0, 0.5, 24), black, tower, 0, 20.25, 0);
  for (let k = 0; k < 16; k++) mk(new THREE.BoxGeometry(0.06, 1.2, 0.06), black, tower, Math.cos(k / 16 * PI * 2) * 2.9, 21.1, Math.sin(k / 16 * PI * 2) * 2.9);
  const lantern = mk(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 16), new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffd890, emissiveIntensity: 0.6, roughness: 0.2 }), tower, 0, 21.8, 0);
  mk(new THREE.ConeGeometry(2.1, 1.8, 16), red, tower, 0, 24.0, 0); mk(new THREE.SphereGeometry(0.3, 8, 6), black, tower, 0, 25.0, 0);
  for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.6, 0.9, 0.1), black, tower, 0, 5 + k * 5, 2.45 - k * 0.12);
  const keeper = new THREE.Group(); keeper.position.set(...DIMS.keeper); root.add(keeper);
  box(7, 4, 5, white, 0, 2, 0, keeper); const rf = box(7.6, 0.3, 3.3, red, 0, 4.9, -1.2, keeper); rf.rotation.x = 0.55; const rb = box(7.6, 0.3, 3.3, red, 0, 4.9, 1.2, keeper); rb.rotation.x = -0.55;
  box(0.6, 2, 0.6, red, 2.2, 5.6, 0, keeper); for (const x of [-2, 0.4]) box(1, 1.2, 0.1, mat(0x9ec4e6, 0.2), x, 2.3, 2.55, keeper); box(1, 2, 0.1, red, 2.3, 1.0, 2.55, keeper);
  // far islands with pines + a long low mainland
  for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const a = -PI * 0.15 - R() * PI * 0.7, d = 350 + R() * 380; g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); root.add(g); const w = 30 + R() * 60; const m = mk(new THREE.SphereGeometry(w, 14, 8), granite[i % 3], g, 0, -w * 0.75, 0); m.scale.y = 0.6; for (let k = 0; k < 12; k++) pine((R() - 0.5) * w * 1.2, w * 0.05, (R() - 0.5) * w * 0.6, 1.4 + R() * 1.2, g); }
  // boats + buoys
  const boats = [];
  const sail = new THREE.Group(); root.add(sail);
  { const hull = mk(new THREE.CylinderGeometry(1.2, 0.6, 8, 10, 1), mat(0xf4f1ea, 0.5), sail, 0, 0.4, 0); hull.rotation.x = PI / 2; hull.scale.set(1, 1, 0.6); mk(new THREE.BoxGeometry(1.8, 0.3, 6.5), mat(0xb07a4a, 0.6), sail, 0, 0.75, 0); mk(new THREE.CylinderGeometry(0.08, 0.1, 10, 6), mat(0xd8d4cc, 0.5), sail, 0, 5.8, 0.6);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute([0, 1.2, 0.7, 0, 10.6, 0.65, 0, 1.4, -3.6], 3)); sg.computeVertexNormals(); const s = new THREE.Mesh(sg, mat(0xfbfaf6, 0.7, { side: THREE.DoubleSide })); sail.add(s); s.castShadow = true;
    const jg = new THREE.BufferGeometry(); jg.setAttribute('position', new THREE.Float32BufferAttribute([0, 1.3, 1.0, 0, 9.4, 0.8, 0, 1.0, 3.8], 3)); jg.computeVertexNormals(); sail.add(new THREE.Mesh(jg, mat(0xf2e6c8, 0.7, { side: THREE.DoubleSide }))); }
  boats.push({ g: sail, x: 10, z: -42, ry: 0.9 });
  const lob = new THREE.Group(); root.add(lob);
  { const hull = mk(new THREE.BoxGeometry(3, 1.4, 9), mat(0xf4f1ea, 0.5), lob, 0, 0.3, 0); mk(new THREE.BoxGeometry(3.05, 0.35, 9.05), mat(0x2f6aa8, 0.5), lob, 0, 0.9, 0); mk(new THREE.BoxGeometry(2.4, 1.8, 2.6), white, lob, 0, 1.9, 1.6); mk(new THREE.BoxGeometry(2.2, 0.6, 2.4), mat(0x9ec4e6, 0.2), lob, 0, 2.3, 1.62); void hull;
    for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(0.8, 0.5, 0.6), mat(0xd8b46a, 0.8), lob, (k % 2 - 0.5) * 1.1, 1.3, -2 - Math.floor(k / 2) * 0.8); }
  boats.push({ g: lob, x: -16, z: -34, ry: -0.5 });
  const buoyM = [mat(0xc8302c, 0.5), mat(0x2f8a4a, 0.5)];
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); root.add(g); mk(new THREE.CylinderGeometry(0.5, 0.7, 2.2, 10), buoyM[i % 2], g, 0, 1.0, 0); mk(new THREE.ConeGeometry(0.5, 0.9, 10), buoyM[i % 2], g, 0, 2.5, 0); boats.push({ g, x: -26 + i * 9 + R() * 4, z: -26 - R() * 60, ry: 0, buoy: true }); }

  function setSea(level, t = 0) {
    const p = seaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, level + waveAt(x, z, t)); }
    p.needsUpdate = true; seaGeo.computeVertexNormals();
    seaT.offset.set(t * 0.004, t * 0.002);
  }
  /** Boats ride the swell (k = how much of the level they follow; 1 = float on it). */
  function rideBoats(t, level) { boats.forEach((b, i) => { b.g.position.set(b.x, level + waveAt(b.x, b.z, t) - (b.buoy ? 0.6 : 0), b.z); b.g.rotation.set(0.05 * Math.sin(t * 1.1 + i), b.ry, 0.06 * Math.sin(t * 0.9 + i * 2)); }); }
  setSea(0, 0); rideBoats(0, 0);

  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x5a6a5a, 1.1); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.7); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0005;
  function aimSun(cx = 0, cz = -60, half = 60) { sun.target.position.set(cx, 0, cz); sun.position.set(cx + 90, 140, cz + 60); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 450 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  void lantern;
  return { root, fog, sky, sea, setSea, rideBoats, boats, tower, keeper, isl, aimSun, lights: { hemi, sun } };
}
