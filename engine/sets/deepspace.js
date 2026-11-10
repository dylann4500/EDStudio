// Deep space at the edge of the solar system (079 Vex Voyager explainer), pixel look.
//   makeVoyager() → { g, hgaDir (local +z = the high-gain dish's boresight), record (the golden record's group, on the bus's +y face),
//     recordAt(v) world centre, hga } — our own toy model of a 1977 probe: a 3.7 m white dish over a ten-sided bus, a boom of three
//     finned power units, a science boom with a scan platform, a 13 m magnetometer mast, two long wire antennas, the record.
//   buildDeepSpace(studio) → { root, voy, sunDir, stars, sun (sprite), earth (sprite), waves(t, k, len), lights } — park root far from
//     the other sets; the probe sits at root's origin with its dish aimed home (sunDir). Star shell r = 4000: camera.far ≥ 4500.
import * as THREE from 'three';
import { pixelTex, speckle } from '../pixeltex.js';

const PI = Math.PI;
const lam = (o) => new THREE.MeshLambertMaterial(o);
const box = (p, w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); p.add(b); return b; };
const cyl = (p, rt, rb, h, m, x, y, z, seg = 16) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); c.position.set(x, y, z); p.add(c); return c; };
const Yv = new THREE.Vector3(0, 1, 0);
function rod(p, a, b, r, m) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), m); c.position.copy(A).add(B).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(Yv, B.clone().sub(A).normalize()); p.add(c); return c; }
function soft(stops, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach(([k, col]) => r.addColorStop(k, col));
  g.fillStyle = r; g.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** the golden record: a gold disc in its cover with engraved diagrams (pulsar map, hydrogen, how to play it) */
export function recordTexture() {
  return pixelTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#b8872a'; g.beginPath(); g.arc(32, 32, 31, 0, 2 * PI); g.fill();
    g.fillStyle = '#e7bb4e'; g.beginPath(); g.arc(32, 32, 29, 0, 2 * PI); g.fill();
    g.fillStyle = '#f6d77a'; g.beginPath(); g.arc(26, 24, 12, 0, 2 * PI); g.fill();
    g.fillStyle = '#e7bb4e'; g.beginPath(); g.arc(32, 32, 27, 0, 2 * PI); g.fill();
    g.strokeStyle = '#9a6b1c'; g.lineWidth = 1;
    g.beginPath(); g.arc(17, 22, 6, 0, 2 * PI); g.stroke(); g.beginPath(); g.arc(17, 22, 1.5, 0, 2 * PI); g.stroke();    // the record drawn (how to play it)
    g.beginPath(); g.moveTo(10, 22); g.lineTo(24, 22); g.stroke();
    g.beginPath(); g.arc(17, 40, 6, 0, 2 * PI); g.stroke(); g.beginPath(); g.moveTo(17, 33); g.lineTo(17, 47); g.stroke();
    const cx = 44, cy = 22; for (let i = 0; i < 14; i++) { const a = i * 0.45 + 0.2, L = 6 + (i * 7) % 9; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.stroke(); }   // pulsar map
    g.beginPath(); g.arc(40, 44, 3, 0, 2 * PI); g.stroke(); g.beginPath(); g.arc(50, 44, 3, 0, 2 * PI); g.stroke(); g.beginPath(); g.moveTo(43, 44); g.lineTo(47, 44); g.stroke();   // hydrogen
    g.fillStyle = '#7d5414'; g.beginPath(); g.arc(32, 32, 2, 0, 2 * PI); g.fill();
  }, { k: 4 });
}

