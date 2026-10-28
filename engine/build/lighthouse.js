// Rock islet in the open sea + a lighthouse that builds itself up from a flashlight (build genre, video 039 "How a Flashlight
// Becomes a Lighthouse"). Sea level y = 0; the rock's flat top (D.RY) carries Gary's shack, the DAYS WITHOUT A CRASH sign and
// the tower (axis at x = z = 0). The TOWER is cut open at z = 0 (camera on +z): the back half of the shell (section edges in a
// light "cut" colour), spiral stairs round a central weight shaft (half-tube: the clockwork weight is seen falling), the watch
// room (clockwork), the gallery + lantern room (half glass, half dome) with the lens; interior parts are whole.
// The OCEAN is a displaced grid (dense near the rock) driven by WAVES — seaH() is its exact JS mirror, so boats float on the
// same surface the shader draws. Foam on crests + a ring where it meets the rock. setMood(a, b, u) crossfades sky, lights,
// fog, sea colours and the env map between day / dusk / night / storm / fog / dawn.
// Stages (all driven by shots.js): setGrow(y) (the tower rises; clipped), top.visible (gallery + lantern), lamp / mirror / lens
// (setLens k: panels pop on), clockwork (setWeight y), trough.setFill(k) (mercury), beams (setBeams), setLean(a), setSkirt(k)
// (Smeaton's flared granite base), setPaint(y) (daymark spiral painted from the top down), horn, radio, helipad, perch.
// Props: makeGull, makeTug, makeSailboat, makeCruise, makeBarge, makeFish, makeFlashlightProp, makeBoulder, makeFresnelDisc,
// makeOak; floatPose(x, z, t, U) → {y, rx, rz} rides any boat on the waves.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, clamp, lerp } from '../core.js';

const PI = Math.PI, TAU = PI * 2;
export const D = {
  RY: 2.6, plateauR: 5.6, waterR: 8.0,
  T: { r0: 2.25, r1: 1.65, wall: 0.32, base: 3.4, watch: 16.4 },
  GY: 18.4, galR: 2.55, lanR: 1.5, glass0: 18.75, glass1: 21.3, dome1: 22.6,
  focal: [0, 19.8, 0], lensR: 0.82, lensH: 2.1, shaftR: 0.32, stairR: 1.08,
  shack: [3.9, -2.7], sign: [-3.35, 2.55], ladder: [1.6, 5.35], boat: [-6.4, 6.6],
  coastR: 300, nextDoor: [-150, 36, -258],
};
const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
export const signTex = (text, { w = 512, h = 160, bg = '#c0392b', fg = '#fff', px = 96, border = null } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); }
  let s = px; g.font = font(s); while (g.measureText(text).width > w * 0.86 && s > 18) { s -= 4; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + s * 0.06);
});
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const metal = (color, roughness = 0.35, metalness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function beam(parent, a, b, r, m) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); const o = mk(new THREE.CylinderGeometry(r, r, L, 8), m, parent, 0, 0, 0); o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return o; }

// ---------------------------------------------------------------- the sea (shader + exact JS mirror)
// [direction (rad), wavelength (m), calm amplitude, storm amplitude] — long swells carry the storm
export const WAVES = [[0.35, 7.0, 0.08, 0.22], [1.3, 4.6, 0.045, 0.14], [-0.7, 11.0, 0.12, 0.5], [2.4, 3.2, 0.02, 0.09], [0.85, 22.0, 0.08, 1.0], [-1.6, 16.0, 0.05, 0.75]];
const WK = WAVES.map(([a, L, c, s], i) => { const k = TAU / L; return { dx: Math.cos(a), dz: Math.sin(a), k, w: Math.sqrt(9.8 * k), c, s, ph: i * 1.7, short: L < 8 }; });
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
/** Sea height at (x, z): the same sum the ocean shader draws. U = {t, calm, storm, curve, R, bigA, bigZ, bigW}. */
export function seaH(x, z, U) {
  const r = Math.hypot(x, z), fade = sstep(170, 60, r);
  let h = 0;
  for (const q of WK) h += (q.c * U.calm + q.s * U.storm) * (q.short ? fade : 1) * Math.sin(q.k * (q.dx * x + q.dz * z) - q.w * U.t + q.ph);
  if (U.bigA) { const dx = U.bigDX ?? 0, dz = U.bigDZ ?? 1, s = x * dx + z * dz, q = -x * dz + z * dx; h += U.bigA * Math.exp(-(((s - U.bigZ) / U.bigW) ** 2)) * Math.exp(-((q / 70) ** 2)); }   // a single giant crest travelling along (bigDX, bigDZ)
  if (U.curve) h -= U.curve * Math.max(0, r - 10) ** 2 / (2 * U.R);
  return h;
}
/** A floating thing's pose on the waves: height + pitch/roll from the slope (len/beam = its footprint). */
export function floatPose(x, z, yaw, U, len = 4, bm = 1.6) {
  const fx = Math.cos(yaw), fz = -Math.sin(yaw), sx = -fz, sz = fx;
  const hf = seaH(x + fx * len / 2, z + fz * len / 2, U), hb = seaH(x - fx * len / 2, z - fz * len / 2, U);
  const hl = seaH(x + sx * bm / 2, z + sz * bm / 2, U), hr = seaH(x - sx * bm / 2, z - sz * bm / 2, U);
  return { y: (hf + hb + hl + hr) / 4, pitch: Math.atan2(hf - hb, len), roll: Math.atan2(hl - hr, bm) };
}
const GLSL_WAVES = WK.map((q) => `wv(p, vec2(${q.dx.toFixed(5)}, ${q.dz.toFixed(5)}), ${q.k.toFixed(5)}, ${q.w.toFixed(5)}, ${q.ph.toFixed(4)}, (${q.c.toFixed(3)} * uCalm + ${q.s.toFixed(3)} * uStorm) * ${q.short ? 'fade' : '1.0'}, h, g);`).join('\n');
function makeOcean(root) {
  const N = 380, A = 64, B = 560;   // grid: x = A·u + B·u³ → 0.34 m cells at the rock, ~9 m at the 624 m edge
  const map = (u) => A * u + B * u * u * u;
  const pos = new Float32Array((N + 1) * (N + 1) * 3), idx = [];
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const k = (j * (N + 1) + i) * 3; pos[k] = map(i / N * 2 - 1); pos[k + 1] = 0; pos[k + 2] = map(j / N * 2 - 1); }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 900);
  const U = { uT: { value: 0 }, uCalm: { value: 1 }, uStorm: { value: 0 }, uCurve: { value: 0 }, uR: { value: 150 }, uBigA: { value: 0 }, uBigZ: { value: -80 }, uBigW: { value: 6 }, uBigD: { value: new THREE.Vector2(0, 1) },
    uShallow: { value: new THREE.Color(0x2aa6b8) }, uDeep: { value: new THREE.Color(0x0e5a85) }, uFoam: { value: new THREE.Color(0xf4fbff) }, uFoamK: { value: 1 } };
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.0, envMapIntensity: 0.9 });   // 0.16 lit every short ripple into a white zebra pattern
  const WAVEFN = `
uniform float uT, uCalm, uStorm, uCurve, uR, uBigA, uBigZ, uBigW; uniform vec2 uBigD;
varying float vH; varying vec3 vW;
void wv(vec2 p, vec2 d, float k, float w, float ph, float a, inout float h, inout vec2 g) { float s = k * dot(d, p) - w * uT + ph; h += a * sin(s); g += a * k * d * cos(s); }
void sea(vec2 p, out float h, out vec2 g) {
  h = 0.0; g = vec2(0.0); float r = length(p); float fade = (1.0 - smoothstep(60.0, 170.0, r));
  ${GLSL_WAVES}
  if (uBigA > 0.0) { float s = dot(p, uBigD), q = -p.x * uBigD.y + p.y * uBigD.x; float e = exp(-pow((s - uBigZ) / uBigW, 2.0)) * exp(-pow(q / 70.0, 2.0)); h += uBigA * e; g += uBigA * e * (-2.0 * (s - uBigZ) / (uBigW * uBigW) * uBigD - 2.0 * q / 4900.0 * vec2(-uBigD.y, uBigD.x)); }
  if (uCurve > 0.0) { float q = max(0.0, r - 10.0); h -= uCurve * q * q / (2.0 * uR); g -= uCurve * q / uR * p / max(r, 0.001); }
}`;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = WAVEFN + '\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', 'float sH; vec2 sG; sea(position.xz, sH, sG); vec3 objectNormal = normalize(vec3(-sG.x * 0.6, 1.0, -sG.y * 0.6));')
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.x, sH, position.z); vH = sH / (0.4 * uCalm + 2.7 * uStorm + uBigA + 0.05); vW = transformed;');
    sh.fragmentShader = 'uniform vec3 uShallow, uDeep, uFoam; uniform float uT, uFoamK; varying float vH; varying vec3 vW;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float r = length(vW.xz), th = atan(vW.z, vW.x);
      float rw = ${D.waterR.toFixed(2)} * (1.0 + 0.06 * sin(3.0 * th + 1.0) + 0.04 * sin(7.0 * th + 2.0));
      vec3 wc = mix(uDeep, uShallow, clamp(0.5 + 0.3 * vH, 0.0, 1.0));
      float n = sin(vW.x * 1.7 + uT * 0.9) * sin(vW.z * 1.3 - uT * 0.7) + 0.5 * sin(vW.x * 4.1 - vW.z * 3.3 + uT * 1.6);
      float crest = smoothstep(0.85, 1.05, vH + 0.15 * n) * 0.4;
      float ring = (1.0 - smoothstep(0.0, 0.55, r - rw)) * (0.45 + 0.35 * smoothstep(-0.2, 0.8, sin(r * 7.0 - uT * 2.2 + th * 14.0 + 1.5 * n)));   // a thin band: at grazing camera angles a 1 m band filled the frame
      float foam = clamp((crest + ring * 0.75) * uFoamK, 0.0, 1.0);
      diffuseColor.rgb = mix(wc, uFoam, foam * 0.6);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.85, 0.0);');
  };
  const mesh = new THREE.Mesh(geo, m); mesh.receiveShadow = true; mesh.castShadow = false; mesh.frustumCulled = false; root.add(mesh);
  return { mesh, U, mat: m };
}

// ---------------------------------------------------------------- sky, stars, moon, clouds (mood-driven)
function makeSky(root) {
  const U = { uTop: { value: new THREE.Color(0x3d8fe0) }, uHor: { value: new THREE.Color(0xcfe8f5) }, uBot: { value: new THREE.Color(0x2a6f8c) }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color(0xffffff) }, uSunGlow: { value: 1 }, uFlash: { value: 0 }, uCloudCol: { value: new THREE.Color(0xffffff) }, uCloud: { value: 0 }, uT: { value: 0 } };
  const sm = new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uHor, uBot, uSunDir, uSunCol, uCloudCol; uniform float uSunGlow, uFlash, uCloud, uT; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float h = d.y;
        vec3 c = mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.5)); c = mix(c, uBot, (1.0 - smoothstep(-0.12, 0.0, h)));
        float s = max(dot(d, normalize(uSunDir)), 0.0); c += uSunCol * (pow(s, 6.0) * 0.35 + pow(s, 900.0) * 3.0) * uSunGlow;
        vec2 q = d.xz / max(h + 0.08, 0.08) * 0.35; float n = sin(q.x * 7.0 + uT * 0.004) * sin(q.y * 5.0 + 1.3) + 0.6 * sin(q.x * 17.0 + q.y * 13.0) + 0.35 * sin(q.x * 41.0 - q.y * 29.0);
        float cl = smoothstep(0.15, 0.95, n) * smoothstep(0.015, 0.12, h) * (1.0 - smoothstep(0.2, 0.75, h));
        c = mix(c, uCloudCol, cl * uCloud);
        c += uFlash * vec3(0.75, 0.8, 1.0) * smoothstep(-0.05, 0.5, h);
        gl_FragColor = vec4(c, 1.0); }` });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(950, 48, 24), sm); dome.frustumCulled = false; dome.renderOrder = -1; root.add(dome);
  // stars: round soft points (squares read as a grid), only above the horizon
  const R = 900, n = 1600, sp = new Float32Array(n * 3), sz = new Float32Array(n);
  for (let i = 0; i < n; i++) { const u = h2(i, 1), v = 0.04 + 0.96 * h2(i, 2) ** 0.8, th = u * TAU, y = v, rr = Math.sqrt(1 - y * y); sp.set([Math.cos(th) * rr * R, y * R, Math.sin(th) * rr * R], i * 3); sz[i] = 1.4 + 2.6 * h2(i, 3) ** 3; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('size', new THREE.BufferAttribute(sz, 1));
  const starM = new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 } }, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float size; void main(){ vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; gl_PointSize = size; }',
    fragmentShader: 'uniform float uA; void main(){ float d = length(gl_PointCoord - 0.5); float a = (1.0 - smoothstep(0.1, 0.5, d)) * uA; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * a, a); }' });
  const stars = new THREE.Points(sg, starM); stars.frustumCulled = false; stars.renderOrder = -1; root.add(stars);
  const glowT = tex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const moonT = tex(256, 256, (g) => { g.fillStyle = '#f4f1e4'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(160,160,150,${0.25 + h2(i, 4) * 0.25})`; g.beginPath(); g.arc(60 + h2(i, 5) * 140, 60 + h2(i, 6) * 140, 8 + h2(i, 7) * 22, 0, 7); g.fill(); } });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonT, transparent: true, fog: false, depthWrite: false })); moon.scale.setScalar(34); root.add(moon);
  const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xbcd0ff, transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); moonGlow.scale.setScalar(150); root.add(moonGlow);
  const MOON = new THREE.Vector3(-0.42, 0.42, -0.8).normalize();
  moon.position.copy(MOON).multiplyScalar(860); moonGlow.position.copy(MOON).multiplyScalar(870);
  // soft cloud sprites (day / dusk / storm) far out on the horizon
  const cloudT = tex(256, 128, (g) => { for (let k = 0; k < 9; k++) { const x = 40 + k * 22 + h2(k, 1) * 20, y = 74 - Math.sin(k / 8 * PI) * 26, rr = 26 + h2(k, 2) * 20; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } });
  const clouds = [];
  for (let i = 0; i < 16; i++) { const a = -PI / 2 + (h2(i, 8) - 0.5) * 2.6, d = 620 + h2(i, 9) * 200, s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, transparent: true, fog: false, depthWrite: false, opacity: 0 })); s.position.set(Math.cos(a) * d, 70 + h2(i, 10) * 120, Math.sin(a) * d); s.scale.set(220 + h2(i, 11) * 160, 90 + h2(i, 12) * 50, 1); root.add(s); clouds.push(s); }
  return { dome, U, stars, starM, moon, moonGlow, clouds, MOON };
}

