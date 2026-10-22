// VIDEO 006 — "What if everyone on Earth lost their memory at the same time?"  (tone: WHATIF — doomer ripple ladder)
// 70.2 s, six sets, one collapse per beat. HUD = PEOPLE WHO REMEMBER THE WORLD BEFORE: 8.2 B → 0 at 9:00 AM, and it never comes
// back; the HUD's second line carries the escalating stat (planes in the air, warheads, reactors, cities with power…).
// User steer (v2): "too tame — make it catastrophic, a heavier doomer perspective: world leaders, things collapsing".
//
// Shot list (seconds)                       | set     | stamp       | what happens
//  0.0– 9.4  street   rush hour → freeze     | street  | SECOND 0    | the crowd walks; at 7.0 every person stops at once
//  9.4–15.2  crash    the intersection       | city    | +10 SEC     | cars run the red light: T-bone, a side hit, a rear-end
// 15.2–21.4  planes   the night sky          | city    | +5 MIN      | plane lights circle over the skyline; one comes down → glow
// 21.4–28.0  war      the war room           | war     | +1 HOUR     | world leaders around the globe who don't know who they are
// 28.0–31.2  capBack  launch capsule         | capsule | +3 HOURS    | two officers, a red console; one reaches for the key
// 31.2–34.2  capFace  her face               | capsule |             | she looks at him; neither knows what it does
// 34.2–40.4  plant    cooling towers         | plant   | +1 DAY      | dusk → night, a red warning beacon on the reactor
// 40.4–46.6  dark     the city               | city    | +3 DAYS     | the grid fails block by block
// 46.6–52.8  border   the border post        | border  | +2 WEEKS    | tanks roll toward the line; the guard backs away
// 52.8–58.4  market   an empty market        | street  | +1 MONTH    | a crowd presses against the market doors
// 58.4–70.2  ruin     the same intersection  | city    | +1 YEAR     | overgrown, the crashed cars rusted where they stopped
import * as THREE from 'three';
import { K, clamp, lerp, faceToward, rng, mat, mk, smooth, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildStreet, DIMS as SD, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, makeCar, ROOF_Y } from '@engine/sets/city.js';
import { buildWarRoom, buildCapsule, DIMS as WD } from '@engine/sets/warroom.js';
import { buildBorder, buildPlant } from '@engine/sets/military.js';

const PI = Math.PI;
const FREEZE = 7.0;
const CAP = WD.CAP;
const C = (x, y, z) => [CAP[0] + x, CAP[1] + y, CAP[2] + z];
const RY = ROOF_Y;

