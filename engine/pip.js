// PIP — the recurring hero of lane 3 (@ed._.sims, docs/lanes/lane3.md): a toy corgi puppy, his crate and his family.
// Built for video 021 (Pip ep. 1, first night home); every Pip episode imports this file.
//
//   const pip = makePip();  scene.add(pip.g);  pip.g.position/rotation.y place him (model faces +z, origin on the floor).
//   pip.update(t, { walk, run, dist, wag, ears, sit, lie, beg, sleep, whimper, howl, hop, roll, headPitch, headYaw, tilt,
//                   mouth, open, tongue, lick, eyes, lids, sad, lookX, lookY, sniff, shiver, tailDown, still }) — every frame.
//   Motion is built in: he breathes, blinks, twitches an ear and sways his tail even with an empty state, so no frame is static.
//   pip.anchors.hat / .mouth / .back / .tag — parent costumes and props to these (bunny in his mouth, a Halloween hat).
//   makePip({ fur, white, cream, earInner, collar, tag, name, size, earStyle: 'up'|'flop' }) = other dogs for a dog park.
//   makeCrate() = the big wire crate (door at +z, panels you can hide for a shot); makeMia / makeMom / makeDad = his family.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, applyPose } from '@engine/rig.js';
import { dotsTexture } from '@engine/props.js';

const PI = Math.PI;
const UP = new THREE.Vector3(0, 1, 0), FWD = new THREE.Vector3(0, 0, 1);

// soft speckle so the fur doesn't read as plastic
let _fur = null;
function furTex() {
  if (_fur) return _fur;
  _fur = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ededed'; g.fillRect(0, 0, w, h);
    let s = 7; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 900; i++) { const x = r() * w, y = r() * h, l = 3 + r() * 7; g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.12 + r() * 0.16})` : `rgba(90,70,50,${0.035 + r() * 0.06})`; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y + l); g.stroke(); }
  }, [2, 2]);
  return _fur;
}
/** Tag disc face: the name engraved on gold. */
function tagTex(name) {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.4, h * 0.35, 4, w / 2, h / 2, w * 0.6); gr.addColorStop(0, '#fff1b8'); gr.addColorStop(0.55, '#f0c35a'); gr.addColorStop(1, '#b8862a');
    g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
    g.strokeStyle = 'rgba(120,80,20,.6)'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, 7); g.stroke();
    g.fillStyle = '#5a3a12'; g.font = `bold ${name.length > 3 ? 34 : 46}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, w / 2, h / 2 + 4);
  });
}
const cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
/** Stretch a unit cylinder mesh (radius r) between points a and b. */
function span(m, a, b, r) {
  const d = new THREE.Vector3().subVectors(b, a), L = Math.max(1e-4, d.length());
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.multiplyScalar(1 / L)); m.scale.set(r, L, r);
}
/** Smooth 0→1→0 pulses: [[t0, dur], ...] or [t0, ...] (dur = def). Use for whimpers, licks, sniffs (sync the same times in cues). */
export function pulseAt(t, times, def = 0.45, att = 0.07, rel = 0.25) {
  let k = 0;
  for (const e of times) {
    const t0 = Array.isArray(e) ? e[0] : e, d = Array.isArray(e) ? e[1] : def;
    if (t < t0 || t > t0 + d + rel) continue;
    const a = clamp((t - t0) / att), r = 1 - clamp((t - t0 - d) / rel);
    k = Math.max(k, a * a * (3 - 2 * a) * r * r * (3 - 2 * r));
  }
  return k;
}

