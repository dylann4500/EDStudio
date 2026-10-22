// VIDEO 005 — "What if every nuclear weapon disappeared?"   (tone: world — planet-scale thought experiment)
// 71 s, 15 shots, 7 locations, all built in one scene and shown one at a time (root.visible per shot):
//   war room + hologram Earth, launch capsule (engine/sets/warroom.js); missile silo, parade ground + hangar, border post,
//   nuclear power plant (engine/sets/military.js); the toy city at sunrise (engine/sets/city.js, from 004).
// Rule (user, 2026-10-22): every claim in a subtitle gets its own scene — show the soldiers, the tanks, the border, the reactors.
// Numbers: SIPRI Yearbook 2026 (inventory, Jan 2026): 12,187 total — RUS 5,420 · USA 5,042 · CHN 620 · FRA 370 · GBR 225 ·
// IND 190 · PAK 170 · ISR 90 · PRK 60. Army sizes ≈ IISS Military Balance (active troops, millions). Reactors: IAEA PRIS
// (31 countries + Taiwan). The HUD count and the dots on the globe are the SAME number (dot k is visible while k < count).
//
// Shot list (seconds)                       | where        | what happens
//  0.0– 3.6  title    globe in the dark     | war room     | 12,187 red dots glowing on the hologram Earth (title alone)
//  3.6–10.2  arctic   over the North Pole   | war room     | US + Russia face each other across the pole (86%)
// 10.2–12.8  silo     looking up the shaft  | silo         | midnight: the missile dissolves bottom→top into embers
// 12.8–15.6  vanish   globe                 | war room     | the last dots go out, HUD rolls → 0 in sync
// 15.6–19.0  capBack  behind the crew       | capsule      | the red console lights go dark, left → right
// 19.0–22.2  capFace  the officer           | capsule      | she turns to her colleague, a small smile
// 22.2–26.0  roof     rooftop at sunrise    | city         | DAY 1: three people watch the sun come up over the skyline
// 26.0–30.2  street   main street, golden   | city         | people walking to work; the whole skyline intact
// 30.2–34.2  bars     globe, Asia           | war room     | gold columns = army sizes ("the great equalizer" is gone)
// 34.2–38.4  parade   low, long lens        | base         | 30 soldiers march at the camera in step
// 38.4–42.2  border   over the guard        | border       | one guard at a barrier; a row of tank headlights on the ridge
// 42.2–46.2  factory  hangar door           | base         | tanks roll out of the hangar one after another
// 46.2–50.0  plant    cooling towers        | plant        | YEARS pass: day/night time-lapse, steam keeps rising
// 50.0–53.6  skip     globe spins           | war room     | blue dots = the 31 reactor countries
// 53.6–60.4  reveal   push-in               | war room     | YEAR 3: one red dot lights up in the Indian Ocean — HUD 0 → 1 (gold)
// 60.4–71.0  faces    slow pull-back        | war room     | the leaders snap to look at it, in sync, lit red; fade; end card
import * as THREE from 'three';
import { K, clamp, lerp, rng, smooth, easeIO, mat, mk } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { buildWarRoom, buildCapsule, DIMS } from '@engine/sets/warroom.js';
import { buildSilo, buildBase, buildBorder, buildPlant } from '@engine/sets/military.js';
import { buildCity, makeCar, ROOF_Y } from '@engine/sets/city.js';
import { makeDots, makeBars, scatter, faceLon } from '@engine/globe.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PI = Math.PI;
const GY = DIMS.globe.y;
const CAP = DIMS.CAP;
const C = (x, y, z) => [CAP[0] + x, CAP[1] + y, CAP[2] + z];

