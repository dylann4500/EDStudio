// VIDEO 031 — "What if Pip worked at the supermarket for one day?"  (Pip ep. 4 · lane 3 @ed._.sims · storybook tone, a job episode)
// 67.0 s, 22 shots, one place: Sunny Market (supermarket.js dressed by the new engine/pipmart.js). Mom works there; today Pip comes
// to work in a green STAFF vest with a HI, I'M PIP badge and gets a staff photo (he sticks his tongue out). Rule of three, each job
// done in Pip's honest way: GREETER — corgis were bred to herd cattle, so he herds the customers into one tight huddle; SAUSAGES —
// "stock the sausages", so he sits on the cooler and keeps every one in stock (a time-lapse: the store empties, the sausages
// don't); CHECKOUT — he scans everything at his level (shoes: the register lists SNEAKER (L), BOOT (R)…) while the belt jams and
// the groceries avalanche off the counter. 4 PM: he hasn't helped anyone. Then a tiny sob: a lost toddler under the cereal
// shelf. He gives her his bunny, sniffs her sleeve (up to 300 million scent receptors — a golden scent trail), and leads her
// across the store by his vest handle to her mom. Hug; the whole store claps; the balloon net drops. His tongue-out photo goes
// up as EMPLOYEE OF THE MONTH; he's paid in dog biscuits; asleep in a cart at sunset. HUD = CUSTOMERS HELPED 0 … 0 → 1.
// Pip never eats people food: his pay is a dog biscuit (makeBone from halloween.js), and the caption says why.
// NEW (reusable): engine/pipmart.js — dressMarket(): glass front + automatic doors + a sunny parking lot, aisle signs, product
// labels, a sausage cooler, checkout 3 (belt, scanner, register screen listing "items"), an EMPLOYEE OF THE MONTH board, a
// balloon net that drops, lobby dressing; props: staff vest + badge for any makePip, handheld scanner, shopping cart, hand
// basket, instant camera + Polaroid, instanced groceries, a scent trail. The staff photo = Pip rendered to a texture (photoRT).
// Event times live in story.json → "pip" so make_cues.py syncs the foley to the same numbers.
//
// Sources (checked Oct 27, 2026):
//   Pembroke Welsh Corgis were all-purpose Welsh farm dogs that herded cattle — AKC, "Pembroke Welsh Corgi History"
//     (akc.org/expert-advice/dog-breeds/pembroke-welsh-corgi-history)
//   dogs have up to 300 million olfactory receptors vs about 6 million in people — PBS NOVA, "Dogs' Dazzling Sense of Smell"
//   onions and garlic (common sausage seasonings) are toxic to dogs — ASPCA Animal Poison Control, "People Foods to Avoid
//     Feeding Your Pets". Pip's pay is a dog biscuit. CUSTOMERS / SAUSAGES / SHOES / 41 SECONDS are story numbers.
//
// Shot list (seconds)                  | where        | what happens
//  0.0– 3.4 thumb    8:58 AM            | lobby        | the question over Pip in his STAFF vest, head tilt, bunny beside him, shoppers behind
//  3.4– 8.6 badge                       | lobby        | Mom (staff) clips on his badge (boing); he wiggles; the manager's instant camera: FLASH, tongue out
//  8.6–11.4 doors    9:00 AM            | lobby        | the automatic doors slide open, shoppers walk in; Pip springs up — "Boof."
// 11.4–14.2 herdA                       | lobby (high) | zoomies in circles around them: the shoppers shuffle into one tight huddle
// 14.2–16.8 herdB                       | lobby (low)  | the huddle up close (laughing faces, carts nested), Pip whizzing past the lens
// 16.8–19.4 sausA    11:00 AM           | aisle 3      | Pip trots up the aisle, hops onto the box, onto the sausage cooler, sits on the pile
// 19.4–22.4 sausB                       | aisle 3      | a hand reaches in — the look — she puts it back; a second shopper too
// 22.4–25.6 lapse    → 2:30 PM          | aisle 3      | time-lapse: shoppers zip, shelves empty, the clock spins; the sausages stay full
// 25.6–28.2 scanA    2:30 PM            | checkout 3   | scanner in his mouth: BEEP on a sneaker, BEEP the other one, the next customer's boot
// 28.2–30.2 scanB                       | register     | the screen: SNEAKER (L) $0.00 … ITEMS 31 · TOTAL $0.00
// 30.2–33.6 scanC                       | checkout 3   | the belt never stopped: the jam avalanches off the counter around him; the queue laughs
// 33.6–36.6 low      4:00 PM            | aisle 2      | he lies with his bunny, ears down; carts roll past
// 36.6–39.0 sob                         | aisle 2      | an ear lifts… a tiny sob; he stands up, bunny in his mouth
// 39.0–42.6 tod                         | aisle 2      | a toddler alone under the cereal shelf; he sits, gives her his bunny; she hugs it, giggles
// 42.6–46.0 sniff                       | aisle 2      | he sniffs her sleeve, nose up: a golden scent trail curls away down the aisle
// 46.0–48.2 lead                        | aisle 2      | tracking: she holds his vest handle, they follow the trail; shoppers stop and watch
// 48.2–50.0 lead2                       | front        | round the corner toward the lobby
// 50.0–53.4 reunion  4:03 PM (0 → 1)    | lobby        | her mom turns, kneels, scoops her up; Mom and the manager melt
// 53.4–56.4 cheer                       | lobby        | the whole store claps, the balloon net drops; the toddler hands back the bunny
// 56.4–58.2 eotmA    5:00 PM            | staff wall   | the manager pins Pip's tongue-out photo under EMPLOYEE OF THE MONTH
// 58.2–60.2 eotmB                       | staff wall   | a dog biscuit for Pip: full-speed tail
// 60.2–67.0 home     sunset             | lobby        | Mom wheels him to the doors, asleep in the cart with his bunny + biscuit. End card 63.0
import * as THREE from 'three';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makeBunny } from '@engine/props.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { makePip, makeMom, poseScaled, pulseAt } from '@engine/pip.js';
import { makeBone } from '@engine/halloween.js';
import { dressMarket, makeStaffVest, makeScanner, makeShopCart, loadCart, makeHandBasket, makePolaroidCam, makePolaroid, makeGroceries, makeScentTrail } from '@engine/pipmart.js';