// ---------------------------------------------------------------- the rock
const rockR = (y) => { const P = [[-9, 12], [-2, 9.0], [0, 8.0], [1.2, 7.0], [2.15, 6.05], [2.6, 5.6]]; if (y <= P[0][0]) return P[0][1]; for (let i = 0; i < P.length - 1; i++) if (y <= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (y - P[i][0]) / (P[i + 1][0] - P[i][0])); return 5.6; };
const rockN = (th, y) => 1 + 0.06 * Math.sin(3 * th + 1) + 0.04 * Math.sin(7 * th + 2) + 0.022 * Math.sin(13 * th + y * 2.1) + 0.012 * Math.sin(29 * th - y * 3.3);
/** Radius of the rock at angle th (atan2(z, x)) and height y. */
export const rockAt = (th, y) => rockR(y) * rockN(th, y);
function makeRock(root) {
  const S = 160, ys = [-9, -5, -2.5, -1.2, -0.5, 0, 0.45, 0.9, 1.4, 1.9, 2.25, 2.48, 2.6], pos = [], col = [], uv = [], idx = [];
  const C = (y, th) => { const g = 0.48 + 0.12 * h2(Math.floor(th * 40), Math.floor(y * 4)); let c = [g * 1.02, g * 0.99, g * 0.96]; if (y < 0.9) c = c.map((v) => v * 0.62); if (y > -0.4 && y < 0.55) c = [c[0] * 0.75, c[1] * 1.05, c[2] * 0.7]; if (y < -0.4) c = [c[0] * 0.7, c[1] * 0.85, c[2] * 0.95]; return c; };
  ys.forEach((y, j) => { for (let i = 0; i <= S; i++) { const th = i / S * TAU, r = rockAt(th, y); pos.push(Math.cos(th) * r, y, Math.sin(th) * r); col.push(...C(y, th)); uv.push(i / S * 10, y / 3); } });
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < S; i++) { const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1; idx.push(a, c, b, b, c, d); }   // outward-facing (the first winding faced in: the camera saw through the slope to the foam under the rock)
  const top0 = pos.length / 3; pos.push(0, D.RY, 0); col.push(0.56, 0.55, 0.53); uv.push(5, 1);
  const topRing = (ys.length - 1) * (S + 1);
  for (let i = 0; i < S; i++) idx.push(top0, topRing + i + 1, topRing + i);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const granT = tex(512, 512, (g, w, h) => { g.fillStyle = '#bdb8b0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = ['#8f8a83', '#d8d2c8', '#6f6a64', '#c9b2a6', '#a9a39a'][i % 5]; g.fillRect(h2(i, 1) * w, h2(i, 2) * h, 1 + h2(i, 3) * 3, 1 + h2(i, 4) * 3); } for (let i = 0; i < 26; i++) { g.strokeStyle = 'rgba(60,56,52,.35)'; g.lineWidth = 2; g.beginPath(); let x = h2(i, 5) * w, y = h2(i, 6) * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (h2(i, k + 7) - 0.5) * 70; y += h2(i, k + 13) * 40; g.lineTo(x, y); } g.stroke(); } });
  granT.wrapS = granT.wrapT = THREE.RepeatWrapping;
  const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: granT, vertexColors: true, roughness: 0.82 })); rock.castShadow = true; rock.receiveShadow = true; root.add(rock);
  // plateau dressing: boulders, tide pools, seaweed strands at the waterline, barnacles
  const bm = std(0x8c877f, 0.85);
  for (let i = 0; i < 26; i++) { const th = h2(i, 20) * TAU, y = -0.4 + h2(i, 21) * 2.6, r = rockAt(th, y) + 0.1; const b = mk(new THREE.IcosahedronGeometry(0.25 + h2(i, 22) * 0.45, 1), bm, root, Math.cos(th) * r, y, Math.sin(th) * r); b.scale.set(1, 0.6 + h2(i, 23) * 0.4, 1); b.rotation.set(h2(i, 24) * 3, h2(i, 25) * 3, 0); b.castShadow = true; }
  const sw = std(0x3f5a1e, 0.7);
  for (let i = 0; i < 70; i++) { const th = h2(i, 30) * TAU, r = rockAt(th, 0.1) + 0.05; const s = mk(new THREE.CapsuleGeometry(0.05, 0.4 + h2(i, 31) * 0.4, 3, 6), sw, root, Math.cos(th) * r, 0.25 + h2(i, 32) * 0.3, Math.sin(th) * r); s.rotation.set((h2(i, 33) - 0.5) * 0.8, 0, (h2(i, 34) - 0.5) * 0.8); s.castShadow = false; }
  const pool = std(0x2f7d93, 0.08, { metalness: 0.1 });
  for (const [x, z, r] of [[-1.6, 3.6, 0.55], [2.3, 3.9, 0.35], [-4.4, -1.2, 0.4]]) { const p = mk(new THREE.CircleGeometry(r, 20), pool, root, x, D.RY + 0.012, z); p.rotation.x = -PI / 2; p.scale.y = 0.75; p.receiveShadow = true; }
  return { rock };
}

