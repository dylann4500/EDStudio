// VIDEO 037 — "What if the oxygen in the air doubled?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 62.0 s. SECOND 0 at 5.8 s: the air goes from 20.95 % to 41.9 % oxygen. HUD = OXYGEN IN THE AIR + one physical line per beat.
// Ladder: mile 26 of a marathon → +1 min a grandpa on a park bench → +10 min birthday candles → +30 min a backyard grill →
// +2 h a campsite → +1 day the forest → +1 day downtown firefighters → +10 years rust → + millions of years giant dragonflies
// → a birthday wish. NEW: engine/oxygen.js (cartoon flames that read in daylight, cake, grill, campfire, fire truck, helmet,
// extinguisher, dragonfly, crow, finish arch, barriers, bibs). Reused: street.js, suburb.js, kitchen.js, frontier woods,
// playground.js.
//
// MODEL (stated so a reviewer can check every number): at SECOND 0 the extra oxygen REPLACES nitrogen; total air pressure stays
// 1 atm. O₂ 20.95 % → 41.9 %, N₂ 78 % → ~57 %. So the oxygen partial pressure doubles: 0.21 → 0.42 atm (the number lungs and
// flames both respond to). (The other honest model — adding the extra O₂ on top — gives 1.21 atm and 34.6 % O₂ at the SAME
// 0.42 atm partial pressure, so every effect shown is the same either way.)
//  • Breathing: 0.42 atm is under the ~0.5 atm partial pressure where prolonged exposure starts to irritate lungs (pulmonary
//    O₂ toxicity, the "Lorrain Smith effect" — divers' and clinicians' working limit). We say "still under the level that hurts
//    lungs", not "healthy forever": nobody has lived a lifetime at 0.42 atm. Breathing feels easier for people with weak lungs
//    (home oxygen therapy gives patients ~24–40 % O₂). Athletes in hyperoxia studies perform better (Mallette et al. 2017
//    meta-analysis, Sports Med) — "a new gear" is the cartoon of that, no record time is claimed.
//  • Fire: burning speed and ease of ignition rise steeply with O₂. Safety codes define an "oxygen-enriched atmosphere" as
//    > 23.5 % O₂ (NFPA 53 / EIGA / OSHA confined-space practice); NASA's Apollo 1 cabin fire (1967) is the textbook case of
//    how fast things burn in oxygen-rich air. Fire sizes on screen are a cartoon (no flame height is claimed).
//  • Forests: how much worse wildfires get is DEBATED — early work (Watson et al. 1978, burning paper) said fires would rage
//    above ~25 %; Wildman et al. 2004 found moist living fuels still wouldn't sustain burning up to 35 %; the upper limit of
//    the "fire window" is put somewhere around 25–35 % (Vitali et al. 2022). Hence "Scientists still argue."
//  • Rust: iron corrodes by reacting with oxygen (and water); more oxygen in contact with the metal speeds it up → "faster", no factor.
//  • Insects: breathe through tracheae, which limits their size; in the late Carboniferous (~300 million years ago) O₂ peaked at
//    roughly 30–35 % (estimates vary) and the griffinfly Meganeura had a ~65–70 cm wingspan (crow-sized). Lab dragonflies
//    reared at 31 % O₂ grew larger (up to ~15 %, ASU / VandenBrooks) in ONE generation; giants take millions of years.
//
// SOURCES (checked Oct 2026): NOAA/standard atmosphere 20.95 % O₂ · NFPA 53 & EIGA (23.5 % "oxygen-enriched") · StatPearls,
//   "Oxygen Toxicity" (pulmonary toxicity after prolonged exposure > 0.5 ATA) · AIP "Trial by fire: the legacy of Apollo 1" ·
//   Watson, Lovelock & Margulis 1978; Wildman et al. 2004, Geology; Vitali et al. 2022 (fire window 25–35 %) · Clapham &
//   Karr 2012, PNAS (O₂ tracks max insect wingspan) · Harrison, Kaiser & VandenBrooks 2010, Proc. R. Soc. B · ASU news
//   "High oxygen super-sizes dragonflies" (31 % O₂, up to 15 % larger) · Meganeura wingspan 65–70 cm (Natural History lit.).
//
// Shot list (seconds)                     | set    | what happens
//  0.0– 3.4 title                         | street | a marathon pack jogs at the lens under a FINISH arch, crowd behind barriers
//  3.4– 8.6 race    SECOND 0 at 5.8       | street | tired → SECOND 0 → they surge; the leader snaps the tape at 7.5 (confetti)
//  8.6–13.4 bench   +1 MIN                | suburb | grandpa wheezes, takes a huge breath, stands, stretches; the pigeons explode up
// 13.4–18.6 cake    +10 MIN               | kitchen| dad lights 7 candles, each flares tall; the kid blows; WHOOMP (hats fly)
// 18.6–23.8 bbq     +30 MIN               | suburb | dad lights the grill: a 4 m flame column, burgers fly, one lands on his head
// 23.8–28.8 camp    +2 H                  | woods  | the campfire leaps; every marshmallow becomes a torch
// 28.8–33.8 forest  +1 DAY                | woods  | crowns burning behind a radioing firefighter; a flaming branch drops
// 33.8–38.8 truck   +1 DAY                | street | a hot-dog cart ablaze, firefighters hose it from a pumper; it goes out in steam
// 38.8–43.8 rust    +10 YEARS             | suburb | time-lapse: dad grays, his car rusts, the bumper falls off
// 43.8–49.8 fly     + MILLIONS OF YEARS   | play   | crow-sized dragonflies swoop over kids; one lands beside a crow
// 49.8–62.0 wish                          | play   | birthday picnic: wish, the candle roars, dad's extinguisher; fade 57.0, end card 57.6
import * as THREE from 'three';
import { clamp, lerp, lerpAngle, smooth, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H, L1, L2, ANKLE } from '@engine/rig.js';
import { buildStreet, SIDEWALK_H, DIMS as SD } from '@engine/sets/street.js';
import { buildSuburb, DIMS as UD } from '@engine/sets/suburb.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildWoods } from '@engine/sets/frontier.js';
import { buildPlayground } from '@engine/sets/playground.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { makeCar } from '@engine/sets/city.js';
import { makeFlames, makeCake, makePartyHat, makeBalloon, makeGrill, makeCampfire, makeTent, makeStick, makeFireTruck, makeHelmet,
  makeExtinguisher, makeDragonfly, makeFinishArch, makeBarrier, makeBib, makeCrow } from '@engine/oxygen.js';

