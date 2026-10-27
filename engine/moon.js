// MOON KIT (029, "What if the Moon were twice as close?"): a procedural near-side Moon map (maria at their real selenographic
// positions, bright ray craters Tycho / Copernicus / Kepler, a few thousand small craters), a lit Moon body for space shots,
// a SKY MOON that sits at a true angular size in any set's sky, and a total-eclipse kit (Sun disc + corona + black Moon).
//
//   moonTexture()                      → CanvasTexture, equirectangular; u = 0.5 is the sub-Earth point (lon 0, lat 0)
//   makeMoonBody({ r })                → Mesh (MeshStandardMaterial); +z faces lon 0 once you call faceToward(earthPos)
//   makeSkyMoon({ seg })               → { g, setSky(camera, dir, angDeg, dist), setPhase(sunDirWorld|null), setTint(color), setGlow(k) }
//        angDeg = full angular diameter in degrees (today 0.518°, at half the distance 1.036°). The disc is a sphere placed at
//        `dist` (keep it inside the set's sky dome and the camera's far plane) and scaled to dist·tan(ang/2): true size for ANY lens.
//        setPhase(null) = full (flat-lit, the real full Moon barely limb-darkens); a world-space Sun direction draws a terminator.
//        It is drawn with fog off and a soft additive halo (setGlow) so bloom picks it up.
//   makeEclipse()                      → { g, setSky(camera, dir, angSun, angMoon, dist, cover 0..1, t) }  totality = cover 1
//   ANG0, ANG1                          the two angular diameters (degrees), MOON_KM0 / MOON_KM1 distances
import * as THREE from 'three';
import { rng, canvasTex } from '@engine/core.js';

export const MOON_KM0 = 384400, MOON_KM1 = 192200, MOON_R_KM = 1737.4;
export const ANG0 = 2 * Math.atan(MOON_R_KM / MOON_KM0) * 180 / Math.PI;   // 0.518°
export const ANG1 = 2 * Math.atan(MOON_R_KM / MOON_KM1) * 180 / Math.PI;   // 1.036°
const PI = Math.PI;

// near-side maria: [lon°, lat°, radius°, stretchX, darkness]
const MARIA = [
  [-16, 33, 17, 1.15, 1.0], [-57, 18, 22, 0.7, 0.85], [-48, 5, 16, 0.8, 0.8], [-60, 32, 12, 0.8, 0.7],      // Imbrium, Procellarum ×3
  [17, 28, 10, 1.0, 1.0], [31, 8, 12, 1.1, 0.95], [59, 17, 7.5, 1.25, 1.0], [51, -8, 9, 0.8, 0.85],         // Serenitatis, Tranquillitatis, Crisium, Fecunditatis
  [35, -15, 5.5, 1.0, 0.85], [-17, -21, 10, 1.1, 0.8], [-39, -24, 6, 1.0, 0.9], [4, 13, 5, 1.2, 0.75],      // Nectaris, Nubium, Humorum, Vaporum
  [0, 56, 7, 4.5, 0.65], [-28, -2, 9, 1.4, 0.7], [27, 47, 5, 1.0, 0.7], [-80, 10, 9, 0.6, 0.6],              // Frigoris, Insularum, Lacus Somniorum, Grimaldi-ish
];
// bright young craters with ray systems: [lon, lat, r°, rays]
const RAYS = [[-11, -43, 2.3, 26], [-20, 10, 2.6, 18], [-38, 8, 1.5, 12], [-47, 24, 1.3, 9], [48, -2, 1.0, 8]];

