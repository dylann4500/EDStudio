// VIDEO 038 — "What if the whole town lost power… and only Pip wasn't scared?"  (Pip ep. 5 · lane 3 @ed._.sims · storybook tone)
// 67.0 s, 18 shots, 4 places (Pip's living room, the town from a rooftop, Maple St in the rain, Mrs. Rosa's living room).
// A storm knocks out the whole town (HUD HOMES WITH POWER 12,400 → 0). Mia hides under a quilt, Dad finds the coffee table with
// his shin, Mom can't find the candles, and next door Mrs. Rosa sits alone in the dark with Bean shivering in her lap. Pip isn't
// scared: dogs see far better than us in dim light (his eyes shine). He finds the flashlight, digs out the BATTERY candles, brings
// Mia her bunny, then goes next door in his yellow raincoat and brings Mrs. Rosa + Bean home. A blanket fort for everyone; the
// power comes back street by street at 11:58 (12,400); they're all asleep in the fort and nobody notices. Not even Pip.
// Fire safety reads right on purpose: every "candle" is a flameless battery candle (NFPA / USFA: flashlights + battery lights
// in an outage, never candles). No flame anywhere near Pip. Thunder is a soft rumble only — no lightning flashes.
// NEW: pip.update(t, { shine }) eyeshine (engine/pip.js, additive). Local helpers here: rain that follows the camera, a storm view
// for the windows (lit / dark), a quilt blanket fort, LED candles + their box, a battery lantern, Pip's yellow raincoat, an umbrella.
//
// Sources (checked Oct 28, 2026):
//   dogs see better than people in dim light; the tapetum lucidum, a mirror-like layer behind the retina, sends light back through
//   it a second time, and it's what makes their eyes shine in a flashlight beam — AKC, "Can Dogs See in the Dark?"
//   (akc.org/expert-advice/health/can-dogs-see-in-the-dark/)
//   use flashlights / battery-powered lights in a power outage, not candles; flameless battery candles are the safe swap —
//   NFPA "Candle with Care" tip sheet; U.S. Fire Administration (usfa.fema.gov/prevention/home-fires/prevent-fires/candle)
//   12,400 homes, 7:42 PM and 11:58 PM are story numbers.
//
// Shot list (seconds)               | set   | what happens
//  0.0– 3.4 thumb   7:41 PM         | liv   | the question over Pip by the rainy window, lamps on; an ear flicks at a far rumble
//  3.4– 8.4 home    12,400          | liv   | the family evening: Mia + bunny on the rug, Pip pouncing, Mom in the armchair, Dad on the sofa; lamps flicker
//  8.4–11.6 town    → 0             | city  | the town from a rooftop in the rain: blocks go dark far → near (the music enters)
// 11.6–14.2 dark                    | liv   | the lamps die; everyone freezes and looks up; Pip's ears perk, his tail still going
// 14.2–16.8 hide                    | liv   | Mia pulls the quilt over herself, eyes peeking; Pip tilts his head at the lump
// 16.8–19.4 bump                    | liv   | Dad shuffles with his arms out… shin meets coffee table; he hops
// 19.4–22.0 drawer                  | liv   | Mom digs in the console: a TV remote, a sock… no candles
// 22.0–25.4 rosa    NEXT DOOR       | ros   | Mrs. Rosa alone in her armchair in the dark, Bean shivering in her lap; a rumble, she hugs him
// 25.4–29.6 eyes    TAPETUM         | liv   | Pip close-up in the dark: calm, wagging, looking around — his eyes shine green-gold
// 29.6–31.7 torchA                  | liv   | he trots to the flashlight on the rug, grabs it in his mouth, CLICK
// 31.7–33.4 torchB                  | liv   | over his shoulder: the beam sweeps across the dark room onto Dad, who squints, then a thumbs-up
// 33.4–37.4 candles                 | liv   | he drags the box out from under the console; Mom opens it: battery candles click on one by one
// 37.4–41.4 bunny                   | liv   | candlelit room: he carries the bunny to Mia's quilt lump; she peeks out, takes it, hugs him
// 41.4–45.6 street                  | sub   | rain on Maple St, every house dark: Pip in a yellow raincoat trots next door, Dad + umbrella behind
// 45.6–49.8 door                    | sub   | Rosa's porch: knock knock, the door opens on Rosa + shivering Bean; Bean sees Pip and wags
// 49.8–52.6 fortA   PEOPLE 5 DOGS 2 | liv   | the blanket fort: Dad, Mom, Rosa in the back, Mia + Pip + Bean in front, a lantern, laughs
// 52.6–55.4 fortB                   | liv   | close: Mia hugs both dogs, Bean licks Pip
// 55.4–58.4 lights  → 12,400        | city  | the same rooftop: the town comes back street by street, near → far
// 58.4–67.0 asleep                  | liv   | lamps back on, everyone asleep in the fort; Pip asleep with the bunny and Bean. End card at 63.0
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, blink, handWorld } from '@engine/rig.js';
import { makeBunny, makeFlashlight, quiltTexture } from '@engine/props.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildCity, ROOF_Y } from '@engine/sets/city.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { dressHalloween, makeStringLights } from '@engine/halloween.js';
import { makePip, makeMia, makeMom, makeDad, poseScaled, pulseAt } from '@engine/pip.js';
import { makeBreed } from '@engine/dogbreeds.js';

const PI = Math.PI;
const OFF = { city: [0, 0, 0], liv: [3000, 0, 0], sub: [6000, 0, 0], ros: [9000, 0, 0] };   // city.js must stay at the origin
const PIPS = 0.92, BEANS = 0.52;
const FORT = { x: -2.85, z: -1.05, w: 2.3, d: 1.7, h: 1.18 };   // blanket fort in the stair hall (liv local), open toward +z
const MOUND = [0.02, 0.28];                                       // Mia's quilt lump on the rug
const DOORX = -18.2;                                              // Mrs. Rosa's front door (suburb lot −16, door at lot − 2.2)

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb', set: 'liv' },
  { t0: 3.4, t1: 8.4, cam: 'home', set: 'liv' },
  { t0: 8.4, t1: 11.6, cam: 'town', set: 'city' },
  { t0: 11.6, t1: 14.2, cam: 'dark', set: 'liv' },
  { t0: 14.2, t1: 16.8, cam: 'hide', set: 'liv' },
  { t0: 16.8, t1: 19.4, cam: 'bump', set: 'liv' },
  { t0: 19.4, t1: 22.0, cam: 'drawer', set: 'liv' },
  { t0: 22.0, t1: 25.4, cam: 'rosa', set: 'ros' },
  { t0: 25.4, t1: 29.6, cam: 'eyes', set: 'liv' },
  { t0: 29.6, t1: 31.7, cam: 'torchA', set: 'liv' },
  { t0: 31.7, t1: 33.4, cam: 'torchB', set: 'liv' },
  { t0: 33.4, t1: 37.4, cam: 'candles', set: 'liv' },
  { t0: 37.4, t1: 41.4, cam: 'bunny', set: 'liv' },
  { t0: 41.4, t1: 45.6, cam: 'street', set: 'sub' },
  { t0: 45.6, t1: 49.8, cam: 'door', set: 'sub' },
  { t0: 49.8, t1: 52.6, cam: 'fortA', set: 'liv' },
  { t0: 52.6, t1: 55.4, cam: 'fortB', set: 'liv' },
  { t0: 55.4, t1: 58.4, cam: 'lights', set: 'city' },
  { t0: 58.4, t1: 70, cam: 'asleep', set: 'liv' },
];
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased across the shot)
const c = (p0, p1, a0, a1, fov, amp = 0.003) => ({ p: [p0, p1], a: [a0, a1], fov, amp });
export const CAMS = {
  thumb:   c([0.55, 0.42, 0.95], [0.55, 0.41, 0.85], [0.5, 0.36, 0.05], [0.5, 0.36, 0.05], 44, 0.002),
  home:    c([0.35, 0.5, 2.3], [0.3, 0.48, 2.05], [0.35, 0.8, -1.6], [0.35, 0.78, -1.6], 54, 0.004),
  town:    c([-6.5, ROOF_Y + 2.6, 12.0], [-6.5, ROOF_Y + 2.4, 11.4], [1.5, 2, -70], [1.5, 2.5, -70], 50, 0.002),
  dark:    c([0.3, 0.55, 2.1], [0.3, 0.53, 1.85], [0.35, 0.8, -1.6], [0.35, 0.82, -1.6], 52, 0.004),
  hide:    c([0.22, 0.46, 1.5], [0.2, 0.45, 1.38], [0.02, 0.5, 0.25], [0.02, 0.5, 0.25], 48, 0.003),
  bump:    c([0.42, 0.6, 1.2], [0.42, 0.58, 1.05], [0.55, 1.1, -1.1], [0.55, 1.02, -1.1], 52, 0.004),
  drawer:  c([-1.75, 1.15, -1.65], [-1.85, 1.13, -1.72], [-3.4, 1.1, -2.25], [-3.4, 1.1, -2.25], 58, 0.003),
  rosa:    c([-0.15, 0.95, 0.2], [-0.18, 0.93, 0.0], [-0.35, 0.84, -1.4], [-0.35, 0.84, -1.4], 46, 0.002),
  eyes:    c([0.4, 0.42, 1.38], [0.4, 0.4, 1.2], [0.4, 0.33, 0.25], [0.4, 0.33, 0.25], 44, 0.002),
  torchA:  c([-0.05, 0.38, 1.45], [-0.1, 0.38, 1.32], [-0.38, 0.3, 0.3], [-0.42, 0.32, 0.3], 48, 0.003),
  torchB:  c([-0.7, 0.44, 0.95], [-0.68, 0.46, 0.85], [0.0, 0.95, -1.6], [0.02, 1.0, -1.6], 50, 0.003),
  candles: c([-1.8, 0.72, -0.5], [-1.92, 0.72, -0.62], [-3.55, 0.62, -2.02], [-3.55, 0.64, -2.02], 46, 0.003),
  bunny:   c([0.55, 0.45, 1.5], [0.5, 0.44, 1.35], [0.15, 0.38, 0.25], [0.12, 0.4, 0.25], 50, 0.003),
  street:  null,   // tracking camera computed in the beat
  door:    c([-17.25, 0.62, -6.35], [-17.3, 0.64, -6.55], [-18.25, 1.3, -8.9], [-18.25, 1.35, -8.9], 54, 0.003),
  fortA:   c([-2.85, 0.78, 1.75], [-2.85, 0.75, 1.45], [-2.85, 0.8, -1.0], [-2.85, 0.8, -1.0], 50, 0.003),
  fortB:   c([-2.85, 0.5, 0.65], [-2.85, 0.49, 0.5], [-2.85, 0.47, -0.8], [-2.85, 0.47, -0.8], 48, 0.002),
  lights:  c([-6.5, ROOF_Y + 2.4, 11.4], [-6.5, ROOF_Y + 2.7, 10.8], [1.5, 2.5, -70], [1.5, 4, -70], 50, 0.002),
  asleep:  c([-2.85, 0.8, 1.75], [-2.85, 0.78, 1.35], [-2.85, 0.82, -1.0], [-2.85, 0.8, -1.0], 50, 0.002),
  lineup:  c([0.4, 0.42, 1.5], [0.4, 0.42, 1.5], [0.4, 0.25, 0.5], [0.4, 0.25, 0.5], 38, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const LAP_A = A(-0.55, 0.12, -1.0, 0.5), LAP_B = A(-0.55, 0.12, -1.0, -0.5);
const OFFER_B = A(-1.2, 0.1, -0.35, -0.2);
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);
const ZOMBIE_A = A(-1.45, 0.12, -0.1, 0.1), ZOMBIE_B = A(-1.45, 0.12, -0.1, -0.1);        // arms out in the dark
const HEART_A = A(-0.05, 0.2, -2.0, 0.9), HEART_B = A(-0.05, 0.2, -2.0, -0.9);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);
const CRADLE_A = A(-0.5, -0.06, -1.7, 0.75), CRADLE_B = A(-0.5, -0.06, -1.7, -0.75);
const SHIN_A = A(-1.15, 0.1, -0.2, 0.3), SHIN_B = A(-1.15, 0.1, -0.2, -0.3);             // hands down to the shin
const HOLDUP_B = A(-1.0, 0.25, -1.75, -0.4);                                               // holding something up to look at
const SHRUG_A = A(0.1, 0.45, -1.6, 1.2), SHRUG_B = A(0.1, 0.45, -1.6, -1.2);
const KNOCK_B = A(-1.25, 0.2, -1.4, -0.3);
const TORCH_B = A(-0.85, 0.12, -0.55, -0.2);
const UMB_A = A(-0.75, 0.15, -1.5, 0.4);                                                   // umbrella up
const THUMB_B = A(-0.9, 0.2, -1.8, -0.5);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const KNEEL = { y: -0.47, footFwd: -0.33, lean: 0.18 };
const FLOOR = { y: -0.68, footFwd: 0.62 };                         // sitting on the floor (rig units)
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));

