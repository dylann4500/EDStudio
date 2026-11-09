// dev scene for the v2 goth (engine/anime.js on tools/anime/body.py's body.glb): t 0–3 turnaround, 4–5 face, 6–7 pixel pass
import * as THREE from 'three';
import { makeAnimeGoth } from '@engine/anime.js';
import { addPixelPass } from '@engine/pixel.js';

export async function build(studio) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  studio.camera.far = 60; studio.camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0x8fc6ef);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2, 48), new THREE.MeshToonMaterial({ color: 0xe8d39a })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8c0a0, 1.5));
  const key = new THREE.DirectionalLight(0xfff4ea, 2.2); key.position.set(1.5, 3, 2.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2.2, bottom: -0.2 }); scene.add(key);
  const g = await makeAnimeGoth('/videos/_goth-model/body.glb'); scene.add(g.root);
  console.log('bones: ' + Object.keys(g.ch.bones).join(','));
  const V = [
    { yaw: 0, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30 }, { yaw: 0.75, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30 },
    { yaw: Math.PI / 2, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30 }, { yaw: Math.PI, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30 },
    { yaw: 0, cam: [0, 1.6, 0.8], look: [0, 1.6, 0], fov: 30 }, { yaw: 0.5, cam: [0, 1.58, 0.85], look: [0, 1.58, 0], fov: 30 },
    { yaw: 0, cam: [0, 1.25, 1.9], look: [0, 1.25, 0], fov: 32, px: 4 }, { yaw: 0.4, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30, px: 5 },
  ];
  // arm-axis lineup (t 8–13): which local axis brings the A-pose arms down / forward
  const AX = [{ pose: 'rest' }, { pose: 'hips', sway: 0.12 }, { pose: 'ally', sway: -0.1, tilt: 0.12 }, { pose: 'point', eyes: 'open', mouth: 'smile' }, { pose: 'wave', eyes: 'wink', mouth: 'tongue', tilt: -0.1 }, { pose: 'peace', sway: 0.12, eyes: 'wink', mouth: 'tongue', tilt: 0.15 }, { pose: 'rest', hands: { L: 'fist', R: 'claw' } }];
  function update(t) {
    const k = Math.floor(t), v = k >= 20 ? { yaw: 0, cam: [-0.35, 1.25, 1.1], look: [-0.2, 1.2, 0], fov: 32 } : k >= 8 ? { yaw: 0, cam: [0, 0.92, 3.9], look: [0, 0.88, 0], fov: 30 } : V[Math.min(V.length - 1, k)];
    g.set({ rotY: v.yaw, t: 0.6, blink: 0, ...(k >= 20 ? AX[k - 20 + 6] : k >= 8 ? AX[k - 8] : {}) });
    studio.setCamera(v.cam, v.look, v.fov, 0, 0);
    pixel.set(v.px || 1);
  }
  update(0);
  return { update };
}