export const SHOTS = [
  { t0: 0, t1: 3.6, cam: 'title', set: 'war' },
  { t0: 3.6, t1: 10.2, cam: 'arctic', set: 'war' },
  { t0: 10.2, t1: 12.8, cam: 'silo', set: 'silo' },
  { t0: 12.8, t1: 15.6, cam: 'vanish', set: 'war' },
  { t0: 15.6, t1: 19.0, cam: 'capBack', set: 'cap' },
  { t0: 19.0, t1: 22.2, cam: 'capFace', set: 'cap' },
  { t0: 22.2, t1: 26.0, cam: 'roof', set: 'city' },
  { t0: 26.0, t1: 30.2, cam: 'street', set: 'city' },
  { t0: 30.2, t1: 34.2, cam: 'bars', set: 'war' },
  { t0: 34.2, t1: 38.4, cam: 'parade', set: 'base' },
  { t0: 38.4, t1: 42.2, cam: 'border', set: 'border' },
  { t0: 42.2, t1: 46.2, cam: 'factory', set: 'base' },
  { t0: 46.2, t1: 50.0, cam: 'plant', set: 'plant' },
  { t0: 50.0, t1: 53.6, cam: 'skip', set: 'war' },
  { t0: 53.6, t1: 60.4, cam: 'reveal', set: 'war' },
  { t0: 60.4, t1: 71.0, cam: 'faces', set: 'war' },
];
// globe shots orbit the globe: G(azimuth, elevation, distance) → camera position (look-at = globe center, nudged up
// by 0.1 so the globe sits a little low in frame, clear of the HUD)
const G = (az, el, d) => [Math.sin(az) * Math.cos(el) * d, GY + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d];
const GA = [0, GY + 0.1, 0];
const RY = ROOF_Y;
// p = camera position start→end, a = look-at start→end, fov, amp = handheld drift (m)
export const CAMS = {
  title:   { p: [G(0.1, 0.38, 3.1), G(0.22, 0.34, 2.9)], a: [GA, GA], fov: 40, amp: 0.002 },
  arctic:  { p: [G(0.0, 1.05, 2.75), G(0.05, 1.0, 2.6)], a: [GA, GA], fov: 40, amp: 0.002 },
  silo:    { p: [[1.5, 1.0, 1.55], [1.4, 1.5, 1.45]], a: [[0, 8.5, 0], [0, 9.5, 0]], fov: 64, amp: 0.004 },
  vanish:  { p: [G(0.0, 0.3, 2.75), G(-0.06, 0.28, 2.55)], a: [GA, GA], fov: 40, amp: 0.002 },
  capBack: { p: [C(0.25, 1.62, 1.55), C(0.18, 1.58, 1.3)], a: [C(0, 1.15, -1.8), C(0, 1.15, -1.8)], fov: 62, amp: 0.003 },
  capFace: { p: [C(0.95, 1.38, -1.35), C(0.9, 1.36, -1.3)], a: [C(-0.42, 1.22, -0.6), C(-0.42, 1.22, -0.6)], fov: 50, amp: 0.003 },
  roof:    { p: [[-11.6, RY + 1.75, 13.6], [-11.4, RY + 1.85, 12.6]], a: [[-8.0, RY + 3.2, -60], [-8.0, RY + 4.5, -60]], fov: 50, amp: 0.003 },
  street:  { p: [[2.2, 1.5, 24], [2.0, 1.9, 19]], a: [[0, 10, -150], [0, 14, -150]], fov: 50, amp: 0.004 },
  bars:    { p: [G(0.0, 0.45, 2.85), G(0.05, 0.42, 2.65)], a: [GA, GA], fov: 42, amp: 0.002 },
  parade:  { p: [[-1.9, 1.1, 8.6], [-1.7, 1.15, 7.7]], a: [[0, 1.0, -4.0], [0, 1.0, -3.0]], fov: 30, amp: 0.004 },
  border:  { p: [[-1.0, 1.78, 7.6], [-0.95, 1.74, 6.9]], a: [[-1.6, 1.3, -60], [-1.6, 1.6, -60]], fov: 28, amp: 0.004 },
  factory: { p: [[6.0, 1.4, 4.0], [5.2, 1.35, 3.0]], a: [[0, 2.0, -12], [0, 2.0, -12]], fov: 46, amp: 0.004 },
  plant:   { p: [[-42, 3.0, 84], [-40, 3.4, 78]], a: [[2, 24, -10], [2, 25, -10]], fov: 50, amp: 0.003 },
  skip:    { p: [G(0.0, 0.26, 2.75), G(0.0, 0.25, 2.7)], a: [GA, GA], fov: 40, amp: 0.001 },
  reveal:  { p: [G(0.0, 0.16, 2.75), G(0.0, 0.14, 2.05)], a: [GA, [0, GY + 0.06, 0]], fov: 40, amp: 0.002 },
  faces:   { p: [[0.0, 1.62, 2.3], [0.0, 2.05, 3.7]], a: [[0, 1.48, -0.6], [0, 1.4, -0.6]], fov: 52, amp: 0.003 }, // slow pull-back
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- data
const WARHEAD_SITES = [ // [lat, lon, weight, spread°] — rough base/storage regions; weights = warheads
  // USA 5,042
  [48.4, -101.3, 750, 0.7], [47.5, -111.2, 550, 0.7], [41.1, -104.9, 550, 0.7], [30.8, -81.5, 800, 0.5], [47.7, -122.7, 850, 0.5],
  [35.0, -106.6, 700, 0.6], [35.3, -101.6, 450, 0.5], [38.7, -93.5, 130, 0.4], [32.5, -93.6, 130, 0.4],
  [45.9, 12.5, 35, 0.4], [51.2, 5.3, 15, 0.3], [50.2, 7.1, 15, 0.3], [51.6, 5.7, 15, 0.3], [37.0, 35.4, 20, 0.3],
  // Russia 5,420
  [55.8, 37.6, 650, 1.0], [54.0, 35.8, 300, 0.6], [51.7, 45.6, 450, 0.8], [51.0, 59.8, 300, 0.7], [55.3, 89.8, 300, 0.7],
  [55.0, 83.0, 280, 0.7], [52.3, 104.3, 280, 0.7], [56.6, 47.9, 250, 0.6], [56.9, 40.5, 250, 0.6], [69.2, 33.3, 700, 0.6],
  [52.9, 158.6, 450, 0.5], [51.2, 128.4, 300, 0.7], [54.7, 20.5, 90, 0.3], [61.0, 60.0, 200, 1.4], [58.0, 113.0, 120, 1.4],
  // China 620
  [34.6, 112.4, 150, 0.8], [37.4, 97.4, 100, 0.8], [34.4, 107.1, 100, 0.7], [40.2, 97.0, 100, 0.6], [42.5, 92.5, 80, 0.6], [40.3, 107.5, 60, 0.5], [18.2, 109.6, 30, 0.3],
  // France 370, UK 225
  [48.3, -4.5, 220, 0.4], [43.5, 4.9, 50, 0.3], [48.6, 4.9, 50, 0.3], [47.6, 4.9, 50, 0.3],
  [56.1, -4.8, 180, 0.3], [51.36, -1.15, 45, 0.2],
  // India 190, Pakistan 170, Israel 90, North Korea 60
  [26.0, 76.0, 160, 2.2], [17.7, 83.3, 30, 0.4],
  [33.0, 72.0, 110, 1.0], [29.5, 68.0, 60, 1.2],
  [31.0, 35.0, 90, 0.3],
  [39.8, 125.7, 60, 0.4],
].map(([lat, lon, w, s]) => ({ lat, lon, w, s }));
const TOTAL = 12187;

const ARMIES = [ // active troops (millions), IISS ≈ 2025; column height ∝ troops
  [35.0, 104.0, 2.04], [22.5, 79.0, 1.48], [39.5, -98.0, 1.32], [40.0, 127.0, 1.32], [56.0, 48.0, 1.13],
  [30.0, 70.0, 0.66], [32.5, 53.5, 0.61], [36.3, 127.8, 0.5], [16.0, 106.0, 0.45], [27.0, 30.0, 0.44],
  [-2.0, 115.0, 0.4], [-10.0, -52.0, 0.37], [39.0, 34.0, 0.36],
].map(([lat, lon, m]) => ({ lat, lon, h: m * 0.17 }));

const REACTORS = [ // [lat, lon, dots] — the 31 countries operating power reactors (IAEA PRIS) + Taiwan
  [39, -95, 9], [46.5, 2.5, 6], [32, 114, 6], [56, 40, 5], [36, 138, 4], [36, 128, 3], [22, 78, 3], [45, -78, 3], [49, 31, 3],
  [52.5, -1.5, 2], [40, -3.5, 2], [59.5, 16, 2], [61.5, 25, 1], [49.8, 15.5, 1], [47.2, 19, 1], [48.7, 19.5, 1], [46.1, 14.8, 1],
  [46.8, 8.2, 1], [50.6, 4.6, 1], [52.2, 5.3, 1], [44.4, 26.1, 1], [42.7, 25.5, 1], [53.7, 27.9, 1], [40.2, 44.5, 1],
  [28.5, 51.5, 1], [24.2, 54.5, 1], [30.0, 70.5, 1], [-34, 18.5, 1], [-23, -44.5, 1], [-34, -59, 1], [19.7, -96.4, 1], [23.7, 121, 1],
].map(([lat, lon, n]) => ({ lat, lon, n }));
const SECRET = { lat: -12, lon: 80 };   // the one that comes back: open ocean, nobody's flag on it

// ---------------------------------------------------------------- globe orientation per shot
// lon = longitude facing the camera, tilt = how far the North Pole leans toward the camera (rad)
function globeView(t) {
  if (t < 3.6) return { lon: K(t, [[0, 10], [3.6, -5]]), tilt: 0.42 };
  if (t < 10.2) return { lon: K(t, [[3.6, -25], [10.2, -15]]), tilt: 0.78 };
  if (t < 15.6) return { lon: K(t, [[12.8, 45], [15.6, 55]]), tilt: 0.38 };
  if (t < 34.2) return { lon: K(t, [[30.2, 82], [34.2, 92]]), tilt: 0.42 };
  if (t < 53.6) return { lon: K(t, [[50.0, 105], [53.6, 80 + 2 * 360]]), tilt: 0.25 };
  return { lon: 80 + 360 * 2 + (t - 53.6) * 0.6, tilt: -0.37 };   // the secret dot (lat -12) faces the camera, above the subtitles
}

// ---------------------------------------------------------------- leaders around the table (final shot only)
const LEADERS = [ // a = angle around the table (0 = +z, toward the camera); h = height scale
  { a: -1.25, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short', tie: 0x9a2f2f, h: 1.0 },
  { a: PI + 0.75, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob', tie: null, h: 0.97 },
  { a: PI - 1.25, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short', tie: 0x2c3420, h: 1.03, general: true },
  { a: PI + 1.25, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', tie: 0xd8c27a, h: 0.99, glasses: true },
  { a: 1.25, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob', tie: null, h: 0.95 },
  { a: PI - 0.75, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy', tie: 0x2b4f7a, h: 0.88 },
];
function leaderPose(t, L, i) { // heads down over their papers, then everyone snaps to the red dot together
  const p = basePose();
  const R = DIMS.ring;
  p.x = Math.sin(L.a) * R; p.z = Math.cos(L.a) * R; p.rotY = L.a + PI;
  p.eyes = t > 60.7 && t < 64 ? 'open' : blink(t + i * 0.7, i);
  p.glasses = !!L.glasses; p.smile = 0;
  const arm = (sx, sz, el) => ({ sx, sz, el, free: 0, twist: 0 });
  const snap = K(t, [[60.7 + i * 0.12, 0], [61.05 + i * 0.12, 1]], easeIO);
  p.lean = lerp(0.22, 0.06, snap);
  p.headPitch = lerp(0.42, -0.06, snap);
  p.armA = arm(lerp(-0.5, 0.03, snap), lerp(0.12, 0.07, snap), lerp(-0.6, -0.2, snap));
  p.armB = arm(lerp(-0.5, 0.03, snap), lerp(0.12, 0.07, snap), lerp(-0.6, -0.2, snap));
  return p;
}

// ---------------------------------------------------------------- city (Day 1)
const ROOFERS = [ // on the roof at sunrise, facing downtown (-z)
  { x: -12.6, z: 9.0, top: 0xc46b5a, pants: 0x3a4660, skin: 0xe8b996, hair: 0x3d2a1f, hs: 'bob' },
  { x: -11.6, z: 9.1, top: 0x4f7a6a, pants: 0x34405c, skin: 0xb07a56, hair: 0x1d1a18, hs: 'short' },
  { x: -10.3, z: 8.9, top: 0xe0b45a, pants: 0x2f3a4a, skin: 0xf0c8a8, hair: 0x7a5030, hs: 'messy' },
];
function rooferPose(t, i) {
  const p = basePose(); const R = ROOFERS[i];
  Object.assign(p, { x: R.x, z: R.z, rotY: PI, eyes: blink(t, i + 3), smile: 1 });
  p.headPitch = -0.12;
  if (i === 0) { const up = K(t, [[22.9, 0], [23.9, 1], [25.0, 1], [25.8, 0.2]]); p.armA = { sx: -0.2 * up, sz: 0.07 + 2.6 * up, el: -0.3 * up, free: 0 }; p.armB = { ...p.armA }; p.headPitch = -0.12 - 0.25 * up; } // stretches, arms up
  if (i === 1) p.headYaw = 0.35 * smooth((t - 24.2) / 0.6);           // turns to the friend on her left
  if (i === 2) { p.armA = { sx: -0.1, sz: 0.9, el: -0.4, free: 0 }; p.headRoll = 0.08; }   // arm around the middle one
  return p;
}
const WALKERS = [[5.6, 8, 0], [5.0, 3, 1], [-5.4, 12, 2], [-5.8, 5, 3], [6.1, 16, 4], [5.3, -4, 1], [-5.2, -2, 0]];
const TRAFFIC = [ // morning traffic on the main street: x=+2 heads downtown (-z), x=-2 comes toward the camera
  { col: 0xc9503f, x: 2, z0: 10, v: 7 }, { col: 0x3f6fa5, x: 2, z0: -6, v: 6 }, { col: 0xe6dccb, x: -2, z0: -40, v: 6.5 },
  { col: 0xd9a443, x: -2, z0: -70, v: 7 }, { col: 0x2f3338, x: 2, z0: -25, v: 6.5 },
];

// ---------------------------------------------------------------- capsule crew
function officerPose(t, side) { // side -1 = left seat, +1 = right seat
  const p = basePose();
  const [sx, sz] = DIMS.seats[side < 0 ? 0 : 1];
  Object.assign(p, { x: CAP[0] + sx, z: CAP[2] + sz - 0.02, rotY: PI, y: -0.22, footFwd: 0.4 });
  p.eyes = blink(t, side < 0 ? 2 : 5);
  p.lean = 0.12; p.headPitch = 0.22; p.smile = 0;
  const desk = { sx: -0.95, sz: 0.1, el: -0.55, free: 0 };
  p.armA = { ...desk }; p.armB = { ...desk };
  // the lights go out → they sit back, look at each other, then a small smile
  const back = K(t, [[17.4, 0], [18.4, 1]]);
  p.lean = lerp(0.12, -0.02, back); p.headPitch = lerp(0.22, 0.02, back);
  const look = K(t, [[19.6 + (side > 0 ? 0.15 : 0), 0], [20.2 + (side > 0 ? 0.15 : 0), 1]]);
  p.headYaw = side * 1.45 * look;  // root faces -z: −1 (left seat) turns toward the colleague on her right, past the camera
  p.smile = t > 21.0 ? 1 : 0;
  if (side > 0) { // takes hands off the desk
    const off = K(t, [[18.0, 0], [18.8, 1]]);
    p.armB = { sx: lerp(-0.95, -0.25, off), sz: 0.1, el: lerp(-0.55, -1.2, off), free: 0 };
  }
  return p;
}

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, setCamera, camera } = studio;
  camera.far = 900;                                    // the city skyline is far away
  const set = buildWarRoom(studio, { ambient: 0.5 });
  const cap = buildCapsule(studio, {});
  const silo = buildSilo(studio);
  const base = buildBase(studio);
  const border = buildBorder(studio);
  const plant = buildPlant(studio);
  const city = buildCity(studio, {});
  const cityFog = scene.fog;                           // only the city wants fog
  city.setTime({ day: 1, golden: 1, power: 0.0, milky: 0, moon: 0 });
  const ROOTS = { war: [set.root], cap: [cap.root], silo: [silo.root], base: [base.root], border: [border.root], plant: [plant.root], city: [city.root] };
  const globe = set.globe;
  globe.g.rotation.order = 'YXZ';

  // warheads: exactly 12,187 dots; perm[i] = rank at which dot i goes out (matches the HUD count)
  const R = rng(2026);
  const pts = scatter(R, WARHEAD_SITES, TOTAL);
  const perm = pts.map((_, i) => i);
  for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const warheads = makeDots(globe, pts, { size: 0.0032, color: 0xff3b1f, intensity: 1.6 });
  const bars = makeBars(globe, ARMIES, { radius: 0.011, color: 0xf3c46b, emissive: 0.35, opacity: 1 });
  const labPts = []; const labR = rng(31);
  REACTORS.forEach((c, ci) => { for (let k = 0; k < c.n; k++) labPts.push({ lat: c.lat + (labR() - 0.5) * 3, lon: c.lon + (labR() - 0.5) * 4, ci }); });
  const labs = makeDots(globe, labPts, { size: 0.0085, color: 0x6fd0ff, intensity: 2.0, h: 0.003 });
  const secret = makeDots(globe, [SECRET], { size: 0.012, color: 0xff3a24, intensity: 3.2, h: 0.004 });
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a3c).multiplyScalar(1.8), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), ringMat);
  const sp = globe.toLocal(SECRET.lat, SECRET.lon, 0.005); ring.position.copy(sp); ring.lookAt(sp.clone().multiplyScalar(2)); globe.spin.add(ring);

  // leaders (war room)
  const leaders = LEADERS.map((L) => {
    const P = makePerson({ skin: L.skin, top: L.top, collar: 0xf1ede4, pants: L.pants, hair: L.hair, hairStyle: L.hairStyle, glasses: L.glasses });
    P.root.scale.setScalar(L.h);
    if (L.tie) { const tie = mk(new RoundedBoxGeometry(0.045, 0.2, 0.02, 2, 0.008), mat(L.tie, 0.6), P.spine, 0, 0.42, 0.13); tie.rotation.x = -0.12; }
    if (L.general) for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.11, 0.018, 0.08, 2, 0.006), mat(0xd8c27a, 0.4), P.spine, s * 0.2, 0.52, 0);
    set.root.add(P.root); return P;
  });
  // capsule officers (dark blue flight suits)
  const officers = [-1, 1].map((s) => {
    const P = makePerson({ skin: s < 0 ? 0xe2ad8c : 0xb07a56, top: 0x3c4a63, collar: 0x2c3648, pants: 0x3c4a63, hair: s < 0 ? 0x4a3020 : 0x1d1a18, hairStyle: s < 0 ? 'bob' : 'short' });
    mk(new RoundedBoxGeometry(0.07, 0.07, 0.01, 2, 0.006), mat(0xc9a25a, 0.4), P.spine, 0.09, 0.42, 0.135);
    scene.add(P.root); ROOTS.cap.push(P.root); return P;
  });
  // city people: three on the roof (carrier at roof height), walkers on the sidewalks
  const roofCarrier = new THREE.Group(); roofCarrier.position.y = ROOF_Y; city.root.add(roofCarrier);
  const roofers = ROOFERS.map((r) => { const P = makePerson({ skin: r.skin, top: r.top, pants: r.pants, hair: r.hair, hairStyle: r.hs }); roofCarrier.add(P.root); return P; });
  const walkers = WALKERS.map(([x, z, k]) => { const P = makePerson({ skin: [0xe8b996, 0xc68e66, 0x9a6a4c, 0xf0c8a8, 0xd9a77f][k], top: [0x4f7a6a, 0xc46b5a, 0x3a4660, 0xe0b45a, 0x7a5a8a][k], pants: 0x34405c, hair: 0x3d2a1f, hairStyle: k % 2 ? 'bob' : 'short' }); city.root.add(P.root); return { P, x, z, k }; });
  const cars = TRAFFIC.map((c, i) => { const car = makeCar(c.col, i + 1); city.root.add(car.g); car.setLights(0, 0); return car; });
  const guard = border.guard;

  function update(t) {
    const shot = shotAt(t);
    for (const [k, roots] of Object.entries(ROOTS)) for (const r of roots) r.visible = k === shot.set;
    scene.fog = shot.set === 'city' ? cityFog : null;
    // ---- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u);
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);

    if (shot.set === 'war') {
      // ---- globe: yaw toward the camera, tilt, spin to the wanted longitude
      const gv = globeView(t);
      globe.g.rotation.set(gv.tilt, Math.atan2(camera.position.x, camera.position.z), 0);
      globe.spin.rotation.y = faceLon(gv.lon);
      const n = t < 11.0 ? TOTAL : TOTAL * (1 - easeIO(clamp((t - 11.0) / 3.6)));
      warheads.setAll((i) => clamp((n - perm[i]) / 220)); warheads.commit(); warheads.mesh.visible = n > 0.5;
      bars.setHeights((i) => (t < 30.2 || t > 34.2 ? 0 : K(t, [[30.5 + i * 0.2, 0], [31.6 + i * 0.2, 1]])));
      labs.setAll((i, pt) => (t < 50.0 ? 0 : clamp((t - (50.2 + pt.ci * 0.09)) / 0.3))); labs.commit();
      secret.set(0, clamp((t - 55.0) / 0.25)); secret.commit();
      const rr = clamp((t - 55.0) / 2.6);
      ring.scale.setScalar(0.01 + rr * 0.11); ringMat.opacity = t < 55 ? 0 : 0.85 * (1 - rr);
      set.setGlobeLight(K(t, [[54.5, 1], [56.5, 0.55]]));
      set.lights.redLight.intensity = 14 * smooth((t - 55.0) / 1.2);
      set.lights.key.intensity = K(t, [[55.0, 45], [57.0, 26]]);
      labs.mat.color.setHex(0x6fd0ff).multiplyScalar(2.0 * (1 - 0.6 * smooth((t - 55.0) / 1.5)));
      LEADERS.forEach((L, i) => { applyPose(leaders[i], leaderPose(t, L, i)); leaders[i].root.visible = shot.cam === 'faces'; }); // hidden in globe close-ups (cropped heads)
    }
    if (shot.set === 'silo') silo.setDissolve(t, 10.9, 12.5);
    if (shot.set === 'cap') {
      applyPose(officers[0], officerPose(t, -1));
      applyPose(officers[1], officerPose(t, 1));
      cap.setPanel(1 - clamp((t - 16.2) / 1.0));
    }
    if (shot.set === 'city') {
      city.setShadowFocus(shot.cam === 'roof' ? -11 : 2, shot.cam === 'roof' ? 6 : 8, 30);
      city.setTime({ day: 1, golden: 1, power: 0.0, milky: 0, moon: 0 });
      roofers.forEach((P, i) => applyPose(P, rooferPose(t, i)));
      cars.forEach((car, i) => { const c = TRAFFIC[i], d = (t - 22.2) * c.v; car.g.position.set(c.x, 0, c.x > 0 ? c.z0 - d : c.z0 + d); car.g.rotation.y = c.x > 0 ? PI : 0; });
      walkers.forEach((w, i) => {
        const p = basePose(); const d = (t - 26.0) * 1.15;
        Object.assign(p, { x: w.x, z: w.z - d, rotY: PI, dist: d, speed: 1.15, eyes: blink(t, i), smile: 1 });
        applyPose(w.P, p);
      });
    }
    if (shot.set === 'base') {
      const march = shot.cam === 'parade';
      base.soldiers.forEach(({ P, r, c }) => {
        P.root.visible = march;
        const d = (t - 34.2) * 1.05;
        const p = basePose();
        Object.assign(p, { x: (c - 2.5) * 1.05, z: -5.2 - r * 1.3 + d, rotY: 0, dist: d, speed: 1.05, eyes: 'open', smile: 0 });
        p.headPitch = 0.0;
        applyPose(P, p);
      });
      base.tanks.forEach((T, i) => {
        const z = march ? -40 : -16 + (t - 42.2) * 3.2 - i * 7.5;
        T.g.position.set(0, 0, z); T.setLights(march ? 0 : 1);
      });
    }
    if (shot.set === 'border') {
      border.setTanksAdvance(clamp((t - 38.4) / 3.8), 1);
      const p = basePose();
      Object.assign(p, { x: -1.25, z: 2.2, rotY: PI + 0.1, eyes: blink(t, 4), smile: 0 });
      p.headYaw = -0.5 * smooth((t - 40.4) / 0.6);   // glances back toward the booth (and us)
      p.armA = { sx: 0.03, sz: 0.07, el: -0.2, free: 0 }; p.armB = { sx: 0.03, sz: 0.07, el: -0.2, free: 0 };
      applyPose(guard, p);
    }
    if (shot.set === 'plant') {
      const d = 0.5 + 0.5 * Math.cos(2 * PI * (t - 46.2) / 1.9);   // ~2 day/night cycles = the years going by
      plant.update(t, d);
    }
  }
  return { update };
}
