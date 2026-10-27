// 032 set — "How a Bird Feeder Becomes a Space Station" (build genre, docs/BUILD.md).
// A toy planet (radius D.R, centre (0, −R, 0)) with a sunny backyard on its top (the origin), and at orbit altitude above it
// (D.st) a space station built as a dollhouse CUTAWAY: vertical modules sliced by the plane z = D.zc, so the camera (z > 0) sees
// inside, like the ground slice of 024–026. One continuous camera can climb from the lawn to orbit: the sky shader fades blue →
// black with altitude (setSpace), stars + the atmosphere rim fade in, the cloud deck (shader billboards) sits ~25 m up.
//   const W = await buildWorld(studio)     planet, sky, stars, clouds, atmosphere, sun (W.setSun, W.setSpace, W.update(t, cam))
//   const Y = await buildYard(W.root)      lawn, house, patio, fence, oak + branch, telescoping feeder pole, baffle, garden …
//   const S = await buildStation(W.root)   modules M1/M2 (+ hatches, power), airlock, truss + solar wings, Whipple shield, cupola …
// Props: makeFeeder, makeRocket, makeSquirrel, makeSongbird, makeHelmet, makeBackpack, makeBlob, makeTreadmill, makeToilet.
// Planet surface + clouds use their own small shaders (uSun) so the station can sit in Earth's shadow ("16 sunsets a day") while
// the planet keeps its own day/night terminator and city lights.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, mat, rng } from '../core.js';
import { lawnTexture } from './cutaway.js';
import { makeTree } from './subway.js';

const PI = Math.PI;
export const D = {
  R: 1200,                                   // planet radius; centre (0, −R, 0); the yard sits on top
  yard: { x0: -18, x1: 18, z0: -24, z1: 14 },
  pole: [0, -1.6],                           // feeder pole (x, z); top plate at y = pole height
  tree: [-4.75, -3.1],                       // the oak; its long branch reaches +x to BRANCH
  branch: [-2.95, 2.45, -2.3],               // branch tip (the squirrel's launch point, ~3.0 m = 10 ft from the feeder top)
  house: { z: -10.5, x0: -7.5, x1: 7.5, h: 6.0 },
  fence: { z: -5.4, x0: 1.2, x1: 6.2, top: 1.22 },   // the garden rail the birds wait on
  rocketAt: [2.1, -1.2],
  st: [22, 78],                              // station origin (x, y): the top of module M1; cut plane z = zc
  zc: 1.25, hw: 1.25, Rm: 1.9,               // cut plane, interior half-width (racks), hull radius
  m1: 4.6, gap: 0.3, m2: 4.6,                // module lengths (M2 hangs under M1 with a docking ring between)
  side: { y: -2.6, w: 0.9, h: 1.1 },         // M1's side hatch (right wall) → the airlock
  airlock: { x0: 1.9, x1: 4.7, r: 1.05, zc: 0.45 },
  truss: { y: 1.75, half: 6.5 },
  wing: { n: 8, pw: 1.55, h: 3.2 },          // panels per wing, panel width, wing height
};
// the stack, top → bottom (032 v2: one room per beat): M1 HAB (Gary's room, side hatch → airlock), M2 LIFE SUPPORT (green, plants,
// fans, the CO2 scrubber), M3 GALLEY (warm; the water recycler, coffee), M4 LAB (the paint-fleck hole + red alarm; the Whipple shield;
// the treadmill), M5 WC (the $23M toilet), then the cupola looking down at the backyard
D.mlen = [4.6, 4.6, 3.8, 4.6, 2.5]; D.mtop = []; { let y = 0; for (const L of D.mlen) { D.mtop.push(y); y -= L + D.gap; } }
D.bottom = D.mtop[4] - D.mlen[4]; D.cupH = 0.8;
D.m2top = D.mtop[1]; D.m2bot = D.mtop[1] - D.mlen[1];
D.hole = [-0.55, D.mtop[3] - 1.2];          // the paint-fleck hole high in M4's back wall (Gary plugs it), station-local
export const sphereY = (x, z, R = D.R) => Math.sqrt(Math.max(0, R * R - x * x - z * z)) - R;
export const ST = (x = 0, y = 0, z = 0) => [D.st[0] + x, D.st[1] + y, z];   // station-local → world

const tex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", sans-serif`;
const shadowOff = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = false; } }); return o; };

