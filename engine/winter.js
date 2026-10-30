// WINTER KIT (044, Pip ep. 7 "first snow"): turns suburb.js into a bright first-snow morning + the props a snow day needs.
//   dressWinter(studio, sub)  → snow on every lawn / sidewalk / road (tire tracks), snow caps on roofs, porch roofs, mailboxes,
//     cars, fence rails, the doghouse + bench, evergreen-dark trees + shrubs with white caps, flower beds hidden, icicles on
//     lot 0's eaves, porch steps for lot 0, a pale winter sky, cool bright light (snow bounces light: the hemi ground colour is
//     near-white so faces stay lit from below). Returns { SY (snow top on the lawns), fog, aimSun, steps, setSky }.
//   makeSnowfall(parent, {n, box, speed, size, seed, opacity}) → Points that fall analytically from t (deterministic) and wrap
//     round `center` every frame: update(t, center, wind). A box that follows the camera = snow everywhere for free.
//   makeHeroFlake() → a camera-facing six-armed crystal sprite (≈ 3.5 cm) for the close-ups (tongue, nose, glass).
//   makeDrift({r, h, seed}) → a lumpy snow mound (origin on the ground); makeSnowman() → 3 balls, coal face, carrot `nose`
//     (its own group: hide/steal it), stick `arms[]` (pivot at the shoulder: wave(t, k)), a red scarf + bucket hat; setBuild(0..1)
//     stacks it (bottom grows, middle + head drop on with a boing, the face pops in).
//   winterWear(P, {coat, hat, pom, scarf, mitten, boots}) → beanie + pom-pom, scarf, mittens and boots on any makePerson rig.
//   makeDogScarf({color, stripe}) → a knit scarf for makePip (parent it to dog.collar: it follows the neck every frame).
//   makeDogSweater(dog, {color, stripe}) → a ribbed sweater on a makePip torso (dog.T). makeSnowBeard(pip) → setBeard(k), setCap(k).
//   makeSnowball(r), snowTex(), snowViewTex() (a painted snowy street for a window).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp } from '@engine/core.js';

const PI = Math.PI;
let _snow = null;
/** Bright snow with faint blue hollows + sparkle (repeat per use). */
export function snowTex(repeat = [1, 1]) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#f4f7fb'; g.fillRect(0, 0, w, h);
    const R = rng(44);
    for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, r = 10 + R() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(170,190,220,.16)'); gr.addColorStop(1, 'rgba(170,190,220,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 1600; i++) { g.fillStyle = R() < 0.6 ? 'rgba(255,255,255,.9)' : 'rgba(150,175,210,.22)'; g.fillRect(R() * w, R() * h, 1 + R() * 1.5, 1 + R() * 1.5); }
  });
  t.repeat.set(repeat[0], repeat[1]);
  return t;
}
const snowMat = (rep = [1, 1], color = 0xffffff) => new THREE.MeshStandardMaterial({ map: snowTex(rep), color, roughness: 0.82 });
function sharedSnow() { if (!_snow) _snow = snowMat([2, 2]); return _snow; }

