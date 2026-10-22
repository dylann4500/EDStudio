// VIDEO 004 — "What if every human disappeared except you?"
// 70.6 s, one set (engine/sets/city.js). Text/HUD timing lives in story.json; this file is 3D only.
//
// Shot list (seconds)                          | what happens
//  0.0– 9.6  street   8:14 PM rush hour          | crowd, cars, lit city; you on your phone. 6.45 = blink: everyone gone
//  9.6–16.4  call     over your shoulder         | "Mom · calling…" on your screen; dropped phones glowing on the sidewalk
// 16.4–23.6  day1     day one, middle of the road | you walk past driverless cars; the signal turns green for nobody
// 23.6–31.0  black    day two, from above         | the city goes dark block by block, far → near; you stand in the street
// 31.0–39.0  roof     week three                  | you sit on the roof; the Milky Way over a dark city
// 39.0–47.0  signal   4-season montage            | every night at 8:14 you shine a flashlight at the city
// 47.0–53.4  wild     year four, golden hour      | same framing as day one: trees in the road, rusted cars
// 53.4–59.2  signal2  night 1,461                 | you shine the light… a far window blinks back 3×, then stays on (HUD 1 → 2)
// 59.2–61.2  tele     long lens                   | that one lit window in the dark tower
// 61.2–64.2  face     close-up                    | tear + smile
// 64.2–70.6  final    wide                        | your beam + their light across the dark city; fade, end card
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, KV, clamp, lerp, lerpAngle, walkLegs, faceToward, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, handWorld, blink } from '@engine/rig.js';
import { makePhone, makeFlashlight } from '@engine/props.js';
import { buildCity, makeCar, DIMS, ROOF_Y } from '@engine/sets/city.js';

const PI = Math.PI;
const BLINK = 6.45;
const T = { call: 9.6, day1: 16.4, black: 23.6, roof: 31.0, mont: 39.0, wild: 47.0, sig: 53.4, tele: 59.2, face: 61.2, fin: 64.2, end: 70.6 };
const ME = [5.3, 4.2];                 // where you stand on the sidewalk
const SEAT = [-9.6, 10.6];             // the crate on the roof
const EDGE = [-10.4, 8.75];            // where you stand at the roof's downtown-side parapet
const WIN = new THREE.Vector3(...DIMS.answer.win);
const REPLY = [[57.0, 57.25], [57.55, 57.8], [58.1, 1e9]]; // far light: blink, blink, then it stays on

