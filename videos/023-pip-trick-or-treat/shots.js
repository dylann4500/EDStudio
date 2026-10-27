// VIDEO 023 — "What if Pip went trick-or-treating?"  (Pip ep. 2 · lane 3 @ed._.sims · storybook tone, Halloween)
// 65.2 s, 15 shots. Mia (a witch) dresses Pip as a pumpkin that IS the candy bucket. Three doors, one gag each: he says his
// only word ("Boof.") and Mrs. Rosa empties her whole bowl into him; he boofs a giant inflatable cat flat; he tugs a porch
// skeleton's leg bone and the whole thing collapses (wrong kind of bone). House four never gives candy — the old man says
// "No candy." Pip thinks he means he doesn't HAVE any, so he shakes all of his candy out at the man's feet. Nobody had ever
// trick-or-treated him: he laughs, gives Pip the one treat he has (a dog biscuit bone), turns his porch light on for the
// first time and refills Pip to the brim. Home: Pip asleep on the candy pile with his bone. HUD = CANDY 0 → 28 → 0 → 41.
// Pip never eats candy (chocolate is toxic to dogs): the candy is Mia's; his treat is the dog biscuit.
// NEW (reusable): engine/halloween.js — dressHalloween(suburb) dusk street (sky + moon, autumn trees, porch steps, lanterns,
// jack-o'-lanterns, string lights, window glow, cobwebs, door hallway, per-house setLit), makePumpkinCostume(pip), candy heaps +
// flying candy, makeInflatableCat (setDeflate), makeSkeleton (setCollapse), makeBone, costume(rig, kind) for trick-or-treaters.
// Event times live in story.json → "pip" so make_cues.py syncs the foley to the same numbers.
//
// Sources (checked Oct 26, 2026):
//   chocolate is toxic to dogs (theobromine) — ASPCA Animal Poison Control, "People Foods to Avoid Feeding Your Pets"
//   calls to Pet Poison Helpline rise 12 % during Halloween week, its busiest time of year — petpoisonhelpline.com, "Halloween
//   Dangers to Dogs & Cats". A bone-shaped dog biscuit (not a real cooked bone, which vets warn can splinter) is Pip's treat.
//
// Shot list (seconds)                 | set    | what happens
//  0.0– 3.4 thumb   5:58 PM            | porch  | the question over Pip the pumpkin on his porch, a jack-o'-lantern glowing beside him
//  3.4– 8.9 costume                    | living | Mia (a witch) pops the pumpkin costume on him; he spins after his own stem; sits proud
//  8.9–11.9 street  6:00 PM            | street | the whole street lights up house by house; trick-or-treaters; Pip + Mia walk out
// 11.9–15.0 rules                      | street | close: Mia taps the pumpkin's open top (his job: carry), rubs her tummy (hers: eat)
// 15.0–18.4 door1A  HOUSE 1            | porch1 | Mia knocks; the door opens; Mrs. Rosa (cat ears) with a big bowl
// 18.4–22.4 door1B  (0 → 12)          | porch1 | "Boof." — she melts and tips the WHOLE bowl into him; the weight sits him down
// 22.4–28.0 cat     HOUSE 2 (→ 19)     | lawn2  | a 3.6 m inflatable cat; play bow; "Boof." — it slowly slumps flat; the vampire tosses candy
// 28.0–31.0 skelA   HOUSE 3            | porch3 | a skeleton hands out candy; two big kids grab and run; Pip trots up the steps
// 31.0–35.0 skelB   (→ 28)            | porch3 | he tugs its leg bone; the whole skeleton collapses, its bowl rains candy into him; Mia takes the bone
// 35.0–39.2 grumpA  HOUSE 4            | walk4  | the dark house with the NO CANDY sign; kids swerve into the street; Pip trots up alone
// 39.2–43.0 grumpB                     | porch4 | he scratches the door; the old man glares down: "No candy."
// 43.0–47.6 give    (28 → 0)          | porch4 | head tilt… then a wet-dog shake: every candy flies out at the old man's feet
// 47.6–52.2 bone                       | porch4 | the old man laughs, kneels, gives Pip a dog biscuit bone; tail at full speed
// 52.2–56.8 lights  (0 → 41)          | porch4 | house four lights up; kids run up the walk; he refills Pip to overflowing
// 56.8–65.2 home    8:00 PM            | living | Pip asleep on the candy pile hugging his bone, Mia sorting, Dad sneaking a bar. End card 61.0
import * as THREE from 'three';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeBunny } from '@engine/props.js';
import { buildLivingRoom, DIMS as LV } from '@engine/sets/livingroom.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { makePip, makeMia, makeDad, poseScaled, pulseAt } from '@engine/pip.js';
import { dressHalloween, makeJackOLantern, makeCandyHeap, makeFlyingCandy, makeCandyBowl, makeBone, makePumpkinCostume,
  makeInflatableCat, makeSkeleton, costume, makeSign, makeStringLights } from '@engine/halloween.js';

