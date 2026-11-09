// sim style: a realistic-proportion person (head ≈ 1/7.5 of a 1.77 m body, small realistic face, real clothes) built on
// rig.js's skeleton, so rig.js `applyPose`/`basePose`/`blink`/`handWorld` and every tested arm preset + sitting value in
// CLAUDE.md drive it unchanged (same leg lengths L1/L2/HIP_H; arms ≈ the same lengths). rig.js itself is untouched.
//
//   const P = makeSim({ skin, hair, hairStyle: 'short'|'swoop'|'bun'|'long'|'bald', top: 'hoodie'|'tee'|'shirt'|'cardigan',
//                       topColor, pants, shoes, eyes, female, beard, glasses, scale })
//   applyPose(P, pose)                 rig.js, as for any rig (pose.mouth 'smile'|'flat'|'o', pose.eyes 'open'|'closed')
//   simFace(P, { open, look:[yaw,pitch], brows, smile })   after applyPose: jaw open 0..1 (talk/yell), eyes look, brows -1..1
//   legsOut(P)                          after applyPose: legs straight out in front, toes up (sitting up in bed, under a duvet)
//   SIM.eye / SIM.top / SIM.shoulder    standing heights (m) for framing
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { L1, L2, HIP_H } from '../rig.js';
import { simMat } from './mats.js';
import { clamp } from '../core.js';

export const SIM = { neck: HIP_H + 0.64, eye: HIP_H + 0.64 + 0.157, top: HIP_H + 0.64 + 0.262, shoulder: HIP_H + 0.525 };
/** Stand/sit on a raised floor (the house floor FY): shifts a rig.js pose up by y (keeps sitting offsets like y −0.375). */
export const lift = (p, y) => { p.y = (p.y || 0) + y; p.floor = (p.floor || 0) + y; return p; };
const PI = Math.PI;

const sk = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.rough ?? 0.6, metalness: 0, ...o.extra });
function mesh(geo, m, parent, x = 0, y = 0, z = 0, shadow = true) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o;
}

// ---------------------------------------------------------------- the skull: a deformed sphere (cranium, cheeks, jaw, chin)
const HA = 0.078, HB = 0.112, HC = 0.098;
function skullPoint(x0, y0, z0, out) {
  const k = clamp((-y0 - 0.05) / 0.95);                 // 0 above the cheekbones → 1 at the chin
  const xs = HA * (1 - 0.3 * k * k) * (1 + 0.03 * Math.max(0, y0));
  let zs = HC * (z0 > 0 ? 1 - 0.1 * k * k : 1 - 0.38 * k);
  if (y0 > 0 && z0 < 0) zs *= 1 + 0.07 * y0;            // the back of the cranium
  let z = z0 * zs;
  if (z0 > 0.2) z -= 0.012 * (z0 - 0.2) * (1 - Math.abs(y0)) * Math.abs(x0);   // flatten the face plane at the cheeks
  out.set(x0 * xs, y0 * HB, z);
  return out;
}
function skullGeo(seg = 48, thetaLen = PI, puff = 0, thetaStart = 0, phiStart = 0, phiLen = PI * 2, tilt = 0) {
  // tilt (rad, about x) is applied on the UNIT sphere before the skull deformation, so a tilted hair cap still hugs the skull
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75), phiStart, phiLen, thetaStart, thetaLen), p = g.attributes.position, v = new THREE.Vector3();
  const c = Math.cos(tilt), sn = Math.sin(tilt);
  for (let i = 0; i < p.count; i++) {
    const x0 = p.getX(i), y0 = p.getY(i) * c - p.getZ(i) * sn, z0 = p.getY(i) * sn + p.getZ(i) * c;
    skullPoint(x0, y0, z0, v);
    if (puff) v.multiplyScalar(1 + puff * (0.6 + 0.4 * Math.max(0, y0)));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
/** z of the skull surface in front of (x, y) (head-local), via a ray: features sit ON the face whatever the deformation. */
const _ray = new THREE.Raycaster();
function surfZ(skull, x, y) {
  _ray.set(new THREE.Vector3(x, y, 1), new THREE.Vector3(0, 0, -1));
  const h = _ray.intersectObject(skull, false)[0];
  return h ? h.point.z : 0.08;
}

// ---------------------------------------------------------------- hair (a strand texture, darker near the roots)
let _hairTex = null;
function hairTex() {
  if (_hairTex) return _hairTex;
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, 256, 256);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { const x = r() * 256, y = r() * 256, L = 12 + r() * 40; g.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.25)'; g.lineWidth = 0.8 + r() * 1.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 10, y + L / 2, x + (r() - 0.5) * 6, y + L); g.stroke(); }
  _hairTex = new THREE.CanvasTexture(c); _hairTex.colorSpace = THREE.SRGBColorSpace; _hairTex.wrapS = _hairTex.wrapT = THREE.RepeatWrapping; _hairTex.repeat.set(3, 2);
  return _hairTex;
}

