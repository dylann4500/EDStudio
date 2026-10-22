// VIDEO 002 — "What if everyone on Earth woke up pregnant?"  (tone: FUNNY — see docs/TONES.md)
// 61 s, 8 shots, one set (engine/sets/street.js). Text/HUD timing lives in story.json; this file is 3D only.
// Comedy engine: one recurring everyman (Gary: bald, mustache, blue polo) gets the gag in every era;
// the crowd does everything IN SYNC (look down, stare, waddle, freeze) — synchrony is the joke.
//
// Shot list (seconds)                         | season | what happens
//  0.0– 9.4  street  normal morning → pop      | spring | crowd walks; everyone stops, looks down; bellies pop (boing)
//  9.4–11.8  gary    "Yes. Even Gary."         | spring | Gary looks at his belly, then deadpan at camera
// 11.8–18.0  cart    morning sickness          | spring | vendor offers a hot dog; Gary turns green, runs to the trash can
// 18.0–25.5  market  last pickle jar           | summer | Gary exits with the last jar; every head tracks him in unison
// 25.5–33.5  bench   can't reach shoes         | autumn | three failed reaches; neighbor can't get up; he gives up
// 33.5–41.5  queue   penguin bathroom line     | autumn | waddling line shuffles to RESTROOM; Gary at the back turns to camera
// 41.5–49.5  hosp    everyone due today        | winter | crowd freezes clutching bellies; doctor runs out… grabs his own
// 49.5–61.0  crane   8.2 billion babies        | winter | Gary holds a baby + phone ("Mom?"); crane up over the street
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makeBabyBundle, makePickleJar, makeIceCreamTub, makeHotDog, makePhone } from '@engine/props.js';
import { buildStreet, DIMS, SIDEWALK_H as SH } from '@engine/sets/street.js';

const PI = Math.PI;
const S = DIMS.spots;

export const SHOTS = [
  { t0: 0, t1: 9.4, cam: 'street' },
  { t0: 9.4, t1: 11.8, cam: 'gary' },
  { t0: 11.8, t1: 18.0, cam: 'cart' },
  { t0: 18.0, t1: 25.5, cam: 'market' },
  { t0: 25.5, t1: 33.5, cam: 'bench' },
  { t0: 33.5, t1: 41.5, cam: 'queue' },
  { t0: 41.5, t1: 49.5, cam: 'hosp' },
  { t0: 49.5, t1: 61.0, cam: 'crane' },
];
// p = camera position start→end, a = look-at start→end, fov (deg), amp = handheld drift (m), ease: 'io' (default) | 'out'
export const CAMS = {
  street: { p: [[-20.0, 1.45, 5.4], [-20.0, 1.4, 4.4]], a: [[-20.0, 1.55, -1.6], [-20.0, 1.5, -1.6]], fov: 48, amp: 0.006 },
  gary:   { p: [[2.45, 1.5, 1.25], [2.42, 1.48, 1.0]], a: [[2.2, 1.2, -1.5], [2.2, 1.2, -1.5]], fov: 40, amp: 0.004 },
  cart:   { p: [[6.6, 1.55, 6.4], [6.65, 1.5, 5.8]], a: [[6.65, 0.95, -1.0], [6.7, 0.95, -1.0]], fov: 44, amp: 0.005 },
  market: { p: [[1.1, 1.75, 7.6], [1.3, 1.7, 7.0]], a: [[1.0, 1.05, -1.5], [1.3, 1.05, -1.5]], fov: 46, amp: 0.005 },
  bench:  { p: [[11.9, 1.35, 1.3], [11.7, 1.3, 1.0]], a: [[9.95, 0.98, -2.2], [9.95, 0.95, -2.2]], fov: 42, amp: 0.004 },
  queue:  { p: [[11.6, 1.65, -0.75], [11.3, 1.62, -0.8]], a: [[-6, 1.0, -2.6], [-6, 1.0, -2.6]], fov: 40, amp: 0.005 },
  hosp:   { p: [[-11.3, 1.75, 7.2], [-11.35, 1.7, 6.4]], a: [[-11.45, 2.3, -2.0], [-11.45, 2.25, -2.0]], fov: 50, amp: 0.005 },
  crane:  { p: [[2.15, 1.55, 0.6], [4.0, 12.0, 6.2]], a: [[2.05, 1.4, -1.4], [-6.0, 0.6, -0.6]], fov: 46, amp: 0.004, ease: 'crane' },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const seasonAt = (t) => (t < 18 ? 'spring' : t < 25.5 ? 'summer' : t < 41.5 ? 'autumn' : 'winter');

// boing: 0 → 1 with a cartoon overshoot (spring) starting at t0
const boing = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-5.5 * (t - t0)) * Math.cos(15 * (t - t0)));
const POP = 7.6;
function bellyAt(t) {
  if (t < 11.8) return 0.7 * boing(t, POP);
  if (t < 18) return 0.75;
  if (t < 25.5) return 0.9;
  if (t < 33.5) return 1.05;
  if (t < 41.5) return 1.15;
  if (t < 49.5) return 1.25;
  return 0;
}