// ---------------------------------------------------------------- the tower (cut at z = 0) + everything inside it
function sectionTex(kind) {   // the cut face of the wall: bricks, or Smeaton's dovetailed granite
  return tex(512, 512, (g, w, h) => {
    if (kind === 'brick') { g.fillStyle = '#e9e2d4'; g.fillRect(0, 0, w, h); for (let r = 0; r < 24; r++) for (let c = -1; c < 9; c++) { const x = c * 64 + (r % 2) * 32, y = r * 21.3; g.fillStyle = ['#c9824f', '#b9734a', '#d29462', '#a86743'][(r * 7 + c * 3 + 40) % 4]; g.fillRect(x + 2, y + 2, 60, 17.3); } return; }
    g.fillStyle = '#5e5a55'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) for (let c = -1; c < 5; c++) {   // interlocking blocks: each has a dovetail tongue into its neighbour
      const x = c * 128 + (r % 2) * 64, y = r * 85.3, gc = ['#b4ada3', '#a39d94', '#c2bcb2', '#9b958c'][(r * 3 + c + 8) % 4];
      g.fillStyle = gc; g.beginPath(); g.moveTo(x + 3, y + 3); g.lineTo(x + 125, y + 3); g.lineTo(x + 125, y + 26); g.lineTo(x + 150, y + 16); g.lineTo(x + 150, y + 68); g.lineTo(x + 125, y + 58); g.lineTo(x + 125, y + 82); g.lineTo(x + 3, y + 82); g.lineTo(x + 3, y + 58); g.lineTo(x + 28, y + 68); g.lineTo(x + 28, y + 16); g.lineTo(x + 3, y + 26); g.closePath(); g.fill();
      for (let k = 0; k < 30; k++) { g.fillStyle = 'rgba(40,36,32,.18)'; g.fillRect(x + h2(r * 9 + c, k) * 120, y + h2(c * 7 + r, k + 3) * 80, 3, 3); }
    }
  });
}
function makeTower(root) {
  const T = D.T, H = D.T.watch + 2.0 - D.RY, R0 = T.r0, R1 = T.r1, W = T.wall, rAt = (y) => lerp(R0, R1, (y - D.RY) / H);
  const pivot = new THREE.Group(); root.add(pivot);   // lean pivot: the base's right edge (setLean)
  pivot.position.set(R0 + 0.9, D.RY, 0); const g = new THREE.Group(); pivot.add(g); g.position.set(-(R0 + 0.9), -D.RY, 0);
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000), clips = [clip];
  const cm = (m) => { m.clippingPlanes = clips; m.clipShadows = true; return m; };
  // outer shell with the daymark spiral (painted from the top down: uPaintY) + gull dots; inner wall; the two section edges
  const PU = { uPaintY: { value: -999 }, uDirt: { value: 0 } };   // daymark painted from the base UP to uPaintY (Gary's bosun's chair rises)
  const shellM = cm(std(0xf3f0e8, 0.7));
  shellM.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, PU);
    sh.vertexShader = 'varying vec3 vP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vP = position;');
    sh.fragmentShader = 'uniform float uPaintY, uDirt; varying vec3 vP;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float th = atan(vP.x, vP.z) / 6.28318; float u = th + vP.y / 7.2; float st = smoothstep(0.47, 0.53, abs(fract(u) - 0.5) * 2.0);
      float painted = (1.0 - smoothstep(uPaintY - 0.12, uPaintY + 0.12, vP.y)) * step(${(D.RY + 3.0).toFixed(1)}, vP.y);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.07, 0.07, 0.08), st * painted);
      diffuseColor.rgb *= 1.0 - uDirt * 0.25 * (1.0 - smoothstep(${D.RY.toFixed(1)}, ${(D.RY + 3).toFixed(1)}, vP.y));`); };
  const shellG = new THREE.CylinderGeometry(R1, R0, H, 96, 24, true, PI / 2, PI); shellG.translate(0, D.RY + H / 2, 0);
  const shell = mk(shellG, shellM, g, 0, 0, 0); shell.castShadow = true; shell.receiveShadow = true;
  const innerG = new THREE.CylinderGeometry(R1 - W, R0 - W, H, 64, 1, true, PI / 2, PI); innerG.translate(0, D.RY + H / 2, 0);
  const inner = mk(innerG, cm(std(0xe9dfcd, 0.85, { side: THREE.BackSide })), g, 0, 0, 0); inner.receiveShadow = true;
  const brickT = sectionTex('brick'); brickT.wrapS = brickT.wrapT = THREE.RepeatWrapping; brickT.repeat.set(0.4, H / 3);
  const edgeM = cm(std(0xffffff, 0.8, { map: brickT }));
  for (const s of [-1, 1]) { const sp = new THREE.Shape([new THREE.Vector2(s * (R0 - W), D.RY), new THREE.Vector2(s * R0, D.RY), new THREE.Vector2(s * R1, D.RY + H), new THREE.Vector2(s * (R1 - W), D.RY + H)]); const e = mk(new THREE.ShapeGeometry(sp), edgeM, g, 0, 0, 0.002); e.receiveShadow = true;
    const uvA = e.geometry.attributes.uv, pA = e.geometry.attributes.position; for (let i = 0; i < uvA.count; i++) uvA.setXY(i, pA.getX(i) * 0.6, pA.getY(i) / 3); }
  // the solid base (its cut face = the full width): bricks, then dovetailed granite (setSkirt)
  const baseSec = new THREE.Shape([new THREE.Vector2(-R0, D.RY), new THREE.Vector2(R0, D.RY), new THREE.Vector2(rAt(T.base), T.base), new THREE.Vector2(-rAt(T.base), T.base)]);
  const baseT = sectionTex('brick'); baseT.wrapS = baseT.wrapT = THREE.RepeatWrapping;
  const baseFace = mk(new THREE.ShapeGeometry(baseSec), cm(std(0xffffff, 0.85, { map: baseT })), g, 0, 0, 0.003);
  { const uvA = baseFace.geometry.attributes.uv, pA = baseFace.geometry.attributes.position; for (let i = 0; i < uvA.count; i++) uvA.setXY(i, pA.getX(i) / 3.2, pA.getY(i) / 3.2); }
  const floorM = cm(std(0x8b7a66, 0.8));
  const floor0 = mk(new THREE.CircleGeometry(rAt(T.base) - W, 48), floorM, g, 0, T.base + 0.005, 0); floor0.rotation.x = -PI / 2;
  // central weight shaft (half-tube) + its weight
  const SR = D.shaftR, shaftH = T.watch - T.base;
  const shaftG = new THREE.CylinderGeometry(SR, SR, shaftH, 32, 1, true, PI / 2, PI); shaftG.translate(0, T.base + shaftH / 2, 0);
  mk(shaftG, cm(std(0x55524e, 0.6, { side: THREE.DoubleSide, metalness: 0.3 })), g, 0, 0, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.05, shaftH, 0.05), cm(std(0x3b3936, 0.5, { metalness: 0.5 })), g, s * SR, T.base + shaftH / 2, 0.0);
  const weight = new THREE.Group(); g.add(weight);
  mk(new THREE.CylinderGeometry(0.21, 0.21, 0.85, 20), cm(std(0xc0392b, 0.45, { metalness: 0.3, emissive: 0x401010, emissiveIntensity: 0.6 })), weight, 0, 0, 0);   // painted red so it reads down the dark shaft
  mk(new THREE.TorusGeometry(0.06, 0.018, 6, 12), cm(metal(0x8a8f94)), weight, 0, 0.48, 0);
  const cable = mk(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), cm(metal(0xb9bec3, 0.3, 0.9)), g, 0, 0, 0);
  const setWeight = (y) => { weight.position.set(0, y, -0.02); const top = T.watch + 0.4; cable.scale.y = Math.max(0.01, top - (y + 0.5)); cable.position.set(0, (top + y + 0.5) / 2, -0.02); };
  setWeight(T.watch - 1.0);
  // spiral stairs: 3 turns from the base floor to the watch room, round the shaft (whole steps: interior parts aren't cut)
  const turns = 3, perTurn = 22, NS = turns * perTurn, rise = (T.watch - T.base) / NS, stepM = cm(std(0x6e6a64, 0.7, { metalness: 0.25 })), railM = cm(metal(0x3e3c3a, 0.45, 0.6));
  const TH0 = -PI / 2;   // the first step is on the left (x < 0), the stairs climb counter-clockwise seen from above
  const stairAt = (u) => { const a = TH0 + u * turns * TAU, y = T.base + u * (T.watch - T.base); return { x: Math.sin(a) * D.stairR, y, z: Math.cos(a) * D.stairR, a }; };
  for (let i = 0; i < NS; i++) { const a = TH0 + (i + 0.5) / NS * turns * TAU, y = T.base + (i + 1) * rise, ri = rAt(y) - W - 0.04, L = ri - SR; const st = mk(new THREE.BoxGeometry(L, 0.07, 0.42), stepM, g, Math.sin(a) * (SR + L / 2), y - 0.035, Math.cos(a) * (SR + L / 2)); st.rotation.y = a + PI / 2; st.castShadow = true; st.receiveShadow = true; }
  { const pts = []; for (let k = 0; k <= 240; k++) { const u = k / 240, a = TH0 + u * turns * TAU, y = T.base + u * (T.watch - T.base) + 0.9; pts.push(new THREE.Vector3(Math.sin(a) * (SR + 0.08), y, Math.cos(a) * (SR + 0.08))); } mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.025, 6), railM, g, 0, 0, 0);
    for (let i = 0; i < NS; i += 2) { const a = TH0 + (i + 0.5) / NS * turns * TAU, y = T.base + (i + 1) * rise; beam(g, [Math.sin(a) * (SR + 0.08), y, Math.cos(a) * (SR + 0.08)], [Math.sin(a) * (SR + 0.08), y + 0.9, Math.cos(a) * (SR + 0.08)], 0.012, railM); } }
  // wall lamps up the stairs + small windows (back wall), a ladder hatch
  const winM = cm(new THREE.MeshStandardMaterial({ color: 0x9fc6e6, roughness: 0.2, emissive: 0x2a3a50, emissiveIntensity: 0.4 }));
  const wins = [];
  for (const [y, a] of [[6.0, PI * 0.82], [9.6, PI * 1.25], [13.2, PI * 0.95]]) { const r = rAt(y) - W - 0.01, w = mk(new THREE.PlaneGeometry(0.45, 0.85), winM, g, Math.sin(a) * r, y, Math.cos(a) * r); w.lookAt(0, y, 0); wins.push(w); }
  // watch room (16.4 … 18.4): floor with the stairwell, the clockwork on the centre pedestal
  const watchFloor = mk(new THREE.RingGeometry(0.42, rAt(T.watch) - W, 48, 1), floorM, g, 0, T.watch + 0.005, 0); watchFloor.rotation.x = -PI / 2;
  const clock = new THREE.Group(); g.add(clock); clock.position.set(0, T.watch, 0);
  const iron = cm(metal(0x3a3b3e, 0.5, 0.6)), brass = cm(metal(0xc9a24a, 0.3, 0.9)), red = cm(std(0xa8322a, 0.5));
  for (const [x, z] of [[-0.42, -0.3], [0.42, -0.3], [-0.42, 0.3], [0.42, 0.3]]) mk(new THREE.BoxGeometry(0.06, 1.0, 0.06), iron, clock, x, 0.5, z);
  mk(new THREE.BoxGeometry(0.92, 0.06, 0.66), iron, clock, 0, 1.0, 0); mk(new THREE.BoxGeometry(0.92, 0.06, 0.66), iron, clock, 0, 0.12, 0);
  const gearShape = (r, n) => { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? r : r * 0.86; if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.18, 0, TAU, true); s.holes.push(hole); return s; };
  const gears = [[0.32, 22, -0.18, 0.62, 0.34], [0.18, 12, 0.22, 0.74, 0.34], [0.24, 16, 0.16, 0.36, 0.34]].map(([r, n, x, y, z], i) => { const gm = mk(new THREE.ExtrudeGeometry(gearShape(r, n), { depth: 0.05, bevelEnabled: false }), i === 1 ? brass : cm(metal(0xb08a3c, 0.35, 0.85)), clock, x, y, z); gm.userData.r = r; return gm; });
  const drum = mk(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 20), iron, clock, 0, 0.36, 0); drum.rotation.x = PI / 2;
  const fan = new THREE.Group(); clock.add(fan); fan.position.set(0, 1.18, 0); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), brass, fan, 0, 0, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.3, 0.12, 0.012), brass, fan, s * 0.16, 0.1, 0);
  const crank = new THREE.Group(); clock.add(crank); crank.position.set(0.0, 0.36, 0.38);
  mk(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), iron, crank, 0, 0, 0.06).rotation.x = PI / 2; mk(new THREE.BoxGeometry(0.04, 0.32, 0.03), red, crank, 0, -0.15, 0.13);
  const crankKnob = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), cm(std(0x2b1d14, 0.6)), crank, 0, -0.3, 0.2); crankKnob.rotation.x = PI / 2;
  const cuckoo = new THREE.Group(); clock.add(cuckoo); cuckoo.position.set(-0.46, 0.75, 0.0);   // a little door in the frame (the gull pops out of it)
  const cDoor = mk(new THREE.BoxGeometry(0.03, 0.34, 0.3), cm(std(0x7a4a2a, 0.7)), cuckoo, 0, 0, 0);
  const driveShaft = mk(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 10), brass, clock, 0, 1.6, 0);
  clock.visible = false;
  // the gallery + lantern (riding on the top of the tower; shown once the tower is up)
  const top = new THREE.Group(); g.add(top);
  const galM = cm(std(0x4d4f52, 0.6, { metalness: 0.3 })), lanRed = cm(std(0xb3332b, 0.5)), blackM = cm(std(0x202224, 0.5, { metalness: 0.3 }));
  const gal = mk(new THREE.CylinderGeometry(D.galR, D.galR, 0.18, 64, 1, false, PI / 2, PI), galM, top, 0, D.GY - 0.09, 0); gal.castShadow = true; gal.receiveShadow = true;
  { const e = mk(new THREE.PlaneGeometry(D.galR * 2, 0.18), galM, top, 0, D.GY - 0.09, 0.001); e.receiveShadow = true; }
  for (let i = 0; i <= 16; i++) { const a = PI / 2 + i / 16 * PI, r = D.galR - 0.08; beam(top, [Math.sin(a) * r, D.GY, Math.cos(a) * r], [Math.sin(a) * r, D.GY + 1.0, Math.cos(a) * r], 0.025, blackM); }
  for (const y of [0.5, 1.0]) { const pts = []; for (let k = 0; k <= 40; k++) { const a = PI / 2 + k / 40 * PI, r = D.galR - 0.08; pts.push(new THREE.Vector3(Math.sin(a) * r, D.GY + y, Math.cos(a) * r)); } mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.03, 6), blackM, top, 0, 0, 0); }
  const LR = D.lanR;
  mk(new THREE.CylinderGeometry(LR, LR, D.glass0 - D.GY, 48, 1, true, PI / 2, PI), cm(std(0xe9e4d8, 0.7, { side: THREE.DoubleSide })), top, 0, (D.GY + D.glass0) / 2, 0);
  const glassM = cm(new THREE.MeshStandardMaterial({ color: 0xd8ecff, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  const glass = mk(new THREE.CylinderGeometry(LR, LR, D.glass1 - D.glass0, 48, 1, true, PI / 2, PI), glassM, top, 0, (D.glass0 + D.glass1) / 2, 0); glass.castShadow = false; glass.renderOrder = 3;
  for (let i = 0; i <= 8; i++) { const a = PI / 2 + i / 8 * PI; beam(top, [Math.sin(a) * LR, D.glass0, Math.cos(a) * LR], [Math.sin(a) * LR, D.glass1, Math.cos(a) * LR], 0.035, lanRed); }
  for (const y of [D.glass0, (D.glass0 + D.glass1) / 2, D.glass1]) { const pts = []; for (let k = 0; k <= 30; k++) { const a = PI / 2 + k / 30 * PI; pts.push(new THREE.Vector3(Math.sin(a) * LR, y, Math.cos(a) * LR)); } mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.04, 6), lanRed, top, 0, 0, 0); }
  const domeG = new THREE.SphereGeometry(LR + 0.12, 48, 16, PI, PI, 0, PI / 2); domeG.scale(1, (D.dome1 - D.glass1) / (LR + 0.12), 1);
  const dome = mk(domeG, cm(std(0xb3332b, 0.45, { side: THREE.DoubleSide })), top, 0, D.glass1, 0); dome.castShadow = true;
  mk(new THREE.SphereGeometry(0.26, 18, 12), lanRed, top, 0, D.dome1 + 0.15, 0); beam(top, [0, D.dome1 + 0.3, 0], [0, D.dome1 + 1.2, 0], 0.02, blackM);
  const vane = new THREE.Group(); top.add(vane); vane.position.set(0, D.dome1 + 1.0, 0); mk(new THREE.ConeGeometry(0.08, 0.5, 8), blackM, vane, 0.3, 0, 0).rotation.z = -PI / 2; mk(new THREE.BoxGeometry(0.4, 0.2, 0.01), blackM, vane, -0.2, 0, 0);
  const HX = 0.35, HZ = 1.22, HR = 0.2;   // r3 logic: a hatch + ladder between the watch room and the lantern (Gary used to teleport through the floor)
  const lfS = new THREE.Shape(); lfS.absarc(0, 0, LR, 0, TAU, false); const hole = new THREE.Path(); hole.absarc(HX, -HZ, HR, 0, TAU, true); lfS.holes.push(hole);
  const lanFloor = mk(new THREE.ShapeGeometry(lfS, 40), floorM, top, 0, D.GY + 0.005, 0); lanFloor.rotation.x = -PI / 2;
  const ladder2 = new THREE.Group(); top.add(ladder2); ladder2.position.set(HX, T.watch, HZ + 0.12);
  for (const x of [-0.17, 0.17]) mk(new THREE.CylinderGeometry(0.022, 0.022, D.GY - T.watch + 0.5, 8), metal(0x6e6a64, 0.45, 0.6), ladder2, x, (D.GY - T.watch + 0.5) / 2, 0);
  for (let k = 0; k < 7; k++) mk(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 6), metal(0x6e6a64, 0.45, 0.6), ladder2, 0, 0.25 + k * 0.3, 0).rotation.z = PI / 2;
  // the lamp stand (a brass column) + the pedestal the lens sits on, the mercury trough
  const stand = new THREE.Group(); top.add(stand); mk(new THREE.CylinderGeometry(0.05, 0.08, D.focal[1] - 0.28 - D.GY, 10), brass, stand, 0, (D.GY + D.focal[1] - 0.28) / 2, 0);
  const pedestal = mk(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 32), iron, top, 0, D.GY + 0.125, 0); pedestal.visible = false;
  const trough = new THREE.Group(); top.add(trough); trough.position.set(0, D.GY + 0.25, 0); trough.visible = false;
  mk(new THREE.CylinderGeometry(1.05, 1.05, 0.2, 48, 1, true), iron, trough, 0, 0.1, 0); mk(new THREE.CylinderGeometry(0.46, 0.46, 0.2, 32, 1, true), iron, trough, 0, 0.1, 0);
  { const b = mk(new THREE.RingGeometry(0.46, 1.05, 48), iron, trough, 0, 0.005, 0); b.rotation.x = -PI / 2; }   // much wider than the lens rim (0.82): a silver band shows round it
  const mercT = tex(512, 512, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, w * 0.17, w / 2, h / 2, w / 2);   // liquid chrome: concentric light/dark bands + glints (a lit metal read as white plastic)
    [[0, '#5d6670'], [0.12, '#e9eef3'], [0.22, '#7c8792'], [0.35, '#f7fafc'], [0.47, '#8a95a0'], [0.6, '#dfe5ea'], [0.72, '#6f7a85'], [0.86, '#eef2f5'], [1, '#808b96']].forEach(([k, col]) => g.addColorStop(k, col)); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.globalAlpha = 0.85; c.fillStyle = '#ffffff'; for (let i = 0; i < 9; i++) { const a = i * 0.71, r = w * (0.22 + 0.025 * (i % 4)); c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * r * 1.6, h / 2 + Math.sin(a) * r * 1.6, 18, 5, a + PI / 2, 0, PI * 2); c.fill(); } });
  const merc = mk(new THREE.RingGeometry(0.47, 1.04, 64), new THREE.MeshBasicMaterial({ map: mercT, color: 0xe8ecf0 }), trough, 0, 0.01, 0); merc.rotation.x = -PI / 2;
  const setFill = (k) => { merc.visible = k > 0.01; merc.position.y = 0.01 + 0.17 * clamp(k); };
  const lanFill = new THREE.PointLight(0xffd9a0, 0, 5, 1.5); lanFill.position.set(1.9, D.GY + 1.6, 2.0); top.add(lanFill);   // faces in front of the lit lens
  top.visible = false;
  return { lanFill, pivot, g, top, shell, shellM, PU, inner, clip, clips, setGrow: (y) => { clip.constant = y; }, rAt, stairAt, H, weight, setWeight, clock, gears, drum, fan, crank, cuckoo, cDoor, driveShaft, stand, pedestal, trough, merc, setFill, glass, glassM, baseFace, baseT, wins, winM, vane, setLean: (a) => { pivot.rotation.z = -a; } };
}

// ---------------------------------------------------------------- lamp, mirror, Fresnel lens, beams
function makeLight(parent) {
  const F = new THREE.Vector3(...D.focal), g = new THREE.Group(); parent.add(g); g.position.copy(F);
  const brass = metal(0xc9a24a, 0.3, 0.9);
  const lamp = new THREE.Group(); g.add(lamp);   // an oil lamp: brass font, round wick burner, glass chimney, the flame at the origin
  mk(new THREE.CylinderGeometry(0.14, 0.18, 0.18, 20), brass, lamp, 0, -0.25, 0); mk(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 14), brass, lamp, 0, -0.12, 0);
  mk(new THREE.CylinderGeometry(0.055, 0.075, 0.32, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.28, depthWrite: false }), lamp, 0, 0.06, 0);
  const flameT = tex(64, 128, (gg) => { const gr = gg.createRadialGradient(32, 84, 2, 32, 76, 40); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.35, 'rgba(255,200,90,.95)'); gr.addColorStop(0.7, 'rgba(255,120,30,.45)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); gg.fillStyle = gr; gg.beginPath(); gg.ellipse(32, 72, 22, 50, 0, 0, 7); gg.fill(); });
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); flame.scale.set(0.13, 0.26, 1); flame.position.y = 0.02; lamp.add(flame);
  const glowT = tex(128, 128, (gg, w) => { const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.25, 'rgba(255,210,140,.45)'); gr.addColorStop(1, 'rgba(255,190,120,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); glow.scale.setScalar(1.2); g.add(glow);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flash.scale.setScalar(5); flash.renderOrder = 9; g.add(flash);
  const light = new THREE.PointLight(0xffc982, 0, 34, 1.4); g.add(light);
  // the parabolic reflector: a silvered copper dish behind the flame (open toward +x)
  const pts = []; for (let k = 0; k <= 16; k++) { const r = k / 16 * 0.62; pts.push(new THREE.Vector2(r, r * r / (4 * 0.16) - 0.16)); }
  const dishG = new THREE.LatheGeometry(pts, 40); dishG.rotateZ(-PI / 2);   // vertex at -x, opening toward +x (the beam)
  const mirror = new THREE.Group(); g.add(mirror);
  mk(dishG, new THREE.MeshStandardMaterial({ color: 0xe9c9a8, roughness: 0.18, metalness: 0.55, side: THREE.DoubleSide, envMapIntensity: 1.4, emissive: 0xb0703a, emissiveIntensity: 0.45 }), mirror, 0, 0, 0);   // lit copper (pure metal reflected the dark night sky = a black dish)
  mk(new THREE.TorusGeometry(0.62, 0.03, 8, 40), metal(0xb06a3a, 0.35, 0.9), mirror, 0.44, 0, 0).rotation.y = PI / 2;
  mirror.visible = false;
  // the first-order Fresnel lens: bullseye drum + catadioptric prism rings above and below, brass frame (panels pop on: setLens)
  const lens = new THREE.Group(); g.add(lens);
  const LR = D.lensR, glassM = new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.03, metalness: 0.15, transparent: true, opacity: 0.42, emissive: 0xffc070, emissiveIntensity: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5 });
  const ringT = tex(256, 256, (gg, w) => { gg.fillStyle = '#ffffff'; gg.fillRect(0, 0, w, w); for (let r = 120; r > 4; r -= 13) { gg.strokeStyle = 'rgba(70,110,140,.55)'; gg.lineWidth = 3; gg.beginPath(); gg.arc(128, 128, r, 0, 7); gg.stroke(); } });
  const panelM = glassM.clone(); panelM.map = ringT;
  const parts = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const p = mk(new THREE.PlaneGeometry(2 * LR * Math.tan(PI / 8), 0.86), panelM, lens, Math.cos(a) * LR, 0, Math.sin(a) * LR); p.lookAt(Math.cos(a) * 3, 0, Math.sin(a) * 3); p.renderOrder = 4; parts.push({ o: p, y: 0 }); }
  const prismRings = [[0.5, 0.8], [0.62, 0.74], [0.74, 0.66], [0.86, 0.56], [0.97, 0.45], [-0.5, 0.8], [-0.62, 0.76], [-0.74, 0.7], [-0.86, 0.62]];
  for (const [y, r] of prismRings) { const p = mk(new THREE.TorusGeometry(r, 0.055, 6, 48), glassM, lens, 0, y, 0); p.rotation.x = PI / 2; p.renderOrder = 4; parts.push({ o: p, y }); }
  const brassL = metal(0xc59a3c, 0.3, 0.9);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * TAU; const rib = beam(lens, [Math.cos(a) * LR * 1.02, -0.95, Math.sin(a) * LR * 1.02], [Math.cos(a) * 0.4, 1.05, Math.sin(a) * 0.4], 0.02, brassL); parts.push({ o: rib, y: 0.05 }); }
  for (const y of [-0.45, 0.45]) { const rr = mk(new THREE.TorusGeometry(LR + 0.02, 0.03, 6, 40), brassL, lens, 0, y, 0); rr.rotation.x = PI / 2; parts.push({ o: rr, y }); }
  { const cap = mk(new THREE.SphereGeometry(0.16, 16, 10), brassL, lens, 0, 1.08, 0); parts.push({ o: cap, y: 1.08 }); const base = mk(new THREE.CylinderGeometry(0.72, 0.62, 0.14, 32), brassL, lens, 0, -1.02, 0); parts.push({ o: base, y: -1.02 }); }
  const bulls = [0, 1].map((k) => { const p = mk(new THREE.CircleGeometry(0.3, 32), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }), lens, 0, 0, 0); p.renderOrder = 5; return p; });
  const setLens = (k) => { lens.visible = k > 0.001; parts.forEach((p, i) => { const u = clamp(k * parts.length * 0.7 - i * 0.7); p.o.visible = u > 0.01; p.o.scale.setScalar(Math.max(0.001, u < 1 ? 1 + 0.25 * Math.sin(u * PI) * (1 - u) + (u - 1) * 0.0 : 1) * Math.min(1, u * 1.4)); }); };
  setLens(0);
  // beams: soft additive cones, fading along their length; two of them (the characteristic) — beam 2 hidden until then
  const mkBeam = (len, r1) => {
    const geo = new THREE.CylinderGeometry(0.25, r1, len, 40, 1, true); geo.translate(0, -len / 2, 0); geo.rotateZ(PI / 2);
    const m = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(0xfff1c8) }, uOpacity: { value: 0 }, uLen: { value: len } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
      vertexShader: 'varying float vD; varying vec3 vN; varying vec3 vV; void main(){ vD = position.x; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; uniform float uOpacity, uLen; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ float d = clamp(vD / uLen, 0.0, 1.0); float a = pow(1.0 - d, 1.6) * smoothstep(0.0, 0.03, d) * uOpacity; float edge = abs(dot(normalize(vN), normalize(-vV))); a *= mix(0.15, 1.0, smoothstep(0.0, 0.8, edge)); gl_FragColor = vec4(uColor * a, a); }' });
    const b = new THREE.Mesh(geo, m); b.renderOrder = 6; b.frustumCulled = false; b.castShadow = false; return b;
  };
  const beams = [mkBeam(70, 5.5), mkBeam(70, 5.5)]; beams.forEach((b) => g.add(b));
  const handBeam = mkBeam(9, 1.2);   // the flashlight's (hook)
  return { g, F, lamp, flame, glow, flash, light, mirror, lens, setLens, glassM, panelM, bulls, beams, handBeam };
}

// ---------------------------------------------------------------- props on the rock
function makeShack(root) {
  const g = new THREE.Group(); root.add(g); g.position.set(D.shack[0], D.RY, D.shack[1]); g.rotation.y = -0.5;
  const plank = tex(256, 256, (c, w, h) => { c.fillStyle = '#6f8fa8'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = `rgba(30,40,50,${0.25 + h2(x, 1) * 0.2})`; c.fillRect(x, 0, 3, h); c.fillStyle = `rgba(255,255,255,${0.05 + h2(x, 2) * 0.08})`; c.fillRect(x + 6, 0, 8, h); } });
  const wall = std(0xffffff, 0.85, { map: plank });
  mk(new THREE.BoxGeometry(1.7, 1.75, 1.6), wall, g, 0, 0.875, 0).castShadow = true;
  const roof = mk(new THREE.CylinderGeometry(0.01, 1.35, 0.7, 4, 1), std(0x8a3a2c, 0.7), g, 0, 2.1, 0); roof.rotation.y = PI / 4; roof.castShadow = true;
  mk(new THREE.BoxGeometry(0.6, 1.15, 0.05), std(0xd8b04a, 0.6), g, -0.3, 0.6, 0.81);
  mk(new THREE.BoxGeometry(0.45, 0.4, 0.04), new THREE.MeshStandardMaterial({ color: 0xffd99a, emissive: 0xffb860, emissiveIntensity: 0.0, roughness: 0.3 }), g, 0.45, 1.05, 0.81);
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), metal(0x3a3a3a, 0.6, 0.5), g, 0.5, 2.3, -0.4);
  const flag = mk(new THREE.PlaneGeometry(0.5, 0.32), std(0xf2d24a, 0.7, { side: THREE.DoubleSide }), g, -0.85, 2.85, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), metal(0x888888), g, -1.1, 2.4, 0); flag.position.x = -0.84;
  // a clothesline with Gary's socks + a barrel, crates, a lobster trap, a life ring on the wall
  beam(root, [D.shack[0] - 0.4, D.RY + 1.5, D.shack[1] + 1.0], [D.shack[0] + 1.3, D.RY + 1.5, D.shack[1] + 2.6], 0.008, std(0xeeeeee));
  for (let i = 0; i < 4; i++) { const u = (i + 0.5) / 4; mk(new THREE.BoxGeometry(0.1, 0.26, 0.04), std([0xd94c3d, 0xf2f2f2, 0x3c7fd9, 0xd94c3d][i], 0.8), root, lerp(D.shack[0] - 0.4, D.shack[0] + 1.3, u), D.RY + 1.37, lerp(D.shack[1] + 1.0, D.shack[1] + 2.6, u)); }
  const ring = mk(new THREE.TorusGeometry(0.22, 0.07, 10, 24), std(0xff6a3a, 0.6), g, 0.45, 0.45, 0.83); ring.castShadow = true;
  const barrel = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 18), std(0x8a5a32, 0.7), root, D.shack[0] + 1.3, D.RY + 0.4, D.shack[1] - 0.2); barrel.castShadow = true;
  for (const [x, z, s] of [[-4.5, -1.8, 0.5], [-4.2, -2.5, 0.42], [-4.4, -2.1, 0.36]]) { const c = mk(new RoundedBoxGeometry(s, s, s, 2, 0.03), std(0xb88a52, 0.8), root, x, D.RY + s / 2 + (s < 0.4 ? 0.5 : 0), z); c.castShadow = true; }
  const trap = new THREE.Group(); root.add(trap); trap.position.set(1.8, D.RY, -4.3); trap.rotation.y = 0.4;
  { const tm = new THREE.MeshStandardMaterial({ color: 0x3f7a52, roughness: 0.7 }); for (const [x, z] of [[-0.38, -0.23], [0.38, -0.23], [-0.38, 0.23], [0.38, 0.23]]) mk(new THREE.BoxGeometry(0.04, 0.4, 0.04), tm, trap, x, 0.2, z); for (const y of [0.02, 0.38]) { mk(new THREE.BoxGeometry(0.8, 0.03, 0.04), tm, trap, 0, y, -0.23); mk(new THREE.BoxGeometry(0.8, 0.03, 0.04), tm, trap, 0, y, 0.23); mk(new THREE.BoxGeometry(0.04, 0.03, 0.5), tm, trap, -0.38, y, 0); mk(new THREE.BoxGeometry(0.04, 0.03, 0.5), tm, trap, 0.38, y, 0); } mk(new THREE.BoxGeometry(0.8, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x3f7a52, roughness: 0.7, transparent: true, opacity: 0.25 }), trap, 0, 0.2, 0); }   // r4 logic: a slatted trap (the wireframe read as a debug box)
  return { g, flag };
}
function makeSign(root) {   // DAYS WITHOUT A CRASH: n — a flip card on a post: setCard(from, to, flip 0..1)
  const g = new THREE.Group(); root.add(g); g.position.set(D.sign[0], D.RY, D.sign[1]); g.rotation.y = 0.25;
  const wood = std(0x8b6a44, 0.85);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.09, 1.6, 0.09), wood, g, s * 0.62, 0.8, -0.05).castShadow = true;
  const board = mk(new THREE.PlaneGeometry(1.5, 0.95), std(0xffffff, 0.7, { map: tex(512, 324, (c, w, h) => { c.fillStyle = '#f7f3e8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1d4f7a'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); c.fillStyle = '#1d4f7a'; c.font = font(58); c.textAlign = 'center'; c.fillText('DAYS WITHOUT', w / 2 - 50, 92); c.fillText('A CRASH:', w / 2 - 50, 162); c.fillStyle = '#d42a22'; c.font = font(34); c.fillText('(SHIPS ONLY)', w / 2 - 50, 230); }) }), g, 0, 1.35, 0);
  board.castShadow = true;
  const nums = {}; const numFor = (n) => nums[n] || (nums[n] = tex(160, 200, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1b1b1b'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = n === 0 ? '#d42a22' : '#2a9a3a'; c.font = font(170); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), w / 2, h / 2 + 12); }));
  const card = new THREE.Group(); g.add(card); card.position.set(0.5, 1.35, 0.02);
  const face = mk(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ map: numFor(0), roughness: 0.6, side: THREE.DoubleSide }), card, 0, 0, 0);
  return { g, card, setCard(from, to, flip) { const k = clamp(flip); face.material.map = numFor(k < 0.5 ? from : to); card.rotation.x = Math.sin(k * PI) * 1.4; } };   // stateless: any frame renders alone
}
function makeLadder(root) {   // iron ladder down the front of the rock into the sea (Gary climbs out on it)
  const g = new THREE.Group(); root.add(g); const [x, z] = D.ladder; g.position.set(x, 0, z); g.rotation.y = Math.atan2(x, z);
  const m = metal(0x4b4f52, 0.55, 0.6), top = D.RY + 0.6, bot = -1.2, out = 3.9;   // it lies on the rock's slope: top at the plateau edge, foot 3.35 m out in the sea
  for (const s of [-1, 1]) beam(g, [s * 0.25, bot, out], [s * 0.25, top, -0.05], 0.025, m);
  for (let y = bot + 0.2; y < top; y += 0.32) { const u = (y - bot) / (top - bot); beam(g, [-0.25, y, lerp(out, -0.05, u) + 0.05], [0.25, y, lerp(out, -0.05, u) + 0.05], 0.018, m); }
  return { g, top, bot, out };
}

// ---------------------------------------------------------------- boats
function hullGeo(len, bm, h, bow = 0.42) {   // top-view teardrop: square-ish stern at -len/2, pointed bow at +len/2, extruded up
  const s = new THREE.Shape(), L = len / 2, B = bm / 2;
  s.moveTo(-L, -B * 0.82); s.quadraticCurveTo(-L, -B, -L + 0.2, -B); s.lineTo(L - len * bow, -B); s.quadraticCurveTo(L - len * 0.08, -B * 0.92, L, 0); s.quadraticCurveTo(L - len * 0.08, B * 0.92, L - len * bow, B); s.lineTo(-L + 0.2, B); s.quadraticCurveTo(-L, B, -L, B * 0.82); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 10 }); g.rotateX(-PI / 2); return g;
}
const winTex = (cols, rows, lit = 0.8, frame = '#ffffff') => tex(512, 128, (c, w, h) => { c.fillStyle = frame; c.fillRect(0, 0, w, h); for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { c.fillStyle = h2(k + r * 31, 9) < lit ? '#ffd98a' : '#2a3a4a'; c.fillRect(6 + k * (w - 12) / cols, 14 + r * (h - 20) / rows, (w - 12) / cols - 8, (h - 20) / rows - 12); } });
export function makeTug() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const hull = mk(hullGeo(4.6, 1.9, 1.25), std(0xd23a2e, 0.55), body, 0, -0.55, 0); hull.castShadow = true;
  mk(hullGeo(4.66, 1.96, 0.22), std(0x1d1f22, 0.6), body, 0, -0.55, 0);
  mk(new THREE.BoxGeometry(4.0, 0.06, 1.7), std(0x8a7a62, 0.8), body, -0.2, 0.71, 0);
  { const bw = std(0xd23a2e, 0.55); for (const z of [-0.86, 0.86]) mk(new THREE.BoxGeometry(1.9, 0.34, 0.08), bw, body, 1.05, 0.9, z); const tip = mk(new THREE.BoxGeometry(0.08, 0.34, 1.3), bw, body, 2.05, 0.9, 0); tip.rotation.y = 0; mk(new THREE.BoxGeometry(2.0, 0.05, 0.12), std(0xf4f1e8, 0.6), body, 1.05, 1.09, -0.86); mk(new THREE.BoxGeometry(2.0, 0.05, 0.12), std(0xf4f1e8, 0.6), body, 1.05, 1.09, 0.86); }   // r3: a red bow bulwark with a white cap rail (the deck camera needs a gunwale in frame)
  const cab = mk(new RoundedBoxGeometry(1.6, 0.9, 1.3, 2, 0.06), std(0xf4f1e8, 0.6), body, -0.5, 1.2, 0); cab.castShadow = true;
  const wh = mk(new RoundedBoxGeometry(1.0, 0.8, 1.15, 2, 0.06), std(0xf4f1e8, 0.6), body, -0.45, 2.02, 0); wh.castShadow = true;
  const wmat = new THREE.MeshStandardMaterial({ color: 0x9fd0f0, roughness: 0.1, emissive: 0xffc070, emissiveIntensity: 0 });
  for (const z of [-0.585, 0.585]) { mk(new THREE.PlaneGeometry(0.8, 0.34), wmat, body, -0.45, 2.12, z).rotation.y = z > 0 ? 0 : PI; for (let k = 0; k < 3; k++) mk(new THREE.CircleGeometry(0.11, 16), wmat, body, -1.0 + k * 0.45, 1.22, z * 1.13).rotation.y = z > 0 ? 0 : PI; }
  mk(new THREE.PlaneGeometry(0.34, 0.95), wmat, body, 0.06, 2.12, 0).rotation.y = PI / 2;
  mk(new THREE.BoxGeometry(1.1, 0.06, 1.25), std(0x1d1f22, 0.6), body, -0.45, 2.45, 0);
  const stack = mk(new THREE.CylinderGeometry(0.2, 0.24, 0.9, 16), std(0x1d1f22, 0.6), body, -1.15, 2.2, 0); stack.castShadow = true;
  mk(new THREE.CylinderGeometry(0.245, 0.245, 0.18, 16), std(0xd23a2e, 0.55), body, -1.15, 2.3, 0);
  for (let i = 0; i < 5; i++) { const t = mk(new THREE.TorusGeometry(0.2, 0.08, 8, 16), std(0x1b1b1b, 0.85), body, 0.4 + i * 0.32, 0.25, 0.98 - Math.max(0, i - 2) * 0.12); t.castShadow = true; }
  for (let i = 0; i < 5; i++) mk(new THREE.TorusGeometry(0.2, 0.08, 8, 16), std(0x1b1b1b, 0.85), body, 0.4 + i * 0.32, 0.25, -0.98 + Math.max(0, i - 2) * 0.12);
  const bowTire = mk(new THREE.TorusGeometry(0.3, 0.12, 8, 18), std(0x1b1b1b, 0.85), body, 2.35, 0.25, 0); bowTire.rotation.y = PI / 2;
  const nameP = mk(new THREE.PlaneGeometry(1.1, 0.24), new THREE.MeshStandardMaterial({ map: signTex('LIL TOOTS', { w: 512, h: 112, bg: '#d23a2e', fg: '#ffffff', px: 84 }), roughness: 0.6 }), body, -1.3, 0.32, 1.0);
  const head = mk(new THREE.SphereGeometry(0.07, 8, 6), std(0xffcf6a), body, -0.45, 2.55, 0); head.visible = false;
  const puffAt = new THREE.Vector3(-1.15, 2.7, 0);
  return { g, body, wmat, puffAt, len: 4.6, bm: 1.9, draft: 0.22 };
}
export function makeSailboat() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  mk(hullGeo(4.4, 1.6, 0.85, 0.5), std(0xf7f5ef, 0.5), body, 0, -0.4, 0).castShadow = true;
  mk(hullGeo(4.46, 1.66, 0.14), std(0x2b6cb0, 0.5), body, 0, -0.1, 0);
  mk(new THREE.BoxGeometry(3.6, 0.05, 1.3), std(0xb88a52, 0.75), body, -0.1, 0.46, 0);
  mk(new THREE.CylinderGeometry(0.05, 0.06, 6.2, 10), std(0xe8e8e8, 0.4), body, 0.4, 3.5, 0).castShadow = true;
  beam(body, [0.4, 1.3, 0], [-1.9, 1.3, 0], 0.04, std(0xd9d9d9, 0.4));
  const sailS = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-2.2, 0), new THREE.Vector2(0, 5.1)]);
  const sailM = std(0xfafafa, 0.8, { side: THREE.DoubleSide }); const sail = mk(new THREE.ShapeGeometry(sailS), sailM, body, 0.35, 1.35, 0.02); sail.castShadow = true;
  const jibS = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.7, 0), new THREE.Vector2(0, 4.6)]);
  mk(new THREE.ShapeGeometry(jibS), std(0xffd23f, 0.8, { side: THREE.DoubleSide }), body, 0.45, 1.0, 0.0).castShadow = true;
  const navL = mk(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x40ff60 }), body, 2.0, 0.55, 0.8);
  return { g, body, sail, len: 4.4, bm: 1.6, draft: 0.05 };
}
export function makeCruise() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  mk(hullGeo(28, 5.2, 3.2, 0.32), std(0xf6f6f2, 0.45), body, 0, -1.6, 0).castShadow = true;
  mk(hullGeo(28.1, 5.3, 1.3, 0.32), std(0x1d3f7a, 0.5), body, 0, -1.6, 0);
  const winM = new THREE.MeshStandardMaterial({ map: winTex(22, 1, 0.7), roughness: 0.3, emissive: 0xffd080, emissiveIntensity: 0, emissiveMap: winTex(22, 1, 0.7, '#000000') });
  const decks = [[20, 4.6, 1.3, 2.25], [17, 4.3, 1.2, 3.5], [13, 3.9, 1.1, 4.65]];
  for (const [l, w, h, y] of decks) { const d = mk(new RoundedBoxGeometry(l, h, w, 2, 0.12), std(0xf8f8f6, 0.5), body, -2.5, y, 0); d.castShadow = true; for (const s of [-1, 1]) { const p = mk(new THREE.PlaneGeometry(l - 0.6, h * 0.55), winM, body, -2.5, y + 0.05, s * (w / 2 + 0.01)); if (s < 0) p.rotation.y = PI; } }
  for (const s of [-1, 1]) { const p = mk(new THREE.PlaneGeometry(22, 0.7), winM, body, -1.5, 0.95, s * 2.62); if (s < 0) p.rotation.y = PI; }
  const funnel = mk(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 20), std(0xd23a2e, 0.5), body, -8, 6.2, 0); funnel.scale.z = 0.7; funnel.castShadow = true;
  mk(new THREE.CylinderGeometry(0.92, 0.92, 0.45, 20), std(0x1b1b1b, 0.5), body, -8, 7.25, 0).scale.z = 0.7;
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) mk(new RoundedBoxGeometry(1.6, 0.6, 0.7, 2, 0.15), std(0xff7a2a, 0.6), body, -10 + i * 2.6, 2.95, s * 2.55);
  // passengers along the top rail: little heads + shirts (instanced), they lurch on the bump
  const n = 26, pm = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 8), std(0xffffff, 0.7), n), hm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 10, 8), std(0xffffff, 0.6), n);
  const pc = [0xe8504a, 0x4aa3e8, 0xf2c94c, 0x6fcf6a, 0xb36be8, 0xff8a3d], sk = [0xf2c29a, 0xd8a07a, 0x9a6a4a, 0xf6d0b0];
  for (let i = 0; i < n; i++) { pm.setColorAt(i, new THREE.Color(pc[i % 6])); hm.setColorAt(i, new THREE.Color(sk[(i * 3) % 4])); }
  body.add(pm, hm); pm.frustumCulled = hm.frustumCulled = false;
  const pass = Array.from({ length: n }, (_, i) => ({ x: -10 + (i % 13) * 1.15, z: (i < 13 ? 1 : -1) * 1.75, ph: h2(i, 3) * 6 }));
  const m4 = new THREE.Matrix4();
  const setPass = (t, jolt = 0) => pass.forEach((p, i) => { const lean = jolt * (0.6 + 0.4 * Math.sin(p.ph)), bob = 0.03 * Math.sin(t * 3 + p.ph); m4.makeTranslation(p.x + lean * 0.4, 5.6 + bob, p.z); pm.setMatrixAt(i, m4); m4.makeTranslation(p.x + lean * 0.7, 6.05 + bob + 0.05 * jolt, p.z); hm.setMatrixAt(i, m4); pm.instanceMatrix.needsUpdate = hm.instanceMatrix.needsUpdate = true; });
  setPass(0);
  const nameP = mk(new THREE.PlaneGeometry(4.0, 0.6), new THREE.MeshStandardMaterial({ map: signTex('SEA PRINCESS', { w: 512, h: 80, bg: '#1d3f7a', fg: '#ffd23f', px: 64 }), roughness: 0.5 }), body, 9.5, 0.2, 2.64);
  return { g, body, winM, setPass, len: 28, bm: 5.2, draft: 0.9 };
}
export function makeFreighter() {   // a container ship (bigger than the cruise ship): dark hull, stacked boxes, a bridge tower at the stern
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  mk(hullGeo(34, 6.2, 3.4, 0.28), std(0x7a2a24, 0.55), body, 0, -1.7, 0).castShadow = true;
  mk(hullGeo(34.1, 6.3, 1.2, 0.28), std(0x1d1f22, 0.6), body, 0, -1.7, 0);
  const cols = [0x2f6db5, 0xd2462f, 0xf2b630, 0x3f9a4a, 0x8a8f94, 0xe07a2a];
  for (let i = 0; i < 9; i++) for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) { const c = mk(new THREE.BoxGeometry(2.4, 1.15, 1.9), std(cols[(i * 3 + j * 2 + k * 5) % 6], 0.7), body, -6 + i * 2.5, 2.25 + k * 1.18, (j - 1) * 1.95); c.castShadow = true; }
  const bridge = mk(new RoundedBoxGeometry(3.2, 5.2, 5.4, 2, 0.1), std(0xf2f0ea, 0.5), body, -13.5, 4.3, 0); bridge.castShadow = true;
  const winM = new THREE.MeshStandardMaterial({ color: 0x9fd0f0, roughness: 0.2, emissive: 0xffc070, emissiveIntensity: 0 });
  for (const z of [-2.71, 2.71]) { const w = mk(new THREE.PlaneGeometry(2.8, 0.7), winM, body, -13.5, 6.0, z); if (z < 0) w.rotation.y = PI; }
  mk(new THREE.PlaneGeometry(0.7, 4.8), winM, body, -11.88, 6.0, 0).rotation.y = PI / 2;
  mk(new THREE.CylinderGeometry(0.6, 0.7, 2.0, 14), std(0x1d1f22, 0.5), body, -14.5, 7.8, 0);
  for (const [z, col] of [[-2.8, 0xff3030], [2.8, 0x30ff60]]) mk(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: col, toneMapped: false }), body, -12.0, 6.9, z);   // nav lights (port red, starboard green) + a white masthead light
  mk(new THREE.CylinderGeometry(0.08, 0.08, 6, 8), std(0xf2f0ea, 0.5), body, 15.5, 3.5, 0); mk(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), body, 15.5, 6.6, 0);
  const name = mk(new THREE.PlaneGeometry(5, 0.7), new THREE.MeshStandardMaterial({ map: signTex('MEGA BOX', { w: 512, h: 72, bg: '#7a2a24', fg: '#ffffff', px: 60 }), roughness: 0.5 }), body, 10, 0.4, 3.12);
  return { g, body, winM, len: 34, bm: 6.2, draft: 1 };
}
export function makeBarge() {   // a little crane barge (it delivers the glass boulder and bobs UP when the load leaves)
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  mk(new RoundedBoxGeometry(6.0, 1.0, 2.8, 2, 0.12), std(0x6b7378, 0.6), body, 0, 0.0, 0).castShadow = true;
  mk(new THREE.BoxGeometry(6.02, 0.2, 2.82), std(0xf2c230, 0.6), body, 0, 0.35, 0);
  const mast = mk(new THREE.CylinderGeometry(0.13, 0.16, 3.6, 10), std(0xf2c230, 0.5), body, 1.8, 2.3, 0); mast.castShadow = true;
  const boom = new THREE.Group(); body.add(boom); boom.position.set(1.8, 3.9, 0);   // the boom reaches 7.6 m over the bow (local +x)
  const arm = mk(new THREE.BoxGeometry(7.8, 0.18, 0.18), std(0xf2c230, 0.5), boom, 3.8, 0, 0); arm.castShadow = true;
  const cable = mk(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), metal(0x444444), body, 0, 0, 0);
  const sign = mk(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshStandardMaterial({ map: signTex('GLASS CO.', { w: 512, h: 108, bg: '#2a2f33', fg: '#9fe8ff', px: 80 }), roughness: 0.6 }), body, 0.6, 0.0, 1.41);
  return { g, body, boom, cable, tipX: 1.8 + 7.6, tipY: 3.9, len: 6, bm: 2.8, draft: 0.3 };
}

// ---------------------------------------------------------------- the seagull + a fish
export function makeGull() {
  const W = std(0xffffff, 0.6), G = std(0xb9c2c9, 0.6), K = std(0x24272a, 0.6), Y = std(0xf2c230, 0.45), O = std(0xf08a2b, 0.6), dark = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const b = mk(new THREE.SphereGeometry(0.2, 20, 14), W, body, 0, 0.32, 0); b.scale.set(0.85, 0.85, 1.45); b.castShadow = true;
  mk(new THREE.ConeGeometry(0.1, 0.32, 10), G, body, 0, 0.34, -0.34).rotation.x = -PI / 2 - 0.25;
  const head = new THREE.Group(); body.add(head); head.position.set(0, 0.58, 0.22);
  mk(new THREE.SphereGeometry(0.15, 18, 14), W, head, 0, 0, 0).castShadow = true;
  const beak = new THREE.Group(); head.add(beak); beak.position.set(0, -0.02, 0.13);
  const up = mk(new THREE.ConeGeometry(0.045, 0.2, 10), Y, beak, 0, 0.012, 0.09); up.rotation.x = PI / 2;
  const lo = new THREE.Group(); beak.add(lo); const low = mk(new THREE.ConeGeometry(0.035, 0.16, 10), Y, lo, 0, -0.018, 0.07); low.rotation.x = PI / 2;
  mk(new THREE.SphereGeometry(0.014, 8, 6), std(0xd42a22, 0.5), lo, 0, -0.03, 0.09);
  const eyes = [-1, 1].map((s) => { const e = new THREE.Group(); head.add(e); e.position.set(s * 0.075, 0.05, 0.1); e.rotation.y = s * 0.45;
    mk(new THREE.SphereGeometry(0.048, 14, 10), std(0xffffff, 0.3), e, 0, 0, 0).scale.set(1, 1.15, 0.6);
    const p = mk(new THREE.SphereGeometry(0.022, 10, 8), dark, e, 0, 0, 0.03); const brow = mk(new THREE.BoxGeometry(0.08, 0.016, 0.02), K, e, 0, 0.06, 0.02); brow.rotation.z = s * -0.35;
    const sp = mk(new THREE.TorusGeometry(0.022, 0.006, 4, 16, PI * 1.6), dark, e, 0, 0, 0.032); sp.visible = false; return { p, sp, brow, s }; });
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); body.add(w); w.position.set(s * 0.14, 0.42, 0.02); const f = mk(new THREE.SphereGeometry(0.3, 16, 8), G, w, s * 0.28, 0, -0.04); f.scale.set(1.0, 0.1, 0.5); f.castShadow = true; mk(new THREE.SphereGeometry(0.13, 10, 6), K, w, s * 0.55, 0, -0.08).scale.set(1, 0.12, 0.6); return w; });
  const legs = [-1, 1].map((s) => { const l = mk(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 6), O, body, s * 0.06, 0.1, 0); mk(new THREE.ConeGeometry(0.05, 0.08, 3), O, l, 0, -0.1, 0.03).rotation.x = PI / 2; return l; });
  function set(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(p.rx ?? 0, p.rotY ?? 0, p.rz ?? 0, 'YXZ'); root.scale.setScalar(p.scale ?? 1);
    const t = p.t ?? 0, fl = p.flap ?? 0, sq = p.squash ?? 0;
    body.scale.set(1 + sq * 0.5, 1 - sq * 0.6, 1 + sq * 0.3);
    wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (fl > 0 ? 0.2 + fl * 1.0 * Math.sin(t * 22) : -0.15) ; w.rotation.y = (p.spread ?? 0) * (i ? -1 : 1) * 0.3; });
    head.rotation.set((p.peck ?? 0) * 0.8 + (p.headX ?? 0), p.headY ?? 0, p.headZ ?? 0);
    lo.rotation.x = (p.open ?? 0) * 0.55;
    const ek = p.eyes || 'open';
    for (const e of eyes) { e.p.visible = ek !== 'spiral'; e.sp.visible = ek === 'spiral'; e.sp.rotation.z = t * -10 * e.s; e.p.scale.setScalar(ek === 'wide' ? 0.75 : 1); e.brow.rotation.z = e.s * (ek === 'angry' ? -0.6 : -0.2); e.brow.position.y = ek === 'wide' ? 0.075 : 0.06; }
    legs.forEach((l) => { l.visible = !p.tuck; });
  }
  set({});
  return { root, set, head, beak, body };
}
export function makeFish(color = 0xff8a2b) {
  const g = new THREE.Group(), m = std(color, 0.4);
  const b = mk(new THREE.SphereGeometry(0.2, 14, 10), m, g, 0, 0, 0); b.scale.set(1.6, 1, 0.6);
  const tail = mk(new THREE.ConeGeometry(0.16, 0.22, 4), m, g, -0.38, 0, 0); tail.rotation.z = PI / 2; tail.scale.z = 0.3;
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.05, 8, 6), std(0xffffff, 0.3), g, 0.2, 0.06, s * 0.1); mk(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }), g, 0.23, 0.06, s * 0.13); }
  return { g, tail };
}
export function makeFlashlightProp() {   // Gary's yellow flashlight (two D cells pop out of its tail)
  const g = new THREE.Group();
  const body = mk(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 14), std(0xf2c230, 0.45), g, 0, 0, 0); body.rotation.z = PI / 2;
  const head = mk(new THREE.CylinderGeometry(0.075, 0.05, 0.1, 16), std(0x2b2f36, 0.45), g, 0.21, 0, 0); head.rotation.z = PI / 2;
  const lensM = new THREE.MeshBasicMaterial({ color: 0xfff2c0, toneMapped: false }); const lens = mk(new THREE.CircleGeometry(0.068, 18), lensM, g, 0.262, 0, 0); lens.rotation.y = PI / 2;
  const cells = [0, 1].map(() => { const c = new THREE.Group(); mk(new THREE.CylinderGeometry(0.042, 0.042, 0.13, 12), std(0x2a2a2a, 0.5), c, 0, 0, 0); mk(new THREE.CylinderGeometry(0.043, 0.043, 0.04, 12), std(0xc98a2a, 0.4, { metalness: 0.6 }), c, 0, 0.05, 0); return c; });
  return { g, lensM, cells };
}
export function makeBoulder() {   // the would-be lens: a solid plano-convex lump of glass 2.2 m across
  const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, r = 1.1 * Math.sin(u * PI / 2); pts.push(new THREE.Vector2(Math.max(0.001, r), 0.75 * Math.cos(u * PI / 2))); } pts.push(new THREE.Vector2(0.001, 0));
  const geo = new THREE.LatheGeometry(pts.reverse(), 48); geo.rotateZ(-PI / 2);
  const m = new THREE.MeshStandardMaterial({ color: 0xbfe6f6, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.7, envMapIntensity: 1.6 });
  const g = new THREE.Group(); const lump = mk(geo, m, g, 0, 0, 0); lump.castShadow = true;
  const back = mk(new THREE.CircleGeometry(1.1, 48), m, g, 0, 0, 0); back.rotation.y = -PI / 2;
  return { g, m };
}
export function makeFresnelDisc() {   // the same bend, sliced into thin rings (a flat Fresnel lens seen side-on: a sawtooth)
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 1.6 });
  const rings = [];
  for (let i = 0; i < 6; i++) { const r0 = i * 0.18, r1 = (i + 1) * 0.18 + 0.02, h = 0.75 * (Math.cos(Math.asin(Math.min(1, r0 / 1.1))) - Math.cos(Math.asin(Math.min(1, r1 / 1.1)))) + 0.06;
    const pts = [new THREE.Vector2(r0 + 0.001, 0), new THREE.Vector2(r1, 0), new THREE.Vector2(r1, 0.04), new THREE.Vector2(r0 + 0.001, h)];
    const geo = new THREE.LatheGeometry(pts, 48); geo.rotateZ(-PI / 2); const o = mk(geo, m, g, 0, 0, 0); rings.push(o); }
  return { g, m, rings };
}
export function makeOak() {   // a gnarly little oak (Smeaton's idea: wide at the bottom)
  const g = new THREE.Group(), bark = std(0x6b4a2e, 0.9), leaf = std(0x4f8a34, 0.8);
  const pts = [new THREE.Vector2(0.55, 0), new THREE.Vector2(0.32, 0.25), new THREE.Vector2(0.22, 0.7), new THREE.Vector2(0.2, 1.4), new THREE.Vector2(0.001, 1.5)];
  mk(new THREE.LatheGeometry(pts, 20), bark, g, 0, 0, 0).castShadow = true;
  for (let i = 0; i < 7; i++) { const c = mk(new THREE.IcosahedronGeometry(0.55 + h2(i, 1) * 0.3, 1), leaf, g, (h2(i, 2) - 0.5) * 1.3, 1.6 + h2(i, 3) * 0.7, (h2(i, 4) - 0.5) * 1.0); c.castShadow = true; }
  return { g };
}
export function makeSprayCrown() {   // a ring of white water climbing a wall (the big wave over the tower): mottled foam, ragged lobed top, fading up
  const t = tex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); let s = 7; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);   // r3 look: a smooth cone read as plastic/ice — foam = thousands of soft white blobs
    for (let i = 0; i < 2600; i++) { const v = Math.pow(R(), 0.55), y = h * (1 - v), x = R() * w, r = 6 + 22 * R() * (0.4 + v), top = 1 - y / h;
      const a = (0.10 + 0.22 * R()) * Math.min(1, 1.6 * top + 0.15) * (y < h * 0.08 ? 0.3 : 1); const g = c.createRadialGradient(x, y, 0, x, y, r);
      const tint = 228 + Math.floor(27 * R()); g.addColorStop(0, `rgba(${tint},${Math.min(255, tint + 14)},255,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(240,250,255,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    const fade = c.createLinearGradient(0, 0, 0, h * 0.35); fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = fade; c.fillRect(0, 0, w, h * 0.35); c.globalCompositeOperation = 'source-over'; });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1);
  const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, emissive: 0xcfe6f2, emissiveIntensity: 0.45, alphaTest: 0.01 });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 1, 48, 1, true), m); mesh.renderOrder = 6; mesh.visible = false;
  return { mesh, m };
}