// ---------------------------------------------------------------- the head
function makeSimHead(o) {
  const g = new THREE.Group();
  const mSkin = sk(o.skin, { rough: 0.55 });
  const lipC = new THREE.Color(o.skin).lerp(new THREE.Color(o.female ? 0xb4545a : 0xa4605a), o.female ? 0.5 : 0.35);
  const mLip = sk(lipC, { rough: 0.45 }), mWhite = sk(0xeeeae2, { rough: 0.25 }), mDark = sk(0x1a1310, { rough: 0.4 });
  const mIris = sk(o.eyes ?? 0x5a3d26, { rough: 0.3 }), mBrow = sk(new THREE.Color(o.brow ?? o.hair).multiplyScalar(0.8), { rough: 0.9 });
  const mHair = new THREE.MeshStandardMaterial({ color: o.hair, roughness: 0.62, map: hairTex(), side: THREE.DoubleSide });
  const skull = mesh(skullGeo(), mSkin, g); skull.updateMatrixWorld(true);
  const S = (x, y) => surfZ(skull, x, y);
  // ears
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.016, 14, 10), mSkin, g, s * 0.076, -0.004, -0.008); e.scale.set(0.42, 1.35, 0.95); e.rotation.y = s * 0.3; }
  // chin + jaw line
  if (!o.female) { const c = mesh(new THREE.SphereGeometry(0.02, 16, 12), mSkin, g, 0, -0.097, S(0, -0.097) - 0.02); c.scale.set(1.3, 0.75, 0.8); }
  // nose: bridge, tip, wings
  const zN = S(0, -0.012);
  { const b = mesh(new THREE.CapsuleGeometry(0.0062, 0.024, 4, 10), mSkin, g, 0, -0.008, zN - 0.0015); b.rotation.x = -0.36; }
  { const tip = mesh(new THREE.SphereGeometry(0.0086, 14, 10), mSkin, g, 0, -0.027, S(0, -0.027) + 0.0075); tip.scale.set(1.05, 0.85, 0.85); }
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.0056, 12, 8), mSkin, g, s * 0.0092, -0.03, S(s * 0.0092, -0.03) + 0.0005).scale.set(1, 0.85, 0.6);
  // eyes: sclera + iris/pupil (a look group per eye) + an upper lid cap and a lash line; closed = skin lids + lash curve
  const eyesOpen = new THREE.Group(), eyesClosed = new THREE.Group(); g.add(eyesOpen, eyesClosed);
  const looks = [], EY = 0.012, EX = 0.031, ER = 0.0118;
  for (const s of [-1, 1]) {
    const zE = S(s * EX, EY) - ER * 0.62;
    const ball = mesh(new THREE.SphereGeometry(ER, 16, 12), mWhite, eyesOpen, s * EX, EY, zE, false); ball.scale.set(1.05, 0.9, 1);
    const look = new THREE.Group(); look.position.set(s * EX, EY, zE); eyesOpen.add(look); looks.push(look);
    mesh(new THREE.CircleGeometry(ER * 0.6, 20), mIris, look, 0, 0, ER + 0.0003, false);
    mesh(new THREE.CircleGeometry(ER * 0.27, 14), mDark, look, 0, 0, ER + 0.0006, false);
    const lid = mesh(new THREE.SphereGeometry(ER * 1.1, 16, 8, 0, PI * 2, 0, PI * 0.3), mSkin, eyesOpen, s * EX, EY, zE, false); lid.rotation.x = 0.5;
    const lash = mesh(new THREE.TorusGeometry(ER * 1.0, 0.0011, 4, 14, PI * 0.9), mDark, eyesOpen, s * EX, EY + 0.0005, zE + ER * 0.45, false); lash.rotation.z = PI * 0.05; lash.scale.set(1, 0.62, 1);
    const shut = mesh(new THREE.SphereGeometry(ER * 1.08, 16, 12), mSkin, eyesClosed, s * EX, EY, zE, false); shut.scale.set(1.05, 0.9, 1);
    const cl = mesh(new THREE.TorusGeometry(ER * 0.95, 0.0012, 4, 14, PI * 0.9), mDark, eyesClosed, s * EX, EY - 0.0015, zE + ER * 0.72, false); cl.rotation.z = PI * 1.05; cl.scale.set(1, 0.35, 1);
  }
  eyesClosed.visible = false;
  // brows
  const brows = [];
  for (const s of [-1, 1]) { const b = mesh(new RoundedBoxGeometry(0.03, 0.0062, 0.006, 2, 0.0025), mBrow, g, s * 0.032, 0.036, S(s * 0.032, 0.036) + 0.0015, false); b.rotation.z = s * -0.1; b.userData.y0 = 0.036; brows.push(b); }
  // mouth: flat lips (default), a smile arc, an "O"; `open` = the dark jaw opening shown by simFace (talking / yelling)
  const zM = S(0, -0.055), mouth = new THREE.Group(); mouth.position.set(0, -0.055, zM); g.add(mouth);
  const mInner = sk(0x3b1616, { rough: 0.8 });
  const flat = new THREE.Group(); mouth.add(flat);
  const up = mesh(new THREE.CapsuleGeometry(0.0038, 0.022, 4, 8), mLip, flat, 0, 0.0028, 0.0005, false); up.rotation.z = PI / 2; up.scale.set(1, 1, 0.7);
  const lo = mesh(new THREE.CapsuleGeometry(0.0046, 0.017, 4, 8), mLip, flat, 0, -0.0038, 0, false); lo.rotation.z = PI / 2; lo.scale.set(1, 1, 0.75);
  const smile = new THREE.Group(); mouth.add(smile);
  { const a = mesh(new THREE.TorusGeometry(0.016, 0.0036, 6, 16, 1.9), mLip, smile, 0, 0.012, -0.002, false); a.rotation.z = PI + (PI - 1.9) / 2 + 0.0; a.scale.set(1.05, 0.75, 0.7); }
  const oMouth = new THREE.Group(); mouth.add(oMouth);
  { const d = mesh(new THREE.CircleGeometry(0.0085, 16), mInner, oMouth, 0, -0.002, 0.003, false); d.scale.set(0.9, 1.2, 1); const r = mesh(new THREE.TorusGeometry(0.0095, 0.0033, 6, 16), mLip, oMouth, 0, -0.002, 0.002, false); r.scale.set(0.9, 1.2, 0.7); }
  oMouth.visible = false; smile.visible = false;
  const open = mesh(new THREE.CircleGeometry(0.01, 18), mInner, mouth, 0, -0.002, 0.0018, false); open.visible = false;
  // hair
  const hair = new THREE.Group(); g.add(hair);
  const st = o.hairStyle ?? 'short';
  if (st !== 'bald') {
    const capLen = st === 'long' || st === 'bun' ? 0.58 : 0.5;
    mesh(skullGeo(40, PI * capLen, 0.055, 0, 0, PI * 2, st === 'long' || st === 'bun' ? -0.85 : -0.62), mHair, hair);
    if (st === 'swoop' || st === 'short') {   // a side-swept fringe + a little top volume
      if (st === 'swoop') { const f = mesh(new THREE.SphereGeometry(0.07, 22, 12), mHair, hair, 0.006, 0.088, 0.018); f.scale.set(1.08, 0.5, 1.12); f.rotation.set(-0.25, 0, -0.12); }
      else { const f = mesh(new THREE.SphereGeometry(0.068, 22, 12), mHair, hair, 0, 0.082, 0.004); f.scale.set(1.08, 0.4, 1.15); }
      for (const s of [-1, 1]) { const sb = mesh(new THREE.BoxGeometry(0.008, 0.03, 0.022), mHair, hair, s * 0.074, 0.008, 0.02); sb.rotation.y = s * 0.2; }
    }
    if (st === 'bun') { mesh(new THREE.SphereGeometry(0.042, 18, 12), mHair, hair, 0, 0.07, -0.1); const b = mesh(new THREE.SphereGeometry(0.07, 20, 12), mHair, hair, 0, 0.0, -0.04); b.scale.set(1.12, 1.05, 1.0); }
    if (st === 'long') {   // a fall of hair behind the shoulders
      const back = mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.24, 20, 1, true, PI * 0.62, PI * 1.76), mHair, hair, 0, -0.07, -0.012); back.scale.set(1, 1, 0.9);
      for (const s of [-1, 1]) { const side = mesh(new THREE.SphereGeometry(0.05, 14, 10), mHair, hair, s * 0.068, -0.02, 0.005); side.scale.set(0.45, 1.5, 0.95); }
    }
  }
  if (o.beard) { const bd = mesh(skullGeo(32, PI * 0.42, 0.04, PI * 0.58, PI / 2 - 1.35, 2.7), sk(o.beard, { rough: 0.92 }), g); bd.position.z = 0.002; }
  const glasses = new THREE.Group(); g.add(glasses);
  { const mG = sk(0x2a2622, { rough: 0.3 }); for (const s of [-1, 1]) { mesh(new THREE.TorusGeometry(0.015, 0.0016, 6, 20), mG, glasses, s * EX, EY, S(s * EX, EY) + 0.008, false); const arm = mesh(new THREE.BoxGeometry(0.002, 0.002, 0.08), mG, glasses, s * 0.07, EY + 0.004, 0.035, false); arm.rotation.y = s * 0.1; } mesh(new THREE.BoxGeometry(0.018, 0.002, 0.002), mG, glasses, 0, EY + 0.004, S(0, EY) + 0.009, false); }
  glasses.visible = !!o.glasses;
  const tear = new THREE.Group(); g.add(tear); tear.visible = false;
  return { g, skull, eyesOpen, eyesClosed, looks, brows, mouth, flat, smile, oMouth, open, lower: lo, hair, hairMat: mHair, skinMat: mSkin, glasses, tear, beard: new THREE.Group() };
}

