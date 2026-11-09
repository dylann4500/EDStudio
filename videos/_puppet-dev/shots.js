// dev scene for engine/puppet.js: a generated 2-D character (tools/anime/gen.py → cut.py) living in the voxel beach (engine/sets/voxbeach.js)
// t 0–8: medium shot, idle (breath, hair, head) + head tilt + talk; t 10–12: wide; pixel pass at PIXEL.
import * as THREE from 'three';
import { K } from '@engine/core.js';
import { addPixelPass } from '@engine/pixel.js';
import { makePuppet } from '@engine/puppet.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';

const PIXEL = 3;
export async function build(studio) {
  const pixel = addPixelPass(studio);
  const B = buildVoxBeach(studio);
  const P = await makePuppet({ base: '/videos/_puppet-dev/art/hero.png', height: 1.22,
    rig: { neck: [0.52, 0.71], head: [0.53, 0.82, 0.25, 0.17], chest: [0.5, 0.49, 0.3, 0.12], hair: [[0.38, 0.76, 0.08, 0.12], [0.72, 0.76, 0.12, 0.16]], hairTop: 0.88, shadow: false } });
  P.root.position.set(0, 0.5, 0); studio.scene.add(P.root);
  function update(t) {
    const wide = t >= 10;
    const cam = wide ? [[1.2, 1.5, 5.5], [0.2, 1.0, 0]] : [[0, 1.2, K(t, [[0, 1.75], [8, 1.55]])], [0, 1.16, 0]];
    studio.setCamera(cam[0], cam[1], wide ? 40 : 40, 0, 0);
    P.update(t, { camera: studio.camera, headA: K(t, [[0, 0], [3, 0], [3.6, 0.06], [6, 0.06], [6.6, 0]]), talk: t > 2 && t < 6 ? 0.5 + 0.5 * Math.sin(t * 40) : 0 });
    pixel.set(PIXEL);
  }
  update(0);
  return { update };
}