export function makePip(o = {}) {
  const C = {
    fur: o.fur ?? 0xdc8434, white: o.white ?? 0xfbf3e8, cream: o.cream ?? 0xf3d6ae, earInner: o.earInner ?? 0xf1a69c,
    nose: o.nose ?? 0x1e1512, eye: o.eye ?? 0x2b170c, collar: o.collar ?? 0xd5352b, tag: o.tag ?? 0xe8b84a,
  };
  const fur = furTex();
  const furM = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.93, map: fur });
  const mFur = furM(C.fur), mWhite = furM(C.white), mCream = furM(C.cream), mInner = mat(C.earInner, 0.85);
  const mNose = mat(C.nose, 0.22), mEye = mat(C.eye, 0.1), mPupil = mat(0x070403, 0.08), mDark = mat(0x2a1612, 0.5);
  const mMouth = mat(0x6a2422, 0.6), mTongue = mat(0xe9737c, 0.45), mGlint = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6) });
  const mCollar = mat(C.collar, 0.55), mGold = new THREE.MeshStandardMaterial({ color: C.tag, roughness: 0.28, metalness: 0.75 });

  const g = new THREE.Group();            // placement (position on the floor, rotation.y)
  const R = new THREE.Group(); g.add(R);  // size + hop
  R.scale.setScalar(o.size ?? 1);

  // ---------------------------------------------------------------- torso (pivots for sit / lie / beg)
  const T = new THREE.Group(); R.add(T);
  const bodyGeo = new THREE.CapsuleGeometry(0.08, 0.17, 8, 18); bodyGeo.rotateX(PI / 2);
  const body = mk(bodyGeo, mFur, T); body.scale.set(1.05, 0.95, 1);
  const belly = mk(new THREE.SphereGeometry(0.07, 20, 14), mWhite, T, 0, -0.036, 0.02); belly.scale.set(0.92, 0.72, 1.75);
  const bib = mk(new THREE.SphereGeometry(0.078, 22, 16), mWhite, T, 0, 0.0, 0.104); bib.scale.set(1.04, 1.12, 0.9);
  mk(new THREE.SphereGeometry(0.05, 14, 10), mWhite, T, 0, -0.045, 0.125).scale.set(1.2, 0.8, 1);   // fluffy chest
  for (const s of [-1, 1]) {
    mk(new THREE.SphereGeometry(0.066, 18, 14), mFur, T, s * 0.036, 0.012, -0.118);
    mk(new THREE.SphereGeometry(0.048, 16, 12), mCream, T, s * 0.034, -0.026, -0.156);   // fluffy "corgi pants"
  }
  const HIP_L = new THREE.Vector3(0, -0.045, -0.115);
  const SH = [[-1, 0.1], [1, 0.1], [-1, -0.115], [1, -0.115]].map(([s, z]) => new THREE.Vector3(s * 0.048, -0.045, z));   // FL FR BL BR
  const NECK_L = new THREE.Vector3(0, 0.056, 0.12);

  // ---------------------------------------------------------------- tail: a fluffy plume that curls up
  const tailB = new THREE.Group(); tailB.position.set(0, 0.03, -0.172); tailB.rotation.order = 'YXZ'; T.add(tailB);
  const tailJ = []; let par = tailB;
  [0.024, 0.031, 0.035, 0.035, 0.031, 0.023].forEach((r, i) => {
    const j = new THREE.Group(); j.position.z = i ? -0.026 : 0; par.add(j); tailJ.push(j); par = j;
    const m = mk(new THREE.SphereGeometry(r, 14, 10), i < 4 ? mFur : mCream, j, 0, 0, -0.016); m.scale.set(1, 1, 1.45);
    if (i > 0 && i < 5) for (const a of [0.5, 2.6, 4.4]) mk(new THREE.SphereGeometry(r * 0.6, 10, 8), i < 4 ? mFur : mCream, j, Math.cos(a + i) * r * 0.55, Math.sin(a + i) * r * 0.55, -0.014);
  });

  // ---------------------------------------------------------------- legs (stretched between the body and planted paws)
  const legs = SH.map((sh, i) => {
    const front = i < 2;
    const upper = mk(cyl, mFur, R), lower = mk(cyl, mWhite, R);
    const knee = mk(new THREE.SphereGeometry(1, 12, 10), mWhite, R); knee.scale.setScalar(0.029);
    const top = mk(new THREE.SphereGeometry(1, 12, 10), mFur, R); top.scale.setScalar(front ? 0.03 : 0.04);
    const paw = mk(new THREE.SphereGeometry(0.034, 14, 10), mWhite, R); paw.scale.set(1.0, 0.62, 1.3);
    return { sh, front, upper, lower, knee, top, paw, s: sh.x < 0 ? -1 : 1, P: new THREE.Vector3(), S: new THREE.Vector3(), K: new THREE.Vector3() };
  });

  // ---------------------------------------------------------------- neck + collar + tag
  const neck = mk(new THREE.SphereGeometry(0.058, 18, 14), mFur, R);
  const throat = mk(new THREE.SphereGeometry(0.05, 16, 12), mWhite, R);
  const collar = mk(new THREE.TorusGeometry(0.057, 0.0105, 10, 32), mCollar, R);
  const tag = new THREE.Group(); R.add(tag);
  mk(new THREE.TorusGeometry(0.006, 0.0018, 6, 12), mGold, tag, 0, 0.004, 0);
  const disc = mk(new THREE.CylinderGeometry(0.021, 0.021, 0.004, 28), mGold, tag, 0, -0.019, 0); disc.rotation.x = PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.0205, 28), new THREE.MeshStandardMaterial({ map: tagTex(o.name ?? 'PIP'), roughness: 0.35, metalness: 0.35 }));
  face.position.set(0, -0.019, 0.0024); tag.add(face);

  // ---------------------------------------------------------------- head (big puppy head; +z = face)
  const H = new THREE.Group(); H.rotation.order = 'YXZ'; R.add(H);
  const skull = mk(new THREE.SphereGeometry(0.1, 36, 26), mFur, H); skull.scale.set(1.12, 0.98, 1.0);
  const blaze = mk(new THREE.CapsuleGeometry(0.016, 0.07, 6, 12), mWhite, H, 0, 0.036, 0.087); blaze.rotation.x = -0.42; blaze.scale.set(1.25, 1, 0.55);
  const muzzle = mk(new THREE.SphereGeometry(0.052, 26, 18), mWhite, H, 0, -0.036, 0.074); muzzle.scale.set(1.22, 0.84, 1.08);
  for (const s of [-1, 1]) { const c = mk(new THREE.SphereGeometry(0.04, 16, 12), mWhite, H, s * 0.053, -0.045, 0.047); c.scale.set(1.05, 0.85, 0.9); }
  const nose = mk(new THREE.SphereGeometry(0.019, 18, 12), mNose, H, 0, -0.016, 0.13); nose.scale.set(1.4, 0.95, 0.9);
  mk(new THREE.CapsuleGeometry(0.0022, 0.008, 4, 6), mDark, H, 0, -0.041, 0.1285);
  const smile = new THREE.Group(); H.add(smile);
  for (const s of [-1, 1]) { const a = mk(new THREE.TorusGeometry(0.0105, 0.0027, 6, 14, PI), mDark, smile, s * 0.0102, -0.0475, 0.1255); a.rotation.z = PI; }
  const oMouth = mk(new THREE.SphereGeometry(0.012, 16, 12), mMouth, H, 0, -0.058, 0.118);   // the little "o" (whimper / howl)
  const jaw = new THREE.Group(); jaw.position.set(0, -0.056, 0.07); H.add(jaw);
  const jawM = mk(new THREE.SphereGeometry(0.033, 18, 12), mWhite, jaw, 0, -0.006, 0.012); jawM.scale.set(1.15, 0.6, 1.15);
  const inner = mk(new THREE.SphereGeometry(0.028, 18, 12), mMouth, jaw, 0, 0.006, 0.022); inner.scale.set(1.0, 0.42, 0.95);
  const tongue = mk(new THREE.CapsuleGeometry(0.0115, 0.022, 6, 10), mTongue, jaw, 0, 0.004, 0.045); tongue.rotation.x = PI / 2; tongue.scale.set(1.25, 1, 0.45);
  // eyes: big, glossy, two glints; an upper lid (fur dome) closes them; arcs for happy / closed
  const eyes = [-1, 1].map((s) => {
    const E = new THREE.Group(); E.position.set(s * 0.047, 0.009, 0.083); E.rotation.y = s * 0.2; E.scale.set(1, 1.06, 0.62); H.add(E);
    const ball = mk(new THREE.SphereGeometry(0.027, 24, 18), mEye, E);
    const pupil = mk(new THREE.SphereGeometry(0.0185, 18, 14), mPupil, E, 0, 0, 0.0115);
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.0072, 10, 8), mGlint); g1.position.set(0.008, 0.0095, 0.0245); E.add(g1);
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.0034, 8, 6), mGlint); g2.position.set(-0.0075, -0.0085, 0.0255); E.add(g2);
    const lid = mk(new THREE.SphereGeometry(0.0298, 22, 10, 0, PI * 2, 0, PI / 2), mFur, E); lid.rotation.x = -1.45;
    const lash = mk(new THREE.TorusGeometry(0.023, 0.0028, 6, 16, PI), mDark, E, 0, -0.002, 0.031); lash.rotation.z = PI; lash.visible = false;
    const happy = mk(new THREE.TorusGeometry(0.02, 0.0034, 6, 16, PI), mDark, E, 0, -0.004, 0.031); happy.visible = false;
    const brow = mk(new THREE.SphereGeometry(0.0125, 12, 8), mCream, H, s * 0.045, 0.052, 0.079); brow.scale.set(1.7, 0.7, 0.6);
    return { s, E, ball, pupil, glints: [g1, g2], lid, lash, happy, brow };
  });
  // ears: big triangles that perk and droop
  const earStyle = o.earStyle ?? 'up';
  const ears = [-1, 1].map((s) => {
    const P = new THREE.Group(); P.position.set(s * 0.058, 0.066, -0.012); P.rotation.order = 'YXZ'; H.add(P);
    const og = new THREE.ConeGeometry(0.047, 0.118, 18); og.translate(0, 0.059, 0);
    const outer = mk(og, mFur, P); outer.scale.set(1, 1, 0.42);
    const ig = new THREE.ConeGeometry(0.031, 0.084, 16); ig.translate(0, 0.045, 0);
    const inn = mk(ig, mInner, P, 0, 0.002, 0.011); inn.scale.set(1, 1, 0.3);
    mk(new THREE.SphereGeometry(0.016, 10, 8), mWhite, P, 0, 0.016, 0.014).scale.set(1.2, 1, 0.5);
    return { s, P };
  });

  // ---------------------------------------------------------------- anchors
  const anchors = { hat: new THREE.Group(), mouth: new THREE.Group(), back: new THREE.Group(), tag };
  anchors.hat.position.set(0, 0.098, -0.005); H.add(anchors.hat);
  anchors.mouth.position.set(0, -0.004, 0.06); jaw.add(anchors.mouth);
  anchors.back.position.set(0, 0.078, -0.02); T.add(anchors.back);

  R.traverse((m) => { if (m.isMesh && m.material === mGlint) m.castShadow = false; });

  // ---------------------------------------------------------------- pose driver
  const v = new THREE.Vector3(), w = new THREE.Vector3(), q = new THREE.Quaternion();
  const seed = o.seed ?? 3;
  const n1 = (t, f, p) => Math.sin(t * f + p + seed);
  let earFlick = [0, 0];

  function update(t, st = {}) {
    const S = st;
    const sleep = clamp(S.sleep ?? 0), lie = clamp(Math.max(S.lie ?? 0, sleep)), beg = clamp(S.beg ?? 0);
    const sit = clamp(Math.max(S.sit ?? 0, beg, S.howl ?? 0)) * (1 - lie);
    const walk = clamp(S.walk ?? 0) * (1 - lie), run = clamp(S.run ?? 0) * (1 - lie);
    const wh = clamp(S.whimper ?? 0), howl = clamp(S.howl ?? 0), sad = clamp(Math.max(S.sad ?? 0, wh * 0.9, howl * 0.4));
    const still = S.still ? 0 : 1;
    const hop = S.hop ?? 0;

    // gait phase
    const moving = Math.max(walk, run);
    const ph = S.dist !== undefined ? (S.dist / (run > 0.3 ? 0.26 : 0.15)) * 2 * PI : t * 2 * PI * (run > 0.3 ? 3.4 : 2.6);

    // torso: hip anchor + pitch blended between stand / sit / beg / lie
    let hy = 0.11, hz = -0.115, pitch = -0.02;
    hy += (0.074 - 0.11) * sit; hz += (-0.09 + 0.115) * sit; pitch += (-0.5 + 0.02) * sit;
    pitch += -0.62 * beg;
    hy += (0.056 - 0.11) * lie; pitch += 0.04 * lie;
    pitch += (S.lean ?? 0) + run * 0.12 * Math.sin(ph) + wh * 0.04 * Math.sin(t * 9);
    hy += moving * 0.008 * Math.abs(Math.sin(ph * (run > 0.3 ? 1 : 2))) + run * 0.02 * Math.max(0, Math.sin(ph + 0.6));
    const breath = (sleep > 0.5 ? 0.028 : 0.014) * Math.sin(t * 2 * PI * (sleep > 0.5 ? 0.32 : 0.55) + seed) * still;
    T.rotation.set(pitch, (S.wag ?? 0) * 0.07 * Math.sin(t * 2 * PI * (S.wagRate ?? 4) + 0.6), (S.shiver ?? 0) * 0.035 * Math.sin(t * 57) + wh * 0.012 * Math.sin(t * 31));
    T.scale.set(1 + breath * 0.6, 1 + breath, 1);
    T.updateMatrix();
    v.copy(HIP_L).applyEuler(T.rotation);
    T.position.set(0 - v.x, hy - v.y, hz - v.z);
    T.updateMatrix();
    const roll = S.roll ?? 0, sz = o.size ?? 1;   // roll onto his back/side around the body axis (pivot at the body center)
    R.rotation.z = roll; R.position.set(0.1 * sz * Math.sin(roll), hop + 0.1 * sz * (1 - Math.cos(roll)), 0);

    // legs: shoulder from the torso, paw planted (or swinging)
    legs.forEach((L, i) => {
      L.S.copy(L.sh).applyMatrix4(T.matrix);
      const front = L.front, s = L.s;
      // phase: trot = diagonal pairs; gallop (run) = front pair vs back pair
      const lp = run > 0.3 ? (front ? 0 : PI) + (s > 0 ? 0.35 : 0) : (i === 0 || i === 3 ? 0 : PI);
      const A = 0.032 * walk + 0.058 * run;
      let px = L.sh.x * 1.05, pz = L.S.z + A * Math.sin(ph + lp), py = 0.018 + (0.026 * walk + 0.05 * run) * Math.max(0, Math.cos(ph + lp));
      if (!front) pz = lerp(pz, L.S.z + 0.075, sit);                                         // haunches: back paws forward
      if (front && beg > 0) { py = lerp(py, L.S.y - 0.09, beg); pz = lerp(pz, L.S.z + 0.05, beg); } // begging: front paws up
      if (lie > 0) {
        if (front) { pz = lerp(pz, L.S.z + 0.085, lie); py = lerp(py, 0.022, lie); px = lerp(px, s * 0.04, lie); }
        else { pz = lerp(pz, L.S.z + 0.05, lie); px = lerp(px, s * 0.085, lie); py = lerp(py, 0.022, lie); }
      }
      py -= hop * (1 - 0.35);                                                                 // paws trail a little on a hop
      L.P.set(px, Math.max(py, 0.018 - hop), pz);
      L.K.lerpVectors(L.S, L.P, 0.55); L.K.z += front ? -0.012 : 0.014; L.K.y += lie * 0.01;
      span(L.upper, L.S, L.K, front ? 0.03 : 0.034); span(L.lower, L.K, L.P, 0.028);
      L.knee.position.copy(L.K); L.top.position.copy(L.S); L.paw.position.copy(L.P);
    });

    // neck + head (head orientation is absolute: posing never fights the body pitch)
    w.copy(NECK_L).applyMatrix4(T.matrix);
    const hp = (S.headPitch ?? 0) - 0.22 * wh * (0.6 + 0.4 * Math.sin(t * 7)) - 0.95 * howl + 0.25 * (S.sniff ?? 0) + 0.32 * sleep + 0.05 * Math.sin(ph * 2) * moving;
    const idleY = still * (0.05 * n1(t, 0.63, 0) + 0.03 * n1(t, 1.37, 2)) * (1 - sleep * 0.8), idleP = still * 0.025 * n1(t, 0.9, 1) * (1 - sleep);
    H.position.set(w.x, w.y + 0.075 - 0.045 * sleep - 0.02 * lie * (1 - sleep), w.z + 0.035 + 0.015 * lie);
    H.rotation.set(hp + idleP, (S.headYaw ?? 0) + idleY, (S.tilt ?? 0) + still * 0.02 * n1(t, 0.8, 4) - 0.55 * (S.roll ?? 0));   // rolled over: the face stays readable
    neck.position.lerpVectors(w, H.position, 0.42);
    throat.position.copy(neck.position); throat.position.y -= 0.016; throat.position.z += 0.026;
    v.subVectors(H.position, w).normalize();
    collar.position.lerpVectors(w, H.position, 0.3); collar.quaternion.setFromUnitVectors(FWD, v);
    q.setFromUnitVectors(UP, v); w.set(0, 0, 1).applyQuaternion(q);
    tag.position.copy(collar.position).addScaledVector(w, 0.06); tag.position.y -= 0.006;
    tag.rotation.set(0.15 * Math.sin(t * 3.1) * (0.4 + moving) + 0.25 * (pitch + 0.1) * -1 * (1 - lie), 0, 0.12 * Math.sin(t * 2.3 + 1) * (0.3 + moving));

    // mouth
    const mode = S.mouth ?? (howl > 0.2 || wh > 0.15 ? 'o' : 'smile');
    let open = S.open ?? ({ smile: 0, flat: 0, o: 0, open: 0.35, pant: 0.32 }[mode] ?? 0);
    open += 0.55 * howl + 0.18 * wh * (0.5 + 0.5 * Math.sin(t * 11)) + (mode === 'pant' ? 0.08 * Math.sin(t * 2 * PI * 3.2) : 0);
    jaw.rotation.x = clamp(open, 0, 1) * 0.7;
    const ok = mode === 'o' ? clamp(0.55 + open * 0.8 + wh * 0.4) : 0;
    oMouth.visible = ok > 0.02; oMouth.scale.set(0.75 + 0.35 * ok, 0.6 + 0.9 * ok, 0.4);
    smile.visible = mode === 'smile' || mode === 'pant' || (mode === 'open' && open < 0.2);
    smile.scale.y = mode === 'flat' ? 0.3 : 1;
    const tg = clamp(Math.max(S.tongue ?? 0, mode === 'pant' ? 1 : 0, S.lick ?? 0));
    tongue.position.set(0, 0.004 + 0.012 * (S.lick ?? 0), 0.045 + 0.04 * tg); tongue.rotation.x = PI / 2 + 0.5 * tg - 1.4 * (S.lick ?? 0);
    tongue.visible = tg > 0.02 || open > 0.15;

    // eyes: lids (blink / sleep / sad), arcs, gaze
    const eyeMode = S.eyes ?? (sleep > 0.5 ? 'closed' : howl > 0.4 ? 'closed' : 'open');
    const bl = still && eyeMode === 'open' && ((t + seed * 1.3) % 3.4 < 0.14) ? 1 : 0;
    let lidK = S.lids ?? ({ open: 0.08, wide: 0, sad: 0.36, sleepy: 0.62, closed: 1, happy: 1 }[eyeMode] ?? 0.08);
    lidK = Math.max(lidK, bl, sad * 0.32, sleep);
    eyes.forEach((e) => {
      const happy = eyeMode === 'happy';
      e.lid.visible = !happy; e.ball.visible = e.pupil.visible = !happy; e.glints.forEach((gl) => (gl.visible = !happy && lidK < 0.8));
      e.happy.visible = happy; e.lash.visible = !happy && lidK > 0.85;
      e.lid.rotation.x = lerp(-1.45, 1.52, clamp(lidK));
      const wide = eyeMode === 'wide' ? 1.14 : 1;
      e.E.scale.set(wide, 1.06 * wide, 0.62);
      e.pupil.position.set(0.006 * (S.lookX ?? 0) * e.s * e.s, 0.005 * (S.lookY ?? 0), 0.0115);
      e.pupil.scale.setScalar(eyeMode === 'wide' ? 0.82 : 1);
      // brows: inner ends up = puppy-dog eyes
      const up = eyeMode === 'wide' ? 0.012 : 0;
      e.brow.position.y = 0.052 + up + 0.006 * sad; e.brow.rotation.z = -e.s * (0.1 + 0.55 * sad) + e.s * 0.25 * (S.angry ?? 0);
    });

    // ears: perk 1 ↔ droop 0, flicks, back for howls
    let perk = clamp((S.ears ?? 0.9) - 0.75 * wh - 0.25 * sleep - 0.3 * sad);
    if (S.ears !== undefined) perk = clamp(S.ears - 0.6 * wh);
    for (let k = 0; k < 2; k++) { const tt = (t + seed * 0.7 + k * 1.9) % (4.3 + k * 0.9); earFlick[k] = still && tt < 0.22 ? Math.sin((tt / 0.22) * PI) : 0; }
    ears.forEach((e, k) => {
      const pk = clamp(perk + (k ? S.earR ?? 0 : S.earL ?? 0)), s = e.s, back = clamp((S.earsBack ?? 0) + howl * 0.8);
      if (earStyle === 'flop') e.P.rotation.set(0.2 + 0.4 * (1 - pk), s * 0.3, -s * (2.1 - 0.4 * pk));
      else e.P.rotation.set(lerp(-0.38, -0.06, pk) - 0.8 * back + 0.25 * earFlick[k] + 0.06 * Math.sin(ph * 2) * moving, s * lerp(0.55, 0.32, pk), -s * (lerp(1.28, 0.3, pk) - 0.4 * back * pk));
    });

    // tail: idle sway, wag (side to side + butt wiggle above), tucked when sad
    const wag = clamp(S.wag ?? 0), rate = S.wagRate ?? 4;
    const down = clamp(Math.max(S.tailDown ?? 0, sad * 0.6, sleep * 0.8));
    tailB.rotation.set(lerp(0.95, -0.15, down) + 0.25 * wag + run * 0.2, (S.tailSide ?? 0) + sleep * 1.0 + wag * 0.75 * Math.sin(t * 2 * PI * rate) + still * 0.14 * (1 - wag) * Math.sin(t * 1.3 + seed), 0);
    tailJ.forEach((j, i) => { if (i) j.rotation.set(lerp(0.28, 0.05, down), wag * 0.12 * Math.sin(t * 2 * PI * rate - i * 0.55) + sleep * 0.32, 0); });
  }
  update(0, {});
  return { g, R, T, H, jaw, nose, eyes, ears, tailB, legs, anchors, collar, mats: { fur: mFur, white: mWhite, cream: mCream, collar: mCollar }, update };
}