// ---------------------------------------------------------------- arm library (armA = figure's left/-x, armB = right/+x)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const BELLY_A = A(-0.32, -0.02, -1.25, 0.55), BELLY_B = A(-0.32, -0.02, -1.25, -0.55);   // hands on the belly
const BACK_A = A(0.6, 0.18, -1.55, 1.4), BACK_B = A(0.6, 0.18, -1.55, -1.4);          // hands on the lower back
const MOUTH_B = A(-1.25, 0.05, -2.4, -0.7);                                             // hand over mouth
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);        // hugging something to the chest
const CRADLE_A = A(-0.5, -0.06, -1.7, 0.75);                                             // baby in the left arm
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);                                            // phone to the right ear
const STOP_A = A(-1.1, 0.25, -0.5, 0.2), STOP_B = A(-1.1, 0.25, -0.5, -0.2);             // "calm down" palms out
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

// walking along x at constant speed with a smooth stop: returns distance walked by time t
function walkDist(t, v, tStop = 1e9, ramp = 0.5) {
  if (t <= tStop) return v * t;
  const u = Math.min(t - tStop, ramp);
  return v * (tStop + u - (u * u) / (2 * ramp));
}
const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));

// ---------------------------------------------------------------- crowd appearance
const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const N_EXTRAS = 30;

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const set = buildStreet(studio, {});

  // --- cast
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const vendor = makePerson({ skin: 0xc98e6a, top: 0xf5f0e2, collar: 0xd2483f, pants: 0x2a2a2a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const doctor = makePerson({ skin: 0xf1c3a1, top: 0xf7f7f4, collar: 0x7fb7b0, pants: 0x5fa39b, shoes: 0xf2f2f2, hair: 0x9a6a3a, hairStyle: 'short', glasses: true });
  const neighbor = makePerson({ skin: 0x9a6447, top: 0xe58fa6, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'bob' });
  [gary, vendor, doctor, neighbor].forEach((p) => scene.add(p.root));
  const R = rng(7);
  const extras = Array.from({ length: N_EXTRAS }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = makePerson({
      skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.2,
      mustache: style !== 'bob' && R() < 0.4 ? HAIRS[Math.floor(R() * 3)] : null,
    });
    scene.add(p.root);
    p.seed = R(); p.seed2 = R(); p.seed3 = R();
    return p;
  });

  // --- props (children of rig parts so they follow the animation exactly)
  const handOf = (rig, side) => rig.arms.find((a) => a.s === side).hand;
  const hotdog = makeHotDog(); handOf(vendor, 1).add(hotdog); hotdog.position.set(0, -0.06, 0.03);
  const jar = makePickleJar(); gary.spine.add(jar); jar.position.set(0, 0.24, 0.36); jar.scale.setScalar(1.15);
  const tub = makeIceCreamTub(); jar.add(tub); tub.position.set(0.02, 0.385, 0); tub.rotation.z = 0.12;
  const phone = makePhone(); handOf(gary, 1).add(phone.g); phone.g.position.set(-0.02, -0.06, 0.02); phone.g.rotation.set(PI / 2, 0, PI / 2);
  const BUNDLE_COLS = [0xf3d9e2, 0xcfe0f2, 0xf5ecc9, 0xd9ecd0, 0xf0d9c0];
  const bundleFor = (rig, i) => { const b = makeBabyBundle(BUNDLE_COLS[i % BUNDLE_COLS.length]); rig.spine.add(b); b.position.set(0.0, 0.3, 0.2); b.rotation.set(0, 0, 0.25); b.visible = false; return b; };
  const garyBaby = bundleFor(gary, 0);
  const extraBabies = extras.map((p, i) => bundleFor(p, i + 1));
  const doctorStetho = mk(new THREE.TorusGeometry(0.085, 0.01, 6, 20, PI * 1.2), mat(0x333333, 0.4), doctor.spine, 0, 0.47, 0.06); doctorStetho.rotation.set(PI / 2 + 0.25, 0, PI * 0.9);

  const skinGreen = (rig, base, k) => { const c = new THREE.Color(base).lerp(new THREE.Color(0x9cc27a), k); rig.mats.skin.color.copy(c); rig.mats.faceSkin.color.copy(c); };

  // ---------------------------------------------------------------- performances
  function garyPose(t) {
    const p = basePose();
    p.eyes = blink(t, 2); p.belly = bellyAt(t); p.mouth = 'flat';
    if (t < 9.4) { // S1: out of shot (far back of the crowd)
      Object.assign(p, { x: -1.0, z: -1.9, y: SH, rotY: PI / 2 });
      p.headPitch = K(t, [[7.0, 0.05], [7.35, 0.75], [8.4, 0.75], [8.8, 0.1]]);
    } else if (t < 11.8) { // S1b: looks down at belly… then deadpan at camera
      Object.assign(p, { x: 2.2, z: -1.5, y: SH, rotY: 0.75 });
      p.headPitch = K(t, [[9.4, 0.72], [10.4, 0.72], [10.75, 0.02]]);
      p.headYaw = K(t, [[10.4, 0], [10.75, -0.6]]); p.eyes = 'open';
      p.armA = mixArm(REST, BELLY_A, K(t, [[9.4, 1], [10.5, 1], [10.9, 0.0]]));
      p.armB = mixArm(REST, BELLY_B, K(t, [[9.4, 1], [10.5, 1], [10.9, 0.0]]));
      p.lean = -0.04;
    } else if (t < 18) { // S2: hot dog → green → trash can
      const X0 = 7.0, Z0 = -0.5, TRX = S.trash[0], TRZ = S.trash[1] - 0.5;
      const walk = K(t, [[15.85, 0], [16.55, 1]]);
      p.x = lerp(K(t, [[11.8, X0 + 0.15], [12.4, X0]]), TRX + 0.05, walk); p.z = lerp(Z0, TRZ, walk); p.y = SH;
      p.dist = 2.2 * walk + K(t, [[11.8, 0], [12.4, 0.15]]); p.speed = t > 15.85 && t < 16.55 ? 1.2 : t < 12.4 ? 0.3 : 0;
      const faceCart = faceToward(X0, Z0, S.cart[0], S.cart[1] + 1.6);
      p.rotY = lerpAngle(faceCart, -0.25, K(t, [[15.7, 0], [16.0, 1]]));
      p.lean = K(t, [[13.5, 0.03], [13.9, 0.28], [14.3, 0.28], [14.6, -0.12], [15.7, -0.08], [16.5, 0.05], [16.75, 0.78], [17.9, 0.78]]);
      p.headPitch = K(t, [[13.5, 0.05], [13.9, 0.25], [14.3, 0.25], [14.6, -0.05], [16.5, 0.05], [16.75, 0.5]]);
      p.armB = mixArm(REST, MOUTH_B, K(t, [[14.45, 0], [14.75, 1], [16.4, 1], [16.75, 0]]));
      p.armA = mixArm(REST, A(-0.35, 0.05, -0.4, 0), K(t, [[16.55, 0], [16.8, 1]]));
      p.mouth = t < 14.3 ? 'smile' : 'flat';
      p.eyes = t > 14.4 && t < 15.6 ? 'closed' : p.eyes;
    } else if (t < 25.5) { // S3: exits the market hugging the last jar; stops, notices the stares, speed-waddles off
      const DX = S.marketDoor[0], DZ = S.marketDoor[1];
      const seg1 = K(t, [[18.2, 0], [19.9, 1]]), seg2 = K(t, [[21.9, 0], [25.3, 1]], (u) => u * u * (3 - 2 * u));
      p.x = lerp(DX, DX + 3.8, seg2); p.z = lerp(DZ, -1.25, seg1); p.y = SH;
      p.dist = 1.35 * seg1 + 3.8 * seg2; p.speed = (t > 18.2 && t < 19.9) || (t > 22.0 && t < 25.3) ? 0.9 : 0;
      p.rotY = lerpAngle(0, PI / 2, K(t, [[19.8, 0], [20.1, 0.25], [21.6, 0.25], [22.0, 1]]));
      p.headYaw = K(t, [[20.1, 0], [20.5, -0.55], [20.9, 0.55], [21.3, -0.2], [21.6, 0]]);  // looks left, right — everyone's staring
      p.armA = HUG_A; p.armB = HUG_B; p.lean = -0.1; p.waddle = 0.8;
      p.mouth = t > 20.2 && t < 21.7 ? 'o' : 'flat';
    } else if (t < 33.5) { // S4: sitting; three reaches for the shoe, then gives up
      const B = S.bench;
      Object.assign(p, { x: B[0] - 0.45, z: B[1] - 0.02, y: -0.185, floor: SH, rotY: 0, footFwd: 0.42 });
      const reach = (a) => K(t, [[a, 0], [a + 0.45, 1], [a + 0.9, 1], [a + 1.25, 0]]);
      const r = Math.max(reach(26.6), reach(28.3), reach(29.9) * 1.1);
      p.lean = lerp(0.02, 0.42, r) + K(t, [[31.2, 0], [31.7, -0.22]]);
      p.headPitch = lerp(0.15, 0.6, r) + K(t, [[31.2, 0], [31.7, -0.55]]);
      p.armA = mixArm(A(-0.25, 0.05, -0.6, 0), A(-0.95, 0.12, -0.12, 0.2), r);
      p.armB = mixArm(A(-0.25, 0.05, -0.6, 0), A(-0.95, 0.12, -0.12, -0.2), r);
      if (t > 31.3) { const k = K(t, [[31.3, 0], [31.8, 1]]); p.armA = mixArm(p.armA, A(-0.05, 0.75, -0.25, 0), k); p.armB = mixArm(p.armB, A(-0.05, 0.75, -0.25, 0), k); }
      p.mouth = t > 30.0 && t < 31.2 ? 'o' : 'flat';
      p.eyes = t > 31.6 && t < 32.4 ? 'closed' : p.eyes;
    } else if (t < 41.5) { // S5: last in the bathroom line, hands on back; turns to camera on the punch line
      const base = 7.85 - QSTEP * shuffleSteps(t, 0);
      Object.assign(p, { x: base, z: -1.55, y: SH, lean: -0.12, waddle: 1 });
      p.dist = QSTEP * shuffleSteps(t, 0); p.speed = shuffleSpeed(t, 0);
      p.rotY = lerpAngle(-PI / 2, 0, K(t, [[38.0, 0], [38.5, 1]]));   // turns sideways (belly in profile)…
      p.headYaw = K(t, [[38.4, 0], [38.8, 0.95]]); p.headPitch = 0.02;  // …and looks straight at us
      p.armA = BACK_A; p.armB = BACK_B;
    } else if (t < 49.5) { // S6: front of the hospital crowd, freezes clutching the belly
      Object.assign(p, { x: -13.0, z: -0.7, y: SH, rotY: 0.35 });
      const grab = K(t, [[42.6, 0], [42.9, 1]]);
      p.armA = mixArm(REST, BELLY_A, grab); p.armB = mixArm(REST, BELLY_B, grab);
      p.lean = -0.1 * grab; p.mouth = grab > 0.5 ? 'o' : 'flat';
      p.headYaw = K(t, [[45.0, 0], [45.4, 0.7]]);
    } else { // S7: baby in the left arm, phone at the right ear
      Object.assign(p, { x: 2.05, z: -1.4, y: SH, rotY: 0.05 });
      p.armA = CRADLE_A; p.armB = PHONE_B; p.headRoll = 0.12; p.headPitch = 0.1;
      p.mouth = t > 51.0 && t < 52.2 ? 'o' : 'smile';
    }
    return p;
  }
  // queue shuffle: everyone steps forward 0.62 m at the same moments (the line moves as one)
  const STEP_T = [34.4, 36.4, 38.9, 40.6], QSTEP = 0.2;   // 2.1 miles of line moving 20 cm at a time
  function shuffleSteps(t, lag) { let n = 0; for (const s of STEP_T) n += K(t, [[s + lag, 0], [s + lag + 0.75, 1]]); return n; }
  function shuffleSpeed(t, lag) { for (const s of STEP_T) if (t > s + lag && t < s + lag + 0.75) return 0.55; return 0; }

  function vendorPose(t) {
    const p = basePose(); p.eyes = blink(t, 5); p.belly = bellyAt(t);
    Object.assign(p, { x: S.cart[0] - 0.15, z: S.cart[1] - 0.7, y: SH, rotY: 0.55 });
    p.armB = mixArm(REST, A(-1.25, 0.08, -0.25, -0.3), K(t, [[12.9, 0], [13.4, 1], [15.4, 1], [15.9, 0.6]]));
    p.headYaw = K(t, [[16.0, 0], [16.4, 0.5]]);
    p.mouth = t > 16.2 ? 'o' : 'smile';
    hotdog.visible = t > 11.8 && t < 18;
    return p;
  }
  function doctorPose(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.belly = 1.25; p.glasses = true; p.visible = t >= 41.5 && t < 49.5;
    const run = K(t, [[44.6, 0], [46.0, 1]]);
    Object.assign(p, { x: -11.5, z: lerp(-2.6, -1.1, run), y: SH, rotY: 0, dist: 2.1 * run, speed: t > 44.6 && t < 46.0 ? 1.3 : 0 });
    const calm = K(t, [[45.9, 0], [46.2, 1], [46.8, 1], [47.05, 0]]), grab = K(t, [[47.0, 0], [47.3, 1]]);
    p.armA = mixArm(mixArm(REST, STOP_A, calm), BELLY_A, grab); p.armB = mixArm(mixArm(REST, STOP_B, calm), BELLY_B, grab);
    p.headPitch = K(t, [[46.9, 0.05], [47.2, 0.7], [47.9, 0.7], [48.2, 0.0]]);
    p.mouth = t > 47.2 ? 'o' : 'flat'; p.lean = -0.08 * grab;
    return p;
  }
  function neighborPose(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.belly = bellyAt(t); p.visible = t >= 25.5 && t < 33.5;
    const B = S.bench;
    const rock = (a) => K(t, [[a, 0], [a + 0.35, 1], [a + 0.7, 0]]);
    const r = Math.max(rock(27.2), rock(28.4), rock(29.6) * 1.2);
    const up = K(t, [[29.75, 0], [30.05, 0.45], [30.35, 0]]);  // third rock: gets halfway up… plops back down
    Object.assign(p, { x: B[0] + 0.5, z: B[1] - 0.02, y: -0.185 + up * 0.3, floor: SH, rotY: -0.1, footFwd: 0.42 * (1 - up * 0.6) });
    p.lean = -0.15 + r * 0.55; p.headPitch = 0.1 + r * 0.25;
    p.armA = A(-0.35, 0.3, -0.2, 0); p.armB = A(-0.35, 0.3, -0.2, 0);
    p.mouth = t > 30.2 ? 'flat' : 'flat';
    return p;
  }

  // extras: per-shot blocking. i = index, e = rig (seeded traits e.seed, e.seed2, e.seed3)
  function extraPose(i, e, t, shot) {
    const p = basePose(); p.eyes = blink(t, i + 7); p.belly = bellyAt(t) * (0.85 + 0.3 * e.seed3); p.y = SH;
    const v = (e.seed < 0.5 ? -1 : 1) * (0.75 + e.seed2 * 0.45);
    const lookDown = (t0) => K(t, [[t0, 0.05], [t0 + 0.3, 0.75], [8.4 + e.seed * 0.3, 0.75], [8.8 + e.seed * 0.3, 0.1]]);
    switch (shot.cam) {
      case 'street': {
        const lanes = [-2.5, -2.0, -1.5, -1.0, -0.55];   // back sidewalk, seen side-on (bellies pop in profile)
        const z = lanes[i % lanes.length] + (e.seed3 - 0.5) * 0.15;
        const d = walkDist(t, v, 6.7 + e.seed2 * 0.4, 0.45);
        const x = wrap(((i * 0.37 + e.seed * 0.3) % 1) * 12 - 26 + d, -26, -14);   // spread evenly; wraps off-frame
        Object.assign(p, { x, z, rotY: v > 0 ? PI / 2 : -PI / 2, dist: Math.abs(d), speed: t < 6.7 + e.seed2 * 0.4 ? Math.abs(v) : 0 });
        p.headPitch = lookDown(7.0 + e.seed * 0.15);
        p.headYaw = K(t, [[8.6, 0], [9.0, (e.seed - 0.5) * 1.6]]);
        p.mouth = t > 7.7 ? 'o' : 'smile';
        if (t > 7.8) { const k = K(t, [[7.8 + e.seed2 * 0.4, 0], [8.2 + e.seed2 * 0.4, 1]]); p.armA = mixArm(REST, BELLY_A, k); p.armB = mixArm(REST, BELLY_B, k); }
        break;
      }
      case 'gary': { // a few stunned people behind Gary
        const spots = [[0.9, -2.5, 0.5], [3.6, -2.4, -0.4], [1.3, -2.7, 0.2], [3.0, -2.75, -0.2]];
        if (i >= spots.length) { p.visible = false; break; }
        Object.assign(p, { x: spots[i][0], z: spots[i][1], rotY: spots[i][2] });
        p.headPitch = 0.7; p.mouth = 'o'; p.armA = BELLY_A; p.armB = BELLY_B;
        break;
      }
      case 'cart': { // background walkers behind the cart, one guy hunched over by the wall
        if (i < 3) {
          const d = walkDist(t, v * 0.8);
          Object.assign(p, { x: wrap(e.seed * 14 + d, 8.3, 14), z: -2.5, rotY: v > 0 ? PI / 2 : -PI / 2, dist: Math.abs(d), speed: Math.abs(v * 0.8) });
          if (i === 2) p.armB = MOUTH_B;
        } else if (i === 6) {
          Object.assign(p, { x: 9.3, z: -2.55, rotY: -0.3, lean: 0.55, headPitch: 0.5 }); p.armA = A(-0.6, 0.1, -0.1); p.armB = MOUTH_B;
        } else p.visible = false;
        break;
      }
      case 'market': { // watchers: every head tracks Gary, in perfect unison
        const spots = [[-2.2, -0.9], [-1.6, -2.3], [-2.9, -1.9], [-1.0, -0.25], [-0.55, -2.55], [2.6, -2.45], [3.4, -2.15], [1.95, -2.75], [4.1, -2.7], [4.6, -2.0]];
        if (i >= spots.length) { p.visible = false; break; }
        const g = garyPose(t);
        const [x, z] = spots[i];
        const base = faceToward(x, z, 0.6, -1.4);
        const look = faceToward(x, z, g.x, g.z);
        Object.assign(p, { x, z, rotY: lerpAngle(base, look, 0.55) });
        p.headYaw = clamp(((look - p.rotY + 3 * PI) % (2 * PI)) - PI, -1.1, 1.1);
        p.mouth = 'flat'; p.armA = BELLY_A; p.armB = i % 3 === 0 ? MOUTH_B : BELLY_B;
        break;
      }
      case 'bench': p.visible = false; break;
      case 'queue': { // the line: everyone hands-on-back, waddling forward in the same shuffle
        if (i >= 20) { p.visible = false; break; }
        const lag = (i % 3) * 0.04;
        const x = -4.55 + i * 0.62 - QSTEP * shuffleSteps(t, lag);
        Object.assign(p, { x, z: -1.55 + (e.seed - 0.5) * 0.18, rotY: -PI / 2, lean: -0.12, waddle: 1, dist: QSTEP * shuffleSteps(t, lag) + e.seed, speed: shuffleSpeed(t, lag) });
        p.armA = BACK_A; p.armB = BACK_B; p.headPitch = 0.0; p.mouth = 'flat';
        if (i === 0) { // the person at the door, knocking
          p.armB = A(-1.15, 0.2, -1.2, -0.3); p.armB.sx += 0.12 * Math.sin(t * 18) * (Math.sin(t * 2.1) > 0.3 ? 1 : 0); p.rotY = -PI / 2 - 0.9; p.x = -4.75; p.z = -2.25;
        }
        break;
      }
      case 'hosp': { // crowd waiting in front of the hospital — freezes, clutching bellies
        const spots = [[-14.4, -1.45, 0.35], [-13.8, -2.35, 0.25], [-12.75, -2.2, 0.1], [-10.25, -2.2, -0.1], [-9.3, -1.35, -0.3], [-8.7, -2.35, -0.35], [-15.2, -0.45, 0.5], [-9.75, -0.4, -0.4], [-15.6, -2.2, 0.55]];
        if (i >= spots.length) { p.visible = false; break; }
        const [x, z, r] = spots[i];
        Object.assign(p, { x, z, rotY: r });
        const grab = K(t, [[42.6 + e.seed * 0.12, 0], [42.9 + e.seed * 0.12, 1]]);
        p.armA = mixArm(REST, BELLY_A, grab); p.armB = mixArm(REST, i % 2 ? BACK_B : BELLY_B, grab);   // classic labor pose: one hand front, one on the back
        p.lean = -0.1 * grab; p.mouth = grab > 0.5 ? 'o' : 'flat';
        p.headYaw = K(t, [[45.0, 0], [45.4, faceToward(x, z, -11.5, -2.4) - r]]);
        break;
      }
      case 'crane': { // the whole street holding babies
        const cols = 10, row = Math.floor(i / cols), col = i % cols;
        const x = -8 + col * 1.5 + (e.seed - 0.5) * 0.6 + (row % 2) * 0.7, z = [-2.3, -0.9, 8.4][row] + (e.seed2 - 0.5) * 0.3;
        Object.assign(p, { x, z, rotY: z > 5 ? PI + (e.seed - 0.5) * 0.6 : (e.seed - 0.5) * 0.6 });
        if (Math.abs(x - 2.05) < 0.8 && row === 1) p.x += 1.6; // keep Gary's spot clear
        p.armA = CRADLE_A; p.armB = e.seed2 < 0.6 ? PHONE_B : REST; p.headRoll = (e.seed - 0.5) * 0.3; p.headPitch = 0.25;
        break;
      }
    }
    extraBabies[i].visible = shot.cam === 'crane' && p.visible !== false;
    return p;
  }

  // feet stand on the sidewalk (y=SH) unless the pose says otherwise; sitting poses set y below SH and keep floor=SH
  function floorFix(p) { if (p.floor === 0 && (p.z < 0 || p.z > 7)) p.floor = SH; return p; }

  // DEBUG: t >= 200 renders a pose lineup (stills only): 8 extras in the arm presets, front 3/4 view
  const LINEUP = [['REST', REST, REST], ['BELLY', BELLY_A, BELLY_B], ['BACK', BACK_A, BACK_B], ['MOUTH', REST, MOUTH_B], ['HUG', HUG_A, HUG_B], ['CRADLE+PHONE', CRADLE_A, PHONE_B], ['STOP', STOP_A, STOP_B], ['REACH', A(-0.95, 0.12, -0.12, 0.2), A(-0.95, 0.12, -0.12, -0.2)]];
  function lineup(t) {
    const yaw = t >= 210 ? 0.25 : 1.0;
    [gary, vendor, doctor, neighbor].forEach((r) => { r.root.visible = false; });
    extras.forEach((e, i) => {
      const p = basePose(); p.belly = 1.1; p.visible = i < LINEUP.length; p.x = i * 0.85; p.z = 3.0; p.rotY = yaw;
      if (i < LINEUP.length) { p.armA = LINEUP[i][1]; p.armB = LINEUP[i][2]; }
      applyPose(e, p); extraBabies[i].visible = i === 5;
    });
    garyBaby.visible = false; jar.visible = tub.visible = false;
    set.aimSun(3, 3, 8); set.setSeason('spring', 0);
    const k = (Math.floor(t) % 4) * 2; extras.forEach((e, i) => { e.root.visible = i >= k && i < k + 2; }); setCamera([k * 0.85 + 0.42, 1.2, 6.6], [k * 0.85 + 0.42, 0.95, 3.0], 40, 0, 0);
  }

  // ---------------------------------------------------------------- per-frame update
  function update(t) {
    const shot = shotAt(t);
    const center = { street: [-20, 2], gary: [2, -1.5], cart: [6.8, -1], market: [1, -1], bench: [10, -2], queue: [2, -1.6], hosp: [-11.5, -1.5], crane: [-1, 2] }[shot.cam];
    set.aimSun(center[0], center[1], shot.cam === 'queue' || shot.cam === 'crane' ? 22 : shot.cam === 'street' ? 12 : 8);
    set.setSeason(seasonAt(t), t, center);

    document.getElementById('ui').style.visibility = t >= 200 ? 'hidden' : '';
    if (t >= 200) return lineup(t);
    applyPose(gary, floorFix(garyPose(t)));
    gary.root.visible = shot.cam !== 'street';
    skinGreen(gary, 0xe9b48f, shot.cam === 'cart' ? K(t, [[14.1, 0], [14.7, 1], [17.9, 1]]) : 0);
    jar.visible = shot.cam === 'market'; tub.visible = jar.visible;
    set.cart.visible = set.trash.visible = set.bench.visible = shot.cam !== 'queue';   // keep the queue's long lens clean
    phone.g.visible = garyBaby.visible = shot.cam === 'crane';
    phone.screenMat.emissiveIntensity = 0.6;

    const vp = vendorPose(t); vp.visible = shot.cam === 'cart'; applyPose(vendor, floorFix(vp));
    applyPose(doctor, floorFix(doctorPose(t)));
    applyPose(neighbor, floorFix(neighborPose(t)));
    extras.forEach((e, i) => applyPose(e, floorFix(extraPose(i, e, t, shot))));

    // camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    let e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    if (c.ease === 'crane') e = K(t, [[50.4, 0], [57.6, 1]]);
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
  }
  return { update };
}