// ---------------------------------------------------------------- the body
const lathe = (pts, seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

export function makeSim(o = {}) {
  const root = new THREE.Group();
  const topKind = o.top ?? 'tee';
  const mTop = simMat('fabric', { color: o.topColor ?? 0x4f7d5c, rough: 0.95 });
  const mPants = simMat('fabric', { color: o.pants ?? 0x3e4f6e, rough: 0.92 });
  const mSkin = sk(o.skin ?? 0xd9a88a, { rough: 0.6 });
  const mShoe = sk(o.shoes ?? 0xf0efea, { rough: 0.55 }), mSole = sk(o.sole ?? 0xf7f6f2, { rough: 0.7 });
  const fem = !!o.female;
  // legs (rig.js joint layout: hip → knee (−L1) → ankle (−L2))
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(0.088 * s, HIP_H, 0); root.add(hip);
    mesh(new THREE.SphereGeometry(0.072, 16, 12), mPants, hip);
    mesh(new THREE.CylinderGeometry(0.071, 0.053, L1, 18), mPants, hip, 0, -L1 / 2, 0);
    const knee = new THREE.Group(); knee.position.y = -L1; hip.add(knee);
    mesh(new THREE.SphereGeometry(0.053, 14, 10), mPants, knee);
    mesh(new THREE.CylinderGeometry(0.052, 0.042, L2, 16), mPants, knee, 0, -L2 / 2, 0);
    const ankle = new THREE.Group(); ankle.position.y = -L2; knee.add(ankle);
    mesh(new RoundedBoxGeometry(0.092, 0.075, 0.25, 3, 0.032), mShoe, ankle, 0, -0.006, 0.05);
    mesh(new RoundedBoxGeometry(0.1, 0.024, 0.262, 2, 0.01), mSole, ankle, 0, -0.035, 0.05);
    legs.push({ hip, knee, ankle, s });
  }
  // pelvis + torso (a lathe with an elliptical section) + neck
  const pelvis = new THREE.Group(); pelvis.position.y = HIP_H; root.add(pelvis);
  { const h = mesh(new THREE.CapsuleGeometry(0.122, 0.07, 6, 20), mPants, pelvis, 0, -0.005, -0.005); h.scale.set(fem ? 1.16 : 1.08, 1, 0.72); }
  { const belt = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.035, 24, 1, true), sk(0x2b2420, { rough: 0.5 }), pelvis, 0, 0.075, -0.005); belt.scale.set(fem ? 1.12 : 1.06, 1, 0.73); belt.visible = topKind === 'shirt'; }
  const spine = new THREE.Group(); pelvis.add(spine);
  const loose = topKind === 'hoodie' || topKind === 'cardigan' ? 0.012 : 0;
  const prof = fem
    ? [[0.118, 0.02], [0.112, 0.1], [0.116, 0.2], [0.135, 0.3], [0.142, 0.38], [0.14, 0.46], [0.13, 0.52], [0.1, 0.565], [0.055, 0.59], [0.04, 0.6]]
    : [[0.128, 0.02], [0.126, 0.1], [0.13, 0.2], [0.142, 0.3], [0.152, 0.4], [0.153, 0.47], [0.142, 0.53], [0.11, 0.572], [0.06, 0.598], [0.045, 0.61]];
  const torso = mesh(lathe(prof.map(([r, y]) => [r + loose, y])), mTop, spine, 0, 0.02, 0); torso.scale.set(1, 1, 0.64);
  mesh(new THREE.CylinderGeometry(fem ? 0.042 : 0.048, 0.052, 0.14, 16), mSkin, spine, 0, 0.66, 0.0);
  if (topKind === 'tee' || topKind === 'shirt') { const c = mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 22), topKind === 'shirt' ? simMat('white') : mTop, spine, 0, 0.6, 0.005); c.rotation.x = PI / 2 - 0.25; c.scale.set(1, 1.15, 1); }
  if (topKind === 'hoodie') {
    const hood = mesh(new THREE.TorusGeometry(0.085, 0.04, 10, 24), mTop, spine, 0, 0.6, -0.035); hood.rotation.x = PI / 2 - 0.5; hood.scale.set(1.05, 1.15, 1);
    const pk = mesh(new RoundedBoxGeometry(0.2, 0.1, 0.02, 2, 0.008), simMat('fabric', { color: new THREE.Color(o.topColor ?? 0x4f7d5c).multiplyScalar(0.88).getHex() }), spine, 0, 0.17, 0.088); pk.rotation.x = -0.06;
    for (const s of [-1, 1]) { const d = mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 6), simMat('white'), spine, s * 0.028, 0.5, 0.095); d.rotation.x = 0.12; }
  }
  if (topKind === 'cardigan') { mesh(new THREE.BoxGeometry(0.01, 0.48, 0.01), sk(new THREE.Color(o.topColor ?? 0x8a6f9e).multiplyScalar(0.7)), spine, 0, 0.3, 0.098); }
  if (topKind === 'shirt') { for (let i = 0; i < 4; i++) mesh(new THREE.SphereGeometry(0.0055, 8, 6), simMat('white'), spine, 0, 0.18 + i * 0.1, 0.097); }
  const belly = new THREE.Group(); belly.visible = false; spine.add(belly);
  const headG = new THREE.Group(); headG.position.y = 0.64; spine.add(headG);
  const H = makeSimHead({ skin: o.skin ?? 0xd9a88a, hair: o.hair ?? 0x3a2a1e, hairStyle: o.hairStyle, eyes: o.eyes, female: fem, beard: o.beard, glasses: o.glasses, brow: o.brow });
  H.g.position.set(0, fem ? 0.135 : 0.145, 0.014); if (fem) H.g.scale.setScalar(0.95); headG.add(H.g);
  // arms (shoulder → elbow −0.285 → wrist −0.25)
  const arms = [];
  const sleeveLong = topKind !== 'tee';
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group(); shoulder.position.set((fem ? 0.165 : 0.182) * s, 0.522, -0.006); spine.add(shoulder);
    mesh(new THREE.SphereGeometry(0.054 + loose * 0.6, 16, 12), mTop, shoulder);
    mesh(new THREE.CylinderGeometry(0.046 + loose, 0.04 + loose, 0.285, 16), sleeveLong ? mTop : mSkin, shoulder, 0, -0.142, 0);
    if (!sleeveLong) mesh(new THREE.CylinderGeometry(0.054, 0.05, 0.14, 16, 1, true), mTop, shoulder, 0, -0.06, 0).material = mTop;
    const elbow = new THREE.Group(); elbow.position.y = -0.285; shoulder.add(elbow);
    mesh(new THREE.SphereGeometry(0.039 + loose, 14, 10), sleeveLong ? mTop : mSkin, elbow);
    mesh(new THREE.CylinderGeometry(0.038 + loose, 0.03 + loose * 0.8, 0.235, 14), sleeveLong ? mTop : mSkin, elbow, 0, -0.118, 0);
    if (sleeveLong && topKind !== 'shirt') mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.03, 14), mTop, elbow, 0, -0.225, 0);
    const hand = new THREE.Group(); hand.position.y = -0.25; elbow.add(hand);
    mesh(new THREE.SphereGeometry(0.026, 12, 8), mSkin, hand, 0, 0.0, 0);
    { const palm = mesh(new RoundedBoxGeometry(0.03, 0.08, 0.068, 2, 0.012), mSkin, hand, -s * 0.002, -0.045, 0.004); palm.rotation.z = s * 0.05; }
    { const fing = mesh(new RoundedBoxGeometry(0.024, 0.07, 0.062, 2, 0.011), mSkin, hand, -s * 0.008, -0.105, 0.006); fing.rotation.z = s * 0.25; }
    { const th = mesh(new THREE.CapsuleGeometry(0.0115, 0.035, 4, 8), mSkin, hand, -s * 0.012, -0.045, 0.038); th.rotation.set(0.5, 0, s * 0.35); }
    arms.push({ shoulder, elbow, hand, s });
  }
  const P = { root, legs, pelvis, spine, headG, head: H, arms, belly, dress: null, sim: true,
    mats: { top: mTop, pants: mPants, hair: H.hairMat, skin: mSkin, faceSkin: H.skinMat } };
  if (o.scale) root.scale.setScalar(o.scale);
  return P;
}

