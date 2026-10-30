// VIDEO 042 — "What if your belly button turned into a portal?"  (tone: FUNNY POV escalation, unhinged lane / weird tier, @ed._.studios)
// Not a doubling ladder (the account had five in a row): one "you", one glowing swirl where the belly button was, and an escalation
// of things going IN and coming OUT. The belly is only ever a stylized cartoon: the T-shirt rolled up to the ribs, a plain skin
// patch, and a swirling purple/cyan disc where the navel would be. Nothing else.
// HUD = THINGS THROUGH YOUR BELLY BUTTON (rolls on every item, the same event times as make_story.py COUNT) + DAY · clock + a stat line.
// 68 s, 19 shots, 10 sets parked at offsets in one scene (one visible per shot).
//
// Sources (checked Oct 29 2026):
//   ~67 kinds of bacteria per navel — Belly Button Biodiversity project, NC State (Hulcr et al. 2012, PLoS ONE): an average of 67
//     bacterial phylotypes per belly button (range 29–107), 2,368 across the volunteers. news.ncsu.edu/2012/11/wms-belly-button-biodiversity/
//     (they are "phylotypes"; the HUD says "kinds", not "species", to stay honest)
//   navel lint is mostly clothing fibers — Georg Steinhauser, Vienna University of Technology (TU Wien), "The nature of navel fluff",
//     Medical Hypotheses 2009 (503 lint samples: cotton fibers from the shirt + skin cells, sweat, dust; belly hair guides them in)
//   Earth → Mars takes about 7–10 months — NASA, "We Asked a NASA Expert: How long does it take to get to Mars?"
//
// Shot list (seconds)                    | set      | what happens
//  0.0– 3.6 couchA  title                | living   | 3 AM, asleep sitting up on the sofa; a purple glow pulses under the T-shirt, lights the chin; eyes open, look down
//  3.6– 6.3 couchB  premise              | living   | the shirt goes up: a swirling portal where the belly button was (4.2 braam), the room lights purple
//  6.3– 8.8 couchC  the lint             | living   | you pick out a lint ball — it slips and is sucked in
//  8.8–12.4 paris   it lands             | paris    | a café table under the Eiffel Tower: a tiny portal over a latte, the lint plops into the foam; she stares
// 12.4–15.2 fallA   keys, remote         | living   | morning: the keys and the remote are yanked in; the cat on the rug wiggles
// 15.2–18.0 fallB   the cat              | living   | the cat pounces — front half gone; you grab it and pull it out: it has a fish in its mouth
// 18.0–21.2 laundA  pigeon + socks       | laundro  | a pigeon bursts out over the waiting row; then a fountain of lost socks rains on everyone
// 21.2–24.0 laundB  the Pacific          | laundro  | a jet of ocean water blasts you and your chair back; neighbors soaked, a fish flops
// 24.0–26.4 lawnA   a tourist            | suburb   | a tourist squeezes out onto your lawn, looks around, takes your photo
// 26.4–30.0 lawnB   mariachi             | suburb   | five mariachis pop out one by one, land in a row and play; neighbors clap
// 30.0–35.6 lab     tests                | clinic   | lab coats: a rubber duck dropped in falls from a ceiling portal onto a scientist's head; a tape measure follows
// 35.6–38.4 pressA  press conference     | podium   | you beside the lectern, shirt up, a storm of camera flashes
// 38.4–41.0 pressB  too close            | podium   | reverse on the press: a mic and every paper are sucked in; the mic drops out onto a back-row head
// 41.0–44.2 lineA   a turn               | street   | a queue on the sidewalk; people in swim goggles dive in head-first and shrink away
// 44.2–47.0 lineB   the line             | street   | long lens down the line: everyone shuffles forward in sync, the line goes round the block
// 47.0–49.6 pad     NASA                 | launch   | strapped to a board on the pad, engineers push a tiny rover in
// 49.6–52.4 mars    Mars                 | mars     | a portal opens over Mars, the rover drops out and bounces
// 52.4–56.6 night   a cookie             | living   | night: the portal glows warm gold; a wrinkly hand offers a cookie; you know that cookie; you fold into yourself
// 56.6–68.0 gma     Grandma's            | kitchen  | you tumble out in Grandma's sunny kitchen; she drops the oven mitt; a long hug; Grandpa laughs. End card 63.6
import * as THREE from 'three';
import { K, clamp, lerp, rng, mat, mk, canvasTex, easeIO } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makeCat } from '@engine/props.js';
import { makePigeon } from '@engine/build/toon.js';
import { makeTape } from '@engine/haul.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildParis } from '@engine/sets/paris.js';
import { buildLaundromat, DIMS as LD } from '@engine/sets/laundromat.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildClinic } from '@engine/sets/clinic.js';
import { buildPodium } from '@engine/sets/podium.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildLaunch, makeFalcon, makeSpritePool } from '@engine/sets/tech.js';
import { buildMars } from '@engine/sets/mars.js';
import { buildKitchen } from '@engine/sets/kitchen.js';

const PI = Math.PI;
const SIT = HIP_H - 0.17;
const HC = 0.9;
// every item through the portal [time, count] — keep in sync with make_story.py COUNT + make_cues.py
export const EV = { lint: 7.6, lintOut: 9.75, keys: 12.95, remote: 14.15, cat: 15.85, catOut: 16.95, pigeon: 18.55, socks: 20.0, ocean: 21.7,
  tourist: 24.45, band: [26.6, 27.0, 27.4, 27.8, 28.2], duck: 31.0, duckOut: 31.15, bonk: 31.35, tape: 32.5, tapeOut: 33.0,
  mic: 38.75, papers: 38.95, micOut: 39.7, micBonk: 39.95, dives: [41.85, 43.05], shuffle: 44.3, rover: 48.35, roverOut: 49.95, roverLand: 50.45,
  cookie: 53.05, take: 53.75, fold: 55.6, foldIn: 56.1, arrive: 56.85, land: 57.25, hug: 58.9 };
const OFF = { liv: [2000, 0, 0], paris: [6000, 0, 0], laund: [8000, 0, 0], sub: [10000, 0, 0], lab: [12000, 0, 0], press: [14000, 0, 0],
  street: [16000, 0, 0], pad: [20000, 0, 0], mars: [26000, 0, 0], kit: [30000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.6, cam: 'couchA', set: 'liv' },
  { t0: 3.6, t1: 6.3, cam: 'couchB', set: 'liv' },
  { t0: 6.3, t1: 8.8, cam: 'couchC', set: 'liv' },
  { t0: 8.8, t1: 12.4, cam: 'paris', set: 'paris' },
  { t0: 12.4, t1: 15.2, cam: 'fallA', set: 'liv' },
  { t0: 15.2, t1: 18.0, cam: 'fallB', set: 'liv' },
  { t0: 18.0, t1: 21.2, cam: 'laundA', set: 'laund' },
  { t0: 21.2, t1: 24.0, cam: 'laundB', set: 'laund' },
  { t0: 24.0, t1: 26.4, cam: 'lawnA', set: 'sub' },
  { t0: 26.4, t1: 30.0, cam: 'lawnB', set: 'sub' },
  { t0: 30.0, t1: 35.6, cam: 'lab', set: 'lab' },
  { t0: 35.6, t1: 38.4, cam: 'pressA', set: 'press' },
  { t0: 38.4, t1: 41.0, cam: 'pressB', set: 'press' },
  { t0: 41.0, t1: 44.2, cam: 'lineA', set: 'street' },
  { t0: 44.2, t1: 47.0, cam: 'lineB', set: 'street' },
  { t0: 47.0, t1: 49.6, cam: 'pad', set: 'pad' },
  { t0: 49.6, t1: 52.4, cam: 'mars', set: 'mars' },
  { t0: 52.4, t1: 56.6, cam: 'night', set: 'liv' },
  { t0: 56.6, t1: 68.0, cam: 'gma', set: 'kit' },
];
// cameras: keys = [[t, pos, aim], …] in the set's LOCAL coords (eased between keys); fov
export const CAMS = {
  couchA: { keys: [[0, [1.71, 1.2, -0.72], [1.8, 1.04, -2.05]], [3.6, [1.73, 1.19, -0.9], [1.8, 1.04, -2.05]]], fov: 46 },
  couchB: { keys: [[3.6, [2.38, 1.27, -0.72], [1.8, 1.05, -2.0]], [6.3, [2.3, 1.24, -0.88], [1.8, 1.05, -2.0]]], fov: 46 },
  couchC: { keys: [[6.3, [1.45, 1.16, -0.75], [1.8, 1.07, -2.0]], [8.8, [1.5, 1.14, -0.9], [1.8, 1.07, -2.0]]], fov: 46 },
  paris:  { keys: [[8.8, [1.88, 1.3, 60.7], [1.6, 1.16, 57.9]], [12.4, [1.82, 1.28, 60.3], [1.6, 1.14, 57.9]]], fov: 44 },
  fallA:  { keys: [[12.4, [0.98, 1.22, 0.12], [1.72, 0.64, -1.8]], [15.2, [1.06, 1.18, -0.12], [1.72, 0.64, -1.8]]], fov: 50 },
  fallB:  { keys: [[15.2, [1.6, 1.05, -0.7], [1.8, 0.98, -1.95]], [18.0, [1.64, 1.06, -0.85], [1.8, 1.0, -1.95]]], fov: 46 },
  laundA: { keys: [[18.0, [0.35, 1.25, 3.75], [0, 0.98, 0.9]], [21.2, [0.3, 1.22, 3.4], [0, 0.98, 0.9]]], fov: 54 },
  laundB: { keys: [[21.2, [3.5, 1.2, 1.6], [0, 0.9, 1.15]], [24.0, [3.7, 1.22, 1.55], [0, 0.87, 1.15]]], fov: 56 },
  lawnA:  { keys: [[24.0, [0.8, 1.3, -1.0], [-0.3, 1.3, -3.9]], [26.4, [0.85, 1.27, -1.25], [-0.3, 1.3, -3.9]]], fov: 50 },
  lawnB:  { keys: [[26.4, [0.15, 1.75, 2.0], [0, 1.05, -3.1]], [30.0, [0.05, 1.72, 2.35], [0, 1.05, -3.1]]], fov: 52 },
  lab:    { keys: [[30.0, [-0.02, 1.47, 2.85], [-0.1, 1.55, -0.4]], [35.6, [-0.06, 1.45, 2.55], [-0.1, 1.55, -0.4]]], fov: 56 },
  pressA: { keys: [[35.6, [0.5, 1.5, -0.45], [0.66, 1.42, -3.0]], [38.4, [0.55, 1.48, -0.8], [0.66, 1.42, -3.0]]], fov: 42 },
  pressB: { keys: [[38.4, [0.5, 1.62, -2.35], [0.35, 1.3, 2.0]], [41.0, [0.5, 1.6, -2.15], [0.35, 1.35, 2.3]]], fov: 54 },
  lineA:  { keys: [[41.0, [0.55, 1.68, 1.75], [0.45, 1.72, -1.5]], [44.2, [0.62, 1.68, 1.5], [0.5, 1.72, -1.5]]], fov: 50 },
  lineB:  { keys: [[44.2, [-0.6, 1.75, 0.6], [8, 1.35, -1.5]], [47.0, [-0.4, 1.75, 0.5], [8, 1.35, -1.5]]], fov: 30 },
  pad:    { keys: [[47.0, [0.85, 1.62, 2.75], [0.05, 1.42, 0]], [49.6, [0.8, 1.58, 2.35], [0.05, 1.38, 0]]], fov: 50 },
  mars:   { keys: [[49.6, [0.9, 0.6, 4.2], [0, 0.95, 0.6]], [52.4, [1.15, 0.52, 3.8], [0, 0.8, 0.8]]], fov: 48 },
  night:  { keys: [[52.4, [1.5, 1.18, -0.72], [1.8, 1.04, -2.05]], [55.4, [1.56, 1.15, -0.92], [1.8, 1.02, -2.05]], [56.6, [1.45, 1.25, -0.2], [1.8, 0.95, -2.05]]], fov: 46 },
  gma:    { keys: [[56.6, [0.0, 1.5, 4.2], [-0.3, 1.2, 0.6]], [58.8, [0.3, 1.5, 4.0], [0.4, 1.2, 0.4]], [68.0, [0.35, 1.45, 3.4], [0.4, 1.2, 0.4]]], fov: 52 },
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
const HEM_A = A(-0.05, 0.3, -1.75, 0.0), HEM_B = A(-0.05, 0.3, -1.75, 0.0);       // holding the shirt rolled up at the ribs
const PICK_B = A(-0.38, -0.02, -1.35, -0.6);                                          // fingers at the belly
const BACK_A = A(0.9, 0.6, -0.2, 0.3), BACK_B = A(0.9, 0.6, -0.2, -0.3);             // flung backward
const UP_A = A(-2.7, 0.3, -0.25), UP_B = A(-2.7, 0.3, -0.25);                        // arms over the head (diving)
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);
const HOLD_A = A(-0.95, 0.05, -0.9, 0.5), HOLD_B = A(-0.95, 0.05, -0.9, -0.5);       // holding something out in front
const OUT_A = A(-1.1, 0.25, -0.35, 0.2), OUT_B = A(-1.1, 0.25, -0.35, -0.2);         // arms out (for a hug)
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);
const CAM_A = A(-1.0, 0.1, -2.2, 0.6), CAM_B = A(-1.0, 0.1, -2.2, -0.6);             // a camera at the eye
const CLIP_A = A(-0.7, 0.1, -1.5, 0.6), PEN_B = A(-0.75, 0.0, -1.6, -0.7);           // clipboard + pen
const POINT_B = A(-1.45, 0.3, -0.1, -0.2);
const MIC_B = A(-1.25, 0.1, -0.35, -0.2);                                             // mic thrust forward
const HEAD_B = A(-1.6, 0.45, -2.3, -0.6);                                             // rubbing the head
const SIP_B = A(-1.3, 0.25, -2.35, -0.5), CUP_B = A(-0.55, 0.2, -1.6, -0.5);
const CHEST_B = A(-0.05, 0.2, -2.0, -0.9);
const GUIT_A = A(-0.55, 0.15, -1.55, 0.7), STRUM_B = (t) => A(-0.35 - 0.12 * Math.sin(t * 14), 0.15, -1.25, -0.4);
const TRUMP_A = A(-1.2, 0.1, -1.9, 0.5), TRUMP_B = A(-1.2, 0.1, -1.9, -0.5);
const CLAP = (t, ph = 0) => { const c = Math.max(0, Math.sin(t * 7 + ph)); return [A(-1.1, 0.15 + 0.25 * c, -1.2, 0.9), A(-1.1, 0.15 + 0.25 * c, -1.2, -0.9)]; };
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const easeOutBack = (u) => { const c1 = 1.70158, c3 = c1 + 1; u = clamp(u); return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; };
const headAt = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const pulse = (t, a, up = 0.12, hold = 0.5, down = 0.6) => K(t, [[a, 0], [a + up, 1], [a + up + hold, 1], [a + up + hold + down, 0]]);
const boing = (t, t0, d = 0.45) => { if (t < t0) return 0; const u = (t - t0) / d; return u >= 1 ? 1 + 0.06 * Math.exp(-(t - t0 - d) * 6) * Math.sin((t - t0 - d) * 20) : easeOutBack(u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0x2f3a4a, 0xf4f1ea];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xc9b48e];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'short', 'bob', 'messy', 'none'];

