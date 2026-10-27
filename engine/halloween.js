// HALLOWEEN KIT (built for 023, Pip ep. 2 "trick-or-treating"; reusable for any October episode).
//
//   dressHalloween(studio, sub, opts) — turns suburb.js (sub = buildSuburb(...)) into a trick-or-treat street at dusk: a violet →
//     tangerine sky with a big moon, autumn trees, porch steps, porch lanterns, carved jack-o'-lanterns, string lights, window glow
//     (with paper bats), cobwebs, hay bales, ghosts in the trees, street lamps. Every house can be lit on its own:
//     hw.houses[i].setLit(k) (0 = dark, 1 = full Halloween) — cascade them for "the whole street lit up".
//     opts.dark = [i, ...] houses that start bare + dark (023's grumpy house); opts.keep = { [i]: { noJacks, noStrings } }.
//     hw.groundY(x, z) = floor height for people/Pip on walks, steps and porches of the near-side lots.
//   makeJackOLantern({ r, carved, face }) → { g, setLit(k) }   (emissive carved face; lit = glows + blooms)
//   makeCandyHeap({ n, r, size, seed }) → { mesh, setFill(n), slot(i) }   (instanced wrapped candies in a mound)
//   makeCandyBowl({ r, color }) → { g, heap }      makeBone({ len }) → group (a bone-shaped dog biscuit)
//   makePumpkinCostume(pip) → { shell, hat, heap, setOn(k) }   (Pip IS the candy bucket: a ribbed pumpkin over his body with an
//     open top that the candy piles into, a leafy ruff, and a stem cap between his ears)
//   makeInflatableCat() → { g, setDeflate(k, t), update(t) }   (3.6 m black cat with a witch hat; deflate = a slow comic slump)
//   makeSkeleton() → { g, bowl, legBone, setCollapse(k, t), parts }   (cartoon porch skeleton holding a candy bowl)
//   costume(P, kind) — dress a rig: 'witch' | 'ghost' | 'dino' | 'hero' | 'skeleton' | 'pumpkin' | 'vampire' | 'catEars'
//   makeCobweb(s), makeSign(text, o), makeStringLights(pts, colors) → { g, setLit(k) }, makeFlyingCandy(parent, n)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, lerp, mat, mk, canvasTex, rng } from '@engine/core.js';

const PI = Math.PI;
const SW_H = 0.12;
const CANDY_COLS = [0xe2453c, 0xf2b632, 0x8f5bd1, 0x3fae6a, 0x3d8be0, 0xf07a2a, 0xf4f0e8, 0xe86aa0, 0x6a4a32];

