// ISO TEMPLATE — `npm run new -- NNN-slug --from _iso-template`. The isometric-diorama look (docs/STYLES.md → iso, engine/iso/):
// a chunky floating slab of world with a cut soil edge over a gradient void, miniature low-poly buildings, tiny people, a long
// lens at ~35° that drifts round the diorama, and a depth-aware tilt-shift blur. Text = engine/iso/hud.js (story.iso), DOM-crisp.
// Replace the diorama, the people and the shots; keep the structure (SHOTS, build/update, ts.focusOn every frame).
import * as THREE from 'three';
import { K, rng } from '@engine/core.js';
import { basePose, blink } from '@engine/rig.js';
import { addTiltShift } from '@engine/iso/tiltshift.js';
import { isoLights, isoBackdrop, makeMotes } from '@engine/iso/look.js';
import { isoCam, isoAt } from '@engine/iso/camera.js';
import { makeBase, groundTexture } from '@engine/iso/base.js';
import { makeMini, makePeg, makePegCrowd } from '@engine/iso/people.js';
import { makeTree, makeHouse, makeLamp, makeBench, makeStall, makeCar, makeCrane, makeFence } from '@engine/iso/props.js';
import { makeIsoHud, ISO_FONTS } from '@engine/iso/hud.js';

// one shot = a keyframed iso camera: tx/ty/tz = target, az/el = orbit angles (deg), frame = metres across the frame
export const SHOTS = [
  { t0: 0, t1: 5.2, keys: [[0, { tx: 0, ty: 1.5, tz: 0, az: 30, el: 36, frame: 30 }], [5.2, { az: 44, frame: 27 }]], focus: [0, 1, 0] },
  { t0: 5.2, t1: 10, keys: [[5.2, { tx: 3.5, ty: 2, tz: -3, az: 60, el: 34, frame: 13 }], [10, { az: 70, frame: 11.5 }]], focus: [4, 2, -3] },
];

export async function build(studio, story) {
  const { scene } = studio;
  const hud = makeIsoHud(story.iso);
  await Promise.all(ISO_FONTS.map((f) => document.fonts.load(f)));
  const ts = addTiltShift(studio, { blur: 26, range: 3, ramp: 10 });
  const L = isoLights(studio, { half: 16 });
  isoBackdrop(studio, { top: '#a9d6ef', bottom: '#f7d9bd' });

  // the diorama: a 22 m square of town
  const B = makeBase({ w: 22, d: 22, h: 4.5, top: 0x86c35a, seed: 2 });
  scene.add(B.g);
  const W = B.world, R = rng(5);
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ map: groundTexture({ base: '#e6d6b8', speck: ['#d6c3a2', '#efe3cb'], seed: 9 }), roughness: 0.9 }));
  pave.material.map.repeat.set(3, 3); pave.rotation.x = -Math.PI / 2; pave.position.y = 0.01; pave.receiveShadow = true; W.add(pave);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.2), new THREE.MeshStandardMaterial({ color: 0x55585e, roughness: 0.95 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.012, 7.2); road.receiveShadow = true; W.add(road);
  const fountain = new THREE.Group(); W.add(fountain);
  fountain.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.45, 32), new THREE.MeshStandardMaterial({ color: 0xe9e1d2 })));
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x5fb6d9, roughness: 0.15 })); water.position.y = 0.2; fountain.add(water);
  fountain.position.y = 0.22; fountain.traverse((m) => { m.castShadow = m.receiveShadow = true; });
  const houses = [[-8, -8, 4, 3, 3], [-3.5, -8.5, 3.6, 3, 2], [1.5, -8.3, 3.4, 3.2, 3], [6.5, -8, 4, 3, 2], [-8.3, -2.5, 3, 4, 2], [8.3, -2, 3, 4.4, 3]];
  houses.forEach(([x, z, w, d, f], i) => { const h = makeHouse({ w, d, floors: f, seed: i + 1 }); h.position.set(x, 0, z); W.add(h); });
  for (let i = 0; i < 9; i++) { const t = makeTree(i % 3 ? 'round' : 'cypress', { h: 2.4 + R(), seed: i }); t.position.set(-9.5 + i * 2.4, 0, 9.4); W.add(t); }
  for (const [x, z] of [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) { const l = makeLamp(); l.position.set(x, 0, z); W.add(l); }
  const bench = makeBench(); bench.position.set(-2.5, 0, 3.2); W.add(bench);
  const stall = makeStall(); stall.position.set(3, 0, 3.4); stall.rotation.y = -0.4; W.add(stall);
  const crane = makeCrane({ h: 12, jib: 9 }); crane.position.set(5.5, 0, -4); W.add(crane);
  const fence = makeFence(6); fence.position.set(5.5, 0, -1.4); W.add(fence);
  const cars = [0xe8533f, 0x3d7fd6, 0xf2c14e].map((c) => { const m = makeCar({ color: c }); m.rotation.y = Math.PI / 2; W.add(m); return m; });

  // tiny people: an instanced crowd strolling round the fountain + one jointed worker + one rig hero waving
  const crowd = makePegCrowd(W, 26, { seed: 4 });
  const strollers = Array.from({ length: 26 }, (_, i) => ({ r: 2.4 + R() * 2.2, a0: R() * 6.28, w: (R() < 0.5 ? -1 : 1) * (0.12 + R() * 0.12) }));
  const worker = makePeg({ top: 0xff8a3d, hat: 'hard' }); W.add(worker.g);
  const hero = makeMini({ skin: 0xe3ad86, top: 0xf2c14e, pants: 0x2e3b55, hair: 0x3a2618, hairStyle: 'short' }); W.add(hero.rig.root);

  const motes = makeMotes(scene, { n: 50, box: [70, 40, 70], center: [0, 4, 0] });

  function update(t) {
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    isoCam(studio, isoAt(t, shot.keys, { drift: 0.4 }));
    ts.focusOn(shot.focus);
    L.focus(0, 0, 14);
    B.update(t); motes.update(t);
    water.material.color.setHSL(0.55, 0.6, 0.6 + 0.04 * Math.sin(t * 3));
    strollers.forEach((s, i) => {
      const a = s.a0 + s.w * t, x = Math.cos(a) * s.r, z = Math.sin(a) * s.r;
      crowd.set(i, { x, z, rotY: Math.atan2(-Math.sin(a) * s.w, Math.cos(a) * s.w) + (s.w > 0 ? 0 : 0), hop: Math.abs(Math.sin(t * 7 + i)) * 0.04 });
    });
    crowd.commit();
    cars.forEach((c, i) => { c.position.set(((t * 2.2 + i * 7.3) % 24) - 12, 0, 7.2 + (i % 2 ? 0.5 : -0.5)); });
    crane.userData.setSlew(0.6 + 0.25 * Math.sin(t * 0.4)); crane.userData.setHook(3 + Math.sin(t * 0.7));
    worker.set({ x: 4.2, z: -1.0, rotY: -0.6, armR: K(t, [[0, 0.2], [1, 2.6], [2, 2.2], [3, 2.6]]), walk: null });
    const p = basePose();
    Object.assign(p, { x: -1.2, z: 2.4, rotY: 0.5, eyes: blink(t), smile: 1 });
    p.armB = { sx: -0.2, sz: 2.6 + 0.25 * Math.sin(t * 9), el: -0.5, twist: 0 };   // a big wave
    hero.pose(p);
    hud.update(t);
  }
  return { update };
}
