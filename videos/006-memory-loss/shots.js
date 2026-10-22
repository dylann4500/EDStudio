// VIDEO 006 — "What if everyone on Earth lost their memory at the same time?"  (tone: WHATIF — a ripple ladder, see docs/TONES.md)
// 68.6 s, four sets (street, city, bedroom, classroom), one consequence per place, time-stamped in the HUD.
// HUD = PEOPLE WHO KNOW THEIR OWN NAME: 8.2 B -> 0 at 9:00 AM New York -> back up via phones, posters, school -> 8.2 B (+1 year).
//
// Shot list (seconds)                       | set       | place / stamp            | what happens
//  0.0– 9.4  street   rush hour → freeze     | street    | NEW YORK 8:59 → SECOND 0 | crowd walks; at 7.0 everyone stops at once, looks around
//  9.4–15.2  pair     two strangers          | street    | +10 SECONDS              | face to face, both look at their own hands
// 15.2–21.4  seoul    green light            | city      | +30 SECONDS              | a line of stopped cars at a green signal, drivers out, lost
// 21.4–25.4  room     a woman, a boy         | bedroom   | +2 MINUTES               | door opens, she stares at a sleeping boy
// 25.4–29.0  tuck     tucks him in anyway    | bedroom   |                          | she tucks the blanket
// 29.0–35.0  phone    Face ID                | street    | +1 HOUR                  | over-the-shoulder: lock screen → unlocked → "My Card"
// 35.0–41.0  posters  "Do you know me?"      | street    | +1 DAY                   | posters on every wall; a man finds his own face
// 41.0–47.4  class    school for adults      | classroom | +1 WEEK                  | grown-ups squeezed into kindergarten chairs
// 47.4–53.8  peace    wars stop              | city      | +1 MONTH                 | two soldiers shake hands in a golden intersection
// 53.8–68.6  bench    in love again          | street    | +1 YEAR                  | old couple, strangers on a bench, he offers his hand
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, handWorld, blink, makeSleeper } from '@engine/rig.js';
import { Blanket, starsTexture, makeBunny } from '@engine/props.js';
import { buildStreet, DIMS as SD, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildBedroom, DIMS as BD } from '@engine/sets/bedroom.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';

const PI = Math.PI;
const FREEZE = 7.0;
const PAIR_X = -22.0;

export const SHOTS = [
  { t0: 0, t1: 9.4, cam: 'street', set: 'street' },
  { t0: 9.4, t1: 15.2, cam: 'pair', set: 'street' },
  { t0: 15.2, t1: 21.4, cam: 'seoul', set: 'city' },
  { t0: 21.4, t1: 25.4, cam: 'room', set: 'bed' },
  { t0: 25.4, t1: 29.0, cam: 'tuck', set: 'bed' },
  { t0: 29.0, t1: 35.0, cam: 'phone', set: 'street' },
  { t0: 35.0, t1: 41.0, cam: 'posters', set: 'street' },
  { t0: 41.0, t1: 47.4, cam: 'class', set: 'class' },
  { t0: 47.4, t1: 53.8, cam: 'peace', set: 'city' },
  { t0: 53.8, t1: 68.6, cam: 'bench', set: 'street' },
];
// p = camera position start→end, a = look-at start→end, fov (deg), amp = handheld drift. 'phone' is computed from the hero's head.
export const CAMS = {
  street:  { p: [[-10.4, 1.62, -2.15], [-11.1, 1.6, -2.15]], a: [[-40, 1.15, -1.3], [-40, 1.15, -1.3]], fov: 40, amp: 0.006 },
  pair:    { p: [[PAIR_X + 0.1, 1.48, 1.95], [PAIR_X + 0.05, 1.46, 1.55]], a: [[PAIR_X, 1.32, -1.4], [PAIR_X, 1.3, -1.4]], fov: 42, amp: 0.004 },
  seoul:   { p: [[0.3, 1.4, 31.0], [0.35, 1.38, 29.2]], a: [[2.3, 2.3, -40], [2.3, 2.3, -40]], fov: 46, amp: 0.005 },
  room:    { p: [[1.85, 2.15, 2.45], [1.6, 2.0, 2.0]], a: [[-1.0, 0.75, -0.55], [-0.85, 0.72, -0.95]], fov: 66, amp: 0.004 },
  tuck:    { p: [[0.72, 1.55, -0.15], [0.62, 1.5, -0.35]], a: [[-1.1, 1.22, -1.62], [-1.1, 1.2, -1.66]], fov: 54, amp: 0.003 },
  phone:   { fov: 40, amp: 0.002 },
  posters: { p: [[-2.85, 1.75, 1.4], [-2.95, 1.72, 0.8]], a: [[-3.0, 1.9, -3.0], [-3.0, 1.9, -3.0]], fov: 50, amp: 0.004 },
  class:   { p: [[3.0, 2.25, 2.75], [2.75, 2.1, 2.4]], a: [[-0.6, 0.85, -1.6], [-0.6, 0.9, -1.75]], fov: 62, amp: 0.004 },
  peace:   { p: [[0.35, 1.45, 5.6], [0.3, 1.42, 4.9]], a: [[0.0, 1.25, -0.4], [0.0, 1.25, -0.4]], fov: 42, amp: 0.004 },
  bench:   { p: [[12.0, 1.35, 1.3], [11.55, 1.3, 0.85]], a: [[9.95, 1.1, -2.2], [9.95, 1.08, -2.2]], fov: 42, amp: 0.003 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const arm = (sx, sz, el, free = 0, twist = 0) => ({ sx, sz, el, free, twist });
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), free: lerp(a.free ?? 0, b.free ?? 0, k), twist: lerp(a.twist ?? 0, b.twist ?? 0, k) });
const HAND_UP = arm(-0.75, 0.05, -1.55, 0, 0.5);        // palm up in front of the face: "whose hand is this?"
const PHONE_ARM = arm(-0.85, 0.08, -1.45, 0, 0.25);

