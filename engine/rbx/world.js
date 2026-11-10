// Blocky-avatar game style (069): the world. A grey studded baseplate to the horizon, a bright painted skybox (deep blue zenith,
// pale horizon, big soft cumulus clouds) that follows the camera, one crisp sun with soft shadows + a sky/ground hemi, a pale
// blue haze, and a soft studio IBL so every plastic part gets a highlight. Our own sky and palette.
//   rbxEnv(studio) is called for you. const W = rbxWorld(studio, { size: 600, color: 0x7f8389 });
//   W.aim(x, z, half)      per shot: centre the sun's shadow box on the action (half = metres covered)
//   W.update(t, camera)    cloud drift (the sky dome follows the camera by itself)
// LOOK (story.json): RBX_LOOK — neutral tone mapping (clean toy colours; ACES greyed the sky), a little bloom for the neon, saturation 1.12, no grain, light vignette.
import * as THREE from 'three';
import { S, studMaps, plastic, rbxEnv, makeCanvas, prng } from './mats.js';

export const RBX_LOOK = { exposure: 1.0, toneMapping: 'neutral', bloom: 0.14, bloomThreshold: 0.9, grain: 0, vignette: 0.12, saturation: 1.12, warm: 0.08, fill: 0.35, lift: 0.0 };
export const SKY = { top: 0x1f63d6, mid: 0x4a96f0, horizon: 0xa9d4fb, fog: 0xa9d0f6 };

/** painted sky dome (equirect canvas: gradient + soft cumulus), follows the camera; returns the mesh */
export function rbxSky(parent, { r = 1800, seed = 4, clouds = 16, top = SKY.top, mid = SKY.mid, horizon = SKY.horizon } = {}) {
  const W = 2048, H = 1024, hx = (c) => '#' + c.toString(16).padStart(6, '0');
  const c = makeCanvas(W, H, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, H * 0.5);
    gr.addColorStop(0, hx(top)); gr.addColorStop(0.55, hx(mid)); gr.addColorStop(0.93, hx(horizon)); gr.addColorStop(1, hx(horizon));
    g.fillStyle = gr; g.fillRect(0, 0, W, H * 0.5); g.fillStyle = hx(horizon); g.fillRect(0, H * 0.5, W, H * 0.5);
    // cumulus: separate clusters of soft round puffs (lit top, faint blue-grey belly) with clear blue between them; flatter and
    // smaller toward the horizon (the band a vertical frame sees when it looks level is elevation 0–25°, canvas y 0.36–0.5 H)
    const r0 = prng(seed);
    for (let i = 0; i < clouds; i++) {
      const cx = (i + 0.2 + r0() * 0.6) / clouds * W, e = Math.pow(r0(), 0.8), cy = H * (0.455 - 0.2 * e), sz = 14 + 46 * e * (0.7 + r0() * 0.6), n = 5 + (r0() * 6 | 0), flat = 0.55 + 0.25 * e;
      const puffs = []; for (let k = 0; k < n; k++) { const u = (k / (n - 1 || 1)) - 0.5; puffs.push([cx + u * sz * 3.4 + (r0() - 0.5) * sz * 0.6, cy - (1 - Math.abs(u) * 1.6) * sz * 0.55 * r0(), sz * (0.55 + r0() * 0.5) * (1 - Math.abs(u) * 0.6)]); }
      const blob = (x, y, rr, c0, c1, oy = 0) => { for (const dx of [-W, 0, W]) { g.save(); g.translate(x + dx, y + oy); g.scale(1, flat); const b = g.createRadialGradient(-rr * 0.15, -rr * 0.2, rr * 0.1, 0, 0, rr); b.addColorStop(0, c0); b.addColorStop(0.62, c0); b.addColorStop(1, c1); g.fillStyle = b; g.beginPath(); g.arc(0, 0, rr, 0, 7); g.fill(); g.restore(); } };
      for (const [x, y, rr] of puffs) blob(x, y, rr * 1.04, 'rgba(196,212,236,.75)', 'rgba(196,212,236,0)', rr * 0.22);
      for (const [x, y, rr] of puffs) blob(x, y, rr, 'rgba(255,255,255,.98)', 'rgba(255,255,255,0)');
    }
  });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  sky.onBeforeRender = (renderer, scene, camera) => { const p = camera.getWorldPosition(new THREE.Vector3()); sky.parent.worldToLocal(p); sky.position.copy(p); sky.updateMatrixWorld(); };
  parent.add(sky);
  return sky;
}

