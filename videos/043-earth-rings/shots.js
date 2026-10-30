// VIDEO 043 — "What if Earth had rings like Saturn?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 65.4 s. A tour of the sky under the rings, latitude by latitude, then what the rings do to the ground (shadow, seasons,
// orbits), a 466-million-year-old ring that scientists propose, and a wedding under the arch.
// NEW: engine/rings.js (the rings drawn honestly from any latitude by a ray-cast sky shader; space rings + their shadow on
// Earth). Reused: plaza.js (Quito), tech.js space + launch, street.js (New York), city.js rooftop (Tokyo), suburb.js (Ohio
// at night), pool.js (Miami), classroom.js, wedding.js (Tuscany).
//
// MODEL (stated so a reviewer can check every number): Saturn's MAIN rings scaled by planet radius (Saturn 60,268 km → Earth
// 6,371 km): C ring 1.239–1.527 R, B ring 1.527–1.951 R, Cassini Division to 2.027 R, A ring to 2.269 R = 7,894 → 14,456 km
// from Earth's centre (1,520 → 8,085 km up), 6,560 km wide, in the equatorial plane, made of ice (Saturn's are ~95 % water ice).
//  • Why rings and not a moon: inside the Roche limit, tides pull a loose body apart faster than it can clump. For Earth the
//    fluid Roche limit is ~18,400 km for Moon-density rock and ~28,000 km for ice (d = 2.44 R (ρ⊕/ρ)^⅓); the whole ring sits
//    inside both → "Ice too close to clump into a moon."
//  • Saturn's main rings are ~275,000 km across but typically only ~10 m thick (NASA; Eos) → HUD of the space beat.
//  • Optical depths are round Cassini-era values (C ≈ 0.1, B 1–3, Cassini Division ≈ 0.1, A ≈ 0.5; Cuzzi et al. 2009,
//    "Saturn from Cassini-Huygens" ch. 15). Opacity seen along a ray = 1 − e^(−τ/μ); the lit face's brightness ∝ 1 − e^(−τ/μ0),
//    μ0 = sin(the Sun's height above the ring plane) = sin(declination) → the rings are brightest at the solstices and nearly
//    dark at the equinoxes (as Saturn's are). In the northern summer the north sees the LIT face, so every northern sky beat
//    is set in JULY (dec +21°); Earth's shadow on the rings and the rings' shadow on the ground are ray-cast with the same model.
//  • The sky shader ray-casts the ring plane from the observer (engine/rings.js), so every arch is the real geometry: Quito
//    (we place the lens 0.1° N of the plane: rounds to 0.0°) sees the rings edge-on as a hairline through the zenith; New York
//    (40.7° N) an arch up to 25.9° high; Tokyo (35.7°) up to 32.5°; Ohio (39.9°) ~27°; Tuscany (43.3°) 22.7°; Miami (25.8°) a
//    band 12°–46.5° high. A truly 10 m-thick ring seen exactly edge-on would vanish; 0.1° off the plane it is a ~0.5° band.
//  • Shadow: on Dec 21 (dec −23.44°) Miami's noon sunbeam crosses the ring plane at 1.90 R = the B ring → transmission
//    e^(−τ/μ0) ≈ 0.1 % all day (9 AM–3 PM: 0.07–0.13 %). New York gets 35 %, Tokyo 25 % (A ring). Six months later the same
//    happens south of the equator (Rio 0.2 %). The winter hemisphere's subtropics sit in the shadow → "winter strip".
//  • Orbits: anything that crosses the ring plane between 1,520 and 8,085 km altitude hits ring ice twice per orbit. The ISS
//    (~420 km) and Starlink (~550 km) pass under the inner edge; GPS (20,200 km) and geostationary (35,786 km) are outside.
//    "Sandblasted" is the cartoon of hypervelocity ice impacts (km/s relative speeds); no damage rate is claimed.
//  • Shooting stars: Cassini measured Saturn's rings raining onto Saturn (thousands of kg/s; O'Donoghue et al. 2019, Waite et
//    al. 2018). Inner-edge ice would likewise spiral in and burn up: we show more meteors but print no rate.
//  • Ringshine: the lit B ring has an albedo ~0.5 and covers a patch of sky thousands of times the Moon's, so even the part out of
//    Earth's shadow outshines a full Moon (Moon: albedo 0.12, 0.2 square degrees). The part of the arch inside Earth's shadow
//    goes dark at night — the shader shows that gap.
//  • The past ring: Tomkins, Martin & Cawood 2024, Earth and Planetary Science Letters 646, 118991: all 21 known Ordovician
//    impact craters (~466 Ma) lie within ~30° of the equator; the authors PROPOSE a debris ring from an asteroid broken up
//    inside the Roche limit, and speculate its shadow contributed to the Hirnantian cooling ("may have chilled the planet").
//
// Shot list (seconds)                   | set     | what happens
//  0.0– 3.2 title                       | plaza   | a tourist's face, looking straight up, slow push
//  3.2– 5.6 space                       | space   | ringed Earth from orbit, the rings' shadow on the south
//  5.6– 7.6 ice                         | ice     | skimming 2 m over the ring's ice, Earth's limb huge ahead
//  7.6–10.4 quitoUp   LAT 0.0°          | plaza   | from among the tourists, up at the hairline through the zenith
// 10.4–13.4 quitoLine                   | plaza   | down the painted equator: the line on the ground meets the line in the sky
// 13.4–16.3 nycFaces  40.7° N           | street  | a sidewalk crowd looks south, phones up, a hot-dog vendor
// 16.3–19.6 nycArch                     | street  | over their shoulders: the arch over the avenue, a taxi driver leans out
// 19.6–22.4 tokyoFaces 35.7° N          | city    | rooftop crowd lit by sunset
// 22.4–25.4 tokyoArch                   | city    | time-lapse: Earth's shadow slides across the arch over downtown
// 25.4–28.3 night     39.9° N           | suburb  | a kid on the porch drawing the arch by ringshine, dad beside him
// 28.3–31.4 nightSky                    | suburb  | over his sketchbook: the real arch + shooting stars, he points
// 31.4–34.1 miamiPool NOON SUNLIGHT     | pool    | bright July pool, kids splash, the lit band in the south
// 34.1–38.0 miamiDark                   | pool    | time-lapse to December: the sun slides behind the B ring, everyone in towels
// 38.0–41.6 swap      SUN ±23.4°        | space   | Dec → Jun: the rings' shadow slides from north to south
// 41.6–43.2 launchFaces                 | launch  | beach crowd watching a launch, faces lit
// 43.2–44.6 launchArch                  | launch  | the rocket climbing in front of the arch
// 44.6–47.6 sats                        | space   | Starlink dots glide under the ring; a higher satellite crosses the ring plane: sandblasted
// 47.6–51.0 classBoard                  | class   | teacher at a chalk ringed Earth, "466 MILLION YEARS AGO", kids lean in
// 51.0–52.8 ancient                     | space   | an Ordovician Earth with a debris ring, streaks falling near the equator
// 52.8–55.0 classCold                   | class   | kids shiver, snow outside the windows
// 55.0–58.2 wedArch   43.3° N           | wedding | guests look up at the arch over the ceremony
// 58.2–65.4 wedKiss                     | wedding | the kiss, ring hands up, petals; fade 60.9 (depth 0.35), end card 61.2
import * as THREE from 'three';
import { clamp, lerp, smooth, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { buildPlaza } from '@engine/sets/plaza.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildCity, ROOF_Y, makeCar } from '@engine/sets/city.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildSpace, buildLaunch, makeSpritePool, makeFalcon, makeSatellite } from '@engine/sets/tech.js';
import { nightSkyTexture } from '@engine/sets/lagoon.js';
import { makeRingSky, makeSpaceRings, sunECEF, ringTransmit, RIN, ROUT } from '@engine/rings.js';

