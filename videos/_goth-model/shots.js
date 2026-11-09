// Model sheet for the goth tutor (engine/goth.js): one view per second (t = 0, 1, 2 …), pixel pass off then on.
import * as THREE from 'three';
import { makeGoth } from '@engine/goth.js';
import { addPixelPass } from '@engine/pixel.js';

export async function build(studio) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  studio.camera.far = 60; studio.camera.updateProjectionMatrix();
  const bg = document.createElement('canvas'); bg.width = 16; bg.height = 256; { const g = bg.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3b2346'); gr.addColorStop(0.6, '#1c1424'); gr.addColorStop(1, '#0d0a10'); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); }
  const bgT = new THREE.CanvasTexture(bg); bgT.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ map: bgT, side: THREE.BackSide })); scene.add(dome);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshToonMaterial({ color: 0x2a2030 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xe8dcff, 0x2a2030, 1.1));
  const key = new THREE.DirectionalLight(0xfff1e8, 2.2); key.position.set(1.8, 3.2, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2.2, bottom: -0.2 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc06cff, 1.6); rim.position.set(-2, 2.5, -2.5); scene.add(rim);
  const v1 = makeGoth(), v2 = makeGoth({ outfit: 'bikini' }); scene.add(v1.root, v2.root);
  const FULL = (yaw, px = 1) => ({ yaw, cam: [0, 0.95, 4.0], look: [0, 0.9, 0], fov: 30, px });
  const FACE = (pose, px = 1) => ({ yaw: 0, cam: [0.05, 1.64, 0.78], look: [0, 1.625, 0], fov: 30, pose, px });
  const POSE = (pose, px = 1, yaw = 0.25) => ({ yaw, cam: [0, 1.0, 3.3], look: [0, 1.0, 0], fov: 32, pose, px });
  const idle = { mouth: 'smirk', eyes: 'open', blink: 0 };
  const V = [
    FULL(0), FULL(0.75), FULL(Math.PI / 2), FULL(Math.PI),
    FACE({ ...idle }), FACE({ eyes: 'wink', mouth: 'tongue', blink: 0, head: { z: 0.12 } }), FACE({ eyes: 'roll', mouth: 'flat', brows: 0.4, blink: 0 }), FACE({ eyes: 'half', mouth: 'smirk', brows: -0.3, blink: 0, look: [0.3, 0] }),
    POSE({ ...idle, sway: 0.12, armL: { x: 0.1, z: 0.55, el: 1.9, y: 0.6 }, armR: { x: -1.45, z: 0.15, el: 0.15 }, handR: 'point', handL: 'fist', eyes: 'half', brows: -0.4 }),
    POSE({ ...idle, sway: -0.1, armR: { x: -0.4, z: 2.5, el: 1.6 }, handR: 'peace', armL: { x: 0.1, z: 0.5, el: 1.9, y: 0.6 }, eyes: 'wink', mouth: 'tongue', head: { z: -0.12 } }),
    FULL(0, 4), FULL(0.75, 5), FACE({ ...idle }, 4), POSE({ ...idle, sway: 0.12, armL: { x: 0.1, z: 0.55, el: 1.9, y: 0.6 }, armR: { x: -1.45, z: 0.15, el: 0.15 }, handR: 'point', eyes: 'half', brows: -0.4 }, 4),
  ];
  function update(t) {
    const bik = t >= 14, s = V[Math.min(V.length - 1, Math.floor(t) % 14)], v = bik ? v2 : v1;   // t 0–13 = goth outfit, 14–27 = bikini
    v1.root.visible = !bik; v2.root.visible = bik;
    v.set({ rotY: s.yaw, t: 0.6, ...(s.pose || idle) });
    studio.setCamera(s.cam, s.look, s.fov, 0, 0);
    pixel.set(s.px);
  }
  update(0);
  return { update };
}
