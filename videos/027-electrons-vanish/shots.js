// VIDEO 027 — "What if every electron disappeared?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 65.2 s (cut3). SECOND 0 hits four places at the same instant (Tokyo 10 PM, Rio 10 AM, Chicago 8 AM, New York 9 AM — all 13:00 UTC),
// then one clock sweeps 20 decades (10 attoseconds → 8 min 17 s, HUD `ease: 'log'`, `timefmt`), one new scale per step:
// an atom → a Tokyo street → Paris → Earth from orbit → Earth + Moon → the Sun. Rewind to 9:59 PM for the human button.
// NEW: engine/nuclei.js (world-space noise dissolve for any material, a shader dot cloud that blows apart along surface
// normals, a planet-sized version, an atom lattice); core.js HUD `text`/`label`/`timefmt`/`ease:'log'` (additive).
//
// PHYSICS MODEL (stated so a reviewer can check every number; the premise itself breaks charge conservation — that's the
// "what if", not physics). Every electron in the universe vanishes at τ = 0. Classical electromagnetism + the light-speed limit:
//  • Instantly (τ = 0): everything electrons do stops. No current (screens, lamps, toasters), no light emitted or scattered by
//    matter (the blue sky is sunlight scattered by the electrons of air molecules → the daytime sky turns black, stars show;
//    sunlight already in flight keeps arriving), no chemistry (cooking, bonds, nerve signals). Atoms are bare nuclei, ~100,000×
//    smaller than the atoms were.
//  • Then the nuclei — all positive — repel. Two protons push 1.24 × 10³⁶ times harder than they pull by gravity. Inside a uniform
//    solid the pushes cancel; the net push starts at every SURFACE and the news travels inward at the speed of light (fields
//    propagate at c). Estimate for rock (charge density ≈ 1.3 × 10¹¹ C/m³): surface nuclei move one atom width (~2.4 Å) in
//    ~0.3 fs, ~9 nm by 1 fs, and reach ~light speed within ~3 fs. So our "explosion front" rule: a nucleus at depth h below the
//    nearest surface starts at τ = h/c and then moves outward at ≈ c → displacement = max(0, cτ − h)  (engine/nuclei.js).
//    At 1 ns that is 30 cm (people, phones, cars: gone), at 1 µs 300 m (the Eiffel Tower, the ground under it), at 1 ms 300 km
//    of planet, at 21.3 ms the front reaches Earth's centre (R/c) and the planet is a cloud twice its size (r = 2 r₀).
//  • Earth's front and the Moon's front (the Moon does the same) meet when R⊕ + R☾ + 2cτ = 384,400 km → τ = 0.63 s.
//    The Sun's last light leaves its surface at τ = 0 and reaches Earth's orbit after (1 AU − R☉)/c = 8 min 17 s; its debris,
//    moving at ≈ c, arrives right behind it (we draw it 1 % behind so you can see two fronts).
//  • Honest limit: the released energy (¾ kQ²/R ≈ 6.5 × 10⁶⁷ J for Earth, Q ≈ 2.8 × 10³² C) dwarfs Earth's gravitational binding
//    energy (2.5 × 10³² J) and even its mass-energy (5.4 × 10⁴¹ J), so general relativity would take over; nobody can say what the
//    cloud does after that. We show only the light-speed blast front, which no theory lets go faster.
//  • Stylization: bare nuclei barely touch visible light (a real camera would see only the Sun and the stars). We keep drawing
//    things lit so you can follow them, and draw nuclei as glowing dots.
//
// SOURCES (checked Oct 2026):
//   Feynman Lectures on Physics Vol. II §1-1 (two people at arm's length with 1 % extra electrons would repel with a force able to
//     lift a weight equal to the whole Earth's) — the scale of the electric force
//   F_e/F_g for two protons = ke²/(G m_p²) ≈ 1.24 × 10³⁶ (OpenStax College Physics; textbook constants)
//   nucleus ≈ 1/100,000 of the atom's diameter (standard; e.g. ScienceABC / Interesting Engineering summaries)
//   blue sky = Rayleigh scattering by air molecules (Royal Museums Greenwich "Why is the sky blue?"; Feynman Vol. I ch. 32: it is
//     the molecules' electrons that re-radiate the light)
//   fastest myelinated axons ≈ 120 m/s (BioNumbers 110607, Swadlow & Waxman; Purves, Neuroscience, NCBI NBK10921)
//   toaster ≈ 1,200 W (typical 800–1,500 W household toaster)
//   sunlight takes ~8 min 20 s centre-to-centre (Smithsonian "Ask an Explainer"); from the Sun's surface (R☉ 696,000 km): 8 min 17 s
//   Earth–Moon 384,400 km (NASA); light ≈ 1.28 s. Earth mass 5.972 × 10²⁴ kg, R 6,371 km (NASA fact sheet)
//   Earth gravitational binding energy 2.49 × 10³² J (PREM; Wikipedia "Gravitational binding energy")
//   electrons in the observable universe ≈ 10⁸⁰ (the usual estimate of atoms; the universe is electrically neutral)
//
// TRIBE (tribe-cut1..3.txt): cut1 0.0416 / first 60 s 0.0398, no dead zone (weak: the dark frozen Tokyo, the pool tilt to an
// empty black sky, the atom slab, Earth from orbit 0.026). cut2 tightened those beats (−2.8 s) + push-ins: they rose (orbit
// 0.037, shell 0.040) but the UNTOUCHED Moon/Sun/rewind beats fell 0.07 → 0.03–0.05 in their new time slots → 0.0392.
// cut3 = cut1's timeline + audio again, with only visual fixes (orbit push-in, atom dolly, pool kept on faces + the Sun in
// frame, brighter frozen Tokyo, four more faces walking behind the friends) → 0.0441 / first 60 s 0.0430 (BEATS), no dead zone:
// 0.0006 under the whole-brain target. SHIPPED cut3 (best of three; the brief allows three cuts).
//
// Shot list (seconds)                     | set    | what happens
//  0.0– 3.4 title   Tokyo 10 PM           | city   | high over the scramble crossing: neon, screens, a crowd crossing
//  3.4–11.4 tokyo   SECOND 0 at 7.4       | city   | walking backward ahead of three friends lit by their phones; 7.4: every light dies, they freeze;
//                                         |        | the camera keeps moving (bullet-time orbit)
// 11.4–15.2 pool    Rio 10 AM             | pool   | a kid mid-cannonball; the switch at 11.95: the sky turns black, stars come out, the camera tilts up
// 15.2–19.0 kitchen Chicago 8 AM          | kit    | toast pops, the dog leaps; 15.75: the toaster's glow dies, everything freezes
// 19.0–22.8 class   New York 9 AM         | cls    | a teacher explaining electrons; 19.6: she freezes mid-word (bubble cut off), the lights die
// 22.8–26.8 atoms   10 as → 1 fs          | atoms  | a slab of atoms: the electron clouds vanish, the bare nuclei start to shove apart
// 26.8–31.8 dust    1 fs → 1 ns           | city   | back to the frozen friends: every surface peels into glowing dots (30 cm by 1 ns)
// 31.8–36.4 paris   1 ns → 1 µs           | paris  | black sky over the Champ de Mars; the tower and 300 m of ground blow apart
// 36.4–41.0 orbit   1 µs → 1 ms           | space  | Earth from 40,000 km: the top 300 km lifts off as a glowing haze
// 41.0–45.4 shell   1 → 21 ms             | space  | the front reaches the core: a cloud twice Earth's size
// 45.4–49.6 moon    21 ms → 0.63 s        | space  | Earth's bubble and the Moon's bubble grow and touch
// 49.6–54.8 sun     0.63 s → 8 min 17 s   | solar  | the Sun's light front + debris reach Earth's orbit
// 54.8–61.0 rewind  9:59 PM               | city   | the friends again, alive: a hug. Fade 60.4, end card 61.0
import * as THREE from 'three';
import { K, clamp, lerp, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { makePhone, makeDog, makeMug, makeSpeechBubble } from '@engine/props.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildParis } from '@engine/sets/paris.js';
import { buildSpace } from '@engine/sets/tech.js';
import { patchDissolve, makeNucleiCloud, makeAtomLattice } from '@engine/nuclei.js';

const PI = Math.PI, G = 9.81, C = 299792458, SW = 7.4;
// (TP/TK/TC — the same instant replayed in Rio / Chicago / New York — are set from SHOTS below)
const UNIT = 6371e3 / 400;                               // space set: 1 unit = 15.93 km (Earth R = 400)
const MOON_D = 384400e3 / UNIT, MOON_R = 1737e3 / UNIT;
const SOL = 1e8, RSUN = 6.96e8 / SOL, AU = 1.496e11 / SOL;  // solar set: 1 unit = 100,000 km
const OFF = { city: [0, 0, 0], cls: [3000, 0, 0], kit: [6000, 0, 0], pool: [9000, 0, 0], paris: [12000, 0, 0], atoms: [15000, 0, 0], space: [40000, 0, 0], solar: [0, 0, 600000] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'title', set: 'city' },
  { t0: 3.4, t1: 11.4, cam: 'tokyo', set: 'city' },
  { t0: 11.4, t1: 15.2, cam: 'pool', set: 'pool' },
  { t0: 15.2, t1: 19.0, cam: 'kitchen', set: 'kit' },
  { t0: 19.0, t1: 22.8, cam: 'class', set: 'cls' },
  { t0: 22.8, t1: 26.8, cam: 'atoms', set: 'atoms' },
  { t0: 26.8, t1: 31.8, cam: 'dust', set: 'city' },
  { t0: 31.8, t1: 36.4, cam: 'paris', set: 'paris' },
  { t0: 36.4, t1: 41.0, cam: 'orbit', set: 'space' },
  { t0: 41.0, t1: 45.4, cam: 'shell', set: 'space' },
  { t0: 45.4, t1: 49.6, cam: 'moon', set: 'space' },
  { t0: 49.6, t1: 54.8, cam: 'sun', set: 'solar' },
  { t0: 54.8, t1: 65.2, cam: 'rewind', set: 'city' },
];
const S0 = Object.fromEntries(SHOTS.map((s) => [s.cam, s.t0])), S1 = Object.fromEntries(SHOTS.map((s) => [s.cam, s.t1]));
const TP = S0.pool + 0.55, TK = S0.kitchen + 0.55, TC = S0.class + 0.6;
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased); fov; amp = handheld drift. Several shots override P/Aim.
export const CAMS = {
  title:   { p: [[3.2, 5.2, 6.5], [2.6, 4.2, 4.8]], a: [[0.2, 1.4, -9], [0.6, 1.4, -8]], fov: 52, amp: 0.01 },
  tokyo:   { p: [[1, 1.55, 0], [1, 1.55, 0]], a: [[1, 1.5, -1], [1, 1.5, -1]], fov: 50, amp: 0.004 },
  pool:    { p: [[5.4, 1.15, 8.3], [4.9, 0.95, 7.7]], a: [[1.95, 1.85, 5.6], [1.55, 2.3, 4.9]], fov: 52, amp: 0.004 },
  kitchen: { p: [[-0.75, 1.32, 1.55], [0.35, 1.38, 1.7]], a: [[0.5, 0.98, -0.4], [0.55, 1.0, -0.4]], fov: 50, amp: 0.003 },
  class:   { p: [[1.05, 1.5, 1.0], [0.85, 1.52, 0.7]], a: [[1.2, 1.78, -2.6], [1.18, 1.78, -2.6]], fov: 52, amp: 0.003 },
  atoms:   { p: [[-6.0, 3.2, 9.5], [3.2, 1.5, 4.6]], a: [[0, -0.6, -1.5], [0.6, 0.6, -1.5]], fov: 50, amp: 0.002 },
  dust:    { p: [[1, 1.55, 0], [1, 1.55, 0]], a: [[1, 1.5, -1], [1, 1.5, -1]], fov: 50, amp: 0.004 },
  paris:   { p: [[2, 1.6, 52], [6, 14, 118]], a: [[0, 26, 0], [0, 40, 0]], fov: 54, amp: 0.006 },
  orbit:   { p: [[600, 1100, 4300], [1650, 360, 1150]], a: [[0, 0, 0], [0, 0, 0]], fov: 40, amp: 0 },
  shell:   { p: [[1650, 360, 1150], [4300, 800, 2300]], a: [[0, 0, 0], [0, 0, 0]], fov: 40, amp: 0 },
  moon:    { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 50, amp: 0 },
  sun:     { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 50, amp: 0 },
  rewind:  { p: [[3.35, 1.56, -7.75], [3.0, 1.52, -8.15]], a: [[1.5, 1.48, -8.75], [1.5, 1.48, -8.8]], fov: 46, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (CLAUDE.md: sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const PHONE_B = A(-1.4, 0.15, -1.35, -0.45);                 // phone held up in front of the face (screen toward the eyes)
const SELFIE_B = A(-1.95, 0.55, -0.35, -0.3);
const PHONE_LOW = A(-0.85, 0.12, -1.65, -0.5);               // phone at chest height, reading                // arm out + up: selfie
const POINT_A = A(-1.7, 0.6, -0.2, 0.2);                     // pointing at the board
const HAND_UP_B = A(-2.9, 0.25, -0.35, -0.2);                // "me! me!"
const THROW_B = A(-2.2, 0.35, -0.5, -0.2);
const MUG_B = A(-0.75, 0.75, -1.45, -0.25);
const REACH_A = A(-1.2, 0.2, -0.35, 0.25);
const HUG_A = A(-1.25, 0.55, -1.25, 0.55), HUG_B = A(-1.25, 0.55, -1.25, -0.55);
const LAUGH_A = A(-0.3, 0.25, -1.6, 0.6);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f, 0xeec1a0];
const HAIRS = [0x2a1d16, 0x1a1a1a, 0x5a3a24, 0x9a6a3a, 0x1a1a1a, 0x2a1d16, 0xd9b46a];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob'];
const CASUAL = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2, 0x2f3a4a];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x1d2a3a];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  studio.renderer.localClippingEnabled = true;
  // physics time τ (seconds) from the HUD's log segments — the SAME numbers the HUD shows
  const LOG = story.hud.filter((h) => h.ease === 'log');
  const tauAt = (t) => { const s = LOG.find((h) => t >= h.r0 && t < h.r1) || (t >= LOG[LOG.length - 1].r1 && t < S0.rewind ? LOG[LOG.length - 1] : null); if (!s) return 0; const u = clamp((t - s.r0) / (s.r1 - s.r0)); return s.from * Math.pow(s.to / s.from, u); };

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const city = buildCity(studio, {}); city.setTime({ day: 0, golden: 0, milky: 0, moon: 1 }); city.setPower(1);
  const cityFog = scene.fog; city.setShadowFocus(1, -4, 22);
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls); cls.setClock(9, 0); cls.setSeason('autumn', 0); cls.setDoor(0);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(8, 0);
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const paris = buildParis(studio, {}); paris.root.position.set(...OFF.paris);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const atoms = new THREE.Group(); atoms.position.set(...OFF.atoms); scene.add(atoms);
  const solar = new THREE.Group(); solar.position.set(...OFF.solar); scene.add(solar);
  const ROOTS = { city: city.root, cls: cls.root, kit: kit.root, pool: pool.root, paris: paris.root, atoms, space: space.root, solar };
  const FOGS = { city: cityFog, cls: null, kit: null, pool: pool.fog, paris: paris.fog, atoms: new THREE.Fog(0x050a1c, 7, 24), space: null, solar: null };
  const FAR = { city: 1500, cls: 40, kit: 40, pool: 300, paris: 1300, atoms: 60, space: 200000, solar: 40000 };
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const R = rng(27), pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o, parent = scene) => { const p = makePerson(o); parent.add(p.root); all.push(p); p.root.visible = false; return p; };
  /** pose a rig: (x,z) local to the set; y = root height; floor = ground under the feet (local) */
  function put(rig, key, p, y = 0, floor = 0) { p.x += OFF[key][0]; p.z += OFF[key][2]; p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1]; applyPose(rig, p); rig.root.visible = true; }

  // ---------------------------------------------------------------- shared: a star field that follows the camera, a sun disc
  const dotTex = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const stars = (() => { const S = rng(9), n = 2600, a = []; for (let i = 0; i < n; i++) { const u = S() * 2 - 1, f = S() * PI * 2, s = Math.sqrt(1 - u * u); a.push(Math.cos(f) * s, u, Math.sin(f) * s); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 3.6, map: dotTex, transparent: true, depthWrite: false, color: 0xe8eeff, fog: false, sizeAttenuation: false, toneMapped: false })); p.frustumCulled = false; p.renderOrder = -5; scene.add(p); return p; })();
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(0xfff6e6).multiplyScalar(4), toneMapped: false, depthWrite: false, fog: false })); scene.add(sunDisc);
  /** the daytime sky of a set fades to black (no electrons = no scattering): every big BackSide sky dome + its cloud sprites */
  const skyParts = (root) => { const L = [], col = new Map(); root.traverse((o) => { const m = o.material; if (!m) return; if ((o.isMesh && m.isMeshBasicMaterial && m.fog === false) || (o.isSprite && m.map && m.fog === false)) { if (!col.has(m)) col.set(m, m.color.clone()); L.push({ o, c: col.get(m) }); } }); return L; };
  const SKY = { pool: skyParts(pool.root), paris: skyParts(paris.root) };
  const blackSky = (key, k) => { for (const { o, c } of SKY[key]) { o.material.color.copy(c).multiplyScalar(1 - 0.985 * k); if (o.material.side !== THREE.BackSide) { o.material.transparent = true; o.material.depthWrite = false; o.material.opacity = 1 - k; o.visible = k < 0.99; } } };   // clouds fade out (dark blobs read as a night sky)

  // ---------------------------------------------------------------- dissolve controls (engine/nuclei.js)
  const UD = {};
  const cloud = makeNucleiCloud(scene, { max: 260000, seed: 27 });          // Tokyo + Paris: one cloud, groups per source

  // ================================================================ TOKYO (city.js at the origin)
  // neon blade signs (faces toward +z, the camera), two big screens, coloured neon light
  const signMats = [];
  const blade = (text, bg, fg, x, y, z, h = 3.4) => {
    const tex = canvasTex(128, 512, (g, w, hh) => { g.fillStyle = bg; g.fillRect(0, 0, w, hh); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, hh - 16); g.fillStyle = fg; g.font = 'bold 74px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const L = text.split(''); L.forEach((ch, i) => g.fillText(ch, w / 2, 30 + (i + 0.5) * ((hh - 60) / L.length))); });
    const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide }); signMats.push(m);
    const s = mk(new THREE.PlaneGeometry(0.9, h), m, city.root, x, y, z); s.castShadow = false; return s;
  };
  [['RAMEN', '#d8204f', '#fff3d6', 6.2, 5.2, -13], ['KARAOKE', '#18a8d8', '#ffffff', -6.2, 6.0, -15], ['SUSHI', '#f2b632', '#5a1a10', 6.2, 5.6, -19], ['GAMES', '#7b3fd0', '#ffe14d', -6.2, 5.4, -22],
   ['CAFE', '#14b37a', '#ffffff', 6.2, 5.0, -26], ['24H', '#ff5a1f', '#ffffff', -6.2, 4.8, -27], ['BAR', '#e0218a', '#fff', 6.2, 4.6, 4.2], ['HOTEL', '#2050d8', '#fff', -6.2, 5.8, 3.0]]
    .forEach(([t, b, f, x, y, z]) => blade(t, b, f, x, y, z, t.length > 5 ? 4.0 : 3.2));
  const screenTex = (hue) => canvasTex(512, 300, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, `hsl(${hue},90%,55%)`); gr.addColorStop(1, `hsl(${hue + 60},90%,45%)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(w * 0.3, h * 0.5, 80, 0, 7); g.fill(); g.fillStyle = `hsl(${hue + 180},90%,60%)`; g.beginPath(); g.arc(w * 0.3, h * 0.5, 52, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.fillText('NEW', w * 0.55, h * 0.45); g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.fillText('TONIGHT ONLY', w * 0.55, h * 0.68); });
  for (const [x, y, z, w, h, hue] of [[13, 10, -10.4, 9, 5.2, 320], [-13.5, 11.5, -10.4, 8, 4.6, 190], [16, 22, -10.4, 6, 3.5, 40]]) { const m = new THREE.MeshBasicMaterial({ map: screenTex(hue), toneMapped: false }); signMats.push(m); mk(new THREE.PlaneGeometry(w, h), m, city.root, x, y, z).castShadow = false; }
  const neon = [[0xff4fa0, 5.2, 4.2, 2], [0x4fd8ff, -5.2, 4.6, -6], [0xffb04f, 5.2, 4.4, -16], [0xa05cff, -5.2, 4.4, -20]].map(([c, x, y, z]) => { const L = new THREE.PointLight(c, 7, 16, 1.7); L.position.set(x, y, z); city.root.add(L); return L; });
  const cars = [[2, -14.5, 0xf2c14e], [-2, 5.5, 0xe9e6e0], [2, -21, 0x2a2d31]].map(([x, z, c], i) => { const car = makeCar(c, i + 4); car.g.position.set(x, 0, z); car.g.rotation.y = x > 0 ? 0 : PI; city.root.add(car.g); car.setLights(1); return car; });
  UD.city = patchDissolve(city.root, { uGlow: { value: new THREE.Color(0x0c1420) }, uFreq: { value: 6.0 }, uEdge: { value: 0.03 } });   // after the signs + cars joined it
  // the crowd: three friends (heroes) walking toward the camera + a scramble crossing
  const girl = person({ skin: 0xf1c3a1, top: 0xe58fa6, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob' });
  const boy = person({ skin: 0xe2ad8c, top: 0x2f3a4a, collar: 0xf2c14e, pants: 0x45607a, hair: 0x2a1d16, hairStyle: 'messy', glasses: true });
  const pal = person({ skin: 0xd9a37f, top: 0xf2c14e, pants: 0x3a3d42, hair: 0x1a1a1a, hairStyle: 'short' });
  const yuki = person({ skin: 0xf3d0b5, top: 0x4fb3a8, collar: 0xffffff, pants: 0x6b5a48, hair: 0x5a3a24, hairStyle: 'bob' });
  const heroes = [girl, boy, pal];
  const COMP = [[-1.3, -2.2], [2.5, -1.8], [2.9, -3.6], [-0.6, -3.9]];   // 027 cut3: faces behind the friends (TRIBE: faces + motion)
  const comps = COMP.map((_, i) => person({ skin: [0xc98e6a, 0xf1c3a1, 0x9a6447, 0xe2ad8c][i], top: [0x3d7bd9, 0xe08a3a, 0x6fa84f, 0x8f6fb8][i], pants: PANTS[i], hair: HAIRS[i], hairStyle: ['short', 'bob', 'messy', 'bob'][i], glasses: i === 2 }));
  const phones = [];
  const givePhone = (rig, side = 1) => { const ph = makePhone(); rig.arms.find((a) => a.s === side).hand.add(ph.g); ph.g.position.set(0, -0.06, 0.03); ph.g.rotation.set(PI / 2, 0, 0); ph.g.scale.setScalar(1.25); phones.push(ph); return ph; };
  givePhone(girl); givePhone(boy); comps.forEach((c, i) => { if (i % 2 === 0) givePhone(c); });
  const faceLights = [girl, boy].map(() => { const L = new THREE.PointLight(0x9fc4ff, 0.12, 0.9, 2); scene.add(L); return L; });
  const crowd = Array.from({ length: 22 }, (_, i) => { const st = pick(STYLES); const p = person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: st, glasses: R() < 0.25 }); if (i % 3 === 0) givePhone(p); return p; });
  const CR = rng(31);
  const HZ0 = -9.5, HV = 1.25;            // heroes: start z, speed (m/s) along +z
  const heroAt = (tt) => HZ0 + HV * tt;   // girl's z at real time tt
  // straight lines across the scramble; a path is re-drawn if it ever crosses the lens corridor (between the camera and the
  // friends while it walks backward ahead of them, the frozen orbit, and the rewind hug) — 027 v1 had a walker wipe the frame
  const wAt = (w, tt) => { const s = ((tt + w.ph) * w.v) % w.L; return [w.x0 + Math.sin(w.a) * s, w.z0 + Math.cos(w.a) * s]; };
  const inLens = (w) => {
    for (let tt = 2.8; tt <= SW; tt += 0.1) { const [x, z] = wAt(w, tt), hz = heroAt(tt); if (x > -0.2 && x < 3.0 && z > hz - 0.6 && z < hz + 3.2) return true; }
    { const [x, z] = wAt(w, SW), hz = heroAt(SW); if (x > -1.6 && x < 4.4 && z > hz - 1.2 && z < hz + 4.4) return true; }
    for (let u = 0; u <= 6.5; u += 0.1) { const [x, z] = wAt(w, 0.8 + u); if (x > 1.0 && x < 4.0 && z > -9.6 && z < -6.6) return true; }
    return false;
  };
  const walks = crowd.map((_, i) => {
    for (;;) {
      const a = CR() * PI * 2, cx = (CR() - 0.5) * 9, cz = -3 - CR() * 12, L = 6 + CR() * 6;
      const w = { x0: cx - Math.sin(a) * L / 2, z0: cz - Math.cos(a) * L / 2, a, L, v: 1.0 + CR() * 0.5, ph: CR() * 4, phone: i % 3 === 0 };
      if (!inLens(w)) return w;
    }
  });
  function tokyoScene(t, live) {   // live = real time of the street (frozen at SW unless rewinding)
    const tt = live;
    walks.forEach((w, i) => {
      const s = ((tt + w.ph) * w.v) % w.L, x = w.x0 + Math.sin(w.a) * s, z = w.z0 + Math.cos(w.a) * s;
      const p = basePose(); p.eyes = blink(tt, i + 7); Object.assign(p, { x, z, rotY: w.a, dist: s + w.ph * 3, speed: w.v });
      if (w.phone) { p.armB = PHONE_B; p.headPitch = 0.35; }
      put(crowd[i], 'city', p, 0, 0);
    });
    // heroes: the girl films a selfie of the three of them, the boy reads his phone, their pal laughs
    const z = heroAt(Math.min(tt, 20)), d = (Math.min(tt, 20) - 0) * HV;
    const pg = basePose(); pg.eyes = blink(tt, 1); Object.assign(pg, { x: 1.0, z, rotY: 0.08, dist: d, speed: HV, headYaw: 0.35, headPitch: -0.12, mouth: 'smile' }); pg.armB = SELFIE_B;
    const pb = basePose(); pb.eyes = blink(tt, 2); Object.assign(pb, { x: 1.62, z: z - 0.35, rotY: -0.06, dist: d + 0.4, speed: HV, headPitch: 0.42 }); pb.armB = PHONE_LOW; pb.armA = A(-0.6, 0.1, -1.0, 0.4); pb.headPitch = 0.5;
    const pp = basePose(); pp.eyes = blink(tt, 3); Object.assign(pp, { x: 0.38, z: z - 0.25, rotY: 0.2, dist: d + 0.8, speed: HV, headYaw: -0.2, headPitch: -0.15, mouth: 'o' }); pp.armA = LAUGH_A; pp.armB = REST;
    put(girl, 'city', pg); put(boy, 'city', pb); put(pal, 'city', pp);
    comps.forEach((c, i) => { const q = basePose(); q.eyes = blink(tt, 60 + i); Object.assign(q, { x: 1.0 + COMP[i][0], z: z + COMP[i][1], rotY: 0.05 * (i - 1.5), dist: d + i * 0.3, speed: HV, headPitch: i % 2 === 0 ? 0.35 : -0.05, headYaw: i % 2 ? 0.3 : 0, mouth: i === 1 ? 'o' : 'smile' }); if (i % 2 === 0) q.armB = PHONE_LOW; put(c, 'city', q); });
  }
  function tokyoRewind(t) {   // 9:59 PM: the scramble is alive again; Yuki runs up and hugs the girl at the far corner
    const u = t - S0.rewind, tt = 0.8 + u;
    walks.forEach((w, i) => { const s = ((tt + w.ph) * w.v) % w.L; const p = basePose(); p.eyes = blink(tt, i + 7); Object.assign(p, { x: w.x0 + Math.sin(w.a) * s, z: w.z0 + Math.cos(w.a) * s, rotY: w.a, dist: s + w.ph * 3, speed: w.v }); if (w.phone) { p.armB = PHONE_B; p.headPitch = 0.35; } put(crowd[i], 'city', p); });
    const hug = sstep(0.9, 1.5, u), sway = 0.05 * Math.sin(u * 2.4) * hug;
    const gx = 1.4, gz = -8.6;
    const pg = basePose(); pg.eyes = hug > 0.5 ? 'closed' : blink(tt, 1); Object.assign(pg, { x: gx, z: gz, rotY: PI / 2 + sway, headYaw: -0.25 * hug, headRoll: 0.12 * hug, mouth: 'smile', lean: 0.08 * hug });
    pg.armA = mixArm(REST, HUG_A, hug); pg.armB = mixArm(SELFIE_B, HUG_B, hug);
    const yx = lerp(4.6, gx + 0.42, sstep(0, 1.05, u)), walking = u < 1.05;
    const py = basePose(); py.eyes = hug > 0.5 ? 'closed' : blink(tt, 4); Object.assign(py, { x: yx, z: gz - 0.2, rotY: -PI / 2 + sway, dist: yx * -2.2, speed: walking ? 2.2 : 0, headYaw: 0.3 * hug, headRoll: -0.12 * hug, mouth: 'smile', lean: 0.08 * hug });
    py.armA = mixArm(REST, HUG_A, hug); py.armB = mixArm(REST, HUG_B, hug);
    put(girl, 'city', pg); put(yuki, 'city', py);
    const pb = basePose(); pb.eyes = blink(tt, 2); Object.assign(pb, { x: gx - 0.35, z: gz - 0.95, rotY: 1.1, headPitch: 0.3, mouth: 'smile' }); pb.armB = PHONE_B; put(boy, 'city', pb);
    const pp = basePose(); pp.eyes = blink(tt, 3); Object.assign(pp, { x: gx + 0.95, z: gz - 1.1, rotY: 0.9, headPitch: -0.1, mouth: 'o' }); pp.armA = LAUGH_A; pp.armB = A(-2.4, 0.5, -0.4, -0.2); put(pal, 'city', pp);
  }
  /** lights on (1) / off (0): windows, shops, lamps, signs, screens, phones, headlights */
  let curPow = -1;
  function power(k) {
    if (k === curPow) return; curPow = k;
    city.setPower(k);
    signMats.forEach((m) => m.color.setScalar(lerp(0.035, 1.25, k)));
    neon.forEach((L) => (L.intensity = 7 * k)); cars.forEach((c) => c.setLights(k));
    phones.forEach((ph) => { ph.screenMat.emissiveIntensity = 0.8 * k; });
  }

  // ================================================================ POOL (Rio 10 AM)
  const kid = person({ skin: 0xc98e6a, top: 0xc98e6a, pants: 0xf2b632, hair: 0x1a1a1a, hairStyle: 'messy', headR: 0.17 });
  const swimmers = [0, 1, 2, 3].map((k) => person({ skin: pick(SKINS), top: pick(SKINS), pants: pick([0xd2483f, 0x2f5fb3, 0x1a1a1a]), hair: pick(HAIRS), hairStyle: k % 2 ? 'bob' : 'short' }));
  const bathers = [0, 1].map((k) => person({ skin: pick(SKINS), top: [0xe58fa6, 0x4f9bd9][k], pants: [0xe58fa6, 0x2f3a4a][k], hair: pick(HAIRS), hairStyle: k ? 'short' : 'bob', glasses: true }));
  const guard = person({ skin: 0x9a6447, top: 0xd2483f, pants: 0xd2483f, hair: 0x1a1a1a, hairStyle: 'short' });
  const blobGeo = new THREE.SphereGeometry(1, 14, 10);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x9fd8f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x1a4a66, emissiveIntensity: 0.35 });
  const BR = rng(41), splash = Array.from({ length: 46 }, (_, i) => { const a = BR() * PI * 2, r = 0.2 + BR() * 0.7; return { x: -0.6 + Math.cos(a) * r, z: 3.2 + Math.sin(a) * r * 0.6, vy: 1.2 + BR() * 2.8, vr: 0.6 + BR() * 1.2, a, s: 0.025 + BR() * 0.05 }; });
  const blobs = new THREE.InstancedMesh(blobGeo, waterM, splash.length); blobs.frustumCulled = false; pool.root.add(blobs);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3();
  function poolScene(t) {
    const tt = Math.min(t, TP), u = tt - S0.pool;   // live for 0.55 s, then frozen
    pool.update(10 + tt);
    // the splash of a swimmer who just slapped the water: blobs flying up (frozen at TP)
    const age = 0.25 + u;
    splash.forEach((b, i) => { const y = PD.water + b.vy * age - 0.5 * G * age * age, r = b.vr * age; V3.set(-0.6 + Math.cos(b.a) * (0.2 + r), Math.max(PD.water, y), 3.2 + Math.sin(b.a) * (0.2 + r) * 0.6); S3.setScalar(b.s); M4.compose(V3, Q4, S3); blobs.setMatrixAt(i, M4); });
    blobs.instanceMatrix.needsUpdate = true;
    // the cannonball: leaves the deck at 11.55 (feet at y 0), freezes near the top of the arc
    const tj = Math.max(0, tt - (S0.pool + 0.15)), ky = 3.3 * tj - 0.5 * G * tj * tj, kz = 6.2 - 1.6 * tj;
    const pk = basePose(); pk.eyes = 'closed'; Object.assign(pk, { x: 1.8, z: kz, rotY: 0.95, crouch: 0.3, lean: 0.5, footFwd: 0.35, mouth: 'o', headPitch: -0.2 }); pk.armA = A(-1.2, 0.2, -2.0, 0.6); pk.armB = A(-1.2, 0.2, -2.0, -0.6);
    put(kid, 'pool', pk, 0.35 + ky, ky + 0.75);
    swimmers.forEach((s, i) => { const p = basePose(); p.eyes = blink(tt, i + 20); const [x, z] = [[-0.6, 3.0], [3.1, 3.7], [-0.1, 4.6], [-3.2, 1.8]][i]; Object.assign(p, { x, z, rotY: [0.4, 0.45, 0.9, 0.9][i], mouth: i === 0 ? 'o' : 'smile', headPitch: -0.15 }); p.armA = i === 0 ? A(-2.2, 0.8, -0.4, 0) : A(-0.6, 0.9, -0.3, 0); p.armB = i === 0 ? A(-2.2, 0.8, -0.4, 0) : A(-0.6, 0.9, -0.3, 0); put(s, 'pool', p, PD.water - 1.42, PD.water - 1.42); });
    bathers.forEach((s, i) => { const p = basePose(); p.eyes = blink(tt, i + 30); Object.assign(p, { x: [-0.4, 2.8][i], z: 8.2, rotY: PI, footFwd: 0.42, headPitch: -0.25, mouth: i ? 'o' : 'smile' }); p.armA = A(-0.3, 0.2, -0.5, 0.3); p.armB = i ? A(-1.6, 0.3, -1.4, -0.4) : A(-0.3, 0.2, -0.5, -0.3); put(s, 'pool', p, -0.0, 0); });
    { const p = basePose(); p.eyes = blink(tt, 40); Object.assign(p, { x: PD.tower[0], z: PD.tower[1] - 0.05, rotY: PI, footFwd: 0.42, headPitch: 0.1 }); p.armB = A(-1.3, 0.2, -1.9, -0.6); put(guard, 'pool', p, 2.04 - 0.375, 2.04); }
    const k = sstep(TP, TP + 0.35, t);
    blackSky('pool', k); pool.lights.hemi.intensity = lerp(1.0, 0.18, k);
    return k;
  }

  // ================================================================ KITCHEN (Chicago 8 AM)
  kit.chairs[3].visible = false;
  const [TX, TZ] = KD.table, TOP = KD.tableTop;
  const dad = person({ skin: 0xe2ad8c, top: 0x7a5aa8, collar: 0xf2e6cf, pants: 0x45607a, shoes: 0x8a6a48, hair: 0x5a3a24, hairStyle: 'messy', mustache: 0x4a2e1c });
  const mom = person({ skin: 0x9a6447, top: 0x4fb3a8, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const mug = makeMug(0xf2f2f2); dad.arms.find((a) => a.s === 1).hand.add(mug.g ?? mug); (mug.g ?? mug).position.set(0, -0.08, 0.04);
  const toaster = new THREE.Group(); toaster.position.set(TX + 0.12, TOP, TZ - 0.02); kit.root.add(toaster);
  mk(new THREE.BoxGeometry(0.3, 0.19, 0.17), mat(0xd8dce0, 0.25, { metalness: 0.6 }), toaster, 0, 0.095, 0);
  mk(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat(0x222222, 0.5), toaster, 0.16, 0.06, 0);
  const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.42, 0.12).multiplyScalar(2.2), toneMapped: false });
  for (const x of [-0.055, 0.055]) { mk(new THREE.BoxGeometry(0.036, 0.012, 0.13), mat(0x1a1a1a, 0.6), toaster, x, 0.19, 0); mk(new THREE.BoxGeometry(0.03, 0.004, 0.12), glowM, toaster, x, 0.197, 0); }
  const coilL = new THREE.PointLight(0xff7a30, 0.8, 1.2, 2); coilL.position.set(TX + 0.12, TOP + 0.32, TZ - 0.02); kit.root.add(coilL);
  const toast = [-0.055, 0.055].map(() => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.02, 0.12, 0.11), mat(0xb9772f, 0.9), g, 0, 0, 0); mk(new THREE.BoxGeometry(0.022, 0.11, 0.1), mat(0xe4b46a, 0.9), g, 0, 0, 0); kit.root.add(g); return g; });
  for (const [x, z, c] of [[-0.25, 0.05, 0xf2b632], [0.55, 0.15, 0xffffff]]) { const g = mk(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 14), new THREE.MeshStandardMaterial({ color: c, roughness: 0.1, transparent: true, opacity: 0.85 }), kit.root, TX + x, TOP + 0.055, TZ + z); g.castShadow = false; }
  mk(new THREE.CylinderGeometry(0.12, 0.11, 0.02, 24), mat(0xf4f1ea, 0.4), kit.root, TX - 0.2, TOP + 0.01, TZ - 0.25);
  const dog = makeDog(); kit.root.add(dog.g);
  const shadeM = []; kit.root.traverse((o) => { if (o.isMesh && o.material?.emissiveIntensity > 0.3 && o.material.emissive?.getHex() === 0xffc070) shadeM.push(o.material); });
  const kitView = []; kit.root.traverse((o) => { if (o.isMesh && o.material?.isMeshBasicMaterial && o.material.map && o.position.z < KD.room.z0 - 0.5) kitView.push({ o, c: o.material.color.clone() }); });
  function kitchen(t) {
    const tt = Math.min(t, TK);
    const pd = basePose(); pd.eyes = 'open'; Object.assign(pd, { x: TX - 0.12, z: TZ - 0.72, rotY: 0.15, footFwd: 0.42, headPitch: 0.15 - 0.3 * sstep(TK - 0.35, TK - 0.1, tt), headYaw: 0.25, mouth: 'o' }); pd.armB = MUG_B; pd.armA = A(-0.75, 0.15, -1.2, 0.5);
    put(dad, 'kit', pd, -0.325, 0);
    const pm = basePose(); pm.eyes = blink(tt, 5); Object.assign(pm, { x: TX + 0.75, z: TZ - 0.3, rotY: -PI / 2 - 0.25, headPitch: 0.05, mouth: 'smile' }); pm.armB = REACH_A; pm.armA = A(-0.2, 0.15, -1.7, -0.6);
    put(mom, 'kit', pm);
    // toast pops 0.32 s before the switch (1.55 m/s) and freezes in the air
    toast.forEach((g, i) => { const tp = Math.max(0, tt - (TK - 0.26) - i * 0.03), y = 0.2 + 2.0 * tp - 0.5 * G * tp * tp; g.position.set(TX + 0.12 + [-0.055, 0.055][i] + i * 0.02 * tp, TOP + Math.max(0.2, y), TZ - 0.02); g.rotation.set(0.6 * tp, 0, (i ? -0.5 : 0.4) * tp); });
    // the dog leaps for the toast (from 0.45 s before the switch)
    const dj = clamp((tt - (TK - 0.45)) / 0.45), dy = 0.42 * Math.sin(dj * PI * 0.62);
    dog.g.position.set(TX + 0.55, dy, TZ + 0.55); dog.g.rotation.set(-0.55 * dj, -2.4, 0); dog.update(tt, dj > 0 ? 0 : 0.2); dog.bark(dj); dog.g.visible = true;
    const k = sstep(TK, TK + 0.08, t);
    glowM.color.setRGB(1.0, 0.42, 0.12).multiplyScalar(lerp(2.2, 0.0, k)); coilL.intensity = 0.8 * (1 - k);
    kit.lights.pend.intensity = 3.5 * (1 - k); shadeM.forEach((m) => (m.emissiveIntensity = 0.4 * (1 - k))); kit.lights.hemi.intensity = lerp(1.1, 0.35, k);
    kitView.forEach(({ o, c }) => o.material.color.copy(c).multiplyScalar(1 - 0.9 * k));
  }

  // ================================================================ CLASSROOM (New York 9 AM)
  cls.setBoard('');
  const teacher = person({ skin: 0x9a6447, top: 0xd2483f, collar: 0xf4f4f2, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const boardT = canvasTex(640, 640, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(245,245,235,.92)'; g.fillStyle = 'rgba(245,245,235,.92)'; g.lineWidth = 9; g.textAlign = 'center'; g.textBaseline = 'middle';
    const cx = 320, cy = 400, E = [[230, 70, 0.4], [230, 70, -0.6], [230, 70, 1.55]];
    for (const [rx, ry, r] of E) { g.beginPath(); g.ellipse(cx, cy, rx * 0.8, ry * 0.8, r, 0, 7); g.stroke(); } g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.fill();
    E.forEach(([rx, ry, r], k) => { const a = [0.5, 2.6, 4.4][k], x = Math.cos(a) * rx * 0.8, y = Math.sin(a) * ry * 0.8; g.beginPath(); g.arc(cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r), 16, 0, 7); g.fill(); });
    g.font = 'bold 96px "Comic Sans MS", Helvetica, sans-serif'; g.fillText('ELECTRONS', cx, 80); });
  const boardM = new THREE.MeshBasicMaterial({ map: boardT, transparent: true, toneMapped: false, color: 0xd8d8cc }); mk(new THREE.PlaneGeometry(1.15, 1.15), boardM, cls.root, 0.82, CD.board.y + 0.02, -2.94).castShadow = false;
  const KS = 0.62, kids = Array.from({ length: 9 }, (_, i) => { const p = person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: pick(STYLES), headR: 0.175 }); p.root.scale.setScalar(KS); return p; });
  const KID_DESKS = [0, 1, 2, 3, 4, 5, 7, 8, 10];        // front row (0–5) + three in the second row
  const bubble = makeSpeechBubble({ lines: ['Without electrons, nothing would wor—'], width: 0.95, maxChars: 18, accent: '#d2483f' });
  scene.add(bubble.sprite); bubble.sprite.visible = false;
  const plane = (() => { const g = new THREE.Group(); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.16, -0.09, 0.01, -0.08, 0, -0.02, -0.08, 0, 0, 0.16, 0.09, 0.01, -0.08, 0, -0.02, -0.08], 3)); geo.computeVertexNormals(); mk(geo, mat(0xf8f8f4, 0.8, { side: THREE.DoubleSide }), g); cls.root.add(g); return g; })();
  const yardM = []; cls.root.traverse((o) => { if (o.isMesh && o.material?.isMeshBasicMaterial && o.material.map && o.position.x > 4) yardM.push({ o, c: o.material.color.clone() }); });
  function classroom(t) {
    const tt = Math.min(t, TC);
    const p = basePose(); p.eyes = 'open'; Object.assign(p, { x: 1.75, z: -2.3, rotY: -0.45, headYaw: 0.1, headPitch: -0.05, mouth: 'o', lean: 0.05 }); p.armA = A(-1.25, 1.05, -0.1, 0.2); p.armB = A(-0.9, 0.35, -1.4, -0.5);
    put(teacher, 'cls', p);
    kids.forEach((k, i) => {
      const d = CD.desks[KID_DESKS[i]], q = basePose(); q.eyes = blink(tt, i + 50);
      Object.assign(q, { x: d.x, z: d.z + CD.chair.dz, rotY: PI + (i % 3 - 1) * 0.12, footFwd: 0.42, headPitch: -0.12, headYaw: (i % 2 ? 0.2 : -0.2), mouth: i % 3 === 0 ? 'o' : 'smile' });
      q.armA = A(-0.75, 0.15, -1.1, 0.5); q.armB = i % 3 === 1 ? HAND_UP_B : i === 5 ? THROW_B : A(-0.75, 0.15, -1.1, -0.5);
      q.x += OFF.cls[0]; q.z += OFF.cls[2]; q.y = 0; q.floor = 0; applyPose(k, q); k.root.position.y = (CD.chair.seat + 0.02) - KS * (HIP_H - 0.17) + KS * 0.05; k.root.visible = true;
    });
    // a paper plane thrown 0.5 s before the switch, frozen mid-flight
    const pt = clamp((tt - (TC - 0.5)) / 0.5);
    plane.position.set(lerp(1.0, 0.25, pt), lerp(0.85, 1.55, pt) + 0.15 * Math.sin(pt * PI), lerp(-0.85, -1.6, pt)); plane.rotation.set(-0.2, PI + 0.6, 0.25); plane.visible = true;
    const k = sstep(TC, TC + 0.06, t);
    cls.lights.ceil.intensity = 3.0 * (1 - k); cls.lights.hallLight.intensity = 2.2 * (1 - k); cls.lights.hemi.intensity = lerp(0.9, 0.3, k);
    yardM.forEach(({ o, c }) => o.material.color.copy(c).multiplyScalar(1 - 0.75 * k));
    // the bubble: pops up while she talks; frozen (cut off) after the switch
    teacher.root.updateMatrixWorld(true); const hp = teacher.headG.getWorldPosition(new THREE.Vector3());
    bubble.sprite.position.set(hp.x - 0.2, hp.y + 0.43, hp.z + 0.25); bubble.setRows(1); bubble.setPop(0.95 * sstep(S0.class + 0.05, S0.class + 0.35, t)); bubble.sprite.visible = true;
  }

  // ================================================================ ATOMS (the micro view)
  const lattice = makeAtomLattice({ nx: 18, nz: 14, ny: 5, s: 1 }); atoms.add(lattice.g);
  mk(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02040c'); gr.addColorStop(0.55, '#0b1838'); gr.addColorStop(1, '#03060f'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }), atoms);
  function atomScene(t, tau) {
    const cloudsK = 1 - sstep(S0.atoms, S0.atoms + 0.4, t);                    // the electron clouds go (a reminder of τ = 0)
    const spread = Math.pow(tau / 3e-16, 3);                      // surface nuclei: one atom width by ~0.3 fs, ×(τ/0.3 fs)³
    const vis = spread < 1 ? spread : 1 + 1.5 * Math.log(spread);   // the display compresses the (τ/0.3 fs)³ growth so the last second stays readable
    lattice.set(cloudsK, vis, vis * 0.9, t);
  }

  // ================================================================ PARIS (2 PM)
  UD.paris = patchDissolve(paris.root, { uGlow: { value: new THREE.Color(0xffd9a0) }, uFreq: { value: 0.6 } });
  const tourists = Array.from({ length: 8 }, () => person({ skin: pick(SKINS), top: pick(CASUAL), pants: pick(PANTS), hair: pick(HAIRS), hairStyle: pick(STYLES), glasses: R() < 0.3 }));
  UD.people = { uDis: { value: 0 }, uGlow: { value: new THREE.Color(0xbfe2ff) }, uFreq: { value: 18 } };
  for (const r of [...crowd, ...heroes, ...comps, yuki, ...tourists]) patchDissolve(r.root, UD.people);
  function parisScene(t) {
    const spots = [[-3, 30, 0.4], [-1.6, 31, -0.3], [2.4, 34, 3.0], [3.4, 33.6, -2.6], [-4.5, 38, 0.2], [5.5, 40, 2.4], [0.5, 42, PI], [-6.5, 44, 0.8]];
    tourists.forEach((r, i) => { const [x, z, ry] = spots[i], p = basePose(); p.eyes = 'open'; Object.assign(p, { x, z, rotY: ry, headPitch: -0.5, mouth: i % 2 ? 'o' : 'smile' }); if (i % 3 === 0) { p.armB = SELFIE_B; } else if (i % 3 === 1) { p.armA = POINT_A; } put(r, 'paris', p); });
    blackSky('paris', 1); paris.lights.hemi.intensity = 0.3; paris.aimSun(0, 20, 60);
  }

  // ================================================================ SPACE (Earth R = 400 units, Moon, the blast)
  space.lights.visible = false;                                   // no current: the night side is dark
  const moonDir = new THREE.Vector3(-0.25, 0.94, 0.22).normalize();
  const earthImg = (() => { const c = space.earth.material.map.image; return c.getContext('2d').getImageData(0, 0, c.width, c.height); })();
  const earthCol = (d, df) => {
    if (df > 0.02) return new THREE.Color().setHSL(0.05 + 0.03 * df, 0.35 + 0.6 * df, 0.22 + 0.3 * df);   // interior: brown crust → orange mantle → hot core
    const th = Math.acos(clamp(d.y, -1, 1)), ph = (Math.atan2(d.z, -d.x) + 2 * PI) % (2 * PI);
    const x = Math.floor(ph / (2 * PI) * (earthImg.width - 1)), y = Math.floor(th / PI * (earthImg.height - 1)), i = (y * earthImg.width + x) * 4;
    const c = new THREE.Color(earthImg.data[i] / 255, earthImg.data[i + 1] / 255, earthImg.data[i + 2] / 255);
    return c.convertSRGBToLinear().multiplyScalar(1.6);
  };
  const ecloud = makeNucleiCloud(space.spin, { max: 230000, seed: 72 }); ecloud.addPlanet(new THREE.Vector3(), 400, 220000, earthCol, { group: 0, surface: 0.6 });
  const moonG = new THREE.Group(); moonG.position.copy(moonDir).multiplyScalar(MOON_D); space.root.add(moonG);
  const mcloud = makeNucleiCloud(moonG, { max: 60000, seed: 73 }); mcloud.addPlanet(new THREE.Vector3(), MOON_R, 60000, (d, df) => new THREE.Color().setHSL(0.08, 0.1 + 0.4 * df, 0.45 + 0.1 * Math.sin(d.x * 20) * Math.cos(d.z * 17)), { group: 0, surface: 0.6 });
  const meet = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(0xfff0d0).multiplyScalar(3), toneMapped: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })); space.root.add(meet);
  const earthBase = space.earth.material.color.clone(), rock = new THREE.Color(0x8a3a1c);
  function spaceScene(t, tau, cam) {
    const reach = C * tau / UNIT;                                 // blast front depth (units)
    space.setSpin(0.6 + t * 0.01);
    space.sun.castShadow = false;
    const core = Math.max(0, 1 - reach / 400);                    // the untouched inside: r < R − cτ
    space.earth.scale.setScalar(Math.max(0.001, core)); space.earth.visible = core > 0.002;
    space.earth.material.color.copy(earthBase).lerp(rock, sstep(30, 160, reach));
    space.earth.material.emissive = space.earth.material.emissive || new THREE.Color(); space.earth.material.emissive.setRGB(0.5, 0.12, 0.02).multiplyScalar(sstep(60, 200, reach));
    space.clouds.visible = reach < 4; space.clouds.material.opacity = 0.95 * (1 - sstep(0.4, 3.5, reach));
    space.atm.visible = reach < 25; space.atm.scale.setScalar(1 + reach / 420);
    const grow = Math.max(1, (400 + reach) / 400);
    ecloud.set(studio.camera, t, { reach, thick: 400, spread: 0.06, size: (cam === 'orbit' ? 3.2 : 2.6) * Math.pow(grow, 0.92), fade: 0, minR: 0.25, gain: cam === 'orbit' ? 1.9 : 1.4, groups: [{ on: 1 }] });
    const mreach = reach;
    mcloud.set(studio.camera, t, { reach: mreach, thick: MOON_R, spread: 0.06, size: 2.6 * Math.max(1, (MOON_R + mreach) / 400) * 0.9, fade: 0.9, minR: 0.25, gain: 1.2, groups: [{ on: cam === 'moon' ? 1 : 0 }] });
    const touch = sstep(0.5, 0.63, tau); meet.visible = cam === 'moon' && touch > 0; meet.position.copy(moonDir).multiplyScalar(MOON_D * 0.5); meet.scale.setScalar(2000 + 9000 * touch); meet.material.opacity = touch;
  }

  // ================================================================ SOLAR (1 unit = 100,000 km): the Sun's light front + debris reach 1 AU
  const sunCloud = makeNucleiCloud(solar, { max: 70000, seed: 74 });
  sunCloud.addPlanet(new THREE.Vector3(), RSUN, 70000, (d, df) => new THREE.Color().setHSL(0.09 - 0.05 * df, 1.0, 0.55 + 0.2 * (1 - df)), { group: 0, surface: 0.7 });
  const earthPos = new THREE.Vector3(0, 0, -AU);     // Earth 'up' the vertical frame from the Sun
  const e2 = new THREE.Group(); e2.position.copy(earthPos); solar.add(e2);
  const e2cloud = makeNucleiCloud(e2, { max: 30000, seed: 75 }); e2cloud.addPlanet(new THREE.Vector3(), 6371e3 / SOL, 30000, (d, df) => new THREE.Color(df > 0.02 ? 0xff8a3a : (d.y > 0.85 || d.y < -0.85 ? 0xe8eef2 : (Math.sin(d.x * 9) * Math.cos(d.z * 7) > 0.2 ? 0x5a9a4a : 0x2a6ac8))).multiplyScalar(1.3), { group: 0, surface: 0.6 });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(AU, 2.2, 6, 360), new THREE.MeshBasicMaterial({ color: 0x5a7ab0, transparent: true, opacity: 0.55, toneMapped: false })); orbit.rotation.x = PI / 2; solar.add(orbit);
  const front = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2c8).multiplyScalar(0.5), transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false })); solar.add(front);
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(0xfff2d0).multiplyScalar(1.6), toneMapped: false, depthWrite: false, transparent: true })); solar.add(sunCore);
  const e2dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(0x6fb0ff).multiplyScalar(3), toneMapped: false, depthWrite: false, transparent: true })); e2dot.position.copy(earthPos); solar.add(e2dot);
  function solarScene(t, tau) {
    const lightR = RSUN + 2.998 * tau, debris = 2.998 * tau * 0.99;   // c = 2.998 units/s
    front.scale.setScalar(lightR); front.material.opacity = 0.1 + 0.08 * sstep(0.95 * AU, AU, lightR);
    sunCloud.set(studio.camera, t, { reach: debris, thick: RSUN, spread: 0.03, size: 0.035 * Math.max(1, debris / RSUN), fade: 1, minR: 0.02, gain: 0.75, groups: [{ on: 1 }] });
    e2cloud.set(studio.camera, t, { reach: 2.998 * tau, thick: 6371e3 / SOL, spread: 0.03, size: 0.035 * Math.max(1, 2.998 * tau / RSUN), fade: 1, minR: 0.02, gain: 0.75, groups: [{ on: 1 }] });
    sunCore.scale.setScalar(RSUN * 2.2 * (1 - sstep(2, 6, tau))); sunCore.visible = tau < 6;
    e2dot.scale.setScalar(Math.max(1.5, 0.012 * studio.camera.position.distanceTo(e2.getWorldPosition(new THREE.Vector3()))));
    const hit = sstep(0.985 * AU, AU, lightR); e2dot.material.color.setRGB(0.44, 0.69, 1.0).lerp(new THREE.Color(1, 0.95, 0.8), hit).multiplyScalar(3 + 30 * hit);
  }

  // ---------------------------------------------------------------- Tokyo dust: build the clouds from the frozen state (deterministic)
  tokyoScene(SW, SW); [...all].forEach((r) => { if (!crowd.includes(r) && !heroes.includes(r) && !comps.includes(r)) r.root.visible = false; });
  scene.updateMatrixWorld(true);
  const near = (c, r) => (m) => { const p = new THREE.Vector3(); m.getWorldPosition(p); return p.distanceTo(c) < r; };
  cloud.add([...heroes, ...comps].map((h) => h.root), 48000, { group: 0, gain: 1.25 });
  cloud.add(crowd.map((h) => h.root), 30000, { group: 0, gain: 1.15 });
  const HC = new THREE.Vector3(1.0, 1.0, heroAt(SW));
  cloud.add([city.root], 40000, { group: 1, gain: 0.9, pick: (m) => !m.isInstancedMesh && m.geometry.boundingSphere !== undefined && (m.geometry.computeBoundingSphere(), m.geometry.boundingSphere.radius < 60) && near(HC, 26)(m) });
  // Paris
  paris.root.visible = true; parisScene(33); scene.updateMatrixWorld(true);
  cloud.add(tourists.map((r) => r.root), 16000, { group: 2, gain: 1.2 });
  cloud.add([paris.root], 90000, { group: 3, gain: 1.1, pick: (m) => { const b = new THREE.Box3().setFromObject(m); return b.max.y > 2 && b.min.y < 80 && Math.abs(b.getCenter(new THREE.Vector3()).x - OFF.paris[0]) < 40; } });
  cloud.add([paris.root], 40000, { group: 4, gain: 0.9, pick: (m) => { const b = new THREE.Box3().setFromObject(m); return b.max.y < 2.5 && b.getSize(new THREE.Vector3()).x < 140; } });
  all.forEach((r) => (r.root.visible = false));

  // ---------------------------------------------------------------- per frame
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam, tau = tauAt(t);
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 1 : S === 'solar' ? 0.05 : 0.03; studio.fill.intensity = 0.5;
    all.forEach((r) => (r.root.visible = false)); dog.g.visible = false; plane.visible = false; bubble.sprite.visible = false;
    toast.forEach((g) => (g.visible = S === 'kit')); blobs.visible = S === 'pool';
    faceLights.forEach((L) => (L.visible = S === 'city'));
    stars.visible = false; sunDisc.visible = false;
    UD.city.uDis.value = 0; UD.people.uDis.value = 0; UD.paris.uDis.value = 0;
    cloud.set(studio.camera, t, { groups: [] }); ecloud.points.visible = S === 'space'; mcloud.points.visible = S === 'space';
    let P = null, Aim = null;
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);

    if (S === 'city') {
      const rewind = cam === 'rewind', frozen = !rewind && t >= SW;
      power(rewind || t < SW ? 1 : 0);
      studio.fill.intensity = frozen ? 1.15 : 0.6;
      if (rewind) tokyoRewind(t); else tokyoScene(t, Math.min(t, SW));
      // phone glow on the two faces
      [girl, boy].forEach((r, i) => { r.root.updateMatrixWorld(true); const h = r.headG.getWorldPosition(new THREE.Vector3()); faceLights[i].position.set(h.x + 0.05, h.y - 0.12, h.z + 0.32); faceLights[i].intensity = frozen || rewind ? 0 : 0.12; });
      if (rewind) { yuki.root.visible = true; pal.root.visible = true; }
      const hz = heroAt(Math.min(t, SW)), cx = 1.0;
      if (cam === 'tokyo') {    // walk backward ahead of the friends; after the switch, orbit them (bullet time)
        const ang = 0.8 * sstep(SW, S1.tokyo, t) + 0.05 * Math.sin(t * 0.7), rad = lerp(2.55, 1.8, sstep(SW, S1.tokyo, t));
        P = [cx + 0.25 + Math.sin(ang) * rad, 1.52 + 0.08 * sstep(SW, S1.tokyo, t), hz - 0.2 + Math.cos(ang) * rad]; Aim = [cx + 0.25, 1.42, hz - 0.25];
      }
      if (cam === 'dust') {
        const reach = C * tau, ang = lerp(0.55, -0.35, e), rad = lerp(1.9, 3.8, sstep(0.45, 1, u));
        P = [cx + 0.25 + Math.sin(ang) * rad, lerp(1.5, 2.3, sstep(0.55, 1, u)), hz - 0.2 + Math.cos(ang) * rad]; Aim = [cx + 0.25, 1.35, hz - 0.25];
        UD.people.uDis.value = Math.pow(sstep(0.003, 0.3, reach), 0.9); UD.city.uDis.value = 0.3 * sstep(0.01, 0.3, reach);
        cloud.set(studio.camera, t, { reach, thick: 0.16, spread: 0.9, lift: 0.4, size: 0.010, fade: 0, minR: 0.0015, gain: 1.0, groups: [{ on: 1 }, { on: 1, thick: 0.5 }] });
      }
    }
    if (S === 'pool') { const k = poolScene(t); stars.visible = k > 0; stars.material.opacity = k;
      const tl = sstep(S0.pool + 1.4, S1.pool, t); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], tl) + o[i]); }
    if (S === 'cls') studio.fill.intensity = 0.75;
    if (S === 'kit') kitchen(t);
    if (S === 'cls') classroom(t);
    if (S === 'atoms') atomScene(t, tau);
    if (S === 'paris') {
      parisScene(t); stars.visible = true; stars.material.opacity = 1;
      const reach = C * tau;
      UD.people.uDis.value = sstep(0.05, 0.6, reach); UD.paris.uDis.value = Math.pow(sstep(0.4, 60, reach), 0.6);
      cloud.set(studio.camera, t, { reach, thick: 0.6, spread: 1.0, lift: 0.6, size: 0.05 * Math.max(1, reach / 6), fade: 0, minR: 0.02, gain: 1.5, groups: [null, null, { on: 1, thick: 0.15 }, { on: 1, thick: 1.2 }, { on: 1, thick: 40 }] });
      UD.city.uDis.value = 0;
    }
    if (S === 'space') {
      spaceScene(t, tau, cam);
      const s0 = OFF.space;
      if (cam === 'moon') {     // side view: Earth bottom, Moon top; pull back as the two bubbles grow
        const mid = moonDir.clone().multiplyScalar(MOON_D * 0.5), side = new THREE.Vector3().crossVectors(moonDir, new THREE.Vector3(0, 0, 1)).normalize();
        const dist = lerp(30000, 58000, e), pos = mid.clone().addScaledVector(side, dist).addScaledVector(new THREE.Vector3(0, 0, 1), dist * 0.25);
        P = [pos.x + s0[0], pos.y + s0[1], pos.z + s0[2]]; Aim = [mid.x + s0[0], mid.y + s0[1], mid.z + s0[2]];
      }
      stars.visible = true; stars.material.opacity = 1;
    }
    if (S === 'solar') {
      solarScene(t, tau);
      const v = lerp(0, 1, sstep(0, 1, Math.log(tau / 0.63) / Math.log(497 / 0.63)));   // follows the log clock: 0 → 1
      const dist = 80 * Math.pow(AU * 3.3 / 80, Math.pow(v, 1.7)),   // zoom out slower than the blast grows, so it visibly grows
            look = new THREE.Vector3(0, 0, -AU * 0.5 * sstep(0.55, 1, v));
      P = [look.x + dist * 0.12 + o[0], dist * 0.8 + o[1], look.z + dist * 0.58 + o[2]]; Aim = [look.x + o[0], o[1], look.z + o[2]];
      stars.visible = true; stars.material.opacity = 1;
    }
    // stars + sun disc ride with the camera
    stars.position.set(P[0], P[1], P[2]); stars.scale.setScalar(studio.camera.far * 0.8);
    if (S === 'pool' || S === 'paris') {
      const L = (S === 'pool' ? pool : paris).lights.sun, d = S === 'pool' ? new THREE.Vector3(-0.545, 0.53, -0.65).normalize() : L.position.clone().sub(L.target.position).normalize();
      sunDisc.visible = true; sunDisc.position.set(P[0] + d.x * 200, P[1] + d.y * 200, P[2] + d.z * 200); sunDisc.scale.setScalar(16);
    }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
