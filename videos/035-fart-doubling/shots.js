// VIDEO 035 — "What if your farts got 2× louder every time?"  (tone: FUNNY doubling-POV, unhinged lane / weird tier, @ed._.studios)
// A SOUND-LED "you" escalation: one ordinary day, every fart twice as loud as the last. The joke is the sound, the faces and the
// consequences — never a gas cloud, never anatomy. The only thing drawn at the source is a stylized cartoon PRESSURE RING
// (camera-facing ring sprites + rings on the floor) that sweeps hair back, hats off, papers up.
// PHYSICS MODEL (stated for the comments): "twice as loud" = perceived loudness doubles = +10 dB (Stevens' sone scale: loudness
// in sones doubles every +10 phon). So fart #n = 10 + 10·n dB: #1 20 dB … #9 100 dB (a jackhammer) … #18 190 dB … #19 200 dB.
// Above ~194 dB a sound wave in air at 1 atm can't stay a sound wave (the trough would be a vacuum) — it becomes a shockwave.
// (The other honest model, doubled sound POWER = +3 dB, would take 58 farts to get from a whisper to a jet; it doesn't fit a day.)
// HUD = YOUR FARTS · LOUDNESS in dB + FART #n · clock; one real, sourced number per beat in the stat line.
// 66 s, 14 shots, 9 sets parked at offsets in one scene (one visible per shot).
// NEW (additive): engine/sets/master.js (sunny grown-up bedroom), engine/sets/quakelab.js (seismology room + drum seismograph).
//
// Sources (checked Oct 28 2026):
//   0 dB = threshold of hearing; whisper 30 dB, normal conversation 60 dB, NIOSH exposure limit 85 dB (8 h), chain saw 110 dB —
//     CDC/NIOSH "Noise levels by decibels" (stacks.cdc.gov/view/cdc/78630); NIH NIDCD "How loud is too loud?" (85 dBA can damage hearing)
//   jackhammer ~100 dB (charts give 100–130 dB by distance), threshold of pain ~120–130 dB, jet engine up close ~140 dB —
//     standard noise charts (American Academy of Audiology noise chart; WSCC "How loud is it?"; Purdue/IAC charts)
//   +10 dB ≈ twice as loud — Stevens' sone scale (ISO 532 loudness; 1 sone = 40 phon, doubling per +10 phon)
//   194 dB = the loudest undistorted sound in air at 1 atm (pressure swings from vacuum to 2 atm) — Guinness "Loudest possible
//     sustained sound in air"; US patent 10,750,261 background
//   Krakatoa, 27 Aug 1883: the Batavia gasworks barometer 160 km away spiked 8.5 kPa ≈ 172 dB; heard ~4,800 km away —
//     Brüel & Kjær "Krakatoa eruption sound"; Discover "The loudest sound ever heard"
//
// Shot list (seconds)                       | set     | what happens
//  0.0– 8.9  bed     title, #1 → #2          | master  | asleep at 7 AM; #1 (4.3) a squeak, the dog lifts his head; #2 (6.7) the duvet flies up, the partner sits bolt
//                                            |         | upright, the dog leaps off the bed, the alarm clock hops off the nightstand; "Sorry, babe."
//  8.9–13.9  elev    #3 → #4                 | elevator| packed ride; #3 (9.7) eyes slide; #4 (12.0) the car drops, lights flicker, a toupee pops up, a folder explodes;
//                                            |         | then everybody stares straight ahead ("Nobody makes eye contact"); you whistle at the floor display
// 13.9–19.0  office  #5 → #6                 | office  | you pitch Q4 at a flip chart; #5 heads snap up; #6 a paper blizzard, the chart pages flip, the CEO's chair rolls
//                                            |         | back + spins; the CEO starts a slow clap
// 19.0–23.9  lib     #7                      | library | you tiptoe down the aisle, the librarian shushes; #7 every book blasts off the shelves, the QUIET sign tips
// 23.9–26.5  wedA    #8                      | wedding | you're the best man; "speak now or forever…" — #8 objects; everyone turns
// 26.5–29.6  wedB    #9                      | wedding | reverse from behind the arch on the guests: #9 the veil flies, every hat goes, a petal storm
// 29.6–33.6  alarm   #10                     | street  | lunch at the hot-dog cart; #10 every car alarm on the block, the umbrella flips inside out, pigeons burst up
// 33.6–37.6  windows #11 → #12               | street  | an apartment block of neighbors at their windows; #11 curtains whip, #12 every pane cracks
// 37.6–42.4  lab     #13 → #14               | quakelab| two seismologists + a drum seismograph; #13 a spike, #14 the pen swings off the paper, chairs roll back
// 42.4–46.2  standA  #15 → #16               | stadium | cup final, you in the home end; #15 60,000 fans freeze silent and turn; #16 hats + foam fingers fly
// 46.2–48.8  standB  #17                     | stadium | wide: #17 a tilt wave across the stand, the goal net bulges, the ref is blown off his feet
// 48.8–51.8  orbit   #18 → #19               | space   | from orbit: a ring, then #19's shockwave sweeps across the planet
// 51.8–57.4  dinA    grandma                 | living  | dinner at Grandma's; you hold it in; 55.7 GRANDMA lets one go (210 dB): candles out, napkins fly, she sips tea
// 57.4–66.0  dinB    fist bump               | living  | two-shot: she offers a fist — "It runs in the family." — fist bump, everyone laughs. End card 61.8
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, rng, mat, mk, canvasTex, easeIO } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeDog, makeHotDog, makeMug } from '@engine/props.js';
import { makePigeon } from '@engine/build/toon.js';
import { buildMaster, DIMS as MB } from '@engine/sets/master.js';
import { buildElevator } from '@engine/sets/elevator.js';
import { buildOffice } from '@engine/sets/office.js';
import { buildLibrary, DIMS as LB } from '@engine/sets/library.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { makeCar } from '@engine/sets/city.js';
import { buildQuakeLab, DIMS as QL } from '@engine/sets/quakelab.js';
import { buildStadium, DIMS as FB } from '@engine/sets/football.js';
import { buildSpace, makeSpritePool } from '@engine/sets/tech.js';
import { buildLivingRoom, DIMS as LR } from '@engine/sets/livingroom.js';

const PI = Math.PI;
const SIT = HIP_H - 0.17;                 // pelvis-bottom offset: sitting root = seat − SIT
const HC = 0.9;                           // body center above the feet (flying bodies)
// every fart [time, number] — keep in sync with make_story.py + make_cues.py
const FARTS = [[4.3, 1], [6.7, 2], [9.7, 3], [12.0, 4], [14.9, 5], [17.1, 6], [20.9, 7], [25.8, 8], [27.5, 9], [30.6, 10], [34.3, 11], [36.2, 12],
  [38.5, 13], [40.5, 14], [43.6, 15], [45.5, 16], [47.3, 17], [49.3, 18], [50.7, 19]];
