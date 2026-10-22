// VIDEO 003 — "What would happen if all children disappeared overnight?"
// 64 s, two sets: engine/sets/bedroom.js (night of the vanishing) + engine/sets/classroom.js (Ms. Alvarez's kindergarten, Room 4).
// HUD = CHILDREN ON EARTH: 2.4 billion -> 0 at midnight -> 1 a second later (births never stop, ~4.2/s) -> 718 million at +5 y 8 mo.
//
// Shot list (seconds)                          | set       | what happens
//  0.0– 5.2  wide     11:59 PM, kid asleep      | bedroom   | title over the sleeping room
//  5.2– 9.0  bed      midnight                  | bedroom   | the kid dissolves into motes, blanket sinks; counter -> 0
//  9.0–14.5  pillow   one second of none        | bedroom   | empty pillow + bunny; counter 0 -> 1
// 14.5–21.0  door     6:42 AM                   | bedroom   | door opens, mom freezes in the doorway, hand to chest
// 21.0–24.6  room     8:00 AM attendance        | classroom | teacher reads names to 24 empty desks
// 24.6–28.5  desks    nobody says here          | classroom | through the empty chairs
// 28.5–40.5  montage  +1 mo / +1 y / +3 y / +5 y| classroom | chairs up, seasons in the windows; she keeps coming (window, board, dusting, desk)
// 40.5–47.0  enter    first day of school       | classroom | door opens, a line of tiny kids walks in
// 47.0–52.6  att      attendance                | classroom | 24 kids seated, she reads the list
// 52.6–55.0  here     "Here."                   | classroom | one hand goes up
// 55.0–58.6  close    she cries                 | classroom | tear + smile
// 58.6–64.0  final    the full room             | classroom | pull back, fade, end card
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, win, mat, mk, rng } from '@engine/core.js';
import { makePerson, makeSleeper, basePose, applyPose, handWorld, blink, hairColor } from '@engine/rig.js';
import { Blanket, starsTexture, makeBunny } from '@engine/props.js';
import { buildBedroom, DIMS as BD } from '@engine/sets/bedroom.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';

const PI = Math.PI;
const HALL = BD.hallSpot, DOOR = BD.doorway, OPEN = 1.25;
const KS = 0.62;                                // kid scale (toy 5-year-olds)
const FRONT = CD.front;                         // where Ms. Alvarez stands for attendance
const HERE_KID = 2;                             // desk index of the first "Here." (front row)