const PI = Math.PI, DEG = PI / 180, KS = 0.62, JUL = 21;
const OFF = { city: [0, 0, 0], plaza: [3000, 0, 0], street: [6000, 0, 0], sub: [9000, 0, 0], pool: [12000, 0, 0], wed: [15000, 0, 0],
  cls: [18000, 0, 0], launch: [40000, 0, 0], space: [-30000, 0, 0], ice: [-50000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.2, cam: 'title', set: 'plaza' },
  { t0: 3.2, t1: 5.6, cam: 'space', set: 'space' },
  { t0: 5.6, t1: 7.6, cam: 'ice', set: 'ice' },
  { t0: 7.6, t1: 10.4, cam: 'quitoUp', set: 'plaza' },
  { t0: 10.4, t1: 13.4, cam: 'quitoLine', set: 'plaza' },
  { t0: 13.4, t1: 16.3, cam: 'nycFaces', set: 'street' },
  { t0: 16.3, t1: 19.6, cam: 'nycArch', set: 'street' },
  { t0: 19.6, t1: 22.4, cam: 'tokyoFaces', set: 'city' },
  { t0: 22.4, t1: 25.4, cam: 'tokyoArch', set: 'city' },
  { t0: 25.4, t1: 28.3, cam: 'night', set: 'sub' },
  { t0: 28.3, t1: 31.4, cam: 'nightSky', set: 'sub' },
  { t0: 31.4, t1: 34.1, cam: 'miamiPool', set: 'pool' },
  { t0: 34.1, t1: 36.0, cam: 'miamiSky', set: 'pool' },
  { t0: 36.0, t1: 38.0, cam: 'miamiDark', set: 'pool' },
  { t0: 38.0, t1: 41.6, cam: 'swap', set: 'space' },
  { t0: 41.6, t1: 43.2, cam: 'launchFaces', set: 'launch' },
  { t0: 43.2, t1: 44.6, cam: 'launchArch', set: 'launch' },
  { t0: 44.6, t1: 47.6, cam: 'sats', set: 'space' },
  { t0: 47.6, t1: 49.4, cam: 'classBoard', set: 'cls' },
  { t0: 49.4, t1: 51.0, cam: 'classKids', set: 'cls' },
  { t0: 51.0, t1: 52.8, cam: 'ancient', set: 'space' },
  { t0: 52.8, t1: 55.0, cam: 'classCold', set: 'cls' },
  { t0: 55.0, t1: 58.2, cam: 'wedArch', set: 'wed' },
  { t0: 58.2, t1: 65.4, cam: 'wedKiss', set: 'wed' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends; armB −twist = inward)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CHEER = A(-2.75, 0.4, -0.25, 0);
const POINT_UP_B = A(-2.55, 0.25, -0.1, 0), POINT_UP_A = A(-2.55, 0.25, -0.1, 0);
const PHONE_B = A(-1.75, 0.2, -1.05, -0.35), PHONE_A = A(-1.75, 0.2, -1.05, 0.35);
const SHADE_B = A(-2.2, 0.55, -2.1, -0.6);
const HUG_A = A(-1.0, 0.25, -2.05, 0.95), HUG_B = A(-1.0, 0.25, -2.05, -0.95);
const LAP_A = A(-0.75, 0.15, -1.2, 0.5), LAP_B = A(-0.75, 0.15, -1.2, -0.5);
const DRAW_B = A(-0.9, 0.2, -1.35, -0.45);
const HAND_UP_B = A(-2.9, 0.15, -0.2, 0);
const BOARD_B = A(-1.6, 0.35, -0.15, 0);
const HOLD_A = A(-1.05, 0.12, -0.55, 0.25), HOLD_B = A(-1.05, 0.12, -0.55, -0.25);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const clapA = (t, k = 1) => A(-1.15, 0.32 + 0.18 * k * Math.max(0, Math.sin(t * 13)), -1.45, 0.55);
const clapB = (t, k = 1) => A(-1.15, 0.32 + 0.18 * k * Math.max(0, Math.sin(t * 13)), -1.45, -0.55);
const pulse = (t, a, up = 0.15, hold = 0.4, down = 0.4) => smooth(clamp((t - a) / up)) * (1 - smooth(clamp((t - a - up - hold) / down)));
const shiver = (t, k) => k * 0.035 * Math.sin(t * 47);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob'];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xd9cdb4];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  const plaza = buildPlaza(studio, {}); plaza.root.position.set(...OFF.plaza);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const sub = buildSuburb(studio, { poleClear: [-14, -10, -6, -3, 0, 3, 6, 10] }); sub.root.position.set(...OFF.sub);
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls);
  const launch = buildLaunch(studio, {}); launch.root.position.set(...OFF.launch); launch.setMode('island', 'day');
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ice = new THREE.Group(); ice.position.set(...OFF.ice); scene.add(ice);
  const ROOTS = { city: city.root, plaza: plaza.root, street: street.root, sub: sub.root, pool: pool.root, wed: wed.root, cls: cls.root, launch: launch.root, space: space.root, ice };
  const FOGS = { city: cityFog, plaza: plaza.fog, street: streetFog, sub: sub.fog, pool: pool.fog, wed: wed.fog, cls: null, launch: launch.fog, space: null, ice: null };
  const FAR = { city: 1500, plaza: 1150, street: 420, sub: 420, pool: 330, wed: 300, cls: 60, launch: 2100, space: 6000, ice: 4000 };
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  // every day set's sky dome stops writing depth, so the ring sky (drawn after the opaque pass) can sit beyond it
  const domes = {};
  for (const [k, r] of Object.entries(ROOTS)) r.traverse((o) => { if (o.isMesh && o.material && o.material.side === THREE.BackSide && o.geometry.parameters && o.geometry.parameters.radius >= 100) { o.material.depthWrite = false; o.renderOrder = -3; (domes[k] = domes[k] || []).push(o); } });
  city.setTime({ day: 1, golden: 1 });

  // ---------------------------------------------------------------- the ring sky (one camera-centred sphere, re-aimed per set)
  const ringSky = makeRingSky(); scene.add(ringSky.mesh);
  // local east + up of each set (world directions); south = the way the arch hangs
  const EAST = { plaza: [1, 0, 0], street: [0, 0, 1], city: [-1, 0, 0], sub: [1, 0, 0], pool: [-1, 0, 0], launch: [-1, 0, 0], wed: [-1, 0, 0] };
  const RR = { plaza: 1100, street: 400, city: 1300, sub: 400, pool: 310, launch: 2000, wed: 285 };
  const UP = new THREE.Vector3(0, 1, 0);
  const sky = (key, latDeg, dec, hour, o = {}) => ringSky.set({ lat: latDeg * DEG, sun: sunECEF(dec, hour), E: new THREE.Vector3(...EAST[key]), U: UP, gain: o.gain ?? 1, haze: o.haze ?? 0xdfe8f0, opacity: o.opacity ?? 1 });

  // ---------------------------------------------------------------- shared FX
  const puffs = makeSpritePool(scene, 120, 'smoke'), sparks = makeSpritePool(scene, 120, 'fire');
  let np = 0, ns = 0;
  const puff = (pos, size, op, col) => { if (np < 120) puffs.set(np++, pos, size, op, col); };
  const spark = (pos, size, op, col) => { if (ns < 120) sparks.set(ns++, pos, size, op, col); };
  const NC = 360, confM = new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide });
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.04), confM, NC); conf.frustumCulled = false; scene.add(conf);
  const PETAL_C = [0xffffff, 0xf6c9d6, 0xf2a7bd, 0xfff0d8].map((h) => new THREE.Color(h));
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), S3 = new THREE.Vector3();
  let nc = 0;
  const burst = (o, t, at, n = 200, vy = 4, spread = 2.5) => {
    const age = t - at; if (age < 0 || age > 5) return;
    for (let k = 0; k < n && nc < NC; k++) {
      const a = k * 2.399, r = spread * (0.3 + 0.7 * ((k * 0.618) % 1)), v = vy * (0.5 + 0.5 * ((k * 0.37) % 1));
      const ta = Math.min(age, v / 9.81 * 0.9), drift = Math.max(0, age - ta);
      const p = new THREE.Vector3(o.x + Math.cos(a) * r * ta * 0.6 + 0.2 * Math.sin(age * 3 + k), o.y + v * ta - 4.9 * ta * ta - drift * (0.45 + 0.15 * (k % 3)), o.z + Math.sin(a) * r * ta * 0.6);
      if (p.y < o.y - 3) p.y = o.y - 3;
      M4.compose(p, Q4.setFromEuler(E3.set(age * 5 + k, age * 4 + k * 2, k)), S3.setScalar(1)); conf.setColorAt(nc, PETAL_C[k % 4]); conf.setMatrixAt(nc++, M4);
    }
  };
  // meteors / falling streaks: camera-facing quads stretched along their path (bright head, fading tail)
  const streakTex = canvasTex(256, 16, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(220,235,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; const r = h / 2; g.beginPath(); g.moveTo(0, r); g.lineTo(w - r, 1); g.arc(w - r, r, r - 1, -PI / 2, PI / 2); g.lineTo(0, r); g.fill(); });
  const streaks = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: streakTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false })); m.frustumCulled = false; m.renderOrder = 4; scene.add(m); m.visible = false; return m; });
  let nk = 0;
  const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _m = new THREE.Matrix4();
  /** a streak whose head is at `head`, moving along `dir`, `len` long, `w` wide, opacity op (needs the camera position) */
  const streak = (head, dir, len, w, op, cam, col = 0xdfeaff) => {
    if (nk >= streaks.length || op <= 0) return; const m = streaks[nk++];
    _x.copy(dir).normalize(); _z.copy(cam).sub(head).normalize(); _y.crossVectors(_z, _x).normalize(); _z.crossVectors(_x, _y);
    _m.makeBasis(_x, _y, _z); m.quaternion.setFromRotationMatrix(_m); m.scale.set(len, w, 1);
    m.position.copy(head).addScaledVector(_x, -len / 2); m.material.opacity = op; m.material.color.set(col); m.visible = true;
  };
  let shake = [0, 0];
  const jolt = (t, at, k0 = 0.03, rate = 6) => { if (t > at && t < at + 1) { const k = k0 * Math.exp(-(t - at) * rate); shake = [shake[0] + k * Math.sin(t * 71), shake[1] + k * Math.sin(t * 53)]; } };

  // ---------------------------------------------------------------- cast helpers
  const R = rng(43);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.root.visible = false; return p; };
  const civ = (o = {}) => { const st = pick(STYLES); return person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: st, glasses: R() < 0.2, mustache: st !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null, ...o }); };
  const kidRig = (o = {}) => civ({ headR: 0.175, glasses: false, mustache: null, ...o });
  /** pose a rig: (x,z) local to the set; y = root height, floor = ground under the feet; s = scale (kids 0.62) */
  function put(rig, key, p, o = {}) {
    const y = o.y ?? 0, floor = o.floor ?? 0, s = o.s ?? 1;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    if (s === 1) { p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1]; applyPose(rig, p); }
    else { p.y = 0; p.floor = (floor - y) / s; applyPose(rig, p); rig.root.scale.setScalar(s); rig.root.position.y = y + OFF[key][1]; }
    rig.root.rotation.set(-(o.back ?? 0), p.rotY, o.roll ?? 0, 'YXZ');
    rig.root.visible = true;
  }
  const seatKid = (rig, key, p, seat, ground = 0) => { const rootY = seat - KS * (HIP_H - 0.07); p.footFwd = 0.42; put(rig, key, p, { y: rootY, floor: Math.max(rootY + 0.42 * KS, ground), s: KS }); };
  const seatAdult = (rig, key, p, seat) => { p.footFwd = 0.42; put(rig, key, p, { y: seat - 0.795 }); };
  const hand = (rig, side) => { rig.root.updateMatrixWorld(true); return rig.arms.find((a) => a.s === side).hand.getWorldPosition(new THREE.Vector3()); };
  const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const look = (p, up) => { p.headPitch = -up; return p; };
  // phones (a dark slab with a lit screen) that follow a hand
  const phoneM = mat(0x1c1c22, 0.35), screenM = new THREE.MeshBasicMaterial({ color: 0x9fc4ff, toneMapped: false });
  const phones = Array.from({ length: 8 }, () => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.075, 0.15, 0.01), phoneM, g); mk(new THREE.PlaneGeometry(0.066, 0.135), screenM, g, 0, 0, -0.0055).rotation.y = PI; scene.add(g); g.visible = false; return g; });
  let nph = 0;
  const phoneIn = (rig, side = 1, aimAt = null) => { if (nph >= phones.length) return; const g = phones[nph++], h = hand(rig, side); g.position.copy(h); g.position.y += 0.06; if (aimAt) g.lookAt(aimAt); else g.rotation.set(0, rig.root.rotation.y + PI, 0); g.visible = true; };

  // ================================================================ PLAZA (Quito): title + the hairline overhead
  const tourist = person({ skin: 0xc98e6a, top: 0xe58fa6, pants: 0x45607a, hair: 0x2a1d16, hairStyle: 'bob' });
  const hatM = mat(0xe8d6a8, 0.9);
  const sunhat = new THREE.Group(); tourist.head.g.add(sunhat); sunhat.position.set(0, 0.1, 0);
  mk(new THREE.CylinderGeometry(0.24, 0.26, 0.02, 24), hatM, sunhat, 0, 0, 0); mk(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 20), hatM, sunhat, 0, 0.05, 0); mk(new THREE.CylinderGeometry(0.141, 0.141, 0.025, 20), mat(0xd2483f, 0.7), sunhat, 0, 0.015, 0);
  const plazaCrowd = Array.from({ length: 12 }, (_, i) => civ({ top: CASUAL[(i * 3) % CASUAL.length] }));
  const qKid = kidRig({ skin: 0xc98e6a, top: 0xf2b632, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'messy' });
  const qDad = person({ skin: 0xc98e6a, top: 0x3d7bd9, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  // ring-up crowd for the look-up shot: a circle of faces round the lens
  const UPC = [[0.82, 0.2], [0.55, 1.35], [-0.35, 2.3], [-0.9, 3.35], [0.2, 4.4], [0.85, 5.4]];
  function plazaScene(t, cam) {
    plaza.aimSun(0, 0, 18);
    sky('plaza', 0.1, JUL, 12.4, { haze: 0xe6eef4 });
    plaza.jets && plaza.jets.forEach && 0;
    const crowdPose = (rig, i, x, z, ry, up, o = {}) => { const p = basePose(); p.eyes = blink(t, 20 + i); Object.assign(p, { x, z, rotY: ry + 0.06 * Math.sin(t * 0.7 + i) }); look(p, up + 0.04 * Math.sin(t * 1.1 + i)); p.mouth = i % 3 === 0 ? 'o' : 'smile'; if (o.armB) p.armB = o.armB; if (o.armA) p.armA = o.armA; put(rig, 'plaza', p); };
    if (cam === 'title') {
      const p = basePose(); p.eyes = blink(t, 2); Object.assign(p, { x: 0.15, z: 1.2, rotY: 0.25 }); look(p, 0.75 + 0.05 * Math.sin(t * 0.8)); p.mouth = t > 1.4 ? 'o' : 'smile';
      p.armB = mixArm(REST, POINT_UP_B, smooth(clamp((t - 1.5) / 0.5))); put(tourist, 'plaza', p);
      plazaCrowd.slice(0, 6).forEach((rig, i) => crowdPose(rig, i, -1.25 + i * 0.55 + (i % 2) * 0.15, -0.15 - (i % 3) * 0.6, 0.2 * Math.sin(i * 2.1), 0.65, i % 2 ? { armB: PHONE_B } : { armB: mixArm(REST, CHEER, 0.5 + 0.5 * Math.sin(t * 4 + i)), armA: mixArm(REST, CHEER, 0.5 + 0.5 * Math.sin(t * 4 + i + 1.5)) }));
      plazaCrowd.slice(0, 6).forEach((rig, i) => { if (i % 2) phoneIn(rig, 1); });
      const u = smooth(clamp(t / 3.2));
      return { P: [lerp(1.2, 0.35, u), lerp(1.36, 1.44, u), lerp(2.95, 2.4, u)], A: [0.12, lerp(1.9, 1.95, u), 1.15], fov: 46 };
    }
    if (cam === 'quitoUp') {
      // a circle of tourists round the lens, chins up; the lens tilts up to the hairline overhead
      const FC = [[-0.55, 0.0, 0.25], [0.15, -0.25, -0.1], [0.75, 0.1, -0.35], [-0.2, -0.9, 0.1], [0.5, -1.0, -0.2], [-0.9, -0.8, 0.4]];
      FC.forEach(([x, z, ry], i) => crowdPose(plazaCrowd[i], i, x, z, ry, 1.0 - 0.05 * (i % 2), i === 1 ? { armB: POINT_UP_B } : i === 4 ? { armB: PHONE_B } : i === 2 ? { armA: CHEER } : {}));
      phoneIn(plazaCrowd[4], 1, W('plaza', 0.5, 30, -1));
      const u = smooth(clamp((t - 7.6) / 2.8));
      return { P: [lerp(0.25, 0.1, u), lerp(2.15, 2.25, u), lerp(1.75, 1.55, u)], A: [0.05, lerp(1.25, 1.35, u), -0.6], fov: 50 };
    }
    // quitoLine: down the painted equator line toward the east horizon; the sky's line comes down to meet it
    const u = smooth(clamp((t - 10.4) / 3.0));
    const lineup = [[3.0, 0.5, -0.3], [4.4, -0.6, 0.4], [5.6, 0.9, 2.6], [7.4, -0.8, -0.2], [9.0, 0.6, 0.3], [10.8, -1.1, 2.9]];
    lineup.forEach(([x, z, ry], i) => crowdPose(plazaCrowd[6 + i], 6 + i, x, z, ry, 0.95, i === 1 ? { armB: POINT_UP_B } : i === 4 ? { armA: CHEER, armB: CHEER } : {}));
    { const p = basePose(); p.eyes = blink(t, 9); Object.assign(p, { x: 2.0, z: 0.05, rotY: -0.5 }); look(p, 0.6); p.armA = HOLD_A; p.armB = HOLD_B; put(qDad, 'plaza', p); }
    { const p = basePose(); p.eyes = blink(t, 10); const reach = 0.5 + 0.5 * Math.sin(t * 3.1); Object.assign(p, { x: 2.0, z: 0.05, rotY: -0.5 }); look(p, 1.0); p.armB = mixArm(POINT_UP_B, HAND_UP_B, reach); p.armA = mixArm(CHEER, HAND_UP_B, 1 - reach); p.footFwd = 0.2; p.mouth = 'o';
      put(qKid, 'plaza', p, { y: 1.42 + 0.03 * Math.sin(t * 6), floor: 1.42 - 0.3, s: KS }); qKid.root.position.y = OFF.plaza[1] + 1.25 + 0.03 * Math.sin(t * 6); }
    return { P: [lerp(-0.6, 0.0, u), lerp(1.05, 1.15, u), lerp(0.35, 0.3, u)], A: [12, lerp(6.5, 9.5, u), 0.0], fov: 66 };
  }

  // ================================================================ SPACE: ringed Earth, the swap, satellites, the ancient ring
  const SC = W('space', 0, 0, 0), ER = space.R;
  const rings = makeSpaceRings(ER, { gain: 0.82 }); rings.setCenter(SC); scene.add(rings.ring, rings.shell);
  let sunDisc = null; space.root.traverse((o) => { if (o.isSprite) sunDisc = o; });
  const SUN0 = new THREE.Vector3(1000, 250, 300).normalize(), SUN_AZ = Math.atan2(SUN0.z, SUN0.x);
  function setSpaceSun(decDeg) {
    const d = decDeg * DEG, v = new THREE.Vector3(Math.cos(d) * Math.cos(SUN_AZ), Math.sin(d), Math.cos(d) * Math.sin(SUN_AZ));
    space.sun.position.copy(v).multiplyScalar(1074); space.sun.target.position.set(0, 0, 0);
    space.lights.material.uniforms.uSun.value.copy(v); space.atm.material.uniforms.uSun.value.copy(v);
    if (sunDisc) sunDisc.position.copy(v).multiplyScalar(2100);
    rings.setSun(v);
    return v;
  }
  const swarm = space.makeStarlinkSwarm(900, 34); swarm.pts.visible = false;
  const sat = makeSatellite(); sat.g.scale.setScalar(9); scene.add(sat.g); sat.g.visible = false;
  const satBits = Array.from({ length: 10 }, (_, i) => { const m = mk(new THREE.BoxGeometry(0.5 + (i % 3) * 0.3, 0.12, 0.8), i % 2 ? mat(0x1a2a50, 0.3, { metalness: 0.6 }) : mat(0xd8d8d4, 0.4, { metalness: 0.5 }), scene); m.visible = false; return m; });
  // the Ordovician ring: lumpy debris, not Saturn's tidy bands
  const NDEB = 2600, debris = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xc8beb2, roughness: 0.95, flatShading: true }), NDEB);
  debris.frustumCulled = false; scene.add(debris); debris.visible = false;
  { const Rd = rng(466); for (let i = 0; i < NDEB; i++) { const a = Rd() * PI * 2, r = ER * (1.3 + 0.45 * Math.pow(Rd(), 0.8)), y = (Rd() - 0.5) * 14; M4.compose(new THREE.Vector3(SC.x + Math.cos(a) * r, y, SC.z + Math.sin(a) * r), Q4.setFromEuler(E3.set(Rd() * 6, Rd() * 6, Rd() * 6)), S3.setScalar(3 + Rd() * 8)); debris.setMatrixAt(i, M4); } }
  const earthC0 = space.earth.material.color.clone();
  function spaceScene(t, cam) {
    const cp = studio.camera.position;
    space.earth.material.color.copy(earthC0); rings.ring.visible = true; rings.shell.visible = true; rings.U.uGain.value = cam === 'sats' ? 0.6 : 0.82;
    if (sunDisc) sunDisc.visible = cam !== 'space';   // the camera swings past it: a white disc filled the frame at 5 s
    if (cam === 'space') {
      setSpaceSun(JUL); space.setSpin(1.6 + t * 0.12);
      const u = smooth(clamp((t - 3.2) / 2.4)), a = lerp(0.95, 0.3, u), d = lerp(3900, 2500, u), el = lerp(0.55, 0.3, u);
      return { P: [Math.cos(a) * d * Math.cos(el), Math.sin(el) * d, Math.sin(a) * d * Math.cos(el)], A: [0, lerp(-40, 0, u), 0], fov: 40 };
    }
    if (cam === 'swap') {
      const k = smooth(clamp((t - 38.2) / 3.0)); setSpaceSun(lerp(-23.44, 23.44, k)); space.setSpin(2.6 + t * 0.04);
      const u = smooth(clamp((t - 38.0) / 3.6)), a = 0.5 + 0.06 * u, d = lerp(3000, 2750, u), el = 0.1;
      return { P: [Math.cos(a) * d * Math.cos(el), Math.sin(el) * d, Math.sin(a) * d * Math.cos(el)], A: [0, -10, 0], fov: 40 };
    }
    if (cam === 'sats') {
      setSpaceSun(JUL); space.setSpin(1.3 + t * 0.03);
      swarm.pts.visible = true; swarm.update(t * 3);
      // a satellite at ~4,000 km altitude (1.63 R) on an inclined orbit: it climbs through the ring plane at T_HIT
      const T_HIT = 45.9, ang = 0.3, r = ER * 1.63, cross = new THREE.Vector3(SC.x + Math.cos(ang) * r, 0, SC.z + Math.sin(ang) * r);
      const vel = new THREE.Vector3(-Math.sin(ang) * 0.75, 0.66, Math.cos(ang) * 0.75).multiplyScalar(16);
      const dt = t - T_HIT, hit = dt > 0;
      sat.g.visible = true; sat.g.position.copy(cross).addScaledVector(vel, dt);
      if (!hit) spark(sat.g.position.clone(), 26, 0.55, new THREE.Color(0xfff6e0));   // a glint so the eye finds it
      sat.g.rotation.set(0.3 + (hit ? dt * 2.2 : 0), ang + (hit ? dt * 3.1 : 0), 0.2 + (hit ? dt * 1.4 : 0));
      if (hit) {
        satBits.forEach((m, i) => { const dir = new THREE.Vector3(Math.sin(i * 2.3), 0.4 + 0.5 * Math.cos(i * 1.7), Math.cos(i * 3.1)).normalize(); m.position.copy(sat.g.position).addScaledVector(dir, dt * (12 + 4 * (i % 4))); m.scale.setScalar(4); m.rotation.set(dt * (2 + i), dt * 3, i); m.visible = true; });
        for (let k = 0; k < 26; k++) { const a = k * 2.399, rr = 0.6 + (k % 5) * 0.5, age = dt * 1.6 - (k % 7) * 0.08; if (age > 0 && age < 1.2) spark(sat.g.position.clone().add(new THREE.Vector3(Math.cos(a) * rr * 4 * (0.4 + age), Math.sin(k * 1.3) * rr * 2.4, Math.sin(a) * rr * 4 * (0.4 + age))), 4 + 6 * (1 - age), 0.9 * (1 - age / 1.2), new THREE.Color(k % 3 ? 0xfff2c8 : 0xbfe6ff)); }
      }
      // ring ice hits it on the way in: tiny flashes in the half second before
      if (dt > -0.5 && dt < 0.1) for (let k = 0; k < 6; k++) { const ph = Math.sin(t * 40 + k * 1.7); if (ph > 0.6) spark(sat.g.position.clone().add(new THREE.Vector3(Math.sin(k * 3) * 8, Math.cos(k * 2) * 5, Math.sin(k * 5) * 8)), 3.5, 0.9, new THREE.Color(0xffffff)); }
      jolt(t, T_HIT, 2.5, 5);
      const u = smooth(clamp((t - 44.6) / 3.0));
      const rad = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), tan = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang));
      const camP = cross.clone().addScaledVector(rad, lerp(330, 300, u)).addScaledVector(tan, lerp(160, 140, u)).add(new THREE.Vector3(0, lerp(48, 42, u), 0));
      const aim = cross.clone().lerp(sat.g.position, 0.5).addScaledVector(rad, -60).add(new THREE.Vector3(0, -10, 0));
      return { P: [camP.x - SC.x, camP.y, camP.z - SC.z], A: [aim.x - SC.x, aim.y, aim.z - SC.z], fov: 46 };
    }
    // ancient: the Ordovician Earth (a whiter, icier tint) with a lumpy debris ring; streaks falling toward the equator
    setSpaceSun(12); space.setSpin(0.6 + t * 0.05);
    space.earth.material.color.set(0xb8c6d6); rings.ring.visible = false; rings.shell.visible = false; debris.visible = true;
    for (let k = 0; k < 7; k++) { const ph = ((t * 0.9 + k / 7) % 1), a = 0.5 + k * 0.33, r = lerp(ER * 1.3, ER * 1.02, ph); const head = new THREE.Vector3(SC.x + Math.cos(a) * r, (k % 3 - 1) * 18 * (1 - ph), SC.z + Math.sin(a) * r); streak(head, new THREE.Vector3(-Math.cos(a), -0.05 * (k % 3 - 1), -Math.sin(a)).add(new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.6)), 140, 12, 0.95 * Math.sin(ph * PI), cp, 0xffd8a0); }
    const u = smooth(clamp((t - 51.0) / 1.8)), a = lerp(0.2, 0.35, u), d = lerp(1700, 1550, u), el = 0.28;
    return { P: [Math.cos(a) * d * Math.cos(el), Math.sin(el) * d, Math.sin(a) * d * Math.cos(el)], A: [0, -20, 0], fov: 40 };
  }

  // ================================================================ ICE: skimming the ring
  const IR = 1000, IC = new THREE.Vector3(0, 0, -1600);   // ring units: 1 = 6.4 km; we fly at rho 1.6 (the B ring)
  const iceEarth = mk(new THREE.SphereGeometry(IR, 128, 64), space.earth.material, ice, IC.x, IC.y, IC.z); iceEarth.rotation.y = 2.2;
  const iceClouds = mk(new THREE.SphereGeometry(IR * 1.008, 96, 48), space.clouds.material, ice, IC.x, IC.y, IC.z);
  const iceAtm = mk(new THREE.SphereGeometry(IR * 1.035, 96, 48), space.atm.material, ice, IC.x, IC.y, IC.z);
  void iceClouds; void iceAtm;
  const iceRings = makeSpaceRings(IR, { gain: 0.5 }); iceRings.setCenter(W('ice', IC.x, IC.y, IC.z)); scene.add(iceRings.ring); iceRings.shell.visible = false;
  iceRings.setSun(SUN0);
  const iceSun = new THREE.DirectionalLight(0xfff6e8, 3.0); iceSun.position.copy(SUN0).multiplyScalar(500); ice.add(iceSun, iceSun.target);
  ice.add(new THREE.HemisphereLight(0x9ab4e0, 0x202030, 0.5));
  { const SG = new THREE.BufferGeometry(), sp = [], Rs = rng(9); for (let i = 0; i < 3000; i++) { const u = Rs() * 2 - 1, a = Rs() * PI * 2, s = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * s * 3500, u * 3500, Math.sin(a) * s * 3500); } SG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); ice.add(new THREE.Points(SG, new THREE.PointsMaterial({ size: 2.2, color: 0xdfe8ff, sizeAttenuation: false, fog: false }))); }
  const NI = 2200, chunkM = new THREE.MeshStandardMaterial({ color: 0xe8eef6, roughness: 0.75, flatShading: true });
  const chunks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), chunkM, NI); chunks.frustumCulled = false; ice.add(chunks);
  const CH = []; { const Ri = rng(10); for (let i = 0; i < NI; i++) CH.push({ x: (Ri() - 0.5) * 70, y: (Ri() - 0.5) * 1.6 - 0.3, z: 25 - Ri() * 190, s: 0.08 + Math.pow(Ri(), 3) * 1.4, w: Ri() * 2, ph: Ri() * 6 }); }
  function iceScene(t) {
    iceRings.ring.visible = true;
    CH.forEach((c, i) => { M4.compose(new THREE.Vector3(c.x, c.y, c.z), Q4.setFromEuler(E3.set(c.ph + t * c.w * 0.3, c.ph * 2 + t * c.w * 0.2, 0)), S3.set(c.s, c.s * 0.8, c.s * 1.1)); chunks.setMatrixAt(i, M4); });
    chunks.instanceMatrix.needsUpdate = true;
    const u = smooth(clamp((t - 5.6) / 2.0));
    return { P: [0.3, lerp(2.6, 1.6, u), lerp(14, -16, u)], A: [0, lerp(-1.5, 0.0, u), lerp(-60, -90, u)], fov: 50 };
  }

  // ================================================================ STREET (New York): the arch over the avenue
  const nyc = Array.from({ length: 9 }, (_, i) => civ({ top: CASUAL[(i * 5 + 1) % CASUAL.length] }));
  const vendor = person({ skin: 0xe2ad8c, top: 0xf2f2f2, pants: 0x3a3d42, hair: 0x2a1d16, hairStyle: 'short', mustache: 0x2a1d16 });
  const taxi = makeCar(0xf2c12e); street.root.add(taxi.g); taxi.g.visible = false;
  const cabbie = person({ skin: 0x9a6447, top: 0x45607a, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const skylineSt = []; street.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'BoxGeometry' && Math.abs(o.position.x) > 95) skylineSt.push(o); });
  function streetScene(t, cam) {
    street.aimSun(2, 2, 16); skylineSt.forEach((o) => (o.visible = cam !== 'nycArch')); (domes.street || []).forEach((m) => m.material.color.set(cam === 'nycArch' ? 0xa9bfe6 : 0xffffff));
    sky('street', 40.7, JUL, 14, { haze: 0xe8dcc8 });
    // the crowd on the front sidewalk (z 7–10) near x 2, looking south (−x) and up
    const spots = [[1.2, 8.0], [1.9, 8.9], [2.6, 7.7], [3.2, 9.1], [0.5, 9.2], [3.9, 8.3], [4.7, 9.4], [0.0, 7.8], [5.4, 7.9]];
    nyc.forEach((rig, i) => { const [x, z] = spots[i], p = basePose(); p.eyes = blink(t, 30 + i); const turn = cam === 'nycArch' && (i === 3 || i === 5 || i === 6 || i === 8); Object.assign(p, { x, z, rotY: turn ? PI / 2 + 0.35 * Math.sin(i * 1.3) : -PI / 2 + 0.25 * Math.sin(i * 1.9) }); look(p, turn ? 0.05 + 0.08 * Math.sin(t * 3 + i) : 0.38 + 0.04 * Math.sin(t + i)); if (turn) { p.mouth = Math.sin(t * 7 + i) > 0 ? 'o' : 'smile'; p.armA = A(-2.4, 0.3, -0.2, 0); p.armA.sx += 0.25 * Math.sin(t * 5 + i); } p.mouth = i % 3 ? 'o' : 'smile'; if (i % 2 === 0) p.armB = PHONE_B; if (i === 3 && !turn) p.armB = POINT_UP_B; put(rig, 'street', p, { y: SIDEWALK_H + (turn ? 0.05 * Math.max(0, Math.sin(t * 6 + i)) : 0), floor: SIDEWALK_H }); if (i % 2 === 0) phoneIn(rig, 1, W('street', x - 6, 3, z)); });
    { const p = basePose(); p.eyes = blink(t, 40); const [cx, cz] = [5.6, -1.1]; Object.assign(p, { x: cx + 0.1, z: cz - 0.7, rotY: -PI / 2 + 0.4 }); look(p, 0.4); p.armA = HOLD_A; p.armB = SHADE_B; p.mouth = 'o'; put(vendor, 'street', p, { y: SIDEWALK_H, floor: SIDEWALK_H }); }
    taxi.g.visible = true; taxi.g.position.set(-1.5, 0, 5.2); taxi.g.rotation.y = -PI / 2;
    { const p = basePose(); p.eyes = blink(t, 41); Object.assign(p, { x: -1.3, z: 5.95, rotY: -PI / 2 + 0.9 }); look(p, 0.45); p.armB = POINT_UP_B; p.mouth = 'o'; p.lean = 0.15; put(cabbie, 'street', p, { y: -0.25, floor: -0.25 }); }
    if (cam === 'nycFaces') { const u = smooth(clamp((t - 13.4) / 2.9)); return { P: [lerp(-2.4, -1.9, u), 1.45, lerp(8.2, 8.5, u)], A: [2.6, lerp(1.75, 1.8, u), lerp(8.5, 8.6, u)], fov: 50 }; }
    const u = smooth(clamp((t - 16.3) / 3.3));
    return { P: [lerp(8.6, 7.6, u), lerp(1.55, 1.75, u), 8.6], A: [-20, lerp(9.5, 12.5, u), lerp(5.4, 4.9, u)], fov: 66 };
  }

  // ================================================================ CITY (Tokyo rooftop at sunset): Earth's shadow on the rings
  const roofers = Array.from({ length: 8 }, (_, i) => civ({ top: CASUAL[(i * 2 + 3) % CASUAL.length] }));
  const tower = []; city.root.traverse((o) => { if (o.isMesh) { const w = o.getWorldPosition(new THREE.Vector3()); if (w.x > -13.5 && w.x < -8.9 && w.z > 13.8 && w.z < 18.2 && w.y > ROOF_Y + 0.4 && w.y < ROOF_Y + 12) tower.push(o); } });
  function cityScene(t, cam) {
    tower.forEach((o) => (o.visible = false));
    const k = cam === 'tokyoFaces' ? smooth(clamp((t - 19.6) / 2.8)) * 0.3 : 0.3 + 0.7 * smooth(clamp((t - 22.4) / 3.0));
    const hour = lerp(18.9, 20.9, k);
    city.setTime({ day: lerp(0.95, 0.15, k), golden: lerp(1, 0.6, k), power: 1 });
    sky('city', 35.7, JUL, hour, { haze: k < 0.5 ? 0xe9b48a : 0x2a3050, gain: lerp(1.0, 0.85, k) });
    const RX = -12, RZ = 12.5, Y = ROOF_Y;
    const spots = [[-12.5, 11.9, 0.2], [-11.75, 11.5, -0.3], [-12.95, 12.7, 0.4], [-11.4, 12.5, -0.4], [-12.15, 13.3, 0.1], [-13.0, 11.3, 0.3], [-11.2, 13.4, -0.5], [-12.3, 14.1, 0.0]];
    const near = cam === 'tokyoArch' ? { 0: [-9.85, 13.3, -0.55], 1: [-11.05, 13.45, 0.45] } : {};
    roofers.forEach((rig, i) => { const [x, z, ry] = near[i] || spots[i], p = basePose(); p.eyes = blink(t, 50 + i); Object.assign(p, { x, z, rotY: near[i] ? ry : PI + ry }); look(p, 0.42 + 0.03 * Math.sin(t * 0.9 + i)); p.mouth = i % 2 ? 'o' : 'smile'; if (i === 1) p.armB = POINT_UP_B; if (i === 3 || i === 6) p.armB = PHONE_B; if (i === 4) { p.armA = HUG_A; p.armB = HUG_B; } if (i === 2 || i === 5 || i === 7) { const w = 0.5 + 0.5 * Math.sin(t * 5 + i); p.armA = mixArm(REST, CHEER, w); p.armB = mixArm(REST, CHEER, 1 - w); }
      if (near[i]) { p.armB = POINT_UP_B; p.armA = REST; look(p, 0.15 + 0.1 * Math.sin(t * 2 + i)); p.headYaw = i ? -0.5 : 0.5; p.mouth = Math.sin(t * 6 + i) > 0 ? 'o' : 'smile'; }
      const hop = 0.045 * Math.max(0, Math.sin(t * 6.4 + i * 1.7)); put(rig, 'city', p, { y: Y + hop, floor: Y + hop }); if (i === 3 || i === 6) phoneIn(rig, 1, new THREE.Vector3(x, Y + 12, z - 30)); });
    if (cam === 'tokyoFaces') { const u = smooth(clamp((t - 19.6) / 2.8)); return { P: [lerp(-11.0, -13.2, u), Y + lerp(1.4, 1.6, u), lerp(8.9, 9.1, u)], A: [-12.2, Y + 1.72, 12.6], fov: 50 }; }
    const u = smooth(clamp((t - 22.4) / 3.0));
    return { P: [lerp(-10.4, -10.6, u), Y + lerp(1.5, 2.6, u), lerp(15.4, 15.8, u)], A: [lerp(-12, -16, u), Y + lerp(7, 16, u), -30], fov: 64 };
  }

  // ================================================================ SUBURB (Ohio, 10 PM): ringshine + shooting stars
  const nightTex = nightSkyTexture();
  const subDay = (domes.sub || []).map((m) => ({ m, map: m.material.map }));
  const kid = kidRig({ skin: 0xf1c3a1, top: 0x3d7bd9, pants: 0x45607a, hair: 0x9a6a3a, hairStyle: 'messy' });
  const pop = person({ skin: 0xf1c3a1, top: 0x6fa84f, pants: 0x3a3d42, hair: 0x9a6a3a, hairStyle: 'short', glasses: true });
  const lawn = [civ({ top: 0xe58fa6 }), civ({ top: 0xf1c24a }), kidRig({ top: 0xd2483f })];
  const sketchTex = canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = '#f6f2e6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d2a5a'; g.fillRect(0, 0, w, h * 0.72);
    g.fillStyle = '#ffe9a8'; for (let i = 0; i < 40; i++) { const x = (i * 97) % w, y = (i * 53) % (h * 0.6); g.fillRect(x, y, 5, 5); }
    g.lineCap = 'round'; for (let k = 0; k < 4; k++) { g.strokeStyle = ['#fff6d8', '#f2d48a', '#ffffff', '#e8c070'][k]; g.lineWidth = 16 - k * 3; g.beginPath(); g.ellipse(w / 2, h * 0.78, w * (0.62 - k * 0.07), h * (0.62 - k * 0.07), 0, PI, 2 * PI); g.stroke(); }
    g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.15, h * 0.12); g.lineTo(w * 0.32, h * 0.24); g.stroke();
    g.fillStyle = '#4f8a3a'; g.fillRect(0, h * 0.72, w, h * 0.28);
    g.fillStyle = '#c84a3a'; g.fillRect(w * 0.62, h * 0.5, w * 0.2, h * 0.24); g.fillStyle = '#5a3a2a'; g.beginPath(); g.moveTo(w * 0.59, h * 0.5); g.lineTo(w * 0.72, h * 0.38); g.lineTo(w * 0.85, h * 0.5); g.fill();
    g.fillStyle = '#2a2a2a'; g.font = 'bold 34px "Comic Sans MS", Arial'; g.fillText('RINGS!', 24, h - 22);
  });
  const sketch = new THREE.Group(); mk(new THREE.BoxGeometry(0.34, 0.012, 0.26), mat(0xf6f2e6, 0.8), sketch);
  const sk = mk(new THREE.PlaneGeometry(0.33, 0.25), new THREE.MeshBasicMaterial({ map: sketchTex, toneMapped: true }), sketch, 0, 0.007, 0); sk.rotation.x = -PI / 2;
  scene.add(sketch); sketch.visible = false;
  const crayon = mk(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 8), mat(0xf2c12e, 0.6), scene); crayon.visible = false;
  const blanket = mk(new THREE.BoxGeometry(2.0, 0.02, 1.4), mat(0x8a3a4a, 0.95), sub.root, -4.6, 0.02, 5.0); blanket.visible = false;
  const METEORS = [[25.9, -0.6], [26.8, 0.4], [27.6, -0.2], [28.9, 0.5], [29.6, -0.5], [30.3, 0.1], [30.9, 0.7]];
  function subScene(t, cam) {
    sub.aimSun(-1.5, -7, 10);
    // night: the dome turns to stars, ringshine = a cool key from the south (+z) high, plus a warm porch lamp
    (domes.sub || []).forEach((m) => { m.material.map = nightTex; m.material.color.set(0x8a96b8); });
    sub.lights.hemi.intensity = 0.42; sub.lights.hemi.color.set(0x8fa2d0); sub.lights.sun.intensity = 1.25; sub.lights.sun.color.set(0xcfd8ff);
    sub.lights.sun.position.set(-1.5 + 4, 22, -7 + 26); sub.lights.sun.target.position.set(-1.5, 0, -7);
    sky('sub', 39.9, JUL, 21.7 + (t - 25.4) * 0.02, { haze: 0x1a2440, gain: 0.8 });
    blanket.visible = true;
    const draw = cam === 'night' ? 0.5 + 0.5 * Math.sin(t * 5.2) : 0;
    const pointAt = 29.65, pt = cam === 'nightSky' ? pulse(t, pointAt, 0.2, 1.2, 0.4) : 0;
    { const p = basePose(); p.eyes = blink(t, 60); Object.assign(p, { x: -1.6, z: -7.75, rotY: 0.1 });
      const glance = cam === 'night' ? smooth(clamp(Math.sin(t * 1.4) * 2)) : 1;
      look(p, lerp(-0.45, 0.5, glance)); p.armA = LAP_A; p.armB = mixArm(mixArm(DRAW_B, LAP_B, glance * 0.6), POINT_UP_B, pt); p.mouth = glance > 0.5 ? 'o' : 'smile';
      if (cam === 'night') { p.armB.el += 0.12 * draw; p.armB.sz += 0.06 * draw; }
      seatKid(kid, 'sub', p, 0.3); }
    { kid.root.updateMatrixWorld(true); const pel = new THREE.Vector3(0, 0.4, 0.3); kid.root.localToWorld(pel); sketch.position.copy(pel); sketch.rotation.set(-0.5, kid.root.rotation.y, 0); sketch.visible = true;
      if (pt < 0.5) { crayon.visible = true; crayon.position.copy(hand(kid, 1)); crayon.rotation.set(0.6, 0, 0.3); } }
    { const p = basePose(); p.eyes = blink(t, 61); p.glasses = true; Object.assign(p, { x: -1.08, z: -7.72, rotY: -0.25 }); look(p, cam === 'night' ? 0.15 : 0.45); p.headYaw = cam === 'night' ? 0.5 : 0; p.armA = LAP_A; p.armB = LAP_B; p.mouth = 'smile'; seatAdult(pop, 'sub', p, 0.3); }
    lawn.forEach((rig, i) => { const p = basePose(); p.eyes = blink(t, 62 + i); Object.assign(p, { x: -5.2 + i * 0.75, z: 4.9, rotY: PI + 0.2 * (i - 1) }); look(p, 0.6); p.mouth = 'o'; if (i === 2) { p.armA = CHEER; p.armB = CHEER; } i === 2 ? seatKid(rig, 'sub', p, 0.04) : seatAdult(rig, 'sub', p, 0.04); });
    // shooting stars over the arch (world positions on a far shell south of the house)
    const cp = studio.camera.position;
    METEORS.forEach(([t0, side], i) => { const age = t - t0; if (age < 0 || age > 0.7) return; const k = age / 0.7; const head = W('sub', -1.5 + side * 60 + lerp(0, -30 + i * 7, k), lerp(70, 48, k) + i * 3, -7 + 180); streak(head, new THREE.Vector3(-0.8 + i * 0.25, -0.6, 0), 22, 0.9, Math.sin(k * PI), cp); });
    if (cam === 'night') { const u = smooth(clamp((t - 25.4) / 2.9)); return { P: [lerp(-1.45, -1.35, u), lerp(0.98, 1.0, u), lerp(-5.85, -6.05, u)], A: [-1.36, 0.93, -7.75], fov: 46 }; }
    const u = smooth(clamp((t - 28.3) / 3.1));
    return { P: [lerp(-1.95, -2.05, u), lerp(1.08, 1.0, u), lerp(-8.55, -8.7, u)], A: [-1.3, lerp(6.5, 9, u), 14], fov: 60 };
  }

  // ================================================================ POOL (Miami): the rings' shadow
  const swimmers = [kidRig({ top: 0xe2574c }), kidRig({ top: 0x3d7bd9 }), kidRig({ top: 0xf2b632 }), civ({ top: 0x58b368 })];
  const towels = [0xf2b632, 0x4f9bd9, 0xe58fa6, 0x58b368].map((c) => { const g = new THREE.Group(); mk(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 10, 1, true), mat(c, 0.95, { side: THREE.DoubleSide }), g, 0, 0, 0); scene.add(g); g.visible = false; return g; });
  const deckers = [kidRig({ top: 0xe2574c }), kidRig({ top: 0x3d7bd9 }), civ({ top: 0x8f6fb8, hairStyle: 'bob' }), civ({ top: 0x4fb3a8 })];
  const guard = civ({ top: 0xd2483f, pants: 0xd2483f, hairStyle: 'short' });
  const poolSun = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,250,1)'); gr.addColorStop(0.22, 'rgba(255,250,235,1)'); gr.addColorStop(0.32, 'rgba(255,240,200,0.45)'); gr.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  poolSun.renderOrder = 2; scene.add(poolSun); poolSun.visible = false;
  const poolSky0 = (domes.pool || []).map((m) => m.material.color.clone());
  const DEC_OF = (t) => lerp(JUL, -23.44, smooth(clamp((t - 34.1) / 1.8)));
  function poolScene(t, cam) {
    pool.update(t);
    const dec = DEC_OF(t), sunE = sunECEF(dec, 12), T = ringTransmit(25.8 * DEG, sunE), lit = 0.5 + 0.5 * T;
    sky('pool', 25.8, dec, 12, { haze: 0xd8e6f0 });
    pool.lights.sun.intensity = 2.8 * T; pool.lights.hemi.intensity = 1.3 * lit; pool.lights.hemi.color.set(0xcfe6ff).lerp(new THREE.Color(0x8a9ab8), 1 - T);
    (domes.pool || []).forEach((m, i) => m.material.color.copy(poolSky0[i]).lerp(new THREE.Color(0x3a4658), (1 - T) * 0.75));
    // the sun disc where the ray-cast puts it: local (e, n, u) → pool world (east = −x, north = +z)
    { const s = Math.sin(25.8 * DEG), c = Math.cos(25.8 * DEG), e = sunE.y, n = -s * sunE.x + c * sunE.z, u = c * sunE.x + s * sunE.z;
      const dir = new THREE.Vector3(-e, u, n).normalize(), cp = studio.camera.position; poolSun.position.copy(cp).addScaledVector(dir, 250); poolSun.scale.setScalar(250 * 0.06 * (0.6 + 0.4 * T)); poolSun.material.opacity = 0.25 + 0.75 * T; poolSun.visible = true; }
    const cold = 1 - T;
    if (cam === 'miamiPool') {
      const SW = [[-0.45, 3.0, 0], [0.3, 3.5, 1], [0.85, 2.7, 2], [-0.95, 2.3, 3]];
      swimmers.forEach((rig, i) => { const [x, z] = SW[i], p = basePose(); p.eyes = blink(t, 70 + i); Object.assign(p, { x, z, rotY: 0.3 * Math.sin(i * 2) + 0.15 * Math.sin(t * 1.3 + i) }); look(p, 0.1); p.mouth = 'smile'; const splash = 0.5 + 0.5 * Math.sin(t * 6 + i * 2); p.armA = mixArm(A(-1.2, 0.9, -0.3, 0), CHEER, splash * (i % 2)); p.armB = mixArm(A(-1.2, 0.9, -0.3, 0), CHEER, splash * ((i + 1) % 2)); const s = i < 3 ? KS : 1; const leap = i === 1 ? Math.max(0, Math.sin(PI * clamp((t - 32.5) / 0.9))) * 0.75 : 0; if (leap > 0) { p.armA = CHEER; p.armB = CHEER; p.mouth = 'o'; } put(rig, 'pool', p, { y: PD.water - (i < 3 ? 0.62 : 1.0) + 0.1 * Math.sin(t * 3 + i) + leap, floor: PD.floor, s }); });
      for (let k = 0; k < 14; k++) { const age = t - 33.35, a = k * 2.399; if (age > 0 && age < 0.9) puff(W('pool', SW[1][0] + Math.cos(a) * (0.2 + age * 0.8), PD.water + 0.1 + 1.8 * age - 2.5 * age * age, SW[1][1] + Math.sin(a) * (0.15 + age * 0.5)), 0.14 + 0.12 * age, 0.8 * (1 - age / 0.9), new THREE.Color(0xffffff)); }
      for (let k = 0; k < 28; k++) { const a = k * 2.399, x = SW[k % 4][0] + Math.cos(a) * 0.35, z = SW[k % 4][1] + Math.sin(a) * 0.3, ph = (t * 1.8 + k * 0.37) % 1; puff(W('pool', x, PD.water + 0.15 + ph * 0.5, z), 0.12 + 0.1 * ph, 0.55 * (1 - ph), new THREE.Color(0xffffff)); }
      { const p = basePose(); p.eyes = blink(t, 75); Object.assign(p, { x: 9.5, z: 7.4, rotY: PI - 0.3 }); look(p, 0.1); p.armA = LAP_A; p.armB = LAP_B; seatAdult(guard, 'pool', p, 2.0); }
      const u = smooth(clamp((t - 31.4) / 2.7));
      return { P: [lerp(-0.4, 0.3, u), 0.35, lerp(7.1, 6.2, u)], A: [0.0, lerp(3.4, 3.9, u), -4], fov: 62 };
    }
    if (cam === 'miamiSky') {
      // low lens looking south and up: the sun slides into the dark band; a kid in the pool (profile) at the frame's edge
      { const rig = swimmers[0], p = basePose(); p.eyes = blink(t, 70); Object.assign(p, { x: 0.55, z: 3.4, rotY: PI + 0.2 }); look(p, 0.7); p.mouth = 'o'; p.armB = SHADE_B; put(rig, 'pool', p, { y: PD.water - 0.62, floor: PD.floor, s: KS }); }
      const u = smooth(clamp((t - 34.1) / 1.9));
      return { P: [0.2, 0.25, 4.6], A: [lerp(-0.6, -0.9, u), lerp(5.2, 5.6, u), -6], fov: 62 };
    }
    // miamiDark: on the deck, wrapped in towels, shivering; they look up at the dim sun (behind the lens)
    const DK = [[-0.15, 7.3, 0.15], [0.45, 7.55, -0.1], [-0.65, 7.75, 0.3], [0.95, 7.9, -0.3]];
    deckers.forEach((rig, i) => { const [x, z, ry] = DK[i], p = basePose(); p.eyes = blink(t, 80 + i); Object.assign(p, { x, z, rotY: PI + ry }); look(p, 0.55 + 0.05 * Math.sin(t * 2 + i)); p.armA = mixArm(REST, HUG_A, cold); p.armB = mixArm(REST, HUG_B, cold); p.mouth = cold > 0.5 ? 'o' : 'smile'; p.headRoll = shiver(t + i, cold); const s = i < 2 ? KS : 1; put(rig, 'pool', p, { s }); rig.root.position.x += shiver(t * 1.3 + i, cold);
      towels[i].visible = cold > 0.3; rig.root.updateMatrixWorld(true); const sp = rig.spine.getWorldPosition(new THREE.Vector3()); towels[i].position.copy(sp).add(new THREE.Vector3(0, 0.05 * s, 0)); towels[i].scale.setScalar(s === 1 ? 1 : 0.68); towels[i].rotation.y = rig.root.rotation.y; });
    const u = smooth(clamp((t - 36.0) / 2.0));
    return { P: [lerp(0.25, 0.15, u), lerp(1.05, 1.0, u), lerp(4.9, 5.2, u)], A: [0.2, lerp(1.25, 1.3, u), 7.6], fov: 50 };
  }

  // ================================================================ LAUNCH (Cape Canaveral): a launch under the arch
  const f9 = makeFalcon('f9'); launch.root.add(f9.g); f9.g.visible = false;
  const beach = Array.from({ length: 8 }, (_, i) => (i < 2 ? kidRig({ top: CASUAL[i + 2] }) : civ({ top: CASUAL[(i * 3) % CASUAL.length] })));
  const T_LIFT = 41.2;
  function launchScene(t, cam) {
    launch.setSky('day', 0, 0, 60);
    sky('launch', 28.5, JUL, 10, { haze: 0xe6eef2 });
    const lt = t - T_LIFT, h = lt > 0 ? 3.2 * lt * lt + 4 * lt : 0;
    f9.g.visible = true; f9.g.position.set(0, h + 0.4, 0);
    launch.setPlume(new THREE.Vector3(0, h + 0.4, 0), 1, 26, 2.4, h < 40 ? 30 : 10, 0, t);
    const BX = 40, BZ = 150;
    beach.forEach((rig, i) => { const x = BX + (i - 3.5) * 0.5 + (i % 2) * 0.15, z = BZ + (i % 3) * 0.55, p = basePose(); p.eyes = blink(t, 90 + i); Object.assign(p, { x, z, rotY: faceTo(x, z, 0, 0) + 0.15 * Math.sin(i) }); look(p, 0.25 + h * 0.004); p.mouth = 'o';
      const up = smooth(clamp((t - 42.0 - i * 0.1) / 0.4)); if (i % 3 === 0) { p.armA = mixArm(REST, CHEER, up); p.armB = mixArm(REST, CHEER, up); } else if (i % 3 === 1) { p.armB = PHONE_B; } else { p.armB = SHADE_B; }
      put(rig, 'launch', p, i < 2 ? { s: KS } : {}); if (i % 3 === 1) phoneIn(rig, 1, new THREE.Vector3(OFF.launch[0], h + 30, 0)); });
    if (cam === 'launchFaces') { const u = smooth(clamp((t - 41.6) / 1.6)); const fx = BX - 0.6, fz = BZ - 4.4; return { P: [fx + lerp(-0.3, 0.2, u), 1.3, fz], A: [BX - 0.15, 1.55, BZ + 0.4], fov: 48 }; }
    const u = smooth(clamp((t - 43.2) / 1.4));
    return { P: [BX + 2.5, 2.7, BZ + 3.5], A: [0, lerp(60, 85, u), 0], fov: 54 };
  }

  // ================================================================ CLASSROOM: 466 million years ago
  cls.setBoard(''); cls.setSeason('autumn', 0);
  const boardTex = canvasTex(1024, 340, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(245,245,240,0.92)'; g.fillStyle = 'rgba(245,245,240,0.92)'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(250, 175, 95, 0, PI * 2); g.stroke();
    g.beginPath(); g.ellipse(250, 175, 205, 44, -0.12, 0, PI * 2); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(205, 120); g.quadraticCurveTo(235, 150, 220, 190); g.quadraticCurveTo(260, 215, 275, 250); g.stroke(); g.beginPath(); g.moveTo(285, 110); g.quadraticCurveTo(310, 140, 300, 170); g.stroke();
    g.font = 'bold 74px "Chalkboard SE", "Comic Sans MS", Arial'; g.textAlign = 'left'; g.fillText('466 MILLION', 500, 150); g.fillText('YEARS AGO', 500, 240);
    g.font = '44px "Chalkboard SE", "Comic Sans MS", Arial'; g.fillText('= Earth had a ring?', 500, 310);
  });
  const board = mk(new THREE.PlaneGeometry(3.4, 1.13), new THREE.MeshBasicMaterial({ map: boardTex, transparent: true }), cls.root, CD.board.x, CD.board.y, -2.93);
  const teacher = person({ skin: 0x9a6447, top: 0x8f6fb8, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const pupils = Array.from({ length: 8 }, (_, i) => kidRig({ top: CASUAL[(i * 2 + 1) % CASUAL.length], hairStyle: ['short', 'bob', 'messy', 'bob'][i % 4] }));
  function clsScene(t, cam) {
    board.visible = true;
    cls.setSeason(cam === 'classCold' ? 'winter' : 'autumn', t);
    const cold = cam === 'classCold' ? smooth(clamp((t - 52.9) / 0.6)) : 0;
    cls.lights.sun.intensity = cam === 'classCold' ? 1.2 : (cls.lights.sun.userData.i0 ?? (cls.lights.sun.userData.i0 = cls.lights.sun.intensity));
    const desks = CD.desks.slice(0, 8);
    pupils.forEach((rig, i) => { const d = desks[i], p = basePose(); p.eyes = blink(t, 100 + i); Object.assign(p, { x: d.x, z: d.z + CD.chair.dz, rotY: PI + 0.1 * Math.sin(i * 1.7) }); look(p, 0.12 + 0.05 * Math.sin(t * 1.1 + i)); p.mouth = i % 2 ? 'o' : 'smile';
      const lean = cam !== 'classCold' ? smooth(clamp((t - 48.3 - i * 0.08) / 0.5)) : 0; p.lean = 0.25 * lean - 0.05;
      if (cam === 'classKids' && i === 2) p.armB = HAND_UP_B; else if (cold > 0) { p.armA = mixArm(LAP_A, HUG_A, cold); p.armB = mixArm(LAP_B, HUG_B, cold); p.headRoll = shiver(t + i, cold); p.mouth = 'o'; } else { p.armA = LAP_A; p.armB = LAP_B; }
      seatKid(rig, 'cls', p, CD.chair.seat); });
    { const p = basePose(); p.eyes = blink(t, 110); p.glasses = true; Object.assign(p, { x: -1.15, z: -2.45, rotY: 0.55 }); p.armB = cam === 'classBoard' ? mixArm(REST, BOARD_B, smooth(clamp((t - 47.8) / 0.4))) : REST; p.armA = REST; p.mouth = Math.sin(t * 9) > 0 ? 'o' : 'smile'; p.headYaw = cam === 'classBoard' ? -0.4 + 0.5 * smooth(clamp((t - 49.5) / 0.5)) : 0.3; if (cold > 0) { p.armA = HUG_A; p.armB = HUG_B; p.headRoll = shiver(t, cold); } put(teacher, 'cls', p); }
    if (cam === 'classBoard') { const u = smooth(clamp((t - 47.6) / 1.8)); return { P: [lerp(0.9, 0.75, u), lerp(1.3, 1.25, u), lerp(1.2, 0.8, u)], A: [0.45, 1.4, -2.9], fov: 52 }; }
    if (cam === 'classKids') { const u = smooth(clamp((t - 49.4) / 1.6)); return { P: [lerp(0.15, 0.05, u), 1.15, lerp(-2.8, -2.7, u)], A: [0.0, 0.72, -0.4], fov: 66 }; }
    const u = smooth(clamp((t - 52.8) / 2.2));
    return { P: [lerp(-1.6, -1.4, u), 1.12, lerp(-2.1, -1.9, u)], A: [0.9, 0.85, 0.0], fov: 50 };
  }

  // ================================================================ WEDDING (Tuscany, golden hour): under the arch
  const bride = person({ skin: 0xf1c3a1, top: 0xfbfaf6, collar: 0xfbfaf6, pants: 0xfbfaf6, dress: 0xfbfaf6, hair: 0x5a3a24, hairStyle: 'bob' });
  const groom = person({ skin: 0xc98e6a, top: 0x2a2d36, collar: 0xf2f2f2, pants: 0x2a2d36, hair: 0x1a1a1a, hairStyle: 'short' });
  const officiant = person({ skin: 0xe2ad8c, top: 0x3a3d42, pants: 0x3a3d42, hair: 0xc9c4be, hairStyle: 'none', glasses: true });
  const guests = Array.from({ length: 12 }, (_, i) => civ({ top: [0xe58fa6, 0x4fb3a8, 0xf1c24a, 0x8f6fb8, 0x3d7bd9, 0xe08a3a][i % 6] }));
  const veil = mk(new THREE.ConeGeometry(0.2, 0.75, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.9 }), bride.head.g, 0, -0.18, -0.06); veil.rotation.x = 0.12;
  const T_KISS = 59.0, T_HANDS = 60.0;
  const wedTrees = []; wed.root.traverse((o) => { if (o.isMesh && (o.geometry.type === 'IcosahedronGeometry' || o.geometry.type === 'CylinderGeometry')) { const w = o.getWorldPosition(new THREE.Vector3()).sub(new THREE.Vector3(...OFF.wed)); if (w.z < -5.5 && Math.abs(w.x) < 9 && w.y > 0.6) wedTrees.push(o); } });
  function wedScene(t, cam) {
    wedTrees.forEach((o) => (o.visible = false)); (domes.wed || []).forEach((m) => m.material.color.set(0xd6b8b0));
    sky('wed', 43.3, JUL, 20.25, { haze: 0xf2c8a0, gain: 1.0 });
    wed.lights.sun.color.set(0xffc890); wed.lights.hemi.color.set(0xffe2c8);
    const kiss = cam === 'wedKiss' ? smooth(clamp((t - T_KISS) / 0.5)) : 0, hands = cam === 'wedKiss' ? smooth(clamp((t - T_HANDS) / 0.4)) : 0;
    const lookUp = cam === 'wedArch' ? smooth(clamp((t - 55.6) / 0.8)) : 0.3 * (1 - kiss);
    { const [x, z] = WD.bride, p = basePose(); p.eyes = kiss > 0.5 && hands < 0.5 ? 'closed' : blink(t, 120); Object.assign(p, { x: x - 0.12 * kiss, z, rotY: -PI / 2 + 0.25 * lookUp }); look(p, 0.4 * lookUp); p.lean = 0.12 * kiss * (1 - hands); p.armA = mixArm(HOLD_A, HAND_UP_B.sx ? A(-2.9, 0.15, -0.2, 0) : HOLD_A, hands); p.armB = mixArm(HOLD_B, A(-0.9, 0.2, -1.4, -0.6), kiss); p.mouth = 'smile'; put(bride, 'wed', p); }
    { const [x, z] = WD.groom, p = basePose(); p.eyes = kiss > 0.5 && hands < 0.5 ? 'closed' : blink(t, 121); Object.assign(p, { x: x + 0.12 * kiss, z, rotY: PI / 2 - 0.25 * lookUp }); look(p, 0.4 * lookUp); p.lean = 0.12 * kiss * (1 - hands); p.armB = mixArm(HOLD_B, A(-2.9, 0.15, -0.2, 0), hands); p.armA = mixArm(HOLD_A, A(-0.9, 0.2, -1.4, 0.6), kiss); p.mouth = 'smile'; put(groom, 'wed', p); }
    { const [x, z] = WD.officiant, p = basePose(); p.eyes = blink(t, 122); p.glasses = true; Object.assign(p, { x, z, rotY: 0 }); look(p, 0.5 * lookUp); p.armA = HOLD_A; p.armB = HOLD_B; p.mouth = 'smile'; put(officiant, 'wed', p); }
    guests.forEach((rig, i) => { const row = Math.floor(i / 4), side = i % 2 ? 1 : -1, seat = WD.seats[Math.floor(i / 2) % 2], z = WD.rows[row], x = side * seat, p = basePose(); p.eyes = blink(t, 130 + i); Object.assign(p, { x, z, rotY: PI + side * 0.1 }); look(p, 0.55 * lookUp + 0.05); p.mouth = lookUp > 0.5 ? 'o' : 'smile';
      const cheer = cam === 'wedKiss' ? smooth(clamp((t - T_KISS - 0.3 - (i % 4) * 0.1) / 0.4)) : 0; if (i % 3 === 0) { p.armA = mixArm(LAP_A, CHEER, cheer); p.armB = mixArm(LAP_B, CHEER, cheer); } else { p.armA = mixArm(LAP_A, clapA(t + i), cheer); p.armB = mixArm(LAP_B, clapB(t + i), cheer); }
      if (cam === 'wedArch' && (i === 5 || i === 0 || i === 9)) { p.armB = POINT_UP_B; p.armB.sx += 0.2 * Math.sin(t * 4 + i); } if (cam === 'wedArch' && (i === 2 || i === 7)) { p.armB = PHONE_B; }
      seatAdult(rig, 'wed', p, WD.seat); if (cam === 'wedArch' && (i === 2 || i === 7)) phoneIn(rig, 1, W('wed', 0, 30, -80)); });
    burst(W('wed', 0, 2.6, -3.3), t, T_KISS + 0.2, 260, 3.5, 2.2);
    if (cam === 'wedArch') { const u = smooth(clamp((t - 55.0) / 3.2)); return { P: [lerp(1.15, 1.75, u), lerp(1.3, 1.38, u), lerp(-3.05, -2.9, u)], A: [lerp(1.7, 2.1, u), 1.05, 1.6], fov: 54 }; }
    const u = smooth(clamp((t - 58.2) / 7.2));
    return { P: [lerp(0.35, 0.15, u), lerp(1.25, 1.2, u), lerp(-0.2, -1.0, u)], A: [0, lerp(1.95, 2.25, u), -4.2], fov: 54 };
  }

  // ================================================================ update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.5 : S === 'ice' ? 0.05 : 0.05;
    all.forEach((r) => (r.root.visible = false)); puffs.hide(); sparks.hide(); streaks.forEach((m) => (m.visible = false));
    phones.forEach((g) => (g.visible = false)); towels.forEach((g) => (g.visible = false));
    [sat.g, sketch, crayon, poolSun, debris, swarm.pts, board, blanket, f9.g].forEach((o) => (o.visible = false)); satBits.forEach((m) => (m.visible = false));
    rings.ring.visible = rings.shell.visible = false; iceRings.ring.visible = false;
    np = 0; ns = 0; nc = 0; nk = 0; nph = 0; shake = [0, 0];
    if (S !== 'sub') subDay.forEach(({ m, map }) => { m.material.map = map; m.material.color.set(0xffffff); });

    let c;
    if (S === 'plaza') c = plazaScene(t, cam);
    else if (S === 'space') c = spaceScene(t, cam);
    else if (S === 'ice') c = iceScene(t);
    else if (S === 'street') c = streetScene(t, cam);
    else if (S === 'city') c = cityScene(t, cam);
    else if (S === 'sub') c = subScene(t, cam);
    else if (S === 'pool') c = poolScene(t, cam);
    else if (S === 'launch') c = launchScene(t, cam);
    else if (S === 'cls') c = clsScene(t, cam);
    else c = wedScene(t, cam);
    conf.count = nc; conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true; conf.visible = nc > 0;

    const o = OFF[S], P = c.P.map((v, i) => v + o[i]), Aim = c.A.map((v, i) => v + o[i]);
    P[0] += shake[0]; P[1] += shake[1];
    story.debugView = { center: Aim, height: 26 };
    setCamera(P, Aim, c.fov, t, S === 'space' ? 0.3 : 0.004);
    ringSky.mesh.visible = !!RR[S];
    if (RR[S]) ringSky.follow(studio.camera, RR[S]);
  }
  return { update };
}