// ---------------------------------------------------------------- Smeaton's base, foghorn, helipad, perch, radio
export function makeSkirt(tw) {   // a flared granite skirt round the base (an oak trunk's foot), cut at z = 0 like the shell; grows up (setSkirt)
  const R0 = 3.3, R1 = D.T.r0 + 0.04, H = 3.1, rAt = (y) => R1 + (R0 - R1) * Math.pow(1 - clamp((y - D.RY) / H), 2.2);
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -100), clips = [clip];
  const blockT = tex(512, 256, (g, w, h) => { g.fillStyle = '#8f8a83'; g.fillRect(0, 0, w, h); for (let r = 0; r < 6; r++) for (let c = -1; c < 9; c++) { const x = c * 64 + (r % 2) * 32, y = r * 42.6; g.fillStyle = ['#b9b3a9', '#a9a399', '#c6c0b6', '#9f998f'][(r * 5 + c * 3 + 40) % 4]; g.fillRect(x + 2, y + 2, 60, 38.6); } });
  blockT.wrapS = blockT.wrapT = THREE.RepeatWrapping; blockT.repeat.set(6, 1);
  const pts = []; for (let k = 0; k <= 20; k++) { const y = D.RY + k / 20 * H; pts.push(new THREE.Vector2(rAt(y), y)); }
  const geo = new THREE.LatheGeometry(pts, 72, PI / 2, PI);
  const m = new THREE.MeshStandardMaterial({ map: blockT, roughness: 0.8, clippingPlanes: clips, clipShadows: true, side: THREE.DoubleSide });
  const shell = mk(geo, m, tw.g, 0, 0, 0); shell.castShadow = true; shell.receiveShadow = true;
  const secT = tex(512, 512, (g, w, h) => { g.fillStyle = '#5e5a55'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) for (let c = -1; c < 5; c++) { const x = c * 128 + (r % 2) * 64, y = r * 85.3, gc = ['#b4ada3', '#a39d94', '#c2bcb2', '#9b958c'][(r * 3 + c + 8) % 4];
      g.fillStyle = gc; g.beginPath(); g.moveTo(x + 3, y + 3); g.lineTo(x + 125, y + 3); g.lineTo(x + 125, y + 26); g.lineTo(x + 150, y + 16); g.lineTo(x + 150, y + 68); g.lineTo(x + 125, y + 58); g.lineTo(x + 125, y + 82); g.lineTo(x + 3, y + 82); g.lineTo(x + 3, y + 58); g.lineTo(x + 28, y + 68); g.lineTo(x + 28, y + 16); g.lineTo(x + 3, y + 26); g.closePath(); g.fill(); } });
  secT.wrapS = secT.wrapT = THREE.RepeatWrapping;
  const sp = []; for (let k = 0; k <= 20; k++) { const y = D.RY + k / 20 * H; sp.push(new THREE.Vector2(rAt(y), y)); } for (let k = 20; k >= 0; k--) { const y = D.RY + k / 20 * H; sp.push(new THREE.Vector2(-rAt(y), y)); }
  const sec = mk(new THREE.ShapeGeometry(new THREE.Shape(sp)), new THREE.MeshStandardMaterial({ map: secT, roughness: 0.8, clippingPlanes: clips, clipShadows: true }), tw.g, 0, 0, 0.006);
  { const uvA = sec.geometry.attributes.uv, pA = sec.geometry.attributes.position; for (let i = 0; i < uvA.count; i++) uvA.setXY(i, pA.getX(i) / 2.4, pA.getY(i) / 2.4); }
  const setSkirt = (k) => { shell.visible = sec.visible = k > 0.001; clip.constant = D.RY + 0.02 + k * H; };
  setSkirt(0);
  return { shell, sec, setSkirt, rAt, H };
}
export function makeHorn() {   // a brass fog trumpet on a bracket + a red compressed-air tank (origin = the bracket foot; the bell points +x)
  const g = new THREE.Group(), brass = metal(0xd4a640, 0.28, 0.9);
  const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push(new THREE.Vector2(0.09 + 0.62 * Math.pow(u, 3.2), u * 1.9)); }
  const bellG = new THREE.LatheGeometry(pts, 36); bellG.rotateZ(-PI / 2);
  const bell = mk(bellG, new THREE.MeshStandardMaterial({ color: 0xd4a640, roughness: 0.28, metalness: 0.9, side: THREE.DoubleSide }), g, 0, 0.9, 0); bell.castShadow = true;
  mk(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 10), metal(0x3a3a3a, 0.5, 0.6), g, 0.2, 0.45, 0);
  const tank = mk(new THREE.CapsuleGeometry(0.22, 0.55, 6, 16), std(0xc0392b, 0.45, { metalness: 0.3 }), g, -0.55, 0.45, 0.0); tank.castShadow = true;
  const pump = new THREE.Group(); g.add(pump); pump.position.set(-0.55, 0.95, 0); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), metal(0x888888), pump, 0, 0.25, 0); mk(new THREE.BoxGeometry(0.3, 0.05, 0.05), std(0x2b1d14), pump, 0, 0.5, 0);
  return { g, bell, tank, pump, mouth: new THREE.Vector3(1.9, 0.9, 0) };
}
export function makeHelipad() {
  const g = new THREE.Group();
  const deck = mk(new THREE.CylinderGeometry(2.1, 2.1, 0.14, 40), std(0x3d4246, 0.6), g, 0, 0, 0); deck.castShadow = true;
  const top = mk(new THREE.CircleGeometry(2.05, 40), new THREE.MeshStandardMaterial({ map: tex(256, 256, (c, w) => { c.fillStyle = '#3d4246'; c.fillRect(0, 0, w, w); c.strokeStyle = '#f2d24a'; c.lineWidth = 12; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.stroke(); c.fillStyle = '#ffffff'; c.font = font(150); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', 128, 138); }), roughness: 0.6 }), g, 0, 0.075, 0); top.rotation.x = -PI / 2;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; beam(g, [Math.cos(a) * 1.7, -0.05, Math.sin(a) * 1.7], [Math.cos(a) * 0.5, -0.9, Math.sin(a) * 0.5], 0.05, metal(0x6a6e72, 0.5, 0.6)); }
  return { g };
}
export function makePerch() {   // a T-shaped bird perch (Trinity House + RSPB fitted them to lanterns)
  const g = new THREE.Group(), w = std(0x8b6a44, 0.85);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), w, g, 0, 0.35, 0); const bar = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), w, g, 0, 0.7, 0); bar.rotation.z = PI / 2;
  const sign = mk(new THREE.PlaneGeometry(0.42, 0.16), new THREE.MeshStandardMaterial({ map: signTex('BIRDS', { w: 256, h: 96, bg: '#f2d24a', fg: '#1b1b1b', px: 70 }), roughness: 0.6, side: THREE.DoubleSide }), g, 0, 0.5, 0.04);
  return { g, top: 0.73 };
}
export function makeRadio() {   // a whip antenna + a little radio box on the gallery
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.4, 0.3, 0.25, 2, 0.03), std(0x3a5a40, 0.6), g, 0, 0.15, 0).castShadow = true;
  mk(new THREE.CylinderGeometry(0.012, 0.02, 2.4, 6), metal(0xb9bec3, 0.3, 0.9), g, 0.12, 1.5, 0);
  const tip = mk(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30, toneMapped: false }), g, 0.12, 2.72, 0);
  return { g, tip };
}

