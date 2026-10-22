// VIDEO 001 — "What your mom did every night after you fell asleep" (TOLD BY YOUR BEDROOM DOOR)
// 62 s, 10 shots, one set (engine/sets/bedroom.js). Text/HUD timing lives in story.json; this file is 3D only.
//
// Shot list (seconds)                        | era    | what happens
//  0.0– 6.0  wide   first night home          | baby   | door opens, light wedge, mom silhouette walks in
//  6.0–12.0  crib   she watches you breathe   | baby   | leans over crib, tucks the blanket; counter rolls 1→365
// 12.0–20.0  kid    age 6, the bunny          | kid    | picks the bunny off the floor, tucks it under your arm
// 20.0–28.0  teen   age 15, phone + lamp      | teen   | takes your phone, sets it down, switches the lamp off
// 28.0–37.0  wide   the night you moved out   | empty  | opens the door anyway, sits on the empty bed
// 37.0–45.0  window 4 seasons montage         | empty  | door light + her shadow cross the empty bed, seasons change
// 45.0–48.6  door   one December              | home   | door opens: you're there — hand to her chest
// 48.6–54.0  wide   she tucks you in          | home   | same tuck as night one; counter +1 (gold)
// 54.0–57.6  close  "Goodnight, baby."        | home   | close-up, tear, smile
// 57.6–62.0  wide   she leaves, door closes   | home   | wedge shrinks to a line, fade, end card
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, win, mat, mk } from '@engine/core.js';
import { makePerson, makeSleeper, basePose, applyPose, handWorld, blink, hairColor } from '@engine/rig.js';
import { Blanket, quiltTexture, starsTexture, dotsTexture, makeBunny, makePhone, makeBlock, makeToyCar, makeBall } from '@engine/props.js';
import { buildBedroom, DIMS } from '@engine/sets/bedroom.js';

const PI = Math.PI;
const HALL = DIMS.hallSpot, DOOR = DIMS.doorway;
const CRIBSIDE = [-1.02, -1.7], BEDSIDE = [-1.2, -1.58];
const FACE_BED = PI / 2;                       // facing +x (toward the bed/crib)
const OPEN = 1.25;                             // door angle when open (rad)

export const SHOTS = [
  { t0: 0, t1: 6, cam: 'wide' },
  { t0: 6, t1: 12, cam: 'crib' },
  { t0: 12, t1: 20, cam: 'kid' },
  { t0: 20, t1: 28, cam: 'teen' },
  { t0: 28, t1: 37, cam: 'wide2' },
  { t0: 37, t1: 45, cam: 'window' },
  { t0: 45, t1: 48.6, cam: 'door' },
  { t0: 48.6, t1: 54, cam: 'wide3' },
  { t0: 54, t1: 57.6, cam: 'close' },
  { t0: 57.6, t1: 62, cam: 'wide4' },
];
// p = camera position at shot start→end, a = look-at target start→end, fov in degrees, amp = handheld drift
export const CAMS = {
  wide:   { p: [[1.85, 2.15, 2.45], [1.62, 2.0, 2.05]], a: [[-0.95, 0.72, -0.5], [-1.0, 0.72, -0.62]], fov: 70, amp: 0.004 },
  wide2:  { p: [[1.8, 2.1, 2.4], [1.62, 2.0, 2.1]], a: [[-0.95, 0.72, -0.55], [-0.9, 0.7, -0.7]], fov: 70, amp: 0.004 },
  wide3:  { p: [[1.75, 2.05, 2.3], [1.55, 1.95, 1.95]], a: [[-0.95, 0.75, -0.65], [-0.8, 0.72, -1.0]], fov: 68, amp: 0.004 },
  wide4:  { p: [[1.6, 2.0, 2.0], [1.85, 2.15, 2.45]], a: [[-0.9, 0.75, -0.7], [-1.1, 0.8, -0.35]], fov: 70, amp: 0.003 },
  crib:   { p: [[0.75, 1.78, 0.05], [0.66, 1.74, -0.12]], a: [[-0.62, 1.08, -1.78], [-0.64, 1.07, -1.82]], fov: 54, amp: 0.004 },
  kid:    { p: [[0.75, 0.88, 1.25], [0.62, 0.85, 1.05]], a: [[-0.9, 0.6, -0.85], [-0.95, 0.6, -0.95]], fov: 70, amp: 0.004 },
  teen:   { p: [[0.8, 1.32, 0.15], [0.7, 1.28, -0.05]], a: [[-0.78, 0.78, -1.85], [-0.8, 0.78, -1.9]], fov: 55, amp: 0.004 },
  window: { p: [[1.5, 1.62, 0.95], [1.4, 1.58, 0.78]], a: [[-0.3, 0.78, -1.95], [-0.34, 0.78, -1.98]], fov: 64, amp: 0.003 },
  door:   { p: [[0.15, 1.5, -1.05], [0.0, 1.48, -0.95]], a: [[-2.05, 1.3, 0.2], [-2.05, 1.3, 0.2]], fov: 48, amp: 0.004 },
  close:  { p: [[-0.12, 0.9, -1.9], [-0.17, 0.93, -1.86]], a: [[-0.88, 1.4, -1.6], [-0.88, 1.41, -1.6]], fov: 62, amp: 0.003 }, // your POV from the pillow
};

