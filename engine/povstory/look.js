// POV story look (086, docs/POVSTORY.md): the two things that make a three.js scene read like the reference reels' "action-cam
// cartoon" — a fisheye lens and black ink outlines. Both are opt-in helpers; nothing shared changes.
//   const lens = addFisheyePass(studio, { k: 0.45 });   // barrel distortion after the render (before the grade: vignette + grain stay flat)
//   lens.set(k)                                         // 0 = off; 0.35–0.55 = GoPro-ish; ramp it for a "head snaps" moment
//   addInk(root, { width: 0.0032, color: 0x14121a })     // inverted-hull outlines on every solid mesh under root (screen-constant width)
// Render the camera ~10–20° wider than you want to see: the pass magnifies the centre by (1 + k) and keeps the corners.
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const FisheyeShader = {
  uniforms: { tDiffuse: { value: null }, uK: { value: 0.45 }, uAspect: { value: 1080 / 1920 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uK, uAspect; varying vec2 vUv;
    void main(){
      // r = distance from the centre in frame-height units, normalised so the corners sit at r = 1; sampling radius
      // r·(1 + k r²)/(1 + k) maps the corners onto themselves and magnifies the middle = straight lines bow outward (barrel)
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      float rmax = length(vec2(uAspect, 1.0) * 0.5);
      float r = length(p) / rmax;
      vec2 q = p * (1.0 + uK * r * r) / (1.0 + uK);
      vec2 uv = q / vec2(uAspect, 1.0) + 0.5;
      gl_FragColor = texture2D(tDiffuse, clamp(uv, 0.0005, 0.9995));
    }`,
};

export function addFisheyePass(studio, { k = 0.45 } = {}) {
  const pass = new ShaderPass(FisheyeShader);
  const C = studio.composer, gi = C.passes.indexOf(studio.grade);
  if (gi >= 0) C.insertPass(pass, gi); else C.addPass(pass);   // before the grade: the vignette + grain are not bent
  const set = (v) => { pass.uniforms.uK.value = v; pass.enabled = v > 0.001; };
  set(k);
  return { pass, set };
}

// ---- ink outlines ---------------------------------------------------------------------------------------------------
// Each solid mesh gets a child "hull": the same geometry drawn back-faces-only in flat ink, pushed out along its normals by
// width × view depth (so a line is ~3 px wide at any distance). Being a child, the hull follows the mesh's transform AND its
// visibility (a hidden mesh hides its outline). Skipped: flat geometry (planes/circles: their hull would show as a black sheet
// from behind), transparent/additive/shader materials (beams, glows, decals), sprites, points, lines, meshes tagged
// userData.noInk, and anything already inked. InstancedMesh hulls share the source's instanceMatrix.
const INK_VS = `
  uniform float uInk;
  void main(){
    vec4 p = vec4(position, 1.0); vec3 n = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p; n = mat3(instanceMatrix) * n;
    #endif
    vec4 mv = modelViewMatrix * p;
    vec3 vn = normalize(normalMatrix * n);
    mv.xyz += vn * uInk * max(0.2, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const INK_FS = 'uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }';
const FLAT = new Set(['PlaneGeometry', 'CircleGeometry', 'RingGeometry', 'ShapeGeometry']);

export function inkMaterial({ width = 0.0032, color = 0x14121a } = {}) {
  return new THREE.ShaderMaterial({ uniforms: { uInk: { value: width }, uColor: { value: new THREE.Color(color) } }, vertexShader: INK_VS, fragmentShader: INK_FS, side: THREE.BackSide });
}

export function addInk(root, { width = 0.0032, color = 0x14121a, material = null, filter = null } = {}) {
  const M = material || inkMaterial({ width, color });
  const list = [];
  root.traverse((o) => { if (o.isMesh && !o.userData.isInk) list.push(o); });   // collect first: adding children while traversing loops forever
  let n = 0;
  for (const o of list) {
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m || o.userData.noInk || o.userData.inked || m.transparent || m.isShaderMaterial || m.blending === THREE.AdditiveBlending) continue;
    if (FLAT.has(o.geometry.type) || !o.geometry.attributes.normal) continue;
    if (filter && !filter(o)) continue;
    let h;
    if (o.isInstancedMesh) { h = new THREE.InstancedMesh(o.geometry, M, o.count); h.instanceMatrix = o.instanceMatrix; h.frustumCulled = false; }
    else h = new THREE.Mesh(o.geometry, M);
    h.userData.isInk = true; h.castShadow = false; h.receiveShadow = false; h.renderOrder = o.renderOrder;
    o.add(h); o.userData.inked = true; n++;
  }
  return { material: M, count: n, set: (w) => { M.uniforms.uInk.value = w; } };
}