const PI = Math.PI;
const PIPS = 0.92, TS = 0.5;                 // Pip's size, the toddler's body scale (head ×1.6)
const C = { x: 5.4, z: 4.3 };                // the lobby's middle (the herding circle)

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb' },
  { t0: 3.4, t1: 8.6, cam: 'badge' },
  { t0: 8.6, t1: 11.4, cam: 'doors' },
  { t0: 11.4, t1: 14.2, cam: 'herdA' },
  { t0: 14.2, t1: 16.8, cam: 'herdB' },
  { t0: 16.8, t1: 19.4, cam: 'sausA' },
  { t0: 19.4, t1: 22.4, cam: 'sausB' },
  { t0: 22.4, t1: 25.6, cam: 'lapse' },
  { t0: 25.6, t1: 28.2, cam: 'scanA' },
  { t0: 28.2, t1: 30.2, cam: 'scanB' },
  { t0: 30.2, t1: 33.6, cam: 'scanC' },
  { t0: 33.6, t1: 36.6, cam: 'low' },
  { t0: 36.6, t1: 39.0, cam: 'sob' },
  { t0: 39.0, t1: 42.6, cam: 'tod' },
  { t0: 42.6, t1: 46.0, cam: 'sniff' },
  { t0: 46.0, t1: 48.2, cam: 'lead' },
  { t0: 48.2, t1: 49.3, cam: 'lead2' },
  { t0: 49.3, t1: 53.4, cam: 'reunion' },
  { t0: 53.4, t1: 56.4, cam: 'cheer' },
  { t0: 56.4, t1: 58.2, cam: 'eotmA' },
  { t0: 58.2, t1: 60.2, cam: 'eotmB' },
  { t0: 60.2, t1: 70, cam: 'home' },
];
// p/a = [start, end] (eased across the shot)
const c = (p0, p1, a0, a1, fov, amp = 0.003) => ({ p: [p0, p1], a: [a0, a1], fov, amp });
export const CAMS = {
  thumb:   c([5.53, 0.4, 5.2], [5.52, 0.4, 5.12], [5.45, 0.56, 3.9], [5.45, 0.56, 3.9], 46, 0.002),
  badge:   c([5.22, 0.74, 2.45], [5.22, 0.72, 2.6], [5.32, 0.95, 4.75], [5.32, 0.93, 4.75], 54),
  doors:   c([5.35, 0.55, 3.5], [5.37, 0.56, 3.58], [5.5, 0.85, 6.0], [5.5, 0.85, 6.0], 52),
  herdA:   c([5.4, 3.55, 2.05], [5.38, 3.5, 2.12], [5.4, 0.3, 4.45], [5.4, 0.3, 4.45], 60),
  herdB:   c([4.22, 0.9, 2.05], [4.3, 0.9, 2.12], [5.4, 0.8, 4.3], [5.4, 0.8, 4.3], 54),
  sausA:   c([4.5, 0.75, -0.9], [4.48, 0.76, -1.1], [4.05, 1.25, -4.2], [4.05, 1.25, -4.2], 48),
  sausB:   c([4.08, 1.02, -1.95], [4.1, 1.0, -2.1], [4.1, 1.12, -4.5], [4.1, 1.12, -4.5], 56),
  lapse:   c([4.3, 1.3, -0.6], [4.3, 1.3, -0.9], [4.0, 1.45, -7.0], [4.0, 1.45, -7.0], 54, 0.001),
  scanA:   c([3.62, 0.36, 4.05], [3.58, 0.35, 4.1], [2.82, 0.25, 4.5], [2.82, 0.25, 4.5], 50),
  scanB:   null,   // computed from the register screen at build time
  scanC:   c([4.3, 1.2, 4.78], [4.27, 1.18, 4.74], [2.2, 0.66, 4.6], [2.2, 0.66, 4.6], 54),
  low:     c([0.62, 0.3, -1.6], [0.6, 0.3, -1.75], [0.3, 0.2, -3.3], [0.3, 0.2, -3.3], 48),
  sob:     c([0.58, 0.3, -2.45], [0.56, 0.3, -2.5], [0.28, 0.13, -3.2], [0.28, 0.13, -3.2], 44),
  tod:     c([-0.15, 0.5, -5.0], [-0.2, 0.48, -5.1], [-0.85, 0.36, -6.3], [-0.85, 0.36, -6.3], 48),
  sniff:   c([-0.1, 0.62, -4.55], [-0.12, 0.6, -4.7], [-0.65, 0.45, -6.15], [-0.65, 0.45, -6.15], 50),
  lead:    c([-0.08, 0.62, -2.35], [-0.08, 0.62, -0.25], [-0.12, 0.42, -4.3], [-0.12, 0.42, -2.2], 52),
  lead2:   c([0.35, 0.8, 3.75], [0.38, 0.8, 3.65], [0.15, 0.5, 1.2], [0.3, 0.5, 1.4], 50),
  reunion: c([4.55, 0.9, 1.0], [4.55, 0.9, 1.15], [4.6, 0.95, 3.4], [4.6, 0.95, 3.4], 52),
  cheer:   c([4.6, 1.0, 0.2], [4.6, 1.0, 0.35], [4.75, 1.35, 3.6], [4.75, 1.35, 3.6], 56),
  eotmA:   c([4.5, 1.55, 3.9], [6.6, 1.52, 4.15], [7.95, 1.6, 3.9], [7.95, 1.4, 4.18], 46, 0.002),
  eotmB:   c([6.4, 0.5, 3.45], [6.48, 0.5, 3.52], [7.35, 0.62, 4.1], [7.35, 0.62, 4.1], 50),
  home:    c([5.75, 1.3, 5.7], [5.75, 1.27, 5.55], [5.78, 1.05, 3.0], [5.78, 1.03, 3.0], 50, 0.002),
  lineup:  c([0, 0.45, 1.6], [0, 0.45, 1.6], [0, 0.3, 0], [0, 0.3, 0], 40, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);
const DOWN_B = A(-0.75, 0.1, -0.1, -0.2);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);
const MOUTH_A = A(-0.55, 0.02, -2.35, 0.95), MOUTH_B = A(-0.55, 0.02, -2.35, -0.95);
const BELLY_A = A(-0.4, 0.18, -1.45, 0.7), BELLY_B = A(-0.4, 0.18, -1.45, -0.7);
const CHEER_A = A(-0.4, 2.5, -0.5, 0), CHEER_B = A(-0.4, 2.5, -0.5, 0);
const PUSH_A = A(-1.05, 0.12, -0.5, 0.25), PUSH_B = A(-1.05, 0.12, -0.5, -0.25);
const HUG_A = A(-0.95, 0.3, -1.75, 0.8), HUG_B = A(-0.95, 0.3, -1.75, -0.8);
const CAM_A = A(-1.25, 0.12, -1.95, 0.75), CAM_B = A(-1.25, 0.12, -1.95, -0.75);
const CLAP0_A = A(-1.0, 0.3, -1.35, 0.5), CLAP0_B = A(-1.0, 0.3, -1.35, -0.5);
const CLAP1_A = A(-1.05, 0.08, -1.25, 0.85), CLAP1_B = A(-1.05, 0.08, -1.25, -0.85);
const HANDS_UP_A = A(-0.6, 0.55, -1.6, 0.6), HANDS_UP_B = A(-0.6, 0.55, -1.6, -0.6);   // "okay, okay"
const PIN_B = A(-1.55, 0.15, -0.35, -0.25);
const WAVE_B = A(-0.3, 2.3, -0.6, 0);
const BASKET_A = A(0.0, 0.12, -0.25, 0, 0);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const clap = (t, i, k = 1) => { const s = (Math.sin(t * 2 * PI * 3.2 + i) + 1) / 2; return [mixArm(REST, mixArm(CLAP0_A, CLAP1_A, s), k), mixArm(REST, mixArm(CLAP0_B, CLAP1_B, s), k)]; };
const KNEEL = { y: -0.47, footFwd: -0.33, lean: 0.18 };
const CROUCH = { crouch: 0.42, lean: 0.42 };
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));
const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