// ---------------------------------------------------------------- the 9:00 AM freeze (street, 0 → 15.2)
// walkers: x0 at t=0, z, dir, v. Everyone decelerates to a stop at FREEZE (τ = 0.18 s).
const TAU = 0.18;
const sOf = (t) => (t < FREEZE ? t : FREEZE + TAU * (1 - Math.exp(-(t - FREEZE) / TAU)));
const sDot = (t) => (t < FREEZE ? 1 : Math.exp(-(t - FREEZE) / TAU));
const R0 = rng(606);
const WALKERS = [];
for (let i = 0; i < 20; i++) {
  const dir = i % 2 ? 1 : -1, v = 1.0 + R0() * 0.35, z = -0.45 - R0() * 2.2;
  const x0 = dir < 0 ? -13.5 - R0() * 13 : -45 + R0() * 12;
  WALKERS.push({ x0, z, dir, v, look: R0(), hands: R0() < 0.35 });
}
// the pair meets face to face at PAIR_X
WALKERS.push({ x0: PAIR_X - 0.66 - 1.2 * FREEZE, z: -1.2, dir: 1, v: 1.2, pair: 'man' });     // stops ~0.44 m from centre (τ adds v·τ)
WALKERS.push({ x0: PAIR_X + 0.64 + 1.12 * FREEZE, z: -1.2, dir: -1, v: 1.12, pair: 'woman' });

function walkerPose(w, i, t) {
  const p = basePose();
  p.eyes = blink(t, i + 3); p.floor = SH; p.smile = 0;
  const s = sOf(t);
  Object.assign(p, { x: w.x0 + w.dir * w.v * s, z: w.z, dist: w.v * s, speed: w.v * sDot(t), rotY: w.dir > 0 ? PI / 2 : -PI / 2 });
  if (t > FREEZE) {
    const k = K(t, [[FREEZE + 0.3, 0], [FREEZE + 1.2, 1]]);
    if (w.pair) {
      // stare at each other … then down at their own hands … then back up
      const down = K(t, [[11.0, 0], [11.6, 1], [13.3, 1], [13.9, 0]]);
      p.headPitch = lerp(0.05, 0.55, down);
      p.armA = mixArm(arm(0.03, 0.07, -0.25, 0), HAND_UP, down);
      p.headYaw = K(t, [[8.0, 0], [8.6, w.pair === 'man' ? 0.15 : -0.12], [9.6, 0]]);
      if (w.pair === 'man') p.armA = mixArm(arm(-0.55, 0.05, -1.2, 0, 0.3), HAND_UP, down); // coffee hand
    } else {
      p.headYaw = k * 0.75 * Math.sin((t - FREEZE) * (0.7 + w.look * 0.6) + i);
      p.headPitch = k * (w.hands ? 0.5 : -0.05);
      if (w.hands) p.armA = mixArm(arm(0.03, 0.07, -0.25, 1), HAND_UP, k);
      p.rotY += k * 0.5 * Math.sin((t - FREEZE) * 0.35 + i * 2.1);
    }
  } else if (w.pair === 'man') p.armA = arm(-0.55, 0.05, -1.2, 0, 0.3);
  return p;
}

// ---------------------------------------------------------------- bedroom (Sydney)
const HALL = BD.hallSpot, DOOR = BD.doorway, BEDSIDE = [-1.2, -1.58], OPEN = 1.25;
function sydneyPose(t) {
  const p = basePose();
  p.eyes = blink(t, 7); p.smile = 0;
  const w = walkLegs(t, HALL, [{ t0: 22.4, t1: 23.3, pts: [DOOR] }, { t0: 24.4, t1: 25.9, pts: [[-1.62, -0.85], BEDSIDE] }]);
  Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed });
  let rot = w.head ?? PI / 2;
  rot = lerpAngle(rot, faceToward(DOOR[0], DOOR[1], -0.3, -2.1), K(t, [[23.1, 0], [23.4, 1], [24.3, 1], [24.5, 0]]));
  rot = lerpAngle(rot, PI / 2, K(t, [[25.7, 0], [26.1, 1]]));
  p.rotY = rot;
  p.headPitch = K(t, [[23.3, 0.1], [23.8, 0.28], [26.0, 0.2], [26.5, 0.52]]);
  p.headRoll = K(t, [[23.6, 0], [24.2, 0.14], [24.5, 0.0], [27.6, 0.0], [28.3, 0.12]]);
  p.lean = K(t, [[26.0, 0.05], [26.5, 0.44]]);
  p.armA = arm(K(t, [[26.2, 0], [26.75, -0.98], [27.0, -0.98], [27.6, -1.25], [29, -1.25]]), K(t, [[26.2, 0.07], [26.75, -0.08], [27.6, -0.12]]),
    K(t, [[26.2, -0.18], [26.75, -0.42], [27.6, -0.75]]), K(t, [[25.7, 1], [26.0, 0]]));
  p.armB = arm(K(t, [[26.0, 0.03], [26.5, -0.45]]), 0.07, K(t, [[26.0, -0.18], [26.5, -0.5]]), K(t, [[25.7, 1], [26.0, 0]]));
  return p;
}

