// VIDEO 016 — "What if every pet on Earth could suddenly talk?"  (lane: unhinged, @ed._.studios; tone: montage, funny)
// 71.4 s, 11 beats. At 7:00 PM every pet on Earth gets a voice — and the first thing they all do is spill their owners' secrets.
// Speech = camera-facing speech bubbles (makeSpeechBubble, engine/props.js) over the pet that talks; pet-noise SFX in cues.json.
// NEW: engine/sets/livingroom.js (apartment + dining area), engine/sets/petshop.js (pet shop + vet clinic), and reusable pets in
// engine/props.js (makeCat, makeParrot + makePerch, makeFishBowl, makeHamster + makeHamsterWheel; makeDog gained setLie/setWag).
// Gary (002/007/010/012/014) is Biscuit's owner: Biscuit, 14, sleeps through the premise and says nothing all year — until the end.
//
// Sources (checked Oct 26, 2026):
//   pets on Earth: "likely over a billion" — HealthforAnimals, "Global Trends in the Pet Population"
//   pet dogs ~471 M, pet cats ~373 M worldwide — Statista (Nestlé Purina data, 2018)
//   bird vocabulary record: Puck the budgerigar, an estimated 1,728 words — Guinness World Records (1995 edition)
//   goldfish keep learned behavior for months (the 3-second memory is a myth) — Univ. of Plymouth lever study (1994) and later
//     retention tests (≥ 3 months), via ScienceABC / scienceblog.com
//   hamsters run ~9 km on a wheel in one night — Richards 1966, Animal Behaviour 14:450 (via Wikipedia "Hamster wheel")
//   US pet industry spending $158 billion in 2025 — APPA State of the Industry (Mar 2026)
//   31 of the first 46 presidents had a dog at the White House — Presidential Pet Museum (historian Andrew Hager)
//   US pet food + treats $65.8 billion (2024) — APPA 2025 State of the Industry
//   dogs respond to ~89 words on average — Reeve & Jacques 2021, Applied Animal Behaviour Science (Dalhousie University)
//
// Shot list (seconds)                    | set         | what happens
//  0.0– 9.6 open    TUESDAY 7:00 PM       | living room | Gary sips tea; 5.6 a glow passes through every pet; the parrot + cat speak; the armchair tips over backward. Biscuit sleeps.
//  9.6–15.0 lawn    +1 MINUTE             | suburb      | Max the dog tells the whole street about the 3 AM cheese; neighbors turn as one; his owner sprints out and face-plants
// 15.0–20.4 counter +5 MINUTES            | kitchen     | the cat reviews the apartment (and the boyfriend), then pushes a mug off the counter, holding eye contact
// 20.4–25.8 dinner  +1 HOUR               | dining room | the parrot replays last night's fight; every guest turns; Kevin slides under the table and takes the tablecloth with him
// 25.8–31.2 fish    +14 HOURS             | office      | the goldfish saw who took the yogurt; the office leans in; it forgets; everyone falls over backward
// 31.2–36.6 wheels  +1 DAY                | pet shop    | the hamsters unionize: every wheel stops at once, ON STRIKE signs, a wheel rolls off and flattens a pyramid of food bags
// 36.6–42.0 vet     +2 DAYS               | vet clinic  | three patients complain; the vet says "Next!"; every pet bolts for the exit, dragging their owners off the chairs
// 42.0–47.4 press   +3 DAYS               | press room  | the President's dog takes the lectern; the President lunges; the lectern topples; flash storm
// 47.4–52.8 summit  +1 MONTH              | war room    | the pets negotiate around the globe; humanity signs; treats rain from the ceiling and the globe lights up
// 52.8–58.2 park    +6 MONTHS             | suburb park | the dog throws, the humans fetch: six people dive for one ball and pile up
// 58.2–71.4 fav     +1 YEAR               | living room | night. Biscuit finally speaks: "You're my favorite." Gary hugs him. End card at 67.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makeDog, makeMug, makeCat, makeParrot, makePerch, makeFishBowl, makeHamster, makeHamsterWheel, makeSpeechBubble } from '@engine/props.js';
import { buildLivingRoom, DIMS as LV } from '@engine/sets/livingroom.js';
import { buildSuburb, DIMS as SUB } from '@engine/sets/suburb.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildPetShop, buildVet, DIMS as PS } from '@engine/sets/petshop.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildWarRoom } from '@engine/sets/warroom.js';
import { makeDots, scatter } from '@engine/globe.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const M = 5.6;                                    // the moment: every pet gets a voice
const OFF = { liv: [0, 0, 0], sub: [2000, 0, 0], kit: [4000, 0, 0], off: [6000, 0, 0], shop: [8000, 0, 0], vet: [10000, 0, 0], press: [12000, 0, 0], war: [14000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 9.6, cam: 'open', set: 'liv' },
  { t0: 9.6, t1: 15.0, cam: 'lawn', set: 'sub' },
  { t0: 15.0, t1: 20.4, cam: 'counter', set: 'kit' },
  { t0: 20.4, t1: 25.8, cam: 'dinner', set: 'liv' },
  { t0: 25.8, t1: 31.2, cam: 'fish', set: 'off' },
  { t0: 31.2, t1: 36.6, cam: 'wheels', set: 'shop' },
  { t0: 36.6, t1: 42.0, cam: 'vet', set: 'vet' },
  { t0: 42.0, t1: 47.4, cam: 'press', set: 'press' },
  { t0: 47.4, t1: 52.8, cam: 'summit', set: 'war' },
  { t0: 52.8, t1: 58.2, cam: 'park', set: 'sub' },
  { t0: 58.2, t1: 71.4, cam: 'fav', set: 'liv' },
];
// camera coords are LOCAL to the shot's set (two keys, eased)
export const CAMS = {
  open:    { p: [[0.22, 1.5, 2.3], [0.12, 1.45, 1.8]], a: [[-0.12, 1.2, -1.6], [-0.12, 1.18, -1.6]], fov: 54, amp: 0.004 },
  lawn:    { p: [[0.05, 0.7, -1.7], [-0.15, 0.68, -2.1]], a: [[-1.6, 1.15, -8.5], [-1.6, 1.15, -8.5]], fov: 56, amp: 0.004 },
  counter: { p: [[0.42, 1.62, 1.55], [0.45, 1.58, 1.15]], a: [[0.45, 1.5, -2.2], [0.45, 1.48, -2.2]], fov: 56, amp: 0.004 },
  dinner:  { p: [[-3.4, 1.68, 3.9], [-3.4, 1.62, 3.45]], a: [[-3.4, 1.6, -1.3], [-3.4, 1.58, -1.3]], fov: 52, amp: 0.004 },
  fish:    { p: [[0.12, 1.66, 1.8], [0.08, 1.62, 1.45]], a: [[0.0, 1.56, -1.2], [0.0, 1.54, -1.2]], fov: 58, amp: 0.004 },
  wheels:  { p: [[0.5, 1.35, 0.75], [0.4, 1.3, 0.45]], a: [[-0.35, 1.02, -1.5], [-0.35, 1.0, -1.5]], fov: 52, amp: 0.003 },
  vet:     { p: [[0.05, 1.5, 2.75], [0.05, 1.46, 2.4]], a: [[0.05, 1.02, -2.0], [0.05, 1.0, -2.0]], fov: 56, amp: 0.004 },
  press:   { p: [[0.4, 2.0, 1.2], [0.35, 2.0, 0.75]], a: [[0.15, 2.25, -3.0], [0.15, 2.25, -3.0]], fov: 44, amp: 0.004, ay: [[42.0, 2.25], [45.75, 2.25], [46.2, 1.3]], y: [[42.0, 2.0], [45.75, 2.0], [46.2, 1.7]] },
  summit:  { p: [[0.15, 1.5, 3.3], [0.1, 1.45, 2.85]], a: [[0.0, 1.42, -0.8], [0.0, 1.42, -0.8]], fov: 52, amp: 0.004 },
  park:    { p: [[60.3, 1.3, -1.0], [60.2, 1.25, -1.5]], a: [[59.95, 1.0, -8.5], [59.95, 1.0, -8.5]], fov: 54, amp: 0.004 },
  fav:     { p: [[0.2, 1.1, 1.2], [-0.42, 0.9, 1.0]], a: [[-0.42, 0.6, -0.75], [-0.52, 0.54, -0.7]], fov: 50, amp: 0.003 },   // a slow arc right → left (his face turns toward us)
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const MUG_B = A(-0.75, 0.25, -1.45, -0.45), SIP_B = A(-1.0, 0.18, -2.3, -0.6);
const ARMREST_A = A(-0.25, 0.32, -0.5, 0.2);
const FLAIL_A = A(-2.5, 0.55, -0.4, 0.2), FLAIL_B = A(-2.5, 0.55, -0.4, -0.2);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);       // hands to the cheeks (shocked)
const REACH_A = A(-1.45, 0.08, -0.25, 0.2), REACH_B = A(-1.45, 0.08, -0.25, -0.2);     // reaching forward
const LEAN_A = A(-0.6, 0.12, -0.9, 0.4), LEAN_B = A(-0.6, 0.12, -0.9, -0.4);           // hands on the desk/knees
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);
const FACE_B = A(-0.6, 0.05, -2.35, -0.95);                                           // facepalm
const CAM_A = A(-1.15, 0.12, -2.05, 0.65), CAM_B = A(-1.15, 0.12, -2.05, -0.65);         // a camera to the face
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const WRITE_B = A(-0.95, 0.15, -1.1, -0.5);
const RUN_A = A(-0.9, 0.1, -1.4, 0.3), RUN_B = A(-0.9, 0.1, -1.4, -0.3);
const HUG_A = A(-0.95, -0.15, -1.25, 0.75), HUG_B = A(-0.95, -0.15, -1.25, -0.75);
const PET_A = A(-0.75, 0.35, -0.55, 0.2);                                             // a hand reaching down to pet the dog
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));   // springy 0 → 1 (008)
const talkK = (t, t0, dur = 0.9, rate = 17) => (t > t0 && t < t0 + dur ? 0.5 + 0.5 * Math.sin((t - t0) * rate) : 0);
const seatY = (seatTop) => -0.375 + (seatTop - 0.42);   // proper seat (CLAUDE.md)
const fall = (u) => u * u;

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2efe8];
const SUITS = [0x2f3a4a, 0x4a4f57, 0x2a2a2e, 0x34466a];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv);
  const sub = buildSuburb(studio, { poleClear: [-12, 12] }); sub.root.position.set(...OFF.sub);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(7, 5);
  kit.table.visible = false; kit.chairs.forEach((c) => (c.visible = false));
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.off);
  const guestChair = office.root.children.find((c) => c.isGroup && Math.abs(c.position.z - OD.guest[1]) < 0.01 && Math.abs(c.position.x - OD.guest[0]) < 0.01);
  if (guestChair) guestChair.visible = false;
  const shop = buildPetShop(studio, {}); shop.root.position.set(...OFF.shop);
  const vet = buildVet(studio, {}); vet.root.position.set(...OFF.vet);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const war = buildWarRoom(studio, { ambient: 1.1, key: 70, sconce: 3.2 }); war.root.position.set(...OFF.war);
  war.globe.g.position.y = 2.2; war.beam.visible = false; war.setGlobeLight(1);
  { const f = new THREE.PointLight(0xfff0e0, 4.0, 9, 1.3); f.position.set(0, 2.3, 2.4); war.root.add(f); const f2 = new THREE.PointLight(0xffe0c0, 2.5, 6, 1.4); f2.position.set(0, 1.6, -2.2); war.root.add(f2); }
  const ROOTS = { liv: liv.root, sub: sub.root, kit: kit.root, off: office.root, shop: shop.root, vet: vet.root, press: press.root, war: war.root };
  const FOGS = { sub: sub.fog };
  const FAR = { liv: 40, sub: 400, kit: 40, off: 60, shop: 40, vet: 40, press: 60, war: 40 };
  scene.fog = null;

  // press: gather the lectern (body, slanted top, plaque, mics, glass) into one pivot group so it can topple toward the press
  const lect = new THREE.Group(); lect.position.set(PD.lectern[0], 0.25, PD.lectern[1] + 0.26); press.root.add(lect);
  [...press.root.children].filter((o) => o.isMesh && Math.abs(o.position.x - PD.lectern[0]) < 0.45 && o.position.z > PD.lectern[1] - 0.4 && o.position.z < PD.lectern[1] + 0.4 && o.position.y > 0.3 && o.position.y < 1.9)
    .forEach((o) => { o.position.sub(lect.position); lect.add(o); });

  // ---------------------------------------------------------------- cast
  const R = rng(16);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); scene.add(p.root); p.root.rotation.order = 'YXZ'; all.push(p); return p; };
  const withTie = (p, c) => { const tie = mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(c, 0.5), p.spine, 0, 0.42, 0.135); tie.rotation.x = -0.12; return p; };
  const crowd = Array.from({ length: 16 }, (_, i) => {
    const style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: pick(TOPS), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.2 ? pick(HAIRS.slice(0, 3)) : null });
    p.seed = R(); return p;
  });
  const suits = Array.from({ length: 4 }, (_, i) => withTie(person({ skin: SKINS[[0, 3, 2, 5][i]], top: SUITS[i], collar: 0xf4f4f2, pants: SUITS[i], hair: HAIRS[[4, 5, 1, 0][i]], hairStyle: ['short', 'none', 'bob', 'short'][i], glasses: i === 1 }), [0xc0392b, 0x2f6aa8, 0xf2b632, 0x58b368][i]));
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const dave = person({ skin: 0xd9a37f, top: 0xb9a3d6, collar: 0xe8dcf2, pants: 0xb9a3d6, hair: 0x2a1d16, hairStyle: 'messy' });        // bathrobe
  const linda = person({ skin: 0xf1c3a1, top: 0xe58fa6, pants: 0x45607a, hair: 0x9a6a3a, hairStyle: 'bob' });
  const boyf = person({ skin: 0xc98e6a, top: 0x6fa84f, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short' });
  const kevin = person({ skin: 0xf3d0b5, top: 0xf1c24a, collar: 0xffffff, pants: 0x3a3d42, hair: 0xd9b46a, hairStyle: 'short' });
  const brenda = person({ skin: 0x9a6447, top: 0x8f6fb8, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob' });
  const clerk = person({ skin: 0xe2ad8c, top: 0x58b3a8, collar: 0xf2efe8, pants: 0x3a3d42, hair: 0x5a3a24, hairStyle: 'messy', glasses: true });
  const vetDoc = person({ skin: 0x6e4430, top: 0xf6f6f2, collar: 0x58b3a8, pants: 0x58b3a8, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const prez = withTie(person({ skin: 0xf0c8a8, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0xc9c4be, hairStyle: 'short' }), 0xc0392b);

  // ---------------------------------------------------------------- pets
  const pets = [];
  const add = (o) => { scene.add(o.g); pets.push(o); return o; };
  const biscuit = add(makeDog({ color: 0xc9955a, patch: 0xd9d4ca }));                    // 14 years old: grey muzzle + brows
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.035, 0.012, 0.012), mat(0xe6e2da, 0.8), biscuit.head, s * 0.045, 0.06, 0.085).rotation.z = s * 0.25;
  const max = add(makeDog({ color: 0xf2efe8, patch: 0xe6dccb }));                       // the neighbor's dog (and the park dog)
  for (const [x, y, z, r] of [[0.06, 0.3, 0.05, 0.05], [-0.05, 0.28, -0.08, 0.045], [0.03, 0.33, -0.15, 0.04]]) mk(new THREE.SphereGeometry(r, 10, 8), mat(0x2a2a2a, 0.8), max.g, x, y, z).scale.set(1, 0.6, 1);
  const coneDog = add(makeDog({ color: 0xc98e4a, patch: 0xf2e6cf }));
  const shame = mk(new THREE.CylinderGeometry(0.17, 0.075, 0.15, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2f6fa, roughness: 0.3, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), coneDog.head, 0, 0, 0.03);
  shame.rotation.x = -PI / 2; shame.castShadow = false;
  const pug = add(makeDog({ color: 0xd9b88a, patch: 0x4a3a30 })); pug.g.children[0].scale.set(1.5, 1.5, 1.0); pug.g.children[1].scale.set(1.4, 1.3, 1.3);
  const prezDog = add(makeDog({ color: 0xf6f3ec, patch: 0xe8dcc8 }));
  const summitDog = add(makeDog({ color: 0xd9a35a, patch: 0xf2e6cf }));
  const mochi = add(makeCat({}));                                                                   // Gary's cat (orange tabby)
  const greyCat = add(makeCat({ color: 0x9a9aa2, belly: 0xf2f2f2, stripe: 0x5a5a62, nose: 0xe8a0a8 })); // the kitchen critic
  const calico = add(makeCat({ color: 0xf2ede4, belly: 0xffffff, stripe: 0xe08a3a }));
  const boss = add(makeCat({ color: 0x8a8f98, belly: 0xf6f6f2, stripe: 0x4a4e56 }));               // the summit's lead negotiator
  const kiwi = add(makeParrot({}));                                                                  // Gary's macaw
  const blu = add(makeParrot({ body: 0x2f7fd0, wingA: 0x2f6fd0, wingB: 0x1f4fa0, face: 0xfaf6ee }));  // the dinner-party parrot
  blu.g.children.find((o) => o.isMesh && o.geometry.type === 'CapsuleGeometry').material = mat(0x2f7fd0, 0.7);
  mk(new THREE.SphereGeometry(0.05, 12, 10), mat(0xf2c230, 0.7), blu.g, 0, 0.11, 0.035).scale.set(1, 1.3, 0.7);   // gold chest
  const envoy = add(makeParrot({ body: 0x3fae4a, wingA: 0xf2c230, wingB: 0x2f6fd0 }));                     // summit parrot
  const bowlL = add(makeFishBowl({})), bowlO = add(makeFishBowl({ r: 0.19 })), bowlW = add(makeFishBowl({ r: 0.13, fishColor: 0xf2a23a }));
  const hamsters = Array.from({ length: 5 }, (_, i) => add(makeHamster({ color: [0xe2a65e, 0xf2efe8, 0xc98e6a, 0xe2a65e, 0x9a8a7a][i] })));
  const delegate = add(makeHamster({ color: 0xe2a65e }));
  const wheels = Array.from({ length: 5 }, (_, i) => { const w = makeHamsterWheel({ color: [0x3d7bd9, 0xe8553f, 0xf2c14e, 0x6fa84f, 0x8f6fb8][i] }); scene.add(w.g); return w; });
  const perchL = makePerch(1.0), perchD = makePerch(1.08), perchW = makePerch(0.32);
  liv.root.add(perchL.g, perchD.g); perchL.g.position.set(LV.perch[0], 0, LV.perch[1]); perchD.g.position.set(-2.3, 0, -2.2);
  war.root.add(perchW.g);
  const HS = 1.5;                                                       // hamsters + wheels at 1.5× (cartoon readable)
  [...hamsters, delegate].forEach((h) => h.g.scale.setScalar(HS)); wheels.forEach((w) => w.g.scale.setScalar(HS));

  // ---------------------------------------------------------------- props
  const mugG = makeMug(0xf2c14e); scene.add(mugG);
  const kMug = makeMug(0xd2483f); kit.root.add(kMug);
  const shards = Array.from({ length: 7 }, (_, i) => { const s = mk(new THREE.BoxGeometry(0.03 + (i % 3) * 0.01, 0.012, 0.025), mat(0xd2483f, 0.4), kit.root, 0, 0, 0); s.visible = false; return s; });
  const puffs = makeSpritePool(scene, 48, 'smoke');
  const puffCol = new THREE.Color(0xffffff), dirtCol = new THREE.Color(0xd9cfb8);
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,190,0.95)'); gr.addColorStop(0.35, 'rgba(255,210,120,0.45)'); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const glows = Array.from({ length: 6 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const zTex = canvasTex(128, 128, (g, w, h) => { g.font = 'bold 104px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = 'rgba(30,40,70,.85)'; g.strokeText('Z', w / 2, h / 2); g.fillStyle = '#ffffff'; g.fillText('Z', w / 2, h / 2); });
  const zs = Array.from({ length: 4 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });

  // dinner: table setting on a tablecloth (slides off with Kevin)
  const [dx, dz] = LV.dining, DT = LV.diningTop;
  const cloth = new THREE.Group(); liv.root.add(cloth); cloth.position.set(dx, DT, dz);
  const clothM = mat(0xf6f1e6, 0.9, { side: THREE.DoubleSide });
  mk(new THREE.BoxGeometry(1.72, 0.006, 1.0), clothM, cloth, 0, 0.003, 0);
  for (const s of [-1, 1]) { const f = mk(new THREE.PlaneGeometry(1.72, 0.22), clothM, cloth, 0, -0.11, s * 0.5); f.castShadow = false; }
  const dishes = [];
  const dish = (o, x, z) => { o.position.set(x, 0.006, z); cloth.add(o); dishes.push({ o, x, z }); return o; };
  const plate = () => { const g = new THREE.Group(); mk(new THREE.CylinderGeometry(0.12, 0.1, 0.02, 20), mat(0xffffff, 0.3), g, 0, 0.01, 0); mk(new THREE.SphereGeometry(0.04, 8, 6), mat([0xd2483f, 0x6fa84f, 0xf2c14e][dishes.length % 3], 0.6), g, 0.02, 0.03, 0).scale.set(1, 0.5, 1); return g; };
  [[-0.62, 0], [-0.32, -0.3], [0.38, -0.3], [0.62, 0]].forEach(([x, z]) => dish(plate(), x, z));
  const roast = new THREE.Group(); mk(new THREE.CylinderGeometry(0.22, 0.18, 0.03, 24), mat(0xe9e4da, 0.3), roast, 0, 0.015, 0); mk(new THREE.SphereGeometry(0.13, 16, 12), mat(0xc0783a, 0.5), roast, 0, 0.1, 0).scale.set(1.2, 0.75, 0.9);
  for (const s of [-1, 1]) mk(new THREE.CapsuleGeometry(0.03, 0.08, 4, 8), mat(0xc0783a, 0.5), roast, s * 0.1, 0.11, 0.08).rotation.x = 1.2;
  dish(roast, 0.0, 0.05);
  for (const [x, z] of [[-0.25, 0.25], [0.25, 0.25]]) { const c = new THREE.Group(); mk(new THREE.CylinderGeometry(0.03, 0.035, 0.02, 10), mat(0xc9a25a, 0.3, { metalness: 0.6 }), c, 0, 0.01, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), mat(0xf6efe0, 0.6), c, 0, 0.12, 0); mk(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a }), c, 0, 0.235, 0).scale.set(1, 1.6, 1); dish(c, x, z); }
  for (const [x, z] of [[-0.5, -0.12], [0.5, -0.12], [-0.15, -0.28]]) { const gl = new THREE.Group(); mk(new THREE.CylinderGeometry(0.03, 0.02, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0xdff0ff, roughness: 0.05, transparent: true, opacity: 0.45 }), gl, 0, 0.12, 0).castShadow = false; mk(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 6), mat(0xdff0ff, 0.1), gl, 0, 0.04, 0); dish(gl, x, z); }
  const bread = new THREE.Group(); mk(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 14), mat(0xb5762e, 0.8), bread, 0, 0.03, 0); for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.04, 8, 6), mat(0xe0a860, 0.7), bread, Math.cos(k * 1.6) * 0.04, 0.07, Math.sin(k * 1.6) * 0.04).scale.set(1.3, 0.8, 1); dish(bread, 0.35, 0.12);

  // pet shop: a pyramid of food bags (4-3-2-1) and tiny strike signs
  const BAGC = [0xe8553f, 0x3d7bd9, 0xf2c14e, 0x6fa84f, 0x8f6fb8];
  const PYR = [-0.5, -2.1], bags = [];
  for (let row = 0; row < 4; row++) for (let k = 0; k < 4 - row; k++) { const b = mk(new THREE.BoxGeometry(0.32, 0.36, 0.22), mat(BAGC[(row * 3 + k) % 5], 0.6), shop.root, 0, 0, 0); bags.push({ b, x: PYR[0] + (k - (3 - row) / 2) * 0.34, y: 0.18 + row * 0.36, z: PYR[1], row, k }); }
  const strikeTex = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2483f'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#d2483f'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON', w / 2, 50); g.fillText('STRIKE', w / 2, 112); });
  const signs = hamsters.map((h) => { const s = new THREE.Group(); mk(new THREE.CylinderGeometry(0.002, 0.002, 0.11, 4), mat(0x8a5a36, 0.6), s, 0, 0.055, 0); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), new THREE.MeshStandardMaterial({ map: strikeTex, roughness: 0.7, side: THREE.DoubleSide })); pl.position.y = 0.1; s.add(pl); h.paws[1].add(s); s.position.set(0, -0.02, 0.005); s.visible = false; return s; });

  // vet: leashes (lines from each owner's hand to the collar)
  const leashes = Array.from({ length: 2 }, () => { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xd2483f })); l.frustumCulled = false; scene.add(l); return l; });
  const clipboard = mk(new THREE.BoxGeometry(0.2, 0.28, 0.015), mat(0x8a5a36, 0.6), vetDoc.arms.find((a) => a.s === 1).hand, 0, -0.1, 0.05); mk(new THREE.PlaneGeometry(0.17, 0.22), mat(0xffffff, 0.8), clipboard, 0, -0.01, 0.009);

  // summit: a treaty, a pen, raining treats + confetti, globe dots
  const treaty = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshStandardMaterial({ map: canvasTex(192, 256, (g, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a1e'; g.font = 'bold 20px Georgia, serif'; g.textAlign = 'center'; g.fillText('THE PET', w / 2, 36); g.fillText('ACCORDS', w / 2, 60); g.fillStyle = 'rgba(58,42,30,.5)'; for (let i = 0; i < 7; i++) g.fillRect(24, 84 + i * 18, w - 48 - (i % 3) * 20, 5); g.strokeStyle = '#2f4f73'; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 230); g.quadraticCurveTo(80, 200, 110, 228); g.quadraticCurveTo(130, 245, 150, 220); g.stroke(); }), roughness: 0.8 }));
  treaty.rotation.x = -PI / 2; treaty.position.set(0.45, 0.805, 0.55); war.root.add(treaty);
  const TREAT = 160, treats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.025, 0.025), new THREE.MeshStandardMaterial({ roughness: 0.6 }), TREAT);
  treats.frustumCulled = false; war.root.add(treats);
  const TR = rng(9), treatSeeds = Array.from({ length: TREAT }, () => [TR(), TR(), TR(), TR()]);
  treatSeeds.forEach((q, i) => treats.setColorAt(i, new THREE.Color([0xb5762e, 0xe0a860, 0xd2483f, 0xf2c14e, 0x3d7bd9, 0x6fa84f, 0xe58fa6][i % 7])));
  const SITES = [{ lat: 40, lon: -95, w: 3 }, { lat: 50, lon: 10, w: 3 }, { lat: 30, lon: 105, w: 3 }, { lat: -15, lon: -50, w: 2 }, { lat: 22, lon: 78, w: 2 }, { lat: 8, lon: 20, w: 1 }, { lat: -27, lon: 135, w: 1 }, { lat: 36, lon: 138, w: 1 }];
  const dots = makeDots(war.globe, scatter(rng(5), SITES, 900), { color: 0xffc860, size: 0.007, intensity: 2.0 });

  // finale: snow falling past the living-room window (+1 year, winter)
  const SNOW = 140, snow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 6, 4), new THREE.MeshBasicMaterial({ color: 0xf2f6ff }), SNOW);
  snow.frustumCulled = false; liv.root.add(snow); snow.visible = false;
  const SR2 = rng(12), snowSeeds = Array.from({ length: SNOW }, () => [SR2(), SR2(), SR2(), SR2()]);

  // ---------------------------------------------------------------- speech bubbles (one per line of dialogue; rows reveal over time)
  const bubbles = [];
  const B = (o) => { const b = makeSpeechBubble({ width: 1, ...o }); scene.add(b.sprite); bubbles.push(b); return b; };
  const S = {
    kiwi: B({ lines: ['GOOD EVENING, GARY!'], accent: '#d8352a', maxChars: 13, offX: 0.24 }),
    mochi: B({ lines: ['We need to talk.'], accent: '#e08a3a', maxChars: 12, offX: 0.2 }),
    max: B({ lines: ['HE EATS CHEESE AT 3 AM.', 'IN THE DARK.', 'STANDING UP.'], accent: '#3d7bd9', maxChars: 15 }),
    critic: B({ lines: ['Your apartment: 2 stars.', 'The couch: mine.', 'Your boyfriend: no.'], accent: '#7a7f8a', maxChars: 16 }),
    blu: B({ lines: ['“I’M NOT MAD, KEVIN.”', '“FINE.” “FINE!!”', '“THE COUCH. TONIGHT.”'], accent: '#2f7fd0', maxChars: 16, offX: 0.3 }),
    goldie: B({ lines: ['I saw who took the yogurt.', 'It was…', '…who are you people?'], accent: '#f28a2a', maxChars: 16, tail: 120 }),
    hammy: B({ lines: ['9 KM A NIGHT.', 'FOR WHAT?'], accent: '#e2a65e', maxChars: 14 }),
    cone: B({ lines: ['THE CONE? AGAIN?'], accent: '#c98e4a', maxChars: 10, offX: -0.15 }),
    calico: B({ lines: ['I can spell V-E-T.'], accent: '#e08a3a', maxChars: 11 }),
    pug: B({ lines: ['I’m not fat. I’m fluffy.'], accent: '#8a6a4a', maxChars: 12, offX: 0.15 }),
    prezDog: B({ lines: ['HE PRACTICES SPEECHES ON ME.', 'IN A BATHROBE.', 'INTO A HAIRBRUSH.'], accent: '#2f4f73', maxChars: 15 }),
    boss: B({ lines: ['Dinner at 5:00. Not 5:01.', 'No more baths.', 'The red dot: explain.'], accent: '#5a5f6a', maxChars: 15 }),
    fetch: B({ lines: ['GO GET IT, GARY!'], accent: '#3d7bd9', maxChars: 10 }),
    fav: B({ lines: ['You’re my favorite.'], accent: '#e0a83a', maxChars: 11, soft: true, offX: 0.22, tail: 80 }),
  };
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  const frameW = (d) => 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16);
  /** Put bubble b just above `obj` (a head group) at world height +lift, sized to `frac` of the frame width; rows = how many lines. */
  function say(b, obj, k, frac, lift = 0.1, rows = 1, dx = 0) {
    obj.updateWorldMatrix(true, false); obj.getWorldPosition(_v); _v.y += lift; _v.x += dx;
    const d = studio.camera.position.distanceTo(_v);
    b.sprite.position.copy(_v); b.setRows(rows); b.setPop(k * frac * frameW(d));
  }
  const rowsAt = (t, times) => times.filter((x) => t >= x).length;

  // ---------------------------------------------------------------- helpers
  /** pose a person: (x,z) local to the set; p.y / p.floor local; pitch tips the whole body around the feet (+ = forward). */
  function put(rig, key, p, pitch = 0, roll = 0) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    rig.root.rotation.x = pitch; if (roll) rig.root.rotation.z = roll;
    rig.root.visible = true;
  }
  function putPet(pet, key, x, y, z, ry = 0) { pet.g.position.set(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]); pet.g.rotation.set(0, ry, 0); pet.g.visible = true; }
  function burst(base, key, x, y, z, t, m, n = 4, size = 0.35, col = puffCol) { // a soft dust/poof burst at the moment m
    const age = t - m; if (age < 0 || age > 0.8) return;
    for (let k = 0; k < n; k++) { const a = k * (2 * PI / n) + base; puffs.set((base + k) % 48, _w.set(x + OFF[key][0] + Math.cos(a) * (0.1 + age * 0.6), y + 0.1 + age * 0.3 + (k % 2) * 0.08, z + OFF[key][2] + Math.sin(a) * (0.1 + age * 0.4)), size * (0.6 + age * 1.4), 0.85 * (1 - age / 0.8) ** 1.4, col); }
  }
  const walkP = (p, d, v) => { p.dist = d; p.speed = v; };

  // ---------------------------------------------------------------- 1. open (living room, 7:00 PM)
  const TIP = 7.35, MUGFLY = 7.15;
  const chairC = liv.armchair.children[0];
  function openBeat(t) {
    liv.setMode('evening');
    const tip = K(t, [[TIP, 0], [TIP + 0.45, 1]], fall), land = K(t, [[TIP + 0.45, 0], [TIP + 0.55, 1], [TIP + 0.75, 0]]);
    liv.armchair.rotation.x = -1.42 * tip + 0.06 * land;
    // Gary rides the chair (his root lives in the chair's group this beat)
    chairC.add(gary.root);
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: 0, z: 0.04, rotY: 0, y: seatY(0.47), footFwd: 0.42 });
    const sip = K(t, [[1.0, 0], [1.4, 1], [2.3, 1], [2.7, 0]]) + K(t, [[4.0, 0], [4.4, 1], [4.9, 1], [5.3, 0]]);
    p.armB = mixArm(MUG_B, SIP_B, sip); p.armA = ARMREST_A; p.headPitch = 0.05 - 0.1 * sip;
    const lookP = K(t, [[6.15, 0], [6.35, 1]]), lookC = K(t, [[6.85, 0], [7.0, 1]]), jolt = K(t, [[MUGFLY - 0.1, 0], [MUGFLY + 0.08, 1]]);
    p.headYaw = 0.55 * lookP * (1 - lookC) + 0.95 * lookC; p.headPitch -= 0.15 * lookC;
    p.mouth = t > 6.2 ? 'o' : 'smile';
    if (jolt > 0) { p.armA = mixArm(p.armA, FLAIL_A, jolt); p.armB = mixArm(p.armB, FLAIL_B, jolt); p.lean = -0.2 * jolt; }
    if (tip > 0.5) { const w = Math.sin(t * 14); p.footFwd = 0.42 + 0.25 * w; p.armA.sx += 0.3 * w; p.armB.sx -= 0.3 * w; }
    applyPose(gary, p); gary.root.rotation.x = 0; gary.root.visible = true;
    mugG.visible = true;
    if (t < MUGFLY) { gary.arms.find((a) => a.s === 1).hand.add(mugG); mugG.position.set(0, -0.06, 0.05); mugG.rotation.set(0, 0, 0); }
    else { // flies off in an arc, tumbling, lands on the rug
      scene.add(mugG); const u = clamp((t - MUGFLY) / 0.75);
      const x0 = LV.armchair[0] + 0.12, y0 = 0.95, z0 = LV.armchair[1] + 0.25, x1 = 0.12, z1 = -0.55;
      mugG.position.set(lerp(x0, x1, u), u < 1 ? y0 + 0.9 * u - 1.85 * u * u + 0.0 : 0.0, lerp(z0, z1, u)); mugG.position.y = Math.max(0, mugG.position.y);
      mugG.rotation.set(u * 9, 0, u * 5 * (u < 1 ? 1 : 0) + (u >= 1 ? PI / 2 : 0));
    }
    burst(0, 'liv', LV.armchair[0], 0.0, LV.armchair[1] - 0.6, t, TIP + 0.45, 5, 0.45);
    // the cat: on the chair back, then leaps to the coffee table
    const cj = K(t, [[TIP - 0.05, 0], [TIP + 0.45, 1]], (u) => u);
    const c0 = [LV.armchair[0] + 0.27, 0.93, LV.armchair[1] - 0.33], c1 = [LV.coffee[0] - 0.32, LV.coffeeTop, LV.coffee[1] + 0.05];
    putPet(mochi, 'liv', lerp(c0[0], c1[0], cj), lerp(c0[1], c1[1], cj) + 0.45 * Math.sin(cj * PI), lerp(c0[2], c1[2], cj), lerpAngle(-0.5, 0.35, K(t, [[6.7, 0], [6.9, 1]])) );
    const groom = t < M ? Math.max(0, Math.sin(t * 2.6)) : 0;   // grooming behind the title (motion before the moment)
    mochi.update(t, 1); mochi.talk(talkK(t, 6.95, 0.8)); mochi.squint(t > 6.9 ? 0.6 : 0.2 + 0.4 * groom); mochi.paw(0.55 * groom);
    mochi.head.rotation.set(0.45 * groom, cj > 0 ? 0 : lerp(-0.4, 0.5, K(t, [[6.6, 0], [6.85, 1]])), 0.15 * groom);
    // the parrot on its perch; the fish; Biscuit asleep in his bed (snoring through all of it)
    putPet(kiwi, 'liv', LV.perch[0], 1.016, LV.perch[1], lerpAngle(0, -0.85, K(t, [[M + 0.3, 0], [M + 0.5, 1]])));
    kiwi.update(t, K(t, [[6.1, 0], [6.2, 1], [6.9, 1], [7.0, 0]]) * 0.6 + K(t, [[TIP + 0.3, 0], [TIP + 0.4, 1], [TIP + 1.4, 1], [TIP + 1.6, 0]]) + 0.5 * K(t, [[2.3, 0], [2.45, 1], [3.0, 1], [3.2, 0]])); kiwi.talk(talkK(t, 6.2, 1.0, 20));
    putPet(bowlL, 'liv', LV.side[0], LV.sideTop, LV.side[1], 0.3); bowlL.update(t, K(t, [[M + 0.2, 0], [M + 0.6, 1], [TIP, 1], [TIP + 0.5, 0]])); bowlL.talk(t > M + 0.7 && t < TIP ? 0.5 + 0.5 * Math.sin(t * 9) : 0);
    biscuitAsleep(t, LV.dogBed[0], LV.dogBed[1], 0.7);
    // the moment: a warm glow passes through every pet (left → right)
    [[bowlL.fish, 0], [biscuit.head, 0.08], [mochi.head, 0.16], [kiwi.head, 0.24]].forEach(([o, dl], i) => { const age = t - M - dl; if (age < 0 || age > 0.9) return; o.updateWorldMatrix(true, false); o.getWorldPosition(_v); glows[i].visible = true; glows[i].position.copy(_v); glows[i].scale.setScalar(0.25 + age * 0.9); glows[i].material.opacity = Math.sin(clamp(age / 0.9) * PI) * 0.9; });
    say(S.kiwi, kiwi.head, pop(t, 6.2) * (1 - K(t, [[6.75, 0], [6.9, 1]])), 0.5, 0.1);
    say(S.mochi, mochi.head, pop(t, 6.9) * (1 - K(t, [[TIP - 0.1, 0], [TIP, 1]])), 0.42, 0.12);
  }
  function biscuitAsleep(t, x, z, ry) {
    putPet(biscuit, 'liv', x, 0.03, z, ry); biscuit.setLie(1); biscuit.setWag(3); biscuit.update(t, 0);
    biscuit.head.rotation.set(0.42, 0, 0); biscuit.g.children[0].scale.set(1, 1 + 0.03 * Math.sin(t * 2.2), 1);
    zs.forEach((s, k) => { const age = (t + k * 0.55) % 2.2; s.visible = true; biscuit.head.getWorldPosition(_v); s.position.set(_v.x + 0.08 + 0.05 * Math.sin(age * 3 + k), _v.y + 0.1 + age * 0.22, _v.z); s.scale.setScalar(0.05 + age * 0.03); s.material.opacity = Math.min(1, age * 3) * (1 - age / 2.2); });
  }

  // ---------------------------------------------------------------- 2. lawn (suburb, +1 minute)
  const DOOR = [-2.2, -8.75], TRIP = 13.75, LAND = 14.1, MAXDOG = [-1.05, -4.3];
  function lawnBeat(t) {
    sub.aimSun(-1.5, -5, 9);
    const house = sub.houses.find((h) => Math.abs(h.doorPos.x - DOOR[0]) < 0.5 && h.doorPos.z < -5);
    if (house) house.door.rotation.y = K(t, [[12.1, 0], [12.35, 1.45]]);
    // Max on the lawn: shouts at the street, looks back at the door, dodges right
    const dodge = K(t, [[13.35, 0], [13.6, 1]]);
    const mx = MAXDOG[0] + 0.75 * dodge, mz = MAXDOG[1] + 0.25 * dodge;
    const look = K(t, [[12.3, 0], [12.5, 1]]);
    putPet(max, 'sub', mx, 0, mz, lerpAngle(0.3, PI - 0.5, look * (1 - K(t, [[13.6, 0], [13.9, 1]]))));
    max.g.scale.setScalar(1);
    const rows = rowsAt(t, [10.2, 11.05, 11.85]);
    max.update(t, dodge > 0 && dodge < 1 ? 1.6 : 0); max.bark(Math.max(talkK(t, 10.2, 0.75, 16), talkK(t, 11.05, 0.6, 16), talkK(t, 11.85, 0.6, 16)));
    say(S.max, max.head, pop(t, 10.2) * (1 - K(t, [[12.35, 0], [12.5, 1]])), 0.62, 0.14, rows, 0.15);
    // Dave (Max's owner, bathrobe): bursts out, sprints, trips, face-plants
    const run = K(t, [[12.35, 0], [TRIP, 1]], (u) => u);
    if (t > 12.2) {
      const p = basePose(); p.eyes = blink(t, 5);
      const x = lerp(DOOR[0], MAXDOG[0] - 0.2, run), z = lerp(DOOR[1], MAXDOG[1] - 1.75, run), onPorch = z < -7.05;
      Object.assign(p, { x, z, rotY: faceToward(DOOR[0], DOOR[1], MAXDOG[0], MAXDOG[1]), y: onPorch ? 0.3 : 0, floor: onPorch ? 0.3 : 0 });
      walkP(p, run * 3.4, run > 0 && run < 1 ? 2.6 : 0); p.lean = 0.2; p.armA = REACH_A; p.armB = REACH_B; p.mouth = 'o';
      const fallK = K(t, [[TRIP, 0], [LAND, 1]], fall);
      if (fallK > 0) { p.speed = 0; p.armA = mixArm(REACH_A, A(-2.6, 0.3, -0.2, 0.2), fallK); p.armB = mixArm(REACH_B, A(-2.6, 0.3, -0.2, -0.2), fallK); p.footFwd = -0.3 * fallK; p.eyes = 'closed'; }
      put(dave, 'sub', p, 1.42 * fallK);
      if (t > LAND) { const k = Math.sin((t - LAND) * 12) * 0.12 * Math.max(0, 1 - (t - LAND)); dave.root.rotation.x += k; }
    }
    burst(3, 'sub', MAXDOG[0] - 0.2, 0, MAXDOG[1] - 0.4, t, LAND, 6, 0.55, dirtCol);
    // the neighbors: everyone stops and turns at once
    const turn = K(t, [[11.9, 0], [12.15, 1]]);
    const N = [{ x: -2.35, z: -6.7, ry: 0.9, crouch: 0.3 }, { x: -0.15, z: -6.5, ry: -0.9 }];
    N.forEach((n, i) => {
      const p = basePose(); p.eyes = blink(t, i + 7);
      Object.assign(p, { x: n.x, z: n.z, rotY: n.ry, crouch: n.crouch || 0, lean: n.crouch ? 0.5 : 0.03 });
      const work = Math.sin(t * 5 + i) * (1 - turn);
      p.armA = n.crouch ? A(-1.2 + 0.3 * work, 0.1, -0.5, 0.3) : i === 1 ? A(-0.9, 0.1, -1.3, 0.4) : REST;
      p.armB = n.crouch ? A(-1.2 - 0.3 * work, 0.1, -0.5, -0.3) : i === 1 ? A(-0.9, 0.1, -1.3, -0.4) : REST;
      p.headYaw = turn * (faceToward(n.x, n.z, MAXDOG[0], MAXDOG[1]) - n.ry); p.headYaw = Math.max(-1.2, Math.min(1.2, ((p.headYaw + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI));
      p.lean -= 0.12 * turn; p.mouth = turn > 0.5 ? 'o' : 'smile';
      if (t > 12.6 && i > 1) { const lk = K(t, [[12.6, 0], [12.9, 1]]); p.headYaw = lerp(p.headYaw, Math.max(-1.2, Math.min(1.2, faceToward(n.x, n.z, DOOR[0], DOOR[1]) - n.ry)), lk * 0.6); }
      if (t > LAND) { p.armA = mixArm(p.armA, CHEEK_A, K(t, [[LAND, 0], [LAND + 0.25, 1]])); p.armB = mixArm(p.armB, CHEEK_B, K(t, [[LAND, 0], [LAND + 0.25, 1]])); }
      put(crowd[i], 'sub', p);
    });
  }

  // ---------------------------------------------------------------- 3. counter (kitchen, +5 minutes)
  const CAT_K = [0.42, 0.87, -2.22], MUG0 = [0.68, 0.87, -2.06], PUSH = 18.35, DROP = 18.85, SMASH = DROP + 0.42;
  function counterBeat(t) {
    putPet(greyCat, 'kit', CAT_K[0], CAT_K[1], CAT_K[2], lerpAngle(0, 0.55, K(t, [[PUSH - 0.4, 0], [PUSH - 0.1, 1]])));
    greyCat.update(t, 1.3); greyCat.squint(0.55 + 0.2 * K(t, [[PUSH, 0], [PUSH + 0.3, 1]]));
    const rows = rowsAt(t, [15.55, 16.45, 17.3]);
    greyCat.talk(Math.max(talkK(t, 15.55, 0.8, 12), talkK(t, 16.45, 0.7, 12), talkK(t, 17.3, 0.8, 12)));
    greyCat.paw(K(t, [[PUSH - 0.15, 0], [PUSH + 0.15, 0.9], [DROP, 1.0], [DROP + 0.3, 0]]));
    greyCat.head.rotation.set(-0.05, lerp(0, -0.55, K(t, [[PUSH - 0.4, 0], [PUSH - 0.1, 1]])), 0.08 * Math.sin(t * 1.3));   // stares at YOU while pushing
    say(S.critic, greyCat.head, pop(t, 15.55) * (1 - K(t, [[PUSH - 0.35, 0], [PUSH - 0.15, 1]])), 0.6, 0.12, rows);
    // the mug: nudged to the edge… over… smash
    const slide = K(t, [[PUSH + 0.05, 0], [DROP, 1]], (u) => u), dropU = clamp((t - DROP) / (SMASH - DROP));
    if (t < SMASH) { kMug.visible = true; kMug.position.set(MUG0[0] + 0.02 * slide, MUG0[1] - 0.87 * dropU * dropU, MUG0[2] + 0.11 * slide + 0.12 * dropU); kMug.rotation.set(1.6 * dropU, 0, 0.9 * dropU); }
    else kMug.visible = false;
    shards.forEach((s, i) => { s.visible = t >= SMASH; if (!s.visible) return; const age = Math.min(0.5, t - SMASH), a = i * 0.9 + 0.3; s.position.set(MUG0[0] + Math.cos(a) * age * 0.9, 0.006 + Math.max(0, 0.25 * Math.sin(Math.min(1, age / 0.3) * PI)) * (i % 2 ? 1 : 0.5), MUG0[2] + 0.23 + Math.sin(a) * age * 0.6); s.rotation.set(age * 9, i, age * 6); });
    burst(10, 'kit', MUG0[0], 0, MUG0[2] + 0.23, t, SMASH, 5, 0.3);
    // Linda + the boyfriend
    const roast = K(t, [[17.35, 0], [17.6, 1]]), shock = K(t, [[SMASH - 0.05, 0], [SMASH + 0.1, 1]]);
    const L = basePose(); L.eyes = blink(t, 3); Object.assign(L, { x: -0.28, z: -1.65, rotY: faceToward(-0.28, -1.65, CAT_K[0], CAT_K[2]) });
    L.armA = CROSS_A; L.armB = CROSS_B; L.headYaw = 0.75 * roast * (1 - shock); L.mouth = 'flat';
    if (t > 15.6 && t < 17.3) { L.armA = mixArm(CROSS_A, REST, 0.3); L.headPitch = 0.1; }
    if (shock > 0) { L.armA = mixArm(L.armA, CHEEK_A, shock); L.armB = mixArm(L.armB, CHEEK_B, shock); L.mouth = 'o'; L.lean = -0.15 * shock; }
    put(linda, 'kit', L);
    const Bp = basePose(); Bp.eyes = blink(t, 6); Object.assign(Bp, { x: 1.15, z: -1.65, rotY: faceToward(1.15, -1.65, CAT_K[0], CAT_K[2]) });
    Bp.armA = REST; Bp.armB = A(-0.9, 0.15, -1.6, -0.4); Bp.mouth = roast > 0.5 ? 'o' : 'smile'; Bp.lean = -0.18 * roast;
    Bp.headYaw = -0.6 * roast * (1 - shock);
    if (shock > 0) { Bp.armA = mixArm(Bp.armA, CHEEK_A, shock); Bp.armB = mixArm(Bp.armB, CHEEK_B, shock); }
    put(boyf, 'kit', Bp);
  }

  // ---------------------------------------------------------------- 4. dinner (dining room, +1 hour)
  const TURN = 22.75, SLIDE = 24.2, CRASH = 24.95;
  function dinnerBeat(t) {
    liv.setMode('dinner');
    const turnK = K(t, [[TURN, 0], [TURN + 0.2, 1]]);
    const rows = rowsAt(t, [21.0, 21.9, 22.75]);
    putPet(blu, 'liv', -2.3, 1.096, -2.2, -0.55); blu.update(t, Math.max(K(t, [[CRASH, 0], [CRASH + 0.1, 1], [CRASH + 1.0, 1], [CRASH + 1.2, 0]]), 0.3 * talkK(t, 21.0, 2.6, 6)));
    blu.talk(Math.max(talkK(t, 21.0, 0.8, 20), talkK(t, 21.9, 0.7, 20), talkK(t, 22.75, 0.8, 20)));
    say(S.blu, blu.head, pop(t, 21.0) * (1 - K(t, [[SLIDE - 0.25, 0], [SLIDE, 1]])), 0.58, 0.12, rows);
    // diners: [Kevin left end, Brenda back-left, guest back-right, guest right end]
    const slideK = K(t, [[SLIDE, 0], [CRASH, 1]], (u) => u * u * (3 - 2 * u));
    const seats = [{ x: dx - 0.98, z: dz, ry: PI / 2, rig: kevin }, { x: dx - 0.4, z: dz - 0.68, ry: 0, rig: brenda }, { x: dx + 0.4, z: dz - 0.68, ry: 0, rig: crowd[4] }, { x: dx + 0.98, z: dz, ry: -PI / 2, rig: crowd[5] }];
    seats.forEach((s, i) => {
      const p = basePose(); p.eyes = blink(t, i + 2);
      Object.assign(p, { x: s.x, z: s.z, rotY: s.ry, y: seatY(0.49), footFwd: 0.42 });
      p.armA = LEAN_A; p.armB = i === 2 ? A(-0.85, 0.1, -1.6, -0.5) : LEAN_B; p.mouth = 'smile';
      const atBird = faceToward(s.x, s.z, -2.3, -2.2) - s.ry, atKev = faceToward(s.x, s.z, dx - 0.98, dz) - s.ry, atBren = faceToward(s.x, s.z, dx - 0.4, dz - 0.68) - s.ry;
      const wrap = (a) => Math.max(-1.3, Math.min(1.3, ((a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI));
      const birdK = K(t, [[21.05 + i * 0.03, 0], [21.25 + i * 0.03, 1]]);
      p.headYaw = lerp(0, wrap(atBird), birdK);
      if (i >= 2) p.headYaw = lerp(p.headYaw, wrap(i === 2 ? atKev : atKev), turnK);
      if (i === 1) { p.headYaw = lerp(p.headYaw, wrap(atKev), turnK); p.armB = mixArm(p.armB, FACE_B, K(t, [[22.0, 0], [22.3, 1]])); p.mouth = 'flat'; }
      if (i === 0) { // Kevin: frozen, then slides down under the table
        p.headYaw = lerp(p.headYaw, wrap(atBren), turnK * 0.7); p.mouth = turnK > 0.5 ? 'o' : 'smile';
        p.y = seatY(0.49) - 0.62 * slideK; p.footFwd = 0.42 + 0.4 * slideK; p.lean = -0.35 * slideK; p.armA = mixArm(LEAN_A, A(-1.3, 0.2, -0.3, 0.3), slideK); p.armB = mixArm(LEAN_B, A(-1.3, 0.2, -0.3, -0.3), slideK);
      } else if (t > CRASH) { p.mouth = 'o'; p.lean = -0.1; p.armA = mixArm(p.armA, CHEEK_A, K(t, [[CRASH, 0], [CRASH + 0.2, 1]])); if (i !== 1) p.armB = mixArm(p.armB, CHEEK_B, K(t, [[CRASH, 0], [CRASH + 0.2, 1]])); }
      if (i >= 2 && turnK > 0) p.mouth = 'o';
      put(s.rig, 'liv', p);
    });
    // the tablecloth slides toward Kevin; everything goes over the edge
    const sl = 1.05 * slideK; cloth.position.set(dx - sl, DT, dz);
    dishes.forEach((d, i) => {
      const edge = -LV.diningSize[0] / 2 - 0.02, xw = d.x - sl, over = Math.max(0, edge - xw), tOver = over > 0 ? (t - SLIDE) - 0.25 - i * 0.02 : 0;
      d.o.position.set(d.x - over * 0.9, 0.006 - (over > 0 ? Math.min(DT, 4.9 * Math.max(0, tOver) ** 2 + over * 0.6) : 0), d.z + (i % 2 ? 0.3 : -0.3) * over);
      d.o.rotation.set(0, 0, over > 0 ? Math.min(1.4, over * 3) : 0);
    });
    burst(16, 'liv', dx - 1.2, 0, dz, t, CRASH, 6, 0.55); burst(22, 'liv', dx - 0.9, 0.5, dz + 0.3, t, CRASH + 0.08, 4, 0.4);
  }

  // ---------------------------------------------------------------- 5. fish (office, +14 hours)
  const LEANIN = 28.35, FORGET = 29.45, TOPPLE = 30.1;
  const BOWL_O = [0.0, OD.deskTop, -0.62];
  function fishBeat(t) {
    putPet(bowlO, 'off', BOWL_O[0], BOWL_O[1], BOWL_O[2], 0);
    const face = K(t, [[26.0, 0], [26.25, 1], [FORGET + 0.4, 1], [FORGET + 0.9, 0]]);
    bowlO.update(t, face);
    const rows = rowsAt(t, [26.2, 27.35, FORGET]);
    bowlO.talk(Math.max(talkK(t, 26.2, 1.0, 9), talkK(t, 27.35, 0.6, 9), talkK(t, FORGET, 0.9, 9)));
    if (t > FORGET - 0.1 && t < FORGET + 0.5) bowlO.fish.rotation.y += 0.5 * Math.sin((t - FORGET) * 14);
    say(S.goldie, bowlO.fish, pop(t, 26.2), 0.5, 0.2, rows);
    // coworkers: lean in as one, then all fall over backward
    const CW = [[-0.72, -1.3], [-0.42, -1.85], [0.72, -1.3], [-1.02, -0.72], [1.02, -0.72]];
    const lean = K(t, [[LEANIN, 0], [LEANIN + 0.45, 1], [FORGET + 0.15, 1], [FORGET + 0.4, 0.7]]);
    CW.forEach(([x, z], i) => {
      const p = basePose(); p.eyes = blink(t, i);
      Object.assign(p, { x, z, rotY: faceToward(x, z, BOWL_O[0], BOWL_O[2]) });
      p.lean = 0.05 + 0.5 * lean; p.headPitch = 0.15 + 0.25 * lean; p.armA = mixArm(REST, A(-0.5, 0.15, -0.6, 0.3), lean); p.armB = mixArm(REST, A(-0.5, 0.15, -0.6, -0.3), lean);
      p.mouth = t > 27.4 ? 'o' : 'smile';
      if (i === 2) p.armB = mixArm(A(-0.9, 0.15, -1.5, -0.4), p.armB, lean);   // holding a mug before
      const tp = K(t, [[TOPPLE + i * 0.05, 0], [TOPPLE + 0.4 + i * 0.05, 1]], fall);
      if (t > FORGET + 0.2) { p.mouth = 'flat'; p.eyes = 'open'; }
      if (tp > 0) { p.armA = mixArm(p.armA, FLAIL_A, tp); p.armB = mixArm(p.armB, FLAIL_B, tp); p.lean = lerp(p.lean, -0.1, tp); p.headPitch = -0.3 * tp; p.mouth = 'o'; }
      put(crowd[6 + i], 'off', p, -1.45 * tp);
      burst(20 + i * 3, 'off', x + Math.sin(p.rotY) * -1.2, 0, z + Math.cos(p.rotY) * -1.2, t, TOPPLE + 0.4 + i * 0.05, 3, 0.35);
    });
  }

  // ---------------------------------------------------------------- 6. wheels (pet shop, +1 day)
  const STOP = 34.0, POPOUT = 34.25, ROLL0 = 34.7, ROLL1 = 35.75;
  const WPOS = [[0.2, -0.95], [-0.12, -1.08], [-0.44, -1.21], [0.52, -1.25], [-0.76, -1.36]], RUN = 2;
  let wheelAng = 0, lastT = -1;
  function wheelsBeat(t) {
    shop.update(t);
    const top = PS.shop.tableTop + 0.02;
    const spin = t < STOP ? 1 : Math.max(0, 1 - (t - STOP) / 0.12);
    const dt = lastT < 0 || t < lastT ? 0 : t - lastT; lastT = t; wheelAng += dt * 14 * spin;
    wheels.forEach((w, i) => {
      let [x, z] = WPOS[i], y = top, ry = 0.25, rz = 0;
      if (i === RUN && t > ROLL0) { // the lead wheel breaks loose: off the table, across the floor, into the pyramid
        const u = clamp((t - ROLL0) / (ROLL1 - ROLL0)), fallU = clamp((t - ROLL0) / 0.35);
        x = lerp(WPOS[RUN][0], PYR[0] + 0.1, u); z = lerp(WPOS[RUN][1], PYR[1] + 0.3, u); const off = clamp((t - ROLL0 - 0.3) / 0.3); y = top - top * off * off; ry = faceToward(WPOS[RUN][0], WPOS[RUN][1], PYR[0], PYR[1]) + PI / 2; void fallU;
        w.spin(-t * 20);
      } else w.spin(-wheelAng * (1 + i * 0.07));
      w.g.position.set(x + OFF.shop[0], y, z + OFF.shop[2]); w.g.rotation.set(0, ry, rz); w.g.visible = true;
      // the hamster: running inside (bottom of the wheel) until the strike, then out in front, standing, sign up
      const h = hamsters[i], out = K(t, [[POPOUT + i * 0.04, 0], [POPOUT + 0.25 + i * 0.04, 1]]);
      const inX = x + OFF.shop[0], inY = top + 0.035 * HS, hx = lerp(inX, inX + Math.sin(ry) * 0.0, out), hz = lerp(z, z + 0.2, out) + OFF.shop[2];
      h.g.position.set(hx, inY + 0.06 * Math.sin(out * PI), hz); h.g.rotation.set(0, lerpAngle(-PI / 2 + ry, 0, out), 0); h.g.visible = true;
      h.update(t, t < STOP ? 1 : 0); h.stand(K(t, [[POPOUT + 0.3 + i * 0.04, 0], [POPOUT + 0.5 + i * 0.04, 1]])); signs[i].visible = t > POPOUT + 0.35 + i * 0.04;
      h.talk(i === 0 ? Math.max(talkK(t, 31.85, 0.8, 18), talkK(t, 32.85, 0.7, 18)) : 0);
      if (t > POPOUT + 0.5) h.paws[1].position.y += 0.012 * Math.sin(t * 6 + i);        // waving the signs
    });
    const rows = rowsAt(t, [31.85, 32.85]);
    say(S.hammy, hamsters[0].head, pop(t, 31.85) * (1 - K(t, [[STOP - 0.25, 0], [STOP - 0.05, 1]])), 0.58, 0.12, rows);
    // the pyramid of food bags gets flattened
    const hit = ROLL1 - 0.05;
    bags.forEach((q, i) => {
      const age = t - hit - (3 - q.row) * 0.04, k = clamp(age / 0.45);
      const dirx = (q.k - (3 - q.row) / 2) * 0.5 + (q.row % 2 ? 0.2 : -0.2);
      q.b.position.set(q.x + dirx * k * 0.6 + (age > 0 ? 0.05 : 0), age > 0 ? Math.max(0.11, q.y - 4.9 * Math.min(age, 0.45) ** 2 * (q.row ? 1.4 : 0.3)) : q.y, q.z + 0.35 * k * (q.row ? 1 : 0.2));
      q.b.rotation.set(age > 0 ? 0.3 * k : 0, (i % 3 - 1) * 0.3 * k, age > 0 ? (q.row ? 1.4 : 0.3) * k * (dirx < 0 ? 1 : -1) : 0);
    });
    burst(30, 'shop', PYR[0], 0.9, PYR[1] + 0.3, t, hit + 0.3, 6, 0.6);
    // the clerk turns around at the strike, hands on his head at the crash
    const c = basePose(); c.eyes = blink(t, 4); Object.assign(c, { x: 0.95, z: -2.15, rotY: lerpAngle(-PI / 2 - 0.4, 0.2, K(t, [[STOP, 0], [STOP + 0.4, 1]])) });
    c.armA = A(-0.9, 0.1, -1.4, 0.4); c.armB = A(-0.9, 0.1, -1.4, -0.4); c.mouth = t > STOP ? 'o' : 'smile';
    if (t > hit) { const k = K(t, [[hit, 0], [hit + 0.25, 1]]); c.armA = mixArm(c.armA, CHEEK_A, k); c.armB = mixArm(c.armB, CHEEK_B, k); c.headYaw = -0.6 * k; }
    put(clerk, 'shop', c);
  }

  // ---------------------------------------------------------------- 7. vet (+2 days)
  const NEXT = 40.0, BOLT = 40.45;
  const V = PS.vet;
  function vetBeat(t) {
    vet.examDoor.rotation.y = -1.45 * K(t, [[38.9, 0], [39.3, 1]]);
    const bolt = (dl = 0) => K(t, [[BOLT + dl, 0], [BOLT + 1.5 + dl, 1]], (u) => u * u);
    // owners: chair 1 (dog with the cone at his feet), chair 2 (the calico on her lap), chair 3 (the pug), chair 0 (a reader)
    const own = [{ i: 1, rig: crowd[11], pet: 'cone' }, { i: 2, rig: crowd[12], pet: 'cat' }, { i: 3, rig: crowd[13], pet: 'pug' }, { i: 0, rig: crowd[14], pet: null }];
    own.forEach((o, k) => {
      const cx = V.chairs[o.i], p = basePose(); p.eyes = blink(t, k + 3);
      Object.assign(p, { x: cx, z: V.chairZ + 0.05, rotY: 0, y: seatY(V.seat), footFwd: 0.42 });
      p.armA = LEAN_A; p.armB = LEAN_B; p.mouth = 'smile';
      if (o.pet === 'cat') { p.armA = A(-0.25, 0.25, -0.6, 0.3); p.armB = A(-0.55, 0.15, -1.0, -0.4); }
      if (o.pet === null) { p.armB = A(-0.9, 0.15, -1.6, -0.4); p.armA = A(-0.9, 0.15, -1.6, 0.4); p.headPitch = 0.3; }
      const heard = K(t, [[36.95 + k * 1.0, 0], [37.15 + k * 1.0, 1]]); if (o.pet) p.headPitch = 0.25 * heard; if (o.pet) p.mouth = heard > 0.5 ? 'flat' : 'smile';
      let pitch = 0;
      if (o.pet === 'cone' || o.pet === 'pug') { // dragged off the chair toward the exit (+x)
        const b = bolt(o.pet === 'pug' ? 0.1 : 0);
        if (b > 0) { p.y = lerp(seatY(V.seat), 0, Math.min(1, b * 3)); p.footFwd = 0.42 * (1 - Math.min(1, b * 3)); p.x = cx + 1.9 * b; p.z = V.chairZ + 0.3 + 0.3 * b; p.rotY = PI / 2 * Math.min(1, b * 4); p.armB = REACH_B; p.armA = REACH_A; p.mouth = 'o'; pitch = 1.3 * Math.min(1, b * 2.5); p.y = Math.min(p.y, 0); }
      }
      if (o.pet === 'cat' && t > BOLT) { p.armA = mixArm(p.armA, CHEEK_A, K(t, [[BOLT, 0], [BOLT + 0.2, 1]])); p.armB = mixArm(p.armB, CHEEK_B, K(t, [[BOLT, 0], [BOLT + 0.2, 1]])); p.mouth = 'o'; p.headYaw = 0.6 * K(t, [[BOLT + 0.2, 0], [BOLT + 0.5, 1]]); }
      if (o.pet === null && t > NEXT) { p.headPitch = 0; p.headYaw = -0.5; p.mouth = 'o'; }
      put(o.rig, 'vet', p, pitch);
      o.rig.root.updateMatrixWorld(true);
    });
    // pets
    const bc = bolt(0), bp = bolt(0.1), bk = bolt(0.05);
    const coneX = V.chairs[1] + 0.05 + 2.2 * bc, coneZ = V.chairZ + 0.55 + 0.3 * bc;
    putPet(coneDog, 'vet', coneX, 0, coneZ, bc > 0 ? PI / 2 : 0.15); coneDog.update(t, bc > 0 && bc < 1 ? 2 : 0);
    coneDog.bark(talkK(t, 36.95, 0.7, 14)); coneDog.head.rotation.y = 0;
    const pugX = V.chairs[3] - 0.05 + 2.0 * bp, pugZ = V.chairZ + 0.55 + 0.35 * bp;
    putPet(pug, 'vet', pugX, 0, pugZ, bp > 0 ? PI / 2 : -0.2); pug.update(t, bp > 0 && bp < 1 ? 2 : 0); pug.bark(talkK(t, 38.95, 0.9, 12));
    const lap = [V.chairs[2] + 0.05, 0, V.chairZ + 0.6];
    const cx = lap[0] + 2.4 * bk, cy = 0.2 * Math.abs(Math.sin(bk * 9));
    putPet(calico, 'vet', cx, cy, lap[2] + 0.4 * bk, bk > 0 ? PI / 2 : 0); calico.update(t, 1); calico.talk(talkK(t, 37.95, 0.9, 12)); calico.squint(0.5); calico.paw(0); calico.head.rotation.set(0, 0, 0);
    leashes.forEach((l, i) => {
      const o = own[i === 0 ? 0 : 2], pet = i === 0 ? coneDog : pug; const hand = o.rig.arms.find((a) => a.s === 1).hand; hand.getWorldPosition(_v); pet.head.getWorldPosition(_w); _w.y -= 0.08; _w.z -= 0.05;
      const pos = l.geometry.attributes.position; pos.setXYZ(0, _v.x, _v.y, _v.z); pos.setXYZ(1, _w.x, _w.y, _w.z); pos.needsUpdate = true; l.visible = true;
    });
    say(S.cone, coneDog.head, pop(t, 36.95) * (1 - K(t, [[38.05, 0], [38.2, 1]])), 0.5, 0.14);
    say(S.calico, calico.head, pop(t, 37.95) * (1 - K(t, [[39.05, 0], [39.2, 1]])), 0.5, 0.14);
    say(S.pug, pug.head, pop(t, 38.95) * (1 - K(t, [[NEXT - 0.15, 0], [NEXT, 1]])), 0.5, 0.14);
    // the vet steps out of EXAM 1
    const w = K(t, [[39.0, 0], [NEXT, 1]], (u) => u), p = basePose(); p.eyes = blink(t, 9);
    const vx = lerp(V.exam[0], -1.55, w), vz = lerp(V.exam[1] + 0.2, -1.3, w);
    Object.assign(p, { x: vx, z: vz, rotY: w < 1 ? faceToward(V.exam[0], V.exam[1], -1.55, -1.3) : lerpAngle(0.9, 0.6, K(t, [[NEXT, 0], [NEXT + 0.3, 1]])) });
    walkP(p, w * 1.6, w > 0 && w < 1 ? 1.1 : 0); p.armB = A(-0.7, 0.1, -1.3, -0.4); p.armA = t > NEXT ? A(-1.6, 0.25, -0.2, 0.2) : REST; p.mouth = t > NEXT && t < NEXT + 0.5 ? 'o' : 'smile';
    if (t > BOLT + 0.3) { p.mouth = 'o'; p.headYaw = 0.8; p.armA = CHEEK_A; }
    if (t > 38.9) put(vetDoc, 'vet', p);
    burst(36, 'vet', V.chairs[2] + 1.0, 0, V.chairZ + 0.6, t, BOLT + 0.2, 6, 0.4);
  }

  // ---------------------------------------------------------------- 8. press (+3 days)
  const LUNGE = 45.55, TOPPLE_L = 45.85;
  function pressBeat(t) {
    press.setFlashes(t, t > 42.6 ? (t > TOPPLE_L ? 5 : 2.2) : 0.8);
    const tip = K(t, [[TOPPLE_L, 0], [TOPPLE_L + 0.45, 1]], fall); lect.rotation.x = 1.42 * tip;
    // the dog on the lectern top, then a leap off to the left
    const jump = K(t, [[TOPPLE_L - 0.1, 0], [TOPPLE_L + 0.4, 1]], (u) => u);
    const rows = rowsAt(t, [42.55, 43.55, 44.4]);
    const dx0 = PD.lectern[0] - 0.05, dy0 = 1.47, dz0 = PD.lectern[1] - 0.05;
    putPet(prezDog, 'press', lerp(dx0, -0.9, jump), lerp(dy0, 0.25, jump) + 0.4 * Math.sin(jump * PI), lerp(dz0, -2.3, jump), jump > 0 ? -PI / 2 : 0);
    prezDog.update(t, jump > 0 && jump < 1 ? 1.5 : 0); prezDog.bark(Math.max(talkK(t, 42.55, 0.8, 16), talkK(t, 43.55, 0.6, 16), talkK(t, 44.4, 0.7, 16)));
    say(S.prezDog, prezDog.head, pop(t, 42.55) * (1 - K(t, [[LUNGE - 0.2, 0], [LUNGE, 1]])), 0.62, 0.12, rows);
    // the President: stunned at the side, then dives
    const p = basePose(); p.eyes = blink(t, 2);
    const dive = K(t, [[LUNGE, 0], [TOPPLE_L + 0.4, 1]], fall);
    Object.assign(p, { x: lerp(0.78, 0.62, dive), z: lerp(-3.0, -2.55, dive), rotY: lerpAngle(-0.35, -0.75, dive), y: 0.25, floor: 0.25 });
    p.armA = A(-0.4, 0.2, -0.8, 0.3); p.armB = A(-0.85, 0.3, -1.1, -0.4); p.mouth = t > 42.7 ? 'o' : 'smile'; p.headYaw = -0.5;
    if (t > 43.6 && t < LUNGE) { p.armB = mixArm(p.armB, FACE_B, K(t, [[43.6, 0], [43.9, 1]])); p.mouth = 'flat'; }
    if (dive > 0) { p.armA = mixArm(p.armA, REACH_A, dive); p.armB = mixArm(p.armB, REACH_B, dive); p.mouth = 'o'; p.headYaw = 0; }
    put(prez, 'press', p, 1.0 * dive, -0.35 * dive);
    burst(40, 'press', PD.lectern[0], 0.25, PD.lectern[1] + 1.3, t, TOPPLE_L + 0.45, 6, 0.5);
    // reporters in the first rows with cameras up
    for (let i = 0; i < 6; i++) {
      const xs = [-1.0, 1.0, -1.8, 1.8, -2.6, 2.6][i], z = PD.rows[0] + (i > 3 ? 0.9 : 0), q = basePose(); q.eyes = blink(t, i + 1);
      Object.assign(q, { x: xs, z: z + 0.05, rotY: faceToward(xs, z, 0, PD.lectern[1]), y: seatY(0.47), footFwd: 0.42 });
      q.armA = CAM_A; q.armB = CAM_B; q.headPitch = -0.12; if (t > TOPPLE_L) { q.lean = -0.15; }
      put(crowd[i], 'press', q);
    }
  }

  // ---------------------------------------------------------------- 9. summit (war room, +1 month)
  const SIGN = 50.3, RAIN = 50.9;
  function summitBeat(t) {
    const T = 0.8;
    putPet(boss, 'war', 0.0, T, -0.78, 0); boss.update(t, 1.2); boss.squint(0.45); boss.paw(K(t, [[49.5, 0], [49.7, 0.6], [50.0, 0.6], [50.2, 0]]));
    const rows = rowsAt(t, [47.9, 48.75, 49.55]);
    boss.talk(Math.max(talkK(t, 47.9, 0.9, 12), talkK(t, 48.75, 0.6, 12), talkK(t, 49.55, 0.7, 12)));
    boss.head.rotation.set(0, 0.3 * Math.sin(t * 0.9), 0);
    say(S.boss, boss.head, pop(t, 47.9) * (1 - K(t, [[SIGN - 0.15, 0], [SIGN + 0.05, 1]])), 0.6, 0.12, rows);
    const cheer = K(t, [[RAIN, 0], [RAIN + 0.2, 1]]);
    putPet(summitDog, 'war', -0.5, T, -0.62, 0.35); summitDog.update(t, 0); summitDog.setWag(cheer > 0 ? 22 : 9); summitDog.bark(cheer * talkK(t, RAIN, 1.4, 12));
    putPet(envoy, 'war', 0.5, T + 0.32, -0.62, -0.35); envoy.update(t, cheer * K(t, [[RAIN + 1.6, 1], [RAIN + 1.8, 0]])); envoy.talk(cheer * talkK(t, RAIN, 1.2, 18));
    perchW.g.position.set(0.5, T, -0.62);
    putPet(delegate, 'war', 0.28, T, -0.35, -0.2); delegate.update(t, 0); delegate.stand(cheer); delegate.g.position.y += 0.05 * Math.abs(Math.sin(t * 9)) * cheer;
    putPet(bowlW, 'war', -0.3, T, -0.3, 0); bowlW.update(t, 0);
    // world leaders on the near side; one signs
    const L = [[-0.62, 1.42], [0.62, 1.42], [-1.35, 0.72], [1.35, 0.72]];
    suits.forEach((rig, i) => {
      const [x, z] = L[i], p = basePose(); p.eyes = blink(t, i + 5);
      Object.assign(p, { x, z, rotY: faceToward(x, z, 0, -0.6) });
      p.armA = LEAN_A; p.armB = LEAN_B; p.lean = 0.15; p.mouth = 'flat'; p.headPitch = 0.1;
      if (i === 1) { const s = K(t, [[SIGN - 0.3, 0], [SIGN, 1], [RAIN - 0.1, 1], [RAIN + 0.1, 0]]); p.armB = mixArm(LEAN_B, WRITE_B, s); p.armB.sz += 0.05 * Math.sin(t * 30) * s; p.lean = 0.15 + 0.35 * s; p.headPitch = 0.1 + 0.35 * s; }
      const nod = K(t, [[49.0 + i * 0.1, 0], [49.2 + i * 0.1, 1]]); p.headPitch += 0.15 * nod * Math.max(0, Math.sin(t * 7));
      if (cheer > 0) { p.armA = mixArm(p.armA, CHEER_A, cheer); p.armB = mixArm(p.armB, CHEER_B, cheer); p.mouth = 'o'; p.headPitch = -0.35 * cheer; p.lean = -0.05; }
      put(rig, 'war', p);
    });
    // treats + confetti rain; the globe lights up (one dot per pet household, roughly)
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3(), age = t - RAIN;
    treatSeeds.forEach((q4, i) => {
      const a = age - q4[3] * 0.6, y = a < 0 ? 9 : 3.0 - 2.2 * (a * (1.4 + q4[2])) ** 1.6;
      v3.set(-1.6 + q4[0] * 3.2 + 0.1 * Math.sin(t * 3 + i), Math.max(T + 0.012 + (i % 5) * 0.012, y), -1.3 + q4[1] * 2.6);
      if (Math.hypot(v3.x, v3.z) > 1.2 && v3.y < T + 0.1) v3.y = 0.012 + (i % 5) * 0.01;   // off the table → floor
      q.setFromEuler(e3.set(t * (2 + q4[2] * 3) + i, t * 2 + i * 0.7, i)); m4.compose(v3, q, s3); treats.setMatrixAt(i, m4);
    });
    treats.instanceMatrix.needsUpdate = true; if (treats.instanceColor) treats.instanceColor.needsUpdate = true; treats.visible = age > 0;
    war.globe.g.rotation.y = t * 0.35;
    dots.setAll((i) => (age > 0 ? clamp((age - (i % 37) * 0.025) / 0.3) : 0)); dots.commit();
    treaty.visible = true;
  }

  // ---------------------------------------------------------------- 10. park (suburb pocket park, +6 months)
  const THROW = 55.0, BALL_LAND = 55.85, PILE = 56.75;
  const DOGP = [59.95, -8.4], LANDP = [60.05, -5.0];
  const ball = mk(new THREE.SphereGeometry(0.065, 14, 10), mat(0xc8e04a, 0.6), sub.root, 0, 0, 0);
  // a DOG PARK sign, a water bowl, a hydrant
  const parkSign = new THREE.Group(); parkSign.position.set(57.4, 0, -12.6); parkSign.rotation.y = 0.3; sub.root.add(parkSign);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, 1.5, 0.08), mat(0x6a4a30, 0.7), parkSign, s * 0.55, 0.75, 0);
  mk(new THREE.PlaneGeometry(1.3, 0.5), new THREE.MeshStandardMaterial({ map: canvasTex(512, 196, (g, w, h) => { g.fillStyle = '#2f6f4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f6efe0'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#f6efe0'; g.font = 'bold 100px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DOG PARK', w / 2, h / 2 + 4); }), roughness: 0.7, side: THREE.DoubleSide }), parkSign, 0, 1.3, 0.05);
  const hydrant = new THREE.Group(); hydrant.position.set(62.2, 0, -8.0); sub.root.add(hydrant); mk(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), mat(0xd2483f, 0.5), hydrant, 0, 0.3, 0); mk(new THREE.SphereGeometry(0.12, 12, 8), mat(0xd2483f, 0.5), hydrant, 0, 0.62, 0); mk(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 8), mat(0xd2483f, 0.5), hydrant, 0, 0.4, 0).rotation.z = PI / 2;
  const PARKERS = [[58.35, -8.7], [58.7, -7.9], [59.2, -7.45], [60.75, -7.5], [61.2, -7.9], [61.55, -8.65]];
  function parkBeat(t) {
    sub.aimSun(60, -8, 9);
    // the dog: talks, then flicks the ball over everyone's heads
    putPet(max, 'sub', DOGP[0], 0, DOGP[1], 0); max.g.scale.setScalar(1.5); max.setWag(t > PILE ? 22 : 12);
    const flick = K(t, [[THROW - 0.25, 0], [THROW - 0.05, -0.6], [THROW + 0.1, 0.5], [THROW + 0.35, 0]]);
    max.update(t, 0); max.bark(talkK(t, 53.55, 0.9, 15)); max.head.rotation.x = flick;
    say(S.fetch, max.head, pop(t, 53.55) * (1 - K(t, [[THROW - 0.4, 0], [THROW - 0.2, 1]])), 0.46, 0.14);
    ball.visible = true;
    if (t < THROW) { max.head.updateWorldMatrix(true, false); max.head.getWorldPosition(_v); sub.root.worldToLocal(_v); ball.position.set(_v.x, _v.y - 0.06, _v.z + 0.12); }
    else { const u = clamp((t - THROW) / (BALL_LAND - THROW)), after = Math.max(0, t - BALL_LAND); ball.position.set(lerp(DOGP[0], LANDP[0], u), u < 1 ? 0.45 + 3.2 * u * (1 - u) + (0.06 - 0.45) * u : 0.065 + 0.25 * Math.abs(Math.sin(after * 7)) * Math.exp(-after * 3), lerp(DOGP[1] + 0.15, LANDP[1], u) + Math.min(after, 0.6) * 0.6); }
    // the humans sprint for it (toward the camera) and pile up
    PARKERS.forEach(([x0, z0], i) => {
      const rig = i === 2 ? gary : crowd[i], p = basePose(); p.eyes = blink(t, i);
      const go = K(t, [[THROW + 0.1 + i * 0.03, 0], [PILE + i * 0.06, 1]], (u) => u);
      const tx = LANDP[0] + (i - 2.5) * 0.18, tz = LANDP[1] - 0.25 - (i % 2) * 0.2;
      const x = lerp(x0, tx, go), z = lerp(z0, tz, go);
      Object.assign(p, { x, z, rotY: go > 0 ? faceToward(x0, z0, tx, tz) : faceToward(x0, z0, DOGP[0], DOGP[1]) });
      walkP(p, go * Math.hypot(tx - x0, tz - z0), go > 0 && go < 1 ? 3.0 : 0);
      p.armA = go > 0 ? RUN_A : REST; p.armB = go > 0 ? RUN_B : REST; p.lean = go > 0 ? 0.25 : 0.03; p.mouth = go > 0 ? 'o' : 'smile';
      const dive = K(t, [[PILE - 0.1 + i * 0.06, 0], [PILE + 0.25 + i * 0.06, 1]], fall);
      if (dive > 0) { p.speed = 0; p.armA = mixArm(RUN_A, A(-2.7, 0.3, -0.2, 0.2), dive); p.armB = mixArm(RUN_B, A(-2.7, 0.3, -0.2, -0.2), dive); p.y = (i % 3) * 0.18 * dive; p.floor = p.y; }
      if (t < THROW) { p.headPitch = -0.05; p.armA = REST; p.armB = i % 2 ? A(-0.6, 0.1, -1.2, -0.4) : REST; }
      put(rig, 'sub', p, 1.35 * dive, (i % 2 ? 0.2 : -0.2) * dive);
    });
    burst(44, 'sub', LANDP[0], 0, LANDP[1] - 0.3, t, PILE + 0.3, 4, 0.6, dirtCol);
  }

  // ---------------------------------------------------------------- 11. fav (living room, night, +1 year)
  const SPEAK = 63.9, HUG = 64.55;
  function favBeat(t) {
    liv.setMode('night');
    scene.add(gary.root);
    const [bx, bz] = LV.dogBed;
    putPet(biscuit, 'liv', bx, 0.03, bz, 1.15); biscuit.setLie(1); biscuit.update(t, 0);
    const up = K(t, [[SPEAK - 0.5, 0], [SPEAK - 0.1, 1]]);
    biscuit.setWag(t > HUG ? 16 : 4);
    const yawn = K(t, [[61.5, 0], [61.9, 1], [62.4, 1], [62.8, 0]]), shift = K(t, [[59.9, 0], [60.3, 1], [60.9, 1], [61.3, 0]]);
    biscuit.head.rotation.set(lerp(0.42, -0.05, up) - 0.25 * yawn, lerp(0, 0.55, up) + 0.25 * shift, 0.1 * shift); biscuit.g.children[0].scale.set(1, 1 + 0.03 * Math.sin(t * 2.0), 1);
    biscuit.bark(Math.max(0.5 * talkK(t, SPEAK, 0.8, 7), 0.9 * yawn));
    say(S.fav, biscuit.head, pop(t, SPEAK), 0.5, 0.3);
    // Gary on the floor beside the bed, scratching Biscuit's ears; then a hug
    const p = basePose(); p.eyes = blink(t, 2);
    const gx = bx + 0.52, gz = bz - 0.4; Object.assign(p, { x: gx, z: gz, rotY: faceToward(gx, gz, bx, bz) + 0.35, y: -0.69, footFwd: 0.7 });
    const scr = Math.sin(t * 2.4);
    p.armB = A(-0.3, 0.1, -0.4, -0.2); p.armA = mixArm(PET_A, A(-0.85, 0.3, -0.45, 0.2), 0.5 + 0.5 * scr);
    p.headPitch = 0.3; p.headYaw = -0.2 + 0.75 * K(t, [[59.3, 0], [59.8, 1], [60.9, 1], [61.4, 0]]); p.mouth = 'smile'; p.lean = 0.12 + 0.03 * Math.sin(t * 1.6);
    if (t > 61.5 && t < 62.9) { p.mouth = 'o'; p.headPitch = 0.35; }   // he yawns back
    const look = K(t, [[SPEAK + 0.1, 0], [SPEAK + 0.4, 1]]), hug = K(t, [[HUG, 0], [HUG + 0.5, 1]]);
    if (look > 0) { p.headPitch = lerp(0.3, 0.1, look); p.mouth = 'o'; p.armA = mixArm(p.armA, PET_A, look); }
    if (t > SPEAK + 0.5) { p.mouth = 'smile'; p.tear = true; }
    if (hug > 0) { p.armA = mixArm(p.armA, HUG_A, hug); p.armB = mixArm(p.armB, HUG_B, hug); p.lean = lerp(0.12, 0.55, hug); p.rotY = lerpAngle(p.rotY, faceToward(gx, gz, bx, bz), hug); p.eyes = t > HUG + 0.6 ? 'closed' : p.eyes; p.headPitch = 0.2; }
    put(gary, 'liv', p);
    // the rest of the house, asleep: the cat on the sofa, the parrot on the perch, the fish
    // the cat grooms on the armchair, then turns to look when Biscuit speaks; the parrot stretches its wings; snow outside
    const groom = t < 62.6 ? Math.max(0, Math.sin(t * 2.6)) : 0, catLook = K(t, [[SPEAK + 0.2, 0], [SPEAK + 0.6, 1]]);
    putPet(mochi, 'liv', LV.armchair[0] + 0.1, 0.47, LV.armchair[1] + 0.05, 0.5); mochi.update(t, 1.0); mochi.squint(0.6 - 0.4 * catLook); mochi.talk(0); mochi.paw(0.55 * groom);
    mochi.head.rotation.set(0.45 * groom, lerp(0, -0.7, catLook), 0.15 * groom);
    putPet(kiwi, 'liv', LV.perch[0], 1.016, LV.perch[1], -0.4); kiwi.update(t, K(t, [[60.2, 0], [60.4, 1], [60.9, 1], [61.2, 0]]) * 0.7); kiwi.talk(0); kiwi.head.rotation.set(0.3, 0.6 * Math.sin(t * 0.8), 0.2);
    snow.visible = true; const m4 = new THREE.Matrix4();
    snowSeeds.forEach((q, i) => { const y = 2.6 - ((t * (0.25 + q[2] * 0.2) + q[3] * 3) % 2.0); m4.makeTranslation(-1.2 + q[0] * 3.4 + 0.08 * Math.sin(t * 0.9 + i), y, -3.2 - q[1] * 1.6); snow.setMatrixAt(i, m4); }); snow.instanceMatrix.needsUpdate = true;
    putPet(bowlL, 'liv', LV.side[0], LV.sideTop, LV.side[1], 0.3); bowlL.update(t * 0.6, 0); bowlL.talk(0);
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), Sx = shot.set, cam = shot.cam;
    if (Sx !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === Sx; cur = Sx; }
    scene.fog = FOGS[Sx] || null; studio.camera.far = FAR[Sx]; studio.fill.intensity = 0.45;

    // camera first (bubbles size themselves from it)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[Sx];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (c.y) P[1] = K(t, c.y) + o[1];
    if (c.ay) Aim[1] = K(t, c.ay) + o[1];
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(TIP + 0.45); jolt(LAND, 0.025); jolt(SMASH, 0.015); jolt(CRASH, 0.02); jolt(TOPPLE + 0.4, 0.02); jolt(ROLL1, 0.02); jolt(BOLT + 0.3, 0.015); jolt(TOPPLE_L + 0.45, 0.025); jolt(RAIN, 0.015); jolt(PILE + 0.3, 0.025);
    setCamera(P, Aim, c.fov, t, c.amp); studio.camera.updateMatrixWorld();

    // reset
    all.forEach((r) => { r.root.visible = false; r.root.rotation.x = 0; });
    if (gary.root.parent !== scene) scene.add(gary.root);
    pets.forEach((p) => (p.g.visible = false)); wheels.forEach((w) => (w.g.visible = false)); bubbles.forEach((b) => (b.sprite.visible = false));
    puffs.hide(); glows.forEach((g) => (g.visible = false)); zs.forEach((z) => (z.visible = false)); leashes.forEach((l) => (l.visible = false));
    mugG.visible = false; ball.visible = false; treats.visible = false; treaty.visible = false; snow.visible = false;
    liv.armchair.rotation.x = 0;

    if (cam === 'open') openBeat(t);
    else if (cam === 'lawn') lawnBeat(t);
    else if (cam === 'counter') counterBeat(t);
    else if (cam === 'dinner') dinnerBeat(t);
    else if (cam === 'fish') fishBeat(t);
    else if (cam === 'wheels') wheelsBeat(t);
    else if (cam === 'vet') vetBeat(t);
    else if (cam === 'press') pressBeat(t);
    else if (cam === 'summit') summitBeat(t);
    else if (cam === 'park') parkBeat(t);
    else if (cam === 'fav') favBeat(t);
  }
  return { update };
}
