// Voxel style (059): the outdoor world around a set — bright flat daylight, a gradient sky, flat chunky clouds, an endless
// block-textured ground, far voxel forests / hills / a downtown, sky-coloured fog. Everything parented to one root.
//   const W = voxWorld(studio, { size: 24000, clouds: { y: 1500 } });
//   W.aim(cx, cz, half)            // per shot: put the sun's crisp shadow where the action is (half = metres covered)
//   W.update(t)                    // cloud drift
//   W.setFog(near, far)            // big shots push the fog out (a 2 km giant needs far ≈ 20 km)
// LOOK (story.json): { "exposure": 1.0, "bloom": 0.04, "grain": 0, "vignette": 0.1, "saturation": 1.08, "warm": 0.2, "fill": 0.25,
//   "toneMapping": "neutral" } — VOX_LOOK below. No bloom haze: the look is crisp edges + flat bright colour.
import * as THREE from 'three';
import { VoxGrid, meshGrid, instanceModel, colorBlock, hash3 } from './vox.js';
import { tileTexture } from './tex.js';

export const VOX_LOOK = { exposure: 1.0, toneMapping: 'neutral', bloom: 0.04, bloomThreshold: 0.98, grain: 0, vignette: 0.1, saturation: 1.08, warm: 0.2, fill: 0.25, lift: 0.0 };
export const SKY = { top: 0x4f8fe8, mid: 0x7fb3f2, horizon: 0xcfe6fb, fog: 0xc6dff7 };

/** sky dome that follows the camera (gradient, no stars), fog: false */
export function voxSky(parent, { r = 9000, top = SKY.top, mid = SKY.mid, horizon = SKY.horizon } = {}) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512);
  const h = (x) => '#' + x.toString(16).padStart(6, '0');
  gr.addColorStop(0, h(top)); gr.addColorStop(0.55, h(mid)); gr.addColorStop(0.92, h(horizon)); gr.addColorStop(1, h(horizon));
  g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.SphereGeometry(r, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);    // a bit below the horizon too
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  sky.onBeforeRender = (renderer, scene, camera) => { const p = camera.getWorldPosition(new THREE.Vector3()); sky.parent.worldToLocal(p); sky.position.copy(p); sky.updateMatrixWorld(); };
  parent.add(sky);
  return sky;
}

/** flat chunky clouds: instanced cells of a coarse grid (cell m), lit white, slightly see-through, drifting along +x */
export function voxClouds(parent, { y = 220, cell = 12, thick = 4, area = 3000, cover = 0.32, seed = 3, opacity = 0.88, speed = 1.2, clear = [] } = {}) {   // clear: [[x, z, r]] keep holes (a sightline)
  const n = Math.floor(area / cell), cells = [];
  for (let i = -n / 2; i < n / 2; i++) for (let j = -n / 2; j < n / 2; j++) {
    // blobby coverage: a few octaves of hashed value noise on the cell grid
    const v = vnoise(i / 6, j / 6, seed) * 0.6 + vnoise(i / 2.5, j / 2.5, seed + 7) * 0.4;
    if (v < 1 - cover) continue;
    if (clear.some(([cx, cz, r]) => Math.hypot(i * cell - cx, j * cell - cz) < r)) continue;
    cells.push([i * cell, j * cell]);
  }
  const geo = new THREE.BoxGeometry(cell, thick, cell);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xdfe9f7, emissiveIntensity: 0.55, transparent: opacity < 1, opacity, depthWrite: true, fog: true });
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, cells.length));
  const m4 = new THREE.Matrix4();
  cells.forEach(([x, z], k) => { m4.makeTranslation(x, y, z); im.setMatrixAt(k, m4); });
  im.frustumCulled = false; im.renderOrder = 3; im.castShadow = false;
  const g = new THREE.Group(); g.add(im); parent.add(g);
  return { group: g, mesh: im, y, update(t) { g.position.x = (t * speed) % cell; } };
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const f = (t) => t * t * (3 - 2 * t), h = (a, b) => hash3(a, 0, b, s);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return (a + (b - a) * f(xf)) + ((c + (d - c) * f(xf)) - (a + (b - a) * f(xf))) * f(yf);
}

