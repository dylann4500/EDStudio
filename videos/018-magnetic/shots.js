// VIDEO 018 — "What if every human became magnetic?"  (tone: MONTAGE, unhinged lane, @ed._.studios)
// At 9:00 AM every human becomes a 1.5-tesla magnet (as strong as a hospital MRI). Every beat = a new place + one escalating
// physical gag that ends in a CLANG (impact star + dust puff + camera jolt) + one real, sourced number in the HUD stat line.
// 69 s, 11 beats, TEN sets parked at offsets in one scene (one visible per shot; city.js stays at the origin).
// NEW sets: engine/sets/subway.js (elevated subway car), engine/sets/mri.js (MRI suite), engine/sets/paris.js (Eiffel Tower).
// Magnet language: a cyan shimmer at the moment it starts; people fly toward metal with an accelerating pull (u³), body tilted
// toward the target, and land flat with their arms splayed ("splat"); props fly to people the same way.
//
// Sources (checked Oct 26 2026):
//   ~1.6 billion cars in use — Hedges & Company, "How many cars are there in the world?" (Sept 2025: 1.645 B)
//   MRI magnets 1.5–3 T; Earth's field 25–65 µT (≈ 50 µT) → 3 T ≈ 60,000×, 1.5 T ≈ 30,000× — Radiopaedia "Tesla (SI unit)"
//   a refrigerator magnet ≈ 5 mT (0.005 T) — Wikipedia "Tesla (unit)" (examples table)
//   >25 million shopping carts in U.S. grocery stores — Progressive Grocer "Wheels of Fortune" / cartsandparts.com (2016)
//   NYC subway ≈ 4.0 million average weekday riders in 2025 — MTA ridership 2025 (mta.info)
//   the White House briefing room has 49 seats — Wikipedia "James S. Brady Press Briefing Room" (since the 2007 renovation)
//   ~2.04 million U.S. marriages in 2023 → ~5,600 a day — CDC/NCHS FastStats "Marriage and Divorce"
//   the Eiffel Tower's metal structure weighs 7,300 tonnes (puddled iron) — toureiffel.paris key figures; Scientific American 1889
//   world crude steel 2024: 1,882.6 million tonnes — worldsteel press release, 24 Jan 2025
//   average hug 3.17 s — Nagy 2011, "Sharing the moment: the duration of embraces in humans", J. Ethology 29(2)
//   (fun fact for the comments: real humans are diamagnetic — a 16 T magnet levitated a live frog, Geim & Berry 1997)
//
// Shot list (seconds)                     | set     | what happens
//  0.0– 9.2  open    TUESDAY 9:00 AM      | city    | people at a bus stop + a hardware store; 5.4 cyan shimmer → everyone is yanked back onto the steel: CLANG ×8
//  9.2–14.6  kitchen +1 MINUTE            | kitchen | Gary sips coffee; forks + spoons fly onto his shirt, the toaster to his belly, a pan onto his head; 12.5 he slams back-first onto the fridge; toast pops
// 14.6–20.0  market  +10 MINUTES          | market  | a shopper walks the aisle with a snake of carts following her; she runs; 19.1 the carts slam in and pile up over her
// 20.0–25.4  subway  +1 HOUR              | subway  | commuters stuck to poles + bars; two strangers slide off opposite seats into a hug (22.7); then the whole car joins in a ball (23.6–24.3)
// 25.4–30.8  press   +2 HOURS             | podium  | the President talks; 28.3 the press mics fly to his face, then every row of chairs slides forward and piles into the stage
// 30.8–36.2  mri     +3 HOURS             | mri     | the 3 T scanner pulls in a doctor (into the bore, legs out), then the nurse and everyone from the corridor: a human sunflower
// 36.2–41.6  wedding +1 DAY               | wedding | same poles: the couple can't get close, then they're blasted apart; 39.2 he turns around and she slams into a back hug
// 41.6–47.0  paris   +1 WEEK              | paris   | tourists fly onto the Eiffel Tower's legs; crane up + back: a swarm of 1,800 tourists covers the tower
// 47.0–49.0  cmpCU   +1 MONTH             | woods   | POV: a compass needle swings from north to point at the hiker holding it
// 49.0–52.4  hikers                       | woods   | four hikers follow their compasses toward each other… CLONK, a 4-person knot
// 52.4–57.8  wood    +1 YEAR              | suburb  | a wooden world: wooden cars + a wooden bus roll by, steel things POOF into wood
// 57.8–69.0  hug     +1 YEAR              | suburb  | Gary + kid hug grandma → stuck; time-lapse to dusk (porch light on), still hugging. End card 64.6
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeDog, makeMug, makeBus } from '@engine/props.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { buildSubway, DIMS as SD } from '@engine/sets/subway.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildMRI, DIMS as MD } from '@engine/sets/mri.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildParis } from '@engine/sets/paris.js';
import { buildWoods } from '@engine/sets/frontier.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const M1 = 5.4;                           // the moment everyone becomes magnetic
const SIT = HIP_H - 0.17;                 // pelvis-bottom offset: sitting root = seat − SIT
const HC = 0.9;                           // body center above the feet (for flying / stuck bodies)
const OFF = { city: [0, 0, 0], kit: [2000, 0, 0], mkt: [4000, 0, 0], sub: [6000, 0, 0], press: [8000, 0, 0], mri: [10000, 0, 0],
  wed: [12000, 0, 0], paris: [14000, 0, 0], woods: [16000, 0, 0], burb: [18000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 9.2, cam: 'open', set: 'city' },
  { t0: 9.2, t1: 14.6, cam: 'kitchen', set: 'kit' },
  { t0: 14.6, t1: 20.0, cam: 'market', set: 'mkt' },
  { t0: 20.0, t1: 25.4, cam: 'subway', set: 'sub' },
  { t0: 25.4, t1: 30.8, cam: 'press', set: 'press' },
  { t0: 30.8, t1: 36.2, cam: 'mri', set: 'mri' },
  { t0: 36.2, t1: 41.6, cam: 'wedding', set: 'wed' },
  { t0: 41.6, t1: 47.0, cam: 'paris', set: 'paris' },
  { t0: 47.0, t1: 49.0, cam: 'compass', set: 'woods' },
  { t0: 49.0, t1: 52.4, cam: 'hikers', set: 'woods' },
  { t0: 52.4, t1: 57.8, cam: 'wood', set: 'burb' },
  { t0: 57.8, t1: 69.0, cam: 'hug', set: 'burb' },
];
// camera coords are LOCAL to the shot's set (two keys, eased); `y`/`ay` keyframes override heights when present
export const CAMS = {
  open:    { p: [[-1.4, 1.4, 3.95], [-0.7, 1.4, 4.05]], a: [[6.8, 1.52, 4.3], [6.8, 1.48, 4.3]], fov: 46, amp: 0.004 },
  kitchen: { p: [[-0.15, 1.45, 1.95], [-0.95, 1.45, 1.55]], a: [[-1.45, 1.38, -1.25], [-2.75, 1.58, -1.7]], fov: 54, amp: 0.004 },   // Gary right of + below the HUD
  market:  { p: [[1.0, 2.35, 3.55], [0.8, 2.15, 3.1]], a: [[0.0, 0.55, -4.5], [0.0, 0.8, -1.4]], fov: 52, amp: 0.004 },
  subway:  { p: [[0.55, 1.55, 5.6], [0.45, 1.5, 4.6]], a: [[0.0, 1.08, -3.0], [0.0, 1.05, -3.0]], fov: 54, amp: 0.004 },
  press:   { p: [[0.7, 2.75, 5.4], [0.4, 2.35, 2.7]], a: [[0.0, 1.0, -2.0], [0.0, 1.35, -2.8]], fov: 44, amp: 0.004 },
  mri:     { p: [[0.85, 1.45, 3.3], [0.6, 1.42, 2.75]], a: [[-0.05, 1.3, -1.6], [-0.05, 1.35, -1.6]], fov: 62, amp: 0.004 },
  wedding: { p: [[0.3, 1.7, 2.7], [0.2, 1.6, 2.0]], a: [[0.0, 1.0, -3.3], [-0.3, 1.0, -3.3]], fov: 60, amp: 0.004 },
  paris:   { p: [[19.5, 1.7, 30.0], [3.0, 4.5, 84.0]], a: [[12.0, 5.0, 13.5], [0.0, 33.0, 0.0]], fov: 52, amp: 0.01 },
  compass: { p: [[0.02, 1.8, 1.62], [0.0, 1.75, 1.45]], a: [[-0.15, 1.2, 0.15], [-0.15, 1.22, 0.15]], fov: 46, amp: 0.002 },   // dial above the subtitle band
  hikers:  { p: [[3.1, 1.6, 6.7], [2.85, 1.6, 6.1]], a: [[2.5, 1.15, 2.0], [2.5, 1.2, 2.2]], fov: 50, amp: 0.004 },
  wood:    { p: [[7.6, 1.45, -3.4], [6.2, 1.45, -3.1]], a: [[-14.0, 1.0, 2.6], [-14.0, 1.0, 2.6]], fov: 50, amp: 0.004 },
  hug:     { p: [[-1.75, 1.5, -1.6], [-2.05, 1.45, -2.45]], a: [[-2.4, 1.1, -5.7], [-2.4, 1.15, -5.7]], fov: 50, amp: 0.003 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const SPLAT_A = A(-0.3, 1.85, -0.35, 0.3), SPLAT_B = A(-0.3, 1.85, -0.35, -0.3);       // spread-eagle (stuck flat)
const LOW_A = A(-0.15, 0.75, -0.25, 0.2), LOW_B = A(-0.15, 0.75, -0.25, -0.2);         // arms out low (stuck, sagging)
const SUPER_A = A(-2.85, 0.25, -0.1), SUPER_B = A(-2.85, 0.25, -0.1);                  // flying, arms ahead
const BACK_A = A(0.9, 0.6, -0.2, 0.3), BACK_B = A(0.9, 0.6, -0.2, -0.3);               // pulled backward, arms trailing forward
const HUG_A = A(-1.3, 0.3, -1.35, 0.95), HUG_B = A(-1.3, 0.3, -1.35, -0.95);           // arms around someone
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const MUG_B = A(-0.75, 0.2, -1.95, -0.55);                                            // holding a mug at the chest
const HOLD_A = A(-0.85, 0.12, -1.25, 0.6), HOLD_B = A(-0.85, 0.12, -1.25, -0.6);       // holding something in front (compass)
const MIC_B = A(-1.25, 0.2, -1.1, -0.4);                                              // a mic held out
const TALK_B = A(-0.85, 0.35, -1.15, -0.35);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const wig = (a, t, ph, k = 1) => ({ ...a, sx: a.sx + 0.12 * k * Math.sin(t * 11 + ph), sz: a.sz + 0.1 * k * Math.sin(t * 9 + ph * 1.3) });   // wriggling while stuck
const pull3 = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * u);                            // magnetic pull: slow start, slam at the end
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

// ---------------------------------------------------------------- props (video-local)
const steelM = () => mat(0xc9ccd2, 0.25, { metalness: 0.75 });
function makeFork(spoon) {
  const g = new THREE.Group(), m = steelM();
  mk(new THREE.BoxGeometry(0.014, 0.16, 0.006), m, g, 0, 0.08, 0);
  if (spoon) { const b = mk(new THREE.SphereGeometry(0.026, 10, 8), m, g, 0, 0.18, 0); b.scale.set(1, 1.5, 0.35); }
  else { mk(new THREE.BoxGeometry(0.03, 0.03, 0.006), m, g, 0, 0.17, 0); for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(0.005, 0.045, 0.005), m, g, -0.0105 + k * 0.007, 0.205, 0); }
  return g;   // handle at the origin, pointing +y
}
function makeToaster() {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(0.26, 0.16, 0.14), mat(0xd8dce0, 0.25, { metalness: 0.6 }), g, 0, 0, 0);
  for (const x of [-0.05, 0.05]) mk(new THREE.BoxGeometry(0.03, 0.01, 0.1), mat(0x222222, 0.6), g, x, 0.081, 0);
  mk(new THREE.BoxGeometry(0.02, 0.04, 0.02), mat(0x222222, 0.5), g, 0.14, 0.02, 0);
  const toast = [-0.05, 0.05].map((x) => mk(new THREE.BoxGeometry(0.022, 0.1, 0.09), mat(0xc98e4a, 0.9), g, x, 0.02, 0));
  return { g, toast };
}
function makePan() {
  const g = new THREE.Group(), m = mat(0x2a2d31, 0.45, { metalness: 0.4 });
  mk(new THREE.CylinderGeometry(0.15, 0.13, 0.04, 24), m, g, 0, 0, 0);
  mk(new THREE.BoxGeometry(0.03, 0.02, 0.24), m, g, 0, 0.0, 0.26);
  return g;
}
function makeCart() {
  const g = new THREE.Group(), wire = mat(0xc9ccd2, 0.3, { metalness: 0.6 });
  const gridT = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#e8ebef'; c.lineWidth = 6; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 16); c.lineTo(w, i * 16); c.stroke(); } });
  const basketM = new THREE.MeshStandardMaterial({ map: gridT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.5 });
  const b = mk(new THREE.BoxGeometry(0.55, 0.42, 0.85), basketM, g, 0, 0.78, 0); b.castShadow = true;
  mk(new THREE.BoxGeometry(0.55, 0.02, 0.85), wire, g, 0, 0.56, 0);
  mk(new THREE.BoxGeometry(0.6, 0.035, 0.035), mat(0xd2483f, 0.5), g, 0, 1.06, -0.47);
  for (const x of [-0.25, 0.25]) { mk(new THREE.BoxGeometry(0.025, 0.55, 0.025), wire, g, x, 0.3, -0.38); mk(new THREE.BoxGeometry(0.025, 0.025, 0.8), wire, g, x, 0.08, 0); }
  for (const [x, z] of [[-0.22, 0.34], [0.22, 0.34], [-0.22, -0.34], [0.22, -0.34]]) mk(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), mat(0x222222, 0.6), g, x, 0.05, z).rotation.z = PI / 2;
  return g;   // front = +z
}
function makeMic(col) {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.016, 0.012, 0.2, 8), mat(0x222222, 0.4), g, 0, -0.1, 0);
  mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0x1b1b1b, 0.7), g, 0, 0.02, 0);
  mk(new THREE.BoxGeometry(0.06, 0.05, 0.06), mat(col, 0.5), g, 0, -0.04, 0);
  return g;   // head at the origin-ish, handle down (−y)
}
function makeCompass() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.06, 0.062, 0.022, 32), mat(0xb5893a, 0.3, { metalness: 0.7 }), g, 0, 0, 0);
  const face = mk(new THREE.CircleGeometry(0.052, 40), new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(256, 256, (c, w) => { c.fillStyle = '#f7f2e6'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#3a2e22'; c.lineWidth = 3; for (let i = 0; i < 36; i++) { const a = (i / 36) * PI * 2, r0 = i % 9 === 0 ? 92 : 108; c.beginPath(); c.moveTo(128 + Math.sin(a) * r0, 128 - Math.cos(a) * r0); c.lineTo(128 + Math.sin(a) * 120, 128 - Math.cos(a) * 120); c.stroke(); } c.fillStyle = '#2a2a2a'; c.font = 'bold 38px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c0392b'; c.fillText('N', 128, 52); c.fillStyle = '#2a2a2a'; c.fillText('S', 128, 206); c.fillText('E', 206, 130); c.fillText('W', 50, 130); }) }), g, 0, 0.0115, 0);
  face.rotation.x = -PI / 2;
  const needle = new THREE.Group(); needle.position.y = 0.016; g.add(needle);
  const red = mk(new THREE.ConeGeometry(0.009, 0.045, 4), mat(0xd23a3f, 0.4), needle, 0, 0, -0.0225); red.rotation.x = -PI / 2;
  const wht = mk(new THREE.ConeGeometry(0.009, 0.045, 4), mat(0xf4f4f2, 0.4), needle, 0, 0, 0.0225); wht.rotation.x = PI / 2;
  mk(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 10), mat(0xb5893a, 0.3), needle, 0, 0.002, 0);
  const glass = mk(new THREE.CylinderGeometry(0.054, 0.054, 0.004, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.15, depthWrite: false }), g, 0, 0.024, 0);
  void glass;
  return { g, needle };   // needle.rotation.y = 0 → red tip points local −z
}
function makeBackpack(col) {
  const g = new THREE.Group();
  mk(new THREE.BoxGeometry(0.3, 0.42, 0.16), mat(col, 0.8), g, 0, 0, 0);
  mk(new THREE.BoxGeometry(0.26, 0.14, 0.08), mat(col, 0.7), g, 0, -0.08, -0.1);
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 10), mat(0x4a5560, 0.8), g, 0, 0.26, 0).rotation.z = PI / 2;
  return g;
}
const woodTex = (base = '#b88550') => canvasTex(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); const r = rng(6); for (let i = 0; i < 46; i++) { c.strokeStyle = `rgba(90,50,20,${0.12 + r() * 0.18})`; c.lineWidth = 1 + r() * 3; c.beginPath(); const y = r() * h; c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 6); c.stroke(); } }, [2, 2]);

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('red'); city.setGrowth(0); city.setSnow(0);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(9, 1);
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const sub = buildSubway(studio, {}); sub.root.position.set(...OFF.sub);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const mri = buildMRI(studio, {}); mri.root.position.set(...OFF.mri);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const paris = buildParis(studio, {}); paris.root.position.set(...OFF.paris);
  const woods = buildWoods(studio, {}); woods.root.position.set(...OFF.woods); const woodsFog = woods.fog; woods.block.visible = false;
  const burb = buildSuburb(studio, { poleClear: [-16, -11.5, -2.2, 4.5, 58, -24, 6, 12] }); burb.root.position.set(...OFF.burb);
  const ROOTS = { city: city.root, kit: kit.root, mkt: mkt.root, sub: sub.root, press: press.root, mri: mri.root, wed: wed.root, paris: paris.root, woods: woods.root, burb: burb.root };
  const FOGS = { city: cityFog, kit: null, mkt: null, sub: null, press: null, mri: null, wed: wed.fog, paris: paris.fog, woods: woodsFog, burb: burb.fog };
  const FAR = { city: 900, kit: 40, mkt: 80, sub: 60, press: 60, mri: 40, wed: 300, paris: 700, woods: 400, burb: 400 };
  if (woods.setMode) woods.setMode('summer');
  const toLocal = (key, v) => v.clone().sub(V3(...OFF[key]));

  // ---------------------------------------------------------------- cast
  const R = rng(18);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); return p; };
  const crowd = Array.from({ length: 26 }, () => {
    const style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: pick(TOPS), collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style,
      glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null });
    p.seed = R(); return p;
  });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const prez = person({ skin: 0xf0c8a8, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0xc9c4be, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(0xc0392b, 0.5), prez.spine, 0, 0.42, 0.135).rotation.x = -0.12;
  const groom = person({ skin: 0xc98e6a, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.06, 0.05, 0.02), mat(0xb8bcc2, 0.5), groom.spine, 0, 0.5, 0.14);
  const bride = person({ skin: 0xf1c3a1, top: 0xfbf8f2, pants: 0xfbf8f2, hair: 0x5a3a24, hairStyle: 'bob', dress: 0xfbf8f2 });
  const veil = mk(new THREE.ConeGeometry(0.2, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), bride.head.g, 0, 0.0, -0.08); veil.rotation.x = 0.25;
  const officiant = person({ skin: 0x9a6447, top: 0x2a2a2a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const shopper = person({ skin: 0xe2ad8c, top: 0xf1c24a, pants: 0x45607a, hair: 0x9a6a3a, hairStyle: 'bob' });
  const doctor = person({ skin: 0xc98e6a, top: 0xf4f6f8, collar: 0x7fb6d6, pants: 0x7fb6d6, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const nurse = person({ skin: 0xf1c3a1, top: 0x58b3a8, pants: 0x58b3a8, hair: 0x5a3a24, hairStyle: 'bob' });
  const grandma = person({ skin: 0xf1c3a1, top: 0xc0627a, pants: 0x6a5a6a, hair: 0xe8e4de, hairStyle: 'bob', glasses: true });
  const kid = person({ skin: 0xe9b48f, top: 0xf1c24a, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'messy', headR: 0.175 });
  const dog = makeDog(); scene.add(dog.g);
  const R2 = rng(77);
  const puffs = makeSpritePool(scene, 70, 'smoke');
  const puffCol = new THREE.Color(0xffffff);
  // cartoon impact stars (additive starbursts) + cyan "magnetized" glows
  const starTex = canvasTex(128, 128, (c, w) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 26 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const glowTex = canvasTex(128, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(120,230,255,.9)'); gr.addColorStop(0.6, 'rgba(80,200,255,.35)'); gr.addColorStop(1, 'rgba(80,200,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const glows = Array.from({ length: 20 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0, glowN = 0;
  /** an impact at time m, position p (LOCAL to set key): starburst + dust puffs */
  function impact(t, m, key, p, s = 1) {
    const age = t - m; if (age < 0 || age > 0.75) return;
    const o = OFF[key], w = V3(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
    if (age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    for (let k = 0; k < 3 && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + k * 2.1, r = (0.12 + age * 0.75) * s;
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y - 0.15 + k * 0.14 + age * 0.3, w.z + Math.sin(a) * r * 0.6), (0.3 + age * 0.9) * s, 0.75 * (1 - age / 0.75) ** 1.5, puffCol);
    }
  }
  function glow(t, m, rig, s = 1) { // a cyan shimmer around a body (the moment it becomes a magnet)
    const age = t - m; if (age < -0.15 || age > 0.6 || glowN >= glows.length) return;
    const k = age < 0 ? (age + 0.15) / 0.15 : 1 - age / 0.6, g = glows[glowN++];
    rig.spine.updateMatrixWorld(true); g.position.copy(rig.spine.localToWorld(V3(0, 0.25, 0))); g.visible = true;
    g.scale.set(1.0 * s, 2.0 * s, 1); g.material.opacity = 0.85 * k;
  }

  // ---------------------------------------------------------------- shared placement helpers
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _c = new THREE.Vector3();
  /** pose a rig: p in set-local coords. o.tilt (pitch, + = face-down forward), o.roll (around the facing axis). */
  function show(rig, key, p, o = {}) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    rig.root.rotation.x = o.tilt || 0; if (o.roll) rig.root.rotation.z += o.roll;
    rig.root.scale.setScalar(o.s || 1);
    rig.root.visible = true;
  }
  /** pose a rig by its BODY CENTER C (local): yaw/tilt/roll orient the whole body (flying, stuck, in a pile). Legs hang. */
  function showC(rig, key, p, C, yaw, tilt = 0, roll = 0, o = {}) {
    const s = o.s || 1;
    _e.set(tilt, yaw, roll); _c.set(0, HC * s, 0).applyEuler(_e);
    p.x = C[0] - _c.x; p.y = C[1] - _c.y; p.z = C[2] - _c.z; p.rotY = yaw;
    if (!o.grounded) p.floor = p.y - 2.5;
    show(rig, key, p, { tilt, roll, s });
  }
  /** pose a rig by its body center C (local) with a full orientation q (THREE.Quaternion: local +y = head, +z = face). */
  const _bm = new THREE.Matrix4();
  function showQ(rig, key, p, C, q) {
    p.x = 0; p.z = 0; p.y = 0; p.rotY = 0; p.floor = -3;
    show(rig, key, p);
    rig.root.quaternion.copy(q);
    _c.set(0, HC, 0).applyQuaternion(q);
    rig.root.position.set(C[0] - _c.x + OFF[key][0], C[1] - _c.y + OFF[key][1], C[2] - _c.z + OFF[key][2]);
  }
  /** quaternion whose +y = up (unit), +z as close to `front` as possible */
  function basisQ(up, front) {
    const U = up.clone().normalize(), F = front.clone().addScaledVector(U, -front.dot(U)).normalize(), X = new THREE.Vector3().crossVectors(U, F);
    _bm.makeBasis(X, U, F); return new THREE.Quaternion().setFromRotationMatrix(_bm);
  }
  /** a body flying from A to B (centers) between t0 and t1 with the magnetic pull; returns {C, u} */
  const flight = (t, t0, t1, a, b, arc = 0.25) => { const u = pull3((t - t0) / (t1 - t0)); return { u, C: [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + arc * Math.sin(u * PI), lerp(a[2], b[2], u)] }; };
  const jolts = [];   // impact times for the camera shake (pushed per frame)

  // ================================================================ 1. OPEN — a bus stop + a hardware store: everyone is yanked back onto the steel
  // the camera stands in the street looking at the sidewalk (+x); people face us, the steel is BEHIND them, so they land back-first, facing the lens
  const movers = [makeCar(0x6fa84f, 21), makeCar(0xf5f0e2, 22), makeCar(0xd2483f, 23)]; movers.forEach((c) => city.root.add(c.g));
  const steelC = mat(0xb9bec6, 0.3, { metalness: 0.6 }), glassC = new THREE.MeshStandardMaterial({ color: 0xcfe6f5, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false });
  { // bus shelter (x 5.9–6.85, z 2.1–4.5), bus-stop pole, newspaper boxes, a steel roll-down shutter on a HARDWARE store
    const g = new THREE.Group(); city.root.add(g);
    mk(new THREE.BoxGeometry(0.04, 1.9, 2.3), glassC, g, 6.82, 1.35, 3.3);
    for (const z of [2.15, 3.3, 4.45]) mk(new THREE.BoxGeometry(0.07, 2.3, 0.07), steelC, g, 6.82, 1.29, z);
    for (const y of [0.42, 2.3]) mk(new THREE.BoxGeometry(0.07, 0.07, 2.37), steelC, g, 6.82, y, 3.3);
    mk(new THREE.BoxGeometry(1.15, 0.08, 2.5), mat(0x3a4048, 0.5), g, 6.35, 2.45, 3.3);
    mk(new THREE.BoxGeometry(0.85, 1.9, 0.04), glassC, g, 6.37, 1.35, 2.15); mk(new THREE.BoxGeometry(0.07, 2.3, 0.07), steelC, g, 5.95, 1.29, 2.15);
    const ad = mk(new THREE.BoxGeometry(0.85, 1.5, 0.08), new THREE.MeshBasicMaterial({ map: canvasTex(200, 360, (c, w, h) => { c.fillStyle = '#f2b632'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; c.textAlign = 'center'; c.font = 'bold 38px Helvetica, Arial, sans-serif'; c.fillText('FALL', w / 2, 110); c.fillText('SALE', w / 2, 156); c.font = 'bold 70px Helvetica, Arial, sans-serif'; c.fillStyle = '#d23a3f'; c.fillText('50%', w / 2, 250); }), toneMapped: false }), g, 6.37, 1.25, 4.45);
    void ad;
    mk(new THREE.BoxGeometry(0.42, 0.05, 1.4), mat(0x7a5a3a, 0.7), g, 6.5, 0.6, 3.5); for (const z of [2.95, 4.05]) mk(new THREE.BoxGeometry(0.05, 0.46, 0.05), steelC, g, 6.5, 0.37, z);
    mk(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), steelC, g, 4.55, 1.44, 4.25);
    const sign = mk(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c, w) => { c.fillStyle = '#2f6aa8'; c.fillRect(0, 0, w, w); c.fillStyle = '#fff'; c.font = 'bold 44px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS', w / 2, 46); c.fillText('42', w / 2, 92); }), toneMapped: false }), g, 4.55, 2.6, 4.25);
    sign.rotation.z = PI / 2;
    const shutT = canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#c4c9cf'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { c.fillStyle = 'rgba(70,80,90,.35)'; c.fillRect(0, y, w, 3); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(0, y + 4, w, 2); } }, [1, 3]);
    const shut = mk(new THREE.PlaneGeometry(2.1, 2.55), new THREE.MeshStandardMaterial({ map: shutT, roughness: 0.4, metalness: 0.5 }), g, 6.97, 1.42, 5.85); shut.rotation.y = -PI / 2;
    const hw = mk(new THREE.PlaneGeometry(2.3, 0.45), new THREE.MeshBasicMaterial({ map: canvasTex(384, 76, (c, w, h) => { c.fillStyle = '#d23a3f'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 50px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HARDWARE', w / 2, h / 2 + 3); }), toneMapped: false }), g, 6.95, 2.95, 5.85); hw.rotation.y = -PI / 2;
    for (const [z, col] of [[1.55, 0xd2483f], [1.95, 0x2f6aa8]]) { mk(new THREE.BoxGeometry(0.4, 0.95, 0.38), mat(col, 0.45, { metalness: 0.3 }), g, 6.6, 0.62, z); }
    mk(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), steelC, g, 4.35, 0.64, 6.6); mk(new THREE.BoxGeometry(0.16, 0.24, 0.12), steelC, g, 4.35, 1.24, 6.6);
  }
  const CURB = 0.14;
  { const fillO = new THREE.DirectionalLight(0xfff1dc, 1.5); fillO.position.set(-8, 7, 1); fillO.target.position.set(6.5, 1, 4.5); city.root.add(fillO, fillO.target); }   // light the storefront (it faces away from the sun)
  // [x, z0, v(+z), standing yaw | null = walking] → target [x, y, z] on the steel (back-first, facing −x = the camera)
  const OPEN_CAST = [
    { x: 4.95, z0: 0.2, v: 0.85, tgt: [6.68, 1.35, 5.05], gary: true },
    { x: 5.35, z0: 11.6, v: -1.0, tgt: [6.8, 1.15, 6.4] },
    { x: 4.85, z0: -3.0, v: 1.0, tgt: [4.55, 1.15, 4.0], hug: true },
    { x: 5.7, z0: 12.4, v: -0.95, tgt: [6.8, 1.75, 6.6] },
    { x: 5.55, z0: 2.6, v: 0, tgt: [6.66, 1.3, 2.7] },
    { x: 5.45, z0: 3.35, v: 0, tgt: [6.66, 1.6, 3.5] },
    { x: 6.35, z0: 3.95, v: 0, tgt: [6.66, 1.15, 4.1], sit: true },
    { x: 5.2, z0: 9.6, v: -0.8, tgt: [6.8, 1.0, 5.6] },
  ].map((c, i) => ({ ...c, delay: [0, 0.07, 0.03, 0.1, 0.05, 0.08, 0.02, 0.12][i] }));
  function walkerPose(t, i) {
    const w = OPEN_CAST[i], p = basePose(); p.eyes = blink(t, i);
    const T = M1 + 0.16 + w.delay, LAND = T + 0.3, z = w.z0 + w.v * Math.min(t, M1);
    if (t < T) {
      if (w.sit) { Object.assign(p, { x: w.x, z, rotY: -PI / 2, footFwd: 0.42, y: 0.62 - SIT, floor: CURB }); p.armA = A(-0.7, 0.1, -1.4, 0.5); p.armB = A(-0.7, 0.1, -1.4, -0.5); p.headPitch = 0.3; }
      else if (w.v === 0) { Object.assign(p, { x: w.x, z, rotY: -PI / 2 + 0.15 * (i % 2 ? 1 : -1), y: CURB, floor: CURB }); p.armB = A(-0.9, 0.2, -1.9, -0.5); p.headPitch = 0.3; p.headYaw = 0.3 * Math.sin(t * 0.6 + i); }
      else Object.assign(p, { x: w.x, z, rotY: w.v > 0 ? 0 : PI, dist: Math.abs(w.v) * Math.min(t, M1), speed: t < M1 ? Math.abs(w.v) : 0, y: CURB, floor: CURB });
      p.mouth = w.v === 0 ? 'flat' : 'smile';
      const sh = K(t, [[M1 - 0.04, 0], [M1 + 0.06, 1]]);          // freeze + shiver toward the steel
      if (sh > 0) { p.mouth = 'o'; p.armA = A(-0.5, 0.6 * sh, -0.6); p.armB = A(-0.5, 0.6 * sh, -0.6); p.headPitch = -0.1; p.x += 0.03 * Math.sin(t * 70) * sh; }
      return { p, mode: 'walk' };
    }
    const st = [w.x, (w.sit ? 0.62 : CURB) + HC * (w.sit ? 0.6 : 1), z], B = w.tgt;
    const f = flight(t, T, LAND, st, B, 0.18);
    const face = w.hug ? (w.v > 0 ? 0 : PI) : -PI / 2 + (i % 2 ? 0.12 : -0.12);
    const yaw0 = w.sit || w.v === 0 ? -PI / 2 : w.v > 0 ? 0 : PI;
    if (f.u < 1) { p.armA = BACK_A; p.armB = BACK_B; p.mouth = 'o'; return { p, mode: 'fly', C: f.C, yaw: lerpAngle(yaw0, face, Math.min(1, f.u * 2)), tilt: w.hug ? 0.3 : -0.55 * Math.sin(f.u * PI) }; }
    const age = t - LAND;
    if (w.hug) { p.armA = HUG_A; p.armB = HUG_B; p.footFwd = 0.2; p.headYaw = -0.9; p.mouth = 'o'; }
    else { p.armA = wig(SPLAT_A, t, i, 0.6); p.armB = wig(SPLAT_B, t, i + 2, 0.6); p.mouth = age < 0.9 ? 'o' : (i % 3 ? 'flat' : 'o'); p.headYaw = 0.3 * Math.sin(t * 0.9 + i) * clamp(age - 1); p.footFwd = 0.12 * Math.sin(t * 7 + i); }
    const slide = i === 7 ? 0.3 * K(t, [[LAND + 1.0, 0], [LAND + 3.0, 1]]) : 0;   // one slowly slides down the shutter
    return { p, mode: 'stuck', C: [B[0], B[1] - slide, B[2]], yaw: face, land: LAND, B };
  }

  // ================================================================ 2. KITCHEN — Gary + cutlery + the fridge
  const kToaster = kit.root.children.find((o) => o.isMesh && Math.abs(o.position.x + 0.85) < 0.01 && Math.abs(o.position.y - 0.95) < 0.01);
  if (kToaster) kToaster.visible = false;
  const toaster = makeToaster(); scene.add(toaster.g);
  const pan = makePan(); scene.add(pan);
  const mug = makeMug(0xd2483f); gary.arms.find((a) => a.s === 1).hand.add(mug.g ?? mug); (mug.g ?? mug).position.set(0, -0.06, 0.05);
  const mugG = mug.g ?? mug;
  // dish rack by the sink with the cutlery that flies
  const rack = new THREE.Group(); rack.position.set(0.42, 0.87, -2.3); kit.root.add(rack);
  mk(new THREE.BoxGeometry(0.34, 0.12, 0.26), mat(0xdfe3e6, 0.4), rack, 0, 0.06, 0);
  const CUT = 12, cutlery = Array.from({ length: CUT }, (_, k) => { const f = makeFork(k % 2 === 1); f.scale.setScalar(1.7); scene.add(f); return f; });
  // attach points on Gary's front (spine local) + handle direction
  const CUT_AT = Array.from({ length: CUT }, (_, k) => V3(-0.15 + (k % 4) * 0.1, 0.2 + Math.floor(k / 4) * 0.11, 0.16));   // spine local (origin at the pelvis): chest height
  const FRIDGE = [-2.45, -1.82];                 // fridge door center (x, z face)
  const GARY0 = [-1.05, -0.85];
  const CUT_T = (k) => 10.2 + k * 0.08, TOAST_T = 11.25, PAN_T = 11.75, YANK = 12.35, SLAM = 12.62;
  function garyKitchen(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    p.armB = MUG_B; p.armA = REST;
    const sip = K(t, [[9.4, 0], [9.7, 1], [10.0, 1], [10.25, 0]]);
    p.armB = mixArm(MUG_B, A(-1.3, 0.25, -2.35, -0.5), sip); p.headPitch = -0.15 * sip; p.mouth = 'flat';
    let C = [GARY0[0], HC, GARY0[1]], yaw = 0.55, tilt = 0;
    const hit = (k) => K(t, [[CUT_T(k) + 0.22, 0], [CUT_T(k) + 0.27, 1], [CUT_T(k) + 0.4, 0]]);
    let jerk = 0; for (let k = 0; k < CUT; k++) jerk = Math.max(jerk, hit(k));
    jerk = Math.max(jerk, K(t, [[TOAST_T + 0.25, 0], [TOAST_T + 0.3, 1], [TOAST_T + 0.5, 0]]), K(t, [[PAN_T + 0.25, 0], [PAN_T + 0.3, 1], [PAN_T + 0.5, 0]]));
    if (t > 10.25) { p.mouth = 'o'; p.lean = -0.12 * jerk; p.headPitch = 0.25 * (1 - jerk) * clamp((t - 10.3) / 0.3); p.armA = A(-0.4, 0.6, -0.5, 0.3); }
    if (t > PAN_T + 0.3) { p.headPitch = -0.1; }
    if (t > YANK) { // pulled backward onto the fridge
      const f = flight(t, YANK, SLAM, [GARY0[0], HC, GARY0[1]], [FRIDGE[0], HC + 0.32, FRIDGE[1] + 0.2], 0.1);
      C = f.C; yaw = lerpAngle(0.55, 0.15, f.u); tilt = f.u < 1 ? 0.35 * Math.sin(f.u * PI) : 0;
      p.armA = mixArm(p.armA, BACK_A, Math.min(1, f.u * 3)); p.armB = mixArm(p.armB, A(0.6, 0.6, -1.6, -0.4), Math.min(1, f.u * 3));
      if (f.u >= 1) { p.armA = wig(SPLAT_A, t, 1, 0.35); p.armB = A(-0.4, 1.3, -1.7, -0.5); p.mouth = t < 13.4 ? 'o' : 'flat'; p.headPitch = 0; p.headYaw = t > 13.4 ? 0.12 : 0; p.footFwd = 0.1 * Math.sin(t * 6); }
      return { p, C, yaw, tilt, air: true };
    }
    return { p, C, yaw, tilt, air: false };
  }
  /** place a prop flying from a kitchen spot to an attach point on a rig part (world), with a final orientation */
  const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();
  function flyProp(obj, t, t0, dur, fromLocalKit, part, at, attachQ) {
    part.updateMatrixWorld(true);
    const target = part.localToWorld(at.clone());
    part.getWorldQuaternion(_q2); _q2.multiply(attachQ);
    const src = V3(fromLocalKit[0] + OFF.kit[0], fromLocalKit[1], fromLocalKit[2] + OFF.kit[2]);
    const u = pull3((t - t0) / dur);
    obj.position.lerpVectors(src, target, u); obj.position.y += 0.15 * Math.sin(u * PI);
    _q1.setFromEuler(new THREE.Euler(0, 0, u < 1 ? (t - t0) * 9 : 0)); obj.quaternion.copy(_q1).slerp(_q2, Math.min(1, u * 1.3));
    obj.visible = true;
    return u;
  }
  const Q_OUT = new THREE.Quaternion().setFromEuler(new THREE.Euler(PI / 2, 0, 0));      // handle (+y) pointing out of the chest (+z)
  const Q_BELLY = new THREE.Quaternion().setFromEuler(new THREE.Euler(PI / 2, 0, 0));
  const Q_HAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 2 + 0.3, 0.15));

  // ================================================================ 3. MARKET — the cart snake
  const NC = 12, carts = Array.from({ length: NC }, () => { const c = makeCart(); mkt.root.add(c); return c; });
  const SH_RUN = 17.4, SH_STOP = 18.5, V_RUN = 2.4, V_CART = 7.0, SCOOP_Z = -0.35;
  const shopZ = (t) => (t < SH_RUN ? -7.0 + 1.0 * (t - 14.6) : Math.min(-7.0 + 1.0 * (SH_RUN - 14.6) + V_RUN * (SH_STOP - SH_RUN), -7.0 + 1.0 * (SH_RUN - 14.6) + V_RUN * (t - SH_RUN)));
  const Z_STOP = shopZ(SH_STOP);
  const gapAt = (t) => lerp(1.0, 0.62, clamp((t - 14.6) / 2.8));   // the snake bunches up (carts nest)
  const startZ = (k) => Z_STOP - (0.9 + k * gapAt(SH_STOP));
  // cart 0 rolls into her (scoops her into the basket) and coasts to SCOOP_Z; the rest jam behind it, the last ones fly onto the heap
  const T_SCOOP = SH_STOP + (Z_STOP - 0.45 - startZ(0)) / V_CART;
  const cart0Z = (t) => { if (t < T_SCOOP) return startZ(0) + V_CART * (t - SH_STOP); const u = clamp((t - T_SCOOP) / 0.45); return lerp(Z_STOP - 0.45, SCOOP_Z, 1 - (1 - u) * (1 - u)); };
  const TK = Array.from({ length: NC }, (_, k) => { if (k === 0) return T_SCOOP; for (let tt = SH_STOP; tt < 22; tt += 1 / 240) { if (startZ(k) + V_CART * (tt - SH_STOP) >= cart0Z(tt) - 0.42 * Math.min(k, 6)) return tt; } return 22; });
  const HEAP = Array.from({ length: NC }, (_, k) => [(k % 2 ? 0.32 : -0.3) * (k > 8 ? 0.5 : 1), 0.62 + Math.floor((k - 6) / 2) * 0.42, SCOOP_Z - 0.75 - ((k - 6) % 3) * 0.32]);
  function cartAt(t, k) {
    if (t < SH_STOP) {
      const z = shopZ(t), cz = z - (0.9 + k * gapAt(t));
      return { x: 0.32 * Math.sin(cz * 1.15 + k * 0.9) * (k ? 1 : 0.3), y: 0, z: cz, rx: 0, ry: 0.22 * Math.cos(cz * 1.15 + k * 0.9) * (k ? 1 : 0.3), rz: 0, tk: TK[k] };
    }
    if (k === 0) return { x: 0, y: 0, z: cart0Z(t), rx: -0.1 * K(t, [[T_SCOOP, 1], [T_SCOOP + 0.35, 0]]) * (t > T_SCOOP ? 1 : 0), ry: 0, rz: 0, tk: TK[0] };
    const free = startZ(k) + V_CART * (t - SH_STOP), x0 = 0.32 * Math.sin(startZ(k) * 1.15 + k * 0.9) * clamp(1 - (t - SH_STOP) / 0.4);
    if (k < 6 || t < TK[k]) { const z = Math.min(free, cart0Z(t) - 0.42 * Math.min(k, 6)); return { x: x0, y: 0, z, rx: t > TK[k] ? -0.15 * K(t, [[TK[k], 1], [TK[k] + 0.3, 0]]) : 0, ry: 0, rz: 0, tk: TK[k] }; }
    const u = clamp((t - TK[k]) / 0.35), from = cart0Z(TK[k]) - 0.42 * 6, H = HEAP[k];
    return { x: lerp(x0, H[0], u), y: H[1] * u + 0.5 * Math.sin(u * PI), z: lerp(from, H[2], u), rx: (k % 2 ? -0.9 : 0.75) * u, ry: 0.2 * (k % 3 - 1) * u, rz: (k % 3 - 1) * 0.5 * u, tk: TK[k] + 0.35 };
  }
  function shopperPose(t) {
    const p = basePose(); p.eyes = blink(t, 4);
    const z = shopZ(t), run = t > SH_RUN && t < SH_STOP;
    const d = t < SH_RUN ? 1.0 * (t - 14.6) : 1.0 * (SH_RUN - 14.6) + (Math.min(t, SH_STOP) - SH_RUN) * V_RUN;
    Object.assign(p, { x: 0.05, z, rotY: 0, dist: d, speed: t < SH_RUN ? 1.0 : run ? V_RUN : 0 });
    p.armA = A(-0.6, 0.2, -1.2, 0.5); p.armB = A(-0.4, 0.15, -0.3, -0.2);
    const look = K(t, [[16.3, 0], [16.7, 1], [17.1, 1], [17.4, 0]]);
    p.headYaw = 1.2 * look; p.mouth = t > 16.5 ? 'o' : 'flat';
    if (run) { p.lean = 0.25; p.armA = A(-0.9 * Math.sin(t * 14), 0.2, -1.2, 0.2); p.armB = A(0.9 * Math.sin(t * 14), 0.2, -1.2, -0.2); }
    if (t >= SH_STOP && t < T_SCOOP) { p.headYaw = 1.4; p.armA = A(-2.3, 0.6, -0.5); p.armB = A(-2.3, 0.6, -0.5); p.lean = -0.1; }
    if (t >= T_SCOOP) { // scooped into the basket: sitting in cart 0, legs up over the front, facing us
      const cz = cart0Z(t), up = K(t, [[T_SCOOP, 0], [T_SCOOP + 0.15, 1]]);
      Object.assign(p, { x: 0, z: cz + 0.05, rotY: 0, y: lerp(0, 0.6 - SIT + 0.04, up), floor: lerp(0, 0.95, up), footFwd: lerp(0, 0.8, up), lean: -0.2, dist: 0, speed: 0 });
      p.armA = wig(A(-2.5, 0.7, -0.4), t, 1, 0.5); p.armB = wig(A(-2.5, 0.7, -0.4), t, 2, 0.5); p.mouth = t > 19.9 ? 'flat' : 'o'; p.headYaw = 0;
    }
    return p;
  }
  function stuckShelf(t, i) { // two shoppers glued to the steel shelves (faces), wriggling
    const p = basePose(); p.eyes = blink(t, i + 7); p.armA = wig(SPLAT_A, t, i, 0.5); p.armB = wig(SPLAT_B, t, i + 1, 0.5); p.mouth = i ? 'flat' : 'o';
    p.headYaw = -0.4 * Math.sin(t * 0.8 + i);
    return { p, C: [i ? 1.38 : -1.38, 1.2 + i * 0.25, i ? -2.2 : -4.3], yaw: i ? -PI / 2 : PI / 2 };
  }

  // ================================================================ 4. SUBWAY — strangers attract, then the whole car becomes a ball
  const MEET = 22.75, BALL = [0, 1.0, -0.7];
  const STR = [{ side: -1, z: -0.7 }, { side: 1, z: -0.7 }];
  // commuters stuck to steel at the start (center, yaw, tilt, arms) — each flies into the ball at JOIN[i]
  const SUBS = [
    { C: [0, 1.0, 0.82], yaw: 0.15, tilt: 0, arms: 'splat' },             // back to the pole at z 0.6 (near), facing us
    { C: [SD.barX - 0.05, 1.25, -2.4], yaw: -PI / 2 - 0.3, tilt: 0, arms: 'up' },   // hanging from the overhead bar
    { C: [-SD.halfW + 0.2, 1.05, 2.6], yaw: PI / 2 + 0.5, tilt: 0, arms: 'splat' }, // flat on the door glass (left, near)
    { C: [0.12, 1.0, -4.15], yaw: -PI / 2, tilt: 0, arms: 'hug' },                  // hugging the far pole
    { C: [SD.halfW - 0.22, 1.1, 1.9], yaw: -PI / 2 - 0.4, tilt: 0, arms: 'splat' }, // right wall, near
    { C: [-0.65, 1.3, -3.2], yaw: PI / 2, tilt: 0, arms: 'up' },                    // left overhead bar, far
    { C: [0.05, 0.95, -6.0], yaw: PI, tilt: 0, arms: 'splat' },                     // far pole
  ];
  const JOIN = SUBS.map((_, i) => 23.55 + i * 0.11);
  const SLOTS = [   // around the hugging strangers: backs stuck to the pile, faces out (the camera sees the front ones)
    { a: 0.1, y: -0.05, tilt: -0.15, roll: 0.15 }, { a: 1.1, y: 0.2, tilt: 0.1, roll: -0.35 }, { a: -1.05, y: 0.15, tilt: -0.1, roll: 0.4 },
    { a: 2.2, y: 0.3, tilt: 0.2, roll: 0.3 }, { a: -2.3, y: 0.25, tilt: 0.15, roll: -0.3 }, { a: PI, y: 0.1, tilt: 0, roll: 0 },
    { top: true },
  ].map((q) => q.top ? { C: [BALL[0] + 0.05, BALL[1] + 0.98, BALL[2]], yaw: 0.3, tilt: -PI / 2 + 0.15, roll: 0.2 }
    : { C: [BALL[0] + Math.sin(q.a) * 0.5, BALL[1] + q.y, BALL[2] + Math.cos(q.a) * 0.5], yaw: q.a, tilt: q.tilt, roll: q.roll });
  function strangerPose(t, k) {
    const s = STR[k].side, p = basePose(); p.eyes = blink(t, k + 3);
    const seatX = s * (SD.halfW - 0.33);
    const strain = K(t, [[21.2, 0], [21.6, 1]]);
    if (t < MEET - 0.3) { // seated, leaning back from each other, gripping the seat
      Object.assign(p, { x: seatX, z: STR[k].z, rotY: -s * PI / 2, footFwd: 0.42 - 0.08 * strain, lean: -0.25 * strain + 0.05 * Math.sin(t * 9 + k) * strain, y: SD.seatY - SIT, floor: 0 });
      p.armA = A(0.25, 0.25, -0.3, 0.2); p.armB = A(0.25, 0.25, -0.3, -0.2); p.mouth = strain > 0.5 ? 'flat' : 'smile'; p.headYaw = 0.5 * strain * (k ? 1 : -1);
      return { p, seated: true };
    }
    const f = flight(t, MEET - 0.3, MEET, [seatX * 0.95, SD.seatY + 0.45, STR[k].z], [s * 0.17, BALL[1] + 0.02, BALL[2]], 0.12);
    p.mouth = 'o'; p.armA = f.u < 1 ? SUPER_A : HUG_A; p.armB = f.u < 1 ? SUPER_B : HUG_B;
    if (f.u >= 1) { p.headYaw = (k ? 0.55 : -0.55) * K(t, [[MEET + 0.3, 0], [MEET + 0.6, 1]]); p.mouth = t > MEET + 0.6 ? 'flat' : 'o'; p.eyes = t > MEET + 1.4 && t < MEET + 1.6 ? 'closed' : p.eyes; }
    return { p, C: f.C, yaw: -s * PI / 2, tilt: f.u < 1 ? 0.6 * Math.sin(f.u * PI) : 0 };
  }
  function commuterPose(t, i) {
    const S = SUBS[i], p = basePose(); p.eyes = blink(t, i + 9);
    const arms = S.arms === 'up' ? [A(-2.6, 0.4, -0.5, 0.2), A(-2.6, 0.4, -0.5, -0.2)] : S.arms === 'hug' ? [HUG_A, HUG_B] : [wig(SPLAT_A, t, i, 0.5), wig(SPLAT_B, t, i + 1, 0.5)];
    p.armA = arms[0]; p.armB = arms[1]; p.mouth = i % 2 ? 'flat' : 'o'; p.headYaw = 0.3 * Math.sin(t * 0.7 + i);
    p.footFwd = 0.1 * Math.sin(t * 5 + i);
    if (t < JOIN[i]) return { p, C: S.C, yaw: S.yaw, tilt: S.tilt };
    const f = flight(t, JOIN[i], JOIN[i] + 0.28, S.C, SLOTS[i].C, 0.1);
    p.armA = f.u < 1 ? SUPER_A : wig(SPLAT_A, t, i, 0.5); p.armB = f.u < 1 ? SUPER_B : wig(SPLAT_B, t, i + 1, 0.5); p.mouth = 'o';
    if (f.u >= 1 && t > 24.4) p.mouth = i % 3 ? 'flat' : 'smile';
    return { p, C: f.C, yaw: lerpAngle(S.yaw, SLOTS[i].yaw, f.u), tilt: lerp(S.tilt, SLOTS[i].tilt, f.u), roll: lerp(0, SLOTS[i].roll, f.u) };
  }
  // a few seated riders at the far end (just reading, stuck to the kick panels) for depth
  function riderPose(t, i) {
    const s = i % 2 ? 1 : -1, p = basePose(); p.eyes = blink(t, i + 13);
    Object.assign(p, { x: s * (SD.halfW - 0.33), z: -5.2 - (i >> 1) * 1.0, rotY: -s * PI / 2, footFwd: 0.42, y: SD.seatY - SIT, floor: 0 });
    p.armA = A(-0.7, 0.1, -1.4, 0.5); p.armB = A(-0.7, 0.1, -1.4, -0.5); p.headPitch = 0.35; p.mouth = 'flat';
    if (t > 24.1) { const look = K(t, [[24.1, 0], [24.4, 1]]); p.headPitch = 0.35 - 0.35 * look; p.headYaw = -s * 0.9 * look; }
    return p;
  }

  // ================================================================ 5. PRESS — mics fly, then every row of chairs slides into the stage
  const chairs = [];   // regroup the set's chair meshes (rows × seats) into movable groups
  for (const z of PD.rows) for (const x of PD.seats) {
    const g = new THREE.Group(); g.position.set(x, 0, z); press.root.add(g);
    for (const o of [...press.root.children]) if (o.isMesh && o.position.y < 1.0 && Math.abs(o.position.x - x) < 0.26 && Math.abs(o.position.z - z) < 0.3) { o.position.x -= x; o.position.z -= z; press.root.remove(o); g.add(o); }
    chairs.push({ g, x, z, row: PD.rows.indexOf(z) });
  }
  const tvCam = press.root.children.find((o) => o.isGroup && Math.abs(o.position.x - 3.6) < 0.01 && Math.abs(o.position.z - 4.4) < 0.01);
  const SLIDE = 28.45, MICS = 28.25;
  const rowStop = (r) => -1.42 + r * 0.53;
  const rowHit = (r) => SLIDE + 0.42 + r * 0.07;
  const rowZ = (t, r) => { const z0 = PD.rows[r], z1 = rowStop(r), u = pull3((t - SLIDE) / (rowHit(r) - SLIDE)); return lerp(z0, z1, u); };
  const MIC_COLS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xffffff, 0x8f6fb8, 0xe08a3a, 0x4fb3a8];
  const mics = MIC_COLS.map((c) => { const m = makeMic(c); scene.add(m); return m; });
  const reporters = [];   // [chair index] for 15 seated reporters
  chairs.forEach((c, i) => { if ((i * 7) % 9 !== 0 && reporters.length < 16) reporters.push(i); });
  function prezPose(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: PD.speaker[0], z: PD.speaker[1] + 0.05, rotY: 0, y: 0.25, floor: 0.25 });
    p.armB = mixArm(TALK_B, A(-0.6, 0.3, -1.6, -0.4), 0.5 + 0.5 * Math.sin(t * 3)); p.armA = A(-0.5, 0.12, -0.7, 0.3);
    p.mouth = Math.sin(t * 11) > 0 ? 'o' : 'flat';
    if (t > MICS) { const k = K(t, [[MICS, 0], [MICS + 0.3, 1]]); p.lean = -0.2 * k; p.mouth = 'o'; p.armA = mixArm(p.armA, A(-0.3, 1.0, -0.3, 0.3), k); p.armB = mixArm(p.armB, A(-0.3, 1.0, -0.3, -0.3), k); }
    if (t > 29.6) { p.mouth = 'flat'; p.lean = -0.08; p.headYaw = 0.0; }
    return p;
  }
  const MIC_AT = MIC_COLS.map((_, k) => { const a = -PI / 2 + (k - 3.5) * 0.32; return V3(Math.cos(a) * 0.14 * 0 + (k - 3.5) * 0.045, -0.02 + Math.abs(k - 3.5) * 0.012, 0.16); });

  // ================================================================ 6. MRI — the human sunflower
  const [BX, BY] = MD.bore, BF = MD.boreFront;
  const SUCK = 31.75;
  const PETALS = [   // angle around the bore (deg), who, join time
    { a: 90, t: 32.55 }, { a: 140, t: 33.2 }, { a: 40, t: 33.55 }, { a: 180, t: 33.9 }, { a: 0, t: 34.2 }, { a: 115, t: 34.55 }, { a: 65, t: 34.85 },
  ];
  const ENTRY = [3.0, 1.3, 1.2];   // where the corridor people fly in from (right edge of frame)
  function doctorPose(t) {
    const p = basePose(); p.eyes = blink(t, 5);
    const x0 = 1.15, z0 = 0.9;
    if (t < SUCK) { // walks past the scanner reading a clipboard
      const d = 0.55 * (t - 30.8);
      Object.assign(p, { x: x0 - d, z: z0 - 0.2 * d, rotY: -PI / 2 - 0.2, dist: d, speed: 0.55 });
      p.armA = A(-0.8, 0.1, -1.4, 0.5); p.armB = A(-0.8, 0.1, -1.4, -0.5); p.headPitch = 0.35; p.mouth = 'flat';
      return { p, walk: true };
    }
    const from = [x0 - 0.52, HC, z0 - 0.1], into = [BX, BY, BF - 0.75];   // head-first into the bore: only the legs stick out
    const f = flight(t, SUCK, SUCK + 0.32, from, into, 0.05);
    p.armA = SUPER_A; p.armB = SUPER_B; p.mouth = 'o';
    const kick = f.u >= 1 ? 1 : 0;
    p.footFwd = kick * 0.25 * Math.sin(t * 13);
    return { p, C: f.C, yaw: PI, tilt: lerp(0.3, PI / 2, Math.min(1, f.u * 1.4)) };
  }
  function petalPose(t, i, rig) {
    const P = PETALS[i], a = (P.a * PI) / 180, p = basePose(); p.eyes = blink(t, i + 2);
    // head at the bore rim, body radiating outward AND toward the camera (a sunflower opening at us — fits under the ceiling)
    const d = V3(Math.cos(a), Math.sin(a), 1.25).normalize(), head = V3(BX + Math.cos(a) * 0.46, BY + Math.sin(a) * 0.46, BF + 0.22);
    const Cv = head.clone().addScaledVector(d, 0.72), C = [Cv.x, Cv.y, Cv.z], qStuck = basisQ(d.clone().negate(), V3(0, 0.15, 1));
    const from = i === 0 ? [-0.6, HC, 0.4] : [ENTRY[0], ENTRY[1] + (i % 3) * 0.3, ENTRY[2] - (i % 2) * 0.6];
    if (t < P.t - 0.35) {
      if (i !== 0) return null;   // only the nurse is in the room before; the rest arrive from the corridor
      Object.assign(p, { x: -0.6, z: 0.4, rotY: 0.6 }); p.mouth = t > SUCK + 0.2 ? 'o' : 'smile'; p.armA = A(-0.6, 0.3, -1.2, 0.4); p.armB = A(-0.6, 0.3, -1.2, -0.4);
      if (t > SUCK + 0.2) { p.armA = A(-2.4, 0.5, -0.4); p.armB = A(-2.4, 0.5, -0.4); }
      return { p, ground: true };
    }
    const f = flight(t, P.t - 0.35, P.t, from, C, 0.2);
    p.mouth = 'o'; p.armA = f.u < 1 ? SUPER_A : wig(LOW_A, t, i, 0.6); p.armB = f.u < 1 ? SUPER_B : wig(LOW_B, t, i + 1, 0.6);
    if (f.u >= 1 && t > P.t + 0.7) p.mouth = i % 3 === 1 ? 'smile' : 'flat';
    const qFly = basisQ(V3(C[0] - from[0], C[1] - from[1], C[2] - from[2]), V3(0, 1, 0.2));   // flying head-first
    return { p, C: f.C, q: qFly.slerp(qStuck, clamp((f.u - 0.55) / 0.45)) };
  }
  // flying hospital objects: IV stand, supply cart, wheelchair → clang onto the scanner face (bottom)
  const OBJ = [{ o: mri.iv, t: 34.0, to: [0.95, 0.15, BF + 0.12], r: [0, 0, -0.5] }, { o: mri.cart, t: 34.35, to: [-1.0, 0.0, BF + 0.3], r: [0, 0.3, 0.2] }, { o: mri.chair, t: 35.15, to: [0.0, 0.0, BF + 0.4], r: [0, -0.1, 0] }];
  OBJ.forEach((q) => { q.from = q.o.position.clone(); q.rot0 = q.o.rotation.clone(); });

  // ================================================================ 7. WEDDING — same poles
  const REPEL = 37.55, TURN = 38.8, SNAP = 39.45;
  const [BRX, BRZ] = WD.bride, [GRX, GRZ] = WD.groom;
  function couplePose(t, who) {
    const isB = who === 'bride', s = isB ? 1 : -1, p = basePose(); p.eyes = blink(t, isB ? 3 : 6);
    // lean in for the kiss (they creep closer), an invisible force holds them off, then BOOM: blasted apart
    const lean = K(t, [[36.5, 0], [37.2, 1]]);
    let x = (isB ? BRX : GRX) - s * 0.18 * lean, z = (isB ? BRZ : GRZ), rotY = -s * PI / 2, y = 0, sit = 0;
    p.lean = 0.35 * lean; p.headPitch = 0.1; p.mouth = 'smile'; p.armA = A(-0.6, 0.2, -0.5, 0.2); p.armB = A(-0.6, 0.2, -0.5, -0.2);
    if (t > 36.9 && t < REPEL) { p.lean += 0.06 * Math.sin(t * 30); x += s * 0.02 * Math.sin(t * 40); p.mouth = 'flat'; }
    const blast = K(t, [[REPEL, 0], [REPEL + 0.45, 1]], (u) => 1 - (1 - u) * (1 - u));
    if (t >= REPEL) {
      x = lerp(x, s * 1.25, blast); y = 0.45 * Math.sin(blast * PI); sit = K(t, [[REPEL + 0.38, 0], [REPEL + 0.48, 1]]);
      p.armA = A(-1.6, 0.9, -0.3); p.armB = A(-1.6, 0.9, -0.3); p.mouth = 'o'; p.lean = -0.3;
    }
    if (!isB && t > TURN - 0.5) { // the groom gets up, thinks, turns around (back to her)
      const up = K(t, [[TURN - 0.5, 0], [TURN - 0.1, 1]]), turn = K(t, [[TURN, 0], [TURN + 0.35, 1]]);
      sit = 1 - up; rotY = lerpAngle(PI / 2, -PI / 2, turn); p.mouth = turn > 0.5 ? 'smile' : 'flat'; p.lean = 0; p.armA = REST; p.armB = REST;
      if (t > SNAP) { const hit = K(t, [[SNAP, 0], [SNAP + 0.08, 1], [SNAP + 0.3, 0]]); p.lean = 0.25 * hit; p.mouth = 'smile'; p.armA = CHEER_A; p.armB = CHEER_B; p.headYaw = 1.0 * K(t, [[SNAP + 0.3, 0], [SNAP + 0.6, 1]]); }
    }
    if (isB && t > SNAP - 0.32) { // she is yanked across into a back hug
      const f = K(t, [[SNAP - 0.32, 0], [SNAP, 1]], pull3), gx = s * -1.25;
      x = lerp(1.25, gx + 0.32, f); y = 0.15 * Math.sin(f * PI); sit = 1 - Math.min(1, f * 3);
      rotY = -PI / 2; p.armA = HUG_A; p.armB = HUG_B; p.mouth = 'smile'; p.lean = 0.15; p.eyes = t > SNAP + 0.5 ? 'closed' : p.eyes; p.headYaw = 0.9 * K(t, [[SNAP + 0.2, 0], [SNAP + 0.5, 1]]);
    }
    Object.assign(p, { x, z: z + 0.05, rotY, y: y + lerp(0, SIT * -1 + 0.0, 0) });
    return { p, sit };
  }
  function guestPose(t, i) {
    if (i >= 12) return null;
    const row = WD.rows[i % 3], side = i % 2 ? -1 : 1, sx = WD.seats[Math.floor(i / 2) % 4];
    const p = basePose(); p.eyes = blink(t, i + 4);
    Object.assign(p, { x: side * sx, z: row - 0.05, rotY: PI, footFwd: 0.42, y: WD.seat - SIT, floor: 0 });
    p.headYaw = 0.2 * Math.sin(t * 0.8 + i);
    const gasp = K(t, [[REPEL + 0.1, 0], [REPEL + 0.3, 1], [TURN - 0.3, 1], [TURN, 0]]);
    const cheer = K(t, [[SNAP + 0.15 + (i % 3) * 0.05, 0], [SNAP + 0.4, 1]]);
    p.armA = mixArm(A(-0.5, 0.1, -0.9, 0.3), CHEER_A, cheer); p.armB = mixArm(A(-0.5, 0.1, -0.9, -0.3), CHEER_B, cheer);
    p.lean = -0.2 * gasp; p.mouth = gasp > 0.5 ? 'o' : cheer > 0.5 ? 'o' : 'smile';
    return p;
  }
  // petals that burst at the blast + the snap
  const PET = 140, petals = new THREE.InstancedMesh(new THREE.CircleGeometry(0.03, 6), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 }), PET);
  petals.frustumCulled = false; wed.root.add(petals);
  const PR = rng(41), petSeeds = Array.from({ length: PET }, () => [PR(), PR(), PR(), PR()]);
  petSeeds.forEach((q, i) => petals.setColorAt(i, new THREE.Color([0xf4c6d6, 0xffffff, 0xe58fa6, 0xf2d6a0][i % 4])));
  const offLectern = wed.root.children.find((o) => o.isMesh && Math.abs(o.position.z - (WD.officiant[1] + 0.45)) < 0.01 && Math.abs(o.position.x - WD.officiant[0]) < 0.01);
  if (offLectern) offLectern.visible = false;
  const archFlowers = wed.root.children.filter((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && Math.abs(o.position.z - (-4)) < 0.12 && o.position.y > 1.1);

  // ================================================================ 8. PARIS — tourists cover the tower
  const NT = 1800, tBody = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.21, 0.5, 3, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), NT);
  const tHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.27, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.6 }), NT);
  tBody.frustumCulled = tHead.frustumCulled = false; paris.root.add(tBody, tHead);
  const TR = rng(1889), tour = [];
  for (let i = 0; i < NT; i++) {
    let spot;
    const r = TR();
    if (r < 0.62) { const li = TR() < 0.75 ? Math.floor(TR() * 2) : 2 + Math.floor(TR() * 2), y = 0.8 + TR() * 23; spot = paris.legPoint(li, y, TR() * 2 - 1); }
    else if (r < 0.92) { const y = 26 + TR() * 33; spot = paris.shaftPoint(y, TR() * 2 - 1, TR() < 0.8 ? 1 : -1); }
    else { const side = TR() < 0.5 ? 1 : -1, y = 12.4 + 1.6 + TR() * 1.2, c = paris.corner(12.4) + 0.6; spot = { p: V3((TR() * 2 - 1) * c, y, side * (c + 0.9)), n: V3(0, 0, side) }; }
    const ts = 41.7 + Math.pow(TR(), 0.8) * 4.6;                  // time-lapse: more and more stick over the beat
    const sx = TR() < 0.5 ? -1 : 1, from = V3(sx > 0 ? 26 + TR() * 24 : -(14 + TR() * 30), 0.9, 15 + TR() * 55);
    tour.push({ p: spot.p.clone().addScaledVector(spot.n, 0.25), n: spot.n, ts, from, col: new THREE.Color(TOPS[i % TOPS.length]), skin: new THREE.Color(SKINS[i % SKINS.length]), spin: TR() * 6 });
  }
  tour.forEach((q, i) => { tBody.setColorAt(i, q.col); tHead.setColorAt(i, q.skin); });
  const _tm = new THREE.Matrix4(), _tq = new THREE.Quaternion(), _ts = V3(1, 1, 1), _tp = V3(0, 0, 0), _te = new THREE.Euler();
  function updateTourists(t) {
    tour.forEach((q, i) => {
      const fly = 0.9, u = clamp((t - (q.ts - fly)) / fly), k = pull3(u);
      if (u <= 0) { _ts.set(0, 0, 0); _tp.copy(q.from); }
      else {
        _tp.lerpVectors(q.from, q.p, k); _tp.y += 10 * Math.sin(k * PI) * (1 - k * 0.3); _ts.set(1, 1, 1);
      }
      _te.set(u >= 1 ? 0 : -PI / 2 * Math.sin(u * PI), Math.atan2(q.n.x, q.n.z) + PI, u >= 1 ? 0.6 * Math.sin(t * 3 + q.spin) * 0.15 : q.spin * u * 3);
      _tq.setFromEuler(_te); _tm.compose(_tp, _tq, _ts); tBody.setMatrixAt(i, _tm);
      _tp.addScaledVector(V3(0, 1, 0).applyQuaternion(_tq), 0.6); _tm.compose(_tp, _tq, _ts); tHead.setMatrixAt(i, _tm);
    });
    tBody.instanceMatrix.needsUpdate = tHead.instanceMatrix.needsUpdate = true;
  }
  // ~9 full rigs in the foreground: flying in from the lawn onto leg 0 (front-right) at face height
  const PTS = Array.from({ length: 9 }, (_, i) => ({ y: 1.4 + (i % 3) * 1.9 + Math.floor(i / 3) * 0.3, u: -0.7 + Math.floor(i / 3) * 0.65 + (i % 2) * 0.1, t: 41.9 + i * 0.27 }));
  function parisRig(t, i) {
    const P = PTS[i], spot = paris.legPoint(0, P.y, P.u), p = basePose(); p.eyes = blink(t, i);
    const B = [spot.p.x + spot.n.x * 0.2, spot.p.y + 0.2, spot.p.z + spot.n.z * 0.2 + 0.05];
    const from = [B[0] + 4 + (i % 3) * 2.5, HC, B[2] + 7 + (i % 4) * 2.2];
    if (t < P.t - 0.5) { // strolling on the gravel, cameras up
      const d = 0.9 * (t - 41.6);
      Object.assign(p, { x: from[0] - 0.3 * d, z: from[2] - d, rotY: PI + 0.3, dist: d, speed: 0.9 }); p.armB = A(-1.2, 0.2, -1.9, -0.5); p.headPitch = -0.3; p.mouth = 'smile';
      return { p, walk: true, x: p.x, z: p.z };
    }
    const st = [from[0] - 0.3 * 0.9 * (P.t - 0.5 - 41.6), HC, from[2] - 0.9 * (P.t - 0.5 - 41.6)];
    const f = flight(t, P.t - 0.5, P.t, st, B, 0.8);
    p.armA = f.u < 1 ? BACK_A : wig(SPLAT_A, t, i, 0.5); p.armB = f.u < 1 ? BACK_B : wig(SPLAT_B, t, i + 1, 0.5); p.mouth = f.u < 1 ? 'o' : (i % 2 ? 'smile' : 'flat');
    return { p, C: f.C, yaw: lerpAngle(PI, 0, Math.min(1, f.u * 1.5)), tilt: 0 };
  }

  // ================================================================ 9. COMPASS + HIKERS
  const compass = makeCompass(); scene.add(compass.g);
  const hikerCompasses = Array.from({ length: 4 }, () => { const c = makeCompass(); scene.add(c.g); return c; });
  const packs = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f].map((c) => makeBackpack(c));
  const KNOT = [2.5, 0, 2.5], CLONK = 51.05;
  const HIKE = [[-1.4, -4.6], [1.7, -5.3], [-3.3, -1.6], [2.9, -1.9]].map(([dx, dz]) => ({ dx, dz }));
  // a campsite in the clearing: tent + a ring of stones + a log seat
  const camp = new THREE.Group(); camp.position.set(-0.5, 0, -1.5); woods.root.add(camp);
  { const tent = mk(new THREE.ConeGeometry(1.3, 1.5, 4), mat(0xe08a3a, 0.8), camp, -1.2, 0.75, -1.6); tent.rotation.y = PI / 4; tent.scale.set(1.3, 1, 1);
    for (let k = 0; k < 8; k++) mk(new THREE.DodecahedronGeometry(0.12), mat(0x8a857a, 0.9), camp, 1.6 + Math.cos(k * 0.8) * 0.45, 0.06, 0.4 + Math.sin(k * 0.8) * 0.45);
    for (let k = 0; k < 3; k++) mk(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), mat(0x5a4230, 0.9), camp, 1.6 + (k - 1) * 0.15, 0.08, 0.4).rotation.set(PI / 2, k, 0); }
  function hikerPose(t, i) {
    const H = HIKE[i], p = basePose(); p.eyes = blink(t, i + 1);
    const dir = Math.atan2(-H.dx, -H.dz), L = Math.hypot(H.dx, H.dz);
    const walkU = clamp((t - 49.0) / (CLONK - 0.35 - 49.0)), d = walkU * (L - 0.95);
    const k = d / L;
    let x = KNOT[0] + H.dx * (1 - k), z = KNOT[2] + H.dz * (1 - k);
    Object.assign(p, { x, z, rotY: dir, dist: d, speed: walkU < 1 ? 0.75 : 0 });
    p.armA = HOLD_A; p.armB = HOLD_B; p.headPitch = 0.45; p.mouth = 'flat';
    if (t > CLONK - 0.35) {
      const u = pull3((t - (CLONK - 0.35)) / 0.35), slot = [KNOT[0] + Math.sin(dir + PI) * 0.33, KNOT[2] + Math.cos(dir + PI) * 0.33];
      p.x = lerp(x, slot[0], u); p.z = lerp(z, slot[1], u); p.mouth = 'o'; p.headPitch = lerp(0.45, -0.1, u);
      if (u >= 1) { p.armA = wig(HUG_A, t, i, 0.3); p.armB = wig(HUG_B, t, i + 1, 0.3); p.headYaw = 0.5 * Math.sin(t * 1.3 + i * 2) * clamp((t - CLONK - 0.4) / 0.4); p.mouth = t > CLONK + 0.6 ? (i % 2 ? 'flat' : 'smile') : 'o'; p.lean = 0.12; }
    }
    return p;
  }

  // ================================================================ 10. WOOD WORLD (suburb)
  const woodM = new THREE.MeshStandardMaterial({ map: woodTex('#b88550'), roughness: 0.8 }), woodM2 = new THREE.MeshStandardMaterial({ map: woodTex('#9a6a3a'), roughness: 0.8 });
  const woodify = (g, m) => g.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial && o.material.color && o.material.color.getHex() !== 0x1c1c1e && (o.material.metalness ?? 0) < 0.5 && o.material.opacity === 1) o.material = m; });
  const wcars = [0, 1, 2].map((i) => { const c = makeCar(0xffffff, 31 + i); woodify(c.g, i % 2 ? woodM2 : woodM); burb.root.add(c.g); return c; });
  const steelCars = [makeCar(0xd2483f, 41), makeCar(0x3d7bd9, 42)]; steelCars.forEach((c) => burb.root.add(c.g));
  const woodTwins = [makeCar(0xffffff, 51), makeCar(0xffffff, 52)]; woodTwins.forEach((c, i) => { woodify(c.g, i ? woodM2 : woodM); burb.root.add(c.g); });
  const PARK = [[-9.0, 0.95], [-17.5, 0.95]];
  const POOF = [53.55, 54.35];
  const wbus = makeBus({ color: 0xffffff, sign: 'ALL WOOD · 42' }); woodify(wbus.g, woodM); burb.root.add(wbus.g);
  // plastic-pastel lamp posts on the near sidewalk + a wooden bike rider
  for (const x of [-4, -14, -24]) { const g = new THREE.Group(); g.position.set(x, SW_H, -1.6); burb.root.add(g); mk(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 10), mat(0x7fc8d8, 0.5), g, 0, 1.7, 0); mk(new THREE.SphereGeometry(0.2, 12, 10), mat(0xfff3d6, 0.4), g, 0, 3.5, 0); }
  const bike = new THREE.Group(); burb.root.add(bike);
  for (const z of [-0.5, 0.5]) { const w = mk(new THREE.TorusGeometry(0.33, 0.035, 8, 24), woodM2, bike, 0, 0.36, z); w.rotation.y = PI / 2; }
  mk(new THREE.BoxGeometry(0.05, 0.05, 1.0), woodM, bike, 0, 0.62, 0); mk(new THREE.BoxGeometry(0.05, 0.4, 0.05), woodM, bike, 0, 0.5, -0.15);
  function walkerWood(t, i) { // people strolling the sidewalk normally (no metal left to stick to)
    const p = basePose(); p.eyes = blink(t, i);
    const far = i >= 3, dirS = far ? (i % 2 ? 1 : -1) : 1, v = 1.0, z = far ? 7.7 + (i % 2) * 0.5 : -1.35 + (i % 2) * 0.45;
    const x = far ? (dirS > 0 ? -22 + (i - 3) * 2.5 : 2 - (i - 3) * 3) + dirS * v * (t - 52.4) : -12.5 + i * 3.1 + v * (t - 52.4);
    Object.assign(p, { x, z, rotY: dirS * PI / 2, dist: v * t, speed: v, y: SW_H, floor: SW_H }); p.mouth = 'smile';
    if (i === 0 && t > 55.0) { p.rotY = lerpAngle(PI / 2, PI / 2 + 0.35, K(t, [[55.0, 0], [55.4, 1]])); }
    if (i === 0 && t > 55.2) { p.armB = A(-2.4, 0.5, -0.4, -0.2 + 0.4 * Math.sin(t * 9)); }   // waves at the camera
    return p;
  }

  // ================================================================ 11. HUG (suburb, house lot 2 at x=0): stuck in a group hug, time-lapse to dusk
  const HUG = 59.4, HUGC = [-2.38, 0, -5.38];
  const porchBulb = mk(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c8, toneMapped: false }), burb.root, -1.35, 2.35, -8.9);
  const porchL = new THREE.PointLight(0xffc98a, 0, 7, 1.6); porchL.position.set(-1.35, 2.3, -8.4); burb.root.add(porchL);
  const winGlow = []; for (const wx of [-0.3, 3.1]) { const w = mk(new THREE.PlaneGeometry(1.5, 1.2), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false }), burb.root, wx, 1.9, -8.95); winGlow.push(w); }
  const hugCast = () => [gary, grandma, kid];
  const burbSky = burb.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.material.side === THREE.BackSide);
  function hugPose(t, who) {
    const p = basePose(); p.eyes = blink(t, who + 1);
    const HS = [{ from: [0.2, -3.6], slot: [-2.06, -5.5] }, { from: [-2.3, -7.4], slot: [-2.42, -5.72] }, { from: [-4.6, -3.4], slot: [-2.78, -5.47] }][who];
    const G = [-2.42, -5.72], yawAt = (x, z) => (who === 1 ? 0.05 : faceToward(x, z, G[0], G[1]));
    const walkU = K(t, [[57.8, 0], [HUG - 0.25, 1]], (u) => u), x0 = HS.from[0], z0 = HS.from[1];
    const pre = [lerp(x0, HS.slot[0] + (HS.from[0] - HS.slot[0]) * 0.25, walkU), lerp(z0, HS.slot[1] + (HS.from[1] - HS.slot[1]) * 0.25, walkU)];
    let x = pre[0], z = pre[1];
    const facing = who === 1 ? 0.2 : faceToward(x, z, G[0], G[1]);
    Object.assign(p, { x, z, rotY: facing, dist: walkU * 3.5, speed: walkU < 1 ? 1.0 : 0 });
    p.mouth = 'smile'; p.armA = who === 1 ? A(-1.0, 0.6, -0.4, 0.2) : REST; p.armB = who === 1 ? A(-1.0, 0.6, -0.4, -0.2) : REST;
    if (t > HUG - 0.25) { const u = pull3((t - (HUG - 0.25)) / 0.25); p.x = lerp(x, HS.slot[0], u); p.z = lerp(z, HS.slot[1], u); p.rotY = yawAt(HS.slot[0], HS.slot[1]); p.armA = who === 1 ? A(-0.75, 0.95, -1.05, 0.75) : HUG_A; p.armB = who === 1 ? A(-0.75, 0.95, -1.05, -0.75) : HUG_B; p.mouth = u >= 1 && t < HUG + 0.6 ? 'o' : 'smile'; p.lean = 0.15; }
    if (t > HUG + 1.2) { p.eyes = 'closed'; p.headRoll = 0.12 * (who - 1); p.lean = 0.2 + 0.03 * Math.sin(t * 1.5 + who); }
    if (who === 2 && t > 62.0) p.headPitch = 0.4;   // the kid dozes off
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function hideAll() {
    all.forEach((r) => { r.root.visible = false; r.root.rotation.x = 0; r.root.scale.setScalar(1); r.headG.visible = true; });
    puffs.hide(); stars.forEach((s) => (s.visible = false)); glows.forEach((g) => (g.visible = false)); starN = puffN = glowN = 0;
    dog.g.visible = false; toaster.g.visible = false; pan.visible = false; cutlery.forEach((c) => (c.visible = false)); mugG.visible = false;
    mics.forEach((m) => (m.visible = false)); compass.g.visible = false; hikerCompasses.forEach((c) => (c.g.visible = false)); packs.forEach((p) => (p.visible = false));
    jolts.length = 0;
  }
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'paris' ? 0.3 : 0.1; studio.fill.intensity = 0.45;
    hideAll();
    const cam = shot.cam;

    if (cam === 'open') {
      city.setShadowFocus(5, 4, 10); city.setTime({});
      movers[0].g.position.set(2.0, 0, 30 - 9.5 * t); movers[0].g.rotation.y = PI;            // passes behind the title
      movers[1].g.position.set(-2.0, -50, 0);
      movers[2].g.position.set(2.0, 0, 95 - 10.5 * t); movers[2].g.rotation.y = PI;          // passes at ~8.6 s
      OPEN_CAST.forEach((w, i) => {
        const rig = w.gary ? gary : crowd[i], r = walkerPose(t, i);
        if (r.mode === 'walk') show(rig, 'city', r.p);
        else showC(rig, 'city', r.p, r.C, r.yaw, r.tilt || 0);
        glow(t, M1 + 0.02 + w.delay, rig, 0.8);
        if (r.mode === 'stuck') { impact(t, r.land, 'city', [r.B[0] - 0.25, r.B[1] + 0.15, r.B[2]], 0.9); jolts.push([r.land, 0.012]); }
      });
      // a dog trots along the sidewalk — dogs aren't magnetic; it stops and looks up at the stuck people
      dog.g.visible = true; city.root.add(dog.g); const dz = Math.min(-1.0 + 1.0 * t, 4.4 + 0.15 * Math.max(0, t - 5.4)); dog.g.position.set(5.0, CURB, dz); dog.g.rotation.y = t > 6.4 ? lerpAngle(0, PI / 2, K(t, [[6.4, 0], [6.8, 1]])) : 0; dog.update(t, t < 5.4 ? 1.0 : 0.15); dog.head.rotation.x = t > 6.8 ? -0.5 : 0;
    } else if (cam === 'kitchen') {
      const g = garyKitchen(t);
      if (g.air) showC(gary, 'kit', g.p, g.C, g.yaw, g.tilt);
      else { Object.assign(g.p, { x: GARY0[0], z: GARY0[1], rotY: g.yaw }); show(gary, 'kit', g.p); }
      mugG.visible = t < YANK + 0.1;
      gary.root.updateMatrixWorld(true);
      cutlery.forEach((c, k) => { if (t < CUT_T(k)) { c.visible = true; c.position.set(OFF.kit[0] + 0.32 + (k % 5) * 0.05, 0.95, OFF.kit[2] - 2.3 + (k % 2) * 0.06); c.rotation.set(0, 0, 0.1 * (k - 4)); return; } const u = flyProp(c, t, CUT_T(k), 0.27, [0.42, 0.98, -2.3], gary.spine, CUT_AT[k], Q_OUT); if (u >= 1 && Math.abs(t - CUT_T(k) - 0.27) < 0.02) jolts.push([CUT_T(k) + 0.27, 0.004]); });
      if (t < TOAST_T) { toaster.g.visible = true; toaster.g.position.set(OFF.kit[0] - 0.85, 0.95, OFF.kit[2] - 2.38); toaster.g.rotation.set(0, 0, 0); }
      else flyProp(toaster.g, t, TOAST_T, 0.3, [-0.85, 0.95, -2.38], gary.spine, V3(0, 0.0, 0.24), Q_BELLY);
      toaster.toast.forEach((s, k) => { s.position.y = 0.02 + 0.09 * K(t, [[13.85, 0], [13.95, 1]]) + 0.25 * Math.max(0, Math.sin(clamp((t - 13.85) / 0.55) * PI)) * (k ? 1.1 : 1); });
      if (t < PAN_T) { pan.visible = true; pan.position.set(OFF.kit[0] + 1.6, 0.92, OFF.kit[2] - 2.28); pan.rotation.set(0, 0.4, 0); }
      else flyProp(pan, t, PAN_T, 0.3, [1.6, 0.92, -2.28], gary.headG, V3(0, 0.3, 0), Q_HAT);
      impact(t, TOAST_T + 0.3, 'kit', [GARY0[0] + 0.15, 0.95, GARY0[1] + 0.3], 0.6); impact(t, PAN_T + 0.3, 'kit', [GARY0[0], 1.95, GARY0[1]], 0.6);
      impact(t, SLAM, 'kit', [FRIDGE[0] + 0.3, 1.3, FRIDGE[1] + 0.25], 1.3);
      jolts.push([TOAST_T + 0.3, 0.008], [PAN_T + 0.3, 0.01], [SLAM, 0.03]);
    } else if (cam === 'market') {
      const p = shopperPose(t); show(shopper, 'mkt', p);
      carts.forEach((c, k) => { const q = cartAt(t, k); c.position.set(q.x, q.y, q.z); c.rotation.set(q.rx, q.ry, q.rz); if (t > q.tk) { impact(t, q.tk, 'mkt', [q.x, 0.9 + q.y, q.z + 0.45], k === 0 ? 1.2 : 0.6); jolts.push([q.tk, k === 0 ? 0.02 : k === NC - 1 ? 0.025 : 0.006]); } });
      [0, 1].forEach((i) => { const s = stuckShelf(t, i); showC(crowd[12 + i], 'mkt', s.p, s.C, s.yaw); });
    } else if (cam === 'subway') {
      sub.update(t, 11);
      STR.forEach((s, k) => { const r = strangerPose(t, k), rig = k ? crowd[1] : crowd[0]; if (r.seated) show(rig, 'sub', r.p); else showC(rig, 'sub', r.p, r.C, r.yaw, r.tilt); });
      impact(t, MEET, 'sub', [BALL[0], BALL[1] + 0.3, BALL[2] + 0.25], 1.0); jolts.push([MEET, 0.02]);
      SUBS.forEach((_, i) => { const r = commuterPose(t, i), rig = i === 0 ? gary : crowd[2 + i]; showC(rig, 'sub', r.p, r.C, r.yaw, r.tilt, r.roll || 0); if (t > JOIN[i] + 0.28) { impact(t, JOIN[i] + 0.28, 'sub', [SLOTS[i].C[0], SLOTS[i].C[1] + 0.2, SLOTS[i].C[2] + 0.2], 0.6); jolts.push([JOIN[i] + 0.28, 0.008]); } });
      jolts.push([JOIN[JOIN.length - 1] + 0.28, 0.03]);
      for (let i = 0; i < 4; i++) show(crowd[10 + i], 'sub', riderPose(t, i));
    } else if (cam === 'press') {
      press.setFlashes(t, t > MICS ? 5 : 1.4);
      show(prez, 'press', prezPose(t));
      prez.root.updateMatrixWorld(true);
      chairs.forEach((c) => { const z = rowZ(t, c.row), hit = K(t, [[rowHit(c.row), 0], [rowHit(c.row) + 0.08, 1], [rowHit(c.row) + 0.45, 0]]); c.g.position.z = z; c.g.rotation.x = -0.35 * hit; });
      reporters.forEach((ci, k) => {
        const c = chairs[ci], p = basePose(); p.eyes = blink(t, k);
        Object.assign(p, { x: c.x, z: c.g.position.z + 0.05, rotY: PI, footFwd: 0.42, y: 0.45 - SIT, floor: 0 });
        p.armA = A(-0.5, 0.1, -0.9, 0.3); p.armB = k < MIC_COLS.length ? MIC_B : A(-1.15, 0.12, -2.05, -0.65); p.headPitch = -0.1;
        const hit = K(t, [[rowHit(c.row), 0], [rowHit(c.row) + 0.08, 1], [rowHit(c.row) + 0.45, 0]]); p.lean = 0.5 * hit; p.mouth = t > SLIDE ? 'o' : 'flat';
        if (t > SLIDE) { p.armA = A(-2.4, 0.6, -0.4); p.armB = A(-2.4, 0.6, -0.4); }
        if (t > 29.9) p.mouth = k % 3 ? 'flat' : 'o';
        show(crowd[k], 'press', p, { tilt: 0.3 * hit });
        if (k < MIC_COLS.length) { // the mic leaves the hand and flies to the President's face
          const m = mics[k]; m.visible = true;
          crowd[k].root.updateMatrixWorld(true);
          const hand = crowd[k].arms.find((a) => a.s === 1).hand.getWorldPosition(V3(0, 0, 0)).add(V3(0, 0.08, 0));
          const face = prez.headG.localToWorld(MIC_AT[k].clone());
          const u = pull3((t - (MICS + k * 0.03)) / 0.3);
          m.position.lerpVectors(hand, face, u); m.position.y += 0.25 * Math.sin(u * PI);
          m.rotation.set(u >= 1 ? -1.2 : -0.3, 0, u * (k - 3.5) * 0.25);
          if (u >= 1) m.position.copy(face);
        }
      });
      if (tvCam) { const u = pull3((t - SLIDE - 0.1) / 0.55); tvCam.position.set(lerp(3.6, 1.9, u), 0, lerp(4.4, 0.7, u)); tvCam.rotation.set(0, 0.5 + 0.6 * u, -0.25 * K(t, [[SLIDE + 0.65, 0], [SLIDE + 0.9, 1]])); }
      for (let r = 0; r < 4; r++) { impact(t, rowHit(r), 'press', [r % 2 ? -1.6 : 1.6, 0.9, rowStop(r) - 0.3], 1.0); jolts.push([rowHit(r), r === 0 ? 0.025 : 0.012]); }
      impact(t, MICS + 0.3, 'press', [0, 2.05, PD.speaker[1] + 0.25], 0.7);
    } else if (cam === 'mri') {
      mri.setGlow(0.35 + 0.65 * K(t, [[SUCK - 0.3, 0], [SUCK, 1]]));
      const d = doctorPose(t);
      if (d.walk) show(doctor, 'mri', d.p); else showC(doctor, 'mri', d.p, d.C, d.yaw, d.tilt);
      impact(t, SUCK + 0.32, 'mri', [BX, BY + 0.2, BF + 0.3], 1.1); jolts.push([SUCK + 0.32, 0.02]);
      const who = [nurse, ...crowd.slice(14, 20)];
      PETALS.forEach((P, i) => {
        const r = petalPose(t, i, who[i]); if (!r) return;
        if (r.ground) show(who[i], 'mri', r.p); else showQ(who[i], 'mri', r.p, r.C, r.q);
        const a = (P.a * PI) / 180; impact(t, P.t, 'mri', [BX + Math.cos(a) * 0.75, BY + Math.sin(a) * 0.75, BF + 0.75], 0.75); jolts.push([P.t, 0.01]);
      });
      OBJ.forEach((q) => { const u = pull3((t - (q.t - 0.35)) / 0.35); q.o.position.set(lerp(q.from.x, q.to[0], u), lerp(q.from.y, q.to[1], u) + 0.6 * Math.sin(u * PI), lerp(q.from.z, q.to[2], u)); q.o.rotation.set(lerp(q.rot0.x, q.r[0], u), lerp(q.rot0.y, q.r[1], u), lerp(q.rot0.z, q.r[2], u)); impact(t, q.t, 'mri', [q.to[0], 0.6, q.to[2] + 0.2], 0.8); jolts.push([q.t, q.o === mri.chair ? 0.03 : 0.012]); });
    } else if (cam === 'wedding') {
      const b = couplePose(t, 'bride'), g = couplePose(t, 'groom');
      for (const [rig, r] of [[bride, b], [groom, g]]) { const sit = r.sit; r.p.y = (r.p.y || 0) - SIT * sit * 0.98; r.p.footFwd = 0.42 * sit; r.p.floor = 0; show(rig, 'wed', r.p); if (rig.dress) rig.dress.visible = sit < 0.5; }
      const op = basePose(); Object.assign(op, { x: WD.officiant[0], z: WD.officiant[1], rotY: 0 }); op.eyes = blink(t, 9);
      op.armA = A(-0.8, 0.05, -1.3, 0.6); op.armB = A(-0.8, 0.05, -1.3, -0.6); op.mouth = t > REPEL ? 'o' : 'smile';
      if (t > SNAP + 0.3) { op.armA = A(-0.2, 0.9, -1.4, 0.4); op.armB = A(-0.2, 0.9, -1.4, -0.4); op.mouth = 'flat'; }   // shrug
      show(officiant, 'wed', op);
      for (let i = 0; i < 12; i++) { const q = guestPose(t, i); if (q) show(i === 4 ? gary : crowd[i], 'wed', q); }
      impact(t, REPEL + 0.05, 'wed', [0, 1.2, -3.3], 1.2); impact(t, REPEL + 0.48, 'wed', [1.25, 0.3, -3.2], 0.7); impact(t, REPEL + 0.48, 'wed', [-1.25, 0.3, -3.2], 0.7); impact(t, SNAP, 'wed', [-0.95, 1.2, -3.15], 1.0);
      jolts.push([REPEL + 0.05, 0.025], [REPEL + 0.48, 0.012], [SNAP, 0.02]);
      const shake = Math.exp(-Math.max(0, t - REPEL) * 4) * (t > REPEL ? 1 : 0);
      archFlowers.forEach((f, i) => { f.position.x += 0; f.rotation.z = 0.2 * shake * Math.sin(t * 30 + i); });
      { // petals burst up from the couple at the blast and the snap, then drift down
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = V3(1, 1, 1), v3 = V3(0, 0, 0);
        petSeeds.forEach((q4, i) => {
          const burst = i % 2 ? REPEL : SNAP, age = t - burst, cx = i % 2 ? 0 : -0.95;
          if (age < 0) { s3.set(0, 0, 0); v3.set(0, -5, 0); }
          else { s3.set(1, 1, 1); const vx = (q4[0] - 0.5) * 3.2, vz = (q4[1] - 0.5) * 2.0, vy = 2.4 + q4[2] * 2.2; v3.set(cx + vx * Math.min(age, 0.6) + 0.1 * Math.sin(t * 2 + i), Math.max(0.02, 1.2 + vy * Math.min(age, 0.5) - 0.9 * Math.max(0, age - 0.5)), -3.3 + vz * Math.min(age, 0.6)); }
          q.setFromEuler(e3.set(t * (1.5 + q4[2] * 3) + i, t * 2 + i * 0.7, i)); m4.compose(v3, q, s3); petals.setMatrixAt(i, m4);
        });
        petals.instanceMatrix.needsUpdate = true; if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
      }
    } else if (cam === 'paris') {
      paris.aimSun(8, 12, 46);
      updateTourists(t);
      PTS.forEach((P, i) => { const r = parisRig(t, i), rig = crowd[i]; if (r.walk) show(rig, 'paris', r.p); else showC(rig, 'paris', r.p, r.C, r.yaw, r.tilt); if (t > P.t) { const spot = paris.legPoint(0, P.y, P.u); impact(t, P.t, 'paris', [spot.p.x, spot.p.y + 0.3, spot.p.z + 0.4], 0.8); jolts.push([P.t, 0.01]); } });
    } else if (cam === 'compass') {
      // POV: the hiker (crowd[20]) at the origin of the clearing looks down at the compass in his hands; head hidden
      const h = crowd[20], p = basePose(); p.eyes = blink(t, 3); Object.assign(p, { x: 0, z: 0, rotY: 0 }); p.armA = HOLD_A; p.armB = HOLD_B; p.headPitch = 0.55; p.mouth = 'flat';
      const settle = K(t, [[47.75, 0], [48.3, 1]]);
      if (t > 48.4) { p.headPitch = 0.55 - 0.45 * K(t, [[48.4, 0], [48.7, 1]]); p.mouth = 'o'; }   // looks up from the compass: it's pointing at him
      show(h, 'woods', p);
      compass.g.visible = true; compass.g.scale.setScalar(1.6);
      h.root.updateMatrixWorld(true);
      { const h1 = h.arms[0].hand.getWorldPosition(V3(0, 0, 0)), h2 = h.arms[1].hand.getWorldPosition(V3(0, 0, 0)); compass.g.position.copy(h1).add(h2).multiplyScalar(0.5).add(V3(0, 0.05, 0.02)); }
      compass.g.rotation.set(0.45, -PI / 2, 0);   // N points to the right of frame; the hiker is at the compass's local −x
      const wob = 0.3 * Math.sin((t - 48.3) * 11) * Math.exp(-Math.max(0, t - 48.3) * 3) * (t > 48.3 ? 1 : 0);
      compass.needle.rotation.y = lerp(0.08 * Math.sin(t * 2.5), PI / 2, settle) + wob + (t > 47.75 && t < 48.3 ? 0.9 * Math.sin(t * 19) * (1 - settle) : 0);
    } else if (cam === 'hikers') {
      woods.setShadowFocus && woods.setShadowFocus(2.5, 2.5, 9);
      const hk = [crowd[20], crowd[21], crowd[22], gary];
      hk.forEach((rig, i) => {
        const p = hikerPose(t, i); show(rig, 'woods', p);
        rig.root.updateMatrixWorld(true);
        const pk = packs[i]; if (!pk.parent || pk.parent !== rig.spine) { rig.spine.add(pk); pk.position.set(0, 0.3, -0.22); }
        pk.visible = true;
        const c = hikerCompasses[i]; c.g.visible = t < CLONK - 0.05;
        if (c.g.visible) { const hw = rig.arms.find((a) => a.s === 1).hand.getWorldPosition(V3(0, 0, 0)), hw2 = rig.arms.find((a) => a.s === -1).hand.getWorldPosition(V3(0, 0, 0)); c.g.position.copy(hw).add(hw2).multiplyScalar(0.5).add(V3(0, 0.03, 0)); c.g.rotation.set(0, p.rotY, 0); c.needle.rotation.y = 0; }
      });
      impact(t, CLONK, 'woods', [KNOT[0], 1.35, KNOT[2] + 0.3], 1.3); jolts.push([CLONK, 0.03]);
    } else if (cam === 'wood') {
      burb.aimSun(-6, 1, 16);
      wcars[0].g.position.set(14 - 8.5 * (t - 52.4), 0, 1.8); wcars[0].g.rotation.y = -PI / 2;
      wcars[1].g.position.set(-30 + 9 * (t - 52.4), 0, 5.2); wcars[1].g.rotation.y = PI / 2;
      wcars[2].g.position.set(-46 + 9 * (t - 52.4), 0, 5.2); wcars[2].g.rotation.y = PI / 2;
      wbus.g.position.set(30 - 10 * (t - 52.4), 0, 1.9); wbus.g.rotation.y = -PI / 2;
      [0, 1].forEach((i) => { const [x, z] = PARK[i], on = t >= POOF[i]; steelCars[i].g.visible = !on; woodTwins[i].g.visible = on; for (const c of [steelCars[i], woodTwins[i]]) { c.g.position.set(x, 0, z); c.g.rotation.y = PI / 2; } const pop = K(t, [[POOF[i], 1.15], [POOF[i] + 0.25, 1]]); woodTwins[i].g.scale.setScalar(on ? pop : 1); impact(t, POOF[i], 'burb', [x, 1.0, z + 1.1], 1.8); });
      jolts.push([POOF[0], 0.006], [POOF[1], 0.006]);
      bike.position.set(-16 + 4.2 * (t - 52.4), 0, 0.55); bike.rotation.y = 0;
      for (let i = 0; i < 6; i++) show(crowd[i], 'burb', walkerWood(t, i));
      const rider = basePose(); Object.assign(rider, { x: bike.position.x, z: 0.55, rotY: PI / 2, y: 0.95 - SIT, footFwd: 0.25 + 0.15 * Math.sin(t * 8), floor: 0.4 + 0.12 * Math.sin(t * 8) }); rider.armA = A(-1.2, 0.1, -0.5); rider.armB = A(-1.2, 0.1, -0.5); rider.mouth = 'smile'; rider.eyes = blink(t, 3);
      show(crowd[8], 'burb', rider);
    } else if (cam === 'hug') {
      const dusk = K(t, [[60.2, 0], [63.6, 1]], (u) => u);
      burb.aimSun(-2, -5, 9);
      burb.lights.sun.intensity = lerp(2.6, 0.55, dusk); burb.lights.sun.color.setHex(0xfff0d8).lerp(new THREE.Color(0xff9a5a), dusk);
      burb.lights.hemi.intensity = lerp(1.25, 0.45, dusk); burb.fog.color.setHex(0xdfe8ee).lerp(new THREE.Color(0x8a6a7a), dusk);
      porchL.intensity = 6 * clamp((dusk - 0.4) / 0.2); porchBulb.material.color.setHex(0xfff0c8).multiplyScalar(0.3 + 2.2 * clamp((dusk - 0.4) / 0.2));
      winGlow.forEach((w) => (w.material.opacity = 0.85 * clamp((dusk - 0.55) / 0.25)));
      if (burbSky) burbSky.material.color.setHex(0xffffff).lerp(new THREE.Color(0xd08a8a), dusk * 0.85);
      hugCast().forEach((rig, who) => show(rig, 'burb', hugPose(t, who), { s: who === 2 ? 0.62 : 1 }));
      impact(t, HUG, 'burb', [HUGC[0], 1.35, HUGC[2] + 0.4], 1.0); jolts.push([HUG, 0.018]);
      dog.g.visible = true; burb.root.add(dog.g); const dd = K(t, [[60.5, 0], [61.8, 1]], (u) => u); dog.g.position.set(lerp(1.5, -1.2, dd), 0, lerp(-3.2, -4.6, dd)); dog.g.rotation.y = dd < 1 ? -2.2 : -2.6; dog.update(t, dd > 0 && dd < 1 ? 0.8 : 0);
      for (let i = 0; i < 2; i++) { const n = basePose(); n.eyes = blink(t, i + 20); const v = 0.9, x = -14 + v * (t - 57.8) * (1 + i * 0.2) + i * 1.0; Object.assign(n, { x, z: -1.2 + i * 0.45, rotY: PI / 2, dist: v * t, speed: v, y: SW_H, floor: SW_H }); n.mouth = 'smile'; if (Math.abs(x + 2.2) < 2.5) { n.armB = A(-2.4, 0.5, -0.4, -0.2 + 0.4 * Math.sin(t * 9)); n.headYaw = -1.0; } show(crowd[16 + i], 'burb', n); }
    }
    if (cam === 'hug') { burb.lights.sun.intensity = burb.lights.sun.intensity; } else if (cur === 'burb') { burb.lights.sun.intensity = 2.6; burb.lights.sun.color.setHex(0xfff0d8); burb.lights.hemi.intensity = 1.25; burb.fog.color.setHex(0xdfe8ee); porchL.intensity = 0; porchBulb.material.color.setHex(0xfff0c8).multiplyScalar(0.3); winGlow.forEach((w) => (w.material.opacity = 0)); if (burbSky) burbSky.material.color.setHex(0xffffff); }

    // camera (local → world) + impact jolts
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    for (const [m, k0] of jolts) if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70 + m), P[1] + k * Math.sin(t * 55 + m), P[2] + k * 0.5 * Math.sin(t * 63)]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
