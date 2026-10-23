// VIDEO 012 — "What if everyone on Earth suddenly peed their pants?"  (tone: FUNNY, wacky ripple ladder; cartoon + kind: a dark
// patch on the pants and the reaction — never liquid). 69 s, 11 beats, TEN sets (5 new: podium, wedding, pool, office, laundromat).
// Real hook for the comments: ~400 mL average bladder × 8.2 B ≈ 3.3 billion liters ≈ 1,312 Olympic pools (2.5 M L each).
// Gary (002/007/010) is the interview candidate, the dog-blamer and the holiday finale.
//
// Shot list (seconds)                        | set       | what happens
//  0.0– 8.0  class    10:14 AM (quiet open)   | classroom | chalk + murmur; at 5.0 EVERY head snaps down, kids jump up, the teacher freezes
//  8.0–13.6  press    +5 s                    | podium    | the President steps out from the lectern; a storm of camera flashes; tie adjust; keeps going
// 13.6–19.0  wedding  +10 s                   | wedding   | couple + officiant + guests all look down… they shrug, hold hands, kiss
// 19.0–24.6  pool     +30 s                   | pool      | swimmers look at each other, shrug, keep swimming; the lifeguard squints
// 24.6–30.4  interview +1 min                 | office    | Gary + the HR manager look down, lock eyes, nod, stand, shake hands
// 30.4–35.8  dog      +2 min                  | kitchen   | Gary points at the dog; the dog turns its head away, offended
// 35.8–41.4  laundro  +1 hour                 | laundromat| every drum spins; people in towel skirts wait, arms crossed, tapping
// 41.4–46.8  grid     +1 hour                 | city      | night skyline; every dryer switches on; the grid blacks out block by block
// 46.8–52.2  market   +1 day                  | market    | TOWELS SOLD OUT; shoppers hug stacks of towels
// 52.2–58.2  together +1 year                 | street    | strangers laughing together, arms around shoulders, a high-five
// 58.2–69.0  party    +1 year                 | street    | "HAPPY WET PANTS DAY" banner, confetti; Gary still points at the dog. End card 64.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, addWetPatch, HIP_H } from '@engine/rig.js';
import { makeDog } from '@engine/props.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, ROOF_Y } from '@engine/sets/city.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildPool, DIMS as PO } from '@engine/sets/pool.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildLaundromat, DIMS as LD } from '@engine/sets/laundromat.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';

