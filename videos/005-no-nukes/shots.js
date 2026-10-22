// VIDEO 005 — "What if every nuclear weapon disappeared?"   (tone: whatif — world-scale thought experiment)
// 71 s, 11 shots, two sets in one scene (engine/sets/warroom.js: war room with a hologram Earth + a launch capsule).
// Numbers: SIPRI Yearbook 2026 (inventory, Jan 2026): 12,187 total — RUS 5,420 · USA 5,042 · CHN 620 · FRA 370 · GBR 225 ·
// IND 190 · PAK 170 · ISR 90 · PRK 60. Army sizes ≈ IISS Military Balance (active troops, millions). Reactors: IAEA PRIS
// (31 countries + Taiwan). The HUD count and the dots on the globe are the SAME number (dot k is visible while k < count).
//
// Shot list (seconds)                              | what happens
//  0.0– 3.6  title    globe in the dark            | 12,187 red dots glowing on the hologram Earth (title alone)
//  3.6–10.2  arctic   from over the North Pole     | US + Russia face each other across the pole (86% of all warheads)
// 10.2–15.6  vanish   side view                    | midnight: dots go out, HUD rolls 12,187 → 0 in sync
// 15.6–19.0  capBack  launch capsule, from behind  | the red console lights go dark, left → right
// 19.0–22.2  capFace  the two officers             | they turn to each other; nothing left to launch
// 22.2–30.2  room1    war room wide                | DAY 1: leaders straighten up, relief, smiles
// 30.2–38.4  bars     globe, Asia                  | gold columns = army sizes rise (China 2.0M, India 1.5M, NK, Russia...)
// 38.4–46.2  room2    low medium                   | tension: everyone leans in; the smallest leader steps back
// 46.2–53.6  skip     globe spins (years)          | blue dots = reactor countries appear one by one (31)
// 53.6–60.4  reveal   push-in                      | YEAR 3: one red dot lights up in the Indian Ocean — HUD 0 → 1 (gold)
// 60.4–66.6  faces    leaders                      | everyone snaps to look at it, in sync, lit red; fade; end card
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, rng, smooth, easeIO, mat, mk } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { buildWarRoom, buildCapsule, DIMS } from '@engine/sets/warroom.js';
import { makeDots, makeBars, scatter, faceLon } from '@engine/globe.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PI = Math.PI;
const GY = DIMS.globe.y;
const CAP = DIMS.CAP;
const C = (x, y, z) => [CAP[0] + x, CAP[1] + y, CAP[2] + z];