// ================================================================ WORLD: planet, sky, stars, clouds, atmosphere, sun
function planetGeometry(R, thMax, rings = 230, segs = 300) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= rings; i++) {
    const th = PI * Math.pow(i / rings, 1.75);
    for (let j = 0; j <= segs; j++) {
      const ph = (j / segs) * PI * 2, nx = Math.sin(th) * Math.cos(ph), ny = Math.cos(th), nz = Math.sin(th) * Math.sin(ph);
      pos.push(R * nx, R * ny - R, R * nz); nor.push(nx, ny, nz);
      const d = Math.min(1, th / thMax); uv.push(0.5 + 0.5 * d * Math.cos(ph), 0.5 - 0.5 * d * Math.sin(ph));
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) { const a = i * (segs + 1) + j, b = a + segs + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}

/** Disc map around the yard: canvas px = S/2 + (x, z)·ppm (x, z ≈ arc metres from the yard). */
function paintPlanet(S, R, thMax) {
  const ppm = S / 2 / (R * thMax), P = (x, z) => [S / 2 + x * ppm, S / 2 + z * ppm], Rn = rng(32);
  const coast = (a) => 300 + 55 * Math.sin(3 * a + 1.1) + 38 * Math.sin(5 * a + 2.3) + 18 * Math.sin(11 * a + 0.4) - 70 * Math.max(0, Math.sin(-a - 0.2)) ** 2;   // nearer coast toward −z (behind the station)
  const blob = (g, f, scale = 1, cx = 0, cz = 0) => { g.beginPath(); for (let k = 0; k <= 180; k++) { const a = (k / 180) * PI * 2, r = f(a) * scale, [x, y] = P(cx + Math.cos(a) * r, cz + Math.sin(a) * r); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  const map = tex(S, S, (g) => {
    const og = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); og.addColorStop(0, '#2b8ccc'); og.addColorStop(0.7, '#1f74b4'); og.addColorStop(1, '#185f98');
    g.fillStyle = og; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 900; i++) { const [x, y] = P((Rn() - 0.5) * 1500, (Rn() - 0.5) * 1500); g.fillStyle = `rgba(${Rn() < 0.5 ? '120,190,240' : '10,50,100'},.07)`; g.fillRect(x, y, 6 + Rn() * 40, 2 + Rn() * 4); }
    g.save(); g.filter = 'blur(10px)'; g.fillStyle = '#4fb2de'; blob(g, coast, 1.09); g.fill(); g.restore();
    g.fillStyle = '#e8d6a0'; blob(g, coast, 1.0); g.fill();
    g.fillStyle = '#6fae4f'; blob(g, coast, 0.965); g.fill();
    // a second island (far +x) + small isles
    g.fillStyle = '#e8d6a0'; blob(g, (a) => 60 + 14 * Math.sin(3 * a), 1, 470, 180); g.fill(); g.fillStyle = '#74b052'; blob(g, (a) => 52 + 12 * Math.sin(3 * a), 1, 470, 180); g.fill();
    g.save(); blob(g, coast, 0.965); g.clip();
    for (let i = 0; i < 700; i++) { const a = Rn() * PI * 2, r = Math.sqrt(Rn()) * 330, [x, y] = P(Math.cos(a) * r, Math.sin(a) * r); g.fillStyle = ['rgba(93,154,68,.55)', 'rgba(125,187,87,.5)', 'rgba(143,191,90,.45)', 'rgba(79,138,60,.5)'][i % 4]; g.beginPath(); g.arc(x, y, (8 + Rn() * 30) * ppm, 0, 7); g.fill(); }
    // farmland quilt in a ring
    for (let i = 0; i < 260; i++) { const a = Rn() * PI * 2, r = 150 + Rn() * 150, [x, y] = P(Math.cos(a) * r, Math.sin(a) * r); g.save(); g.translate(x, y); g.rotate(a + (Rn() - 0.5) * 0.4); g.fillStyle = ['#c9c46a', '#a9c45a', '#d8b86a', '#8db255', '#b8a060', '#9cc066'][i % 6]; const w = (22 + Rn() * 28) * ppm, h = (16 + Rn() * 24) * ppm; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(70,90,40,.5)'; g.lineWidth = 1.5; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
    // forests
    for (let i = 0; i < 46; i++) { const a = Rn() * PI * 2, r = 120 + Rn() * 200, cx = Math.cos(a) * r, cz = Math.sin(a) * r; for (let k = 0; k < 24; k++) { const [x, y] = P(cx + (Rn() - 0.5) * 40, cz + (Rn() - 0.5) * 40); g.fillStyle = k % 3 ? '#3f7a32' : '#4d8c3a'; g.beginPath(); g.arc(x, y, (3 + Rn() * 5) * ppm, 0, 7); g.fill(); } }
    // lake + river
    g.fillStyle = '#e6d6a6'; g.beginPath(); { const [x, y] = P(-135, 70); g.ellipse(x, y, 50 * ppm, 34 * ppm, 0.3, 0, 7); } g.fill();
    g.fillStyle = '#3a95d4'; g.beginPath(); { const [x, y] = P(-135, 70); g.ellipse(x, y, 45 * ppm, 30 * ppm, 0.3, 0, 7); } g.fill();
    g.strokeStyle = '#3a95d4'; g.lineWidth = 6 * ppm; g.lineCap = 'round'; g.beginPath(); [[-170, 85], [-210, 120], [-230, 180], [-260, 205], [-300, 240]].forEach(([x, z], k) => { const [px, py] = P(x, z); k ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
    // a highway arc + the town (−z, +x)
    g.strokeStyle = '#8f8f8a'; g.lineWidth = 9 * ppm; g.beginPath(); for (let k = 0; k <= 60; k++) { const a = -2.6 + k * 0.05, [x, y] = P(Math.cos(a) * 210, Math.sin(a) * 210); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let i = 0; i < 160; i++) { const [x, y] = P(150 + (Rn() - 0.5) * 90, -130 + (Rn() - 0.5) * 70); g.fillStyle = ['#c8c4bc', '#b0aaa0', '#d8d2c6', '#9a958c'][i % 4]; g.fillRect(x, y, (6 + Rn() * 10) * ppm, (6 + Rn() * 10) * ppm); }
    // the suburb: a street grid with houses, but nothing painted near the yard (3D houses stand there)
    g.fillStyle = '#a5a6a2'; const SP = 34;
    for (let k = -5; k <= 5; k++) { const v = k * SP + 17; { const [x0, y0] = P(-180, v), [x1] = P(180, v); g.fillRect(x0, y0 - 3.5 * ppm, x1 - x0, 7 * ppm); } { const [x0, y0] = P(v, -180), [, y1] = P(v, 180); g.fillRect(x0 - 3.5 * ppm, y0, 7 * ppm, y1 - y0); } }
    for (let i = 0; i < 900; i++) { const x = (Rn() - 0.5) * 360, z = (Rn() - 0.5) * 360; if (Math.hypot(x, z) < 62 || Math.hypot(x, z) > 175) continue; const [px, py] = P(x, z); g.fillStyle = ['#b78a74', '#9c8270', '#8f989f', '#c7a882', '#a5857a', '#d9d3c6'][i % 6]; g.fillRect(px, py, 6 * ppm, 7 * ppm); g.fillStyle = 'rgba(40,90,40,.8)'; g.beginPath(); g.arc(px + 12 * ppm, py + 4 * ppm, 3 * ppm, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = '#7cc05a'; { const [x0, y0] = P(D.yard.x0 - 2, D.yard.z0 - 2), [x1, y1] = P(D.yard.x1 + 2, D.yard.z1 + 2); g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  });
  const city = tex(S / 2, S / 2, (g, w) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, w); const Rc = rng(5), Q = (x, z) => [w / 2 + x * ppm / 2, w / 2 + z * ppm / 2];
    const dot = (x, z, r, a) => { const [px, py] = Q(x, z); g.fillStyle = `rgba(255,${190 + Rc() * 40},${110 + Rc() * 40},${a})`; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); };
    for (let k = -5; k <= 5; k++) for (let s = -180; s <= 180; s += 7) { const v = k * 34 + 17; if (Math.hypot(s, v) < 175) { dot(s, v, 1.2, 0.8); dot(v, s, 1.2, 0.8); } }
    for (let i = 0; i < 500; i++) dot(150 + (Rc() - 0.5) * 90, -130 + (Rc() - 0.5) * 70, 1 + Rc() * 2, 0.9);
    for (let i = 0; i < 700; i++) { const a = Rc() * PI * 2, r = Math.sqrt(Rc()) * 300; dot(Math.cos(a) * r, Math.sin(a) * r, 0.8 + Rc(), 0.5); }
  });
  return { map, city };
}

const PLANET_VS = `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){ vUv = uv; vN = normalize(normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const PLANET_FS = `uniform sampler2D uMap; uniform sampler2D uCity; uniform vec3 uSun; uniform vec3 uFog; uniform vec3 uCam; uniform float uFogNear; uniform float uFogFar; uniform float uAmb; uniform vec4 uHole;
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){
  if (vW.x > uHole.x && vW.x < uHole.y && vW.z > uHole.z && vW.z < uHole.w && vW.y > -4.0) discard;
  vec3 c = texture2D(uMap, vUv).rgb;
  float l = dot(normalize(vN), uSun);
  vec3 col = c * (uAmb + clamp(l * 1.15 + 0.1, 0.0, 1.0) * 1.05);
  col += texture2D(uCity, vUv).rgb * smoothstep(0.02, -0.25, l) * 1.6;
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, distance(vW, uCam)));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const CLOUD_VS = `attribute vec3 aC0; attribute float aS; attribute float aA; uniform vec3 uCam; uniform vec3 uSun; uniform float uR; uniform float uSpin; uniform vec4 uClear; varying vec2 vUv; varying float vA; varying float vDay;
void main(){ vUv = uv; vec3 c0 = aC0 + vec3(0.0, uR, 0.0); float cs = cos(uSpin), sn = sin(uSpin); vec3 aC = vec3(cs * c0.x - sn * c0.y, sn * c0.x + cs * c0.y, c0.z) - vec3(0.0, uR, 0.0); vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 w = aC + (right * position.x + up * position.y) * aS; float d = distance(aC, uCam);
  vA = aA * clamp((d - aS * 0.7 - 1.0) / 6.0, 0.0, 1.0) * smoothstep(0.6, 1.0, distance(aC, uClear.xyz) / max(uClear.w, 0.001));
  vDay = clamp(dot(normalize(aC - vec3(0.0, -uR, 0.0)), uSun) * 1.3 + 0.25, 0.08, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`;
const CLOUD_FS = `uniform sampler2D uMap; varying vec2 vUv; varying float vA; varying float vDay;
void main(){ vec4 c = texture2D(uMap, vUv); if (c.a * vA < 0.01) discard; gl_FragColor = vec4(c.rgb * vDay, c.a * vA);
  #include <colorspace_fragment>
}`;
const SKY_FS = `uniform float uSpace; uniform vec3 uSun; varying vec3 vD;
void main(){ vec3 d = normalize(vD); float h = d.y;
  vec3 day = mix(vec3(0.80, 0.90, 0.97), vec3(0.30, 0.58, 0.88), smoothstep(0.0, 0.55, h));
  float sg = pow(max(dot(d, uSun), 0.0), 220.0) * 2.0 + pow(max(dot(d, uSun), 0.0), 12.0) * 0.18;
  vec3 deep = vec3(0.05, 0.16, 0.48), night = vec3(0.004, 0.006, 0.016);
  vec3 c = (uSpace < 0.5 ? mix(day, deep, uSpace * 2.0) : mix(deep, night, uSpace * 2.0 - 1.0)) + vec3(1.0, 0.95, 0.85) * sg * (1.0 - uSpace * 0.6);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export async function buildWorld(studio) {
  const { scene, renderer, camera } = studio;
  camera.near = 0.05; camera.far = 6500; camera.updateProjectionMatrix();
  renderer.localClippingEnabled = true;
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0x000000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
  const R = D.R, C = new THREE.Vector3(0, -R, 0), thMax = 0.6;
  const SUN = new THREE.Vector3(0.42, 0.72, 0.55).normalize();
  // ---- planet
  const pm = paintPlanet(4096, R, thMax);
  const pU = { uMap: { value: pm.map }, uCity: { value: pm.city }, uSun: { value: SUN.clone() }, uFog: { value: new THREE.Color(0xcfe3f2) }, uCam: { value: new THREE.Vector3() },
    uFogNear: { value: 120 }, uFogFar: { value: 900 }, uAmb: { value: 0.16 }, uHole: { value: new THREE.Vector4(D.yard.x0, D.yard.x1, D.yard.z0, D.yard.z1) } };
  const planet = new THREE.Mesh(planetGeometry(R, thMax), new THREE.ShaderMaterial({ uniforms: pU, vertexShader: PLANET_VS, fragmentShader: PLANET_FS }));
  planet.frustumCulled = false; root.add(planet);
  // ---- atmosphere rim (seen from orbit)
  const atmU = { uC: { value: new THREE.Color(0x6fb4ff) }, uSun: pU.uSun, uK: { value: 0 } };
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R + 42, 160, 80), new THREE.ShaderMaterial({ uniforms: atmU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vW = normalize((modelMatrix * vec4(normal,0.0)).xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform vec3 uSun; uniform float uK; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(clamp(1.0 - abs(dot(vN, vV)), 0.0, 1.0), 2.6); float lit = clamp(dot(vW, uSun) * 0.9 + 0.35, 0.04, 1.0); gl_FragColor = vec4(uC * f * 1.5 * lit * uK, f * lit * uK); }' }));
  atm.position.copy(C); atm.frustumCulled = false; root.add(atm);
  // ---- sky dome + stars (follow the camera)
  const skyU = { uSpace: { value: 0 }, uSun: pU.uSun };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5200, 48, 24), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: SKY_FS }));
  sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);
  const SG = new THREE.BufferGeometry(), sp = [], Rs = rng(71);
  for (let i = 0; i < 5000; i++) { const u = Rs() * 2 - 1, a = Rs() * PI * 2, s = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * s * 4900, u * 4900, Math.sin(a) * s * 4900); }
  SG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const dot = tex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(0.35, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const stars = new THREE.Points(SG, new THREE.PointsMaterial({ size: 2.6, map: dot, transparent: true, depthWrite: false, color: 0xe4ecff, fog: false, sizeAttenuation: false, opacity: 0 }));
  stars.renderOrder = -9; stars.frustumCulled = false; root.add(stars);
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: new THREE.Color(0xfff2d8).multiplyScalar(4), toneMapped: false, depthWrite: false, fog: false, transparent: true, opacity: 0 }));
  sunDisc.scale.setScalar(150); root.add(sunDisc);
  // ---- cloud deck: shader billboards ~24–31 m up, none right above the yard except the puffs the rocket punches through
  const cloudT = tex(256, 256, (g) => { const Rc = rng(9); for (let k = 0; k < 9; k++) { const x = 70 + Rc() * 116, y = 90 + Rc() * 70, r = 34 + Rc() * 40, gr = g.createRadialGradient(x, y - r * 0.25, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(246,248,252,0.75)'); gr.addColorStop(1, 'rgba(235,240,248,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  const list = [], Rc = rng(41);
  const addPuff = (x, z, alt, s) => { const y = sphereY(x, z) + alt; for (let k = 0; k < 3; k++) list.push([x + (Rc() - 0.5) * s * 0.9, y + (Rc() - 0.5) * s * 0.18, z + (Rc() - 0.5) * s * 0.5, s * (0.6 + Rc() * 0.5), 0.85 + Rc() * 0.15]); };
  for (let i = 0; i < 230; i++) { const a = Rc() * PI * 2, r = 45 + Math.sqrt(Rc()) * 430, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > -10 && x < 40 && z > -30 && z < 24) continue; addPuff(x, z, 24 + Rc() * 7, 9 + Rc() * 12); }
  for (const [x, y, z, s] of [[7.5, 26, -1.5, 9], [12.5, 31, 1.0, 8], [4.0, 23.5, -6, 7], [16, 29, -5, 9]]) addPuff(x, z, y, s);
  const cg = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1)); cg.instanceCount = list.length;
  cg.setAttribute('aC0', new THREE.InstancedBufferAttribute(new Float32Array(list.flatMap((c) => c.slice(0, 3))), 3));
  cg.setAttribute('aS', new THREE.InstancedBufferAttribute(new Float32Array(list.map((c) => c[3])), 1));
  cg.setAttribute('aA', new THREE.InstancedBufferAttribute(new Float32Array(list.map((c) => c[4])), 1));
  const cU = { uMap: { value: cloudT }, uCam: pU.uCam, uSun: pU.uSun, uR: { value: R }, uSpin: { value: 0 }, uClear: { value: new THREE.Vector4(0, 0, 0, 0) } };
  const clouds = new THREE.Mesh(cg, new THREE.ShaderMaterial({ uniforms: cU, vertexShader: CLOUD_VS, fragmentShader: CLOUD_FS, transparent: true, depthWrite: false }));
  clouds.frustumCulled = false; clouds.renderOrder = 2; root.add(clouds);
  // ---- lights
  const hemi = new THREE.HemisphereLight(0xe2f1ff, 0x9a8a68, 1.0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.0); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  root.add(sun, sun.target);
  const fogDay = new THREE.Color(0xcfe3f2), fogSpace = new THREE.Color(0x7fb0ea);
  scene.fog = new THREE.Fog(fogDay.clone(), 60, 260);
  let sunK = 1, spaceK = 0;
  function aimSun(cx, cy, cz, half = 8) {
    sun.position.set(cx + SUN.x * 60, cy + SUN.y * 60, cz + SUN.z * 60); sun.target.position.set(cx, cy, cz);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 140 }); sun.shadow.camera.updateProjectionMatrix();
  }
  /** dir: the sun direction (toward the sun); k: 0..1 light on the station/yard (0 = in Earth's shadow). */
  function setSun(dir, k = 1) { SUN.copy(dir).normalize(); pU.uSun.value.copy(SUN); sunK = k; }
  /** 0 = backyard (blue sky, haze), 1 = orbit (black sky, stars, atmosphere rim). */
  function setSpace(k) { spaceK = clamp(k); }
  function update(t, cam) {
    const k = spaceK;
    const alt = cam.position.distanceTo(C) - R;
    skyU.uSpace.value = smooth(k); stars.material.opacity = smooth(clamp((k - 0.35) / 0.65)); atmU.uK.value = smooth(clamp((k - 0.2) / 0.8)) * smooth(clamp((alt - 50) / 18)); atm.visible = alt > 49;
    sky.position.copy(cam.position); stars.position.copy(cam.position);
    sunDisc.position.copy(cam.position).addScaledVector(SUN, 3000); sunDisc.material.opacity = smooth(k);
    pU.uCam.value.copy(cam.position);
    scene.fog.color.copy(fogDay).lerp(fogSpace, k); scene.fog.near = lerp(60, 400, k); scene.fog.far = lerp(260, 3000, k);
    pU.uFog.value.copy(fogDay).lerp(fogSpace, k); pU.uFogNear.value = lerp(90, 160, k); pU.uFogFar.value = lerp(420, 1400, k);
    sun.intensity = 3.0 * sunK; hemi.intensity = lerp(1.0, 0.5, k) * lerp(0.35, 1, sunK);
    hemi.color.setHex(0xe2f1ff).lerp(new THREE.Color(0x8fa6cc), k); hemi.groundColor.setHex(0x9a8a68).lerp(new THREE.Color(0x2f5f9a), k);
    scene.environmentIntensity = lerp(0.4, 0.25, k) * lerp(0.3, 1, sunK);
  }
  aimSun(0, 1, -2);
  /** Drift the cloud deck around the planet (radians about the z axis through its centre): the ground speed seen from orbit. */
  const setCloudSpin = (a) => (cU.uSpin.value = a);
  /** Clear a sight line through the deck: clouds within r of p fade out (r = 0 = off). */
  const setCloudClear = (p, r) => cU.uClear.value.set(p[0], p[1], p[2], r);
  return { root, planet, atm, sky, stars, clouds, sun, hemi, SUN, aimSun, setSun, setSpace, setCloudSpin, setCloudClear, update, C, R };
}

// ================================================================ THE BACKYARD
function sidingTex(color = '#f0e3bd', line = 'rgba(120,95,60,.28)') {
  return tex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = line; g.fillRect(0, y + 13, w, 3); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, y, w, 3); } });
}
function windowMesh(parent, w, h, x, y, z, frameC = 0xffffff, glass = 0x9fc8e4) {
  const g = new THREE.Group(); parent.add(g); g.position.set(x, y, z);
  const fm = mat(frameC, 0.5);
  mk(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08), fm, g, 0, 0, 0);
  mk(new THREE.BoxGeometry(w, h, 0.05), new THREE.MeshStandardMaterial({ color: glass, roughness: 0.08, metalness: 0.3, emissive: 0x1d3446, emissiveIntensity: 0.4 }), g, 0, 0, 0.03);
  mk(new THREE.BoxGeometry(0.05, h, 0.06), fm, g, 0, 0, 0.06); mk(new THREE.BoxGeometry(w, 0.05, 0.06), fm, g, 0, 0, 0.06);
  mk(new THREE.BoxGeometry(w + 0.3, 0.07, 0.16), fm, g, 0, -h / 2 - 0.1, 0.06);
  return g;
}
function makeHouse(parent, { w = 9, d = 8, h = 5.2, color = '#e8d8b0', roof = 0xb8553c, seed = 1 } = {}) {
  const g = new THREE.Group(); parent.add(g); const R = rng(seed);
  const st = sidingTex(color); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(w / 3, h / 3);
  mk(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: st, roughness: 0.85 }), g, 0, h / 2, 0);
  const rs = new THREE.Shape(); rs.moveTo(-d / 2 - 0.4, 0); rs.lineTo(0, d * 0.42); rs.lineTo(d / 2 + 0.4, 0); rs.closePath();
  const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 0.6, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.6) / 2);
  const r = mk(rg, mat(roof, 0.8), g, 0, h, 0); r.rotation.y = PI / 2;
  for (const s of [-1, 1]) windowMesh(g, 1.1, 1.2, s * w * 0.25, h * 0.62, d / 2 + 0.02);
  mk(new THREE.BoxGeometry(1.0, 2.0, 0.1), mat([0x8a4a2a, 0x2f5f8a, 0x3a6a3a][Math.floor(R() * 3)], 0.6), g, 0, 1.0, d / 2 + 0.03);
  return g;
}

export async function buildYard(parent) {
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const g = new THREE.Group(); parent.add(g);
  const Y = D.yard, W = Y.x1 - Y.x0, L = Y.z1 - Y.z0, cx = (Y.x0 + Y.x1) / 2, cz = (Y.z0 + Y.z1) / 2;
  const lt = lawnTexture('#78bd52', '#69ad47'); lt.repeat.set(W / 1.5, L / 1.5);
  const lawn = mk(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.95 }), g, cx, 0, cz); lawn.rotation.x = -PI / 2; lawn.castShadow = false;
  const soil = mat(0x7a5436, 1);
  for (const [x, z, w, d] of [[cx, Y.z1, W, 0.1], [cx, Y.z0, W, 0.1], [Y.x0, cz, 0.1, L], [Y.x1, cz, 0.1, L]]) mk(new THREE.BoxGeometry(w, 1.6, d), soil, g, x, -0.8, z);
  // house (back of it faces the yard: +z)
  const H = D.house;
  const st = sidingTex('#cfe0e8', 'rgba(60,90,110,.25)'); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set((H.x1 - H.x0) / 3, H.h / 3);
  const house = new THREE.Group(); g.add(house);
  mk(new THREE.BoxGeometry(H.x1 - H.x0, H.h, 6), new THREE.MeshStandardMaterial({ map: st, roughness: 0.85 }), house, 0, H.h / 2, H.z - 3);
  { const rs = new THREE.Shape(); rs.moveTo(-3.6, 0); rs.lineTo(0, 2.7); rs.lineTo(3.6, 0); rs.closePath(); const rg = new THREE.ExtrudeGeometry(rs, { depth: H.x1 - H.x0 + 0.8, bevelEnabled: false }); rg.translate(0, 0, -(H.x1 - H.x0 + 0.8) / 2);
    const sh = tex(256, 256, (c, w, h) => { c.fillStyle = '#6a5a54'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) { c.fillStyle = 'rgba(30,22,20,.45)'; c.fillRect(0, y + 18, w, 4); for (let x = ((y / 22) % 2) * 16; x < w; x += 32) { c.fillStyle = 'rgba(30,22,20,.35)'; c.fillRect(x, y, 3, 20); c.fillStyle = `rgba(255,255,255,${0.04 + ((x * 7 + y) % 5) * 0.015})`; c.fillRect(x + 3, y, 29, 18); } } });   // shingle rows (a flat slab read as a brown wall)
    sh.wrapS = sh.wrapT = THREE.RepeatWrapping; sh.repeat.set(0.35, 0.35); const r = mk(rg, new THREE.MeshStandardMaterial({ map: sh, roughness: 0.85 }), house, 0, H.h, H.z - 3); r.rotation.y = PI / 2; }
  mk(new THREE.BoxGeometry(H.x1 - H.x0 + 0.6, 0.14, 0.18), mat(0xf2f2f2, 0.5), house, 0, H.h - 0.05, H.z + 0.12);   // gutter
  mk(new THREE.CylinderGeometry(0.05, 0.05, H.h, 8), mat(0xf2f2f2, 0.5), house, H.x1 - 0.2, H.h / 2, H.z + 0.12);
  for (const x of [-4.6, -1.0, 2.6, 5.6]) windowMesh(house, 1.3, 1.2, x, 4.3, H.z + 0.02);
  windowMesh(house, 1.2, 1.1, 5.4, 1.65, H.z + 0.02);
  { const sd = new THREE.Group(); house.add(sd); sd.position.set(-2.2, 1.15, H.z + 0.03); mk(new THREE.BoxGeometry(2.6, 2.3, 0.08), mat(0xffffff, 0.5), sd); mk(new THREE.BoxGeometry(2.4, 2.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x9fc8e4, roughness: 0.08, metalness: 0.3, emissive: 0x1d3446, emissiveIntensity: 0.4 }), sd, 0, 0, 0.04); mk(new THREE.BoxGeometry(0.06, 2.1, 0.07), mat(0xffffff, 0.5), sd, 0, 0, 0.06); }
  const lamp = new THREE.Group(); house.add(lamp); lamp.position.set(0.0, 2.6, H.z + 0.06); mk(new THREE.BoxGeometry(0.16, 0.22, 0.1), mat(0x2b2b2b, 0.5), lamp, 0, 0, 0); mk(new THREE.BoxGeometry(0.12, 0.16, 0.08), new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd58a, emissiveIntensity: 0.5 }), lamp, 0, -0.02, 0.03);   // a wall lantern on its plate
  // patio deck + grill + table/umbrella
  const plank = tex(256, 64, (c, w, h) => { c.fillStyle = '#b07a4a'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { c.fillStyle = 'rgba(70,40,20,.35)'; c.fillRect(0, y + 14, w, 2); } });
  plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(3, 3);
  mk(new THREE.BoxGeometry(8, 0.24, 2.8), new THREE.MeshStandardMaterial({ map: plank, roughness: 0.8 }), g, -2.6, 0.12, H.z + 1.4);
  const grill = new THREE.Group(); g.add(grill); grill.position.set(-5.6, 0.24, H.z + 1.4);
  mk(new THREE.SphereGeometry(0.34, 18, 12, 0, PI * 2, PI / 2, PI / 2), mat(0x1e1e1e, 0.4), grill, 0, 0.82, 0); mk(new THREE.SphereGeometry(0.34, 18, 10, 0, PI * 2, 0, PI / 2), mat(0x1e1e1e, 0.4), grill, 0, 0.84, 0);
  for (let i = 0; i < 3; i++) { const l = mk(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), mat(0x333333, 0.5), grill, Math.cos(i * 2.1) * 0.22, 0.4, Math.sin(i * 2.1) * 0.22); l.rotation.set(Math.sin(i * 2.1) * 0.25, 0, -Math.cos(i * 2.1) * 0.25); }
  const tbl = new THREE.Group(); g.add(tbl); tbl.position.set(-1.6, 0.24, H.z + 1.5);
  mk(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 20), mat(0xffffff, 0.4), tbl, 0, 0.72, 0); mk(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), mat(0x666666, 0.4), tbl, 0, 0.36, 0);
  mk(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8), mat(0xeeeeee, 0.4), tbl, 0, 1.2, 0);
  const umbT = tex(256, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e8504a'; c.fillRect((i * w) / 8, 0, w / 8, h); } });
  mk(new THREE.ConeGeometry(1.25, 0.45, 8, 1, true), new THREE.MeshStandardMaterial({ map: umbT, roughness: 0.7, side: THREE.DoubleSide }), tbl, 0, 2.25, 0);
  // privacy fence along the sides; a garden rail behind the feeder (the birds' perch) + veggie beds behind it
  const fenceT = tex(128, 128, (c, w, h) => { c.fillStyle = '#c99d6a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(90,60,30,.4)'; c.fillRect(x + 14, 0, 2, h); } });
  fenceT.wrapS = THREE.RepeatWrapping;
  for (const x of [-11.5, 11.5]) { const t2 = fenceT.clone(); t2.needsUpdate = true; t2.wrapS = THREE.RepeatWrapping; t2.repeat.set(16 / 1.2, 1); const f = mk(new THREE.BoxGeometry(0.08, 1.9, 16), new THREE.MeshStandardMaterial({ map: t2, roughness: 0.9 }), g, x, 0.95, -2.5); f.material.map.repeat.set(16, 1); }
  for (const [x0, x1] of [[-11.5, H.x0], [H.x1, 11.5]]) { const f = mk(new THREE.BoxGeometry(x1 - x0, 1.9, 0.08), new THREE.MeshStandardMaterial({ map: fenceT, roughness: 0.9 }), g, (x0 + x1) / 2, 0.95, H.z - 0.6); }
  const F = D.fence, wood = mat(0xd9b48a, 0.8), woodD = mat(0xb08a60, 0.85);
  for (let x = F.x0; x <= F.x1 + 1e-6; x += (F.x1 - F.x0) / 4) mk(new THREE.BoxGeometry(0.1, F.top + 0.1, 0.1), woodD, g, x, (F.top + 0.1) / 2, F.z);
  const rail = mk(new THREE.BoxGeometry(F.x1 - F.x0 + 0.2, 0.08, 0.1), wood, g, (F.x0 + F.x1) / 2, F.top, F.z);
  mk(new THREE.BoxGeometry(F.x1 - F.x0 + 0.2, 0.07, 0.08), wood, g, (F.x0 + F.x1) / 2, F.top * 0.5, F.z);
  const leaf = [0x4f8a33, 0x5f9e3c, 0x6fb046], Rv = rng(12);
  for (let i = 0; i < 9; i++) { const x = F.x0 + 0.3 + i * 0.55; const p = mk(new THREE.IcosahedronGeometry(0.28 + Rv() * 0.12, 1), new THREE.MeshStandardMaterial({ color: leaf[i % 3], roughness: 0.9, flatShading: true }), g, x, 0.35 + Rv() * 0.15, F.z - 0.7); for (let k = 0; k < 3; k++) mk(new THREE.SphereGeometry(0.05, 8, 6), mat(0xe2392b, 0.5), g, x + (Rv() - 0.5) * 0.4, 0.3 + Rv() * 0.4, F.z - 0.45); }
  mk(new THREE.BoxGeometry(5.2, 0.2, 1.3), mat(0x6b4a2e, 1), g, (F.x0 + F.x1) / 2, 0.1, F.z - 0.7);
  // flower bed along the left fence + bushes; a gnome, a watering can, a lawn chair, a ball
  for (let i = 0; i < 14; i++) { const z = -9 + i * 0.9, x = -10.9; mk(new THREE.IcosahedronGeometry(0.42 + Rv() * 0.2, 1), new THREE.MeshStandardMaterial({ color: leaf[i % 3], roughness: 0.9, flatShading: true }), g, x, 0.35, z);
    for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.06, 8, 6), mat([0xff6fa8, 0xffd23f, 0xb36bff, 0xffffff][(i + k) % 4], 0.6), g, x + 0.3 + Rv() * 0.3, 0.55 + Rv() * 0.3, z + (Rv() - 0.5) * 0.6); }
  const gnome = new THREE.Group(); g.add(gnome); gnome.position.set(1.15, 0, 0.2); gnome.rotation.y = -0.4;
  mk(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 10), mat(0x3a6fd0, 0.6), gnome, 0, 0.11, 0); mk(new THREE.SphereGeometry(0.09, 12, 10), mat(0xf2c29a, 0.6), gnome, 0, 0.29, 0);
  mk(new THREE.ConeGeometry(0.1, 0.24, 12), mat(0xd9322b, 0.5), gnome, 0, 0.45, 0); mk(new THREE.ConeGeometry(0.08, 0.14, 10), mat(0xffffff, 0.8), gnome, 0, 0.21, 0.06).rotation.x = PI;
  const can = new THREE.Group(); g.add(can); can.position.set(-2.4, 0, 0.6); can.rotation.y = 0.6;
  mk(new THREE.CylinderGeometry(0.12, 0.14, 0.26, 14), mat(0x3aa66a, 0.4, { metalness: 0.3 }), can, 0, 0.13, 0); { const sp2 = mk(new THREE.CylinderGeometry(0.02, 0.03, 0.34, 8), mat(0x3aa66a, 0.4), can, 0.17, 0.2, 0); sp2.rotation.z = -1.0; }
  const chair = new THREE.Group(); g.add(chair); chair.position.set(3.4, 0, 0.9); chair.rotation.y = -0.5;
  const strap = tex(64, 64, (c, w, h) => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#2f9fd6' : '#ffffff'; c.fillRect(0, (i * h) / 4, w, h / 4); } });
  { const s = mk(new THREE.BoxGeometry(0.6, 0.04, 0.55), new THREE.MeshStandardMaterial({ map: strap, roughness: 0.7 }), chair, 0, 0.36, 0); const b = mk(new THREE.BoxGeometry(0.6, 0.65, 0.04), new THREE.MeshStandardMaterial({ map: strap, roughness: 0.7 }), chair, 0, 0.66, -0.3); b.rotation.x = -0.25;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 6), mat(0xcccccc, 0.3, { metalness: 0.6 }), chair, sx * 0.28, 0.18, sz * 0.25); }
  mk(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ map: tex(64, 32, (c, w, h) => { c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8504a'; c.fillRect(0, h * 0.4, w, h * 0.2); }), roughness: 0.5 }), g, 2.6, 0.13, 1.6);
  // birdbath (water fills its bowl: a flat disc at the rim level, inside the bowl)
  const bath = new THREE.Group(); g.add(bath); bath.position.set(-2.9, 0, -5.6);
  const stone = mat(0xc9c3b5, 0.85); mk(new THREE.CylinderGeometry(0.1, 0.16, 0.8, 12), stone, bath, 0, 0.4, 0);
  mk(new THREE.CylinderGeometry(0.42, 0.22, 0.14, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9c3b5, roughness: 0.85, side: THREE.DoubleSide }), bath, 0, 0.86, 0);
  mk(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24), stone, bath, 0, 0.8, 0);
  mk(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ color: 0x6fc0e8, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 }), bath, 0, 0.9, 0).rotation.x = -PI / 2;
  // hose reel by the house
  { const hr = new THREE.Group(); g.add(hr); hr.position.set(5.0, 0, H.z + 0.5); const t2 = mk(new THREE.TorusGeometry(0.28, 0.1, 10, 20), mat(0x2f9f4a, 0.6), hr, 0, 0.45, 0); t2.rotation.y = PI / 2; mk(new THREE.BoxGeometry(0.08, 0.5, 0.5), mat(0x555555, 0.5), hr, 0, 0.25, 0); }
  // the oak: trunk, crown, the long branch toward the feeder (the squirrel's runway)
  const oak = new THREE.Group(); g.add(oak); oak.position.set(D.tree[0], 0, D.tree[1]);
  const bark = mat(0x6e5236, 0.95);
  mk(new THREE.CylinderGeometry(0.26, 0.42, 4.2, 12), bark, oak, 0, 2.1, 0);
  const br = D.branch, bx = br[0] - D.tree[0], bz = br[2] - D.tree[1], b0 = new THREE.Vector3(0.1, 2.15, 0), b1 = new THREE.Vector3(bx, br[1] - 0.06, bz), bl = b0.distanceTo(b1);
  const branch = mk(new THREE.CylinderGeometry(0.06, 0.14, bl, 8), bark, oak, (b0.x + b1.x) / 2, (b0.y + b1.y) / 2, (b0.z + b1.z) / 2);
  branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b1.clone().sub(b0).normalize());
  const oakLeaf = [0x4a8a32, 0x5c9c3c, 0x3f7a2c, 0x6aab45], Ro = rng(4);
  for (let i = 0; i < 16; i++) { const b = mk(new THREE.IcosahedronGeometry(0.9 + Ro() * 0.6, 1), new THREE.MeshStandardMaterial({ color: oakLeaf[i % 4], roughness: 0.9, flatShading: true }), oak, (Ro() - 0.5) * 3.2 - 0.3, 4.4 + Ro() * 2.0, (Ro() - 0.5) * 2.6 - 0.4); b.scale.set(1, 0.8, 1); }
  for (let i = 0; i < 3; i++) mk(new THREE.IcosahedronGeometry(0.34, 1), new THREE.MeshStandardMaterial({ color: oakLeaf[i], roughness: 0.9, flatShading: true }), oak, bx * 0.45 + i * 0.3, br[1] + 0.6 + i * 0.12, bz * 0.5 - 0.35);   // leaves along the branch, clear of the tip (the squirrel sits there)
  // the feeder pole: a telescoping tube (setPole(h) = top plate height) + the baffle cone
  const pole = new THREE.Group(); g.add(pole); pole.position.set(D.pole[0], 0, D.pole[1]);
  const poleM = mat(0x2e5e3a, 0.45, { metalness: 0.4 });
  mk(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 12), poleM, pole, 0, 0.5, 0);
  const inner = mk(new THREE.CylinderGeometry(0.036, 0.036, 1.0, 12), poleM, pole, 0, 0.5, 0);
  const plate = mk(new THREE.BoxGeometry(0.2, 0.03, 0.2), poleM, pole, 0, 1.0, 0);
  const baffle = new THREE.Group(); pole.add(baffle); baffle.position.y = 0.78;   // on the base tube (the inner tube retracts below it)
  mk(new THREE.ConeGeometry(0.42, 0.42, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0x9fb3a8, roughness: 0.25, metalness: 0.75, side: THREE.DoubleSide }), baffle, 0, 0, 0);
  mk(new THREE.TorusGeometry(0.42, 0.015, 6, 28), mat(0x7f938a, 0.3, { metalness: 0.7 }), baffle, 0, -0.21, 0).rotation.x = PI / 2;
  baffle.visible = false;
  function setPole(h) { inner.scale.y = Math.max(0.01, h); inner.position.y = h / 2; plate.position.y = h; }
  setPole(1.0);
  // neighbours on the planet around the yard (3D near, painted further out)
  const R2 = rng(77), cols = ['#e8d8b0', '#d7e3c6', '#f2cfc0', '#cdd8ea', '#efe6c8', '#e2cfe8'];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * PI * 2 + R2() * 0.12, r = 30 + R2() * 26, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > D.yard.x0 - 4 && x < D.yard.x1 + 4 && z > D.yard.z0 - 4 && z < D.yard.z1 + 4) continue;
    const hs = makeHouse(g, { w: 7 + R2() * 3, d: 7 + R2() * 2, h: 4.4 + R2() * 1.6, color: cols[i % cols.length], roof: [0xb8553c, 0x6d5a52, 0x5a6f8a, 0x8a4a3a][i % 4], seed: i + 3 });
    hs.position.set(x, sphereY(x, z), z); hs.rotation.y = -a - PI / 2;   // front toward the yard
  }
  for (let i = 0; i < 40; i++) { const a = R2() * PI * 2, r = 22 + R2() * 44, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > D.yard.x0 - 2 && x < D.yard.x1 + 2 && z > D.yard.z0 - 2 && z < D.yard.z1 + 2) continue; const t3 = makeTree(i + 9, 1.4 + R2() * 0.9); t3.position.set(x, sphereY(x, z), z); g.add(t3); }
  for (const [x, z, s] of [[-9.5, -12, 1.8], [9.6, -12.5, 2.0], [-15, 4, 2.2], [15.5, 2, 2.0], [-15.5, -16, 2.3], [15, -18, 2.1]]) { const t3 = makeTree(Math.round(x * 7 + z), s); t3.position.set(x, 0, z); g.add(t3); }
  return { g, lawn, house, pole, baffle, setPole, plate, oak, branch, bath, gnome, chair, lamp, rail };
}

// ================================================================ THE STATION (cutaway modules)
/** A partial cylinder about the y axis (θ from +z toward +x), y in [y0, y1], with optional cells skipped (hole(θ, y) → true). */
function partialCyl(R, y0, y1, a0, a1, segA = 64, segY = 24, hole = null) {
  const pos = [], nor = [], uv = [], idx = [], NA = segA + 1, NY = segY + 1;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) {
    const th = a0 + ((a1 - a0) * i) / segA, y = y0 + ((y1 - y0) * j) / segY;
    pos.push(R * Math.sin(th), y, R * Math.cos(th)); nor.push(Math.sin(th), 0, Math.cos(th)); uv.push((i / segA) * (a1 - a0) * R / 2, (y - y0) / 2);
  }
  for (let j = 0; j < segY; j++) for (let i = 0; i < segA; i++) {
    const th = a0 + ((a1 - a0) * (i + 0.5)) / segA, y = y0 + ((y1 - y0) * (j + 0.5)) / segY;
    if (hole && hole(th, y)) continue;
    const a = j * NA + i, b = a + NA; idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
/** A disc segment (the part of a circle of radius R with z < zc) in the x-z plane at y = 0, minus a round hatch hole. */
function bulkheadGeo(R, zc, hole = 0.5) {
  const a = Math.acos(clamp(zc / R, -1, 1)), s = new THREE.Shape();
  for (let k = 0; k <= 48; k++) { const th = a + ((2 * PI - 2 * a) * k) / 48, x = R * Math.sin(th), z = R * Math.cos(th); k ? s.lineTo(x, z) : s.moveTo(x, z); }
  s.closePath();
  if (hole) { const h = new THREE.Path(); h.absarc(0, 0, hole, 0, PI * 2, true); s.holes.push(h); }
  const geo = new THREE.ShapeGeometry(s, 24); geo.rotateX(PI / 2); return geo;   // shape (x, z) → (x, 0, z), normal −y
}
function mliTex(seed = 1, base = '#efece2') {
  return tex(256, 256, (g, w, h) => { const R = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '160,150,130'},.18)`; g.fillRect(R() * w, R() * h, 20 + R() * 60, 20 + R() * 60); }
    g.strokeStyle = 'rgba(140,130,110,.45)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 32; x < w; x += 64) for (let y = 32; y < h; y += 64) { g.fillStyle = 'rgba(120,110,90,.5)'; g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); } }, true);
}
const PALS = {   // rack wall palettes: [base, 6 panel tints, cargo-bag colour]
  beige: ['#d9d6cc', ['#efece4', '#e6e2d6', '#f4f2ec', '#dcd8cc', '#e9e6dd', '#f0ede6'], '#3b6fb6'],
  green: ['#a9cfa4', ['#d6efcd', '#c7e5bd', '#e2f4dc', '#bcdcb2', '#d3ecc9', '#e6f6e0'], '#3f9f5a'],
  warm: ['#e0c08e', ['#f6e3c2', '#efd6aa', '#f9ebd2', '#e9cf9f', '#f3ddb6', '#fbefdb'], '#e0823a'],
  cool: ['#b9c6d6', ['#e1e8f2', '#d3dcea', '#edf1f8', '#c9d4e3', '#dbe3ef', '#f1f4f9'], '#4a6fb8'],
  tile: ['#bcdcea', ['#d9eef7', '#d9eef7', '#e4f3fa', '#d9eef7', '#e4f3fa', '#d9eef7'], '#7fb8d8'],
};
function rackTex(seed = 1, w = 512, h = 1024, pal = 'beige') {
  const [BASE, TINTS, BAG] = PALS[pal] || PALS.beige;
  if (pal === 'tile') return tex(w, h, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = TINTS[((x + y) / 64) % 3 | 0]; g.fillRect(x + 3, y + 3, 58, 58); } });
  return tex(w, h, (g) => {
    const R = rng(seed); g.fillStyle = BASE; g.fillRect(0, 0, w, h);
    const cols = 3, rows = 7, cw = w / cols, rh = h / rows;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = c * cw + 6, y = r * rh + 6, ww = cw - 12, hh = rh - 12; const kind = Math.floor(R() * 6);
      g.fillStyle = TINTS[kind]; g.fillRect(x, y, ww, hh);
      g.strokeStyle = 'rgba(90,90,90,.45)'; g.lineWidth = 3; g.strokeRect(x, y, ww, hh);
      if (kind === 0) { g.fillStyle = BAG; g.fillRect(x + 10, y + 10, ww - 20, hh - 20); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 14, y + 14, ww - 28, 8); }   // a cargo bag
      else if (kind === 1) { for (let k = 0; k < 6; k++) { g.fillStyle = ['#e8504a', '#4cc06a', '#ffd23f', '#3fa9ff'][k % 4]; g.beginPath(); g.arc(x + 16 + k * 22, y + hh - 18, 6, 0, 7); g.fill(); } g.fillStyle = '#2b2f36'; g.fillRect(x + 12, y + 12, ww - 24, hh * 0.45); }   // a panel with lights + a display
      else if (kind === 2) { g.fillStyle = '#c9c4b6'; for (let k = 0; k < 4; k++) g.fillRect(x + 8, y + 10 + k * (hh / 4), ww - 16, hh / 4 - 8); }   // drawers
      else if (kind === 3) { g.fillStyle = '#777'; g.fillRect(x + ww / 2 - 30, y + hh / 2 - 6, 60, 12); }   // a handle
      g.fillStyle = ['#ffd23f', '#ff8a3d', '#58b368', '#3fa9ff'][Math.floor(R() * 4)]; g.fillRect(x + ww - 34, y + 8, 26, 10);   // label
    }
    g.strokeStyle = 'rgba(40,40,40,.55)'; g.lineWidth = 7; for (let k = 0; k < 3; k++) { g.beginPath(); const x0 = R() * w; g.moveTo(x0, 0); g.bezierCurveTo(x0 + 80, h * 0.3, x0 - 80, h * 0.6, x0 + 30, h); g.stroke(); }   // cables
  });
}
function hatchRing(parent, r = 0.5, color = 0xb8bcc4) {
  const t = mk(new THREE.TorusGeometry(r, 0.06, 8, 32), mat(color, 0.35, { metalness: 0.6 }), parent); return t;
}
/** A hatch door (a round lid with a wheel) on a hinge group. open(θ) swings it. Local: lid in the x-z plane facing −y. */
function hatchDoor(parent, r = 0.48) {
  const hinge = new THREE.Group(); parent.add(hinge); hinge.position.x = -r;
  const lid = new THREE.Group(); hinge.add(lid); lid.position.x = r;
  const d = mk(new THREE.CylinderGeometry(r, r, 0.07, 28), mat(0xc8ccd2, 0.35, { metalness: 0.5 }), lid);
  const wheel = mk(new THREE.TorusGeometry(r * 0.45, 0.025, 6, 20), mat(0x3a3f48, 0.4, { metalness: 0.5 }), lid, 0, -0.06, 0); wheel.rotation.x = PI / 2;
  for (const a of [0, PI / 2]) { const sp = mk(new THREE.BoxGeometry(r * 0.9, 0.02, 0.03), mat(0x3a3f48, 0.4), lid, 0, -0.06, 0); sp.rotation.y = a; }
  return { hinge, lid, wheel, open: (k) => (hinge.rotation.z = -k * 1.9) };
}