/** the studded baseplate: a flat plane (size m square) with one stud per S, tinted `color` */
export function baseplate(parent, { size = 600, color = 0x7f8389, y = 0, x = 0, z = 0, rough = 0.62 } = {}) {
  const m = studMaps();
  const color2 = m.color.clone(), normal2 = m.normal.clone();
  [color2, normal2].forEach((t) => { t.repeat.set(size / S, size / S); t.needsUpdate = true; });
  const mat = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, map: color2, normalMap: normal2, normalScale: new THREE.Vector2(0.8, 0.8), envMapIntensity: 0.6 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); plane.rotation.x = -Math.PI / 2; plane.position.set(x, y, z); plane.receiveShadow = true;
  parent.add(plane);
  return plane;
}

/** hemi + one sun with soft shadows; aim() re-centres the shadow box per shot */
export function rbxLights(parent, { sun = 2.4, hemi = 1.0, dir = [0.5, 1, 0.65], color = 0xfff4e2, shadowSize = 4096 } = {}) {
  const H = new THREE.HemisphereLight(0xd8eaff, 0x8a8f96, hemi); parent.add(H);
  const L = new THREE.DirectionalLight(color, sun); L.castShadow = true;
  L.shadow.mapSize.set(shadowSize, shadowSize); L.shadow.bias = -0.0004; L.shadow.normalBias = 0.02; L.shadow.radius = 3;
  const tgt = new THREE.Object3D(); parent.add(tgt); L.target = tgt; parent.add(L);
  const d = new THREE.Vector3(...dir).normalize();
  const aim = (x, z, half = 20, y = 0) => {
    const c = L.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = half * 6 + 200; c.updateProjectionMatrix();
    tgt.position.set(x, y, z); L.position.set(x + d.x * (half * 2 + 60), y + d.y * (half * 2 + 60), z + d.z * (half * 2 + 60));
  };
  aim(0, 0, 30);
  return { hemi: H, sun: L, aim, dir: d };
}

/** the whole outdoor world in one call; everything lives under W.root */
export function rbxWorld(studio, { size = 600, color = 0x7f8389, fog = [140, 1100], sun, sky = {}, plate = true } = {}) {
  rbxEnv(studio);
  const root = new THREE.Group(); studio.scene.add(root);
  const skyM = rbxSky(root, sky);
  const plateM = plate ? baseplate(root, { size, color }) : null;
  const L = rbxLights(root, sun || {});
  const fogO = new THREE.Fog(SKY.fog, fog[0], fog[1]); studio.scene.fog = fogO; studio.scene.background = new THREE.Color(SKY.horizon);
  studio.camera.far = Math.max(studio.camera.far, 2000); studio.camera.near = 0.05; studio.camera.updateProjectionMatrix();
  return {
    root, sky: skyM, plate: plateM, lights: L, fog: fogO, aim: L.aim,
    setFog(near, far) { fogO.near = near; fogO.far = far; },
    update(t) { skyM.material.map.offset.x = (t * 0.0015) % 1; },
  };
}

/** a blocky tree: a brown trunk block + a rounded leaf block (or a cone for 'pine') */
export function rbxTree(kind = 'round', { scale = 1, leaf = 0x4ca83a, trunk = 0x7a4f2a } = {}) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.5), plastic(trunk, { rough: 0.6 })); t.position.y = 1.1; t.castShadow = true; g.add(t);
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.6 - i * 0.4, 1.6, 8), plastic(leaf, { rough: 0.6 })); c.position.y = 2.2 + i * 0.95; c.castShadow = true; g.add(c); }
  } else {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), plastic(leaf, { rough: 0.6 })); b.position.y = 3.2; b.scale.set(1, 0.92, 1); b.castShadow = true; g.add(b);
  }
  g.scale.setScalar(scale);
  return g;
}
