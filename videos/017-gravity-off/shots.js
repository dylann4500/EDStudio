// VIDEO 017 — "What if gravity turned off for 5 seconds?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 73.8 s. A second-by-second ladder: the same 5 physical seconds seen in eight places, in slow motion (the HUD clock is the
// physics time τ), then gravity returns and everything lands at once. NEW sets: engine/sets/stadium.js, highway.js, coast.js,
// gorge.js, plaza.js; reused: kitchen.js, pool.js, tech.js (Earth + ISS).
//
// PHYSICS MODEL (stated so a reviewer can check every number). The solid planet keeps its shape (the usual thought-experiment
// assumption; a fully elastic Earth would rebound outward and carry everything with it). With no weight:
//   • anything already moving keeps going in a straight line at the speed it had (Newton's 1st law): jumpers, divers, toast,
//     a coffee being lifted, fountain jets, cars on a curve;
//   • anything squeezed by weight springs back: car suspensions (static sag 110–250 mm at ride frequencies 1.0–1.5 Hz →
//     launch speed √(g·sag) ≈ 1.0–1.6 m/s, we use 1.3 m/s), a stretched bungee cord, and the ocean (water is compressed by its
//     own weight; fully decompressed, sea level would stand about 35 m higher); the sea surface starts rising at g;
//   • the ground spins east and curves away under anything not held down: centripetal acceleration ω²R = 0.0339 m/s² at the
//     equator → ½·0.0339·τ² = 21 cm after 3.5 s (Quito); vertical part in London (51.5° N) 0.0131 m/s² → 16 cm by 5 s;
//   • orbiting things notice nothing: the ISS crew is already in free fall.
// When gravity returns (τ = 5) everything falls from wherever it got to: v = √(2·g·h).
//
// SOURCES (checked Oct 2026):
//   g = 9.80665 m/s² standard gravity (CGPM 1901 / NIST) — shown as 9.81
//   Earth's equatorial rotation ≈ 1,670 km/h (NASA eclipse education page: 1,674 km/h; 40,075 km / 23.93 h)
//   car ride frequency 1.0–1.5 Hz ↔ static deflection ≈ 110–250 mm (vehicle-dynamics rule fn = 3.13/√(defl. in inches))
//   "if seawater were incompressible, sea level would be ~35 m higher" (EXACTAmente, UBA; older texts: 116 ft); NOAA mean ocean
//     depth 3,682 m. Our model: the surface rises at g for 3,682/1,500 ≈ 2.45 s (sound crossing time) → ~30 m at τ = 2.5
//   a 40 cm jump leaves the ground at √(2·9.81·0.4) = 2.8 m/s; a 3 m springboard diver who rises 1.1 m above the board leaves at
//     4.6 m/s → feet at 3 + 4.6·5 = 26 m, peak 27.1 m → entry at √(2·9.81·27.1) = 23 m/s = 83 km/h (Red Bull Cliff Diving:
//     27 m men's platform, ~85 km/h entry — redbull.com "the science of cliff diving")
//   bungee (Victoria Falls Bridge, 111 m): cord rest 50 m, stretched 50 m at the bottom → with no gravity its stored energy
//     (m·g·100 m) comes back as speed √(2·9.81·100) = 44 m/s = 160 km/h upward
//   ISS: ~400 km up, 7.66 km/s ≈ 27,600 km/h (NASA)
//
// TRIBE (tribe-v1..3.txt): v1 0.0317 (slow-mo dead zone 4–26 s) → v2 0.0447 (bullet-time orbits, a tracking run behind the striker,
// a crane up through the floating fans) → v3 0.0414 (family table + diver filmed from the water; worse) → SHIPPED v2 (these sources).
//
// Shot list (seconds)                     | set    | what happens
//  0.0– 3.4 aerial  title                 | stadium| cup final, players attack the home end
//  3.4– 9.4 goal    LONDON 3 PM           | stadium| the striker scores (7.6), the home end erupts and jumps; SECOND 0 at 8.2 → slow motion
//  9.4–14.2 fans    +0 → +0.5 s           | stadium| fans who were mid-jump keep rising, confetti stops in mid-air
// 14.2–19.0 coffee  +0.5 → +1 s           | kitchen| Ohio: dad lifts his coffee and stops; the coffee doesn't (a floating blob); toast keeps popping
// 19.0–23.8 diver   +1 → +1.5 s           | pool   | Budapest: a diver leaves the 3 m board at 4.6 m/s and keeps going; splash blobs hang in the air
// 23.8–28.6 hwy     +1.5 → +2 s           | highway| Texas: the springs push every car off the road; at the curve they go straight
// 28.6–33.4 coast   +2 → +2.5 s           | coast  | Maine: the sea rises up the lighthouse (+20 → +30 m), boats ride it up
// 33.4–38.2 bungee  +2.5 → +3 s           | gorge  | Victoria Falls: the stretched cord fires the jumper up past the bridge at 160 km/h
// 38.2–43.0 quito   +3 → +3.5 s           | plaza  | the equator: everyone's feet 15 → 21 cm off the ground, fountain jets become towers
// 43.0–47.8 iss     +3.5 → +4 s           | space  | 400 km up: an astronaut waves — nothing changed up here
// 47.8–53.0 peak    +4 → +5 s             | stadium| fans 12–14 m above the stand, the striker still rising, countdown
// 53.0–55.6 fall    GRAVITY BACK          | stadium| everything falls at once (real time): fans drop into the stand, dust, shake
// 55.6–58.0 hwyR                          | highway| the cars, 6 m up and far off the curve, slam into the field
// 58.0–60.4 coastR                        | coast  | the ocean drops 35 m; white water around the lighthouse
// 60.4–62.2 kitR                          | kitchen| coffee rains off the ceiling onto dad, the dog catches the toast
// 62.2–65.6 poolR                         | pool   | the diver falls 27 m: the biggest splash of his life
// 65.6–73.8 judges                        | pool   | he surfaces, thumbs up; the judges hold up 10 · 10 · 10. Fade 69.0, end card 69.6
import * as THREE from 'three';
import { K, clamp, lerp, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makeMug, makeDog, makePhone, makeCeilingFan } from '@engine/props.js';
import { buildStadium, DIMS as SD } from '@engine/sets/stadium.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildHighway, DIMS as HD } from '@engine/sets/highway.js';
import { buildCoast, DIMS as CD } from '@engine/sets/coast.js';
import { buildGorge, DIMS as GD } from '@engine/sets/gorge.js';
import { buildPlaza, DIMS as QD } from '@engine/sets/plaza.js';
import { buildSpace, makeISS, makeSpritePool } from '@engine/sets/tech.js';
import { makeCar } from '@engine/sets/city.js';

