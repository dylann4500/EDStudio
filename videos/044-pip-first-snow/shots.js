// VIDEO 044 — "What if Pip saw snow for the first time?"  (Pip ep. 7 · lane 3 @ed._.sims · storybook tone, a "first")
// 68.8 s, 17 shots, two places: the home base (engine/sets/livingroom.js {home:true}, parked at x = 2000) and the family's
// front yard = suburb.js lot 0 (x −32) dressed for the first snow by the NEW engine/winter.js (dressWinter). A bright white
// morning. Pip sees snow through the window (nose on the glass); Mia opens the door and he blasts out into a drift deeper
// than he is (only his ears show, swimming through it); he catches flakes on his tongue (HUD SNOWFLAKES CAUGHT 0 → 5), one
// lands on his nose (achoo); snow angel + "snow corgi", snow zoomies; Bean shivers in a sweater on the sidewalk and Pip gives
// him his scarf; the kids next door start a snowball fight and Pip "catches" every snowball (each counted: 1 snowball ≈ a
// million snow crystals, so the HUD rolls to 6,000,005) and comes away with a white beard; they build a snowman, Pip steals
// the carrot nose, gives it back (mostly — one bite missing); Mom wipes the sidewalk salt off his paws; he sleeps by the
// window in a blanket while the snowman's stick arm waves in the wind. No dog is ever hurt; carrots are a safe dog snack.
// Event times live in story.json → "pip" so make_cues.py syncs the foley to the same numbers.
//
// Sources (checked Oct 29, 2026):
//  - ASPCA, "Tips for Safely Using De-Icers Around Your Canine" (Feb 16, 2023): rock salt "can be harsh on dogs' paws, cause
//    irritation" — "wipe your dog's paws after a walk". aspca.org/news/tips-safely-using-de-icers-around-your-canine
//  - Hill's Pet, "Why do dogs eat snow?": a little fresh, clean snow is fine; avoid snow near salted roads/sidewalks.
//    hillspet.com/dog-care/behavior-appearance/why-do-dogs-eat-snow
//  - K. Libbrecht (Caltech, snowcrystals.com): a typical small snow crystal contains ~10^18 water molecules. With a water
//    molecule at 2.99e-26 kg that is ~3e-8 kg (0.03 mg) per crystal, so a packed 6 cm snowball (113 cm³ × ~0.3 g/cm³ ≈ 34 g)
//    holds ~1.1 million crystals → the HUD line "1 SNOWBALL ≈ 1,000,000 SNOW CRYSTALS" (our arithmetic, rounded).
//  - AKC, "Can Dogs Eat Carrots?": a safe, low-calorie snack (akc.org/expert-advice/nutrition/can-dogs-eat-carrots).
//  Every other HUD number is a story number (Pip's height, the drift, Bean's 4 lb).
//
// Shot list (seconds)                    | where            | what happens
//  0.0– 3.4 thumb   7:41 AM               | outside window   | the question over Pip's face behind the frosty glass, flakes past the lens
//  3.4– 7.8 window                        | inside, window   | paws on the sill; head tilts at a flake on the glass; boop — nose fog circle
//  7.8–11.4 door                          | the porch        | Mia opens the door, Pip (red scarf) blasts out and leaps off the steps
// 11.4–15.4 drift                         | the drift        | POOF: only his ears show, they swim through the drift; he pops out in a snow hat
// 15.4–19.8 tongueA (0 → 3)               | the front yard   | low lens up at Pip, tongue out, three crystals land on it
// 19.8–23.2 tongueB (→ 5)                 | the front yard   | hops + spins after flakes; Mia beside him, mouth open at the sky
// 23.2–27.0 sneeze                        | the front yard   | a big flake on his nose, ah… ah… ACHOO (snow puff, he plops back)
// 27.0–31.0 angel                         | from above       | Mia's snow angel; Pip rolls on his back = a snow corgi
// 31.0–34.8 zoom                          | the front yard   | snow zoomies round Mia; Mom + Dad laughing on the porch with mugs
// 34.8–38.8 bean                          | the sidewalk     | Mrs. Rosa + Bean in a pink sweater, shivering hard; Pip trots over
// 38.8–43.0 scarf                         | the sidewalk     | Pip tugs his scarf off, drapes it on Bean; Bean stops shivering, licks him
// 43.0–46.6 sbA (→ 1,000,005)             | the yard         | Leo + Zoe behind a snow fort throw; Pip leaps and catches one (POOF)
// 46.6–50.6 sbB (→ 6,000,005)             | the yard         | close: catch, catch, catch… the snow beard grows; he turns to us, bearded
// 50.6–55.2 snowman                       | by the house     | time-lapse stack; Dad sets the carrot; Pip leaps and steals it, runs
// 55.2–58.6 give                          | the snowman      | Mia lifts him up, he puts the carrot back (one bite missing). "Mostly."
// 58.6–61.4 paws    8:40 AM               | the hall         | Mom wipes the salt off his paws with a towel, Mia unwinds her scarf
// 61.4–68.8 sleep   11:20 AM              | the window seat  | asleep in a blanket, Mia beside him; outside the snowman waves; end card 64.6
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeBunny, makeMug } from '@engine/props.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { makePip, makeMia, makeMom, makeDad, poseScaled, pulseAt } from '@engine/pip.js';
import { makeBreed } from '@engine/dogbreeds.js';
import { dressWinter, makeSnowfall, makeHeroFlake, makeDrift, makeSnowman, makeSnowball, winterWear, makeDogScarf, makeDogSweater, makeSnowBeard, snowViewTex, snowTex } from '@engine/winter.js';