// ---------------------------------------------------------------- pumpkins
/** Ribbed pumpkin sphere: lobes around y (ribs), squashed. */
export function pumpkinGeo(r, ribs = 8, depth = 0.08, squash = 0.8, seg = [40, 24]) {
  const g = new THREE.SphereGeometry(r, seg[0], seg[1]), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const phi = Math.atan2(v.z, -v.x), k = 1 - depth * (0.5 - 0.5 * Math.cos(ribs * phi));
    const ny = v.y / r, dimple = 1 - 0.18 * Math.pow(Math.abs(ny), 6);
    p.setXYZ(i, v.x * k, v.y * squash * dimple, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}
let _jack = null;
function jackMaps() {
  if (_jack) return _jack;
  // equirect skin: +z (the face) sits at u = 0.25 on a SphereGeometry
  const face = (g, w, h, fill) => {
    const cx = w * 0.25, cy = h * 0.47, s = w / 512;
    g.fillStyle = fill;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 34 * s, cy - 44 * s); g.lineTo(cx + sx * 8 * s, cy - 14 * s); g.lineTo(cx + sx * 46 * s, cy - 12 * s); g.closePath(); g.fill(); }
    g.beginPath(); g.moveTo(cx, cy - 6 * s); g.lineTo(cx - 8 * s, cy + 8 * s); g.lineTo(cx + 8 * s, cy + 8 * s); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - 52 * s, cy + 16 * s);
    g.quadraticCurveTo(cx, cy + 74 * s, cx + 52 * s, cy + 16 * s);
    g.lineTo(cx + 30 * s, cy + 30 * s); g.lineTo(cx + 22 * s, cy + 20 * s); g.lineTo(cx + 12 * s, cy + 34 * s);
    g.lineTo(cx - 12 * s, cy + 34 * s); g.lineTo(cx - 22 * s, cy + 20 * s); g.lineTo(cx - 30 * s, cy + 30 * s); g.closePath(); g.fill();
  };
  const skin = (carved) => canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#e8781e'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 8; k++) { const x = (1 / 16 + k / 8) * w; const gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, 'rgba(120,40,0,0)'); gr.addColorStop(0.5, 'rgba(120,40,0,.45)'); gr.addColorStop(1, 'rgba(120,40,0,0)'); g.fillStyle = gr; g.fillRect(x - 22, 0, 44, h); }
    const R = rng(5); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,${180 + R() * 60},90,${0.05 + R() * 0.08})`; g.fillRect(R() * w, R() * h, 2, 6); }
    if (carved) { g.shadowColor = '#ffcf5a'; g.shadowBlur = 6; face(g, w, h, '#ffd25c'); }
  });
  const glow = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.shadowColor = '#fff'; g.shadowBlur = 10; face(g, w, h, '#fff'); });
  _jack = { plain: skin(false), carved: skin(true), glow };
  return _jack;
}
const _pgeo = {};
/** A pumpkin; carved ones glow (emissive face). setLit(k) 0..1. */
export function makeJackOLantern({ r = 0.16, carved = true, squash = 0.8, stemColor = 0x5a6a2a } = {}) {
  const J = jackMaps(), g = new THREE.Group();
  const key = `${r}|${squash}`; const geo = _pgeo[key] || (_pgeo[key] = pumpkinGeo(r, 8, 0.08, squash));
  const m = new THREE.MeshStandardMaterial({ map: carved ? J.carved : J.plain, roughness: 0.62, emissive: 0xffa040, emissiveMap: carved ? J.glow : null, emissiveIntensity: 0 });
  const body = mk(geo, m, g, 0, r * squash, 0);
  const stem = mk(new THREE.CylinderGeometry(r * 0.09, r * 0.14, r * 0.42, 8), mat(stemColor, 0.8), g, 0, r * squash * 1.86, 0); stem.rotation.z = 0.25;
  const setLit = (k) => { m.emissiveIntensity = carved ? 3.2 * k : 0; };
  setLit(0);
  return { g, body, setLit, mat: m };
}

// ---------------------------------------------------------------- candy
let _candyGeo = null;
function candyGeo() {
  if (_candyGeo) return _candyGeo;
  const c = new THREE.CapsuleGeometry(0.0085, 0.017, 4, 10); c.rotateZ(PI / 2);
  const parts = [c];
  for (const s of [-1, 1]) { const t = new THREE.ConeGeometry(0.0075, 0.012, 8); t.rotateZ(s * PI / 2); t.translate(s * 0.022, 0, 0); parts.push(t); }
  _candyGeo = mergeGeometries(parts.map((p) => p.toNonIndexed()));
  _candyGeo.computeVertexNormals();
  return _candyGeo;
}
const _cm = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _ce = new THREE.Euler(), _cv = new THREE.Vector3(), _cs = new THREE.Vector3();
/** Instanced candy mound: slots fill bottom-up in rings (center r → narrower layers). setFill(n) shows the first n. */
export function makeCandyHeap({ n = 48, r = 0.06, size = 1, seed = 7, layer = 0.013, flat = 0 } = {}) {
  const geo = candyGeo(), m = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 });
  const mesh = new THREE.InstancedMesh(geo, m, n); mesh.castShadow = true; mesh.receiveShadow = true;
  const R = rng(seed), slots = [];
  const n0 = Math.max(3, Math.round((r * r) / (0.0145 * 0.0145 * size * size) * 0.75));
  let L = 0;
  while (slots.length < n) {
    const per = Math.max(3, Math.round(n0 * Math.max(0.15, 1 - L * (flat ? 0.08 : 0.17)))), rr = r * Math.sqrt(per / n0);
    for (let k = 0; k < per && slots.length < n; k++) {
      const a = k * 2.399 + L * 0.7, d = rr * Math.sqrt((k + 0.5) / per);
      slots.push({ p: new THREE.Vector3(Math.cos(a) * d, L * layer * size + 0.006 * size, Math.sin(a) * d), e: new THREE.Euler((R() - 0.5) * 0.9, R() * PI * 2, (R() - 0.5) * 0.9) });
    }
    L++;
  }
  slots.forEach((s, i) => {
    _cq.setFromEuler(s.e); _cs.setScalar(size * (0.9 + 0.25 * R()));
    _cm.compose(s.p, _cq, _cs); mesh.setMatrixAt(i, _cm);
    mesh.setColorAt(i, new THREE.Color(CANDY_COLS[Math.floor(R() * CANDY_COLS.length)]));
  });
  mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  const setFill = (k) => { mesh.count = Math.max(0, Math.min(n, Math.round(k))); mesh.visible = mesh.count > 0; };
  setFill(n);
  return { mesh, setFill, slot: (i) => slots[Math.min(i, n - 1)].p, n };
}
/** Free-flying candies (showers, tosses, a shake): place(i, pos, spin) each frame, hideFrom(k). */
export function makeFlyingCandy(parent, n = 60, size = 1, seed = 11) {
  const mesh = new THREE.InstancedMesh(candyGeo(), new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 }), n);
  const R = rng(seed); for (let i = 0; i < n; i++) mesh.setColorAt(i, new THREE.Color(CANDY_COLS[Math.floor(R() * CANDY_COLS.length)]));
  mesh.instanceColor.needsUpdate = true; mesh.castShadow = true; mesh.frustumCulled = false; parent.add(mesh);
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const api = {
    mesh,
    place(i, pos, spin = 0) { _ce.set(spin * 1.3 + i, spin * 0.7 + i * 2.1, spin + i * 0.37); _cq.setFromEuler(_ce); _cs.setScalar(size); _cm.compose(pos, _cq, _cs); mesh.setMatrixAt(i, _cm); },
    hide(i) { mesh.setMatrixAt(i, hide); },
    hideAll() { for (let i = 0; i < n; i++) mesh.setMatrixAt(i, hide); mesh.instanceMatrix.needsUpdate = true; },
    commit() { mesh.instanceMatrix.needsUpdate = true; },
    n,
  };
  api.hideAll();
  return api;
}
/** A plastic candy bowl with a mound in it. */
export function makeCandyBowl({ r = 0.17, color = 0xf07a2a, n = 60, seed = 3 } = {}) {
  const g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(new THREE.Vector2(r * (0.45 + 0.55 * Math.sin(u * PI / 2)), r * 0.55 * u)); }
  const bowl = mk(new THREE.LatheGeometry(pts, 32), mat(color, 0.35, { side: THREE.DoubleSide }), g);
  mk(new THREE.TorusGeometry(r, r * 0.04, 8, 32), mat(color, 0.35), g, 0, r * 0.55, 0).rotation.x = PI / 2;
  const heap = makeCandyHeap({ n, r: r * 0.85, size: 1.15, seed, layer: 0.012 }); heap.mesh.position.y = r * 0.12; g.add(heap.mesh);
  return { g, heap, r };
}
/** A bone-shaped dog biscuit (lies along x). */
export function makeBone({ len = 0.14, color = 0xe2b778 } = {}) {
  const g = new THREE.Group(), r = len * 0.1;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(140,90,40,${0.15 + R() * 0.25})`; c.beginPath(); c.arc(R() * w, R() * h, 0.8 + R() * 1.4, 0, 7); c.fill(); } }, [2, 1]) });
  const shaft = mk(new THREE.CapsuleGeometry(r, len * 0.6, 6, 14), m, g); shaft.rotation.z = PI / 2; shaft.scale.set(1, 1, 0.75);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const k = mk(new THREE.SphereGeometry(r * 1.45, 16, 12), m, g, sx * len * 0.42, sy * r * 1.05, 0); k.scale.set(1, 1, 0.78); }
  return g;
}