export const SHOTS = [
  { t0: 0, t1: 9.4, cam: 'street', set: 'street' },
  { t0: 9.4, t1: 15.2, cam: 'crash', set: 'city' },
  { t0: 15.2, t1: 21.4, cam: 'planes', set: 'city' },
  { t0: 21.4, t1: 28.0, cam: 'war', set: 'war' },
  { t0: 28.0, t1: 31.2, cam: 'capBack', set: 'cap' },
  { t0: 31.2, t1: 34.2, cam: 'capFace', set: 'cap' },
  { t0: 34.2, t1: 40.4, cam: 'plant', set: 'plant' },
  { t0: 40.4, t1: 46.6, cam: 'dark', set: 'city' },
  { t0: 46.6, t1: 52.8, cam: 'border', set: 'border' },
  { t0: 52.8, t1: 58.4, cam: 'market', set: 'street' },
  { t0: 58.4, t1: 70.2, cam: 'ruin', set: 'city' },
];
// p = camera position start→end, a = look-at start→end, fov (deg), amp = handheld drift
export const CAMS = {
  street:  { p: [[-10.4, 1.62, -2.15], [-11.1, 1.6, -2.15]], a: [[-40, 1.15, -1.3], [-40, 1.15, -1.3]], fov: 40, amp: 0.006 },
  crash:   { p: [[6.0, 2.7, 6.2], [5.8, 2.6, 5.4]], a: [[0.3, 0.6, -6.6], [0.3, 0.6, -6.6]], fov: 46, amp: 0.006 },
  planes:  { p: [[-10.6, RY + 1.65, 12.8], [-10.5, RY + 1.6, 12.3]], a: [[-4, RY + 26, -70], [-4, RY + 27, -70]], fov: 58, amp: 0.003 },
  war:     { p: [[0.0, 1.8, 2.55], [0.0, 1.86, 2.9]], a: [[0, 1.62, -0.8], [0, 1.62, -0.8]], fov: 58, amp: 0.003 },
  capBack: { p: [C(0.25, 1.62, 1.55), C(0.18, 1.58, 1.3)], a: [C(0, 1.1, -1.8), C(0, 1.1, -1.8)], fov: 62, amp: 0.003 },
  capFace: { p: [C(0.95, 1.38, -1.35), C(0.9, 1.36, -1.3)], a: [C(-0.42, 1.22, -0.6), C(-0.42, 1.22, -0.6)], fov: 50, amp: 0.003 },
  plant:   { p: [[-42, 3.0, 84], [-40, 3.4, 78]], a: [[2, 24, -10], [2, 25, -10]], fov: 50, amp: 0.003 },
  dark:    { p: [[1.6, 10.8, 36], [1.3, 10.4, 32.5]], a: [[0, 6.5, -80], [0, 6.2, -80]], fov: 52, amp: 0.004 },
  border:  { p: [[-1.0, 1.78, 7.6], [-0.95, 1.74, 6.9]], a: [[-1.6, 1.3, -60], [-1.6, 1.6, -60]], fov: 28, amp: 0.004 },
  market:  { p: [[4.4, 1.5, 3.8], [4.2, 1.48, 3.3]], a: [[1.3, 1.05, -2.6], [1.3, 1.05, -2.6]], fov: 48, amp: 0.005 },
  ruin:    { p: [[-1.1, 1.3, 15.5], [-1.0, 1.35, 11.5]], a: [[1.2, 1.6, -30], [1.2, 1.6, -30]], fov: 52, amp: 0.005 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
const arm = (sx, sz, el, free = 0, twist = 0) => ({ sx, sz, el, free, twist });
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), free: lerp(a.free ?? 0, b.free ?? 0, k), twist: lerp(a.twist ?? 0, b.twist ?? 0, k) });
const HAND_UP = arm(-0.75, 0.05, -1.55, 0, 0.5);          // palm up in front of the face: "whose hand is this?"
const HANDS_HEAD = arm(-2.5, 0.35, -2.1, 0, 0);           // hands on head

// ---------------------------------------------------------------- the 9:00 AM freeze (street)
const TAU = 0.18;
const sOf = (t) => (t < FREEZE ? t : FREEZE + TAU * (1 - Math.exp(-(t - FREEZE) / TAU)));
const sDot = (t) => (t < FREEZE ? 1 : Math.exp(-(t - FREEZE) / TAU));
const R0 = rng(606);
const WALKERS = [];
for (let i = 0; i < 22; i++) {
  const dir = i % 2 ? 1 : -1, v = 1.0 + R0() * 0.35, z = -0.45 - R0() * 2.2;
  const x0 = dir < 0 ? -13.5 - R0() * 13 : -45 + R0() * 12;
  WALKERS.push({ x0, z, dir, v, look: R0(), hands: R0() < 0.35 });
}
function walkerPose(w, i, t) {
  const p = basePose();
  p.eyes = blink(t, i + 3); p.floor = SH; p.smile = 0;
  const s = sOf(t);
  Object.assign(p, { x: w.x0 + w.dir * w.v * s, z: w.z, dist: w.v * s, speed: w.v * sDot(t), rotY: w.dir > 0 ? PI / 2 : -PI / 2 });
  if (t > FREEZE) {
    const k = K(t, [[FREEZE + 0.3, 0], [FREEZE + 1.2, 1]]);
    p.headYaw = k * 0.75 * Math.sin((t - FREEZE) * (0.7 + w.look * 0.6) + i);
    p.headPitch = k * (w.hands ? 0.5 : -0.05);
    if (w.hands) p.armA = mixArm(arm(0.03, 0.07, -0.25, 1), HAND_UP, k);
  }
  return p;
}

