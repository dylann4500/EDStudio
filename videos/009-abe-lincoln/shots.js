// VIDEO 009 — "The story of Abraham Lincoln"  (tone: BIOGRAPHY — see docs/TONES.md)
// 86.5 s. One life, birth → death, one scene per subtitle. NINE new sets (engine/sets/frontier.js + capital.js) parked at
// offsets in one scene; the shot list lives in story.json → "shots" (single source of truth for shots.js + make_cues.py).
// HUD = Lincoln's AGE (0 → 56), time line = the date, second line = the place.
//
// Facts (checked Oct 2026): born Feb 12 1809, Sinking Spring Farm, Hodgenville KY (one-room log cabin); Indiana Dec 1816
// ("an axe was put into his hands at once… till within his 23rd year" — Lincoln, 1860 autobiography); mother Nancy Hanks
// died Oct 1818 (milk sickness); schooling "did not amount to one year" (Lincoln); 1828 flatboat trip Rockport → New Orleans,
// 1,222 mi (NPS) / 1,085 mi (other sources) → "over 1,000 miles"; New Salem store clerk 1831; "Honest Abe" returning a
// few cents (folk story, amounts vary → "a few cents"); law license 1836 (age 27); 1858 Lincoln–Douglas debates (7, Ottawa
// first); elected Nov 6 1860; Grace Bedell (11) letter Oct 1860 → beard; Civil War Apr 12 1861; Emancipation Proclamation
// Jan 1 1863 — hand trembled after ~3 h of New Year's handshaking, he waited and signed steadily (Smithsonian; Carpenter);
// Gettysburg Nov 19 1863: Everett ~2 h, Lincoln ~2 min, 272 words; Appomattox Apr 9 1865; Ford's Theatre Apr 14 1865 ~10:15 PM;
// died 7:22 AM Apr 15 1865, Petersen House, age 56; "Now he belongs to the ages" (Stanton); ~4 million enslaved people (1860).
// Non-graphic on purpose: the theatre beat cuts to black on a shadow in the box doorway.
import * as THREE from 'three';
import { K, clamp, lerp, smooth, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeBabyBundle } from '@engine/props.js';
import { buildCabin, buildWoods, buildRiver, buildStore, makeAxe, makeLantern, makeOpenBook, makeBook, makeCoin, DIMS as FD } from '@engine/sets/frontier.js';
import { buildRoom, buildSquare, buildBattlefield, buildTheatre, buildMemorial, makeTopHat, makeDerby, makeBonnet, makeKepi, makeRifle, makeQuill, makeFlag, DIMS as CD } from '@engine/sets/capital.js';

const PI = Math.PI;
const OFF = { cabin: [0, 0, 0], woods: [1000, 0, 0], river: [2000, 0, 0], store: [3000, 0, 0], room: [4000, 0, 0], square: [5000, 0, 0], battle: [6000, 0, 0], theatre: [7000, 0, 0], memorial: [8000, 0, 0] };
const FAR = { cabin: 300, woods: 320, river: 520, store: 40, room: 40, square: 420, battle: 420, theatre: 60, memorial: 600 };
const FILL = { cabin: 0.45, woods: 0.3, river: 0.35, store: 0.5, room: 2.0, square: 0.3, battle: 0.3, theatre: 0.45, memorial: 0.3 };

// camera coordinates are LOCAL to the shot's set (OFF added at runtime). p/a = start → end, fov, amp = handheld drift.
// 'track' cameras are relative to a moving subject (computed in update).
export const CAMS = {
  cabinExt: { p: [[3.4, 2.5, 14.5], [2.8, 2.2, 12.5]], a: [[-0.6, 2.0, 0], [-0.6, 1.8, 0]], fov: 46, amp: 0.004 },
  birth:    { p: [[-0.15, 1.5, 1.75], [-0.25, 1.42, 1.6]], a: [[-1.05, 0.6, 0.2], [-1.05, 0.6, 0.2]], fov: 52, amp: 0.004 },
  forest:   { p: [[3.6, 1.3, 1.5], [3.2, 1.22, 1.35]], a: [[-0.2, 0.92, 0.62], [-0.1, 0.85, 0.62]], fov: 46, amp: 0.005 },
  grave:    { p: [[17.5, 1.15, 8.3], [17.35, 1.1, 7.9]], a: [[15.75, 0.82, 3.2], [15.75, 0.8, 3.2]], fov: 42, amp: 0.004 },
  reading:  { p: [[0.55, 1.15, 1.45], [0.35, 1.1, 1.25]], a: [[-1.0, 0.8, 0.1], [-1.0, 0.78, 0.1]], fov: 48, amp: 0.004 },
  riverA:   { track: 'boat', p: [[-6.4, 2.2, 5.8], [-5.8, 2.0, 5.2]], a: [[-3.0, 1.55, 0.55], [-2.9, 1.55, 0.55]], fov: 48, amp: 0.006 },
  riverB:   { track: 'abe', p: [[1.0, 0.05, -2.3], [0.85, 0.05, -2.0]], a: [[0, -0.15, 0], [0, -0.15, 0]], fov: 40, amp: 0.004 },
  store:    { p: [[2.75, 1.78, 1.65], [2.6, 1.74, 1.45]], a: [[0.3, 1.42, -0.8], [0.3, 1.42, -0.8]], fov: 48, amp: 0.004 },
  road:     { track: 'abe', p: [[3.4, 1.35, 0.7], [3.2, 1.3, 0.65]], a: [[-6, 1.0, 0.1], [-6, 1.0, 0.1]], fov: 44, amp: 0.004 },
  law:      { p: [[1.15, 1.48, -1.85], [1.05, 1.44, -1.82]], a: [[-0.05, 1.1, -0.5], [-0.05, 1.08, -0.5]], fov: 46, amp: 0.003 },
  debateA:  { p: [[1.2, 2.7, 5.6], [1.05, 2.6, 5.0]], a: [[0.0, 2.15, -1.4], [0.0, 2.15, -1.4]], fov: 40, amp: 0.005 },
  debateB:  { p: [[-0.7, 2.25, 2.1], [-0.6, 2.2, 1.85]], a: [[0, 2.65, -1.1], [0, 2.65, -1.1]], fov: 42, amp: 0.004 },
  electedA: { p: [[-0.1, 1.65, 1.35], [0.0, 1.62, 1.15]], a: [[1.4, 1.45, -0.4], [1.4, 1.45, -0.4]], fov: 46, amp: 0.004 },
  beard:    { p: [[0.95, 1.78, 0.75], [0.85, 1.76, 0.62]], a: [[1.7, 1.72, -0.35], [1.7, 1.72, -0.35]], fov: 40, amp: 0.003 },
  war:      { p: [[-4.0, 2.1, 9.5], [-4.0, 2.0, 8.6]], a: [[-4.0, 1.3, -30], [-4.0, 1.3, -30]], fov: 50, amp: 0.006 },
  signingA: { p: [[1.35, 1.6, -1.72], [1.25, 1.55, -1.7]], a: [[-0.05, 1.08, -0.55], [-0.05, 1.08, -0.55]], fov: 46, amp: 0.003 },
  signingB: { p: [[0.55, 1.62, -0.48], [0.5, 1.55, -0.55]], a: [[0.08, 0.82, -0.92], [0.08, 0.82, -0.92]], fov: 40, amp: 0.002 },
  gettysA:  { p: [[2.9, 2.7, 6.2], [2.7, 2.6, 5.6]], a: [[0.45, 2.1, -2.2], [0.45, 2.1, -2.2]], fov: 42, amp: 0.005 },
  gettysB:  { p: [[-0.9, 2.15, 2.25], [-0.8, 2.1, 2.0]], a: [[0, 2.65, -1.15], [0, 2.65, -1.15]], fov: 42, amp: 0.004 },
  victory:  { p: [[6.0, 3.0, 13.0], [5.4, 3.2, 12.0]], a: [[-6, 5.0, -50], [-6, 6.0, -50]], fov: 50, amp: 0.006 },
  theatre:  { p: [[-0.9, 3.05, 1.0], [-0.5, 3.1, 1.2]], a: [[4.1, 4.35, 2.1], [4.1, 4.35, 2.1]], fov: 36, amp: 0.004 },
  dawn:     { p: [[-1.0, 1.4, 1.55], [-0.75, 1.32, 1.35]], a: [[1.2, 0.75, -0.4], [1.2, 0.75, -0.45]], fov: 46, amp: 0.002 },
  memorial: { p: [[0, 1.7, 24.0], [0, 6.2, 9.0]], a: [[0, 9.0, -5], [0, 9.6, -5]], fov: 46, amp: 0.003 },
};