const PI = Math.PI;
const PIPS = 0.92, KIDS = 0.66;
const LX = 2000;                       // the living room is parked at x + 2000
const SY = 0.1, SWY = 0.15;            // snow top on the lawn / on the sidewalk
// yard spots (suburb world coordinates; lot 0 = the family's house, front door at x −34.2, porch z −9…−7, top 0.33)
const DOOR = [-34.2, -8.7], PORCH_EDGE = [-34.1, -7.15], DRIFT = [-33.25, -5.95];
const PIPY = [-31.2, -4.8];            // where he catches flakes (faces +z, toward the street)
const MIA_K = [-30.62, -4.72];         // Mia kneeling beside him
const ANGEL = [-30.25, -5.3];           // Mia's head end of the angel (she lies with her feet toward +z)
const CORGI = [-30.85, -4.7];
const ZC = [-30.2, -4.6], ZR = 0.95;   // the zoomies circle (Mia sits in the middle)
const ROSA0 = [-25.6, -0.95], ROSA1 = [-30.2, -0.95];
const PIP_SW = [-31.0, -1.28], BEAN_SW = [-30.48, -1.22];
const FORT = [-28.3, -4.75], LEO = [-27.9, -4.35], ZOE = [-27.95, -5.2], PIP_SB = [-29.35, -4.65], MIA_SB = [-30.35, -5.45];
const SNOWMAN = [-29.3, -6.45];
const PORCH = { mom: [-34.85, -7.6], dad: [-33.55, -7.55] };
// living room spots (local; + LX in world)
const SEAT = { x0: -0.6, x1: 0.8, z0: -2.78, z1: -2.33, top: 0.64 };
const PIP_WIN = [0.1, -2.56];
const HALL = { pip: [-2.85, 1.05], mom: [-2.4, 0.8], mia: [-3.75, 1.45] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb' },
  { t0: 3.4, t1: 7.8, cam: 'window' },
  { t0: 7.8, t1: 11.4, cam: 'door' },
  { t0: 11.4, t1: 15.4, cam: 'drift' },
  { t0: 15.4, t1: 19.8, cam: 'tongueA' },
  { t0: 19.8, t1: 23.2, cam: 'tongueB' },
  { t0: 23.2, t1: 27.0, cam: 'sneeze' },
  { t0: 27.0, t1: 31.0, cam: 'angel' },
  { t0: 31.0, t1: 34.8, cam: 'zoom' },
  { t0: 34.8, t1: 38.8, cam: 'bean' },
  { t0: 38.8, t1: 43.0, cam: 'scarf' },
  { t0: 43.0, t1: 46.6, cam: 'sbA' },
  { t0: 46.6, t1: 50.6, cam: 'sbB' },
  { t0: 50.6, t1: 55.2, cam: 'snowman' },
  { t0: 55.2, t1: 58.6, cam: 'give' },
  { t0: 58.6, t1: 61.4, cam: 'paws' },
  { t0: 61.4, t1: 80, cam: 'sleep' },
];
const c = (p0, p1, a0, a1, fov, amp = 0.003, room = false) => ({ p: [p0, p1], a: [a0, a1], fov, amp, room });
export const CAMS = {
  thumb:   c([0.1, 1.1, -3.8], [0.1, 1.1, -3.72], [0.1, 1.13, -2.7], [0.1, 1.13, -2.7], 40, 0.0015, true),
  window:  c([0.27, 1.13, -4.0], [0.24, 1.11, -3.9], [0.2, 1.1, -2.6], [0.2, 1.1, -2.6], 44, 0.002, true),
  door:    c([-33.0, 0.5, -5.0], [-33.1, 0.45, -5.15], [-34.1, 0.95, -8.3], [-33.8, 0.55, -6.8], 50),
  drift:   c([-32.45, 0.62, -4.6], [-32.5, 0.6, -4.7], [-33.2, 0.4, -6.0], [-33.2, 0.42, -6.0], 46),
  tongueA: c([-30.6, 0.4, -4.18], [-31.42, 0.46, -4.0], [-31.3, 0.48, -4.8], [-31.2, 0.5, -4.8], 44, 0.002),
  tongueB: c([-30.95, 0.5, -3.25], [-30.85, 0.5, -3.3], [-30.9, 0.5, -4.75], [-30.9, 0.5, -4.75], 50),
  sneeze:  c([-31.18, 0.36, -4.08], [-31.19, 0.36, -4.14], [-31.2, 0.36, -4.8], [-31.2, 0.36, -4.8], 44, 0.0015),
  angel:   c([-30.55, 2.5, -4.0], [-30.55, 2.25, -4.1], [-30.55, 0.0, -4.85], [-30.55, 0.0, -4.85], 50, 0.002),
  zoom:    c([-29.0, 0.5, -2.9], [-29.2, 0.5, -2.95], [-30.3, 0.55, -5.0], [-30.35, 0.55, -5.0], 54),
  bean:    c([-32.25, 0.42, -0.95], [-32.2, 0.42, -0.95], [-30.0, 0.62, -1.1], [-30.0, 0.6, -1.1], 54),
  scarf:   c([-30.95, 0.4, -2.65], [-30.7, 0.34, -2.2], [-30.75, 0.36, -1.25], [-30.75, 0.34, -1.25], 46, 0.002),
  sbA:     c([-30.75, 0.85, -3.75], [-30.2, 0.45, -4.05], [-28.3, 0.62, -4.75], [-28.3, 0.6, -4.75], 52),
  sbB:     c([-28.55, 0.4, -3.95], [-28.6, 0.4, -4.0], [-29.35, 0.45, -4.65], [-29.35, 0.45, -4.65], 46, 0.002),
  snowman: c([-29.3, 0.8, -3.75], [-29.35, 0.72, -3.95], [-29.3, 0.62, -6.3], [-29.3, 0.62, -6.3], 52),
  give:    c([-28.95, 1.0, -4.45], [-28.95, 1.0, -4.55], [-29.0, 0.88, -6.4], [-29.0, 0.88, -6.4], 48, 0.002),
  paws:    c([-2.72, 0.78, 2.75], [-2.74, 0.75, 2.66], [-2.65, 0.52, 0.9], [-2.65, 0.52, 0.9], 50, 0.002, true),
  sleep:   c([0.36, 1.08, -1.15], [0.36, 1.0, -1.5], [0.36, 0.88, -2.7], [0.34, 0.85, -2.7], 52, 0.0015, true),
  lineup:  c([-31, 0.6, -2.6], [-31, 0.6, -2.6], [-31, 0.35, -4.6], [-31, 0.35, -4.6], 50, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const MUG_B = A(-0.75, 0.1, -1.6, -0.6), MUG_UP = A(-1.0, 0.1, -1.95, -0.6);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);
const CHEER_A = A(-0.4, 2.5, -0.5, 0), CHEER_B = A(-0.4, 2.5, -0.5, 0);
const CLAP_A = A(-1.1, 0.1, -1.1, 0.6), CLAP_B = A(-1.1, 0.1, -1.1, -0.6);
const REACH_A = A(-1.25, 0.12, -0.35, 0.3), REACH_B = A(-1.25, 0.12, -0.35, -0.3);
const HOLD_A = A(-1.05, 0.2, -0.85, 0.4), HOLD_B = A(-1.05, 0.2, -0.85, -0.4);
const LEASH_B = A(-0.45, 0.12, -0.5, -0.2);
const THROW_UP = A(-2.7, 0.2, -0.9, 0), THROW_FWD = A(-1.1, 0.15, -0.1, 0);
const PET_A = A(-1.0, 0.25, -0.5, 0.3), PET_B = A(-1.0, 0.25, -0.5, -0.3);
const TOWEL_A = A(-1.15, 0.18, -0.45, 0.4), TOWEL_B = A(-1.15, 0.18, -0.45, -0.4);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

/** instanced bits (snow clumps): reset() per frame, add(p, s, rx, ry), commit() */
function makeBits(scene, n, geo, m) {
  const mesh = new THREE.InstancedMesh(geo, m, n); mesh.frustumCulled = false; mesh.castShadow = false; mesh.count = 0; scene.add(mesh);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), E = new THREE.Euler();
  let used = 0;
  return {
    mesh, reset() { used = 0; },
    add(p, s = 1, rx = 0, ry = 0) { if (used >= n || s <= 0) return; E.set(rx, ry, 0); Q.setFromEuler(E); S.setScalar(s); M.compose(p, Q, S); mesh.setMatrixAt(used++, M); },
    commit() { mesh.count = used; mesh.instanceMatrix.needsUpdate = true; },
  };
}
/** a ballistic burst from origin o (deterministic per seed) */
function burst(bits, t, t0, o, n, seed, { speed = 1.4, up = 1.6, life = 0.85, g = 9.8, size = 1, dx = 0, dz = 0, spin = 0, floor = 0.004 } = {}) {
  if (t < t0 || t > t0 + life + 0.2) return;
  const R = rng(seed), dt = t - t0, v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = R() * PI * 2, sp = speed * (0.35 + 0.65 * R()), u = up * (0.45 + 0.75 * R()), delay = R() * 0.1, rr = R();
    const tt = dt - delay; if (tt < 0 || tt > life) continue;
    v.set(o.x + (Math.cos(a) * sp + dx) * tt, o.y + u * tt - 0.5 * g * tt * tt, o.z + (Math.sin(a) * sp + dz) * tt);
    if (v.y < floor) continue;
    bits.add(v, size * (1 - 0.4 * tt / life), spin * tt * (1 + rr), a);
  }
}