const PI = Math.PI, G = 9.81, SW = 8.2, BACK = 48.6;
const DRIFT_LON = 0.0131, DRIFT_EQ = 0.0339;        // vertical spin "lift" (m/s²): London, the equator
const OFF = { stad: [0, 0, 0], kit: [6000, 0, 0], pool: [9000, 0, 0], hwy: [14000, 0, 0], coast: [20000, 0, 0], gorge: [26000, 0, 0], plaza: [32000, 0, 0], space: [40000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'aerial', set: 'stad' },
  { t0: 3.4, t1: 9.4, cam: 'goal', set: 'stad' },
  { t0: 9.4, t1: 13.2, cam: 'fans', set: 'stad' },
  { t0: 13.2, t1: 16.4, cam: 'coffee', set: 'kit' },
  { t0: 16.4, t1: 18.0, cam: 'diver', set: 'pool' },
  { t0: 18.0, t1: 19.4, cam: 'judgesUp', set: 'pool' },
  { t0: 19.4, t1: 24.2, cam: 'hwy', set: 'hwy' },
  { t0: 24.2, t1: 29.0, cam: 'coast', set: 'coast' },
  { t0: 29.0, t1: 33.8, cam: 'bungee', set: 'gorge' },
  { t0: 33.8, t1: 38.6, cam: 'quito', set: 'plaza' },
  { t0: 38.6, t1: 43.4, cam: 'iss', set: 'space' },
  { t0: 43.4, t1: 48.6, cam: 'peak', set: 'stad' },
  { t0: 48.6, t1: 51.2, cam: 'fall', set: 'stad' },
  { t0: 51.2, t1: 53.6, cam: 'hwyR', set: 'hwy' },
  { t0: 53.6, t1: 56.0, cam: 'coastR', set: 'coast' },
  { t0: 56.0, t1: 57.8, cam: 'kitR', set: 'kit' },
  { t0: 57.8, t1: 61.2, cam: 'poolR', set: 'pool' },
  { t0: 61.2, t1: 69.4, cam: 'judges', set: 'pool' },
];
// return shots run physics time from τ = 5 at this rate (1 = real time)
const RATE = { fall: 1.0, hwyR: 0.8, coastR: 1.3, kitR: 0.9, poolR: 1.0, judges: 1.0 };
const START = { coastR: 0.4 };   // τ offset past 5 at the start of a return shot
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased); fov; amp = handheld drift
export const CAMS = {
  aerial: { p: [[-4, 21, 24], [2, 19, 21]], a: [[52, 6, 0], [53, 6, 0]], fov: 48, amp: 0.01 },
  goal:   { p: [[34.6, 1.7, 7.8], [38.4, 1.75, 6.6]], a: [[60, 5.0, -0.6], [60, 5.4, -0.6]], fov: 50, amp: 0.004 },
  fans:   { p: [[51.0, 1.3, 11.0], [52.6, 2.5, 9.6]], a: [[60, 3.8, 2.6], [60, 6.0, 2.4]], fov: 46, amp: 0.004 },
  coffee: { p: [[-1.02, 1.48, -0.18], [-0.84, 1.58, -0.4]], a: [[-0.5, 1.6, -1.5], [-0.47, 1.78, -1.5]], fov: 45, amp: 0.003 },
  diver:  { p: [[2.5, 3.6, 10.4], [-1.5, 3.9, 9.6]], a: [[-9.5, 6.4, 4.2], [-9.5, 7.6, 4.2]], fov: 52, amp: 0.004 },   // v2: wide + dolly: the whole busy pool under him
  hwy:    { p: [[5, 5.2, 22], [5, 5.0, 7]], a: [[11, 1.8, -60], [13, 1.8, -74]], fov: 50, amp: 0.006 },   // chase: moves with the slowed traffic
  coast:  { p: [[4, 40.5, 16], [3, 40.8, 14]], a: [[-6, 14, -80], [-6, 22, -80]], fov: 50, amp: 0.008 },
  bungee: { p: [[3.6, 3.2, -11.4], [3.7, 3.4, -11.6]], a: [[0, -25, -7.3], [0, 8, -7.3]], fov: 52, amp: 0.004 },
  quito:  { p: [[2.6, 0.3, 4.6], [3.2, 1.5, 8.2]], a: [[-1.0, 0.45, -0.6], [-0.6, 5.6, -3.2]], fov: 52, amp: 0.004 },
  iss:    { p: [[0.65, 0.25, 1.5], [-0.15, 0.45, 1.55]], a: [[-0.6, -0.55, -1.0], [-0.6, -0.5, -1.0]], fov: 50, amp: 0.002 },   // y is relative to the ISS orbit (ISSY)
  peak:   { p: [[44, 1.6, 8.0], [53.5, 9.5, 4.5]], a: [[60, 7.5, -1], [63, 12, -1.5]], fov: 54, amp: 0.004 },   // v2: crane up through the floating fans
  fall:   { p: [[53.5, 9.5, 4.5], [52.6, 7.8, 5.4]], a: [[63, 12, -1.5], [63, 3.2, -1.5]], fov: 56, amp: 0.004 },   // they fall past the lens
  hwyR:   { p: [[-3, 1.8, -214], [-3.4, 1.6, -215]], a: [[6, 4.0, -180], [6, 1.4, -190]], fov: 50, amp: 0.006 },
  coastR: { p: [[4, 40.8, 15], [4, 40.8, 15]], a: [[-6, 26, -80], [-6, 6, -80]], fov: 50, amp: 0.008 },
  kitR:   { p: [[-0.45, 1.6, 1.3], [-0.35, 1.5, 1.2]], a: [[0.4, 2.2, -0.9], [0.4, 0.95, -0.9]], fov: 52, amp: 0.003 },
  poolR:  { p: [[-1.4, 0.95, 7.6], [-1.7, 1.0, 7.3]], a: [[-8.0, 20, 2.5], [-6.0, 1.0, 2.5]], fov: 30, amp: 0.004 },
  judgesUp: { p: [[-6.0, 1.7, 5.75], [-6.15, 1.66, 6.1]], a: [[-6.2, 1.22, 8.15], [-6.2, 1.28, 8.15]], fov: 66, amp: 0.004 },   // v4: the judges' faces, looking up
  judges: { p: [[-9.0, 0.55, -0.6], [-9.3, 0.6, -1.2]], a: [[-6.2, 0.9, 7.4], [-6.2, 0.95, 7.4]], fov: 50, amp: 0.003 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (see CLAUDE.md: sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CHEER = A(-2.75, 0.4, -0.25, 0);
const FIST_B = A(-2.9, 0.15, -0.6, -0.2);
const OUT = A(-0.25, 1.3, -0.25, 0);
const OVER = A(-3.0, 0.1, -0.05, 0);                                      // diver: arms overhead
const CARD_A = A(-2.35, 0.25, -0.55, 0.2), CARD_B = A(-2.35, 0.25, -0.55, -0.2);
const PHONE_B = A(-1.4, 0.15, -1.35, -0.45);                              // holding a phone up to film
const MUG_B = (k) => A(lerp(-0.45, -0.85, k), 0.22, lerp(-1.45, -1.65, k), -0.55);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const flail = (t, ph = 0, k = 1) => A(-1.4 + 0.7 * k * Math.sin(t * 2.3 + ph), 0.9 + 0.35 * k * Math.sin(t * 1.7 + ph), -0.45 - 0.3 * Math.sin(t * 2.0 + ph), 0);
const wave = (t) => A(-2.45, 0.55 + 0.25 * Math.sin(t * 7), -0.55, -0.2);

// ---------------------------------------------------------------- physics helpers
/** A hop cycle that starts at h0 (speed v, ground time gt): [height, vertical speed] at real time t. */
function hopAt(t, h0, v, gt) { if (t < h0) return [0, 0]; const fl = 2 * v / G, T = fl + gt, u = (t - h0) % T; return u < fl ? [v * u - 0.5 * G * u * u, v - G * u] : [0, 0]; }
/** Height above its floor of a body that, at the switch, was at ys moving up at vs, at physics time tau (> 0).
 *  Up to τ = 5: straight line (descenders stop on the floor) + spin drift; after: ballistic until it lands. */
function floatY(tau, ys, vs, drift = 0) {
  const yAt = (tt) => (vs > 0 ? ys + vs * tt : Math.max(0, ys + vs * tt)) + 0.5 * drift * tt * tt;
  if (tau <= 5) return yAt(tau);
  const y5 = yAt(5), v5 = (vs > 0 ? vs : 0) + drift * 5, d = tau - 5;
  return Math.max(0, y5 + v5 * d - 0.5 * G * d * d);
}
const landAfter = (y5, v5) => (v5 + Math.sqrt(v5 * v5 + 2 * G * y5)) / G;   // seconds after τ = 5 until it lands

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob'];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xd9cdb4];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const HUD = story.hud.filter((h) => h.r0 !== undefined);
  /** physics time τ: real time before the switch (negative), the HUD clock during the 5 s, then per return shot */
  function tauAt(t, shot) {
    if (t < SW) return t - SW;
    if (t < BACK) { const s = HUD.find((h) => t >= h.r0 && t < h.r1); return s ? lerp(s.from, s.to, (t - s.r0) / (s.r1 - s.r0)) : 5; }
    const base = shot.cam === 'judges' ? SHOTS.find((s) => s.cam === 'poolR').t0 : shot.t0;
    return 5 + (START[shot.cam] ?? 0) + (t - base) * (RATE[shot.cam] ?? 1);
  }

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(10, 0);
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const hwy = buildHighway(studio, {}); hwy.root.position.set(...OFF.hwy);
  const coast = buildCoast(studio, {}); coast.root.position.set(...OFF.coast);
  const gorge = buildGorge(studio, {}); gorge.root.position.set(...OFF.gorge);
  const plaza = buildPlaza(studio, {}); plaza.root.position.set(...OFF.plaza);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ROOTS = { stad: stad.root, kit: kit.root, pool: pool.root, hwy: hwy.root, coast: coast.root, gorge: gorge.root, plaza: plaza.root, space: space.root };
  const FOGS = { stad: stad.fog, kit: null, pool: pool.fog, hwy: hwy.fog, coast: coast.fog, gorge: gorge.fog, plaza: plaza.fog, space: null };
  const FAR = { stad: 950, kit: 40, pool: 300, hwy: 1550, coast: 1500, gorge: 1500, plaza: 1100, space: 6000 };
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- shared FX: water blobs, coffee, confetti, dust
  const blobGeo = new THREE.SphereGeometry(1, 16, 12);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x9fd8f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x1a4a66, emissiveIntensity: 0.35 });
  const blobs = new THREE.InstancedMesh(blobGeo, waterM, 420); blobs.frustumCulled = false; blobs.castShadow = false; scene.add(blobs);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3();
  let nb = 0;
  const blob = (p, r, t = 0, ph = 0) => { if (nb >= 420 || r < 0.004) return; const w = 0.14 * Math.sin(t * 5 + ph); S3.set(r * (1 + w), r * (1 - w * 0.8), r * (1 + w * 0.4)); M4.compose(p, Q4.setFromEuler(E3.set(ph, ph * 2, 0)), S3); blobs.setMatrixAt(nb++, M4); };
  const blobsDone = () => { blobs.count = nb; blobs.instanceMatrix.needsUpdate = true; };
  const confM = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 });
  const CONF = 700, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.05), confM, CONF); conf.frustumCulled = false; conf.castShadow = false; scene.add(conf);
  const CR = rng(77), confSeeds = Array.from({ length: CONF }, () => ({ t0: 7.7 + CR() * 0.4, x: 58.6 + CR() * 4, z: -9 + CR() * 18, y: 1.5 + CR() * 2.5, vx: -1 - CR() * 3, vy: 3 + CR() * 5, vz: (CR() - 0.5) * 3, s: CR() * 9, w: 2 + CR() * 6 }));
  confSeeds.forEach((c, i) => conf.setColorAt(i, new THREE.Color([0xc8302c, 0xffffff, 0xc8302c, 0xf2c14e][i % 4])));
  const puffs = makeSpritePool(scene, 48, 'smoke'), puffC = new THREE.Color(0xe8e2d8), spray = new THREE.Color(0xffffff), dirtC = new THREE.Color(0xc9b48e);

  // ---------------------------------------------------------------- cast
  const R = rng(17);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); scene.add(p.root); all.push(p); p.root.visible = false; return p; };
  const general = Array.from({ length: 16 }, () => { const st = pick(STYLES); return person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: st, glasses: R() < 0.2, mustache: st !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null }); });
  // stadium: rig fans in the two front rows behind the goal (instanced fans hidden there)
  const east = stad.stands.east;
  const seats = east.fans.filter((f) => f.row <= 1 && Math.abs(f.z) < 7.2).sort((a, b) => a.row - b.row || Math.abs(a.z) - Math.abs(b.z)).slice(0, 40);
  const seatSet = new Set(seats.map((f) => f.i));
  east.hide((f) => seatSet.has(f.i));
  const fanRigs = seats.map((f, k) => { const p = person({ skin: pick(SKINS), top: k % 3 ? 0xc8302c : 0xf2f2f2, collar: k % 3 ? 0xf2f2f2 : 0xc8302c, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: pick(STYLES), glasses: R() < 0.15 }); p.seat = f; return p; });
  const striker = person({ skin: 0xc98e6a, top: 0xc8302c, collar: 0xf2f2f2, pants: 0xf2f2f2, shoes: 0x1a1a1a, hair: 0x1a1a1a, hairStyle: 'short' });
  const keeper = person({ skin: 0xf1c3a1, top: 0x58b368, collar: 0x1a1a1a, pants: 0x1a1a1a, shoes: 0x1a1a1a, hair: 0x9a6a3a, hairStyle: 'messy' });
  const players = [0xc8302c, 0x2f5fb3, 0x2f5fb3, 0xc8302c, 0x2f5fb3, 0xc8302c].map((c) => person({ skin: pick(SKINS), top: c, collar: 0xf2f2f2, pants: c === 0xc8302c ? 0xf2f2f2 : 0x1d2a3a, shoes: 0x1a1a1a, hair: pick(HAIRS), hairStyle: 'short' }));
  const snappers = [0, 1, 2].map(() => person({ skin: pick(SKINS), top: 0xf2c14e, pants: 0x2f3a4a, hair: pick(HAIRS), hairStyle: 'short' }));
  const lens = snappers.map((p) => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.14, 0.1, 0.1), mat(0x1a1a1a, 0.4), g, 0, 0, 0); const l = mk(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 12), mat(0xe9e6e0, 0.4), g, 0, 0, 0.22); l.rotation.x = PI / 2; p.arms.find((a) => a.s === 1).hand.add(g); g.position.set(0, -0.05, 0.08); return g; });
  // kitchen
  const dad = person({ skin: 0xe2ad8c, top: 0x7a5aa8, collar: 0xf2e6cf, pants: 0x45607a, shoes: 0x8a6a48, hair: 0x5a3a24, hairStyle: 'messy', mustache: 0x4a2e1c });
  const mom = person({ skin: 0xc98e6a, top: 0x4fb3a8, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const grandpa = person({ skin: 0xf1c3a1, top: 0x6a8a5a, collar: 0xf2f2f2, pants: 0x6b5a48, hair: 0xd9d9d9, hairStyle: 'short', glasses: true, mustache: 0xd9d9d9 });
  const mug = makeMug(0xf2f2f2); mug.scale.setScalar(1.15); dad.arms.find((a) => a.s === 1).hand.add(mug); mug.position.set(0, -0.06, 0.05);
  const mugCoffee = mug.children[1];
  const coffeeM = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.08, metalness: 0.1, emissive: 0x1a0c04 });
  const coffee = new THREE.Mesh(blobGeo, coffeeM); coffee.castShadow = true; scene.add(coffee);
  const toast = [0, 1].map(() => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.11, 0.12, 0.015), mat(0xd9a45a, 0.9), g, 0, 0, 0); mk(new THREE.BoxGeometry(0.115, 0.125, 0.012), mat(0x9a6a2a, 0.9), g, 0, 0.002, 0); kit.root.add(g); return g; });
  mk(new THREE.BoxGeometry(0.26, 0.16, 0.15), mat(0xd8dce0, 0.3, { metalness: 0.5 }), kit.root, KD.table[0] + 0.45, KD.tableTop + 0.08, KD.table[1] - 0.15); mk(new THREE.BoxGeometry(0.03, 0.03, 0.03), mat(0x2a2d31, 0.4), kit.root, KD.table[0] + 0.59, KD.tableTop + 0.06, KD.table[1] - 0.15);   // a toaster in shot
  const dog = makeDog(); kit.root.add(dog.g);
  const fan = makeCeilingFan(); kit.root.add(fan.g); fan.g.position.set(-1.7, KD.room.h, 1.2);
  kit.root.children.filter((o) => o.isMesh && Math.abs(o.position.x - KD.table[0]) < 0.01 && Math.abs(o.position.z - KD.table[1]) < 0.01 && o.position.y > 1.6).forEach((o) => (o.visible = false));   // pendant shade + cord
  // pool
  const diver = person({ skin: 0xe2ad8c, top: 0xe2ad8c, pants: 0x2f5fb3, shoes: 0xe2ad8c, hair: 0x2a1d16, hairStyle: 'short' });
  const swimmers = [0, 1, 2, 3].map((k) => person({ skin: pick(SKINS), top: pick(SKINS), pants: pick([0xd2483f, 0x2f5fb3, 0x1a1a1a]), hair: pick(HAIRS), hairStyle: k % 2 ? 'bob' : 'short' }));
  const cannon = person({ skin: 0xf1c3a1, top: 0xf1c3a1, pants: 0xf2b632, hair: 0x9a6a3a, hairStyle: 'messy', headR: 0.17 });
  const judges = [0, 1, 2].map((k) => person({ skin: pick(SKINS), top: [0x2f3a4a, 0x1d2a3a, 0x3a3d42][k], collar: 0xf4f4f2, pants: 0x2f3a4a, hair: pick(HAIRS), hairStyle: ['short', 'bob', 'none'][k], glasses: k === 2 }));
  const cardT = canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d2a3a'; g.font = 'bold 74px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', w / 2, h / 2 + 4); });
  const cards = judges.map((p) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.6, side: THREE.DoubleSide })); scene.add(c); c.visible = false; return c; });
  // pool dressing: 3 m springboard + judges' table
  { const g = new THREE.Group(); g.position.set(-14.6, 0, 2.5); pool.root.add(g);
    mk(new THREE.BoxGeometry(1.4, 2.9, 1.4), mat(0xe9e6e0, 0.8), g, 0, 1.45, 0);
    const board = mk(new THREE.BoxGeometry(4.6, 0.09, 0.52), mat(0x2f6aa8, 0.5), g, 2.0, 3.0, 0); void board;
    mk(new THREE.BoxGeometry(4.5, 0.02, 0.5), mat(0xf2f2f2, 0.8), g, 2.0, 3.05, 0);
    for (const z of [-0.45, 0.45]) { mk(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), mat(0xd8dce0, 0.2, { metalness: 0.8 }), g, -0.4, 3.5, z); mk(new THREE.BoxGeometry(1.2, 0.04, 0.04), mat(0xd8dce0, 0.2, { metalness: 0.8 }), g, 0.2, 4.0, z); }
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.5), new THREE.MeshStandardMaterial({ map: canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#1d2a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c14e'; c.font = 'bold 52px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3 m', w / 2, h / 2 + 3); }) })); sb.position.set(0.71, 2.3, 0); sb.rotation.y = PI / 2; g.add(sb); }
  const jt = new THREE.Group(); jt.position.set(-6.2, 0, 7.6); pool.root.add(jt);
  mk(new THREE.BoxGeometry(3.2, 0.06, 0.8), mat(0xf4f1ea, 0.6), jt, 0, 0.74, 0); mk(new THREE.BoxGeometry(3.2, 0.7, 0.04), mat(0x2f6aa8, 0.6), jt, 0, 0.38, -0.38);
  const jban = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.5), new THREE.MeshStandardMaterial({ map: canvasTex(512, 84, (c, w, h) => { c.fillStyle = '#2f6aa8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 48px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('JUDGES', w / 2, h / 2 + 3); }) })); jban.position.set(0, 0.4, -0.41); jban.rotation.y = PI; jt.add(jban);
  for (let k = 0; k < 3; k++) { const c = new THREE.Group(); c.position.set(-1.0 + k, 0, 0.55); jt.add(c); mk(new THREE.BoxGeometry(0.44, 0.05, 0.44), mat(0x3a3d42, 0.6), c, 0, 0.45, 0); mk(new THREE.BoxGeometry(0.44, 0.5, 0.05), mat(0x3a3d42, 0.6), c, 0, 0.72, 0.22); }
  // highway: cars + a semi
  const CARC = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0xe9e6e0, 0x2a2d31, 0x6fa84f, 0x8f6fb8, 0xb8bcc2, 0xe08a3a, 0x4fb3a8, 0xc8302c, 0x1d3f73];
  const carSpecs = [
    { off: 4.25, s0: -38 }, { off: 7.95, s0: -18 }, { off: 4.25, s0: 2 }, { off: 7.95, s0: 20 }, { off: 4.25, s0: 34 }, { off: 7.95, s0: 52 },
    { off: 4.25, s0: 70 }, { off: 7.95, s0: -62 }, { off: -4.25, s0: 60, nb: true }, { off: -7.95, s0: 30, nb: true }, { off: -4.25, s0: 4, nb: true }, { off: -7.95, s0: -26, nb: true },
  ];
  const VCAR = 31;
  const cars = carSpecs.map((c, i) => { const car = makeCar(CARC[i % CARC.length], i + 3); hwy.root.add(car.g); const f = HD.frame(c.s0, c.off), h = f.head + (c.nb ? PI : 0); const vx = Math.sin(h) * VCAR, vz = Math.cos(h) * VCAR; const sp = (R() - 0.5) * 0.25; return { ...c, car, x0: f.x, z0: f.z, head: h, vx, vz, spin: sp, roll: (R() - 0.5) * 0.3 }; });
  const semi = (() => { const g = new THREE.Group(); hwy.root.add(g); mk(new THREE.BoxGeometry(2.5, 2.9, 13), mat(0xf4f4f2, 0.6), g, 0, 2.5, -2.5); mk(new THREE.BoxGeometry(2.4, 2.6, 2.6), mat(0xc8302c, 0.5), g, 0, 2.0, 5.6); mk(new THREE.BoxGeometry(2.3, 1.0, 0.05), mat(0x1d2633, 0.2), g, 0, 2.6, 6.92);
    for (const z of [5.6, -4, -7.5]) for (const x of [-1.15, 1.15]) { const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), mat(0x1c1c1e, 0.8), g, x, 0.5, z); w.rotation.z = PI / 2; }
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.4), new THREE.MeshStandardMaterial({ map: canvasTex(512, 80, (c, w, h) => { c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f5fb3'; c.font = 'bold 56px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LONE STAR FREIGHT', w / 2, h / 2 + 3); }) })); lg.position.set(-1.27, 2.8, -2.5); lg.rotation.y = -PI / 2; g.add(lg);
    const f = HD.frame(-6, -4.25), h = f.head + PI; return { g, x0: f.x, z0: f.z, head: h, vx: Math.sin(h) * 27, vz: Math.cos(h) * 27, spin: 0.04, roll: 0.05, semi: true }; })();
  // coast: gull flock
  const gullM = mat(0xf4f4f2, 0.7), gulls = Array.from({ length: 9 }, (_, i) => { const g = new THREE.Group(); coast.root.add(g); mk(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), gullM, g, 0, 0, 0).rotation.x = PI / 2; const wl = new THREE.Group(), wr = new THREE.Group(); g.add(wl, wr); mk(new THREE.BoxGeometry(0.7, 0.02, 0.22), gullM, wl, -0.35, 0, 0); mk(new THREE.BoxGeometry(0.7, 0.02, 0.22), gullM, wr, 0.35, 0, 0); return { g, wl, wr, x: -20 + i * 7 + (i % 3) * 3, y: 46 + (i % 4) * 3, z: -40 - i * 6 }; });
  // gorge: bungee jumper + crew + cord
  const jumper = person({ skin: 0xd9a37f, top: 0xe08a3a, pants: 0x2f3a4a, hair: 0x2a1d16, hairStyle: 'short' });
  const crew = [0, 1].map(() => person({ skin: pick(SKINS), top: 0xf2c14e, pants: 0x2f3a4a, hair: pick(HAIRS), hairStyle: 'short' }));
  const cordM = mat(0x2f5fb3, 0.6); let cordMesh = null;
  // plaza: a jumping kid, pigeons
  const kid = person({ skin: 0xc98e6a, top: 0xf2b632, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'messy', headR: 0.175 });
  const phone = makePhone(); general[3].arms.find((a) => a.s === 1).hand.add(phone.g); phone.g.position.set(0, -0.05, 0.04); phone.g.rotation.set(PI / 2, 0, 0);
  const pigeonM = mat(0x8a8f9a, 0.8), pigeons = Array.from({ length: 8 }, (_, i) => { const g = new THREE.Group(); plaza.root.add(g); mk(new THREE.SphereGeometry(0.12, 10, 8), pigeonM, g, 0, 0, 0).scale.set(1, 0.9, 1.5); mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0x6a7080, 0.8), g, 0, 0.08, 0.14); const wl = new THREE.Group(), wr = new THREE.Group(); g.add(wl, wr); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wl, -0.14, 0, 0); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wr, 0.14, 0, 0); return { g, wl, wr, x: -4 + i * 1.3, z: -3 - (i % 3) * 1.5, v: 0.6 + (i % 4) * 0.35 }; });
  // space: ISS + an astronaut on a tether
  const iss = makeISS(); space.root.add(iss.g); iss.g.scale.setScalar(0.3);
  const ISSY = space.R + 28;
  iss.g.position.set(1.0, ISSY - 3.2, -13); iss.g.rotation.set(0.1, 0.35, 0.04);
  const astro = person({ skin: 0xe2ad8c, top: 0xf4f4f2, pants: 0xf4f4f2, shoes: 0xdcdcdc, hair: 0x5a3a24, hairStyle: 'short' });
  mk(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05 }), astro.head.g, 0, 0, 0.01);
  const visor = mk(new THREE.SphereGeometry(0.19, 20, 14, -PI * 0.4, PI * 0.8, PI * 0.25, PI * 0.45), new THREE.MeshStandardMaterial({ color: 0xd8a84a, metalness: 0.9, roughness: 0.15, transparent: true, opacity: 0.45 }), astro.head.g, 0, 0, 0.012); visor.rotation.y = 0; void visor;
  mk(new THREE.BoxGeometry(0.42, 0.5, 0.2), mat(0xe9e6e0, 0.6), astro.spine, 0, 0.3, -0.2);
  const astroG = new THREE.Group(); space.root.add(astroG); astroG.add(astro.root); astroG.scale.setScalar(0.3);
  const tether = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), 8, 0.006, 4), mat(0xf2f2f2, 0.6)); space.root.add(tether);

  // ---------------------------------------------------------------- per-fan physics (east stand, instanced + rigs)
  const FR = rng(99), GOAL = 7.6;
  const fanP = east.fans.map((f) => { const jumper = FR() < 0.62, d = 0.12 + FR() * 0.35, v = 2.2 + FR() * 0.6, gt = 0.12 + FR() * 0.14; const [ys, vs] = jumper ? hopAt(SW, GOAL + d, v, gt) : [0, 0]; return { jumper, d, v, gt, ys, vs, ph: FR() * 6 }; });
  const fanY = (k, t, tau) => { const q = fanP[k]; if (t < SW) return q.jumper ? hopAt(t, GOAL + q.d, q.v, q.gt)[0] : 0; return floatY(tau, q.ys, q.vs, DRIFT_LON); };
  // rig fans get their own params (a few guaranteed risers so the closeup has heroes)
  const rigP = fanRigs.map((p, k) => { const jumper = k % 3 !== 2, d = 0.15 + ((k * 0.137) % 0.3), v = 2.4 + ((k * 0.211) % 0.4), gt = 0.15; let [ys, vs] = jumper ? hopAt(SW, GOAL + d, v, gt) : [0, 0]; if (jumper && vs <= 0.3 && k % 2 === 0) { ys = 0.12; vs = 1.4 + (k % 5) * 0.3; } return { jumper, d, v, gt, ys, vs }; });
  const rigY = (k, t, tau) => { const q = rigP[k]; if (t < SW) return q.jumper ? hopAt(t, GOAL + q.d, q.v, q.gt)[0] : 0; return floatY(tau, q.ys, q.vs, DRIFT_LON); };

  // ---------------------------------------------------------------- helpers
  /** pose a rig: (x,z) local to the set; y = root height above `floor` (local meters); tilt rx/rz after the pose */
  function put(rig, key, p, y = 0, floor = 0, rx = 0, rz = 0) {
    p.x += OFF[key][0]; p.z += OFF[key][2]; p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1];
    applyPose(rig, p); rig.root.rotation.x = rx; if (rz) rig.root.rotation.z = rz; rig.root.visible = true;
  }
  const dust = (base, key, x, y, z, t, at, n = 6, size = 1.6, col = puffC) => { const age = t - at; if (age < 0 || age > 1.6) return; for (let k = 0; k < n; k++) { const a = k * 2.4 + base, r = 0.3 + age * 2.2; puffs.set((base + k) % 48, W(key, x + Math.cos(a) * r, y + 0.3 + age * 0.8 * (k % 3) * 0.5, z + Math.sin(a) * r), size * (0.6 + age), 0.75 * (1 - age / 1.6), col); } };
  let shake = [0, 0];
  const jolt = (t, at, k0 = 0.03) => { if (t > at && t < at + 0.6) { const k = k0 * Math.exp(-(t - at) * 7); shake = [shake[0] + k * Math.sin(t * 71), shake[1] + k * Math.sin(t * 53)]; } };

  // ---------------------------------------------------------------- STADIUM
  const BALL = new THREE.Group(); { const bt = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((i % 5) * 32 + (i > 4 ? 16 : 0), i > 4 ? 46 : 18, 8, 0, 7); g.fill(); } }); mk(new THREE.SphereGeometry(0.11, 20, 14), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.5 }), BALL, 0, 0, 0); stad.root.add(BALL); }
  const KICK = 7.2, NET = GOAL;
  const B0 = [40.6, 0.11, -3.2], B1 = [52.45, 2.0, 2.6];
  function ballAt(t, tau) {
    if (t < KICK) return [B0[0] - 0.5 + (t - 6.0) * 0.9, 0.11, B0[2] - 2.5 + (t - 6.0) * 2.0];
    if (t < NET) { const u = (t - KICK) / (NET - KICK); return [lerp(B0[0], B1[0], u), lerp(B0[1], B1[1], u) + 0.6 * Math.sin(u * PI), lerp(B0[2], B1[2], u)]; }
    if (t < SW) { const u = clamp((t - NET) / 0.25); return [B1[0] + 0.75 * Math.sin(u * PI / 2), B1[1] - 0.25 * u, B1[2]]; }
    const tt = Math.min(tau, 5), base = [B1[0] + 0.75 - 2.5 * tt, B1[1] - 0.25 + 0.8 * tt, B1[2] - 0.3 * tt];
    if (tau <= 5) return base;
    const d = tau - 5, y = Math.max(0.11, base[1] + 0.8 * d - 0.5 * G * d * d); return [base[0] - 2.5 * d, y, base[2] - 0.3 * d];
  }
  const strikerXZ = (t) => { const u = clamp(t / KICK); return [lerp(22, 40.3, u), lerp(-12, -3.4, u)]; };
  function strikerPose(t, tau) {
    const p = basePose(); p.eyes = blink(t, 1);
    if (t < KICK) { const u = clamp(t / KICK); p.x = lerp(22, 40.3, u); p.z = lerp(-12, -3.4, u); p.rotY = Math.atan2(18.3, 8.6); p.dist = u * 20.2; p.speed = 3.2; p.armA = REST; p.armB = REST; return { p, y: 0 }; }
    if (t < 7.45) { p.x = 40.3; p.z = -3.4; p.rotY = Math.atan2(12, 6); p.footFwd = 0.35 * Math.sin(clamp((t - KICK) / 0.25) * PI); p.lean = -0.15; p.armA = OUT; p.armB = OUT; return { p, y: 0 }; }
    // run toward the home end, then leap with a fist up at 8.05
    const u = clamp((t - 7.45) / 0.6); const x = lerp(40.3, 46.2, u), z = lerp(-3.4, 4.6, u);
    if (t < 8.05) { Object.assign(p, { x, z, rotY: Math.atan2(5.9, 8.0), dist: u * 9.9, speed: 9 }); p.armA = REST; p.armB = mixArm(REST, FIST_B, u); return { p, y: 0 }; }
    // airborne: real-time leap until the switch, then straight up at 2.5 m/s (+ a slow celebratory spin)
    const ys = 4.0 * (SW - 8.05) - 0.5 * G * (SW - 8.05) ** 2, vs = 4.0 - G * (SW - 8.05);
    const y = t < SW ? 4.0 * (t - 8.05) - 0.5 * G * (t - 8.05) ** 2 : floatY(tau, ys, vs, DRIFT_LON);
    Object.assign(p, { x: 46.2 + 0.25 * Math.max(0, Math.min(tau, 5)), z: 4.6, rotY: Math.atan2(5.9, 8.0) + (t > SW ? 0.22 * Math.min(tau, 6) : 0), footFwd: 0.2, lean: -0.1 });
    p.armA = t > SW ? flail(t, 0.5, 0.6) : OUT; p.armB = FIST_B; p.mouth = 'o';
    return { p, y, floor: y - 0.12 };
  }
  function keeperPose(t, tau) {
    const p = basePose(); p.eyes = blink(t, 2);
    const dv = clamp((t - 7.25) / 0.6);
    if (t < 7.25) { Object.assign(p, { x: 52.0, z: 0.2 * Math.sin(t * 2), rotY: -PI / 2, crouch: 0.12, lean: 0.25 }); p.armA = A(-0.6, 0.6, -0.5, 0.3); p.armB = A(-0.6, 0.6, -0.5, -0.3); return { p, y: 0, rz: 0 }; }
    if (t < SW) { Object.assign(p, { x: 52.0, z: lerp(0, 2.4, dv), rotY: -PI / 2 }); p.armA = OVER; p.armB = OVER; const h = 0.9 * Math.sin(dv * PI) + 0.25 * (1 - dv); return { p, y: h, floor: h - 0.2, rz: -1.35 * Math.min(1, dv * 1.6) }; }
    // lying on the grass, then (τ ≈ 1) he tries to stand: the push launches him up at 0.8 m/s
    const up = clamp((tau - 0.9) / 0.4), y = tau > 0.9 ? floatY(tau - 0.9, 0.0, 0.8, 0) : 0;
    Object.assign(p, { x: 52.0, z: 2.4, rotY: -PI / 2 + 0.25 * Math.max(0, tau - 1) }); p.armA = flail(t, 1.2, up); p.armB = flail(t, 2.5, up); p.mouth = up > 0.2 ? 'o' : 'flat';
    return { p, y: 0.25 + y, floor: 0.25 + y - 0.1, rz: lerp(-1.35, -0.3, up) };
  }
  function playerPose(t, i) { // attackers/defenders running at the home end before the goal
    const p = basePose(); p.eyes = blink(t, i + 4);
    const lanes = [[26, -14], [24, 8], [30, -2], [20, 14], [33, 6], [18, -6]], [x0, z0] = lanes[i];
    const run = Math.min(t, GOAL) * (5.2 + i * 0.3), x = x0 + run * 0.28, z = z0 + Math.sin(i + t * 0.3) * 1.2;
    Object.assign(p, { x: Math.min(x, 47), z, rotY: PI / 2 - 0.2 + i * 0.07, dist: run, speed: t < GOAL ? 5 : 0 });
    if (i === 1 || i === 2) { // two defenders chase the striker's run (v2: motion + faces in the tracking shot)
      const [sx, sz] = strikerXZ(Math.min(t, KICK + 0.3)), off = i === 1 ? [-1.3, -1.5] : [0.6, 1.7];
      Object.assign(p, { x: sx + off[0], z: sz + off[1], rotY: Math.atan2(18.3, 8.6) + (i === 1 ? 0.15 : -0.1), dist: t * 2.8, speed: t < KICK + 0.3 ? 6 : 0 });
    }
    if (t > GOAL) { p.armA = i % 2 ? CHEER : REST; p.armB = i % 2 ? CHEER : REST; p.rotY = PI / 2; }
    return p;
  }
  let lastScore = '1 – 1';
  function stadium(t, tau, cam) {
    stad.aimSun(48, 0, 26);
    const sc = t > NET + 0.4 ? '2 – 1' : '1 – 1'; if (sc !== lastScore) { stad.setScore(sc); lastScore = sc; }
    // instanced fans: hop before the switch, then float/land; non-jumpers sway (arms up)
    const look = t > SW ? 1 : 0;
    for (let k = 0; k < east.fans.length; k++) {
      if (east.hidden.has(k)) continue;
      let y = fanY(k, t, tau); const q = fanP[k];
      let tilt = 0;
      if (t >= BACK) { const y5 = floatY(5, q.ys, q.vs, DRIFT_LON), v5 = (q.vs > 0 ? q.vs : 0) + DRIFT_LON * 5, dl = landAfter(y5, v5), since = tau - 5 - dl; if (since > 0 && y5 > 0.5) { y = -0.25 * Math.exp(-since * 4); tilt = 0.5 * Math.min(1, since * 4) * (q.ph > 3 ? 1 : -1); } }
      if (t < GOAL) { y += 0.09 * Math.abs(Math.sin(t * 3.4 + q.ph)); tilt += 0.1 * Math.sin(t * 1.7 + q.ph); } else if (!q.jumper && t < SW) y += 0.04 * Math.abs(Math.sin(t * 9 + q.ph));
      east.setFan(k, y, tilt + (look && y > 0.3 ? 0.25 * Math.sin(t * 0.8 + q.ph) : 0), t < GOAL ? PI + 0.3 * Math.sin(t * 0.9 + q.ph) : null);
    }
    east.commit();
    // rig fans
    fanRigs.forEach((rig, k) => {
      const f = rig.seat, q = rigP[k], p = basePose(); p.eyes = blink(t, k);
      let y = rigY(k, t, tau), rx = 0, rz = 0;
      Object.assign(p, { x: f.x, z: f.z, rotY: -PI / 2 + ((k * 0.37) % 0.5 - 0.25) });
      if (t < GOAL) { p.armA = k % 4 ? REST : A(-0.5, 0.2, -1.6, 0.6); p.armB = k % 3 ? REST : A(-0.5, 0.2, -1.6, -0.6); p.mouth = 'flat'; p.headYaw = 0.2 * Math.sin(t * 1.3 + k); }
      else if (t < SW) { p.armA = CHEER; p.armB = CHEER; p.mouth = 'o'; }
      else if (y > 0.35) { p.armA = flail(t, k, 0.8); p.armB = flail(t, k + 2, 0.8); p.mouth = 'o'; p.headPitch = 0.45; rx = 0.15 * Math.sin(t * 0.7 + k); }
      else { p.armA = k % 2 ? CHEER : A(-0.9, 0.3, -1.6, 0.6); p.armB = A(-2.2, 0.5, -0.4, 0); p.mouth = 'o'; p.headPitch = -0.55; }
      if (t >= BACK) { const y5 = floatY(5, q.ys, q.vs, DRIFT_LON), v5 = (q.vs > 0 ? q.vs : 0) + DRIFT_LON * 5, since = tau - 5 - landAfter(y5, v5); if (since > 0 && y5 > 0.5) { p.crouch = 0.3 * Math.exp(-since * 2); p.lean = 0.5; p.armA = OUT; p.armB = OUT; p.headPitch = 0.3; p.mouth = 'o'; } }
      const floor = t >= SW && y > 0.35 ? f.y + y - 0.15 : f.y + Math.max(0, y);
      put(rig, 'stad', p, f.y + y, floor, rx, rz);
    });
    // players + striker + keeper + photographers
    if (cam === 'aerial' || cam === 'goal') players.forEach((pl, i) => { if (cam === 'goal' && i > 3) return; put(pl, 'stad', playerPose(t, i)); });
    { const s = strikerPose(t, tau); put(striker, 'stad', s.p, s.y, s.floor ?? s.y); if (t > SW) striker.root.rotation.x = 0.35 * Math.sin(tau * 0.8); }
    { const s = keeperPose(t, tau); put(keeper, 'stad', s.p, s.y, s.floor ?? s.y, 0, s.rz); }
    snappers.forEach((sn, i) => { const p = basePose(); p.eyes = blink(t, i + 7); Object.assign(p, { x: 55.2, z: [-5.6, -7.2, 6.4][i], rotY: -PI / 2 + [0.3, 0.2, -0.3][i], crouch: 0.42, lean: 0.35, footFwd: 0.3 }); const up = t > SW ? clamp((tau - 0.6) / 0.5) : 0; p.armA = A(-1.3, 0.1, -1.4, 0.5); p.armB = mixArm(A(-1.25, 0.1, -1.5, -0.5), A(-2.0, 0.1, -1.0, -0.4), up); p.headPitch = -0.6 * up; put(sn, 'stad', p); });
    // ball + net
    const b = ballAt(t, tau); BALL.position.set(...b); BALL.rotation.set(t * 3, t * 2, 0); BALL.visible = true;
    const dent = t < NET ? 0 : t < SW ? 0.75 * Math.sin(clamp((t - NET) / 0.25) * PI / 2) : 0.75 * Math.exp(-tau * 4) * Math.cos(tau * 18);
    stad.setBulge(dent, B1[1] - 0.1, B1[2]);
    // confetti: thrown at the goal, drag + gravity in real time; after the switch drag alone stops it (it hangs); falls slowly after
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
    const kd = 6, vT = 1.0;
    confSeeds.forEach((c, i) => {
      const realEnd = Math.min(t, SW), a0 = realEnd - c.t0;
      let x = c.x, y = -50, z = c.z;
      if (a0 > 0) {
        const e = Math.exp(-kd * a0), fx = (1 - e) / kd;
        x = c.x + c.vx * fx; z = c.z + c.vz * fx; y = c.y + (c.vy + vT) * fx - vT * a0;   // vertical: terminal −vT
        if (t > SW) { const vx = c.vx * e, vz = c.vz * e, vy = (c.vy + vT) * e - vT, tt = Math.min(tau, 5), ee = (1 - Math.exp(-kd * tt)) / kd; x += vx * ee; y += vy * ee; z += vz * ee; if (tau > 5) y -= vT * (tau - 5) * 0.8; }
        y = Math.max(y, 0.05);
      }
      v3.set(x, y, z); q4.setFromEuler(e3.set(c.s + t * c.w * (t > SW && t < BACK ? 0.12 : 1), c.s * 2 + t * 1.3, c.s)); m4.compose(v3, q4, s3); conf.setMatrixAt(i, m4);
    });
    conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true; conf.visible = true;
    // the return: a wave of landings → dust + shake
    if (t >= BACK) { for (let k = 0; k < 8; k++) dust(k * 3, 'stad', 59 + (k % 4) * 2.5, SD.rowY(2 + (k % 4) * 3), -6 + k * 1.8, tau, 6.15 + (k % 5) * 0.12, 3, 2.2); jolt(tau, 6.2, 0.05); jolt(tau, 6.55, 0.03); }
  }

  // ---------------------------------------------------------------- KITCHEN
  const MUG0 = 1.12, MUG1 = 1.3, LIFT0 = 7.85, VCUP = 0.35;   // dad lifts the mug (real time) and stops it at τ≈0.15
  const mugY = (t, tau) => { if (t < LIFT0) return MUG0; if (t < SW) return lerp(MUG0, MUG0 + VCUP * (SW - LIFT0), (t - LIFT0) / (SW - LIFT0)); return MUG0 + VCUP * (SW - LIFT0) + VCUP * 0.15 * clamp(tau / 0.15) * (2 - clamp(tau / 0.15)) * 0.5; };
  void MUG1;
  function kitchen(t, tau, cam) {
    fan.update(t, 0);
    // v3: a family breakfast table (three faces looking up). Dad sits at the back chair facing the camera, mug in his right hand.
    kit.chairs[3].visible = false;   // the front chair would sit between the orbiting camera and the table
    const [TX, TZ] = KD.table;
    const p = basePose(); p.eyes = blink(t, 3); Object.assign(p, { x: TX, z: TZ - 0.7, rotY: 0, footFwd: 0.42 });
    const my = mugY(t, tau), lift = clamp((my - MUG0) / 0.3);
    p.armB = A(lerp(-0.5, -0.75, lift), lerp(0.55, 0.75, lift), lerp(-1.25, -1.45, lift), -0.25); p.armA = A(-0.75, 0.15, -1.2, 0.5);
    p.headPitch = -0.1 - 0.45 * clamp(tau / 2.0); p.mouth = tau > 0.4 ? 'o' : 'smile';
    const coffeeTop = 2.52, tableY = KD.tableTop + 0.02;
    let cy, splat = 0;
    const handY = () => { applyPose(dad, { ...p, x: p.x + OFF.kit[0], z: p.z + OFF.kit[2], y: -0.325, floor: 0 }); dad.root.updateMatrixWorld(true); return mug.getWorldPosition(new THREE.Vector3()); };
    const mw = handY();
    const yS = mw.y + 0.07;
    if (t < SW) cy = yS; else cy = Math.min(coffeeTop, yS + VCUP * Math.max(0, Math.min(tau, 5)));
    if (t >= BACK) { // gravity back: the puddle on the ceiling falls onto the table in front of him
      const d = tau - 5; cy = Math.max(tableY, coffeeTop - 0.5 * G * d * d); splat = cy <= tableY + 0.001 ? clamp((tau - 5 - Math.sqrt(2 * (coffeeTop - tableY) / G)) / 0.25) : 0;
      p.headPitch = splat > 0 ? 0.35 : -0.55; p.mouth = 'o'; if (splat > 0) p.eyes = 'closed';
    }
    put(dad, 'kit', p, -0.325, 0);
    mugCoffee.visible = t < SW || tau < 0.25;
    const sep = t < SW ? 0 : clamp((tau - 0.05) / 0.4), atCeil = cy >= coffeeTop - 0.001;
    coffee.visible = sep > 0.01 || t >= BACK; coffee.position.set(mw.x, cy, mw.z);
    const w = 0.12 * Math.sin(t * 4.2);
    if (t >= BACK && splat > 0) coffee.scale.set(0.16 + 0.07 * splat, 0.02, 0.16 + 0.07 * splat), coffee.position.y = tableY + 0.01;
    else if (atCeil) coffee.scale.set(0.11, 0.025, 0.11), coffee.position.y = coffeeTop + 0.05;
    else coffee.scale.set(0.055 * (1 + w), 0.055 * (1 - w) * (1 + 0.6 * (1 - sep)), 0.055 * (1 + w * 0.5));
    // toast: popped from the toaster on the table just before the switch; keeps rising to the ceiling; drops back on the table
    toast.forEach((g, i) => {
      const x = TX + 0.45 + (i - 0.5) * 0.06, z = TZ - 0.15, y0 = tableY + 0.08, popT = SW - 0.05 + i * 0.02, v0 = 1.25;
      let y = y0, rx = 0;
      if (t >= popT && t < SW) { const a = t - popT; y = y0 + v0 * a - 0.5 * G * a * a; }
      if (t >= SW) { const a = SW - popT, ys = y0 + v0 * a - 0.5 * G * a * a, vs = v0 - G * a; y = Math.min(2.5, ys + vs * Math.min(tau, 5)); rx = 0.4 * Math.min(tau, 5) * (i ? 1 : -1); }
      if (t >= BACK) { const d = tau - 5, yy = 2.5 - 0.5 * G * d * d; y = Math.max(tableY + 0.01 + i * 0.012, yy); rx = yy > tableY + 0.02 ? 1.2 + i : PI / 2; }
      g.position.set(x + (i ? 0.1 : 0) * (t >= BACK ? 1 : 0), y, z); g.rotation.set(rx, 0.3 * i, 0.2 * rx);
    });
    // mom (right) and grandpa (left) look up at the floating coffee; the dog under the table looks up too
    const look = (k0) => clamp((tau - k0) / 0.6);
    const m = basePose(); m.eyes = blink(t, 6); Object.assign(m, { x: TX + 0.9, z: TZ, rotY: -PI / 2 + 0.45, footFwd: 0.42 });
    m.armA = A(-0.75, 0.15, -1.2, 0.5); m.armB = mixArm(A(-0.75, 0.15, -1.2, -0.5), A(-1.0, 0.3, -2.2, -0.7), look(0.6)); m.headPitch = -0.55 * look(0.2); m.headYaw = -0.3; m.mouth = tau > 0.4 ? 'o' : 'smile';
    if (t >= BACK) { m.mouth = 'smile'; m.headPitch = 0.2; }
    put(mom, 'kit', m, -0.325, 0);
    const g2 = basePose(); g2.eyes = blink(t, 8); Object.assign(g2, { x: TX - 0.9, z: TZ, rotY: PI / 2 - 0.45, footFwd: 0.42 });
    g2.armA = A(-0.8, 0.15, -1.3, 0.5); g2.armB = A(-0.8, 0.15, -1.3, -0.5); g2.headPitch = -0.5 * look(0.4); g2.headYaw = 0.3; g2.mouth = tau > 0.6 ? 'o' : 'flat';
    if (t >= BACK) { g2.mouth = 'smile'; g2.headPitch = 0.15; }
    put(grandpa, 'kit', g2, -0.325, 0);
    dog.g.visible = true; dog.g.position.set(TX - 0.25, 0, TZ + 0.75); dog.g.rotation.y = PI * 0.95; dog.update(t, 0); dog.head.rotation.x = -0.75; dog.bark(t >= BACK ? clamp((tau - 5.7) * 3) : 0);
    void cam;
  }

  // ---------------------------------------------------------------- POOL
  const DX = -10.9, DZ = 2.5, BOARD = 3.0, VD = 4.6, VXD = 0.65;   // he leaves the tip with a little forward speed (clears the board)
  const diverFeet = (t, tau) => { if (t < SW) return BOARD + Math.max(0, (t - (SW - 0.05)) * VD); if (tau <= 5) return BOARD + 0.23 + VD * tau; const d = tau - 5; return BOARD + 0.23 + VD * 5 + VD * d - 0.5 * G * d * d; };
  const ENTRY = 5 + (VD + Math.sqrt(VD * VD + 2 * G * (BOARD + 0.23 + VD * 5 - PD.water))) / G;   // τ when he hits the water
  const diverX = (t, tau) => DX + (t < SW ? 0 : VXD * Math.min(tau, ENTRY)), EX = DX + VXD * ENTRY;
  const splashSeeds = Array.from({ length: 90 }, (_, i) => { const a = (i / 90) * PI * 2 * 3.1, r = 0.4 + (i % 7) * 0.12; return { a, r, v: 0.9 + (i % 9) * 0.45, out: 0.3 + (i % 5) * 0.15, s: 0.03 + (i % 4) * 0.018, ph: i }; });
  function poolScene(t, tau, cam) {
    pool.update(t);
    // diver: straight body, arms overhead, rising; at the return he flails down feet-first; then surfaces
    const fy = diverFeet(t, tau), inWater = tau >= ENTRY;
    const p = basePose(); p.eyes = blink(t, 2); Object.assign(p, { x: diverX(t, tau), z: DZ, rotY: PI / 2 });
    if (!inWater) { p.armA = tau > 5.4 ? flail(t * 3, 0.3, 1) : OVER; p.armB = tau > 5.4 ? flail(t * 3, 2.1, 1) : OVER; p.footFwd = 0; p.mouth = tau > 0.3 ? 'o' : 'flat'; p.headPitch = tau > 5.4 ? 0.5 : -0.2; put(diver, 'pool', p, fy, fy - 0.1); }
    else { const up = clamp((tau - ENTRY - 1.2) / 0.8); p.armA = up > 0.5 ? REST : REST; p.armB = up > 0.5 ? A(-1.5, 0.6, -1.7, -0.6) : REST; p.mouth = 'smile'; p.headPitch = -0.1; const y = lerp(PD.water - 2.2, PD.water - 1.45, up); p.x = lerp(EX, -8.1, clamp((tau - ENTRY) / 1.6)); p.z = lerp(DZ, 2.3, clamp((tau - ENTRY) / 1.6)); p.rotY = 0.35; put(diver, 'pool', p, y, y); diver.root.visible = up > 0.02; if (up > 0.6) { p.armB = A(-1.0, 0.35, -1.5, -0.4); } }
    // swimmers: shoulders at the surface, looking up at the diver
    swimmers.forEach((s, i) => { const q = basePose(); q.eyes = blink(t, i); const [x, z] = [[-7.5, 1.0], [-2.8, 4.6], [-3.5, -1.5], [-8.6, -3.2]][i]; Object.assign(q, { x, z, rotY: Math.atan2(DX - x, DZ - z) }); q.headPitch = -0.6; q.mouth = 'o'; q.armA = A(-2.2, 0.6, -0.4, 0); q.armB = i % 2 ? A(-2.6, 0.4, -0.2, 0) : A(-1.0, 1.0, -0.4, 0); put(s, 'pool', q, PD.water - 1.45 + 0.04 * Math.sin(t * 1.3 + i), PD.water - 1.45); });
    // a kid mid-cannonball at the switch keeps going up (2.2 m/s), knees hugged
    { const q = basePose(); q.eyes = 'closed'; Object.assign(q, { x: -5.5, z: -3.8, rotY: 0.5, crouch: 0.35, footFwd: 0.35 }); q.armA = A(-1.0, 0.05, -1.9, 0.7); q.armB = A(-1.0, 0.05, -1.9, -0.7); q.mouth = 'o';
      const y = t < SW ? 0.6 : floatY(tau, 0.6, 2.2, 0); if (y > 0.01) { put(cannon, 'pool', q, y, y + 0.15, 0.2 * Math.sin(t * 0.6)); cannon.root.scale.setScalar(0.62); } }
    // splash blobs: a crown thrown up just before the switch keeps flying; at the return everything rains down
    splashSeeds.forEach((s) => {
      const tt = Math.max(0, Math.min(tau, 5)), x = -6.8 + Math.cos(s.a) * (s.r + s.out * tt), z = 3.8 + Math.sin(s.a) * (s.r + s.out * tt);
      let y = PD.water + 0.15 + s.v * tt; if (tau > 5) { const d = tau - 5; y = Math.max(PD.water - 0.2, y + s.v * d - 0.5 * G * d * d); }
      if (t >= SW && y > PD.water - 0.1 && !(cam === 'judgesUp' && z > 4.4)) blob(W('pool', x, y, z), s.s * (1 + 0.4 * Math.min(1, tt)), t, s.ph);
    });
    // the entry splash
    if (tau > ENTRY - 0.05) { const age = tau - ENTRY; if (age < 2.5) for (let k = 0; k < 70; k++) { const a = k * 0.9, vr = 1 + (k % 6) * 0.6, vy = 3 + (k % 8) * 1.4, x = EX + Math.cos(a) * vr * age, z = DZ + Math.sin(a) * vr * age, y = PD.water + vy * age - 0.5 * G * age * age; if (y > PD.water - 0.1 && !(cam === 'judges' && z < 1.2)) blob(W('pool', x, y, z), 0.05 + (k % 3) * 0.035, t, k); } for (let k = 0; k < 6; k++) { const a = k; if (age < 1.6) puffs.set(k, W('pool', EX + Math.cos(a) * (0.4 + age), PD.water + 0.6 + age * 2.2, DZ + Math.sin(a) * (0.4 + age)), 1.6 + age * 2.4, 0.8 * (1 - age / 1.6), spray); } jolt(tau, ENTRY, 0.02); }
    // judges: watching, then the cards go up
    if (cam !== 'diver') judges.forEach((j, k) => { const q = basePose(); q.eyes = blink(t, k + 4); Object.assign(q, { x: -7.2 + k, z: 7.6 + 0.55, rotY: PI + 0.3, footFwd: 0.42 });
      const raise = cam === 'judges' ? clamp((t - 62.1 - k * 0.25) / 0.45) : 0;
      q.armA = mixArm(A(-0.75, 0.15, -1.2, 0.5), CARD_A, raise); q.armB = mixArm(A(-0.75, 0.15, -1.2, -0.5), CARD_B, raise); q.headPitch = cam === 'judgesUp' ? -0.6 + 0.05 * Math.sin(t * 2 + k) : -0.05; q.mouth = cam === 'judgesUp' ? 'o' : 'smile';
      if (cam === 'judgesUp') { q.headYaw = 0.12 + 0.12 * k; if (k === 1) q.armB = A(-2.6, 0.35, -0.2, 0); if (k === 2) { q.armA = A(-1.3, 0.2, -2.3, 0.6); q.armB = A(-1.3, 0.2, -2.3, -0.6); } }
      put(j, 'pool', q, -0.325, 0);
      const c = cards[k]; c.visible = raise > 0.05; if (c.visible) { j.root.updateMatrixWorld(true); const a = j.arms[0].hand.getWorldPosition(new THREE.Vector3()), b = j.arms[1].hand.getWorldPosition(new THREE.Vector3()); c.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.14, 0)); c.rotation.set(0, PI + 0.3, 0); } });
    // spectators on the deck pointing up
    [0, 1, 2].forEach((i) => { const g = general[i], q = basePose(); q.eyes = blink(t, i + 9); Object.assign(q, { x: [1.6, 2.5, 3.5][i], z: 7.4, rotY: PI + 0.75 }); q.armB = i === 1 ? A(-2.6, 0.2, -0.1, 0) : PHONE_B; q.headPitch = -0.5; q.mouth = 'o'; put(g, 'pool', q); });
  }

  // ---------------------------------------------------------------- HIGHWAY
  const SPRING = 1.3, SAG0 = 0.15;
  const carRise = (tau) => (tau <= SAG0 ? 0 : SPRING * (tau - SAG0));
  function carState(c, t, tau) {
    if (t < SW) { const ds = VCAR * (t - SW) * (c.nb ? -1 : 1), f = HD.frame(c.s0 + ds, c.off); return { x: f.x, z: f.z, y: 0, head: f.head + (c.nb ? PI : 0), droop: 0, rx: 0, rz: 0 }; }
    const tt = Math.min(tau, 5); let x = c.x0 + c.vx * tt, z = c.z0 + c.vz * tt, y = carRise(tt), rx = c.roll * tt * 0.3, rz = c.spin * tt;
    let droop = clamp(tau / SAG0);
    if (tau > 5) {
      const y5 = carRise(5), d = tau - 5, dl = landAfter(y5, SPRING);
      if (d < dl) { y = y5 + SPRING * d - 0.5 * G * d * d; x += c.vx * d; z += c.vz * d; }
      else { const s = d - dl, slide = Math.min(s, 31 / 18) ; const dist = 31 * slide - 9 * slide * slide; const k = dist / 31; x += c.vx * (dl + k); z += c.vz * (dl + k); y = 0.12 * Math.abs(Math.sin(s * 9)) * Math.exp(-s * 3); droop = Math.max(0, 1 - s * 6); rx += 0.2 * Math.exp(-s * 2) * Math.sin(s * 12); }
    }
    return { x, z, y, head: c.head, droop, rx, rz };
  }
  function highway(t, tau, cam) {
    hwy.update(t);
    const list = [...cars, semi];
    list.forEach((c, i) => {
      const s = carState(c, t, tau), g = c.semi ? c.g : c.car.g;
      g.position.set(s.x, s.y, s.z); g.rotation.set(s.rx, s.head + s.rz, s.rz * 0.5);
      if (!c.semi) c.car.body.position.y = 0.15 * s.droop;
      if (t >= BACK) { const y5 = carRise(5), dl = landAfter(y5, SPRING); dust(i * 3 % 45, 'hwy', s.x, 0, s.z, tau, 5 + dl, 3, 3.2, dirtC); }
    });
    if (t >= BACK) { const dl = landAfter(carRise(5), SPRING); jolt(tau, 5 + dl, 0.04); }
    const c0 = cam === 'hwyR' ? [-60, -150] : [-8, 0]; hwy.aimSun(c0[0], c0[1], cam === 'hwyR' ? 70 : 60);
  }

  // ---------------------------------------------------------------- COAST
  const seaLevel = (t, tau) => {
    if (t < SW) return 0;
    if (tau <= 2.45) return 0.5 * G * tau * tau;
    if (tau <= 5) { const d = Math.min(tau - 2.45, 0.55); return 29.4 + 24 * d - 0.5 * 43.6 * d * d + (tau > 3 ? 0.4 * Math.sin((tau - 3) * 2) : 0); }
    const d = tau - 5, top = 29.4 + 24 * 0.55 - 0.5 * 43.6 * 0.55 * 0.55 + 0.4 * Math.sin(4), tl = Math.sqrt(2 * top / G);
    if (d < tl) return top - 0.5 * G * d * d;
    const s = d - tl; return -1.5 * Math.sin(s * 3) * Math.exp(-s * 1.5);
  };
  const CSR = rng(5), crestSeeds = Array.from({ length: 70 }, (_, i) => ({ x: -50 + CSR() * 90, z: -130 + CSR() * 100, v: 0.3 + CSR() * 0.6, s: 0.12 + CSR() * 0.3, ph: i }));
  function coastScene(t, tau, cam) {
    const L = seaLevel(t, tau);
    coast.setSea(L, t); coast.rideBoats(t, L); coast.aimSun(-6, -70, 70);
    // crest blobs: water that was moving up on the swell keeps going (above the rising surface)
    if (t >= SW && tau < 5.6) crestSeeds.forEach((c) => { const tt = Math.min(tau, 5), y = L + 0.4 + c.v * tt * 3.2 - (tau > 5 ? 0.5 * G * (tau - 5) ** 2 * 0 : 0); blob(W('coast', c.x, y, c.z), c.s * (1 + 0.5 * clamp(tt / 3)), t, c.ph); });
    // the drop: white water explodes around the lighthouse + cliff when the sea lands
    if (t >= BACK) { const land = 5 + Math.sqrt(2 * 36 / G), age = tau - land; if (age > 0 && age < 2.4) { for (let k = 0; k < 24; k++) { const a = k * 1.7, r = 6 + (k % 6) * 5 + age * 14; puffs.set(k, W('coast', -6 + Math.cos(a) * r, 2 + age * 9 * (0.4 + (k % 4) * 0.2), -78 + Math.sin(a) * r * 0.6), 8 + age * 10, 0.85 * (1 - age / 2.4), spray); } jolt(tau, land, 0.05); } }
    gulls.forEach((g, i) => { const flap = Math.sin(t * (t < SW ? 7 : 2.5) + i); g.wl.rotation.z = 0.5 * flap; g.wr.rotation.z = -0.5 * flap; g.g.position.set(g.x + t * 1.2, g.y + Math.sin(t * 0.5 + i) * 0.6, g.z); g.g.rotation.y = PI / 2; });
  }

  // ---------------------------------------------------------------- GORGE (bungee)
  const L_ROPE = 50, S_MAX = 50, OM = Math.sqrt(2 * G * (L_ROPE + S_MAX)) / S_MAX, T1 = (PI / 2) / OM, VUP = OM * S_MAX;
  const ANCHOR = [0, 0.9, -6.9];
  const jumperY = (t, tau) => { if (t < SW) return -L_ROPE - S_MAX + 0.3 * Math.sin(t * 2); if (tau <= T1) return -L_ROPE - S_MAX * Math.cos(OM * tau); return -L_ROPE + VUP * (tau - T1); };
  function gorgeScene(t, tau) {
    gorge.update(t); gorge.aimSun(0, -30, -6, 70);
    const y = jumperY(t, tau) + ANCHOR[1], p = basePose(); p.eyes = blink(t, 3); Object.assign(p, { x: ANCHOR[0], z: ANCHOR[2] - 0.6, rotY: 0.3 * Math.sin(t * 0.4) });
    // flying feet-first? He was hanging head-down at the bottom: the cord pulls his ankles up → he flies feet-first, arms trailing
    p.armA = flail(t, 0.4, 0.7); p.armB = flail(t, 2.4, 0.7); p.mouth = 'o'; p.headPitch = 0.3;
    put(jumper, 'gorge', p, y, y - 0.1, PI, 0);   // upside down (ankle harness): rotate PI about x, feet at the cord end
    // the cord: from the anchor to his ankles, buckling sideways as it goes slack
    const ankle = new THREE.Vector3(ANCHOR[0], y, ANCHOR[2] - 0.6), an = new THREE.Vector3(...ANCHOR), pts = [], slack = clamp((L_ROPE - Math.abs(ankle.y - an.y)) / L_ROPE);
    for (let i = 0; i <= 14; i++) { const f = i / 14, q = an.clone().lerp(ankle, f); q.x += slack * 1.4 * Math.sin(f * PI * 3 + t * 0.4) * Math.sin(f * PI); q.z += slack * 0.8 * Math.sin(f * PI * 2 + 1) * Math.sin(f * PI); pts.push(q.add(new THREE.Vector3(...OFF.gorge))); }
    if (cordMesh) { cordMesh.geometry.dispose(); scene.remove(cordMesh); }
    cordMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.04, 6), cordM); scene.add(cordMesh);
    crew.forEach((c, i) => { const q = basePose(); q.eyes = blink(t, i + 2); Object.assign(q, { x: [-1.2, 1.3][i], z: -6.0, rotY: PI + [0.4, -0.3][i] }); const up = clamp((y + 3) / 6); q.headPitch = lerp(0.7, -0.6, up); q.lean = 0.25 * (1 - up); q.armA = A(-0.4, 0.3, -0.4, 0); q.armB = i ? A(-2.4, 0.3, -0.2, 0) : A(-1.1, 0.4, -1.2, -0.3); q.mouth = 'o'; put(c, 'gorge', q, 0.3, 0.3); });
    { const g = general[3], q = basePose(); q.eyes = blink(t, 8); Object.assign(q, { x: 3.0, z: -4.1, rotY: PI - 0.5 }); q.armB = PHONE_B; q.headPitch = 0.3; q.mouth = 'o'; put(g, 'gorge', q); phone.g.visible = true; }
    return y;
  }

  // ---------------------------------------------------------------- QUITO (equator)
  const tourists = [[-1.2, 0.0, 0.3], [0.2, -0.25, -0.4], [1.6, 0.1, 0.5], [-2.6, -0.4, 0.9], [2.8, -1.8, -0.6], [-4.0, 0.3, 1.2], [4.2, 0.2, -0.9], [-0.5, -3.2, 0.1], [1.1, -4.0, -0.3], [-3.3, -4.6, 0.6], [3.4, -5.4, -0.2], [-1.8, 2.2, 2.6]];
  function quito(t, tau) {
    plaza.aimSun(0, -4, 20);
    const h = t < SW ? 0 : 0.5 * DRIFT_EQ * Math.min(tau, 5) ** 2;
    tourists.forEach(([x, z, ry], i) => {
      const g = general[i % general.length]; if (i >= general.length) return;
      const q = basePose(); q.eyes = blink(t, i); Object.assign(q, { x, z, rotY: ry + 0.15 * Math.sin(t * 0.4 + i) });
      if (i === 0) { q.footFwd = 0; q.armA = A(-0.2, 0.6, -0.3, 0); q.armB = A(-0.2, 0.6, -0.3, 0); }                 // one foot each side of the line
      else if (i === 3) { q.armB = PHONE_B; q.headPitch = 0.2; phone.g.visible = true; }
      else { q.armA = i % 2 ? OUT : A(-0.5, 0.35, -0.8, 0.3); q.armB = i % 3 ? OUT : A(-0.5, 0.35, -0.8, -0.3); }
      q.headPitch = i === 3 ? 0.1 : 0.55 + 0.1 * Math.sin(t + i); q.mouth = 'o';
      put(g, 'plaza', q, h, h - 0.0);
    });
    // a kid who was mid-jump on the line keeps going up at 2.5 m/s
    { const q = basePose(); q.eyes = blink(t, 5); Object.assign(q, { x: 0.9, z: -1.1, rotY: 0.4 }); q.armA = CHEER; q.armB = CHEER; q.mouth = 'o'; const y = floatY(tau, 0.25, 2.5, DRIFT_EQ); put(kid, 'plaza', q, y, y - 0.12); kid.root.scale.setScalar(0.62); }
    // fountain jets: water leaving the nozzles keeps going straight up; the column breaks into blobs as it goes
    plaza.jets.forEach((j, ji) => {
      const v = ji === 0 ? 5.8 : 3.6, top = j.h + v * Math.min(tau, 5);
      for (let k = 0; k < 34; k++) { const f = k / 33, y = j.h + f * (top - j.h); const r = (ji === 0 ? 0.07 : 0.045) * (1 + 0.5 * f) * (f > 0.5 ? 1.3 : 1); blob(W('plaza', j.x + 0.02 * Math.sin(k), y, j.z), r, t, k + ji * 10); }
    });
    pigeons.forEach((g, i) => { const flap = Math.sin(t * 2.2 + i * 1.3); g.wl.rotation.z = 0.6 * flap; g.wr.rotation.z = -0.6 * flap; g.g.position.set(g.x + 0.05 * Math.sin(t + i), (t < SW ? 0.1 : 0.1 + g.v * Math.min(tau, 5) * 0.6) + h, g.z); g.g.rotation.set(0.2 * Math.sin(t * 0.5 + i), i, 0); });
  }

  // ---------------------------------------------------------------- SPACE (ISS)
  function spaceScene(t, tau) {
    space.setSpin(0.6 + t * 0.006);
    space.sun.target.position.set(0, ISSY, 0); space.sun.position.set(380, ISSY + 1000, 520); space.sun.castShadow = false;
    iss.wings.forEach((w, i) => (w.rotation.x = 0.55 + 0.05 * t + i * 0.01));
    const p = basePose(); p.eyes = blink(t, 1); Object.assign(p, { x: 0, z: 0, rotY: 0.6 }); p.armB = wave(t); p.armA = A(-0.9, 0.5, -0.8, 0.2); p.footFwd = 0.2; p.mouth = 'smile'; p.headPitch = -0.1;
    applyPose(astro, { ...p, floor: -0.15 }); astro.root.visible = true;
    astroG.position.set(-0.6, ISSY - 0.35 + 0.04 * Math.sin(t * 0.7), -1.0); astroG.rotation.set(0.25 + 0.03 * Math.sin(t * 0.5), -0.3, 0.12);
    const a = new THREE.Vector3(-0.6, ISSY - 0.1, -1.0).add(new THREE.Vector3(...OFF.space)), b = new THREE.Vector3(1.2, ISSY - 1.2, -6).add(new THREE.Vector3(...OFF.space));
    tether.geometry.dispose(); tether.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5).add(new THREE.Vector3(0.4, -0.5, 0.3)), b]), 16, 0.008, 4);
  }

  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam, tau = tauAt(t, shot);
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.05 : 0.03; studio.fill.intensity = 0.45;
    all.forEach((r) => (r.root.visible = false)); BALL.visible = false; conf.visible = false; puffs.hide(); coffee.visible = false; phone.g.visible = false;
    toast.forEach((g) => (g.visible = S === 'kit')); dog.g.visible = false; cards.forEach((c) => (c.visible = false)); tether.visible = S === 'space';
    if (cordMesh) cordMesh.visible = S === 'gorge';
    nb = 0; shake = [0, 0];

    let aimY = null;
    if (S === 'stad') stadium(t, tau, cam);
    else if (S === 'kit') kitchen(t, tau, cam);
    else if (S === 'pool') poolScene(t, tau, cam);
    else if (S === 'hwy') highway(t, tau, cam);
    else if (S === 'coast') coastScene(t, tau, cam);
    else if (S === 'gorge') aimY = gorgeScene(t, tau);
    else if (S === 'plaza') quito(t, tau);
    else if (S === 'space') spaceScene(t, tau);
    blobsDone(); blobs.visible = nb > 0;

    // camera (local → world)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (cam === 'iss') { P[1] += ISSY; Aim[1] += ISSY; }
    if (cam === 'bungee' && aimY !== null) { Aim[1] = clamp(aimY - 1.5, -40, 9) + o[1]; Aim[2] = ANCHOR[2] - 0.6 + o[2]; Aim[0] = ANCHOR[0] + o[0] + 0.01; }
    if (cam === 'poolR') { const fy = diverFeet(t, tau); Aim[1] = Math.max(0.6, Math.min(fy + 0.4, 27)) + o[1]; Aim[0] = diverX(t, tau) + o[0]; }
    if (cam === 'coast' || cam === 'coastR') Aim[1] = seaLevel(t, tau) * 0.6 + 5 + o[1];
    // v2 (TRIBE fix pass): "bullet time" — the world crawls, the camera doesn't. Orbits + a tracking run add motion to the slow beats.
    const ORB = (cx, cz, r, a0, a1, h0, h1, ay0, ay1) => { const a = lerp(a0, a1, e); P[0] = cx + Math.sin(a) * r + o[0]; P[1] = lerp(h0, h1, e) + o[1]; P[2] = cz + Math.cos(a) * r + o[2]; Aim[0] = cx + o[0]; Aim[1] = lerp(ay0, ay1, e) + o[1]; Aim[2] = cz + o[2]; };
    if (cam === 'aerial' || cam === 'goal') { // track behind the striker's run, then drift on toward the box
      const [sx, sz] = strikerXZ(Math.min(t, KICK)), d = t > KICK ? Math.min(2.4, 1.8 * (t - KICK) - 0.35 * (t - KICK) ** 2) : 0;
      P[0] = sx - 5.4 + 0.905 * d + o[0]; P[1] = 1.7 + o[1]; P[2] = sz - 1.4 + 0.425 * d + o[2];
      Aim[0] = 60 + o[0]; Aim[1] = K(t, [[GOAL, 3.4], [GOAL + 0.8, 4.6]]) + o[1]; Aim[2] = 0.5 + o[2];
    }
    if (cam === 'fans') ORB(60.0, 2.6, 4.3, -2.05, -1.05, 1.5, 2.8, 3.0, 4.6);
    if (cam === 'coffee') { ORB(KD.table[0], KD.table[1] - 0.2, 2.5, 0.5, -0.45, 1.45, 1.55, 1.3, 1.55); Aim[0] = lerp(1.0, -0.2, e) + o[0]; Aim[2] = -0.75 + o[2]; }   // pans mom → dad → grandpa
    if (cam === 'iss') ORB(-0.6, -1.0, 1.7, 0.75, -0.25, ISSY + 1.1, ISSY + 0.9, ISSY - 0.55, ISSY - 0.5);
    P[0] += shake[0]; P[1] += shake[1];
    if (cam === 'goal' && t > GOAL && t < GOAL + 0.5) { const k = 0.015 * Math.exp(-(t - GOAL) * 6); P[1] += k * Math.sin(t * 60); }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
