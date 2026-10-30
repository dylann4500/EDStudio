// RING KIT (043, "What if Earth had rings like Saturn?"): Saturn's main rings scaled to Earth's radius, drawn honestly from
// ANY place on the ground (a sky shader that ray-casts the ring plane per pixel) and from space (a lit ring + its shadow on Earth).
//
// MODEL: radii in Earth radii (R = 6,371 km), Saturn's ring edges ÷ Saturn's radius (60,268 km):
//   C ring 1.239–1.527 (τ ≈ 0.1) · B ring 1.527–1.951 (τ 1.2–2.8, the bright one) · Cassini Division 1.951–2.027 (τ ≈ 0.1)
//   · A ring 2.027–2.269 (τ ≈ 0.5, Encke Gap at 2.214). = 7,894 → 14,456 km from Earth's centre (1,520 → 8,085 km up).
//   Optical depths are round values from Cassini/Voyager profiles (Cuzzi et al. 2009, "Ring particle composition and size").
//   The rings lie in the EQUATORIAL plane, so the sky geometry depends only on latitude; the Sun's height above the ring plane
//   (= its declination) sets how brightly the rings are lit (≈ dark at the equinoxes, like Saturn's) and where their shadow falls.
//
//   ringProfile(rho)                       → { tau, albedo, col:[r,g,b] } at rho (Earth radii); tau 0 outside the rings
//   sunECEF(decDeg, hour)                  → THREE.Vector3 (Earth frame: z = north pole, observer's meridian = +x, east = +y)
//   enu(v, lat)                            → { e, n, u } local east/north/up of an ECEF direction at latitude lat (radians)
//   ringTransmit(lat, sun)                 → fraction of direct sunlight that gets through the rings at that latitude (1 = no shadow)
//   archStats(lat)                         → { top, low, inner, outer } elevations (deg) on the meridian looking toward the equator
//   makeRingSky({ seg })                   → { mesh, set({ lat, sun, E, U, gain, haze, opacity }), follow(camera, r) }
//        a camera-centred sphere (radius r per shot: keep it INSIDE the set's sky dome and the far plane) whose shader draws the
//        rings for an observer at latitude `lat`; E/U = the set's local east/up in world space. Fog off, not tone mapped.
//   makeSpaceRings(R)                      → { ring, shell, setSun(dirWorld), setCenter(v) } for a planet of radius R at the origin
//        (equatorial plane = y 0; the shell darkens Earth where the rings shade it).
import * as THREE from 'three';

const PI = Math.PI;
export const R_KM = 6371, RIN = 1.239, ROUT = 2.269;
export const EDGES = { C: [1.239, 1.527], B: [1.527, 1.951], CD: [1.951, 2.027], A: [2.027, 2.269], encke: 2.214 };
const fr = (x) => x - Math.floor(x);
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ripple = (rho, k) => 0.5 * Math.sin(rho * 410 + k) + 0.3 * Math.sin(rho * 1130 + 2 * k) + 0.2 * Math.sin(rho * 2750 + 3 * k);

export function ringProfile(rho) {
  const E = EDGES;
  if (rho < E.C[0] || rho > E.A[1]) return { tau: 0, albedo: 0, col: [0, 0, 0] };
  if (rho < E.C[1]) { const k = (rho - E.C[0]) / (E.C[1] - E.C[0]); return { tau: 0.06 + 0.06 * k + 0.035 * ripple(rho, 1), albedo: 0.3, col: [0.74, 0.71, 0.66] }; }
  if (rho < E.B[1]) { const k = sm(E.B[0], E.B[0] + 0.16, rho); return { tau: 1.0 + 1.6 * k + 0.45 * ripple(rho, 2) - 0.6 * sm(E.B[1] - 0.03, E.B[1], rho), albedo: 0.62, col: [1.0, 0.955, 0.87] }; }
  if (rho < E.CD[1]) return { tau: 0.07 + 0.03 * ripple(rho, 3), albedo: 0.3, col: [0.7, 0.68, 0.64] };
  const gap = Math.abs(rho - E.encke) < 0.004;
  return { tau: gap ? 0.02 : 0.5 + 0.12 * ripple(rho, 4) - 0.2 * sm(E.A[1] - 0.025, E.A[1], rho), albedo: 0.55, col: [0.97, 0.93, 0.86] };
}

