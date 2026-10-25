// VIDEO 014 — "What if every adult woke up as a toddler?"  (tone: MONTAGE, funny; built to score high on TRIBE v2:
// bright places, crowds of big-headed faces, something moving in every frame, a steady mix — see tribe-experiment/).
// 69.5 s, 12 beats, NINE sets parked at offsets in one scene (one visible per shot), NEW set: engine/sets/playground.js.
// Toddlers = the normal rigs at root.scale 0.5 with the head group scaled ×1.35 (big heads); the same rig plays adult ↔ toddler
// in the shrink (beat 1) and the grow-back (beat 12). Everyone keeps their work clothes: tiny suits, ties, a wedding dress.
// Sources (checked Oct 2026):
//   ~132 M births / year → ~265 M toddlers (ages 1–2) — UN World Population Prospects 2024 (via statisticstimes.com)
//   a 2-year-old is ~86 cm / 34 in tall — WHO child growth standards (length-for-age, 24 months)
//   toddlers average 2,368 steps and 17 falls per hour — Adolph et al. 2012, Psychological Science 23(11)
//   ages 1–2 need 11–14 h of sleep a day incl. naps — AASM consensus (Paruthi et al. 2016)
//   a 2-year-old knows "fifty or more words" — AAP, healthychildren.org · 75% of tantrums last ≤ 5 min — Potegal et al. 2003
//   ~100,000 flights a day — FlightAware 2024 · ~1 billion dogs — Gompper (Oxford Univ. Press, 2014) · counters are 36 in (91 cm)
//
// v2 (TRIBE optimization pass, tribe-experiment/score.py): v1 scored whole-brain 0.077 (best posted video 0.045). The per-second
// curves sagged where nothing moved — kitchen 10–12 s, plane 37–42 s (motion network −0.19), wedding 41–43 s — so v2 adds motion
// there: Gary hops three times before the chair, the cabin turns + bounces in a traveling wave under a dolly, petals fall and a
// flower girl walks the aisle; two cars pass behind the title.
//
// Shot list (seconds)                       | set        | what happens
//  0.0– 9.2  open    MONDAY 7:00 AM         | suburb     | commuters walk toward us; at 5.2 EVERYONE shrinks to toddler size (boing + poof), looks at their hands, toddles on
//  9.2–14.6  coffee  +1 minute              | kitchen    | Gary pushes a chair to the counter, climbs, reaches for the coffee maker… the chair tips, he lands on his bottom
// 14.6–20.0  commute +10 minutes            | street     | toddlers in suits toddle to work past abandoned cars; at 17.7 they all fall down at once, get up, keep going
// 20.0–25.4  board   +1 hour                | office     | the CEO stands on the desk pointing at a chart; at 22.8 the whole board falls asleep; Z's float up
// 25.4–30.8  press   +2 hours               | podium     | the President on a stack of books, flash storm; "No." — arms crossed, head shake, stomp: the books collapse
// 30.8–36.2  market  +5 hours               | supermarket| time-lapse: everything below 3 ft vanishes, top shelves stay full; toddlers run off hugging snacks; SNACKS SOLD OUT
// 36.2–41.6  plane   +1 day                 | plane      | a cabin of toddlers; at 39.0 every passenger kicks the seat in front, the whole cabin rattles
// 41.6–47.0  wedding +2 days               | wedding    | toddler bride + groom; the groom throws a tantrum on the floor; then they both grab the cake: it topples
// 47.0–53.2  park    +3 days                | playground | time-lapse: a playground pops up downtown, toddlers in suits ride the carousel, seesaw, swings, spring riders
// 53.2–58.6  dogs    +1 week                | suburb     | toddlers sit in a row on the lawn; Gary escapes toward the street; the dog cuts him off; he walks back and sits
// 58.6–69.5  grow    DAY 8 7:00 AM          | suburb     | everyone grows back (boing + poof), stands, and puts a phone to their ear. End card at 65.0
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeDog, makePhone } from '@engine/props.js';
import { buildSuburb, DIMS as SUB, SW_H } from '@engine/sets/suburb.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { buildPlane, seatPos, DIMS as PL } from '@engine/sets/plane.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildPlayground, DIMS as PG } from '@engine/sets/playground.js';
import { makeCar } from '@engine/sets/city.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const TS = 0.5;                // toddler scale
const HEAD_T = 1.6;            // toddler head scale (big heads: a toddler's head is ~80% of an adult's)
const SIT = HIP_H - 0.17;      // pelvis-bottom offset (local units): sitting root = ground − s·SIT
const M1 = 5.2, M2 = 59.0;     // the shrink, the grow-back
const OFF = { sub: [0, 0, 0], kit: [2000, 0, 0], street: [4000, 0, 0], office: [6000, 0, 0], press: [8000, 0, 0], mkt: [10000, 0, 0],
  plane: [12000, 0, 0], wed: [14000, 0, 0], park: [16000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 9.2, cam: 'open', set: 'sub' },
  { t0: 9.2, t1: 14.6, cam: 'coffee', set: 'kit' },
  { t0: 14.6, t1: 20.0, cam: 'commute', set: 'street' },
  { t0: 20.0, t1: 25.4, cam: 'board', set: 'office' },
  { t0: 25.4, t1: 30.8, cam: 'press', set: 'press' },
  { t0: 30.8, t1: 36.2, cam: 'market', set: 'mkt' },
  { t0: 36.2, t1: 41.6, cam: 'plane', set: 'plane' },
  { t0: 41.6, t1: 47.0, cam: 'wedding', set: 'wed' },
  { t0: 47.0, t1: 53.2, cam: 'park', set: 'park' },
  { t0: 53.2, t1: 58.6, cam: 'dogs', set: 'sub' },
  { t0: 58.6, t1: 69.5, cam: 'grow', set: 'sub' },
];
// camera coords are LOCAL to the shot's set (two keys, eased); `y` / `ay` override the heights with keyframes when present
export const CAMS = {
  open:    { p: [[6.4, 1.6, -0.55], [5.6, 1.6, -0.6]], a: [[-6.0, 1.15, -1.15], [-6.0, 0.6, -1.15]], fov: 46, amp: 0.004,
             ay: [[0, 1.15], [M1, 1.1], [M1 + 1.2, 0.55]] },   // stays at ADULT eye level: after the shrink we look down at them
  coffee:  { p: [[-0.55, 1.05, 1.65], [-0.62, 1.0, 1.3]], a: [[-1.15, 0.85, -2.0], [-1.2, 0.88, -2.0]], fov: 56, amp: 0.004 },   // left of the table, behind Gary
  commute: { p: [[2.7, 1.05, -2.0], [2.1, 1.0, -2.0]], a: [[-7.0, 0.5, -1.2], [-7.0, 0.5, -1.2]], fov: 44, amp: 0.004 },
  board:   { p: [[1.25, 1.3, 2.0], [1.1, 1.25, 1.7]], a: [[0.0, 0.8, -0.9], [0.0, 0.8, -0.9]], fov: 54, amp: 0.004 },
  press:   { p: [[0.3, 1.5, 0.9], [0.25, 1.5, 0.55]], a: [[0.0, 1.38, -3.0], [0.0, 1.36, -3.0]], fov: 32, amp: 0.004 },   // tight: a tiny head over the lectern
  market:  { p: [[0.0, 1.05, 3.4], [0.0, 1.0, 2.5]], a: [[0.0, 0.7, -8.0], [0.0, 0.7, -8.0]], fov: 52, amp: 0.004 },
  plane:   { p: [[0.0, 1.45, -7.6], [0.0, 1.38, -6.7]], a: [[0.0, 1.05, 1.0], [0.0, 1.0, 1.0]], fov: 56, amp: 0.004 },   // from the back, dollying up the aisle: faces over every seat back
  wedding: { p: [[0.38, 1.3, 1.05], [0.35, 1.2, 0.3]], a: [[0.35, 0.7, -3.3], [0.35, 0.7, -3.3]], fov: 60, amp: 0.004 },
  park:    { p: [[0.3, 2.1, 6.4], [0.2, 1.75, 5.2]], a: [[0.2, 0.75, -3.5], [0.2, 0.7, -3.5]], fov: 58, amp: 0.004 },
  dogs:    { p: [[0.45, 0.95, -0.3], [0.35, 0.9, -0.6]], a: [[0.1, 0.42, -4.6], [0.1, 0.42, -4.6]], fov: 56, amp: 0.004 },
  grow:    { p: [[0.9, 0.95, -0.3], [0.8, 1.5, 1.6]], a: [[0.35, 0.55, -4.6], [0.35, 1.1, -4.6]], fov: 56, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const HANDS_A = A(-1.05, 0.12, -1.25, 0.55), HANDS_B = A(-1.05, 0.12, -1.25, -0.55);     // looking at your own (tiny) hands
const REACH_B = A(-2.85, 0.12, -0.1, 0);                                                // reaching straight up
const PUSH_A = A(-1.3, 0.05, -0.3, 0.2), PUSH_B = A(-1.3, 0.05, -0.3, -0.2);             // pushing a chair
const POINT_B = A(-1.6, 0.12, -0.08, 0);
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);     // arms crossed ("No.")
const TALK_B = A(-0.85, 0.35, -1.15, -0.35);
const CAM_A = A(-1.15, 0.12, -2.05, 0.65), CAM_B = A(-1.15, 0.12, -2.05, -0.65);         // a camera to the face
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);         // hugging snacks
const RIDE_A = A(-1.0, 0.12, -0.85, 0.35), RIDE_B = A(-1.0, 0.12, -0.85, -0.35);         // holding handles
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);                                            // phone to the right ear (002)
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const flail = (t, s, ph = 0) => A(-1.6 + 1.2 * Math.sin(t * 15 + ph), 0.5 + 0.3 * Math.sin(t * 11 + ph), -0.4, s * 0.2);   // tantrum arms
const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 1.5) * Math.exp(-u * 3.2) * (1 - u));   // 0→1 with a springy overshoot

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const SUITS = [0x2f3a4a, 0x4a4f57, 0x6a6f78, 0x2a2a2e, 0x34466a, 0x5a4a3e];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const TIES = [0xc0392b, 0x2f6aa8, 0xf2b632, 0x58b368, 0x8e44ad];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const sub = buildSuburb(studio, {}); sub.root.position.set(...OFF.sub);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(7, 1);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const guestChair = office.root.children.find((c) => c.isGroup && Math.abs(c.position.z - OD.guest[1]) < 0.01 && Math.abs(c.position.x - OD.guest[0]) < 0.01);
  if (guestChair) guestChair.visible = false;   // it filled the lens; the board sits on the floor there instead
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const plane = buildPlane(studio, {}); plane.root.position.set(...OFF.plane);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const stand = wed.root.children.find((o) => o.isMesh && Math.abs(o.position.z - (WD.officiant[1] + 0.45)) < 0.01 && Math.abs(o.position.x - WD.officiant[0]) < 0.01);
  if (stand) stand.visible = false;   // the officiant's lectern is taller than a toddler and blocked the couple
  const park = buildPlayground(studio, { banner: 'NOW A PLAYGROUND' }); park.root.position.set(...OFF.park);
  const ROOTS = { sub: sub.root, kit: kit.root, street: street.root, office: office.root, press: press.root, mkt: mkt.root, plane: plane.root, wed: wed.root, park: park.root };
  const FOGS = { sub: sub.fog, street: streetFog, wed: wed.fog, park: park.fog, kit: null, office: null, press: null, mkt: null, plane: null };
  const FAR = { sub: 400, street: 400, wed: 300, park: 420, kit: 40, office: 60, press: 60, mkt: 80, plane: 40 };

  // ---------------------------------------------------------------- cast
  const R = rng(14);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); scene.add(p.root); all.push(p); return p; };
  const withTie = (p, c) => { const tie = mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(c, 0.5), p.spine, 0, 0.42, 0.135); tie.rotation.x = -0.12; return p; };
  const crowd = Array.from({ length: 22 }, (_, i) => {
    const suit = i % 5 !== 4, style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: suit ? pick(SUITS) : pick(CASUAL), collar: suit ? 0xf4f4f2 : undefined, pants: pick(PANTS),
      hair: pick(HAIRS), hairStyle: style, glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.2 ? pick(HAIRS.slice(0, 3)) : null });
    if (suit) withTie(p, pick(TIES));
    p.seed = R(); p.seed2 = R(); return p;
  });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const prez = withTie(person({ skin: 0xf0c8a8, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0xc9c4be, hairStyle: 'short' }), 0xc0392b);
  const ceo = withTie(person({ skin: 0xd9a37f, top: 0x2a2a2e, collar: 0xf4f4f2, pants: 0x2a2a2e, hair: 0x1a1a1a, hairStyle: 'short', glasses: true }), 0xf2b632);
  const groom = person({ skin: 0xc98e6a, top: 0xb8bcc2, collar: 0xf4f4f2, pants: 0xb8bcc2, hair: 0x1a1a1a, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.06, 0.05, 0.02), mat(0x2f4f73, 0.5), groom.spine, 0, 0.5, 0.14);   // bow tie
  const bride = person({ skin: 0xf1c3a1, top: 0xfbf8f2, pants: 0xfbf8f2, hair: 0x5a3a24, hairStyle: 'bob', dress: 0xfbf8f2 });
  const veil = mk(new THREE.ConeGeometry(0.2, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), bride.head.g, 0, 0.0, -0.08); veil.rotation.x = 0.25;
  const officiant = person({ skin: 0x9a6447, top: 0x2a2a2a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const dog = makeDog(); scene.add(dog.g);
  const crowdP = [...crowd, ...Array.from({ length: 14 }, () => { const style = pick(STYLES); const p = person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style }); p.seed = R(); return p; })];   // the plane needs more passengers
  const puffs = makeSpritePool(scene, 40, 'smoke');
  const puffCol = new THREE.Color(0xffffff);

  // phones for the finale (in every right hand, hidden until then)
  const phones = new Map();
  [...crowd, gary].forEach((p) => { const ph = makePhone(); p.arms.find((a) => a.s === 1).hand.add(ph.g); ph.g.position.set(0, -0.04, 0.03); ph.g.rotation.set(PI / 2, 0, 0); ph.g.visible = false; phones.set(p, ph.g); });
  // snack stacks (market) and briefcases (open)
  const SNACK = [0xd2483f, 0xf2b632, 0x3d7bd9, 0x58b368, 0xe58fa6, 0xf08a4b];
  const stacks = crowd.map((p, i) => { const g = new THREE.Group(); for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(0.26, 0.14, 0.12), mat(SNACK[(i + k) % 6], 0.6), g, (k % 2) * 0.02, k * 0.145, 0); p.spine.add(g); g.position.set(0, 0.12, 0.25); g.visible = false; return g; });
  const cases = crowd.map((p) => { const g = mk(new THREE.BoxGeometry(0.34, 0.25, 0.08), mat(0x5a3a24, 0.6), p.arms.find((a) => a.s === -1).hand, 0, -0.16, 0); g.visible = false; return g; });

  // ---------------------------------------------------------------- set dressing per beat
  // plane: a lit front bulkhead (the far end of the cabin rendered as a black void) with a seatbelt sign
  const bulkT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#e9e4da'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d1c4'; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = '#2a3a4a'; g.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.1); g.fillStyle = '#f2c14e'; g.font = 'bold 24px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FASTEN SEATBELT', w / 2, h * 0.17); g.fillStyle = '#9fb6d6'; g.fillRect(w * 0.08, h * 0.3, w * 0.22, h * 0.42); g.fillRect(w * 0.7, h * 0.3, w * 0.22, h * 0.42); });
  const bulk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.3), new THREE.MeshBasicMaterial({ map: bulkT })); bulk.position.set(0, 1.12, 0.95); bulk.rotation.y = PI; plane.root.add(bulk);
  // kitchen: the chair Gary pushes (we move kitchen chair #2 ourselves)
  const kChair = kit.chairs[2]; kChair.rotation.order = 'YXZ';   // yaw first, then the backward tip
  // suburb: two cars passing on the road during the opening
  const subCars = [makeCar(0xd2483f, 7), makeCar(0x4fb3a8, 9)]; subCars.forEach((c) => sub.root.add(c.g));
  // street: two abandoned cars in the road, doors… nobody can reach the pedals
  const cars = [makeCar(0x3d7bd9, 3), makeCar(0xf1c24a, 5)];
  cars.forEach((c, i) => { street.root.add(c.g ?? c); const g = c.g ?? c; g.position.set(-2.5 - i * 5.5, 0, 1.6 + i * 2.2); g.rotation.y = PI / 2 + (i ? -0.25 : 0.18); });
  // office: a flip chart with a big arrow
  const chartT = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f6aa8'; g.lineWidth = 10; g.beginPath(); g.moveTo(30, 260); g.lineTo(90, 200); g.lineTo(140, 230); g.lineTo(220, 90); g.stroke(); g.fillStyle = '#2f6aa8'; g.beginPath(); g.moveTo(232, 70); g.lineTo(190, 92); g.lineTo(230, 120); g.fill(); g.fillStyle = '#d23a3f'; g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('SNACKS', w / 2, 52); });
  const chart = new THREE.Group(); office.root.add(chart); chart.position.set(-0.95, 0, -1.35); chart.rotation.y = 0.35;
  mk(new THREE.PlaneGeometry(0.75, 0.95), new THREE.MeshStandardMaterial({ map: chartT, roughness: 0.8 }), chart, 0, 1.25, 0.02);
  for (const s of [-1, 1]) { const l = mk(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 6), mat(0x3a3d42, 0.5), chart, s * 0.33, 0.85, 0); l.rotation.z = s * 0.08; }
  // office + finale: "Z" sprites
  const zTex = canvasTex(128, 128, (g, w, h) => { g.font = 'bold 104px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = 'rgba(30,40,70,.85)'; g.strokeText('Z', w / 2, h / 2); g.fillStyle = '#ffffff'; g.fillText('Z', w / 2, h / 2); });
  const zs = Array.from({ length: 12 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false })); s.visible = false; office.root.add(s); return s; });
  // press: a stack of books for the President to stand on
  const books = []; const BOOKC = [0x8a2e2e, 0x2f4f73, 0x3f6a3a, 0x6a3a5a, 0xb5762e];
  for (let k = 0; k < 7; k++) { const b = mk(new THREE.BoxGeometry(0.42, 0.11, 0.3), mat(BOOKC[k % 5], 0.7), press.root, 0, 0, 0); books.push(b); }
  const BOOK_Y = 0.25, BOOK_H = 0.77;
  // wedding: a big three-tier cake on its own table, next to the couple (it topples)
  const cakeT = new THREE.Group(); wed.root.add(cakeT); cakeT.position.set(1.25, 0, -3.05);
  const cakeW = mat(0xfbf6ee, 0.6);
  mk(new THREE.BoxGeometry(0.9, 0.05, 0.6), mat(0xffffff, 0.7), cakeT, 0, 0.6, 0); for (const [a, b] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) mk(new THREE.BoxGeometry(0.04, 0.6, 0.04), mat(0xffffff, 0.7), cakeT, a, 0.3, b);
  const cake = new THREE.Group(); cake.position.set(0.25, 0.625, 0); cakeT.add(cake);   // pivot at the table's right edge
  [[0.26, 0.2], [0.2, 0.18], [0.14, 0.16]].forEach(([r, h], i) => { const y = [0, 0.2, 0.38][i]; mk(new THREE.CylinderGeometry(r, r, h, 24), cakeW, cake, -0.25, y + h / 2, 0); mk(new THREE.TorusGeometry(r, 0.018, 6, 24), mat(0xf4c6d6, 0.6), cake, -0.25, y + h, 0).rotation.x = PI / 2; });
  for (let k = 0; k < 6; k++) mk(new THREE.SphereGeometry(0.03, 8, 6), mat(0xd2483f, 0.5), cake, -0.25 + Math.cos(k) * 0.07, 0.56, Math.sin(k) * 0.07);

  // wedding petals (instanced, falling through the frame the whole beat)
  const PET = 140, petals = new THREE.InstancedMesh(new THREE.CircleGeometry(0.03, 6), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 }), PET);
  petals.frustumCulled = false; wed.root.add(petals);
  const PR = rng(41), petSeeds = Array.from({ length: PET }, () => [PR(), PR(), PR(), PR()]);
  petSeeds.forEach((q, i) => petals.setColorAt(i, new THREE.Color([0xf4c6d6, 0xffffff, 0xe58fa6, 0xf2d6a0][i % 4])));
  const basket = new THREE.Group(); mk(new THREE.CylinderGeometry(0.09, 0.06, 0.08, 12), mat(0xc9a066, 0.8), basket, 0, 0, 0);
  for (let k = 0; k < 6; k++) mk(new THREE.SphereGeometry(0.025, 6, 5), mat([0xf4c6d6, 0xe58fa6, 0xffffff][k % 3], 0.6), basket, Math.cos(k) * 0.05, 0.045, Math.sin(k) * 0.05);
  basket.visible = false;

  // ---------------------------------------------------------------- helpers
  /** pose a (possibly scaled) person: (x,z) local to the set, rootY/groundY in local meters, s = body scale. */
  function put(rig, key, p, s = TS, rootY = 0, groundY = rootY) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    p.y = 0; p.floor = (groundY - rootY) / s;
    applyPose(rig, p);
    rig.root.scale.setScalar(s);
    rig.headG.scale.setScalar(lerp(HEAD_T, 1, clamp((s - TS) / (1 - TS))));
    rig.root.position.y = rootY + OFF[key][1];
    rig.root.visible = true;
  }
  const sitRoot = (groundY, s = TS) => groundY - s * SIT;
  const sizeAt = (t, m, dir, i = 0) => { // dir −1 = shrink (1 → 0.5), +1 = grow (0.5 → 1), with a springy overshoot
    const u = clamp((t - m - i * 0.03) / 0.5), b = boing(u);
    return dir < 0 ? lerp(1, TS, b) : lerp(TS, 1, b);
  };
  const puff = (base, key, x, y, z, t, m, i, h = 0.6) => { // a soft white poof around a person at the moment m
    const age = t - m - i * 0.03; if (age < 0 || age > 0.55) return;
    for (let k = 0; k < 3; k++) { const a = i * 2.1 + k * 2.1, r = 0.12 + age * 0.5; puffs.set(base + k, new THREE.Vector3(x + OFF[key][0] + Math.cos(a) * r, y + h * (0.35 + 0.35 * k) + age * 0.25, z + OFF[key][2] + Math.sin(a) * r * 0.6), 0.55 + age * 0.9, 0.9 * (1 - age / 0.55) ** 1.5, puffCol); }
  };
  const walk = (p, dist, speed, s) => { p.dist = dist / s; p.speed = speed / s; };

  // ---------------------------------------------------------------- performances
  // 1. open — commuters walk toward the camera (+x) on the near sidewalk; shrink at M1
  function openPose(t, i) {
    if (i >= 10) return null;
    const lane = [-0.45, -1.0, -1.5][i % 3], x0 = -12.2 + i * 0.85 + (i % 2) * 0.3;
    const vA = 1.15, vT = 0.5, d = vA * Math.min(t, M1) + vT * Math.max(0, t - M1 - 0.2);
    const s = sizeAt(t, M1, -1, i), p = basePose(); p.eyes = blink(t, i);
    walk(p, d, t < M1 ? vA : t < M1 + 1.0 ? 0 : vT, s);
    Object.assign(p, { x: x0 + d, z: lane, rotY: PI / 2, waddle: t > M1 + 1.0 ? 0.65 : 0, lean: t > M1 + 1.0 ? -0.05 : 0 });
    const look = K(t, [[M1 + 0.5 + i * 0.03, 0], [M1 + 0.8, 1], [M1 + 1.6, 1], [M1 + 1.9, 0]]);
    p.headPitch = 0.65 * look; p.armA = mixArm(i % 4 === 0 ? REST : REST, HANDS_A, look); p.armB = mixArm(REST, HANDS_B, look);
    p.mouth = t > M1 + 0.2 && t < M1 + 2.4 ? 'o' : 'smile';
    return { p, s, rootY: SW_H, x: x0 + d, z: lane };
  }
  // 2. coffee — Gary pushes the chair, climbs, reaches, tips, sits on the floor
  const C0 = [-0.8, -1.55], C1 = [-1.3, -1.92];       // chair path (local): starts right of the camera→Gary sightline
  const HOP = [-1.5, -2.0], BEHIND = [-0.46, -1.3];   // hopping spot at the counter; the spot behind the chair
  function coffee(t) {
    const push = K(t, [[10.68, 0], [11.1, 1]]), climb = K(t, [[11.15, 0], [11.8, 1]]), tip = K(t, [[12.75, 0], [13.1, 1]], (u) => u * u);
    const cx = lerp(C0[0], C1[0], push), cz = lerp(C0[1], C1[1], push), dir = Math.atan2(C1[0] - C0[0], C1[1] - C0[1]);
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    let x = cx - Math.sin(dir) * 0.42, z = cz - Math.cos(dir) * 0.42, rootY = 0, ground = 0;
    if (t < 10.68) { // hop, hop, hop (reaching for the coffee maker) → give up → toddle to the chair
      const go = K(t, [[10.05, 0], [10.65, 1]], (u) => u);
      x = lerp(HOP[0], BEHIND[0], go); z = lerp(HOP[1], BEHIND[1], go);
      const hopU = t > 9.3 && t < 10.11 ? Math.abs(Math.sin(((t - 9.3) / 0.27) * PI)) : 0;
      rootY = 0.13 * hopU; ground = rootY;
      p.rotY = go > 0 ? lerpAngle(PI, Math.atan2(BEHIND[0] - HOP[0], BEHIND[1] - HOP[1]), Math.min(1, go * 3)) : PI;
      if (go > 0.85) p.rotY = lerpAngle(p.rotY, dir, (go - 0.85) / 0.15);
      walk(p, go * 1.25, go > 0.02 && go < 0.98 ? 1.2 : 0, TS);
      const up = 1 - K(t, [[10.0, 0], [10.2, 1]]);
      p.armA = mixArm(REST, A(-2.7, 0.2, -0.2, 0.2), up); p.armB = mixArm(REST, REACH_B, up); p.headPitch = -0.45 * up;
      p.waddle = go > 0.02 && go < 0.98 ? 0.6 : 0;
      p.x = x; p.z = z;
      return { p, rootY, ground, chair: { x: C0[0], z: C0[1], dir, tip: 0 } };
    }
    walk(p, 1.25 + push * 0.62, push > 0.02 && push < 0.98 ? 1.3 : 0, TS);
    p.rotY = dir; p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.25 * (1 - climb);
    if (climb > 0) { x = lerp(x, cx, climb); z = lerp(z, cz, climb); rootY = 0.47 * climb + 0.12 * Math.sin(climb * PI); ground = rootY; p.rotY = lerpAngle(dir, PI, climb); p.armA = mixArm(PUSH_A, REST, climb); }
    const reach = K(t, [[11.85, 0], [12.15, 1]]);
    if (reach > 0) { p.armB = mixArm(REST, REACH_B, reach); p.armB.sx += 0.06 * Math.sin(t * 13) * reach; p.headPitch = -0.45 * reach; p.armA = mixArm(REST, A(-0.4, 0.5, -0.3, 0.3), reach); }
    if (tip > 0) { // falls backward onto his bottom
      const sitY = sitRoot(0) - 0.07, b = K(t, [[13.1, 0], [13.25, 1], [13.45, 0]]);
      rootY = lerp(0.47, sitY, tip) + 0.05 * b; ground = 0; z = lerp(cz, cz + 0.45, tip); p.footFwd = 0.4 * tip; p.lean = -0.3 * tip + 0.15 * b;
      p.armA = mixArm(p.armA, A(-0.3, 0.55, -0.3, 0.3), tip); p.armB = mixArm(p.armB, A(-0.3, 0.55, -0.3, -0.3), tip); p.headPitch = lerp(-0.45, 0.1, tip);
      p.mouth = 'o';
    }
    const stare = K(t, [[13.7, 0], [14.0, 1]]);
    if (stare > 0) { p.rotY = lerpAngle(PI, faceToward(x, z, -0.6, 1.6), stare); p.mouth = 'flat'; p.headPitch = -0.1; }
    p.x = x; p.z = z;
    return { p, rootY, ground, chair: { x: cx, z: cz, dir, tip } };
  }
  // 3. commute — two columns of toddlers in suits toddle toward the camera, fall at once, get up
  const FALL = 17.75;
  function commutePose(t, i) {
    if (i >= 12) return null;
    const lane = i % 2 ? -1.0 : -1.65, x0 = -8.5 + Math.floor(i / 2) * 1.05 + (i % 2) * 0.4, v = 0.52;
    const down = K(t, [[FALL + i * 0.012, 0], [FALL + 0.2 + i * 0.012, 1], [18.9 + i * 0.012, 1], [19.35 + i * 0.012, 0]], (u) => u * u);
    const moving = down < 0.02 && t < FALL + 0.1 ? 1 : t > 19.4 ? 1 : 0;
    const d = v * (Math.min(t, FALL) - 14.6) + v * Math.max(0, t - 19.4);
    const p = basePose(); p.eyes = blink(t, i + 3); walk(p, d, v * moving, TS);
    const x = x0 + d;
    Object.assign(p, { x, z: lane, rotY: PI / 2, waddle: 0.7 * moving, lean: -0.05 + 0.1 * down, footFwd: 0.4 * down });
    p.armA = mixArm(i % 3 === 0 ? REST : REST, A(-0.35, 0.6, -0.3, 0.3), down); p.armB = mixArm(REST, A(-0.35, 0.6, -0.3, -0.3), down);
    p.mouth = down > 0.3 ? 'o' : 'flat'; p.headPitch = -0.1 * down;
    cases[i].visible = i % 3 === 1;
    return { p, rootY: lerp(SH, sitRoot(SH), down) + 0.04 * Math.sin(down * PI), ground: SH };
  }
  function carKid(t) { // one toddler in the road at the open door of a car, reaching up for the handle, giving up
    const p = basePose(); p.eyes = blink(t, 7);
    Object.assign(p, { x: -2.15, z: 0.62, rotY: PI - 0.15 });
    const r = K(t, [[15.0, 0], [15.4, 1], [16.6, 1], [16.9, 0]]);
    p.armB = mixArm(REST, REACH_B, r); p.armB.sx += 0.08 * Math.sin(t * 12) * r; p.headPitch = -0.5 * r;
    p.headYaw = K(t, [[17.0, 0], [17.4, -0.9]]); p.mouth = t > 17.0 ? 'flat' : 'o';
    return p;
  }
  // 4. board — the CEO on the desk, the board on the floor; at 22.8 everyone naps
  const NAP = 22.8;
  function ceoPose(t) {
    const p = basePose(); p.eyes = blink(t, 4);
    const sit = K(t, [[NAP, 0], [NAP + 0.5, 1]]), slump = K(t, [[NAP + 0.5, 0], [NAP + 1.2, 1]]);
    Object.assign(p, { x: 0.15, z: -0.95, rotY: 0.25, footFwd: 0.4 * sit, lean: 0.75 * slump });
    p.armB = mixArm(mixArm(POINT_B, TALK_B, 0.5 + 0.5 * Math.sin(t * 3)), REST, sit); p.armB.sx += 0.15 * Math.sin(t * 6) * (1 - sit);
    p.headYaw = (1 - sit) * (0.5 + 0.25 * Math.sin(t * 1.3)); p.headPitch = 0.55 * slump;
    p.mouth = sit > 0.5 ? 'flat' : Math.sin(t * 10) > 0 ? 'o' : 'flat'; if (slump > 0.5) p.eyes = 'closed';
    return { p, rootY: lerp(KDESK, sitRoot(KDESK), sit), ground: KDESK };
  }
  const KDESK = OD.deskTop;
  function boardPose(t, i) {
    if (i >= 6) return null;
    const spots = [[-0.8, -0.2, 2.6], [-0.3, 0.0, 3.0], [0.3, 0.05, 3.3], [0.85, -0.15, 3.7], [-1.15, -0.55, 2.3], [1.2, -0.5, 4.0]];
    const [x, z, ry] = spots[i], p = basePose(); p.eyes = blink(t, i);
    const slump = K(t, [[NAP + 0.15 + i * 0.07, 0], [NAP + 0.75 + i * 0.07, 1]]);
    Object.assign(p, { x, z, rotY: ry, footFwd: 0.4, lean: 0.85 * slump });
    p.headPitch = lerp(-0.35, 0.65, slump); p.headRoll = 0.25 * slump * (i % 2 ? 1 : -1);
    p.armA = mixArm(A(-0.55, 0.1, -1.0, 0.4), A(-0.9, 0.05, -1.7, 0.6), slump); p.armB = mixArm(A(-0.55, 0.1, -1.0, -0.4), A(-0.9, 0.05, -1.7, -0.6), slump);
    if (slump > 0.5) p.eyes = 'closed'; p.mouth = slump > 0.5 ? 'o' : 'flat';
    return { p, x, z };
  }
  // 5. press — the President on a stack of books; "No."; stomp; the stack collapses
  const NO = 28.4, STOMP = 29.55;
  function prezPose(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    const [sx, sz] = PD.speaker, cross = K(t, [[NO, 0], [NO + 0.25, 1]]), fall = K(t, [[STOMP + 0.1, 0], [STOMP + 0.45, 1]], (u) => u * u);
    Object.assign(p, { x: sx, z: sz + 0.05, rotY: 0 });
    p.armB = mixArm(TALK_B, CROSS_B, cross); p.armA = mixArm(A(-0.35, 0.12, -0.6, 0.3), CROSS_A, cross);
    if (cross < 0.5) p.armB.sx += 0.18 * Math.sin(t * 5);
    p.headYaw = cross * 0.45 * Math.sin((t - NO) * 9) * K(t, [[NO, 0], [NO + 0.2, 1], [NO + 1.0, 1], [NO + 1.2, 0]]);
    p.mouth = t < NO ? (Math.sin(t * 11) > 0 ? 'o' : 'flat') : t < NO + 0.4 ? 'o' : 'flat';
    const stomp = K(t, [[STOMP - 0.3, 0], [STOMP - 0.1, 1], [STOMP, 0]]); p.footFwd = 0; p.crouch = 0.05 * stomp;
    p.mouth = fall > 0 ? 'o' : p.mouth;
    return { p, rootY: lerp(BOOK_Y + BOOK_H, BOOK_Y, fall) + 0.04 * stomp, ground: lerp(BOOK_Y + BOOK_H, BOOK_Y, fall) };
  }
  function reporterPose(t, i) {
    if (i >= 10) return null;
    const SIDE = [[-2.6, 0.6], [-1.8, 0.6], [-2.6, 1.5], [-1.8, 1.5], [2.6, 0.6], [1.8, 0.6], [2.6, 1.5], [1.8, 1.5], [-1.0, 0.6], [1.0, 0.6]];
    const [x, z] = SIDE[i], p = basePose(); p.eyes = blink(t, i + 1);
    Object.assign(p, { x, z: z + 0.05, rotY: PI + faceToward(x, z, 0, -3.1) - PI, footFwd: 0.42 });
    p.rotY = faceToward(x, z, PD.speaker[0], PD.speaker[1]);
    p.armA = CAM_A; p.armB = CAM_B; p.headPitch = -0.15;
    if (t > NO) { const jolt = K(t, [[NO, 0], [NO + 0.15, 1], [NO + 0.6, 0]]); p.lean = -0.15 * jolt; }
    return { p, rootY: sitRoot(0.45), ground: 0 };
  }
  // 6. market — toddlers grab low snacks and run toward the camera in loops; low shelves empty, high ones stay full
  function shopperPose(t, i) {
    if (i >= 12) return null;
    const lane = [-0.85, -0.3, 0.3, 0.85][i % 4], v = 1.25 + (i % 3) * 0.25, L = 9.6;
    const z = -8.5 + ((((v * (t - 30.8) + i * 2.3) % L) + L) % L);
    const p = basePose(); p.eyes = blink(t, i);
    walk(p, v * t, v, TS);
    Object.assign(p, { x: lane, z, rotY: 0, lean: 0.12 });
    p.armA = HUG_A; p.armB = HUG_B; p.headPitch = -0.1; p.mouth = 'o';
    return { p, z };
  }
  function grabberPose(t, i) { // crouching at the shelf, sweeping the bottom shelf into their arms
    if (i >= 4) return null;
    const x = i % 2 ? 1.25 : -1.25, z = -2.0 - i * 1.6, p = basePose(); p.eyes = blink(t, i + 5);
    Object.assign(p, { x, z, rotY: i % 2 ? PI / 2 : -PI / 2, crouch: 0.22, lean: 0.35 });
    p.armA = A(-1.2 + 0.4 * Math.sin(t * 7 + i), 0.15, -0.4, 0.3); p.armB = A(-1.2 + 0.4 * Math.sin(t * 7 + i + 2), 0.15, -0.4, -0.3);
    p.mouth = 'o';
    return p;
  }
  // 7. plane — every passenger stands on their seat, turns around, and stares over the seat back at the row behind (the camera)
  const KICK = 39.0;
  const PSEATS = [];
  for (let r = 1; r <= 7; r++) for (let c = 0; c < 6; c++) if ((r * 7 + c * 3) % 5 !== 0) PSEATS.push([r, c]);
  function passengerPose(t, i) {
    if (i >= PSEATS.length) return null;
    const [r, c] = PSEATS[i], sp = seatPos(r, c), p = basePose(); p.eyes = blink(t, i);
    const t0 = 36.35 + (r - 1) * 0.17 + (c % 3) * 0.04;                       // the whole cabin turns around in a wave toward us
    const turn = K(t, [[t0, 0], [t0 + 0.35, 1]]);
    const on = K(t, [[37.7, 0], [38.0, 1]]), bounce = on * Math.max(0, Math.sin((t - 37.7) * 9 - r * 0.85));   // a bounce wave rolling toward the camera
    Object.assign(p, { x: sp.x, z: sp.z + 0.06, rotY: lerpAngle(0.4 * (c < 3 ? 1 : -1), PI, turn) });
    const slap = 0.35 * bounce;
    p.armA = A(-1.45 - slap, 0.12, -0.55, 0.3); p.armB = A(-1.45 - slap, 0.12, -0.55, -0.3);   // hands on the seat back, slapping it
    p.headYaw = 0.25 * Math.sin(t * 0.7 + i) * (1 - on); p.headPitch = -0.08 - 0.1 * bounce; p.mouth = bounce > 0.5 ? 'o' : 'flat';
    return { p, rootY: PL.seatY + 0.08 * bounce, ground: PL.seatY + 0.08 * bounce };
  }
  // 8. wedding — tantrum, then cake
  const TANTRUM = 44.4, CAKE = 45.75;
  function couplePose(t, who) {
    const bride_ = who === 'bride', [x0, z0] = bride_ ? WD.bride : WD.groom, p = basePose(); p.eyes = blink(t, bride_ ? 3 : 6);
    let x = x0, z = z0 + 0.1, rootY = 0, rotY = bride_ ? -PI / 2 + 0.6 : PI / 2 - 0.6;
    p.mouth = 'smile';
    if (!bride_) { // the groom flops down and flails
      const flop = K(t, [[TANTRUM, 0], [TANTRUM + 0.25, 1], [CAKE - 0.4, 1], [CAKE - 0.1, 0]]);
      rootY = lerp(0, sitRoot(0), flop); p.footFwd = 0.4 * flop + 0.15 * flop * Math.sin(t * 17); p.lean = -0.25 * flop;
      p.armA = mixArm(REST, flail(t, -1), flop); p.armB = mixArm(REST, flail(t, 1, 1.3), flop); p.mouth = flop > 0.3 ? 'o' : 'smile';
      p.headRoll = 0.3 * flop * Math.sin(t * 9); p.eyes = flop > 0.3 ? 'closed' : p.eyes;
      if (flop > 0.3) rotY = PI / 2 - 0.2;
    } else {
      const shrug = K(t, [[TANTRUM + 0.4, 0], [TANTRUM + 0.7, 1], [CAKE - 0.4, 1], [CAKE - 0.2, 0]]);
      p.armA = mixArm(REST, CROSS_A, shrug); p.armB = mixArm(A(-0.8, 0.0, -1.2, -0.4), CROSS_B, shrug); p.mouth = shrug > 0.5 ? 'flat' : 'smile';
      p.headYaw = shrug * -0.5;
    }
    const go = K(t, [[CAKE - 0.2, 0], [CAKE + 0.25, 1]]);
    if (go > 0) { // both lunge at the cake
      const tx = 1.0 + (bride_ ? 0.05 : -0.2), tz = -2.95 + (bride_ ? 0.3 : -0.25);
      x = lerp(x0, tx, go); z = lerp(z0 + 0.1, tz, go); rotY = faceToward(x, z, 1.25, -3.05); walk(p, go * 1.0, go < 0.98 ? 1.2 : 0, TS);
      p.armA = mixArm(p.armA, A(-1.35, 0.1, -0.25, 0.2), go); p.armB = mixArm(p.armB, A(-1.35, 0.1, -0.25, -0.2), go); p.mouth = 'o'; p.eyes = 'open';
      const cheer = K(t, [[CAKE + 0.8, 0], [CAKE + 1.0, 1]]); if (cheer > 0) { p.armA = mixArm(p.armA, CHEER_A, cheer); p.armB = mixArm(p.armB, CHEER_B, cheer); p.mouth = 'smile'; }
    }
    Object.assign(p, { x, z, rotY });
    return { p, rootY };
  }
  function guestPose(t, i) {
    if (i >= 10) return null;
    const row = WD.rows[(i % 2)], side = i % 4 < 2 ? -1 : 1, sx = WD.seats[Math.floor(i / 4) % 4] + 0.1;
    const p = basePose(); p.eyes = blink(t, i + 4);
    Object.assign(p, { x: side * sx, z: row - 0.05, rotY: PI, footFwd: 0.42 });
    p.headPitch = -0.05; p.headYaw = side * 0.25 + 0.2 * Math.sin(t * 0.8 + i);
    const cheer = K(t, [[CAKE + 0.9 + (i % 3) * 0.05, 0], [CAKE + 1.15, 1]]);
    p.armA = mixArm(A(-0.5, 0.1, -0.9, 0.3), CHEER_A, cheer); p.armB = mixArm(A(-0.5, 0.1, -0.9, -0.3), CHEER_B, cheer);
    p.mouth = t > TANTRUM && t < CAKE ? 'o' : cheer > 0.5 ? 'o' : 'smile';
    return { p, rootY: sitRoot(WD.seat) + 0.02 };
  }
  // 9. park — the playground pops up; toddlers in suits on everything
  const B0 = 47.1, B1 = 50.2;
  const buildK = (t) => K(t, [[B0, 0], [B1, 1]], (u) => u);
  const pieceDone = (t, idx) => buildK(t) * 8 - idx >= 1;   // ORDER: carousel 0, slide 1, swings 2, seesaw 3, sandbox 4, riders 5, dome 6, banner 7
  function parkPose(t, i) {
    const p = basePose(); p.eyes = blink(t, i); p.mouth = i % 2 ? 'o' : 'smile';
    const [cx, cz] = PG.carousel, ang = park.carousel.rotation.y;
    if (i < 3) { // riding the merry-go-round
      if (!pieceDone(t, 0)) return null;
      const a = -ang + i * (2 * PI / 3), r = 1.15, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      Object.assign(p, { x, z, rotY: faceToward(x, z, cx, cz) + PI / 2, footFwd: 0.4 }); p.armA = RIDE_A; p.armB = RIDE_B; p.headRoll = 0.15;
      return { p, rootY: sitRoot(0.42), ground: 0.42 };
    }
    if (i < 5) { // seesaw ends
      if (!pieceDone(t, 3)) return null;
      const s = i === 3 ? -1 : 1, rz = park.seesaw.rotation.z, x = PG.seesaw[0] + s * 1.45 * Math.cos(rz), y = 0.48 + s * 1.45 * Math.sin(rz) + 0.05;
      Object.assign(p, { x, z: PG.seesaw[1], rotY: s < 0 ? PI / 2 : -PI / 2, footFwd: 0.4 }); p.armA = RIDE_A; p.armB = RIDE_B; p.mouth = 'o';
      return { p, rootY: sitRoot(y), ground: Math.max(0, y - 0.45) };
    }
    if (i < 8) { // swings
      if (!pieceDone(t, 2)) return null;
      const k = i - 5, pv = park.swings[k], th = pv.rotation.x, L = PG.swingLen;
      const sx = PG.swings[0] + pv.position.x, sy = PG.swingPivotY - L * Math.cos(th), sz = PG.swings[1] - L * Math.sin(th);
      Object.assign(p, { x: sx, z: sz + 0.04, rotY: 0, footFwd: 0.35 + 0.15 * Math.sin(th * 3), lean: -th * 0.6 }); p.armA = A(-2.4, 0.15, -0.3, 0.2); p.armB = A(-2.4, 0.15, -0.3, -0.2); p.mouth = 'o';
      return { p, rootY: sitRoot(sy + 0.03), ground: sy - 0.5 };
    }
    if (i < 11) { // spring riders
      if (!pieceDone(t, 5)) return null;
      const k = i - 8, [rx, rz] = PG.riders[k], rr = park.riders[k].rotation.z;
      Object.assign(p, { x: rx - 0.05, z: rz, rotY: PI / 2, footFwd: 0.35, lean: rr }); p.armA = RIDE_A; p.armB = RIDE_B;
      return { p, rootY: sitRoot(0.8) + 0.04 * Math.sin(rr * 4), ground: 0.32 };
    }
    if (i < 17) { // running in a loop around the sandbox / arriving
      const k = i - 11, v = 1.1, a = (t - 47) * v / 2.0 + k * (2 * PI / 6), [sx, sz] = PG.carousel;   // chasing around the merry-go-round
      const x = sx + Math.cos(a) * 2.4, z = sz + Math.sin(a) * 1.45;
      walk(p, v * t, v, TS); Object.assign(p, { x, z, rotY: faceToward(x, z, sx + Math.cos(a + 0.1) * 2.4, sz + Math.sin(a + 0.1) * 1.45), waddle: 0.5 });
      p.armA = k % 2 ? CHEER_A : REST; p.armB = k % 2 ? CHEER_B : REST; p.mouth = 'o';
      return { p, rootY: 0, ground: 0 };
    }
    return null;
  }
  // 10. dogs — a row of toddlers on the lawn; Gary escapes; the dog cuts him off
  const ROWZ = -4.6;
  function rowPose(t, i) {
    if (i >= 8) return null;
    const x = -1.95 + i * 0.5 + (i >= 4 ? 0.5 : 0), p = basePose(); p.eyes = blink(t, i);
    Object.assign(p, { x, z: ROWZ + 0.08 * Math.sin(i), rotY: 0.1 * Math.sin(i * 1.7), footFwd: 0.4 });
    p.armA = A(-0.55, 0.05, -1.0, 0.4); p.armB = A(-0.55, 0.05, -1.0, -0.4);
    p.headYaw = K(t, [[54.0, 0], [55.4, 0], [55.8, 0.6], [57.4, 0.6], [57.8, 0]]) * (x < 0.2 ? 1 : 0.7); p.mouth = 'smile';
    return { p, x };
  }
  const GESC = [[0.05, ROWZ], [0.25, -2.5], [0.3, -1.95]];
  function garyEscape(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    const out = K(t, [[54.2, 0], [55.9, 1]], (u) => u), back = K(t, [[56.6, 0], [57.9, 1]], (u) => u), sit = K(t, [[57.9, 0], [58.3, 1]]);
    let x, z;
    if (back <= 0) { x = lerp(GESC[0][0], GESC[2][0], out); z = lerp(GESC[0][1], GESC[2][1], out); p.rotY = 0.05; walk(p, out * 2.65, out > 0.01 && out < 0.99 ? 0.55 : 0, TS); }
    else { x = lerp(GESC[2][0], GESC[0][0], back); z = lerp(GESC[2][1], GESC[0][1], back); p.rotY = PI; walk(p, 2.65 + back * 2.65, back < 0.99 ? 0.55 : 0, TS); }
    const up = t < 54.2 ? 0 : sit > 0 ? 1 - sit : 1;
    p.footFwd = 0.4 * (1 - up); p.waddle = 0.6 * up; p.lean = -0.05;
    const caught = K(t, [[55.9, 0], [56.1, 1], [56.5, 1]]);
    p.mouth = caught > 0.5 && back <= 0 ? 'o' : 'flat'; p.headPitch = caught > 0.5 && back <= 0 ? 0.35 : 0;
    if (back > 0 && back < 1) p.headYaw = 0.6;
    if (sit >= 1) p.rotY = 0;
    p.x = x; p.z = z; p.armA = REST; p.armB = REST;
    return { p, rootY: lerp(0, sitRoot(0), 1 - up) };
  }
  function dogAt(t) { // inspects the row (walks along it), then dashes to cut Gary off, sits proudly
    const insp = K(t, [[53.3, 0], [55.2, 1]], (u) => u), dash = K(t, [[55.3, 0], [55.95, 1]]);
    let x = lerp(-2.4, 2.4, insp), z = ROWZ + 0.75, ry = PI / 2, sp = insp > 0 && insp < 1 ? 0.7 : 0;
    if (dash > 0) { x = lerp(2.4, 0.4, dash); z = lerp(ROWZ + 0.75, -1.35, dash); ry = faceToward(2.4, ROWZ + 0.75, 0.4, -1.35); sp = dash < 1 ? 1.4 : 0; }
    if (t > 56.0) { ry = lerpAngle(ry, PI, K(t, [[56.0, 0], [56.3, 1]])); }
    const bark = K(t, [[56.1, 0], [56.2, 1], [56.35, 0], [56.45, 1], [56.6, 0]]);
    return { x, z, ry, sp, bark };
  }
  // 11. grow — sitting toddlers pop back to adults, stand, call their parents
  const CALL = 61.3;
  function growPose(t, i) {
    if (i >= 9) return null;
    const isGary = i === 4, x = -2.6 + i * 0.65, z = ROWZ + 0.1 * Math.sin(i * 2.3);
    const s = sizeAt(t, M2, 1, Math.abs(i - 4)), stand = K(t, [[M2 + 0.35 + Math.abs(i - 4) * 0.03, 0], [M2 + 0.9 + Math.abs(i - 4) * 0.03, 1]]);
    const p = basePose(); p.eyes = blink(t, i);
    Object.assign(p, { x, z, rotY: 0.08 * Math.sin(i * 1.3), footFwd: 0.4 * (1 - stand) });
    const look = K(t, [[M2 + 0.9, 0], [M2 + 1.2, 1], [CALL - 0.4, 1], [CALL - 0.1, 0]]);
    p.headPitch = 0.55 * look; p.armA = mixArm(A(-0.55, 0.05, -1.0, 0.4), HANDS_A, look); p.armB = mixArm(A(-0.55, 0.05, -1.0, -0.4), HANDS_B, look);
    p.mouth = look > 0.5 ? 'o' : 'smile';
    const call = K(t, [[CALL + Math.abs(i - 4) * 0.05, 0], [CALL + 0.4 + Math.abs(i - 4) * 0.05, 1]]);
    if (call > 0) { p.armB = mixArm(p.armB, PHONE_B, call); p.armA = mixArm(p.armA, REST, call); p.headRoll = 0.12 * call; p.mouth = 'smile'; p.eyes = t > CALL + 1.2 ? 'closed' : p.eyes; }
    return { p, s, rootY: lerp(sitRoot(0, s), 0, stand), call, isGary, x, z };
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = 0.45;
    all.forEach((r) => (r.root.visible = false)); subCars.forEach((c) => (c.g.visible = false)); stacks.forEach((g) => (g.visible = false)); cases.forEach((g) => (g.visible = false));
    phones.forEach((g) => (g.visible = false)); zs.forEach((z) => (z.visible = false)); puffs.hide();
    dog.g.visible = false; veil.visible = true; basket.visible = false; petals.visible = cur === 'wed';
    const cam = shot.cam;

    if (cam === 'open') {
      sub.aimSun(-3, -1, 12);
      subCars.forEach((c) => (c.g.visible = true));
      subCars[0].g.position.set(-30 + 11 * Math.max(0, t - 0.4), 0, 2.0); subCars[0].g.rotation.y = PI / 2;
      subCars[1].g.position.set(10 - 11.5 * Math.max(0, t - 1.3), 0, 5.0); subCars[1].g.rotation.y = -PI / 2;
      crowd.forEach((c, i) => {
        const r = openPose(t, i); if (!r) return;
        put(c, 'sub', r.p, r.s, r.rootY, r.rootY); cases[i].visible = i % 3 === 0;
        puff(i * 3 % 39, 'sub', r.x, SW_H, r.z, t, M1, i, 1.0);
      });
    } else if (cam === 'coffee') {
      const r = coffee(t); put(gary, 'kit', r.p, TS, r.rootY, r.ground);
      const c = r.chair; kChair.position.set(c.x + 0.12 * c.tip, 0.02 * c.tip, c.z); kChair.rotation.set(0, c.dir, -1.5 * c.tip);   // topples sideways (stays in view)
    } else if (cam === 'commute') {
      street.aimSun(-3, -1, 10); street.setSeason('spring', t, [-3, -1]);
      [street.cart, street.trash, street.bench].forEach((o) => o && (o.visible = false));
      crowd.forEach((c, i) => { const r = commutePose(t, i); if (r) put(c, 'street', r.p, TS, r.rootY, r.ground); });
      put(crowd[14], 'street', carKid(t), TS, 0, 0);
    } else if (cam === 'board') {
      const r = ceoPose(t); put(ceo, 'office', r.p, TS, r.rootY, r.ground);
      crowd.forEach((c, i) => { const b = boardPose(t, i); if (!b) return; put(c, 'office', b.p, TS, sitRoot(0), 0); });
      zs.forEach((z, k) => { // Z's drift up from the sleepers
        const age = t - NAP - 1.0 - k * 0.22; if (age < 0) return;
        const src = k % 7, [x, zz] = src === 6 ? [0.15, -0.95] : [[-0.8, -0.2], [-0.3, 0.0], [0.3, 0.05], [0.85, -0.15], [-1.15, -0.55], [1.2, -0.5]][src];
        const h = (age % 1.6) / 1.6, y0 = src === 6 ? KDESK + 0.62 : 0.62;
        z.visible = true; z.position.set(x + 0.15 * Math.sin(age * 3 + k), y0 + h * 0.7, zz); z.scale.setScalar(0.1 + h * 0.08); z.material.opacity = Math.min(1, h * 4) * (1 - h);
      });
    } else if (cam === 'press') {
      press.setFlashes(t, t > NO ? 4.5 : 1.2);
      const r = prezPose(t); put(prez, 'press', r.p, TS, r.rootY, r.ground);
      const fall = K(t, [[STOMP, 0], [STOMP + 0.55, 1]], (u) => u * u);
      books.forEach((b, k) => { // stacked → scattered
        const y0 = BOOK_Y + 0.055 + k * 0.11, dx = (k % 2 ? 1 : -1) * (0.25 + k * 0.07), dz = -0.2 - k * 0.04;
        b.position.set(PD.speaker[0] + dx * fall, lerp(y0, BOOK_Y + 0.055 + (k % 2) * 0.02, fall) + 0.2 * Math.sin(fall * PI) * (k / 4), PD.speaker[1] + dz * fall);
        b.rotation.set(0.0, k * 0.25 * fall + (k % 2 ? 0.08 : -0.06), (k % 2 ? 1 : -1) * 1.1 * fall * (k > 2 ? 1 : 0.3));
      });
      crowd.forEach((c, i) => { const q = reporterPose(t, i); if (q) put(c, 'press', q.p, TS, q.rootY, q.ground); });
    } else if (cam === 'market') {
      mkt.setStock(K(t, [[31.2, 1], [35.0, 0.02]]), 0.9); mkt.setSoldOut(t > 34.4, 'SNACKS SOLD OUT');
      crowd.forEach((c, i) => { const r = shopperPose(t, i); if (!r) return; put(c, 'mkt', r.p, TS, 0, 0); stacks[i].visible = true; });
      crowd.slice(12).forEach((c, i) => { const p = grabberPose(t, i); if (p) put(c, 'mkt', p, TS, 0, 0); });
    } else if (cam === 'plane') {
      plane.rows.forEach((g, k) => { g.visible = k < 9 * 6; g.rotation.x = 0; });   // rows behind the camera hidden
      crowdP.forEach((c, i) => { const r = passengerPose(t, i); if (r) put(c, 'plane', r.p, TS, r.rootY, r.ground); });
    } else if (cam === 'wedding') {
      const b = couplePose(t, 'bride'), g = couplePose(t, 'groom');
      put(bride, 'wed', b.p, TS, b.rootY, 0); put(groom, 'wed', g.p, TS, g.rootY, 0);
      const op = basePose(); Object.assign(op, { x: WD.officiant[0], z: WD.officiant[1], rotY: 0 }); op.eyes = blink(t, 9);
      op.armA = A(-0.8, 0.05, -1.3, 0.6); op.armB = A(-0.8, 0.05, -1.3, -0.6); op.mouth = t > TANTRUM ? 'o' : 'smile'; op.headPitch = t > TANTRUM && t < CAKE ? 0.35 : 0;
      put(officiant, 'wed', op, TS, 0, 0);
      crowd.forEach((c, i) => { const q = guestPose(t, i); if (q) put(c, 'wed', q.p, TS, q.rootY, 0); });
      const topple = K(t, [[CAKE + 0.2, 0], [CAKE + 0.65, 1]], (u) => u * u);
      cake.rotation.z = -1.5 * topple; cake.scale.set(1 + 0.25 * topple, 1 - 0.3 * K(t, [[CAKE + 0.6, 0], [CAKE + 0.75, 1]]), 1 + 0.15 * topple);
      const age = t - CAKE - 0.62;
      if (age > 0 && age < 1.2) for (let k = 0; k < 8; k++) { const a = k * 0.8; puffs.set(k, new THREE.Vector3(OFF.wed[0] + 1.6 + Math.cos(a) * (0.1 + age * 0.4), 0.55 + age * 0.35 * (k % 3), OFF.wed[2] - 3.05 + Math.sin(a) * 0.3), 0.18 + age * 0.35, 0.8 * (1 - age / 1.2), puffCol); }
      { // petals drift down over the couple; the flower girl walks the aisle tossing more
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3(), age = t - 41.6;
        petSeeds.forEach((q4, i) => { const fall = (age * (0.35 + q4[2] * 0.3) + q4[3] * 3.0) % 3.0; v3.set(-1.2 + q4[0] * 3.2 + 0.15 * Math.sin(t * 1.5 + i), 3.0 - fall, -3.8 + q4[1] * 4.2); q.setFromEuler(e3.set(t * (1.5 + q4[2] * 3) + i, t * 2 + i * 0.7, i)); m4.compose(v3, q, s3); petals.setMatrixAt(i, m4); });
        petals.instanceMatrix.needsUpdate = true; if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
        const g = crowd[19], w = K(t, [[41.65, 0], [43.6, 1]], (u) => u), aside = K(t, [[43.6, 0], [44.2, 1]]), fp = basePose(); fp.eyes = blink(t, 11);
        Object.assign(fp, { x: lerp(0.1, -1.15, aside), z: lerp(-0.9, -2.45, w) - 0.2 * aside, rotY: aside > 0 ? lerpAngle(PI, -PI / 2, Math.min(1, aside * 2)) : PI, waddle: 0.5 }); walk(fp, w * 1.55 + aside * 1.3, w < 0.99 || (aside > 0 && aside < 0.99) ? 0.7 : 0, TS);
        fp.armA = A(-0.7, 0.1, -1.2, 0.4); fp.armB = A(-1.0 - 0.9 * Math.max(0, Math.sin(t * 5)), 0.3, -0.4, -0.2); fp.mouth = 'smile';
        if (w >= 1) { fp.rotY = 0.6; fp.armB = A(-0.6, 0.6, -0.4, -0.2); }
        put(g, 'wed', fp, TS, 0, 0); g.arms.find((a) => a.s === -1).hand.add(basket); basket.position.set(0, -0.08, 0.04); basket.visible = true;
      }
    } else if (cam === 'park') {
      park.aimSun(0, -3, 13); park.setBuild(buildK(t)); park.update(t, 1);
      crowd.forEach((c, i) => { const r = parkPose(t, i); if (r) put(c, 'park', r.p, TS, r.rootY, r.ground); });
    } else if (cam === 'dogs') {
      sub.aimSun(0, -4, 9);
      crowd.forEach((c, i) => { const r = rowPose(t, i); if (r) put(c, 'sub', r.p, TS, sitRoot(0), 0); });
      const g = garyEscape(t); put(gary, 'sub', g.p, TS, g.rootY, 0);
      const d = dogAt(t); dog.g.visible = true; sub.root.add(dog.g); dog.g.position.set(d.x, 0, d.z); dog.g.rotation.y = d.ry; dog.update(t, d.sp); dog.bark(d.bark);
    } else if (cam === 'grow') {
      sub.aimSun(0, -4, 9);
      const cast = [...crowd.slice(0, 4), gary, ...crowd.slice(4, 8)];
      cast.forEach((c, i) => {
        const r = growPose(t, i); if (!r) return;
        put(c, 'sub', r.p, r.s, r.rootY, 0);
        const ph = phones.get(c); if (ph) ph.visible = r.call > 0.3;
        puff(i * 3 % 39, 'sub', r.x, 0, r.z, t, M2, Math.abs(i - 4), 1.0);
      });
      dog.g.visible = true; sub.root.add(dog.g); dog.g.position.set(3.9, 0, ROWZ + 0.4); dog.g.rotation.y = -0.6; dog.update(t, 0);
    }

    // camera (local → world)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (c.y) P[1] = K(t, c.y) + o[1];
    if (c.ay) Aim[1] = K(t, c.ay) + o[1];
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(M1); jolt(13.1, 0.015); jolt(FALL + 0.2, 0.015); jolt(STOMP + 0.45, 0.02); jolt(CAKE + 0.65, 0.02); jolt(M2, 0.015);
    if (cam === 'plane' && t > KICK) { const k = 0.006 * K(t, [[KICK, 0], [KICK + 0.3, 1]]); P = [P[0] + k * Math.sin(t * 41), P[1] + k * Math.sin(t * 37), P[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