// ---------------------------------------------------------------- the suburb, snowed in
export function dressWinter(studio, sub, opts = {}) {
  const { root } = sub, SY = opts.depth ?? 0.1, R = rng(opts.seed ?? 77);
  const snow = sharedSnow(), lawnSnow = snowMat([60, 9]);
  const cap = mat(0xf6f9fd, 0.8);
  const adds = [], hides = [];
  const evergreen = mat(0x3f6a4c, 0.85), evergreen2 = mat(0x4f7a52, 0.85);
  const meshes = []; root.traverse((o) => { if (o.isMesh) meshes.push(o); });   // collect first: we add children below
  meshes.forEach((o) => {
    const gp = o.geometry.parameters || {}, type = o.geometry.type;
    // lawns: the two big grass planes → snow, raised to the snow top
    if (type === 'PlaneGeometry' && gp.width > 150 && Math.abs(o.rotation.x + PI / 2) < 0.01 && o.position.y < 0.02 && gp.height > 40) { o.material = lawnSnow; o.position.y = SY; o.receiveShadow = true; }
    // roof slabs (0.18 thick, pitched ±0.42) + the porch roof slab (3.2 × 0.12 × 2.3) + the doghouse roof → a snow layer on top
    else if (type === 'BoxGeometry' && Math.abs(gp.height - 0.18) < 1e-3 && Math.abs(Math.abs(o.rotation.x) - 0.42) < 0.01) adds.push([o, gp.width + 0.05, 0.14, gp.depth + 0.05, 0.15]);
    else if (type === 'BoxGeometry' && gp.width === 3.2 && Math.abs(gp.height - 0.12) < 1e-3 && gp.depth === 2.3) adds.push([o, 3.25, 0.1, 2.35, 0.11]);
    else if (type === 'BoxGeometry' && gp.width === 1.2 && Math.abs(gp.height - 0.06) < 1e-3) adds.push([o, 1.24, 0.07, 0.78, 0.065]);
    // fence top rails + the mailboxes + the bench slats
    else if (type === 'BoxGeometry' && gp.width === 0.05 && gp.depth === 6.2) adds.push([o, 0.09, 0.05, 6.2, 0.06]);
    else if (type === 'RoundedBoxGeometry' && Math.abs(gp.width - 0.25) < 1e-3 && Math.abs(gp.depth - 0.48) < 1e-3) adds.push([o, 0.27, 0.07, 0.5, 0.15]);
    else if (type === 'RoundedBoxGeometry' && Math.abs(gp.width - 1.1) < 1e-3 && Math.abs(gp.height - 0.05) < 1e-3) adds.push([o, 1.1, 0.04, 0.15, 0.045]);
    // cars: cab roof + hood
    else if (type === 'RoundedBoxGeometry' && Math.abs(gp.width - 2.05) < 1e-3) adds.push([o, 1.9, 0.12, 1.45, 0.34]);
    else if (type === 'RoundedBoxGeometry' && Math.abs(gp.width - 3.9) < 1e-3) { const h = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.08, 1.6, 2, 0.04), cap); h.position.set(1.3, 0.34, 0); o.add(h); const tr = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.07, 1.55, 2, 0.03), cap); tr.position.set(-1.55, 0.34, 0); o.add(tr); }
    // flower beds (spheres r 0.07 at y 0.22 + their mulch strip) → buried
    else if (type === 'SphereGeometry' && Math.abs(gp.radius - 0.07) < 1e-3 && Math.abs(o.position.y - 0.22) < 0.01) hides.push(o);
    else if (type === 'BoxGeometry' && gp.width === 4.2 && Math.abs(gp.height - 0.16) < 1e-3) hides.push(o);
    // leaves + shrubs → dark evergreen clumps wearing white caps
    else if (type === 'IcosahedronGeometry') {
      o.material = R() < 0.5 ? evergreen : evergreen2;
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(gp.radius * 1.0, 1), cap); c.scale.set(1.06, 0.62, 1.06); c.position.y = gp.radius * 0.42; c.castShadow = true; o.add(c);
    }
  });
  for (const [o, w, h, d, up] of adds) { const s = mk(new THREE.BoxGeometry(w, h, d), cap, o, 0, up, 0); s.castShadow = true; s.receiveShadow = true; }
  hides.forEach((o) => (o.visible = false));
  // sidewalks + road under snow (two slushy tire tracks per lane), driveways + walks are buried by the lawn snow
  const X0 = -80, X1 = 110, cx = (X0 + X1) / 2;
  for (const z of [-1, 8]) { const s = mk(new THREE.BoxGeometry(X1 - X0, 0.03, 2.02), lawnSnow, root, cx, 0.135, z); s.castShadow = false; s.receiveShadow = true; }
  const roadT = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#eef2f7'; g.fillRect(0, 0, w, h);
    const RR = rng(5);
    for (const y0 of [0.16, 0.36, 0.62, 0.82]) { g.fillStyle = 'rgba(120,128,140,.55)'; g.fillRect(0, h * y0 - 9, w, 18); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(90,96,110,${0.1 + RR() * 0.2})`; g.fillRect(RR() * w, h * y0 - 9 + RR() * 18, 6 + RR() * 12, 2); } }
    for (let i = 0; i < 1200; i++) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(RR() * w, RR() * h, 2, 2); }
  }, [12, 1]);
  const road = mk(new THREE.PlaneGeometry(X1 - X0, 7), new THREE.MeshStandardMaterial({ map: roadT, roughness: 0.85 }), root, cx, 0.012, 3.5); road.rotation.x = -PI / 2; road.receiveShadow = true; road.castShadow = false;
  // lot 0 (the family's house, x −32): two snowy porch steps, icicles along the eaves, a wreath on the door
  const L0 = sub.houses[0], hx = L0.doorPos.x, hz = -9;
  const steps = new THREE.Group(); root.add(steps);
  const stepM = mat(0xb0a698, 0.9);
  mk(new THREE.BoxGeometry(1.4, 0.2, 0.34), stepM, steps, hx, 0.1, hz + 2.17); mk(new THREE.BoxGeometry(1.42, 0.03, 0.36), cap, steps, hx, 0.21, hz + 2.17);
  mk(new THREE.BoxGeometry(3.02, 0.03, 2.02), cap, steps, hx, 0.315, hz + 1.0).scale.set(1, 1, 1);
  const iceM = new THREE.MeshStandardMaterial({ color: 0xe6f2ff, roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.85 });
  for (let x = -38.0; x < -26; x += 0.18 + R() * 0.12) { if (Math.abs(x - hx) < 0.7) continue; const l = 0.08 + R() * 0.22; const ic = mk(new THREE.ConeGeometry(0.018, l, 6), iceM, root, x, 3.05 - l / 2, hz + 0.62); ic.rotation.x = PI; ic.castShadow = false; }
  const wreath = mk(new THREE.TorusGeometry(0.17, 0.055, 10, 24), mat(0x3f6a4c, 0.85), L0.door, 0.475, 1.55, 0.06);
  mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0xd2483f, 0.5), wreath, 0, -0.17, 0.05);
  // a winter sky: pale blue top → bright white horizon, low clouds stay
  const skyT = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fa9d6'); gr.addColorStop(0.3, '#b8d1ea'); gr.addColorStop(0.48, '#eef3f8'); gr.addColorStop(1, '#f2f5f8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  root.traverse((o) => { if (o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300) { o.material.map = skyT; o.material.needsUpdate = true; } });
  const fog = new THREE.Fog(0xe6edf5, 30, 170);
  sub.lights.hemi.color.set(0xe4eeff); sub.lights.hemi.groundColor.set(0xdfe6ee); sub.lights.hemi.intensity = opts.hemi ?? 1.45;
  sub.lights.sun.color.set(0xfff1de); sub.lights.sun.intensity = opts.sun ?? 2.3;
  return { SY, fog, steps, aimSun: sub.aimSun, stepTop: 0.215, porchTop: 0.33 };
}

// ---------------------------------------------------------------- falling snow
let _dot = null;
function dotTex() {
  if (_dot) return _dot;
  _dot = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  return _dot;
}
/** Deterministic snowfall in a box around `center` (wraps): update(t, center:Vector3|[x,y,z], wind:[x,z]). */
export function makeSnowfall(parent, { n = 2400, box = [14, 9, 14], speed = 0.75, size = 0.045, seed = 3, opacity = 0.95, color = 0xffffff } = {}) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: dotTex(), transparent: true, depthWrite: false, opacity, color, sizeAttenuation: true }));
  pts.frustumCulled = false; pts.renderOrder = 4; parent.add(pts);
  const R = rng(seed), S = Array.from({ length: n }, () => [R(), R(), R(), 0.7 + 0.6 * R(), R() * PI * 2]);
  const [bw, bh, bd] = box;
  const wrap = (v, c, L) => c - L / 2 + ((((v - (c - L / 2)) % L) + L) % L);
  function update(t, center = [0, 0, 0], wind = [0, 0]) {
    const c = Array.isArray(center) ? center : [center.x, center.y, center.z];
    for (let i = 0; i < n; i++) {
      const [a, b, d, sp, ph] = S[i], fall = t * speed * sp;
      const x = a * bw + 0.18 * Math.sin(t * 1.1 * sp + ph) + wind[0] * t, z = d * bd + 0.18 * Math.cos(t * 0.9 * sp + ph) + wind[1] * t, y = b * bh - fall;
      pos[i * 3] = wrap(x, c[0], bw); pos[i * 3 + 1] = wrap(y, c[1], bh); pos[i * 3 + 2] = wrap(z, c[2], bd);
    }
    geo.attributes.position.needsUpdate = true;
  }
  return { pts, update };
}

let _crystal = null;
function crystalTex() {
  if (_crystal) return _crystal;
  _crystal = canvasTex(128, 128, (g, w, h) => {
    g.translate(w / 2, h / 2); g.strokeStyle = 'rgba(255,255,255,1)'; g.lineCap = 'round'; g.shadowColor = 'rgba(120,160,220,.9)'; g.shadowBlur = 6;
    for (let k = 0; k < 6; k++) { g.save(); g.rotate(k * PI / 3); g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -52); g.stroke(); g.lineWidth = 5; for (const [y, l] of [[-22, 14], [-36, 11]]) { g.beginPath(); g.moveTo(0, y); g.lineTo(-l, y - l); g.moveTo(0, y); g.lineTo(l, y - l); g.stroke(); } g.restore(); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  });
  return _crystal;
}
/** A six-armed crystal sprite (≈ size m across); set .position + .material.opacity. */
export function makeHeroFlake(size = 0.035) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: crystalTex(), transparent: true, depthWrite: false }));
  s.scale.setScalar(size); s.renderOrder = 6; return s;
}

// ---------------------------------------------------------------- drifts, snowballs, the snowman
/** A lumpy snow mound, origin on the ground at its center. */
export function makeDrift({ r = 0.9, h = 0.42, seed = 5, rz = null } = {}) {
  const geo = new THREE.SphereGeometry(1, 40, 20, 0, PI * 2, 0, PI / 2), p = geo.attributes.position, R = rng(seed);
  const ph = [R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    const n = 1 + 0.08 * Math.sin(3 * a + ph[0]) + 0.05 * Math.sin(5 * a + ph[1]) + 0.04 * Math.sin(7 * a + y * 4 + ph[2]);
    p.setXYZ(i, x * n, y * (1 + 0.1 * Math.sin(4 * a + ph[1])), z * n);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, sharedSnow()); m.scale.set(r, h, rz ?? r * 0.8); m.castShadow = true; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
export function makeSnowball(r = 0.05) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), sharedSnow()); m.castShadow = true; return m; }

function lumpy(r, seed) {
  const geo = new THREE.SphereGeometry(r, 32, 22), p = geo.attributes.position, R = rng(seed), ph = R() * 6;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.025 * Math.sin(5 * Math.atan2(z, x) + ph + y * 9) + 0.02 * Math.sin(y * 13 + ph); p.setXYZ(i, x * n, y * n, z * n); }
  geo.computeVertexNormals(); return geo;
}
/** A family snowman (≈ 1.15 m): balls, coal eyes/smile/buttons, carrot `nose` group, stick `arms[]`, scarf + bucket hat. */
export function makeSnowman({ seed = 9, scarf = 0x3d7bd9, hat = 0xd2483f } = {}) {
  const g = new THREE.Group(), sm = sharedSnow(), coal = mat(0x1e1b1d, 0.6);
  const parts = [[0.27, 0.25], [0.2, 0.63], [0.145, 0.93]].map(([r, y], i) => { const b = new THREE.Group(); b.position.y = y; g.add(b); const m = mk(lumpy(r, seed + i), sm, b); m.castShadow = m.receiveShadow = true; return { b, r, y }; });
  const H = parts[2].b, face = new THREE.Group(); H.add(face);
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.019, 10, 8), coal, face, s * 0.05, 0.035, 0.132);
  for (let k = 0; k < 5; k++) { const a = -0.55 + k * 0.275; mk(new THREE.SphereGeometry(0.011, 8, 6), coal, face, Math.sin(a) * 0.07, -0.045 - Math.cos(a) * 0.022 + 0.022, 0.135 - Math.abs(Math.sin(a)) * 0.012); }
  for (let k = 0; k < 3; k++) mk(new THREE.SphereGeometry(0.018, 10, 8), coal, parts[1].b, 0, 0.09 - k * 0.09, 0.195 - Math.abs(k - 1) * 0.008);
  const nose = new THREE.Group(); nose.position.set(0, 0.0, 0.13); H.add(nose);
  const carrotM = mat(0xf07a2a, 0.6);
  const carrot = mk(new THREE.ConeGeometry(0.022, 0.13, 12), carrotM, nose, 0, 0, 0.06); carrot.rotation.x = PI / 2;
  const sc = new THREE.Group(); sc.position.y = 0.78; g.add(sc);
  const scM = mat(scarf, 0.9); const ring = mk(new THREE.TorusGeometry(0.135, 0.035, 10, 24), scM, sc); ring.rotation.x = PI / 2;
  const tail = mk(new RoundedBoxGeometry(0.07, 0.22, 0.03, 2, 0.012), scM, sc, 0.07, -0.1, 0.15); tail.rotation.set(0.25, 0, 0.15);
  const hatG = new THREE.Group(); hatG.position.set(0, 0.11, 0); hatG.rotation.z = -0.15; H.add(hatG);
  mk(new THREE.CylinderGeometry(0.085, 0.105, 0.12, 18), mat(hat, 0.5), hatG, 0, 0.06, 0);
  mk(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 20), mat(hat, 0.5), hatG, 0, 0.005, 0);
  const stick = mat(0x5a3a22, 0.9), arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.17, 0.68, 0); a.rotation.z = s * -0.55; g.add(a);
    const main = mk(new THREE.CylinderGeometry(0.009, 0.013, 0.42, 6), stick, a, s * 0.21, 0, 0); main.rotation.z = PI / 2;
    for (const [u, l, ang] of [[0.3, 0.1, 0.7], [0.36, 0.08, -0.6]]) { const tw = mk(new THREE.CylinderGeometry(0.005, 0.007, l, 5), stick, a, s * u, l * 0.35 * Math.sign(ang), 0); tw.rotation.z = PI / 2 - s * ang; }
    for (const [u, ang] of [[0.42, 0.5], [0.42, -0.45], [0.41, 0.05]]) { const f = mk(new THREE.CylinderGeometry(0.004, 0.005, 0.06, 5), stick, a, s * (u + 0.02), 0.02 * Math.sign(ang), 0); f.rotation.z = PI / 2 - s * ang; }
    arms.push(a);
  }
  const fx = [face, nose, sc, hatG, ...arms, ...parts[1].b.children.slice(1)];
  function setBuild(k) {
    k = clamp(k);
    const u0 = clamp(k / 0.4), u1 = clamp((k - 0.4) / 0.25), u2 = clamp((k - 0.65) / 0.2), u3 = clamp((k - 0.85) / 0.15);
    const boing = (u) => (u <= 0 ? 0 : 1 + 0.18 * Math.exp(-6 * u) * Math.sin(14 * u) * (1 - u));
    parts[0].b.scale.setScalar(Math.max(0.001, 0.35 + 0.65 * u0)); parts[0].b.position.y = parts[0].y * (0.35 + 0.65 * u0);
    parts[1].b.visible = u1 > 0; parts[1].b.position.y = parts[1].y + 0.5 * (1 - u1) * (1 - u1); parts[1].b.scale.setScalar(boing(u1));
    parts[2].b.visible = u2 > 0; parts[2].b.position.y = parts[2].y + 0.5 * (1 - u2) * (1 - u2); parts[2].b.scale.setScalar(boing(u2));
    fx.forEach((o) => { if (o !== nose) { o.visible = u3 > 0; if (o !== face) o.scale.setScalar(Math.max(0.001, u3)); } });
  }
  function wave(t, k = 1, rate = 1.2) { arms[1].rotation.z = -0.55 + k * (0.85 + 0.35 * Math.sin(t * rate * PI * 2)); }
  setBuild(1);
  return { g, parts, head: H, face, nose, carrot, arms, setBuild, wave };
}

// ---------------------------------------------------------------- winter clothes for people + dogs
const knitTex = (base, stripe) => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.09)'; for (let x = 0; x < w; x += 8) for (let y = 0; y < h; y += 10) { g.beginPath(); g.ellipse(x + 4, y + 5, 2.6, 4.5, 0.5, 0, 7); g.fill(); }
  if (stripe) { g.fillStyle = stripe; for (const y of [18, 58, 98]) g.fillRect(0, y, w, 14); }
}, [2, 2]);
/** Beanie + pom-pom, scarf, mittens, boots on a makePerson rig (colors as hex; pass null to skip a piece). */
export function winterWear(P, { coat = null, pants = null, hat = 0xd2483f, pom = 0xf4f1ea, band = null, scarf = 0x3d7bd9, stripe = '#f4f1ea', mitten = 0xd2483f, boots = 0x5a3a2a } = {}) {
  const hr = P.head.head.geometry.parameters.radius, hg = P.head.g, add = {};
  if (coat !== null) P.mats.top.color.set(coat);
  if (pants !== null) P.mats.pants.color.set(pants);
  if (coat !== null && P.mats.top.map) { P.mats.top.map = null; P.mats.top.needsUpdate = true; }
  if (hat !== null) {
    const hm = new THREE.MeshStandardMaterial({ map: knitTex('#' + new THREE.Color(hat).getHexString(), null), roughness: 0.95, side: THREE.DoubleSide });
    const h = new THREE.Group(); hg.add(h); add.hat = h;
    const rh = hr * 1.1;
    const b = mk(new THREE.SphereGeometry(rh * 1.05, 32, 16, 0, PI * 2, 0, PI * 0.5), hm, h); b.rotation.x = -0.25; b.position.y = hr * 0.05;
    const brim = mk(new THREE.TorusGeometry(rh * 1.0, hr * 0.12, 10, 36), mat(band ?? hat, 0.95), h); brim.rotation.x = PI / 2 - 0.25; brim.position.set(0, hr * 0.06, -hr * 0.02);
    mk(new THREE.SphereGeometry(hr * 0.26, 14, 10), mat(pom, 0.98), h, 0, rh * 1.12, -hr * 0.28);
  }
  if (scarf !== null) {
    const sm = new THREE.MeshStandardMaterial({ map: knitTex('#' + new THREE.Color(scarf).getHexString(), stripe), roughness: 0.95 });
    const s = new THREE.Group(); s.position.set(0, 0.53, 0.0); P.spine.add(s); add.scarf = s;
    const ring = mk(new THREE.TorusGeometry(0.1, 0.04, 10, 24), sm, s); ring.rotation.x = PI / 2;
    const tail = mk(new RoundedBoxGeometry(0.085, 0.3, 0.035, 2, 0.015), sm, s, 0.07, -0.14, 0.12); tail.rotation.set(0.2, 0, 0.08);
  }
  if (mitten !== null) { const mm = mat(mitten, 0.95); add.mittens = P.arms.map((a) => { const m = mk(new THREE.SphereGeometry(0.06, 14, 10), mm, a.hand); m.scale.set(0.9, 1.12, 0.72); mk(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), mat(0xf4f1ea, 0.98), a.hand, 0, 0.055, 0); return m; }); }
  if (boots !== null && P.legs) add.boots = P.legs.map((L) => { const sh = L.ankle && L.ankle.children[0]; if (!sh) return null; const b = mk(new RoundedBoxGeometry(0.13, 0.12, 0.24, 2, 0.04), mat(boots, 0.7), L.ankle, 0, 0.03, 0.04); mk(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 14), mat(0xf4f1ea, 0.98), L.ankle, 0, 0.1, 0); return b; });
  return add;
}
/** A chunky knit scarf for a makePip dog: parent it to dog.collar (scale it by 1 for any size — the collar is in the dog's R frame). */
export function makeDogScarf({ color = 0xd2483f, stripe = '#f4f1ea' } = {}) {
  const sm = new THREE.MeshStandardMaterial({ map: knitTex('#' + new THREE.Color(color).getHexString(), stripe), roughness: 0.95 });
  const g = new THREE.Group();
  mk(new THREE.TorusGeometry(0.064, 0.022, 10, 28), sm, g);
  const tails = new THREE.Group(); tails.position.set(0.035, -0.06, 0.02); g.add(tails);
  for (const [dx, rz, L] of [[0, 0.25, 0.11], [0.025, -0.1, 0.09]]) { const t = mk(new RoundedBoxGeometry(0.036, L, 0.014, 2, 0.006), sm, tails, dx, -L / 2, 0); t.rotation.z = rz; for (const fx of [-0.012, 0, 0.012]) mk(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 4), sm, t, fx, -L / 2 - 0.01, 0); }
  g.userData.tails = tails;
  return g;
}
/** A ribbed sweater on a makePip torso. */
export function makeDogSweater(dog, { color = 0xe86aa0, stripe = '#f7d4e2' } = {}) {
  const sm = new THREE.MeshStandardMaterial({ map: knitTex('#' + new THREE.Color(color).getHexString(), stripe), roughness: 0.95 });
  const geo = new THREE.CapsuleGeometry(0.088, 0.12, 8, 18); geo.rotateX(PI / 2);
  const m = mk(geo, sm, dog.T, 0, 0.006, 0.02); m.scale.set(1.08, 1.02, 1.0);
  const neck = mk(new THREE.TorusGeometry(0.07, 0.022, 10, 24), sm, dog.T, 0, 0.02, 0.11); neck.scale.set(1.05, 1.0, 1);
  return { m, neck };
}
/** Snow stuck to a makePip head: a white beard under the muzzle + a snow cap on top. setBeard(k), setCap(k). */
export function makeSnowBeard(pip) {
  const cap = mat(0xfbfdff, 0.85), H = pip.H;
  const beard = new THREE.Group(); beard.position.set(0, -0.075, 0.085); H.add(beard);
  const R = rng(12);
  for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.2, m = mk(new THREE.IcosahedronGeometry(0.02 + R() * 0.012, 1), cap, beard, Math.sin(a) * 0.045, -Math.abs(Math.cos(a)) * 0.012 - R() * 0.02, Math.cos(a) * 0.03); m.scale.y = 1.2; }
  mk(new THREE.IcosahedronGeometry(0.034, 1), cap, beard, 0, -0.03, 0.02).scale.set(1.2, 1.4, 1);
  const top = new THREE.Group(); top.position.set(0, 0.085, 0.0); H.add(top);
  const t1 = mk(new THREE.SphereGeometry(0.055, 16, 10, 0, PI * 2, 0, PI / 2), cap, top); t1.scale.set(1.1, 0.75, 1.05);
  mk(new THREE.IcosahedronGeometry(0.026, 1), cap, top, 0.018, 0.04, 0.0);
  const set = (o, k) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(0.001, k)); };
  set(beard, 0); set(top, 0);
  return { beard, top, setBeard: (k) => set(beard, k), setCap: (k) => set(top, k) };
}

/** A painted snowy street for a window view (1024 × 512). */
export function snowViewTex() {
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fc0e2'); gr.addColorStop(0.55, '#e4edf6'); gr.addColorStop(1, '#f2f6fa'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(8);
    // far houses across the street with snowy roofs + warm windows
    for (let i = 0; i < 7; i++) {
      const x = i * 160 - 20 + R() * 30, bw = 120 + R() * 30, bh = 70 + R() * 20, base = h * 0.74;
      g.fillStyle = ['#d8c3a5', '#b9cfd6', '#e7dcc4', '#d6b9b0', '#c9d6b4'][i % 5]; g.fillRect(x, base - bh, bw, bh);
      g.fillStyle = '#fbfdff'; g.beginPath(); g.moveTo(x - 12, base - bh + 4); g.lineTo(x + bw / 2, base - bh - 46); g.lineTo(x + bw + 12, base - bh + 4); g.closePath(); g.fill();
      g.fillStyle = '#ffe2a6'; g.fillRect(x + 18, base - bh + 22, 22, 20); g.fillRect(x + bw - 40, base - bh + 22, 22, 20);
      g.fillStyle = '#5a4a3a'; g.fillRect(x + bw / 2 - 10, base - 34, 20, 34);
    }
    // snowy evergreens
    for (let i = 0; i < 9; i++) { const x = R() * w, s = 36 + R() * 30, base = h * 0.8; g.fillStyle = '#3f6a4c'; g.beginPath(); g.moveTo(x, base - s * 2.2); g.lineTo(x - s * 0.8, base); g.lineTo(x + s * 0.8, base); g.fill(); g.fillStyle = '#f4f8fc'; g.beginPath(); g.moveTo(x, base - s * 2.2); g.lineTo(x - s * 0.36, base - s * 1.3); g.lineTo(x + s * 0.4, base - s * 1.35); g.fill(); }
    g.fillStyle = '#f6f9fc'; g.fillRect(0, h * 0.78, w, h);
    g.fillStyle = 'rgba(150,170,200,.25)'; g.fillRect(0, h * 0.8, w, 4);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.5 + R() * 0.5})`; g.beginPath(); g.arc(R() * w, R() * h * 0.9, 1 + R() * 2.4, 0, 7); g.fill(); }
  });
}
