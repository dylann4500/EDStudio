// VIDEO 007 — "What if every human became twice as smart?"  (tone: MONTAGE — see docs/TONES.md)
// 61.5 s, 9 beats, FIVE sets in one scene (each set's root is parked at its own offset; only the current one is visible).
// Montage rule (user steer): show the premise in many places — every beat = a new location + one subtitle + a HUD time stamp.
//
// Shot list (seconds)                    | set        | what happens
//  0.0– 9.5  street   SECOND 0            | street     | crowd walks; a blue glow wave passes through every head; all stop, hand to chin
//  9.5–15.5  class    +1 minute           | classroom  | a first grader on a stool fills the board (…P = NP ✓); the teacher takes notes
// 15.5–21.5  traffic  +1 hour             | city       | signal dark; cars zipper through the intersection without stopping
// 21.5–27.0  phones   +1 day              | street     | everyone staring at phones… all pocket them at once, look up, talk
// 27.0–33.0  war      +3 months           | war room   | six leaders sign in sync, stand, applaud; the globe turns green
// 33.0–39.0  hosp     +1 year             | street     | CANCER: CURED banner, doctors run out, crowd jumps, confetti
// 39.0–44.5  solar    +5 years            | city roof  | solar panels on the roof, wind turbines on the horizon, clear sky
// 44.5–50.0  rocket   +12 years           | city roof  | a rocket climbs out from behind downtown; the roof crowd watches
// 50.0–61.5  sheet    +20 years           | bedroom    | Gary (cameo from 002) loses to a fitted sheet, wads it up. "Almost."
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makePhone } from '@engine/props.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, makeCar, ROOF_Y } from '@engine/sets/city.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildWarRoom, DIMS as WD } from '@engine/sets/warroom.js';
import { buildBedroom } from '@engine/sets/bedroom.js';

