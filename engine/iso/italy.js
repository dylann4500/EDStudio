// iso style (060): an Italian landmark kit at diorama scale (a person ≈ 1 m): the Leaning Tower, the cathedral and baptistery of
// Pisa's Piazza dei Miracoli, a crenellated city wall, the Colosseum (+ a brick oven dome for the pizza gag). White marble with
// grey bands, arcades as canvas textures (cheap, crisp at iso distances), shadows on.
//   makePisaTower({r, h})  → .userData.setLean(deg, dir = +1)   pivots on the low edge of the base (it can fall all the way over)
//   makeDuomo()  makeBaptistery()  makeCityWall(len, {h})  makeColosseum({rx, rz, h})  → .userData.setOven(build 0..1, glow 0..1)
import * as THREE from 'three';
import { rng } from '../core.js';

const D2R = Math.PI / 180;
const M = (c, r = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...extra });
const shadowAll = (g) => { g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
const add = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
const MARBLE = '#f1ede4', BAND = '#c9c3b8';

/** Arcade texture: `n` arches around, `tiers` rows; open = transparent arch openings (alpha) or dark paint. */
export function arcadeTex({ n = 16, tiers = 1, wall = MARBLE, band = BAND, dark = '#5a5650', open = false, pilaster = true, h = 128, stripes = 0, glow = false } = {}) {
  const w = n * 48, c = document.createElement('canvas'); c.width = w; c.height = h * tiers; const g = c.getContext('2d');
  if (!glow) { g.fillStyle = wall; g.fillRect(0, 0, w, c.height); }
  if (stripes && !glow) { g.fillStyle = band; for (let y = 0; y < c.height; y += stripes * 2) g.fillRect(0, y, w, stripes); }
  for (let tr = 0; tr < tiers; tr++) for (let i = 0; i < n; i++) {
    const x = i * 48 + 9, y0 = tr * h + h * 0.18, aw = 30, ah = h * 0.66;
    g.beginPath(); g.moveTo(x, y0 + ah); g.lineTo(x, y0 + aw / 2); g.arc(x + aw / 2, y0 + aw / 2, aw / 2, Math.PI, 0); g.lineTo(x + aw, y0 + ah); g.closePath();
    if (glow) { g.fillStyle = '#ff9a3a'; g.fill(); continue; }
    if (open) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore(); }
    else { g.fillStyle = dark; g.fill(); g.strokeStyle = band; g.lineWidth = 3; g.stroke(); }
    if (pilaster && !open) { g.fillStyle = band; g.fillRect(i * 48 + 1, tr * h + h * 0.1, 5, h * 0.8); }
  }
  if (!glow) { g.fillStyle = band; for (let tr = 0; tr <= tiers; tr++) g.fillRect(0, tr * h - 4, w, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function makePisaTower({ r = 1.6, h = 11.4, stories = 6, seed = 1 } = {}) {
  const hinge = new THREE.Group(), tower = new THREE.Group(); hinge.add(tower);
  const mW = M(0xf1ede4, 0.6), mCore = M(0xbdb6aa, 0.85), mCol = M(0xf6f3ec, 0.5);
  const h0 = h * 0.17, hs = (h * 0.68) / stories, hb = h - h0 - hs * stories;
  // ground storey: blind arcade
  const t0 = arcadeTex({ n: 15, tiers: 1, h: 160 });
  add(tower, new THREE.CylinderGeometry(r, r * 1.02, h0, 48), [new THREE.MeshStandardMaterial({ map: t0, roughness: 0.6 }), mW, mW], 0, h0 / 2, 0);
  add(tower, new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.1, 48), mW, 0, h0, 0);
  // loggia storeys: a shadowed core, a ring of columns, an open arcade band on top, a cornice
  const colGeo = new THREE.CylinderGeometry(0.045, 0.05, hs * 0.72, 6), N = 18;
  const cols = new THREE.InstancedMesh(colGeo, mCol, N * stories); let k = 0; const m4 = new THREE.Matrix4();
  const arch = arcadeTex({ n: N, tiers: 1, open: true, h: 96 });
  const archMat = new THREE.MeshStandardMaterial({ map: arch, roughness: 0.6, alphaTest: 0.5, side: THREE.DoubleSide });
  for (let s = 0; s < stories; s++) {
    const y = h0 + s * hs;
    add(tower, new THREE.CylinderGeometry(r * 0.84, r * 0.84, hs, 36), mCore, 0, y + hs / 2, 0);
    for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; m4.makeTranslation(Math.sin(a) * r * 0.97, y + hs * 0.37, Math.cos(a) * r * 0.97); cols.setMatrixAt(k++, m4); }
    add(tower, new THREE.CylinderGeometry(r * 0.99, r * 0.99, hs * 0.3, 48, 1, true), archMat, 0, y + hs * 0.82, 0);
    add(tower, new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.08, 48), mW, 0, y + hs, 0);
    add(tower, new THREE.CylinderGeometry(r * 1.0, r * 1.0, 0.06, 48), mW, 0, y + 0.03, 0);
  }
  tower.add(cols);
  // bell chamber
  const yb = h0 + stories * hs, tb = arcadeTex({ n: 12, tiers: 1, h: 110 });
  add(tower, new THREE.CylinderGeometry(r * 0.64, r * 0.64, hb * 0.82, 36), [new THREE.MeshStandardMaterial({ map: tb, roughness: 0.6 }), mW, mW], 0, yb + hb * 0.41, 0);
  add(tower, new THREE.CylinderGeometry(r * 0.7, r * 0.7, 0.08, 36), mW, 0, yb + hb * 0.82, 0);
  add(tower, new THREE.CylinderGeometry(r * 0.5, r * 0.6, hb * 0.18, 24), M(0xd9d2c6, 0.7), 0, yb + hb * 0.91, 0);
  tower.position.x = -r; hinge.position.x = r;   // pivot on the +x foot: positive lean tips toward +x
  shadowAll(hinge);
  const g = new THREE.Group(); g.add(hinge);
  g.userData = {
    hinge, tower, r, h,
    /** lean in degrees about the +x foot (z axis); fall = 90 lies it on the ground. */
    setLean(deg) { hinge.rotation.z = -deg * D2R; },
    top() { const v = new THREE.Vector3(0, h, 0); tower.localToWorld(v); return v; },
  };
  return g;
}

