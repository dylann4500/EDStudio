// VIDEO 030 — "What if nobody at the dog park wanted to play with Pip?"  (Pip ep. 3 · lane 3 @ed._.sims · storybook tone)
// 65.8 s, 17 shots, one new set (engine/sets/dogpark.js) seen from many spots. Mia takes Pip to the big dog park for the first
// time; he brings his bunny to share. Rule of three, each a small aloof "no": the husky band (his audition is a squeak — "they
// said they'd call him"), the freshly groomed poodles (he says hi the corgi way: a wet-dog shake — their pom-poms frizz and they
// prance off), Moose the lab (only loves his ball; runs right past him, twice — the wind spins Pip around). Low point by the
// fence (~58 %). Then "Almost nobody": tiny Bean shivers under Mrs. Rosa's bench, also alone. Pip gives Bean his bunny. Bean
// does zoomies; Pip does zoomies; zoomies are contagious — the whole park joins (HUD DOGS PLAYING WITH PIP 0 → 1 → 2 → 14).
// Warm button: the noon puppy pile under the big tree, Pip and Bean sharing the bunny, Mia laughing in the middle.
// No dog is ever mean (busy, aloof, posh), Pip is never hurt (the spins are wind, he plops on his bottom and wags).
// NEW (reusable): engine/sets/dogpark.js (BARK PARK), engine/dogbreeds.js (breed presets on makePip: husky, poodle with
// frizz-able pom-poms, lab, chihuahua, dalmatian, beagle, dachshund, pug, samoyed) + makePip({legs, snout, long, stride}).
// Event times live in story.json → "pip" so make_cues.py syncs the foley to the same numbers.
//
// Source (checked Oct 27, 2026): the AKC calls zoomies "Frenetic Random Activity Periods (FRAPs)" — sudden bursts of pent-up
// energy, most common in puppies and young dogs — akc.org/expert-advice/lifestyle/what-are-zoomies/. Every other HUD number is
// a story number (the band's openings, balls thrown, times Pip said hi).
//
// Shot list (seconds)                    | where           | what happens
//  0.0– 3.4 thumb   10:02 AM               | inside the gate | the question over Pip (bunny in his mouth), dogs racing behind him
//  3.4– 7.6 gate                           | vestibule       | Mia opens the inner gate; Pip charges into the busy park
//  7.6–11.8 plan                           | by the gate     | he sets the bunny down, looks around, play-bows: plan = one friend
// 11.8–15.6 huskA   THE BIG TREE           | big tree        | three huskies howl in a row, Jules strums a ukulele; Pip sits at the end
// 15.6–20.0 huskB                          | big tree        | Pip's "awoo" is a squeak; the band stops, stares down… and carries on
// 20.0–23.6 poodA   THE KIDDIE POOL        | pool + table    | Pip splashes in the kiddie pool; three groomed poodles pose on the table
// 23.6–28.0 poodB                          | table           | he trots over, shakes: spray, pom-poms FRIZZ; noses up, they prance off
// 28.0–31.6 labA    THE BIG FIELD          | field           | Moose stares at the ball in Dan's hand; Pip sits beside him and stares too
// 31.6–35.4 labB                           | field           | the throw: Moose blasts past (Pip spins, plops), comes back past (spins again)
// 35.4–38.0 aloneA  THE FENCE              | right fence     | Pip lies by the fence with his bunny; every group plays far away
// 38.0–41.0 aloneB                         | right fence     | close: chin on paws, a sigh… ears perk
// 41.0–43.6 bean    UNDER THE BENCH        | Rosa's bench    | tiny Bean shivers under the bench, knitting needles above
// 43.6–48.8 gift    (0 → 1)                | Rosa's bench    | Pip trots in, sets his bunny in front of Bean, nudges it; Bean's tail starts
// 48.8–52.4 zoomA   (→ 2)                  | front lawn      | Bean grabs the bunny and zooms; Pip zooms after him; Mia + Rosa laugh
// 52.4–56.4 zoomB   (→ 14)                 | the whole park  | crane: band, poodles, Moose, everyone peels off and joins the loop
// 56.4–58.8 zoomC                          | the loop        | pet's-eye: the pack thunders past the lens, Pip + Bean in front
// 58.8–65.8 pile    12:00 PM               | big tree        | the puppy pile, Mia in the middle; end card 61.8
import * as THREE from 'three';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeBunny } from '@engine/props.js';
import { buildDogPark, DIMS as DP } from '@engine/sets/dogpark.js';
import { makePip, makeMia, poseScaled, pulseAt } from '@engine/pip.js';
import { makeBreed } from '@engine/dogbreeds.js';

const PI = Math.PI;
const PIPS = 0.92;
const SEAT = DP.seatY;
// spots (park coordinates)
const HUSK = [[-6.6, -3.9, 0.55], [-5.75, -3.4, 0.5], [-4.9, -2.9, 0.42]];          // the band (x, z, rotY), a diagonal row
const PIP_BAND = [-4.1, -2.45];
const POOD_T = [[6.08, 1.45], [6.5, 1.55], [6.92, 1.45]];                              // on the pause table (y = tableY)
const POOD_ROW = [[9.4, -0.4], [10.1, -0.65], [10.8, -0.9]];                          // where they flounce off to
const POOL = DP.pool, TABLE = DP.table;
const DAN = [2.75, -2.15], MOOSE_SIT = [3.25, -2.75], PIP_LAB = [3.75, -2.8];
const FENCE = [14.4, 7.6], FENCE_ROT = -2.356;
const BENCH = [11.6, 10.25];
const BEAN_SPOT = [11.6, 10.12];
const PIP_GIFT = [12.02, 9.45], BUNNY_GIFT = [11.72, 9.8];
const ZA = [11.0, 7.4], ZA_R = 0.85;                                                // Bean's first zoomie circle
const ZL = { cx: 2.2, cz: -2.6, rx: 2.6, rz: 3.6 };                                   // the whole-park loop (Dan + Moose in the middle)
const PILE = [-5.3, -3.5];

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb' },
  { t0: 3.4, t1: 7.6, cam: 'gate' },
  { t0: 7.6, t1: 11.8, cam: 'plan' },
  { t0: 11.8, t1: 15.6, cam: 'huskA' },
  { t0: 15.6, t1: 20.0, cam: 'huskB' },
  { t0: 20.0, t1: 23.6, cam: 'poodA' },
  { t0: 23.6, t1: 28.0, cam: 'poodB' },
  { t0: 28.0, t1: 31.6, cam: 'labA' },
  { t0: 31.6, t1: 35.4, cam: 'labB' },
  { t0: 35.4, t1: 38.0, cam: 'aloneA' },
  { t0: 38.0, t1: 41.0, cam: 'aloneB' },
  { t0: 41.0, t1: 43.6, cam: 'bean' },
  { t0: 43.6, t1: 48.8, cam: 'gift' },
  { t0: 48.8, t1: 52.4, cam: 'zoomA' },
  { t0: 52.4, t1: 56.4, cam: 'zoomB' },
  { t0: 56.4, t1: 58.8, cam: 'zoomC' },
  { t0: 58.8, t1: 70, cam: 'pile' },
];
const c = (p0, p1, a0, a1, fov, amp = 0.003) => ({ p: [p0, p1], a: [a0, a1], fov, amp });
export const CAMS = {
  thumb:  c([-7.72, 0.4, 8.72], [-7.74, 0.4, 8.6], [-7.98, 0.55, 7.6], [-7.98, 0.55, 7.6], 48, 0.002),
  gate:   c([-9.05, 1.5, 13.1], [-9.0, 1.42, 12.7], [-8.6, 0.45, 6.5], [-8.2, 0.38, 6.0], 54),
  plan:   c([-6.55, 0.36, 5.75], [-6.62, 0.35, 5.82], [-7.55, 0.22, 6.85], [-7.55, 0.22, 6.85], 48),
  huskA:  c([-3.6, 0.48, -1.3], [-3.7, 0.47, -1.45], [-5.05, 0.6, -3.15], [-5.05, 0.6, -3.15], 62),
  huskB:  c([-3.5, 0.62, -1.6], [-3.55, 0.6, -1.7], [-4.45, 0.45, -2.85], [-4.45, 0.45, -2.85], 50),
  poodA:  c([2.0, 0.5, 5.9], [2.1, 0.5, 5.75], [4.4, 0.6, 2.6], [4.4, 0.6, 2.6], 50),
  poodB:  c([5.6, 0.5, 4.6], [5.65, 0.5, 4.45], [6.65, 0.75, 1.6], [7.2, 0.7, 1.3], 54),
  labA:   c([3.35, 0.4, -5.2], [3.35, 0.4, -5.0], [3.3, 0.82, -2.6], [3.3, 0.82, -2.6], 60),
  labB:   c([5.1, 0.33, -3.75], [5.05, 0.33, -3.7], [3.85, 0.45, -2.85], [3.85, 0.45, -2.85], 54),
  aloneA: c([15.3, 0.45, 8.6], [15.2, 0.43, 8.45], [9.0, 0.5, 1.6], [9.0, 0.5, 1.6], 50),
  aloneB: c([13.75, 0.24, 6.95], [13.8, 0.23, 7.0], [14.38, 0.13, 7.58], [14.38, 0.13, 7.58], 42, 0.0015),
  bean:   c([11.55, 0.17, 9.1], [11.57, 0.17, 9.3], [11.6, 0.24, 10.12], [11.6, 0.24, 10.12], 54),
  gift:   c([11.5, 0.34, 7.75], [11.53, 0.34, 7.9], [11.8, 0.4, 9.85], [11.8, 0.4, 9.85], 56),
  zoomA:  c([10.4, 0.3, 5.6], [10.5, 0.3, 5.75], [11.0, 0.32, 7.4], [11.0, 0.32, 7.4], 60),
  zoomB:  c([2.2, 2.4, 3.4], [2.0, 1.8, 3.0], [2.2, 0.0, -2.0], [2.2, 0.1, -2.2], 64, 0.004),
  zoomC:  c([4.57, 0.32, 1.32], [4.55, 0.32, 1.3], [0.6, 0.35, -0.6], [3.0, 0.3, 0.5], 56),
  pile:   c([-4.7, 0.5, -1.9], [-4.65, 1.1, -1.4], [-5.25, 0.15, -3.6], [-5.25, 0.2, -3.65], 54, 0.002),
  lineup: c([0, 1.0, 4.5], [0, 1.0, 4.5], [0, 0.5, 0], [0, 0.5, 0], 50, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);
const LAP_A = A(-0.5, 0.12, -1.25, 0.6), LAP_B = A(-0.5, 0.12, -1.25, -0.6);                 // hands in the lap (knitting)
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);
const CHEER_A = A(-0.4, 2.5, -0.5, 0), CHEER_B = A(-0.4, 2.5, -0.5, 0);
const CLAP_A = A(-1.1, 0.1, -1.1, 0.6), CLAP_B = A(-1.1, 0.1, -1.1, -0.6);
const UP_B = A(-2.6, 0.15, -0.35, -0.2);                                                     // ball held high (Dan's left/+x arm)
const THROW_B = A(-1.2, 0.15, -0.1, -0.2);
const BRUSH_B = A(-1.1, 0.25, -0.9, -0.4);
const UKE_A = A(-0.45, 0.15, -1.55, 0.7), UKE_B = A(-0.9, 0.55, -0.7, -0.3);                 // strum (right) + neck (left)
const PET_A = A(-1.0, 0.25, -0.5, 0.3), PET_B = A(-1.0, 0.25, -0.5, -0.3);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));
const ell = (th, o = 0) => [ZL.cx + (ZL.rx + o) * Math.sin(th), ZL.cz + (ZL.rz + o) * Math.cos(th)];
const ellHead = (th) => Math.atan2(ZL.rx * Math.cos(th), -ZL.rz * Math.sin(th));

