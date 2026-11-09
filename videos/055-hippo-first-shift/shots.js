// VIDEO 055 — "What if a hippo worked at a burger joint?"  (Scribe promo, toy3d style; a dupe of @okwhatifcrazy's
// "Hugo's first shift did not go well 🦛🍔", TikTok 1.1M views, docs/reference/okwhatifcrazy.md)
// Same premise, beat order and rhythm as the original: a hippo's first shift at a burger joint, one gag per beat with a HUD
// stat (label + number + sub-label) and a deadpan subtitle; the wreck → the manager → a new rule → the drive-thru pond → the
// displacement flood. Ours: OTIS the hippo at CHOMPY'S, Denise the manager, our art + lines. The Scribe plug sits where the
// original turns ("the manager has questions" → "new hire, new rules"): one last chance = a HANDWRITTEN night-class math
// worksheet by 8 AM; every pencil snaps in his jaws; one photo → Scribe solves all 20 → written in HIS handwriting, stroke by
// stroke → 20/20, promoted → the pond drive-thru. Scribe on screen at 33.8 s (56 %).
// No narrator (the original has none — TikTok reports no speech): subtitles + HUD + foley + a soft bed.
//
// Facts in the HUD (checked Nov 8 2026):
//   adult common hippos weigh ~1,300–3,200 kg (San Diego Zoo Wildlife Alliance, "Hippopotamus" fact sheet) → 1,500 kg
//   jaws open to ~150° (widely cited: e.g. National Geographic / ZSL) vs a human's ~40°
//   hippos run up to ~30 km/h (19 mph) on land (San Diego Zoo; National Geographic)
//   they graze ~35–40 kg of grass a night (San Diego Zoo: "about 80 pounds")
//   bite force ~1,800 psi (National Geographic, Brady Barr's measurement)
//   Gag numbers (tiles rated 400 kg, $48,000, 2,400 orders, splash 4 m) are the original's kind of joke stats, not claims.
// Product claims (docs/lanes/scribe.md, the Scribe README): a photo of the homework → every problem solved with worked steps →
//   written in the student's own handwriting, stroke by stroke. "10 free assignments" (the site's offer) only on the end card.
//
// Shot list (seconds)               | where            | what happens
//  0.0– 4.6 arrive   First day       | outside          | Otis trots across the lot under NOW HIRING, jams in the door, pops through (frame falls)
//  4.6– 8.0 floor    The floor…      | dining room      | ant's-eye: every step cracks the tiles; he stops, looks down, sinks a little
//  8.0–11.4 uniform  One size…       | dining room      | Denise stretches a polo over his snout — it rips; a tiny cap lands on his head
// 11.4–14.8 order    Can I take…     | counter          | side view: a customer orders, Otis yawns a 150° yawn, the man's hair blows back
// 14.8–18.2 soda     Stay wet        | FIZZ fountain    | he jams every lever with his face: six jets, the floor floods
// 18.2–21.6 charge   Fastest…        | dining room      | he charges with a tray on his back, plows through a table; the burger lands on a plate
// 21.6–25.0 salad    Salad bar…      | salad bar        | he inhales the whole bar; a customer with an empty plate
// 25.0–28.4 damage   The manager…    | wrecked room     | Denise with a clipboard, Otis's guilty face (mess, puddles, tipped chairs)
// 28.4–29.9 sheet    Last chance…    | counter          | she slaps down the worksheet: HANDWRITTEN WORK ONLY, due 8 AM
// 29.9–31.4 gulp                     | counter          | Otis gulps
// 31.4–33.8 pencil   Every pencil…   | night, table     | chairs up, a desk lamp: pencil after pencil snaps in his jaws
// 33.8–35.0 photo    One photo…      | night            | the phone held gently in his lips: flash
// 35.0–37.4 laptop   Scribe solved…  | laptop screen    | Scribe: reading 20 problems → solving → all 20 solved
// 37.4–39.8 write    His handwriting | the worksheet    | the answers write themselves, glyph by glyph, a red pen nib on the tip
// 39.8–41.2 watch                    | night            | Otis watching, eyes go happy
// 41.2–44.8 promo    20/20 Promoted  | morning          | Denise holds up the sheet: A+; a gold MANAGER cap, confetti, applause
// 44.8–48.4 dig      New boss…       | outside          | time-lapse: the crew digs a pond by the drive-thru, it fills, HIPPO LANE
// 48.4–52.0 lane     Busiest…        | the pond         | Otis in the pond hands bags into car windows; the queue rolls
// 52.0–60.0 flop     Displacement…   | the pond         | a happy belly flop: a splash, the lane floods, cars float. End card 55.85
import * as THREE from 'three';
import { K, clamp, lerp, rng, mat, mk, canvasTex, easeIO, smooth, walkLegs, faceToward } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, makeHead } from '@engine/rig.js';
import { makePhone } from '@engine/props.js';
import { makeCar } from '@engine/sets/city.js';
import { buildBurger, DIMS as BD } from '@engine/sets/burger.js';
import { makeHippo } from '@engine/hippo.js';
import { makeSimHud, SIM_FONTS } from '@engine/simhud.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';