export function makeDuomo({ L = 13, Wd = 4.6, H = 4.6 } = {}) {
  const g = new THREE.Group();
  const side = arcadeTex({ n: 14, tiers: 2, h: 90, stripes: 10 }), front = arcadeTex({ n: 6, tiers: 4, h: 64, stripes: 8 });
  const mS = new THREE.MeshStandardMaterial({ map: side, roughness: 0.6 }), mF = new THREE.MeshStandardMaterial({ map: front, roughness: 0.6 }), mW = M(0xf1ede4, 0.6), lead = M(0x8b8f94, 0.7);
  add(g, new THREE.BoxGeometry(L, H, Wd), [mF, mF, mW, mW, mS, mS], 0, H / 2, 0);   // nave (front faces ±x)
  const roof = (len, w, y, x = 0, z = 0, rot = 0) => {
    const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.1, 0); s.lineTo(0, w * 0.32); s.lineTo(w / 2 + 0.1, 0); s.lineTo(-w / 2 - 0.1, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }); geo.translate(0, 0, -len / 2);
    const m = add(g, geo, lead, x, y, z); m.rotation.y = rot + Math.PI / 2; return m;
  };
  roof(L + 0.2, Wd, H);
  // aisles (lower, wider)
  add(g, new THREE.BoxGeometry(L, H * 0.62, Wd * 1.6), [mF, mF, lead, mW, mS, mS], 0, H * 0.31, 0);
  // transept
  add(g, new THREE.BoxGeometry(Wd * 0.9, H * 0.9, Wd * 2.8), [mS, mS, mW, mW, mF, mF], L * 0.12, H * 0.45, 0);
  roof(Wd * 2.8, Wd * 0.9, H * 0.9, L * 0.12, 0, Math.PI / 2);
  // dome on a drum at the crossing
  add(g, new THREE.CylinderGeometry(1.35, 1.35, 1.0, 24), mW, L * 0.12, H + 0.6, 0);
  const d = add(g, new THREE.SphereGeometry(1.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lead, L * 0.12, H + 1.1, 0); d.scale.y = 1.15;
  add(g, new THREE.CylinderGeometry(0.18, 0.22, 0.6, 10), mW, L * 0.12, H + 2.75, 0);
  // facade gable (front at +x)
  const fs = new THREE.Shape(); fs.moveTo(-Wd / 2, 0); fs.lineTo(0, 1.6); fs.lineTo(Wd / 2, 0); fs.lineTo(-Wd / 2, 0);
  const fg = add(g, new THREE.ExtrudeGeometry(fs, { depth: 0.3, bevelEnabled: false }), mW, L / 2 - 0.3, H, 0); fg.rotation.y = Math.PI / 2;
  return shadowAll(g);
}

export function makeBaptistery({ r = 2.4, h = 3.0 } = {}) {
  const g = new THREE.Group(), mW = M(0xf1ede4, 0.6);
  const t = arcadeTex({ n: 20, tiers: 2, h: 90, stripes: 10 });
  add(g, new THREE.CylinderGeometry(r, r * 1.02, h, 48), [new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), mW, mW], 0, h / 2, 0);
  add(g, new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.12, 48), mW, 0, h, 0);
  const dome = add(g, new THREE.SphereGeometry(r * 0.98, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8cfc0, 0.7), 0, h, 0); dome.scale.y = 0.95;
  const top = add(g, new THREE.SphereGeometry(r * 0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xa6705a, 0.7), 0, h + r * 0.85, 0); top.scale.y = 1.2;
  add(g, new THREE.CylinderGeometry(0.12, 0.16, 0.6, 10), mW, 0, h + r * 1.32, 0);
  return shadowAll(g);
}

