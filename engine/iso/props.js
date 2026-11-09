// iso style (060): miniature props — chunky low-poly pieces at diorama scale (a person ≈ 1 m, a house ≈ 3–4 m).
// Flat colours, soft roughness, everything casts shadows. All return a THREE.Group (`.userData` holds handles).
//   makeTree(kind 'round'|'cypress'|'pine'|'bush', {h, color, seed})   makeHouse({w, d, floors, wall, roof, seed})
//   makeLamp({h})   makeBench()   makeStall({awning, top})   makeCar({color})   makeFence(len, {h, color})
//   makeCrane({h, jib})  → .userData.setSlew(rad), setTrolley(m from mast), setHook(drop m), hook (Object3D)
//   makePlane({color, len})  → .userData.setProps(t)   makeTruck({color, tank})   makeFlagPole({h, colors})
//   windowTex({cols, rows, wall, win, shutters})  canvas facade texture (ochre walls + green shutters by default)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng } from '../core.js';

const M = (c, r = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...extra });
const shadowAll = (g) => { g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
const add = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

export function makeTree(kind = 'round', { h = 3, color, seed = 1 } = {}) {
  const R = rng(seed), g = new THREE.Group();
  const trunk = M(0x7a5236, 0.9);
  if (kind === 'cypress') {
    add(g, new THREE.CylinderGeometry(0.08 * h / 3, 0.1 * h / 3, h * 0.2, 6), trunk, 0, h * 0.1, 0);
    const c = add(g, new THREE.SphereGeometry(h * 0.16, 10, 12), M(color ?? 0x3f6e3a, 0.85), 0, h * 0.58, 0); c.scale.set(1, 2.6, 1);
  } else if (kind === 'pine') {   // Italian umbrella pine: tall bare trunk, flat wide canopy
    const tr = add(g, new THREE.CylinderGeometry(0.09 * h / 3, 0.14 * h / 3, h * 0.78, 7), trunk, 0, h * 0.39, 0); tr.rotation.z = (R() - 0.5) * 0.2;
    for (let i = 0; i < 4; i++) { const c = add(g, new THREE.SphereGeometry(h * 0.22, 10, 8), M(color ?? 0x4f7d3c, 0.85), (R() - 0.5) * h * 0.3, h * (0.82 + R() * 0.06), (R() - 0.5) * h * 0.3); c.scale.set(1.3, 0.45, 1.3); }
  } else if (kind === 'bush') {
    for (let i = 0; i < 3; i++) add(g, new THREE.SphereGeometry(h * (0.3 + R() * 0.12), 10, 8), M(color ?? 0x5b9a45, 0.85), (R() - 0.5) * h * 0.5, h * 0.3, (R() - 0.5) * h * 0.4);
  } else {
    add(g, new THREE.CylinderGeometry(0.1 * h / 3, 0.13 * h / 3, h * 0.45, 7), trunk, 0, h * 0.22, 0);
    for (let i = 0; i < 3; i++) add(g, new THREE.SphereGeometry(h * (0.24 + R() * 0.06), 12, 10), M(color ?? 0x5fa24a, 0.85), (R() - 0.5) * h * 0.22, h * (0.62 + i * 0.08), (R() - 0.5) * h * 0.22);
  }
  return shadowAll(g);
}

export function windowTex({ cols = 3, rows = 2, wall = '#e9b86a', win = '#3b4a5c', shutters = '#4f7d55', trim = '#f6ead2', door = true, seed = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = 64 * cols; c.height = 80 * rows; const g = c.getContext('2d'), R = rng(seed);
  g.fillStyle = wall; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},.05)`; g.fillRect(R() * c.width, R() * c.height, 3, 3); }
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const x = k * 64 + 20, y = r * 80 + 18;
    if (door && r === rows - 1 && k === Math.floor(cols / 2)) { g.fillStyle = '#6b3f2a'; g.fillRect(x - 2, y + 4, 28, 58); g.fillStyle = trim; g.fillRect(x - 5, y, 34, 5); continue; }
    g.fillStyle = trim; g.fillRect(x - 3, y - 3, 30, 42); g.fillStyle = win; g.fillRect(x, y, 24, 36);
    g.fillStyle = shutters; g.fillRect(x - 13, y, 10, 36); g.fillRect(x + 27, y, 10, 36);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const ROOF = 0xc8603e, WALLS = ['#e9b86a', '#e7a27a', '#f0d29a', '#e3c3a0', '#d9926a', '#f2e2c4'];
export function makeHouse({ w = 3, d = 3, floors = 2, wall, roof = ROOF, seed = 1, flat = false } = {}) {
  const R = rng(seed), g = new THREE.Group(), fh = 1.25, h = floors * fh;
  const tex = windowTex({ cols: Math.max(1, Math.round(w / 1.1)), rows: floors, wall: wall ?? WALLS[Math.floor(R() * WALLS.length)], seed });
  const texD = windowTex({ cols: Math.max(1, Math.round(d / 1.1)), rows: floors, wall: wall ?? WALLS[Math.floor(R() * WALLS.length)], door: false, seed: seed + 3 });
  const mW = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mD = new THREE.MeshStandardMaterial({ map: texD, roughness: 0.9 }), mTop = M(0xd8c8a8);
  add(g, new THREE.BoxGeometry(w, h, d), [mD, mD, mTop, mTop, mW, mW], 0, h / 2, 0);
  if (flat) { add(g, new THREE.BoxGeometry(w + 0.12, 0.14, d + 0.12), M(0xefe4cf), 0, h + 0.07, 0); }
  else {
    const rh = Math.min(w, d) * 0.32, shape = new THREE.Shape(); shape.moveTo(-w / 2 - 0.12, 0); shape.lineTo(0, rh); shape.lineTo(w / 2 + 0.12, 0); shape.lineTo(-w / 2 - 0.12, 0);
    const rg = new THREE.ExtrudeGeometry(shape, { depth: d + 0.24, bevelEnabled: false }); rg.translate(0, 0, -d / 2 - 0.12);
    add(g, rg, M(roof, 0.75), 0, h, 0);
  }
  return shadowAll(g);
}

export function makeLamp({ h = 1.6 } = {}) {
  const g = new THREE.Group(), m = M(0x2d2f33, 0.5);
  add(g, new THREE.CylinderGeometry(0.035, 0.05, h, 8), m, 0, h / 2, 0);
  add(g, new THREE.SphereGeometry(0.11, 10, 8), M(0xfff1c8, 0.3, { emissive: 0xffd88a, emissiveIntensity: 0.25 }), 0, h + 0.06, 0);
  return shadowAll(g);
}

export function makeBench() {
  const g = new THREE.Group(), wood = M(0x9a6a43), iron = M(0x2d2f33, 0.5);
  add(g, new THREE.BoxGeometry(1.2, 0.06, 0.34), wood, 0, 0.4, 0); add(g, new THREE.BoxGeometry(1.2, 0.3, 0.05), wood, 0, 0.6, -0.16);
  for (const s of [-1, 1]) add(g, new THREE.BoxGeometry(0.05, 0.4, 0.34), iron, s * 0.55, 0.2, 0);
  return shadowAll(g);
}

export function makeStall({ awning = [0xd8342c, 0xffffff], top = 0xf3e6c9 } = {}) {
  const g = new THREE.Group();
  add(g, new THREE.BoxGeometry(1.4, 0.8, 0.8), M(0x8a5a3a), 0, 0.4, 0);
  add(g, new THREE.BoxGeometry(1.45, 0.06, 0.85), M(top), 0, 0.83, 0);
  for (const s of [-1, 1]) add(g, new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), M(0x5a4030), s * 0.65, 1.3, -0.35);
  const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) { x.fillStyle = '#' + new THREE.Color(awning[i % 2]).getHexString(); x.fillRect(i * 8, 0, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  const aw = add(g, new THREE.BoxGeometry(1.6, 0.05, 1.0), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }), 0, 1.75, 0.05); aw.rotation.x = 0.28;
  // souvenirs: a row of tiny white towers + colourful boxes
  for (let i = 0; i < 5; i++) { const s = add(g, new THREE.CylinderGeometry(0.05, 0.06, 0.24, 8), M(0xf3efe6), -0.5 + i * 0.25, 0.98, 0.15); s.rotation.z = 0.12; }
  return shadowAll(g);
}

export function makeCar({ color = 0xe8533f } = {}) {
  const g = new THREE.Group();
  add(g, new RoundedBoxGeometry(1.0, 0.36, 1.9, 2, 0.12), M(color, 0.4), 0, 0.33, 0);
  add(g, new RoundedBoxGeometry(0.86, 0.32, 1.0, 2, 0.1), M(0xbfd8ea, 0.15, { metalness: 0.2 }), 0, 0.62, -0.08);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = add(g, new THREE.CylinderGeometry(0.17, 0.17, 0.12, 12), M(0x222222, 0.7), sx * 0.48, 0.17, sz * 0.6); w.rotation.z = Math.PI / 2; }
  return shadowAll(g);
}

export function makeFence(len = 6, { h = 0.5, color = 0xf3efe6, step = 0.3 } = {}) {
  const g = new THREE.Group(), m = M(color);
  const n = Math.max(2, Math.round(len / step));
  const post = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, h, 0.06), m, n + 1);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i <= n; i++) { m4.makeTranslation(-len / 2 + (i * len) / n, h / 2, 0); post.setMatrixAt(i, m4); }
  g.add(post); add(g, new THREE.BoxGeometry(len, 0.05, 0.04), m, 0, h * 0.75, 0); add(g, new THREE.BoxGeometry(len, 0.05, 0.04), m, 0, h * 0.3, 0);
  return shadowAll(g);
}

export function makeFlagPole({ h = 3, colors = [0x2a9d4a, 0xffffff, 0xd8342c] } = {}) {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.03, 0.04, h, 8), M(0xd8d8d8, 0.4, { metalness: 0.5 }), 0, h / 2, 0);
  colors.forEach((c, i) => add(g, new THREE.BoxGeometry(0.3, 0.6, 0.02), M(c, 0.85, { side: THREE.DoubleSide }), 0.2 + i * 0.3, h - 0.35, 0));
  return shadowAll(g);
}

/** Tower crane: mast + slewing jib (along +x) + counter-jib, trolley, cable, hook. Origin = mast foot. */
export function makeCrane({ h = 14, jib = 11, color = 0xf2c230 } = {}) {
  const g = new THREE.Group(), y = M(color, 0.55), dark = M(0x2d2f33, 0.6);
  const lattice = (len, axis, w = 0.42) => {   // a box truss: four chords + diagonal braces (instanced)
    const t = new THREE.Group(), n = Math.max(2, Math.round(len / (w * 1.4)));
    for (const a of [-1, 1]) for (const b of [-1, 1]) { const c = add(t, new THREE.BoxGeometry(0.07, len, 0.07), y, a * w / 2, len / 2, b * w / 2); }
    const br = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, Math.hypot(w, len / n), 0.04), y, n * 4); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let k = 0; const ang = Math.atan2(w, len / n);
    for (let i = 0; i < n; i++) for (let f = 0; f < 4; f++) {
      const yy = (i + 0.5) * len / n, rot = f * Math.PI / 2, s = i % 2 ? 1 : -1;
      const px = Math.sin(rot) * w / 2, pz = Math.cos(rot) * w / 2;
      q.setFromEuler(e.set(0, rot, s * ang, 'YXZ')); m4.compose(new THREE.Vector3(px, yy, pz), q, new THREE.Vector3(1, 1, 1)); br.setMatrixAt(k++, m4);
    }
    t.add(br);
    if (axis === 'x') t.rotation.z = -Math.PI / 2;
    return t;
  };
  g.add(lattice(h, 'y'));
  const slew = new THREE.Group(); slew.position.y = h; g.add(slew);
  add(slew, new THREE.BoxGeometry(0.8, 0.5, 0.8), dark, 0, 0.25, 0);
  const jb = lattice(jib, 'x', 0.36); jb.position.y = 0.5; slew.add(jb);
  const cj = lattice(jib * 0.35, 'x', 0.36); cj.position.y = 0.5; cj.rotation.z = Math.PI / 2; slew.add(cj);
  add(slew, new THREE.BoxGeometry(1.1, 0.8, 0.7), M(0x9a9a9a), -jib * 0.3, 0.3, 0);
  add(slew, new THREE.BoxGeometry(0.7, 0.6, 0.6), M(0xf6f1e6), 0.5, -0.25, 0.45);   // cab
  const trolley = new THREE.Group(); trolley.position.set(jib * 0.7, 0.4, 0); slew.add(trolley);
  add(trolley, new THREE.BoxGeometry(0.5, 0.18, 0.5), dark, 0, 0, 0);
  const cable = add(trolley, new THREE.CylinderGeometry(0.02, 0.02, 1, 5), dark, 0, -0.5, 0);
  const hook = new THREE.Group(); trolley.add(hook);
  add(hook, new THREE.BoxGeometry(0.3, 0.3, 0.2), M(0xd8342c, 0.6), 0, 0, 0);
  shadowAll(g);
  g.userData = {
    slew, trolley, hook, h, jib,
    setSlew(a) { slew.rotation.y = a; },
    setTrolley(x) { trolley.position.x = x; },
    setHook(drop) { cable.scale.y = Math.max(0.01, drop); cable.position.y = -drop / 2; hook.position.y = -drop - 0.15; },
  };
  g.userData.setHook(3);
  return g;
}

/** A chunky cargo plane, nose toward +x. len ≈ fuselage length. */
export function makePlane({ color = 0xeef0f2, accent = 0x2a9d4a, len = 9 } = {}) {
  const g = new THREE.Group(), body = M(color, 0.45), ac = M(accent, 0.5);
  const f = add(g, new THREE.CapsuleGeometry(len * 0.09, len * 0.75, 6, 16), body, 0, 0, 0); f.rotation.z = Math.PI / 2;
  const nose = add(g, new THREE.SphereGeometry(len * 0.09, 14, 10), M(0x2d3a4a, 0.3), len * 0.43, len * 0.02, 0); nose.scale.set(0.6, 0.6, 1.0);
  add(g, new THREE.BoxGeometry(len * 0.22, len * 0.02, len * 1.05), body, -len * 0.02, len * 0.06, 0);   // high wing
  add(g, new THREE.BoxGeometry(len * 0.12, len * 0.2, len * 0.016), ac, -len * 0.44, len * 0.13, 0);     // fin
  add(g, new THREE.BoxGeometry(len * 0.12, len * 0.014, len * 0.36), body, -len * 0.44, len * 0.06, 0);  // tailplane
  add(g, new THREE.BoxGeometry(len * 0.5, len * 0.02, len * 0.186), ac, 0, -len * 0.015, 0).position.y = len * 0.035;   // stripe
  const props = [];
  for (const s of [-1, 1]) for (const k of [0.22, 0.4]) {
    const eng = add(g, new THREE.CylinderGeometry(len * 0.03, len * 0.035, len * 0.14, 10), body, len * 0.04, len * 0.03, s * len * k); eng.rotation.z = Math.PI / 2;
    const pr = new THREE.Group(); pr.position.set(len * 0.12, len * 0.03, s * len * k); g.add(pr);
    for (let b = 0; b < 3; b++) { const bl = add(pr, new THREE.BoxGeometry(0.02, len * 0.12, 0.05), M(0x333333), 0, 0, 0); bl.rotation.x = (b * 2 * Math.PI) / 3; bl.geometry.translate(0, len * 0.06, 0); }
    props.push(pr);
  }
  // rear cargo door (hinged at its top edge; open = rotation.z −1.1)
  const door = new THREE.Group(); door.position.set(-len * 0.36, -len * 0.02, 0); g.add(door);
  add(door, new THREE.BoxGeometry(len * 0.16, len * 0.012, len * 0.14), body, -len * 0.08, 0, 0);
  shadowAll(g);
  g.userData = { props, door, setProps(t) { for (const p of props) p.rotation.x = t * 40; } };
  return g;
}

/** A small truck; tank = a tanker (cylinder) instead of a box. Nose toward +x. */
export function makeTruck({ color = 0xd8342c, tank = false, tankColor = 0xc33a2a, label } = {}) {
  const g = new THREE.Group();
  add(g, new RoundedBoxGeometry(0.9, 0.85, 1.0, 2, 0.1), M(color, 0.45), 1.05, 0.62, 0);
  add(g, new THREE.BoxGeometry(0.1, 0.32, 0.86), M(0xbfd8ea, 0.15), 1.48, 0.8, 0);
  add(g, new THREE.BoxGeometry(2.5, 0.16, 0.9), M(0x333333, 0.6), 0, 0.3, 0);
  if (tank) { const t = add(g, new THREE.CapsuleGeometry(0.45, 1.3, 6, 16), M(tankColor, 0.35, { metalness: 0.2 }), -0.35, 0.82, 0); t.rotation.z = Math.PI / 2; }
  else add(g, new RoundedBoxGeometry(1.7, 1.0, 0.98, 2, 0.06), M(0xf3efe6, 0.7), -0.4, 0.88, 0);
  for (const x of [-0.85, 0.05, 1.05]) for (const s of [-1, 1]) { const w = add(g, new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12), M(0x222222, 0.7), x, 0.2, s * 0.44); w.rotation.x = Math.PI / 2; }
  return shadowAll(g);
}