/** Face extras after applyPose: open (jaw 0..1, talking/yelling), look [yaw, pitch] (rad, eyes only), brows −1 (angry) … +1 (raised), smile. */
export function simFace(P, f = {}) {
  const H = P.head;
  const op = clamp(f.open ?? 0);
  if (op > 0.04) { H.open.visible = true; H.open.scale.set(1.15 - 0.2 * op, 0.35 + 1.1 * op, 1); H.lower.position.y = -0.0038 - 0.012 * op; H.flat.visible = true; H.smile.visible = false; H.oMouth.visible = false; }
  else { H.open.visible = false; H.lower.position.y = -0.0038; }
  const [yaw, pitch] = f.look ?? [0, 0];
  for (const l of H.looks) l.rotation.set(clamp(-pitch, -0.5, 0.5), clamp(yaw, -0.6, 0.6), 0);
  const b = f.brows ?? 0;
  H.brows.forEach((br, i) => { const s = i ? 1 : -1; br.position.y = br.userData.y0 + 0.006 * b; br.rotation.z = s * (-0.1 - 0.28 * Math.min(0, b) * -1 + 0.12 * Math.max(0, b)); });
}

/** Legs straight out in front, toes up — sitting up in bed (call after applyPose; the duvet hides them anyway). */
export function legsOut(P, { spread = 0.05, hide = true } = {}) {
  for (const L of P.legs) { L.hip.rotation.set(-PI / 2 + 0.06, 0, L.s * spread); L.knee.rotation.x = 0.06; L.ankle.rotation.x = -0.1; L.hip.visible = !hide; }
}
/** Undo legsOut's hiding (call before applyPose when the same rig gets out of bed). */
export function legsShow(P) { for (const L of P.legs) L.hip.visible = true; }

/** World position of a rig part (head / hand) — call after posing. */
const _w = new THREE.Vector3();
export function headWorld(P) { P.root.updateMatrixWorld(true); return P.head.g.getWorldPosition(_w).clone(); }
