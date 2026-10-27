// VIDEO 022 — "What if your ballsack doubled in size every minute?"  (tone: FUNNY doubling-POV, unhinged lane / weird tier, @ed._.studios)
// A "you" escalation told through LOGISTICS: at 9:00 AM it doubles every minute and the world tries to cope — the elevator empties,
// the doctor faints, the tailor runs out of tape, a wheelbarrow, the biggest rental truck, a tower crane, a science press briefing,
// a ZIP code, satellites, and finally Earth orbits it. At 9:28 you finally sit down (on top of it) and your coffee is still warm.
// TIKTOK RULE: the anatomy is NEVER modeled. On screen it is only ever (a) a camera-facing pixel CENSOR block (haul.js makeCensor:
// denim blues, drawn over everything like an edit in post) or (b) a blue TARP load tied with ropes (one lumpy mound / a round
// "planet"), with a censor patch on it. Everyone's faces + the props + the HUD do the joke. Nothing sexual: medical + slapstick.
// HUD = YOUR BALLSACK · WIDTH (6 cm × 2^minute, fmt 'len') + MINUTE n · 9:0n AM; one real, sourced number per beat in the stat line.
// 63.5 s, 14 shots, 10 sets parked at offsets in one scene (one visible per shot; city.js stays at the origin).
// NEW (additive): engine/haul.js (censor, tarp load, wheelbarrow, box truck, tower crane, lawn chair, tape, clothes rack, road sign,
//   mosaic flag), engine/sets/elevator.js, clinic.js, tailor.js; core.js HUD fmt:'len' + geo rolls (byte-identical to 020's).
//
// Sources (checked Oct 26 2026):
//   one testicle ≈ 4 × 3 × 2 cm — Healthline "Average testicle size"; Medical News Today 326432 (Cleveland Clinic gives 15–35 mL)
//   U.S. practicing urologists 14,176 (2023) — American Urological Association, 2023 AUA Census press release
//   a tailor's tape measure is 60 in / 150 cm — standard length (any sewing supplier)
//   6 cu ft contractor wheelbarrow rated ~396 lb (180 kg) — reseller spec sheets for steel-tray model ND149 (some models 600 lb)
//   biggest consumer rental truck = 26 ft (7.9 m), ~1,700 cu ft, ~10,000 lb payload — U-Haul / UPack truck-size guides
//   a typical tower crane lifts ~18 t max — HowStuffWorks "How Tower Cranes Work"; Liebherr spec pages (larger models 36 t)
//   tallest building: Burj Khalifa, 828 m — CTBUH
//   U.S. ZIP codes 41,561 (Dec 2024) — zip-codes.com ZIP code statistics (USPS adds/retires codes monthly)
//   ~13,000 active satellites (1 Oct 2025) — Look Up × Le Point barometer (McDowell: ~11,700 in May 2025)
//   Earth's mean diameter 12,742 km — NASA Earth fact sheet
//   U.S. adults sit ~6.4 h a day — Yang et al., JAMA (2019) "Trends in sedentary behavior among the US population, 2001–2016"
//
// Width ladder W(n) = 6 cm × 2^n: M1 12 cm · M2 24 · M3 48 · M4 96 cm · M5 1.92 m · M6 3.84 · M7 7.68 · M8 15.4 · M9 30.7 · M10 61.4 ·
//   M12 246 m · M13 492 · M14 983 m (> 828 m) · M15 1.97 km · M16 3.93 · M20 62.9 · M22 252 · M26 4,027 · M27 8,053 · M28 16,106 km (> 12,742).
//
// Shot list (seconds)                     | set     | what happens
//  0.0– 8.9  elev    title, MINUTE 0 → 1   | elevator| you + 4 office riders; 5.5 BOOM: a censor block pops on your jeans, every head snaps down; DING, they all bolt
//  8.9–14.2  doc     MINUTE 2 → 3          | clinic  | the doctor peeks under the lap sheet; 9.9 BOOM, he faints flat; "turn your head and cough"; 12.4 BOOM: the sheet flies,
//                                          |         | doctor #2 is knocked over, colleagues in the doorway topple; the fainted doctor gives a thumbs-up from the floor
// 14.2–19.4  tailor  MINUTE 4 → 5          | tailor  | on the fitting pedestal; the tailor's tape across the block; 17.6 BOOM: the block covers you to the chin, the tailor
//                                          |         | flies into the suit rack (it tips, suits fly), a dress form falls
// 19.4–24.4  barrow  MINUTE 6 → 7          | suburb  | you push a wheelbarrow with a 3.8 m tarp load past staring neighbors; 22.8 BOOM: the barrow is crushed, you sit down hard
// 24.4–29.4  truck   MINUTE 7 → 8          | street  | two movers cram it into a 26-ft truck (the box bulges); 27.6 BOOM: the walls + roof blow off, the truck ends up ON TOP
// 29.4–31.9  craneTop MINUTE 9             | city    | you sit on top of the tarp load hanging from a tower crane, waving; 29.7 BOOM under you
// 31.9–34.6  craneWide MINUTE 10           | city    | wide: 32.6 BOOM, the crane folds and the 61 m load drops on the intersection (dust, the corner crowd flees)
// 34.6–38.3  pressA  MINUTE 12 → 14        | podium  | a scientist presents "SIZE vs THE TALLEST BUILDING"; the pixel bar passes 828 m at 38.0
// 38.3–39.8  pressB  MINUTE 14             | podium  | reverse on the press: every chair tips back in sync, flash storm
// 39.8–45.0  zip     MINUTE 15 → 16        | suburb  | a mail carrier nails up "NOW ENTERING · ZIP 41562", a tarp mountain on the horizon; 42.6 BOOM: snow cap, clouds, shade, letters fly
// 45.0–47.4  orbit   MINUTE 20             | space   | from orbit: the tarp load on North America under a pixel block, satellites swerve
// 47.4–50.2  war     MINUTE 22             | warroom | analysts around the hologram globe; 47.7 BOOM: the censor on the globe grows, they all lean back
// 50.2–55.4  earth   MINUTE 26 → 28        | space   | wide: a blue tarp planet on top of Earth; 53.0 BOOM: bigger than Earth; Earth starts to orbit it
// 55.4–63.5  sit     9:28 AM               | perch   | you on a lawn chair on top of it, a censor flag planted, Earth rising, your coffee still steaming. End card 59.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, rng, mat, mk, canvasTex, easeIO } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeDog } from '@engine/props.js';
import { makeCensor, makeTarpBall, makeWheelbarrow, makeBoxTruck, makeTowerCrane, makeLawnChair, makeTape, makeRoadSign, makeMosaicFlag } from '@engine/haul.js';
import { buildElevator } from '@engine/sets/elevator.js';
import { buildClinic, DIMS as CL } from '@engine/sets/clinic.js';
import { buildTailor, DIMS as TL } from '@engine/sets/tailor.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildWarRoom } from '@engine/sets/warroom.js';
import { buildSpace, makeSatellite, makeSpritePool } from '@engine/sets/tech.js';
import { faceLon } from '@engine/globe.js';

const PI = Math.PI;
const SIT = HIP_H - 0.17;                 // pelvis-bottom offset: sitting root = seat − SIT
const HC = 0.9;                           // body center above the feet (flying bodies)
const W = (n) => 0.06 * 2 ** n;           // width in meters at minute n
// every doubling on screen [time, minute] — keep in sync with make_story.py + make_cues.py
const BOOMS = [[5.5, 1], [9.9, 2], [12.4, 3], [14.5, 4], [17.6, 5], [19.7, 6], [22.8, 7], [27.6, 8], [29.7, 9], [32.6, 10], [34.9, 12], [36.5, 13],
  [38.0, 14], [40.0, 15], [42.6, 16], [45.2, 20], [47.7, 22], [50.4, 26], [51.6, 27], [53.0, 28]];