const PI = Math.PI;
const SEAT_Y = -0.31;
export const SHOTS = [
  { t0: 0, t1: 4.6, cam: 'arrive', ext: true },
  { t0: 4.6, t1: 8.0, cam: 'floor' },
  { t0: 8.0, t1: 11.4, cam: 'uniform' },
  { t0: 11.4, t1: 14.8, cam: 'order' },
  { t0: 14.8, t1: 18.2, cam: 'soda' },
  { t0: 18.2, t1: 21.6, cam: 'charge' },
  { t0: 21.6, t1: 25.0, cam: 'salad' },
  { t0: 25.0, t1: 28.4, cam: 'damage' },
  { t0: 28.4, t1: 29.9, cam: 'sheet' },
  { t0: 29.9, t1: 31.4, cam: 'gulp' },
  { t0: 31.4, t1: 33.8, cam: 'pencil', night: true },
  { t0: 33.8, t1: 35.0, cam: 'photo', night: true },
  { t0: 35.0, t1: 37.4, cam: 'laptop', night: true },
  { t0: 37.4, t1: 39.8, cam: 'write', night: true },
  { t0: 39.8, t1: 41.2, cam: 'watch', night: true },
  { t0: 41.2, t1: 44.8, cam: 'promo' },
  { t0: 44.8, t1: 48.4, cam: 'dig', ext: true },
  { t0: 48.4, t1: 52.0, cam: 'lane', ext: true },
  { t0: 52.0, t1: 60.0, cam: 'flop', ext: true },
];
// events shared with make_cues.py (story.json "ev" overrides nothing; this is the one place they live — make_cues imports them by regex)
export const EV = {
  pop: 3.92, cracks: [4.95, 5.45, 5.95, 6.45], bigCrack: 7.3, shirtOn: 9.0, rip: 10.2, cap: 10.65,
  yawn0: 12.35, yawnTop: 13.25, yawn1: 14.25, spray0: 15.35, chargeHit: 20.42, burgerLand: 21.25,
  slap: 28.72, gulp: 30.55, snaps: [31.95, 32.6, 33.25], flash: 34.45, scan0: 35.05, solve0: 35.65, solve1: 36.85,
  write0: 37.6, write1: 40.5, happy: 40.35, aplus: 42.25, mgr: 43.0, dig0: 44.95, dig1: 46.55, fill1: 47.55, sign: 47.65,
  bags: [49.05, 51.35], carGo: 49.7, flopUp: 52.55, flop: 53.35, end: 55.85,
};
// cameras: keys = [[t, pos, aim], …] (world coords; eased between keys); fov
export const CAMS = {
  arrive:  { keys: [[0, [0.4, 1.2, 18.6], [-0.7, 1.9, 8.0]], [2.6, [0.3, 1.2, 17.2], [-0.3, 1.8, 7.6]], [4.6, [0.25, 1.25, 16.4], [-0.1, 1.7, 7.0]]], fov: 52 },
  floor:   { keys: [[4.6, [0.9, 0.5, 1.3], [0.35, 0.92, 4.3]], [8.0, [0.85, 0.45, 1.4], [0.3, 0.82, 4.3]]], fov: 64 },
  uniform: { keys: [[8.0, [2.9, 1.5, 4.6], [-0.1, 1.3, 2.65]], [11.4, [2.7, 1.48, 4.4], [-0.1, 1.3, 2.65]]], fov: 52 },
  order:   { keys: [[11.4, [3.3, 1.55, 3.6], [1.35, 1.42, 0.65]], [14.8, [3.15, 1.5, 3.35], [1.35, 1.45, 0.65]]], fov: 54 },
  soda:    { keys: [[14.8, [4.9, 1.55, 4.9], [5.8, 1.2, 1.9]], [18.2, [4.95, 1.5, 4.6], [5.8, 1.18, 1.9]]], fov: 54 },
  charge:  { keys: [[18.2, [-5.4, 1.65, 2.2], [1.5, 1.0, 2.4]], [21.6, [-5.4, 1.7, 2.3], [-1.4, 0.9, 3.0]]], fov: 56 },
  salad:   { keys: [[21.6, [0.3, 1.6, 5.5], [3.4, 1.05, 4.0]], [25.0, [0.5, 1.55, 5.4], [3.7, 1.05, 4.0]]], fov: 54 },
  damage:  { keys: [[25.0, [3.3, 1.55, 4.9], [-0.6, 1.2, 2.6]], [28.4, [2.6, 1.48, 4.3], [-0.4, 1.25, 2.65]]], fov: 54 },
  sheet:   { keys: [[28.4, [-0.5, 1.75, 1.2], [-0.5, 1.09, 0.48]], [29.9, [-0.5, 1.7, 1.12], [-0.5, 1.09, 0.5]]], fov: 46 },
  gulp:    { keys: [[29.9, [-0.25, 1.48, -0.05], [-0.5, 1.15, 2.4]], [31.4, [-0.3, 1.46, 0.15], [-0.5, 1.15, 2.4]]], fov: 50 },
  pencil:  { keys: [[31.4, [-3.3, 1.28, 4.0], [-3.72, 1.0, 2.5]], [33.8, [-3.35, 1.25, 3.85], [-3.72, 1.0, 2.5]]], fov: 48 },
  photo:   { keys: [[33.8, [-3.5, 1.18, 3.55], [-3.7, 1.0, 2.6]], [35.0, [-3.52, 1.16, 3.45], [-3.7, 1.0, 2.6]]], fov: 44 },
  laptop:  { keys: [[35.0, [-3.4, 1.29, 1.86], [-3.4, 0.912, 2.955]], [37.4, [-3.4, 1.26, 1.94], [-3.4, 0.912, 2.955]]], fov: 36 },
  write:   { keys: [[37.4, [-3.62, 1.42, 1.9], [-3.62, 0.79, 2.42]], [39.8, [-3.62, 1.36, 1.98], [-3.62, 0.79, 2.42]]], fov: 42 },
  watch:   { keys: [[39.8, [-1.7, 1.2, 3.3], [-3.65, 1.0, 2.2]], [41.2, [-1.85, 1.18, 3.15], [-3.65, 1.05, 2.2]]], fov: 50 },
  promo:   { keys: [[41.2, [1.6, 1.5, 5.6], [0.2, 1.35, 2.6]], [44.8, [1.5, 1.48, 5.3], [0.2, 1.35, 2.6]]], fov: 56 },
  dig:     { keys: [[44.8, [16.6, 16.0, 9.6], [17.5, 0.0, -1.6]], [48.4, [16.9, 17.2, 9.0], [17.5, 0.0, -2.0]]], fov: 60 },
  lane:    { keys: [[48.4, [13.0, 1.6, -9.2], [11.2, 0.8, 0.8]], [52.0, [12.8, 1.6, -8.6], [11.2, 0.8, 0.8]]], fov: 52 },
  flop:    { keys: [[52.0, [5.6, 4.0, 9.6], [13.6, 0.3, -1.0]], [55.8, [5.0, 4.6, 10.5], [13.5, 0.2, -1.0]], [60.0, [4.8, 4.9, 11.0], [13.5, 0.2, -1.0]]], fov: 56 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
function camAt(c, t) {
  const k = c.keys; if (t <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) { const u = easeIO((t - k[i][0]) / (k[i + 1][0] - k[i][0])); return [k[i][1].map((v, j) => lerp(v, k[i + 1][1][j], u)), k[i][2].map((v, j) => lerp(v, k[i + 1][2][j], u))]; }
  const l = k[k.length - 1]; return [l[1], l[2]];
}
// camera jolts: [t, amp(m)] — decaying shake on every impact
const JOLTS = [[EV.pop, 0.05], ...EV.cracks.map((c) => [c, 0.025]), [EV.bigCrack, 0.05], [EV.rip, 0.02], [EV.chargeHit, 0.07], [19.0, 0.02], [19.5, 0.02], [20.0, 0.02], [EV.slap, 0.02], ...EV.snaps.map((s) => [s, 0.012]), [EV.flop, 0.08]];
function jolt(t) { let x = 0, y = 0; for (const [te, a] of JOLTS) { const u = t - te; if (u < 0 || u > 0.7) continue; const e = a * Math.exp(-u * 8); x += e * Math.sin(u * 47); y += e * Math.cos(u * 39); } return [x, y]; }

// arm presets: A(sx, sz, el, twist, free)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const HOLD_A = A(-0.95, 0.05, -0.9, 0.5), HOLD_B = A(-0.95, 0.05, -0.9, -0.5);
const PULL_A = A(-1.25, 0.2, -0.35, 0.3), PULL_B = A(-1.25, 0.2, -0.35, -0.3);
const CLIP_A = A(-0.7, 0.1, -1.5, 0.6), PEN_B = A(-0.75, 0.0, -1.6, -0.7);
const CROSS_A = A(-0.55, 0.05, -1.9, 0.95), CROSS_B = A(-0.5, 0.05, -1.95, -0.95);
const SHOCK_A = A(-0.4, 0.9, -1.9, 0.6), SHOCK_B = A(-0.4, 0.9, -1.9, -0.6);
const UP_A = A(-2.6, 0.35, -0.3), UP_B = A(-2.6, 0.35, -0.3);
const SLAP_B = A(-1.1, 0.05, -0.25, -0.2);
const TRAY_A = A(-0.6, 0.15, -1.4, 0.6), TONG_B = A(-0.7, 0.05, -1.3, -0.5);
const SHOVEL_A = (k) => A(-0.6 - 0.5 * k, 0.1, -1.0, 0.5), SHOVEL_B = (k) => A(-0.9 - 0.5 * k, 0.05, -0.6, -0.4);
const CLAP = (t, ph = 0) => { const c = Math.max(0, Math.sin(t * 13 + ph)); return [A(-1.1, 0.15 + 0.22 * c, -1.25, 0.9), A(-1.1, 0.15 + 0.22 * c, -1.25, -0.9)]; };
const easeOutBack = (u) => { const c1 = 1.70158, c3 = c1 + 1; u = clamp(u); return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; };
const boing = (t, t0, d = 0.4) => { if (t < t0) return 0; const u = (t - t0) / d; return u >= 1 ? 1 + 0.05 * Math.exp(-(t - t0 - d) * 6) * Math.sin((t - t0 - d) * 20) : easeOutBack(u); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

export async function build(studio, story) {
  const { scene, camera, THREE: T3 } = studio; void T3;
  const B = buildBurger(studio, {});
  camera.far = 340; camera.near = 0.04; camera.updateProjectionMatrix();
  for (const id of ['title', 'hud', 'sub', 'end']) document.getElementById(id).style.display = 'none';   // the sim overlay replaces the core text layer
  const hud = makeSimHud(story.sim);
  await Promise.all(SIM_FONTS.map((f) => document.fonts.load(f)));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---------------------------------------------------------------- cast
  const otis = makeHippo({ name: 'OTIS' }); scene.add(otis.g); otis.g.rotation.order = 'YXZ';
  const staffCap = (rig, color = 0xf4c430) => {
    const c = new THREE.Group(); c.position.set(0, 0.035, 0.0); c.rotation.x = -0.22; rig.head.g.add(c);
    const m = mat(color, 0.6);
    mk(new THREE.SphereGeometry(0.152, 20, 10, 0, PI * 2, 0, PI / 2), m, c).scale.set(1, 0.85, 1.02);
    const v = mk(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 20, 1, false, -PI / 2, PI), m, c, 0, 0.0, 0.07); v.scale.set(0.95, 1, 1.3);
    return c;
  };
  const P = (o) => { const r = makePerson(o); scene.add(r.root); return r; };
  const denise = P({ skin: 0xc68a63, top: 0x2c4f7c, collar: 0xf3e9dc, pants: 0x2a2a30, hair: 0x3a2418, hairStyle: 'bob', glasses: true });
  const kai = P({ skin: 0xe8b48f, top: 0xd8392b, collar: 0xf4c430, pants: 0x2a2a30, hair: 0x1a1210, hairStyle: 'short' }); staffCap(kai);
  const walt = P({ skin: 0xe2ad8c, top: 0x3d7bd9, pants: 0x5a4a3a, hair: 0x7a6a5a, hairStyle: 'messy', mustache: 0x6a5a4a });
  const pam = P({ skin: 0x8a5a3e, top: 0x8fd16a, pants: 0x3a3a5a, hair: 0x1a1210, hairStyle: 'bob' });
  const diners = [
    P({ skin: 0xf0c4a0, top: 0x8a5ad0, pants: 0x34405c, hair: 0xc98a3a, hairStyle: 'messy' }),
    P({ skin: 0xd9a27e, top: 0xe8a33d, pants: 0x4a3a2a, hair: 0xdedede, hairStyle: 'short', glasses: true }),
    P({ skin: 0x6e4630, top: 0xd96f9a, pants: 0x2a2a30, hair: 0x140c08, hairStyle: 'bob' }),
    P({ skin: 0xe8b48f, top: 0x3fae9a, pants: 0x3a4a6a, hair: 0x5a3a1e, hairStyle: 'short' }),
  ];
  const crew = [kai, P({ skin: 0xb07a52, top: 0xd8392b, collar: 0xf4c430, pants: 0x2a2a30, hair: 0x140c08, hairStyle: 'short' }), P({ skin: 0xf0c4a0, top: 0xd8392b, collar: 0xf4c430, pants: 0x2a2a30, hair: 0x9a5a2a, hairStyle: 'bob' })];
  staffCap(crew[1]); staffCap(crew[2]);
  const everyone = [denise, kai, walt, pam, ...diners, crew[1], crew[2]];

  // ---------------------------------------------------------------- props
  const clip = new THREE.Group(); mk(new THREE.BoxGeometry(0.24, 0.32, 0.012), mat(0x8a5a3a, 0.6), clip); mk(new THREE.BoxGeometry(0.21, 0.27, 0.004), mat(0xffffff, 0.8), clip, 0, -0.01, 0.008); mk(new THREE.BoxGeometry(0.08, 0.03, 0.02), mat(0xb0b4b8, 0.3, { metalness: 0.6 }), clip, 0, 0.15, 0.01); scene.add(clip);
  const shovel = () => { const g = new THREE.Group(); mk(new THREE.CylinderGeometry(0.018, 0.018, 1.15, 8), mat(0x9a6a3a, 0.7), g, 0, 0, 0); const bl = mk(new THREE.BoxGeometry(0.22, 0.28, 0.02), mat(0x6a6e74, 0.4, { metalness: 0.5 }), g, 0, -0.68, 0.02); bl.rotation.x = 0.2; scene.add(g); return g; };
  const shovels = crew.map(() => shovel());
  // the tray Otis carries on his back in the charge: red tray, a burger, fries, a cup
  const burger = new THREE.Group();
  for (const [y, r, h, c] of [[0.0, 0.07, 0.03, 0xd8a050], [0.03, 0.075, 0.025, 0x6a3a1e], [0.05, 0.078, 0.01, 0x5fae47], [0.06, 0.075, 0.01, 0xf4c430], [0.085, 0.07, 0.045, 0xe0a95a]]) mk(new THREE.CylinderGeometry(r, r * (y > 0.08 ? 1 : 1), h, 16), mat(c, 0.6), burger, 0, y + h / 2, 0);
  scene.add(burger);
  const tray = new THREE.Group(); mk(new THREE.BoxGeometry(0.46, 0.025, 0.34), mat(0xd8392b, 0.5), tray);
  const fries = new THREE.Group(); fries.position.set(0.13, 0.01, 0.06); tray.add(fries); mk(new THREE.BoxGeometry(0.08, 0.1, 0.05), mat(0xd8392b, 0.5), fries, 0, 0.05, 0); for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.012, 0.08, 0.012), mat(0xf4c430, 0.6), fries, -0.03 + k * 0.012, 0.12, 0);
  mk(new THREE.CylinderGeometry(0.045, 0.035, 0.14, 12), mat(0xffffff, 0.6), tray, -0.14, 0.08, 0.05);
  otis.anchors.back.add(tray); tray.position.set(0, 0.0, 0.1);
  const plate = mk(new THREE.CylinderGeometry(0.13, 0.11, 0.015, 20), mat(0xffffff, 0.4), scene, -3.7, BD.tableTop + 0.035, 4.92);
  // the polo shirt that doesn't fit (a red tube with a yellow collar, slid over his snout)
  const shirt = new THREE.Group(); otis.headG.add(shirt);
  const shirtM = mat(0xd8392b, 0.8, { side: THREE.DoubleSide });
  const tube = mk(new THREE.CylinderGeometry(1, 1, 0.42, 28, 1, true), shirtM, shirt); tube.rotation.x = PI / 2;
  const stripe = mk(new THREE.CylinderGeometry(1.004, 1.004, 0.07, 28, 1, true), mat(0xf4c430, 0.7, { side: THREE.DoubleSide }), shirt); stripe.rotation.x = PI / 2;
  for (const s of [-1, 1]) { const sl = mk(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 12, 1, true), shirtM, shirt, s * 1.0, 0.1, -0.02); sl.rotation.z = s * (PI / 2 - 0.4); }
  // the gold MANAGER cap (swapped in at the promotion)
  const goldCap = new THREE.Group(); otis.headG.add(goldCap); goldCap.position.copy(otis.cap.position); goldCap.rotation.copy(otis.cap.rotation);
  { const gm = mat(0xf3c046, 0.3, { metalness: 0.5 }); mk(new THREE.SphereGeometry(0.17, 20, 10, 0, PI * 2, 0, PI / 2), gm, goldCap).scale.set(1, 0.9, 1); const v = mk(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 20, 1, false, -PI / 2, PI), gm, goldCap, 0, 0.005, 0.08); v.scale.set(0.9, 1, 1.25); mk(new THREE.OctahedronGeometry(0.05, 0), mat(0xd8392b, 0.4), goldCap, 0, 0.16, 0.0); }
  goldCap.visible = false;
  // night props on table 0: desk lamp + light, the worksheet, a pencil cup, a laptop, a phone
  const T0 = B.tables[0];
  const lamp = new THREE.Group(); lamp.position.set(T0.x - 0.36, BD.tableTop + 0.025, T0.z + 0.36); lamp.rotation.y = PI * 0.75; scene.add(lamp);
  mk(new THREE.CylinderGeometry(0.08, 0.09, 0.025, 16), mat(0x2a2a30, 0.4), lamp); const arm = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 8), mat(0x2a2a30, 0.4), lamp, 0, 0.19, 0); arm.rotation.z = 0.25;
  const shade = mk(new THREE.ConeGeometry(0.11, 0.13, 18, 1, true), mat(0x2f6a4a, 0.5, { side: THREE.DoubleSide }), lamp, -0.08, 0.38, -0.02); shade.rotation.z = 0.6;
  mk(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c8 }), lamp, -0.1, 0.35, -0.02);
  const lampLight = new THREE.PointLight(0xffdcaa, 0, 5, 1.5); lampLight.position.set(-0.15, 0.32, -0.12); lamp.add(lampLight);
  const sheet = makeSheet(G, { title: 'NIGHT CLASS · MATH 101 · WORKSHEET 4', note: 'Due 8:00 AM  ·  HANDWRITTEN WORK ONLY', name: 'Otis', seed: 5, page: 'p. 1 of 4',
    problems: [
      { q: '1.  Solve:  3x + 7 = 22', a: '3x = 15   x = 5' },
      { q: '2.  Simplify:  4(2y - 3) + 5y', a: '8y - 12 + 5y = 13y - 12' },
      { q: '3.  One burger costs 6.49. How much are 12?', a: '12 x 6.49 = 77.88' },
      { q: '4.  Solve:  x² - 9 = 0', a: 'x^2 = 9   x = ±3' },
      { q: '5.  Slope through (1, 2) and (3, 8)', a: 'm = (8-2)/(3-1) = 3' },
      { q: '6.  Graph  y = x² - 4x + 3', a: 'roots: x = 1, 3', graph: true },
    ] });
  const screen = makeScreen(G, icon, sheet, { n: 20, name: 'Otis' });
  const SW = 0.43, SH = 0.43 * 1325 / 1024;
  const sheetMat = new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.9, color: 0xd6d2ca });
  const stampTex = canvasTex(512, 160, (g, w, h) => { g.strokeStyle = 'rgba(200,30,30,.85)'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = 'rgba(200,30,30,.85)'; g.font = '900 66px Inter, Arial'; g.textAlign = 'center'; g.fillText('HANDWRITTEN', w / 2, 76); g.font = '900 44px Inter, Arial'; g.fillText('ONLY · DUE 8 AM', w / 2, 132); });
  const aplusTex = canvasTex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(205,25,25,.92)'; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, h / 2, 110, 0, 7); g.stroke(); g.fillStyle = 'rgba(205,25,25,.92)'; g.font = '900 120px Inter, Arial'; g.textAlign = 'center'; g.fillText('A+', w / 2, 168); });
  const sheetMesh = (stamp = true) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), sheetMat); m.receiveShadow = true; scene.add(m);
    if (stamp) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.0625), new THREE.MeshBasicMaterial({ map: stampTex, transparent: true, depthWrite: false })); s.position.set(0.09, SH / 2 - 0.15, 0.002); s.rotation.z = 0.12; m.add(s); }
    return m;
  };
  const deskSheet = sheetMesh(); deskSheet.rotation.set(-PI / 2, 0, PI); deskSheet.position.set(T0.x + 0.06, BD.tableTop + 0.027, T0.z - 0.12);
  const counterSheet = sheetMesh(); counterSheet.rotation.set(-PI / 2, 0, 0);
  const heldSheet = sheetMesh(false);
  const aplus = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), new THREE.MeshBasicMaterial({ map: aplusTex, transparent: true, depthWrite: false })); aplus.position.set(0.1, SH / 2 - 0.12, 0.003); aplus.rotation.z = -0.15; heldSheet.add(aplus);
  const pencilGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 6), pencilM = mat(0xf2c230, 0.5), pinkM = mat(0xe88aa0, 0.6), woodM = mat(0xe0b88a, 0.6);
  const makePencil = (len = 0.19) => { const g = new THREE.Group(); const b = mk(pencilGeo, pencilM, g); b.scale.y = len; mk(new THREE.CylinderGeometry(0.0058, 0.0058, 0.016, 8), pinkM, g, 0, len / 2 + 0.008, 0); mk(new THREE.ConeGeometry(0.0055, 0.022, 8), woodM, g, 0, -len / 2 - 0.011, 0).rotation.x = PI; scene.add(g); return g; };
  const mouthPencil = makePencil(); mouthPencil.scale.setScalar(1.7); const cup = mk(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 14), mat(0xd8392b, 0.5), scene, T0.x - 0.4, BD.tableTop + 0.075, T0.z + 0.05);
  const cupPencils = [0, 1, 2, 3].map((k) => { const p = makePencil(0.17); p.position.set(T0.x - 0.4 + (k % 2 - 0.5) * 0.02, BD.tableTop + 0.15, T0.z + 0.05 + (k > 1 ? 0.012 : -0.012)); p.rotation.z = (k - 1.5) * 0.12; return p; });
  // broken pencil halves on the table (a pile that grows) — instanced
  const halvesN = 14, halves = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.09, 6), pencilM, halvesN); halves.frustumCulled = false; halves.castShadow = true; scene.add(halves);
  const laptop = new THREE.Group(); laptop.position.set(T0.x + 0.3, BD.tableTop + 0.026, T0.z + 0.3); laptop.rotation.y = PI; scene.add(laptop);
  mk(new THREE.BoxGeometry(0.34, 0.016, 0.24), mat(0xb8bcc2, 0.35, { metalness: 0.4 }), laptop, 0, 0.008, 0);
  const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.12); laptop.add(lid); lid.rotation.x = -0.32;
  mk(new THREE.BoxGeometry(0.34, 0.225, 0.01), mat(0xb8bcc2, 0.35, { metalness: 0.4 }), lid, 0, 0.1125, -0.006);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.315, 0.197), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); scr.position.set(0, 0.1125, 0.0005); lid.add(scr);
  const scrLight = new THREE.PointLight(0xdfe8ff, 0, 2.2, 1.6); scrLight.position.set(0, 0.12, 0.25); lid.add(scrLight);
  const phone = makePhone(); scene.add(phone.g); phone.g.scale.setScalar(1.3);
  phone.g.children[1].material = new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(330, 690, (g, w, h) => { g.fillStyle = '#0b0b0e'; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h * 0.44); g.rotate(-0.04); g.drawImage(sheet.canvas, -135, -175, 270, 350); g.restore(); g.strokeStyle = '#ffd23f'; g.lineWidth = 4; for (const [x, y, sx, sy] of [[20, 70, 1, 1], [w - 20, 70, -1, 1], [20, 560, 1, -1], [w - 20, 560, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 40); g.lineTo(x, y); g.lineTo(x + sx * 40, y); g.stroke(); } g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h - 62, 34, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h - 62, 44, 0, 7); g.stroke(); g.font = '600 22px Inter, Arial'; g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText('PHOTO', w / 2, 40); }) });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,250,235,.7)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(flash); const flashLight = new THREE.PointLight(0xffffff, 0, 4, 1.4); scene.add(flashLight);
  const nib = new THREE.Group(); scene.add(nib);
  { const r = mat(0x9a1c25, 0.35); mk(new THREE.CylinderGeometry(0.009, 0.012, 0.12, 12), r, nib, 0, 0.075, 0); mk(new THREE.ConeGeometry(0.009, 0.03, 12), mat(0xd8d2c4, 0.3, { metalness: 0.6 }), nib, 0, 0.0, 0).rotation.x = PI; }
  nib.rotation.set(0.5, 0, -0.35);
  // drive-thru bags + the lane's queue of cars (with drivers' heads)
  const bagM = mat(0xc9a274, 0.85), bags = [0, 1].map(() => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.22, 0.28, 0.14), bagM, g); mk(new THREE.BoxGeometry(0.225, 0.07, 0.145), mat(0xd8392b, 0.6), g, 0, 0.04, 0); scene.add(g); return g; });
  const queue = [[0xd2483f, 0x8a5a3e], [0x3d7bd9, 0xe8b48f], [0xf2c14e, 0xf0c4a0], [0x4f9a6a, 0x6e4630], [0xe8e4dc, 0xd9a27e]].map(([c, skin], i) => {
    const car = makeCar(c, 20 + i); scene.add(car.g);
    const head = makeHead({ r: 0.13, skin, hair: [0x1a1210, 0x6a4a2a, 0xc98a3a, 0x140c08, 0xdedede][i], hairStyle: i % 2 ? 'short' : 'bob' });
    head.g.position.set(-0.4, 1.28, -0.25); car.g.add(head.g);
    return { car, head };
  });

  // ---------------------------------------------------------------- FX: cracks, puffs, bits, spray
  const crackTex = canvasTex(512, 512, (g, w, h) => {
    const r = rng(31); g.strokeStyle = 'rgba(40,24,16,.9)'; g.lineCap = 'round';
    g.lineJoin = 'round';
    for (let k = 0; k < 10; k++) { let a = (k / 10) * PI * 2 + r() * 0.4, x = w / 2, y = h / 2; for (let s = 0; s < 7; s++) { a += (r() - 0.5) * 0.9; const L = 20 + r() * 20, nx = x + Math.cos(a) * L, ny = y + Math.sin(a) * L; g.lineWidth = Math.max(5, 20 - s * 2.4); g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); if (r() < 0.35) { g.lineWidth = 5; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + Math.cos(a + 1) * 26, ny + Math.sin(a + 1) * 26); g.stroke(); } x = nx; y = ny; } }
    g.fillStyle = 'rgba(40,24,16,.85)'; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 7); g.fill();
    g.lineWidth = 8; for (let k = 0; k < 2; k++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * PI * 2, rr = 70 + k * 60 + (r() - 0.5) * 18; i ? g.lineTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr) : g.moveTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr); } g.stroke(); }
  });
  const crackM = new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, color: 0x2a1810 });
  const cracks = [];
  const addCrack = (te, x, z, r, rot = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), crackM); m.rotation.set(-PI / 2, 0, rot); m.position.set(x, 0.012, z); m.renderOrder = 1; scene.add(m); cracks.push({ m, te, r }); };
  const puffTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const puffs = [];
  const addPuffs = (te, x, y, z, n, size, color = 0xd9c9b0, spread = 0.6, life = 1.0, seed = 1) => { const r = rng(seed); for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); const a = r() * PI * 2; puffs.push({ s, te: te + r() * 0.08, o: V3(x, y, z), d: V3(Math.cos(a) * spread * (0.5 + r()), 0.25 + r() * 0.5, Math.sin(a) * spread * (0.5 + r())), size: size * (0.7 + r() * 0.6), life: life * (0.8 + r() * 0.4) }); } };
  // ballistic bits (one instanced mesh, per-instance colours)
  const BITS = [];
  const addBits = (o) => { BITS.push(o); };
  // spray jets from the fizz nozzles (instanced droplets on a loop)
  const sprayN = 900, spray = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 6, 5), new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.05, transparent: true, opacity: 0.8 }), sprayN); spray.frustumCulled = false; scene.add(spray);
  { const cols = [0x7a3a1a, 0xf28a2a, 0xf4e04a, 0xcfeeff, 0xd8392b, 0xcfeeff]; for (let i = 0; i < sprayN; i++) spray.setColorAt(i, new THREE.Color(cols[i % 6]).lerp(new THREE.Color(0xffffff), 0.35)); }
  scene.updateMatrixWorld(true);
  const nozW = B.nozzles.map((n) => B.fizz.localToWorld(n.clone()));

  // ---- event setup (all deterministic)
  const Rr = rng(55);
  // floor cracks: under the front feet on each plant, then one big one under him
  const floorWalk = (t) => walkLegs(t, [0, 6.15], [{ t0: 4.62, t1: 6.75, pts: [[0, 5.35]] }]);
  EV.cracks.forEach((te, i) => { const w = floorWalk(te), s = i % 2 ? 1 : -1; addCrack(te, w.x + s * 0.5, w.z - 0.85, 1.4, i * 1.3); addPuffs(te, w.x + s * 0.5, 0.05, w.z - 0.85, 5, 0.35, 0xe8d8c0, 0.5, 0.8, 10 + i); addBits({ t0: te, n: 10, o: [w.x + s * 0.5, 0.03, w.z - 0.85], v: [0, 1.6, 0], spread: 1.1, color: [0xd9774c, 0xf1e3cb], size: [0.04, 0.08], shape: [1, 0.25, 1], life: 1.2, seed: 20 + i }); });
  addCrack(EV.bigCrack, 0, 5.35, 2.9, 0.7); addPuffs(EV.bigCrack, 0, 0.05, 5.35, 12, 0.6, 0xe8d8c0, 1.4, 1.1, 9);
  addBits({ t0: EV.bigCrack, n: 22, o: [0, 0.03, 5.35], v: [0, 2.0, 0], spread: 2.2, color: [0xd9774c, 0xf1e3cb], size: [0.05, 0.1], shape: [1, 0.25, 1], life: 1.4, seed: 30 });
  // door pop
  addPuffs(EV.pop, 0, 1.0, 6.2, 14, 0.7, 0xe8e0d0, 1.2, 1.1, 40); addBits({ t0: EV.pop, n: 16, o: [0, 1.2, 6.1], v: [0, 1.2, -1.5], spread: 1.8, color: [0x2f3136, 0xbfd8e8], size: [0.05, 0.12], shape: [1, 1, 0.3], life: 1.4, seed: 41 });
  // shirt rip
  addBits({ t0: EV.rip, n: 18, o: null, anchor: 'shirt', v: [0, 1.2, 0], spread: 1.6, color: [0xd8392b, 0xf4c430], size: [0.06, 0.13], shape: [1, 0.15, 1], life: 1.3, seed: 50, g: 4 });
  // charge: dust behind his feet, the table smash
  for (let k = 0; k < 8; k++) { const tt = 18.45 + k * 0.24, w = chargeWalk(tt); addPuffs(tt, w.x, 0.1, w.z, 3, 0.5, 0xe8d8c0, 0.4, 0.9, 60 + k); }
  addPuffs(EV.chargeHit, -3.7, 0.6, 2.5, 10, 0.6, 0xe8e0d0, 1.0, 1.0, 70);
  addBits({ t0: EV.chargeHit, n: 16, o: [-3.7, 0.8, 2.5], v: [-1.4, 2.0, 0.3], spread: 2.0, color: [0xd8392b, 0xf4c430, 0xffffff], size: [0.04, 0.09], shape: [1, 1, 1], life: 1.3, seed: 71 });
  // pencils: two halves + splinters per snap (land on the table)
  EV.snaps.forEach((te, i) => addBits({ t0: te, n: 10, o: null, anchor: 'mouth', v: [0, 1.4, 0.4], spread: 1.0, color: [0xf2c230, 0xe0b88a], size: [0.01, 0.03], shape: [1, 3, 1], life: 1.0, floor: BD.tableTop + 0.03, seed: 80 + i }));
  // promotion confetti
  addBits({ t0: EV.mgr, n: 160, o: [0.3, 2.05, 2.7], v: [0, 1.2, 0], spread: 2.2, color: [0xd8392b, 0xf4c430, 0x3d7bd9, 0x5fae47, 0xffffff, 0xd96f9a], size: [0.04, 0.06], shape: [1, 0.05, 0.6], life: 3.5, g: 1.6, drag: 1.2, seed: 90 });
  // the flop: a splash crown of droplets + foam puffs
  addBits({ t0: EV.flop, n: 160, o: [14.4, 0.1, -1.0], v: [0, 6.5, 0], spread: 3.6, color: [0xcfeeff, 0xffffff, 0x9fd6f0], size: [0.05, 0.11], shape: [1, 1, 1], life: 2.2, floor: -0.2, seed: 95, sphere: true });
  addPuffs(EV.flop, 14.4, 0.4, -1.0, 16, 1.4, 0xffffff, 2.0, 1.6, 96);
  // dig: dirt flying from three shovels on a time-lapse loop
  for (let k = 0; k < 14; k++) addBits({ t0: EV.dig0 + k * 0.11, n: 6, o: [18 + Math.cos(k * 2.3) * 3.4, 0.2, -2.2 + Math.sin(k * 2.3) * 3.4], v: [Math.cos(k * 2.3) * 1.6, 3.0, Math.sin(k * 2.3) * 1.6], spread: 0.8, color: [0x7a5a3a, 0x5a4230], size: [0.06, 0.12], shape: [1, 1, 1], life: 1.1, seed: 100 + k });
  // salad: pieces stream from the bins into his mouth (handled in update; positions computed from the mouth)
  const bitsN = BITS.reduce((s, b) => s + b.n, 0);
  const bitsIM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), bitsN); bitsIM.frustumCulled = false; bitsIM.castShadow = true; scene.add(bitsIM);
  const dropIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.9 }), 200); dropIM.frustumCulled = false; scene.add(dropIM);
  { let i = 0, j = 0; for (const b of BITS) { const r = rng(b.seed); b.p = []; for (let k = 0; k < b.n; k++) { const c = new THREE.Color(b.color[k % b.color.length]); const a = r() * PI * 2, sp = b.spread * (0.3 + r() * 0.7); b.p.push({ dv: [Math.cos(a) * sp, r() * b.spread * 0.6, Math.sin(a) * sp], s: lerp(b.size[0], b.size[1], r()), spin: [r() * 9 - 4.5, r() * 9 - 4.5, r() * 9 - 4.5], dt: r() * 0.06, idx: b.sphere ? j++ : i++ }); if (b.sphere) dropIM.setColorAt(j - 1, c); else bitsIM.setColorAt(i - 1, c); } } }
  const saladN = 60, saladIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 0), new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true }), saladN); saladIM.frustumCulled = false; scene.add(saladIM);
  for (let i = 0; i < saladN; i++) saladIM.setColorAt(i, new THREE.Color([0x6fbf4a, 0xd9412f, 0xf28a2a, 0xb9e08a, 0xd9a860, 0xf4d03a][i % 6]));
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

  function chargeWalk(t) { return walkLegs(t, [3.8, -1.7], [{ t0: 18.3, t1: 18.8, pts: [[3.75, 0.7]] }, { t0: 18.8, t1: 20.5, pts: [[2.9, 2.2], [0.0, 2.3], [-1.6, 2.3]] }]); }

  // ---------------------------------------------------------------- poses
  const seat = (r, x, z, ry, extra = {}) => { const p = basePose(); Object.assign(p, { x, z, y: SEAT_Y, rotY: ry, footFwd: 0.42, lean: 0.08, armA: A(-0.5, 0.05, -1.3, 0.4), armB: A(-0.5, 0.05, -1.3, -0.4) }, extra); applyPose(r, p); return p; };
  const stand = (r, x, z, ry, extra = {}) => { const p = basePose(); Object.assign(p, { x, z, rotY: ry }, extra); applyPose(r, p); return p; };
  const handW = (r, side) => { r.root.updateMatrixWorld(true); return r.arms.find((a) => a.s === side).hand.getWorldPosition(new THREE.Vector3()); };
  const putAt = (obj, v, ry = 0) => { obj.position.copy(v); obj.rotation.set(0, ry, 0); obj.visible = true; };

  // ---------------------------------------------------------------- update
  function update(t) {
    const shot = shotAt(t), C = shot.cam;
    const night = !!shot.night, ext = !!shot.ext;
    B.setNight(night ? 1 : 0);
    if (ext) B.aimSun(C === 'arrive' ? 0 : 14, C === 'arrive' ? 9 : -1, 18, false); else B.aimSun(0, 2, 10, !night);
    B.clock.setClock(night ? 2 : C === 'promo' ? 8 : 12, night ? 14 + (t - 31.4) * 2 : C === 'promo' ? 5 : 20);
    for (const r of everyone) r.root.visible = false;
    for (const s of shovels) s.visible = false;
    for (const q of queue) q.car.g.visible = false;
    clip.visible = false; burger.visible = false; tray.visible = false; plate.visible = false; shirt.visible = false;
    lamp.visible = night; lampLight.intensity = night ? 3.6 : 0; if (night) { B.lights.hemi.intensity = 0.5; B.lights.inner2.intensity = 0; } deskSheet.visible = night; cup.visible = night; cupPencils.forEach((p) => (p.visible = night));
    laptop.visible = night; scrLight.intensity = 0; counterSheet.visible = false; heldSheet.visible = false; mouthPencil.visible = false; phone.g.visible = false;
    flash.visible = false; flashLight.intensity = 0; nib.visible = false; bags.forEach((b) => (b.visible = false)); halves.visible = night;
    B.upChairs.children.forEach((c, i) => (c.visible = night && i > 1));
    otis.g.visible = true; otis.cap.visible = t >= EV.cap && t < EV.mgr; goldCap.visible = t >= EV.mgr; otis.badge.mesh.visible = t >= 8.0;
    if (otis.badge.gold !== (t >= EV.mgr)) { otis.badge.gold = t >= EV.mgr; otis.badge.set('OTIS', otis.badge.gold); }
    B.salad.visible = !['uniform', 'soda', 'damage', 'promo'].includes(C);
    B.setMess(C === 'damage' ? 1 : 0); B.setFlood(C === 'soda' ? K(t, [[15.6, 0], [18.2, 0.14]]) : 0, t);
    B.setEaten(t < 21.8 ? 0 : t < 31.4 ? K(t, [[21.9, 0], [24.4, 1]], (u) => u) : 0);
    B.setPond(C === 'dig' ? K(t, [[EV.dig0, 0], [EV.dig1, 1]], (u) => u) : t >= 48.4 ? 1 : 0, C === 'dig' ? K(t, [[EV.dig1, 0], [EV.fill1, 1]]) : t >= 48.4 ? 1 : 0, null, t);
    B.menuBoard.visible = !ext || C === 'arrive';
    B.hippoLane.visible = t >= EV.sign; B.hippoLane.scale.setScalar(t >= EV.sign ? Math.max(0.01, boing(t, EV.sign, 0.35)) : 1);
    B.setLaneFlood(C === 'flop' ? K(t, [[EV.flop + 0.1, 0], [EV.flop + 1.1, 0.42]]) : 0, t);
    // door frame: pops off and falls into the room at EV.pop; back in place from the next day on (morning)
    const fall = t >= EV.pop && t < 41.2 ? clamp((t - EV.pop) / 0.4) ** 2 : 0;
    B.doorFrame.rotation.x = -1.48 * fall; B.doorFrame.position.z = BD.room.z1 + 0.11 - 0.6 * fall; B.doorFrame.visible = t < 4.6 || t >= 41.2;   // swept up off-camera
    // chairs + table 0 knocked by the charge (until the night clean-up), more tipped in the damage shot
    const T0h = B.tables[0];
    B.chairs.forEach((c) => { c.g.position.set(c.home.x, 0, c.home.z); c.g.rotation.set(0, c.home.ry, 0); });
    T0h.g.position.set(T0h.x, 0, T0h.z); T0h.g.rotation.set(0, 0, 0);
    if (t >= EV.chargeHit - 0.05 && t < 31.4) {
      const u = clamp((t - EV.chargeHit + 0.05) / 0.45);
      T0h.g.position.set(T0h.x - 1.1 * easeIO(u), 0.25 * Math.sin(PI * u), T0h.z + 0.2 * u); T0h.g.rotation.set(0.15 * u, 0, 1.45 * easeIO(u));
      T0h.chairs.forEach((c, i) => { const tt = clamp(t - EV.chargeHit - i * 0.04, 0, 0.9), dir = [[-1.2, 2.4, 1.2], [-1.4, 2.8, -0.9], [-2.4, 3.4, 0.2], [-0.8, 2.0, 0.4]][i];
        const y = Math.max(0, dir[1] * tt - 4.9 * tt * tt); c.g.position.set(c.home.x + dir[0] * tt * 1.4, y, c.home.z + dir[2] * tt); c.g.rotation.set(tt * 5 * (i % 2 ? 1 : -1), c.home.ry + tt * 3, tt * 4 > 1.57 ? 1.57 : tt * 4); });
    }
    if (C === 'charge' && t < EV.chargeHit) { const c = T0h.chairs[3]; c.g.position.set(c.home.x - 0.1, 0, c.home.z + 0.75); }
    if (C === 'damage') [4, 5, 7, 9, 10].forEach((i, k) => { const c = B.chairs[i]; c.g.rotation.set(0, c.home.ry + k, 1.5); c.g.position.y = 0.22; });

    // ---------- Otis
    let ox = 0, oz = 0, ry = 0, oy = 0; const S = { seed: 1 };
    if (C === 'arrive') {
      const w = walkLegs(t, [-2.3, 13.6], [{ t0: 0.15, t1: 2.45, pts: [[0, 8.8]] }, { t0: 2.45, t1: 3.88, pts: [[0, 7.2]] }, { t0: 3.9, t1: 4.4, pts: [[0, 4.3]] }]);
      ox = w.x; oz = w.z; ry = w.head ?? PI; S.walk = t < 2.45 ? 1 : t < 3.88 ? 0.5 : 0; S.run = t >= 3.9 ? 1 : 0; S.dist = w.dist;
      S.squeeze = K(t, [[2.35, 0], [2.8, 1], [3.88, 1], [4.05, 0]]) - 0.15 * Math.max(0, boing(t, 4.05, 0.3) - 1) * 10;
      S.eyes = t < 2.5 ? 'open' : t < 3.9 ? 'closed' : 'wide'; S.ears = t > 2.5 && t < 4.0 ? 1 : 0; S.pitch = t > 2.6 && t < 3.9 ? -0.05 : 0.05;
    } else if (C === 'floor') {
      const w = floorWalk(t); ox = w.x; oz = w.z; ry = PI; S.walk = clamp(w.speed / 0.5); S.dist = w.dist;
      S.pitch = K(t, [[6.7, 0.05], [7.0, -0.32]]); S.eyes = t < 7.0 ? 'open' : 'sad'; S.lids = 0.3; S.lookY = t > 7.0 ? -1 : 0; S.ears = K(t, [[7.25, 0], [7.4, 1]]);
      S.sink = t >= EV.bigCrack ? 0.07 * Math.min(1, boing(t, EV.bigCrack, 0.25)) : 0;
    } else if (C === 'uniform') {
      ox = -2.0; oz = 2.65; ry = PI / 2; S.pitch = 0.08; S.eyes = t < EV.shirtOn ? 'open' : t < EV.rip ? 'closed' : t < EV.cap + 0.2 ? 'wide' : 'happy'; S.ears = t > EV.shirtOn && t < EV.rip ? 1 : 0; S.lookY = t > EV.cap - 0.3 && t < EV.cap + 0.3 ? 1 : 0;
    } else if (C === 'order') {
      ox = 1.25; oz = -2.35; ry = 0; oy = 0.27; S.lean = -0.3; S.pitch = 0.05; S.open = K(t, [[EV.yawn0, 0], [EV.yawn0 + 0.25, 0.12], [EV.yawn0 + 0.4, 0.08], [EV.yawnTop, 1.0], [EV.yawn1 - 0.2, 1.0], [EV.yawn1 + 0.25, 0.0]]);
      S.eyes = t > EV.yawn0 + 0.4 && t < EV.yawn1 ? 'closed' : 'open'; S.ears = K(t, [[EV.yawn0 + 0.4, 0], [EV.yawnTop, 0.7], [EV.yawn1, 0]]);
    } else if (C === 'soda') {
      ox = 3.62; oz = 1.9; ry = PI / 2; S.pitch = K(t, [[14.9, 0], [15.3, 0.32]]); S.eyes = t < 15.5 ? 'open' : 'happy'; S.wet = K(t, [[15.4, 0], [16.2, 1]]); S.wag = t > 15.6 ? 1 : 0; S.open = t > 15.6 ? 0.12 + 0.06 * Math.sin(t * 7) : 0;
    } else if (C === 'charge') {
      const w = chargeWalk(t); ox = w.x; oz = w.z; ry = w.head ?? 0; S.run = clamp(w.speed / 2.5); S.walk = clamp(w.speed / 1.0) * 0.5; S.dist = w.dist; S.ears = 1; S.eyes = t < EV.chargeHit ? 'wide' : 'happy';
      S.lean = t > 20.3 ? -0.12 * clamp(1 - (t - 20.5) / 0.5) : 0.06; S.open = t > EV.chargeHit + 0.3 ? 0.18 : 0.05;
      tray.visible = true; burger.visible = true; plate.visible = true;
    } else if (C === 'salad') {
      const w = walkLegs(t, [0.6, 3.05], [{ t0: 21.8, t1: 24.5, pts: [[1.9, 3.05]] }]); ox = w.x; oz = w.z; ry = PI / 2; S.walk = clamp(w.speed / 0.4); S.dist = w.dist;
      S.pitch = -0.08; S.yaw = -0.45; S.chew = 1; S.open = t > 21.8 && t < 24.5 ? 0.18 + 0.12 * Math.max(0, Math.sin(t * 9)) : 0.05; S.eyes = t > 24.4 ? 'happy' : 'closed';
    } else if (C === 'damage') {
      ox = -2.0; oz = 2.65; ry = PI / 2; S.eyes = 'sad'; S.lids = 0.45; S.ears = 1; S.lookY = 0.6; S.pitch = K(t, [[25.0, -0.12], [28.4, -0.18]]); S.chew = 0.25;
    } else if (C === 'sheet') {
      otis.g.visible = false;
    } else if (C === 'gulp') {
      ox = -0.5; oz = 3.6; ry = PI; S.eyes = 'wide'; S.ears = 1; S.pitch = K(t, [[EV.gulp - 0.1, 0.05], [EV.gulp + 0.12, -0.12], [EV.gulp + 0.4, 0.05]]); S.open = K(t, [[EV.gulp - 0.1, 0], [EV.gulp, 0.08], [EV.gulp + 0.2, 0]]);
    } else if (C === 'pencil' || C === 'photo' || C === 'watch') {
      ox = T0.x; oz = T0.z - 2.25; ry = 0; S.seed = 3;
      if (C === 'pencil') {
        const ph = EV.snaps.findIndex((s) => t < s + 0.5);
        S.pitch = -0.42 + 0.04 * Math.sin(t * 5); S.eyes = EV.snaps.some((s) => t > s - 0.05 && t < s + 0.25) ? 'closed' : 'wide'; S.ears = 0.5;
        S.open = EV.snaps.reduce((o, s) => o + K(t, [[s - 0.45, 0], [s - 0.25, 0.1], [s - 0.02, 0.1], [s, 0]]), 0);
        if (!EV.snaps.some((s) => t >= s && t < s + 0.2)) { otis.update(t, { ...S }); otis.g.position.set(ox, oy, oz); otis.g.rotation.set(0, ry, 0); otis.g.updateMatrixWorld(true); const m = otis.anchors.mouth.getWorldPosition(new THREE.Vector3()); mouthPencil.position.copy(m); mouthPencil.rotation.set(0, 0, PI / 2 + 0.08); mouthPencil.position.add(V3(0, 0.0, -0.08)); mouthPencil.visible = true; }
      } else if (C === 'photo') {
        S.pitch = -0.28; S.eyes = t > EV.flash && t < EV.flash + 0.2 ? 'closed' : 'wide'; S.open = 0.04;
        otis.update(t, { ...S }); otis.g.position.set(ox, oy, oz); otis.g.rotation.set(0, ry, 0); otis.g.updateMatrixWorld(true);
        const m = otis.anchors.mouth.getWorldPosition(new THREE.Vector3()); phone.g.visible = true; phone.g.position.copy(m).add(V3(0.0, 0.08, 0.02)); phone.g.rotation.set(PI / 2, 0, 0, 'YXZ');
        const fk = t >= EV.flash ? Math.exp(-(t - EV.flash) * 9) : 0; flash.visible = fk > 0.01; flash.position.copy(m).add(V3(0, -0.06, 0.12)); flash.scale.setScalar(0.6 * fk + 0.05); flashLight.position.copy(flash.position); flashLight.intensity = 30 * fk;
      } else {
        S.pitch = -0.2; S.eyes = t < EV.happy ? 'wide' : 'happy'; S.wag = t > EV.happy ? 1 : 0; S.ears = t < EV.happy ? 0.3 : 0;
      }
    } else if (C === 'laptop' || C === 'write') {
      otis.g.visible = false;
    } else if (C === 'promo') {
      ox = -2.0; oz = 2.65; ry = PI / 2; S.eyes = t < EV.aplus ? 'wide' : 'happy'; S.wag = t > EV.aplus ? 1 : 0; S.pitch = 0.08 + (t > EV.mgr ? 0.06 * Math.sin((t - EV.mgr) * 9) * Math.exp(-(t - EV.mgr)) : 0);
    } else if (C === 'dig') {
      ox = 13.4; oz = 4.4; ry = faceToward(13.4, 4.4, 18, -2.2); S.eyes = 'happy'; S.wag = 1; S.pitch = 0.1;
    } else if (C === 'lane') {
      ox = 14.65; oz = -1.0; ry = -PI / 2; S.sink = 0.98; S.pitch = 0.45; S.eyes = 'happy'; S.wet = 1; S.open = K(t, [[EV.bags[0] - 0.4, 0.06], [EV.bags[0] - 0.1, 0.2], [EV.bags[0] + 0.1, 0.06], [EV.bags[1] - 0.4, 0.06], [EV.bags[1] - 0.1, 0.2], [EV.bags[1] + 0.1, 0.06]]);
    } else if (C === 'flop') {
      ox = 14.65; oz = -1.0; ry = -PI / 2; S.wet = 1;
      S.sink = K(t, [[52.2, 0.98], [EV.flopUp, 0.2], [EV.flop - 0.35, 0.2], [EV.flop, 0.7], [EV.flop + 1.0, 0.6]]); S.pitch = K(t, [[52.2, 0.45], [EV.flopUp, 0.2]]);
      const roll = K(t, [[EV.flop - 0.4, 0], [EV.flop, 1.75], [EV.flop + 0.6, 2.9]]); otis.g.rotation.z = roll;
      S.eyes = t < EV.flop ? 'wide' : 'happy'; S.open = t > EV.flop + 0.4 ? 0.2 : 0.05; S.wag = t > EV.flop ? 1 : 0;
    }
    if (C !== 'flop') otis.g.rotation.z = 0;
    otis.g.position.set(ox, oy, oz); otis.g.rotation.y = ry; otis.g.rotation.x = 0;
    otis.update(t, S);
    // the shirt: held out in front of his nose, slid over the snout, stretched, ripped
    if (C === 'uniform' && t < EV.rip) {
      shirt.visible = true; const on = K(t, [[8.5, 0], [EV.shirtOn, 0], [9.8, 1]]), st = K(t, [[EV.shirtOn, 0], [10.15, 1]]);
      shirt.position.set(0, 0.08, lerp(1.75, 0.82, on)); const r = lerp(0.24, 0.6, st); shirt.scale.set(r, r * lerp(1.1, 0.62, st), 1);
    }

    // ---------- people
    if (C === 'arrive') {
      stand(kai, -2.2, 4.7, PI * 0.9, { armA: A(-0.6, 0.6, -1.2, 0.4), headYaw: 0.3, mouth: 'o' }); kai.root.visible = true;   // seen through the window
    }
    if (C === 'floor') {
      seat(diners[0], -3.7, 3.18, PI, { headYaw: -0.4, mouth: t > 5.0 ? 'o' : 'smile' }).visible; diners[0].root.visible = true;
      seat(diners[1], -3.7, 5.38, PI, { headYaw: -0.6, mouth: t > EV.bigCrack ? 'o' : 'flat', glasses: true }); diners[1].root.visible = true;
      seat(diners[2], -1.9, 5.38, PI, { headYaw: -0.2, mouth: t > 5.5 ? 'o' : 'smile', armB: t > EV.bigCrack ? A(-1.7, 0.4, -1.9, -0.6) : A(-0.5, 0.05, -1.3, -0.4) }); diners[2].root.visible = true;
      stand(kai, -1.6, -0.4, 0, { mouth: 'o', armA: SHOCK_A, armB: SHOCK_B }); kai.root.visible = true;
    }
    if (C === 'uniform' || C === 'damage' || C === 'promo') {
      const dx = 1.0, dz = 2.65;
      if (C === 'uniform') {
        const pull = K(t, [[8.5, 0], [EV.shirtOn, 0], [9.8, 1]]);
        stand(denise, dx - 0.35 * pull, dz, -PI / 2, { armA: t < EV.rip ? (pull > 0.1 ? PULL_A : HOLD_A) : t < EV.cap ? SHOCK_A : A(-2.2, 0.3, -0.8, 0.3), armB: t < EV.rip ? (pull > 0.1 ? PULL_B : HOLD_B) : t < EV.cap ? SHOCK_B : REST, lean: 0.12 * pull, glasses: true, mouth: t > EV.rip && t < EV.cap ? 'o' : 'flat', eyes: blink(t, 2) });
      } else if (C === 'damage') {
        stand(denise, dx, dz, -PI / 2, { armA: CLIP_A, armB: PEN_B, glasses: true, mouth: 'flat', headPitch: -0.08, footFwd: 0.04 * Math.sin(t * 9), eyes: blink(t, 2) });
        clip.visible = true; const h = handW(denise, -1); clip.position.copy(h).add(V3(-0.03, 0.06, 0.04)); clip.rotation.set(-0.5, -PI / 2, 0);
      } else {
        const up = t > EV.aplus - 0.6;
        stand(denise, dx, dz, -PI / 2 + 0.55, { armA: up ? A(-1.35, 0.05, -0.9, 0.5) : HOLD_A, armB: up ? A(-1.35, 0.05, -0.9, -0.5) : HOLD_B, glasses: true, mouth: t > EV.aplus - 0.3 ? 'o' : 'flat', headPitch: t < EV.aplus - 0.3 ? 0.25 : -0.05, eyes: blink(t, 2) });
        heldSheet.visible = true; const a = handW(denise, -1), b = handW(denise, 1); heldSheet.position.copy(a).add(b).multiplyScalar(0.5).add(V3(0, 0.16, 0)); heldSheet.rotation.set(-0.1, -PI / 2 + 0.55 + (up ? 0.9 : 0), 0);
        aplus.visible = t > EV.aplus; aplus.scale.setScalar(t > EV.aplus ? Math.max(0.01, boing(t, EV.aplus, 0.25)) : 1);
        const [ca, cb] = CLAP(t, 0); stand(kai, 2.4, 0.0, -PI * 0.85, { armA: t > EV.mgr ? ca : REST, armB: t > EV.mgr ? cb : REST, mouth: t > EV.mgr ? 'smile' : 'o' }); kai.root.visible = true;
        const [ca2, cb2] = CLAP(t, 1.3); stand(crew[2], -0.8, 0.1, PI * 0.1, { armA: t > EV.mgr ? ca2 : REST, armB: t > EV.mgr ? cb2 : REST, mouth: 'smile' }); crew[2].root.visible = true;
      }
      denise.root.visible = true;
    }
    if (C === 'order') {
      const yk = K(t, [[EV.yawn0 + 0.4, 0], [EV.yawnTop, 1], [EV.yawn1, 1], [EV.yawn1 + 0.4, 0.3]]);
      stand(walt, 1.75, 1.5, PI - 0.25, { lean: -0.25 * yk, mouth: t > EV.yawn0 + 0.6 ? 'o' : 'smile', armA: yk > 0.3 ? SHOCK_A : A(0.05, 0.1, -0.2, 0, 1), armB: yk > 0.3 ? SHOCK_B : A(-0.6, 0.05, -1.5, -0.6), headPitch: -0.1 * yk });
      walt.root.visible = true; walt.head.hair.rotation.x = -0.4 * yk; walt.head.hair.position.z = -0.03 * yk;
      stand(kai, -0.35, -0.4, 0.2, { mouth: t > EV.yawnTop ? 'o' : 'smile', armA: t > EV.yawnTop ? SHOCK_A : REST, armB: t > EV.yawnTop ? SHOCK_B : REST }); kai.root.visible = true;
    } else walt.head.hair.rotation.x = 0;
    if (C === 'soda') { stand(pam, 4.4, 5.2, PI * 0.85, { mouth: 'o', armA: SHOCK_A, armB: A(-0.6, 0.1, -1.3, -0.5) }); pam.root.visible = true; }
    if (C === 'charge') {
      seat(diners[1], -3.7, 5.38, PI, { mouth: t > EV.chargeHit ? 'o' : 'flat', glasses: true, headYaw: 0.3 }); diners[1].root.visible = true;
      seat(diners[3], -6.0, 2.55, PI, { mouth: t > EV.chargeHit ? 'o' : 'smile', headYaw: 0.8 }); diners[3].root.visible = true;
      // the burger leaves the tray at the stop and lands on the plate in front of diner 1
      otis.g.updateMatrixWorld(true); const from = otis.anchors.back.getWorldPosition(new THREE.Vector3()).add(V3(0, 0.05, 0)), to = V3(-3.7, BD.tableTop + 0.045, 4.92);
      const u = clamp((t - (EV.burgerLand - 0.75)) / 0.75);
      if (u <= 0) { burger.position.copy(from); } else { burger.position.lerpVectors(from, to, u); burger.position.y += Math.sin(PI * u) * 1.4; burger.rotation.set(u * 6.3, 0, 0); }
      if (u >= 1) burger.rotation.set(0, 0, 0);
    }
    if (C === 'salad') {
      stand(pam, 2.75, 4.98, PI, { mouth: t > 23.0 ? 'o' : 'smile', armA: TRAY_A, armB: TONG_B, headPitch: 0.25, eyes: blink(t, 4) }); pam.root.visible = true;
      plate.visible = true; const h = handW(pam, -1); plate.position.copy(h).add(V3(0, 0.03, 0.06)); plate.rotation.set(0, 0, 0);
      // salad pieces stream into his mouth
      otis.g.updateMatrixWorld(true); const m = otis.anchors.mouth.getWorldPosition(new THREE.Vector3());
      for (let i = 0; i < saladN; i++) {
        const per = 0.42, ph = (i / saladN) * per, age = ((t - 21.9 - ph) % per + per) % per, bin = B.bins[i % 6].g.getWorldPosition(_p).clone(), u = age / per;
        if (t < 21.9 || t > 24.4) { saladIM.setMatrixAt(i, ZERO); continue; }
        const p = bin.lerp(m, u); p.y += Math.sin(PI * u) * 0.35; _q.setFromEuler(_e.set(t * 7 + i, i, t * 5)); _m.compose(p, _q, _s.setScalar(1)); saladIM.setMatrixAt(i, _m);
      }
      saladIM.instanceMatrix.needsUpdate = true; saladIM.visible = true;
    } else saladIM.visible = false;
    if (C === 'sheet') {
      const land = K(t, [[28.45, 0], [EV.slap, 1]]);
      stand(denise, -0.5, -0.35, 0, { lean: 0.35, armB: land < 1 ? A(-1.5, 0.05, -0.2, -0.2) : SLAP_B, armA: REST, glasses: true, mouth: 'flat', headPitch: 0.35, eyes: blink(t, 2) }); denise.root.visible = true;
      counterSheet.visible = true; counterSheet.position.set(-0.5 + 0.04 * (1 - land), BD.counter.h + 0.034 + 0.25 * (1 - land) * (1 - land), 0.58 - 0.45 * (1 - land)); counterSheet.rotation.set(-PI / 2 + 0.6 * (1 - land), 0, 0.05);
    }
    if (C === 'gulp') { stand(denise, -0.5, -0.4, 0, { armA: CROSS_A, armB: CROSS_B, glasses: true, mouth: 'flat', eyes: blink(t, 2) }); denise.root.visible = true; counterSheet.visible = true; counterSheet.position.set(-0.5, BD.counter.h + 0.034, 0.58); counterSheet.rotation.set(-PI / 2, 0, 0.05); }
    if (C === 'dig' || C === 'lane' || C === 'flop') {
      if (C === 'dig') crew.forEach((r, i) => {
        const a = 0.9 + i * 2.1, jit = Math.floor(t * 6 + i) % 2, rr = BD.pond.r * K(t, [[EV.dig0, 0.25], [EV.dig1, 1.05]]);
        const x = BD.pond.x + Math.cos(a) * rr, z = BD.pond.z + Math.sin(a) * rr, k = jit ? 1 : 0;
        if (t < EV.dig1 + 0.4) { stand(r, x, z, faceToward(x, z, BD.pond.x, BD.pond.z), { lean: 0.35 * k, armA: SHOVEL_A(k), armB: SHOVEL_B(k), mouth: 'smile' }); r.root.visible = true;
          const sh = shovels[i]; sh.visible = true; const h = handW(r, 1); sh.position.copy(h); sh.rotation.set(0.4 + 0.6 * k, faceToward(x, z, BD.pond.x, BD.pond.z), 0); }
        else { const [ca, cb] = CLAP(t, i); stand(r, x + Math.cos(a) * 1.5, z + Math.sin(a) * 1.5, faceToward(x, z, BD.pond.x, BD.pond.z), { armA: ca, armB: cb, mouth: 'smile' }); r.root.visible = true; }
      });
      // the queue: car 0 at the hippo, then rolls away; the rest roll up
      const slots = [-1.0, 4.4, 9.8, 15.2, 20.6];
      queue.forEach((q, i) => {
        if (C === 'dig') return;
        let z = slots[Math.min(4, i)];
        const shift = C === 'lane' ? K(t, [[EV.carGo, 0], [EV.carGo + 1.4, 1]]) : 1;
        z = i === 0 ? lerp(-1.0, -16, C === 'lane' ? clamp((t - EV.carGo) / 1.6) ** 2 : 1) : lerp(slots[i], slots[i - 1], shift);
        q.car.g.visible = true; q.car.g.position.set(BD.lane.x, 0, z); q.car.g.rotation.set(0, PI, 0);
        if (C === 'flop') { const fl = K(t, [[EV.flop + 0.3, 0], [EV.flop + 1.2, 1]]); q.car.g.position.y = 0.22 * fl + 0.05 * fl * Math.sin(t * 2.2 + i); q.car.g.rotation.z = 0.06 * fl * Math.sin(t * 1.7 + i * 2); q.car.g.rotation.x = 0.04 * fl * Math.sin(t * 1.3 + i); }
      });
      if (C === 'lane') {
        otis.g.updateMatrixWorld(true); const m = otis.anchors.mouth.getWorldPosition(new THREE.Vector3());
        EV.bags.forEach((tb, k) => { const b = bags[k]; const car = queue[k === 0 ? 0 : 1].car.g; const win = V3(BD.lane.x + 0.85, 1.15, car.position.z - 0.2); const u = clamp((t - tb) / 0.45);
          if (t < tb - 0.6 || t > tb + 1.2) return; b.visible = u < 1; if (u <= 0) b.position.copy(m); else { b.position.lerpVectors(m, win, u); b.position.y += Math.sin(PI * u) * 0.5; } });
      }
    }

    // ---------- night props
    if (night) {
      const nsnap = EV.snaps.filter((s) => t > s).length;
      for (let i = 0; i < halvesN; i++) {
        if (i >= 2 + nsnap * 3) { halves.setMatrixAt(i, ZERO); continue; }
        const r = rng(200 + i); _p.set(T0.x - 0.42 + r() * 0.18, BD.tableTop + 0.033, T0.z - 0.42 + r() * 0.32); _q.setFromEuler(_e.set(PI / 2, r() * 6, 0)); _m.compose(_p, _q, _s.setScalar(1)); halves.setMatrixAt(i, _m);
      }
      halves.instanceMatrix.needsUpdate = true;
      cupPencils.forEach((p, i) => (p.visible = i >= Math.min(3, nsnap)));
      // screen + sheet writing
      const mode = t < EV.scan0 ? 'home' : t < EV.solve0 ? 'scan' : 'solve';
      const k = mode === 'scan' ? (t - EV.scan0) / (EV.solve0 - EV.scan0) : mode === 'solve' ? clamp((t - EV.solve0) / (EV.solve1 - EV.solve0)) : 0;
      screen.draw({ mode, k: clamp(k) }); scrLight.intensity = C === 'laptop' ? 0.8 : 0.35;
      lid.rotation.x = t < 34.75 ? 1.5 : -0.32 + 1.82 * (1 - clamp((t - 34.75) / 0.3)) ** 2;
    }
    const wp = t < EV.write0 ? 0 : t < 41.2 ? sheet.total * clamp((t - EV.write0) / (EV.write1 - EV.write0)) : sheet.total;
    const tip = sheet.draw(wp);
    if (C === 'write' && t > EV.write0 - 0.2 && t < EV.write1 + 0.3) {
      nib.visible = true; const lp = V3((tip[0] / 1024 - 0.5) * SW, (0.5 - tip[1] / 1325) * SH, 0.012); deskSheet.updateMatrixWorld(true); const wpos = deskSheet.localToWorld(lp); nib.position.copy(wpos).add(V3(0, 0.0, 0));
    }
    if (C === 'watch') { nib.visible = t < EV.write1 + 0.3; const lp = V3((tip[0] / 1024 - 0.5) * SW, (0.5 - tip[1] / 1325) * SH, 0.012); deskSheet.updateMatrixWorld(true); nib.position.copy(deskSheet.localToWorld(lp)); }

    // ---------- FX
    for (const c of cracks) { const u = (t - c.te) / 0.14, on = t >= c.te && t < 31.4 && C !== 'promo'; c.m.visible = on; if (on) c.m.scale.setScalar(c.r * Math.min(1, 0.4 + 0.6 * clamp(u))); }
    for (const p of puffs) { const age = t - p.te; const on = age >= 0 && age < p.life; p.s.visible = on; if (!on) continue; const u = age / p.life; p.s.position.set(p.o.x + p.d.x * u, p.o.y + p.d.y * u, p.o.z + p.d.z * u); p.s.scale.setScalar(p.size * (0.5 + u)); p.s.material.opacity = 0.75 * (1 - u) * clamp(age / 0.08); }
    otis.g.updateMatrixWorld(true);
    for (const b of BITS) {
      const age0 = t - b.t0; let o = b.o;
      if (b.anchor === 'shirt') { o = otis.headG.localToWorld(V3(0, 0.08, 0.8)).toArray(); }
      if (b.anchor === 'mouth') { o = otis.anchors.mouth.getWorldPosition(new THREE.Vector3()).toArray(); }
      for (const q of b.p) {
        const age = age0 - q.dt, M = b.sphere ? dropIM : bitsIM;
        if (age < 0 || age > b.life || !o) { M.setMatrixAt(q.idx, ZERO); continue; }
        const g = b.g ?? 9.8, dr = b.drag ? Math.exp(-age * b.drag) : 1;
        const vx = b.v[0] + q.dv[0], vy = b.v[1] + q.dv[1], vz = b.v[2] + q.dv[2];
        const tt = b.drag ? (1 - dr) / b.drag : age;
        let y = o[1] + vy * tt - 0.5 * g * age * age; const fl = b.floor ?? 0.01; if (y < fl) y = fl;
        _p.set(o[0] + vx * tt, y, o[2] + vz * tt); _q.setFromEuler(_e.set(q.spin[0] * age, q.spin[1] * age, q.spin[2] * age));
        const sc = q.s * (b.sphere ? 1 - 0.6 * clamp(age / b.life) : 1);
        _s.set(sc * b.shape[0], sc * b.shape[1], sc * b.shape[2]); _m.compose(_p, _q, _s); M.setMatrixAt(q.idx, _m);
      }
    }
    bitsIM.instanceMatrix.needsUpdate = true; dropIM.instanceMatrix.needsUpdate = true;
    // soda spray: six looping jets from the nozzles onto his head
    const sprayOn = C === 'soda' && t > EV.spray0;
    spray.visible = sprayOn;
    if (sprayOn) {
      for (let i = 0; i < sprayN; i++) {
        const n = i % 6, per = 1.0, ph = ((Math.floor(i / 6) / (sprayN / 6)) * per), age = ((t - EV.spray0 - ph) % per + per) % per, o = nozW[n];
        const r = rng(300 + n), vx = -0.9 - r() * 0.5 + (rng(900 + i)() - 0.5) * 0.3, vy = 3.4 + r() * 0.8 + (rng(800 + i)() - 0.5) * 0.4, vz = (r() - 0.5) * 0.9 + (rng(700 + i)() - 0.5) * 0.25;
        let y = o.y + 0.05 + vy * age - 4.9 * age * age; if (y < 0.02) y = 0.02;
        _p.set(o.x + vx * age, y, o.z + vz * age); _m.compose(_p, _q.identity(), _s.setScalar(0.9 + 0.5 * rng(500 + i)())); spray.setMatrixAt(i, _m);
      }
      spray.instanceMatrix.needsUpdate = true;
    }

    // ---------- camera
    const c = CAMS[C]; let [pos, aim] = camAt(c, t); const [jx, jy] = jolt(t);
    pos = [pos[0] + jx, pos[1] + jy, pos[2]];
    studio.setCamera(pos, aim, c.fov, t, ext ? 0.01 : 0.006);
    hud.update(t);
    if (story.debugView) story.debugView = { center: [aim[0], 0, aim[2]], height: 10 };
  }
  return { update };
}