// ---------------------------------------------------------------- arm library (sx<0 = forward, el<0 bends, sz>0 out; armB twist<0 inward, armA mirrors)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const LAP_A = A(-0.55, 0.05, -0.9, 0.35), LAP_B = A(-0.55, 0.05, -0.9, -0.35);           // hands resting on the lap (seated)
const CLASP_A = A(-0.3, -0.05, -1.25, 0.8), CLASP_B = A(-0.3, -0.05, -1.25, -0.8);       // hands clasped in front (mourning)
const READ_A = A(-0.95, 0.08, -1.35, 0.55), READ_B = A(-0.95, 0.08, -1.35, -0.55);       // holding a book / paper up to read
const WRITE_A = A(-0.82, 0.1, -0.95, 0.35);                                              // writing on the desk (right hand = armA)
const DESK_B = A(-0.7, 0.12, -1.1, -0.45);                                               // left hand flat on the desk
const CHEEK_B = A(-1.25, 0.12, -2.25, -0.55);                                            // chin/cheek in hand (studying)
const GESTURE_A = A(-1.55, 0.3, -0.7, 0.2);                                              // speaker's raised hand
const POINT_UP_A = A(-2.3, 0.15, -0.15, 0);
const AXE_UP = A(-2.75, 0.08, -0.35), AXE_DOWN = A(-0.95, 0.06, -0.15);                   // two-handed overhead chop
const OFFER_B = A(-1.2, 0.1, -0.35, -0.1);                                               // holding something out
const LANTERN_B = A(-0.3, 0.12, -0.55, -0.2);
const CHEER = A(-2.7, 0.35, -0.3, 0);
const ROCK_B = A(-0.9, 0.25, -0.55, -0.2);                                               // hand on the cradle
const OAR_A = A(-0.8, 0.0, -0.9, 0.4), OAR_B = A(-0.8, 0.0, -0.9, -0.4);
const HAT_RAISE_B = A(-2.6, 0.3, -0.5, 0);
const YAWN_A = A(-1.3, 0.05, -2.35, 0.6);
const SIT = { y: -0.22, footFwd: 0.4 };
const easeIn = (u) => u * u * u;

/** Two-handed chop: 1 = axe overhead, 0 = struck. strikes = impact times. */
function chopK(t, strikes, per = 0.9) {
  for (const s of strikes) {
    if (t >= s - per && t < s + 0.3) { const u = (t - (s - per)) / per; return u < 0.68 ? smooth(u / 0.68) : u < 1 ? 1 - easeIn((u - 0.68) / 0.32) : 0; }
  }
  return 0;
}

