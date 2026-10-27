// DOG BREEDS for the Pip series (video 030, the dog park): breed presets built on makePip() (engine/pip.js), so every dog in
// Pip's world shares his toy style, his pose driver (walk / run / sit / lie / beg / howl / ears / wag …) and his anchors.
//
//   const d = makeBreed('husky', { name: 'NOVA', fur: 0x3c3f44 });  scene.add(d.g);  d.update(t, state)  — exactly like Pip.
//   kinds: husky, poodle, lab, chihuahua, dalmatian, beagle, dachshund, pug, samoyed (any makePip option overrides the preset).
//   Adults get a smaller head (d.H.scale), longer legs (`legs`), a longer snout (`snout`); a dachshund gets `long`.
//   Poodles carry pom-poms (top-knot, ear puffs, chest, tail, ankles): d.frizz(k) 0..1 puffs them up (the after-the-splash gag).
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePip } from '@engine/pip.js';

const PRESETS = {
  husky:     { fur: 0x7e848c, white: 0xf6f4f0, cream: 0xf3f1ec, eye: 0x3f86c9, size: 1.38, legs: 1.38, snout: 0.022, head: 0.8, earStyle: 'up', ear: 0.85 },
  poodle:    { fur: 0xf5f0ea, white: 0xf7f3ee, cream: 0xf7f3ee, earInner: 0xf5f0ea, size: 1.32, legs: 1.6, snout: 0.04, head: 0.74, earStyle: 'flop', ear: 0.9 },
  lab:       { fur: 0xe2bd78, white: 0xeccc92, cream: 0xe8c788, earInner: 0xd9ad66, size: 1.72, legs: 1.45, snout: 0.04, head: 0.8, earStyle: 'flop', ear: 0.9 },
  chihuahua: { fur: 0xd59a5c, white: 0xf7e7cf, cream: 0xf0d0a8, size: 0.52, legs: 1.0, snout: -0.006, head: 1.16, earStyle: 'up', ear: 1.5 },
  dalmatian: { fur: 0xf6f4f0, white: 0xf6f4f0, cream: 0xf6f4f0, earInner: 0x2a2624, size: 1.5, legs: 1.45, snout: 0.03, head: 0.78, earStyle: 'flop', ear: 0.85, spots: true },
  beagle:    { fur: 0xb0702e, white: 0xfbf3e8, cream: 0xfbf3e8, earInner: 0x9a5e26, size: 1.08, legs: 1.1, snout: 0.022, head: 0.9, earStyle: 'flop', ear: 1.0, saddle: 0x2a2220 },
  dachshund: { fur: 0x9a4a24, white: 0xb2663a, cream: 0xa85a30, earInner: 0x7e3a1c, size: 1.02, legs: 0.72, long: 1.75, snout: 0.035, head: 0.86, earStyle: 'flop', ear: 1.0 },
  pug:       { fur: 0xe3c48e, white: 0xe9cd9c, cream: 0xe6c894, earInner: 0x2a2220, size: 0.98, legs: 0.95, snout: -0.024, head: 1.04, earStyle: 'flop', ear: 0.6, mask: 0x2e2622 },
  samoyed:   { fur: 0xf8f6f1, white: 0xfbfaf6, cream: 0xf2eee6, size: 1.4, legs: 1.25, snout: 0.02, head: 0.86, earStyle: 'up', ear: 0.8, fluff: true },
};
export const BREEDS = Object.keys(PRESETS);

let _spots = null;
function spotsTex() {
  if (_spots) return _spots;
  _spots = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#f6f4f0'; g.fillRect(0, 0, w, h); const R = rng(17);
    for (let i = 0; i < 46; i++) { g.fillStyle = '#26221f'; g.beginPath(); g.ellipse(R() * w, R() * h, 5 + R() * 8, 4 + R() * 6, R() * 3, 0, 7); g.fill(); }
  }, [2, 2]);
  return _spots;
}