const eraAt = (t) => (t < 12 ? 'baby' : t < 20 ? 'kid' : t < 28 ? 'teen' : t < 45 ? 'empty' : 'home');
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const montageSeg = (t) => clamp(Math.floor((t - 37) / 2), 0, 3);
const momAge = (t) => (t < 20 ? 0 : t < 28 ? 0.25 : t < 37 ? 0.42 : t < 45 ? 0.5 + 0.12 * montageSeg(t) : 0.95);

function doorAt(t) {
  if (t < 6) return K(t, [[0, 0], [2.1, 0], [3.6, OPEN]]);
  if (t < 28) return OPEN;
  if (t < 37) return K(t, [[28, 0], [28.3, 0], [29.6, OPEN]]);
  if (t < 45) { const lt = t - (37 + 2 * montageSeg(t)); return K(lt, [[0.1, 0], [0.55, 1.05], [1.4, 1.05], [1.85, 0]]); }
  if (t < 48.6) return K(t, [[45, 0], [45.15, 0], [46.3, OPEN]]);
  return K(t, [[59.95, OPEN], [60.6, 0]]);
}

// ---------------------------------------------------------------- mom's performance
function momPose(t) {
  const p = basePose();
  p.eyes = blink(t, 1);
  p.glasses = momAge(t) >= 0.6;
  const arm = (sx, sz, el, free = 0) => ({ sx, sz, el, free });

  if (t < 6) { // S1: hallway -> into the room
    const w = walkLegs(t, HALL, [{ t0: 3.2, t1: 6.4, pts: [DOOR, [-1.45, -0.78]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: w.head ?? FACE_BED, headPitch: 0.12, smile: 0 });
  } else if (t < 12) { // S2: leaning over the crib
    Object.assign(p, { x: CRIBSIDE[0], z: CRIBSIDE[1], rotY: FACE_BED });
    p.lean = K(t, [[6, 0.2], [6.9, 0.44]]); p.headPitch = K(t, [[6, 0.25], [6.9, 0.55]]);
    p.armB = arm(K(t, [[6, -0.3], [6.8, -0.62]]), 0.05, K(t, [[6, -0.6], [6.8, -0.78]]));
    const wig = 0.07 * Math.sin(2 * PI * 2.4 * (t - 8)) * win(t, 8.0, 8.8, 0.15);
    p.armA = arm(K(t, [[7.0, 0.0], [7.8, -1.05], [9.3, -1.05], [10.0, -0.12]]) + wig, K(t, [[7.0, 0.07], [7.8, -0.1], [9.3, -0.1], [10.0, 0.07]]), K(t, [[7.0, -0.18], [7.8, -0.5], [9.3, -0.5], [10.0, -0.25]]));
  } else if (t < 20) { // S3: bunny off the floor -> under your arm
    const w = walkLegs(t, DOOR, [{ t0: 12.0, t1: 13.75, pts: [[-1.6, -0.12], [-1.34, -0.42]] }, { t0: 15.35, t1: 16.55, pts: [[-1.26, -1.0], BEDSIDE] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
    let rot = w.head ?? FACE_BED;
    rot = lerpAngle(rot, FACE_BED + 0.2, K(t, [[13.5, 0], [13.95, 1], [15.3, 1], [15.45, 0]]));
    rot = lerpAngle(rot, FACE_BED, K(t, [[16.3, 0], [16.9, 1]]));
    p.rotY = rot;
    p.crouch = K(t, [[13.85, 0], [14.45, 0.34], [14.8, 0.34], [15.35, 0]]);
    p.lean = K(t, [[13.85, 0.04], [14.45, 0.62], [14.8, 0.62], [15.35, 0.06], [16.6, 0.06], [17.15, 0.44], [19.2, 0.44], [19.8, 0.22]]);
    p.headPitch = K(t, [[13.85, 0.1], [14.45, 0.5], [14.8, 0.5], [15.35, 0.15], [16.6, 0.15], [17.1, 0.5]]);
    p.armA = arm(K(t, [[13.85, 0], [14.5, -0.72], [14.8, -0.72], [15.35, -0.55], [16.6, -0.55], [17.3, -1.0], [17.8, -1.0], [18.0, -0.85], [18.6, -0.98], [19.3, -0.15]]),
      K(t, [[13.85, 0.07], [14.5, 0.0], [15.35, -0.25], [16.6, -0.25], [17.3, -0.05], [19.3, 0.07]]),
      K(t, [[13.85, -0.18], [14.5, -0.15], [14.8, -0.3], [15.35, -1.25], [16.6, -1.25], [17.3, -0.45], [17.8, -0.45], [18.6, -0.55], [19.3, -0.2]]),
      K(t, [[13.6, 1], [13.85, 0]]));
    p.armB = arm(K(t, [[13.85, 0.03], [14.45, -0.35], [14.8, -0.35], [15.35, 0.03]]), 0.07, -0.3, K(t, [[13.6, 1], [13.85, 0], [15.35, 0], [15.5, 1]]));
  } else if (t < 28) { // S4: phone to the nightstand, lamp off
    const w = walkLegs(t, DOOR, [{ t0: 20.1, t1: 21.9, pts: [[-1.62, -0.85], BEDSIDE] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
    let rot = lerpAngle(w.head ?? FACE_BED, FACE_BED, K(t, [[21.7, 0], [22.1, 1]]));
    rot = lerpAngle(rot, faceToward(BEDSIDE[0], BEDSIDE[1], -1.05, -2.25), K(t, [[23.25, 0], [23.8, 1], [25.75, 1], [26.3, 0]]));
    p.rotY = rot;
    p.lean = K(t, [[21.9, 0.05], [22.45, 0.42], [23.2, 0.42], [23.6, 0.25], [24.05, 0.42], [24.45, 0.25], [25.0, 0.3], [25.6, 0.3], [26.1, 0.06], [26.6, 0.12]]);
    p.headPitch = K(t, [[21.9, 0.15], [22.4, 0.5], [23.3, 0.4], [26.0, 0.4], [26.6, 0.45]]);
    p.headRoll = K(t, [[26.4, 0], [27.2, 0.12]]);
    p.armA = arm(K(t, [[22.3, 0], [22.95, -0.95], [23.15, -0.95], [23.6, -0.65], [24.1, -0.8], [24.35, -0.8], [24.8, -0.3], [25.1, -1.05], [25.5, -1.05], [25.9, 0.0]]),
      K(t, [[22.3, 0.07], [22.95, -0.05], [23.6, 0.0], [25.1, 0.0], [25.9, 0.07]]),
      K(t, [[22.3, -0.18], [22.95, -0.35], [23.15, -0.35], [23.6, -0.95], [24.1, -0.4], [24.35, -0.4], [24.8, -0.6], [25.1, -0.8], [25.5, -0.8], [25.9, -0.2]]),
      K(t, [[21.9, 1], [22.1, 0]]));
    p.smile = t > 26.4 ? 1 : 0;
  } else if (t < 37) { // S5: the night you moved out — sits on the empty bed
    const w = walkLegs(t, HALL, [{ t0: 29.2, t1: 30.0, pts: [DOOR] }, { t0: 31.3, t1: 33.0, pts: [[-1.55, -0.55], [-1.08, -1.18]] }]);
    let rot = w.head ?? FACE_BED;
    rot = lerpAngle(rot, faceToward(DOOR[0], DOOR[1], -0.3, -1.6), K(t, [[30.0, 0], [30.4, 1], [31.2, 1], [31.45, 0]]));
    rot = lerpAngle(rot, -0.75, K(t, [[32.9, 0], [33.6, 1]]));
    const slide = K(t, [[33.0, 0], [33.9, 1]]), sit = K(t, [[33.3, 0], [34.1, 1]]);
    Object.assign(p, { x: lerp(w.x, -0.66, slide), z: lerp(w.z, -1.22, slide), dist: w.dist, speed: w.speed, rotY: rot, y: -0.22 * sit, footFwd: 0.4 * sit, smile: 0 });
    p.lean = lerp(0.04, 0.2, sit);
    p.headPitch = K(t, [[30, 0.12], [33.5, 0.12], [34.2, 0.42], [36, 0.5]]);
    p.armA = arm(lerp(0.03, -0.55, sit), lerp(0.07, -0.18, sit), lerp(-0.18, -0.95, sit), 1 - sit);
    p.armB = arm(K(t, [[34.8, lerp(0.03, -0.55, sit)], [35.4, 0.15]]), K(t, [[34.8, lerp(0.07, -0.18, sit)], [35.4, 0.42]]), K(t, [[34.8, lerp(-0.18, -0.95, sit)], [35.4, -0.15]]), 1 - sit);
  } else if (t < 45) { // S6: montage — only her shadow in the doorway reaches the bed
    const age = momAge(t);
    Object.assign(p, { x: -2.3, z: 0.38, rotY: faceToward(-2.3, 0.38, -0.4, -1.5), headPitch: 0.1 + age * 0.1, lean: 0.03 + age * 0.06, smile: 0 });
    p.armA = arm(-0.45, 0.02, -0.5);
  } else if (t < 48.6) { // S7a: one December — you're home
    const w = walkLegs(t, HALL, [{ t0: 45.8, t1: 46.6, pts: [DOOR] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
    p.rotY = lerpAngle(w.head ?? FACE_BED, faceToward(DOOR[0], DOOR[1], -0.3, -2.0), K(t, [[46.4, 0], [46.9, 1]]));
    p.armB = { sx: K(t, [[46.95, 0.03], [47.5, -0.05]]), sz: K(t, [[46.95, 0.07], [47.5, 0.2]]), el: K(t, [[46.95, -0.18], [47.5, -2.0]]), twist: K(t, [[46.95, 0], [47.5, -0.9]]), free: K(t, [[46.5, 1], [46.75, 0]]) };
    p.headRoll = K(t, [[47.0, 0], [47.6, 0.14]]); p.headPitch = 0.18; p.lean = 0.06;
  } else if (t < 57.6) { // S7b + S8a: the tuck, then the close-up
    const w = walkLegs(t, DOOR, [{ t0: 48.7, t1: 50.3, pts: [[-1.62, -0.88], BEDSIDE] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
    p.rotY = lerpAngle(w.head ?? FACE_BED, FACE_BED, K(t, [[50.1, 0], [50.6, 1]]));
    p.lean = K(t, [[50.3, 0.05], [50.85, 0.44]]);
    p.headPitch = K(t, [[50.3, 0.15], [50.8, 0.52]]);
    p.headRoll = 0.1 + 0.03 * Math.sin(t * 0.9);
    const stroke = 0.05 * Math.sin(2 * PI * 1.1 * (t - 52.9)) * win(t, 52.9, 55.8, 0.3);
    p.armA = arm(K(t, [[50.8, 0], [51.35, -0.98], [51.5, -0.98], [52.2, -1.2], [52.55, -1.2], [52.9, -1.32], [55.6, -1.32], [56.3, -0.9]]) + stroke,
      K(t, [[50.8, 0.07], [51.35, -0.08], [52.9, -0.12], [56.3, -0.05]]),
      K(t, [[50.8, -0.18], [51.35, -0.42], [52.2, -0.62], [52.9, -0.78], [55.6, -0.78], [56.3, -0.45]]),
      K(t, [[50.1, 1], [50.4, 0]]));
    p.armB = arm(K(t, [[50.4, 0.03], [50.9, -0.45]]), 0.07, K(t, [[50.4, -0.18], [50.9, -0.5]]), K(t, [[50.1, 1], [50.4, 0]]));
    p.tear = t > 54.5;
  } else { // S8b: she stands, looks back from the doorway, leaves
    const w = walkLegs(t, BEDSIDE, [{ t0: 58.0, t1: 59.3, pts: [[-1.62, -0.85], DOOR] }, { t0: 59.65, t1: 60.3, pts: [[-2.7, 0.62]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
    let rot = lerpAngle(FACE_BED, w.head ?? FACE_BED, K(t, [[57.9, 0], [58.1, 1]]));
    rot = lerpAngle(rot, faceToward(DOOR[0], DOOR[1], -0.3, -2.0), K(t, [[59.25, 0], [59.5, 1], [59.6, 1], [59.75, 0]]));
    p.rotY = rot;
    p.lean = K(t, [[57.6, 0.44], [58.0, 0.05]]); p.headPitch = K(t, [[57.6, 0.5], [58.0, 0.12]]);
    p.armA = arm(K(t, [[57.6, -0.9], [58.0, 0.03]]), K(t, [[57.6, -0.05], [58.0, 0.07]]), K(t, [[57.6, -0.45], [58.0, -0.18]]), K(t, [[57.9, 0], [58.1, 1]]));
    p.armB = arm(K(t, [[57.6, -0.45], [58.0, 0.03]]), 0.07, K(t, [[57.6, -0.5], [58.0, -0.18]]), K(t, [[57.9, 0], [58.1, 1]]));
    p.tear = t < 58.5;
  }
  return p;
}

// ---------------------------------------------------------------- build + per-frame update
export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const set = buildBedroom(studio, {});
  const D = set.D, B = D.bed, C = D.crib;

  // characters
  const mom = makePerson({ skin: 0xe2ad8c, top: 0xc46b7b, collar: 0xf3e9dc, pants: 0x34405c, shoes: 0x6a5850, hair: 0x3d2a1f, hairStyle: 'bob' });
  scene.add(mom.root);
  const YOUNG_HAIR = 0x3d2a1f, OLD_HAIR = 0xc9c4be;
  const sleepers = {
    baby: makeSleeper({ r: 0.075, skin: 0xebb996, hair: YOUNG_HAIR, beanie: 0xf3dc8a }),
    kid: makeSleeper({ r: 0.098, skin: 0xe8b48f, hair: YOUNG_HAIR, hairStyle: 'short' }),
    teen: makeSleeper({ r: 0.112, skin: 0xe6b08c, hair: YOUNG_HAIR, hairStyle: 'messy' }),
    home: makeSleeper({ r: 0.12, skin: 0xe6b08c, hair: YOUNG_HAIR, hairStyle: 'short' }),
  };
  sleepers.baby.g.position.set(C.cx, C.top + 0.075, -2.1); sleepers.baby.turn.rotation.z = -0.35;
  sleepers.kid.g.position.set(B.cx, B.top + 0.12 + 0.055, -2.16); sleepers.kid.turn.rotation.z = -0.6;
  sleepers.teen.g.position.set(B.cx, B.top + 0.12 + 0.062, -2.15); sleepers.teen.turn.rotation.z = -0.8;
  sleepers.home.g.position.set(B.cx, B.top + 0.12 + 0.066, -2.15); sleepers.home.turn.rotation.z = -0.42;
  Object.values(sleepers).forEach((s) => scene.add(s.g));

  // blankets
  const cribBlanket = new Blanket(new THREE.MeshStandardMaterial({ map: dotsTexture('#f3e3a8', '#ffffff'), roughness: 0.95, side: THREE.DoubleSide }), 28, 40);
  const bedBlanket = new Blanket(new THREE.MeshStandardMaterial({ roughness: 0.95, side: THREE.DoubleSide }));
  const fold = new Blanket(mat(0xf5f2ea, 0.9, { side: THREE.DoubleSide }), 44, 4);
  scene.add(cribBlanket.mesh, bedBlanket.mesh, fold.mesh);
  const blanketMaps = { kid: starsTexture('#8fb3d9', '#f4e3a1'), teen: quiltTexture('#4f5d6b', '#62707e'), quilt: quiltTexture('#7b5d6e', '#c9b18f') };
  const BODY = {
    kid: { x: B.cx, zA: -1.0, zB: -1.95, h: 0.1, r: 0.17 },
    teen: { x: B.cx, zA: -0.62, zB: -1.95, h: 0.13, r: 0.2 },
    home: { x: B.cx, zA: -0.6, zB: -1.95, h: 0.14, r: 0.21 },
  };
  const bedParams = (body, zHead) => ({ cx: B.cx, w: B.w, top: B.top, zFoot: B.z1, zHead, hang: 0.26, footHang: 0.22, r: 0.05, body });

  // the kid's arm resting on top of the blanket
  const kidArm = new THREE.Group(); scene.add(kidArm);
  const pj = mat(0x9cbfe0, 0.9);
  const ka = mk(new THREE.CapsuleGeometry(0.03, 0.2, 4, 10), pj, kidArm); ka.rotation.set(PI / 2, 0, 0.9);
  mk(new THREE.SphereGeometry(0.032, 12, 10), mat(0xe8b48f, 0.6), kidArm, 0.11, 0, 0.07);

  // props
  const bunny = makeBunny(); scene.add(bunny);
  const phone = makePhone(); scene.add(phone.g);
  const phoneLight = new THREE.PointLight(0x9ec5ff, 0, 1.0, 2); scene.add(phoneLight);
  const toys = new THREE.Group(); scene.add(toys);
  [[makeBlock(0xd9534f), -0.62, 0.32, 0.3], [makeBlock(0xf0ad4e), -0.48, 0.2, -0.2], [makeBlock(0x5bc0de), -0.56, 0.42, 0.7], [makeToyCar(), -0.2, 0.55, 0.5], [makeBall(), 0.7, -0.15, 0]]
    .forEach(([o, x, z, r]) => { o.position.set(x, 0, z); o.rotation.y = r; toys.add(o); });

  // pre-compute where her hand is at grab/release moments so props line up with the animation
  const handAt = (tt) => { applyPose(mom, momPose(tt)); return handWorld(mom, -1); };
  const bunnyPick = handAt(14.6), bunnyRelease = handAt(17.8), phonePick = handAt(23.1), phoneRelease = handAt(24.25);
  const BUNNY_FLOOR = new THREE.Vector3(bunnyPick.x, 0.0, bunnyPick.z);
  const BUNNY_BED = new THREE.Vector3(B.cx - 0.24, B.top + 0.03, -1.86);
  const bedTop = (x, z, body) => bedBlanket.heightAt(x, z, bedParams(body, -1.8));
  const PHONE_BED = new THREE.Vector3(clamp(phonePick.x, B.cx - 0.3, B.cx + 0.2), 0, clamp(phonePick.z, -1.85, -1.4));
  PHONE_BED.y = bedTop(PHONE_BED.x, PHONE_BED.z, BODY.teen) + 0.002;
  const NS = D.nightstand, PHONE_NS = new THREE.Vector3(NS.x + 0.06, NS.h + 0.001, NS.z + 0.08);

  function update(t) {
    const shot = shotAt(t), era = eraAt(t);

    // --- set dressing by era
    set.crib.visible = era === 'baby';
    set.bed.visible = set.pillow.visible = era !== 'baby';
    for (const k of Object.keys(sleepers)) sleepers[k].g.visible = k === era;
    set.decor.baby.visible = era === 'baby'; set.decor.kid.visible = era === 'kid'; set.decor.teen.visible = era === 'teen';
    set.decor.empty.visible = era === 'empty' || era === 'home';
    toys.visible = era === 'kid'; kidArm.visible = era === 'kid';
    set.mobile.rotation.y = t * 0.22;

    // --- door + light wedge
    const theta = doorAt(t);
    set.setDoor(theta);
    set.lights.spill.intensity = 0.9 * clamp(theta / OPEN);
    set.updateDust(t, theta);

    // --- mom
    const pose = momPose(t);
    applyPose(mom, pose);
    mom.mats.hair.color.copy(hairColor(YOUNG_HAIR, OLD_HAIR, momAge(t)));

    // --- blankets
    cribBlanket.mesh.visible = era === 'baby';
    if (era === 'baby') cribBlanket.update({ cx: C.cx, w: C.w - 0.04, top: C.top, zFoot: C.z1 - 0.02, zHead: K(t, [[8.0, -1.86], [8.8, -2.0]]), hang: 0.02, footHang: 0, r: 0.03, body: { x: C.cx, zA: -1.5, zB: -1.98, h: 0.065, r: 0.11 } });
    bedBlanket.mesh.visible = fold.mesh.visible = era !== 'baby';
    if (era !== 'baby') {
      const body = era === 'empty' ? null : BODY[era];
      const zHead = era === 'kid' ? K(t, [[18.0, -1.78], [18.6, -1.93]]) : era === 'teen' ? -1.76 : era === 'empty' ? -1.97 : K(t, [[51.4, -1.7], [52.2, -1.96]]);
      const m = era === 'kid' ? blanketMaps.kid : era === 'teen' ? blanketMaps.teen : blanketMaps.quilt;
      if (bedBlanket.mesh.material.map !== m) { bedBlanket.mesh.material.map = m; bedBlanket.mesh.material.needsUpdate = true; }
      const bp = bedParams(body, zHead);
      bedBlanket.update(bp);
      fold.update({ ...bp, zFoot: zHead - 0.1, footHang: 0, lift: 0.024 });
      if (era === 'kid') { kidArm.position.set(B.cx - 0.13, bedBlanket.heightAt(B.cx - 0.13, -1.8, bp) + 0.02, -1.8); kidArm.rotation.y = 0.2; }
    }

    // --- bunny
    if (era === 'kid') {
      bunny.visible = true;
      if (t < 14.6) {
        const k = clamp((t - 14.45) / 0.25);
        const h = handWorld(mom, -1);
        bunny.position.copy(BUNNY_FLOOR).lerp(new THREE.Vector3(h.x, h.y - 0.08, h.z), k * k);
        bunny.rotation.set(0, 0.4, PI / 2 * (1 - k));
        if (k === 0) bunny.position.y = 0.0;
      } else if (t < 17.8) {
        const h = handWorld(mom, -1); bunny.position.set(h.x, h.y - 0.08, h.z); bunny.rotation.set(0, pose.rotY, 0);
      } else {
        const k = clamp((t - 17.8) / 0.35);
        bunny.position.set(bunnyRelease.x, bunnyRelease.y - 0.08, bunnyRelease.z).lerp(BUNNY_BED, k);
        bunny.rotation.set(-PI / 2 * k, 0.3 * k, 0);
      }
    } else bunny.visible = false;

    // --- phone + lamp (teen era)
    phone.g.visible = era === 'teen';
    if (era === 'teen') {
      if (t < 23.1) { phone.g.position.copy(PHONE_BED); phone.g.rotation.set(0, 0.3, 0); }
      else if (t < 24.25) { const h = handWorld(mom, -1); phone.g.position.set(h.x, h.y - 0.02, h.z); phone.g.rotation.set(-0.6, pose.rotY, 0); }
      else { const k = clamp((t - 24.25) / 0.25); phone.g.position.set(phoneRelease.x, phoneRelease.y - 0.02, phoneRelease.z).lerp(PHONE_NS, k); phone.g.rotation.set(-0.6 * (1 - k), -0.2, 0); }
      const glow = t < 24.6 ? 1 : clamp(1 - (t - 24.6) / 0.4);
      phone.screenMat.emissiveIntensity = 1.6 * glow;
      phoneLight.position.copy(phone.g.position).add(new THREE.Vector3(0, 0.12, -0.05)); phoneLight.intensity = 0.5 * glow;
    } else phoneLight.intensity = 0;
    set.setLamp(era === 'teen' && t < 25.45 ? 1 : 0);
    set.setNightlight(era === 'baby' || era === 'kid' ? 1 : 0);

    // --- window: seasons + christmas
    const season = t < 37 ? 'summer' : t < 45 ? ['autumn', 'winter', 'rain', 'summer'][montageSeg(t)] : 'xmas';
    set.setSeason(season, t);
    const moonI = { summer: 1.6, autumn: 1.2, winter: 1.75, rain: 0.7, xmas: 1.65 }[season];
    set.lights.moon.intensity = moonI;
    set.setXmas(era === 'home' ? 1 : 0, t);

    // --- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
  }
  return { update };
}