export const SHOTS = [
  { t0: 0, t1: 3.6, cam: 'title' },
  { t0: 3.6, t1: 10.2, cam: 'arctic' },
  { t0: 10.2, t1: 15.6, cam: 'vanish' },
  { t0: 15.6, t1: 19.0, cam: 'capBack' },
  { t0: 19.0, t1: 22.2, cam: 'capFace' },
  { t0: 22.2, t1: 30.2, cam: 'room1' },
  { t0: 30.2, t1: 38.4, cam: 'bars' },
  { t0: 38.4, t1: 46.2, cam: 'room2' },
  { t0: 46.2, t1: 53.6, cam: 'skip' },
  { t0: 53.6, t1: 60.4, cam: 'reveal' },
  { t0: 60.4, t1: 71.0, cam: 'faces' },
];
// p = camera position start→end, a = look-at start→end, fov, amp = handheld drift (m)
// globe shots orbit the globe: G(azimuth, elevation, distance) → camera position (look-at = globe center, nudged up
// by 0.1 so the globe sits a little low in frame, clear of the HUD)
const G = (az, el, d) => [Math.sin(az) * Math.cos(el) * d, GY + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d];
const GA = [0, GY + 0.1, 0];
export const CAMS = {
  title:   { p: [G(0.1, 0.38, 3.1), G(0.22, 0.34, 2.9)], a: [GA, GA], fov: 40, amp: 0.002 },
  arctic:  { p: [G(0.0, 1.05, 2.75), G(0.05, 1.0, 2.6)], a: [GA, GA], fov: 40, amp: 0.002 },
  vanish:  { p: [G(0.0, 0.3, 2.75), G(-0.06, 0.28, 2.55)], a: [GA, GA], fov: 40, amp: 0.002 },
  capBack: { p: [C(0.25, 1.62, 1.55), C(0.18, 1.58, 1.3)], a: [C(0, 1.15, -1.8), C(0, 1.15, -1.8)], fov: 62, amp: 0.003 },
  capFace: { p: [C(0.95, 1.38, -1.35), C(0.9, 1.36, -1.3)], a: [C(-0.42, 1.22, -0.6), C(-0.42, 1.22, -0.6)], fov: 50, amp: 0.003 },
  room1:   { p: [[0.0, 1.8, 3.4], [0.0, 1.74, 3.05]], a: [[0, 1.42, -0.5], [0, 1.42, -0.5]], fov: 52, amp: 0.004 },
  bars:    { p: [G(0.0, 0.45, 2.85), G(0.05, 0.42, 2.65)], a: [GA, GA], fov: 42, amp: 0.002 },
  room2:   { p: [[0.55, 1.45, 2.2], [0.5, 1.42, 1.95]], a: [[0.85, 1.38, -1.25], [0.85, 1.38, -1.25]], fov: 40, amp: 0.004 },
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
  if (t < 15.6) return { lon: K(t, [[10.2, 40], [15.6, 55]]), tilt: 0.38 };
  if (t < 30.2) return { lon: 40 + (t - 15.6) * 1.5, tilt: 0.3 };
  if (t < 38.4) return { lon: K(t, [[30.2, 82], [38.4, 98]]), tilt: 0.42 };
  if (t < 46.2) return { lon: 98 + (t - 38.4) * 1.2, tilt: 0.3 };
  if (t < 53.6) return { lon: K(t, [[46.2, 105], [53.6, 80 + 3 * 360]]), tilt: 0.25 };
  return { lon: 80 + 360 * 3 + (t - 53.6) * 0.6, tilt: -0.37 };   // the secret dot (lat -12) faces the camera, above the subtitles
}