// ---------------------------------------------------------------- the crash (+10 s)
const TC = 11.6, TC2 = 13.2, TC3 = 12.6;          // T-bone, rear-end, side hit
const ease = (t, t0, tau = 0.22) => (t < t0 ? 0 : 1 - Math.exp(-(t - t0) / tau));
function crashCars(t) {
  const eA = ease(t, TC), eC = ease(t, TC2), eD = ease(t, TC3);
  return [
    // A: heading downtown (-z) at x=+2, through the red light → T-boned
    { x: 2 + 0.7 * eA, z: t < TC ? -4.65 + 7 * (TC - t) : -4.65 - 0.5 * eA, rot: PI - 0.45 * eA },
    // B: cross street heading +x along z=-7.5 → hits A's side
    { x: t < TC ? -0.85 - 7 * (TC - t) : -0.85 + 0.45 * eA, z: -7.5 + 0.2 * eA, rot: PI / 2 + 0.3 * eA },
    // C: behind A, rear-ends it
    { x: 2 + 0.25 * eC, z: t < TC2 ? -1.0 + 6 * (TC2 - t) : -1.0 - 0.3 * eC, rot: PI - 0.12 * eC },
    // D: oncoming (+z) at x=-2, hits B's back end
    { x: -2 - 0.3 * eD, z: t < TC3 ? -10.6 - 6.5 * (TC3 - t) : -10.6 - 0.35 * eD, rot: 0.25 * eD },
  ];
}
const CORNER = [[-5.3, -1.3, PI / 2 + 0.5], [-5.9, -0.5, PI / 2 + 0.3], [-6.4, -1.7, PI / 2 + 0.7], [4.7, -0.9, -PI / 2 - 0.6], [5.5, -1.5, -PI / 2 - 0.35]];   // [x, z, rotY] watching from the corners

// ---------------------------------------------------------------- planes (+5 min)
const PLANES = [
  { p: [-260, 150, -300], v: [55, 0, 4] }, { p: [240, 120, -380], v: [-48, 0, 10] }, { p: [-120, 190, -520], v: [38, 2, -6] },
  { p: [300, 95, -220], v: [-60, -1, -5] }, { p: [-30, 230, -450], v: [20, 0, 30] },
];
const FALL = { a: [80, 140, -260], b: [-15, 8, -330], t0: 18.4, t1: 20.6 };

