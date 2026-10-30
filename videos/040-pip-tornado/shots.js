// VIDEO 040 — "What if a tornado hit while Pip was home alone?"  (Pip ep. 6 · lane 3 @ed._.sims · storybook tone)
// 67.4 s, 20 shots, 4 places (Pip's living room, the NEW bathroom set, Maple St in a green-gray storm, the supermarket).
// Saturday 3 PM: the family goes to the store and Pip is home alone with his bunny. His ears go up first (dogs may feel the air
// pressure drop before a storm), the sky turns green, a far siren starts, the TV says TORNADO WARNING — go to an inside room —
// and at the store every phone buzzes. So Pip packs Mia's red wagon, one trip each: the bunny, his bowl, and Bubbles the goldfish
// (her bowl has a carry handle; he walks that one in slowly). He hauls it past the windows to the bathroom (no windows) and everybody gets in the tub under a towel.
// Outside it's cartoon chaos with nobody in it: lawn chairs fly, the trampoline cartwheels down the street, the gnome spins away,
// Mrs. Rosa's porch roof folds like a lawn chair. Pip holds on; so does Bubbles. Then the wind stops and the sun comes out (the
// trampoline is in a tree, the gnome sits on the mailbox), the family races home and finds him in the tub. Pile-in hug.
// HUD WIND 12 → 150 → 5 km/h (an EF1 is 138–177 km/h). Cozy-tense: the funnel stays far away, the storm stays bright green-gray.
// NEW: engine/sets/bathroom.js (windowless family bathroom, tub, door onto a lit hallway). Local helpers here: Mia's red wagon,
// a cartwheeling trampoline, a big garden gnome, a cartoon funnel (lathe + scrolling streaks + dust + debris), wind-blown
// leaves + slanted rain that follow the camera, storm/clear sky domes, window views, a TORNADO WARNING TV card + phone alerts.
//
// Sources (checked Oct 29, 2026):
//   dogs may sense a storm early — vets list barometric-pressure changes, ozone/smell and far thunder as likely cues, but it's not
//   proven (hence "may"): VCA Animal Hospitals, "Do Pets Have a Sixth Sense?" (vcahospitals.com/know-your-pet/do-pets-have-a-sixth-sense);
//   AKC, "Understanding Thunderstorm Anxiety in Dogs" (akc.org/expert-advice/training/thunderstorms-calm-dog-afraid-behavior)
//   in a tornado warning "go to your basement, safe room, or an interior room away from windows. Don't forget pets if time
//   allows." — National Weather Service (weather.gov/safety/tornado-during); "a small, interior, windowless room … on the lowest
//   level" — Ready.gov/tornadoes
//   EF1 = 86–110 mph (138–177 km/h) 3-second gusts — NOAA Storm Prediction Center, Enhanced Fujita scale (spc.noaa.gov/efscale)
//   3:02 PM, the wind numbers in between and the street are story numbers.
//
// Shot list (seconds)               | set   | what happens
//  0.0– 3.3 thumb   12 km/h         | liv   | the question over Pip with his bunny on the rug (cloudy window behind); an ear flicks
//  3.3– 7.6 bye                     | liv   | Mia kneels and boops his nose, Mom + Dad wave with the car keys; they head out
//  7.6–11.4 alone                   | liv   | Pip lies with the bunny… 9.85 his ears shoot up, he sits up and listens
// 11.4–15.4 window  → 40            | liv   | on the sofa at the window: the sky turns green-gray, the trees bend, a far funnel
// 15.4–18.8 street  → 65            | sub   | Maple St: green sky, trees bending, leaves streaming, the funnel far beyond the roofs
// 18.8–20.6 tvA     TORNADO WARNING | liv   | the TV: TORNADO WARNING · TAKE SHELTER; the phone buzzes on the console (music enters)
// 20.6–22.4 tvB                     | liv   | Pip's face in the red TV glow, ears back, then up: he gets it
// 22.4–25.6 store                   | store | Sunny Market: every phone buzzes; Mom, Dad, Mia look at each other: "Pip!"
// 25.6–30.6 pack    → 110           | liv   | the red wagon, three trips: the bunny (26.6), his bowl (28.15), Bubbles by her handle (29.75)
// 30.6–34.0 haul                    | liv   | Pip pulls the wagon past the window; a lawn chair tumbles by outside
// 34.0–36.2 tubA    NO WINDOWS      | bath  | the bathroom: he pulls the wagon in and hops into the tub
// 36.2–38.6 tubB                    | bath  | in the tub with everyone; he tugs the towel over them
// 38.6–41.8 chaosA  → 150          | sub   | lawn chairs fly, the trampoline cartwheels down the street
// 41.8–44.8 chaosB                  | sub   | the gnome spins past the lens; Mrs. Rosa's porch roof folds like a lawn chair
// 44.8–48.8 hold                    | bath  | the light flickers; Pip hugs the bunny; Bubbles comes to the glass; a lick
// 48.8–52.6 calm    → 5             | sub   | the sky clears, the funnel lifts; trampoline in a tree, gnome on the mailbox; the car pulls up
// 52.6–55.6 rush                    | sub   | the family runs up the front walk toward the lens
// 55.6–59.0 find                    | bath  | from the tub: the door flies open, three faces, then relief
// 59.0–67.4 hug                     | bath  | the pile-in hug at the tub: licks, wag, bunny, Bubbles. End card at 63.2 over the hug
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, smooth, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makePerson, basePose, blink, handWorld } from '@engine/rig.js';
import { makeBunny, makeFishBowl, makePhone } from '@engine/props.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildBathroom } from '@engine/sets/bathroom.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { makeCar } from '@engine/sets/city.js';
import { makeLawnChair } from '@engine/haul.js';
import { makeShopCart } from '@engine/pipmart.js';
import { makePip, makeMia, makeMom, makeDad, poseScaled, pulseAt } from '@engine/pip.js';

const PI = Math.PI;
const OFF = { sub: [0, 0, 0], liv: [3000, 0, 0], bath: [6000, 0, 0], store: [9000, 0, 0] };
const PIPS = 0.92, FISH_R = 0.095;
const WAGON = [0.5, 0.03];                     // liv: the wagon parked against the coffee table's front edge (long axis along x)
const TUB = { x: -0.62, z: -0.82, y: 0.1 };    // bath: Pip's spot in the tub (basin floor)
const PIP_DOOR = -34.2, ROSA_LOT = 1;          // sub: Pip's house = lot 0 (x −32), Mrs. Rosa = lot 1 (x −16)

export const SHOTS = [
  { t0: 0, t1: 3.3, cam: 'thumb', set: 'liv' },
  { t0: 3.3, t1: 7.6, cam: 'bye', set: 'liv' },
  { t0: 7.6, t1: 11.4, cam: 'alone', set: 'liv' },
  { t0: 11.4, t1: 15.4, cam: 'window', set: 'liv' },
  { t0: 15.4, t1: 18.8, cam: 'street', set: 'sub' },
  { t0: 18.8, t1: 20.6, cam: 'tvA', set: 'liv' },
  { t0: 20.6, t1: 22.4, cam: 'tvB', set: 'liv' },
  { t0: 22.4, t1: 25.6, cam: 'store', set: 'store' },
  { t0: 25.6, t1: 30.6, cam: 'pack', set: 'liv' },
  { t0: 30.6, t1: 34.0, cam: 'haul', set: 'liv' },
  { t0: 34.0, t1: 36.2, cam: 'tubA', set: 'bath' },
  { t0: 36.2, t1: 38.6, cam: 'tubB', set: 'bath' },
  { t0: 38.6, t1: 41.8, cam: 'chaosA', set: 'sub' },
  { t0: 41.8, t1: 44.8, cam: 'chaosB', set: 'sub' },
  { t0: 44.8, t1: 48.8, cam: 'hold', set: 'bath' },
  { t0: 48.8, t1: 52.6, cam: 'calm', set: 'sub' },
  { t0: 52.6, t1: 55.6, cam: 'rush', set: 'sub' },
  { t0: 55.6, t1: 59.0, cam: 'find', set: 'bath' },
  { t0: 59.0, t1: 70, cam: 'hug', set: 'bath' },
];
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased across the shot)
const c = (p0, p1, a0, a1, fov, amp = 0.003) => ({ p: [p0, p1], a: [a0, a1], fov, amp });
export const CAMS = {
  thumb:  c([0.55, 0.42, 0.95], [0.55, 0.41, 0.85], [0.5, 0.36, 0.05], [0.5, 0.36, 0.05], 44, 0.002),
  bye:    c([-0.55, 0.63, 2.75], [-0.45, 0.61, 2.55], [0.75, 0.69, -0.45], [0.75, 0.67, -0.45], 50, 0.004),
  alone:  c([0.62, 0.33, 0.95], [0.6, 0.34, 0.82], [0.5, 0.26, 0.0], [0.5, 0.3, 0.0], 44, 0.002),
  window: c([-0.05, 0.95, -1.35], [0.0, 0.96, -1.45], [0.85, 1.08, -2.55], [0.87, 1.08, -2.55], 50, 0.003),
  street: c([-29.5, 1.4, 4.2], [-29.3, 1.45, 3.8], [-29.5, 3.4, -9.0], [-29.2, 3.6, -9.0], 52, 0.004),
  tvA:    c([-0.4, 1.1, -0.25], [-0.25, 1.1, -0.28], [2.88, 1.1, -0.38], [2.88, 1.1, -0.38], 46, 0.002),
  tvB:    c([2.35, 0.44, 0.38], [2.3, 0.44, 0.3], [1.55, 0.38, 0.0], [1.55, 0.4, 0.0], 44, 0.002),
  store:  c([0.12, 1.3, -0.55], [0.08, 1.3, -0.8], [0.05, 1.26, -3.3], [0.05, 1.24, -3.3], 50, 0.004),
  pack:   c([0.2, 0.45, 2.3], [0.24, 0.44, 2.15], [0.2, 0.38, -0.3], [0.24, 0.38, -0.3], 50, 0.003),
  haul:   null,   // tracking camera computed in the beat
  tubA:   c([0.75, 0.75, 1.0], [0.7, 0.72, 0.9], [-0.45, 0.42, -0.65], [-0.5, 0.42, -0.7], 54, 0.003),
  tubB:   c([0.28, 0.72, -0.62], [0.22, 0.7, -0.66], [-0.55, 0.25, -0.8], [-0.55, 0.25, -0.8], 46, 0.002),
  chaosA: c([-31.2, 0.6, -4.8], [-31.0, 0.62, -4.4], [-30.6, 1.5, 6.0], [-30.4, 1.6, 6.0], 52, 0.008),
  chaosB: c([-21.6, 0.55, -0.4], [-21.4, 0.58, -0.6], [-19.5, 1.6, -8.6], [-19.3, 1.65, -8.6], 52, 0.008),
  hold:   c([-0.22, 1.15, -0.08], [-0.25, 1.12, -0.14], [-0.42, 0.28, -0.78], [-0.42, 0.29, -0.78], 48, 0.003),
  calm:   c([-30.2, 1.55, 11.2], [-30.2, 1.65, 10.6], [-29.4, 2.4, -5.0], [-29.4, 2.7, -5.0], 60, 0.003),
  rush:   c([PIP_DOOR + 0.2, 0.8, -7.55], [PIP_DOOR + 0.2, 0.8, -7.85], [PIP_DOOR, 1.05, -2.0], [PIP_DOOR, 1.1, -2.0], 50, 0.004),
  find:   c([-0.35, 0.48, -0.85], [-0.33, 0.5, -0.8], [0.48, 1.2, 1.3], [0.45, 1.15, 1.3], 54, 0.003),
  hug:    c([-0.5, 1.02, 1.22], [-0.5, 0.98, 1.0], [-0.5, 0.95, -0.6], [-0.5, 0.93, -0.6], 64, 0.003),
  lineup: c([0.4, 0.42, 1.5], [0.4, 0.42, 1.5], [0.4, 0.25, 0.5], [0.4, 0.25, 0.5], 38, 0),
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const WAVE_B = (t) => A(-0.2, 1.05 + 0.25 * Math.sin(t * 9), -1.4, -0.6);
const KEYS_A = A(-0.6, 0.12, -1.1, 0.4);
const BOOP_B = A(-1.25, 0.05, -0.25, -0.2);
const PHONE_A = A(-0.85, 0.12, -1.6, 0.7), PHONE_B = A(-0.85, 0.12, -1.6, -0.7);
const HEART_A = A(-0.05, 0.2, -2.0, 0.9), HEART_B = A(-0.05, 0.2, -2.0, -0.9);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);
const HUG_A = A(-0.62, -0.05, -1.55, 0.7), HUG_B = A(-0.62, -0.05, -1.55, -0.7);
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);
const RUN_A = (t) => A(0.6 * Math.sin(t * 11), 0.12, -1.3, 0.2), RUN_B = (t) => A(-0.6 * Math.sin(t * 11), 0.12, -1.3, -0.2);
const RIM_A = A(-1.0, 0.05, -0.6, 0.3), RIM_B = A(-1.0, 0.05, -0.6, -0.3);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const KNEEL = { y: -0.47, footFwd: -0.33, lean: 0.18 };
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));