// ---------------------------------------------------------------- local props
function stormView(lit) {
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141a2c'); gr.addColorStop(0.55, '#27304a'); gr.addColorStop(1, '#343a56');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(lit ? 5 : 5);
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${60 + R() * 30},${68 + R() * 30},${96 + R() * 30},${0.35 + R() * 0.3})`; g.beginPath(); g.ellipse(R() * w, R() * h * 0.45, 80 + R() * 140, 24 + R() * 36, 0, 0, 7); g.fill(); }
    // the street outside: rooftops, windows, trees, street lamps
    for (let i = 0; i < 9; i++) {
      const x = i * 120 - 30, bw = 100, bh = 70 + R() * 30, y = h * 0.74;
      g.fillStyle = '#151a28'; g.fillRect(x, y - bh, bw, bh + 200); g.beginPath(); g.moveTo(x - 10, y - bh); g.lineTo(x + bw / 2, y - bh - 46); g.lineTo(x + bw + 10, y - bh); g.fill();
      for (const [dx, dy] of [[18, 22], [62, 22], [18, 56], [62, 56]]) { const on = lit && R() < 0.85; g.fillStyle = on ? (R() < 0.5 ? '#ffd28a' : '#ffe2a8') : '#1e2436'; g.fillRect(x + dx, y - bh + dy, 22, 20); }
    }
    g.fillStyle = '#0f1420'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(i * 80 + 30, h * 0.86, 40 + (i % 3) * 12, 0, 7); g.fill(); }
    g.fillRect(0, h * 0.86, w, h);
    if (lit) for (const x of [180, 560, 900]) { const lg = g.createRadialGradient(x, h * 0.66, 2, x, h * 0.66, 46); lg.addColorStop(0, 'rgba(255,214,150,.95)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.fillRect(x - 50, h * 0.6, 100, 80); }
    g.strokeStyle = 'rgba(190,205,235,.22)'; g.lineWidth = 2; for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 26); g.stroke(); }
  });
}
/** Rain that follows the camera: line streaks in a box in front of the lens (world space). */
function makeRain(parent, n = 2200, box = [8, 7, 11]) {
  const R = rng(38), seeds = Array.from({ length: n }, () => [R(), R(), R(), R()]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
  const m = new THREE.LineBasicMaterial({ color: 0xc4d2ea, transparent: true, opacity: 0.4, depthWrite: false, fog: false });
  const L = new THREE.LineSegments(geo, m); L.frustumCulled = false; parent.add(L);
  const update = (t, cam, op) => {
    L.visible = op > 0.001; if (!L.visible) return; m.opacity = op;
    const f = new THREE.Vector3(); cam.getWorldDirection(f); f.y = 0; f.normalize();
    const [W, Hh, D] = box, cx = cam.position.x + f.x * (D * 0.5 + 0.6), cy = cam.position.y, cz = cam.position.z + f.z * (D * 0.5 + 0.6);
    const a = geo.attributes.position;
    for (let i = 0; i < n; i++) {
      const [u, v, w, k] = seeds[i], y = cy + Hh / 2 - ((((v * Hh) + t * (7 + 3 * k)) % Hh) + Hh) % Hh;
      const x = cx + (u - 0.5) * W, z = cz + (w - 0.5) * D, len = 0.2 + 0.12 * k;
      a.setXYZ(i * 2, x, y, z); a.setXYZ(i * 2 + 1, x - 0.035, y - len, z + 0.01);
    }
    a.needsUpdate = true;
  };
  return { update, L };
}
/** Window rain (indoor sets): streaks in a thin box just outside the glass. */
function makeWindowRain(parent, x0, x1, y0, y1, z, n = 520) {
  const R = rng(9), seeds = Array.from({ length: n }, () => [R(), R(), R(), R()]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
  const m = new THREE.LineBasicMaterial({ color: 0xb8c6e0, transparent: true, opacity: 0.5, depthWrite: false });
  const L = new THREE.LineSegments(geo, m); L.frustumCulled = false; parent.add(L);
  const update = (t, op = 0.5) => {
    m.opacity = op; const a = geo.attributes.position, Hh = y1 - y0;
    for (let i = 0; i < n; i++) { const [u, v, w, k] = seeds[i], y = y1 - ((((v * Hh) + t * (5 + 2 * k)) % Hh) + Hh) % Hh, x = x0 + u * (x1 - x0), zz = z - w * 0.6; a.setXYZ(i * 2, x, y, zz); a.setXYZ(i * 2 + 1, x - 0.015, y - 0.12, zz); }
    a.needsUpdate = true;
  };
  return { update };
}
/** A flameless battery candle: white wax pillar + a soft "flame" bulb that glows when on (set(k)). */
function makeLedCandle(h = 0.09, r = 0.03) {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(r, r, h, 18), mat(0xf6efe2, 0.6), g, 0, h / 2, 0);
  const fm = new THREE.MeshBasicMaterial({ color: 0x3a2a18, toneMapped: false });
  const flame = mk(new THREE.SphereGeometry(r * 0.32, 12, 10), fm, g, 0, h + r * 0.4, 0); flame.scale.set(1, 1.8, 1);
  const glowT = canvasTex(64, 64, (c2) => { const gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,200,120,.9)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, 64, 64); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  glow.scale.setScalar(r * 3.2); glow.position.y = h + r * 0.4; g.add(glow);
  const set = (k, t = 0, seed = 0) => { const fl = 0.92 + 0.08 * Math.sin(t * 9 + seed * 2.3) * Math.sin(t * 5.3 + seed); fm.color.setRGB(0.23 + 2.2 * k * fl, 0.16 + 1.5 * k * fl, 0.09 + 0.6 * k * fl); glow.material.opacity = 0.5 * k * fl; };
  set(0);
  return { g, set };
}
function makeCandleBox() {
  const g = new THREE.Group(), W = 0.34, H = 0.1, D = 0.22;
  const label = canvasTex(256, 80, (c2, w, h) => { c2.fillStyle = '#c9a06a'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#fff6e0'; c2.fillRect(8, 8, w - 16, h - 16); c2.fillStyle = '#3a2a1a'; c2.font = 'bold 26px Georgia'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('BATTERY', w / 2, h / 2 - 13); c2.fillText('CANDLES', w / 2, h / 2 + 15); });
  const card = mat(0xc9a06a, 0.9, { side: THREE.DoubleSide });
  mk(new THREE.BoxGeometry(W, 0.006, D), card, g, 0, 0.003, 0);
  for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(W, H, 0.006), card, g, 0, H / 2, s * D / 2); mk(new THREE.BoxGeometry(0.006, H, D), card, g, s * W / 2, H / 2, 0); }
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.062), new THREE.MeshStandardMaterial({ map: label, roughness: 0.8 })); lab.position.set(0, H / 2, D / 2 + 0.004); g.add(lab);
  const lid = new THREE.Group(); lid.position.set(0, H, -D / 2); g.add(lid);
  mk(new THREE.BoxGeometry(W + 0.01, 0.006, D + 0.01), card, lid, 0, 0, D / 2);
  const lab2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.062), new THREE.MeshStandardMaterial({ map: label, roughness: 0.8 })); lab2.rotation.x = -PI / 2; lab2.position.set(0, 0.004, D / 2); lid.add(lab2);
  const cands = [];
  for (let i = 0; i < 6; i++) { const C = makeLedCandle(0.07, 0.028); C.g.position.set(-0.105 + (i % 3) * 0.105, 0.006, -0.05 + Math.floor(i / 3) * 0.1); g.add(C.g); cands.push(C); }
  const light = new THREE.PointLight(0xffb870, 0, 2.6, 1.6); light.position.set(0, 0.3, 0.1); g.add(light);
  return { g, lid, cands, light };
}
function makeLantern() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 18), mat(0x2f6a4a, 0.5), g, 0, 0.025, 0);
  const glassM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.5, 0.95), toneMapped: false, transparent: true, opacity: 0.92 });
  mk(new THREE.CylinderGeometry(0.058, 0.058, 0.13, 18), glassM, g, 0, 0.115, 0);
  mk(new THREE.CylinderGeometry(0.075, 0.07, 0.035, 18), mat(0x2f6a4a, 0.5), g, 0, 0.195, 0);
  const handle = mk(new THREE.TorusGeometry(0.05, 0.006, 6, 16, PI), mat(0x2a2a2a, 0.5), g, 0, 0.21, 0);
  const light = new THREE.PointLight(0xffc27a, 0, 3.2, 1.5); light.position.y = 0.16; g.add(light);
  const set = (k) => { glassM.color.setRGB(0.25 + 1.65 * k, 0.22 + 1.28 * k, 0.18 + 0.77 * k); light.intensity = 1.6 * k; };
  set(0); void handle;
  return { g, set, light };
}
function makeUmbrella() {
  const g = new THREE.Group();
  const cm = new THREE.MeshStandardMaterial({ color: 0x2f4f8a, roughness: 0.55, side: THREE.DoubleSide });
  const can = mk(new THREE.ConeGeometry(0.58, 0.24, 16, 1, true), cm, g, 0, 0.82, 0);
  for (let i = 0; i < 8; i++) { const b = mk(new THREE.SphereGeometry(0.012, 6, 5), mat(0xf2c14e, 0.5), g, Math.cos(i / 8 * PI * 2) * 0.58, 0.7, Math.sin(i / 8 * PI * 2) * 0.58); void b; }
  mk(new THREE.CylinderGeometry(0.009, 0.009, 0.86, 8), mat(0x3a3a3a, 0.4), g, 0, 0.43, 0);
  mk(new THREE.TorusGeometry(0.035, 0.009, 6, 12, PI), mat(0x6a4428, 0.6), g, -0.035, 0.0, 0).rotation.z = PI;
  void can; return g;
}
/** Pip's yellow raincoat (rides on pip.T like 031's staff vest). */
function makeRaincoat(pip) {
  const g = new THREE.Group(); pip.T.add(g);
  const y = new THREE.MeshStandardMaterial({ color: 0xf2c832, roughness: 0.35, side: THREE.DoubleSide });
  const sh = mk(new THREE.CylinderGeometry(0.094, 0.094, 0.215, 28, 1, true, PI - 2.0, 4.0), y, g, 0, 0.006, -0.005); sh.rotation.x = PI / 2; sh.scale.set(1.08, 1, 1.0);
  const trim = mat(0xe2a822, 0.4);
  for (const z of [-0.11, 0.1]) { const tr = mk(new THREE.TorusGeometry(0.095, 0.006, 6, 28, 4.0), trim, g, 0, 0.006, z); tr.rotation.z = PI / 2 - 2.0 + PI; tr.scale.set(1.08, 1, 1); }
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.008, 8, 6), mat(0x2a6ab0, 0.4), g, s * 0.03, 0.1, 0.06);
  return g;
}
/** The blanket fort: a quilt canopy over four broom-handle posts, side + back drapes, a floor nest of pillows, string lights. */
function makeFort(root) {
  const g = new THREE.Group(); root.add(g);
  const { w, d, h } = FORT;
  const qa = new THREE.MeshStandardMaterial({ map: quiltTexture('#d98a6a', '#f6e2b8'), roughness: 1, side: THREE.DoubleSide });
  const qb = new THREE.MeshStandardMaterial({ map: quiltTexture('#7fa6c4', '#f2efe8'), roughness: 1, side: THREE.DoubleSide });
  const qc = new THREE.MeshStandardMaterial({ map: quiltTexture('#b9a3e3', '#f2c14e'), roughness: 1, side: THREE.DoubleSide });
  const canopy = new THREE.PlaneGeometry(w + 0.2, d + 0.2, 24, 18); canopy.rotateX(-PI / 2);
  { const p = canopy.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), z = p.getZ(i) / (d / 2); p.setY(i, -0.13 * (1 - Math.min(1, x * x)) * (1 - Math.min(1, z * z)) - 0.05 * Math.max(0, Math.abs(x) - 0.95) * 6 - 0.04 * Math.max(0, Math.abs(z) - 0.95) * 6); } canopy.computeVertexNormals(); }
  const top = mk(canopy, qa, g, 0, h, 0);
  const drape = (W, Hh, m, x, z, ry, wave) => { const geo = new THREE.PlaneGeometry(W, Hh, 20, 8); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / W, v = (Hh / 2 - p.getY(i)) / Hh; p.setZ(i, wave * Math.sin(u * 9) * v + 0.06 * v * v); } geo.computeVertexNormals(); const mm = mk(geo, m, g, x, Hh / 2, z); mm.rotation.y = ry; return mm; };
  drape(w + 0.1, h, qb, 0, -d / 2 - 0.05, 0, 0.03);
  drape(d + 0.1, h, qc, -w / 2 - 0.06, 0, PI / 2, 0.035);
  drape(d * 0.7, h, qb, w / 2 + 0.06, -d * 0.15, -PI / 2, 0.035);
  const val = new THREE.PlaneGeometry(w + 0.2, 0.2, 20, 2); { const p = val.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.02 * Math.sin(p.getX(i) * 7)); val.computeVertexNormals(); }
  mk(val, qa, g, 0, h - 0.13, d / 2 + 0.1);
  const wood = mat(0x8a5a36, 0.6);
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) mk(new THREE.CylinderGeometry(0.014, 0.014, h, 8), wood, g, x, h / 2, z);
  // floor nest: a mattress of quilts + pillows
  mk(new RoundedBoxGeometry(w - 0.1, 0.07, d - 0.1, 2, 0.03), qc, g, 0, 0.035, 0);
  const pil = (x, z, c2, r = 0) => { const p = mk(new THREE.CapsuleGeometry(0.1, 0.28, 6, 12), mat(c2, 0.95), g, x, 0.14, z); p.rotation.set(0, r, PI / 2); p.scale.set(1, 1, 0.55); };
  pil(-0.75, -0.62, 0xf2efe8, 0.2); pil(0.0, -0.66, 0xf6d6e2); pil(0.72, -0.62, 0xd9e6c8, -0.2);
  const lights = makeStringLights([[-w / 2 - 0.05, h - 0.02, d / 2 + 0.1], [0, h - 0.06, d / 2 + 0.12], [w / 2 + 0.05, h - 0.02, d / 2 + 0.1]].map((q) => new THREE.Vector3(...q)), { colors: [0xffd08a, 0xffb86a, 0xfff0c0], step: 0.16, sag: 0.08, r: 0.018 });
  g.add(lights.g);
  g.position.set(FORT.x, 0, FORT.z);
  void top;
  return { g, lights };
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- sets
  const city = buildCity(studio); const cityFog = scene.fog;
  city.setTime({ day: 0, golden: 0, moon: 0, milky: 0, power: 1 });
  const liv = buildLivingRoom(studio, { home: true }); liv.root.position.set(...OFF.liv);
  const ros = buildLivingRoom(studio, { seed: 7 }); ros.root.position.set(...OFF.ros); ros.setMode('night');
  const sub = buildSuburb(studio); sub.root.position.set(...OFF.sub);
  const hw = dressHalloween(studio, sub, {});
  const subFog = new THREE.Fog(0x1a1e2e, 9, 95);
  liv.setDawn(0);
  const ROOTS = { city: city.root, liv: liv.root, sub: sub.root, ros: ros.root };
  const FAR = { city: 1500, liv: 40, sub: 330, ros: 40 };
  const FOG = { city: cityFog, liv: null, sub: subFog, ros: null };

  // storm night on Maple St: dark sky, no moon, street lamps + porches out
  sub.root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300) { o.material.color.setRGB(0.2, 0.22, 0.3); }
    if (o.material.emissive && o.material.emissive.getHex() === 0xffc070) { o.material.emissiveIntensity = 0; o.material.color.set(0x5a5a58); }
  });
  hw.moon.visible = false; sub.root.children.forEach((o) => { if (o.isMesh && o.geometry.type === 'CircleGeometry' && o.geometry.parameters.radius === 26) o.visible = false; });
  hw.houses.forEach((h2) => h2.setLit(0));
  const hallDark = hw.houses[1].hall.material.clone(); hallDark.color.setRGB(0.12, 0.11, 0.14); hw.houses[1].hall.material = hallDark;

  // window views: a storm outside (lit street / dark street), rain on the glass
  const viewMat = (R0) => R0.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 9 && !o.material.transparent).material;
  const livView = viewMat(liv.root), rosView = viewMat(ros.root);
  const VIEW = { lit: stormView(true), dark: stormView(false) };
  const setView = (m, k) => { const tx = VIEW[k]; if (m.map !== tx) { m.map = tx; m.needsUpdate = true; } };
  const livRain = makeWindowRain(liv.root, -0.75, 1.55, 0.8, 2.3, -2.9), rosRain = makeWindowRain(ros.root, -0.75, 1.55, 0.8, 2.3, -2.9);
  const outRain = makeRain(scene);
  // lamp shades (emissive) so they go dark with the power
  const shadeMats = (R0) => { const s = []; R0.traverse((o) => { if (o.isMesh && o.material.emissive && o.material.emissive.getHex() === 0xffc777 && o.material.emissiveIntensity > 0) s.push(o.material); }); return s; };
  const livShades = shadeMats(liv.root), rosShades = shadeMats(ros.root);
  const livShade0 = livShades.map((m) => m.emissiveIntensity);
  // the TV screens go black in a blackout
  const tvOff = (R0) => R0.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 1.02) o.userData.tv = true; });
  tvOff(liv.root); tvOff(ros.root);
  const tvs = []; [liv.root, ros.root].forEach((R0) => R0.traverse((o) => { if (o.userData.tv) tvs.push(o); }));

  // ---------------------------------------------------------------- props
  const fort = makeFort(liv.root);
  const lantern = makeLantern(); lantern.g.position.set(FORT.x - 0.82, 0.07, FORT.z + 0.35); liv.root.add(lantern.g);
  const box = makeCandleBox(); scene.add(box.g);   // posed in world space (W()), so it lives in the scene, not in liv.root
  const placed = Array.from({ length: 6 }, (_, i) => { const C = makeLedCandle(i % 2 ? 0.12 : 0.09, 0.032); liv.root.add(C.g); return C; });
  // where the candles live after the box: 3 on the coffee table, 3 on the console (high, away from paws and blankets)
  const SPOTS = [[0.15, 0.4, -0.35], [0.3, 0.4, -0.55], [0.72, 0.4, -0.4], [-3.85, 0.8, -2.6], [-3.6, 0.8, -2.55], [-3.05, 0.8, -2.6]];
  placed.forEach((C, i) => C.g.position.set(...SPOTS[i]));
  const candleL = [new THREE.PointLight(0xffb06a, 0, 3.4, 1.5), new THREE.PointLight(0xffb06a, 0, 3.4, 1.5)];
  candleL[0].position.set(0.4, 0.75, -0.2); candleL[1].position.set(-3.45, 1.15, -2.2); candleL.forEach((L) => liv.root.add(L));
  const bunny = makeBunny(); scene.add(bunny);
  const flash = makeFlashlight({ length: 3.2, radius: 0.6, color: 0xffe6b8 }); scene.add(flash.g);
  flash.spot.distance = 8; flash.spot.angle = 0.42; flash.spot.penumbra = 0.6; flash.spot.decay = 1.4;
  const umbrella = makeUmbrella(); scene.add(umbrella);
  const remote = new THREE.Group(); mk(new RoundedBoxGeometry(0.05, 0.02, 0.17, 2, 0.008), mat(0x222428, 0.4), remote); for (let i = 0; i < 4; i++) mk(new THREE.SphereGeometry(0.006, 6, 5), mat(i ? 0x9aa3ad : 0xd2483f, 0.4), remote, 0, 0.012, 0.05 - i * 0.025); scene.add(remote);
  const sock = mk(new THREE.CapsuleGeometry(0.03, 0.14, 4, 10), new THREE.MeshStandardMaterial({ roughness: 0.95, map: canvasTex(64, 64, (g2, w2, h2) => { g2.fillStyle = '#e2574c'; g2.fillRect(0, 0, w2, h2); g2.fillStyle = '#fff6e0'; for (let y = 0; y < h2; y += 16) g2.fillRect(0, y, w2, 6); }) }), scene);
  // Mia's quilt (the hiding lump): a dome that swings over her from behind; pivot at its back edge on the floor
  const quilt = new THREE.Group(); liv.root.add(quilt);
  const quiltDome = mk(new THREE.SphereGeometry(0.47, 28, 16, PI / 2 + 0.5, PI * 2 - 1.0, 0, PI / 2), new THREE.MeshStandardMaterial({ map: quiltTexture('#b9a3e3', '#f2c14e'), roughness: 1, side: THREE.DoubleSide }), quilt);
  quiltDome.scale.set(1.0, 1.7, 1.0);

  // ---------------------------------------------------------------- cast
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const coat = makeRaincoat(pip);
  const bean = makeBreed('chihuahua', { name: 'BEAN', seed: 41, collar: 0xe86aa0, fur: 0x2e2826, white: 0xf3e6d4, cream: 0xc98a4a, earInner: 0xe8a0a0 }); scene.add(bean.g);
  const mia = makeMia(), mom = makeMom({ outfit: 'day' }), dad = makeDad({ outfit: 'day' });
  const rosa = makePerson({ skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0xe07a2a, pants: 0x5a3a5a, shoes: 0x8a5a5a }); rosa.kid = 1;
  const miaL = makeMia(); const carrier = new THREE.Group(); scene.add(carrier); carrier.add(miaL.root);
  const CAST = [mia, mom, dad, rosa];
  CAST.forEach((P) => scene.add(P.root));
  const GLASSES = new Set([dad, rosa]);

  const W = (set, x, y, z) => new THREE.Vector3(x + OFF[set][0], y + OFF[set][1], z + OFF[set][2]);
  const put = (P, set, o, rootY = 0) => { const p = basePose(); Object.assign(p, o); if (GLASSES.has(P)) p.glasses = true; p.x += OFF[set][0]; p.z += OFF[set][2]; P.root.visible = true; poseScaled(P, p, rootY + OFF[set][1]); return p; };
  const dogAt = (d, set, x, z, rotY, st, t, y = 0) => { d.g.visible = true; d.g.position.set(x + OFF[set][0], y + OFF[set][1], z + OFF[set][2]); d.g.rotation.set(0, rotY, 0); d.update(t, st); };
  const holdBunny = (d, t, size = PIPS) => { d.anchors.mouth.add(bunny); bunny.visible = true; bunny.position.set(0, -0.05, 0.03); bunny.rotation.set(-1.2, 0, 0.3 * Math.sin(t * 8)); bunny.scale.setScalar(1.25 / size); };
  const dropBunny = (v, rotY = 0, roll = 0) => { if (bunny.parent !== scene) scene.add(bunny); bunny.visible = true; bunny.position.copy(v); bunny.rotation.set(0, rotY, roll); bunny.scale.setScalar(1.25); };
  const mouthFlash = () => { pip.anchors.mouth.add(flash.g); flash.g.position.set(0, -0.035, 0.085); flash.g.rotation.set(0.05, 0, PI / 2); flash.g.scale.setScalar(0.75 / PIPS); };
  const handFlash = (P, side, target) => { if (flash.g.parent !== scene) scene.add(flash.g); flash.g.scale.setScalar(0.85); P.root.updateMatrixWorld(true); flash.aim(handWorld(P, side), target); };
  const sideLie = (P, center, up, face, curl = 0.2) => {
    const x = new THREE.Vector3().crossVectors(up, face).normalize();
    carrier.position.copy(center); carrier.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up.clone().normalize(), face.clone().normalize()));
    const p = basePose(); Object.assign(p, { x: 0, z: 0, y: 0, crouch: 0.28 * curl / 0.2, footFwd: 0.35 * curl / 0.2, lean: 0.25, headPitch: -0.1, smile: 1 });
    return p;
  };

  // ---------------------------------------------------------------- lighting per room
  // mode: 'on' (lamps on), 'out' (blackout: moonlight through the storm), 'candle' (out + battery candles), 'fort' (candles + lantern)
  function livLights(mode, t, k = 1) {
    const L = liv.lights, on = mode === 'on' ? k : 0;
    setView(livView, mode === 'on' ? 'lit' : 'dark');
    L.hemi.color.set(0xb8c4ff); L.hemi.intensity = lerp(0.3, 0.6, on); L.sun.color.set(0x8fa4e0); L.sun.intensity = lerp(0.42, 0.35, on);
    L.lampL.intensity = 3.0 * on; L.pend.intensity = 1.6 * on; L.fillL.intensity = lerp(0.3, 1.1, on); L.fillD.intensity = lerp(0.2, 0.5, on);
    liv.setConsole(on); liv.setNightlight(0.6 * on); liv.setUpstairs(0.45 * on);
    livShades.forEach((m, i) => (m.emissiveIntensity = livShade0[i] * on));
    tvs.forEach((tv) => (tv.material.color.setScalar(lerp(0.04, 1, on))));
    const cand = mode === 'candle' || mode === 'fort' ? 1 : 0;
    candleL[0].intensity = 1.5 * cand; candleL[1].intensity = 1.2 * cand;
    placed.forEach((C, i) => C.set(cand, t, i));
    lantern.set(mode === 'fort' ? 1 : 0); fort.lights.setLit(mode === 'fort' ? 0.7 : 0);
    box.light.intensity = 0; box.cands.forEach((C) => C.set(0));
  }
  function rosLights() {
    const L = ros.lights; setView(rosView, 'dark');
    L.hemi.color.set(0xb8c4ff); L.hemi.intensity = 0.32; L.sun.color.set(0x8fa4e0); L.sun.intensity = 0.5; L.lampL.intensity = 0; L.pend.intensity = 0; L.fillL.intensity = 0.32; L.fillD.intensity = 0.15;
    rosShades.forEach((m) => (m.emissiveIntensity = 0));
  }

  // ---------------------------------------------------------------- update
  let cur = null, camO = null;
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', set: 'liv', t0: 200, t1: 300 } : shotAt(t), Sx = shot.set, cam = shot.cam;
    if (Sx !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === Sx; scene.fog = FOG[Sx]; cur = Sx; }
    studio.camera.far = FAR[Sx]; studio.camera.near = Sx === 'city' ? 0.2 : 0.03; studio.fill.intensity = story.look.fill;
    const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;

    // reset
    CAST.forEach((P) => (P.root.visible = false)); miaL.root.visible = false;
    [pip.g, bean.g, bunny, flash.g, umbrella, remote, sock, box.g, quilt, lantern.g, fort.g].forEach((g) => (g.visible = false));
    coat.visible = false; flash.setOn(0); outRain.L.visible = false;
    if (bunny.parent !== scene) scene.add(bunny);
    if (flash.g.parent !== scene) scene.add(flash.g);
    bunny.scale.setScalar(1.25); bunny.rotation.set(0, 0, 0);
    placed.forEach((C) => (C.g.visible = false));
    camO = null;

    if (cam === 'lineup') return lineup(t);
    BEATS[cam](t, u);

    // camera
    let P, Aim, fov, amp;
    if (camO) { P = camO.P; Aim = camO.A; fov = camO.fov; amp = camO.amp ?? 0.003; }
    else { const C = CAMS[cam], o = OFF[Sx]; P = C.p[0].map((v, i) => lerp(v, C.p[1][i], e) + o[i]); Aim = C.a[0].map((v, i) => lerp(v, C.a[1][i], e) + o[i]); fov = C.fov; amp = C.amp; }
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(EV.bump, 0.012);
    setCamera(P, Aim, fov, t, amp); studio.camera.updateMatrixWorld();
    if (Sx === 'sub' || Sx === 'city') outRain.update(t, studio.camera, Sx === 'city' ? (cam === 'lights' ? 0.25 * (1 - u) : 0.32) : 0.42);
    livRain.update(t, 0.5); rosRain.update(t, 0.55);
  }

  // ---------------------------------------------------------------- the evening (lamps on): who sits where
  const family = (t, o = {}) => {
    // Mom in the armchair, Dad on the sofa, Mia on the rug
    put(mom, 'liv', { x: -0.35, z: -1.42, rotY: 0.1, y: -0.345, footFwd: 0.42, armA: LAP_A, armB: o.momB ?? LAP_B, headPitch: o.momPitch ?? 0.2, headYaw: o.momYaw ?? 0.15, eyes: blink(t, 6), mouth: o.momMouth ?? 'smile', lean: 0.08 });
    put(dad, 'liv', { x: 1.25, z: -2.0, rotY: -0.25, y: -0.285, footFwd: 0.42, armA: LAP_A, armB: o.dadB ?? LAP_B, headPitch: o.dadPitch ?? 0.25, headYaw: o.dadYaw ?? -0.2, eyes: blink(t, 4), mouth: o.dadMouth ?? 'smile', lean: 0.05 });
  };
  const lampFlicker = (t) => { const [a, b] = EV.flicker; if (t < a || t > b) return 1; return 0.35 + 0.65 * (Math.sin(t * 61) > 0.1 ? 1 : 0.15); };

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) {
      livLights('on', t);
      family(t);
      const ear = pulseAt(t, [EV.thunder[0] + 0.25], 0.5);
      dogAt(pip, 'liv', 0.5, 0.05, 0.25, { sit: 1, headPitch: -0.12, tilt: K(t, [[0, 0.0], [1.0, 0.25], [2.2, 0.25], [3.0, -0.08]]), ears: 1 - 0.3 * ear, earL: 0.3 * ear, wag: 0.55, lookY: 0.4, headYaw: -0.05 + 0.25 * ear }, t);
    },
    home(t) {
      livLights('on', t, lampFlicker(t));
      family(t, { dadYaw: -0.45, dadPitch: 0.35, momYaw: 0.35, momPitch: 0.35 });
      // Mia on the rug wiggles the bunny; Pip bows, hops, pounces and tugs it
      const grab = 6.6;
      const p = put(mia, 'liv', { x: 0.15, z: 0.25, rotY: 0.55, ...FLOOR, lean: 0.1, armA: LAP_A, armB: t < grab ? mixArm(OFFER_B, A(-1.0, 0.3, -0.6, -0.3), 0.5 + 0.5 * Math.sin(t * 7)) : A(-0.9, 0.2, -0.6, -0.3), headPitch: 0.28, eyes: blink(t, 2), mouth: t > grab && t < 7.6 ? 'o' : 'smile' });
      mia.root.updateMatrixWorld(true); const hp = handWorld(mia, 1);
      const bow = K(t, [[3.4, 0], [4.2, 1], [5.0, 0.2], [5.6, 1], [6.3, 0]]);
      const hop = Math.max(0, Math.sin(clamp((t - 6.25) / 0.4) * PI)) * 0.12;
      const px = 0.62 + 0.1 * Math.sin(t * 2.1), pz = 0.62 - 0.12 * smooth((t - 6.2) / 0.4);
      dogAt(pip, 'liv', px, pz, faceToward(px, pz, hp.x - OFF.liv[0], hp.z), { lean: 0.35 * bow, headPitch: -0.15 * bow, wag: 1, wagRate: 5, ears: 1, mouth: 'pant', hop, walk: t > 6.0 && t < 6.6 ? 1 : 0, dist: t * 0.5 }, t);
      if (t < grab) { bunny.position.copy(hp).add(new THREE.Vector3(0, -0.12, 0.03)); bunny.rotation.set(0, 0.6, 0.18 * Math.sin(t * 7)); bunny.visible = true; }
      else holdBunny(pip, t);
      void p;
    },
    town(t) {
      const [a, b] = EV.blackout;
      city.setTime({ day: 0, golden: 0, moon: 0, milky: 0, power: K(t, [[a, 1], [b, 0]], (x) => x) });
      city.setWeather(t, 'rain'); city.setShadowFocus(-6, 0, 30);
    },
    dark(t) {
      const k = t < EV.homeOut ? (Math.sin(t * 47) > 0 ? 0.7 : 0.25) : 0;
      livLights(t < EV.homeOut ? 'on' : 'out', t, k);
      const look = smooth((t - EV.homeOut - 0.15) / 0.4);
      family(t, { dadPitch: lerp(0.25, -0.35, look), momPitch: lerp(0.2, -0.3, look), dadYaw: -0.1, momYaw: 0.2, dadMouth: look > 0.5 ? 'o' : 'smile', momMouth: look > 0.5 ? 'o' : 'smile', dadB: mixArm(LAP_B, HEART_B, look), momB: mixArm(LAP_B, HEART_B, look) });
      put(mia, 'liv', { x: 0.15, z: 0.25, rotY: 0.35, ...FLOOR, lean: 0.1, armA: mixArm(LAP_A, HUG_A, look), armB: mixArm(LAP_B, HUG_B, look), headPitch: lerp(0.2, -0.3, look), headYaw: 0.25 * Math.sin(t * 2.5) * look, eyes: 'open', mouth: look > 0.4 ? 'o' : 'smile' });
      mia.root.updateMatrixWorld(true); bunny.visible = true; bunny.position.copy(handWorld(mia, 1).add(handWorld(mia, -1)).multiplyScalar(0.5)).add(new THREE.Vector3(0, -0.05, 0.05)); bunny.rotation.set(0, 0.4, 0);
      dogAt(pip, 'liv', 0.6, 0.6, 0.1 + 0.6 * Math.sin(t * 1.3) * look, { sit: 1, ears: 1, earL: 0.1 * Math.sin(t * 3), wag: 0.6, headPitch: -0.2 * look, headYaw: 0.5 * Math.sin(t * 1.6) * look, lookY: 0.4 * look, tilt: 0.15 * look, mouth: 'smile' }, t);
    },
    hide(t) {
      livLights('out', t);
      const pull = smooth((t - 14.45) / 0.45);
      put(mia, 'liv', { x: MOUND[0], z: MOUND[1], rotY: 0.2, ...FLOOR, lean: 0.08 * pull, crouch: 0.0, armA: mixArm(HUG_A, A(-0.2, 0.2, -2.4, 0.9), pull), armB: mixArm(HUG_B, A(-0.2, 0.2, -2.4, -0.9), pull), headPitch: 0.2, headYaw: pull > 0.9 ? 0.45 * Math.sin((t - 14.9) * 3.2) : 0, eyes: 'open', mouth: 'o' });
      quilt.visible = true; quilt.position.set(MOUND[0], 0, MOUND[1] + 0.02); quilt.rotation.set(-PI / 2 * (1 - pull) + 0.08, 0.2, 0);
      mia.root.updateMatrixWorld(true); bunny.visible = true; bunny.position.copy(handWorld(mia, 1)).add(new THREE.Vector3(0, -0.1, 0.02)); bunny.rotation.set(0, 0.4, 0);
      if (pull > 0.95) bunny.visible = false;
      dogAt(pip, 'liv', 0.22, 0.56, -0.6, { sit: 1, ears: 1, tilt: K(t, [[14.2, 0], [15.2, 0.32], [16.0, -0.3], [16.8, 0.2]]), wag: 0.4, lookX: -0.3, headPitch: 0.05 }, t);
    },
    bump(t) {
      livLights('out', t);
      const B0 = EV.bump;
      put(mom, 'liv', { x: -0.35, z: -1.42, rotY: 0.1, y: -0.345, footFwd: 0.42, armA: LAP_A, armB: HEART_B, headPitch: -0.1, headYaw: 0.3, eyes: 'open', mouth: 'o' });
      const w = walkLegs(t, [1.05, -1.55], [{ t0: 16.8, t1: B0, pts: [[0.62, -0.92]] }]);
      const ouch = t > B0 ? 1 : 0, hop = ouch * Math.abs(Math.sin((t - B0) * 7.5)) * 0.07 * (1 - smooth((t - 19.0) / 0.4));
      put(dad, 'liv', { x: t < B0 ? w.x : 0.62 - 0.06 * smooth((t - B0) / 0.2), z: t < B0 ? w.z : -0.92 - 0.08 * smooth((t - B0) / 0.2), rotY: t < B0 ? (w.head ?? -0.6) : -0.45 + 0.15 * Math.sin(t * 6), dist: w.dist, speed: t < B0 ? w.speed * 0.6 : 0, crouch: 0.22 * ouch, lean: 0.5 * ouch, armA: ouch ? SHIN_A : ZOMBIE_A, armB: ouch ? SHIN_B : ZOMBIE_B, headPitch: ouch ? 0.15 : -0.05, headYaw: ouch ? 0 : 0.35 * Math.sin(t * 2.2), eyes: 'open', mouth: ouch ? 'o' : 'flat' }, hop);
      dogAt(pip, 'liv', 1.2, -1.4, faceToward(1.2, -1.4, 0.62, -0.92), { sit: 1, ears: 1, tilt: ouch ? 0.32 : 0, headPitch: -0.3, lookY: 0.6, wag: 0.4 }, t);
    },
    drawer(t) {
      livLights('out', t);
      const [r0, r1, r2] = EV.rummage, turn1 = smooth((t - r1) / 0.3) * (1 - smooth((t - r2 + 0.25) / 0.25)), turn2 = smooth((t - r2) / 0.3); void r0;
      const turn = Math.max(turn1, turn2);
      const dig = t < r1 ? 1 : t < r2 ? (1 - turn1) : 1 - turn2;
      const p = put(mom, 'liv', { x: -3.4, z: -2.12, rotY: PI - 0.15 - 1.25 * turn, lean: 0.25 * dig, crouch: 0.1 * dig, armA: dig > 0.5 ? mixArm(REACH_A, A(-1.0, 0.1, -0.5, 0.2), 0.5 + 0.5 * Math.sin(t * 13)) : SHRUG_A, armB: dig > 0.5 ? mixArm(REACH_B, A(-1.0, 0.1, -0.5, -0.2), 0.5 + 0.5 * Math.sin(t * 11 + 1)) : HOLDUP_B, headPitch: 0.35 * dig - 0.05, headYaw: 0, eyes: 'open', mouth: 'flat' });
      mom.root.updateMatrixWorld(true); const hb = handWorld(mom, 1);
      if (t > r1 && t < r2 - 0.1) { remote.visible = true; remote.position.copy(hb).add(new THREE.Vector3(0, 0.05, 0)); remote.rotation.set(0.4, p.rotY, 0.2); }
      if (t > r2) { sock.visible = true; sock.position.copy(hb).add(new THREE.Vector3(0, -0.07, 0)); sock.rotation.set(0.1 * Math.sin(t * 6), 0, 0.15 * Math.sin(t * 5)); }
      dogAt(pip, 'liv', -3.0, -1.72, faceToward(-3.0, -1.72, -3.4, -2.12) + 0.4, { sit: 1, ears: 1, headPitch: -0.35, lookY: 0.5, tilt: K(t, [[19.4, 0], [20.2, 0.3], [21.0, -0.25], [21.8, 0.3]]), wag: 0.5 }, t);
    },
    rosa(t) {
      rosLights();
      const th = pulseAt(t, [EV.thunder[3] + 0.2], 0.6), hug = smooth((t - EV.thunder[3] - 0.2) / 0.4);
      put(rosa, 'ros', { x: -0.35, z: -1.42, rotY: 0, y: -0.345, footFwd: 0.42, lean: 0.12 + 0.12 * hug, armA: mixArm(A(-0.6, 0.1, -0.9, 0.45), HUG_A, hug), armB: mixArm(A(-0.75, 0.15, -0.55 - 0.25 * Math.sin(t * 3.2), -0.4), HUG_B, hug), headPitch: 0.4 - 0.15 * th, headYaw: K(t, [[22.0, 0.35], [23.0, 0.35], [23.6, -0.1]]), eyes: blink(t, 5), mouth: 'flat' });
      dogAt(bean, 'ros', -0.35, -1.2 + 0.02 * hug, 0, { sit: 1, shiver: 0.8 + 0.2 * th, ears: 0.25, sad: 0.5, tailDown: 0.9, headPitch: 0.05 - 0.1 * hug, lookY: 0.2, earsBack: 0.4 * th }, t, 0.55);
    },
    eyes(t) {
      livLights('out', t);
      const sh = smooth((t - 25.9) / 0.6), leave = smooth((t - 28.7) / 0.6);
      dogAt(pip, 'liv', 0.4 - 0.3 * leave, 0.3 - 0.15 * leave, lerp(0.0, -1.2, leave), { sit: 1 - leave, walk: leave > 0.05 ? 1 : 0, dist: t * 0.8, ears: 1, earR: 0.12 * Math.sin(t * 2.6), wag: 0.75, wagRate: 4.5, headYaw: 0.4 * Math.sin((t - 25.4) * 1.4) * (1 - leave), headPitch: -0.08, lookX: 0.6 * Math.sin((t - 25.4) * 1.4), lookY: 0.2, mouth: 'smile', shine: sh * (0.75 + 0.15 * Math.sin(t * 1.7)) * (1 - leave * 0.5) }, t);
    },
    torchA(t) {
      livLights('out', t);
      const G = EV.grab, C0 = EV.click, FL = [-0.32, 0.32];
      const w = walkLegs(t, [0.55, 0.4], [{ t0: 29.6, t1: G - 0.1, pts: [[FL[0] + 0.2, FL[1] + 0.02]] }]);
      const lift = smooth((t - G) / 0.35);
      dogAt(pip, 'liv', w.x, w.z, -PI / 2 + 0.25 + 0.3 * lift, { walk: t < G - 0.1 ? 1 : 0, dist: w.dist, ears: 1, wag: 0.8, headPitch: t < G ? 0.55 * smooth((t - G + 0.45) / 0.35) : lerp(0.55, -0.05, lift), mouth: t > G - 0.15 ? 'open' : 'smile', open: t > G - 0.15 ? 0.12 : 0, shine: 0.55 * (1 - smooth((t - C0) / 0.3)), eyes: t > C0 && t < C0 + 0.25 ? 'wide' : 'open' }, t);
      flash.g.visible = true;
      if (t < G) { flash.g.position.set(FL[0] + OFF.liv[0], 0.026, FL[1]); flash.g.rotation.set(0, -PI / 2 - 0.3, PI / 2); flash.g.scale.setScalar(0.85); }
      else { mouthFlash(); flash.setOn(t > C0 ? smooth((t - C0) / 0.06) : 0, 0.3); }
    },
    torchB(t) {
      livLights('out', t);
      const C0 = EV.click, sw = smooth((t - 31.75) / 0.85);
      dogAt(pip, 'liv', -0.2, 0.3, lerp(-PI / 2 + 0.25, -PI - 0.16, sw), { sit: 0.6 * sw, ears: 1, wag: 0.9, wagRate: 5, headPitch: lerp(-0.05, -0.5, sw), mouth: 'open', open: 0.12 }, t);
      mouthFlash(); flash.g.visible = true; flash.setOn(1, 0.3);
      const lit = smooth((t - 32.4) / 0.25);
      put(dad, 'liv', { x: 0.02, z: -1.6, rotY: 0.1, armB: mixArm(mixArm(ZOMBIE_B, HEART_B, lit), THUMB_B, smooth((t - 32.75) / 0.35)), armA: mixArm(ZOMBIE_A, REST, lit), headPitch: 0.25, headYaw: 0.05, eyes: lit > 0.3 && t < 32.8 ? 'closed' : 'open', mouth: lit > 0.3 ? 'smile' : 'flat' });
      void C0;
    },
    candles(t) {
      livLights('out', t);
      const [g0, g1] = EV.tug, slide = smooth((t - g0) / (g1 - g0)), kneel = smooth((t - 33.9) / 0.45), lift = smooth((t - 34.25) / 0.35), lid = smooth((t - EV.lid) / 0.35);
      const on = EV.candles.map((c2) => smooth((t - c2) / 0.12));
      const glow = on.reduce((x, y) => x + y, 0) / 6;
      // Mom kneels, lifts the box to her chest and opens it: battery candles click on and light her face
      const MR = 0.87;
      put(mom, 'liv', { x: -3.6, z: -2.05, rotY: MR, y: lerp(0, KNEEL.y, kneel), footFwd: lerp(0, KNEEL.footFwd, kneel), lean: lerp(0.35, 0.12, lift) + 0.3 * kneel * (1 - lift), armA: mixArm(REACH_A, A(-1.0, 0.15, -0.95, 0.3), lift), armB: mixArm(REACH_B, A(-1.0, 0.15, -0.95, -0.3), lift), headPitch: lerp(0.5, 0.3, lift), eyes: blink(t, 3), mouth: on[1] > 0.5 ? 'smile' : 'o' });
      mom.root.updateMatrixWorld(true);
      const hands = handWorld(mom, 1).add(handWorld(mom, -1)).multiplyScalar(0.5).add(new THREE.Vector3(Math.sin(MR) * 0.06, -0.15, Math.cos(MR) * 0.06));
      const floor = W('liv', -3.42, 0, lerp(-2.6, -2.12, slide));
      box.g.visible = true; box.g.position.lerpVectors(floor, hands, lift); box.g.rotation.order = 'YXZ'; box.g.rotation.set(0.38 * lift, lerp(0.15, MR, lift), 0); box.lid.rotation.x = -1.75 * lid;
      box.cands.forEach((C, i) => C.set(on[i], t, i)); box.light.intensity = 0.55 * glow;
      // Pip tugs it out by the front edge, then sits beside her, wagging, looking up at the glow
      const back = smooth((t - g1) / 0.5), bz = lerp(-2.6, -2.12, slide);
      dogAt(pip, 'liv', lerp(-3.42, -3.98, back), lerp(bz + 0.27, -1.68, back), lerp(PI, 2.1, back), { sit: back, lean: 0.25 * (1 - back), headPitch: lerp(0.6, -0.35 - 0.15 * glow, back), mouth: back < 0.5 ? 'open' : 'pant', open: back < 0.5 ? 0.14 : 0, ears: 1, wag: 0.4 + 0.6 * back, wagRate: 5, walk: (t > g0 && t < g1) || (back > 0.05 && back < 0.95) ? 0.6 : 0, dist: -t * 0.3, lookY: 0.5 * back }, t);
      // the flashlight he brought lies on the floor, pointed at the console
    },
    bunny(t) {
      livLights('candle', t);
      placed.forEach((C) => (C.g.visible = true));
      const P0 = EV.pickBunny, D0 = EV.dropBunny, PK = EV.peek, HG = EV.hug;
      const src = [0.85, 0.55];
      const pk = smooth((t - PK) / 0.3), off = smooth((t - HG) / 0.45);
      quilt.visible = true; quilt.position.set(MOUND[0], 0, MOUND[1] + 0.02); quilt.rotation.set(0.08 - 0.35 * pk - (PI / 2 - 0.35) * off, 0.2, 0);
      put(mia, 'liv', { x: MOUND[0], z: MOUND[1], rotY: 0.35, ...FLOOR, lean: 0.35 * (1 - off) + 0.25 * off, armA: off > 0.1 ? mixArm(HUG_A, A(-0.75, 0.0, -1.2, 0.6), off) : A(-0.2, 0.2, -2.4, 0.9), armB: off > 0.1 ? mixArm(HUG_B, A(-0.75, 0.0, -1.2, -0.6), off) : mixArm(A(-0.2, 0.2, -2.4, -0.9), REACH_B, pk), headPitch: 0.25, eyes: off > 0.6 ? 'open' : 'open', mouth: pk > 0.5 ? 'smile' : 'flat' });
      mia.root.updateMatrixWorld(true);
      const w = walkLegs(t, [src[0], src[1]], [{ t0: P0 + 0.3, t1: D0 - 0.1, pts: [[0.42, 0.52]] }]);
      const nuz = smooth((t - HG) / 0.5);
      dogAt(pip, 'liv', w.x - 0.08 * nuz, w.z - 0.08 * nuz, t < P0 + 0.3 ? faceToward(src[0], src[1], 0.62, 0.65) - 0.3 : (w.head ?? -2.2), { walk: t > P0 + 0.3 && t < D0 - 0.1 ? 1 : 0, dist: w.dist, headPitch: t < P0 ? 0.6 * smooth((t - 37.4) / 0.35) : -0.05, ears: 1, wag: 1, wagRate: 5.5, mouth: t > HG ? 'pant' : 'smile', eyes: t > HG + 0.2 ? 'happy' : 'open' }, t);
      if (t < P0) dropBunny(W('liv', src[0] - 0.08, 0, src[1] - 0.25), 0.5, 1.3);
      else if (t < D0) holdBunny(pip, t);
      else if (t < PK + 0.15) dropBunny(W('liv', 0.2, 0, 0.5), -0.5, 1.3);
      else { const hp = handWorld(mia, 1).add(handWorld(mia, -1)).multiplyScalar(0.5); dropBunny(hp.add(new THREE.Vector3(0, -0.08, 0.05)), 0.3, 0); }
    },
    street(t, u) {
      hw.aimSun(-20, -3, 14); sub.lights.hemi.intensity = 0.55; sub.lights.hemi.color.set(0x8090c8); sub.lights.sun.intensity = 0.45; sub.lights.sun.color.set(0x9aa8d8);
      const w = walkLegs(t, [-24.6, -0.95], [{ t0: 41.4, t1: 44.9, pts: [[-19.0, -1.05], [DOORX, -2.6]] }]);
      const gy = hw.groundY(w.x, w.z);
      coat.visible = true;
      dogAt(pip, 'sub', w.x, w.z, w.head ?? PI / 2, { walk: 1, dist: w.dist, ears: 1, wag: 0.8, wagRate: 4.5, mouth: 'smile', headPitch: -0.08, headYaw: 0.15 * Math.sin(t * 1.8) }, t, gy);
      const dw = walkLegs(t, [-25.8, -0.85], [{ t0: 41.4, t1: 45.3, pts: [[-19.6, -0.95], [DOORX + 0.5, -2.1]] }]);
      put(dad, 'sub', { x: dw.x, z: dw.z, rotY: dw.head ?? PI / 2, dist: dw.dist, speed: dw.speed, armA: UMB_A, armB: TORCH_B, headPitch: 0.25, eyes: blink(t, 4), mouth: 'smile' }, hw.groundY(dw.x, dw.z));
      dad.root.updateMatrixWorld(true);
      umbrella.visible = true; umbrella.position.copy(handWorld(dad, -1)); umbrella.rotation.set(0, 0, -0.12);
      flash.g.visible = true; handFlash(dad, 1, W('sub', w.x + 0.3, gy, w.z)); flash.setOn(0.35, 0.07);
      // camera runs backward just ahead of Pip, low, three-quarter front
      const cx = w.x + 1.3, cz = w.z + 0.65;
      camO = { P: [cx + OFF.sub[0], 0.5, Math.min(cz, 0.6) + OFF.sub[2]], A: [w.x - 0.5 + OFF.sub[0], 0.36, w.z - 0.4 + OFF.sub[2]], fov: 52, amp: 0.004 };
      void u;
    },
    door(t) {
      hw.aimSun(-18, -8, 10); sub.lights.hemi.intensity = 0.55; sub.lights.hemi.color.set(0x8090c8); sub.lights.sun.intensity = 0.45; sub.lights.sun.color.set(0x9aa8d8);
      const open = K(t, [[EV.open, 0], [EV.open + 0.55, 1.45]]); hw.setDoorOpen(1, open);
      const knock = pulseAt(t, EV.knock, 0.15);
      coat.visible = true;
      const wg = smooth((t - EV.beanWag) / 0.4);
      dogAt(pip, 'sub', DOORX - 0.05, -8.15, PI - 1.35, { sit: t > EV.open ? 1 : 0, beg: knock * 0.6, ears: 1, wag: 0.6 + 0.4 * wg, wagRate: 5, mouth: wg > 0.5 ? 'pant' : 'smile', headPitch: -0.35, lookY: 0.6, hop: 0.06 * Math.max(0, Math.sin((t - EV.beanWag) * 9)) * wg * (t < EV.beanWag + 1.2 ? 1 : 0) }, t, 0.3);
      const out = smooth((t - 49.1) / 0.6);
      const pr = put(rosa, 'sub', { x: DOORX + 0.02, z: lerp(-8.9, -8.72, smooth((t - EV.open - 0.2) / 0.5)) + 0.3 * out, rotY: 0, dist: out * 0.3, speed: out > 0.05 && out < 0.95 ? 0.5 : 0, armA: CRADLE_A, armB: mixArm(CRADLE_B, HEART_B, smooth((t - EV.beanWag - 0.4) / 0.4) * 0.6), headPitch: 0.4, eyes: blink(t, 5), mouth: wg > 0.3 ? 'smile' : 'o', lean: 0.08 }, 0.3);
      rosa.root.visible = open > 0.15;
      rosa.root.updateMatrixWorld(true);
      const mid = handWorld(rosa, -1).add(handWorld(rosa, 1)).multiplyScalar(0.5);
      bean.g.visible = rosa.root.visible;
      if (bean.g.visible) { bean.g.position.copy(mid).add(new THREE.Vector3(0, -0.04, 0.04)); bean.g.rotation.set(0, pr.rotY - 0.5 + 0.5 * wg, 0); bean.update(t, { lie: 1, shiver: 0.8 * (1 - wg), ears: lerp(0.25, 1, wg), sad: 0.5 * (1 - wg), tailDown: 0.9 * (1 - wg), wag: wg, wagRate: 7, headPitch: lerp(0.0, 0.45, wg), lookY: -0.4 * wg, eyes: wg > 0.5 ? 'happy' : 'open', mouth: wg > 0.5 ? 'pant' : 'smile' }); }
      put(dad, 'sub', { x: DOORX - 0.8, z: -7.55, rotY: PI - 0.35, armA: UMB_A, armB: knock > 0.05 ? KNOCK_B : TORCH_B, headPitch: 0.1, eyes: blink(t, 4), mouth: 'smile' }, hw.groundY(DOORX - 0.8, -7.55));
      dad.root.updateMatrixWorld(true);
      umbrella.visible = true; umbrella.position.copy(handWorld(dad, -1)); umbrella.rotation.set(0, 0, 0.3);
      flash.g.visible = true; handFlash(dad, 1, W('sub', DOORX + 0.1, 0.9, -8.8)); flash.setOn(0.16, 0.0);
    },
    fortA(t) { fortScene(t, 'A'); },
    fortB(t) { fortScene(t, 'B'); },
    lights(t) {
      const [a, b] = EV.powerBack;
      city.setTime({ day: 0, golden: 0, moon: 0, milky: 0, power: K(t, [[a, 0], [b, 1]], (x) => x) });
      city.setWeather(t, 'rain'); city.setShadowFocus(-6, 0, 30);
    },
    asleep(t) { fortScene(t, 'Z'); },
  };

  // ---------------------------------------------------------------- the fort (fortA / fortB / asleep)
  function fortScene(t, mode) {
    const Z = mode === 'Z';
    livLights(Z ? 'on' : 'fort', t);
    if (Z) { lantern.set(1); fort.lights.setLit(0.7); }
    fort.g.visible = true; lantern.g.visible = true;
    placed.forEach((C, i) => { if (i >= 3) { C.g.visible = true; C.set(1, t, i); } });
    const F = FORT, laugh = (i) => (Z ? 0 : pulseAt(t, EV.laughs.map((x) => x + i * 0.12), 0.5));
    const sitBack = (P, x, z, rotY, o, i) => put(P, 'liv', { x: F.x + x, z: F.z + z, rotY, y: -0.6, footFwd: 0.62, lean: 0.05, armA: LAP_A, armB: LAP_B, eyes: Z ? 'closed' : blink(t, i), mouth: Z ? 'flat' : laugh(i) > 0.3 ? 'o' : 'smile', headPitch: 0.15, headRoll: Z ? 0 : 0.12 * laugh(i) * Math.sin(t * 14), ...o });
    // back row: Dad, Mom, Rosa
    sitBack(dad, -0.52, -0.45, 0.12, Z ? { headRoll: -0.35 + 0.06 * Math.sin(t * 1.3), headPitch: -0.25 - 0.12 * pulseAt(t, EV.snores, 0.9), mouth: 'o', lean: -0.05 } : { armB: mode === 'A' ? mixArm(LAP_B, HEART_B, 0.5) : LAP_B }, 4);
    sitBack(mom, 0.0, -0.5, 0, Z ? { headRoll: -0.4 + 0.04 * Math.sin(t * 0.9), headPitch: 0.25, lean: 0.06 } : { armA: CHEEK_A, armB: CHEEK_B }, 6);
    sitBack(rosa, 0.52, -0.45, -0.12, Z ? { headRoll: 0.3, headPitch: 0.3 + 0.12 * K(t, [[59.6, 0], [60.0, 0.6], [60.4, 0], [61.6, 0], [62.0, 0.7], [62.4, 0]]) } : { armA: mode === 'B' ? CHEEK_A : LAP_A }, 5);
    if (!Z) {
      // Mia in front, hugging both dogs; the bunny on her lap
      const hugK = mode === 'B' ? 1 : smooth((t - 51.2) / 0.5);
      put(mia, 'liv', { x: F.x, z: F.z + 0.2, rotY: 0, ...FLOOR, lean: 0.1, armA: mixArm(LAP_A, A(-0.9, 0.55, -0.9, 0.5), hugK), armB: mixArm(LAP_B, A(-0.9, 0.55, -0.9, -0.5), hugK), headPitch: 0.1, headRoll: 0.12 * laugh(1) * Math.sin(t * 12), eyes: laugh(1) > 0.4 ? 'closed' : blink(t, 2), mouth: 'smile' });
      bunny.visible = true; dropBunny(W('liv', F.x + 0.02, 0.07, F.z + 0.48), 0.1, 0);
      const lick = mode === 'B' ? pulseAt(t, [53.4, 54.4], 0.4) : 0;
      dogAt(pip, 'liv', F.x - 0.28, F.z + 0.48, 0.35, { sit: 1, ears: 1, wag: 1, wagRate: 5.5, mouth: 'pant', eyes: lick > 0.3 ? 'happy' : 'open', headYaw: 0.2 * Math.sin(t * 1.7), tilt: 0.12 * Math.sin(t * 1.2) }, t, 0.07);
      dogAt(bean, 'liv', F.x + 0.26, F.z + 0.5, -0.5, { sit: 1, ears: 1, wag: 1, wagRate: 7, mouth: lick > 0.2 ? 'open' : 'pant', lick, headYaw: -0.3 * lick, eyes: 'open' }, t, 0.07);
    } else {
      // everyone asleep: Mia slumped against Mom with the bunny; Pip curled at her feet, Bean curled on Pip's back legs
      const stir = K(t, [[58.4, 0], [59.2, 0], [59.7, 1], [60.5, 1], [61.0, 0]]);
      put(mia, 'liv', { x: F.x + 0.02, z: F.z + 0.2, rotY: 0.12 * stir, ...FLOOR, lean: -0.05 + 0.08 * stir, armA: HUG_A, armB: HUG_B, headPitch: 0.3 - 0.1 * stir, headRoll: lerp(-0.35, -0.12, stir) + 0.02 * Math.sin(t * 1.1), eyes: 'closed', mouth: 'smile' });
      mia.root.updateMatrixWorld(true);
      dropBunny(handWorld(mia, 1).add(handWorld(mia, -1)).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.06, 0.05)), 0.2, 0);
      const up = K(t, [[60.6, 0], [61.0, 1], [62.0, 1], [62.5, 0]]), yawn = pulseAt(t, [61.25], 0.6);
      dogAt(pip, 'liv', F.x - 0.2, F.z + 0.5, 0.35, { sleep: 1 - up, lie: up, headPitch: -0.15 * up, headYaw: 0.35 * up * Math.sin((t - 61.0) * 2.2), eyes: up > 0.5 ? (yawn > 0.3 ? 'closed' : 'sleepy') : undefined, mouth: yawn > 0.2 ? 'open' : 'smile', open: 0.3 * yawn, tongue: 0.6 * yawn, ears: lerp(0.5, 0.9, up), wag: 0.15 + 0.5 * up, wagRate: 2.5, earR: 0.15 * pulseAt(t, [59.9], 0.4) }, t, 0.07);
      dogAt(bean, 'liv', F.x + 0.3, F.z + 0.66, -PI / 2 - 0.4, { sleep: 1, earL: 0.3 * pulseAt(t, [59.3, 61.9], 0.3), wag: 0.12, wagRate: 2 }, t, 0.07);
    }
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200)
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    if (cur !== 'liv') { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === 'liv'; scene.fog = null; cur = 'liv'; }
    livLights('on', t);
    const i = Math.floor(t - 200);
    if (i === 0) { coat.visible = true; dogAt(pip, 'liv', 0.4, 0.5, 0.7, { still: true, wag: 0.5 }, t); }
    else if (i === 1) { dogAt(pip, 'liv', 0.4, 0.5, 0.2, { still: true, sit: 1, shine: 1 }, t); livLights('out', t); }
    else {
      const poses = [FLOOR, { y: -0.345, footFwd: 0.42 }, { ...KNEEL }];
      [[mom, 0.0], [dad, 0.6], [rosa, 1.2]].forEach(([P, x], k) => put(P, 'liv', { x: x - 0.2, z: -0.3, rotY: 0.3, ...poses[(i - 2) % 3], armA: [CRADLE_A, SHIN_A, ZOMBIE_A][k], armB: [CRADLE_B, SHIN_B, ZOMBIE_B][k] }));
      setCamera([0.55 + OFF.liv[0], 0.9, 2.6], [0.55 + OFF.liv[0], 0.6, -0.6], 44, 0, 0); return;
    }
    const C = CAMS.lineup; setCamera(C.p[0].map((v, k) => v + OFF.liv[k]), C.a[0].map((v, k) => v + OFF.liv[k]), C.fov, 0, 0);
  }

  return { update };
}