let _tex = null;
export function moonTexture() {
  if (_tex) return _tex;
  const W = 2048, H = 1024, R = rng(1969);
  _tex = canvasTex(W, H, (g) => {
    const px = (lon) => ((lon / 360 + 0.5) % 1 + 1) % 1 * W, py = (lat) => (0.5 - lat / 180) * H;
    g.fillStyle = '#bdb8b0'; g.fillRect(0, 0, W, H);
    // highland mottling
    for (let i = 0; i < 2600; i++) { const x = R() * W, y = R() * H, r = 6 + R() * 40; g.fillStyle = `rgba(${R() < 0.5 ? '255,250,240' : '90,86,80'},${0.03 + R() * 0.05})`; g.beginPath(); g.ellipse(x, y, r, r * (0.6 + R() * 0.6), R() * 3, 0, 7); g.fill(); }
    // maria: soft-edged dark basalt, built from many overlapping blobs
    for (const [lon, lat, r, sx, d] of MARIA) {
      const cx = px(lon), cy = py(lat), rr = r / 360 * W;
      for (let k = 0; k < 70; k++) {
        const a = R() * PI * 2, q = Math.sqrt(R()) * 0.75, bx = cx + Math.cos(a) * q * rr * sx, by = cy + Math.sin(a) * q * rr, br = rr * (0.35 + R() * 0.45);
        const gr = g.createRadialGradient(bx, by, 0, bx, by, br);
        gr.addColorStop(0, `rgba(78,76,74,${0.32 * d})`); gr.addColorStop(0.7, `rgba(84,82,80,${0.22 * d})`); gr.addColorStop(1, 'rgba(84,82,80,0)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(bx, by, br * sx, br, 0, 0, 7); g.fill();
      }
    }
    // small craters: a dark bowl + a bright rim on the sunward side
    for (let i = 0; i < 3200; i++) {
      const x = R() * W, y = H * (0.06 + R() * 0.88), r = 1.2 + Math.pow(R(), 3) * 16;
      g.fillStyle = `rgba(60,58,55,${0.18 + R() * 0.2})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = `rgba(240,236,228,${0.18 + R() * 0.25})`; g.lineWidth = Math.max(0.8, r * 0.28); g.beginPath(); g.arc(x - r * 0.12, y - r * 0.12, r, PI * 0.9, PI * 1.9); g.stroke();
    }
    // ray craters (Tycho is the famous one at the bottom)
    for (const [lon, lat, r, n] of RAYS) {
      const cx = px(lon), cy = py(lat), rr = r / 360 * W;
      for (let k = 0; k < n; k++) { const a = R() * PI * 2, L = rr * (5 + R() * 14); g.strokeStyle = `rgba(250,248,240,${0.08 + R() * 0.1})`; g.lineWidth = 2 + R() * 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L * 0.8); g.stroke(); }
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.4); gr.addColorStop(0, 'rgba(255,255,250,.85)'); gr.addColorStop(0.35, 'rgba(255,255,250,.35)'); gr.addColorStop(1, 'rgba(255,255,250,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, rr * 2.4, 0, 7); g.fill();
      g.fillStyle = 'rgba(120,116,110,.6)'; g.beginPath(); g.arc(cx, cy, rr * 0.45, 0, 7); g.fill();
    }
  });
  _tex.colorSpace = THREE.SRGBColorSpace; _tex.anisotropy = 8;
  return _tex;
}

/** A Moon body for space shots (radius in scene units). Call faceToward(earthWorldPos) to turn the near side to Earth. */
export function makeMoonBody({ r = 1, seg = 96 } = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.6)), new THREE.MeshStandardMaterial({ map: moonTexture(), roughness: 0.95, metalness: 0 }));
  // SphereGeometry: u = 0.5 sits on +x; rotate so u = 0.5 (lon 0) faces local +z
  m.rotation.y = -PI / 2;
  const g = new THREE.Group(); g.add(m);
  g.faceToward = (p) => { g.lookAt(p); };
  return g;
}

const glowTex = (() => { let t = null; return () => t || (t = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,.55)'); gr.addColorStop(0.45, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); })); })();

/** The Moon in a set's sky at a TRUE angular size. */
export function makeSkyMoon({ seg = 64 } = {}) {
  const g = new THREE.Group();
  const U = { uMap: { value: moonTexture() }, uSun: { value: new THREE.Vector3(0, 0, 1) }, uFull: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) }, uGain: { value: 1.35 }, uEarth: { value: 0.035 } };
  const disc = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), new THREE.ShaderMaterial({
    uniforms: U, fog: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vW = normalize((modelMatrix * vec4(normal, 0.0)).xyz); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uSun; uniform float uFull, uGain, uEarth; uniform vec3 uTint; varying vec2 vUv; varying vec3 vW;
      void main(){ vec3 c = texture2D(uMap, vUv).rgb; float lit = mix(smoothstep(-0.04, 0.12, dot(vW, uSun)), 1.0, uFull);
        gl_FragColor = vec4(c * uTint * (uGain * lit + uEarth), 1.0); }`,
  }));
  disc.rotation.y = -PI / 2; disc.renderOrder = 2; g.add(disc);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xdfe6ff, transparent: true, opacity: 0.35, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  halo.renderOrder = 1; g.add(halo);
  const _v = new THREE.Vector3();
  /** Place it: dir = unit world direction from the camera, ang = full angular diameter (degrees), dist in meters. */
  function setSky(camera, dir, ang, dist) {
    g.position.copy(camera.position).addScaledVector(_v.copy(dir).normalize(), dist);
    const r = dist * Math.tan(ang * PI / 360); disc.scale.setScalar(r); halo.scale.setScalar(r * 7.5);
    g.lookAt(camera.position);   // near side (lon 0) faces the viewer
  }
  return {
    g, disc, halo, setSky,
    setPhase: (sunDir) => { if (!sunDir) { U.uFull.value = 1; return; } U.uFull.value = 0; U.uSun.value.copy(sunDir).normalize(); },
    setTint: (c) => U.uTint.value.set(c), setGain: (k) => (U.uGain.value = k),
    setGlow: (k, color) => { halo.material.opacity = k; if (color !== undefined) halo.material.color.set(color); },
  };
}

/** A total solar eclipse: Sun disc + a streaky corona + the black Moon sliding over (cover 0 → 1 = totality). */
export function makeEclipse() {
  const g = new THREE.Group();
  const sun = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.0, 2.6), fog: false, depthWrite: false, transparent: true }));
  const R = rng(1919);
  const coronaT = canvasTex(512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    const gr = c.createRadialGradient(cx, cy, w * 0.08, cx, cy, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(240,244,255,.7)'); gr.addColorStop(0.35, 'rgba(210,225,255,.18)'); gr.addColorStop(1, 'rgba(200,215,255,0)');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 90; i++) { const a = R() * PI * 2, L = w * (0.18 + R() * 0.3) * (Math.abs(Math.cos(a)) > 0.6 ? 1.3 : 0.8); c.strokeStyle = `rgba(230,238,255,${0.04 + R() * 0.07})`; c.lineWidth = 2 + R() * 7; c.beginPath(); c.moveTo(cx + Math.cos(a) * w * 0.085, cy + Math.sin(a) * w * 0.085); c.quadraticCurveTo(cx + Math.cos(a + 0.08) * L * 0.6, cy + Math.sin(a + 0.08) * L * 0.6, cx + Math.cos(a + 0.12) * L, cy + Math.sin(a + 0.12) * L); c.stroke(); }
  });
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: coronaT, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  const glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xfff4dc, transparent: true, opacity: 0.8, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color: 0x050608, fog: false, depthWrite: false, transparent: true }));   // transparent → sorted after the additive corona, so it stays black
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.985, 1.02, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.6, 1.6), transparent: true, opacity: 0, fog: false, depthWrite: false }));   // chromosphere edge
  sun.renderOrder = 1; corona.renderOrder = 2; glare.renderOrder = 3; moon.renderOrder = 4; ring.renderOrder = 5;
  g.add(sun, corona, glare, moon, ring);
  const _v = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3();
  function setSky(camera, dir, angSun, angMoon, dist, cover) {
    _v.copy(dir).normalize();
    g.position.copy(camera.position).addScaledVector(_v, dist); g.lookAt(camera.position);
    const rs = dist * Math.tan(angSun * PI / 360), rm = dist * Math.tan(angMoon * PI / 360);
    sun.scale.setScalar(rs); corona.scale.setScalar(rs * 13); glare.scale.setScalar(rs * 14 * (1 - 0.92 * cover));
    // the Moon slides in along a diagonal; cover 1 = centered (totality)
    const off = (1 - cover) * (rs + rm) * 1.05;
    moon.scale.setScalar(rm); moon.position.set(-off * 0.8, off * 0.6, 0.01); ring.scale.setScalar(rs); ring.position.z = 0.02;
    const tot = THREE.MathUtils.smoothstep(cover, 0.97, 1.0);
    corona.material.opacity = tot * 1.0; ring.material.opacity = tot * 0.6; glare.material.opacity = 0.85 * (1 - tot); sun.visible = tot < 0.999 || true;
    void side; void up;
  }
  return { g, setSky };
}