export const SHOTS = [
  { t0: 0, t1: T.call, cam: 'street' },
  { t0: T.call, t1: T.day1, cam: 'call' },
  { t0: T.day1, t1: T.black, cam: 'day1' },
  { t0: T.black, t1: T.roof, cam: 'black' },
  { t0: T.roof, t1: T.mont, cam: 'roof' },
  { t0: T.mont, t1: T.wild, cam: 'signal' },
  { t0: T.wild, t1: T.sig, cam: 'wild' },
  { t0: T.sig, t1: T.tele, cam: 'signal2' },
  { t0: T.tele, t1: T.face, cam: 'tele' },
  { t0: T.face, t1: T.fin, cam: 'face' },
  { t0: T.fin, t1: T.end, cam: 'final' },
];
// p = camera position start→end, a = look-at start→end (or keys: [[t, pos, target, fov]]), fov, amp = handheld drift
export const CAMS = {
  street:  { p: [[4.8, 1.75, 12.2], [4.85, 1.7, 10.0]], a: [[5.0, 1.2, -6], [5.1, 1.25, -6]], fov: 50, amp: 0.006 },
  call:    { keys: [[9.6, [5.0, 1.84, 3.25], [5.3, 1.1, 5.0], 38], [12.4, [4.98, 1.82, 3.35], [5.3, 1.1, 5.0], 38], [14.6, [4.75, 1.5, 3.0], [5.6, 0.35, 8.2], 46], [16.4, [4.7, 1.45, 3.1], [5.7, 0.3, 8.6], 46]], amp: 0.004 },
  day1:    { p: [[-1.1, 1.3, 15.5], [-1.0, 1.3, 12.5]], a: [[1.2, 2.2, -30], [1.2, 2.2, -30]], fov: 52, amp: 0.006 },
  wild:    { p: [[-1.1, 1.3, 15.5], [-1.0, 1.3, 12.5]], a: [[1.2, 2.2, -30], [1.2, 2.2, -30]], fov: 52, amp: 0.006 },
  black:   { p: [[1.6, 10.8, 36], [1.3, 10.4, 32.5]], a: [[0, 6.5, -80], [0, 6.2, -80]], fov: 52, amp: 0.004 },
  roof:    { p: [[-9.25, ROOF_Y + 1.2, 12.5], [-9.3, ROOF_Y + 1.1, 12.3]], a: [[-9.8, ROOF_Y + 1.0, -10], [-10.3, ROOF_Y + 13.5, -12]], fov: 64, amp: 0.003 },
  // behind-right of you (4 m back, 1 m right): you lower-left, the answer tower just right of center, your beam between
  signal:  { p: [[-10.2, ROOF_Y + 2.3, 13.2], [-10.25, ROOF_Y + 2.25, 12.7]], a: [[-5.0, ROOF_Y + 1.8, -37], [-5.0, ROOF_Y + 2.0, -37]], fov: 50, amp: 0.004 },
  signal2: { p: [[-10.2, ROOF_Y + 2.3, 13.4], [-10.3, ROOF_Y + 2.15, 12.3]], a: [[-5.0, ROOF_Y + 1.8, -37], [-4.6, ROOF_Y + 2.4, -37]], fov: 50, amp: 0.004 },
  tele:    { p: [[-10.0, ROOF_Y + 1.9, 9.6], [-10.0, ROOF_Y + 1.9, 9.6]], a: [[WIN.x, WIN.y + 0.6, WIN.z], [WIN.x, WIN.y + 0.3, WIN.z]], fov: 6.5, amp: 0.0 },
  face:    { p: [[-10.05, ROOF_Y + 1.5, 8.05], [-10.08, ROOF_Y + 1.5, 8.12]], a: [[-10.45, ROOF_Y + 1.48, 8.95], [-10.45, ROOF_Y + 1.48, 8.95]], fov: 40, amp: 0.002 },
  final:   { p: [[-9.0, ROOF_Y + 4.2, 16.8], [-9.3, ROOF_Y + 5.2, 18.6]], a: [[-3.6, ROOF_Y + 1.5, -36], [-3.4, ROOF_Y + 2.2, -36]], fov: 54, amp: 0.003 },
};

const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const montSeg = (t) => clamp(Math.floor((t - T.mont) / 2), 0, 3);
const onRoof = (t) => t >= T.roof && !(t >= T.wild && t < T.sig);
const replyLight = (t) => (REPLY.some(([a, b]) => t >= a && t < b) ? 1 : 0);