// ---------------------------------------------------------------- Pip's pumpkin costume (he IS the bucket)
let _suit = null;
function suitTex() {
  if (_suit) return _suit;
  _suit = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#f2690c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 8; k++) { const x = (1 / 16 + k / 8) * w; const gr = g.createLinearGradient(x - 18, 0, x + 18, 0); gr.addColorStop(0, 'rgba(110,30,0,0)'); gr.addColorStop(0.5, 'rgba(110,30,0,.7)'); gr.addColorStop(1, 'rgba(110,30,0,0)'); g.fillStyle = gr; g.fillRect(x - 18, 0, 36, h); }
    for (let k = 0; k < 8; k++) { const x = (k / 8 + 0.0) * w; const gr = g.createLinearGradient(x - 26, 0, x + 26, 0); gr.addColorStop(0, 'rgba(255,190,90,0)'); gr.addColorStop(0.5, 'rgba(255,190,90,.35)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(x - 26, 0, 52, h); }
    // a printed jack-o'-lantern face on each flank (+x at u = 0.5, −x across the seam at u = 0 / 1)
    const face = (cx) => {
      const cy = h * 0.5, s = 0.85; g.fillStyle = '#1e0f08';
      for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 30 * s, cy - 40 * s); g.lineTo(cx + sx * 6 * s, cy - 10 * s); g.lineTo(cx + sx * 44 * s, cy - 8 * s); g.closePath(); g.fill(); }
      g.beginPath(); g.moveTo(cx - 50 * s, cy + 12 * s); g.quadraticCurveTo(cx, cy + 70 * s, cx + 50 * s, cy + 12 * s);
      g.lineTo(cx + 28 * s, cy + 24 * s); g.lineTo(cx + 18 * s, cy + 14 * s); g.lineTo(cx + 8 * s, cy + 26 * s); g.lineTo(cx - 8 * s, cy + 26 * s); g.lineTo(cx - 18 * s, cy + 14 * s); g.lineTo(cx - 28 * s, cy + 24 * s); g.closePath(); g.fill();
    };
    face(w * 0.5); face(0); face(w);
  });
  return _suit;
}
export function makePumpkinCostume(pip) {
  const orange = new THREE.MeshStandardMaterial({ map: suitTex(), roughness: 0.5 });
  const shell = new THREE.Group(); pip.T.add(shell);
  const body = mk(pumpkinGeo(0.135, 8, 0.1, 0.92), orange, shell); body.scale.set(1.12, 1.04, 1.24); body.position.set(0, 0.012, -0.012);
  // open top on the back: a dark hole + a rim the candy piles into
  const hole = mk(new THREE.CircleGeometry(0.058, 24), mat(0x3a1a06, 0.9), shell, 0, 0.114, -0.035); hole.rotation.x = -PI / 2; hole.scale.set(1, 1.3, 1);
  const rim = mk(new THREE.TorusGeometry(0.058, 0.009, 8, 28), mat(0xd8541a, 0.5), shell, 0, 0.114, -0.035); rim.rotation.x = PI / 2; rim.scale.set(1, 1.3, 1);
  const heap = makeCandyHeap({ n: 44, r: 0.052, size: 0.95, seed: 23, layer: 0.0125 }); heap.mesh.position.set(0, 0.107, -0.035); heap.mesh.scale.set(1, 1, 1.25); shell.add(heap.mesh);
  heap.setFill(0);
  // leafy ruff where his neck comes out
  const leafM = mat(0x4f8a3a, 0.75);
  const ruff = new THREE.Group(); ruff.position.set(0, 0.075, 0.118); ruff.rotation.x = -0.75; shell.add(ruff);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * PI * 2; const l = mk(new THREE.SphereGeometry(0.03, 10, 8), leafM, ruff, Math.cos(a) * 0.05, 0, Math.sin(a) * 0.045); l.scale.set(1.0, 0.35, 0.7); l.rotation.y = -a; }
  // stem cap between the ears + a leaf + a curly vine
  const hat = new THREE.Group(); pip.anchors.hat.add(hat);
  mk(new THREE.SphereGeometry(0.03, 14, 10), leafM, hat, 0, 0.004, 0).scale.set(1.2, 0.45, 1.2);
  const stem = mk(new THREE.CylinderGeometry(0.012, 0.019, 0.065, 8), mat(0x5a6a2a, 0.8), hat, 0, 0.034, 0); stem.rotation.z = -0.25;
  const leaf = mk(new THREE.SphereGeometry(0.026, 12, 8), mat(0x5aa04a, 0.7), hat, 0.026, 0.03, 0.006); leaf.scale.set(1.3, 0.22, 0.75); leaf.rotation.z = 0.45;
  const vine = mk(new THREE.TorusGeometry(0.012, 0.0022, 6, 18, PI * 1.6), mat(0x4f8a3a, 0.7), hat, -0.02, 0.03, 0.0); vine.rotation.y = PI / 2;
  const setOn = (k) => { const s = Math.max(0.0001, k); shell.scale.setScalar(s); hat.scale.setScalar(s); shell.visible = hat.visible = k > 0.001; };
  return { shell, hat, heap, leaf, setOn };
}

