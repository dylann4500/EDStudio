// VIDEO 010 — "What if every person's height doubled overnight?"  (tone: WHATIF ladder, funny-dramatic)
// 69.5 s, 9 beats, FOUR sets (bedroom, NEW suburb, city, NEW supermarket) parked at offsets in one scene.
// Physics hook (real): square–cube law — height ×2 → weight ×8, bone/muscle cross-section ×4 → stress ×2; food ≈ mass^0.75 ≈ ×5.
// Average adult height ≈ 165 cm, mass ≈ 62 kg (global means, NCD-RisC / Walpole 2012) → 330 cm, ~496 kg. ~1.4–1.5 B vehicles on Earth.
// Giants = normal rigs at root.scale 2 in a normal-size world. Every beat ends in an IMPACT (shake + dust) — user steer: lean on drama.
//
// v2 (user: "rendering issues, scenes too bare, more different funny scenes"): ~5 s beats, something happening in every frame,
// two NEW sets (kitchen, airplane cabin) + new props (dog, ceiling fan, mug), no dead frames, a quiet open (music enters at the growth).
//
// Shot list (seconds)                       | set     | what happens
//  0.0– 6.6  bed      3:00 AM               | bedroom | Gary snores; he grows, feet burst out the end, the frame snaps
//  6.6–11.8  door     +3 hours              | bedroom | stands up into the ceiling fan (BONK, the fan wobbles), squeezes into the doorway
// 11.8–17.2  kitchen  +3 h 10 min           | kitchen | kneels at the table; a coffee mug is one pinched sip; a chair lies crushed
// 17.2–22.4  leave    +4 hours              | suburb  | ant's-eye: giants duck out of front doors; one stands up through his porch roof
// 22.4–27.6  dog      +4 h 20 min           | suburb  | Gary walks a normal-size dog (now hamster-size); it scrambles, stops, barks up at him
// 27.6–33.2  car      +5 hours              | suburb  | he sits on the car: the cab crushes flat, glass sprays, the alarm goes off
// 33.2–38.8  bus      +6 hours              | city    | packed bus (one head through the roof); the 7th boards → it bottoms out ("FULL · 7")
// 38.8–44.4  plane    +1 day                | plane   | economy: giants folded with knees at their chins; the flight attendant crawls the cart
// 44.4–49.8  market   +1 week               | market  | time-lapse: shelves empty, SOLD OUT
// 49.8–55.2  bench    +1 month              | suburb  | the park bench snaps in half
// 55.2–60.4  rebuild  +1 year               | city    | double-size cars at the intersection
// 60.4–71.0  dunk     +1 year               | suburb  | a flat-footed dunk, a yawn. End card at 66.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex, walkLegs } from '@engine/core.js';
import { makePerson, makeSleeper, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { Blanket, quiltTexture, makeBus, makeBasketball, makeDog, makeCeilingFan, makeMug } from '@engine/props.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildPlane, seatPos } from '@engine/sets/plane.js';
import { buildBedroom } from '@engine/sets/bedroom.js';
import { buildSuburb, DIMS as SUB, SW_H } from '@engine/sets/suburb.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';

const PI = Math.PI;
const GS = 2.0;                                           // giant scale
const OFF = { city: [0, 0, 0], sub: [2000, 0, 0], bed: [4000, 0, 0], mkt: [6000, 0, 0], kit: [8000, 0, 0], plane: [10000, 0, 0] };
// beats that kept their v1 performance are played back with a time shift (v1 time = t − shift)
const SHIFT = { car: 4.6, bus: 3.7, market: 7.9, bench: 6.0, rebuild: 5.7, dunk: 3.9 };   // city stays at the origin (sky domes)

export const SHOTS = [
  { t0: 0, t1: 6.6, cam: 'bed', set: 'bed' },
  { t0: 6.6, t1: 11.8, cam: 'door', set: 'bed' },
  { t0: 11.8, t1: 17.2, cam: 'kitchen', set: 'kit' },
  { t0: 17.2, t1: 22.4, cam: 'leave', set: 'sub' },
  { t0: 22.4, t1: 27.6, cam: 'dog', set: 'sub' },
  { t0: 27.6, t1: 33.2, cam: 'car', set: 'sub' },
  { t0: 33.2, t1: 38.8, cam: 'bus', set: 'city' },
  { t0: 38.8, t1: 44.4, cam: 'plane', set: 'plane' },
  { t0: 44.4, t1: 49.8, cam: 'market', set: 'mkt' },
  { t0: 49.8, t1: 55.2, cam: 'bench', set: 'sub' },
  { t0: 55.2, t1: 60.4, cam: 'rebuild', set: 'city' },
  { t0: 60.4, t1: 71.0, cam: 'dunk', set: 'sub' },
];
// camera coords are LOCAL to the shot's set
export const CAMS = {
  kitchen: { p: [[1.0, 1.4, 2.35], [0.8, 1.38, 2.1]], a: [[-0.55, 1.25, -1.0], [-0.55, 1.3, -1.0]], fov: 56, amp: 0.004 },
  dog:     { p: [[27.0, 1.5, 5.1], [32.9, 1.5, 5.0]], a: [[27.0, 1.6, -0.9], [32.9, 1.6, -0.9]], fov: 52, amp: 0.004 },   // centered between Gary and the dog
  plane:   { p: [[0.05, 1.98, 1.5], [0.0, 1.95, 1.1]], a: [[0.0, 1.3, -7.0], [0.0, 1.3, -7.0]], fov: 56, amp: 0.004 },
  bed:     { p: [[0.25, 1.3, 1.05], [0.15, 1.24, 0.8]], a: [[-0.3, 0.55, -1.75], [-0.3, 0.55, -1.75]], fov: 58, amp: 0.004 },   // from the foot of the bed: the feet burst toward us
  door:    { p: [[1.75, 1.4, 2.3], [1.6, 1.38, 2.1]], a: [[-0.9, 1.35, -0.4], [-1.3, 1.3, -0.1]], fov: 70, amp: 0.004 },
  leave:   { p: [[0.6, 0.5, 4.6], [0.3, 0.48, 4.0]], a: [[-1.9, 2.7, -7.0], [-1.8, 2.9, -7.0]], fov: 58, amp: 0.005 },
  car:     { p: [[0.4, 1.7, 0.4], [0.9, 1.6, -0.2]], a: [[5.0, 1.45, -5.0], [5.0, 1.35, -5.0]], fov: 50, amp: 0.004 },   // from the lawn side (the yard tree sits on the other side)
  bus:     { p: [[5.6, 2.2, -8.2], [5.5, 2.1, -7.4]], a: [[2.6, 1.7, 3.0], [2.6, 1.65, 3.0]], fov: 52, amp: 0.004 },
  market:  { p: [[0.3, 2.7, 4.8], [0.25, 2.6, 3.8]], a: [[0.0, 1.3, -8.0], [0.0, 1.3, -8.0]], fov: 56, amp: 0.004 },
  bench:   { p: [[61.8, 1.55, 1.2], [61.2, 1.45, 0.4]], a: [[58.0, 1.05, -6.0], [58.0, 0.95, -6.0]], fov: 48, amp: 0.004 },
  rebuild: { p: [[14.0, 10.5, 9.0], [12.5, 9.5, 7.0]], a: [[1.0, 0.0, -4.0], [1.0, 0.0, -4.0]], fov: 52, amp: 0.006 },
  dunk:    { p: [[-16.4, 2.1, -2.6], [-16.0, 2.15, -2.9]], a: [[-11.5, 2.6, -3.4], [-11.5, 2.7, -3.4]], fov: 50, amp: 0.004 },   // side-on: the ball drops through the rim in profile
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
// impacts: camera shake + a dust burst (local position in that set)
const IMPACTS = [
  { t: 5.6, set: 'bed', p: [-0.3, 0.35, -0.9], amp: 0.035, dust: 0.6 },
  { t: 7.45, set: 'bed', p: [0.15, 2.4, -0.7], amp: 0.03, dust: 0.35 },
  { t: 20.1, set: 'sub', p: [-2.2, 2.6, -7.9], amp: 0.04, dust: 1.0 },
  { t: 31.35, set: 'sub', p: [4.5, 1.2, -5.2], amp: 0.06, dust: 0.9 },
  { t: 36.7, set: 'city', p: [2.6, 0.3, 3.0], amp: 0.06, dust: 1.2 },
  { t: 52.9, set: 'sub', p: [58, 0.3, -6.1], amp: 0.06, dust: 0.9 },
];

// ---------------------------------------------------------------- arm library (tested in 002/007)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const FWD_A = A(-0.9, 0.1, -0.3, 0.2), FWD_B = A(-0.9, 0.1, -0.3, -0.2);              // arms forward (feeling the way / ducking)
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);      // carrying an armful
const HEAD_B = A(-2.3, 0.35, -1.6, -0.6);                                              // hand on head (bonk!)
const UP_B = A(-2.75, 0.18, -0.12, 0);                                                 // arm straight up (dunk)
const YAWN_A = A(-2.4, 0.5, -0.6, 0), YAWN_B = A(-2.4, 0.5, -0.6, 0);
const SIT_A = A(-0.35, 0.25, -0.3, 0), SIT_B = A(-0.35, 0.25, -0.3, 0);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const boing = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-6 * (t - t0)) * Math.cos(16 * (t - t0)));

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const toW = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- sets
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.decor.teen.visible = true; bed.setNightlight(0); bed.setXmas(0, 0);
  // set dressing for a grown-up's bedroom (never bare): glowing alarm clock, slippers, laundry basket, books, a plant
  const clockTex = (txt) => canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4a3a'; g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); });
  const clockTexs = { a: clockTex('3:00'), b: clockTex('6:00') };
  const clock = new THREE.Group(); clock.position.set(-1.02, 0.55, -2.12); clock.rotation.y = 0.5; bed.root.add(clock);
  mk(new THREE.BoxGeometry(0.16, 0.08, 0.07), mat(0x1d1d22, 0.4), clock, 0, 0.04, 0);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.065), new THREE.MeshBasicMaterial({ map: clockTexs.a, toneMapped: false })); clockFace.position.set(0, 0.04, 0.036); clock.add(clockFace);
  const clockGlow = new THREE.PointLight(0xff4a3a, 0.25, 0.8, 2); clockGlow.position.set(0, 0.06, 0.1); clock.add(clockGlow);
  for (const sx of [-0.06, 0.08]) { const sl = mk(new THREE.CapsuleGeometry(0.045, 0.16, 4, 10), mat(0x8f6fb8, 0.9), bed.root, -1.05 + sx, 0.03, -0.55); sl.rotation.x = PI / 2; sl.scale.set(1, 1, 0.5); }
  const basket = new THREE.Group(); basket.position.set(1.55, 0, -2.05); bed.root.add(basket);
  mk(new THREE.CylinderGeometry(0.24, 0.2, 0.5, 14, 1, true), mat(0xc9a77a, 0.9, { side: THREE.DoubleSide }), basket, 0, 0.25, 0);
  [0x3d7bd9, 0xe58fa6, 0xf5f0e2, 0x2f4f73].forEach((c, i) => mk(new THREE.SphereGeometry(0.12, 10, 8), mat(c, 0.95), basket, (i % 2 - 0.5) * 0.14, 0.45 + (i > 1 ? 0.06 : 0), (i > 1 ? 0.05 : -0.05)));
  [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8].forEach((c, i) => mk(new THREE.BoxGeometry(0.2, 0.05, 0.28), mat(c, 0.7), bed.root, 1.72, 0.92 + i * 0.05, -1.2 + (i % 2) * 0.02));
  const plant = new THREE.Group(); plant.position.set(1.7, 0, 1.0); bed.root.add(plant);
  mk(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 14), mat(0xb5672e, 0.8), plant, 0, 0.15, 0);
  for (let k = 0; k < 7; k++) { const lf = mk(new THREE.SphereGeometry(0.16, 10, 8), mat(0x4f8a3f, 0.8), plant, Math.sin(k * 2.4) * 0.12, 0.45 + (k % 3) * 0.12, Math.cos(k * 2.4) * 0.12); lf.scale.set(0.6, 1.4, 0.3); lf.rotation.z = Math.sin(k) * 0.5; }
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('green'); city.setGrowth(0); city.setSnow(0);
  const sub = buildSuburb(studio, {}); sub.root.position.set(...OFF.sub);
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(6, 10);
  const plane = buildPlane(studio, {}); plane.root.position.set(...OFF.plane);
  const ROOTS = { bed: bed.root, city: city.root, sub: sub.root, mkt: mkt.root, kit: kit.root, plane: plane.root };
  const FOGS = { bed: null, city: cityFog, sub: sub.fog, mkt: null, kit: null, plane: null };
  const FAR = { bed: 60, city: 1500, sub: 400, mkt: 80, kit: 40, plane: 60 };
  // the chair he already tried: crushed flat on the floor (static gag in the kitchen)
  { const c = kit.chairs[1]; c.rotation.set(0, -PI / 2 + 0.3, PI / 2 - 0.15); c.position.y = 0.22; c.scale.set(1, 0.55, 1); }
  const fan = makeCeilingFan(); fan.g.position.set(0.15, 2.72, -0.7); bed.root.add(fan.g);
  const mug = makeMug(0xf2b632); mug.scale.setScalar(1.25);
  const steam = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); steam.position.y = 0.17; mug.add(steam);
  const dog = makeDog(); sub.root.add(dog.g);
  const leash = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xd2483f })); leash.frustumCulled = false; scene.add(leash);
  const cartP = new THREE.Group(); plane.root.add(cartP);
  mk(new THREE.BoxGeometry(0.36, 0.95, 0.75), mat(0xc9ccd0, 0.3, { metalness: 0.5 }), cartP, 0, 0.5, 0); mk(new THREE.BoxGeometry(0.37, 0.04, 0.76), mat(0xd2483f, 0.5), cartP, 0, 0.98, 0);
  for (let k = 0; k < 4; k++) mk(new THREE.CylinderGeometry(0.035, 0.035, 0.11, 10), mat([0xd2483f, 0x3d7bd9, 0xf2b632, 0x58b368][k], 0.5), cartP, -0.1 + (k % 2) * 0.2, 1.06, -0.2 + Math.floor(k / 2) * 0.3);
  // glass shards for the car crush
  const SHN = 40, shards = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.01, 0.04), new THREE.MeshStandardMaterial({ color: 0xcfe6ff, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.85 }), SHN);
  shards.frustumCulled = false; scene.add(shards);
  const SHR = rng(4), shSeeds = Array.from({ length: SHN }, () => [SHR(), SHR(), SHR(), SHR()]);
  const B = bed.D.bed;

  // ---------------------------------------------------------------- bed beat: sleeper + blanket + feet (all in a carrier that drops when the frame snaps)
  const carrier = new THREE.Group(); bed.root.add(carrier);
  const sleeper = makeSleeper({ r: 0.12, skin: 0xe9b48f, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c });
  sleeper.turn.rotation.z = -0.42; carrier.add(sleeper.g);
  const blanket = new Blanket(new THREE.MeshStandardMaterial({ map: quiltTexture('#4f6d8e', '#6d8db0'), roughness: 0.95, side: THREE.DoubleSide }));
  blanket.mesh.scale.z = -1; carrier.add(blanket.mesh);   // Blanket drapes toward -z; this bed's foot is at +z → mirror it, pass negated z's
  const feet = new THREE.Group(); carrier.add(feet);
  const footM = mat(0xe9b48f, 0.62), sockM = mat(0xd8d2c6, 0.8);
  for (const s of [-1, 1]) {
    const f = new THREE.Group(); f.position.set(s * 0.09, 0, 0); feet.add(f);
    const sole = mk(new THREE.CapsuleGeometry(0.045, 0.12, 6, 10), footM, f, 0, 0.05, 0.02); sole.rotation.x = PI / 2 - 0.3;
    mk(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 10), sockM, f, 0, 0.02, -0.07).rotation.x = PI / 2;
    for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.016, 8, 6), footM, f, s * (-0.03 + k * 0.02), 0.1, 0.07 + Math.abs(k - 1.5) * -0.005);
  }

  // ---------------------------------------------------------------- props
  const carSub = makeCar(0xd2483f, 3); sub.root.add(carSub.g); carSub.g.position.set(4.5, 0, -5.2);
  if (carSub.setLights) carSub.setLights(0);
  // bus shelter at the stop (glass, roof, a bench, an ad that fits the premise)
  const shelter = new THREE.Group(); shelter.position.set(6.2, 0.14, 6.2); city.root.add(shelter);
  const sGlass = new THREE.MeshStandardMaterial({ color: 0xbfd6e6, roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false });
  mk(new THREE.BoxGeometry(0.06, 2.4, 3.2), sGlass, shelter, 0.55, 1.2, 0).castShadow = false; mk(new THREE.BoxGeometry(1.2, 0.08, 3.4), mat(0x3d4a45, 0.5), shelter, 0, 2.45, 0);
  for (const z of [-1.6, 1.6]) mk(new THREE.BoxGeometry(0.08, 2.4, 0.08), mat(0x3d4a45, 0.5), shelter, 0.55, 1.2, z);
  const ad = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.6), new THREE.MeshBasicMaterial({ map: canvasTex(256, 410, (g, w, h) => { g.fillStyle = '#f2b632'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d2a38'; g.font = 'bold 56px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('XXXXL', w / 2, 120); g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.fillText('JEANS', w / 2, 175); g.font = '26px Helvetica, Arial, sans-serif'; g.fillText('now in your', w / 2, 260); g.fillText('new size', w / 2, 295); g.fillStyle = '#d2483f'; g.font = 'bold 48px Helvetica, Arial, sans-serif'; g.fillText('2×', w / 2, 370); }), toneMapped: false }));
  ad.position.set(0.5, 1.3, -0.6); ad.rotation.y = -PI / 2; shelter.add(ad);
  mk(new THREE.BoxGeometry(0.45, 0.06, 2.2), mat(0xa8744a, 0.7), shelter, 0.15, 0.48, 0.3);
  const bus = makeBus({ sign: '42 DOWNTOWN' }); city.root.add(bus.g); bus.g.position.set(2.3, 0, 6.0); bus.g.rotation.y = PI;
  const bigCars = [0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xf5f0e2, 0x8f6fb8, 0xe08a3a].map((c, i) => { const car = makeCar(c, 40 + i); car.g.scale.setScalar(GS); city.root.add(car.g); if (car.setLights) car.setLights(0); return car; });
  const oldCar = makeCar(0x9a9a96, 77); city.root.add(oldCar.g); oldCar.g.position.set(-5.6, 0.14, -16.5); oldCar.g.rotation.y = 0.15; if (oldCar.setLights) oldCar.setLights(0);   // a pre-giant car, for scale
  const ball = makeBasketball(0.12); scene.add(ball);
  const rimW = sub.hoop.g.localToWorld(sub.hoop.rim.clone()); // hoop lives in the suburb root (already offset)
  sub.root.updateMatrixWorld(true); rimW.copy(sub.hoop.g.localToWorld(sub.hoop.rim.clone()));
  // armfuls of groceries for the market giants
  const armful = () => { const g = new THREE.Group(); ['#d2483f', '#f2b632', '#3d7bd9', '#58b368', '#f08a4b'].forEach((c, i) => mk(new THREE.BoxGeometry(0.22, 0.16, 0.16), mat(c, 0.5), g, (i % 2 - 0.5) * 0.18, 0.08 + Math.floor(i / 2) * 0.16, 0)); return g; };
  // dust burst (one pool, re-used per impact)
  const DN = 60, dust = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xc9b9a2, roughness: 1, transparent: true, opacity: 0.6, depthWrite: false }), DN);
  dust.frustumCulled = false; scene.add(dust);
  const DR = rng(9), dSeeds = Array.from({ length: DN }, () => [DR(), DR(), DR()]);

  // ---------------------------------------------------------------- cast
  const R = rng(13);
  const randPerson = () => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.3 ? HAIRS[Math.floor(R() * 3)] : null });
    p.root.scale.setScalar(GS); scene.add(p.root); p.seed = R(); p.seed2 = R(); return p;
  };
  const giants = Array.from({ length: 12 }, randPerson);
  const loads = giants.map((g) => { const a = armful(); g.spine.add(a); a.position.set(0, 0.26, 0.24); a.visible = false; return a; });
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  gary.root.scale.setScalar(GS); scene.add(gary.root);
  const ALL = [...giants, gary];

  /** Pose a scaled giant: (x,z) local to the set, ground + root heights in world meters. Leg IK gets floor in local units. */
  function putG(rig, key, p, groundY = 0, rootY = groundY) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    p.y = 0; p.floor = (groundY - rootY) / GS;
    applyPose(rig, p);
    rig.root.position.y = rootY + OFF[key][1];
    rig.root.visible = true;
  }
  const seatRoot = (seatY) => seatY - GS * (HIP_H - 0.17);   // root height that puts the pelvis (bottom) on a seat at seatY

  // ---------------------------------------------------------------- performances
  function garyDoor(t) { // bedroom, +3 hours: stands up into the ceiling fan (BONK) → ducks → squeezes into the doorway
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const w = walkLegs(t, [0.2, -0.7], [{ t0: 9.0, t1: 12.6, pts: [[-1.2, 0.05], [-2.2, 0.32], [-3.3, 0.4]] }]);
    p.x = w.x; p.z = w.z; p.dist = w.dist / GS; p.speed = w.speed / GS;
    p.rotY = lerpAngle(-PI / 2 + 0.35, w.head ?? -PI / 2, K(t, [[8.9, 0], [9.2, 1]]));
    const up = K(t, [[6.7, 0], [7.4, 1]]), bonk = K(t, [[7.45, 0], [7.65, 1], [8.6, 1], [8.85, 0]]);
    const duck = K(t, [[8.7, 0], [9.5, 1]]);
    p.crouch = lerp(0.34, 0.16, up) + 0.08 * bonk + 0.18 * duck; p.lean = lerp(0.7, 0.32, up) + 0.15 * bonk + 0.8 * duck;
    p.headPitch = lerp(-0.2, -0.4, up) + 0.45 * bonk - 0.5 * duck;
    p.armB = mixArm(REST, HEAD_B, K(t, [[7.5, 0], [7.75, 1], [8.5, 1], [8.8, 0]]));
    if (duck > 0) { p.armA = mixArm(REST, FWD_A, duck); p.armB = mixArm(p.armB, FWD_B, duck); }
    p.eyes = t > 7.45 && t < 8.0 ? 'closed' : p.eyes; p.mouth = t > 7.45 && t < 8.2 ? 'o' : 'flat';
    return p;
  }
  function garyKitchen(t) { // kneeling at the table; the mug is a thimble; one pinched sip
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: KD.table[0] - 0.95, z: KD.table[1] - 0.9, rotY: 0, crouch: 0.4, lean: 0.32, footFwd: -0.15 });   // behind the table, facing us
    const lift = K(t, [[13.4, 0], [14.1, 1], [15.9, 1], [16.5, 0.2]]);
    p.armB = mixArm(A(-0.75, 0.1, -0.7, -0.3), A(-1.3, 0.12, -2.3, -0.75), lift);       // hand: table → mouth
    p.armA = A(-0.55, 0.15, -0.6, 0.3);                                                  // other hand on the table edge
    p.headPitch = lerp(0.35, -0.05, lift); p.headYaw = K(t, [[16.0, 0], [16.4, 0.55]]);  // then a look at us
    p.mouth = lift > 0.85 && t > 14.3 && t < 15.6 ? 'o' : 'flat'; p.eyes = t > 14.4 && t < 15.3 ? 'closed' : p.eyes;
    return p;
  }
  function garyDog(t) { // walking the (normal-size) dog; stops; the dog barks up at him
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const w = walkLegs(t, [25.8, -0.95], [{ t0: 22.4, t1: 25.2, pts: [[31.6, -0.95]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist / GS, speed: w.speed / GS, rotY: PI / 2 });
    p.armA = A(-0.35, 0.18, -0.25, 0); p.headPitch = K(t, [[25.0, 0.1], [25.5, 0.62]]); p.headYaw = K(t, [[25.0, 0], [25.5, -0.35], [26.8, -0.35], [27.1, -0.9]]);
    p.mouth = t > 26.9 ? 'flat' : 'flat';
    return { p, x: w.x, speed: w.speed };
  }
  function planePose(t, i) { // economy: folded giants + the flight attendant crawling the cart up the aisle
    const seated = [[0, 2], [0, 3], [1, 1], [1, 4], [2, 2], [2, 3], [3, 0], [3, 5], [4, 2], [4, 4]];
    const p = basePose(); p.eyes = blink(t, i + 3);
    if (i < seated.length) {
      const [r, c] = seated[i], sp = seatPos(r + 3, c);   // rows 1–2 stay empty so the seats themselves read at normal size
      Object.assign(p, { x: sp.x, z: sp.z + 0.05, rotY: 0, footFwd: 0.12, lean: 0.42, headPitch: -0.35, headYaw: (c < 3 ? 0.25 : -0.25) * (i % 2) });
      p.armA = HUG_A; p.armB = HUG_B; p.mouth = i % 3 ? 'flat' : 'o';
      return { p, rootY: seatRoot(0.45) + 0.02 };
    }
    if (i === seated.length) { // attendant: on hands and knees, pushing the cart toward us
      const z = lerp(-8.2, -3.4, K(t, [[38.9, 0], [44.3, 1]], (u) => u));
      Object.assign(p, { x: 0, z, rotY: 0, crouch: 0.5, lean: 1.3, headPitch: -0.9, dist: (z + 8.2) / GS, speed: 0.2 });
      p.armA = A(-1.35, 0.12, -0.15, 0.1); p.armB = A(-1.35, 0.12, -0.15, -0.1);
      cartP.position.set(0, 0, z + 1.35);
      return { p, rootY: 0 };
    }
    return null;
  }
  function leavePose(t, i) { // suburb, +4 hours: giants squeeze out of front doors, stand up over the houses, walk to the street
    const H = sub.houses;
    const plan = [
      { h: 2, t0: 18.0 }, { h: 1, t0: 17.3 }, { h: 3, t0: 19.0 },   // house 2's giant stands up through the porch roof at ~20.1
    ];
    if (i < plan.length) {
      const { h, t0 } = plan[i], d = H[h].doorPos, lx = d.x, lz = d.z;   // doorPos is already set-local
      const out = K(t, [[t0, 0], [t0 + 1.4, 1]]), rise = K(t, [[t0 + 1.4, 0], [t0 + 2.2, 1]]);
      const w = walkLegs(t, [lx, lz + 2.6], [{ t0: t0 + 2.3, t1: t0 + 5.5, pts: [[lx + 0.3, -1.0], [lx + 6, -0.8]] }]);
      const p = basePose(); p.eyes = blink(t, i + 3);
      p.x = out < 1 ? lx : w.x; p.z = out < 1 ? lerp(lz - 1.2, lz + 2.6, out) : w.z;
      p.rotY = out < 1 || rise < 1 ? 0 : (w.head ?? 0); p.dist = (out * 2.6 + w.dist) / GS; p.speed = (out > 0 && out < 1) || w.speed > 0 ? 0.25 : 0;
      p.crouch = lerp(0.36, 0.02, rise); p.lean = lerp(1.15, 0.05, rise); p.headPitch = lerp(-0.6, 0.0, rise);
      p.armA = mixArm(FWD_A, REST, rise); p.armB = mixArm(FWD_B, REST, rise);
      const ground = out < 0.9 ? 0.4 : 0;                                         // porch top while coming out
      return { p, visible: t > t0, ground };
    }
    // others already walking along the sidewalk / road toward the camera
    const lanes = [-1.0, 1.2, 8.2, -0.6];   // nothing closer than ~3 m to the low camera (z 4.6)
    const v = i % 2 ? 1.2 : -1.1, x0 = -14 + (i * 7.3) % 26;
    const x = -16 + ((((x0 + v * (t - 17)) + 16) % 34) + 34) % 34;
    const p = basePose(); p.eyes = blink(t, i); p.x = x; p.z = lanes[i % lanes.length]; p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(v * t) / GS; p.speed = Math.abs(v) / GS;
    return { p, visible: true, ground: Math.abs(p.z - 3.5) > 3.5 ? 0.12 : 0 };
  }
  function garyCar(t) { // suburb driveway: walks up, turns, sits on the roof → crush
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const w = walkLegs(t, [9.6, -2.6], [{ t0: 23.1, t1: 25.0, pts: [[6.6, -4.6], [6.0, -5.2]] }]);
    const turn = K(t, [[25.0, 0], [25.5, 1]]), sit = K(t, [[25.6, 0], [26.6, 1]]), crush = boing(t, 26.75) * (t > 26.75 ? 1 : 0);
    p.x = lerp(w.x, 5.0, sit); p.z = w.z; p.dist = w.dist / GS; p.speed = w.speed / GS;
    p.rotY = lerpAngle(w.head ?? -PI / 2, PI / 2, turn);
    const roof = lerp(1.45, 0.98, clamp(crush));
    const rootY = lerp(0, seatRoot(roof), sit);
    p.footFwd = 0.42 * sit; p.lean = 0.05 + 0.12 * sit; p.armA = mixArm(REST, SIT_A, sit); p.armB = mixArm(REST, SIT_B, sit);
    p.headPitch = 0.05; p.headYaw = K(t, [[27.6, 0], [28.0, -0.7]]);            // deadpan look at the camera
    p.mouth = t > 26.8 && t < 27.6 ? 'o' : 'flat';
    return { p, rootY, crush };
  }
  function busPose(t, i) { // city: six giants packed inside, the 7th boards → sag
    const inside = [[1.75, 2.0], [2.85, 3.4], [1.75, 5.0], [2.85, 6.6], [1.75, 8.2], [2.85, 9.6]];
    const p = basePose(); p.eyes = blink(t, i + 1);
    if (i < inside.length) {
      const [x, z] = inside[i];
      Object.assign(p, { x, z, rotY: i % 2 ? -PI / 2 : PI / 2, crouch: 0.28, lean: 0.42, headPitch: -0.5, mouth: 'flat' });
      p.armA = HUG_A; p.armB = HUG_B;
      if (i === 0) { Object.assign(p, { x: 2.3, z: 1.6, rotY: PI, crouch: 0.0, lean: 0.0, headPitch: 0.1, headYaw: -0.6 }); p.armA = REST; p.armB = REST; }   // head through the roof hatch
      return { p, ground: 0.45 - 0.42 * clamp(boing(t, 33.0)) * (t > 33.0 ? 1 : 0) };
    }
    if (i === inside.length) { // the 7th: walks up from the stop and squeezes in through the door
      const w = walkLegs(t, [5.6, 2.6], [{ t0: 31.3, t1: 32.9, pts: [[4.2, 1.8], [2.6, 1.7]] }]);
      Object.assign(p, { x: w.x, z: w.z, dist: w.dist / GS, speed: w.speed / GS, rotY: w.head ?? -PI / 2 });
      const duck = K(t, [[31.8, 0], [32.6, 1]]); p.crouch = 0.3 * duck; p.lean = 0.8 * duck; p.armA = mixArm(REST, FWD_A, duck); p.armB = mixArm(REST, FWD_B, duck);
      return { p, ground: t > 32.6 ? 0.45 : 0.14, hide: t > 33.2 };
    }
    const waiting = [[5.9, 3.9, -0.4], [6.4, 5.4, -0.9], [5.4, 6.6, -0.2]];
    const k = i - inside.length - 1; if (k >= waiting.length) return null;
    Object.assign(p, { x: waiting[k][0], z: waiting[k][1], rotY: -PI / 2 + waiting[k][2], headYaw: K(t, [[33.1, 0], [33.4, 0.4]]) });
    p.mouth = t > 33.1 ? 'o' : 'flat';
    return { p, ground: 0.14 };
  }
  function marketPose(t, i) { // time-lapse: giants zip along the aisles hauling armfuls
    if (i >= 6) return null;
    const ax = [-4.0, 0.0, 4.0][i % 3] + (i < 3 ? -0.35 : 0.4);
    const v = (i < 3 ? 1 : -1) * (3.2 + i * 0.3), L = 13;
    const z = -9.5 + ((((v * (t - 36.5) + i * 4.1) % L) + L) % L) * (8.0 / L);   // stay ≥ 5 m from the camera (keeps the SOLD OUT banner clear)
    const p = basePose(); p.eyes = blink(t, i); Object.assign(p, { x: ax, z, rotY: v > 0 ? 0 : PI, dist: Math.abs(v * t) / GS, speed: 1.4 });
    p.armA = HUG_A; p.armB = HUG_B; loads[i].visible = true; p.headPitch = 0.1;
    return { p, ground: 0 };
  }
  function garyBench(t) { // park: walks in, sits, the bench snaps
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const bx = SUB.bench[0], bz = SUB.bench[1];
    const w = walkLegs(t, [bx + 5.5, bz + 2.6], [{ t0: 43.1, t1: 45.2, pts: [[bx + 0.6, bz + 1.0], [bx, bz + 0.6]] }]);
    const turn = K(t, [[45.2, 0], [45.7, 1]]), sit = K(t, [[45.8, 0], [46.8, 1]]), fall = K(t, [[46.9, 0], [47.15, 1]], (u) => u * u);
    p.x = w.x; p.z = lerp(w.z, bz + 0.05, sit); p.dist = w.dist / GS; p.speed = w.speed / GS;
    p.rotY = lerpAngle(w.head ?? PI, 0, turn);
    const seat = lerp(0.47, 0.03, fall);
    const rootY = lerp(0, seatRoot(seat), sit);
    p.footFwd = lerp(0, 0.5, sit) + 0.15 * fall; p.lean = 0.05 + 0.15 * sit - 0.25 * fall;
    p.armA = mixArm(REST, SIT_A, sit); p.armB = mixArm(REST, SIT_B, sit);
    if (fall > 0) { p.armA = mixArm(p.armA, A(0.4, 0.6, -0.2, 0), fall); p.armB = mixArm(p.armB, A(0.4, 0.6, -0.2, 0), fall); }
    p.headPitch = -0.1 * fall; p.headYaw = K(t, [[47.9, 0], [48.3, 0.55]]);
    p.mouth = t > 46.95 && t < 47.8 ? 'o' : 'flat';
    return { p, rootY, fall };
  }
  function rebuildPose(t, i) { // city corner: giants on the sidewalks
    if (i >= 8) return null;
    const side = i % 2 ? 1 : -1, v = (i % 4 < 2 ? 1 : -1) * 1.3;
    const z = -22 + ((((v * (t - 49.5) + i * 7) % 44) + 44) % 44);
    const p = basePose(); p.eyes = blink(t, i); Object.assign(p, { x: side * (5.2 + (i % 3) * 0.5), z, rotY: v > 0 ? 0 : PI, dist: Math.abs(v * t) / GS, speed: Math.abs(v) / GS });
    return { p, ground: 0.14 };
  }
  function garyDunk(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: -11.55, z: -3.55, rotY: 0 });
    const lift = K(t, [[57.4, 0], [58.3, 1]]), done = K(t, [[58.9, 0], [59.4, 1]]);
    p.armB = mixArm(A(-0.5, 0.1, -0.9, -0.3), UP_B, lift); p.armB = mixArm(p.armB, REST, done);
    p.headPitch = lerp(0, -0.35, lift) * (1 - done);
    p.headYaw = K(t, [[59.4, 0], [59.8, -1.0]]);                                  // deadpan look at us (camera is on his −x side)
    const yawn = K(t, [[61.0, 0], [61.6, 1], [62.8, 1], [63.4, 0]]);
    if (yawn > 0) { p.armA = mixArm(REST, YAWN_A, yawn); p.armB = mixArm(p.armB, YAWN_B, yawn); p.headPitch = -0.3 * yawn; p.mouth = yawn > 0.4 ? 'o' : 'flat'; p.eyes = yawn > 0.4 ? 'closed' : p.eyes; }
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function useSet(name) {
    if (name === cur) return; cur = name;
    for (const [k, r] of Object.entries(ROOTS)) r.visible = k === name;
  }
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    useSet(S);
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = S === 'bed' ? 0.9 : 0.4;
    ALL.forEach((r) => (r.root.visible = false)); loads.forEach((l) => (l.visible = false));
    ball.visible = false; dust.visible = false; shards.visible = false; mug.visible = false; dog.g.visible = false; leash.visible = false;
    carSub.g.visible = shot.cam === 'car';
    bigCars.forEach((c) => (c.g.visible = false)); oldCar.g.visible = shot.cam === 'rebuild';

    if (S === 'bed') {
      bed.setSeason('summer', t);
      if (shot.cam === 'bed') {
        bed.setLamp(0.0); bed.lights.moon.intensity = 1.5; bed.setDoor(0); clockFace.material.map = clockTexs.a;
        carrier.visible = true;
        const gg = K(t, [[4.2, 0], [5.4, 1]]) + (t > 5.4 ? 0.04 * Math.sin((t - 5.4) * 16) * Math.exp(-(t - 5.4) * 5) : 0);   // growth with a cartoon overshoot
        const breath = t < 4.2 ? 0.012 * Math.sin(t * 2 * PI / 2.2) : 0;                                                    // snoring chest
        sleeper.g.position.set(B.cx, B.top + 0.12 + 0.066 + 0.07 * gg, -2.15 + 0.02 * gg); sleeper.g.scale.setScalar(1 + 1.0 * gg);
        const body = { x: B.cx, zA: lerp(0.95, 0.45, gg), zB: 1.95, h: lerp(0.15, 0.26, gg) + breath, r: lerp(0.2, 0.3, gg) };
        blanket.update({ cx: B.cx, w: B.w, top: B.top, zFoot: -B.z1, zHead: 1.93, hang: 0.26, footHang: 0.22, r: 0.05, body });
        feet.visible = gg > 0.25; feet.position.set(B.cx, B.top + 0.08, lerp(-0.7, -0.05, gg)); feet.scale.setScalar(lerp(1, 1.6, gg));
        const snap = K(t, [[5.6, 0], [5.75, 1]]) - (t > 5.75 ? 0.1 * Math.exp(-(t - 5.75) * 6) * Math.sin((t - 5.75) * 20) : 0);
        carrier.position.y = -0.16 * snap; bed.bed.position.y = -0.16 * snap; bed.bed.rotation.x = 0;
      } else {
        carrier.visible = false; bed.bed.position.y = -0.16; clockFace.material.map = clockTexs.b;   // the bed stays broken
        bed.setLamp(1); bed.lights.moon.intensity = 1.0; bed.setDoor(1.25); bed.lights.spill.intensity = 0.9;
        putG(gary, 'bed', garyDoor(t));
        fan.update(t, clamp(1 - (t - 7.45) / 2.5) * (t > 7.45 ? 1 : 0));
      }
    } else if (S === 'sub') {
      const center = { leave: [0, -4], dog: [29, -1], car: [5, -5], bench: [58, -6], dunk: [-11.5, -3.5] }[shot.cam];
      sub.aimSun(center[0], center[1], shot.cam === 'leave' ? 16 : 9);
      sub.houses.forEach((h) => (h.door.rotation.y = 0));
      if (shot.cam === 'leave') {
        [1, 2, 3].forEach((h) => (sub.houses[h].door.rotation.y = 1.45));
        sub.houses[2].porchRoof.rotation.z = -0.42 * clamp(boing(t, 20.1)) * (t > 20.1 ? 1 : 0);   // he stands up through it
        giants.forEach((g, i) => { if (i > 7) return; const r = leavePose(t, i); if (r && r.visible) putG(g, 'sub', r.p, r.ground); });
      } else if (shot.cam === 'car') {
        const r = garyCar(t - SHIFT.car);
        putG(gary, 'sub', r.p, 0, r.rootY);
        const k = clamp(r.crush);
        [1, 2].forEach((ci) => { const m = carSub.body.children[ci]; if (m) { m.scale.set(1 + 0.05 * k, 1 - 0.62 * k, 1 + 0.04 * k); m.position.y = (ci === 1 ? 1.15 : 1.18) - 0.32 * k; } });
        carSub.g.position.y = -0.05 * k; carSub.g.rotation.z = -0.04 * k;
        // glass spray
        const age = t - 31.35; shards.visible = age > 0 && age < 1.4;
        if (shards.visible) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
          shSeeds.forEach(([a, b, c, d], i) => { const ang = a * PI * 2, sp = 1.5 + b * 2.5; v.set(OFF.sub[0] + 4.5 + Math.cos(ang) * sp * age, Math.max(0.02, 1.2 + (1.5 + c * 2) * age - 4.9 * age * age), OFF.sub[2] - 5.2 + Math.sin(ang) * sp * age); q.setFromEuler(e3.set(age * 9 * c, age * 7 * d, age * 5)); m4.compose(v, q, sc); shards.setMatrixAt(i, m4); });
          shards.instanceMatrix.needsUpdate = true; }
      } else if (shot.cam === 'dog') {
        const r = garyDog(t); putG(gary, 'sub', r.p);
        dog.g.visible = leash.visible = true;
        const lead = t < 25.2 ? 1.35 : lerp(1.35, 1.05, K(t, [[25.2, 0], [25.8, 1]]));
        dog.g.position.set(r.x + lead, SW_H, -0.3); dog.g.rotation.y = lerpAngle(PI / 2, -PI / 2 - 0.4, K(t, [[25.3, 0], [25.7, 1]]));
        dog.update(t, t < 25.2 ? 2.2 : 0); dog.bark(Math.max(0, Math.sin((t - 25.6) * 9)) * (t > 25.6 && t < 26.9 ? 1 : 0));
        dog.head.rotation.x = t > 25.6 ? -0.5 : 0;
        const hA = handWorld(gary, -1), col = dog.g.localToWorld(new THREE.Vector3(0, 0.36, 0.14));
        leash.geometry.setFromPoints([hA, new THREE.Vector3().lerpVectors(hA, col, 0.5).add(new THREE.Vector3(0, -0.25, 0)), col]);
      } else if (shot.cam === 'bench') {
        const r = garyBench(t - SHIFT.bench);
        putG(gary, 'sub', r.p, 0, r.rootY);
        const [L, Rh] = sub.bench.userData.halves; L.rotation.z = -0.55 * r.fall; Rh.rotation.z = 0.55 * r.fall;
      } else if (shot.cam === 'dunk') {
        const td = t - SHIFT.dunk;
        putG(gary, 'sub', garyDunk(td));
        // the ball: in his hand → set into the rim → straight down through the net → bounce
        ball.visible = true;
        const hB = handWorld(gary, 1);
        if (td < 58.45) ball.position.copy(hB).add(new THREE.Vector3(0, 0.12, 0.08));
        else if (td < 58.6) ball.position.copy(hB).add(new THREE.Vector3(0, 0.12, 0.08)).lerp(rimW.clone().add(new THREE.Vector3(0, 0.15, 0)), K(td, [[58.45, 0], [58.6, 1]]));
        else {
          const ft = td - 58.6, y0 = rimW.y + 0.15, g = 9.8;
          let y = y0 - 0.5 * g * ft * ft; const tHit = Math.sqrt((2 * (y0 - 0.12)) / g);
          if (ft > tHit) { const bt = ft - tHit, v0 = g * tHit * 0.55; y = 0.12 + Math.max(0, v0 * bt - 0.5 * g * bt * bt); }
          ball.position.set(rimW.x, Math.max(0.12, y), rimW.z + Math.max(0, ft - tHit) * 0.6);
        }
        // a neighbor giant shooting around in the background
        const gb = giants[0], p = basePose(); Object.assign(p, { x: -6.5, z: -6.8, rotY: -1.2 }); p.eyes = blink(t, 5); p.headYaw = 0.5; putG(gb, 'sub', p);
      }
      if (shot.cam !== 'bench') { const [L, Rh] = sub.bench.userData.halves; L.rotation.z = 0; Rh.rotation.z = 0; }
      if (shot.cam !== 'car') { [1, 2].forEach((ci) => { const m = carSub.body.children[ci]; if (m) { m.scale.set(1, 1, 1); m.position.y = ci === 1 ? 1.15 : 1.18; } }); carSub.g.position.y = 0; carSub.g.rotation.z = 0; }
    } else if (S === 'city') {
      if (shot.cam === 'bus') {
        city.setShadowFocus(3, 4, 22); city.setTime({}); bus.g.visible = true; shelter.visible = true;
        const tb = t - SHIFT.bus, sag = tb > 33.0 ? boing(tb, 33.0) : 0; bus.setSag(sag * 1.3); bus.setSign(tb > 33.0 ? 'FULL · 7 PEOPLE' : '42 DOWNTOWN');
        giants.forEach((g, i) => {
          const r = busPose(tb, i); if (!r || r.hide) return;
          putG(g, 'city', r.p, r.ground);
        });
      } else {
        bus.g.visible = false; shelter.visible = false;
        city.setShadowFocus(0, -6, 30); city.setTime({}); city.setSignal('green');
        bigCars.forEach((c, j) => {
          const lane = j % 2 ? { x: -2.0, d: 1 } : { x: 2.0, d: -1 };
          const per = 3.4, s = ((((t - j * 1.7) % (6 * per)) + 6 * per) % (6 * per)) - 3 * per;
          c.g.visible = true; c.g.position.set(lane.x, 0, -6 + lane.d * 10 * s); c.g.rotation.y = lane.d > 0 ? 0 : PI;
        });
        giants.forEach((g, i) => { const r = rebuildPose(t - SHIFT.rebuild, i); if (r) putG(g, 'city', r.p, r.ground); });
      }
    } else if (S === 'kit') {
      putG(gary, 'kit', garyKitchen(t));
      mug.visible = true;
      const lift = K(t, [[13.4, 0], [14.1, 1], [15.9, 1], [16.5, 0.2]]);
      if (!mug.parent || mug.parent === scene) { kit.root.add(mug); }
      const hB = handWorld(gary, 1), onTable = new THREE.Vector3(KD.table[0] - 0.55 + OFF.kit[0], KD.tableTop + 0.005, KD.table[1] - 0.2 + OFF.kit[2]);
      const wp = lift < 0.02 ? onTable : hB.clone().add(new THREE.Vector3(0, -0.04, 0));
      mug.position.copy(kit.root.worldToLocal(wp.clone())); mug.rotation.set(-0.9 * K(t, [[14.2, 0], [14.6, 1], [15.4, 1], [15.8, 0]]), 0, 0);
    } else if (S === 'plane') {
      giants.forEach((g, i) => { const r = planePose(t, i); if (r) putG(g, 'plane', r.p, 0, r.rootY); });
      plane.rows.slice(0, 6).forEach((r0) => (r0.visible = false));   // the front row would fill the lens
      [gary].forEach((g) => { const p = basePose(); const sp = seatPos(2, 2); Object.assign(p, { x: sp.x - 0.05, z: sp.z + 0.05, rotY: 0, footFwd: 0.1, lean: 0.45, headPitch: -0.2, headYaw: 0.5 }); p.armA = HUG_A; p.armB = HUG_B; p.eyes = blink(t, 2); putG(g, 'plane', p, 0, seatRoot(0.45) + 0.02); });
    } else if (S === 'mkt') {
      const tm = t - SHIFT.market, k = K(tm, [[37.0, 1], [42.2, 0.04]]); mkt.setStock(k); mkt.setSoldOut(tm > 40.2);
      giants.forEach((g, i) => { const r = marketPose(tm, i); if (r) putG(g, 'mkt', r.p, r.ground); });
    }

    // dust bursts
    for (const im of IMPACTS) {
      const age = t - im.t;
      if (im.set !== S || age < 0 || age > 1.6) continue;
      dust.visible = true;
      const c = toW(im.set, ...im.p), m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
      dSeeds.forEach(([a, b, cc], i) => {
        const ang = a * PI * 2, r = (0.15 + age * (0.8 + b * 1.0)) * im.dust, h = age * (0.15 + cc * 0.35) * im.dust;
        v.set(c.x + Math.cos(ang) * r, c.y + h, c.z + Math.sin(ang) * r);
        const s = (0.025 + age * 0.08 + cc * 0.03) * im.dust * clamp(1.4 - age * 0.8); sc.set(s, s * 0.7, s);
        m.compose(v, q, sc); dust.setMatrixAt(i, m);
      });
      dust.instanceMatrix.needsUpdate = true; dust.material.opacity = 0.55 * clamp(1.3 - age * 0.8);
    }

    // camera (local → world) + impact shake
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    for (const im of IMPACTS) { const age = t - im.t; if (im.set === S && age > 0 && age < 0.7) { const k = im.amp * Math.exp(-age * 7); P = [P[0] + k * Math.sin(age * 71), P[1] + k * Math.sin(age * 53 + 1), P[2] + k * 0.5 * Math.sin(age * 61 + 2)]; } }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