let _prof = null;
/** 2048×1 RGBA texture over [RIN, ROUT]: rgb = colour × albedo-ish brightness, a = tau / 5 */
export function profileTexture() {
  if (_prof) return _prof;
  const N = 2048, d = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const rho = RIN + (ROUT - RIN) * (i + 0.5) / N, p = ringProfile(rho), b = 0.45 + 0.75 * p.albedo;
    d[i * 4] = Math.min(255, p.col[0] * b * 255); d[i * 4 + 1] = Math.min(255, p.col[1] * b * 255); d[i * 4 + 2] = Math.min(255, p.col[2] * b * 255);
    d[i * 4 + 3] = Math.min(255, Math.max(0, p.tau / 5 * 255));
  }
  _prof = new THREE.DataTexture(d, N, 1, THREE.RGBAFormat);
  _prof.magFilter = THREE.LinearFilter; _prof.minFilter = THREE.LinearMipmapLinearFilter; _prof.generateMipmaps = true;
  _prof.wrapS = _prof.wrapT = THREE.ClampToEdgeWrapping; _prof.needsUpdate = true;
  return _prof;
}

export function sunECEF(decDeg, hour) {
  const d = decDeg * PI / 180, H = (hour - 12) * PI / 12;
  return new THREE.Vector3(Math.cos(d) * Math.cos(H), -Math.cos(d) * Math.sin(H), Math.sin(d));
}
export function enu(v, lat) {
  const s = Math.sin(lat), c = Math.cos(lat);
  return { e: v.y, n: -s * v.x + c * v.z, u: c * v.x + s * v.z };
}
/** ECEF direction of a local (e, n, u) direction at latitude lat */
export function fromENU(e, n, u, lat) {
  const s = Math.sin(lat), c = Math.cos(lat);
  return new THREE.Vector3(u * c - n * s, e, u * s + n * c);
}
/** where a ray from the ground at latitude lat along ECEF direction D crosses the ring plane: rho (Earth radii) or -1 */
export function hitRho(lat, D) {
  const O = new THREE.Vector3(Math.cos(lat), 0, Math.sin(lat));
  if (Math.abs(D.z) < 1e-9) return -1;
  const t = -O.z / D.z; if (t <= 0) return -1;
  return Math.hypot(O.x + t * D.x, O.y + t * D.y);
}
export function ringTransmit(lat, sun) {
  const rho = hitRho(lat, sun); if (rho < 0) return 1;
  const p = ringProfile(rho); return Math.exp(-p.tau / Math.max(1e-3, Math.abs(sun.z)));
}
/** elevations (deg) of the inner + outer ring edges on the meridian toward the equator, and the band's top/low */
export function archStats(lat) {
  const s = Math.sign(lat) || 1, out = { top: -90, low: 90 };
  for (let el = 0; el <= 90; el += 0.02) {
    const r = el * PI / 180, D = fromENU(0, -s * Math.cos(r), Math.sin(r), lat), rho = hitRho(lat, D);
    if (rho >= RIN && rho <= ROUT) { out.top = Math.max(out.top, el); out.low = Math.min(out.low, el); }
  }
  return out;
}