// ---------------------------------------------------------------- textures
function viewCanvas(kind) {
  // the painted view out of the living-room window: 'cloudy' afternoon / 'storm' (green-gray, bending trees, a far funnel)
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h), st = kind === 'storm';
    if (st) { gr.addColorStop(0, '#46564c'); gr.addColorStop(0.45, '#7f9478'); gr.addColorStop(0.7, '#b7c49a'); gr.addColorStop(1, '#a9b48c'); }
    else { gr.addColorStop(0, '#7f9fc4'); gr.addColorStop(0.5, '#b9cad8'); gr.addColorStop(1, '#dfe4e2'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(st ? 11 : 4);
    for (let i = 0; i < 22; i++) { g.fillStyle = st ? `rgba(${50 + R() * 30},${66 + R() * 30},${58 + R() * 20},${0.35 + R() * 0.35})` : `rgba(255,255,255,${0.35 + R() * 0.4})`; g.beginPath(); g.ellipse(R() * w, R() * h * 0.42, 90 + R() * 160, 22 + R() * 34, st ? -0.15 : 0, 0, 7); g.fill(); }
    if (st) {   // the far funnel, small, right of center, on the horizon
      const fx = w * 0.68, top = h * 0.3, bot = h * 0.71;
      g.fillStyle = 'rgba(80,92,84,.9)'; g.beginPath(); g.moveTo(fx - 70, top); g.quadraticCurveTo(fx - 8, h * 0.5, fx - 6, bot); g.lineTo(fx + 6, bot); g.quadraticCurveTo(fx + 14, h * 0.5, fx + 70, top); g.fill();
      g.fillStyle = 'rgba(150,140,110,.6)'; g.beginPath(); g.ellipse(fx, bot, 30, 9, 0, 0, 7); g.fill();
    }
    for (let i = 0; i < 9; i++) {
      const x = i * 120 - 30, bw = 100, bh = 70 + R() * 30, y = h * 0.76;
      g.fillStyle = st ? '#5a6458' : '#c9b8a4'; g.fillRect(x, y - bh, bw, bh + 200);
      g.fillStyle = st ? '#3e463e' : '#8a5a4a'; g.beginPath(); g.moveTo(x - 10, y - bh); g.lineTo(x + bw / 2, y - bh - 46); g.lineTo(x + bw + 10, y - bh); g.fill();
      for (const [dx, dy] of [[18, 22], [62, 22]]) { g.fillStyle = st ? '#e8d6a0' : '#9fb8c8'; g.fillRect(x + dx, y - bh + dy, 22, 20); }
    }
    g.fillStyle = st ? '#3f5a36' : '#6f9a4a';
    for (let i = 0; i < 14; i++) { g.save(); g.translate(i * 80 + 30, h * 0.86); if (st) g.transform(1, 0, -0.45, 1, 0, 0); g.beginPath(); g.arc(0, -20, 40 + (i % 3) * 12, 0, 7); g.fill(); g.restore(); }
    g.fillRect(0, h * 0.86, w, h);
  });
}
function skyCanvas(storm) {
  // equirect sky for the suburb's dome: storm = the classic green-gray tornado sky with dark swirling bands; clear = a washed blue
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    if (storm) { gr.addColorStop(0, '#3b4842'); gr.addColorStop(0.3, '#5d7062'); gr.addColorStop(0.47, '#a9bb90'); gr.addColorStop(0.52, '#c4cc9e'); gr.addColorStop(1, '#8f9a78'); }
    else { gr.addColorStop(0, '#2f78d0'); gr.addColorStop(0.44, '#8cc0ee'); gr.addColorStop(0.49, '#d8eaf4'); gr.addColorStop(0.5, '#eef4ee'); gr.addColorStop(1, '#e8eee8'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(storm ? 17 : 23);
    for (let i = 0; i < (storm ? 90 : 26); i++) {
      const y = R() * h * 0.44, x = R() * w;
      g.fillStyle = storm ? `rgba(${40 + R() * 40},${52 + R() * 40},${46 + R() * 30},${0.25 + R() * 0.35})` : `rgba(255,255,255,${0.5 + R() * 0.4})`;
      g.beginPath(); g.ellipse(x, y, 60 + R() * 200, 10 + R() * 26, storm ? (R() - 0.5) * 0.3 : 0, 0, 7); g.fill();
    }
  });
}
function tvCard() {
  return canvasTex(512, 280, (g, w, h) => {
    g.fillStyle = '#16233a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8302c'; g.fillRect(0, 34, w, 92);
    g.fillStyle = '#fff'; g.font = 'bold 44px Helvetica, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TORNADO WARNING', w / 2, 82);
    g.font = 'bold 34px Helvetica, Arial'; g.fillText('TAKE SHELTER NOW', w / 2, 160);
    g.fillStyle = '#f2c14e'; g.font = 'bold 28px Helvetica, Arial'; g.fillText('INSIDE ROOM · NO WINDOWS', w / 2, 208);
    g.fillStyle = '#c8302c'; g.fillRect(0, 244, w, 36); g.fillStyle = '#fff'; g.font = 'bold 15px Helvetica, Arial'; g.fillText('NATIONAL WEATHER SERVICE · MAPLE COUNTY · UNTIL 3:45 PM', w / 2, 262);
  });
}
function phoneCard() {
  return canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#10141c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8ecf2'; g.beginPath(); g.roundRect?.(8, 70, w - 16, 110, 12); g.fill();
    g.fillStyle = '#c8302c'; g.fillRect(8, 70, w - 16, 30);
    g.fillStyle = '#fff'; g.font = 'bold 15px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('EMERGENCY ALERT', w / 2, 91);
    g.fillStyle = '#1a1a1a'; g.font = 'bold 17px Helvetica, Arial'; g.fillText('TORNADO', w / 2, 125); g.fillText('WARNING', w / 2, 147);
    g.font = '12px Helvetica, Arial'; g.fillText('Take shelter now', w / 2, 168);
  });
}

