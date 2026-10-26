// VIDEO 020 — "What if your butt doubled in size every minute?"  (tone: FUNNY doubling-POV, unhinged lane / weird tier, @ed._.studios)
// A "you" escalation in the @whatifpov format: at 7:00 AM Gary's butt (in jeans — clothed, cartoon, never anything else) doubles
// every minute. HUD = YOUR BUTT · WIDTH (36 cm → 6,040 km) + MINUTE n; every doubling = a BOOM (boing + starburst + dust + camera
// shake) and the world reacting; one real, sourced number per beat in the stat line. It was a dream… then 7:01 (seamless loop).
// 60 s, 12 shots, 8 sets parked at offsets in one scene (one visible per shot; city.js stays at the origin).
// NEW: engine/props.js makeButt() (denim cheeks + pockets + belt, scales 0.36 m → a planet), core.js HUD fmt:'len' + geo rolls.
//
// Sources (checked Oct 26 2026):
//   hip breadth (sitting), US adults ≈ 36–37 cm — CityU HK "Online Anthropometry" ch.2 (US men 360 mm, women 370–375 mm);
//     ANSUR II (Gordon et al. 2014) standing hip breadth medians 34.4 / 35.3 cm (NCSU Ergonomics Center summary tables)
//   stretch denim = 1–2 % spandex/elastane — Threads Magazine "Stretch wovens" (T233); Mott & Bow stretch-denim guide (1–3 %)
//   front doors: IRC egress door ≥ 32 in clear width → the standard 36 in (91 cm) door — buildingcodetrainer.com, Fine Homebuilding
//   40-ft transit bus ≈ 12.2 m, curb weight ≈ 11.3–15.4 t (New Flyer D40LF 12.0 t, Xcelsior XE40 14.9 t) — busesforsale / Winnipeg RFP
//   interstate lanes are 12 ft (3.66 m) — FHWA Highway Statistics HM-59 (2023 lane-width table)
//   Olympic pool 50 × 25 × 2 m = 2,500 m³ = 2.5 million L — World Aquatics facilities rules (via Wikipedia "Olympic-size swimming pool")
//   airliners cruise at ~35,000 ft ≈ 10.7 km — Flight Deck Friend "How high do planes fly", AirHelp
//   the ISS orbits at ~400 km (370–420 km) — NASA facts via secondary sources (IAC "The Moon and the ISS")
//   the Moon is 3,474 km across — NASA Moon facts (mean diameter 3,474.8 km)
//   smartphone subscriptions ≈ 7.3 billion (2025) — Ericsson Mobility Report, June 2025 (via Statista)
//
// Width ladder: W(n) = 0.36 m × 2^n  →  M1 72 cm · M2 1.44 m · M3 2.88 · M4 5.76 · M5 11.5 · M6 23.0 · M7 46.1 m · M13 2.95 km ·
//   M14 5.90 · M15 11.8 km · M20 377 · M21 755 · M22 1,510 · M23 3,020 · M24 6,040 km (> the Moon's 3,474 km).
//
// Shot list (seconds)                    | set     | what happens
//  0.0– 3.4  sleep  title, 6:59 AM       | bedroom | Gary asleep face-down in his jeans, the dog napping on his butt; alarm 7:00
//  3.4– 8.0  stand  MINUTE 0 → 1          | bedroom | (dream) he stretches by the bed; 5.5 BOOM 36 → 72 cm: lurches, the dog barks, the lamp rocks
//  8.0–12.6  kitchen MINUTE 2             | kitchen | walks in with coffee, sits; 10.0 BOOM → 1.44 m: the chair explodes, the belt snaps, the button flies
// 12.6–17.8  door   MINUTE 3 → 4          | suburb  | stuck in the front door (cheeks bulge out of the wall), two neighbors pull; 15.3 BOOM → 5.76 m: CORK POP onto the lawn
// 17.8–22.4  bus    MINUTE 5              | suburb  | he waits at the curb, the bus pulls in; 20.5 BOOM → 11.5 m: the bus is crushed flat, NOT IN SERVICE
// 22.4–27.0  traffic MINUTE 6             | city    | his butt blocks the intersection, a cop waves cars around; 25.0 BOOM → 23 m: cars bounce away, the signal falls
// 27.0–31.6  pool   MINUTE 7              | pool    | the butt sits down into the pool; 29.3 BOOM → 46 m: all the water erupts, swimmers launched
// 31.6–36.4  flight MINUTE 13 → 15        | flight  | two snow-capped denim domes rise out of the clouds; 32.9 + 34.2 BOOMs; a jet banks hard around them
// 36.4–41.0  iss    MINUTE 20 → 21        | space×10| an astronaut outside the ISS; 38.7 BOOM: the butt rises to orbit height on the horizon; she turns + photographs it (flash)
// 41.0–43.4  crowdA MINUTE 22             | street  | a sidewalk crowd looks up, every phone goes up in sync
// 43.4–45.2  crowdB MINUTE 23             | street  | over their phones: the butt fills the sky; 43.4 BOOM
// 45.2–50.2  moon   MINUTE 23 → 24        | space   | Earth from afar, the butt on top; 47.3 BOOM → 6,040 km: two denim moons + the Moon = three moons
// 50.2–60.0  wake   7:00 AM → 7:01        | bedroom | he wakes (a dream), relief, the dog naps on his butt; 54.4 BOOM → the dog launches. End card 56.0
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, makeHead, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeDog, makeBus, makeMug, makeButt, makePhone } from '@engine/props.js';
import { buildBedroom } from '@engine/sets/bedroom.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildPool, DIMS as PO } from '@engine/sets/pool.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildFlight, buildSpace, makeISS, makeJet, makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const SIT = HIP_H - 0.17;                 // pelvis-bottom offset: sitting root = seat − SIT
const HC = 0.9;                           // body center above the feet (for lying / flying bodies)
const WM = (n) => 0.36 * 2 ** n;          // butt width (m) at minute n
const OFF = { city: [0, 0, 0], bed: [3000, 0, 0], kit: [5000, 0, 0], burb: [7000, 0, 0], pool: [9000, 0, 0], street: [11000, 0, 0],
  flight: [16000, 0, 0], space: [40000, 0, 0] };