export function makeBigWave() {   // a cartoon breaking wave: a curling wall extruded along z, travelling -x (crest face toward -x); origin = its toe
  const H = 1, P = [[24, 0], [15, 0.24], [8, 0.6], [3.4, 0.86], [0.6, 1.0], [-2.4, 0.98], [-4.4, 0.86], [-4.6, 0.74], [-3.4, 0.68], [-1.6, 0.66], [-0.6, 0.5], [-1.2, 0.26], [-3.6, 0.0]];
  const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y * H)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 90, bevelEnabled: false, curveSegments: 4, steps: 1 }); geo.translate(0, 0, -45);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), deep = new THREE.Color(0x1d6f8c), light = new THREE.Color(0x6fd6e6), foam = new THREE.Color(0xf4fbff), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); c.copy(deep).lerp(light, Math.min(1, y * 1.1)); if (y > 0.84 || (x < -0.9 && y > 0.6)) c.lerp(foam, 0.85); else if (y < 0.06) c.lerp(foam, 0.6); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.96, side: THREE.DoubleSide, envMapIntensity: 0.8 });
  const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.visible = false;
  return { mesh, m };
}
// ---------------------------------------------------------------- the far coast (cliffs, a town, the lighthouse next door)
function makeCoast(root, Lmk) {
  const g = new THREE.Group(); root.add(g);
  const N = 140, pos = [], col = [], idx = [];
  for (let i = 0; i <= N; i++) { const a = -PI / 2 + (i / N - 0.5) * 2.4, r = D.coastR + 30 * Math.sin(i * 0.31) + 18 * Math.sin(i * 0.11 + 1), hgt = 26 + 16 * Math.sin(i * 0.23 + 2) + 9 * Math.sin(i * 0.71) + (Math.abs(a + 0.98) < 0.05 ? 8 : 0);
    const x = Math.cos(a) * r, z = Math.sin(a) * r; pos.push(x, -6, z, x * 1.015, hgt * 0.92, z * 1.015, x * 1.06, hgt, z * 1.06); col.push(0.32, 0.3, 0.3, 0.44, 0.42, 0.4, 0.36, 0.5, 0.28); }
  for (let i = 0; i < N; i++) { const a = i * 3, b = a + 3; idx.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const cliffs = mk(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide }), g, 0, 0, 0); cliffs.castShadow = false; cliffs.receiveShadow = false;
  // a small town's windows at the cliff foot (lit at night)
  const winM = new THREE.MeshBasicMaterial({ color: 0xffcf7a, transparent: true, opacity: 0, toneMapped: false, fog: false });
  const wn = 70, wm = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.4, 1.0), winM, wn); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < wn; i++) { const a = -PI / 2 + 0.25 + h2(i, 1) * 0.55, r = D.coastR - 6, x = Math.cos(a) * r, z = Math.sin(a) * r; q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a - PI / 2); m4.compose(new THREE.Vector3(x, 2 + h2(i, 2) * 10, z), q, new THREE.Vector3(1, 1, 1)); wm.setMatrixAt(i, m4); }
  g.add(wm); wm.frustumCulled = false;
  // the lighthouse next door (on the headland at the left): a white tower, a red lantern, its own beam (1 flash / 6 s)
  const nd = new THREE.Group(); g.add(nd); nd.position.set(...D.nextDoor);
  mk(new THREE.CylinderGeometry(1.6, 2.4, 12, 16), std(0xf3f0e8, 0.7), nd, 0, 6, 0); mk(new THREE.CylinderGeometry(1.4, 1.4, 2.2, 16), std(0xb3332b, 0.6), nd, 0, 13.1, 0);
  const ndLamp = mk(new THREE.SphereGeometry(0.9, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false, fog: false }), nd, 0, 13.1, 0);
  const ndBeam = Lmk(110, 9); ndBeam.position.set(0, 13.1, 0); nd.add(ndBeam);
  // a red bell buoy + a few sea rocks
  const buoy = new THREE.Group(); root.add(buoy); mk(new THREE.CylinderGeometry(0.45, 0.6, 0.7, 14), std(0xd23a2e, 0.5), buoy, 0, 0.1, 0); mk(new THREE.ConeGeometry(0.4, 1.4, 4), std(0xd23a2e, 0.5), buoy, 0, 1.1, 0).castShadow = true;
  const buoyL = mk(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff5040, toneMapped: false }), buoy, 0, 1.9, 0);
  for (const [x, z, s] of [[-17, -9, 1.6], [-21, -4, 1.0], [15, -14, 1.3], [19, -20, 0.8], [-12, -24, 1.2]]) { const r = mk(new THREE.IcosahedronGeometry(s, 1), std(0x77726b, 0.85), root, x, 0.1, z); r.scale.set(1.3, 0.8, 1); r.castShadow = true; }
  return { g, wm, winM, nd, ndLamp, ndBeam, buoy, buoyL, cliffs };
}