/** a pom-pom: a cluster of fluffy spheres that can frizz (spread + swell) */
function pom(parent, r, x, y, z, m, seed, sc = [1, 1, 1]) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.set(...sc); parent.add(g);
  const R = rng(seed), balls = [];
  mk(new THREE.SphereGeometry(r * 0.78, 14, 10), m, g);
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, b = Math.acos(2 * R() - 1), d = r * (0.38 + R() * 0.2);
    const p = new THREE.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)).multiplyScalar(d);
    const s = mk(new THREE.SphereGeometry(r * (0.45 + R() * 0.15), 10, 8), m, g, p.x, p.y, p.z);
    balls.push({ s, p, j: R() });
  }
  return { g, balls };
}

export function makeBreed(kind, o = {}) {
  const P = { ...PRESETS[kind], ...o };
  const d = makePip({ ...P, stride: P.stride ?? P.size });
  d.kind = kind;
  d.H.scale.setScalar(P.head ?? 1);
  d.ears.forEach((e) => e.P.scale.setScalar(P.ear ?? 1));
  if (P.spots) { d.mats.fur.map = spotsTex(); d.mats.fur.color.set(0xffffff); d.mats.fur.needsUpdate = true; }
  if (P.saddle) { const s = mk(new THREE.SphereGeometry(0.085, 18, 12), mat(P.saddle, 0.9), d.T, 0, 0.03, -0.03); s.scale.set(1.04, 0.62, 1.55); }
  if (P.mask) {   // pug: a dark muzzle + jowls
    const dark = mat(P.mask, 0.8);
    d.H.children.forEach((c) => { const r = c.geometry?.parameters?.radius; if (c.isMesh && (r === 0.052 || (r === 0.04 && c.position.z > 0.03))) c.material = dark; });
  }
  if (P.fluff) {   // samoyed ruff + a big plume
    const m = d.mats.white;
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; mk(new THREE.SphereGeometry(0.05, 12, 10), m, d.T, Math.sin(a) * 0.07, 0.04 + 0.02 * Math.cos(a * 2), 0.12 + Math.cos(a) * 0.03); }
    d.tailB.scale.setScalar(1.35);
  }
  // poodle pom-poms (frizz-able)
  const poms = [];
  if (kind === 'poodle') {
    const m = d.mats.white, sd = (o.seed ?? 5) * 10;
    poms.push(pom(d.anchors.hat, 0.072, 0, 0.01, 0.0, m, sd + 1, [1.05, 0.95, 1]));               // top-knot
    d.ears.forEach((e, i) => poms.push(pom(e.P, 0.05, 0, 0.075, 0.006, m, sd + 2 + i, [0.9, 1.35, 0.75])));   // ear puffs
    poms.push(pom(d.T, 0.085, 0, 0.0, 0.11, m, sd + 4, [1.05, 1.1, 0.95]));                         // chest
    let tg = d.tailB; while (tg.children.some((c) => c.isGroup)) tg = tg.children.find((c) => c.isGroup);
    poms.push(pom(tg, 0.05, 0, 0, -0.03, m, sd + 5));                                                // tail
    d.legs.forEach((L, i) => poms.push(pom(L.paw, 0.034, 0, 0.055 / 0.62, 0, m, sd + 6 + i, [1, 1 / 0.62, 1 / 1.3])));   // ankles
    d.mats.fur.map = null; d.mats.fur.needsUpdate = true;   // a clipped, smooth coat between the poms
  }
  d.poms = poms;
  d.frizz = (k) => {
    poms.forEach((pm) => {
      pm.g.children[0].scale.setScalar(1 + 0.45 * k);
      pm.balls.forEach((b) => { b.s.position.copy(b.p).multiplyScalar(1 + (0.9 + 0.8 * b.j) * k); b.s.scale.setScalar(1 + (0.35 + 0.5 * b.j) * k); });
    });
  };
  return d;
}