// ---------------------------------------------------------------- the giant inflatable cat (lawn decoration)
export function makeInflatableCat({ color = 0x2a2238 } = {}) {
  const g = new THREE.Group();
  const satin = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.05, emissive: 0x1c1030, emissiveIntensity: 0.6 });
  const belly = new THREE.MeshStandardMaterial({ color: 0x4a3a64, roughness: 0.35, emissive: 0x2a1a44, emissiveIntensity: 0.5 });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0xe8f070, emissive: 0xd8f060, emissiveIntensity: 1.6, roughness: 0.3 });
  const dark = mat(0x0c0a10, 0.3), pink = mat(0xf08aa8, 0.5), white = mat(0xf4f1ea, 0.5);
  mk(new THREE.BoxGeometry(0.42, 0.24, 0.42), mat(0x222226, 0.6), g, 0, 0.12, -0.55);   // the blower
  const bodyP = new THREE.Group(); g.add(bodyP);
  const body = mk(new THREE.SphereGeometry(1, 36, 24), satin, bodyP); body.scale.set(0.82, 1.05, 0.74);
  const bel = mk(new THREE.SphereGeometry(0.6, 28, 18), belly, bodyP, 0, -0.05, 0.42); bel.scale.set(0.95, 1.2, 0.5);
  const paws = [-1, 1].map((s) => { const p = mk(new THREE.SphereGeometry(0.22, 18, 12), satin, g, s * 0.32, 0.18, 0.62); p.scale.set(1, 0.8, 1.35); return p; });
  const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.3, -0.85, -0.55), new THREE.Vector3(0.95, -0.75, -0.2), new THREE.Vector3(1.05, -0.3, 0.3), new THREE.Vector3(0.85, 0.2, 0.55), new THREE.Vector3(0.95, 0.55, 0.5)]);
  mk(new THREE.TubeGeometry(tailCurve, 30, 0.13, 12), satin, bodyP);
  const headP = new THREE.Group(); g.add(headP);
  const head = mk(new THREE.SphereGeometry(0.62, 32, 22), satin, headP); head.scale.set(1.12, 0.95, 0.95);
  const muzzle = mk(new THREE.SphereGeometry(0.26, 20, 14), belly, headP, 0, -0.17, 0.48); muzzle.scale.set(1.25, 0.7, 0.6);
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(0.15, 20, 14), eyeM, headP, s * 0.25, 0.08, 0.5); e.scale.set(1, 1.15, 0.45);
    const p = mk(new THREE.SphereGeometry(0.085, 16, 10), dark, headP, s * 0.25, 0.06, 0.565); p.scale.set(0.85, 1.25, 0.4);
    mk(new THREE.SphereGeometry(0.03, 8, 6), white, headP, s * 0.25 + 0.035, 0.13, 0.6);
    for (const k of [-1, 1]) { const w = mk(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 5), white, headP, s * 0.42, -0.16 + k * 0.035, 0.5); w.rotation.z = PI / 2 + s * k * 0.12; }
    const ear = new THREE.Group(); ear.position.set(s * 0.36, 0.42, -0.02); ear.rotation.z = -s * 0.32; headP.add(ear);
    mk(new THREE.ConeGeometry(0.22, 0.45, 18), satin, ear, 0, 0.18, 0).scale.set(1, 1, 0.55);
    mk(new THREE.ConeGeometry(0.12, 0.28, 14), pink, ear, 0, 0.14, 0.05).scale.set(1, 1, 0.3);
  }
  mk(new THREE.SphereGeometry(0.055, 12, 8), pink, headP, 0, -0.1, 0.62).scale.set(1.3, 0.8, 0.7);
  for (const s of [-1, 1]) { const a = mk(new THREE.TorusGeometry(0.05, 0.012, 6, 14, PI), dark, headP, s * 0.05, -0.2, 0.6); a.rotation.z = PI; }
  // witch hat
  const hat = new THREE.Group(); hat.position.set(0.05, 0.5, -0.05); hat.rotation.z = -0.18; headP.add(hat);
  const hatM = new THREE.MeshStandardMaterial({ color: 0x3a2a5a, roughness: 0.4, emissive: 0x1a1030, emissiveIntensity: 0.5 });
  mk(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 32), hatM, hat);
  const cone = mk(new THREE.ConeGeometry(0.34, 0.85, 24), hatM, hat, 0, 0.43, 0); cone.rotation.z = 0.12;
  mk(new THREE.CylinderGeometry(0.33, 0.35, 0.1, 24), mat(0xf07a2a, 0.5, { emissive: 0x803000, emissiveIntensity: 0.4 }), hat, 0, 0.08, 0);
  const API = { g, body: bodyP, head: headP, hat, paws };
  API.setDeflate = (k, t = 0) => {
    const e = clamp(k), wob = Math.sin(e * PI) * 0.06 * Math.sin(t * 9);
    bodyP.scale.set(1 + 0.32 * e + wob, 1 - 0.74 * e, 1 + 0.25 * e - wob);
    bodyP.position.set(0, 1.08 * (1 - 0.74 * e) + 0.02, 0);
    bodyP.rotation.x = 0.25 * e;
    const fall = e < 0.6 ? e / 0.6 : 1, bounce = e > 0.6 ? Math.sin(((e - 0.6) / 0.4) * PI) * 0.08 : 0;
    const f = fall * fall;
    headP.position.set(0.15 * f, lerp(2.42, 0.42, f) + bounce, lerp(0.05, 1.25, f));
    headP.rotation.set(0.55 * f, 0, 0.5 * f + wob);
    headP.scale.set(1 + 0.1 * e, 1 - 0.35 * e, 1);
    paws.forEach((p) => p.scale.set(1 + 0.3 * e, 0.8 - 0.5 * e, 1.35));
    hat.rotation.z = -0.18 - 0.6 * e;
  };
  API.update = (t) => { if (bodyP.scale.y > 0.99) { bodyP.rotation.z = 0.02 * Math.sin(t * 1.1); headP.rotation.z = 0.04 * Math.sin(t * 1.1 + 0.4); } };
  API.setDeflate(0);
  return API;
}

// ---------------------------------------------------------------- the porch skeleton (holds a candy bowl; collapses into a pile)
export function makeSkeleton({ seed = 9 } = {}) {
  const g = new THREE.Group(), bone = mat(0xf2ede0, 0.55), dark = mat(0x1a1416, 0.5);
  const R = rng(seed), parts = [];
  const part = (build, stand, pile, delay = 0) => { const p = new THREE.Group(); build(p); g.add(p); const o = { p, stand, pile, delay }; parts.push(o); return o; };
  const capsule = (L, r) => (p) => { const c = mk(new THREE.CapsuleGeometry(r, L, 6, 10), bone, p); for (const s of [-1, 1]) mk(new THREE.SphereGeometry(r * 1.5, 10, 8), bone, p, 0, s * L / 2, 0); return c; };
  const S = (x, y, z, rx = 0, ry = 0, rz = 0) => ({ p: new THREE.Vector3(x, y, z), r: new THREE.Euler(rx, ry, rz) });
  const P = (x, z, ry) => S(x, 0.035, z, PI / 2, ry, 0);
  // skull + top hat
  const skull = part((p) => {
    const s = mk(new THREE.SphereGeometry(0.12, 24, 18), bone, p); s.scale.set(1, 1.05, 1);
    mk(new RoundedBoxGeometry(0.13, 0.06, 0.1, 2, 0.02), bone, p, 0, -0.095, 0.03);
    for (const sx of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.034, 12, 10), dark, p, sx * 0.045, 0.01, 0.1); e.scale.set(1, 1.2, 0.5); }
    mk(new THREE.ConeGeometry(0.016, 0.03, 3), dark, p, 0, -0.04, 0.115).rotation.x = PI;
    for (let i = -2; i <= 2; i++) mk(new THREE.BoxGeometry(0.012, 0.018, 0.008), mat(0xfffbf0, 0.4), p, i * 0.018, -0.085, 0.082);
  }, S(0, 1.6, 0), S(-0.5, 0.115, 0.22, 0, 0.6, -1.2), 0.12);
  const hat = part((p) => {
    mk(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 24), dark, p);
    mk(new THREE.CylinderGeometry(0.1, 0.105, 0.16, 24), dark, p, 0, 0.085, 0);
    mk(new THREE.CylinderGeometry(0.106, 0.106, 0.035, 24), mat(0xf07a2a, 0.5), p, 0, 0.025, 0);
  }, S(0.01, 1.72, -0.01, 0, 0, -0.12), S(-0.32, 0.1, 0.3, 0, 0, 1.4), 0.1);
  part((p) => { for (let i = 0; i < 6; i++) mk(new THREE.SphereGeometry(0.022, 8, 6), bone, p, 0, i * 0.075, 0); }, S(0, 0.98, -0.04), P(-0.1, 0.15, 0.5), 0.07);
  part((p) => { for (let i = 0; i < 4; i++) { const r = mk(new THREE.TorusGeometry(0.13 - i * 0.012, 0.012, 6, 20, PI * 1.6), bone, p, 0, -i * 0.055, 0); r.rotation.set(PI / 2, 0, PI * 0.7); r.scale.set(1, 0.72, 1); } }, S(0, 1.36, 0), S(-0.08, 0.06, 0.05, 0.3, 0.4, 0.2), 0.08);
  part((p) => { const t = mk(new THREE.TorusGeometry(0.09, 0.025, 8, 18), bone, p); t.rotation.x = PI / 2; t.scale.set(1.2, 1, 0.8); }, S(0, 0.93, 0), S(0.12, 0.03, -0.1), 0.05);
  // arms: one holds the bowl out front, the other waves (the shot animates `wave`)
  const armL = [], armR = [];
  for (const s of [-1, 1]) {
    const up = part(capsule(0.24, 0.02), S(s * 0.17, 1.27, 0.02, s < 0 ? -0.7 : 0, 0, s * 0.12), P(s * 0.3 + 0.1, 0.35, R() * 3), 0.06);
    const fo = part(capsule(0.22, 0.017), s < 0 ? S(-0.19, 1.07, 0.18, -1.55, 0, -0.1) : S(0.18, 1.0, 0.03, -0.1, 0, 0.1), P(s * 0.45, -0.05, R() * 3), 0.05);
    (s < 0 ? armL : armR).push(up, fo);
  }
  // legs
  const legs = [];
  for (const s of [-1, 1]) {
    const fem = part(capsule(0.34, 0.025), S(s * 0.09, 0.69, 0), P(s * 0.25 - 0.05, 0.2 + s * 0.08, R() * 3), 0.02);
    const tib = part(capsule(0.32, 0.021), S(s * 0.1, 0.27, 0.01), P(s * 0.38, -0.12, R() * 3), 0.0);
    part((p) => mk(new RoundedBoxGeometry(0.07, 0.035, 0.13, 2, 0.012), bone, p), S(s * 0.1, 0.025, 0.04), S(s * 0.5, 0.02, 0.15, 0, R() * 3, 0), 0);
    legs.push(fem, tib);
  }
  const legBone = legs[1];   // the left tibia — the one Pip wants
  // the bowl (in the right hand, out front)
  const bowl = makeCandyBowl({ r: 0.15, color: 0x8f5bd1, n: 40, seed: 31 });
  bowl.g.position.set(-0.12, 1.0, 0.36); g.add(bowl.g);
  parts.forEach((o) => { o.p.position.copy(o.stand.p); o.p.rotation.copy(o.stand.r); });
  const API = { g, parts, bowl, legBone, hat, skull, armL, armR };
  /** k 0→1: the bones drop into a pile (lower bones first is wrong — everything drops, higher bones land later). */
  API.setCollapse = (k, t = 0) => {
    for (const o of parts) {
      if (o.free || o.taken) continue;
      const h = o.stand.p.y, d = clamp((k - o.delay * 0.6) / (0.45 + 0.35 * h / 1.7));
      const e = d * d, bounce = d > 0.85 ? Math.sin(((d - 0.85) / 0.15) * PI) * 0.03 : 0;
      o.p.position.lerpVectors(o.stand.p, o.pile.p, e); o.p.position.y += bounce;
      o.p.rotation.set(lerp(o.stand.r.x, o.pile.r.x, d), lerp(o.stand.r.y, o.pile.r.y, d), lerp(o.stand.r.z, o.pile.r.z, d));
    }
  };
  API.setCollapse(0);
  return API;
}

