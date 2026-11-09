// 055: a toy hippo (the hero of the burger-joint dupe). Big round body, stubby legs, a broad boxy muzzle with nostril bumps on
// top, little eyes + tiny ears on top of the head, a lower jaw that drops to a real 150° gape (tusks, tongue, pink palate), a
// paddle tail. Model faces +z; origin = the ground under the middle of the body. ~4.0 m nose to tail, 1.7 m to the ear tips,
// 1.56 m wide (a 1,500 kg hippo next to a 1.75 m rig person).
//   const H = makeHippo({ name: 'OTIS' });  scene.add(H.g);  H.g.position/rotation.y place it.
//   H.update(t, { walk 0..1, run 0..1, dist (m along his path — drives the gait), open 0..1 (1 = 150° gape), chew 0..1,
//                 pitch, yaw, roll (head, rad; pitch > 0 = nose up), eyes 'open'|'closed'|'happy'|'wide'|'sad', lids 0..1,
//                 lookX/lookY (pupils, -1..1), ears 0..1 (1 = pinned back / droopy), squeeze 0..1 (cartoon squash through a door),
//                 lean (body pitch, + = nose down), sink (m, lowers the whole body: water), wet 0..1 (gloss), wag, still, breathe })
//   H.cap (tiny staff cap on his head), H.badge.set(text, gold) (shoulder name tag), H.anchors.{mouth, nose, head, back},
//   H.footWorld(i) → world position of a foot (0 FL, 1 FR, 2 BL, 3 BR), H.feet = [{group, ph}] for crack timing (footDown(t,…)).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, mat, mk, canvasTex } from './core.js';

const ss = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const HIPPO = { stride: 1.0, bodyY: 0.95, legTop: 0.62, width: 1.6, length: 4.0, mouthZ: 2.4, headY: 1.08, neckZ: 1.3 };

