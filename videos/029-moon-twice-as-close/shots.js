// VIDEO 029 — "What if the Moon were twice as close?"  (tone: whatif, SCIENCE lane @ed_.studios)
// 61.4 s. A full moon rises over a Maine harbor; SECOND 0 it is moved to half its distance, then a day-and-night ladder of what
// changes, one place per consequence: the sky (twice as wide), New York (4× the moonlight), the harbor at 1 AM (8× the tidal pull
// floods the street), the same harbor at dawn (drained, boats on the mud), the Bay of Fundy (16 m → roughly 130 m), Quito (a
// half-hour total eclipse), an Ohio kitchen (10-day months, 37 full moons a year), Earth + Moon to scale (9.7-day orbit), and back
// to the harbor on Day 11 (full moon again — craters you can see by eye). NEW: engine/moon.js (procedural Moon, a sky Moon at a TRUE
// angular size, an eclipse kit), engine/sets/tidetown.js (the harbor built for tides), engine/sets/fundy.js (the flowerpot rocks).
// Reused: city.js (rooftop), kitchen.js, plaza.js, tech.js buildSpace.
//
// PHYSICS MODEL (stated so a reviewer can check every number). Today the Moon is moved from its mean distance (384,400 km) to half
// that (192,200 km) and set on a circular orbit there (speed ×√2); nothing else changes (same Moon, same Earth, same Sun).
//   • Apparent size: 2·atan(1,737.4 / d) = 0.518° → 1.036° (twice as wide, 4× the area). The Moon is DRAWN AT THIS TRUE SIZE in
//     every shot (engine/moon.js makeSkyMoon); long lenses (fov 3.5–9°) make it big, the way real moonrise photos do.
//   • Moonlight: same surface brightness × 4× the solid angle = 4× the light. Clear-sky full moon ≈ 0.1–0.3 lux → ≈ 0.4–1.2 lux
//     (HUD: 0.25 → 1 lux).
//   • Tides: tide-raising force ∝ M/d³ → 2³ = 8× (NOAA). We scale today's (lunar-dominated) tide ranges ×8 — the simplest honest
//     estimate; real coasts resonate and friction grows, so the text says "roughly". Harbor: a 1.5 m range → 12 m (high water
//     +6 m, low −6 m). Bay of Fundy: 16 m → ~130 m.
//   • Rhythm: Kepler, T ∝ d^1.5 → sidereal month 27.32 d / 2^1.5 = 9.66 d; synodic (moon to moon) 1/(1/9.66 − 1/365.25) = 9.92 d
//     → 36.8 full moons a year; lunar day 1/(1/0.99727 − 1/9.66) = 26.7 h → a high tide every 13 h 21 min (today 12 h 25 min).
//     Orbital speed √(GM/r): 1.02 km/s (3,680 km/h) → 1.45 km/s (5,220 km/h).
//   • Eclipses: the Moon (1.04–1.07°) now covers the Sun (0.53°) with room to spare. Equatorial observer at noon: the Moon drifts
//     across the Sun at (1.449 − 0.465 km/s)/185,800 km ≈ 1.05°/h relative to the Sun → (1.07° − 0.53°)/1.05°/h ≈ 31 min of totality
//     (today's theoretical maximum ≈ 7 min 31 s). New moons come every 9.9 days and the eclipse limits widen (the Moon's parallax
//     doubles), so eclipses come far more often (we don't print a number for that).
//   • Visible detail: the eye resolves ~1 arcminute; Copernicus (93 km) spans 0.83′ today and 1.66′ at half the distance.
//
// SOURCES (checked Oct 2026): NASA Moon fact sheet (mean distance 384,400 km, radius 1,737.4 km, sidereal month 27.32 d, synodic
//   29.53 d, mean orbital speed 1.022 km/s); NOAA Ocean Service tides tutorial ("tide-generating forces vary inversely as the cube of
//   the distance"); full-moon illuminance 0.1–0.3 lux (Kyba, Mohar & Posch 2017, "How bright is moonlight?", Astronomy & Geophysics:
//   the 2016 supermoon near Vienna measured 0.26–0.30 lux; Wikipedia "Lux" 0.05–0.3 lux); Bay of Fundy tides up to 16 m at
//   Hopewell Rocks, 16.3 m range at Burntcoat Head (Guinness; Wikipedia "Hopewell Rocks", "Burntcoat Head"); longest possible total
//   solar eclipse ≈ 7 min 31–32 s (Meeus; Live Science "What's the longest solar eclipse in history?"); 2186 eclipse 7 min 29 s.
//
// Shot list (seconds)                       | set   | what happens
//  0.0– 3.4 title   MAINE · 6:10 PM         | town  | dusk on the quay: a crowd of faces watching the sea, shops lit behind them
//  3.4– 8.6 rise    SECOND 0 at 6.2         | town  | 9° lens: the full Moon rising by the lighthouse; 6.2–7.4 it doubles; the glitter path flares
//  8.6–12.2 faces                           | town  | a slow dolly along the faces in the brighter moonlight, phones up, a kid pointing
// 12.2–16.4 roof    NEW YORK · 10 PM        | city  | a rooftop reader holds up "MOON MOVES CLOSER" — readable by moonlight; skyline + Moon behind
// 16.4–22.4 flood   DAY 2 · 1 AM            | town  | time-lapse: the tide climbs the staff, over the quay, through the street; cars float; balconies
// 22.4–26.4 low     DAY 2 · 7:40 AM         | town  | low angle from the mud: boats keeled over, faces peering down from the quay 8 m up
// 26.4–32.4 fundy   DAY 2 · 11 AM           | fundy | time-lapse on the ocean floor: tourists zip back to the stairs, the bay swallows the flowerpots
// 32.4–35.4 eclA    QUITO · DAY 6           | plaza | faces in eclipse glasses as the light drains; glasses come off at totality
// 35.4–39.0 eclB                            | plaza | the black Moon + corona above the plaza, 360° sunset horizon, lamps on, stars
// 39.0–43.6 cal     OHIO · DAY 11           | kit   | the wall calendar with three full moons a month; the kid in wolf ears howls; Mom points
// 43.6–48.2 orbit   EARTH + MOON TO SCALE   | space | behind the Moon toward Earth → pull out to both orbits (old, faint; new, bright)
// 48.2–51.0 end1    DAY 11 · 8:30 PM        | town  | Dad + kid on the quay bench, faces in moonlight, she points up
// 51.0–54.0 end2                            | town  | 3.5° lens: the Moon fills the frame — craters by eye; a gull crosses it
// 54.0–61.4 end3                            | town  | pull back from the bench over the moonlit harbor; end card at 57.2
import * as THREE from 'three';
import { K, clamp, lerp, rng, mat, mk, canvasTex, walkLegs } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makePhone, makeMug, makeDog } from '@engine/props.js';
import { buildTidetown, DIMS as TD, floorY } from '@engine/sets/tidetown.js';
import { buildFundy, DIMS as FD } from '@engine/sets/fundy.js';
import { buildCity } from '@engine/sets/city.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildPlaza } from '@engine/sets/plaza.js';
import { buildSpace } from '@engine/sets/tech.js';
import { makeSkyMoon, makeMoonBody, makeEclipse, ANG0, ANG1 } from '@engine/moon.js';

