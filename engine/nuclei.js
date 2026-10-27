// Bare-nuclei FX (video 027 "What if every electron disappeared?"): matter that falls apart into glowing dots.
//
//  patchDissolve(root, U)   patches every mesh material under `root` (Standard/Lambert/Basic/Phong/Physical, instanced too)
//                           with a world-space noise dissolve: pixels whose noise < U.uDis.value are discarded and the edge
//                           glows (U.uGlow). One U per group you want to control together (the set, the cast). uDis 0 = intact.
//  makeNucleiCloud(scene, o) one THREE.Points cloud for many sources. Add sources with add(objects, n, o) (samples their
//                           visible meshes, world space, area-weighted, with each material's color), then set(reach, o).
//                           The shader moves every dot along its surface normal by max(0, reach − depth): the "explosion front"
//                           model of 027 (each nucleus starts moving when the news that the electrons are gone reaches its
//                           depth, then moves at ≈ light speed), so reach = c·τ in scene meters. depth = rnd · thick.
//  addPlanet(R, n, colorAt)  the same cloud filled with a planet: dots in the volume (denser near the surface), radial normals,
//                           depth = R − r, so reach = c·τ gives r = r0 + max(0, cτ − (R − r0)) (at cτ = R the planet is twice its size).
//  makeAtomLattice(o)       the micro view: a slab of atoms (fuzzy electron clouds + tiny bright nuclei); set(clouds 0..1, spread).
// Deterministic (rng seeds only).
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { rng } from '@engine/core.js';

const NOISE = /* glsl */`
float dHash(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dHash(i), dHash(i + vec3(1,0,0)), f.x), mix(dHash(i + vec3(0,1,0)), dHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dHash(i + vec3(0,0,1)), dHash(i + vec3(1,0,1)), f.x), mix(dHash(i + vec3(0,1,1)), dHash(i + vec3(1,1,1)), f.x), f.y), f.z); }
`;

