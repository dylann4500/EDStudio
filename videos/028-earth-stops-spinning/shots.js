// VIDEO 028 — "What if Earth stopped spinning for one second?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 60.6 s. One physics clock τ (the HUD number) runs 0 → 1.000 s across six places in slow motion, then the Earth spins again
// and we see where everything ended up, in real time. NEW: engine/sets/southpole.js. Reused: plaza.js (Quito), pool.js (Rio),
// street.js (New York), suburb.js (Texas), coast.js (Maine).
//
// PHYSICS MODEL (stated so a reviewer can check every number). The solid Earth (rock + everything bolted to it) stops dead for
// exactly one second, then spins again at its normal rate. Everything NOT attached to the rock — people, cars, water, air —
// keeps the eastward speed it had (Newton's 1st law): v = 465.1 m/s × cos(latitude), relative to the stopped ground.
//  • So for that second, relative to the ground, every free thing slides east at v: 465 m at the equator, 0 m at the pole.
//    Free things at one place all move together, so they keep their places relative to each other (the tablecloth trick):
//    only bolted things (buildings, trees, poles, a fountain's stone basin, a pool's walls, the sea floor) slide out from under
//    them. Sliding east along the equator keeps you on it (the equator runs east–west).
//  • The air moves with you, so you feel no wind; everything bolted down meets a wind of v for one second (Mach 1.2 in Texas).
//  • Nobody reacts inside ~0.2 s (human reaction time), so the early, millisecond beats are frozen faces.
//  • Friction can only pull a sliding body back at ~μg ≈ 7 m/s², so people tip forward (like a bus braking from 1,674 km/h),
//    slowly at first; when the ground restarts it is moving ~7 m/s faster than them, so they tumble back west and skid to a stop.
//  • Water slams into the deep end of a pool at v and is thrown up the wall (cartoon: a vertical sheet). The ocean slides
//    off the seabed of an east-facing coast (Maine) at v; when the spin returns, the gap refills like a dam break: front speed
//    2√(g·h) = 28 m/s for h = 20 m (Ritter's solution) → 337 m back in ~12 s.
//  • The pole turns 360°/sidereal day = 0.004°/s. Stopping that changes nothing anyone can feel.
//  • Not shown / honest limits: it would take the planet's whole spin energy (½Iω² ≈ 2.1 × 10²⁹ J, the Sun's output for ~9 min)
//    to stop it and the same again to restart it; real winds of 1,000+ km/h would wreck buildings. It's a cartoon of the kinematics.
//
// SOURCES (checked Oct 2026):
//   equatorial radius 6,378.137 km (WGS-84) / sidereal day 86,164.09 s → 465.1 m/s = 1,674 km/h (Wikipedia "Earth's rotation":
//     1,674.4 km/h; NASA quotes ~1,670 km/h); speed at latitude = 1,674 × cos(lat): Quito 0°: 1,674 · Rio 22.9° S: 1,542 ·
//     New York 40.7° N: 1,269 (353 m in 1 s) · Austin 30.3° N: 1,446 (402 m) · Portland, Maine 43.7° N: 1,211 (337 m) · pole: 0
//   speed of sound 343 m/s at 20 °C → Austin's 401.7 m/s = Mach 1.17
//   strongest measured surface gust: 408 km/h (113 m/s), Barrow Island, Australia, Cyclone Olivia, 10 Apr 1996 (WMO, 2010)
//   human simple reaction time ≈ 0.2–0.25 s
//   Earth's moment of inertia 0.3307 MR² (NASA fact sheet) → rotational energy 2.1 × 10²⁹ J; solar luminosity 3.83 × 10²⁶ W
//   local times at 15:00 UTC Wed Oct 28 2026: Quito 10 AM (UTC−5), Rio noon (UTC−3), New York 11 AM (EDT until Nov 1),
//     Texas 10 AM (CDT), Maine 11 AM (EDT), South Pole station 4 AM (NZDT, UTC+13) — the sun never sets there Sep–Mar
//   South Pole: elevation 9,301 ft (2,835 m) on the marker sign; the ceremonial pole + 12 Antarctic Treaty flags
//
// Shot list (seconds)                     | set    | what happens
//  0.0– 3.4 title                         | plaza  | crane down over the equator line, tourists posing along it
//  3.4– 8.2 quitoA  SECOND 0 at 7.6       | plaza  | a selfie on the line, a kid hopping across it; 7.6: jolt
//  8.2–12.6 slide   τ 0 → 0.03            | plaza  | the camera slides east with the tourists; the plaza (monument, fountain basin, lamps) slides
//                                         |        | west under them; the fountain's water + the people sitting on its rim stay with them
// 12.6–16.4 pool    τ 0.03 → 0.07         | pool   | Rio: the water leaves the shallow end and slams into the deep end, up the wall in a sheet
// 16.4–20.6 nyc     τ 0.07 → 0.13         | street | 42nd St: cabs, a hot-dog cart, a dog walker slide together; storefronts streak by
// 20.6–25.0 texas   τ 0.13 → 0.22         | suburb | dad mowing, calm in a cloud of leaves + pickets; bent bare trees + houses streak by
// 25.0–29.4 maine   τ 0.22 → 0.6          | coast  | on a lobster boat riding the Atlantic out to sea: the lighthouse left on dry seabed
// 29.4–33.8 pole    τ 0.6 → 1.0           | pole   | three scientists jog around the ceremonial pole. Nothing happens.
// 33.8–38.2 restart EARTH SPINS AGAIN     | plaza  | everyone tumbles back and skids to a stop — still on the equator line
// 38.2–41.0 nycR                          | street | the cab skids, the cart tips, the dog sits up
// 41.0–43.8 poolR                         | pool   | the swimmers stand in the empty pool; the water comes back down
// 43.8–46.8 texR                          | suburb | dad + mower thud down on a lawn 402 m east; a neighbor stares
// 46.8–50.2 maineR  +12 s                 | coast  | the Atlantic comes back as a white wall, over the islet
// 50.2–60.6 poleR                         | pole   | Dave raises his coffee. Fade 55.8, end card 56.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, smooth, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makeMug, makeDog, makePhone } from '@engine/props.js';
import { buildPlaza, DIMS as QD } from '@engine/sets/plaza.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildSuburb, DIMS as UD } from '@engine/sets/suburb.js';
import { buildCoast, waveAt } from '@engine/sets/coast.js';
import { buildSouthPole } from '@engine/sets/southpole.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { makeCar } from '@engine/sets/city.js';
import { makeFlag } from '@engine/sets/capital.js';

