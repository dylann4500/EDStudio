// 060 — "What if Italy rebuilt the Leaning Tower of Pisa with pizza?" — the first reel in the ISO DIORAMA style (engine/iso/),
// a Scribe dupe of @okwhatifcrazy's 1.4M-view reel (tiktok.com/@okwhatifcrazy/video/7694373909105347863, 75 s, no narrator).
// Original beats (studied Nov 9 with frame grids): a tourist pushes the tower over → "Italy has one way to fix things" (ministry +
// a REBUILD WITH PIZZA blueprint) → dough → toss → toppings, no pineapple → the Colosseum becomes an oven → the foundation arrives
// by air → stack and stack → finishing touches (windows cut, basil) → perfectly straight → nobody can do the pose → a pigeon
// lands and it leans 3.97° again. Ours keeps every beat (shorter, ~4 s each) and plugs Scribe where the build would stall: the
// city wants the physics (40 problems, handwritten: lever arm, free-body diagram, torque) → Luca, one photo → Scribe → approved.
// Each place is its own floating diorama parked at OFF[...]; one is visible per shot. All lines/art/names are ours.
import * as THREE from 'three';
import { K, clamp, lerp, rng, smooth } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makePigeon } from '@engine/build/toon.js';
import { loadHand, layoutHand, makeSheet, makeScreen, loadImg } from '@engine/build/scribe.js';
import { addTiltShift } from '@engine/iso/tiltshift.js';
import { isoLights, isoBackdrop, makeMotes } from '@engine/iso/look.js';
import { isoCam, isoAt } from '@engine/iso/camera.js';
import { makeBase, groundTexture, makeFloatShadow } from '@engine/iso/base.js';
import { makeMini, makePeg, makePegCrowd } from '@engine/iso/people.js';
import { makeTree, makeHouse, makeLamp, makeBench, makeStall, makeCar, makeCrane, makeFence, makePlane, makeTruck, makeFlagPole } from '@engine/iso/props.js';
import { makePisaTower, makeDuomo, makeBaptistery, makeCityWall, makeColosseum, arcadeTex } from '@engine/iso/italy.js';
import { makeRoom, isoDesk, isoChair, isoBed, isoShelf, isoRug, isoPoster, isoDeskLamp } from '@engine/iso/room.js';
import { makePuffs, boing, kick } from '@engine/iso/fx.js';
import { makeIsoHud, ISO_FONTS } from '@engine/iso/hud.js';

const PI = Math.PI, D2R = PI / 180;
const OFF = { PZ: [0, 0, 0], MN: [300, 0, 0], ST: [600, 0, 0], CO: [900, 0, 0], RM: [1200, 0, 0] };
// the tower on the piazza: T = centre of its foot; it falls (and later leans) along DIR = screen-right of the az-40 camera
const T = [1.5, 0, -0.5], FALL_YAW = 40 * D2R, DIR = [Math.cos(FALL_YAW), 0, -Math.sin(FALL_YAW)];
const TIP = { start: 3.6, impact: 6.3 };   // the push → the fall
const DROP = { t0: 28.0, t1: 29.4 };       // the air-dropped foundation
const STACK = { t0: 43.4, t1: 46.3, n: 96 };
const CUT = { t0: 46.8, t1: 48.2, n: 120 }, BASIL = 48.3;
const PIGEON = { land: 53.3, lean0: 53.45, lean1: 54.3 };
const PH = { photo: 36.75 };               // the phone flash

// shots: set, keyframed iso camera (local coords of the set), focus point (local), dof = tilt-shift range/ramp as × frame
export const SHOTS = [
  { t0: 0.0, t1: 3.4, set: 'PZ', keys: [[0, { tx: 0, ty: 1.2, tz: 0, az: 32, el: 33, frame: 31 }], [3.4, { az: 40, frame: 28 }]], focus: [1, 2, 0] },
  { t0: 3.4, t1: 5.0, set: 'PZ', keys: [[3.4, { tx: 0.35, ty: 1.25, tz: 0.6, az: 62, el: 16, frame: 4.6 }], [5.0, { az: 57, frame: 4.3, ty: 1.45 }]], focus: 'hero' },
  { t0: 5.0, t1: 7.0, set: 'PZ', keys: [[5.0, { tx: 4.5, ty: 3.0, tz: -2.6, az: 40, el: 34, frame: 27 }], [7.0, { az: 43, frame: 25 }]], focus: [5, 1, -3] },
  { t0: 7.0, t1: 8.8, set: 'PZ', keys: [[7.0, { tx: 3.5, ty: 1.2, tz: -2, az: 18, el: 36, frame: 21 }], [8.8, { az: 24, frame: 19 }]], focus: [4, 0.6, -2.5] },
  { t0: 8.8, t1: 10.1, set: 'MN', keys: [[8.8, { tx: 0.1, ty: 1.15, tz: -0.5, az: 26, el: 30, frame: 4.4 }], [10.1, { az: 31, frame: 4.0 }]], focus: [0.1, 1.0, -0.6] },
  { t0: 10.1, t1: 11.0, set: 'MN', keys: [[10.1, { tx: 0.05, ty: 0.78, tz: -0.42, az: 8, el: 68, frame: 1.25 }], [11.0, { az: 12, frame: 1.1 }]], focus: [0.05, 0.78, -0.42], dof: 2.5 },
  { t0: 11.0, t1: 15.0, set: 'ST', keys: [[11.0, { tx: 0, ty: 2.2, tz: 0, az: 30, el: 34, frame: 24 }], [15.0, { az: 42, frame: 17 }]], focus: [0, 2, 0] },
  { t0: 15.0, t1: 19.0, set: 'ST', keys: [[15.0, { tx: 0, ty: 2.6, tz: 0, az: 120, el: 22, frame: 19 }], [16.0, { ty: 6.2 }], [17.0, { ty: 11.2 }], [18.3, { ty: 3 }], [19.0, { az: 128, frame: 18, ty: 2.2 }]], focus: 'disc' },
  { t0: 19.0, t1: 23.0, set: 'ST', keys: [[19.0, { tx: 0, ty: 0.8, tz: 0.5, az: 205, el: 42, frame: 17 }], [21.2, { az: 214, frame: 15.5 }], [23.0, { tx: -3.5, az: 222, frame: 19 }]], focus: [0, 0.4, 0] },
  { t0: 23.0, t1: 27.0, set: 'CO', keys: [[23.0, { tx: 0, ty: 3.2, tz: 0.8, az: 28, el: 32, frame: 22 }], [27.0, { az: 40, frame: 19 }]], focus: [0, 2.6, 2] },
  { t0: 27.0, t1: 30.6, set: 'PZ', keys: [[27.0, { tx: 1.5, ty: 6.5, tz: -0.5, az: 36, el: 26, frame: 30 }], [28.6, { ty: 5 }], [30.6, { ty: 2.5, az: 42, frame: 26 }]], focus: 'drop' },
  { t0: 30.6, t1: 32.4, set: 'PZ', keys: [[30.6, { tx: 3.9, ty: 1.35, tz: 1.9, az: 50, el: 24, frame: 5.0 }], [32.4, { az: 56, frame: 4.5 }]], focus: [3.7, 1.2, 1.9] },
  { t0: 32.4, t1: 36.0, set: 'RM', keys: [[32.4, { tx: 0, ty: 1.2, tz: -0.2, az: 24, el: 32, frame: 5.4 }], [36.0, { az: 32, frame: 4.4 }]], focus: [0, 1.0, -0.3] },
  { t0: 36.0, t1: 37.6, set: 'RM', keys: [[36.0, { tx: -0.05, ty: 1.0, tz: -0.1, az: 180, el: 84, frame: 0.26 }], [37.6, { az: 183, frame: 0.24 }]], focus: [-0.05, 1.0, -0.1], dof: 2 },
  { t0: 37.6, t1: 39.6, set: 'RM', keys: [[37.6, { tx: 0.02, ty: 0.9, tz: 0.2, az: 180, el: 12, frame: 0.42 }], [39.6, { az: 182, frame: 0.38 }]], focus: 'screen', dof: 2.5 },
  { t0: 39.6, t1: 41.6, set: 'RM', keys: [[39.6, { tx: 0, ty: 0.76, tz: -0.15, az: 180, el: 74, frame: 0.17 }], [41.6, { az: 183, frame: 0.15 }]], focus: 'pen', dof: 3 },
  { t0: 41.6, t1: 43.2, set: 'PZ', keys: [[41.6, { tx: 4.2, ty: 1.15, tz: 2.0, az: 40, el: 26, frame: 5.2 }], [43.2, { az: 34, frame: 5.8 }]], focus: [4.3, 0.9, 2.0] },
  { t0: 43.2, t1: 46.6, set: 'PZ', keys: [[43.2, { tx: 0, ty: 4, tz: -1.5, az: 34, el: 30, frame: 26 }], [46.6, { ty: 6.5, az: 44, frame: 25 }]], focus: 'stackTop' },
  { t0: 46.6, t1: 49.0, set: 'PZ', keys: [[46.6, { tx: 1.5, ty: 5, tz: -0.5, az: 70, el: 28, frame: 13 }], [48.1, { ty: 8.5, frame: 12 }], [49.0, { ty: 10.5, az: 76, frame: 10 }]], focus: 'cutter' },
  { t0: 49.0, t1: 50.8, set: 'PZ', keys: [[49.0, { tx: 1.0, ty: 5.6, tz: 0, az: 40, el: 24, frame: 20 }], [50.8, { az: 46, frame: 19 }]], focus: [1.5, 5, -0.5] },
  { t0: 50.8, t1: 52.6, set: 'PZ', keys: [[50.8, { tx: 0.35, ty: 1.3, tz: 0.6, az: 60, el: 16, frame: 4.6 }], [52.6, { az: 64, frame: 4.3 }]], focus: 'hero' },
  { t0: 52.6, t1: 54.2, set: 'PZ', keys: [[52.6, { tx: 1.6, ty: 11.6, tz: -0.6, az: 52, el: 24, frame: 7.0 }], [54.2, { az: 46, frame: 7.6, ty: 11.3 }]], focus: 'top' },
  { t0: 54.2, t1: 59.6, set: 'PZ', keys: [[54.2, { tx: 1.0, ty: 5.2, tz: -0.2, az: 52, el: 24, frame: 19 }], [55.4, { az: 50, frame: 20 }], [59.6, { az: 60, frame: 26, ty: 4.5 }]], focus: [1.0, 4, 0] },
];
export const CUTS = SHOTS.slice(1).map((s) => s.t0);

// --- arm presets (rig.js: sx < 0 forward, sz > 0 out, el < 0 bends; armA = the figure's −x arm) ---
const A = (sx, sz, el, twist = 0) => ({ sx, sz, el, twist, free: 0 });
const PUSH_A = A(-1.45, 0.12, -0.35, 0.2), PUSH_B = A(-1.45, 0.12, -0.35, -0.2);
const SHRUG_A = A(-0.3, 0.9, -1.4, 0.6), SHRUG_B = A(-0.3, 0.9, -1.4, -0.6);
const CHEER_A = A(-0.4, 2.5, -0.3), CHEER_B = A(-0.4, 2.5, -0.3);
const HEAD_A = A(-0.6, 1.9, -2.3, 0.4), HEAD_B = A(-0.6, 1.9, -2.3, -0.4);
const TYPE_A = A(-0.95, 0.1, -0.85, 0.3), TYPE_B = A(-0.95, 0.1, -0.85, -0.3);
const HOLD_A = A(-1.25, 0.18, -0.9, 0.5), HOLD_B = A(-1.25, 0.18, -0.9, -0.5);