export const SHOTS = [
  { t0: 0, t1: 5.2, cam: 'wide' },
  { t0: 5.2, t1: 9.0, cam: 'bed' },
  { t0: 9.0, t1: 14.5, cam: 'pillow' },
  { t0: 14.5, t1: 18.0, cam: 'door' },
  { t0: 18.0, t1: 21.0, cam: 'pov' },
  { t0: 21.0, t1: 24.6, cam: 'room' },
  { t0: 24.6, t1: 28.5, cam: 'desks' },
  { t0: 28.5, t1: 31.5, cam: 'm1' },
  { t0: 31.5, t1: 34.5, cam: 'm2' },
  { t0: 34.5, t1: 37.5, cam: 'm3' },
  { t0: 37.5, t1: 40.5, cam: 'm4' },
  { t0: 40.5, t1: 47.0, cam: 'enter' },
  { t0: 47.0, t1: 52.6, cam: 'att' },
  { t0: 52.6, t1: 55.0, cam: 'here' },
  { t0: 55.0, t1: 58.6, cam: 'close' },
  { t0: 58.6, t1: 64.0, cam: 'final' },
];
// p = camera position start→end, a = look-at start→end, fov (deg), amp = handheld drift
export const CAMS = {
  wide:   { p: [[1.85, 2.15, 2.45], [1.55, 1.95, 1.9]], a: [[-0.45, 0.7, -1.4], [-0.35, 0.68, -1.6]], fov: 66, amp: 0.004 },
  bed:    { p: [[0.75, 1.45, -0.35], [0.62, 1.38, -0.6]], a: [[-0.3, 0.62, -1.75], [-0.3, 0.62, -1.85]], fov: 52, amp: 0.003 },
  pillow: { p: [[0.42, 0.98, -1.25], [0.32, 0.95, -1.42]], a: [[-0.32, 0.66, -2.12], [-0.33, 0.66, -2.14]], fov: 48, amp: 0.003 },
  door:   { p: [[0.35, 1.25, -2.0], [0.25, 1.22, -1.85]], a: [[-2.2, 1.2, 0.25], [-2.2, 1.2, 0.25]], fov: 54, amp: 0.004 },
  pov:    { p: [[-0.95, 1.55, 0.35], [-0.9, 1.5, 0.15]], a: [[-0.35, 0.66, -2.1], [-0.33, 0.66, -2.12]], fov: 50, amp: 0.003 },
  room:   { p: [[3.0, 2.25, 2.75], [2.75, 2.1, 2.4]], a: [[-0.8, 0.9, -2.0], [-0.75, 0.95, -2.1]], fov: 62, amp: 0.004 },
  desks:  { p: [[0.95, 0.82, 0.55], [0.85, 0.85, 0.25]], a: [[-0.35, 1.25, -2.35], [-0.38, 1.3, -2.35]], fov: 50, amp: 0.003 },
  m1:     { p: [[-3.05, 2.2, 2.65], [-2.9, 2.1, 2.45]], a: [[1.2, 0.75, -1.2], [1.3, 0.75, -1.25]], fov: 64, amp: 0.003 },
  m2:     { p: [[2.6, 1.6, 0.6], [2.45, 1.57, 0.4]], a: [[-0.2, 1.3, -2.8], [-0.2, 1.3, -2.8]], fov: 58, amp: 0.003 },
  m3:     { p: [[1.2, 1.4, 1.4], [1.05, 1.35, 1.2]], a: [[-0.75, 0.75, -0.2], [-0.75, 0.75, -0.25]], fov: 54, amp: 0.003 },
  m4:     { p: [[-1.45, 1.3, -1.05], [-1.55, 1.27, -1.25]], a: [[-2.55, 1.2, -2.85], [-2.55, 1.2, -2.85]], fov: 52, amp: 0.003 },
  enter:  { p: [[-0.4, 1.3, -1.4], [-0.5, 1.28, -1.2]], a: [[-3.4, 0.75, 2.05], [-3.3, 0.75, 2.0]], fov: 50, amp: 0.004 },
  att:    { p: [[1.6, 1.6, -2.7], [1.45, 1.55, -2.6]], a: [[-0.4, 0.62, 0.9], [-0.45, 0.62, 0.8]], fov: 60, amp: 0.004 },
  here:   { p: [[-0.05, 0.86, -2.0], [-0.12, 0.86, -1.9]], a: [[-0.5, 0.9, -0.7], [-0.5, 0.92, -0.7]], fov: 46, amp: 0.003 },
  close:  { p: [[-0.2, 1.48, -1.45], [-0.24, 1.5, -1.6]], a: [[-0.4, 1.55, -2.35], [-0.4, 1.56, -2.35]], fov: 46, amp: 0.003 },
  final:  { p: [[0.0, 1.6, 2.2], [0.0, 1.95, 2.85]], a: [[-0.3, 0.95, -2.2], [-0.3, 0.95, -2.2]], fov: 60, amp: 0.003 },
};

const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const inBedroom = (t) => t < 21.0;
const mSeg = (t) => clamp(Math.floor((t - 28.5) / 3), 0, 3);       // montage segment 0..3
const teacherAge = (t) => (t < 28.5 ? 0 : t < 40.5 ? 0.04 + 0.06 * mSeg(t) : 0.25);
const arm = (sx, sz, el, free = 0, twist = 0) => ({ sx, sz, el, free, twist });