// ---------------------------------------------------------------- local props
/** Mia's red wagon: front = +z (the handle end), origin = ground under the bed center. setHandle(target world) aims the grip. */
function makeWagon() {
  const g = new THREE.Group(), red = mat(0xd2483f, 0.35), dark = mat(0x222428, 0.6), wood = mat(0xb07a4c, 0.6);
  const L = 0.62, Wd = 0.36, Y0 = 0.17, H = 0.13;
  mk(new RoundedBoxGeometry(Wd, 0.03, L, 2, 0.01), wood, g, 0, Y0, 0);
  for (const s of [-1, 1]) { mk(new RoundedBoxGeometry(0.025, H, L, 2, 0.008), red, g, s * Wd / 2, Y0 + H / 2, 0); mk(new RoundedBoxGeometry(Wd, H, 0.025, 2, 0.008), red, g, 0, Y0 + H / 2, s * L / 2); }
  const lab = mk(new THREE.PlaneGeometry(0.26, 0.07), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(200, 54, (c2, w, h) => { c2.fillStyle = '#d2483f'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#fff6e0'; c2.font = 'bold italic 38px Georgia'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('MIA', w / 2, h / 2 + 2); }) }), g, Wd / 2 + 0.014, Y0 + H / 2, 0); lab.rotation.y = PI / 2;
  const lab2 = lab.clone(); lab2.position.x = -Wd / 2 - 0.014; lab2.rotation.y = -PI / 2; g.add(lab2);
  const wheels = [];
  for (const z of [-0.22, 0.22]) for (const s of [-1, 1]) { const w = mk(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 18), dark, g, s * (Wd / 2 + 0.03), 0.075, z); w.rotation.z = PI / 2; mk(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 10), mat(0xf2efe8, 0.4), w, 0, 0, 0); wheels.push(w); }
  mk(new THREE.CylinderGeometry(0.008, 0.008, Wd + 0.06, 6), dark, g, 0, 0.075, 0.22).rotation.z = PI / 2;
  const handle = new THREE.Group(); handle.position.set(0, 0.11, L / 2 + 0.02); g.add(handle);
  const bar = mk(new THREE.CylinderGeometry(0.009, 0.009, 0.42, 8), dark, handle, 0, 0, 0.21); bar.rotation.x = PI / 2;
  mk(new THREE.CapsuleGeometry(0.014, 0.08, 4, 8), red, handle, 0, 0, 0.42).rotation.z = PI / 2;
  const roll = (dist) => wheels.forEach((w) => (w.rotation.x = -dist / 0.075));
  // aim the handle's +z toward a world point (Pip's mouth)
  const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
  const setHandle = (target) => {
    g.updateMatrixWorld(true); _p.copy(target); g.worldToLocal(_p); _p.sub(handle.position);
    const pitch = Math.atan2(-_p.y, Math.hypot(_p.x, _p.z)), yaw = Math.atan2(_p.x, _p.z);
    handle.rotation.set(clamp(pitch, -1.3, 0.6), clamp(yaw, -0.9, 0.9), 0, 'YXZ');
    void _q; void _m;
  };
  return { g, handle, roll, setHandle, bedY: Y0 + 0.015 };
}
/** Pip's food bowl (the blue PIP bowl), to carry in his mouth. */
function makeDogBowl() {
  const g = new THREE.Group();
  const tex = canvasTex(256, 48, (c2, w, h) => { c2.fillStyle = '#3d7bd9'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#fff'; c2.font = 'bold 30px Georgia'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; for (let i = 0; i < 4; i++) c2.fillText('PIP', w * (i + 0.5) / 4, h / 2 + 2); });
  mk(new THREE.CylinderGeometry(0.075, 0.06, 0.055, 24, 1, true), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, side: THREE.DoubleSide }), g, 0, 0.0275, 0);
  mk(new THREE.CircleGeometry(0.06, 20), mat(0x2f5fa8, 0.4), g, 0, 0.003, 0).rotation.x = -PI / 2;
  for (let k = 0; k < 9; k++) mk(new THREE.SphereGeometry(0.012, 6, 5), mat(0x8a5a36, 0.9), g, Math.cos(k * 2.3) * 0.03 * (k % 3) / 2, 0.012, Math.sin(k * 2.3) * 0.03 * (k % 3) / 2);
  return g;
}
/** A backyard trampoline: blue safety-pad ring, black mat, six legs. Origin = the mat's center; the mat lies in local xz. */
function makeTrampoline(r = 1.15) {
  const g = new THREE.Group();
  mk(new THREE.CircleGeometry(r * 0.9, 36), mat(0x1c1c22, 0.8, { side: THREE.DoubleSide }), g, 0, 0, 0).rotation.x = -PI / 2;
  const ring = mk(new THREE.TorusGeometry(r, 0.09, 8, 40), mat(0x3d7bd9, 0.5), g); ring.rotation.x = PI / 2; ring.scale.z = 0.5;
  for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; const l = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), mat(0x9aa3ad, 0.3, { metalness: 0.6 }), g, Math.cos(a) * r, -0.35, Math.sin(a) * r); void l; }
  return g;
}
/** A big cheerful garden gnome (0.55 m): red hat, white beard, blue coat. Origin at its feet. */
function makeGnome() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.11, 0.15, 0.26, 14), mat(0x3d7bd9, 0.5), g, 0, 0.13, 0);
  mk(new THREE.CylinderGeometry(0.155, 0.155, 0.03, 14), mat(0x6b4428, 0.6), g, 0, 0.2, 0);
  mk(new THREE.SphereGeometry(0.09, 14, 12), mat(0xf1c3a1, 0.6), g, 0, 0.34, 0);
  const beard = mk(new THREE.ConeGeometry(0.09, 0.16, 14), mat(0xf6f3ec, 0.9), g, 0, 0.26, 0.05); beard.rotation.x = PI;
  mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0xe88a7a, 0.5), g, 0, 0.335, 0.088);
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.012, 8, 6), mat(0x111111, 0.3), g, s * 0.035, 0.37, 0.078);
  const hat = mk(new THREE.ConeGeometry(0.1, 0.28, 14), mat(0xd2483f, 0.5), g, 0, 0.53, -0.01); hat.rotation.x = -0.15;
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.04, 8, 6), mat(0x2a2a2a, 0.6), g, s * 0.06, 0.02, 0.04).scale.set(1, 0.6, 1.5);
  return g;
}
/** The cartoon funnel: a lathe cone with scrolling streaks, a wall-cloud skirt on top, a dust skirt + debris specks at the base.
 *  update(t, k): k 0..1 = present (lift/fade on the way out). Origin = ground under the funnel. */