function makeModule(parent, { len, label = '', seed = 1, sideHatch = false, color = '#efece2', pal = 'beige', light = 0xfff1dc }) {
  const g = new THREE.Group(); parent.add(g);
  const { Rm, zc, hw } = D, a = Math.acos(zc / Rm), xs = Math.sqrt(Rm * Rm - zc * zc);
  const hole = sideHatch ? (th, y) => Math.abs(th - PI / 2) < 0.32 && Math.abs(y - D.side.y) < D.side.h / 2 + 0.05 : null;
  const outM = new THREE.MeshStandardMaterial({ map: mliTex(seed, color), roughness: 0.8 }); outM.map.wrapS = outM.map.wrapT = THREE.RepeatWrapping;
  const hull = mk(partialCyl(Rm, -len, 0, a, 2 * PI - a, 72, 30, hole), outM, g); hull.castShadow = true;
  const inM = new THREE.MeshStandardMaterial({ color: 0x8a8e96, roughness: 0.9, side: THREE.BackSide });
  mk(partialCyl(Rm - 0.06, -len, 0, a, 2 * PI - a, 72, 30, hole), inM, g);
  // the rack box: back wall + side walls (the room we look into)
  const rt = rackTex(seed * 3 + 1, 512, 1024, pal); const rackM = new THREE.MeshStandardMaterial({ map: rt, roughness: 0.75 });
  mk(new THREE.PlaneGeometry(2 * hw, len), rackM, g, 0, -len / 2, -hw);
  const sideM = new THREE.MeshStandardMaterial({ map: rackTex(seed * 3 + 2, 512, 1024, pal), roughness: 0.75 });
  const walls = [];
  for (const s of [-1, 1]) {
    if (s > 0 && sideHatch) {   // the right wall has a hatch opening: build it from 3 pieces
      const yT = D.side.y + D.side.h / 2, yB = D.side.y - D.side.h / 2, zw = 2 * hw, zH = D.side.w;
      const top = mk(new THREE.PlaneGeometry(zw, -yT), sideM, g, s * hw, yT / 2, 0); top.rotation.y = -s * PI / 2;
      const bot = mk(new THREE.PlaneGeometry(zw, len + yB), sideM, g, s * hw, (yB - len) / 2, 0); bot.rotation.y = -s * PI / 2;
      const back = mk(new THREE.PlaneGeometry((zw - zH) / 2, D.side.h), sideM, g, s * hw, D.side.y, -(zw + zH) / 4); back.rotation.y = -s * PI / 2;
      const front = mk(new THREE.PlaneGeometry((zw - zH) / 2, D.side.h), sideM, g, s * hw, D.side.y, (zw + zH) / 4); front.rotation.y = -s * PI / 2;
      // the tunnel through the wall to the hull + a frame
      const tun = new THREE.MeshStandardMaterial({ color: 0xa9acb2, roughness: 0.6, side: THREE.DoubleSide });
      for (const [dy, dz, w2, h2, rx] of [[D.side.h / 2, 0, zH, xs - hw + 0.4, 1], [-D.side.h / 2, 0, zH, xs - hw + 0.4, 1], [0, zH / 2, xs - hw + 0.4, D.side.h, 0], [0, -zH / 2, xs - hw + 0.4, D.side.h, 0]]) {
        const p = mk(new THREE.PlaneGeometry(rx ? w2 : w2, rx ? h2 : h2), tun, g, hw + (Rm - hw) / 2, D.side.y + dy, dz);
        if (rx) { p.rotation.set(PI / 2, 0, PI / 2); } else { p.rotation.y = PI / 2; p.scale.set(1, 1, 1); }
      }
      const dh = new THREE.Group(); g.add(dh); dh.position.set(hw - 0.03, D.side.y, -D.side.w / 2);   // the hatch door, hinged at its back edge
      const dp = mk(new THREE.BoxGeometry(0.06, D.side.h - 0.04, D.side.w - 0.04), mat(0xc8ccd2, 0.35, { metalness: 0.5 }), dh, 0, 0, D.side.w / 2);
      const wh = mk(new THREE.TorusGeometry(0.2, 0.025, 6, 20), mat(0xd9322b, 0.4), dh, -0.05, 0, D.side.w / 2); wh.rotation.y = PI / 2;
      g.userData.sideDoor = { hinge: dh, wheel: wh, open: (k) => (dh.rotation.y = k * 1.5) };
      const fr = new THREE.Group(); g.add(fr); fr.position.set(hw + 0.01, D.side.y, 0);
      for (const [y, z, w2, h2] of [[D.side.h / 2 + 0.05, 0, 0.1, D.side.w + 0.2], [-D.side.h / 2 - 0.05, 0, 0.1, D.side.w + 0.2], [0, D.side.w / 2 + 0.05, D.side.h, 0.1], [0, -D.side.w / 2 - 0.05, D.side.h, 0.1]]) mk(new THREE.BoxGeometry(0.06, w2 === 0.1 ? 0.1 : w2, h2 === 0.1 ? 0.1 : h2), mat(0xf2c14e, 0.5), fr, 0, y, z);
      continue;
    }
    const w = mk(new THREE.PlaneGeometry(2 * hw, len), sideM, g, s * hw, -len / 2, 0); w.rotation.y = -s * PI / 2; walls.push(w);
  }
  // the section at the cut: hull thickness strips (left/right) + the bulkheads' edges, a pale "cut" material
  const cutM = new THREE.MeshStandardMaterial({ color: 0xb9bcc2, roughness: 0.7 });
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(xs - hw + 0.05, len, 0.04), cutM, g, s * (hw + xs) / 2, -len / 2, zc - 0.02);
  for (const y of [0, -len]) { mk(new THREE.BoxGeometry(2 * xs, 0.14, 0.05), cutM, g, 0, y, zc - 0.02); }
  // bulkheads with hatches (top + bottom); inner faces show; a ring collar outside
  const bulkM = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, roughness: 0.6, side: THREE.DoubleSide });
  const ends = {};
  for (const [k, y] of [['top', 0], ['bot', -len]]) {
    const b = mk(bulkheadGeo(Rm, zc, 0.52), bulkM, g, 0, y, 0);
    const ringG = new THREE.Group(); g.add(ringG); ringG.position.set(0, y, 0); const r = hatchRing(ringG, 0.52); r.rotation.x = PI / 2;
    const door = hatchDoor(ringG, 0.48); door.hinge.position.y = k === 'top' ? -0.05 : 0.05;
    const collar = mk(partialCyl(Rm + 0.05, y - 0.12, y + 0.12, a, 2 * PI - a, 64, 1), mat(0xb7bac0, 0.45, { metalness: 0.4 }), g);
    ends[k] = { b, ringG, door, collar };
  }
  // interior lights: an LED strip under the top + a point light
  const ledM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2dc, emissiveIntensity: 1.2 });
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.06, len * 0.8, 0.06), ledM, g, s * (hw - 0.05), -len / 2, -hw + 0.05);
  const pl = new THREE.PointLight(light, 6, 7, 1.6); pl.position.set(0, -0.75, 0.6); g.add(pl);
  // exterior bits: handrails, a name decal
  const rail = mat(0xf2c14e, 0.5);
  for (const th of [a + 0.25, 2 * PI - a - 0.25]) for (const y of [-len * 0.3, -len * 0.7]) { const h = mk(new THREE.BoxGeometry(0.05, 0.6, 0.05), rail, g, (Rm + 0.08) * Math.sin(th), y, (Rm + 0.08) * Math.cos(th)); }
  if (label) {
    const lt = tex(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.font = font(84); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#1b2a44'; c.strokeText(label, w / 2, h / 2 + 6); c.fillStyle = '#ffffff'; c.fillText(label, w / 2, h / 2 + 6); });
    const decal = mk(new THREE.PlaneGeometry(1.7, 0.42), new THREE.MeshStandardMaterial({ map: lt, transparent: true, roughness: 0.6 }), g, -(Rm + 0.01) * Math.sin(a + 0.5), -0.6, (Rm + 0.01) * Math.cos(a + 0.5));
    decal.rotation.y = -(a + 0.5); decal.castShadow = false;
  }
  function setPower(k) { pl.intensity = 6 * k; ledM.emissiveIntensity = 1.2 * k; }
  return { g, len, ends, light: pl, setPower, walls, rackM, hull, sideDoor: g.userData.sideDoor };
}