const PI = Math.PI, G = 9.81, SW = 7.6, RS = 33.8;
// eastward speed of everything free, relative to the stopped ground (m/s) = 465.1 · cos(latitude)
const V = { plaza: 465.1, pool: 428.4, street: 352.6, sub: 401.7, coast: 336.5, pole: 0 };
const OFF = { plaza: [0, 0, 0], street: [3000, 0, 0], pool: [6000, 0, 0], sub: [9000, 0, 0], coast: [14000, 0, 0], pole: [20000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'title', set: 'plaza' },
  { t0: 3.4, t1: 8.2, cam: 'quitoA', set: 'plaza' },
  { t0: 8.2, t1: 12.6, cam: 'slide', set: 'plaza' },
  { t0: 12.6, t1: 16.4, cam: 'pool', set: 'pool' },
  { t0: 16.4, t1: 20.6, cam: 'nyc', set: 'street' },
  { t0: 20.6, t1: 25.0, cam: 'texas', set: 'sub' },
  { t0: 25.0, t1: 29.4, cam: 'maine', set: 'coast' },
  { t0: 29.4, t1: 33.8, cam: 'pole', set: 'pole' },
  { t0: 33.8, t1: 38.2, cam: 'restart', set: 'plaza' },
  { t0: 38.2, t1: 41.0, cam: 'nycR', set: 'street' },
  { t0: 41.0, t1: 43.8, cam: 'poolR', set: 'pool' },
  { t0: 43.8, t1: 46.8, cam: 'texR', set: 'sub' },
  { t0: 46.8, t1: 50.2, cam: 'maineR', set: 'coast' },
  { t0: 50.2, t1: 60.6, cam: 'poleR', set: 'pole' },
];
// camera coords LOCAL to the shot's set: p/a = [start, end] (eased); fov; amp = handheld drift. `free: true` = the camera rides
// with the free things (adds the slide distance along the set's east axis).
export const CAMS = {
  title:   { p: [[7.5, 17, 19], [0.0, 6.2, 9.8]], a: [[-6, 0.5, -5], [-5, 1.3, -2]], fov: 50, amp: 0.01 },
  quitoA:  { p: [[-2.0, 1.45, 4.5], [-2.5, 1.42, 3.9]], a: [[-4.45, 1.6, -1.2], [-4.5, 1.64, -1.2]], fov: 48, amp: 0.004 },
  slide:   { p: [[-1.6, 1.5, 4.0], [-0.6, 2.1, 4.8]], a: [[-4.8, 1.55, -2.0], [-5.6, 1.5, -3.2]], fov: 52, amp: 0.004, free: true },
  pool:    { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 56, amp: 0.005 },   // rides along with the swimmers (custom)
  nyc:     { p: [[-68.6, 2.35, 6.7], [-68.0, 2.45, 6.4]], a: [[-69.4, 1.15, -1.8], [-69.2, 1.2, -1.8]], fov: 56, amp: 0.004, free: true },
  texas:   { p: [[-36.2, 1.35, 1.6], [-35.4, 1.5, 1.2]], a: [[-38.4, 2.3, -7.5], [-38.2, 2.6, -7.5]], fov: 60, amp: 0.004, free: true },
  maine:   { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 50, amp: 0.006, free: true },   // rides the lobster boat (custom)
  pole:    { p: [[4.4, 1.45, 4.9], [2.4, 1.45, 5.7]], a: [[0, 1.3, -0.2], [0, 1.35, -0.2]], fov: 50, amp: 0.004 },
  restart: { p: [[16.0, 2.6, 3.9], [15.6, 2.0, 3.3]], a: [[14.3, 0.55, -0.2], [14.3, 0.75, -0.2]], fov: 50, amp: 0.006 },
  nycR:    { p: [[21.6, 1.35, -1.25], [21.1, 1.3, -1.35]], a: [[15.2, 0.75, -1.95], [15.2, 0.8, -1.95]], fov: 56, amp: 0.006 },
  poolR:   { p: [[5.4, 1.35, 6.6], [5.8, 1.3, 6.3]], a: [[7.0, 2.4, -0.8], [7.0, 0.6, -0.8]], fov: 60, amp: 0.005 },
  texR:    { p: [[39.4, 1.4, -1.8], [39.0, 1.35, -2.0]], a: [[31.0, 1.45, -8.2], [31.2, 1.45, -8.2]], fov: 50, amp: 0.006 },
  maineR:  { p: [[4, 40.5, 14], [3, 39.5, 12]], a: [[-8, 6, -90], [-8, 4, -70]], fov: 50, amp: 0.008 },
  poleR:   { p: [[3.8, 1.55, 6.2], [1.9, 1.5, 4.3]], a: [[0.4, 1.4, 0.4], [0.7, 1.5, 1.0]], fov: 44, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const OUT = A(-0.25, 1.3, -0.25, 0);
const PHONE_B = A(-1.4, 0.15, -1.35, -0.45);
const SELFIE = A(-1.95, 0.55, -0.25, -0.3);
const PEACE = A(-2.55, 0.35, -1.5, -0.4);
const HUG_A = A(-0.25, 1.05, -1.45, 0.35);
const POINT_DN = A(-0.95, 0.25, -0.1, 0);
const CHEER = A(-2.75, 0.4, -0.25, 0);
const PROP_A = A(0.75, 0.3, -0.15, 0), PROP_B = A(0.75, 0.3, -0.15, 0);   // leaning back on the hands (sitting on the ground)
const MOW = A(-0.85, 0.12, -0.45, 0);
const MUG_B = A(-0.6, 0.18, -1.55, -0.5), TOAST_B = A(-2.0, 0.3, -0.9, -0.3), SIP_B = A(-1.15, 0.12, -2.25, -0.75);
const THUMB_B = A(-1.3, 0.25, -1.6, -0.5);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const flail = (t, ph = 0, k = 1) => A(-1.4 + 0.7 * k * Math.sin(t * 2.3 + ph), 0.9 + 0.35 * k * Math.sin(t * 1.7 + ph), -0.45 - 0.3 * Math.sin(t * 2.0 + ph), 0);

// tipping forward while sliding (friction on the feet ≈ 7 m/s²): almost nothing in the millisecond beats, ~1 rad by τ = 1
const tipAt = (tau) => 1.05 * smooth(clamp((tau - 0.1) / 0.9));

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob'];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xd9cdb4];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const HUD = story.hud.filter((h) => h.r0 !== undefined);
  const tauAt = (t) => {
    if (t < SW) return t - SW;
    if (t < RS) { const s = HUD.find((h) => t >= h.r0 && t < h.r1); return s ? lerp(s.from, s.to, (t - s.r0) / (s.r1 - s.r0)) : 1; }
    return 1;
  };
  const slide = (key, tau) => V[key] * clamp(tau, 0, 1);   // metres east of where it started, relative to the ground

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const plaza = buildPlaza(studio, {}); plaza.root.position.set(...OFF.plaza);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const sub = buildSuburb(studio, { poleClear: [-16, -11.5, -2.2, 4.5, 58, 14, 32] }); sub.root.position.set(...OFF.sub);
  const coast = buildCoast(studio, {}); coast.root.position.set(...OFF.coast);
  const pole = buildSouthPole(studio, {}); pole.root.position.set(...OFF.pole);
  const ROOTS = { plaza: plaza.root, street: street.root, pool: pool.root, sub: sub.root, coast: coast.root, pole: pole.root };
  const FOGS = { plaza: plaza.fog, street: streetFog, pool: pool.fog, sub: sub.fog, coast: coast.fog, pole: pole.fog };
  const FAR = { plaza: 1100, street: 400, pool: 300, sub: 330, coast: 3200, pole: 1700 };
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- shared FX: water blobs, dust puffs
  const blobGeo = new THREE.SphereGeometry(1, 14, 10);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x9fd8f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.82, emissive: 0x1a4a66, emissiveIntensity: 0.35 });
  const NB = 900, blobs = new THREE.InstancedMesh(blobGeo, waterM, NB); blobs.frustumCulled = false; blobs.castShadow = false; scene.add(blobs);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), S3 = new THREE.Vector3();
  let nb = 0;
  const blob = (p, r, t = 0, ph = 0) => { if (nb >= NB || r < 0.004) return; const w = 0.14 * Math.sin(t * 5 + ph); S3.set(r * (1 + w), r * (1 - w * 0.8), r * (1 + w * 0.4)); M4.compose(p, Q4.setFromEuler(E3.set(ph, ph * 2, 0)), S3); blobs.setMatrixAt(nb++, M4); };
  const puffs = makeSpritePool(scene, 64, 'smoke'), puffC = new THREE.Color(0xe8e2d8), spray = new THREE.Color(0xffffff), dirtC = new THREE.Color(0xc9b48e), steamC = new THREE.Color(0xf4f4f4);
  let shake = [0, 0];
  const jolt = (t, at, k0 = 0.03, rate = 7) => { if (t > at && t < at + 0.8) { const k = k0 * Math.exp(-(t - at) * rate); shake = [shake[0] + k * Math.sin(t * 71), shake[1] + k * Math.sin(t * 53)]; } };
  const dust = (base, key, x, y, z, t, at, n = 6, size = 1.4, col = puffC) => { const age = t - at; if (age < 0 || age > 1.6) return; for (let k = 0; k < n; k++) { const a = k * 2.4 + base, r = 0.3 + age * 1.6; puffs.set((base + k) % 64, W(key, x + Math.cos(a) * r, y + 0.25 + age * 0.6 * (k % 3) * 0.5, z + Math.sin(a) * r), size * (0.6 + age), 0.7 * (1 - age / 1.6), col); } };

  // ---------------------------------------------------------------- cast helpers
  const R = rng(28);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.root.visible = false; return p; };
  const civ = (o = {}) => { const st = pick(STYLES); return person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: st, glasses: R() < 0.2, mustache: st !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null, ...o }); };
  /** pose a rig: (x,z) local to the set + `dx` east slide; y = root height above `floor`; tx = tilt toward world +x (rad),
   *  back = tilt backward in the body frame (rad), roll = body-frame roll; scale for kids */
  function put(rig, key, p, o = {}) {
    const y = o.y ?? 0, floor = o.floor ?? 0, dx = o.dx ?? 0, s = o.s ?? 1;
    p.x += OFF[key][0] + dx; p.z += OFF[key][2];
    if (s === 1) { p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1]; applyPose(rig, p); }
    else { p.y = 0; p.floor = (floor - y) / s; applyPose(rig, p); rig.root.scale.setScalar(s); rig.root.position.y = y + OFF[key][1]; }
    const tx = o.tx ?? 0, ry = p.rotY;
    rig.root.rotation.set(tx * Math.sin(ry) - (o.back ?? 0), ry, -tx * Math.cos(ry) + (o.roll ?? 0), 'YXZ');
    rig.root.visible = true;
  }
  const hand = (rig, side) => { rig.root.updateMatrixWorld(true); return rig.arms.find((a) => a.s === side).hand.getWorldPosition(new THREE.Vector3()); };

  // ================================================================ PLAZA (Quito, the equator; east = +x)
  const fountainG = plaza.root.children.find((o) => o.isGroup && Math.abs(o.position.x - QD.fountain[0]) < 0.01 && Math.abs(o.position.z - QD.fountain[1]) < 0.01);
  const fountainDisc = fountainG ? fountainG.children.find((o) => o.isMesh && o.material.color && o.material.color.getHex() === 0x6fb5d8) : null;
  const freeDisc = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.12, 40), new THREE.MeshStandardMaterial({ color: 0x6fb5d8, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.88 }));
  scene.add(freeDisc); freeDisc.castShadow = false;
  const CROWD = [ // x, z, rotY, role
    [-4.35, 0.14, 0.12, 'selfieA'], [-3.82, 0.06, -0.1, 'selfieB'], [-5.35, 0.0, 0.55, 'kid'], [-6.2, -0.8, 0.85, 'hat'],
    [-2.75, -1.2, -0.55, 'point'], [-6.95, 0.05, 0.3, 'balance'], [-9.4, -1.75, PI / 2, 'walker'], [-1.7, -2.7, -0.35, 'photo'],
    [-4.9, -3.4, 0.25, 'look'], [-7.7, -2.9, 0.95, 'look'], [-2.3, -4.6, -0.9, 'look'], [-6.0, -5.8, 2.6, 'look'], [-3.5, -6.6, PI, 'look'],
  ];
  const tourists = CROWD.map(([x, z, ry, role], i) => {
    const kid = role === 'kid';
    const rig = civ(kid ? { headR: 0.175, top: 0xf2b632, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'messy', glasses: false, mustache: null } : role === 'selfieA' ? { top: 0xe58fa6, hair: 0x2a1d16, hairStyle: 'bob', glasses: false, mustache: null } : role === 'selfieB' ? { top: 0x3d7bd9, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x2a1d16 } : {});
    return { rig, x, z, ry, role, i, kid };
  });
  const selfiePhone = makePhone(); tourists[0].rig.arms.find((a) => a.s === 1).hand.add(selfiePhone.g); selfiePhone.g.position.set(0, -0.05, 0.04); selfiePhone.g.rotation.set(-0.2, 0, 0);
  const photoPhone = makePhone(); tourists[7].rig.arms.find((a) => a.s === 1).hand.add(photoPhone.g); photoPhone.g.position.set(0, -0.05, 0.04); photoPhone.g.rotation.set(PI / 2, 0, 0);
  // sun hat for the woman in the hat role
  { const h = new THREE.Group(); mk(new THREE.CylinderGeometry(0.3, 0.3, 0.015, 24), mat(0xf2e2b8, 0.8), h, 0, 0, 0); mk(new THREE.CylinderGeometry(0.13, 0.14, 0.1, 20), mat(0xf2e2b8, 0.8), h, 0, 0.05, 0); mk(new THREE.CylinderGeometry(0.142, 0.142, 0.03, 20), mat(0xd2483f, 0.7), h, 0, 0.02, 0); tourists[3].rig.head.g.add(h); h.position.y = 0.12; }
  // people sitting on the fountain rim (south side, facing the camera)
  const rimSitters = [1.25, 1.62, 2.0].map((a) => ({ rig: civ(), a }));
  // background crowd for the wide title shot
  const strollers = Array.from({ length: 14 }, (_, i) => ({ rig: civ(), x0: -18 + (i * 7.3) % 34, z0: -8 - (i * 3.7) % 22, dir: i % 2 ? 1 : -1, sp: 0.8 + (i % 4) * 0.2, ry: i % 2 ? PI / 2 : -PI / 2 }));
  // pigeons
  const pigeonM = mat(0x8a8f9a, 0.8);
  const pigeons = Array.from({ length: 10 }, (_, i) => { const g = new THREE.Group(); plaza.root.add(g); mk(new THREE.SphereGeometry(0.12, 10, 8), pigeonM, g, 0, 0.12, 0).scale.set(1, 0.9, 1.5); const head = mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0x6a7080, 0.8), g, 0, 0.21, 0.14); const wl = new THREE.Group(), wr = new THREE.Group(); wl.position.y = wr.position.y = 0.15; g.add(wl, wr); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wl, -0.14, 0, 0); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wr, 0.14, 0, 0); g.scale.setScalar(0.85); return { g, head, wl, wr, x: (i < 5 ? -8.4 : -1.6) + (i % 5) * 0.45, z: 1.5 + (i % 3) * 0.5, ry: i * 1.3 }; });
  // the kid hops back and forth across the line (real time): period 0.62 s, 0.44 s airborne
  const HOP = 0.62, AIR = 0.44, V0 = G * AIR / 2;
  const kidHop = (tr) => { const n = Math.floor(tr / HOP), u = tr - n * HOP, side = n % 2 ? 1 : -1; if (u > AIR) return { y: 0, z: 0.32 * -side }; const k = u / AIR; return { y: V0 * u - 0.5 * G * u * u, z: lerp(0.32 * side, -0.32 * side, k) }; };

  function plazaScene(t, tau, cam) {
    plaza.aimSun(cam === 'restart' ? 12 : -4, cam === 'restart' ? 0 : -2, cam === 'title' ? 28 : 16);
    const d = cam === 'restart' ? 0 : slide('plaza', tau);          // the restart shot is staged 465 m down the line (set reused)
    const DX = cam === 'restart' ? 19 : 0;                             // where the restart crowd sits in the set
    const real = t < SW ? t : SW + Math.max(0, tau);                   // body clock (reactions + ballistics)
    const after = t - RS;                                              // seconds since the spin came back
    tourists.forEach((T, k) => {
      const p = basePose(); p.eyes = blink(real, k + 1); p.mouth = 'smile';
      Object.assign(p, { x: T.x, z: T.z, rotY: T.ry });
      let y = 0, floor = 0, back = 0, roll = 0, tx = 0, s = T.kid ? 0.62 : 1;
      if (T.role === 'selfieA') { p.armB = SELFIE; p.armA = REST; p.headYaw = 0.25; p.headPitch = -0.1; }
      else if (T.role === 'selfieB') { p.armA = HUG_A; p.armB = PEACE; p.headYaw = -0.15; p.headRoll = -0.12; }
      else if (T.role === 'kid') { const h = kidHop(real); y = h.y; floor = h.y; p.z = T.z + h.z; p.armA = CHEER; p.armB = CHEER; p.footFwd = h.y > 0.03 ? 0.15 : 0; }
      else if (T.role === 'hat') { p.armA = A(-0.9, 0.2, -1.8, 0.6); p.armB = A(-0.9, 0.2, -1.8, -0.6); p.headPitch = -0.2; }
      else if (T.role === 'point') { p.armB = POINT_DN; p.headPitch = 0.45; p.mouth = 'o'; }
      else if (T.role === 'balance') { p.armA = OUT; p.armB = OUT; p.footFwd = 0; }
      else if (T.role === 'walker') { const w = Math.min(real, SW) * 1.25; p.x = T.x + w; p.dist = w; p.speed = t < SW ? 1.25 : 0.0001; if (t >= SW) { p.dist = SW * 1.25; p.speed = 1.25; } }
      else if (T.role === 'photo') { p.armB = PHONE_B; p.headPitch = 0.1; }
      else { p.armA = k % 2 ? REST : A(-0.5, 0.35, -0.8, 0.3); p.headPitch = -0.15; p.headYaw = 0.3 * Math.sin(real * 0.4 + k); }
      if (t >= SW && t < RS) tx = tipAt(tau);
      if (cam === 'restart') {
        // the ground comes back ~7 m/s faster than them: they tumble back west, bounce, skid; then sit up, dazed
        p.x += DX; if (T.role === 'kid') p.x = -3.1 + DX; const fall = smooth(clamp(after / 0.3)), up = smooth(clamp((after - 0.75 - (k % 4) * 0.08) / 0.4));
        const bounce = after > 0.3 ? 0.3 * Math.exp(-(after - 0.3) * 7) * Math.abs(Math.sin((after - 0.3) * 14)) : 0;
        tx = lerp(tipAt(1), 0, fall); back = (lerp(0, 1.3, fall) - bounce) * (1 - up);
        p.x -= 0.9 * smooth(clamp(after / 0.5)); p.mouth = 'o'; p.eyes = after > 0.3 && after < 0.8 ? 'closed' : blink(t, k);
        if (after < 0.9) { p.armA = flail(t * 3, k, 1); p.armB = flail(t * 3, k + 2, 1); }
        if (up > 0) { y = -0.745 * up; p.footFwd = 0.75 * up; p.lean = -0.25 * up; p.armA = mixArm(p.armA, PROP_A, up); p.armB = mixArm(p.armB, PROP_B, up); p.headRoll = 0.22 * Math.sin(t * 3 + k) * up; p.mouth = k % 3 ? 'o' : 'smile'; }
        if (T.role === 'kid') { const st = smooth(clamp((after - 1.3) / 0.35)); y = lerp(y, 0, st); p.footFwd = lerp(p.footFwd, 0, st); p.lean = lerp(p.lean, 0.05, st); back *= 1 - st; p.headPitch = lerp(0, 0.6, smooth(clamp((after - 1.7) / 0.3))) * (1 - smooth(clamp((after - 2.4) / 0.3))); if (after > 2.5) { p.armB = THUMB_B; p.mouth = 'smile'; p.headPitch = -0.15; } else if (st > 0.5) { p.armA = REST; p.armB = REST; } p.z = 0; }
      } else if (t >= SW && real > SW + 0.2) p.mouth = 'o';
      put(T.rig, 'plaza', p, { y, floor, dx: d, s, tx, back, roll });
    });
    selfiePhone.g.visible = true; photoPhone.g.visible = true;
    // fountain: the stone basin is bolted down; its water + the people sitting on its rim are not (they stay with the crowd)
    const [fx, fz] = QD.fountain;
    if (fountainDisc) fountainDisc.visible = t < SW || cam === 'restart';
    freeDisc.visible = t >= SW && cam !== 'restart'; freeDisc.position.copy(W('plaza', fx + d, 0.6, fz));
    rimSitters.forEach((S, i) => {
      const p = basePose(); p.eyes = blink(real, i + 20); const x = fx + Math.cos(S.a) * 3.75, z = fz + Math.sin(S.a) * 3.75;
      Object.assign(p, { x, z, rotY: Math.atan2(Math.cos(S.a), Math.sin(S.a)), footFwd: 0.42 }); p.armA = A(-0.75, 0.15, -1.2, 0.5); p.armB = i === 1 ? PHONE_B : A(-0.75, 0.15, -1.2, -0.5);
      if (cam !== 'restart') put(S.rig, 'plaza', p, { y: 0.7 - 0.795, floor: 0, dx: d });
    });
    // jets: water already in the air keeps flying (ballistic) with the crowd; the nozzles slide away
    if (cam !== 'restart') plaza.jets.forEach((j, ji) => {
      const v0 = ji === 0 ? 5.2 : 3.0, n = ji === 0 ? 22 : 9, T0 = 2 * v0 / G, ang = ji === 0 ? 0 : (ji - 1) * PI / 3, hv = ji === 0 ? 0 : 0.45;
      for (let k = 0; k < n; k++) {
        const a = (((Math.min(t, SW)) / T0 + k / n) % 1) * T0 + (t >= SW ? Math.max(0, tau) : 0);
        const y = j.h + v0 * a - 0.5 * G * a * a; if (y < 0.62) continue;
        blob(W('plaza', j.x - Math.cos(ang) * hv * a + (t >= SW ? d : 0), y, j.z - Math.sin(ang) * hv * a), ji === 0 ? 0.075 : 0.05, real, k + ji * 9);
      }
    });
    // pigeons: pecking; they slide too
    pigeons.forEach((g, i) => {
      const pk = Math.max(0, Math.sin(real * 3 + i * 1.7)); g.head.position.y = 0.21 - 0.08 * pk; g.head.position.z = 0.14 + 0.03 * pk;
      g.g.position.set(g.x + d + (cam === 'restart' ? DX - 1.4 : 0), 0, g.z); g.g.rotation.set(0, g.ry, cam === 'restart' ? Math.min(1, after * 2) * 1.2 * (1 - smooth(clamp((after - 2) / 0.5))) : 0);
      const fl = cam === 'restart' && after > 2 ? Math.sin(t * 22 + i) : 0; g.wl.rotation.z = 0.7 * fl; g.wr.rotation.z = -0.7 * fl;
      g.g.visible = cam !== 'title';
    });
    if (cam === 'title') strollers.forEach((S, i) => { const p = basePose(); p.eyes = blink(t, i + 30); const w = t * S.sp; Object.assign(p, { x: S.x0 + S.dir * w, z: S.z0, rotY: S.ry, dist: w, speed: S.sp }); p.armA = REST; p.armB = REST; put(S.rig, 'plaza', p); });
    if (cam === 'quitoA') jolt(t, SW, 0.05, 5);
    if (cam === 'restart') { tourists.forEach((T, k) => { if (k < 7) dust(k * 4, 'plaza', T.x + DX - 0.8, 0, T.z, after, 0.38 + (k % 3) * 0.05, 2, 0.8, puffC); }); jolt(after, 0.4, 0.06, 4); }
    return d;
  }

  // ================================================================ POOL (Rio; east = +x)
  const XW0 = PD.x0, XE = PD.x1, DEP = PD.water - PD.floor;           // 25 m basin, 1.25 m of water
  const TFULL = (XE - XW0) / V.pool;                                   // τ when the last water reaches the deep end (0.058 s)
  pool.water.visible = true;
  const slabM = new THREE.MeshStandardMaterial({ color: 0x5fbde6, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.72, depthWrite: false });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), slabM); pool.root.add(slab); slab.renderOrder = 1;
  const sheetT = canvasTex(128, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(160,220,245,.55)'); gr.addColorStop(0.5, 'rgba(230,248,255,.95)'); gr.addColorStop(1, 'rgba(160,220,245,.55)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`; g.fillRect((i * 37) % w, (i * 71) % h, 3 + (i % 4), 30 + (i % 7) * 12); } }, [3, 2]);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: sheetT, color: 0xdff4ff, roughness: 0.15, transparent: true, opacity: 0.9, emissive: 0x2a6a88, emissiveIntensity: 0.25, depthWrite: false }));
  pool.root.add(sheet); sheet.renderOrder = 2;
  const column = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.6, 1, 28, 1, true), new THREE.MeshStandardMaterial({ map: sheetT, color: 0x8fd0ee, roughness: 0.15, transparent: true, opacity: 0.85, emissive: 0x1a4a66, emissiveIntensity: 0.3, depthWrite: false, side: THREE.DoubleSide })); pool.root.add(column); column.renderOrder = 2;
  const SWIM = [[-11.6, -0.6, 0.15, 0xd2483f, 'bob'], [-10.1, 0.6, -0.2, 0x2f5fb3, 'short'], [-8.5, -1.5, 0.25, 0x1a1a1a, 'messy'], [-6.7, 0.3, -0.15, 0xe58fa6, 'bob']];
  const swimmers = SWIM.map(([x, z, ry, suit, hs]) => ({ rig: person({ skin: pick(SKINS), top: hs === 'bob' ? suit : pick(SKINS), pants: suit, shoes: 0xe2ad8c, hair: pick(HAIRS), hairStyle: hs }), x, z, ry }));
  swimmers.forEach((s) => { s.rig.mats.top.color.copy(s.rig.mats.top.color); });
  const flam = new THREE.Group(); pool.root.add(flam);
  { const pink = mat(0xf08fb0, 0.4); const ring = mk(new THREE.TorusGeometry(0.42, 0.17, 12, 28), pink, flam, 0, 0, 0); ring.rotation.x = PI / 2; const neck = mk(new THREE.CapsuleGeometry(0.08, 0.55, 6, 10), pink, flam, 0, 0.4, -0.45); neck.rotation.x = 0.25; mk(new THREE.SphereGeometry(0.13, 12, 10), pink, flam, 0, 0.72, -0.42); const beak = mk(new THREE.ConeGeometry(0.05, 0.16, 8), mat(0x2a2a2a, 0.5), flam, 0, 0.7, -0.27); beak.rotation.x = PI / 2 + 0.4; }
  const floatKid = person({ skin: 0xc98e6a, top: 0xc98e6a, pants: 0xf2b632, shoes: 0xc98e6a, hair: 0x1a1a1a, hairStyle: 'messy', headR: 0.175 });
  const ball = new THREE.Group(); pool.root.add(ball);
  { const bt = canvasTex(256, 128, (g, w, h) => { ['#e2453c', '#ffffff', '#f2b632', '#ffffff', '#2f6aa8', '#ffffff'].forEach((c, i) => { g.fillStyle = c; g.fillRect((i * w) / 6, 0, w / 6 + 1, h); }); }); mk(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.4 }), ball, 0, 0, 0); }
  const FLAM0 = [-12.1, 1.5], BALL0 = [-9.3, 1.8];
  /** free-body x along the pool at τ (until it reaches the deep end), then the height it has ridden up the sheet */
  const ride = (x0, tau) => { const x = x0 + V.pool * tau; return x < XE - 0.4 ? { x, up: 0 } : { x: XE - 0.4 + 0.25 * Math.min(1, (x - XE + 0.4) / 2), up: x - XE + 0.4 }; };
  function poolScene(t, tau, cam) {
    pool.update(t);
    const after = t - 41.0;
    if (cam === 'pool') {
      // the water body: trailing edge leaves the shallow end at v; the front turns up the deep-end wall in a sheet
      const xw = XW0 + V.pool * tau, L = Math.max(0, XE - xw);
      slab.visible = L > 0.05; slab.scale.set(L, DEP - 0.02, 11.98); slab.position.set((xw + XE) / 2, PD.floor + DEP / 2, 0);
      pool.water.visible = L > 0.05; pool.water.scale.set(L / 25, 1, 1); pool.water.position.x = (xw + XE) / 2;
      const top = PD.water + V.pool * tau, bot = tau > TFULL ? PD.water + V.pool * (tau - TFULL) : PD.floor;
      sheet.visible = true; sheet.scale.set(1.6 + 0.4 * Math.sin(t * 3), top - bot, 12.4); sheet.position.set(XE + 0.3, (top + bot) / 2, 0);
      // spray: the sheet's ragged top + side plumes
      for (let k = 0; k < 200; k++) { const z = -6.2 + (k % 50) * 0.25, row = Math.floor(k / 50); const y = top - 0.3 + row * 0.7 + 0.4 * Math.sin(k * 1.7 + t * 2), x = XE + 0.3 + (row - 1.5) * 0.5 + 0.25 * Math.sin(k * 2.3); blob(W('pool', x, y, z), 0.06 + 0.04 * ((k * 7) % 3), t, k); }
      for (let k = 0; k < 18; k++) { const z = -6 + (k % 9) * 1.5, hi = k >= 9; puffs.set(k, W('pool', XE + 0.2 + 0.3 * Math.sin(k), hi ? top + 0.6 : PD.water + 0.4, z), hi ? 2.4 : 1.8, 0.75, spray); }
      for (let k = 0; k < 90; k++) { const f = k / 90, z = (k % 2 ? 1 : -1) * (6.3 + 1.6 * f), y = bot + (top - bot) * ((k * 0.37) % 1); blob(W('pool', XE + 0.2 + 0.8 * Math.sin(k), y, z), 0.05 + 0.06 * f, t, k + 200); }
      // swimmers ride the water, then up the sheet (frozen faces: it all happens in 40 ms)
      swimmers.forEach((S, i) => { const r = ride(S.x, tau), p = basePose(); p.eyes = 'open'; Object.assign(p, { x: r.x, z: S.z, rotY: S.ry }); p.armA = A(-1.2, 0.9, -0.5, 0); p.armB = i % 2 ? A(-2.4, 0.5, -0.3, 0) : A(-1.0, 1.0, -0.4, 0); p.mouth = i === 1 ? 'o' : 'smile'; p.headPitch = -0.1; const y = PD.water - 1.45 + r.up; put(S.rig, 'pool', p, { y, floor: y, back: r.up > 0 ? -0.35 : 0 }); });
      { const r = ride(FLAM0[0], tau); flam.visible = true; flam.position.set(r.x, PD.water + 0.05 + r.up, FLAM0[1]); flam.rotation.set(r.up > 0 ? -0.6 : 0, -0.3, 0.04 * Math.sin(t)); const p = basePose(); p.eyes = 'open'; Object.assign(p, { x: r.x, z: FLAM0[1] + 0.05, rotY: -0.3, footFwd: 0.42 }); p.armA = CHEER; p.armB = CHEER; p.mouth = 'smile'; const y = PD.water + 0.1 - 0.62 * 0.695 + r.up; put(floatKid, 'pool', p, { y, floor: PD.water - 0.25 + r.up, s: 0.62, back: r.up > 0 ? -0.5 : 0 }); }
      { const r = ride(BALL0[0], tau); ball.visible = true; ball.position.set(r.x, PD.water + 0.2 + r.up * 1.1, BALL0[1]); ball.rotation.set(t * 0.3, t * 0.2, 0); }
    } else { // poolR: the empty basin; the water comes back down in one lump
      const hit = 1.1, fall = after < hit;
      const lumpY = fall ? PD.water + 0.5 * G * (hit - after) * (hit - after) * 4 : 0;
      slab.visible = !fall; const lvl = fall ? 0 : smooth(clamp((after - hit) / 0.35));
      slab.scale.set(25, Math.max(0.02, (DEP - 0.02) * lvl), 11.98); slab.position.set(0, PD.floor + (DEP - 0.02) * lvl / 2, 0);
      pool.water.visible = !fall; pool.water.scale.set(1, 1, 1); pool.water.position.set(0, PD.floor + (DEP) * lvl, 0);
      sheet.visible = false;
      column.visible = fall; if (fall) { column.scale.set(1, 26, 1); column.position.set(7.5, lumpY + 13, -0.5); column.rotation.y = t * 0.4; sheetT.offset.y = -t * 2.5; for (let k = 0; k < 120; k++) { const a = k * 2.399, rr = 3.5 + 0.6 * Math.sin(k * 3.1); blob(W('pool', 7.5 + Math.cos(a) * rr, lumpY + (k % 60) * 0.42, -0.5 + Math.sin(a) * rr), 0.035 + 0.025 * (k % 3), t, k); } for (let k = 0; k < 8; k++) puffs.set(k, W('pool', 7.5 + 2.5 * Math.sin(k * 2), lumpY + 1 + k * 1.2, -0.5 + 2.5 * Math.cos(k * 2)), 3.2, 0.6, spray); }
      if (!fall) { const age = after - hit; if (age < 1.6) for (let k = 0; k < 260; k++) { const a = k * 0.73, vr = 2 + (k % 7) * 1.4, vy = 4 + (k % 9) * 1.6, r = 1.5 + vr * age; const y = PD.water + vy * age - 0.5 * G * age * age; if (y > PD.water - 0.2) blob(W('pool', 7.5 + Math.cos(a) * r, y, -0.5 + Math.sin(a) * r * 0.8), 0.03 + (k % 3) * 0.02, t, k); }
        for (let k = 0; k < 30; k++) if (age < 1.8) puffs.set(k, W('pool', 7.5 + Math.cos(k * 2.1) * (1 + age * (2 + (k % 3))), PD.water + 0.6 + age * (1.5 + (k % 5) * 1.2) - 0.5 * age * age * 2, -0.5 + Math.sin(k * 2.1) * (1 + age * 2)), 2.2 + age * 3.5, 0.85 * (1 - age / 1.8), spray); jolt(after, hit, 0.05, 4); }
      // swimmers: standing on the dry pool floor looking up → under water → bobbing back up
      swimmers.forEach((S, i) => { const p = basePose(); p.eyes = blink(t, i); const x = 4.5 + i * 1.6, z = [-2.6, -0.4, 1.6, -1.2][i]; Object.assign(p, { x, z, rotY: Math.atan2(3.2 - x, 4.6 - z) * 0.6 }); const sub = !fall; p.headPitch = fall ? -0.7 : -0.05; p.mouth = 'o'; p.armA = fall ? A(-0.4, 0.5, -0.6, 0) : A(-2.4, 0.6, -0.3, 0); p.armB = fall ? A(-2.0, 0.4, -0.4, 0) : A(-1.2, 1.0, -0.5, 0); if (sub && after > hit + 0.6) p.mouth = 'smile'; const y = fall ? PD.floor : PD.water - 1.45 + 0.05 * Math.sin(t * 2 + i); put(S.rig, 'pool', p, { y, floor: fall ? PD.floor : y }); });
      flam.visible = !fall; flam.position.set(6.0, PD.water + 0.05 + (after < hit + 0.5 ? 2 * Math.max(0, hit + 0.5 - after) : 0), 2.4); flam.rotation.set(0, 0.8, 0);
      floatKid.root.visible = false; ball.visible = !fall; ball.position.set(9, PD.water + 0.2 + 0.05 * Math.sin(t * 2), 0.6);
    }
  }

  // ================================================================ STREET (New York, 42nd St; east = +x)
  street.root.children.filter((o) => o.isGroup && o.position.y === 0 && (Math.abs(o.position.z - 1.05) < 0.01 || Math.abs(o.position.z - 5.95) < 0.01)).forEach((o) => (o.visible = false));   // the set's parked cars (we bring free ones)
  const cab = (seed) => { const c = makeCar(0xf2c14e, seed); street.root.add(c.g); const sg = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.24), new THREE.MeshStandardMaterial({ map: canvasTex(128, 48, (g, w, h) => { g.fillStyle = '#fff6d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TAXI', w / 2, h / 2 + 2); }), emissive: 0x3a3420, roughness: 0.5 })); sg.position.set(0, 1.58, -0.25); c.body.add(sg); const ck = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.08, 1.4), new THREE.MeshStandardMaterial({ map: canvasTex(128, 16, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#1a1a1a' : '#f4f1ea'; g.fillRect(i * 8, 0, 8, 8); g.fillStyle = i % 2 ? '#f4f1ea' : '#1a1a1a'; g.fillRect(i * 8, 8, 8, 8); } }) })); ck.position.set(0, 0.78, 0.2); c.body.add(ck); return c; };
  const cabs = [{ c: cab(5), x0: -70.6, z: 1.7, ry: PI / 2, v: 7 }, { c: cab(9), x0: -64.0, z: 5.3, ry: -PI / 2, v: -5 }];
  const NYC0 = -71;   // where the walkers stood at τ = 0 (they reach ~−46…−25 during the beat)
  const walkers = [
    { rig: civ({ top: 0x2f3a4a, collar: 0xf2f2f2, pants: 0x3a3d42, hair: 0x5a3a24, hairStyle: 'short', glasses: true }), x: NYC0 - 0.2, z: -1.45, ry: PI / 2 - 0.35, role: 'coffee' },
    { rig: civ({ top: 0xd2483f, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: false, mustache: null }), x: NYC0 + 2.0, z: -2.2, ry: -PI / 2 + 0.45, role: 'dog' },
    { rig: civ({ top: 0xf2f2f2, pants: 0x2f3a4a, hair: 0x2a1d16, hairStyle: 'short', mustache: 0x2a1d16 }), x: NYC0 + 3.0, z: -1.3, ry: -0.35, role: 'vendor' },
    { rig: civ({ top: 0x6fa84f, pants: 0x45607a, hair: 0xd9b46a, hairStyle: 'messy' }), x: NYC0 + 0.8, z: -2.65, ry: PI / 2 - 0.5, role: 'phone' },
    { rig: civ({ top: 0x8f6fb8, pants: 0x2f3a4a, hair: 0x9a6a3a, hairStyle: 'bob', mustache: null }), x: NYC0 + 4.0, z: -2.6, ry: -PI / 2 + 0.4, role: 'bags' },
  ];
  const coffeeCup = new THREE.Group(); mk(new THREE.CylinderGeometry(0.04, 0.032, 0.13, 14), mat(0xf4f1ea, 0.6), coffeeCup, 0, 0.065, 0); mk(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 14), mat(0x8a5a3a, 0.6), coffeeCup, 0, 0.07, 0); walkers[0].rig.arms.find((a) => a.s === 1).hand.add(coffeeCup); coffeeCup.position.set(0, -0.08, 0.03);
  const nycPhone = makePhone(); walkers[3].rig.arms.find((a) => a.s === 1).hand.add(nycPhone.g); nycPhone.g.position.set(0, -0.05, 0.04); nycPhone.g.rotation.set(PI / 2, 0, 0);
  const bagsM = mat(0xc9a06a, 0.8); for (const s of [-1, 1]) { const b = mk(new THREE.BoxGeometry(0.28, 0.32, 0.14), bagsM, walkers[4].rig.arms.find((a) => a.s === s).hand, 0, -0.2, 0); b.castShadow = true; }
  const nycDog = makeDog({ color: 0xf2f2f2, patch: 0x2a2a2a }); street.root.add(nycDog.g);
  const leashM = new THREE.LineBasicMaterial({ color: 0xd2483f }); const leash = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(1, 0, 0)]), leashM); scene.add(leash);
  const nycPigeons = Array.from({ length: 6 }, (_, i) => { const g = new THREE.Group(); street.root.add(g); mk(new THREE.SphereGeometry(0.12, 10, 8), pigeonM, g, 0, 0.12, 0).scale.set(1, 0.9, 1.5); mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0x6a7080, 0.8), g, 0, 0.21, 0.14); return { g, x: NYC0 + 3 + i * 0.7, z: -0.9 - (i % 2) * 0.4, ry: i * 1.1 }; });
  // fixed NYC dressing: hydrants, a USPS box, a W 42 ST sign, newspaper boxes (all bolted down)
  const hydrantM = mat(0xc8302c, 0.5);
  for (let x = -88; x < 40; x += 13) { const h = new THREE.Group(); h.position.set(x, SIDEWALK_H, -0.35); street.root.add(h); mk(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 12), hydrantM, h, 0, 0.27, 0); mk(new THREE.SphereGeometry(0.11, 12, 8), hydrantM, h, 0, 0.56, 0); mk(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 8), hydrantM, h, 0, 0.35, 0).rotation.z = PI / 2; }
  for (let x = -84; x < 30; x += 21) { const b = new THREE.Group(); b.position.set(x, SIDEWALK_H, -0.5); street.root.add(b); mk(new THREE.BoxGeometry(0.5, 0.9, 0.45), mat(0x2f4f9a, 0.5), b, 0, 0.6, 0); mk(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 12, 1, false, 0, PI), mat(0x2f4f9a, 0.5), b, 0, 1.05, 0).rotation.z = PI / 2; for (const s of [-0.2, 0.2]) mk(new THREE.BoxGeometry(0.05, 0.16, 0.05), mat(0x222222, 0.5), b, s, 0.08, 0); }
  for (let x = -79; x < 30; x += 27) { const g = new THREE.Group(); g.position.set(x, SIDEWALK_H, -0.4); street.root.add(g); mk(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), mat(0x3d4a45, 0.5), g, 0, 1.6, 0); const s = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.26), new THREE.MeshStandardMaterial({ map: canvasTex(256, 60, (c, w, h) => { c.fillStyle = '#1f6b3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#fff'; c.font = 'bold 40px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('W 42 ST', w / 2, h / 2 + 2); }), side: THREE.DoubleSide })); s.position.set(0, 3.0, 0.02); g.add(s); }
  function streetScene(t, tau, cam) {
    const after = t - 38.2, R2 = cam === 'nycR';
    const d = R2 ? 0 : slide('street', tau), DX = R2 ? 83 : 0;          // the aftermath is staged further down the street (x ≈ 13…20)
    street.aimSun(R2 ? 16 : NYC0 + 4 + d, -1, 14); street.setSeason('summer', t);
    const sk = R2 ? 2.6 * (1 - Math.exp(-after * 3)) : 0;                 // skid on after the restart
    cabs.forEach((C, i) => { const x = C.x0 + d + C.v * Math.max(0, tau) + DX + (R2 ? sk * (i ? 0.6 : 1) + (i ? 6 : -9.5) : 0); C.c.g.position.set(x, 0, C.z); C.c.g.rotation.set(0, C.ry + (R2 ? 0.25 * (i ? -1 : 1) * smooth(clamp(after / 0.6)) : 0), 0); C.c.g.visible = true; if (R2 && after < 1.2) dust(40 + i * 6, 'street', x - 1.5, 0, C.z + 0.8, after, 0.05, 3, 0.7, puffC); });
    walkers.forEach((Wk, k) => {
      const p = basePose(); p.eyes = R2 ? (after > 0.4 && after < 1.2 ? 'closed' : blink(t, k)) : 'open';
      Object.assign(p, { x: Wk.x + DX + (R2 ? sk : 0), z: Wk.z, rotY: Wk.ry, dist: 0.4 + k * 0.3, speed: 1.2 }); p.mouth = 'flat';
      if (Wk.role === 'coffee') { p.armB = A(-0.6, 0.15, -1.5, -0.5); p.headPitch = 0.05; }
      else if (Wk.role === 'dog') { p.armA = A(-0.5, 0.25, -0.5, 0.2); }
      else if (Wk.role === 'vendor') { p.speed = 0; p.armA = A(-0.8, 0.2, -1.2, 0.4); p.armB = A(-0.8, 0.2, -1.2, -0.4); p.mouth = 'smile'; }
      else if (Wk.role === 'phone') { p.armB = PHONE_B; p.headPitch = 0.25; }
      else if (Wk.role === 'bags') { p.armA = A(0.05, 0.15, -0.1, 0); p.armB = A(0.05, 0.15, -0.1, 0); }
      p.headYaw = [0.7, -0.6, 0.15, 0.8, -0.7][k];
      let tx = 0, back = 0, y = 0;
      if (R2) { const fall = smooth(clamp(after / 0.45)), up = smooth(clamp((after - 1.3 - k * 0.12) / 0.5)); back = 1.4 * fall * (1 - up); p.speed = 0; p.mouth = 'o'; if (up > 0) { y = -0.745 * up; p.footFwd = 0.75 * up; p.lean = -0.25 * up; p.armA = mixArm(p.armA, PROP_A, up); p.armB = Wk.role === 'coffee' ? A(-1.0, 0.2, -1.6, -0.5) : mixArm(p.armB, PROP_B, up); } if (Wk.role === 'vendor') { back *= 0.4; } }
      put(Wk.rig, 'street', p, { y, floor: SIDEWALK_H, dx: d, tx, back });
      if (Wk.role === 'vendor') { street.cart.position.set(Wk.x + 0.9 + d + DX + (R2 ? sk : 0), SIDEWALK_H, -1.1); street.cart.rotation.set(R2 ? 1.3 * smooth(clamp((after - 0.15) / 0.45)) : 0, 0, 0); }   // tips over into the road
    });
    { const Wk = walkers[1], x = Wk.x - 1.2 + d + DX + (R2 ? sk : 0), z = -1.45; nycDog.g.position.set(x, SIDEWALK_H, z); nycDog.g.rotation.set(0, -PI / 2, R2 ? 1.2 * smooth(clamp(after / 0.4)) * (1 - smooth(clamp((after - 1.6) / 0.4))) : 0); nycDog.update(t, R2 ? 0 : 0.0001); nycDog.g.visible = true;
      const hw = hand(Wk.rig, -1), dw = W('street', x - 0.0, SIDEWALK_H + 0.42, z + 0.0); leash.geometry.setFromPoints([hw, hw.clone().lerp(dw, 0.5).add(new THREE.Vector3(0, -0.15, 0)), dw]); leash.visible = true; }
    nycPigeons.forEach((g) => { g.g.position.set(g.x + d + DX, SIDEWALK_H, g.z); g.g.rotation.set(0, g.ry, R2 ? 1.3 * smooth(clamp(after / 0.3)) : 0); g.g.visible = true; });
    coffeeCup.visible = true; nycPhone.g.visible = true;
    if (R2) { jolt(after, 0.35, 0.05, 4); walkers.forEach((Wk, k) => dust(k * 5, 'street', Wk.x + DX + sk - 0.6, SIDEWALK_H, Wk.z, after, 0.4, 2, 0.7)); }
    return d;
  }

  // ================================================================ SUBURB (Texas; east = +x) — the wind beat
  // every tree, fence picket, flower + mailbox is bolted down: the air (moving with dad) blasts them at Mach 1.2
  const subTrees = [], pickets = [];
  sub.root.traverse((o) => {
    if (o.isGroup && o.children.length >= 5 && o.children[0].isMesh && o.children[0].geometry.type === 'CylinderGeometry' && o.children[0].geometry.parameters.radiusTop >= 0.15 && o.children[0].geometry.parameters.height >= 2.5) subTrees.push({ g: o, crowns: o.children.slice(1) });
    if (o.isMesh && o.geometry.type === 'BoxGeometry' && Math.abs(o.geometry.parameters.height - 0.9) < 0.001 && Math.abs(o.geometry.parameters.width - 0.07) < 0.001) pickets.push({ m: o, x: o.position.x, y: o.position.y });
  });
  // the set's loose dressing (bike, gnome, doghouse) would slide too — hide it; dad brings his own
  sub.root.children.filter((o) => o.isGroup && ((Math.abs(o.position.x - (UD.lots[3] - 4.5)) < 0.01) || (Math.abs(o.position.x - (UD.lots[2] - 4.0)) < 0.01) || (Math.abs(o.position.x - (UD.lots[4] - 5.5)) < 0.01))).forEach((o) => (o.visible = false));
  const dad = person({ skin: 0xe2ad8c, top: 0x4f8ac9, collar: 0xf2f2f2, pants: 0xb8a27a, shoes: 0x6a5a48, hair: 0x5a3a24, hairStyle: 'short', mustache: 0x4a2e1c });
  { const cap = new THREE.Group(); mk(new THREE.SphereGeometry(0.15, 16, 10, 0, PI * 2, 0, PI / 2), mat(0xc8302c, 0.7), cap, 0, 0, 0); const bill = mk(new THREE.BoxGeometry(0.2, 0.015, 0.13), mat(0xc8302c, 0.7), cap, 0, 0.0, 0.15); void bill; dad.head.g.add(cap); cap.position.set(0, 0.06, 0); }
  const mower = new THREE.Group(); sub.root.add(mower);
  { const red = mat(0xd2302a, 0.45); mk(new THREE.BoxGeometry(0.56, 0.2, 0.5), red, mower, 0, 0.22, 0); mk(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 14), mat(0x2a2d31, 0.5), mower, 0, 0.42, 0.02); mk(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), mat(0xc9ccd0, 0.3, { metalness: 0.6 }), mower, 0, 0.56, 0.02);
    for (const [x, z] of [[0.24, 0.2], [-0.24, 0.2], [0.24, -0.2], [-0.24, -0.2]]) { const w = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 14), mat(0x1c1c1e, 0.8), mower, x, 0.09, z); w.rotation.z = PI / 2; }
    for (const s of [-0.2, 0.2]) { const h = mk(new THREE.CylinderGeometry(0.014, 0.014, 0.95, 6), mat(0x2a2d31, 0.5), mower, s, 0.62, -0.42); h.rotation.x = -0.65; }
    mk(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 6), mat(0x2a2d31, 0.5), mower, 0, 1.0, -0.72).rotation.z = PI / 2;
    mk(new THREE.BoxGeometry(0.4, 0.3, 0.32), mat(0x3a5a3a, 0.9), mower, 0, 0.38, -0.42); }
  const subDog = makeDog({ color: 0xb07a4a }); sub.root.add(subDog.g);
  const dh = new THREE.Group(); sub.root.add(dh); mk(new THREE.BoxGeometry(1.0, 0.8, 1.2), mat(0xb5462e, 0.8), dh, 0, 0.4, 0); for (const sgn of [-1, 1]) { const r = mk(new THREE.BoxGeometry(1.2, 0.06, 0.75), mat(0x4a5560, 0.8), dh, 0, 0.95, sgn * 0.3); r.rotation.x = sgn * 0.6; } mk(new THREE.BoxGeometry(0.45, 0.5, 0.02), mat(0x1a1a1a, 0.9), dh, 0, 0.3, 0.61);
  const gnome = new THREE.Group(); sub.root.add(gnome); mk(new THREE.CylinderGeometry(0.1, 0.13, 0.25, 10), mat(0x3d7bd9, 0.6), gnome, 0, 0.12, 0); mk(new THREE.SphereGeometry(0.08, 10, 8), mat(0xf1c3a1, 0.6), gnome, 0, 0.3, 0); mk(new THREE.ConeGeometry(0.09, 0.22, 10), mat(0xd2483f, 0.6), gnome, 0, 0.45, 0); mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0xf4f1ea, 0.8), gnome, 0, 0.24, 0.05);
  const neighbor = person({ skin: 0x9a6447, top: 0xf2b632, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const nMug = makeMug(0x2f6aa8); neighbor.arms.find((a) => a.s === 1).hand.add(nMug); nMug.position.set(0, -0.06, 0.05);
  const porchFlag = makeFlag(1.3, 0.8, 3.0, 2); sub.root.add(porchFlag.g);
  // free debris: everything torn off upwind in the first milliseconds now rides along with dad (leaves, pickets, shingles)
  const DEB = 520, debGeo = new THREE.PlaneGeometry(1, 1), debM = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 });
  const debris = new THREE.InstancedMesh(debGeo, debM, DEB); debris.frustumCulled = false; debris.castShadow = true; scene.add(debris);
  const DR = rng(7), debSeeds = Array.from({ length: DEB }, (_, i) => { const kind = i < 360 ? 0 : i < 440 ? 1 : 2; return { kind, x: -14 + DR() * 26, y: kind === 1 ? 0.2 + DR() * 2.2 : kind === 2 ? 2.5 + DR() * 4 : 0.5 + DR() * 5, z: kind === 2 ? -10 + DR() * 6 : -9.5 + DR() * 9.5, s: kind === 0 ? 0.07 + DR() * 0.05 : kind === 1 ? 0.07 : 0.32, w: DR() * 6, sp: 0.5 + DR() * 2, drift: 0.4 + DR() * 1.4 }; });
  debSeeds.forEach((s, i) => debris.setColorAt(i, new THREE.Color(s.kind === 0 ? [0x5e9a46, 0x6fa84f, 0x8ab54a, 0xc9a43a][i % 4] : s.kind === 1 ? 0xf4f1ea : [0x7a4a3a, 0x4a5560, 0x6a5040][i % 3])));
  console.warn(`[028] suburb trees ${subTrees.length}, pickets ${pickets.length}`);
  const DAD0 = -38;   // dad's x at τ = 0 (he passes lots 0…2 during the beat)
  function suburbScene(t, tau, cam) {
    const R2 = cam === 'texR', after = t - 43.8;
    const d = R2 ? 0 : slide('sub', tau), DX = R2 ? 71 : 0;               // aftermath staged on lot 3's lawn (x ≈ 33)
    sub.aimSun(R2 ? 31 : DAD0 + d, -5, 14);
    const wind = R2 ? 0 : 1;
    // trees: stripped + bent hard east (the wind on them is 1,446 km/h); they straighten after the restart
    subTrees.forEach((T, i) => { const b = wind ? 0.55 + 0.12 * Math.sin(t * 9 + i) : 0.35 * Math.exp(-after * 1.5) * Math.cos(after * 7 + i); T.g.rotation.z = -b; T.crowns.forEach((c, k) => { c.scale.setScalar(wind ? (k === 0 ? 0.55 : 0.25) : 0.4); }); });
    pickets.forEach((P, i) => { const fl = 1.45; P.m.rotation.z = -fl; P.m.position.x = P.x + Math.sin(fl) * 0.45; P.m.position.y = 0.45 * Math.cos(fl) + 0.035; P.m.visible = i % 3 !== 0; });   // flattened (a third are gone: they ride with dad)
    // the porch flag on lot 1 streams east in the wind
    porchFlag.g.position.set(-16 + 1.2, 0.3, -6.4); porchFlag.update(t * (wind ? 6 : 1), wind ? 2.6 : 0.4);
    // dad + mower (+ dog, doghouse, gnome) slide together; deadpan (τ < 0.25 → nobody has reacted yet)
    const p = basePose(); p.eyes = R2 ? blink(t, 2) : 'open'; Object.assign(p, { x: DAD0 + DX, z: -5.6, rotY: PI / 2, dist: 0.6, speed: R2 ? 0.0001 : 0.9, lean: 0.12 });
    p.armA = MOW; p.armB = MOW; p.mouth = 'flat'; p.headPitch = 0.1;
    let back = 0, sk = 0;
    if (R2) { sk = 2.2 * (1 - Math.exp(-after * 3.5)); p.x += sk; const wob = Math.exp(-after * 2.5) * Math.sin(after * 9); back = 0.25 * wob; p.mouth = after > 1.4 ? 'smile' : 'o'; p.headYaw = after > 1.0 && after < 2.2 ? -1.2 * smooth(clamp((after - 1.0) / 0.3)) : 0; if (after > 2.1) { p.armB = THUMB_B; p.headYaw = 0.35; } }
    put(dad, 'sub', p, { dx: d, back });
    mower.position.set(DAD0 + DX + sk + 0.85 + d, 0.02 * Math.sin(t * 40), -5.6); mower.rotation.set(0, PI / 2, 0); mower.visible = true;
    subDog.g.position.set(DAD0 + DX + sk - 2.4 + d, 0, -6.9); subDog.g.rotation.set(0, 0.6, 0); subDog.setLie(1); subDog.update(t, 0); subDog.g.visible = true; subDog.head.rotation.x = R2 ? -0.4 : 0;
    dh.position.set(DAD0 + DX + sk - 3.2 + d, 0, -7.6); dh.rotation.y = 0.5; dh.visible = true;
    gnome.position.set(DAD0 + DX + sk + 1.9 + d, 0, -7.0); gnome.visible = true;
    // the neighbor on her porch (aftermath)
    if (R2) { const q = basePose(); q.eyes = blink(t, 9); Object.assign(q, { x: 30.2, z: -8.2, rotY: 0.9 }); q.armB = MUG_B; q.mouth = 'o'; q.headYaw = -0.2; put(neighbor, 'sub', q, { y: UD.porchY, floor: UD.porchY }); nMug.visible = true; }
    // debris cloud (free frame)
    if (!R2) { debSeeds.forEach((s, i) => { const x = DAD0 + s.x + d - s.drift * (tau - 0.13) * 30, y = s.y + 0.3 * Math.sin(t * 0.8 + s.w), z = s.z; const sc = s.kind === 1 ? [0.07, 0.9, 1] : s.kind === 2 ? [0.4, 0.25, 1] : [s.s, s.s * 0.7, 1]; M4.compose(W('sub', x, y, z), Q4.setFromEuler(E3.set(s.w + t * s.sp, s.w * 2 + t * s.sp * 0.7, s.w)), S3.set(...sc)); debris.setMatrixAt(i, M4); }); debris.count = DEB; debris.instanceMatrix.needsUpdate = true; if (debris.instanceColor) debris.instanceColor.needsUpdate = true; debris.visible = true; }
    else { // leaves settling back down (the air is moving with the ground again)
      debSeeds.forEach((s, i) => { const y = Math.max(0.02, s.y - after * (1.2 + s.sp * 0.4)); M4.compose(W('sub', 31 + s.x * 0.3, y, s.z * 0.8 - 1), Q4.setFromEuler(E3.set(y > 0.05 ? s.w + t * s.sp : PI / 2, s.w, 0)), S3.set(s.kind === 0 ? s.s : 0.001, s.kind === 0 ? s.s * 0.7 : 0.001, 1)); debris.setMatrixAt(i, M4); }); debris.count = 360; debris.instanceMatrix.needsUpdate = true; debris.visible = true;
      dust(0, 'sub', DAD0 + DX + 1.2, 0, -5.6, after, 0.05, 6, 1.4, dirtC); jolt(after, 0.1, 0.05, 4);
    }
    return d;
  }

  // ================================================================ COAST (Maine; east = −z, out to sea)
  const ZSHORE = 10, BED = (z) => Math.max(-32, -1.5 - 0.085 * (ZSHORE - z));
  const seaGeo = new THREE.PlaneGeometry(2400, 2400, 160, 160); seaGeo.rotateX(-PI / 2); seaGeo.translate(0, 0, -1200);   // near edge at z = 0 (local)
  const seaBase = seaGeo.attributes.position.array.slice();
  const mySea = new THREE.Mesh(seaGeo, coast.sea.material); coast.root.add(mySea); mySea.receiveShadow = true;
  const bedGeo = new THREE.PlaneGeometry(2400, 2600, 120, 160); bedGeo.rotateX(-PI / 2); bedGeo.translate(0, 0, -1300 + 30);
  { const p = bedGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, BED(z) + 0.35 * Math.sin(x * 0.21 + z * 0.13) + 0.25 * Math.sin(x * 0.07 - z * 0.31)); } bedGeo.computeVertexNormals(); }
  const bedT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#6d6448'; g.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? `rgba(40,60,30,${0.15 + r() * 0.2})` : `rgba(180,165,120,${0.1 + r() * 0.15})`; const s = 3 + r() * 14; g.fillRect(r() * w, r() * h, s, s * 0.6); } for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(120,120,115,.7)'; g.beginPath(); g.arc(r() * w, r() * h, 4 + r() * 10, 0, 7); g.fill(); } }, [80, 80]);
  const bed = new THREE.Mesh(bedGeo, new THREE.MeshStandardMaterial({ map: bedT, roughness: 0.35, metalness: 0.05, color: 0xb8ae90 })); coast.root.add(bed); bed.receiveShadow = true;
  // the islet's rock skirt down to the seabed (it used to be under water) + kelp + a few rocks on the bed
  const graniteM = mat(0x8a857e, 0.95), wetRock = mat(0x5a5650, 0.4);
  const isl = coast.isl; for (let i = 0; i < 14; i++) { const a = i * 0.45, r = 6 + (i % 4) * 1.8, m = mk(new THREE.IcosahedronGeometry(1, 1), i % 2 ? graniteM : wetRock, coast.root, isl.position.x + 2 + Math.cos(a) * r, BED(isl.position.z) + 2.5, isl.position.z + Math.sin(a) * r); m.scale.set(4 + (i % 3) * 1.5, 7 + (i % 4) * 2, 4 + (i % 2) * 2); m.rotation.set(i, i * 2, 0); }
  const kelpM = mat(0x5a5a22, 0.5);
  for (let i = 0; i < 160; i++) { const x = -90 + ((i * 37) % 180), z = ZSHORE - 8 - ((i * 53) % 260); const m = mk(new THREE.BoxGeometry(0.15, 0.04, 1.8 + (i % 4)), kelpM, coast.root, x, BED(z) + 0.05, z); m.rotation.y = i; m.castShadow = false; }
  for (let i = 0; i < 40; i++) { const x = -80 + ((i * 41) % 160), z = ZSHORE - 15 - ((i * 67) % 240); const m = mk(new THREE.IcosahedronGeometry(1, 0), wetRock, coast.root, x, BED(z) + 0.3, z); m.scale.set(1 + (i % 3), 0.7 + (i % 2), 1 + (i % 4) * 0.5); }
  // the trailing edge of the ocean: a near-vertical wall of water (foam on top)
  const edgeT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4fbff'); gr.addColorStop(0.08, '#cfeaf4'); gr.addColorStop(0.25, '#3f8eae'); gr.addColorStop(1, '#16485e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect((i * 13) % w, (i * 29) % (h * 0.3), 6, 18); } }, [40, 1]);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1), new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.25, emissive: 0x0a2a38, emissiveIntensity: 0.3, side: THREE.DoubleSide })); coast.root.add(edge);
  const lob = coast.boats[1].g, sail = coast.boats[0].g, buoys = coast.boats.filter((b) => b.buoy);
  const lobster = person({ skin: 0xe2ad8c, top: 0xf2b632, pants: 0xf2b632, shoes: 0x2a2d31, hair: 0x9a6a3a, hairStyle: 'messy', mustache: 0x7a4a2a, beard: 0x7a4a2a });
  { const beanie = mk(new THREE.SphereGeometry(0.15, 16, 10, 0, PI * 2, 0, PI / 2), mat(0x2f5a8a, 0.9), lobster.head.g, 0, 0.05, 0); beanie.scale.y = 1.15; }
  const trap = new THREE.Group(); mk(new THREE.BoxGeometry(0.9, 0.45, 0.55), mat(0x3f7a5a, 0.8), trap, 0, 0.22, 0); for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(0.92, 0.02, 0.02), mat(0x1a2a22, 0.6), trap, 0, 0.1 * k + 0.05, 0.28); lob.add(trap); trap.position.set(-0.7, 1.05, -3.3);
  const BOAT0 = [-37, -30];
  /** sea edge z (local) at physics time τ (slide), or during the comeback (`back` s after the restart) */
  const edgeZ = (tau, back = null) => back === null ? ZSHORE - V.coast * clamp(tau, 0, 1) : Math.min(ZSHORE, ZSHORE - V.coast + 28 * back);
  function setSea(ez, t, surge = 0) {
    mySea.position.set(0, 0, ez);
    const p = seaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = seaBase[i * 3], z = seaBase[i * 3 + 2]; p.setY(i, surge * Math.exp(z / 60) + waveAt(x, z + ez, t)); }
    p.needsUpdate = true; seaGeo.computeVertexNormals();
    const depth = -BED(ez); edge.scale.set(1, depth + 0.6 + surge, 1); edge.position.set(0, (BED(ez) + 0.3 + surge) / 2, ez);
  }
  function coastScene(t, tau, cam) {
    coast.sea.visible = false; mySea.visible = true; bed.visible = true; edge.visible = true;
    const R2 = cam === 'maineR', back = R2 ? 8.2 + (t - 46.8) : null;
    const ez = edgeZ(tau, back), surge = R2 ? 4 * smooth(clamp((back - 11.0) / 1.0)) : 0;
    setSea(ez, t, R2 ? 3.5 : 0);
    coast.aimSun(R2 ? -6 : BOAT0[0], R2 ? -70 : BOAT0[1] - V.coast * clamp(tau, 0, 1) + 40, R2 ? 80 : 60);
    const dz = R2 ? -V.coast : -V.coast * clamp(tau, 0, 1);
    // boats ride the water out; the buoys are anchored → left lying on the seabed once the edge passes them
    const bx = BOAT0[0], bz = BOAT0[1] + dz;
    lob.position.set(bx, waveAt(bx, BOAT0[1], t) * 0.6 + (R2 ? 30 : 0), bz); lob.rotation.set(0.04 * Math.sin(t * 1.1), PI + 0.15, 0.05 * Math.sin(t * 0.9)); lob.visible = !R2;
    sail.position.set(10, waveAt(10, -42, t) * 0.6, -42 + dz); sail.rotation.set(0.04 * Math.sin(t), 0.9, 0.05 * Math.sin(t * 0.8)); sail.visible = !R2;
    buoys.forEach((b, i) => { const dry = b.z > ez; b.g.position.set(b.x, dry ? BED(b.z) + 0.5 : waveAt(b.x, b.z, t) - 0.6, b.z); b.g.rotation.set(dry ? 1.35 : 0.1 * Math.sin(t + i), b.ry, 0); });
    if (!R2) {
      const p = basePose(); p.eyes = tau > 0.42 ? 'open' : blink(t, 3); Object.assign(p, { x: 0, z: 0, rotY: 0 }); p.armA = A(-0.7, 0.25, -1.3, 0.4); p.armB = A(-0.7, 0.25, -1.3, -0.4); p.lean = 0.25; p.headPitch = 0.3; p.mouth = 'flat';
      if (tau > 0.42) { p.headPitch = -0.15; p.headYaw = 0.5 * smooth(clamp((tau - 0.42) / 0.08)); p.mouth = 'o'; p.armB = mixArm(p.armB, A(-1.8, 0.4, -0.3, 0), smooth(clamp((tau - 0.46) / 0.08))); p.lean = 0.05; }
      lob.updateMatrixWorld(true); const v = new THREE.Vector3(0.45, 1.05, -3.0).applyMatrix4(lob.matrixWorld);
      p.x = v.x - OFF.coast[0]; p.z = v.z - OFF.coast[2]; p.rotY = PI + 0.2; p.headPitch = -0.45; put(lobster, 'coast', p, { y: v.y - OFF.coast[1], floor: v.y - OFF.coast[1] });
    } else {
      // the comeback: a white bore smashes into the islet (spray), then the cliff foot
      const hitI = (isl.position.z - (ZSHORE - V.coast)) / 28, hitC = (ZSHORE - 4 - (ZSHORE - V.coast)) / 28;
      for (const [at, cx, cz, n, sz] of [[hitI, isl.position.x, isl.position.z + 8, 26, 9], [hitC, -10, 6, 20, 10]]) { const age = back - at; if (age > 0 && age < 2.6) for (let k = 0; k < n; k++) { const a = k * 1.7, r = 4 + (k % 6) * 3 + age * 9; puffs.set((k + (cx > -8 ? 0 : 30)) % 64, W('coast', cx + Math.cos(a) * r, 2 + age * 10 * (0.4 + (k % 4) * 0.25), cz + Math.sin(a) * r * 0.4), sz + age * 9, 0.85 * (1 - age / 2.6), spray); } jolt(back, at, 0.04, 4); }
      // the foam front
      for (let k = 0; k < 26; k++) puffs.set(38 + k, W('coast', -110 + k * 8.5, 4.2 + 1.2 * Math.sin(k * 1.3 + t * 2), ez + 2 + 1.5 * Math.sin(k * 0.7)), 9 + 3 * Math.sin(k), 0.8, spray);
    }
    return { bx, bz };
  }

  // ================================================================ SOUTH POLE
  const parka = (rig, o = {}) => {
    const red = mat(0xc8202a, 0.85), fur = mat(0xb9ab94, 1.0);
    const hood = mk(new THREE.SphereGeometry(0.2, 18, 12, PI * 0.72, PI * 1.56, 0, PI * 0.8), red, rig.head.g, 0, 0.02, -0.015); hood.material.side = THREE.DoubleSide;
    const ruff = mk(new THREE.TorusGeometry(0.155, 0.042, 8, 22), fur, rig.head.g, 0, 0.0, 0.1); ruff.scale.set(1, 1.18, 0.6);
    if (o.goggles) { const gg = mk(new THREE.BoxGeometry(0.24, 0.06, 0.04), mat(0x1a1a1a, 0.5), rig.head.g, 0, 0.13, 0.13); gg.rotation.x = -0.35; mk(new THREE.BoxGeometry(0.2, 0.045, 0.02), mat(0xe2752c, 0.2, { metalness: 0.5 }), rig.head.g, 0, 0.13, 0.155).rotation.x = -0.35; }
    rig.mats.skin.color.setHex(0x1e1e22);   // mittens (the neck is under the ruff)
    return { hood, ruff };
  };
  const dave = person({ skin: 0xf1c3a1, top: 0xc8202a, collar: 0xb9ab94, pants: 0x2a2d31, shoes: 0xf2f2f2, hair: 0x7a5a3a, hairStyle: 'short', glasses: true, beard: 0x7a5a3a });
  const crew2 = person({ skin: 0x9a6447, top: 0xc8202a, collar: 0xb9ab94, pants: 0x2a2d31, shoes: 0xf2f2f2, hair: 0x1a1a1a, hairStyle: 'short' });
  const crew3 = person({ skin: 0xf3d0b5, top: 0xc8202a, collar: 0xb9ab94, pants: 0x2a2d31, shoes: 0xf2f2f2, hair: 0xd9b46a, hairStyle: 'bob' });
  parka(dave, {}); parka(crew2, { goggles: true }); parka(crew3, { goggles: true });
  const daveMug = makeMug(0xf2f2f2); daveMug.scale.setScalar(1.25); dave.arms.find((a) => a.s === 1).hand.add(daveMug); daveMug.position.set(0, -0.07, 0.05);
  const LAP = 8.4, RUN_R = 3.0;   // a lap around the pole ("around the world") every 8.4 s
  /** pole ladder camera: circles just outside the loop, a little ahead of Dave, looking back at him (the station + flags wheel past) */
  const DPH = 1.4, poleCam = (t) => { const a = DPH + (t / LAP) * PI * 2, c = 0.4 + 0.3 * (t - 31.6); return { P: [Math.sin(c) * 5.2, 1.6, Math.cos(c) * 5.2], A: [lerp(Math.sin(a) * RUN_R, 0, 0.25), 1.4, lerp(Math.cos(a) * RUN_R, 0, 0.25)] }; };
  function poleScene(t, tau, cam) {
    pole.update(t, 0.3); pole.aimSun(0, -1, 12);
    const R2 = cam === 'poleR', after = t - 50.2;
    const runner = (rig, k, phase, carry) => {
      const a = phase + (t / LAP) * PI * 2, p = basePose(); p.eyes = blink(t, k + 3);
      Object.assign(p, { x: Math.sin(a) * RUN_R, z: Math.cos(a) * RUN_R, rotY: a + PI / 2, dist: t * 2.2, speed: 2.2 }); p.mouth = 'smile';
      { const cpos = camBase, toCam = Math.atan2(cpos[0] - OFF.pole[0] - p.x, cpos[2] - OFF.pole[2] - p.z); let dy = ((toCam - p.rotY + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI; p.headYaw = clamp(dy, -0.9, 0.9); }
      p.armA = A(-0.5, 0.2, -1.4, 0.4); p.armB = carry ? MUG_B : A(-0.5, 0.2, -1.4, -0.4);
      return p;
    };
    if (!R2) {
      put(dave, 'pole', runner(dave, 0, DPH, true)); put(crew2, 'pole', runner(crew2, 1, DPH - 1.1, false)); put(crew3, 'pole', runner(crew3, 2, DPH - 2.2, false));
    } else {
      // Dave peels off, stops in front of the pole, raises the mug, sips; the others keep lapping
      const stop = smooth(clamp(after / 1.2));
      const pr = runner(dave, 0, DPH, true), ps = basePose(); ps.eyes = blink(t, 3); Object.assign(ps, { x: 0.75, z: 1.45, rotY: 0.36 });
      const p = basePose(); Object.assign(p, { x: lerp(pr.x, ps.x, stop), z: lerp(pr.z, ps.z, stop), rotY: lerpAngle(pr.rotY, ps.rotY, stop), dist: pr.dist, speed: 1.75 * (1 - stop) }); p.eyes = ps.eyes;
      const toast = smooth(clamp((after - 1.4) / 0.4)) * (1 - smooth(clamp((after - 2.6) / 0.35))), sip = smooth(clamp((after - 2.7) / 0.35)) * (1 - smooth(clamp((after - 3.8) / 0.4)));
      p.armA = A(-0.3, 0.2, -0.6, 0.2); p.armB = mixArm(mixArm(MUG_B, TOAST_B, toast), SIP_B, sip); p.mouth = sip > 0.5 ? 'flat' : 'smile'; p.headPitch = sip > 0.5 ? -0.25 : 0.0; p.headYaw = 0;
      if (after > 3.8) p.eyes = after < 4.2 ? 'closed' : blink(t, 3);
      put(dave, 'pole', p);
      put(crew2, 'pole', runner(crew2, 1, DPH - 1.6, false)); put(crew3, 'pole', runner(crew3, 2, DPH - 3.0, false));
    }
    daveMug.visible = true;
    // steam from Dave's mug
    dave.root.updateMatrixWorld(true); const mw = daveMug.getWorldPosition(new THREE.Vector3());
    for (let k = 0; k < 5; k++) { const age = (t * 0.6 + k / 5) % 1; puffs.set(50 + k, new THREE.Vector3(mw.x + 0.03 * Math.sin(t + k), mw.y + 0.14 + age * 0.35, mw.z), 0.07 + age * 0.12, 0.45 * (1 - age), steamC); }
  }

  // ================================================================ update
  let cur = null, camBase = [0, 0, 0];
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam, tau = tauAt(t);
    { const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4; camBase = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + OFF[S][i]); if (cam === 'pole') camBase = poleCam(t).P.map((v, i) => v + OFF.pole[i]); }
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = 0.05; studio.fill.intensity = 0.5;
    all.forEach((r) => (r.root.visible = false)); puffs.hide(); freeDisc.visible = false; slab.visible = false; sheet.visible = false; flam.visible = false; ball.visible = false;
    selfiePhone.g.visible = false; photoPhone.g.visible = false; cabs.forEach((C) => (C.c.g.visible = false)); nycDog.g.visible = false; leash.visible = false; coffeeCup.visible = false; nycPhone.g.visible = false;
    mower.visible = false; subDog.g.visible = false; dh.visible = false; gnome.visible = false; debris.visible = false; nMug.visible = false;
    mySea.visible = false; bed.visible = false; edge.visible = false; daveMug.visible = false; column.visible = false;
    nb = 0; shake = [0, 0];

    let d = 0, boat = null;
    if (S === 'plaza') d = plazaScene(t, tau, cam);
    else if (S === 'pool') poolScene(t, tau, cam);
    else if (S === 'street') d = streetScene(t, tau, cam);
    else if (S === 'sub') d = suburbScene(t, tau, cam);
    else if (S === 'coast') boat = coastScene(t, tau, cam);
    else if (S === 'pole') poleScene(t, tau, cam);
    blobs.count = nb; blobs.instanceMatrix.needsUpdate = true; blobs.visible = nb > 0;

    // camera (local → world). free cameras ride along with the sliding things
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (c.free && S !== 'coast') { P[0] += d; Aim[0] += d; }
    if (cam === 'maine' && boat) {   // a drone riding with the ocean, high off the lobster boat's seaward side, looking back at the coast
      const bw = W('coast', boat.bx, 0, boat.bz), isl = coast.isl.position, tw = W('coast', isl.x, 10, isl.z);
      // starts on the lobsterman's face (just above the wheelhouse), then cranes up + back to the lighthouse left on dry land
      const k1 = smooth(clamp((u - 0.2) / 0.6)), lw = lobster.head.g.getWorldPosition(new THREE.Vector3());
      const p0 = new THREE.Vector3(bw.x + 0.7, 3.9, bw.z - 1.3), p1 = new THREE.Vector3(bw.x + 3.5, 16, bw.z - 14), cp = p0.lerp(p1, k1);
      P[0] = cp.x; P[1] = cp.y; P[2] = cp.z;
      const aimEnd = new THREE.Vector3(bw.x, 0.6, bw.z + 3).lerp(tw, 0.88).add(new THREE.Vector3(0, -1.5, 0)), aim = lw.clone().lerp(aimEnd, k1);
      Aim[0] = aim.x; Aim[1] = aim.y; Aim[2] = aim.z;
    }
    if (cam === 'pole') { const pc = poleCam(t); for (let i = 0; i < 3; i++) { P[i] = pc.P[i] + o[i]; Aim[i] = pc.A[i] + o[i]; } }
    if (cam === 'pool') {   // rides beside the lead swimmer, stops short of the deep-end sheet and tilts up after him
      const r = ride(SWIM[0][0], tau), xh = XW0 + 0 + (SWIM[0][0] - XW0) + V.pool * tau, up = r.up;
      P[0] = Math.min(xh - 0.9, 8.4) + o[0]; P[1] = 0.85 + 0.6 * clamp(up / 6) + o[1]; P[2] = 4.3 + o[2];
      Aim[0] = Math.min(xh + 0.9, 11.2) + o[0]; Aim[1] = 0.55 + Math.min(up * 0.8, 6.5) + o[1]; Aim[2] = -0.9 + o[2];
    }
    P[0] += shake[0]; P[1] += shake[1];
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