// ---------------------------------------------------------------- phone (+1 hour)
const DAN = [-6.0, -1.0];
function danPose(t) {
  const p = basePose();
  p.eyes = blink(t, 11); p.floor = SH; p.smile = 0;
  Object.assign(p, { x: DAN[0], z: DAN[1], rotY: 0.05, headPitch: 0.42 });
  p.armA = PHONE_ARM;
  p.headRoll = K(t, [[32.2, 0], [33.0, 0.1]]);
  return p;
}
function lockScreen(kind) {
  return canvasTex(512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, kind === 'card' ? '#f4f1ea' : '#2b3a5c'); gr.addColorStop(1, kind === 'card' ? '#e9e4da' : '#c2876b');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    if (kind !== 'card') {
      g.fillStyle = 'rgba(255,255,255,.92)'; g.font = '300 150px Helvetica, Arial, sans-serif'; g.fillText('10:00', w / 2, 300);
      g.font = '500 34px Helvetica, Arial, sans-serif'; g.fillText('Tuesday, March 3', w / 2, 160);
      // padlock: closed / open
      g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 9; g.beginPath();
      if (kind === 'lock') g.arc(w / 2, 92, 22, PI, 0); else g.arc(w / 2 + 30, 82, 22, PI, 0);
      g.stroke(); g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(w / 2 - 30, 92, 60, 44);
      g.font = '500 30px Helvetica, Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(kind === 'lock' ? 'Face ID' : 'Unlocked', w / 2, 960);
    } else {
      g.fillStyle = '#888'; g.font = '600 30px Helvetica, Arial, sans-serif'; g.fillText('My Card', w / 2, 80);
      g.fillStyle = '#c98f6a'; g.beginPath(); g.arc(w / 2, 190, 85, 0, 7); g.fill();
      g.fillStyle = '#2b1d16'; g.beginPath(); g.arc(w / 2, 163, 87, PI * 1.05, PI * 1.95); g.fill();
      g.fillStyle = '#1b1310'; g.beginPath(); g.arc(w / 2 - 29, 198, 9, 0, 7); g.arc(w / 2 + 29, 198, 9, 0, 7); g.fill();
      g.strokeStyle = '#6e2f2b'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, 222, 25, 0.2, PI - 0.2); g.stroke();
      g.fillStyle = '#111'; g.font = '700 64px Helvetica, Arial, sans-serif'; g.fillText('Daniel Reyes', w / 2, 345);
      g.fillStyle = '#666'; g.font = '400 32px Helvetica, Arial, sans-serif'; g.fillText('34 · Brooklyn', w / 2, 395);
      const rows = [['wife', 'Ana ♥'], ['brother', 'Tom'], ['dog', 'Biscuit']];
      rows.forEach(([k, v], i) => {
        const y = 482 + i * 86; g.fillStyle = '#fff'; g.fillRect(40, y - 52, w - 80, 78);
        g.textAlign = 'left'; g.fillStyle = '#3478f6'; g.font = '500 26px Helvetica, Arial, sans-serif'; g.fillText(k, 64, y - 18);
        g.fillStyle = '#111'; g.font = '500 34px Helvetica, Arial, sans-serif'; g.fillText(v, 64, y + 16); g.textAlign = 'center';
      });
    }
  });
}

// ---------------------------------------------------------------- posters (+1 day)
const NOTES = ['Woke up at 41 Pine St', 'I have a cat named Pickle?', 'Answers to “Mom”', 'Found in a red car', 'I think I’m a dentist',
  'Wife? Brown hair, glasses', 'Tattoo says “Rosie”', 'Knows all of ABBA', 'Green coat, 2 kids', 'Lives above a bakery', 'Allergic to cats', 'Good at chess'];