function makeTruss(parent) {
  const g = new THREE.Group(); parent.add(g); g.position.y = D.truss.y;
  const T = D.truss.half, m = mat(0xc7c9cc, 0.45, { metalness: 0.5 }), dk = mat(0x5a5e66, 0.5, { metalness: 0.4 });
  for (const [y, z] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]]) mk(new THREE.BoxGeometry(2 * T, 0.08, 0.08), m, g, 0, y, z);
  for (let x = -T; x <= T + 1e-6; x += 0.7) { for (const z of [0.35, -0.35]) { const d = mk(new THREE.BoxGeometry(0.05, 0.98, 0.05), dk, g, x + 0.35, 0, z); d.rotation.z = 0.79 * (Math.round(x / 0.7) % 2 ? 1 : -1); } mk(new THREE.BoxGeometry(0.06, 0.7, 0.06), m, g, x, 0, 0.35); mk(new THREE.BoxGeometry(0.06, 0.7, 0.06), m, g, x, 0, -0.35); }
  for (const x of [-1.05, 1.05]) mk(new THREE.BoxGeometry(0.16, D.truss.y - 0.1, 0.16), m, g, x, -(D.truss.y) / 2, -0.9);   // two posts down to M1's top, clear of the hatch
  // radiators (white) below the truss
  for (const s of [-1, 1]) { const r = mk(new THREE.BoxGeometry(3.2, 0.05, 1.4), mat(0xf6f6f2, 0.5), g, s * 3.0, -0.7, -0.6); r.rotation.x = 0.2; }
  // solar wings: n accordion panels per side; unfold(k) fans them out; tip(θ) = the last panel's extra swing (the swat)
  const panelT = tex(256, 512, (c, w, h) => { c.fillStyle = '#b07a22'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(60,35,8,.75)'; c.lineWidth = 3;
    for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(255,230,160,.28)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = '#e9e2cf'; c.lineWidth = 8; c.strokeRect(0, 0, w, h); });
  const pM = new THREE.MeshStandardMaterial({ map: panelT, roughness: 0.32, metalness: 0.55, side: THREE.DoubleSide, emissive: 0x2a1a05 });
  const wings = [-1, 1].map((s) => {
    const root = new THREE.Group(); g.add(root); root.position.x = s * (T + 0.2);
    mk(new THREE.BoxGeometry(0.5, 0.5, 0.5), dk, root, 0, 0, 0);
    const box = mk(new THREE.BoxGeometry(0.35, D.wing.h + 0.2, 0.3), mat(0x6b6e74, 0.5), root, s * 0.4, 0, 0);
    const panels = Array.from({ length: D.wing.n }, () => { const p = new THREE.Group(); root.add(p); mk(new THREE.BoxGeometry(D.wing.pw - 0.04, D.wing.h, 0.03), pM, p, 0, 0, 0); return p; });
    const mast = mk(new THREE.BoxGeometry(1, 0.08, 0.08), dk, root, 0, D.wing.h / 2 + 0.06, 0);
    return { root, panels, box, mast, s };
  });
  function unfold(k, tip = 0) {
    for (const w of wings) {
      const n = D.wing.n, pw = D.wing.pw, ext = 0.35 + (n * pw) * k;
      w.panels.forEach((p, i) => { const fold = (1 - k) * 1.35 * (i % 2 ? 1 : -1); p.position.set(w.s * (0.6 + (i + 0.5) * pw * k + 0.05 * i * (1 - k)), 0, 0.06 * (i % 2) * (1 - k)); p.rotation.set(0, fold, 0); p.visible = k > 0.002 || i === 0; p.scale.setScalar(1); });
      w.mast.scale.x = Math.max(0.01, ext); w.mast.position.x = w.s * (0.3 + ext / 2);
      if (w.s > 0 && tip) { const last = w.panels[n - 1]; last.rotation.y = tip; last.position.z += Math.sin(Math.abs(tip)) * pw * 0.5; }
    }
  }
  unfold(0);
  return { g, wings, unfold };
}