// ---------------------------------------------------------------- mom (6:42 AM)
function momPose(t) {
  const p = basePose();
  p.eyes = blink(t, 2); p.smile = 0;
  const w = walkLegs(t, HALL, [{ t0: 15.5, t1: 16.5, pts: [DOOR] }, { t0: 19.2, t1: 20.9, pts: [[-1.75, -0.45], [-1.4, -1.1]] }]);
  Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
  const look = faceToward(DOOR[0], DOOR[1], -0.3, -2.1);
  p.rotY = lerpAngle(w.head ?? PI / 2, look, K(t, [[16.3, 0], [16.7, 1]]));
  p.armB = { sx: K(t, [[17.0, 0.03], [17.6, -0.05]]), sz: K(t, [[17.0, 0.07], [17.6, 0.2]]), el: K(t, [[17.0, -0.18], [17.6, -2.0]]), twist: K(t, [[17.0, 0], [17.6, -0.9]]), free: K(t, [[16.4, 1], [16.6, 0]]) };
  p.headPitch = K(t, [[16.5, 0.1], [17.2, 0.3]]); p.headRoll = K(t, [[17.6, 0], [18.4, 0.12]]); p.lean = 0.05;
  return p;
}

// ---------------------------------------------------------------- Ms. Alvarez
function teacherPose(t) {
  const p = basePose();
  p.eyes = blink(t, 4); p.smile = 0;
  p.glasses = t >= 37.5;
  const holdClip = (k = 1) => arm(lerp(0.03, -0.75, k), lerp(0.07, -0.12, k), lerp(-0.18, -1.45, k), 1 - k, lerp(0, 0.25, k));
  if (t < 28.5) { // attendance to an empty room
    Object.assign(p, { x: FRONT[0], z: FRONT[1], rotY: 0.08 });
    p.armA = holdClip();
    const look = (t > 22.8 && t < 23.9) || (t > 25.6 && t < 27.4);   // she looks up at the empty desks between names
    p.headPitch = K(t, [[21, 0.42], [22.8, 0.42], [23.1, look ? 0.0 : 0.42], [23.9, 0.0], [24.2, 0.42], [25.6, 0.42], [25.9, 0.02], [27.4, 0.02], [27.7, 0.3]]);
    p.headYaw = K(t, [[25.9, 0], [26.6, 0.25], [27.3, -0.15]]);
    p.armB = arm(0.03, 0.07, -0.25, 0);
  } else if (t < 31.5) { // +1 month: at the window, chairs up
    Object.assign(p, { x: 2.95, z: -0.35, rotY: PI / 2 + 0.15, headPitch: 0.12, lean: 0.03 });
    p.armA = arm(-0.2, 0.05, -1.5, 0, 0.6); p.armB = arm(-0.2, 0.05, -1.5, 0, -0.6);   // arms folded-ish
  } else if (t < 34.5) { // +1 year: wipes the board
    Object.assign(p, { x: -0.25, z: -2.5, rotY: PI, headPitch: -0.1 });
    const wipe = Math.sin((t - 31.5) * 5.0);
    p.armA = arm(-2.1, 0.25 + 0.25 * wipe, -0.45, 0);
    p.armB = arm(0.03, 0.07, -0.25, 0);
  } else if (t < 37.5) { // +3 years: dusts a desk
    const d = CD.desks[8];
    Object.assign(p, { x: d.x - 0.55, z: d.z + 0.05, rotY: PI / 2, lean: 0.45, headPitch: 0.35 });
    const rub = Math.sin((t - 34.5) * 4.2);
    p.armA = arm(-0.95 + 0.12 * rub, -0.05, -0.35, 0);
    p.armB = arm(-0.35, 0.1, -0.6, 0);
  } else if (t < 40.5) { // +5 years: sits at her desk, reading the old list
    const T = CD.teacherDesk;
    Object.assign(p, { x: T.x, z: T.z - 0.55, rotY: 0, y: -0.22, footFwd: 0.4, lean: 0.25, headPitch: 0.45 });
    p.armA = arm(-0.7, -0.1, -1.0, 0, 0.2); p.armB = arm(-0.7, -0.1, -1.0, 0, -0.2);
  } else if (t < 47.0) { // first day: watches the door
    Object.assign(p, { x: -1.55, z: -2.0, rotY: faceToward(-1.55, -2.0, -3.4, 2.0), headPitch: 0.15 });
    p.armA = holdClip(K(t, [[40.5, 1], [41.4, 0.6]]));
    p.armB = { sx: K(t, [[42.4, 0.03], [43.0, -0.05]]), sz: K(t, [[42.4, 0.07], [43.0, 0.2]]), el: K(t, [[42.4, -0.18], [43.0, -2.0]]), twist: K(t, [[42.4, 0], [43.0, -0.9]]), free: 0 };
    p.smile = t > 43.2 ? 1 : 0;
  } else { // attendance, answered
    Object.assign(p, { x: FRONT[0], z: FRONT[1], rotY: 0.08 });
    p.armA = holdClip();
    p.armB = arm(0.03, 0.07, -0.25, 0);
    p.headPitch = K(t, [[47, 0.42], [52.75, 0.42], [53.1, 0.05], [55.0, 0.0], [58.6, 0.05]]);
    p.headYaw = K(t, [[52.75, 0], [53.1, -0.05]]);
    p.headRoll = K(t, [[55.2, 0], [56.2, 0.1]]);
    p.smile = t > 55.6 ? 1 : 0;
    p.tear = t > 55.0;
    if (t > 56.2) p.armB = { sx: K(t, [[56.2, 0.03], [56.8, -0.05]]), sz: K(t, [[56.2, 0.07], [56.8, 0.2]]), el: K(t, [[56.2, -0.25], [56.8, -2.0]]), twist: K(t, [[56.2, 0], [56.8, -0.9]]), free: 0 };
  }
  return p;
}