// ---------------------------------------------------------------- the crate
/**
 * makeCrate({ w, d, h }) — the big wire crate ("he'll grow into it"). Door at +z (hinge on the −x side): setDoor(θ) swings it
 * out, 1.6 = wide open. Inside: a cushion (top at `floorY`). `panels.{left,right,back,top,door}` are groups — hide the one
 * between the lens and Pip for a close-up (a film cheat nobody notices; wires across his face read as noise).
 */
export function makeCrate(o = {}) {
  const W = o.w ?? 0.64, D = o.d ?? 0.92, Hh = o.h ?? 0.68, r = 0.0042;
  const g = new THREE.Group(), wire = new THREE.MeshStandardMaterial({ color: o.wire ?? 0x38383c, roughness: 0.45, metalness: 0.6 });
  const tray = mk(new RoundedBoxGeometry(W + 0.02, 0.035, D + 0.02, 2, 0.008), mat(0x3d3f45, 0.6), g, 0, 0.0175, 0);
  const rod = (a, b, p, rr = r) => { const m = mk(cyl, wire, p); span(m, new THREE.Vector3(...a), new THREE.Vector3(...b), rr); return m; };
  const y0 = 0.035, y1 = Hh, x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2;
  const panels = { left: new THREE.Group(), right: new THREE.Group(), back: new THREE.Group(), top: new THREE.Group(), door: new THREE.Group() };
  Object.values(panels).forEach((p) => g.add(p));
  const step = 0.068;
  for (const [p, x] of [[panels.left, x0], [panels.right, x1]]) {
    for (let z = z0; z <= z1 + 1e-6; z += (z1 - z0) / Math.round((z1 - z0) / step)) rod([x, y0, z], [x, y1, z], p);
    for (const y of [y0 + 0.01, (y0 + y1) / 2, y1]) rod([x, y, z0], [x, y, z1], p, r * 1.6);
  }
  for (let x = x0; x <= x1 + 1e-6; x += (x1 - x0) / Math.round((x1 - x0) / step)) rod([x, y0, z0], [x, y1, z0], panels.back);
  for (const y of [y0 + 0.01, (y0 + y1) / 2, y1]) rod([x0, y, z0], [x1, y, z0], panels.back, r * 1.6);
  for (let x = x0; x <= x1 + 1e-6; x += (x1 - x0) / Math.round((x1 - x0) / 0.1)) rod([x, y1, z0], [x, y1, z1], panels.top);
  for (let z = z0; z <= z1 + 1e-6; z += (z1 - z0) / Math.round((z1 - z0) / 0.1)) rod([x0, y1, z], [x1, y1, z], panels.top);
  // handle on top
  const hd = mk(new THREE.TorusGeometry(0.06, 0.008, 8, 16, PI), mat(0x2a2a2e, 0.5), panels.top, 0, y1, 0); hd.rotation.y = PI / 2;
  // door: hinged at (x0, z1)
  const door = new THREE.Group(); door.position.set(x0, 0, z1); panels.door.add(door);
  for (let x = 0.02; x <= W - 0.02 + 1e-6; x += (W - 0.04) / Math.round((W - 0.04) / step)) rod([x, y0 + 0.01, 0], [x, y1 - 0.01, 0], door);
  for (const y of [y0 + 0.01, (y0 + y1) / 2, y1 - 0.01]) rod([0.01, y, 0], [W - 0.01, y, 0], door, r * 1.6);
  for (const y of [0.2, 0.48]) { mk(new THREE.BoxGeometry(0.05, 0.012, 0.012), mat(0x9a9aa0, 0.3, { metalness: 0.7 }), door, W - 0.04, y, 0.008); }
  const setDoor = (th) => { door.rotation.y = -th; };
  // cushion + a fleece blanket fold
  const floorY = y0 + 0.07;
  const cushion = mk(new RoundedBoxGeometry(W - 0.07, 0.075, D - 0.08, 3, 0.03), mat(o.cushion ?? 0x8fb2c9, 0.95), g, 0, y0 + 0.037, -0.005);
  const fleece = mk(new RoundedBoxGeometry(W - 0.2, 0.025, 0.28, 2, 0.012), new THREE.MeshStandardMaterial({ map: dotsTexture('#f2d8a8', '#e8a87c'), roughness: 1 }), g, 0.04, floorY + 0.01, -D / 2 + 0.22);
  fleece.rotation.y = 0.12;
  return { g, door, setDoor, panels, cushion, fleece, floorY, W, D, H: Hh };
}