export async function buildStation(parent) {
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const g = new THREE.Group(); parent.add(g); g.position.set(D.st[0], D.st[1], 0);
  const SPEC = [{ label: 'GARY-1', sideHatch: true }, { label: 'LIFE', pal: 'green', light: 0xe6ffe0, color: '#e8efe2' }, { label: 'GALLEY', pal: 'warm', light: 0xffd9a0, color: '#f1e8d8' },
    { label: 'LAB', pal: 'cool', light: 0xe8f0ff, color: '#e6e8ec' }, { label: 'WC', pal: 'tile', light: 0xf2fbff, color: '#eef2f4' }];
  const mods = SPEC.map((o, i) => { const m = makeModule(g, { len: D.mlen[i], seed: i + 1, ...o }); m.g.position.y = D.mtop[i]; return m; });
  const [m1, m2, m3, m4, m5] = mods;
  // docking rings between the modules (short tunnels, cut)
  const ringM = new THREE.MeshStandardMaterial({ color: 0xc2c5ca, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide });
  const rings = mods.slice(0, -1).map((m, i) => { const r = new THREE.Group(); g.add(r); r.position.y = D.mtop[i] - D.mlen[i]; mk(partialCyl(0.75, -D.gap, 0, 0.0001, 2 * PI - 0.0001, 40, 1), ringM, r); return r; });
  const ring = rings[0];
  // M2 LIFE SUPPORT: a lettuce garden under a pink grow light (back wall, lower), two fans (right wall)
  { const G = new THREE.Group(); m2.g.add(G); G.position.set(-0.4, -2.75, -D.hw + 0.2);
    mk(new THREE.BoxGeometry(1.3, 0.22, 0.32), mat(0xf4f4f0, 0.5), G, 0, 0, 0);
    const lettuce = [0x6fc04a, 0x58a83c, 0x86d05a];
    for (let k = 0; k < 5; k++) for (let j = 0; j < 4; j++) { const b = mk(new THREE.SphereGeometry(0.075, 10, 8), mat(lettuce[(k + j) % 3], 0.8), G, -0.5 + k * 0.25 + (j % 2) * 0.05, 0.16 + j * 0.035, -0.04 + (j % 2) * 0.06); b.scale.set(1, 0.7, 1); }
    const growM = new THREE.MeshStandardMaterial({ color: 0xff7ad8, emissive: 0xff4fc8, emissiveIntensity: 1.4 }); mk(new THREE.BoxGeometry(1.3, 0.05, 0.12), growM, G, 0, 0.62, 0.05);
    const glow = new THREE.PointLight(0xff6ad0, 1.6, 2.2, 1.6); glow.position.set(0, 0.45, 0.25); G.add(glow);
    const sp = m2.setPower; m2.setPower = (k) => { sp(k); growM.emissiveIntensity = 1.4 * k; glow.intensity = 1.6 * k; };   // the grow light dies with the power too
    for (const y of [-1.3, -2.3]) { const f = new THREE.Group(); m2.g.add(f); f.position.set(D.hw - 0.06, y, -0.35); f.rotation.y = -PI / 2; mk(new THREE.TorusGeometry(0.26, 0.03, 8, 24), mat(0x3a3f48, 0.4), f); const bl = new THREE.Group(); f.add(bl); for (let k = 0; k < 4; k++) { const b = mk(new THREE.BoxGeometry(0.44, 0.08, 0.01), mat(0x8a9099, 0.4), bl); b.rotation.z = (k * PI) / 4; } f.userData.blades = bl; m2.g.userData.fans = (m2.g.userData.fans || []).concat(f); } }
  // M3 GALLEY: a food warmer, pouches on velcro, a mug on a strap
  { const G = new THREE.Group(); m3.g.add(G); G.position.set(-0.5, -1.2, -D.hw + 0.16);
    mk(new THREE.BoxGeometry(0.7, 0.4, 0.3), mat(0xb8bcc4, 0.35, { metalness: 0.5 }), G); mk(new THREE.BoxGeometry(0.5, 0.22, 0.02), new THREE.MeshStandardMaterial({ color: 0x2b2f36, emissive: 0xff8a3d, emissiveIntensity: 0.25 }), G, 0, 0, 0.16);
    for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.12, 0.16, 0.03), mat([0xe8504a, 0xffd23f, 0x58b368, 0x3fa9ff, 0xff8a3d, 0xb36bff][k], 0.5), G, -0.3 + (k % 3) * 0.3 + 0.6, 0.45 + Math.floor(k / 3) * 0.22, 0.02); }
  // M4 LAB: a red alarm beacon (setAlarm), M5 WC: a sign + a floating toilet roll
  const alarmM = new THREE.MeshStandardMaterial({ color: 0x8a1a14, emissive: 0xff2a1a, emissiveIntensity: 0 });
  mk(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 18), mat(0x8e939b, 0.5, { metalness: 0.4 }), m4.g, -D.hw + 0.3, -0.04, -D.hw + 0.3);
  mk(new THREE.SphereGeometry(0.13, 16, 10, 0, PI * 2, 0, PI / 2), alarmM, m4.g, -D.hw + 0.3, -0.065, -D.hw + 0.3).rotation.x = PI;   // hangs from the ceiling corner
  const alarmGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,90,60,1)'); g.addColorStop(1, 'rgba(255,30,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  alarmGlow.position.set(-D.hw + 0.3, -0.16, -D.hw + 0.3); alarmGlow.scale.setScalar(0.7); m4.g.add(alarmGlow);
  const alarm = new THREE.PointLight(0xff3020, 0, 6, 1.4); alarm.position.set(-0.6, -1.2, 0.6); m4.g.add(alarm);
  { const wcT = tex(256, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2f6fd6'; c.lineWidth = 10; c.strokeRect(6, 6, w - 12, h - 12); c.font = font(70); c.fillStyle = '#2f6fd6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('W.C.', w / 2, h / 2 + 6); });
    mk(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshStandardMaterial({ map: wcT, roughness: 0.6 }), m5.g, -0.35, -0.55, -D.hw + 0.02);
    const tp = new THREE.Group(); m5.g.add(tp); tp.position.set(-0.6, -1.5, 0.2); tp.rotation.set(0.5, 0.3, 0.8); mk(new THREE.CylinderGeometry(0.07, 0.07, 0.11, 16), mat(0xffffff, 0.8), tp); m5.g.userData.tp = tp; }
  // the side airlock (axis x), cut at z = airlock.zc; a mudroom inside
  const A = D.airlock, al = new THREE.Group(); g.add(al); al.position.set(0, D.side.y, 0);
  const alHull = new THREE.Group(); al.add(alHull); alHull.rotation.z = -PI / 2;   // local y → world +x
  { const a = Math.acos(clamp(A.zc / A.r, -1, 1)), outM = new THREE.MeshStandardMaterial({ map: mliTex(7, '#f2efe6'), roughness: 0.8 });
    mk(partialCyl(A.r, A.x0, A.x1, a, 2 * PI - a, 48, 8), outM, alHull);
    mk(partialCyl(A.r - 0.05, A.x0, A.x1, a, 2 * PI - a, 48, 8), new THREE.MeshStandardMaterial({ color: 0xd4d0c6, roughness: 0.8, side: THREE.BackSide }), alHull);
    const cap = mk(bulkheadGeo(A.r, A.zc, 0.45), new THREE.MeshStandardMaterial({ color: 0xcfd2d6, roughness: 0.6, side: THREE.DoubleSide }), alHull, 0, A.x1, 0);
    const xs = Math.sqrt(A.r * A.r - A.zc * A.zc); for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.05, A.x1 - A.x0, 0.04), new THREE.MeshStandardMaterial({ color: 0xb9bcc2 }), alHull, s * xs, (A.x0 + A.x1) / 2, A.zc - 0.02); }
  const outer = new THREE.Group(); al.add(outer); outer.position.x = A.x1; const oRing = hatchRing(outer, 0.45); oRing.rotation.y = PI / 2;
  const outerDoor = hatchDoor(outer, 0.43); outerDoor.hinge.rotation.order = 'ZYX'; outer.rotation.z = PI / 2;   // the lid lies in the y-z plane
  // mudroom dressing: a doormat on the floor, coat hooks with a spare suit, boots, a sign
  const mud = new THREE.Group(); al.add(mud);
  const matT = tex(256, 128, (c, w, h) => { c.fillStyle = '#7a5a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5a3f26'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.font = font(30); c.fillStyle = '#f2d9a8'; c.textAlign = 'center'; c.fillText('WIPE YOUR', w / 2, h * 0.44); c.fillText('FEET', w / 2, h * 0.78); });
  const doormat = mk(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshStandardMaterial({ map: matT, roughness: 0.95 }), mud, (A.x0 + A.x1) / 2 + 0.2, -A.r * 0.78, -0.15); doormat.rotation.x = -PI / 2;
  for (const dx of [0.5, 0.9]) { const hk = mk(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), mat(0x8a5a2a, 0.5), mud, A.x0 + dx + 0.6, 0.45, -0.9); hk.rotation.x = PI / 2; }
  const suit = new THREE.Group(); mud.add(suit); suit.position.set(A.x0 + 1.15, 0.05, -0.75);
  mk(new THREE.CapsuleGeometry(0.2, 0.45, 6, 12), mat(0xf4f4f0, 0.8), suit, 0, 0, 0); for (const s of [-1, 1]) { const arm = mk(new THREE.CapsuleGeometry(0.07, 0.35, 4, 8), mat(0xf4f4f0, 0.8), suit, s * 0.26, -0.05, 0); arm.rotation.z = s * 0.25; }
  mk(new THREE.BoxGeometry(0.12, 0.08, 0.08), mat(0xe8504a, 0.5), suit, -0.08, 0.15, 0.18);
  mk(new THREE.SphereGeometry(0.17, 18, 14), mat(0xf4f4f0, 0.35), suit, 0, 0.5, 0); const visor = mk(new THREE.SphereGeometry(0.15, 18, 12, -0.9, 1.8, 0.75, 1.0), new THREE.MeshStandardMaterial({ color: 0x1c2638, roughness: 0.08, metalness: 0.6, emissive: 0x3a5a8a, emissiveIntensity: 0.25 }), suit, 0, 0.5, 0.03); visor.scale.setScalar(1.06);
  mk(new RoundedBoxGeometry(0.34, 0.42, 0.14, 2, 0.04), mat(0xd9dbe0, 0.6), suit, 0, 0.05, -0.17); for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.11, 0.12, 0.17, 2, 0.03), mat(0x3a3f48, 0.6), suit, s * 0.09, -0.48, 0.02);
  for (const dx of [0, 0.22]) mk(new THREE.BoxGeometry(0.16, 0.14, 0.3), mat(0x3a3f48, 0.6), mud, A.x0 + 0.5 + dx, -A.r * 0.7, -0.6);
  const signT = tex(256, 96, (c, w, h) => { c.fillStyle = '#2f6fd6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10); c.font = font(52); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MUDROOM', w / 2, h / 2 + 4); });
  mk(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.6 }), mud, A.x0 + 1.6, 0.55, -0.98);
  const alLight = new THREE.PointLight(0xfff1dc, 3, 4, 1.6); alLight.position.set((A.x0 + A.x1) / 2, 0.2, 0.3); al.add(alLight);
  // the truss + solar wings on top
  const truss = makeTruss(g);
  // Whipple shield around M2: crinkled foil sheets standing off the hull (cut like the module)
  const foilT = tex(256, 256, (c, w, h) => { const R = rng(3); c.fillStyle = '#eef1f6'; c.fillRect(0, 0, w, h); for (let i = 0; i < 420; i++) { const x = R() * w, y = R() * h; c.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '70,78,92'},${0.25 + R() * 0.35})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 40); c.lineTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 40); c.fill(); } }); foilT.wrapS = foilT.wrapT = THREE.RepeatWrapping; foilT.repeat.set(7, 2.5);
  const shield = new THREE.Group(); m4.g.add(shield);
  { const Rs = D.Rm + 0.38, a = Math.acos(clamp(D.zc / Rs, -1, 1)), N = 8, Rf = rng(17);
    const foilM = new THREE.MeshStandardMaterial({ map: foilT, color: 0xf2f4f8, roughness: 0.22, metalness: 0.85, side: THREE.DoubleSide, emissive: 0x6a7080, emissiveIntensity: 0.35, envMapIntensity: 2.6, flatShading: true });
    shield.userData.strips = [];
    for (let k = 0; k < N; k++) {   // 8 crinkled strips (they unroll one by one); radial jitter + flat shading = foil facets
      const geo = partialCyl(Rs, -D.mlen[3] + 0.15, -0.15, a + (k * (2 * PI - 2 * a)) / N, a + ((k + 1) * (2 * PI - 2 * a)) / N, 10, 18), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), d = (Rf() - 0.5) * 0.06; p.setXYZ(i, x * (r + d) / r, p.getY(i) + (Rf() - 0.5) * 0.02, z * (r + d) / r); }
      geo.computeVertexNormals(); const strip = mk(geo, foilM, shield); shield.userData.strips.push(strip); }
    shield.userData.mat = foilM;
    const xs = Math.sqrt(Rs * Rs - D.zc * D.zc); for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.03, D.mlen[3] - 0.3, 0.04), mat(0x9ea2a8, 0.4, { metalness: 0.6 }), shield, s * xs, -D.mlen[3] / 2, D.zc - 0.02);
    for (let k = 0; k < 6; k++) { const th = a + 0.2 + k * ((2 * PI - 2 * a - 0.4) / 5); for (const y of [-0.8, -4.0]) { const s2 = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 6), mat(0x9ea2a8, 0.4), shield, (D.Rm + 0.19) * Math.sin(th), y, (D.Rm + 0.19) * Math.cos(th)); s2.rotation.set(PI / 2 * Math.cos(th) * 0, 0, 0); s2.lookAt(0, y, 0); s2.rotateX(PI / 2); } } }
  shield.visible = false;
  // the hole in M2's back wall (a decal: jagged rim, stars + Earth glow through it)
  const holeT = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.beginPath(); const R = rng(8); for (let k = 0; k <= 22; k++) { const a = (k / 22) * PI * 2, r = 70 + (k % 2 ? 26 : 0) * R(); c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.closePath(); c.fillStyle = '#5a5e66'; c.fill();
    c.beginPath(); for (let k = 0; k <= 18; k++) { const a = (k / 18) * PI * 2, r = 52 + (k % 2 ? 12 : 0); c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.closePath(); c.fillStyle = '#05070f'; c.fill(); c.save(); c.clip(); for (let i = 0; i < 30; i++) { c.fillStyle = '#fff'; c.fillRect(w / 2 - 50 + R() * 100, h / 2 - 50 + R() * 100, 2, 2); } const gr = c.createRadialGradient(w / 2, h, 0, w / 2, h, 90); gr.addColorStop(0, 'rgba(90,170,255,.7)'); gr.addColorStop(1, 'rgba(90,170,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.restore(); });
  const hole = mk(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: holeT, transparent: true, toneMapped: true }), m4.g, D.hole[0], D.hole[1] - D.mtop[3], -D.hw + 0.012); hole.castShadow = false; hole.visible = false;
  const crackT = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const R = rng(21); c.strokeStyle = 'rgba(40,40,48,.85)'; c.lineCap = 'round'; for (let k = 0; k < 11; k++) { let a = (k / 11) * PI * 2 + R() * 0.3, r = 36, x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 4; j++) { a += (R() - 0.5) * 0.7; r += 14 + R() * 16; x = w / 2 + Math.cos(a) * r; y = h / 2 + Math.sin(a) * r; c.lineTo(x, y); c.lineWidth = Math.max(1.5, 5 - j); } c.stroke(); } c.fillStyle = 'rgba(60,62,70,.55)'; c.beginPath(); c.arc(w / 2, h / 2, 46, 0, PI * 2); c.fill(); });
  const cracks = mk(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: crackT, transparent: true, depthWrite: false }), hole, 0, 0, -0.004); cracks.renderOrder = -1;   // a dented, cracked rim round the plug
  // the cupola under M5 (a window over the backyard): a glass hex dome with struts; a lens inside it looks down through the struts
  const cup = new THREE.Group(); g.add(cup); cup.position.y = D.bottom;
  { const frame = mat(0xd9dbe0, 0.4, { metalness: 0.4 }), strutM = mat(0x8e939b, 0.45, { metalness: 0.5 });
    const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8fb, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
    mk(new THREE.CylinderGeometry(1.25, 1.35, 0.35, 6), frame, cup, 0, -0.18, 0);
    const dome = new THREE.Group(); cup.add(dome); dome.position.y = -0.36;
    const H = D.cupH, r0 = 1.2, r1 = 0.5;
    mk(new THREE.CylinderGeometry(r0, r1, H, 6, 1, true), glass, dome, 0, -H / 2, 0);
    const bot = mk(new THREE.CircleGeometry(r1, 6), glass, dome, 0, -H, 0); bot.rotation.set(PI / 2, 0, PI / 6);
    const corner = (r, y, k) => new THREE.Vector3(r * Math.sin(k * PI / 3), y, r * Math.cos(k * PI / 3)), up = new THREE.Vector3(0, 1, 0);
    const strut = (a, b, rr) => { const d = b.clone().sub(a), m = mk(new THREE.CylinderGeometry(rr, rr, d.length(), 6), strutM, dome); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); };
    for (let k = 0; k < 6; k++) { strut(corner(r0, 0, k), corner(r1, -H, k), 0.03); strut(corner(r0, 0, k), corner(r0, 0, k + 1), 0.04); strut(corner(r1, -H, k), corner(r1, -H, k + 1), 0.045); } }
  cup.visible = false;
  return { g, mods, m1, m2, m3, m4, m5, ring, rings, al, setAlarm: (k) => { alarmM.emissiveIntensity = 2.2 * k; alarm.intensity = 5 * k; alarmGlow.material.opacity = 0.85 * k; }, alHull, outerDoor, mud, alLight, truss, shield, hole, cup, setPower: (k) => { mods.forEach((m) => m.setPower(k)); } };   // the airlock keeps its own light (it docks lit)
}