// ---------------------------------------------------------------- moods (time of day + weather), blended by setMood
const C = (h) => new THREE.Color(h);
export const MOODS = {
  golden: { top: C(0x4a86d0), hor: C(0xffe0b0), bot: C(0x2c6f8c), sun: C(0xffd08a), sunI: 2.6, dir: [0.6, 0.35, 0.6], hs: C(0xffe6c8), hg: C(0x6a6658), hi: 1.05, fog: C(0xf0dcc0), fn: 140, ff: 760, sh: C(0x34b3c4), dp: C(0x14618a), stars: 0, moon: 0, glow: 1.2, cloud: 0.5, ccol: C(0xfff0dc), exp: 1.02, env: 0.7, win: 0, beam: 0.2, fk: 1 },
  day:   { top: C(0x3f8fdf), hor: C(0xcfe6f2), bot: C(0x2c6f8c), sun: C(0xfff2dc), sunI: 2.7, dir: [-0.35, 0.82, 0.55], hs: C(0xdcebff), hg: C(0x617078), hi: 1.05, fog: C(0xcfe2ec), fn: 140, ff: 760, sh: C(0x2aa6b8), dp: C(0x0e5a85), stars: 0, moon: 0, glow: 1, cloud: 0.55, ccol: C(0xffffff), exp: 1.0, env: 0.7, win: 0, beam: 0.18, fk: 1 },
  dusk:  { top: C(0x35407e), hor: C(0xff9a6a), bot: C(0x2a3f5e), sun: C(0xffa868), sunI: 2.1, dir: [0.75, 0.22, 0.62], hs: C(0xffc6a8), hg: C(0x4a4458), hi: 0.95, fog: C(0xd99a88), fn: 120, ff: 650, sh: C(0x3a7c94), dp: C(0x173f63), stars: 0.15, moon: 0.2, glow: 1.4, cloud: 0.6, ccol: C(0xffb59a), exp: 1.02, env: 0.6, win: 0.5, beam: 0.45, fk: 0.7 },
  night: { top: C(0x14296a), hor: C(0x3a5a94), bot: C(0x0f2238), sun: C(0xb0c8ff), sunI: 1.25, dir: [-0.38, 0.62, 0.68], hs: C(0x8f9cc0), hg: C(0x3a3550), hi: 1.15, fog: C(0x1c3060), fn: 110, ff: 620, sh: C(0x2a6a90), dp: C(0x0e2c4c), stars: 1, moon: 1, glow: 0, cloud: 0.12, ccol: C(0x4a5d88), exp: 1.38, env: 0.4, win: 1, beam: 1, fk: 0.3 },   // r1 look review: night ran at a mean of 45–60/255 (034: 130+)
  storm: { top: C(0x2b3238), hor: C(0x5f6b6e), bot: C(0x1d2a2c), sun: C(0xc8d4dc), sunI: 0.9, dir: [-0.3, 0.7, 0.6], hs: C(0x8c9ba5), hg: C(0x2a3035), hi: 1.15, fog: C(0x4f5b60), fn: 45, ff: 300, sh: C(0x3f6a6c), dp: C(0x16302f), stars: 0, moon: 0, glow: 0, cloud: 0.9, ccol: C(0x3c4448), exp: 1.25, env: 0.4, win: 1, beam: 0.85, fk: 0.55 },
  fog:   { top: C(0xb3bdc2), hor: C(0xd2d8d8), bot: C(0x9aa6aa), sun: C(0xffffff), sunI: 0.75, dir: [-0.3, 0.7, 0.6], hs: C(0xd6dde0), hg: C(0x6a7378), hi: 1.15, fog: C(0xc5ced0), fn: 2.5, ff: 34, sh: C(0x6f8c94), dp: C(0x3a5560), stars: 0, moon: 0, glow: 0, cloud: 0, ccol: C(0xd0d6d8), exp: 1.0, env: 0.5, win: 0.6, beam: 0.6, fk: 0.5 },
  dawn:  { top: C(0x6b8fd2), hor: C(0xffc8a2), bot: C(0x3a5f80), sun: C(0xffd2a0), sunI: 2.2, dir: [-0.72, 0.3, 0.55], hs: C(0xffe2d2), hg: C(0x5a6070), hi: 1.0, fog: C(0xf0d6c6), fn: 120, ff: 650, sh: C(0x3a8aa8), dp: C(0x1a4a70), stars: 0.05, moon: 0.1, glow: 1.2, cloud: 0.6, ccol: C(0xffd6c0), exp: 1.0, env: 0.6, win: 0.2, beam: 0.3, fk: 0.8 },
};