// the swirl: polar spiral arms, a deep center, a bright rim; values > 1 so bloom makes it glow
function portalMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(0x7a3cff) }, uB: { value: new THREE.Color(0x3fe6ff) }, uC: { value: new THREE.Color(0x14063a) }, uGain: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uGain; varying vec2 vUv;
      void main(){ vec2 p = vUv * 2.0 - 1.0; float r = length(p); if (r > 1.0) discard; float a = atan(p.y, p.x);
        float arms = 0.5 + 0.5 * sin(3.0 * a + 9.0 * log(r + 0.03) - uT * 6.0);
        float fine = 0.5 + 0.5 * sin(7.0 * a - 14.0 * log(r + 0.03) + uT * 4.0);
        vec3 col = mix(uA, uB, smoothstep(0.25, 0.85, arms)) * (0.75 + 0.5 * fine);
        col = mix(uC, col, smoothstep(0.08, 0.5, r));
        col += vec3(1.0) * smoothstep(0.78, 0.95, r) * smoothstep(1.0, 0.95, r) * 1.2;
        float al = smoothstep(1.0, 0.93, r);
        gl_FragColor = vec4(col * 1.35 * uGain, al); }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  });
}
const glowTex = () => canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

export async function build(studio, story) {
  const { scene, renderer } = studio;
  renderer.localClippingEnabled = true;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv);
  const paris = buildParis(studio, {}); paris.root.position.set(...OFF.paris); const parisFog = paris.fog || scene.fog;
  const laund = buildLaundromat(studio, {}); laund.root.position.set(...OFF.laund);
  const sub = buildSuburb(studio, { poleClear: [-6, 6] }); sub.root.position.set(...OFF.sub); const subFog = sub.fog || scene.fog;
  const lab = buildClinic(studio, {}); lab.root.position.set(...OFF.lab);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const pad = buildLaunch(studio, {}); pad.root.position.set(...OFF.pad); pad.setMode('island', 'day'); const padFog = pad.fog || null;
  const mars = buildMars(studio, {}); mars.root.position.set(...OFF.mars); mars.setBuild(0); mars.lander.g.visible = false; mars.pieces.forEach((q) => (q.obj.visible = false)); if (mars.rover) mars.rover.visible = false; const marsFog = mars.fog;
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(8, 48);
  const ROOTS = { liv: liv.root, paris: paris.root, laund: laund.root, sub: sub.root, lab: lab.root, press: press.root, street: street.root, pad: pad.root, mars: mars.root, kit: kit.root };
  const FOGS = { liv: null, paris: parisFog, laund: null, sub: subFog, lab: null, press: null, street: streetFog, pad: padFog, mars: marsFog, kit: null };
  const FAR = { liv: 40, paris: 700, laund: 40, sub: 400, lab: 40, press: 40, street: 400, pad: 2400, mars: 900, kit: 40 };
  // laundromat chairs face the camera (+z) instead of the machines
  laund.root.children.filter((o) => o.isGroup && Math.abs(o.position.z - LD.chairZ) < 0.01).forEach((c) => (c.rotation.y = 0));
  const falcon = makeFalcon('f9'); falcon.g.position.set(-9, 0.4, -34); pad.root.add(falcon.g);

  // ---------------------------------------------------------------- cast
  const R = rng(42);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); p.root.rotation.order = 'YXZ'; scene.add(p.root); all.push(p); p.glasses = !!o.glasses; p.r = o.headR ?? 0.13;
    p.browY = p.head.brows.map((b) => b.position.y); p.browRZ = p.head.brows.map((b) => b.rotation.z); p.top0 = o.top; p.pants0 = o.pants; return p; };
  const you = person({ skin: 0xe2ad8c, top: 0x3f86e0, pants: 0x4a4f58, shoes: 0xf4f1ea, hair: 0x3a2618, hairStyle: 'messy', headR: 0.14 });
  const pool = Array.from({ length: 14 }, (_, i) => {
    const style = STYLES[i % STYLES.length];
    return person({ skin: SKINS[(i * 3 + 1) % SKINS.length], top: TOPS[(i * 3) % TOPS.length], collar: R() < 0.4 ? 0xf4f4f2 : undefined, pants: pick(PANTS), hair: HAIRS[(i * 5) % HAIRS.length], hairStyle: style,
      glasses: i % 4 === 1, mustache: style === 'short' && i % 3 === 0 ? pick(HAIRS.slice(0, 3)) : null });
  });
  const parisienne = person({ skin: 0xf3d0b5, top: 0x2f3a5a, collar: 0xf4f4f2, pants: 0x1d1d22, hair: 0x2a1d16, hairStyle: 'bob' });
  const parisMan = person({ skin: 0xd9a37f, top: 0xf4f1ea, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const tourist = person({ skin: 0xf1c3a1, top: 0x2fb7a8, pants: 0xc9b48e, hair: 0xd9b46a, hairStyle: 'short', glasses: true });
  const grandma = person({ skin: 0xf1c3a1, top: 0xb07fa0, collar: 0xf4f1ea, pants: 0x6b5a48, hair: 0xeeeae4, hairStyle: 'bob', glasses: true });
  const grandpa = person({ skin: 0xe2ad8c, top: 0x6f8f6a, collar: 0xf4f1ea, pants: 0x5a4a3a, hair: 0xd8d4ce, hairStyle: 'none', glasses: true, mustache: 0xd8d4ce });
  const cat = makeCat({ color: 0x8a8f99, belly: 0xf2efe8, stripe: 0x5a5f69 }); scene.add(cat.g);
  const pigeon = makePigeon(); scene.add(pigeon.root);
  const handOf = (rig, s) => rig.arms.find((a) => a.s === s).hand;

  // the rolled-up shirt, the belly patch and the portal ride on the spine (local: y up, +z = front)
  const bellyG = new THREE.Group(); you.spine.add(bellyG);
  const patch = mk(new THREE.CylinderGeometry(0.17, 0.162, 0.2, 28), you.mats.skin, bellyG, 0, 0.25, 0); patch.scale.set(1.13, 1, 0.8);
  const roll = mk(new THREE.TorusGeometry(0.168, 0.035, 10, 32), you.mats.top, bellyG, 0, 0.355, 0); roll.rotation.x = PI / 2; roll.scale.set(1.13, 0.8, 1);
  const PORTALS = [];
  function makePortal(r, light = 1.4) {
    const g = new THREE.Group(); const m = portalMaterial();
    const disc = mk(new THREE.CircleGeometry(r, 48), m, g); disc.castShadow = false; disc.receiveShadow = false; disc.renderOrder = 3;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xb07cff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.55 }));
    glow.scale.setScalar(r * (r > 0.2 ? 2.4 : 4.5)); glow.position.z = 0.01; g.add(glow);
    const L = new THREE.PointLight(0xa070ff, 0, 2.6, 2); L.position.z = 0.18; g.add(L);
    const P = { g, m, disc, glow, L, r, light, open: 1 };
    P.set = (t, open, gain = 1) => { P.open = open; g.visible = open > 0.01; g.scale.setScalar(Math.max(0.001, open)); m.uniforms.uT.value = t; m.uniforms.uGain.value = gain; L.intensity = light * clamp(open) * gain; glow.material.opacity = 0.55 * clamp(open); };
    P.warm = (on) => { m.uniforms.uA.value.set(on ? 0xff8a2a : 0x7a3cff); m.uniforms.uB.value.set(on ? 0xffe28a : 0x3fe6ff); m.uniforms.uC.value.set(on ? 0x5a1a06 : 0x14063a); glow.material.color.set(on ? 0xffb060 : 0xb07cff); L.color.set(on ? 0xffa050 : 0xa070ff); };
    PORTALS.push(P); return P;
  }
  const belly = makePortal(0.085, 1.0); bellyG.add(belly.g); belly.g.position.set(0, 0.245, 0.146);
  const exits = [makePortal(0.12, 1.2), makePortal(0.3, 2.0)]; exits.forEach((e) => scene.add(e.g));
  const _pw = new THREE.Vector3(), _pn = new THREE.Vector3(), _q = new THREE.Quaternion();
  /** world position + outward normal of the belly portal (pose `you` first) */
  function bellyAt() { you.root.updateMatrixWorld(true); belly.g.getWorldPosition(_pw); belly.g.getWorldQuaternion(_q); _pn.set(0, 0, 1).applyQuaternion(_q); return [_pw.clone(), _pn.clone()]; }
  function shirt(up) { bellyG.visible = up; }
  /** place an exit portal at local p of set key, facing direction n (local) */
  function exitAt(e, key, p, n, t, open, gain = 1) { const o = OFF[key]; e.g.position.set(p[0] + o[0], p[1] + o[1], p[2] + o[2]); e.g.lookAt(e.g.position.clone().add(V3(...n))); e.set(t, open, gain); }

  // ---------------------------------------------------------------- props
  const lint = mk(new THREE.IcosahedronGeometry(0.022, 1), mat(0x8f9cb8, 1), scene); lint.frustumCulled = false;
  const keys = new THREE.Group(); scene.add(keys);
  mk(new THREE.TorusGeometry(0.025, 0.004, 6, 16), mat(0xc9ccd0, 0.3, { metalness: 0.8 }), keys);
  for (let k = 0; k < 3; k++) { const kk = mk(new THREE.BoxGeometry(0.012, 0.06, 0.003), mat([0xd8b45a, 0xc9ccd0, 0xd8b45a][k], 0.3, { metalness: 0.8 }), keys, -0.015 + k * 0.015, -0.045, 0); kk.rotation.z = (k - 1) * 0.35; }
  mk(new THREE.BoxGeometry(0.03, 0.04, 0.012), mat(0xd2483f, 0.6), keys, 0.03, -0.02, 0);
  const remote = new THREE.Group(); scene.add(remote);
  mk(new THREE.BoxGeometry(0.05, 0.02, 0.17), mat(0x222428, 0.5), remote);
  for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.01, 0.006, 0.01), mat(k ? 0xc9ccd0 : 0xd2483f, 0.5), remote, -0.012 + (k % 2) * 0.024, 0.012, -0.05 + Math.floor(k / 2) * 0.03);
  function makeFish(c = 0x6fa8d8, s = 1) { const f = new THREE.Group(); const m = mat(c, 0.35, { metalness: 0.3 }); mk(new THREE.SphereGeometry(0.06, 14, 10), m, f).scale.set(0.5, 0.8, 1.5); const tl = mk(new THREE.ConeGeometry(0.05, 0.07, 4), m, f, 0, 0, -0.11); tl.rotation.x = -PI / 2; tl.scale.set(0.3, 1, 1); for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.008, 6, 6), mat(0x111111, 0.4), f, sx * 0.025, 0.012, 0.06); f.scale.setScalar(s); scene.add(f); return f; }
  const catFish = makeFish(0x6fa8d8, 0.8); cat.head.add(catFish); catFish.position.set(0.0, -0.05, 0.1); catFish.rotation.y = PI / 2; scene.remove(catFish);
  const floorFish = makeFish(0xe08a3a, 1.2);
  // the cat goes in front-first: every cat material is clipped at the belly plane
  const catPlane = new THREE.Plane(V3(0, 1, 0), 1e5);
  cat.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [catPlane]; } });
  catFish.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [catPlane]; } });
  // Paris café: bistro table, two chairs, latte + saucer, croissant, newspaper, baguette
  const cafe = new THREE.Group(); paris.root.add(cafe); const PT = [1.5, 58.15];
  cafe.position.set(PT[0], 0, PT[1]);
  const chrome = mat(0xc9ccd0, 0.3, { metalness: 0.7 });
  mk(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 28), mat(0xf2efe8, 0.4), cafe, 0, 0.735, 0); mk(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8), chrome, cafe, 0, 0.36, 0); mk(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 16), chrome, cafe, 0, 0.015, 0);
  const bistro = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; cafe.add(c); const w = mat(0x8a5a34, 0.6); mk(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 18), mat(0xd2483f, 0.7), c, 0, 0.45, 0); for (const [a, b] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) mk(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6), w, c, a, 0.225, b); mk(new THREE.BoxGeometry(0.36, 0.34, 0.03), w, c, 0, 0.66, -0.19).rotation.x = -0.12; };
  bistro(0, -0.5, 0); bistro(0.55, 0.0, -PI / 2);
  const latte = new THREE.Group(); latte.position.set(-0.05, 0.75, -0.08); cafe.add(latte);
  mk(new THREE.CylinderGeometry(0.075, 0.075, 0.008, 20), mat(0xfbfaf6, 0.3), latte, 0, 0.004, 0);
  mk(new THREE.CylinderGeometry(0.048, 0.035, 0.065, 18, 1, true), mat(0xfbfaf6, 0.3, { side: THREE.DoubleSide }), latte, 0, 0.04, 0);
  const foamM = mat(0xe8cfa8, 0.6); const foam = mk(new THREE.CircleGeometry(0.046, 20), foamM, latte, 0, 0.068, 0); foam.rotation.x = -PI / 2;
  mk(new THREE.CircleGeometry(0.018, 12), mat(0xfbf3e4, 0.6), latte, 0.006, 0.0685, 0.004).rotation.x = -PI / 2;
  const handle = mk(new THREE.TorusGeometry(0.018, 0.005, 6, 12), mat(0xfbfaf6, 0.3), latte, 0.052, 0.04, 0); handle.rotation.y = PI / 2;
  const crois = mk(new THREE.TorusGeometry(0.05, 0.025, 8, 14, PI * 1.3), mat(0xd99a4a, 0.6), cafe, 0.15, 0.775, 0.1); crois.rotation.x = -PI / 2;
  const paper = mk(new THREE.BoxGeometry(0.28, 0.36, 0.01), mat(0xeeeae0, 0.9), handOf(parisMan, -1), 0, -0.06, 0.12); paper.rotation.x = -0.3;
  const bag = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 10), mat(0xd9a05a, 0.7), cafe, 0.28, 0.79, -0.18); bag.rotation.z = PI / 2 - 0.2; bag.rotation.y = 0.5;
  const ripple = mk(new THREE.RingGeometry(0.01, 0.016, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), latte, 0, 0.07, 0); ripple.rotation.x = -PI / 2;

  // costume pieces posed on heads (beret, bucket hat, sombreros, goggles, swim caps, hard hats)
  function makeHat(kind, color) {
    const g = new THREE.Group(); scene.add(g); const m = mat(color, 0.7);
    if (kind === 'beret') { const b = mk(new THREE.SphereGeometry(0.15, 18, 10), m, g, 0.02, 0.0, 0); b.scale.set(1, 0.35, 1); mk(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), m, g, 0.02, 0.055, 0); }
    if (kind === 'bucket') { mk(new THREE.CylinderGeometry(0.11, 0.135, 0.1, 18), m, g, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 22), m, g, 0, -0.005, 0); }
    if (kind === 'sombrero') { mk(new THREE.CylinderGeometry(0.075, 0.12, 0.17, 20), m, g, 0, 0.09, 0); mk(new THREE.SphereGeometry(0.075, 16, 8, 0, PI * 2, 0, PI / 2), m, g, 0, 0.175, 0); mk(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 30), m, g, 0, -0.005, 0); mk(new THREE.TorusGeometry(0.4, 0.018, 6, 30), mat(0xd8b45a, 0.4), g, 0, 0.0, 0).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(0.105, 0.115, 0.03, 18), mat(0xd8b45a, 0.4), g, 0, 0.02, 0); }
    if (kind === 'hard') { mk(new THREE.SphereGeometry(0.145, 18, 10, 0, PI * 2, 0, PI / 2), m, g, 0, -0.03, 0); mk(new THREE.CylinderGeometry(0.17, 0.17, 0.012, 22), m, g, 0, -0.03, 0.02); }
    if (kind === 'cap') { mk(new THREE.SphereGeometry(0.142, 18, 10, 0, PI * 2, 0, PI / 2 + 0.25), m, g, 0, -0.05, -0.005); }
    if (kind === 'goggles') { for (const s of [-1, 1]) { const l = mk(new THREE.TorusGeometry(0.03, 0.009, 6, 14), mat(0x1d1d22, 0.4), g, s * 0.045, -0.115, 0.115); l.rotation.x = 0.1; mk(new THREE.CircleGeometry(0.03, 14), new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7 }), g, s * 0.045, -0.115, 0.118); } const strap = mk(new THREE.TorusGeometry(0.135, 0.008, 6, 26), mat(0x1d1d22, 0.5), g, 0, -0.115, 0); strap.rotation.x = PI / 2 + 0.1; }
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.visible = false; return g;
  }
  const HATS = { beret: makeHat('beret', 0xc8302c), bucket: makeHat('bucket', 0xf2e6c4), som: [0, 1, 2, 3, 4].map(() => makeHat('sombrero', 0xd9b56a)),
    goggles: [0, 1, 2].map((i) => makeHat('goggles', [0x3fb8e8, 0xf2b632, 0xe85a8a][i])), caps: [0, 1, 2].map((i) => makeHat('cap', [0xe85a5a, 0x3d7bd9, 0xf4f1ea][i])),
    hard: [0, 1].map(() => makeHat('hard', 0xf4f4f2)) };
  const _hq = new THREE.Quaternion(), _hp = new THREE.Vector3();
  function hat(h, rig, lift = 0.92) {
    h.visible = true; rig.root.updateMatrixWorld(true);
    rig.head.g.getWorldPosition(_hp); rig.head.g.getWorldQuaternion(_hq);
    const up = V3(0, rig.r * lift + 0.02, -0.01).applyQuaternion(_hq).multiplyScalar(rig.root.scale.x);
    h.position.copy(_hp).add(up); h.quaternion.copy(_hq); h.scale.setScalar(rig.root.scale.x * rig.r / 0.13);
  }
  // instruments + camera + misc hand props
  const guitars = [0, 1].map(() => { const g = new THREE.Group(); scene.add(g); const w = mat(0xb5793a, 0.5); mk(new THREE.SphereGeometry(0.13, 16, 10), w, g, 0, 0, 0).scale.set(1, 1.15, 0.35); mk(new THREE.SphereGeometry(0.1, 16, 10), w, g, 0, 0.17, 0).scale.set(1, 1, 0.35); mk(new THREE.CircleGeometry(0.035, 14), mat(0x2a1a10, 0.6), g, 0, 0.06, 0.047); mk(new THREE.BoxGeometry(0.04, 0.38, 0.025), mat(0x3a2414, 0.5), g, 0, 0.42, 0); return g; });
  const trumpets = [0, 1, 2].map(() => { const g = new THREE.Group(); scene.add(g); const b = mat(0xe0b44a, 0.25, { metalness: 0.8 }); const tube = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), b, g, 0, 0, 0.14); tube.rotation.x = PI / 2; const bell = mk(new THREE.ConeGeometry(0.055, 0.12, 16, 1, true), b, g, 0, 0, 0.34); bell.rotation.x = -PI / 2; mk(new THREE.BoxGeometry(0.04, 0.05, 0.08), b, g, 0, -0.02, 0.12); return g; });
  const camera35 = mk(new THREE.BoxGeometry(0.12, 0.075, 0.06), mat(0x222428, 0.4), handOf(tourist, 1), -0.04, -0.03, 0.06); mk(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 14), mat(0x111111, 0.3), camera35, 0, 0, 0.05).rotation.x = PI / 2;
  const flashTex = glowTex(); const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(flash);
  const clipboard = mk(new THREE.BoxGeometry(0.22, 0.3, 0.012), mat(0x8a5a34, 0.6), handOf(pool[0], -1), 0.02, -0.06, 0.1); clipboard.rotation.x = -0.6; mk(new THREE.BoxGeometry(0.19, 0.25, 0.004), mat(0xfbfaf6, 0.8), clipboard, 0, -0.01, 0.008);
  const duck = new THREE.Group(); scene.add(duck); { const y = mat(0xf2c62a, 0.45); mk(new THREE.SphereGeometry(0.07, 14, 10), y, duck).scale.set(1, 0.8, 1.25); mk(new THREE.SphereGeometry(0.045, 12, 10), y, duck, 0, 0.07, 0.06); const bk = mk(new THREE.ConeGeometry(0.02, 0.04, 8), mat(0xe8842a, 0.5), duck, 0, 0.065, 0.11); bk.rotation.x = PI / 2; for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.008, 6, 6), mat(0x111111, 0.4), duck, s * 0.025, 0.085, 0.095); }
  const tapeIn = makeTape(), tapeOut = makeTape(); scene.add(tapeIn.g); scene.add(tapeOut.g); tapeIn.g.frustumCulled = false; tapeOut.g.frustumCulled = false;
  const tapeCase = mk(new THREE.BoxGeometry(0.08, 0.08, 0.04), mat(0xf2d23a, 0.5), handOf(pool[3], 1), 0, -0.05, 0.05);
  const mic = new THREE.Group(); scene.add(mic); mk(new THREE.CylinderGeometry(0.018, 0.014, 0.2, 10), mat(0x222428, 0.4), mic, 0, 0, 0); mk(new THREE.SphereGeometry(0.035, 12, 10), mat(0x6a6c70, 0.5, { metalness: 0.5 }), mic, 0, 0.12, 0); mk(new THREE.BoxGeometry(0.06, 0.04, 0.04), mat(0x3d7bd9, 0.5), mic, 0, 0.05, 0);
  const rover = new THREE.Group(); scene.add(rover);
  { const w = mat(0xf4f4f2, 0.5), gold = mat(0xd8a84a, 0.3, { metalness: 0.6 }), dk = mat(0x2a2d31, 0.6); mk(new THREE.BoxGeometry(0.34, 0.12, 0.42), w, rover, 0, 0.14, 0); mk(new THREE.BoxGeometry(0.4, 0.015, 0.36), mat(0x2a3f6a, 0.3, { metalness: 0.4 }), rover, 0, 0.21, -0.02); mk(new THREE.BoxGeometry(0.3, 0.06, 0.08), gold, rover, 0, 0.1, 0.2);
    mk(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), w, rover, 0.1, 0.32, 0.14); const hd = mk(new THREE.BoxGeometry(0.09, 0.05, 0.05), w, rover, 0.1, 0.44, 0.15); mk(new THREE.CircleGeometry(0.015, 10), mat(0x111111, 0.2), hd, -0.02, 0, 0.026); mk(new THREE.CircleGeometry(0.015, 10), mat(0x111111, 0.2), hd, 0.02, 0, 0.026);
    rover.wheels = []; for (const x of [-0.2, 0.2]) for (const z of [-0.16, 0, 0.16]) { const wh = mk(new THREE.CylinderGeometry(0.055, 0.055, 0.045, 14), dk, rover, x, 0.055, z); wh.rotation.z = PI / 2; rover.wheels.push(wh); } }
  const cookie = new THREE.Group(); scene.add(cookie); mk(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 18), mat(0xc98a4a, 0.8), cookie); for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.008, 6, 6), mat(0x3a2414, 0.6), cookie, Math.cos(k * 1.3) * 0.025, 0.007, Math.sin(k * 1.3) * 0.025);
  const gHand = new THREE.Group(); scene.add(gHand);   // Grandma's arm reaching out of the portal (a sleeve + a hand)
  { const sl = mk(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 12), mat(0xb07fa0, 0.85), gHand, 0, 0, -0.16); sl.rotation.x = PI / 2; mk(new THREE.TorusGeometry(0.046, 0.012, 6, 14), mat(0xf4f1ea, 0.8), gHand, 0, 0, 0.0); const h = mk(new THREE.SphereGeometry(0.045, 12, 10), grandma.mats.skin, gHand, 0, 0, 0.05); h.scale.set(1, 0.6, 1.2); }
  const gCookie = cookie.clone(); gHand.add(gCookie); gCookie.position.set(0, 0.035, 0.08);
  const tray = new THREE.Group(); scene.add(tray); mk(new THREE.BoxGeometry(0.42, 0.015, 0.3), mat(0x9aa0a8, 0.3, { metalness: 0.6 }), tray); for (let k = 0; k < 6; k++) { const c = cookie.clone(); c.position.set(-0.13 + (k % 3) * 0.13, 0.014, -0.07 + Math.floor(k / 3) * 0.14); tray.add(c); }
  const mitt = mk(new THREE.SphereGeometry(0.06, 10, 8), mat(0xd2483f, 0.8), scene); mitt.scale.set(1, 0.5, 1.4);
  const gMug = new THREE.Group(); scene.add(gMug); mk(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 14), mat(0xf4f1ea, 0.4), gMug); mk(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mat(0xf4f1ea, 0.4), gMug, 0.05, 0, 0).rotation.y = PI / 2;
  // what went in ends up in Grandma's kitchen: keys, remote and a pile of socks on her counter
  const loot = new THREE.Group(); kit.root.add(loot); loot.position.set(-1.6, 0.92, -2.15);
  { const k2 = keys.clone(); k2.rotation.x = -PI / 2; loot.add(k2); const r2 = remote.clone(); r2.position.set(0.18, 0.012, 0.05); r2.rotation.y = 0.4; loot.add(r2); }

  // ---------------------------------------------------------------- FX: impact stars + puffs, debris pools (socks, papers), water, camera jolts
  const puffs = makeSpritePool(scene, 70, 'smoke'); const puffCol = new THREE.Color(0xf2ece2), waterCol = new THREE.Color(0xdff4ff), dustCol = new THREE.Color(0xd99a6a);
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 8 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let starN = 0, puffN = 0;
  function impact(t, m, key, p, s = 1, star = true, col = puffCol) {
    const age = t - m; if (age < 0 || age > 0.9) return;
    const o = OFF[key], w = V3(p[0] + o[0], p[1] + o[1], p[2] + o[2]);
    if (star && age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    for (let k = 0; k < 5 && puffN < puffs.items.length; k++) {
      const a = m * 5.1 + k * 1.3, r = (0.12 + age * 0.9) * s;
      puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y - 0.15 * s + k * 0.06 * s + age * 0.3 * s, w.z + Math.sin(a) * r * 0.6), (0.3 + age * 0.9) * s, 0.7 * (1 - age / 0.9) ** 1.5, col);
    }
  }
  /** a swirl burst at a portal: puffs spiralling out (world position w) */
  function swirlPuff(t, m, w, s = 0.3, col = new THREE.Color(0xd8c8ff)) {
    const age = t - m; if (age < 0 || age > 0.7) return;
    for (let k = 0; k < 6 && puffN < puffs.items.length; k++) { const a = k * 1.05 + age * 6, r = s * (0.3 + age * 1.6); puffs.set(puffN++, V3(w.x + Math.cos(a) * r, w.y + Math.sin(a) * r * 0.7, w.z + Math.sin(a) * r * 0.5), s * (0.5 + age), 0.55 * (1 - age / 0.7), col); }
  }
  const SOCK_C = [0xd2483f, 0x3d7bd9, 0xf2b632, 0x58b368, 0xe58fa6, 0xf4f1ea, 0x2f3a4a, 0x8f6fb8, 0xe08a3a, 0x4fb3a8];
  const mkPool = (n, f) => Array.from({ length: n }, (_, i) => { const m = f(i); m.visible = false; m.frustumCulled = false; m.traverse((o) => (o.frustumCulled = false)); scene.add(m); return m; });
  const sockStripe = canvasTex(32, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 8, w, 6); g.fillRect(0, 22, w, 6); });
  const DEB = {
    sock: mkPool(40, (i) => { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: SOCK_C[i % SOCK_C.length], roughness: 0.9, map: i % 3 ? sockStripe : null }); mk(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), m, g, 0, 0.06, 0); const ft = mk(new THREE.CapsuleGeometry(0.036, 0.08, 4, 8), m, g, 0, -0.04, 0.05); ft.rotation.x = PI / 2; return g; }),
    paper: mkPool(24, () => new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), mat(0xfbfaf6, 0.8, { side: THREE.DoubleSide }))),
    drop: mkPool(30, () => new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8fd0f0, roughness: 0.1, transparent: true, opacity: 0.8 }))),
  };
  const used = {};
  const FLUTTER = { paper: 1, sock: 0, drop: 0 };
  /** n pieces of `kind` launched at tb from o ± sp (LOCAL to key) with velocity v ± vs; land on floorY (local) */
  function burst(t, tb, key, kind, n, o, sp, v, vs, floorY = 0, seed = 1, dur = 9) {
    const age0 = t - tb; if (age0 < 0 || age0 > dur) return;
    const pool = DEB[kind], off = OFF[key];
    for (let i = 0; i < n && used[kind] < pool.length; i++) {
      const r = rng(seed * 131 + i * 7), m = pool[used[kind]++];
      const p0 = [o[0] + (r() - 0.5) * 2 * sp[0], o[1] + (r() - 0.5) * 2 * sp[1], o[2] + (r() - 0.5) * 2 * sp[2]];
      const vv = [v[0] + (r() - 0.5) * 2 * vs, v[1] + (r() - 0.5) * 2 * vs, v[2] + (r() - 0.5) * 2 * vs];
      const a = Math.max(0, age0 - r() * 0.25), fl = FLUTTER[kind] ?? 0, kd = fl ? 1.6 : 0.6, d = (1 - Math.exp(-kd * a)) / kd;
      let y = p0[1] + vv[1] * d - (fl ? 0.55 * a + 0.15 * a * a : 4.9 * a * a);
      const landed = y <= floorY + 0.02; y = Math.max(floorY + 0.02, y);
      m.visible = a > 0 || age0 > 0.25;
      m.position.set(p0[0] + vv[0] * d + off[0], y + off[1], p0[2] + vv[2] * d + off[2]);
      if (landed) m.rotation.set(kind === 'sock' ? PI / 2 : -PI / 2, 0, i); else m.rotation.set(r() * 6 + a * (3 + r() * 6), r() * 6 + a * 4, r() * 6 + a * (2 + r() * 5));
    }
  }
  // the ocean jet: a tapered open tube with scrolling stripes, foam at the end, a spreading puddle
  const flowTex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#4fb0e0'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y, w, 6); g.fillStyle = 'rgba(20,90,160,.35)'; g.fillRect(0, y + 14, w, 8); } });
  flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.55, 1, 20, 1, true), new THREE.MeshStandardMaterial({ map: flowTex, color: 0xbfe8ff, roughness: 0.15, transparent: true, opacity: 0.85, side: THREE.DoubleSide, emissive: 0x1a5a8a, emissiveIntensity: 0.4 }));
  jet.geometry.translate(0, 0.5, 0); jet.visible = false; jet.frustumCulled = false; scene.add(jet);
  const puddle = mk(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: 0x5fb8e8, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.7 }), scene); puddle.rotation.x = -PI / 2; puddle.visible = false;
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
  /** pose a rig by its BODY CENTER C (local), scale s: yaw/tilt/roll orient the whole body (flying). Legs hang. */
  function showC(rig, key, p, C, yaw, tilt = 0, roll = 0, s = 1) {
    _e.set(tilt, yaw, roll); _c.set(0, HC * s, 0).applyEuler(_e);
    p.x = C[0] - _c.x; p.z = C[2] - _c.z; p.rotY = yaw;
    // applyPose works in the rig's own (unscaled) units: pass y / floor divided by s, then fix the root height
    p.y = 0; p.floor = -5; show(rig, key, p, { tilt, roll, s }); rig.root.position.y = C[1] - _c.y + OFF[key][1];
  }
  /** a standing rig at scale s on ground gy (local) */
  function showS(rig, key, p, s, gy = 0) { p.y = 0; p.floor = 0; show(rig, key, p, { s }); rig.root.position.y = gy + OFF[key][1]; }
  const pose = (o) => Object.assign(basePose(), o);
  const sitPose = (o, seat, feet = 0) => pose({ y: seat - SIT, footFwd: 0.42, floor: feet, ...o });
  function blow(rig, k, wide = k) {
    const h = rig.head.hair; h.rotation.x = -0.45 * k; h.position.z = -0.03 * k; h.position.y = 0.01 * k; h.scale.set(1, 1 + 0.12 * k, 1 + 0.15 * k);
    rig.head.eyesOpen.scale.setScalar(1 + 0.3 * wide); rig.head.brows.forEach((b, i) => (b.position.y = rig.browY[i] + 0.07 * rig.r * wide));
  }
  function brows(rig, up = 0, frown = 0) { rig.head.brows.forEach((b, i) => { b.position.y = rig.browY[i] + 0.07 * rig.r * up; b.rotation.z = rig.browRZ[i] + (i ? 1 : -1) * 0.4 * frown; }); }
  function resetFace(rig) { const h = rig.head.hair; h.rotation.set(0, 0, 0); h.position.set(0, 0, 0); h.scale.set(1, 1, 1); rig.head.eyesOpen.scale.setScalar(1); rig.head.brows.forEach((b, i) => { b.position.y = rig.browY[i]; b.rotation.z = rig.browRZ[i]; }); }
  function blast(p, k, back = 0.35) {
    if (k <= 0.001) return;
    p.lean = lerp(p.lean ?? 0, -back, k); p.armA = mixArm(p.armA || REST, BACK_A, k * 0.85); p.armB = mixArm(p.armB || REST, BACK_B, k * 0.85);
    p.headPitch = lerp(p.headPitch ?? 0, -0.25, k); if (k > 0.3) p.mouth = 'o';
  }
  function look(p, x, z, tx, tz, k, bodyShare = 0.35) {
    const want = headAt(x, z, tx, tz); let d = ((want - p.rotY + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI;
    d = clamp(d, -2.2, 2.2); p.rotY += d * bodyShare * k; p.headYaw = lerp(p.headYaw ?? 0, d * (1 - bodyShare), k);
  }
  const dress = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  const L = (key, x, y, z) => V3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const toLocal = (key, w) => [w.x - OFF[key][0], w.y - OFF[key][1], w.z - OFF[key][2]];
  /** an object flying along a quadratic arc a → (control c) → b over [t0, t1], u eased by f */
  const arc = (a, c, b, u) => { const v = 1 - u; return V3(v * v * a.x + 2 * v * u * c.x + u * u * b.x, v * v * a.y + 2 * v * u * c.y + u * u * b.y, v * v * a.z + 2 * v * u * c.z + u * u * b.z); };
  /** an item sucked into the belly: from w0 at t0 to the portal at t1 (shrinks + spins); returns false once it is gone */
  function suck(o, t, t0, t1, w0, s0 = 1) {
    if (t >= t1) { o.visible = false; return false; }
    const [pw] = bellyAt(); const u = clamp((t - t0) / (t1 - t0)), e = u * u * u;
    o.visible = true; o.position.copy(w0).lerp(pw, e); o.scale.setScalar(s0 * Math.max(0.02, 1 - e * 0.95)); o.rotation.set(u * 9, u * 7, u * 5); return true;
  }
  const underL = new THREE.PointLight(0xa070ff, 0, 2.4, 2); scene.add(underL);
  const leak = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xd8b0ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(leak);

  // ================================================================ 1. LIVING ROOM (couch beats, the cat, the cookie)
  const SOFA = [1.8, -2.1], SEAT = 0.42;
  function youOnSofa(o = {}) { const p = sitPose({ x: SOFA[0], z: SOFA[1], rotY: 0, lean: -0.1, ...o }, SEAT); return p; }
  function couchBeat(t, cam) {
    const night = cam !== 'fallA' && cam !== 'fallB';
    liv.setMode(night ? 'night' : 'morning');
    const tvF = 0.6 + 0.4 * Math.sin(t * 9) * Math.sin(t * 2.3);
    if (night) liv.lights.lampL.intensity = cam === 'night' ? 1.4 : 0.5;
    let p;
    if (cam === 'couchA' || cam === 'couchB' || cam === 'couchC') {
      const up = t >= 4.05;
      p = youOnSofa({ mouth: 'flat', eyes: blink(t, 3) });
      if (t < 2.4) { Object.assign(p, { headRoll: 0.28, headPitch: 0.32, lean: -0.16, eyes: 'closed', mouth: 'o' }); p.armA = A(0.05, 0.1, -0.5, 0.3, 0); p.armB = A(0.05, 0.1, -0.5, -0.3, 0); }
      else {
        const w = K(t, [[2.4, 0], [2.9, 1]]); p.headRoll = lerp(0.28, 0.05, w); p.headPitch = lerp(0.32, 0.6, K(t, [[2.6, 0], [3.1, 1]])); p.lean = lerp(-0.16, 0.08, w);
        p.eyes = t < 2.55 ? 'closed' : 'open'; p.armA = A(0.05, 0.1, -0.5, 0.3, 0); p.armB = A(0.05, 0.1, -0.5, -0.3, 0);
      }
      if (t > 3.65) { const g = K(t, [[3.65, 0], [4.05, 1]]); p.armA = mixArm(p.armA, HEM_A, g); p.armB = mixArm(p.armB, HEM_B, g); }
      if (up) { const k = pulse(t, 4.15, 0.12, 0.6, 0.8); p.lean = lerp(0.08, -0.12, k); p.mouth = 'o'; p.headPitch = 0.62 - 0.15 * k; }
      if (t > 5.5 && t < 6.3) { p.headPitch = lerp(0.6, 0.05, K(t, [[5.5, 0], [5.9, 1]])); p.mouth = 'flat'; }
      if (cam === 'couchC') {
        p.headPitch = 0.55; p.mouth = 'flat'; p.armA = HEM_A;
        const reach = K(t, [[6.45, 0], [6.75, 1], [7.0, 1], [7.25, 0.55]]); p.armB = mixArm(HEM_B, PICK_B, reach);
        if (t > 7.55) { p.mouth = 'o'; p.lean = 0.12; p.headPitch = 0.7; }
        if (t > 8.15) { p.headPitch = lerp(0.7, -0.02, K(t, [[8.15, 0], [8.45, 1]])); p.mouth = 'flat'; p.eyes = 'open'; }
      }
      show(you, 'liv', p); shirt(up);
      if (up) { belly.set(t, boing(t, 4.08, 0.5), 1 + 0.5 * pulse(t, 4.15, 0.1, 0.4, 0.8)); blow(you, pulse(t, 4.15, 0.1, 0.5, 0.8) * 0.6, pulse(t, 4.15, 0.1, 0.9, 0.8)); }
      else { const [pw, n] = bellyAt(); underL.position.copy(pw).addScaledVector(n, 0.16); underL.intensity = 0.6 + 0.3 * Math.sin(t * 3); leak.visible = true; leak.position.copy(pw).addScaledVector(n, 0.05).add(V3(0, -0.1, 0)); leak.scale.setScalar(0.55 + 0.08 * Math.sin(t * 3)); leak.material.opacity = 0.9; leak.position.y -= 0.06; underL.intensity *= 1.6; }
      if (cam === 'couchC') {
        you.root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(you, 1).getWorldPosition(hw);
        if (t > 6.8 && t < 7.3) { lint.visible = true; lint.position.copy(hw).add(V3(0, 0.0, 0.04)); lint.scale.setScalar(1); }
        else if (t >= 7.3) suck(lint, t, 7.3, EV.lint, hw.clone().add(V3(0, 0, 0.04)));
        swirlPuff(t, EV.lint, bellyAt()[0], 0.12);
      }
      swirlPuff(t, 4.12, bellyAt()[0], 0.3);
      jolts.push([4.15, 0.012]);
    } else if (cam === 'fallA' || cam === 'fallB') {
      p = youOnSofa({ mouth: 'flat', eyes: blink(t, 4), headPitch: 0.45, armA: HEM_A, armB: HOLD_B });
      if (t < 13.3) { p.armB = mixArm(HOLD_B, HEM_B, K(t, [[12.7, 0], [13.0, 1]])); }
      else if (t < 14.6) { p.armB = mixArm(HEM_B, A(-1.0, 0.25, -0.6, -0.3), K(t, [[13.3, 0], [13.6, 1]])); p.headPitch = 0.05; p.headYaw = 0.5; }
      else p.armB = HEM_B;
      if (t > 12.95 && t < 13.4) p.mouth = 'o';
      if (t > 14.15 && t < 15.2) { p.mouth = 'o'; p.headYaw = 0; p.headPitch = 0.5; }
      if (cam === 'fallB') {
        p.headPitch = 0.4; p.headYaw = 0;
        const grab = K(t, [[16.05, 0], [16.25, 1]]);
        p.armA = mixArm(HEM_A, HOLD_A, grab); p.armB = mixArm(HEM_B, HOLD_B, grab);
        if (t > 15.6) p.mouth = 'o';
        if (t > 16.6) { const pull = K(t, [[16.6, 0], [16.95, 1]]); p.lean = -0.2 * pull; }
        if (t > 17.2) { p.headPitch = lerp(0.4, -0.02, K(t, [[17.2, 0], [17.5, 1]])); p.mouth = 'flat'; }
        blow(you, pulse(t, 15.85, 0.08, 0.3, 0.4), pulse(t, 15.85, 0.08, 0.8, 0.5));
      }
      show(you, 'liv', p); shirt(true); belly.set(t, 1);
      you.root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(you, 1).getWorldPosition(hw);
      // keys dangling from the right hand → yanked in
      if (t < 12.7) { keys.visible = true; keys.position.copy(hw).add(V3(0, -0.06, 0.03)); keys.rotation.set(0, 0, 0.2 * Math.sin(t * 5)); keys.scale.setScalar(1); }
      else suck(keys, t, 12.7, EV.keys, hw.clone().add(V3(0, -0.06, 0.03)));
      // the remote in the right hand aimed at the TV → yanked in
      if (t > 13.3 && t < 13.9) { remote.visible = true; remote.position.copy(hw).add(V3(0.03, -0.02, 0.06)); remote.rotation.set(0, 0.5, 0); remote.scale.setScalar(1); }
      else if (t >= 13.9) suck(remote, t, 13.9, EV.remote, hw.clone().add(V3(0.03, -0.02, 0.06)));
      // the cat: watches → wiggles → pounces → front half gone → pulled out with a fish
      const [pw, n] = bellyAt();
      cat.g.visible = true; cat.g.rotation.order = 'YXZ'; cat.update(t, 1);
      const CAT0 = L('liv', 1.45, 0, -1.05);
      catPlane.set(V3(0, 1, 0), 1e5); catFish.visible = t > EV.catOut - 0.3;
      if (t < 15.55) { cat.g.position.copy(CAT0); cat.g.rotation.set(t > 14.4 ? 0.25 : 0, PI + 0.12, t > 14.4 ? 0.12 * Math.sin(t * 16) : 0); cat.head.rotation.set(-0.35, 0, 0); cat.paw(0); }
      else if (t < EV.catOut) {
        const inside = pw.clone().addScaledVector(n, 0.16).add(V3(0, -0.12, 0));
        const u = clamp((t - 15.55) / (EV.cat - 15.55));
        if (t < EV.cat) cat.g.position.copy(arc(CAT0, CAT0.clone().lerp(inside, 0.5).add(V3(0, 0.45, 0)), inside, u));
        else { const pull = K(t, [[16.6, 0], [EV.catOut, 1]]); cat.g.position.copy(inside).addScaledVector(n, 0.03 * Math.sin(t * 30) + 0.25 * pull); }
        cat.g.rotation.set(lerp(0.2, 1.2, clamp(u * 1.5)), PI, 0.1 * Math.sin(t * 20)); cat.paw(0.5 + 0.5 * Math.sin(t * 25)); cat.legs[0].rotation.x = -0.6 - 0.5 * Math.sin(t * 25 + 1); cat.update(t * 3, 3);
        catPlane.set(n.clone(), -n.dot(pw));
      } else {
        const held = pw.clone().addScaledVector(n, 0.34).add(V3(0, -0.3, 0));
        cat.g.position.copy(held).add(V3(0, 0.02 * Math.sin(t * 12), 0)); cat.g.rotation.set(0.1, 0.15, 0.08 * Math.sin(t * 8)); cat.paw(0.4); cat.head.rotation.set(0, 0.3 * Math.sin(t * 2), 0);
      }
      swirlPuff(t, EV.keys, pw, 0.1); swirlPuff(t, EV.remote, pw, 0.12); swirlPuff(t, EV.catOut, pw, 0.2, new THREE.Color(0xcfe8ff));
      if (cam === 'fallB') jolts.push([EV.cat, 0.01], [EV.catOut, 0.012]);
    } else if (cam === 'night') {
      belly.warm(true);
      p = youOnSofa({ mouth: 'flat', eyes: blink(t, 6), headPitch: 0.1, armA: HEM_A, armB: HEM_B });
      const hOut = K(t, [[52.85, 0], [53.25, 1], [54.1, 1], [54.45, 0]]);
      if (t > 52.85) { p.headPitch = 0.55; p.mouth = t < 53.6 ? 'o' : 'flat'; }
      const take = K(t, [[53.5, 0], [53.75, 1]]);
      if (t > 53.5) p.armB = mixArm(HEM_B, HOLD_B, take);
      if (t > 54.2) { const s = K(t, [[54.2, 0], [54.55, 1]]); p.armB = mixArm(HOLD_B, A(-1.25, 0.2, -2.25, -0.55), s); p.headPitch = lerp(0.55, 0.05, s); }
      if (t > 54.75) { p.eyes = 'closed'; p.mouth = 'smile'; p.headRoll = 0.12 * K(t, [[54.75, 0], [55.0, 1]]); }
      if (t > 55.35) { p.eyes = 'open'; p.mouth = 'smile'; p.headPitch = 0.6; p.lean = 0.35 * K(t, [[55.35, 0], [55.6, 1]]); }
      show(you, 'liv', p); shirt(true); belly.set(t, 1, 0.9);
      const [pw, n] = bellyAt();
      // Grandma's arm offers a cookie
      gHand.visible = hOut > 0.01; gHand.position.copy(pw).addScaledVector(n, 0.04 + 0.26 * hOut).add(V3(0, 0.02 * Math.sin(t * 4), 0)); gHand.lookAt(gHand.position.clone().add(n)); gHand.scale.setScalar(Math.max(0.01, Math.min(1, hOut * 1.4)));
      gCookie.visible = t < EV.take;
      you.root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(you, 1).getWorldPosition(hw);
      cookie.visible = t >= EV.take && t < EV.fold; cookie.position.copy(hw).add(V3(0, 0.02, 0.04)); cookie.rotation.set(1.2, 0, 0);
      // you fold into your own belly button: spin + shrink into the frozen portal point
      if (t >= EV.fold) {
        const piv = pw;
        const k = clamp((t - EV.fold) / (EV.foldIn - EV.fold)), s = Math.max(0.001, 1 - k * k);
        const r0 = you.root.position.clone();
        you.root.position.copy(piv).addScaledVector(r0.sub(piv), s); you.root.scale.setScalar(s); you.root.rotation.y += k * k * 9;
        you.root.visible = t < EV.foldIn;
        void n;
        swirlPuff(t, EV.foldIn - 0.1, piv, 0.35, new THREE.Color(0xffd8a0));
      }
      underL.position.copy(pw).addScaledVector(n, 0.3); underL.color.set(0xffa050); underL.intensity = 0.4 + 0.4 * hOut;
      swirlPuff(t, 52.85, pw, 0.15, new THREE.Color(0xffd8a0));
    }
    // TV glow on the room at night
    if (night) { underL.color.set(cam === 'night' ? 0xffa050 : 0xa070ff); }
    void tvF;
  }

  // ================================================================ 2. PARIS (the lint lands in a latte)
  function parisBeat(t) {
    paris.aimSun && paris.aimSun(PT[0], PT[1], 12);
    const pp = sitPose({ x: PT[0], z: PT[1] - 0.5, rotY: 0, mouth: 'smile', eyes: blink(t, 7), headPitch: 0.1, armA: A(-0.6, 0.1, -1.2, 0.5), armB: CUP_B }, 0.47);
    const reach = K(t, [[9.0, 0], [9.45, 1]]); pp.armB = mixArm(A(-0.6, 0.1, -1.2, -0.5), CUP_B, reach);
    if (t > 9.75) { pp.headPitch = lerp(0.1, 0.55, K(t, [[9.75, 0], [9.95, 1]])); pp.mouth = 'o'; }
    if (t > 10.6) { pp.headPitch = lerp(0.55, -0.45, K(t, [[10.6, 0], [10.9, 1]])); }
    if (t > 11.35) { pp.headPitch = lerp(-0.45, 0.02, K(t, [[11.35, 0], [11.65, 1]])); pp.mouth = 'flat'; }
    show(parisienne, 'paris', pp); hat(HATS.beret, parisienne, 0.85);
    if (t > 11.35) brows(parisienne, 0, 0.6);
    const mp = sitPose({ x: PT[0] + 0.55, z: PT[1], rotY: -PI / 2, mouth: 'smile', eyes: blink(t, 8), headPitch: 0.1, armA: A(-0.6, 0.1, -1.2, 0.6), armB: SIP_B }, 0.47); paper.visible = false;
    mp.armB = mixArm(SIP_B, CUP_B, K(t, [[9.9, 0], [10.2, 1]]));
    if (t > 10.1) { mp.headPitch = 0.4; mp.mouth = 'o'; mp.headYaw = 0.2; }
    if (t > 10.7) { mp.headPitch = -0.35; }
    show(parisMan, 'paris', mp);
    // walkers far behind
    for (let i = 0; i < 2; i++) { const r = pool[10 + i]; const x = (i ? -6 : 6) + (i ? 1 : -1) * 1.2 * (t - 8.8); const wp = pose({ x, z: PT[1] - 7 - 2 * i, rotY: i ? PI / 2 : -PI / 2, dist: 1.2 * (t - 8.8), speed: 1.2, eyes: blink(t, 20 + i) }); show(r, 'paris', wp); }
    const PW = [PT[0] - 0.2, 1.0, PT[1] + 0.1], CUP = [PT[0] - 0.05, 0.83, PT[1] - 0.08];
    exitAt(exits[0], 'paris', PW, [0, -0.55, 0.85], t, Math.min(boing(t, 9.0, 0.4), K(t, [[10.7, 1], [11.0, 0]])));
    if (t > 9.3 && t < EV.lintOut) { const u = (t - 9.3) / (EV.lintOut - 9.3); lint.visible = true; lint.scale.setScalar(1.2); lint.position.copy(L('paris', lerp(PW[0], CUP[0], u), lerp(PW[1] - 0.03, CUP[1], u * u) + 0.12 * Math.sin(u * PI), lerp(PW[2], CUP[2], u))); lint.rotation.set(t * 4, t * 3, 0); }
    else if (t >= EV.lintOut) { lint.visible = true; lint.scale.set(1.3, 0.6, 1.3); lint.position.copy(L('paris', PT[0] - 0.05, 0.824, PT[1] - 0.08)); }
    const rk = clamp((t - EV.lintOut) / 0.7); ripple.visible = t > EV.lintOut && rk < 1; ripple.scale.setScalar(1 + 2.6 * rk); ripple.material.opacity = 0.8 * (1 - rk);
    burst(t, EV.lintOut, 'paris', 'drop', 6, [PT[0] - 0.05, 0.83, PT[1] - 0.08], [0.01, 0, 0.01], [0, 0.9, 0], 0.4, 0.75, 3, 0.6);
    swirlPuff(t, 9.0, exits[0].g.position, 0.1);
  }

  // ================================================================ 3. LAUNDROMAT (pigeon, socks, the Pacific)
  const LCH = laund.root.children.filter((o) => o.isGroup && Math.abs(o.position.z - LD.chairZ) < 0.01);
  const myChair = LCH.find((c) => Math.abs(c.position.x) < 0.01);
  const LN = [[-0.7, 4], [0.7, 5], [-1.4, 6], [1.4, 7]];
  function laundBeat(t, cam) {
    laund.update(t, 1);
    const slide = -0.5 * K(t, [[EV.ocean, 0], [EV.ocean + 0.5, 1]]);
    if (myChair) myChair.position.z = LD.chairZ + slide;
    const yp = sitPose({ x: 0, z: LD.chairZ + 0.04 + slide, rotY: 0, mouth: 'flat', eyes: blink(t, 5), armA: HEM_A, armB: HEM_B, headPitch: 0.1 }, LD.seat);
    if (t > EV.pigeon - 0.1 && t < 19.6) { yp.headPitch = -0.4; yp.mouth = 'o'; yp.headYaw = K(t, [[18.6, 0], [19.4, 0.8]]); }
    if (t > 19.9 && t < 21.3) { yp.headPitch = 0.45; yp.mouth = 'o'; }
    blast(yp, pulse(t, EV.ocean, 0.1, 1.4, 0.5), 0.4);
    if (t > 23.2) { yp.headPitch = lerp(-0.2, 0.0, K(t, [[23.2, 0], [23.5, 1]])); yp.mouth = 'flat'; }
    show(you, 'laund', yp); shirt(true); belly.set(t, 1);
    blow(you, pulse(t, EV.ocean, 0.1, 1.4, 0.5), pulse(t, EV.ocean, 0.1, 1.6, 0.5));
    const [pw, n] = bellyAt();
    // neighbors: idle (magazine, phone) → duck the pigeon in sync → socks rain → soaked
    LN.forEach(([x, i], j) => {
      if (cam === 'laundB' && x > 0) return;
      const r = pool[i]; const p = sitPose({ x, z: LD.chairZ + 0.04, rotY: 0, mouth: 'flat', eyes: blink(t, 30 + j), headPitch: 0.35, armA: j === 1 ? A(-0.6, 0.1, -1.5, 0.6) : A(-0.6, 0.1, -1.2, 0.6), armB: j === 1 ? PHONE_B : A(-0.6, 0.1, -1.2, -0.6) }, LD.seat);
      if (t > 18.3) { p.headYaw = Math.sign(-x) * 0.6 * K(t, [[18.3, 0], [18.5, 1]]); p.headPitch = 0; p.mouth = 'o'; }
      const duck = pulse(t, 18.75 + 0.04 * j, 0.12, 0.45, 0.35); p.crouch = 0.0; p.lean = 0.45 * duck; p.armA = mixArm(p.armA, A(-2.3, 0.3, -2.0, 0.6), duck); p.armB = mixArm(p.armB, A(-2.3, 0.3, -2.0, -0.6), duck);
      const sk = pulse(t, 20.05 + 0.05 * j, 0.1, 0.9, 0.4); p.armA = mixArm(p.armA, A(-2.4, 0.5, -0.6, 0.3), sk); p.armB = mixArm(p.armB, A(-2.4, 0.5, -0.6, -0.3), sk); if (sk > 0.3) { p.mouth = 'o'; p.headPitch = -0.4; }
      blast(p, pulse(t, EV.ocean + 0.1 + 0.05 * Math.abs(x), 0.12, 1.0, 0.6), 0.3);
      if (t > 23.0) { p.headYaw = Math.sign(-x) * 0.6; p.mouth = 'flat'; p.headPitch = 0; }
      show(r, 'laund', p); blow(r, pulse(t, EV.ocean + 0.1, 0.1, 1.0, 0.6), sk);
    });
    // a woman loading a machine in the back
    { const p = pose({ x: -2.4, z: -1.95, rotY: PI, lean: 0.3 + 0.15 * Math.sin(t * 2.2), eyes: blink(t, 41), armA: A(-1.0, 0.1, -0.5, 0.3), armB: A(-1.0, 0.1, -0.5, -0.3) }); if (t > 18.7) { p.rotY = PI - 2.4 * K(t, [[18.7, 0], [19.0, 1]]); p.lean = 0; p.mouth = 'o'; } show(pool[8], 'laund', p); }
    // the pigeon bursts out and flaps over every head
    if (t > EV.pigeon && t < 21.0) {
      const a = toLocal('laund', pw), path = [[EV.pigeon, a], [18.85, [a[0] + 0.3, a[1] + 0.55, a[2] + 0.5]], [19.5, [-0.9, 2.0, 1.6]], [20.2, [-2.6, 2.3, 0.4]], [21.0, [-4.5, 2.4, -0.5]]];
      let q = path[path.length - 1][1], hd = 0; for (let i = 0; i < path.length - 1; i++) if (t < path[i + 1][0]) { const u = (t - path[i][0]) / (path[i + 1][0] - path[i][0]); q = path[i][1].map((v, j) => lerp(v, path[i + 1][1][j], u)); hd = Math.atan2(path[i + 1][1][0] - path[i][1][0], path[i + 1][1][2] - path[i][1][2]); break; }
      const s = Math.min(1.3, 0.2 + 1.1 * clamp((t - EV.pigeon) / 0.25));
      pigeon.set({ x: q[0] + OFF.laund[0], y: q[1] - 0.18 * s, z: q[2] + OFF.laund[2], rotY: hd, scale: s, flap: 1, t }); pigeon.root.visible = true;
    }
    burst(t, EV.socks, 'laund', 'sock', 20, toLocal('laund', pw), [0.03, 0.03, 0.03], [0, 3.2, 1.0], 1.4, 0, 11);
    burst(t, EV.socks + 0.45, 'laund', 'sock', 18, toLocal('laund', pw), [0.03, 0.03, 0.03], [0, 3.4, 0.8], 1.5, 0, 17);
    swirlPuff(t, EV.pigeon, pw, 0.15); swirlPuff(t, EV.socks, pw, 0.2);
    // the Pacific
    const on = K(t, [[EV.ocean, 0], [EV.ocean + 0.2, 1], [23.3, 1], [23.7, 0]]);
    if (on > 0.01) {
      const dir = V3(n.x, n.y - 0.32, n.z).normalize(), len = 1.6 * Math.min(1, (t - EV.ocean) / 0.25 + 0.05) * (on > 0.99 ? 1 : on);
      jet.visible = true; jet.position.copy(pw).addScaledVector(dir, 0.01); jet.quaternion.setFromUnitVectors(V3(0, 1, 0), dir);
      const rr = 0.07 * on + 0.015 * Math.sin(t * 30); jet.scale.set(rr, len, rr);
      jet.geometry.parameters; jet.material.map.offset.y = -t * 3.5;
      const end = pw.clone().addScaledVector(dir, len);
      for (let k = 0; k < 4 && puffN < puffs.items.length; k++) puffs.set(puffN++, end.clone().add(V3(Math.sin(t * 13 + k * 2) * 0.15, 0.05 + 0.1 * k, Math.cos(t * 11 + k) * 0.15)), 0.3 + 0.1 * k, 0.6 * on, waterCol);
      burst(t, EV.ocean + 0.1, 'laund', 'drop', 24, toLocal('laund', end), [0.1, 0.05, 0.1], [0, 1.6, 0.3], 1.2, 0, 23, 1.2);
    }
    const pk = K(t, [[EV.ocean + 0.15, 0], [23.6, 1]]);
    if (pk > 0) { puddle.visible = true; puddle.position.copy(L('laund', 0.05, 0.012, 1.9)); puddle.scale.setScalar(0.2 + 2.0 * pk); }
    if (t > 21.95) { const a = t - 21.95, fl = a < 0.5; floorFish.visible = true; floorFish.position.copy(L('laund', 0.55 + Math.min(a, 0.5) * 0.6, fl ? 0.85 + 1.5 * a - 4.9 * a * a : 0.06 + 0.05 * Math.abs(Math.sin(a * 9)), 1.9 + Math.min(a, 0.5) * 0.5)); floorFish.rotation.set(fl ? a * 8 : 0, 0.6, fl ? 0 : PI / 2 + 0.4 * Math.sin(a * 14)); }
    if (cam === 'laundB') jolts.push([EV.ocean, 0.02]);
  }

  // ================================================================ 4. SUBURB LAWN (a tourist, a mariachi band)
  const YOU_L = [0, -4.0];
  const BAND = [[-1.5, -2.9, 'g'], [-0.95, -2.6, 't'], [0.95, -2.6, 't'], [1.5, -2.9, 't'], [-0.5, -3.35, 'g']];
  function lawnBeat(t, cam) {
    sub.aimSun(0, -3, 8);
    const yp = pose({ x: YOU_L[0], z: YOU_L[1], rotY: 0, mouth: 'flat', eyes: blink(t, 9), armA: HEM_A, armB: HEM_B, headPitch: 0.1 });
    const kick = Math.max(pulse(t, EV.tourist, 0.08, 0.2, 0.3), ...EV.band.map((b) => pulse(t, b, 0.06, 0.1, 0.25)));
    yp.lean = -0.2 * kick; if (kick > 0.2) yp.mouth = 'o';
    if (t > 25.6 && t < 26.4) { yp.mouth = 'smile'; yp.headPitch = 0; }
    if (t > 28.6) { yp.mouth = 'smile'; yp.headRoll = 0.08 * Math.sin(t * 6.3); yp.rotY = 0.08 * Math.sin(t * 3.1); }
    show(you, 'sub', yp); shirt(true); belly.set(t, 1 + 0.6 * kick, 1 + 0.4 * kick);
    const [pw] = bellyAt(); const a = toLocal('sub', pw);
    // the tourist
    const TL = [-0.75, -3.6];
    if (t >= EV.tourist && cam === 'lawnA') {
      const fly = clamp((t - EV.tourist) / 0.42);
      const tp = pose({ mouth: 'o', eyes: 'open', armA: UP_A, armB: UP_B });
      if (fly < 1) { const s = 0.15 + 0.85 * easeOutBack(fly), C = [lerp(a[0], TL[0], fly), lerp(a[1], 0.9, fly) + 0.5 * Math.sin(fly * PI), lerp(a[2], TL[1], fly)]; showC(tourist, 'sub', tp, C, 0, 1.3 * (1 - fly), 0, s); }
      else {
        const land = t - EV.tourist - 0.42;
        Object.assign(tp, { x: TL[0], z: TL[1], rotY: 0, crouch: 0.18 * Math.exp(-land * 7), armA: mixArm(UP_A, REST, clamp(land * 4)), armB: mixArm(UP_B, REST, clamp(land * 4)) });
        tp.headYaw = land < 1.0 ? 0.9 * Math.sin(land * 5) : 0; tp.headPitch = -0.1;
        if (t > 25.45) { const k = K(t, [[25.45, 0], [25.7, 1]]); tp.rotY = lerp(0, PI - 0.25, k); tp.armA = mixArm(tp.armA, CAM_A, k); tp.armB = mixArm(tp.armB, CAM_B, k); tp.headYaw = 0; tp.mouth = 'flat'; }
        showS(tourist, 'sub', tp, 1, 0);
      }
      hat(HATS.bucket, tourist, 0.85);
    }
    if (tourist.root.visible) { tourist.root.updateMatrixWorld(true); const cw = new THREE.Vector3(); camera35.getWorldPosition(cw); const fk = Math.max(pulse(t, 25.9, 0.03, 0.03, 0.15), pulse(t, 28.4, 0.03, 0.03, 0.15), pulse(t, 29.3, 0.03, 0.03, 0.15)); flash.visible = fk > 0.01; flash.position.copy(cw).add(V3(0, 0.02, 0)); flash.scale.setScalar(0.7 * fk); flash.material.opacity = fk; }
    swirlPuff(t, EV.tourist, pw, 0.25);
    // the band
    if (cam === 'lawnB') BAND.forEach(([x, z, kind], i) => {
      const r = pool[i], tb = EV.band[i]; if (t < tb) return;
      dress(r, 0x1d1d22, 0x1d1d22);
      const fly = clamp((t - tb) / 0.4), p = pose({ mouth: 'smile', eyes: blink(t, 50 + i) });
      if (fly < 1) { const s = 0.15 + 0.85 * easeOutBack(fly), C = [lerp(a[0], x, fly), lerp(a[1], 0.9, fly) + 0.6 * Math.sin(fly * PI), lerp(a[2], z, fly)]; Object.assign(p, { armA: UP_A, armB: UP_B, mouth: 'o' }); showC(r, 'sub', p, C, fly * 6.3, 1.0 * (1 - fly), 0, s); }
      else {
        const land = t - tb - 0.4, play = t > 28.6;
        Object.assign(p, { x, z, rotY: headAt(x, z, 2.4, 0.6) * 0.6, crouch: 0.16 * Math.exp(-land * 7) });
        if (kind === 'g') { p.armA = GUIT_A; p.armB = play ? STRUM_B(t + i) : A(-0.35, 0.15, -1.25, -0.4); }
        else { p.armA = play ? TRUMP_A : mixArm(UP_A, REST, clamp(land * 3)); p.armB = play ? TRUMP_B : mixArm(UP_B, REST, clamp(land * 3)); p.headPitch = play ? -0.15 : 0; }
        if (play) { p.lean = 0.04 * Math.sin(t * 6.3 + i); p.rotY += 0.1 * Math.sin(t * 3.1 + i); p.headRoll = 0.06 * Math.sin(t * 6.3 + i); }
        showS(r, 'sub', p, 1, 0);
        r.root.updateMatrixWorld(true);
        if (kind === 'g') { const gi = i ? 1 : 0, g = guitars[gi]; g.visible = true; const hw = new THREE.Vector3(); handOf(r, -1).getWorldPosition(hw); g.position.copy(L('sub', x, 1.0, z)).add(V3(0, 0, 0.17)); g.rotation.set(0, 0, 1.0); g.position.x += 0.0; void hw; }
        else { const tr = trumpets[i - 1]; tr.visible = play || land > 0.6; const hw = new THREE.Vector3(); handOf(r, 1).getWorldPosition(hw); tr.position.copy(hw).add(V3(0, 0, -0.08)); tr.rotation.set(-p.headPitch * 0.5 - 0.1, p.rotY, 0); }
      }
      hat(HATS.som[i], r, 0.8);
      swirlPuff(t, tb, pw, 0.2);
    });
    // neighbors on the left clap
    if (cam === 'lawnB') [[-1.2, -4.9, 9], [-1.95, -4.6, 10], [1.2, -4.9, 11], [1.95, -4.6, 12]].forEach(([x, z, i], j) => {
      const p = pose({ x, z, rotY: headAt(x, z, 0, -2.0), mouth: t > 27 ? 'smile' : 'o', eyes: blink(t, 60 + j) }); if (t < 27.2) { p.armA = A(-0.3, 0.2, -2.0, 0.8); p.armB = A(-0.3, 0.2, -2.0, -0.8); } else { const [ca, cb] = CLAP(t, j); p.armA = ca; p.armB = cb; p.crouch = 0.03 * Math.abs(Math.sin(t * 6.3 + j)); }
      showS(pool[i], 'sub', p, 1, 0);
    });
    if (cam === 'lawnA') [[-1.3, -5.2, 9], [1.1, -5.6, 10]].forEach(([x, z, i], j) => { const p = pose({ x, z, rotY: headAt(x, z, -0.6, -4.0) - 0.5, mouth: t > 24.5 ? 'o' : 'flat', eyes: blink(t, 70 + j), armA: A(-0.3, 0.2, -2.0, 0.8), armB: j ? A(-0.3, 0.2, -2.0, -0.8) : REST }); if (t > 24.5) p.headYaw = 0.5; showS(pool[i], 'sub', p, 1, 0); });
    jolts.push([EV.tourist, 0.01]);
  }

  // ================================================================ 5. CLINIC LAB (duck + tape measure out of the ceiling)
  const TB = [-0.15, -0.63], CEIL = [-0.5, 2.6, 0.15];
  const SCI = [[-0.75, -0.25, 0], [-0.5, 0.15, 1], [0.35, 0.1, 2], [0.6, -0.25, 3]];
  function labBeat(t) {
    const yp = sitPose({ x: TB[0], z: TB[1], rotY: 0, lean: -0.15, mouth: 'flat', eyes: blink(t, 14), armA: HEM_A, armB: HEM_B, headPitch: 0.15 }, 0.82, 0.35);
    if ((t > 31.15 && t < 31.9) || (t > 33.0 && t < 33.8)) { yp.headPitch = -0.55; yp.mouth = 'o'; }
    if (t > 34.4) { yp.headPitch = 0.0; yp.mouth = 'flat'; }
    show(you, 'lab', yp); shirt(true); belly.set(t, 1);
    const [pw] = bellyAt();
    exitAt(exits[0], 'lab', CEIL, [0, -1, 0], t, Math.min(boing(t, EV.duckOut - 0.15, 0.3), K(t, [[34.9, 1], [35.3, 0]])));
    const headS1 = L('lab', SCI[1][0], 1.62, SCI[1][1]);
    SCI.forEach(([x, z, i], j) => {
      const r = pool[i]; dress(r, 0xf6f7f8, 0x45607a);
      const p = pose({ x, z, rotY: headAt(x, z, TB[0], TB[1] + 1.6), mouth: 'flat', eyes: blink(t, 80 + j), headPitch: 0.35, lean: 0.08 }); look(p, x, z, TB[0], TB[1], 1, 0);
      if (i === 0) { p.armA = CLIP_A; p.armB = mixArm(PEN_B, A(-0.7, 0.05, -1.7, -0.7), 0.5 + 0.5 * Math.sin(t * 9)); clipboard.visible = true; }
      if (i === 1) { p.armA = A(-0.2, 0.1, -1.4, 0.6); p.armB = A(-0.2, 0.1, -1.4, -0.6); }
      if (i === 2) { const drop = K(t, [[30.3, 0], [30.6, 1]]); p.armB = mixArm(REST, A(-1.25, -0.1, -0.6, -0.2), drop); p.armA = REST; if (t > EV.duck) p.armB = mixArm(p.armB, REST, K(t, [[31.3, 0], [31.7, 1]])); }
      if (i === 3) { p.armB = t > 32.2 ? A(-1.0, 0.0, -0.8, -0.3) : A(-0.6, 0.1, -1.4, -0.5); p.armA = REST; tapeCase.visible = true; }
      const lookUp = Math.max(K(t, [[31.2, 0], [31.4, 1], [32.1, 1], [32.4, 0]]), K(t, [[33.05, 0], [33.25, 1], [34.3, 1], [34.6, 0]]));
      if (lookUp > 0) { p.headPitch = lerp(p.headPitch, -0.7, lookUp); p.mouth = 'o'; p.lean = lerp(p.lean, -0.05, lookUp); }
      if (i === 1) {
        const bonk = pulse(t, EV.bonk, 0.06, 0.5, 0.4); p.crouch = 0.08 * bonk; p.headPitch = lerp(p.headPitch, 0.35, bonk); if (bonk > 0.2) p.eyes = 'closed';
        if (t > EV.bonk + 0.2 && t < 33.0) { p.armB = HEAD_B; p.mouth = 'flat'; }
        if (t > 33.9) { p.headPitch = 0.2; p.mouth = 'flat'; p.headYaw = 0.6; p.armA = A(-0.2, 0.3, -1.6, 0.6); p.armB = A(-0.2, 0.3, -1.6, -0.6); }
      }
      show(r, 'lab', p); blow(r, 0, lookUp * 0.8);
    });
    // the duck: dropped in → falls out of the ceiling → bonks scientist 1 → bounces to the floor
    pool[2].root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(pool[2], 1).getWorldPosition(hw);
    if (t < 30.75) { duck.visible = true; duck.position.copy(hw).add(V3(0, -0.07, 0)); duck.rotation.set(0, -1.2, 0); duck.scale.setScalar(1); }
    else if (t < EV.duck) suck(duck, t, 30.75, EV.duck, hw.clone().add(V3(0, -0.07, 0)));
    else if (t > EV.duckOut) {
      duck.visible = true; duck.scale.setScalar(1); const c0 = L('lab', CEIL[0], CEIL[1] - 0.05, CEIL[2]);
      if (t < EV.bonk) { const u = (t - EV.duckOut) / (EV.bonk - EV.duckOut); duck.position.copy(c0).lerp(headS1.clone().add(V3(0, 0.2, 0)), u * u); duck.rotation.set(u * 4, 0, 0); }
      else { const a = t - EV.bonk; duck.position.copy(headS1).add(V3(0.6 * Math.min(a, 0.7), 0.2 + 1.6 * a - 4.9 * a * a, 0.35 * Math.min(a, 0.7))); duck.position.y = Math.max(OFF.lab[1] + 0.06, duck.position.y); duck.rotation.set(a * 9, a * 3, 0); }
    }
    impact(t, EV.bonk, 'lab', [SCI[1][0], 1.82, SCI[1][1]], 0.45, true);
    // the tape measure: from scientist 3's case into the belly; out of the ceiling onto scientist 1 again
    pool[3].root.updateMatrixWorld(true); const cw = new THREE.Vector3(); tapeCase.getWorldPosition(cw);
    if (t > 32.3) { tapeIn.g.visible = true; const u = K(t, [[32.3, 0], [EV.tape, 1]]); tapeIn.set(cw, cw.clone().lerp(pw, u)); }
    if (t > EV.tapeOut) { tapeOut.g.visible = true; const c0 = L('lab', CEIL[0], CEIL[1] - 0.02, CEIL[2]), l = Math.min(1.25, 1.6 * (t - EV.tapeOut)); const end = c0.clone().add(V3(0.05 * Math.sin(t * 3), -l, 0.04)); if (l > 0.98) end.add(V3(0.15 * (l - 0.98) / 0.27, 0, 0.2 * (l - 0.98) / 0.27)); tapeOut.set(c0, end); }
    swirlPuff(t, EV.duck, pw, 0.12); swirlPuff(t, EV.duckOut, exits[0].g.position, 0.18); swirlPuff(t, EV.tapeOut, exits[0].g.position, 0.15);
    jolts.push([EV.bonk, 0.008]);
  }

  // ================================================================ 6. PRESS CONFERENCE (flashes; a mic + papers sucked in; the mic lands on a back-row head)
  const REP = [[-0.55, 0.35], [0.95, 0.4], [0.2, 0.3], [1.55, 0.6], [-1.15, 0.7], [-0.2, 1.05], [0.6, 1.1], [1.3, 1.4], [-0.75, 1.55], [0.1, 1.8], [-0.35, 2.4], [0.75, 2.3]];
  const MIC_REP = 2, VICTIM = 11;
  const pressPapers = REP.slice(0, 6).flatMap(([x, z], i) => [0, 1, 2].map((k) => [x + (k - 1) * 0.12, 1.08 + 0.05 * k, z - 0.2, i * 3 + k]));
  function pressBeat(t, cam) {
    press.setFlashes(t, t > 38.7 ? 2.2 : 1.4);
    const yp = pose({ x: 0.85, z: -3.05, y: 0.25, floor: 0.25, rotY: -0.08, mouth: 'flat', eyes: blink(t, 15), armA: HEM_A, armB: HEM_B, headPitch: 0.05 });
    if (cam === 'pressA') { yp.mouth = Math.sin(t * 11) > 0.2 ? 'o' : 'flat'; yp.headYaw = 0.25 * Math.sin(t * 0.9); }
    blast(yp, pulse(t, EV.mic, 0.08, 0.7, 0.4), 0.2);
    if (t > EV.micBonk) { yp.headPitch = -0.05; yp.mouth = 'flat'; }
    show(you, 'press', yp); shirt(true); belly.set(t, 1 + 0.5 * pulse(t, EV.mic, 0.08, 0.8, 0.4), 1 + 0.6 * pulse(t, EV.mic, 0.08, 0.8, 0.4));
    const [pw] = bellyAt();
    const vic = REP[VICTIM];
    REP.forEach(([x, z], i) => {
      const r = pool[i]; const p = pose({ x, z, rotY: headAt(x, z, 0.85, -3.05), mouth: Math.sin(t * 7 + i) > 0.3 ? 'o' : 'flat', eyes: blink(t, 90 + i), headPitch: -0.08, lean: 0.06, armA: A(-0.65, 0.1, -1.5, 0.6), armB: i % 3 === 0 ? A(-1.6, 0.3, -1.2, -0.4) : i % 3 === 1 ? MIC_B : A(-0.65, 0.1, -1.5, -0.6) });
      if (cam === 'pressA' && (i === 1 || i === 3 || i === 7)) { p.armB = A(-2.6, 0.35, -0.5, -0.2); }
      if (i === MIC_REP && cam === 'pressB') { const st = K(t, [[38.4, 0.4], [38.6, 1]]); p.lean = 0.35 * st; p.armB = MIC_B; p.mouth = 'o'; if (t > EV.mic) { p.armB = mixArm(MIC_B, REST, K(t, [[EV.mic + 0.3, 0], [EV.mic + 0.7, 1]])); p.lean = 0.1; } }
      const suckK = cam === 'pressB' ? pulse(t, EV.papers, 0.1, 0.6, 0.5) : 0; if (i < 6) { p.lean = (p.lean || 0) + 0.25 * suckK; blow(r, 0, suckK); if (suckK > 0.2) p.mouth = 'o'; }
      if (t > EV.micBonk + 0.1) { p.headYaw = (i === VICTIM) ? 0 : Math.sign(x - vic[0] || 1) * -0.9 * K(t, [[EV.micBonk + 0.1, 0], [EV.micBonk + 0.4, 1]]); if (i !== VICTIM) p.mouth = 'o'; }
      if (i === VICTIM) { const b = pulse(t, EV.micBonk, 0.06, 0.6, 0.4); p.headPitch = 0.4 * b; if (b > 0.2) p.eyes = 'closed'; if (t > EV.micBonk + 0.5) { p.armB = HEAD_B; p.mouth = 'flat'; } }
      show(r, 'press', p);
    });
    if (cam === 'pressB') {
      pool[MIC_REP].root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(pool[MIC_REP], 1).getWorldPosition(hw);
      if (t < EV.mic) { mic.visible = true; mic.position.copy(hw).add(V3(0, 0.03, -0.06)); mic.rotation.set(-1.3, 0, 0); mic.scale.setScalar(1); }
      else if (t < EV.mic + 0.22) suck(mic, t, EV.mic, EV.mic + 0.22, hw.clone().add(V3(0, 0.03, -0.06)));
      else if (t > EV.micOut) {
        const c0 = L('press', vic[0], 2.45, vic[1]), head = L('press', vic[0], 1.3, vic[1] + 0.04); mic.visible = true; mic.scale.setScalar(1);
        if (t < EV.micBonk) { const u = (t - EV.micOut) / (EV.micBonk - EV.micOut); mic.position.copy(c0).lerp(head, u * u); mic.rotation.set(u * 6, 0, 0); }
        else { const a = t - EV.micBonk; mic.position.copy(head).add(V3(-0.5 * Math.min(a, 0.6), 1.3 * a - 4.9 * a * a, 0.3 * Math.min(a, 0.6))); mic.position.y = Math.max(OFF.press[1] + 0.03, mic.position.y); mic.rotation.set(a * 10, 0, a * 3); }
      }
      exitAt(exits[0], 'press', [vic[0], 2.5, vic[1]], [0, -1, 0], t, Math.min(boing(t, EV.micOut - 0.15, 0.3), K(t, [[40.5, 1], [40.9, 0]])));
      impact(t, EV.micBonk, 'press', [vic[0], 1.42, vic[1]], 0.4, true);
      // papers fly off the front-row laps into the belly, one after another
      pressPapers.forEach(([x, y, z, k]) => {
        if (used.paper >= DEB.paper.length) return; const m = DEB.paper[used.paper++]; const t0 = EV.papers + (k % 9) * 0.05 + Math.floor(k / 9) * 0.04, t1 = t0 + 0.45;
        if (t < t0) { m.visible = true; m.position.copy(L('press', x, y, z)); m.rotation.set(-PI / 2 + 0.3, 0, k); m.scale.setScalar(1); }
        else suck(m, t, t0, t1, L('press', x, y + 0.02, z));
      });
      swirlPuff(t, EV.mic + 0.2, pw, 0.15); swirlPuff(t, EV.micOut, exits[0].g.position, 0.15);
      jolts.push([EV.mic, 0.008], [EV.micBonk, 0.006]);
    }
  }

  // press room: a back wall behind the rows (the set has none) + a fill for the reverse angle
  { const bw = new THREE.Group(); press.root.add(bw); mk(new THREE.BoxGeometry(10.2, 3.4, 0.12), mat(0xe9e2d2, 0.9), bw, 0, 1.7, 5.9);
    mk(new THREE.BoxGeometry(1.0, 2.1, 0.06), mat(0x8a5a34, 0.6), bw, -2.6, 1.05, 5.83); mk(new THREE.BoxGeometry(0.9, 0.3, 0.04), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3dff7a).multiplyScalar(1.3), toneMapped: false }), bw, -2.6, 2.4, 5.83);
    mk(new THREE.BoxGeometry(10.2, 0.25, 0.14), mat(0x5a1f2a, 0.8), bw, 0, 0.12, 5.84);
    for (const [x, c] of [[0.6, 0x1c3a6e], [2.4, 0xb5462e]]) mk(new THREE.BoxGeometry(1.1, 0.75, 0.03), mat(c, 0.7), bw, x, 1.9, 5.83);
    const fl = new THREE.PointLight(0xfff0e0, 7, 9, 1.4); fl.position.set(0.7, 2.6, -1.0); press.root.add(fl); }
  // ================================================================ 7. THE LINE (goggles, head-first dives, everyone shuffles in sync)
  const CR = 0.32, LINE_Z = -1.45, STEP = 0.62;
  const crate = new THREE.Group(); street.root.add(crate); crate.position.set(0, SH, -1.6);
  mk(new THREE.BoxGeometry(0.55, CR, 0.45), mat(0xb98b5c, 0.85), crate, 0, CR / 2, 0); for (const y of [0.08, 0.2]) mk(new THREE.BoxGeometry(0.56, 0.03, 0.46), mat(0x8a6040, 0.85), crate, 0, y, 0);
  const signM = new THREE.MeshStandardMaterial({ roughness: 0.7, map: canvasTex(256, 360, (g, w, h) => { g.fillStyle = '#fff6dc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2483f'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#2f3a4a'; g.textAlign = 'center'; g.font = 'bold 50px Helvetica, Arial, sans-serif'; g.fillText('PORTAL', w / 2, 92); g.fillText('LINE', w / 2, 146); g.fillStyle = '#d2483f'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.fillText('WAIT FROM', w / 2, 220); g.fillText('HERE: 4 HRS', w / 2, 262); g.fillStyle = '#2f3a4a'; g.font = 'bold 54px Helvetica, Arial, sans-serif'; g.fillText('→', w / 2, 330); }) });
  const sign = new THREE.Group(); street.root.add(sign); sign.position.set(0.85, SH, -2.35); sign.rotation.y = -0.25;
  mk(new THREE.BoxGeometry(0.55, 0.78, 0.03), signM, sign, 0, 1.25, 0); mk(new THREE.BoxGeometry(0.04, 0.9, 0.04), mat(0x6b5a48, 0.6), sign, 0, 0.45, -0.03);
  for (let k = 0; k < 9; k++) { mk(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 10), mat(0xd8b45a, 0.3, { metalness: 0.7 }), street.root, 0.7 + k * 0.9, SH + 0.45, -0.95); if (k < 8) { const rp = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6), mat(0xa0202a, 0.7), street.root, 1.15 + k * 0.9, SH + 0.78, -0.95); rp.rotation.z = PI / 2; } }
  // the rest of the line round the block: instanced toy people
  const NC = 260, crowdB = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.75, 4, 10), new THREE.MeshStandardMaterial({ roughness: 0.8 }), NC), crowdH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshStandardMaterial({ roughness: 0.7 }), NC);
  crowdB.frustumCulled = crowdH.frustumCulled = false; street.root.add(crowdB, crowdH); crowdB.castShadow = crowdH.castShadow = true;
  const CROWD = Array.from({ length: NC }, (_, i) => { const r = rng(500 + i); const far = i >= 110; const x = far ? 75 - (i - 110) * 0.7 : 0.95 + STEP * 12 + i * 0.6; return { x, z: far ? 8.3 + (r() - 0.5) * 0.4 : LINE_Z + (r() - 0.5) * 0.3, ph: r() * 6, y: far ? SH : SH, far }; });
  CROWD.forEach((c, i) => { crowdB.setColorAt(i, new THREE.Color(TOPS[i % TOPS.length])); crowdH.setColorAt(i, new THREE.Color(SKINS[i % SKINS.length])); });
  const _m4 = new THREE.Matrix4();
  const lineShift = (t) => K(t, [[41.95, 0], [42.45, 1]]) + K(t, [[43.15, 0], [43.65, 1]]) + (t > EV.shuffle ? Math.floor((t - EV.shuffle) / 1.1) + K((t - EV.shuffle) % 1.1, [[0, 0], [0.5, 1]]) : 0);
  function lineBeat(t, cam) {
    const yp = pose({ x: 0, z: -1.6, y: SH + CR, floor: SH + CR, rotY: 0.15, mouth: 'flat', eyes: blink(t, 16), armA: HEM_A, armB: HEM_B, headPitch: 0.15 });
    const hit = Math.max(...EV.dives.map((d) => pulse(t, d, 0.06, 0.25, 0.3))); yp.lean = -0.15 * hit; if (hit > 0.3) { yp.mouth = 'o'; yp.eyes = 'closed'; }
    if (cam === 'lineB') { yp.headYaw = 0.9; yp.mouth = 'flat'; }
    show(you, 'street', yp); shirt(true); belly.set(t, 2.3, 1.15);
    const [pw] = bellyAt(), a = toLocal('street', pw);
    const sh = lineShift(t);
    for (let i = 0; i < 12; i++) {
      const r = pool[i]; const slot = i - sh; const x = 0.95 + STEP * slot;
      const divT = i < 2 ? EV.dives[i] : 1e9;
      const p = pose({ x, z: LINE_Z, y: SH, floor: SH, rotY: -PI / 2 + 0.25 * Math.sin(i * 1.7), mouth: i % 3 ? 'smile' : 'flat', eyes: blink(t, 100 + i), dist: STEP * sh, speed: 0 });
      const moving = (sh % 1) > 0.02 && (sh % 1) < 0.98; if (moving) p.speed = 1.1;
      if (t >= divT - 0.55 && t < divT) {
        const u = clamp((t - (divT - 0.55)) / 0.55), s = 1 - 0.95 * u * u;
        Object.assign(p, { armA: UP_A, armB: UP_B, mouth: 'o', eyes: 'closed' });
        const C0 = [x, SH + 1.0, LINE_Z]; const C = [lerp(C0[0], a[0], u), lerp(C0[1], a[1], u) + 0.35 * Math.sin(u * PI), lerp(C0[2], a[2], u)];
        showC(r, 'street', p, C, Math.atan2(a[0] - C0[0], a[2] - C0[2]), 1.45 * clamp(u * 2), 0, s);
        if (i < 3) hat(HATS.goggles[i], r, 0.0); if (i < 2) hat(HATS.caps[i], r, 0.55);
        continue;
      }
      if (t >= divT) { r.root.visible = false; continue; }
      if (slot < 0.6 && t < divT - 0.55) { p.armA = A(-2.6, 0.2, -0.3); p.armB = A(-2.6, 0.2, -0.3); p.crouch = 0.06 * Math.sin(t * 9); p.mouth = 'smile'; }
      if (i >= 2 && cam === 'lineA') { const lk = pulse(t, EV.dives[0], 0.1, 0.6, 0.4) + pulse(t, EV.dives[1], 0.1, 0.6, 0.4); if (lk > 0.2) { p.mouth = 'o'; p.armB = A(-0.3, 0.2, -2.0, -0.8); } }
      if (cam === 'lineB' && i % 4 === 1) { p.armB = PHONE_B; }
      if (cam === 'lineB' && i % 4 === 3) { p.armA = A(-0.6, 0.1, -1.5, 0.6); p.armB = A(-0.6, 0.1, -1.5, -0.6); }
      showS(r, 'street', p, 1, SH);
      if (i < 3) hat(HATS.goggles[i], r, 0.0); if (i < 2) hat(HATS.caps[i], r, 0.55);
    }
    CROWD.forEach((c, i) => { const x = c.far ? c.x + STEP * sh : c.x - STEP * sh, b = 0.02 * Math.abs(Math.sin(t * 3 + c.ph)); _m4.makeTranslation(x, c.y + 0.55 + b, c.z); crowdB.setMatrixAt(i, _m4); _m4.makeTranslation(x, c.y + 1.3 + b, c.z); crowdH.setMatrixAt(i, _m4); });
    crowdB.instanceMatrix.needsUpdate = crowdH.instanceMatrix.needsUpdate = true;
    EV.dives.forEach((d) => swirlPuff(t, d, pw, 0.3));
    jolts.push([EV.dives[0], 0.008], [EV.dives[1], 0.008]);
  }

  // ================================================================ 8. LAUNCH PAD + MARS
  const PADY = 0.4;
  const board = new THREE.Group(); pad.root.add(board); board.position.set(0, PADY, -0.2); board.rotation.x = -0.12;
  mk(new THREE.BoxGeometry(0.75, 2.05, 0.06), mat(0xd8dcdf, 0.5, { metalness: 0.3 }), board, 0, 1.02, 0); for (const y of [0.55, 1.0]) mk(new THREE.BoxGeometry(0.8, 0.07, 0.34), mat(0xd2483f, 0.6), board, 0, y, 0.13);
  mk(new THREE.BoxGeometry(1.2, 0.08, 0.7), mat(0x55575a, 0.8), board, 0, 0.0, 0.1);
  const roverKit = new THREE.Group(); pad.root.add(roverKit); roverKit.position.set(-1.6, PADY, -0.6);
  for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.6, 0.5, 0.5), mat([0xf4f4f2, 0xd8dcdf, 0x3d7bd9][k], 0.6), roverKit, k * 0.65, 0.25, k * 0.1);
  function padBeat(t) {
    const yp = pose({ x: 0, z: 0, y: PADY, floor: PADY, rotY: 0, lean: -0.08, mouth: 'flat', eyes: blink(t, 17), armA: A(0.02, 0.18, -0.1), armB: A(0.02, 0.18, -0.1), headPitch: 0.1 });
    if (t > 48.2 && t < 48.8) { yp.mouth = 'o'; yp.headPitch = 0.45; }
    if (t > 48.9) { yp.headPitch = 0; yp.headYaw = 0.3; yp.mouth = 'flat'; }
    show(you, 'pad', yp); shirt(true); belly.set(t, 1.7, 1.1);
    const [pw] = bellyAt();
    const E = [[0.62, 0.55, 1], [-0.38, 0.6, 0]];
    E.forEach(([x, z, i], j) => {
      const r = pool[i]; dress(r, 0xf4f4f2, 0xf4f4f2);
      const p = pose({ x, z, y: PADY, floor: PADY, rotY: headAt(x, z, 0.4, 1.8), mouth: 'flat', eyes: blink(t, 120 + j), headPitch: 0.35, lean: 0.15 }); look(p, x, z, 0, 0, 1, 0);
      if (i === 1) { const push = K(t, [[47.7, 0], [48.3, 1]]); p.armA = mixArm(HOLD_A, A(-1.15, 0.0, -0.4, 0.4), push); p.armB = mixArm(HOLD_B, A(-1.15, 0.0, -0.4, -0.4), push); p.lean = 0.15 + 0.35 * push; p.crouch = 0.1 * push; if (t > 48.5) { p.lean = 0.05; p.headPitch = 0.1; p.armA = REST; p.armB = A(-2.4, 0.3, -0.4, -0.2); p.mouth = 'smile'; } }
      else { p.armA = CLIP_A; p.armB = mixArm(PEN_B, A(-0.7, 0.05, -1.7, -0.7), 0.5 + 0.5 * Math.sin(t * 8)); clipboard.visible = true; if (t > 48.4) { p.headPitch = -0.1; p.mouth = 'o'; p.headYaw = 0.4; } }
      show(r, 'pad', p); hat(HATS.hard[j], r, 0.9);
    });
    pool[1].root.updateMatrixWorld(true); const ha = new THREE.Vector3(), hb = new THREE.Vector3(); handOf(pool[1], -1).getWorldPosition(ha); handOf(pool[1], 1).getWorldPosition(hb);
    const hold = ha.clone().add(hb).multiplyScalar(0.5).add(V3(0, -0.02, 0));
    if (t < 48.0) { rover.visible = true; rover.position.copy(hold).add(V3(0, -0.12, 0)); rover.rotation.set(0, headAt(0.62, 0.55, 0, 0), 0); rover.scale.setScalar(1); }
    else suck(rover, t, 48.0, EV.rover, hold.clone().add(V3(0, -0.12, 0)));
    swirlPuff(t, EV.rover, pw, 0.25);
    jolts.push([EV.rover, 0.008]);
  }
  function marsBeat(t) {
    const PM = [0, 1.45, 0];
    exitAt(exits[1], 'mars', PM, [0, -0.15, 1], t, Math.min(boing(t, 49.7, 0.4), K(t, [[51.5, 1], [51.9, 0]])), 1.2);
    if (t > EV.roverOut) {
      rover.visible = true; rover.scale.setScalar(1.8); const a = t - EV.roverOut, LT = EV.roverLand - EV.roverOut;
      if (a < LT) { const u = a / LT; rover.position.copy(L('mars', 0.05 * u, lerp(PM[1] - 0.2, 0, u * u) + 0.35 * Math.sin(u * PI), lerp(0.1, 1.6, u))); rover.rotation.set(0.6 * (1 - u), 0.2, 0.3 * Math.sin(u * 6)); }
      else { const b = a - LT; rover.position.copy(L('mars', 0.05 + 0.04 * b, 0.22 * Math.abs(Math.sin(b * 7)) * Math.exp(-b * 4), 1.6 + 0.35 * Math.max(0, b - 0.4))); rover.rotation.set(0.12 * Math.sin(b * 7) * Math.exp(-b * 4), 0.2, 0); }
      rover.wheels.forEach((w) => (w.rotation.x = t * 6));
    }
    impact(t, EV.roverLand, 'mars', [0.05, 0.15, 1.6], 0.7, false, dustCol);
    impact(t, EV.roverLand + 0.2, 'mars', [0.15, 0.1, 1.75], 0.5, false, dustCol);
    swirlPuff(t, EV.roverOut, exits[1].g.position, 0.3, new THREE.Color(0xe8c8ff));
    jolts.push([EV.roverLand, 0.012]);
  }

  // ================================================================ 9. GRANDMA'S KITCHEN (you tumble out; the hug)
  const KP = [-0.75, 1.3, 1.4], YOU_K = [0.3, 1.05], GMA0 = [-1.1, -1.85], GMA1 = [-0.18, 1.05];
  tray.position.set(-0.5 + OFF.kit[0], 0.93, -2.2); tray.rotation.y = 0.1;
  function kitBeat(t) {
    exitAt(exits[1], 'kit', KP, [1, 0, 0.15], t, Math.min(boing(t, 56.65, 0.35), K(t, [[57.9, 1], [58.3, 0]])), 1.1); exits[1].warm(true);
    tray.visible = true;
    // you: fly out spinning → sit on the floor → stand → step in → the hug
    const yp = pose({ mouth: 'o', eyes: 'open' });
    if (t < EV.land) {
      const u = clamp((t - EV.arrive) / (EV.land - EV.arrive)), s = 0.15 + 0.85 * easeOutBack(u);
      if (t >= EV.arrive) { Object.assign(yp, { armA: UP_A, armB: UP_B }); showC(you, 'kit', yp, [lerp(KP[0], 0.15, u), lerp(KP[1], 0.45, u) + 0.3 * Math.sin(u * PI), lerp(KP[2], 1.2, u)], PI / 2, 0, u * 6.3, s); }
    } else {
      const st = K(t, [[57.7, 0], [58.2, 1]]), step = K(t, [[58.25, 0], [58.75, 1]]);
      Object.assign(yp, { x: lerp(0.15, YOU_K[0], step), z: lerp(1.2, YOU_K[1], step), y: lerp(-0.62, 0, st), floor: 0, footFwd: lerp(0.62, 0, st), rotY: lerp(0.4, -PI / 2, K(t, [[57.5, 0], [58.2, 1]])), lean: lerp(0.15, 0, st),
        armA: mixArm(A(0.4, 0.3, -0.3, 0.2), REST, st), armB: mixArm(A(0.4, 0.3, -0.3, -0.2), REST, st), mouth: t < 57.7 ? 'o' : 'smile', eyes: blink(t, 18), headPitch: t < 57.5 ? -0.2 : 0 });
      if (t > 57.25 && t < 57.6) yp.crouch = 0.1 * Math.exp(-(t - 57.25) * 8);
      const hug = K(t, [[EV.hug - 0.25, 0], [EV.hug + 0.1, 1]]);
      if (t > 58.4) { yp.armA = mixArm(REST, OUT_A, K(t, [[58.4, 0], [58.7, 1]])); yp.armB = mixArm(REST, OUT_B, K(t, [[58.4, 0], [58.7, 1]])); }
      if (hug > 0) { yp.armA = mixArm(yp.armA, HUG_A, hug); yp.armB = mixArm(yp.armB, HUG_B, hug); yp.lean = 0.12 * hug; yp.headRoll = 0.15 * hug; yp.headPitch = 0.15 * hug; if (t > 59.3) yp.eyes = 'closed'; yp.rotY += 0.06 * Math.sin(t * 1.8) * hug; }
      show(you, 'kit', yp);
    }
    // Grandma: at the stove → turns, the mitt flies → walks over, arms out → the hug
    const turn = K(t, [[57.3, 0], [57.65, 1]]), wk = K(t, [[57.95, 0], [58.85, 1]]);
    const gp = pose({ x: lerp(GMA0[0], GMA1[0], wk), z: lerp(GMA0[1], GMA1[1], wk), rotY: lerp(PI, headAt(GMA0[0], GMA0[1], GMA1[0], GMA1[1]), turn), mouth: t > 57.3 ? 'o' : 'smile', eyes: blink(t, 19), armA: A(-0.6, 0.1, -1.2, 0.6), armB: A(-0.6, 0.1, -1.2, -0.6), headPitch: 0.1 });
    if (wk > 0) { gp.dist = 2.6 * wk; gp.speed = wk < 1 ? 1.0 : 0; gp.armA = mixArm(A(-0.6, 0.1, -1.2, 0.6), OUT_A, clamp(wk * 2)); gp.armB = mixArm(A(-0.6, 0.1, -1.2, -0.6), OUT_B, clamp(wk * 2)); gp.mouth = 'smile'; }
    if (wk >= 1) gp.rotY = PI / 2;
    else if (wk > 0) gp.rotY = lerp(headAt(GMA0[0], GMA0[1], GMA1[0], GMA1[1]), PI / 2, K(t, [[58.5, 0], [58.85, 1]]));
    const ghug = K(t, [[EV.hug - 0.2, 0], [EV.hug + 0.1, 1]]);
    if (ghug > 0) { gp.armA = mixArm(gp.armA, HUG_A, ghug); gp.armB = mixArm(gp.armB, HUG_B, ghug); gp.lean = 0.1 * ghug; gp.headRoll = -0.18 * ghug; gp.headPitch = -0.05; gp.eyes = 'closed'; gp.rotY += 0.06 * Math.sin(t * 1.8 + 0.4) * ghug; gp.headYaw = 0.25 * ghug; }
    show(grandma, 'kit', gp); if (t > 57.3 && t < 58.3) blow(grandma, 0, 1);
    // the mitt
    grandma.root.updateMatrixWorld(true); const hw = new THREE.Vector3(); handOf(grandma, 1).getWorldPosition(hw);
    mitt.visible = true; if (t < 57.55) mitt.position.copy(hw); else { const a = t - 57.55; mitt.position.set(hw.x * 0 + L('kit', GMA0[0] + 0.25, 0, GMA0[1] + 0.2).x + 0.2 * a, Math.max(0.03, 1.05 + 2.2 * a - 4.9 * a * a), L('kit', 0, 0, GMA0[1] + 0.2 + 0.3 * Math.min(a, 0.7)).z); mitt.rotation.set(a * 8, 0, a * 5); }
    // Grandpa at the table: sip → spit-take surprise → laughs + claps
    const pp = sitPose({ x: 1.35, z: -0.4, rotY: -PI / 2 + 0.5, mouth: 'smile', eyes: blink(t, 21), headPitch: 0.1, armA: A(-0.6, 0.1, -1.2, 0.6), armB: CUP_B }, 0.45);
    const sip = K(t, [[56.6, 0.8], [56.9, 1], [57.2, 1], [57.5, 0]]); pp.armB = mixArm(CUP_B, SIP_B, sip);
    if (t > 57.2) { pp.headYaw = 0.3; pp.mouth = 'o'; pp.lean = -0.1; }
    if (t > 59.4) { const [ca, cb] = CLAP(t, 0.5); pp.armA = ca; pp.armB = cb; pp.mouth = Math.sin(t * 9) > -0.3 ? 'o' : 'smile'; pp.headPitch = -0.15 + 0.07 * Math.sin(t * 9); pp.eyes = 'closed'; pp.headYaw = 0.2; }
    show(grandpa, 'kit', pp);
    grandpa.root.updateMatrixWorld(true); const gw = new THREE.Vector3(); handOf(grandpa, 1).getWorldPosition(gw);
    gMug.visible = true; if (t < 59.4) { gMug.position.copy(gw).add(V3(0, 0.02, 0.03)); gMug.rotation.set(0, 0, 0); } else gMug.position.copy(L('kit', 1.0, 0.8, -0.35));
    swirlPuff(t, EV.arrive, exits[1].g.position, 0.3, new THREE.Color(0xffd8a0));
    impact(t, EV.land, 'kit', [0.15, 0.1, 1.2], 0.5, false);
    jolts.push([EV.land, 0.012]);
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200): arm presets on one figure each
  const LINEUP = [['HEM', HEM_A, HEM_B], ['PICK', HEM_A, PICK_B], ['HOLD', HOLD_A, HOLD_B], ['CAM', CAM_A, CAM_B], ['GUIT', GUIT_A, STRUM_B(0)], ['TRUMP', TRUMP_A, TRUMP_B], ['CLIP', CLIP_A, PEN_B], ['MIC/HEAD', HEAD_B, MIC_B], ['HUG', HUG_A, HUG_B], ['OUT', OUT_A, OUT_B]];
  const HEMS = [HEM_A, A(-0.25, 0.35, -1.6, 0.5), A(-0.15, 0.25, -1.9, 0.3), A(-0.3, 0.45, -1.4, 0.9), A(-0.05, 0.3, -1.75, 0.0), A(-0.35, 0.2, -1.5, -0.2), A(-0.2, 0.5, -1.7, 0.2)];
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    ROOTS.lab.visible = true; scene.fog = null;
    const page = Math.floor(t - 200), h = HEMS[page % HEMS.length];
    show(you, 'lab', pose({ x: 0, z: 0.6, rotY: 0, armA: h, armB: { ...h, twist: -h.twist } })); shirt(true); belly.set(t, 1);
    studio.setCamera(L('lab', 0.3, 1.25, 2.1).toArray(), L('lab', 0, 1.1, 0.6).toArray(), 40, t, 0);
  }

  // ---------------------------------------------------------------- per-frame
  let cur = null;
  const hideList = [lint, keys, remote, cat.g, pigeon.root, floorFish, flash, duck, tapeIn.g, tapeOut.g, mic, rover, cookie, gHand, tray, mitt, gMug, jet, puddle, leak, ...guitars, ...trumpets];
  function update(t) {
    all.forEach((r) => { r.root.visible = false; resetFace(r); r.root.scale.setScalar(1); r.root.rotation.set(0, 0, 0); dress(r, r.top0, r.pants0); });
    hideList.forEach((o) => (o.visible = false)); clipboard.visible = false; tapeCase.visible = false;
    Object.values(HATS).flat().forEach((h) => (h.visible = false));
    PORTALS.forEach((P) => P.set(t, 0)); belly.warm(false); exits.forEach((e) => e.warm(false)); belly.g.visible = true; shirt(false);
    underL.intensity = 0; underL.color.set(0xa070ff);
    stars.forEach((s) => (s.visible = false)); puffs.hide(); starN = 0; puffN = 0; jolts.length = 0;
    Object.keys(DEB).forEach((k) => { DEB[k].forEach((m) => (m.visible = false)); used[k] = 0; });
    if (myChair) myChair.position.z = LD.chairZ;
    if (t >= 200) { lineup(t); return; }
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (cur !== S) {
      Object.entries(ROOTS).forEach(([k, r]) => (r.visible = k === S));
      scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'pad' || S === 'mars' || S === 'paris' ? 0.1 : 0.05; studio.camera.updateProjectionMatrix();
      cur = S;
    }
    const o = OFF[S];
    const [p0, a0] = camAt(CAMS[cam], t); let P = p0.map((v, i) => v + o[i]); const Aim = a0.map((v, i) => v + o[i]); const fov = CAMS[cam].fov;

    if (S === 'liv') couchBeat(t, cam);
    else if (cam === 'paris') parisBeat(t);
    else if (S === 'laund') laundBeat(t, cam);
    else if (S === 'sub') lawnBeat(t, cam);
    else if (cam === 'lab') labBeat(t);
    else if (S === 'press') pressBeat(t, cam);
    else if (S === 'street') { street.aimSun && street.aimSun(3, -1.5, 9); lineBeat(t, cam); }
    else if (cam === 'pad') padBeat(t);
    else if (cam === 'mars') marsBeat(t);
    else if (cam === 'gma') kitBeat(t);

    for (const [m, k0] of jolts) if (t > m && t < m + 0.6) { const k = k0 * Math.exp(-(t - m) * 7); P = [P[0] + k * Math.sin(t * 70 + m), P[1] + k * Math.sin(t * 55 + m), P[2] + k * 0.5 * Math.sin(t * 63)]; }
    studio.setCamera(P, Aim, fov, t, 0.006);
    if (story.debugView) story.debugView = { center: [Aim[0], 0, Aim[2]], height: 9 };
  }
  return { update };
}
