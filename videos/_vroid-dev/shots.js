// dev scene for engine/vroid.js (Vex, VRoid VRM 1.0) on the voxel beach under the pixel pass.
// t 0–3 turnaround (front, 3/4, side, back) · 4 face · 5–10 poses · 11–14 walk · 15–20 faces · 21–22 pixel views
import * as THREE from 'three';
import { addPixelPass } from '@engine/pixel.js';
import { makeVroid, dressGoth } from '@engine/vroid.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';

export async function build(studio) {
  const pixel = addPixelPass(studio);
  buildVoxBeach(studio);
  const V = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' }, bust: 1.08, thigh: 1.05 });
  dressGoth(V); studio.scene.add(V.root);
  const FULL = { cam: [0, 0.9, 3.4], look: [0, 0.85, 0], fov: 32 }, MED = { cam: [0, 1.25, 1.7], look: [0, 1.2, 0], fov: 34 }, FACE = { cam: [0, 1.42, 0.62], look: [0, 1.4, 0], fov: 32 };
  const S = [
    { ...FULL, yaw: 0 }, { ...FULL, yaw: 0.7 }, { ...FULL, yaw: Math.PI / 2 }, { ...FULL, yaw: Math.PI },
    { ...FACE, p: { face: { relaxed: 0.3 } } },
    { ...MED, p: { pose: 'hip' } }, { ...MED, p: { pose: 'shades', tilt: 0.12 } }, { ...MED, p: { pose: 'point', lean: 0.3 } }, { ...MED, p: { pose: 'peace', tilt: -0.12, face: { happy: 0.4 } } },
    { ...MED, p: { pose: 'phone', nod: 0.35, look: [0, -0.6] } }, { ...MED, p: { pose: 'wave', face: { happy: 0.6 } } },
    ...[0.0, 0.3, 0.6, 0.9].map((d) => ({ ...FULL, yaw: 0.5, p: { walk: { dist: d, speed: 1.1 } } })),
    { ...FACE, p: { face: { happy: 1 } } }, { ...FACE, p: { face: { relaxed: 1 } } }, { ...FACE, p: { face: { angry: 0.7 } } }, { ...FACE, p: { face: { surprised: 1 } } },
    { ...FACE, p: { mouth: 1, vowel: 'a' } }, { ...FACE, p: { face: { blink: 1 } } },
    { ...MED, p: { pose: 'shades', tilt: 0.12 }, px: 3 }, { ...FULL, yaw: 0.4, p: { pose: 'hip' }, px: 4 },
  ];
  function update(t) {
    const s = S[Math.min(S.length - 1, Math.floor(t))];
    V.update(t, { rotY: s.yaw || 0, face: { blink: 0 }, ...(s.p || {}), ...(s.p?.face ? { face: { blink: 0, ...s.p.face } } : {}) });
    studio.setCamera(s.cam, s.look, s.fov, 0, 0);
    pixel.set(s.px || 1);
  }
  update(0);
  return { update };
}