const SKY_VS = 'varying vec3 vDir; void main(){ vDir = (modelMatrix * vec4(position, 0.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const SKY_FS = `
uniform sampler2D uProf; uniform float uRin, uRout, uLat, uGain, uOpac; uniform vec3 uSun, uE, uN, uU, uHaze;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  float e = dot(d, uE), n = dot(d, uN), u = dot(d, uU);
  if (u < -0.03) discard;
  float sl = sin(uLat), cl = cos(uLat);
  vec3 D = vec3(u * cl - n * sl, e, u * sl + n * cl), O = vec3(cl, 0.0, sl);
  if (abs(D.z) < 1e-6) discard;
  float t = -O.z / D.z; if (t <= 0.0) discard;
  vec3 P = O + t * D; float rho = length(P.xy);
  if (rho < uRin || rho > uRout) discard;
  vec4 pr = texture2D(uProf, vec2((rho - uRin) / (uRout - uRin), 0.5));
  float tau = pr.a * 5.0, mu = max(abs(D.z), 1e-3), mu0 = max(abs(uSun.z), 1e-3);
  float op = 1.0 - exp(-tau / mu);
  float litFace = 1.0 - exp(-tau / mu0);
  float lit = (O.z * uSun.z > 0.0) ? litFace : 0.75 * litFace * exp(-0.9 * tau) + 0.04;
  float ps = dot(P, uSun); float sh = ps < 0.0 ? smoothstep(0.985, 1.035, length(P - ps * uSun)) : 1.0;
  vec3 col = pr.rgb * uGain * lit * sh;
  col = mix(col, vec3(0.9, 0.42, 0.3) * col, (1.0 - sh) * sh * 3.0);   // a red-orange rim where the shadow edge passes (sunset light)
  float hz = smoothstep(-0.01, 0.2, u);
  col = mix(uHaze, col, mix(0.3, 1.0, hz));
  float a = op * uOpac * smoothstep(-0.02, 0.06, u);
  gl_FragColor = vec4(col, a);
}`;

export function makeRingSky(o = {}) {
  const U = {
    uProf: { value: profileTexture() }, uRin: { value: RIN }, uRout: { value: ROUT }, uLat: { value: 0.7 }, uGain: { value: 1 },
    uOpac: { value: 1 }, uSun: { value: new THREE.Vector3(1, 0, 0.3).normalize() }, uE: { value: new THREE.Vector3(1, 0, 0) },
    uN: { value: new THREE.Vector3(0, 0, -1) }, uU: { value: new THREE.Vector3(0, 1, 0) }, uHaze: { value: new THREE.Color(0xdfe8f0) },
  };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, o.seg ?? 96, Math.round((o.seg ?? 96) / 2)), new THREE.ShaderMaterial({
    uniforms: U, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false, toneMapped: false,
  }));
  mesh.frustumCulled = false; mesh.renderOrder = -1;
  /** lat (rad), sun (ECEF Vector3), E/U local east + up in WORLD space */
  function set(p) {
    if (p.lat !== undefined) U.uLat.value = p.lat;
    if (p.sun) U.uSun.value.copy(p.sun).normalize();
    if (p.E) U.uE.value.copy(p.E).normalize();
    if (p.U) U.uU.value.copy(p.U).normalize();
    U.uN.value.copy(U.uU.value).cross(U.uE.value).normalize();
    if (p.gain !== undefined) U.uGain.value = p.gain;
    if (p.opacity !== undefined) U.uOpac.value = p.opacity;
    if (p.haze !== undefined) U.uHaze.value.set(p.haze);
  }
  function follow(camera, r) { mesh.position.copy(camera.position); mesh.scale.setScalar(r); mesh.updateMatrixWorld(true); }
  return { mesh, U, set, follow };
}

const RING_VS = 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const RING_FS = `
uniform sampler2D uProf; uniform float uRin, uRout, uR, uGain; uniform vec3 uSun, uC;
varying vec3 vW;
void main(){
  vec3 p = (vW - uC) / uR; float rho = length(p.xz);
  if (rho < uRin || rho > uRout) discard;
  vec4 pr = texture2D(uProf, vec2((rho - uRin) / (uRout - uRin), 0.5));
  vec3 V = normalize(vW - cameraPosition);
  float tau = pr.a * 5.0, mu = max(abs(V.y), 1e-3), mu0 = max(abs(uSun.y), 1e-3);
  float op = 1.0 - exp(-tau / mu), litFace = 1.0 - exp(-tau / mu0);
  float side = (cameraPosition.y - uC.y) * uSun.y;
  float lit = side > 0.0 ? litFace : 0.75 * litFace * exp(-0.9 * tau) + 0.03;
  float ps = dot(p, uSun); float sh = ps < 0.0 ? smoothstep(0.985, 1.03, length(p - ps * uSun)) : 1.0;
  gl_FragColor = vec4(pr.rgb * uGain * lit * sh, op);
}`;
const SHELL_VS = 'varying vec3 vN; void main(){ vN = normalize((modelMatrix * vec4(position, 0.0)).xyz); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const SHELL_FS = `
uniform sampler2D uProf; uniform float uRin, uRout, uK; uniform vec3 uSun;
varying vec3 vN;
void main(){
  vec3 q = normalize(vN); float a = 0.0;
  if (abs(uSun.y) > 1e-4) {
    float t = -q.y / uSun.y;
    if (t > 0.0) { vec3 P = q + t * uSun; float rho = length(P.xz);
      if (rho > uRin && rho < uRout) { float tau = texture2D(uProf, vec2((rho - uRin) / (uRout - uRin), 0.5)).a * 5.0; a = 1.0 - exp(-tau / abs(uSun.y)); } }
  }
  a *= smoothstep(-0.12, 0.12, dot(q, uSun)) * uK;
  gl_FragColor = vec4(0.0, 0.01, 0.03, a);
}`;

export function makeSpaceRings(R, o = {}) {
  const U = { uProf: { value: profileTexture() }, uRin: { value: RIN }, uRout: { value: ROUT }, uR: { value: R }, uGain: { value: o.gain ?? 1.15 },
    uSun: { value: new THREE.Vector3(1, 0.25, 0.3).normalize() }, uC: { value: new THREE.Vector3() } };
  const geo = new THREE.RingGeometry(R * RIN, R * ROUT, 720, 6); geo.rotateX(-PI / 2);
  const ring = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: RING_VS, fragmentShader: RING_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false, toneMapped: false }));
  ring.renderOrder = 3;
  const SU = { uProf: U.uProf, uRin: U.uRin, uRout: U.uRout, uSun: U.uSun, uK: { value: 0.92 } };
  const shell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.011, 160, 96), new THREE.ShaderMaterial({ uniforms: SU, vertexShader: SHELL_VS, fragmentShader: SHELL_FS, transparent: true, depthWrite: false }));
  shell.renderOrder = 2;
  const setSun = (d) => U.uSun.value.copy(d).normalize();
  const setCenter = (v) => { U.uC.value.copy(v); shell.position.copy(v); ring.position.copy(v); };
  return { ring, shell, U, setSun, setCenter };
}