const PI = Math.PI;
const OFF = { sub: [0, 0, 0], liv: [3000, 0, 0] };
const LOT = [-32, -16, 0, 16, 32];                 // home, house 1..4 (suburb near-side lots)
const D = LOT.map((x) => x - 2.2);                  // front-door x of each
const PZ = -9;                                       // house front wall
const PIPS = 0.92;

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb', set: 'sub' },
  { t0: 3.4, t1: 8.9, cam: 'costume', set: 'liv' },
  { t0: 8.9, t1: 11.9, cam: 'street', set: 'sub' },
  { t0: 11.9, t1: 15.0, cam: 'rules', set: 'sub' },
  { t0: 15.0, t1: 18.4, cam: 'door1A', set: 'sub' },
  { t0: 18.4, t1: 22.4, cam: 'door1B', set: 'sub' },
  { t0: 22.4, t1: 25.3, cam: 'catA', set: 'sub' },
  { t0: 25.3, t1: 26.05, cam: 'catB', set: 'sub' },
  { t0: 26.05, t1: 28.0, cam: 'catC', set: 'sub' },
  { t0: 28.0, t1: 31.0, cam: 'skelA', set: 'sub' },
  { t0: 31.0, t1: 35.0, cam: 'skelB', set: 'sub' },
  { t0: 35.0, t1: 37.3, cam: 'grumpA', set: 'sub' },
  { t0: 37.3, t1: 39.2, cam: 'grumpA2', set: 'sub' },
  { t0: 39.2, t1: 43.0, cam: 'grumpB', set: 'sub' },
  { t0: 43.0, t1: 47.6, cam: 'give', set: 'sub' },
  { t0: 47.6, t1: 52.2, cam: 'bone', set: 'sub' },
  { t0: 52.2, t1: 54.9, cam: 'lightsA', set: 'sub' },
  { t0: 54.9, t1: 56.8, cam: 'lightsB', set: 'sub' },
  { t0: 56.8, t1: 70, cam: 'home', set: 'liv' },
];
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased across the shot)
const c = (p0, p1, a0, a1, fov, amp = 0.003) => ({ p: [p0, p1], a: [a0, a1], fov, amp });
export const CAMS = {
  thumb:   c([D[0] + 0.28, 0.72, -6.0], [D[0] + 0.27, 0.71, -6.1], [D[0] + 0.2, 0.92, -7.6], [D[0] + 0.2, 0.92, -7.6], 50, 0.002),
  costume: c([-0.7, 0.5, 2.0], [-0.74, 0.49, 1.88], [-0.6, 0.4, 0.3], [-0.6, 0.4, 0.3], 50),
  street:  c([LOT[0] + 16.0, 1.6, 2.6], [LOT[0] + 15.2, 1.52, 2.45], [LOT[0] - 30, 2.1, -1.2], [LOT[0] - 30, 2.0, -1.2], 52),
  rules:   c([LOT[0] + 5.15, 0.56, -0.28], [LOT[0] + 5.05, 0.54, -0.32], [LOT[0] + 3.2, 0.6, -0.98], [LOT[0] + 3.2, 0.58, -0.98], 46),
  door1A:  c([D[1] - 0.02, 0.61, -6.42], [D[1] - 0.06, 0.6, -6.58], [D[1] + 0.15, 1.2, -8.8], [D[1] + 0.15, 1.18, -8.8], 50),
  door1B:  c([D[1] + 1.9, 0.85, -7.7], [D[1] + 1.8, 0.83, -7.78], [D[1] - 0.05, 0.7, -8.35], [D[1] - 0.05, 0.68, -8.35], 50),
  catA:    c([-1.62, 0.42, -2.82], [-1.55, 0.41, -2.88], [0.55, 1.3, -4.7], [0.55, 1.45, -4.7], 58),
  catB:    c([-0.15, 0.34, -4.08], [-0.17, 0.34, -4.05], [-0.6, 0.3, -3.7], [-0.6, 0.3, -3.7], 50),
  catC:    c([2.5, 1.0, -0.6], [2.4, 0.98, -0.72], [0.0, 1.45, -4.2], [0.0, 1.35, -4.2], 58),
  skelA:   c([D[3] - 1.05, 0.63, -4.25], [D[3] - 1.0, 0.62, -4.45], [D[3] + 0.45, 1.0, -8.1], [D[3] + 0.45, 0.98, -8.1], 52),
  skelB:   c([D[3] + 1.95, 0.74, -7.52], [D[3] + 1.9, 0.72, -7.58], [D[3] + 0.5, 0.82, -8.1], [D[3] + 0.5, 0.78, -8.1], 54),
  grumpA:  c([D[4] + 1.15, 0.98, 3.45], [D[4] + 1.05, 0.95, 3.2], [D[4] - 0.5, 0.88, -6.0], [D[4] - 0.5, 0.85, -6.0], 48),
  grumpA2: c([D[4] + 0.15, 0.4, -2.75], [D[4] + 0.12, 0.4, -2.85], [D[4] - 0.05, 0.42, -0.9], [D[4] - 0.05, 0.42, -0.9], 48),
  grumpB:  c([D[4] + 0.89, 0.5, -6.88], [D[4] + 0.87, 0.5, -6.96], [D[4] - 0.07, 1.13, -8.6], [D[4] - 0.07, 1.13, -8.6], 54),
  give:    c([D[4] + 1.0, 0.45, -8.0], [D[4] + 0.95, 0.45, -8.04], [D[4] - 0.02, 0.5, -8.4], [D[4] - 0.02, 0.5, -8.4], 54),
  bone:    c([D[4] + 1.6, 0.9, -8.25], [D[4] + 1.45, 0.82, -8.32], [D[4] - 0.05, 1.4, -8.6], [D[4], 0.95, -8.5], 52),
  lightsA: c([D[4] + 0.7, 1.0, -0.6], [D[4] + 0.6, 0.97, -0.95], [D[4] - 0.1, 1.55, -8.4], [D[4] - 0.1, 1.5, -8.4], 54),
  lightsB: c([D[4] + 0.45, 0.76, -5.9], [D[4] + 0.42, 0.74, -6.05], [D[4] + 0.3, 1.0, -8.2], [D[4] + 0.3, 0.98, -8.2], 58),
  home:    c([-0.45, 0.8, 2.05], [-0.48, 0.76, 1.92], [-0.75, 0.34, 0.3], [-0.75, 0.32, 0.3], 50, 0.002),
  lineup:  c([0.4, 0.42, 1.5], [0.4, 0.42, 1.5], [0.4, 0.25, 0.5], [0.4, 0.25, 0.5], 38, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);
const HOLD_A = A(-1.0, 0.16, -0.85, 0.35), HOLD_B = A(-1.0, 0.16, -0.85, -0.35);           // a bowl in both hands
const LOW_A = A(-0.72, 0.14, -0.5, 0.28), LOW_B = A(-0.72, 0.14, -0.5, -0.28);              // a bowl held low, at the waist
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);            // aww
const HEART_B = A(-0.05, 0.2, -2.0, -0.9);
const KNOCK_B = A(-1.25, 0.12, -1.05, -0.25);
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);
const BELLY_A = A(-0.4, 0.18, -1.45, 0.7), BELLY_B = A(-0.4, 0.18, -1.45, -0.7);            // hands on the belly (laughing / yum)
const CHEER_A = A(-0.4, 2.5, -0.5, 0), CHEER_B = A(-0.4, 2.5, -0.5, 0);
const POINT_B = A(-1.45, 0.12, -0.05, -0.2);
const PAT_B = A(-1.15, 0.1, -0.55, -0.3);
const POCKET_B = A(0.05, 0.25, -1.1, -0.6);
const TOSS0 = A(0.7, 0.2, -0.6, -0.2), TOSS1 = A(-1.7, 0.2, -0.2, -0.2);
const WAND_B = A(-0.9, 0.25, -0.9, -0.3);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const KNEEL = { y: -0.47, footFwd: -0.33, lean: 0.18 };
const CROUCH = { crouch: 0.42, lean: 0.42 };
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- sets
  const sub = buildSuburb(studio, { poleClear: [...D, ...LOT.map((x) => x + 4.5), 58, -26, -38] });
  const subFog = sub.fog;
  const hw = dressHalloween(studio, sub, { dark: [4] });
  const liv = buildLivingRoom(studio, { home: true }); liv.root.position.set(...OFF.liv);
  const ROOTS = { sub: sub.root, liv: liv.root };
  const FAR = { sub: 420, liv: 40 };
  const groundY = hw.groundY;
  const W = (set, x, y, z) => new THREE.Vector3(x + OFF[set][0], y + OFF[set][1], z + OFF[set][2]);

  // living-room Halloween: a jack on the coffee table, two by the window, orange lights over the window
  for (const [x, z, r, y] of [[0.75, -0.42, 0.13, LV.coffeeTop], [-0.45, -2.35, 0.17, 0], [1.75, -2.4, 0.14, 0]]) { const J = makeJackOLantern({ r }); J.g.position.set(x, y, z); J.setLit(1); liv.root.add(J.g); }
  const livLights = makeStringLights([new THREE.Vector3(-0.75, 2.2, -2.72), new THREE.Vector3(1.55, 2.2, -2.72)], { sag: 0.2 }); livLights.setLit(1); liv.root.add(livLights.g);

  // ---------------------------------------------------------------- Pip + costume
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const suit = makePumpkinCostume(pip);
  const heap = suit.heap;
  const bunny = makeBunny(); bunny.scale.setScalar(1.25); scene.add(bunny);
  const held = new THREE.Group(); scene.add(held);   // the costume in Mia's hands before it pops on
  { const m = new THREE.MeshStandardMaterial({ color: 0xe8781e, roughness: 0.55 }); const b = mk(new THREE.SphereGeometry(0.125, 24, 16), m, held); b.scale.set(1.08, 0.9, 1.32); mk(new THREE.CylinderGeometry(0.01, 0.015, 0.05, 8), mat(0x6a5a2a, 0.8), held, 0, 0.12, 0); }

  // ---------------------------------------------------------------- people
  const mia = makeMia({ outfit: 'day' }); costume(mia, 'witch'); scene.add(mia.root);
  const wand = new THREE.Group(); mia.arms.find((a) => a.s === 1).hand.add(wand);
  { mk(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), mat(0x2a1a12, 0.5), wand, 0, -0.02, 0.12).rotation.x = PI / 2 - 0.4; const st = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 5), new THREE.MeshStandardMaterial({ color: 0xf2c14e, emissive: 0xf2a020, emissiveIntensity: 0.8 }), wand, 0, 0.06, 0.3); st.rotation.x = PI / 2; }
  const rosa = makePerson({ skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0xe07a2a, pants: 0x5a3a5a, shoes: 0x8a5a5a });
  costume(rosa, 'catEars'); rosa.kid = 1; scene.add(rosa.root);
  const vamp = makePerson({ skin: 0xf2dcc8, hair: 0x1a1416, hairStyle: 'short', top: 0x1a1a22, collar: 0xffffff, pants: 0x1a1a22, shoes: 0x111111, headR: 0.15 });
  costume(vamp, 'vampire'); vamp.root.scale.setScalar(0.9); vamp.kid = 0.9; scene.add(vamp.root);
  const old = makePerson({ skin: 0xe2b090, hair: 0xd8d4cc, hairStyle: 'none', glasses: true, mustache: 0xeeeae2, browColor: 0xeeeae2, top: 0x7a5a3a, pants: 0x5a5f66, shoes: 0x4a3a30 });
  old.kid = 1; scene.add(old.root);
  for (let i = 0; i < 4; i++) mk(new THREE.SphereGeometry(0.014, 8, 6), mat(0xe8d8b0, 0.4), old.spine, 0.01, 0.42 - i * 0.09, 0.13);
  const dad = makeDad({ outfit: 'day' }); scene.add(dad.root);
  // trick-or-treaters
  const KIDS = [
    { kind: 'ghost', s: 0.74, skin: 0xd9a27c, hair: 0x2a1a12 }, { kind: 'dino', s: 0.76, skin: 0x8d5a3b, hair: 0x1a1210 },
    { kind: 'hero', s: 0.64, skin: 0xf0c4a2, hair: 0xb8742a }, { kind: 'skeleton', s: 0.63, skin: 0xb5794f, hair: 0x1a1210 },
    { kind: 'witch', s: 0.6, skin: 0xf3d2b8, hair: 0xd8a040, o: { hat: 0x1a1a1a, band: 0x3fae6a, cape: 0x1a1a1a, lining: 0x3fae6a, top: 0x2a2a2a, pants: 0x3fae6a } },
    { kind: 'pumpkin', s: 0.58, skin: 0xe8b896, hair: 0x5a3a24 },
  ].map((k, i) => { const P = makePerson({ skin: k.skin, hair: k.hair, hairStyle: i % 2 ? 'short' : 'bob', headR: 0.17, top: 0x888888, pants: 0x555555, shoes: [0xe8e4dc, 0xd2483f, 0x3d7bd9][i % 3] }); costume(P, k.kind, k.o || {}); P.root.scale.setScalar(k.s); P.kid = k.s; scene.add(P.root); return P; });
  const CAST = [mia, rosa, vamp, old, dad, ...KIDS];

  // ---------------------------------------------------------------- props
  const flyer = makeFlyingCandy(scene, 90, 1.15, 5);
  const rosaBowl = makeCandyBowl({ r: 0.17, color: 0xf07a2a, n: 60, seed: 3 }); scene.add(rosaBowl.g);
  const cat = makeInflatableCat(); cat.g.position.set(LOT[2] + 0.6, 0, -4.7); cat.g.rotation.y = -0.2; sub.root.add(cat.g);
  const skel = makeSkeleton(); skel.g.position.set(D[3] + 0.75, 0.3, -8.35); skel.g.rotation.y = -0.2; sub.root.add(skel.g);
  const noSign = makeSign('NO CANDY', { w: 0.62, h: 0.42, stake: 0.42, lines: ['NO CANDY.', 'NO KNOCKING.'], font: 'bold 92px Georgia', bg: '#e9dcc0' });
  noSign.position.set(D[4] - 1.15, 0, -3.3); noSign.rotation.y = 0.35; sub.root.add(noSign);
  const bigBowl = makeCandyBowl({ r: 0.24, color: 0xf2b632, n: 90, seed: 41 }); scene.add(bigBowl.g);
  const bone = makeBone({ len: 0.15 }); scene.add(bone);
  const homePile = makeCandyHeap({ n: 70, r: 0.2, size: 1.45, seed: 61, layer: 0.016 }); homePile.mesh.position.set(-0.78 + OFF.liv[0], 0, 0.42); scene.add(homePile.mesh);
  // a hero jack-o'-lantern beside Pip on the home porch + warm glow lights we move per shot
  const heroJack = makeJackOLantern({ r: 0.16 }); heroJack.setLit(1); sub.root.add(heroJack.g); heroJack.g.position.set(D[0] + 0.02, 0.3, -7.42); heroJack.g.rotation.y = 0.35;
  const glowA = new THREE.PointLight(0xffa050, 0, 2.6, 1.8); scene.add(glowA);
  const glowB = new THREE.PointLight(0xffc080, 0, 4, 1.6); scene.add(glowB);

  // ---------------------------------------------------------------- helpers
  const put = (P, p, floor = 0) => {
    if (P.kid && P.kid !== 1) poseScaled(P, p, floor);
    else { applyPose(P, p); P.root.position.y = floor + (p.y || 0); }
  };
  const placePip = (x, y, z, rotY) => { pip.g.position.set(x, y, z); pip.g.rotation.set(0, rotY, 0); };
  const pipAt = (set, x, z, rotY, st, t, dy = 0) => { const y = set === 'sub' ? groundY(x, z) : 0; const w = W(set, x, y + dy, z); placePip(w.x, w.y, w.z, rotY); pip.update(t, st); };
  const backW = () => { pip.g.updateMatrixWorld(true); return suit.shell.localToWorld(new THREE.Vector3(0, 0.12, -0.035)); };
  const walkP = (t, start, legs) => walkLegs(t, start, legs);
  const person = (P, o, floor) => { const p = basePose(); Object.assign(p, o); P.root.visible = true; put(P, p, floor); return p; };
  // ballistic flight: from a → b between t0 and t0+dur, arc h
  const fly = (i, a, b, t0, dur, h, t, spin = 1, vanish = false) => {
    if (t < t0) { flyer.hide(i); return false; }
    const u = clamp((t - t0) / dur), p = new THREE.Vector3().lerpVectors(a, b, u); p.y += h * 4 * u * (1 - u);
    if (vanish && u >= 1) { flyer.hide(i); return true; }      // landed in the heap (the heap mesh shows it now)
    flyer.place(i, p, (u < 1 ? (t - t0) * 9 * spin : dur * 9 * spin)); return u >= 1;
  };
  const between2 = (P) => handWorld(P, -1).add(handWorld(P, 1)).multiplyScalar(0.5);

  function suburbLook(cx, cz, half = 10) {
    scene.fog = subFog; scene.fog.color.set(0x4a3f6a); scene.fog.near = 30; scene.fog.far = 190;
    hw.aimSun(cx, cz, half);
  }
  function livLook() {
    scene.fog = null;
    const L = liv.lights; liv.setDawn(0); L.hemi.intensity = 0.85; L.lampL.intensity = 2.6; L.pend.intensity = 1.8; L.fillL.intensity = 1.6; L.fillD.intensity = 1.2;
    liv.setConsole(1); liv.setNightlight(0.6); liv.setUpstairs(0.4);
  }
  const allLit = (except = [4]) => hw.houses.forEach((h, i) => h.setLit(except.includes(i) ? 0 : 1));

  // ---------------------------------------------------------------- update
  let cur = null;
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', set: 'liv', t0: 200, t1: 300 } : shotAt(t), Sx = shot.set, cam = shot.cam;
    if (Sx !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === Sx; cur = Sx; }
    studio.camera.far = FAR[Sx]; studio.camera.near = 0.03; studio.fill.intensity = story.look.fill; studio.camera.updateProjectionMatrix();

    const C = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[Sx];
    let P = C.p[0].map((v, i) => lerp(v, C.p[1][i], e) + o[i]);
    const Aim = C.a[0].map((v, i) => lerp(v, C.a[1][i], e) + o[i]);
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(EV.collapse, 0.012); jolt(EV.deflate[0] + 0.68, 0.014);

    // reset
    CAST.forEach((R) => (R.root.visible = false));
    [bunny, held, rosaBowl.g, bigBowl.g, bone].forEach((g) => (g.visible = false));
    flyer.hideAll(); homePile.mesh.visible = false;
    glowA.intensity = 0; glowB.intensity = 0;
    pip.g.visible = true; suit.setOn(1); heap.setFill(0); pip.g.rotation.set(0, 0, 0);
    if (bone.parent !== scene) scene.add(bone);
    bone.scale.setScalar(1); bone.rotation.set(0, 0, 0);
    if (skel.legBone.p.parent !== skel.g) { skel.g.add(skel.legBone.p); }
    skel.legBone.taken = false; skel.legBone.p.scale.setScalar(1);
    skel.setCollapse(0, t); skel.legBone.p.position.copy(skel.legBone.stand.p); skel.legBone.p.rotation.copy(skel.legBone.stand.r);
    skel.bowl.g.rotation.set(0, 0, 0); skel.bowl.g.position.set(-0.12, 1.0, 0.36); skel.bowl.heap.setFill(40);
    cat.setDeflate(0, t); cat.update(t);
    hw.houses.forEach((h, i) => hw.setDoorOpen(i, 0));
    mia.capeG && (mia.capeG.rotation.x = 0);

    if (Sx === 'sub') suburbLook(Aim[0], Aim[2], 9); else livLook();
    if (cam === 'lineup') { lineup(t); setCamera(P, Aim, C.fov, t, C.amp); return; }
    BEATS[cam](t, u);
    flyer.commit();
    setCamera(P, Aim, C.fov, t, C.amp); studio.camera.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) {
      allLit();
      pipAt('sub', D[0] + 0.32, -7.62, 0.5, { sit: 1, ears: 1, headYaw: -0.4, tilt: K(t, [[0, 0.0], [1.0, 0.28], [2.4, 0.28], [3.2, -0.12]]), wag: 0.6, wagRate: 3.5, lookY: 0.5, headPitch: -0.12, eyes: 'open' }, t);
      glowA.position.set(D[0] + 0.05, 0.6, -7.15); glowA.intensity = 1.6;
    },
    costume(t) {
      // Mia kneels on the rug holding the costume up; it pops onto Pip; he spins after his own stem; sits proud
      const T0 = EV.costume, on = pop(t, T0);
      const px = -0.75, pz = 0.55;
      const spin = clamp((t - 5.3) / 1.75), ang = spin > 0 && spin < 1 ? smooth(spin) * PI * 4 : spin >= 1 ? PI * 4 : 0;
      const sitK = t < T0 ? 1 : t < 5.25 ? 0.6 : t < 7.1 ? 0 : smooth((t - 7.1) / 0.3);
      const cx = px + Math.sin(ang) * 0.07 * (spin > 0 && spin < 1 ? 1 : 0), cz = pz + (1 - Math.cos(ang)) * 0.05 * (spin > 0 && spin < 1 ? 1 : 0);
      pipAt('liv', cx, cz, 0.15 + ang, {
        sit: sitK, run: spin > 0 && spin < 1 ? 1 : 0, dist: (t - 5.3) * 1.4, ears: 1, wag: t > 7.2 ? 1 : 0.6, wagRate: 5,
        headYaw: spin > 0 && spin < 1 ? -0.6 : t > T0 && t < 5.3 ? -0.5 * smooth((t - T0 - 0.1) / 0.3) : 0, headPitch: t > 7.3 ? -0.15 : -0.05,
        eyes: t > 7.5 ? 'happy' : t > T0 && t < 5.3 ? 'wide' : 'open', mouth: t > 7.3 ? 'pant' : t > T0 && t < 5.3 ? 'o' : 'smile', tilt: t < T0 ? K(t, [[3.4, 0], [4.0, 0.3]]) : 0,
      }, t);
      suit.setOn(t < T0 ? 0 : Math.max(0.001, on));
      const p = person(mia, { x: -0.38 + OFF.liv[0], z: 0.2, rotY: faceToward(-0.38, 0.2, px, pz), ...KNEEL, eyes: blink(t, 2), smile: 1, headPitch: 0.35 }, 0);
      if (t < T0) { p.armA = HOLD_A; p.armB = HOLD_B; p.lean = 0.3 + 0.25 * smooth((t - 3.9) / 0.6); }
      else if (t < 5.2) { p.armA = REACH_A; p.armB = REACH_B; p.lean = 0.5; }
      else { p.armA = CHEEK_A; p.armB = CHEEK_B; p.mouth = t < 6.6 ? 'o' : 'smile'; p.headRoll = 0.12 * Math.sin(t * 6) * (t < 7 ? 1 : 0); p.lean = 0.25; }
      put(mia, p, 0); wand.visible = false;
      if (t < T0) { held.visible = true; held.position.copy(between2(mia)).add(new THREE.Vector3(0, 0.02, 0)); held.rotation.set(0, mia.root.rotation.y, 0); }
      glowA.position.set(-0.45 + OFF.liv[0], 0.5, 0.9); glowA.intensity = 0.8;
    },
    street(t) {
      // the street lights up house by house, nearest first, rolling away down the road
      const order = hw.houses.map((h, i) => [i, Math.abs(h.x - (LOT[0] + 12))]).sort((p, q) => p[1] - q[1]).map((p) => p[0]);
      order.forEach((i, r) => { const h = hw.houses[i]; if (i === 4) return h.setLit(0); h.setLit(clamp((t - 9.1 - r * 0.16) / 0.15)); });
      // Pip + Mia come down their walk onto the sidewalk
      const w = walkP(t, [D[0], -5.0], [{ t0: 8.9, t1: 10.6, pts: [[D[0], -1.0]] }, { t0: 10.6, t1: 11.9, pts: [[D[0] + 2.0, -1.0]] }]);
      pipAt('sub', w.x, w.z, w.head ?? 0, { walk: 1, dist: w.dist, wag: 0.9, wagRate: 4.5, ears: 1, mouth: 'pant' }, t);
      const m = walkP(t, [D[0] - 0.4, -5.6], [{ t0: 8.9, t1: 10.7, pts: [[D[0] - 0.4, -1.4]] }, { t0: 10.7, t1: 11.9, pts: [[D[0] + 1.5, -1.4]] }]);
      person(mia, { x: m.x, z: m.z, rotY: m.head ?? 0, dist: m.dist, speed: m.speed, eyes: blink(t, 2), smile: 1, armB: WAND_B }, groundY(m.x, m.z)); wand.visible = true;
      // trick-or-treaters walk up the road toward us + along both sidewalks
      const kidWalk = (P, i, x0, z0, x1, z1, t0, t1) => { const k = walkP(t, [x0, z0], [{ t0, t1, pts: [[x1, z1]] }]); person(P, { x: k.x, z: k.z, rotY: k.head ?? 0, dist: k.dist, speed: k.speed, eyes: blink(t, i), smile: 1, armA: i % 2 ? A(-0.3, 0.2, -1.2, 0.4) : REST }, k.z > 7 && k.z < 9 ? 0.12 : groundY(k.x, k.z)); };
      kidWalk(KIDS[2], 2, LOT[0] + 4, 2.4, LOT[0] + 9, 2.0, 8.9, 12.6); kidWalk(KIDS[3], 3, LOT[0] + 3.2, 3.1, LOT[0] + 8.2, 2.7, 8.9, 12.6);
      kidWalk(KIDS[4], 4, LOT[0] - 1, 4.6, LOT[0] + 3, 4.4, 8.9, 12.4); kidWalk(KIDS[5], 5, LOT[0] - 1.8, 5.2, LOT[0] + 2.2, 5.0, 8.9, 12.4);
      kidWalk(KIDS[0], 0, LOT[0] - 6, 8.2, LOT[0] - 1, 8.2, 8.9, 13.0); kidWalk(KIDS[1], 1, LOT[0] - 7, -0.6, LOT[0] - 2.5, -0.6, 8.9, 13.0);
    },
    rules(t) {
      allLit();
      const px = LOT[0] + 3.3, pz = -0.8;
      const tap = pulseAt(t, [12.45, 12.85], 0.18), yum = smooth((t - 13.7) / 0.35);
      pipAt('sub', px, pz, PI / 2 - 0.35, { sit: smooth((t - 11.95) / 0.3), ears: 1, wag: 1, wagRate: 4.5, headYaw: K(t, [[11.9, 0], [12.3, -0.75], [13.6, -0.75], [14.0, 0.3], [15.0, 0.3]]), headPitch: K(t, [[11.9, 0], [12.3, -0.35], [13.6, -0.35], [14.0, -0.1]]), tilt: K(t, [[13.9, 0], [14.3, 0.3]]), eyes: tap > 0.3 ? 'happy' : 'open', mouth: 'pant' }, t);
      heap.setFill(0);
      const p = person(mia, { x: px - 0.15, z: pz - 0.5, rotY: 0.65, ...CROUCH, crouch: 0.48, lean: 0.38, eyes: blink(t, 2), smile: 1, headPitch: 0.25 + 0.1 * (1 - yum), headYaw: 0.1 }, groundY(px, pz));
      p.armB = mixArm(mixArm(REST, PAT_B, smooth((t - 12.0) / 0.35)), REST, yum); p.armB.el -= 0.25 * tap;
      p.armA = mixArm(REST, BELLY_A, yum); p.mouth = yum > 0.5 && (t % 0.5) < 0.25 ? 'o' : 'smile';
      put(mia, p, groundY(px, pz)); wand.visible = false;
      // kids pass behind
      const k = walkP(t, [LOT[0] + 9, -1.5], [{ t0: 11.9, t1: 15.0, pts: [[LOT[0] - 2, -1.5]] }]);
      person(KIDS[2], { x: k.x, z: k.z, rotY: k.head ?? 0, dist: k.dist, speed: k.speed, eyes: blink(t, 5), smile: 1 }, 0.12);
    },
    door1A(t) {
      allLit();
      const open = K(t, [[EV.door1, 0], [EV.door1 + 0.5, 1.45]]); hw.setDoorOpen(1, open);
      pipAt('sub', D[1] - 0.12, -8.12, PI, { sit: smooth((t - 16.6) / 0.3), ears: 1, headPitch: K(t, [[15.0, 0], [16.3, -0.45]]), wag: t > 16.2 ? 1 : 0.5, wagRate: 5, eyes: 'open' }, t);
      heap.setFill(0);
      const knock = pulseAt(t, EV.knock, 0.08, 0.04, 0.12);
      const p = person(mia, { x: D[1] + 0.38, z: -8.22, rotY: PI, eyes: blink(t, 2), smile: 1, headPitch: K(t, [[15.0, 0], [16.4, -0.25]]) }, 0.3);
      p.armB = t < 15.9 ? mixArm(REST, KNOCK_B, smooth((t - 15.0) / 0.2)) : mixArm(KNOCK_B, WAND_B, smooth((t - 15.9) / 0.4)); p.armB.el -= 0.5 * knock;
      put(mia, p, 0.3); wand.visible = true;
      // Mrs. Rosa steps into the doorway with the bowl
      if (t > EV.door1 + 0.2) {
        const st = smooth((t - EV.door1 - 0.2) / 0.6), bend = smooth((t - 17.0) / 0.6);
        const pr = person(rosa, { x: D[1] + 0.02, z: lerp(-8.86, -8.68, st), rotY: 0, eyes: blink(t, 4), smile: 1, armA: LOW_A, armB: LOW_B, lean: 0.06 + 0.32 * bend, crouch: 0.06 * bend, headPitch: 0.15 + 0.35 * bend, mouth: t > 17.2 ? 'o' : 'smile' }, 0.3);
        rosaBowl.g.visible = true; rosaBowl.g.position.copy(between2(rosa)).add(new THREE.Vector3(0, -0.06, 0.05)); rosaBowl.heap.setFill(60);
      }
      glowA.position.set(D[1] + 0.1, 0.8, -7.6); glowA.intensity = 0.7;
    },
    door1B(t) {
      allLit(); hw.setDoorOpen(1, 1.45);
      const bark = EV.barks[0], pour = EV.pour, sitK = smooth((t - 20.6) / 0.35);
      const bk = pulseAt(t, [bark], 0.22, 0.05, 0.2);
      pipAt('sub', D[1] + 0.2, -8.0, PI - 0.55, { sit: Math.max(0.15, sitK), ears: 1, headPitch: -0.35 + 0.15 * sitK, mouth: bk > 0.1 ? 'open' : 'pant', open: bk > 0.1 ? 0.55 * bk : undefined, hop: 0.03 * bk, wag: 1, wagRate: 5.5, eyes: t > 21.0 ? 'happy' : 'open', lookY: 0.4 }, t);
      const fill = Math.round(12 * clamp((t - pour[0] - 0.25) / (pour[1] - pour[0])));
      heap.setFill(fill);
      // Rosa crouches: aww → tips the whole bowl over him
      const aww = smooth((t - 18.8) / 0.3) * (1 - smooth((t - 19.6) / 0.3)), tip = smooth((t - pour[0]) / 0.5);
      const pr = person(rosa, { x: D[1] - 0.25, z: -8.62, rotY: 0.68, ...CROUCH, crouch: 0.3, lean: 0.42, eyes: aww > 0.5 ? 'closed' : blink(t, 4), smile: 1, headPitch: 0.4, mouth: aww > 0.2 ? 'o' : 'smile' }, 0.3);
      pr.armA = aww > 0 ? mixArm(LOW_A, CHEEK_A, aww) : mixArm(LOW_A, REACH_A, tip); pr.armB = aww > 0 ? mixArm(LOW_B, CHEEK_B, aww) : mixArm(LOW_B, REACH_B, tip);
      put(rosa, pr, 0.3);
      rosaBowl.g.visible = true;
      const bp = aww > 0.05 ? new THREE.Vector3(D[1] - 0.05, 0.62, -8.42) : between2(rosa).add(new THREE.Vector3(0, -0.05, 0.04));
      rosaBowl.g.position.copy(bp); rosaBowl.g.rotation.set(1.35 * tip, 0.3, 0);
      rosaBowl.heap.setFill(60 - 40 * clamp((t - pour[0]) / (pour[1] - pour[0])));
      // the candy stream from the bowl lip into the pumpkin
      const back = backW(), lip = rosaBowl.g.localToWorld(new THREE.Vector3(0, 0.1, 0.16));
      for (let i = 0; i < 26; i++) {
        const t0 = pour[0] + 0.3 + i * 0.045, from = lip.clone().add(new THREE.Vector3((i % 3 - 1) * 0.03, 0, 0));
        if (i % 2 === 0) fly(i, from, back.clone().add(new THREE.Vector3(((i * 37) % 7 - 3) * 0.012, 0, ((i * 13) % 5 - 2) * 0.012)), t0, 0.32, 0.05, t, 1, true);
        else fly(i, from, new THREE.Vector3(D[1] + 0.2 + Math.sin(i * 2.3) * 0.34, 0.31, -8.0 + Math.cos(i * 1.7) * 0.28), t0, 0.5, 0.12, t);
      }
      // kids pass on the sidewalk behind
      [2, 3].forEach((i, j) => { const k = walkP(t, [D[1] - 5 + j, -1.2 - j * 0.4], [{ t0: 18.4, t1: 22.4, pts: [[D[1] + 6 + j, -1.2 - j * 0.4]] }]); person(KIDS[i], { x: k.x, z: k.z, rotY: k.head ?? 0, dist: k.dist, speed: k.speed, eyes: blink(t, i), smile: 1 }, 0.12); });
      glowA.position.set(D[1] + 0.3, 0.9, -8.6); glowA.intensity = 1.6;
    },
    catA(t) { BEATS.cat(t, 'A'); },
    catB(t) { BEATS.cat(t, 'B'); },
    catC(t) { BEATS.cat(t, 'C'); },
    cat(t, view) {
      allLit();
      const bark = EV.barks[1], [d0, d1] = EV.deflate, dk = clamp((t - d0) / (d1 - d0));
      cat.setDeflate(dk * dk * (3 - 2 * dk), t);
      // Pip walks up the path, turns to the cat, looks way up, play-bows, boofs; then hops proud
      const w = walkP(t, [D[2] + 0.2, -2.4], [{ t0: 22.4, t1: 23.5, pts: [[-0.6, -3.7]] }]);
      const face = faceToward(-0.6, -3.7, LOT[2] + 0.6, -4.7);
      const turn = smooth((t - 23.4) / 0.4), bow = smooth((t - 24.2) / 0.3) * (1 - smooth((t - 25.25) / 0.2));
      const bk = pulseAt(t, [bark], 0.22, 0.05, 0.2), proud = smooth((t - 27.3) / 0.2);
      const hopK = t > 27.6 && t < 28.0 ? Math.abs(Math.sin((t - 27.6) * PI * 3.2)) * 0.05 : 0;
      const vic = walkP(t, [-0.6, -3.7], [{ t0: 27.05, t1: 27.6, pts: [[0.6, -2.55]] }]);
      const won = t > 27.05, px = won ? vic.x : w.x, pz = won ? vic.z : w.z;
      pipAt('sub', px, pz, won ? (t < 27.6 ? (vic.head ?? face) : faceToward(0.6, -2.55, 2.4, -0.7)) : lerp(w.head ?? face, face, turn), {
        walk: t < 23.5 || (won && t < 27.6) ? 1 : 0, dist: won ? vic.dist : w.dist, lean: 0.38 * bow, ears: 1, wag: t < 24.0 ? 0.6 : 1, wagRate: bow > 0.3 ? 6 : 5,
        headPitch: (view === 'B' ? -0.3 : lerp(0, -0.75, turn) * (1 - 0.5 * proud)) + 0.25 * bow, lookY: turn, eyes: t > 24.0 && t < 25.3 ? 'wide' : proud > 0.5 ? 'happy' : 'open',
        mouth: bk > 0.1 ? 'open' : proud > 0.5 ? 'pant' : 'smile', open: bk > 0.1 ? 0.55 * bk : undefined, hop: 0.03 * bk + hopK, tilt: t > 23.9 && t < 24.3 ? 0.3 : 0,
      }, t);
      const toss = EV.toss, landT = toss + 0.5;
      heap.setFill(12 + Math.round(7 * clamp((t - landT) / 0.3)));
      if (t < landT) heap.setFill(12);
      // the vampire (the cat's owner) stands behind it — revealed when it slumps — laughs and tosses a handful
      if (view === 'B') { wand.visible = false; const m = person(mia, { x: -2.0, z: -2.6, rotY: face, eyes: blink(t, 2), smile: 1, headPitch: -0.3, mouth: bk > 0.2 ? 'o' : 'smile', armA: CHEEK_A, armB: CHEEK_B }, groundY(-2.65, -2.45)); }
      const laugh = t > 26.6 ? 1 : 0;
      const v = person(vamp, { x: -0.25, z: -6.0, rotY: 0.6, eyes: blink(t, 6), smile: 1, headPitch: 0.15 - 0.25 * laugh, mouth: laugh && t < 27.1 ? 'o' : 'smile' }, 0.005);
      v.armA = laugh ? BELLY_A : REST; v.armB = t > toss - 0.3 ? mixArm(TOSS0, TOSS1, smooth((t - toss + 0.3) / 0.35)) : laugh ? BELLY_B : REST; v.lean = laugh ? 0.12 * Math.sin(t * 14) - 0.05 : 0.03;
      put(vamp, v, 0.005);
      if (t > toss) { const hb = handWorld(vamp, 1), back = backW(); for (let i = 0; i < 7; i++) fly(40 + i, hb.clone().add(new THREE.Vector3(i * 0.02, 0, 0)), back.clone().add(new THREE.Vector3((i % 3 - 1) * 0.02, 0, (i % 2) * 0.02)), toss + i * 0.02, 0.5, 1.2, t, 1, true); }
      glowA.position.set(-0.3, 0.6, -3.1); glowA.intensity = 1.0;
    },
    skelA(t) {
      allLit();
      // the skeleton's bowl empties as two big kids grab double handfuls and run off
      skel.bowl.heap.setFill(40 - Math.round(12 * clamp((t - 28.2) / 1.0)));
      skel.g.rotation.z = 0.015 * Math.sin(t * 2.2);
      const runAway = (P, i, x0, z0, t0, path) => { const k = walkP(t, [x0, z0], [{ t0, t1: t0 + 1.6, pts: path }]); const p = person(P, { x: k.x, z: k.z, rotY: k.head ?? PI, dist: k.dist, speed: k.speed * 1.4, eyes: blink(t, i), smile: 1, armA: A(-1.1, 0.2, -1.2, 0.5), armB: A(-1.1, 0.2, -1.2, -0.5), mouth: 'o' }, groundY(k.x, k.z)); return p; };
      if (t < 29.3) { [[0, D[3] + 0.25, -8.0], [1, D[3] + 0.95, -7.75]].forEach(([i, x, z]) => { const grab = pulseAt(t, [28.25 + i * 0.25, 28.75 + i * 0.25], 0.18); person(KIDS[i], { x, z, rotY: faceToward(x, z, D[3] + 0.63, -8.0), eyes: blink(t, i), smile: 1, lean: 0.15, armA: mixArm(REST, REACH_A, grab), armB: mixArm(A(-1.1, 0.2, -1.2, -0.5), REACH_B, grab) }, 0.3); }); }
      else { runAway(KIDS[0], 0, D[3] + 0.25, -8.0, 29.3, [[D[3] + 0.0, -6.3], [D[3] + 1.6, -4.3]]); runAway(KIDS[1], 1, D[3] + 0.95, -7.75, 29.45, [[D[3] + 0.6, -6.3], [D[3] + 2.3, -4.8]]); }
      const w = walkP(t, [D[3], -5.3], [{ t0: 28.3, t1: 30.6, pts: [[D[3] + 0.05, -6.6], [D[3] + 0.55, -7.85]] }]);
      pipAt('sub', w.x, w.z, w.head ?? PI, { walk: t < 30.7 ? 1 : 0, dist: w.dist, ears: 1, wag: 0.9, wagRate: 4.5, headPitch: t > 30.4 ? -0.5 : -0.2, lookY: 0.6, eyes: 'open', mouth: 'pant' }, t);
      heap.setFill(19);
      glowA.position.set(D[3] + 0.4, 1.0, -7.5); glowA.intensity = 1.2;
    },
    skelB(t) {
      allLit();
      const [tg0, tg1] = EV.tug, col = clamp((t - EV.collapse) / 0.9);
      // Pip sniffs the skeleton's leg bone, bites it, tugs — the leg comes free and the whole skeleton collapses
      const tug = smooth((t - tg0) / 0.35), back = smooth((t - tg1) / 0.25) * 0.1, tugWob = t > tg0 && t < tg1 + 0.2 ? 0.05 * Math.sin(t * 40) : 0;
      const sad = smooth((t - 34.35) / 0.3);
      pipAt('sub', D[3] + 0.6, -8.1 + 0.05 * tug + back, PI - 0.08, {
        ears: 1 - 0.55 * sad, sniff: t < tg0 ? 1 : 0, headPitch: t < tg0 ? 0.05 : -0.05 - 0.35 * smooth((t - 33.8) / 0.3), lean: -0.18 * tug * (1 - smooth((t - tg1) / 0.3)) + tugWob,
        mouth: t > tg0 - 0.1 && t < 34.25 ? 'open' : sad > 0.3 ? 'smile' : 'pant', open: t > tg0 - 0.1 && t < 34.25 ? 0.16 : undefined,
        wag: t < 34.3 ? 1 : 0.15, wagRate: 5.5, sit: smooth((t - 34.4) / 0.3), sad: 0.55 * sad, eyes: t > tg1 && t < 33.6 ? 'wide' : sad > 0.4 ? 'sad' : 'open', lookY: 0.5 * sad, tailDown: 0.4 * sad,
      }, t);
      skel.setCollapse(col, t); skel.g.rotation.z = t < EV.collapse ? 0.03 * Math.sin(t * 30) * tug : 0;
      // the bowl tips over him: candy rains into his pumpkin (19 → 28)
      const tip = smooth((t - EV.collapse) / 0.35);
      skel.bowl.g.position.set(-0.12, lerp(1.0, 0.1, smooth((t - EV.collapse - 0.25) / 0.5)), lerp(0.36, 0.62, tip)); skel.bowl.g.rotation.set(2.2 * tip, 0, 0.3 * tip);
      skel.bowl.heap.setFill(28 - 28 * tip);
      const [r0, r1] = EV.rain;
      heap.setFill(19 + Math.round(9 * clamp((t - r0 - 0.25) / (r1 - r0))));
      if (t > r0) { const back = backW(), lip = skel.bowl.g.localToWorld(new THREE.Vector3(0, 0.08, 0.14)); for (let i = 0; i < 20; i++) { const t0 = r0 + i * 0.04; if (i < 9) fly(i, lip, back.clone().add(new THREE.Vector3((i % 3 - 1) * 0.015, 0, 0)), t0, 0.3, 0.02, t, 1, true); else fly(i, lip, new THREE.Vector3(D[3] + 0.6 + Math.sin(i * 1.9) * 0.4, 0.31, -8.0 + Math.cos(i * 2.7) * 0.3), t0, 0.45, 0.08, t); } }
      // the leg bone: in the skeleton → in Pip's mouth → in Mia's hand
      const LB = skel.legBone;
      if (t > tg1 && t < 34.25) { LB.taken = true; pip.anchors.mouth.add(LB.p); LB.p.position.set(0, -0.005, 0.015); LB.p.rotation.set(0, 0, PI / 2); LB.p.scale.setScalar(1 / PIPS); }
      // Mia crouches in and takes it
      const inK = smooth((t - 33.3) / 0.6);
      const p = person(mia, { x: lerp(D[3] - 0.45, D[3] - 0.05, inK), z: lerp(-7.7, -7.95, inK), rotY: PI / 2 + 0.3, ...CROUCH, crouch: 0.4 * inK, lean: 0.12 + 0.3 * inK, eyes: blink(t, 2), smile: 1, headPitch: 0.3, mouth: t > 34.5 ? 'smile' : 'flat', headYaw: t > 34.4 ? 0.25 * Math.sin(t * 9) : 0 }, 0.3);
      p.armB = t < 34.25 ? mixArm(REST, REACH_B, smooth((t - 33.7) / 0.4)) : mixArm(REACH_B, A(-0.3, 0.6, -1.9, -0.3), smooth((t - 34.25) / 0.3));
      put(mia, p, 0.3); wand.visible = false;
      if (t >= 34.25) { LB.taken = true; mia.arms.find((a) => a.s === 1).hand.add(LB.p); LB.p.position.set(0, -0.05, 0.02); LB.p.rotation.set(0, 0, 0.4); LB.p.scale.setScalar(1 / 0.68); }
      if (LB.taken) skel.setCollapse(col, t);
      glowA.position.set(D[3] + 0.9, 0.9, -7.6); glowA.intensity = 1.4;
    },
    grumpA(t) { grump(t, false); },
    grumpA2(t) { grump(t, true); },
    grumpB(t) {
      allLit();
      const open = K(t, [[EV.door4, 0], [EV.door4 + 0.6, 1.4]]); hw.setDoorOpen(4, open);
      const scr = pulseAt(t, EV.scratch, 0.1, 0.04, 0.12);
      pipAt('sub', D[4] + 0.12, -8.42, PI - 0.1, { beg: 0.55 * (t < EV.door4 ? 1 : 0) * (0.6 + 0.4 * scr), lean: t < EV.door4 ? -0.05 : 0, sit: t > EV.door4 + 0.3 ? 1 : 0, ears: 1, headPitch: t > EV.door4 ? -0.6 : -0.25, lookY: 1, wag: 0.8, wagRate: 4.5, tilt: K(t, [[41.6, 0], [42.0, 0.32]]), eyes: 'open', mouth: 'smile' }, t);
      heap.setFill(28);
      if (t > EV.door4 + 0.15) {
        const st = smooth((t - EV.door4 - 0.15) / 0.5);
        const p = person(old, { x: D[4] - 0.08, z: lerp(-8.88, -8.74, st), rotY: 0.08, eyes: blink(t, 5), smile: 0, mouth: 'flat', headPitch: 0.5, armA: CROSS_A, armB: CROSS_B, glasses: true }, 0.3);
        old.head.brows.forEach((b, i) => (b.rotation.z = (i ? 1 : -1) * 0.35));
      }
      glowA.position.set(D[4] + 0.4, 1.0, -8.0); glowA.intensity = 0.9;
    },
    give(t) {
      allLit(); hw.setDoorOpen(4, 1.4);
      const [s0, s1] = EV.shake, sk = smooth((t - s0) / 0.12) * (1 - smooth((t - s1 + 0.15) / 0.15));
      pipAt('sub', D[4] + 0.12, -8.25, PI - 0.15, {
        sit: t < 45.7 || t > s1 + 0.1 ? 1 : 0, ears: t > s0 && t < s1 ? 0.6 + 0.4 * Math.sin(t * 40) : 1, headPitch: -0.5, lookY: 1,
        tilt: K(t, [[43.3, 0], [43.7, 0.35], [44.5, 0.35], [44.9, -0.3], [45.6, -0.3], [45.8, 0]]), eyes: t > s0 && t < s1 ? 'closed' : t > s1 ? 'happy' : 'open',
        mouth: t > s1 ? 'pant' : 'smile', wag: t > s1 ? 1 : 0.6, wagRate: 5.5, headYaw: 0.4 * sk * Math.sin(t * 38),
      }, t);
      pip.g.rotation.z = 0.38 * sk * Math.sin(t * 2 * PI * 7);
      const left = clamp((t - s0 - 0.05) / 0.8);
      heap.setFill(Math.round(28 * (1 - left)));
      // every candy flies out — to the porch around the old man's feet
      const back = new THREE.Vector3(D[4] + 0.12, 0.42, -8.28);
      for (let i = 0; i < 28; i++) { const a = (i / 28) * PI * 2 + i * 0.37, rr = 0.18 + ((i * 7) % 5) * 0.05; const land = new THREE.Vector3(D[4] - 0.08 + Math.cos(a) * rr * 1.3, 0.31, -8.55 + Math.sin(a) * rr * 0.7); fly(i, back.clone().add(new THREE.Vector3(Math.sin(i) * 0.03, 0, Math.cos(i) * 0.03)), land, s0 + 0.05 + i * 0.028, 0.5, 0.35 + (i % 3) * 0.1, t, i % 2 ? 1 : -1); }
      const sur = smooth((t - s0 - 0.2) / 0.2);
      const p = person(old, { x: D[4] - 0.08, z: -8.72, rotY: 0.15, eyes: blink(t, 5), smile: 0, mouth: sur > 0.5 ? 'o' : 'flat', headPitch: 0.5 + 0.1 * sur, lean: 0.03 - 0.08 * sur * (1 - smooth((t - 46.9) / 0.3)), glasses: true }, 0.3);
      p.armA = mixArm(CROSS_A, A(0.1, 0.45, -0.4, 0.2), sur); p.armB = mixArm(CROSS_B, A(0.1, 0.45, -0.4, -0.2), sur);
      put(old, p, 0.3);
      old.head.brows.forEach((b, i) => (b.rotation.z = (i ? 1 : -1) * lerp(0.35, -0.2, sur)));
      glowA.position.set(D[4] + 0.6, 0.9, -8.0); glowA.intensity = 1.2;
    },
    bone(t) {
      allLit(); hw.setDoorOpen(4, 1.4);
      const [l0, l1] = EV.laugh, kneel = smooth((t - 49.1) / 0.6), give = EV.bone, take = give + 0.45;
      const got = t > take;
      pipAt('sub', D[4] + 0.15, -8.2, PI - 0.4, {
        sit: got ? 0 : 1, ears: 1, headPitch: got ? -0.15 : -0.35 - 0.2 * (1 - kneel), lookY: 0.6, tilt: t < 49.6 ? 0.3 : 0,
        eyes: got ? 'happy' : t > give - 0.3 ? 'wide' : 'open', mouth: got ? 'smile' : t > give - 0.2 ? 'open' : 'smile', open: !got && t > give - 0.2 ? 0.25 : undefined,
        wag: got ? 1 : 0.7, wagRate: got ? 6.5 : 4.5, hop: got && t < take + 0.9 ? Math.abs(Math.sin((t - take) * PI * 3)) * 0.04 : 0,
      }, t);
      heap.setFill(0);
      // the porch candy from the shake, where it landed
      for (let i = 0; i < 28; i++) { const a = (i / 28) * PI * 2 + i * 0.37, rr = 0.18 + ((i * 7) % 5) * 0.05; flyer.place(i, new THREE.Vector3(D[4] - 0.08 + Math.cos(a) * rr * 1.3, 0.31, -8.55 + Math.sin(a) * rr * 0.7), 4.5 * (i % 2 ? 1 : -1)); }
      const laugh = t > l0 && t < l1 ? 1 : 0;
      const p = person(old, { x: D[4] - 0.08, z: -8.72, rotY: 0.25, eyes: laugh ? 'closed' : blink(t, 5), smile: 1, mouth: laugh ? 'o' : 'smile', headPitch: laugh ? -0.3 + 0.08 * Math.sin(t * 16) : 0.35, glasses: true }, 0.3);
      if (t < 49.1) { p.armA = BELLY_A; p.armB = BELLY_B; p.lean = -0.08 + 0.05 * Math.sin(t * 16) * laugh; }
      else { Object.assign(p, { y: lerp(0, KNEEL.y, kneel), footFwd: lerp(0, KNEEL.footFwd, kneel), lean: lerp(0.03, 0.3, kneel), headPitch: 0.3 }); p.armA = A(-0.2, 0.1, -0.4, 0.2); p.armB = t < 50.0 ? REST : t < give ? POCKET_B : t < take + 0.2 ? mixArm(POCKET_B, REACH_B, smooth((t - give + 0.1) / 0.35)) : mixArm(REACH_B, PAT_B, smooth((t - take - 0.2) / 0.4)); }
      put(old, p, 0.3);
      old.head.brows.forEach((b, i) => (b.rotation.z = (i ? 1 : -1) * -0.2));
      if (t > 50.05) {
        bone.visible = true;
        if (!got) { const h = handWorld(old, 1); bone.position.copy(h).add(new THREE.Vector3(0, -0.03, 0.02)); bone.rotation.set(0, 0.25, 0.1); }
        else { pip.anchors.mouth.add(bone); bone.position.set(0, -0.004, 0.025); bone.rotation.set(0, 0, 0); bone.scale.setScalar(1 / PIPS); }
      }
      glowA.position.set(D[4] + 0.5, 0.8, -7.9); glowA.intensity = 1.3;
    },
    lightsA(t) { lightsBeat(t, false); },
    lightsB(t) { lightsBeat(t, true); },
    _lights(t, close) {
      // house four lights up for the first time: lantern, string lights, jack-o'-lanterns, windows
      hw.houses.forEach((h, i) => h.setLit(i === 4 ? smooth((t - EV.lights) / 0.5) : 1));
      hw.setDoorOpen(4, 1.4);
      const [f0, f1] = EV.refill;
      const PX = close ? D[4] + 0.1 : D[4] + 0.32, PZ4 = close ? -7.95 : -8.0, OX = close ? D[4] + 0.38 : D[4] - 0.12;
      pipAt('sub', PX, PZ4, close ? 0.25 : 0.15, { sit: 1, ears: 1, headPitch: -0.1 - 0.15 * (close ? 1 : 0), wag: 1, wagRate: 6, eyes: t > f0 ? 'happy' : 'open', mouth: 'smile', lookY: 0.3, tilt: K(t, [[52.4, 0], [52.9, 0.25], [53.6, 0]]) }, t);
      pip.anchors.mouth.add(bone); bone.visible = true; bone.position.set(0, -0.004, 0.025); bone.rotation.set(0, 0, 0); bone.scale.setScalar(1 / PIPS);
      heap.setFill(Math.round(41 * clamp((t - f0 - 0.25) / (f1 - f0 - 0.2))));
      // the old man with the big bowl: hands out candy, then pours a river of it into Pip
      const pour = smooth((t - f0) / 0.4) * (1 - smooth((t - f1 - 0.1) / 0.3));
      const p = person(old, { x: OX, z: -8.5, rotY: faceToward(OX, -8.5, PX, PZ4) * 0.5, eyes: blink(t, 5), smile: 1, mouth: t > 53.2 && t < 54.4 ? 'o' : 'smile', headPitch: 0.25 + 0.25 * pour, lean: 0.05 + 0.35 * pour, armA: mixArm(LOW_A, HOLD_A, pour), armB: mixArm(LOW_B, HOLD_B, pour), glasses: true }, 0.3);
      old.head.brows.forEach((b, i) => (b.rotation.z = (i ? 1 : -1) * -0.2));
      bigBowl.g.visible = true; bigBowl.g.position.copy(between2(old)).add(new THREE.Vector3(0, -0.06, 0.06)); bigBowl.g.rotation.set(1.1 * pour, p.rotY, 0);
      bigBowl.heap.setFill(90 - 50 * clamp((t - f0) / (f1 - f0)));
      if (t > f0) { const back = backW(), lip = bigBowl.g.localToWorld(new THREE.Vector3(0, 0.12, 0.22)); for (let i = 0; i < 44; i++) fly(i, lip.clone().add(new THREE.Vector3((i % 3 - 1) * 0.03, 0, 0)), back.clone().add(new THREE.Vector3(((i * 37) % 7 - 3) * 0.01, 0.02, ((i * 13) % 5 - 2) * 0.01)), f0 + 0.15 + i * 0.033, 0.3, 0.05, t, 1, true); }
      // kids run up the walk and crowd the steps (wide); two of them cheer right beside him (close); Mia cheers
      const KS = close ? [[0, D[4] - 0.28, -7.8, 0], [3, D[4] + 0.85, -8.25, 0]] : [[0, D[4] - 0.75, -7.25, 52.4], [1, D[4] - 1.05, -6.55, 52.55], [2, D[4] + 1.1, -6.6, 52.7], [3, D[4] + 0.85, -7.25, 52.85]];
      KS.forEach(([i, x, z, t0]) => {
        const k = walkP(t, [x + (x < D[4] ? -1.5 : 1.5), -2.0], [{ t0, t1: t0 + 1.5, pts: [[x, z]] }]);
        const arrived = t > t0 + 1.5, kx = close ? x : k.x, kz = close ? z : k.z;
        const ch = (t * 2 + i) % 2 < 1;
        person(KIDS[i], { x: kx, z: kz, rotY: arrived ? faceToward(kx, kz, OX, -8.5) : (k.head ?? PI), dist: k.dist, speed: k.speed * 1.3, eyes: blink(t, i), smile: 1, mouth: arrived && (t + i) % 1.2 < 0.4 ? 'o' : 'smile', headPitch: arrived ? -0.25 : 0, armA: arrived && ch ? CHEER_A : REST, armB: arrived ? (ch ? CHEER_B : REACH_B) : REST }, groundY(kx, kz));
      });
      if (!close) { person(mia, { x: D[4] + 0.95, z: -7.4, rotY: faceToward(D[4] + 0.95, -7.4, PX, PZ4), eyes: blink(t, 2), smile: 1, armA: { ...CHEER_A, sz: CHEER_A.sz + 0.15 * Math.sin(t * 8) }, armB: CHEER_B, mouth: (t % 1) < 0.35 ? 'o' : 'smile' }, 0.3); wand.visible = true; }
      glowA.position.set(D[4] + 0.6, 1.0, -7.4); glowA.intensity = 1.5 * smooth((t - EV.lights) / 0.5);
      glowB.position.set(D[4] - 0.4, 0.6, -6.6); glowB.intensity = 2.0 * smooth((t - EV.lights - 0.2) / 0.5);
    },
    home(t) {
      // Pip asleep on the candy pile, hugging his bone; Mia sorting candy; Dad's hand sneaks a bar
      homePile.mesh.visible = true; homePile.setFill(70);
      pipAt('liv', -0.78, 0.42, 0.6, { sleep: 1, ears: 0.5, tilt: 0.3, headYaw: 0.35, wag: 0.12, wagRate: 1.2 }, t, 0.075);
      suit.setOn(1); heap.setFill(0);
      pip.R.add(bone); bone.visible = true; bone.position.set(0.05, 0.03, 0.3); bone.rotation.set(0, 0.35, 0); bone.scale.setScalar(1.0);
      bunny.visible = true; bunny.position.set(-0.52 + OFF.liv[0], 0, 0.62); bunny.rotation.set(0, -0.6, 1.3);
      const p = person(mia, { x: -0.72 + OFF.liv[0], z: -0.05, rotY: 0.1, y: -0.22, footFwd: 0.42, lean: 0.12, eyes: blink(t, 2), smile: 1, headPitch: 0.35, headRoll: 0.1, armA: A(-0.75, 0.15, -1.3, 0.5), armB: A(-0.9, 0.15, -1.6, -0.6), mouth: t > 59.2 && (t % 0.6) < 0.3 ? 'o' : 'smile' }, 0);
      put(mia, p, 0); wand.visible = false;
      const sneak = smooth((t - 58.4) / 0.8) * (1 - smooth((t - 60.0) / 0.5));
      const d = person(dad, { x: -1.4 + OFF.liv[0] - 0.12 * (1 - sneak), z: 0.12, rotY: faceToward(-1.4, 0.12, -0.8, 0.42), ...KNEEL, lean: 0.3 + 0.35 * sneak, eyes: blink(t, 4), smile: 1, headPitch: 0.4, armB: mixArm(REST, REACH_B, sneak), armA: A(-0.2, 0.1, -0.4), glasses: true, mouth: 'flat' }, 0);
      glowA.position.set(-0.6 + OFF.liv[0], 0.5, 0.9); glowA.intensity = 0.8;
    },
  };

  const lightsBeat = (t, close) => BEATS._lights(t, close);

  // house four from the street: kids hurry past in the road; Pip stops at the walk, tilts his head at the dark house, trots up alone
  function grump(t, close) {
    allLit();
    const tilt = K(t, [[37.5, 0], [37.85, 0.35], [38.25, 0.35], [38.45, 0]]);
    const w = walkP(t, [D[4] - 3.2, -0.9], [{ t0: 35.0, t1: 36.7, pts: [[D[4], -0.9]] }, { t0: 38.5, t1: 39.6, pts: [[D[4], -2.4], [D[4], -3.6]] }]);
    const face = t < 36.7 ? (w.head ?? PI / 2) : t < 38.5 ? lerp(PI / 2, PI, smooth((t - 36.7) / 0.5)) : (w.head ?? PI);
    pipAt('sub', w.x, w.z, face, { walk: w.speed > 0.05 ? 1 : 0, dist: w.dist, ears: 1, wag: t < 36.7 ? 0.8 : 0.45, headPitch: t > 36.9 && t < 38.5 ? -0.42 : -0.1, tilt, eyes: 'open', mouth: 'smile', lookY: 0.5 }, t);
    heap.setFill(28);
    // kids hurry past in the road, heads turned to the dark house
    const hurry = (P, i, x0, t0) => { const k = walkP(t, [D[4] - 3.2, -0.2 - 0.25 * (i % 2)], [{ t0, t1: t0 + 2.6, pts: [[D[4] + 3.6, -0.2 - 0.25 * (i % 2)]] }]); person(P, { x: k.x, z: k.z, rotY: k.head ?? PI / 2, dist: k.dist, speed: k.speed, eyes: blink(t, i), smile: 0, mouth: 'flat', headYaw: -0.55 }, groundY(k.x, k.z)); };
    hurry(KIDS[2], 2, 0, 34.2); hurry(KIDS[4], 4, 0, 34.8); hurry(KIDS[5], 5, 0, 35.3); hurry(KIDS[3], 3, 0, 35.8);
    // Mia steps off toward the road with them, then turns back and reaches for Pip
    const m = walkP(t, [D[4] - 4.0, -1.35], [{ t0: 35.0, t1: 36.8, pts: [[D[4] - 0.75, -1.3]] }]);
    const back = smooth((t - 38.4) / 0.4);
    const pm = person(mia, { x: m.x, z: m.z, rotY: t > 37.0 ? faceToward(m.x, m.z, D[4], -2.5) : (m.head ?? PI / 2), dist: m.dist, speed: m.speed, eyes: blink(t, 2), smile: 0, mouth: back > 0.3 ? 'o' : 'flat', armB: WAND_B, headPitch: 0.1 }, groundY(m.x, m.z));
    pm.armA = mixArm(REST, A(-1.3, 0.2, -0.2, 0.2), back); put(mia, pm, groundY(m.x, m.z)); wand.visible = true;
    if (close) glowA.position.set(D[4] + 0.1, 0.5, -1.9), glowA.intensity = 0.9;
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200)
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    livLook();
    const i = Math.floor(t - 200);
    const L = [{ sit: 1 }, { walk: 1 }, { lie: 1 }, { sleep: 1 }, { beg: 0.55 }, { lean: 0.38 }, { sit: 1, mouth: 'open', open: 0.55 }][i % 7];
    pipAt('liv', 0.4, 0.5, (t - 200) % 1 > 0.4 ? 1.3 : 0.45, { ...L, still: true }, t);
    heap.setFill(i * 7);
  }

  return { update };
}