export async function buildLighthouse(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96)).catch(() => {});
  renderer.localClippingEnabled = true;
  camera.far = 2400; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xcfe6f2); scene.fog = new THREE.Fog(0xcfe2ec, 140, 760);
  const sky = makeSky(root), ocean = makeOcean(root), rk = makeRock(root), tw = makeTower(root);
  const Lt = makeLight(tw.g);   // in the tower group (it leans with it); shots.js places it (Gary's hands → the growing top → the focal point)
  const shack = makeShack(root), sign = makeSign(root), ladder = makeLadder(root);
  const coast = makeCoast(root, (len, r) => { const b = Lt.beams[0].clone(); b.material = Lt.beams[0].material.clone(); b.geometry = new THREE.CylinderGeometry(0.4, r, len, 32, 1, true).translate(0, -len / 2, 0).rotateZ(PI / 2); b.material.uniforms.uLen.value = len; return b; });
  const rowboat = new THREE.Group(); root.add(rowboat); mk(hullGeo(2.6, 1.1, 0.45, 0.4), std(0x2f7d6a, 0.6), rowboat, 0, -0.15, 0).castShadow = true; mk(new THREE.BoxGeometry(0.2, 0.05, 1.0), std(0x8a6a44), rowboat, 0, 0.32, 0);
  const crown = makeSprayCrown(); root.add(crown.mesh);
  // lights: hemisphere + the sun / moon (one directional, shadows follow the camera's aim)
  const hemi = new THREE.HemisphereLight(0xdcebff, 0x617078, 1.0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; root.add(sun, sun.target);
  const SUN = new THREE.Vector3(0, 1, 0);
  function aimSun(cx, cy, cz, half = 12) { sun.position.set(cx + SUN.x * 60, cy + SUN.y * 60, cz + SUN.z * 60); sun.target.position.set(cx, cy, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix(); }
  // env map rendered from the sky (cached per mood key): water + glass reflect the current sky
  const pmrem = new THREE.PMREMGenerator(renderer), envScene = new THREE.Scene(), envDome = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), sky.dome.material); envScene.add(envDome);
  let envKey = '', envRT = null;
  const M = {};
  function setMood(a, b = a, u = 0, flashK = 0) {
    const A = MOODS[a], Bm = MOODS[b], mixC = (k) => A[k].clone().lerp(Bm[k], u), mixN = (k) => lerp(A[k], Bm[k], u);
    Object.assign(M, { top: mixC('top'), hor: mixC('hor'), stars: mixN('stars'), moon: mixN('moon'), win: mixN('win'), beam: mixN('beam'), exp: mixN('exp'), fn: mixN('fn'), ff: mixN('ff') });
    sky.U.uTop.value.copy(M.top); sky.U.uHor.value.copy(M.hor); sky.U.uBot.value.copy(mixC('bot')); sky.U.uSunCol.value.copy(mixC('sun')); sky.U.uSunGlow.value = mixN('glow');
    sky.U.uCloud.value = mixN('cloud'); sky.U.uCloudCol.value.copy(mixC('ccol')); sky.U.uFlash.value = flashK;
    SUN.set(...A.dir.map((v, i) => lerp(v, Bm.dir[i], u))).normalize(); sky.U.uSunDir.value.copy(SUN);
    sky.starM.uniforms.uA.value = M.stars; sky.moon.material.opacity = M.moon; sky.moonGlow.material.opacity = M.moon * 0.5; sky.moon.visible = sky.moonGlow.visible = M.moon > 0.01;
    sky.clouds.forEach((c) => { c.material.opacity = mixN('cloud') * 0.8; c.material.color.copy(mixC('ccol')); });
    sun.color.copy(mixC('sun')); sun.intensity = mixN('sunI') + flashK * 2.5; hemi.color.copy(mixC('hs')); hemi.groundColor.copy(mixC('hg')); hemi.intensity = mixN('hi') + flashK * 1.5;
    scene.fog.color.copy(mixC('fog')); scene.fog.near = M.fn; scene.fog.far = M.ff; scene.background.copy(mixC('fog'));
    ocean.U.uShallow.value.copy(mixC('sh')); ocean.U.uDeep.value.copy(mixC('dp')); ocean.U.uFoamK.value = mixN('fk'); ocean.U.uFoam.value.set(0xf4fbff).lerp(mixC('hs'), 0.4);
    renderer.toneMappingExposure = M.exp * (studio.baseExposure ?? 1.04);
    tw.lanFill.intensity = 2.6 * M.win;
    coast.winM.opacity = M.win; shack.g.children[3].material.emissiveIntensity = M.win * 0.8; tw.winM.emissiveIntensity = 0.3 + M.win * 0.9;
    const key = [a, b, Math.round(u * 20), Math.round(flashK * 4)].join('/');
    if (key !== envKey) { envKey = key; if (envRT) envRT.dispose(); envRT = pmrem.fromScene(envScene, 0, 0.1, 100); scene.environment = envRT.texture; }
    scene.environmentIntensity = mixN('env');
  }
  studio.baseExposure = renderer.toneMappingExposure;
  setMood('day');
  const SU = { t: 0, calm: 1, storm: 0, curve: 0, R: 150, bigA: 0, bigZ: -80, bigW: 6, bigDX: 0, bigDZ: 1 };
  function setSea(o) { Object.assign(SU, o); const U = ocean.U; U.uT.value = SU.t; U.uCalm.value = SU.calm; U.uStorm.value = SU.storm; U.uCurve.value = SU.curve; U.uR.value = SU.R; U.uBigA.value = SU.bigA; U.uBigZ.value = SU.bigZ; U.uBigW.value = SU.bigW; U.uBigD.value.set(SU.bigDX, SU.bigDZ); }
  setSea({});
  /** Per-frame: beams sweep / fade (a beam pointed at the lens shows as a flash glow, never a frame-filling cone), far light. */
  const v = new THREE.Vector3(), w = new THREE.Vector3();
  function update(t, cam, o = {}) {
    // the lighthouse next door: one flash every 6 s
    const nda = (t / 6) * TAU; coast.ndBeam.rotation.y = nda; coast.ndBeam.material.uniforms.uOpacity.value = 0.55 * M.beam * (o.nextDoor ?? 1);
    coast.ndLamp.material.color.setScalar(0.4 + 0.6 * Math.max(0, Math.cos(nda - 0.3)) ** 8);
    coast.buoyL.visible = Math.sin(t * 2.4) > 0.3;
    // our beams: o.beams = [{on, yaw}] (yaw about +y; 0 = +x)
    const F = Lt.g.getWorldPosition(v);
    let fl = 0;
    (o.beams || []).forEach((bb, i) => { const b = Lt.beams[i]; b.visible = bb.on > 0.001; if (!b.visible) return; b.rotation.y = bb.yaw;
      const dir = w.set(Math.cos(bb.yaw), 0, -Math.sin(bb.yaw)); const toCam = cam.position.clone().sub(F).normalize(); const al = dir.dot(toCam);
      const face = clamp((al - 0.86) / 0.12); b.material.uniforms.uOpacity.value = bb.on * (bb.k ?? 0.42) * M.beam * (1 - face * 0.92); fl = Math.max(fl, bb.on * face * (bb.flash ?? 1)); });
    for (let i = (o.beams || []).length; i < Lt.beams.length; i++) Lt.beams[i].visible = false;
    Lt.flash.material.opacity = fl * 0.95; Lt.flash.scale.setScalar(2.5 + 4 * fl);
  }
  return { root, scene, sky, ocean, rk, tw, Lt, shack, sign, ladder, coast, rowboat, crown, hemi, sun, aimSun, setMood, setSea, SU, M, update };
}
