// VIDEO 036 — "What if the Sun disappeared?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 65.0 s. The Sun vanishes at SECOND 0, but its last light (and the end of its gravity) take 8 min 19 s to reach us, so for that
// stretch the world is a bright, normal day while the HUD counts down 8:19 → 0:00. Then the day side goes dark all at once, the
// Moon 1.3 s later, Jupiter ~70 min later; the stars stay; Earth flies off in a straight line; the cold sets in over days → a year.
// NEW: engine/sets/lagoon.js (Icelandic geothermal lagoon + nightSkyTexture), core.js HUD fmt 'clock' / 'dur' / 'temp'.
// Reused: pool.js (Phoenix), football.js (London), wedding.js (Tuscany), city.js (Bangkok rooftop, Chicago street),
// tidetown.js (Maine harbor), tech.js buildSpace (Earth), moon.js (the half Moon at its true size).
//
// PHYSICS MODEL (stated so a reviewer can check every number)
//  • The Sun's mass and light vanish at SECOND 0. Light AND gravity both travel at c (gravitational waves + light from the
//    neutron-star merger GW170817 arrived 1.7 s apart after 130 million years), so Earth notices nothing for 1 AU / c = 499.0 s.
//    The HUD counts that down linearly (story.json; the last 5 s are stretched to 2.4 s of screen for the countdown).
//  • At 499 s the whole day side goes dark at the same instant (sunlight stops arriving everywhere at once; ±0.02 s across the
//    planet). The sky turns black and the stars are visible at 4 PM. Night-side places see no change… except the Moon: a
//    first-quarter Moon sits ~90° from the Sun, so its sunlight path is ≈ 1 AU + 384,400 km → it goes dark 384,400 km / c =
//    1.28 s after Earth's daylight. Jupiter (at opposition: Sun→Jupiter 5.2 AU = 43.3 min, Jupiter→Earth 4.2 AU = 34.9 min) goes
//    dark 43.3 + 34.9 − 8.3 ≈ 70 min after the daylight (66–91 min depending on where Jupiter is). The stars don't change.
//  • With no Sun to curve its path, Earth keeps its velocity: 29.78 km/s in a straight line (2.6 million km a day). The orbit shot
//    is a schematic: the "orbit it would have taken" arc is drawn with an exaggerated curvature.
//  • Cooling (common published estimates, said as "scientists estimate"): average surface ≈ −18 °C (0 °F) after a week,
//    ≈ −73 °C (−100 °F) after a year. The +1 DAY and +1 MONTH HUD values are smooth interpolations between those (not sourced);
//    the ocean's surface freezes within weeks, but the ice insulates the deep ocean, which stays liquid for a very long time
//    (estimates: hundreds of thousands of years). Geothermal places (Iceland: ~90 % of homes heated by geothermal water) keep
//    local heat; geothermal flux (~0.09 W/m²) is far too small to warm the planet.
//  • Times: SECOND 0 = 15:00 UTC. Phoenix (MST, UTC−7) 8:00 AM · London (GMT) 3:00 PM · Tuscany (CET) 4:00 PM (sunset ≈ 5:05 PM) ·
//    Bangkok (UTC+7) 10:00 PM with a first-quarter Moon ~22° up in the west-southwest. The light ends at 15:08:19 UTC.
//
// SOURCES (checked Oct 2026):
//   1 AU = 149,597,870.7 km (IAU 2012) / c = 299,792.458 km/s → 499.0 s = 8 min 19 s (NASA quotes "about 8 minutes 20 seconds")
//   Earth's mean orbital speed 29.78 km/s (NASA Earth Fact Sheet) · mean Earth–Moon distance 384,400 km (NASA Moon Fact Sheet)
//   Jupiter 5.20 AU from the Sun (NASA Jupiter Fact Sheet) · speed of gravity = c to 1 part in 10^15 (Abbott et al. 2017, GW170817)
//   cooling: Popular Science, "What would happen if the sun went out?" (2013, D. Stevenson, Caltech: below 0 °F within a week,
//   −100 °F within a year; ice on top keeps the deep ocean liquid for hundreds of thousands of years); How It Works; ScienceAlert
//   Iceland geothermal heating ≈ 90 % of homes (Orkustofnun / National Energy Authority of Iceland)
//
// Shot list (seconds)                     | set    | what happens
//  0.0– 3.4 title                         | pool   | crane down over a busy Phoenix pool at 8 AM
//  3.4– 6.3 sun     SECOND 0 at 3.9       | space  | the Sun pops out of existence over a sunlit Earth — Earth stays lit
//  6.3–11.4 pool    8:15 → 5:47           | pool   | low at the edge: a dad tosses his kid, a beach-ball rally, splashes
// 11.4–16.6 goal    5:47 → 3:20           | stad   | London: the ball hits the net, the home end erupts, the striker runs to them
// 16.6–21.4 wed     3:20 → 0:05           | wed    | Tuscany at golden hour: petals, a kiss, the photographer's flash
// 21.4–24.4 dive    0:05 → 0:00 (23.8)    | pool   | a kid sprints down the diving board, jumps — it goes dark in mid-air
// 24.4–29.0 wedDark +0.6 → +5.2 s          | wed    | the wedding party under a black sky full of stars at 4 PM, lit by the flash
// 29.0–34.0 roof    Bangkok, night side   | city   | a phone photo of the half Moon: dark at +1.3 s; reverse on the faces (+70 min: Jupiter)
// 34.0–37.0 orbit                         | space  | dark Earth (city lights) leaves the curve on a straight line
// 37.0–41.6 frost   +1 DAY                | pool   | the same pool at night: frost, an ice skin, the swimmers in towels round a fire drum
// 41.6–46.2 fires   +1 WEEK −18 °C        | city   | Chicago corner: fire barrels + a patio heater, lit shop windows, frost
// 46.2–50.8 ice     +1 MONTH              | tide   | Maine harbor frozen; an ice fisherman pulls a fish out of the liquid water below
// 50.8–55.6 soak    +1 YEAR −73 °C        | lagoon | Iceland: faces in the steaming geothermal lagoon, frost in their hair
// 55.6–65.0 stars                         | lagoon | a kid points up; the camera tilts to the Milky Way. Fade 60.2, end card 60.8
import * as THREE from 'three';
import { K, clamp, lerp, smooth, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makePhone, makeFlashlight } from '@engine/props.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildStadium, DIMS as SD } from '@engine/sets/football.js';
import { buildWedding } from '@engine/sets/wedding.js';
import { buildCity, ROOF_Y, makeCar } from '@engine/sets/city.js';
import { buildTidetown } from '@engine/sets/tidetown.js';
import { buildLagoon, nightSkyTexture } from '@engine/sets/lagoon.js';
import { buildSpace, makeSpritePool } from '@engine/sets/tech.js';
import { makeSkyMoon, ANG0 } from '@engine/moon.js';