const OFF = { city: [0, 0, 0], elev: [2000, 0, 0], clinic: [4000, 0, 0], tailor: [6000, 0, 0], burb: [8000, 0, 0], street: [11000, 0, 0],
  press: [14000, 0, 0], war: [16000, 0, 0], space: [40000, 0, 0], perch: [60000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 8.9, cam: 'elev', set: 'elev' },
  { t0: 8.9, t1: 13.05, cam: 'doc', set: 'clinic' },
  { t0: 13.05, t1: 14.2, cam: 'docFloor', set: 'clinic' },
  { t0: 14.2, t1: 19.4, cam: 'tailor', set: 'tailor' },
  { t0: 19.4, t1: 24.4, cam: 'barrow', set: 'burb' },
  { t0: 24.4, t1: 29.4, cam: 'truck', set: 'street' },
  { t0: 29.4, t1: 31.9, cam: 'craneTop', set: 'city' },
  { t0: 31.9, t1: 34.6, cam: 'craneWide', set: 'city' },
  { t0: 34.6, t1: 38.3, cam: 'pressA', set: 'press' },
  { t0: 38.3, t1: 39.8, cam: 'pressB', set: 'press' },
  { t0: 39.8, t1: 45.0, cam: 'zip', set: 'burb' },
  { t0: 45.0, t1: 47.4, cam: 'orbit', set: 'space' },
  { t0: 47.4, t1: 50.2, cam: 'war', set: 'war' },
  { t0: 50.2, t1: 55.4, cam: 'earth', set: 'space' },
  { t0: 55.4, t1: 63.5, cam: 'sit', set: 'perch' },
];
// cameras: keys = [[t, pos, aim], …] in the set's LOCAL coords (eased between keys); fov; amp = handheld drift
export const CAMS = {
  elev:      { keys: [[0, [0.15, 1.45, 4.9], [0, 1.2, -0.4]], [5.4, [0.1, 1.4, 4.1], [0, 1.15, -0.4]], [8.9, [0.05, 1.36, 3.55], [0, 1.1, -0.45]]], fov: 50 },
  doc:       { keys: [[8.9, [-0.85, 1.5, 2.95], [0.22, 1.18, -0.85]], [14.2, [-0.7, 1.45, 2.7], [0.27, 1.15, -0.85]]], fov: 54 },
  docFloor:  { keys: [[13.05, [0.35, 1.8, 2.55], [1.45, 0.3, 0.45]], [14.2, [0.4, 1.72, 2.45], [1.45, 0.28, 0.45]]], fov: 52 },
  tailor:    { keys: [[14.2, [0.55, 1.55, 3.5], [0.3, 1.38, -0.75]], [17.6, [0.5, 1.55, 3.3], [0.3, 1.38, -0.75]], [19.4, [0.55, 1.65, 3.6], [0.35, 1.42, -0.8]]], fov: 54 },
  barrow:    { keys: [[19.4, [-0.9, 1.5, 10.5], [-0.9, 1.6, -1.5]], [22.8, [0.3, 1.5, 10.5], [0.3, 1.6, -1.5]], [23.4, [1.2, 4.2, 10.4], [1.6, 2.4, -2.0]], [24.4, [1.3, 4.3, 10.4], [1.6, 2.4, -2.0]]], fov: 58 },
  truck:     { keys: [[24.4, [-12.0, 1.75, 9.0], [-3.6, 1.95, 0.9]], [27.6, [-11.4, 1.75, 8.6], [-3.6, 2.0, 0.9]], [28.3, [-27.0, 5.0, 4.6], [-2.0, 6.0, 1.5]], [29.4, [-28.0, 5.3, 4.8], [-2.0, 6.2, 1.5]]], fov: 50 },
  craneTop:  { keys: [], fov: 52 },     // follows "you" on top of the load (update)
  craneWide: { keys: [[31.9, [2.5, 7.0, 104.0], [-8.0, 29.0, -6.0]], [32.6, [2.3, 6.8, 100.0], [-8.0, 28.0, -6.0]], [34.6, [2.8, 8.0, 112.0], [-5.0, 22.0, -6.0]]], fov: 52 },
  pressA:    { keys: [[34.6, [0.7, 2.0, 3.7], [-0.55, 1.78, -3.3]], [38.3, [0.5, 1.95, 3.2], [-0.55, 1.78, -3.3]]], fov: 50 },
  pressB:    { keys: [[38.3, [0.75, 2.0, -3.75], [-0.1, 1.05, 1.6]], [39.8, [0.7, 2.05, -3.5], [-0.1, 1.05, 1.6]]], fov: 56 },
  zip:       { keys: [[39.8, [66.0, 1.5, 3.0], [40.0, 4.4, 0.2]], [45.0, [64.6, 1.5, 2.9], [40.0, 4.9, 0.2]]], fov: 52 },
  orbit:     { keys: [], fov: 48 },     // built from the ball's surface frame (update)
  war:       { keys: [[47.4, [0.3, 1.95, 4.3], [0, 1.45, -0.2]], [50.2, [0.25, 1.9, 3.8], [0, 1.45, -0.2]]], fov: 52 },
  earth:     { keys: [], fov: 40 },
  sit:       { keys: [[55.4, [1.35, 1.1, 3.5], [0.05, 0.95, 0]], [59.6, [0.6, 1.02, 2.6], [0.05, 0.92, 0]], [63.5, [0.45, 1.0, 2.4], [0.05, 0.92, 0]]], fov: 46 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
function camAt(c, t) {
  const k = c.keys; if (t <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) { const u = easeIO((t - k[i][0]) / (k[i + 1][0] - k[i][0])); return [k[i][1].map((v, j) => lerp(v, k[i + 1][1][j], u)), k[i][2].map((v, j) => lerp(v, k[i + 1][2][j], u))]; }
  const l = k[k.length - 1]; return [l[1], l[2]];
}

// arm presets: A(sx, sz, el, twist, free)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CUP_B = A(-0.55, 0.2, -1.6, -0.5);                                             // to-go cup at the chest
const SIP_B = A(-1.3, 0.25, -2.35, -0.5);                                              // cup at the mouth
const PHONE_A = A(-0.8, 0.15, -1.9, 0.5);                                              // phone in front of the chest
const SHRUG_A = A(-0.2, 0.9, -1.4, 0.4), SHRUG_B = A(-0.2, 0.9, -1.4, -0.4);
const UP_A = A(-2.6, 0.45, -0.4), UP_B = A(-2.6, 0.45, -0.4);                          // hands up (startled)
const PUSH_A = A(-1.35, 0.12, -0.3, 0.2), PUSH_B = A(-1.35, 0.12, -0.3, -0.2);         // pushing something ahead
const HANDLE_A = A(-0.45, 0.1, -0.35, 0.2), HANDLE_B = A(-0.45, 0.1, -0.35, -0.2);     // wheelbarrow handles
const POINT_B = A(-1.5, 0.35, -0.1, -0.2);                                             // pointing ahead
const TALK_B = A(-0.85, 0.35, -1.15, -0.35);
const MOUTH_A = A(-1.25, -0.05, -2.4, 0.7);                                            // hand over mouth (cough)
const WAVE_B = (t) => A(-2.5, 0.75, -0.6 - 0.35 * Math.sin(t * 9), -0.2);
const HIPS_A = A(0.2, 0.72, -1.9, 1.35), HIPS_B = A(0.2, 0.72, -1.9, -1.35);
const BACK_A = A(0.9, 0.6, -0.2, 0.3), BACK_B = A(0.9, 0.6, -0.2, -0.3);               // flung backward, arms trailing
const CAM_B = A(-1.15, 0.12, -2.05, -0.65);                                            // camera/phone up at the face
const TAPE_A = A(-1.0, 1.0, -0.15, 0.3), TAPE_B = A(-1.05, 0.25, -0.4, -0.3);         // tape stretched wide
const THUMB_B = A(-1.6, 0.15, -0.25, -0.2);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const easeOutBack = (u) => { const c1 = 1.70158, c3 = c1 + 1; u = clamp(u); return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

/** minute + growth state at t: n (current), p (previous), age since the last doubling */
function minuteAt(t) { let n = 0, p = 0, tb = -99; for (const [b, m] of BOOMS) if (t >= b) { p = n; n = m; tb = b; } return { n, p, age: t - tb }; }
/** a grow curve between two sizes: fast overshoot (0.22 s) then a little wobble */
function grow(a, b, age) {
  if (a <= 0) return b * (age < 0.22 ? easeOutBack(age / 0.22) : 1 + 0.06 * Math.sin((age - 0.22) * 20) * Math.exp(-(age - 0.22) * 6));
  if (age < 0.22) return a * Math.pow(b / a, easeOutBack(age / 0.22));
  return b * (1 + 0.06 * Math.sin((age - 0.22) * 20) * Math.exp(-(age - 0.22) * 6));
}
/** size (m) of the thing at t, through a per-beat visual map f(n) (cheats for space) */
function sizeAt(t, f = W) { const { n, p, age } = minuteAt(t); return n === 0 ? f(0) : grow(f(p), f(n), age); }

export async function build(studio, story) {
  const { scene } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('green'); city.setGrowth(0); city.setSnow(0);
  const elev = buildElevator(studio, {}); elev.root.position.set(...OFF.elev);
  const clinic = buildClinic(studio, {}); clinic.root.position.set(...OFF.clinic);
  const tailor = buildTailor(studio, {}); tailor.root.position.set(...OFF.tailor);
  tailor.rack.g.position.set(1.45, 0, -1.55); tailor.rack.g.rotation.y = -0.55; tailor.forms[0].pivot.position.set(-0.8, 0, -1.9);
  const burb = buildSuburb(studio, { poleClear: [-8, -4, 0, 4, 46, 50, 54, 58, 62] }); burb.root.position.set(...OFF.burb);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const war = buildWarRoom(studio, {}); war.root.position.set(...OFF.war);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const perch = new THREE.Group(); perch.position.set(...OFF.perch); scene.add(perch);
  const ROOTS = { city: city.root, elev: elev.root, clinic: clinic.root, tailor: tailor.root, burb: burb.root, street: street.root, press: press.root, war: war.root, space: space.root, perch };
  const FOGS = { city: cityFog, elev: null, clinic: null, tailor: null, burb: burb.fog, street: streetFog, press: null, war: null, space: null, perch: null };
  const FAR = { city: 1500, elev: 40, clinic: 40, tailor: 40, burb: 400, street: 400, press: 60, war: 60, space: 9000, perch: 900 };
  const SUN0 = burb.lights.sun.intensity, HEMI0 = burb.lights.hemi.intensity;
  const burbSky = burb.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300);

  // ---------------------------------------------------------------- cast
  const R = rng(22);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); return p; };
  const you = person({ skin: 0xe2ad8c, top: 0x3f8f7a, pants: 0x5d7fa8, shoes: 0xf4f1ea, hair: 0x3a2618, hairStyle: 'messy', headR: 0.14 });
  const pool = Array.from({ length: 14 }, (_, i) => {
    const style = STYLES[i % STYLES.length];
    const p = person({ skin: pick(SKINS), top: TOPS[(i * 3) % TOPS.length], collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style,
      glasses: i % 4 === 1, mustache: style === 'short' && R() < 0.3 ? pick(HAIRS.slice(0, 3)) : null });
    p.glasses = i % 4 === 1; return p;
  });
  const coat = (o) => person({ top: 0xf6f7f8, collar: 0x7fb6d6, pants: 0x45607a, ...o });
  const doc1 = coat({ skin: 0xf1c3a1, hair: 0xc9c4be, hairStyle: 'short', glasses: true, mustache: 0x9a948c }); doc1.glasses = true;
  const doc2 = coat({ skin: 0x9a6447, hair: 0x1a1a1a, hairStyle: 'bob', pants: 0x2f3a4a });
  const peek = [coat({ skin: 0xe2ad8c, hair: 0x5a3a24, hairStyle: 'messy' }), coat({ skin: 0xc98e6a, hair: 0x1a1a1a, hairStyle: 'short', glasses: true }), coat({ skin: 0xf3d0b5, hair: 0xd9b46a, hairStyle: 'bob' })];
  peek[1].glasses = true;
  const nurse = person({ skin: 0xf1c3a1, top: 0x58b3a8, pants: 0x58b3a8, hair: 0x5a3a24, hairStyle: 'bob' });
  const tailorM = person({ skin: 0xf1c3a1, top: 0x6b4a3a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0xe8e4de, hairStyle: 'short', glasses: true, mustache: 0xe8e4de }); tailorM.glasses = true;
  const movers = [0, 1].map((i) => person({ skin: i ? 0x9a6447 : 0xe2ad8c, top: 0xe8762b, pants: 0x2f3a4a, hair: i ? 0x1a1a1a : 0x9a6a3a, hairStyle: i ? 'short' : 'messy' }));
  const sci = person({ skin: 0xd9a37f, top: 0xf6f7f8, collar: 0x2f3a4a, pants: 0x3a3d42, hair: 0xc9c4be, hairStyle: 'none', glasses: true, mustache: 0x6a6460 }); sci.glasses = true;
  const carrier = person({ skin: 0xc98e6a, top: 0x3f5f8a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short' });
  const kid = person({ skin: 0xe9b48f, top: 0xf1c24a, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'messy', headR: 0.175 });
  const dog = makeDog(); scene.add(dog.g);

  // props held / worn
  const cupG = new THREE.Group(); you.arms.find((a) => a.s === 1).hand.add(cupG); cupG.position.set(0, -0.05, 0.05);
  mk(new THREE.CylinderGeometry(0.042, 0.032, 0.13, 16), mat(0xf4f1ea, 0.6), cupG, 0, 0.02, 0);
  mk(new THREE.CylinderGeometry(0.045, 0.045, 0.045, 16), mat(0xb8875a, 0.8), cupG, 0, 0.0, 0);
  mk(new THREE.CylinderGeometry(0.046, 0.044, 0.018, 16), mat(0x5a3a24, 0.5), cupG, 0, 0.094, 0);
  const phone = mk(new THREE.BoxGeometry(0.07, 0.14, 0.01), mat(0x1d1d22, 0.3), pool[0].arms.find((a) => a.s === -1).hand, 0, -0.05, 0.03); phone.rotation.x = -0.3;
  const penlight = mk(new THREE.CylinderGeometry(0.008, 0.008, 0.13, 8), mat(0xc9ccd2, 0.3, { metalness: 0.7 }), doc1.arms.find((a) => a.s === 1).hand, 0, -0.05, 0.03); penlight.rotation.x = PI / 2;
  const clip = mk(new THREE.BoxGeometry(0.22, 0.3, 0.015), mat(0xb8875a, 0.6), nurse.arms.find((a) => a.s === -1).hand, 0, -0.08, 0.06); clip.rotation.x = -0.4;
  const steth = mk(new THREE.TorusGeometry(0.11, 0.008, 6, 20, PI), mat(0x2a2d31, 0.5), doc2.spine, 0, 0.5, 0.06); steth.rotation.set(PI / 2 + 0.3, 0, PI);
  const hammer = new THREE.Group(); carrier.arms.find((a) => a.s === 1).hand.add(hammer); hammer.position.set(0, -0.04, 0.02);
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), mat(0x8a5a34, 0.6), hammer, 0, -0.12, 0); mk(new THREE.BoxGeometry(0.1, 0.035, 0.035), mat(0x4a4d52, 0.4, { metalness: 0.6 }), hammer, 0, -0.27, 0);
  const bag = mk(new THREE.BoxGeometry(0.3, 0.26, 0.1), mat(0x6b4a3a, 0.7), carrier.spine, 0.18, 0.05, -0.05); void bag;
  const tablets = [0, 1, 2, 3].map((i) => mk(new THREE.BoxGeometry(0.16, 0.22, 0.012), mat(0x2a2d31, 0.4), pool[i].arms.find((a) => a.s === 1).hand, 0, -0.06, 0.05));
  const pressCams = pool.slice(0, 10).map((p) => { const c = new THREE.Group(); p.arms.find((a) => a.s === 1).hand.add(c); c.position.set(0, -0.04, 0.07); mk(new THREE.BoxGeometry(0.13, 0.09, 0.08), mat(0x1d1d22, 0.4), c); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12), mat(0x111111, 0.3), c, 0, 0, 0.06).rotation.x = PI / 2; c.visible = false; return c; });

  // ---------------------------------------------------------------- the thing: censor blocks + tarp loads
  const cen = makeCensor({ seed: 5 }); scene.add(cen.sp);
  const cen2 = makeCensor({ seed: 9 }); scene.add(cen2.sp);
  const loadA = makeTarpBall({ seed: 3 }); scene.add(loadA.g);              // barrow / truck / crane / ZIP mountain
  const loadZ = makeTarpBall({ seed: 7 }); scene.add(loadZ.g);              // the ZIP mountain (fog-free haze-tinted material)
  loadZ.mesh.material = loadZ.mat.clone(); loadZ.mesh.material.fog = false; loadZ.mesh.material.color.setHex(0xa8b8cc); loadZ.mesh.material.emissive = new THREE.Color(0x8796ad); loadZ.mesh.material.emissiveIntensity = 0.75;
  loadZ.body.children.forEach((c) => { if (c !== loadZ.mesh && c.material) { c.material = c.material.clone(); c.material.fog = false; } });
  const snowCap = mk(new THREE.SphereGeometry(1.025, 64, 16, 0, PI * 2, 0, 0.62), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, fog: false, transparent: true, emissive: new THREE.Color(0xe8eef6), emissiveIntensity: 0.85 }), loadZ.body, 0, 0.92, 0);
  // a round tarp "planet" for space (center at its origin, radius 1)
  const planet = new THREE.Group(); scene.add(planet);
  mk(new THREE.SphereGeometry(1, 96, 64), loadA.mat, planet);
  for (const [rx, rz] of [[PI / 2, 0], [0.4, 0.2], [PI / 2 + 0.6, 1.1]]) { const r = mk(new THREE.TorusGeometry(1.004, 0.006, 6, 128), mat(0xd9c39a, 0.8), planet); r.rotation.set(rx, 0, rz); }
  planet.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });

  // ---------------------------------------------------------------- FX: impact starbursts + dust puffs, camera jolts
  const puffs = makeSpritePool(scene, 90, 'smoke'); const puffCol = new THREE.Color(0xf2ece2);
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0;
  /** an impact at time m, position p (LOCAL to set key): starburst + dust puffs, size s (≈ meters) */
  function impact(t, m, key, p, s = 1, star = true) {
    const age = t - m; if (age < 0 || age > 0.9) return;
    const o = OFF[key], w = V3(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
    if (star && age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    for (let k = 0; k < 5 && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + k * 1.3, r = (0.12 + age * 0.9) * s;
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y - 0.15 * s + k * 0.06 * s + age * 0.3 * s, w.z + Math.sin(a) * r * 0.6), (0.3 + age * 0.9) * s, 0.8 * (1 - age / 0.9) ** 1.5, puffCol);
    }
  }
  const jolts = [];

  // ---------------------------------------------------------------- placement helpers
  function show(rig, key, p, o = {}) {
    p.x += OFF[key][0]; p.y = (p.y || 0) + OFF[key][1]; p.z += OFF[key][2];
    if (p.floor !== undefined) p.floor += OFF[key][1];
    if (rig.glasses) p.glasses = true;
    applyPose(rig, p);
    rig.root.rotation.x = o.tilt || 0; rig.root.rotation.z = o.roll || 0;
    rig.root.scale.setScalar(o.s || 1);
    rig.root.visible = true;
  }
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _c = new THREE.Vector3();
  /** pose a rig by its BODY CENTER C (local): yaw/tilt/roll orient the whole body (flying). Legs hang. */
  function showC(rig, key, p, C, yaw, tilt = 0, roll = 0) {
    _e.set(tilt, yaw, roll); _c.set(0, HC, 0).applyEuler(_e);
    p.x = C[0] - _c.x; p.y = C[1] - _c.y; p.z = C[2] - _c.z; p.rotY = yaw; p.floor = p.y - 2.5;
    show(rig, key, p, { tilt, roll });
  }
  const pose = (o) => Object.assign(basePose(), o);
  const sitPose = (o, seat, feet = seat - 0.45) => pose({ y: seat - SIT, footFwd: 0.42, floor: feet, ...o });
  /** crotch point of a posed rig (world), pushed forward f along its facing and down d */
  function crotch(rig, f = 0.1, d = 0) { rig.root.updateMatrixWorld(true); return rig.pelvis.localToWorld(V3(0, -0.06 - d, 0.06 + f)); }
  const camPos = new THREE.Vector3();
  /** the censor block on a point (world), nudged toward the camera */
  function censorAt(c, w, size, toward = 0.15) { c.sp.visible = size > 0.005; c.setSize(size); c.sp.position.copy(w).addScaledVector(camPos.clone().sub(w).normalize(), toward); }
  const headAt = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

  // ================================================================ 1. ELEVATOR
  const RIDERS = [[-0.72, -0.55], [0.72, -0.5], [-0.66, 0.12], [0.7, 0.15]];
  const YOU_EL = [0.0, -0.45], DING = 7.3;
  function riderPose(t, i) {
    const [x0, z0] = RIDERS[i], p = pose({ x: x0, z: z0, rotY: 0 }); p.eyes = blink(t, i + 3); p.mouth = 'flat';
    p.headYaw = 0.12 * Math.sin(t * 0.5 + i * 2); p.lean = 0.02 * Math.sin(t * 0.7 + i);
    if (i === 0) { p.armA = PHONE_A; p.headPitch = 0.45; }
    if (i === 3 && t > 3.6 && t < 4.6) { p.armA = A(-1.1, 0.3, -1.7, 0.9); p.headPitch = 0.35; p.headYaw = -0.4; }   // checks a watch
    const look = 5.5 + 0.07 * i;
    if (t > look) {
      const want = headAt(x0, z0, YOU_EL[0], YOU_EL[1]);
      const body = Math.abs(want) > 1.1 ? want - Math.sign(want) * 1.0 : 0;
      const k = K(t, [[look, 0], [look + 0.18, 1]]);
      p.rotY = lerpAngle(0, body, k); p.headYaw = lerp(p.headYaw, want - body, k);
      p.headPitch = lerp(p.headPitch, i >= 2 ? 0.55 : 0.75, k) - 0.8 * K(t, [[6.6 + 0.05 * i, 0], [6.85 + 0.05 * i, 1]]);
      p.mouth = t > look + 0.12 ? 'o' : 'flat'; p.lean = -0.06 * k;
      if (i === 0) p.armA = mixArm(PHONE_A, A(-0.4, 0.2, -1.2, 0.5), k);
    }
    const go = DING + 0.15 + [0.25, 0.32, 0.0, 0.08][i];
    if (t > go) { // bolt out of the door: to the opening, then off to the side
      const side = x0 < 0 ? -1 : 1, mid = [x0 * 0.5, 1.15], end = [side * 2.6, 2.6];
      const d1 = Math.hypot(mid[0] - x0, mid[1] - z0), d2 = Math.hypot(end[0] - mid[0], end[1] - mid[1]), v = 2.3, s = (t - go) * v;
      let x, z, head;
      if (s < d1) { x = lerp(x0, mid[0], s / d1); z = lerp(z0, mid[1], s / d1); head = headAt(x0, z0, mid[0], mid[1]); }
      else { const u = Math.min(1, (s - d1) / d2); x = lerp(mid[0], end[0], u); z = lerp(mid[1], end[1], u); head = headAt(mid[0], mid[1], end[0], end[1]); }
      Object.assign(p, { x, z, rotY: head, dist: s, speed: v, headYaw: 0, headPitch: 0, lean: 0.15, mouth: 'o' });
      p.armA = REST; p.armB = REST;
    }
    return p;
  }
  function youElev(t) {
    const p = pose({ x: YOU_EL[0], z: YOU_EL[1], rotY: 0 }); p.eyes = blink(t, 1); p.mouth = 'flat';
    p.armB = CUP_B; p.armA = REST; p.headPitch = -0.12 + 0.05 * Math.sin(t * 0.6); p.headYaw = 0.1 * Math.sin(t * 0.4);
    const sip = K(t, [[2.2, 0], [2.5, 1], [2.9, 1], [3.2, 0]]); p.armB = mixArm(CUP_B, SIP_B, sip);
    if (t > 5.55) { const k = K(t, [[5.55, 0], [5.75, 1]]); p.headPitch = lerp(p.headPitch, 0.6, k) - 0.62 * K(t, [[6.45, 0], [6.7, 1]]); p.headYaw *= 1 - k; p.mouth = t < 6.5 ? 'o' : 'flat'; p.lean = -0.05 * k; }
    if (t > 7.85) { const k = K(t, [[7.85, 0], [8.15, 1]]); p.armA = mixArm(REST, SHRUG_A, k); p.armB = mixArm(CUP_B, A(-0.55, 0.75, -1.55, -0.55), k); p.headRoll = 0.12 * k; }
    return p;
  }

  // ================================================================ 2. CLINIC
  const [TX, TZ] = CL.table, SEAT = CL.top, YOU_CL = [TX, TZ + 0.33];
  const DOC0 = [0.52, -0.12], DOC_YAW = headAt(0.5, -0.2, TX, TZ + 0.33), FAINT = 10.45, COUGH = 12.15, M3 = 12.4;
  const sheet = new THREE.Group(); scene.add(sheet);
  const sheetM = new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.9, side: THREE.DoubleSide });
  mk(new THREE.BoxGeometry(0.62, 0.012, 0.5), sheetM, sheet, 0, 0, 0.12); mk(new THREE.BoxGeometry(0.62, 0.42, 0.012), sheetM, sheet, 0, -0.2, 0.37);
  const tent = mk(new THREE.SphereGeometry(0.2, 16, 10, 0, PI * 2, 0, PI / 2), sheetM, sheet, 0, 0, 0.14); tent.scale.set(1.2, 0.01, 1.0);
  function youClinic(t) {
    const p = sitPose({ x: YOU_CL[0], z: YOU_CL[1], rotY: 0 }, SEAT, SEAT - 0.47); p.eyes = blink(t, 2); p.mouth = 'flat';
    p.armA = A(0.35, 0.28, -0.25, 0); p.armB = A(0.35, 0.28, -0.25, 0); p.headPitch = 0.1;
    p.headYaw = t < 9.9 ? -0.35 + 0.1 * Math.sin(t) : 0;   // watches the doctor, then the camera
    if (t > 9.9 && t < 10.6) { p.mouth = 'o'; p.headPitch = 0.45; }
    if (t > 10.6) { p.headYaw = 0.5 * K(t, [[10.55, 0], [10.75, 1]]) - 0.5 * K(t, [[11.2, 0], [11.4, 1]]); p.headPitch = 0.05; }
    if (t > 11.4 && t < M3 + 0.4) { const k = K(t, [[11.85, 0], [12.05, 1]]); p.headYaw = -0.95 * k; p.armA = mixArm(p.armA, MOUTH_A, k); p.lean = 0.25 * K(t, [[COUGH, 0], [COUGH + 0.07, 1], [COUGH + 0.25, 0]]); p.mouth = t > COUGH ? 'o' : 'flat'; }
    if (t > M3 + 0.4) { p.headYaw = -0.95 + 0.95 * K(t, [[M3 + 0.9, 0], [M3 + 1.2, 1]]); p.mouth = t < M3 + 1.0 ? 'o' : 'flat'; p.lean = -0.08; }
    return p;
  }
  function doc1Pose(t) {
    const p = pose({ x: DOC0[0], z: DOC0[1], rotY: DOC_YAW }); p.eyes = blink(t, 4); p.mouth = 'flat';
    const peekK = K(t, [[9.0, 0], [9.6, 1]]);
    p.lean = 0.22 * peekK; p.headPitch = 0.1 + 0.3 * peekK; p.armB = mixArm(REST, A(-1.05, 0.12, -0.9, -0.3), peekK); p.armA = mixArm(REST, A(-0.7, -0.05, -0.5, 0.2), peekK);
    if (t > 9.9) { const k = K(t, [[9.9, 0], [10.05, 1]]); p.lean = lerp(p.lean, -0.2, k); p.crouch *= 1 - k; p.headPitch = lerp(p.headPitch, -0.05, k); p.armA = mixArm(p.armA, UP_A, k); p.armB = mixArm(p.armB, UP_B, k); p.mouth = 'o'; }
    let tilt = 0;
    if (t > FAINT) { const u = clamp((t - FAINT) / 0.42); tilt = -(PI / 2) * u * u + 0.06 * Math.sin(clamp((t - FAINT - 0.42) / 0.3) * PI) * (t > FAINT + 0.42 ? 1 : 0); p.eyes = 'closed'; p.mouth = 'o'; p.lean = 0; p.armA = A(-0.4, 0.5, -0.2); p.armB = A(-0.4, 0.5, -0.2); }
    if (t > 13.1) { p.armB = mixArm(A(-0.4, 0.5, -0.2), THUMB_B, K(t, [[13.1, 0], [13.4, 1]])); }
    p.floor = 0; return { p, tilt };
  }
  const DOC2_DOOR = [1.47, -1.75], DOC2_SPOT = [0.62, -0.42];
  function doc2Pose(t) {
    const u = K(t, [[10.75, 0], [11.45, 1]], (x) => x);
    const x = lerp(DOC2_DOOR[0], DOC2_SPOT[0], u), z = lerp(DOC2_DOOR[1], DOC2_SPOT[1], u);
    const p = pose({ x, z, rotY: u > 0 && u < 1 ? headAt(DOC2_DOOR[0], DOC2_DOOR[1], DOC2_SPOT[0], DOC2_SPOT[1]) : headAt(x, z, YOU_CL[0], YOU_CL[1]), dist: 1.2 * u, speed: u > 0 && u < 1 ? 1.2 : 0 });
    p.eyes = blink(t, 6); p.mouth = t < 10.6 ? 'flat' : t < 11.3 ? 'o' : 'flat';
    if (t < 10.75) { p.lean = 0.2; p.headPitch = 0.25; p.rotY = headAt(x, z, YOU_CL[0], YOU_CL[1]); }
    if (t > 11.45 && t < M3) { p.armB = TALK_B; p.headPitch = 0.1; p.mouth = t > 11.5 && t < 12.0 && Math.sin(t * 30) > 0 ? 'o' : 'flat'; }
    if (t > M3) { // knocked back toward the door, lands on her seat
      const k = clamp((t - M3) / 0.4), lx = lerp(DOC2_SPOT[0], 1.05, k), lz = lerp(DOC2_SPOT[1], -1.35, k);
      Object.assign(p, { x: lx, z: lz, dist: 0, speed: 0, mouth: 'o', armA: UP_A, armB: UP_B, lean: -0.25 });
      if (k >= 1) { Object.assign(p, sitPose({ x: lx, z: lz, rotY: p.rotY, mouth: 'o', armA: A(0.5, 0.4, -0.2), armB: A(0.5, 0.4, -0.2) }, 0.12, 0)); p.footFwd = 0.62; p.eyes = blink(t, 6); }
    }
    return p;
  }
  const PEEK = [[1.18, -2.32], [1.78, -2.3], [1.48, -2.62]];
  function peekPose(t, i) {
    const [x, z] = PEEK[i], p = pose({ x, z, rotY: headAt(x, z, YOU_CL[0], YOU_CL[1]) }); p.eyes = blink(t, 10 + i); p.mouth = 'flat';
    p.lean = 0.25 + 0.05 * Math.sin(t * 1.3 + i); p.headPitch = 0.2;
    if (t > 9.95 + 0.05 * i) p.mouth = 'o';
    if (i === 2) p.armB = CAM_B;   // the one at the back holds up a phone
    if (t > M3 + 0.05 * i) { const k = K(t, [[M3 + 0.05 * i, 0], [M3 + 0.3 + 0.05 * i, 1]]); p.lean = lerp(p.lean, -0.35, k); p.armA = mixArm(REST, UP_A, k); p.armB = mixArm(p.armB, UP_B, k); }
    return { p, tilt: t > M3 + 0.2 ? -0.5 * K(t, [[M3 + 0.2 + 0.08 * i, 0], [M3 + 0.55 + 0.08 * i, 1]]) : 0 };
  }
  function nursePose(t) {
    const p = pose({ x: -0.62, z: -1.62, rotY: headAt(-0.62, -1.62, YOU_CL[0], YOU_CL[1]) }); p.eyes = blink(t, 8); p.mouth = 'flat';
    p.armA = A(-0.75, 0.15, -1.6, 0.6); p.headPitch = 0.15;
    if (t > 10.5) { p.mouth = 'o'; p.armB = A(-1.25, -0.05, -2.4, -0.7); p.rotY = headAt(-0.62, -1.62, 1.5, 0.5); }
    if (t > M3) { p.armB = UP_B; p.lean = -0.15; }
    return p;
  }

  // ================================================================ 3. TAILOR
  const [PX, PZ] = TL.pedestal, PY = TL.pedY, TL0 = [1.02, -0.35], TL_YAW = -1.75, M5 = 17.6;
  const tape = makeTape(); scene.add(tape.g);
  function youTailor(t) {
    const p = pose({ x: PX, z: PZ, rotY: 0, y: PY, floor: PY }); p.eyes = blink(t, 2); p.mouth = 'flat';
    p.armA = A(-0.1, 0.85, -0.15); p.armB = A(-0.1, 0.85, -0.15); p.headPitch = 0.05;
    if (t > 14.5 && t < 15.2) p.mouth = 'o';
    if (t > 15.8 && t < 17.5) p.headPitch = 0.35;   // watches the tape
    if (t > M5) { const k = K(t, [[M5, 0], [M5 + 0.2, 1]]); p.armA = mixArm(p.armA, UP_A, k); p.armB = mixArm(p.armB, UP_B, k); p.mouth = t < 18.5 ? 'o' : 'flat'; p.headPitch = 0; }
    return p;
  }
  function tailorPose(t) {
    const p = pose({ x: TL0[0], z: TL0[1], rotY: TL_YAW, crouch: 0.18, lean: 0.25 }); p.eyes = blink(t, 7); p.mouth = 'flat';
    p.armA = TAPE_A; p.armB = TAPE_B; p.headPitch = 0.3;
    if (t > 14.5 && t < 15.1) { p.mouth = 'o'; p.lean = 0.05; }
    const look = K(t, [[16.1, 0], [16.4, 1], [17.2, 1], [17.45, 0]]); p.rotY = lerp(TL_YAW, -1.2, look); p.headYaw = 0.9 * look; p.headPitch = lerp(0.3, -0.05, look);
    if (look > 0.5) p.mouth = 'flat';
    if (t > M5) {
      const k = clamp((t - M5) / 0.38);
      const C = [lerp(TL0[0], 1.42, k), HC * 0.85 + 0.5 * Math.sin(k * PI), lerp(TL0[1], -1.2, k)];
      p.armA = BACK_A; p.armB = BACK_B; p.mouth = 'o'; p.crouch = 0; p.lean = 0;
      return { p, C, yaw: TL_YAW + 0.4 * k, tilt: -1.0 * k, fly: true };
    }
    return { p };
  }

  // ================================================================ 4. WHEELBARROW (suburb)
  const barrow = makeWheelbarrow(); scene.add(barrow.g);
  const M7 = 22.8, BZ = -1.0;
  const xYou = (t) => -3.2 + 0.55 * (Math.min(t, M7) - 19.4) - 0.55 * K(t, [[M7, 0], [M7 + 0.35, 1]]);
  const NEIGH = [{ x: -4.6, z: -3.3, y: 0, k: 1 }, { x: 4.0, z: -3.4, y: 0, k: 2 }, { x: -3.6, z: -4.6, y: 0, k: 3 }];
  function youBarrow(t) {
    const x = xYou(t), walking = t < M7;
    const p = pose({ x, z: BZ, rotY: PI / 2, y: SW_H, floor: SW_H, dist: 0.55 * (Math.min(t, M7) - 19.4), speed: walking ? 0.55 : 0 }); p.eyes = blink(t, 2); p.mouth = 'flat';
    p.armA = HANDLE_A; p.armB = HANDLE_B; p.lean = 0.22; p.headPitch = -0.05;
    if (t > 21.2 && t < 21.9) { p.headYaw = 0.9; p.mouth = 'smile'; }   // a sheepish smile at the neighbors
    if (t > M7) {
      const k = K(t, [[M7 + 0.2, 0], [M7 + 0.42, 1]]);
      Object.assign(p, { lean: lerp(-0.2, 0.1, k), mouth: 'o', armA: UP_A, armB: UP_B, headYaw: 0 });
      if (k > 0) { p.y = lerp(SW_H, SW_H - SIT + 0.0, k); p.footFwd = 0.62 * k; }
      if (t > 23.4) { p.armA = A(0.4, 0.5, -0.3); p.armB = A(0.4, 0.5, -0.3); p.mouth = 'flat'; p.headYaw = 0.9 * K(t, [[23.6, 0], [23.9, 1]]); }
    }
    return p;
  }
  function neighPose(t, i) {
    const n = NEIGH[i], p = pose({ x: n.x, z: n.z, y: n.y, floor: n.y }); p.eyes = blink(t, 20 + i); p.mouth = 'flat';
    const tx = xYou(t) + 2.0;
    p.rotY = headAt(n.x, n.z, tx, BZ) * 0.6 + headAt(n.x, n.z, 0, 15) * 0.4; p.headYaw = headAt(n.x, n.z, tx, BZ) - p.rotY;
    p.headPitch = 0.05; p.lean = 0.05;
    if (i === 0) p.armB = CUP_B;
    if (i === 1) { p.armA = A(-0.6, 0.15, -0.6, 0.3); p.armB = A(-0.7, 0.05, -0.4, -0.3); }
    if (i === 3) p.armB = CAM_B;
    if (t > 21.0 + 0.1 * i) p.mouth = 'o';
    if (t > M7) { const k = K(t, [[M7 + 0.05 * i, 0], [M7 + 0.25 + 0.05 * i, 1]]); p.lean = lerp(p.lean, -0.25, k); p.armA = mixArm(p.armA, UP_A, k); if (i !== 3) p.armB = mixArm(p.armB, UP_B, k); }
    return p;
  }
  const mugN = mk(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 12), mat(0xd2483f, 0.5), scene);

  // ================================================================ 5. TRUCK (street)
  const truck = makeBoxTruck({ ramp: false }); street.root.add(truck.g);
  const nearTrees = street.trees.map((tr) => tr.t).filter((g) => g.position.z > 5 && g.position.x > -22 && g.position.x < 2);
  const TRK = [-4, 0, 1.55], M8 = 27.6;
  truck.g.position.set(...TRK);
  const ONLOOK = [[-6.4, -1.2], [-5.5, -2.0], [-7.2, -2.3], [-4.9, -1.0]];
  function moverPose(t, i) {
    const z = TRK[2] + (i ? 1.22 : -1.22), x = -4.55;
    const p = pose({ x, z, rotY: PI / 2 }); p.eyes = blink(t, 30 + i); p.mouth = 'flat';
    const push = 0.5 + 0.5 * Math.sin((t - 24.4) * 5.2 + i * 0.6);
    p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.35 + 0.15 * push; p.footFwd = -0.15; p.headPitch = -0.1; p.mouth = push > 0.7 ? 'o' : 'flat';
    if (t > M8) {
      const k = clamp((t - M8) / 0.55), land = [x - 4.6 - i * 0.8, z + (i ? 1.4 : -1.4)];
      if (k < 1) return { p: { ...p, armA: BACK_A, armB: BACK_B, mouth: 'o' }, C: [lerp(x, land[0], k), HC + 2.2 * Math.sin(k * PI), lerp(z, land[1], k)], yaw: PI / 2, tilt: -1.3 * k };
      Object.assign(p, sitPose({ x: land[0] + 0.35, z: land[1], rotY: PI / 2, mouth: 'o', armA: A(0.5, 0.4, -0.2), armB: A(0.5, 0.4, -0.2) }, 0, 0)); p.footFwd = 0.62; p.eyes = blink(t, 30 + i);
      if (t > 28.6) { p.headYaw = i ? 0.6 : -0.6; p.headPitch = -0.45; }
    }
    return { p };
  }
  function onlookPose(t, i) {
    const [x, z] = ONLOOK[i], p = pose({ x, z, y: SH, floor: SH, rotY: headAt(x, z, -4, TRK[2]) * 0.5 + 0.5 * headAt(x, z, -9, 9) }); p.eyes = blink(t, 40 + i); p.mouth = 'flat';
    p.headYaw = headAt(x, z, -4, TRK[2]) - p.rotY; if (i === 1) p.armB = CAM_B; if (i === 2) p.armA = PHONE_A;
    if (t > 26.2 + 0.2 * i) p.mouth = 'o';
    if (t > M8) { const k = K(t, [[M8 + 0.04 * i, 0], [M8 + 0.25, 1]]); p.lean = -0.25 * k; p.armA = mixArm(p.armA, UP_A, k); p.armB = mixArm(p.armB, UP_B, k); p.headPitch = -0.5 * K(t, [[M8 + 0.3, 0], [M8 + 0.8, 1]]); }
    return p;
  }
  const loadTop = (s, dx = 0) => 0.92 * 0.66 * s + 0.66 * s * Math.sqrt(Math.max(0, 1 - (dx / s) ** 2));   // tarp surface height (squash 0.66) at |dx| from the center

  // ================================================================ 6. CRANE (city, origin)
  const crane = makeTowerCrane({ H: 56, J: 40 }); city.root.add(crane.g);
  const CR = [-31, 0, -6]; crane.g.position.set(...CR); crane.setTrolley(31); crane.setCable(12);
  const straps = Array.from({ length: 4 }, () => mk(new THREE.CylinderGeometry(0.12, 0.12, 1, 6), mat(0xf2c230, 0.6), scene));
  const crushCars = [makeCar(0x3d7bd9, 31), makeCar(0xf4f1ea, 32), makeCar(0xd2483f, 33)];
  crushCars.forEach((c, i) => { city.root.add(c.g); c.g.position.set([-2, 2, -2][i], 0, [-14, -4, 4][i]); c.g.rotation.y = i === 1 ? PI : 0; });
  const DROP = 32.85, LAND = 33.3;
  /** world-space hook point (local to the city = world) */
  const _h = new THREE.Vector3();
  function craneState(t) {
    crane.setBuckle(K(t, [[32.75, 0], [33.45, 1]], (u) => u * u));
    crane.setCable(12 + 1.5 * K(t, [[29.7, 0], [29.9, 1]]));
    crane.g.updateMatrixWorld(true); crane.hook.getWorldPosition(_h);
    const s = sizeAt(t) / 2;
    let base = _h.y - 1.0 - 1.27 * s;
    if (t > DROP) { const u = clamp((t - DROP) / (LAND - DROP)); base = lerp(_h.y - 1.0 - 1.27 * s, 0, u * u); }
    return { s, base, hook: _h.clone() };
  }
  const CROWD_C = [[5.2, 9.0], [6.0, 10.5], [4.8, 12.0], [6.4, 13.2], [5.4, 14.6], [4.9, 7.6]];

  // ================================================================ 7. PRESS
  { // swap the podium's presidential seal for a fictional science agency seal (backdrop + lectern plaque)
    const sealT = canvasTex(512, 512, (g, w) => { const c = w / 2; g.fillStyle = '#e8c76a'; g.beginPath(); g.arc(c, c, 250, 0, 7); g.fill(); g.fillStyle = '#12284e'; g.beginPath(); g.arc(c, c, 230, 0, 7); g.fill();
      g.strokeStyle = '#e8c76a'; g.lineWidth = 10; g.beginPath(); g.ellipse(c, c + 10, 150, 52, -0.4, 0, 7); g.stroke(); g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(c, c + 10, 60, 0, 7); g.fill();
      g.fillStyle = '#e8c76a'; for (let i = 0; i < 24; i++) { const a = (i / 24) * PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * 200, c + Math.sin(a) * 200, 5, 0, 7); g.fill(); }
      g.font = 'bold 38px Georgia, serif'; g.textAlign = 'center'; g.fillText('NATIONAL', c, 120); g.fillText('SCIENCE AGENCY', c, 420); });
    press.root.traverse((m) => { if (m.isMesh && m.geometry.type === 'CircleGeometry' && m.material.map) m.material = new THREE.MeshStandardMaterial({ map: sealT, roughness: 0.5 }); });
  }
  press.root.traverse((m) => { if (m.isMesh && m.geometry.type === 'PlaneGeometry' && m.geometry.parameters.width === 0.4 && m.position.x < 0) m.visible = false; });   // the left teleprompter pane sat in front of the chart
  const scrC = document.createElement('canvas'); scrC.width = 560; scrC.height = 360;
  const scrT = new THREE.CanvasTexture(scrC); scrT.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Group(); screen.position.set(-1.3, 0.25, -3.2); screen.rotation.y = 0.3; press.root.add(screen);
  mk(new THREE.BoxGeometry(1.86, 1.24, 0.06), mat(0x1d1d22, 0.4), screen, 0, 1.45, 0);
  mk(new THREE.PlaneGeometry(1.76, 1.13), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false }), screen, 0, 1.45, 0.035);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8), mat(0x2a2d31, 0.4), screen, 0, 0.65, -0.05); mk(new THREE.BoxGeometry(0.6, 0.04, 0.4), mat(0x2a2d31, 0.4), screen, 0, 0.02, -0.05);
  const cenTex = cen.mat.map.image;
  let scrN = -1;
  function drawScreen(t) {
    const st = minuteAt(t), h = Math.min(330, 175 * sizeAt(t) / 828 * (W(st.n) > 0 ? 1 : 1));
    const key = Math.round(h); if (key === scrN) return; scrN = key;
    const g = scrC.getContext('2d'), w = 560, H = 360;
    g.fillStyle = '#0d1b2e'; g.fillRect(0, 0, w, H);
    g.fillStyle = '#f4f1ea'; g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.textAlign = 'left'; g.fillText('SIZE vs. TALLEST', 22, 46); g.fillText('BUILDING', 22, 92);
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(22, 330); g.lineTo(w - 22, 330); g.stroke();
    // the tower: a needle silhouette 828 m = 175 px
    g.fillStyle = '#8a9bb0'; const bx = 150; g.beginPath(); g.moveTo(bx - 34, 330); g.lineTo(bx - 20, 230); g.lineTo(bx - 8, 200); g.lineTo(bx - 2, 155); g.lineTo(bx, 155 - 0); g.lineTo(bx + 2, 155); g.lineTo(bx + 8, 200); g.lineTo(bx + 20, 230); g.lineTo(bx + 34, 330); g.closePath(); g.fill();
    g.fillStyle = '#f4f1ea'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('828 m', bx, 145);
    // "it": a pixel-mosaic bar
    g.imageSmoothingEnabled = false; const bw = 120, by = 330 - h; g.drawImage(cenTex, 360 - bw / 2, by, bw, h);
    g.fillStyle = '#f3c46b'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.fillText('IT', 360, Math.max(124, by - 12));
    scrT.needsUpdate = true;
  }
  const PRESS_SEATS = [[1, 0], [2, 0], [3, 0], [4, 0], [1, 1], [2, 1], [3, 1], [4, 1], [2, 2], [3, 2]];
  const TIP = 38.35;

  // ================================================================ 8. ZIP (suburb, the park end)
  const sign = makeRoadSign([['NOW ENTERING', 44], ['ZIP 41562', 100]], { w: 2.4, h: 1.4, post: 1.75 }); burb.root.add(sign.g);
  sign.g.position.set(55.4, 0, 0.2); sign.g.rotation.y = PI / 2;
  const MTN = [-4300, -60, -470];
  const letters = Array.from({ length: 10 }, (_, i) => { const l = mk(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xf8f6f0 : 0xe8d8b8, side: THREE.DoubleSide, roughness: 0.8 }), burb.root); l.visible = false; return l; });
  const ZIPN = [{ x: 51.5, z: 3.6, k: 0 }, { x: 52.6, z: 4.7, k: 1 }, { x: 50.2, z: 4.4, k: 2 }];
  const M16 = 42.6;
  const clouds = makeSpritePool(scene, 14, 'smoke'); clouds.items.forEach((c) => (c.material.fog = false));

  // ================================================================ 9–10. SPACE + WAR ROOM
  const US = V3(-0.109, 0.629, 0.768).normalize();     // lat 39 N, lon 98 W on the space Earth (spin 0), = latLonToVec
  const sats = Array.from({ length: 3 }, () => { const s = makeSatellite(); s.g.scale.setScalar(0.5); space.root.add(s.g); return s; });
  const swarm = space.makeStarlinkSwarm(900, 26);
  const qOrbit = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), 1.15);
  const qEarth = new THREE.Quaternion().setFromUnitVectors(US, V3(0.18, 0.95, 0.25).normalize());
  const vis = (n) => W(n) / 15930 * 6;   // orbit shot: planet units, 3.2× exaggerated so 63 km reads
  const visTrue = (n) => W(n) / 15930;     // earth shot: true scale (1 unit = 15.93 km)

  // ================================================================ 11. PERCH (sit on top)
  const planetTop = mk(new THREE.SphereGeometry(30, 128, 96), loadA.mat, perch, 0, -30, 0); planetTop.receiveShadow = true;
  for (const [ry, rz] of [[0.3, 0.12], [1.9, -0.1]]) { const r = mk(new THREE.TorusGeometry(30.02, 0.05, 8, 256), mat(0xd9c39a, 0.8), perch, 0, -30, 0); r.rotation.set(PI / 2 + rz, ry, 0); }
  const chair = makeLawnChair(); perch.add(chair.g);
  const flag = makeMosaicFlag({ h: 1.3 }); flag.g.position.set(-0.7, -0.02, -0.25); perch.add(flag.g);
  const pEarth = new THREE.Mesh(new THREE.SphereGeometry(5, 96, 64), space.earth.material); pEarth.position.set(-9.8, 10.1, -47.3); perch.add(pEarth);
  const glowT = canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 40, 64, 64, 64); gr.addColorStop(0, 'rgba(120,180,255,.5)'); gr.addColorStop(1, 'rgba(120,180,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); });
  const pGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pGlow.scale.setScalar(13.5); pGlow.position.copy(pEarth.position); perch.add(pGlow);
  { const SG = new THREE.BufferGeometry(), sp = [], Rn = rng(5); for (let i = 0; i < 2500; i++) { const u = Rn() * 2 - 1, a = Rn() * PI * 2, s = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * s * 400, u * 400, Math.sin(a) * s * 400); } SG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); perch.add(new THREE.Points(SG, new THREE.PointsMaterial({ size: 2.2, color: 0xdfe8ff, sizeAttenuation: false, transparent: true, depthWrite: false }))); }
  const pSun = new THREE.DirectionalLight(0xfff2e0, 3.0); pSun.position.set(-6, 7, 9); perch.add(pSun, pSun.target); pSun.castShadow = true; pSun.shadow.mapSize.set(2048, 2048); Object.assign(pSun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 40 });
  perch.add(new THREE.HemisphereLight(0x9ab8e8, 0x202030, 0.7));
  const pRim = new THREE.DirectionalLight(0x8ab4ff, 1.2); pRim.position.set(6, 4, -8); perch.add(pRim);
  const steam = makeSpritePool(scene, 8, 'smoke');

  // ---------------------------------------------------------------- per-frame
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (cur !== S) {
      Object.entries(ROOTS).forEach(([k, r]) => (r.visible = k === S));
      scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.5 : S === 'city' ? 0.2 : 0.05; studio.camera.updateProjectionMatrix();
      cur = S;
    }
    all.forEach((r) => (r.root.visible = false));
    [cen, cen2].forEach((c) => (c.sp.visible = false));
    [loadA.g, loadZ.g, planet, sheet, tape.g, barrow.g, mugN, dog.g].forEach((o) => (o.visible = false));
    straps.forEach((s) => (s.visible = false)); letters.forEach((l) => (l.visible = false));
    stars.forEach((s) => (s.visible = false)); puffs.hide(); clouds.hide(); steam.hide(); starN = 0; puffN = 0; jolts.length = 0;
    pressCams.forEach((c) => (c.visible = false)); tablets.forEach((c) => (c.visible = false));
    cupG.visible = false; phone.visible = false; penlight.visible = false; clip.visible = false; steth.visible = false; hammer.visible = false;
    if (burbSky) burbSky.scale.setScalar(1);
    const o = OFF[S];

    // camera first (the censor faces it)
    let P, Aim, fov = CAMS[cam].fov;
    if (CAMS[cam].keys.length) { const [p0, a0] = camAt(CAMS[cam], t); P = p0.map((v, i) => v + o[i]); Aim = a0.map((v, i) => v + o[i]); }

    if (cam === 'elev') {
      elev.setFloor(t < DING ? 9 + Math.min(3, Math.floor(t / 1.6)) : 13);
      cupG.visible = true; show(you, 'elev', youElev(t)); phone.visible = true;
      RIDERS.forEach((_, i) => show(pool[i], 'elev', riderPose(t, i)));
      if (t > 5.5) { camPos.set(...P); const s = sizeAt(t, (n) => [0, 0.17, 0.3, 0.55][Math.min(n, 3)] * (n ? 1 : 0)) * (t < 5.72 ? easeOutBack((t - 5.5) / 0.22) : 1); censorAt(cen, crotch(you, 0.12, 0.02), s); }
      jolts.push([5.5, 0.02], [DING, 0.006]);
    } else if (cam === 'doc' || cam === 'docFloor') {
      clinic.stool.visible = cam === 'doc'; penlight.visible = t < FAINT; clip.visible = t < 10.5; steth.visible = true;
      show(you, 'clinic', youClinic(t));
      const d1 = doc1Pose(t); show(doc1, 'clinic', d1.p, { tilt: d1.tilt });
      show(doc2, 'clinic', doc2Pose(t)); show(nurse, 'clinic', nursePose(t));
      peek.forEach((r, i) => { const q = peekPose(t, i); show(r, 'clinic', q.p, { tilt: q.tilt }); });
      // the lap sheet: flat → tents at M2 → launched at M3
      sheet.visible = true; you.root.updateMatrixWorld(true);
      const lap = you.pelvis.localToWorld(V3(0, 0.02, 0.18));
      const tentK = K(t, [[9.9, 0], [10.1, 1]]);
      tent.scale.y = 0.01 + 1.1 * tentK;
      if (t < M3) { sheet.position.copy(lap); sheet.rotation.set(0, 0, 0); }
      else { const a = t - M3; sheet.position.set(lap.x - 0.6 * a, lap.y + 3.2 * a - 4.9 * a * a, lap.z + 0.9 * a); sheet.rotation.set(a * 6, a * 2, a * 4); sheet.visible = sheet.position.y > o[1] + 0.02; }
      camPos.set(...P);
      const s = sizeAt(t, (n) => [0, 0.17, 0.3, 0.55][Math.min(n, 3)]);
      censorAt(cen, crotch(you, 0.2, -0.04), s);
      impact(t, 9.9, 'clinic', [YOU_CL[0], SEAT + 0.3, YOU_CL[1] + 0.35], 0.5); impact(t, M3, 'clinic', [YOU_CL[0], SEAT + 0.35, YOU_CL[1] + 0.4], 0.8);
      impact(t, FAINT + 0.42, 'clinic', [DOC0[0] + 1.0, 0.2, DOC0[1] + 0.55], 0.7, false);
      jolts.push([9.9, 0.012], [FAINT + 0.42, 0.02], [M3, 0.03]);
    } else if (cam === 'tailor') {
      show(you, 'tailor', youTailor(t));
      const tp = tailorPose(t);
      if (tp.fly) showC(tailorM, 'tailor', tp.p, tp.C, tp.yaw, tp.tilt); else show(tailorM, 'tailor', tp.p);
      // tape between the tailor's hands (until he's launched)
      if (!tp.fly) { tailorM.root.updateMatrixWorld(true); const a = tailorM.arms[0].hand.getWorldPosition(V3(0, 0, 0)), b = tailorM.arms[1].hand.getWorldPosition(V3(0, 0, 0)); tape.set(a, b); tape.g.visible = true; }
      // the rack tips when he lands, suits fly; the left dress form falls
      const hit = K(t, [[M5 + 0.38, 0], [M5 + 0.75, 1]], (u) => u * u);
      tailor.rack.tip.rotation.x = -1.35 * hit;
      tailor.rack.suits.forEach((s, i) => { const a = Math.max(0, t - M5 - 0.4); const h = s.userData.home; s.position.set(h.x + (i - 4) * 0.25 * a, h.y + (1.8 + (i % 3) * 0.5) * a - 3.5 * a * a, h.z + 0.6 * a); s.rotation.z = (i % 2 ? 1 : -1) * a * 3; if (s.position.y < -0.9) s.position.y = -0.9; });
      tailor.forms[0].pivot.rotation.z = 1.45 * K(t, [[M5 + 0.15, 0], [M5 + 0.65, 1]], (u) => u * u);
      camPos.set(...P);
      const s = sizeAt(t, (n) => [0, 0.17, 0.3, 0.55, 1.0, 1.7][Math.min(n, 5)]);
      censorAt(cen, crotch(you, 0.15, 0.32 * Math.max(0, s - 0.55)), s);
      impact(t, 14.5, 'tailor', [PX + 0.4, PY + 0.9, PZ + 0.5], 0.7); impact(t, M5, 'tailor', [PX + 0.7, PY + 0.8, PZ + 0.6], 1.3); impact(t, M5 + 0.4, 'tailor', [1.35, 1.0, -1.25], 1.0, false);
      jolts.push([14.5, 0.015], [M5, 0.035], [M5 + 0.4, 0.015]);
    } else if (cam === 'barrow') {
      studio.camera.far = 400; studio.camera.updateProjectionMatrix(); burb.lights.sun.intensity = SUN0; burb.lights.hemi.intensity = HEMI0;
      burb.aimSun(xYou(t) + 2, -2, 14);
      show(you, 'burb', youBarrow(t));
      NEIGH.forEach((_, i) => show(pool[4 + i], 'burb', neighPose(t, i)));
      // the kid on the sidewalk ahead stops, stares, then falls on his seat
      const kp = pose({ x: 2.9, z: -0.6, y: SW_H, floor: SW_H, rotY: -PI / 2 + 0.4 }); kp.eyes = blink(t, 9); kp.mouth = t > 20.4 ? 'o' : 'smile'; kp.headYaw = -0.25;
      if (t > M7 + 0.1) { Object.assign(kp, sitPose({ x: 3.1, z: -0.6, rotY: -PI / 2 + 0.4, mouth: 'o', armA: UP_A, armB: UP_B }, SW_H + 0.0, SW_H)); kp.footFwd = 0.5; }
      show(kid, 'burb', kp, { s: 0.62 }); if (t > M7 + 0.1) kid.root.position.y = OFF.burb[1] + (SW_H - SIT * 0.62) ;
      // the dog barks at it
      dog.g.visible = true; dog.g.position.set(o[0] + 2.5, 0, o[2] - 2.6); dog.g.rotation.y = headAt(2.5, -2.6, xYou(t) + 2, BZ); dog.update(t, 0); if (dog.bark) dog.bark(0.5 + 0.5 * Math.sin(t * 9));
      // the barrow + the load
      const x = xYou(t), s = sizeAt(t), crush = K(t, [[M7 + 0.05, 0], [M7 + 0.28, 1]], (u) => u * u);
      barrow.g.visible = true; barrow.g.position.set(o[0] + lerp(x + 0.95, -2.2 + 0.95 + 0.5, crush), o[1] + SW_H, o[2] + BZ); barrow.g.rotation.y = PI / 2; barrow.setCrush(crush, crush * 6);
      loadA.g.visible = true; loadA.setSize(s);
      const cx = (t < M7 ? x : xYou(M7)) + 0.35 + s * 0.52;
      loadA.g.position.set(o[0] + cx, o[1] + SW_H + lerp(0.38, 0.0, crush), o[2] + BZ - 0.15 * crush * s); loadA.g.rotation.y = 0.4;
      camPos.set(...P); censorAt(cen, V3(o[0] + cx, o[1] + SW_H + 0.6 * s * 0.66, o[2] + BZ), 0.36 * s, s * 0.6);
      // the neighbor's mug flies at the boom
      { const a = t - M7; mugN.visible = a > 0.05 && a < 1.5; const n0 = NEIGH[0]; mugN.position.set(o[0] + n0.x + 0.3 + 0.8 * a, o[1] + Math.max(0.05, 1.2 + 2.6 * a - 4.9 * a * a), o[2] + n0.z + 0.2); mugN.rotation.set(a * 9, 0, a * 5); }
      impact(t, M7, 'burb', [x + 1.0, 0.6, BZ + 0.6], 2.2); impact(t, M7 + 0.42, 'burb', [x - 0.4, 0.3, BZ + 0.3], 0.8, false);
      jolts.push([19.7, 0.02], [M7, 0.08], [M7 + 0.42, 0.03]);
    } else if (cam === 'truck') {
      street.aimSun(-4, 1.5, 16); nearTrees.forEach((tr) => (tr.visible = false));
      const age = t - M8, burst = age > 0;
      truck.setBurst(burst ? age : 0);
      const push = Math.max(0, Math.sin((t - 24.4) * 5.2)) * (burst ? 0 : 1);
      truck.setBulge(burst ? 0 : 0.5 + 0.5 * push);
      loadA.g.visible = true; loadA.g.rotation.y = 0;
      if (!burst) { loadA.g.scale.set(4.15 + 0.06 * push, 2.05 + 0.08 * push, 1.3 + 0.12 * push); loadA.g.position.set(o[0] + TRK[0] + 3.75, o[1] + 1.02, o[2] + TRK[2]); }
      else { const s = sizeAt(t) / 2, k = clamp(age / 0.22); loadA.g.scale.set(lerp(4.15, s, k), lerp(2.05, s, k), lerp(1.3, s, k)); loadA.g.position.set(o[0] + TRK[0] + 3.95, o[1] + lerp(1.02, 0, k), o[2] + TRK[2]); }
      // the truck rides up on top of it
      const ride = K(t, [[M8 + 0.05, 0], [M8 + 0.5, 1]], easeOutBack);
      const topY = loadTop(sizeAt(t) / 2, 0);
      truck.g.position.set(TRK[0] + 0.3 * ride, lerp(0, topY - 1.15, ride), TRK[2] + 0.4 * ride); truck.g.rotation.set(0.12 * ride, 0.25 * ride, 0.1 * ride);
      movers.forEach((m, i) => { const r = moverPose(t, i); if (r.C) showC(m, 'street', r.p, r.C, r.yaw, r.tilt); else show(m, 'street', r.p); });
      ONLOOK.forEach((_, i) => show(pool[i + 4], 'street', onlookPose(t, i)));
      // you: pushing from behind; at the burst you are carried up onto the top-rear of the mound
      const yp = pose({ x: TRK[0] - 0.62, z: TRK[2], rotY: PI / 2 }); yp.eyes = blink(t, 2); yp.armA = PUSH_A; yp.armB = PUSH_B; yp.lean = 0.25 + 0.1 * push; yp.mouth = 'flat'; yp.headYaw = t > 26.6 && t < 27.4 ? -1.0 : 0;
      if (burst) {
        const s = sizeAt(t) / 2, dx = -0.62 * s, top = loadTop(s, dx), k = clamp(age / 0.5);
        const sx = TRK[0] + 3.95 + dx;
        if (k < 1) showC(you, 'street', { ...yp, armA: UP_A, armB: UP_B, mouth: 'o' }, [lerp(TRK[0] - 0.62, sx, k), lerp(HC, top + 0.6, k) + 2.0 * Math.sin(k * PI), TRK[2]], PI / 2, -0.5 * Math.sin(k * PI));
        else { const sp = sitPose({ x: sx, z: TRK[2], rotY: PI / 2 - 0.9, mouth: t < 28.6 ? 'o' : 'flat', armA: A(0.4, 0.45, -0.2), armB: A(0.4, 0.45, -0.2) }, top, top - 0.4); sp.footFwd = 0.6; sp.eyes = blink(t, 2); show(you, 'street', sp); }
      } else show(you, 'street', yp);
      camPos.set(...P);
      const cs = burst ? 0.32 * sizeAt(t) : 1.5;
      censorAt(cen, burst ? V3(o[0] + TRK[0] + 3.95, o[1] + 0.55 * loadTop(sizeAt(t) / 2), o[2] + TRK[2] + 0.4 * sizeAt(t) / 2) : V3(o[0] + TRK[0] - 0.15, o[1] + 1.9, o[2] + TRK[2]), cs, 0.3);
      impact(t, M8, 'street', [TRK[0] + 4, 2.0, TRK[2] + 1.8], 5.0); impact(t, M8 + 0.12, 'street', [TRK[0] - 1.5, 0.4, TRK[2] + 3.0], 3.0, false);
      jolts.push([M8, 0.12]);
    } else if (cam === 'craneTop' || cam === 'craneWide') {
      city.setShadowFocus && city.setShadowFocus(0, -6, 40);
      const st = craneState(t), s = st.s;
      loadA.g.visible = true; loadA.g.rotation.y = 0.3; loadA.setSize(2 * s); loadA.g.position.set(st.hook.x, st.base, st.hook.z);
      const topY = st.base + loadTop(s, 0);
      // straps from the hook to the load's shoulders (until it drops)
      if (t < DROP + 0.1) straps.forEach((m, i) => { const a = i * PI / 2 + 0.6, b = V3(st.hook.x + Math.cos(a) * s * 0.55, st.base + loadTop(s, s * 0.55), st.hook.z + Math.sin(a) * s * 0.55), d = b.clone().sub(st.hook), l = d.length(); m.visible = true; m.position.copy(st.hook).addScaledVector(d, 0.5); m.scale.set(1, l, 1); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); });
      // you, sitting on top near the hook, waving
      const yx = st.hook.x + 0.42, yz = st.hook.z + 1.86, yTop = st.base + loadTop(s, 1.9);
      const yp = sitPose({ x: yx, z: yz, rotY: 0.25, mouth: 'smile' }, yTop, yTop); yp.footFwd = 0.62; yp.eyes = blink(t, 2);
      yp.armB = t < 29.7 ? WAVE_B(t) : A(-0.3, 0.6, -0.4); yp.armA = A(0.3, 0.5, -0.3);
      if (t > 29.7 && t < 30.6) { yp.mouth = 'o'; yp.armB = UP_B; yp.armA = UP_A; }
      if (t > 30.6 && t < 31.9) { yp.armB = A(-1.6, 0.2, -0.2, -0.2); yp.mouth = 'smile'; }   // thumbs up to the camera
      if (t > 32.6) { yp.mouth = 'o'; yp.armA = UP_A; yp.armB = UP_B; }
      show(you, 'city', yp);
      if (cam === 'craneTop') { const yb = V3(yx, yTop, yz); P = [yb.x + 1.0, yb.y + 1.25, yb.z + 2.7]; Aim = [yb.x - 0.35, yb.y + 0.55, yb.z - 1.0]; }
      // the corner crowd looks up, then runs
      CROWD_C.forEach(([x, z], i) => { const p = pose({ x, z, y: 0.14, floor: 0.14, rotY: headAt(x, z, 0, -6) }); p.eyes = blink(t, 50 + i); p.headPitch = -0.6; p.mouth = 'o'; if (i % 2) p.armB = POINT_B; else p.armB = CAM_B;
        if (t > LAND) { const run = (t - LAND) * 3.2; Object.assign(p, { z: z + run, rotY: 0, dist: run, speed: 3.2, headPitch: 0, armA: REST, armB: REST }); }
        show(pool[i], 'city', p); });
      crushCars.forEach((c) => { const k = K(t, [[LAND - 0.05, 0], [LAND + 0.1, 1]]); c.body.scale.set(1, 1 - 0.65 * k, 1); });
      camPos.set(...(P || [0, 0, 0]));
      censorAt(cen, V3(st.hook.x, st.base + 0.5 * loadTop(s), st.hook.z), 0.75 * s, 1.1 * s);
      if (cam === 'craneTop') { cen.sp.visible = false; impact(t, 29.7, 'city', [yx, yTop - 0.3, yz + 1.0], 1.2, false); jolts.push([29.7, 0.06]); }
      else { impact(t, LAND, 'city', [0, 3, 18], 22, false); impact(t, LAND + 0.08, 'city', [-14, 3, 10], 16, false); impact(t, LAND + 0.04, 'city', [12, 3, 8], 16, false); jolts.push([32.6, 0.4], [LAND, 1.6]); }
    } else if (cam === 'pressA' || cam === 'pressB') {
      drawScreen(t);
      press.setFlashes(t, t > 38.0 ? 6 : 1.5);
      const sp = pose({ x: PD.speaker[0], z: PD.speaker[1], rotY: 0.15, y: 0.25, floor: 0.25 }); sp.eyes = blink(t, 5); sp.mouth = Math.sin(t * 14) > 0.2 && t < 37.8 ? 'o' : 'flat';
      sp.armA = A(-1.45, 0.55, -0.15, 0.2); sp.headYaw = t < 35.6 ? -0.6 : 0.15 * Math.sin(t * 0.8); sp.armB = A(-0.5, 0.2, -1.2, -0.4);
      if (t > 38.0) { const k = K(t, [[38.0, 0], [38.2, 1]]); sp.crouch = 0.35 * k; sp.lean = 0.5 * k; sp.armA = mixArm(sp.armA, A(-2.4, 0.9, -2.0, 0.6), k); sp.armB = mixArm(sp.armB, A(-2.4, 0.9, -2.0, -0.6), k); sp.mouth = 'o'; }
      if (cam === 'pressA') show(sci, 'press', sp);
      PRESS_SEATS.forEach(([si, ri], k) => {
        const x = PD.seats[si], z = PD.rows[ri], tip = K(t, [[TIP + ri * 0.06, 0], [TIP + 0.3 + ri * 0.06, 1]], (u) => u * u);
        const p = sitPose({ x, z: z + 0.05, rotY: PI }, 0.45, 0); p.eyes = blink(t, 60 + k); p.mouth = t > 37.0 ? 'o' : 'flat';
        p.armA = A(-0.5, 0.1, -0.9, 0.3); p.armB = k % 2 ? CAM_B : A(-0.9, 0.12, -1.25, -0.5); pressCams[k].visible = k % 2 === 1;
        p.headYaw = 0.25 * Math.sin(k * 1.7); p.headPitch = -0.1;
        if (t > 38.0) { p.armA = UP_A; if (k % 2 === 0) p.armB = UP_B; }
        // tipping back with the chair: rotate the whole sitter about the chair's back feet
        show(pool[k], 'press', p, { tilt: -1.2 * tip });
        if (tip > 0) { pool[k].root.position.z += 0.25 * tip; pool[k].root.position.y += 0.12 * Math.sin(tip * PI); }
      });
      if (cam === 'pressB') jolts.push([38.35, 0.03]);
      else jolts.push([34.9, 0.008], [36.5, 0.012], [38.0, 0.03]);
    } else if (cam === 'zip') {
      if (burbSky) burbSky.scale.setScalar(30);
      studio.camera.far = 14000; studio.camera.updateProjectionMatrix();
      burb.aimSun(54, 1, 14);
      const shade = K(t, [[M16 + 0.1, 0], [M16 + 0.9, 1]]);
      burb.lights.sun.intensity = lerp(SUN0, SUN0 * 0.27, shade); burb.lights.hemi.intensity = lerp(HEMI0, HEMI0 * 0.6, shade);
      // the mountain (fog-free, haze-tinted) + snow cap + clouds
      const s = sizeAt(t, (n) => W(n) * 0.55);
      loadZ.g.visible = true; loadZ.setSize(s); loadZ.g.position.set(o[0] + MTN[0], o[1] + MTN[1], o[2] + MTN[2]); loadZ.g.rotation.y = 0.8;
      const snow = K(t, [[M16 + 0.25, 0], [M16 + 1.2, 1]]); snowCap.visible = snow > 0.01; snowCap.material.opacity = snow;
      const topW = V3(o[0] + MTN[0], o[1] + MTN[1] + loadTop(s / 2) * 0.9, o[2] + MTN[2]);
      for (let k = 0; k < clouds.items.length; k++) { const a = -PI / 2 + ((k / (clouds.items.length - 1)) - 0.5) * 2.6 + 0.05 * Math.sin(t * 0.5 + k), r = s * 0.5; const op = 0.9 * K(t, [[M16 + 0.3 + 0.04 * k, 0], [M16 + 1.1 + 0.04 * k, 1]]); clouds.set(k, V3(topW.x - Math.sin(-a) * 0 + Math.cos(a + PI / 2) * r * 0.9 + s * 0.35, topW.y - s * 0.38 + Math.sin(k * 2.3) * s * 0.05, topW.z + Math.sin(a + PI / 2) * r * 0.0 + ((k / (clouds.items.length - 1)) - 0.5) * s * 1.1), s * 0.26, op, new THREE.Color(0xffffff)); }
      camPos.set(...P); censorAt(cen, V3(o[0] + MTN[0], o[1] + MTN[1] + 0.5 * loadTop(s / 2), o[2] + MTN[2]), 0.3 * s, 0.6 * s);
      // the mail carrier hammers the post, steps back proud
      const swing = t < 40.6 ? Math.max(0, Math.sin((t - 39.8) * 9)) : 0;
      const cp = pose({ x: 54.85, z: 1.45, rotY: PI / 2 }); cp.eyes = blink(t, 70); cp.mouth = 'flat'; hammer.visible = true;
      cp.armB = A(-2.2 + 1.6 * swing, 0.25, -0.6, -0.2); cp.armA = A(-0.9, 0.0, -0.4, 0.3); cp.lean = 0.15; cp.headPitch = 0.25;
      if (t > 40.6) { const k = K(t, [[40.6, 0], [41.0, 1]]); cp.x = 54.85 + 0.55 * k; cp.z = 1.45 + 0.4 * k; cp.rotY = lerp(PI / 2, 1.0, k); cp.armB = mixArm(cp.armB, HIPS_B, k); cp.armA = mixArm(cp.armA, HIPS_A, k); cp.lean = 0; cp.headPitch = 0; cp.mouth = 'smile'; cp.headYaw = 0.35 * k; }
      if (t > M16) { cp.mouth = 'o'; cp.headYaw = -0.9; cp.armA = mixArm(HIPS_A, UP_A, K(t, [[M16, 0], [M16 + 0.2, 1]])); }
      show(carrier, 'burb', cp);
      ZIPN.forEach((n, i) => { const p = pose({ x: n.x, z: n.z, rotY: 1.0 + 0.25 * i }); p.eyes = blink(t, 80 + i); p.mouth = 'flat'; p.headYaw = -0.6 + 0.2 * i;
        if (i === 0) p.armB = POINT_B; if (i === 2) p.armB = CAM_B; if (t > 40.6 && t < 41.6 && i === 1) { p.armA = UP_A; p.armB = UP_B; p.mouth = 'smile'; }
        if (t > M16) { p.mouth = 'o'; p.headPitch = -0.35; p.lean = -0.12; } show(pool[i], 'burb', p); });
      // the gust: letters fly out of the carrier's bag
      if (t > M16 + 0.3) letters.forEach((l, i) => { const a = t - M16 - 0.3 - i * 0.05; if (a < 0) return; l.visible = true; l.position.set(55.4 + 0.5 - 3.2 * a + 0.3 * Math.sin(a * 5 + i), 1.1 + 1.6 * a - 0.25 * a * a + 0.2 * Math.sin(a * 7 + i), 1.6 + (i - 5) * 0.12 + 0.8 * a * Math.sin(i)); l.rotation.set(a * 5 + i, a * 3, a * 7); });
      sign.g.rotation.z = 0.04 * Math.sin(t * 9) * K(t, [[M16 + 0.3, 0], [M16 + 0.6, 1]]);
      jolts.push([40.0, 0.02], [M16, 0.05]);
    } else if (cam === 'orbit') {
      space.spin.quaternion.copy(qOrbit); space.spin.position.set(0, 0, 0); space.atm.position.set(0, 0, 0); swarm.pts.visible = true;
      swarm.update(t, 1);
      const nB = US.clone().applyQuaternion(qOrbit), r = sizeAt(t, vis) / 2;
      const C = nB.clone().multiplyScalar(400 + r * 0.92);
      planet.visible = true; planet.scale.setScalar(r); planet.position.set(o[0] + C.x, o[1] + C.y, o[2] + C.z);
      // camera: 160 units "south" along the surface, 34 units up, looking at the load + the limb behind it
      const tan = V3(0, 1, 0).sub(nB.clone().multiplyScalar(nB.y)).normalize().negate(), cb = nB.clone().multiplyScalar(400).addScaledVector(tan, 150).addScaledVector(nB, 38 + 0.6 * (t - 45));
      P = [cb.x + o[0], cb.y + o[1], cb.z + o[2]]; const am = C.clone().addScaledVector(nB, 14); Aim = [am.x + o[0], am.y + o[1], am.z + o[2]];
      sats.forEach((s, i) => { const u = (t - 45 + i * 0.7) * 22 - 25, sw = K(t, [[45.2, 0], [45.6, 1]]); const base = C.clone().addScaledVector(tan, 60 + i * 18).addScaledVector(nB, 12 + i * 7 + 18 * sw * (i === 1 ? 1 : 0)); const side = V3().crossVectors(nB, tan).normalize(); s.g.position.copy(base.addScaledVector(side, u + (i === 0 ? -14 : 0) * sw)); s.g.rotation.set(t * 0.3 + i, i * 2, sw * (i - 1) * 0.6); });
      camPos.set(...P); censorAt(cen, V3(C.x + o[0], C.y + o[1], C.z + o[2]), 1.3 * r, r);
      impact(t, 45.2, 'space', [C.x, C.y, C.z], 3 * r, false);
      jolts.push([45.2, 0.4]);
    } else if (cam === 'war') {
      war.setGlobeLight(1);
      const g = war.globe; g.spin.rotation.y = faceLon(-98) + 0.1 * Math.sin(t * 0.3);
      ANALYST.forEach((a, i) => show(pool[i], 'war', analystPose(t, i)));
      tablets.forEach((c, i) => (c.visible = true));
      g.g.updateMatrixWorld(true);
      const loc = g.spin.localToWorld(g.toLocal(39, -98, 0.02));
      camPos.set(...P);
      const grow2 = 0.07 * (t < 47.7 ? 1 : grow(1, 2.2, t - 47.7)) * (1 + 3.6 * K(t, [[48.4, 0], [50.2, 1]], (u) => u));
      censorAt(cen2, loc, Math.min(grow2, 1.05), 0.06);
      jolts.push([47.7, 0.02]);
    } else if (cam === 'earth') {
      // Earth at the space origin; the round tarp planet sits on top of it, true scale; at 53.0 it passes Earth and Earth starts to orbit it
      const r = sizeAt(t, visTrue) / 2;
      space.spin.quaternion.copy(qEarth); swarm.pts.visible = false;
      const up = V3(0.18, 0.95, 0.25).normalize();
      const orbit = K(t, [[53.15, 0], [55.4, 1]], (u) => u * u) * 1.15;
      const Cb = up.clone().multiplyScalar(400 + r * 0.985);
      // Earth swings around the planet's center (in the camera plane)
      const ax = V3(0, 0, 1), E = up.clone().multiplyScalar(-(400 + r * 0.985)).applyAxisAngle(ax, -orbit).add(Cb);
      space.spin.position.copy(E); space.atm.position.copy(E);
      planet.visible = true; planet.scale.setScalar(r); planet.position.set(o[0] + Cb.x, o[1] + Cb.y, o[2] + Cb.z); planet.rotation.y = t * 0.05;
      const mid = Cb.clone().add(E).multiplyScalar(0.5), span = Math.max(1100, 400 + 2 * r + 400) ;
      const D = span / (2 * Math.tan((CAMS.earth.fov / 2) * PI / 180)) * 1.25;
      P = [mid.x + o[0] + D * 0.18, mid.y + o[1] + D * 0.05, mid.z + o[2] + D]; Aim = [mid.x + o[0], mid.y + o[1], mid.z + o[2]];
      camPos.set(...P); censorAt(cen, V3(Cb.x + o[0], Cb.y + o[1], Cb.z + o[2]), 0.72 * r, r);
      jolts.push([50.4, 6], [51.6, 10], [53.0, 18]);
    } else if (cam === 'sit') {
      const p = sitPose({ x: 0, z: 0.02, rotY: 0, mouth: 'flat' }, 0.42, 0); p.eyes = blink(t, 2);
      cupG.visible = true; p.armB = CUP_B; p.armA = A(0.25, 0.35, -0.3); p.lean = -0.12; p.headPitch = -0.12;
      const sip = K(t, [[56.4, 0], [56.75, 1], [57.3, 1], [57.6, 0]]); p.armB = mixArm(CUP_B, SIP_B, sip);
      if (t < 56.3) p.eyes = 'closed';
      if (t > 57.7) { p.mouth = 'smile'; p.headYaw = 0.2 * K(t, [[57.7, 0], [58.0, 1]]); }
      if (t > 58.3) p.armB = mixArm(CUP_B, A(-1.6, 0.35, -1.6, -0.4), K(t, [[58.3, 0], [58.6, 1]]));   // a little cheers
      show(you, 'perch', p);
      chair.g.position.set(0, -0.003, 0);
      flag.update(t); pEarth.rotation.y = t * 0.04;
      you.root.updateMatrixWorld(true);
      const cupW = cupG.getWorldPosition(V3(0, 0, 0));
      for (let k = 0; k < 6; k++) { const a = ((t * 0.6 + k / 6) % 1); steam.set(k, V3(cupW.x + 0.03 * Math.sin(t * 2 + k), cupW.y + 0.12 + a * 0.35, cupW.z + 0.02), 0.06 + a * 0.14, 0.35 * Math.sin(a * PI), new THREE.Color(0xf4f4f4)); }
    }

    // camera (+ impact jolts)
    for (const [m, k0] of jolts) if (t > m && t < m + 0.6) { const k = k0 * Math.exp(-(t - m) * 7); P = [P[0] + k * Math.sin(t * 70 + m), P[1] + k * Math.sin(t * 55 + m), P[2] + k * 0.5 * Math.sin(t * 63)]; }
    studio.setCamera(P, Aim, fov, t, cam === 'earth' ? 0 : cam === 'craneWide' ? 0.15 : 0.006);
  }

  // war-room analysts: four around the table (two across, facing us; two at the sides)
  const ANALYST = [150, 210, 62, 298].map((d) => { const a = (d * PI) / 180; return [1.62 * Math.sin(a), 1.62 * Math.cos(a)]; });
  function analystPose(t, i) {
    const [x, z] = ANALYST[i], p = pose({ x, z, rotY: headAt(x, z, 0, 0) }); p.eyes = blink(t, 90 + i); p.mouth = 'flat';
    p.armB = A(-0.9, 0.12, -1.25, -0.5); p.lean = 0.12; p.headPitch = -0.05;
    if (t > 47.7 + 0.05 * i) { const k = K(t, [[47.7 + 0.05 * i, 0], [47.95 + 0.05 * i, 1]]); p.lean = lerp(0.12, -0.22, k); p.mouth = 'o'; p.armA = mixArm(REST, UP_A, k); }
    if (t > 49.0) { p.lean = -0.1; p.armA = A(-1.25, -0.05, -2.4, 0.7); }
    return p;
  }

  return { update };
}
