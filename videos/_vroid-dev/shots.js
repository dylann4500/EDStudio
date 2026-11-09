// Vex look check: face close-ups (current vs bigger head/irises) + full body thickness
import * as THREE from 'three';
import { makeVroid, dressGoth } from '@engine/vroid.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
export async function build(studio) {
  buildVoxBeach(studio);
  const A = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' }, bust: 1.2, thigh: 1.18 });
  const B = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body2.png' }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.07, eyes: 1.12 });
  dressGoth(A); dressGoth(B); studio.scene.add(A.root, B.root);
  function update(t) {
    const k = Math.floor(t), face = k < 2, M = k % 2 ? B : A;
    A.root.visible = M === A; B.root.visible = M === B;
    M.update(t, { pose: 'hip', rotY: k >= 4 ? 0.6 : 0, face: { relaxed: 0.15, blink: 0.12 } });
    if (face) studio.setCamera([0, 1.45, 0.62], [0, 1.42, 0], 34, 0, 0); else studio.setCamera([0, 0.95, 2.9], [0, 0.88, 0], 36, 0, 0);
  }
  update(0); return { update };
}