// ---------------------------------------------------------------- the crowd (rush hour, 0 → BLINK)
const SKINS = [0xf1c7a5, 0xe2ad8c, 0xc98e6a, 0x9c6a4a, 0x7a4e33, 0xf3d1b8, 0xd9a07a];
const TOPS = [0x3d4a5c, 0x7a3b3b, 0x4f6b5a, 0x2e2e33, 0x8a6f5a, 0x5b4f7a, 0xa65d48, 0x3f5f7a, 0x6b6b70, 0x9a8a6f, 0xb8b2a6];
const PANTS = [0x2a2f3a, 0x3a3530, 0x23262d, 0x4a4f5a, 0x5c4a3a];
const HAIRS = [0x2b1d15, 0x4a3020, 0x1a1412, 0x8a6a4a, 0xc9c4be, 0x5a3a28];
const STYLES = ['short', 'bob', 'messy', 'short', 'bob', 'short'];
// [x, z, rotY, phone?] standing; walkers: {from, to, t0, t1}
const CROWD = [
  { at: [4.55, -0.9], rot: -PI / 2, phone: true }, { at: [5.2, -1.4], rot: -PI / 2 }, { at: [5.9, -0.7], rot: -PI / 2 + 0.3, phone: true },
  { at: [6.4, 0.6], rot: -PI / 2 - 0.4 }, { at: [6.35, 3.3], rot: PI / 2, phone: false }, { at: [4.45, 6.6], rot: PI, phone: true },
  { walk: { from: [6.3, -1.0], to: [6.3, 9.5], t0: 0.0, t1: 9.0 } },
  { walk: { from: [4.4, 7.0], to: [4.4, 1.0], t0: 0.0, t1: 6.6 }, phone: true },
  { walk: { from: [6.6, 9.0], to: [6.6, 2.0], t0: 0.3, t1: 7.6 } },
  { at: [6.45, 7.4], rot: PI / 2 + 0.5, phone: true }, { at: [6.6, 6.5], rot: -0.4 },
  { walk: { from: [-4.6, 9], to: [-4.6, -1.2], t0: 0, t1: 8 } }, { at: [-6.5, 3.2], rot: PI / 2 }, { at: [-5.0, -1.5], rot: PI / 2 },
  { walk: { from: [5.6, -11.4], to: [12, -11.4], t0: 0, t1: 7 } }, { at: [4.9, -12.2], rot: 0.2, phone: true },
  { walk: { from: [4.6, -0.4], to: [-4.6, -0.4], t0: 1.4, t1: 9.4 } },
  { walk: { from: [-4.5, 0.2], to: [4.5, 0.2], t0: 0.6, t1: 8.6 }, phone: true },
  { walk: { from: [-3.0, -1.1], to: [4.6, -1.1], t0: 0.0, t1: 7.0 } },
  { at: [-4.8, 1.2], rot: PI / 2 }, { at: [-5.6, 0.4], rot: PI / 2, phone: true }, { at: [-6.3, 6.5], rot: PI / 2 + 0.5 },
  { walk: { from: [-5.3, 14], to: [-5.3, -1.5], t0: 0.0, t1: 11 } },
  { walk: { from: [-6.2, -1.5], to: [-6.2, 12], t0: 0.0, t1: 10 } },
  { at: [5.6, -11.8], rot: 0 }, { at: [7.6, -11.6], rot: -PI / 2 }, { walk: { from: [14, -11.6], to: [4.8, -11.6], t0: 0, t1: 8 } },
  { at: [-5.8, -12.0], rot: 0.3, phone: true }, { walk: { from: [-12, -0.8], to: [-5.5, -0.8], t0: 0, t1: 6 } },
];