/** hemi + one crisp sun with shadows; aim(x, z, half) re-centres the shadow box per shot */
export function voxLights(parent, { sun = 2.1, hemi = 1.35, dir = [-0.45, 1, -0.55], shadowSize = 4096 } = {}) {   // dir = toward the sun: from the −z side (lights faces that look −z, toward a camera on the street)
  const H = new THREE.HemisphereLight(0xdcebff, 0x9cb07a, hemi); parent.add(H);
  const S = new THREE.DirectionalLight(0xfff4e2, sun);
  S.castShadow = true; S.shadow.mapSize.set(shadowSize, shadowSize); S.shadow.bias = -0.0004; S.shadow.normalBias = 0.02;
  parent.add(S, S.target);
  const D = new THREE.Vector3(...dir).normalize();
  function aim(x, z, half = 40, y = 0) {
    S.target.position.set(x, y, z); S.position.set(x + D.x * half * 3, y + D.y * half * 3, z + D.z * half * 3);
    Object.assign(S.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 0.1, far: half * 7 });
    S.shadow.camera.updateProjectionMatrix(); S.shadow.bias = -0.0002 - 0.000004 * half; S.shadow.normalBias = 0.02 * Math.max(1, half / 40);
    S.target.updateMatrixWorld();
  }
  aim(0, 0, 40);
  return { hemi: H, sun: S, aim, dir: D };
}

/**
 * The world around a set: a ground plane (block grass to the horizon), sky, clouds, lights, fog, optional far scenery.
 * opts: size (m, 24000), clouds {y, cover, …} | false, far: {forest, hills, city} options | false, ground tile ('grass_top').
 */
export function voxWorld(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const size = opts.size ?? 24000;
  const gtex = tileTexture(opts.ground ?? 'grass_top', [size, size]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ map: gtex, color: 0xffffff }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.25; ground.receiveShadow = true; root.add(ground);
  const sky = voxSky(root, { r: Math.min(size * 0.45, 12000) });
  const L = voxLights(root, opts.lights || {});
  const clouds = opts.clouds === false ? null : voxClouds(root, opts.clouds || {});
  const fog = new THREE.Fog(SKY.fog, opts.fogNear ?? 120, opts.fogFar ?? 900);
  scene.fog = fog; scene.background = new THREE.Color(SKY.horizon);
  const far = opts.far === false ? null : farScenery(root, opts.far || {});
  function setFog(near, farD) { fog.near = near; fog.far = farD; }
  return { root, ground, sky, clouds, fog, far, ...L, setFog, update(t) { clouds?.update(t); } };
}

// ---------------------------------------------------------------- far scenery (instanced: cheap at any distance)
function treeModel(kind = 0) {
  const G = new VoxGrid(), leaf = ['leaves', 'leaves_b', 'leaves_pink'][kind % 3];
  G.fill(0, 0, 0, 0, 3, 0, 'log');
  G.blob(0, 4.5, 0, 2.4, 2.0, 2.4, leaf, 0.35, 11 + kind);
  G.fill(0, 6, 0, 0, 6, 0, leaf);
  return meshGrid(G, { bs: 1, ao: true });
}
/** a small voxel tree (trunk + leaf blob) as a reusable model: kind 0 green, 1 lime, 2 pink blossom */
export function voxTree(kind = 0) { return treeModel(kind); }