const PI = Math.PI, SW = 3.9, OUT = 23.8, GOAL = 12.05, MOON_OUT = OUT + 1.28 + (29.0 - OUT), JUP_OUT = 33.0;
const OFF = { city: [0, 0, 0], pool: [3000, 0, 0], stad: [6000, 0, 0], wed: [9000, 0, 0], tide: [12000, 0, 0], lag: [16000, 0, 0], space: [24000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'title', set: 'pool' },
  { t0: 3.4, t1: 6.3, cam: 'sun', set: 'space' },
  { t0: 6.3, t1: 11.4, cam: 'pool', set: 'pool' },
  { t0: 11.4, t1: 16.6, cam: 'goal', set: 'stad' },
  { t0: 16.6, t1: 21.4, cam: 'wed', set: 'wed' },
  { t0: 21.4, t1: 24.4, cam: 'dive', set: 'pool' },
  { t0: 24.4, t1: 29.0, cam: 'wedDark', set: 'wed' },
  { t0: 29.0, t1: 31.3, cam: 'moonA', set: 'city' },
  { t0: 31.3, t1: 34.0, cam: 'moonB', set: 'city' },
  { t0: 34.0, t1: 37.0, cam: 'orbit', set: 'space' },
  { t0: 37.0, t1: 41.6, cam: 'frost', set: 'pool' },
  { t0: 41.6, t1: 46.2, cam: 'fires', set: 'city' },
  { t0: 46.2, t1: 50.8, cam: 'ice', set: 'tide' },
  { t0: 50.8, t1: 55.6, cam: 'soak', set: 'lag' },
  { t0: 55.6, t1: 65.0, cam: 'stars', set: 'lag' },
];
// camera coords LOCAL to the shot's set: p/a = [start, end] (eased); fov; amp = handheld drift
export const CAMS = {
  title:   { p: [[4.5, 9.5, 15.5], [1.8, 2.3, 9.6]], a: [[0.2, -0.4, 0.6], [0.2, 0.05, 2.0]], fov: 50, amp: 0.008 },
  sun:     { p: [[0, -100, 1700], [0, -70, 1560]], a: [[0, 330, 0], [0, 320, 0]], fov: 60, amp: 0.4 },
  pool:    { p: [[1.7, 0.42, 6.6], [1.0, 0.38, 6.4]], a: [[0.35, 0.12, 2.4], [0.1, 0.15, 2.3]], fov: 48, amp: 0.004 },
  goal:    { p: [[50.4, 1.3, 1.9], [51.2, 1.5, 1.4]], a: [[60.5, 2.3, -0.3], [60.5, 2.9, 0.0]], fov: 50, amp: 0.006 },
  wed:     { p: [[1.35, 1.5, 3.4], [0.75, 1.45, 2.6]], a: [[0.05, 1.3, -3.0], [0.02, 1.32, -3.0]], fov: 50, amp: 0.004 },
  dive:    { p: [[-7.3, 0.55, 2.8], [-7.6, 0.5, 3.1]], a: [[-12, 1.0, 5.5], [-12, 0.9, 3.4]], fov: 52, amp: 0.004 },   // aim tracks the kid (custom)
  wedDark: { p: [[0.8, 1.0, -0.8], [0.45, 0.92, -1.25]], a: [[0.0, 2.0, -3.4], [0.0, 2.05, -3.4]], fov: 54, amp: 0.004 },
  moonA:   { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 30, amp: 0.003 },   // behind the phone (custom)
  moonB:   { p: [[-8.55, 17.05, 11.75], [-8.85, 17.0, 11.95]], a: [[-10.5, 17.55, 12.55], [-10.5, 17.6, 12.55]], fov: 50, amp: 0.004 },
  orbit:   { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 50, amp: 0.5 },   // trails Earth (custom)
  frost:   { p: [[2.3, 1.35, 4.5], [1.4, 1.3, 4.85]], a: [[0.95, 1.25, 7.5], [0.85, 1.25, 7.5]], fov: 52, amp: 0.005 },
  fires:   { p: [[3.3, 1.4, 1.8], [3.6, 1.35, 2.7]], a: [[5.95, 1.35, 3.45], [5.95, 1.35, 3.7]], fov: 50, amp: 0.005 },
  ice:     { p: [[-2.1, 0.85, -9.9], [-2.6, 0.78, -9.5]], a: [[-3.25, 0.72, -6.6], [-3.3, 0.78, -6.6]], fov: 50, amp: 0.005 },
  soak:    { p: [[1.6, 0.58, 3.45], [-0.6, 0.52, 3.2]], a: [[1.2, 0.36, 1.2], [-0.5, 0.36, 1.2]], fov: 50, amp: 0.004 },
  stars:   { p: [[0.75, 0.35, 3.65], [0.6, 0.55, 3.45]], a: [[0.2, 0.3, 2.1], [0.2, 0.3, 2.1]], fov: 50, amp: 0.003 },   // tilts up (custom)
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CHEER = A(-2.75, 0.4, -0.25, 0);
const OUTSTR = A(-0.2, 1.35, -0.15, 0);
const HUG_A = A(-0.25, 1.05, -1.45, 0.35), HUG_B = A(-0.25, 1.05, -1.45, -0.35);
const WARM = A(-0.95, 0.2, -1.25, 0.55), WARM_B = A(-0.95, 0.2, -1.25, -0.55);   // hands out over a fire
const HUGSELF_A = A(-0.55, 0.15, -2.0, 0.9), HUGSELF_B = A(-0.55, 0.15, -2.0, -0.9);
const POINT_UP = A(-2.75, 0.25, -0.05, 0);
const PHONE_UP = A(-2.15, 0.12, -0.55, -0.25);
const CAM_A = A(-1.25, 0.1, -1.45, 0.5), CAM_B = A(-1.2, 0.1, -1.5, -0.5);
const HIGH_A = A(-2.9, 0.35, -0.35, 0), HIGH_B = A(-2.9, 0.35, -0.35, 0);
const ROD_B = A(-0.9, 0.12, -0.7, -0.2);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const splash = (t, ph) => A(-0.9 + 0.5 * Math.sin(t * 7 + ph), 0.6, -0.4 + 0.3 * Math.sin(t * 7 + ph), 0);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'short', 'bob'];
const SWIM = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8];
const COATS = [0x8a2f2a, 0x2f4f6e, 0x4a5a3a, 0x6a4a7a, 0x9a6a2a, 0x2a2f38, 0x7a3a4a];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- sets (city stays at the origin: its sky follows the camera)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const tide = buildTidetown(studio, {}); tide.root.position.set(...OFF.tide);
  const lag = buildLagoon(studio, {}); lag.root.position.set(...OFF.lag);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ROOTS = { city: city.root, pool: pool.root, stad: stad.root, wed: wed.root, tide: tide.root, lag: lag.root, space: space.root };
  const FOGS = { city: cityFog, pool: pool.fog, stad: stad.fog, wed: wed.fog, tide: tide.fog, lag: lag.fog, space: null };
  const FAR = { city: 900, pool: 300, stad: 900, wed: 260, tide: 2200, lag: 460, space: 9000 };
  const EXPO = { city: 1.2, pool: 1.05, stad: 1.05, wed: 1.05, tide: 1.25, lag: 1.25, space: 1.0 };

  // day sets: their sky dome + clouds swap to the painted night sky when the light runs out
  const nightTex = nightSkyTexture(36);
  const nightM = () => { const m = new THREE.MeshBasicMaterial({ map: nightTex, side: THREE.BackSide, fog: false, toneMapped: false }); m.color.setScalar(1.15); return m; };
  const poolSky = pool.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 260);
  const wedSky = wed.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 220);
  const DAYSKY = { pool: [poolSky, poolSky.material, nightM()], wed: [wedSky, wedSky.material, nightM()] };
  const poolClouds = pool.root.children.filter((o) => o.isGroup && o.position.y > 40);
  const deckSlabs = pool.root.children.filter((o) => o.isMesh && o.geometry.type === 'BoxGeometry' && Math.abs(o.position.y + 0.15) < 1e-3 && o.geometry.parameters.height === 0.3);
  const deckDay = deckSlabs.map((m) => m.material.color.clone());
  const poolWaterM = pool.water.material, iceSkinM = new THREE.MeshStandardMaterial({ color: 0xcfe2ee, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.93, map: poolWaterM.map });
  // Phoenix at 8 AM: a lower, warmer morning sun from the east (+x)
  pool.lights.sun.position.set(26, 17, 12); pool.lights.sun.color.set(0xffe6c0);
  // Tuscany at 4 PM in late October: golden hour
  wed.lights.sun.position.set(13, 6.5, 10); wed.lights.sun.color.set(0xffcf96); wed.lights.sun.intensity = 2.9; wed.lights.hemi.color.set(0xffe8cc);
  const DAYL = { pool: [pool.lights.hemi.intensity, pool.lights.sun.intensity], wed: [wed.lights.hemi.intensity, wed.lights.sun.intensity] };
  function dayNight(key, dark) {
    const L = key === 'pool' ? pool.lights : wed.lights, [hi, si] = DAYL[key], [sky, dm, nm] = DAYSKY[key];
    L.hemi.intensity = dark ? 0.06 : hi; L.sun.intensity = dark ? 0 : si; sky.material = dark ? nm : dm;
    (key === 'pool' ? pool.fog : wed.fog).color.set(dark ? 0x05070e : key === 'pool' ? 0xe6eef2 : 0xeef0e6);
    if (key === 'pool') poolClouds.forEach((c) => (c.visible = !dark));
  }

  pool.root.children.filter((o) => o.isInstancedMesh).forEach((o) => (o.visible = false));   // no lane ropes: a free-swim morning
  // ---------------------------------------------------------------- shared FX
  const blobGeo = new THREE.SphereGeometry(1, 12, 9);
  const waterM = new THREE.MeshStandardMaterial({ color: 0xbfe6f7, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.8, emissive: 0x1a4a66, emissiveIntensity: 0.3 });
  const NB = 400, blobs = new THREE.InstancedMesh(blobGeo, waterM, NB); blobs.frustumCulled = false; blobs.castShadow = false; scene.add(blobs);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), S3 = new THREE.Vector3();
  let nb = 0;
  const blob = (p, r) => { if (nb >= NB || r < 0.004) return; S3.setScalar(r); M4.compose(p, Q4.identity(), S3); blobs.setMatrixAt(nb++, M4); };
  /** a splash: n droplets thrown up + out from (key,x,y,z) at time `at` (ballistic) */
  const splashAt = (key, x, y, z, t, at, n = 40, v = 2.6, seed = 1) => { const age = t - at; if (age < 0 || age > 1.1) return; const r = rng(seed); for (let k = 0; k < n; k++) { const a = r() * PI * 2, s = 0.4 + r() * 0.9, vy = v * (0.6 + r() * 0.6), hy = vy * age - 4.9 * age * age; if (hy < -0.05) { r(); continue; } blob(W(key, x + Math.cos(a) * s * age * 1.4, y + hy, z + Math.sin(a) * s * age * 1.4), 0.03 + r() * 0.04); } };
  const smoke = makeSpritePool(scene, 120, 'smoke'), fire = makeSpritePool(scene, 48, 'fire');
  const white = new THREE.Color(0xffffff), breathC = new THREE.Color(0xe8eef6), steamC = new THREE.Color(0xf0f0f0);
  let ns = 0, nf = 0;
  const puff = (p, size, op, c = breathC) => { if (ns < 120) smoke.set(ns++, p, size, op, c); };
  const flame = (p, size, op) => { if (nf < 48) fire.set(nf++, p, size, op); };
  /** a fire: flickering flame sprites over (key,x,y,z) + a warm point light */
  const fireLights = [0, 1].map(() => { const L = new THREE.PointLight(0xff9a40, 0, 9, 1.6); scene.add(L); return L; });
  let nfl = 0;
  function fireAt(key, x, y, z, t, k = 1, seed = 0) {
    for (let i = 0; i < 9; i++) { const age = (t * (1.6 + (i % 3) * 0.3) + i / 9 + seed) % 1, s = (1 - age) * 0.3 * k; flame(W(key, x + 0.1 * Math.sin(i * 2.3 + t * 3), y + age * 0.42 * k, z + 0.1 * Math.cos(i * 1.7 + t * 2.6)), s + 0.06, 0.75 * (1 - age)); }
    for (let i = 0; i < 4; i++) { const age = (t * 0.35 + i / 4 + seed) % 1; puff(W(key, x + age * 0.3, y + 0.8 + age * 1.8, z), 0.4 + age * 1.0, 0.25 * (1 - age), new THREE.Color(0x4a4a50)); }
    if (nfl < 2) { const L = fireLights[nfl++]; L.position.copy(W(key, x, y + 0.55, z)); L.intensity = (3.6 + 0.9 * Math.sin(t * 13 + seed) + 0.6 * Math.sin(t * 29)) * k; }
  }
  /** breath: a small cloud in front of a rig's mouth every ~2.2 s */
  const breath = (rig, t, ph = 0) => { const c = (t * 0.45 + ph) % 1; if (c > 0.45) return; rig.root.updateMatrixWorld(true); const m = rig.head.g.localToWorld(new THREE.Vector3(0, -0.06, 0.22 + c * 0.35)); puff(m, 0.12 + c * 0.45, 0.42 * Math.sin(PI * c / 0.45)); };
  let shake = [0, 0];
  const jolt = (t, at, k0 = 0.03, rate = 7) => { if (t > at && t < at + 0.8) { const k = k0 * Math.exp(-(t - at) * rate); shake = [shake[0] + k * Math.sin(t * 71), shake[1] + k * Math.sin(t * 53)]; } };
  const flashL = new THREE.PointLight(0xf4f6ff, 0, 14, 1.2); scene.add(flashL);
  const flashK = (t, times) => times.reduce((m, at) => Math.max(m, t >= at && t < at + 0.25 ? Math.exp(-(t - at) * 22) : 0), 0);

  // ---------------------------------------------------------------- cast helpers
  const R = rng(36);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.root.visible = false; return p; };
  const civ = (o = {}) => { const st = pick(STYLES); return person({ skin: pick(SKINS), top: pick(SWIM), pants: pick(SWIM), hair: pick(HAIRS), hairStyle: st, glasses: R() < 0.15, ...o }); };
  /** pose a rig at (x,z) local to a set; y = root height, floor = ground under the feet, s = scale (kids) */
  function put(rig, key, p, o = {}) {
    const y = o.y ?? 0, floor = o.floor ?? y, s = o.s ?? 1;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    if (s === 1) { p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1]; applyPose(rig, p); }
    else { p.y = 0; p.floor = (floor - y) / s; applyPose(rig, p); rig.root.scale.setScalar(s); rig.root.position.y = y + OFF[key][1]; }
    rig.root.rotation.set(o.rx ?? 0, p.rotY, o.rz ?? 0, 'YXZ');
    rig.root.visible = true;
  }
  const kidO = (o) => ({ headR: 0.175, ...o });
  // wraps (towel / blanket round the shoulders), beanies, scarves
  const wrap = (rig, color) => { const m = mk(new THREE.CylinderGeometry(0.21, 0.27, 0.62, 18, 1, true), mat(color, 0.95, { side: THREE.DoubleSide }), rig.spine, 0, 0.26, 0); m.scale.z = 0.82; const c = mk(new THREE.TorusGeometry(0.16, 0.05, 8, 18), mat(color, 0.95), rig.spine, 0, 0.53, 0); c.rotation.x = PI / 2; c.scale.set(1.15, 0.9, 1); return [m, c]; };
  const beanie = (rig, color) => { const r = rig.head.head.geometry.parameters.radius; const b = mk(new THREE.SphereGeometry(r * 1.1, 18, 10, 0, PI * 2, 0, PI * 0.5), mat(color, 0.95), rig.head.g, 0, r * 0.12, -r * 0.02); mk(new THREE.SphereGeometry(r * 0.28, 10, 8), mat(0xf4f1ea, 0.95), b, 0, r * 1.08, 0); return b; };
  const idle = (p, t, i, k = 1) => { p.headYaw += 0.12 * k * Math.sin(t * 0.9 + i * 1.7); p.headRoll = 0.05 * k * Math.sin(t * 0.7 + i); p.lean += 0.03 * k * Math.sin(t * 0.8 + i * 2.1); p.eyes = blink(t, i); };

  // ================================================================ POOL (Phoenix, 8 AM; deck y = 0, water −0.15, floor −1.4)
  const BALLC = canvasTex(256, 128, (g, w, h) => { const c = ['#e83b3b', '#ffffff', '#3d7bd9', '#ffffff', '#f2c14e', '#ffffff']; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * w / 6, 0, w / 6 + 1, h); }); });
  const ball = mk(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ map: BALLC, roughness: 0.4 }), scene); ball.visible = false;
  const SW_POS = [ // x, z, rotY, role
    [0.55, 3.35, 0.15, 'dad'], [-0.25, 2.75, 0.35, 'mom'], [1.15, 1.2, -0.6, 'ballA'], [-0.95, 0.4, 0.7, 'ballB'],
    [3.6, -1.2, -0.3, 'swim'], [-3.4, -2.4, 0.4, 'swim'], [5.6, 1.2, -0.8, 'swim'], [-5.4, 1.8, 0.9, 'swim'], [1.0, -3.6, 0.1, 'swim'],
    [-10.3, 2.3, 0.2, 'watch'], [-10.9, 1.85, 0.35, 'watch'],
  ];
  const swimmers = SW_POS.map(([x, z, ry, role], i) => civ({ hairStyle: role === 'dad' ? 'short' : pick(STYLES), mustache: role === 'dad' ? 0x3a2a1c : null }));
  const poolKid = person(kidO({ skin: 0xe2ad8c, top: 0xf1c24a, pants: 0xf1c24a, hair: 0x3a2a1c, hairStyle: 'messy' }));
  const diver = person(kidO({ skin: 0xc98e6a, top: 0xd2483f, pants: 0x3d7bd9, hair: 0x1a1a1a, hairStyle: 'short' }));
  const deckers = [0, 1, 2].map(() => civ());
  const lifeguard = person({ skin: 0xc98e6a, top: 0xd2483f, pants: 0xd2483f, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  // the +1 DAY huddle round a fire drum on the deck (same swimmers, in towels)
  const huddle = [0, 1, 3, 2, 4].map((i) => swimmers[i]);
  const towels = huddle.map((rig, k) => wrap(rig, [0xf2b632, 0x4f9bd9, 0xe58fa6, 0x58b368, 0xf08a4b][k]));
  towels.flat().forEach((m) => (m.visible = false));
  const drum = new THREE.Group(); mk(new THREE.CylinderGeometry(0.3, 0.3, 0.85, 18, 1, true), mat(0x3a3530, 0.6, { side: THREE.DoubleSide, metalness: 0.4 }), drum, 0, 0.425, 0); mk(new THREE.TorusGeometry(0.3, 0.025, 6, 20), mat(0x2a2522, 0.5), drum, 0, 0.85, 0).rotation.x = PI / 2; scene.add(drum); drum.visible = false;
  const DRUM = [0.9, 7.05];
  const poolFlash = [0, 1].map(() => { const f = makeFlashlight({ length: 9, radius: 1.2 }); scene.add(f.g); f.g.visible = false; return f; });

  function poolScene(t, cam) {
    const dark = t >= OUT; dayNight('pool', dark);
    pool.update(cam === 'frost' ? 3.0 : t);
    pool.water.material = cam === 'frost' ? iceSkinM : poolWaterM;
    deckSlabs.forEach((m, i) => m.material.color.copy(cam === 'frost' ? new THREE.Color(0xd8e4f2) : deckDay[i]));
    if (cam === 'frost') return frostScene(t);
    // swimmers: shoulders at the surface (standing on the floor), bobbing; the dad tosses his kid twice; a beach-ball rally
    const TOSS = [7.6, 9.7];
    SW_POS.forEach(([x, z, ry, role], i) => {
      const rig = swimmers[i], p = basePose(); idle(p, t, i, 0.8);
      Object.assign(p, { x: x + 0.08 * Math.sin(t * 0.7 + i), z, rotY: ry, mouth: 'smile' });
      let y = PD.floor + 0.02 * Math.sin(t * 2.1 + i * 1.3);
      if (role === 'dad') { const up = TOSS.reduce((m, a) => Math.max(m, K(t, [[a - 0.5, 0], [a - 0.15, 1], [a + 0.05, 1], [a + 0.25, 0]])), 0); p.armA = mixArm(A(-1.0, 0.25, -1.2, 0.3), A(-2.7, 0.2, -0.3, 0), up); p.armB = mixArm(A(-1.0, 0.25, -1.2, -0.3), A(-2.7, 0.2, -0.3, 0), up); p.headPitch = -0.35 * up; p.mouth = 'o'; y -= 0.1 * up; }
      else if (role === 'mom') { p.armA = splash(t, 0); p.armB = A(-1.2, 0.4, -1.3, -0.4); p.headYaw = 0.35; p.mouth = 'o'; }
      else if (role === 'ballA' || role === 'ballB') { const hit = Math.abs(Math.sin((t - 6.3) * PI / 1.25 + (role === 'ballA' ? 0 : PI / 2))); p.armA = mixArm(A(-1.2, 0.3, -0.6), HIGH_A, hit); p.armB = mixArm(A(-1.2, 0.3, -0.6), HIGH_B, hit); p.headPitch = -0.4; }
      else if (role === 'watch') { p.headPitch = -0.25; p.headYaw = -0.2; p.armA = A(-0.4, 0.3, -0.5); p.armB = A(-0.4, 0.3, -0.5); p.mouth = t > 23.0 ? 'o' : 'smile'; if (cam !== 'dive') return; }
      else { p.armA = splash(t, i); p.armB = splash(t, i + 1.3); }
      if (cam === 'dive' && role !== 'watch' && role !== 'swim') return;
      put(rig, 'pool', p, { y, floor: y });
    });
    // the kid the dad throws: up 0.9 m, down with a splash
    if (cam !== 'dive') {
      const dad = SW_POS[0]; let ky = -0.45, kz = dad[1] + 0.35, ph = 0;
      for (const a of TOSS) { const u = (t - (a - 0.05)) / 0.75; if (u > 0 && u < 1) { ky = -0.45 + 1.05 * Math.sin(PI * u) - 0.35 * u; kz = dad[1] + 0.35 + 0.5 * u; ph = u; } splashAt('pool', dad[0], PD.water, dad[1] + 0.85, t, a + 0.7, 40, 2.4, a * 10); }
      const p = basePose(); idle(p, t, 20); Object.assign(p, { x: dad[0] - 0.05, z: kz, rotY: 0.2, mouth: ph > 0 ? 'o' : 'smile', crouch: ph > 0 ? 0.3 : 0 }); p.armA = ph > 0 ? CHEER : splash(t, 4); p.armB = ph > 0 ? CHEER : splash(t, 5);
      put(poolKid, 'pool', p, { y: ky, floor: ky - 0.02, s: 0.62 });
      // beach ball between ballA and ballB
      const [ax, az] = [SW_POS[2][0], SW_POS[2][1]], [bx, bz] = [SW_POS[3][0], SW_POS[3][1]], u = ((t - 6.3) / 1.25) % 2, f = u < 1 ? u : 2 - u;
      ball.position.copy(W('pool', lerp(ax, bx, f), 0.55 + 1.3 * Math.sin(PI * (u % 1)), lerp(az, bz, f))); ball.rotation.set(t * 3, t * 2, 0); ball.visible = true;
      // the lifeguard + people on the deck
      { const p = basePose(); idle(p, t, 30); Object.assign(p, { x: PD.tower[0], z: PD.tower[1] - 0.05, rotY: PI + 0.3, footFwd: 0.42, headPitch: 0.25 }); p.armB = A(-1.6, 0.2, -1.6, -0.5); put(lifeguard, 'pool', p, { y: 2.04 - 0.42 - 0.375, floor: 2.04 - 0.42 }); }
      deckers.forEach((rig, i) => { const p = basePose(); idle(p, t, 40 + i); Object.assign(p, { x: [-6.4, 4.2, 7.4][i], z: 6.25, rotY: PI, footFwd: 0.42, headPitch: 0.25 }); p.armA = A(0.6, 0.3, -0.2); p.armB = A(0.6, 0.3, -0.2); put(rig, 'pool', p, { y: -0.795, floor: -0.42 }); });
      splashAt('pool', SW_POS[1][0] - 0.3, PD.water, SW_POS[1][1] + 0.3, t, 6.9, 22, 1.8, 3); splashAt('pool', SW_POS[1][0] - 0.3, PD.water, SW_POS[1][1] + 0.3, t, 8.4, 22, 1.8, 4);
    } else {
      // the dive: sprint down the board (−z), jump at 23.45, it goes dark at 23.8 in mid-air, splash at 24.29
      const J = 23.45, bx = -12.0, p = basePose(); p.eyes = blink(t, 3);
      if (t < J) { const u = clamp((t - 21.9) / (J - 21.9)), z = lerp(7.1, 4.15, u); Object.assign(p, { x: bx, z, rotY: PI, dist: (7.1 - z) / 0.62, speed: t > 21.9 ? 3 : 0, lean: 0.2, mouth: 'smile' }); p.armA = REST; p.armB = REST; put(diver, 'pool', p, { y: 0.6, floor: 0.6, s: 0.62 }); }
      else { const a = t - J, y = 0.6 + 3.2 * a - 4.9 * a * a; Object.assign(p, { x: bx, z: 4.15 - 1.5 * a, rotY: PI, crouch: 0.32, lean: 0.35, mouth: 'o', headPitch: -0.2 }); p.armA = HUG_A; p.armB = HUG_B; if (y > PD.water - 0.1) put(diver, 'pool', p, { y, floor: y + 0.15, s: 0.62 }); }
      splashAt('pool', bx, PD.water, 4.15 - 1.5 * 0.84, t, J + 0.84, 60, 3.0, 9);
      if (t > J + 0.84) for (let k = 0; k < 6; k++) puff(W('pool', bx + 0.2 * Math.sin(k), 0.1 + (t - J - 0.84) * 0.6, 2.9 + 0.2 * Math.cos(k)), 0.4 + (t - J - 0.84), 0.45 * clamp(1 - (t - J - 0.84) * 2), white);
    }
  }
  function frostScene(t) {
    towels.flat().forEach((m) => (m.visible = true));
    drum.position.copy(W('pool', DRUM[0], 0, DRUM[1])); drum.visible = true;
    fireAt('pool', DRUM[0], 0.82, DRUM[1], t, 1.0, 0.3);
    // five swimmers in towels round the drum, shuffling, hands out to the fire, breath clouds
    const RING = [[0.85, 0.35], [0.4, 0.82], [-0.38, 0.8], [-0.88, 0.25], [0.95, -0.4]];
    huddle.forEach((rig, k) => {
      const [dx, dz] = RING[k], p = basePose(); idle(p, t, k, 0.7);
      Object.assign(p, { x: DRUM[0] + dx, z: DRUM[1] + dz, rotY: Math.atan2(-dx, -dz) + 0.1 * Math.sin(t * 0.6 + k), lean: 0.12, headPitch: 0.15, mouth: 'flat' });
      p.armA = k % 2 ? WARM : HUGSELF_A; p.armB = k % 2 ? WARM_B : HUGSELF_B; p.crouch = 0.03 + 0.03 * Math.sin(t * 3.1 + k);   // shivering
      p.headRoll += 0.03 * Math.sin(t * 23 + k);
      put(rig, 'pool', p); breath(rig, t, k * 0.23);
    });
    // a phone flashlight sweeping the frozen pool
    const f = poolFlash[0]; f.g.visible = true; const hp = W('pool', -0.6, 1.25, 7.9); f.aim(hp, W('pool', -2.5 + 2 * Math.sin(t * 0.5), -0.15, 3.0)); f.setOn(1, 0.06);
  }

  // ================================================================ STADIUM (London, 3 PM; the home end behind the +x goal)
  const east = stad.stands.east;
  const seats = east.fans.filter((f) => f.row <= 1 && Math.abs(f.z) < 6.5).sort((a, b) => a.row - b.row || Math.abs(a.z) - Math.abs(b.z)).slice(0, 30);
  const seatSet = new Set(seats.map((f) => f.i)); east.hide((f) => seatSet.has(f.i));
  const fanRigs = seats.map((f, k) => { const p = person({ skin: pick(SKINS), top: k % 3 ? 0xc8302c : 0xf2f2f2, collar: k % 3 ? 0xf2f2f2 : 0xc8302c, pants: 0x2f3a4a, hair: pick(HAIRS), hairStyle: pick(STYLES), glasses: R() < 0.15 }); p.seat = f; return p; });
  const striker = person({ skin: 0xc98e6a, top: 0xc8302c, collar: 0xf2f2f2, pants: 0xf2f2f2, shoes: 0x1a1a1a, hair: 0x1a1a1a, hairStyle: 'short' });
  const keeper = person({ skin: 0xf1c3a1, top: 0x58b368, collar: 0x1a1a1a, pants: 0x1a1a1a, shoes: 0x1a1a1a, hair: 0x9a6a3a, hairStyle: 'messy' });
  const fball = mk(new THREE.SphereGeometry(0.11, 20, 14), new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((i % 5) * 32 + (i > 4 ? 16 : 0), i > 4 ? 46 : 18, 8, 0, 7); g.fill(); } }), roughness: 0.5 }), scene);
  let lastScore = '';
  function stadScene(t) {
    stad.aimSun(54, 0, 18);
    const sc = t > GOAL + 0.3 ? '2 – 1' : '1 – 1'; if (sc !== lastScore) { stad.setScore(sc, "CUP FINAL · 88'"); lastScore = sc; }
    const g = t - GOAL;
    for (let k = 0; k < east.fans.length; k++) { if (east.hidden.has(k)) continue; const ph = (k * 0.618) % 1 * 6; const y = g > 0 ? 0.28 * Math.abs(Math.sin(g * 5.5 + ph)) * Math.min(1, g * 3) : 0.03 * Math.abs(Math.sin(t * 2 + ph)); east.setFan(k, y, 0); }
    east.commit();
    fanRigs.forEach((rig, k) => {
      const f = rig.seat, p = basePose(); p.eyes = blink(t, k); const ph = k * 1.37;
      Object.assign(p, { x: f.x, z: f.z, rotY: -PI / 2 + ((k * 0.37) % 0.5 - 0.25) });
      let y = 0;
      if (g < 0) { p.armA = k % 4 ? A(-0.5, 0.2, -1.6, 0.6) : REST; p.armB = k % 3 ? A(-0.5, 0.2, -1.6, -0.6) : REST; p.mouth = 'flat'; p.headYaw = 0.25 * Math.sin(t * 1.3 + k); p.lean = 0.15; }
      else { y = 0.32 * Math.abs(Math.sin(g * 5.2 + ph)) * Math.min(1, g * 3); p.armA = k % 3 ? CHEER : OUTSTR; p.armB = k % 2 ? CHEER : A(-1.6, 0.4, -1.6, -0.6); p.mouth = 'o'; p.headPitch = -0.15; p.headYaw = 0.3 * Math.sin(g * 1.4 + k); }
      put(rig, 'stad', p, { y: f.y + y, floor: f.y + Math.max(0, y - 0.1) });
    });
    // the ball: struck from outside the frame (left), into the top corner; it drops into the net
    { let x, y, z; if (t < GOAL) { const u = clamp((t - 11.45) / (GOAL - 11.45)); x = lerp(43.5, 54.2, u); y = lerp(0.35, 1.45, u) + 0.6 * Math.sin(PI * u); z = lerp(-4.5, 0.6, u); } else { const a = t - GOAL; x = 54.2 - 0.25 * Math.min(1, a * 3); y = Math.max(0.11, 1.45 - 4.9 * a * a); z = 0.6; } fball.position.copy(W('stad', x, y, z)); fball.visible = true; }
    stad.setBulge(g > 0 ? 0.55 * Math.exp(-g * 3.5) * Math.min(1, g * 12) : 0, 1.45, 0.6);
    // keeper: dives the wrong way, lies there; the striker runs past the lens to the fans, arms out, then knee-slides
    { const p = basePose(); p.eyes = blink(t, 2); const d = smooth(clamp((t - 11.7) / 0.45)); Object.assign(p, { x: 52.0, z: lerp(0.2, -2.0, d), rotY: -PI / 2, headPitch: 0.2, mouth: 'o' }); p.armA = OUTSTR; p.armB = OUTSTR; put(keeper, 'stad', p, { y: 0.9 * Math.sin(PI * d) * (t < 12.5 ? 1 : 0) * 0 + (d > 0.5 ? 0.18 : 0), floor: d > 0.5 ? 0.1 : 0, rz: -1.35 * d }); }
    { const p = basePose(); p.eyes = blink(t, 5); const u = clamp((t - 13.0) / 1.9), x = lerp(48.6, 55.6, u), z = lerp(-1.9, 0.8, u); Object.assign(p, { x, z, rotY: Math.atan2(7.0, 2.7), dist: u * 8.3, speed: t > 13 && u < 1 ? 6 : 0, mouth: 'o', headPitch: -0.2 }); p.armA = OUTSTR; p.armB = OUTSTR; const slide = clamp((t - 14.8) / 0.4); p.crouch = 0.5 * slide; p.lean = -0.35 * slide; p.footFwd = 0.3 * slide; if (slide > 0) { p.armA = CHEER; p.armB = CHEER; p.headPitch = -0.5; } if (t > 12.8) put(striker, 'stad', p, { y: -0.45 * slide, floor: -0.45 * slide }); }
    jolt(t, GOAL, 0.025);
  }

  // ================================================================ WEDDING (Tuscany, 4 PM golden hour → black sky at 4:08 PM)
  const GROUP = [ // x, z, outfit
    [-1.35, -3.05, { top: 0x8fb3d9, pants: 0x34405c, hairStyle: 'short', hair: 0x5a3a24 }], [-0.8, -3.1, { top: 0xe58fa6, pants: 0xe58fa6, dress: 0xe58fa6, hairStyle: 'bob', hair: 0x9a6a3a }],
    [-0.26, -3.0, { top: 0x2a2f3a, collar: 0xf7f4ee, pants: 0x2a2f3a, hairStyle: 'short', hair: 0x2a1d16 }], [0.26, -3.0, { top: 0xf7f4ee, pants: 0xf7f4ee, dress: 0xf7f4ee, hairStyle: 'bob', hair: 0xd9b46a }],
    [0.82, -3.1, { top: 0x6fa84f, pants: 0x3a3d42, hairStyle: 'messy', hair: 0x1a1a1a, glasses: true }], [1.38, -3.05, { top: 0xf2c14e, pants: 0xf2c14e, dress: 0xf2c14e, hairStyle: 'bob', hair: 0xc9c4be, glasses: true }],
  ];
  const party = GROUP.map(([, , o], i) => person({ skin: SKINS[[1, 5, 2, 0, 3, 6][i]], ...o }));
  const flowerGirl = person(kidO({ skin: 0xd9a37f, top: 0xf4c6d6, pants: 0xf4c6d6, dress: 0xf4c6d6, hair: 0x3a2a1c, hairStyle: 'bob' }));
  const photog = person({ skin: 0xe2ad8c, top: 0x3a3d42, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short' });
  const pcam = new THREE.Group(); mk(new THREE.BoxGeometry(0.15, 0.1, 0.09), mat(0x1a1a1a, 0.4), pcam); const lensM = mk(new THREE.CylinderGeometry(0.04, 0.045, 0.12, 14), mat(0x2a2a2a, 0.4), pcam, 0, 0, 0.1); lensM.rotation.x = PI / 2;
  const flashHead = mk(new THREE.BoxGeometry(0.07, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }), pcam, 0, 0.09, 0.02);
  photog.arms.find((a) => a.s === 1).hand.add(pcam); pcam.position.set(-0.08, -0.06, 0.06);
  const PETAL_N = 160, petals = new THREE.InstancedMesh(new THREE.CircleGeometry(0.025, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.8 }), PETAL_N);
  petals.frustumCulled = false; scene.add(petals); { const c = new THREE.Color(), pc = [0xe58fa6, 0xffffff, 0xf2b632, 0xf4c6d6]; for (let i = 0; i < PETAL_N; i++) petals.setColorAt(i, c.setHex(pc[i % 4])); }
  const stringL = [-1, 1].map((s) => { const L = new THREE.PointLight(0xffd59a, 0, 11, 1.5); L.position.copy(W('wed', s * 4.0, 2.7, -1.0)); scene.add(L); return L; });
  function wedScene(t, cam) {
    const dark = t >= OUT; dayNight('wed', dark);
    stringL.forEach((L) => (L.intensity = dark ? 5.5 : 0));
    const KISS = [18.9, 20.0], FLASH = dark ? [25.0, 26.9, 28.3] : [20.45];
    GROUP.forEach(([x, z], i) => {
      const rig = party[i], p = basePose(); idle(p, t, i, 0.6);
      Object.assign(p, { x, z, rotY: (i < 3 ? 0.12 : -0.12) * (i === 2 || i === 3 ? 0.5 : 1), mouth: 'smile' });
      if (!dark) {
        p.armA = i === 0 || i === 4 ? HUG_A : REST; p.armB = i === 1 || i === 5 ? HUG_B : REST;
        if (i === 2 || i === 3) { const k = K(t, [[KISS[0] - 0.4, 0], [KISS[0], 1], [KISS[1], 1], [KISS[1] + 0.4, 0]]); p.rotY = (i === 2 ? 1 : -1) * 1.25 * k; p.headPitch = 0.1 * k; p.lean = 0.12 * k; p.armA = i === 2 ? mixArm(REST, HUG_A, k) : REST; p.armB = i === 3 ? mixArm(REST, HUG_B, k) : REST; p.eyes = k > 0.6 ? 'closed' : p.eyes; }
        if (t > 18.0 && t < 18.7 && (i === 0 || i === 5)) { p.armA = CHEER; p.armB = CHEER; }   // throw the petals
      } else {
        const look = smooth(clamp((t - 24.5) / 0.7));
        p.headPitch = -0.55 * look + 0.05 * Math.sin(t * 0.8 + i); p.headYaw += 0.4 * Math.sin(t * 0.5 + i * 2) * look; p.mouth = 'o';
        if (i === 4) { p.armB = mixArm(REST, POINT_UP, look); p.armA = REST; }
        if (i === 3) { p.armA = mixArm(REST, A(-0.6, 0.55, -1.2, 0.5), look); }   // the bride grabs the groom's arm
        if (i === 2) { p.armB = mixArm(REST, A(-0.3, 0.6, -0.9, -0.4), look); p.headYaw = -0.25 * look; }
        if (i === 1) { p.armA = mixArm(REST, A(-1.6, 0.2, -2.1, 0.7), look); p.armB = mixArm(REST, A(-1.6, 0.2, -2.1, -0.7), look); }   // hands to mouth
      }
      put(rig, 'wed', p);
    });
    { const p = basePose(); idle(p, t, 9, 0.6); Object.assign(p, { x: 0.02, z: -2.5, rotY: 0, mouth: dark ? 'o' : 'smile' }); if (dark) { p.headPitch = -0.6; p.armB = A(-0.7, 0.3, -1.4, -0.3); } else { p.armA = A(-0.6, 0.3, -1.6, 0.6); p.armB = A(-0.6, 0.3, -1.6, -0.6); } if (!dark) put(flowerGirl, 'wed', p, { s: 0.62 }); }
    // the photographer: crouched in the aisle, camera to the eye
    { const p = basePose(); p.eyes = 'closed'; Object.assign(p, { x: cam === 'wedDark' ? 0.55 : 2.0, z: cam === 'wedDark' ? 0.55 : 0.2, rotY: PI + (cam === 'wedDark' ? -0.1 : 0.4), crouch: 0.22, lean: 0.25, headPitch: 0.05 }); p.armA = CAM_A; p.armB = CAM_B; put(photog, 'wed', p); }
    // flash: a white point light at the camera's flash head
    const fk = flashK(t, FLASH); photog.root.updateMatrixWorld(true); flashHead.getWorldPosition(flashL.position); flashL.intensity = (dark ? 16 : 8) * fk; flashHead.material.color.setScalar(1 + 8 * fk);
    // petals: thrown at 18.1 from both ends of the row, they arc over the couple and flutter down
    const age = t - 18.1;
    if (!dark && age > 0 && age < 3.3) {
      const r = rng(5);
      for (let i = 0; i < PETAL_N; i++) { const side = i % 2 ? 1 : -1, vx = -side * (0.55 + r() * 0.5), vy = 1.6 + r() * 1.0, vz = (r() - 0.5) * 0.6, ph = r() * 6; const fall = Math.max(0, vy * age - 4.9 * age * age * 0.28); M4.compose(W('wed', side * 1.35 + vx * age + 0.08 * Math.sin(age * 4 + ph), Math.max(0.02, 1.9 + fall - 0.35 * age), -3.0 + vz * age), Q4.setFromEuler(E3.set(age * 3 + ph, age * 2 + ph, 0)), S3.setScalar(1)); petals.setMatrixAt(i, M4); }
      petals.instanceMatrix.needsUpdate = true; petals.visible = true;
    }
  }

  // ================================================================ CITY: Bangkok rooftop (night side, 10:08 PM) + Chicago corner (+1 WEEK)
  const moonDir = new THREE.Vector3(0.829, 0.375, -0.414).normalize();
  const jupDir = moonDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.085).add(new THREE.Vector3(0, 0.05, 0)).normalize();
  const skyMoon = makeSkyMoon({}); scene.add(skyMoon.g); skyMoon.g.visible = false;
  { const up = new THREE.Vector3(0, 1, 0), s = up.clone().addScaledVector(moonDir, -moonDir.dot(up)).normalize(); const sunDir = s.clone().multiplyScalar(-0.35).add(new THREE.Vector3().crossVectors(moonDir, up).normalize().multiplyScalar(-0.94)).normalize(); skyMoon.setPhase(sunDir); }
  const jup = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(0.18, 'rgba(255,246,225,.9)'); r.addColorStop(0.45, 'rgba(255,240,210,.18)'); r.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), color: new THREE.Color(1.6, 1.5, 1.3), toneMapped: false, depthWrite: false, fog: false, transparent: true }));
  scene.add(jup); jup.visible = false;
  // phone photo of the Moon (screen texture) → black after the Moon goes dark
  const moonShot = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#05060a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e9e4d8'; g.beginPath(); g.arc(w / 2, h * 0.42, 34, -PI / 2, PI / 2); g.fill(); g.fillStyle = 'rgba(80,80,90,.35)'; for (const [x, y, r] of [[8, -10, 6], [14, 8, 8], [6, 18, 4], [20, -4, 4]]) { g.beginPath(); g.arc(w / 2 + x, h * 0.42 + y, r, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.75)'; g.font = 'bold 13px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('●  PHOTO', w / 2, h - 18); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h - 46, 13, 0, 7); g.stroke(); });
  const blackShot = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#05060a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.75)'; g.font = 'bold 13px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('●  PHOTO', w / 2, h - 18); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h - 46, 13, 0, 7); g.stroke(); });
  const roofers = [
    person({ skin: 0xd9a37f, top: 0xf2f2f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short' }),
    person({ skin: 0xc98e6a, top: 0xe58fa6, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'bob' }),
    person({ skin: 0xe2ad8c, top: 0x4fb3a8, pants: 0x45607a, hair: 0x2a1d16, hairStyle: 'messy', glasses: true }),
  ];
  const phones = roofers.map((r) => { const ph = makePhone(); r.arms.find((a) => a.s === 1).hand.add(ph.g); ph.g.position.set(0, -0.07, 0.05); ph.g.rotation.set(PI / 2, 0, 0); return ph; });
  const phoneShot = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), new THREE.MeshBasicMaterial({ map: moonShot, toneMapped: false })); phones[0].g.add(phoneShot); phoneShot.rotation.x = -PI / 2; phoneShot.position.y = 0.0105;
  const ROOF = [[-10.25, 12.2], [-10.85, 12.75], [-10.7, 13.3]];
  const roofYaw = Math.atan2(moonDir.x, moonDir.z);
  // Chicago corner, +1 WEEK: fire barrels, a patio heater, coats + beanies
  const corner = Array.from({ length: 8 }, (_, i) => { const r = person({ skin: SKINS[(i * 3) % 7], top: COATS[i % 7], pants: 0x2f3438, hair: pick(HAIRS), hairStyle: 'none', shoes: 0x2a2420 }); beanie(r, [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xf2f2f2, 0xe08a3a, 0x8f6fb8, 0x4fb3a8][i]); const sc = mk(new THREE.TorusGeometry(0.085, 0.035, 8, 16), mat([0xf1c24a, 0xd2483f, 0xf2f2f2, 0x3d7bd9][i % 4], 0.95), r.spine, 0, 0.54, 0.01); sc.rotation.x = PI / 2; return r; });
  const barrels = [0, 1].map(() => { const g = drum.clone(); scene.add(g); g.visible = false; return g; });
  const BARREL = [[5.75, 3.55], [5.35, 8.6]];
  const heater = new THREE.Group(); mk(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 8), mat(0x9aa0a6, 0.3, { metalness: 0.7 }), heater, 0, 1.05, 0); mk(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 16), mat(0x5a6066, 0.4, { metalness: 0.6 }), heater, 0, 0.06, 0);
  const hood = mk(new THREE.ConeGeometry(0.42, 0.22, 18, 1, true), mat(0x9aa0a6, 0.3, { metalness: 0.7, side: THREE.DoubleSide }), heater, 0, 2.2, 0); void hood;
  const heatGlow = mk(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 0.6, 0.2), toneMapped: false }), heater, 0, 1.85, 0); void heatGlow;
  const heatL = new THREE.PointLight(0xff7a30, 0, 6, 1.6); heater.add(heatL); heatL.position.set(0, 1.7, 0); scene.add(heater); heater.visible = false;
  const frostCar = makeCar(0x3a5a8a, 4); scene.add(frostCar.g); frostCar.g.visible = false; frostCar.g.position.set(2.6, 0, 9.5); frostCar.g.rotation.y = PI;
  const carFrost = mk(new THREE.BoxGeometry(1.75, 0.04, 2.0), mat(0xe8eff8, 0.6), frostCar.g, 0, 1.47, 0.1); void carFrost;

  function cityScene(t, cam) {
    city.setSnow(cam === 'fires' ? 0.75 : 0);
    city.setTime({ day: 0, golden: 0, power: 1, milky: cam === 'fires' ? 0.2 : 0.55, moon: cam === 'fires' ? 0 : t < MOON_OUT ? 1 : 0.15 });
    city.sky.moonDisc.visible = false;
    if (cam === 'fires') return firesScene(t);
    city.setShadowFocus(-10.5, 12.5, 12);
    const lit = t < MOON_OUT ? 1 : 0, react = smooth(clamp((t - MOON_OUT - 0.25) / 0.5));
    roofers.forEach((rig, i) => {
      const [x, z] = ROOF[i], p = basePose(); idle(p, t, i, i === 0 && cam === 'moonA' ? 0 : 0.5);
      Object.assign(p, { x, z, rotY: roofYaw + [0, 0.25, -0.3][i] + 0.6 * react * (i === 1 ? -1 : i === 2 ? 1 : 0), headPitch: -0.42 + 0.25 * react, mouth: react > 0.3 ? 'o' : 'smile' });
      if (i === 0) { const r0 = cam === 'moonA' ? 0 : react; p.armB = mixArm(PHONE_UP, A(-1.5, 0.15, -1.1, -0.3), r0); p.headPitch = -0.35 + 0.15 * r0; if (cam === 'moonA') p.rotY = roofYaw; }
      if (i === 1) { p.armA = mixArm(POINT_UP, REST, react); p.armB = mixArm(A(-1.3, 0.1, -1.6, -0.4), A(-1.6, 0.2, -2.1, -0.7), react); }
      if (i === 2) { p.armB = mixArm(PHONE_UP, A(-1.4, 0.15, -1.3, -0.4), react); }
      put(rig, 'city', p, { y: ROOF_Y, floor: ROOF_Y });
    });
    phoneShot.material.map = lit ? moonShot : blackShot;
    phones.forEach((ph) => (ph.screenMat.emissiveIntensity = 1.6));
  }
  function firesScene(t) {
    city.setShadowFocus(5.5, 5, 12);
    BARREL.forEach(([x, z], k) => { barrels[k].position.set(x, 0.14, z); barrels[k].visible = true; fireAt('city', x, 0.14 + 0.82, z, t, k ? 0.8 : 1.0, k * 0.4); });
    heater.position.set(6.35, 0.14, 5.9); heater.visible = true; heatL.intensity = 3 + 0.3 * Math.sin(t * 9);
    frostCar.g.visible = true;
    const RING = [[0.9, 0.05], [0.5, 0.75], [0.45, -0.75], [-0.1, 0.9]];
    corner.forEach((rig, k) => {
      const [bx, bz] = BARREL[k < 4 ? 0 : 1], [dx, dz] = k < 4 ? RING[k] : [[0.8, 0.2], [0.1, 0.85], [0.55, -0.7], [-0.2, -0.85]][k - 4], p = basePose(); idle(p, t, k, 0.7);
      Object.assign(p, { x: bx + dx, z: bz + dz, rotY: Math.atan2(-dx, -dz) + 0.08 * Math.sin(t * 0.7 + k), lean: 0.1, headPitch: 0.12, mouth: k === 2 ? 'smile' : 'flat' });
      p.armA = (k + Math.floor(t / 1.7)) % 3 ? WARM : HUGSELF_A; p.armB = (k + Math.floor(t / 2.1)) % 3 ? WARM_B : HUGSELF_B;
      p.armA = mixArm(p.armA, A(p.armA.sx, p.armA.sz, p.armA.el - 0.25 * Math.sin(t * 4 + k)), 0.5);   // rubbing hands
      p.crouch = 0.02 * Math.sin(t * 3.3 + k); p.headRoll += 0.025 * Math.sin(t * 21 + k);
      put(rig, 'city', p, { y: 0.14, floor: 0.14 }); breath(rig, t, k * 0.31);
    });
  }

  // ================================================================ HARBOR (Maine, +1 MONTH): the sea is ice; liquid water through a hole
  const iceTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#c9dbe8'; g.fillRect(0, 0, w, h); const r = rng(12); for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(120,150,180,.14)'; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 2); } g.strokeStyle = 'rgba(90,120,150,.45)'; g.lineWidth = 1.5; for (let i = 0; i < 26; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); } }, [1, 1]);
  const iceM = new THREE.MeshStandardMaterial({ map: iceTex, color: 0xdfeaf4, roughness: 0.32, metalness: 0.05 });
  const seaDayM = tide.sea.material;
  { const p = tide.sea.geometry.parameters || {}; iceTex.repeat.set((p.width || 4000) / 6, (p.height || 4000) / 6); }
  const holeG = new THREE.Group(); scene.add(holeG); holeG.visible = false;
  { const d = mk(new THREE.CircleGeometry(0.34, 28), new THREE.MeshStandardMaterial({ color: 0x0c2a36, roughness: 0.05, metalness: 0.3, emissive: 0x06202a, emissiveIntensity: 0.6 }), holeG, 0, 0.004, 0); d.rotation.x = -PI / 2; d.receiveShadow = false; const rim = mk(new THREE.TorusGeometry(0.36, 0.045, 8, 28), mat(0xeef4fa, 0.5), holeG, 0, 0.01, 0); rim.rotation.x = PI / 2; rim.scale.z = 0.4; }
  const fisher = person({ skin: 0xe2ad8c, top: 0xd2483f, pants: 0x2f3a4a, hair: 0x6a6a6a, hairStyle: 'none', beard: 0xb9b2aa, shoes: 0x2a2420 }); beanie(fisher, 0x2f4f6e);
  const iceKid = person(kidO({ skin: 0xf1c3a1, top: 0xf1c24a, pants: 0x3d7bd9, hair: 0x9a6a3a, hairStyle: 'none' })); beanie(iceKid, 0xd2483f);
  const skater = person({ skin: 0x9a6447, top: 0x4fb3a8, pants: 0x2f3438, hair: 0x1a1a1a, hairStyle: 'none' }); beanie(skater, 0xf2f2f2);
  const bucket = mk(new THREE.CylinderGeometry(0.17, 0.15, 0.4, 16), mat(0xf2f2f2, 0.6), scene); bucket.visible = false;
  const rod = new THREE.Group(); mk(new THREE.CylinderGeometry(0.006, 0.012, 0.85, 6), mat(0x2a2a2a, 0.4), rod, 0, 0.42, 0); scene.add(rod); rod.visible = false;
  const lineM = new THREE.LineBasicMaterial({ color: 0xeeeeee }), lineG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), fline = new THREE.Line(lineG, lineM); fline.frustumCulled = false; scene.add(fline); fline.visible = false;
  const fish = new THREE.Group(); { const b = mk(new THREE.SphereGeometry(0.1, 14, 10), mat(0xc9d2da, 0.3, { metalness: 0.4 }), fish); b.scale.set(0.45, 0.7, 1.7); const tl = mk(new THREE.ConeGeometry(0.07, 0.1, 4), mat(0xa9b4c0, 0.4), fish, 0, 0, -0.2); tl.rotation.x = -PI / 2; tl.scale.x = 0.3; mk(new THREE.SphereGeometry(0.012, 6, 6), mat(0x111111, 0.3), fish, 0.04, 0.02, 0.1); } fish.rotation.order = 'YXZ'; scene.add(fish); fish.visible = false;
  const lantern = new THREE.Group(); mk(new THREE.CylinderGeometry(0.08, 0.09, 0.22, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.4, 0.8), toneMapped: false }), lantern, 0, 0.13, 0); mk(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), mat(0x2a2a2a, 0.5), lantern, 0, 0.26, 0); const lanternL = new THREE.PointLight(0xffb870, 6, 7, 1.6); lanternL.position.y = 0.3; lantern.add(lanternL); scene.add(lantern); lantern.visible = false;
  const kidLight = makeFlashlight({ length: 3, radius: 0.5 }); scene.add(kidLight.g); kidLight.g.visible = false;
  const HOLE = [-3.35, -7.15], CATCH = 48.7;
  function iceScene(t) {
    tide.setMode('night'); tide.setMoon(new THREE.Vector3(0, 1, 0), 0); tide.lights.hemi.intensity = 0.42;
    tide.setTide(0, 0); tide.rideBoats(0, 0); tide.update(t); tide.gulls.forEach((g) => (g.g.visible = false));
    tide.sea.material = iceM; tide.aimAt(-3, -6, 20);
    holeG.position.copy(W('tide', HOLE[0], 0, HOLE[1])); holeG.visible = true;
    bucket.position.copy(W('tide', HOLE[0] + 0.05, 0.2, HOLE[1] + 0.72)); bucket.visible = true;
    lantern.position.copy(W('tide', HOLE[0] - 0.75, 0, HOLE[1] + 0.25)); lantern.visible = true;
    const pull = smooth(clamp((t - CATCH) / 0.5)), jig = t < CATCH ? 0.06 * Math.sin(t * 5.5) : 0;
    { const p = basePose(); p.eyes = blink(t, 1); Object.assign(p, { x: HOLE[0] + 0.05, z: HOLE[1] + 0.72, rotY: PI, footFwd: 0.42, headPitch: 0.35 - 0.6 * pull, mouth: pull > 0.2 ? 'o' : 'flat', lean: 0.15 - 0.2 * pull }); p.armB = mixArm(A(-0.75 + jig, 0.15, -0.8, -0.2), A(-2.3, 0.2, -0.5, -0.1), pull); p.armA = mixArm(A(-0.7, 0.2, -1.2, 0.4), CHEER, pull * (t > CATCH + 0.9 ? 1 : 0)); put(fisher, 'tide', p, { y: -0.375 + 0.4 - 0.42 + 0.02, floor: 0 }); breath(fisher, t, 0.1);
      fisher.root.updateMatrixWorld(true); const hw = fisher.arms.find((a) => a.s === 1).hand.getWorldPosition(new THREE.Vector3()); rod.position.copy(hw); rod.rotation.set(-0.9 - 0.9 * pull + jig * 2, PI, 0); rod.visible = true;
      rod.updateMatrixWorld(true); const tip = rod.localToWorld(new THREE.Vector3(0, 0.85, 0));
      const fy = t < CATCH ? -0.3 : lerp(-0.3, 0.75, pull), fp = W('tide', HOLE[0] + 0.05 * Math.sin(t * 6) * pull, fy, HOLE[1] + 0.05 * pull);
      fish.position.copy(fp); fish.rotation.set(PI / 2 * pull, 0, 0.5 * Math.sin(t * 17) * pull); fish.visible = t >= CATCH;
      lineG.setFromPoints([tip, t >= CATCH ? fp.clone().add(new THREE.Vector3(0, 0.14, 0)) : W('tide', HOLE[0], -0.2, HOLE[1])]); fline.visible = true; }
    splashAt('tide', HOLE[0], 0, HOLE[1], t, CATCH + 0.05, 26, 1.8, 7);
    { const p = basePose(); p.eyes = blink(t, 4); const yay = smooth(clamp((t - CATCH - 0.3) / 0.4)); Object.assign(p, { x: HOLE[0] + 0.55, z: HOLE[1] + 0.4, rotY: -PI / 2 - 0.5 + 0.4 * yay, crouch: 0.3 * (1 - yay), lean: 0.45 * (1 - yay), headPitch: 0.5 - 0.7 * yay, mouth: yay > 0.2 ? 'o' : 'smile' }); p.armB = mixArm(A(-1.2, 0.15, -0.6, -0.2), CHEER, yay); p.armA = mixArm(A(-0.5, 0.3, -1.0), CHEER, yay); put(iceKid, 'tide', p, { s: 0.62 }); breath(iceKid, t, 0.55);
      iceKid.root.updateMatrixWorld(true); const kh = iceKid.arms.find((a) => a.s === 1).hand.getWorldPosition(new THREE.Vector3()); kidLight.aim(kh, yay > 0.5 ? kh.clone().add(new THREE.Vector3(0, 1, 0)) : W('tide', HOLE[0], 0, HOLE[1])); kidLight.setOn(1, 0.06); kidLight.g.visible = true; }
    { const p = basePose(); p.eyes = blink(t, 6); const x = lerp(-9, 3.5, (t - 46.2) / 4.6); Object.assign(p, { x, z: -3.2, rotY: PI / 2, dist: x * 0.6, speed: 1.2, lean: 0.25, mouth: 'smile' }); p.armA = A(0.4, 0.3, -0.3); p.armB = A(-0.6, 0.4, -0.3); put(skater, 'tide', p); }
  }

  // ================================================================ LAGOON (Iceland, +1 YEAR): faces in the steaming water, then the stars
  const SOAK = [[-0.35, 1.3, 0.6], [0.2, 1.45, -0.4], [1.35, 1.05, -0.5], [-1.3, 0.5, 0.5], [2.1, 0.3, -0.3], [0.75, 0.35, 0.1]];
  const soakers = SOAK.map((_, i) => person({ skin: SKINS[(i * 2 + 1) % 7], top: SWIM[i], pants: SWIM[i], hair: [0x2a1d16, 0xd9b46a, 0x5a3a24, 0x9a6a3a, 0x1a1a1a, 0x5a3a24][i], hairStyle: ['short', 'bob', 'short', 'messy', 'bob', 'short'][i], beard: i === 2 ? 0x8a7a6a : undefined, glasses: i === 4 }));
  const frostHair = new THREE.Color(0xe4ebf4);
  soakers.forEach((r) => r.mats.hair.color.lerp(frostHair, 0.3));
  const lagDad = person({ skin: 0xe2ad8c, top: 0x3d7bd9, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'short', beard: 0x5a3a24 }); lagDad.mats.hair.color.lerp(frostHair, 0.5);
  const lagKid = person(kidO({ skin: 0xf1c3a1, top: 0xf1c24a, pants: 0xf1c24a, hair: 0x9a6a3a, hairStyle: 'none' })); beanie(lagKid, 0xd2483f);
  if (lagDad.head.beard) lagDad.head.beard.material && lagDad.head.beard.material.color && lagDad.head.beard.material.color.lerp(frostHair, 0.5);
  function lagScene(t, cam) {
    lag.update(t, studio.camera.position.clone().sub(new THREE.Vector3(...OFF.lag)));
    const sy = -1.22;
    if (cam === 'soak') SOAK.forEach(([x, z, ry], i) => {
      const p = basePose(); idle(p, t, i, 1);
      Object.assign(p, { x: x + 0.05 * Math.sin(t * 0.5 + i), z, rotY: ry + 0.15 * Math.sin(t * 0.4 + i), headPitch: 0.05 - 0.2 * (i % 2), mouth: i % 3 ? 'smile' : 'flat' });
      p.armA = A(-0.25 + 0.15 * Math.sin(t * 1.2 + i), 0.5, -0.3); p.armB = A(-0.25 + 0.15 * Math.sin(t * 1.1 + i + 2), 0.5, -0.3);
      if (i === 0) { p.rotY = 0.9; p.headYaw = -0.5; p.armB = HUG_B; }   // a couple: her arm round him
      if (i === 1) { p.rotY = -0.5; p.headYaw = 0.4; p.headRoll = 0.15; }
      if (i === 2) { p.armA = A(-1.5, 0.2, -2.0, 0.5); p.headPitch = -0.15; }   // the old man wipes frost off his beard
      put(soakers[i], 'lag', p, { y: sy + 0.03 * Math.sin(t * 1.3 + i), floor: sy });
    });
    else {
      const look = smooth(clamp((t - 56.2) / 0.8));
      { const p = basePose(); idle(p, t, 11, 0.5); Object.assign(p, { x: 0.0, z: 1.6, rotY: 0.2, headPitch: -0.2 - 0.55 * look, mouth: 'smile' }); p.armA = A(-1.1, 0.35, -1.3, 0.5); p.armB = A(-0.5, 0.4, -0.6); put(lagDad, 'lag', p, { y: sy, floor: sy }); }
      { const p = basePose(); p.eyes = blink(t, 13); Object.assign(p, { x: 0.25, z: 2.15, rotY: 0.25 - 0.2 * look, headPitch: -0.15 - 0.75 * look, headYaw: 0.1 * Math.sin(t * 0.7), mouth: look > 0.4 ? 'o' : 'smile' }); p.armB = mixArm(A(-0.6, 0.4, -0.6), POINT_UP, look); p.armA = A(-0.5, 0.45, -0.5); const ky = -0.62 * 1.315 + 0.12; put(lagKid, 'lag', p, { y: ky + 0.02 * Math.sin(t * 1.4), floor: ky, s: 0.62 }); }
      SOAK.slice(3).forEach(([x, z, ry], i) => { const p = basePose(); idle(p, t, i + 3, 0.6); Object.assign(p, { x, z, rotY: ry, headPitch: -0.6 * look, mouth: 'o' }); p.armA = A(-0.6, 0.5, -0.6); p.armB = i === 0 ? mixArm(A(-0.6, 0.5, -0.6), POINT_UP, look) : A(-0.6, 0.5, -0.6); put(soakers[i + 3], 'lag', p, { y: sy, floor: sy }); });
    }
  }

  // ================================================================ SPACE: the Sun vanishes (SECOND 0); later dark Earth on a straight line
  const sunSlot = new THREE.Vector3(0, 1300, -1200), sunDirS = sunSlot.clone().normalize();
  const sunDisc = space.root.children.find((o) => o.isSprite);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunDisc.material.map, color: new THREE.Color(2.2, 2.0, 1.7), toneMapped: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, fog: false })); space.root.add(flare);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunDisc.material.map, color: new THREE.Color(1.4, 1.0, 0.55), toneMapped: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, fog: false, opacity: 0.6 })); space.root.add(corona);
  const earthM = space.earth.material, earthDark = new THREE.MeshStandardMaterial({ map: earthM.map, color: 0x0b0d14, roughness: 0.9 });
  const cityLightsM = new THREE.ShaderMaterial({ uniforms: { uMap: space.lights.material.uniforms.uMap }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'uniform sampler2D uMap; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb * 2.2, 1.0); }', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const nightLightsM = space.lights.material;
  const dotT = sunDisc.material.map;
  const mkPath = (pts, color, size) => { const g = new THREE.BufferGeometry().setFromPoints(pts); const m = new THREE.Points(g, new THREE.PointsMaterial({ map: dotT, color, size, transparent: true, depthWrite: false, toneMapped: false, fog: false, blending: THREE.AdditiveBlending })); m.frustumCulled = false; space.root.add(m); m.visible = false; return m; };
  const RC = 22000, straightPts = [], arcPts = [];
  for (let s = -4000; s <= 26000; s += 260) { straightPts.push(new THREE.Vector3(0, 0, -s)); const a = s / RC; arcPts.push(new THREE.Vector3(-RC + RC * Math.cos(a), 0, -RC * Math.sin(a))); }
  const straight = mkPath(straightPts, new THREE.Color(1.5, 1.5, 1.6), 70), arc = mkPath(arcPts, new THREE.Color(1.6, 1.1, 0.35), 70);
  function spaceScene(t, cam) {
    const S = space;
    if (cam === 'sun') {
      S.earth.material = earthM; S.lights.material = nightLightsM; S.clouds.visible = true; S.atm.visible = true; S.spin.position.set(0, 0, 0); S.stars.position.set(0, 0, 0);
      S.sun.position.copy(sunDirS).multiplyScalar(1000); S.sun.target.position.set(0, 0, 0); S.sun.intensity = 3.2; S.lights.material.uniforms.uSun.value.copy(sunDirS); S.atm.material.uniforms.uSun.value.copy(sunDirS);
      S.setSpin(0.6 + t * 0.03);
      const g = t - SW, k = g < 0 ? 1 : Math.max(0, 1 - g / 0.14);
      sunDisc.position.copy(sunSlot); sunDisc.scale.setScalar(260 * (k * (1 + 0.02 * Math.sin(t * 9)))); sunDisc.visible = k > 0.001;
      corona.position.copy(sunSlot); corona.scale.setScalar(620 * (g < 0 ? 1 : Math.max(0, 1 - g / 0.3))); corona.visible = g < 0.3;
      flare.position.copy(sunSlot); const fa = g > -0.12 && g < 0.1 ? 1 - Math.abs(g + 0.01) / 0.11 : 0; flare.visible = fa > 0; if (fa > 0) { flare.scale.setScalar(380); flare.material.opacity = 0.8 * fa; }
      straight.visible = false; arc.visible = false;
      return;
    }
    // orbit: dark Earth with its cities lit, gliding along the straight line while the orbit arc bends away
    sunDisc.visible = false; corona.visible = false; flare.visible = false;
    S.earth.material = earthDark; S.lights.material = cityLightsM; S.clouds.visible = false; S.atm.visible = false; S.sun.intensity = 0;
    const u = clamp((t - 34.0) / 3.0), z = -5200 * u;
    S.spin.position.set(0, 0, z); S.setSpin(1.2 + t * 0.05); S.stars.position.set(0, 0, z);
    straight.visible = true; arc.visible = true;
    return z;
  }
  space.root.children.filter((o) => o.isLight && o.isHemisphereLight).forEach((h) => (h.intensity = 0.35));

  // ================================================================ update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = S === 'lag' ? 0.95 : S === 'pool' && t >= OUT ? 0.7 : 0.55; studio.camera.near = S === 'space' ? 1 : 0.05; studio.camera.up.set(0, 1, 0);
    if (studio.renderer) studio.renderer.toneMappingExposure = EXPO[S] * (S === 'pool' && t >= OUT ? 1.2 : 1);
    all.forEach((r) => (r.root.visible = false)); smoke.hide(); fire.hide(); ns = 0; nf = 0; nfl = 0; fireLights.forEach((L) => (L.intensity = 0));
    ball.visible = false; fball.visible = false; drum.visible = false; barrels.forEach((b) => (b.visible = false)); heater.visible = false; frostCar.g.visible = false;
    poolFlash.forEach((f) => (f.g.visible = false)); petals.visible = false; flashL.intensity = 0; stringL.forEach((L) => (L.intensity = 0));
    skyMoon.g.visible = false; jup.visible = false; holeG.visible = false; bucket.visible = false; rod.visible = false; fline.visible = false; fish.visible = false; lantern.visible = false; kidLight.g.visible = false;
    towels.flat().forEach((m) => (m.visible = false));
    nb = 0; shake = [0, 0];

    let ez = 0;
    if (S === 'pool') poolScene(t, cam);
    else if (S === 'stad') stadScene(t);
    else if (S === 'wed') wedScene(t, cam);
    else if (S === 'city') cityScene(t, cam);
    else if (S === 'tide') iceScene(t);
    else if (S === 'lag') lagScene(t, cam);
    else if (S === 'space') ez = spaceScene(t, cam) || 0;
    blobs.count = nb; blobs.instanceMatrix.needsUpdate = true; blobs.visible = nb > 0;

    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (cam === 'moonA') {   // behind the phone, aimed between the phone screen and the Moon
      roofers[0].root.updateMatrixWorld(true); const ph = phones[0].g.getWorldPosition(new THREE.Vector3());   // roofer 0 holds still in this shot
      const back = new THREE.Vector3(-moonDir.x, 0, -moonDir.z).normalize();
      const cp = ph.clone().addScaledVector(back, 0.95 - 0.12 * u).add(new THREE.Vector3(0.12, -0.12, 0.18));
      const d1 = ph.clone().sub(cp).normalize(), aimDir = d1.multiplyScalar(0.5).add(moonDir.clone().multiplyScalar(0.5)).normalize();
      P[0] = cp.x; P[1] = cp.y; P[2] = cp.z; const ap = cp.clone().addScaledVector(aimDir, 10); Aim[0] = ap.x; Aim[1] = ap.y; Aim[2] = ap.z;
    }
    if (cam === 'dive') {   // track the kid down the board and into the air
      const kz = t < 23.45 ? lerp(7.1, 4.15, clamp((t - 21.9) / 1.55)) : 4.15 - 1.5 * (t - 23.45), ky = t < 23.45 ? 1.15 : Math.max(0.2, 1.15 + 3.2 * (t - 23.45) - 4.9 * (t - 23.45) ** 2);
      Aim[0] = o[0] - 12; Aim[1] = o[1] + lerp(ky, 0.9, 0.35); Aim[2] = o[2] + kz - 0.6;
    }
    if (cam === 'orbit') { P[0] = o[0] + 1100; P[1] = o[1] + 650; P[2] = o[2] + ez + 2300; Aim[0] = o[0] - 250; Aim[1] = o[1] - 50; Aim[2] = o[2] + ez - 1400; }
    if (cam === 'stars') {   // on the kid's face, then a tilt + crane up to the Milky Way
      const k = smooth(clamp((t - 57.4) / 2.4));
      const a0 = new THREE.Vector3(0.22, 0.32, 2.15), a1 = new THREE.Vector3(-0.6, 5.2, -2.6), am = a0.lerp(a1, k);
      Aim[0] = am.x + o[0]; Aim[1] = am.y + o[1]; Aim[2] = am.z + o[2]; P[1] += 0.35 * k; P[2] += 0.35 * k;
    }
    P[0] += shake[0]; P[1] += shake[1];
    setCamera(P, Aim, c.fov, t, c.amp);
    // sky objects that need the final camera: the Moon at its true size + Jupiter
    if (S === 'city' && cam !== 'fires') {
      if (t < MOON_OUT) { skyMoon.setSky(studio.camera, moonDir, ANG0, 300); skyMoon.setGain(1.35); skyMoon.setGlow(0.35); skyMoon.g.visible = true; }
      else { const k = Math.max(0, 1 - (t - MOON_OUT) / 0.06); if (k > 0) { skyMoon.setSky(studio.camera, moonDir, ANG0, 300); skyMoon.setGain(1.35 * k); skyMoon.setGlow(0.35 * k); skyMoon.g.visible = true; } }
      if (t < JUP_OUT) { jup.position.copy(studio.camera.position).addScaledVector(jupDir, 300); jup.scale.setScalar(300 * 0.0042); jup.visible = true; }
    }
  }
  return { update };
}