// ---------------------------------------------------------------- costumes for rigs
const _webTex = {};
/** A cobweb (alpha-textured plane, white threads). */
export function makeCobweb(s = 0.8) {
  const tex = _webTex.t || (_webTex.t = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6;
    const N = 9; for (let i = 0; i < N; i++) { const a = (i / (N - 1)) * PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * w, Math.sin(a) * h); g.stroke(); }
    for (let r = 26; r < w; r += 24) { g.beginPath(); for (let i = 0; i < N; i++) { const a = (i / (N - 1)) * PI / 2, rr = r * (0.94 + 0.06 * Math.sin(i * 2.3)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (!i) g.moveTo(x, y); else g.quadraticCurveTo(Math.cos(a - 0.1) * rr * 0.9, Math.sin(a - 0.1) * rr * 0.9, x, y); } g.stroke(); }
  }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.8 }));
  m.geometry.translate(s / 2, -s / 2, 0);
  return m;
}
/** Hand-painted sign on a stake or a board: makeSign('NO CANDY', { w, h, bg, fg, stake }) */
export function makeSign(text, { w = 0.6, h = 0.36, bg = '#efe2c4', fg = '#2a1a12', stake = 0.5, font = 'bold 70px Georgia', lines = null } = {}) {
  const g = new THREE.Group();
  const L = lines || [text];
  const tex = canvasTex(512, Math.round(512 * h / w), (c, cw, ch) => {
    c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 30; i++) c.fillRect(0, (i / 30) * ch, cw, 1);
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = font;
    L.forEach((ln, i) => { let f = parseInt(font.match(/(\d+)px/)[1]); c.font = font; while (c.measureText(ln).width > cw * 0.9 && f > 10) { f -= 2; c.font = font.replace(/\d+px/, f + 'px'); } c.fillText(ln, cw / 2, ch * (i + 0.5) / L.length + 4); });
  });
  const board = mk(new THREE.BoxGeometry(w, h, 0.025), [mat(0xb89a6a, 0.8), mat(0xb89a6a, 0.8), mat(0xb89a6a, 0.8), mat(0xb89a6a, 0.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mat(0xb89a6a, 0.8)], g, 0, stake + h / 2, 0);
  if (stake > 0) mk(new THREE.BoxGeometry(0.04, stake + h * 0.5, 0.03), mat(0x7a5a3a, 0.9), g, 0, (stake + h * 0.5) / 2, -0.03);
  return g;
}
/** Dress a makePerson rig (any scale). kinds: witch, ghost, dino, hero, skeleton, pumpkin, vampire, catEars. Returns the added parts. */
export function costume(P, kind, o = {}) {
  const hr = P.head.head.geometry.parameters.radius, hg = P.head.g, add = [];
  const hat = (color, band) => {
    const h = new THREE.Group(); h.position.set(0, hr * 0.62, -hr * 0.06); h.rotation.set(-0.12, 0, 0.1); hg.add(h);
    mk(new THREE.CylinderGeometry(hr * 1.85, hr * 1.85, hr * 0.06, 28), mat(color, 0.6), h);
    const c = mk(new THREE.ConeGeometry(hr * 0.95, hr * 2.3, 24), mat(color, 0.6), h, 0, hr * 1.15, 0); c.rotation.z = 0.08;
    mk(new THREE.CylinderGeometry(hr * 0.93, hr * 0.97, hr * 0.28, 24), mat(band, 0.5), h, 0, hr * 0.17, 0);
    add.push(h); return h;
  };
  const cape = (outside, inside, len = 0.95) => {
    const c = new THREE.Group(); c.position.set(0, 0.5, -0.02); P.spine.add(c);
    const geo = new THREE.CylinderGeometry(0.19, 0.34, len, 18, 6, true, PI - 1.25, 2.5); geo.translate(0, -len / 2, 0);
    mk(geo, mat(outside, 0.7, { side: THREE.FrontSide }), c); mk(geo, mat(inside, 0.6, { side: THREE.BackSide }), c);
    P.capeG = c; add.push(c); return c;
  };
  if (kind === 'witch') {
    P.mats.top.color.set(o.top ?? 0x6a3f9a); P.mats.pants.color.set(o.pants ?? 0x2a2433);
    hat(o.hat ?? 0x4a2a6a, o.band ?? 0xf07a2a); cape(o.cape ?? 0x5a2f8a, o.lining ?? 0xf07a2a, 0.85);
  } else if (kind === 'ghost') {
    const pts = [[0.001, 0.98], [0.1, 0.965], [0.18, 0.91], [0.215, 0.8], [0.22, 0.68], [0.27, 0.5], [0.3, 0.25], [0.32, -0.1], [0.35, -0.5]].map(([r, y]) => new THREE.Vector2(r, y));
    const geo = new THREE.LatheGeometry(pts, 28), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -0.3) { const a = Math.atan2(p.getZ(i), p.getX(i)); p.setY(i, y + 0.05 * Math.sin(a * 7) * (-0.3 - y) / 0.2); } }
    geo.computeVertexNormals();
    const sheet = new THREE.Group(); P.spine.add(sheet);
    mk(geo, mat(0xf6f3ee, 0.9, { side: THREE.DoubleSide }), sheet);
    for (const s of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.04, 12, 8), mat(0x141014, 0.4), sheet, s * 0.075, 0.79, 0.205); e.scale.set(0.8, 1.25, 0.4); }
    const mo = mk(new THREE.SphereGeometry(0.035, 12, 8), mat(0x141014, 0.4), sheet, 0, 0.68, 0.215); mo.scale.set(1, 1.2, 0.4);
    hg.visible = false; P.arms.forEach((a) => (a.shoulder.visible = false));
    P.sheet = sheet; add.push(sheet);
  } else if (kind === 'dino') {
    P.mats.top.color.set(0x5aa04a); P.mats.pants.color.set(0x4f8a3a);
    const hood = new THREE.Group(); hg.add(hood);
    const hm = mat(0x5aa04a, 0.8, { side: THREE.DoubleSide });
    const cap = mk(new THREE.SphereGeometry(hr * 1.18, 28, 16, 0, PI * 2, 0, PI * 0.58), hm, hood, 0, 0, -hr * 0.12); cap.rotation.x = -0.35;
    for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(hr * 0.26, 12, 10), mat(0xffffff, 0.4), hood, s * hr * 0.42, hr * 1.02, hr * 0.42); mk(new THREE.SphereGeometry(hr * 0.13, 10, 8), mat(0x141014, 0.4), hood, s * hr * 0.42, hr * 1.05, hr * 0.62); }
    for (let i = 0; i < 7; i++) { const tth = mk(new THREE.ConeGeometry(hr * 0.09, hr * 0.2, 6), mat(0xffffff, 0.5), hood, (i - 3) * hr * 0.24, hr * 0.62, hr * 0.98 - Math.abs(i - 3) * hr * 0.06); tth.rotation.x = PI; }
    for (let i = 0; i < 6; i++) { const sp = mk(new THREE.ConeGeometry(0.045, 0.1, 4), mat(0xf2b632, 0.6), P.spine, 0, 0.62 - i * 0.12, -0.15 - Math.sin(i * 0.5) * 0.02); sp.rotation.x = -0.5; add.push(sp); }
    add.push(hood);
  } else if (kind === 'hero') {
    P.mats.top.color.set(0x3d6fd9); P.mats.pants.color.set(0x2a3f8a);
    cape(0xd8352b, 0xb8251f, 0.85);
    const mask = mk(new THREE.TorusGeometry(hr * 1.0, hr * 0.12, 8, 30), mat(0x141014, 0.5), hg, 0, hr * 0.1, 0); mask.rotation.x = PI / 2; mask.scale.set(1.02, 1, 1.0);
    add.push(mask);
    const star = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 5), mat(0xf2c14e, 0.4), P.spine, 0, 0.36, 0.13); star.rotation.x = PI / 2; add.push(star);
  } else if (kind === 'skeleton') {
    const bones = (legs) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#16141a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f2ede0'; c.lineCap = 'round'; if (!legs) { c.lineWidth = 14; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(w / 2, 40 + i * 34, 70 - i * 6, 0.25 * PI, 0.75 * PI); c.stroke(); } c.lineWidth = 16; c.beginPath(); c.moveTo(w / 2, 20); c.lineTo(w / 2, 200); c.stroke(); } else { c.lineWidth = 22; c.beginPath(); c.moveTo(w / 2, 10); c.lineTo(w / 2, h - 10); c.stroke(); } });
    P.mats.top.color.set(0xffffff); P.mats.top.map = bones(false); P.mats.pants.color.set(0xffffff); P.mats.pants.map = bones(true);
    P.mats.top.needsUpdate = P.mats.pants.needsUpdate = true;
  } else if (kind === 'pumpkin') {
    P.mats.top.color.set(0xf07a2a); P.mats.pants.color.set(0x2a2433);
    const st = mk(new THREE.CylinderGeometry(hr * 0.15, hr * 0.25, hr * 0.5, 8), mat(0x4f8a3a, 0.7), hg, 0, hr * 1.15, 0); add.push(st);
  } else if (kind === 'vampire') {
    cape(0x141018, 0xb8251f, 1.1);
    const col = new THREE.Group(); col.position.set(0, 0.56, -0.04); P.spine.add(col);
    for (const s of [-1, 1]) { const f = mk(new THREE.PlaneGeometry(0.2, 0.24), mat(0xb8251f, 0.6, { side: THREE.DoubleSide }), col, s * 0.12, 0.08, 0.0); f.rotation.set(-0.2, s * 0.6, 0); }
    add.push(col);
  } else if (kind === 'catEars') {
    for (const s of [-1, 1]) { const e = mk(new THREE.ConeGeometry(hr * 0.32, hr * 0.62, 12), mat(0x1a1416, 0.6), hg, s * hr * 0.55, hr * 1.02, -hr * 0.05); e.rotation.z = -s * 0.35; e.scale.z = 0.55; mk(new THREE.ConeGeometry(hr * 0.18, hr * 0.36, 10), mat(0xf08aa8, 0.6), e, 0, -hr * 0.04, hr * 0.06).scale.z = 0.4; add.push(e); }
  }
  return add;
}

