// UV debug views of Vex's torso (front, 3/4, side, back) with the labelled grid texture
import * as THREE from 'three';
import { makeVroid } from '@engine/vroid.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
export async function build(studio) {
  buildVoxBeach(studio);
  const V = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' }, bust: 1.2, thigh: 1.18 });
  studio.scene.add(V.root);
  const S = [0, 0.8, Math.PI / 2, Math.PI, -0.8];
  function update(t) { const k = Math.min(S.length - 1, Math.floor(t)); V.update(t, { rotY: S[k], pose: 'rest', face: { blink: 0 } }); studio.setCamera([0, 1.05, 1.5], [0, 1.02, 0], 36, 0, 0); }
  update(0); return { update };
}