const BOOM = { stand: 5.5, kitchen: 10.0, door: 15.3, bus: 20.5, traffic: 25.0, pool: 29.3, fly1: 32.9, fly2: 34.2, iss: 38.7, crowd: 43.4, moon: 47.3, wake: 54.4 };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'sleep', set: 'bed' },
  { t0: 3.4, t1: 8.0, cam: 'stand', set: 'bed' },
  { t0: 8.0, t1: 12.6, cam: 'kitchen', set: 'kit' },
  { t0: 12.6, t1: 17.8, cam: 'door', set: 'burb' },
  { t0: 17.8, t1: 22.4, cam: 'bus', set: 'burb' },
  { t0: 22.4, t1: 27.0, cam: 'traffic', set: 'city' },
  { t0: 27.0, t1: 31.6, cam: 'pool', set: 'pool' },
  { t0: 31.6, t1: 36.4, cam: 'flight', set: 'flight' },
  { t0: 36.4, t1: 41.0, cam: 'iss', set: 'space' },
  { t0: 41.0, t1: 43.4, cam: 'crowdA', set: 'street' },
  { t0: 43.4, t1: 45.2, cam: 'crowdB', set: 'street' },
  { t0: 45.2, t1: 50.2, cam: 'moon', set: 'space' },
  { t0: 50.2, t1: 60.0, cam: 'wake', set: 'bed' },
];
// cameras: keys = [[t, pos, aim], …] in the set's LOCAL coords (eased between keys); fov
export const CAMS = {
  sleep:   { keys: [[0, [0.85, 1.95, 0.45], [-0.35, 0.78, -1.5]], [3.4, [0.8, 1.9, 0.25], [-0.35, 0.78, -1.5]]], fov: 46 },
  stand:   { keys: [[3.4, [1.35, 1.42, 2.55], [0.42, 1.0, -0.3]], [8.0, [1.15, 1.38, 2.15], [0.42, 1.0, -0.3]]], fov: 50 },
  kitchen: { keys: [[8.0, [1.75, 1.3, 2.95], [1.55, 0.85, -0.3]], [12.6, [1.65, 1.22, 2.55], [1.55, 0.75, -0.4]]], fov: 52 },
  door:    { keys: [[12.6, [-1.65, 1.62, -2.9], [-2.2, 1.6, -8.4]], [15.3, [-1.7, 1.58, -3.3], [-2.2, 1.6, -8.4]], [15.75, [-1.4, 3.0, 6.0], [-2.0, 2.4, -4.6]], [17.8, [-1.0, 3.4, 8.5], [-2.0, 2.8, -4.6]]], fov: 50 },
  bus:     { keys: [[17.8, [11.0, 2.4, 16.5], [15.2, 3.8, 0.0]], [20.4, [10.8, 2.5, 17.0], [15.2, 3.9, 0.0]], [22.4, [10.0, 4.6, 19.0], [15.2, 3.6, 0.0]]], fov: 58 },
  traffic: { keys: [[22.4, [1.5, 4.5, 24.0], [0.3, 5.5, -6.0]], [25.0, [1.4, 4.4, 22.5], [0.3, 6.0, -6.0]], [27.0, [1.8, 4.8, 25.5], [0.3, 8.0, -6.0]]], fov: 54 },
  pool:    { keys: [[27.0, [2.0, 2.2, 26.0], [0.0, 9.0, -4.0]], [29.3, [1.6, 2.0, 24.0], [0.0, 7.5, -4.0]], [31.6, [2.4, 2.6, 28.0], [0.0, 11.0, -4.0]]], fov: 64 },
  flight:  { keys: [[31.6, [-40, 12, 160], [0, 90, -700]], [36.4, [-20, 14, 120], [0, 230, -700]]], fov: 52 },
  iss:     { keys: [[36.4, [0, 0, 0], [0, 0, 0]]], fov: 50 },   // placed in code (Earth-relative)
  crowdA:  { keys: [[41.0, [8.5, 1.4, 3.4], [-1.0, 1.95, 3.5]], [43.4, [7.8, 1.4, 3.5], [-1.0, 1.95, 3.5]]], fov: 52 },
  crowdB:  { keys: [[43.4, [-5.0, 1.7, 3.6], [40.0, 10.5, 3.6]], [45.2, [-4.6, 1.7, 3.6], [40.0, 12.0, 3.6]]], fov: 58 },
  moon:    { keys: [[45.2, [200, 480, 1780], [110, 470, 0]], [50.2, [180, 490, 1640], [110, 480, 0]]], fov: 46 },
  wake:    { keys: [[50.2, [0.85, 1.95, 0.45], [-0.35, 0.78, -1.5]], [54.4, [0.78, 1.85, 0.2], [-0.35, 0.78, -1.5]], [60.0, [0.85, 1.95, 0.4], [-0.35, 1.0, -1.5]]], fov: 46 },
};
const DBG = { sleep: [-0.3, -1.3, 5], stand: [0, 0, 6], wake: [-0.3, -1.3, 5], kitchen: [1, 0, 7], door: [-1.5, -4, 24], bus: [16, 4, 36], traffic: [0, 2, 60], pool: [0, 2, 70], crowdA: [1, 3, 16], crowdB: [1, 3, 16] };
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- small helpers
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const sm = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** width (m) of a butt that doubles from minute n at time tb: a fast swell + a boing overshoot */
function grow(t, tb, n) {
  const w0 = WM(n), a = t - tb;
  if (a <= 0) return w0;
  const u = Math.min(1, a / 0.14), e = 1 - (1 - u) * (1 - u);
  return w0 * 2 ** e * (1 + 0.12 * Math.exp(-a * 5) * Math.sin(a * 20));
}
/** squash for the same boing (+ = flattened): bounces after the swell */
const squash = (t, tb) => { const a = t - tb; return a <= 0 ? 0 : 0.55 * Math.exp(-a * 4.5) * Math.sin(a * 20); };
/** a ballistic hop: offset (m) of something thrown up with v0 at t0, landing back at 0 (bounces once) */
function hop(t, t0, v0) { const a = t - t0; if (a <= 0) return 0; const T = 2 * v0 / 9.8; if (a < T) return v0 * a - 4.9 * a * a; const b = a - T, v1 = v0 * 0.35, T2 = 2 * v1 / 9.8; return b < T2 ? v1 * b - 4.9 * b * b : 0; }

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x8a7b6a, 0xc9b48e, 0x6a5a6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const DENIM = '#41639a';

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const W3 = (key, x, y, z) => V3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('red'); city.setGrowth(0); city.setSnow(0);
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); if (bed.decor.teen) bed.decor.teen.visible = true;
  bed.setNightlight(0); bed.setXmas(0, 0);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(7, 2);
  const burb = buildSuburb(studio, { poleClear: [-2, 16] }); burb.root.position.set(...OFF.burb); const burbFog = burb.fog;
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool); const poolFog = pool.fog;
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const flight = buildFlight(studio, {}); flight.root.position.set(...OFF.flight);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ROOTS = { city: city.root, bed: bed.root, kit: kit.root, burb: burb.root, pool: pool.root, street: street.root, flight: flight.root, space: space.root };
  const FOGS = { city: cityFog, bed: null, kit: null, burb: burbFog, pool: poolFog, street: streetFog, flight: new THREE.Fog(0xf2d0b0, 450, 3800), space: null };
  const FAR = { city: 1500, bed: 60, kit: 40, burb: 420, pool: 300, street: 400, flight: 4000, space: 6000 };
  const toLocal = (key, v) => v.clone().sub(V3(...OFF[key]));
  void toLocal;

  // ---------------------------------------------------------------- cast
  const R = rng(20);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); return p; };
  const crowd = Array.from({ length: 24 }, () => {
    const style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: pick(TOPS), collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style,
      glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null });
    p.seed = R(); return p;
  });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x41639a, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const cop = person({ skin: 0x9a6447, top: 0x2f4f8a, collar: 0x2f4f8a, pants: 0x1f2f4a, hair: 0x1a1a1a, hairStyle: 'short' });
  { const cap = new THREE.Group(); cop.headG.add(cap); cap.position.set(0, 0.27, 0.0);
    mk(new THREE.CylinderGeometry(0.15, 0.14, 0.08, 18), mat(0x1f2f4a, 0.5), cap, 0, 0, 0); mk(new THREE.BoxGeometry(0.22, 0.015, 0.12), mat(0x111111, 0.4), cap, 0, -0.035, 0.12);
    mk(new THREE.BoxGeometry(0.2, 0.06, 0.02), mat(0xf2e14a, 0.4), cop.spine, 0, 0.32, 0.14); }   // cap + hi-vis band
  const astro = person({ skin: 0xf1c3a1, top: 0xf2f2ee, collar: 0xd0d4da, pants: 0xf2f2ee, shoes: 0xc9ccd2, hair: 0x5a3a24, hairStyle: 'bob' });
  { mk(new THREE.BoxGeometry(0.46, 0.55, 0.24), mat(0xe6e6e2, 0.5), astro.spine, 0, 0.3, -0.24);
    mk(new THREE.BoxGeometry(0.22, 0.12, 0.05), mat(0x3d7bd9, 0.4), astro.spine, 0, 0.32, 0.15);
    const hel = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20), new THREE.MeshStandardMaterial({ color: 0xdfefff, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.1, depthWrite: false }));
    hel.position.set(0, 0.14, 0.01); astro.headG.add(hel); mk(new THREE.TorusGeometry(0.17, 0.035, 10, 24), mat(0xd0d4da, 0.4), astro.headG, 0, -0.04, 0).rotation.x = PI / 2; }
  const camBody = new THREE.Group(); mk(new THREE.BoxGeometry(0.16, 0.11, 0.09), mat(0x222326, 0.4), camBody, 0, 0, 0); mk(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 16), mat(0x111111, 0.3), camBody, 0, 0, 0.08).rotation.x = PI / 2;
  scene.add(camBody); camBody.visible = false;
  const flashS = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,250,235,.6)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(flashS); flashS.visible = false;
  const dog = makeDog(); scene.add(dog.g);
  const mug = makeMug(0xf2b632); scene.add(mug);

  // the hero butt (rides on Gary's pelvis at small sizes, sits in the set as a landmark at big ones) + one per far-away set
  const butt = makeButt({ denim: DENIM }); scene.add(butt.g);
  const flyButt = makeButt({ denim: DENIM }); flight.root.add(flyButt.g);
  const skyButt = makeButt({ denim: DENIM }); street.root.add(skyButt.g);
  const spaceButt = makeButt({ denim: DENIM }); space.root.add(spaceButt.g);
  skyButt.g.traverse((o) => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0xffffff).multiplyScalar(o.material.map ? 0.75 : 0.25); if (o.material.map) o.material.emissiveMap = o.material.map; } });
  const crowdFog = streetFog ? new THREE.Fog(streetFog.color.getHex(), 80, 9000) : null;
  // snow caps (its own weather) on the flight butt: white caps on both cheek tops
  { const capM = mat(0xf6f8fb, 0.6); for (const s of [-1, 1]) { const c = mk(new THREE.SphereGeometry(0.274, 40, 10, 0, PI * 2, 0, 0.62), capM, flyButt.inner, s * 0.22, -0.3, -0.17); c.scale.set(1, 0.96, 0.9); } }
  // the Moon (space set): grey, cratered
  const moonTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#b9b7b2'; c.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, s = 3 + r() * 22; c.fillStyle = `rgba(${r() < 0.5 ? '80,80,82' : '235,235,230'},${0.15 + r() * 0.25})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); } for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(70,72,78,.35)'; c.beginPath(); c.ellipse(r() * w, h * (0.25 + r() * 0.5), 30 + r() * 60, 20 + r() * 30, 0, 0, 7); c.fill(); } });
  const moon = mk(new THREE.SphereGeometry(109, 64, 40), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.95 }), space.root, 0, 0, 0);
  moon.castShadow = false;

  // ---------------------------------------------------------------- impacts (starbursts + puffs) and camera jolts
  const puffs = makeSpritePool(scene, 140, 'smoke');
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 12 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0;
  const DUST = new THREE.Color(0xe8e2d6), WATER = new THREE.Color(0xeaf6ff);
  /** an impact at time m at world point w (size s in meters): a starburst + a ring of dust puffs */
  function impact(t, m, w, s = 1, o = {}) {
    const age = t - m, life = o.life ?? 0.8; if (age < 0 || age > life) return;
    if (!o.noStar && age < 0.3 && starN < stars.length) { const sp = stars[starN++], k = age / 0.3; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.35 + 0.6 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    const n = o.n ?? 6;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + (k / n) * PI * 2, r = (0.15 + age * 1.1) * s * (o.spread ?? 1);
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y + (o.up ?? 0.15) * s * age * 2 + (k % 2) * 0.1 * s, w.z + Math.sin(a) * r * 0.6), (0.35 + age * 0.9) * s * (o.puff ?? 1), (o.op ?? 0.8) * (1 - age / life) ** 1.4, o.color || DUST);
    }
  }
  const jolts = [];   // [time, strength (rad)] — angular shake (scales with the shot's size)

  // ---------------------------------------------------------------- shared posing helpers
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _c = new THREE.Vector3();
  function show(rig, key, p, o = {}) {
    p.x += OFF[key][0]; p.z += OFF[key][2]; p.y = (p.y || 0) + OFF[key][1];
    applyPose(rig, p);
    rig.root.rotation.x = o.tilt || 0; rig.root.rotation.z = (o.roll || 0) + rig.root.rotation.z;
    rig.root.scale.setScalar(o.s || 1);
    rig.root.visible = true;
  }
  /** pose a rig by its BODY CENTER C (local): yaw/tilt/roll orient the whole body (lying, flying). Legs hang along the body. */
  function showC(rig, key, p, C, yaw, tilt = 0, roll = 0) {
    _e.set(tilt, yaw, roll); _c.set(0, HC, 0).applyEuler(_e);
    p.x = C[0] - _c.x; p.y = C[1] - _c.y; p.z = C[2] - _c.z; p.rotY = yaw;
    p.floor = p.y - 2.5;
    show(rig, key, p, { tilt, roll });
  }
  /** the butt rides on the rig's pelvis (small sizes) */
  function wear(rig, W) {
    if (butt.g.parent !== rig.pelvis) rig.pelvis.add(butt.g);
    butt.g.position.set(0, 0.06, 0); butt.g.rotation.set(0, 0, 0); butt.setWidth(W); butt.g.visible = true;
  }
  /** the butt as a landmark: anchor (top-center-front of the waistband) at local [x, z] of set key, resting on groundY;
   *  Gary rides on top (pelvis at the anchor, legs tucked into the denim). yaw = the way Gary faces (the pockets face the other way). */
  function landmark(key, x, z, yaw, W, o = {}) {
    if (butt.g.parent !== scene) scene.add(butt.g);
    const y = (o.ground ?? 0) + 0.565 * W + (o.lift ?? 0);
    butt.setWidth(W); butt.g.position.copy(W3(key, x, y, z)); butt.g.rotation.set(o.tilt || 0, yaw, 0); butt.g.visible = true;
    if (o.gary !== false) {
      const p = basePose(); p.eyes = blink(o.t ?? 0, 2); p.rotY = yaw; p.x = x; p.z = z; p.y = y - 0.06 - HIP_H; p.floor = p.y - 2.5; p.crouch = 0; p.footFwd = 0.3;
      p.armA = o.armA || A(-0.25, 0.55, -0.4); p.armB = o.armB || A(-0.25, 0.55, -0.4); p.mouth = o.mouth || 'o'; p.headPitch = o.headPitch ?? 0; p.headYaw = o.headYaw ?? 0;
      show(gary, key, p);
    }
    return y;
  }

  // ================================================================ BEDROOM (morning) — sleep / stand / wake
  const B = bed.D.bed;
  // set dressing for a grown-up's room: glowing alarm clock, slippers, laundry basket, books, a plant, a poster
  const clockTex = (txt) => canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4a3a'; g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); });
  const clockTexs = { a: clockTex('6:59'), b: clockTex('7:00'), c: clockTex('7:01') };
  const clock = new THREE.Group(); clock.position.set(-1.02, 0.55, -2.12); clock.rotation.y = 0.75; bed.root.add(clock);
  mk(new THREE.BoxGeometry(0.2, 0.1, 0.08), mat(0x1d1d22, 0.4), clock, 0, 0.05, 0);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), new THREE.MeshBasicMaterial({ map: clockTexs.a, toneMapped: false })); clockFace.position.set(0, 0.05, 0.041); clock.add(clockFace);
  for (const sx of [-0.06, 0.08]) { const sl = mk(new THREE.CapsuleGeometry(0.045, 0.16, 4, 10), mat(0x8f6fb8, 0.9), bed.root, 0.55 + sx, 0.03, -1.1); sl.rotation.x = PI / 2; sl.scale.set(1, 1, 0.5); }
  const basket = new THREE.Group(); basket.position.set(1.55, 0, -2.05); bed.root.add(basket);
  mk(new THREE.CylinderGeometry(0.24, 0.2, 0.5, 14, 1, true), mat(0xc9a77a, 0.9, { side: THREE.DoubleSide }), basket, 0, 0.25, 0);
  [0x3d7bd9, 0xe58fa6, 0xf5f0e2, 0x41639a].forEach((c, i) => mk(new THREE.SphereGeometry(0.12, 10, 8), mat(c, 0.95), basket, (i % 2 - 0.5) * 0.14, 0.45 + (i > 1 ? 0.06 : 0), (i > 1 ? 0.05 : -0.05)));
  [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f].forEach((c, i) => mk(new THREE.BoxGeometry(0.2, 0.05, 0.28), mat(c, 0.7), bed.root, -1.12, 0.6 + 0.08 + i * 0.05, -2.3 + (i % 2) * 0.02));
  const plant = new THREE.Group(); plant.position.set(1.7, 0, 1.0); bed.root.add(plant);
  mk(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 14), mat(0xb5672e, 0.8), plant, 0, 0.15, 0);
  for (let k = 0; k < 7; k++) { const lf = mk(new THREE.SphereGeometry(0.16, 10, 8), mat(0x4f8a3f, 0.8), plant, Math.sin(k * 2.4) * 0.12, 0.45 + (k % 3) * 0.12, Math.cos(k * 2.4) * 0.12); lf.scale.set(0.6, 1.4, 0.3); lf.rotation.z = Math.sin(k) * 0.5; }
  const lampG = new THREE.Group(); lampG.position.set(-1.12, 0.55, -2.32); bed.root.add(lampG);   // a little bedside lamp that rocks on the boom
  mk(new THREE.CylinderGeometry(0.05, 0.07, 0.03, 14), mat(0xd8c9a8, 0.5), lampG, 0, 0.015, 0); mk(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), mat(0xc9a25a, 0.3), lampG, 0, 0.17, 0);
  mk(new THREE.ConeGeometry(0.12, 0.14, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2e6c8, emissive: 0xffd7a0, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.7 }), lampG, 0, 0.36, 0);
  // morning: warm sun through the window, brighter ambience
  bed.lights.moon.color.setHex(0xffe2b8); bed.lights.moon.intensity = 2.6; bed.lights.hemi.color.setHex(0xfff0dc); bed.lights.hemi.groundColor.setHex(0x8a7460); bed.lights.hemi.intensity = 1.25;
  const morningFill = new THREE.PointLight(0xfff0dc, 2.2, 7, 1.6); morningFill.position.set(1.2, 2.2, 1.0); bed.root.add(morningFill);
  bed.setLamp(0.35); bed.setDoor(0);
  { const sky = bed.root.children.find((o) => o.isMesh && o.geometry.parameters && o.geometry.parameters.width === 4.8 && o.geometry.parameters.height === 3.4);
    if (sky) sky.material = new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(512, 360, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5f9fe0'); gr.addColorStop(0.7, '#cfe6f6'); gr.addColorStop(1, '#f6ead2'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y, r] of [[120, 90, 34], [160, 80, 44], [205, 95, 30], [380, 140, 28], [415, 130, 38]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = '#5c8f48'; for (let x = 0; x < w; x += 46) { c.beginPath(); c.arc(x + 20, h - 40, 42, 0, 7); c.fill(); } c.fillStyle = '#c98a6a'; c.fillRect(300, h - 120, 120, 90); c.fillStyle = '#7a4a3a'; c.beginPath(); c.moveTo(290, h - 120); c.lineTo(360, h - 170); c.lineTo(430, h - 120); c.fill(); }) }); }

  /** Gary asleep face-down on the bed (head on the pillow at −z), head turned toward the camera; wake 0..1 lifts the head */
  function prone(t, wake, mouth = 'flat') {
    const p = basePose(); p.eyes = wake > 0.3 ? blink(t, 4) : 'closed'; p.mouth = mouth;
    p.headYaw = -1.35 + 0.25 * wake; p.headPitch = -0.15 - 0.5 * wake; p.headRoll = 0;
    p.armA = A(-2.75, 0.55, -1.4, 0.4); p.armB = A(-2.75, 0.55, -1.4, -0.4);
    const breathe = 0.006 * Math.sin(t * 2.2);
    showC(gary, 'bed', p, [B.cx, B.top + 0.13 + breathe + 0.05 * wake, -1.32], PI, PI / 2, 0);
  }
  /** the dog curled up on Gary's butt (yaw: facing +x, toward the camera) */
  function dogOnButt(t, W, launch = -1) {
    gary.root.updateMatrixWorld(true);
    const top = butt.g.localToWorld(V3(0, -0.3, -0.17 - 0.27 * 0.9 - 0.02));   // the hill top (back of the cheeks)
    let y = top.y - 0.1, rx = 0, ry = PI / 2 - 0.25;
    if (launch >= 0 && t > launch) { const a = t - launch; y += Math.max(0, 3.4 * a - 4.9 * a * a); rx = -a * 5.5; }
    dog.g.position.set(top.x - 0.02, y, top.z); dog.g.rotation.set(rx, ry, 0); dog.g.visible = true;
    dog.setLie(launch >= 0 && t > launch ? 0.4 : 1); dog.update(t, 0);
  }

  // ================================================================ KITCHEN — the chair explodes, the belt snaps, the button flies
  const CH = kit.chairs[1];   // seat at (1.35, −0.4), faces −x
  const chairParts = CH.children.map((m, i) => ({ m, p0: m.position.clone(), r0: m.rotation.clone(), v: V3((i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.5), 2.2 + (i % 4) * 0.6, ((i * 7) % 5 - 2) * 0.7), w: V3(4 + i, 3 + i * 0.7, 5 - i) }));
  const beltBits = [0, 1].map(() => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.45, 0.03, 0.012), mat(0x6a4128, 0.55), g, 0.22, 0, 0); scene.add(g); g.visible = false; return g; });
  const flyButton = mk(new THREE.CylinderGeometry(0.014, 0.014, 0.007, 14), mat(0xc98a3c, 0.3, { metalness: 0.7 }), scene, 0, 0, 0); flyButton.visible = false;
  const KIT_SIT = 9.35;
  function garyKitchen(t) {
    const p = basePose(); p.eyes = blink(t, 1); p.mouth = 'smile';
    const walkU = K(t, [[8.0, 0], [KIT_SIT - 0.45, 1]], (u) => u);
    const x0 = 2.55, z0 = 1.5, x1 = 1.62, z1 = -0.4;
    p.x = lerp(x0, x1, walkU); p.z = lerp(z0, z1, walkU);
    p.rotY = walkU < 1 ? Math.atan2(x1 - x0, z1 - z0) : -PI / 2;
    p.rotY = lerpAngle(p.rotY, -PI / 2, K(t, [[KIT_SIT - 0.6, 0], [KIT_SIT - 0.2, 1]]));
    p.dist = walkU * 2.1; p.speed = walkU > 0 && walkU < 1 ? 1.0 : 0;
    p.armB = A(-0.75, 0.2, -1.95, -0.55);   // the mug at the chest
    const sit = K(t, [[KIT_SIT - 0.3, 0], [KIT_SIT, 1]]);
    if (sit > 0) { p.y = -0.12 * sit; p.crouch = 0; p.footFwd = 0.38 * sit; p.lean = 0.03 + 0.05 * sit; p.floor = 0; }
    if (t > BOOM.kitchen) {
      const a = t - BOOM.kitchen;
      p.y = -0.11 + 0.2 * Math.max(0, Math.sin(a * 9)) * Math.exp(-a * 4); p.footFwd = 0.5; p.mouth = 'o';
      p.armA = A(-1.2, 1.1, -0.3); p.armB = A(-1.2, 1.1, -0.3); p.headPitch = -0.15; p.lean = -0.08;
      if (a > 0.9) { p.armA = A(-0.3, 0.75, -0.5); p.armB = A(-0.3, 0.75, -0.5); p.mouth = 'flat'; p.headYaw = 0.9 * K(t, [[BOOM.kitchen + 1.0, 0], [BOOM.kitchen + 1.4, 1]]); }
    }
    return p;
  }

  // ================================================================ SUBURB — door (lot 2 at x=0) + bus stop (lot 3 at x=16)
  const H2 = burb.houses[2];   // near side, front wall at z=−9, door at x=−2.2
  const DOORX = -2.2, WALLZ = -9;
  // hole left in the wall after the cork pop (dark, ragged) + debris (siding planks, trim, the door itself)
  const holeTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, w, h); c.fillStyle = '#231c18'; c.beginPath(); const r = rng(9); for (let i = 0; i <= 24; i++) { const a = (i / 24) * PI * 2, rr = 0.82 + r() * 0.18; c.lineTo(128 + Math.cos(a) * 120 * rr, 128 + Math.sin(a) * 120 * rr); } c.fill(); });
  const hole = mk(new THREE.PlaneGeometry(3.4, 2.9), new THREE.MeshStandardMaterial({ map: holeTex, transparent: true, alphaTest: 0.4, roughness: 1 }), burb.root, DOORX, 1.55, WALLZ + 0.04); hole.visible = false; hole.castShadow = false;
  const doorFrame = H2.g.children.filter((o) => o.isMesh && Math.abs(o.position.x - DOORX) < 0.01 && Math.abs(o.position.z - 0.02) < 0.01);
  const RD = rng(15), sidingM = H2.g.children.find((o) => o.isMesh && o.geometry.parameters && o.geometry.parameters.height === 2.75)?.material || mat(0xefe7d2, 0.9);
  const debris = Array.from({ length: 18 }, (_, i) => {
    const m = mk(new THREE.BoxGeometry(0.25 + RD() * 0.7, 0.08 + RD() * 0.2, 0.06), i % 4 === 0 ? mat(0xf2efe8, 0.6) : sidingM, burb.root, 0, -10, 0);
    return { m, p0: V3(DOORX + (RD() - 0.5) * 3.0, 0.5 + RD() * 2.4, WALLZ + 0.1), v: V3((RD() - 0.5) * 7, 2 + RD() * 5, 4 + RD() * 7), w: V3(RD() * 9, RD() * 7, RD() * 9) };
  });
  const DOOR_T = BOOM.door;
  /** where the flying butt is (cork pop): anchor [x, z], height above the landing pose, spin */
  function corkAt(t) {
    const a = t - DOOR_T, fly = 0.62;
    const u = clamp(a / fly), uu = sm(u);
    const x = lerp(DOORX, -2.0, uu), z = lerp(-9.15, -4.6, uu);
    const W = grow(t, DOOR_T, 3);
    const yLand = 0.565 * W, yStart = 1.3;
    const arc = 2.6 * Math.sin(u * PI);
    let y = lerp(yStart, yLand, uu) + arc;
    if (a > fly) y = yLand + Math.max(0, hop(t, DOOR_T + fly, 2.2));
    const yaw = PI + 0.25 * Math.sin(u * PI);
    return { x, z, y, W, yaw, landed: a > fly };
  }
  const BUS = makeBus({ sign: '42 DOWNTOWN' }); burb.root.add(BUS.g);
  const BUSX = 16, BUSZ = 1.7;
  const busStop = new THREE.Group(); busStop.position.set(BUSX + 3.5, SW_H, -0.6); burb.root.add(busStop);
  mk(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), mat(0x6a7480, 0.4), busStop, 0, 1.3, 0);
  { const s = mk(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c, w) => { c.fillStyle = '#2f6aa8'; c.fillRect(0, 0, w, w); c.fillStyle = '#fff'; c.font = 'bold 44px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS', w / 2, 46); c.fillText('42', w / 2, 92); }), toneMapped: false }), busStop, 0, 2.5, 0); s.rotation.x = PI / 2; }
  const busDriver = crowd[20];
  const SHN = 46, shards = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.012, 0.06), new THREE.MeshStandardMaterial({ color: 0xcfe6ff, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.85 }), SHN);
  shards.frustumCulled = false; scene.add(shards); shards.visible = false;
  const SHR = rng(4), shSeeds = Array.from({ length: SHN }, () => [SHR(), SHR(), SHR(), SHR()]);
  const BUS_ANCHOR = [BUSX, -3.1];

  // ================================================================ CITY — the butt blocks the intersection
  const TRAF_ANCHOR = [0, -9.0];
  // the signal pivots at its pole base so it can fall
  city.signal.children.forEach((o) => { o.position.x -= 4.6; o.position.z += 1.6; }); city.signal.position.set(4.6, 0, -1.6);
  const cars = [0xd2483f, 0xf5f0e2, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe08a3a, 0x2f3a4a].map((c, i) => { const car = makeCar(c, 60 + i); city.root.add(car.g); if (car.setLights) car.setLights(0); return car; });
  // drivers: a head behind each windshield
  const drivers = cars.map((c, i) => { const h = makeHead({ r: 0.11, skin: SKINS[i % SKINS.length], hair: HAIRS[i % HAIRS.length], hairStyle: STYLES[i % STYLES.length] }); c.g.add(h.g); h.g.position.set(-0.35, 1.18, 0.15); h.smile.visible = false; h.oMouth.visible = true; return h; });
  void drivers;
  const detour = new THREE.Group(); city.root.add(detour); detour.position.set(2.6, 0, 11.0);
  { const dt = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f08a1c'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.fillRect(8, 8, w - 16, h - 16); c.fillStyle = '#f08a1c'; c.fillRect(14, 14, w - 28, h - 28); c.fillStyle = '#111'; c.font = 'bold 52px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DETOUR', w / 2, 52); c.font = 'bold 40px Helvetica, Arial, sans-serif'; c.fillText('← →', w / 2, 98); });
    const panel = mk(new THREE.BoxGeometry(1.3, 0.65, 0.04), new THREE.MeshStandardMaterial({ map: dt, roughness: 0.6 }), detour, 0, 1.05, 0);
    void panel; for (const x of [-0.5, 0.5]) { const l = mk(new THREE.BoxGeometry(0.05, 1.0, 0.05), mat(0xf2efe8, 0.5), detour, x, 0.5, 0.15); l.rotation.x = -0.2; const l2 = mk(new THREE.BoxGeometry(0.05, 1.0, 0.05), mat(0xf2efe8, 0.5), detour, x, 0.5, -0.15); l2.rotation.x = 0.2; }
    for (const [x, z] of [[-1.6, 0.9], [-0.5, 1.4], [0.8, 1.6], [1.8, 1.1]]) { const cone = mk(new THREE.ConeGeometry(0.17, 0.55, 14), mat(0xf08a1c, 0.5), detour, x, 0.28, z); mk(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 14), mat(0xffffff, 0.5), cone, 0, 0.02, 0); }
  }
  /** a car: lane x, heading (+1 = +z), queue position; returns pose. Before the boom: queued/creeping, some U-turn out; after: bumped */
  function carAt(t, i) {
    const T = BOOM.traffic, a = t - T;
    // [x0, z0, heading, speed, uTurnAt | null]
    const C = [[2, 0.5, -1, 0, null], [2, 6.8, -1, 0.3, null], [2, 13.5, -1, 1.2, null], [-2, 3, 1, 4.5, null], [-2, -0.5, 1, 3.5, null], [2, 21, -1, 4.0, null], [-1.5, -1.4, 1, 0, 22.8], [-2, 9, 1, 5.0, null]][i];
    let x = C[0], z = C[1] + C[2] * C[3] * (t - 22.4), yaw = C[2] > 0 ? 0 : PI, rx = 0, rz = 0, y = 0;
    if (i === 1 || i === 2) z = Math.max(z, C[1] - (i === 1 ? 0.6 : 3.8));   // creep up behind the queue
    if (i === 5) z = Math.max(z, 14.6);
    if (C[4] !== null) { const u = sm(clamp((t - C[4]) / 1.6)); yaw = lerp(PI * 0.98, 0, u); x = lerp(1.6, -2.0, u); z = -1.4 + 2.5 * Math.sin(u * PI * 0.5) + Math.max(0, t - C[4] - 1.6) * 4; }
    if (i === 0 && a > 0) { // the front car: launched back toward the camera, tumbling
      const d = Math.min(a, 1.1); z = C[1] + 8.5 * d - 1.6 * d * d; y = Math.max(0, 4.2 * d - 4.9 * d * d) ; rx = -a * 3.2 * (a < 1.0 ? 1 : 0) - (a >= 1.0 ? 3.2 : 0); rz = 0.4 * Math.min(a, 1);
      if (a > 1.1) { z = C[1] + 8.5 * 1.1 - 1.6 * 1.21; rx = -PI; y = 0.75; }
    }
    if (i === 1 && a > 0.15) { const d = a - 0.15; z = C[1] - 0.6 + Math.min(d, 0.5) * 3.5; rz = -0.25 * Math.exp(-d * 3) * Math.sin(d * 18); }
    if (i === 6 && a > 0) { const d = a; x += 0; rz = 0.3 * Math.exp(-d * 2) * Math.sin(d * 14); }
    return { x, y, z, yaw, rx, rz };
  }

  // ================================================================ POOL — the sit-down splash
  const POOL_ANCHOR = [0, -10.5];
  const swimmers = [0, 1, 2, 3, 4, 5].map((i) => crowd[i]);
  const SW_SPOTS = [[-6, -3.6], [-2, 1.2], [3, -1.2], [7, 3.6], [-8.5, 3.0], [5, -4.4]];
  const towerG = pool.root.children.find((o) => o.isGroup && Math.abs(o.position.x - PO.tower[0]) < 0.01 && Math.abs(o.position.z - PO.tower[1]) < 0.01);
  const lifeguard = crowd[6];
  const crownTex = canvasTex(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(225,244,255,.95)'); gr.addColorStop(1, 'rgba(150,210,245,.9)'); c.fillStyle = gr; c.beginPath(); c.moveTo(0, h); const r = rng(41); for (let x = 0; x <= w; x += 16) c.lineTo(x, 20 + r() * 120 * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.05)))); c.lineTo(w, h); c.fill(); for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(r() * w, r() * 60, 3 + r() * 7, 0, 7); c.fill(); } });
  crownTex.wrapS = THREE.RepeatWrapping; crownTex.repeat.set(4, 1);
  const crown = mk(new THREE.CylinderGeometry(1, 1.15, 1, 64, 1, true), new THREE.MeshStandardMaterial({ map: crownTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.2, emissive: 0x9fd0ee, emissiveIntensity: 0.25 }), pool.root, 0, 0, 0);
  crown.castShadow = false; crown.visible = false;
  const RS = rng(23), spray = Array.from({ length: 36 }, () => [RS(), RS(), RS()]);

  // ================================================================ FLIGHT — denim mountains above the clouds; a jet banks around them
  const jet = makeJet(); flight.root.add(jet.g); jet.g.scale.setScalar(1.6);
  /** jet path: from the left, banking hard right in front of the domes, passing the camera */
  const J0 = V3(460, 120, -620), J1 = V3(-40, 120, -520), J2 = V3(-110, 35, 70);
  const bez = (u) => V3(0, 0, 0).addScaledVector(J0, (1 - u) * (1 - u)).addScaledVector(J1, 2 * u * (1 - u)).addScaledVector(J2, u * u);
  function jetAt(t) {
    const u = clamp((t - 31.6) / 4.8), p = bez(u), q = bez(Math.min(1, u + 0.01)).sub(bez(Math.max(0, u - 0.01)));
    const yaw = Math.atan2(q.x, q.z), bank = 1.15 * Math.sin(clamp((u - 0.15) / 0.75) * PI);
    return { p, yaw, bank, u };
  }

  // ================================================================ SPACE — ISS (root ×10) and the Moon (root ×1)
  const iss = makeISS(); scene.add(iss.g); iss.g.visible = false; iss.g.scale.setScalar(0.4);
  const RE = space.R;   // 400 (planet units)
  const SUNN = V3(1000, 250, 300).normalize();                                   // the sub-solar point (camera ground point for the ISS shot)
  const FC = new THREE.Vector3().crossVectors(new THREE.Vector3().crossVectors(SUNN, V3(0, 1, 0)), SUNN).normalize().negate();   // tangent "forward"
  const NB = SUNN.clone().multiplyScalar(Math.cos(0.24)).addScaledVector(FC, Math.sin(0.24)).addScaledVector(new THREE.Vector3().crossVectors(FC, SUNN).normalize(), -0.035).normalize();   // where the butt sits
  const FB = FC.clone().multiplyScalar(Math.cos(0.24)).addScaledVector(SUNN, -Math.sin(0.24)).normalize();  // away from the camera, at the butt
  const _bm = new THREE.Matrix4();
  /** quaternion whose +y = up, +z as close to `front` as possible */
  function basisQ(up, front) { const U = up.clone().normalize(), F = front.clone().addScaledVector(U, -front.dot(U)).normalize(), X = new THREE.Vector3().crossVectors(U, F); _bm.makeBasis(X, U, F); return new THREE.Quaternion().setFromRotationMatrix(_bm); }
  /** world position of a point on/above the Earth (space root scale s): dir (unit), altitude (planet units) */
  const spaceW = (dir, alt, s) => dir.clone().multiplyScalar((RE + alt) * s).add(V3(...OFF.space));

  // ================================================================ STREET — the crowd + their phones
  const streetSky = street.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.material.side === THREE.BackSide);
  if (streetSky) { streetSky.material.depthWrite = false; streetSky.renderOrder = -1; }
  const phoneTex = canvasTex(128, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5f9be0'); gr.addColorStop(1, '#bfe0f6'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = DENIM; for (const x of [44, 84]) { c.beginPath(); c.arc(x, 150, 34, 0, 7); c.fill(); } c.fillStyle = '#e0a347'; c.fillRect(26, 108, 76, 6); c.fillStyle = '#d23a3f'; c.beginPath(); c.arc(20, 20, 8, 0, 7); c.fill(); });
  const phones = Array.from({ length: 14 }, () => { const ph = makePhone(); ph.screenMat.map = phoneTex; ph.screenMat.emissiveMap = phoneTex; ph.screenMat.emissive.setHex(0xffffff); ph.screenMat.emissiveIntensity = 0.9; ph.screenMat.color.setHex(0x000000); scene.add(ph.g); ph.g.visible = false; return ph; });
  const CROWD_SPOTS = Array.from({ length: 14 }, (_, i) => { const row = Math.floor(i / 5), col = i % 5; return [1.3 - row * 1.2 + ((i * 37) % 5) * 0.08, 2.0 + col * 0.75 + (row % 2) * 0.37]; });

  // ---------------------------------------------------------------- per-frame
  function hideAll() {
    all.forEach((r) => { r.root.visible = false; r.root.rotation.set(0, 0, 0); r.root.scale.setScalar(1); r.headG.visible = true; });
    puffs.hide(); stars.forEach((s) => (s.visible = false)); starN = puffN = 0;
    dog.g.visible = false; mug.visible = false; butt.g.visible = false; camBody.visible = false; flashS.visible = false;
    beltBits.forEach((b) => (b.visible = false)); BUS.g.visible = false; flyButton.visible = false; shards.visible = false; iss.g.visible = false;
    phones.forEach((p) => (p.g.visible = false));
    jolts.length = 0;
  }
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (cur !== S) {
      Object.entries(ROOTS).forEach(([k, r]) => (r.visible = k === S));
      scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.5 : 0.05; studio.camera.updateProjectionMatrix();
      cur = S;
    }
    studio.fill.intensity = S === 'bed' || S === 'kit' ? 0.9 : S === 'space' ? (cam === 'iss' ? 1.6 : 0.7) : 0.45;
    hideAll(); studio.camera.up.set(0, 1, 0);
    let camOverride = null;
    { const D = DBG[cam] || [0, 0, 30], o = OFF[S]; story.debugView = { center: [o[0] + D[0], 0, o[2] + D[1]], height: D[2] }; }   // --cam top follows the shot

    if (cam === 'sleep' || cam === 'wake') {
      const w = cam === 'wake';
      clockFace.material.map = !w ? (t < 3.0 ? clockTexs.a : clockTexs.b) : (t < BOOM.wake ? clockTexs.b : clockTexs.c);
      const wakeK = w ? K(t, [[50.25, 0], [50.5, 1], [51.9, 1], [52.4, 0.2]]) : 0;
      const mouth = w ? (t < 51.9 ? 'o' : 'smile') : 'flat';
      prone(t, w && t > BOOM.wake ? 0.8 : wakeK, w && t > BOOM.wake ? 'o' : mouth);
      const W = w ? grow(t, BOOM.wake, 0) : WM(0);
      wear(gary, W); butt.setSquash(w ? squash(t, BOOM.wake) : 0);
      dogOnButt(t, W, w ? BOOM.wake : -1);
      if (w) { impact(t, BOOM.wake, butt.g.localToWorld(V3(0, -0.3, -0.45)), 0.6); jolts.push([BOOM.wake, 0.02]); }
      lampG.rotation.z = w ? 0.25 * Math.exp(-Math.max(0, t - BOOM.wake) * 3) * Math.sin((t - BOOM.wake) * 14) * (t > BOOM.wake ? 1 : 0) : 0;
    } else if (cam === 'stand') {
      clockFace.material.map = clockTexs.b;
      const T = BOOM.stand, a = t - T;
      const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'smile';
      Object.assign(p, { x: 0.45, z: 0.25, rotY: PI });
      const stretch = K(t, [[3.5, 0], [3.9, 1], [4.7, 1], [5.1, 0]]);
      p.armA = { ...A(-2.9, 0.35, -0.35), free: 0 }; p.armB = { ...A(-2.9, 0.35, -0.35), free: 0 };
      if (stretch < 1) { const r = 1 - stretch; p.armA = A(lerp(-2.9, 0.2, r), lerp(0.35, 0.5, r), lerp(-0.35, -1.6, r), 0.6 * r); p.armB = A(lerp(-2.9, 0.2, r), lerp(0.35, 0.5, r), lerp(-0.35, -1.6, r), -0.6 * r); }
      p.mouth = stretch > 0.5 ? 'o' : 'smile'; p.eyes = stretch > 0.5 ? 'closed' : p.eyes; p.lean = -0.08 * stretch;
      if (t > 5.1) { p.armA = A(0.2, 0.5, -1.6, 0.6); p.armB = A(0.2, 0.5, -1.6, -0.6); }   // hands on hips
      if (a > 0) {
        p.mouth = 'o'; p.eyes = 'open'; p.y = Math.max(0, hop(t, T, 1.3)); p.lean = 0.12;
        p.armA = A(-0.9, 1.25, -0.25); p.armB = A(-0.9, 1.25, -0.25);
        p.headYaw = -1.15 * K(t, [[T + 0.35, 0], [T + 0.7, 1]]); p.headPitch = 0.25 * K(t, [[T + 0.35, 0], [T + 0.7, 1]]);
        if (a > 1.2) { p.armA = A(0.1, 0.35, -1.5, 0.5); p.armB = A(-0.5, 0.4, -0.6); }
      }
      show(gary, 'bed', p);
      wear(gary, grow(t, T, 0)); butt.setSquash(squash(t, T) + 0.03 * Math.sin(t * 3));
      gary.root.updateMatrixWorld(true);
      impact(t, T, butt.g.localToWorld(V3(0, -0.3, -0.4)), 0.7, { up: 0.05 }); jolts.push([T, 0.022]);
      // the dog on the bed: sits, then barks + hops at the boom
      dog.g.visible = true; dog.setLie(t < T ? 0.6 : 0); dog.g.position.copy(W3('bed', -0.25, B.top - 0.03 + Math.max(0, hop(t, T + 0.1, 1.6)), -1.25)); dog.g.rotation.set(0, 0.7, 0);
      dog.update(t, 0); dog.setWag(t > T ? 22 : 9); dog.bark(a > 0.2 ? Math.max(0, Math.sin((a - 0.2) * 16)) : 0);
      lampG.rotation.z = a > 0 ? 0.3 * Math.exp(-a * 3) * Math.sin(a * 14) : 0;
    } else if (cam === 'kitchen') {
      const p = garyKitchen(t); show(gary, 'kit', p);
      const T = BOOM.kitchen, a = t - T;
      const W = grow(t, T, 1); wear(gary, W); butt.setSquash((t > KIT_SIT - 0.1 ? 0.25 : 0) + squash(t, T) + (t > KIT_SIT - 0.1 && t < T ? 0.08 * Math.sin((t - KIT_SIT) * 9) : 0));
      butt.setBelt(t < T + 0.05);
      gary.root.updateMatrixWorld(true);
      // chair: whole until the boom, then every part flies
      chairParts.forEach((c) => { if (a <= 0) { c.m.position.copy(c.p0); c.m.rotation.copy(c.r0); return; } const d = Math.min(a, 1.4); c.m.position.set(c.p0.x + c.v.x * d, Math.max(0.03, c.p0.y + c.v.y * d - 4.9 * d * d), c.p0.z + c.v.z * d); c.m.rotation.set(c.r0.x + c.w.x * d, c.r0.y + c.w.y * d, c.r0.z + c.w.z * d); });
      // belt snaps into two whipping pieces; the button shoots across the table
      if (a > 0) {
        const w0 = butt.g.localToWorld(V3(0, -0.035, 0.1));
        beltBits.forEach((b, k) => { const d = Math.min(a, 1.0); b.visible = true; b.position.set(w0.x + (k ? 1 : -1) * 0.5 * d, Math.max(0.03, w0.y + 1.6 * d - 4.9 * d * d), w0.z + (k ? 0.8 : -0.4) * d); b.rotation.set(d * 9, d * (k ? 7 : -6), d * 5); });
        const d = Math.min(a, 0.55); flyButton.visible = true; flyButton.position.set(w0.x - 4.5 * d, w0.y + 1.2 * d - 3 * d * d, w0.z + 0.3 * d); flyButton.rotation.set(a * 20, a * 13, 0);
        if (a > 0.55) flyButton.position.set(w0.x - 2.47, 0.79, w0.z + 0.17);
        impact(t, T + 0.55, V3(w0.x - 2.47, 0.85, w0.z + 0.17), 0.25, { n: 3 });
      }
      // the mug: in hand until the boom, then a flip onto the table
      mug.visible = true;
      if (a < 0) { const h = gary.arms[1].hand.getWorldPosition(V3(0, 0, 0)); mug.position.copy(h).add(V3(0, -0.03, 0)); mug.rotation.set(0, 0, 0); }
      else { const d = Math.min(a, 0.7), h0 = W3('kit', 1.25, 1.05, -0.35), h1 = W3('kit', 0.85, 0.755, -0.25); mug.position.set(lerp(h0.x, h1.x, d / 0.7), Math.max(h1.y, h0.y + 2.0 * d - 4.9 * d * d), lerp(h0.z, h1.z, d / 0.7)); mug.rotation.set(0, 0, a < 0.7 ? a * 9 : 0); }
      impact(t, T, W3('kit', 1.55, 0.25, -0.4), 0.9, { up: 0.04 }); jolts.push([T, 0.02]);
    } else if (cam === 'door') {
      burb.aimSun(-2, -6, 12);
      const T = BOOM.door, a = t - T;
      H2.door.rotation.y = 1.45; H2.porchRoof.rotation.z = a > 0.15 ? -0.42 * sm(clamp((a - 0.15) / 0.35)) : 0;
      hole.visible = a > 0; doorFrame.forEach((m) => (m.visible = a <= 0)); H2.door.visible = a <= 0.02;
      debris.forEach((d) => { if (a <= 0) { d.m.position.y = -10; return; } const k = Math.min(a, 1.6), y = d.p0.y + d.v.y * k - 4.9 * k * k; d.m.position.set(d.p0.x + d.v.x * k, Math.max(0.05, y), d.p0.z + d.v.z * k); d.m.rotation.set(d.w.x * k, d.w.y * k, d.w.z * k); });
      if (a <= 0) {
        // stuck: Gary faces into the house (his upper body is inside the wall); his butt is jammed in the doorway; two neighbors push
        const tug = Math.max(0, Math.sin((t - 12.6) * 6.5));
        const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'o';
        Object.assign(p, { x: DOORX, z: -9.15 - 0.04 * tug, rotY: PI, y: 0.3, floor: 0.3 }); p.lean = 0.3;
        p.armA = A(-2.5, 0.6, -0.2); p.armB = A(-2.5, 0.6, -0.2); p.footFwd = 0.12 * Math.sin(t * 9);
        show(gary, 'burb', p);
        const W = WM(3) * (1 + 0.025 * tug); wear(gary, W); butt.setSquash(0.18 + 0.1 * tug);
        [0, 1].forEach((k) => { const n = basePose(); n.eyes = (t * 1.3 + k) % 2 < 1.5 ? blink(t, 7 + k) : 'closed'; n.mouth = k ? 'o' : 'flat';
          Object.assign(n, { x: DOORX + (k ? 1.05 : -1.05), z: -7.25 - 0.05 * tug, rotY: PI + (k ? 0.55 : -0.55), y: 0.3, floor: 0.3 });
          n.lean = 0.45 + 0.08 * tug; n.footFwd = -0.25; n.armA = A(-1.55, 0.25, -0.15 - 0.2 * (1 - tug)); n.armB = A(-1.55, 0.25, -0.15 - 0.2 * (1 - tug)); show(crowd[8 + k], 'burb', n); }); 
        jolts.push([12.6, 0.02]); impact(t, 12.6, W3('burb', DOORX, 1.2, -7.9), 0.9, { up: 0.05 });
        for (let k = 0; k < 4; k++) jolts.push([12.6 + 0.62 + k * 0.97, 0.004]);
      } else {
        const c = corkAt(t);
        const y = landmark('burb', c.x, c.z, c.yaw, c.W, { lift: c.y - 0.565 * c.W, t, mouth: 'o', armA: A(-2.6, 0.7, -0.2), armB: A(-2.6, 0.7, -0.2), headYaw: c.landed ? -1.4 * sm(clamp((a - 0.9) / 0.4)) : 0 });
        butt.setSquash(c.landed ? squash(t, T + 0.62) * 1.3 : -0.15);
        gary.root.rotation.z = c.landed ? 0 : 0.35 * Math.sin(a * 8);
        void y;
        // neighbors knocked back onto the porch
        [0, 1].forEach((k) => { const n = basePose(); n.eyes = 'closed'; n.mouth = 'o'; const fall = sm(clamp(a / 0.35)); Object.assign(n, { x: DOORX + (k ? 1.05 : -1.05) * (1 + 0.8 * fall), z: -7.25 - 0.3 * fall, rotY: PI + (k ? 0.55 : -0.55) + (k ? 1 : -1) * 1.2 * fall, y: 0.3 - 0.45 * fall, floor: 0.3, footFwd: 0.42 * fall }); n.armA = A(-1.8, 1.0, -0.3); n.armB = A(-1.8, 1.0, -0.3); n.lean = -0.4 * fall; show(crowd[8 + k], 'burb', n); });
        impact(t, T, W3('burb', DOORX, 1.4, -8.2), 2.4, { up: 0.1 }); impact(t, T + 0.62, W3('burb', c.x, 0.4, c.z + 2.6), 3.2, { up: 0.05, n: 8 });
        jolts.push([T, 0.03], [T + 0.62, 0.025]);
      }
      // the dog barking on the lawn
      dog.g.visible = true; dog.g.position.copy(W3('burb', -0.7, 0, -5.6 - (a > 0 ? Math.min(a, 0.6) * 4 : 0))); dog.g.rotation.set(0, a > 0 ? 0.3 : -2.6, 0); dog.update(t, a > 0 && a < 0.6 ? 1.5 : 0); dog.bark(Math.max(0, Math.sin(t * 13)));
    } else if (cam === 'bus') {
      burb.aimSun(BUSX, -2, 16);
      const T = BOOM.bus, a = t - T;
      BUS.g.visible = true;
      const arrive = clamp((t - 17.8) / 1.9), bx = BUSX + 28 * (1 - sm(arrive));
      BUS.g.position.set(bx, 0, BUSZ); BUS.g.rotation.y = -PI / 2;
      const crush = a > 0 ? sm(clamp(a / 0.18)) : 0;
      BUS.setSag(crush); BUS.body.scale.set(1 + 0.08 * crush, 1 - 0.6 * crush, 1 + 0.03 * crush); BUS.body.position.y = -0.3 * crush;
      BUS.wheels.forEach((w, i) => { w.rotation.x = (i % 2 ? 1 : -1) * 0.5 * crush; });
      BUS.setSign(a > 0.45 ? 'NOT IN SERVICE' : '42 DOWNTOWN');
      const W = grow(t, T, 4);
      landmark('burb', BUS_ANCHOR[0], BUS_ANCHOR[1], PI, W, { t, mouth: a > 0 ? 'o' : 'smile', headYaw: t < T ? 0.9 : 0.2, armA: A(-0.3, 0.6, -0.4), armB: t < T ? A(-2.4, 0.4, -0.3, 0.3 * Math.sin(t * 8)) : A(-0.3, 0.6, -0.4) });
      butt.setSquash(squash(t, T) * 1.2 + (a > 0.3 ? 0.08 : 0));
      // the driver hops out before the bus is a chair
      { const n = basePose(); n.eyes = blink(t, 9); n.mouth = 'o'; const run = clamp((t - 19.5) / 2.9); Object.assign(n, { x: BUSX - 4.5 + 5.5 * run * run, z: 3.3 + 1.6 * run, rotY: PI / 2 - 0.4, dist: run * 9, speed: t > 19.5 ? 3.0 : 0 }); n.armA = A(-2.4, 0.4, -0.4); n.armB = A(-2.4, 0.4, -0.4); if (t > 19.5) show(busDriver, 'burb', n); }
      // glass + dust
      if (a > 0 && a < 1.4) { shards.visible = true; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = V3(1, 1, 1), v = V3(0, 0, 0);
        shSeeds.forEach(([s1, s2, s3, s4], i) => { const ang = s1 * PI * 2, sp = 2 + s2 * 4; v.set(OFF.burb[0] + BUSX + (s4 - 0.5) * 10 + Math.cos(ang) * sp * a, Math.max(0.02, 1.8 + (2 + s3 * 3) * a - 4.9 * a * a), OFF.burb[2] + BUSZ + Math.abs(Math.sin(ang)) * sp * a); q.setFromEuler(e3.set(a * 9 * s3, a * 7 * s4, a * 5)); m4.compose(v, q, sc); shards.setMatrixAt(i, m4); });
        shards.instanceMatrix.needsUpdate = true; }
      impact(t, T, W3('burb', BUSX, 1.2, BUSZ + 1.3), 4.0, { up: 0.06, n: 9 }); jolts.push([T, 0.03]);
      for (let k = 0; k < 3; k++) impact(t, T + 0.08 * k, W3('burb', BUSX - 4 + 4 * k, 0.4, BUSZ + 1.6), 2.0, { noStar: true, n: 3 });
      // a neighbor on the far sidewalk, phone up
      { const n = basePose(); n.eyes = blink(t, 11); Object.assign(n, { x: BUSX - 7.6, z: 8.6, rotY: PI + 0.35, y: SW_H, floor: SW_H }); n.mouth = 'o'; n.armB = A(-1.9, 0.2, -1.2, -0.3); show(crowd[12], 'burb', n); }
    } else if (cam === 'traffic') {
      city.setShadowFocus && city.setShadowFocus(0, -2, 22);
      const T = BOOM.traffic, a = t - T;
      const W = grow(t, T, 5);
      landmark('city', TRAF_ANCHOR[0], TRAF_ANCHOR[1], PI, W, { t, mouth: 'o', armA: A(-0.2, 0.7, -0.4), armB: A(-0.2, 0.7, -0.4), headYaw: 0.5 * Math.sin(t * 1.3) });
      butt.setSquash(squash(t, T) * 1.2);
      cars.forEach((c, i) => { const q = carAt(t, i); c.g.position.set(q.x, q.y, q.z); c.g.rotation.set(q.rx, q.yaw, q.rz, 'YXZ'); c.g.visible = true; });
      city.signal.rotation.z = a > 0.1 ? -1.25 * sm(clamp((a - 0.1) / 0.7)) : 0;
      // the cop waves traffic around
      { const n = basePose(); n.eyes = blink(t, 5); Object.assign(n, { x: 4.4, z: 8.0, rotY: -PI / 2 + 0.5, y: 0.14, floor: 0.14 }); n.mouth = a > 0 ? 'o' : 'flat';
        n.armB = A(-2.5 + 0.5 * Math.sin(t * 7), 0.9, -0.2); n.armA = A(-1.4, 0.2, -0.3);
        if (a > 0) { n.lean = -0.3; n.armA = A(-2.6, 0.6, -0.2); n.armB = A(-2.6, 0.6, -0.2); }
        show(cop, 'city', n); }
      for (let k = 0; k < 3; k++) { const n = basePose(); n.eyes = blink(t, 14 + k); Object.assign(n, { x: -4.5 - k * 0.3, z: 9 + k * 1.5, rotY: PI - 0.2, y: 0.14, floor: 0.14 }); n.mouth = 'o'; n.armB = A(-1.9, 0.2, -1.2, -0.3); n.headPitch = -0.35; show(crowd[13 + k], 'city', n); }
      impact(t, T, W3('city', 0, 1.0, 1.5), 6, { up: 0.04, n: 10 }); impact(t, T + 0.75, W3('city', 2.2, 0.4, 7.2), 2.2, { n: 4 }); jolts.push([T, 0.028], [T + 0.75, 0.01]);
    } else if (cam === 'pool') {
      pool.update(t);
      const T = BOOM.pool, a = t - T;
      const W = grow(t, T, 6);
      const drop = a < 0 ? 16 * (1 - sm(clamp((t - 27.0) / (T - 27.0)))) : 0;
      landmark('pool', POOL_ANCHOR[0], POOL_ANCHOR[1], PI, W, { ground: PO.water - 0.4, lift: drop, t, mouth: a > 0 ? 'o' : 'smile', armA: A(-2.5, 0.6, -0.3), armB: A(-2.5, 0.6, -0.3) });
      butt.setSquash(squash(t, T) * 1.3);
      pool.water.visible = a < 0.25;
      crown.visible = a > 0 && a < 2.3;
      if (crown.visible) { const k = Math.min(1, a / 0.5), r = 10 + 6 * (1 - (1 - k) * (1 - k)) + a * 1.5, h = Math.max(0.1, 13 * Math.sin(Math.min(1, a / 1.3) * PI * 0.5) - Math.max(0, a - 1.2) * 11); crown.scale.set(r * 1.35, h, r * 0.55); crown.position.set(0, PO.water + h / 2, -1.5); }
      swimmers.forEach((rig, i) => {
        const [sx, sz] = SW_SPOTS[i], p = basePose(); p.eyes = blink(t, i); p.mouth = 'o';
        if (a < 0.05) { Object.assign(p, { x: sx, z: sz, rotY: PI + 0.3 * (i % 2 ? 1 : -1), y: PO.water - 1.45 + 0.04 * Math.sin(t * 3 + i) }); p.floor = p.y - 2.5; p.headPitch = -0.55; p.armA = A(-2.4, 0.5, -0.3, 0.3 * Math.sin(t * 6 + i)); p.armB = A(-2.4, 0.5, -0.3); show(rig, 'pool', p); }
        else { const d = a, C = [sx + (sx > 0 ? 1 : -1) * (2 + i * 0.4) * d, PO.water + Math.max(-0.5, (9 + i) * d - 4.9 * d * d), sz + (6 + i * 0.8) * d]; p.armA = A(-2.6, 1.2, -0.3); p.armB = A(-2.6, 1.2, -0.3); showC(rig, 'pool', p, C, PI + i, -0.6 - d * 2.2 * (i % 2 ? 1 : -1), 0.4 * i); }
      });
      if (towerG) { towerG.rotation.x = a > 0.15 ? 1.2 * sm(clamp((a - 0.15) / 0.8)) : 0; }
      { const n = basePose(); n.eyes = blink(t, 30); n.mouth = a > 0 ? 'o' : 'flat'; const tip = towerG ? towerG.rotation.x : 0; const L = W3('pool', PO.tower[0], 0, PO.tower[1]); void L;
        if (a < 0.2) { Object.assign(n, { x: PO.tower[0], z: PO.tower[1] - 0.05, rotY: PI, y: 2.04 - SIT, footFwd: 0.42, floor: 2.04 - 0.45 }); n.headPitch = -0.6; n.armB = A(-1.0, 0.2, -1.6, -0.5); show(lifeguard, 'pool', n); }
        else { const d = a - 0.2; showC(lifeguard, 'pool', n, [PO.tower[0] + 0.3, Math.max(0.6, 2.6 + 4 * d - 4.9 * d * d), PO.tower[1] + 2.5 * Math.min(d, 1)], PI, -0.6 - tip, 0.3); } }
      // the water erupts: a ring of white spray rising + falling everywhere
      if (a > 0) { for (let i = 0; i < spray.length && puffN < puffs.items.length; i++) { const [s1, s2, s3] = spray[i], ang = (-0.15 + 1.3 * s1) * PI, d = a * (1.0 + s3 * 0.4), r = 8 + 12 * s2 * Math.min(1, a * 1.4), h = Math.max(0, (10 + s3 * 14) * d - 5 * d * d);
          puffs.set(puffN++, W3('pool', Math.cos(ang) * r * 1.7, h + 0.6, 6 + Math.abs(Math.sin(ang)) * r * 0.55), 0.8 + 1.4 * s2 + a * 0.9, 0.85 * Math.max(0, 1 - a / 2.4), WATER); } }
      jolts.push([T, 0.035]); impact(t, T, W3('pool', -4, 3, 9), 3, { color: WATER, up: 0.2, n: 4 });
    } else if (cam === 'flight') {
      flight.setDrift((t - 31.6) * 25);
      const w = t < BOOM.fly1 ? 1 : t < BOOM.fly2 ? 2 * (grow(t, BOOM.fly1, 0) / WM(0)) / 2 : 2 * grow(t, BOOM.fly2, 0) / WM(0);
      const Wd = 260 * w;   // displayed size (a cheat: ~1/45 scale so it sits inside the fog)
      flyButt.setWidth(Wd); flyButt.g.position.set(0, -75 + 0.565 * Wd - 0.18 * Wd, -1050); flyButt.g.rotation.set(0, PI, 0); flyButt.g.visible = true;
      flyButt.setSquash(t > BOOM.fly2 ? squash(t, BOOM.fly2) : squash(t, BOOM.fly1));
      const J = jetAt(t); jet.g.position.copy(J.p); jet.g.rotation.set(0, J.yaw, -J.bank, 'YXZ');
      jet.g.updateMatrixWorld(true);
      for (let k = 1; k <= 26 && puffN < puffs.items.length - 1; k++) { const uu = J.u - k * 0.012; if (uu < 0) break; const c = bez(uu).add(V3(...OFF.flight)); for (const sd of [-1, 1]) puffs.set(puffN++, c.clone().add(V3(sd * 7 * Math.cos(J.yaw), -2, -sd * 7 * Math.sin(J.yaw))), 3 + k * 1.4, 0.7 * (1 - k / 27), new THREE.Color(0xffffff)); }
      jolts.push([BOOM.fly1, 0.012], [BOOM.fly2, 0.018]);
    } else if (cam === 'iss' || cam === 'moon') {
      const isI = cam === 'iss', s = isI ? 10 : 1;
      space.root.scale.setScalar(s); space.setSpin(0.6 + t * 0.004);
      if (isI) {
        // sunlit: the camera floats above the sub-solar point at ISS height looking along F; the butt sits 0.34 rad ahead on the horizon
        const T = BOOM.iss, wk = t < T ? 1 : grow(t, T, 0) / WM(0);
        const Wp = 23.7 * wk;   // 377 km → 755 km in planet units (6371 km = 400)
        spaceButt.setWidth(Wp); spaceButt.g.position.copy(NB).multiplyScalar(RE + 0.565 * Wp - 0.2 * Wp); spaceButt.g.quaternion.copy(basisQ(NB, FB));
        spaceButt.g.visible = true; moon.visible = false; spaceButt.setSquash(squash(t, T));
        const P = spaceW(SUNN, 27, s), fwd = FC.clone().multiplyScalar(Math.cos(-0.27)).addScaledVector(SUNN, Math.sin(-0.27)).normalize();
        const right = new THREE.Vector3().crossVectors(fwd, SUNN).normalize();
        const aim = P.clone().addScaledVector(fwd, 100);
        iss.g.visible = true; iss.g.position.copy(P).addScaledVector(fwd, 60).addScaledVector(right, -20).addScaledVector(SUNN, 14); iss.g.quaternion.copy(basisQ(SUNN, right)); iss.g.rotateX(0.35);
        // the astronaut: 3.6 m ahead, faces us (3/4), then turns to the butt, raises a camera, flash
        const ap = basePose(); ap.eyes = blink(t, 6); ap.mouth = t > 38.9 ? 'o' : 'smile';
        const turn = K(t, [[38.9, 0], [39.5, 1]]), fl = 0.05 * Math.sin(t * 1.3);
        ap.armA = A(-0.9 + 0.3 * Math.sin(t * 1.1), 0.6, -0.5); ap.armB = A(-2.2, 0.3, -0.3, 0.4 * Math.sin(t * 5));   // waves at us
        if (t > 38.9) ap.armB = A(-0.9, 0.3, -0.6);
        if (t > 39.6) { ap.armA = A(-1.45, 0.15, -1.35, 0.6); ap.armB = A(-1.45, 0.15, -1.35, -0.6); }
        ap.x = 0; ap.z = 0; ap.y = 0; ap.rotY = 0; ap.floor = -2.5; applyPose(astro, ap);
        const front = FC.clone().negate().applyAxisAngle(SUNN, lerp(-0.45, PI - 0.35, turn));
        const q = basisQ(SUNN, front), C = P.clone().addScaledVector(fwd, 3.8).addScaledVector(right, 0.85).addScaledVector(SUNN, -0.5 + fl);
        astro.root.quaternion.copy(q); astro.root.position.copy(C).sub(V3(0, HC, 0).applyQuaternion(q)); astro.root.visible = true;
        astro.root.updateMatrixWorld(true);
        if (t > 39.6) { camBody.visible = true; const h1 = astro.arms[0].hand.getWorldPosition(V3(0, 0, 0)), h2 = astro.arms[1].hand.getWorldPosition(V3(0, 0, 0)); camBody.position.copy(h1).add(h2).multiplyScalar(0.5); camBody.quaternion.copy(q); }
        const fa = t - 40.1; if (fa > 0 && fa < 0.35) { flashS.visible = true; flashS.position.copy(camBody.position).addScaledVector(front, 0.15); flashS.scale.setScalar(1.6 * (1 - fa / 0.35) + 0.4); flashS.material.opacity = 1 - fa / 0.35; }
        jolts.push([T, 0.012]);
        studio.camera.far = 30000; studio.camera.updateProjectionMatrix();
        camOverride = { P: [P.x, P.y, P.z], A: [aim.x, aim.y, aim.z], fov: 50 }; studio.camera.up.copy(SUNN);
      } else {
        const T = BOOM.moon, wk = t < T ? 1 : grow(t, T, 0) / WM(0);
        const Wp = 189.6 * wk;   // 3,020 km → 6,040 km in planet units
        spaceButt.setWidth(Wp); spaceButt.g.position.set(0, RE + 0.565 * Wp - 0.06 * Wp, 0); spaceButt.g.rotation.set(0, PI, 0); spaceButt.g.visible = true;
        spaceButt.setSquash(squash(t, T) * 0.8);
        moon.visible = true; moon.position.set(320, 790, 40); moon.rotation.y = t * 0.02;
        jolts.push([T, 0.012]);
      }
    } else if (cam === 'crowdA' || cam === 'crowdB') {
      street.aimSun && street.aimSun(0, 6, 14);
      const isA = cam === 'crowdA', up = K(t, [[41.5, 0], [41.9, 1]]), phoneUp = K(t, [[42.1, 0], [42.35, 1]]);
      CROWD_SPOTS.forEach(([x, z], i) => {
        const rig = crowd[4 + i] || crowd[i], p = basePose(); p.eyes = blink(t, i); const dly = (i % 5) * 0.04;
        Object.assign(p, { x, z, rotY: PI / 2 + ((i * 13) % 7 - 3) * 0.05 });
        p.headPitch = -0.55 * K(t, [[41.5 + dly, 0], [41.9 + dly, 1]]); p.mouth = up > 0.5 ? 'o' : 'smile';
        const pu = K(t, [[42.1 + dly, 0], [42.35 + dly, 1]]);
        p.armB = A(lerp(0.03, -2.35, pu), lerp(0.07, 0.15, pu), lerp(-0.18, -0.55, pu), -0.2 * pu); p.armA = REST;
        if (!isA && t > BOOM.crowd + 0.1) { p.armA = A(-2.6, 0.5, -0.3); }
        show(rig, 'street', p);
        if (pu > 0.05) { rig.root.updateMatrixWorld(true); const h = rig.arms[1].hand.getWorldPosition(V3(0, 0, 0)); const ph = phones[i]; ph.g.visible = true; ph.g.position.copy(h).add(V3(0, 0.07, 0)); ph.g.rotation.set(-PI / 2 + 0.5, p.rotY, 0, 'YXZ'); }
      });
      void phoneUp;
      if (!isA) {
        const wk = t < BOOM.crowd ? 1 : grow(t, BOOM.crowd, 0) / WM(0);
        const Wd = 800 * wk;
        skyButt.setWidth(Wd); skyButt.g.position.set(1700, 0.745 * Wd, 3.5); skyButt.g.rotation.set(0, PI / 2, 0); skyButt.g.visible = true;
        scene.fog = crowdFog;
        skyButt.setSquash(squash(t, BOOM.crowd));
        studio.camera.far = 3200; studio.camera.updateProjectionMatrix();
        jolts.push([BOOM.crowd, 0.02]);
      } else { skyButt.g.visible = false; scene.fog = streetFog; studio.camera.far = FAR.street; studio.camera.updateProjectionMatrix(); }
    }

    // ---------------------------------------------------------------- camera (keys in set-local coords) + angular jolts
    let P, Aim, fov;
    if (camOverride) { P = camOverride.P; Aim = camOverride.A; fov = camOverride.fov; }
    else {
      const c = CAMS[cam], ks = c.keys, o = OFF[S];
      let i = 0; while (i < ks.length - 1 && t > ks[i + 1][0]) i++;
      const k0 = ks[i], k1 = ks[Math.min(i + 1, ks.length - 1)];
      const u = k1 === k0 ? 0 : clamp((t - k0[0]) / (k1[0] - k0[0])), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = k0[1].map((v, j) => lerp(v, k1[1][j], e) + o[j]); Aim = k0[2].map((v, j) => lerp(v, k1[2][j], e) + o[j]); fov = c.fov;
    }
    const dist = Math.hypot(Aim[0] - P[0], Aim[1] - P[1], Aim[2] - P[2]);
    for (const [m, k0] of jolts) if (t > m && t < m + 0.6) { const k = k0 * Math.exp(-(t - m) * 7) * dist; Aim = [Aim[0] + k * Math.sin(t * 61 + m), Aim[1] + k * Math.sin(t * 53 + m * 2), Aim[2] + k * 0.5 * Math.sin(t * 67)]; P = [P[0] + k * 0.15 * Math.sin(t * 47), P[1] + k * 0.15 * Math.sin(t * 59), P[2]]; }
    setCamera(P, Aim, fov, t, S === 'space' || S === 'flight' ? 0 : 0.004);
  }
  return { update };
}
