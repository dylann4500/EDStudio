// VRoid characters (VRM 1.0, exported from VRoid Studio) as fully animated EDStudio actors — 054's goth cheat-tutor "Vex".
// No extra dependency: three's GLTFLoader reads the VRM; this file reads the VRMC_vrm extension itself (humanoid bones, expression
// presets → morph binds, spring-bone chains), swaps the unlit MToon fallbacks for cel shading + an ink outline (pixel-pass friendly),
// and drives everything procedurally and deterministically:
//   const V = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' } });
//   scene.add(V.root);  V.update(t, { x, z, rotY, pose: 'hips'|'shades'|'point'|'peace'|'phone'|'wave'|'rest', walk: {dist, speed},
//                                    lean, tilt, nod, turn, sway, hands: {L, R}, mouth 0..1 (talk level), vowel 'a'|'i'|'u'|'e'|'o',
//                                    face: {happy, relaxed, angry, sad, surprised, blink}, look: [x, y] (eyes), camera })
// Posing = AIM directions in her own frame (x = her left, y = up, z = front), applied as the shortest rotation from each bone's
// rest direction (VRoid's rest is a T-pose with near-identity bone frames), so poses read the same whatever the rest rotations.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { outlineMaterial } from './vrm.js';
import { toonRamp } from './pixeltex.js';

let RAMP = null;
const ramp = () => (RAMP ??= toonRamp([0.7, 0.72, 0.82, 0.97, 1, 1, 1, 1]));
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// pose presets: bone → direction in her frame (mirrored for the other side by negating x)
export const ARMS = {   // exported (064, additive): videos blend two presets via update's armL/armR
  rest: { L: [[0.24, -1, 0.04], [0.12, -1, 0.14]] },
  hip: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]] },
  shades: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]] },
  point: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.22, -0.12, 1], [-0.08, 0.06, 1]] },
  peace: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.42, -0.62, 0.5], [0.22, 0.92, 0.28]] },
  phone: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.16, -0.9, 0.3], [0.32, 0.42, 0.85]] },
  wave: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.85, 0.3, 0.2], [-0.12, 1, 0.12]] },
  shrug: { L: [[0.75, -0.62, 0.1], [0.35, 0.15, 0.9]] },
  cross: { L: [[0.3, -0.85, 0.35], [-0.95, 0.05, 0.25]], R: [[-0.3, -0.85, 0.32], [0.95, 0.12, 0.28]] },
  // the seductive set (054 v2): finger to the lips, a kiss at the lips / blown out, beckoning, leaning in, a hair flip
  shh: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.2, -0.78, 0.52], [0.48, 0.74, 0.42]] },
  kiss: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.24, -0.66, 0.66], [0.42, 0.66, 0.6]] },
  kissOut: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.3, -0.2, 0.95], [-0.15, 0.1, 1]] },
  beckon: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.28, -0.5, 0.82], [-0.08, 0.25, 1]] },
  lean: { L: [[0.22, -0.8, 0.55], [0.06, -0.88, 0.45]], R: [[-0.22, -0.8, 0.55], [-0.06, -0.88, 0.45]] },
  hairflip: { L: [[0.5, 0.82, 0.12], [-0.72, 0.42, 0.1]], R: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]] },
};
const HANDS = { rest: 'relax', hip: 'relax', shades: 'relax', point: 'point', peace: 'peace', phone: 'hold', wave: 'open', shrug: 'open', cross: 'relax', shh: 'point', kiss: 'kiss', kissOut: 'open', beckon: 'beckon', lean: 'relax', hairflip: 'relax' };
// finger curl per pose: [thumb, index, middle, ring, little] (radians per joint)
const SHAPES = { relax: [0.25, 0.25, 0.32, 0.38, 0.42], open: [0.05, 0.04, 0.04, 0.05, 0.06], fist: [0.9, 1.35, 1.4, 1.4, 1.35],
  point: [0.8, 0.02, 1.35, 1.4, 1.35], peace: [0.9, 0.02, 0.02, 1.4, 1.35], hold: [0.45, 0.55, 0.65, 0.75, 0.8],
  kiss: [0.35, 0.3, 0.35, 0.45, 0.5], beckon: [0.8, 0.85, 1.35, 1.4, 1.35] };