export function makeHippo(o = {}) {
  const SKIN = new THREE.Color(o.skin ?? 0x8f7f98), BELLY = new THREE.Color(o.belly ?? 0xd7aab6);
  const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
  const body = new THREE.Group(); rig.add(body);

  // body: one big ellipsoid, belly blended pink by vertex colour, a slightly darker back
  const bg = new THREE.SphereGeometry(1, 48, 32), col = [], n = bg.attributes.normal, c = new THREE.Color();
  for (let i = 0; i < n.count; i++) {
    const ny = n.getY(i), k = ss((-ny - 0.15) / 0.55);
    c.copy(SKIN).lerp(BELLY, k * 0.9); if (ny > 0.55) c.multiplyScalar(1 - 0.06 * ss((ny - 0.55) / 0.4));
    col.push(c.r, c.g, c.b);
  }
  bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const mBody = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0 });
  const mSkin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.5, metalness: 0 });
  const mPink = mat(0xe896a6, 0.55), mMouth = mat(0xb94a62, 0.6), mTooth = mat(0xf4ecd6, 0.35), mDark = mat(0x1d1416, 0.4);
  const torso = mk(bg, mBody, body, 0, HIPPO.bodyY, -0.05); torso.scale.set(0.8, 0.62, 1.45);
  const chest = mk(new THREE.SphereGeometry(1, 36, 24), mSkin, body, 0, 1.0, 0.8); chest.scale.set(0.72, 0.55, 0.62);
  // a soft fold line where the head meets the body + skin creases on the shoulders
  for (const s of [-1, 1]) { const f = mk(new THREE.TorusGeometry(0.16, 0.025, 6, 16, Math.PI * 0.8), mSkin, body, s * 0.52, 1.18, 1.0); f.rotation.set(0, s * 1.2, 0.3 * s); }

  // legs: pivot at the top, a foot pad with four cream toenails at the front
  const legs = [], LEG = [[-0.5, 0.85], [0.5, 0.85], [-0.5, -0.88], [0.5, -0.88]];
  LEG.forEach(([x, z], i) => {
    const hip = new THREE.Group(); hip.position.set(x, HIPPO.legTop, z); body.add(hip);
    mk(new THREE.CylinderGeometry(0.27, 0.25, 0.56, 18), mSkin, hip, 0, -0.28, 0);
    mk(new THREE.SphereGeometry(0.3, 16, 10), mSkin, hip, 0, 0.02, 0).scale.set(1, 1.1, 1.05);
    const foot = mk(new THREE.CylinderGeometry(0.26, 0.28, 0.1, 18), mSkin, hip, 0, -HIPPO.legTop + 0.05, 0.01);
    for (let k = 0; k < 4; k++) { const a = -0.75 + k * 0.5; mk(new THREE.SphereGeometry(0.055, 10, 8), mTooth, hip, Math.sin(a) * 0.25, -HIPPO.legTop + 0.045, Math.cos(a) * 0.25).scale.set(1, 0.7, 0.8); }
    legs.push({ hip, foot, x, z, front: z > 0, ph: i === 0 || i === 3 ? 0 : Math.PI });
  });

  // tail: a little paddle with a dark tuft
  const tail = new THREE.Group(); tail.position.set(0, 1.08, -1.45); body.add(tail);
  const tl = mk(new THREE.CylinderGeometry(0.035, 0.07, 0.34, 10), mSkin, tail, 0, -0.15, -0.05); tl.rotation.x = -0.35; tl.scale.set(1.7, 1, 0.55);
  mk(new THREE.SphereGeometry(0.05, 8, 6), mDark, tail, 0, -0.31, -0.11).scale.set(1.4, 1, 0.6);

  // ---- head: headG pivots at the neck. Cranium + muzzle + eyes + ears move together (pitch up = part of the gape);
  // jawL (lower jaw + tongue + tusks) hinges down from under the eyes.
  const neck = new THREE.Group(); neck.position.set(0, HIPPO.headY, HIPPO.neckZ); body.add(neck);
  const headG = new THREE.Group(); neck.add(headG);
  const cran = mk(new THREE.SphereGeometry(1, 36, 24), mSkin, headG, 0, 0.08, 0.2); cran.scale.set(0.5, 0.44, 0.52);
  const muz = mk(new RoundedBoxGeometry(1.04, 0.46, 0.94, 5, 0.2), mSkin, headG, 0, 0.08, 0.78);
  mk(new THREE.SphereGeometry(1, 28, 18), mSkin, headG, 0, 0.14, 1.0).scale.set(0.5, 0.24, 0.26);   // a round nose pad on the front
  mk(new RoundedBoxGeometry(0.86, 0.06, 0.76, 2, 0.03), mPink, headG, 0, -0.13, 0.8);    // palate (seen when the mouth opens)
  for (const s of [-1, 1]) {
    mk(new THREE.SphereGeometry(0.15, 18, 12), mSkin, headG, s * 0.22, 0.26, 1.02).scale.set(1, 0.72, 1);   // nostril bumps
    const nos = mk(new THREE.SphereGeometry(0.034, 12, 8), mat(0x6a4450, 0.6), headG, s * 0.2, 0.352, 1.07); nos.scale.set(1.3, 0.3, 0.6); nos.rotation.y = s * 0.5;
    mk(new THREE.SphereGeometry(0.13, 14, 10), mPink, headG, s * 0.45, -0.02, 0.86).scale.set(0.5, 0.62, 0.9);  // cheek blush
    for (let k = 0; k < 3; k++) mk(new THREE.SphereGeometry(0.012, 6, 4), mDark, headG, s * (0.36 + k * 0.035), 0.06 - k * 0.04, 1.13);  // whisker dots
    const up = mk(new THREE.ConeGeometry(0.036, 0.11, 10), mTooth, headG, s * 0.34, -0.17, 1.02); up.rotation.x = Math.PI;              // upper canines
  }
  const muzMat = muz.material;

  // eyes on top of the head: a skin bump, white, pupil, a lid cap that rolls down
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * 0.27, 0.36, 0.3); headG.add(e);
    mk(new THREE.SphereGeometry(0.135, 18, 12), mSkin, e, 0, -0.03, -0.02).scale.set(1, 0.85, 1);
    const white = mk(new THREE.SphereGeometry(0.095, 18, 12), mat(0xfbf7f1, 0.3), e, s * 0.012, 0.03, 0.06);
    const pupil = mk(new THREE.SphereGeometry(0.062, 14, 10), mDark, e, s * 0.012, 0.035, 0.122); pupil.scale.set(1, 1.1, 0.6);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); glint.position.set(s * 0.012 + 0.02, 0.065, 0.155); e.add(glint);
    const lid = new THREE.Group(); lid.position.set(s * 0.012, 0.03, 0.06); e.add(lid);
    mk(new THREE.SphereGeometry(0.103, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mSkin, lid);
    const lidLo = new THREE.Group(); lidLo.position.copy(lid.position); e.add(lidLo);   // a lower lid for the "happy" squint
    mk(new THREE.SphereGeometry(0.102, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mSkin, lidLo);
    eyes.push({ e, white, pupil, glint, lid, lidLo, s });
  }
  // ears: tiny, with pink insides
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(s * 0.31, 0.43, 0.04); headG.add(ear);
    const sh = mk(new THREE.SphereGeometry(0.09, 14, 10), mSkin, ear, 0, 0.07, 0); sh.scale.set(0.75, 1.15, 0.45);
    mk(new THREE.SphereGeometry(0.06, 12, 8), mPink, ear, 0, 0.075, 0.03).scale.set(0.6, 1.0, 0.3);
    ears.push({ ear, s });
  }
  // lower jaw
  const jawL = new THREE.Group(); jawL.position.set(0, -0.17, 0.12); headG.add(jawL);
  mk(new RoundedBoxGeometry(0.98, 0.3, 0.92, 4, 0.13), mSkin, jawL, 0, -0.12, 0.5);
  mk(new RoundedBoxGeometry(0.82, 0.05, 0.8, 2, 0.02), mMouth, jawL, 0, 0.02, 0.5);                        // mouth floor
  const tongue = mk(new RoundedBoxGeometry(0.5, 0.1, 0.56, 3, 0.05), mPink, jawL, 0, 0.06, 0.45);
  for (const s of [-1, 1]) {
    const tusk = mk(new THREE.ConeGeometry(0.055, 0.24, 12), mTooth, jawL, s * 0.36, 0.12, 0.84); tusk.rotation.z = -s * 0.12;
    mk(new THREE.ConeGeometry(0.03, 0.09, 8), mTooth, jawL, s * 0.11, 0.07, 0.92);
  }
  mk(new RoundedBoxGeometry(0.98, 0.07, 0.12, 2, 0.03), mSkin, jawL, 0, 0.01, 0.92);   // lower lip rim

  // accessories: a tiny staff cap (the gag: one size fits nobody) + a shoulder name tag
  const cap = new THREE.Group(); cap.position.set(0.02, 0.45, 0.16); cap.rotation.set(-0.12, 0.25, 0.1); headG.add(cap);
  const capM = mat(o.capColor ?? 0xd8392b, 0.6);
  mk(new THREE.SphereGeometry(0.15, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), capM, cap).scale.set(1, 0.85, 1);
  const visor = mk(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 20, 1, false, -Math.PI / 2, Math.PI), capM, cap, 0, 0.005, 0.07); visor.scale.set(0.9, 1, 1.25);
  mk(new THREE.SphereGeometry(0.025, 8, 6), mat(0xf4c430, 0.5), cap, 0, 0.13, 0);
  cap.visible = false;
  const tagC = document.createElement('canvas'); tagC.width = 256; tagC.height = 112;
  const tagTex = new THREE.CanvasTexture(tagC); tagTex.colorSpace = THREE.SRGBColorSpace;
  const badgeMesh = mk(new RoundedBoxGeometry(0.34, 0.15, 0.02, 2, 0.01), [mat(0xffffff, 0.5), mat(0xffffff, 0.5), mat(0xffffff, 0.5), mat(0xffffff, 0.5), new THREE.MeshStandardMaterial({ map: tagTex, roughness: 0.45 }), mat(0xffffff, 0.5)], body, 0.6, 1.3, 0.62);
  badgeMesh.rotation.set(-0.35, 0.95, 0.12);
  const badge = {
    mesh: badgeMesh,
    set(text, gold = false) {
      const g2 = tagC.getContext('2d');
      g2.fillStyle = gold ? '#f3c046' : '#d8392b'; g2.fillRect(0, 0, 256, 112); g2.fillStyle = gold ? '#fff8e0' : '#fff'; g2.fillRect(10, 34, 236, 68);
      g2.fillStyle = gold ? '#7a5200' : '#fff'; g2.font = '700 26px Inter, Arial'; g2.textAlign = 'center'; g2.fillText(gold ? '★ MANAGER ★' : "CHOMPY'S", 128, 27);
      g2.fillStyle = '#222'; g2.font = '800 50px Inter, Arial'; g2.fillText(text, 128, 86); tagTex.needsUpdate = true;
    },
  };
  badge.set(o.name ?? 'OTIS'); badgeMesh.visible = false;

  const anchors = { mouth: new THREE.Group(), nose: new THREE.Group(), head: new THREE.Group(), back: new THREE.Group(), jaw: new THREE.Group() };
  anchors.mouth.position.set(0, -0.1, 1.28); headG.add(anchors.mouth);
  anchors.nose.position.set(0, 0.32, 1.0); headG.add(anchors.nose);
  anchors.head.position.set(0, 0.55, 0.15); headG.add(anchors.head);
  anchors.back.position.set(0, 1.62, -0.2); body.add(anchors.back);
  anchors.jaw.position.set(0, 0.1, 0.85); jawL.add(anchors.jaw);

  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const _v = new THREE.Vector3();

  function update(t, s = {}) {
    const walk = clamp(s.walk ?? 0), run = clamp(s.run ?? 0), dist = s.dist ?? 0, still = !!s.still;
    const gait = Math.max(walk, run), ph = (dist / HIPPO.stride) * Math.PI * 2;
    const amp = 0.3 * walk + 0.55 * run;
    legs.forEach((L) => {
      const a = ph + L.ph, sw = Math.sin(a) * amp;
      L.hip.rotation.x = L.front ? sw : -sw * 0.9;
      L.hip.position.y = HIPPO.legTop + (0.05 * walk + 0.12 * run) * Math.max(0, Math.cos(a)) * (L.front ? 1 : 0.8);
    });
    // body: bob with the gait, breathe, a waddle roll; squeeze = squash sideways (doorways); sink = lower into water
    const bob = gait * (0.025 + 0.05 * run) * Math.abs(Math.sin(ph)), br = still ? 0 : 0.012 * Math.sin(t * (s.breathe ?? 1.7));
    const sq = clamp(s.squeeze ?? 0);
    rig.position.y = bob - (s.sink ?? 0);
    rig.rotation.z = (s.roll ?? 0) * 0.25 + gait * 0.035 * Math.sin(ph) + (still ? 0 : 0.008 * Math.sin(t * 0.9));
    rig.rotation.x = (s.lean ?? 0) + run * 0.06;
    body.scale.set(1 - 0.38 * sq, 1 + br + 0.12 * sq, 1 + 0.06 * sq);
    // head: pitch (+ = nose up), yaw, roll; the gape is 35 % head-up + 65 % jaw-down
    const G = clamp(s.open ?? 0) * 2.62 + (s.chew ?? 0) * 0.18 * (0.5 + 0.5 * Math.sin(t * 11));
    const nod = still ? 0 : 0.025 * Math.sin(t * 1.3) + gait * 0.04 * Math.sin(ph * 2);
    headG.rotation.set(-((s.pitch ?? 0) + 0.35 * G) + nod, s.yaw ?? 0, s.roll ?? 0, 'YXZ');
    jawL.rotation.x = 0.65 * G;
    tongue.position.y = 0.06 + 0.04 * clamp(G / 1.2);
    // eyes
    const mode = s.eyes ?? 'open', period = 3.4 + ((s.seed ?? 0) % 3) * 0.6;
    const blinking = !still && (t + (s.seed ?? 0) * 1.3) % period < 0.14;
    let lid = s.lids ?? 0, lo = 0, sc = 1;
    if (mode === 'closed' || blinking) lid = 1;
    if (mode === 'happy') { lid = 0.72; lo = 0.7; }
    if (mode === 'sad') lid = Math.max(lid, 0.45);
    if (mode === 'wide') { lid = 0; sc = 1.12; }
    for (const E of eyes) {
      E.lid.rotation.x = lerp(-0.85, 1.62, lid);
      E.lidLo.rotation.x = lerp(0.85, -0.25, lo); E.lidLo.visible = lo > 0.01;
      E.white.scale.setScalar(sc); E.pupil.position.x = E.s * 0.012 + 0.024 * (s.lookX ?? 0); E.pupil.position.y = 0.035 + 0.024 * (s.lookY ?? 0) * sc;
      E.pupil.scale.set(sc * 0.95, sc * 1.05, 0.6); E.glint.position.x = E.pupil.position.x + 0.02; E.glint.position.y = E.pupil.position.y + 0.03;
      E.glint.visible = lid < 0.6;
    }
    // ears: a flick every few seconds, pinned back with s.ears
    const ek = clamp(s.ears ?? 0);
    for (const E of ears) {
      const flick = still ? 0 : Math.max(0, Math.sin(t * 2.3 + E.s * 1.7)) ** 12 * 0.6;
      E.ear.rotation.set(-0.2 - 0.9 * ek, 0, E.s * (-0.25 - 0.7 * ek - flick));
    }
    tail.rotation.y = (s.wag ?? 0) * 0.6 * Math.sin(t * 14) + (still ? 0 : 0.12 * Math.sin(t * 2.1));
    const wet = clamp(s.wet ?? 0); mBody.roughness = mSkin.roughness = lerp(0.5, 0.16, wet);
    void muzMat;
  }

  /** world position of foot i (0 FL, 1 FR, 2 BL, 3 BR) — after update(). */
  function footWorld(i) { g.updateMatrixWorld(true); return legs[i].foot.getWorldPosition(_v).clone(); }
  /** times (s) when foot i plants, for a walk with dist(t): a plant happens when the swing phase crosses 3π/2 → cos = 0 going down. */
  function footPhase(i, dist) { const a = (dist / HIPPO.stride) * Math.PI * 2 + legs[i].ph; return a; }
  update(0, {});
  return { g, rig, body, headG, jawL, legs, eyes, ears, tail, cap, badge, anchors, update, footWorld, footPhase, mats: { body: mBody, skin: mSkin } };
}