function makeFunnel(H = 60) {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push(new THREE.Vector2(1.3 + 2.0 * u + 10 * Math.pow(u, 2.6), u * H)); }
  const tex = canvasTex(256, 256, (c2, w, h) => { c2.fillStyle = '#8c968a'; c2.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 90; i++) { c2.strokeStyle = R() < 0.5 ? `rgba(214,220,206,${0.3 + R() * 0.35})` : `rgba(70,80,72,${0.3 + R() * 0.35})`; c2.lineWidth = 2 + R() * 7; const y = R() * h, x = R() * w; c2.beginPath(); c2.moveTo(x - 140, y + 26); c2.quadraticCurveTo(x, y - 6, x + 140, y + 20); c2.stroke(); } }, [2, 3]);
  const fm = new THREE.MeshBasicMaterial({ map: tex, color: 0xb0b8ac, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false, fog: false });
  const cone = mk(new THREE.LatheGeometry(pts, 40), fm, spin); cone.castShadow = false;
  const soft = (col, a) => canvasTex(128, 128, (c2) => { const gr = c2.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); c2.fillStyle = gr; c2.fillRect(0, 0, 128, 128); });
  const cloudT = soft('84,98,88', 0.95), dustT = soft('150,138,110', 0.85);
  const puffs = [];
  const R = rng(9);
  for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, fog: false })); const a = R() * PI * 2, d = 4 + R() * 34; s.userData = { a, d, y: H - 2 + R() * 8, s: 26 + R() * 22, w: 0.05 + R() * 0.05 }; g.add(s); puffs.push(s); }
  const dust = [];
  for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustT, transparent: true, depthWrite: false, fog: false })); s.userData = { a: R() * PI * 2, d: 2 + R() * 5, y: 0.5 + R() * 6, s: 5 + R() * 6, w: 0.6 + R() * 0.8 }; g.add(s); dust.push(s); }
  const debM = new THREE.MeshBasicMaterial({ color: 0x4a4038, fog: false });
  const deb = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.15, 0.4), debM, 40); deb.frustumCulled = false; g.add(deb);
  const dseed = Array.from({ length: 40 }, () => [R(), R(), R()]);
  const _o = new THREE.Object3D();
  const update = (t, k = 1) => {
    g.visible = k > 0.001; if (!g.visible) return;
    spin.rotation.y = -t * 1.6; tex.offset.x = (t * 0.35) % 1; fm.opacity = 0.95 * k;
    spin.rotation.z = 0.06 * Math.sin(t * 0.7); spin.rotation.x = 0.04 * Math.sin(t * 0.53 + 1);
    spin.scale.set(1, k, 1); spin.position.y = H * (1 - k);
    for (const s of puffs) { const u = s.userData, a = u.a - t * u.w; s.position.set(Math.cos(a) * u.d, u.y, Math.sin(a) * u.d); s.scale.setScalar(u.s); s.material.opacity = 0.9 * Math.min(1, k * 1.5); }
    for (const s of dust) { const u = s.userData, a = u.a - t * u.w; s.position.set(Math.cos(a) * u.d, u.y, Math.sin(a) * u.d); s.scale.setScalar(u.s); s.material.opacity = 0.7 * k * k; }
    dseed.forEach(([a0, h0, r0], i) => { const a = a0 * PI * 2 - t * (1.5 + r0), y = (h0 * 18 + t * 2.5 * (0.5 + r0)) % 18, rr = 2.2 + y * 0.35 + r0 * 2; _o.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); _o.rotation.set(t * 3 + i, t * 2 + i, 0); _o.scale.setScalar(k); _o.updateMatrix(); deb.setMatrixAt(i, _o.matrix); });
    deb.instanceMatrix.needsUpdate = true;
  };
  return { g, update };
}
/** Rain that follows the camera, slanted by the wind (wind = m/s along −x). */
function makeRain(parent, n = 1800, box = [9, 7, 11]) {
  const R = rng(38), seeds = Array.from({ length: n }, () => [R(), R(), R(), R()]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
  const m = new THREE.LineBasicMaterial({ color: 0xd8e2d0, transparent: true, opacity: 0.25, depthWrite: false, fog: false });
  const L = new THREE.LineSegments(geo, m); L.frustumCulled = false; parent.add(L);
  const update = (t, cam, op, wind = 0) => {
    L.visible = op > 0.001; if (!L.visible) return; m.opacity = op;
    const f = new THREE.Vector3(); cam.getWorldDirection(f); f.y = 0; f.normalize();
    const [Wd, Hh, D] = box, cx = cam.position.x + f.x * (D * 0.5 + 0.6), cy = cam.position.y, cz = cam.position.z + f.z * (D * 0.5 + 0.6);
    const a = geo.attributes.position, sl = wind * 0.03;
    for (let i = 0; i < n; i++) {
      const [u, v, w, k] = seeds[i], y = cy + Hh / 2 - ((((v * Hh) + t * (8 + 3 * k)) % Hh) + Hh) % Hh;
      const x = cx + ((((u - 0.5) * Wd - t * wind * 0.6) % Wd) + Wd * 1.5) % Wd - Wd / 2, z = cz + (w - 0.5) * D, len = 0.22 + 0.12 * k;
      a.setXYZ(i * 2, x, y, z); a.setXYZ(i * 2 + 1, x + sl * len * 10, y - len, z + 0.01);
    }
    a.needsUpdate = true;
  };
  return { update, L };
}
/** Wind-blown leaves that follow the camera (instanced, tumbling). wind = m/s along −x (screen-left when looking −z… whatever the set). */
function makeLeaves(parent, n = 260, box = [12, 5, 10]) {
  const R = rng(61), seeds = Array.from({ length: n }, () => [R(), R(), R(), R(), R()]);
  const geo = new THREE.PlaneGeometry(0.09, 0.06);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), n); im.frustumCulled = false; parent.add(im);
  const cols = [0x5e9a46, 0x8fb04a, 0xd9a83a, 0xc0702a, 0x6f8a3a].map((x) => new THREE.Color(x));
  for (let i = 0; i < n; i++) im.setColorAt(i, cols[i % cols.length]);
  const _o = new THREE.Object3D();
  const update = (t, cam, k, wind = 12, dir = new THREE.Vector3(-1, 0, 0)) => {
    im.visible = k > 0.001; if (!im.visible) return;
    const f = new THREE.Vector3(); cam.getWorldDirection(f); f.y = 0; f.normalize();
    const [Wd, Hh, D] = box, cx = cam.position.x + f.x * (D * 0.5 + 0.5), cy = cam.position.y + 0.8, cz = cam.position.z + f.z * (D * 0.5 + 0.5);
    const side = new THREE.Vector3(-f.z, 0, f.x);
    for (let i = 0; i < n; i++) {
      const [u, v, w, s, q] = seeds[i];
      const along = ((((u - 0.5) * Wd + t * wind * (0.6 + 0.5 * s)) % Wd) + Wd * 1.5) % Wd - Wd / 2;
      const y = cy + (v - 0.5) * Hh + 0.4 * Math.sin(t * 3 + i);
      const p = new THREE.Vector3(cx, y, cz).addScaledVector(dir, along).addScaledVector(f, (w - 0.5) * D).addScaledVector(side, 0);
      _o.position.copy(p); _o.rotation.set(t * (4 + 6 * s) + i, t * (3 + 5 * q), i);
      _o.scale.setScalar(i < n * k ? 1 : 0); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  };
  return { update, im };
}
/** A soft bath towel that covers Pip in the tub: a draped, slightly lumpy plane. set(k): 0 = folded on the rim, 1 = over him. */
function makeTowel() {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.72, 0.62, 20, 16);
  const tex = canvasTex(128, 128, (c2, w, h) => { c2.fillStyle = '#9fd0c4'; c2.fillRect(0, 0, w, h); c2.fillStyle = 'rgba(255,255,255,.55)'; c2.fillRect(0, 12, w, 8); c2.fillRect(0, h - 20, w, 8); c2.fillStyle = 'rgba(0,0,0,.04)'; for (let y = 0; y < h; y += 4) c2.fillRect(0, y, w, 1); });
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, side: THREE.DoubleSide })); g.add(m); m.castShadow = true;
  const base = geo.attributes.position.array.slice();
  const set = (k, t = 0) => {
    // a dome over a lying puppy (center at origin, long axis x), front edge (−y in plane = +z world after rotation) open
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], ux = x / 0.36, uz = y / 0.31;
      const dome = Math.max(0, 1 - ux * ux * 0.85 - uz * uz * 0.9);
      const hgt = 0.06 + 0.24 * Math.sqrt(dome) + 0.012 * Math.sin(x * 30 + y * 20 + t * 2) * k;
      p.setXYZ(i, x, y, lerp(0.02, hgt, k));
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  m.rotation.x = -PI / 2; set(0);
  return { g, set };
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- sets
  const sub = buildSuburb(studio); sub.root.position.set(...OFF.sub); const subFog0 = sub.fog;
  const liv = buildLivingRoom(studio, { home: true }); liv.root.position.set(...OFF.liv);
  const bath = buildBathroom(studio); bath.root.position.set(...OFF.bath);
  const store = buildSupermarket(studio); store.root.position.set(...OFF.store);
  const subFog = new THREE.Fog(0x9aa890, 22, 170);
  const ROOTS = { sub: sub.root, liv: liv.root, bath: bath.root, store: store.root };
  const FAR = { sub: 330, liv: 40, bath: 20, store: 60 };
  const FOG = { sub: subFog, liv: null, bath: null, store: null };
  void subFog0;

  // the suburb: a green-gray storm dome inside the blue one (crossfades out for the sunshine), clouds, sun rays, a rainbow
  const sky0 = sub.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300);
  sky0.material.map = skyCanvas(false); sky0.material.needsUpdate = true;
  const stormM = new THREE.MeshBasicMaterial({ map: skyCanvas(true), side: THREE.BackSide, fog: false, toneMapped: false, transparent: true, depthWrite: false });
  const stormDome = new THREE.Mesh(new THREE.SphereGeometry(290, 32, 16), stormM); stormDome.renderOrder = -1; sub.root.add(stormDome);
  const cloudMats = new Set(); sub.root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.transparent && o.material.opacity === 0.92) cloudMats.add(o.material); });
  const rayT = canvasTex(64, 256, (g2, w, h) => { const gr = g2.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,246,210,0)'); gr.addColorStop(0.3, 'rgba(255,246,210,.5)'); gr.addColorStop(1, 'rgba(255,246,210,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, w, h); const hg = g2.createLinearGradient(0, 0, w, 0); hg.addColorStop(0, 'rgba(0,0,0,1)'); hg.addColorStop(0.5, 'rgba(0,0,0,0)'); hg.addColorStop(1, 'rgba(0,0,0,1)'); g2.globalCompositeOperation = 'destination-out'; g2.fillStyle = hg; g2.fillRect(0, 0, w, h); });
  const rays = [];
  for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(9, 90), new THREE.MeshBasicMaterial({ map: rayT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 })); r.position.set(-50 + i * 14, 40, -70); r.rotation.z = -0.35 + i * 0.03; sub.root.add(r); rays.push(r); }
  const bowT = canvasTex(512, 64, (g2, w, h) => { const cols = ['#ff5a5a', '#ffa94a', '#ffe36a', '#7fd67f', '#6ab0ff', '#9a7fff']; cols.forEach((c2, i) => { g2.fillStyle = c2; g2.fillRect(0, i * h / 6, w, h / 6 + 1); }); const fg = g2.createLinearGradient(0, 0, w, 0); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(0.15, 'rgba(0,0,0,0)'); fg.addColorStop(0.85, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)'); g2.globalCompositeOperation = 'destination-out'; g2.fillStyle = fg; g2.fillRect(0, 0, w, h); });
  const bowM = new THREE.MeshBasicMaterial({ map: bowT, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const rainbow = new THREE.Mesh(new THREE.RingGeometry(70, 76, 64, 1, 0.15, PI - 0.3), bowM); rainbow.position.set(-28, -8, -150); sub.root.add(rainbow);
  { const uv = rainbow.geometry.attributes.uv, pos = rainbow.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { const x = pos.getX(i), y = pos.getY(i), r = Math.hypot(x, y), a = Math.atan2(y, x); uv.setXY(i, (a - 0.15) / (PI - 0.3), (r - 70) / 6); } }
  // trees that bend in the wind (each house's two trees + the park), the porch posts of Mrs. Rosa's house
  const trees = [];
  sub.root.traverse((o) => { if (o.isGroup && o.children[0]?.isMesh && o.children[0].geometry.type === 'CylinderGeometry' && [0.15, 0.2].includes(o.children[0].geometry.parameters.radiusTop)) trees.push({ g: o, ph: trees.length * 1.7 }); });
  const rosa = sub.houses[ROSA_LOT];
  const rPosts = rosa.g.children.filter((o) => o.isMesh && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height === 2.6 && Math.abs(o.position.z - 1.9) < 0.01);
  const rPost = rPosts.sort((a, b) => b.position.x - a.position.x)[0], rPost0 = rPost.position.clone();
  // the suburb's own tiny gnome is replaced by a big one; its own bike stays
  sub.root.traverse((o) => { if (o.isGroup && Math.abs(o.position.x - (sub.D.lots[2] - 4.0)) < 0.01 && Math.abs(o.position.z + 7.0) < 0.01) o.visible = false; });
  sub.root.children.forEach((o) => { if (o.isGroup && Math.abs(o.position.z - 6.0) < 0.01 && o.position.y === 0 && o.children.length === 6) o.visible = false; });
  const MAIL = new THREE.Vector3(PIP_DOOR + 1.8, 1.33, -2.4);     // Pip's mailbox top (lot 0: door −34.2 + 1.8, z = −9 + 7 − 0.4)
  const TREE = sub.houses[0].g.children.filter((o) => o.isGroup && o.children[0]?.geometry?.type === 'CylinderGeometry').map((o) => o.getWorldPosition(new THREE.Vector3())).sort((a, b) => b.x - a.x)[0];

  // the living room: window views, window rain, a storm overlay, flying stuff outside the glass, fluttering curtains
  const viewM = liv.root.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 9 && !o.material.transparent).material;
  viewM.map = viewCanvas('cloudy'); viewM.needsUpdate = true;
  const stormViewM = new THREE.MeshBasicMaterial({ map: viewCanvas('storm'), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const stormView = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), stormViewM); stormView.position.set(0.4, 1.5, -2.8 - 2.37); liv.root.add(stormView);
  const curtains = liv.root.children.filter((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 0.5 && o.geometry.parameters.height === 2.3);
  const winChair = makeLawnChair({ c1: '#3d7bd9', c2: '#f2e6cf' }); winChair.g.scale.setScalar(1.3); liv.root.add(winChair.g);
  const winLeaves = makeLeaves(scene, 120, [6, 2.4, 2.2]);
  const livTV = liv.root.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 1.02);
  const tvNews = livTV.material.map, tvWarn = tvCard();
  const tvRed = new THREE.PointLight(0xff6a5a, 0, 3.2, 1.6); tvRed.position.set(2.4, 1.0, -0.2); liv.root.add(tvRed);
  const shadeMats = []; liv.root.traverse((o) => { if (o.isMesh && o.material.emissive && o.material.emissive.getHex() === 0xffc777 && o.material.emissiveIntensity > 0) shadeMats.push([o.material, o.material.emissiveIntensity]); });

  // ---------------------------------------------------------------- props
  const bunny = makeBunny(); scene.add(bunny);
  const wagon = makeWagon(); scene.add(wagon.g);
  const bowl = makeDogBowl(); scene.add(bowl);
  const fish = makeFishBowl({ r: FISH_R }); scene.add(fish.g);
  { const rr = FISH_R * Math.sin(0.2 * PI); const arc = mk(new THREE.TorusGeometry(rr, 0.004, 6, 20, PI), mat(0x9aa3ad, 0.3, { metalness: 0.7 }), fish.g, 0, fish.top, 0); void arc; }
  const phone = makePhone(); scene.add(phone.g); const alertT = phoneCard();
  phone.screenMat.emissiveMap = alertT; phone.screenMat.emissive.set(0xffffff); phone.screenMat.map = alertT; phone.screenMat.needsUpdate = true;
  const sPhones = Array.from({ length: 6 }, () => { const p = makePhone(); p.screenMat.emissiveMap = alertT; p.screenMat.map = alertT; p.screenMat.emissive.set(0xffffff); p.screenMat.needsUpdate = true; scene.add(p.g); return p; });
  const tramp = makeTrampoline(); sub.root.add(tramp);
  const gnome = makeGnome(); gnome.scale.setScalar(1.25); sub.root.add(gnome);
  const chairs = [makeLawnChair(), makeLawnChair({ c1: '#58b3a8', c2: '#f6f1e6' }), makeLawnChair({ c1: '#e2574c', c2: '#f6e2b8' })]; chairs.forEach((ch) => { ch.g.scale.setScalar(1.25); sub.root.add(ch.g); });
  const funnel = makeFunnel(); sub.root.add(funnel.g);
  const car = makeCar(0x3f7d9a, 4); sub.root.add(car.g);
  const towel = makeTowel(); scene.add(towel.g);
  const curtain = bath.root.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 0.45);
  const rain = makeRain(scene), leaves = makeLeaves(scene);
  const cart = makeShopCart(); store.root.add(cart); cart.position.set(0.55, 0, -3.0); cart.rotation.y = PI + 0.25;
  // Rosa's open front door shows a lit hallway (the suburb houses are solid boxes)
  const rosaHall = mk(new THREE.PlaneGeometry(0.92, 2.08), new THREE.MeshBasicMaterial({ color: 0xc89a6a }), rosa.g, -2.2, 0.4 + 1.04, 0.045); void rosaHall;

  // ---------------------------------------------------------------- cast
  const pip = makePip({ size: PIPS }); scene.add(pip.g);
  const mia = makeMia({ outfit: 'day' }), mom = makeMom({ outfit: 'day' }), dad = makeDad({ outfit: 'day' });
  const extras = [
    makePerson({ skin: 0xf0c8a8, hair: 0xdcd8d0, hairStyle: 'bob', glasses: true, top: 0xe07a2a, pants: 0x5a3a5a }),
    makePerson({ skin: 0x8a5a3a, hair: 0x1a1210, hairStyle: 'short', top: 0x58b3a8, pants: 0x3b4a66 }),
    makePerson({ skin: 0xe9b896, hair: 0xd8b060, hairStyle: 'messy', top: 0xb9a3e3, pants: 0x4a4f57 }),
  ];
  extras.forEach((P) => { P.kid = 1; });
  const CAST = [mia, mom, dad, ...extras];
  CAST.forEach((P) => scene.add(P.root));
  const GLASSES = new Set([dad, extras[0]]);

  const W = (set, x, y, z) => new THREE.Vector3(x + OFF[set][0], y + OFF[set][1], z + OFF[set][2]);
  const put = (P, set, o, rootY = 0) => { const p = basePose(); Object.assign(p, o); if (GLASSES.has(P)) p.glasses = true; p.x += OFF[set][0]; p.z += OFF[set][2]; P.root.visible = true; poseScaled(P, p, rootY + OFF[set][1]); return p; };
  const dogAt = (d, set, x, z, rotY, st, t, y = 0) => { d.g.visible = true; d.g.position.set(x + OFF[set][0], y + OFF[set][1], z + OFF[set][2]); d.g.rotation.set(0, rotY, 0); d.update(t, st); };
  const holdBunny = (t) => { pip.anchors.mouth.add(bunny); bunny.visible = true; bunny.position.set(0, -0.05, 0.03); bunny.rotation.set(-1.2, 0, 0.3 * Math.sin(t * 8)); bunny.scale.setScalar(1.25 / PIPS); };
  const placeBunny = (v, rotY = 0, roll = 0, s = 1.25) => { if (bunny.parent !== scene) scene.add(bunny); bunny.visible = true; bunny.position.copy(v); bunny.rotation.set(0, rotY, roll); bunny.scale.setScalar(s); };
  const holdBowl = () => { pip.anchors.mouth.add(bowl); bowl.visible = true; bowl.position.set(0, -0.075, 0.035); bowl.rotation.set(0.25, 0, 0); bowl.scale.setScalar(1 / PIPS); };
  const placeBowl = (v, ry = 0) => { if (bowl.parent !== scene) scene.add(bowl); bowl.visible = true; bowl.position.copy(v); bowl.rotation.set(0, ry, 0); bowl.scale.setScalar(1); };
  const placeFish = (v, t, face = 0, tilt = 0) => { if (fish.g.parent !== scene) scene.add(fish.g); fish.g.visible = true; fish.g.position.copy(v); fish.g.rotation.set(tilt, 0, tilt * 0.6); fish.g.scale.setScalar(1); fish.update(t, face); };
  const holdFish = (t) => { pip.anchors.mouth.add(fish.g); fish.g.visible = true; fish.g.position.set(0, -(fish.top + FISH_R * Math.sin(0.2 * PI)) / PIPS + 0.01, 0.02); fish.g.rotation.set(-0.15, PI / 2, 0.05 * Math.sin(t * 9)); fish.g.scale.setScalar(1 / PIPS); fish.update(t, 0); };
  const mouthW = () => { pip.g.updateMatrixWorld(true); return pip.anchors.mouth.getWorldPosition(new THREE.Vector3()); };
  const handPhone = (P, side, p2, toFace = 1) => {
    P.root.updateMatrixWorld(true); const h = handWorld(P, side), head = P.head.g.getWorldPosition(new THREE.Vector3());
    p2.g.visible = true; p2.g.position.copy(h).add(new THREE.Vector3(0, 0.02, 0)); p2.g.scale.setScalar(1.15);
    const dir = head.sub(h).normalize(); p2.g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.lerp(new THREE.Vector3(0, 1, 0), 1 - toFace).normalize());
  };

  // ---------------------------------------------------------------- weather + light per set
  // storm k: 0 = calm afternoon, 1 = full storm. clear k (outdoors, calm beat): 0 = storm sky … 1 = sunshine
  const _a = new THREE.Color(), _b = new THREE.Color();
  function subWeather(t, storm, sun = 0) {
    stormM.opacity = clamp(storm * (1 - sun)); cloudMats.forEach((m) => (m.opacity = 0.3 * sun));
    const L = sub.lights;
    L.hemi.intensity = lerp(1.0, 1.3, sun); L.hemi.color.copy(_a.set(0xcfe0bf).lerp(_b.set(0xcfe3ff), sun)); L.hemi.groundColor.copy(_a.set(0x5f6a48).lerp(_b.set(0x7a8a5a), sun));
    L.sun.intensity = lerp(0.85, 2.7, sun); L.sun.color.copy(_a.set(0xd8e2c0).lerp(_b.set(0xfff2dc), sun));
    subFog.color.copy(_a.set(0x9aa890).lerp(_b.set(0xdfe8ee), sun)); subFog.near = lerp(22, 40, sun); subFog.far = lerp(170, 220, sun);
    rays.forEach((r, i) => (r.material.opacity = 0.16 * sun * (0.7 + 0.3 * Math.sin(t * 0.8 + i))));
    bowM.opacity = 0.35 * smooth((sun - 0.4) / 0.6);
    // trees bend + shiver with the wind (calm = a breeze)
    const wv = storm * (1 - sun);
    trees.forEach(({ g, ph }) => { g.rotation.z = wv * (0.12 + 0.05 * Math.sin(t * 5.5 + ph)) + 0.015 * Math.sin(t * 1.3 + ph); g.rotation.x = wv * 0.03 * Math.sin(t * 4.1 + ph); });
  }
  function livLight(storm, t) {
    const L = liv.lights;
    viewM.color.setScalar(1); stormViewM.opacity = storm;
    L.hemi.intensity = lerp(1.1, 0.85, storm); L.hemi.color.copy(_a.set(0xf2f0ea).lerp(_b.set(0xd2e2c4), storm));
    L.sun.intensity = lerp(1.6, 0.9, storm); L.sun.color.copy(_a.set(0xe8ecf2).lerp(_b.set(0xc8dcb4), storm)); L.sun.position.set(-1.2, 3.6, -7.5);
    // warm lamps come on as the storm darkens (cozy, never black)
    const lamp = smooth(storm * 1.4);
    L.lampL.intensity = 2.2 * lamp; L.pend.intensity = 0.5 * lamp; L.fillL.intensity = 1.5; L.fillD.intensity = 1.0;
    liv.setConsole(lamp); liv.setNightlight(0.3 * lamp); liv.setUpstairs(0.25 * lamp);
    shadeMats.forEach(([m, e]) => (m.emissiveIntensity = e * lamp));
    curtains.forEach((cu, i) => { cu.rotation.y = storm * 0.05 * Math.sin(t * 6 + i * 2); cu.position.z = -2.8 + 0.07 + storm * 0.02 * (1 + Math.sin(t * 4.3 + i)); });
  }

  // ---------------------------------------------------------------- update
  let cur = null, camO = null;
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', set: 'liv', t0: 200, t1: 300 } : shotAt(t), Sx = shot.set, cam = shot.cam;
    if (Sx !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === Sx; scene.fog = FOG[Sx]; cur = Sx; }
    studio.camera.far = FAR[Sx]; studio.camera.near = Sx === 'sub' ? 0.1 : 0.03; studio.fill.intensity = story.look.fill;
    const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;

    // reset
    CAST.forEach((P) => (P.root.visible = false));
    [pip.g, bunny, wagon.g, bowl, fish.g, phone.g, tramp, gnome, car.g, winChair.g, towel.g, ...sPhones.map((p) => p.g), ...chairs.map((ch) => ch.g)].forEach((g) => (g.visible = false));
    if (bunny.parent !== scene) scene.add(bunny);
    if (bowl.parent !== scene) scene.add(bowl);
    if (fish.g.parent !== scene) scene.add(fish.g);
    winLeaves.im.visible = false;
    bunny.scale.setScalar(1.25); bunny.rotation.set(0, 0, 0); bowl.scale.setScalar(1);
    funnel.update(t, 0); tvRed.intensity = 0; livTV.material.map = tvNews;
    rosa.porchRoof.rotation.z = 0; rPost.position.copy(rPost0); rPost.rotation.set(0, 0, 0); rosa.door.rotation.y = 0;
    bath.door.rotation.y = 0; bath.setLight(1); curtain.visible = true;
    camO = null;
    let wx = { rain: 0, leaves: 0, wind: 0 };

    if (cam === 'lineup') return lineup(t);
    wx = BEATS[cam](t, u) || wx;

    // camera
    let P, Aim, fov, amp;
    if (camO) { P = camO.P; Aim = camO.A; fov = camO.fov; amp = camO.amp ?? 0.003; }
    else { const C = CAMS[cam], o = OFF[Sx]; P = C.p[0].map((v, i) => lerp(v, C.p[1][i], e) + o[i]); Aim = C.a[0].map((v, i) => lerp(v, C.a[1][i], e) + o[i]); fov = C.fov; amp = C.amp; }
    // wind buffet: a soft shake outdoors in the storm
    if (Sx === 'sub' && wx.wind > 0) { const k = 0.012 * wx.wind / 40; P = [P[0] + k * Math.sin(t * 17), P[1] + k * Math.sin(t * 13 + 1), P[2]]; }
    setCamera(P, Aim, fov, t, amp); studio.camera.updateMatrixWorld();
    rain.update(t, studio.camera, Sx === 'sub' ? wx.rain : 0, wx.wind);
    leaves.update(t, studio.camera, Sx === 'sub' ? wx.leaves : 0, wx.wind * 0.6);
  }

  // ---------------------------------------------------------------- the afternoon (before the storm)
  const BEATS = {
    thumb(t) {
      livLight(0, t); holdBunny(t);
      const ear = pulseAt(t, [1.4], 0.5);
      dogAt(pip, 'liv', 0.5, 0.05, 0.25, { sit: 1, headPitch: -0.12, tilt: K(t, [[0, 0.0], [1.0, 0.25], [2.2, 0.25], [3.0, -0.08]]), ears: 1 - 0.3 * ear, earL: 0.3 * ear, wag: 0.7, lookY: 0.4, mouth: 'smile' }, t);
    },
    bye(t) {
      livLight(0, t);
      const [b0, b1] = EV.bye, go = smooth((t - 6.2) / 0.5), up = smooth((t - 5.9) / 0.4);
      // Mia kneels and boops his nose, then pops up and runs off right; Mom + Dad wave from behind with the keys
      const boop = smooth((t - b0) / 0.3) * (1 - smooth((t - b1) / 0.3));
      const mw = walkLegs(t, [0.78, 0.18], [{ t0: 6.15, t1: 7.6, pts: [[1.7, 0.5], [3.4, 0.9]] }]);
      put(mia, 'liv', { x: mw.x, z: mw.z, rotY: t < 6.15 ? faceToward(0.78, 0.18, 0.2, 0.32) : (mw.head ?? 1.2), dist: mw.dist, speed: mw.speed, y: KNEEL.y * (1 - up), footFwd: KNEEL.footFwd * (1 - up), lean: KNEEL.lean * (1 - up), armA: mixArm(A(-0.4, 0.1, -0.6, 0.3), REST, up), armB: t < 6.0 ? mixArm(A(-0.7, 0.1, -0.6, -0.2), BOOP_B, boop) : WAVE_B(t), headPitch: 0.2 * (1 - up), headYaw: 0, eyes: boop > 0.5 ? 'closed' : blink(t, 2), mouth: 'smile' });
      const mmw = walkLegs(t, [1.25, -0.8], [{ t0: 6.4, t1: 7.6, pts: [[2.4, 0.2], [3.4, 0.8]] }]);
      put(mom, 'liv', { x: mmw.x, z: mmw.z, rotY: t < 6.4 ? -0.55 : (mmw.head ?? 1.0), dist: mmw.dist, speed: mmw.speed, armA: REST, armB: t < 6.4 ? WAVE_B(t + 0.4) : REST, headPitch: 0.25, eyes: blink(t, 5), mouth: 'smile' });
      const dw = walkLegs(t, [1.9, -1.15], [{ t0: 6.6, t1: 7.6, pts: [[2.9, -0.2]] }]);
      put(dad, 'liv', { x: dw.x, z: dw.z, rotY: t < 6.6 ? -0.75 : (dw.head ?? 0.9), dist: dw.dist, speed: dw.speed, armA: KEYS_A, armB: t < 6.6 ? WAVE_B(t + 1.1) : REST, headPitch: 0.25, eyes: blink(t, 3), mouth: 'smile' });
      const look = smooth((t - 6.2) / 0.6);
      dogAt(pip, 'liv', 0.2, 0.32, lerp(faceToward(0.2, 0.32, 0.78, 0.18), 1.2, look), { sit: 1, headPitch: lerp(-0.35, -0.15, up) + 0.15 * boop, ears: 1, eyes: boop > 0.5 ? 'happy' : 'open', wag: 1, wagRate: 5, mouth: 'pant', tilt: 0.2 * look }, t);
      placeBunny(W('liv', 0.05, 0, 0.62), 0.4, 1.3);
      void go;
    },
    alone(t) {
      livLight(0.15 * smooth((t - 9.9) / 1.4), t);
      const P0 = EV.perk, perk = smooth((t - P0) / 0.25), situp = smooth((t - P0 - 0.25) / 0.45);
      dogAt(pip, 'liv', 0.5, 0.0, 0.0, { lie: 1 - situp, sit: situp, ears: lerp(0.35, 1, perk), earL: 0.15 * Math.sin(t * 9) * perk * (1 - situp), headPitch: lerp(0.12, -0.3, perk), headYaw: lerp(0, 0.45 + 0.15 * Math.sin(t * 1.7), situp), tilt: lerp(0, 0.3, situp) * Math.sin(t * 1.3 + 0.5), lookY: 0.4 * perk, lookX: 0.4 * situp, eyes: t < P0 ? (blink(t, 2) === 'closed' ? 'closed' : 'sleepy') : 'wide', lids: t < P0 ? 0.45 : 0, wag: lerp(0.35, 0.1, perk), mouth: t < P0 ? 'smile' : 'flat' }, t);
      if (situp < 0.5) placeBunny(W('liv', 0.5, 0.0, 0.2), 0.3, 1.25); else placeBunny(W('liv', 0.62, 0, 0.18), -0.4, 1.3);
    },
    window(t) {
      const st = smooth((t - 11.4) / 3.6);
      livLight(st, t);
      // Pip on the sofa cushion, paws on the back, looking out; at 13.1 he turns his worried face back over his shoulder
      const back = smooth((t - 13.1) / 0.45) * (1 - smooth((t - 14.6) / 0.45));
      dogAt(pip, 'liv', 0.95, -2.2, PI - 0.1, { sit: 0.6, lean: -0.1, ears: lerp(1, 0.75, back), earsBack: 0.3 * back, headPitch: lerp(-0.25, -0.05, back), headYaw: lerp(0.1 * Math.sin(t * 1.2), 1.25, back), tilt: 0.25 * back, eyes: 'open', lookX: 0.6 * back, mouth: 'flat', wag: 0.2, tailDown: 0.3 * st }, t, 0.69);
      // a lawn chair tumbles past outside, leaves stream across the glass
      const ch = clamp((t - 13.6) / 1.5);
      winChair.g.visible = ch > 0 && ch < 1; winChair.g.position.set(lerp(2.6, -1.8, ch), 1.0 + 0.6 * Math.sin(ch * PI), -3.9); winChair.g.rotation.set(t * 3, t * 2, t * 4);
      liv.root.updateMatrixWorld(true);
      winLeaves.update(t, { position: W('liv', 0.4, 0.8, -2.6), getWorldDirection: (v) => v.set(0, 0, -1) }, 0.8 * st, 6);
    },
    tvA(t) {
      livLight(1, t);
      livTV.material.map = tvWarn; tvRed.intensity = 0.6;
      // the phone on the TV console lights up and buzzes
      phone.g.visible = true; phone.g.position.copy(W('liv', 2.7, 0.505, -0.1)); phone.g.rotation.set(0, 0.5 + 0.06 * Math.sin(t * 60) * pulseAt(t, [EV.buzz[0], EV.buzz[0] + 0.5], 0.3), 0); phone.g.scale.setScalar(1.6);
      phone.screenMat.emissiveIntensity = t > EV.buzz[0] ? 1.3 : 0.05;
      // Pip trots in at the bottom of frame and sits, looking up at the TV

    },
    tvB(t) {
      livLight(1, t);
      livTV.material.map = tvWarn; tvRed.intensity = 1.0 + 0.25 * Math.sin(t * 6);
      const get = smooth((t - 21.5) / 0.35);
      dogAt(pip, 'liv', 1.55, 0.0, PI / 2 - 0.5, { sit: 1 - get * 0.6, ears: lerp(0.4, 1, get), earsBack: 0.5 * (1 - get), headPitch: lerp(-0.45, -0.2, get), tilt: K(t, [[20.6, 0], [21.1, 0.32], [21.5, 0.32], [21.9, -0.1]]), eyes: get > 0.5 ? 'wide' : 'open', lookY: 0.5 - 0.3 * get, lookX: 0.2, mouth: get > 0.5 ? 'o' : 'flat', wag: 0.3 + 0.5 * get, tailDown: 0.5 * (1 - get), hop: 0.06 * Math.max(0, Math.sin(clamp((t - 21.6) / 0.3) * PI)) }, t);
    },
    store(t) {
      // every phone in the aisle buzzes at once; Mom, Dad and Mia read theirs, then look at each other: Pip!
      const look = smooth((t - 24.2) / 0.4), gasp = smooth((t - 24.6) / 0.3);
      put(mom, 'store', { x: 0.35, z: -3.3, rotY: -0.25 + 0.6 * look, armA: PHONE_A, armB: mixArm(PHONE_B, CHEEK_B, gasp), headPitch: lerp(0.45, 0.05, look), headYaw: 0.3 * look, eyes: blink(t, 4), mouth: gasp > 0.5 ? 'o' : 'flat' });
      put(dad, 'store', { x: -0.05, z: -3.65, rotY: 0.15 - 0.5 * look, armA: REST, armB: PHONE_B, headPitch: lerp(0.45, 0.1, look), headYaw: -0.3 * look, eyes: blink(t, 6), mouth: gasp > 0.5 ? 'o' : 'flat', lean: 0.05 });
      put(mia, 'store', { x: -0.3, z: -2.95, rotY: 0.45 + 0.35 * look, armA: mixArm(PHONE_A, HEART_A, gasp), armB: mixArm(REST, HEART_B, gasp), headPitch: lerp(0.15, -0.35, look), headYaw: 0.25 * look, eyes: 'open', mouth: gasp > 0.3 ? 'o' : 'flat' });
      handPhone(mom, -1, sPhones[0]); handPhone(dad, 1, sPhones[1]);
      if (gasp < 0.5) handPhone(mia, -1, sPhones[2]);
      // shoppers down the aisle, all reading their phones
      [[extras[0], -0.4, -6.4, 0.3], [extras[1], 0.5, -7.2, -0.4], [extras[2], -0.1, -8.6, 0.1]].forEach(([P, x, z, ry], i) => { put(P, 'store', { x, z, rotY: ry, armA: PHONE_A, armB: i === 1 ? PHONE_B : REST, headPitch: 0.45, eyes: blink(t, 3 + i), mouth: 'o' }); handPhone(P, i === 1 ? 1 : -1, sPhones[3 + i]); });
      sPhones.forEach((p, i) => { p.screenMat.emissiveIntensity = t > EV.buzz[1 + (i % 4)] - 0.2 ? 1.2 : 0.05; p.g.rotation.z += 0.05 * Math.sin(t * 55 + i) * pulseAt(t, [EV.buzz[1 + (i % 4)]], 0.4); });
    },
    pack(t) {
      livLight(1, t);
      const [DB, DW, DF] = [EV.dropBunny, EV.dropBowl, EV.dropFish];
      const WG = W('liv', WAGON[0], 0, WAGON[1]);
      wagon.g.visible = true; wagon.g.position.copy(WG); wagon.g.rotation.set(0, PI / 2, 0); wagon.handle.rotation.set(0.9, 0, 0);
      // three trips in from the left, each one carried in his mouth and set down in the wagon: the bunny, his bowl, then Bubbles
      // (the goldfish bowl has a carry handle; he walks that one in slowly and looks at us, proud)
      const trip = (t0, t1, xEnd) => walkLegs(t, [-0.95, WAGON[1] + 0.02], [{ t0, t1, pts: [[xEnd, WAGON[1] + 0.02]] }]);
      const out = (t0, xs) => walkLegs(t, [xs, WAGON[1] + 0.02], [{ t0, t1: t0 + 0.5, pts: [[-0.95, WAGON[1] + 0.04]] }]);
      let w, head = 0, walk = 0, st = {}, item = null;
      if (t < DB + 0.3) { w = trip(25.6, DB - 0.25, -0.25); walk = t < DB - 0.25 ? 1 : 0; head = PI / 2; item = t < DB ? 'bunny' : null; st = { headPitch: smooth((t - DB + 0.45) / 0.25) * 0.5 }; }
      else if (t < DB + 0.85) { w = out(DB + 0.3, -0.25); walk = 1; head = -PI / 2; }
      else if (t < DW + 0.3) { w = trip(DB + 0.9, DW - 0.25, -0.12); walk = t < DW - 0.25 ? 1 : 0; head = PI / 2; item = t < DW ? 'bowl' : null; st = { headPitch: smooth((t - DW + 0.45) / 0.25) * 0.5 }; }
      else if (t < DW + 0.85) { w = out(DW + 0.3, -0.12); walk = 1; head = -PI / 2; }
      else { w = trip(DW + 0.9, DF - 0.3, -0.02); walk = t < DF - 0.3 ? 0.6 : 0; head = PI / 2; item = t < DF ? 'fish' : null; const proud = smooth((t - DF - 0.1) / 0.35); st = { headPitch: smooth((t - DF + 0.5) / 0.3) * 0.45 * (1 - proud) - 0.1 * proud, headYaw: -0.9 * proud, eyes: proud > 0.5 ? 'happy' : 'open', mouth: t > DF ? 'pant' : 'open', open: 0.1, wag: 1, wagRate: 5.5 }; }
      dogAt(pip, 'liv', w.x, w.z, head, { walk, dist: w.dist, ears: 1, wag: 0.8, wagRate: 5, mouth: item ? 'open' : 'smile', open: 0.1, ...st }, t);
      if (item === 'bunny') holdBunny(t); else placeBunny(W('liv', WAGON[0] - 0.19, wagon.bedY, WAGON[1] + 0.02), 0.6, 1.25, 1.25);
      if (item === 'bowl') holdBowl(); else if (t >= DW) placeBowl(W('liv', WAGON[0] + 0.0, wagon.bedY, WAGON[1] + 0.04), 0.3);
      if (item === 'fish') holdFish(t);
      else if (t >= DF) { const land = Math.exp(-(t - DF) * 9) * Math.sin((t - DF) * 30); placeFish(W('liv', WAGON[0] + 0.17, wagon.bedY, WAGON[1] + 0.02), t, t > DF + 0.5 ? 0.7 : 0, 0.06 * land); fish.g.scale.set(1 + 0.1 * land, 1 - 0.1 * land, 1 + 0.1 * land); }
    },
    haul(t, u) {
      livLight(1, t);
      // Pip pulls the wagon (handle in his mouth) right → left across the room, past the window; a lawn chair tumbles by outside
      const x = lerp(0.9, -2.0, smooth(clamp((t - 30.6) / 3.3)) * 0.85 + clamp((t - 30.6) / 3.3) * 0.15), z = 0.28;
      const dist = (0.9 - x);
      dogAt(pip, 'liv', x, z, -PI / 2, { walk: 1, dist, ears: 1, earsBack: 0.2, wag: 0.6, mouth: 'open', open: 0.1, headPitch: 0.08, headYaw: 0.25 * pulseAt(t, [EV.chair + 0.2], 0.6) }, t);
      const wgx = x + 0.78;
      wagon.g.visible = true; wagon.g.position.copy(W('liv', wgx, 0, z)); wagon.g.rotation.set(0, -PI / 2, 0); wagon.roll(dist);
      wagon.setHandle(mouthW());
      placeBunny(W('liv', wgx + 0.17, wagon.bedY, z - 0.02), -1.0, 1.25);
      placeBowl(W('liv', wgx - 0.02, wagon.bedY, z - 0.04), 0.3);
      placeFish(W('liv', wgx - 0.18, wagon.bedY, z), t, 0, 0.04 * Math.sin(t * 7));
      const ch = clamp((t - EV.chair) / 1.4);
      winChair.g.visible = ch > 0 && ch < 1; winChair.g.position.set(lerp(2.4, -1.4, ch), 1.0 + 0.5 * Math.sin(ch * PI), -3.6); winChair.g.rotation.set(t * 3, t * 2, t * 4);
      camO = { P: [x + 0.4 + OFF.liv[0], 0.55, 2.5], A: [x + 0.4 + OFF.liv[0], 0.56, -1.2], fov: 50, amp: 0.004 };
      void u;
    },
    tubA(t) {
      bath.setLight(1);
      // he drags the wagon in by the handle (from the doorway), parks it by the tub and hops in over the rim
      const H0 = EV.hopIn;
      const w = walkLegs(t, [0.4, 0.7], [{ t0: 34.0, t1: H0 - 0.35, pts: [[0.0, 0.1], [-0.5, -0.18]] }]);
      const hop = clamp((t - H0) / 0.5), arc = Math.sin(hop * PI) * 0.62, land = smooth((t - H0 - 0.5) / 0.3);
      let px = w.x, pz = w.z, py = 0, hd = t < H0 - 0.35 ? (w.head ?? -PI / 2) : PI;
      if (t >= H0) { px = lerp(-0.5, TUB.x + 0.1, hop); pz = lerp(-0.18, TUB.z, hop); py = lerp(0, TUB.y, hop) + arc; }
      dogAt(pip, 'bath', px, pz, hd, { walk: t < H0 - 0.35 ? 1 : 0, dist: w.dist, ears: 1, wag: 0.8, wagRate: 5, mouth: t < H0 - 0.2 ? 'open' : 'pant', open: 0.1, lean: t > H0 - 0.25 && t < H0 ? 0.3 : 0, headPitch: t > H0 - 0.3 && hop < 1 ? -0.3 : 0.05, sit: land }, t, py);
      const hh = w.head ?? -PI / 2, wp = t < H0 - 0.35 ? new THREE.Vector3(w.x - 0.78 * Math.sin(hh), 0, w.z - 0.78 * Math.cos(hh)) : new THREE.Vector3(-0.5 + 0.78, 0, -0.18);
      const wyaw = t < H0 - 0.35 ? hh : -PI / 2;
      wagon.g.visible = true; wagon.g.position.copy(W('bath', wp.x, 0, wp.z)); wagon.g.rotation.set(0, wyaw, 0); wagon.roll(w.dist);
      if (t < H0 - 0.35) wagon.setHandle(mouthW()); else wagon.handle.rotation.set(0.9, 0, 0);
      const wg = wagon.g.position.clone();
      const fwd = new THREE.Vector3(Math.sin(wyaw), 0, Math.cos(wyaw));
      placeBunny(wg.clone().addScaledVector(fwd, -0.17).setY(wagon.bedY), wyaw, 1.25);
      placeBowl(wg.clone().addScaledVector(fwd, 0.02).setY(wagon.bedY), 0.3);
      placeFish(wg.clone().addScaledVector(fwd, 0.18).setY(wagon.bedY), t);
    },
    tubB(t) {
      bath.setLight(1);
      // inside the tub: everyone in; he grabs the towel's corner and pulls it over them
      const [T0, T1] = EV.towel, pull = smooth((t - T0) / (T1 - T0));
      dogAt(pip, 'bath', TUB.x, TUB.z, PI / 2 - 0.15, { lie: smooth((t - T1) / 0.4), sit: 1 - smooth((t - T1) / 0.4), ears: 1, earsBack: 0.25, headPitch: lerp(-0.1, 0.25, pull) - 0.2 * smooth((t - T1) / 0.4), headYaw: lerp(0.4, 0, pull), mouth: t > T0 - 0.2 && t < T1 + 0.1 ? 'open' : 'smile', open: 0.1, wag: 0.5, eyes: 'open', lookY: 0.2 }, t, TUB.y);
      placeBunny(W('bath', TUB.x + 0.24, TUB.y, TUB.z + 0.08), 1.4, 0, 1.25);
      placeBowl(W('bath', TUB.x - 0.42, TUB.y, TUB.z + 0.14), 0.3);
      placeFish(W('bath', TUB.x + 0.34, TUB.y, TUB.z + 0.18), t, 0.3);
      towel.g.visible = true; towel.set(pull, t);
      towel.g.position.copy(W('bath', lerp(TUB.x - 0.75, TUB.x - 0.12, pull), lerp(0.56, TUB.y, pull), lerp(TUB.z - 0.05, TUB.z - 0.06, pull)));
      towel.g.rotation.set(0, 0, lerp(1.2, 0, pull));
    },
    hold(t) {
      // the ceiling light flickers; Pip hugs the bunny under the towel; Bubbles swims to the glass; he licks it
      const fl = EV.flick.reduce((m, f) => Math.max(m, 1 - smooth(Math.abs(t - f) / 0.07)), 0);
      bath.setLight(1 - 0.75 * fl);
      const L0 = EV.lick, lk = pulseAt(t, [L0], 0.45), turn = smooth((t - 46.6) / 0.4);
      dogAt(pip, 'bath', TUB.x, TUB.z, PI / 2 - 0.15, { lie: 1, ears: lerp(0.55, 0.85, turn), earsBack: 0.35 * (1 - turn) + 0.4 * fl, headPitch: lerp(-0.35, -0.1, turn) - 0.1 * fl, headYaw: lerp(-0.1, 0.5, turn), lookY: 0.4 * (1 - turn), lookX: 0.4 * turn, eyes: fl > 0.3 ? 'wide' : 'open', mouth: lk > 0.05 ? 'open' : 'flat', open: 0.08 * lk, tongue: lk, lick: lk, wag: 0.25 + 0.5 * turn, shiver: 0.25 * (1 - turn) }, t, TUB.y);
      placeBunny(W('bath', TUB.x + 0.22, TUB.y, TUB.z + 0.1), 1.4, 0.2, 1.25);
      placeBowl(W('bath', TUB.x - 0.42, TUB.y, TUB.z + 0.14), 0.3);
      placeFish(W('bath', TUB.x + 0.4, TUB.y, TUB.z + 0.02), t, smooth((t - 46.4) / 0.6));
      towel.g.visible = true; towel.set(1, t); towel.g.position.copy(W('bath', TUB.x - 0.12, TUB.y, TUB.z - 0.06));
    },
    find(t) {
      bath.setLight(1);
      // from Pip's spot in the tub: the door flies open, three faces in the doorway, relief, they rush in
      const O = EV.doorOpen, op = pop(t, O), rush = smooth((t - 57.5) / 1.3);
      bath.door.rotation.y = -1.45 * clamp(op);
      put(mia, 'bath', { x: lerp(0.5, 0.15, rush), z: lerp(1.62, 0.6, rush), rotY: PI + 0.15, dist: rush * 1.0, speed: rush > 0.02 && rush < 0.98 ? 1.2 : 0, armA: mixArm(REST, REACH_A, rush), armB: mixArm(t > O + 0.5 ? HEART_B : REST, REACH_B, rush), headPitch: 0.35, eyes: 'open', mouth: t > O + 0.9 ? 'smile' : 'o' });
      put(mom, 'bath', { x: 0.2, z: lerp(1.95, 1.2, rush), rotY: PI + 0.1, dist: rush * 0.75, speed: rush > 0.02 && rush < 0.98 ? 0.9 : 0, armA: t > O + 0.6 ? CHEEK_A : REST, armB: t > O + 0.6 ? CHEEK_B : REST, headPitch: 0.4, eyes: blink(t, 3), mouth: t > O + 0.9 ? 'smile' : 'o' });
      put(dad, 'bath', { x: 0.78, z: lerp(2.05, 1.55, rush), rotY: PI - 0.15, dist: rush * 0.5, speed: rush > 0.02 && rush < 0.98 ? 0.6 : 0, armA: REST, armB: t > O + 0.7 ? HEART_B : REST, headPitch: 0.4, eyes: blink(t, 5), mouth: t > O + 1.0 ? 'smile' : 'o', lean: 0.05 });
      // his ears + the towel edge in the bottom of the frame
      dogAt(pip, 'bath', TUB.x, TUB.z, PI / 2 - 0.15 + 0.5, { lie: 1, ears: 1, headPitch: -0.45, wag: 1, wagRate: 5.5, eyes: 'open', mouth: 'pant' }, t, TUB.y);
      towel.g.visible = true; towel.set(1, t); towel.g.position.copy(W('bath', TUB.x - 0.12, TUB.y, TUB.z - 0.06));
      placeFish(W('bath', TUB.x + 0.12, TUB.y, TUB.z + 0.26), t, 0.3);
    },
    hug(t) {
      bath.setLight(1); bath.door.rotation.y = -1.45;
      // the pile-in: Mia kneels in the tub hugging him from behind, his paws up on the rim; Mom + Dad perch on the two ends of the
      // tub and lean in; licks, a full-speed wag
      const lk = pulseAt(t, EV.licks, 0.4), rise = smooth((t - 59.0) / 0.4), laugh = pulseAt(t, EV.laugh.concat([61.0, 62.4]), 0.5);
      curtain.visible = false;
      // Pip sits up on Mia's knees (she kneels in the tub behind him), so his face clears the rim
      dogAt(pip, 'bath', TUB.x + 0.04, -0.7, 0.05, { sit: 1, beg: 0.5 * rise, ears: 1, eyes: lk > 0.2 ? 'happy' : 'open', mouth: 'pant', tongue: lk, lick: lk, wag: 1, wagRate: 5.5, headPitch: -0.2 - 0.1 * lk, headYaw: 0.15 * Math.sin(t * 2) }, t, TUB.y + 0.26);
      put(mia, 'bath', { x: TUB.x + 0.02, z: -0.92, rotY: 0.05, ...KNEEL, lean: 0.3, armA: HUG_A, armB: HUG_B, headPitch: 0.1 - 0.1 * laugh, headYaw: 0.15 * Math.sin(t * 1.7), eyes: lk > 0.3 ? 'closed' : 'happy', mouth: 'smile' }, TUB.y);
      put(mom, 'bath', { x: -1.17, z: TUB.z - 0.02, rotY: PI / 2 - 0.35, y: -0.245, footFwd: 0.42, floor: TUB.y, lean: 0.3, armA: HEART_A, armB: A(-0.9, 0.2, -0.7, -0.3), headPitch: 0.2 - 0.1 * laugh, headYaw: -0.3, eyes: 'happy', mouth: 'smile' });
      put(dad, 'bath', { x: 0.27, z: TUB.z - 0.02, rotY: -PI / 2 + 0.35, y: -0.245, footFwd: 0.42, floor: TUB.y, lean: 0.3, armA: A(-0.9, 0.2, -0.7, 0.3), armB: HEART_B, headPitch: 0.2 - 0.1 * laugh, headYaw: 0.3, eyes: 'happy', mouth: 'smile' });
      placeBunny(W('bath', TUB.x - 0.22, DIMS_RIM, -0.5), 0.3, 0, 1.25);
      placeFish(W('bath', -0.02, DIMS_RIM, -0.5), t, 0.8);
      placeBowl(W('bath', TUB.x - 0.45, TUB.y, TUB.z - 0.12), 0.3);
    },
    // ---------------------------------------------------------------- outside
    street(t) {
      const st = smooth((t - 15.4) / 2.0) * 0.7 + 0.3;
      subWeather(t, st, 0); sub.aimSun(-26, -6, 18);
      funnel.g.position.set(-22, 0, -150); funnel.update(t, 1);
      return { rain: 0.18 * st, leaves: 0.7 * st, wind: 22 * st };
    },
    chaosA(t) {
      subWeather(t, 1, 0); sub.aimSun(-30, 2, 14);
      funnel.g.position.set(-40, 0, 175); funnel.update(t, 1);
      // three lawn chairs tumble across, then the trampoline cartwheels down the street
      const [c0, c1] = EV.chairs;
      chairs.forEach((ch, i) => {
        const k = clamp((t - [c0, c1, c1 + 0.55][i]) / 1.5);
        ch.g.visible = k > 0 && k < 1;
        ch.g.position.set(lerp(-26.5, -35.5, k), 0.6 + [1.2, 2.4, 0.8][i] * Math.sin(k * PI) + 0.3 * Math.sin(k * 9), [0.2, 1.8, -1.2][i]);
        ch.g.rotation.set(t * (3 + i), t * 2.2, t * (4 - i));
      });
      const tk = clamp((t - EV.tramp[0]) / 2.6), rr = 1.25;
      tramp.visible = tk > 0 && tk < 1;
      const tx = lerp(-24.5, -37.5, tk);
      tramp.position.set(tx, rr + 0.5 * Math.abs(Math.sin(tk * PI * 3)), 3.6);
      tramp.rotation.set(PI / 2, 0, (-24.5 - tx) / rr, 'ZYX');
      return { rain: 0.32, leaves: 1, wind: 40 };
    },
    chaosB(t) {
      subWeather(t, 1, 0); sub.aimSun(-19, -4, 14);
      funnel.g.position.set(10, 0, -190); funnel.update(t, 1);
      // the gnome spins past the lens along the lawn edge, then Mrs. Rosa's porch roof folds down like a lawn chair
      const g = clamp((t - 41.9) / 1.7);
      gnome.visible = g > 0 && g < 1; gnome.position.set(lerp(-17.6, -23.4, g), 0.12 + 0.45 * Math.abs(Math.sin(g * PI * 4)), lerp(-4.8, -4.4, g)); gnome.rotation.set(0.2 * Math.sin(t * 9), t * 14, 0.3 * Math.sin(t * 7));
      const f = pop(t, EV.porch);
      rosa.porchRoof.rotation.z = -0.42 * f;
      rPost.position.set(rPost0.x + 0.75 * clamp(f), rPost0.y - 1.1 * clamp(f), rPost0.z); rPost.rotation.z = -1.35 * clamp(f);
      return { rain: 0.32, leaves: 1, wind: 42 };
    },
    calm(t) {
      const S0 = EV.sun, sun = smooth((t - S0) / 1.8), st = 1 - smooth((t - 48.8) / 0.8) * 0.3;
      subWeather(t, st, sun); sub.aimSun(-29, -3, 16);
      funnel.g.position.set(-14, 0, -175); funnel.update(t, 1 - smooth((t - 48.8) / 1.6));
      // the aftermath, cartoon-only: the trampoline sits in the tree, the gnome sits on the mailbox, the porch roof folded next door
      tramp.visible = true; tramp.position.set(TREE.x - 0.3, 3.4, TREE.z + 0.2); tramp.rotation.set(0.5, 0.3, 0.35);
      gnome.visible = true; gnome.position.copy(MAIL); gnome.rotation.set(0, 0.6 + 0.4 * Math.exp(-(t - 48.8)) * Math.sin(t * 6), 0);
      rosa.porchRoof.rotation.z = -0.42; rPost.position.set(rPost0.x + 0.75, rPost0.y - 1.1, rPost0.z); rPost.rotation.z = -1.35;
      // the family car comes racing down the street and brakes at the driveway
      const B = EV.brake, k = clamp((t - 49.6) / (B - 49.6));
      car.g.visible = t > 49.6; car.g.position.set(lerp(-6, -27.6, 1 - (1 - k) * (1 - k)), 0, 1.7); car.g.rotation.set(0, -PI / 2, 0);
      car.body.rotation.x = 0; car.body.rotation.z = t > B ? 0.05 * Math.exp(-(t - B) * 6) * Math.sin((t - B) * 25) : 0;
      return { rain: 0.25 * (1 - sun), leaves: 0.6 * (1 - sun), wind: 30 * (1 - sun) };
    },
    rush(t) {
      subWeather(t, 0, 1); sub.aimSun(PIP_DOOR, -5, 12);
      car.g.visible = true; car.g.position.set(-27.6, 0, 1.7); car.g.rotation.set(0, -PI / 2, 0);
      gnome.visible = true; gnome.position.copy(MAIL); gnome.rotation.set(0, 0.6, 0);
      // up the front walk, running: Mia first, Mom, Dad
      const run = (P, z0, z1, x, t0, sp) => { const k = clamp((t - t0) * sp / Math.abs(z1 - z0)); const z = lerp(z0, z1, k); put(P, 'sub', { x, z, rotY: PI, dist: (t - t0) * sp, speed: k < 1 ? sp : 0, lean: 0.15, armA: RUN_A(t + x), armB: RUN_B(t + x), headPitch: -0.05, eyes: 'open', mouth: 'o' }, 0.03); };
      run(mia, -1.6, -6.2, PIP_DOOR + 0.05, 52.6, 1.7); run(mom, -0.6, -5.4, PIP_DOOR - 0.35, 52.6, 1.65); run(dad, 0.2, -4.6, PIP_DOOR + 0.45, 52.6, 1.6);
      return { rain: 0, leaves: 0, wind: 0 };
    },
  };
  const DIMS_RIM = bath.D.rimY;

  // ---------------------------------------------------------------- pose lineup (t ≥ 200)
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    if (cur !== 'liv') { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === 'liv'; scene.fog = null; cur = 'liv'; }
    livLight(0, t);
    const C = CAMS.lineup; setCamera(C.p[0].map((v, k) => v + OFF.liv[k]), C.a[0].map((v, k) => v + OFF.liv[k]), C.fov, 0, 0);
    dogAt(pip, 'liv', 0.4, 0.5, 0.2, { still: true, beg: 1 }, t);
  }

  return { update };
}