export async function makeVroid(url, { textures = {}, outline = 0.0022, bust = 1.0, thigh = 1.0, calf = 1.0, head = 1.0, eyes = 1.0, emissiveFloor = 0.22 } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const P = gltf.parser, J = P.json, X = J.extensions.VRMC_vrm;
  const model = gltf.scene, root = new THREE.Group(); root.add(model);
  const node = (i) => P.getDependency('node', i);
  // ---- humanoid
  const H = {};
  for (const [k, v] of Object.entries(X.humanoid.humanBones)) H[k] = await node(v.node);
  // ---- materials: cel shading + ink outline (face/eye parts stay unlit and outline-free)
  const loader = new THREE.TextureLoader(), swaps = {};
  for (const [key, u] of Object.entries(textures)) { const t = await loader.loadAsync(u); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; swaps[key] = t; }
  const FACEISH = /Eye|FaceMouth|FaceBrow|FaceEyeline|Highlight/;
  const meshes = []; model.traverse((o) => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true;
    const src = o.material, name = src.name || '';
    const sw = Object.entries(swaps).find(([k]) => name.includes(k));
    if (sw) src.map = sw[1];
    if (FACEISH.test(name)) { o.castShadow = false; continue; }
    const m = new THREE.MeshToonMaterial({ map: src.map, gradientMap: ramp(), transparent: src.transparent, alphaTest: src.alphaTest, side: src.side, depthWrite: src.depthWrite });
    m.emissiveMap = src.map; m.emissive = new THREE.Color(emissiveFloor, emissiveFloor * 0.92, emissiveFloor);   // shadows keep the base hue (MToon's shade colour)
    m.name = name; o.material = m;
    if (outline > 0 && !src.transparent) {
      const ink = o.isSkinnedMesh ? new THREE.SkinnedMesh(o.geometry, outlineMaterial(outline)) : new THREE.Mesh(o.geometry, outlineMaterial(outline));
      if (o.isSkinnedMesh) { ink.bind(o.skeleton, o.bindMatrix); ink.bindMode = o.bindMode; }
      ink.morphTargetInfluences = o.morphTargetInfluences; ink.morphTargetDictionary = o.morphTargetDictionary;
      ink.frustumCulled = false; ink.castShadow = false; ink.renderOrder = -1; o.parent.add(ink); ink.position.copy(o.position); ink.quaternion.copy(o.quaternion); ink.scale.copy(o.scale);
    }
  }
  // ---- expressions: preset → [{meshes, index, weight}]
  const EX = {}, morphMeshes = new Set();
  for (const [k, e] of Object.entries(X.expressions?.preset || {})) {
    EX[k] = [];
    for (const b of e.morphTargetBinds || []) { const n = await node(b.node), ms = n.isMesh ? [n] : n.children.filter((c) => c.isMesh); ms.forEach((m) => morphMeshes.add(m)); EX[k].push({ ms, index: b.index, w: b.weight ?? 1 }); }
  }
  function expr(weights) {
    for (const m of morphMeshes) m.morphTargetInfluences?.fill(0);
    for (const [k, w] of Object.entries(weights)) if (w > 0 && EX[k]) for (const b of EX[k]) for (const m of b.ms) if (m.morphTargetInfluences) m.morphTargetInfluences[b.index] = Math.min(1, m.morphTargetInfluences[b.index] + w * b.w);
  }
  // ---- spring chains (hair, bust): procedural sway on the joints (deterministic, no simulation state)
  const springs = [];
  for (const s of J.extensions.VRMC_springBone?.springs || []) {
    const js = []; for (const j of s.joints) { const n = await node(j.node); js.push({ n, rest: n.quaternion.clone(), stiff: j.stiffness ?? 1 }); }
    springs.push({ name: s.name, js, seed: springs.length });
  }
  // ---- proportions
  for (const s of springs.filter((s) => s.name === 'Bust')) s.js[0].n.scale.setScalar(bust);
  for (const k of ['leftUpperLeg', 'rightUpperLeg']) if (H[k]) H[k].scale.set(thigh, 1, thigh);
  for (const k of ['leftLowerLeg', 'rightLowerLeg']) if (H[k]) H[k].scale.set(calf / thigh, 1, calf / thigh);   // children inherit the thigh scale
  if (H.head) H.head.scale.setScalar(head);                       // a slightly bigger head = cuter anime proportions
  for (const k of ['leftEye', 'rightEye']) if (H[k]) H[k].scale.set(eyes, eyes, 1);   // bigger irises in x/y only (scaling z pushed them out through the lids = goggles)
  // ---- aim posing
  model.updateMatrixWorld(true);
  const NEXT = { hips: 'spine', spine: 'chest', chest: 'upperChest', upperChest: 'neck', neck: 'head', leftShoulder: 'leftUpperArm', rightShoulder: 'rightUpperArm',
    leftUpperArm: 'leftLowerArm', leftLowerArm: 'leftHand', leftHand: 'leftMiddleProximal', rightUpperArm: 'rightLowerArm', rightLowerArm: 'rightHand', rightHand: 'rightMiddleProximal',
    leftUpperLeg: 'leftLowerLeg', leftLowerLeg: 'leftFoot', leftFoot: 'leftToes', rightUpperLeg: 'rightLowerLeg', rightLowerLeg: 'rightFoot', rightFoot: 'rightToes' };
  const CHAIN = ['hips', 'spine', 'chest', 'upperChest', 'neck', 'head', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand', 'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand',
    'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'rightUpperLeg', 'rightLowerLeg', 'rightFoot'].filter((n) => H[n]);
  const REST = {}, AXIS = {}, RESTDIR = {}, qR0 = new THREE.Quaternion(); root.getWorldQuaternion(qR0);
  const tq = new THREE.Quaternion();
  for (const n of Object.keys(H)) REST[n] = H[n].quaternion.clone();
  for (const n of CHAIN) { const b = H[n], k = NEXT[n] && H[NEXT[n]]; AXIS[n] = k && k.parent === b ? k.position.clone().normalize() : V3(0, 1, 0); b.getWorldQuaternion(tq); RESTDIR[n] = AXIS[n].clone().applyQuaternion(tq).applyQuaternion(qR0.clone().invert()); }
  const qP = new THREE.Quaternion(), qW = new THREE.Quaternion(), d0 = V3(), dT = V3(), qD = new THREE.Quaternion(), qR = new THREE.Quaternion(), qT = new THREE.Quaternion();
  function aim(dirs) {
    for (const n of Object.keys(H)) H[n].quaternion.copy(REST[n]);
    root.updateMatrixWorld(true); root.getWorldQuaternion(qR);
    for (const n of CHAIN) {
      const b = H[n], dir = dirs[n], tw = dirs['twist.' + n];
      if (dir) {
        b.parent.getWorldQuaternion(qP); qW.copy(qP).multiply(b.quaternion);
        d0.copy(AXIS[n]).applyQuaternion(qW).normalize(); dT.set(dir[0], dir[1], dir[2]).normalize().applyQuaternion(qR);
        qD.setFromUnitVectors(d0, dT); qW.premultiply(qD); b.quaternion.copy(qP.invert().multiply(qW));
      }
      if (tw) b.quaternion.multiply(qT.setFromAxisAngle(AXIS[n], tw));
      b.updateMatrixWorld(true);
    }
  }
  // fingers: curl about the bone's local z (the palm side is −y in the T-pose); the thumb folds about local y
  const FING = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'], SEG = { Thumb: ['Metacarpal', 'Proximal', 'Distal'], other: ['Proximal', 'Intermediate', 'Distal'] };
  const SPREAD = [0, 0.1, 0.02, -0.06, -0.14];
  function shapeHand(side, shape) {
    const S = Array.isArray(shape) ? shape : SHAPES[shape] || SHAPES.relax, s = side === 'left' ? 1 : -1;   // 066 fix (additive): a raw [thumb, index, middle, ring, little] curl
    FING.forEach((f, fi) => (SEG[f] || SEG.other).forEach((seg, si) => {
      const b = H[`${side}${f}${seg}`]; if (!b) return;
      const c = S[fi] * (si === 0 ? 0.8 : si === 1 ? 1.15 : 0.9);
      b.quaternion.copy(REST[`${side}${f}${seg}`]);
      if (f === 'Thumb') b.quaternion.multiply(qT.setFromEuler(new THREE.Euler(0, -s * c * 0.9, -s * c * 0.35)));
      else b.quaternion.multiply(qT.setFromEuler(new THREE.Euler(si === 0 ? 0 : 0, si === 0 ? s * SPREAD[fi] * (1 - S[fi]) : 0, -s * c)));
    }));
  }
  // ---- accessories: a group on a bone whose axes match hers at rest (rotations follow the bone after)
  const attach = (bn, wp) => { const b = H[bn] || model.getObjectByName(bn), g = new THREE.Group(); b.add(g); b.updateMatrixWorld(true); g.position.copy(V3(...wp).applyMatrix4(b.matrixWorld.clone().invert())); const q = new THREE.Quaternion(); b.getWorldQuaternion(q); g.quaternion.copy(q.invert()); return g; };
  const bpos = (bn) => (H[bn] || model.getObjectByName(bn)).getWorldPosition(V3());

  let lastT = 0;
  function update(t, p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0;
    const breath = Math.sin(t * 1.7) * 0.012, sw = p.sway ?? 0.1, tilt = p.tilt ?? 0, nod = p.nod ?? 0, lean = p.lean ?? 0;
    const arms = ARMS[p.pose] || ARMS.rest, dirs = {};
    const set = (side, pair) => { const m = side === 'L' ? 1 : -1, [u, l] = pair; dirs[side === 'L' ? 'leftUpperArm' : 'rightUpperArm'] = [u[0] * (side === 'L' ? 1 : 1), u[1], u[2]]; dirs[side === 'L' ? 'leftLowerArm' : 'rightLowerArm'] = l; void m; };
    const mir = (pair) => pair.map((d) => [-d[0], d[1], d[2]]);
    set('L', arms.L || ARMS.rest.L); set('R', arms.R || mir(arms.L || ARMS.rest.L));
    if (p.armL) set('L', p.armL); if (p.armR) set('R', p.armR);
    // walk cycle (phase from distance) or a contrapposto stand (weight on her right leg, left knee soft)
    const w = p.walk, ph = w ? (w.dist / 0.62) * Math.PI : 0, amp = w ? Math.min(1, (w.speed ?? 1) / 1.1) : 0;
    let bob = 0;
    if (w) {
      const sL = Math.sin(ph), sR = -sL;
      dirs.leftUpperLeg = [0.03, -1, 0.42 * sL * amp]; dirs.rightUpperLeg = [-0.03, -1, 0.42 * sR * amp];
      dirs.leftLowerLeg = [0.02, -1, 0.42 * sL * amp - 0.55 * Math.max(0, Math.cos(ph)) * amp]; dirs.rightLowerLeg = [-0.02, -1, 0.42 * sR * amp - 0.55 * Math.max(0, -Math.cos(ph)) * amp];
      dirs.leftUpperArm = [0.24, -1, -0.32 * sL * amp]; dirs.rightUpperArm = [-0.24, -1, -0.32 * sR * amp];
      dirs.leftLowerArm = [0.12, -1, 0.1 - 0.25 * sL * amp]; dirs.rightLowerArm = [-0.12, -1, 0.1 - 0.25 * sR * amp];
      bob = Math.abs(Math.sin(ph)) * 0.022 * amp;
      dirs.hips = [0.05 * sL * amp, 1, 0]; dirs.spine = [-0.06 * sL * amp, 1, 0.04]; dirs['twist.spine'] = 0.12 * sL * amp;
    } else {
      dirs.hips = [Math.sin(sw) * 0.35, 1, 0]; dirs.spine = [-Math.sin(sw) * 0.4, 1, -0.02 + breath + lean * 0.6]; dirs.chest = [-Math.sin(sw) * 0.12, 1, 0.02 + breath + lean * 0.5];
      dirs.leftUpperLeg = [0.07 + Math.sin(sw) * 0.25, -1, 0.1]; dirs.leftLowerLeg = [0.04, -1, -0.04];
      dirs.rightUpperLeg = [-0.02 + Math.sin(sw) * 0.25, -1, 0.0]; dirs.rightLowerLeg = [-0.02 + Math.sin(sw) * 0.2, -1, 0.0];
    }
    dirs.leftFoot = RESTDIR.leftFoot?.toArray(); dirs.rightFoot = RESTDIR.rightFoot?.toArray();
    dirs.neck = [tilt * 0.3, 1, 0.06 + nod * 0.3 + lean * 0.2]; dirs.head = [tilt * 0.6, 1, 0.03 + nod * 0.6]; dirs['twist.head'] = (p.turn ?? 0) * 0.7; dirs['twist.neck'] = (p.turn ?? 0) * 0.3;
    Object.assign(dirs, p.aim || {});
    aim(dirs);
    model.position.y = bob;
    const RONLY = ['point', 'peace', 'phone', 'shh', 'kiss', 'kissOut', 'beckon'], hs = { L: HANDS[p.pose] && !RONLY.includes(p.pose) ? HANDS[p.pose] : 'relax', R: HANDS[p.pose] || 'relax', ...(p.hands || {}) };
    shapeHand('left', hs.L); shapeHand('right', hs.R);
    // eyes look (bone type lookAt), face
    for (const k of ['leftEye', 'rightEye']) if (H[k]) { const [lx, ly] = p.look || [0, 0]; H[k].quaternion.copy(REST[k]).multiply(qT.setFromEuler(new THREE.Euler(-ly * 0.25, lx * 0.3, 0))); }
    const blink = p.face?.blink ?? (((t + 0.4) % 3.3) < 0.13 ? 1 : 0);
    const m = p.mouth ?? 0, vow = { a: 'aa', i: 'ih', u: 'ou', e: 'ee', o: 'oh' }[p.vowel || 'a'];
    expr({ relaxed: 0.0, ...(p.face || {}), blink, [vow]: m * 0.85 });
    // hair + bust sway (procedural): lazy wind + follow the walk bob
    for (const s of springs) s.js.forEach((j, i) => {
      if (!j.n.parent) return;
      const k = (i + 1) / s.js.length, isB = s.name === 'Bust';
      const a = isB ? (w ? Math.sin(ph * 2 + 0.6) * 0.06 * amp : Math.sin(t * 1.7) * 0.01) : (Math.sin(t * 1.6 + s.seed * 0.9 + i * 0.6) * 0.05 + Math.sin(t * 2.9 + s.seed) * 0.02) * k * (1 + (w ? amp * 0.8 : 0));
      j.n.quaternion.copy(j.rest).multiply(qT.setFromEuler(new THREE.Euler(isB ? a : a * 0.6, 0, isB ? 0 : a)));
    });
    lastT = t;
  }
  update(0, {});
  return { root, model, H, EX, expr, update, attach, bpos, springs, gltf };
}

/** Goth accessories for Vex: shades pushed up on her hair, studded choker + cross, layered silver chains, O-ring + bat charm on the
 *  bandeau, a chain belt with O-rings + side ties on the hips, spiked cuffs + beaded bracelets, a silver star hair clip. */
export function dressGoth(V) {
  const T = (c, r = 0.4, x = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: ramp(), ...x });
  const M = { black: T(0x121016), lens: T(0x1a1424), silver: T(0xd8dbe4, 0.4, { emissive: 0x30323a }), plum: T(0x3a1838) };
  const ink = outlineMaterial(0.0012);
  const mk = (geo, mat, parent, x = 0, y = 0, z = 0, line = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); if (line) m.add(new THREE.Mesh(geo, ink)); return m; };
  const head = V.bpos('head'), neck = V.bpos('neck'), chest = V.bpos('upperChest'), hips = V.bpos('hips');
  // shades on the hair (rectangular, black frames, dark lenses), tilted back
  const sg = V.attach('head', [head.x, head.y + 0.165, head.z + 0.035]); sg.rotation.x = -0.55;
  for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.058, 0.032, 0.008), M.black, sg, s * 0.036, 0, 0.06); mk(new THREE.BoxGeometry(0.048, 0.024, 0.004), M.lens, sg, s * 0.036, 0, 0.065, false); mk(new THREE.BoxGeometry(0.006, 0.006, 0.11), M.black, sg, s * 0.067, 0.008, 0.0, false); }
  mk(new THREE.BoxGeometry(0.02, 0.006, 0.006), M.black, sg, 0, 0.008, 0.06, false);
  // star hair clip (her left side)
  const clip = V.attach('head', [head.x + 0.075, head.y + 0.1, head.z + 0.05]); clip.rotation.set(0, 0.6, 0.3);
  { const sh = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = i % 2 ? 0.006 : 0.02; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } mk(new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: false }), M.silver, clip); }
  // studded choker + cross pendant
  const nk = V.attach('neck', [neck.x, neck.y + 0.035, neck.z]);
  const ch = mk(new THREE.TorusGeometry(0.047, 0.009, 8, 32), M.black, nk); ch.rotation.x = Math.PI / 2; ch.scale.set(1, 0.9, 1);
  for (let i = 0; i < 9; i++) { const a = -1.2 + (i / 8) * 2.4; mk(new THREE.SphereGeometry(0.0045, 6, 4), M.silver, nk, Math.sin(a) * 0.052, 0, Math.cos(a) * 0.047, false); }
  const cross = new THREE.Group(); nk.add(cross); cross.position.set(0, -0.022, 0.05);
  mk(new THREE.BoxGeometry(0.006, 0.026, 0.004), M.silver, cross); mk(new THREE.BoxGeometry(0.016, 0.006, 0.004), M.silver, cross, 0, 0.005, 0);
  // layered chains on the upper chest (two catenaries of tiny links)
  const uc = V.attach('upperChest', [chest.x, chest.y, chest.z]);
  const link = new THREE.TorusGeometry(0.0035, 0.0011, 4, 8);
  for (const [drop, w2] of [[0.07, 0.07], [0.11, 0.085]]) {
    const n = 28, im = new THREE.InstancedMesh(link, M.silver, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) { const u = i / (n - 1) * 2 - 1, x = u * w2, y = neck.y - chest.y + 0.01 - drop * (1 - u * u), z = 0.085 + 0.03 * (1 - u * u); q.setFromEuler(new THREE.Euler(0, (i % 2) * Math.PI / 2, Math.atan2(-2 * drop * u, w2))); m4.compose(V3(x, y, z), q, V3(1, 1, 1)); im.setMatrixAt(i, m4); }
    im.frustumCulled = false; uc.add(im);
  }
  // hips: a chain belt (loose, dipping in front) with two O-rings + black side ties
  const hp = V.attach('hips', [hips.x, hips.y, hips.z]);
  { const n = 64, im = new THREE.InstancedMesh(link, M.silver, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = Math.sin(a) * 0.165, z = Math.cos(a) * 0.12, y = -0.045 - 0.035 * Math.max(0, Math.cos(a)) ** 2; q.setFromEuler(new THREE.Euler(0, a + (i % 2) * Math.PI / 2, 0)); m4.compose(V3(x, y, z + 0.005), q, V3(1.2, 1.2, 1.2)); im.setMatrixAt(i, m4); }
    im.frustumCulled = false; hp.add(im); }
  for (const s of [-1, 1]) {
    const ring = mk(new THREE.TorusGeometry(0.014, 0.003, 6, 18), M.silver, hp, s * 0.135, -0.06, 0.085, false); ring.rotation.y = s * 0.6;
    const bow = new THREE.Group(); hp.add(bow); bow.position.set(s * 0.16, -0.075, 0.02);
    for (const d of [-1, 1]) { const l = mk(new THREE.TorusGeometry(0.012, 0.0035, 6, 12), M.black, bow, 0, 0, d * 0.012, false); l.rotation.y = Math.PI / 2; }
    for (const d of [-1, 1]) { const tail = mk(new THREE.BoxGeometry(0.004, 0.07, 0.008), M.black, bow, 0.004 * s, -0.04, d * 0.008, false); tail.rotation.z = s * 0.15 * d; }
  }
  // bandeau centre: an O-ring with a little bat charm
  const bc = V.attach('upperChest', [chest.x, chest.y - 0.075, chest.z + 0.12]);
  mk(new THREE.TorusGeometry(0.011, 0.0028, 6, 18), M.silver, bc, 0, 0, 0, false);
  { const sh = new THREE.Shape(); sh.moveTo(0, -0.004); [[0.006, 0.002], [0.016, 0.006], [0.022, 0.0], [0.016, -0.002], [0.011, -0.006], [0.006, -0.002], [0, -0.008]].forEach(([x, y]) => sh.lineTo(x, y)); [[-0.006, -0.002], [-0.011, -0.006], [-0.016, -0.002], [-0.022, 0.0], [-0.016, 0.006], [-0.006, 0.002]].forEach(([x, y]) => sh.lineTo(x, y)); mk(new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false }), M.silver, bc, 0, -0.016, 0.002, false); }
  // spiked cuffs + a beaded bracelet on both wrists
  for (const side of ['left', 'right']) {
    const s = side === 'left' ? 1 : -1, hb = V.bpos(side + 'Hand'), cf = V.attach(side + 'LowerArm', [hb.x - s * 0.03, hb.y, hb.z]);
    const c = mk(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 16, 1, true), M.black, cf); c.rotation.z = Math.PI / 2; c.material = M.black;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, sp = mk(new THREE.ConeGeometry(0.005, 0.014, 5), M.silver, cf, 0, Math.cos(a) * 0.036, Math.sin(a) * 0.036, false); sp.rotation.x = a + Math.PI / 2; }
    const br = mk(new THREE.TorusGeometry(0.03, 0.005, 6, 16), M.plum, cf, -s * 0.03, 0, 0, false); br.rotation.y = Math.PI / 2;
  }
  M.shades = sg;   // 067 (additive): the hair shades group, so a video can hide it (and wear a clone on the eyes)
  return M;
}
