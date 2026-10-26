// VIDEO 015 — "What if every human grew a tail that wags when they lie?"  (tone: funny / unhinged montage, @ed._.studios)
// 70 s, 10 beats, NINE sets parked at offsets in one scene (one visible per shot). NEW: engine/sets/restaurant.js, carlot.js,
// casino.js, courtroom.js and addTail() in engine/rig.js (a bushy chain of fur segments on the pelvis: idles with a lazy sway,
// whips side to side on a lie, can spin into a helicopter rotor). Every human in every shot has one, so something moves in
// every frame; the gag of each beat is a lie + the tail's big physical consequence.
// Sources (checked Oct 2026):
//   1.65 lies per person per day on average; ~60% told no lies that day; half of all lies come from ~5% of people
//     — Serota, Levine & Boster 2010, Human Communication Research 36(1) (national survey of 1,000 U.S. adults)
//   60% of strangers lied at least once in a 10-minute first conversation (~3 lies) — Feldman, Forrest & Happ 2002,
//     Basic and Applied Social Psychology 24(2)
//   81% of job-interview applicants lied, 2.19 lies on average — Weiss & Feldman 2006, J. of Applied Social Psychology 36
//   ~90% of children older than 43 months who peeked denied it — Evans & Lee 2013, Developmental Psychology 49(10)
//   53% of Americans got an unwanted gift; $9.1 billion a year spent on them (2023) — finder.com unwanted-gifts survey
//   Nevada casinos won a record $15.6 billion in 2024 — Nevada Gaming Control Board annual report (via casino.org)
//   195 countries (193 UN members + 2 observer states) — United Nations
//   U.S. state courts: 64.6 million incoming cases (2022) — NCSC Court Statistics Project, 2022 Caseload Highlights
//   HUD number "TAILS WAGGING RIGHT NOW" = 1.65 lies × 8.2 B people ≈ 13.5 B lies/day ≈ 156,000 lies/s × ~3 s per wag ≈ 470,000
//     (the per-beat swings after that are the premise, not data).
//
// Shot list (seconds)                       | set        | what happens
//  0.0–10.6  open    MONDAY 9:00 AM         | street     | commuters walk the sidewalk; at 5.2 EVERY human sprouts a tail (poof + boing), looks back at it,
//                                           |            | two chase their tails; Gary's boss calls: "Stuck in traffic!" — his tail goes berserk; everyone turns and stares
// 10.6–16.2  cookie  +10 MINUTES            | kitchen    | a kid with crumbs on his face: "I didn't eat the cookie" — his tail sweeps the (empty) cookie jar off the counter: smash;
//                                           |            | Mom, arms crossed: "I'm not mad" — her tail wags so hard a chair goes flying
// 16.2–21.8  hire    +2 HOURS               | office     | "My biggest weakness? I work too hard." — his tail spins him and the swivel chair three full turns, papers fly
// 21.8–27.4  date    +10 HOURS              | restaurant | a short guy: "Yes, I'm six feet tall." — his tail kicks the chair out from under him; pull back: every diner's tail wags
// 27.4–33.0  bday    +1 DAY                 | suburb     | Gary holds up grandma's hideous sweater: "We LOVE it!" — every tail wags, the balloons pop one by one (grandma's tail: still)
// 33.0–38.6  lot     +2 DAYS                | carlot     | "One owner. Never been in a crash." — the bumper falls off; the salesman's tail spins into a rotor and he lifts off
// 38.6–44.2  poker   +3 DAYS                | casino     | "All in." — all six tails wag (everyone's bluffing), the table shakes, the chips erupt like a fountain
// 44.2–49.8  press   +4 DAYS                | podium     | the President: "I'll be brief." — his tail knocks both flags over; he tries to speak 3×, the tail twitches, he gives up
// 49.8–55.8  court   +2 WEEKS               | courtroom  | "Did you eat Dave's lunch?" "No." — Gary's tail wags; the gavel slams three times
// 55.8–70.0  end     +1 YEAR                | suburb     | golden hour, Gary + his daughter on the porch: "I love you, Dad." "Love you more." — both tails perfectly still;
//                                           |            | the dog runs up, tail going like crazy. End card at 65.2
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, addTail, HIP_H } from '@engine/rig.js';
import { makeDog, makePhone } from '@engine/props.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildRestaurant, DIMS as RD } from '@engine/sets/restaurant.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildCarLot, DIMS as LD } from '@engine/sets/carlot.js';
import { buildCasino, DIMS as CD } from '@engine/sets/casino.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildCourtroom, DIMS as JD } from '@engine/sets/courtroom.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const KS = 0.62;               // kid scale
const SIT = HIP_H - 0.17;      // pelvis-bottom offset (local units): sitting root = seat − s·SIT
const M1 = 5.2;                // the sprout
const OFF = { street: [0, 0, 0], kit: [2000, 0, 0], office: [4000, 0, 0], rest: [6000, 0, 0], sub: [8000, 0, 0], lot: [10000, 0, 0],
  casino: [12000, 0, 0], press: [14000, 0, 0], court: [16000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 10.6, cam: 'open', set: 'street' },
  { t0: 10.6, t1: 16.2, cam: 'cookie', set: 'kit' },
  { t0: 16.2, t1: 21.8, cam: 'hire', set: 'office' },
  { t0: 21.8, t1: 27.4, cam: 'date', set: 'rest' },
  { t0: 27.4, t1: 33.0, cam: 'bday', set: 'sub' },
  { t0: 33.0, t1: 38.6, cam: 'lot', set: 'lot' },
  { t0: 38.6, t1: 44.2, cam: 'poker', set: 'casino' },
  { t0: 44.2, t1: 49.8, cam: 'press', set: 'press' },
  { t0: 49.8, t1: 52.3, cam: 'court', set: 'court' },
  { t0: 52.3, t1: 55.8, cam: 'court2', set: 'court' },
  { t0: 55.8, t1: 70.0, cam: 'end', set: 'sub' },
];
// camera coords are LOCAL to the shot's set (two keys, eased); `y`/`ay` = height keyframes; `pk`/`ak` = full keyframed paths
export const CAMS = {
  open:   { p: [[0, 1.32, 4.4], [0, 1.3, 4.4]], a: [[0, 1.0, -1.1], [0, 1.0, -1.1]], fov: 48, amp: 0.004 },   // tracks Gary along x (see update)
  cookie: { p: [[-0.78, 1.25, 1.3], [-0.72, 1.17, 0.9]], a: [[-0.72, 0.9, -1.6], [-0.7, 0.88, -1.6]], fov: 58, amp: 0.004 },
  hire:   { p: [[1.55, 1.35, -2.3], [1.35, 1.3, -2.25]], a: [[0.0, 0.92, -0.2], [0.0, 0.92, -0.2]], fov: 54, amp: 0.004 },   // from behind HR's shoulder: the candidate faces us
  date:   { pk: [[21.8, [0.35, 2.05, 3.45]], [25.4, [0.25, 1.85, 3.0]], [26.9, [0.0, 2.8, 3.45]]], ak: [[21.8, [-0.05, 0.95, -1.0]], [25.4, [0.0, 0.92, -0.6]], [26.9, [0.0, 0.55, -1.3]]], fov: 60, amp: 0.004 },
  bday:   { p: [[1.3, 1.47, -1.2], [1.25, 1.42, -1.65]], a: [[1.0, 1.18, -5.6], [1.0, 1.18, -5.6]], fov: 58, amp: 0.004 },
  lot:    { p: [[0.2, 1.4, 5.6], [0.15, 1.45, 5.2]], a: [[0.05, 1.25, -0.5], [0.05, 1.25, -0.5]], fov: 52, amp: 0.004, ay: [[33, 1.25], [37.0, 1.3], [38.5, 2.45]] },
  poker:  { p: [[4.45, 3.2, 0.0], [4.15, 3.0, 0.0]], a: [[-0.55, 0.55, 0.0], [-0.55, 0.6, 0.0]], fov: 60, amp: 0.004 },   // down the long axis of the table
  press:  { p: [[2.65, 1.82, -1.95], [2.45, 1.8, -2.05]], a: [[0.4, 1.8, -3.1], [0.4, 1.8, -3.1]], fov: 50, amp: 0.004 },   // 3/4 side: his face, his tail, the flags
  court:  { p: [[-2.2, 2.45, 2.4], [-2.0, 2.35, 2.1]], a: [[-0.62, 1.3, -2.0], [-0.62, 1.3, -2.0]], fov: 56, amp: 0.004 },
  court2: { p: [[0.95, 2.78, -4.3], [0.85, 2.68, -4.15]], a: [[-1.2, 1.3, 0.4], [-1.25, 1.32, 0.4]], fov: 50, amp: 0.004 },   // reverse: over the bench onto Gary + the gallery
  end:    { p: [[15.9, 1.15, -3.6], [15.6, 1.08, -4.0]], a: [[13.95, 0.85, -6.6], [13.95, 0.82, -6.6]], fov: 50, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const PHONE_A = A(-1.05, 0.5, -2.55, 0.35);                                              // phone to the left ear
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);     // arms crossed
const SHOCK_A = A(-1.0, 0.3, -2.3, 0.7), SHOCK_B = A(-1.0, 0.3, -2.3, -0.7);             // hands to cheeks
const HOLD_A = A(-1.35, 0.32, -0.7, 0.35), HOLD_B = A(-1.35, 0.32, -0.7, -0.35);         // holding something up in front
const LAP_A = A(-0.55, 0.1, -1.0, 0.4), LAP_B = A(-0.55, 0.1, -1.0, -0.4);               // hands on the lap / table
const CARD_A = A(-0.95, 0.12, -1.35, 0.6), CARD_B = A(-0.95, 0.12, -1.35, -0.6);         // holding cards
const TALK_B = A(-0.85, 0.35, -1.15, -0.35), TALK_A = A(-0.85, 0.35, -1.15, 0.35);
const POINT_B = A(-1.6, 0.12, -0.08, 0);
const FACE_B = A(-1.2, 0.15, -2.35, -0.6);                                                // facepalm
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const OUT_A = A(-0.4, 1.2, -0.3, 0), OUT_B = A(-0.4, 1.2, -0.3, 0);                      // arms out (flailing / balance)
const HUG_A = A(-0.75, 0.55, -1.5, 0.9), HUG_B = A(-0.75, 0.55, -1.5, -0.9);              // arm around someone beside you
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 1.5) * Math.exp(-u * 3.2) * (1 - u));   // 0→1 with a springy overshoot
const ease = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const SUITS = [0x2f3a4a, 0x4a4f57, 0x6a6f78, 0x2a2a2e, 0x34466a, 0x5a4a3e];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be, 0xb5562e];
const FURS = [0x8a5a32, 0xc98a4a, 0x3a2a22, 0xe0c08a, 0x6a6a6e, 0xb5562e];   // tail colors for bald people
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const TIES = [0xc0392b, 0x2f6aa8, 0xf2b632, 0x58b368, 0x8e44ad];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  street.root.children.forEach((o) => { if (o.isMesh && o.position.z > -1.0 && o.position.z < 0.4 && o.position.y > 0.5 && o.position.x > -12 && o.position.x < 14) o.visible = false; });   // lamp posts out of the tracking shot
  street.trees.forEach((tr) => { if (tr.t.position.z < 0 && tr.t.position.x > -12 && tr.t.position.x < 14) tr.t.visible = false; });
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(9, 10);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const rest = buildRestaurant(studio, {}); rest.root.position.set(...OFF.rest);
  const sub = buildSuburb(studio, {}); sub.root.position.set(...OFF.sub);
  const lot = buildCarLot(studio, {}); lot.root.position.set(...OFF.lot);
  const casino = buildCasino(studio, {}); casino.root.position.set(...OFF.casino);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const court = buildCourtroom(studio, {}); court.root.position.set(...OFF.court);
  const ROOTS = { street: street.root, kit: kit.root, office: office.root, rest: rest.root, sub: sub.root, lot: lot.root, casino: casino.root, press: press.root, court: court.root };
  const FOGS = { street: streetFog, sub: sub.fog, lot: lot.fog, kit: null, office: null, rest: null, casino: null, press: null, court: null };
  const FAR = { street: 400, sub: 400, lot: 330, kit: 40, office: 60, rest: 40, casino: 40, press: 60, court: 50 };
  const guestChair = office.root.children.find((c) => c.isGroup && Math.abs(c.position.z - OD.guest[1]) < 0.01 && Math.abs(c.position.x - OD.guest[0]) < 0.01);
  if (guestChair) guestChair.rotation.order = 'YXZ';

  // ---------------------------------------------------------------- cast (every human gets a tail)
  const R = rng(15);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  let tailSeed = 1;
  const person = (o, tailCol, tailO = {}) => {
    const p = makePerson(o); scene.add(p.root); all.push(p);
    addTail(p, { color: tailCol ?? (o.hairStyle === 'none' ? pick(FURS) : o.hair), seed: tailSeed++, ...tailO });
    return p;
  };
  const withTie = (p, c) => { const tie = mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(c, 0.5), p.spine, 0, 0.42, 0.135); tie.rotation.x = -0.12; return p; };
  const crowd = Array.from({ length: 24 }, (_, i) => {
    const suit = i % 3 === 1, style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: suit ? pick(SUITS) : pick(CASUAL), collar: suit ? 0xf4f4f2 : undefined, pants: pick(PANTS),
      hair: pick(HAIRS), hairStyle: style, glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.2 ? pick(HAIRS.slice(0, 3)) : null });
    if (suit) withTie(p, pick(TIES));
    p.seed = R(); return p;
  });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 }, 0xa0663a);
  const kid = person({ skin: 0xf1c3a1, top: 0xf2b632, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'messy', headR: 0.175 }, 0x8a5a32, { len: 0.95, r: 0.13 });
  for (const [x, y] of [[-0.07, -0.06], [0.06, -0.075], [0.09, -0.04], [-0.04, -0.09]]) mk(new THREE.SphereGeometry(0.012, 6, 5), mat(0x4a2a14, 0.8), kid.head.g, x, y, 0.162);   // chocolate crumbs
  const mom = person({ skin: 0xe2ad8c, top: 0x6fa84f, pants: 0x45607a, hair: 0x9a6a3a, hairStyle: 'bob' });
  const hr = person({ skin: 0x9a6447, top: 0x8f6fb8, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const cand = withTie(person({ skin: 0xf3d0b5, top: 0x34466a, collar: 0xf4f4f2, pants: 0x34466a, hair: 0xb5562e, hairStyle: 'messy' }), 0xc0392b);
  const dateM = person({ skin: 0xc98e6a, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const dateW = person({ skin: 0xf1c3a1, top: 0xd2283f, pants: 0xb5222f, hair: 0x5a3a24, hairStyle: 'bob' });
  const grandma = person({ skin: 0xf3d0b5, top: 0xb8a6c9, collar: 0xf4f4f2, pants: 0x6a6f78, hair: 0xe8e6e2, hairStyle: 'bob', glasses: true }, 0xe8e6e2);
  const sales = withTie(person({ skin: 0xe2ad8c, top: 0xe0a83a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a }), 0xc0392b);
  const dealer = person({ skin: 0xd9a37f, top: 0x1a1a1a, collar: 0xf4f4f2, pants: 0x1a1a1a, hair: 0x2a1d16, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.07, 0.04, 0.02), mat(0xc0392b, 0.5), dealer.spine, 0, 0.5, 0.14);   // bow tie
  const prez = withTie(person({ skin: 0xf0c8a8, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0xc9c4be, hairStyle: 'short' }, 0x9a6a3a), 0xc0392b);
  const judge = person({ skin: 0x6e4430, top: 0x161616, collar: 0xf4f4f2, pants: 0x161616, hair: 0xc9c4be, hairStyle: 'short', glasses: true });
  const lawyer = withTie(person({ skin: 0xf1c3a1, top: 0x4a4f57, collar: 0xf4f4f2, pants: 0x4a4f57, hair: 0xd9b46a, hairStyle: 'bob' }), 0x2f6aa8);
  const pros = withTie(person({ skin: 0xc98e6a, top: 0x2a2a2e, collar: 0xf4f4f2, pants: 0x2a2a2e, hair: 0x1a1a1a, hairStyle: 'short', glasses: true }), 0xf2b632);
  const daughter = person({ skin: 0xf1c3a1, top: 0xe58fa6, pants: 0x8f6fb8, hair: 0xd9b46a, hairStyle: 'bob', headR: 0.175 }, 0xd9b46a, { len: 0.95, r: 0.13 });
  const dog = makeDog(); scene.add(dog.g); dog.g.scale.setScalar(1.1);
  dog.g.traverse((o) => { if (o.isGroup && o !== dog.g && Math.abs(o.position.z + 0.24) < 0.01 && Math.abs(o.position.y - 0.33) < 0.01) o.scale.setScalar(1.7); });   // a bigger, readable dog tail
  const puffs = makeSpritePool(scene, 60, 'smoke');
  const WHITE = new THREE.Color(0xffffff), DUST = new THREE.Color(0xd8cdb8), CRUMB = new THREE.Color(0xb88a5a);

  // phones (Gary)
  const phone = makePhone(); gary.arms.find((a) => a.s === -1).hand.add(phone.g); phone.g.position.set(0, -0.04, 0.03); phone.g.rotation.set(PI / 2, 0, 0); phone.g.visible = false;

  // ---------------------------------------------------------------- props per beat
  // kitchen: the cookie jar (empty!) on the counter + a chair for Mom's tail to launch
  const jar = new THREE.Group(); kit.root.add(jar);
  mk(new THREE.CylinderGeometry(0.11, 0.1, 0.24, 18), new THREE.MeshStandardMaterial({ color: 0xdfeef6, roughness: 0.08, transparent: true, opacity: 0.5 }), jar, 0, 0.12, 0);
  mk(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 18), mat(0xd2483f, 0.5), jar, 0, 0.265, 0); mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0xd2483f, 0.5), jar, 0, 0.3, 0);
  const jarLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.07), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(128, 56, (g, w, h) => { g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a3a1a'; g.font = 'bold 26px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COOKIES', w / 2, h / 2 + 2); }) })); jarLabel.position.set(0, 0.12, 0.103); jar.add(jarLabel);
  for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.012, 6, 5), mat(0x7a4a24, 0.8), jar, (k - 1.5) * 0.03, 0.01, 0.02);   // crumbs only
  const shards = Array.from({ length: 6 }, (_, k) => { const m = mk(new THREE.BoxGeometry(0.07, 0.09, 0.012), new THREE.MeshStandardMaterial({ color: 0xdfeef6, roughness: 0.1, transparent: true, opacity: 0.6 }), kit.root, 0, 0, 0); m.visible = false; return m; });
  const JAR0 = [-0.8, 0.87, -2.2];
  const mChair = kit.chairs[2]; mChair.rotation.order = 'YXZ';
  kit.table.position.x += 1.5; kit.table.position.z += 0.5; [0, 1, 3].forEach((k) => { kit.chairs[k].position.x += 1.5; kit.chairs[k].position.z += 0.5; });   // the table out of the lens
  // office: the wall behind the candidate (the set is open at +z): door, a framed poster, a plant, a coat rack, a clock
  const ow = new THREE.Group(); ow.position.set(0, 0, 2.6); office.root.add(ow);
  mk(new THREE.BoxGeometry(6.2, 2.8, 0.1), mat(0xe9e4da, 0.9), ow, 0, 1.4, 0.05);
  mk(new THREE.BoxGeometry(6.2, 0.12, 0.03), mat(0x8a7a6a, 0.6), ow, 0, 0.06, -0.01);
  mk(new THREE.BoxGeometry(0.95, 2.1, 0.06), mat(0x6a4a32, 0.5), ow, -1.55, 1.05, -0.01); mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0xc9a25a, 0.3, { metalness: 0.6 }), ow, -1.18, 1.0, -0.06);
  const owP = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.05), new THREE.MeshStandardMaterial({ roughness: 0.7, map: canvasTex(240, 320, (g, w, h) => { g.fillStyle = '#2f6aa8'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2b632'; g.beginPath(); g.arc(w / 2, 130, 70, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 34px Georgia, serif'; g.textAlign = 'center'; g.fillText('INTEGRITY', w / 2, 270); g.font = 'italic 18px Georgia, serif'; g.fillText('honesty is our policy', w / 2, 300); }) }));
  owP.position.set(0.45, 1.6, -0.02); owP.rotation.y = PI; ow.add(owP);
  mk(new THREE.BoxGeometry(0.88, 1.13, 0.03), mat(0x2a2a2e, 0.5), ow, 0.45, 1.6, 0.0);
  const owPl = new THREE.Group(); owPl.position.set(1.6, 0, -0.4); ow.add(owPl); mk(new THREE.CylinderGeometry(0.22, 0.17, 0.42, 14), mat(0xf4f1ea, 0.5), owPl, 0, 0.21, 0); for (let k = 0; k < 10; k++) { const lf = mk(new THREE.SphereGeometry(0.22, 10, 8), mat(k % 2 ? 0x3f7a3a : 0x4f8a42, 0.8), owPl, Math.sin(k * 2.4) * 0.18, 0.7 + (k % 4) * 0.2, Math.cos(k * 2.4) * 0.18); lf.scale.set(0.45, 1.6, 0.25); lf.rotation.z = Math.sin(k) * 0.6; }
  const owR = new THREE.Group(); owR.position.set(-0.6, 0, -0.35); ow.add(owR); mk(new THREE.CylinderGeometry(0.02, 0.03, 1.8, 8), mat(0x2a1a12, 0.5), owR, 0, 0.9, 0); mk(new THREE.SphereGeometry(0.2, 10, 8), mat(0x8a2a2a, 0.9), owR, 0.1, 1.45, 0).scale.set(0.6, 1.4, 0.6); mk(new THREE.SphereGeometry(0.15, 10, 8), mat(0x2f3a4a, 0.9), owR, -0.08, 1.62, 0.05).scale.set(0.9, 0.5, 0.9);
  const owC = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 30); g.stroke(); g.beginPath(); g.moveTo(64, 64); g.lineTo(86, 76); g.stroke(); }) }));
  owC.position.set(-0.45, 2.25, -0.02); owC.rotation.y = PI; ow.add(owC);
  // office: papers that blow off the desk
  const papers = Array.from({ length: 9 }, () => { const m = mk(new THREE.PlaneGeometry(0.21, 0.29), mat(0xffffff, 0.8, { side: THREE.DoubleSide }), office.root, 0, 0, 0); m.visible = false; return m; });
  // birthday: party table, cake, presents, banner, balloons (they pop), a hideous sweater, confetti
  const party = new THREE.Group(); sub.root.add(party); party.position.set(1.0, 0, -5.2);
  const tcl = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = ['#e58fa6', '#8fd0e8', '#f2d06a', '#a8d88a'][(x / 32) % 4]; g.fillRect(x, 0, 16, h); } });
  mk(new THREE.BoxGeometry(2.5, 0.04, 0.9), new THREE.MeshStandardMaterial({ map: tcl, roughness: 0.85 }), party, 0, 0.76, 0);
  for (const [a, b] of [[-1.15, -0.35], [1.15, -0.35], [-1.15, 0.35], [1.15, 0.35]]) mk(new THREE.BoxGeometry(0.05, 0.74, 0.05), mat(0xf4f1ea, 0.6), party, a, 0.37, b);
  const cake = new THREE.Group(); cake.position.set(-0.6, 0.78, 0.12); party.add(cake);
  mk(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 24), mat(0x6a3a24, 0.6), cake, 0, 0.08, 0); mk(new THREE.CylinderGeometry(0.205, 0.205, 0.04, 24), mat(0xf4c6d6, 0.5), cake, 0, 0.16, 0);
  const flameTex = canvasTex(64, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.62, 2, w / 2, h * 0.55, h * 0.5); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.35, 'rgba(255,190,80,.9)'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (let k = 0; k < 5; k++) { const a = k * 1.256; mk(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), mat([0xd2483f, 0x3d7bd9, 0xf2b632][k % 3], 0.5), cake, Math.cos(a) * 0.11, 0.22, Math.sin(a) * 0.11); const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); f.scale.set(0.03, 0.06, 1); f.position.set(Math.cos(a) * 0.11, 0.285, Math.sin(a) * 0.11); cake.add(f); }
  [[0.7, 0.15, 0x3d7bd9, 0.22], [0.95, -0.1, 0xe58fa6, 0.18], [0.45, -0.2, 0x6fa84f, 0.16]].forEach(([x, z, c, s]) => { mk(new THREE.BoxGeometry(s, s, s), mat(c, 0.6), party, x, 0.78 + s / 2, z); mk(new THREE.BoxGeometry(s + 0.01, 0.03, 0.03), mat(0xf2d06a, 0.5), party, x, 0.78 + s + 0.005, z); });
  for (let k = 0; k < 5; k++) { mk(new THREE.CylinderGeometry(0.11, 0.09, 0.012, 16), mat(0xffffff, 0.6), party, -1.0 + k * 0.5, 0.79, 0.28); mk(new THREE.CylinderGeometry(0.035, 0.028, 0.1, 10), mat([0xe58fa6, 0x8fd0e8, 0xf2d06a][k % 3], 0.6), party, -0.85 + k * 0.5, 0.83, 0.3); }
  const pChairs = [[-1.1, -0.55], [0.55, -0.55]].map(([x, z]) => { const c = new THREE.Group(); c.position.set(x, 0, z); party.add(c); mk(new THREE.BoxGeometry(0.44, 0.04, 0.42), mat(0xf4f1ea, 0.5), c, 0, 0.45, 0); for (const [a, b] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) mk(new THREE.BoxGeometry(0.03, 0.45, 0.03), mat(0xf4f1ea, 0.5), c, a, 0.225, b); for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.03, 0.4, 0.03), mat(0xf4f1ea, 0.5), c, -0.15 + k * 0.15, 0.68, -0.2); return c; });
  const banT = canvasTex(1024, 128, (g, w, h) => { g.clearRect(0, 0, w, h); const letters = 'HAPPY BIRTHDAY GARY'; for (let k = 0; k < letters.length; k++) { if (letters[k] === ' ') continue; const x = 26 + k * 51.5; g.fillStyle = ['#e2574c', '#3d7bd9', '#f2b632', '#6fa84f', '#8f6fb8'][k % 5]; g.beginPath(); g.moveTo(x - 24, 8); g.lineTo(x + 24, 8); g.lineTo(x, 118); g.fill(); g.fillStyle = '#ffffff'; g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(letters[k], x, 58); } });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.36), new THREE.MeshBasicMaterial({ map: banT, transparent: true, side: THREE.DoubleSide, depthWrite: false })); banner.position.set(0, 2.72, -1.25); party.add(banner);
  for (const x of [-1.5, 1.5]) mk(new THREE.CylinderGeometry(0.03, 0.03, 2.9, 8), mat(0xf4f1ea, 0.5), party, x, 1.45, -1.25);
  const BAL = [[-1.38, 1.42, -0.68], [-0.83, 1.62, -0.72], [-0.28, 1.5, -0.7], [0.28, 1.68, -0.72], [0.83, 1.45, -0.7], [1.38, 1.6, -0.68]];
  const BALC = [0xe2574c, 0xf2b632, 0x3d7bd9, 0xe58fa6, 0x6fa84f, 0x8f6fb8];
  const balloons = BAL.map(([x, y, z], k) => { const g = new THREE.Group(); g.position.set(x, y, z); party.add(g); mk(new THREE.SphereGeometry(0.17, 16, 12), mat(BALC[k], 0.3), g, 0, 0, 0).scale.y = 1.18; const s = mk(new THREE.CylinderGeometry(0.004, 0.004, y - 0.78, 4), mat(0xf4f4f4, 0.6), g, 0, -(y - 0.78) / 2 - 0.18, 0); void s; return g; });
  const POPS = [30.3, 30.5, 30.72, 30.95, 31.2, 31.45];
  const POP_ORDER = [2, 3, 1, 4, 0, 5];
  const CONF = 160, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.035, 0.022), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), CONF);
  conf.frustumCulled = false; sub.root.add(conf);
  const CR = rng(23), confSeeds = Array.from({ length: CONF }, () => [CR(), CR(), CR(), CR(), CR()]);
  confSeeds.forEach((q, i) => conf.setColorAt(i, new THREE.Color([0xe2574c, 0xf2b632, 0x3d7bd9, 0xe58fa6, 0x6fa84f, 0xffffff][i % 6])));
  const sweT = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#2f7a3a'; g.beginPath(); g.moveTo(70, 20); g.lineTo(186, 20); g.lineTo(250, 70); g.lineTo(226, 120); g.lineTo(196, 100); g.lineTo(196, 250); g.lineTo(60, 250); g.lineTo(60, 100); g.lineTo(30, 120); g.lineTo(6, 70); g.closePath(); g.fill();
    g.fillStyle = '#d2283f'; for (let x = 60; x < 196; x += 20) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x + 10, 56); g.lineTo(x + 20, 70); g.fill(); g.beginPath(); g.moveTo(x, 222); g.lineTo(x + 10, 208); g.lineTo(x + 20, 222); g.fill(); }
    g.fillStyle = '#a0663a'; g.beginPath(); g.ellipse(128, 145, 34, 40, 0, 0, 7); g.fill(); g.strokeStyle = '#6a3a1a'; g.lineWidth = 6; g.beginPath(); g.moveTo(104, 112); g.lineTo(88, 84); g.moveTo(152, 112); g.lineTo(168, 84); g.stroke();
    g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(128, 172, 11, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(114, 138, 5, 0, 7); g.arc(142, 138, 5, 0, 7); g.fill();
    g.fillStyle = '#f4f1ea'; for (let k = 0; k < 16; k++) g.fillRect(64 + (k * 37) % 128, 84 + (k * 53) % 120, 5, 5);
    g.fillStyle = '#f2d06a'; g.fillRect(60, 236, 136, 12); });
  const sweater = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.78), new THREE.MeshStandardMaterial({ map: sweT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 })); sub.root.add(sweater);
  // car lot: the bumper that falls off
  const hero = lot.cars[LD.hero].car, bumper = hero.body.children[3];
  // casino: a chip fountain (instanced)
  const CH = 180, chips = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.011, 12), new THREE.MeshStandardMaterial({ roughness: 0.5 }), CH);
  chips.frustumCulled = false; casino.root.add(chips);
  const HR = rng(5), chipSeeds = Array.from({ length: CH }, () => [HR(), HR(), HR(), HR(), HR()]);
  chipSeeds.forEach((q, i) => chips.setColorAt(i, new THREE.Color([0xd2283f, 0x1d3a7a, 0x2a8a3a, 0x111111, 0xf4f1ea, 0xf2b632][i % 6])));
  press.root.children.forEach((o) => { if (o.isMesh && Math.abs(o.position.x - 1.05) < 0.01 && Math.abs(o.position.z + 2.4) < 0.01) o.visible = false; });   // a teleprompter in the lens
  // press: two flags right behind the President (his tail knocks them over)
  const pFlags = [-1, 1].map((s) => {
    const g = new THREE.Group(); g.position.set(s * 0.5, 0.25, -3.62); press.root.add(g);
    mk(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 14), mat(0xc9a25a, 0.3, { metalness: 0.7 }), g, 0, 0.03, 0);
    mk(new THREE.CylinderGeometry(0.018, 0.018, 2.3, 8), mat(0xc9a25a, 0.3, { metalness: 0.7 }), g, 0, 1.15, 0); mk(new THREE.SphereGeometry(0.045, 10, 8), mat(0xe8c76a, 0.3, { metalness: 0.7 }), g, 0, 2.32, 0);
    const fl = mk(new THREE.PlaneGeometry(0.55, 1.0, 5, 8), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, map: canvasTex(128, 256, (c, w, h) => { c.fillStyle = s < 0 ? '#1c3a6e' : '#b5462e'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8c76a'; c.beginPath(); c.arc(w / 2, h * 0.3, 24, 0, 7); c.fill(); for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#f4efe2' : 'rgba(0,0,0,0)'; c.fillRect(0, h * 0.55 + i * 22, w, 22); } }) }), g, -s * 0.29, 1.65, 0);
    const fp = fl.geometry.attributes.position; for (let i = 0; i < fp.count; i++) fp.setZ(i, 0.05 * Math.sin(fp.getY(i) * 5 + fp.getX(i) * 6)); fl.geometry.computeVertexNormals();
    return g;
  });
  // court: the gavel moves to the judge's right hand (its sound block too) so the reverse angle sees it slam in the foreground
  court.root.children.forEach((o) => { if (o.isMesh && Math.abs(o.position.x - (JD.judge[0] - 0.55)) < 0.01 && Math.abs(o.position.z - (JD.judge[1] + 0.75)) < 0.01) o.visible = false; });
  court.gavel.position.x = JD.judge[0] + 0.55;
  mk(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 20), mat(0x7a4a2a, 0.5), court.root, JD.judge[0] + 0.55, JD.benchTop + 0.105, JD.judge[1] + 0.75);
  // court: the evidence — a paper lunch bag marked DAVE on a stand
  const ev = new THREE.Group(); ev.position.set(0.05, 0, -1.4); court.root.add(ev);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8), mat(0x5a3420, 0.5), ev, 0, 0.425, 0); mk(new THREE.BoxGeometry(0.42, 0.04, 0.32), mat(0x5a3420, 0.5), ev, 0, 0.86, 0);
  const bagT = canvasTex(160, 220, (g, w, h) => { g.fillStyle = '#c9a06a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 6; k++) g.fillRect(0, 30 + k * 34, w, 3); g.fillStyle = '#1a1a1a'; g.font = 'bold 54px "Comic Sans MS", Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('DAVE', w / 2, 120); g.font = 'bold 26px Helvetica, sans-serif'; g.fillText('DO NOT', w / 2, 160); g.fillText('EAT!!', w / 2, 188); });
  const bag = mk(new THREE.BoxGeometry(0.2, 0.28, 0.12), [mat(0xc9a06a, 0.9), mat(0xc9a06a, 0.9), mat(0xb8905a, 0.9), mat(0xc9a06a, 0.9), new THREE.MeshStandardMaterial({ map: bagT, roughness: 0.9 }), mat(0xc9a06a, 0.9)], ev, 0, 1.02, 0);
  bag.rotation.y = -0.45;
  const tagT = canvasTex(128, 48, (g, w, h) => { g.fillStyle = '#f2d06a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = 'bold 22px Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EXHIBIT A', w / 2, h / 2 + 1); });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshStandardMaterial({ map: tagT, roughness: 0.6 })); tag.position.set(0.1, 0.885, 0.13); tag.rotation.x = -0.6; ev.add(tag);

  // ---------------------------------------------------------------- helpers
  /** pose a (possibly scaled) person: (x,z) local to the set, rootY/groundY in local meters, s = body scale, then wag its tail. */
  function put(rig, key, p, s = 1, rootY = 0, groundY = rootY, wag = 0, tq = {}, t = 0) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    p.y = 0; p.floor = (groundY - rootY) / s;
    applyPose(rig, p);
    rig.root.scale.setScalar(s);
    rig.root.position.y = rootY + OFF[key][1];
    rig.root.visible = true;
    rig.tail.update(t, wag, tq);
  }
  const sitRoot = (seat, s = 1) => seat - s * SIT;
  const walk = (p, dist, speed, s = 1) => { p.dist = dist / s; p.speed = speed / s; };
  const wagAt = (t, t0, t1 = 1e9, ramp = 0.15) => K(t, [[t0, 0], [t0 + ramp, 1], [t1, 1], [t1 + 0.3, 0]]);
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const poof = (base, key, x, y, z, t, m, n = 3, size = 0.4, col = WHITE) => { // a soft poof at the moment m
    const age = t - m; if (age < 0 || age > 0.6) return;
    for (let k = 0; k < n; k++) { const a = k * 2.1 + base, r = 0.06 + age * 0.45; puffs.set((base + k) % 60, W(key, x + Math.cos(a) * r, y + 0.1 * k + age * 0.3, z + Math.sin(a) * r * 0.6), size + age * 0.8, 0.85 * (1 - age / 0.6) ** 1.5, col); }
  };
  const sprout = (t, i = 0) => boing(clamp((t - M1 - i * 0.03) / 0.55));

  // ---------------------------------------------------------------- 1. open — commuters on the sidewalk, the sprout, Gary's lie
  const RES = 7.1, GSTOP = 7.75, LIE1 = 9.3, STARE = 9.75, V = 1.05, V2 = 0.9;
  const gDist = (t) => V * Math.min(t, M1) + V * 0.15 * ease((t - M1) / 0.3) + V2 * Math.max(0, Math.min(t, GSTOP) - RES) - (t > GSTOP ? 0 : 0);
  const G_X0 = -1.0;
  const garyX = (t) => G_X0 + gDist(t);
  const OPEN_PPL = [[-2.6, -0.8, 1.06], [-2.15, -1.55, 1.03], [-1.55, -0.8, 1.05], [-1.2, -1.6, 1.04], [-0.55, -0.8, 1.05], [0.15, -1.55, 1.06], [-0.3, -1.55, 1.05], [0.95, -1.6, 1.04], [-3.3, -1.55, 1.07], [0.4, -0.8, 1.03], [-2.0, -0.8, 1.05]];
  function openPose(t, i) {
    const [x0, lane, vi] = OPEN_PPL[i];
    const stopAt = STARE + (i % 3) * 0.04;
    let d = vi * Math.min(t, M1) + vi * 0.15 * ease((t - M1) / 0.3) + 0.92 * vi * Math.max(0, Math.min(t, stopAt) - RES);
    const moving = t < M1 || (t > RES && t < stopAt);
    const p = basePose(); p.eyes = blink(t, i);
    walk(p, d, moving ? vi : 0);
    let x = x0 + d, rotY = PI / 2;
    const look = K(t, [[M1 + 0.25 + i * 0.03, 0], [M1 + 0.6, 1], [M1 + 1.5, 1], [RES - 0.1, 0]]);
    const chaser = i === 3 || i === 7;
    if (chaser && t > M1 + 0.5 && t < RES + 0.3) { // chasing their own tail in a tight circle
      const u = (t - M1 - 0.5) / 1.6, ang = 2 * PI * u * (i === 3 ? 1 : -1);
      rotY = PI / 2 + ang; walk(p, d + u * 1.6, 1.2); p.headPitch = 0.25; p.headYaw = (i === 3 ? -1 : 1) * 0.8;
    } else { // turn around to inspect the new tail: back to the camera, looking down over the shoulder
      rotY = PI / 2 + look * (0.95 + 0.2 * (i % 3)); p.headYaw = -1.1 * look; p.headPitch = 0.45 * look;
    }
    p.armA = mixArm(REST, SHOCK_A, look * 0.7); p.armB = mixArm(REST, SHOCK_B, look * 0.7);
    p.mouth = look > 0.3 || (chaser && t > M1 + 0.5 && t < RES) ? 'o' : 'smile';
    const stare = K(t, [[stopAt, 0], [stopAt + 0.3, 1]]);
    if (stare > 0) { rotY = lerpAngle(rotY, faceToward(x, lane, garyX(t), -0.8), stare); p.mouth = 'flat'; p.headYaw = 0; p.headPitch = 0; }
    Object.assign(p, { x, z: lane, rotY });
    return { p, x, z: lane };
  }
  function garyOpen(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    const d = gDist(t), moving = t < M1 || (t > RES && t < GSTOP);
    walk(p, d, moving ? V : 0);
    const x = garyX(t), look = K(t, [[M1 + 0.3, 0], [M1 + 0.65, 1], [M1 + 1.5, 1], [RES - 0.1, 0]]);
    let rotY = PI / 2 + look * 1.05; p.headYaw = -1.1 * look; p.headPitch = 0.45 * look;
    p.armA = mixArm(REST, SHOCK_A, look * 0.7); p.armB = mixArm(REST, SHOCK_B, look * 0.7); p.mouth = look > 0.3 ? 'o' : 'smile';
    const call = K(t, [[7.55, 0], [7.9, 1]]);
    if (call > 0) { p.armA = mixArm(p.armA, PHONE_A, call); rotY = lerpAngle(PI / 2, PI / 2 + 0.5, call); p.headYaw = -0.5 * call; p.headRoll = -0.12 * call; p.mouth = t > 9.0 && t < 9.9 && Math.sin(t * 22) > 0 ? 'o' : 'smile'; }
    const caught = K(t, [[10.0, 0], [10.25, 1]]);
    if (caught > 0) { p.headYaw = -0.9 * caught; p.headPitch = 0.3 * caught; p.mouth = 'o'; }
    Object.assign(p, { x, z: -0.8, rotY });
    return { p, call, x };
  }

  // ---------------------------------------------------------------- 2. cookie — the kid, the jar, Mom
  const KID = [-1.25, -1.75], MOM = [-0.45, -1.35], LIE2 = 11.25, KNOCK = 12.05, HIT = 12.5, LIE3 = 13.85, LAUNCH = 14.45;
  function kidPose(t) {
    const p = basePose(); p.eyes = blink(t, 5);
    Object.assign(p, { x: KID[0], z: KID[1], rotY: 0.3 + 0.12 * Math.sin(t * 3.1) }); p.headYaw = 0.45;   // back to the counter, eyeing Mom, fidgeting
    if (t < LIE2) { const hop = Math.max(0, Math.sin((t - 10.6) * 7.5)); p.lean = 0.05 * hop; }
    p.armA = A(0.25, 0.1, -0.5, 0.2); p.armB = A(0.25, 0.1, -0.5, -0.2);   // hands behind his back (the evidence)
    p.mouth = t > LIE2 && t < 12.6 ? (Math.sin(t * 20) > 0 ? 'o' : 'smile') : 'smile';
    const oops = K(t, [[HIT, 0], [HIT + 0.2, 1]]);
    if (oops > 0) { p.headYaw = 0.9 * oops * K(t, [[HIT, 0], [HIT + 0.2, 1], [13.4, 1], [13.7, 0]]); p.mouth = 'o'; p.armA = mixArm(p.armA, SHOCK_A, oops * 0.8); p.armB = mixArm(p.armB, SHOCK_B, oops * 0.8); }
    const momWag = K(t, [[LIE3 + 0.3, 0], [LIE3 + 0.6, 1]]); if (momWag > 0) { p.mouth = 'o'; p.headYaw = 0.3 * momWag; }
    return p;
  }
  function momPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    Object.assign(p, { x: MOM[0], z: MOM[1], rotY: faceToward(MOM[0], MOM[1], KID[0], KID[1]) + 1.0 }); p.headYaw = 0.3;
    p.armA = CROSS_A; p.armB = CROSS_B; p.mouth = 'flat'; p.headPitch = 0.15;
    if (t > LIE3 && t < LIE3 + 1.0) p.mouth = Math.sin(t * 18) > 0 ? 'smile' : 'flat';
    p.footFwd = 0.06 * Math.max(0, Math.sin(t * 9));                                  // tap, tap, tap
    p.headRoll = 0.12 * Math.sin(t * 2.3) * K(t, [[LIE3, 0], [LIE3 + 0.3, 1]]);
    const snap = K(t, [[LAUNCH, 0], [LAUNCH + 0.25, 1]]); if (snap > 0) { p.headYaw = -0.8 * snap * K(t, [[LAUNCH, 0], [LAUNCH + 0.25, 1], [15.4, 1], [15.7, 0]]); }
    return p;
  }
  function jarAt(t) { // sits on the counter → knocked sideways off the edge → falls, smashes (an empty jar)
    const k = K(t, [[KNOCK, 0], [HIT, 1]], (u) => u * u);
    if (t < KNOCK) return { x: JAR0[0], y: JAR0[1], z: JAR0[2], rx: 0, rz: 0, vis: true };
    if (t < HIT) return { x: JAR0[0] + 0.55 * k, y: JAR0[1] + 0.12 * Math.sin(k * PI) * 0.5 - JAR0[1] * k * k, z: JAR0[2] + 0.75 * k, rx: 1.4 * k, rz: -2.2 * k, vis: true };
    return { vis: false };
  }

  // ---------------------------------------------------------------- 3. hire — "I work too hard": the chair spins
  const LIE4 = 19.35, SPIN0 = 19.65, SPIN1 = 21.1;
  const spinAt = (t) => 6 * PI * ease((t - SPIN0) / (SPIN1 - SPIN0));
  function candPose(t) {
    const p = basePose(); p.eyes = blink(t, 6);
    const [gx, gz] = OD.guest, sp = spinAt(t);
    Object.assign(p, { x: gx, z: gz + 0.02, rotY: PI + sp, footFwd: 0.4 });
    p.armA = mixArm(LAP_A, TALK_A, 0.5 + 0.5 * Math.sin(t * 3)); p.armB = LAP_B;
    p.mouth = t > 18.6 && t < 19.4 ? (Math.sin(t * 17) > 0 ? 'o' : 'smile') : 'smile';
    const dizzy = K(t, [[SPIN0 + 0.1, 0], [SPIN0 + 0.3, 1]]);
    if (dizzy > 0) { p.armA = mixArm(p.armA, OUT_A, dizzy); p.armB = mixArm(p.armB, OUT_B, dizzy); p.mouth = 'o'; p.lean = -0.15 * dizzy; p.headRoll = 0.25 * Math.sin(t * 6) * K(t, [[SPIN1, 0], [SPIN1 + 0.2, 1]]); }
    return p;
  }
  function hrPose(t) {
    const p = basePose(); p.eyes = blink(t, 1);
    const [bx, bz] = OD.boss; Object.assign(p, { x: bx, z: bz + 0.02, rotY: 0, footFwd: 0.4 });
    const writing = t < 19.5 || t > 21.25;
    p.armB = A(-0.75 + (writing ? 0.08 * Math.sin(t * 9) : 0), 0.05, -1.25, -0.45); p.armA = LAP_A; p.headPitch = writing ? 0.45 : 0.05; p.mouth = 'flat';
    if (!writing) p.headYaw = 0.15 * Math.sin((t - 19.5) * 4.2);
    return p;
  }

  // ---------------------------------------------------------------- 4. date — "six feet tall": the chair flies
  const DM_S = 0.8, LIE5 = 24.35, CHAIR = 24.8, FLOOR5 = 25.05, ROOM = 25.55;
  const TBL = [[0, 0.2], [-1.3, -1.45], [1.3, -1.55], [0, -2.5], [-2.45, 1.55], [-1.2, -3.05]];   // tables pulled into the vertical frame
  const DX0 = 0.5;                                                                                  // the hero table is a small bistro table
  const [tx0, tz0] = TBL[0];
  function datePose(t, who) {
    const p = basePose(); p.eyes = blink(t, who === 'm' ? 4 : 8);
    const s = who === 'm' ? 1 : -1, x = tx0 + s * (DX0 - 0.02);
    Object.assign(p, { x, z: tz0, rotY: s > 0 ? -PI / 2 : PI / 2, footFwd: 0.4 });
    if (who === 'm') {
      p.armA = A(-0.7, 0.12, -1.0, 0.4); p.armB = mixArm(A(-0.7, 0.12, -1.0, -0.4), TALK_B, 0.5 + 0.5 * Math.sin(t * 2.5));
      p.mouth = t > 24.1 && t < 24.9 ? (Math.sin(t * 18) > 0 ? 'o' : 'smile') : 'smile';
      const fall = K(t, [[CHAIR, 0], [FLOOR5, 1]], (u) => u * u);
      if (fall > 0) { p.armA = mixArm(p.armA, OUT_A, fall); p.armB = mixArm(p.armB, OUT_B, fall); p.mouth = 'o'; p.lean = -0.2 * fall; }
      return { p, rootY: lerp(sitRoot(RD.seat, DM_S), sitRoot(0.02, DM_S), fall) + 0.04 * Math.sin(fall * PI), s: DM_S, ground: 0 };
    }
    p.armA = A(-0.7, 0.12, -1.0, 0.4); p.armB = A(-0.7, 0.12, -1.0, -0.4); p.mouth = 'smile';
    const gasp = K(t, [[FLOOR5, 0], [FLOOR5 + 0.25, 1], [ROOM + 0.4, 1], [ROOM + 0.8, 0]]);
    if (gasp > 0) { p.armB = mixArm(p.armB, A(-1.25, 0.15, -2.3, -0.6), gasp); p.mouth = 'o'; }
    if (t > ROOM + 0.6) p.mouth = 'smile';
    return { p, rootY: sitRoot(RD.seat), s: 1, ground: 0 };
  }
  function dinerPose(t, i) { // the other couples: chatting, then every tail in the room goes at once
    const ti = [1, 2, 3, 5][Math.floor(i / 2)]; if (ti === undefined) return null;
    const [x0, z0] = TBL[ti], s = i % 2 ? 1 : -1, x = x0 + s * (RD.chairDx - 0.02);
    const p = basePose(); p.eyes = blink(t, i + 2);
    Object.assign(p, { x, z: z0, rotY: s > 0 ? -PI / 2 : PI / 2, footFwd: 0.4 });
    const talk = Math.sin(t * 2.2 + i * 1.3);
    p.armA = A(-0.7, 0.12, -1.0, 0.4); p.armB = mixArm(A(-0.7, 0.12, -1.0, -0.4), TALK_B, 0.5 + 0.5 * talk); p.mouth = talk > 0.3 ? 'o' : 'smile';
    p.headYaw = 0.15 * Math.sin(t * 0.9 + i);
    return { p, x, z: z0 };
  }

  // ---------------------------------------------------------------- 5. bday — "We LOVE it!": balloons pop
  const LIE6 = 29.85;
  const FAM = [ // [x, z (local to the party table), seated?]
    [-1.1, -0.55, true], [-0.55, -0.62, false], [0, -0.62, false], [0.55, -0.55, true], [1.1, -0.62, false]];
  function famPose(t, i) {
    const [x, z, seated] = FAM[i], gx = 1.0 + x, gz = -5.2 + z, p = basePose(); p.eyes = blink(t, i + 1);
    Object.assign(p, { x: gx, z: gz, rotY: -0.3 * x, footFwd: seated ? 0.4 : 0 });
    const isG = i === 2, isGran = i === 0;
    if (isG) { // Gary holds the sweater up against himself
      p.armA = HOLD_A; p.armB = HOLD_B; p.headPitch = -0.05; p.mouth = 'smile';
      if (t > LIE6 && t < LIE6 + 1.2) p.mouth = Math.sin(t * 16) > 0 ? 'o' : 'smile';
    } else if (isGran) { p.armA = LAP_A; p.armB = LAP_B; p.mouth = 'smile'; p.headYaw = 0.35; p.headPitch = -0.05; }
    else { p.armA = REST; p.armB = REST; p.headYaw = -0.3 * Math.sign(x); p.mouth = 'smile'; const cheer = K(t, [[LIE6 + 0.05 * i, 0], [LIE6 + 0.3, 1], [31.9, 1], [32.3, 0.4]]); p.armA = mixArm(REST, CHEER_A, cheer); p.armB = mixArm(REST, CHEER_B, cheer); if (cheer > 0.5 && t < 31.6) p.mouth = 'o'; }
    const pop = K(t, [[30.35, 0], [30.55, 1]]); if (pop > 0 && !isGran && !isG) p.headPitch = -0.2 * pop;
    return { p, seated, gx, gz, gran: isGran };
  }

  // ---------------------------------------------------------------- 6. lot — "never been in a crash": rotor tail, lift-off
  const LIE7 = 35.9, BUMP = 36.25, ROTOR = 36.45, LIFT = 37.0;
  const SALES = [-0.55, 1.15], BUYER = [0.72, 1.6];
  const spinT = (t) => { const u = Math.max(0, t - ROTOR); return 4 * u * u + (u > 1.2 ? 0 : 0); };   // rotor angle (rad), accelerating
  function salesPose(t) {
    const p = basePose(); p.eyes = blink(t, 7);
    const up = K(t, [[LIFT, 0], [38.55, 1.75]], (u) => u * u * (3 - 2 * u));
    Object.assign(p, { x: SALES[0], z: SALES[1], rotY: faceToward(SALES[0], SALES[1], BUYER[0], BUYER[1]) - 0.35 });
    p.armA = A(-1.0, 0.25, -0.25, 0.2); p.armB = mixArm(TALK_B, POINT_B, 0.5 + 0.5 * Math.sin(t * 2.8));
    p.mouth = t > 35.35 && t < 36.4 ? (Math.sin(t * 19) > 0 ? 'o' : 'smile') : 'smile';
    const fly = K(t, [[ROTOR + 0.2, 0], [LIFT, 1]]);
    if (fly > 0) { p.armA = mixArm(p.armA, OUT_A, fly); p.armB = mixArm(p.armB, OUT_B, fly); p.armA.sz += 0.25 * Math.sin(t * 9); p.armB.sz += 0.25 * Math.sin(t * 9 + 1); p.mouth = 'o'; p.headPitch = -0.2 * fly; }
    return { p, rootY: up + 0.05 * Math.sin(t * 7) * clamp((t - LIFT) / 0.5), ground: up > 0.02 ? up - 0.1 : 0, up };
  }
  function buyerPose(t, i) {
    const p = basePose(); p.eyes = blink(t, 9);
    Object.assign(p, { x: BUYER[0], z: BUYER[1], rotY: faceToward(BUYER[0], BUYER[1], SALES[0], SALES[1]) + 0.25 });
    p.armA = CROSS_A; p.armB = CROSS_B; p.mouth = 'flat';
    const look = K(t, [[LIFT + 0.2, 0], [LIFT + 0.6, 1]]); if (look > 0) { p.headPitch = -0.6 * look; p.mouth = 'o'; p.armA = mixArm(CROSS_A, REST, look); p.armB = mixArm(CROSS_B, REST, look); }
    void i; return p;
  }

  // ---------------------------------------------------------------- 7. poker — "All in." chips erupt
  const ALLIN = 40.95, WAG8 = 41.3, BOOM = 42.0;
  const seatAt = (i) => CD.seats[i];
  function playerPose(t, i) {
    const [x, z] = seatAt(i), p = basePose(); p.eyes = blink(t, i + 3);
    Object.assign(p, { x, z, rotY: faceToward(x, z, 0, 0), footFwd: 0.38, lean: 0.12 });
    p.armA = CARD_A; p.armB = CARD_B; p.headPitch = 0.2; p.mouth = 'flat';
    if (i === 0) { const push = K(t, [[ALLIN, 0], [ALLIN + 0.35, 1], [ALLIN + 0.9, 1], [ALLIN + 1.2, 0]]); p.armA = mixArm(CARD_A, A(-1.35, 0.05, -0.2, 0.2), push); p.armB = mixArm(CARD_B, A(-1.35, 0.05, -0.2, -0.2), push); p.lean = 0.12 + 0.25 * push; if (t > 40.8 && t < 41.5) p.mouth = Math.sin(t * 14) > 0 ? 'o' : 'flat'; }
    const shock = K(t, [[BOOM + 0.05, 0], [BOOM + 0.3, 1]]);
    if (shock > 0) { p.armA = mixArm(p.armA, i % 2 ? CHEER_A : SHOCK_A, shock); p.armB = mixArm(p.armB, i % 2 ? CHEER_B : SHOCK_B, shock); p.mouth = 'o'; p.lean = 0.12 - 0.25 * shock; p.headPitch = -0.4 * shock; }
    return { p, x, z };
  }
  function dealerPose(t) {
    const p = basePose(); p.eyes = blink(t, 4);
    Object.assign(p, { x: CD.dealer[0], z: CD.dealer[1], rotY: PI / 2, footFwd: 0.38 });
    p.armA = A(-0.8, 0.1, -0.9, 0.5); p.armB = A(-0.8, 0.1, -0.9, -0.5); p.mouth = 'flat'; p.headPitch = 0.2;
    const palm = K(t, [[42.6, 0], [42.9, 1]]); if (palm > 0) { p.armB = mixArm(p.armB, FACE_B, palm); p.headPitch = 0.35; p.eyes = 'closed'; }
    return p;
  }
  function chipAt(i, t) { // ballistic chips from the pot + the stacks, landing on the felt or the floor
    const q = chipSeeds[i], age = t - BOOM - q[4] * 0.25; if (age < 0) return null;
    const a = q[0] * 2 * PI, r0 = q[1] * 0.5, vr = 0.5 + q[2] * 1.6, vy = 3.2 + q[3] * 2.6;
    let x = Math.cos(a) * (r0 + vr * age), z = Math.sin(a) * (r0 * 0.6 + vr * 0.7 * age), y = CD.top + 0.05 + vy * age - 4.9 * age * age;
    const onTable = (x / 1.75) ** 2 + (z / 1.05) ** 2 < 1, floorY = onTable ? CD.top + 0.01 : 0.006;
    let rest = false; if (y < floorY && age > 0.3) { y = floorY; rest = true; }
    return { x, y, z, rx: rest ? PI / 2 : age * (8 + q[2] * 9), rz: rest ? q[3] : age * (6 + q[1] * 7) };
  }

  // ---------------------------------------------------------------- 8. press — "I'll be brief": the flags go down
  const LIE9 = 46.55, WAG9 = 46.95, FL0 = 47.3, FL1 = 47.5, QUIET = 48.25;
  const TRIES = [48.5, 49.0, 49.45];
  function prezPose(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    const [sx, sz] = PD.speaker; Object.assign(p, { x: sx, z: sz + 0.05, rotY: 0 });
    p.armA = A(-0.75, 0.1, -0.7, 0.4); p.armB = mixArm(TALK_B, A(-0.75, 0.1, -0.7, -0.4), t > QUIET ? 1 : 0); if (t < QUIET) p.armB.sx += 0.15 * Math.sin(t * 4);
    p.mouth = t < QUIET ? (t > LIE9 && t < 47.6 && Math.sin(t * 16) > 0 ? 'o' : t < LIE9 && Math.sin(t * 9) > 0.3 ? 'o' : 'smile') : 'flat';
    for (const tr of TRIES) if (t > tr && t < tr + 0.28) p.mouth = 'o';
    const jolt = K(t, [[FL0, 0], [FL0 + 0.15, 1], [FL1 + 0.5, 1], [FL1 + 0.8, 0]]); p.headYaw = -0.6 * jolt;
    if (t > QUIET) p.headPitch = 0.1;
    return p;
  }
  const pressWag = (t) => Math.max(wagAt(t, WAG9, 47.95), ...TRIES.map((tr) => K(t, [[tr, 0], [tr + 0.08, 0.55], [tr + 0.3, 0]])));

  // ---------------------------------------------------------------- 9. court — "Did you eat Dave's lunch?" "No."
  const RISE = 53.35, LIE10 = 53.95, BANGS = [54.4, 54.75, 55.1];
  function garyCourt(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    const [dx, dz] = JD.defense, x = dx - 0.42, z = dz + 0.62;
    const up = K(t, [[RISE, 0], [RISE + 0.45, 1]]);
    Object.assign(p, { x, z: z - 0.05 * up, rotY: PI, footFwd: 0.4 * (1 - up) });
    p.armA = mixArm(LAP_A, REST, up); p.armB = mixArm(LAP_B, REST, up); p.mouth = 'smile';
    if (t > LIE10 && t < LIE10 + 0.4) p.mouth = 'o';
    const bang = K(t, [[BANGS[0], 0], [BANGS[0] + 0.15, 1]]); if (bang > 0) { p.mouth = 'o'; p.headPitch = -0.1; p.armA = mixArm(p.armA, SHOCK_A, bang); p.armB = mixArm(p.armB, SHOCK_B, bang); }
    return { p, rootY: lerp(sitRoot(JD.seat), 0, up), ground: 0 };
  }
  function prosPose(t) {
    const p = basePose(); p.eyes = blink(t, 6);
    const x = 0.55, z = -1.25; Object.assign(p, { x, z, rotY: faceToward(x, z, -1.57, 0.17) });
    const ask = K(t, [[52.3, 0], [52.6, 1]]); p.armB = mixArm(REST, A(-1.2, 0.3, -0.3, -0.2), ask); p.armA = REST;
    p.mouth = t > 52.4 && t < 53.6 && Math.sin(t * 15) > 0 ? 'o' : 'flat';
    const point = K(t, [[LIE10 + 0.3, 0], [LIE10 + 0.5, 1]]); if (point > 0) p.armB = mixArm(p.armB, POINT_B, point);
    return p;
  }
  function judgePose(t) {
    const p = basePose(); p.eyes = blink(t, 1);
    Object.assign(p, { x: JD.judge[0], z: JD.judge[1] - 0.1, rotY: 0, footFwd: 0.4 });
    let sw = 0; BANGS.forEach((b) => { sw = Math.max(sw, K(t, [[b - 0.22, 0], [b - 0.08, 1], [b, 0]])); });   // raise → slam
    const ready = K(t, [[BANGS[0] - 0.5, 0], [BANGS[0] - 0.3, 1]]);
    p.armB = mixArm(LAP_B, mixArm(A(-1.25, 0.28, -0.75, -0.3), A(-2.1, 0.28, -0.9, -0.3), sw), ready); p.armA = LAP_A; p.headPitch = 0.1; p.mouth = t > BANGS[0] ? 'o' : 'flat';
    return { p, sw, ready };
  }
  function lawyerPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    const [dx, dz] = JD.defense; Object.assign(p, { x: dx + 0.55, z: dz + 0.62, rotY: PI - 0.4, footFwd: 0.4 });
    p.armA = LAP_A; p.armB = LAP_B; p.mouth = 'flat';
    const palm = K(t, [[LIE10 + 0.35, 0], [LIE10 + 0.65, 1]]); if (palm > 0) { p.armB = mixArm(LAP_B, FACE_B, palm); p.eyes = 'closed'; p.headPitch = 0.3; }
    return p;
  }

  // ---------------------------------------------------------------- 10. end — golden hour on the porch; the dog
  const PORCH = [13.62, -6.55], HUG = 58.55, DOGRUN = 61.35;
  sub.houses[3].g.children.forEach((o) => { if (o.isMesh && Math.abs(o.position.x + 3.6) < 0.01 && Math.abs(o.position.z - 1.9) < 0.01) o.visible = false; });   // a porch post in the lens
  const bench = new THREE.Group(); bench.position.set(13.9, 0, -6.55); sub.root.add(bench);
  for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(1.5, 0.05, 0.13), mat(0xa8744a, 0.7), bench, 0, 0.43, -0.15 + k * 0.15);
  for (const x of [-0.62, 0.62]) mk(new THREE.BoxGeometry(0.07, 0.42, 0.42), mat(0x3d4a45, 0.5), bench, x, 0.21, 0);
  [[13.0, -7.6, 0xe2574c], [14.9, -7.7, 0xf2b632], [12.6, -6.2, 0xe58fa6]].forEach(([x, z, c]) => { const pot = new THREE.Group(); pot.position.set(x, 0, z); sub.root.add(pot); mk(new THREE.CylinderGeometry(0.18, 0.14, 0.3, 12), mat(0xb5562e, 0.7), pot, 0, 0.15, 0); for (let k = 0; k < 7; k++) mk(new THREE.SphereGeometry(0.07, 8, 6), mat(k % 2 ? c : 0x4f8a3f, 0.7), pot, Math.cos(k) * 0.1, 0.36 + (k % 3) * 0.05, Math.sin(k) * 0.1); });
  function garyEnd(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: PORCH[0], z: PORCH[1], rotY: 0.12, footFwd: 0.42 });
    const hug = K(t, [[HUG + 1.0, 0], [HUG + 1.4, 1]]);
    p.armA = LAP_A; p.armB = mixArm(LAP_B, A(-1.15, 0.45, -1.1, -0.5), hug); p.mouth = 'smile'; p.headRoll = 0.15 * hug; p.headYaw = 0.35 * hug; p.rotY = 0.12 + 0.35 * hug;
    if (t > HUG + 1.1 && t < HUG + 2.0) p.mouth = Math.sin(t * 15) > 0 ? 'o' : 'smile';
    const dogLook = K(t, [[DOGRUN + 0.4, 0], [DOGRUN + 0.8, 1]]); if (dogLook > 0) { p.headPitch = 0.3 * dogLook; p.headYaw = lerp(p.headYaw, 0.2, dogLook); p.eyes = t > DOGRUN + 1.5 ? 'closed' : p.eyes; }
    return { p, rootY: sitRoot(0.46) };
  }
  function daughterEnd(t) {
    const p = basePose(); p.eyes = blink(t, 5);
    const x = PORCH[0] + 0.55, z = PORCH[1] + 0.02;
    const hug = K(t, [[HUG, 0], [HUG + 0.4, 1]]);
    Object.assign(p, { x, z, rotY: -0.25 - 0.9 * hug, footFwd: 0.42 });
    p.armA = mixArm(LAP_A, A(-1.15, 0.15, -1.3, 0.7), hug); p.armB = mixArm(LAP_B, A(-1.15, 0.15, -1.3, -0.7), hug); p.lean = 0.12 * hug; p.headRoll = -0.2 * hug; p.mouth = 'smile';
    if (t > HUG && t < HUG + 0.9) p.mouth = Math.sin(t * 15) > 0 ? 'o' : 'smile';
    const cheer = K(t, [[DOGRUN + 0.8, 0], [DOGRUN + 1.1, 1]]); if (cheer > 0) { p.armB = mixArm(p.armB, CHEER_B, cheer); p.mouth = 'o'; }
    return { p, rootY: sitRoot(0.46, KS) };
  }
  function dogEnd(t) { // trots in, sits facing them (calm tail), then a happy double spin and the tail goes like crazy
    const S0 = [16.4, -5.0], SIT = [14.45, -5.75], k = K(t, [[55.9, 0], [57.6, 1]], (u) => u);
    const x = lerp(S0[0], SIT[0], k), z = lerp(S0[1], SIT[1], k), face = faceToward(S0[0], S0[1], SIT[0], SIT[1]);
    const spin = K(t, [[DOGRUN, 0], [DOGRUN + 1.0, 1]]) * 4 * PI;
    const ry = k < 1 ? face : lerpAngle(face, PI + 0.5, K(t, [[57.6, 0], [58.0, 1]])) + spin;
    return { x, z, ry, sp: k > 0 && k < 1 ? 1.2 : spin > 0 && spin < 4 * PI ? 1.0 : 0, happy: t > DOGRUN };
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3();
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = 0.45;
    all.forEach((r) => (r.root.visible = false)); puffs.hide();
    dog.g.visible = false; phone.g.visible = false; party.visible = false; sweater.visible = false; conf.visible = false; chips.visible = false;
    shards.forEach((m) => (m.visible = false)); papers.forEach((m) => (m.visible = false));
    const cam = shot.cam;
    let camX = 0;

    if (cam === 'open') {
      street.aimSun(garyX(t), -1.2, 9); street.setSeason('spring', t, [garyX(t), -1.2]);
      [street.cart, street.trash, street.bench].forEach((o) => o && (o.visible = false));
      OPEN_PPL.forEach((_, i) => {
        const c = crowd[i], r = openPose(t, i);
        put(c, 'street', r.p, 1, SH, SH, 0, { sprout: sprout(t, i) }, t);
        poof(i * 3, 'street', r.x - 0.2, SH + 0.75, r.z, t, M1 + i * 0.03, 3, 0.3);
      });
      const g = garyOpen(t);
      put(gary, 'street', g.p, 1, SH, SH, wagAt(t, LIE1), { sprout: sprout(t, 4), rate: 5.2, lift: 0.25 * wagAt(t, LIE1) }, t);
      poof(45, 'street', g.x - 0.2, SH + 0.75, -0.8, t, M1 + 0.12, 3, 0.3);
      phone.g.visible = g.call > 0.3;
      camX = garyX(t);
    } else if (cam === 'cookie') {
      const kp = kidPose(t); put(kid, 'kit', kp, KS, 0, 0, wagAt(t, LIE2, 12.8), { rate: 5.5, lift: 0.15 }, t);
      kid.root.updateMatrixWorld(true);
      const mp = momPose(t); put(mom, 'kit', mp, 1, 0, 0, wagAt(t, LIE3 + 0.2), { rate: 5.0, lift: 0.2 }, t);
      const j = jarAt(t); jar.visible = j.vis;
      if (j.vis) { jar.position.set(j.x, j.y, j.z); jar.rotation.set(j.rx, 0, j.rz); }
      const age = t - HIT;
      if (age > 0) shards.forEach((m, k) => { const a = k * 1.05, sp = 0.7 + (k % 3) * 0.25, tt = Math.min(age, 0.45); m.visible = true; m.position.set(JAR0[0] + 0.55 + Math.cos(a) * sp * tt, Math.max(0.01, 0.05 + 1.6 * tt - 4.9 * tt * tt), JAR0[2] + 0.75 + Math.sin(a) * sp * tt * 0.7); m.rotation.set(tt * 9 + k, k, tt * 7); });
      poof(0, 'kit', JAR0[0] + 0.55, 0.05, JAR0[2] + 0.75, t, HIT, 5, 0.35, CRUMB);
      const fly = K(t, [[LAUNCH, 0], [LAUNCH + 0.55, 1]], (u) => 1 - (1 - u) * (1 - u));   // the chair behind Mom gets launched
      mChair.position.set(0.1 + 1.1 * fly, 0.45 * Math.sin(fly * PI), -1.65 - 0.2 * fly); mChair.rotation.set(0, 0.3 + 2.2 * fly, -1.45 * fly);
      poof(10, 'kit', 0.9, 0.1, -1.8, t, LAUNCH + 0.45, 4, 0.35, DUST);
      { // the family dog between them: happy tail, jumps at the crash, looks at the jar, then at Mom
        dog.g.visible = true; kit.root.add(dog.g); const jump = K(t, [[HIT, 0], [HIT + 0.12, 1], [HIT + 0.35, 0]]);
        dog.g.position.set(-0.85, 0.12 * jump, -1.45); dog.g.rotation.y = lerpAngle(lerpAngle(0.3, 1.9, K(t, [[HIT, 0], [HIT + 0.25, 1]])), -0.6, K(t, [[LAUNCH, 0], [LAUNCH + 0.3, 1]]));
        dog.update(t * 1.4, 0); dog.bark(K(t, [[HIT + 0.15, 0], [HIT + 0.25, 1], [HIT + 0.4, 0]]));
      }
    } else if (cam === 'hire') {
      const cp = candPose(t); put(cand, 'office', cp, 1, sitRoot(OD.seat) + 0.02, 0, wagAt(t, LIE4, SPIN1 + 0.2), { rate: 5.5, lift: 0.35, side: -1.25 }, t);
      const hp = hrPose(t); put(hr, 'office', hp, 1, sitRoot(OD.seat) + 0.02, 0, 0, {}, t);
      if (guestChair) guestChair.rotation.y = PI + spinAt(t);
      const age = t - SPIN0 - 0.3;
      papers.forEach((m, k) => { // a stack on the desk; blown into the air by the spinning tail
        const a = k * 0.7, rr = 0.3 + (k % 4) * 0.25, tt = clamp(age / 1.6);
        m.visible = true;
        if (age < 0) { m.position.set(0.35 + k * 0.005, OD.deskTop + 0.003 + k * 0.002, -0.75); m.rotation.set(-PI / 2, 0, 0.1 * k); return; }
        m.position.set(0.35 + Math.cos(a) * rr * tt * 1.4, OD.deskTop + 0.6 * Math.sin(tt * PI) + (1 - tt) * 0.01 + 0.4 * tt * (k % 3) * (1 - tt), -0.75 + Math.sin(a) * rr * tt);
        if (tt >= 1) m.position.y = 0.005 + k * 0.001;
        m.rotation.set(-PI / 2 + tt * (3 + k) * (tt < 1 ? 1 : 0), tt * k, tt * 4 * (tt < 1 ? 1 : 0));
      });
    } else if (cam === 'date') {
      rest.update(t); [rest.tables[4].g, ...rest.tables[4].chairs].forEach((o) => (o.visible = false));
      rest.tables.forEach((tb, k) => { if (k === 4) return; const [x, z] = TBL[k], dx = k ? RD.chairDx : DX0; tb.g.position.set(x, 0, z); tb.chairs[0].position.set(x - dx, 0, z); if (k) tb.chairs[1].position.set(x + dx, 0, z); });
      rest.tables[0].g.scale.set(0.78, 1, 0.85);
      const m = datePose(t, 'm'), w = datePose(t, 'w');
      put(dateM, 'rest', m.p, DM_S, m.rootY, 0, wagAt(t, LIE5, 27.4), { rate: 5.5, lift: 0.5 }, t); dateM.headG.scale.setScalar(1.12);
      put(dateW, 'rest', w.p, 1, w.rootY, 0, wagAt(t, ROOM + 0.25, 27.4) * 0.85, { rate: 4.6, lift: 0.5 }, t);
      const ch = rest.tables[0].chairs[1], fly = K(t, [[CHAIR, 0], [CHAIR + 0.45, 1]], (u) => 1 - (1 - u) * (1 - u));
      ch.rotation.order = 'YXZ'; ch.position.set(tx0 + DX0 + 0.75 * fly, 0.12 * Math.sin(fly * PI), tz0 - 0.15 * fly); ch.rotation.set(-1.35 * fly, -PI / 2, 0);
      poof(0, 'rest', tx0 + DX0 + 0.6, 0.05, tz0, t, CHAIR + 0.42, 4, 0.3, DUST);
      crowd.slice(0, 8).forEach((c, i) => { const r = dinerPose(t, i); if (r) put(c, 'rest', r.p, 1, sitRoot(RD.seat), 0, wagAt(t, ROOM + 0.03 * i, 27.4), { rate: 4.4 + (i % 3) * 0.4, lift: 0.5 }, t); });
    } else if (cam === 'bday') {
      sub.aimSun(1, -5.5, 8); sub.lights.sun.color.setHex(0xfff2dc); sub.lights.hemi.color.setHex(0xcfe3ff);
      party.visible = true;
      const famRigs = [grandma, crowd[11], gary, crowd[12], crowd[13]];
      famRigs.forEach((rig, i) => {
        const f = famPose(t, i), wag = f.gran ? 0 : wagAt(t, LIE6 + 0.05 * i, 32.4);
        put(rig, 'sub', f.p, 1, f.seated ? sitRoot(0.45) : 0, 0, wag, { rate: 5.0, lift: 0.3 * wag, still: f.gran }, t);
      });
      gary.root.updateMatrixWorld(true);
      sweater.visible = true; const gp = gary.root.position; sweater.position.set(gp.x - OFF.sub[0], 1.12, gp.z - OFF.sub[2] + 0.32); sweater.rotation.set(0, 0, 0.04 * Math.sin(t * 2));
      balloons.forEach((b, k) => { const pk = POP_ORDER.indexOf(k), pt = POPS[pk], u = (t - pt) / 0.07; b.visible = u < 1; b.scale.setScalar(u > 0 ? 1 + 0.3 * u : 1); b.rotation.z = 0.08 * Math.sin(t * 1.7 + k); b.position.y = BAL[k][1] + 0.03 * Math.sin(t * 1.3 + k * 2); });
      conf.visible = true;
      confSeeds.forEach((q, i) => { // each pop throws its share of confetti; it flutters down
        const k = POP_ORDER[i % 6], pt = POPS[i % 6], age = t - pt;
        const [bx, by, bz] = BAL[k];
        if (age < 0) { m4.makeScale(0, 0, 0); conf.setMatrixAt(i, m4); return; }
        const a = q[0] * 2 * PI, sp = 0.6 + q[1] * 1.2, x = bx + Math.cos(a) * sp * Math.min(age, 0.4) + 0.1 * Math.sin(t * 3 + i), z = bz + Math.sin(a) * sp * 0.5 * Math.min(age, 0.4);
        const y = Math.max(0.79, by + (q[2] - 0.3) * 0.8 * Math.min(age, 0.4) - 0.35 * Math.max(0, age - 0.3));
        v3.set(x + party.position.x, y, z + party.position.z); q4.setFromEuler(e3.set(t * (4 + q[3] * 6) + i, t * 3 + i, i)); m4.compose(v3, q4, s3); conf.setMatrixAt(i, m4);
      });
      conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
      POPS.forEach((pt, j) => { const [bx, by, bz] = BAL[POP_ORDER[j]]; poof(j * 4, 'sub', bx + party.position.x, by - 0.1, bz + party.position.z, t, pt, 3, 0.18, WHITE); });
    } else if (cam === 'lot') {
      lot.aimSun(0, 0, 8); lot.update(t);
      const tube = lot.tube; tube.position.set(1.4, 0, 0.1);
      const sp = salesPose(t);
      const rot = K(t, [[ROTOR - 0.2, 0], [ROTOR + 0.35, 1]]);
      put(sales, 'lot', sp.p, 1, sp.rootY, sp.ground, rot > 0.5 ? 0 : wagAt(t, LIE7), { rate: 6, lift: 1.05 * rot, curl: 0.08 * rot, spin: spinT(t), still: rot > 0.5 }, t);
      put(crowd[14], 'lot', buyerPose(t, 0), 1, 0, 0, 0, {}, t);
      const fall = K(t, [[BUMP, 0], [BUMP + 0.35, 1]], (u) => u * u);
      bumper.position.set(0, 0.42 - 0.32 * fall, 1.96 + 0.15 * fall); bumper.rotation.set(0.25 * fall, 0, 0.35 * fall);
      poof(0, 'lot', 0.2, 0.05, -1.6 + 2.1, t, BUMP + 0.33, 4, 0.3, DUST);
      if (t > LIFT - 0.2) for (let k = 0; k < 5; k++) { const age = ((t - LIFT + k * 0.3) % 1.5); const a = k * 1.3 + t; puffs.set(20 + k, W('lot', SALES[0] + Math.cos(a) * (0.3 + age), 0.1 + age * 0.15, SALES[1] + Math.sin(a) * (0.3 + age) * 0.6), 0.35 + age * 0.6, 0.55 * (1 - age / 1.5) * clamp((t - LIFT + 0.2) / 0.4), DUST); }
    } else if (cam === 'poker') {
      casino.update(t);
      const shake = K(t, [[WAG8 + 0.3, 0], [WAG8 + 0.5, 1], [43.6, 1], [44.0, 0]]);
      casino.table.position.set(0.012 * shake * Math.sin(t * 61), 0.008 * shake * Math.abs(Math.sin(t * 47)), 0.01 * shake * Math.sin(t * 53));
      for (let i = 0; i < CD.seats.length; i++) { const r = playerPose(t, i), rig = crowd[15 + i]; put(rig, 'casino', r.p, 1, sitRoot(CD.seat), 0, wagAt(t, WAG8 + i * 0.06), { rate: 4.6 + (i % 3) * 0.5, side: 0 }, t); }
      put(dealer, 'casino', dealerPose(t), 1, sitRoot(CD.seat) + 0.12, 0, 0, { still: true }, t);
      const push = K(t, [[ALLIN, 0], [ALLIN + 0.35, 1]]); const [px, pz] = seatAt(0); casino.stacks[0].position.set(-px * 0.4 * push, 0, -pz * 0.4 * push);
      const gone = t > BOOM; casino.pot.visible = !gone; casino.stacks.forEach((s) => (s.visible = !gone));
      chips.visible = gone;
      if (gone) { for (let i = 0; i < CH; i++) { const c = chipAt(i, t); if (!c) { m4.makeScale(0, 0, 0); chips.setMatrixAt(i, m4); continue; } v3.set(c.x, c.y, c.z); q4.setFromEuler(e3.set(c.rx, 0, c.rz)); m4.compose(v3, q4, s3); chips.setMatrixAt(i, m4); } chips.instanceMatrix.needsUpdate = true; if (chips.instanceColor) chips.instanceColor.needsUpdate = true; }
    } else if (cam === 'press') {
      press.setFlashes(t, t > QUIET ? 0.15 : t > WAG9 ? 5.0 : 1.6);
      put(prez, 'press', prezPose(t), 1, 0.25, 0.25, pressWag(t), { rate: 5.2, lift: 0.15 }, t);
      pFlags.forEach((g, k) => { const tf = k ? FL1 : FL0, f = K(t, [[tf, 0], [tf + 0.5, 1]], (u) => u * u); g.rotation.set(-0.15 * f, 0, (k ? -1 : 1) * 1.3 * f); });
      poof(0, 'press', -2.0, 0.3, -3.7, t, FL0 + 0.5, 4, 0.35, DUST); poof(5, 'press', 2.0, 0.3, -3.7, t, FL1 + 0.5, 4, 0.35, DUST);
    } else if (cam === 'court' || cam === 'court2') {
      const g = garyCourt(t); put(gary, 'court', g.p, 1, g.rootY, g.ground, wagAt(t, LIE10 + 0.1, 55.8), { rate: 5.5, lift: 0.2 }, t);
      put(pros, 'court', prosPose(t), 1, 0, 0, 0, { still: true }, t);
      put(lawyer, 'court', lawyerPose(t), 1, sitRoot(JD.seat), 0, 0, { side: 0.9 }, t);
      const j = judgePose(t); put(judge, 'court', j.p, 1, sitRoot(JD.judgeFloor + 0.62), JD.judgeFloor, 0, { still: true }, t);
      court.gavel.rotation.x = j.ready * (0.27 - 1.35 * j.sw);   // raised → slammed onto the sound block
      court.gavel.position.y = JD.benchTop + 0.14 + 0.12 * j.ready;
      // the gallery: two rows of onlookers who jump at the bang
      // the gallery behind Gary: onlookers who lean in at the question, gasp at the wag, jump at every bang
      const GAL = [[-1.15, 0], [-1.8, 0], [-2.45, 0], [-3.1, 0], [-0.95, 1], [-1.6, 1], [-2.25, 1], [-2.9, 1], [1.9, 0], [2.7, 0]];
      GAL.forEach(([x, row], i) => {
        const p = basePose(); p.eyes = blink(t, i); const z = JD.gallery[row] + 0.05;
        Object.assign(p, { x, z, rotY: PI, footFwd: 0.4 }); p.armA = LAP_A; p.armB = LAP_B;
        const lean = K(t, [[52.4 + i * 0.05, 0], [52.9, 1]]), look = K(t, [[LIE10 + 0.15 + i * 0.03, 0], [LIE10 + 0.4, 1]]);
        let jmp = 0; BANGS.forEach((b) => { jmp = Math.max(jmp, K(t, [[b, 0], [b + 0.08, 1], [b + 0.35, 0]])); });
        p.lean = 0.2 * lean - 0.1 * jmp; p.headYaw = look * (x < -1.57 ? 0.5 : -0.5) * (1 - K(t, [[BANGS[0], 0], [BANGS[0] + 0.2, 1]])); p.headPitch = 0.25 * look;
        p.mouth = look > 0.5 || t > BANGS[0] ? 'o' : 'flat';
        if (t > BANGS[0]) { p.armA = mixArm(LAP_A, SHOCK_A, 0.8); p.armB = mixArm(LAP_B, SHOCK_B, 0.8); }
        put(crowd[i], 'court', p, 1, sitRoot(JD.seat) + 0.07 * jmp, 0, 0, { side: i % 2 ? 0.9 : -0.9 }, t);
      });
    } else if (cam === 'end') {
      sub.aimSun(14, -6.5, 7); sub.lights.sun.color.setHex(0xffc890); sub.lights.hemi.color.setHex(0xffe6cc);
      const g = garyEnd(t); put(gary, 'sub', g.p, 1, g.rootY, 0, 0, { still: true }, t);
      const d = daughterEnd(t); put(daughter, 'sub', d.p, KS, d.rootY, 0, 0, { still: true }, t);
      const dg = dogEnd(t); dog.g.visible = true; sub.root.add(dog.g); dog.g.position.set(dg.x, 0, dg.z); dog.g.rotation.y = dg.ry; dog.update(dg.happy ? t * 1.8 : t * 0.35, dg.sp);
    }

    // camera (local → world)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P, Aim;
    if (c.pk) { P = [0, 1, 2].map((i) => K(t, c.pk.map(([tt, v]) => [tt, v[i]])) + o[i]); Aim = [0, 1, 2].map((i) => K(t, c.ak.map(([tt, v]) => [tt, v[i]])) + o[i]); }
    else { P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]); }
    if (cam === 'open') { const push = K(t, [[8.6, 0], [10.4, 1]]); P[0] += camX + 0.35; Aim[0] += camX + 0.1; P[2] -= 1.0 * push; Aim[1] += 0.05 * push; }
    if (c.y) P[1] = K(t, c.y) + o[1];
    if (c.ay) Aim[1] = K(t, c.ay) + o[1];
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(M1, 0.015); jolt(HIT, 0.015); jolt(LAUNCH + 0.5, 0.02); jolt(FLOOR5, 0.02); jolt(BOOM, 0.025); jolt(FL0 + 0.5, 0.02); jolt(FL1 + 0.5, 0.02); jolt(BUMP + 0.33, 0.015);
    BANGS.forEach((b) => jolt(b, 0.022)); POPS.forEach((pt) => jolt(pt, 0.006));
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