export async function build(studio, story) {
  const { scene, setCamera, renderer } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- the store
  const market = buildSupermarket(studio);
  const M = dressMarket(studio, market);
  scene.fog = null; scene.background = new THREE.Color(0xa9d4f2);
  const LD = M.lane.D;
  // a cardboard step box in front of the sausage cooler (Pip's way up)
  const stepT = canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#c9a06a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,80,40,.35)'; g.fillRect(0, h * 0.45, w, 10); g.fillStyle = '#8a3a22'; g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('SAUSAGES', w / 2, 70); g.font = 'bold 28px Helvetica, Arial, sans-serif'; g.fillText('THIS SIDE UP ↑', w / 2, 150); });
  const step = mk(new THREE.BoxGeometry(0.42, 0.3, 0.32), new THREE.MeshStandardMaterial({ map: stepT, roughness: 0.9 }), market.root, 4.0, 0.15, -3.45);
  step.rotation.y = 0.12;

  // ---------------------------------------------------------------- Pip + his kit
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const vest = makeStaffVest(pip);
  const bunny = makeBunny(); bunny.scale.setScalar(1.25); scene.add(bunny);
  const scanner = makeScanner(); scene.add(scanner.g);
  const bone = makeBone({ len: 0.13 }); scene.add(bone);

  // ---------------------------------------------------------------- the staff photo: Pip (tongue out) rendered once into a texture
  const photoRT = new THREE.WebGLRenderTarget(512, 512, { samples: 4 });
  const photoRoot = new THREE.Group(); photoRoot.position.set(60, 0, -60); scene.add(photoRoot);
  const ppip = makePip({ size: PIPS }); photoRoot.add(ppip.g);
  const pvest = makeStaffVest(ppip); pvest.setBadge(1);
  const bgT = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.5, w * 0.75); gr.addColorStop(0, '#bfe0f7'); gr.addColorStop(1, '#5f95c4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  mk(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: bgT }), photoRoot, 0, 0.4, -0.6);
  const pKey = new THREE.PointLight(0xfff4e8, 2.2, 4, 1.4); pKey.position.set(0.35, 0.75, 1.0); photoRoot.add(pKey);
  const photoCam = new THREE.PerspectiveCamera(30, 1, 0.05, 10);
  ppip.g.rotation.y = -0.15;
  ppip.update(0, { sit: 1, mouth: 'pant', tongue: 1, open: 0.32, eyes: 'happy', ears: 1, tilt: 0.24, headPitch: -0.12, wag: 0, still: true });
  photoRoot.updateMatrixWorld(true);
  photoCam.position.set(60.04, 0.37, -59.12); photoCam.lookAt(60.0, 0.31, -60.0); photoCam.updateMatrixWorld();
  renderer.setRenderTarget(photoRT); renderer.render(scene, photoCam); renderer.setRenderTarget(null);
  photoRoot.visible = false;
  const print = makePolaroid(photoRT.texture); scene.add(print.g);
  const bigPrint = makePolaroid(photoRT.texture); bigPrint.g.scale.setScalar(3.6); scene.add(bigPrint.g);

  // ---------------------------------------------------------------- people
  const mom = makeMom({ outfit: 'day' }); mom.mats.top.color.set(0x2f7a4c); scene.add(mom.root);
  const tagT = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, 18); g.fillStyle = '#1e2a22'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('JEN', w / 2, 52); });
  mk(new THREE.PlaneGeometry(0.09, 0.045), new THREE.MeshStandardMaterial({ map: tagT, roughness: 0.5 }), mom.spine, 0.08, 0.4, 0.135).rotation.y = 0.15;
  const mgr = makePerson({ skin: 0xc68863, hair: 0x3a2418, hairStyle: 'short', glasses: true, mustache: 0x3a2418, top: 0x2f7a4c, collar: 0xffffff, pants: 0x3a3f47, shoes: 0x2a2420 });
  mk(new THREE.BoxGeometry(0.05, 0.22, 0.012), mat(0xd2483f, 0.5), mgr.spine, 0, 0.36, 0.128).rotation.x = -0.12;
  mgr.kid = 1; scene.add(mgr.root);
  const SH = [
    { skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0x7fb0d8, pants: 0x5a5f66 },
    { skin: 0x8d5a3b, hair: 0x1a1210, hairStyle: 'short', top: 0xd2483f, pants: 0x2f4f73 },
    { skin: 0xe9b896, hair: 0xb8742a, hairStyle: 'bob', top: 0xa77bd1, pants: 0x3a3f47 },
    { skin: 0xc68863, hair: 0x2a1a12, hairStyle: 'messy', top: 0x58b368, pants: 0x8a6a48, beard: 0x2a1a12 },
    { skin: 0xf3d2b8, hair: 0x5a3a24, hairStyle: 'short', top: 0xf08a4b, pants: 0x3b4a66 },
    { skin: 0xb5794f, hair: 0x1a1210, hairStyle: 'bob', top: 0xe58fa6, pants: 0xe8e4dc },
    { skin: 0xd9a27c, hair: 0x8a3f22, hairStyle: 'messy', top: 0x3d7bd9, pants: 0x555555 },
    { skin: 0xf0c4a2, hair: 0xd8d4cc, hairStyle: 'none', mustache: 0xd8d4cc, top: 0x6fb0a0, pants: 0x5a6a5a, glasses: true },
    { skin: 0x8d5a3b, hair: 0x3a2418, hairStyle: 'bob', top: 0xffffff, pants: 0x2a2a2a },
    { skin: 0xe2b090, hair: 0xc89048, hairStyle: 'short', top: 0x9aa3ad, pants: 0x4a4f57 },
  ].map((o, i) => { const P = makePerson({ shoes: [0xe8e4dc, 0x3a2e2a, 0xd2483f, 0x2f4f73][i % 4], ...o }); P.kid = 1; P.gl = !!o.glasses; scene.add(P.root); return P; });
  const tmom = makePerson({ skin: 0xe9c0a0, hair: 0x3a2418, hairStyle: 'bob', top: 0xf2c14e, collar: 0xfff6e0, pants: 0x3b4a66, shoes: 0xe8e4dc });
  tmom.kid = 1; scene.add(tmom.root);
  const tod = makePerson({ skin: 0xe9c0a0, hair: 0x3a2418, hairStyle: 'bob', top: 0xf2a6c0, pants: 0x7fb0d8, shoes: 0xf4f1ea });
  tod.root.scale.setScalar(TS); tod.headG.scale.setScalar(1.6); tod.kid = TS; scene.add(tod.root);
  { const bow = new THREE.Group(); bow.position.set(0.06, 0.13, -0.02); tod.head.g.add(bow); for (const s of [-1, 1]) { const l = mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0xe2574c, 0.6), bow, s * 0.03, 0, 0); l.scale.set(1.2, 0.8, 0.5); } mk(new THREE.SphereGeometry(0.014, 8, 6), mat(0xc0392b, 0.6), bow, 0, 0, 0); }
  const CAST = [mom, mgr, ...SH, tmom, tod];

  // ---------------------------------------------------------------- props
  const carts = [0, 1, 2, 3].map((i) => { const k = loadCart(makeShopCart(), 5 + i, 20 + i); scene.add(k); return k; });
  const homeCart = makeShopCart(); scene.add(homeCart);
  const baskets = [makeHandBasket(0xd2483f), makeHandBasket(0x3d7bd9)];
  SH[0].arms.find((a) => a.s === -1).hand.add(baskets[0]); SH[7].arms.find((a) => a.s === 1).hand.add(baskets[1]);
  baskets.forEach((b) => { b.scale.setScalar(1); b.position.set(0, -0.02, 0); });
  const polCam = makePolaroidCam(); mgr.arms.find((a) => a.s === 1).hand.add(polCam.g); polCam.g.position.set(-0.08, 0.02, 0.06); polCam.g.rotation.set(0, 0, 0);
  const groc = makeGroceries(scene, 56, 7);
  const trail = makeScentTrail(scene, 170);
  const TRAIL = [[-0.5, 0.44, -5.92], [-0.35, 0.7, -5.35], [0.55, 0.62, -4.4], [-0.1, 0.72, -3.1], [0.3, 0.6, -1.5], [-0.05, 0.66, 0.6], [0.5, 0.6, 2.3], [2.4, 0.66, 2.42], [3.7, 0.72, 2.7], [4.45, 0.82, 3.15]].map((p) => new THREE.Vector3(...p));
  const glowA = new THREE.PointLight(0xffe8c8, 0, 3, 1.8); scene.add(glowA);
  
  // the register screen insert camera (in front of the screen, along its normal)
  {
    const s = LD.screen; s.updateMatrixWorld(true);
    const cpos = s.localToWorld(new THREE.Vector3(0, 0.0, 1.06)), cpos2 = s.localToWorld(new THREE.Vector3(0, 0.0, 0.94)), aim = s.localToWorld(new THREE.Vector3(0, -0.01, 0));
    CAMS.scanB = c(cpos.toArray(), cpos2.toArray(), aim.toArray(), aim.toArray(), 42, 0.0015);
  }

  // ---------------------------------------------------------------- helpers
  const put = (P, p, floor = 0) => { if (P.kid && P.kid !== 1) poseScaled(P, p, floor); else { applyPose(P, p); P.root.position.y = floor + (p.y || 0); } };
  const person = (P, o, floor = 0) => { const p = basePose(); Object.assign(p, o); if (P === mgr || P.gl) p.glasses = true; put(P, p, floor); return p; };
  const pipAt = (x, z, rotY, st, t, y = 0) => { pip.g.position.set(x, y, z); pip.g.rotation.set(0, rotY, 0); pip.update(t, st); };
  const walkP = (t, start, legs) => walkLegs(t, start, legs);
  const walker = (P, i, t, start, legs, o = {}) => { const w = walkP(t, start, legs); return person(P, { x: w.x, z: w.z, rotY: w.head ?? o.rotY ?? 0, dist: w.dist, speed: w.speed, eyes: blink(t, i), smile: 1, ...o, ...(w.head !== null && o.keepHead ? { rotY: o.rotY } : {}) }, o.floor || 0); };
  const placeCart = (k, x, z, h) => { k.visible = true; k.position.set(x + Math.sin(h) * 0.78, 0, z + Math.cos(h) * 0.78); k.rotation.set(0, h, 0); };
  const pusher = (P, i, k, t, start, legs, o = {}) => { const w = walkP(t, start, legs); const h = w.head ?? o.rotY ?? 0; person(P, { x: w.x, z: w.z, rotY: h, dist: w.dist, speed: w.speed, armA: PUSH_A, armB: PUSH_B, lean: 0.1, eyes: blink(t, i), smile: 1, ...o, rotY: h }); placeCart(k, w.x, w.z, h); return w; };
  const holdInMouth = (obj, x = 0, y = -0.004, z = 0.03, rot = [0, 0, 0], s = 1 / PIPS) => { pip.anchors.mouth.add(obj); obj.position.set(x, y, z); obj.rotation.set(...rot); obj.scale.setScalar(s); obj.visible = true; };
  const toScene = (obj, s = 1) => { if (obj.parent !== scene) scene.add(obj); obj.scale.setScalar(s); obj.visible = true; };
  // a toddler held at a grown-up's chest (call after the holder is posed)
  const carry = (T, H, t, o = {}) => {
    H.root.updateMatrixWorld(true);
    const ch = H.spine.localToWorld(new THREE.Vector3(0, o.up ?? 0.16, o.fwd ?? 0.24));
    const p = basePose(); Object.assign(p, { x: ch.x, z: ch.z, rotY: H.root.rotation.y + PI, y: -0.22, footFwd: 0.42, armA: HUG_A, armB: HUG_B, eyes: 'closed', smile: 1, headYaw: o.yaw ?? 0.7, headPitch: 0.05, ...o.pose });
    poseScaled(T, p, ch.y - 0.04 - HIP_H * TS - p.y * TS);
    return p;
  };

  function stock(k) { market.setStock(k); }
  const afterLapse = 0.35;

  // ---------------------------------------------------------------- update
  let cur = null;
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', t0: 200, t1: 300 } : shotAt(t), cam = shot.cam;
    studio.camera.far = 140; studio.camera.near = 0.03; studio.fill.intensity = story.look.fill; studio.camera.updateProjectionMatrix();

    const Cm = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    let P = Cm.p[0].map((v, i) => lerp(v, Cm.p[1][i], e));
    const Aim = Cm.a[0].map((v, i) => lerp(v, Cm.a[1][i], e));
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(EV.spill + 0.45, 0.012);
    if (cam === 'sob') { const k = smooth((t - 38.05) / 0.6); Aim[1] += 0.2 * k; P = [P[0] + 0.12 * k, P[1] + 0.12 * k, P[2] + 0.45 * k]; }

    // reset
    CAST.forEach((R) => (R.root.visible = false));
    carts.forEach((k) => (k.visible = false)); homeCart.visible = false;
    [bunny, scanner.g, bone, print.g, bigPrint.g].forEach((g) => (g.visible = false));
    scanner.setBeep(0); polCam.g.visible = false; polCam.setFlash(0); baskets.forEach((b) => (b.visible = true));
    groc.hideAll(); trail.set(TRAIL, 0, t);
    glowA.intensity = 0; glowA.color.set(0xffe8c8); trail.mat.opacity = 0.9;
    pip.g.visible = true; vest.setOn(1); vest.setBadge(t >= EV.badge ? 1 : 0); pip.g.rotation.set(0, 0, 0);
    stock(t < EV.lapse[0] ? 1 : t < EV.lapse[1] ? lerp(1, afterLapse, smooth((t - EV.lapse[0]) / (EV.lapse[1] - EV.lapse[0]))) : afterLapse);
    M.setDoors(0); M.setSunset(t > 60 ? 1 : t > 56 ? 0.35 : 0);
    M.balloons.update(t, EV.balloons);
    M.lane.setBelt(t * 0.32);
    M.lane.setScreen(0);
    const hh = t < 16.8 ? [9, 0] : t < 22.4 ? [11, 0] : t < 25.6 ? [11 + 3.5 * smooth((t - 22.4) / 3.2), 0] : t < 33.6 ? [14, 30] : t < 50 ? [16, 0] : t < 60 ? [17, 0] : [17, 30];
    M.clock.setClock(Math.floor(hh[0]), hh[1] + (hh[0] % 1) * 60);

    if (cam === 'lineup') { lineup(t); setCamera(P, Aim, Cm.fov, t, Cm.amp); return; }
    BEATS[cam](t, u);
    groc.commit();
    setCamera(P, Aim, Cm.fov, t, Cm.amp); studio.camera.updateMatrixWorld();
  }

  // shoppers drifting through the lobby in the background (thumb / badge)
  function lobbyLife(t, which = [1, 2]) {
    if (which.includes(1)) walker(SH[1], 1, t, [7.1, 2.45], [{ t0: shotT0(t), t1: shotT0(t) + 6, pts: [[2.9, 2.4]] }]);
    if (which.includes(2)) walker(SH[2], 2, t, [3.3, 2.3], [{ t0: shotT0(t), t1: shotT0(t) + 5.5, pts: [[7.0, 2.35]] }]);
    if (which.includes(3)) walker(SH[2], 2, t, [1.5, 7.3], [{ t0: shotT0(t), t1: shotT0(t) + 6, pts: [[8.5, 7.25]] }]);   // outside, past the windows
  }
  const shotT0 = (t) => shotAt(t).t0;

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) {
      pipAt(5.45, 4.3, 0.12, { sit: 1, ears: 1, tilt: K(t, [[0, 0.0], [1.0, 0.3], [2.4, 0.3], [3.1, -0.1]]), wag: 0.7, wagRate: 4, lookY: 0.35, headPitch: -0.14, eyes: 'open', mouth: 'smile' }, t);
      lobbyLife(t, [2]);
      glowA.position.set(5.6, 0.7, 4.9); glowA.intensity = 0.6;
    },
    badge(t) {
      const T0 = EV.badge, on = pop(t, T0);
      vest.setBadge(t < T0 ? 0 : Math.max(0.001, on));
      const look = smooth((t - T0 - 0.05) / 0.25) * (1 - smooth((t - 5.15) / 0.3));
      const wig = t > 5.2 && t < 6.4 ? Math.sin((t - 5.2) * 18) : 0;
      const tongue = t > 7.15 && t < 8.4;
      pipAt(5.36, 4.52, PI - 0.18, {
        sit: 1, ears: 1, headPitch: 0.5 * look - 0.12, headYaw: -0.3 * look, wag: t > 5.1 ? 1 : 0.5, wagRate: t > 5.1 ? 6 : 4,
        eyes: t > 5.15 && t < 6.6 ? 'happy' : tongue ? 'happy' : t > T0 && t < 5.2 ? 'wide' : 'open', mouth: tongue ? 'pant' : t > 5.15 ? 'pant' : 'smile',
        tongue: tongue ? 1 : 0, open: tongue ? 0.32 : undefined, tilt: tongue ? 0.24 : 0.08 * wig, hop: t > 5.2 && t < 6.4 ? Math.abs(wig) * 0.025 : 0,
      }, t);
      pip.g.rotation.z = 0.05 * wig;
      toScene(bunny, 1.25); bunny.position.set(5.12, 0, 4.66); bunny.rotation.set(0, 2.6, 0);
      // Mom kneels at his side and clips the badge on; then "aww"
      const p = person(mom, { x: 5.7, z: 4.85, rotY: faceToward(5.7, 4.85, 5.36, 4.45), ...KNEEL, eyes: blink(t, 2), smile: 1, headPitch: 0.35 }, 0);
      if (t < T0) { p.armA = mixArm(REST, REACH_A, smooth((t - 3.5) / 0.5)); p.armB = mixArm(REST, REACH_B, smooth((t - 3.5) / 0.5)); p.lean = 0.25 + 0.15 * smooth((t - 3.5) / 0.5); p.armA.el -= 0.4; p.armB.el -= 0.4; }
      else if (t < 6.8) { const aw = smooth((t - T0 - 0.2) / 0.35); p.armA = mixArm(REACH_A, CHEEK_A, aw); p.armB = mixArm(REACH_B, CHEEK_B, aw); p.mouth = t > 5.0 && t < 6.2 ? 'o' : 'smile'; p.headRoll = 0.1 * Math.sin(t * 6) * aw; p.lean = 0.25; }
      else { p.armA = mixArm(CHEEK_A, BELLY_A, smooth((t - 6.8) / 0.4)); p.armB = mixArm(CHEEK_B, BELLY_B, smooth((t - 6.8) / 0.4)); p.headPitch = 0.1; p.headYaw = 0.4; p.mouth = t > 7.6 ? 'o' : 'smile'; }
      put(mom, p, 0);
      // the manager steps in with the instant camera: FLASH
      const w = walkP(t, [4.1, 5.7], [{ t0: 5.6, t1: 6.6, pts: [[4.88, 5.2]] }]);
      const raise = smooth((t - 6.5) / 0.4);
      const pm = person(mgr, { x: w.x, z: w.z, rotY: t < 6.6 ? (w.head ?? 2.4) : faceToward(4.88, 5.2, 5.36, 4.52), dist: w.dist, speed: w.speed, eyes: t > 7.42 && t < 7.62 ? 'closed' : blink(t, 7), smile: 1, headPitch: 0.25, lean: 0.12 * raise, mouth: t > 7.7 ? 'o' : 'smile' }, 0);
      pm.armA = mixArm(REST, CAM_A, raise); pm.armB = mixArm(REST, CAM_B, raise); put(mgr, pm, 0);
      polCam.g.visible = true; polCam.setFlash(pulseAt(t, [EV.flash], 0.06, 0.01, 0.18));
      // the print slides out of the camera
      if (t > EV.flash + 0.3) {
        mgr.root.updateMatrixWorld(true);
        const k = smooth((t - EV.flash - 0.3) / 0.6), pp = polCam.g.localToWorld(new THREE.Vector3(0.0, -0.05 - 0.08 * k, 0.03));
        print.g.visible = true; print.g.position.copy(pp); print.g.quaternion.copy(polCam.g.getWorldQuaternion(new THREE.Quaternion())); print.g.rotateX(-0.2); print.setDevelop(0.15 * k);
      }
      lobbyLife(t, [3]);
      glowA.position.set(5.3, 0.7, 3.9); glowA.intensity = 0.5;
    },
    doors(t) {
      const op = smooth((t - EV.doors) / 0.7) * (1 - smooth((t - 11.0) / 0.6));
      M.setDoors(op);
      const bk = pulseAt(t, EV.barks, 0.22, 0.05, 0.2), up = smooth((t - 9.55) / 0.25);
      const go = t > 10.3;
      const wp = walkP(t, [5.42, 4.55], [{ t0: 10.3, t1: 11.4, pts: [[5.1, 5.15], [4.7, 5.05]] }]);
      pipAt(go ? wp.x : 5.42, go ? wp.z : 4.55, go ? (wp.head ?? 0) : 0.05, { sit: 1 - up, run: go ? 1 : 0, dist: wp.dist, ears: 1, wag: up > 0.5 ? 1 : 0.6, wagRate: 6, mouth: bk > 0.1 ? 'open' : 'pant', open: bk > 0.1 ? 0.55 * bk : undefined, hop: 0.04 * bk + (t > 9.7 && t < 10.3 ? Math.abs(Math.sin((t - 9.7) * PI * 3.4)) * 0.05 : 0), eyes: 'open', headPitch: -0.2 }, t);
      // shoppers stream in through the doors
      walker(SH[0], 0, t, [5.2, 8.4], [{ t0: 8.9, t1: 11.4, pts: [[5.05, 5.6], [4.7, 4.85]] }], { mouth: t > 10.0 ? 'o' : 'smile', armA: BASKET_A });
      pusher(SH[3], 3, carts[1], t, [5.95, 9.6], [{ t0: 9.0, t1: 11.4, pts: [[5.85, 5.4]] }]);
      walker(SH[4], 4, t, [4.8, 9.6], [{ t0: 9.3, t1: 11.4, pts: [[5.2, 6.4], [5.3, 5.7]] }]);
      walker(SH[5], 5, t, [6.3, 10.2], [{ t0: 9.6, t1: 11.4, pts: [[6.2, 6.6], [6.05, 5.9]] }]);
      walker(SH[6], 6, t, [5.6, 11.2], [{ t0: 9.9, t1: 11.4, pts: [[5.6, 7.4]] }]);
    },
    herdA(t) { herd(t, 'A'); },
    herdB(t) { herd(t, 'B'); },
    sausA(t) {
      // Pip trots up aisle 3, hops onto the box, then onto the cooler's pile, and sits facing us
      const w = walkP(t, [4.15, -1.9], [{ t0: 16.8, t1: 18.0, pts: [[4.0, -3.12]] }]);
      const top = M.bin.topY - 0.02;
      let x = w.x, z = w.z, y = 0, rot = w.head ?? PI, st = { walk: 1, dist: w.dist, ears: 1, wag: 0.8, wagRate: 4.5, mouth: 'pant', eyes: 'open', headPitch: -0.1 };
      const hop = (a, b, t0, d, h) => { const k = clamp((t - t0) / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) + h * 4 * k * (1 - k), lerp(a[2], b[2], k), k]; };
      if (t > 18.0) {
        let q;
        if (t < 18.4) q = hop([4.0, 0, -3.12], [4.0, 0.3, -3.42], 18.05, 0.28, 0.18);
        else q = hop([4.0, 0.3, -3.42], [4.0, top, -3.98], 18.42, 0.32, 0.22);
        x = q[0]; y = q[1]; z = q[2];
        const air = q[3] > 0 && q[3] < 1;
        st = { ...st, walk: 0, run: air ? 1 : 0, dist: t * 2, sit: t > 18.85 ? smooth((t - 18.85) / 0.25) : 0, eyes: t > 19.0 ? 'happy' : 'open', wag: 1, wagRate: 5.5 };
        rot = t < 18.8 ? PI : lerp(PI, 2 * PI + 0.05, smooth((t - 18.75) / 0.2));
      }
      pipAt(x, z, rot, st, t, y);
      // background: a shopper with a cart down the aisle
      pusher(SH[9], 9, carts[2], t, [4.4, -9.3], [{ t0: 16.8, t1: 19.4, pts: [[4.6, -6.4]] }]);
      glowA.position.set(4.3, 1.2, -3.0); glowA.intensity = 0.5;
    },
    sausB(t) {
      const [r1, r2] = EV.reach;
      const look1 = smooth((t - r1 - 0.2) / 0.3) * (1 - smooth((t - r1 + 1.05) / 0.3)), look2 = smooth((t - r2 - 0.15) / 0.3);
      pipAt(4.0, -3.98, 0.05, {
        sit: 1, ears: 1, headYaw: 0.95 * look1 - 0.95 * look2, tilt: 0.25 * Math.max(look1, look2), eyes: look1 + look2 > 0.4 ? 'wide' : 'open', sad: 0.35 * Math.max(look1, look2),
        mouth: look1 + look2 > 0.4 ? 'flat' : 'smile', wag: 0.7, wagRate: 4, headPitch: -0.05,
      }, t, M.bin.topY - 0.02);
      // shopper 1 reaches in… the look… puts it back, sheepish, walks off
      const reach1 = smooth((t - r1) / 0.35) * (1 - smooth((t - r1 - 0.85) / 0.35)), off1 = t > r1 + 1.25;
      if (!off1) { const p = person(SH[2], { x: 4.62, z: -4.6, rotY: -PI / 2 - 0.25, eyes: blink(t, 2), smile: 1, headPitch: 0.35 * reach1, lean: 0.25 * reach1, mouth: t > r1 + 0.45 && t < r1 + 1.2 ? 'o' : 'smile' }); p.armB = mixArm(REST, REACH_B, reach1); p.armB.sx += 0.4 * reach1; p.armA = REST; put(SH[2], p); }
      else walker(SH[2], 2, t, [4.62, -4.6], [{ t0: r1 + 1.25, t1: 22.6, pts: [[5.0, -3.0], [5.05, -1.4]] }], { smile: 1, headYaw: -0.5 });
      // shopper 2 from the other side: reach… the look… "okay, okay"
      const reach2 = smooth((t - r2) / 0.35) * (1 - smooth((t - r2 - 0.6) / 0.3)), hands = smooth((t - r2 - 0.55) / 0.3);
      const p2 = person(SH[3], { x: lerp(3.4, 3.25, hands), z: lerp(-5.0, -5.15, hands), rotY: PI / 2 + 0.25, eyes: blink(t, 3), smile: 1, headPitch: 0.45 * reach2, headYaw: -0.4 * reach2, lean: 0.38 * reach2 - 0.06 * hands, mouth: t > r2 + 0.4 ? 'o' : 'smile' });
      p2.armA = t < r2 + 0.55 ? mixArm(REST, A(-0.95, 0.12, -0.1, 0.2), reach2) : mixArm(REST, HANDS_UP_A, hands); p2.armB = t < r2 + 0.55 ? REST : mixArm(REST, HANDS_UP_B, hands); put(SH[3], p2);
      glowA.position.set(4.2, 1.3, -3.2); glowA.intensity = 0.7;
    },
    lapse(t) {
      // time-lapse: Pip's head snaps left/right, shoppers zip past, the shelves empty, the clock spins
      const k = (t - 22.4) / 3.2;
      pipAt(4.0, -3.98, 0.05, { sit: 1, ears: 1, headYaw: 0.7 * Math.sin(t * 9.5), wag: 0.6, wagRate: 5, eyes: 'open', mouth: 'smile', headPitch: -0.05 }, t, M.bin.topY - 0.02);
      const zip = (P, i, x, z0, v, ph) => { const L = 10.5, z = -9.4 + ((((z0 + 9.4 + v * (t - 22.4) + ph) % L) + L) % L); person(P, { x, z, rotY: v > 0 ? 0 : PI, dist: Math.abs(v) * t, speed: 1.2, eyes: blink(t, i), smile: 1, lean: 0.15, armA: REST, armB: REST }); return z; };
      zip(SH[0], 0, 3.2, -6, 4.2, 0); zip(SH[4], 4, 4.8, -2, -4.6, 3); zip(SH[6], 6, 3.1, -1, 3.8, 6.1); zip(SH[8], 8, 4.85, -8, -4.0, 1.5);
      zip(SH[5], 5, 3.0, -4, -3.6, 7.7);
      glowA.position.set(4.2, 1.4, -3.0); glowA.intensity = 0.5;
    },
    scanA(t) { scan(t, 'A'); },
    scanB(t) {
      const n = 26 + EV.beeps.filter((b) => b >= 28.2 && b < 30.2 && t >= b).length;
      M.lane.setScreen(n);
    },
    scanC(t) { scan(t, 'C'); },
    low(t) {
      const sigh = pulseAt(t, [35.2], 0.6, 0.2, 0.5);
      pipAt(0.3, -3.2, 0.15, { lie: 1, ears: 0.1, sad: 0.55, eyes: sigh > 0.3 ? 'closed' : 'sad', tailDown: 0.6, headPitch: 0.32, lookY: 0.2, wag: 0, mouth: 'smile' }, t);
      toScene(bunny, 1.25); bunny.position.set(0.42, 0.02, -2.92); bunny.rotation.set(0, 0.9, 1.4);
      pusher(SH[9], 9, carts[2], t, [1.05, -7.0], [{ t0: 33.6, t1: 36.4, pts: [[1.05, -0.4]] }], { rotY: 0 });
      walker(SH[1], 1, t, [-0.75, 0.6], [{ t0: 34.0, t1: 36.6, pts: [[-0.8, -5.2]] }]);
      walker(SH[7], 7, t, [-1.0, -8.5], [{ t0: 33.6, t1: 36.6, pts: [[0.8, -8.6]] }], { armB: BASKET_A });
    },
    sob(t) {
      const [s1, s2] = EV.sobs;
      const lift = smooth((t - s1 - 0.25) / 0.3), turn = smooth((t - s2 - 0.05) / 0.35), stand = smooth((t - 38.3) / 0.3);
      pipAt(0.3, -3.2, 0.15 - 0.5 * stand, {
        lie: 1 - stand, ears: 0.25 + 0.75 * lift, earL: t > s1 && t < s1 + 0.6 ? 0.5 : 0, sad: 0.55 * (1 - lift), eyes: turn > 0.4 ? 'wide' : lift > 0.5 ? 'open' : 'sad',
        headPitch: lerp(0.32, -0.08, lift), headYaw: -0.75 * turn, tilt: 0.22 * lift * (1 - turn), lookX: -turn, tailDown: 0.6 * (1 - lift), wag: 0.2 * stand, mouth: 'smile',
      }, t);
      if (t < 38.55) { toScene(bunny, 1.25); bunny.position.set(0.42, 0.02, -2.92); bunny.rotation.set(0, 0.9, 1.4); }
      else holdInMouth(bunny, 0, -0.01, 0.02, [0.2, 0, 0], 1.25 / PIPS);
    },
    tod(t) {
      // she sits against the bottom shelf, rubbing her eyes; Pip trots in, sits, gives her the bunny; hug; giggle
      const give = EV.bunny, hug = smooth((t - give - 0.35) / 0.35), gig = t > EV.giggle;
      const w = walkP(t, [0.25, -4.5], [{ t0: 39.0, t1: 40.15, pts: [[-0.2, -5.6], [-0.6, -6.15]] }]);
      const sitF = lerp(w.head ?? PI, 0.55, smooth((t - 40.1) / 0.35));
      const arrived = t > 40.15;
      pipAt(w.x, w.z, arrived ? sitF : (w.head ?? PI), { walk: arrived ? 0 : 1, dist: w.dist, sit: smooth((t - 40.2) / 0.25), ears: 1, wag: arrived ? 0.8 : 0.5, wagRate: 4, eyes: gig ? 'happy' : 'open', tilt: K(t, [[40.3, 0], [40.6, 0.3], [41.0, 0.1]]), headYaw: arrived ? -0.85 * smooth((t - 40.3) / 0.3) * (1 - 0.5 * smooth((t - 41.5) / 0.4)) : 0, headPitch: arrived ? 0.12 : 0, mouth: gig ? 'pant' : 'smile' }, t);
      const sob = t < give + 0.3;
      const p = person(tod, { x: -1.1, z: -6.38, rotY: 1.0, y: -0.68, footFwd: 0.62, eyes: sob ? (Math.sin(t * 5) > 0 ? 'closed' : 'open') : gig ? 'closed' : 'open', mouth: sob ? 'o' : 'smile', tear: t < give + 0.6, headPitch: sob ? 0.25 + 0.05 * Math.sin(t * 9) : 0.05, headRoll: gig ? 0.18 * Math.sin(t * 8) : 0, headYaw: sob ? 0 : -0.15 }, 0);
      if (sob) { const rub = Math.sin(t * 7) * 0.12; p.armA = mixArm(REST, A(-0.5 + rub, 0.1, -2.3, 0.9), smooth((t - 39.0) / 0.3) * (1 - smooth((t - give) / 0.3))); p.armB = mixArm(REST, A(-0.5 - rub, 0.1, -2.3, -0.9), smooth((t - 39.0) / 0.3) * (1 - smooth((t - give) / 0.3))); }
      else { p.armA = mixArm(REACH_A, HUG_A, hug); p.armB = mixArm(REACH_B, HUG_B, hug); }
      put(tod, p, 0);
      // the bunny: in his mouth → onto her lap → hugged
      if (t < give) holdInMouth(bunny, 0, -0.01, 0.02, [0.2, 0, 0], 1.25 / PIPS);
      else {
        toScene(bunny, 1.25);
        tod.root.updateMatrixWorld(true);
        const lap = tod.spine.localToWorld(new THREE.Vector3(0, -0.02, 0.28)), chest = tod.spine.localToWorld(new THREE.Vector3(0, 0.2, 0.22));
        const from = new THREE.Vector3(-0.72, 0.3, -6.12), k = smooth((t - give) / 0.3);
        const pos = t < give + 0.35 ? from.clone().lerp(lap, k) : lap.clone().lerp(chest, hug);
        pos.y += t < give + 0.35 ? 0.06 * Math.sin(k * PI) : 0;
        bunny.position.copy(pos).add(new THREE.Vector3(0, -0.08, 0)); bunny.rotation.set(0, 1.0 + PI, 0);
      }
      glowA.position.set(-0.6, 0.7, -5.4); glowA.intensity = 0.6;
    },
    sniff(t) {
      const [n0, n1] = [EV.sniff[0], EV.sniff[EV.sniff.length - 1]];
      const toHer = 1 - smooth((t - 43.55) / 0.3), up = smooth((t - 43.75) / 0.35), rot = lerp(faceToward(-0.6, -6.15, -1.1, -6.38), 0.15, smooth((t - 43.6) / 0.4));
      pipAt(-0.6, -6.15, rot, { sit: t < 45.3 ? 1 : 0, ears: 1, sniff: t > n0 && t < n1 + 1.4 ? 1 : 0, lean: 0.18 * toHer, headPitch: lerp(0.1, -0.62, up), eyes: up > 0.5 ? 'closed' : 'open', wag: 0.9, wagRate: 5, mouth: 'smile' }, t);
      trail.set(TRAIL, clamp((t - EV.trail[0]) / (EV.trail[1] - EV.trail[0])), t);
      // she stands up hugging the bunny, steps to his side, takes his vest handle
      const st = smooth((t - 45.0) / 0.5), tx = lerp(-1.1, -0.8, st), tz = lerp(-6.38, -5.98, st);
      const p = person(tod, { x: tx, z: tz, rotY: lerp(1.0, 0.25, st), y: lerp(-0.68, 0, st), footFwd: lerp(0.62, 0, st), eyes: blink(t, 3), smile: 1, headPitch: -0.15, headYaw: 0.3 * (1 - st), armA: HUG_A, armB: t > 45.6 ? DOWN_B : HUG_B }, 0);
      toScene(bunny, 1.25); tod.root.updateMatrixWorld(true); bunny.position.copy(tod.spine.localToWorld(new THREE.Vector3(-0.06, 0.12, 0.22))).add(new THREE.Vector3(0, -0.08, 0)); bunny.rotation.set(0, p.rotY + PI, 0);
      glowA.position.set(-0.3, 0.8, -5.2); glowA.intensity = 0.6;
    },
    lead(t) { leadBeat(t, 'A'); },
    lead2(t) { leadBeat(t, 'B'); },
    reunion(t) {
      const hug = EV.hug, turn = smooth((t - 50.3) / 0.3), kneel = smooth((t - 50.55) / 0.35) * (1 - smooth((t - hug - 0.05) / 0.5));
      trail.set(TRAIL, 1, t); trail.mat.opacity = 0.9 * (1 - smooth((t - 50.4) / 1.2));
      // the toddler lets go and runs the last steps to her mom
      const w = walkP(t, [3.72, 2.55], [{ t0: 50.6, t1: hug, pts: [[4.32, 3.0]] }]);
      const tmX = 4.65, tmZ = 3.35, tmRot = lerp(0.4, faceToward(tmX, tmZ, 3.9, 2.7), turn);
      const pm = person(tmom, { x: tmX, z: tmZ, rotY: tmRot, ...(kneel > 0 ? { crouch: 0.42 * kneel, lean: 0.4 * kneel } : {}), eyes: t > hug + 0.2 ? 'closed' : blink(t, 9), smile: t > 50.4 ? 1 : 0, mouth: t < 50.4 ? 'o' : t < hug + 0.1 ? 'o' : 'smile', headYaw: t < 50.3 ? 0.4 * Math.sin(t * 3) : 0, headPitch: kneel > 0 ? 0.25 : 0.05 }, 0);
      if (t < 50.4) { pm.armA = MOUTH_A; pm.armB = MOUTH_B; }
      else if (t < hug) { pm.armA = mixArm(MOUTH_A, REACH_A, smooth((t - 50.45) / 0.3)); pm.armB = mixArm(MOUTH_B, REACH_B, smooth((t - 50.45) / 0.3)); }
      else { pm.armA = HUG_A; pm.armB = HUG_B; pm.headRoll = 0.12 * Math.sin((t - hug) * 3.2); pm.rotY = tmRot + 0.18 * Math.sin((t - hug) * 2.4); }
      put(tmom, pm, 0);
      if (t < hug) { const p = person(tod, { x: w.x, z: w.z, rotY: w.head ?? 0.9, dist: w.dist, speed: w.speed, eyes: 'open', smile: 1, mouth: 'o', armA: REACH_A, armB: REACH_B, lean: 0.12 }, 0); toScene(bunny, 1.25); tod.root.updateMatrixWorld(true); bunny.position.copy(handWorld(tod, -1)).add(new THREE.Vector3(0, -0.07, 0)); bunny.rotation.set(0, p.rotY + PI, 0); }
      else { carry(tod, tmom, t, { yaw: 0.9 }); toScene(bunny, 1.25); tod.root.updateMatrixWorld(true); bunny.position.copy(handWorld(tod, 1)).add(new THREE.Vector3(0, -0.08, 0)); bunny.rotation.set(0, tmRot, 0); }
      // Pip arrives and sits, tail at full speed
      const pw = walkP(t, [3.45, 2.45], [{ t0: 50.0, t1: 50.9, pts: [[4.25, 2.7]] }]);
      pipAt(pw.x, pw.z, t < 50.9 ? (pw.head ?? 1.2) : faceToward(4.25, 2.7, 4.6, 3.3), { walk: t < 50.9 ? 1 : 0, dist: pw.dist, sit: smooth((t - 50.95) / 0.25), ears: 1, wag: 1, wagRate: 6, eyes: t > hug ? 'happy' : 'open', mouth: 'pant', headPitch: -0.3 }, t);
      // Mom + the manager (they were searching) melt
      const mp = person(mom, { x: 4.05, z: 4.1, rotY: faceToward(4.05, 4.1, 4.5, 3.1), eyes: blink(t, 2), smile: 1, mouth: t > hug && t < 52.6 ? 'o' : 'smile', armA: MOUTH_A, armB: MOUTH_B }, 0);
      if (t > hug) { mp.armA = CHEEK_A; mp.armB = CHEEK_B; put(mom, mp, 0); }
    },
    cheer(t) {
      // everybody claps; the balloon net drops; she hands the bunny back
      const back = EV.bunnyBack, kn = smooth((t - 54.85) / 0.4);
      const pm = person(tmom, { x: 4.65, z: 3.35, rotY: faceToward(4.65, 3.35, 4.2, 2.95), crouch: 0.3 * kn, lean: 0.3 * kn, eyes: blink(t, 9), smile: 1, mouth: (t % 1.1) < 0.4 ? 'o' : 'smile', armA: HUG_A, armB: HUG_B, headPitch: 0.15 * kn }, 0);
      carry(tod, tmom, t, { yaw: -0.3, pose: { eyes: 'open', mouth: t < back + 0.4 ? 'o' : 'smile', armB: t > 54.9 && t < back + 0.3 ? REACH_B : HUG_B } });
      if (t < back) { toScene(bunny, 1.25); tod.root.updateMatrixWorld(true); bunny.position.copy(handWorld(tod, 1)).add(new THREE.Vector3(0, -0.08, 0)); bunny.rotation.set(0, tmom.root.rotation.y, 0); }
      else holdInMouth(bunny, 0, -0.01, 0.02, [0.2, 0, 0], 1.25 / PIPS);
      const hopK = t > 53.6 && t < 54.9 ? Math.abs(Math.sin((t - 53.6) * PI * 2.6)) * 0.07 : 0;
      pipAt(4.2, 2.95, faceToward(4.2, 2.95, 4.65, 3.35) - 0.3, { sit: t > 54.9 ? 1 : 0, ears: 1, wag: 1, wagRate: 6.5, eyes: 'happy', mouth: t < back ? 'pant' : 'smile', hop: hopK, headPitch: -0.25, lookY: 0.4 }, t);
      const ring = [[SH[9], 9, 3.9, 3.7], [SH[0], 0, 3.95, 4.35], [SH[5], 5, 4.4, 4.8], [SH[6], 6, 4.9, 4.85], [SH[2], 2, 5.35, 4.35], [SH[3], 3, 5.65, 3.8], [mom, 2, 5.25, 3.0], [mgr, 7, 4.15, 3.75]];
      ring.forEach(([R, i, x, z]) => { const [a, b] = clap(t, i); person(R, { x, z, rotY: faceToward(x, z, 4.5, 3.2), eyes: (t + i * 0.3) % 1.6 < 0.4 ? 'closed' : blink(t, i), smile: 1, mouth: (t * 1.3 + i * 0.37) % 1.2 < 0.45 ? 'o' : 'smile', armA: a, armB: b, headPitch: -0.05, headRoll: 0.06 * Math.sin(t * 5 + i) }, 0); });
      baskets[0].visible = false;
      glowA.position.set(4.6, 1.2, 4.4); glowA.intensity = 0.6;
    },
    eotmA(t) {
      // the manager pins Pip's photo into the gold frame; Pip watches from the floor
      const pin = EV.pin, reach = smooth((t - 56.5) / 0.4), away = smooth((t - pin - 0.35) / 0.5);
      const slot = M.eotm.photoSlot; slot.updateMatrixWorld(true);
      const sp = slot.getWorldPosition(new THREE.Vector3()), sq = slot.getWorldQuaternion(new THREE.Quaternion());
      const p = person(mgr, { x: lerp(7.42, 7.25, away), z: lerp(4.72, 5.05, away), rotY: lerp(PI / 2 + 0.25, -PI / 2 - 0.5, away), eyes: blink(t, 7), smile: 1, headPitch: -0.1, headYaw: -0.25 * (1 - away) }, 0);
      p.armB = mixArm(REST, PIN_B, reach * (1 - away)); p.armA = REST; put(mgr, p, 0);
      bigPrint.g.visible = true; bigPrint.setDevelop(1);
      if (t < pin) { mgr.root.updateMatrixWorld(true); const h = handWorld(mgr, 1); bigPrint.g.position.copy(h).lerp(sp, 0.15); bigPrint.g.quaternion.copy(sq); bigPrint.g.rotateZ(0.2 * (1 - smooth((t - 56.5) / 0.4))); }
      else { const k = smooth((t - pin) / 0.15); bigPrint.g.position.copy(sp).add(new THREE.Vector3(-0.02 * (1 - k), 0, 0)); bigPrint.g.quaternion.copy(sq); bigPrint.g.rotateZ(-0.05); }
      pipAt(7.35, 3.85, PI / 2 - 0.2, { sit: 1, ears: 1, headPitch: -0.55, lookY: 1, wag: 0.9, wagRate: 5.5, eyes: 'open', mouth: 'smile' }, t);
    },
    eotmB(t) {
      const give = EV.biscuit, offer = smooth((t - 58.5) / 0.45), got = t > give;
      const P0 = [7.3, 4.02], fr = faceToward(P0[0], P0[1], 6.45, 3.55);
      pipAt(P0[0], P0[1] - (got ? 0 : 0.04 * smooth((t - give + 0.35) / 0.3)), fr + (got ? 0 : 0.35 * offer), { sit: 1, ears: 1, wag: got ? 1 : 0.7, wagRate: got ? 6.5 : 4.5, eyes: got ? 'happy' : 'wide', mouth: got ? 'smile' : t > give - 0.3 ? 'open' : 'smile', open: !got && t > give - 0.3 ? 0.25 : undefined, headPitch: got ? -0.15 : -0.3, lean: got ? 0 : 0.12 * smooth((t - give + 0.4) / 0.3), hop: got && t < give + 0.8 ? Math.abs(Math.sin((t - give) * PI * 3)) * 0.04 : 0 }, t);
      toScene(bunny, 1.25); bunny.position.set(7.48, 0, 4.25); bunny.rotation.set(0, -1.2, 0);
      const kx = 7.7, kz = 4.42, p = person(mgr, { x: kx, z: kz, rotY: faceToward(kx, kz, P0[0], P0[1]), ...KNEEL, lean: 0.3, eyes: blink(t, 7), smile: 1, headPitch: 0.35, mouth: got ? 'o' : 'smile' }, 0);
      p.armB = mixArm(REST, REACH_B, offer * (got ? 1 - smooth((t - give - 0.2) / 0.4) : 1)); p.armB.sx += 0.35 * offer; p.armA = A(-0.2, 0.1, -0.4); put(mgr, p, 0);
      bone.visible = true;
      if (!got) { toScene(bone, 1); mgr.root.updateMatrixWorld(true); bone.position.copy(handWorld(mgr, 1)).add(new THREE.Vector3(0, -0.02, 0)); bone.rotation.set(0, mgr.root.rotation.y + PI / 2, 0.1); }
      else holdInMouth(bone, 0, -0.004, 0.025, [0, 0, 0], 1 / PIPS);
      glowA.position.set(6.9, 0.7, 3.7); glowA.intensity = 0.7;
    },
    home(t) {
      // sunset: Mom wheels the cart to the doors; Pip asleep in the basket with his bunny + biscuit
      M.setDoors(smooth((t - 61.4) / 0.7));
      const w = walkP(t, [5.75, 2.3], [{ t0: 60.2, t1: 64.5, pts: [[5.8, 4.4]] }]);
      const p = person(mom, { x: w.x, z: w.z, rotY: 0.02, dist: w.dist, speed: w.speed, armA: PUSH_A, armB: PUSH_B, lean: 0.08, eyes: blink(t, 2), smile: 1, headPitch: 0.25, headYaw: 0.1 }, 0);
      placeCart(homeCart, w.x, w.z, 0.02); homeCart.userData.load.visible = false;
      homeCart.updateMatrixWorld(true);
      // asleep in the child seat by the handle, his bunny tucked in, the biscuit beside him
      const bp = homeCart.localToWorld(new THREE.Vector3(0.0, 1.0, -0.3));
      pipAt(bp.x, bp.z, 0.02 + PI / 2 + 0.35, { sleep: 1, ears: 0.5, tilt: 0.3, wag: 0.1, wagRate: 1.2 }, t, bp.y);
      toScene(bunny, 1.25); bunny.position.copy(homeCart.localToWorld(new THREE.Vector3(0.12, 1.0, -0.2))); bunny.rotation.set(0, -0.4, 1.35);
      toScene(bone, 1); bone.position.copy(homeCart.localToWorld(new THREE.Vector3(-0.15, 1.02, -0.18))); bone.rotation.set(PI / 2, 0, 0.6);
      glowA.position.set(5.5, 1.4, 5.0); glowA.color.set(0xffc890); glowA.intensity = 0.8;
    },
  };

  // greeter: zoomies around the shoppers until they stand in one tight huddle
  function herd(t, view) {
    const [h0, h1] = EV.herd, k = smooth((t - 11.6) / 2.4);
    const th = 0.6 + (2 * PI * (t - h0)) / 1.9, rp = lerp(1.2, 0.85, smooth((t - h0) / 3.5));
    const px = C.x + rp * Math.cos(th), pz = C.z + rp * Math.sin(th);
    pipAt(px, pz, Math.atan2(-Math.sin(th), Math.cos(th)) + 0.0, { run: 1, dist: rp * th, ears: 1, earsBack: 0.4, wag: 1, wagRate: 6, mouth: 'pant', eyes: 'happy', headYaw: -0.35 }, t);
    pip.g.rotation.z = -0.12;
    const ring = [[SH[0], 0, 0.5, 0.95], [SH[3], 3, 1.75, 1.0], [SH[4], 4, 3.0, 0.9], [SH[5], 5, 4.2, 1.0], [SH[6], 6, 5.35, 0.95]];
    ring.forEach(([R, i, a, r0], j) => {
      const r = lerp(r0, 0.34, k), aa = a + 0.25 * k, x = C.x + r * Math.cos(aa), z = C.z + r * Math.sin(aa);
      const outward = Math.atan2(Math.cos(aa), Math.sin(aa));
      const facePip = faceToward(x, z, px, pz);
      const rot = view === 'A' ? lerp(facePip, outward, k * 0.6) : outward + 0.25 * Math.sin(t * 2 + j);
      const laugh = (t * 1.4 + j * 0.31) % 1.1 < 0.45;
      const p = person(R, { x, z, rotY: rot, dist: r * 6, speed: k < 0.98 ? 0.25 : 0, eyes: laugh && view === 'B' ? 'closed' : blink(t, i), smile: 1, mouth: laugh ? 'o' : 'smile', headYaw: 0.35 * Math.sin(t * 3 + j), headPitch: -0.05, lean: -0.05, armA: j === 0 ? BASKET_A : mixArm(REST, j % 2 ? CHEEK_A : BELLY_A, k), armB: mixArm(REST, j % 2 ? CHEEK_B : BELLY_B, k) }, 0);
    });
    // abandoned carts parked outside the circle
    carts[1].visible = true; carts[1].position.set(7.3, 0, 4.1); carts[1].rotation.set(0, 2.6, 0);
    carts[3].visible = true; carts[3].position.set(3.45, 0, 3.55); carts[3].rotation.set(0, -0.5, 0);
  }

  // checkout: Pip scans shoes; the belt jams; the avalanche (view A = low on the shoes, C = the spill + the queue)
  function scan(t, view) {
    const beeps = EV.beeps, bp = pulseAt(t, beeps, 0.12, 0.02, 0.15);
    const n = 23 + beeps.filter((b) => t >= b).length;
    M.lane.setScreen(Math.min(n, 31));
    const PX = 2.8, PZ = 4.72;
    const down = view === 'A' ? smooth((t - 26.1) / 0.3) : 0.3 + 0.4 * pulseAt(t, [32.1], 0.6);
    const spill = view === 'C' && t > EV.spill;
    pipAt(PX, PZ, view === 'C' ? PI / 2 + 0.55 : PI + 0.05, { sit: 1, ears: 1, headPitch: 0.4 * down - 0.05, headYaw: view === 'A' ? 0.12 : spill && t < 31.6 ? 0.5 * Math.sin((t - EV.spill) * 7) : 0, eyes: spill && t < 31.4 ? 'wide' : bp > 0.3 ? 'happy' : 'open', wag: 1, wagRate: 5.5, mouth: 'smile' }, t);
    holdInMouth(scanner.g, 0, 0.0, 0.035, [0.15, 0, 0], 1 / PIPS); scanner.setBeep(bp);
    // the customer at the card reader (her shoes are what he scans), then the next one
    if (view === 'A') {
      const off = t > 27.3;
      if (!off) person(SH[6], { x: 2.86, z: 4.32, rotY: -PI / 2 + 0.2, eyes: blink(t, 6), smile: 1, footFwd: 0.04 }, 0);
      else walker(SH[6], 6, t, [2.86, 4.32], [{ t0: 27.3, t1: 28.4, pts: [[3.45, 4.95], [4.6, 5.4]] }]);
      if (t < 27.75) walker(SH[8], 8, t, [2.95, 2.6], [{ t0: 26.8, t1: 27.75, pts: [[2.86, 4.32]] }], { rotY: 0 });
      else person(SH[8], { x: 2.86, z: 4.32, rotY: -PI / 2 + 0.25, eyes: blink(t, 8), smile: 1 }, 0);
    } else {
      // lane 2's queue turns round and laughs across the counter
      [[SH[8], 8, 1.05, 3.95], [SH[4], 4, 0.85, 4.55], [SH[1], 1, 1.15, 5.15]].forEach(([R, i, x, z], j) => {
        const laugh = spill && (t * 1.5 + j * 0.4) % 1.0 < 0.45;
        person(R, { x, z, rotY: faceToward(x, z, 2.8, 4.6) + 0.15 * (j - 1), eyes: laugh ? 'closed' : blink(t, i), smile: 1, mouth: spill ? (laugh ? 'o' : 'smile') : 'smile', armA: spill ? (j === 1 ? MOUTH_A : CHEEK_A) : REST, armB: spill ? (j === 1 ? MOUTH_B : CHEEK_B) : REST, headPitch: spill ? -0.1 + 0.08 * Math.sin(t * 9 + j) : 0.15 }, 0);
      });
    }
    // groceries: jammed on the belt, then shoved off the customer side in a cascade
    const top = LD.top + 0.005;
    for (let i = 0; i < groc.n; i++) {
      const kd = groc.kind(i), hh = groc.halfH[kd], r = Math.floor((i % 30) / 3) % 10, lane = i % 3, layer2 = i >= 30;
      const x0 = LD.x - 0.2 + lane * 0.2 + (hash(i) - 0.5) * 0.04, z0 = 4.48 - r * 0.165 - (layer2 ? 0 : 0) + (hash(i, 1) - 0.5) * 0.03;
      const y0 = top + hh + (layer2 ? 0.2 + 0.12 * Math.floor((i - 30) / 15) : 0);
      if (view === 'A') { if (z0 > 3.4) groc.set(i, new THREE.Vector3(x0, y0, z0), 0, hash(i, 2) * 2, 0); continue; }
      const tl = EV.spill + (layer2 ? -0.1 + 0.03 * ((i - 30) % 15) : r * 0.09) + lane * 0.03;
      if (t < tl) { groc.set(i, new THREE.Vector3(x0, y0, z0), 0, hash(i, 2) * 2, 0); continue; }
      // slide over the rail (x 2.42), then fall to the floor, then roll / settle
      const vx = 0.45 + 0.4 * hash(i, 3), vz = 0.35 + 0.6 * hash(i, 4), xr = LD.x + 0.42;
      const t1 = (xr - x0) / vx, tau = t - tl;
      let p, rx = 0, ry = hash(i, 2) * 2, rz = 0;
      const lieFinal = kd === 1 || kd === 2 || (kd === 0 && hash(i, 5) < 0.6);
      if (tau < t1) { p = new THREE.Vector3(x0 + vx * tau, y0 + 0.03 * Math.sin(PI * tau / t1), z0 + vz * tau); rz = -0.4 * (tau / t1); }
      else {
        const y1 = y0 + 0.02, tf = Math.sqrt(2 * (y1 - hh) / 9.8), ta = tau - t1;
        if (ta < tf) { p = new THREE.Vector3(xr + vx * 0.8 * ta, y1 - 4.9 * ta * ta, z0 + vz * t1 + vz * ta); rz = -0.4 - 6 * ta * (hash(i, 6) + 0.5); rx = 3 * ta * (hash(i, 7) - 0.5); }
        else {
          const tr = ta - tf, roll = kd === 3 || (kd === 0 && lieFinal) ? 1 : 0.25, dec = 3.5;
          const L = (1 - Math.exp(-dec * tr)) / dec * roll;
          const lx = xr + vx * 0.8 * tf + vx * 0.6 * L, lz = z0 + vz * (t1 + tf) + vz * L;
          const lh = lieFinal ? (kd === 1 ? 0.028 : kd === 2 ? 0.035 : 0.04) : hh;
          p = new THREE.Vector3(lx, lh + 0.06 * Math.abs(Math.sin(tr * 9)) * Math.exp(-tr * 6), lz);
          rz = lieFinal ? -PI / 2 : 0; rx = kd === 1 ? PI / 2 * (lieFinal ? 1 : 0) : 0; if (kd === 1) rz = 0;
          if (kd === 0 || kd === 3) rx += (vx * 0.6 * L) / 0.04;
        }
      }
      // never on Pip, never on the customers' feet
      const dx = p.x - PX, dz = p.z - PZ, dd = Math.hypot(dx, dz);
      if (dd < 0.3 && p.y < 0.5) { p.x = PX + dx / Math.max(dd, 1e-3) * 0.3; p.z = PZ + dz / Math.max(dd, 1e-3) * 0.3; }
      groc.set(i, p, rx, ry, rz);
    }
    if (view === 'C') { glowA.position.set(3.1, 1.2, 5.2); glowA.intensity = 0.6; }
  }

  // she holds his vest handle; they follow the trail up aisle 2 (A) and round the front toward the lobby (B)
  function leadBeat(t, view) {
    let w;
    if (view === 'A') w = walkP(t, [-0.05, -4.35], [{ t0: 46.0, t1: 48.2, pts: [[0.0, -2.25]] }]);
    else w = walkP(t, [0.0, 0.1], [{ t0: 48.2, t1: 49.45, pts: [[0.1, 1.6], [0.55, 2.4], [1.5, 2.45]] }]);
    const h = w.head ?? (view === 'A' ? 0 : PI / 2);
    pipAt(w.x, w.z, h, { walk: 1, dist: w.dist, ears: 1, wag: 0.9, wagRate: 4.5, mouth: 'pant', eyes: 'open', headPitch: -0.25, sniff: 1 }, t);
    trail.set(TRAIL, 1, t);
    // the toddler walks at his left, hand on the handle
    const sx = -Math.cos(h) * 0.24, sz = Math.sin(h) * 0.24;
    const p = person(tod, { x: w.x + sx, z: w.z + sz, rotY: h, dist: w.dist, speed: w.speed, eyes: blink(t, 3), smile: 1, mouth: (t % 1.4) < 0.5 ? 'o' : 'smile', armA: HUG_A, armB: A(-0.35, 0.42, -0.15, -0.2), headYaw: 0.25 * Math.sin(t * 2) }, 0);
    toScene(bunny, 1.25); tod.root.updateMatrixWorld(true); bunny.position.copy(tod.spine.localToWorld(new THREE.Vector3(-0.06, 0.12, 0.22))).add(new THREE.Vector3(0, -0.08, 0)); bunny.rotation.set(0, h + PI, 0);
    if (view === 'A') {
      person(SH[4], { x: 0.72, z: -6.4, rotY: -0.6, eyes: blink(t, 4), smile: 1, mouth: 'o', armA: CHEEK_A, armB: CHEEK_B }, 0);
      placeCart(carts[0], 1.05, -7.3, 0.2);
      person(SH[7], { x: -0.8, z: -6.9, rotY: 0.45, eyes: blink(t, 7), smile: 1, armB: BASKET_A, armA: CHEEK_A }, 0);
    } else {
      person(SH[0], { x: -0.75, z: 0.2, rotY: faceToward(-0.75, 0.2, w.x, w.z), eyes: blink(t, 0), smile: 1, armA: BASKET_A, armB: CHEEK_B, mouth: 'o' }, 0);
      person(SH[5], { x: 0.95, z: -0.6, rotY: faceToward(0.95, -0.6, w.x, w.z), eyes: blink(t, 5), smile: 1, armA: CHEEK_A, armB: CHEEK_B }, 0);
    }
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200)
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    const i = Math.floor(t - 200);
    const L = [{ sit: 1 }, { walk: 1 }, { lie: 1 }, { sleep: 1 }, { sit: 1, mouth: 'pant', tongue: 1, open: 0.32, eyes: 'happy' }, { run: 1 }][i % 6];
    pipAt(0, 0, (t - 200) % 1 > 0.4 ? 1.2 : 0.35, { ...L, still: true }, t);
    holdInMouth(scanner.g, 0, 0.0, 0.035, [0.15, 0, 0], 1 / PIPS);
    person(tod, { x: 0.45, z: -0.2, rotY: -0.4, y: i % 2 ? -0.68 : 0, footFwd: i % 2 ? 0.62 : 0, eyes: 'open', smile: 1, armA: HUG_A, armB: DOWN_B }, 0);
  }

  return { update };
}