const PI = Math.PI;
const MOMENT = 5.0;
const KS = 0.62;
const OFF = { city: [0, 0, 0], street: [1500, 0, 0], cls: [-1500, 0, 0], press: [3000, 0, 0], wed: [-3000, 0, 0], pool: [4500, 0, 0],
  office: [-4500, 0, 0], kit: [6000, 0, 0], laund: [-6000, 0, 0], mkt: [7500, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 8.0, cam: 'class', set: 'cls' },
  { t0: 8.0, t1: 13.6, cam: 'press', set: 'press' },
  { t0: 13.6, t1: 19.0, cam: 'wedding', set: 'wed' },
  { t0: 19.0, t1: 24.6, cam: 'pool', set: 'pool' },
  { t0: 24.6, t1: 30.4, cam: 'interview', set: 'office' },
  { t0: 30.4, t1: 35.8, cam: 'dog', set: 'kit' },
  { t0: 35.8, t1: 41.4, cam: 'laundro', set: 'laund' },
  { t0: 41.4, t1: 46.8, cam: 'grid', set: 'city' },
  { t0: 46.8, t1: 52.2, cam: 'market', set: 'mkt' },
  { t0: 52.2, t1: 58.2, cam: 'together', set: 'street' },
  { t0: 58.2, t1: 69.0, cam: 'party', set: 'street' },
];
// camera coords are LOCAL to the shot's set
export const CAMS = {
  class:     { p: [[0.15, 1.05, -2.75], [0.1, 1.02, -2.5]], a: [[0.0, 0.62, 1.2], [0.0, 0.6, 1.2]], fov: 58, amp: 0.004 },   // down the center aisle
  press:     { p: [[0.9, 1.7, 3.2], [0.8, 1.65, 2.6]], a: [[0.45, 1.25, -3.0], [0.45, 1.25, -3.0]], fov: 34, amp: 0.004 },
  wedding:   { p: [[0.35, 1.65, 1.8], [0.3, 1.6, 1.0]], a: [[0.0, 1.25, -3.6], [0.0, 1.25, -3.6]], fov: 50, amp: 0.004 },
  pool:      { p: [[-2.6, 1.25, 7.6], [-2.4, 1.2, 7.1]], a: [[-1.2, 0.0, 2.0], [-1.2, -0.02, 1.8]], fov: 48, amp: 0.004 },
  interview: { p: [[2.6, 1.35, -0.75], [2.35, 1.3, -0.8]], a: [[-0.4, 1.05, -0.85], [-0.4, 1.05, -0.85]], fov: 54, amp: 0.004 },
  dog:       { p: [[1.35, 1.45, 2.55], [1.2, 1.4, 2.35]], a: [[-0.1, 1.05, -0.3], [-0.1, 1.0, -0.3]], fov: 58, amp: 0.004 },
  laundro:   { p: [[3.4, 1.55, 2.6], [3.1, 1.5, 2.3]], a: [[-0.6, 1.0, -1.2], [-0.6, 1.0, -1.3]], fov: 56, amp: 0.004 },
  grid:      { p: [[-9.25, ROOF_Y + 1.3, 12.6], [-9.3, ROOF_Y + 1.25, 12.2]], a: [[-9.8, ROOF_Y + 4.0, -10], [-9.8, ROOF_Y + 4.5, -10]], fov: 62, amp: 0.003 },
  market:    { p: [[0.3, 2.5, 4.6], [0.25, 2.45, 3.9]], a: [[0.0, 1.3, -8.0], [0.0, 1.3, -8.0]], fov: 54, amp: 0.004 },
  together:  { p: [[-22.2, 1.55, 4.8], [-19.9, 1.5, 4.4]], a: [[-21.8, 1.35, -1.6], [-20.1, 1.3, -1.6]], fov: 48, amp: 0.005 },   // slides along the laughing line
  party:     { p: [[-5.8, 1.7, 5.6], [-5.8, 1.65, 4.8]], a: [[-5.8, 1.85, -1.5], [-5.8, 1.8, -1.5]], fov: 52, amp: 0.005 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CAM_A = A(-1.15, 0.12, -2.05, 0.65), CAM_B = A(-1.15, 0.12, -2.05, -0.65);       // holding a camera to the face
const TALK_B = A(-0.85, 0.35, -1.15, -0.35);                                           // speech gesture
const TIE_B = A(-1.05, 0.05, -2.25, -0.7);                                             // straightening the tie
const SHRUG_A = A(-0.25, 0.65, -1.35, -0.4), SHRUG_B = A(-0.25, 0.65, -1.35, 0.4);
const HAND_B = A(-0.95, 0.12, -0.55, -0.2);                                            // handshake / holding hands
const POINT_B = A(-1.35, 0.12, -0.08, 0);
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);   // arms crossed
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const HUGSIDE_A = A(-0.15, 1.25, -0.35, 0), HUGSIDE_B = A(-0.15, 1.25, -0.35, 0);     // arms around the neighbors' shoulders
const BELLY_A = A(-0.32, -0.02, -1.25, 0.55), BELLY_B = A(-0.32, -0.02, -1.25, -0.55); // holding a laughing belly
const BOARD_B = A(-2.3, 0.25, -0.35, -0.2);
const TREAD_A = A(-0.4, 1.15, -0.4, 0), TREAD_B = A(-0.4, 1.15, -0.4, 0);             // treading water
const CARRY_A = A(-0.62, -0.05, -1.55, 0.7), CARRY_B = A(-0.62, -0.05, -1.55, -0.7);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

// light pants on purpose (the patch must read); the patch itself is a darker, glossier version of the pants color
const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0xc9b48e, 0x9fb6d6, 0xb8b8b2, 0xd8c8a8, 0x8fa6c9, 0xc2a98a, 0xa9b9a0];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 0, golden: 0, power: 1, milky: 0, moon: 1 }); city.setGrowth(0); city.setSnow(0); city.setSignal('green');
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls); cls.setClock(10, 14); cls.setSeason('spring', 0); cls.setDoor(0);
  cls.setBoard('12 × 7 = 84\n144 ÷ 12 = 12\n7² = 49');
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(10, 16);
  const laund = buildLaundromat(studio, {}); laund.root.position.set(...OFF.laund);
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const ROOTS = { street: street.root, city: city.root, cls: cls.root, press: press.root, wed: wed.root, pool: pool.root, office: office.root, kit: kit.root, laund: laund.root, mkt: mkt.root };
  const FOGS = { street: streetFog, city: cityFog, cls: null, press: null, wed: wed.fog, pool: pool.fog, office: null, kit: null, laund: null, mkt: null };
  const FAR = { street: 400, city: 1500, cls: 60, press: 60, wed: 300, pool: 400, office: 60, kit: 40, laund: 40, mkt: 80 };

  // ---------------------------------------------------------------- cast (everyone gets a wet patch)
  const R = rng(12);
  const wet = new Map();
  const person = (o) => { const p = makePerson(o); scene.add(p.root); wet.set(p, addWetPatch(p, { color: o.pants })); return p; };
  const randPerson = () => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = person({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.3 ? HAIRS[Math.floor(R() * 3)] : null });
    p.seed = R(); p.seed2 = R(); return p;
  };
  const crowd = Array.from({ length: 24 }, randPerson);
  const kids = Array.from({ length: 9 }, () => { const k = person({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)], hair: HAIRS[Math.floor(R() * 4)], hairStyle: STYLES[Math.floor(R() * 7)], headR: 0.175 }); k.root.scale.setScalar(KS); k.seed = R(); return k; });
  const teacher = person({ skin: 0xe2ad8c, top: 0x7a9e7e, collar: 0xf3e9dc, pants: 0xc9b48e, hair: 0x8a5a3a, hairStyle: 'bob', glasses: true });
  const prez = person({ skin: 0xf0c8a8, top: 0x8a8f96, collar: 0xf4f4f2, pants: 0x9a9fa6, hair: 0xc9c4be, hairStyle: 'short' });
  const tie = mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(0xc0392b, 0.5), prez.spine, 0, 0.42, 0.135); tie.rotation.x = -0.12;
  const pin = mk(new THREE.SphereGeometry(0.012, 8, 6), mat(0xd8b44a, 0.3, { metalness: 0.6 }), prez.spine, -0.09, 0.47, 0.13);
  const groom = person({ skin: 0xc98e6a, top: 0xb8bcc2, collar: 0xf4f4f2, pants: 0xb8bcc2, hair: 0x1a1a1a, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.06, 0.05, 0.02), mat(0x2f4f73, 0.5), groom.spine, 0, 0.5, 0.14);  // bow tie
  const bride = makePerson({ skin: 0xf1c3a1, top: 0xfbf8f2, pants: 0xfbf8f2, hair: 0x5a3a24, hairStyle: 'bob', dress: 0xfbf8f2 }); scene.add(bride.root);
  const veil = mk(new THREE.ConeGeometry(0.2, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), bride.head.g, 0, 0.0, -0.08); veil.rotation.x = 0.25;
  const bouquet = new THREE.Group(); bride.arms.find((a) => a.s === 1).hand.add(bouquet); bouquet.position.set(0, -0.06, 0.05);
  [0xe58fa6, 0xffffff, 0xf2b632, 0xd2483f, 0xf4c6d6].forEach((c, i) => mk(new THREE.SphereGeometry(0.04, 8, 6), mat(c, 0.7), bouquet, Math.cos(i * 1.25) * 0.04, 0.03, Math.sin(i * 1.25) * 0.04));
  const brideSpot = bride.dress ? mk(new THREE.SphereGeometry(0.16, 16, 12), mat(0xcfc6b4, 0.3), bride.dress, 0, 0.12, 0.17) : null;   // patch on the dress front
  if (brideSpot) { brideSpot.scale.set(1, 1.2, 0.35); }
  const officiant = person({ skin: 0x9a6447, top: 0x2a2a2a, collar: 0xf4f4f2, pants: 0x8a8f96, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const hr = person({ skin: 0xd9a37f, top: 0x2f4f73, collar: 0xf4f4f2, pants: 0xb8b8b2, hair: 0x2a1d16, hairStyle: 'bob', glasses: true });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const lifeguard = person({ skin: 0xc98e6a, top: 0xd2483f, pants: 0xd2483f, hair: 0x1a1a1a, hairStyle: 'short' });
  const dog = makeDog(); scene.add(dog.g);
  const ALL = [...crowd, ...kids, teacher, prez, groom, bride, officiant, hr, gary, lifeguard];

  // towel skirts (laundromat) + towel stacks (market)
  const towelTex = (c1, c2) => canvasTex(128, 64, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; for (let y = 6; y < h; y += 20) g.fillRect(0, y, w, 6); });
  const TOWEL = [['#f4c6d6', '#ffffff'], ['#9fd0ef', '#ffffff'], ['#f2d88a', '#ffffff'], ['#b5dba0', '#ffffff'], ['#ffffff', '#cfe0f2']];
  const skirts = crowd.map((p, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.25, 0.55, 18, 1, true), new THREE.MeshStandardMaterial({ map: towelTex(...TOWEL[i % 5]), roughness: 0.95, side: THREE.DoubleSide })); m.position.y = -0.2; p.pelvis.add(m); m.visible = false; return m; });
  const stacks = crowd.map((p, i) => { const g = new THREE.Group(); for (let k = 0; k < 5; k++) mk(new THREE.BoxGeometry(0.34, 0.07, 0.26), mat(new THREE.Color(TOWEL[(i + k) % 5][0]).getHex(), 0.95), g, 0, k * 0.075, 0); p.spine.add(g); g.position.set(0, 0.18, 0.28); g.visible = false; return g; });

  // party dressing on the street: a banner across the road + bunting + confetti
  const bannerT = canvasTex(1024, 230, (g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f6aa8'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#d23a3f'; g.font = 'bold 70px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HAPPY', w / 2, 62); g.fillStyle = '#2f6aa8'; g.font = 'bold 104px Helvetica, Arial, sans-serif'; g.fillText('WET PANTS DAY', w / 2, 168); });
  const party = new THREE.Group(); street.root.add(party);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.72), new THREE.MeshStandardMaterial({ map: bannerT, roughness: 0.7, side: THREE.DoubleSide })); banner.position.set(-5.8, 3.6, -0.5); party.add(banner);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8), mat(0x3d4a45, 0.5), party, -5.8 + s * 1.65, 2.1 + SH, -0.5);
  const flagCols = [0xd2483f, 0xf2b632, 0x3d7bd9, 0x58b368, 0xe58fa6];
  for (let i = 0; i < 26; i++) { const u = i / 25, x = -12 + u * 13, y = 3.0 - 0.5 * Math.sin(PI * u * 2 % PI); const f = mk(new THREE.ConeGeometry(0.12, 0.25, 3), mat(flagCols[i % 5], 0.7, { side: THREE.DoubleSide }), party, x, y, -1.8); f.rotation.x = PI; }
  const CONF = 360, confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), CONF);
  confetti.frustumCulled = false; party.add(confetti);
  const CR = rng(77), confSeeds = Array.from({ length: CONF }, () => [CR(), CR(), CR(), CR(), CR()]);
  confSeeds.forEach((s, i) => confetti.setColorAt(i, new THREE.Color([0xe2574c, 0xf2b632, 0x4f9bd9, 0x58b368, 0xa77bd1, 0xffffff][i % 6])));

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p, scale = 1) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    if (scale !== 1) rig.root.position.y = (p.y || 0) * scale;
    rig.root.visible = p.visible !== false;
  }
  const setW = (rig, k) => wet.get(rig)?.(k);
  const seatY = (seatTop) => -0.375 + (seatTop - 0.42);   // proper seat (CLAUDE.md): y −0.375 for a 0.42 m seat top

  // ---------------------------------------------------------------- performances
  function kidPose(t, i) { // seated kids → at the moment they jump up, look down at their pants, then at each other
    const d = CD.desks[[2, 9, 14, 21, 3, 8, 1, 4, 20][i]];   // kids 0–3: one per row from the middle columns → into the aisle; the rest stand by their desks
    const p = basePose(); p.eyes = blink(t, i + 3);
    const up = K(t, [[MOMENT + 0.05 + i * 0.03, 0], [MOMENT + 0.4 + i * 0.03, 1]]);
    const ax = d.x < 0 ? -0.04 : 0.04, ex = lerp(d.x, ax + (d.x < 0 ? -0.18 : 0.18) * (i % 2), up);   // they jump up INTO the center aisle (camera sees them head to toe)
    Object.assign(p, { x: i < 4 ? lerp(d.x, (d.x < 0 ? -0.08 : 0.08), up) : lerp(d.x, d.x + (d.x < 0 ? -0.42 : 0.42), up), z: d.z + CD.chair.dz - 0.05 * up, rotY: PI + 0.5 * up * (i % 2 ? 1 : -1), y: -0.22 * (1 - up), footFwd: 0.4 * (1 - up), lean: 0.06 });
    p.headPitch = K(t, [[MOMENT, -0.1], [MOMENT + 0.2, 0.75], [MOMENT + 1.4, 0.75], [MOMENT + 1.8, 0.0]]);
    p.headYaw = K(t, [[MOMENT + 1.6, 0], [MOMENT + 2.0, (i % 2 ? -0.6 : 0.6)]]);
    p.mouth = t > MOMENT + 0.1 ? 'o' : 'smile';
    p.armA = mixArm(A(-0.7, 0.05, -0.9, 0.3), SHRUG_A, up * K(t, [[MOMENT + 1.8, 0], [MOMENT + 2.2, 1]])); p.armB = mixArm(A(-0.7, 0.05, -0.9, -0.3), SHRUG_B, up * K(t, [[MOMENT + 1.8, 0], [MOMENT + 2.2, 1]]));
    return p;
  }
  function teacherPose(t) {
    const p = basePose(); p.eyes = blink(t, 1); p.mouth = 'flat';
    const turn = K(t, [[MOMENT + 0.3, 0], [MOMENT + 0.8, 1]]);
    Object.assign(p, { x: 1.05, z: -2.2, rotY: lerpAngle(PI, -0.35, turn) });
    p.armB = mixArm({ ...BOARD_B, sx: BOARD_B.sx + 0.06 * Math.sin(t * 12) * (1 - turn) }, REST, K(t, [[MOMENT, 0], [MOMENT + 0.25, 1]]));
    p.headPitch = K(t, [[MOMENT, -0.25], [MOMENT + 0.2, 0.7], [MOMENT + 1.5, 0.7], [MOMENT + 1.9, 0.0]]);
    p.mouth = t > MOMENT + 0.1 ? 'o' : 'flat';
    return p;
  }
  function prezPose(t) { // steps out from behind the lectern (oops), flashes, tie, steps back, keeps talking
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const out = K(t, [[8.3, 0], [9.0, 1], [10.6, 1], [11.2, 0]]);
    Object.assign(p, { x: PD.speaker[0] + 0.85 * out, z: PD.speaker[1] + 0.2 * out, y: 0.25, floor: 0.25, rotY: 0, dist: out * 0.9, speed: out > 0.02 && out < 0.98 ? 0.3 : 0 });
    p.headPitch = K(t, [[9.1, 0.0], [9.4, 0.65], [10.2, 0.65], [10.5, -0.05]]);
    const talk = t > 11.2 ? 1 : 0;
    p.armB = mixArm(TALK_B, TIE_B, K(t, [[10.3, 0], [10.6, 1], [11.0, 1], [11.3, 0]]));
    p.armB.sx += 0.18 * Math.sin(t * 5) * talk; p.armA = A(-0.35, 0.12, -0.6, 0.3);
    p.mouth = talk && Math.sin(t * 11) > 0 ? 'o' : 'flat';
    return p;
  }
  function reporterPose(t, i) {
    if (i >= 9) return null;
    const p = basePose(); p.eyes = blink(t, i + 1);
    const SIDE = [[-2.6, 0.6], [-1.8, 0.6], [-2.6, 1.5], [-1.8, 1.5], [2.6, 0.6], [1.8, 0.6], [2.6, 1.5], [1.8, 1.5], [-2.6, 2.4]];   // side seats only: nobody between the lens and the President
    const [x, z0] = SIDE[i], z = z0 + 0.05;
    Object.assign(p, { x, z, rotY: PI + (x > 0 ? 0.08 : -0.08) });
    p.armA = CAM_A; p.armB = CAM_B; p.headPitch = -0.05;
    return p;
  }
  function weddingPose(t, who) {
    const p = basePose(); p.eyes = blink(t, who.length); p.mouth = 'flat';
    const look = K(t, [[13.6, 0.7], [15.0, 0.7], [15.4, 0.0]]), shrug = K(t, [[15.6, 0], [15.9, 1], [16.4, 1], [16.7, 0]]), hand = K(t, [[16.8, 0], [17.2, 1]]), kiss = K(t, [[17.6, 0], [18.1, 1]]);
    if (who === 'bride' || who === 'groom') {
      const s = who === 'bride' ? 1 : -1, [x, z] = who === 'bride' ? WD.bride : WD.groom;
      Object.assign(p, { x: x - s * 0.12 * kiss, z, rotY: -s * PI / 2 + s * 0.35 });
      p.headPitch = look - 0.1 * kiss; p.headRoll = s * 0.15 * kiss;
      p.armA = mixArm(REST, SHRUG_A, shrug); p.armB = mixArm(mixArm(REST, SHRUG_B, shrug), HAND_B, hand);
      p.mouth = kiss > 0.5 ? 'flat' : shrug > 0.5 ? 'smile' : 'o'; p.eyes = kiss > 0.5 ? 'closed' : p.eyes;
      if (who === 'bride') p.armB = mixArm(p.armB, A(-0.8, 0.0, -1.2, -0.4), 1 - hand);   // bouquet hand
    } else { // officiant
      Object.assign(p, { x: WD.officiant[0], z: WD.officiant[1], rotY: 0 }); p.headPitch = look;
      p.armA = A(-0.8, 0.05, -1.3, 0.6); p.armB = A(-0.8, 0.05, -1.3, -0.6); p.mouth = t > 16.6 ? 'smile' : 'o';
    }
    return p;
  }
  function guestPose(t, i) {
    if (i >= 12) return null;
    const row = WD.rows[(i % 3) + 1], side = i % 2 ? 1 : -1, sx = WD.seats[Math.floor(i / 3) % 4];
    const p = basePose(); p.eyes = blink(t, i + 4);
    const up = K(t, [[13.6, 1], [14.0, 1]]);
    Object.assign(p, { x: side * sx, z: row - 0.05, rotY: PI, y: 0 });
    p.headPitch = K(t, [[13.6, 0.7], [15.0, 0.7], [15.4, 0.0]]); p.headYaw = K(t, [[15.4, 0], [15.8, side * 0.7]]);
    p.mouth = t > 17.6 ? 'smile' : 'o'; void up;
    if (t > 17.7) { p.armA = CHEER_A; p.armB = CHEER_B; }
    return p;
  }
  function swimmerPose(t, i) {
    if (i >= 7) return null;
    const spots = [[-2.2, 3.6], [-0.4, 3.0], [-1.6, 1.6], [0.3, 1.0], [-3.4, 2.2], [1.6, -0.6], [-0.9, -1.4]];   // close to the camera's edge of the pool
    const [x, z] = spots[i], p = basePose(); p.eyes = blink(t, i);
    const bob = 0.05 * Math.sin(t * 2.2 + i);
    Object.assign(p, { x: x + 0.3 * Math.sin(t * 0.4 + i), z, y: PO.floor + 0.02 + bob, floor: PO.floor, rotY: faceToward(x, z, 8, 7) + (i % 3 - 1) * 0.6 });
    const shrug = K(t, [[20.2 + i * 0.05, 0], [20.5 + i * 0.05, 1], [21.3, 1], [21.6, 0]]);
    p.armA = mixArm(TREAD_A, SHRUG_A, shrug); p.armB = mixArm(TREAD_B, SHRUG_B, shrug);
    p.armA.sx += 0.2 * Math.sin(t * 3 + i); p.armB.sx += 0.2 * Math.sin(t * 3 + i + 1.5);
    p.headYaw = K(t, [[19.2, 0], [19.6, (i % 2 ? 0.8 : -0.8)], [20.0, 0]]);
    p.mouth = shrug > 0.5 ? 'flat' : 'smile';
    return p;
  }
  function interviewPose(t, who) {
    const p = basePose(); p.eyes = blink(t, who === 'gary' ? 2 : 5); p.mouth = 'flat';
    const guest = who === 'gary', [x, z] = guest ? OD.guest : OD.boss;
    const look = K(t, [[24.6, 0.8], [25.8, 0.8], [26.2, 0.05]]), nod = Math.max(0, Math.sin((t - 26.6) * 7)) * K(t, [[26.6, 0], [26.8, 1], [27.8, 1], [28.0, 0]]);
    const stand = K(t, [[28.0, 0], [28.6, 1]]), shake = K(t, [[28.6, 0], [28.9, 1]]);
    Object.assign(p, { x, z: z + (guest ? -0.12 : 0.12) * stand, rotY: guest ? PI : 0, y: lerp(seatY(OD.seat), 0, stand), footFwd: 0.42 * (1 - stand), lean: 0.08 * (1 - stand) + 0.12 * shake });
    p.headPitch = look + 0.3 * nod; p.armA = mixArm(A(-0.5, 0.1, -0.9, 0.3), REST, stand); p.armB = mixArm(mixArm(A(-0.5, 0.1, -0.9, -0.3), REST, stand), HAND_B, shake);
    if (shake > 0.5) p.armB.sx += 0.12 * Math.sin(t * 14);
    p.mouth = t > 28.6 ? 'smile' : 'flat';
    return p;
  }
  function garyDogPose(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: -0.55, z: 0.2, rotY: 0.85 });
    const point = K(t, [[30.6, 0], [31.0, 1]]);
    p.armB = mixArm(REST, POINT_B, point); p.armA = A(-0.2, 0.25, -1.3, 0.4);
    p.headPitch = K(t, [[30.4, 0.5], [32.6, 0.5], [32.9, 0.1]]); p.headYaw = K(t, [[32.6, 0], [32.9, 0.6], [33.6, 0.6], [34.2, -0.4]]);   // looks at us, then watches the dog go
    p.mouth = 'flat';
    return p;
  }
  function launderPose(t, i) {
    if (i >= 8) return null;
    const spots = [[-3.0, -1.5, 0.2], [-2.2, -1.2, -0.1], [-1.1, -1.4, 0.3], [0.2, -1.2, -0.2], [1.3, -1.5, 0.1], [2.4, -1.25, -0.3], [-0.5, 0.0, 0.4], [3.2, 0.3, -0.6]];
    const [x, z, r] = spots[i], p = basePose(); p.eyes = blink(t, i + 2);
    Object.assign(p, { x, z, rotY: PI + r });
    p.armA = CROSS_A; p.armB = CROSS_B; p.headPitch = 0.05 * Math.sin(t * 0.7 + i);
    p.footFwd = 0.03 * Math.max(0, Math.sin(t * 9 + i));                      // impatient tapping
    p.headYaw = 0.3 * Math.sin(t * 0.5 + i * 2); p.mouth = 'flat';
    return p;
  }
  function shopperPose(t, i) {
    if (i >= 6) return null;
    const ax = [-4.0, 0.0, 4.0][i % 3] + (i < 3 ? -0.35 : 0.4);
    const v = (i < 3 ? 1 : -1) * (0.9 + i * 0.12), L = 8;
    const z = -9.5 + ((((v * (t - 46.8) + i * 3.1) % L) + L) % L);
    const p = basePose(); p.eyes = blink(t, i);
    Object.assign(p, { x: ax, z, rotY: v > 0 ? 0 : PI, dist: Math.abs(v * t), speed: Math.abs(v) });
    p.armA = CARRY_A; p.armB = CARRY_B; p.headPitch = -0.05; p.mouth = 'flat';
    return p;
  }
  function togetherPose(t, i) { // a laughing crowd, side-on, arms around shoulders; two high-five
    if (i >= 10) return null;
    const p = basePose(); p.eyes = 'closed';
    const x = -23.4 + i * 0.62, z = -1.5 + (i % 2) * 0.35;
    Object.assign(p, { x, z, y: SH, floor: SH, rotY: 0.1 * Math.sin(i) });
    const laugh = Math.sin(t * 9 + i * 1.3);
    p.headPitch = -0.35 + 0.08 * laugh; p.headRoll = 0.08 * Math.sin(t * 4 + i); p.lean = -0.08 + 0.04 * laugh;
    p.mouth = laugh > -0.3 ? 'o' : 'smile';
    p.armA = i % 3 === 0 ? BELLY_A : HUGSIDE_A; p.armB = i % 3 === 0 ? BELLY_B : HUGSIDE_B;
    if (i === 4 || i === 5) { const hf = K(t, [[55.4, 0], [55.7, 1], [56.0, 1], [56.3, 0]]); p.eyes = 'open'; p.rotY = i === 4 ? PI / 2 : -PI / 2; p.armB = mixArm(p.armB, A(-2.5, 0.25, -0.15, 0), hf); }
    return p;
  }
  function partyPose(t, i) {
    if (i >= 12) return null;
    const p = basePose(); p.eyes = blink(t, i);
    const x = -9 + (i % 6) * 1.25 + (i > 5 ? 0.6 : 0), z = i > 5 ? -2.3 : -1.6;
    const hop = Math.max(0, Math.sin((t - 58) * (6 + (i % 3)) + i)) * 0.12;
    Object.assign(p, { x, z, y: SH + hop, floor: SH, rotY: 0.15 * Math.sin(i * 1.7) });
    p.armA = CHEER_A; p.armB = CHEER_B; p.armA.sz += 0.15 * Math.sin(t * 7 + i); p.armB.sz += 0.15 * Math.sin(t * 7 + i + 1);
    p.mouth = 'o'; p.headPitch = -0.15;
    return p;
  }
  function garyPartyPose(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: -5.75, z: -0.35, y: SH, floor: SH, rotY: 0.2 });
    const point = K(t, [[61.2, 0], [61.6, 1]]);
    p.armA = mixArm(CHEER_A, POINT_B, point); p.armB = mixArm(CHEER_B, REST, point);   // the dog is on his left
    p.headPitch = lerp(-0.15, 0.4, point); p.headYaw = K(t, [[62.6, 0], [62.9, -0.55]]);
    p.mouth = point > 0.5 ? 'flat' : 'o';
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = S === 'city' ? 0.2 : 0.45;
    ALL.forEach((r) => (r.root.visible = false)); skirts.forEach((m) => (m.visible = false)); stacks.forEach((g) => (g.visible = false));
    dog.g.visible = false; party.visible = false; if (brideSpot) brideSpot.visible = false;
    const wetAll = S === 'street' ? 0 : 1;
    ALL.forEach((r) => setW(r, wetAll));

    if (S === 'cls') {
      const k = K(t, [[MOMENT + 0.05, 0], [MOMENT + 0.7, 1]]);
      kids.forEach((kd, i) => { setW(kd, k); put(kd, 'cls', kidPose(t, i), KS); });
      setW(teacher, k); put(teacher, 'cls', teacherPose(t));
    } else if (S === 'press') {
      press.setFlashes(t, t > 9.0 ? 3.5 : 0.4);
      put(prez, 'press', prezPose(t));
      crowd.forEach((c, i) => { const p = reporterPose(t, i); if (p) put(c, 'press', p); });
    } else if (S === 'wed') {
      put(bride, 'wed', weddingPose(t, 'bride')); put(groom, 'wed', weddingPose(t, 'groom')); put(officiant, 'wed', weddingPose(t, 'officiant'));
      if (brideSpot) brideSpot.visible = true;
      crowd.forEach((c, i) => { const p = guestPose(t, i); if (p) put(c, 'wed', p); });
    } else if (S === 'pool') {
      pool.update(t);
      crowd.forEach((c, i) => { const p = swimmerPose(t, i); if (p) put(c, 'pool', p); });
      const lg = basePose(); Object.assign(lg, { x: PO.tower[0], z: PO.tower[1] + 0.05, y: seatY(2.04), floor: seatY(2.04) + 0.1, rotY: faceToward(PO.tower[0], PO.tower[1], 0, 0), footFwd: 0.4 });
      lg.headPitch = 0.2; lg.eyes = t > 21 && t < 23 ? 'closed' : blink(t, 9); lg.mouth = 'flat'; lg.armA = SHRUG_A; lg.armB = SHRUG_B;
      lg.armA = mixArm(REST, SHRUG_A, K(t, [[22.2, 0], [22.6, 1]])); lg.armB = mixArm(REST, SHRUG_B, K(t, [[22.2, 0], [22.6, 1]]));
      put(lifeguard, 'pool', lg);
    } else if (S === 'office') {
      put(gary, 'office', interviewPose(t, 'gary')); put(hr, 'office', interviewPose(t, 'hr'));
    } else if (S === 'kit') {
      put(gary, 'kit', garyDogPose(t));
      dog.g.visible = true; kit.root.add(dog.g);
      const leave = K(t, [[33.0, 0], [35.6, 1]], (u) => u);
      dog.g.position.set(0.45 + 2.6 * leave, 0, -0.15 + 0.6 * leave); dog.update(t, t > 33.0 ? 1.0 : 0);
      dog.g.rotation.y = lerpAngle(-PI / 2 - 0.3, t > 32.9 ? 1.35 : 0.9, K(t, [[31.4, 0], [31.8, 1]]));   // turns away, offended… then trots off
      dog.head.rotation.x = K(t, [[31.6, 0], [32.0, -0.45]]);
    } else if (S === 'laund') {
      laund.update(t, 1);
      crowd.forEach((c, i) => { const p = launderPose(t, i); if (p) { put(c, 'laund', p); skirts[i].visible = true; setW(c, 0); } });
      { const c = crowd[8], u = K(t, [[36.4, 0], [40.8, 1]], (x) => x), p = basePose(); Object.assign(p, { x: lerp(-3.6, 3.4, u), z: 0.2, rotY: PI / 2, dist: u * 7, speed: 1.2 }); p.armA = CARRY_A; p.armB = CARRY_B; p.eyes = blink(t, 8); put(c, 'laund', p); skirts[8].visible = true; stacks[8].visible = true; setW(c, 0); }
    } else if (S === 'city') {
      const pw = K(t, [[42.6, 1], [46.0, 0.0]]);
      city.setShadowFocus(-10, 10, 30); city.setTime({ day: 0, power: pw });
    } else if (S === 'mkt') {
      mkt.setStock(0.15); mkt.setSoldOut(true, 'TOWELS SOLD OUT');
      crowd.forEach((c, i) => { const p = shopperPose(t, i); if (p) { put(c, 'mkt', p); stacks[i].visible = true; } });
    } else if (S === 'street') {
      const center = shot.cam === 'together' ? [-20, -1.5] : [-5.8, -1.5];
      street.aimSun(center[0], center[1], 9); street.setSeason(shot.cam === 'party' ? 'summer' : 'spring', t, center);
      if (shot.cam === 'together') crowd.forEach((c, i) => { const p = togetherPose(t, i); if (p) put(c, 'street', p); });
      else {
        party.visible = true;
        crowd.forEach((c, i) => { const p = partyPose(t, i); if (p) put(c, 'street', p); });
        put(gary, 'street', garyPartyPose(t));
        dog.g.visible = true; street.root.add(dog.g); dog.g.position.set(-6.55, SH, 0.05); dog.update(t, 0);
        dog.g.rotation.y = lerpAngle(0.6, -1.4, K(t, [[61.7, 0], [62.0, 1]])); dog.head.rotation.x = K(t, [[61.9, 0], [62.2, -0.45]]);
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3(), age = t - 58.2;
        confSeeds.forEach((s, i) => { const fall = (age * (0.55 + s[3] * 0.5) + s[4] * 4.5) % 4.6; v3.set(-9.5 + s[0] * 7.5 + Math.sin(t * 2 + i) * 0.15, 4.4 - fall, -2.8 + s[1] * 3.6); q.setFromEuler(e3.set(t * (2 + s[2] * 4) + i, t * 3 + i * 0.7, i)); m4.compose(v3, q, s3); confetti.setMatrixAt(i, m4); });
        confetti.instanceMatrix.needsUpdate = true; if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
      }
    }

    // camera (local → world)
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (shot.cam === 'class' && t > MOMENT && t < MOMENT + 0.5) { const k = 0.02 * Math.exp(-(t - MOMENT) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; }   // a tiny jolt on the moment
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