// ---------------------------------------------------------------- leaders around the table
const LEADERS = [ // a = angle around the table (0 = +z, toward the room1 camera); h = height scale
  { a: -1.25, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short', tie: 0x9a2f2f, h: 1.0 },
  { a: PI + 0.75, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob', tie: null, h: 0.97 },
  { a: PI - 1.25, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short', tie: 0x2c3420, h: 1.03, general: true },
  { a: PI + 1.25, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', tie: 0xd8c27a, h: 0.99, glasses: true },
  { a: 1.25, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob', tie: null, h: 0.95 },
  { a: PI - 0.75, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy', tie: 0x2b4f7a, h: 0.88, small: true },
];

function leaderPose(t, L, i) {
  const p = basePose();
  const R = DIMS.ring + (L.small ? 0.02 : 0);
  const face = L.a + PI;                                   // facing the table center
  let x = Math.sin(L.a) * R, z = Math.cos(L.a) * R;
  p.rotY = face; p.eyes = blink(t + i * 0.7, i);
  p.glasses = !!L.glasses;
  const d = i * 0.12;                                       // tiny per-person delay → "in sync" but organic
  const arm = (sx, sz, el, free = 0, twist = 0) => ({ sx, sz, el, free, twist });
  const handsOnTable = arm(-0.62, 0.12, -0.55), rest = arm(0.03, 0.07, -0.2);
  p.headPitch = -0.05;                                    // looking at the globe (slightly up)

  if (t < 30.2) { // DAY 1 — relief: from hands-on-table (stunned) to standing up straight, smiles, a hand to the chest
    const up = K(t, [[23.0 + d, 0], [24.2 + d, 1]]);
    p.lean = lerp(0.28, 0.02, up);
    p.armA = up < 0.5 ? handsOnTable : rest; p.armB = up < 0.5 ? handsOnTable : rest;
    const ua = K(t, [[23.0 + d, 0], [24.2 + d, 1]]);
    p.armA = arm(lerp(-0.62, 0.03, ua), lerp(0.12, 0.07, ua), lerp(-0.55, -0.2, ua));
    p.armB = arm(lerp(-0.62, 0.03, ua), lerp(0.12, 0.07, ua), lerp(-0.55, -0.2, ua));
    if (i === 0 || i === 3) { // hand on chest
      const hc = K(t, [[24.6 + d, 0], [25.4 + d, 1]]);
      p.armB = arm(lerp(0.03, -0.05, hc), lerp(0.07, 0.2, hc), lerp(-0.2, -2.0, hc), 0, lerp(0, -0.9, hc));
    }
    if (i === 2) p.headPitch = K(t, [[24.5, -0.05], [25.5, -0.35]]); // the general looks up, exhales
    p.smile = t > 24.0 + d ? 1 : 0;
    p.headYaw = (i % 2 ? 1 : -1) * 0.25 * smooth((t - 26.0 - d) / 0.8) * (1 - smooth((t - 28.6) / 0.8)); // glance at a neighbour
  } else if (t < 46.2) { // MONTH 6 — tension: lean in, flat mouths; the smallest steps back
    p.smile = 0;
    const lean = K(t, [[39.0 + d, 0.05], [40.0 + d, 0.3]]);
    p.lean = lean;
    p.armA = handsOnTable; p.armB = handsOnTable;
    const hk = K(t, [[39.0 + d, 0], [40.0 + d, 1]]);
    p.armA = arm(lerp(0.03, -0.62, hk), lerp(0.07, 0.12, hk), lerp(-0.2, -0.55, hk));
    p.armB = arm(lerp(0.03, -0.62, hk), lerp(0.07, 0.12, hk), lerp(-0.2, -0.55, hk));
    p.headPitch = K(t, [[39 + d, -0.05], [40 + d, 0.12]]);
    if (L.small) { // steps back from the table, hand to chest
      const back = K(t, [[40.0, 0], [41.4, 0.45]]);
      x = Math.sin(L.a) * (R + back); z = Math.cos(L.a) * (R + back);
      p.lean = 0.02; p.headPitch = -0.08;
      p.armA = arm(0.03, 0.07, -0.2); p.armB = arm(-0.05, 0.2, -2.0, 0, -0.9);
      p.dist = back; p.speed = back > 0.02 && back < 0.43 ? 0.25 : 0;
    }
    if (L.general) { p.armA = arm(0.03, 0.07, -0.2); p.armB = arm(0.03, 0.07, -0.2); p.lean = lean * 0.6; } // general stands back, arms down
  } else { // YEAR 3 — heads down at papers, then everyone snaps to the red dot together
    const snap = K(t, [[60.7 + d, 0], [61.05 + d, 1]], easeIO);
    p.smile = 0;
    p.lean = lerp(0.22, 0.06, snap);
    p.headPitch = lerp(0.42, -0.06, snap);
    p.armA = arm(lerp(-0.5, 0.03, snap), lerp(0.12, 0.07, snap), lerp(-0.6, -0.2, snap));
    p.armB = arm(lerp(-0.5, 0.03, snap), lerp(0.12, 0.07, snap), lerp(-0.6, -0.2, snap));
    p.eyes = t > 60.7 && t < 64 ? 'open' : p.eyes;
    if (L.small) { x = Math.sin(L.a) * (R + 0.45); z = Math.cos(L.a) * (R + 0.45); }
  }
  p.x = x; p.z = z;
  return p;
}

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
  const set = buildWarRoom(studio, { ambient: 0.5 });
  const cap = buildCapsule(studio, {});
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
  // a soft ring that spreads once around the secret dot
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a3c).multiplyScalar(1.8), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), ringMat);
  const sp = globe.toLocal(SECRET.lat, SECRET.lon, 0.005); ring.position.copy(sp); ring.lookAt(sp.clone().multiplyScalar(2)); globe.spin.add(ring);

  // leaders
  const leaders = LEADERS.map((L) => {
    const P = makePerson({ skin: L.skin, top: L.top, collar: 0xf1ede4, pants: L.pants, hair: L.hair, hairStyle: L.hairStyle, glasses: L.glasses });
    P.root.scale.setScalar(L.h);
    if (L.tie) { const tie = mk(new RoundedBoxGeometry(0.045, 0.2, 0.02, 2, 0.008), mat(L.tie, 0.6), P.spine, 0, 0.42, 0.13); tie.rotation.x = -0.12; }
    if (L.general) { // shoulder boards + cap-less medal bar
      for (const s of [-1, 1]) mk(new RoundedBoxGeometry(0.11, 0.018, 0.08, 2, 0.006), mat(0xd8c27a, 0.4), P.spine, s * 0.2, 0.52, 0);
      mk(new RoundedBoxGeometry(0.08, 0.03, 0.01, 2, 0.004), mat(0xb03a2e, 0.5), P.spine, -0.08, 0.4, 0.135);
    }
    scene.add(P.root); return P;
  });
  // capsule officers (dark blue flight suits)
  const officers = [-1, 1].map((s) => {
    const P = makePerson({ skin: s < 0 ? 0xe2ad8c : 0xb07a56, top: 0x3c4a63, collar: 0x2c3648, pants: 0x3c4a63, hair: s < 0 ? 0x4a3020 : 0x1d1a18, hairStyle: s < 0 ? 'bob' : 'short' });
    for (const k of [-1, 1]) if (k === 1) mk(new RoundedBoxGeometry(0.07, 0.07, 0.01, 2, 0.006), mat(0xc9a25a, 0.4), P.spine, 0.09, 0.42, 0.135); // patch
    scene.add(P.root); return P;
  });

  const _c = new THREE.Vector3();
  function update(t) {
    const shot = shotAt(t);
    // ---- camera
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u);
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], e)), c.a[0].map((v, i) => lerp(v, c.a[1][i], e)), c.fov, t, c.amp);

    // ---- globe: yaw toward the camera, tilt, spin to the wanted longitude
    const gv = globeView(t);
    const az = Math.atan2(camera.position.x, camera.position.z);
    const inRoom = camera.position.x < 20;
    globe.g.rotation.set(gv.tilt, inRoom ? az : 0, 0);
    globe.spin.rotation.y = faceLon(gv.lon);

    // warheads: visible while rank < HUD count
    const n = t < 11.0 ? TOTAL : TOTAL * (1 - easeIO(clamp((t - 11.0) / 3.6)));
    warheads.setAll((i) => clamp((n - perm[i]) / 220));
    warheads.commit();
    warheads.mesh.visible = n > 0.5;

    // army columns rise (biggest first), stay faintly afterwards
    bars.setHeights((i) => (t < 30.2 ? 0 : K(t, [[31.0 + i * 0.28, 0], [32.2 + i * 0.28, 1]])) * (t < 46.2 ? 1 : 1 - smooth((t - 46.2) / 1.0)));
    // reactor countries light up through the time skip, one country at a time
    labs.setAll((i, pt) => (t < 46.6 ? 0 : clamp((t - (46.8 + pt.ci * 0.18)) / 0.35)));
    labs.commit();
    // the secret one (55.0) + its ring
    const sOn = clamp((t - 55.0) / 0.25);
    secret.set(0, sOn); secret.commit();
    const rr = clamp((t - 55.0) / 2.6);
    ring.scale.setScalar(0.01 + rr * 0.11); ringMat.opacity = t < 55 ? 0 : 0.85 * (1 - rr);

    // hologram + red light
    set.setGlobeLight(K(t, [[54.5, 1], [56.5, 0.55]]));
    set.lights.redLight.intensity = 14 * smooth((t - 55.0) / 1.2);
    set.lights.key.intensity = K(t, [[55.0, 60], [57.0, 32]]);
    labs.mat.color.setHex(0x6fd0ff).multiplyScalar(2.0 * (1 - 0.6 * smooth((t - 55.0) / 1.5)));

    // ---- people
    const roomShot = shot.cam === 'room1' || shot.cam === 'room2' || shot.cam === 'faces';
    LEADERS.forEach((L, i) => { applyPose(leaders[i], leaderPose(t, L, i)); leaders[i].root.visible = roomShot; }); // hidden in globe close-ups (they'd be cropped heads)
    applyPose(officers[0], officerPose(t, -1));
    applyPose(officers[1], officerPose(t, 1));

    // ---- capsule console: lights sweep out left → right
    cap.setPanel(1 - clamp((t - 16.2) / 1.0));
  }
  return { update };
}