// ---------------------------------------------------------------- the 24 new kids
const START = [-4.4, 0.5], BACK_Z = 2.33;   // kids queue in the hallway, then come through the door
// fill order: farthest desks first (front row, right side), so nobody walks through anybody
const ORDER = CD.desks.map((d, i) => i).sort((a, b) => CD.desks[a].z - CD.desks[b].z || CD.desks[b].x - CD.desks[a].x);
const ENTER0 = 40.9, GAP = 0.42, SPEED = 1.05;
function kidPlan(i) {
  const d = CD.desks[i], k = ORDER.indexOf(i), chairZ = d.z + CD.chair.dz + 0.02, ax = d.x - 0.5;
  const pts = [[-4.0, 1.9], [-3.1, 2.2], [ax, BACK_Z], [ax, chairZ]];
  let L = Math.hypot(pts[0][0] - START[0], pts[0][1] - START[1]);
  for (let j = 1; j < pts.length; j++) L += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
  const t0 = ENTER0 + k * GAP, t1 = t0 + L / SPEED;
  return { d, k, chairZ, pts, t0, t1, sit0: t1 - 0.05, sit1: t1 + 0.7 };
}
const PLANS = CD.desks.map((_, i) => kidPlan(i));

function kidPose(i, t, R) {
  const p = basePose(), P = PLANS[i];
  p.eyes = blink(t, i + 5); p.smile = 1;
  const seatedAll = t >= 47.0;                         // after the cut everyone is in their seat
  if (!seatedAll && t < P.t0) { p.visible = false; return p; }
  if (seatedAll || t >= P.sit1) {
    Object.assign(p, { x: P.d.x, z: P.chairZ, rotY: PI, y: -0.22, footFwd: 0.4, lean: 0.12, headPitch: -0.05 });
    p.headYaw = 0.25 * Math.sin(t * 0.6 + i * 1.7) * (R.fidget);
    p.armA = arm(-0.75, 0.0, -0.9, 0, 0.3); p.armB = arm(-0.75, 0.0, -0.9, 0, -0.3);
    if (i === HERE_KID) {
      const up = K(t, [[52.7, 0], [53.05, 1], [55.6, 1], [56.0, 0]]);
      p.armB = arm(lerp(-0.75, -2.95, up), lerp(0, 0.1, up), lerp(-0.9, -0.15, up), 0, lerp(-0.3, 0, up));
      p.headPitch = lerp(-0.05, -0.15, up);
    }
    return p;
  }
  const w = walkLegs(t, START, [{ t0: P.t0, t1: P.t1, pts: P.pts }]);
  const sit = K(t, [[P.sit0, 0], [P.sit1, 1]]);
  Object.assign(p, { x: lerp(w.x, P.d.x, sit), z: w.z, dist: w.dist / KS, speed: w.speed / KS * 0.6, y: -0.22 * sit, footFwd: 0.4 * sit, lean: 0.03 + 0.09 * sit });
  p.rotY = lerpAngle(w.head ?? PI / 2, PI, K(t, [[P.t1 - 0.35, 0], [P.t1 + 0.1, 1]]));
  p.headYaw = 0.35 * Math.sin(t * 1.3 + i) * (1 - sit);      // looking around the room
  p.armA = arm(lerp(0.03, -0.75, sit), lerp(0.07, 0, sit), lerp(-0.25, -0.9, sit), 1 - sit, 0.3 * sit);
  p.armB = arm(lerp(0.03, -0.75, sit), lerp(0.07, 0, sit), lerp(-0.25, -0.9, sit), 1 - sit, -0.3 * sit);
  return p;
}
/** applyPose for a scaled figure: pose.y is in the figure's local units, so the root has to move by y*scale. */
function applyScaled(rig, p, s) { applyPose(rig, p); rig.root.position.y = (p.y || 0) * s; }