function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { c, g }; return t; }
const M = (c, r = 0.75, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...x });
const shadowAll = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ---------------------------------------------------------------- pizza pieces
function pizzaTopTex(seed = 1, { sauce = true, cheese = true, pep = 14, basil = 3, baked = 0.6 } = {}) {
  const R = rng(seed);
  return tex(512, 512, (g) => {
    g.fillStyle = '#f0d9a2'; g.fillRect(0, 0, 512, 512);
    if (sauce) { g.fillStyle = '#c8321f'; g.beginPath(); g.arc(256, 256, 236, 0, 7); g.fill(); }
    if (cheese) for (let i = 0; i < 90; i++) { const a = R() * 6.28, r = R() * 200; g.fillStyle = R() < 0.5 ? '#ffe9a6' : '#fff3c8'; g.beginPath(); g.ellipse(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 18 + R() * 26, 14 + R() * 20, R() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < baked * 70; i++) { const a = R() * 6.28, r = R() * 220; g.fillStyle = `rgba(150,80,20,${0.15 + R() * 0.2})`; g.beginPath(); g.arc(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 4 + R() * 9, 0, 7); g.fill(); }
    for (let i = 0; i < pep; i++) { const a = (i / pep) * 6.28 + R(), r = 50 + R() * 160; const x = 256 + Math.cos(a) * r, y = 256 + Math.sin(a) * r; g.fillStyle = '#a3261c'; g.beginPath(); g.arc(x, y, 26, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x - 6, y - 6, 9, 0, 7); g.fill(); }
    for (let i = 0; i < basil; i++) { const x = 140 + R() * 230, y = 140 + R() * 230; g.fillStyle = '#2f7d32'; g.beginPath(); g.ellipse(x, y, 26, 14, R() * 3, 0, 7); g.fill(); }
  });
}
function crustTex() {
  return tex(512, 64, (g) => {
    const R = rng(9); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#e9b36a'); gr.addColorStop(0.5, '#d48f45'); gr.addColorStop(1, '#b8733a');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 64);
    for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '120,60,20' : '255,230,170'},${0.2 + R() * 0.3})`; g.beginPath(); g.ellipse(R() * 512, R() * 64, 3 + R() * 8, 2 + R() * 4, 0, 0, 7); g.fill(); }
    g.fillStyle = '#c8321f'; g.fillRect(0, 0, 512, 5); g.fillStyle = '#ffe9a6'; for (let x = 0; x < 512; x += 9) g.fillRect(x, 4, 5 + R() * 4, 3 + R() * 4);
  });
}
/** A whole pizza: top disc (texture) + a puffy crust torus. r = radius, h = thickness. Origin = bottom centre. */
function makePizza(r = 3.2, { seed = 1, h = 0.35, ...o } = {}) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.96, h * 0.7, 64), [M(0xd8a35c, 0.8), new THREE.MeshStandardMaterial({ map: pizzaTopTex(seed, o), roughness: 0.55 }), M(0xc98f4c, 0.9)]);
  top.position.y = h * 0.35; g.add(top);
  const crust = new THREE.Mesh(new THREE.TorusGeometry(r * 0.95, h * 0.42, 12, 72), M(0xdba05a, 0.7)); crust.rotation.x = PI / 2; crust.position.y = h * 0.5; g.add(crust);
  return shadowAll(g);
}
function makePineapple(s = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9 * s, 20, 16), new THREE.MeshStandardMaterial({ map: tex(128, 128, (x) => { x.fillStyle = '#e0a52b'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#9a6a1a'; x.lineWidth = 4; for (let i = -128; i < 256; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); } }), roughness: 0.7 }));
  body.scale.set(1, 1.35, 1); g.add(body);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 1.0 * s, 5), M(0x3f8a36, 0.7)); const a = (i / 9) * 6.28; l.position.set(Math.cos(a) * 0.12 * s, 1.45 * s, Math.sin(a) * 0.12 * s); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(l); }
  return shadowAll(g);
}
function chefHat(scale = 1) {
  const g = new THREE.Group(), w = M(0xffffff, 0.9);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 18), w); b.position.y = 0.06; g.add(b);
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), w); p.scale.set(1, 0.85, 1); p.position.y = 0.22; g.add(p);
  g.scale.setScalar(scale); return shadowAll(g);
}

export async function build(studio, story) {
  const { scene, renderer } = studio;
  renderer.localClippingEnabled = true;
  const hud = makeIsoHud(story.iso);
  await Promise.all(ISO_FONTS.map((f) => document.fonts.load(f)));
  const ts = addTiltShift(studio, { blur: 28, range: 3, ramp: 9 });
  const L = isoLights(studio, { half: 18 });
  const bd = isoBackdrop(studio, { top: '#9fd3ef', bottom: '#ffd9b8', glow: '#fff4e2', glowA: 0.55 });
  const G = await loadHand('/videos/049-scribe-promo/hand.json');
  const icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const ROOTS = {};
  const at = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ================================================================ PIAZZA (Pisa) — the main diorama
  const PZ = makeBase({ w: 30, d: 26, h: 5.5, top: 0x7cbd50, seed: 3 });
  scene.add(PZ.g); ROOTS.PZ = PZ; const pw = PZ.world;
  const gravel = new THREE.MeshStandardMaterial({ map: groundTexture({ base: '#efe4cf', speck: ['#e2d3b6', '#f7efe0', '#d8c7a6'], seed: 11 }), roughness: 0.95 });
  gravel.map.repeat.set(4, 1);
  const path = (x, z, w, d, rot = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), gravel); m.rotation.set(-PI / 2, 0, rot); m.position.set(x, 0.012, z); m.receiveShadow = true; pw.add(m); return m; };
  path(0, 7.5, 30, 2.6); path(-2, 2.5, 3, 10, 0.2); path(T[0], T[2], 6.5, 6.5);
  const towerBox = new THREE.Group(); towerBox.position.set(...T); towerBox.rotation.y = FALL_YAW; pw.add(towerBox);
  const tower = makePisaTower({ r: 1.6, h: 11.4 }); towerBox.add(tower);
  const duomo = makeDuomo(); duomo.position.set(-7.5, 0, -5.8); duomo.rotation.y = PI; pw.add(duomo);
  const bapt = makeBaptistery(); bapt.position.set(-11, 0, 3.4); pw.add(bapt);
  const wall = makeCityWall(29.4, { h: 1.7 }); wall.position.set(0, 0, -12.4); pw.add(wall);
  const wall2 = makeCityWall(24, { h: 1.7 }); wall2.rotation.y = PI / 2; wall2.position.set(-14.4, 0, 0.6); pw.add(wall2);
  const R = rng(21);
  for (let i = 0; i < 10; i++) { const t = makeTree('cypress', { h: 3.2 + R(), seed: i + 3 }); t.position.set(-12 + i * 2.7, 0, -10.9); pw.add(t); }
  for (const [x, z, s] of [[12.5, 9.5, 1], [-12.6, 9.6, 2], [11.5, 4.5, 3], [12.6, -10, 4]]) { const t = makeTree('pine', { h: 4.2, seed: s }); t.position.set(x, 0, z); pw.add(t); }
  for (const [x, z] of [[-6, 9.6], [-1.5, 10], [3.5, 9.8]]) { const s = makeStall(); s.position.set(x, 0, z); s.rotation.y = PI; pw.add(s); }
  for (const x of [-9, -4, 6, 10]) { const l = makeLamp({ h: 1.8 }); l.position.set(x, 0, 6.2); pw.add(l); }
  for (const x of [-7.5, 8]) { const b = makeBench(); b.position.set(x, 0, 8.8); pw.add(b); }
  // the fallen tower's rubble dust + flying debris use one puff pool per set
  const fxPZ = makePuffs(pw, { max: 220 });
  // crowd: instanced tourists (they scatter at the impact, then gather in a ring to watch the rebuild)
  const NC = 46, crowd = makePegCrowd(pw, NC, { seed: 6 });
  const CR = Array.from({ length: NC }, (_, i) => {
    const corridor = (x, z) => { const ax = x - T[0], az = z - T[2], along = ax * DIR[0] + az * DIR[2], perp = Math.abs(ax * DIR[2] - az * DIR[0]); return along > -1 && along < 14 && perp < 2.6; };
    let x, z; do { x = -12 + R() * 25; z = -9 + R() * 18; } while (Math.hypot(x - T[0], z - T[2]) < 3.2 || (x < -1 && z < -2.5) || Math.hypot(x + 11, z - 3.4) < 3.2 || corridor(x, z) || Math.hypot(x - (T[0] - DIR[0] * 2.2), z - (T[2] - DIR[2] * 2.2)) < 1.4);
    const ring = 6.2 + R() * 3.2, ra = R() * 6.28;
    return { x, z, ph: R() * 6.28, rot: R() * 6.28, rx: T[0] + Math.cos(ra) * ring, rz: T[2] + Math.sin(ra) * ring * 0.85 + 1, sp: 0.8 + R() };
  });
  // jointed tourists doing the push pose (and their photographer friends)
  const posers = [[-1.4, 3.2, 0.3], [5.6, 4.6, -0.6], [-4.0, -1.2, 0.8], [7.2, 1.0, -1.2]].map(([x, z, r], i) => {
    const p = makePeg({ top: [0xe8533f, 0x3d7fd6, 0x7a5cc7, 0x2fb5b0][i], hat: i === 2 ? 'sun' : i === 1 ? 'cap' : null, hatColor: 0xffffff });
    pw.add(p.g); return { p, x, z, r };
  });
  const snappers = [[-1.4, 5.6], [5.0, 7.0]].map(([x, z]) => { const p = makePeg({ top: 0xf2c14e, pants: 0x4a4a52 }); pw.add(p.g); return { p, x, z }; });
  // THE tourist: a rig hero (yellow shirt, sun hat), pushing the tower's foot from the far side of the lean
  const hero = makeMini({ skin: 0xe9b48f, top: 0xf6c431, collar: 0xf6c431, pants: 0x2f4a6e, hair: 0x4a2c1a, hairStyle: 'short', s: 0.6 });
  pw.add(hero.rig.root);
  const sunhat = new THREE.Group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.12, 18), M(0xead39a, 0.9)); c.position.y = 0.1; sunhat.add(c); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 24), c.material); b.position.y = 0.05; sunhat.add(b); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.04, 18), M(0xd8342c)); band.position.y = 0.07; sunhat.add(band); }
  sunhat.position.y = 0.17; hero.rig.headG.add(sunhat); shadowAll(sunhat);
  const HERO = [T[0] - DIR[0] * 2.15, 0, T[2] - DIR[2] * 2.15], HERO_YAW = Math.atan2(DIR[0], DIR[2]);
  // the rebuild: foundation pizza, the stacked tower (instanced layers), window overlay, cutter, basil, crane, inspector, pigeon
  const found = makePizza(3.3, { seed: 4, pep: 22 }); found.position.set(...T); pw.add(found);
  const stackHinge = new THREE.Group(); stackHinge.position.set(T[0], 0.36, T[2]); stackHinge.rotation.y = FALL_YAW; pw.add(stackHinge);
  const stackBox = new THREE.Group(); stackHinge.add(stackBox);
  const lean = new THREE.Group(); lean.position.x = 1.6; stackBox.add(lean); const stk = new THREE.Group(); stk.position.x = -1.6; lean.add(stk);
  const LH = 0.12, NBODY = 84;
  const cT = crustTex(); cT.wrapS = THREE.RepeatWrapping; cT.repeat.set(3, 1);
  const layerGeo = new THREE.CylinderGeometry(1, 1, LH * 0.98, 48);
  const layers = new THREE.InstancedMesh(layerGeo, [new THREE.MeshStandardMaterial({ map: cT, roughness: 0.7 }), M(0xf3d88a, 0.6), M(0xc98f4c)], STACK.n);
  layers.castShadow = layers.receiveShadow = true; layers.frustumCulled = false; stk.add(layers);
  const layerY = (i) => (i < NBODY ? i * LH : NBODY * LH + (i - NBODY) * LH);
  const layerR = (i) => (i < NBODY ? 1.6 : 1.05);
  { const m4 = new THREE.Matrix4(); for (let i = 0; i < STACK.n; i++) { m4.compose(new THREE.Vector3(0, layerY(i) + LH / 2, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, i * 2.1, 0)), new THREE.Vector3(layerR(i), 1, layerR(i))); layers.setMatrixAt(i, m4); } }
  const topPizza = makePizza(1, { seed: 8, h: 0.14, pep: 8 }); stk.add(topPizza);
  // windows: an open cylinder of dark arches (transparent between), revealed one by one as the cutter passes
  const WIN = { rows: 6, cols: 20 };
  const winT = tex(1024, 512, () => {}); winT.wrapS = THREE.RepeatWrapping;
  const winMat = new THREE.MeshStandardMaterial({ map: winT, transparent: true, alphaTest: 0.4, roughness: 0.8 });
  const winBody = new THREE.Mesh(new THREE.CylinderGeometry(1.612, 1.612, NBODY * LH * 0.9, 64, 1, true), winMat); winBody.position.y = NBODY * LH * 0.5; stk.add(winBody);
  let lastWin = -1;
  function drawWindows(n) {
    if (n === lastWin) return; lastWin = n;
    const { c, g } = winT.userData; g.clearRect(0, 0, c.width, c.height);
    const cw = c.width / WIN.cols, rh = c.height / WIN.rows;
    for (let k = 0; k < n; k++) {
      const row = WIN.rows - 1 - Math.floor(k / WIN.cols), col = k % WIN.cols, x = col * cw + cw * 0.28, y = row * rh + rh * 0.22, w = cw * 0.44, h = rh * 0.6;
      g.fillStyle = '#3a1f12'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
      g.strokeStyle = '#f3c77a'; g.lineWidth = 3; g.stroke();
    }
    winT.needsUpdate = true;
  }
  drawWindows(0);
  const cutter = new THREE.Group(); pw.add(cutter);
  { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.07, 40), M(0xe3e7ec, 0.2, { metalness: 0.85 })); cutter.add(wheel); cutter.userData.wheel = wheel;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 16), M(0xd8342c, 0.5)); cutter.add(hub);
    const fork = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.12), M(0xd8342c, 0.5)); fork.position.set(0.45, 0.12, 0); cutter.add(fork);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.2, 12), M(0xd8342c, 0.5)); handle.rotation.z = -1.0; handle.position.set(0.9 + 0.93, 0.12 + 0.6, 0); cutter.add(handle); shadowAll(cutter); }
  const basil = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 10), M(0x2f8f3a, 0.5)); basil.scale.set(1, 0.12, 0.55); basil.castShadow = true; stk.add(basil);
  const crane = makeCrane({ h: 16, jib: 10 }); crane.position.set(T[0] - 5.5, 0, T[2] - 4.2); pw.add(crane);
  const craneLoad = makePizza(1.6, { seed: 12, h: 0.14, pep: 10 }); crane.userData.hook.add(craneLoad); craneLoad.position.y = -0.35;
  const inspector = makePeg({ top: 0xff7a1a, pants: 0x2b3a55, hat: 'hard', hatColor: 0xffffff }); pw.add(inspector.g);
  const stopSign = new THREE.Group(); { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6), M(0x888888)); pole.position.y = 0.95; stopSign.add(pole);
    const oct = (g, W) => { g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + 0.5) * PI / 4; g.lineTo(W / 2 + Math.cos(a) * W * 0.48, W / 2 + Math.sin(a) * W * 0.48); } g.closePath(); };
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: tex(256, 256, (g) => { oct(g, 256); g.fillStyle = '#d8231c'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#fff'; g.font = '900 70px Inter, Arial'; g.textAlign = 'center'; g.fillText('STOP', 128, 116); g.font = '800 30px Inter, Arial'; g.fillText('SHOW THE', 128, 160); g.fillText('MATH', 128, 194); }), transparent: true, alphaTest: 0.5, roughness: 0.6, side: THREE.DoubleSide }));
    face.position.y = 2.15; stopSign.add(face); shadowAll(stopSign); }
  pw.add(stopSign);
  const permitTable = new THREE.Group(); { const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), M(0x9a6a43)); top.position.y = 0.7; permitTable.add(top); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), M(0x6b4a30)); l.position.set(sx * 0.4, 0.35, sz * 0.25); permitTable.add(l); } }
  const paperStack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.55), [M(0xf6f3ea), M(0xf6f3ea), new THREE.MeshStandardMaterial({ map: tex(256, 320, (g) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#26346b'; for (let y = 40; y < 300; y += 22) g.fillRect(24, y, 120 + (y * 37) % 90, 4); }) }), M(0xf6f3ea), M(0xf6f3ea), M(0xf6f3ea)]);
  paperStack.position.y = 0.9; permitTable.add(paperStack);
  const stampMark = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.2), new THREE.MeshBasicMaterial({ map: tex(256, 140, (g) => { g.strokeStyle = '#1f9d4b'; g.lineWidth = 12; g.strokeRect(10, 10, 236, 120); g.fillStyle = '#1f9d4b'; g.font = '800 46px Inter, Arial'; g.textAlign = 'center'; g.fillText('APPROVATO', 128, 88); }), transparent: true }));
  stampMark.rotation.set(-PI / 2, 0, 0.12); stampMark.position.y = 1.075; permitTable.add(stampMark);
  shadowAll(permitTable); permitTable.scale.setScalar(1.4); permitTable.position.set(T[0] + 2.9, 0, T[2] + 2.6); permitTable.rotation.y = -0.5; pw.add(permitTable);
  const stamper = new THREE.Group(); { const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), M(0x1f9d4b)); stamper.add(s1); const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), M(0x6b4a30)); s2.position.y = 0.1; stamper.add(s2); shadowAll(stamper); }
  pw.add(stamper);
  const workers = [[T[0] - 3.4, T[2] + 3.6], [T[0] + 4.8, T[2] - 1.2], [T[0] + 0.4, T[2] + 4.6]].map(([x, z], i) => { const p = makePeg({ top: 0xff8a3d, pants: 0x2b3a55, hat: 'hard', hatColor: [0xffc928, 0xffffff, 0xffc928][i] }); pw.add(p.g); return { p, x, z }; });
  const pigeon = makePigeon(); pw.add(pigeon.root);
  // the cargo plane (rides above the piazza, in its world so it bobs with it) + the falling foundation
  const plane = makePlane({ len: 13 }); pw.add(plane);
  const dropPizza = makePizza(3.3, { seed: 4, pep: 22 }); pw.add(dropPizza);

  // ================================================================ MINISTRY (Ministero della Pizza)
  const MNg = new THREE.Group(); MNg.position.set(...OFF.MN); scene.add(MNg);
  const room = makeRoom({ w: 5.2, d: 4.4, h: 2.8, wall: 0xe9dcc2, wall2: 0xd9c9a8, floor: 'terrazzo', windows: [{ side: 'left', at: -0.3, y: 1.0, w: 1.2, h: 1.1, view: 'day' }] });
  MNg.add(room.g); MNg.add(makeFloatShadow(5.2, 4.4, -2.6));
  ROOTS.MN = { g: MNg, update: (t) => { MNg.position.y = OFF.MN[1] + Math.sin(t * 0.9) * 0.03; } };
  const plaque = isoPoster(tex(512, 128, (g) => { g.fillStyle = '#1b3a2a'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#d6b45a'; g.lineWidth = 6; g.strokeRect(8, 8, 496, 112); g.fillStyle = '#e9cf7a'; g.font = '700 44px Georgia, serif'; g.textAlign = 'center'; g.fillText('MINISTERO DELLA PIZZA', 256, 80); }), 2.2, 0.55);
  plaque.position.set(0.2, 2.25, -2.2 + 0.1); MNg.add(plaque);
  const flagTex = tex(96, 64, (g) => { g.fillStyle = '#1f8a43'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#f6f3ea'; g.fillRect(32, 0, 32, 64); g.fillStyle = '#d2302a'; g.fillRect(64, 0, 32, 64); });
  const flagBig = isoPoster(flagTex, 1.1, 0.75); flagBig.position.set(-1.4, 1.75, -2.2 + 0.1); MNg.add(flagBig);
  const pizzaPortrait = isoPoster(tex(200, 200, (g) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, 200, 200); g.fillStyle = '#f3e6c9'; g.fillRect(14, 14, 172, 172); const p = pizzaTopTex(3).userData.c; g.drawImage(p, 30, 30, 140, 140); }), 0.7, 0.7);
  pizzaPortrait.position.set(1.7, 1.65, -2.2 + 0.1); MNg.add(pizzaPortrait);
  const mDesk = isoDesk({ w: 1.7, d: 0.8, color: 0x7a4a2a }); mDesk.position.set(0.1, 0, -0.5); MNg.add(mDesk); shadowAll(mDesk);
  const bpTex = tex(640, 440, () => {}); let bpStamped = -1;
  function drawBlueprint(stamped) {
    if (stamped === bpStamped) return; bpStamped = stamped;
    const { g } = bpTex.userData;
    g.fillStyle = '#1f5fae'; g.fillRect(0, 0, 640, 440); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let x = 0; x < 640; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 440); g.stroke(); } for (let y = 0; y < 440; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.fillStyle = '#fff'; g.font = '700 30px Inter, Arial'; g.fillText('TORRE DI PISA', 30, 52); g.font = '600 22px Inter, Arial'; g.fillText('PROGETTO 2 · PIZZA', 30, 84);
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(470, 400 - i * 24, i < 12 ? 70 : 46, 9, 0, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(400, 404); g.lineTo(400, 120); g.moveTo(540, 404); g.lineTo(540, 120); g.stroke();
    g.font = '600 18px Inter, Arial'; g.fillText('96 PIZZE', 330, 260); g.fillText('BASILICO', 520, 76);
    if (stamped) { g.save(); g.translate(190, 300); g.rotate(-0.18); g.strokeStyle = '#e0261c'; g.lineWidth = 10; g.strokeRect(-150, -52, 300, 104); g.fillStyle = '#e0261c'; g.font = '900 54px Inter, Arial'; g.textAlign = 'center'; g.fillText('APPROVATO', 0, 20); g.restore(); }
    bpTex.needsUpdate = true;
  }
  drawBlueprint(0);
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.62), new THREE.MeshStandardMaterial({ map: bpTex, roughness: 0.8 })); bp.rotation.set(-PI / 2, 0, 0); bp.position.set(0.05, 0.778, -0.42); MNg.add(bp);
  const minister = makePerson({ skin: 0xe9b48f, top: 0x1f2a36, collar: 0xffffff, pants: 0x1f2a36, hair: 0x9a9a9a, hairStyle: 'short', mustache: 0x5a5a5a, headR: 0.17 });
  MNg.add(minister.root); shadowAll(minister.root);
  const mHat = chefHat(1.05); mHat.position.y = 0.2; minister.headG.add(mHat);
  const mStamp = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.1), M(0x8a1c1c, 0.5)); mStamp.add(b); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 10), M(0x3a2a20, 0.5)); h.position.y = 0.1; mStamp.add(h); shadowAll(mStamp); }
  MNg.add(mStamp);
  const aides = [[-1.25, -1.35, 0.35], [1.45, -1.25, -0.35]].map(([x, z, r]) => { const p = makePeg({ top: 0xffffff, pants: 0x2b2b2b, hat: 'chef', scale: 1.3 }); p.g.position.set(x, 0, z); MNg.add(p.g); return { p, x, z, r }; });
  const fStand = makeFlagPole({ h: 2.2 }); fStand.position.set(-1.0, 0, -1.4); MNg.add(fStand);
  const mPlant = makeTree('bush', { h: 0.8, seed: 5 }); mPlant.position.set(2.0, 0, -1.6); MNg.add(mPlant);
  const mShelf = isoShelf({ w: 1.0, h: 1.5 }); mShelf.position.set(-2.35, 0, -0.8); mShelf.rotation.y = PI / 2; MNg.add(mShelf); shadowAll(mShelf);
  const mRug = isoRug({ w: 2.6, d: 1.8, color: '#7a2a2a', color2: '#e9cf7a' }); mRug.position.set(0.1, 0, 0.5); MNg.add(mRug);
  const mFx = makePuffs(MNg, { max: 20 });

  // ================================================================ STADIUM (dough, toss, toppings)
  const ST = makeBase({ shape: 'round', r: 14, h: 4.8, top: 0x6fb04a, seed: 7 });
  ST.g.position.set(...OFF.ST); scene.add(ST.g); ROOTS.ST = ST; const sw = ST.world;
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(17, 10.4), new THREE.MeshStandardMaterial({ map: tex(512, 324, (g, W, H) => { for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#5fa53e' : '#6bb447'; g.fillRect((i * W) / 10, 0, W / 10, H); } g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.strokeRect(10, 10, W - 20, H - 20); g.beginPath(); g.moveTo(W / 2, 10); g.lineTo(W / 2, H - 10); g.stroke(); g.beginPath(); g.arc(W / 2, H / 2, 46, 0, 7); g.stroke(); g.strokeRect(10, H / 2 - 70, 64, 140); g.strokeRect(W - 74, H / 2 - 70, 64, 140); }), roughness: 0.9 }));
  pitch.rotation.x = -PI / 2; pitch.position.y = 0.015; pitch.receiveShadow = true; sw.add(pitch);
  { // stands: a stepped bowl (lathe) + an instanced crowd on the steps
    const prof = []; const r0 = 10.2; for (let k = 0; k <= 6; k++) { prof.push(new THREE.Vector2(r0 + k * 0.5, k * 0.42)); prof.push(new THREE.Vector2(r0 + k * 0.5 + 0.5, k * 0.42 + 0.001)); }
    prof.push(new THREE.Vector2(r0 + 3.6, 2.94)); prof.push(new THREE.Vector2(r0 + 3.61, 0));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof.map((p, i) => new THREE.Vector2(p.x, p.y + (i % 2 ? 0 : 0.0005 * i))), 96), new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.85, side: THREE.DoubleSide }));
    bowl.castShadow = bowl.receiveShadow = true; sw.add(bowl);
    const fans = makePegCrowd(sw, 300, { seed: 13, s: 0.75 }); ST.fans = fans; ST.fanPos = [];
    const RR = rng(5);
    for (let i = 0; i < 300; i++) { const k = Math.floor(RR() * 6), a = RR() * 6.28; if (Math.abs(Math.sin(a)) > 0.93 && Math.cos(a) > 0) { i--; continue; } ST.fanPos.push({ r: r0 + 0.3 + k * 0.5, y: (k + 1) * 0.42, a, ph: RR() * 6.28 }); }
    for (const [x, z] of [[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, z]) => [x * 0.84, z * 0.84])) {
      const tw = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7, 8), M(0x9aa0a8, 0.5)); p.position.y = 3.5; tw.add(p);
      const hd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.2), M(0xf6f3ea, 0.4, { emissive: 0xfff3d0, emissiveIntensity: 0.3 })); hd.position.y = 7.2; hd.lookAt(-x, 0, -z); tw.add(hd);
      tw.position.set(x, 0, z); shadowAll(tw); sw.add(tw);
    }
    const board = isoPoster(tex(512, 200, (g) => { g.fillStyle = '#16181c'; g.fillRect(0, 0, 512, 200); g.fillStyle = '#ffd23f'; g.font = '800 54px Inter, Arial'; g.textAlign = 'center'; g.fillText('PIZZA  1 – 0  PISA', 256, 92); g.fillStyle = '#7ee08a'; g.font = '700 30px Inter, Arial'; g.fillText('OPERAZIONE TORRE', 256, 150); }), 5.2, 2.0);
    board.position.set(0, 4.3, -13.2); sw.add(board); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 0.2), M(0x555555)); bl.position.set(0, 1.7, -13.3); sw.add(bl);
  }
  const doughMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, map: tex(512, 256, (g) => { const RR = rng(12); g.fillStyle = '#ead09a'; g.fillRect(0, 0, 512, 256); for (let i = 0; i < 900; i++) { g.fillStyle = RR() < 0.6 ? 'rgba(255,250,235,.55)' : 'rgba(190,140,80,.25)'; g.beginPath(); g.arc(RR() * 512, RR() * 256, 1 + RR() * 4, 0, 7); g.fill(); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,150,90,.35)'; g.beginPath(); g.ellipse(RR() * 512, RR() * 256, 6 + RR() * 10, 4 + RR() * 6, 0, 0, 7); g.fill(); } }) });
  const doughG = new THREE.Group(); doughG.rotation.order = 'YXZ'; sw.add(doughG);
  const dough = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), doughMat); dough.castShadow = dough.receiveShadow = true; doughG.add(dough);
  const sauce = new THREE.Mesh(new THREE.CircleGeometry(1, 64), M(0xc8321f, 0.5)); sauce.rotation.x = -PI / 2; sw.add(sauce);
  const cheese = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ map: tex(256, 256, (g) => { const RR = rng(4); g.clearRect(0, 0, 256, 256); for (let i = 0; i < 160; i++) { g.fillStyle = RR() < 0.5 ? '#ffe9a6' : '#fff6d6'; g.beginPath(); g.ellipse(RR() * 256, RR() * 256, 8 + RR() * 12, 6 + RR() * 9, RR() * 3, 0, 7); g.fill(); } }), transparent: true, roughness: 0.5 }));
  cheese.rotation.x = -PI / 2; sw.add(cheese);
  const NP = 22, peps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20), M(0xa3261c, 0.45), NP); peps.frustumCulled = false; peps.castShadow = true; sw.add(peps);
  const PEP = Array.from({ length: NP }, (_, i) => { const a = i * 2.4, r = 0.6 + ((i * 0.37) % 1) * 2.2; return [Math.cos(a) * r, Math.sin(a) * r, 20.75 + i * 0.035]; });
  const sauceTruck = makeTruck({ color: 0xd8342c, tank: true }); sauceTruck.scale.setScalar(0.85); sw.add(sauceTruck);
  const hopper = new THREE.Group(); { const f = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 20, 1, true), M(0xc9ced6, 0.3, { metalness: 0.6, side: THREE.DoubleSide })); f.rotation.x = PI; hopper.add(f); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 8, 6), M(0x333333)); c.position.y = 4.5; hopper.add(c); shadowAll(hopper); }
  sw.add(hopper);
  const pineapple = makePineapple(1.0); sw.add(pineapple);
  const flourSacks = new THREE.Group(); { const sm = new THREE.MeshStandardMaterial({ map: tex(128, 160, (g) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#2f7d32'; g.font = '800 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('FARINA', 64, 70); g.fillStyle = '#d8342c'; g.fillRect(0, 100, 128, 14); }), roughness: 0.9 }); for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.55), sm); s.position.set((i % 4) * 0.85, 0.5 + Math.floor(i / 4) * 1.0, 0); s.rotation.y = (i * 0.37) % 0.3; flourSacks.add(s); } shadowAll(flourSacks); }
  flourSacks.position.set(-7.5, 0, -2.5); flourSacks.rotation.y = 0.4; sw.add(flourSacks);
  const NCH = 10, chefs = Array.from({ length: NCH }, (_, i) => { const p = makePeg({ top: 0xffffff, pants: 0x2b2b2b, hat: 'chef', apron: false }); sw.add(p.g); return p; });
  const stFx = makePuffs(sw, { max: 200 });

  // ================================================================ COLOSSEUM (the oven)
  const CO = makeBase({ shape: 'round', r: 12.5, h: 4.4, top: 0xd9c49a, soil: 'sand', seed: 9, topRepeat: 4 });
  CO.g.position.set(...OFF.CO); scene.add(CO.g); ROOTS.CO = CO; const cw = CO.world;
  const colos = makeColosseum({ rx: 5.6, rz: 4.6, h: 3.6 }); cw.add(colos);
  { const mo = colos.userData.mouth; mo.geometry.dispose(); mo.geometry = new THREE.CircleGeometry(1, 32, 0, PI); mo.parent.remove(mo); cw.add(mo); mo.scale.set(3.0, 2.0, 1); mo.position.set(0, 0.02, 4.62); }
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28 + 0.3, t = makeTree(i % 2 ? 'pine' : 'cypress', { h: 3.2, seed: 30 + i }); t.position.set(Math.cos(a) * 9.6, 0, Math.sin(a) * 8.8); if (Math.sin(a) > 0.55) continue; cw.add(t); }
  const road = new THREE.Mesh(new THREE.RingGeometry(6.6, 8.2, 80), M(0x8c8f94, 0.95)); road.rotation.x = -PI / 2; road.position.y = 0.01; road.scale.set(1, 0.92, 1); road.receiveShadow = true; cw.add(road);
  const coCars = [0xe8533f, 0x3d7fd6, 0xf2c14e, 0xffffff].map((c) => { const m = makeCar({ color: c }); cw.add(m); return m; });
  const ovenPizza = makePizza(2.6, { seed: 6, pep: 16, baked: 0.2 }); cw.add(ovenPizza);
  const peel = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 0.08, 40), M(0xc9955a, 0.7)); peel.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 3.2), M(0xb07a45, 0.7)); h.position.set(0, 0, 4.4); peel.add(h); shadowAll(peel); }
  cw.add(peel);
  const coChefs = Array.from({ length: 8 }, () => { const p = makePeg({ top: 0xffffff, pants: 0x2b2b2b, hat: 'chef' }); cw.add(p.g); return p; });
  const coCrowd = makePegCrowd(cw, 40, { seed: 17 }); const COC = Array.from({ length: 40 }, (_, i) => { let a = 2.0 + (i / 40) * 4.6 + Math.sin(i * 7.1) * 0.08; const r = 8.6 + ((i * 0.53) % 1) * 1.6; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const coFx = makePuffs(cw, { max: 120 });
  coFx.stream({ t0: 23.8, t1: 27.2, at: [5.6 * 0.35, 3.6 * 1.18 + 3.6 * 1.25 * 0.72 + 2.2, -4.6 * 0.2], rate: 7, up: 1.6, life: 2.4, size: 0.9, color: 0xe8e4dc, drift: [0.5, 0, 0.2] });

  // ================================================================ LUCA'S ROOM (night)
  const RMg = new THREE.Group(); RMg.position.set(...OFF.RM); scene.add(RMg);
  const lroom = makeRoom({ w: 4.6, d: 4.2, h: 2.6, wall: 0x8fb2dd, wall2: 0x7fa4d4, floor: 'wood', windows: [{ side: 'back', at: 0.0, y: 1.0, w: 1.3, h: 1.1, view: 'night' }] });
  RMg.add(lroom.g); RMg.add(makeFloatShadow(4.6, 4.2, -2.4));
  ROOTS.RM = { g: RMg, update: (t) => { RMg.position.y = OFF.RM[1] + Math.sin(t * 0.9 + 1) * 0.02; } };
  const desk = isoDesk({ w: 1.3, d: 0.68, color: 0xd9b48a }); desk.position.set(0, 0, 0); RMg.add(desk); shadowAll(desk);
  const chair = isoChair({ color: 0xd8342c }); chair.position.set(0.0, 0, -0.62); RMg.add(chair); shadowAll(chair);
  const bed = isoBed({ sheet: 0x2fb5b0 }); bed.position.set(-1.65, 0, -0.5); RMg.add(bed); shadowAll(bed);
  const shelf = isoShelf({ w: 1.0, h: 1.4, seed: 8 }); shelf.position.set(1.6, 0, -1.95); RMg.add(shelf); shadowAll(shelf);
  const rug = isoRug({ w: 2.0, d: 1.4, color: '#e0a24a', color2: '#fff1d2' }); rug.position.set(0.3, 0, 0.9); RMg.add(rug);
  const lamp = isoDeskLamp({ intensity: 3.2 }); lamp.position.set(-0.5, 0.775, -0.05); lamp.rotation.y = -0.4; RMg.add(lamp); shadowAll(lamp);
  const posterPisa = isoPoster(tex(200, 280, (g) => { g.fillStyle = '#f3e6c9'; g.fillRect(0, 0, 200, 280); g.fillStyle = '#86c35a'; g.fillRect(0, 220, 200, 60); g.save(); g.translate(100, 220); g.rotate(0.07); g.fillStyle = '#fbf8f0'; g.fillRect(-26, -170, 52, 170); g.fillStyle = '#9a8f80'; for (let y = -160; y < 0; y += 24) g.fillRect(-26, y, 52, 3); g.restore(); g.fillStyle = '#d8342c'; g.font = '800 28px Inter, Arial'; g.textAlign = 'center'; g.fillText('PISA', 100, 36); }), 0.55, 0.77);
  posterPisa.position.set(-2.18, 1.6, -1.1); posterPisa.rotation.y = PI / 2; RMg.add(posterPisa);
  const posterF = isoPoster(tex(200, 280, (g) => { g.fillStyle = '#1b3a8a'; g.fillRect(0, 0, 200, 280); g.fillStyle = '#ffd23f'; g.font = '800 34px Inter, Arial'; g.textAlign = 'center'; g.fillText('F = ma', 100, 140); g.font = '600 18px Inter, Arial'; g.fillText('NEWTON · 1687', 100, 180); }), 0.5, 0.7);
  posterF.position.set(-2.18, 1.6, 0.0); posterF.rotation.y = PI / 2; RMg.add(posterF);
  const edgeMat = new THREE.MeshStandardMaterial({ roughness: 0.9, map: tex(64, 256, (g) => { g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, 64, 256); for (let y = 0; y < 256; y += 3) { g.fillStyle = `rgba(150,140,120,${0.18 + ((y * 7) % 5) * 0.04})`; g.fillRect(0, y, 64, 1); } }) });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.3), [edgeMat, edgeMat, M(0xffffff), edgeMat, edgeMat, edgeMat]); stack.position.set(0.48, 0.775 + 0.25, 0.05); stack.rotation.y = 0.1; stack.castShadow = true; RMg.add(stack);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 14), M(0xd8342c)); mug.position.set(-0.32, 0.825, 0.18); RMg.add(mug);
  // the worksheet (Scribe's real glyphs) on the desk, + the free-body diagram strokes spliced into problem 2
  const sheet = makeSheet(G, {
    title: 'PHYSICS · TOWER STABILITY', note: '40 problems · SHOW ALL WORK · HANDWRITTEN ONLY', name: 'Luca', seed: 6, page: 'p. 1 / 10',
    problems: [
      { q: '1. The tower leans 3.97°. Find the lever arm d.', a: 'd = 22.6 sin(3.97) = 1.56 m' },
      { q: '2. Draw the free-body diagram.', a: null },
      { q: '3. Torque of the weight about the pivot?', a: 'T = W x d = 1.45x10^8 x 1.56 = 2.3x10^8 Nm' },
      { q: '4. Does it tip over?', a: 'd < r = 7.7 m → stable ∴ no' },
    ],
  });
  addFBD(G, sheet);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.216, 0.28), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85, color: 0xe8e4dc }));
  page.rotation.set(-PI / 2, 0, PI); page.position.set(-0.05, 0.777, -0.17); page.receiveShadow = true; RMg.add(page);
  const pen = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.13, 8), M(0x1b2760, 0.4)); b.position.y = 0.065; pen.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.012, 8), M(0xd9dde2, 0.3, { metalness: 0.7 })); tip.rotation.x = PI; tip.position.y = -0.005; pen.add(tip); pen.rotation.set(-0.75, 0, 0.55); pen.scale.setScalar(0.55); }
  RMg.add(pen);
  // laptop with the Scribe app (makeScreen) + a PHYSICS chip painted over it each frame
  const scr = makeScreen(G, icon, sheet, { n: 40, name: 'Luca' });
  const laptop = new THREE.Group(); laptop.position.set(0.02, 0.775, 0.14); laptop.rotation.y = PI; RMg.add(laptop);
  { const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.014, 0.24), M(0xb8bcc4, 0.35, { metalness: 0.5 })); base.position.y = 0.007; laptop.add(base);
    const lid = new THREE.Group(); lid.position.set(0, 0.014, -0.12); lid.rotation.x = -0.28; laptop.add(lid);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.008), M(0xb8bcc4, 0.35, { metalness: 0.5 })); back.position.set(0, 0.11, -0.004); lid.add(back);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false })); s.position.set(0, 0.11, 0.001); lid.add(s); laptop.userData.screen = s;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(icon), transparent: true })); logo.position.set(0, 0.11, -0.0085); logo.rotation.y = PI; lid.add(logo);
    shadowAll(laptop); s.castShadow = false; }
  const phone = new THREE.Group(); RMg.add(phone);
  const phoneScr = tex(270, 540, () => {});
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.009, 0.155), M(0x1c1c22, 0.35)); phone.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.145), new THREE.MeshBasicMaterial({ map: phoneScr, toneMapped: false })); s.rotation.x = -PI / 2; s.position.y = 0.0048; phone.add(s); }
  const flash = new THREE.PointLight(0xffffff, 0, 2.5, 1.5); RMg.add(flash);
  const luca = makePerson({ skin: 0xe3ad86, top: 0x3d7fd6, collar: 0x2c5d8f, pants: 0x2b3a55, hair: 0x2b1d16, hairStyle: 'messy', headR: 0.17 });
  RMg.add(luca.root); shadowAll(luca.root);
  const night = { amb: new THREE.PointLight(0x9fb4ff, 0.6, 9, 1.2) }; night.amb.position.set(1.5, 2.4, 1.6); RMg.add(night.amb);

  const motes = makeMotes(scene, { n: 60, box: [70, 40, 70], center: [0, 6, 0] });

  // ---------------------------------------------------------------- per-frame helpers
  function drawPhone(t) {
    const { g, c } = phoneScr.userData; g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    g.save(); g.translate(135, 262); g.rotate(-0.04); g.drawImage(sheet.canvas, -122, -158, 244, 316); g.restore();
    g.strokeStyle = 'rgba(255,214,90,.95)'; g.lineWidth = 4; g.strokeRect(10, 96, 250, 334);
    g.fillStyle = '#fff'; g.font = '700 22px Inter, Arial'; g.textAlign = 'center'; g.fillText('PHOTO', 135, 60);
    g.beginPath(); g.arc(135, 470, 34, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.arc(135, 470, 27, 0, 7); g.stroke();
    const fk = Math.max(0, 1 - Math.abs(t - PH.photo) / 0.12); if (fk > 0) { g.fillStyle = `rgba(255,255,255,${fk * 0.85})`; g.fillRect(0, 0, c.width, c.height); }
    phoneScr.needsUpdate = true;
  }
  const physicsChip = () => {
    const g = scr.canvas.getContext('2d'); g.save();
    g.fillStyle = '#9a1c25'; g.beginPath(); g.roundRect(196, 20, 176, 40, 20); g.fill();
    g.fillStyle = '#fff'; g.font = '700 22px Inter, Arial'; g.textAlign = 'center'; g.fillText('⚛ Physics', 284, 48); g.restore();
    scr.tex.needsUpdate = true;
  };
  const poseLuca = (t) => {
    const p = basePose();
    Object.assign(p, { x: 0, z: -0.6, rotY: 0, y: -0.375, footFwd: 0.42, eyes: blink(t, 2), lean: 0.12, headPitch: 0.25 });
    if (t < 34.4) { p.armA = TYPE_A; p.armB = TYPE_B; p.mouth = 'flat'; p.headPitch = 0.12 + 0.08 * Math.sin(t * 2); }
    else if (t < 36.0) { p.armA = HEAD_A; p.armB = HEAD_B; p.mouth = 'o'; p.headPitch = 0.05; }   // hands on his head: forty problems
    else if (t < 37.6) { p.armA = HOLD_A; p.armB = HOLD_B; p.lean = 0.3; p.headPitch = 0.5; }
    else { p.armA = TYPE_A; p.armB = TYPE_B; p.smile = 1; }
    applyPose(luca, p);
  };
  // tourists' positions (instanced): wander → scatter at the impact → hidden → a watching ring for the rebuild
  function crowdAt(t) {
    for (let i = 0; i < NC; i++) {
      const c = CR[i];
      if (t < 27) {
        let x = c.x + Math.sin(t * 0.3 * c.sp + c.ph) * 0.5, z = c.z + Math.cos(t * 0.25 * c.sp + c.ph) * 0.4, rot = c.rot + Math.sin(t * 0.4 + c.ph) * 0.6, hop = 0;
        const k = clamp((t - TIP.impact + 0.3) / 1.3);
        if (k > 0) { const dx = x - (T[0] + DIR[0] * 6), dz = z - (T[2] + DIR[2] * 6), d = Math.hypot(dx, dz) || 1; const run = smooth(k) * (2.8 + c.sp); x += (dx / d) * run; z += (dz / d) * run; rot = Math.atan2(dx, dz); hop = Math.abs(Math.sin(t * 14 + c.ph)) * 0.12 * (1 - k); }
        crowd.set(i, { x: clamp(x, -14, 14), z: clamp(z, -11.5, 12), rotY: rot, hop });
      } else {
        const cheer = t > PIGEON.lean1 ? Math.abs(Math.sin(t * 9 + c.ph)) * 0.35 : t > 41.6 && t < 43.2 ? Math.abs(Math.sin(t * 8 + c.ph)) * 0.25 : t > 29.4 && t < 30.6 ? Math.abs(Math.sin(t * 9 + c.ph)) * 0.25 : 0;
        crowd.set(i, { x: c.rx, z: c.rz, rotY: Math.atan2(T[0] - c.rx, T[2] - c.rz), hop: cheer });
      }
    }
    crowd.commit();
  }
  function heroPose(t) {
    const p = basePose();
    Object.assign(p, { x: HERO[0], z: HERO[2], rotY: HERO_YAW, eyes: blink(t, 1) });
    if (t < 7.0) {   // the push → the oops
      const k = clamp((t - 3.4) / 0.6);
      p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.12 + 0.3 * k; p.footFwd = -0.12 * k; p.mouth = t > 4.6 ? 'o' : 'flat';
      if (t > 5.2) { p.armA = HEAD_A; p.armB = HEAD_B; p.lean = 0.05; p.footFwd = 0; p.mouth = 'o'; }
    } else if (t < 50.8) { p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.14; }
    else if (t < 52.6) {   // nobody can do the pose: push … nothing … shrug
      const u = t - 50.8;
      if (u < 0.9) { p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.18 + 0.06 * Math.sin(u * 20); p.mouth = 'flat'; }
      else { p.armA = SHRUG_A; p.armB = SHRUG_B; p.lean = -0.04; p.mouth = 'flat'; p.headRoll = 0.15; }
    } else if (t < PIGEON.lean1) { p.armA = SHRUG_A; p.armB = SHRUG_B; p.headPitch = -0.35; p.mouth = 'o'; }
    else { p.armA = PUSH_A; p.armB = PUSH_B; p.lean = 0.16; p.smile = 1; p.mouth = 'smile'; }
    hero.pose(p);
  }
  // fallen-tower lean (deg): a slow tip that accelerates into the lawn
  const towerLean = (t) => {
    if (t < TIP.start) return 3.97;
    if (t < TIP.impact) { const u = (t - TIP.start) / (TIP.impact - TIP.start); return 3.97 + 86.03 * u * u * u; }
    const a = t - TIP.impact; return 90 - 2.2 * Math.exp(-a * 6) * Math.abs(Math.sin(a * 18));
  };
  fxPZ.burst({ t0: TIP.impact, at: [T[0] + DIR[0] * 7, 0.4, T[2] + DIR[2] * 7], n: 40, speed: 3.2, up: 1.6, life: 1.8, size: 1.3, color: 0xefe4cf, spread: 9, seed: 3 });
  fxPZ.burst({ t0: DROP.t1, at: [T[0], 0.4, T[2]], n: 34, speed: 3.6, up: 1.4, life: 1.5, size: 1.2, color: 0xf0dcb0, spread: 4, seed: 5 });
  fxPZ.burst({ t0: DROP.t1, at: [T[0], 0.6, T[2]], n: 14, speed: 4.5, up: 3.5, life: 0.9, size: 0.45, color: 0xc8321f, spread: 3, seed: 6, gravity: 6, grow: 0.3 });
  fxPZ.burst({ t0: 41.95, at: [permitTable.position.x, 1.1, permitTable.position.z], n: 8, speed: 0.8, up: 0.6, life: 0.6, size: 0.3, color: 0x7ee08a, spread: 0.3, seed: 8 });
  // kneading flour puffs + the toss catch + the pineapple's fall dust
  for (let k = 0; k < 7; k++) stFx.burst({ t0: 11.4 + k * 0.5, at: [Math.cos(k * 2.3) * 2.4, 0.9, Math.sin(k * 2.3) * 2.4], n: 6, speed: 1.2, up: 0.8, life: 1.1, size: 0.9, color: 0xfffaf0, spread: 1, seed: 20 + k });
  stFx.burst({ t0: 18.35, at: [0, 1.6, 0], n: 24, speed: 3, up: 0.6, life: 1.2, size: 1.0, color: 0xfffaf0, spread: 5, seed: 40 });
  stFx.burst({ t0: 20.4, at: [0, 6.6, 0], n: 36, speed: 0.6, up: -1.6, life: 1.6, size: 0.5, color: 0xfff6d6, spread: 3, seed: 41, grow: 0.4 });
  const pineAt = (t) => {   // rolls in from −x, stops at the crust, gets shoved back off the edge of the diorama, falls into the void
    if (t < 21.2) return null;
    if (t < 21.8) { const u = smooth((t - 21.2) / 0.6); return { x: lerp(-11, -4.2, u), y: 1.2, roll: -(lerp(-11, -4.2, u)) / 1.0 }; }
    if (t < 22.15) return { x: -4.2, y: 1.2, roll: 7.2 };
    const u = t - 22.15, x = -4.2 - 9 * u * (1 + u), f = Math.max(0, u - 0.64);
    return { x, y: 1.2 - 15 * f * f, roll: 7.2 - (x + 4.2) };
  };

  // ---------------------------------------------------------------- update
  function update(t) {
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    for (const k of Object.keys(OFF)) { const r = ROOTS[k]; (r.g).visible = k === shot.set; }
    const o = OFF[shot.set];
    // ---- camera
    const v = isoAt(t, shot.keys, { drift: 0 });
    const [kx, ky] = kick(t, [TIP.impact, DROP.t1, 9.9, PIGEON.land], 0.012 * v.frame, 0.5);
    v.target = [v.target[0] + o[0] + kx, v.target[1] + o[1] + ky, v.target[2] + o[2]];
    isoCam(studio, v);
    // ---- per-set backdrop + light
    const nightK = shot.set === 'RM' ? 1 : 0;
    L.setNight(nightK * 0.85);
    if (shot.set !== update.lastSet) bd.set(shot.set === 'RM' ? { top: '#1c2650', bottom: '#4a4f86', glow: '#8d8fd0', glowA: 0.35 } : shot.set === 'CO' ? { top: '#f7c99a', bottom: '#ffe2c2', glow: '#fff1da', glowA: 0.6 } : shot.set === 'ST' ? { top: '#9fd8c8', bottom: '#fbe7b5', glow: '#fff6dc', glowA: 0.55 } : shot.set === 'MN' ? { top: '#d9c3e8', bottom: '#ffe0c8', glow: '#fff4e6', glowA: 0.5 } : { top: '#9fd3ef', bottom: '#ffd9b8', glow: '#fff4e2', glowA: 0.55 });
    update.lastSet = shot.set;
    L.focus(o[0], 0, o[2], shot.set === 'RM' || shot.set === 'MN' ? 4.5 : shot.set === 'PZ' ? 17 : 14.5);
    // ---- tilt-shift: range/ramp scale with the frame width
    const dk = shot.dof ?? 1;
    ts.set({ range: v.frame * 0.09 * dk, ramp: v.frame * 0.36 * dk, blur: 28 });
    motes.update(t);
    for (const k of ['PZ', 'ST', 'CO']) ROOTS[k].update(t);
    ROOTS.MN.update(t); ROOTS.RM.update(t);
    let focus = shot.focus;

    if (shot.set === 'PZ') {
      // ---------- the piazza through the whole reel
      const rebuilt = t >= 27;
      tower.visible = !rebuilt; tower.userData.setLean(towerLean(t));
      crowdAt(t);
      posers.forEach(({ p, x, z, r }, i) => {
        const fleeing = t > TIP.impact - 0.2 && t < 27;
        const k = clamp((t - TIP.impact + 0.2) / 1.0), dx = x - T[0], dz = z - T[2], d = Math.hypot(dx, dz);
        const pushing = t < TIP.impact - 0.2 || t > PIGEON.lean1;
        p.g.visible = t < 27 || t > 49;
        p.set({ x: x + (fleeing ? (dx / d) * 3 * smooth(k) : 0), z: z + (fleeing ? (dz / d) * 3 * smooth(k) : 0), rotY: fleeing ? Math.atan2(dx, dz) : HERO_YAW + r * 0.2, walk: fleeing && k < 1 ? t * 16 : null,
          armL: pushing ? 1.55 : t > 50.8 && t < PIGEON.lean1 ? 0.3 : 0.1, armR: pushing ? 2.6 : 0.1, spreadL: pushing ? 0.05 : 0.6, spreadR: pushing ? 0.25 : 0.6, lean: pushing ? 0.12 : 0, hop: t > PIGEON.lean1 ? Math.abs(Math.sin(t * 8 + i)) * 0.12 : 0 });
      });
      snappers.forEach(({ p, x, z }, i) => { p.g.visible = t < TIP.impact || t > 49; p.set({ x, z, rotY: Math.atan2(posers[i].x - x, posers[i].z - z), armL: 1.45, armR: 1.45, spreadL: -0.25, spreadR: -0.25 }); });
      heroPose(t); hero.rig.root.visible = t < 27 || t >= 49;
      // rebuild pieces
      const dropping = t >= 27 && t < DROP.t1;
      dropPizza.visible = t >= 27 && t < DROP.t1 + 0.02;
      plane.visible = t >= 27 && t < 30.6;
      const px = lerp(-26, 30, (t - 27) / 3.6);
      plane.position.set(T[0] + px * DIR[0] - 3 * DIR[2], 15.5, T[2] + px * DIR[2] + 3 * DIR[0]); plane.rotation.y = FALL_YAW; plane.userData.setProps(t);
      plane.userData.door.rotation.z = -1.1 * smooth((t - 27.4) / 0.4);
      if (dropping) {
        if (t < DROP.t0) { dropPizza.position.copy(plane.position).add(new THREE.Vector3(-3 * DIR[0], -1.2, -3 * DIR[2])); dropPizza.scale.setScalar(0.35); dropPizza.rotation.set(0, 0, 0); }
        else {
          const u = (t - DROP.t0) / (DROP.t1 - DROP.t0), s0 = plane.position.clone().add(new THREE.Vector3(-3 * DIR[0], -1.2, -3 * DIR[2]));
          const pp = new THREE.Vector3(lerp(s0.x, T[0], u), lerp(s0.y, 0, u * u), lerp(s0.z, T[2], u));
          dropPizza.position.copy(pp); dropPizza.scale.setScalar(lerp(0.35, 1, smooth(u * 1.6))); dropPizza.rotation.set(Math.sin(t * 9) * 0.35 * (1 - u), t * 4, Math.cos(t * 7) * 0.3 * (1 - u));
        }
      }
      found.visible = t >= DROP.t1; const sq = t >= DROP.t1 ? boing((t - DROP.t1) / 0.6) : 1; found.scale.set(1 + 0.25 * (1 - sq), Math.max(0.3, sq), 1 + 0.25 * (1 - sq));
      // inspector with the STOP sign, later the stamp
      inspector.g.visible = t >= 30.6 && t < 43.2;
      stopSign.visible = t >= 30.6 && t < 32.4;
      inspector.set({ x: T[0] + 2.2, z: T[2] + 2.4, rotY: 0.85, armR: t < 32.4 ? 1.9 : 0.1, armL: 0.1, spreadR: 0.35, headYaw: 0.2 });
      { const iy = 0.85 + PI / 2; stopSign.position.set(T[0] + 2.2 + Math.cos(0.85) * 0.25 + Math.sin(iy) * 0.0, 0.0 + 0.08 * Math.abs(Math.sin(t * 5)), T[2] + 2.4 - Math.sin(0.85) * 0.25); stopSign.position.x += 0.28; stopSign.rotation.y = (v.az ?? 50) * D2R; }
      permitTable.visible = t >= 41.6 && t < 46.6;
      stampMark.visible = t >= 41.95;
      stamper.visible = permitTable.visible && t < 43.2;
      if (stamper.visible) { const hk = t < 41.95 ? smooth((41.95 - t) / 0.3) : smooth((t - 41.95) / 0.3); stamper.position.set(permitTable.position.x, 1.55 + 0.5 * hk, permitTable.position.z); stamper.scale.setScalar(1.4); stamper.rotation.y = -0.5; }
      if (t >= 41.6 && t < 43.2) inspector.set({ x: permitTable.position.x - 0.6, z: permitTable.position.z + 0.5, rotY: 2.2, armR: t < 41.95 ? 1.6 : 1.0, armL: 0.2, spreadR: 0.1 });
      workers.forEach(({ p, x, z }, i) => { p.g.visible = t >= 41.6 && t < 49; p.set({ x, z, rotY: Math.atan2(T[0] - x, T[2] - z), armL: t < 43.2 ? 2.8 : 0.3 + 0.3 * Math.sin(t * 3 + i), armR: t < 43.2 ? 2.8 : 1.2, hop: t < 43.2 ? Math.abs(Math.sin(t * 8 + i)) * 0.18 : 0 }); });
      // the stack
      const nStack = t < STACK.t0 ? 0 : Math.max(1, Math.round(1 + (STACK.n - 1) * smooth(clamp((t - STACK.t0) / (STACK.t1 - STACK.t0)) * 0.98 + 0.02)));
      stackHinge.visible = t >= STACK.t0;
      layers.count = Math.min(STACK.n, nStack);
      const topY = nStack > 0 ? layerY(nStack - 1) + LH : 0;
      topPizza.position.y = topY - 0.02; topPizza.scale.set(layerR(Math.max(0, nStack - 1)), 1, layerR(Math.max(0, nStack - 1)));
      winBody.visible = t >= CUT.t0 - 0.1;
      const nWin = Math.round(CUT.n * clamp((t - CUT.t0) / (CUT.t1 - CUT.t0)));
      drawWindows(nWin);
      cutter.visible = t >= CUT.t0 - 0.2 && t < CUT.t1 + 0.4;
      { const u = clamp((t - CUT.t0) / (CUT.t1 - CUT.t0)), row = Math.min(WIN.rows - 1, Math.floor(u * WIN.rows)), a = u * WIN.rows * 2 * PI, y = 0.36 + (row + 0.5) * (NBODY * LH * 0.9) / WIN.rows + NBODY * LH * 0.05;
        cutter.position.set(T[0] + Math.cos(a + FALL_YAW) * 2.15, y + (1 - smooth((t - CUT.t0 + 0.2) / 0.3)) * 3, T[2] - Math.sin(a + FALL_YAW) * 2.15); cutter.rotation.set(0, a + FALL_YAW, 0); cutter.userData.wheel.rotation.y = t * 20; }
      basil.visible = t >= BASIL;
      basil.position.y = topY + 0.08 + Math.max(0, (1 - smooth((t - BASIL) / 0.35))) * 2.5; basil.rotation.y = 0.6;
      // crane: the hook rides above the top of the stack with a pizza, the jib slewed toward the tower
      crane.visible = t >= 41.6;
      { const cp = crane.position, dx = T[0] - cp.x, dz = T[2] - cp.z; crane.userData.setSlew(Math.atan2(-dz, dx)); crane.userData.setTrolley(Math.hypot(dx, dz)); }
      const bobH = (t * 3.4) % 1;
      crane.userData.setHook(Math.max(0.5, 16.5 - (topY + 0.36) - 0.6 - (t < STACK.t1 && t > STACK.t0 ? 1.2 * (1 - bobH) : 2.5)));
      craneLoad.visible = t > STACK.t0 - 0.6 && t < STACK.t1;
      // lean (the pigeon)
      const lk = t < PIGEON.lean0 ? 0 : 3.97 * smooth((t - PIGEON.lean0) / (PIGEON.lean1 - PIGEON.lean0)) + (t > PIGEON.lean1 ? 0.25 * Math.exp(-(t - PIGEON.lean1) * 4) * Math.sin((t - PIGEON.lean1) * 18) : 0);
      lean.rotation.z = -lk * D2R;
      // pigeon: flies in from the upper right and lands on the basil
      pigeon.root.visible = t >= PIGEON.land - 1.2;
      if (pigeon.root.visible) {
        stk.updateMatrixWorld(true); const topW = stk.localToWorld(new THREE.Vector3(0.1, topY + 0.15, 0)); pw.worldToLocal(topW);
        const u = clamp((t - (PIGEON.land - 1.2)) / 1.2), from = new THREE.Vector3(T[0] + 9, 17, T[2] + 5);
        const p = from.clone().lerp(topW, smooth(u)); p.y += Math.sin(u * PI) * 1.2 * (1 - u);
        pigeon.set({ x: p.x, y: p.y, z: p.z, rotY: u < 1 ? Math.atan2(topW.x - from.x, topW.z - from.z) : 2.4, scale: 4.2, flap: u < 1 ? 1 : 0, t, peck: t > PIGEON.lean1 + 0.3 ? 1 : 0 });
      }
      if (focus === 'hero') focus = [HERO[0] + 0.5 * DIR[0], 1.0, HERO[2] + 0.5 * DIR[2]];
      if (focus === 'drop') focus = t < DROP.t0 ? [T[0], 18, T[2]] : t < DROP.t1 ? [dropPizza.position.x, dropPizza.position.y, dropPizza.position.z] : [T[0], 0.5, T[2]];
      if (focus === 'stackTop') focus = [T[0], Math.max(1, topY * 0.8), T[2]];
      if (focus === 'cutter') focus = [cutter.position.x, cutter.position.y, cutter.position.z];
      if (focus === 'top') focus = [T[0], topY + 0.6, T[2]];
      fxPZ.update(t);
    }
    if (shot.set === 'MN') {
      drawBlueprint(t >= 9.9 ? 1 : 0);
      const p = basePose();
      Object.assign(p, { x: 0.1, z: -1.15, rotY: 0, eyes: blink(t, 3), mustache: true, lean: 0.18, headPitch: 0.3 });
      const raise = K(t, [[8.8, 0], [9.45, 1], [9.82, 1], [9.9, 0], [10.4, 0], [10.8, 0.4]]);
      p.armA = A(-0.7, 0.2, -1.3, 0.3);
      p.armB = A(-0.75 - 1.4 * raise, 0.15, -0.9 - 0.5 * raise, -0.25);
      p.smile = t > 10 ? 1 : 0; p.mouth = t > 10 ? 'smile' : 'flat';
      applyPose(minister, p);
      const hw = handWorld(minister, 1); MNg.worldToLocal(hw); mStamp.position.copy(hw).add(new THREE.Vector3(0, -0.06, 0.02));
      aides.forEach(({ p: a, x, z, r }, i) => a.set({ x, z, rotY: r + PI * 0.05, armL: t > 10 ? 1.5 + 0.4 * Math.sin(t * 20 + i) : 0.2, armR: t > 10 ? 1.5 + 0.4 * Math.sin(t * 20 + i + 1) : 0.2, spreadL: t > 10 ? -0.3 : 0.15, spreadR: t > 10 ? -0.3 : 0.15, hop: t > 10 ? Math.abs(Math.sin(t * 9 + i)) * 0.06 : 0 }));
    }
    if (shot.set === 'ST') {
      // fans bounce
      ST.fanPos.forEach((f, i) => ST.fans.set(i, { x: Math.cos(f.a) * f.r, y: f.y, z: Math.sin(f.a) * f.r, rotY: Math.atan2(-Math.cos(f.a), -Math.sin(f.a)), hop: Math.abs(Math.sin(t * 6 + f.ph)) * (t > 18.3 && t < 19.5 ? 0.3 : 0.06) }));
      ST.fans.commit();
      // dough: ball (kneaded) → disc (flattened) → tossed (spinning) → caught → landed → toppings
      let y = 2.2, sx = 2.6, sy = 2.2, rotY = 0;
      if (t < 15.0) { const kn = Math.sin(t * 2 * PI * 2) * 0.5 + 0.5; sx = 2.6 + 0.25 * kn; sy = 2.15 - 0.3 * kn; y = sy; }
      else if (t < 15.7) { const u = smooth((t - 15) / 0.7); sx = lerp(2.6, 3.3, u); sy = lerp(2.15, 0.22, u); y = sy + 0.02; }
      else if (t < 18.35) { const u = (t - 15.7) / (18.35 - 15.7), hgt = 12.5 * 4 * u * (1 - u); sx = 3.3; sy = 0.22; y = 1.75 + hgt; rotY = (t - 15.7) * 3.2; }
      else if (t < 18.9) { const u = smooth((t - 18.35) / 0.55); sx = 3.3; sy = 0.22; y = lerp(1.75, 0.24, u); rotY = 8.5 + (t - 18.35); }
      else { sx = 3.3; sy = 0.22; y = 0.24; rotY = 9; }
      dough.scale.set(sx, sy, sx); dough.rotation.y = rotY; doughG.position.set(0, y, 0); doughG.rotation.y = v.az * D2R; doughG.rotation.x = 0.5 * smooth((t - 15.7) / 0.4) * (1 - smooth((t - 18.0) / 0.35));
      if (focus === 'disc') focus = [0, y, 0];
      // chefs: a ring that kneads (pushes in), then raises arms for the catch, then steps back
      chefs.forEach((c, i) => {
        const a = (i / NCH) * 2 * PI + 0.2;
        if (t < 15.0) { const push = Math.max(0, Math.sin(t * 2 * PI * 2 + i * 0.6)); const r = 3.25 - 0.3 * push; c.set({ x: Math.cos(a) * r, z: Math.sin(a) * r, rotY: Math.atan2(-Math.cos(a), -Math.sin(a)), armL: 1.4, armR: 1.4, spreadL: -0.1, spreadR: -0.1, lean: 0.2 * push }); }
        else if (t < 19.0) { const r = 2.7, up = t > 16 && t < 18.6; c.set({ x: Math.cos(a) * r, z: Math.sin(a) * r, rotY: Math.atan2(-Math.cos(a), -Math.sin(a)), armL: up ? 2.9 : 1.2, armR: up ? 2.9 : 1.2, spreadL: 0.15, spreadR: 0.15, hop: t > 18.35 && t < 18.9 ? Math.abs(Math.sin(t * 12 + i)) * 0.2 : 0, headPitch: up ? -0.5 : 0 }); }
        else { const r = 4.3 + (i % 2) * 0.6; const push = i < 3 && t > 21.9 && t < 22.5; const cx = push ? -4.2 + 1.25 + i * 0.05 : Math.cos(a) * r, cz = push ? (i - 1) * 0.8 : Math.sin(a) * r;
          c.set({ x: cx, z: cz, rotY: push ? -PI / 2 : Math.atan2(-Math.cos(a), -Math.sin(a)), armL: push ? 1.5 : 0.3, armR: push ? 1.5 : 0.3, lean: push ? 0.3 : 0, spreadL: 0.2, spreadR: 0.2, headPitch: 0.2 }); }
      });
      // toppings
      sauce.visible = t >= 19.2; cheese.visible = t >= 20.4; peps.visible = t >= 20.7; sauceTruck.visible = t >= 19.0 && t < 21.2; hopper.visible = t >= 19.9 && t < 21.6; pineapple.visible = t >= 21.2;
      { const u = clamp((t - 19.2) / 1.8), r = 0.25 + 2.75 * u, a = u * 4 * PI; sauce.scale.setScalar(Math.min(3.0, r + 0.3)); sauce.position.y = 0.47;
        sauceTruck.position.set(Math.cos(a) * r, 0.46, Math.sin(a) * r); sauceTruck.rotation.y = -a - PI; }
      cheese.position.y = 0.48; cheese.scale.setScalar(3.0); cheese.material.opacity = smooth((t - 20.4) / 0.9);
      hopper.position.set(0, 7.2 + (1 - smooth((t - 19.9) / 0.4)) * 6, 0);
      { const m4 = new THREE.Matrix4(); PEP.forEach(([x, z, t0], i) => { const s = Math.max(0.001, boing((t - t0) / 0.4)); m4.compose(new THREE.Vector3(x, 0.5, z), new THREE.Quaternion(), new THREE.Vector3(s, 1, s)); peps.setMatrixAt(i, m4); }); peps.instanceMatrix.needsUpdate = true; }
      const pa = pineAt(t); if (pa) { pineapple.position.set(pa.x, pa.y, 0); pineapple.rotation.set(0, 0, pa.roll * 0.6); pineapple.visible = pa.y > -30; }
      stFx.update(t);
    }
    if (shot.set === 'CO') {
      const build = boing((t - 23.3) / 0.9) * (t > 23.3 ? 1 : 0), glow = smooth((t - 25.4) / 1.4);
      colos.userData.setOven(Math.max(0.001, Math.min(1.08, build)), glow);
      colos.userData.mouth.visible = t > 24.0; colos.userData.mouth.material.color.setRGB(1, 0.5 + 0.3 * glow, 0.15 + 0.2 * glow);
      // the pizza on a giant peel carried by chefs, slid into the mouth
      const u = smooth((t - 24.3) / 1.6), z = lerp(7.6, 5.2, u);
      peel.position.set(0, 0.55, z); ovenPizza.position.set(0, 0.6, z); ovenPizza.visible = peel.visible = z > 4.0 && t < 26.4;
      peel.position.z = z; if (t > 25.9) { const w = smooth((t - 25.9) / 0.5); peel.position.z = lerp(5.2, 13, w); ovenPizza.visible = false; }
      coChefs.forEach((c, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); c.set({ x: side * 0.6, z: peel.position.z + 3.0 + k * 0.62, rotY: PI, walk: t > 24.3 && t < 26.4 ? t * 12 + i : null, armL: 1.2, armR: 1.2, spreadL: side > 0 ? 0.35 : 0.0, spreadR: side > 0 ? 0 : 0.35 }); });
      COC.forEach(([x, z], i) => coCrowd.set(i, { x, z, rotY: Math.atan2(-x, -z), hop: t > 25.6 ? Math.abs(Math.sin(t * 7 + i)) * 0.12 : 0 })); coCrowd.commit();
      coCars.forEach((c, i) => { const a = t * 0.18 + i * 1.57; c.position.set(Math.cos(a) * 7.4, 0, Math.sin(a) * 7.4 * 0.92); c.rotation.y = -a; });
      coFx.update(t);
    }
    if (shot.set === 'RM') {
      poseLuca(t);
      const hide = shot.t0 >= 36.0;   // screen + page inserts: hide him (his head sits where the lens is), the chair and the back wall
      luca.root.visible = !hide; chair.visible = !hide; lroom.walls.back.visible = !(shot.t0 >= 37.6 && shot.t0 < 39.6);
      lamp.userData.light.intensity = shot.t0 >= 36.0 ? 1.1 : 3.2;
      // phone in both hands over the page (the photo)
      phone.visible = t >= 36.0 && t < 37.6;
      if (phone.visible) {
        phone.position.set(-0.05, 1.0, -0.1); phone.rotation.set(0.12, PI, 0); drawPhone(t);
      }
      const fk = Math.max(0, 1 - Math.abs(t - PH.photo) / 0.14); flash.intensity = fk * 2.5; flash.position.set(0, 1.1, -0.15);
      // the app: scan → solve 0..40 → write (synced to the HUD's SOLVED roll)
      if (t < 37.9) scr.draw({ mode: 'scan', k: clamp((t - 37.6) / 0.3) });
      else if (t < 39.55) scr.draw({ mode: 'solve', k: clamp((t - 37.9) / 1.6) });
      else scr.draw({ mode: t < 41.3 ? 'write' : 'done', k: 1 });
      physicsChip();
      // handwriting on the page: written during the write insert; before it, the page is blank (just printed)
      const wk = clamp((t - 39.7) / 2.6), total = sheet.total2 ?? sheet.total;
      const tip = sheet.draw(t < 39.6 ? 0 : wk * total);
      const [cx, cy] = tip, pw2 = 0.216, ph2 = 0.28;
      // the page lies rotated (−π/2, 0, π): canvas right → world −x, canvas top → world +z (away from Luca, upright for a lens behind him)
      const lp = new THREE.Vector3(-0.05 - (cx / sheet.w - 0.5) * pw2, 0.777 + 0.004, -0.17 + (0.5 - cy / sheet.h) * ph2);
      pen.visible = t >= 39.6; pen.position.copy(lp);
      if (focus === 'pen') { focus = [lp.x, lp.y, lp.z]; }
      if (focus === 'screen') focus = [0.02, 0.9, 0.14];
      if (shot.t0 >= 39.6) { const v2 = isoAt(t, shot.keys); v2.target = [lp.x * 0.75 + OFF.RM[0] + (-0.05) * 0.25, 0.777 + OFF.RM[1], lp.z * 0.75 + (-0.17) * 0.25 + OFF.RM[2]]; isoCam(studio, v2); }
    }
    if (typeof focus === 'string') focus = [0, 1, 0];
    ts.focusOn([focus[0] + o[0], focus[1] + o[1], focus[2] + o[2]]);
    hud.update(t);
  }
  return { update };
}

// the free-body diagram for problem 2 (strokes in canvas px on the 1024 × 1325 page), spliced into the writing order
function addFBD(G, sheet) {
  const rows = (1325 - 340) / 4, y0 = 300 + rows + 60;          // problem 2's row
  const ox = 330, oy = y0 + 128, H = 128, Wd = 50, th = 0.14;    // pivot (ox, oy), the tower drawn leaning θ = 8° (exaggerated)
  const rot = (x, y) => [ox + x * Math.cos(th) + y * Math.sin(th), oy - (y * Math.cos(th) - x * Math.sin(th))];
  const wob = (pts, s) => { let R = s; const r = () => (R = (R * 16807) % 2147483647) / 2147483647 - 0.5; return pts.map(([x, y]) => [x + r() * 1.4, y + r() * 1.4]); };
  const line = (a, b, n = 10) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * (i / n), a[1] + (b[1] - a[1]) * (i / n)]);
  const S = [];
  S.push({ pts: wob(line([ox - 160, oy], [ox + 160, oy], 16), 3), w: 6 });                                    // ground
  S.push({ pts: wob([rot(-Wd, 0), rot(-Wd, H), rot(0, H), rot(0, 0)].flatMap((p, i, arr) => (i ? line(arr[i - 1], p, 8).slice(1) : [p])), 5), w: 12 });   // the tower (box)
  const cm = rot(-Wd / 2, H / 2);
  S.push({ pts: wob(Array.from({ length: 13 }, (_, i) => [cm[0] + Math.cos(i / 12 * 6.3) * 5, cm[1] + Math.sin(i / 12 * 6.3) * 5]), 7), w: 3 });   // CoM dot
  const wEnd = [cm[0], cm[1] + 92];
  S.push({ pts: wob(line(cm, wEnd, 10), 9), w: 6 }); S.push({ pts: wob([[wEnd[0] - 10, wEnd[1] - 14], wEnd, [wEnd[0] + 10, wEnd[1] - 14]], 11), w: 3 });   // W arrow
  S.push({ pts: wob(line([ox + 4, oy + 46], [ox + 4, oy + 6], 8), 13), w: 5 }); S.push({ pts: wob([[ox - 5, oy + 18], [ox + 4, oy + 6], [ox + 13, oy + 18]], 15), w: 3 });   // N arrow at the pivot
  for (let k = 0; k < 5; k++) S.push({ pts: wob(line([cm[0], oy - 6 - k * 22 + 140 - 140], [cm[0], oy - 18 - k * 22]), 17 + k), w: 1 });        // dashed vertical through the CoM
  S.push({ pts: wob(line([cm[0], oy + 22], [ox, oy + 22], 8), 23), w: 4 }); S.push({ pts: wob([[cm[0], oy + 14], [cm[0], oy + 30]], 25), w: 1 }); S.push({ pts: wob([[ox, oy + 14], [ox, oy + 30]], 27), w: 1 });   // lever arm d
  S.push({ pts: wob(Array.from({ length: 9 }, (_, i) => { const a = -PI / 2 + (i / 8) * th; return [ox + Math.cos(a) * 60 * 0 + Math.sin(i / 8 * th) * 70, oy - Math.cos(i / 8 * th) * 70]; }), 29), w: 3 });   // θ arc
  const items = S.map((s) => ({ kind: 'p', pts: s.pts, w: s.w, line: 4.2, pi: 1 }));
  const lab = (txt, x, y, u = 24, seed = 1) => layoutHand(G, txt, { x, y, u, seed }).map((q) => ({ ...q, kind: 'g', pi: 1 }));
  items.push(...lab('W = mg', wEnd[0] + 14, wEnd[1] + 4, 24, 31), ...lab('N', ox + 16, oy + 50, 22, 33), ...lab('pivot', ox + 30, oy + 26, 18, 35), ...lab('d', (cm[0] + ox) / 2 - 6, oy + 46, 22, 37), ...lab('θ', ox + 10, oy - 76, 22, 39), ...lab('CM', cm[0] - 64, cm[1] + 8, 20, 41));
  items.push(...lab('T = W x d', 620, y0 + 40, 28, 43), ...lab('ΣF = 0', 620, y0 + 96, 28, 45), ...lab('N = W', 620, y0 + 152, 28, 47));
  // splice after problem 1's items
  let idx = sheet.items.findIndex((it) => it.pi >= 2); if (idx < 0) idx = sheet.items.length;
  sheet.items.splice(idx, 0, ...items);
  sheet.total2 = sheet.items.reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);
}