// ---------------------------------------------------------------- string lights
/** Bulbs along a polyline (points sag between them). setLit(k). */
export function makeStringLights(points, { colors = [0xff8a2a, 0xa060ff, 0xffc04a], step = 0.22, sag = 0.12, r = 0.028 } = {}) {
  const g = new THREE.Group(), pos = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1], L = a.distanceTo(b), n = Math.max(2, Math.round(L / step));
    for (let k = 0; k < n; k++) { const u = k / n; pos.push(new THREE.Vector3().lerpVectors(a, b, u).add(new THREE.Vector3(0, -sag * Math.sin(u * PI), 0))); }
  }
  const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pos), new THREE.LineBasicMaterial({ color: 0x1a1a1a })); g.add(wire);
  const mats = colors.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0, roughness: 0.3 }));
  const geo = new THREE.SphereGeometry(r, 8, 6);
  pos.forEach((p, i) => { const m = new THREE.Mesh(geo, mats[i % mats.length]); m.position.copy(p); m.scale.set(1, 1.35, 1); g.add(m); });
  const setLit = (k) => mats.forEach((m) => (m.emissiveIntensity = 2.6 * k));
  setLit(0);
  return { g, setLit };
}

// ---------------------------------------------------------------- the street at dusk
function duskSky() {
  return canvasTex(64, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#141a46'); gr.addColorStop(0.2, '#25235e'); gr.addColorStop(0.36, '#4a3378'); gr.addColorStop(0.44, '#91508a');
    gr.addColorStop(0.475, '#e07a62'); gr.addColorStop(0.497, '#ffb070'); gr.addColorStop(0.505, '#4a3a5a'); gr.addColorStop(1, '#2a2440');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(12); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { g.globalAlpha = 0.3 + R() * 0.6; g.fillRect(R() * w, R() * h * 0.3, 1, 1); } g.globalAlpha = 1;
  });
}
function windowGlowTex(bats) {
  return canvasTex(256, 200, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h / 2, w * 0.65); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#f2a24a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(150,60,30,.55)'; g.fillRect(0, 0, 40, h); g.fillRect(w - 40, 0, 40, h);   // curtains
    g.fillStyle = '#f4f1ea'; g.fillRect(w / 2 - 5, 0, 10, h); g.fillRect(0, h / 2 - 5, w, 10);
    if (bats) { g.fillStyle = '#1a1220'; for (const [x, y, s] of [[70, 50, 1], [160, 70, 0.8], [110, 140, 0.9], [200, 150, 0.7]]) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-14, -14, -30, -6); g.quadraticCurveTo(-22, 0, -20, 8); g.quadraticCurveTo(-12, 2, -6, 8); g.lineTo(0, 4); g.lineTo(6, 8); g.quadraticCurveTo(12, 2, 20, 8); g.quadraticCurveTo(22, 0, 30, -6); g.quadraticCurveTo(14, -14, 0, 0); g.fill(); g.beginPath(); g.arc(0, -2, 5, 0, 7); g.fill(); g.restore(); } }
  });
}
function hallTex() {
  return canvasTex(128, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe2a8'); gr.addColorStop(0.7, '#f0b26a'); gr.addColorStop(1, '#8a5a3a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a4a2e'; g.fillRect(0, h * 0.82, w, h * 0.18); g.fillStyle = '#c75b4a'; g.fillRect(w * 0.15, h * 0.86, w * 0.7, h * 0.08);
    g.fillStyle = '#5a3a2a'; g.fillRect(w * 0.62, h * 0.25, w * 0.28, h * 0.2); g.fillStyle = '#e8d6b0'; g.fillRect(w * 0.65, h * 0.27, w * 0.22, h * 0.16);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(w * 0.3, h * 0.12, 12, 0, 7); g.fill();
  });
}