// ---------------------------------------------------------------- the family (Mia ~8, Mom, Dad)
const KID = 0.68;
function bunnySlippers(P, color = 0xf3b6c6) {
  const m = mat(color, 0.95), pink = mat(0xe58aa0, 0.9), dark = mat(0x1b1310, 0.4);
  for (const L of P.legs) {
    const sh = L.ankle.children[0]; sh.material = m; sh.scale.set(1.25, 1.3, 1.1);
    for (const s of [-1, 1]) { const e = mk(new THREE.CapsuleGeometry(0.014, 0.06, 4, 8), m, L.ankle, s * 0.025, 0.05, 0.08); e.rotation.set(-0.5, 0, s * 0.3); mk(new THREE.CapsuleGeometry(0.007, 0.04, 4, 6), pink, e, 0, 0.003, 0.011); }
    for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.008, 8, 6), dark, L.ankle, s * 0.022, 0.03, 0.15);
    mk(new THREE.SphereGeometry(0.009, 8, 6), pink, L.ankle, 0, 0.018, 0.162);
  }
}
/** Mia (about 8): a scaled kid rig with pigtails. outfit 'pajamas' (dotted lavender + bunny slippers) | 'day'. */
export function makeMia({ outfit = 'pajamas' } = {}) {
  const pj = outfit === 'pajamas';
  const P = makePerson({ skin: 0xf0c4a2, hair: 0x4a2c1a, hairStyle: 'bob', headR: 0.17, top: pj ? 0xffffff : 0xf2c14e, collar: pj ? 0xf6eefa : null, pants: pj ? 0xffffff : 0x4f7fb8, shoes: pj ? 0xf3b6c6 : 0xe8e4dc });
  if (pj) { const t = dotsTexture('#b9a3e3', '#f7f1ff'); t.repeat.set(2, 2); P.mats.top.map = t; P.mats.pants.map = t; }
  const hm = P.mats.hair, tie = mat(0xe2574c, 0.6);
  for (const s of [-1, 1]) {   // pigtails
    const pt = mk(new THREE.SphereGeometry(0.06, 14, 10), hm, P.head.g, s * 0.185, 0.02, -0.06); pt.scale.set(0.8, 1.15, 0.8);
    mk(new THREE.TorusGeometry(0.026, 0.009, 6, 12), tie, P.head.g, s * 0.155, 0.045, -0.05).rotation.set(0, s * 1.2, 0.4 * s);
  }
  if (pj) bunnySlippers(P);
  P.root.scale.setScalar(KID); P.kid = KID;
  return P;
}
/** Mom: auburn bob; outfit 'robe' (long blue robe) | 'day'. */
export function makeMom({ outfit = 'robe' } = {}) {
  const robe = outfit === 'robe';
  const P = makePerson({ skin: 0xe9b896, hair: 0x8a3f22, hairStyle: 'bob', top: robe ? 0x7fa6c4 : 0xc75b6a, pants: robe ? 0x7fa6c4 : 0x3b4a66, shoes: 0xe9e0d2, dress: robe ? 0x7fa6c4 : null });
  if (P.dress) P.dress.scale.set(0.62, 1, 0.62);   // a robe, not a ball gown
  P.kid = 1; return P;
}
/** Dad: messy brown hair + glasses; outfit 'pajamas' (grey tee, plaid pants) | 'day'. */
export function makeDad({ outfit = 'pajamas' } = {}) {
  const pj = outfit === 'pajamas';
  const P = makePerson({ skin: 0xd9a27c, hair: 0x5a3a24, hairStyle: 'messy', glasses: true, top: pj ? 0x9aa3ad : 0x3f7d6a, pants: pj ? 0xffffff : 0x4a4f57, shoes: 0x6a5446 });
  if (pj) P.mats.pants.map = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#3c5f8a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,70,60,.55)'; for (let i = 0; i < 4; i++) { g.fillRect(i * 32 + 10, 0, 8, h); g.fillRect(0, i * 32 + 10, w, 8); } g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 4; i++) { g.fillRect(i * 32 + 24, 0, 2, h); g.fillRect(0, i * 32 + 24, w, 2); } }, [2, 2]);
  P.head.glasses.visible = true; P.kid = 1;
  return P;
}
/** applyPose for a scaled rig (Mia): pose in world x/z, dist/speed in world meters, y offsets (sitting) in the rig's own units. */
export function poseScaled(P, p, rootY = 0) {
  const s = P.kid ?? 1;
  applyPose(P, { ...p, dist: (p.dist ?? 0) / s, speed: (p.speed ?? 0) / s });
  P.root.position.y = rootY + (p.y ?? 0) * s;
}