const shotAt = (shots, t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const SHOTS = story.shots;
  const W = (key, x, y, z) => [x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]];

  // ---------------------------------------------------------------- sets
  const cabin = buildCabin(studio); cabin.root.position.set(...OFF.cabin);
  const woods = buildWoods(studio); woods.root.position.set(...OFF.woods);
  const river = buildRiver(studio); river.root.position.set(...OFF.river);
  const store = buildStore(studio); store.root.position.set(...OFF.store);
  const room = buildRoom(studio); room.root.position.set(...OFF.room);
  const square = buildSquare(studio); square.root.position.set(...OFF.square);
  const battle = buildBattlefield(studio); battle.root.position.set(...OFF.battle);
  const theatre = buildTheatre(studio); theatre.root.position.set(...OFF.theatre);
  const memorial = buildMemorial(studio); memorial.root.position.set(...OFF.memorial);
  const ROOTS = { cabin: cabin.root, woods: woods.root, river: river.root, store: store.root, room: room.root, square: square.root, battle: battle.root, theatre: theatre.root, memorial: memorial.root };
  const cabinFog = new THREE.Fog(0x1a2238, 20, 120);
  const FOGS = { cabin: cabinFog, woods: woods.fog, river: river.fog, store: null, room: null, square: square.fog, battle: battle.fog, theatre: null, memorial: memorial.fog };
  room.chair.rotation.y = 0;

  // ---------------------------------------------------------------- cast
  const SKIN = 0xe3b48e, HAIR = 0x1d1612;
  const abeKid = makePerson({ skin: SKIN, top: 0xb89a6a, pants: 0x6b4f35, shoes: 0x4a3626, hair: HAIR, hairStyle: 'messy', headR: 0.17 });
  const abeTeen = makePerson({ skin: SKIN, top: 0xa88a5a, pants: 0x5a4430, shoes: 0x4a3626, hair: HAIR, hairStyle: 'messy', headR: 0.155 });
  const abeYoung = makePerson({ skin: SKIN, top: 0xa89878, pants: 0x5a4a3a, shoes: 0x3a2a1e, hair: HAIR, hairStyle: 'messy', headR: 0.14 });
  const abeLaw = makePerson({ skin: SKIN, top: 0x3a3028, collar: 0xf1ece0, pants: 0x2a2a2a, shoes: 0x1a1414, hair: HAIR, hairStyle: 'messy', headR: 0.14 });
  const abe = makePerson({ skin: SKIN, top: 0x1c1b20, collar: 0xf1ece0, pants: 0x1e1e24, shoes: 0x111111, hair: HAIR, hairStyle: 'messy', headR: 0.14, beard: 0x2e2018 });
  const ABES = [abeKid, abeTeen, abeYoung, abeLaw, abe];
  ABES.forEach((P) => { scene.add(P.root); const m = mk(new THREE.SphereGeometry(0.008, 8, 6), mat(0x5a3020, 0.7), P.head.g, -0.42 * 0.14, -0.3 * 0.14, 0.9 * 0.14); m.scale.setScalar(P === abeKid ? 0 : 1); });
  for (const P of [abeLaw, abe]) mk(new THREE.BoxGeometry(0.11, 0.035, 0.03), mat(0x111111, 0.6), P.spine, 0, 0.5, 0.135); // bow tie
  const SC = new Map([[abeKid, 0.62], [abeTeen, 0.86], [abeYoung, 1.08], [abeLaw, 1.08], [abe, 1.1]]);
  SC.forEach((s, P) => P.root.scale.setScalar(s));
  const hat = makeTopHat(0.14); abe.head.g.add(hat); hat.position.set(0, 0.14 * 0.8, -0.005); hat.rotation.x = -0.08;
  const hatProp = makeTopHat(0.14); scene.add(hatProp);   // the hat left on the rocking chair (dawn)
  const nancy = makePerson({ skin: 0xe8b996, top: 0x7a6a5a, pants: 0x6a5a7a, hair: 0x3a2618, hairStyle: 'bob', dress: 0x6a5a7a });
  const thomas = makePerson({ skin: 0xdcaa84, top: 0x6a4a30, pants: 0x4a3a28, hair: 0x3a2a1e, hairStyle: 'short', mustache: 0x3a2a1e, headR: 0.138 });
  const customer = makePerson({ skin: 0xf0c8a8, top: 0x7a8aa0, pants: 0x3a3a4a, hair: 0x8a5a3a, hairStyle: 'bob', dress: 0x5a6a8a });
  { const bn = makeBonnet(0.135, 0xb8a888); bn.scale.setScalar(0.85); customer.head.g.add(bn); }
  const douglas = makePerson({ skin: 0xe8b996, top: 0x242a3a, collar: 0xf1ece0, pants: 0x24283a, hair: 0x2a2018, hairStyle: 'short', headR: 0.152 });
  douglas.root.scale.setScalar(0.94); SC.set(douglas, 0.94);
  const everett = makePerson({ skin: 0xf0c8a8, top: 0x1e1e24, collar: 0xf1ece0, pants: 0x1e1e24, hair: 0xd8d4cc, hairStyle: 'short', headR: 0.14 });
  const mary = makePerson({ skin: 0xf0c8a8, top: 0x2a2436, pants: 0x2a2436, hair: 0x2a1e16, hairStyle: 'bob', headR: 0.14, dress: 0x2a2436 });
  const booth = makePerson({ skin: 0x1a1414, top: 0x0c0c0e, pants: 0x0c0c0e, shoes: 0x050505, hair: 0x0a0a0a, hairStyle: 'short' });
  booth.head.eyesOpen.visible = false; booth.head.g.traverse((o) => { if (o.isMesh) o.material = mat(0x0a0a0c, 1); });
  const friends = [0, 1].map((i) => { const P = makePerson({ skin: [0xe2ad8c, 0xf0c8a8][i], top: [0x3a3028, 0x2a3040][i], collar: 0xf1ece0, pants: 0x2a2a2a, hair: [0x5a3a24, 0x8a8278][i], hairStyle: 'short', mustache: i ? 0x8a8278 : null }); const h = makeTopHat(0.135, 0x1a1a1a); P.arms[1].hand.add(h); h.position.set(0, -0.12, 0.06); h.rotation.x = PI; return P; });
  const cabinet = [0, 1].map((i) => makePerson({ skin: [0xf0c8a8, 0xe2ad8c][i], top: 0x1e1e24, collar: 0xf1ece0, pants: 0x1e1e24, hair: [0xc9c4be, 0x5a3a24][i], hairStyle: 'short', mustache: i ? 0x5a3a24 : null, glasses: i === 0 }));
  const statue = makePerson({ skin: 0xffffff, top: 0xffffff, collar: 0xffffff, pants: 0xffffff, hair: 0xffffff, hairStyle: 'messy', headR: 0.14, beard: 0xffffff });
  statue.root.traverse((o) => { if (o.isMesh) { o.material = memorial.marble; } });
  const statueCarrier = new THREE.Group(); statueCarrier.scale.setScalar(5.2); statueCarrier.add(statue.root); memorial.root.add(statueCarrier);
  [nancy, thomas, customer, douglas, everett, mary, booth, ...friends, ...cabinet].forEach((P) => scene.add(P.root));

  // period crowd: men in top hats / derbies, women in dresses + bonnets
  const R = rng(1863);
  const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0xf3d0b5, 0xd9a37f, 0x9a6447];
  const COATS = [0x2a2a30, 0x3a3028, 0x4a3a2a, 0x2a3040, 0x5a4a3a, 0x1e1e24, 0x6a5a48];
  const DRESSES = [0x6a3a3a, 0x3a4a6a, 0x5a6a4a, 0x7a6a8a, 0x8a6a4a, 0x4a3a4a];
  const crowd = Array.from({ length: 24 }, (_, i) => {
    const woman = i % 4 === 1;
    const P = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: woman ? DRESSES[i % DRESSES.length] : COATS[Math.floor(R() * COATS.length)], collar: woman ? null : 0xf1ece0,
      pants: 0x2a2a2e, hair: [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0x1a1a1a, 0xc9c4be][Math.floor(R() * 5)], hairStyle: woman ? 'bob' : 'short', mustache: !woman && R() < 0.4 ? 0x3a2a1e : null, dress: woman ? DRESSES[(i + 2) % DRESSES.length] : null });
    const h = woman ? makeBonnet(0.135, [0xe8dcc0, 0xd8c8a8, 0x5a4a5a][i % 3]) : (R() < 0.5 ? makeTopHat(0.135, 0x1a1a1c) : makeDerby(0.135));
    P.head.g.add(h); h.position.set(0, woman ? 0.0 : 0.135 * 0.8, 0); P.hat = h; P.woman = woman;
    P.seed = R(); P.seed2 = R(); scene.add(P.root); return P;
  });
  const visitors = Array.from({ length: 9 }, (_, i) => { const P = makePerson({ skin: SKINS[i % SKINS.length], top: [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xf5f0e2, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0x4fb3a8][i], pants: [0x34405c, 0x2a2a2a, 0x6b5a48][i % 3], hair: [0x2a1d16, 0x5a3a24, 0xd9b46a, 0x1a1a1a][i % 4], hairStyle: ['short', 'bob', 'messy', 'bob'][i % 4] }); scene.add(P.root); P.seed = R(); return P; });
  const soldiers = Array.from({ length: 22 }, (_, i) => {
    const blue = i < 16;
    const P = makePerson({ skin: SKINS[i % SKINS.length], top: blue ? 0x2a3a6a : 0x8a8a8a, collar: blue ? 0x2a3a6a : 0x8a8a8a, pants: blue ? 0x6a8ab0 : 0x7a7a7a, shoes: 0x1a1414, hair: 0x2a1d16, hairStyle: 'short' });
    const k = makeKepi(0.135, blue ? 0x2a3a6a : 0x8a8a8a); P.head.g.add(k); k.position.y = 0.135 * 0.55; P.head.hair.visible = false;
    const rf = makeRifle(); P.arms[1].hand.add(rf); rf.position.set(0, -0.02, 0.03); rf.rotation.set(-0.35, 0, 0);
    P.blue = blue; P.seed = R(); scene.add(P.root); return P;
  });
  const flagBearer = makeFlag(0.9, 0.55, 2.4, 3); scene.add(flagBearer.g);
  const ALL = [...ABES, nancy, thomas, customer, douglas, everett, mary, booth, ...friends, ...cabinet, ...crowd, ...visitors, ...soldiers];

  // ---------------------------------------------------------------- props
  const baby = makeBabyBundle(0xf4ead8, 0xf0c0a0); cabin.rock.add(baby); baby.position.set(0, 0.32, 0.05); baby.rotation.y = PI / 2;
  const axe = makeAxe(); scene.add(axe);
  const lantern = makeLantern(); abeYoung.arms[1].hand.add(lantern.g); lantern.g.position.set(0, -0.12, 0.02);
  const book = makeOpenBook(0x6a3020); scene.add(book);
  const floorBooks = new THREE.Group(); cabin.root.add(floorBooks); floorBooks.position.set(-0.55, 0, -0.35);
  [0x7a3a2a, 0x2f4a6a, 0x5a6a3a].forEach((c, i) => { const b = makeBook(c); b.position.y = i * 0.036; b.rotation.y = i * 0.4; floorBooks.add(b); });
  const coins = [0, 1, 2].map(() => { const c = makeCoin(); scene.add(c); return c; });
  const telegram = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), new THREE.MeshStandardMaterial({ map: canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#efe4c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a1a'; g.font = 'bold 18px Georgia, serif'; g.fillText('TELEGRAPH', 14, 26); g.fillStyle = 'rgba(30,20,10,.75)'; g.font = 'bold 22px Courier New, monospace'; g.fillText('YOU ARE ELECTED', 14, 80); for (let i = 0; i < 3; i++) g.fillRect(14, 102 + i * 16, w - 40 - i * 30, 4); }), roughness: 0.9, side: THREE.DoubleSide }));
  scene.add(telegram);
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshStandardMaterial({ map: canvasTex(320, 416, (g, w, h) => {
    g.fillStyle = '#f2e8cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2040'; g.font = 'italic 24px Georgia, serif';
    ['Dear Sir,', 'if you will let', 'your whiskers grow…', 'you would look a', 'great deal better,', 'for your face', 'is so thin.', '', '   — Grace Bedell, 11'].forEach((l, i) => g.fillText(l, 22, 46 + i * 40));
  }), roughness: 0.9, side: THREE.DoubleSide }));
  scene.add(letter);
  const quill = makeQuill(); abe.arms[0].hand.add(quill); quill.position.set(0.0, -0.06, 0.04); quill.rotation.set(0.6, 0, 0.2);
  const speech = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.24), new THREE.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.9, side: THREE.DoubleSide })); scene.add(speech);
  // chips flying off the log (forest)
  const chipM = new THREE.Matrix4(), chipQ = new THREE.Quaternion(), chipE = new THREE.Euler(), chipV = new THREE.Vector3(), chipS = new THREE.Vector3(1, 1, 1);
  const CR = rng(7), chipSeeds = Array.from({ length: 14 }, () => [CR() - 0.5, CR(), CR() - 0.5, CR()]);

  // ---------------------------------------------------------------- helpers
  function put(P, key, p) {
    const s = SC.get(P) || 1;
    p.floor = p.floor || 0;
    p.dist = (p.dist || 0) / s;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(P, p);
    P.root.position.y = (p.y || 0) * s + (p.lift || 0) + OFF[key][1];
    P.root.visible = true;
  }
  const pose = (t, seed = 0, extra = {}) => Object.assign(basePose(), { eyes: blink(t, seed) }, extra);
  function hideAll() {
    ALL.forEach((P) => (P.root.visible = false));
    [axe, book, telegram, letter, speech, hatProp, flagBearer.g, ...coins].forEach((o) => (o.visible = false));
    statueCarrier.visible = false; lantern.g.visible = false;
  }
  const anchor = (obj, pos) => { obj.position.copy(pos); obj.visible = true; };

  // the boat drifts down-river (+x); Abe rides at the stern
  const boatX = (t) => -6 + (t - 19.6) * 1.15;
  const ABE_ON_BOAT = [-3.0, 0.64, 0.55];

  // ---------------------------------------------------------------- per-shot performances
  function birth(t) {
    const C = FD.cabin;
    cabin.chair.rotation.y = faceToward(C.chair[0], C.chair[1], C.cradle[0], C.cradle[1]);
    put(nancy, 'cabin', pose(t, 2, { ...SIT, x: C.chair[0], z: C.chair[1], rotY: cabin.chair.rotation.y, headPitch: 0.45, lean: 0.18, armB: ROCK_B, armA: LAP_A, eyes: 'open' }));
    nancy.dress.visible = false;   // seated: the trouser legs (dress-colored) read as a skirt; the cone would look like standing
    cabin.rock.rotation.z = 0.07 * Math.sin(t * 2.2);
    put(thomas, 'cabin', pose(t, 5, { x: -0.35, z: -0.85, rotY: faceToward(-0.35, -0.85, C.cradle[0], C.cradle[1]), headPitch: 0.35, armA: A(-0.3, 0.05, -1.2, 0.8), armB: A(-0.3, 0.05, -1.2, -0.8) }));
  }
  function forest(t) {
    // father chops (7.4, 8.3, 9.2), turns and hands Abe the axe (≈10.2), Abe steps up and chops (11.35, 12.25)
    const handoff = 10.25;
    const fTurn = K(t, [[9.55, 0], [9.9, 1]]);
    const fx = lerp(0, 0.1, fTurn), fz = 0.78;
    const fp = pose(t, 5, { x: fx, z: fz, rotY: lerpAngle(PI, faceToward(fx, fz, 0.95, 1.05), fTurn), lean: 0.12 });
    const fk = chopK(t, [7.4, 8.3, 9.2]);
    if (t < 9.55) { fp.armA = mixArm(AXE_DOWN, AXE_UP, fk); fp.armB = mixArm(AXE_DOWN, AXE_UP, fk); fp.armA.twist = 0.5; fp.armB.twist = -0.5; fp.lean = 0.22 - 0.15 * fk; fp.headPitch = 0.35 - 0.3 * fk; }
    else { const off = K(t, [[9.6, 0], [9.95, 1], [handoff + 0.1, 1], [handoff + 0.5, 0]]); fp.armB = mixArm(REST, OFFER_B, off); fp.armA = REST; fp.headPitch = 0.3; }
    if (t > handoff + 0.3) { const w = K(t, [[handoff + 0.4, 0], [handoff + 1.2, 1]]); fp.x = lerp(fx, -1.35, w); fp.z = lerp(fz, 1.5, w); fp.dist = w * 1.5; fp.speed = w > 0.02 && w < 0.98 ? 0.9 : 0; if (w > 0.02) fp.rotY = w < 0.98 ? faceToward(fx, fz, -1.35, 1.5) : faceToward(-1.35, 1.5, 0, 0); fp.armB = REST; }
    put(thomas, 'woods', fp);
    // Abe watches, takes the axe, steps to the stump
    const step = K(t, [[handoff + 0.35, 0], [handoff + 0.95, 1]]);
    const ax = lerp(0.95, 0.0, step), az = lerp(1.05, 0.62, step);
    const kp = pose(t, 1, { x: ax, z: az, rotY: t < handoff + 0.35 ? faceToward(0.95, 1.05, fx, fz) : lerpAngle(faceToward(0.95, 1.05, fx, fz), PI, step), headPitch: -0.25 });
    if (step > 0.02 && step < 0.98) { kp.dist = step * 1.0; kp.speed = 0.7; }
    const reach = K(t, [[9.9, 0], [handoff, 1]]);
    kp.armA = t < handoff + 0.35 ? mixArm(REST, { ...OFFER_B, twist: 0.1 }, reach) : A(-0.6, 0.06, -0.5, 0.3);   // camera-side hand takes the axe
    const kk = chopK(t, [11.35, 12.25], 0.85);
    if (t > handoff + 0.95) { kp.armA = mixArm(AXE_DOWN, AXE_UP, kk); kp.armB = mixArm(AXE_DOWN, AXE_UP, kk); kp.armA.twist = 0.5; kp.armB.twist = -0.5; kp.lean = 0.25 - 0.18 * kk; kp.headPitch = 0.45 - 0.35 * kk; kp.mouth = 'flat'; }
    put(abeKid, 'woods', kp);
    // the axe: father's hand → Abe's hand
    const hand = t < handoff ? thomas.arms[1].hand : abeKid.arms[0].hand;
    if (axe.parent !== hand) { hand.add(axe); axe.position.set(0, -0.3, 0.02); axe.rotation.set(PI, 0, 0); }
    axe.visible = true;
    // chips burst on every strike
    const strikes = [7.4, 8.3, 9.2, 11.35, 12.25];
    const last = strikes.filter((s) => s <= t).pop();
    woods.chips.visible = last !== undefined && t - last < 0.8;
    if (woods.chips.visible) {
      const age = t - last;
      chipSeeds.forEach((s, i) => {
        chipV.set(OFF.woods[0] + s[0] * 1.6 * age, 0.85 + (1.2 + s[1]) * age - 4.9 * age * age, s[2] * 1.6 * age + 0.1);
        if (chipV.y < 0.02) chipV.y = 0.02;
        chipQ.setFromEuler(chipE.set(age * 12 * s[3], i, age * 9)); chipM.compose(chipV, chipQ, chipS); woods.chips.setMatrixAt(i, chipM);
      });
      woods.chips.instanceMatrix.needsUpdate = true;
    }
    woods.halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (t > 12.25 ? Math.min(0.12, (t - 12.25) * 0.8) : 0); h.rotation.z = (i ? -1 : 1) * (t > 12.25 ? Math.min(0.5, (t - 12.25) * 3) : 0); });
  }
  function grave(t) {
    const G = FD.woods.grave, s = 0.66, fl = 0.24 / s;
    SC.set(abeKid, s); abeKid.root.scale.setScalar(s);
    put(abeKid, 'woods', pose(t, 1, { x: G[0], z: G[1] + 1.25, y: fl, floor: fl, rotY: PI, headPitch: 0.45, armA: CLASP_A, armB: CLASP_B, mouth: 'flat' }));
  }
  function reading(t) {
    const C = FD.cabin;
    cabin.cradle.visible = false; floorBooks.visible = true; cabin.stool.position.set(-1.0, 0, 0.1);
    const p = pose(t, 3, { x: -1.0, z: 0.1, rotY: 0.95, y: -0.135, footFwd: 0.36, lean: 0.2, headPitch: 0.5, armA: READ_A, armB: READ_B, mouth: 'flat' });
    p.eyes = 'open';
    put(abeTeen, 'cabin', p);
    const a = handWorld(abeTeen, -1), b = handWorld(abeTeen, 1);
    book.position.copy(a).add(b).multiplyScalar(0.5); book.position.y += 0.05;
    book.rotation.set(0, abeTeen.root.rotation.y, 0); book.rotateX(-0.7); book.visible = true;
    // turn a page at 18.2
    book.children[1].rotation.z = 0.18 + K(t, [[18.2, 0], [18.5, PI * 0.95]]) * -1;
  }
  function riverShot(t, cam) {
    const bx = boatX(t);
    river.boat.position.set(bx, 0.02 * Math.sin(t * 1.3), 0); river.boat.rotation.z = 0.006 * Math.sin(t * 1.1);
    river.sweep.rotation.y = 0.18 * Math.sin(t * 0.9);
    const p = pose(t, 4, { x: bx + ABE_ON_BOAT[0], z: ABE_ON_BOAT[2], y: ABE_ON_BOAT[1], floor: ABE_ON_BOAT[1] / 1.08, rotY: -PI / 2 + 0.25, armA: OAR_A, armB: OAR_B, lean: 0.18, headPitch: -0.05 });
    p.y = ABE_ON_BOAT[1] / 1.08;
    p.armA.sx += 0.15 * Math.sin(t * 0.9); p.armB.sx += 0.15 * Math.sin(t * 0.9);
    if (cam === 'riverB') {
      const look = K(t, [[22.9, 0], [23.6, 1]]);
      p.rotY = lerpAngle(-PI / 2 + 0.25, PI - 0.25, look); p.headYaw = 0; p.headPitch = 0.08 * look; p.lean = lerp(0.18, 0.02, look);
      p.armA = mixArm(OAR_A, REST, look); p.armB = mixArm(OAR_B, REST, look); p.mouth = look > 0.5 ? 'flat' : 'smile'; p.eyes = 'open';
    }
    put(abeYoung, 'river', p);
  }
  function storeShot(t) {
    const S = FD.store;
    const hand = K(t, [[26.4, 0], [26.9, 1], [27.9, 1], [28.3, 0]]);
    put(abeYoung, 'store', pose(t, 4, { x: S.clerk[0], z: S.clerk[1], rotY: 0.1, armB: mixArm(REST, A(-1.25, 0.05, -0.35, -0.2), hand), armA: A(-0.55, 0.1, -0.7, 0.3), headPitch: 0.25 * hand, smile: 1 }));
    const take = K(t, [[26.95, 0], [27.35, 1], [28.0, 1], [28.4, 0]]);
    put(customer, 'store', pose(t, 8, { x: S.customer[0], z: S.customer[1], rotY: PI + 0.1, armA: mixArm(REST, A(-1.15, 0.05, -0.45, 0.3), take), armB: REST, headPitch: 0.15 }));
    customer.dress.visible = true;
    const hb = handWorld(t < 27.3 ? abeYoung : customer, t < 27.3 ? 1 : -1);
    coins.forEach((c, i) => { c.visible = hand > 0.5 || take > 0.5; c.position.copy(hb); c.position.x += (i - 1) * 0.022; c.position.y -= 0.03; });
  }
  function road(t) {
    lantern.g.visible = true;
    const x = -1 - 1.05 * (t - 28.6), z = FD.woods.road;
    put(abeYoung, 'woods', pose(t, 4, { x, z, rotY: -PI / 2, dist: 1.05 * (t - 28.6), speed: 1.05, armB: LANTERN_B, headPitch: 0.05 }));
    return [x, 0, z];
  }
  function law(t) {
    room.setMode('candle'); room.openBook.visible = true; room.candle.visible = true;
    const turn = K(t, [[34.2, 0], [34.5, 1]]);
    put(abeLaw, 'room', pose(t, 6, { ...SIT, x: CD.room.chair[0], z: CD.room.chair[1], rotY: PI, lean: 0.25, headPitch: 0.5, armB: CHEEK_B, armA: mixArm(A(-0.8, 0.1, -1.0, 0.35), A(-0.95, 0.15, -0.85, 0.35), turn), eyes: 'open', mouth: 'flat' }));
  }
  const crowdSpots = (() => { const r = rng(5), s = []; for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) s.push([-3.2 + i * 1.25 + (row % 2) * 0.6 + (r() - 0.5) * 0.35, 1.0 + row * 1.15 + (r() - 0.5) * 0.3]); return s; })();
  function crowdAt(t, focus, mode) {
    crowd.forEach((P, i) => {
      const [x, z] = crowdSpots[i];
      const p = pose(t, i + 10, { x, z, rotY: faceToward(x, z, focus[0], focus[1]) + (P.seed - 0.5) * 0.3, headPitch: -0.22 });
      if (P.woman) P.dress.visible = true;
      if (mode === 'cheer') {
        const up = 0.5 + 0.5 * Math.sin(t * 6 + P.seed * 6);
        p.armB = mixArm(A(-1.8, 0.3, -0.4, 0), CHEER, up); p.armA = P.seed > 0.5 ? mixArm(A(-1.8, 0.3, -0.4, 0), CHEER, 1 - up) : REST;
        p.lift = Math.max(0, Math.sin(t * 7 + P.seed * 9)) * 0.08; p.mouth = 'o'; p.headPitch = -0.3;
        if (!P.woman && P.hat.parent !== P.arms[1].hand) { P.arms[1].hand.add(P.hat); P.hat.position.set(0, -0.1, 0.05); P.hat.rotation.set(PI, 0, 0); }
      } else {
        if (!P.woman && P.hat.parent !== P.head.g) { P.head.g.add(P.hat); P.hat.position.set(0, 0.135 * 0.8, 0); P.hat.rotation.set(0, 0, 0); }
        if (mode === 'bored' && i === 7) { p.armA = YAWN_A; p.mouth = 'o'; p.headPitch = -0.35; }
        if (mode === 'bored' && i === 3) { p.armB = A(-0.9, 0.05, -1.5, -0.6); p.headPitch = 0.5; }   // checks a pocket watch
        if (mode === 'clap') { const c = 0.18 * Math.max(0, Math.sin(t * 16 + i)); p.armA = { ...A(-1.0, 0.1 + c, -1.2, 0.6) }; p.armB = { ...A(-1.0, 0.1 + c, -1.2, -0.6) }; }
      }
      put(P, 'square', p);
    });
  }
  const DECK = CD.square.deck, LECT = [0, -1.15];
  function speaker(t, P, seed, gestureK) {
    const g = gestureK * (0.5 + 0.5 * Math.sin(t * 2.3 + seed));
    return pose(t, seed, { x: LECT[0], z: LECT[1], y: DECK / (SC.get(P) || 1), floor: DECK / (SC.get(P) || 1), rotY: 0.05, armA: mixArm(A(-0.75, 0.08, -0.6, 0.3), GESTURE_A, g), armB: A(-0.7, 0.1, -0.7, -0.3), headPitch: -0.12, mouth: Math.sin(t * 9 + seed) > 0 ? 'o' : 'flat' });
  }
  function seated(t, P, seed, ci) {
    const c = square.chairs[ci].position, s = SC.get(P) || 1;
    return pose(t, seed, { x: c.x, z: c.z, y: (DECK) / s - 0.22, floor: DECK / s, footFwd: 0.4, rotY: 0, armA: LAP_A, armB: LAP_B, headPitch: -0.05 });
  }
  function debate(t, cam) {
    square.setMode('summer'); square.setDress({ town: true, cemetery: false, dome: false, banner: true, bunting: true }); square.setBanner('LINCOLN  ★  DOUGLAS');
    hat.visible = false; abe.head.beard.visible = false;
    if (cam === 'debateA') { put(douglas, 'square', speaker(t, douglas, 3, 1)); put(abe, 'square', seated(t, abe, 4, 4)); }
    else {
      const p = speaker(t, abe, 4, 1); p.armA = mixArm(GESTURE_A, POINT_UP_A, K(t, [[39.4, 0], [39.8, 1], [40.4, 1], [40.8, 0]])); put(abe, 'square', p);
      put(douglas, 'square', seated(t, douglas, 3, 1));
    }
    crowdAt(t, LECT, 'listen');
  }
  function elected(t) {
    room.setMode('day'); room.setWallpaper('#6a5a44', '#74644c'); room.openBook.visible = false; room.candle.visible = false;
    hat.visible = false; abe.head.beard.visible = false;
    const p = pose(t, 4, { x: 1.4, z: -0.4, rotY: faceToward(1.4, -0.4, -0.1, 1.35) + 0.15, armA: READ_A, armB: READ_B, headPitch: 0.35, mouth: t > 42.6 ? 'smile' : 'flat' });
    p.headPitch = K(t, [[42.4, 0.35], [42.9, -0.05]]);
    put(abe, 'room', p);
    const a = handWorld(abe, -1), b = handWorld(abe, 1);
    telegram.position.copy(a).add(b).multiplyScalar(0.5); telegram.position.y += 0.06; telegram.rotation.set(0, abe.root.rotation.y, 0); telegram.rotateX(-0.5); telegram.visible = true;
    friends.forEach((F, i) => {
      const x = [1.95, 0.85][i], z = [0.3, -1.65][i];
      const up = K(t, [[42.6 + i * 0.12, 0], [42.95 + i * 0.12, 1]]);
      put(F, 'room', pose(t, 7 + i, { x, z, rotY: faceToward(x, z, 1.4, -0.4), armB: mixArm(REST, HAT_RAISE_B, up), armA: mixArm(REST, A(-1.8, 0.4, -0.5), up * (i ? 1 : 0)), mouth: up > 0.5 ? 'o' : 'smile', lift: up * Math.max(0, Math.sin((t - 42.6) * 7 + i)) * 0.06 }));
    });
  }
  function beard(t) {
    room.setMode('day'); room.setWallpaper('#6a5a44', '#74644c'); room.openBook.visible = false; room.candle.visible = false;
    hat.visible = false;
    { const k = K(t, [[44.9, 0.62], [46.6, 1.0]]); abe.head.beard.scale.setScalar(k); abe.head.beard.visible = t > 44.9; }
    const lift = K(t, [[46.5, 0], [46.9, 1]]);
    const p = pose(t, 4, { x: 1.7, z: -0.35, rotY: faceToward(1.7, -0.35, 0.9, 0.7), armA: mixArm(READ_A, REST, lift), armB: READ_B, headPitch: lerp(0.3, -0.02, lift), mouth: lift > 0.5 ? 'smile' : 'flat' });
    put(abe, 'room', p);
    const b = handWorld(abe, 1);
    letter.position.copy(b); letter.position.y += 0.1; letter.rotation.set(0, abe.root.rotation.y, 0); letter.rotateX(-0.45 + 0.3 * lift); letter.visible = true;
  }
  function war(t) {
    battle.update(t, [[47.75, 0], [48.35, 2], [49.0, 1], [49.7, 3], [50.4, 0]]);
    soldiers.forEach((P, i) => {
      if (P.blue) {
        const row = Math.floor(i / 8), col = i % 8;
        const x = -6.5 + col * 1.05 + row * 0.5, z0 = -7 - row * 1.3, d = 1.0 * (t - 47.6), z = z0 - d;
        const p = pose(t, i, { x, z, y: battle.heightAt(x, z), floor: battle.heightAt(x, z), rotY: PI, dist: d, speed: 1.1, armB: A(-0.6, 0.1, -1.4, -0.4), armA: A(-0.3, 0.08, -0.7, 0.3), mouth: 'flat' });
        put(P, 'battle', p);
      } else {
        const k = i - 16, x = -12 + k * 3.0, z = -52;
        put(P, 'battle', pose(t, i, { x, z, y: battle.heightAt(x, z), floor: battle.heightAt(x, z), rotY: 0, armB: A(-0.6, 0.1, -1.4, -0.4) }));
      }
    });
    const fbP = soldiers[3].root.position; flagBearer.g.position.set(fbP.x + 0.4, fbP.y, fbP.z - 0.2); flagBearer.g.rotation.y = PI / 2; flagBearer.update(t); flagBearer.g.visible = true;
  }
  function signing(t, cam) {
    room.setMode('day'); room.setWallpaper('#4f6a4a', '#5a7856'); room.openBook.visible = false; room.candle.visible = false;
    hat.visible = false; abe.head.beard.visible = true; abe.head.beard.scale.setScalar(1);
    const shake = cam === 'signingB' ? (1 - K(t, [[54.6, 0], [55.4, 1]])) : 1;
    const sign = K(t, [[55.6, 0], [56.6, 1]]);
    const w = { ...WRITE_A };
    w.sx += 0.025 * shake * Math.sin(t * 43) + 0.03 * Math.sin(sign * PI * 6) * (sign > 0 && sign < 1 ? 1 : 0);
    w.sz += 0.02 * shake * Math.sin(t * 37 + 1) - 0.12 * sign;
    const hover = cam === 'signingB' ? 0.06 * (1 - K(t, [[55.4, 0], [55.6, 1]])) * 0 : 0;
    put(abe, 'room', pose(t, 4, { ...SIT, x: CD.room.chair[0], z: CD.room.chair[1], rotY: PI, lean: 0.3, headPitch: 0.55, armA: w, armB: DESK_B, eyes: 'open', mouth: 'flat' }));
    quill.visible = true;
    room.setSign(cam === 'signingB' ? sign : 0);
    if (cam === 'signingA') cabinet.forEach((C, i) => { const x = [-1.2, 1.25][i], z = [-0.2, -0.05][i]; put(C, 'room', pose(t, 12 + i, { x, z, rotY: faceToward(x, z, 0, -1.0), headPitch: 0.3, armA: A(-0.3, 0.05, -1.2, 0.8), armB: A(-0.3, 0.05, -1.2, -0.8) })); });
  }
  function gettys(t, cam) {
    square.setMode('autumn'); square.setDress({ town: false, cemetery: true, dome: false, banner: false, bunting: false });
    abe.head.beard.visible = true; abe.head.beard.scale.setScalar(1);
    if (cam === 'gettysA') {
      put(everett, 'square', speaker(t, everett, 9, 1));
      put(abe, 'square', seated(t, abe, 4, 4)); hat.visible = true;
      crowdAt(t, LECT, 'bored');
    } else {
      hat.visible = false;
      const p = speaker(t, abe, 4, 0.0); p.armA = READ_A; p.armB = READ_B; p.headPitch = K(t, [[60.1, 0.3], [61.6, 0.3], [62.0, -0.1]]);
      put(abe, 'square', p);
      const a = handWorld(abe, -1), b = handWorld(abe, 1);
      speech.position.copy(a).add(b).multiplyScalar(0.5); speech.position.y += 0.07; speech.rotation.set(0, abe.root.rotation.y, 0); speech.rotateX(-0.55); speech.visible = true;
      put(everett, 'square', seated(t, everett, 9, 1));
      crowdAt(t, LECT, t > 62.3 ? 'clap' : 'listen');
    }
  }
  function victory(t) {
    square.setMode('spring'); square.setDress({ town: true, cemetery: false, dome: true, banner: true, bunting: true }); square.setBanner('THE UNION IS SAVED');
    crowdAt(t, [0, -2], 'cheer');
  }
  function theatreShot(t) {
    const B = CD.theatre.box, bx = B[0], by = B[1], bz = B[2];
    hat.visible = false; abe.head.beard.visible = true; abe.head.beard.scale.setScalar(1);
    theatre.rocker.rotation.y = 0.35;
    const laugh = Math.sin(t * 5) > -0.2 && t > 67.4 && t < 69.2;
    put(abe, 'theatre', pose(t, 4, { ...SIT, x: bx + 0.1, z: bz - 0.45, y: by / 1.1 - 0.22, floor: by / 1.1, rotY: -PI / 2 - 0.2, armA: LAP_A, armB: LAP_B, headPitch: -0.05, lean: laugh ? 0.08 : 0.0, mouth: 'smile', eyes: laugh ? 'closed' : blink(t, 4) }));
    put(mary, 'theatre', pose(t, 9, { ...SIT, x: bx - 0.15, z: bz + 0.35, y: by - 0.22, floor: by, rotY: -PI / 2 - 0.5, armA: LAP_A, armB: LAP_B, headPitch: -0.05, mouth: 'smile' }));
    mary.dress.visible = false;
    // a shadow fills the doorway behind them, then black (story dips 69.6 → 70.2)
    const come = K(t, [[68.7, 0], [69.6, 1]]);
    put(booth, 'theatre', pose(t, 0, { x: bx + lerp(1.3, 0.72, come), z: bz - 0.95, y: by, floor: by, rotY: -PI / 2, armA: REST, armB: REST, mouth: 'flat' }));
    booth.root.visible = come > 0.01;
  }
  function dawn(t) {
    room.setMode('dawn'); room.setWallpaper('#5a5a62', '#62626a'); room.openBook.visible = false; room.candle.visible = false; room.setSign(0);
    room.setClock(7, 22);
    room.rocker.position.set(1.3, 0, -0.35); room.rocker.rotation.y = -0.86; room.rocker.rotation.z = 0;
    room.rocker.rotation.x = 0.02 * Math.sin((t - 70.6) * 1.8) * Math.exp(-(t - 70.6) * 0.35);
    hatProp.position.set(...W('room', 1.3, 0.56, -0.35)); hatProp.rotation.set(0, -0.3, 0); hatProp.visible = true;
  }
  function memorialShot(t) {
    const FY = memorial.floorY;
    statueCarrier.position.set(0, FY + 3.0, -5.45); statueCarrier.visible = true;
    const sp = Object.assign(basePose(), { y: -0.375, footFwd: 0.42, rotY: 0, armA: A(-0.5, 0.28, -0.75, 0.3), armB: A(-0.5, 0.28, -0.75, -0.3), headPitch: 0.1, eyes: 'open', mouth: 'flat' });
    applyPose(statue, sp); statue.root.position.set(0, -0.375, 0); statue.root.visible = true;
    visitors.forEach((P, i) => {
      const x = -5 + i * 1.25 + (P.seed - 0.5) * 0.4, z = 1.5 + (i % 3) * 1.6;
      put(P, 'memorial', pose(t, i + 30, { x, z, y: FY, floor: FY, rotY: faceToward(x, z, 0, -5) + (P.seed - 0.5) * 0.3, headPitch: -0.45, armA: i % 4 === 0 ? A(-1.6, 0.25, -0.2, 0) : REST }));
    });
  }

  // ---------------------------------------------------------------- per-frame update
  let lastSet = null;
  function update(t) {
    const shot = shotAt(SHOTS, t), S = shot.set, cam = shot.cam;
    if (S !== lastSet) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; lastSet = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = FILL[S];
    hideAll(); cabin.cradle.visible = true; floorBooks.visible = false; woods.chips.visible = false;
    SC.set(abeKid, 0.62); abeKid.root.scale.setScalar(0.62);
    let track = null;

    if (S === 'cabin') {
      cabin.update(t); cabin.setExterior(cam === 'cabinExt' ? 1 : 0); cabin.stool.position.set(FD.cabin.stool[0], 0, FD.cabin.stool[1]);
      cabin.flakes.visible = cabin.smoke.visible = cam === 'cabinExt';
      if (cam === 'birth') birth(t);
      if (cam === 'reading') reading(t);
    } else if (S === 'woods') {
      if (cam === 'forest') { woods.setMode('summer', t); woods.setShadowFocus(0, 0, 8); forest(t); }
      if (cam === 'grave') { woods.setMode('autumn', t); woods.setShadowFocus(FD.woods.grave[0], FD.woods.grave[1], 8); grave(t); }
      if (cam === 'road') { woods.setMode('night', t); const p = road(t); woods.setShadowFocus(p[0], p[2], 10); track = p; }
    } else if (S === 'river') {
      river.update(t); riverShot(t, cam);
      river.lights.sun.target.position.set(boatX(t), 0, 0); river.lights.sun.position.set(boatX(t) - 30, 10, 14);
      track = cam === 'riverA' ? [boatX(t), 0, 0] : [abeYoung.root.position.x - OFF.river[0], abeYoung.root.position.y + 1.85, abeYoung.root.position.z];
    } else if (S === 'store') {
      storeShot(t);
    } else if (S === 'room') {
      room.rocker.position.set(CD.room.rocker[0], 0, CD.room.rocker[1]); room.rocker.rotation.set(0, -2.4, 0); room.setSign(0);
      if (cam === 'law') law(t);
      if (cam === 'electedA') elected(t);
      if (cam === 'beard') beard(t);
      if (cam === 'signingA' || cam === 'signingB') signing(t, cam);
      if (cam === 'dawn') dawn(t);
      room.flag.update(t * 0.2, 0.3);
    } else if (S === 'square') {
      square.update(t);
      if (cam.startsWith('debate')) debate(t, cam);
      if (cam.startsWith('gettys')) gettys(t, cam);
      if (cam === 'victory') victory(t);
    } else if (S === 'battle') {
      war(t);
    } else if (S === 'theatre') {
      theatreShot(t);
    } else if (S === 'memorial') {
      memorialShot(t);
    }

    // camera (local → world; track cameras ride on a subject)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.5 + u * 0.5;
    const o = OFF[S], base = c.track && track ? track : [0, 0, 0];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + base[i] + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + base[i] + o[i]);
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