const PI = Math.PI, Q = TD.quayY;
const SW = 6.2, GROWN = 7.4;                  // second 0, the Moon arrives at its new size
const OFF = { city: [0, 0, 0], town: [6000, 0, 0], fundy: [12000, 0, 0], kit: [18000, 0, 0], plaza: [24000, 0, 0], space: [40000, 0, 0] };
const UNIT = 15.93;                            // space: km per scene unit (Earth R 6,371 km = 400)
const RN = 192200 / UNIT, RO = 384400 / UNIT, RM = 1737.4 / UNIT;

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'title', set: 'town' },
  { t0: 3.4, t1: 5.0, cam: 'rise', set: 'town' },
  { t0: 5.0, t1: 6.1, cam: 'look', set: 'town' },
  { t0: 6.1, t1: 7.6, cam: 'rise', set: 'town' },
  { t0: 7.6, t1: 12.2, cam: 'faces', set: 'town' },
  { t0: 12.2, t1: 16.4, cam: 'roof', set: 'city' },
  { t0: 16.4, t1: 19.6, cam: 'flood', set: 'town' },
  { t0: 19.6, t1: 22.4, cam: 'floodB', set: 'town' },
  { t0: 22.4, t1: 26.4, cam: 'low', set: 'town' },
  { t0: 26.4, t1: 32.4, cam: 'fundy', set: 'fundy' },
  { t0: 32.4, t1: 35.4, cam: 'eclA', set: 'plaza' },
  { t0: 35.4, t1: 39.0, cam: 'eclB', set: 'plaza' },
  { t0: 39.0, t1: 43.6, cam: 'cal', set: 'kit' },
  { t0: 43.6, t1: 48.2, cam: 'orbit', set: 'space' },
  { t0: 48.2, t1: 51.0, cam: 'end1', set: 'town' },
  { t0: 51.0, t1: 52.6, cam: 'end2', set: 'town' },
  { t0: 52.6, t1: 54.0, cam: 'end2b', set: 'town' },
  { t0: 54.0, t1: 61.4, cam: 'end3', set: 'town' },
];
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased); fov; amp = handheld drift
export const CAMS = {
  title: { p: [[1.15, Q + 2.0, -2.6], [1.1, Q + 1.92, -2.1]], a: [[1.1, Q + 1.4, 4.0], [1.1, Q + 1.42, 4.0]], fov: 46, amp: 0.006 },
  rise:  { p: [[20, Q + 1.7, 0.6], [20, Q + 1.7, 0.6]], a: [[0, 0, 0], [0, 0, 0]], fov: 9, amp: 0.0 },                 // aim from the Moon
  faces: { p: [[0.8, Q + 1.66, -1.0], [1.3, Q + 1.6, -0.2]], a: [[1.05, Q + 1.52, 2.6], [1.05, Q + 1.5, 2.6]], fov: 42, amp: 0.004 },
  look:  { p: [[1.5, Q + 1.6, 0.0], [1.3, Q + 1.58, 0.35]], a: [[1.05, Q + 1.48, 2.6], [1.05, Q + 1.5, 2.6]], fov: 34, amp: 0.004 },   // v2: calm faces before the switch
  roof:  { p: [[-11.0, 17.75, 16.6], [-11.35, 17.7, 16.2]], a: [[-12.0, 17.55, 11.0], [-12.0, 17.6, 11.0]], fov: 24, amp: 0.004 },
  flood: { p: [[3.0, 8.0, 0.4], [3.4, 8.7, 1.6]], a: [[2.5, 7.4, 16.5], [2.5, 7.3, 16.5]], fov: 54, amp: 0.006 },
  floodB: { p: [[1.5, 0, 7.4], [1.9, 0, 8.0]], a: [[3.3, 0, 16.4], [3.3, 0, 16.4]], fov: 60, amp: 0.006 },   // y rides the water (aim y = level + 3.4)
  low:   { p: [[3.4, -1.3, -12.0], [2.4, 0.9, -9.6]], a: [[1.6, 0.6, 0.0], [1.5, 2.4, 0.0]], fov: 60, amp: 0.005 },   // crane up off the mud
  fundy: { p: [[14.4, 2.2, 9.6], [13.0, 18.0, 13.2]], a: [[6.0, 2.0, -9.0], [3.0, 7.5, -14.0]], fov: 52, amp: 0.006 },
  eclA:  { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 40, amp: 0.004 },
  eclB:  { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 56, amp: 0.003 },
  cal:   { p: [[-1.6, 1.5, 0.75], [0.35, 1.3, 0.45]], a: [[3.0, 1.42, 0.05], [2.6, 1.2, 0.2]], fov: 46, amp: 0.004 },   // v2: push in
  orbit: { p: [[0, 0, 0], [0, 0, 0]], a: [[0, 0, 0], [0, 0, 0]], fov: 26, amp: 0 },
  end1:  { p: [[23.6, Q + 1.3, -0.9], [27.3, Q + 1.25, -0.8]], a: [[26.05, Q + 1.0, 3.3], [26.0, Q + 1.05, 3.3]], fov: 38, amp: 0.004 },   // v2: arc
  end2:  { p: [[26.0, Q + 1.6, 1.0], [26.0, Q + 1.6, 1.0]], a: [[0, 0, 0], [0, 0, 0]], fov: 3.6, amp: 0 },
  end2b: { p: [[26.6, Q + 1.42, 1.85], [26.45, Q + 1.4, 2.05]], a: [[26.2, Q + 1.48, 3.2], [26.2, Q + 1.5, 3.2]], fov: 38, amp: 0.004 },   // v2: the kid's face, awed
  end3:  { p: [[26.1, Q + 1.3, -1.4], [27.2, Q + 3.4, -8.5]], a: [[26.05, Q + 0.95, 3.2], [25.6, Q + 1.4, 3.2]], fov: 36, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const UP = A(-2.55, 0.25, -0.12, 0);                       // pointing up at the sky
const PHONE = A(-1.55, 0.12, -1.25, -0.45);                // phone held up to film (armB)
const MOUTH_A = A(-0.55, 0.05, -2.35, 0.75), MOUTH_B = A(-0.55, 0.05, -2.35, -0.75);   // hands to the mouth
const CHEST_B = A(-0.05, 0.2, -2.0, -0.9);
const PAPER_A = A(-0.75, 0.3, -1.25, 0.5), PAPER_B = A(-0.75, 0.3, -1.25, -0.5);
const HUG_B = A(-0.35, 1.05, -1.2, -0.3);                  // arm around the kid on the bench
const OUT = A(-0.25, 1.3, -0.25, 0);
const mix = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0xe08a3a, 0x4fb3a8, 0xf2f2f2, 0x2f5a8a];
const PANTS = [0x2f3a4a, 0x3a3d42, 0x6b5a48, 0x45607a, 0x8a7b6a, 0xd9cdb4];

/** a direction from azimuth (deg, from −z toward +x) and elevation (deg) */
const dirAE = (az, el) => { const a = az * PI / 180, e = el * PI / 180; return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)); };
const azelOf = (v) => [Math.atan2(v.x, -v.z) * 180 / PI, Math.asin(v.y / v.length()) * 180 / PI];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const W = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot; city stays at 0)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  const town = buildTidetown(studio, {}); town.root.position.set(...OFF.town);
  const fundy = buildFundy(studio, {}); fundy.root.position.set(...OFF.fundy);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(7, 0);
  const plaza = buildPlaza(studio, {}); plaza.root.position.set(...OFF.plaza);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space);
  const ROOTS = { city: city.root, town: town.root, fundy: fundy.root, kit: kit.root, plaza: plaza.root, space: space.root };
  const FOGS = { city: cityFog, town: town.fog, fundy: fundy.fog, kit: null, plaza: plaza.fog, space: null };
  const FAR = { city: 1500, town: 2400, fundy: 1500, kit: 40, plaza: 1100, space: 300000 };

  // ---------------------------------------------------------------- the Moon (sky disc at true size) + eclipse
  const skyMoon = makeSkyMoon(); scene.add(skyMoon.g);
  const eclipse = makeEclipse(); scene.add(eclipse.g);

  // ---------------------------------------------------------------- cast
  const R = rng(29);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const all = [];
  const person = (o) => { const p = makePerson(o); scene.add(p.root); all.push(p); p.root.visible = false; return p; };
  const crowd = Array.from({ length: 16 }, (_, i) => { const st = ['short', 'bob', 'messy', 'none', 'short', 'bob'][i % 6]; return person({ skin: SKINS[(i * 3) % 7], top: TOPS[(i * 7) % 10], collar: i % 3 ? null : 0xf2f2f2, pants: PANTS[i % 6], hair: HAIRS[(i * 5) % 6], hairStyle: st, glasses: i % 5 === 2, mustache: st === 'short' && i % 4 === 1 ? HAIRS[(i * 5) % 6] : null }); });
  const dad = person({ skin: 0xe2ad8c, top: 0x2f5a8a, collar: 0xf2efe6, pants: 0x45607a, shoes: 0x6a4a30, hair: 0x5a3a24, hairStyle: 'short', mustache: 0x4a2e1c });
  const kid = person({ skin: 0xe2ad8c, top: 0xf2c12e, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'bob', headR: 0.175 });
  const fisher = person({ skin: 0xd9a37f, top: 0xf2c12e, collar: 0xf2c12e, pants: 0xf2c12e, shoes: 0x2a2d31, hair: 0x9a9a9a, hairStyle: 'short', mustache: 0x9a9a9a });
  const reader = person({ skin: 0xf1c3a1, top: 0x8a6a4a, collar: 0xf2efe6, pants: 0x3a3d42, hair: 0xd9d9d9, hairStyle: 'short', glasses: true, mustache: 0xd9d9d9 });
  const mom = person({ skin: 0xc98e6a, top: 0x4fb3a8, pants: 0x2f3a4a, hair: 0x1a1a1a, hairStyle: 'bob', glasses: true });
  const KS = 0.62;
  // props: phones, newspaper, wolf ears, eclipse glasses, a mug, a dog
  const phones = [0, 1, 2].map(() => { const ph = makePhone(); scene.add(ph.g); ph.g.visible = false; return ph; });
  const holdPhone = (ph, rig, side = 1) => { const h = handWorld(rig, side); ph.g.position.copy(h); ph.g.rotation.set(PI / 2 - 0.25, rig.root.rotation.y + PI, 0); ph.g.visible = true; };
  const paperT = canvasTex(512, 360, (g, w, h) => {
    g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d1d1d'; g.font = 'bold 34px Georgia, serif'; g.textAlign = 'center'; g.fillText('THE HARBOR DAILY', w / 2, 40); g.fillRect(20, 52, w - 40, 3);
    g.font = 'bold 74px Helvetica, Arial, sans-serif'; g.fillText('MOON MOVES', w / 2, 128); g.fillText('CLOSER', w / 2, 200);
    g.fillStyle = '#1d2a3a'; g.fillRect(24, 222, 200, 120); g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(124, 282, 46, 0, 7); g.fill();
    g.fillStyle = '#888'; for (let i = 0; i < 9; i++) g.fillRect(244, 228 + i * 13, 240 - (i % 3) * 30, 6);
  });
  const paper = new THREE.Group(); scene.add(paper); paper.visible = false;
  { const front = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.41), new THREE.MeshStandardMaterial({ map: paperT, roughness: 0.85, side: THREE.FrontSide })); paper.add(front);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.41), mat(0xe8e4d8, 0.85)); back.rotation.y = PI; back.position.z = -0.002; paper.add(back);
    const fold = mk(new THREE.BoxGeometry(0.004, 0.41, 0.01), mat(0xd8d4c8, 0.85), paper, 0, 0, -0.004); void fold; }
  const ears = new THREE.Group(); kid.head.g.add(ears);
  for (const s of [-1, 1]) { const e = mk(new THREE.ConeGeometry(0.06, 0.16, 4), mat(0x6a5a4a, 0.8), ears, s * 0.1, 0.19, -0.01); e.rotation.z = -s * 0.35; const inner = mk(new THREE.ConeGeometry(0.035, 0.1, 4), mat(0xe8a0a0, 0.8), ears, s * 0.1, 0.18, 0.02); inner.rotation.z = -s * 0.35; }
  mk(new THREE.TorusGeometry(0.17, 0.012, 6, 24, PI), mat(0x2a2d31, 0.5), ears, 0, 0.06, 0);
  ears.visible = false;
  const glassesOn = new Map();
  const shades = (rig) => { const r = rig.head.g; const g = new THREE.Group(); r.add(g); const hr = (rig === kid ? 0.175 : 0.135);
    mk(new THREE.BoxGeometry(hr * 1.55, hr * 0.42, 0.01), mat(0x0c0c10, 0.25), g, 0, hr * 0.08, hr * 0.97);
    mk(new THREE.BoxGeometry(hr * 1.62, hr * 0.5, 0.006), mat(0xf2f2f2, 0.8), g, 0, hr * 0.08, hr * 0.955);
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.006, 0.02, hr * 0.9), mat(0xf2f2f2, 0.8), g, s * hr * 0.8, hr * 0.1, hr * 0.5);
    g.visible = false; glassesOn.set(rig, g); return g; };
  crowd.slice(0, 14).forEach(shades); shades(kid); shades(dad);
  const mug = makeMug(0xf2f2f2); dad.arms.find((a) => a.s === 1).hand.add(mug); mug.position.set(0, -0.06, 0.05); mug.visible = false;
  const dog = makeDog(); scene.add(dog.g); dog.g.visible = false;
  const crate = new THREE.Group(); town.root.add(crate); crate.position.set(1.1, Q, 1.75); crate.visible = false;
  { const wood = mat(0x9a6a3a, 0.8); for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.62, 0.12, 0.46), wood, crate, 0, 0.07 + k * 0.15, 0); mk(new THREE.BoxGeometry(0.64, 0.02, 0.48), mat(0x7a5230, 0.8), crate, 0, 0.45, 0);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshStandardMaterial({ map: canvasTex(128, 40, (g, w, h) => { g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a10'; g.font = 'bold 24px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('LOBSTER', w / 2, 28); }) })); lab.position.set(0, 0.23, -0.24); lab.rotation.y = PI; crate.add(lab); }

  // ---------------------------------------------------------------- helpers
  /** pose a rig: (x,z) local to the set; y = root height; floor = ground under the feet (local meters) */
  function put(rig, key, p, y = 0, floor = 0) {
    p.x += OFF[key][0]; p.z += OFF[key][2]; p.y = y + OFF[key][1]; p.floor = floor + OFF[key][1];
    applyPose(rig, p); rig.root.rotation.x = 0; rig.root.visible = true; rig.root.scale.setScalar(1);
  }
  /** a scaled kid standing on groundY (or seated: seatY) */
  function putKid(key, p, groundY, seatY = null) {
    const s = KS; p.x += OFF[key][0]; p.z += OFF[key][2];
    // seated: pelvis 0.07 (local) above the seat; feet dangle with the thighs level (floor 0.42 local = shins hang straight down)
    const rootY = seatY === null ? groundY : seatY - s * (0.865 - 0.07);
    p.y = 0; p.floor = seatY === null ? 0 : Math.max(0.42, (groundY - rootY) / s); if (seatY !== null) p.footFwd = 0.42;
    applyPose(kid, p); kid.root.position.y = rootY + OFF[key][1]; kid.root.scale.setScalar(s); kid.root.visible = true;
  }
  const idle = (p, t, i, k = 1) => { p.rotY += 0.06 * k * Math.sin(t * 0.7 + i * 1.9); p.headYaw += 0.12 * k * Math.sin(t * 0.9 + i * 2.3); p.eyes = blink(t, i); };

  // ================================================================ TOWN
  // the crowd on the quay for the moonrise (rows staggered in depth so a vertical frame holds many faces)
  const QUAY_T = [   // [x, z, facing offset, role] — rows staggered so the vertical frame holds ~10 faces
    [0.62, 1.0, 0.1, 'phoneA'], [1.58, 1.05, -0.12, 'gasp'],
    [0.3, 2.5, 0.12, 'point'], [1.1, 2.5, 0.0, 'kidDad'], [1.9, 2.6, -0.15, 'hands'],
    [-0.15, 4.1, 0.15, 'look'], [0.72, 4.25, 0.05, 'phoneB'], [1.5, 4.1, -0.05, 'look'], [2.3, 4.3, -0.18, 'point'],
    [-0.9, 5.6, 0.2, 'look'], [3.0, 5.7, -0.25, 'look'],
  ];
  const QUAY_F = QUAY_T.map((q, i) => (i === 0 ? [-0.8, 1.2, 0.3, q[3]] : i === 1 ? [3.1, 1.3, -0.3, q[3]] : i === 2 ? [0.35, 2.2, 0.12, q[3]] : i === 4 ? [1.85, 2.25, -0.15, q[3]] : q));
  const quayRigs = [crowd[0], crowd[1], crowd[2], dad, crowd[3], crowd[4], crowd[5], crowd[6], crowd[7], crowd[8], crowd[9]];
  function townCrowd(t, cam, moonK) {
    const react = sstep(SW + 0.2, SW + 1.2, t);
    (cam === 'faces' || cam === 'look' ? QUAY_F : QUAY_T).forEach(([x, z, f, role], i) => {
      const rig = quayRigs[i], p = basePose(); Object.assign(p, { x, z, rotY: PI + f, headPitch: -0.12 - 0.12 * react }); idle(p, t, i, 0.6);
      p.mouth = react > 0.5 && role !== 'look' ? 'o' : role === 'kidDad' ? 'smile' : 'flat';
      if (role === 'phoneA' || role === 'phoneB') { p.armB = mix(A(-0.3, 0.1, -1.0, -0.3), PHONE, t > SW ? 1 : sstep(1.0, 2.0, t)); }
      else if (role === 'point') { p.armB = mix(REST, UP, react); p.armA = REST; }
      else if (role === 'hands') { p.armA = mix(REST, MOUTH_A, react); p.armB = mix(REST, MOUTH_B, react); }
      else if (role === 'gasp') { p.armB = mix(REST, CHEST_B, react); p.lean = -0.06 * react; }
      else if (role === 'kidDad') { p.armA = A(-0.35, 0.15, -0.5, 0.2); p.headPitch = 0.2 - 0.3 * react; p.headYaw = -0.4 + 0.4 * react; }
      put(rig, 'town', p, Q, Q);
      if (role === 'phoneA') holdPhone(phones[0], rig); if (role === 'phoneB') holdPhone(phones[1], rig);
    });
    // the kid in front of Dad, pointing
    { const p = basePose(); Object.assign(p, { x: 1.1, z: 1.75, rotY: PI + 0.05, headPitch: -0.3 }); idle(p, t, 9, 0.8); p.armB = mix(A(-0.6, 0.2, -0.6, 0), UP, react); p.mouth = react > 0.3 ? 'o' : 'smile'; putKid('town', p, Q + 0.46); crate.visible = true; }
    void cam; void moonK;
  }
  // flood: people on the three balconies, the parked cars float, a dinghy sails into the street
  const BALC = [[1.4, 0.3], [2.5, -0.1], [3.6, -0.3], [-22.3, 0.25], [-20.3, -0.15], [24.6, 0.2]];
  function floodScene(t, level) {
    BALC.forEach(([x, f], i) => { const rig = crowd[i], p = basePose(); Object.assign(p, { x, z: TD.front - 0.75, rotY: PI + f, headPitch: 0.45 + 0.1 * Math.sin(t * 0.8 + i), lean: 0.12 }); idle(p, t, i, 0.5);
      p.mouth = 'o'; if (i % 2) { p.armB = A(-1.3, 0.2, -0.3, 0); } else p.armA = A(-0.4, 0.35, -0.9, 0.4);
      put(rig, 'town', p, TD.balconyY + 0.09, TD.balconyY + 0.09); });
    town.cars.forEach((c, i) => { const depth = level - Q - 0.55; const fl = Math.max(0, depth); c.g.position.set(c.x + fl * 0.35 * Math.sin(i * 1.7), Q + fl + 0.04 * Math.sin(t * 1.4 + i) * (fl > 0 ? 1 : 0), c.z + fl * 0.25 * Math.cos(i)); c.g.rotation.set(0.04 * Math.sin(t + i) * (fl > 0 ? 1 : 0), c.ry + fl * 0.08 * (i % 2 ? 1 : -1), 0.05 * Math.sin(t * 1.2 + i) * (fl > 0 ? 1 : 0)); c.setLights(i % 3 === 0 ? 0.6 : 0, 0.4); });
  }
  const LOWSPOT = { 6: [3.9, -3.0, 0.4], 7: [-0.6, -3.4, -1.2], 0: [6.4, -6.4, 0.35], 1: [-3.6, -7.6, -0.4] };
  function boatSpots(on) { for (const [i, [x, z, ry]] of Object.entries(LOWSPOT)) { const b = town.boats[i]; if (on) { b.save = [b.x, b.z, b.ry]; b.x = x; b.z = z; b.ry = ry; } else if (b.save) { [b.x, b.z, b.ry] = b.save; } } }
  function resetCars() { town.cars.forEach((c) => { c.g.position.set(c.x, Q, c.z); c.g.rotation.set(0, c.ry, 0); c.setLights(0, 0); }); }
  // low tide: faces looking down over the quay edge + the fisherman on the mud
  const EDGE = [[0.0, 0.2], [0.85, -0.1], [1.7, 0.15], [2.55, -0.2], [0.45, 0.3], [2.15, 0.25]];
  function lowScene(t) {
    EDGE.forEach(([x, f], i) => { const rig = crowd[i + 2], p = basePose(); Object.assign(p, { x, z: i < 4 ? 0.55 : 1.35, rotY: PI + f, headPitch: 0.75, lean: i < 4 ? 0.32 : 0.15 }); idle(p, t, i, 0.4);
      p.mouth = i % 3 === 1 ? 'o' : 'flat'; if (i === 1) { p.armB = A(-1.2, 0.2, -0.2, 0); } if (i === 3) { p.armA = MOUTH_A; p.armB = MOUTH_B; } if (i === 4) { p.armB = PHONE; }
      put(rig, 'town', p, Q, Q); if (i === 4) holdPhone(phones[0], rig); });
    const fx = 0.9, fz = -5.0, fy = floorY(fx, fz), p = basePose();
    Object.assign(p, { x: fx, z: fz, rotY: 2.7 + 0.3 * Math.sin(t * 0.6), headPitch: -0.55 }); p.armA = A(-2.6, 0.5, -1.9, 0.6); p.armB = A(-0.2, 0.3, -1.6, -0.3); p.mouth = 'flat'; p.eyes = blink(t, 3);
    put(fisher, 'town', p, fy, fy);
  }
  // ending: Dad + kid on the middle bench
  function benchScene(t, cam) {
    const [bx, bz] = TD.bench[2], seat = Q + 0.52;
    const p = basePose(); Object.assign(p, { x: bx - 0.4, z: bz - 0.05, rotY: PI + 0.08, footFwd: 0.42, headPitch: -0.22, headYaw: 0.25 * Math.sin(t * 0.4) }); p.eyes = blink(t, 1); p.mouth = 'smile';
    const up2 = sstep(48.7, 49.1, t);   // v2: the kid stands up on the bench; Dad laughs and points too
    p.armB = mix(HUG_B, A(-0.6, 0.6, -0.5, -0.3), up2); p.armA = mix(A(-0.3, 0.12, -1.1, 0.4), UP, up2 * (1 - sstep(50.6, 51.0, t))); p.headPitch = -0.22 - 0.15 * up2; p.headRoll = 0.08 * Math.sin(t * 4) * up2; put(dad, 'town', p, seat - 0.42 - 0.375, Q);
    const pt = sstep(48.6, 49.4, t) * (1 - sstep(53.6, 54.6, t) * 0.6);
    const k = basePose(); Object.assign(k, { x: bx + 0.25, z: bz - 0.05, rotY: PI - 0.1, footFwd: 0.4, headPitch: -0.35, headYaw: cam === 'end3' ? -0.15 : 0 }); k.eyes = blink(t, 4); k.mouth = t > 49.2 && t < 51 ? 'o' : 'smile';
    k.armB = mix(A(-0.5, 0.15, -0.9, -0.2), UP, pt); k.armA = mix(A(-0.5, 0.2, -0.8, 0.3), A(-2.3, 0.6, -0.3, 0), up2 * (1 - sstep(53.4, 54.0, t)));
    if (up2 > 0.5) { k.footFwd = 0; putKid('town', k, seat + (t < 51 ? 0.12 * Math.abs(Math.sin((t - 49) * 6)) : 0)); } else putKid('town', k, Q, seat);
    // a few couples further along the quay (end3 wide)
    [[25.0, 4.7, 0.15], [27.0, 4.9, -0.15], [30.0, 2.0, 0.1], [31.2, 1.8, -0.2], [21.5, 3.6, 0.3]].forEach(([x, z, f], i) => { const rig = crowd[10 + i], q = basePose(); Object.assign(q, { x, z, rotY: PI + f, headPitch: -0.25 }); idle(q, t, i + 3, 0.5); q.mouth = 'smile'; if (i === 1) q.armB = UP; if (i === 3) q.armA = A(-0.6, 0.6, -0.5, 0.3); put(rig, 'town', q, Q, Q); });
  }

  // ================================================================ CITY rooftop
  const RF = city.D.roof;
  const roofChair = new THREE.Group(); city.root.add(roofChair);
  { const al = mat(0xc9ccd2, 0.3, { metalness: 0.7 }), web = mat(0x2f8a6a, 0.8); mk(new THREE.BoxGeometry(0.52, 0.04, 0.48), web, roofChair, 0, 0.44, 0); const back = mk(new THREE.BoxGeometry(0.52, 0.6, 0.04), web, roofChair, 0, 0.74, -0.25); back.rotation.x = -0.18; for (const s of [-1, 1]) for (const z of [-0.22, 0.22]) mk(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6), al, roofChair, s * 0.24, 0.22, z); }
  roofChair.position.set(-12.0, RF.y, 11.4); roofChair.rotation.y = 0;
  // string lights over the roof + a cooler, potted plants (dress the roof)
  const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffc870, emissiveIntensity: 0.9 });
  for (let k = 0; k < 18; k++) { const u = k / 17, x = lerp(-16.4, -7.6, u), sag = 0.35 * Math.sin(u * PI); mk(new THREE.SphereGeometry(0.04, 8, 6), bulbM, city.root, x, RF.y + 2.6 - sag, 9.2); mk(new THREE.SphereGeometry(0.04, 8, 6), bulbM, city.root, x, RF.y + 2.4 - sag, 8.3); }
  for (const [x, z] of [[-16.2, 9.0], [-7.8, 9.0], [-16.2, 8.2], [-7.8, 8.2]]) mk(new THREE.CylinderGeometry(0.04, 0.04, 2.7, 6), mat(0x3a3d42, 0.5), city.root, x, RF.y + 1.35, z);
  for (const [x, z, c] of [[-13.4, 10.6, 0x4f8a3f], [-10.4, 10.4, 0x5f9a4a], [-14.2, 12.8, 0x4f8a3f]]) { mk(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 12), mat(0xb5672e, 0.8), city.root, x, RF.y + 0.2, z); const b = mk(new THREE.SphereGeometry(0.32, 10, 8), mat(c, 0.8), city.root, x, RF.y + 0.62, z); b.scale.y = 1.3; }
  mk(new THREE.BoxGeometry(0.55, 0.36, 0.36), mat(0x3d7bd9, 0.5), city.root, -11.2, RF.y + 0.18, 11.0);
  const roofBulbLight = new THREE.PointLight(0xffc27a, 2.5, 9, 1.6); roofBulbLight.position.set(-12, RF.y + 2.3, 12.5); city.root.add(roofBulbLight);
  function roofScene(t) {
    const p = basePose(); Object.assign(p, { x: -12.0, z: 11.45, rotY: 0.02 + 0.03 * Math.sin(t * 0.5), footFwd: 0.42, headPitch: 0.28 + 0.04 * Math.sin(t * 0.7) }); p.eyes = blink(t, 2); p.mouth = t > 14.2 ? 'smile' : 'flat';
    const lift = sstep(12.6, 13.6, t); p.armA = mix(A(-0.6, 0.3, -1.4, 0.5), PAPER_A, lift); p.armB = mix(A(-0.6, 0.3, -1.4, -0.5), PAPER_B, lift);
    put(reader, 'city', p, RF.y + 0.045, RF.y);
    const hA = handWorld(reader, -1), hB = handWorld(reader, 1), c = hA.clone().add(hB).multiplyScalar(0.5);
    paper.position.copy(c).add(new THREE.Vector3(0, 0.05, 0.05)); paper.rotation.set(-0.25 + 0.15 * (1 - lift), reader.root.rotation.y, 0.02 * Math.sin(t)); paper.visible = true;
    // a kid on the roof pointing at the Moon, a couple dancing slowly behind
    { const k = basePose(); Object.assign(k, { x: -13.2, z: 10.2, rotY: PI - 0.4, headPitch: -0.45 }); k.armB = UP; k.mouth = 'o'; k.eyes = blink(t, 5); putKid('city', k, RF.y); }
    [[-10.2, 9.6, 0], [-9.8, 9.9, 1]].forEach(([x, z, i]) => { const q = basePose(); Object.assign(q, { x: x + 0.15 * Math.sin(t * 1.3), z, rotY: i ? -2.2 : 0.9 + 0.3 * Math.sin(t * 0.65), headPitch: -0.2 }); q.armA = A(-0.6, 0.7, -0.8, 0.3); q.armB = A(-0.6, 0.7, -0.8, -0.3); q.eyes = blink(t, 6 + i); q.mouth = 'smile'; put(crowd[11 + i], 'city', q, RF.y, RF.y); });
  }

  // ================================================================ FUNDY
  const FV = [-0.522, -0.853], FP = [0.853, -0.522], F0 = [17.6, 9.9];
  const TOUR = [[8, -1.0, 0x3d7bd9], [11, 1.3, 0xd2483f], [14, -1.8, 0xf1c24a], [17, 1.0, 0x6fa84f], [20, -2.6, 0xe58fa6], [23, 2.2, 0xe08a3a], [27, -0.6, 0x8f6fb8], [31, 3.0, 0x4fb3a8]]
    .map(([d, o, c]) => [F0[0] + FV[0] * d + FP[0] * o, F0[1] + FV[1] * d + FP[1] * o, c]);
  const tourRigs = TOUR.map(([, , c], i) => person({ skin: SKINS[(i * 2) % 7], top: c, pants: PANTS[(i + 2) % 6], hair: HAIRS[(i * 3) % 6], hairStyle: ['short', 'bob', 'messy', 'bob'][i % 4], glasses: i === 3 }));
  const STAIR_FOOT = FD.stairFoot, LAND = FD.landing;
  function fundyScene(t) {
    const u = t - 26.4;   // time-lapse: wander (0–1.4 s), then everyone rushes to the stairs and up
    TOUR.forEach(([x, z], i) => {
      const t0 = 0.5 + (i % 4) * 0.15, t1 = t0 + 1.3 + i * 0.15, t2 = t1 + 1.3;
      const wander = [[x + 1.6 * Math.sin(i), z + 1.2], [x + 2.4, z + 0.4]];
      const legs = [{ t0: 0, t1: t0, pts: wander }, { t0, t1, pts: [[STAIR_FOOT[0] - 1.2 + (i % 3) * 0.5, STAIR_FOOT[2] - 1.5]] }];
      const w = walkLegs(u, [x, z], legs), p = basePose(); p.eyes = blink(t, i);
      let y = 0, px = w.x, pz = w.z, head = w.head ?? PI;
      if (u > t1) { const k = clamp((u - t1) / (t2 - t1)), a = [STAIR_FOOT[0], STAIR_FOOT[2]], b = [LAND[0] - 1.5, LAND[2]]; px = lerp(a[0], b[0], k) + (i % 2) * 0.35 - 0.17; pz = lerp(a[1], b[1], k); y = lerp(0.1, LAND[1], k); head = Math.atan2(b[0] - a[0], b[1] - a[1]); }
      Object.assign(p, { x: px, z: pz, rotY: head, dist: w.dist + (u > t1 ? (u - t1) * 4 : 0), speed: u < t0 ? 1.2 : 6 });
      if (u > t0) { p.lean = 0.25; p.armA = A(-0.9, 0.2, -1.4, 0.3, 0); p.armB = A(-0.9, 0.2, -1.4, -0.3, 0); p.mouth = 'o'; p.headYaw = i % 2 ? 0.5 : -0.4; }
      if (u >= t2) { const k = clamp((u - t2) / 1.4), a = [LAND[0] + 1.5, LAND[1], LAND[2]], b = FD.stairTop; Object.assign(p, { x: lerp(a[0], b[0], k) + (i % 2) * 0.35 - 0.17, z: lerp(a[2], b[2], k), rotY: Math.atan2(b[0] - a[0], b[2] - a[2]), speed: k < 1 ? 6 : 0, dist: w.dist + (u - t1) * 4 }); y = lerp(a[1], FD.cliffY + 1, k);
        if (k >= 1) { Object.assign(p, { x: b[0] - 1.5 + (i % 4) * 0.9, z: b[2] + 1.2 + Math.floor(i / 4) * 0.8, rotY: PI + 0.5, lean: 0.05, headPitch: 0.35 }); p.armA = REST; p.armB = i % 2 ? A(-1.2, 0.2, -0.3) : REST; p.mouth = 'o'; } }
      put(tourRigs[i], 'fundy', p, y, y);
    });
    // two tourists right by the lens: they turn to us, point back at the incoming sea, then bolt for the stairs (exit right)
    [[13.1, 5.4, 12], [11.6, 5.0, 13]].forEach(([x, z, ri], k) => {
      const go = 0.55 + k * 0.25, legs = [{ t0: go, t1: go + 0.9, pts: [[17.2 - k * 0.4, 7.4 + k * 0.3]] }];
      const w = walkLegs(u, [x, z], legs), p = basePose(); p.eyes = blink(t, k + 20);
      Object.assign(p, { x: w.x, z: w.z, rotY: u < go ? Math.atan2(14.4 - x, 9.6 - z) + 0.1 * Math.sin(t * 2 + k) : w.head ?? 1.2, dist: w.dist, speed: u < go ? 0 : 7, headYaw: u < go ? 0.1 : -0.9, headPitch: -0.05, mouth: 'o' });
      if (u < go) { p.armB = A(-1.4, 0.9, -0.2, 0); p.armA = A(-0.5, 0.2, -1.5, 0.5); } else { p.lean = 0.3; p.armA = A(-0.9, 0.2, -1.4, 0.3, 0); p.armB = A(-0.9, 0.2, -1.4, -0.3, 0); }
      if (u < go + 1.0) put(crowd[ri], 'fundy', p, 0, 0);
    });
  }
  const fundyFront = (t) => -62 + 70 * clamp((t - 26.6) / 3.2);              // the incoming edge, racing over the floor toward the stairs
  const fundyLevel = (t) => t < 29.6 ? 0.06 : 0.06 + 13 * Math.pow(clamp((t - 29.6) / 2.8), 1.25);   // then the bay climbs the stacks
  const clipF = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0); studio.renderer.localClippingEnabled = true; fundy.sea.material.clippingPlanes = [clipF];

  // ================================================================ PLAZA (eclipse)
  const SUNP = dirAE(6, 46);
  const skyDay = [new THREE.Color(0x3a7ed6), new THREE.Color(0xe6eef4)], skyTot = [new THREE.Color(0x0b1636), new THREE.Color(0xe08a4a)];
  const pLamps = [];
  for (const [x, z] of [[-6, 4], [6, 4], [-6, -6], [6, -6], [12, 1], [-12, 1]]) { const g = new THREE.Group(); g.position.set(x, 0, z); plaza.root.add(g); mk(new THREE.CylinderGeometry(0.07, 0.1, 4, 8), mat(0x2a2d31, 0.5), g, 0, 2, 0); const hm = mk(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffc070, emissiveIntensity: 0 }), g, 0, 4.1, 0); pLamps.push(hm.material); }
  const pLampLight = new THREE.PointLight(0xffc27a, 0, 18, 1.6); pLampLight.position.set(3, 4, 5); plaza.root.add(pLampLight);
  const pStars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 900 * 3 }, (_, i) => { const k = Math.floor(i / 3), Rr = rng(500 + k), u = 0.15 + Rr() * 0.85, a = Rr() * PI * 2, s = Math.sqrt(1 - u * u); return [Math.cos(a) * s * 800, u * 800, Math.sin(a) * s * 800][i % 3]; }), 3)), new THREE.PointsMaterial({ size: 2.2, color: 0xdfe8ff, transparent: true, opacity: 0, depthWrite: false, fog: false, sizeAttenuation: false }));
  scene.add(pStars);
  const PLZ = [  // [x, z, glasses-off order]
    [2.2, 3.0], [3.4, 2.6], [4.6, 3.2], [1.4, 4.4], [2.8, 4.6], [4.0, 4.8], [5.4, 4.4], [0.6, 6.0],
    [2.0, 6.4], [3.4, 6.6], [4.8, 6.2], [6.2, 6.0], [-0.6, 7.6], [1.4, 8.2],
  ];
  const totality = (t) => sstep(33.0, 34.3, t);
  function plazaScene(t) {
    const dark = totality(t);
    plaza.sky.setColors(skyDay[0].clone().lerp(skyTot[0], dark), skyDay[1].clone().lerp(skyTot[1], dark));
    plaza.lights.hemi.intensity = lerp(1.15, 0.22, dark); plaza.lights.sun.intensity = lerp(2.7, 0.0, dark) * (1 - 0.35 * sstep(32.4, 33.0, t));
    plaza.fog.color.set(0xdfe8f0).lerp(new THREE.Color(0x2a2a40), dark);
    pLamps.forEach((m) => (m.emissiveIntensity = 2.5 * sstep(34.0, 34.6, t))); pLampLight.intensity = 30 * sstep(34.0, 34.6, t);
    pStars.material.opacity = 0.7 * sstep(34.0, 35.0, t);
    const face = Math.atan2(SUNP.x, SUNP.z);
    PLZ.forEach(([x, z], i) => {
      const rig = crowd[i], p = basePose(); Object.assign(p, { x, z, rotY: face + 0.25 * Math.sin(i * 1.3), headPitch: -0.62 + 0.05 * Math.sin(t * 0.8 + i), lean: -0.06 }); p.eyes = blink(t, i);
      const off = t > 34.2 + (i % 5) * 0.18;   // glasses come off during totality (the only safe time)
      p.mouth = off ? 'o' : 'flat';
      if (!off) { p.armA = A(-1.25, 0.25, -1.75, 0.65); p.armB = A(-1.25, 0.25, -1.75, -0.65); } else { p.armA = i % 3 === 0 ? UP : A(-0.5, 0.25, -1.4, 0.5); p.armB = i % 2 ? A(-0.4, 0.2, -1.5, -0.4) : REST; }
      put(rig, 'plaza', p); glassesOn.get(rig).visible = !off;
    });
  }

  // ================================================================ KITCHEN (calendar)
  const calT = canvasTex(600, 780, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f5a8a'; g.fillRect(0, 0, w, 120);
    g.fillStyle = '#fff'; g.font = 'bold 76px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('NOVEMBER', w / 2, 88);
    const cw = w / 7, ch = 128; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillStyle = '#2f5a8a';
    'SMTWTFS'.split('').forEach((d, i) => g.fillText(d, cw * (i + 0.5), 156));
    for (let d = 1; d <= 30; d++) {
      const i = d - 1 + 0, cx = (i % 7) * cw, cy = 172 + Math.floor(i / 7) * ch;
      g.strokeStyle = '#d8d4c8'; g.lineWidth = 2; g.strokeRect(cx, cy, cw, ch);
      g.fillStyle = '#3a3d42'; g.font = 'bold 26px Helvetica, Arial, sans-serif'; g.textAlign = 'left'; g.fillText(String(d), cx + 6, cy + 28);
      const ph = ((d - 7) % 10 + 10) % 10;   // 0 = full moon (7, 17, 27), 5 = new moon
      const mx = cx + cw / 2, my = cy + ch / 2 + 14, r = ph === 0 ? 34 : 16;
      g.fillStyle = '#2a2d31'; g.beginPath(); g.arc(mx, my, r, 0, 7); g.fill();
      if (ph !== 5) { const lit = Math.cos(ph / 10 * PI * 2); g.fillStyle = '#f2c12e'; g.beginPath(); g.ellipse(mx, my, r * Math.abs(lit), r, 0, 0, 7); g.fill(); if (ph !== 0) { g.beginPath(); g.arc(mx, my, r, ph < 5 ? -PI / 2 : PI / 2, ph < 5 ? PI / 2 : PI * 1.5, false); g.fill(); } }
      if (ph === 0) { g.strokeStyle = '#d2302c'; g.lineWidth = 6; g.beginPath(); g.ellipse(mx, my, 50, 44, 0.2, 0, 7); g.stroke(); }
    }
  });
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.2), new THREE.MeshStandardMaterial({ map: calT, roughness: 0.75 }));
  cal.position.set(KD.room.x1 - 0.02, 1.56, 0.25); cal.rotation.y = -PI / 2; kit.root.add(cal);
  mk(new THREE.BoxGeometry(0.02, 0.06, 0.96), mat(0x8a6a4a, 0.6), kit.root, KD.room.x1 - 0.025, 2.18, 0.25);
  kit.root.children.filter((o) => o.isMesh && o.geometry.type === 'CircleGeometry' && Math.abs(o.position.z + 0.6) < 0.01).forEach((o) => (o.visible = false));   // wall clock out of the HUD corner
  kit.root.children.filter((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && Math.abs(o.position.z - 0.6) < 0.01 && Math.abs(o.position.y - 1.4) < 0.01).forEach((o) => (o.visible = false));   // the set's small calendar (ours replaces it)
  function kitchenScene(t) {
    const p = basePose(); const turn = sstep(41.2, 41.8, t);
    Object.assign(p, { x: 2.5, z: 0.92, rotY: -PI / 2 - 0.25, headYaw: lerp(0.9, 0.0, turn), headPitch: 0.05 }); p.eyes = blink(t, 3); p.mouth = turn > 0.5 ? 'smile' : 'o'; p.headRoll = 0.12 * Math.sin(t * 3) * turn;
    p.armA = mix(A(-0.55, 1.15, -0.1, 0), A(-0.75, 1.05, -0.15, 0), 0.5 + 0.5 * Math.sin(t * 2.4)); p.armB = turn > 0.3 ? A(-0.5, 0.3, -1.7, -0.6) : REST;
    put(mom, 'kit', p);
    // the kid in wolf ears: howls at 41.6 (37 full moons)
    const how = sstep(41.5, 41.9, t) * (1 - sstep(43.0, 43.4, t));
    const hop = t < 41.4 ? 0.13 * Math.abs(Math.sin((t - 39) * 5.2)) : 0;   // v2: hopping with excitement, then the howl
    const k = basePose(); Object.assign(k, { x: 2.15, z: -0.12, rotY: -PI / 2 + 0.35 + 0.15 * Math.sin(t * 0.6), headPitch: lerp(-0.1, -0.85, how) }); k.eyes = how > 0.5 ? 'closed' : blink(t, 5); k.mouth = how > 0.3 ? 'o' : 'smile';
    k.armA = mix(t < 41.4 ? A(-2.4, 0.5, -0.3 - 0.3 * Math.sin(t * 10), 0) : A(-0.4, 0.3, -1.6, 0.6), A(-1.2, 0.3, -2.0, 0.6), how); k.armB = mix(t < 41.4 ? A(-2.4, 0.5, -0.3 - 0.3 * Math.sin(t * 10 + 1), 0) : A(-0.4, 0.3, -1.6, -0.6), A(-1.2, 0.3, -2.0, -0.6), how); putKid('kit', k, hop);
    ears.visible = true;
    // Dad at the table laughing with his coffee
    const d = basePose(); Object.assign(d, { x: KD.table[0] - 0.2, z: KD.table[1] + 0.62, rotY: PI - 0.3 + 0.5 * sstep(41.4, 41.9, t), footFwd: 0.42, headPitch: -0.05 }); d.eyes = blink(t, 1); d.mouth = 'smile';
    void d;
    dog.g.visible = true; dog.g.position.copy(W('kit', 1.55, 0.12 * Math.abs(Math.sin(t * 5)) * (t > 42.3 && t < 43.2 ? 1 : 0), 0.45)); dog.g.rotation.y = -2.2; dog.update(t, 0); dog.setWag?.(1.6); dog.bark?.(t > 42.6 && t < 42.9 ? 1 : 0);
  }

  // ================================================================ SPACE (Earth + Moon to scale)
  const moonBody = makeMoonBody({ r: RM, seg: 96 }); space.root.add(moonBody);
  const ringNew = new THREE.Mesh(new THREE.TorusGeometry(RN, 7, 6, 1440), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.9, 1.6), transparent: true, opacity: 0, depthWrite: false, fog: false }));
  ringNew.rotation.x = PI / 2; space.root.add(ringNew);
  const ringOld = new THREE.Group(); space.root.add(ringOld);
  for (let k = 0; k < 60; k++) { const seg = new THREE.Mesh(new THREE.TorusGeometry(RO, 30, 4, 24, PI / 60), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })); seg.rotation.set(PI / 2, 0, k * PI / 30); ringOld.add(seg); }
  const glowT = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const mGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xf2ecd8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const eGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0x8fc0ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  space.root.add(mGlow, eGlow);
  space.root.traverse((o) => { if (o.isSprite && o !== mGlow && o !== eGlow && o.material.map) o.visible = false; });   // tech.js's big sun sprite: off
  const moonTh = (t) => -0.35 + (t - 43.6) * 0.16;

  // ---------------------------------------------------------------- shot state
  let cur = null, floodLv = 0;
  const moonDirRise = (() => { const c = new THREE.Vector3(20, Q + 1.7, 0.6), l = new THREE.Vector3(TD.lighthouse[0], Q + 9, TD.lighthouse[1]); const [az] = azelOf(l.sub(c)); return dirAE(az + 1.5, 3.9); })();
  const MOON_FLOOD = dirAE(48, 34), MOON_END = dirAE(22, 21);
  /** the Moon's angular diameter at time t (the switch at SW grows it over 1.2 s) */
  const angAt = (t) => lerp(ANG0, ANG1, sstep(SW, GROWN, t));

  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 1 : 0.05; studio.fill.intensity = 0.5;
    studio.camera.up.set(0, 1, 0);
    all.forEach((r) => (r.root.visible = false)); phones.forEach((p) => (p.g.visible = false)); paper.visible = false; ears.visible = false; mug.visible = false; dog.g.visible = false;
    glassesOn.forEach((g) => (g.visible = false)); crate.visible = false; skyMoon.g.visible = false; eclipse.g.visible = false; pStars.visible = S === 'plaza';
    let moonDir = null, moonAng = ANG1, P, Aim;

    // ---- per-set state
    if (S === 'town') {
      town.update(t);
      if (cam === 'title' || cam === 'rise' || cam === 'faces' || cam === 'look') {
        town.setMode('dusk'); const k = 1 + 3 * sstep(SW, GROWN, t); town.setMoon(moonDirRise, k); town.setTide(0.6, t); town.rideBoats(t, 0.6); resetCars();
        moonDir = moonDirRise; moonAng = angAt(t); town.aimAt(1, 4, 30);
        if (cam !== 'rise') townCrowd(t, cam, k);
      } else if (cam === 'flood' || cam === 'floodB') {
        town.setMode('night'); town.setMoon(MOON_FLOOD, 4); const lv = lerp(0.8, 6.0, clamp((t - 16.9) / 4.7)); town.setTide(lv, t); floodLv = lv;
        town.rideBoats(t, lv); const b = town.boats[6]; if (lv > Q + 0.4) { b.g.position.set(b.x - 1.0 * (lv - Q), lv - 0.1, b.z + 2.6 * (lv - Q)); }
        floodScene(t, lv); moonDir = MOON_FLOOD; town.aimAt(-6, 8, 30);
      } else if (cam === 'low') {
        town.setMode('morning'); town.setMoon(MOON_FLOOD, 0); town.setTide(-6.0, t); boatSpots(true); town.rideBoats(t, -6.0); boatSpots(false); resetCars(); lowScene(t); town.aimAt(2, -2, 22);
      } else {
        town.setMode('night'); town.setMoon(MOON_END, 4); town.setTide(0.2, t); town.rideBoats(t, 0.2); resetCars(); benchScene(t, cam); moonDir = MOON_END; town.aimAt(26, 3, 20);
      }
    } else if (S === 'city') {
      city.setTime({ day: 0, golden: 0, milky: 0, moon: 1.6 }); city.setPower(1); city.sky.moonDisc.visible = false; city.setShadowFocus(-12, 12, 14);
      roofScene(t);
    } else if (S === 'fundy') {
      const lv = fundyLevel(t), fz = fundyFront(t); clipF.constant = t < 29.8 ? fz : 1e5; fundy.setSea(lv, t, t < 29.8 ? fz : null); fundy.aimSun(4, -4, 36); fundyScene(t);
    } else if (S === 'plaza') {
      plazaScene(t); plaza.aimSun(3, 2, 18); plaza.lights.sun.position.copy(plaza.lights.sun.target.position).addScaledVector(SUNP, 120);
    } else if (S === 'kit') {
      kitchenScene(t);
    }

    // ---- camera (local → world)
    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S]; let fov = c.fov;
    P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (cam === 'rise' || cam === 'end2') {   // telephoto: aim at the Moon (slight drift so the frame breathes)
      const d = cam === 'rise' ? moonDirRise.clone() : MOON_END.clone();
      const [az, el] = azelOf(d), a2 = cam === 'rise' ? dirAE(az - 0.9 + 0.25 * e, el - 0.9 + 0.2 * e) : dirAE(az + 0.05 * Math.sin(t * 0.3), el - 0.05 + 0.1 * e);
      Aim = [P[0] + a2.x * 100, P[1] + a2.y * 100, P[2] + a2.z * 100];
    }
    if (cam === 'eclA') {   // in front of the group (on the Sun's side), looking back at their faces
      const g = W('plaza', 3.4, 0, 3.6);
      P = [g.x + lerp(-0.7, 0.7, e), 1.95, g.z - lerp(3.4, 2.9, e)]; Aim = [g.x, 1.6, g.z];
    }
    if (cam === 'eclB') {   // low among them, looking up at the eclipse
      const b = W('plaza', 1.6, 0, 11.0), k = sstep(0.06, 0.62, u);
      P = [b.x + lerp(-0.3, 0.3, e), 1.3, b.z]; const a2 = dirAE(lerp(3, 1.5, k), lerp(16, 41, k)); Aim = [P[0] + a2.x * 50, P[1] + a2.y * 50, P[2] + a2.z * 50]; fov = lerp(50, 28, k);
    }
    if (cam === 'orbit') {   // behind the (sunlit) Moon, Earth beyond it — both to scale; the Moon slides along its new orbit
      const S3 = new THREE.Vector3(1000, 250, 300).normalize(), th = Math.atan2(S3.z, S3.x) - 0.1 + (t - 43.6) * 0.05;
      const M = new THREE.Vector3(Math.cos(th) * RN, 0, Math.sin(th) * RN), out = M.clone().normalize(), tan = new THREE.Vector3(-out.z, 0, out.x);
      const U = lerp(-20, 300, sstep(0.04, 0.8, u)), Pp = M.clone().addScaledVector(out, lerp(2250, 1950, e)).addScaledVector(tan, lerp(-60, 60, e)).add(new THREE.Vector3(0, U, 0));   // v2: Earth rises over the limb
      const dM = M.clone().sub(Pp).normalize(), dE = Pp.clone().negate().normalize(), aimV = Pp.clone().addScaledVector(dM.clone().multiplyScalar(0.6).add(dE.clone().multiplyScalar(0.4)).normalize(), 1000);
      P = [Pp.x + o[0], Pp.y + o[1], Pp.z + o[2]]; Aim = [aimV.x + o[0], aimV.y + o[1], aimV.z + o[2]];
      moonBody.position.copy(M); moonBody.faceToward(W('space', 0, 0, 0));
      ringNew.visible = false; ringOld.visible = false; mGlow.material.opacity = 0; eGlow.material.opacity = 0;
      space.setSpin(0.4 + t * 0.03); space.stars.position.set(Pp.x, Pp.y, Pp.z);
      studio.camera.near = Math.max(1, (Pp.distanceTo(M) - RM) * 0.3);
    }
    if (cam === 'fundy') P[1] = Math.max(P[1], fundyLevel(t) + 3.2 + o[1]);   // the camera climbs ahead of the tide
    if (cam === 'floodB') { P[1] = floodLv + 0.55 + o[1]; Aim[1] = floodLv + 3.4 + o[1]; }   // the lens rides just above the rising water
    setCamera(P, Aim, fov, t, c.amp);

    // ---- the Moon in the sky (after the camera is placed)
    if (moonDir) {
      const dist = S === 'town' ? 1500 : S === 'fundy' ? 1100 : 640;
      skyMoon.setSky(studio.camera, moonDir, moonAng, dist); skyMoon.g.visible = true; skyMoon.setPhase(null);
      if (cam === 'title' || cam === 'rise' || cam === 'faces' || cam === 'look') { skyMoon.setTint(new THREE.Color(1.0, 0.86, 0.66)); skyMoon.setGain(1.5); skyMoon.setGlow(0.28 + 0.2 * sstep(SW, GROWN, t), 0xffd8a8); }
      else if (S === 'fundy') { skyMoon.setTint(new THREE.Color(0.8, 0.86, 0.95)); skyMoon.setGain(0.55); skyMoon.setGlow(0.0); }
      else { skyMoon.setTint(new THREE.Color(1, 0.98, 0.94)); skyMoon.setGain(1.45); skyMoon.setGlow(0.35, 0xdfe6ff); }
      // telephoto shots: a few gulls fly across the Moon (silhouettes = motion in a long-lens frame)
      if (cam === 'rise' || cam === 'end2') {
        const fwd = moonDir.clone().normalize(), side = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(side, fwd);
        const Dg = cam === 'rise' ? 70 : 210, half = Dg * Math.tan((fov / 2) * PI / 180) * 0.75;
        town.gulls.slice(0, cam === 'rise' ? 3 : 2).forEach((g, i) => {
          const t0 = cam === 'rise' ? 6.9 + i * 0.35 : 51.4 + i * 0.5, u = (t - t0) / (cam === 'rise' ? 2.6 : 2.2);
          const x = lerp(-1.4, 1.4, u) * half, y = (i - 1) * 0.12 * half + 0.12 * half * Math.sin(u * 3 + i);
          const p = studio.camera.position.clone().addScaledVector(fwd, Dg + i * 6).addScaledVector(side, x).addScaledVector(up, y);
          g.g.position.copy(town.root.worldToLocal(p)); g.g.lookAt(p.clone().add(side)); g.g.rotateY(-PI / 2);
          const f = Math.sin(t * 7 + i * 2); g.wl.rotation.z = 0.55 * f; g.wr.rotation.z = -0.55 * f;
        });
      }
    }
    if (S === 'city') {   // the Moon right over the downtown skyline behind the reader
      const d = new THREE.Vector3(Aim[0] - P[0], Aim[1] - P[1], Aim[2] - P[2]).normalize(); const [az, el] = azelOf(d);
      skyMoon.setSky(studio.camera, dirAE(az + 3.2, el + 6.0), ANG1, 640); skyMoon.g.visible = true; skyMoon.setPhase(null); skyMoon.setTint(new THREE.Color(1, 0.98, 0.94)); skyMoon.setGain(1.5); skyMoon.setGlow(0.4, 0xdfe6ff);
    }
    if (S === 'plaza') {
      eclipse.setSky(studio.camera, SUNP, 0.533, 1.07, 900, lerp(0.86, 1.0, sstep(32.4, 34.2, t))); eclipse.g.visible = true;
      pStars.position.copy(studio.camera.position);
    }
  }
  return { update };
}