/** Dissolve every material under root with the shared uniforms U = {uDis, uGlow, uFreq, uEdge} (missing ones are created). */
export function patchDissolve(root, U = {}) {
  U.uDis = U.uDis || { value: 0 }; U.uGlow = U.uGlow || { value: new THREE.Color(0x9fd0ff) };
  U.uFreq = U.uFreq || { value: 9.0 }; U.uEdge = U.uEdge || { value: 0.06 };
  const done = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m || done.has(m) || m.isShaderMaterial || m.userData.dis027) continue;
      if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshBasicMaterial || m.isMeshPhongMaterial)) continue;
      done.add(m); m.userData.dis027 = U;
      const prev = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => {
        if (prev) prev.call(m, sh, r);
        sh.uniforms.uDis = U.uDis; sh.uniforms.uDisGlow = U.uGlow; sh.uniforms.uDisFreq = U.uFreq; sh.uniforms.uDisEdge = U.uEdge;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDisW;')
          .replace('#include <project_vertex>', '#include <project_vertex>\nvDisW = transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz);');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vDisW; uniform float uDis; uniform vec3 uDisGlow; uniform float uDisFreq; uniform float uDisEdge;' + NOISE)
          .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  float disN = 0.65 * dNoise(vDisW * uDisFreq) + 0.35 * dNoise(vDisW * uDisFreq * 3.1);
  float disTh = uDis * 1.2 - 0.1;
  if (uDis > 0.0 && disN < disTh) discard;
  float disEdge = uDis > 0.0 ? 1.0 - smoothstep(0.0, uDisEdge, disN - disTh) : 0.0;`)
          .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  gl_FragColor.rgb += uDisGlow * disEdge * 2.5;');
      };
      m.customProgramCacheKey = () => 'dis027' + (prev ? prev.toString().length : 0);
      m.needsUpdate = true;
    }
  });
  return U;
}

const VS = /* glsl */`
uniform float uReach, uThick, uLift, uSpread, uSize, uPix, uFade, uSpin, uTime, uMinR;
uniform vec3 uUp;
attribute vec3 aDir; attribute vec3 aCol; attribute vec4 aRnd; attribute float aGrp;
uniform float uOn[8]; uniform float uReachG[8]; uniform float uThickG[8];
varying vec3 vCol; varying float vA;
void main(){
  int g = int(aGrp + 0.5);
  float on = uOn[g];
  float reach = uReachG[g] >= 0.0 ? uReachG[g] : uReach;
  float thick = uThickG[g] >= 0.0 ? uThickG[g] : uThick;
  float depth = aRnd.x * thick;
  float d = max(0.0, reach - depth);
  vec3 jit = vec3(aRnd.y - 0.5, aRnd.z - 0.5, aRnd.w - 0.5);
  vec3 dir = normalize(aDir + jit * uSpread + uUp * uLift);
  float k = d * (0.75 + 0.5 * aRnd.w);
  vec3 p = position + dir * k;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float moving = smoothstep(0.0, max(uMinR, 1e-6), d);
  gl_PointSize = max(1.2, uSize * (0.55 + 0.9 * aRnd.y) * uPix / max(0.001, -mv.z));
  vCol = aCol * (0.85 + 0.6 * moving);
  vA = on * mix(uFade, 1.0, moving) * (0.75 + 0.25 * sin(uTime * (3.0 + 4.0 * aRnd.z) + aRnd.y * 40.0));
  if (on < 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;
const FS = /* glsl */`
uniform float uGain;
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float r = dot(c, c) * 4.0;
  if (r > 1.0) discard;
  float a = (1.0 - r); a *= a;
  gl_FragColor = vec4(vCol * uGain * a * vA, 1.0);
}`;

/** A dot cloud. Groups (0..7) let one cloud hold several sources with their own on/reach/thick. */
export function makeNucleiCloud(scene, o = {}) {
  const max = o.max ?? 200000, R = rng(o.seed ?? 27);
  const pos = new Float32Array(max * 3), dir = new Float32Array(max * 3), col = new Float32Array(max * 3), rnd = new Float32Array(max * 4), grp = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
  geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
  geo.setAttribute('aGrp', new THREE.BufferAttribute(grp, 1));
  const U = {
    uReach: { value: 0 }, uThick: { value: 0.3 }, uLift: { value: 0 }, uSpread: { value: 0.8 }, uSize: { value: 0.012 }, uPix: { value: 1000 },
    uFade: { value: 0 }, uSpin: { value: 0 }, uTime: { value: 0 }, uMinR: { value: 0.02 }, uUp: { value: new THREE.Vector3(0, 1, 0) }, uGain: { value: 1.6 },
    uOn: { value: new Array(8).fill(0) }, uReachG: { value: new Array(8).fill(-1) }, uThickG: { value: new Array(8).fill(-1) },
  };
  const material = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const points = new THREE.Points(geo, material); points.frustumCulled = false; scene.add(points);
  let n = 0;
  const tmpP = new THREE.Vector3(), tmpN = new THREE.Vector3(), tmpC = new THREE.Color(), nm = new THREE.Matrix3(), M = new THREE.Matrix4(), IM = new THREE.Matrix4();
  const push = (p, nrm, c, g, depthFrac) => {
    if (n >= max) return;
    pos.set([p.x, p.y, p.z], n * 3); dir.set([nrm.x, nrm.y, nrm.z], n * 3); col.set([c.r, c.g, c.b], n * 3);
    rnd.set([depthFrac ?? Math.pow(R(), 1.6), R(), R(), R()], n * 4); grp[n] = g; n++;
  };
  const meshArea = (geom) => {
    const g = geom.index ? geom : geom; const P = g.attributes.position, I = g.index; let a = 0;
    const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
    const cnt = I ? I.count : P.count;
    for (let i = 0; i < cnt; i += 3) { const ia = I ? I.getX(i) : i, ib = I ? I.getX(i + 1) : i + 1, ic = I ? I.getX(i + 2) : i + 2; A.fromBufferAttribute(P, ia); B.fromBufferAttribute(P, ib); C.fromBufferAttribute(P, ic); a += B.sub(A).cross(C.sub(A)).length() * 0.5; }
    return a;
  };
  /** Sample n dots from the visible meshes under objects (call after posing + updateMatrixWorld). o.group, o.tint, o.pick(mesh). */
  function add(objects, count, so = {}) {
    const g = so.group ?? 0, list = [];
    for (const ob of [].concat(objects)) {
      ob.updateMatrixWorld(true);
      ob.traverseVisible((m) => {
        if (!m.isMesh || !m.geometry?.attributes?.position || m.material?.isShaderMaterial) return;
        if (so.pick && !so.pick(m)) return;
        const mm = Array.isArray(m.material) ? m.material[0] : m.material;
        if (!mm || mm.opacity < 0.05 || mm.visible === false) return;
        const s = new THREE.Vector3(); m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), s);
        const inst = m.isInstancedMesh ? m.count : 1;
        const a = meshArea(m.geometry) * Math.abs(s.x * s.y + s.y * s.z + s.z * s.x) / 3 * inst;
        if (a > 0) list.push({ m, a, mm });
      });
    }
    const tot = list.reduce((x, e) => x + e.a, 0); if (!tot) return 0;
    let made = 0;
    for (const e of list) {
      const k = Math.max(1, Math.round(count * e.a / tot));
      const sam = new MeshSurfaceSampler(e.m).build();
      const base = tmpC.copy(e.mm.color || new THREE.Color(1, 1, 1));
      const em = e.mm.emissive && e.mm.emissiveIntensity > 0.3 ? e.mm.emissive : null;
      for (let i = 0; i < k; i++) {
        sam.sample(tmpP, tmpN);
        if (e.m.isInstancedMesh) { e.m.getMatrixAt(Math.floor(R() * e.m.count), IM); M.multiplyMatrices(e.m.matrixWorld, IM); } else M.copy(e.m.matrixWorld);
        tmpP.applyMatrix4(M); tmpN.applyMatrix3(nm.getNormalMatrix(M)).normalize();
        let c = base.clone(); if (em) c.lerp(em, 0.5);
        if (e.m.isInstancedMesh && e.m.instanceColor) { const ic = new THREE.Color(); e.m.getColorAt(0, ic); c.multiply(ic); }
        if (so.tint) c.lerp(so.tint, so.tintK ?? 0.3);
        c.multiplyScalar(so.gain ?? 1);
        push(tmpP, tmpN, c, g); made++;
      }
    }
    geo.setDrawRange(0, n); markDirty();
    return made;
  }
  /** A planet (center c, radius R0) as dots: frac on the surface shell, the rest in the volume. colorAt(dir, depthFrac) → Color. */
  function addPlanet(c, R0, count, colorAt, so = {}) {
    const g = so.group ?? 0, surf = so.surface ?? 0.55;
    for (let i = 0; i < count; i++) {
      const u = R() * 2 - 1, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      tmpN.set(Math.cos(a) * s, u, Math.sin(a) * s);
      const r = i < count * surf ? R0 * (1 - 0.012 * R()) : R0 * Math.cbrt(R());
      tmpP.copy(tmpN).multiplyScalar(r).add(c);
      const df = 1 - r / R0;
      push(tmpP, tmpN, colorAt(tmpN, df), g, df);
      rnd[(n - 1) * 4 + 1] = 0.35 + 0.3 * R();   // even dot sizes
    }
    geo.setDrawRange(0, n); markDirty();
  }
  function markDirty() { for (const k of ['position', 'aDir', 'aCol', 'aRnd', 'aGrp']) geo.attributes[k].needsUpdate = true; geo.computeBoundingSphere(); }
  /** per frame: global reach/thick + per-group on/reach/thick; camera fov → dot pixel scale. */
  function set(camera, t, o2 = {}) {
    U.uPix.value = 1920 / (2 * Math.tan((camera.fov * Math.PI) / 360));
    U.uTime.value = t;
    for (const k of ['reach', 'thick', 'lift', 'spread', 'size', 'fade', 'minR', 'gain']) if (o2[k] !== undefined) U['u' + k[0].toUpperCase() + k.slice(1)].value = o2[k];
    if (o2.up) U.uUp.value.copy(o2.up);
    if (o2.groups) for (let i = 0; i < 8; i++) { const G = o2.groups[i]; U.uOn.value[i] = G ? G.on ?? 1 : 0; U.uReachG.value[i] = G && G.reach !== undefined ? G.reach : -1; U.uThickG.value[i] = G && G.thick !== undefined ? G.thick : -1; }
    points.visible = U.uOn.value.some((v) => v > 0);
  }
  return { points, U, add, addPlanet, set, get count() { return n; } };
}

/** Micro view: nx × nz × ny atoms (spacing s) — fuzzy electron clouds + bright nuclei. set(cloudK, spread, lift, t). */
export function makeAtomLattice(o = {}) {
  const nx = o.nx ?? 14, nz = o.nz ?? 10, ny = o.ny ?? 5, s = o.s ?? 1, R = rng(o.seed ?? 5);
  const g = new THREE.Group(), N = nx * ny * nz;
  const cloudTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(160,210,255,0.9)'); gr.addColorStop(0.35, 'rgba(90,150,255,0.55)'); gr.addColorStop(0.75, 'rgba(60,110,230,0.16)'); gr.addColorStop(1, 'rgba(40,80,200,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const cloudGeo = new THREE.BufferGeometry(), cp = new Float32Array(N * 3); cloudGeo.setAttribute('position', new THREE.BufferAttribute(cp, 3));
  const clouds = new THREE.Points(cloudGeo, new THREE.PointsMaterial({ map: cloudTex, size: s * 1.9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: true, color: 0xffffff }));
  clouds.frustumCulled = false; g.add(clouds);
  const nuc = new THREE.InstancedMesh(new THREE.SphereGeometry(s * 0.07, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.55, 0.35).multiplyScalar(2.2), toneMapped: false }), N);
  nuc.frustumCulled = false; g.add(nuc);
  const glow = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: cloudTex, size: s * 0.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, color: 0xffa070 }));
  const gp = new Float32Array(N * 3); glow.geometry.setAttribute('position', new THREE.BufferAttribute(gp, 3)); glow.frustumCulled = false; g.add(glow);
  const P0 = [], J = [];
  for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    P0.push(new THREE.Vector3((x - (nx - 1) / 2 + (y % 2) * 0.5) * s, -y * s * 0.86, (z - (nz - 1) / 2 + (y % 2) * 0.5) * s));
    J.push(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5));
  }
  const M = new THREE.Matrix4(), V = new THREE.Vector3();
  /** cloudK 1 = electron clouds on, 0 = gone; spread ≥ 0 = how far the nuclei have shoved apart (in spacings); lift = top-layer rise. */
  function set(cloudK, spread = 0, lift = 0, t = 0) {
    for (let i = 0; i < N; i++) {
      const p0 = P0[i], depth = -p0.y / (s * 0.86);
      V.copy(p0).multiplyScalar(1 + spread * 0.22).addScaledVector(J[i], spread * 0.12 * s);
      V.y += lift * s * 1.4 * Math.max(0, 1 - depth / ny);
      if (cloudK > 0) { const w = 0.03 * s * Math.sin(t * 3 + i); cp[i * 3] = p0.x + w; cp[i * 3 + 1] = p0.y; cp[i * 3 + 2] = p0.z; }
      else { cp[i * 3] = cp[i * 3 + 1] = cp[i * 3 + 2] = 1e6; }
      M.makeTranslation(V.x, V.y, V.z); nuc.setMatrixAt(i, M); gp[i * 3] = V.x; gp[i * 3 + 1] = V.y; gp[i * 3 + 2] = V.z;
    }
    clouds.material.opacity = cloudK; clouds.visible = cloudK > 0.002;
    nuc.instanceMatrix.needsUpdate = true; cloudGeo.attributes.position.needsUpdate = true; glow.geometry.attributes.position.needsUpdate = true;
  }
  set(1);
  return { g, set, clouds, nuc, glow, N };
}