// ---------------------------------------------------------------- build + per-frame update
export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const bed = buildBedroom(studio, {});
  const cls = buildClassroom(studio, {});
  const B = bed.D.bed;

  // ---- bedroom cast
  bed.crib.visible = false;
  Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.decor.kid.visible = true;
  const kid = makeSleeper({ r: 0.098, skin: 0xe8b48f, hair: 0x3d2a1f, hairStyle: 'short' });
  kid.g.position.set(B.cx, B.top + 0.12 + 0.055, -2.16); kid.turn.rotation.z = -0.6; scene.add(kid.g);
  const kidMats = []; kid.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; kidMats.push(o.material); } });
  const blanket = new Blanket(new THREE.MeshStandardMaterial({ map: starsTexture('#8fb3d9', '#f4e3a1'), roughness: 0.95, side: THREE.DoubleSide }));
  blanket.mesh.scale.z = -1; scene.add(blanket.mesh);   // Blanket drapes toward -z; this bed's foot is at +z, so mirror it (pass negated z's)
  const bunny = makeBunny(); bunny.position.set(B.cx + 0.2, B.top + 0.1, -2.12); bunny.rotation.set(-0.25, -0.5, 0.15); scene.add(bunny);
  const mom = makePerson({ skin: 0xe2ad8c, top: 0x8a9bb5, collar: 0xf3e9dc, pants: 0x4a4f5c, shoes: 0x6a5850, hair: 0x3d2a1f, hairStyle: 'bob' });
  scene.add(mom.root);

  // motes that rise off the bed at midnight
  const MN = 140, mR = rng(77), mSeeds = Array.from({ length: MN }, () => [mR(), mR(), mR(), mR()]);
  const mGeo = new THREE.BufferGeometry(); mGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MN * 3), 3));
  const dc = document.createElement('canvas'); dc.width = dc.height = 32; const dg = dc.getContext('2d'); const grd = dg.createRadialGradient(16, 16, 0, 16, 16, 16); grd.addColorStop(0, '#fff'); grd.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = grd; dg.fillRect(0, 0, 32, 32);
  const mMat = new THREE.PointsMaterial({ size: 0.016, map: new THREE.CanvasTexture(dc), color: 0xffe0a8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const motes = new THREE.Points(mGeo, mMat); motes.frustumCulled = false; scene.add(motes);
  const VANISH = 7.3;

  // ---- classroom cast
  const teacher = makePerson({ skin: 0xc98f6a, top: 0xd9a441, collar: 0xfaf3e6, pants: 0x3c4a5c, shoes: 0x5a4036, hair: 0x2b1d16, hairStyle: 'bob' });
  scene.add(teacher.root);
  const clip = new THREE.Group(); scene.add(clip);
  mk(new THREE.BoxGeometry(0.23, 0.012, 0.31), mat(0x9a6b3e, 0.6), clip);
  mk(new THREE.PlaneGeometry(0.2, 0.26), mat(0xfbf8f0, 0.8), clip, 0, 0.0065, 0.01).rotation.x = -PI / 2;
  mk(new THREE.BoxGeometry(0.08, 0.02, 0.03), mat(0xb0b4ba, 0.3), clip, 0, 0.012, -0.14);
  const cloth = new THREE.Group(); scene.add(cloth);
  mk(new THREE.BoxGeometry(0.14, 0.02, 0.1), mat(0xf2b632, 0.95), cloth);

  const R = rng(303);
  const SKINS = [0xf1c6a3, 0xe8b48f, 0xc98f6a, 0xa86f4d, 0x8a5a3c, 0xf3d0b5, 0xd9a07e];
  const HAIRS = [0x2b1d16, 0x3d2a1f, 0x6b4a2f, 0xb88a4a, 0x1b1310, 0xd9b26a];
  const TOPS = [0xe2574c, 0x4f9bd9, 0x58b368, 0xf2b632, 0xa77bd1, 0xf08a4b, 0xf4a6b8, 0x5bc0de, 0xffffff, 0x3c4a5c];
  const STYLES = ['bob', 'short', 'messy', 'bob', 'short'];
  const kids = CD.desks.map((_, i) => {
    const rig = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: [0x34405c, 0x5a6f8a, 0x6b4a35, 0x2f3a2f][Math.floor(R() * 4)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: STYLES[Math.floor(R() * STYLES.length)], headR: 0.175, shoes: [0xe2574c, 0x4f9bd9, 0xffffff, 0x333333][Math.floor(R() * 4)] });
    rig.root.scale.setScalar(KS); scene.add(rig.root);
    return { rig, R: { fidget: 0.4 + R() * 0.6 } };
  });

  const clipHand = (rig) => { const h = handWorld(rig, -1); return h; };

  function update(t) {
    const shot = shotAt(t), indoor = inBedroom(t);
    bed.root.visible = indoor; cls.root.visible = !indoor;
    kid.g.visible = blanket.mesh.visible = bunny.visible = mom.root.visible = motes.visible = indoor;
    teacher.root.visible = clip.visible = !indoor;
    cloth.visible = !indoor && t >= 34.5 && t < 37.5;
    kids.forEach((k) => (k.rig.root.visible = !indoor && t >= 40.5));

    if (indoor) {
      // ---- the night (and the morning after)
      const morning = t >= 14.5;
      const theta = morning ? K(t, [[14.5, 0], [14.9, 0], [16.0, OPEN]]) : 0;
      bed.setDoor(theta); bed.lights.spill.intensity = 0.9 * clamp(theta / OPEN); bed.updateDust(t, theta);
      bed.setSeason('summer', t); bed.setNightlight(morning ? 0 : 1); bed.setLamp(0); bed.setXmas(0, t);
      bed.lights.moon.intensity = morning ? 2.1 : 1.6;
      bed.lights.moon.color.setHex(morning ? 0xc8d6ee : 0xa9bfe8);
      bed.lights.hemi.intensity = morning ? 1.15 : 0.85;

      const v = clamp((t - VANISH) / 1.1);                 // 0 = asleep, 1 = gone
      kidMats.forEach((m) => { m.opacity = 1 - v; });
      kid.g.visible = v < 1;
      kid.g.position.y = B.top + 0.175 + 0.03 * v;
      const body = { x: B.cx, zA: 1.0, zB: 1.95, h: 0.1 * (1 - K(t, [[VANISH + 0.2, 0], [VANISH + 1.8, 1]])), r: 0.17 };
      blanket.update({ cx: B.cx, w: B.w, top: B.top, zFoot: -B.z1, zHead: 1.93, hang: 0.26, footHang: 0.22, r: 0.05, body: body.h > 0.002 ? body : null });
      // motes: drift up off the kid's outline, fade
      const a = mGeo.attributes.position, life = clamp((t - VANISH) / 3.2);
      for (let i = 0; i < MN; i++) {
        const [u, w, k, s] = mSeeds[i];
        const zz = lerp(-2.2, -1.1, u), xx = B.cx + (w - 0.5) * (zz < -1.95 ? 0.18 : 0.3);
        const rise = life * (0.2 + k * 0.5);
        a.setXYZ(i, xx + Math.sin(t * 1.3 + i) * 0.03 * life, B.top + 0.12 + rise + 0.04 * s, zz + Math.cos(t + i) * 0.02);
      }
      a.needsUpdate = true;
      mMat.opacity = t < VANISH ? 0 : 0.9 * Math.sin(PI * clamp((t - VANISH) / 3.4));

      applyPose(mom, morning ? momPose(t) : { ...basePose(), visible: false });
      if (!morning) mom.root.visible = false;
    } else {
      // ---- Room 4
      const montage = t >= 28.5 && t < 40.5, seg = mSeg(t);
      cls.setChairsUp(montage);
      cls.setAbandoned(montage ? 0.6 : 0);
      cls.setSeason(t < 28.5 ? 'autumn' : montage ? ['autumn', 'winter', 'spring', 'summer'][seg] : 'autumn', t);
      cls.setDoor(t >= 40.5 ? K(t, [[40.5, 0], [41.0, 0], [41.9, 1.8]]) : 0);
      cls.setClock(8, t < 40.5 ? 0 + (t - 21) * 0.05 : 0 + (t - 40.5) * 0.08);
      cls.setBoard(t < 28.5 ? 'Monday, September 8\nGood morning, friends!' : montage ? ['', 'Monday', 'Monday', 'Monday'][seg] : 'Monday, September 4\nWelcome to kindergarten!');
      cls.updateDust(t, montage ? 1 : 0.35);
      cls.tags.forEach((g) => (g.visible = !montage));

      const tp = teacherPose(t);
      applyPose(teacher, tp);
      teacher.mats.hair.color.copy(hairColor(0x2b1d16, 0xbdb6ae, teacherAge(t)));
      // clipboard rides in her right hand (armA); hidden while she wipes / dusts / at the window
      const holding = t < 28.5 || t >= 37.5;
      clip.visible = holding;
      if (holding) {
        const h = clipHand(teacher);
        clip.position.set(h.x, h.y + 0.02, h.z);
        clip.rotation.set(0, 0, 0); clip.rotation.order = 'YXZ';
        clip.rotation.y = tp.rotY + 0.15; clip.rotation.x = t >= 37.5 && t < 40.5 ? -0.15 : -0.95;
        clip.translateZ(0.06);
      }
      if (cloth.visible) { const h = handWorld(teacher, -1); cloth.position.set(h.x, h.y - 0.04, h.z); cloth.rotation.set(0, tp.rotY, 0); }

      kids.forEach((k, i) => { if (k.rig.root.visible) applyScaled(k.rig, kidPose(i, t, k.R), KS); });
    }

    // ---- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
  }
  return { update };
}