// ================================================================ PROPS + CAST
/** Hopper bird feeder (~0.4 m): tray + clear hopper with seed + a red roof. Origin = bottom centre. setFill(0..1), setRoof(lift). */
export function makeFeeder() {
  const g = new THREE.Group(), wood = mat(0xd9a45a, 0.7), red = mat(0xc8382e, 0.55);
  mk(new THREE.BoxGeometry(0.42, 0.04, 0.34), wood, g, 0, 0.02, 0);
  for (const [x, z, w, d] of [[0, 0.16, 0.42, 0.03], [0, -0.16, 0.42, 0.03], [0.2, 0, 0.03, 0.34], [-0.2, 0, 0.03, 0.34]]) mk(new THREE.BoxGeometry(w, 0.06, d), wood, g, x, 0.06, z);
  const glass = new THREE.MeshStandardMaterial({ color: 0xdff0ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 });
  const seedM = new THREE.MeshStandardMaterial({ map: tex(64, 64, (c, w, h) => { c.fillStyle = '#5a4a38'; c.fillRect(0, 0, w, h); const R = rng(2); for (let i = 0; i < 140; i++) { c.fillStyle = ['#2e2b28', '#e2dccb', '#7a6a50', '#3b3631'][i % 4]; c.beginPath(); c.ellipse(R() * w, R() * h, 3, 1.6, R() * 3, 0, 7); c.fill(); } }), roughness: 0.9 });
  const fill = mk(new THREE.BoxGeometry(0.26, 0.24, 0.2), seedM, g, 0, 0.17, 0);
  mk(new THREE.BoxGeometry(0.3, 0.3, 0.24), glass, g, 0, 0.2, 0).castShadow = false;
  for (const x of [-0.15, 0.15]) mk(new THREE.BoxGeometry(0.03, 0.3, 0.26), wood, g, x, 0.2, 0);
  const roof = new THREE.Group(); g.add(roof); roof.position.y = 0.35;
  for (const s of [-1, 1]) { const r = mk(new THREE.BoxGeometry(0.27, 0.025, 0.4), red, roof, s * 0.11, 0.06, 0); r.rotation.z = -s * 0.55; }
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), wood, g, 0, 0.06, 0.2).rotation.z = PI / 2;   // perch
  const seedPile = []; for (let i = 0; i < 14; i++) { const s2 = mk(new THREE.SphereGeometry(0.018, 6, 4), mat([0x2e2b28, 0xe2dccb][i % 2], 0.6), g, -0.17 + (i % 7) * 0.055, 0.055, i < 7 ? 0.12 : -0.12); s2.scale.set(1, 0.6, 1.6); seedPile.push(s2); }
  return { g, roof, fill, setFill: (k) => { fill.scale.y = Math.max(0.01, k); fill.position.y = 0.05 + 0.12 * k; fill.visible = k > 0.01; }, setRoof: (lift, tilt = 0) => { roof.position.y = 0.35 + lift; roof.rotation.z = tilt; } };
}