const GRANDMA = 55.7;
const F = Object.fromEntries(FARTS.map(([t, n]) => [n, t]));
const OFF = { bed: [2000, 0, 0], elev: [4000, 0, 0], office: [6000, 0, 0], lib: [8000, 0, 0], wed: [10000, 0, 0], street: [12000, 0, 0],
  lab: [15000, 0, 0], stad: [18000, 0, 0], dine: [22000, 0, 0], space: [40000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 8.9, cam: 'bed', set: 'bed' },
  { t0: 8.9, t1: 13.9, cam: 'elev', set: 'elev' },
  { t0: 13.9, t1: 19.0, cam: 'office', set: 'office' },
  { t0: 19.0, t1: 23.9, cam: 'lib', set: 'lib' },
  { t0: 23.9, t1: 26.5, cam: 'wedA', set: 'wed' },
  { t0: 26.5, t1: 29.6, cam: 'wedB', set: 'wed' },
  { t0: 29.6, t1: 33.6, cam: 'alarm', set: 'street' },
  { t0: 33.6, t1: 37.6, cam: 'windows', set: 'street' },
  { t0: 37.6, t1: 42.4, cam: 'lab', set: 'lab' },
  { t0: 42.4, t1: 46.2, cam: 'standA', set: 'stad' },
  { t0: 46.2, t1: 48.8, cam: 'standB', set: 'stad' },
  { t0: 48.8, t1: 51.8, cam: 'orbit', set: 'space' },
  { t0: 51.8, t1: 57.4, cam: 'dinA', set: 'dine' },
  { t0: 57.4, t1: 66.0, cam: 'dinB', set: 'dine' },
];
// cameras: keys = [[t, pos, aim], …] in the set's LOCAL coords (eased between keys); fov
export const CAMS = {
  bed:     { keys: [[0, [0.35, 2.1, 1.95], [0.0, 0.9, -1.7]], [6.6, [0.1, 2.0, 1.6], [-0.05, 1.08, -1.8]], [8.9, [0.05, 1.95, 1.35], [-0.05, 1.12, -1.8]]], fov: 52 },
  elev:    { keys: [[8.9, [0.15, 1.45, 4.3], [0, 1.25, -0.4]], [13.9, [0.05, 1.4, 3.45], [0, 1.22, -0.4]]], fov: 50 },
  office:  { keys: [[13.9, [0.0, 1.75, 3.6], [0.1, 1.15, -0.9]], [19.0, [0.0, 1.7, 3.1], [0.1, 1.15, -0.9]]], fov: 58 },
  lib:     { keys: [[19.0, [2.3, 1.8, 1.3], [-0.6, 1.1, -2.2]], [23.9, [2.0, 1.75, 0.9], [-0.6, 1.1, -2.2]]], fov: 52 },
  wedA:    { keys: [[23.9, [0.1, 1.62, 0.9], [-0.05, 1.5, -3.7]], [26.5, [0.05, 1.6, 0.3], [-0.05, 1.5, -3.7]]], fov: 50 },
  wedB:    { keys: [[26.5, [-0.35, 1.6, -3.95], [0.75, 0.98, 0.5]], [29.6, [-0.3, 1.55, -3.6], [0.75, 0.98, 0.5]]], fov: 60 },
  alarm:   { keys: [[29.6, [11.2, 1.5, 0.2], [4.8, 1.2, -0.45]], [33.6, [10.6, 1.45, 0.1], [4.8, 1.2, -0.45]]], fov: 56 },
  windows: { keys: [[33.6, [4.45, 1.62, 4.7], [4.45, 1.85, 7.6]], [34.25, [4.45, 1.9, 0.4], [4.45, 5.6, 9.6]], [37.6, [4.45, 1.9, -0.4], [4.45, 5.7, 9.6]]], fov: 56 },
  lab:     { keys: [[37.6, [0.3, 1.6, 2.45], [0, 1.15, -0.5]], [42.4, [0.2, 1.55, 2.0], [0, 1.15, -0.5]]], fov: 50 },
  standA:  { keys: [[42.4, [55.6, 3.4, 1.6], [61.4, 3.45, 0]], [46.2, [56.1, 3.4, 1.2], [61.4, 3.45, 0]]], fov: 50 },
  standB:  { keys: [[46.2, [42.0, 4.0, 17.0], [60.0, 6.0, -1.0]], [48.8, [41.0, 4.6, 18.5], [60.0, 6.5, -1.0]]], fov: 50 },
  orbit:   { keys: [], fov: 40 },
  dinA:    { keys: [[51.8, [-3.3, 1.75, 3.6], [-3.4, 1.05, -1.1]], [57.4, [-3.32, 1.65, 3.0], [-3.4, 1.05, -1.1]]], fov: 56 },
  dinB:    { keys: [[57.4, [-3.25, 1.32, 1.05], [-3.4, 1.2, -1.4]], [61.8, [-3.32, 1.3, 0.8], [-3.4, 1.2, -1.4]], [66, [-3.35, 1.29, 0.7], [-3.4, 1.2, -1.4]]], fov: 50 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
function camAt(c, t) {
  const k = c.keys; if (t <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) { const u = easeIO((t - k[i][0]) / (k[i + 1][0] - k[i][0])); return [k[i][1].map((v, j) => lerp(v, k[i + 1][1][j], u)), k[i][2].map((v, j) => lerp(v, k[i + 1][2][j], u))]; }
  const l = k[k.length - 1]; return [l[1], l[2]];
}

// arm presets: A(sx, sz, el, twist, free)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const UP_A = A(-2.6, 0.45, -0.4), UP_B = A(-2.6, 0.45, -0.4);                          // hands up
const BACK_A = A(0.9, 0.6, -0.2, 0.3), BACK_B = A(0.9, 0.6, -0.2, -0.3);               // flung backward, arms trailing
const POINT_B = A(-1.5, 0.35, -0.1, -0.2);
const SHH_B = A(-1.25, -0.05, -2.4, -0.7);                                             // finger to the lips
const CUP_B = A(-0.55, 0.2, -1.6, -0.5), SIP_B = A(-1.3, 0.25, -2.35, -0.5);
const CUP_A = A(-0.55, 0.2, -1.6, 0.5), SIP_A = A(-1.3, 0.25, -2.35, 0.5);
const BOOK_A = A(-0.75, 0.1, -1.4, 0.6), BOOK_B = A(-0.75, 0.1, -1.4, -0.6);           // a book held at the chest
const PHONE_A = A(-0.8, 0.15, -1.9, 0.5);
const SILL_A = A(-1.25, 0.3, -0.75, 0.3), SILL_B = A(-1.25, 0.3, -0.75, -0.3);         // forearms on a windowsill
const SHRUG_A = A(-0.2, 0.9, -1.4, 0.4), SHRUG_B = A(-0.2, 0.9, -1.4, -0.4);
const FORK_B = (t, ph) => A(-0.75 - 0.45 * Math.max(0, Math.sin(t * 3.2 + ph)), 0.2, -1.5 - 0.6 * Math.max(0, Math.sin(t * 3.2 + ph)), -0.5);
const CLAP = (t) => { const c = Math.max(0, Math.sin(t * 7)); return [A(-1.1, 0.15 + 0.25 * c, -1.2, 0.9), A(-1.1, 0.15 + 0.25 * c, -1.2, -0.9)]; };
const BUMP = A(-1.3, -0.3, -0.55, 0);                                                    // a fist toward the neighbor (both sides)
const HAND_RAISE_B = A(-2.2, 0.35, -1.3, -0.3);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const easeOutBack = (u) => { const c1 = 1.70158, c3 = c1 + 1; u = clamp(u); return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; };
const headAt = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const pulse = (t, a, up = 0.12, hold = 0.5, down = 0.6) => K(t, [[a, 0], [a + up, 1], [a + up + hold, 1], [a + up + hold + down, 0.55]]);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'short', 'bob', 'messy', 'none'];

export async function build(studio, story) {
  const { scene } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const bed = buildMaster(studio, {}); bed.root.position.set(...OFF.bed);
  const elev = buildElevator(studio, {}); elev.root.position.set(...OFF.elev);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const lib = buildLibrary(studio, {}); lib.root.position.set(...OFF.lib);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const lab = buildQuakeLab(studio, {}); lab.root.position.set(...OFF.lab);
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const dine = buildLivingRoom(studio, {}); dine.root.position.set(...OFF.dine); dine.setMode('dinner');
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ROOTS = { bed: bed.root, elev: elev.root, office: office.root, lib: lib.root, wed: wed.root, street: street.root, lab: lab.root, stad: stad.root, dine: dine.root, space: space.root };
  const FOGS = { bed: null, elev: null, office: null, lib: null, wed: wed.fog, street: streetFog, lab: null, stad: stad.fog, dine: null, space: null };
  const FAR = { bed: 40, elev: 40, office: 40, lib: 40, wed: 300, street: 400, lab: 40, stad: 1200, dine: 40, space: 9000 };
  const ELEV_CEIL = elev.lights.ceil.intensity;
  const pendShade = dine.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 0.24);
  const pendCord = dine.root.children.find((o) => o.isMesh && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height === 0.85);
  const PEND0 = pendShade ? pendShade.position.clone() : null;

  // office: clear the interview desk + its two chairs, add a conference table, six chairs and a flip chart
  office.root.children.filter((o) => o.isMesh && !(o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width > 4) && Math.abs(o.position.x) < 1.15 && o.position.z > -1.95 && o.position.z < 0.35 && o.position.y < 1.4).forEach((o) => (o.visible = false));
  office.root.children.filter((o) => o.isGroup && Math.abs(o.position.x) < 1.15 && o.position.z > -1.95 && o.position.z < 0.35).forEach((o) => (o.visible = false));
  const OT = { z: -0.95, top: 0.75 };
  const ext = mk(new THREE.PlaneGeometry(6.2, 4), mat(0x6a5040, 0.8), office.root, 0, -0.002, 4.5); ext.rotation.x = -PI / 2; ext.castShadow = false;
  const confM = mat(0x5a3a26, 0.45);
  mk(new THREE.BoxGeometry(2.5, 0.06, 1.05), confM, office.root, 0, OT.top - 0.03, OT.z);
  for (const [x, z] of [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]]) mk(new THREE.BoxGeometry(0.07, OT.top - 0.06, 0.07), confM, office.root, x, (OT.top - 0.06) / 2, OT.z + z);
  const officeChair = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; office.root.add(c); const m = mat(0x1d1d22, 0.7); mk(new THREE.BoxGeometry(0.5, 0.08, 0.48), m, c, 0, 0.44, 0); mk(new THREE.BoxGeometry(0.48, 0.62, 0.07), m, c, 0, 0.8, -0.24); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 8), mat(0x9aa0a8, 0.3, { metalness: 0.6 }), c, 0, 0.22, 0); mk(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 5), mat(0x2a2d31, 0.5), c, 0, 0.04, 0); return c; };
  const SEATS_O = [[-0.72, -1.62], [0.05, -1.62], [0.82, -1.62]];
  const oChairs = SEATS_O.map(([x, z]) => officeChair(x, z, 0));
  const BOSS = [1.5, -0.95];
  const bossChair = officeChair(BOSS[0], BOSS[1], -PI / 2);
  for (const [x, z, c] of [[-0.75, -1.2, 0xb8bcc2], [0.85, -1.2, 0x2a2d31]]) { const l = new THREE.Group(); l.position.set(x, OT.top, z); office.root.add(l); mk(new THREE.BoxGeometry(0.34, 0.015, 0.24), mat(c, 0.3, { metalness: 0.5 }), l, 0, 0.008, 0); const s = mk(new THREE.BoxGeometry(0.34, 0.23, 0.012), mat(c, 0.3, { metalness: 0.5 }), l, 0, 0.12, -0.12); s.rotation.x = 0.25; }
  const offMugs = [[0.1, -1.25, 0x3d7bd9], [1.15, -0.75, 0xf4f1ea], [-0.35, -0.7, 0xd2483f]].map(([x, z, c]) => { const m = makeMug(c); m.position.set(x, OT.top, z); office.root.add(m); return m; });
  for (let k = 0; k < 8; k++) mk(new THREE.BoxGeometry(0.21, 0.004, 0.297), mat(0xfbfaf6, 0.8), office.root, -0.6 + (k % 4) * 0.4, OT.top + 0.003 + 0.002 * k, OT.z + (k < 4 ? -0.15 : 0.2)).rotation.y = (k - 3.5) * 0.15;
  mk(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 3), mat(0x2a2d31, 0.4), office.root, 0.35, OT.top + 0.02, OT.z + 0.1);   // speakerphone
  const easel = new THREE.Group(); easel.position.set(-1.35, 0, -1.15); easel.rotation.y = 0.45; office.root.add(easel);
  for (const [x, z, rz, rx] of [[-0.3, 0.05, 0.12, 0.1], [0.3, 0.05, -0.12, 0.1], [0, -0.35, 0, -0.3]]) { const l = mk(new THREE.BoxGeometry(0.03, 1.8, 0.03), mat(0x8a5a34, 0.6), easel, x, 0.9, z); l.rotation.set(rx, 0, rz); }
  const chartTex = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f3a4a'; g.font = 'bold 36px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('Q4 PLAN', w / 2, 52); [0.3, 0.45, 0.62, 0.85].forEach((v, i) => { g.fillStyle = ['#3d7bd9', '#58b368', '#f2b632', '#d2483f'][i]; g.fillRect(36 + i * 50, h - 30 - v * 200, 36, v * 200); }); g.strokeStyle = '#2f3a4a'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, h - 28); g.lineTo(w - 20, h - 28); g.stroke(); });
  const padM = new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.8, side: THREE.DoubleSide });
  mk(new THREE.BoxGeometry(0.72, 0.92, 0.02), mat(0xe9e4da, 0.8), easel, 0, 1.25, 0.06);
  const pages = [0, 1, 2].map((i) => { const pv = new THREE.Group(); pv.position.set(0, 1.71, 0.08 + i * 0.004); easel.add(pv); const pg = mk(new THREE.PlaneGeometry(0.7, 0.9), i === 0 ? padM : mat(0xfbfaf6, 0.85, { side: THREE.DoubleSide }), pv, 0, -0.45, 0); pg.castShadow = false; return pv; });

  // ---------------------------------------------------------------- cast
  const R = rng(35);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.glasses = !!o.glasses; p.r = o.headR ?? 0.13; p.browY = p.head.brows.map((b) => b.position.y); p.browRZ = p.head.brows.map((b) => b.rotation.z); return p; };
  const you = person({ skin: 0xe2ad8c, top: 0x9cc0e6, collar: 0xf4f4f2, pants: 0x2f3a4a, shoes: 0xf4f1ea, hair: 0x3a2618, hairStyle: 'messy', headR: 0.14 });
  const partner = person({ skin: 0xc98e6a, top: 0xe58fa6, pants: 0xe58fa6, hair: 0x2a1d16, hairStyle: 'bob' });
  const pool = Array.from({ length: 12 }, (_, i) => {
    const style = STYLES[i % STYLES.length];
    return person({ skin: SKINS[(i * 3 + 1) % SKINS.length], top: TOPS[(i * 3) % TOPS.length], collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: HAIRS[(i * 5) % HAIRS.length], hairStyle: style,
      glasses: i % 4 === 1, mustache: style === 'short' && i % 3 === 0 ? pick(HAIRS.slice(0, 3)) : null });
  });
  const POOL_TOPS = pool.map((p) => p.mats.top.color.getHex());
  const boss = person({ skin: 0xf1c3a1, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0xc9c4be, hairStyle: 'short', glasses: true, mustache: 0x9a948c });
  const librarian = person({ skin: 0xc98e6a, top: 0x8f6fb8, collar: 0xf4f1ea, pants: 0x3a3d42, hair: 0x2a1d16, hairStyle: 'bob', glasses: true });
  const bride = person({ skin: 0xf3d0b5, top: 0xfbfaf6, pants: 0xfbfaf6, dress: 0xfbfaf6, hair: 0x9a6a3a, hairStyle: 'bob' });
  const groom = person({ skin: 0x9a6447, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short' });
  const officiant = person({ skin: 0xd9a37f, top: 0x1d1d22, collar: 0xf4f4f2, pants: 0x1d1d22, hair: 0xc9c4be, hairStyle: 'none', glasses: true, mustache: 0xc9c4be });
  const maid = person({ skin: 0x6e4430, top: 0xe58fa6, pants: 0xe58fa6, dress: 0xe58fa6, hair: 0x1a1a1a, hairStyle: 'bob' });
  const vendor = person({ skin: 0xd9a37f, top: 0xf4f1ea, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const sci = [person({ skin: 0xf1c3a1, top: 0xf6f7f8, collar: 0x7fb6d6, pants: 0x45607a, hair: 0xd9b46a, hairStyle: 'bob', glasses: true }),
    person({ skin: 0x9a6447, top: 0xf6f7f8, collar: 0x7fb6d6, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'none', mustache: 0x1a1a1a })];
  const ref = person({ skin: 0xe2ad8c, top: 0x1d1d22, pants: 0x1d1d22, hair: 0x5a3a24, hairStyle: 'short' });
  const grandma = person({ skin: 0xf1c3a1, top: 0xb07fa0, collar: 0xf4f1ea, pants: 0x6b5a48, hair: 0xeeeae4, hairStyle: 'bob', glasses: true });
  const mom = person({ skin: 0xe2ad8c, top: 0x58b3a8, pants: 0x3a3d42, hair: 0x5a3a24, hairStyle: 'bob' });
  const kid = person({ skin: 0xe9b48f, top: 0xf1c24a, pants: 0x3d7bd9, hair: 0x3a2618, hairStyle: 'messy', headR: 0.175 }); kid.r = 0.175;
  const dog = makeDog(); scene.add(dog.g);
  const pigeons = Array.from({ length: 12 }, () => { const p = makePigeon(); scene.add(p.root); return p; });
  for (const b of [bride, maid]) if (b.dress) b.dress.visible = true;

  // props
  const handOf = (rig, s) => rig.arms.find((a) => a.s === s).hand;
  const veil = new THREE.Group(); scene.add(veil);
  const veilM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  mk(new THREE.ConeGeometry(0.32, 0.9, 20, 1, true), veilM, veil, 0, -0.32, -0.06).castShadow = false;
  const crown = mk(new THREE.TorusGeometry(0.12, 0.018, 6, 20), mat(0xf2b632, 0.4, { metalness: 0.5 }), veil, 0, 0.12, 0); crown.rotation.x = PI / 2 - 0.3;
  const book = new THREE.Group(); handOf(you, -1).add(book); book.position.set(0.08, -0.06, 0.08);
  mk(new THREE.BoxGeometry(0.17, 0.23, 0.04), mat(0x9b2f2f, 0.7), book).rotation.y = 0.3;
  const readerBooks = [0, 1, 2, 3, 4, 5].map((i) => { const b = mk(new THREE.BoxGeometry(0.32, 0.02, 0.22), mat(0xf4ecd8, 0.8), handOf(pool[i + 4], 1), 0, -0.07, 0.12); b.rotation.x = -0.6; return b; });
  const folder = mk(new THREE.BoxGeometry(0.24, 0.31, 0.02), mat(0x3d7bd9, 0.6), handOf(pool[1], 1), 0, -0.07, 0.07); folder.rotation.x = -0.3;
  const phone = mk(new THREE.BoxGeometry(0.07, 0.14, 0.01), mat(0x1d1d22, 0.3), handOf(pool[2], -1), 0, -0.05, 0.03); phone.rotation.x = -0.3;
  const eCup = new THREE.Group(); handOf(pool[3], 1).add(eCup); eCup.position.set(0, -0.05, 0.05);
  mk(new THREE.CylinderGeometry(0.042, 0.032, 0.13, 16), mat(0xf4f1ea, 0.6), eCup, 0, 0.02, 0);
  const eLid = mk(new THREE.CylinderGeometry(0.046, 0.044, 0.018, 16), mat(0x5a3a24, 0.5), eCup, 0, 0.094, 0);
  const hotdog = makeHotDog(); handOf(you, 1).add(hotdog); hotdog.position.set(0, -0.05, 0.08); hotdog.rotation.y = PI / 2;
  const tea = new THREE.Group(); handOf(grandma, 1).add(tea); tea.position.set(0, -0.04, 0.06);
  mk(new THREE.CylinderGeometry(0.045, 0.032, 0.07, 16), mat(0xf6f1e6, 0.4), tea, 0, 0.02, 0); mk(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mat(0xf6f1e6, 0.4), tea, 0.05, 0.02, 0).rotation.y = PI / 2;
  const cups = [makeMug(0xf2b632), makeMug(0x3d7bd9)]; cups.forEach((c, i) => { handOf(sci[i], i ? -1 : 1).add(c); c.position.set(0, -0.08, 0.06); });
  const foam = new THREE.Group(); scene.add(foam);
  mk(new THREE.BoxGeometry(0.16, 0.42, 0.05), mat(0xc8302c, 0.7), foam, 0, 0.1, 0); mk(new THREE.BoxGeometry(0.05, 0.16, 0.05), mat(0xc8302c, 0.7), foam, 0.02, 0.38, 0);

  // hats (scene objects posed on a head each frame; at a blast they fly ballistic)
  function makeHat(kind, color) {
    const g = new THREE.Group(); scene.add(g); const m = mat(color, 0.75);
    if (kind === 'fedora') { mk(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 18), m, g, 0, 0.06, 0); mk(new THREE.CylinderGeometry(0.21, 0.21, 0.014, 22), m, g, 0, 0.006, 0); mk(new THREE.CylinderGeometry(0.121, 0.121, 0.03, 18), mat(0x2a1d16, 0.6), g, 0, 0.025, 0); }
    if (kind === 'cap') { mk(new THREE.SphereGeometry(0.135, 18, 10, 0, PI * 2, 0, PI / 2), m, g, 0, -0.02, 0); const b = mk(new THREE.BoxGeometry(0.17, 0.012, 0.13), m, g, 0, -0.01, 0.15); b.rotation.x = 0.1; }
    if (kind === 'church') { mk(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 18), m, g, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.28, 0.28, 0.012, 24), m, g, 0, 0.004, 0); mk(new THREE.SphereGeometry(0.04, 10, 8), mat(0xffffff, 0.6), g, 0.09, 0.07, 0.06); }
    if (kind === 'paper') { const c = mk(new THREE.BoxGeometry(0.26, 0.08, 0.14), mat(0xfbfaf6, 0.8), g, 0, 0.04, 0); void c; }
    if (kind === 'beanie') { mk(new THREE.SphereGeometry(0.14, 18, 10, 0, PI * 2, 0, PI / 2), m, g, 0, -0.03, 0); mk(new THREE.SphereGeometry(0.04, 10, 8), mat(0xffffff, 0.8), g, 0, 0.11, 0); }
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.visible = false; return g;
  }
  const HATS = { fedora1: makeHat('fedora', 0x6b5a48), fedora2: makeHat('fedora', 0x2f3a4a), cap1: makeHat('cap', 0x3d7bd9), cap2: makeHat('cap', 0xc8302c), cap3: makeHat('cap', 0xc8302c),
    church1: makeHat('church', 0xe58fa6), church2: makeHat('church', 0x8fb6d6), church3: makeHat('church', 0xf2b632), paper: makeHat('paper', 0xffffff), beanie: makeHat('beanie', 0xc8302c), beanie2: makeHat('beanie', 0xf4f1ea) };
  const _hq = new THREE.Quaternion(), _hp = new THREE.Vector3();
  /** a hat on a rig's head; from tb it flies with velocity v (world m/s), spin, falling to floorY (world) */
  function hat(h, rig, t, tb, v = [0, 3, 2], floorY = -50, lift = 0.92) {
    h.visible = true; rig.root.updateMatrixWorld(true);
    rig.head.g.getWorldPosition(_hp); rig.head.g.getWorldQuaternion(_hq);
    const up = V3(0, rig.r * lift + 0.02, -0.01).applyQuaternion(_hq).multiplyScalar(rig.root.scale.x);
    h.position.copy(_hp).add(up); h.quaternion.copy(_hq); h.scale.setScalar(rig.root.scale.x * rig.r / 0.13);
    if (tb !== null && t > tb) {
      const a = t - tb, d = (1 - Math.exp(-2.2 * a)) / 2.2;
      h.position.x += v[0] * d; h.position.z += v[2] * d; h.position.y = Math.max(floorY, h.position.y + v[1] * d - 3.2 * a * a);
      h.rotateX(-a * 7); h.rotateZ(a * 4);
    }
  }

  // ---------------------------------------------------------------- FX: pressure rings, impact starbursts, dust, debris, camera jolts
  const ringTex = canvasTex(256, 256, (c) => { c.translate(128, 128); for (const [r, w, col] of [[108, 20, 'rgba(120,190,255,.35)'], [108, 9, 'rgba(255,255,255,.95)'], [92, 4, 'rgba(255,255,255,.45)']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); } });
  const rings = Array.from({ length: 9 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const floorRings = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); m.rotation.x = -PI / 2; m.visible = false; m.renderOrder = 2; scene.add(m); return m; });
  let ringN = 0, fringN = 0;
  /** the cartoon pressure ring: 3 camera-facing rings + 2 floor rings expanding from p (LOCAL to key) to `size` m wide */
  function ripple(t, tb, key, p, size, floorY = null, n = 3) {
    const o = OFF[key];
    for (let k = 0; k < n; k++) {
      const age = t - tb - 0.11 * k, L = 0.75 + 0.1 * k; if (age < 0 || age > L || ringN >= rings.length) continue;
      const u = age / L, s = rings[ringN++]; s.visible = true; s.position.set(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
      s.scale.setScalar(size * (0.12 + 0.88 * (1 - (1 - u) ** 2.2)) * (1 - 0.2 * k)); s.material.opacity = 0.9 * (1 - u) ** 1.2;
    }
    if (floorY === null) return;
    for (let k = 0; k < 2; k++) {
      const age = t - tb - 0.15 * k, L = 1.0; if (age < 0 || age > L || fringN >= floorRings.length) continue;
      const u = age / L, m = floorRings[fringN++]; m.visible = true; m.position.set(p[0] + o[0], floorY + o[1] + 0.02, p[2] + o[2]);
      const s = size * 1.6 * (0.1 + 0.9 * (1 - (1 - u) ** 2)); m.scale.set(s, s, 1); m.material.opacity = 0.8 * (1 - u);
    }
  }
  const puffs = makeSpritePool(scene, 60, 'smoke'); const puffCol = new THREE.Color(0xf2ece2);
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 8 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0;
  function impact(t, m, key, p, s = 1, star = true) {
    const age = t - m; if (age < 0 || age > 0.9) return;
    const o = OFF[key], w = V3(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
    if (star && age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    for (let k = 0; k < 5 && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + k * 1.3, r = (0.12 + age * 0.9) * s;
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y - 0.15 * s + k * 0.06 * s + age * 0.3 * s, w.z + Math.sin(a) * r * 0.6), (0.3 + age * 0.9) * s, 0.7 * (1 - age / 0.9) ** 1.5, puffCol);
    }
  }
  // debris pools: papers, books, petals, glass shards, popcorn — all analytic (position = f(t − tb)), no state
  const BOOK_COLS = [0xd2483f, 0x3d7bd9, 0xf2b632, 0x58b368, 0x8f6fb8, 0x2f3a4a, 0xe08a3a, 0x9b2f2f];
  const mkPool = (n, f) => Array.from({ length: n }, (_, i) => { const m = f(i); m.visible = false; m.frustumCulled = false; scene.add(m); return m; });
  const DEB = {
    paper: mkPool(44, () => new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), mat(0xfbfaf6, 0.8, { side: THREE.DoubleSide }))),
    book: mkPool(56, (i) => new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.23, 0.04 + (i % 3) * 0.015), mat(BOOK_COLS[i % BOOK_COLS.length], 0.7))),
    petal: mkPool(90, (i) => new THREE.Mesh(new THREE.CircleGeometry(0.035, 6), mat([0xe58fa6, 0xffffff, 0xf2b632, 0xf4c6d6][i % 4], 0.8, { side: THREE.DoubleSide }))),
    shard: mkPool(30, () => new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), new THREE.MeshStandardMaterial({ color: 0xcfe6f6, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.75, side: THREE.DoubleSide }))),
    pop: mkPool(70, (i) => new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), mat(i % 3 ? 0xfff4cc : 0xf2d27a, 0.8))),
  };
  const used = {};
  const FLUTTER = { paper: 1, petal: 1, pop: 0 };
  /** n pieces of `kind` launched at tb from o ± sp (LOCAL to key) with velocity v ± vs; land on floorY (local) */
  function burst(t, tb, key, kind, n, o, sp, v, vs, floorY = 0, seed = 1) {
    const age0 = t - tb; if (age0 < 0) return;
    const pool = DEB[kind], off = OFF[key];
    for (let i = 0; i < n && used[kind] < pool.length; i++) {
      const r = rng(seed * 131 + i * 7), m = pool[used[kind]++];
      const p0 = [o[0] + (r() - 0.5) * 2 * sp[0], o[1] + (r() - 0.5) * 2 * sp[1], o[2] + (r() - 0.5) * 2 * sp[2]];
      const vv = [v[0] + (r() - 0.5) * 2 * vs, v[1] + (r() - 0.5) * 2 * vs, v[2] + (r() - 0.5) * 2 * vs];
      const a = Math.max(0, age0 - r() * 0.1), fl = FLUTTER[kind] ?? 0, kd = fl ? 1.6 : 0.6, d = (1 - Math.exp(-kd * a)) / kd;
      let y = p0[1] + vv[1] * d - (fl ? 0.55 * a + 0.15 * a * a : 4.9 * a * a);
      const landed = y <= floorY + 0.01; y = Math.max(floorY + 0.01, y);
      m.visible = true;
      m.position.set(p0[0] + vv[0] * d + (fl ? 0.12 * Math.sin(a * 5 + i) : 0) + off[0], y + off[1], p0[2] + vv[2] * d + (fl ? 0.12 * Math.cos(a * 4 + i) : 0) + off[2]);
      if (landed) m.rotation.set(-PI / 2, 0, i); else m.rotation.set(r() * 6 + a * (3 + r() * 6), r() * 6 + a * 4, r() * 6 + a * (2 + r() * 5));
    }
  }
  const jolts = [];

  // ---------------------------------------------------------------- placement helpers
  function show(rig, key, p, o = {}) {
    p.x += OFF[key][0]; p.y = (p.y || 0) + OFF[key][1]; p.z += OFF[key][2];
    if (p.floor !== undefined) p.floor += OFF[key][1];
    if (rig.glasses) p.glasses = true;
    applyPose(rig, p);
    rig.root.rotation.x = o.tilt || 0; rig.root.rotation.z = o.roll || 0;
    rig.root.scale.setScalar(o.s || 1);
    rig.root.visible = true;
  }
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _c = new THREE.Vector3();
  /** pose a rig by its BODY CENTER C (local): yaw/tilt/roll orient the whole body (flying). Legs hang. */
  function showC(rig, key, p, C, yaw, tilt = 0, roll = 0) {
    _e.set(tilt, yaw, roll); _c.set(0, HC, 0).applyEuler(_e);
    p.x = C[0] - _c.x; p.y = C[1] - _c.y; p.z = C[2] - _c.z; p.rotY = yaw; p.floor = p.y - 2.5;
    show(rig, key, p, { tilt, roll });
  }
  /** a rig lying on its back with its hip at H (local), feet toward +z; tilt −π/2 = flat, 0 = sitting up */
  function lie(rig, key, p, H, tilt) {
    p.x = H[0]; p.y = H[1] - HIP_H * Math.cos(tilt); p.z = H[2] - HIP_H * Math.sin(tilt); p.rotY = 0; p.floor = p.y - 2.5; p.footFwd = 0.45 * clamp(-tilt / 1.2);
    show(rig, key, p, { tilt });
  }
  const pose = (o) => Object.assign(basePose(), o);
  const sitPose = (o, seat, feet = seat - 0.45) => pose({ y: seat - SIT, footFwd: 0.42, floor: feet, ...o });
  /** hair swept back + shocked face (k 0..1) — reset every frame */
  function blow(rig, k, wide = k) {
    const h = rig.head.hair; h.rotation.x = -0.45 * k; h.position.z = -0.03 * k; h.position.y = 0.01 * k; h.scale.set(1, 1 + 0.12 * k, 1 + 0.15 * k);
    rig.head.eyesOpen.scale.setScalar(1 + 0.3 * wide); rig.head.brows.forEach((b, i) => (b.position.y = rig.browY[i] + 0.07 * rig.r * wide));
  }
  function resetFace(rig) { const h = rig.head.hair; h.rotation.set(0, 0, 0); h.position.set(0, 0, 0); h.scale.set(1, 1, 1); rig.head.eyesOpen.scale.setScalar(1); rig.head.brows.forEach((b, i) => { b.position.y = rig.browY[i]; b.rotation.z = rig.browRZ[i]; }); }
  /** blast reaction on a pose: lean back, arms flung, mouth O; k = strength envelope (pulse) */
  function blast(p, k, back = 0.35) {
    if (k <= 0.001) return;
    p.lean = lerp(p.lean ?? 0, -back, k); p.armA = mixArm(p.armA || REST, BACK_A, k * 0.85); p.armB = mixArm(p.armB || REST, BACK_B, k * 0.85);
    p.headPitch = lerp(p.headPitch ?? 0, -0.25, k); if (k > 0.3) p.mouth = 'o';
  }
  /** turn the head (and a bit of the body) toward a point; k 0..1 */
  function look(p, x, z, tx, tz, k, bodyShare = 0.35) {
    const want = headAt(x, z, tx, tz); let d = ((want - p.rotY + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI;
    d = clamp(d, -2.2, 2.2); p.rotY += d * bodyShare * k; p.headYaw = lerp(p.headYaw ?? 0, d * (1 - bodyShare), k);
  }
  const camPos = new THREE.Vector3();
  const recolor = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };

  // ================================================================ 1. BED (master bedroom)
  const T = MB.top, HIP_YOU = [0.4, T + 0.15, -1.3], HIP_PAR = [-0.4, T + 0.15, -1.3];
  function bedBeat(t) {
    const asleep = t < F[1] + 0.25, breathe = 0.012 * Math.sin(t * 1.6);
    // you: asleep → eyes snap open at #2 → the sheepish look at her ("Sorry, babe.")
    const yp = pose({ mouth: 'flat', headPitch: 0.55, headYaw: -0.15 }); yp.eyes = asleep ? 'closed' : t < F[2] ? (Math.sin(t * 3) > 0.7 ? 'closed' : 'open') : blink(t, 2);
    yp.armA = A(0.05, 0.12, -0.2); yp.armB = A(0.05, 0.12, -0.2);
    if (t > F[1] - 0.05 && t < F[1] + 0.5) yp.headPitch = 0.45 + 0.1 * Math.sin(t * 20);
    const k2 = pulse(t, F[2], 0.1, 0.5, 0.5);
    if (t > F[2]) { yp.headPitch = lerp(0.55, 0.85, k2); yp.mouth = 'o'; yp.armA = mixArm(yp.armA, UP_A, k2 * 0.8); yp.armB = mixArm(yp.armB, UP_B, k2 * 0.8); }
    if (t > 7.7) { const k = K(t, [[7.7, 0], [7.95, 1]]); yp.headYaw = lerp(-0.15, -0.9, k); yp.headRoll = 0.15 * k; yp.mouth = 'smile'; yp.armA = mixArm(yp.armA, REST, k); yp.armB = mixArm(yp.armB, A(-0.35, 0.3, -1.9, -0.6), k); }
    lie(you, 'bed', yp, [HIP_YOU[0], HIP_YOU[1] + breathe, HIP_YOU[2]], -1.2);
    blow(you, k2 * 0.8, k2);
    // partner: sits bolt upright at #2, glares at you
    const pp = pose({ mouth: 'flat', headPitch: 0.5, headYaw: 0.2 }); pp.eyes = t < F[2] ? 'closed' : blink(t, 5);
    const up = K(t, [[F[2] + 0.05, 0], [F[2] + 0.35, 1]], easeOutBack);
    pp.armA = mixArm(A(0.05, 0.12, -0.2), A(-0.6, 0.5, -1.6, 0.6), up); pp.armB = mixArm(A(0.05, 0.12, -0.2), A(-0.6, 0.5, -1.6, -0.6), up);
    if (t > F[2]) { pp.headPitch = lerp(0.5, 0.05, up); pp.mouth = t < 7.6 ? 'o' : 'flat'; pp.headYaw = lerp(0.2, 0.75, K(t, [[7.3, 0], [7.6, 1]])); pp.lean = 0.1 * up; }
    if (t > F[1] && t < F[1] + 0.9 && t < F[2]) pp.headYaw = 0.35;   // she stirs at #1
    lie(partner, 'bed', pp, [HIP_PAR[0], HIP_PAR[1] + breathe * 0.8, HIP_PAR[2]], lerp(-1.2, -0.12, up));
    blow(partner, k2, k2);
    if (t > 7.7) { const k = K(t, [[7.7, 0], [8.0, 1]]); partner.head.brows.forEach((b, i) => { b.position.y = partner.browY[i] - 0.03 * partner.r * k; b.rotation.z = partner.browRZ[i] + (i ? 1 : -1) * 0.4 * k; }); }
    // the duvet: breathes, puffs at #1, flies up at #2 and floats back down
    const fly = K(t, [[F[2], 0], [F[2] + 0.28, 1], [F[2] + 0.75, 0.9], [F[2] + 1.35, 0]]);
    bed.duvet.position.set(0, T + 0.55 * fly, -0.25 + 0.15 * fly); bed.duvet.rotation.x = -0.35 * fly + 0.04 * Math.sin(t * 6) * fly;
    bed.duvet.scale.set(1, 1 + breathe * 2 + 0.08 * pulse(t, F[1], 0.06, 0.1, 0.3), 1);
    // dog: lifts his head at #1, leaps off at #2
    const dg = dog.g; dg.visible = true; dg.scale.setScalar(1.1);
    const leap = clamp((t - F[2] - 0.05) / 0.62);
    if (t < F[2] + 0.05) { dg.position.set(OFF.bed[0] + 0.15, T + 0.32, -0.62); dg.rotation.set(0, 0.35, 0); dog.setLie(1); dog.update(t, 0); dog.head.rotation.x = t > F[1] + 0.1 ? -0.35 : 0.15; dog.bark(0); }
    else { const x = lerp(0.15, 1.75, leap), z = lerp(-0.62, 0.55, leap), y = lerp(T + 0.32, 0, leap) + 0.75 * Math.sin(leap * PI); dg.position.set(OFF.bed[0] + x + 1.4 * Math.max(0, t - F[2] - 0.67), y, z + 0.4 * Math.max(0, t - F[2] - 0.67)); dg.rotation.set(-0.25 * Math.sin(leap * PI), 1.0, 0.2 * Math.sin(leap * PI)); dog.setLie(0); dog.update(t, 2.2); dog.bark(t < F[2] + 0.5 ? 1 : 0); }
    // the alarm clock hops off, lamps wobble, the art tilts, curtains flutter
    const c = clamp((t - F[2] - 0.08) / 0.5);
    bed.clock.position.set(-0.08 - 0.2 * c, MB.standH + 0.25 * Math.sin(c * PI) - (MB.standH) * c * c, 0.08 + 0.25 * c); bed.clock.rotation.set(2.5 * c, 0, 1.3 * c);
    if (t < F[2]) bed.clock.position.set(-0.08, MB.standH + 0.02 * pulse(t, F[1], 0.05, 0.05, 0.15), 0.08);
    const wob = t > F[2] ? Math.exp(-(t - F[2]) * 2.5) * Math.sin((t - F[2]) * 14) : 0;
    bed.lamps.forEach((l, i) => (l.rotation.z = 0.2 * wob * (i ? -1 : 1)));
    bed.art.rotation.z = t > F[2] ? 0.16 * K(t, [[F[2] + 0.05, 0], [F[2] + 0.3, 1]]) + 0.05 * wob : 0;
    bed.curtains.forEach((cu, i) => (cu.rotation.x = -0.25 * pulse(t, F[2] + 0.1, 0.15, 0.4, 0.8) + 0.03 * Math.sin(t * 0.9 + i)));
    ripple(t, F[1], 'bed', [0.4, 0.82, -1.25], 0.55, null, 2);
    ripple(t, F[2], 'bed', [0.4, 0.85, -1.25], 3.0, 0.0);
    burst(t, F[2] + 0.05, 'bed', 'paper', 4, [-1.12, MB.standH + 0.05, -2.1], [0.08, 0.02, 0.08], [0.6, 2.2, 1.2], 0.6, 0, 3);   // the book's pages
    jolts.push([F[1], 0.004], [F[2], 0.03]);
  }

  // ================================================================ 2. ELEVATOR
  const RIDERS = [[-0.72, -0.55], [0.72, -0.5], [-0.62, 0.3], [0.64, 0.32]], YOU_EL = [0.02, -0.48];
  function elevBeat(t) {
    elev.setFloor(Math.min(12, 2 + Math.floor((t - 8.9) / 0.42)));
    const drop = F[4]; const jl = t > drop ? Math.exp(-(t - drop) * 5) * Math.sin((t - drop) * 30) : 0;
    elev.root.position.y = OFF.elev[1] - 0.05 * K(t, [[drop, 0], [drop + 0.08, 1], [drop + 0.3, 0.4]]) + 0.01 * jl;
    elev.lights.ceil.intensity = ELEV_CEIL * (t > drop && t < drop + 0.55 ? (Math.sin(t * 60) > 0.2 ? 1 : 0.25) : 1);
    const yp = pose({ x: YOU_EL[0], z: YOU_EL[1], rotY: 0, mouth: 'flat' }); yp.eyes = blink(t, 1); yp.armA = REST; yp.armB = REST;
    yp.headYaw = 0.08 * Math.sin(t * 0.7);
    if (t > F[3] + 0.3) { yp.headPitch = -0.38; yp.mouth = Math.sin(t * 2.5) > -0.2 ? 'o' : 'flat'; yp.headYaw = 0.1 * Math.sin(t * 1.3); }   // whistles at the display
    const kb = pulse(t, F[4], 0.1, 0.25, 0.5);
    if (t > F[4]) { yp.lean = lerp(0.03, -0.05, kb); yp.armA = mixArm(REST, A(-0.1, 0.25, -0.2), kb); yp.armB = mixArm(REST, A(-0.1, 0.25, -0.2), kb); }
    show(you, 'elev', yp); blow(you, kb * 0.7, 0);
    RIDERS.forEach(([x0, z0], i) => {
      const rig = pool[i], p = pose({ x: x0, z: z0, rotY: 0, mouth: 'flat' }); p.eyes = blink(t, 3 + i);
      p.headYaw = 0.1 * Math.sin(t * 0.5 + i * 2);
      if (i === 1) p.armB = A(-0.5, 0.15, -1.3, -0.4); if (i === 2) { p.armA = PHONE_A; p.headPitch = 0.42; } if (i === 3) p.armB = CUP_B;
      // #3: eyes slide toward you (the back two turn their heads; the front two freeze, eyes wide)
      const k3 = K(t, [[F[3] + 0.15 + 0.1 * i, 0], [F[3] + 0.7 + 0.1 * i, 1]]);
      if (i < 2) look(p, x0, z0, YOU_EL[0], YOU_EL[1], k3 * (1 - K(t, [[F[4] + 0.6, 0], [F[4] + 0.9, 1]])), 0.1);
      else p.headYaw = lerp(p.headYaw, (i === 2 ? 0.25 : -0.25), k3 * (1 - K(t, [[F[4] + 0.6, 0], [F[4] + 0.9, 1]])));
      const kb2 = pulse(t, F[4] + 0.02 * i, 0.1, 0.3, 0.5);
      blast(p, kb2, 0.3); if (i === 2) p.armA = mixArm(PHONE_A, UP_A, kb2);
      p.x += (x0 < 0 ? -1 : 1) * 0.08 * kb2;
      // then: nobody makes eye contact — everyone stares straight ahead
      if (t > F[4] + 0.9) { p.headYaw = 0; p.headPitch = 0.02; p.mouth = 'flat'; p.eyes = blink(t, 3 + i); }
      show(rig, 'elev', p); blow(rig, i === 0 ? 0 : kb2, Math.max(kb2, t > F[3] + 0.2 ? 0.35 : 0));
    });
    // the toupee pops up and lands crooked
    const h = pool[0].head.hair, tp = K(t, [[F[4], 0], [F[4] + 0.18, 1], [F[4] + 0.42, 0.06]]);
    h.position.y = 0.36 * tp + (t > F[4] + 0.42 ? 0.012 : 0); h.rotation.z = t > F[4] ? 0.45 * K(t, [[F[4] + 0.1, 0], [F[4] + 0.45, 1]]) : 0; h.rotation.y = 3 * tp;
    folder.visible = true; phone.visible = true; eCup.visible = true; eLid.position.y = 0.094 + 0.3 * K(t, [[F[4] + 0.05, 0], [F[4] + 0.2, 1], [F[4] + 0.5, 0]]);
    ripple(t, F[3], 'elev', [YOU_EL[0], 0.95, YOU_EL[1]], 0.9, 0.0, 2);
    ripple(t, F[4], 'elev', [YOU_EL[0], 0.95, YOU_EL[1]], 2.6, 0.0);
    burst(t, F[4] + 0.04, 'elev', 'paper', 9, [0.78, 1.15, -0.35], [0.08, 0.1, 0.08], [-0.2, 2.6, 0.9], 1.0, 0, 7);
    jolts.push([F[3], 0.003], [F[4], 0.035]);
  }

  // ================================================================ 3. OFFICE (the big pitch)
  const YOU_OF = [-1.0, -0.3];
  function officeBeat(t) {
    const yp = pose({ x: YOU_OF[0], z: YOU_OF[1], rotY: 0.75, mouth: 'flat' }); yp.eyes = blink(t, 2);
    yp.armB = REST; yp.armA = A(-1.45, 0.75, -0.15, 0.2);   // pointing back at the chart (armA = his −x side)
    yp.headYaw = t < F[5] ? -0.25 + 0.3 * Math.sin(t * 1.4) : 0.1; yp.mouth = t < F[5] && Math.sin(t * 13) > 0.1 ? 'o' : 'flat';
    if (t < F[5]) yp.armB = A(-0.9 - 0.2 * Math.sin(t * 2.2), 0.3, -1.1, -0.4);
    const kb = pulse(t, F[6], 0.1, 0.4, 0.6);
    if (t > F[5]) { yp.armA = mixArm(yp.armA, A(-0.2, 0.3, -0.2), K(t, [[F[5] + 0.3, 0], [F[5] + 0.6, 1]])); }
    if (t > F[6]) { yp.lean = -0.05 * kb; yp.armB = mixArm(REST, SHRUG_B, K(t, [[F[6] + 0.6, 0], [F[6] + 0.9, 1]])); yp.armA = mixArm(yp.armA, SHRUG_A, K(t, [[F[6] + 0.6, 0], [F[6] + 0.9, 1]])); }
    show(you, 'office', yp); blow(you, kb * 0.5, 0);
    SEATS_O.forEach(([x, z], i) => {
      const rig = pool[i + 4], p = sitPose({ x, z: z + 0.08, rotY: 0, mouth: 'flat' }, 0.48, 0); p.eyes = blink(t, 10 + i);
      p.headPitch = 0.3; p.armA = A(-0.6, 0.1, -1.0, 0.4); p.armB = A(-0.6 - 0.15 * Math.max(0, Math.sin(t * 6 + i)), 0.1, -1.0, -0.4); p.headYaw = 0.1 * Math.sin(t + i);
      const k5 = K(t, [[F[5] + 0.08 + 0.06 * i, 0], [F[5] + 0.25 + 0.06 * i, 1]]);
      if (t > F[5]) { p.headPitch = 0; look(p, x, z, YOU_OF[0], YOU_OF[1], k5, 0.15); p.armB = A(-0.6, 0.1, -1.0, -0.4); }
      const k6 = pulse(t, F[6] + 0.04 * i, 0.12, 0.45, 0.6); blast(p, k6, 0.3);
      if (t > 18.15) { const k = K(t, [[18.15, 0], [18.4, 1]]); look(p, x, z, BOSS[0], BOSS[1], k, 0); }
      show(rig, 'office', p); blow(rig, k6, Math.max(k6, k5 * 0.4));
      oChairs[i].position.z = SEATS_O[i][1] - 0.2 * K(t, [[F[6] + 0.05, 0], [F[6] + 0.3, 1]]); rig.root.position.z += oChairs[i].position.z - SEATS_O[i][1];
    });
    // the CEO: chair rolls back + spins once, then a slow, impressed clap
    const roll = K(t, [[F[6] + 0.05, 0], [F[6] + 0.55, 1]], (u) => 1 - (1 - u) ** 2), spin = 2 * PI * K(t, [[F[6] + 0.05, 0], [F[6] + 0.9, 1]], (u) => 1 - (1 - u) ** 2);
    const bx = BOSS[0] + 0.75 * roll;
    bossChair.position.x = bx; bossChair.rotation.y = -PI / 2 + spin;
    const bp = sitPose({ x: bx, z: BOSS[1], rotY: -PI / 2 + spin, mouth: 'flat' }, 0.48, 0); bp.eyes = blink(t, 14); bp.headPitch = 0.1;
    bp.armA = A(-0.5, 0.15, -1.2, 0.4); bp.armB = A(-0.5, 0.15, -1.2, -0.4);
    if (t > F[5]) { bp.headYaw = 0; bp.mouth = 'flat'; boss.head.brows[0].position.y = boss.browY[0] + 0.012; }
    const kb6 = pulse(t, F[6], 0.1, 0.5, 0.5); blast(bp, kb6, 0.25);
    if (t > 18.1) { const [ca, cb] = CLAP(t - 18.1); bp.armA = ca; bp.armB = cb; bp.mouth = 'smile'; bp.headPitch = 0.08 * Math.sin(t * 5); }
    show(boss, 'office', bp); blow(boss, kb6, kb6);
    // flip chart pages fly over the top, mugs hop, papers blizzard
    pages.forEach((pv, i) => (pv.rotation.x = -2.9 * K(t, [[F[6] + 0.05 + 0.07 * i, 0], [F[6] + 0.35 + 0.07 * i, 1]], (u) => u * u)));
    offMugs.forEach((m, i) => { const h = K(t, [[F[6] + 0.03 * i, 0], [F[6] + 0.12 + 0.03 * i, 1], [F[6] + 0.3 + 0.03 * i, 0]]) * 0.12; m.position.y = OT.top + h; m.rotation.z = 0.3 * h * (i - 1); });
    ripple(t, F[5], 'office', [YOU_OF[0], 0.95, YOU_OF[1]], 1.4, 0.0, 2);
    ripple(t, F[6], 'office', [YOU_OF[0], 0.95, YOU_OF[1]], 4.2, 0.0);
    burst(t, F[6] + 0.03, 'office', 'paper', 36, [0.1, OT.top + 0.05, OT.z], [1.0, 0.03, 0.4], [0.9, 2.6, -0.4], 1.4, 0, 11);
    jolts.push([F[5], 0.005], [F[6], 0.04]);
  }

  // ================================================================ 4. LIBRARY
  const READERS = [[-1.67, -2.7, 1], [-1.67, -1.75, 1], [0.43, -1.75, 1], [0.43, -0.8, 1], [0.43, -2.7, 1], [-1.67, -0.8, 1]];
  const youLibZ = (t) => lerp(-2.1, -1.0, K(t, [[19.0, 0], [20.75, 1]], (u) => u));
  function libBeat(t) {
    const z = youLibZ(t), walking = t < 20.75;
    const yp = pose({ x: 0.02, z, rotY: 0, dist: 0.9 * (z + 2.1), speed: walking ? 0.6 : 0, mouth: 'flat', crouch: 0.06, lean: 0.12 }); yp.eyes = blink(t, 2);
    yp.armA = BOOK_A; yp.armB = REST; yp.headYaw = 0.25 * Math.sin(t * 1.7); book.visible = true;
    const k7 = pulse(t, F[7], 0.1, 0.5, 0.7);
    if (t > F[7]) { yp.eyes = t < F[7] + 0.6 ? 'closed' : blink(t, 2); yp.headYaw = 0; yp.crouch = 0.06 + 0.1 * k7; yp.headPitch = 0.15 * k7; yp.armB = mixArm(REST, A(-0.3, 0.6, -0.5), k7); }
    if (t > 22.2) { const k = K(t, [[22.2, 0], [22.5, 1]]); yp.armB = mixArm(yp.armB, SHRUG_B, k); yp.eyes = blink(t, 2); yp.mouth = 'smile'; yp.headRoll = 0.12 * k; }
    show(you, 'lib', yp); blow(you, k7 * 0.4, 0);
    READERS.forEach(([x, rz, side], i) => {
      if (i === 3) return;
      const rig = pool[i + 4], p = sitPose({ x, z: rz, rotY: side * PI / 2 + side * 0.35, mouth: 'flat' }, LB.seatY, 0); p.eyes = blink(t, 20 + i);
      p.armB = A(-0.7, 0.1, -1.4, -0.6); p.armA = A(-0.7, 0.1, -1.4, 0.6); p.headPitch = 0.45; readerBooks[i].visible = true;
      const k = pulse(t, F[7] + 0.03 * i, 0.12, 0.6, 0.7);
      if (t > 20.3) { const kl = K(t, [[20.3 + 0.08 * i, 0], [20.6 + 0.08 * i, 1]]); p.headPitch = lerp(0.45, 0.05, kl); look(p, x, rz, 0, z, kl, 0.15); }
      blast(p, k, 0.3); show(rig, 'lib', p); blow(rig, k, k);
    });
    // librarian: shush, then blasted (glasses stay on — barely)
    const lp = pose({ x: -1.05, z: -3.6, rotY: 0.6, y: 0, mouth: 'flat' }); lp.eyes = blink(t, 30);
    lp.armA = REST; lp.armB = t > 20.1 && t < F[7] ? SHH_B : REST; lp.headPitch = 0.05;
    if (t > 20.1 && t < F[7]) lp.mouth = 'o';
    const kl = pulse(t, F[7] + 0.12, 0.12, 0.6, 0.7); blast(lp, kl, 0.35);
    show(librarian, 'lib', lp); blow(librarian, kl, kl);
    // the QUIET PLEASE sign tips over backward, lamp shades tip, books blast off both side walls
    lib.sign.rotation.x = -1.45 * K(t, [[F[7] + 0.15, 0], [F[7] + 0.55, 1]], (u) => u * u);
    lib.lampShades.forEach((s, i) => (s.rotation.z = (i % 2 ? 1 : -1) * 0.6 * K(t, [[F[7] + 0.05 * (i % 4), 0], [F[7] + 0.25 + 0.05 * (i % 4), 1]])));
    ripple(t, F[7], 'lib', [0.02, 0.95, z], 5.0, 0.0);
    burst(t, F[7] + 0.1, 'lib', 'book', 26, [-3.75, 1.5, -1.8], [0.1, 0.9, 1.9], [3.0, 2.0, 0.6], 1.4, 0, 21);
    burst(t, F[7] + 0.14, 'lib', 'book', 26, [3.75, 1.5, -1.8], [0.1, 0.9, 1.9], [-3.0, 2.0, 0.6], 1.4, 0, 22);
    burst(t, F[7] + 0.05, 'lib', 'paper', 10, [0, LB.tableTop + 0.05, -1.6], [1.1, 0.05, 1.2], [0, 2.2, 0.4], 1.2, 0, 23);
    jolts.push([F[7], 0.05]);
  }

  // ================================================================ 5. WEDDING (A: the vows; B: the guests)
  const YOU_WD = [-0.9, -3.7], MAID = [0.9, -3.7];
  const GUESTS = [[1.3, -1.4], [2.0, -1.4], [1.3, -0.4], [2.0, -0.4], [1.3, 0.6], [2.0, 0.6], [-1.3, -1.4], [-1.3, -0.4], [-1.3, 0.6], [1.3, 1.6]];
  const G_HATS = ['church1', 'fedora1', 'church2', 'cap1', 'fedora2', 'church3', null, null, null, null];
  function wedBeat(t, cam) {
    const k8 = K(t, [[F[8] + 0.1, 0], [F[8] + 0.4, 1]]), k9 = pulse(t, F[9], 0.1, 0.5, 0.6);
    // you, the best man
    const yp = pose({ x: YOU_WD[0], z: YOU_WD[1], rotY: 0.55, mouth: 'flat' }); yp.eyes = blink(t, 2); yp.armA = A(-0.35, 0.05, -1.2, 0.8); yp.armB = A(-0.35, 0.05, -1.2, -0.8);
    if (t > F[8] + 0.35) { yp.armB = mixArm(yp.armB, HAND_RAISE_B, K(t, [[F[8] + 0.35, 0], [F[8] + 0.65, 1], [F[9] - 0.3, 1], [F[9], 0]])); yp.mouth = t < F[9] ? 'smile' : 'flat'; yp.headRoll = -0.12; }
    if (cam === 'wedA') { show(you, 'wed', yp); blow(you, k9 * 0.5, 0); }   // in the reverse (wedB) he and the groom stand behind the lens
    const gk = (x, z) => headAt(x, z, YOU_WD[0], YOU_WD[1]);
    // the couple + officiant
    const bp = pose({ x: WD.bride[0], z: WD.bride[1], rotY: -PI / 2, mouth: 'smile' }); bp.eyes = blink(t, 4); bp.armA = A(-0.6, 0.1, -1.1, 0.6); bp.armB = A(-0.6, 0.1, -1.1, -0.6);
    const gp = pose({ x: WD.groom[0], z: WD.groom[1], rotY: PI / 2, mouth: 'smile' }); gp.eyes = blink(t, 5); gp.armA = A(-0.6, 0.1, -1.1, 0.6); gp.armB = A(-0.6, 0.1, -1.1, -0.6);
    const op = pose({ x: WD.officiant[0], z: WD.officiant[1] + 0.15, rotY: 0, mouth: 'flat' }); op.eyes = blink(t, 6); op.armA = A(-0.7, 0.1, -1.5, 0.5); op.armB = A(-0.7, 0.1, -1.5, -0.5);
    op.mouth = t < F[8] && Math.sin(t * 13) > 0 ? 'o' : 'flat'; op.headYaw = 0.12 * Math.sin(t * 0.9); op.headPitch = 0.15;
    const mp = pose({ x: MAID[0], z: MAID[1], rotY: -0.55, mouth: 'smile' }); mp.eyes = blink(t, 7); mp.armA = A(-0.5, 0.05, -1.4, 0.7); mp.armB = A(-0.5, 0.05, -1.4, -0.7);
    for (const [p, x, z, rig] of [[bp, WD.bride[0], WD.bride[1], bride], [gp, WD.groom[0], WD.groom[1], groom], [op, WD.officiant[0], WD.officiant[1], officiant], [mp, MAID[0], MAID[1], maid]]) {
      if (t > F[8]) { look(p, x, z, YOU_WD[0], YOU_WD[1], k8, 0.3); p.mouth = 'o'; }
      blast(p, pulse(t, F[9] + 0.03, 0.1, 0.5, 0.6), 0.3);
      if (!(cam === 'wedB' && (rig === officiant || rig === groom))) { show(rig, 'wed', p); blow(rig, k9, Math.max(k9, k8 * 0.5)); }
      if (rig === bride || rig === maid) rig.dress.visible = true;
    }
    // the veil: on the bride's head → off at #9, sailing over the guests
    { bride.root.updateMatrixWorld(true); const hp = bride.head.g.getWorldPosition(V3(0, 0, 0)); const a = Math.max(0, t - F[9] - 0.05);
      veil.visible = true; veil.position.set(hp.x + 0.6 * a + 0.1 * Math.sin(a * 3), hp.y + 0.13 + 1.6 * a - 0.35 * a * a, hp.z + 2.8 * a); veil.rotation.set(-0.9 * Math.min(1, a * 2) + 0.2 * Math.sin(a * 5), -PI / 2 + a * 1.5, 0.3 * Math.sin(a * 4)); }
    // guests (they face the arch, −z): turn at #8, hats fly at #9
    GUESTS.forEach(([x, z], i) => {
      const rig = pool[i], p = sitPose({ x: Math.sign(x) * (Math.abs(x) - 0.0), z: z + 0.05, rotY: PI, mouth: 'smile' }, WD.seat, 0); p.eyes = blink(t, 40 + i);
      p.armA = A(-0.5, 0.1, -0.9, 0.4); p.armB = A(-0.5, 0.1, -0.9, -0.4); p.headYaw = 0.1 * Math.sin(t * 0.7 + i);
      if (i === 3) p.armB = A(-1.1, 0.12, -2.05, -0.65);   // filming on a phone
      if (t > F[8] + 0.1) { const kk = K(t, [[F[8] + 0.1 + 0.04 * i, 0], [F[8] + 0.4 + 0.04 * i, 1]]); p.headYaw = lerp(p.headYaw, clamp(((gk(x, z) - PI + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI, -1.0, 1.0), kk); p.mouth = 'o'; }
      const kb = pulse(t, F[9] + 0.08 + 0.02 * Math.abs(z), 0.1, 0.6, 0.6); blast(p, kb, 0.32);
      show(rig, 'wed', p); blow(rig, kb, kb);
      if (G_HATS[i]) hat(HATS[G_HATS[i]], rig, t, F[9] + 0.08, [Math.sign(x) * 0.8, 2.6, 3.2 + i * 0.2], 0.01);
    });
    ripple(t, F[8], 'wed', [YOU_WD[0], 0.95, YOU_WD[1]], 1.6, 0.0, 2);
    ripple(t, F[9], 'wed', [YOU_WD[0], 0.95, YOU_WD[1]], 7.0, 0.0);
    burst(t, F[9] + 0.05, 'wed', 'petal', 80, [0, 0.03, -1.3], [0.5, 0.01, 3.2], [0.0, 3.4, 1.5], 1.6, 0.012, 31);
    jolts.push([F[8], 0.006], [F[9], 0.05]);
  }

  // ================================================================ 6. STREET: car alarms + pigeons, then the apartment windows
  const cars = [[2.8, 1.0, PI / 2, 0x3d7bd9], [17.0, 1.0, -PI / 2, 0xd2483f], [13.6, 1.0, -PI / 2, 0xf1c24a], [-2.0, 1.0, PI / 2, 0x6fa84f], [4.5, 5.85, -PI / 2, 0xf4f1ea], [10.5, 5.85, -PI / 2, 0x8f6fb8]].map(([x, z, ry, c], i) => {
    const car = makeCar(c, i + 3); car.g.position.set(x, 0, z); car.g.rotation.y = ry; street.root.add(car.g); return { ...car, x, z };
  });
  const YOU_ST = [4.85, -0.35], VEND = [5.6, -1.65];
  const PEDS = [[3.2, -1.7, 'fedora1'], [5.9, -2.2, 'cap1'], [3.9, -1.25, 'fedora2']];
  function alarmBeat(t) {
    const k = pulse(t, F[10], 0.1, 0.6, 0.6), on = t > F[10] + 0.05;
    cars.forEach((c, i) => { const bl = on ? (Math.sin((t - F[10]) * 13 + i * 1.7) > 0 ? 1 : 0.1) : 0; c.setLights(bl, bl); c.body.position.y = on ? 0.035 * Math.abs(Math.sin((t - F[10]) * 15 + i)) : 0; c.body.rotation.z = on ? 0.02 * Math.sin((t - F[10]) * 11 + i) : 0; });
    const yp = pose({ x: YOU_ST[0], z: YOU_ST[1], y: SH, floor: SH, rotY: 0.55, mouth: 'smile' }); yp.eyes = blink(t, 2); yp.armB = CUP_B; yp.armA = REST; hotdog.visible = true;
    const bite = K(t, [[29.9, 0], [30.15, 1], [30.35, 0]]); yp.armB = mixArm(CUP_B, SIP_B, bite);
    if (t > F[10]) { yp.mouth = 'flat'; yp.eyes = blink(t, 2); yp.headYaw = lerp(0, -0.6, K(t, [[F[10] + 0.7, 0], [F[10] + 1.0, 1]])) + 0.6 * K(t, [[F[10] + 1.6, 0], [F[10] + 1.9, 1]]); yp.headPitch = 0.05; }
    show(you, 'street', yp); blow(you, k * 0.4, 0);
    const vp = pose({ x: VEND[0], z: VEND[1], y: SH, floor: SH, rotY: 0, mouth: 'smile' }); vp.eyes = blink(t, 8); vp.armA = A(-0.6, 0.1, -1.0, 0.4); vp.armB = A(-0.6, 0.1, -1.0, -0.4);
    look(vp, VEND[0], VEND[1], YOU_ST[0], YOU_ST[1], 1, 0.2);
    if (t > F[10]) { vp.mouth = 'o'; vp.crouch = 0.25 * k; vp.armA = mixArm(vp.armA, UP_A, k); vp.armB = mixArm(vp.armB, UP_B, k); }
    show(vendor, 'street', vp); blow(vendor, k, k); hat(HATS.paper, vendor, t, F[10] + 0.05, [-0.5, 3.0, 1.8], SH);
    PEDS.forEach(([x, z, h], i) => {
      const walk = t < F[10] ? (t - 29.6) * 0.5 : (F[10] - 29.6) * 0.5;
      const p = pose({ x: x + (i === 1 ? -walk : 0), z, y: SH, floor: SH, rotY: i === 1 ? -PI / 2 : headAt(x, z, YOU_ST[0], YOU_ST[1]), dist: walk, speed: i === 1 && t < F[10] ? 0.5 : 0, mouth: 'flat' }); p.eyes = blink(t, 50 + i);
      if (i === 2) { p.armA = A(-0.9, 0.2, -1.3, 0.5); p.armB = A(-0.9, 0.2, -1.3, -0.5); p.headPitch = 0.3; }   // reading a paper
      if (t > F[10]) look(p, p.x, z, YOU_ST[0], YOU_ST[1], K(t, [[F[10] + 0.05, 0], [F[10] + 0.3, 1]]), 0.3);
      const kb = pulse(t, F[10] + 0.05 * i, 0.1, 0.6, 0.6); blast(p, kb, 0.35);
      show(pool[i], 'street', p); blow(pool[i], kb, kb); hat(HATS[h], pool[i], t, F[10] + 0.05 * i, [0.6 + i * 0.5, 3.2, -1.2 - 0.6 * i], SH);
    });
    // the umbrella flips inside out; pigeons burst up
    const um = street.cart.children.find((c) => c.isGroup); if (um) { const f = K(t, [[F[10] + 0.05, 0], [F[10] + 0.25, 1]]); um.scale.set(1, lerp(1, -0.9, f), 1); um.rotation.z = 0.25 * f + 0.05 * Math.sin(t * 9) * f; }
    pigeons.forEach((pg, i) => {
      const r = rng(70 + i), x0 = 5.5 + r() * 1.8, z0 = -0.15 - r() * 1.2, a = t - F[10] - 0.03 * i;
      if (a < 0) pg.set({ x: OFF.street[0] + x0, y: SH, z: z0, rotY: r() * 6, t: t + i, peck: 1 });
      else { const vx = 1.5 + r() * 2.5, vz = 1.0 + r() * 2.0, vy = 3 + r() * 2.5; pg.set({ x: OFF.street[0] + x0 + vx * a, y: SH + vy * a - 0.6 * a * a, z: z0 + vz * a, rotY: Math.atan2(vx, vz), t: t + i, flap: 1 }); }
      pg.root.visible = true; pg.root.scale.setScalar(1.1);
    });
    ripple(t, F[10], 'street', [YOU_ST[0], 1.0, YOU_ST[1]], 9, SH);
    burst(t, F[10] + 0.06, 'street', 'paper', 8, [6.9, 1.3, -0.4], [0.1, 0.05, 0.1], [1.0, 3.0, 1.5], 0.9, SH, 41);
    jolts.push([F[10], 0.06]);
  }
  // the apartment block across the street: a facade with real window openings, rooms behind, curtains, flower boxes, neighbors
  const FZ = 9.6, WIN_X = [1.0, 3.3, 5.6, 7.9], WIN_Y = [3.4, 6.0, 8.6], WW = 1.2, WH = 1.55;
  const apt = new THREE.Group(); street.root.add(apt);
  // the wall = brick boxes around the window openings (UVs scaled so the bricks keep their size)
  const brickTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d98f7a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,50,40,.2)'; for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) g.fillRect(x + 1, y + 1, 30, 14); }, [1, 1]);
  const brickM = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
  const wallBox = (x0, x1, y0, y1) => { const w = x1 - x0, h = y1 - y0, geo = new THREE.BoxGeometry(w, h, 0.25), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 1.6, uv.getY(i) * h / 1.6); mk(geo, brickM, apt, (x0 + x1) / 2, (y0 + y1) / 2, FZ + 0.125); };
  const XS = [-1.55, ...WIN_X.flatMap((x) => [x - WW / 2, x + WW / 2]), 10.45], YB = [0, ...WIN_Y.flatMap((y) => [y, y + WH]), 12];
  for (let j = 0; j < YB.length - 1; j++) {
    if (j % 2 === 0) wallBox(-1.55, 10.45, YB[j], YB[j + 1]);
    else for (let i = 0; i < XS.length - 1; i += 2) wallBox(XS[i], XS[i + 1], YB[j], YB[j + 1]);
  }
  mk(new THREE.BoxGeometry(12.2, 0.25, 0.5), mat(0xf4f1ea, 0.6), apt, 4.5, 12.1, FZ - 0.2);
  for (const y of [2.6, 5.2, 7.8]) mk(new THREE.BoxGeometry(12.0, 0.12, 0.25), mat(0xf4f1ea, 0.6), apt, 4.5, y, FZ - 0.1);
  mk(new THREE.BoxGeometry(1.4, 2.3, 0.1), mat(0x3f5f7a, 0.6), apt, 4.5, 1.15 + SH, FZ - 0.02);
  const windows = [];
  const crackTex = canvasTex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3; const r = rng(8); const cx = w * 0.55, cy = h * 0.45; for (let k = 0; k < 11; k++) { let x = cx, y = cy, a = (k / 11) * PI * 2 + r() * 0.3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * 28; y += Math.sin(a) * 28; g.lineTo(x, y); } g.stroke(); } for (const rr of [30, 62]) { g.beginPath(); for (let k = 0; k <= 12; k++) { const a = (k / 12) * PI * 2, q = rr * (0.8 + r() * 0.4); g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.stroke(); } });
  const NEIGH = [[1, 0], [2, 0], [1, 1], [2, 1], [1, 2]];
  WIN_X.forEach((x, ci) => WIN_Y.forEach((y, ri) => {
    const g = new THREE.Group(); g.position.set(x, y, FZ); apt.add(g);
    const room = new THREE.MeshStandardMaterial({ color: [0xe8d9b8, 0xc9d6e6, 0xe6c9c9, 0xd6e6c9][(ci + ri) % 4], roughness: 0.9, side: THREE.BackSide });
    mk(new THREE.BoxGeometry(WW + 0.6, WH + 0.9, 2.2), room, g, 0, WH / 2, 1.15);
    const fr = mat(0xf6f3ec, 0.5); for (const [w, h, xx, yy] of [[WW + 0.16, 0.08, 0, WH], [WW + 0.16, 0.12, 0, 0], [0.08, WH, -WW / 2, WH / 2], [0.08, WH, WW / 2, WH / 2]]) mk(new THREE.BoxGeometry(w, h, 0.12), fr, g, xx, yy, -0.02);
    mk(new THREE.BoxGeometry(WW + 0.3, 0.06, 0.3), fr, g, 0, -0.03, -0.12);
    const pane = mk(new THREE.PlaneGeometry(WW - 0.06, WH * 0.45), new THREE.MeshStandardMaterial({ color: 0x9ec4e6, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), g, 0, WH * 0.76, 0.02); pane.rotation.y = PI;
    mk(new THREE.BoxGeometry(WW, 0.05, 0.05), fr, g, 0, WH * 0.53, 0.02);
    const crack = mk(new THREE.PlaneGeometry(WW - 0.06, WH * 0.45), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), g, 0, WH * 0.76, 0.0); crack.rotation.y = PI; crack.visible = false;
    const curt = [-1, 1].map((s) => { const c = new THREE.Group(); c.position.set(s * (WW / 2 - 0.12), WH - 0.02, 0.18); g.add(c); mk(new THREE.PlaneGeometry(0.34, WH - 0.1), mat([0xf2c46b, 0xe58fa6, 0x8fb6d6, 0xf4f1ea][(ci * 3 + ri) % 4], 0.9, { side: THREE.DoubleSide }), c, 0, -(WH - 0.1) / 2, 0); return c; });
    let box = null;
    if ((ci + ri) % 2 === 0) { box = new THREE.Group(); box.position.set(0, -0.12, -0.24); g.add(box); mk(new THREE.BoxGeometry(WW - 0.1, 0.18, 0.22), mat(0x7a5236, 0.6), box, 0, 0.09, 0); for (let k = 0; k < 6; k++) mk(new THREE.SphereGeometry(0.07, 8, 6), mat([0xd2483f, 0xf2b632, 0xe58fa6][k % 3], 0.7), box, -0.45 + k * 0.18, 0.24, 0); }
    windows.push({ g, ci, ri, x, y, crack, curt, box });
  }));
  const laundry = new THREE.Group(); laundry.position.set(4.45, 7.65, FZ - 0.35); apt.add(laundry);
  mk(new THREE.CylinderGeometry(0.008, 0.008, 2.4, 4), mat(0xf4f1ea, 0.6), laundry).rotation.z = PI / 2;
  const shirts = [-0.8, -0.25, 0.3, 0.85].map((x, i) => { const s = new THREE.Group(); s.position.set(x, 0, 0); laundry.add(s); mk(new THREE.PlaneGeometry(0.42, 0.5), mat([0xd2483f, 0x3d7bd9, 0xf2b632, 0xf4f1ea][i], 0.9, { side: THREE.DoubleSide }), s, 0, -0.26, 0); return s; });
  apt.visible = false;
  const frontJunk = street.root.children.filter((o) => o.isMesh && (o.position.z > 9.85 || (o.position.z > 6.2 && Math.abs(o.position.x - 4.45) < 2.5 && o.position.y > 0.5)));
  function windowsBeat(t) {
    apt.visible = true; frontJunk.forEach((o) => (o.visible = false)); cars[4].g.visible = false;
    const k11 = pulse(t, F[11] + 0.1, 0.12, 0.7, 0.8), k12 = pulse(t, F[12] + 0.1, 0.1, 0.6, 0.6);
    const yp = pose({ x: 4.45, z: 7.7, y: SH, floor: SH, rotY: PI, mouth: 'flat' }); yp.eyes = blink(t, 2); yp.armA = REST; yp.armB = REST; yp.headPitch = -0.1;
    if (t > F[11] + 0.3) { yp.armA = SHRUG_A; yp.armB = SHRUG_B; yp.mouth = 'smile'; yp.headRoll = 0.1; }
    if (t > F[12]) { yp.armA = mixArm(SHRUG_A, A(-1.25, -0.05, -2.4, 0.7), K(t, [[F[12] + 0.3, 0], [F[12] + 0.55, 1]])); yp.mouth = 'o'; }
    show(you, 'street', yp); blow(you, k12 * 0.4, 0);
    windows.forEach((w) => {
      const kk = Math.max(k11, k12);
      w.curt.forEach((c, i) => { c.rotation.x = 0.9 * kk + 0.04 * Math.sin(t * 2 + w.x + i); c.rotation.z = (i ? 1 : -1) * 0.25 * kk; });
      w.crack.visible = t > F[12] + 0.08 + 0.02 * (w.ci + w.ri);
      if (w.box) { w.box.position.y = -0.12 + 0.12 * K(t, [[F[11] + 0.1, 0], [F[11] + 0.2, 1], [F[11] + 0.4, 0]]) + 0.1 * K(t, [[F[12] + 0.1, 0], [F[12] + 0.2, 1], [F[12] + 0.4, 0]]); w.box.rotation.z = 0.1 * k12 * (w.ci % 2 ? 1 : -1); }
    });
    shirts.forEach((s, i) => { s.rotation.x = 1.1 * Math.max(k11, k12) + 0.15 * Math.sin(t * 3 + i); s.rotation.y = 0.3 * Math.sin(t * 7 + i) * Math.max(k11, k12); });
    NEIGH.forEach(([ci, ri], i) => {
      const x = WIN_X[ci], y = WIN_Y[ri], rig = pool[i];
      const p = pose({ x: x + 0.05 * Math.sin(i), z: FZ + 0.3, y: y - 0.95, floor: y - 0.95, rotY: PI, lean: 0.5, mouth: 'flat' }); p.eyes = blink(t, 60 + i);
      p.armA = SILL_A; p.armB = SILL_B; p.headPitch = 0.35; p.headYaw = 0.12 * Math.sin(t * 0.8 + i);
      if (i === 3 || i === 6) p.armB = A(-1.15, 0.12, -2.05, -0.65);   // filming
      if (t > F[11]) { p.headPitch = 0.45; p.mouth = 'o'; }
      const kb = Math.max(k11 * 0.8, k12); blast(p, kb, 0.15); p.lean = lerp(0.5, 0.05, kb);
      if (t > F[12] + 0.6) { p.lean = 0.12; p.crouch = 0.15; p.armA = A(-2.4, 0.5, -1.5, 0.4); p.armB = A(-2.4, 0.5, -1.5, -0.4); p.mouth = 'o'; }   // ducking, hands on the head
      show(rig, 'street', p); blow(rig, kb, Math.max(kb, t > F[11] ? 0.5 : 0));
    });
    ripple(t, F[11], 'street', [4.45, 1.0, 7.7], 16, null);
    ripple(t, F[12], 'street', [4.45, 1.0, 7.7], 22, null);
    burst(t, F[12] + 0.15, 'street', 'shard', 28, [4.45, 6.0, FZ - 0.1], [3.6, 2.6, 0.05], [0, 0.3, -0.6], 0.5, SH, 51);
    jolts.push([F[11], 0.04], [F[12], 0.07]);
  }

  // ================================================================ 7. QUAKE LAB (seismograph)
  const D = QL.drum, OMEGA = 0.55;
  /** ground motion at the lab (pen deflection, m along the drum axis): quiet noise + a ringing burst per fart (×2^(n−12)) */
  function trace(tau) {
    let a = 0.004 * Math.sin(tau * 23) + 0.003 * Math.sin(tau * 37 + 1) + 0.002 * Math.sin(tau * 61 + 2);
    for (const [tb, n] of FARTS) { if (tau < tb || n < 10) continue; const e = tau - tb; a += 0.06 * 2 ** (n - 12) * Math.exp(-e * 2.2) * Math.sin(e * 42) * Math.min(1, e * 20); }
    return a;
  }
  function drawPaper(t) {
    const { ctx: g, w, h, tex } = lab.paper;
    g.fillStyle = '#f6f1e2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,110,160,.25)'; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = '#c8302c'; g.lineWidth = 2.5; g.beginPath(); let first = true, prevX = null;
    for (let tau = Math.max(30, t - 9.5); tau <= t; tau += 1 / 240) {
      const u = (((0.25 + (OMEGA * tau) / (2 * PI)) % 1) + 1) % 1, X = u * w, x = penX(tau), Y = ((x - D.x) / D.len + 0.5) * h;
      if (first || (prevX !== null && Math.abs(X - prevX) > w / 2)) { g.moveTo(X, Y); first = false; } else g.lineTo(X, Y);
      prevX = X;
    }
    g.stroke(); tex.needsUpdate = true;
  }
  /** pen tip position along the drum axis (clamped by the arm's stop: beyond ±0.36 m it's off the paper) */
  const penPsi = (tau) => clamp(Math.asin(clamp(trace(tau) / 0.42, -1, 1)) * 1.0, -0.95, 0.95);
  const penX = (tau) => D.x + 0.1 + 0.42 * Math.sin(penPsi(tau));
  function drawScreens(t) {
    const [s0, s1, s2] = lab.screens, off = t > F[14] + 0.2;
    { const { ctx: g, w, h, tex } = s0; g.fillStyle = '#0b1a14'; g.fillRect(0, 0, w, h); g.strokeStyle = off ? '#ff5a3a' : '#5aff9a'; g.lineWidth = 3; g.beginPath();
      for (let x = 0; x < w; x += 2) { const tau = t - (w - x) / w * 4, y = h / 2 - clamp(trace(tau) * 900, -h * 0.6, h * 0.6); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.fillStyle = off ? '#ff5a3a' : '#5aff9a'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.fillText(off ? 'OFF SCALE' : t > F[13] ? 'EVENT DETECTED' : 'STATION 4 · LIVE', 18, 44); tex.needsUpdate = true; }
    { const { ctx: g, w, h, tex } = s1; g.fillStyle = '#10213a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8f0ff'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillText('EVENT LOG', 18, 42); g.font = '26px Helvetica, Arial, sans-serif';
      const rows = [['07:00', 'M 0.0'], ['09:00', 'M 0.4'], ['12:00', 'M 1.1'], ['13:00', 'M 1.9']]; if (t > F[13]) rows.push(['14:00', 'M 3.2']); if (t > F[14]) rows.push(['14:01', 'M ???']);
      rows.slice(-6).forEach(([a, b], i) => { g.fillStyle = i === rows.length - 1 && t > F[13] ? '#ffcf5a' : '#c8d6f0'; g.fillText(`${a}   ${b}`, 24, 88 + i * 36); }); tex.needsUpdate = true; }
    { const { ctx: g, w, h, tex } = s2; g.fillStyle = '#1d3550'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < w; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = '#9ac48a'; g.fillRect(60, 50, 190, 170); g.fillRect(300, 90, 160, 150);
      const pr = 10 + 22 * ((t * 1.5) % 1); g.strokeStyle = '#ff6a3a'; g.lineWidth = 4; g.beginPath(); g.arc(200, 140, pr, 0, 7); g.stroke(); g.fillStyle = '#ff6a3a'; g.beginPath(); g.arc(200, 140, 9, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 28px Helvetica, Arial, sans-serif'; g.fillText(t > F[13] ? 'EPICENTER: ONE GUY' : 'EPICENTER: —', 18, 270); tex.needsUpdate = true; }
  }
  function labBeat(t) {
    lab.drum.rotation.x = OMEGA * t; lab.pen.rotation.y = penPsi(t);
    if (Math.abs(trace(t)) > 0.4) lab.pen.rotation.y = Math.sign(trace(t)) * 0.95 + 0.1 * Math.sin(t * 40);
    drawPaper(t); drawScreens(t);
    const k13 = K(t, [[F[13] + 0.1, 0], [F[13] + 0.4, 1]]), k14 = pulse(t, F[14] + 0.05, 0.12, 0.6, 0.7);
    const roll = K(t, [[F[14] + 0.1, 0], [F[14] + 0.7, 1]], (u) => 1 - (1 - u) ** 2);
    QL.seats.forEach(([x, z], i) => {
      const rig = sci[i], cz = z - 0.65 * roll; lab.chairs[i].position.set(x + (i ? 0.15 : -0.15) * roll, 0, cz); lab.chairs[i].rotation.y = (i ? 1 : -1) * 0.8 * roll;
      const p = sitPose({ x: x + (i ? 0.15 : -0.15) * roll, z: cz + 0.08, rotY: (i ? 1 : -1) * 0.8 * roll, mouth: 'flat' }, QL.seat, 0); p.eyes = blink(t, 70 + i);
      p.armA = i ? CUP_A : A(-0.6, 0.1, -1.1, 0.4); p.armB = i ? A(-0.6, 0.1, -1.1, -0.4) : CUP_B; p.headPitch = 0.2; p.headYaw = (i ? -0.2 : 0.2) + 0.1 * Math.sin(t * 0.8 + i);
      const sip = K(t, [[38.0 + i * 0.7, 0], [38.25 + i * 0.7, 1], [38.4 + i * 0.7, 0]]); if (i) p.armA = mixArm(CUP_A, SIP_A, sip); else p.armB = mixArm(CUP_B, SIP_B, sip);
      if (t > F[13]) { p.lean = 0.35 * k13 * (1 - roll); p.headPitch = lerp(0.2, 0.55, k13); p.headYaw = 0; p.mouth = 'o'; if (i === 0) p.armA = mixArm(p.armA, POINT_B, k13); }
      blast(p, k14, 0.3);
      if (t > F[14] + 1.0) { const kk = K(t, [[F[14] + 1.0, 0], [F[14] + 1.25, 1]]); p.headYaw = (i ? 1 : -1) * 0.9 * kk; p.mouth = 'o'; }   // they look at each other
      show(rig, 'lab', p); blow(rig, k14, Math.max(k14, k13 * 0.6));
      cups[i].visible = true;
    });
    lab.mugs.forEach((m, i) => { const h = 0.06 * K(t, [[F[13] + 0.03 * i, 0], [F[13] + 0.1, 1], [F[13] + 0.22, 0]]) + 0.1 * K(t, [[F[14] + 0.03 * i, 0], [F[14] + 0.12, 1], [F[14] + 0.3, 0]]); m.position.y = QL.tableY + h; m.position.x = (i ? 0.62 : -0.6) + (i ? 0.25 : -0.25) * K(t, [[F[14], 0], [F[14] + 0.4, 1]]); m.rotation.z = 0.5 * h; });
    lab.lamp.rotation.z = t > F[14] ? 0.3 * Math.exp(-(t - F[14]) * 0.8) * Math.sin((t - F[14]) * 4.2) : 0.01 * Math.sin(t);
    ripple(t, F[13], 'lab', [0, 1.4, 1.6], 2.5, null, 2);
    ripple(t, F[14], 'lab', [0, 1.4, 1.6], 7.0, 0.0);
    burst(t, F[14] + 0.05, 'lab', 'paper', 12, [-0.4, QL.tableY + 0.05, 0.55], [0.15, 0.02, 0.1], [0.0, 2.4, -1.4], 1.0, 0, 61);
    jolts.push([F[13], 0.012], [F[14], 0.045]);
  }

  // ================================================================ 8. STADIUM
  const east = stad.stands.east, X0 = FB.goalX + FB.gap;
  const rowX = (r) => X0 + FB.rowD(r) + 0.02, rowY = (r) => FB.rowY(r);
  const YOU_SD = [3, 0];
  const FANS = [[3, -0.66], [3, 0.66], [4, -0.33], [4, 0.33], [2, -0.98], [2, 0.98], [4, 1.0], [3, -1.32]];
  const FAN_HATS = ['cap2', 'beanie', 'cap3', 'beanie2', null, null, null, null];
  east.hide((f) => (f.row >= 1 && f.row <= 6 && Math.abs(f.z) < 2.2) || (f.row <= 1 && Math.abs(f.z) < 5));
  const youX = rowX(YOU_SD[0]), youY = rowY(YOU_SD[0]);
  function fanWave(t) {
    const cheer = t < F[15], frozen = t >= F[15];
    for (let i = 0; i < east.fans.length; i++) {
      if (east.hidden.has(i)) continue;
      const f = east.fans[i], d = Math.hypot(f.x - youX, (f.y - youY) * 0.6, f.z);
      let dy = cheer ? 0.07 * Math.max(0, Math.sin(t * 8 + i * 1.3)) : 0, tilt = 0, ry = null;
      if (frozen && d < 30) ry = PI + clamp(Math.atan2(f.z, f.x - youX) * 0.6, -0.9, 0.9) * K(t, [[F[15] + d * 0.02, 0], [F[15] + 0.4 + d * 0.02, 1]]);
      for (const n of [16, 17]) { const ta = F[n] + d / (n === 16 ? 45 : 70); tilt += -(n === 16 ? 0.35 : 0.5) * K(t, [[ta, 0], [ta + 0.12, 1], [ta + 0.6, 0.15]]); }
      east.setFan(i, dy, tilt, ry);
    }
    east.commit();
  }
  function standBeat(t, cam) {
    stad.aimSun(cam === 'standA' ? 60 : 55, 0, cam === 'standA' ? 12 : 40);
    fanWave(t);
    const k16 = pulse(t, F[16] + 0.04, 0.1, 0.6, 0.7), k17 = pulse(t, F[17] + 0.04, 0.1, 0.6, 0.7);
    const yp = pose({ x: youX, z: YOU_SD[1], y: youY, floor: youY, rotY: -PI / 2, mouth: 'o' }); yp.eyes = blink(t, 2);
    const jump = t < F[15] ? 0.08 * Math.max(0, Math.sin(t * 8)) : 0; yp.y += jump; yp.floor += jump;
    yp.armA = t < F[15] ? UP_A : REST; yp.armB = t < F[15] ? UP_B : REST;
    if (t > F[15]) { yp.mouth = 'flat'; yp.headYaw = 0.3 * Math.sin((t - F[15]) * 2.5) * K(t, [[F[15] + 0.3, 0], [F[15] + 0.6, 1]]); yp.armA = mixArm(REST, SHRUG_A, K(t, [[44.6, 0], [44.9, 1]])); yp.armB = mixArm(REST, SHRUG_B, K(t, [[44.6, 0], [44.9, 1]])); }
    if (t > F[16]) { yp.armA = REST; yp.armB = A(-1.6, 0.2, -0.25, -0.2); yp.mouth = 'smile'; }   // a thumbs-up into the silence
    show(you, 'stad', yp); blow(you, Math.max(k16, k17) * 0.4, 0); recolor(you, 0xc8302c);
    FANS.forEach(([r, z], i) => {
      const rig = pool[i], x = rowX(r), y = rowY(r), ph = i * 1.7;
      const p = pose({ x, z, y, floor: y, rotY: -PI / 2, mouth: Math.sin(t * 5 + ph) > 0 ? 'o' : 'smile' }); p.eyes = blink(t, 80 + i);
      const j = t < F[15] ? 0.08 * Math.max(0, Math.sin(t * 8 + ph)) : 0; p.y += j; p.floor += j;
      p.armA = t < F[15] ? (i % 2 ? UP_A : A(-1.6, 0.4, -0.8, 0.3)) : REST; p.armB = t < F[15] ? UP_B : REST;
      if (i === 1) { foam.visible = true; }
      if (t > F[15]) { const k = K(t, [[F[15] + 0.05 * i, 0], [F[15] + 0.35 + 0.05 * i, 1]]); p.mouth = 'flat'; look(p, x, z, youX, YOU_SD[1], k, 0.25); p.headPitch = (r < 3 ? -0.2 : r > 3 ? 0.25 : 0) * k; }
      const kb = Math.max(pulse(t, F[16] + 0.03 * i, 0.1, 0.6, 0.6), k17); blast(p, kb, 0.3);
      show(rig, 'stad', p); blow(rig, kb, Math.max(kb, t > F[15] ? 0.45 : 0));
      if (FAN_HATS[i]) hat(HATS[FAN_HATS[i]], rig, t, F[16] + 0.04, [1.5 + 0.4 * i, 3.2, (z > 0 ? 1 : -1) * 1.2], -50);
      rig.mats.top.color.setHex(i % 3 === 2 ? 0xf2f2f2 : 0xc8302c);
    });
    // the foam finger: held up, then gone
    { const rig = pool[1]; rig.root.updateMatrixWorld(true); const hw = handOf(rig, 1).getWorldPosition(V3(0, 0, 0)); const a = Math.max(0, t - F[16] - 0.05); foam.position.set(hw.x + 2.2 * a, hw.y + 0.1 + 3 * a - 2.5 * a * a, hw.z + 0.6 * a); foam.rotation.set(a * 6, -PI / 2, a * 3); }
    burst(t, F[16] + 0.05, 'stad', 'pop', 60, [youX + 0.6, youY + 1.2, 0], [1.6, 0.4, 1.6], [1.5, 3.6, 0], 1.4, -50, 71);
    if (cam === 'standB') {
      // the ref is blown off his feet; the net bulges as the shockwave passes
      const k = clamp((t - F[17] - 0.12) / 0.7), rp = pose({ x: 49.0, z: 6.5, rotY: 2.4, mouth: 'flat' }); rp.eyes = blink(t, 90); rp.armA = REST; rp.armB = A(-1.3, 0.2, -0.6, -0.3);
      if (k > 0) showC(ref, 'stad', { ...rp, armA: BACK_A, armB: BACK_B, mouth: 'o' }, [49.0 - 3.5 * k, HC + 1.3 * Math.sin(k * PI), 6.5 + 2.2 * k], 2.4, -1.2 * k);
      else show(ref, 'stad', rp);
      blow(ref, k > 0 ? 1 : 0, k > 0 ? 1 : 0);
      stad.setBulge(0.9 * K(t, [[F[17] + 0.1, 0], [F[17] + 0.22, 1], [F[17] + 0.9, 0.2]]), 1.2, 0);
    } else stad.setBulge(0);
    ripple(t, F[15], 'stad', [youX, youY + 1.0, YOU_SD[1]], 6, null, 2);
    ripple(t, F[16], 'stad', [youX, youY + 1.0, YOU_SD[1]], 22, null);
    ripple(t, F[17], 'stad', [youX, youY + 1.0, YOU_SD[1]], 70, null);
    jolts.push([F[15], 0.01], [F[16], 0.07], [F[17], 0.18]);
  }

  // ================================================================ 9. ORBIT: the shockwave ring across the planet
  const ER = space.R ?? 400, SRC = V3(0.55, 0.5, 0.67).normalize();
  const ringM = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const gRings = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 160), ringM.clone()); m.visible = false; m.frustumCulled = false; space.root.add(m); return m; });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(190,230,255,.6)'); g.addColorStop(1, 'rgba(190,230,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  flash.visible = false; space.root.add(flash);
  const _q = new THREE.Quaternion();
  function orbitBeat(t) {
    space.spin.rotation.y = 0.6 + 0.01 * t;
    const dir = V3(0.42, 0.42, 0.8).normalize(), dist = 1180 - 60 * K(t, [[48.8, 0], [51.8, 1]], (u) => u);
    const P = dir.clone().multiplyScalar(dist).add(V3(...OFF.space)), Aim = SRC.clone().multiplyScalar(ER * 0.4).add(V3(...OFF.space));
    _q.setFromUnitVectors(V3(0, 0, 1), SRC);
    const ringAt = (m, alpha, op) => { m.visible = op > 0.01; m.quaternion.copy(_q); m.position.copy(SRC).multiplyScalar(ER * Math.cos(alpha) * 1.004); const r = ER * Math.sin(alpha) * 1.004; m.scale.set(r, r, r); m.material.opacity = op; };
    const a18 = t - F[18], a19 = t - F[19];
    ringAt(gRings[0], 0.03 + 0.22 * clamp(a18 / 1.2) ** 0.6, a18 > 0 ? 0.9 * (1 - clamp(a18 / 1.6)) : 0);
    ringAt(gRings[1], 0.02 + 1.25 * clamp(a19 / 1.0) ** 0.7, a19 > 0 ? 0.95 * (1 - clamp((a19 - 0.6) / 0.6)) : 0);
    ringAt(gRings[2], 0.02 + 1.0 * clamp((a19 - 0.12) / 1.0) ** 0.7, a19 > 0.12 ? 0.6 * (1 - clamp((a19 - 0.6) / 0.6)) : 0);
    ringAt(gRings[3], 0.02 + 0.7 * clamp((a19 - 0.25) / 1.0) ** 0.7, a19 > 0.25 ? 0.4 * (1 - clamp((a19 - 0.6) / 0.6)) : 0);
    const fk = Math.max(a18 > 0 ? Math.exp(-a18 * 3) : 0, a19 > 0 ? Math.exp(-a19 * 2.2) * 1.6 : 0);
    flash.visible = fk > 0.01; flash.position.copy(SRC).multiplyScalar(ER * 1.01); flash.scale.setScalar(60 + 200 * fk); flash.material.opacity = Math.min(1, fk);
    jolts.push([F[18], 2.0], [F[19], 6.0]);
    return [P.toArray(), Aim.toArray()];
  }

  // ================================================================ 10. DINNER AT GRANDMA'S
  const [DX, DZ] = LR.dining, DT = LR.diningTop, DSEAT = 0.5;
  const SEAT = { you: [DX - 0.4, DZ - 0.65, 0], gma: [DX + 0.4, DZ - 0.65, 0], mom: [DX - 1.0, DZ, PI / 2], kid: [DX + 1.0, DZ, -PI / 2] };
  const dinner = new THREE.Group(); dine.root.add(dinner);
  { const plate = (x, z) => { mk(new THREE.CylinderGeometry(0.13, 0.11, 0.015, 24), mat(0xfbfaf6, 0.4), dinner, x, DT + 0.008, z); mk(new THREE.SphereGeometry(0.05, 10, 6), mat(0xe8c87a, 0.8), dinner, x - 0.03, DT + 0.02, z).scale.set(1, 0.4, 1); mk(new THREE.SphereGeometry(0.03, 8, 6), mat(0x6fa84f, 0.8), dinner, x + 0.05, DT + 0.02, z + 0.02).scale.set(1.4, 0.5, 1); };
    plate(DX - 0.4, DZ - 0.25); plate(DX + 0.4, DZ - 0.25); plate(DX - 0.62, DZ + 0.05); plate(DX + 0.62, DZ + 0.05);
    mk(new THREE.CylinderGeometry(0.24, 0.2, 0.025, 28), mat(0xf4f1ea, 0.4), dinner, DX, DT + 0.013, DZ + 0.05);
  }
  const chicken = new THREE.Group(); chicken.position.set(DX, DT + 0.03, DZ + 0.05); dinner.add(chicken);
  mk(new THREE.SphereGeometry(0.13, 16, 12), mat(0xb8743a, 0.55), chicken, 0, 0.08, 0).scale.set(1.25, 0.8, 1);
  for (const s of [-1, 1]) { const l = mk(new THREE.CapsuleGeometry(0.035, 0.08, 4, 8), mat(0xb8743a, 0.55), chicken, s * 0.07, 0.08, 0.13); l.rotation.x = 1.0; mk(new THREE.SphereGeometry(0.02, 8, 6), mat(0xfbfaf6, 0.6), chicken, s * 0.07, 0.11, 0.2); }
  const bowl = mk(new THREE.SphereGeometry(0.1, 16, 8, 0, PI * 2, PI / 2, PI / 2), mat(0x58b3a8, 0.4, { side: THREE.DoubleSide }), dinner, DX - 0.42, DT + 0.1, DZ + 0.22); bowl.rotation.x = PI;
  mk(new THREE.SphereGeometry(0.085, 14, 8), mat(0xf6efdc, 0.8), dinner, DX - 0.42, DT + 0.06, DZ + 0.22).scale.set(1, 0.55, 1);
  const pie = mk(new THREE.CylinderGeometry(0.12, 0.11, 0.05, 24), mat(0xd9a05b, 0.7), dinner, DX + 0.45, DT + 0.025, DZ + 0.22); void pie;
  const candles = [-0.2, 0.2].map((dx) => { const c = new THREE.Group(); c.position.set(DX + dx, DT, DZ - 0.12); dinner.add(c); mk(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), mat(0xc9a25a, 0.3, { metalness: 0.7 }), c, 0, 0.015, 0); mk(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 10), mat(0xf6efe0, 0.6), c, 0, 0.15, 0);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 40, 1, 32, 36, 30); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.35, 'rgba(255,190,90,.8)'); gr.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    fl.position.set(0, 0.31, 0); fl.scale.set(0.05, 0.08, 1); c.add(fl); return { c, fl }; });
  const candleLight = new THREE.PointLight(0xffb070, 0.9, 3, 1.5); candleLight.position.set(DX, DT + 0.45, DZ - 0.05); dinner.add(candleLight);
  const dinCups = [[DX - 0.2, DZ - 0.32], [DX + 0.62, DZ - 0.12]].map(([x, z]) => mk(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 12), new THREE.MeshStandardMaterial({ color: 0xcfe6f6, roughness: 0.05, transparent: true, opacity: 0.5 }), dinner, x, DT + 0.055, z));
  dinner.visible = false;
  const dPose = (who, o) => { const [x, z, ry] = SEAT[who]; return sitPose({ x, z: z + (ry ? 0 : 0.06), rotY: ry, mouth: 'flat', ...o }, DSEAT, 0); };
  function dinBeat(t, cam) {
    dinner.visible = true;
    const g = GRANDMA, kg = pulse(t, g + 0.05, 0.1, 0.7, 0.8), out = t > g + 0.12;
    candles.forEach(({ fl }, i) => { fl.visible = !out; fl.scale.set(0.05 + 0.005 * Math.sin(t * 17 + i), 0.08 + 0.01 * Math.sin(t * 23 + i), 1); });
    candleLight.intensity = out ? 0 : 0.9 + 0.1 * Math.sin(t * 19);
    for (let k = 0; k < 2; k++) impact(t, g + 0.15, 'dine', [DX + (k ? 0.2 : -0.2), DT + 0.34, DZ - 0.12], 0.25, false);
    chicken.position.y = DT + 0.03 + 0.12 * K(t, [[g + 0.05, 0], [g + 0.18, 1], [g + 0.42, 0]]); chicken.rotation.z = 0.3 * K(t, [[g + 0.05, 0], [g + 0.2, 1], [g + 0.5, 0]]);
    if (pendShade) { const sw = t > g ? 0.25 * Math.exp(-(t - g) * 0.6) * Math.sin((t - g) * 3.4) : 0; pendShade.position.set(PEND0.x + 0.8 * Math.sin(sw), PEND0.y + 0.8 * (1 - Math.cos(sw)), PEND0.z); if (pendCord) pendCord.rotation.z = sw; dine.lights.pend.position.x = pendShade.position.x; }
    // you: holding it in → blasted → awe → the fist bump → laughing
    const yp = dPose('you', {}); yp.eyes = blink(t, 2);
    yp.armA = FORK_B(t, 0); yp.armA.twist = 0.5; yp.armB = A(-0.6, 0.1, -1.1, -0.4);
    if (t > 52.6 && t < g) { const s = K(t, [[52.6, 0], [53.0, 1]]); yp.armA = mixArm(yp.armA, A(-0.5, 0.15, -1.0, 0.5), s); yp.lean = 0.18 * s + 0.03 * Math.sin(t * 9); yp.rotY = 0.06 * Math.sin(t * 5); yp.eyes = Math.sin(t * 2.3) > 0.4 ? 'closed' : 'open'; yp.headPitch = 0.12; yp.tear = t > 53.6; you.head.brows.forEach((b, i) => (b.rotation.z = you.browRZ[i] - (i ? 1 : -1) * 0.35)); }
    blast(yp, kg, 0.35);
    if (t > g + 0.9) { yp.headYaw = 0.75 * K(t, [[g + 0.9, 0], [g + 1.2, 1]]); yp.mouth = 'o'; yp.eyes = blink(t, 2); }
    if (t > 58.4) { yp.mouth = 'smile'; }
    const bumpK = K(t, [[58.9, 0], [59.35, 1], [59.9, 1], [60.25, 0]]);
    if (t > 58.9) yp.armB = mixArm(yp.armB, BUMP, bumpK);
    if (t > 60.0) { yp.mouth = Math.sin(t * 11) > -0.3 ? 'o' : 'smile'; yp.headPitch = -0.15 + 0.08 * Math.sin(t * 11); yp.eyes = 'closed'; yp.headYaw = 0.25; }
    show(you, 'dine', yp); blow(you, kg, kg); recolor(you, 0xc96f4a);
    // grandma: tea, serene — then she lets one go and doesn't flinch; sets the cup down; offers a fist
    const gp = dPose('gma', {}); gp.eyes = blink(t, 9); gp.mouth = 'smile'; gp.armB = CUP_B; gp.armA = A(-0.5, 0.15, -1.0, 0.5); gp.headYaw = -0.15;
    const sip = Math.max(K(t, [[53.0, 0], [53.3, 1], [53.8, 1], [54.1, 0]]), K(t, [[g + 0.3, 0], [g + 0.6, 1], [g + 1.4, 1], [g + 1.7, 0]]));
    gp.armB = mixArm(CUP_B, SIP_B, sip); tea.visible = true;
    if (t > g - 0.4 && t < g + 1.8) gp.eyes = 'closed';
    if (t > 57.6) { const k = K(t, [[57.6, 0], [58.0, 1]]); gp.headYaw = lerp(-0.15, -0.85, k); gp.armB = mixArm(gp.armB, A(-0.3, 0.12, -0.9, -0.4), k); }
    if (t > 58.6) gp.armA = mixArm(gp.armA, BUMP, Math.max(K(t, [[58.6, 0], [59.0, 1]]) * (1 - K(t, [[59.9, 0], [60.25, 1]])), 0));
    if (t > 60.0) { gp.mouth = Math.sin(t * 9 + 1) > -0.2 ? 'o' : 'smile'; gp.headPitch = -0.1 + 0.06 * Math.sin(t * 9); gp.eyes = 'closed'; }
    show(grandma, 'dine', gp);
    // mom + kid: eating → blasted back in their chairs (chairs slide) → laughing
    for (const [who, rig, ph] of [['mom', mom, 0.5], ['kid', kid, 1.3]]) {
      const p = dPose(who, {}); p.eyes = blink(t, who === 'mom' ? 11 : 12); p.armB = FORK_B(t, ph); p.armA = A(-0.6, 0.1, -1.0, 0.4); p.mouth = Math.sin(t * 2 + ph) > 0.6 ? 'o' : 'smile';
      p.headYaw = 0.25 * Math.sin(t * 0.7 + ph);
      const kb = pulse(t, g + 0.06, 0.1, 0.8, 0.8), slide = 0.35 * K(t, [[g + 0.06, 0], [g + 0.35, 1]]);
      blast(p, kb, 0.4); const [, , ry] = SEAT[who]; p.x -= Math.sin(ry) * slide;
      if (t > g + 1.0) { look(p, p.x, p.z, SEAT.gma[0], SEAT.gma[1], K(t, [[g + 1.0, 0], [g + 1.3, 1]]), 0.1); p.mouth = 'o'; }
      if (t > 60.0) { p.mouth = Math.sin(t * 10 + ph) > -0.3 ? 'o' : 'smile'; p.headPitch = -0.15 + 0.07 * Math.sin(t * 10 + ph); p.eyes = 'closed'; }
      if (rig === kid) { p.y = 0; p.floor = 0.42; p.footFwd = 0.42; show(rig, 'dine', p, { s: 0.68 }); rig.root.position.y = OFF.dine[1] + DSEAT - 0.68 * (HIP_H - 0.07); }
      else show(rig, 'dine', p);
      blow(rig, kb, kb);
      dine.diningChairs[who === 'mom' ? 0 : 3].position.x = SEAT[who][0] - Math.sin(ry) * (slide + 0.2);
    }
    dine.diningChairs[1].position.set(SEAT.you[0], 0, SEAT.you[1] - 0.06);
    dine.diningChairs[2].position.set(SEAT.gma[0], 0, SEAT.gma[1] - 0.06);
    ripple(t, g, 'dine', [SEAT.gma[0], 0.75, SEAT.gma[1]], 5.5, 0.0);
    burst(t, g + 0.05, 'dine', 'paper', 8, [DX, DT + 0.05, DZ], [0.6, 0.02, 0.3], [0, 2.4, 0.8], 1.1, 0, 81);
    impact(t, 59.35, 'dine', [DX, 1.02, DZ - 0.5], 0.22, true);
    jolts.push([g, 0.05]);
  }

  // ---------------------------------------------------------------- per-frame
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (cur !== S) {
      Object.entries(ROOTS).forEach(([k, r]) => (r.visible = k === S));
      scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.5 : S === 'stad' ? 0.1 : 0.05; studio.camera.updateProjectionMatrix();
      cur = S;
    }
    all.forEach((r) => { r.root.visible = false; resetFace(r); r.root.scale.setScalar(1); });
    pool.forEach((p, i) => p.mats.top.color.setHex(POOL_TOPS[i]));
    recolor(you, cam === 'bed' ? 0x9cc0e6 : cam.startsWith('wed') ? 0x2f3a4a : 0x3f8f7a, cam === 'bed' ? 0x9cc0e6 : 0x2f3a4a);
    pool[0].head.hair.rotation.set(0, 0, 0);
    Object.values(HATS).forEach((h) => (h.visible = false));
    [dog.g, veil, foam, book, hotdog, tea, folder, phone, eCup, apt, dinner].forEach((o) => (o.visible = false));
    frontJunk.forEach((o) => (o.visible = true)); cars[4].g.visible = true; street.trash.visible = true;
    cups.forEach((c) => (c.visible = false)); readerBooks.forEach((b) => (b.visible = false));
    pigeons.forEach((p) => (p.root.visible = false));
    rings.forEach((s) => (s.visible = false)); floorRings.forEach((m) => (m.visible = false)); gRings.forEach((m) => (m.visible = false)); flash.visible = false;
    stars.forEach((s) => (s.visible = false)); puffs.hide(); starN = 0; puffN = 0; ringN = 0; fringN = 0; jolts.length = 0;
    Object.keys(DEB).forEach((k) => { DEB[k].forEach((m) => (m.visible = false)); used[k] = 0; });
    const o = OFF[S];
    let P, Aim, fov = CAMS[cam].fov;
    if (CAMS[cam].keys.length) { const [p0, a0] = camAt(CAMS[cam], t); P = p0.map((v, i) => v + o[i]); Aim = a0.map((v, i) => v + o[i]); }
    camPos.set(...(P || [0, 0, 0]));

    if (cam === 'bed') bedBeat(t);
    else if (cam === 'elev') elevBeat(t);
    else if (cam === 'office') officeBeat(t);
    else if (cam === 'lib') libBeat(t);
    else if (cam === 'wedA' || cam === 'wedB') wedBeat(t, cam);
    else if (cam === 'alarm') { street.aimSun(5.5, -0.5, 9); street.trash.visible = false; alarmBeat(t); }
    else if (cam === 'windows') { street.aimSun(4.5, 8.0, 10); windowsBeat(t); }
    else if (cam === 'lab') labBeat(t);
    else if (cam === 'standA' || cam === 'standB') standBeat(t, cam);
    else if (cam === 'orbit') { const [p, a] = orbitBeat(t); P = p; Aim = a; }
    else if (cam === 'dinA' || cam === 'dinB') dinBeat(t, cam);

    // camera (+ impact jolts)
    for (const [m, k0] of jolts) if (t > m && t < m + 0.6) { const k = k0 * Math.exp(-(t - m) * 7); P = [P[0] + k * Math.sin(t * 70 + m), P[1] + k * Math.sin(t * 55 + m), P[2] + k * 0.5 * Math.sin(t * 63)]; }
    studio.setCamera(P, Aim, fov, t, cam === 'orbit' ? 0 : cam === 'standB' ? 0.03 : 0.006);
    if (story.debugView) story.debugView = { center: [Aim[0], 0, Aim[2]], height: cam === 'orbit' ? 3000 : cam.startsWith('stand') ? 30 : 9 };
  }
  return { update };
}