const PI = Math.PI, G = 9.81, SW = 5.8, KS = 0.62;
const OFF = { street: [0, 0, 0], sub: [3000, 0, 0], kit: [6000, 0, 0], woods: [9000, 0, 0], play: [12000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'title', set: 'street' },
  { t0: 3.4, t1: 8.6, cam: 'race', set: 'street' },
  { t0: 8.6, t1: 13.4, cam: 'bench', set: 'sub' },
  { t0: 13.4, t1: 18.6, cam: 'cake', set: 'kit' },
  { t0: 18.6, t1: 23.8, cam: 'bbq', set: 'sub' },
  { t0: 23.8, t1: 28.8, cam: 'camp', set: 'woods' },
  { t0: 28.8, t1: 33.8, cam: 'forest', set: 'woods' },
  { t0: 33.8, t1: 38.8, cam: 'truck', set: 'street' },
  { t0: 38.8, t1: 43.8, cam: 'rust', set: 'sub' },
  { t0: 43.8, t1: 49.8, cam: 'fly', set: 'play' },
  { t0: 49.8, t1: 62.0, cam: 'wish', set: 'play' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends; armB −twist = inward)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CHEER = A(-2.75, 0.4, -0.25, 0);
const OUT = A(-0.35, 1.25, -0.3, 0);
const STRETCH = A(-2.95, 0.25, -0.1, 0);
const HOLD_A = A(-1.05, 0.12, -0.55, 0.25), HOLD_B = A(-1.05, 0.12, -0.55, -0.25);
const FLINCH_A = A(-1.75, 0.65, -1.95, 0.45), FLINCH_B = A(-1.75, 0.65, -1.95, -0.45);
const RADIO_B = A(-0.35, 0.35, -2.35, -0.95);
const LAP_A = A(-0.75, 0.15, -1.2, 0.5), LAP_B = A(-0.75, 0.15, -1.2, -0.5);
const POINT_B = A(-1.5, 0.25, -0.12, 0);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const clapA = (t, k = 1) => A(-1.15, 0.32 + 0.18 * k * Math.max(0, Math.sin(t * 13)), -1.45, 0.55);
const clapB = (t, k = 1) => A(-1.15, 0.32 + 0.18 * k * Math.max(0, Math.sin(t * 13)), -1.45, -0.55);
const pulse = (t, a, up = 0.15, hold = 0.4, down = 0.4) => smooth(clamp((t - a) / up)) * (1 - smooth(clamp((t - a - up - hold) / down)));

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob'];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xd9cdb4];

// local copy of rig.js legIK (for the run cycle: longer strides + knee lift than the walk cycle)
function legIK(leg, dz, dy) {
  let d = Math.hypot(dz, dy); d = Math.min(d, L1 + L2 - 1e-4);
  const gamma = Math.atan2(dz, -dy);
  const alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const beta = PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  leg.hip.rotation.x = -(gamma + alpha); leg.knee.rotation.x = beta; leg.ankle.rotation.x = gamma + alpha - beta;
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const sub = buildSuburb(studio, { poleClear: [-6, -2.4, 4.5, 58, 62] }); sub.root.position.set(...OFF.sub);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); const kitFog = null;
  const woods = buildWoods(studio, {}); woods.root.position.set(...OFF.woods); woods.setMode('summer');
  const play = buildPlayground(studio, {}); play.root.position.set(...OFF.play); play.setBuild(1); play.setBanner('HAPPY BIRTHDAY, NOA!');
  const ROOTS = { street: street.root, sub: sub.root, kit: kit.root, woods: woods.root, play: play.root };
  const FOGS = { street: streetFog, sub: sub.fog, kit: kitFog, woods: woods.fog, play: play.fog };
  const FAR = { street: 400, sub: 330, kit: 60, woods: 300, play: 340 };
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  woods.marker.visible = false;
  woods.root.children.forEach((o) => { if (o.isMesh && o.geometry.type === 'SphereGeometry' && Math.abs(o.position.x - 16) < 2 && Math.abs(o.position.z - 3) < 2.5 && o.position.y > 0) o.visible = false; });

  // ---------------------------------------------------------------- shared FX: flames, smoke/steam, water, confetti
  const fires = [];
  const fire = (o) => { const f = makeFlames(o); scene.add(f.g); f.g.visible = false; fires.push(f); return f; };
  const puffs = makeSpritePool(scene, 140, 'smoke');
  const smokeC = new THREE.Color(0x5a5550), steamC = new THREE.Color(0xf4f6f8), dustC = new THREE.Color(0xd8ccb6), foamC = new THREE.Color(0xffffff);
  let np = 0;
  const puff = (pos, size, op, col) => { if (np < 140) puffs.set(np++, pos, size, op, col); };
  /** a rising smoke column above a fire at world `base` (h = fire height) */
  const smokeCol = (base, t, h, n = 8, col = smokeC, spread = 0.4) => { for (let k = 0; k < n; k++) { const a = ((t * 0.5 + k / n) % 1); puff(new THREE.Vector3(base.x + Math.sin(k * 2.3 + t * 0.7) * spread * (0.5 + a), base.y + h * 0.8 + a * (2.5 + h * 1.4), base.z + Math.cos(k * 1.7) * spread * 0.6), (0.4 + h * 0.35) * (0.6 + a * 1.6), 0.55 * (1 - a) * clamp(h / 0.3), col); } };
  const blobGeo = new THREE.SphereGeometry(1, 10, 8);
  const waterM = new THREE.MeshStandardMaterial({ color: 0xbfe6f7, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x2a5a76, emissiveIntensity: 0.35 });
  const NB = 500, blobs = new THREE.InstancedMesh(blobGeo, waterM, NB); blobs.frustumCulled = false; blobs.castShadow = false; scene.add(blobs);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), S3 = new THREE.Vector3();
  let nb = 0;
  const blob = (p, r) => { if (nb >= NB) return; S3.set(r, r * 0.85, r); M4.compose(p, Q4.identity(), S3); blobs.setMatrixAt(nb++, M4); };
  /** a hose stream: blobs along a parabola from `a` (nozzle) to `b` (target), apex `h` m above the higher end */
  const stream = (a, b, t, h = 0.6, n = 46) => { for (let k = 0; k < n; k++) { const u = ((k / n) + t * 1.9) % 1; const p = a.clone().lerp(b, u); p.y += 4 * h * u * (1 - u); p.x += 0.04 * Math.sin(k * 7 + t * 9); blob(p, 0.035 + 0.02 * u); } };
  const NC = 420, confM = new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide });
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.03), confM, NC); conf.frustumCulled = false; scene.add(conf);
  const CONF_C = [0xe2453c, 0xf2b632, 0x3d7bd9, 0x58b368, 0xe58fa6, 0xffffff].map((h) => new THREE.Color(h)), FEATHER_C = new THREE.Color(0x8a8f9a);
  for (let i = 0; i < NC; i++) conf.setColorAt(i, CONF_C[i % 6]);
  let nc = 0;
  /** one burst of confetti (or feathers: grey) from world `o` at time `at` */
  const burst = (o, t, at, n = 200, vy = 5, spread = 3.5, gray = false) => {
    const age = t - at; if (age < 0 || age > 3.5) return;
    for (let k = 0; k < n && nc < NC; k++) {
      const a = k * 2.399, r = spread * (0.3 + 0.7 * ((k * 0.618) % 1)), v = vy * (0.5 + 0.5 * ((k * 0.37) % 1));
      const ta = Math.min(age, v / G * 0.9), drift = Math.max(0, age - ta);
      const p = new THREE.Vector3(o.x + Math.cos(a) * r * ta * 0.6 + 0.2 * Math.sin(age * 3 + k), o.y + v * ta - 0.5 * G * ta * ta - drift * (0.55 + 0.2 * (k % 3)), o.z + Math.sin(a) * r * ta * 0.6);
      if (p.y < 0.02) p.y = 0.02;
      M4.compose(p, Q4.setFromEuler(E3.set(age * 7 + k, age * 5 + k * 2, k)), S3.setScalar(gray ? 2.2 : 1)); conf.setColorAt(nc, gray ? FEATHER_C : CONF_C[k % 6]); conf.setMatrixAt(nc++, M4);
    }
  };
  let shake = [0, 0];
  const jolt = (t, at, k0 = 0.03, rate = 6) => { if (t > at && t < at + 1) { const k = k0 * Math.exp(-(t - at) * rate); shake = [shake[0] + k * Math.sin(t * 71), shake[1] + k * Math.sin(t * 53)]; } };

  // ---------------------------------------------------------------- cast helpers
  const R = rng(37);
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
  /** a kid seated on a seat of height `seat` (pelvis 0.07 local above it, feet dangling or on the ground) */
  const seatKid = (rig, key, p, seat, ground = 0) => { const rootY = seat - KS * (HIP_H - 0.07); p.footFwd = 0.42; put(rig, key, p, { y: rootY, floor: Math.max(rootY + 0.42 * KS, ground), s: KS }); };
  const seatAdult = (rig, key, p, seat) => { p.footFwd = 0.42; put(rig, key, p, { y: seat - 0.795 }); };
  const hand = (rig, side) => { rig.root.updateMatrixWorld(true); return rig.arms.find((a) => a.s === side).hand.getWorldPosition(new THREE.Vector3()); };
  const headW = (rig) => { rig.root.updateMatrixWorld(true); return rig.head.g.getWorldPosition(new THREE.Vector3()); };
  const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  /** running legs after applyPose (speed 0): phase phi, stride amp (m), knee lift; + pumping arms */
  const runLegs = (rig, p, phi, amp) => {
    const hipY = rig.pelvis.position.y;
    rig.legs.forEach((leg, i) => { const ph = phi + (i ? PI : 0); legIK(leg, amp * Math.sin(ph), ANKLE + amp * 0.75 * Math.max(0, Math.cos(ph)) - hipY + (p.floor - p.y)); });
    rig.root.position.y += amp * 0.16 * Math.abs(Math.sin(phi));
    rig.spine.rotation.y = 0.12 * Math.sin(phi) * amp / 0.4;
    rig.arms.forEach((arm) => { const s = arm.s < 0 ? 1 : -1; arm.shoulder.rotation.x = -0.35 + 1.5 * amp * s * Math.sin(phi); arm.elbow.rotation.x = -1.55; });
  };
  const sootify = (rig) => { const m = rig.mats.faceSkin, c0 = m.color.clone(); return (k) => m.color.copy(c0).lerp(new THREE.Color(0x5e5048), k * 0.55); };
  const ageHair = (rig) => { const m = rig.mats.hair, c0 = m.color.clone(); return (k) => m.color.copy(c0).lerp(new THREE.Color(0xd8d6d2), k); };

  // ================================================================ STREET: the marathon (title + SECOND 0)
  const RZ = 3.5, ARCH_X = -2, STOP = -4.4, V0 = 2.4, V1 = 5.6, TAU_A = 0.6, T_TAPE = 7.5;
  const D = (s) => V0 * s + (V1 - V0) * (s - TAU_A * (1 - Math.exp(-s / TAU_A)));
  const LS = ARCH_X + D(T_TAPE - SW);
  const Lraw = (t) => (t < SW ? LS + V0 * (SW - t) : LS - D(t - SW));
  const softStop = (raw, s, d = 0.6) => s + d * Math.log(1 + Math.exp((raw - s) / d));
  const arch = makeFinishArch('FINISH', 7.4); arch.g.position.set(ARCH_X, 0, RZ); street.root.add(arch.g);
  const barriers = [];
  for (let x = -12; x < 30; x += 2.3) for (const z of [0.45, 6.55]) { const b = makeBarrier(2.2); b.position.set(x, 0, z); street.root.add(b); barriers.push(b); }
  const RUN = [[0, 3.5], [1.3, 2.4], [1.7, 4.7], [2.7, 3.1], [3.4, 5.4], [4.0, 2.0], [4.9, 4.1], [5.6, 2.8], [6.5, 5.0]];
  const runners = RUN.map(([dx, z], i) => {
    const rig = i === 0 ? person({ skin: 0xe2ad8c, top: 0xf2b632, pants: 0x2f3a4a, shoes: 0xf2f2f2, hair: 0x2a1d16, hairStyle: 'short', mustache: 0x2a1d16 }) : civ({ top: [0xd2483f, 0x3d7bd9, 0x6fa84f, 0xe58fa6, 0x4fb3a8, 0x8f6fb8, 0xf2f2f2, 0xe08a3a][i % 8], pants: 0x2f3a4a, shoes: 0xf2f2f2 });
    rig.spine.add(makeBib([26, 512, 88, 1043, 7, 330, 2201, 64, 919][i]));
    return { rig, dx, z, i };
  });
  const runX = (R0, t) => softStop(Lraw(t) + R0.dx * (1 + 0.1 * Math.max(0, t - SW)), STOP + R0.dx * 0.42 + (R0.i % 3) * 0.25);
  const fans = Array.from({ length: 26 }, (_, i) => {
    const back = i % 2 === 0, row = Math.floor(i / 2) % 2, x = -11 + (Math.floor(i / 2) * 3.1) % 38 + row * 1.4;
    return { rig: civ(), x, z: back ? -0.15 - row * 0.85 : 7.15 + row * 0.85, back, k: i };
  });
  function raceScene(t, cam) {
    street.aimSun(4, 3.5, 22);
    arch.g.visible = true; barriers.forEach((b) => (b.visible = true));
    const tape = clamp((t - T_TAPE) / 0.5); arch.setTape(tape > 0 ? Math.min(1, 0.3 + tape) : 0, t);
    const after = Math.max(0, t - SW);
    runners.forEach((R0) => {
      const x = runX(R0, t), x2 = runX(R0, t - 0.04), sp = Math.abs(x - x2) / 0.04;
      const p = basePose(); p.eyes = blink(t, R0.i + 1);
      const z = R0.z + 0.08 * Math.sin(t * 1.3 + R0.i);
      Object.assign(p, { x, z, rotY: -PI / 2 + 0.05 * Math.sin(t + R0.i) });
      const fresh = smooth(clamp(after / 0.7));
      p.lean = lerp(0.2, 0.1, fresh); p.headPitch = lerp(0.12, -0.08, fresh); p.mouth = fresh > 0.5 ? 'smile' : 'o';
      put(R0.rig, 'street', p);
      const phi = PI * (2.6 * Math.min(t, SW) + 3.4 * after) + R0.i * 1.3, amp = clamp(0.085 * sp, 0, 0.46);
      if (amp > 0.03) runLegs(R0.rig, p, phi, amp);
      // the leader: arms up through the tape, then turns to the crowd, still beaming
      if (R0.i === 0 && t > T_TAPE - 0.25) { const up = smooth(clamp((t - T_TAPE + 0.25) / 0.3)); R0.rig.arms.forEach((arm) => { arm.shoulder.rotation.x = lerp(arm.shoulder.rotation.x, -2.75, up); arm.shoulder.rotation.z = arm.s * lerp(0.07, 0.45, up); arm.elbow.rotation.x = lerp(-1.55, -0.25, up); }); }
    });
    fans.forEach((F) => {
      const p = basePose(); p.eyes = blink(t, F.k + 9); Object.assign(p, { x: F.x, z: F.z, rotY: F.back ? 0.25 * Math.sin(F.k) : PI + 0.25 * Math.sin(F.k) });
      const lx = Lraw(t); p.headYaw = clamp((F.back ? 1 : -1) * Math.atan2(lx - F.x, 3) * 0.6, -0.8, 0.8);
      const hype = smooth(clamp((t - SW - 0.3 - (F.k % 5) * 0.12) / 0.4));
      if (F.k % 3 === 0 && hype > 0.5) { p.armA = CHEER; p.armB = CHEER; } else { p.armA = clapA(t + F.k, 0.5 + hype); p.armB = clapB(t + F.k, 0.5 + hype); }
      p.mouth = hype > 0.5 ? (F.k % 2 ? 'o' : 'smile') : 'smile';
      const hop = hype * 0.08 * Math.max(0, Math.sin(t * 9 + F.k));
      put(F.rig, 'street', p, { y: SIDEWALK_H + hop, floor: SIDEWALK_H + hop });
    });
    burst(W('street', ARCH_X, 4.3, RZ - 2.5), t, T_TAPE, 160, 4.5, 3.0);
    burst(W('street', ARCH_X, 4.3, RZ + 2.5), t, T_TAPE + 0.05, 160, 4.5, 3.0);
    jolt(t, SW, 0.02, 4); jolt(t, T_TAPE, 0.035, 5);
    // camera: runs backward ahead of the pack; after SECOND 0 the pack outruns it and it settles behind the finish line
    const L = Lraw(t), lead = runX(runners[0], t);
    if (cam === 'title') { const u = smooth(clamp(t / 3.4)); return { P: [L - lerp(11, 6.2, u), lerp(2.9, 1.5, u), lerp(2.9, 3.35, u)], A: [L + 2, lerp(1.2, 1.4, u), RZ], fov: 46 };}
    const camX = softStop(LS + V0 * (SW - t) - 6.2, -8.4, 0.8);
    return { P: [camX, 1.52, 3.35], A: [Math.max(camX + 3, lead + 1.0), 1.38, RZ + 0.05], fov: 48 };
  }

  // ================================================================ SUBURB: grandpa on the bench (+1 MIN)
  const [BX, BZ] = UD.bench;
  const gramps = person({ skin: 0xf1c3a1, top: 0x8a6f5a, collar: 0xe8e2d6, pants: 0x55606a, hair: 0xe8e6e2, hairStyle: 'short', glasses: true, mustache: 0xe8e6e2 });
  const cap = new THREE.Group(); gramps.head.g.add(cap); cap.position.set(0, 0.105, 0.005);
  mk(new THREE.SphereGeometry(0.142, 20, 10, 0, PI * 2, 0, PI / 2.3), mat(0x6a6a5a, 0.85), cap, 0, 0, 0).scale.set(1, 0.6, 1.05);
  mk(new THREE.BoxGeometry(0.2, 0.015, 0.09), mat(0x6a6a5a, 0.85), cap, 0, -0.005, 0.15).rotation.x = 0.15;
  const cane = new THREE.Group(); sub.root.add(cane); { const cm = mat(0x6a4a2a, 0.6); mk(new THREE.CylinderGeometry(0.014, 0.014, 0.88, 8), cm, cane, 0, 0.44, 0); const h = mk(new THREE.TorusGeometry(0.05, 0.014, 6, 12, PI), cm, cane, 0.05, 0.88, 0); void h; }
  cane.position.set(BX - 1.25, 0, BZ + 0.2); cane.rotation.z = -0.25;
  const pigeonM = mat(0x8a8f9a, 0.8);
  const pigeons = Array.from({ length: 9 }, (_, i) => { const g = new THREE.Group(); sub.root.add(g); mk(new THREE.SphereGeometry(0.12, 10, 8), pigeonM, g, 0, 0.12, 0).scale.set(1, 0.9, 1.5); const head = mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0x6a7080, 0.8), g, 0, 0.21, 0.14); const wl = new THREE.Group(), wr = new THREE.Group(); wl.position.y = wr.position.y = 0.15; g.add(wl, wr); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wl, -0.14, 0, 0); mk(new THREE.BoxGeometry(0.28, 0.015, 0.14), pigeonM, wr, 0.14, 0, 0); g.scale.setScalar(0.85); const u = 0.3 + (i % 5) * 0.1 + (i > 4 ? 0.05 : 0), lat = (i % 2 ? 1 : -1) * (0.12 + 0.1 * (i % 3)); return { g, head, wl, wr, x: lerp(BX + 1.15, BX - 0.6, u) + lat * 0.85, z: lerp(BZ + 2.9, BZ, u) - lat * 0.52, ry: i * 1.3 }; });
  const jogger = civ({ top: 0x3d7bd9, pants: 0x2a2d31, shoes: 0xf2f2f2, hairStyle: 'bob', hair: 0x9a6a3a });
  const stroller = civ({ top: 0xe58fa6, hairStyle: 'bob' });
  const T_BREATH = 9.7, T_UP = 11.1, T_FLY = 11.6;
  function benchScene(t) {
    sub.aimSun(BX, BZ, 10);
    const breath = smooth(clamp((t - T_BREATH) / 0.9)), up = smooth(clamp((t - T_UP) / 0.6)), str = smooth(clamp((t - T_UP - 0.55) / 0.45));
    const wheeze = t < T_BREATH ? 0.05 * Math.sin(t * 7) : 0;
    const p = basePose(); p.eyes = t > T_BREATH && t < T_UP ? 'closed' : blink(t, 3); p.glasses = true;
    Object.assign(p, { x: BX - 0.6 + 0.25 * up, z: BZ + 0.05 + 0.3 * up, rotY: 0.12 });
    p.lean = lerp(lerp(0.28 + wheeze, -0.22, breath), 0.02, up); p.headPitch = lerp(lerp(0.3, -0.35, breath), -0.1, up);
    p.armA = mixArm(mixArm(LAP_A, OUT, breath), STRETCH, str); p.armB = mixArm(mixArm(LAP_B, OUT, breath), STRETCH, str);
    p.mouth = breath > 0.2 && breath < 0.95 && t < T_UP ? 'o' : (t > T_BREATH ? 'smile' : 'flat');
    const ySeat = 0.475 - 0.795;
    p.footFwd = lerp(0.42, 0, up);
    put(gramps, 'sub', p, { y: lerp(ySeat, 0, up) + up * 0.05 * Math.max(0, Math.sin((t - T_UP - 0.6) * 9)) * (1 - str * 0.6) });
    gramps.spine.scale.set(1 + 0.06 * breath * (1 - up), 1 + 0.02 * breath, 1 + 0.08 * breath * (1 - up));
    // pigeons peck, then explode into the air when he springs up
    pigeons.forEach((g, i) => {
      const age = t - T_FLY - (i % 4) * 0.06, fly = age > 0;
      const pk = Math.max(0, Math.sin(t * 3 + i * 1.7)); g.head.position.y = 0.21 - 0.08 * pk * (fly ? 0 : 1);
      const a = i * 2.1 + 0.4, vx = Math.cos(a) * 1.6, vz = 0.8 + Math.abs(Math.sin(a)) * 1.2;
      g.g.position.set(g.x + (fly ? vx * age : 0), fly ? 3.2 * age - 0.25 * age * age : 0, g.z + (fly ? vz * age : 0));
      g.g.rotation.set(fly ? -0.4 : 0, fly ? Math.atan2(vx, vz) : g.ry, 0);
      const fl = fly ? Math.sin(t * 34 + i) : 0; g.wl.rotation.z = 0.9 * fl; g.wr.rotation.z = -0.9 * fl; g.g.visible = true;
    });
    burst(W('sub', BX - 0.3, 0.4, BZ + 1.4), t, T_FLY, 40, 3, 2.5, true);
    jolt(t, T_FLY, 0.02, 5);
    cane.visible = true;
    // background life: a jogger along the park path, a mom with a stroller
    { const q = basePose(); q.eyes = blink(t, 7); const x = BX - 3.1 - (t - 11.2) * 2.6; Object.assign(q, { x, z: BZ - 4.0, rotY: -PI / 2, dist: (t - 8.6) * 2.6, speed: 2.6 }); q.armA = A(-0.5, 0.15, -1.5, 0.3); q.armB = A(-0.5, 0.15, -1.5, -0.3); put(jogger, 'sub', q); }
    { const q = basePose(); q.eyes = blink(t, 8); const x = BX - 2.1 + (t - 11) * 0.9; Object.assign(q, { x, z: BZ - 2.4, rotY: PI / 2, dist: (t - 8.6) * 0.9, speed: 0.9 }); q.armA = HOLD_A; q.armB = HOLD_B; q.headYaw = 0.6 * smooth(clamp((t - T_FLY) / 0.4)); put(stroller, 'sub', q); }
    const u = smooth(clamp((t - 8.6) / 4.8));
    return { P: [BX + lerp(1.15, 0.85, u), lerp(1.08, 1.2, u) + 0.25 * up, BZ + lerp(2.9, 2.55, u)], A: [BX - 0.45, lerp(1.0, 1.15, u) + 0.45 * up, BZ - 0.1], fov: 46 };
  }

  // ================================================================ KITCHEN: birthday candles (+10 MIN)
  const TBX = 0.4, TBZ = -0.4, TOP = 0.75;
  const cake = makeCake({ candles: 7 }); cake.g.position.set(TBX, TOP, TBZ); kit.root.add(cake.g);
  const candleF = cake.wicks.map((w, i) => fire({ n: 1, r: 0, seed: 50 + i }));
  const whoomp = fire({ n: 9, r: 0.12, seed: 70 });
  const birthdayKid = kidRig({ skin: 0xc98e6a, top: 0xf2b632, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'messy' });
  const sis = kidRig({ skin: 0xc98e6a, top: 0xe58fa6, pants: 0x6b5a48, hair: 0x1a1a1a, hairStyle: 'bob' });
  const mom = person({ skin: 0xc98e6a, top: 0x4fb3a8, pants: 0x2f3a4a, hair: 0x2a1d16, hairStyle: 'bob' });
  const dad = person({ skin: 0xe2ad8c, top: 0xd2483f, pants: 0x45607a, hair: 0x5a3a24, hairStyle: 'short', glasses: true });
  const hatK = makePartyHat(0x3d7bd9), hatS = makePartyHat(0xe2574c), hatM = makePartyHat(0x58b368);
  birthdayKid.head.g.add(hatK); sis.head.g.add(hatS); mom.head.g.add(hatM);
  [hatK, hatS].forEach((h) => { h.position.set(0, 0.16, 0); h.scale.setScalar(1.15); }); hatM.position.set(0, 0.125, 0);
  const lighter = new THREE.Group(); mk(new THREE.BoxGeometry(0.02, 0.025, 0.2), mat(0xd2483f, 0.4), lighter, 0, 0, 0.05); mk(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 6), mat(0xcfd3d8, 0.3, { metalness: 0.7 }), lighter, 0, 0, 0.2).rotation.x = PI / 2; scene.add(lighter);
  const lighterF = fire({ n: 1, r: 0, seed: 80 });
  const balloonsK = [0xe2574c, 0xf2b632, 0x3d7bd9].map((c, i) => { const b = makeBalloon(c); b.position.set(-1.3 + i * 0.25, 0.9, -2.2); kit.root.add(b); return b; });
  kit.chairs.forEach((c) => (c.visible = false));
  const kChair = (x, z, ry) => { const g = new THREE.Group(), w = mat(0xb07a4a, 0.6); mk(new THREE.BoxGeometry(0.42, 0.04, 0.42), w, g, 0, 0.45, 0); mk(new THREE.BoxGeometry(0.42, 0.5, 0.04), w, g, 0, 0.72, -0.2); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) mk(new THREE.BoxGeometry(0.035, 0.45, 0.035), w, g, a, 0.225, b); g.position.set(x, 0, z); g.rotation.y = ry; kit.root.add(g); return g; };
  kChair(TBX + 0.02, TBZ - 0.72, 0); kChair(TBX - 0.45, TBZ - 0.62, 0.35);
  const T_LIGHT = 13.7, T_BLOW = 16.25, T_WHOOMP = 16.85;
  const sootK = sootify(birthdayKid);
  function cakeScene(t) {
    // dad lights the candles one by one; each flares tall (0.03 m is a normal candle flame; these jump to ~0.22 m)
    const whK = pulse(t, T_WHOOMP, 0.12, 0.35, 0.9);
    cake.wicks.forEach((w, i) => {
      const lit = t - (T_LIGHT + 0.16 + i * 0.17); const blow = smooth(clamp((t - T_BLOW) / 0.3)) * (1 - smooth(clamp((t - T_WHOOMP) / 0.15)));
      const h = lit < 0 ? 0 : (0.05 + 0.2 * smooth(clamp(lit / 0.35))) * (1 + 0.6 * blow) * (1 - 0.6 * whK);
      const f = candleF[i]; f.g.position.copy(W('kit', TBX + w.x, TOP + w.y, TBZ + w.z)); f.update(t, h, { wind: [0, 0.5 * blow], width: 0.55 });
    });
    whoomp.g.position.copy(W('kit', TBX, TOP + 0.22, TBZ)); whoomp.update(t, 0.85 * whK, { width: 0.8, maxW: 0.13 });
    // kid: grins at the flaring candles, eyes wide, blows (leans in), WHOOMP: sits back hard, hat flies, sooty cheeks
    const back = pulse(t, T_WHOOMP, 0.12, 0.6, 0.6), lean = smooth(clamp((t - T_BLOW + 0.3) / 0.3)) * (1 - smooth(clamp((t - T_WHOOMP) / 0.1)));
    { const p = basePose(); p.eyes = t > T_WHOOMP && t < T_WHOOMP + 0.3 ? 'closed' : blink(t, 1); Object.assign(p, { x: TBX + 0.02, z: TBZ - 0.66, rotY: 0 });
      p.lean = 0.05 + 0.35 * lean - 0.3 * back; p.headPitch = 0.2 * lean - 0.25 * back; p.mouth = lean > 0.4 || (t > T_LIGHT + 1 && t < T_BLOW - 0.4) ? 'o' : 'smile';
      p.armA = mixArm(A(-0.95, 0.2, -1.0, 0.4), FLINCH_A, back); p.armB = mixArm(A(-0.95, 0.2, -1.0, -0.4), FLINCH_B, back);
      seatKid(birthdayKid, 'kit', p, 0.47); }
    sootK(smooth(clamp((t - T_WHOOMP) / 0.3)));
    { const ha = t - T_WHOOMP; if (ha > 0) { hatK.position.set(0.05 * ha, 0.16 + 2.2 * ha - 4.9 * ha * ha * 0.8, -0.3 * ha); hatK.rotation.set(-2 * ha, 0, 3 * ha); if (hatK.position.y < -0.6) hatK.visible = false; } else { hatK.position.set(0, 0.16, 0); hatK.rotation.set(0, 0, 0); hatK.visible = true; } }
    { const p = basePose(); p.eyes = blink(t, 2); Object.assign(p, { x: TBX - 0.42, z: TBZ - 0.55, rotY: 0.35 }); p.mouth = t > T_LIGHT + 0.8 ? 'o' : 'smile'; p.lean = -0.25 * back; p.armA = mixArm(A(-0.9, 0.25, -1.6, 0.6), FLINCH_A, back); p.armB = mixArm(A(-0.9, 0.25, -1.6, -0.6), FLINCH_B, back); seatKid(sis, 'kit', p, 0.47); }
    { const p = basePose(); p.eyes = blink(t, 4); Object.assign(p, { x: TBX + 0.5, z: TBZ - 1.05, rotY: -0.35 }); p.lean = 0.22 - 0.4 * back; p.armA = mixArm(clapA(t, 0.6), FLINCH_A, back); p.armB = mixArm(clapB(t, 0.6), FLINCH_B, back); p.mouth = t > T_LIGHT + 1.2 ? 'o' : 'smile'; p.headPitch = 0.25; put(mom, 'kit', p); }
    { const reach = smooth(clamp((t - T_LIGHT) / 0.25)) * (1 - smooth(clamp((t - T_LIGHT - 1.4) / 0.3)));
      const p = basePose(); p.eyes = blink(t, 5); p.glasses = true; Object.assign(p, { x: TBX - 0.5, z: TBZ - 1.12, rotY: 0.55 }); p.lean = 0.2 + 0.25 * reach - 0.45 * back; p.crouch = 0.12 * reach; p.headPitch = 0.3;
      p.armB = mixArm(A(-0.5, 0.15, -1.2, -0.3), A(-1.25, 0.15, -0.35, -0.2), reach); p.armA = mixArm(REST, FLINCH_A, back); p.mouth = back > 0.3 ? 'o' : 'smile';
      put(dad, 'kit', p);
      const hw = hand(dad, 1); lighter.position.copy(hw); lighter.lookAt(W('kit', TBX, TOP + 0.3, TBZ)); lighter.visible = true;
      const tip = new THREE.Vector3(0, 0, 0.26).applyQuaternion(lighter.quaternion).add(hw); lighterF.g.position.copy(tip); lighterF.update(t, reach > 0.5 ? 0.04 : 0, { width: 0.6 }); }
    smokeCol(W('kit', TBX, TOP + 0.3, TBZ), t, 0.35 * whK + 0.08 * (t > T_LIGHT + 1 ? 1 : 0), 6, smokeC, 0.15);
    jolt(t, T_WHOOMP, 0.02, 5);
    balloonsK.forEach((b, i) => { b.visible = true; b.rotation.z = 0.06 * Math.sin(t * 1.3 + i) + 0.2 * back * (i - 1); });
    const u = smooth(clamp((t - 13.4) / 5.2)), pb = smooth(clamp((t - T_WHOOMP) / 0.5));
    return { P: [TBX + lerp(0.12, 0.05, u), lerp(1.12, 1.16, u) + 0.1 * pb, lerp(1.3, 1.0, u) + 0.45 * pb], A: [TBX - 0.02, lerp(1.08, 1.1, u) + 0.32 * pb, TBZ - 0.6], fov: 50 };
  }

  // ================================================================ SUBURB: the backyard grill (+30 MIN)
  const GX = -2.6, GZ = -4.6;
  const grill = makeGrill(); grill.g.position.set(GX, 0, GZ); sub.root.add(grill.g);
  const grillF = fire({ n: 11, r: 0.2, seed: 90 });
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(96, 128, (c, w, h) => { c.fillStyle = '#3d6fb3'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; for (let x = 6; x < w; x += 18) c.fillRect(x, 0, 6, h); c.fillStyle = '#f2f2ee'; c.fillRect(18, 40, 60, 34); c.fillStyle = '#c8231e'; c.font = 'bold 22px Helvetica, Arial'; c.textAlign = 'center'; c.fillText('#1', 48, 66); }) })); dad.spine.add(apron); apron.position.set(0, 0.14, 0.165); apron.visible = false;
  const spatula = new THREE.Group(); mk(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), mat(0x2a2a2a, 0.5), spatula, 0, 0, 0.15).rotation.x = PI / 2; mk(new THREE.BoxGeometry(0.09, 0.006, 0.11), mat(0xcfd3d8, 0.3, { metalness: 0.7 }), spatula, 0, 0, 0.34); scene.add(spatula);
  const bbqKid = kidRig({ skin: 0xe2ad8c, top: 0x58b368, pants: 0x45607a, hair: 0x5a3a24, hairStyle: 'messy' });
  const neighbor = civ({ top: 0x8f6fb8, hairStyle: 'none', mustache: 0x5a3a24, glasses: false });
  const plate = mk(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 18), mat(0xf6f6f6, 0.4), scene, 0, 0, 0);
  const sootD = sootify(dad);
  const T_LID = 18.95, T_LITE = 19.5, T_BOOM = 20.3;
  const pattyFly = [[0.0, 7.2, 0.4, 0.9, 'grill'], [0.3, 6.4, -0.3, 1.15, 'head'], [-0.25, 6.0, 0.3, 1.0, 'plate'], [0.2, 7.8, -0.5, 1.3, 'away']];
  function bbqScene(t) {
    sub.aimSun(GX, GZ, 10);
    grill.g.visible = true; { const k = smooth(clamp((t - T_LID) / 0.4)); grill.lid.position.set(0.5 * k, 0.83 - 0.42 * k, -0.33 + 0.12 * k); grill.lid.rotation.set(0, 0, -1.35 * k); }
    const boom = smooth(clamp((t - T_BOOM) / 0.18)), decay = smooth(clamp((t - T_BOOM - 0.8) / 1.6));
    const h = t < T_LITE ? 0 : t < T_BOOM ? 0.12 : lerp(4.2, 0.9, decay) * boom;
    grillF.g.position.copy(W('sub', GX, 0.82, GZ)); grillF.update(t, h, { width: 1, maxW: 0.5, spread: 1 });
    smokeCol(W('sub', GX, 0.9, GZ), t, h * 0.8, 10, smokeC, 0.6);
    burst(W('sub', GX, 1.0, GZ), t, T_BOOM, 70, 6, 1.5, true);
    jolt(t, T_BOOM, 0.04, 4);
    const flinch = pulse(t, T_BOOM, 0.1, 0.9, 0.5);
    // dad: lid, lighter, FWOOMP (leans back, hands up), sooty face, deadpan; a patty lands on his head
    { const p = basePose(); p.eyes = t > T_BOOM && t < T_BOOM + 0.25 ? 'closed' : blink(t, 5); p.glasses = true; Object.assign(p, { x: GX - 0.58, z: GZ - 0.5, rotY: 0.55 });
      const lid = pulse(t, T_LID - 0.2, 0.25, 0.3, 0.3), lite = pulse(t, T_LITE - 0.3, 0.25, 0.4, 0.3);
      p.armA = mixArm(mixArm(A(-0.4, 0.2, -0.9, 0.3), A(-1.3, 0.3, -0.6, 0.2), lid), FLINCH_A, flinch);
      p.armB = mixArm(mixArm(A(-0.9, 0.18, -1.0, -0.3), A(-1.2, 0.12, -0.45, -0.1), lite), FLINCH_B, flinch);
      p.lean = 0.1 * lite - 0.35 * flinch; p.headPitch = 0.25 * (1 - flinch) - 0.35 * flinch; p.mouth = t > T_BOOM && t < T_BOOM + 1.6 ? 'o' : 'flat';
      if (t > T_BOOM + 1.6) { p.headPitch = 0.0; p.armB = A(-0.9, 0.18, -1.0, -0.3); }
      put(dad, 'sub', p); apron.visible = true; sootD(smooth(clamp((t - T_BOOM) / 0.3)));
      const hw = hand(dad, 1); spatula.position.copy(hw); spatula.lookAt(hw.clone().add(new THREE.Vector3(0.1, -0.3, 0.6))); spatula.visible = t > T_BOOM + 1.6;
      lighter.position.copy(hw); lighter.lookAt(W('sub', GX, 0.85, GZ)); lighter.visible = t < T_BOOM + 0.2; }
    { const p = basePose(); p.eyes = blink(t, 6); Object.assign(p, { x: GX + 0.62, z: GZ + 0.42, rotY: -0.9 }); p.armB = A(-1.0, 0.15, -1.1, -0.3); p.armA = mixArm(A(-1.0, 0.15, -1.1, 0.3), FLINCH_A, flinch); p.mouth = t > T_BOOM ? 'o' : 'smile'; p.headPitch = -0.3 * flinch - 0.15;
      put(bbqKid, 'sub', p, { s: KS }); const hw = hand(bbqKid, 1); plate.position.copy(hw).add(new THREE.Vector3(0, 0.03, 0)); plate.visible = true; }
    // patties: launched by the blast, ballistic, landing on the grill / dad's head / the kid's plate / over the fence
    const dh = headW(dad);
    pattyFly.forEach(([vx, vy, vz, T, where], i) => {
      const P0 = grill.patties[i], a = t - T_BOOM - 0.05;
      const homeP = new THREE.Vector3(GX - 0.12 + (i % 2) * 0.22, 0.82, GZ - 0.1 + Math.floor(i / 2) * 0.2);
      if (a < 0) { P0.position.set(homeP.x - GX, 0.82, homeP.z - GZ); P0.rotation.set(0, 0, 0); return; }
      const end = where === 'head' ? new THREE.Vector3(dh.x - OFF.sub[0], dh.y + 0.17, dh.z - OFF.sub[2]) : where === 'plate' ? plate.position.clone().sub(new THREE.Vector3(...OFF.sub)).add(new THREE.Vector3(0, 0.02, 0)) : where === 'grill' ? homeP : new THREE.Vector3(GX - 6, 0.05, GZ - 1);
      const u = clamp(a / T), pos = homeP.clone().lerp(end, u); pos.y += vy * T * u * (1 - u) * 0.5 * 1.6;
      P0.position.set(pos.x - GX, pos.y, pos.z - GZ); P0.rotation.set(a * 9 * (1 - u), 0, a * 6 * (1 - u));
    });
    { const p = basePose(); p.eyes = blink(t, 7); Object.assign(p, { x: GX - 1.15, z: GZ - 2.6, rotY: 0.35 }); p.armA = A(-0.9, 0.3, -1.2, 0.5); p.armB = mixArm(A(-0.9, 0.3, -1.2, -0.5), FLINCH_B, flinch); p.mouth = t > T_BOOM ? 'o' : 'smile'; put(mom, 'sub', p); void neighbor; }
    const tilt = smooth(clamp((t - T_BOOM) / 0.35)) * (1 - smooth(clamp((t - T_BOOM - 1.5) / 0.8)));
    const u = smooth(clamp((t - 18.6) / 5.2));
    return { P: [GX + lerp(0.55, 0.4, u), 1.25 + 0.5 * tilt, GZ + lerp(3.3, 2.8, u) + 1.4 * tilt], A: [GX - 0.05, lerp(1.2, 1.3, u) + 2.2 * tilt, GZ - 0.6], fov: 50 };
  }

  // ================================================================ WOODS: the campsite (+2 H) and the forest (+1 DAY)
  const CX = 1.6, CZ = 1.6;
  const camp = makeCampfire(); camp.g.position.set(CX, 0, CZ); woods.root.add(camp.g);
  const campF = fire({ n: 13, r: 0.25, seed: 100 });
  const tent = makeTent(0xe08a3a); tent.position.set(4.6, 0, -0.6); tent.rotation.y = -0.9; woods.root.add(tent);
  const logSeat = mk(new THREE.CylinderGeometry(0.17, 0.17, 3.0, 12), mat(0x6a4a30, 0.95), woods.root, CX, 0.17, CZ + 1.45); logSeat.rotation.z = PI / 2;
  const camper = [kidRig({ skin: 0xf1c3a1, top: 0xd2483f, pants: 0x45607a, hair: 0xd9b46a, hairStyle: 'bob' }),
    person({ skin: 0x9a6447, top: 0x4f8a5a, pants: 0x6b5a48, hair: 0x1a1a1a, hairStyle: 'short', glasses: false }),
    kidRig({ skin: 0x9a6447, top: 0xf2b632, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'messy' })];
  const sticks = camper.map(() => { const s = makeStick(); scene.add(s.g); return s; });
  const mallowF = camper.map((_, i) => fire({ n: 2, r: 0.02, seed: 110 + i }));
  const T_LEAP = 25.0;
  const camperX = [CX - 0.62, CX, CX + 0.62];
  function campScene(t) {
    woods.setMode('summer', t); woods.setShadowFocus(CX, CZ, 8);
    const leap = smooth(clamp((t - T_LEAP) / 0.22)), settle = smooth(clamp((t - T_LEAP - 0.45) / 0.9));
    const h = lerp(0.6, lerp(3.2, 0.95, settle), leap);
    campF.g.position.copy(W('woods', CX, 0.12, CZ)); campF.update(t, h, { width: 1, maxW: 0.55 });
    smokeCol(W('woods', CX, 0.2, CZ), t, h, 9, smokeC, 0.5);
    jolt(t, T_LEAP, 0.035, 4);
    burst(W('woods', CX, 0.6, CZ), t, T_LEAP, 60, 5, 1.4, false);
    const flinch = pulse(t, T_LEAP, 0.1, 0.6, 0.5), torch = smooth(clamp((t - 26.2) / 0.5));
    camper.forEach((rig, i) => {
      const kid = i !== 1, p = basePose(); p.eyes = blink(t, 11 + i); Object.assign(p, { x: camperX[i], z: CZ + 1.42, rotY: PI + (i - 1) * 0.18 });
      p.lean = 0.12 - 0.35 * flinch; p.headPitch = 0.15 - 0.2 * flinch - 0.25 * torch;
      const fwd = A(-1.05, 0.12, -0.3, i === 1 ? -0.2 : 0.2), up = A(-2.5, 0.35, -0.3, 0);
      p.armB = mixArm(mixArm(fwd, FLINCH_B, flinch * 0.6), up, torch); p.armA = mixArm(i === 0 ? REST : A(-0.6, 0.2, -1.1, 0.4), FLINCH_A, flinch);
      p.mouth = t > T_LEAP ? (torch > 0.5 ? (i === 1 ? 'smile' : 'o') : 'o') : 'smile';
      if (kid) seatKid(rig, 'woods', p, 0.34); else seatAdult(rig, 'woods', p, 0.34);
      const hw = hand(rig, 1), S = sticks[i];
      S.g.position.copy(hw); S.g.lookAt(torch > 0.01 ? hw.clone().add(new THREE.Vector3(0.1 * (i - 1), lerp(-0.25, 1, torch), lerp(-1, -0.25, torch))) : W('woods', CX + (i - 1) * 0.15, 0.95, CZ)); S.g.visible = true;
      const tip = S.tip.clone().applyQuaternion(S.g.quaternion).add(hw);
      const burn = smooth(clamp((t - T_LEAP - 0.15 - i * 0.12) / 0.2));
      S.mallow.material.color.setHex(0xfbf7ee).lerp(new THREE.Color(0x2a2220), burn);
      mallowF[i].g.position.copy(tip).add(new THREE.Vector3(0, 0.02, 0)); mallowF[i].update(t, 0.22 * burn, { width: 0.5 });
    });
    const u = smooth(clamp((t - 23.8) / 5)), tilt = pulse(t, T_LEAP, 0.2, 0.7, 0.8);
    return { P: [CX + lerp(0.15, 0.05, u), lerp(1.75, 1.6, u) + 0.3 * tilt, CZ - lerp(1.45, 1.15, u) - 0.5 * tilt], A: [CX + 0.02, 0.95 + 1.0 * tilt, CZ + 1.5], fov: 50 };
  }
  // forest: crowns burning in the trees north of the clearing
  const burnTrees = woods.trees.filter((tr) => { const x = tr.t.position.x, z = tr.t.position.z; return z < -9 && z > -32 && Math.abs(x) < 14; }).slice(0, 10);
  const crownF = burnTrees.map((tr, i) => ({ tr, f: fire({ n: 9, r: 1.0, seed: 130 + i }) }));
  const ff1 = person({ skin: 0xe2ad8c, top: 0xe8c23a, pants: 0x4a5a3a, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'short', mustache: 0x5a3a24 });
  const ff2 = person({ skin: 0x6e4430, top: 0xe8c23a, pants: 0x4a5a3a, shoes: 0x3a2e2a, hair: 0x1a1a1a, hairStyle: 'short' });
  const helm1 = makeHelmet(0xc8231e), helm2 = makeHelmet(0xf2f2ee); ff1.head.g.add(helm1); ff2.head.g.add(helm2); [helm1, helm2].forEach((h) => { h.position.set(0, 0.125, -0.01); h.scale.setScalar(0.88); });
  const radio = mk(new THREE.BoxGeometry(0.05, 0.12, 0.03), mat(0x222222, 0.5), scene, 0, 0, 0);
  const bushF = fire({ n: 8, r: 0.5, seed: 150 });
  const branch = new THREE.Group(); mk(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 8), mat(0x3a2a20, 0.95), branch, 0, 0, 0).rotation.z = PI / 2; scene.add(branch);
  const branchF = fire({ n: 6, r: 0.5, seed: 160 });
  const T_DROP = 31.4;
  function forestScene(t) {
    woods.setMode('summer', t); woods.setShadowFocus(0, -6, 12);
    crownF.forEach(({ tr, f }, i) => {
      tr.t.updateMatrixWorld(true); const cw = tr.crown.getWorldPosition(new THREE.Vector3());
      f.g.position.copy(cw).add(new THREE.Vector3(0, -1.4, 0)); f.update(t + i, (3.2 + 0.6 * Math.sin(i)) * (0.75 + 0.25 * Math.sin(t * 0.7 + i)) * (1 + 0.6 * pulse(t, T_DROP - 0.3, 0.15, 0.4, 0.8) * (i === 0 ? 1 : 0)), { spread: 1.2, maxW: 1.1 });
      if (i < 6) smokeCol(cw, t + i * 0.4, 2.2, 5, smokeC, 1.4);
    });
    // a burning bush near the line, hosed down by ff1
    const BU = [-1.0, -10.2], douse = smooth(clamp((t - 32.0) / 1.2));
    bushF.g.position.copy(W('woods', BU[0], 0.05, BU[1])); bushF.update(t, 1.3 * (1 - douse) + 0.05, { width: 1, maxW: 0.6 });
    { const p = basePose(); p.eyes = blink(t, 12); Object.assign(p, { x: BU[0] + 1.6, z: BU[1] + 2.4, rotY: faceTo(BU[0] + 1.6, BU[1] + 2.4, BU[0], BU[1]) }); p.armA = HOLD_A; p.armB = HOLD_B; p.lean = 0.15; p.footFwd = 0.1; p.mouth = 'flat'; put(ff1, 'woods', p);
      const hw = hand(ff1, 1); stream(hw, W('woods', BU[0], 0.6, BU[1]), t, 0.5, 40); for (let k = 0; k < 4; k++) puff(W('woods', BU[0] + 0.4 * Math.sin(k * 2 + t), 0.8 + ((t * 0.8 + k / 4) % 1) * 1.6, BU[1] + 0.3 * Math.cos(k)), 0.9 + k * 0.2, 0.55 * douse + 0.25, steamC); }
    // ff2 on the radio, facing us, the burning tree line behind; ducks when the branch drops
    const duck = pulse(t, T_DROP + 0.35, 0.12, 0.5, 0.5);
    { const p = basePose(); p.eyes = blink(t, 13); Object.assign(p, { x: 1.05, z: -4.7, rotY: 0.1 }); p.armB = mixArm(RADIO_B, FLINCH_B, duck); p.armA = mixArm(t > 30.2 ? A(-1.0, 0.2, -0.2, 0) : REST, FLINCH_A, duck); p.crouch = 0.25 * duck; p.lean = 0.35 * duck; p.headYaw = t < T_DROP + 0.2 ? 0.25 : -0.5 * (1 - duck);
      p.mouth = Math.sin(t * 11) > 0.2 && t < T_DROP ? 'o' : (duck > 0.1 ? 'o' : 'flat'); put(ff2, 'woods', p); const hw = hand(ff2, 1); radio.position.copy(hw).add(new THREE.Vector3(0, 0.05, 0)); radio.visible = true; }
    // a burning branch falls from tree 0 (lands at T_DROP + 0.7)
    { const tr = burnTrees[0], cw = tr ? tr.crown.getWorldPosition(new THREE.Vector3()) : W('woods', -3, 6, -12);
      const a = clamp((t - T_DROP) / 0.7), land = W('woods', -0.2, 0.08, -8.0);
      const pos = cw.clone().lerp(land, a); pos.y = lerp(cw.y - 1, 0.08, a * a); branch.position.copy(pos); branch.rotation.set(0, 0.5, a < 1 ? 1.4 * a : 0.05); branch.visible = true;
      branchF.g.position.copy(pos); branchF.update(t, 0.8 * (1 - smooth(clamp((t - 33.0) / 0.6))), { spread: 1.4, width: 0.8 });
      burst(land, t, T_DROP + 0.7, 50, 3.5, 1.4, false); jolt(t, T_DROP + 0.7, 0.03, 5); for (let k = 0; k < 6; k++) { const age = t - T_DROP - 0.7; if (age > 0 && age < 1.6) puff(land.clone().add(new THREE.Vector3(Math.cos(k) * age * 1.2, 0.3 + age * 0.4, Math.sin(k) * age)), 0.9 + age, 0.6 * (1 - age / 1.6), dustC); } }
    const u = smooth(clamp((t - 28.8) / 5));
    return { P: [lerp(1.45, 1.3, u), lerp(1.6, 1.55, u), lerp(-2.3, -2.7, u)], A: [lerp(-0.5, -0.7, u), lerp(2.4, 2.25, u), -12], fov: 52 };
  }

  // ================================================================ STREET: downtown, the hot-dog cart fire (+1 DAY)
  const [CAX, CAZ] = SD.spots.cart;
  const truck = makeFireTruck(); truck.g.position.set(1.6, 0, 4.6); street.root.add(truck.g);
  const cartF = fire({ n: 12, r: 0.55, seed: 170 }), umbF = fire({ n: 7, r: 0.6, seed: 171 });
  const ffA = person({ skin: 0xf1c3a1, top: 0x3a3c3a, collar: 0xe8c23a, pants: 0x3a3c3a, shoes: 0x1c1c1e, hair: 0x9a6a3a, hairStyle: 'short' });
  const ffB = person({ skin: 0x9a6447, top: 0x3a3c3a, collar: 0xe8c23a, pants: 0x3a3c3a, shoes: 0x1c1c1e, hair: 0x1a1a1a, hairStyle: 'short' });
  const stripeM = mat(0xe8e05a, 0.4);
  [ffA, ffB].forEach((r, i) => { const h = makeHelmet(i ? 0xf2f2ee : 0xd8b02a); r.head.g.add(h); h.position.set(0, 0.125, -0.01); h.scale.setScalar(0.88); for (const y of [0.13, 0.36]) { const s = mk(new THREE.CylinderGeometry(0.188, 0.188, 0.04, 22, 1, true), stripeM, r.spine, 0, y, 0); s.scale.set(1.12, 1, 0.8); } });
  const vendor = civ({ top: 0xf2f2f2, pants: 0x2f3a4a, hairStyle: 'none', mustache: 0x2a1d16, glasses: false });
  const watchers = [civ(), civ(), civ(), civ()];
  const umbrella = street.cart.children.find((o) => o.isGroup && Math.abs(o.position.y - 2.45) < 0.01) || new THREE.Group();
  const awnings = []; street.root.traverse((o) => { if (o.isMesh && o.position.y > 2.4 && o.position.y < 3.3 && o.position.z > -3 && o.position.z < -1 && o.position.x > 1 && o.position.x < 11) awnings.push(o); });
  const T_OUT = 37.2;
  function truckScene(t) {
    street.aimSun(CAX, CAZ, 10); arch.g.visible = false; barriers.forEach((b) => (b.visible = false));
    truck.g.visible = true; truck.setLights(t, 1); umbrella.visible = false; awnings.forEach((o) => (o.visible = false));
    const out = smooth(clamp((t - T_OUT) / 0.5)), grow = 1 + 0.35 * pulse(t, 34.6, 0.2, 0.5, 0.6);
    const ch = lerp(1.25, 0, out) * grow;
    cartF.g.position.copy(W('street', CAX, SIDEWALK_H + 0.9, CAZ)); cartF.update(t, ch, { width: 1, maxW: 0.42 });
    umbF.g.position.copy(W('street', CAX, SIDEWALK_H + 1.15, CAZ + 0.2)); umbF.update(t + 3, 0.55 * (1 - out) * grow, { width: 1, maxW: 0.35 });
    smokeCol(W('street', CAX - 0.3, SIDEWALK_H + 1.0, CAZ + 0.3), t, Math.max(0.25, ch * 0.5), 5, out > 0.5 ? steamC : smokeC, 0.35);
    // the knockdown: a white steam burst when it goes out
    for (let k = 0; k < 10; k++) { const age = t - T_OUT; if (age > 0 && age < 1.8) puff(W('street', CAX - 0.7 + Math.cos(k * 2.4) * age * 0.9, SIDEWALK_H + 1.0 + age * 1.1 + (k % 3) * 0.2, CAZ + 0.6 + Math.sin(k * 2.4) * age * 0.6), 0.35 + age * 0.5, 0.6 * (1 - age / 1.8), steamC); }
    jolt(t, T_OUT, 0.02, 4); jolt(t, 34.6, 0.02, 5);
    const crew = [[ffA, CAX - 2.0, CAZ + 2.6, 1], [ffB, CAX - 2.9, CAZ + 3.1, 2]];
    crew.forEach(([rig, x, z, k]) => {
      const p = basePose(); p.eyes = blink(t, 20 + k); Object.assign(p, { x, z, rotY: faceTo(x, z, CAX, CAZ) + (k === 2 ? 0.15 : 0) }); p.lean = 0.18; p.footFwd = 0.12;
      p.armA = HOLD_A; p.armB = HOLD_B; p.mouth = t > T_OUT + 0.3 ? 'smile' : 'flat'; p.headPitch = 0.05; put(rig, 'street', p);
    });
    { const hw = hand(ffA, 1), aim = W('street', CAX - 0.1, SIDEWALK_H + 1.1 + 0.3 * Math.sin(t * 1.4), CAZ); stream(hw, aim, t, 0.35, 44); }
    { const hw = hand(ffB, 1), aim = W('street', CAX + 0.2, SIDEWALK_H + 1.6, CAZ - 0.1); stream(hw, aim, t + 0.3, 0.45, 40); }
    { const p = basePose(); p.eyes = blink(t, 25); Object.assign(p, { x: CAX - 1.1, z: CAZ + 1.35, rotY: faceTo(CAX - 1.1, CAZ + 1.35, CAX, CAZ) + 0.9 }); p.armB = A(-1.0, 0.2, -1.2, -0.4); p.mouth = t > T_OUT ? 'smile' : 'flat'; p.headYaw = 0.3; put(vendor, 'street', p); }
    watchers.forEach((rig, i) => { const p = basePose(); p.eyes = blink(t, 30 + i); const x = -3.4 + i * 0.75, z = 7.5 + (i % 2) * 0.45; Object.assign(p, { x, z, rotY: faceTo(x, z, CAX, CAZ) }); p.armB = i % 2 ? A(-1.4, 0.15, -1.35, -0.45) : REST; p.armA = i === 2 ? clapA(t) : REST; if (i === 2) p.armB = clapB(t); p.mouth = t > T_OUT ? 'smile' : 'o'; put(rig, 'street', p, { y: SIDEWALK_H, floor: SIDEWALK_H }); });
    const u = smooth(clamp((t - 33.8) / 5));
    return { P: [CAX + lerp(2.1, 1.9, u), lerp(3.2, 3.05, u), CAZ - lerp(0.75, 0.6, u)], A: [CAX - 2.4, lerp(1.2, 1.3, u), CAZ + 2.8], fov: 52 };
  }

  // ================================================================ SUBURB: rust time-lapse (+10 YEARS)
  const car = makeCar(0xe9e1c8, 4); car.g.position.set(4.5, 0, -5.2); sub.root.add(car.g);
  const bumper = mk(new THREE.BoxGeometry(1.75, 0.16, 0.12), mat(0xcfd3d8, 0.3, { metalness: 0.7 }), car.g, 0, 0.42, 2.0);
  const bumperC = bumper.material.color.clone();
  const rustM = mat(0xa0521f, 0.95), blotches = [];
  for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, b = mk(new THREE.CircleGeometry(0.16 + (i % 4) * 0.05, 14), rustM, car.g, side * 0.93, 0.45 + (i % 3) * 0.12, -1.5 + (i >> 1) * 0.45); b.rotation.y = side * PI / 2; b.scale.y = 0.7; blotches.push(b); }
  for (let i = 0; i < 4; i++) { const b = mk(new THREE.CircleGeometry(0.14 + i * 0.03, 14), rustM, car.g, -0.6 + i * 0.4, 0.55 + (i % 2) * 0.1, 1.97); blotches.push(b); }
  const grayD = ageHair(dad);
  const T_BUMP = 42.6;
  const LAPSE = [ // the dad's time-lapse poses (jump every ~0.55 s): x, z, rotY, action
    [5.7, -2.7, 0.5, 'look'], [5.5, -3.2, 0.2, 'wipe'], [5.9, -2.6, 0.9, 'arms'], [5.6, -3.0, 0.1, 'kneel'], [5.7, -3.4, 0.6, 'wipe'],
    [5.9, -2.8, 0.3, 'look'], [5.6, -2.9, 0.7, 'kneel'], [5.75, -2.7, 0.5, 'look'], [5.75, -2.7, 0.5, 'look'],
  ];
  function rustScene(t) {
    const yrs = clamp((t - 39.0) / 3.4);
    // the sun races across the sky (days flicker by): sweep the shadow direction
    sub.aimSun(4.5, -5, 10);
    sub.lights.sun.position.set(4.5 + OFF.sub[0] + 30 * Math.cos(t * 7), 30, -5 + 20 * Math.sin(t * 7)); sub.lights.sun.target.position.set(4.5 + OFF.sub[0], 0, -5);
    car.g.visible = true; car.setRust(yrs * 1.3); blotches.forEach((b, i) => { const k = clamp(yrs * 1.6 - (i % 7) * 0.09); b.visible = k > 0.02; b.scale.set(k, k * 0.7, k); });
    bumper.material.color.copy(bumperC).lerp(new THREE.Color(0x7a4a2a), yrs); bumper.material.metalness = 0.7 * (1 - yrs);
    const fall = clamp((t - T_BUMP) / 0.3); bumper.position.set(0, 0.42 - 0.34 * fall * fall, 2.0 + 0.15 * fall); bumper.rotation.set(0.5 * fall, 0, 0.18 * fall);
    car.g.rotation.z = 0.04 * smooth(clamp((t - T_BUMP) / 0.4)); car.g.position.y = -0.03 * smooth(clamp((t - T_BUMP) / 0.4));
    grill.g.visible = true; grill.lid.rotation.x = 0; grill.patties.forEach((p) => (p.visible = false));
    grayD(yrs);
    const i = Math.min(LAPSE.length - 1, Math.floor((t - 38.8) / 0.55)), [x, z, ry, act] = LAPSE[i];
    { const p = basePose(); p.eyes = blink(t, 5); p.glasses = true; Object.assign(p, { x, z, rotY: faceTo(x, z, 6.5, 0.8) + (ry - 0.5) * 0.6 });
      if (act === 'wipe') { p.armB = A(-1.2, 0.2, -0.6 + 0.4 * Math.sin(t * 12), -0.2); p.lean = 0.3; }
      else if (act === 'kneel') { p.crouch = 0.34; p.lean = 0.5; p.armB = A(-1.0, 0.2, -0.4, -0.2); }
      else if (act === 'arms') { p.armA = A(0.1, 0.25, -2.0, 0.9); p.armB = A(0.1, 0.25, -2.0, -0.9); }
      p.mouth = 'flat'; p.lean -= 0.05 * yrs; p.headPitch = act === 'look' ? 0.25 : 0.1;
      if (t > T_BUMP) { p.headPitch = 0.3; p.mouth = 'o'; }
      put(dad, 'sub', p); apron.visible = false; sootD(0); }
    jolt(t, T_BUMP + 0.3, 0.025, 5);
    for (let k = 0; k < 6; k++) { const age = t - T_BUMP - 0.3; if (age > 0 && age < 1.4) puff(W('sub', 4.5 + Math.cos(k * 1.1) * age * 1.2 - 0.6, 0.2 + age * 0.3, -3.1 + Math.sin(k) * age * 0.4), 0.6 + age, 0.6 * (1 - age / 1.4), new THREE.Color(0xa8744a)); }
    // leaves blow past in the time-lapse
    const u = smooth(clamp((t - 38.8) / 5));
    return { P: [lerp(6.6, 6.4, u), lerp(1.5, 1.45, u), lerp(0.9, 0.6, u)], A: [lerp(4.75, 4.65, u), lerp(1.2, 1.15, u), -4.0], fov: 50 };
  }

  // ================================================================ PLAYGROUND: giant dragonflies (+ millions of years) + the wish
  const flies = Array.from({ length: 6 }, (_, i) => { const d = makeDragonfly({ span: 0.72, body: [0x2f7a6a, 0x3a6aa8, 0x7a5a2a][i % 3], seed: i + 3 }); scene.add(d.g); return d; });
  const crow = makeCrow(); crow.g.scale.setScalar(1.2); scene.add(crow.g);
  const PT = [3.4, 2.4];   // picnic table center (along x)
  const ptab = new THREE.Group(); ptab.position.set(PT[0], 0, PT[1]); play.root.add(ptab);
  { const w = mat(0xb5824e, 0.7); mk(new THREE.BoxGeometry(1.9, 0.05, 0.8), w, ptab, 0, 0.74, 0); for (const z of [-0.62, 0.62]) mk(new THREE.BoxGeometry(1.9, 0.04, 0.28), w, ptab, 0, 0.44, z); for (const x of [-0.75, 0.75]) for (const s of [-1, 1]) { const l = mk(new THREE.BoxGeometry(0.06, 0.95, 0.06), w, ptab, x, 0.4, s * 0.35); l.rotation.x = s * 0.55; }
    const cloth = mk(new THREE.BoxGeometry(1.95, 0.006, 0.85), new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (c, W2, H2) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#e2574c' : '#fbf6ee'; c.fillRect(x * 16, y * 16, 16, 16); } }, [3, 1.5]), roughness: 0.8 }), ptab, 0, 0.768, 0); void cloth; }
  const cake2 = makeCake({ candles: 1, r: 0.15 }); cake2.g.position.set(PT[0], 0.77, PT[1]); play.root.add(cake2.g);
  const candle2F = fire({ n: 1, r: 0, seed: 190 }), roar2 = fire({ n: 8, r: 0.08, seed: 191 });
  const balloons2 = [0xe2574c, 0xf2b632, 0x3d7bd9, 0x58b368].map((c, i) => { const b = makeBalloon(c); b.position.set(PT[0] - 1.05 + i * 0.1, 0.77, PT[1] + 0.25 + i * 0.08); b.scale.setScalar(1.2); play.root.add(b); return b; });
  const noa = kidRig({ skin: 0xc98e6a, top: 0x8f6fb8, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'bob' });
  const hatN = makePartyHat(0xf2b632); noa.head.g.add(hatN); hatN.position.set(0, 0.16, 0); hatN.scale.setScalar(1.15);
  const pal = kidRig({ skin: 0xf1c3a1, top: 0x58b368, pants: 0x2f3a4a, hair: 0xd9b46a, hairStyle: 'messy' });
  const pal2 = kidRig({ skin: 0x6e4430, top: 0xe2574c, pants: 0x6b5a48, hair: 0x1a1a1a, hairStyle: 'short' });
  const mom2 = person({ skin: 0xc98e6a, top: 0xf1c24a, pants: 0x2f3a4a, hair: 0x2a1d16, hairStyle: 'bob' });
  const dad2 = person({ skin: 0xe2ad8c, top: 0x4fb3a8, pants: 0x45607a, hair: 0x5a3a24, hairStyle: 'short', glasses: true });
  const ext = makeExtinguisher(); scene.add(ext.g);
  const playKids = [kidRig({ top: 0xe2574c }), kidRig({ top: 0x3d7bd9 }), kidRig({ top: 0xf2b632 }), kidRig({ top: 0x58b368 })];
  const sootN = sootify(noa);
  const flyPath = (i, t) => { // lazy loops over the playground (local coords)
    const a = t * (0.6 + 0.08 * i) + i * 1.7, r = 1.3 + 0.45 * (i % 3);
    return new THREE.Vector3(0.8 + Math.cos(a) * r, 1.75 + 0.35 * Math.sin(t * 1.3 + i) + (i % 2) * 0.45, -0.2 + Math.sin(a) * r * 0.8);
  };
  const T_SWOOP = 44.9, T_LAND = 47.2, T_SCARE = 48.3;
  function flyScene(t) {
    play.update(t, 1); play.aimSun(1.5, 0, 12);
    const part2 = t >= 46.4; play.riders.forEach((r) => { if (r.g) r.g.visible = false; else r.visible = false; });
    // kids on the carousel / in the sandbox; they duck as a dragonfly swoops over
    const duck = pulse(t, T_SWOOP + 0.35, 0.12, 0.5, 0.5);
    const kidSpots = [[0.75, 0.95, 0.2], [1.4, 0.45, -0.3], [0.2, -0.2, 0.4], [0.95, -0.7, -0.1]];
    playKids.forEach((rig, i) => { const [x, z, ry] = kidSpots[i], p = basePose(); p.eyes = blink(t, 40 + i); Object.assign(p, { x, z, rotY: ry + 0.2 * Math.sin(t * 0.8 + i) }); p.headPitch = -0.45 * (1 - duck) + 0.2 * duck; p.mouth = 'o'; p.armB = mixArm(i % 2 ? POINT_B : A(-2.3, 0.4, -0.4, 0), FLINCH_B, duck); p.armA = mixArm(i % 2 ? REST : CHEER, FLINCH_A, duck); p.crouch = 0.3 * duck; p.lean = 0.4 * duck; put(rig, 'play', p, { s: KS }); });
    flies.forEach((d, i) => {
      let pos = flyPath(i, t), look = flyPath(i, t + 0.08);
      if (i === 0) { // the swoop: from the back, low over the kids, past the lens
        const u = clamp((t - T_SWOOP) / 1.1); const a = new THREE.Vector3(0.3, 2.6, -6), b = new THREE.Vector3(0.7, 1.0, 0.6), c = new THREE.Vector3(1.6, 2.4, 6.5);
        const q = (k) => a.clone().multiplyScalar((1 - k) * (1 - k)).add(b.clone().multiplyScalar(2 * k * (1 - k))).add(c.clone().multiplyScalar(k * k));
        if (t < T_SWOOP) { pos = a; look = b; } else { pos = q(u); look = q(Math.min(1, u + 0.05)); if (u >= 1) look = pos.clone().add(new THREE.Vector3(0, 0, 1)); }
      }
      let side = false;
      if (i === 1 && part2) { // flies in, hovers broadside beside the crow (same size), lands on the table
        const land = new THREE.Vector3(PT[0] - 0.5, 0.8, PT[1] + 0.3), hov = land.clone().add(new THREE.Vector3(0, 0.3 + 0.04 * Math.sin(t * 5), 0)), u = smooth(clamp((t - 46.4) / 0.9));
        pos = flyPath(1, t).lerp(hov, u).lerp(land, smooth(clamp((t - T_LAND) / 0.4))); look = hov.clone().add(new THREE.Vector3(0.01, 0, -0.5)); side = u > 0.85;
      }
      d.g.position.copy(W('play', pos.x, pos.y, pos.z)); d.g.lookAt(W('play', look.x, look.y, look.z)); if (side) d.g.rotation.set(-0.1, PI / 2, t < T_LAND ? 0.8 : 0.35); d.update(t, i === 1 && t > T_LAND + 0.3 ? 0 : 28); d.g.visible = true;
    });
    // the crow on the table: hops, eyes the dragonfly (same size), squawks and flaps off
    { const scare = t - T_SCARE, base = new THREE.Vector3(PT[0] - 0.02, 0.77, PT[1] + 0.34);
      const pos = scare > 0 ? base.clone().add(new THREE.Vector3(1.2 * scare, 2.6 * scare - 0.5 * scare * scare, 1.4 * scare)) : base;
      crow.g.position.copy(W('play', pos.x, pos.y, pos.z)); crow.g.rotation.set(scare > 0 ? -0.4 : 0, scare > 0 ? 2.4 : -PI / 2 - 0.5 + 0.3 * Math.sin(t * 2), 0);
      crow.head.rotation.y = scare < 0 && t > T_LAND - 0.5 ? 0.5 : 0; crow.flap(scare > 0 ? 1 : 0, t); crow.g.visible = part2; }
    burst(W('play', PT[0] - 0.3, 1.0, PT[1] + 0.05), t, T_SCARE, 24, 2, 1.5, true);
    jolt(t, T_SCARE, 0.015, 5);
    // part 2: Noa at the picnic table, chin on her hands, watching both of them
    if (part2) { const p = basePose(); p.eyes = blink(t, 50); Object.assign(p, { x: PT[0] + 0.42, z: PT[1] + 0.62, rotY: PI + 0.35 }); p.armA = A(-1.5, 0.3, -2.0, 0.7); p.armB = A(-1.5, 0.3, -2.0, -0.7); p.lean = 0.25; p.headPitch = -0.1; p.headYaw = -0.4; p.mouth = t > T_SCARE ? 'o' : 'smile'; seatKid(noa, 'play', p, 0.46); }
    balloons2.forEach((b, i) => { b.visible = part2; b.rotation.z = 0.08 * Math.sin(t * 1.1 + i); });
    if (!part2) { const u = smooth(clamp((t - 43.8) / 2.6)); return { P: [lerp(1.35, 1.15, u), lerp(1.12, 1.05, u), lerp(3.3, 2.9, u)], A: [0.75, lerp(1.45, 1.35, u), -1.2], fov: 50 }; }
    const u = smooth(clamp((t - 46.4) / 3.4));
    return { P: [PT[0] - lerp(0.02, 0.1, u), lerp(1.45, 1.38, u), PT[1] - lerp(1.9, 1.6, u)], A: [PT[0] - 0.06, 0.92, PT[1] + 0.3], fov: 48 };
  }
  const T_WISH = 52.2, T_BLOW2 = 53.4, T_ROAR = 53.75, T_EXT = 55.0;
  function wishScene(t) {
    play.update(t, 1); play.aimSun(PT[0], PT[1], 8);
    const roar = pulse(t, T_ROAR, 0.15, 0.9, 0.3) * (1 - smooth(clamp((t - T_EXT) / 0.3)));
    const lit = t > 50.3, blow = smooth(clamp((t - T_BLOW2) / 0.25)) * (1 - smooth(clamp((t - T_ROAR) / 0.1)));
    const w = cake2.wicks[0];
    candle2F.g.position.copy(W('play', PT[0] + w.x, 0.77 + w.y, PT[1] + w.z)); candle2F.update(t, lit && t < T_EXT ? 0.2 * (1 + 0.5 * blow) : 0, { wind: [0, -0.6 * blow], width: 0.55 });
    roar2.g.position.copy(W('play', PT[0], 0.77 + 0.24, PT[1])); roar2.update(t, 0.9 * roar, { width: 1, maxW: 0.14 });
    smokeCol(W('play', PT[0], 1.0, PT[1]), t, 0.4 * roar, 5, smokeC, 0.15);
    jolt(t, T_ROAR, 0.02, 5);
    const back = pulse(t, T_ROAR, 0.1, 1.0, 0.7), laugh = smooth(clamp((t - T_EXT - 0.6) / 0.4));
    // foam: a white cloud over the cake (and Noa's face), then it settles
    for (let k = 0; k < 10; k++) { const age = t - T_EXT; if (age > 0) { const e = Math.min(age, 0.6); puff(W('play', PT[0] + Math.cos(k * 2.4) * (0.08 + e * 0.25), 0.86 + (k % 4) * 0.05 + e * 0.12, PT[1] + Math.sin(k * 2.4) * (0.06 + e * 0.15) + (k < 3 ? 0.55 : 0)), 0.16 + e * 0.3, Math.min(0.95, age * 4) * (1 - clamp((age - 2.0) / 1.5)) * 0.9, foamC); } }
    { const p = basePose(); p.eyes = t > T_WISH - 0.2 && t < T_BLOW2 - 0.1 ? 'closed' : blink(t, 50); Object.assign(p, { x: PT[0] + 0.02, z: PT[1] + 0.62, rotY: PI });
      const lean = smooth(clamp((t - T_BLOW2 + 0.25) / 0.25)) * (1 - smooth(clamp((t - T_ROAR) / 0.1)));
      const wish = smooth(clamp((t - T_WISH + 0.3) / 0.3)) * (1 - smooth(clamp((t - T_BLOW2 + 0.3) / 0.2)));
      p.armA = mixArm(mixArm(A(-0.9, 0.2, -1.0, 0.4), A(-1.35, 0.15, -1.9, 0.75), wish), FLINCH_A, back * (1 - laugh)); p.armB = mixArm(mixArm(A(-0.9, 0.2, -1.0, -0.4), A(-1.35, 0.15, -1.9, -0.75), wish), FLINCH_B, back * (1 - laugh));
      if (laugh > 0) { p.armA = mixArm(p.armA, CHEER, laugh); p.armB = mixArm(p.armB, CHEER, laugh); }
      p.lean = 0.1 + 0.3 * lean - 0.3 * back * (1 - laugh); p.headPitch = 0.15 * lean - 0.2 * back + 0.1 * wish; p.mouth = lean > 0.3 || back > 0.3 ? 'o' : 'smile';
      seatKid(noa, 'play', p, 0.46); sootN(smooth(clamp((t - T_ROAR) / 0.3)) * (1 - laugh * 0.5)); }
    const friends = [[pal, PT[0] - 0.55, 0.62, 'kid'], [pal2, PT[0] + 0.55, 0.62, 'kid'], [dad2, PT[0] - 0.55, 1.25, 'dad']];
    friends.forEach(([rig, x, dz, role], i) => {
      const p = basePose(); p.eyes = blink(t, 52 + i); const z = PT[1] + dz; Object.assign(p, { x, z, rotY: role === 'kid' ? PI + (x < PT[0] ? -0.3 : 0.3) : faceTo(x, z, PT[0], PT[1]) });
      p.mouth = back > 0.3 ? 'o' : 'smile'; p.lean = -0.25 * back;
      p.armA = mixArm(clapA(t + i, 0.6), FLINCH_A, back * (1 - laugh)); p.armB = mixArm(clapB(t + i, 0.6), FLINCH_B, back * (1 - laugh));
      if (laugh > 0) { p.armA = mixArm(p.armA, clapA(t * 1.3 + i, 1), laugh); p.armB = mixArm(p.armB, clapB(t * 1.3 + i, 1), laugh); p.headPitch = -0.25 * laugh * (0.5 + 0.5 * Math.sin(t * 8 + i)); }
      if (role === 'dad') { const aim = smooth(clamp((t - T_EXT + 0.4) / 0.3)); p.armB = mixArm(mixArm(A(-0.35, 0.15, -0.9, -0.3), A(-1.05, 0.15, -0.55, -0.4), aim), A(-0.35, 0.15, -0.9, -0.3), laugh); p.armA = mixArm(REST, A(-0.9, 0.1, -0.9, 0.5), aim * (1 - laugh)); p.glasses = true; p.mouth = laugh > 0.3 ? 'smile' : (back > 0.3 ? 'o' : 'smile'); }
      if (role === 'kid') seatKid(rig, 'play', p, 0.46); else put(rig, 'play', p);
    });
    { const hw = hand(dad2, 1); ext.g.position.copy(hw).add(new THREE.Vector3(0, -0.5, 0)); ext.g.rotation.set(0, faceTo(hw.x, hw.z, PT[0] + OFF.play[0], PT[1] + OFF.play[2]), 0); ext.g.visible = true;
      ext.g.updateMatrixWorld(true); const nz = ext.nozzle.clone().applyMatrix4(ext.g.matrixWorld), tgt = W('play', PT[0], 0.95, PT[1] + 0.2), sp = clamp((t - T_EXT) / 0.15) * (1 - clamp((t - T_EXT - 1.1) / 0.3));
      if (sp > 0) for (let k = 0; k < 7; k++) { const u = ((t * 2.2 + k / 7) % 1); puff(nz.clone().lerp(tgt, u), 0.08 + 0.16 * u, 0.85 * sp, foamC); } }
    hatN.visible = true;
    // the dragonfly watches from the balloon bunch
    { const d = flies[1]; d.g.position.copy(W('play', PT[0] - 0.75, 0.8, PT[1] - 0.05)); d.g.lookAt(W('play', PT[0], 0.8, PT[1] + 0.3)); d.update(t, t > T_ROAR && t < T_ROAR + 1.4 ? 30 : 0); d.g.visible = true; }
    for (let i = 2; i < 5; i++) { const d = flies[i], pos = flyPath(i, t), lk = flyPath(i, t + 0.08); d.g.position.copy(W('play', pos.x, pos.y + 0.6, pos.z)); d.g.lookAt(W('play', lk.x, lk.y + 0.6, lk.z)); d.update(t, 28); d.g.visible = true; }
    balloons2.forEach((b, i) => { b.visible = true; b.rotation.z = 0.08 * Math.sin(t * 1.1 + i) + 0.25 * back; });
    const u = smooth(clamp((t - 49.8) / 7.2));
    return { P: [PT[0] + lerp(0.3, 0.08, u), lerp(1.6, 1.5, u) + 0.1 * back, PT[1] - lerp(2.3, 1.5, u)], A: [PT[0] + lerp(0.06, 0.02, u), lerp(1.02, 0.98, u) + 0.12 * back, PT[1] + 0.75], fov: lerp(52, 48, u) };
  }

  // ================================================================ update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = 0.05;
    all.forEach((r) => (r.root.visible = false)); fires.forEach((f) => (f.g.visible = false)); puffs.hide();
    [lighter, spatula, plate, radio, branch, ext.g, crow.g, ...flies.map((d) => d.g)].forEach((o) => (o.visible = false));
    sticks.forEach((s) => (s.g.visible = false)); truck.g.visible = false; car.g.visible = false; grill.g.visible = false; cane.visible = false;
    pigeons.forEach((g) => (g.g.visible = false)); umbrella.visible = true; awnings.forEach((o) => (o.visible = true));
    np = 0; nb = 0; nc = 0; shake = [0, 0];
    apron.visible = false; hatM.visible = S === 'kit'; sootD(0); grayD(0); sootK(0); sootN(0); hatK.visible = true;

    let c;
    if (cam === 'title' || cam === 'race') c = raceScene(t, cam);
    else if (cam === 'bench') c = benchScene(t);
    else if (cam === 'cake') c = cakeScene(t);
    else if (cam === 'bbq') c = bbqScene(t);
    else if (cam === 'camp') c = campScene(t);
    else if (cam === 'forest') c = forestScene(t);
    else if (cam === 'truck') c = truckScene(t);
    else if (cam === 'rust') c = rustScene(t);
    else if (cam === 'fly') c = flyScene(t);
    else c = wishScene(t);
    blobs.count = nb; blobs.instanceMatrix.needsUpdate = true; blobs.visible = nb > 0;
    conf.count = nc; conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true; conf.visible = nc > 0;

    const o = OFF[S], P = c.P.map((v, i) => v + o[i]), Aim = c.A.map((v, i) => v + o[i]);
    P[0] += shake[0]; P[1] += shake[1];
    story.debugView = { center: Aim, height: 26 };
    setCamera(P, Aim, c.fov, t, 0.004);
  }
  return { update };
}
