// VIDEO 019 — "What if everyone on Earth couldn't stop dancing?"  (tone: MONTAGE, unhinged lane, @ed._.studios)
// At 2:14 PM on a Tuesday every human starts dancing to the same 120-BPM beat and can't stop. Every beat = a new place +
// one escalating dance gag that ends in something big and physical + one real, sourced number in the HUD stat line.
// 71.5 s, 11 beats, ELEVEN sets parked at offsets in one scene (one visible per shot; city.js stays at the origin).
// NEW sets: engine/sets/library.js, surgery.js (operating room), cemetery.js (funeral), stadium.js (concert bowl, 16k fans).
// Dance language: one global beat clock (BEAT = 0.5 s from M1), a library of readable moves (disco point, robot, YMCA,
// jump with arms up, twist, shimmy, sprinkler, body roll, conga kick, coffin bounce, slow dance, moonwalk, the worm), every
// crowd in sync with a tiny per-person lag. Gold ♪ notes pop above every head at the premise moment.
//
// Sources (checked Oct 26 2026):
//   Strasbourg dancing plague, July–Sept 1518: estimates range 50–400; one chronicler says ~400 by the end of August — John
//     Waller (Michigan State), "A Time to Dance, a Time to Die" (2008) / Wikipedia "Dancing plague of 1518" → "reportedly"
//   ~312.9 million operations a year (2012) → ~857,000 a day — Weiser et al., Bulletin of the WHO 94(3), 2016
//   153,359 commercial flights on July 23, 2026 = Flightradar24's busiest day on record — Flightradar24 via Airways Magazine
//   longest conga line: 119,986 people, Miami Super Conga, 13 March 1988 — Guinness World Records
//   193 UN member states — un.org
//   Ghana's dancing pallbearers (Benjamin Aidoo's Nana Otafrija service; BBC feature 2017 → the 2020 "coffin dance" meme) — Wikipedia / Vice
//   disco/ballroom dancing burns 231 kcal per 30 min at 185 lb → 462 an hour (330–462 for 125–185 lb) — Harvard Health
//     Publishing, "Calories burned in 30 minutes for people of three different weights"
//   "Swift Quake": Taylor Swift's Seattle shows (Lumen Field, July 22–23 2023) shook like a magnitude 2.3 earthquake —
//     seismologist Jackie Caplan-Auerbach (Western Washington Univ.), CNN/ABC, July 2023
//   7.1 million U.S. job openings, August 2026 — BLS JOLTS release, Sept 29 2026
//   >890 million adults with obesity (2022) — WHO fact sheet "Obesity and overweight" (updated Dec 2025)
//
// Shot list (seconds)                       | set     | what happens
//  0.0– 9.4  library  TUESDAY 2:14 PM       | library | quiet reading room; 5.5 ♪ notes pop over every head; 6.5 all spring up, chairs tip back, the
//                                           |         | book cart erupts, everyone disco-points in sync; 7.5 the QUIET PLEASE sign falls
//  9.4–14.8  or       +1 MINUTE             | surgery | three surgeons do the robot (gloved hands up); the ECG reads 120 = the song; the patient's feet kick;
//                                           |         | 12.9 the lamp spins + the instrument tray launches
// 14.8–20.2  plane    +10 MINUTES           | plane   | the whole cabin waves its arms seated; the attendant does the safety demo as a dance; 17.6 the
//                                           |         | oxygen masks drop and swing to the beat
// 20.2–25.6  market   +1 HOUR               | market  | a conga line down the aisle toward us; every kick (beat 4) knocks products off; 25.0 the can pyramid
// 25.6–28.3  pressA   +2 HOURS              | podium  | the President disco-points, then moonwalks across the stage; flash storm
// 28.3–31.0  pressB                         | podium  | reverse: the press corps does the robot back, jumps up; chairs topple row by row
// 31.0–36.4  funeral  +6 HOURS              | cemetery| six pallbearers in shades bounce the coffin; mourners shimmy; 34.5 coffin toss + spin, lands 35.3
// 36.4–41.8  kitchen  +1 DAY                | kitchen | Gary body-rolls with cereal; every spoonful flies off; 40.3 the bowl flips onto his head
// 41.8–47.2  stadium  +1 WEEK               | stadium | 16k fans jump on every beat; 44.5 crouch → 45.0 everyone jumps → 45.5 lands: the "quake" (shake + dust + confetti)
// 47.2–52.6  office   +1 MONTH              | office  | HR does the sprinkler; Gary answers with the worm across the floor; HIRED
// 52.6–58.0  street   +1 YEAR               | street  | time-lapse through four seasons: Gary dances in front of a GYM, loses the belly, gains arms; 55.4 CLOSED FOREVER
// 58.0–71.5  roof     +1 YEAR               | city    | golden hour → dusk: Gary + wife slow-dance on a rooftop, the street below is one dance floor; crane up. End card 67.2
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { K, clamp, lerp, lerpAngle, smooth, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H, L1, L2, ANKLE } from '@engine/rig.js';
import { buildCity, ROOF_Y } from '@engine/sets/city.js';
import { buildLibrary, DIMS as LD } from '@engine/sets/library.js';
import { buildSurgery, DIMS as OD } from '@engine/sets/surgery.js';
import { buildPlane, DIMS as PLD, seatPos } from '@engine/sets/plane.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildCemetery, DIMS as FD } from '@engine/sets/cemetery.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildStadium, DIMS as SD } from '@engine/sets/stadium.js';
import { buildOffice, DIMS as OFD } from '@engine/sets/office.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
export const M1 = 5.5;                    // the moment everyone starts dancing (= beat 0)
export const BEAT = 0.5;                  // 120 BPM — the music's tempo (make_cues.py uses the same grid)
const SIT = HIP_H - 0.17;                 // sitting root = seat − SIT
const HC = 0.9;                           // body center above the feet (for flying / lying bodies)
const OFF = { city: [0, 0, 0], lib: [2000, 0, 0], or: [4000, 0, 0], plane: [6000, 0, 0], mkt: [8000, 0, 0], press: [10000, 0, 0],
  fun: [12000, 0, 0], kit: [14000, 0, 0], stad: [16000, 0, 0], off: [18000, 0, 0], street: [20000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 9.4, cam: 'lib', set: 'lib' },
  { t0: 9.4, t1: 14.8, cam: 'or', set: 'or' },
  { t0: 14.8, t1: 20.2, cam: 'plane', set: 'plane' },
  { t0: 20.2, t1: 25.6, cam: 'mkt', set: 'mkt' },
  { t0: 25.6, t1: 28.3, cam: 'pressA', set: 'press' },
  { t0: 28.3, t1: 31.0, cam: 'pressB', set: 'press' },
  { t0: 31.0, t1: 36.4, cam: 'fun', set: 'fun' },
  { t0: 36.4, t1: 41.8, cam: 'kit', set: 'kit' },
  { t0: 41.8, t1: 47.2, cam: 'stad', set: 'stad' },
  { t0: 47.2, t1: 52.6, cam: 'off', set: 'off' },
  { t0: 52.6, t1: 58.0, cam: 'street', set: 'street' },
  { t0: 58.0, t1: 71.5, cam: 'roof', set: 'city' },
];
// camera coords are LOCAL to the shot's set (two keys, eased)
export const CAMS = {
  lib:    { p: [[0.15, 2.05, 5.0], [0.05, 1.9, 4.2]], a: [[0, 1.05, -2.2], [0, 1.15, -2.2]], fov: 56, amp: 0.004 },
  or:     { p: [[0.5, 1.66, 2.7], [0.35, 1.62, 2.3]], a: [[0.3, 1.38, -1.3], [0.3, 1.42, -1.3]], fov: 52, amp: 0.004 },
  plane:  { p: [[0.05, 1.8, 1.55], [0.0, 1.75, 1.2]], a: [[0, 0.95, -6], [0, 0.95, -6]], fov: 56, amp: 0.004 },
  mkt:    { p: [[0.45, 1.3, 2.4], [0.35, 1.2, 2.0]], a: [[0, 1.2, -4], [0, 1.1, -3]], fov: 46, amp: 0.004 },
  pressA: { p: [[0.9, 2.35, 1.2], [1.25, 2.2, 0.7]], a: [[0.5, 1.45, -3.0], [1.35, 1.4, -3.0]], fov: 44, amp: 0.004 },
  pressB: { p: [[0.8, 1.85, -2.2], [1.0, 1.8, -1.8]], a: [[1.7, 1.15, 2.6], [1.75, 1.1, 2.6]], fov: 50, amp: 0.004 },
  fun:    { p: [[1.7, 2.1, 7.3], [1.3, 1.95, 6.4]], a: [[0, 1.35, 1.0], [0, 1.4, 1.0]], fov: 46, amp: 0.004 },
  kit:    { p: [[0.8, 1.52, 2.35], [0.7, 1.5, 1.95]], a: [[0.3, 1.28, -1.0], [0.3, 1.3, -1.0]], fov: 48, amp: 0.004 },
  stad:   { p: [[-38.6, 3.0, 2.2], [-38.3, 3.4, 1.6]], a: [[0, 3.0, -2.0], [0, 4.0, -2.0]], fov: 52, amp: 0.006 },
  off:    { p: [[1.5, 2.1, 2.9], [1.3, 2.0, 2.6]], a: [[-0.05, 0.8, -0.9], [-0.1, 0.75, -0.8]], fov: 54, amp: 0.004 },
  street: { p: [[5.6, 1.35, 4.4], [5.45, 1.35, 3.8]], a: [[5.25, 1.75, -2.5], [5.25, 1.7, -2.5]], fov: 50, amp: 0.004 },
  roof:   { p: [[-11.0, ROOF_Y + 1.6, 14.2], [-8.5, ROOF_Y + 22.0, 13.0]], a: [[-11.5, ROOF_Y + 1.1, 11.0], [-3.0, 2.0, -12.0]], fov: 50, amp: 0.004, ease: [61.5, 67.0] },   // the crane stays above the roof's footprint (neighbors are taller)
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- the beat + the move library
const fr = (x) => x - Math.floor(x);
const mod = (n, m) => ((n % m) + m) % m;
const beatOf = (t) => (t - M1) / BEAT;
const pulse = (b) => 0.5 + 0.5 * Math.cos(2 * PI * b);      // 1 on the beat, 0 on the off-beat
const swing = (b) => Math.sin(PI * b);                        // ±1, one side per beat (period 2 beats)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const PT_UP = A(-2.6, 0.7, -0.05), PT_DN = A(-0.45, -0.32, -0.08);          // disco point up / down across (armB)
const PT_UP_A = A(-2.6, 0.7, -0.05), PT_DN_A = A(-0.45, -0.32, -0.08);
const HIP_A = A(0.2, 0.72, -1.9, 1.35), HIP_B = A(0.2, 0.72, -1.9, -1.35);   // hand on the hip
const FWD = A(0.0, 0.1, -1.57), GOAL = A(-1.57, 1.57, -1.57);                 // robot: forearm forward / goal post
const UP_A = A(-2.75, 0.42, -0.3), UP_B = A(-2.75, 0.42, -0.3);               // both arms up
const Y_ARM = A(-2.55, 0.85, -0.05);                                          // YMCA: Y
const HEAD_A = A(-2.45, 1.2, -2.35, 0.5), HEAD_B = A(-2.45, 1.2, -2.35, -0.5); // M: hands on the head
const C_A = A(-2.35, 1.05, -0.95), C_B = A(-0.75, -0.2, -0.95);              // C (both arms curve to the figure's −x side)
const TOP_A = A(-2.95, -0.1, -0.65, 0.65), TOP_B = A(-2.95, -0.1, -0.65, -0.65); // A: hands meet over the head
const SPR_A = A(-2.4, 1.05, -2.2, 0.45), SPR_B = A(-1.5, 0.15, -0.05);        // sprinkler: hand behind head, arm straight out
const CONGA_A = A(-1.3, 0.22, -0.35, 0.2), CONGA_B = A(-1.3, 0.22, -0.35, -0.2); // hands on the shoulders ahead
const HUG_A = A(-1.3, 0.3, -1.35, 0.95), HUG_B = A(-1.3, 0.3, -1.35, -0.95);
const SLOW_A = A(-0.95, 0.55, -0.85, 0.4), SLOW_B = A(-1.05, 0.35, -1.25, -0.6); // slow dance: hand on her waist / shoulder
const FLEX_A = A(-1.57, 1.57, -2.2), FLEX_B = A(-1.57, 1.57, -2.2);           // double-biceps flex
const READ_A = A(-0.9, 0.12, -1.25, 0.5), READ_B = A(-0.9, 0.12, -1.25, -0.5); // forearms on a table / holding a book
const PUSH_A = A(-1.4, 0.35, -1.6, 0.5), PUSH_B = A(-1.4, 0.35, -1.6, -0.5);  // the worm: hands under the chest

/** step-touch legs: weight shifts side to side on the beat; the free leg lifts + splays a little */
function stepTouch(b, k = 1) {
  const S = swing(b);
  return [{ fz: 0.03, lift: 0.055 * Math.max(0, -S) * k, splay: 0.06 + 0.07 * Math.max(0, -S) * k }, { fz: 0.03, lift: 0.055 * Math.max(0, S) * k, splay: 0.06 + 0.07 * Math.max(0, S) * k }];
}
/** p.x/p.z shift in the figure's own frame (dx = its +x side, dz = forward) */
function shiftLocal(p, dx, dz) { p.x += Math.cos(p.rotY) * dx + Math.sin(p.rotY) * dz; p.z += -Math.sin(p.rotY) * dx + Math.cos(p.rotY) * dz; }

// each move mutates the pose (arms, head, bounce) and returns post-pose tweaks {sz: side bend, sy: shoulder twist, legs}
const MOVES = {
  groove(p, b, o) {
    const P = pulse(b), S = swing(b), k = o.k ?? 1;
    if (!o.seated) p.y += -0.055 * P * k; p.headPitch = 0.04 + 0.12 * P * k; p.headRoll = -0.08 * S * k;
    p.armA = A(-0.45 - 0.5 * Math.max(0, S), 0.3, -1.45 + 0.25 * P, 0.5); p.armB = A(-0.45 - 0.5 * Math.max(0, -S), 0.3, -1.45 + 0.25 * P, -0.5);
    if (!o.seated) shiftLocal(p, 0.035 * S * k, 0);
    return { sz: 0.1 * S * k, sy: 0.14 * S * k, legs: o.seated ? null : stepTouch(b, k) };
  },
  disco(p, b, o) {
    const n = Math.floor(b), e = smooth(fr(b) / 0.2), up = mod(n, 2) === 0, u = up ? e : 1 - e;   // u = 1 → pointing up
    p.armB = mixArm(up ? PT_DN : PT_UP, up ? PT_UP : PT_DN, e); p.armA = HIP_A;
    if (o.mirror) { p.armA = mixArm(up ? PT_DN_A : PT_UP_A, up ? PT_UP_A : PT_DN_A, e); p.armB = HIP_B; }
    const s = o.mirror ? -1 : 1;
    p.headYaw = s * lerp(-0.12, 0.32, u); p.headPitch = lerp(0.28, -0.22, u); p.headRoll = s * lerp(0.06, -0.1, u);
    if (!o.seated) { p.y += -0.045 * pulse(b); shiftLocal(p, -s * 0.03 * u, 0); }
    const pop = { fz: 0.07 * u, lift: 0.06 * u, splay: 0.08 + 0.1 * u };
    return { sz: s * lerp(-0.08, 0.13, u), sy: s * lerp(-0.12, 0.16, u), legs: o.seated ? null : (o.mirror ? [pop, { fz: 0.02, lift: 0, splay: 0.08 }] : [{ fz: 0.02, lift: 0, splay: 0.08 }, pop]) };
  },
  robot(p, b, o) {
    const n = Math.floor(b), e = smooth(fr(b) / 0.13), st = mod(n, 4), pr = mod(n - 1, 4);
    const SA = [FWD, GOAL, FWD, GOAL], SB = [GOAL, FWD, FWD, GOAL], YAW = [0, 0, -0.55, 0.55];
    p.armA = mixArm(SA[pr], SA[st], e); p.armB = mixArm(SB[pr], SB[st], e);
    p.headYaw = lerp(YAW[pr], YAW[st], e); p.headPitch = 0.02; p.headRoll = 0; p.lean = 0;
    if (!o.seated) p.y += -0.035 * (1 - e);
    const kn = (1 - e) * 0.05;
    return { sz: 0, sy: lerp(YAW[pr], YAW[st], e) * 0.35, legs: o.seated ? null : [{ fz: 0.02, lift: st % 2 ? kn : 0, splay: 0.07 }, { fz: 0.02, lift: st % 2 ? 0 : kn, splay: 0.07 }] };
  },
  jump(p, b, o) {
    const f = fr(b), air = Math.sin(PI * f), S = swing(b), k = o.k ?? 1;
    if (!o.seated) { p.y += 0.12 * air * k; p.crouch = 0.06 * (1 - air) * k; }
    p.armA = A(-2.75, 0.42 + 0.14 * S, -0.25 - 0.35 * (1 - air)); p.armB = A(-2.75, 0.42 - 0.14 * S, -0.25 - 0.35 * (1 - air));
    p.headPitch = -0.18 + 0.15 * (1 - air);
    return { sz: 0.06 * S, sy: 0, legs: o.seated ? null : [{ fz: 0, lift: 0, splay: 0.09 }, { fz: 0, lift: 0, splay: 0.09 }] };
  },
  ymca(p, b, o) {
    const n = Math.floor(b), e = smooth(fr(b) / 0.2), st = mod(n, 4), pr = mod(n - 1, 4);
    const LA = [Y_ARM, HEAD_A, C_A, TOP_A], LB = [Y_ARM, HEAD_B, C_B, TOP_B];
    p.armA = mixArm(LA[pr], LA[st], e); p.armB = mixArm(LB[pr], LB[st], e);
    p.headPitch = -0.12; if (!o.seated) p.y += -0.045 * pulse(b);
    const c = (st === 2 ? e : pr === 2 ? 1 - e : 0);
    return { sz: 0.16 * c, sy: 0, legs: o.seated ? null : stepTouch(b, 0.7) };
  },
  twist(p, b, o) {
    const w = Math.sin(2 * PI * b);
    p.rotY += -0.32 * w; p.crouch = 0.1 + 0.05 * pulse(b);
    p.armA = A(-0.65 + 0.35 * w, 0.6, -1.55, 0.6); p.armB = A(-0.65 - 0.35 * w, 0.6, -1.55, -0.6); p.headYaw = 0.2 * w; p.headPitch = 0.05;
    return { sz: 0, sy: 0.6 * w, legs: [{ fz: 0.07 * w, lift: 0, splay: 0.1 }, { fz: -0.07 * w, lift: 0, splay: 0.1 }] };
  },
  shimmy(p, b, o) {
    const w = Math.sin(4 * PI * b);
    p.lean = -0.1; p.armA = A(-0.35, 0.85, -1.0, 0.4); p.armB = A(-0.35, 0.85, -1.0, -0.4);
    if (!o.seated) p.y += -0.035 * pulse(b); p.headRoll = 0.09 * swing(b); p.headPitch = -0.05;
    return { sz: 0.05 * swing(b), sy: 0.2 * w, legs: o.seated ? null : stepTouch(b, 0.6) };
  },
  sprinkler(p, b, o) {
    const c = fr(b / 4) * 8, tick = Math.min(Math.floor(c), 6);
    const yaw = c < 6.5 ? -0.6 + 0.2 * (tick + smooth(fr(c) / 0.25) * (c < 6 ? 1 : 0)) : lerp(0.6, -0.6, smooth((c - 6.5) / 1.5));
    p.rotY += yaw; p.armA = SPR_A; p.armB = SPR_B; p.headYaw = 0; p.headPitch = 0.0;
    p.y += -0.03 * pulse(b * 2);
    return { sz: 0, sy: 0, legs: [{ fz: 0.14, lift: 0, splay: 0.1 }, { fz: -0.1, lift: 0.0, splay: 0.1 }] };
  },
  bodyroll(p, b, o) {
    const w = 2 * PI * b;
    p.lean = 0.14 * Math.sin(w); p.headPitch = -0.28 * Math.sin(w - 0.9); p.crouch = 0.06 + 0.05 * Math.sin(w + 1.2);
    return { sz: 0.04 * swing(b), sy: 0, legs: stepTouch(b, 0.4) };
  },
};
const MOOD = (t, t0, seed) => (t < t0 + 1.0 + seed * 0.6 ? 'o' : seed > 0.72 ? 'o' : 'smile');

// ---------------------------------------------------------------- palette
const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- small props
function makeNoteTex() {
  return canvasTex(128, 128, (g) => {
    g.translate(64, 64); g.lineJoin = 'round';
    const path = () => { g.beginPath(); g.ellipse(-14, 30, 20, 14, -0.45, 0, 7); g.moveTo(3, 26); g.lineTo(3, -44); g.quadraticCurveTo(26, -30, 30, -6); g.quadraticCurveTo(22, -22, 3, -26); };
    g.lineWidth = 12; g.strokeStyle = 'rgba(60,35,10,.85)'; path(); g.stroke();
    g.fillStyle = '#f3c46b'; g.beginPath(); g.ellipse(-14, 30, 20, 14, -0.45, 0, 7); g.fill(); g.fillRect(-1, -44, 8, 72);
    g.beginPath(); g.moveTo(3, -44); g.quadraticCurveTo(26, -30, 30, -6); g.quadraticCurveTo(22, -22, 3, -26); g.fill();
  });
}
function makeCoffin() {
  const g = new THREE.Group(), wood = mat(0x5a2f1c, 0.3, { metalness: 0.1 }), brass = mat(0xc9a25a, 0.25, { metalness: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 2.0), wood); body.castShadow = true; g.add(body);
  const lid = mk(new THREE.BoxGeometry(0.6, 0.1, 2.04), mat(0x6a3a22, 0.25), g, 0, 0.29, 0); void lid;
  for (const s of [-1, 1]) for (const z of [-0.6, 0, 0.6]) mk(new THREE.BoxGeometry(0.03, 0.04, 0.22), brass, g, s * 0.3, 0.02, z);
  const spray = new THREE.Group(); spray.position.y = 0.36; g.add(spray);
  const fc = [0xffffff, 0xf4c6d6, 0xf2b632, 0xd2483f];
  for (let k = 0; k < 16; k++) mk(new THREE.SphereGeometry(0.06, 8, 6), mat(k % 5 === 0 ? 0x3f6e34 : fc[k % 4], 0.7), spray, (k % 3 - 1) * 0.1, 0.03 * (k % 2), -0.35 + k * 0.045);
  return g;   // center at the middle of the box (bottom at y −0.25), long axis z
}
function makeBowl() {
  const g = new THREE.Group();
  const b = mk(new THREE.SphereGeometry(0.09, 20, 10, 0, PI * 2, PI / 2, PI / 2), mat(0xf4f1ea, 0.4, { side: THREE.DoubleSide }), g, 0, 0.07, 0); void b;
  const milk = mk(new THREE.CircleGeometry(0.083, 20), mat(0xf6f1e0, 0.6), g, 0, 0.055, 0); milk.rotation.x = -PI / 2;
  for (let k = 0; k < 9; k++) { const o = mk(new THREE.TorusGeometry(0.012, 0.006, 6, 10), mat(0xe0a64a, 0.7), g, Math.cos(k * 2.3) * 0.045 * (k % 3) / 2, 0.06, Math.sin(k * 2.3) * 0.045 * (k % 3) / 2); o.rotation.x = PI / 2; }
  return g;   // rim center ≈ (0, 0.07, 0), bottom at y ≈ −0.02
}
function makeSpoon() { const g = new THREE.Group(), m = mat(0xc9ccd2, 0.25, { metalness: 0.75 }); mk(new THREE.BoxGeometry(0.012, 0.15, 0.006), m, g, 0, 0.075, 0); const h = mk(new THREE.SphereGeometry(0.022, 10, 8), m, g, 0, 0.165, 0); h.scale.set(1, 1.4, 0.35); return g; }
function makeCerealBox() {
  const g = new THREE.Group();
  const t = canvasTex(128, 192, (c, w, h) => { c.fillStyle = '#f2b632'; c.fillRect(0, 0, w, h); c.fillStyle = '#d23a3f'; c.font = 'bold 30px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('CRUNCH', w / 2, 46); c.fillText("O's", w / 2, 80); c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, 138, 34, 0, 7); c.fill(); c.fillStyle = '#e0a64a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(w / 2 - 16 + (i % 3) * 16, 128 + Math.floor(i / 3) * 18, 7, 0, 7); c.fill(); } });
  mk(new THREE.BoxGeometry(0.2, 0.3, 0.07), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }), g, 0, 0.15, 0);
  return g;
}
function makeSheet(text, col = '#d23a3f') {
  return new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, map: canvasTex(256, 182, (c, w, h) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 22; y < h - 10; y += 14) c.fillRect(18, y, w - 36, 3); if (text) { c.save(); c.translate(w / 2, h / 2); c.rotate(-0.12); c.strokeStyle = col; c.lineWidth = 9; c.strokeRect(-104, -42, 208, 84); c.fillStyle = col; c.font = 'bold 66px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 4); c.restore(); } }) }));
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 1, power: 1, milky: 0, moon: 0.4 }); city.setSignal('green'); city.setGrowth(0); city.setSnow(0);
  const lib = buildLibrary(studio, {}); lib.root.position.set(...OFF.lib);
  const or = buildSurgery(studio, {}); or.root.position.set(...OFF.or);
  const plane = buildPlane(studio, {}); plane.root.position.set(...OFF.plane);
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const fun = buildCemetery(studio, {}); fun.root.position.set(...OFF.fun);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(8, 4);
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const off = buildOffice(studio, {}); off.root.position.set(...OFF.off);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const ROOTS = { city: city.root, lib: lib.root, or: or.root, plane: plane.root, mkt: mkt.root, press: press.root, fun: fun.root, kit: kit.root, stad: stad.root, off: off.root, street: street.root };
  const FOGS = { city: cityFog, lib: null, or: null, plane: null, mkt: null, press: null, fun: fun.fog, kit: null, stad: stad.fog, off: null, street: streetFog };
  const FAR = { city: 900, lib: 40, or: 30, plane: 40, mkt: 80, press: 60, fun: 300, kit: 40, stad: 600, off: 40, street: 400 };

  // ---------------------------------------------------------------- cast
  const R = rng(19);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.base = { top: o.top, pants: o.pants }; return p; };
  const crowd = Array.from({ length: 26 }, () => {
    const style = pick(STYLES);
    const p = person({ skin: pick(SKINS), top: pick(TOPS), collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: pick(HAIRS), hairStyle: style,
      glasses: R() < 0.2, mustache: style !== 'bob' && R() < 0.15 ? pick(HAIRS.slice(0, 3)) : null });
    p.seed = R(); return p;
  });
  const gary = person({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0xc9b48e, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const wife = person({ skin: 0xe2ad8c, top: 0xe58fa6, pants: 0x45607a, hair: 0x5a3a24, hairStyle: 'bob' });
  const kid = person({ skin: 0xe9b48f, top: 0xf1c24a, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'messy', headR: 0.175 });
  const prez = person({ skin: 0xf0c8a8, top: 0x2f3a4a, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0xc9c4be, hairStyle: 'short' });
  mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(0xc0392b, 0.5), prez.spine, 0, 0.42, 0.135).rotation.x = -0.12;
  const librarian = person({ skin: 0xf1c3a1, top: 0x7a5a8a, collar: 0xf4f4f2, pants: 0x3a3d42, hair: 0xc9c4be, hairStyle: 'bob', glasses: true });
  const hr = person({ skin: 0xc98e6a, top: 0x2f4f73, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const attendant = person({ skin: 0xf3d0b5, top: 0x2f4f8a, collar: 0xd2483f, pants: 0x2f4f8a, hair: 0x9a6a3a, hairStyle: 'bob' });
  const priest = person({ skin: 0x9a6447, top: 0x1d1d22, collar: 0xffffff, pants: 0x1d1d22, hair: 0x1a1a1a, hairStyle: 'short', glasses: true });
  const manager = person({ skin: 0xc98e6a, top: 0xd2483f, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x2a1d16, hairStyle: 'short' });

  // accessories (built for every crowd rig, toggled per beat): surgical cap + mask + gloves, sunglasses
  const ACC = [];
  const capM = mat(0x8fc6ef, 0.8, { side: THREE.DoubleSide }), maskM = mat(0xbfe3f7, 0.85), gloveM = mat(0x6aa8e8, 0.5), shadeM = mat(0x111114, 0.15, { metalness: 0.4 });
  for (const rig of [...crowd, gary]) {
    const r = rig.head.head.geometry.parameters.radius, hg = rig.head.g;
    const cap = mk(new THREE.SphereGeometry(r * 1.13, 24, 12, 0, PI * 2, 0, PI * 0.52), capM, hg, 0, r * 0.05, -r * 0.02); cap.rotation.x = -0.25;
    const mask = mk(new THREE.SphereGeometry(r * 0.62, 16, 10), maskM, hg, 0, -r * 0.32, r * 0.72); mask.scale.set(1.25, 0.8, 0.55);
    const gloves = rig.arms.map((a) => { const gl = mk(new THREE.SphereGeometry(0.06, 12, 10), gloveM, a.hand, 0, -0.005, 0); gl.scale.set(0.9, 1.18, 0.7); return gl; });
    const shades = new THREE.Group(); hg.add(shades);
    for (const s of [-1, 1]) { const l = mk(new THREE.CylinderGeometry(r * 0.27, r * 0.27, r * 0.05, 16), shadeM, shades, s * r * 0.36, r * 0.08, r * 0.95); l.rotation.x = PI / 2; }
    mk(new THREE.BoxGeometry(r * 0.3, r * 0.05, r * 0.05), shadeM, shades, 0, r * 0.12, r * 0.98);
    const acc = { cap, mask, gloves, shades }; rig.acc = acc; ACC.push(acc);
    cap.visible = mask.visible = shades.visible = false; gloves.forEach((g) => (g.visible = false));
  }
  const wear = (rig, o) => { const a = rig.acc; if (!a) return; a.cap.visible = !!o.cap; a.mask.visible = !!o.mask; a.gloves.forEach((g) => (g.visible = !!o.gloves)); a.shades.visible = !!o.shades; if (o.cap) a.cap.material = o.capM || capM; };
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); rig.mats.pants.color.setHex(pants ?? top); };

  // ---------------------------------------------------------------- FX: sprites (puffs, stars, notes), confetti, mini crowds
  const puffs = makeSpritePool(scene, 90, 'smoke');
  const puffCol = new THREE.Color(0xffffff);
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const noteTex = makeNoteTex();
  const notes = Array.from({ length: 24 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0, noteN = 0;
  const jolts = [];
  /** an impact at time m, position p (LOCAL to set key): starburst + dust puffs */
  function impact(t, m, key, p, s = 1, star = true) {
    const age = t - m; if (age < 0 || age > 0.75) return;
    const o = OFF[key], w = V3(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
    if (star && age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    for (let k = 0; k < 3 && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + k * 2.1, r = (0.12 + age * 0.75) * s;
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y - 0.15 + k * 0.14 + age * 0.3, w.z + Math.sin(a) * r * 0.6), (0.3 + age * 0.9) * s, 0.75 * (1 - age / 0.75) ** 1.5, puffCol);
    }
  }
  /** a gold ♪ pops above a head at time m and floats up */
  function note(t, m, rig, s = 1) {
    const age = t - m; if (age < 0 || age > 2.2 || noteN >= notes.length) return;
    const n = notes[noteN++], pop = age < 0.25 ? 1.35 * Math.sin((age / 0.25) * PI / 2) : 1 + 0.35 * Math.exp(-(age - 0.25) * 6);
    rig.headG.updateMatrixWorld(true); n.position.copy(rig.headG.localToWorld(V3(0.08 * Math.sin(m * 9), 0.45 + age * 0.28, 0)));
    n.position.x += 0.05 * Math.sin(age * 5 + m * 3); n.visible = true; n.scale.setScalar(0.24 * s * pop); n.material.opacity = clamp((2.2 - age) / 0.5); n.material.rotation = 0.15 * Math.sin(age * 4 + m);
  }
  // confetti (one burst per shot): instanced little cards
  const CF = 420, confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.075), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, emissive: 0x222222 }), CF);
  confetti.frustumCulled = false; scene.add(confetti);
  const CR = rng(77), cfSeeds = Array.from({ length: CF }, () => [CR(), CR(), CR(), CR(), CR()]);
  const CF_COLS = [0xff5fa2, 0xffd166, 0x5ad1ff, 0x9b7bff, 0xffffff, 0x6fd38a, 0xff8a3a];
  cfSeeds.forEach((q, i) => confetti.setColorAt(i, new THREE.Color(CF_COLS[i % CF_COLS.length])));
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V3(1, 1, 1), _p = V3(0, 0, 0);
  /** burst: t0, center (world), spread (m), up speed, scale, colors, count, floor height (world) */
  function burst(t, t0, c, spread = 3, vy = 5, sc = 1, cols = null, n = CF, fy = 0.02) {
    for (let i = 0; i < CF; i++) {
      const q = cfSeeds[i], age = t - t0;
      if (i >= n || age < 0 || age > 6) { _s.set(0, 0, 0); _p.set(0, -999, 0); }
      else {
        const vx = (q[0] - 0.5) * spread * 2, vz = (q[1] - 0.5) * spread * 2, v0 = vy * (0.6 + q[2] * 0.6), ta = Math.min(age, v0 / 9.8 * 0.9);
        const fall = Math.max(0, age - ta);
        _p.set(c.x + vx * Math.min(age, 0.8) + 0.25 * Math.sin(t * 2 + i), c.y + v0 * ta - 4.9 * ta * ta - 0.9 * fall, c.z + vz * Math.min(age, 0.8) + 0.2 * Math.cos(t * 1.7 + i));
        _p.y = Math.max(fy, _p.y); _s.setScalar(sc);
      }
      _q.setFromEuler(_e.set(t * (2 + q[3] * 4) + i, t * 3 + i * 0.7, i * 0.3)); _m4.compose(_p, _q, _s); confetti.setMatrixAt(i, _m4);
      if (cols) confetti.setColorAt(i, cols[i % cols.length]);
    }
    confetti.instanceMatrix.needsUpdate = true; if (cols && confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
  }
  const CF_COLORS = CF_COLS.map((c) => new THREE.Color(c)), PETAL_COLORS = [0xf4c6d6, 0xffffff, 0xe58fa6, 0xf2d6a0].map((c) => new THREE.Color(c));
  const CEREAL_COLORS = [new THREE.Color(0xe0a64a), new THREE.Color(0xd99238), new THREE.Color(0xf0bb5a)];
  const hideConfetti = () => { for (let i = 0; i < CF; i++) { _m4.compose(_p.set(0, -999, 0), _q.identity(), _s.set(0, 0, 0)); confetti.setMatrixAt(i, _m4); } confetti.instanceMatrix.needsUpdate = true; };

  /** a cheap instanced crowd (capsule body + head + raised-arm V): parent-local coords */
  function makeMini(parent, n, seed, o = {}) {
    const MR = rng(seed);
    const bodyG = new THREE.CapsuleGeometry(0.19, o.seated ? 0.3 : 0.5, 2, 6), headG = new THREE.SphereGeometry(0.16, 10, 8);
    const aL = new THREE.CapsuleGeometry(0.05, 0.46, 2, 4); aL.rotateZ(-0.4); aL.translate(-0.2, 0.3, 0);
    const aR = new THREE.CapsuleGeometry(0.05, 0.46, 2, 4); aR.rotateZ(0.4); aR.translate(0.2, 0.3, 0);
    const M = [new THREE.InstancedMesh(bodyG, new THREE.MeshStandardMaterial({ roughness: 0.8 }), n), new THREE.InstancedMesh(headG, new THREE.MeshStandardMaterial({ roughness: 0.65 }), n), new THREE.InstancedMesh(mergeGeometries([aL, aR]), new THREE.MeshStandardMaterial({ roughness: 0.8 }), n)];
    for (let i = 0; i < n; i++) { const c = new THREE.Color(TOPS[Math.floor(MR() * TOPS.length)]); M[0].setColorAt(i, c); M[2].setColorAt(i, c); M[1].setColorAt(i, new THREE.Color(SKINS[Math.floor(MR() * SKINS.length)])); }
    M.forEach((m) => { m.frustumCulled = false; m.castShadow = !!o.shadow; parent.add(m); });
    const bh = o.seated ? 0.38 : 0.48, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(0, 0, 0, 'YXZ'), v = V3(0, 0, 0), s1 = V3(1, 1, 1), s0 = V3(0, 0, 0), up = V3(0, 0, 0), sa = V3(1, 1, 1);
    return {
      n, meshes: M, seeds: Array.from({ length: n }, () => MR()),
      set(i, x, y, z, yaw, arms = 0, sway = 0, sc = 1) {
        e.set(0, yaw, sway); q.setFromEuler(e); s1.setScalar(sc);
        m4.compose(v.set(x, y + bh * sc, z), q, s1); M[0].setMatrixAt(i, m4);
        up.set(0, 1, 0).applyQuaternion(q);
        const hh = (o.seated ? 0.42 : 0.55) * sc; m4.compose(v.set(x + up.x * hh, y + bh * sc + up.y * hh, z + up.z * hh), q, s1); M[1].setMatrixAt(i, m4);
        if (arms > 0.02) { sa.set(sc, sc * arms, sc); const ah = 0.22 * sc; m4.compose(v.set(x + up.x * ah, y + bh * sc + up.y * ah, z + up.z * ah), q, sa); } else m4.compose(v.set(x, -99, z), q, s0);
        M[2].setMatrixAt(i, m4);
      },
      hide(i) { m4.compose(v.set(0, -99, 0), q, s0); M.forEach((m) => m.setMatrixAt(i, m4)); },
      commit() { M.forEach((m) => (m.instanceMatrix.needsUpdate = true)); },
    };
  }

  // ---------------------------------------------------------------- shared posing
  function legIK(leg, dz, dy) {
    let d = Math.hypot(dz, dy); d = Math.min(d, L1 + L2 - 1e-4);
    const gamma = Math.atan2(dz, -dy), alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), beta = PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    leg.hip.rotation.x = -(gamma + alpha); leg.knee.rotation.x = beta; leg.ankle.rotation.x = gamma + alpha - beta;
  }
  function show(rig, key, p, o = {}) {
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    rig.root.rotation.x = o.tilt || 0; if (o.roll) rig.root.rotation.z += o.roll;
    rig.root.scale.setScalar(o.s || 1);
    if (o.s && o.s !== 1) rig.root.position.y = (p.y || 0) * o.s + (o.lift || 0);
    rig.root.visible = true;
  }
  function post(rig, p, q) {
    if (!q) return;
    rig.spine.rotation.z += q.sz || 0; rig.spine.rotation.y += q.sy || 0;
    if (q.legs) {
      const hipY = rig.pelvis.position.y;
      rig.legs.forEach((leg) => { const L = leg.s < 0 ? q.legs[0] : q.legs[1], sp = L.splay || 0; legIK(leg, (L.fz || 0) + (p.footFwd || 0), (ANKLE + (L.lift || 0) + (p.floor || 0) - (p.y || 0) - hipY) / Math.cos(sp)); leg.hip.rotation.z = leg.s * sp; });
    }
  }
  /** a dancer: o = { x, z, rotY, move, seed, floor, seated (seat height), lag, k, mirror, mouth, t0 (start of dancing), pre (pose fn before t0) } */
  function dancer(rig, key, t, o) {
    const p = basePose(); p.eyes = blink(t, Math.floor((o.seed ?? 0.5) * 10));
    Object.assign(p, { x: o.x, z: o.z, rotY: o.rotY ?? 0, floor: o.floor || 0, y: o.floor || 0 });
    if (o.seated !== undefined) { p.y = o.seated - SIT; p.footFwd = 0.42; p.floor = o.seatFloor ?? 0; }
    const b = beatOf(t) - (o.lag ?? (o.seed ?? 0) * 0.08);
    let q = null;
    if (o.t0 !== undefined && t < o.t0 && o.pre) o.pre(p, t);
    else { q = MOVES[o.move](p, b, { ...o, seated: o.seated !== undefined }); p.mouth = o.mouth || MOOD(t, o.t0 ?? M1, o.seed ?? 0.5); }
    if (o.then) o.then(p, q, b);
    show(rig, key, p, o.show || {});
    post(rig, p, q);
    return p;
  }

  // ================================================================ 1. LIBRARY
  const LSTAND = M1 + 2 * BEAT;                     // 6.5: everyone springs up
  const SIGN_FALL = 7.55;
  const READERS = [];   // inner chairs: x = ±0.39 (left table side +1 faces −x … see library.js), z = DIMS.seats
  // lib.chairs[] is built per table (tx −1.05 then +1.05), per seat z, per side (−1, +1) → index = table·8 + seat·2 + (side > 0)
  LD.seats.forEach((z, k) => { READERS.push({ x: -0.39, z, face: -PI / 2, chair: k * 2 + 1 }); READERS.push({ x: 0.39, z, face: PI / 2, chair: 8 + k * 2 }); });
  lib.chairs.forEach((c) => { c.rotation.order = 'YXZ'; c.userData.p0 = c.position.clone(); });
  const cartBooks0 = lib.cartBooks.map((b) => ({ p: b.position.clone(), r: b.rotation.clone() }));
  const BR = rng(5), cartFly = lib.cartBooks.map(() => ({ vx: (BR() - 0.5) * 2.0, vz: 0.1 + BR() * 0.7, vy: 2.0 + BR() * 1.6, spin: (BR() - 0.5) * 18, d: BR() * 0.12 }));
  const signRot0 = lib.sign.rotation.clone();
  function libReader(t, i) {
    const r = READERS[i], seed = crowd[i].seed;
    const standK = K(t, [[LSTAND - 0.05, 0], [LSTAND + 0.2, 1]]), turn = K(t, [[LSTAND + 0.05, 0], [LSTAND + 0.45, 1]]);
    const sx = r.x + Math.sign(r.x) * 0.08 * standK;   // standing a little toward the aisle
    if (t < LSTAND) {
      return dancer(crowd[i], 'lib', t, { x: r.x, z: r.z, rotY: r.face, seated: LD.seatY, seed, t0: M1, move: 'groove', k: 0.4,
        pre: (p, tt) => { p.armA = READ_A; p.armB = mixArm(READ_B, A(-1.1, 0.1, -1.6, -0.6), (i % 3 === 0) ? K(tt, [[1.5 + i * 0.3, 0], [1.8 + i * 0.3, 1], [2.3 + i * 0.3, 0]]) : 0); p.headPitch = 0.45; p.mouth = 'flat'; },
        then: (p) => { if (t >= M1) { p.headPitch = 0.0; p.mouth = 'o'; p.armA = mixArm(READ_A, A(-0.5, 0.4, -0.9, 0.3), K(t, [[M1, 0], [M1 + 0.2, 1]])); p.armB = mixArm(READ_B, A(-0.5, 0.4, -0.9, -0.3), K(t, [[M1, 0], [M1 + 0.2, 1]])); } } });
    }
    return dancer(crowd[i], 'lib', t, { x: sx, z: r.z, rotY: lerpAngle(r.face, 0, turn), seed, t0: LSTAND, move: 'disco', mirror: i % 2 === 1,
      then: (p) => { if (standK < 1) { p.y += 0.12 * Math.sin(standK * PI); } } });
  }
  function librarianPose(t) {
    const [dx, dz] = LD.desk;
    if (t < M1) { const p = basePose(); p.eyes = blink(t, 3); Object.assign(p, { x: dx, z: dz - 0.6, rotY: 0 }); p.armA = A(-0.75, 0.15, -1.3, 0.5); const st = K(t, [[2.6, 0], [2.8, 1], [3.0, 0], [4.0, 0], [4.2, 1], [4.4, 0]]); p.armB = A(-0.7 - 0.5 * st, 0.15, -1.2 - 0.6 * st, -0.5); p.headPitch = 0.4; p.mouth = 'flat'; show(librarian, 'lib', p); return; }
    dancer(librarian, 'lib', t, { x: dx, z: dz - 0.6, rotY: 0, seed: 0.3, t0: M1, move: t < LSTAND ? 'groove' : 'disco', k: t < LSTAND ? 0.5 : 1, mouth: t < 8.2 ? 'o' : 'smile' });
  }

  // ================================================================ 2. OPERATING ROOM
  or.monitor.position.set(1.2, 2.12, -2.74); or.monitor.rotation.set(0, -0.12, 0); or.monitor.children[2].visible = false;   // monitor up on the back wall (right)
  const OR_DROP = 12.4, TRAY_T = 12.95;
  const SURG = [{ x: -0.42, z: -1.25 }, { x: 0.3, z: -1.28 }, { x: 0.98, z: -1.22 }];
  const OR_BACK = [{ x: -0.05, z: -2.25, move: 'twist' }, { x: 0.68, z: -2.3, move: 'groove' }];
  const trayIns = or.trayTop.children.filter((c) => c.isMesh && c.geometry.type === 'BoxGeometry' && c.geometry.parameters.width < 0.02);
  const trayIns0 = trayIns.map((c) => ({ p: c.position.clone(), r: c.rotation.clone() }));
  const IR = rng(9), insFly = trayIns.map(() => ({ vx: (IR() - 0.5) * 1.4, vz: (IR() - 0.2) * 1.0, vy: 3 + IR() * 1.5, spin: (IR() - 0.5) * 30 }));

  // ================================================================ 3. PLANE
  const PL_DROP = 17.6;
  plane.rows.slice(0, 6).forEach((g) => (g.visible = false));   // row 0 is under the camera
  const PAX = [];   // full rigs: rows 1–4, cols 1–4 (aisle + middle)
  for (let r = 1; r <= 4; r++) for (const c of [1, 2, 3, 4]) PAX.push({ r, c });
  const miniPlane = makeMini(plane.root, 60, 61, { seated: true });
  const MINI_PL = [];
  for (let r = 1; r < 12; r++) for (let c = 0; c < 6; c++) { if (r <= 4 && c >= 1 && c <= 4) continue; if (MINI_PL.length < 60) MINI_PL.push({ r, c }); }
  const NMASK = 48, maskCup = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.065, 0.07, 12), mat(0xf2c94a, 0.55), NMASK), maskTube = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 5), mat(0xe8f2f6, 0.3), NMASK);
  maskCup.frustumCulled = maskTube.frustumCulled = false; plane.root.add(maskCup, maskTube);
  const MASKS = [];
  for (let r = 1; r <= 8; r++) for (let c = 0; c < 6; c++) { const sp = seatPos(r, c); MASKS.push({ x: sp.x, z: sp.z + 0.32, r, c }); }

  // ================================================================ 4. SUPERMARKET CONGA
  const NC = 10, CONGA_GAP = 0.62;
  const congaS = (t) => {   // the leader's travelled distance: steps on beats 1–3, kick (no travel) on beat 4
    const b = beatOf(t), bar = Math.floor(b / 4), inBar = b - bar * 4;
    return 0.72 * (bar * 3 + Math.min(inBar, 3)) * BEAT * 2.0;
  };
  const S_AT0 = congaS(20.2);
  const congaZ = (t, j) => -6.6 + (congaS(t) - S_AT0) - j * CONGA_GAP;
  const congaX = (z) => 0.38 * Math.sin(z * 0.9 + 0.6);
  const KICKS = []; for (let n = 0; n < 200; n++) { const tb = M1 + (4 * n + 3) * BEAT; if (tb > 20.3 && tb < 25.5) KICKS.push({ t: tb, side: n % 2 ? 1 : -1 }); }
  const NPROD = 64, prods = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.22, 0.1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), NPROD);
  prods.frustumCulled = false; mkt.root.add(prods);
  const PR = rng(31), PROD = Array.from({ length: NPROD }, (_, i) => ({ kick: i % Math.max(1, KICKS.length), j: Math.floor(i / Math.max(1, KICKS.length)) % NC, y0: 0.35 + PR() * 1.3, vx: 0.8 + PR() * 1.6, vy: 1.0 + PR() * 2.2, vz: (PR() - 0.3) * 1.4, spin: (PR() - 0.5) * 16 }));
  PROD.forEach((q, i) => prods.setColorAt(i, new THREE.Color([0xd2483f, 0xf2b632, 0x3d7bd9, 0x58b368, 0xe58fa6, 0xf4f1ea, 0x8f6fb8][i % 7])));
  const PYR_T = M1 + 39 * BEAT;   // the last kick in the beat (beat 39 = 25.0 s) hits the can pyramid
  const NCAN = 28, cans = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 14), new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.5 }), NCAN);
  cans.frustumCulled = false; mkt.root.add(cans);
  const CANS = []; { let k = 0; for (let lv = 0; lv < 5 && k < NCAN; lv++) for (let i = 0; i < 6 - lv && k < NCAN; i++) for (let d = 0; d < 1 && k < NCAN; d++) CANS.push({ x: 0.95 + (i - (5 - lv) / 2) * 0.125, y: 0.065 + lv * 0.13, z: -0.9, k: k++ }); while (CANS.length < NCAN) CANS.push({ x: 0.95 + (CANS.length % 5) * 0.1 - 0.2, y: 0.065, z: -1.03, k: CANS.length }); }
  CANS.forEach((c, i) => { cans.setColorAt(i, new THREE.Color([0xd2483f, 0xf2f2f2, 0x3d7bd9][i % 3])); const r = rng(100 + i); c.vx = (r() - 0.3) * 2.4; c.vy = 1.5 + r() * 2.5; c.vz = 0.8 + r() * 2.5; c.spin = (r() - 0.5) * 20; });
  const pyrBase = mk(new THREE.BoxGeometry(0.85, 0.06, 0.4), mat(0x8a6a4a, 0.7), mkt.root, 0.95, 0.03, -0.95); void pyrBase;
  { const sign = mk(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(200, 100, (c, w, h) => { c.fillStyle = '#f2b632'; c.fillRect(0, 0, w, h); c.fillStyle = '#d23a3f'; c.font = 'bold 40px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('2 FOR 1', w / 2, h / 2 + 2); }) }), mkt.root, 1.45, 1.05, -0.95); sign.rotation.y = -PI / 2; }

  // ================================================================ 5. PRESS
  const chairs = [];
  for (const z of PD.rows) for (const x of PD.seats) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.order = 'YXZ'; press.root.add(g);
    for (const o of [...press.root.children]) if (o.isMesh && o.position.y < 1.0 && Math.abs(o.position.x - x) < 0.26 && Math.abs(o.position.z - z) < 0.3) { o.position.x -= x; o.position.z -= z; press.root.remove(o); g.add(o); }
    chairs.push({ g, x, z, row: PD.rows.indexOf(z) });
  }
  const reporters = chairs.map((c, i) => i);   // all 24 seats (crowd[0..23])
  { // the back of the room (seen in the reverse shot): a cream wall, a NEWS banner, two TV cameras on tripods, wall lights
    const g = new THREE.Group(); press.root.add(g);
    mk(new THREE.BoxGeometry(10.2, 3.4, 0.12), mat(0xe9e2d2, 0.9), g, 0, 1.7, 5.9);
    mk(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#1c3a6e'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8c76a'; c.font = 'bold 54px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PRESS GALLERY', w / 2, h / 2 + 2); }) }), g, 0, 2.6, 5.83).rotation.y = PI;
    for (const x of [-3.6, -1.2, 1.2, 3.6]) { mk(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false }), g, x, 2.9, 5.83).rotation.y = PI; }
    for (const x of [-0.9, 0.9]) { const tc = new THREE.Group(); tc.position.set(x, 0, 4.6); tc.rotation.y = PI; g.add(tc); for (let k = 0; k < 3; k++) { const l = mk(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6), mat(0x2a2a2a, 0.5), tc, Math.cos(k * 2.1) * 0.25, 0.7, Math.sin(k * 2.1) * 0.25); l.rotation.set(Math.sin(k * 2.1) * 0.3, 0, -Math.cos(k * 2.1) * 0.3); } mk(new THREE.BoxGeometry(0.3, 0.28, 0.55), mat(0x1d1d22, 0.4), tc, 0, 1.55, 0); mk(new THREE.CylinderGeometry(0.09, 0.11, 0.25, 14), mat(0x111111, 0.3), tc, 0, 1.58, 0.38).rotation.x = PI / 2; }
    const wl = new THREE.PointLight(0xfff1d6, 4, 9, 1.5); wl.position.set(1.5, 2.6, 3.8); g.add(wl);
  }
  const MOON0 = 26.75, MOON1 = 28.05, PRESS_UP = 29.0, rowTip = (r) => 29.45 + r * 0.22;

  // ================================================================ 6. FUNERAL
  const coffin = makeCoffin(); fun.root.add(coffin);
  const PB = [-1, 1].flatMap((s) => [0.9, 1.65, 2.4].map((z) => ({ s, x: s * 0.45, z })));
  const TOSS0 = 34.45, TOSS1 = 35.3;
  const MOURN = []; for (const z of FD.rows) for (const sx of FD.seats) for (const side of [-1, 1]) if (MOURN.length < 8 && !(sx === 1.0 && z === FD.rows[1])) MOURN.push({ x: side * sx, z });

  // ================================================================ 7. KITCHEN
  const bowl = makeBowl(); scene.add(bowl);
  const spoon = makeSpoon(); scene.add(spoon);
  const cbox = makeCerealBox(); kit.root.add(cbox); cbox.position.set(-0.05, 0.75, -0.55); cbox.rotation.y = 0.35;
  const FLIP0 = 40.25, FLIP1 = 40.75;
  const GARY_K = [0.35, -1.15];

  // ================================================================ 8. STADIUM
  const ST_CROUCH = 44.5, ST_JUMP = 45.0, ST_LAND = 45.5;
  const FRONT = [-1.15, -0.4, 0.35, 1.1, 1.85].map((z, i) => ({ x: SD.pit.x0 - 0.1 + (i % 2) * 0.35, z }));
  const barrier = new THREE.Group(); barrier.position.set(SD.pit.x0 - 1.2, 0, 0); stad.root.add(barrier);
  for (let z = -20; z <= 20; z += 2) { mk(new THREE.BoxGeometry(0.1, 1.15, 2.0), mat(0x9aa4ad, 0.35, { metalness: 0.6 }), barrier, 0, 0.6, z).castShadow = false; }

  // ================================================================ 9. OFFICE
  const hired = makeSheet('HIRED'); scene.add(hired);
  const papers = Array.from({ length: 8 }, () => { const s = makeSheet(''); s.scale.setScalar(0.55); off.root.add(s); return s; });
  const PAP = papers.map((_, i) => { const r = rng(300 + i); return { x0: 0.25 + (r() - 0.5) * 0.3, z0: -0.85 + (r() - 0.5) * 0.2, vx: (r() - 0.5) * 2.2, vz: 0.4 + r() * 1.4, vy: 1.6 + r() * 1.4, spin: (r() - 0.5) * 8, t0: 49.0 + i * 0.12 }; });
  const WORM0 = 49.75, WORM1 = 51.55, STAMP = 51.75;

  // ================================================================ 10. STREET (fit year)
  const GYM = { x: 5.27, z: -2.95 };
  const gymSign = mk(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(400, 100, (c, w, h) => { c.fillStyle = '#1d2a38'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff5fa2'; c.font = 'bold 66px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('IRON GYM', w / 2, h / 2 + 3); }) }), street.root, GYM.x, 2.62, GYM.z + 0.02);
  void gymSign;
  const closed = mk(new THREE.PlaneGeometry(1.9, 0.62), new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide, map: canvasTex(400, 130, (c, w, h) => { c.fillStyle = '#f7f2e4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d23a3f'; c.lineWidth = 10; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#d23a3f'; c.font = 'bold 42px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CLOSED FOREVER', w / 2, h / 2 + 2); }) }), street.root, GYM.x, 1.5, GYM.z + 0.06);
  const CLOSED_T = 55.45;
  const awning = street.root.children.find((o) => o.isMesh && Math.abs(o.position.y - 2.75) < 0.01 && Math.abs(o.position.x - 5.58) < 0.05);
  if (awning) awning.visible = false;   // it hid the IRON GYM sign
  const SEASON_T = [[52.6, 'spring'], [53.75, 'summer'], [54.9, 'autumn'], [56.05, 'winter'], [57.2, 'spring']];
  const garyTorso = gary.spine.children.find((c) => c.isMesh && c.geometry.type === 'CapsuleGeometry');
  const garyArmMeshes = gary.arms.flatMap((a) => [a.shoulder.children[1], a.elbow.children[0]]).filter(Boolean);

  // ================================================================ 11. ROOFTOP (city at the origin)
  const RC = [-11.5, ROOF_Y, 11.0];   // clear of the stairwell, water tower legs, AC units and vent (city.js roof props)
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c8).multiplyScalar(1.6), toneMapped: false });
  const roofDeco = new THREE.Group(); city.root.add(roofDeco);
  for (const [z0, z1] of [[8.6, 17.4]]) for (const x of [-16.4, -7.6]) { mk(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), mat(0x3a3d42, 0.5), roofDeco, x, ROOF_Y + 1.3, z0); mk(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), mat(0x3a3d42, 0.5), roofDeco, x, ROOF_Y + 1.3, z1); }
  for (let k = 0; k < 4; k++) { const z = 8.6 + k * 2.93; for (let i = 0; i <= 18; i++) { const u = i / 18, x = lerp(-16.4, -7.6, u), y = ROOF_Y + 2.5 - 0.45 * Math.sin(PI * u); mk(new THREE.SphereGeometry(0.045, 8, 6), bulbM, roofDeco, x, y, z).castShadow = false; } }
  const bulbLight = new THREE.PointLight(0xffd9a0, 0, 12, 1.6); bulbLight.position.set(RC[0], ROOF_Y + 2.6, RC[2]); city.root.add(bulbLight);
  const miniStreet = makeMini(city.root, 700, 88, {});
  const STREET_SPOTS = []; { const SR = rng(4); for (let i = 0; i < 700; i++) STREET_SPOTS.push({ x: (SR() - 0.5) * 12.6, z: -30 + SR() * 75, s: SR() }); }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function hideAll() {
    all.forEach((r) => { r.root.visible = false; r.root.rotation.x = 0; r.root.rotation.z = 0; r.root.scale.setScalar(1); r.headG.visible = true; if (r.base) outfit(r, r.base.top, r.base.pants); });
    ACC.forEach((a) => { a.cap.visible = a.mask.visible = a.shades.visible = false; a.gloves.forEach((g) => (g.visible = false)); });
    puffs.hide(); stars.forEach((s) => (s.visible = false)); notes.forEach((n) => (n.visible = false)); starN = puffN = noteN = 0;
    bowl.visible = spoon.visible = hired.visible = coffin.visible = false;
    jolts.length = 0;
    if (garyTorso) garyTorso.scale.set(1.12, 1, 0.78); garyArmMeshes.forEach((m) => m.scale.set(1, 1, 1));
  }
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'stad' || S === 'city' ? 0.2 : 0.05; studio.fill.intensity = 0.45;
    hideAll();
    hideConfetti();
    const cam = shot.cam, bt = beatOf(t);

    if (cam === 'lib') {
      for (let i = 0; i < READERS.length; i++) { libReader(t, i); if (t >= M1) note(t, M1 + crowd[i].seed * 0.12, crowd[i], 1); }
      librarianPose(t); if (t >= M1) note(t, M1 + 0.05, librarian, 1);
      // chairs tip back as everyone springs up
      READERS.forEach((r) => { const c = lib.chairs[r.chair], u = K(t, [[LSTAND - 0.02, 0], [LSTAND + 0.3, 1]], (x) => x * x); const p0 = c.userData.p0; c.rotation.x = -1.35 * u; c.position.set(p0.x + Math.sign(r.x) * 0.28 * u, 0.2 * Math.sin(u * 1.35), p0.z); if (t > LSTAND + 0.3) impact(t, LSTAND + 0.3, 'lib', [p0.x + Math.sign(r.x) * 0.5, 0.15, p0.z], 0.55, false); });
      jolts.push([LSTAND + 0.3, 0.02]);
      // the book cart erupts
      lib.cartBooks.forEach((bk, i) => { const f = cartFly[i], age = t - (LSTAND + 0.05 + f.d), b0 = cartBooks0[i]; if (age <= 0) { bk.position.copy(b0.p); bk.rotation.copy(b0.r); return; } const ta = Math.min(age, 1.4); bk.position.set(b0.p.x + f.vx * ta, Math.max(0.03, b0.p.y + f.vy * ta - 4.9 * ta * ta), b0.p.z + f.vz * ta); bk.rotation.set(b0.r.x + f.spin * ta * 0.5, f.spin * ta * 0.3, b0.r.z + f.spin * ta); });
      lib.cart.rotation.z = -0.25 * Math.sin(clamp((t - LSTAND) / 0.5) * PI);
      impact(t, LSTAND + 0.05, 'lib', [LD.cart[0], 0.9, LD.cart[1]], 0.9);
      // the QUIET PLEASE sign topples forward
      const sf = K(t, [[SIGN_FALL, 0], [SIGN_FALL + 0.38, 1]], (x) => x * x);
      lib.sign.rotation.set(signRot0.x + 1.48 * sf, signRot0.y, signRot0.z);
      impact(t, SIGN_FALL + 0.38, 'lib', [LD.desk[0] + 0.95, 0.15, LD.desk[1] + 0.45 + 1.3], 0.8); jolts.push([SIGN_FALL + 0.38, 0.012]);
      lib.lampShades.forEach((s, i) => { s.rotation.z = t > LSTAND ? 0.25 * Math.sin(PI * (bt + i * 0.3)) : 0; });
    } else if (cam === 'or') {
      or.setECG(t, 120, t > OR_DROP ? 1 : 0.3);
      const capOR = (rig, k) => { wear(rig, { cap: true, mask: true, gloves: true }); outfit(rig, k % 2 ? 0x355e9a : 0x3f7f8a); };
      SURG.forEach((s, i) => { const rig = crowd[i]; capOR(rig, i); dancer(rig, 'or', t, { x: s.x, z: s.z, rotY: 0, seed: rig.seed, move: t < OR_DROP ? 'robot' : 'disco', mirror: i === 0, mouth: 'flat', lag: 0 }); });
      OR_BACK.forEach((s, i) => { const rig = crowd[3 + i]; capOR(rig, i + 1); dancer(rig, 'or', t, { x: s.x, z: s.z, rotY: 0, seed: rig.seed, move: s.move, mouth: 'flat' }); });
      // the patient's feet kick on every beat
      const kickL = Math.max(0, Math.sin(PI * bt)), kickR = Math.max(0, -Math.sin(PI * bt));
      or.footL.rotation.z = -0.5 * kickL; or.footR.rotation.z = -0.5 * kickR; or.footL.position.y = 0.08 + 0.05 * kickL; or.footR.position.y = 0.08 + 0.05 * kickR;
      // the surgical lamp sways on the beat, then spins at the drop
      const spin = K(t, [[OR_DROP, 0], [OR_DROP + 1.6, 1]], (x) => x);
      or.lamp.rotation.set(0.12 * Math.sin(PI * bt) * (1 - spin), spin * PI * 4, 0.3 * spin * Math.sin(t * 6) + 0.1 * Math.sin(PI * bt));
      // the instrument tray launches
      or.tray.position.set(0.75, 0, 0.12); or.tray.rotation.y = t > TRAY_T ? (t - TRAY_T) * 9 * Math.exp(-(t - TRAY_T) * 1.2) : 0;
      trayIns.forEach((c, i) => { const f = insFly[i], age = t - TRAY_T, b0 = trayIns0[i]; if (age <= 0) { c.position.copy(b0.p); c.rotation.copy(b0.r); return; } const ta = Math.min(age, 1.2); const y = b0.p.y + f.vy * ta - 4.9 * ta * ta; c.position.set(b0.p.x + f.vx * ta, Math.max(-1.0, y), b0.p.z + f.vz * ta); c.rotation.set(y > -1.0 ? f.spin * ta : 0, y > -1.0 ? f.spin * ta * 0.7 : 0.3 * i, 0); });   // lands on the floor (tray-top local: floor = −1.02)
      impact(t, TRAY_T, 'or', [0.75, 1.15, 0.12], 0.8); jolts.push([TRAY_T, 0.014], [OR_DROP, 0.008]);
      burst(t, OR_DROP + 0.05, V3(OFF.or[0] + 0.3, 2.6, OFF.or[2] - 0.8), 1.2, 1.0, 0.8, CF_COLORS, 140);
    } else if (cam === 'plane') {
      // seated passengers wave their arms in sync; window/rear seats are a mini crowd
      PAX.forEach((q, i) => { const sp = seatPos(q.r, q.c), rig = crowd[i]; dancer(rig, 'plane', t, { x: sp.x, z: sp.z + 0.02, rotY: 0, seated: PLD.seatY, seed: rig.seed, move: i % 4 === 1 ? 'ymca' : 'jump', mouth: i % 5 === 2 ? 'o' : 'smile' }); });
      MINI_PL.forEach((q, i) => { const sp = seatPos(q.r, q.c), S2 = swing(bt - miniPlane.seeds[i] * 0.1); miniPlane.set(i, sp.x, PLD.seatY - 0.05, sp.z + 0.02, 0, 0.95, 0.22 * S2, 0.95); });
      miniPlane.commit();
      // the attendant: the safety demo as a dance (disco points, alternating arms) in the aisle at row 2
      dancer(attendant, 'plane', t, { x: 0, z: -3.3, rotY: 0, seed: 0.2, move: 'disco', mirror: Math.floor(bt / 4) % 2 === 1, mouth: 'smile' });
      // oxygen masks drop at PL_DROP (back rows first) and swing to the beat
      MASKS.forEach((m, i) => {
        const d = PL_DROP + (8 - m.r) * 0.04, u = K(t, [[d, 0], [d + 0.22, 1]], (x) => 1 - (1 - x) * (1 - x));
        const L = 0.02 + 0.42 * u + 0.05 * Math.sin(Math.min(1, Math.max(0, t - d - 0.22) * 2) * PI) * Math.exp(-Math.max(0, t - d - 0.3) * 3), sw = u * 0.32 * Math.sin(PI * (bt - 0.5));
        const top = V3(m.x, 1.62, m.z), end = V3(m.x + Math.sin(sw) * L, 1.62 - Math.cos(sw) * L, m.z);
        _m4.compose(_p.copy(top).lerp(end, 0.5), _q.setFromEuler(_e.set(0, 0, sw)), _s.set(1, Math.max(0.001, L), 1)); maskTube.setMatrixAt(i, _m4);
        _m4.compose(_p.copy(end), _q.setFromEuler(_e.set(0, 0, sw)), _s.setScalar(u > 0.01 ? 1 : 0)); maskCup.setMatrixAt(i, _m4);
      });
      maskCup.instanceMatrix.needsUpdate = maskTube.instanceMatrix.needsUpdate = true;
      jolts.push([PL_DROP, 0.012]);
    } else if (cam === 'mkt') {
      mkt.setStock(lerp(1, 0.62, clamp((t - 20.2) / 5.2)));
      for (let j = 0; j < NC; j++) {
        const z = congaZ(t, j), x = congaX(z), rig = j === 0 ? manager : crowd[j - 1];
        dancer(rig, 'mkt', t, { x, z, rotY: Math.atan2(0.38 * 0.9 * Math.cos(z * 0.9 + 0.6), 1) * 0.6, seed: rig.seed ?? 0.4, move: 'groove', k: 0.5, lag: j * 0.04, mouth: j === 0 ? 'smile' : (j % 3 === 1 ? 'o' : 'smile'),
          then: (p, q, b) => {
            const n = Math.floor(b), inBar = mod(n, 4), kickK = inBar === 3 ? Math.sin(PI * clamp(fr(b) / 0.8)) : 0, side = mod(Math.floor(n / 4), 2) ? 1 : -1;
            const stepK = inBar < 3 ? fr(b) : 0;
            p.armA = j === 0 ? A(-2.7, 0.5 + 0.2 * swing(b), -0.3) : CONGA_A; p.armB = j === 0 ? A(-2.7, 0.5 - 0.2 * swing(b), -0.3) : CONGA_B;
            p.dist = (congaS(t) - S_AT0) * 1.0; p.speed = inBar < 3 ? 0.7 : 0;
            q.legs = side < 0 ? [{ fz: 0.1 * kickK, lift: 0.22 * kickK, splay: 0.06 + 0.62 * kickK }, { fz: 0, lift: 0, splay: 0.06 }] : [{ fz: 0, lift: 0, splay: 0.06 }, { fz: 0.1 * kickK, lift: 0.22 * kickK, splay: 0.06 + 0.62 * kickK }];
            if (inBar < 3) q.legs = null;
            q.sz = -side * 0.12 * kickK; void stepK;
          } });
      }
      // products fly off the shelves on each kick
      PROD.forEach((q, i) => {
        const K0 = KICKS[q.kick]; if (!K0) { _m4.compose(_p.set(0, -99, 0), _q.identity(), _s.set(0, 0, 0)); prods.setMatrixAt(i, _m4); return; }
        const age = t - (K0.t + 0.12 + q.j * 0.02), zj = congaZ(K0.t, q.j), side = K0.side;
        if (age < 0) { _m4.compose(_p.set(0, -99, 0), _q.identity(), _s.set(0, 0, 0)); prods.setMatrixAt(i, _m4); return; }
        const ta = Math.min(age, 1.2), y = Math.max(0.05, q.y0 + q.vy * ta - 4.9 * ta * ta);
        _m4.compose(_p.set(side * (1.45 - q.vx * ta), y, zj + q.vz * ta), _q.setFromEuler(_e.set(q.spin * ta, q.spin * ta * 0.5, y > 0.06 ? q.spin * ta * 0.3 : PI / 2)), _s.set(1, 1, 1)); prods.setMatrixAt(i, _m4);
      });
      prods.instanceMatrix.needsUpdate = true;
      KICKS.forEach((k) => { impact(t, k.t + 0.12, 'mkt', [k.side * 1.35, 0.9, congaZ(k.t, 3)], 0.7, false); jolts.push([k.t + 0.12, 0.006]); });
      // the can pyramid
      CANS.forEach((c, i) => { const age = t - PYR_T - 0.1; if (age <= 0) { _m4.compose(_p.set(c.x, c.y + 0.06, c.z), _q.identity(), _s.set(1, 1, 1)); } else { const ta = Math.min(age, 1.3); _m4.compose(_p.set(c.x + c.vx * ta * 0.4, Math.max(0.06, c.y + 0.06 + c.vy * ta - 4.9 * ta * ta), c.z + c.vz * ta), _q.setFromEuler(_e.set(c.spin * ta, 0, c.spin * ta * 0.6)), _s.set(1, 1, 1)); } cans.setMatrixAt(i, _m4); });
      cans.instanceMatrix.needsUpdate = true;
      impact(t, PYR_T + 0.1, 'mkt', [0.95, 0.45, -0.9], 1.1); jolts.push([PYR_T + 0.1, 0.022]);
    } else if (cam === 'pressA' || cam === 'pressB') {
      press.setFlashes(t, t > MOON0 ? 5 : 2.2);
      // the President: disco at the lectern → moonwalk to +x (facing −x, sliding backward) → spin + point
      { const p = basePose(); p.eyes = blink(t, 2);
        const mw = clamp((t - MOON0) / (MOON1 - MOON0)), turnIn = K(t, [[MOON0 - 0.3, 0], [MOON0, 1]]), turnOut = K(t, [[MOON1, 0], [MOON1 + 0.25, 1]]);
        const x = lerp(0.85 * turnIn, 2.0, mw), z = PD.speaker[1] + 0.05 + 0.35 * turnIn;
        if (t < MOON0 - 0.3 || cam === 'pressB') { dancer(prez, 'press', t, { x: cam === 'pressB' ? 2.0 : 0, z: cam === 'pressB' ? z : PD.speaker[1] + 0.05, rotY: 0, seed: 0.1, move: 'disco', mouth: 'smile', lag: 0, floor: 0.25, show: {} }); }
        else {
          Object.assign(p, { x, z, rotY: lerpAngle(lerpAngle(0, -PI / 2, turnIn), 2 * PI, turnOut), y: 0.25, floor: 0.25 }); p.mouth = 'o';
          p.armA = A(-0.25, 0.25, -0.9, 0.4); p.armB = A(-0.25, 0.25, -0.9, -0.4); p.lean = 0.08; p.headPitch = 0.1;
          if (turnOut > 0) { p.armB = mixArm(p.armB, PT_UP, turnOut); p.armA = mixArm(p.armA, HIP_A, turnOut); p.mouth = 'smile'; }
          show(prez, 'press', p);
          const ph = (t - MOON0) / BEAT, a = mod(Math.floor(ph), 2), f = fr(ph);
          if (mw < 1) post(prez, p, { legs: a ? [{ fz: 0.12 - 0.24 * f, lift: 0, splay: 0.05 }, { fz: 0.05, lift: 0.07, splay: 0.05 }] : [{ fz: 0.05, lift: 0.07, splay: 0.05 }, { fz: 0.12 - 0.24 * f, lift: 0, splay: 0.05 }] });
        }
      }
      if (cam === 'pressA') prez.root.visible = true; else prez.root.visible = false;
      // the press corps: seated robot → everybody up → chairs topple row by row
      chairs.forEach((c) => { const u = K(t, [[rowTip(c.row), 0], [rowTip(c.row) + 0.3, 1]], (x) => x * x); c.g.rotation.x = 1.3 * u; c.g.position.set(c.x, 0.2 * Math.sin(u * 1.3), c.z + 0.3 * u); });
      reporters.forEach((ci, k) => {
        const c = chairs[ci], rig = crowd[k], up = t > PRESS_UP;
        const o = { x: c.x, z: c.z - 0.02, rotY: PI, seed: rig.seed, move: up ? (t > rowTip(3) + 0.3 ? 'jump' : 'robot') : 'robot', mouth: up ? 'smile' : 'flat', lag: 0 };
        if (!up) o.seated = 0.45;
        dancer(rig, 'press', t, o);
      });
      for (let r = 0; r < 4; r++) { impact(t, rowTip(r) + 0.3, 'press', [r % 2 ? -1.8 : 1.8, 0.4, PD.rows[r] + 0.35], 0.9); jolts.push([rowTip(r) + 0.3, r === 3 ? 0.022 : 0.01]); }
      if (cam === 'pressA') { const lc = V3(OFF.press[0] + 0.0, 2.6, OFF.press[2] - 2.6); burst(t, MOON1 + 0.1, lc, 1.6, 1.5, 0.9, CF_COLORS, 160); }
    } else if (cam === 'fun') {
      // pallbearers (black suits + shades) bounce the coffin; toss at TOSS0, catch at TOSS1
      const tossU = clamp((t - TOSS0) / (TOSS1 - TOSS0)), lift = t > TOSS0 && t < TOSS1 ? 1.0 * Math.sin(PI * tossU) : 0;
      const S2 = swing(bt), P2 = pulse(bt), groupX = 0.12 * S2, bounce = -0.06 * P2;
      PB.forEach((b, i) => {
        const rig = crowd[i]; outfit(rig, 0x1d1d22, 0x1d1d22); wear(rig, { shades: true });
        dancer(rig, 'fun', t, { x: b.x + groupX, z: b.z, rotY: 0, seed: rig.seed, move: 'groove', k: 0.9, lag: 0, mouth: 'smile',
          then: (p, q) => {
            const inner = b.s < 0 ? 'armB' : 'armA', outer = b.s < 0 ? 'armA' : 'armB';
            p[inner] = A(-2.95, 0.15, -0.95, b.s < 0 ? -0.5 : 0.5);
            p[outer] = A(-0.6 - 0.6 * P2, 0.55 + 0.3 * P2, -1.2, b.s < 0 ? 0.4 : -0.4);
            if (t > TOSS0 - 0.15 && t < TOSS1 + 0.2) { p.armA = UP_A; p.armB = UP_B; p.rotY = 2 * PI * clamp((t - TOSS0) / (TOSS1 - TOSS0)); p.y += 0.08 * Math.sin(PI * tossU); }
            if (t > TOSS1 && t < TOSS1 + 0.35) p.crouch = 0.12 * (1 - (t - TOSS1) / 0.35);
            p.headYaw = 0.15 * S2; q.sz = 0.08 * S2;
          } });
      });
      coffin.visible = true;
      coffin.position.set(groupX, 1.56 + bounce + lift, 1.65); coffin.rotation.set(0, t > TOSS0 && t < TOSS1 ? 2 * PI * tossU : 0, 0.05 * S2);
      impact(t, TOSS1, 'fun', [0, 1.9, 1.65], 1.1); jolts.push([TOSS1, 0.02]);
      MOURN.forEach((m, k) => { const rig = crowd[6 + k]; outfit(rig, 0x24242a, 0x24242a); const upT = 32.6 + k * 0.05;
        if (t < upT) dancer(rig, 'fun', t, { x: m.x, z: m.z, rotY: PI, seated: FD.seat, seed: rig.seed, move: 'shimmy', mouth: 'smile' });
        else dancer(rig, 'fun', t, { x: m.x, z: m.z + 0.1, rotY: lerpAngle(PI, 0, K(t, [[upT, 0], [upT + 0.4, 1]])), seed: rig.seed, move: k % 2 ? 'shimmy' : 'groove', mouth: 'smile' }); });
      dancer(priest, 'fun', t, { x: 1.55, z: -1.7, rotY: -0.3, seed: 0.6, move: 'twist', mouth: 'smile' });
      burst(t, TOSS1, V3(OFF.fun[0], 1.8, OFF.fun[2] + 1.6), 2.0, 3.0, 1.0, PETAL_COLORS, 260);
      fun.wreaths.forEach((w, i) => (w.rotation.z = 0.06 * Math.sin(PI * (bt + i * 0.5))));
    } else if (cam === 'kit') {
      // Gary body-rolls behind the table: bowl in his left hand, spoon in his right; every spoonful misses
      const flip = clamp((t - FLIP0) / (FLIP1 - FLIP0));
      const gp = dancer(gary, 'kit', t, { x: GARY_K[0], z: GARY_K[1], rotY: 0, seed: 0.5, move: 'bodyroll', lag: 0, mouth: 'o',
        then: (p, q, b) => {
          const f = fr(b), up = Math.sin(PI * clamp(f / 0.7));
          p.armA = t < FLIP0 ? A(-0.85, 0.12, -1.55, 0.6) : mixArm(A(-0.85, 0.12, -1.55, 0.6), A(-2.6, 0.3, -0.4), K(t, [[FLIP0 - 0.1, 0], [FLIP0 + 0.1, 1], [FLIP0 + 0.6, 0]]));
          p.armB = mixArm(A(-0.75, 0.0, -1.55, -0.7), A(-1.2, 0.0, -2.35, -0.75), up);
          if (t > FLIP1) { p.mouth = 'flat'; p.headPitch = 0.0; p.armA = REST; p.armB = A(-0.75, 0.0, -1.55, -0.7); }
          p.headYaw = 0.3 * Math.sin(PI * b);
        } });
      void gp;
      gary.root.updateMatrixWorld(true);
      const handA = gary.arms[0].hand.getWorldPosition(V3(0, 0, 0)), handB = gary.arms[1].hand.getWorldPosition(V3(0, 0, 0));
      spoon.visible = true; spoon.position.copy(handB).add(V3(0, 0.0, 0.03)); spoon.rotation.set(-0.5, 0, 0.6);
      bowl.visible = true;
      if (t < FLIP0) { bowl.position.copy(handA).add(V3(0, 0.03, 0.05)); bowl.rotation.set(0, 0, 0); }
      else { const head = gary.headG.localToWorld(V3(0, 0.33, 0)), from = handA.clone().add(V3(0, 0.03, 0.05)); bowl.position.lerpVectors(from, head, smooth(flip)); bowl.position.y += 0.55 * Math.sin(PI * flip); bowl.rotation.set(PI * smooth(flip), 0, 0.3 * Math.sin(PI * flip)); if (flip >= 1) { bowl.position.copy(head).add(V3(0, 0.02, 0)); bowl.rotation.set(PI, 0, 0.1 + 0.05 * Math.sin(PI * bt)); } }
      impact(t, FLIP1, 'kit', [GARY_K[0], 2.0, GARY_K[1] + 0.2], 0.9); jolts.push([FLIP1, 0.018]);
      // cereal flies off the spoon on every beat (confetti pool, cereal colors), then rains after the flip
      if (t < FLIP0) { const b0 = Math.floor(bt - 0.55) + 0.55, tb = M1 + b0 * BEAT; burst(t, tb, V3(handB.x, handB.y + 0.15, handB.z + 0.05), 0.35, 1.8, 0.45, CEREAL_COLORS, 40); }
      else burst(t, FLIP1, V3(OFF.kit[0] + GARY_K[0], 2.3, OFF.kit[2] + GARY_K[1] + 0.1), 0.5, 0.5, 0.45, CEREAL_COLORS, 160);
      cbox.position.y = 0.75 + 0.05 * Math.max(0, Math.sin(2 * PI * bt)); cbox.rotation.z = 0.06 * Math.sin(PI * bt);
      dancer(wife, 'kit', t, { x: -0.55, z: -1.85, rotY: 0.25, seed: 0.3, move: 'twist', mouth: 'smile' });
      dancer(kid, 'kit', t, { x: 1.05, z: -1.7, rotY: -0.3, seed: 0.7, move: 'jump', mouth: 'smile', show: { s: 0.62 } });
    } else if (cam === 'stad') {
      stad.setScreen(t, bt);
      const crouch = K(t, [[ST_CROUCH, 0], [ST_JUMP - 0.05, 1], [ST_JUMP + 0.05, 0]]), bigAir = t > ST_JUMP && t < ST_LAND ? Math.sin(PI * (t - ST_JUMP) / (ST_LAND - ST_JUMP)) : 0;
      stad.updateFans(t, (f) => {
        if (f.field && f.x < SD.pit.x0 + 1.4 && Math.abs(f.z - 0.4) < 1.8) return { y: -60 };   // replaced by full rigs
        const b = bt - f.seed * 0.12, air = Math.sin(PI * fr(b));
        if (t > ST_CROUCH && t < ST_LAND + 0.1) return { y: -0.25 * crouch + 0.9 * bigAir, arms: 1, sway: 0 };
        const wave = f.field ? 1 : clamp(0.5 + 0.5 * Math.sin(f.theta * 3 - t * 4));
        return { y: 0.16 * air * (f.field ? 1 : 0.6), arms: f.field ? 0.6 + 0.4 * air : wave, sway: 0.12 * swing(b) };
      });
      FRONT.forEach((q, i) => { const rig = crowd[i]; dancer(rig, 'stad', t, { x: q.x, z: q.z, rotY: -PI / 2, seed: rig.seed, move: 'jump', mouth: i % 2 ? 'o' : 'smile', lag: 0,
        then: (p) => { if (t > ST_CROUCH && t < ST_LAND + 0.2) { p.y = -0.0 + 0.9 * bigAir; p.crouch = 0.25 * crouch; p.armA = UP_A; p.armB = UP_B; p.mouth = 'o'; } } }); });
      stad.beams.forEach((g, i) => { g.visible = Math.abs(g.position.z) > 3; g.rotation.set(0.35 * Math.sin(t * 1.3 + i), 0, 0.75 + 0.2 * Math.sin(t * 0.9 + i * 1.7)); });   // the two over the camera would wash the lens
      for (let k = 0; k < 3; k++) impact(t, ST_LAND + k * 0.03, 'stad', [SD.pit.x0 + 3.5 + k * 2.5, 0.2, -2.5 + k * 2.6], 1.1, false);
      jolts.push([ST_LAND, 0.06], [ST_LAND + 0.25, 0.03]);
      burst(t, ST_LAND - 0.1, V3(OFF.stad[0] + SD.stageX + 12, 9, OFF.stad[2] - 1), 9, 5, 1.6, CF_COLORS, CF);
    } else if (cam === 'off') {
      // HR stands behind the desk: the sprinkler. Gary: groove → the worm across the floor → up, arms high. HIRED.
      dancer(hr, 'off', t, { x: OFD.boss[0] + 0.15, z: -2.05, rotY: 0.25, seed: 0.4, move: t < STAMP ? 'sprinkler' : 'groove', mouth: t < WORM1 ? 'flat' : 'o',
        then: (p) => { if (t > STAMP) { p.armB = A(-1.15, 0.25, -1.3, -0.5); p.armA = A(-1.15, 0.25, -1.3, 0.5); p.mouth = 'smile'; } } });
      if (t < WORM0 - 0.35) dancer(gary, 'off', t, { x: 1.05, z: 0.35, rotY: PI + 0.5, seed: 0.5, move: 'robot', lag: 0, mouth: 'flat' });
      else if (t < WORM1) {
        const u = clamp((t - WORM0) / (WORM1 - WORM0)), drop = K(t, [[WORM0 - 0.35, 0], [WORM0, 1]]), ph = 2 * PI * (t - WORM0) / BEAT;
        const p = basePose(); p.eyes = blink(t, 5); p.mouth = 'o';
        const C = [lerp(1.2, -0.45, u), lerp(HC, 0.2 + 0.1 * Math.max(0, Math.sin(ph)), drop), 0.45], tilt = lerp(0, PI / 2 - 0.22 * Math.sin(ph), drop);
        p.armA = PUSH_A; p.armB = PUSH_B; p.headPitch = -0.5 * drop;
        const e = new THREE.Euler(tilt, -PI / 2, 0, 'YXZ'), c = V3(0, HC, 0).applyEuler(e);
        Object.assign(p, { x: C[0] - c.x, y: C[1] - c.y, z: C[2] - c.z, rotY: -PI / 2, floor: -3 });
        show(gary, 'off', p, { tilt });
        impact(t, WORM0, 'off', [1.2, 0.15, 0.45], 0.7);
      } else dancer(gary, 'off', t, { x: -0.45, z: 0.45, rotY: 0.6, seed: 0.5, move: 'jump', lag: 0, mouth: 'smile' });
      jolts.push([WORM0, 0.015]);
      papers.forEach((s, i) => { const q = PAP[i], age = t - q.t0; if (age < 0) { s.position.set(q.x0, OFD.deskTop + 0.01 + i * 0.003, q.z0); s.rotation.set(-PI / 2, 0, i * 0.3); return; } const ta = Math.min(age, 2.5), y = Math.max(0.01, OFD.deskTop + q.vy * Math.min(ta, 0.35) - 0.55 * Math.max(0, ta - 0.35)); s.position.set(q.x0 + q.vx * Math.min(ta, 1.4) * 0.5 + 0.1 * Math.sin(t * 3 + i), y, q.z0 + q.vz * Math.min(ta, 1.4) * 0.5); s.rotation.set(-PI / 2 + (y > 0.02 ? 0.6 * Math.sin(t * q.spin) : 0), 0, i + ta * q.spin * 0.3); });
      if (t > STAMP) { hr.root.updateMatrixWorld(true); const h = hr.spine.localToWorld(V3(-0.05, 0.42, 0.32)); hired.visible = true; hired.position.copy(h); hired.rotation.set(-0.1, 0.42, 0.04); hired.scale.setScalar(1.35 * (1 + 0.25 * Math.exp(-(t - STAMP) * 8))); }
      impact(t, STAMP, 'off', [0.4, 1.6, -1.3], 0.8); jolts.push([STAMP, 0.012]);
    } else if (cam === 'street') {
      street.aimSun(5, -1.5, 9); street.cart.visible = false; street.trash.visible = false;
      let sea = SEASON_T[0][1]; for (const [ts, name] of SEASON_T) if (t >= ts) sea = name;
      street.setSeason(sea, t, [5, 0]);
      const fitK = K(t, [[53.0, 0], [56.6, 1]], (x) => x);
      dancer(gary, 'street', t, { x: GYM.x + 1.15, z: -1.45, rotY: 0, seed: 0.5, move: t > 56.6 ? 'disco' : 'groove', floor: SIDEWALK_H, lag: 0, mouth: t > 56.6 ? 'smile' : 'o',
        then: (p) => { p.belly = lerp(1.15, 0, fitK); if (t > 56.7) { p.armA = FLEX_A; p.armB = FLEX_B; p.mouth = 'smile'; } } });
      if (garyTorso) garyTorso.scale.set(lerp(1.12, 1.42, fitK), lerp(1, 1.08, fitK), lerp(0.78, 0.86, fitK));
      garyArmMeshes.forEach((m) => m.scale.set(lerp(1, 1.55, fitK), 1, lerp(1, 1.55, fitK)));
      const cu = K(t, [[CLOSED_T - 0.3, 0], [CLOSED_T, 1]], (x) => x * x);
      closed.position.set(GYM.x - 0.2, lerp(3.6, 1.95, cu), GYM.z + 0.06); closed.rotation.set(0, 0, lerp(0.5, -0.05, cu)); closed.visible = t > CLOSED_T - 0.3;
      impact(t, CLOSED_T, 'street', [GYM.x, 1.2, GYM.z + 0.4], 1.1); jolts.push([CLOSED_T, 0.016]);
      // two neighbors dance the same routine beside him (in sync)
      [[GYM.x - 1.35, -1.25], [GYM.x + 2.45, -1.2]].forEach(([x, z], i) => { const rig = crowd[i]; dancer(rig, 'street', t, { x, z, rotY: i ? -0.25 : 0.25, seed: rig.seed, move: t > 56.6 ? 'disco' : 'groove', mirror: i === 0, floor: SIDEWALK_H, lag: 0, mouth: 'smile', then: (p) => { if (t > 56.7) { p.armA = FLEX_A; p.armB = FLEX_B; } } }); });

    } else if (cam === 'roof') {
      const dusk = K(t, [[59.0, 0], [66.0, 1]], (x) => x);
      city.setShadowFocus(RC[0], RC[2], 14);
      city.setTime({ day: lerp(1, 0.18, dusk), golden: 1, power: 1, milky: 0, moon: 0.5 });
      bulbLight.intensity = 6 * clamp((dusk - 0.3) / 0.4);
      // Gary + wife slow-dance, turning slowly; the kid and neighbors dance around them
      const ang = 0.35 * (t - 58);
      const cx = RC[0], cz = RC[2];
      for (const [rig, s] of [[gary, 1], [wife, -1]]) {
        const p = basePose(); p.eyes = t > 60.5 ? 'closed' : blink(t, s > 0 ? 1 : 4);
        Object.assign(p, { x: cx + s * 0.2 * Math.sin(ang), z: cz + s * 0.2 * Math.cos(ang), rotY: ang + (s > 0 ? PI : 0), y: ROOF_Y, floor: ROOF_Y });
        p.armA = s > 0 ? SLOW_A : A(-1.05, 0.35, -1.25, 0.6); p.armB = s > 0 ? SLOW_B : A(-0.95, 0.55, -0.85, -0.4); p.mouth = 'smile'; p.lean = 0.05;
        p.y += -0.02 * pulse(bt); p.headRoll = 0.08 * swing(bt * 0.5);
        p.x += OFF.city[0]; applyPose(rig, p); rig.root.visible = true; post(rig, p, { sz: 0.05 * swing(bt * 0.5), legs: stepTouch(bt * 0.5, 0.5) });
      }
      dancer(kid, 'city', t, { x: cx + 1.3, z: cz + 0.9, rotY: -0.5, seed: 0.7, move: 'jump', floor: ROOF_Y, mouth: 'smile', show: { s: 0.62, lift: 0 }, then: (p) => { p.y = ROOF_Y / 0.62 + (p.y - ROOF_Y); p.floor = ROOF_Y / 0.62; } });
      const NB = [[-13.6, 9.4, 'disco'], [-9.2, 9.5, 'ymca'], [-14.0, 12.6, 'twist'], [-9.0, 12.4, 'groove']];
      NB.forEach(([x, z, mv], i) => { const rig = crowd[i]; dancer(rig, 'city', t, { x, z, rotY: Math.atan2(cx - x, cz - z), seed: rig.seed, move: mv, floor: ROOF_Y, mouth: 'smile' }); });
      // the street below: one dance floor (mini crowd)
      STREET_SPOTS.forEach((q, i) => { const b = bt - q.s * 0.1, air = Math.sin(PI * fr(b)); miniStreet.set(i, q.x, 0.14 * (Math.abs(q.x) > 4 ? 1 : 0) + 0.12 * air, q.z, Math.atan2(-12 - q.x, 13 - q.z), 0.5 + 0.5 * air, 0.12 * swing(b), 1.0); });
      miniStreet.commit();
      if (t > 63.0) burst(t, 63.0, V3(RC[0], ROOF_Y + 4.5, RC[2] - 1), 4, 2, 1.0, CF_COLORS, 220, ROOF_Y + 0.02);
    }

    // camera (local → world) + impact jolts
    const c = CAMS[cam], o = OFF[S];
    let u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    if (c.ease) u = clamp((t - c.ease[0]) / (c.ease[1] - c.ease[0]));
    const e = c.ease ? smooth(u) : u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    for (const [m, k0] of jolts) if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70 + m), P[1] + k * Math.sin(t * 55 + m), P[2] + k * 0.5 * Math.sin(t * 63)]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200): every move on its own figure, 4 phases
  const LINE = ['groove', 'disco', 'robot', 'jump', 'ymca', 'twist', 'shimmy', 'sprinkler', 'bodyroll'];
  const ui = typeof document !== 'undefined' ? document.getElementById('ui') : null;
  function lineup(t) {
    if (ui) ui.style.visibility = 'hidden';
    for (const [k, r] of Object.entries(ROOTS)) r.visible = k === 'off'; cur = 'off';
    scene.fog = null; studio.camera.far = 60; hideAll();
    const half = t >= 210 ? 1 : 0, ph = (t - (half ? 210 : 200)) * 0.25;   // 200..203 (moves 0–4) / 210..213 (moves 5–8): beat phase 0, .25, .5, .75 (+1 per 4 s)
    LINE.slice(half * 5, half * 5 + 5).forEach((mv, i) => { const rig = crowd[i]; const p = basePose(); Object.assign(p, { x: -1.4 + i * 0.7, z: 1.0, rotY: 0 }); const q = MOVES[mv](p, ph, {}); p.mouth = 'smile'; show(rig, 'off', p); post(rig, p, q); });
    setCamera([OFF.off[0], 1.25, 6.6], [OFF.off[0], 1.15, 1.0], 44, 0, 0);
  }
  return { update: (t) => { if (t >= 200) return lineup(t); if (ui) ui.style.visibility = 'visible'; update(t); } };
}