export function dressHalloween(studio, sub, opts = {}) {
  const { root, houses, D } = sub;
  const R = rng(opts.seed ?? 31);
  const dark = new Set(opts.dark ?? []);
  // ---- sky, clouds, moon, trees
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300) { o.material.map = duskSky(); o.material.needsUpdate = true; }
    else if (o.material.isMeshBasicMaterial && o.material.transparent && o.material.opacity === 0.92) { o.material = o.material.clone(); o.material.color.set(0x8a6aa8); o.material.opacity = 0.55; }
  });
  const autumn = [0xd8642a, 0xe8a03a, 0xc0442a, 0xb8862a, 0xe07a3a];
  let ti = 0;
  root.traverse((o) => { if (o.isMesh && o.geometry.type === 'IcosahedronGeometry' && o.geometry.parameters.radius >= 0.7) { o.material = mat(autumn[ti++ % autumn.length], 0.85); } });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.25), fog: false, toneMapped: false }));
  moon.position.set(70, 62, 250); moon.lookAt(0, 0, 0); root.add(moon);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(26, 48), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,190,.45)'); gr.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, fog: false }));
  halo.position.copy(moon.position).multiplyScalar(1.01); halo.lookAt(0, 0, 0); root.add(halo);
  // ---- light: violet dusk sky, a low tangerine sun, porch lights do the rest
  const { hemi, sun } = sub.lights;
  hemi.color.set(0x9a8ae6); hemi.groundColor.set(0x4a3a50); hemi.intensity = opts.ambient ?? 1.05;
  sun.color.set(0xff9a5a); sun.intensity = opts.sun ?? 1.25;
  const LOW = new THREE.Vector3(-0.8, 0.32, 0.5).normalize();
  const aimSun = (cx = 0, cz = -6, half = 12) => { sub.aimSun(cx, cz, half); sun.position.copy(sun.target.position).addScaledVector(LOW, 60); };
  aimSun();
  const fog = new THREE.Fog(0x4a3f6a, 30, 190);

  // ---- per-house dressing
  const hallM = new THREE.MeshBasicMaterial({ map: hallTex(), toneMapped: true });
  const stepM = mat(0xa89e90, 0.9);
  const HS = houses.map((h, i) => {
    const g = h.g, near = h.side < 0, ci = i, isDark = dark.has(i), K = opts.keep?.[i] ?? {};
    const lit = [], jacks = [], strings = [];
    // porch steps (near side: front faces +z local)
    mk(new THREE.BoxGeometry(1.4, 0.2, 0.25), stepM, g, -2.2, 0.1, 2.125); mk(new THREE.BoxGeometry(1.4, 0.1, 0.25), stepM, g, -2.2, 0.05, 2.375);
    // hallway behind the door (seen when it opens)
    const hall = mk(new THREE.PlaneGeometry(0.95, 2.1), hallM, g, -2.2, 0.4 + 1.05, 0.063); hall.visible = false; hall.castShadow = false;
    // porch lantern
    const lantM = new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffb050, emissiveIntensity: 0, roughness: 0.3 });
    const lant = new THREE.Group(); lant.position.set(-1.4, 2.0, 0.1); g.add(lant);
    mk(new THREE.BoxGeometry(0.16, 0.24, 0.14), lantM, lant); mk(new THREE.BoxGeometry(0.2, 0.04, 0.18), mat(0x1a1a1a, 0.5), lant, 0, 0.14, 0); mk(new THREE.BoxGeometry(0.06, 0.06, 0.1), mat(0x1a1a1a, 0.5), lant, 0, -0.14, -0.03);
    lit.push((k) => (lantM.emissiveIntensity = 3.0 * k));
    // window glow (+ paper bats on decorated houses)
    const wTex = windowGlowTex(!isDark && i % 2 === 0);
    const wm = new THREE.MeshBasicMaterial({ map: wTex, transparent: true, opacity: 0, toneMapped: false });
    for (const wx of [1.2, 4.6]) { const w = mk(new THREE.PlaneGeometry(1.46, 1.16), wm, g, wx - 1.5, 1.9, 0.035); w.castShadow = false; }
    lit.push((k) => { wm.opacity = 0.92 * k; wm.color.setScalar(0.75 + 0.35 * k); });
    // jack-o'-lanterns on the porch + steps
    if (!K.noJacks) {
      const spots = [[-3.3, 0.3, 1.55, 0.17], [-1.0, 0.3, 1.7, 0.14], [-2.75, 0.2, 2.12, 0.12], [-1.65, 0.1, 2.38, 0.1]];
      spots.forEach(([x, y, z, r], k) => { if (k > 1 && R() < 0.3) return; const J = makeJackOLantern({ r, carved: k !== 3 || R() < 0.5 }); J.g.position.set(x, y, z); J.g.rotation.y = (R() - 0.5) * 0.6; g.add(J.g); jacks.push(J); lit.push(J.setLit); });
      for (let k = 0; k < 3; k++) { const J = makeJackOLantern({ r: 0.1 + R() * 0.12, carved: false }); J.g.position.set(-5.2 + R() * 2.0, 0, 1.0 + R() * 1.4); g.add(J.g); }
    }
    // string lights along the porch roof edge + across the eaves
    if (!K.noStrings) {
      const S = makeStringLights([new THREE.Vector3(-3.75, 2.86, 2.2), new THREE.Vector3(-0.65, 2.86, 2.2)], { colors: ci % 2 ? [0xff8a2a, 0xa060ff] : [0xff8a2a, 0xffc04a, 0xa060ff], sag: 0.16 });
      g.add(S.g); strings.push(S); lit.push(S.setLit);
      const S2 = makeStringLights([new THREE.Vector3(0.0, 3.08, 0.25), new THREE.Vector3(6.2, 3.08, 0.25)], { colors: [0xff8a2a, 0xa060ff], sag: 0.2, step: 0.3 });
      g.add(S2.g); strings.push(S2); lit.push(S2.setLit);
    }
    // cobwebs in the porch corners, a hay bale, a ghost in the left tree
    if (!isDark) {
      for (const [x, s, ry] of [[-3.55, 1, 0], [-0.85, -1, 0]]) { const w = makeCobweb(0.7); w.position.set(x, 2.84, 2.0); w.rotation.set(0, ry, s < 0 ? PI / 2 : 0); if (s < 0) w.scale.x = -1, w.rotation.z = 0; g.add(w); }
      if (i % 3 !== 1) { const hb = mk(new RoundedBoxGeometry(0.75, 0.42, 0.45, 2, 0.06), new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 1, map: canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#d8b25a'; c.fillRect(0, 0, w, h); const RR = rng(i); for (let k = 0; k < 160; k++) { c.strokeStyle = RR() < 0.5 ? 'rgba(120,80,20,.35)' : 'rgba(255,240,170,.4)'; c.beginPath(); const x = RR() * w, y = RR() * h; c.moveTo(x, y); c.lineTo(x + (RR() - 0.5) * 10, y + (RR() - 0.5) * 4); c.stroke(); } }) }), g, -4.4, 0.21, 2.6); hb.rotation.y = 0.2; }
      const gh = new THREE.Group(); gh.position.set(-5.5, 2.35, 4.6); g.add(gh);
      const gm = mat(0xf6f3ee, 0.9, { side: THREE.DoubleSide });
      mk(new THREE.SphereGeometry(0.16, 16, 12), gm, gh); const sk = mk(new THREE.ConeGeometry(0.22, 0.45, 16, 1, true), gm, gh, 0, -0.2, 0);
      for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.025, 8, 6), mat(0x141014, 0.4), gh, s * 0.05, 0.02, 0.14);
      gh.userData.ghost = true;
    }
    // a warm porch light (near-side hero lots only; intensity follows setLit)
    let light = null;
    if (near && D.lots.includes(Math.round(h.g.position.x))) {
      light = new THREE.PointLight(0xffb468, 0, 7.5, 1.6); light.position.set(-1.6, 2.15, 1.0); g.add(light);
      lit.push((k) => (light.intensity = (opts.porch ?? 5.5) * k));
    }
    const api = { g, hall, lantern: lant, jacks, strings, light, lit: 0, door: h.door, doorPos: h.doorPos, x: h.g.position.x, near };
    api.setLit = (k) => { api.lit = k; lit.forEach((f) => f(k)); };
    api.setLit(isDark ? 0 : 1);
    return api;
  });
  // ---- street lamps (warm heads; between the lots so hero walks stay clear)
  const lampM = new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffc070, emissiveIntensity: 2.2 });
  for (const x of [-56, -40, -24, -8, 8, 24, 40]) for (const z of [-1.75, 8.6]) {
    mk(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 8), mat(0x2a2a2e, 0.5), root, x, 1.8, z);
    mk(new THREE.SphereGeometry(0.17, 14, 10), lampM, root, x, 3.65, z);
  }
  // ---- leaf piles on the lawns
  const leafCols = [0xd8642a, 0xe8a03a, 0xc0442a];
  for (let i = 0; i < 26; i++) { const lx = D.lots[i % D.lots.length] + (R() - 0.5) * 12, lz = -3 - R() * 4.5; if (Math.abs(lx - Math.round((lx + 2.2) / 16) * 16 + 2.2) < 1.2) continue; const p = mk(new THREE.SphereGeometry(0.35 + R() * 0.25, 12, 8), mat(leafCols[i % 3], 0.95), root, lx, 0, lz); p.scale.y = 0.35; }

  /** Floor height under (x, z) for people and Pip on the near side (lawns, walks, steps, porches, sidewalk). */
  const groundY = (x, z) => {
    if (z > -2 && z < 0) return SW_H;
    if (z >= 0) return 0;
    const L = D.lots.reduce((a, b) => (Math.abs(b - 2.2 - x) < Math.abs(a - 2.2 - x) ? b : a)), dx = x - (L - 2.2);
    if (z < -7 && Math.abs(dx) < 1.5) return 0.3;
    if (z < -6.75 && z >= -7 && Math.abs(dx) < 0.7) return 0.2;
    if (z < -6.5 && z >= -6.75 && Math.abs(dx) < 0.7) return 0.1;
    if (Math.abs(dx) < 0.55) return 0.045;
    return 0.005;
  };
  return { houses: HS, fog, aimSun, groundY, moon, setDoorOpen: (i, th) => { HS[i].door.rotation.y = th; HS[i].hall.visible = th > 0.05; } };
}