const PI = Math.PI;
// where each set lives in the world (city stays at the origin: its sky domes follow the camera)
const OFF = { city: [0, 0, 0], street: [1500, 0, 0], cls: [3000, 0, 0], war: [4500, 0, 0], bed: [6000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 9.5, cam: 'street', set: 'street' },
  { t0: 9.5, t1: 15.5, cam: 'class', set: 'cls' },
  { t0: 15.5, t1: 21.5, cam: 'traffic', set: 'city' },
  { t0: 21.5, t1: 27.0, cam: 'phones', set: 'street' },
  { t0: 27.0, t1: 33.0, cam: 'war', set: 'war' },
  { t0: 33.0, t1: 39.0, cam: 'hosp', set: 'street' },
  { t0: 39.0, t1: 44.5, cam: 'solar', set: 'city' },
  { t0: 44.5, t1: 50.0, cam: 'rocket', set: 'city' },
  { t0: 50.0, t1: 61.5, cam: 'sheet', set: 'bed' },
];
// camera coordinates are LOCAL to the shot's set (OFF is added at runtime). p/a = start→end, fov, amp = handheld drift
export const CAMS = {
  street:  { p: [[-20.0, 1.45, 5.6], [-20.0, 1.42, 4.5]], a: [[-20.0, 1.5, -1.6], [-20.0, 1.48, -1.6]], fov: 48, amp: 0.006 },
  class:   { p: [[2.35, 1.5, 1.6], [2.0, 1.45, 1.2]], a: [[-0.2, 1.25, -3.0], [-0.1, 1.25, -3.0]], fov: 50, amp: 0.004 },
  traffic: { p: [[13.0, 9.5, 8.0], [11.5, 8.6, 6.0]], a: [[0.0, 0.0, -6.0], [0.0, 0.0, -6.0]], fov: 50, amp: 0.006 },
  phones:  { p: [[-5.8, 1.6, 5.2], [-5.8, 1.55, 4.4]], a: [[-5.8, 1.3, -1.5], [-5.8, 1.28, -1.5]], fov: 46, amp: 0.005 },
  war:     { p: [[0.0, 2.35, 3.9], [0.0, 2.2, 3.35]], a: [[0, 1.05, -0.2], [0, 1.1, -0.2]], fov: 52, amp: 0.004 },
  hosp:    { p: [[-11.3, 1.75, 7.4], [-11.35, 1.7, 6.6]], a: [[-11.45, 2.3, -2.0], [-11.45, 2.25, -2.0]], fov: 50, amp: 0.006 },
  solar:   { p: [[-8.6, ROOF_Y + 1.9, 12.6], [-9.2, ROOF_Y + 1.8, 12.3]], a: [[-200, ROOF_Y + 18, -20], [-200, ROOF_Y + 17, -30]], fov: 46, amp: 0.004 },
  rocket:  { p: [[-11.2, ROOF_Y + 1.7, 16.0], [-11.4, ROOF_Y + 1.6, 15.6]], a: [[-24, ROOF_Y + 20, -300], [-24, 120, -300]], fov: 34, amp: 0.003, ease: 'track' },
  sheet:   { p: [[1.75, 1.6, 1.45], [1.45, 1.52, 1.05]], a: [[-0.3, 1.05, -1.6], [-0.2, 1.05, -1.65]], fov: 52, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (tested in 002's pose lineup)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const CHIN_B = A(-1.15, 0.05, -2.3, -0.6);                 // "hmm" — hand under the chin
const CROSS_A = A(-0.5, -0.05, -1.6, 0.75);                // forearm across the belly (supports the chin arm)
const PHONE_LOOK_B = A(-0.75, 0.05, -1.45, -0.45);          // holding a phone at chest height, looking down at it
const PHONE_LOOK_A = A(-0.6, 0.0, -1.35, 0.5);
const WRITE_B = A(-0.85, 0.12, -0.9, -0.3);                // writing on a table / notepad in front
const PAD_A = A(-0.7, 0.0, -1.5, 0.7);                     // holding a notepad
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);   // both arms up
const CLAP_A = A(-1.0, 0.1, -1.2, 0.6), CLAP_B = A(-1.0, 0.1, -1.2, -0.6);
const BOARD_B = A(-2.3, 0.25, -0.35, -0.2);                // reaching up to write on a board
const POINT_B = A(-2.0, 0.15, -0.05, 0);                    // pointing up at the sky
const SHEET_A = A(-1.15, 0.65, -0.35, 0.2), SHEET_B = A(-1.15, 0.65, -0.35, -0.2); // holding a sheet out wide
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));
function walkDist(t, v, tStop = 1e9, ramp = 0.5) { if (t <= tStop) return v * t; const u = Math.min(t - tStop, ramp); return v * (tStop + u - (u * u) / (2 * ramp)); }
const bell = (x, w) => Math.exp(-(x * x) / (w * w));

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const BOARD = ['∫ e^(−x²) dx = √π', '∇ · E = ρ / ε₀', 'e^(iπ) + 1 = 0', 'P = NP   ✓'];
const KS = 0.62; // kid scale

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const off = (key, x, y, z) => [x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]];

  // ---------------------------------------------------------------- sets (each parked at its offset; fogs kept per set)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('off'); city.setGrowth(0); city.setSnow(0);
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls); cls.setClock(9, 42); cls.setSeason('autumn', 0); cls.setDoor(0);
  const war = buildWarRoom(studio, {}); war.root.position.set(...OFF.war);
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.setDoor(0); bed.setLamp(1); bed.setNightlight(0); bed.setXmas(0, 0);
  bed.lights.spill.intensity = 0;
  const ROOTS = { street: street.root, city: city.root, cls: cls.root, war: war.root, bed: bed.root };
  const FOGS = { street: streetFog, city: cityFog, cls: null, war: null, bed: null };
  const FAR = { street: 400, city: 900, cls: 60, war: 60, bed: 60 };

  // ---------------------------------------------------------------- props built for this video
  // classroom: a step stool at the board
  const stool = new THREE.Group(); cls.root.add(stool); stool.position.set(0.3, 0, -2.62);
  mk(new THREE.BoxGeometry(0.42, 0.34, 0.3), mat(0xc89a66, 0.6), stool, 0, 0.17, 0);
  // teacher's notepad
  const pad = new THREE.Group(); mk(new THREE.BoxGeometry(0.16, 0.012, 0.22), mat(0xf6efd8, 0.8), pad); mk(new THREE.BoxGeometry(0.16, 0.014, 0.03), mat(0x2f6aa8, 0.6), pad, 0, 0.002, -0.1);
  // war room: one treaty sheet in front of each seat
  const treaties = new THREE.Group(); war.root.add(treaties);
  const treatyTex = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#fbf7ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#333'; g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center'; g.fillText('PEACE', w / 2, 52); g.fillStyle = '#888'; for (let i = 0; i < 9; i++) g.fillRect(30, 80 + i * 20, w - 60 - (i % 3) * 30, 6); g.strokeStyle = '#1d3b6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 285); g.bezierCurveTo(100, 260, 130, 300, 190, 275); g.stroke(); });
  // hospital: banner over the doors + confetti
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.75), new THREE.MeshStandardMaterial({ map: canvasTex(880, 150, (g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f9a5a'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#2f9a5a'; g.font = 'bold 84px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CANCER: CURED ✓', w / 2, h / 2 + 4); }), roughness: 0.7, side: THREE.DoubleSide }));
  banner.position.set(-11.5, 2.45, -2.1); street.root.add(banner);
  const CONF = 420, confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), CONF);
  confetti.frustumCulled = false; street.root.add(confetti);
  const CR = rng(77), confSeeds = Array.from({ length: CONF }, () => [CR(), CR(), CR(), CR(), CR()]);
  const confCols = [0xe2574c, 0xf2b632, 0x4f9bd9, 0x58b368, 0xa77bd1, 0xf08a4b, 0xffffff];
  confSeeds.forEach((s, i) => confetti.setColorAt(i, new THREE.Color(confCols[i % confCols.length])));
  // city roof: solar panels
  const solar = new THREE.Group(); city.root.add(solar);
  const panelTex = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#1d3354'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(170,200,240,.55)'; g.lineWidth = 3; for (let x = 0; x <= w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const panelMat = new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.25, metalness: 0.4 });
  for (let row = 0; row < 4; row++) for (let k = 0; k < 3; k++) {
    const p = new THREE.Group(); p.position.set(-15.6 + k * 2.6, ROOF_Y + 0.55, 9.6 + row * 1.7); p.rotation.x = -0.45; solar.add(p);
    mk(new THREE.BoxGeometry(2.3, 0.05, 1.2), panelMat, p);
    mk(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), mat(0x8a8f96, 0.4), p, 0, -0.3, 0.4);
  }
  // wind turbines on the western horizon
  const turbines = [];
  const towerM = mat(0xf2f2f0, 0.5);
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(); g.position.set(-250 - (i % 3) * 30, 0, -150 + i * 32); city.root.add(g);
    const h = 62 + (i % 4) * 6;
    mk(new THREE.CylinderGeometry(1.0, 1.8, h, 12), towerM, g, 0, h / 2, 0);
    mk(new THREE.BoxGeometry(5, 3, 3), towerM, g, 1.2, h + 0.5, 0);
    const hub = new THREE.Group(); hub.position.set(4.0, h + 0.5, 0); hub.rotation.y = PI / 2; g.add(hub);
    for (let b = 0; b < 3; b++) { const bl = mk(new THREE.BoxGeometry(1.4, 26, 0.5), towerM, hub, 0, 13, 0); bl.geometry.translate(0, 0, 0); const arm = new THREE.Group(); arm.rotation.z = (b * 2 * PI) / 3; hub.add(arm); arm.add(bl); }
    turbines.push({ hub, ph: i * 0.7 });
  }
  // rocket + launch glow + smoke column
  const ROCKET = [-24, 0, -300];
  const rocket = new THREE.Group(); city.root.add(rocket);
  const hull = mat(0xf4f4f2, 0.35);
  mk(new THREE.CylinderGeometry(3.2, 3.2, 44, 24), hull, rocket, 0, 22, 0);
  mk(new THREE.ConeGeometry(3.2, 10, 24), hull, rocket, 0, 49, 0);
  mk(new THREE.CylinderGeometry(3.25, 3.25, 3, 24), mat(0x2b2f36, 0.5), rocket, 0, 36, 0);
  for (let f = 0; f < 4; f++) { const fin = mk(new THREE.BoxGeometry(0.5, 8, 5), mat(0x2b2f36, 0.5), rocket, Math.sin(f * PI / 2) * 4, 4, Math.cos(f * PI / 2) * 4); fin.rotation.y = f * PI / 2; }
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(3), transparent: true, opacity: 0.95, toneMapped: false, depthWrite: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(3.4, 22, 20, 1, true), flameMat); flame.rotation.x = PI; flame.position.y = -10; rocket.add(flame);
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(1.8, 12, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(4), toneMapped: false })); flameCore.rotation.x = PI; flameCore.position.y = -5; rocket.add(flameCore);
  const launchLight = new THREE.PointLight(0xffb060, 0, 600, 1.2); city.root.add(launchLight);
  const SMOKE = 160, smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 1, transparent: true, opacity: 0.92 }), SMOKE);
  smoke.frustumCulled = false; city.root.add(smoke);
  const SR = rng(55), smokeSeeds = Array.from({ length: SMOKE }, () => [SR(), SR(), SR(), SR()]);
  // traffic: 4 lanes × 6 cars
  const CAR_COLS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xf5f0e2, 0x8f6fb8, 0x2f4f73, 0xe08a3a];
  const LANES = [ // pos(s) = center + dir * v * s ; s = seconds relative to the moment it crosses the intersection center
    { c: [2, -6], d: [0, -1], ph: 0.0 }, { c: [-2, -6], d: [0, 1], ph: 0.0 },
    { c: [0, -4], d: [1, 0], ph: 1.1 }, { c: [0, -8], d: [-1, 0], ph: 1.1 },
  ];
  const CAR_V = 12, CAR_P = 2.2;
  const cars = LANES.flatMap((L, li) => Array.from({ length: 6 }, (_, j) => { const c = makeCar(CAR_COLS[(li * 3 + j) % CAR_COLS.length], li * 10 + j); city.root.add(c.g); return { c, L, j }; }));
  if (cars[0].c.setLights) cars.forEach(({ c }) => c.setLights(0));

  // ---------------------------------------------------------------- cast
  const R = rng(11);
  const randPerson = () => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.25, mustache: style !== 'bob' && R() < 0.3 ? HAIRS[Math.floor(R() * 3)] : null });
    scene.add(p.root); p.seed = R(); p.seed2 = R(); p.seed3 = R(); return p;
  };
  const extras = Array.from({ length: 26 }, randPerson);
  const phones = extras.map((e) => { const ph = makePhone(); e.arms.find((a) => a.s === 1).hand.add(ph.g); ph.g.position.set(-0.03, -0.07, 0.04); ph.g.rotation.set(0.9, 0, 0); ph.screenMat.emissiveIntensity = 1.2; return ph; });
  const kids = Array.from({ length: 9 }, () => { const k = randPerson(); k.root.scale.setScalar(KS); return k; });
  const teacher = makePerson({ skin: 0xe2ad8c, top: 0x7a9e7e, collar: 0xf3e9dc, pants: 0x4a4f5c, hair: 0x8a5a3a, hairStyle: 'bob', glasses: true }); scene.add(teacher.root);
  teacher.arms.find((a) => a.s === -1).hand.add(pad); pad.position.set(0.02, -0.06, 0.06); pad.rotation.set(0.6, 0, 0);
  const LEAD = [
    { a: -1.25, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short' },
    { a: PI + 0.75, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob' },
    { a: PI - 1.25, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short' },
    { a: PI + 1.95, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', glasses: true },
    { a: 1.25, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob' },
    { a: PI - 0.75, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy' },
  ];
  const leaders = LEAD.map((L) => { const P = makePerson({ ...L, collar: 0xf1ede4 }); scene.add(P.root); return P; });
  LEAD.forEach((L) => {
    const r = WD.table.r - 0.32, m = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.27), new THREE.MeshStandardMaterial({ map: treatyTex, roughness: 0.8 }));
    m.rotation.set(-PI / 2, 0, -L.a); m.position.set(Math.sin(L.a) * r, WD.table.top + 0.006, Math.cos(L.a) * r); treaties.add(m);
  });
  const doctors = [0, 1, 2].map((i) => { const d = makePerson({ skin: [0xf1c3a1, 0x9a6447, 0xe2ad8c][i], top: 0xf7f7f4, collar: 0x7fb7b0, pants: [0x5fa39b, 0x7fa0c9, 0x5fa39b][i], shoes: 0xf2f2f2, hair: [0x9a6a3a, 0x1a1a1a, 0x2a1d16][i], hairStyle: ['short', 'bob', 'messy'][i], glasses: i === 0 }); scene.add(d.root); return d; });
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 }); scene.add(gary.root);
  const ALL = [...extras, ...kids, teacher, ...leaders, ...doctors, gary];
  const hide = () => ALL.forEach((p) => (p.root.visible = false));
  const glowCol = new THREE.Color(0x7fc8ff);
  // "brain doubles" halo: a soft additive blue glow parented to every extra's head (S1 only)
  const haloTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(190,230,255,1)'); gr.addColorStop(0.35, 'rgba(120,190,255,.55)'); gr.addColorStop(1, 'rgba(120,190,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const halos = extras.map((e) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.position.set(0, 0.16, 0); sp.scale.setScalar(0.75); e.headG.add(sp); return sp; });

  // fitted sheet: a cloth hung between Gary's hands (or crumpled into a ball)
  const SW = 18, SHt = 14, sheetGeo = new THREE.PlaneGeometry(1, 1, SW, SHt);
  const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.9, side: THREE.DoubleSide }));
  sheet.castShadow = true; sheet.frustumCulled = false; scene.add(sheet);
  const SRn = rng(3), sheetNoise = Array.from({ length: (SW + 1) * (SHt + 1) }, () => [SRn() - 0.5, SRn() - 0.5, SRn() - 0.5]);
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  function updateSheet(t, hA, hB, crumple, ballPos) {
    const pos = sheetGeo.attributes.position;
    const span = _b.subVectors(hB, hA), len = span.length();
    const fwd = new THREE.Vector3(-span.z, 0, span.x).normalize();               // perpendicular, horizontal
    const mid = _c.addVectors(hA, hB).multiplyScalar(0.5);
    for (let j = 0; j <= SHt; j++) for (let i = 0; i <= SW; i++) {
      const u = i / SW, v = j / SHt, idx = j * (SW + 1) + i, n = sheetNoise[idx];
      // hanging: top edge between the hands with a sag, falls ~1.05 m, bottom corners curl in (the elastic)
      const sag = 0.12 * Math.sin(PI * u);
      const flap = 0.06 * Math.sin(t * 7.0 + u * 5 + v * 3) * v;
      const curl = 0.22 * v * v * (Math.abs(u - 0.5) * 2) ** 2;
      _a.copy(hA).lerp(hB, u);
      _a.y -= sag + v * 1.0 - curl * 0.6;
      _a.addScaledVector(fwd, 0.1 * v + flap + curl * 0.8 + n[2] * 0.03 * v);
      _a.addScaledVector(span, (0.5 - u) * curl * 0.5 / Math.max(len, 0.01));
      if (crumple > 0) { // collapse toward a lumpy ball
        const dir = new THREE.Vector3(u - 0.5 + n[0], v - 0.5 + n[1], n[2] * 2).normalize();
        const ball = new THREE.Vector3().copy(ballPos).addScaledVector(dir, 0.16 + 0.05 * Math.abs(n[0] * 2));
        _a.lerp(ball, crumple);
      }
      pos.setXYZ(idx, _a.x, _a.y, _a.z);
    }
    pos.needsUpdate = true; sheetGeo.computeVertexNormals(); sheetGeo.computeBoundingSphere();
    const nn = sheetGeo.attributes.normal; for (let i = 0; i < nn.count; i++) { const x = nn.getX(i), y = nn.getY(i), z = nn.getZ(i); if (!(x * x + y * y + z * z > 1e-8)) nn.setXYZ(i, 0, 1, 0); }
  }

  // ---------------------------------------------------------------- performances (local coords; `key` = set; floor auto)
  function put(rig, key, p, scale = 1) {
    p.floor = p.floor || 0;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    if (scale !== 1) rig.root.position.y = (p.y || 0) * scale; // scaled figures: local y → world
  }

  function streetCrowd(t, e, i) { // S1: side-on walkers; glow wave; stop; "hmm"
    const p = basePose(); p.eyes = blink(t, i + 3); p.y = SH; p.floor = SH;
    const v = (e.seed < 0.5 ? -1 : 1) * (0.75 + e.seed2 * 0.45);
    const lanes = [-2.5, -2.0, -1.5, -1.0, -0.55];
    const d = walkDist(t, v, 7.25 + e.seed2 * 0.3, 0.45);
    p.x = wrap(((i * 0.37 + e.seed * 0.3) % 1) * 12 - 26 + d, -26, -14); p.z = lanes[i % lanes.length] + (e.seed3 - 0.5) * 0.15;
    p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(d); p.speed = t < 7.25 + e.seed2 * 0.3 ? Math.abs(v) : 0;
    const think = K(t, [[7.7 + e.seed * 0.15, 0], [8.1 + e.seed * 0.15, 1]]);
    p.armB = mixArm(REST, CHIN_B, think); p.armA = mixArm(REST, CROSS_A, think);
    p.headPitch = lerp(0.05, -0.22, think); p.headYaw = (e.seed - 0.5) * 0.5 * think;
    p.mouth = t > 7.0 && t < 7.7 ? 'o' : think > 0.5 ? 'flat' : 'smile';
    const glow = bell(t - (6.85 + (p.x + 26) / 12 * 0.55), 0.22);
    e.mats.faceSkin.emissive.copy(glowCol).multiplyScalar(1.2 * glow); halos[i].material.opacity = glow;
    return p;
  }
  function phoneCrowd(t, e, i) { // S4: everyone on their phone → pocket them in sync → look up, chat
    const spots = [[-7.6, -1.9, 0.6], [-6.9, -1.2, -0.4], [-5.9, -2.2, 0.2], [-5.0, -1.4, -0.7], [-4.2, -2.3, 0.3], [-3.6, -1.1, -0.5], [-8.3, -0.9, 0.9], [-6.4, -0.6, 0.1], [-4.7, -0.5, -0.3], [-7.2, -2.6, 0.4]];
    if (i >= spots.length) return null;
    const [x, z, r] = spots[i];
    const p = basePose(); p.eyes = blink(t, i + 9); p.y = SH; p.floor = SH; p.x = x; p.z = z; p.rotY = r;
    const drop = K(t, [[23.3 + e.seed * 0.15, 0], [23.8 + e.seed * 0.15, 1]]);
    p.armB = mixArm(PHONE_LOOK_B, REST, drop); p.armA = mixArm(PHONE_LOOK_A, REST, drop);
    p.headPitch = lerp(0.62, 0.0, K(t, [[23.4 + e.seed * 0.15, 0], [23.9 + e.seed * 0.15, 1]]));
    const look = K(t, [[24.4 + e.seed * 0.3, 0], [24.9 + e.seed * 0.3, 1]]);
    p.headYaw = (i % 2 ? 0.7 : -0.7) * look; p.mouth = look > 0.5 ? (Math.sin(t * 9 + i) > 0.2 ? 'o' : 'smile') : 'flat';
    phones[i].g.visible = drop < 0.6; phones[i].screenMat.emissiveIntensity = 1.4 * (1 - drop);
    return p;
  }
  function hospCrowd(t, e, i) { // S6: crowd cheers + jumps
    const spots = [[-14.4, -1.2, 0.35], [-13.6, -0.3, 0.25], [-9.6, -0.4, -0.25], [-8.9, -1.3, -0.35], [-15.2, -2.1, 0.5], [-8.2, -2.2, -0.5], [-13.0, -1.9, 0.15], [-10.0, -2.2, -0.15]];
    if (i >= spots.length) return null;
    const [x, z, r] = spots[i];
    const p = basePose(); p.eyes = blink(t, i + 2); p.floor = SH; p.x = x; p.z = z; p.rotY = r;
    const cheer = K(t, [[34.0 + e.seed * 0.4, 0], [34.4 + e.seed * 0.4, 1]]);
    const hop = cheer * Math.max(0, Math.sin((t - 34) * (6.5 + e.seed * 1.5) + e.seed * 6)) * 0.14;
    p.y = SH + hop; p.armA = mixArm(REST, CHEER_A, cheer); p.armB = mixArm(REST, CHEER_B, cheer);
    p.armA.sz += 0.15 * Math.sin(t * 8 + i); p.armB.sz += 0.15 * Math.sin(t * 8 + i + 1);
    p.mouth = cheer > 0.5 ? 'o' : 'smile'; p.headPitch = -0.12 * cheer;
    return p;
  }
  function roofCrowd(t, e, i, shot) { // S7/S8: people on the roof (backs to us), pointing at the rocket
    const spots = shot === 'solar' ? [[-15.8, 8.9, 0.0], [-15.0, 8.7, 0.0]] : [[-12.6, 9.0, PI], [-11.0, 8.8, PI], [-13.9, 9.3, PI], [-9.6, 9.1, PI]];
    if (i >= spots.length) return null;
    const [x, z, r] = spots[i];
    const p = basePose(); p.eyes = blink(t, i); p.y = ROOF_Y; p.floor = ROOF_Y; p.x = x; p.z = z;
    if (shot === 'solar') { p.rotY = -PI / 2 - 0.3 + i * 0.6; p.armA = A(0.1, 0.1, -0.3, 0); p.headYaw = i ? -0.4 : 0.4; return p; }
    p.rotY = r + (e.seed - 0.5) * 0.3;
    const lift = K(t, [[45.6, 0], [47.0, 1]]);
    p.headPitch = lerp(0, -0.6, lift);
    if (i % 2 === 0) p.armB = mixArm(REST, POINT_B, K(t, [[46.0 + i * 0.2, 0], [46.5 + i * 0.2, 1]]));
    return p;
  }

  function kidPose(t, i) { // S2: kids at desks looking at the board; kid 0 = the genius on the stool
    const p = basePose(); p.eyes = blink(t, i + 4);
    if (i === 0) {
      Object.assign(p, { x: 0.3, z: -2.55, y: 0.34 / KS, floor: 0.34 / KS, rotY: PI });
      const w = Math.sin(t * 13) * 0.08 + Math.sin(t * 5.1) * 0.06;
      const lineK = clamp((t - 10.0) / 3.6);
      p.armB = { ...BOARD_B, sx: BOARD_B.sx + 0.25 * lineK + w, sz: BOARD_B.sz + 0.12 * Math.sin(t * 3) };
      p.headPitch = -0.25 + 0.2 * lineK;
      if (t > 14.1) { p.rotY = lerpAngle(PI, 0.4, K(t, [[14.1, 0], [14.5, 1]])); p.armB = mixArm(p.armB, REST, K(t, [[14.1, 0], [14.5, 1]])); p.headPitch = 0; }
      return p;
    }
    const d = CD.desks[[0, 1, 2, 3, 4, 5, 7, 9][i - 1]];
    Object.assign(p, { x: d.x, z: d.z + CD.chair.dz, rotY: PI, y: -0.22, footFwd: 0.4, lean: 0.06 });
    p.headYaw = clamp(faceToward(d.x, d.z, 0.3, -2.8) - PI, -0.6, 0.6) * -1;
    p.headPitch = -0.12; p.mouth = t > 12.0 ? 'o' : 'smile';
    p.armA = A(-0.7, 0.05, -0.9, 0.3); p.armB = A(-0.7, 0.05, -0.9, -0.3);
    return p;
  }
  function teacherPose(t) {
    const p = basePose(); p.eyes = blink(t, 1);
    Object.assign(p, { x: -0.75, z: -1.95, rotY: faceToward(-0.75, -1.95, 0.3, -2.8) + 0.5 });
    const notes = K(t, [[12.6, 0], [13.0, 1]]);
    p.armA = mixArm(REST, PAD_A, notes);
    p.armB = mixArm(REST, WRITE_B, notes); p.armB.sx += 0.07 * Math.sin(t * 16) * notes; p.armB.el += 0.18 * notes;
    p.headPitch = lerp(-0.05, 0.45, notes); p.mouth = t < 12.6 ? 'o' : 'flat';
    pad.visible = notes > 0.05;
    return p;
  }
  function leaderPose(t, i) {
    const L = LEAD[i], Rr = WD.ring;
    const p = basePose(); p.eyes = blink(t, i + 1); p.glasses = !!L.glasses;
    p.x = Math.sin(L.a) * Rr; p.z = Math.cos(L.a) * Rr; p.rotY = L.a + PI;
    const sign = K(t, [[27.2, 1], [30.4 + i * 0.05, 1], [30.8 + i * 0.05, 0]]);
    const clap = K(t, [[30.9 + i * 0.05, 0], [31.2 + i * 0.05, 1]]);
    p.lean = 0.32 * sign; p.headPitch = lerp(0.0, 0.6, sign);
    p.armA = mixArm(A(-0.62, 0.12, -0.55), REST, 1 - sign);
    p.armB = mixArm(WRITE_B, REST, 1 - sign); p.armB.sx += 0.06 * Math.sin(t * 15 + i) * sign;
    if (clap > 0) { const c = 0.18 * Math.max(0, Math.sin((t - 31) * 18 + i)); p.armA = mixArm(p.armA, { ...CLAP_A, sz: CLAP_A.sz + c }, clap); p.armB = mixArm(p.armB, { ...CLAP_B, sz: CLAP_B.sz + c }, clap); }
    p.mouth = clap > 0.5 ? 'smile' : 'flat';
    return p;
  }
  function doctorPose(t, i) {
    const p = basePose(); p.eyes = blink(t, i + 5); p.y = SH; p.floor = SH;
    const run = K(t, [[33.3 + i * 0.25, 0], [34.6 + i * 0.25, 1]]);
    p.x = -11.5 + (i - 1) * 0.9 * run; p.z = lerp(-2.7, -1.0 + (i === 1 ? 0.3 : 0), run); p.rotY = 0;
    p.dist = 1.8 * run; p.speed = run > 0.02 && run < 0.98 ? 1.3 : 0;
    const cheer = K(t, [[34.7 + i * 0.2, 0], [35.0 + i * 0.2, 1]]);
    p.armA = mixArm(REST, CHEER_A, cheer); p.armB = mixArm(REST, CHEER_B, cheer);
    p.y = SH + cheer * Math.max(0, Math.sin((t - 35) * 7 + i * 2)) * 0.12; p.mouth = cheer > 0.5 ? 'o' : 'smile';
    return p;
  }
  function garyPose(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: 0.55, z: -1.15, rotY: faceToward(0.55, -1.15, 1.6, 1.3) - 0.35 });
    // three attempts: hands apart (spread the sheet) → together (fold) … the third one wins nothing
    const fold = (a) => K(t, [[a, 0], [a + 0.45, 1], [a + 0.8, 1], [a + 1.15, 0]]);
    const f = Math.max(fold(50.6), fold(51.9), fold(53.1));
    const wad = K(t, [[54.1, 0], [54.6, 1]]), toss = K(t, [[55.0, 0], [55.35, 1]]);
    const spread = mixArm(SHEET_A, A(-1.0, 0.1, -0.8, 0.3), f), spreadB = mixArm(SHEET_B, A(-1.0, 0.1, -0.8, -0.3), f);
    p.armA = mixArm(spread, A(-0.8, 0.05, -1.4, 0.6), wad); p.armB = mixArm(spreadB, A(-0.8, 0.05, -1.4, -0.6), wad);
    if (toss > 0) { p.armB = mixArm(p.armB, A(-1.4, 0.2, -0.2, 0), toss); p.armA = mixArm(p.armA, REST, toss); }
    p.headPitch = lerp(0.3, 0.1, wad) - 0.05 * f; p.headYaw = K(t, [[55.6, 0], [56.0, 0.35]]);  // deadpan look at us
    p.mouth = t > 52.9 && t < 53.8 ? 'o' : 'flat';
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let lastSet = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== lastSet) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; lastSet = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = S === 'bed' ? 1.4 : S === 'war' ? 0.8 : 0.35;
    hide(); sheet.visible = false; confetti.visible = false;

    if (S === 'street') {
      const center = { street: [-20, -1.5], phones: [-5.8, -1.5], hosp: [-11.5, -1.5] }[shot.cam];
      street.aimSun(center[0], center[1], 9); street.setSeason(shot.cam === 'hosp' ? 'summer' : shot.cam === 'phones' ? 'spring' : 'spring', t, center);
      banner.visible = shot.cam === 'hosp';
      extras.forEach((e, i) => {
        e.mats.faceSkin.emissive.setHex(0); halos[i].material.opacity = 0;
        const p = shot.cam === 'street' ? streetCrowd(t, e, i) : shot.cam === 'phones' ? phoneCrowd(t, e, i) : hospCrowd(t, e, i);
        phones[i].g.visible = shot.cam === 'phones' && p !== null && phones[i].g.visible;
        if (p) { put(e, 'street', p); e.root.visible = true; }
      });
      if (shot.cam !== 'phones') phones.forEach((ph) => (ph.g.visible = false));
      if (shot.cam === 'hosp') {
        doctors.forEach((d, i) => { put(d, 'street', doctorPose(t, i)); d.root.visible = true; });
        confetti.visible = true;
        const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), v3 = new THREE.Vector3();
        const age = Math.max(0, t - 33.9);
        confSeeds.forEach((s, i) => {
          const fall = (age * (0.55 + s[3] * 0.5) + s[4] * 4.5) % 4.6;
          v3.set(-15 + s[0] * 7.5 + Math.sin(t * 2 + i) * 0.15, age > 0 ? 4.4 - fall : -50, -3 + s[1] * 4.2);
          q.setFromEuler(e3.set(t * (2 + s[2] * 4) + i, t * 3 + i * 0.7, i));
          m.compose(v3, q, s3); confetti.setMatrixAt(i, m);
        });
        confetti.instanceMatrix.needsUpdate = true; if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
      }
    } else if (S === 'cls') {
      kids.forEach((k, i) => { put(k, 'cls', kidPose(t, i), KS); k.root.visible = true; });
      put(teacher, 'cls', teacherPose(t)); teacher.root.visible = true;
      const n = t < 10.2 ? 0 : t < 11.2 ? 1 : t < 12.2 ? 2 : t < 13.2 ? 3 : 4;
      cls.setBoard(BOARD.slice(0, n).join('\n'));
    } else if (S === 'war') {
      leaders.forEach((L, i) => { put(L, 'war', leaderPose(t, i)); L.root.visible = true; });
      if (war.setGlobeLight) war.setGlobeLight(1);
      war.globe.spin.rotation.y = t * 0.15;
      const green = K(t, [[30.8, 0], [31.6, 1]]);
      war.globe.mat.emissive.setHex(0xffffff).lerp(new THREE.Color(0x9dffb8), green);
    } else if (S === 'city') {
      if (shot.cam === 'traffic') {
        city.setShadowFocus(0, -6, 30); city.setTime({});
        cars.forEach(({ c, L, j }) => {
          const s = (((t - L.ph - j * CAR_P) % (6 * CAR_P)) + 6 * CAR_P) % (6 * CAR_P) - 3 * CAR_P;
          c.g.visible = true;
          c.g.position.set(L.c[0] + L.d[0] * CAR_V * s, 0, L.c[1] + L.d[1] * CAR_V * s);
          c.g.rotation.y = Math.atan2(L.d[0], L.d[1]);
        });
      } else cars.forEach(({ c }) => (c.g.visible = false));
      solar.visible = shot.cam === 'solar' || shot.cam === 'rocket';
      turbines.forEach((tb) => (tb.hub.rotation.x = t * 1.1 + tb.ph));
      rocket.visible = smoke.visible = shot.cam === 'rocket';
      if (shot.cam !== 'traffic') { city.setShadowFocus(-12, 13, 14); city.setTime({}); cityFog.color.setHex(0xa9c8ec); cityFog.near = 250; cityFog.far = 1400; } // clean air: push the haze way back
      extras.forEach((e, i) => { const p = shot.cam === 'traffic' ? null : roofCrowd(t, e, i, shot.cam); if (p) { put(e, 'city', p); e.root.visible = true; } });
      if (shot.cam === 'rocket') {
        const lt = Math.max(0, t - 45.0), h = 0.5 * 9 * lt * lt + 2 * lt;
        rocket.position.set(ROCKET[0], h, ROCKET[2]);
        const ign = clamp((t - 44.8) / 0.4);
        flame.visible = flameCore.visible = ign > 0; flame.scale.set(1, 0.7 + 0.3 * ign + 0.08 * Math.sin(t * 40), 1);
        launchLight.position.set(ROCKET[0], h + 5, ROCKET[2] + 20); launchLight.intensity = 40 * ign;
        const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v3 = new THREE.Vector3();
        smokeSeeds.forEach((s, i) => {
          const birth = 44.8 + (i / SMOKE) * 5.2;               // puffs emitted along the climb
          if (t < birth) { m.makeScale(0, 0, 0); smoke.setMatrixAt(i, m); return; }
          const lb = Math.max(0, birth - 45.0), hy = 0.5 * 9 * lb * lb + 2 * lb, age = t - birth;
          v3.set(ROCKET[0] + (s[0] - 0.5) * (6 + age * 6), Math.max(2, hy - 6) + age * 1.5, ROCKET[2] + (s[1] - 0.5) * (6 + age * 6));
          const r = 4 + age * 5 + s[2] * 4; sc.set(r, r * 0.85, r);
          m.compose(v3, q.identity(), sc); smoke.setMatrixAt(i, m);
        });
        smoke.instanceMatrix.needsUpdate = true;
      } else launchLight.intensity = 0;
    } else if (S === 'bed') {
      put(gary, 'bed', garyPose(t)); gary.root.visible = true;
      bed.setSeason('summer', t); bed.lights.moon.intensity = 1.2;
      const hA = handWorld(gary, -1), hB = handWorld(gary, 1);
      const crumple = K(t, [[54.1, 0], [54.6, 1]]);
      const toss = K(t, [[55.05, 0], [55.6, 1]]);
      const mid = new THREE.Vector3().addVectors(hA, hB).multiplyScalar(0.5);
      const bedSpot = new THREE.Vector3(...off('bed', -0.25, 0.72, -1.45));
      const ball = mid.clone().lerp(bedSpot, toss); ball.y += Math.sin(PI * toss) * 0.35;
      sheet.visible = true; updateSheet(t, hA, hB, crumple, ball);
    }

    // camera (local → world)
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    let e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    if (c.ease === 'track') e = K(t, [[45.4, 0], [49.8, 1]]);
    const o = OFF[S];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    let Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (shot.cam === 'rocket') { const lt = Math.max(0, t - 45.0), h = 0.5 * 9 * lt * lt + 2 * lt; Aim = [ROCKET[0], Math.max(ROOF_Y + 20, h * 0.85 + 22), ROCKET[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