export function makeVoyager() {
  const g = new THREE.Group();
  const white = lam({ color: 0xeeeeea, side: THREE.DoubleSide, emissive: 0x2a2a30 }), grey = lam({ color: 0x8e939c }), dark = lam({ color: 0x2c2f36 }), black = lam({ color: 0x17181c });
  const foil = lam({ map: pixelTex(16, 16, (q, w, h) => { speckle(q, w, h, '#2a2b30', ['#34353b', '#1f2025', '#3d3a2c'], 60, 5); for (let i = 0; i < 5; i++) { q.fillStyle = '#6a5a34'; q.fillRect((i * 5) % w, (i * 3) % h, 2, 1); } }, { k: 1 }) });
  // high-gain antenna: boresight +z, rim at z ≈ 0.45
  const prof = []; for (let i = 0; i <= 12; i++) { const r = 0.12 + 1.71 * (i / 12); prof.push(new THREE.Vector2(r, (r * r) / (4 * 1.9))); }
  const hga = new THREE.Group(); g.add(hga);
  const dish = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), lam({ map: pixelTex(64, 16, (q, w, h) => { speckle(q, w, h, '#f1f0ec', ['#e8e7e2', '#f7f6f2'], 50, 3); for (let x = 0; x < w; x += 8) { q.fillStyle = '#d9d8d2'; q.fillRect(x, 0, 1, h); } }, { k: 1 }), side: THREE.DoubleSide, emissive: 0x34343c }));
  dish.rotation.x = PI / 2; hga.add(dish);
  for (let i = 0; i < 3; i++) { const a = i * 2 * PI / 3 + PI / 2; rod(hga, [Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.42], [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 1.12], 0.02, grey); }
  cyl(hga, 0.22, 0.12, 0.1, white, 0, 0, 1.14, 16).rotation.x = PI / 2;   // subreflector
  cyl(hga, 0.08, 0.1, 0.4, white, 0, 0, 0.25, 10).rotation.x = PI / 2;    // feed
  // the bus: a ten-sided ring behind the dish, foil-wrapped, with the record on its +y face
  const bus = new THREE.Group(); bus.position.z = -0.42; g.add(bus);
  const ring = cyl(bus, 0.9, 0.9, 0.46, foil, 0, 0, 0, 10); ring.rotation.x = PI / 2; ring.rotation.y = PI / 10;
  cyl(bus, 0.55, 0.62, 0.5, black, 0, 0, -0.45, 16).rotation.x = PI / 2;                       // propellant tank housing
  cyl(bus, 0.25, 0.5, 0.35, dark, 0, 0, -0.85, 16).rotation.x = PI / 2;
  for (let i = 0; i < 10; i++) { const a = i * PI / 5, b = box(bus, 0.5, 0.04, 0.44, lam({ color: i % 3 ? 0x3a3b40 : 0x8a6d32 }), Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0); b.rotation.z = a + PI / 2; }
  const record = new THREE.Group(); record.position.set(0, 0.9, -0.02); record.rotation.x = -PI / 2; bus.add(record);
  const rec = new THREE.Mesh(new THREE.CircleGeometry(0.17, 40), new THREE.MeshLambertMaterial({ map: recordTexture(), transparent: true, alphaTest: 0.5, emissive: 0x3a2a08 })); rec.position.z = 0.012; record.add(rec);
  box(record, 0.38, 0.38, 0.02, grey, 0, 0, 0);   // the mounting plate
  for (const [x, y] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) box(record, 0.03, 0.03, 0.03, dark, x, y, 0.018);
  // power boom (−x): three finned power units in a row
  rod(g, [-0.8, 0, -0.5], [-3.0, -0.25, -0.75], 0.035, grey); rod(g, [-0.8, 0.2, -0.3], [-2.2, -0.15, -0.7], 0.025, grey);
  for (let i = 0; i < 3; i++) { const x = -1.6 - i * 0.55, u = new THREE.Group(); u.position.set(x, -0.1 - i * 0.05, -0.65 - i * 0.04); u.rotation.z = PI / 2; g.add(u);
    cyl(u, 0.2, 0.2, 0.48, dark, 0, 0, 0, 12); for (let f = 0; f < 6; f++) { const a = f * PI / 3; box(u, 0.02, 0.46, 0.14, dark, Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26).rotation.y = -a; } }
  // science boom (+x): instruments mid-way, a scan platform with two cameras at the end
  rod(g, [0.8, 0, -0.5], [3.1, 0.2, -0.5], 0.04, grey); rod(g, [0.8, -0.2, -0.3], [2.4, 0.15, -0.5], 0.025, grey);
  box(g, 0.4, 0.3, 0.3, foil, 1.7, 0.08, -0.5); cyl(g, 0.12, 0.12, 0.3, white, 1.7, 0.32, -0.5, 10);
  const plat = new THREE.Group(); plat.position.set(3.2, 0.25, -0.45); g.add(plat);
  box(plat, 0.55, 0.4, 0.42, foil, 0, 0, 0); cyl(plat, 0.09, 0.09, 0.6, white, 0.1, 0.25, 0.12, 10).rotation.x = PI / 2; cyl(plat, 0.07, 0.07, 0.4, white, -0.14, 0.24, 0.1, 10).rotation.x = PI / 2;
  // magnetometer mast (−y, 13 m) + two long wire antennas
  const mast = rod(g, [-0.3, -0.85, -0.6], [-2.2, -12.8, -1.6], 0.03, lam({ color: 0xc9ccd2 }));
  for (let i = 1; i <= 26; i++) { const k = i / 26; box(g, 0.07, 0.07, 0.07, grey, -0.3 - 1.9 * k, -0.85 - 11.95 * k, -0.6 - 1.0 * k); }
  box(g, 0.14, 0.14, 0.14, white, -2.2, -12.8, -1.6); void mast;
  rod(g, [0.3, -0.6, -0.7], [6.5, -7.8, -1.2], 0.008, lam({ color: 0xd8d8d8 })); rod(g, [-0.3, -0.6, -0.7], [-6.0, -8.3, -1.4], 0.008, lam({ color: 0xd8d8d8 }));
  const v = new THREE.Vector3();
  return { g, hga, record, bus, recordAt: (out = v) => { g.updateMatrixWorld(true); return record.localToWorld(out.set(0, 0, 0.02)); } };
}