/** instanced bits (water drops, grass clippings): reset() per frame, add(p, s, rx, ry), commit() */
function makeBits(scene, n, geo, m) {
  const mesh = new THREE.InstancedMesh(geo, m, n); mesh.frustumCulled = false; mesh.castShadow = false; mesh.count = 0; scene.add(mesh);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), E = new THREE.Euler();
  let used = 0;
  return {
    mesh, reset() { used = 0; },
    add(p, s = 1, rx = 0, ry = 0) { if (used >= n || s <= 0) return; E.set(rx, ry, 0); Q.setFromEuler(E); S.setScalar(s); M.compose(p, Q, S); mesh.setMatrixAt(used++, M); },
    commit() { mesh.count = used; mesh.instanceMatrix.needsUpdate = true; },
  };
}
/** a ballistic burst from origin o (deterministic per seed): n bits, outward speed, upward speed, gravity */
function burst(bits, t, t0, o, n, seed, { speed = 1.4, up = 1.6, life = 0.85, g = 9.8, size = 1, dx = 0, dz = 0, spin = 0 } = {}) {
  if (t < t0 || t > t0 + life + 0.2) return;
  const R = rng(seed), dt = t - t0, v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = R() * PI * 2, sp = speed * (0.35 + 0.65 * R()), u = up * (0.45 + 0.75 * R()), delay = R() * 0.12, rr = R();
    const tt = dt - delay; if (tt < 0 || tt > life) continue;
    v.set(o.x + (Math.cos(a) * sp + dx) * tt, o.y + u * tt - 0.5 * g * tt * tt, o.z + (Math.sin(a) * sp + dz) * tt);
    if (v.y < 0.004) continue;
    bits.add(v, size * (1 - 0.45 * tt / life), spin * tt * (1 + rr), a);
  }
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- set
  const park = buildDogPark(studio, {});
  scene.fog = park.fog;

  // ---------------------------------------------------------------- dogs
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const dogs = {
    nova: makeBreed('husky', { name: 'NOVA', seed: 11, collar: 0x3d7bd9 }),
    arlo: makeBreed('husky', { name: 'ARLO', seed: 12, fur: 0x3c3f44, eye: 0x5a3216, collar: 0xe2574c }),
    rex: makeBreed('husky', { name: 'REX', seed: 13, fur: 0xb9b6b0, collar: 0x58b368 }),
    coco: makeBreed('poodle', { name: 'COCO', seed: 21, collar: 0xe58fa6 }),
    gigi: makeBreed('poodle', { name: 'GIGI', seed: 22, fur: 0xeab58a, white: 0xedbd94, cream: 0xedbd94, earInner: 0xeab58a, collar: 0xa77bd1 }),
    fifi: makeBreed('poodle', { name: 'FIFI', seed: 23, fur: 0x5e3c2a, white: 0x6a4632, cream: 0x6a4632, earInner: 0x5e3c2a, collar: 0xf2c14e }),
    moose: makeBreed('lab', { name: 'MOOSE', seed: 31, collar: 0x3d7bd9 }),
    bean: makeBreed('chihuahua', { name: 'BEAN', seed: 41, collar: 0xe86aa0, fur: 0x2e2826, white: 0xf3e6d4, cream: 0xc98a4a, earInner: 0xe8a0a0 }),
    dot: makeBreed('dalmatian', { name: 'DOT', seed: 51, collar: 0xf2b632 }),
    bagel: makeBreed('beagle', { name: 'BAGEL', seed: 52, collar: 0x58b368 }),
    frank: makeBreed('dachshund', { name: 'FRANK', seed: 53, collar: 0x3d7bd9 }),
    otis: makeBreed('pug', { name: 'OTIS', seed: 54, collar: 0xe2574c }),
    ziggy: makeBreed('lab', { name: 'ZIGGY', seed: 55, fur: 0x2b2624, white: 0x3a3330, cream: 0x3a3330, earInner: 0x2b2624, collar: 0xe2574c }),
    luna: makeBreed('samoyed', { name: 'LUNA', seed: 56, collar: 0xa77bd1 }),
  };
  Object.values(dogs).forEach((d) => scene.add(d.g));
  const POODLES = [dogs.coco, dogs.gigi, dogs.fifi], HUSKIES = [dogs.nova, dogs.arlo, dogs.rex];
  // the order they join the zoomies (story.json → pip.join) + how long each takes to run over from its spot (s)
  const JOIN = [['rex', 1.0], ['arlo', 1.2], ['nova', 1.3], ['coco', 1.2], ['gigi', 1.3], ['fifi', 1.4], ['moose', 0.6], ['dot', 1.6], ['bagel', 1.6], ['luna', 1.5], ['ziggy', 1.5], ['otis', 2.0], ['frank', 2.1]];

  const bunny = makeBunny(); bunny.scale.setScalar(1.25); scene.add(bunny);
  const ball = mk(new THREE.SphereGeometry(0.036, 14, 10), mat(0xd9e84a, 0.8), scene);
  const drops = makeBits(scene, 220, new THREE.SphereGeometry(0.011, 6, 4), new THREE.MeshStandardMaterial({ color: 0xcdeefc, roughness: 0.05, emissive: 0x4a8aa8, emissiveIntensity: 0.35 }));
  const grass = makeBits(scene, 260, new THREE.BoxGeometry(0.01, 0.035, 0.004), mat(0x6aa84a, 0.9));
  // soft dust puffs (camera-facing sprites)
  const puffTex = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(214,196,160,.55)'); gr.addColorStop(1, 'rgba(214,196,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const puffs = Array.from({ length: 40 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
  let puffN = 0;
  const puff = (x, z, age, life = 0.9, size = 0.5, seed = 0) => {
    if (age < 0 || age > life || puffN >= puffs.length) return;
    const s = puffs[puffN++], u = age / life, R = rng(seed);
    s.visible = true; s.position.set(x + (R() - 0.5) * 0.3 * (1 + u), 0.08 + 0.25 * u, z + (R() - 0.5) * 0.3 * (1 + u));
    s.scale.setScalar(size * (0.5 + u)); s.material.opacity = 0.75 * (1 - u) * smooth(age / 0.08);
  };

  // ---------------------------------------------------------------- people
  const mia = makeMia({ outfit: 'day' }); scene.add(mia.root);
  const rosa = makePerson({ skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0xe07a2a, pants: 0x5a3a5a, shoes: 0x8a5a5a }); rosa.kid = 1; scene.add(rosa.root);
  const dan = makePerson({ skin: 0xc68a62, hair: 0x2a1a12, hairStyle: 'short', top: 0x3d7bd9, pants: 0x4a4f57, shoes: 0xe8e4dc, beard: 0x2a1a12 }); dan.kid = 1; scene.add(dan.root);
  const celeste = makePerson({ skin: 0xf2d2b8, hair: 0xd8a040, hairStyle: 'bob', top: 0xe58fa6, pants: 0xf4f1ea, shoes: 0xe58fa6 }); celeste.kid = 1; scene.add(celeste.root);
  const jules = makePerson({ skin: 0x8d5a3b, hair: 0x1a1210, hairStyle: 'messy', top: 0x58b368, pants: 0x3b4a66, shoes: 0x222222 }); jules.kid = 1; scene.add(jules.root);
  const walt = makePerson({ skin: 0xe2b090, hair: 0xd8d4cc, hairStyle: 'none', glasses: true, mustache: 0xeeeae2, top: 0x7a5a3a, pants: 0x5a5f66, shoes: 0x4a3a30 }); walt.kid = 1; scene.add(walt.root);
  const CAST = [mia, rosa, dan, celeste, jules, walt];
  // Dan's red cap, Celeste's sun hat, Jules' ukulele, Rosa's knitting, Walt's newspaper
  { const cap = new THREE.Group(); dan.head.g.add(cap); cap.position.set(0, 0.08, 0); const m = mat(0xd2483f, 0.6);
    mk(new THREE.SphereGeometry(0.168, 20, 12, 0, PI * 2, 0, PI / 2), m, cap); const brim = mk(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16), m, cap, 0, 0.0, 0.17); brim.scale.set(1.25, 1, 0.85); }
  { const hat = new THREE.Group(); celeste.head.g.add(hat); hat.position.set(0, 0.1, 0); hat.rotation.x = -0.12;
    mk(new THREE.CylinderGeometry(0.34, 0.34, 0.012, 28), mat(0xf2e2c0, 0.8), hat); mk(new THREE.CylinderGeometry(0.15, 0.17, 0.13, 20), mat(0xf2e2c0, 0.8), hat, 0, 0.065, 0); mk(new THREE.CylinderGeometry(0.172, 0.172, 0.035, 20), mat(0xe58fa6, 0.6), hat, 0, 0.02, 0); }
  const brush = new THREE.Group(); celeste.arms.find((a) => a.s === 1).hand.add(brush);
  mk(new THREE.BoxGeometry(0.05, 0.03, 0.12), mat(0xb5462e, 0.5), brush, 0, -0.03, 0.04); mk(new THREE.BoxGeometry(0.06, 0.02, 0.07), mat(0xf4f1ea, 0.9), brush, 0, -0.055, 0.07);
  const uke = new THREE.Group(); jules.spine.add(uke); uke.position.set(0.0, 0.2, 0.17); uke.rotation.set(0, 0, 0.55);
  { const wd = mat(0xc98a4a, 0.5); const b1 = mk(new THREE.SphereGeometry(0.1, 16, 10), wd, uke, -0.05, 0, 0); b1.scale.set(1, 1, 0.35); const b2 = mk(new THREE.SphereGeometry(0.08, 16, 10), wd, uke, 0.08, 0, 0); b2.scale.set(1, 1, 0.35);
    mk(new THREE.CircleGeometry(0.025, 12), mat(0x2a1a10, 0.6), uke, 0.0, 0, 0.036); mk(new THREE.BoxGeometry(0.28, 0.035, 0.02), mat(0x7a5236, 0.5), uke, 0.29, 0, 0.0); }
  const yarn = mk(new THREE.SphereGeometry(0.06, 14, 10), mat(0xe58fa6, 0.95), scene);
  const knit = new THREE.Group(); scene.add(knit);
  mk(new THREE.BoxGeometry(0.18, 0.1, 0.015), mat(0xa77bd1, 0.95), knit); for (const s of [-1, 1]) { const n = mk(new THREE.CylinderGeometry(0.004, 0.004, 0.26, 6), mat(0xd8d4cc, 0.3), knit, s * 0.05, 0.08, 0); n.rotation.z = s * 0.5; }
  const paper = new THREE.Group(); walt.arms.find((a) => a.s === 1).hand.add(paper);
  { const pm = mat(0xeee8dc, 0.9, { side: THREE.DoubleSide }); mk(new THREE.PlaneGeometry(0.42, 0.3), pm, paper, -0.2, 0.0, 0.1).rotation.y = 0.1; }

  // ---------------------------------------------------------------- helpers
  const put = (P, p, floor = 0) => { if (P.kid && P.kid !== 1) poseScaled(P, p, floor); else { applyPose(P, p); P.root.position.y = floor + (p.y || 0); } };
  const person = (P, o, floor = 0) => { const p = basePose(); Object.assign(p, o); P.root.visible = true; put(P, p, floor); return p; };
  const placeD = (d, x, z, rotY, st, t, y = 0) => { d.g.visible = true; d.g.position.set(x, y, z); d.g.rotation.set(0, rotY, 0); d.update(t, st); };
  const pipAt = (x, z, rotY, st, t, y = 0) => placeD(pip, x, z, rotY, st, t, y);
  const benchSit = (P, x, o, t, i) => person(P, { x, z: BENCH[1] - 0.06, rotY: PI, y: P === mia ? -0.133 : -0.345, footFwd: 0.42, eyes: blink(t, i), ...o }, 0);
  const holdBunny = (d, t, size = PIPS) => { d.anchors.mouth.add(bunny); bunny.visible = true; bunny.position.set(0, -0.05, 0.03); bunny.rotation.set(-1.2, 0, 0.3 * Math.sin(t * 8)); bunny.scale.setScalar(1.25 / size); };
  const dropBunny = (x, z, rotY = 0, y = 0, roll = 0) => { if (bunny.parent !== scene) scene.add(bunny); bunny.visible = true; bunny.position.set(x, y, z); bunny.rotation.set(0, rotY, roll); bunny.scale.setScalar(1.25); };
  const bunnyAtPaws = () => dropBunny(PIP_BAND[0] + 0.1, PIP_BAND[1] + 0.17, 0.5);

  // ---------------------------------------------------------------- Moose's fetch cycle (also the background life of the field)
  const THROWS = [9.0, 14.5, 20.0, 24.0, EV.throws[0], 36.4, 41.9, 47.4];
  const LAND = (k) => [3.0 + ((k * 1.7) % 3) - 1.5, -10.6 - (k % 2) * 0.8];
  function fetch(t) {
    // → {x, z, rot, run, sit, ball: {pos | 'mouth' | 'hand'}}; Moose sits at MOOSE_SIT between throws
    let k = -1; for (let i = 0; i < THROWS.length; i++) if (t >= THROWS[i] - 0.6) k = i;
    const home = { x: MOOSE_SIT[0], z: MOOSE_SIT[1], rot: PI, run: 0, sit: 1, ball: 'hand', dist: 0 };
    if (k < 0) return home;
    const T = THROWS[k], [lx, lz] = LAND(k), dt = t - T;
    if (dt < 0) return home;
    const go = T + 0.35, at = T + 1.5, back = T + 2.65;
    const bx = lerp(DAN[0] + 0.15, lx, clamp(dt / 0.9)), bz = lerp(DAN[1] - 0.1, lz, clamp(dt / 0.9));
    const by = dt < 0.9 ? 2.0 + 3.0 * (dt / 0.9) * (1 - dt / 0.9) * 1.6 - 1.95 * (dt / 0.9) : 0.036 + 0.15 * Math.abs(Math.sin(clamp((dt - 0.9) / 0.5) * PI * 2)) * (1 - clamp((dt - 0.9) / 0.5));
    if (t < go) return { ...home, sit: 1 - smooth((t - T) / 0.3), ball: new THREE.Vector3(bx, by, bz) };
    if (t < at) { const u = smooth((t - go) / (at - go)); return { x: lerp(MOOSE_SIT[0], lx, u), z: lerp(MOOSE_SIT[1], lz + 0.45, u), rot: faceToward(MOOSE_SIT[0], MOOSE_SIT[1], lx, lz), run: 1, sit: 0, ball: new THREE.Vector3(bx, by, bz), dist: (t - go) * 7 }; }
    if (t < back) { const u = smooth((t - at) / (back - at)); return { x: lerp(lx, MOOSE_SIT[0], u), z: lerp(lz + 0.45, MOOSE_SIT[1] - 0.25, u), rot: faceToward(lx, lz, MOOSE_SIT[0], MOOSE_SIT[1]), run: 1, sit: 0, ball: 'mouth', dist: (t - go) * 7 }; }
    const u = smooth((t - back) / 0.4);
    return { x: MOOSE_SIT[0], z: MOOSE_SIT[1] - 0.25 * (1 - u), rot: lerp(faceToward(lx, lz, MOOSE_SIT[0], MOOSE_SIT[1]), PI + 2 * PI * Math.round((faceToward(lx, lz, MOOSE_SIT[0], MOOSE_SIT[1]) - PI) / (2 * PI)), u), run: 0, sit: u, ball: t < back + 0.3 ? 'mouth' : 'hand', dist: 0 };
  }

  // ---------------------------------------------------------------- ambient life: every dog + owner somewhere sensible at time t
  const howlK = (t, i) => Math.max(pulseAt(t, EV.howls.map(([a, d]) => [a + i * 0.25, d]), 0.6, 0.25, 0.4), t > 20.5 && t < EV.join[0] ? pulseAt(t, [[20.5 + i * 0.3, 1.8], [24.0 + i * 0.2, 2.0], [28.5 + i * 0.3, 1.6], [33.0 + i * 0.25, 2.2], [37.5, 1.8], [42.0 + i * 0.2, 2.0], [46.5, 1.6], [50.0 + i * 0.3, 1.8]], 0.6, 0.25, 0.4) : 0);
  function ambient(t) {
    // the band under the big tree
    HUSKIES.forEach((d, i) => { const [x, z, r] = HUSK[i], h = howlK(t, i); placeD(d, x, z, r, { sit: 1, howl: h, ears: 1, wag: 0.25 + 0.2 * h, wagRate: 2, headYaw: 0.15 * Math.sin(t * 0.7 + i) }, t); });
    // poodles: posing on the table → (26.3) hop off and flounce to their row
    POODLES.forEach((d, i) => {
      const t0 = 26.3 + i * 0.14, [tx, tz] = POOD_T[i], [rx, rz] = POOD_ROW[i];
      if (t < t0) { placeD(d, tx, tz, 0.1 * (i - 1), { sit: 1, ears: 0.8, headPitch: -0.28, headYaw: 0.25 * (i - 1) + 0.08 * Math.sin(t * 0.8 + i), lids: 0.45, wag: 0.15, wagRate: 2 }, t, DP.tableY); return; }
      const hopU = clamp((t - t0) / 0.38);
      if (hopU < 1) { placeD(d, tx, lerp(tz, tz - 0.75, hopU), PI, { hop: 0.12 * Math.sin(hopU * PI), ears: 0.8, headPitch: -0.3, lids: 0.45 }, t, lerp(DP.tableY, 0, hopU)); return; }
      const w = walkLegs(t, [tx, tz - 0.75], [{ t0: t0 + 0.38, t1: t0 + 2.2, pts: [[tx + 1.2, tz - 1.6], [rx, rz]] }]);
      const arrived = t > t0 + 2.2;
      placeD(d, w.x, w.z, arrived ? lerp(w.head ?? 0, -0.6, smooth((t - t0 - 2.2) / 0.5)) : w.head ?? PI, { walk: arrived ? 0 : 1, dist: w.dist, hop: arrived ? 0 : 0.018 * Math.abs(Math.sin(w.dist * 9)), ears: 0.8, headPitch: -0.32, lids: 0.45, headYaw: arrived ? 0.2 * Math.sin(t * 0.6 + i) : 0, wag: 0.2 }, t);
    });
    // Moose + Dan
    const f = fetch(t);
    placeD(dogs.moose, f.x, f.z, f.rot, { run: f.run, dist: f.dist, sit: f.sit, ears: 1, wag: f.run ? 0.6 : 0.9, wagRate: 5, headPitch: f.sit > 0.5 ? -0.55 : 0, lookY: f.sit > 0.5 ? 1 : 0, mouth: f.ball === 'mouth' ? 'open' : 'pant', open: f.ball === 'mouth' ? 0.3 : undefined }, t);
    ball.visible = true;
    if (f.ball === 'mouth') { dogs.moose.g.updateMatrixWorld(true); dogs.moose.anchors.mouth.getWorldPosition(ball.position); }
    else if (f.ball !== 'hand') ball.position.copy(f.ball);
    // Dan raises the ball ~1 s before each throw (the whole of labA before the story throw), throws, lowers his arm
    const Tn = THROWS.find((T) => t > T - (T === EV.throws[0] ? 4.5 : 1.0) && t < T + 0.8);
    let armB = REST;
    if (Tn !== undefined) armB = t < Tn - 0.15 ? mixArm(REST, UP_B, smooth((t - Tn + (Tn === EV.throws[0] ? 4.5 : 1.0)) / 0.4)) : t < Tn + 0.4 ? mixArm(UP_B, THROW_B, smooth((t - Tn + 0.15) / 0.3)) : mixArm(THROW_B, REST, smooth((t - Tn - 0.4) / 0.4));
    const pd = person(dan, { x: DAN[0], z: DAN[1], rotY: PI, eyes: blink(t, 3), smile: 1, headPitch: f.sit > 0.5 ? 0.25 : -0.05, armA: REST, armB }, 0);
    if (f.ball === 'hand') { dan.root.updateMatrixWorld(true); ball.position.copy(handWorld(dan, 1)).add(new THREE.Vector3(0, 0.05, 0)); }
    // the chase pair (dalmatian chases the beagle round a loop near the gate)
    const C1 = [-7.6, 3.2], r1 = 1.5, w1 = 2.0;
    [[dogs.bagel, 0], [dogs.dot, -0.95]].forEach(([d, off], i) => { const a = t * w1 + off; placeD(d, C1[0] + r1 * Math.sin(a), C1[1] + r1 * Math.cos(a), Math.atan2(Math.cos(a), -Math.sin(a)), { run: 1, dist: a * r1, ears: 1, wag: 1, wagRate: 5, mouth: 'pant' }, t); });
    // Luna + Ziggy wrestle by the A-frame: circling each other, play-bowing and hopping
    const C2 = [9.6, -9.0], a2 = t * 0.55;
    [[dogs.luna, 0], [dogs.ziggy, PI]].forEach(([d, off], i) => {
      const a = a2 + off, x = C2[0] + 0.55 * Math.sin(a), z = C2[1] + 0.55 * Math.cos(a), bow = Math.max(0, Math.sin(t * 2.6 + i * 1.7)), hop = Math.max(0, Math.sin(t * 5.2 + i * 2)) * 0.05;
      placeD(d, x, z, faceToward(x, z, C2[0], C2[1]) + 0.35, { lean: 0.36 * bow, hop: bow < 0.2 ? hop : 0, ears: 1, wag: 1, wagRate: 5, mouth: 'pant', walk: 0.4, dist: a * 0.55 }, t);
    });
    // Otis + Frank trot a slow oval by the gate, sniffing
    const C3 = [-10.5, 7.6], w3 = 0.45;
    [[dogs.otis, 0], [dogs.frank, -0.75]].forEach(([d, off], i) => { const a = t * w3 + off; placeD(d, C3[0] + 2.2 * Math.sin(a), C3[1] + 1.0 * Math.cos(a), Math.atan2(2.2 * Math.cos(a), -1.0 * Math.sin(a)), { walk: 1, dist: a * 1.7, ears: 0.7, wag: 0.7, sniff: 0.5 + 0.5 * Math.sin(t * 1.3 + i), headPitch: 0.15 }, t); });
    // Bean: under Rosa's bench, shivering
    placeD(dogs.bean, BEAN_SPOT[0], BEAN_SPOT[1], PI, { sit: 1, shiver: 0.7, ears: 0.35, sad: 0.45, tailDown: 0.8, headPitch: 0.1, lookY: -0.2 }, t);
    // owners: Rosa knitting on her bench with Mia beside her; Celeste brushing at the table; Jules strumming under the tree; Walt reading
    const pr = benchSit(rosa, BENCH[0] + 0.45, { smile: 1, headPitch: 0.35, armA: LAP_A, armB: LAP_B, mouth: null }, t, 4);
    knit.visible = yarn.visible = true; rosa.root.updateMatrixWorld(true);
    knit.position.copy(handWorld(rosa, -1).add(handWorld(rosa, 1)).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.04, 0)); knit.rotation.set(-0.9, PI, 0.08 * Math.sin(t * 6));
    yarn.position.set(BENCH[0] + 0.05, SEAT + 0.06, BENCH[1] - 0.05);
    benchSit(mia, BENCH[0] - 0.4, { smile: 1, headPitch: 0.1, headYaw: 0.2 * Math.sin(t * 0.5), armA: LAP_A, armB: LAP_B }, t, 2);
    const pc = t < 26.3 ? { x: TABLE[0] + 0.6, z: TABLE[1] - 0.95, rotY: 0, armB: mixArm(BRUSH_B, A(-1.25, 0.2, -1.0, -0.4), 0.5 + 0.5 * Math.sin(t * 5)), armA: REST, headPitch: 0.45 }
      : (() => { const w = walkLegs(t, [TABLE[0] + 0.6, TABLE[1] - 0.95], [{ t0: 26.8, t1: 29.0, pts: [[POOD_ROW[1][0] + 0.2, POOD_ROW[1][1] - 0.9]] }]); return { x: w.x, z: w.z, rotY: t < 29 ? w.head ?? 0 : 0.6, dist: w.dist, speed: w.speed, armB: BRUSH_B, armA: REST, headPitch: 0.15 }; })();
    person(celeste, { ...pc, eyes: blink(t, 6), smile: 1 }, 0);
    const pj = person(jules, { x: -6.4, z: -4.5, rotY: 0.55, y: -0.72, footFwd: 0.75, lean: -0.12, eyes: blink(t, 7), smile: 1, headRoll: 0.1 * Math.sin(t * 4.2), headPitch: 0.15, armA: mixArm(UKE_A, A(-0.4, 0.15, -1.35, 0.7), 0.5 + 0.5 * Math.sin(t * 12)), armB: UKE_B }, 0);
    uke.visible = true;
    const pw = benchSit(walt, 0.5, { z: 10.19, smile: 0.5, headPitch: 0.35, armA: A(-1.0, 0.25, -1.2, 0.5), armB: A(-1.0, 0.25, -1.2, -0.5) }, t, 8);
  }

  // ---------------------------------------------------------------- zoomies (the loop) — Pip's angle on the loop at time t
  // zoomB: Pip starts on the loop's left side; zoomC re-times the loop so he passes the low lens (θ ≈ 0.5) at 57.2
  const thB = (t) => -1.6 + 1.1 * (t - 52.4), thC = (t) => 0.6 + 1.1 * (t - 58.3);
  function zoomAll(t, thPip) {
    JOIN.forEach(([key, dur], k) => {
      const d = dogs[key], tj = EV.join[Math.min(k, EV.join.length - 1)] + (k >= EV.join.length ? 0.3 * (k - EV.join.length + 1) : 0);
      if (t < tj) return;   // still doing their own thing (ambient already placed them)
      // a tight stampede: three lanes, ~0.5 m apart, right behind Pip
      const th = thPip(t) - 0.15 * (k + 1) - 0.05 * (k % 3), [ex, ez] = ell(th, [0, 0.38, -0.38][k % 3]), u = smooth((t - tj) / dur);
      const x0 = d.g.position.x, z0 = d.g.position.z;
      const x = lerp(x0, ex, u), z = lerp(z0, ez, u);
      placeD(d, x, z, u < 0.95 ? faceToward(x0, z0, ex, ez) * (1 - u) + ellHead(th) * u : ellHead(th), { run: 1, dist: t * 3.4 + k, ears: 1, wag: 1, wagRate: 6, mouth: 'pant', eyes: 'happy' }, t);
    });
  }

  // ---------------------------------------------------------------- update
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', t0: 200, t1: 300 } : shotAt(t), cam = shot.cam;
    studio.camera.far = 420; studio.camera.near = 0.03; studio.fill.intensity = story.look.fill; studio.camera.updateProjectionMatrix();
    scene.fog = park.fog;
    const C = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    let P = C.p[0].map((v, i) => lerp(v, C.p[1][i], e));
    const Aim = C.a[0].map((v, i) => lerp(v, C.a[1][i], e));
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    EV.past.forEach((m) => jolt(m, 0.008));

    // reset
    CAST.forEach((R) => (R.root.visible = false));
    [bunny, ball, yarn, knit].forEach((g) => (g.visible = false));
    if (bunny.parent !== scene) scene.add(bunny);
    bunny.scale.setScalar(1.25); bunny.rotation.set(0, 0, 0);
    drops.reset(); grass.reset(); puffs.forEach((s) => (s.visible = false)); puffN = 0;
    POODLES.forEach((d) => d.frizz(t > EV.frizz ? smooth((t - EV.frizz) / 0.25) * (t > 58.8 ? 0.6 : 1) : 0));
    Object.values(park.gates).forEach((g) => (g.rotation.y = 0));
    Object.values(park.fence).forEach((g) => (g.visible = true));
    pip.g.rotation.set(0, 0, 0);
    park.update(t);
    park.aimSun(Aim[0], Aim[2], 12);

    if (cam === 'lineup') { lineup(t); setCamera(P, Aim, C.fov, t, C.amp); return; }
    ambient(t);
    BEATS[cam](t, u);
    if (cam === 'zoomB') {   // tracking: the lens runs backwards just ahead of the stampede, inside the loop, looking back at it
      const th = thB(t), [cx, cz] = ell(th + 0.5, -0.5), [ax, az] = ell(th - 0.3, 0.1);
      P = [cx, 0.55, cz]; Aim[0] = ax; Aim[1] = 0.28; Aim[2] = az;
    }
    drops.commit(); grass.commit();
    setCamera(P, Aim, C.fov, t, C.amp); studio.camera.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) {
      pipAt(-7.95, 7.65, 0.1, { sit: 1, ears: 1, headYaw: 0.1, tilt: K(t, [[0, 0.0], [1.0, 0.26], [2.4, 0.26], [3.2, -0.1]]), wag: 0.9, wagRate: 4.5, lookY: 0.35, headPitch: -0.18, eyes: 'open' }, t);
      holdBunny(pip, t);
    },
    gate(t) {
      park.gates.inner.rotation.y = K(t, [[EV.gate, 0], [EV.gate + 0.7, 1.35]]);
      const w = walkLegs(t, [-8.75, 11.55], [{ t0: 4.45, t1: 6.0, pts: [[-8.55, 10.4], [-8.05, 8.4]] }, { t0: 6.0, t1: 7.6, pts: [[-7.6, 6.95]] }]);
      pipAt(w.x, w.z, w.head ?? PI, { run: t > 4.45 && t < 6.0 ? 1 : 0, walk: t >= 6.0 && t < 7.5 ? 1 : 0, dist: w.dist, ears: 1, wag: 1, wagRate: 5.5, headPitch: t < 4.45 ? -0.35 : -0.05, lookY: t < 4.45 ? 0.6 : 0 }, t);
      holdBunny(pip, t);
      const m = walkLegs(t, [-9.2, 11.85], [{ t0: 5.0, t1: 7.6, pts: [[-9.0, 10.4], [-8.6, 9.2]] }]);
      const reach = smooth((t - 3.5) / 0.4) * (1 - smooth((t - EV.gate - 0.5) / 0.4));
      const p = person(mia, { x: m.x, z: m.z, rotY: m.head ?? PI, dist: m.dist, speed: m.speed, eyes: blink(t, 2), smile: 1, headPitch: t < 4.6 ? 0.25 : 0.05, armA: mixArm(REST, REACH_A, reach), armB: REST }, 0);
    },
    plan(t) {
      const drop = EV.drop, bow = smooth((t - EV.bow) / 0.3) * (1 - smooth((t - 11.3) / 0.3));
      const look = K(t, [[8.9, 0], [9.4, -0.7], [10.0, 0.7], [10.3, 0]]);
      pipAt(-7.62, 6.92, 2.25, { sit: t > drop + 0.4 && t < EV.bow - 0.1 ? smooth((t - drop - 0.4) / 0.3) : 0, lean: 0.38 * bow, ears: 1, wag: t > EV.bow - 0.2 ? 1 : 0.7, wagRate: bow > 0.3 ? 6 : 4.5, headPitch: t < drop ? 0.35 : -0.1 + 0.2 * bow, headYaw: look, eyes: bow > 0.3 ? 'happy' : 'open', mouth: t > drop + 0.2 ? 'pant' : 'smile', hop: bow > 0.4 ? 0.025 * Math.abs(Math.sin(t * 9)) : 0 }, t);
      if (t < drop) holdBunny(pip, t);
      else { pip.g.updateMatrixWorld(true); const f = new THREE.Vector3(0.05, 0, 0.36).applyAxisAngle(new THREE.Vector3(0, 1, 0), 2.25); dropBunny(-7.62 + f.x, 6.92 + f.z, 0.6, 0, smooth((t - drop) / 0.3) * 0.0); }
    },
    huskA(t) {
      // Pip trots up to the end of the row and sits; the band howls on
      const w = walkLegs(t, [-2.6, -1.4], [{ t0: 11.8, t1: 13.6, pts: [[-3.5, -2.0], PIP_BAND] }]);
      const sat = smooth((t - 13.7) / 0.3);
      pipAt(w.x, w.z, t < 13.6 ? w.head ?? -2 : lerp(w.head ?? -2, 0.5, smooth((t - 13.6) / 0.4)), { walk: t < 13.6 ? 1 : 0, dist: w.dist, sit: sat, ears: 1, wag: 0.8, wagRate: 4.5, headPitch: -0.2 * sat + (t > 13.75 && t < 14.1 ? 0.4 : 0), headYaw: -0.45 * sat, eyes: 'open', mouth: 'smile' }, t);
      if (t < 13.9) holdBunny(pip, t); else bunnyAtPaws();
    },
    huskB(t) {
      // the audition: head back, a tiny squeak; the band stops and stares; then carries on without him
      const sq = EV.squeak, stare = smooth((t - EV.stare + 0.4) / 0.3) * (1 - smooth((t - 18.4) / 0.4));
      const pre = smooth((t - 15.9) / 0.4) * (1 - smooth((t - sq - 0.55) / 0.3));
      const deflate = smooth((t - 18.7) / 0.5);
      bunnyAtPaws();
      pipAt(PIP_BAND[0], PIP_BAND[1], 0.5, { sit: 1, howl: 0.85 * pre, ears: 1 - 0.45 * deflate, wag: lerp(0.8, 0.2, deflate), headYaw: pre > 0.2 ? 0 : -0.55 * (1 - deflate) - 0.2 * deflate, headPitch: stare > 0.2 ? -0.25 : 0.05 * deflate, eyes: pre > 0.5 ? 'closed' : stare > 0.3 ? 'wide' : deflate > 0.5 ? 'sad' : 'open', mouth: pre > 0.3 ? 'o' : 'smile', lookY: stare > 0.2 ? 0.7 : 0, sad: 0.35 * deflate, tailDown: 0.3 * deflate }, t);
      // the stare: every husky stops mid-howl and looks down the row at him
      if (stare > 0) HUSKIES.forEach((d, i) => { const [x, z, r] = HUSK[i]; const look = faceToward(x, z, PIP_BAND[0], PIP_BAND[1]); placeD(d, x, z, r, { sit: 1, ears: 1, howl: 0, headYaw: lerp(0, look - r, stare) * 0.85, headPitch: 0.25 * stare, eyes: stare > 0.5 ? 'sleepy' : 'open', lids: 0.5 * stare, mouth: 'flat', wag: 0.1 }, t); });
    },
    poodA(t) {
      // Pip in the kiddie pool, pouncing at the water
      const hops = EV.splash.map((s) => pulseAt(t, [[s - 0.1, 0.12]], 0.12, 0.08, 0.15));
      const h = Math.max(...hops);
      const wob = 0.25 * Math.sin(t * 2.1);
      pipAt(POOL[0] + 0.1 + 0.12 * Math.sin(t * 1.3), POOL[1] - 0.1, -2.4 + wob, { ears: 1, wag: 1, wagRate: 6, hop: 0.07 * h, lean: -0.12 * h + 0.18 * (1 - h) * Math.max(0, Math.sin(t * 6)), headPitch: 0.25 - 0.3 * h, eyes: h > 0.4 ? 'happy' : 'open', mouth: 'pant' }, t, 0.012);
      EV.splash.forEach((s, i) => burst(drops, t, s, new THREE.Vector3(POOL[0] + 0.1, DP.waterY + 0.02, POOL[1] - 0.1), 26, 100 + i, { speed: 1.0, up: 2.2, life: 0.7, size: 1.2 }));
      dropBunny(POOL[0] - 1.05, POOL[1] + 0.2, 0.8);
    },
    poodB(t) {
      // he trots over dripping, says hi the corgi way (the shake): spray, the pom-poms frizz, noses up, they flounce off
      const [s0, s1] = EV.shake, sk = smooth((t - s0) / 0.1) * (1 - smooth((t - s1 + 0.12) / 0.12));
      const w = walkLegs(t, [POOL[0] + 0.85, POOL[1] - 0.6], [{ t0: 23.6, t1: 24.4, pts: [[6.5, 2.6]] }]);
      const proud = smooth((t - s1) / 0.25), flinch = smooth((t - EV.frizz) / 0.15);
      pipAt(w.x, w.z, t < 24.4 ? w.head ?? PI : PI - 0.25, { walk: t < 24.4 ? 1 : 0, dist: w.dist, ears: sk > 0 ? 0.6 + 0.4 * Math.sin(t * 40) : 1, headPitch: -0.45 * (1 - sk), lookY: 0.8, eyes: sk > 0 ? 'closed' : proud > 0.5 ? 'happy' : 'open', mouth: proud > 0.5 ? 'pant' : 'smile', wag: 1, wagRate: 5.5, headYaw: 0.4 * sk * Math.sin(t * 38), sit: t > 26.6 ? smooth((t - 26.6) / 0.3) : 0, tilt: t > 26.9 ? 0.3 : 0 }, t);
      pip.g.rotation.z = 0.36 * sk * Math.sin(t * 2 * PI * 7);
      // spray: a ring of drops flung off his coat during the shake
      for (let k = 0; k < 6; k++) burst(drops, t, s0 + k * 0.13, new THREE.Vector3(6.5, 0.2, 2.6), 22, 300 + k, { speed: 2.4, up: 1.7, life: 0.6, size: 1.1 });
      // the poodles flinch (eyes wide, lean back) at the frizz, then noses up
      if (t < 26.3) POODLES.forEach((d, i) => { const [x, z] = POOD_T[i]; placeD(d, x, z, 0.1 * (i - 1), { sit: 1, ears: 0.8 + 0.2 * flinch, lean: -0.12 * flinch * (1 - smooth((t - 25.6) / 0.4)), headPitch: lerp(-0.28, -0.5, smooth((t - 25.5) / 0.4)), headYaw: lerp(0.25 * (i - 1), -0.5 * (i - 1) - 0.3, smooth((t - 25.6) / 0.5)), eyes: flinch > 0.3 && t < 25.6 ? 'wide' : 'open', lids: t > 25.6 ? 0.55 : 0, mouth: t < 25.6 && flinch > 0.3 ? 'o' : 'flat', wag: 0 }, t, DP.tableY); });
    },
    labA(t) {
      // Moose quivers, eyes locked on the ball in Dan's raised hand; Pip sits beside him and copies him exactly
      const q = 0.012 * Math.sin(t * 31);
      pipAt(PIP_LAB[0], PIP_LAB[1], PI + 0.05, { sit: 1, ears: 1, headPitch: K(t, [[28.0, -0.1], [29.2, -0.1], [29.6, -0.6]]), lookY: K(t, [[29.2, 0], [29.6, 1]]), headYaw: K(t, [[28.0, -0.5], [28.8, -0.5], [29.2, 0.25]]), tilt: K(t, [[30.2, 0], [30.5, 0.25]]), wag: 0.5, wagRate: 4, shiver: t > 30.0 ? 0.6 : 0, eyes: 'wide', mouth: 'smile' }, t);
      dogs.moose.g.position.x += q;
      dropBunny(PIP_LAB[0] + 0.32, PIP_LAB[1] + 0.25, 1.2);
    },
    labB(t) {
      // the throw: Moose blasts past (Pip spins round, plops down), fetches, blasts back past (spins again)
      const [p0, p1] = EV.past;
      const spin1 = smooth((t - p0 - 0.05) / 0.6), spin2 = smooth((t - p1 - 0.05) / 0.6);
      const ang = PI + 0.05 + (spin1 + spin2) * 2 * PI;
      const dizzy = Math.max(pulseAt(t, [[p0 + 0.65, 0.9]], 0.9, 0.1, 0.4), pulseAt(t, [[p1 + 0.65, 1.2]], 1.2, 0.1, 0.4));
      const spinning = (spin1 > 0 && spin1 < 1) || (spin2 > 0 && spin2 < 1);
      pipAt(PIP_LAB[0], PIP_LAB[1], ang, { sit: spinning ? 0.4 : 1, ears: spinning ? 0.3 : 1, earsBack: spinning ? 0.9 : 0, headPitch: dizzy > 0.2 ? 0.05 : -0.3, tilt: 0.3 * dizzy * Math.sin(t * 7), headYaw: 0.25 * dizzy * Math.sin(t * 5.3), eyes: spinning ? 'wide' : dizzy > 0.3 ? 'sleepy' : 'open', mouth: spinning ? 'o' : 'smile', wag: 0.6, wagRate: 4 }, t);
      dropBunny(PIP_LAB[0] + 0.32, PIP_LAB[1] + 0.25, 1.2);
      // grass + dust kicked up where he launches and where he passes back
      burst(grass, t, p0, new THREE.Vector3(MOOSE_SIT[0], 0.03, MOOSE_SIT[1] - 0.3), 40, 501, { speed: 1.0, up: 1.8, life: 0.8, dz: -1.5, spin: 9 });
      burst(grass, t, p1, new THREE.Vector3(MOOSE_SIT[0], 0.03, MOOSE_SIT[1] - 0.6), 34, 502, { speed: 1.0, up: 1.6, life: 0.8, dz: 1.2, spin: 9 });
      for (let k = 0; k < 6; k++) { puff(MOOSE_SIT[0], MOOSE_SIT[1] - 0.4 - k * 0.5, t - p0 - k * 0.07, 0.9, 0.55, 600 + k); puff(MOOSE_SIT[0] + 0.1, MOOSE_SIT[1] - 2.8 + k * 0.5, t - p1 + 0.35 - k * 0.07, 0.9, 0.55, 620 + k); }
    },
    aloneA(t) { alone(t); },
    aloneB(t) { alone(t); },
    bean(t) {
      // Pip gets up with his bunny and trots toward the bench (off screen, arriving in the gift shot)
      pipWalkToBean(t);
    },
    gift(t) {
      pipWalkToBean(t);
      const place = EV.place, wag = smooth((t - EV.wag) / 0.4);
      // Bean: sniffs the bunny, looks up at Pip, tail goes
      const sniff = smooth((t - place - 0.3) / 0.3);
      placeD(dogs.bean, BEAN_SPOT[0], BEAN_SPOT[1] - 0.1 * sniff, PI - 0.25 * sniff, { sit: 1 - 0.6 * sniff, shiver: 0.7 * (1 - wag), ears: lerp(0.35, 1, wag), sad: 0.45 * (1 - wag), tailDown: 0.8 * (1 - wag), sniff: sniff * (1 - wag), headPitch: lerp(0.1, 0.35, sniff) * (1 - wag) - 0.2 * wag, lookY: wag, wag: wag, wagRate: 6, eyes: wag > 0.5 ? 'happy' : 'open', mouth: wag > 0.5 ? 'pant' : 'smile', tilt: K(t, [[EV.wag - 0.5, 0], [EV.wag - 0.2, 0.3], [EV.wag + 0.3, 0]]) }, t);
      // Rosa + Mia lean in: aww
      const aww = smooth((t - EV.wag + 0.1) / 0.4);
      benchSit(rosa, BENCH[0] + 0.45, { smile: 1, lean: 0.25 * aww, headPitch: 0.45, armA: mixArm(LAP_A, CHEEK_A, aww), armB: mixArm(LAP_B, CHEEK_B, aww), mouth: aww > 0.5 && aww < 0.99 ? 'o' : null }, t, 4);
      knit.visible = false;
      benchSit(mia, BENCH[0] - 0.4, { smile: 1, lean: 0.3 * aww + 0.1, headPitch: 0.45, headYaw: 0.25, armA: mixArm(LAP_A, CHEEK_A, aww), armB: mixArm(LAP_B, CHEEK_B, aww), mouth: aww > 0.5 ? 'o' : null }, t, 2);
    },
    zoomA(t) {
      // Bean grabs the bunny and zooms round the lawn; Pip zooms after him
      const g = EV.grab, a = (t - g) * 4.4, run = t > g + 0.15;
      const bx = run ? ZA[0] + ZA_R * Math.sin(a) : BUNNY_GIFT[0] + 0.02, bz = run ? ZA[1] + ZA_R * Math.cos(a) : BUNNY_GIFT[1] + 0.12;
      const k = smooth((t - g - 0.15) / 0.5);
      const bxx = lerp(BEAN_SPOT[0], bx, k), bzz = lerp(BEAN_SPOT[1] - 0.15, bz, k);
      placeD(dogs.bean, bxx, bzz, run ? Math.atan2(Math.cos(a), -Math.sin(a)) : PI, { run: run ? 1 : 0, dist: a * ZA_R, ears: 1, wag: 1, wagRate: 7, eyes: 'happy', mouth: 'smile' }, t);
      holdBunny(dogs.bean, t, 0.52); bunny.scale.setScalar(1.25 / 0.52 * 0.8);
      const pa = a - 1.15, pk = smooth((t - 49.7) / 0.6);
      const px = lerp(PIP_GIFT[0], ZA[0] + ZA_R * 1.15 * Math.sin(pa), pk), pz = lerp(PIP_GIFT[1], ZA[1] + ZA_R * 1.15 * Math.cos(pa), pk);
      pipAt(px, pz, pk > 0.05 ? Math.atan2(Math.cos(pa), -Math.sin(pa)) : faceToward(PIP_GIFT[0], PIP_GIFT[1], bxx, bzz), { run: pk > 0.05 ? 1 : 0, dist: pa * ZA_R, sit: pk > 0.05 ? 0 : 0.8, ears: 1, wag: 1, wagRate: 6, eyes: 'happy', mouth: 'pant', tilt: t < 49.7 ? 0.3 : 0 }, t);
      for (let i = 0; i < 6; i++) puff(ZA[0] + ZA_R * Math.sin(a - i * 0.5), ZA[1] + ZA_R * Math.cos(a - i * 0.5), ((t - g) % 0.6) + i * 0.1, 0.9, 0.35, 700 + i);
      // Mia + Rosa laugh on the bench
      const lau = (t * 2.4) % 1 < 0.5;
      benchSit(rosa, BENCH[0] + 0.45, { smile: 1, headPitch: 0.25, armA: CLAP_A, armB: CLAP_B, mouth: lau ? 'o' : null, eyes: 'closed' }, t, 4);
      knit.visible = false;
      benchSit(mia, BENCH[0] - 0.4, { smile: 1, headPitch: 0.2, headYaw: 0.2 * Math.sin(t * 2), armA: CHEER_A, armB: CHEER_B, mouth: lau ? 'o' : null }, t, 2);
    },
    zoomB(t) { zoomBig(t, false); },
    zoomC(t) { zoomBig(t, true); },
    pile(t) {
      // the noon puppy pile under the big tree: everybody flopped, Pip + Bean in the middle with the bunny, Mia in the heap
      // laid out in the lens's cone: a = depth away from the camera, b = across the frame (+ = frame right)
      const VD = [-0.31, -0.95], VR = [0.95, -0.31], at = (a, b) => [PILE[0] + a * VD[0] + b * VR[0], PILE[1] + a * VD[1] + b * VR[1]];
      const spots = [['nova', 0.5, -0.6, 1.0, 'lie'], ['arlo', 1.15, -0.35, -0.4, 'sleep'], ['rex', 1.5, 0.55, 0.9, 'lie'], ['coco', 0.35, 0.75, -0.6, 'sleep'],
        ['gigi', 1.25, 0.95, -1.1, 'lie'], ['fifi', -0.15, -0.75, 1.3, 'sleep'], ['moose', 2.0, 0.0, 0.2, 'lie'], ['dot', 1.0, -1.0, 0.8, 'sleep'],
        ['bagel', 0.6, 1.15, -1.2, 'lie'], ['frank', -0.35, 0.6, -1.4, 'sleep'], ['otis', -0.45, -0.5, 1.5, 'lie'], ['ziggy', 2.4, -0.7, 0.5, 'sleep'], ['luna', 2.1, 1.0, -0.6, 'lie']]
        .map(([k, a, b, r, st]) => [k, ...at(a, b), 0.31 + r, st]);
      spots.forEach(([k, x, z, r, s], i) => placeD(dogs[k], x, z, r, { lie: 1, sleep: s === 'sleep' ? 1 : 0, ears: 0.7, wag: s === 'lie' ? 0.35 : 0.1, wagRate: 2.2, mouth: s === 'lie' ? 'pant' : 'smile', eyes: s === 'lie' ? 'happy' : undefined, roll: s === 'sleep' && i % 3 === 0 ? 1.0 : 0 }, t));
      pipAt(PILE[0], PILE[1] + 0.05, 0.3, { lie: 1, ears: 0.85, wag: 0.6, wagRate: 3, eyes: (t % 3.1) < 1.4 ? 'happy' : 'open', mouth: 'smile', headYaw: 0.25, tilt: 0.2, lick: pulseAt(t, [59.6, 60.6], 0.25) }, t);
      placeD(dogs.bean, PILE[0] + 0.3, PILE[1] + 0.22, -0.9, { sleep: 1, roll: 0.7, wag: 0.2, wagRate: 2 }, t);
      dropBunny(PILE[0] + 0.18, PILE[1] + 0.36, 0.4, 0.02, 1.3);
      // Mia sits in the middle of the heap, laughing, petting Pip
      const lau = (t * 2.2) % 1 < 0.5;
      const [mx, mz] = at(0.75, 0.25);
      person(mia, { x: mx, z: mz, rotY: 0.31, y: -0.6, footFwd: 0.55, lean: 0.25, eyes: lau ? 'closed' : 'open', smile: 1, mouth: lau ? 'o' : null, headPitch: 0.2, headRoll: 0.12 * Math.sin(t * 3), armA: PET_A, armB: mixArm(PET_B, A(-1.2, 0.3, -0.4, -0.3), 0.5 + 0.5 * Math.sin(t * 4)) }, 0);
      // the owners around the pile (faces); Jules plays them a lullaby
      person(rosa, { x: -3.5, z: -2.3, rotY: -2.4, eyes: blink(t, 4), smile: 1, armA: CHEEK_A, armB: CHEEK_B }, 0);
      person(dan, { x: -3.2, z: -4.0, rotY: -1.6, eyes: blink(t, 3), smile: 1, armA: REST, armB: REST, headPitch: 0.35 }, 0);
      person(celeste, { x: -6.9, z: -5.8, rotY: 0.9, eyes: blink(t, 6), smile: 1, armA: CHEEK_A, armB: CHEEK_B, headPitch: 0.35 }, 0);
      person(jules, { x: -7.7, z: -2.3, rotY: 2.1, y: -0.72, footFwd: 0.75, lean: -0.05, eyes: 'closed', smile: 1, headRoll: 0.1 * Math.sin(t * 2.2), headPitch: 0.2, armA: mixArm(UKE_A, A(-0.4, 0.15, -1.35, 0.7), 0.5 + 0.5 * Math.sin(t * 6)), armB: UKE_B }, 0);
      knit.visible = false;
    },
  };

  function alone(t) {
    // by the fence: lying, chin on his paws, the bunny under his cheek; a sigh; then his ears perk at something
    const sigh = pulseAt(t, [[EV.sigh, 0.6]], 0.6, 0.25, 0.6), perk = smooth((t - EV.perk) / 0.25);
    pipAt(FENCE[0], FENCE[1], FENCE_ROT, { lie: 1, ears: lerp(0.25, 1, perk), sad: 0.65 * (1 - perk), headPitch: 0.42 - 0.1 * sigh - 0.25 * perk, headYaw: 0.5 * perk, lookX: perk, lookY: 0.4 - 0.3 * perk, eyes: perk > 0.5 ? 'wide' : 'open', lids: perk > 0.5 ? undefined : 0.4 + 0.2 * sigh, wag: 0.05 + 0.35 * perk, tailDown: 0.7 * (1 - perk), mouth: 'smile' }, t);
    pip.T.scale.y += 0.06 * sigh;
    const f = new THREE.Vector3(0.07, 0, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), FENCE_ROT);
    dropBunny(FENCE[0] + f.x, FENCE[1] + f.z, FENCE_ROT + 0.9, 0, 1.45);
  }
  function pipWalkToBean(t) {
    // up at 41.3, the bunny back in his mouth, a trot to the bench; set it down (place), nudge it, sit back, head tilt
    const w = walkLegs(t, FENCE, [{ t0: 41.5, t1: 44.6, pts: [[13.3, 8.6], PIP_GIFT] }]);
    const place = EV.place, nudge = pulseAt(t, [[place + 0.55, 0.25]], 0.25, 0.1, 0.2), back = smooth((t - place - 1.0) / 0.4);
    const face = faceToward(PIP_GIFT[0], PIP_GIFT[1], BEAN_SPOT[0], BEAN_SPOT[1]);
    const arrived = t > 44.6;
    pipAt(arrived ? PIP_GIFT[0] + 0.12 * back * Math.sin(face + PI) : w.x, arrived ? PIP_GIFT[1] + 0.12 * back * Math.cos(face + PI) : w.z, arrived ? face : w.head ?? face, {
      walk: arrived ? 0 : 1, dist: w.dist, lie: 0, sit: back, ears: 1, headPitch: t > place - 0.5 && t < place + 0.9 ? 0.45 + 0.15 * nudge : 0.0, lean: 0.12 * nudge,
      tilt: K(t, [[place + 1.4, 0], [place + 1.7, 0.32], [EV.wag + 0.4, 0.32], [EV.wag + 0.7, 0]]), wag: t > EV.wag ? 1 : 0.5, wagRate: t > EV.wag ? 6 : 3.5, eyes: t > EV.wag ? 'happy' : 'open', mouth: t > EV.wag ? 'pant' : 'smile',
    }, t);
    if (t < 41.3) { const f = new THREE.Vector3(0.07, 0, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), FENCE_ROT); dropBunny(FENCE[0] + f.x, FENCE[1] + f.z, FENCE_ROT + 0.9, 0, 1.45); }
    else if (t < place) holdBunny(pip, t);
    else dropBunny(BUNNY_GIFT[0] - 0.05 * nudge * Math.sin(face), BUNNY_GIFT[1] + 0.06 * smooth((t - place - 0.5) / 0.3), face + 0.5, 0, 0.0);
  }
  function zoomBig(t, low) {
    // Pip + Bean lead the loop; everybody peels off from what they were doing and joins (EV.join), owners cheer
    const thPip = low ? thC : thB, th = thPip(t);
    const [px, pz] = ell(th), [bx, bz] = ell(th + 0.25, 0.2);
    pipAt(px, pz, ellHead(th), { run: 1, dist: t * 3.4, ears: 1, wag: 1, wagRate: 6, eyes: 'happy', mouth: 'pant' }, t);
    placeD(dogs.bean, bx, bz, ellHead(th + 0.25), { run: 1, dist: t * 3.3, ears: 1, wag: 1, wagRate: 7, eyes: 'happy', mouth: 'smile' }, t);
    holdBunny(dogs.bean, t, 0.52); bunny.scale.setScalar(1.25 / 0.52 * 0.8);
    zoomAll(t, thPip);
    // dust + grass along the loop behind the pack
    for (let i = 0; i < 10; i++) { const [x, z] = ell(th - 0.15 - i * 0.22); puff(x, z, ((t * 1.7 + i * 0.37) % 0.9), 0.9, low ? 0.4 : 0.8, 800 + i); }
    for (let i = 0; i < 6; i++) { const [x, z] = ell(th - 0.3 - i * 0.35); burst(grass, t, Math.floor(t * 3) / 3 + i * 0.02, new THREE.Vector3(x, 0.03, z), 10, 900 + i + Math.floor(t * 3) * 7, { speed: 0.8, up: 1.4, life: 0.6, spin: 9 }); }
    // owners cheer (Dan in the middle of the loop; Mia + Rosa by the bench; Celeste with her hat off)
    const ch = (t * 2) % 1 < 0.5;
    person(dan, { x: DAN[0], z: DAN[1], rotY: faceToward(DAN[0], DAN[1], px, pz), eyes: blink(t, 3), smile: 1, armA: ch ? CHEER_A : REST, armB: CHEER_B, mouth: ch ? 'o' : null }, 0);
    person(celeste, { x: POOD_ROW[1][0] - 0.2, z: POOD_ROW[1][1] - 0.9, rotY: -1.4, eyes: blink(t, 6), smile: 1, armA: CLAP_A, armB: CLAP_B, mouth: ch ? 'o' : null }, 0);
    person(mia, { x: 1.9, z: 4.7, rotY: PI + 0.2, eyes: blink(t, 2), smile: 1, armA: CHEER_A, armB: CHEER_B, mouth: ch ? 'o' : null, y: 0.05 * Math.abs(Math.sin(t * 6)) }, 0);
    person(rosa, { x: 3.0, z: 5.2, rotY: PI - 0.3, eyes: blink(t, 4), smile: 1, armA: CLAP_A, armB: CLAP_B }, 0);
    knit.visible = false;
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200): every breed side by side
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    CAST.forEach((R) => (R.root.visible = false));
    const all = [pip, ...Object.values(dogs)], i = Math.floor(t - 200);
    const st = [{ sit: 1 }, { walk: 1 }, { run: 1 }, { lie: 1 }, { howl: 1 }, { lean: 0.38 }][i % 6];
    all.forEach((d, k) => placeD(d, -3.5 + (k % 5) * 1.75, -1.2 * Math.floor(k / 5), 0.5, { ...st, still: true, dist: 0.3 }, t));
    POODLES.forEach((d) => d.frizz(i >= 6 ? 1 : 0));
    ball.visible = bunny.visible = false;
  }

  return { update };
}