function posterTex(i, face) {
  return canvasTex(256, 340, (g, w, h) => {
    const R = rng(90 + i);
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c0392b'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('DO YOU', w / 2, 40); g.fillText('KNOW ME?', w / 2, 74);
    const sk = face?.skin ?? ['#f1c7a5', '#e2ad8c', '#c98e6a', '#9c6a4a', '#7a4e33'][Math.floor(R() * 5)];
    const hr = face?.hair ?? ['#2b1d15', '#4a3020', '#8a6a4a', '#c9c4be', '#b5502a'][Math.floor(R() * 5)];
    g.fillStyle = face?.top ?? ['#3d4a5c', '#7a3b3b', '#4f6b5a', '#5b4f7a'][Math.floor(R() * 4)]; g.fillRect(w / 2 - 62, 210, 124, 50);
    g.fillStyle = sk; g.beginPath(); g.arc(w / 2, 150, 56, 0, 7); g.fill();
    g.fillStyle = hr; g.beginPath(); g.arc(w / 2, 136, 60, PI * 1.02, PI * 1.98); g.fill();
    g.fillStyle = '#1b1310'; g.beginPath(); g.arc(w / 2 - 20, 156, 6, 0, 7); g.arc(w / 2 + 20, 156, 6, 0, 7); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 3; g.strokeRect(w / 2 - 70, 86, 140, 178);
    g.fillStyle = '#222'; g.font = 'italic 21px Georgia, serif'; g.fillText(NOTES[i % NOTES.length], w / 2, 300);
    g.font = '15px Georgia, serif'; g.fillStyle = '#555'; g.fillText('call: 555-01' + String(10 + i), w / 2, 326);
  });
}
const ME_FACE = { skin: '#e2ad8c', hair: '#b5502a', top: '#4f8a5a' };       // the man who finds his own poster
const POSTER_MAN = [-3.42, -2.35], POSTER_WOMAN = [-2.4, -2.1], POSTER_KEY = [-3.0, 1.62];

// ---------------------------------------------------------------- classroom (+1 week)
const STUDENTS = [0, 1, 2, 3, 4, 7, 8, 9, 10].map((d) => CD.desks[d]);