// ---------------------------------------------------------------- war room leaders (from 005)
const LEADERS = [   // 006 restage: everyone on the far arc facing the camera (the globe floats above their heads)
  { a: PI + 1.05, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short', tie: 0x9a2f2f, h: 1.0 },
  { a: PI + 0.52, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob', tie: null, h: 0.97 },
  { a: PI - 0.0, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short', tie: 0x2c3420, h: 1.03, general: true },
  { a: PI - 0.52, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', tie: 0xd8c27a, h: 0.99, glasses: true },
  { a: PI - 1.05, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob', tie: null, h: 0.95 },
  { a: 1.35, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy', tie: 0x2b4f7a, h: 0.88 },
];
function leaderPose(t, L, i) {
  const p = basePose();
  const R = WD.ring;
  p.x = Math.sin(L.a) * R; p.z = Math.cos(L.a) * R; p.rotY = L.a + PI;
  p.eyes = blink(t + i * 0.7, i); p.glasses = !!L.glasses; p.smile = 0;
  p.lean = 0.05; p.headPitch = 0.0;
  p.headYaw = 0.7 * Math.sin((t - 21.4) * (0.45 + 0.1 * i) + i * 1.9);   // looking around at strangers
  p.armA = arm(0.03, 0.07, -0.25, 0); p.armB = arm(0.03, 0.07, -0.25, 0);
  if (i === 1 || i === 4) { p.armA = HAND_UP; p.headPitch = 0.45; p.headYaw = 0; }               // stares at own hand
  if (i === 3) { p.armB = arm(-0.9, 0.0, -1.7, 0, -0.6); p.headPitch = 0.4; p.headYaw = 0; }     // fingers his own tie
  if (i === 2) { const k = K(t, [[24.0, 0], [24.6, 1]]); p.armA = mixArm(p.armA, HANDS_HEAD, k); p.armB = mixArm(p.armB, HANDS_HEAD, k); p.headPitch = 0.2 * k; }
  return p;
}

// ---------------------------------------------------------------- capsule crew (from 005)
function officerPose(t, side) {
  const p = basePose();
  const [sx, sz] = WD.seats[side < 0 ? 0 : 1];
  Object.assign(p, { x: CAP[0] + sx, z: CAP[2] + sz - 0.02, rotY: PI, y: -0.22, footFwd: 0.4, smile: 0 });
  p.eyes = blink(t, side < 0 ? 2 : 5);
  p.lean = 0.12; p.headPitch = 0.22;
  const desk = arm(-0.95, 0.1, -0.55, 0);
  p.armA = { ...desk }; p.armB = { ...desk };
  if (side > 0) { // reaches for the key, slowly
    const r = K(t, [[29.0, 0], [30.6, 1]]);
    p.armA = mixArm(desk, arm(-1.25, 0.05, -0.2, 0, 0.3), r); p.lean = lerp(0.12, 0.32, r); p.headPitch = lerp(0.22, 0.42, r);
  } else { // she watches him
    const look = K(t, [[30.0, 0], [30.7, 1]]);
    p.headYaw = -1.25 * look; p.armA = mixArm(desk, arm(-0.3, 0.1, -1.0, 0), look);
  }
  return p;
}

// ---------------------------------------------------------------- the market (+1 month)
const MKT = SD.spots.marketDoor;
const R1 = rng(77);
const MOB = Array.from({ length: 14 }, (_, i) => {
  const a = -1.0 + (i / 13) * 2.0, r = 0.8 + (i % 3) * 0.55 + R1() * 0.2;
  return { x: MKT[0] + Math.sin(a) * r * 1.4, z: MKT[1] + 0.35 + Math.cos(a) * r, up: i % 3 === 0, ph: R1() * 6 };
});

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, camera, setCamera, renderer } = studio;
  const BASE_EXPOSURE = story.look?.exposure ?? 1.0;
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  const street = buildStreet(studio, {}); const streetFog = scene.fog;
  const war = buildWarRoom(studio, { ambient: 0.5 });
  const cap = buildCapsule(studio, {});
  const plant = buildPlant(studio);
  const border = buildBorder(studio);
  const ROOTS = { street: [street.root], city: [city.root], war: [war.root], cap: [cap.root], plant: [plant.root], border: [border.root] };
  const FAR = { street: 400, city: 1500, war: 900, cap: 900, plant: 900, border: 900 };
  const FOG = { street: streetFog, city: cityFog, war: null, cap: null, plant: null, border: null };

  // ---- people
  const SKINS = [0xf1c7a5, 0xe2ad8c, 0xc98e6a, 0x9c6a4a, 0x7a4e33, 0xf3d1b8, 0xd9a07a];
  const TOPS = [0x3d4a5c, 0x7a3b3b, 0x4f6b5a, 0x2e2e33, 0x8a6f5a, 0x5b4f7a, 0xa65d48, 0x3f5f7a, 0x6b6b70, 0x9a8a6f, 0xd9a441, 0x5f86a8];
  const PANTS = [0x2a2f3a, 0x3a3530, 0x23262d, 0x4a4f5a, 0x5c4a3a];
  const HAIRS = [0x2b1d15, 0x4a3020, 0x1a1412, 0x8a6a4a, 0xc9c4be, 0x5a3a28];
  const STYLES = ['short', 'bob', 'messy', 'short', 'bob', 'short'];
  const R = rng(66), pick = (a) => a[Math.floor(R() * a.length)];
  const pool = Array.from({ length: 24 }, () => { const r = makePerson({ skin: pick(SKINS), top: pick(TOPS), collar: R() < 0.4 ? 0xf3e9dc : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: pick(STYLES) }); scene.add(r.root); return r; });
  const roofCarrier = new THREE.Group(); roofCarrier.position.y = ROOF_Y; city.root.add(roofCarrier);
  const roofers = [0, 1].map((i) => { const r = makePerson({ skin: [0xe8b996, 0xb07a56][i], top: [0xc46b5a, 0x4f7a6a][i], pants: 0x34405c, hair: [0x3d2a1f, 0x1d1a18][i], hairStyle: ['bob', 'short'][i] }); roofCarrier.add(r.root); return r; });
  const leaders = LEADERS.map((L) => {
    const P = makePerson({ skin: L.skin, top: L.top, collar: 0xf1ede4, pants: L.pants, hair: L.hair, hairStyle: L.hairStyle, glasses: L.glasses });
    P.root.scale.setScalar(L.h);
    if (L.tie) { const tie = mk(new RoundedBoxGeometry(0.045, 0.2, 0.02, 2, 0.008), mat(L.tie, 0.6), P.spine, 0, 0.42, 0.13); tie.rotation.x = -0.12; }
    if (L.general) for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.11, 0.018, 0.08, 2, 0.006), mat(0xd8c27a, 0.4), P.spine, s * 0.2, 0.52, 0);
    war.root.add(P.root); return P;
  });
  const officers = [-1, 1].map((s) => {
    const P = makePerson({ skin: s < 0 ? 0xe2ad8c : 0xb07a56, top: 0x3c4a63, collar: 0x2c3648, pants: 0x3c4a63, hair: s < 0 ? 0x4a3020 : 0x1d1a18, hairStyle: s < 0 ? 'bob' : 'short' });
    mk(new RoundedBoxGeometry(0.07, 0.07, 0.01, 2, 0.006), mat(0xc9a25a, 0.4), P.spine, 0.09, 0.42, 0.135);
    scene.add(P.root); ROOTS.cap.push(P.root); return P;
  });
  const guard = border.guard;

  // ---- city props: the four crash cars (they stay, rusting, for the +1 year shot)
  const crash = [0xc9503f, 0x3f6fa5, 0xe6dccb, 0x2f3338].map((c, i) => { const car = makeCar(c, i + 11); city.root.add(car.g); return car; });
  // planes: strobe + red/green nav lights, unlit sprites (no fog) far over downtown
  const dot = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const spr = (color, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color, fog: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, transparent: true })); m.scale.set(s, s, 1); return m; };
  const planes = [...PLANES, FALL].map((pl, i) => {
    const g = new THREE.Group(); city.root.add(g);
    const strobe = spr(new THREE.Color(1.8, 1.8, 1.8), 7), red = spr(new THREE.Color(2.2, 0.3, 0.2), 5), green = spr(new THREE.Color(0.3, 2.0, 0.5), 5);
    red.position.x = -6; green.position.x = 6; g.add(strobe, red, green);
    return { g, strobe, ph: i * 0.37 };
  });
  const glow = spr(new THREE.Color(3.0, 1.2, 0.4), 160); glow.position.set(FALL.b[0], FALL.b[1] + 10, FALL.b[2]); city.root.add(glow);
  const glowLight = new THREE.PointLight(0xff8a40, 0, 600, 1.2); glowLight.position.set(FALL.b[0], 30, FALL.b[2] + 40); city.root.add(glowLight);
  // reactor warning beacon
  const beacon = spr(new THREE.Color(2.6, 0.25, 0.15), 4); plant.root.add(beacon); beacon.position.set(16, 19.7, 4);   // top of the reactor dome

  let cur = null;
  function useSet(name) {
    if (name === cur) return; cur = name;
    for (const [k, roots] of Object.entries(ROOTS)) for (const r of roots) r.visible = k === name;
    scene.fog = FOG[name]; camera.far = FAR[name];
  }
  const put = (r, p) => applyPose(r, p);

  function update(t) {
    const shot = shotAt(t);
    useSet(shot.set);
    pool.forEach((r) => (r.root.visible = false));
    let ex = 0; const extra = () => pool[ex++];
    let expo = 1.0, shake = 0;

    if (shot.set === 'street') {
      street.setSeason(t < 52.8 ? 'spring' : 'autumn', t);
      if (shot.cam === 'street') {
        street.aimSun(-26, -1.4, 16);
        WALKERS.forEach((w, i) => put(extra(), walkerPose(w, i, t)));
      } else { // +1 month: the market mob
        street.aimSun(0.6, -2, 8);
        MOB.forEach((m, i) => {
          const q = basePose();
          const sway = 0.08 * Math.sin(t * 2.3 + m.ph);
          Object.assign(q, { x: m.x + sway * 0.4, z: m.z + 0.05 * Math.sin(t * 1.7 + m.ph), rotY: faceToward(m.x, m.z, MKT[0], MKT[1] - 0.3), floor: SH, lean: 0.12 + sway, eyes: blink(t, i + 40), smile: 0 });
          q.headPitch = -0.1;
          if (m.up) { const pound = 0.25 * Math.max(0, Math.sin(t * 5.5 + m.ph)); q.armB = arm(-2.3 + pound, 0.15, -0.5, 0); }
          else q.armA = arm(-0.9, 0.1, -0.6, 0);
          put(extra(), q);
        });
      }
    } else if (shot.set === 'city') {
      const cars = crashCars(shot.cam === 'crash' ? t : 99);
      crash.forEach((car, i) => {
        const c = cars[i]; car.g.position.set(c.x, 0, c.z); car.g.rotation.y = c.rot;
        car.g.visible = shot.cam === 'crash' || shot.cam === 'ruin';
        car.setRust(shot.cam === 'ruin' ? 1 : 0);
        car.setLights(0, shot.cam === 'crash' && t > TC ? 1 : 0);
      });
      planes.forEach((pl) => (pl.g.visible = shot.cam === 'planes'));
      glow.visible = shot.cam === 'planes'; glowLight.intensity = 0;
      roofers.forEach((r) => (r.root.visible = false));
      if (shot.cam === 'crash') {
        city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setGrowth(0); city.setSignal('red'); city.setShadowFocus(1, -4, 18);
        shake = 0.05 * Math.exp(-(t - TC) / 0.25) * (t > TC ? 1 : 0) + 0.03 * Math.exp(-(t - TC2) / 0.2) * (t > TC2 ? 1 : 0);
        CORNER.forEach(([x, z, rot], i) => {
          const q = basePose(); Object.assign(q, { x, z, rotY: rot, floor: 0.14, eyes: blink(t, i + 60), smile: 0 });
          const look = K(t, [[TC, 0], [TC + 0.4, 1]]);
          q.headYaw = 0.4 * Math.sin(t * 0.6 + i) * (1 - look); q.headPitch = 0.05;
          if (i === 1) { q.armA = mixArm(q.armA, HANDS_HEAD, look); q.armB = mixArm(q.armB, HANDS_HEAD, look); }
          if (i === 3) q.mouth = t > TC + 0.2 ? 'o' : 'flat';
          put(extra(), q);
        });
      } else if (shot.cam === 'planes') {
        expo = 1.3;
        city.setTime({ day: 0, golden: 0, power: 1, milky: 0.25, moon: 1 }); city.setGrowth(0); city.setSignal('red'); city.setShadowFocus(-11, 11, 14);
        planes.forEach((pl, i) => {
          const dt = t - 15.2;
          if (i < PLANES.length) { const P = PLANES[i]; pl.g.position.set(P.p[0] + P.v[0] * dt, P.p[1] + P.v[1] * dt, P.p[2] + P.v[2] * dt); }
          else { const u = smooth((t - FALL.t0) / (FALL.t1 - FALL.t0)) ** 1.6; pl.g.position.set(lerp(FALL.a[0], FALL.b[0], u), lerp(FALL.a[1], FALL.b[1], u), lerp(FALL.a[2], FALL.b[2], u)); pl.g.visible = t < FALL.t1; }
          pl.g.lookAt(camera.position);
          pl.strobe.visible = ((t + pl.ph) * 1.1) % 1 < 0.14;
        });
        const g = smooth((t - FALL.t1) / 0.8);
        glow.material.opacity = g * 0.9; glow.scale.setScalar(120 + 80 * g); glowLight.intensity = 30 * g;
        roofers.forEach((r, i) => { const q = basePose(); Object.assign(q, { x: -11.2 + i * 1.2, z: 9.4 - i * 0.2, rotY: PI + (i ? -0.1 : 0.12), headPitch: -0.55, eyes: blink(t, i + 70), smile: 0 }); if (t > FALL.t1 + 0.2) q.mouth = 'o'; put(r, q); });
      } else if (shot.cam === 'dark') {
        expo = 1.25;
        city.setGrowth(0); city.setSignal('off'); city.setShadowFocus(0, -6, 55);
        city.setTime({ day: 0, golden: 0, milky: 0, moon: 1, power: K(t, [[41.0, 1], [45.8, 0]]) });
      } else { // ruin, +1 year
        city.setSignal('off'); city.setShadowFocus(1, 4, 26);
        city.setTime({ day: 1, golden: 0.7, power: 0, milky: 0, moon: 0 }); city.setGrowth(0.85);
        const q = basePose(); const d = (t - 58.4) * 0.8;   // one person walks away down the middle of the road
        Object.assign(q, { x: -0.6, z: 6.0 - d, rotY: PI, dist: d, speed: 0.8, eyes: 'open', smile: 0 }); put(extra(), q);
      }
    } else if (shot.set === 'war') {
      war.setGlobeLight(0.8);
      war.lights.redLight.intensity = 9 + 3 * Math.sin(t * 2.0);   // slow alarm wash
      war.globe.spin.rotation.y = t * 0.15; war.globe.g.position.y = WD.globe.y + 1.2; war.globe.g.scale.setScalar(0.7);
      LEADERS.forEach((L, i) => put(leaders[i], leaderPose(t, L, i)));
    } else if (shot.set === 'cap') {
      cap.setPanel(1);
      put(officers[0], officerPose(t, -1)); put(officers[1], officerPose(t, 1));
    } else if (shot.set === 'plant') {
      plant.update(t, K(t, [[34.2, 0.55], [40.4, 0.04]]));
      beacon.material.opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3.2));
    } else if (shot.set === 'border') {
      border.setTanksAdvance(clamp((t - 46.6) / 6.2), 1);
      const back = K(t, [[49.8, 0], [52.6, 1]]);
      const p = basePose();
      Object.assign(p, { x: -1.25, z: 2.2 + 1.1 * back, rotY: PI + 0.1, eyes: blink(t, 4), smile: 0, dist: back * 1.1, speed: back > 0 && back < 1 ? 0.25 : 0 });
      p.headYaw = 0.3 * Math.sin(t * 0.7);
      p.armA = arm(0.03, 0.07, -0.2, 0); p.armB = arm(0.03, 0.07, -0.2, 0);
      put(guard, p);
    }
    renderer.toneMappingExposure = BASE_EXPOSURE * expo;

    // ---- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    const pos = c.p[0].map((v, i) => lerp(v, c.p[1][i], e));
    if (shake) { pos[0] += shake * Math.sin(t * 61); pos[1] += shake * Math.sin(t * 47 + 1); }
    setCamera(pos, c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);
  }
  return { update };
}