/** Cartoon rocket ~3.4 m: white body, red nose + fins, a porthole, GARY-1. Origin = the base (nozzle exit). setFlame(k, t). */
export async function makeRocket() {
  await document.fonts.load('400 120px "Luckiest Guy"').catch(() => {});
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const white = mat(0xf4f2ec, 0.45), red = mat(0xd9322b, 0.45), dark = mat(0x3a3f48, 0.5, { metalness: 0.5 });
  const lbl = tex(512, 256, (c, w, h) => { c.fillStyle = '#f4f2ec'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9322b'; c.fillRect(0, h * 0.08, w, h * 0.1); c.fillRect(0, h * 0.82, w, h * 0.1); c.font = font(70); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1b2a44'; c.save(); c.translate(w * 0.25, h / 2); c.rotate(-PI / 2); c.fillText('GARY-1', 0, 6); c.restore(); });
  mk(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 28), new THREE.MeshStandardMaterial({ map: lbl, roughness: 0.45 }), body, 0, 1.45, 0).rotation.y = PI;
  mk(new THREE.ConeGeometry(0.42, 0.95, 28), red, body, 0, 3.02, 0);
  mk(new THREE.CylinderGeometry(0.3, 0.38, 0.3, 20), dark, body, 0, 0.2, 0);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * PI * 2 + PI / 6, f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(0.55, -0.3); f.lineTo(0.55, -0.1); f.lineTo(0, 0.8); f.closePath(); const fg = new THREE.ExtrudeGeometry(f, { depth: 0.05, bevelEnabled: false }); fg.translate(0, 0, -0.025); const fm = mk(fg, red, body, Math.sin(a) * 0.4, 0.55, Math.cos(a) * 0.4); fm.rotation.y = a - PI / 2; }
  const port = mk(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x7fc3ef, roughness: 0.05, metalness: 0.4, emissive: 0x1d4466, emissiveIntensity: 0.4 }), body, 0, 2.25, 0.41); port.rotation.x = PI / 2;
  mk(new THREE.TorusGeometry(0.15, 0.03, 8, 20), dark, body, 0, 2.25, 0.42);
  // flame: nested additive cones
  const flame = new THREE.Group(); g.add(flame);
  const fl = [[0.3, 1.4, 0xffb347, 0.85], [0.2, 1.0, 0xfff1a8, 0.95]].map(([r, h, c, o]) => { const m = mk(new THREE.ConeGeometry(r, h, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), flame, 0, -h / 2, 0); m.rotation.x = PI; m.castShadow = false; m.userData.h = h; return m; });
  const glow = new THREE.PointLight(0xffa040, 0, 9, 1.5); glow.position.y = -0.6; g.add(glow);
  function setFlame(k, t = 0) { flame.visible = k > 0.01; const f = 1 + 0.12 * Math.sin(t * 47) + 0.08 * Math.sin(t * 83); flame.scale.set(k * (0.9 + 0.1 * Math.sin(t * 61)), k * f, k * (0.9 + 0.1 * Math.sin(t * 61))); glow.intensity = 8 * k; }
  setFlame(0);
  return { g, body, setFlame, tape: [] };
}

/** Glass bubble helmet (parent it to a head). */
export function makeHelmet(r = 0.46, collar = 0xf4f4f0) {
  const g = new THREE.Group();
  const glass = mk(new THREE.SphereGeometry(r, 32, 24), new THREE.MeshStandardMaterial({ color: 0xe6f4ff, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }), g); glass.castShadow = false; glass.renderOrder = 6;
  const hl = mk(new THREE.SphereGeometry(r * 1.002, 24, 12, 0.3, 0.9, 0.35, 0.5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, depthWrite: false }), g); hl.castShadow = false; hl.renderOrder = 7;
  const ring = mk(new THREE.TorusGeometry(r * 0.62, r * 0.12, 10, 28), mat(collar, 0.5), g, 0, -r * 0.8, 0); ring.rotation.x = PI / 2;
  return g;
}
export function makeBackpack() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.4, 0.46, 0.2, 3, 0.05), mat(0xf4f4f0, 0.7), g, 0, 0, 0);
  mk(new THREE.BoxGeometry(0.14, 0.06, 0.04), mat(0xe8504a, 0.5), g, -0.08, 0.12, 0.11); mk(new THREE.BoxGeometry(0.06, 0.06, 0.04), mat(0x58b368, 0.5), g, 0.1, 0.12, 0.11);
  return g;
}

/** Toon gray squirrel (~0.42 m sitting). set({x,y,z,rotY,rx,rz, pose 'sit'|'run'|'jog'|'leap'|'float'|'cling', ph (gait phase), eyes 'open'|'half'|'wide'|'closed',
 *  look [dx,dy], cheeks 0..1, chew 0..1, t, scale, helmet, hat, armsUp 0..1, hold (bool: a seed in its paws), tail 0..1 (curl), squash}) */