export function makeCityWall(len = 20, { h = 1.6, t = 0.6, color = 0xc9a07a } = {}) {
  const g = new THREE.Group(), m = M(color, 0.9);
  add(g, new THREE.BoxGeometry(len, h, t), m, 0, h / 2, 0);
  const n = Math.floor(len / 0.7), mer = new THREE.InstancedMesh(new THREE.BoxGeometry(0.38, 0.36, t), m, n), m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m4.makeTranslation(-len / 2 + 0.35 + i * 0.7, h + 0.18, 0); mer.setMatrixAt(i, m4); }
  g.add(mer);
  return shadowAll(g);
}

/** The Colosseum (elliptical, 3 arcade tiers + attic) with an oven conversion: a brick dome, a chimney and glowing arches. */
export function makeColosseum({ rx = 5.6, rz = 4.6, h = 3.6, seed = 2 } = {}) {
  const g = new THREE.Group(), R = rng(seed), stone = 0xd9c49d;
  const outer = arcadeTex({ n: 40, tiers: 3, h: 96, wall: '#dcc69e', band: '#c7ad80', dark: '#5b4a3a' });
  const glowT = arcadeTex({ n: 40, tiers: 3, h: 96, glow: true });
  const oMat = new THREE.MeshStandardMaterial({ map: outer, roughness: 0.85, emissiveMap: glowT, emissive: 0xff7a2a, emissiveIntensity: 0, side: THREE.DoubleSide });
  const ow = add(g, new THREE.CylinderGeometry(1, 1, h, 80, 1, true), oMat, 0, h / 2, 0); ow.scale.set(rx, 1, rz);
  const att = add(g, new THREE.CylinderGeometry(1, 1, h * 0.18, 80, 1, true), M(stone, 0.85, { side: THREE.DoubleSide }), 0, h + h * 0.09, 0); att.scale.set(rx, 1, rz);
  const iw = add(g, new THREE.CylinderGeometry(1, 1, h * 0.8, 64, 1, true), M(0xc7b08a, 0.9, { side: THREE.DoubleSide }), 0, h * 0.4, 0); iw.scale.set(rx * 0.72, 1, rz * 0.68);
  // seating ring between the walls (a sloped annulus)
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.72, h * 0.6, 80, 1, true), M(0xcdb58e, 0.9, { side: THREE.DoubleSide })); ring.position.y = h * 0.62; ring.scale.set(rx * 0.99, 1, rz * 0.99); g.add(ring);
  const top = new THREE.Mesh(new THREE.RingGeometry(0.72, 1, 80), M(stone, 0.9, { side: THREE.DoubleSide })); top.rotation.x = -Math.PI / 2; top.position.y = h * 1.18; top.scale.set(rx, rz, 1); g.add(top);
  const arena = new THREE.Mesh(new THREE.CircleGeometry(1, 64), M(0xd8b98a, 0.95)); arena.rotation.x = -Math.PI / 2; arena.position.y = 0.05; arena.scale.set(rx * 0.7, rz * 0.66, 1); g.add(arena);
  // the oven: brick dome + chimney (hidden until setOven)
  const bc = document.createElement('canvas'); bc.width = 512; bc.height = 256; const bg = bc.getContext('2d');
  bg.fillStyle = '#b8583a'; bg.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < 512; x += 32) { bg.fillStyle = ['#c6643f', '#ad4f33', '#cf7449', '#b85a3a'][Math.floor(R() * 4)]; bg.fillRect(x + 1, y + 1, 30, 14); }
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(5, 2);
  const oven = new THREE.Group(); oven.position.y = h * 1.18; g.add(oven);
  const dome = add(oven, new THREE.SphereGeometry(1, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 })); dome.scale.set(rx * 1.0, h * 1.25, rz * 1.0);
  const chim = add(oven, new THREE.CylinderGeometry(0.45, 0.55, 2.4, 16), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 }), rx * 0.35, h * 1.2, -rz * 0.2);
  // mouth: a glowing arch at the front (+z)
  const mouth = add(oven, new THREE.CircleGeometry(1.1, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffa040 }), 0, 0.02, rz * 0.98);
  shadowAll(g); mouth.castShadow = false;
  g.userData = {
    oven, dome, chim, mouth, rx, rz, h, outerMat: oMat,
    setOven(build = 0, glow = 0) {
      oven.visible = build > 0.001; dome.scale.y = h * 1.25 * Math.max(0.001, build);
      chim.visible = build > 0.6; chim.scale.y = Math.max(0.01, (build - 0.6) / 0.4);
      chim.position.y = h * 1.25 * build * 0.72 + 1.2 * chim.scale.y - 0.2;
      mouth.visible = build > 0.95; mouth.material.color.setRGB(1, 0.55 + 0.25 * glow, 0.2 + 0.2 * glow);
      oMat.emissiveIntensity = glow * 1.6;
    },
  };
  g.userData.setOven(0, 0);
  return g;
}