function farScenery(root, { forest = true, hills = true, stone = false, city = true, inner = 260, outer = 6000, seed = 5, cityAt = [-2600, -3400], citySpread = 700 } = {}) {
  const out = {};
  if (forest) {
    const items = [[], [], []];
    for (let i = 0; i < 2600; i++) {
      const a = hash3(i, 1, 2, seed) * Math.PI * 2, rr = inner + Math.pow(hash3(i, 3, 4, seed), 0.7) * (outer - inner);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (vnoise(x / 300, z / 300, seed) < 0.48) continue;                     // forests in patches
      const s = 1 + hash3(i, 5, 6, seed) * 1.4;
      items[i % 2].push({ x, z, s, r: Math.floor(hash3(i, 7, 8, seed) * 4) * Math.PI / 2 });
    }
    out.forest = items.flatMap((it, k) => it.length ? instanceModel(treeModel(k), it, root) : []);
  }
  if (hills) {
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const mats = [new THREE.MeshLambertMaterial({ map: tileTexture('grass_top', [6, 6]) }), new THREE.MeshLambertMaterial({ map: tileTexture('stone', [6, 6]) })];
    const cols = [];
    for (let i = 0; i < 380; i++) {
      const a = hash3(i, 9, 1, seed) * Math.PI * 2, rr = 2600 + hash3(i, 2, 9, seed) * 5200;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr, w = 140 + hash3(i, 4, 4, seed) * 260;
      const h = (30 + 140 * Math.pow(hash3(i, 6, 1, seed), 1.6)) * (rr / 5000);
      cols.push({ x, z, w, h, m: stone && h > 120 ? 1 : 0 });
    }
    out.hills = mats.map((m, k) => {
      const list = cols.filter((c) => c.m === k), im = new THREE.InstancedMesh(geo, m, Math.max(1, list.length)), m4 = new THREE.Matrix4();
      list.forEach((c, j) => { m4.compose(new THREE.Vector3(c.x, -1, c.z), new THREE.Quaternion(), new THREE.Vector3(c.w, c.h, c.w)); im.setMatrixAt(j, m4); });
      im.frustumCulled = false; im.receiveShadow = true; root.add(im); return im;
    });
  }
  if (city) {
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const mats = ['tower_glass', 'tower_stone'].map((t) => new THREE.MeshLambertMaterial({ map: tileTexture(t, [1, 1]) }));
    const list = [[], []];
    for (let i = 0; i < 170; i++) {
      const dx = (hash3(i, 1, 1, seed + 2) - 0.5) * citySpread * 2, dz = (hash3(i, 2, 2, seed + 2) - 0.5) * citySpread * 2;
      const dcen = Math.hypot(dx, dz) / citySpread;
      const h = Math.max(20, (60 + 360 * Math.pow(hash3(i, 3, 3, seed + 2), 2.2)) * Math.max(0.15, 1 - dcen));
      const w = 24 + hash3(i, 4, 4, seed + 2) * 40;
      list[i % 2].push({ x: cityAt[0] + Math.round(dx / 10) * 10, z: cityAt[1] + Math.round(dz / 10) * 10, w, h });
    }
    out.city = list.map((L2, k) => {
      const im = new THREE.InstancedMesh(geo, mats[k], L2.length), m4 = new THREE.Matrix4();
      L2.forEach((c, j) => { m4.compose(new THREE.Vector3(c.x, 0, c.z), new THREE.Quaternion(), new THREE.Vector3(c.w, c.h, c.w)); im.setMatrixAt(j, m4); });
      // the window texture repeats per ~8 m of facade: scale UVs per instance via a world-space shader tweak
      mats[k].onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
          #ifdef USE_INSTANCING
            vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
            vec3 an = abs(normal);
            vec2 fs = an.x > 0.5 ? vec2(sc.z, sc.y) : an.z > 0.5 ? vec2(sc.x, sc.y) : vec2(sc.x, sc.z);
            vMapUv = uv * fs / 8.0;
          #endif`);
      };
      mats[k].customProgramCacheKey = () => 'voxcity' + k;
      mats[k].map.wrapS = mats[k].map.wrapT = THREE.RepeatWrapping;
      im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true; root.add(im); return im;
    });
  }
  return out;
}
export { vnoise };