export function buildDeepSpace(studio) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const sunDir = new THREE.Vector3(-0.62, 0.22, -0.75).normalize();   // home (the Sun, with Earth a hair beside it)
  // stars: a shell of points, a faint galactic band, all ≥ 4 px so the pixel pass keeps them
  let s = 41; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const mkStars = (n, size, band, bright) => {
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3); const ax = new THREE.Vector3(0.3, 0.85, -0.42).normalize(), t1 = new THREE.Vector3(1, 0, 0).cross(ax).normalize(), t2 = ax.clone().cross(t1);
    for (let i = 0; i < n; i++) {
      let d;
      if (band) { const a = rnd() * 2 * PI, w = (rnd() - 0.5) * 0.28 * (rnd() < 0.5 ? 1 : 0.4); d = t1.clone().multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).addScaledVector(ax, w).normalize(); }
      else { const u = rnd() * 2 - 1, th = rnd() * 2 * PI, r = Math.sqrt(1 - u * u); d = new THREE.Vector3(r * Math.cos(th), u, r * Math.sin(th)); }
      p.set([d.x * 4000, d.y * 4000, d.z * 4000], i * 3);
      const b = bright * (0.5 + 0.5 * rnd()), tint = rnd(); c.set(tint < 0.15 ? [b, b * 0.85, b * 0.65] : tint < 0.3 ? [b * 0.75, b * 0.85, b] : [b, b, b], i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false, fog: false, toneMapped: false })); pts.frustumCulled = false; pts.renderOrder = -2; root.add(pts); return pts;
  };
  const stars = [mkStars(2200, 4.5, false, 0.85), mkStars(260, 7, false, 1.0), mkStars(2600, 4.5, true, 0.42)];
  const bandSprite = new THREE.Mesh(new THREE.SphereGeometry(4100, 32, 16), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, fog: false }));
  bandSprite.renderOrder = -4; root.add(bandSprite);
  // the Sun: a hard white star with a glow; Earth a pale blue dot beside it
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft([[0, 'rgba(255,255,255,1)'], [0.08, 'rgba(255,250,235,1)'], [0.22, 'rgba(255,230,180,0.5)'], [0.6, 'rgba(255,200,140,0.08)'], [1, 'rgba(255,200,140,0)']], 128), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, fog: false }));
  sun.position.copy(sunDir).multiplyScalar(3500); sun.scale.setScalar(260); root.add(sun);
  const earth = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft([[0, 'rgba(170,215,255,1)'], [0.35, 'rgba(120,180,255,0.9)'], [1, 'rgba(90,150,255,0)']], 32), transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  earth.position.copy(sunDir).multiplyScalar(3500).add(new THREE.Vector3(26, 10, 0)); earth.scale.setScalar(16); root.add(earth);
  // the probe at the origin, dish aimed home
  const voy = makeVoyager(); root.add(voy.g);
  voy.g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), sunDir);
  voy.g.rotateZ(0.6);
  // lights: weak far sunlight from home + a cool fill so the shadow side reads + a rim
  const key = new THREE.DirectionalLight(0xfff2dc, 1.9); key.position.copy(sunDir).multiplyScalar(50); root.add(key, key.target);
  const hemi = new THREE.HemisphereLight(0x8a90b8, 0x22222e, 0.6); root.add(hemi);
  const rim = new THREE.DirectionalLight(0x7aa0ff, 0.6); rim.position.set(30, -10, 40); root.add(rim, rim.target);
  // radio wavefronts leaving the dish toward home: waves(t, k, len)
  const ringM = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const rings = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 72), ringM.clone()); m.visible = false; root.add(m); return m; });
  const o = new THREE.Vector3(), tgt = new THREE.Vector3();
  function waves(t, k = 1, len = 60, rate = 0.45) {
    voy.g.updateMatrixWorld(true); voy.hga.localToWorld(o.set(0, 0, 1.2)); root.worldToLocal(o);
    rings.forEach((m, i) => { const u = (t * rate + i / rings.length) % 1; m.visible = k > 0.01; if (!m.visible) return;
      m.position.copy(o).addScaledVector(sunDir, 0.5 + u * len); tgt.copy(m.position).add(sunDir); m.lookAt(root.localToWorld(tgt.clone()));
      m.scale.setScalar(1.4 + u * len * 0.14); m.material.opacity = k * 0.9 * (1 - u) ** 1.5 * Math.min(1, u * 8); });
  }
  return { root, voy, sunDir, stars, sun, earth, waves, key, hemi, rim };
}
