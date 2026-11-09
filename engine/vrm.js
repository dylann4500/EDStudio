// VRoid / VRM characters in the EDStudio renderer (the goth cheat-tutor for the pixel-art Scribe reels).
// A .vrm file is glTF binary: three's GLTFLoader reads its meshes, skeleton, textures and blendshapes (the VRM extensions —
// MToon, spring bones — are ignored). We swap every material to cel shading (MeshToonMaterial + pixeltex.toonRamp, keeping the
// texture, alpha cut-outs and double-sided hair) and add an ink outline that follows skinning + morphs, so the character sits in
// the same look as engine/pixel.js. No extra npm dependency.
//   const ch = await loadVRM('/videos/054-…/vex.vrm');  scene.add(ch.root);
//   ch.bone('J_Bip_L_UpperArm').rotation.z = 1.1;  ch.face({ blink: 1, A: 0.6, joy: 0.3 });  ch.update(t)  (hair sway)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { toonRamp } from './pixeltex.js';

let RAMP = null;
const ramp = () => (RAMP ??= toonRamp([0.62, 0.66, 0.78, 0.95, 1, 1, 1, 1]));

/** An inverted-hull ink line that works on skinned + morphed meshes (pushes the skinned vertex along its skinned normal). */
export function outlineMaterial(width = 0.0016, color = 0x16101a) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uW = { value: width };
    sh.vertexShader = 'uniform float uW;\n' + sh.vertexShader.replace('#include <skinning_vertex>', `#include <skinning_vertex>
      #ifdef USE_SKINNING
        transformed += normalize(objectNormal) * uW;
      #else
        transformed += normalize(normal) * uW;
      #endif`);
    if (!sh.vertexShader.includes('beginnormal_vertex')) sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <beginnormal_vertex>\n#include <begin_vertex>');
  };
  m.customProgramCacheKey = () => 'ink-' + width;
  return m;
}

const toToon = (src) => {
  const m = new THREE.MeshToonMaterial({
    color: src.color ? src.color.clone() : new THREE.Color(0xffffff), map: src.map || null, gradientMap: ramp(),
    transparent: src.transparent, opacity: src.opacity ?? 1, alphaTest: src.alphaTest || (src.transparent ? 0 : 0), side: src.side,
    emissive: src.emissive ? src.emissive.clone() : new THREE.Color(0), emissiveMap: src.emissiveMap || null,
  });
  if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
  m.name = src.name;
  return m;
};

export async function loadVRM(url, { outline = 0.0016, noOutline = /eye|face_?eye|highlight|brow|lash|mouth|tooth|teeth/i } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  const bones = {}, morphMeshes = [];
  root.traverse((o) => {
    if (o.isBone) bones[o.name] = o;
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const toon = mats.map(toToon);
    if (o.geometry.attributes.color) toon.forEach((m) => { m.vertexColors = true; m.color.set(0xffffff); });   // a painted-on outfit (tools/anime/body.py)
    o.material = Array.isArray(o.material) ? toon : toon[0];
    if (o.morphTargetDictionary) morphMeshes.push(o);
    // ink outline: a clone that shares geometry + skeleton, drawn back faces only (skip eyes / transparent bits)
    const opaque = toon.every((m) => !m.transparent);
    if (outline > 0 && opaque && !noOutline.test(o.name + ' ' + mats.map((m) => m.name).join(' '))) {
      const ink = o.isSkinnedMesh ? new THREE.SkinnedMesh(o.geometry, outlineMaterial(outline)) : new THREE.Mesh(o.geometry, outlineMaterial(outline));
      if (o.isSkinnedMesh) { ink.bind(o.skeleton, o.bindMatrix); ink.bindMode = o.bindMode; }
      ink.morphTargetInfluences = o.morphTargetInfluences; ink.morphTargetDictionary = o.morphTargetDictionary;
      ink.castShadow = false; ink.frustumCulled = false; ink.renderOrder = -1;
      o.parent.add(ink); ink.position.copy(o.position); ink.quaternion.copy(o.quaternion); ink.scale.copy(o.scale);
    }
  });
  // rest pose of every bone (pose() writes offsets on top of it)
  const rest = Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b.quaternion.clone()]));
  const bone = (name) => bones[name] || Object.values(bones).find((b) => b.name.endsWith(name));
  const E = new THREE.Euler(), Q = new THREE.Quaternion();
  /** pose({ boneName: [x, y, z] radians added on top of the rest pose }) */
  function pose(map) {
    for (const [k, q] of Object.entries(rest)) bones[k].quaternion.copy(q);
    for (const [k, r] of Object.entries(map || {})) { const b = bone(k); if (!b) continue; b.quaternion.copy(rest[b.name]).multiply(Q.setFromEuler(E.set(r[0] || 0, r[1] || 0, r[2] || 0))); }
  }
  /** face({ name-substring: weight }): e.g. { EYE_Close: 1, MTH_A: 0.6, ALL_Joy: 0.3 } (VRoid's Fcl_* blendshapes) */
  function face(map = {}) {
    for (const m of morphMeshes) {
      m.morphTargetInfluences.fill(0);
      for (const [k, w] of Object.entries(map)) for (const [name, i] of Object.entries(m.morphTargetDictionary)) if (name.toLowerCase().includes(k.toLowerCase())) m.morphTargetInfluences[i] = Math.max(m.morphTargetInfluences[i], w);
    }
  }
  const morphNames = [...new Set(morphMeshes.flatMap((m) => Object.keys(m.morphTargetDictionary)))];
  return { root, gltf, bones, bone, pose, face, morphNames, rest };
}