// ---------------------------------------------------------------- bench (+1 year)
const B = SD.spots.bench;

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, camera, setCamera, renderer } = studio;
  const BASE_EXPOSURE = story.look?.exposure ?? 1.0;

  const city = buildCity(studio, {}); const cityFog = scene.fog;
  const street = buildStreet(studio, {}); const streetFog = scene.fog;
  const bed = buildBedroom(studio, {});
  const cls = buildClassroom(studio, {});
  const sets = { street, city, bed, class: cls };
  const FAR = { street: 400, city: 1500, bed: 80, class: 80 };
  const FOG = { street: streetFog, city: cityFog, bed: null, class: null };
  const EXPO = { street: 1.0, city: 1.25, bed: 1.2, class: 1.1 };

  // ---- people pool (generic extras, re-cast per scene)
  const SKINS = [0xf1c7a5, 0xe2ad8c, 0xc98e6a, 0x9c6a4a, 0x7a4e33, 0xf3d1b8, 0xd9a07a];
  const TOPS = [0x3d4a5c, 0x7a3b3b, 0x4f6b5a, 0x2e2e33, 0x8a6f5a, 0x5b4f7a, 0xa65d48, 0x3f5f7a, 0x6b6b70, 0x9a8a6f, 0xd9a441, 0x5f86a8];
  const PANTS = [0x2a2f3a, 0x3a3530, 0x23262d, 0x4a4f5a, 0x5c4a3a];
  const HAIRS = [0x2b1d15, 0x4a3020, 0x1a1412, 0x8a6a4a, 0xc9c4be, 0x5a3a28];
  const STYLES = ['short', 'bob', 'messy', 'short', 'bob', 'short'];
  const R = rng(66);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const pool = Array.from({ length: 24 }, () => {
    const r = makePerson({ skin: pick(SKINS), top: pick(TOPS), collar: R() < 0.4 ? 0xf3e9dc : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: pick(STYLES) });
    scene.add(r.root); return r;
  });
  const mkRig = (o) => { const r = makePerson(o); scene.add(r.root); return r; };
  const man = mkRig({ skin: 0xc98e6a, top: 0x3f5f7a, collar: 0xf3e9dc, pants: 0x2a2f3a, hair: 0x1a1412, hairStyle: 'short' });
  const woman = mkRig({ skin: 0xf1c7a5, top: 0xa65d48, pants: 0x3a3530, hair: 0x8a6a4a, hairStyle: 'bob' });
  const sydney = mkRig({ skin: 0xe2ad8c, top: 0xd99ab0, collar: 0xf3e9dc, pants: 0x5b4f7a, hair: 0x4a3020, hairStyle: 'bob' });
  const dan = mkRig({ skin: 0xc98f6a, top: 0x6b6b70, collar: 0xf3e9dc, pants: 0x23262d, hair: 0x2b1d16, hairStyle: 'short' });
  const posterMan = mkRig({ skin: 0xe2ad8c, top: 0x4f8a5a, pants: 0x2a2f3a, hair: 0xb5502a, hairStyle: 'messy' });
  const posterWoman = mkRig({ skin: 0x9c6a4a, top: 0xd9a441, pants: 0x3a3530, hair: 0x1a1412, hairStyle: 'bob' });
  const teacher = mkRig({ skin: 0xf3d1b8, top: 0x7a3b3b, collar: 0xf3e9dc, pants: 0x2a2f3a, hair: 0xc9c4be, hairStyle: 'short', glasses: true });
  const soldierA = mkRig({ skin: 0xc98e6a, top: 0x5b6b3a, pants: 0x4a5530, shoes: 0x2a2a22, hair: 0x1a1412, hairStyle: 'short' });
  const soldierB = mkRig({ skin: 0xf1c7a5, top: 0xb59a6a, pants: 0x8a7550, shoes: 0x3a3022, hair: 0x8a6a4a, hairStyle: 'short' });
  for (const [s, c] of [[soldierA, 0x4f5f33], [soldierB, 0xa38a5c]]) {   // helmets
    const hm = mat(c, 0.7), r = 0.135 * 1.16;
    const h = mk(new THREE.SphereGeometry(r, 24, 12, 0, PI * 2, 0, PI * 0.52), hm, s.head.g, 0, 0.02, -0.01); h.scale.set(1.02, 0.95, 1.05);
    const brim = mk(new THREE.TorusGeometry(r * 0.98, 0.012, 6, 28), hm, s.head.g, 0, 0.0, -0.01); brim.rotation.x = PI / 2;
  }
  const oldMan = mkRig({ skin: 0xe2ad8c, top: 0x5a6b8a, collar: 0xf3e9dc, pants: 0x4a4f5a, hair: 0xd9d6d0, hairStyle: 'short', glasses: true });
  const oldWoman = mkRig({ skin: 0xd9a07a, top: 0xc46b7b, collar: 0xf3e9dc, pants: 0x3a3530, hair: 0xe3dfd8, hairStyle: 'bob', glasses: true });
  const heroes = [man, woman, sydney, dan, posterMan, posterWoman, teacher, soldierA, soldierB, oldMan, oldWoman];

  // ---- props
  const coffee = new THREE.Group(); scene.add(coffee);
  mk(new THREE.CylinderGeometry(0.042, 0.034, 0.13, 18), mat(0xfaf6ee, 0.5), coffee, 0, 0.065, 0);
  mk(new THREE.CylinderGeometry(0.0435, 0.039, 0.05, 18), mat(0x9a6b3e, 0.8), coffee, 0, 0.06, 0);
  mk(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 18), mat(0x333333, 0.5), coffee, 0, 0.134, 0);
  // Dan's phone: a bigger custom screen so the close-up can be read
  const phone = new THREE.Group(); scene.add(phone);
  mk(new THREE.BoxGeometry(0.078, 0.158, 0.009), mat(0x1c1c22, 0.35), phone);
  const screens = { lock: lockScreen('lock'), open: lockScreen('open'), card: lockScreen('card') };
  const screenMat = new THREE.MeshBasicMaterial({ map: screens.lock, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.148), screenMat); scr.position.z = 0.0048; phone.add(scr);
  const extraPhones = Array.from({ length: 4 }, () => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.075, 0.15, 0.009), mat(0x1c1c22, 0.35), g); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), new THREE.MeshBasicMaterial({ color: 0x9fc0ff, toneMapped: false })); s.position.z = 0.0048; g.add(s); scene.add(g); return g; });
  // posters on the café + market walls
  const posters = new THREE.Group(); street.root.add(posters);
  const PX = [-7.7, -7.05, -6.45, -4.2, -3.55, -2.95, -2.3, -1.6, -0.95, 1.4, 2.05, 2.7];
  PX.forEach((x, i) => {
    for (const row of [0, 1]) {
      if (Math.abs(x - POSTER_KEY[0]) < 0.4 && !(i * 2 + row === 7)) continue;   // leave room around the key poster
      const k = i * 2 + row, y = row ? 2.02 : 1.42, me = k === 7;
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshStandardMaterial({ map: posterTex(k, me ? ME_FACE : null), roughness: 0.85 }));
      pm.position.set(me ? POSTER_KEY[0] : x + (R() - 0.5) * 0.08, me ? POSTER_KEY[1] : y + (R() - 0.5) * 0.06, -2.975 + k * 0.0004);
      pm.rotation.z = (R() - 0.5) * 0.14; posters.add(pm);
    }
  });
  // Seoul: a line of stopped cars (heading -z, lane x = +2) + one in the other lane
  const cars = [[2, 3.6, 0xc9503f], [2, 9.0, 0xdfe3e8], [2, 14.4, 0x3f5f7a], [2, 19.8, 0x2e2e33], [2, 25.2, 0xd9a441], [-2, -6.5, 0x6b8a5a]].map(([x, z, c], i) => {
    const car = makeCar(c, i + 3); car.g.position.set(x, 0, z); car.g.rotation.y = x > 0 ? PI : 0; city.root.add(car.g); car.setLights?.(1); return car;
  });
  // Sydney bedroom: sleeping boy + mirrored blanket (Blanket drapes toward +z; this bed's foot is at +z)
  const BB = bed.D.bed;
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.decor.kid.visible = true;
  const boy = makeSleeper({ r: 0.098, skin: 0xe8b48f, hair: 0x3d2a1f, hairStyle: 'short' });
  boy.g.position.set(BB.cx, BB.top + 0.175, -2.16); boy.turn.rotation.z = -0.6; bed.root.add(boy.g);
  const blanket = new Blanket(new THREE.MeshStandardMaterial({ map: starsTexture('#8fb3d9', '#f4e3a1'), roughness: 0.95, side: THREE.DoubleSide }));
  blanket.mesh.scale.z = -1; bed.root.add(blanket.mesh);
  const bunny = makeBunny(); bunny.position.set(BB.cx + 0.22, BB.top + 0.1, -2.1); bunny.rotation.set(-0.25, -0.5, 0.15); bed.root.add(bunny);
  const BODY = { x: BB.cx, zA: 1.0, zB: 1.95, h: 0.1, r: 0.17 };

  // ---- per-frame
  let curSet = null;
  function useSet(name) {
    if (name === curSet) return; curSet = name;
    for (const [k, s] of Object.entries(sets)) s.root.visible = k === name;
    scene.fog = FOG[name]; camera.far = FAR[name];
    renderer.toneMappingExposure = BASE_EXPOSURE * EXPO[name];
  }
  const hide = (r) => { r.root.visible = false; };
  const put = (r, p) => { applyPose(r, p); };

  function update(t) {
    const shot = shotAt(t);
    useSet(shot.set);
    pool.forEach(hide); heroes.forEach(hide);
    coffee.visible = phone.visible = false; extraPhones.forEach((g) => (g.visible = false));
    posters.visible = t >= 35.0 && t < 53.8 + 20;   // posters stay up after day one (they're on the street for the bench too)
    let ex = 0;                                       // next free extra
    const extra = () => pool[ex++];

    if (shot.set === 'street') {
      street.setSeason(t >= 53.8 ? 'autumn' : t >= 35 ? 'summer' : 'spring', t);
      if (t < 15.2) {
        street.aimSun(shot.cam === 'pair' ? PAIR_X : -26, -1.4, shot.cam === 'pair' ? 6 : 16);
        WALKERS.forEach((w, i) => {
          const p = walkerPose(w, i, t);
          if (shot.cam === 'pair' && !w.pair && Math.abs(p.x - PAIR_X) < 1.3 && p.z > -1.35) return;   // keep the lens clear
          const r = w.pair === 'man' ? man : w.pair === 'woman' ? woman : extra();
          put(r, p);
          if (w.pair === 'man') { const h = handWorld(man, -1); coffee.visible = true; coffee.position.set(h.x, h.y - 0.07, h.z); coffee.rotation.set(0, 0, 0); }
        });
      } else if (t < 35.0) { // +1 hour: Dan reads his phone; a few others on their phones
        street.aimSun(-6, -1, 8);
        const p = danPose(t); put(dan, p);
        const head = new THREE.Vector3(); dan.head.g.getWorldPosition(head);
        const h = handWorld(dan, -1);
        phone.visible = true; phone.position.copy(h).add(new THREE.Vector3(0, 0.1, 0.02)); phone.lookAt(head);
        screenMat.map = t < 31.0 ? screens.lock : t < 32.2 ? screens.open : screens.card;
        [[-7.4, -2.1, 0.6], [-4.6, -2.4, -0.4], [-8.6, -0.6, 2.2], [-3.4, -0.9, -2.0]].forEach(([x, z, rot], i) => {
          const r = extra(), q = basePose();
          Object.assign(q, { x, z, rotY: rot, floor: SH, headPitch: 0.42, eyes: blink(t, i + 20), smile: 0 });
          q.armA = PHONE_ARM; put(r, q);
          const hh = handWorld(r, -1), g = extraPhones[i]; g.visible = true; g.position.copy(hh).add(new THREE.Vector3(0, 0.05, 0)); g.rotation.set(-0.9, rot, 0); g.rotation.order = 'YXZ'; g.rotation.set(-0.9, rot + PI, 0);
        });
      } else if (t < 41.0) { // +1 day: posters; a man finds his own face, a woman points at it, then at him
        street.aimSun(-3.0, -2, 8);
        const m = basePose(); Object.assign(m, { x: POSTER_MAN[0], z: POSTER_MAN[1], rotY: PI, floor: SH, eyes: blink(t, 31), smile: 0, headPitch: -0.08 });
        m.rotY = lerpAngle(PI, faceToward(POSTER_MAN[0], POSTER_MAN[1], 0.0, 4.0), K(t, [[38.7, 0], [39.3, 1]]));   // turns to camera: it's him
        m.mouth = t > 39.3 ? 'o' : 'flat';
        put(posterMan, m);
        const wq = basePose(); Object.assign(wq, { x: POSTER_WOMAN[0], z: POSTER_WOMAN[1], rotY: faceToward(POSTER_WOMAN[0], POSTER_WOMAN[1], POSTER_KEY[0], -3.0), floor: SH, eyes: blink(t, 32), smile: 0 });
        const point = K(t, [[36.2, 0], [36.7, 1], [37.9, 1], [38.2, 0.4]]), toHim = K(t, [[38.2, 0], [38.6, 1]]);
        wq.armB = mixArm(arm(0.03, 0.07, -0.25, 1), arm(-1.65, 0.1, -0.1, 0), point);
        wq.rotY = lerpAngle(wq.rotY, faceToward(POSTER_WOMAN[0], POSTER_WOMAN[1], POSTER_MAN[0], POSTER_MAN[1]), toHim);
        if (toHim > 0) wq.armB = mixArm(wq.armB, arm(-1.35, 0.25, -0.1, 0), toHim);
        put(posterWoman, wq);
        [[-4.7, -2.3, PI + 0.1], [-1.4, -2.25, PI - 0.15], [-5.2, -1.2, PI - 0.4], [-0.9, -1.5, PI + 0.3]].forEach(([x, z, rot], i) => {
          const r = extra(), q = basePose(); Object.assign(q, { x, z, rotY: rot, floor: SH, headPitch: -0.1 + 0.05 * Math.sin(t + i), eyes: blink(t, i + 40), smile: 0 }); put(r, q);
        });
      } else { // +1 year: the bench
        street.aimSun(B[0], B[1], 6);
        const look = (a, b) => K(t, [[a, 0], [a + 0.6, 1]]) * (1 - K(t, [[b, 0], [b + 0.6, 1]]));
        const mq = basePose(); Object.assign(mq, { x: B[0] - 0.42, z: B[1] - 0.02, y: -0.185, floor: SH, rotY: 0, footFwd: 0.42, lean: 0.04, eyes: blink(t, 51), smile: t > 58.8 ? 1 : 0, glasses: true });
        mq.headYaw = 1.0 * Math.max(look(55.4, 56.8), K(t, [[58.2, 0], [58.8, 1]])); mq.headPitch = 0.1;
        mq.armA = arm(-0.3, 0.05, -0.75, 0, 0.2);
        const offer = K(t, [[60.6, 0], [61.4, 1]]);
        mq.armB = mixArm(arm(-0.3, 0.05, -0.75, 0, -0.2), arm(-0.32, 0.45, -0.1, 0, -0.6), offer);
        put(oldMan, mq);
        const wq = basePose(); Object.assign(wq, { x: B[0] + 0.42, z: B[1] - 0.02, y: -0.185, floor: SH, rotY: 0, footFwd: 0.42, lean: 0.04, eyes: blink(t, 52), smile: t > 59.2 ? 1 : 0, glasses: true });
        wq.headYaw = -1.0 * Math.max(look(57.0, 58.1), K(t, [[58.6, 0], [59.2, 1]])); wq.headPitch = 0.1;
        const take = K(t, [[61.4, 0], [62.2, 1]]);
        wq.armA = mixArm(arm(-0.3, 0.05, -0.75, 0, 0.2), arm(-0.4, 0.42, -0.15, 0, 0.6), take);
        wq.armB = arm(-0.3, 0.05, -0.75, 0, -0.2);
        wq.headRoll = K(t, [[62.4, 0], [63.4, -0.12]]);
        put(oldWoman, wq);
        // passers-by on the far sidewalk
        [[0, 8.4, 1.15], [1, 8.9, -1.05], [2, 9.3, 1.25]].forEach(([i, z, v]) => {
          const r = extra(), q = basePose(); const x = 4 + v * (t - 53.8) * (v > 0 ? 1 : -1) * (v > 0 ? 1 : -1) + (v < 0 ? 16 : 0);
          Object.assign(q, { x: v > 0 ? 3 + v * (t - 53.8) : 19 + v * (t - 53.8), z, rotY: v > 0 ? PI / 2 : -PI / 2, floor: SH, dist: Math.abs(v) * t, speed: Math.abs(v), eyes: blink(t, 60 + i) });
          put(r, q);
        });
      }
    } else if (shot.set === 'city') {
      if (t < 47.4) { // Seoul, 11 PM: stopped at a green light
        city.setShadowFocus(2, 12, 26); city.setTime({ day: 0, golden: 0, milky: 0, moon: 1 }); city.setPower(1); city.setSignal('green');
        cars.forEach((c) => (c.g.visible = true));
        const drivers = [[3.35, 9.4, -PI / 2 + 0.4], [0.75, 19.2, PI / 2 - 0.3], [3.3, 25.6, -0.2]];
        drivers.forEach(([x, z, rot], i) => {
          const r = extra(), q = basePose(); Object.assign(q, { x, z, rotY: rot, eyes: blink(t, i + 70), smile: 0 });
          q.headYaw = 0.7 * Math.sin(t * 0.8 + i * 2); q.headPitch = i === 1 ? 0.45 : -0.05; if (i === 1) q.armA = HAND_UP;
          put(r, q);
        });
        [[5.3, 1.4, PI], [5.9, 3.0, -PI / 2], [5.2, 4.6, PI + 0.3], [-5.4, 2.0, PI / 2]].forEach(([x, z, rot], i) => {
          const r = extra(), q = basePose(); Object.assign(q, { x, z, rotY: rot, floor: 0.14, eyes: blink(t, i + 80), smile: 0, headYaw: 0.6 * Math.sin(t * 0.6 + i) }); put(r, q);
        });
      } else { // +1 month, golden hour: two soldiers shake hands mid-intersection
        city.setShadowFocus(0, 0, 14); city.setTime({ day: 1, golden: 1, milky: 0, moon: 0 }); city.setPower(1); city.setSignal('off');
        cars.forEach((c) => (c.g.visible = false));
        const meet = K(t, [[47.4, 0], [49.2, 1]]);
        const a = basePose(); Object.assign(a, { x: lerp(-1.6, -0.42, meet), z: -0.5, rotY: PI / 2, dist: lerp(0, 1.18, meet), speed: meet < 1 ? 0.6 : 0, eyes: blink(t, 91), smile: t > 50.2 ? 1 : 0 });
        const b = basePose(); Object.assign(b, { x: lerp(1.6, 0.42, meet), z: -0.5, rotY: -PI / 2, dist: lerp(0, 1.18, meet), speed: meet < 1 ? 0.6 : 0, eyes: blink(t, 92), smile: t > 50.6 ? 1 : 0 });
        const reach = K(t, [[49.0, 0], [49.7, 1]]), shake = 0.08 * Math.sin((t - 49.7) * 9) * K(t, [[49.7, 0], [50.0, 1], [51.6, 1], [52.0, 0]]);
        a.armA = mixArm(arm(0.03, 0.07, -0.25, 1), arm(-0.95 + shake, -0.18, -0.35, 0, 0.3), reach);
        b.armB = mixArm(arm(0.03, 0.07, -0.25, 1), arm(-0.95 + shake, -0.18, -0.35, 0, -0.3), reach);
        a.headPitch = b.headPitch = 0.05;
        put(soldierA, a); put(soldierB, b);
        [[-3.2, -3.0, 1.1, 0], [3.5, 2.5, -1.0, 1], [-2.0, -6.5, 0.9, 2], [2.6, -5.2, -1.1, 3], [-5.4, 1.5, 0, 4]].forEach(([x, z, v, i]) => {
          const r = extra(), q = basePose(); Object.assign(q, { x: x + v * (t - 47.4), z, rotY: v === 0 ? PI / 2 : v > 0 ? PI / 2 : -PI / 2, dist: Math.abs(v) * t, speed: Math.abs(v), floor: v === 0 ? 0.14 : 0, eyes: blink(t, i + 100), smile: 1 });
          put(r, q);
        });
      }
    } else if (shot.set === 'bed') {
      const theta = K(t, [[21.4, 0], [21.7, 0], [22.7, OPEN]]);
      bed.setDoor(theta); bed.lights.spill.intensity = 0.9 * clamp(theta / OPEN); bed.updateDust(t, theta);
      bed.setSeason('summer', t); bed.setNightlight(1); bed.setLamp(0); bed.setXmas(0, t);
      blanket.update({ cx: BB.cx, w: BB.w, top: BB.top, zFoot: -BB.z1, zHead: K(t, [[26.9, 1.76], [27.7, 1.93]]), hang: 0.26, footHang: 0.22, r: 0.05, body: BODY });
      put(sydney, sydneyPose(t));
    } else if (shot.set === 'class') {
      cls.setChairsUp(false); cls.setAbandoned(0); cls.setSeason('autumn', t); cls.setDoor(0); cls.setClock(9, 10 + (t - 41) * 0.1);
      cls.setBoard('Lesson 1\nYour name is ____________');
      cls.updateDust(t, 0.4); cls.tags.forEach((g) => (g.visible = false));
      STUDENTS.forEach((d, i) => {
        const r = extra(), q = basePose();
        Object.assign(q, { x: d.x, z: d.z + CD.chair.dz + 0.06, rotY: PI, y: -0.5, footFwd: 0.36, lean: 0.18, eyes: blink(t, i + 120), smile: 0 });
        q.headPitch = 0.05 + 0.1 * Math.sin(t * 0.7 + i); q.headYaw = 0.15 * Math.sin(t * 0.5 + i * 1.3);
        q.armA = arm(-0.75, 0.05, -0.9, 0, 0.3); q.armB = arm(-0.75, 0.05, -0.9, 0, -0.3);
        if (i === 4) q.armB = arm(K(t, [[44.6, -0.75], [45.0, -2.9]]), 0.1, K(t, [[44.6, -0.9], [45.0, -0.15]]), 0);   // a hand goes up
        put(r, q);
      });
      const tq = basePose(); Object.assign(tq, { x: 0.9, z: -2.45, rotY: K(t, [[41, PI], [43.2, PI], [43.7, 0.2]]), eyes: blink(t, 130), smile: t > 45.2 ? 1 : 0, glasses: true });
      const write = K(t, [[41.0, 1], [43.2, 1], [43.6, 0]]);
      tq.armA = mixArm(arm(0.03, 0.07, -0.25, 0), arm(-2.0, 0.2 + 0.12 * Math.sin(t * 7), -0.45, 0), write);
      put(teacher, tq);
    }

    // ---- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    if (shot.cam === 'phone') {   // Dan's point of view: from just in front of his face, down onto the screen
      const head = new THREE.Vector3(), fwd = new THREE.Vector3(); dan.head.g.getWorldPosition(head);
      fwd.subVectors(phone.position, head).setY(0).normalize();
      const k = u * u * (3 - 2 * u);
      const pos = [head.x + fwd.x * 0.17, head.y + 0.03 - 0.02 * k, head.z + fwd.z * 0.17];
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x);   // camera-right; aim left of the phone so it sits right of the HUD
      setCamera(pos, [phone.position.x - right.x * 0.026, phone.position.y + 0.008, phone.position.z - right.z * 0.026], lerp(54, 50, k), t, c.amp);
    } else {
      const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
    }
  }
  return { update };
}