export async function build(studio, story) {
  const { scene, setCamera, renderer } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- sets
  const sub = buildSuburb(studio, { poleClear: [-34, -29, -16, 4.5, 58] });
  const win = dressWinter(studio, sub, {});
  const liv = buildLivingRoom(studio, { home: true }); liv.root.position.x = LX;
  liv.setMode('morning');
  const snowView = snowViewTex();
  liv.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 9 && o.geometry.parameters.height === 4.5) { o.material.map = snowView; o.material.needsUpdate = true; } });
  liv.lights.sun.color.set(0xfff4e8); liv.lights.hemi.color.set(0xf2f4ff);
  const W = (x, y, z) => new THREE.Vector3(x + LX, y, z);

  // living room extras: window seat + cushion, glass with frost, the outside facade + snowy ground + falling snow + a snowman
  const lr = liv.root, Dz0 = -2.8;
  mk(new THREE.BoxGeometry(8.2, 2.75, 0.12), mat(0xe9dcc4, 0.9), lr, -1, 1.375, 2.92);   // the room's front wall (only room shots looking +z see it)
  const seatM = mat(0xf4efe6, 0.7);
  mk(new THREE.BoxGeometry(SEAT.x1 - SEAT.x0, SEAT.top - 0.08, SEAT.z1 - SEAT.z0), seatM, lr, (SEAT.x0 + SEAT.x1) / 2, (SEAT.top - 0.08) / 2, (SEAT.z0 + SEAT.z1) / 2);
  mk(new RoundedBoxGeometry(SEAT.x1 - SEAT.x0 - 0.04, 0.09, SEAT.z1 - SEAT.z0 - 0.02, 3, 0.04), mat(0x5f8f8a, 0.95), lr, (SEAT.x0 + SEAT.x1) / 2, SEAT.top - 0.04, (SEAT.z0 + SEAT.z1) / 2);
  for (const [px, c] of [[-0.45, 0xe2574c], [0.66, 0xf2c14e]]) { const p = mk(new THREE.SphereGeometry(0.13, 14, 10), mat(c, 0.95), lr, px, SEAT.top + 0.09, SEAT.z0 + 0.12); p.scale.set(1, 1, 0.45); p.rotation.z = px * 0.4; }
  const frostT = canvasTex(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h, e = Math.min(x, y, w - x, h - y) / w; if (R() > Math.max(0, 0.9 - e * 9)) continue; const r = 3 + R() * 14; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } });
  for (const [x0, x1] of [[-0.7, 0.4], [0.4, 1.5]]) { const gl = mk(new THREE.PlaneGeometry(x1 - x0 - 0.04, 1.36), new THREE.MeshBasicMaterial({ map: frostT, transparent: true, depthWrite: false, opacity: 0.9 }), lr, (x0 + x1) / 2, 1.55, Dz0 - 0.02); gl.castShadow = false; }
  const fogT = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(240,246,255,.85)'); gr.addColorStop(0.6, 'rgba(240,246,255,.5)'); gr.addColorStop(1, 'rgba(240,246,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const noseFog = mk(new THREE.PlaneGeometry(0.09, 0.07), new THREE.MeshBasicMaterial({ map: fogT, transparent: true, depthWrite: false, opacity: 0 }), lr, PIP_WIN[0], 0.92, Dz0 - 0.025);
  const glassFlake = makeHeroFlake(0.03); glassFlake.position.set(PIP_WIN[0] + 0.07, 1.0, Dz0 - 0.04); lr.add(glassFlake);
  const sid = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b9cfd6'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 3); }, [3, 3]);
  const sidM = new THREE.MeshStandardMaterial({ map: sid, roughness: 0.9 }), trimM = mat(0xf6f1e6, 0.6), capM = mat(0xf6f9fd, 0.8);
  const fz = Dz0 - 0.14;
  for (const [w, h, x, y] of [[3.3, 3.2, -2.35, 1.4], [3.0, 3.2, 3.0, 1.4], [2.2, 0.85, 0.4, 0.425], [2.2, 0.95, 0.4, 2.725]]) mk(new THREE.BoxGeometry(w, h, 0.04), sidM, lr, x, y, fz);
  for (const [w, h, x, y] of [[2.42, 0.1, 0.4, 2.3], [0.1, 1.5, -0.75, 1.55], [0.1, 1.5, 1.55, 1.55]]) mk(new THREE.BoxGeometry(w, h, 0.08), trimM, lr, x, y, fz - 0.03);
  mk(new THREE.BoxGeometry(2.5, 0.07, 0.2), trimM, lr, 0.4, 0.82, fz - 0.08); mk(new RoundedBoxGeometry(2.46, 0.06, 0.2, 2, 0.025), capM, lr, 0.4, 0.875, fz - 0.08);
  const outGround = mk(new THREE.PlaneGeometry(14, 5), new THREE.MeshStandardMaterial({ map: snowTex([6, 2]), roughness: 0.85 }), lr, 0.4, 0.0, -5.3); outGround.rotation.x = -PI / 2;
  for (const [bx, bz, r] of [[-1.3, -3.4, 0.45], [2.3, -3.35, 0.5]]) { const b = mk(new THREE.IcosahedronGeometry(r, 1), mat(0x3f6a4c, 0.85), lr, bx, r * 0.8, bz); mk(new THREE.IcosahedronGeometry(r, 1), capM, b, 0, r * 0.42, 0).scale.set(1.06, 0.62, 1.06); }
  const winSnow = makeSnowfall(lr, { n: 700, box: [5.5, 3.2, 2.0], speed: 0.55, size: 0.03, seed: 21 });
  const winSnow2 = makeSnowfall(lr, { n: 140, box: [5.5, 3.2, 2.0], speed: 0.45, size: 0.06, seed: 22, opacity: 0.85 });
  const manWin = makeSnowman({ seed: 31 }); manWin.g.position.set(0.28, 0.18, -3.75); manWin.g.rotation.y = 0.15; lr.add(manWin.g);
  const moundW = makeDrift({ r: 0.7, h: 0.22, seed: 8 }); moundW.position.set(0.28, 0, -3.75); lr.add(moundW);
  // hall: doormat, towel, boots by the shoe bench
  const mat0 = mk(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshStandardMaterial({ map: canvasTex(256, 170, (g, w, h) => { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a4030'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = '#5a4030'; g.font = 'bold 54px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HELLO', w / 2, h / 2 + 3); }), roughness: 1 }), lr, HALL.pip[0], 0.005, HALL.pip[1] + 0.05); mat0.rotation.x = -PI / 2;
  for (const [bx, bz, c] of [[-3.55, 1.85, 0xd2483f], [-3.42, 1.9, 0xd2483f], [-2.35, 1.95, 0x3d4a66], [-2.2, 1.85, 0x3d4a66]]) { const b = mk(new RoundedBoxGeometry(0.11, 0.16, 0.24, 2, 0.04), mat(c, 0.6), lr, bx, 0.08, bz); b.rotation.y = 0.3; mk(new THREE.BoxGeometry(0.09, 0.02, 0.2), capM, lr, bx, 0.165, bz).rotation.y = 0.3; }
  const towel = new THREE.Group(); scene.add(towel);
  { const tm = new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#7fb8d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f1ea'; g.fillRect(0, 20, w, 12); g.fillRect(0, 96, w, 12); }), roughness: 1 }); const tg = new THREE.SphereGeometry(0.1, 14, 10); const t1 = mk(tg, tm, towel); t1.scale.set(1.3, 0.55, 0.9); }

  // ---------------------------------------------------------------- dogs
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const bean = makeBreed('chihuahua', { name: 'BEAN', seed: 41, collar: 0xe86aa0, fur: 0x2e2826, white: 0xf3e6d4, cream: 0xc98a4a, earInner: 0xe8a0a0 }); scene.add(bean.g);
  const sweater = makeDogSweater(bean, { color: 0xe86aa0, stripe: '#f7d4e2' });
  const scarfPip = makeDogScarf({ color: 0xd2483f }); pip.collar.add(scarfPip);
  const scarfBean = makeDogScarf({ color: 0xd2483f }); bean.collar.add(scarfBean); 
  const scarfCarry = new THREE.Group(); pip.anchors.mouth.add(scarfCarry);
  { const sm = scarfPip.children[0].material; const b = mk(new RoundedBoxGeometry(0.05, 0.13, 0.02, 2, 0.008), sm, scarfCarry, 0, -0.05, 0.0); b.rotation.x = 0.2; mk(new RoundedBoxGeometry(0.045, 0.1, 0.02, 2, 0.008), sm, scarfCarry, 0.025, -0.04, 0.01).rotation.z = 0.5; }
  const snowFace = makeSnowBeard(pip);
  const bunny = makeBunny(); bunny.scale.setScalar(1.25); scene.add(bunny);

  // ---------------------------------------------------------------- people
  const mia = makeMia({ outfit: 'day' }); scene.add(mia.root);
  const miaW = winterWear(mia, { coat: 0xe58fa6, pants: 0x4f5f8a, hat: 0xf2c14e, pom: 0xf4f1ea, scarf: 0x58b3a8, mitten: 0xf2c14e, boots: 0x8a4a5a });
  const mom = makeMom({ outfit: 'day' }); scene.add(mom.root);
  const momW = winterWear(mom, { coat: 0x3f7d8c, hat: 0xe2574c, scarf: 0xf2c14e, stripe: '#e2574c', mitten: null, boots: 0x5a3a2a });
  const dad = makeDad({ outfit: 'day' }); scene.add(dad.root);
  const dadW = winterWear(dad, { coat: 0x2f4f73, hat: 0x3f6a3a, pom: 0xf2c14e, scarf: 0xd2483f, mitten: 0x3f6a3a, boots: 0x4a3a30 });
  const rosa = makePerson({ skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0xa77bd1, pants: 0x5a3a5a, shoes: 0x8a5a5a }); rosa.kid = 1; scene.add(rosa.root);
  winterWear(rosa, { coat: 0xa77bd1, hat: 0xe86aa0, pom: 0xe86aa0, scarf: 0xe86aa0, stripe: '#f7d4e2', mitten: 0xe86aa0, boots: 0x6a4a3a });
  const mkKid = (o) => { const P = makePerson({ headR: 0.17, ...o }); P.root.scale.setScalar(KIDS); P.kid = KIDS; scene.add(P.root); return P; };
  const leo = mkKid({ skin: 0xc68a62, hair: 0x2a1a12, hairStyle: 'short', top: 0x3d7bd9, pants: 0x3a3f4a, shoes: 0x222222 });
  winterWear(leo, { hat: 0xd2483f, scarf: 0xf2c14e, stripe: '#d2483f', mitten: 0xd2483f, boots: 0x2a2a2a });
  const zoe = mkKid({ skin: 0x8d5a3b, hair: 0x1a1210, hairStyle: 'bob', top: 0x6fa84f, pants: 0x4a3a5a, shoes: 0x222222 });
  winterWear(zoe, { hat: 0xa77bd1, pom: 0xf2c14e, scarf: 0xe2574c, mitten: 0xa77bd1, boots: 0x6a3a4a });
  const CAST = [mia, mom, dad, rosa, leo, zoe];
  const mugs = [makeMug(0xd2483f), makeMug(0xf2c14e)]; mugs.forEach((m) => scene.add(m));
  const leash = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xe86aa0, 0.6)); scene.add(leash);

  // ---------------------------------------------------------------- yard props
  const drift = makeDrift({ r: 0.78, h: 0.36, seed: 3 }); drift.position.set(DRIFT[0], 0.06, DRIFT[1]); scene.add(drift);
  for (const [x, z, r, h, s] of [[-36.9, -6.9, 0.9, 0.3, 4], [-27.0, -7.6, 1.1, 0.32, 6], [-24.6, -3.1, 0.8, 0.26, 7], [-38.5, -3.0, 0.9, 0.3, 8]]) { const d = makeDrift({ r, h, seed: s }); d.position.set(x, 0.06, z); scene.add(d); }
  const fort = new THREE.Group(); fort.position.set(FORT[0], SY, FORT[1]); fort.rotation.y = -PI / 2; scene.add(fort);
  { const R = rng(4); for (let i = 0; i < 9; i++) { const b = makeSnowball(0.17 + R() * 0.03); b.position.set((i % 5 - 2) * 0.27 + (i >= 5 ? 0.13 : 0), i >= 5 ? 0.42 : 0.15, 0); b.scale.set(1.1, 0.9, 0.9); fort.add(b); } }
  const pile = new THREE.Group(); scene.add(pile); for (let i = 0; i < 6; i++) { const b = makeSnowball(0.05); b.position.set(FORT[0] - 0.25 + (i % 3) * 0.1, SY + 0.04 + Math.floor(i / 3) * 0.08, FORT[1] + 0.5 + (i % 2) * 0.08); pile.add(b); }
  const man = makeSnowman({ seed: 31 }); man.g.position.set(SNOWMAN[0], SY - 0.02, SNOWMAN[1]); scene.add(man.g);
  const carrotHeld = new THREE.Group(); scene.add(carrotHeld);
  const carrotM = man.carrot.material;
  const cHeld = mk(new THREE.ConeGeometry(0.022, 0.13, 12), carrotM, carrotHeld); cHeld.rotation.x = PI / 2;
  const balls = Array.from({ length: 8 }, () => { const b = makeSnowball(0.05); b.visible = false; scene.add(b); return b; });
  // angel imprints (a soft shadow in the snow that grows as she sweeps)
  const angelT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = 'rgba(120,150,195,.55)'; g.beginPath(); g.ellipse(w / 2, h * 0.2, 26, 30, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w / 2, h * 0.28); for (let a = -1.9; a <= 1.9; a += 0.1) g.lineTo(w / 2 + Math.sin(a) * 118, h * 0.42 - Math.cos(a) * 70); g.closePath(); g.fill(); g.beginPath(); g.moveTo(w / 2 - 30, h * 0.4); g.lineTo(w / 2 - 95, h * 0.97); g.lineTo(w / 2 + 95, h * 0.97); g.lineTo(w / 2 + 30, h * 0.4); g.fill(); });
  const angel = mk(new THREE.PlaneGeometry(1.35, 1.35), new THREE.MeshBasicMaterial({ map: angelT, transparent: true, depthWrite: false, opacity: 0 }), scene, ANGEL[0], SY + 0.004, ANGEL[1] + 0.55); angel.rotation.x = -PI / 2;
  const corgiT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = 'rgba(120,150,195,.5)'; g.beginPath(); g.ellipse(w / 2, h * 0.55, 40, 30, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, h * 0.22, 22, 20, 0, 0, 7); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * 46, h * 0.55, 16 + 6 * Math.random(), 30, s * 0.5, 0, 7); g.fill(); g.beginPath(); g.moveTo(w / 2 + s * 10, h * 0.12); g.lineTo(w / 2 + s * 24, h * 0.0); g.lineTo(w / 2 + s * 26, h * 0.16); g.fill(); } });
  const corgiImp = mk(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: corgiT, transparent: true, depthWrite: false, opacity: 0 }), scene, CORGI[0], SY + 0.004, CORGI[1]); corgiImp.rotation.x = -PI / 2;
  // paw-print trail from the drift into the yard
  const pawT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = 'rgba(120,150,195,.6)'; g.beginPath(); g.ellipse(32, 40, 12, 10, 0, 0, 7); g.fill(); for (const [x, y] of [[16, 22], [28, 15], [40, 15], [50, 23]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } });
  const pawM = new THREE.MeshBasicMaterial({ map: pawT, transparent: true, depthWrite: false, opacity: 0.8 });
  { const R = rng(19); for (let i = 0; i < 26; i++) { const u = i / 25, x = lerp(-32.6, -29.0, u) + Math.sin(u * 9) * 0.35, z = lerp(-5.6, -4.3, u) + Math.cos(u * 7) * 0.4; const p = mk(new THREE.PlaneGeometry(0.06, 0.06), pawM, scene, x + (i % 2) * 0.06, SY + 0.003, z); p.rotation.set(-PI / 2, 0, R() * 6); } }

  // ---------------------------------------------------------------- particles
  const fall = makeSnowfall(scene, { n: 3200, box: [12, 7, 12], speed: 0.7, size: 0.028, seed: 3 });
  const fallBig = makeSnowfall(scene, { n: 520, box: [12, 7, 12], speed: 0.55, size: 0.055, seed: 4, opacity: 0.9 });
  const heroFlakes = Array.from({ length: 6 }, () => { const f = makeHeroFlake(0.035); scene.add(f); return f; });
  const clumps = makeBits(scene, 420, new THREE.IcosahedronGeometry(0.018, 0), mat(0xfbfdff, 0.8));
  const puffTex = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const puffs = Array.from({ length: 50 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); s.visible = false; s.renderOrder = 5; scene.add(s); return s; });
  let puffN = 0;
  const puff = (x, y, z, age, life = 0.9, size = 0.5, seed = 0) => {
    if (age < 0 || age > life || puffN >= puffs.length) return;
    const s = puffs[puffN++], u = age / life, R = rng(seed);
    s.visible = true; s.position.set(x + (R() - 0.5) * 0.3 * (1 + u), y + 0.2 * u, z + (R() - 0.5) * 0.3 * (1 + u));
    s.scale.setScalar(size * (0.5 + u)); s.material.opacity = 0.85 * (1 - u) * smooth(age / 0.06);
  };
  const poof = (t, t0, x, y, z, seed, size = 0.5, n = 50) => { burst(clumps, t, t0, new THREE.Vector3(x, y, z), n, seed, { speed: 1.3, up: 1.8, life: 0.75, size: 1.1, floor: SY }); for (let k = 0; k < 5; k++) puff(x, y, z, t - t0 - k * 0.04, 0.9, size, seed * 10 + k); };

  // ---------------------------------------------------------------- helpers
  const put = (P, p, floor = 0) => { if (P.kid && P.kid !== 1) poseScaled(P, p, floor); else { applyPose(P, p); P.root.position.y = floor + (p.y || 0); } };
  const person = (P, o, floor = 0) => { const p = basePose(); Object.assign(p, o); P.root.visible = true; P.root.rotation.set(0, 0, 0); put(P, p, floor); return p; };
  const placeD = (d, x, z, rotY, st, t, y = 0) => { d.g.visible = true; d.g.position.set(x, y, z); d.g.rotation.set(0, rotY, 0); d.update(t, st); };
  const pipAt = (x, z, rotY, st, t, y = SY - 0.03) => placeD(pip, x, z, rotY, st, t, y);
  const mouthW = () => { pip.g.updateMatrixWorld(true); return pip.anchors.mouth.getWorldPosition(new THREE.Vector3()); };
  // a rig lying on its back: carrier rotated so the body lies along the ground, head toward `head` (rad, 0 = −z), face up
  const carriers = new Map();
  const lieBack = (P, x, z, head, o, y = SY) => {
    let cg = carriers.get(P); if (!cg) { cg = new THREE.Group(); cg.rotation.order = 'YXZ'; scene.add(cg); carriers.set(P, cg); }
    if (P.root.parent !== cg) cg.add(P.root);
    cg.visible = true; cg.position.set(x, y + 0.075, z); cg.rotation.set(-PI / 2, head, 0);
    const p = basePose(); Object.assign(p, o); P.root.visible = true; P.root.rotation.set(0, 0, 0);
    applyPose(P, { ...p, x: 0, z: 0, rotY: 0 }); P.root.position.set(0, 0, 0);
    return p;
  };
  const standUp = (P) => { if (P.root.parent !== scene) scene.add(P.root); };
  const mugIn = (m, P, side) => { P.root.updateMatrixWorld(true); m.visible = true; m.position.copy(handWorld(P, side)).add(new THREE.Vector3(0, -0.04, 0)); m.rotation.set(0, 0.5, 0); };
  function setLeash(a, b) {
    const mid = a.clone().lerp(b, 0.5); mid.y -= 0.22;
    leash.geometry.dispose(); leash.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 14, 0.006, 5, false); leash.visible = true;
  }
  // hero flakes: falling along a lazy zigzag into a target point, gone at arrival
  function heroFall(t, f, tArr, target, { dur = 1.6, from = [0.12, 0.7, 0.05] } = {}) {
    const u = (t - (tArr - dur)) / dur;
    if (u < 0 || u > 1) { f.visible = false; return; }
    f.visible = true; const e = 1 - (1 - u) * (1 - u) * 0.3;
    f.position.set(target.x + from[0] * (1 - u) + 0.04 * Math.sin(u * 9) * (1 - u), target.y + from[1] * (1 - e) * (1 - u) * 1.4 + from[1] * (1 - u) * 0.0, target.z + from[2] * (1 - u));
    f.position.y = target.y + from[1] * (1 - u);
    f.material.opacity = smooth(u / 0.15) * (1 - smooth((u - 0.92) / 0.08));
    f.material.rotation = t * 1.6;
  }

  // ---------------------------------------------------------------- ambient: the porch parents + the neighbor kids next door
  function ambientYard(t, cam) {
    if (t < 43) {   // Leo + Zoe in the yard next door (x > −24), rolling a snowball, waving
      const k = (t * 0.9) % 1;
      person(leo, { x: -22.6, z: -5.0, rotY: -1.2, crouch: 0.2, lean: 0.45, eyes: blink(t, 5), smile: 1, armA: REACH_A, armB: REACH_B }, SY);
      person(zoe, { x: -21.8, z: -4.2, rotY: -1.6, eyes: blink(t, 6), smile: 1, armA: REST, armB: mixArm(REST, CHEER_B, 0.5 + 0.5 * Math.sin(t * 5)) }, SY);
      void k;
    }
    if (['tongueB'].includes(cam)) {
      const ch = (t * 2.2) % 1 < 0.5;
      person(mom, { x: PORCH.mom[0], z: PORCH.mom[1], rotY: 0.35, eyes: blink(t, 4), smile: 1, armA: REST, armB: mixArm(MUG_B, MUG_UP, pulseAt(t, [[33.0, 0.6], [45, 0.6]], 0.6)), mouth: cam === 'zoom' && ch ? 'o' : null }, win.porchTop);
      person(dad, { x: PORCH.dad[0], z: PORCH.dad[1], rotY: -0.3, eyes: blink(t, 3), smile: 1, glasses: true, armA: A(-0.75, 0.1, -1.6, 0.6), armB: cam === 'zoom' ? CHEER_B : REST, mouth: cam === 'zoom' && !ch ? 'o' : null }, win.porchTop);
      mugIn(mugs[0], mom, 1); mugIn(mugs[1], dad, -1);
    }
  }

  // ---------------------------------------------------------------- update
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', t0: 200, t1: 300 } : shotAt(t), cam = shot.cam;
    const C = CAMS[cam], room = C.room;
    studio.camera.far = room ? 60 : 420; studio.camera.near = 0.03; studio.fill.intensity = story.look.fill; studio.camera.updateProjectionMatrix();
    sub.root.visible = !room; liv.root.visible = room;
    scene.fog = room ? null : win.fog;
    const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    let P = C.p[0].map((v, i) => lerp(v, C.p[1][i], e));
    const Aim = C.a[0].map((v, i) => lerp(v, C.a[1][i], e));
    if (room) { P[0] += LX; Aim[0] += LX; }
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };

    // reset
    CAST.forEach((R) => { standUp(R); R.root.visible = false; });
    carriers.forEach((cg) => (cg.visible = false));
    [bunny, towel, leash, carrotHeld, ...mugs, ...balls, ...heroFlakes].forEach((g) => (g.visible = false));
    if (bunny.parent !== scene) scene.add(bunny);
    bunny.scale.setScalar(1.25); bunny.rotation.set(0, 0, 0);
    clumps.reset(); puffs.forEach((s) => (s.visible = false)); puffN = 0;
    pip.g.rotation.set(0, 0, 0); pip.g.visible = false; bean.g.visible = false;
    const napping = t > 61.4; miaW.hat.visible = miaW.scarf.visible = !napping; miaW.mittens.forEach((m) => (m.visible = !napping));
    scarfPip.visible = t > 7.8 && t < 39.35; scarfBean.visible = t > EV.drape; scarfCarry.visible = t >= 39.35 && t < EV.drape;
    const sb = Math.max(0, ...EV.sbCatch.map((c, i) => (t > c ? (i + 1) / EV.sbCatch.length : 0)));
    snowFace.setBeard(t > 44.9 && t < 58.6 ? (t > 55.2 ? 0.55 : 0.45 + 0.55 * sb) : 0);
    snowFace.setCap(t > 10.55 && t < EV.sneeze ? 1 : t >= EV.sneeze && t < EV.sneeze + 0.12 ? 1 - (t - EV.sneeze) / 0.12 : 0);
    sub.houses[0].door.rotation.y = K(t, [[EV.door, 0], [EV.door + 0.6, 1.45]]);
    man.setBuild(t < 50.6 ? 0 : K(t, [[51.0, 0.0], [52.3, 1.0]], (x) => x));
    man.g.visible = t > 50.6; man.nose.visible = t > EV.carrot && (t < EV.steal || t > EV.give);
    man.nose.scale.set(1, 1, t > EV.give ? 0.72 : 1);
    man.wave(t, 0);
    angel.material.opacity = t > 27 && t < 35 ? 0.85 * smooth((t - 27.4) / 2.6) : 0;
    corgiImp.material.opacity = t > 27 && t < 35 ? 0.8 * smooth((t - 29.4) / 1.2) : 0;
    win.aimSun(Aim[0], Aim[2], 9);

    manWin.g.visible = moundW.visible = cam === 'sleep';
    if (cam === 'lineup') { lineup(t); setCamera(P, Aim, C.fov, t, C.amp); return; }
    if (!room) ambientYard(t, cam);
    BEATS[cam](t, u);
    if (cam === 'door') jolt(EV.land, 0.012);
    if (cam === 'sbB') EV.sbCatch.forEach((m) => jolt(m, 0.006));
    // snow everywhere: the yard box rides with the camera; flakes too close to the lens are dropped
    const camV = new THREE.Vector3(...P);
    fall.update(t, camV, [0.05, 0.02]); fallBig.update(t, camV, [0.05, 0.02]);
    for (const f of [fall, fallBig]) { const a = f.pts.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const dx = a.getX(i) - camV.x, dy = a.getY(i) - camV.y, dz = a.getZ(i) - camV.z; if (dx * dx + dy * dy + dz * dz < 0.5 || a.getY(i) < SY) a.setY(i, -50); } a.needsUpdate = true; }
    fall.pts.visible = fallBig.pts.visible = !room;
    winSnow.update(t, [0.4, 1.6, -4.0], [0.04, 0]); winSnow2.update(t, [0.4, 1.6, -4.0], [0.04, 0]);
    clumps.commit();
    setCamera(P, Aim, C.fov, t, C.amp); studio.camera.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) { windowPip(t, true); },
    window(t) { windowPip(t, false); },
    door(t) {
      // Mia in the doorway (she opened it), Pip blasts out across the porch and leaps off the step into the drift
      const pm = person(mia, { x: DOOR[0] + 0.25, z: DOOR[1] + 0.05, rotY: 0.15, eyes: blink(t, 2), smile: 1, armA: mixArm(REST, REACH_A, smooth((t - 7.9) / 0.3) * (1 - smooth((t - 9.0) / 0.4))), armB: t > 9.6 ? CHEER_B : REST, mouth: t > 9.8 ? 'o' : null, headPitch: 0.2 }, win.porchTop);
      void pm;
      const out = EV.out, leap = EV.leap, land = EV.land;
      if (t < out) { pipAt(DOOR[0] - 0.15, DOOR[1] - 0.1, 0.1, { sit: 0.6, ears: 1, wag: 1, wagRate: 6, headPitch: -0.2, eyes: 'wide', mouth: 'pant' }, t, win.porchTop); return; }
      if (t < leap) { const w = walkLegs(t, [DOOR[0] - 0.15, DOOR[1] - 0.1], [{ t0: out, t1: leap, pts: [PORCH_EDGE] }]); pipAt(w.x, w.z, w.head ?? 0, { run: 1, dist: w.dist, ears: 1, earsBack: 0.4, wag: 1, wagRate: 6, mouth: 'pant', eyes: 'wide' }, t, win.porchTop); return; }
      const k = clamp((t - leap) / (land - leap));
      if (k < 1) { const x = lerp(PORCH_EDGE[0], DRIFT[0], k), z = lerp(PORCH_EDGE[1], DRIFT[1], k), y = lerp(win.porchTop, 0.18, k) + 0.55 * Math.sin(k * PI); pipAt(x, z, faceToward(PORCH_EDGE[0], PORCH_EDGE[1], DRIFT[0], DRIFT[1]), { run: 0.4, dist: t * 2, lean: 0.3 * (k - 0.5), ears: 1, earsBack: 0.9, wag: 1, wagRate: 7, mouth: 'open', eyes: 'happy' }, t, y); return; }
      pipAt(DRIFT[0], DRIFT[1], 0.4, { ears: 1, wag: 1 }, t, 0.0);
      poof(t, land, DRIFT[0], 0.35, DRIFT[1], 11, 0.8, 70);
    },
    drift(t) {
      // only his ears show: they swim through the drift (a shark fin), then he pops out wearing a snow hat
      const pop = EV.pop, sw = clamp((t - 11.6) / (pop - 11.8));
      const x = lerp(DRIFT[0] - 0.25, DRIFT[0] + 0.28, smooth(sw)) + 0.05 * Math.sin(t * 5), z = DRIFT[1] + 0.12 * Math.sin(sw * PI * 2);
      const up = smooth((t - pop) / 0.18), y = lerp(0.08, 0.26, up) - 0.06 * smooth((t - pop - 0.5) / 0.4);
      pipAt(x, z, lerp(1.3, 0.35, smooth((t - pop + 0.3) / 0.4)), { walk: t < pop ? 1 : 0, dist: t * 0.6, ears: 1, earL: 0.15 * Math.sin(t * 13), earR: 0.15 * Math.sin(t * 11 + 1), wag: 1, wagRate: 6, headPitch: -0.15, eyes: t < pop + 0.35 ? 'wide' : 'happy', mouth: t > pop + 0.3 ? 'pant' : 'o', tilt: K(t, [[pop + 0.5, 0], [pop + 0.8, 0.28]]) }, t, y);
      poof(t, pop, x, 0.35, z, 12, 0.6, 40);
      for (let k = 0; k < 8; k++) if (t < pop) puff(x - 0.05 * k, 0.33, z, ((t * 2.2 + k * 0.3) % 0.7), 0.7, 0.18, 300 + k);
      // Mia crouched by the drift, laughing
      const lau = (t * 2.4) % 1 < 0.5;
      person(mia, { x: DRIFT[0] - 0.55, z: DRIFT[1] - 0.75, rotY: 0.75, crouch: 0.3, lean: 0.35, eyes: t > pop ? (lau ? 'closed' : 'open') : blink(t, 2), smile: 1, mouth: t > pop && lau ? 'o' : null, armA: t > pop ? CHEEK_A : REACH_A, armB: t > pop ? CHEEK_B : REACH_B, headPitch: 0.25 }, SY);
    },
    tongueA(t) { tongue(t, false); },
    tongueB(t) { tongue(t, true); },
    sneeze(t) {
      const nf = EV.noseFlake, sn = EV.sneeze, ah = pulseAt(t, [[EV.ah[0], 0.6]], 0.6, 0.25, 0.1);
      const blast = pulseAt(t, [[sn, 0.2]], 0.2, 0.03, 0.35), after = smooth((t - sn - 0.25) / 0.4);
      pipAt(PIPY[0], PIPY[1], 0.04, { sit: 1, ears: 1 - 0.6 * blast, earsBack: blast, headPitch: lerp(-0.2, 0.25, smooth((t - nf + 0.6) / 0.6)) * (1 - ah) - 0.55 * ah + 0.5 * blast - 0.1 * after, lookY: t > nf - 0.6 && t < sn ? -1 : 0, lookX: 0, eyes: blast > 0.2 ? 'closed' : ah > 0.3 ? 'sleepy' : after > 0.5 ? 'wide' : 'open', mouth: ah > 0.3 ? 'o' : blast > 0.2 ? 'open' : after > 0.3 ? 'smile' : 'smile', open: blast > 0.2 ? 0.5 : undefined, hop: 0.02 * blast, lean: -0.1 * blast, wag: 0.7, tilt: 0.25 * after, sniff: pulseAt(t, [[nf + 0.2, 0.5]], 0.5) }, t);
      pip.g.updateMatrixWorld(true);
      const nose = pip.nose.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.022, 0.0));
      const f = heroFlakes[0];
      if (t < sn) { if (t < nf) heroFall(t, f, nf, nose, { dur: 1.2, from: [-0.08, 0.5, 0.05] }); else { f.visible = true; f.position.copy(nose); f.material.opacity = 1; f.material.rotation = nf * 1.6; } }
      burst(clumps, t, sn, new THREE.Vector3(nose.x, nose.y + 0.04, nose.z - 0.02), 26, 21, { speed: 0.55, up: 1.1, life: 0.6, size: 0.7, dz: -0.3, floor: SY }); for (let k = 0; k < 3; k++) puff(nose.x + (k - 1) * 0.06, nose.y + 0.08, nose.z - 0.12, t - sn - k * 0.05, 0.6, 0.16, 2100 + k);
    },
    angel(t) {
      // overhead: Mia sweeps a snow angel; Pip wiggles on his back next to her = a snow corgi
      const sw = 0.5 + 0.5 * Math.sin((t - 27) * 4.2);
      lieBack(mia, ANGEL[0], ANGEL[1] + 1.05, 0, { eyes: (t % 2.3) < 0.9 ? 'closed' : 'open', smile: 1, mouth: (t * 2) % 1 < 0.5 ? 'o' : null, armA: A(0, lerp(0.25, 2.5, sw), -0.1), armB: A(0, lerp(0.25, 2.5, sw), -0.1), headPitch: 0 });
      mia.legs.forEach((L) => (L.hip.rotation.z += L.s * lerp(0.05, 0.4, sw)));
      const roll = t < 28.6 ? smooth((t - 27.2) / 1.2) * 2.2 : 2.2 + 0.6 * Math.sin((t - 28.6) * 9);
      pipAt(CORGI[0], CORGI[1], 0.2, { lie: 1, roll, ears: 0.6, wag: 1, wagRate: 6, eyes: 'happy', mouth: 'pant', headYaw: 0.3 }, t);
      for (let k = 0; k < 4; k++) puff(CORGI[0], SY + 0.05, CORGI[1], ((t * 1.6 + k * 0.25) % 0.9), 0.9, 0.22, 400 + k);
    },
    zoom(t) {
      // snow zoomies round Mia (sitting up, laughing); spray behind him; the parents laugh on the porch
      const a = (t - 31.0) * 3.4 + 1.2, x = ZC[0] + ZR * Math.sin(a), z = ZC[1] + ZR * 0.8 * Math.cos(a);
      pipAt(x, z, Math.atan2(ZR * Math.cos(a), -ZR * 0.8 * Math.sin(a)), { run: 1, dist: a * ZR, ears: 1, earsBack: 0.5, wag: 1, wagRate: 6, mouth: 'pant', eyes: 'happy' }, t);
      for (let k = 0; k < 7; k++) { const b = a - 0.25 - k * 0.3; puff(ZC[0] + ZR * Math.sin(b), SY + 0.05, ZC[1] + ZR * 0.8 * Math.cos(b), ((t * 1.9 + k * 0.17) % 0.8), 0.8, 0.35, 500 + k); }
      burst(clumps, t, Math.floor(t * 4) / 4, new THREE.Vector3(x, SY + 0.03, z), 14, 600 + Math.floor(t * 4), { speed: 0.7, up: 1.4, life: 0.6, size: 0.9, floor: SY });
      const lau = (t * 2.4) % 1 < 0.5;
      person(mia, { x: ZC[0], z: ZC[1] - 0.1, rotY: faceToward(ZC[0], ZC[1], x, z), y: -0.68, footFwd: 0.62, lean: -0.1, eyes: lau ? 'closed' : 'open', smile: 1, mouth: lau ? 'o' : null, armA: CHEER_A, armB: CHEER_B, headPitch: -0.1 }, SY);
    },
    bean(t) {
      // Mrs. Rosa walks Bean up the sidewalk; Bean shivers in his sweater; Pip trots to the edge of the yard to meet them
      const w = walkLegs(t, ROSA0, [{ t0: 34.8, t1: 37.4, pts: [ROSA1] }]);
      person(rosa, { x: w.x, z: w.z, rotY: t < 37.4 ? w.head ?? -PI / 2 : lerp(-PI / 2, -2.4, smooth((t - 37.4) / 0.5)), dist: w.dist, speed: w.speed, eyes: blink(t, 4), smile: 1, armA: REST, armB: LEASH_B, headPitch: t > 37.4 ? 0.35 : 0.1, crouch: 0.25 * smooth((t - 37.5) / 0.5), lean: 0.4 * smooth((t - 37.5) / 0.5) }, SWY);
      const bw = walkLegs(t, [ROSA0[0] - 0.4, BEAN_SW[1]], [{ t0: 34.8, t1: 37.6, pts: [BEAN_SW] }]);
      placeD(bean, bw.x, bw.z, t < 37.6 ? bw.head ?? -PI / 2 : -PI / 2, { walk: t < 37.6 ? 1 : 0, dist: bw.dist, shiver: 1, ears: 0.4, sad: 0.4, tailDown: 0.7, headPitch: 0.05 }, t, SWY);
      bean.g.position.x += 0.006 * Math.sin(t * 61); bean.g.position.z += 0.004 * Math.sin(t * 47);
      leashUpdate();
      const pw = walkLegs(t, [-31.35, -3.0], [{ t0: 36.3, t1: 38.4, pts: [[-31.2, -2.0], PIP_SW] }]);
      pipAt(pw.x, pw.z, t < 36.3 ? 0.4 : t < 38.4 ? pw.head ?? 0 : PI / 2, { walk: t > 36.3 && t < 38.4 ? 1 : 0, dist: pw.dist, ears: 1, wag: 0.8, wagRate: 5, tilt: t < 36.3 ? 0.3 : 0, headYaw: t < 36.3 ? 0.4 : 0, eyes: 'open', mouth: 'smile' }, t, pw.z > -2 ? SWY - 0.03 : SY - 0.03);
    },
    scarf(t) {
      // Pip tugs his scarf off, carries it over, drapes it on Bean; Bean stops shivering, wags, licks his face
      const tug = pulseAt(t, [[EV.tug, 0.45]], 0.45, 0.12, 0.2), drape = EV.drape, warm = smooth((t - drape - 0.2) / 0.5);
      const step = smooth((t - 39.6) / 0.9) * (1 - smooth((t - drape - 0.3) / 0.6));
      const px = PIP_SW[0] + 0.14 * step, lean = 0.35 * pulseAt(t, [[drape - 0.35, 0.35]], 0.35, 0.15, 0.2);
      pipAt(px, PIP_SW[1], PI / 2 - 0.05, { walk: t > 39.6 && t < 40.5 ? 1 : 0, dist: px * 3, ears: 1, headPitch: 0.75 * tug + lean, headYaw: -0.9 * tug, lean, wag: t > drape ? 1 : 0.6, wagRate: t > drape ? 6 : 4, eyes: t > EV.lick ? 'happy' : 'open', mouth: tug > 0.2 || (t > 39.35 && t < drape) ? 'open' : 'smile', open: tug > 0.2 || (t > 39.35 && t < drape) ? 0.3 : undefined, tilt: K(t, [[drape + 0.3, 0], [drape + 0.6, 0.3]]) }, t, SWY - 0.03);
      const lick = pulseAt(t, [[EV.lick, 0.4], [EV.lick + 0.6, 0.35]], 0.35);
      placeD(bean, BEAN_SW[0], BEAN_SW[1], -PI / 2 + 0.05, { sit: 1, shiver: 1 - warm, ears: lerp(0.4, 1, warm), sad: 0.4 * (1 - warm), tailDown: 0.7 * (1 - warm), wag: warm, wagRate: 7, eyes: warm > 0.5 ? 'happy' : 'open', mouth: warm > 0.5 ? 'pant' : 'smile', lick, headPitch: -0.2 * warm - 0.25 * lick, headYaw: 0.1 * lick }, t, SWY);
      bean.g.position.x += 0.006 * (1 - warm) * Math.sin(t * 61);
      scarfBean.scale.setScalar(1.0 * (t > drape ? 1 + 0.25 * Math.exp(-7 * (t - drape)) * Math.sin(16 * (t - drape)) : 1));
      // Mia kneels behind, hands to her cheeks
      const aww = smooth((t - drape) / 0.4);
      person(mia, { x: PIP_SW[0] - 0.15, z: PIP_SW[1] + 0.75, rotY: PI + 0.2, y: -0.68, footFwd: 0.62, lean: 0.25, eyes: blink(t, 2), smile: 1, mouth: aww > 0.5 && aww < 0.99 ? 'o' : null, armA: mixArm(REST, CHEEK_A, aww), armB: mixArm(REST, CHEEK_B, aww), headPitch: 0.4 }, SWY);
    },
    sbA(t) { snowball(t); },
    sbB(t) { snowball(t); },
    snowman(t) {
      // time-lapse: Dad + Mia + the kids stack it; Dad sets the carrot; Pip leaps and steals it, runs off
      const st = EV.steal, ph = (t * 3) % 1;
      const busy = t < 52.3;
      person(dad, { x: SNOWMAN[0] - 0.62, z: SNOWMAN[1] + 0.12, rotY: 1.2, crouch: busy ? 0.2 + 0.1 * Math.sin(t * 9) : 0, lean: busy ? 0.4 : 0.05, eyes: blink(t, 3), smile: 1, glasses: true, armA: busy ? REACH_A : t > EV.carrot - 0.6 && t < EV.carrot + 0.3 ? REACH_A : t > st ? CHEEK_A : REST, armB: busy ? REACH_B : t > st ? CHEEK_B : REST, mouth: t > st + 0.2 ? 'o' : null }, SY);
      person(mia, { x: SNOWMAN[0] + 0.62, z: SNOWMAN[1] + 0.15, rotY: -1.25, eyes: blink(t, 2), smile: 1, crouch: busy ? 0.15 : 0, lean: busy ? 0.3 : 0, armA: busy ? REACH_A : t > st ? CHEER_A : CLAP_A, armB: busy ? REACH_B : t > st ? CHEER_B : CLAP_B, mouth: t > st ? 'o' : null }, SY);
      person(leo, { x: SNOWMAN[0] - 0.95, z: SNOWMAN[1] - 0.45, rotY: 0.7, eyes: blink(t, 5), smile: 1, armA: busy && ph < 0.5 ? REACH_A : CLAP_A, armB: CLAP_B, mouth: t > st ? 'o' : null }, SY);
      person(zoe, { x: SNOWMAN[0] + 0.98, z: SNOWMAN[1] - 0.4, rotY: -0.7, eyes: blink(t, 6), smile: 1, armA: t > st ? CHEER_A : REST, armB: t > st ? CHEER_B : CLAP_B }, SY);
      if (t > EV.carrot - 0.6 && t < EV.carrot) { dad.root.updateMatrixWorld(true); carrotHeld.visible = true; carrotHeld.position.copy(handWorld(dad, -1)); carrotHeld.rotation.set(0, 1.2, 0); }
      for (let k = 0; k < 3; k++) poof(t, EV.stack[k], SNOWMAN[0], 0.3 + k * 0.3, SNOWMAN[1], 40 + k, 0.5, 30);
      // Pip: sits watching, then the leap
      const H = man.head.getWorldPosition(new THREE.Vector3()), noseP = H.clone().add(new THREE.Vector3(0, 0, 0.2));
      const P0 = [SNOWMAN[0] - 0.35, SNOWMAN[1] + 1.0];
      if (t < st - 0.5) { pipAt(P0[0], P0[1], PI - 0.3, { sit: 1, ears: 1, wag: 0.8, headPitch: -0.5, lookY: 1, tilt: K(t, [[51.2, 0], [51.5, 0.3], [52.3, -0.25], [52.9, 0]]), eyes: t > EV.carrot ? 'wide' : 'open', mouth: 'smile' }, t); return; }
      const k = clamp((t - (st - 0.5)) / 0.5), back = clamp((t - st) / 0.5);
      if (t < st) { const x = lerp(P0[0], noseP.x, k), z = lerp(P0[1], noseP.z + 0.12, k), y = lerp(SY, noseP.y - 0.3, Math.sin(k * PI / 2)); pipAt(x, z, PI - 0.1, { beg: k, ears: 1, earsBack: 0.5, wag: 1, wagRate: 7, headPitch: -0.3, mouth: 'open', open: 0.4, eyes: 'wide' }, t, y); return; }
      const run = walkLegs(t, [noseP.x + 0.05, noseP.z + 0.25], [{ t0: st + 0.45, t1: 55.2, pts: [[SNOWMAN[0] + 0.9, SNOWMAN[1] + 1.4], [SNOWMAN[0] + 2.6, SNOWMAN[1] + 1.8]] }]);
      const y = back < 1 ? lerp(noseP.y - 0.3, SY - 0.03, back * back) : SY - 0.03;
      pipAt(run.x, run.z, t < st + 0.45 ? PI : run.head ?? 1.4, { run: t > st + 0.45 ? 1 : 0, dist: run.dist, ears: 1, wag: 1, wagRate: 7, mouth: 'open', open: 0.28, eyes: 'happy' }, t, y);
      holdCarrot(1);
    },
    give(t) {
      // Mia lifts him up to the snowman's face; he puts the (slightly shorter) carrot back; hug + cheers
      const gv = EV.give, hug = smooth((t - gv - 0.4) / 0.5);
      const MX = SNOWMAN[0] + 0.62, MZ = SNOWMAN[1] + 0.05;
      person(mia, { x: MX, z: MZ, rotY: -PI / 2 + 0.45 + 0.3 * hug, eyes: t > gv ? 'closed' : blink(t, 2), smile: 1, mouth: t > gv ? 'o' : null, armA: mixArm(HOLD_A, PET_A, hug), armB: mixArm(HOLD_B, PET_B, hug), headPitch: 0.1, lean: 0.12 }, SY);
      mia.root.updateMatrixWorld(true);
      const hands = handWorld(mia, -1).add(handWorld(mia, 1)).multiplyScalar(0.5);
      const lift = smooth((t - 55.4) / 0.9);
      const H = man.head.getWorldPosition(new THREE.Vector3());
      const tx = lerp(hands.x, H.x + 0.28, 0.0), tz = lerp(hands.z, H.z + 0.05, 0.0);
      const reach = pulseAt(t, [[gv - 0.35, 0.35]], 0.35, 0.2, 0.3);
      pipAt(tx, tz, faceToward(tx, tz, H.x, H.z) + 0.85, { beg: 1, ears: 1, wag: 1, wagRate: 6, headPitch: -0.1 + 0.15 * reach, lean: 0.2 * reach, eyes: t > gv + 0.2 ? 'happy' : 'open', mouth: t < gv ? 'open' : 'pant', open: t < gv ? 0.28 : undefined }, t, lerp(SY, hands.y - 0.2, lift));
      if (t < 56.0) { const w = walkLegs(t, [SNOWMAN[0] + 2.0, SNOWMAN[1] + 1.4], [{ t0: 55.2, t1: 55.8, pts: [[tx, tz]] }]); if (lift < 0.05) pipAt(w.x, w.z, w.head ?? 0, { walk: 1, dist: w.dist, ears: 1, wag: 1, mouth: 'open', open: 0.28 }, t); }
      if (t < gv) holdCarrot(t > EV.chomp ? 0.72 : 1);
      person(dad, { x: SNOWMAN[0] - 0.75, z: SNOWMAN[1] + 0.25, rotY: 1.0, eyes: blink(t, 3), smile: 1, glasses: true, armA: t > gv ? CHEER_A : CLAP_A, armB: t > gv ? CHEER_B : CLAP_B, mouth: t > gv && (t * 2) % 1 < 0.5 ? 'o' : null }, SY);
      person(zoe, { x: SNOWMAN[0] - 0.4, z: SNOWMAN[1] - 0.55, rotY: 0.3, eyes: blink(t, 6), smile: 1, armA: t > gv ? CHEER_A : REST, armB: t > gv ? CHEER_B : REST }, SY);
    },
    paws(t) {
      // the hall: Mom kneels and towels his paws (sidewalk salt), Mia unwinds her scarf on the shoe bench
      const [wa, wb] = EV.wipe, rub = t > wa && t < wb + 0.6 ? Math.sin((t - wa) * 14) : 0;
      placeD(pip, LX + HALL.pip[0], HALL.pip[1], 0.45, { sit: 1, ears: 1, wag: 1, wagRate: 5, eyes: t > wa + 0.3 ? 'happy' : 'open', mouth: 'pant', headPitch: -0.2, headYaw: 0.3 + 0.1 * Math.sin(t * 2), tilt: 0.15 * Math.sin(t * 3) }, t);
      snowFace.setBeard(0);
      const pm = person(mom, { x: LX + HALL.mom[0], z: HALL.mom[1], rotY: faceToward(HALL.mom[0], HALL.mom[1], HALL.pip[0], HALL.pip[1]), crouch: 0.34, lean: 0.55, eyes: blink(t, 4), smile: 1, armA: mixArm(TOWEL_A, A(-1.2, 0.25, -0.5, 0.4), 0.5 + 0.5 * rub), armB: mixArm(TOWEL_B, A(-1.2, 0.25, -0.5, -0.4), 0.5 - 0.5 * rub), headPitch: 0.45, mouth: t > 60.2 && t < 60.7 ? 'o' : null }, 0);
      void pm;
      mom.root.updateMatrixWorld(true); towel.visible = true; towel.position.copy(handWorld(mom, -1).add(handWorld(mom, 1)).multiplyScalar(0.5)).add(new THREE.Vector3(0, -0.02, 0)); towel.rotation.set(0, 0.3 + 0.2 * rub, 0);
      if (0) person(mia, { x: LX + HALL.mia[0], z: HALL.mia[1], rotY: PI / 2 + 0.2, y: -0.375, footFwd: 0.42, eyes: blink(t, 2), smile: 1, armA: A(-0.9, 0.3, -1.4 - 0.3 * Math.sin(t * 6), 0.5), armB: A(-0.6, 0.2, -1.6, -0.6), headPitch: 0.2, headYaw: 0.3 }, 0.154);
    },
    sleep(t) {
      // asleep on the window seat in a blanket with the bunny; Mia beside him; outside, the snowman's arm waves
      placeD(pip, LX + 0.12, PIP_WIN[1] + 0.12, 1.1, { sleep: 1, ears: 0.5, wag: 0.15, wagRate: 2 }, t, SEAT.top);
      snowFace.setBeard(0); snowFace.setCap(0);
      quilt.visible = true;
      dropBunny(LX + 0.0, PIP_WIN[1] - 0.12, 0.6, SEAT.top + 0.01, 1.3);
      const pm = person(mia, { x: LX + 0.55, z: -2.52, rotY: -0.35, y: -0.375, footFwd: 0.42, eyes: (t % 3.6) < 1.2 ? 'closed' : 'open', smile: 1, armA: REST, armB: PET_B, headPitch: 0.35, headRoll: -0.15, lean: 0.1, armA: PET_A, armB: REST }, SEAT.top - 0.286);
      void pm;
      manWin.wave(t, smooth((t - 62.4) / 0.5), 1.0);
    },
  };

  // quilt over the sleeping Pip
  const quilt = new THREE.Group(); quilt.position.set(LX + 0.1, SEAT.top + 0.06, PIP_WIN[1] + 0.08); quilt.rotation.y = 1.1; scene.add(quilt); quilt.visible = false;
  { const qt = canvasTex(256, 256, (g, w, h) => { const cols = ['#e2574c', '#f2c14e', '#58b3a8', '#f4f1ea', '#a77bd1', '#7fb8d8']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = cols[(x + y * 2) % cols.length]; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(255,255,255,.7)'; g.setLineDash([6, 5]); g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
    const qg = new THREE.SphereGeometry(0.2, 24, 14, 0, PI * 2, 0, PI / 2); const q = mk(qg, new THREE.MeshStandardMaterial({ map: qt, roughness: 0.95, side: THREE.DoubleSide }), quilt, 0, -0.06, -0.08); q.scale.set(0.95, 0.75, 1.25); }
  const dropBunny = (x, z, rotY = 0, y = 0, roll = 0) => { if (bunny.parent !== scene) scene.add(bunny); bunny.visible = true; bunny.position.set(x, y, z); bunny.rotation.set(0, rotY, roll); bunny.scale.setScalar(1.25); };
  function holdCarrot(len = 1) { const m = mouthW(); carrotHeld.visible = true; carrotHeld.position.copy(m); carrotHeld.quaternion.copy(pip.H.getWorldQuaternion(new THREE.Quaternion())); carrotHeld.rotateY(PI / 2); carrotHeld.scale.set(1, 1, len); }
  function leashUpdate() { rosa.root.updateMatrixWorld(true); bean.g.updateMatrixWorld(true); setLeash(handWorld(rosa, 1), bean.collar.getWorldPosition(new THREE.Vector3())); }

  function windowPip(t, thumb) {
    // standing on the window seat, paws on the sill, nose to the glass; a flake on the glass; head tilts; the boop
    const boop = pulseAt(t, [[EV.boop, 0.35], [1.6, 0.4]], 0.35, 0.1, 0.3), perk = smooth((t - EV.boop - 0.3) / 0.3);
    const tilt = thumb ? K(t, [[0.2, 0], [1.0, 0.3], [2.2, -0.25], [3.0, 0.1]]) : K(t, [[3.6, 0.1], [4.3, 0.34], [5.1, -0.3], [5.8, 0.25], [6.1, 0]]);
    const turn = !thumb ? smooth((t - 6.7) / 0.4) : 0;
    pipAt(LX + PIP_WIN[0], PIP_WIN[1] - 0.06 * boop, PI, { beg: 1, ears: lerp(0.95, 1, perk), wag: lerp(0.6, 1, perk), wagRate: lerp(4, 6.5, perk), tilt: tilt * (1 - turn), headPitch: -0.12 - 0.1 * boop, headYaw: -0.95 * turn, lookY: 0.2, lookX: 0.3 * Math.sin(t * 0.8), eyes: perk > 0.3 ? 'wide' : 'open', mouth: perk > 0.5 ? 'pant' : 'smile', sniff: 0.5 * boop }, t, SEAT.top);
    noseFog.material.opacity = Math.max(thumb ? smooth((t - 1.65) / 0.3) * 0.8 : 0.5 * (1 - smooth((t - 3.6) / 1.2)), 0.85 * smooth((t - EV.boop) / 0.2) * (1 - smooth((t - EV.boop - 1.0) / 1.0)));
    glassFlake.material.opacity = thumb ? 1 : 1 - smooth((t - EV.boop - 0.1) / 0.2);
    pip.g.updateMatrixWorld(true); const nz = pip.nose.getWorldPosition(new THREE.Vector3());
    noseFog.position.set(nz.x - LX, nz.y - 0.01, Dz0 - 0.025);
    glassFlake.position.set(nz.x - LX + 0.06, nz.y + 0.09 - 0.012 * t, Dz0 - 0.04);
    if (!thumb) {   // Mia comes down the stairs in her coat (background, out of focus), calling him
      const w = walkLegs(t, [1.9, -0.6], [{ t0: 3.6, t1: 5.6, pts: [[1.0, -1.7], [0.3, -2.12]] }]);
      const look = smooth((t - 6.6) / 0.4);
      const pm = person(mia, { x: LX + w.x, z: w.z, rotY: t < 5.6 ? w.head ?? PI : PI, dist: w.dist, speed: w.speed, eyes: blink(t, 2), smile: 1, headYaw: 0.5 * look, headPitch: 0.35 * look, lean: 0.25, armA: REST, armB: t > 5.6 && t < 6.6 ? A(-1.5, 0.1, -0.2, -0.2) : REST, mouth: t > 5.7 && t < 6.6 ? 'o' : null }, 0);
      void pm;
    }
  }
  function tongue(t, b) {
    // sitting in the yard, head up, tongue out; crystals drift down onto it (HUD +1 each)
    const snaps = EV.snaps, catches = EV.catches, sn = pulseAt(t, snaps.map((s) => [s, 0.2]), 0.2, 0.06, 0.15);
    const spin = b ? K(t, [[20.0, 0], [20.5, 0.9], [21.2, 0.9], [21.6, -0.5], [22.4, -0.5], [23.0, 0]]) : 0;
    const hop = b ? 0.09 * pulseAt(t, [[20.35, 0.15], [21.55, 0.15]], 0.15, 0.08, 0.15) : 0;
    pipAt(PIPY[0], PIPY[1], 0.05 + spin, { sit: hop > 0.02 ? 0.5 : 1, ears: 1, wag: 1, wagRate: 5, headPitch: -0.75 + 0.2 * sn, lookY: 1, mouth: 'open', open: 0.32 - 0.2 * sn, tongue: 1, eyes: catches.some((c) => t > c && t < c + 0.4) ? 'happy' : 'wide', hop, tilt: 0.12 * Math.sin(t * 1.7) }, t);
    const m = mouthW().add(new THREE.Vector3(0, 0.01, 0.0));
    catches.forEach((ct, i) => { if (b !== (i >= 3)) return; heroFall(t, heroFlakes[i], ct, m, { dur: 1.5, from: [0.18 * (i % 2 ? 1 : -1), 0.42, 0.12] }); if (t > ct && t < ct + 0.25) { puff(m.x, m.y + 0.02, m.z, t - ct, 0.25, 0.08, 800 + i); } });
    if (b) {
      const lau = (t * 2.2) % 1 < 0.5;
      person(mia, { x: MIA_K[0], z: MIA_K[1], rotY: -0.25, y: -0.68, footFwd: 0.62, eyes: t > 22.2 ? (lau ? 'closed' : 'open') : 'open', smile: 1, mouth: t < 22.2 || lau ? 'o' : null, headPitch: t < 22.2 ? -0.55 : 0.1, headYaw: t < 22.2 ? 0 : -0.5, armA: CLAP_A, armB: CLAP_B }, SY);
    }
  }
  function snowball(t) {
    // Leo + Zoe throw from behind the fort; each snowball arcs into Pip's mouth (he leaps): POOF, the beard grows
    const throws = EV.throws, catches = EV.sbCatch;
    const lau = (t * 2.3) % 1 < 0.5;
    const who = (i) => (i % 2 ? zoe : leo);
    [leo, zoe].forEach((K2, j) => {
      const [x, z] = j ? ZOE : LEO;
      const mine = throws.map((th, i) => [th, i]).filter(([, i]) => (i % 2) === j);
      const wind = Math.max(0, ...mine.map(([th]) => pulseAt(t, [[th - 0.35, 0.25]], 0.25, 0.1, 0.05)));
      const rel = Math.max(0, ...mine.map(([th]) => pulseAt(t, [[th - 0.05, 0.15]], 0.15, 0.05, 0.25)));
      person(K2, { x, z, rotY: faceToward(x, z, PIP_SB[0], PIP_SB[1]), eyes: blink(t, 5 + j), smile: 1, crouch: 0.12 * (1 - wind - rel), armA: mixArm(REST, THROW_FWD, rel * 0.0), armB: rel > 0 ? mixArm(THROW_UP, THROW_FWD, rel) : mixArm(REST, THROW_UP, wind), mouth: t > catches[0] && lau ? 'o' : null }, SY);
    });
    person(mia, { x: MIA_SB[0], z: MIA_SB[1], rotY: faceToward(MIA_SB[0], MIA_SB[1], LEO[0], LEO[1]) - 0.4, eyes: lau && t > catches[0] ? 'closed' : blink(t, 2), smile: 1, mouth: t > catches[0] && lau ? 'o' : null, armA: CLAP_A, armB: CLAP_B, headYaw: 0.4 }, SY);
    // Pip: leaps for each ball (he faces the throwers)
    const hop = Math.max(0, ...catches.map((c) => pulseAt(t, [[c - 0.22, 0.12]], 0.12, 0.16, 0.22)));
    const face = faceToward(PIP_SB[0], PIP_SB[1], (LEO[0] + ZOE[0]) / 2, (LEO[1] + ZOE[1]) / 2);
    const lastC = catches[catches.length - 1], turn = smooth((t - lastC - 0.3) / 0.4);
    const camF = faceToward(PIP_SB[0], PIP_SB[1], -28.55, -3.95), dF = ((camF - face + 3 * PI) % (2 * PI)) - PI;
    pipAt(PIP_SB[0], PIP_SB[1], face + dF * turn, { sit: hop > 0.1 ? 0 : 0.8, hop: 0.3 * hop, ears: 1, earsBack: 0.4 * hop, wag: 1, wagRate: 6, headPitch: -0.25 * hop, mouth: hop > 0.1 ? 'open' : 'pant', open: hop > 0.1 ? 0.5 : undefined, eyes: turn > 0.5 ? 'happy' : 'wide', tilt: 0.25 * turn }, t);
    const m = mouthW();
    throws.forEach((th, i) => {
      const ct = catches[i], k = (t - th) / (ct - th);
      if (k < 0 || k > 1) return;
      const K2 = who(i); K2.root.updateMatrixWorld(true);
      const h0 = handWorld(K2, 1), b = balls[i];
      b.visible = true; b.position.lerpVectors(h0, m, k); b.position.y += 0.45 * Math.sin(k * PI);
    });
    catches.forEach((ct, i) => { burst(clumps, t, ct, m, 18, 70 + i, { speed: 0.8, up: 1.2, life: 0.6, size: 0.9, dx: 0.3, floor: SY }); for (let k = 0; k < 2; k++) puff(m.x + 0.05, m.y + 0.04, m.z - 0.05 * k, t - ct - k * 0.05, 0.5, 0.14, 7000 + i * 10 + k); });
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200): Pip states + Mia lying
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    const i = Math.floor(t - 200);
    const st = [{ beg: 1 }, { lie: 1, roll: 2.2 }, { sit: 1, headPitch: -0.75, mouth: 'open', open: 0.32, tongue: 1, lookY: 1 }, { sleep: 1 }, { beg: 1, hop: 0.3 }][i % 5];
    pipAt(-31.3, -4.6, 0.3, { ...st, still: true }, t);
    placeD(bean, -30.7, -4.6, -0.3, { sit: 1, still: true }, t, SY);
    scarfPip.visible = true; scarfBean.visible = true; snowFace.setBeard(i >= 5 ? 1 : 0);
  }

  return { update };
}