function crowdPose(c, i, t) {
  const p = basePose();
  p.eyes = blink(t, i + 2);
  p.smile = i % 3 === 0 ? 1 : 0;
  if (c.walk) {
    const w = walkLegs(t, c.walk.from, [{ t0: c.walk.t0, t1: c.walk.t1, pts: [c.walk.to] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: w.head ?? faceToward(...c.walk.from, ...c.walk.to) });
  } else Object.assign(p, { x: c.at[0], z: c.at[1], rotY: c.rot, headYaw: 0.25 * Math.sin(t * 0.5 + i) });
  if (c.phone) { p.armA = { sx: -0.75, sz: 0.05, el: -1.25, twist: 0.2, free: 0 }; p.headPitch = 0.42; }
  return p;
}

// ---------------------------------------------------------------- you
function youPose(t) {
  const p = basePose();
  p.eyes = blink(t, 0); p.smile = 0;
  const phoneArm = (sx, el) => ({ sx, sz: 0.06, el, twist: 0.25, free: 0 });
  if (t < T.call) { // on your phone → blink → look up, look around
    Object.assign(p, { x: ME[0], z: ME[1], rotY: 0.08 });
    p.armA = phoneArm(K(t, [[6.5, -0.75], [7.0, -0.45]]), K(t, [[6.5, -1.3], [7.0, -1.0]]));
    p.headPitch = K(t, [[6.5, 0.45], [6.95, -0.06]]);
    p.headYaw = K(t, [[7.3, 0], [7.9, 0.75], [8.4, 0.75], [9.0, -0.7], [9.6, -0.7]]);
    p.rotY = K(t, [[7.4, 0.08], [8.0, 0.35], [8.6, 0.35], [9.3, -0.2]]);
    p.smile = t < BLINK ? 1 : 0;
  } else if (t < T.day1) { // the call
    Object.assign(p, { x: ME[0], z: ME[1], rotY: -0.05 });
    p.armA = phoneArm(K(t, [[9.6, -0.6], [10.2, -1.0], [14.2, -1.0], [14.9, -0.35]]), K(t, [[9.6, -1.1], [10.2, -1.62], [14.2, -1.62], [14.9, -0.9]]));
    p.headPitch = K(t, [[9.6, 0.3], [10.2, 0.34], [14.2, 0.34], [14.9, 0.1]]);
    p.headYaw = K(t, [[14.6, 0], [15.6, 0.3]]);
  } else if (t < T.black) { // day one: walk down the middle of the road
    const w = walkLegs(t, [0.55, 10.5], [{ t0: 16.4, t1: 23.6, pts: [[0.55, 2.0]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: PI });
    p.headYaw = K(t, [[17, 0], [18.2, -0.5], [19.4, -0.5], [20.3, 0.1]]); p.headPitch = K(t, [[19.6, 0.05], [20.3, -0.18]]);
    p.speed = Math.min(w.speed, 0.8);
  } else if (t < T.roof) { // day two: standing in the street, watching the city go dark
    Object.assign(p, { x: 0.45, z: 6.0, rotY: PI - 0.08, headPitch: K(t, [[23.6, -0.1], [30, -0.3]]), headYaw: 0.15 * Math.sin(t * 0.4) });
    p.armA = { sx: 0.03, sz: 0.1, el: -0.2, free: 0 }; p.armB = { sx: 0.03, sz: 0.1, el: -0.2, free: 0 };
  } else if (t < T.mont) { // week three: sitting on the crate, looking up
    Object.assign(p, { x: SEAT[0], z: SEAT[1] - 0.12, rotY: PI, y: -0.42, footFwd: 0.45, lean: -0.06 });
    p.headPitch = K(t, [[31, -0.15], [34.5, -0.62]]);
    p.armA = { sx: -0.35, sz: 0.25, el: -0.5, free: 0 }; p.armB = { sx: -0.35, sz: 0.25, el: -0.5, free: 0 };
  } else if (t < T.wild || t >= T.sig) { // the ritual at the parapet (montage, night 1,461, reply, face, final)
    const rot = faceToward(EDGE[0], EDGE[1], WIN.x, WIN.z) + (t < T.wild ? 0.25 * Math.sin((t - T.mont) * 0.55 + montSeg(t)) - 0.15 : 0);
    Object.assign(p, { x: EDGE[0], z: EDGE[1], rotY: rot });
    let raise = 1;
    if (t >= T.sig) raise = K(t, [[56.4, 1], [56.9, 0.55], [57.0, 0.55], [57.5, 1]]);
    if (t >= T.face && t < T.fin) raise = K(t, [[62.2, 1], [62.9, 0.25]]);
    p.armA = { sx: lerp(0.0, -1.42, raise), sz: 0.08, el: lerp(-0.2, -0.12, raise), twist: 0.0, free: 0 };
    p.headPitch = t >= T.sig ? K(t, [[56.4, -0.12], [56.9, 0.08], [57.1, 0.08], [57.4, -0.14]]) : -0.08;
    p.smile = t >= 61.9 ? 1 : 0;
    p.tear = t >= T.face && t < T.end;
    p.headRoll = t >= T.face ? K(t, [[61.2, 0], [62.6, 0.1]]) : 0;
  } else { // year four: same walk as day one, older, with a backpack
    const w = walkLegs(t, [0.55, 10.5], [{ t0: 47.0, t1: 53.4, pts: [[0.55, 3.0]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: Math.min(w.speed, 0.8), rotY: PI, headPitch: 0.06 });
    p.headYaw = K(t, [[48, 0], [49.2, 0.4], [50.6, 0.4], [51.4, -0.1]]);
  }
  return p;
}

// ---------------------------------------------------------------- cars (state at time t)
const CARS = [
  { col: 0xc9503f, x: 2, z: 4.0, rot: PI },             // waiting at the red light (taillights toward the camera)
  { col: 0x3f6fa5, x: 2, z: 9.5, rot: PI, creep: true },  // creeps forward after the blink and bumps the car ahead
  { col: 0xe6dccb, x: 2, z: 15.2, rot: PI },
  { col: 0x2f3338, x: 2, z: 21.0, rot: PI },
  { col: 0xd9a443, x: -2, z: -15.5, rot: 0 },           // waiting on the far side (headlights toward the camera)
  { col: 0x6b8a6e, x: -2, z: -21.2, rot: 0 },
  { col: 0x8c3a4a, x: -2, z: -27.0, rot: 0 },
  { col: 0x4a7d8c, cross: { z: -4.0, x0: -40, v: 6.0, dir: 1 } },   // crossing the intersection when everyone vanishes
  { col: 0xe1e1e1, cross: { z: -8.0, x0: 45, v: 6.5, dir: -1 } },
];
function carAt(c, t) {
  if (c.cross) {
    const { z, x0, v, dir } = c.cross, tc = Math.min(t, BLINK), coast = Math.max(0, t - BLINK), tau = 1.1;
    const x = x0 + dir * v * (tc + tau * (1 - Math.exp(-coast / tau)));
    const drift = 1 - Math.exp(-coast / tau);
    return { x, z: z + dir * 0.9 * drift, rot: dir * PI / 2 - dir * 0.28 * drift, moving: coast < 3 * tau };
  }
  let z = c.z;
  if (c.creep) z = K(t, [[6.9, c.z], [8.6, 7.98]]);
  return { x: c.x, z, rot: c.rot + (c.creep ? K(t, [[6.9, 0], [8.6, 0.05]]) : 0) };
}

// ---------------------------------------------------------------- build + per-frame update
export async function build(studio, story) {
  const { scene, setCamera, camera } = studio;
  camera.far = 1500;
  const set = buildCity(studio, {});

  // you
  const carrier = new THREE.Group(); scene.add(carrier);
  const you = makePerson({ skin: 0xe6b08c, top: 0xe0a83a, collar: 0xf3e9dc, pants: 0x2f3a4f, shoes: 0x4a3a30, hair: 0x2b1d15, hairStyle: 'messy' });
  carrier.add(you.root);
  you.head.tear.children.forEach((o) => { if (o.geometry.type === 'SphereGeometry') o.visible = false; });
  const pack = new THREE.Group(); you.spine.add(pack);
  mk(new RoundedBoxGeometry(0.34, 0.42, 0.18, 2, 0.06), mat(0x4f6b5a, 0.85), pack, 0, 0.3, -0.24);
  mk(new RoundedBoxGeometry(0.26, 0.16, 0.06, 2, 0.03), mat(0x435a4c, 0.85), pack, 0, 0.18, -0.34);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.04, 0.4, 0.04), mat(0x2f3a33, 0.8), pack, s * 0.1, 0.32, -0.08);

  // the crowd
  const crowd = CROWD.map((c, i) => {
    const r = makePerson({ skin: SKINS[i % SKINS.length], top: TOPS[(i * 7) % TOPS.length], pants: PANTS[(i * 3) % PANTS.length], hair: HAIRS[(i * 5) % HAIRS.length], hairStyle: STYLES[i % STYLES.length], glasses: i % 5 === 2 });
    scene.add(r.root); return r;
  });
  const crowdPhones = CROWD.map((c) => { if (!c.phone) return null; const ph = makePhone(); scene.add(ph.g); return ph; });

  // what they leave behind: phones on the ground (screens lit: everyone is being called), a coffee, a bag
  const handAt = (r, c, i, tt) => { applyPose(r, crowdPose(c, i, tt)); return handWorld(r, -1); };
  const dropped = [];
  CROWD.forEach((c, i) => {
    const pos = handAt(crowd[i], c, i, BLINK);
    if (c.phone || i % 3 === 0) {
      const ph = makePhone(); ph.g.position.set(pos.x, (Math.abs(pos.x) > 4 ? DIMS.curb : 0) + 0.001, pos.z); ph.g.rotation.y = i * 1.9; scene.add(ph.g);
      dropped.push({ ph, i });
    }
  });
  const props = new THREE.Group(); scene.add(props);
  const cup = new THREE.Group(); props.add(cup);
  mk(new THREE.CylinderGeometry(0.045, 0.035, 0.13, 14), mat(0xf2ede4, 0.6), cup, 0, 0, 0);
  mk(new THREE.CylinderGeometry(0.047, 0.047, 0.02, 14), mat(0x3a2e2a, 0.5), cup, 0, 0.07, 0);
  cup.position.set(6.1, DIMS.curb + 0.045, 6.6); cup.rotation.set(0, 0.6, PI / 2);
  const bag = mk(new RoundedBoxGeometry(0.34, 0.4, 0.16, 2, 0.02), mat(0xc9a77a, 0.9), props, 6.4, DIMS.curb + 0.08, 2.9); bag.rotation.set(PI / 2 - 0.1, 0, 0.4);

  // your phone (screen faces you), and the flashlight
  const scr = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d2a44'); gr.addColorStop(1, '#0b1020'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c46b7b'; g.beginPath(); g.arc(w / 2, h * 0.27, 52, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '600 64px sans-serif'; g.fillText('M', w / 2, h * 0.27 + 23);
    g.font = '600 50px sans-serif'; g.fillText('Mom', w / 2, h * 0.46);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '400 28px sans-serif'; g.fillText('calling…', w / 2, h * 0.53);
    g.fillStyle = '#e04848'; g.beginPath(); g.arc(w / 2, h * 0.84, 34, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2 - 15, h * 0.84 + 4); g.lineTo(w / 2 + 15, h * 0.84 + 4); g.stroke();
  });
  const myPhone = new THREE.Group(); scene.add(myPhone);
  mk(new RoundedBoxGeometry(0.078, 0.155, 0.01, 2, 0.006), mat(0x1c1c22, 0.35), myPhone, 0, 0, -0.005);
  const myScreenM = new THREE.MeshBasicMaterial({ map: scr, toneMapped: false, color: 0xffffff });
  const myScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.145), myScreenM); myScreen.position.z = 0.0012; myPhone.add(myScreen);
  const phoneGlow = new THREE.PointLight(0x9ec5ff, 0, 1.2, 2); scene.add(phoneGlow);
  const torch = makeFlashlight({ length: 150, radius: 6 }); scene.add(torch.g);
  const reply = makeFlashlight({ length: 150, radius: 5, color: 0xffd9a0 }); scene.add(reply.g);
  reply.g.children.forEach((o) => { if (o !== reply.beam) o.visible = false; });

  // cars
  const cars = CARS.map((c, i) => { const car = makeCar(c.col, i + 1); scene.add(car.g); return car; });

  const head = new THREE.Vector3(), aimT = new THREE.Vector3();
  function update(t) {
    const shot = shotAt(t), roof = onRoof(t);

    // ---- time of day / power / growth / weather
    let day = 0, golden = 0, power = 1, milkyWay = 0, moon = 1, growth = 0, snow = 0, season = 'none';
    if (t >= T.day1 && t < T.black) day = 1;
    if (t >= T.black) power = K(t, [[24.6, 1], [30.2, 0]], (u) => u);
    if (t >= T.roof) { power = 0; moon = 0; milkyWay = 1; }
    if (t >= T.mont && t < T.wild) { const s = montSeg(t); season = ['autumn', 'winter', 'rain', 'summer'][s]; milkyWay = [0.55, 0.2, 0, 0.85][s]; snow = s === 1 ? 1 : 0; }
    if (t >= T.wild && t < T.sig) { day = 1; golden = 1; growth = 1; }
    if (t >= T.sig) milkyWay = 0.85;
    const focus = roof ? [-11, 11, 14] : shot.cam === 'black' ? [0, -6, 55] : shot.cam === 'day1' || shot.cam === 'wild' ? [1, 4, 26] : [4.5, 3, 16];
    set.setShadowFocus(focus[0], focus[1], focus[2]);
    set.setTime({ day, golden, milky: milkyWay, moon, power });
    set.setGrowth(growth); set.setSnow(snow);
    set.setWeather(t, roof && season !== 'autumn' ? season : 'none');
    set.setSignal(t < T.day1 ? 'red' : t < T.black ? (t < 20.05 ? 'red' : 'green') : t < T.roof ? 'green' : 'off', t < T.black ? 1 : clamp(power / 0.03));
    set.setAnswer(t >= T.sig ? replyLight(t) : 0, shot.cam === 'tele' ? 2.2 : 9);
    set.sky.moonDisc.visible = set.sky.moonDisc.visible && !roof;

    // ---- cars (lights on until the first night ends; rust in year four)
    cars.forEach((car, i) => {
      const s = carAt(CARS[i], t);
      car.g.position.set(s.x, 0, s.z); car.g.rotation.y = s.rot;
      car.g.visible = !roof;
      car.setLights(t < T.day1 ? 1 : 0, t < T.day1 ? 1 : 0);
      car.setRust(t >= T.wild && t < T.sig ? 1 : 0);
    });

    // ---- the crowd: there until the blink
    crowd.forEach((r, i) => {
      if (t >= BLINK) { r.root.visible = false; if (crowdPhones[i]) crowdPhones[i].g.visible = false; return; }
      const p = crowdPose(CROWD[i], i, t); applyPose(r, p);
      if (crowdPhones[i]) { const h = handWorld(r, -1); const ph = crowdPhones[i]; ph.g.visible = true; ph.g.position.set(h.x, h.y + 0.02, h.z); ph.g.rotation.set(-0.9, p.rotY + PI, 0); ph.screenMat.emissiveIntensity = 1.2; }
    });
    const ring = t >= BLINK && t < T.day1;
    dropped.forEach(({ ph, i }) => { ph.g.visible = ring; ph.screenMat.emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 5 + i); });
    props.visible = t >= BLINK && t < T.black;

    // ---- you
    carrier.position.y = roof ? ROOF_Y : 0; carrier.updateMatrixWorld(true);
    const pose = youPose(t); applyPose(you, pose);
    pack.visible = t >= T.wild;
    you.mats.hair.color.setHex(t >= T.wild ? 0x3a2a1f : 0x2b1d15);
    const hA = handWorld(you, -1);
    const phoneOn = t < T.day1;
    myPhone.visible = phoneOn;
    if (phoneOn) {
      you.head.g.getWorldPosition(head);
      myPhone.position.set(hA.x, hA.y + 0.07, hA.z); myPhone.lookAt(head);
      myScreenM.color.setScalar(t < T.call ? 0.55 : 1.0);
      phoneGlow.position.copy(myPhone.position).add(new THREE.Vector3(0, 0.1, 0)); phoneGlow.intensity = 0.25;
    } else phoneGlow.intensity = 0;

    // ---- flashlight + the reply beam
    const torchOn = (t >= T.mont && t < T.wild) || t >= T.sig;
    torch.g.visible = torchOn;
    if (torchOn) {
      if (t < T.wild) aimT.set(WIN.x - 28 + 18 * Math.sin((t - T.mont) * 0.5 + montSeg(t) * 1.7), 34 + 6 * montSeg(t), WIN.z);
      else aimT.set(lerp(6, WIN.x, clamp((t - 57.4) / 1.2)), lerp(30, WIN.y, clamp((t - 57.4) / 1.2)), WIN.z);
      torch.aim(hA, aimT);
      const k = t >= T.fin ? K(t, [[T.fin, 0], [T.fin + 0.6, 1]]) : t >= T.face ? K(t, [[62.2, 1], [62.9, 0]]) : 1;
      torch.setOn(k, 0.42);
    }
    const rv = t >= T.sig ? replyLight(t) * (t >= T.fin ? 1 : 0.6) : 0;
    reply.g.visible = rv > 0;
    if (rv > 0) { reply.aim(WIN.clone().add(new THREE.Vector3(0, 0, 0.6)), hA); reply.setOn(rv, 0.2); }

    // ---- camera
    const c = CAMS[shot.cam];
    if (c.keys) {
      const pos = KV(t, c.keys.map((k) => [k[0], k[1]])), tgt = KV(t, c.keys.map((k) => [k[0], k[2]])), fov = K(t, c.keys.map((k) => [k[0], k[3]]));
      setCamera(pos, tgt, fov, t, c.amp);
    } else {
      const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
    }
  }
  return { update };
}