export function makeSquirrel() {
  const fur = mat(0x7a6656, 0.9), furD = mat(0x5e4c3f, 0.9), belly = mat(0xf0e2cc, 0.9), pink = mat(0xe8a0a0, 0.7), dark = mat(0x231c18, 0.4), white = mat(0xffffff, 0.25), tooth = mat(0xfffbe8, 0.4);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const torso = mk(new THREE.SphereGeometry(0.13, 20, 16), fur, body, 0, 0, 0); torso.scale.set(0.9, 1.15, 0.85);
  mk(new THREE.SphereGeometry(0.105, 16, 12), belly, body, 0, -0.01, 0.045).scale.set(0.8, 1.05, 0.7);
  const head = new THREE.Group(); body.add(head); head.position.set(0, 0.2, 0.02);
  mk(new THREE.SphereGeometry(0.11, 20, 16), fur, head).scale.set(1.0, 0.95, 0.95);
  const muzzle = mk(new THREE.SphereGeometry(0.06, 14, 10), belly, head, 0, -0.035, 0.075); muzzle.scale.set(1.1, 0.8, 0.9);
  mk(new THREE.SphereGeometry(0.018, 8, 6), dark, head, 0, -0.012, 0.13);
  const teeth = mk(new THREE.BoxGeometry(0.03, 0.028, 0.01), tooth, head, 0, -0.07, 0.112);
  const cheeks = [-1, 1].map((s) => { const c = mk(new THREE.SphereGeometry(0.05, 12, 10), fur, head, s * 0.07, -0.04, 0.05); return c; });
  const eyes = [-1, 1].map((s) => {
    const eg = new THREE.Group(); head.add(eg); eg.position.set(s * 0.048, 0.025, 0.088); eg.rotation.set(-0.1, s * 0.35, 0);
    const w = mk(new THREE.SphereGeometry(0.038, 16, 12), white, eg); w.scale.set(0.95, 1.15, 0.6); w.castShadow = false;
    const p = mk(new THREE.SphereGeometry(0.022, 12, 10), dark, eg, 0, 0, 0.016); p.scale.set(1, 1.1, 0.6);
    mk(new THREE.SphereGeometry(0.006, 6, 4), white, eg, 0.007, 0.01, 0.028);
    const lid = mk(new THREE.SphereGeometry(0.04, 16, 8, 0, PI * 2, 0, PI / 2), fur, eg); lid.scale.set(0.97, 1.18, 0.66); lid.castShadow = false;
    return { eg, p, lid };
  });
  for (const s of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.04, 10, 8), fur, head, s * 0.07, 0.1, -0.01); e.scale.set(0.6, 1.2, 0.4); e.rotation.z = -s * 0.3; const ei = mk(new THREE.SphereGeometry(0.025, 8, 6), pink, head, s * 0.07, 0.1, 0.005); ei.scale.set(0.5, 1, 0.3); ei.rotation.z = -s * 0.3; }
  const arms = [-1, 1].map((s) => { const a = new THREE.Group(); body.add(a); a.position.set(s * 0.075, 0.06, 0.06); mk(new THREE.CapsuleGeometry(0.022, 0.07, 4, 8), furD, a, 0, -0.045, 0); mk(new THREE.SphereGeometry(0.024, 8, 6), furD, a, 0, -0.095, 0.01); return a; });
  const legs = [-1, 1].map((s) => { const l = new THREE.Group(); body.add(l); l.position.set(s * 0.07, -0.09, 0.0); const th = mk(new THREE.SphereGeometry(0.06, 12, 10), fur, l, 0, 0, 0); th.scale.set(0.8, 1, 1.1); const ft = mk(new THREE.CapsuleGeometry(0.024, 0.07, 4, 8), furD, l, 0, -0.06, 0.04); ft.rotation.x = PI / 2; return l; });
  // the tail: a chain of fluffy spheres (a big S curve up the back); curl 0..1 folds it over
  const tail = new THREE.Group(); body.add(tail); tail.position.set(0, -0.1, -0.1);
  const tsegs = []; let parentT = tail;
  const tailM = mat(0x8a7462, 1.0); for (let i = 0; i < 8; i++) { const sg = new THREE.Group(); parentT.add(sg); sg.position.y = i ? 0.075 : 0; const r = 0.075 + Math.sin((i / 7) * PI) * 0.06; const b = mk(new THREE.SphereGeometry(r, 14, 10), tailM, sg, 0, 0.035, 0); b.scale.set(1.15, 1.25, 0.95); tsegs.push(sg); parentT = sg; }   // one fur colour, fat (a banded tail read as a caterpillar)
  const seed = mk(new THREE.SphereGeometry(0.02, 8, 6), mat(0x2e2b28, 0.6), body, 0, -0.03, 0.12); seed.scale.set(0.7, 0.45, 1.5);
  const helmet = makeHelmet(0.17, 0xeeeeea); head.add(helmet); helmet.position.set(0, 0.0, 0.01); helmet.visible = false;
  const hat = new THREE.Group(); head.add(hat); hat.position.set(0, 0.115, -0.01); hat.rotation.x = -0.15;
  mk(new THREE.CylinderGeometry(0.11, 0.12, 0.08, 20), mat(0xffffff, 0.5), hat, 0, 0.045, 0); mk(new THREE.CylinderGeometry(0.13, 0.13, 0.016, 20), mat(0x1b2a44, 0.5), hat, 0, 0.006, 0.03).scale.set(1, 1, 1.25); mk(new THREE.BoxGeometry(0.08, 0.03, 0.012), mat(0xf2c14e, 0.4), hat, 0, 0.05, 0.118);   // the captain's hat (bigger: it is the last gag)
  hat.visible = false;
  function set(p = {}) {
    const t = p.t ?? 0, pose = p.pose ?? 'sit', ph = p.ph ?? t * 12;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(p.rx ?? 0, p.rotY ?? 0, p.rz ?? 0, 'YXZ'); root.scale.setScalar(p.scale ?? 1);
    const [sx, sy] = p.squash || [1, 1]; body.scale.set(sx, sy, sx);
    let bodyX = 0, by = 0.19, hx = 0, armX = -0.6, armZ = 0.15, legX = 0, tailX = 0.12, tailBend = -0.4;   // the tail curls up behind the head (it shows from the front)
    if (pose === 'sit') { bodyX = -0.05; by = 0.2; legX = -1.3; armX = -0.9 - (p.chew ?? 0) * 0.25 * Math.max(0, Math.sin(t * 22)); }
    if (pose === 'run') { const s = Math.sin(ph); bodyX = 1.25 + 0.12 * s; by = 0.14 + 0.05 * Math.abs(s); hx = -1.0; armX = -1.0 + 0.9 * s; legX = 0.6 - 0.9 * s; tailX = 0.6 + 0.2 * s; tailBend = -0.15; }
    if (pose === 'jog') { const s = Math.sin(ph); bodyX = 0.12; by = 0.2 + 0.025 * Math.abs(s); hx = -0.1; armX = -0.9; armZ = 0.25; legX = -0.35; tailX = 0.25 + 0.1 * s; tailBend = -0.32; }
    if (pose === 'leap') { bodyX = 1.35; by = 0.14; hx = -1.1; armX = -2.4; armZ = 0.4; legX = 1.4; tailX = 1.1; tailBend = 0.05; }
    if (pose === 'float') { bodyX = 0.15 + 0.08 * Math.sin(t * 2); by = 0.15; armX = -1.6 + 0.5 * Math.sin(t * 7); armZ = 0.9; legX = -0.6 + 0.5 * Math.sin(t * 7 + 1); tailX = 0.4; tailBend = -0.38 + 0.08 * Math.sin(t * 3); }
    if (pose === 'cling') { bodyX = 0; by = 0.16; armX = -2.6; armZ = 0.35; legX = -0.2; tailX = 0.9; tailBend = 0.1 * Math.sin(t * 9); }
    if (p.armsUp) { armX = lerp(armX, -2.8, p.armsUp); armZ = lerp(armZ, 0.5, p.armsUp); }
    body.rotation.x = bodyX; body.position.y = by; head.rotation.set(hx + (p.nod ?? 0), p.headY ?? 0, p.headZ ?? 0);
    arms.forEach((a, i) => { a.rotation.set(armX, 0, (i ? -1 : 1) * armZ); });
    legs.forEach((l, i) => { l.rotation.set(legX + (pose === 'run' ? (i ? 0.25 : -0.25) : 0) + (pose === 'jog' ? (i ? 0.75 : -0.75) * Math.sin(ph) : 0), 0, 0); });
    if (pose === 'jog') arms.forEach((a, i) => { a.rotation.x = armX + (i ? -0.8 : 0.8) * Math.sin(ph); });
    tail.rotation.set(tailX + (p.tailWag ?? 0) * Math.sin(t * 9) * 0.3, Math.sin(t * 2.1) * 0.15, (p.tailWag ?? 0) * Math.sin(t * 7) * 0.2);
    const curl = p.tail ?? 0; tsegs.forEach((s, i) => { s.rotation.x = i ? tailBend * (1 + curl * 1.6) + 0.05 * Math.sin(t * 3 + i * 0.7) : 0; });
    const ck = 1 + (p.cheeks ?? 0) * 0.7; cheeks.forEach((c) => c.scale.set(ck, ck, ck));
    const ek = p.eyes ?? 'open', [lx, ly] = p.look || [0, 0];
    eyes.forEach((e) => { e.p.position.set(clamp(lx, -1, 1) * 0.012, clamp(ly, -1, 1) * 0.014, 0.016); const wide = ek === 'wide' ? 1.25 : 1; e.eg.scale.setScalar(wide);
      e.lid.rotation.x = ek === 'half' ? -0.55 : ek === 'closed' ? 0 : -1.5; e.lid.visible = ek === 'half' || ek === 'closed'; });
    teeth.visible = (p.cheeks ?? 0) < 0.5;
    seed.visible = !!p.hold; helmet.visible = !!p.helmet; hat.visible = !!p.hat;
  }
  set({});
  return { root, set, head, body, tail };
}

/** Round songbird (~0.22 m): set({x,y,z,rotY,t, peck, flap, hop, soot, look}) */
export function makeSongbird({ body = 0xd9322b, belly = null, wing = null, beak = 0xf2a03a, crest = false, mask = false, cap = null } = {}) {
  const bm = mat(body, 0.7), wm = mat(wing ?? new THREE.Color(body).multiplyScalar(0.75).getHex(), 0.75), dark = mat(0x1a1a1a, 0.4), white = mat(0xffffff, 0.25), bk = mat(beak, 0.5);
  const root = new THREE.Group(), b = new THREE.Group(); root.add(b);
  const torso = mk(new THREE.SphereGeometry(0.1, 18, 14), bm, b, 0, 0.12, 0); torso.scale.set(0.95, 0.95, 1.15);
  if (belly) mk(new THREE.SphereGeometry(0.085, 14, 10), mat(belly, 0.75), b, 0, 0.1, 0.04).scale.set(0.85, 0.9, 0.9);
  const head = new THREE.Group(); b.add(head); head.position.set(0, 0.22, 0.04);
  mk(new THREE.SphereGeometry(0.07, 16, 12), bm, head);
  if (cap) mk(new THREE.SphereGeometry(0.072, 16, 8, 0, PI * 2, 0, PI / 2.3), mat(cap, 0.7), head, 0, 0.005, -0.004);
  if (crest) { const c = mk(new THREE.ConeGeometry(0.035, 0.09, 8), bm, head, 0, 0.08, -0.03); c.rotation.x = -0.5; }
  if (mask) mk(new THREE.SphereGeometry(0.072, 14, 8, -0.8, 1.6, 1.15, 0.6), dark, head, 0, 0, 0);
  const beakM = mk(new THREE.ConeGeometry(0.022, 0.06, 8), bk, head, 0, -0.01, 0.085); beakM.rotation.x = PI / 2;
  const eyes = [-1, 1].map((s) => { const e = mk(new THREE.SphereGeometry(0.022, 10, 8), white, head, s * 0.04, 0.02, 0.05); e.scale.z = 0.6; return mk(new THREE.SphereGeometry(0.012, 8, 6), dark, head, s * 0.042, 0.02, 0.064); });
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); b.add(w); w.position.set(s * 0.085, 0.14, 0); const f = mk(new THREE.SphereGeometry(0.075, 12, 8), wm, w, s * 0.03, 0, -0.02); f.scale.set(0.35, 0.8, 1.2); return w; });
  const tail = mk(new THREE.BoxGeometry(0.07, 0.015, 0.12), wm, b, 0, 0.1, -0.13); tail.rotation.x = -0.4;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 5), mat(0xc78a4a, 0.5), b, s * 0.03, 0.02, 0.01);
  const soot = mk(new THREE.SphereGeometry(0.073, 14, 10, -1.2, 2.4, 0.6, 1.4), new THREE.MeshStandardMaterial({ color: 0x1e1a18, roughness: 1, transparent: true, opacity: 0 }), head); soot.castShadow = false;
  function set(p = {}) {
    const t = p.t ?? 0;
    root.position.set(p.x ?? 0, (p.y ?? 0) + (p.hop ?? 0) * 0.08 * Math.abs(Math.sin(t * 11)), p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(p.scale ?? 1);
    const fl = p.flap ?? 0; wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * fl * (0.4 + 1.2 * Math.abs(Math.sin(t * 28)))));
    head.rotation.x = (p.peck ?? 0) * 0.9 * Math.max(0, Math.sin(t * 10)) + Math.sin(t * 3.3 + (p.ph ?? 0)) * 0.08;
    head.rotation.y = (p.look ?? 0) + Math.sin(t * 1.7 + (p.ph ?? 0)) * 0.25 * (1 - (p.peck ?? 0));
    b.rotation.x = (p.peck ?? 0) * 0.3; soot.material.opacity = 0.9 * (p.soot ?? 0); soot.visible = (p.soot ?? 0) > 0.01;
    eyes.forEach((e) => e.scale.setScalar(p.wide ? 1.4 : 1));
  }
  set({});
  return { root, set, head };
}

/** A wobbling liquid blob (zero-g water/coffee). set(pos, r, t, wob). */
export function makeBlob(color = 0x3a1f0e, opacity = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.1, transparent: opacity < 1, opacity }));
  m.castShadow = false;
  return { m, set(pos, r, t, wob = 1) { m.visible = r > 0.004; m.position.set(...pos); const a = 0.14 * wob * Math.sin(t * 9), b = 0.1 * wob * Math.sin(t * 7 + 1); m.scale.set(r * (1 + a), r * (1 - a + b), r * (1 - b)); m.rotation.set(t * 0.7, t * 0.4, 0); } };
}
/** Space treadmill (belt + rails), origin = the deck centre, belt along x. update(t, speed) scrolls the belt stripes. */
export function makeTreadmill() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(1.0, 0.12, 0.5, 2, 0.04), mat(0x3a3f48, 0.5), g, 0, 0.06, 0);
  const beltT = tex(256, 32, (c, w, h) => { c.fillStyle = '#222'; c.fillRect(0, 0, w, h); c.fillStyle = '#444'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 12, h); }, true); beltT.wrapS = THREE.RepeatWrapping; beltT.repeat.set(3, 1);
  mk(new THREE.BoxGeometry(0.9, 0.02, 0.44), new THREE.MeshStandardMaterial({ map: beltT, roughness: 0.8 }), g, 0, 0.13, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.04, 0.5, 0.04), mat(0xc7c9cc, 0.4, { metalness: 0.5 }), g, 0.45, 0.35, s * 0.24);
  mk(new THREE.BoxGeometry(0.14, 0.12, 0.5), mat(0x2b2f36, 0.5), g, 0.47, 0.62, 0);
  return { g, update: (t, sp = 1) => { beltT.offset.x = -t * sp * 1.6; } };
}
/** The $23M space toilet: a seat with thigh bars, a funnel hose, a fan housing. Origin = the base centre (mount it on a wall). */
export function makeToilet() {
  const g = new THREE.Group(), w = new THREE.MeshStandardMaterial({ color: 0xffc93c, metalness: 0.7, roughness: 0.28, emissive: 0x6a4500, emissiveIntensity: 0.6, envMapIntensity: 2 }), m = w, y = mat(0xf2c14e, 0.5);   // $23M = solid gold
  const bowl = mk(new THREE.LatheGeometry([[0.0, 0.0], [0.15, 0.0], [0.17, 0.04], [0.2, 0.2], [0.23, 0.34], [0.2, 0.38], [0.15, 0.37]].map(([x, yy]) => new THREE.Vector2(x, yy)), 28), w, g, 0, 0, 0); bowl.material.side = THREE.DoubleSide;
  const seat = mk(new THREE.TorusGeometry(0.19, 0.04, 10, 28), w, g, 0, 0.39, 0); seat.rotation.x = PI / 2;
  const lid = mk(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 28), w, g, 0, 0.6, -0.22); lid.rotation.x = -1.35;
  for (const s of [-1, 1]) { const b = mk(new THREE.CapsuleGeometry(0.025, 0.36, 4, 8), y, g, s * 0.24, 0.58, 0.05); b.rotation.x = PI / 2; mk(new THREE.BoxGeometry(0.03, 0.22, 0.03), m, g, s * 0.24, 0.47, -0.12); }
  const hose = mk(new THREE.TorusGeometry(0.22, 0.035, 8, 20, PI * 1.2), mat(0x58b368, 0.5), g, 0.25, 0.3, 0.05); hose.rotation.set(0, PI / 2, 0.4);
  mk(new THREE.ConeGeometry(0.07, 0.14, 14, 1, true), mat(0xffd23f, 0.5), g, 0.36, 0.55, 0.12).rotation.z = -0.6;
  mk(new THREE.BoxGeometry(0.34, 0.5, 0.22), m, g, -0.36, 0.3, -0.04);
  return { g };
}
