// VIDEO 021 — "What if your new puppy cried all night on his first night home?"  (Pip ep. 1 · lane 3 @ed._.sims · storybook tone)
// 66.6 s, 20 shots. Pip the corgi puppy's first night: he cries in his crate, the family tries a ticking clock (it's an alarm
// clock), a warm towel (he becomes a ghost) and Mia's bunny (now two of them cry). At 3 AM Mia sneaks downstairs in her
// pajamas and stays by the crate; in the morning they're both asleep IN it. HUD = HOURS UNTIL MORNING 10 → 0.
// NEW (reusable for every Pip episode): engine/pip.js (makePip, makeCrate, makeMia/Mom/Dad, poseScaled, pulseAt) and
// livingroom.js `{ home: true }` (stairs, upstairs light, console lamp, Pip's corner, moon nightlight, clock hands, setDawn).
// Event times (whimpers, ring, bonk, squeaks, licks) live in story.json → "pip" so make_cues.py syncs the foley to the same numbers.
//
// Sources (checked Oct 26, 2026):
//   puppies sleep 18–20 hours a day — AKC, "How Much Do Puppies Sleep?" (akc.org/expert-advice/health/how-much-do-puppies-sleep)
//   it's very common for puppies to cry their first few nights home — PetMD, "5 Tips for Surviving Your First Night With a New Puppy"
//   (the ticking-clock-in-a-towel "heartbeat" trick is folk advice, e.g. Hepper's first-night tips; told here as Dad's "old trick")
//
// Shot list (seconds)               | set      | what happens
//  0.0– 3.4 thumb   9 PM            | living   | the question over Pip in his crate at night: big eyes up at us, ears half down, one tiny whimper
//  3.4– 9.4 home    9:00 PM  (10)   | living   | lamps on: zoomies round the rug, he pounces on Mia's bunny; Mom + Dad watch from the couch
//  9.4–12.4 bed1    9:30 PM         | crate    | from inside the crate: Mia waves goodnight, shuts the door, the lamp goes out, she pads off
// 12.4–15.0 quiet                   | crate    | Pip looks left, right… ears droop… and HOWLS (the music enters)
// 15.0–17.2 pop                     | bedroom  | Mom + Dad's eyes snap open in sync
// 17.2–19.8 clockA  11 PM    (8)    | crate    | Dad kneels and slides in a towel-wrapped ticking clock
// 19.8–24.2 clockB                  | crate    | Pip snuggles it, eyes drooping… RING: it's an alarm clock; he leaps a foot in the air
// 24.2–26.6 towelA  12 AM    (7)    | crate    | Mom drapes a steaming warm towel over him
// 26.6–30.4 towelB                  | crate    | the lump goes still… then a tiny ghost walks into the crate door: BONK
// 30.4–32.8 bunnyA  1 AM     (6)    | crate    | Mom brings down Mia's bunny
// 32.8–36.6 bunnyB                  | crate    | he hugs it; every sob squeaks it; he rolls onto his back still crying
// 36.6–38.8 awake   2:58 AM  (4)    | bedroom  | Dad under a pillow, Mom staring at the ceiling, the bedside clock glowing 2:58
// 38.8–41.0 mia                     | bedroom  | Mia awake in bed; she looks at the door and kicks off her blanket
// 41.0–44.4 stairs  3 AM            | stairs   | bunny slippers + a flashlight come down the stairs
// 44.4–47.0 perk                    | crate    | ears up, head tilt, the tail starts — he knows those slippers
// 47.0–51.0 stay    3:04 AM         | floor    | overhead: Mia lies down by the crate, Pip walks out and curls up at her chest; both fall asleep
// 51.0–53.4 lapse   → SUNRISE (0)   | window   | time-lapse: the clock spins, the sky turns to sunrise, light floods in
// 53.4–56.0 found   7:00 AM         | crate    | Mom + Dad crouch in the sun, hands on hearts, a phone photo
// 56.0–59.6 reveal                  | crate    | both asleep INSIDE the crate; Pip wakes, licks her nose, tail at full speed; she giggles
// 59.6–62.6 dad                     | living   | "Dad did not.": Dad yawns over his coffee. End card at 62.6
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, smooth, lerpAngle, walkLegs, faceToward, mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSleeper, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeBunny, makeFlashlight, quiltTexture, makeMug, makePhone } from '@engine/props.js';
import { buildLivingRoom, DIMS as LV } from '@engine/sets/livingroom.js';
import { buildBedroom, DIMS as BD } from '@engine/sets/bedroom.js';
import { makePip, makeCrate, makeMia, makeMom, makeDad, poseScaled, pulseAt } from '@engine/pip.js';

const PI = Math.PI;
const OFF = { liv: [0, 0, 0], bed: [3000, 0, 0] };
const HM = LV.home, CR = HM.crate;            // crate center (door faces +z)
const PIPS = 0.92;                            // Pip's size

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'thumb', set: 'liv' },
  { t0: 3.4, t1: 9.4, cam: 'home', set: 'liv' },
  { t0: 9.4, t1: 12.4, cam: 'bed1', set: 'liv' },
  { t0: 12.4, t1: 15.0, cam: 'quiet', set: 'liv' },
  { t0: 15.0, t1: 17.2, cam: 'pop', set: 'bed' },
  { t0: 17.2, t1: 19.8, cam: 'clockA', set: 'liv' },
  { t0: 19.8, t1: 24.2, cam: 'clockB', set: 'liv' },
  { t0: 24.2, t1: 26.6, cam: 'towelA', set: 'liv' },
  { t0: 26.6, t1: 30.4, cam: 'towelB', set: 'liv' },
  { t0: 30.4, t1: 32.8, cam: 'bunnyA', set: 'liv' },
  { t0: 32.8, t1: 36.6, cam: 'bunnyB', set: 'liv' },
  { t0: 36.6, t1: 38.8, cam: 'awake', set: 'bed' },
  { t0: 38.8, t1: 41.0, cam: 'mia', set: 'bed' },
  { t0: 41.0, t1: 44.4, cam: 'stairs', set: 'liv' },
  { t0: 44.4, t1: 47.0, cam: 'perk', set: 'liv' },
  { t0: 47.0, t1: 49.3, cam: 'stayA', set: 'liv' },
  { t0: 49.3, t1: 51.4, cam: 'stayB', set: 'liv' },
  { t0: 51.4, t1: 53.4, cam: 'lapse', set: 'liv' },
  { t0: 53.4, t1: 56.0, cam: 'found', set: 'liv' },
  { t0: 56.0, t1: 59.6, cam: 'reveal', set: 'liv' },
  { t0: 59.6, t1: 70, cam: 'dad', set: 'liv' },
];
// camera coords are LOCAL to the shot's set: p/a = [start, end] (eased across the shot)
const IN = { p: [[-3.05, 0.44, -1.95], [-3.05, 0.44, -1.88]], a: [[-3.05, 0.78, 0.4], [-3.05, 0.78, 0.4]], fov: 58, amp: 0.003 };     // inside the crate, looking out the door
const FRONT = { p: [[-3.0, 0.5, -0.56], [-3.0, 0.48, -0.66]], a: [[-3.0, 0.44, -1.45], [-3.0, 0.43, -1.45]], fov: 44, amp: 0.003 }; // Pip's face, through the (hidden) door
export const CAMS = {
  thumb:  { p: [[-3.0, 0.6, -0.5], [-3.0, 0.58, -0.6]], a: [[-3.0, 0.56, -1.45], [-3.0, 0.55, -1.45]], fov: 42, amp: 0.002 },
  home:   { p: [[-0.45, 0.37, 1.55], [-0.55, 0.36, 1.35]], a: [[-2.3, 0.75, -1.7], [-2.3, 0.73, -1.7]], fov: 52, amp: 0.004 },
  bed1: IN, quiet: FRONT, clockA: IN, clockB: FRONT, towelA: IN, bunnyA: IN, perk: FRONT,
  bunnyB: { p: [[-3.0, 0.46, -0.62], [-3.0, 0.44, -0.7]], a: [[-3.0, 0.27, -1.45], [-3.0, 0.26, -1.45]], fov: 46, amp: 0.003 },
  towelB: { p: [[-3.0, 0.5, -0.2], [-3.0, 0.48, -0.3]], a: [[-3.0, 0.27, -1.45], [-3.0, 0.27, -1.45]], fov: 48, amp: 0.003 },
  pop:    { p: [[-0.3, 1.62, -0.72], [-0.3, 1.58, -0.84]], a: [[-0.3, 0.86, -2.12], [-0.3, 0.86, -2.12]], fov: 50, amp: 0.003 },
  awake:  { p: [[-0.3, 1.6, -0.74], [-0.3, 1.56, -0.86]], a: [[-0.3, 0.86, -2.12], [-0.3, 0.86, -2.12]], fov: 50, amp: 0.003 },
  mia:    { p: [[0.15, 1.35, -1.05], [0.1, 1.3, -1.2]], a: [[-0.3, 0.74, -2.1], [-0.3, 0.74, -2.1]], fov: 46, amp: 0.003 },
  stairs: { p: [[-4.5, 0.25, 2.65], [-4.5, 0.25, 2.6]], a: [[-4.5, 1.7, -0.5], [-4.5, 1.15, 0.3]], fov: 52, amp: 0.004 },
  stayA:  { p: [[-3.24, 0.24, -1.95], [-3.24, 0.24, -1.85]], a: [[-3.14, 0.17, -0.6], [-3.14, 0.17, -0.6]], fov: 54, amp: 0.002 },
  stayB:  { p: [[-3.0, 1.2, 0.42], [-3.0, 1.12, 0.34]], a: [[-3.0, 0.15, -0.52], [-3.0, 0.15, -0.52]], fov: 48, amp: 0.002 },
  lapse:  { p: [[-0.55, 1.25, 1.6], [-0.53, 1.27, 1.3]], a: [[-0.6, 1.6, -2.8], [-0.6, 1.6, -2.8]], fov: 58, amp: 0.002 },
  found:  { p: [[-3.0, 0.3, -1.15], [-3.0, 0.32, -1.0]], a: [[-3.0, 1.25, 0.5], [-3.0, 1.2, 0.5]], fov: 62, amp: 0.003 },
  reveal: { p: [[-2.55, 1.22, -0.72], [-2.6, 1.16, -0.8]], a: [[-3.0, 0.2, -1.32], [-3.0, 0.2, -1.32]], fov: 44, amp: 0.002 },
  dad:    { p: [[-2.55, 1.42, -0.62], [-2.55, 1.42, -0.72]], a: [[-2.55, 1.52, 0.2], [-2.55, 1.52, 0.2]], fov: 46, amp: 0.003 },
  lineup: { p: [[0.4, 0.42, 1.5], [0.4, 0.42, 1.5]], a: [[0.4, 0.25, 0.5], [0.4, 0.25, 0.5]], fov: 38, amp: 0 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (sx<0 forward, sz>0 out, el<0 bends)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const LAP_A = A(-0.55, 0.12, -1.0, 0.5), LAP_B = A(-0.55, 0.12, -1.0, -0.5);                 // hands on the knees / lap
const OFFER_B = A(-1.2, 0.1, -0.35, -0.2);                                                   // holding something out
const WAVE_B = A(-0.3, 1.2, -1.9, -0.2);                                                     // waving hand
const REACH_A = A(-1.35, 0.05, -0.15, 0.2), REACH_B = A(-1.35, 0.05, -0.15, -0.2);           // reaching forward + down
const HEART_A = A(-0.05, 0.2, -2.0, 0.9), HEART_B = A(-0.05, 0.2, -2.0, -0.9);                // hand on chest
const MUG_B = A(-0.75, 0.25, -1.45, -0.45), SIP_B = A(-1.0, 0.18, -2.3, -0.6);
const PHONE_B = A(-1.25, 0.15, -1.6, -0.5);
const CHEEK_A = A(-0.65, 0.05, -2.2, 0.9), CHEEK_B = A(-0.65, 0.05, -2.2, -0.9);       // hands to the cheeks (aww)
const TOWEL_A = A(-1.0, 0.15, -0.9, 0.3), TOWEL_B = A(-1.0, 0.15, -0.9, -0.3);              // holding a towel out with both hands
const PAW_A = A(-1.05, 0.12, -0.1, 0.2), PAW_B = A(-1.05, 0.12, -0.1, -0.2);                // hands on the floor (on all fours)
const CARRY_A = A(0.05, 0.35, -0.5, 0.3);
const CROSS_A = A(-0.6, -0.08, -1.65, 0.85), CROSS_B = A(-0.6, -0.08, -1.65, -0.85);       // arms crossed
const ALL4 = { y: -0.47, footFwd: -0.33, lean: 1.1, headPitch: -0.85 };                      // on hands and knees at the crate door                                                   // pillow under the arm
const TORCH_B = A(-0.6, 0.12, -0.55, -0.2);                                                  // flashlight forward
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const KNEEL = { y: -0.47, footFwd: -0.33, lean: 0.18 };                                      // sitting back on the heels
const seatY = (top) => -0.375 + (top - 0.42);
const pop = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const EV = story.pip;

  // ---------------------------------------------------------------- sets
  const liv = buildLivingRoom(studio, { home: true }); liv.root.position.set(...OFF.liv);
  const bed = buildBedroom(studio, { wallColor: 0xc9b9d6 }); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; bed.setDoor(0); bed.setSeason('autumn', 0);
  const ROOTS = { liv: liv.root, bed: bed.root };
  const FAR = { liv: 40, bed: 40 };
  scene.fog = null;
  const bedWall = bed.root.children.find((o) => o.isMesh && o.material.color && o.material.color.getHex() === 0xc9b9d6)?.material;

  // crate in Pip's corner
  const crate = makeCrate(); crate.g.position.set(CR[0], 0, CR[1]); liv.root.add(crate.g);
  const CF = crate.floorY, DZ = CR[1] + crate.D / 2;

  // "WELCOME HOME PIP" banner Mia made (back wall above the crate)
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.36), new THREE.MeshStandardMaterial({ roughness: 0.9, transparent: true, map: canvasTex(600, 144, (g, w, h) => {
    const cols = ['#e2574c', '#f2c14e', '#58b3a8', '#8f6aa8', '#4f9bd9'];
    'WELCOME HOME PIP'.split('').forEach((ch, i, arr) => { if (ch === ' ') return; const x = 18 + (i / (arr.length - 1)) * (w - 36), y = 40 + Math.sin((i / (arr.length - 1)) * PI) * 26; g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(x - 17, y - 26); g.lineTo(x + 17, y - 26); g.lineTo(x, y + 44); g.closePath(); g.fill(); g.fillStyle = '#fffaf0'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.fillText(ch, x, y + 4); });
    g.strokeStyle = '#7a5a3a'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = (i / 40) * w, y = 14 + Math.sin((i / 40) * PI) * 26; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }) }));
  banner.position.set(-3.1, 2.28, LV.room.z0 + 0.03); liv.root.add(banner);

  // ---------------------------------------------------------------- Pip + props
  const pip = makePip({ size: PIPS }); liv.root.add(pip.g);
  const bunny = makeBunny(); bunny.scale.setScalar(1.25); liv.root.add(bunny);
  // twin-bell alarm clock (the "ticking clock") wrapped in a towel
  const clock = new THREE.Group(); liv.root.add(clock);
  const clockBody = new THREE.Group(); clock.add(clockBody);
  mk(new THREE.CylinderGeometry(0.055, 0.055, 0.045, 24), mat(0xd2483f, 0.45), clockBody, 0, 0.07, 0).rotation.x = PI / 2;
  const cf = new THREE.Mesh(new THREE.CircleGeometry(0.047, 24), new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(128, 128, (g) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#333'; for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; g.beginPath(); g.arc(64 + Math.sin(a) * 50, 64 - Math.cos(a) * 50, i % 3 ? 2.5 : 5, 0, 7); g.fill(); } g.strokeStyle = '#333'; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 30); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(64, 64); g.lineTo(92, 64); g.stroke(); }) }));
  cf.position.set(0, 0.07, 0.0235); clockBody.add(cf);
  const bells = [-1, 1].map((s) => { const b = mk(new THREE.SphereGeometry(0.03, 16, 10, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8c27a, metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide }), clockBody, s * 0.035, 0.118, -0.005); b.rotation.z = -s * 0.5; return b; });
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.006, 0.004, 0.035, 6), mat(0x333333, 0.4), clockBody, s * 0.035, 0.018, 0).rotation.z = s * 0.35;
  const towelTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2e3c8'; g.fillRect(0, 0, w, h); for (const [y, c] of [[30, '#e2574c'], [46, '#58b3a8'], [210, '#58b3a8'], [226, '#e2574c']]) { g.fillStyle = c; g.fillRect(0, y, w, 9); } g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 400; i++) g.fillRect((i * 37) % w, (i * 91) % h, 2, 2); });
  const towelM = new THREE.MeshStandardMaterial({ map: towelTex, roughness: 1, side: THREE.DoubleSide });
  const wrap = mk(new THREE.SphereGeometry(0.1, 20, 14, 0, PI * 2, 0, PI * 0.62), towelM, clock, 0, 0.0, 0); wrap.scale.set(1.15, 1.05, 1.0);
  // the warm towel: held as a sagging cloth, then a drape over Pip (the "ghost")
  const clothGeo = new THREE.PlaneGeometry(0.62, 0.42, 16, 10); { const p = clothGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.05 * Math.cos((x / 0.31) * PI * 0.5) * (0.5 - y / 0.42)); } clothGeo.computeVertexNormals(); }
  const cloth = mk(clothGeo, towelM, liv.root);
  const ghost = new THREE.Group(); liv.root.add(ghost);
  const gBody = mk(new THREE.SphereGeometry(1, 28, 18, 0, PI * 2, 0, PI * 0.62), towelM, ghost);
  const gHead = mk(new THREE.SphereGeometry(1, 24, 16), towelM, ghost);
  const gEars = [-1, 1].map((s) => { const c = mk(new THREE.ConeGeometry(0.045, 0.1, 12), towelM, ghost); c.userData.s = s; return c; });
  const gHem = mk(new THREE.TorusGeometry(1, 0.012, 6, 40), towelM, ghost); gHem.rotation.x = PI / 2;
  // steam wisps (warm towel) + soft sprites
  const puffTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const steam = Array.from({ length: 10 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); s.userData.k = i; liv.root.add(s); return s; });
  const flash = makeFlashlight({ length: 2.6, radius: 0.55, color: 0xffe2b0 }); liv.root.add(flash.g); flash.spot.distance = 7; flash.spot.angle = 0.42; flash.spot.penumbra = 0.7;
  const torchSweep = new THREE.SpotLight(0xffd9a0, 0, 4, 0.35, 0.7, 1.5); liv.root.add(torchSweep, torchSweep.target);
  const mug = makeMug(0xf2c14e); liv.root.add(mug);
  const phone = makePhone(); liv.root.add(phone.g);
  const miaPillow = mk(new THREE.CapsuleGeometry(0.11, 0.26, 6, 12), new THREE.MeshStandardMaterial({ map: quiltTexture('#f6d6e2', '#fff4f8'), roughness: 0.95 }), liv.root); miaPillow.rotation.z = PI / 2; miaPillow.scale.set(1, 1, 0.45);
  const miaQuiltTex = quiltTexture('#b9a3e3', '#f2c14e');
  // Mia's blanket on the floor (3 AM) and in the crate (morning): a soft quilt mound
  const quiltM = new THREE.MeshStandardMaterial({ map: miaQuiltTex, roughness: 1 });
  const floorQuilt = new THREE.Group(); liv.root.add(floorQuilt);
  { const a = mk(new THREE.SphereGeometry(1, 24, 14, 0, PI * 2, 0, PI / 2), quiltM, floorQuilt); a.scale.set(0.52, 0.16, 0.24); a.position.set(-0.18, 0, 0); const b = mk(new THREE.SphereGeometry(1, 20, 12, 0, PI * 2, 0, PI / 2), quiltM, floorQuilt); b.scale.set(0.3, 0.13, 0.2); b.position.set(-0.62, 0, 0.03); }

  // ---------------------------------------------------------------- the family
  const mia = makeMia(), mom = makeMom(), dad = makeDad();
  [mia, mom, dad].forEach((P) => liv.root.add(P.root));
  // Dad's tired eyes for the button
  const bags = [-1, 1].map((s) => { const b = mk(new THREE.SphereGeometry(0.03, 12, 8), mat(0x8a6a7a, 0.8), dad.head.g, s * 0.047, -0.025, 0.118); b.scale.set(1.25, 0.45, 0.4); b.visible = false; return b; });
  // lying Mia (3 AM by the crate, morning inside it): a second rig in a carrier group, posed on her side
  const miaL = makeMia(); const carrier = new THREE.Group(); liv.root.add(carrier); carrier.add(miaL.root);
  // sleepers in the big bed (parents) + Mia in her own bed
  const dadS = makeSleeper({ r: 0.135, skin: 0xd9a27c, hair: 0x5a3a24, hairStyle: 'messy' });
  const momS = makeSleeper({ r: 0.135, skin: 0xe9b896, hair: 0x8a3f22, hairStyle: 'bob' });
  const miaS = makeSleeper({ r: 0.15, skin: 0xf0c4a2, hair: 0x4a2c1a, hairStyle: 'bob' });
  for (const s of [-1, 1]) { const pt = mk(new THREE.SphereGeometry(0.053, 12, 10), miaS.head.hairMat, miaS.head.g, s * 0.165, 0.02, -0.05); pt.scale.set(0.8, 1.15, 0.8); }
  [dadS, momS, miaS].forEach((S) => bed.root.add(S.g));
  const duvetM = new THREE.MeshStandardMaterial({ map: quiltTexture('#8fa8c8', '#dfe6f0'), roughness: 1 });
  const duvet = new THREE.Group(); bed.root.add(duvet);
  { const d = mk(RoundedBoxGeometryLite(1.62, 0.14, 1.55), duvetM, duvet); d.position.set(0, 0.07, 0); for (const x of [-0.3, 0.3]) { const b = mk(new THREE.SphereGeometry(1, 18, 10, 0, PI * 2, 0, PI / 2), duvetM, duvet); b.scale.set(0.22, 0.07, 0.55); b.position.set(x, 0.12, 0.15); } }
  const miaQuilt = new THREE.Group(); bed.root.add(miaQuilt);
  { const d = mk(RoundedBoxGeometryLite(0.96, 0.1, 1.4), new THREE.MeshStandardMaterial({ map: miaQuiltTex, roughness: 1 }), miaQuilt); d.position.set(0, 0.05, 0); const b = mk(new THREE.SphereGeometry(1, 18, 10, 0, PI * 2, 0, PI / 2), d.material, miaQuilt); b.scale.set(0.2, 0.1, 0.55); b.position.set(0, 0.09, 0.05); }
  const dadPillow = mk(new THREE.CapsuleGeometry(0.12, 0.3, 6, 12), mat(0xf4f1ea, 0.95), bed.root); dadPillow.rotation.z = PI / 2; dadPillow.scale.set(1, 1, 0.5);
  // bedside digital clock
  const dClockTex = canvasTex(160, 64, (g, w, h) => { g.fillStyle = '#120c0a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff7a4a'; g.font = 'bold 44px Helvetica'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2:58', w / 2, h / 2 + 2); });
  const dClock = new THREE.Group(); bed.root.add(dClock);
  mk(RoundedBoxGeometryLite(0.17, 0.08, 0.07), mat(0x2a2422, 0.5), dClock);
  const dFace = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.06), new THREE.MeshBasicMaterial({ map: dClockTex, toneMapped: false })); dFace.position.z = 0.036; dClock.add(dFace);
  dClock.position.set(BD.nightstand.x + 0.1, BD.nightstand.h + 0.04, BD.nightstand.z + 0.06); dClock.rotation.y = 0.5;
  const clockGlow = new THREE.PointLight(0xff8a50, 0, 1.2, 2); clockGlow.position.set(BD.nightstand.x + 0.15, BD.nightstand.h + 0.15, BD.nightstand.z + 0.25); bed.root.add(clockGlow);

  const putP = (P, p, rootY) => (P.kid ? poseScaled(P, p, rootY) : (applyPose(P, p), rootY !== undefined && (P.root.position.y = rootY + (p.y || 0))));

  // ---------------------------------------------------------------- per-beat posing
  const wh = (t) => pulseAt(t, EV.whimpers, 0.42);
  const howlK = (t) => clamp(Math.max(0, Math.min((t - EV.howl[0]) / 0.25, (EV.howl[1] - t) / 0.35)));
  const placePip = (x, z, y, rotY) => { pip.g.position.set(x, y, z); pip.g.rotation.y = rotY; };
  const pipHead = () => { pip.H.updateMatrixWorld(true); return pip.H.getWorldPosition(new THREE.Vector3()); };
  const inCrate = (t, st, x = CR[0], z = -1.45) => { placePip(x, z, CF, 0); pip.update(t, st); };
  const sideLie = (P, center, up, face, curl = 0.2) => {   // a rig lying on its side: local +y → `up`, local +z (face) → `face`
    const x = new THREE.Vector3().crossVectors(up, face).normalize();
    carrier.position.copy(center); carrier.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up.clone().normalize(), face.clone().normalize()));
    const p = basePose(); Object.assign(p, { x: 0, z: 0, y: 0, crouch: 0.28 * curl / 0.2, footFwd: 0.35 * curl / 0.2, lean: 0.25, headPitch: -0.1, smile: 1 });
    return p;
  };

  function lights(mode) {
    // mode: 'eve' (all lamps on), 'night' (moon + nightlight), 'hall' (night + hall light on), 'dawn' k
    const L = liv.lights;
    if (mode === 'eve') { liv.setDawn(0); L.hemi.intensity = 0.85; L.lampL.intensity = 2.6; L.pend.intensity = 1.8; L.fillL.intensity = 1.6; L.fillD.intensity = 1.2; liv.setConsole(1); liv.setNightlight(0.6); liv.setUpstairs(0.4); }
    else if (mode === 'night' || mode === 'hall') { liv.setDawn(0); L.hemi.intensity = 0.6; L.sun.intensity = 0.55; L.lampL.intensity = 0.0; L.pend.intensity = mode === 'hall' ? 1.5 : 0; L.fillL.intensity = 0.55; L.fillD.intensity = 0.5; liv.setConsole(0); liv.setNightlight(1); liv.setUpstairs(mode === 'hall' ? 1 : 0); }
    else { liv.setDawn(mode); liv.setConsole(0); liv.setNightlight(1 - mode); liv.setUpstairs(0); }
  }

  // ---------------------------------------------------------------- update
  let cur = null;
  function update(t) {
    const shot = t >= 200 ? { cam: 'lineup', set: 'liv', t0: 200, t1: 300 } : shotAt(t), Sx = shot.set, cam = shot.cam;
    if (Sx !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === Sx; cur = Sx; }
    studio.camera.far = FAR[Sx]; studio.camera.near = 0.03; studio.fill.intensity = story.look.fill;

    const c = CAMS[cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[Sx];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    const jolt = (m, k0 = 0.02) => { if (t > m && t < m + 0.5) { const k = k0 * Math.exp(-(t - m) * 8); P = [P[0] + k * Math.sin(t * 70), P[1] + k * Math.sin(t * 55), P[2]]; } };
    jolt(EV.ring[0], 0.012); jolt(EV.bonk, 0.015);
    setCamera(P, Aim, c.fov, t, c.amp); studio.camera.updateMatrixWorld();

    // reset
    [mia, mom, dad, miaL].forEach((R) => (R.root.visible = false)); mom.dress.visible = true;
    [bunny, clock, cloth, ghost, flash.g, mug, phone.g, miaPillow, floorQuilt].forEach((g) => (g.visible = false));
    floorQuilt.rotation.set(0, 0, 0); floorQuilt.scale.set(1, 1, 1); miaPillow.scale.set(1, 1, 0.45); clock.scale.setScalar(1);
    steam.forEach((s) => (s.visible = false)); bags.forEach((b) => (b.visible = false));
    torchSweep.intensity = 0; flash.setOn(0);
    pip.g.visible = true; crate.g.visible = true; banner.visible = true;
    Object.values(crate.panels).forEach((p) => (p.visible = true)); crate.setDoor(0);
    if (bunny.parent !== liv.root) liv.root.add(bunny);
    bunny.scale.setScalar(1.25); bunny.rotation.set(0, 0, 0);

    if (CAMS[cam] === IN || cam === 'found' || cam === 'stayA' || cam === 'reveal') crate.panels.top.visible = false;
    if (cam === 'lineup') return lineup(t);
    BEATS[cam](t, u);
  }

  // ---------------------------------------------------------------- beats
  const BEATS = {
    thumb(t) {
      lights('night'); crate.panels.door.visible = false;
      inCrate(t, { sit: 1, headPitch: -0.28, sad: 0.55, ears: 0.55, tilt: K(t, [[0, 0.0], [1.2, 0.22], [2.2, 0.22], [3.0, -0.1]]), wag: 0.1, whimper: wh(t), lookY: 0.6 });
    },
    home(t) {
      lights('eve');
      // Mia on the rug holding the bunny out; Pip does zoomies, pounces, grabs it and tugs
      const p = basePose(); Object.assign(p, { x: -1.6, z: -0.5, rotY: 0.5, y: -0.22, footFwd: 0.42, lean: 0.12, armA: LAP_A, headPitch: 0.25, eyes: blink(t, 2) });
      const grab = 7.35, laugh = t > grab ? 1 : 0;
      p.armB = mixArm(OFFER_B, A(-0.9, 0.2, -0.6, -0.3), smooth((t - grab) / 0.3));
      p.mouth = laugh && t < 8.6 ? 'o' : 'smile'; p.headRoll = 0.12 * laugh * Math.sin(t * 9) * (t < 8.6 ? 1 : 0);
      mia.root.visible = true; putP(mia, p);
      // parents on the couch / armchair
      const pd = basePose(); Object.assign(pd, { x: -1.3, z: -1.3, rotY: 0.2, crouch: 0.38, lean: 0.35, armA: LAP_A, armB: LAP_B, headPitch: 0.35, headYaw: -0.2, glasses: true, eyes: blink(t, 4) }); dad.root.visible = true; putP(dad, pd);
      const pm = basePose(); Object.assign(pm, { x: -2.35, z: -0.9, rotY: 0.75, y: -0.22, footFwd: 0.42, lean: 0.1, armA: LAP_A, armB: HEART_B, headPitch: 0.28, headYaw: 0.25, eyes: blink(t, 6) }); mom.root.visible = true; putP(mom, pm); mom.dress.visible = false;
      // the bunny in Mia's hand, then in Pip's mouth
      mia.root.updateMatrixWorld(true);
      // zoomies: two laps round the rug, then a pounce
      const C0 = [-1.14, 0.37], r = 0.27;
      if (t < 6.7) {
        const a = (t - 3.4) * 4.1 + 0.6, x = C0[0] + Math.cos(a) * r, z = C0[1] + Math.sin(a) * r * 0.8;
        placePip(x, z, 0, Math.atan2(-Math.sin(a) * r, Math.cos(a) * r * 0.8));   // tangent of the loop
        pip.update(t, { run: 1, dist: (t - 3.4) * 1.7, wag: 1, wagRate: 5, ears: 1, mouth: 'pant' });
      } else {
        const hp = handWorld(mia, 1);
        const sx = C0[0] + Math.cos((6.7 - 3.4) * 4.1 + 0.6) * r, sz = C0[1] + Math.sin((6.7 - 3.4) * 4.1 + 0.6) * r * 0.8;
        const k = smooth((t - 6.7) / 0.6), tx = hp.x + 0.0, tz = hp.z + 0.32;
        const back = smooth((t - 7.6) / 1.2) * 0.12;
        placePip(lerp(sx, tx, k), lerp(sz, tz, k) + back, 0, faceToward(sx, sz, hp.x, hp.z));
        pip.update(t, { walk: t < 7.3 ? 1 : 0.4 * Math.abs(Math.sin(t * 6)), dist: t * 0.6, hop: 0.07 * Math.sin(clamp((t - 7.0) / 0.35) * PI), wag: 1, wagRate: 5.5, ears: 1, lean: t > 7.5 ? -0.12 : 0, headPitch: t > 7.5 ? -0.1 : 0, mouth: t > 7.3 ? 'open' : 'pant', open: t > 7.3 ? 0.18 : undefined });
      }
      if (t < grab) { const hp = handWorld(mia, 1); bunny.position.copy(hp).add(new THREE.Vector3(0, -0.12, 0.03)); bunny.rotation.set(0, 0.6, 0.12 * Math.sin(t * 5)); bunny.visible = true; }
      else { pip.anchors.mouth.add(bunny); bunny.position.set(0, -0.05, 0.03); bunny.rotation.set(-1.2, 0, 0.3 * Math.sin(t * 8)); bunny.scale.setScalar(1.25 / PIPS); bunny.visible = true; }
    },
    bed1(t) {
      lights(t < 11.3 ? 'eve' : 'night');
      const L = liv.lights; if (t >= 11.3) { const k = smooth((t - 11.3) / 0.15); L.lampL.intensity = 0; } // lamp click
      crate.setDoor(K(t, [[9.4, 1.5], [10.4, 1.5], [11.0, 0]]));
      inCrate(t, { lie: 1, headPitch: -0.25, ears: t < 11.6 ? 0.95 : 0.45, wag: t < 11.0 ? 0.6 : 0.1, headYaw: t > 11.6 ? -0.4 * smooth((t - 11.6) / 0.5) : 0 }, CR[0] - 0.05, -1.62);
      // Mia kneels at the door, waves, shuts it, stands and pads off to the stairs
      const stand = smooth((t - 11.05) / 0.45);
      const p = basePose(); Object.assign(p, { x: CR[0] + 0.02, z: DZ + 0.42, rotY: PI, eyes: blink(t, 2), smile: 1 });
      Object.assign(p, { y: lerp(KNEEL.y, 0, stand), footFwd: lerp(KNEEL.footFwd, 0, stand), lean: lerp(KNEEL.lean, 0.03, stand) });
      p.armB = t < 10.4 ? mixArm(WAVE_B, A(-0.3, 1.2, -1.6, -0.2), 0.5 + 0.5 * Math.sin(t * 9)) : mixArm(REACH_B, REST, smooth((t - 11.0) / 0.4));
      p.armA = REST;
      if (t > 11.6) { const w = walkLegs(t, [p.x, p.z], [{ t0: 11.6, t1: 13.2, pts: [[CR[0] - 0.6, DZ + 0.55], [-4.2, DZ + 0.9]] }]); Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed }); if (w.head !== null) p.rotY = w.head; }
      mia.root.visible = true; putP(mia, p);
    },
    quiet(t) {
      lights('night'); crate.panels.door.visible = false;
      const look = K(t, [[12.4, 0], [12.7, 0.5], [13.1, 0.5], [13.35, -0.5], [13.65, -0.5], [13.8, 0]]);
      inCrate(t, { sit: 1, headYaw: look, ears: K(t, [[12.4, 0.8], [13.3, 0.35]]), sad: K(t, [[12.4, 0.2], [13.4, 0.8]]), whimper: wh(t), howl: howlK(t), tailDown: 0.6 });
    },
    pop(t) { bedShot(t, 'parents', { open: t > 15.45, look: t > 16.25 ? smooth((t - 16.25) / 0.3) : 0 }); },
    clockA(t) {
      lights('hall'); crate.setDoor(1.5);
      inCrate(t, { lie: 1, headPitch: -0.2, tilt: K(t, [[17.2, 0], [18.4, 0.3], [19.2, 0.3], [19.6, -0.1]]), ears: 0.75, sad: 0.4, whimper: wh(t), wag: 0.15 }, CR[0] - 0.05, -1.62);
      const p = basePose(); Object.assign(p, { x: CR[0] - 0.08, z: DZ + 0.78, rotY: PI, ...ALL4, glasses: true, eyes: blink(t, 4), smile: 1 });
      const reach = smooth((t - 17.6) / 0.8) * (1 - smooth((t - 19.2) / 0.5));
      p.armB = mixArm(PAW_B, REACH_B, reach); p.armA = PAW_A;
      dad.root.visible = true; putP(dad, p);
      clock.visible = true;
      if (t < 19.0) { const hp = handWorld(dad, 1); clock.position.copy(hp).add(new THREE.Vector3(0, -0.08, 0)); clock.rotation.set(0, PI, 0); }
      else { clock.position.set(CR[0] + 0.05, CF, -1.3); clock.rotation.set(0, PI, 0); }
    },
    clockB(t) {
      lights('hall'); crate.panels.door.visible = false; crate.setDoor(0);
      const R0 = EV.ring[0], ringing = t > R0 && t < EV.ring[1];
      const leap = t > R0 ? Math.sin(clamp((t - R0 - 0.05) / 0.42) * PI) : 0, back = smooth((t - R0) / 0.45) * 0.15;
      const snug = smooth((t - 20.3) / 0.8) * (1 - smooth((t - R0) / 0.12));
      const st = t < R0
        ? { lie: smooth((t - 19.9) / 0.5), headPitch: 0.15 + 0.1 * snug, sniff: t < 20.6 ? 1 : 0, eyes: 'open', lids: 0.1 + 0.75 * snug, wag: 0.3 * (1 - snug) + 0.08, ears: 0.6 - 0.2 * snug, sad: 0.2 * (1 - snug), tilt: 0.15 * snug }
        : { sit: t > R0 + 0.45 ? 1 : 0, hop: 0.17 * leap, eyes: 'wide', ears: 1, earsBack: 0, headPitch: -0.05, lean: -0.15 * leap, mouth: 'o', open: 0.2 * leap, tilt: t > R0 + 0.9 ? 0.32 : 0, wag: 0 };
      inCrate(t, st, CR[0], -1.55 - back);
      clock.visible = true;
      const sh = ringing ? 1 : 0;
      clock.scale.setScalar(0.85);
      clock.position.set(CR[0] + 0.13 + sh * 0.012 * Math.sin(t * 61), CF + sh * Math.abs(0.02 * Math.sin(t * 37)), -1.26 + sh * 0.01 * Math.sin(t * 47));
      clock.rotation.set(0, PI + sh * 0.25 * Math.sin(t * 29), sh * 0.12 * Math.sin(t * 53));
      // the towel slips off when it rings
      const slip = smooth((t - R0 - 0.05) / 0.35);
      wrap.position.set(-0.13 * slip, 0.02 * slip, 0.05 * slip); wrap.rotation.set(0.3 * slip, 0, 1.25 * slip); wrap.scale.set(1.15, 1.05 - 0.55 * slip, 1.0);
      bells.forEach((b, i) => (b.rotation.x = sh * 0.3 * Math.sin(t * 90 + i * 2)));
    },
    towelA(t) {
      lights('hall'); crate.setDoor(1.5);
      inCrate(t, { lie: 1, headPitch: -0.25, ears: 0.6, sad: 0.5, whimper: wh(t), wag: 0.1 }, CR[0] - 0.05, -1.62);
      const p = basePose(); Object.assign(p, { x: CR[0] - 0.08, z: DZ + 0.62, rotY: PI, ...KNEEL, lean: 0.35, eyes: blink(t, 6), smile: 1, headPitch: 0.1 });
      const fwd = smooth((t - 25.2) / 0.7);
      p.armA = mixArm(TOWEL_A, REACH_A, fwd); p.armB = mixArm(TOWEL_B, REACH_B, fwd); p.lean = 0.35 + 0.45 * fwd; p.headPitch = 0.1 - 0.4 * fwd;
      mom.root.visible = true; putP(mom, p);
      const ha = handWorld(mom, -1), hb = handWorld(mom, 1), mid = ha.clone().add(hb).multiplyScalar(0.5);
      const land = smooth((t - 25.95) / 0.3);
      if (land < 1) { cloth.visible = true; cloth.position.copy(mid).add(new THREE.Vector3(0, -0.18, 0)); cloth.rotation.set(-0.15 - 1.2 * fwd, PI, 0); }
      if (t > 25.95) drapeGhost(t, land, 'sit');
      steamAt(t, cloth.visible ? cloth.position : pipHead(), 1);
    },
    towelB(t) {
      lights('hall');
      const rise = smooth((t - 28.45) / 0.25), walkK = clamp((t - 28.6) / 0.62), bonk = t > EV.bonk ? 1 : 0;
      const z = -1.5 + 0.3 * smooth(walkK) - 0.08 * smooth((t - EV.bonk) / 0.3) * bonk;
      const st = t < 28.45 ? { lie: 1, sleep: 0.6 } : t < EV.bonk ? { walk: 1, dist: (t - 28.6) * 0.5 } : { sit: smooth((t - EV.bonk - 0.1) / 0.3), lean: 0.2 * Math.exp(-(t - EV.bonk) * 6), whimper: wh(t) };
      inCrate(t, st, CR[0], z);
      pip.g.visible = false;                         // he's under the towel the whole shot
      crate.setDoor(t > EV.bonk ? 0.03 * Math.exp(-(t - EV.bonk) * 5) * Math.sin((t - EV.bonk) * 40) : 0);
      drapeGhost(t, 1, t < 28.45 ? 'lie' : 'stand', t > EV.bonk ? Math.exp(-(t - EV.bonk) * 7) : 0);
      if (t < 28.45) { ghost.position.y = 0.006 * Math.sin(t * 3.4); gEars.forEach((c, i) => (c.rotation.z += 0.12 * Math.sin(t * 2.3 + i))); }
      steamAt(t, pipHead(), clamp(1 - (t - 26.6) / 3));
    },
    bunnyA(t) {
      lights('hall'); crate.setDoor(1.5);
      inCrate(t, { lie: 1, headPitch: -0.2, ears: K(t, [[30.4, 0.5], [31.8, 0.9]]), sad: 0.5, whimper: wh(t), wag: K(t, [[30.4, 0.05], [31.8, 0.5]]), tilt: K(t, [[31.2, 0], [31.7, 0.3]]) }, CR[0] - 0.05, -1.62);
      const p = basePose(); Object.assign(p, { x: CR[0] - 0.08, z: DZ + 0.78, rotY: PI, ...ALL4, eyes: blink(t, 6), smile: 1 });
      const reach = smooth((t - 30.8) / 0.7) * (1 - smooth((t - 32.0) / 0.5));
      p.armB = mixArm(PAW_B, REACH_B, reach); p.armA = PAW_A;
      mom.root.visible = true; putP(mom, p);
      bunny.visible = true;
      if (t < 31.6) { const hp = handWorld(mom, 1); bunny.position.copy(hp).add(new THREE.Vector3(0, -0.12, 0)); bunny.rotation.set(0, PI, 0); }
      else { bunny.position.set(CR[0], CF, -1.3); bunny.rotation.set(0, PI, 0); }
    },
    bunnyB(t) {
      lights('hall'); crate.panels.door.visible = false;
      const roll = K(t, [[34.55, 0], [35.15, 1.45]]), rk = clamp(roll / 1.45);
      const sob = pulseAt(t, EV.squeaks, 0.32);
      inCrate(t, { lie: 1, roll, whimper: wh(t), headPitch: roll > 1 ? -0.1 : -0.05, ears: 0.4, sad: 0.8, wag: 0.05 }, CR[0], -1.5);
      pip.R.add(bunny); bunny.visible = true;
      bunny.position.set(lerp(0.1, 0.0, rk), lerp(0.04, -0.06, rk), lerp(0.27, 0.12, rk)); bunny.rotation.set(lerp(-0.2, -1.2, rk), lerp(-0.5, 0, rk), 0); bunny.scale.set(1.25 / PIPS, (1.25 / PIPS) * (1 - 0.22 * sob), (1.25 / PIPS) * (1 + 0.1 * sob));
    },
    awake(t) { bedShot(t, 'awake', {}); },
    mia(t) { bedShot(t, 'mia', {}); },
    stairs(t) {
      lights('night'); liv.setUpstairs(0);
      // Mia comes down the stairs (y follows each step), flashlight forward, pillow under her arm
      const w = walkLegs(t, [-4.52, -1.0], [{ t0: 41.0, t1: 44.2, pts: [[-4.52, 1.15]] }]);
      const sy = stepY(w.z);
      const p = basePose(); Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: 0, armA: CARRY_A, armB: TORCH_B, headPitch: 0.35, eyes: blink(t, 2), smile: 0.8 });
      mia.root.visible = true; putP(mia, p, sy);
      const hp = handWorld(mia, 1); flash.g.visible = true; flash.aim(hp.clone().add(new THREE.Vector3(0, 0.02, 0.04)), new THREE.Vector3(w.x + 0.1, Math.max(0, sy - 0.6), w.z + 1.4)); flash.setOn(1, 0.18);
      miaPillow.visible = true; const ha = handWorld(mia, -1); miaPillow.position.copy(ha).add(new THREE.Vector3(-0.07, -0.02, -0.04)); miaPillow.rotation.set(0, 0.2, 0.15);
      pip.g.visible = false;
    },
    perk(t) {
      lights('night'); crate.panels.door.visible = false;
      const perk = smooth((t - 45.25) / 0.3);
      inCrate(t, { sit: 1 - smooth((t - 46.3) / 0.4), whimper: t < 45.2 ? wh(t) : 0, ears: lerp(0.35, 1, perk), sad: 0.8 * (1 - perk), eyes: perk > 0.5 ? 'wide' : 'open', headYaw: -0.5 * perk, tilt: 0.35 * smooth((t - 45.6) / 0.3), wag: smooth((t - 45.9) / 0.3), wagRate: 5, lookX: -1 * perk, walk: t > 46.4 ? 0.8 : 0, dist: (t - 46.4) * 0.5 }, CR[0], -1.45 + 0.12 * smooth((t - 46.4) / 0.6));
      // the flashlight beam sweeps over him from the stairs side
      torchSweep.intensity = 6 * smooth((t - 45.0) / 0.4);
      torchSweep.position.set(-4.2, 0.9, 0.6); torchSweep.target.position.set(lerp(-3.6, -3.0, smooth((t - 45.0) / 1.2)), 0.35, -1.4);
    },
    stayA(t) {
      lights('night'); crate.setDoor(1.55);
      // Mia lies on her tummy at the open door, chin on her pillow, one hand inside; Pip licks her fingers
      const p = sideLie(miaL, new THREE.Vector3(CR[0] - 0.12, 0.095, 0.27), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0), 0);
      Object.assign(p, { crouch: 0, footFwd: 0, lean: 0, headPitch: -1.42, eyes: blink(t, 3), mouth: t > 48.5 ? 'smile' : 'smile', armB: A(-2.95, 0.12, -0.1, -0.2), armA: A(-2.5, 0.35, -1.7, 0.6) });
      p.headRoll = 0.08 * Math.sin(t * 2);
      miaL.root.visible = true; poseScaled(miaL, p);
      miaPillow.visible = true; miaPillow.position.set(CR[0] - 0.12, 0.05, -0.78); miaPillow.rotation.set(0, 0, PI / 2); miaPillow.scale.set(1.1, 1, 0.45);
      const hb = handWorld(miaL, 1);
      const lick = pulseAt(t, EV.lick.slice(0, 2), 0.3);
      const px = CR[0] + 0.17, pz = -1.42 + 0.1 * smooth((t - 47.3) / 0.6);
      placePip(px, pz, CF, faceToward(px, pz, hb.x, hb.z));
      pip.update(t, { lie: 1, headPitch: 0.05 + 0.15 * lick, lick, wag: 1, wagRate: 5.5, ears: 1, eyes: lick > 0.3 ? 'happy' : 'open' });
      flash.g.visible = true; flash.aim(new THREE.Vector3(CR[0] + 0.45, 0.03, -0.55), new THREE.Vector3(CR[0] + 1.2, 0.03, 0.1)); flash.setOn(0.6, 0.06);
    },
    stayB(t) {
      lights('night'); crate.setDoor(1.55);
      // later: she's asleep on her back by the crate, Pip asleep on her tummy
      const p = sideLie(miaL, new THREE.Vector3(CR[0], 0.1, 0.3), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), 0);
      Object.assign(p, { crouch: 0, footFwd: 0, lean: 0, headPitch: -0.15, eyes: 'closed', smile: 1, headRoll: 0.25, armA: A(-0.75, 0.05, -1.75, 0.9), armB: A(0.1, 0.5, -0.3, 0) });
      miaL.root.visible = true; poseScaled(miaL, p);
      miaPillow.visible = true; miaPillow.position.set(CR[0], 0.05, -0.86); miaPillow.rotation.set(0, 0, PI / 2); miaPillow.scale.set(1.1, 1, 0.45);
      floorQuilt.visible = true; floorQuilt.position.set(CR[0], 0.04, 0.12); floorQuilt.rotation.y = PI / 2; floorQuilt.scale.set(0.75, 1, 1.2);
      placePip(CR[0] + 0.03, -0.12, 0.16, 0.12);
      pip.update(t, { lie: 1, sleep: 1, ears: 0.5, headYaw: 0.5, tilt: 0.35, wag: 0.15, wagRate: 1.2 });
      flash.g.visible = true; flash.aim(new THREE.Vector3(CR[0] + 0.42, 0.03, -0.45), new THREE.Vector3(CR[0] + 0.5, 1.5, -0.6)); flash.setOn(0.5, 0.05);
    },
    lapse(t) {
      const k = smooth((t - 51.1) / 2.1);
      lights(k);
      const mins = 3 * 60 + 4 + (7 * 60 - (3 * 60 + 4)) * k;
      liv.setClock(Math.floor(mins / 60), mins % 60);
      pip.g.visible = false;
    },
    found(t) {
      lights(1); crate.setDoor(1.55);
      pip.g.visible = false;
      for (const [P, x, z, seed] of [[mom, CR[0] - 0.25, 0.25, 6], [dad, CR[0] + 0.25, 0.3, 4]]) {
        const p = basePose(); Object.assign(p, { x, z, rotY: PI + (P === mom ? 0.15 : -0.15), crouch: 0.42, lean: 0.42, headPitch: 0.45, eyes: blink(t, seed), smile: 1, glasses: P === dad });
        if (P === mom) { const ph = smooth((t - 54.9) / 0.4); p.armA = mixArm(CHEEK_A, HEART_A, smooth((t - 54.4) / 0.4)); p.armB = mixArm(mixArm(CHEEK_B, HEART_B, smooth((t - 54.4) / 0.4)), PHONE_B, ph); p.headRoll = 0.18 * Math.sin(t * 1.7); }
        else { p.armB = t > 54.0 && t < 55.0 ? SIP_B : MUG_B; p.armA = LAP_A; p.headRoll = -0.1 - 0.12 * smooth((t - 55.2) / 0.5); }
        p.lean = 0.42 + 0.08 * smooth((t - 53.6) / 1.2);
        P.root.visible = true; putP(P, p);
      }
      mug.visible = true; const hm = handWorld(dad, 1); mug.position.copy(hm).add(new THREE.Vector3(0, -0.05, 0)); mug.rotation.y = 0.4;
      if (t > 54.9) { phone.g.visible = true; const hp = handWorld(mom, 1); phone.g.position.copy(hp); phone.g.rotation.set(-1.2, PI, 0); phone.screenMat.emissiveIntensity = 0.6; }
    },
    reveal(t) {
      lights(1); crate.setDoor(1.55);
      // both asleep inside the crate: Mia curled on her side (head toward the door, facing +x), Pip curled at her chest
      const p = sideLie(miaL, new THREE.Vector3(CR[0] - 0.14, CF + 0.12, -1.98), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0.8, 0.6, 0).normalize(), 0.42);
      const awake = t > 58.95;
      p.eyes = awake ? blink(t, 3) : 'closed'; p.smile = 1; p.mouth = awake && t < 59.4 ? 'o' : 'smile';
      p.armA = A(-1.1, 0.05, -0.9, 0.4); p.armB = A(-1.3, 0.1, -0.5, -0.3);
      miaL.root.visible = true; poseScaled(miaL, p);
      floorQuilt.visible = true; floorQuilt.position.set(CR[0] - 0.05, CF, -1.62); floorQuilt.rotation.y = PI / 2; floorQuilt.scale.set(0.78, 1, 0.9);
      const wake = EV.wake, up = smooth((t - wake) / 0.4);
      const lick = pulseAt(t, EV.lick.slice(1), 0.3);
      placePip(CR[0] + 0.15, -1.2, CF + 0.02, 0.75 - 0.25 * up);
      pip.update(t, { lie: 1, sleep: 1 - up, mouth: t > wake && t < wake + 0.6 ? 'open' : 'smile', open: t > wake && t < wake + 0.6 ? 0.55 * Math.sin(((t - wake) / 0.6) * PI) : undefined, eyes: t > wake + 0.6 ? 'open' : t > wake ? 'closed' : undefined, lick, headYaw: -0.7 * smooth((t - 58.0) / 0.3), headPitch: -0.15 * up, wag: up, wagRate: 6, ears: 0.6 + 0.4 * up });
      bunny.visible = true; bunny.position.set(CR[0] + 0.24, CF, -1.1); bunny.rotation.set(0, -0.8, 1.35);
    },
    dad(t) {
      lights(1); crate.setDoor(1.55);
      const p = basePose(); Object.assign(p, { x: -2.55, z: 0.2, rotY: PI, glasses: true, headRoll: 0.12, headPitch: 0.12, smile: 0, mouth: t > 60.85 && t < 61.9 ? 'o' : 'flat', eyes: t % 1.6 < 0.9 && t > 59.8 ? 'closed' : 'open', armB: K(t, [[59.6, 0], [60.3, 1]]) > 0.5 ? SIP_B : MUG_B, armA: REST });
      dad.root.visible = true; putP(dad, p); bags.forEach((b) => (b.visible = true));
      dad.head.glasses.rotation.z = 0.14;
      mug.visible = true; const hm = handWorld(dad, 1); mug.position.copy(hm).add(new THREE.Vector3(0, -0.05, 0)); mug.rotation.y = 0.3;
      steamAt(t, hm.clone().add(new THREE.Vector3(0, 0.08, 0)), 0.6);
      pip.g.visible = false; crate.g.visible = true;
    },
  };

  // ---------------------------------------------------------------- the towel ghost
  function drapeGhost(t, k, mode, squish = 0) {
    ghost.visible = true;
    pip.g.updateMatrixWorld(true);
    const hc = pipHead(), body = pip.T.getWorldPosition(new THREE.Vector3());
    const lieK = mode === 'lie' ? 1 : 0, s = 0.6 + 0.4 * k;
    gBody.position.set(body.x, 0 + CF, body.z - 0.02); gBody.scale.set(0.135 * s, (body.y - CF + 0.08) * s * (1 - 0.15 * lieK), 0.24 * s);
    gHead.position.copy(hc).add(new THREE.Vector3(0, 0.015, 0.0)); gHead.scale.set(0.1 * s, 0.098 * s * (1 - 0.2 * squish), (0.1 - 0.03 * squish) * s);
    gEars.forEach((c) => { c.position.copy(hc).add(new THREE.Vector3(c.userData.s * 0.055, 0.11, -0.01)); c.rotation.set(0, 0, -c.userData.s * 0.35); c.scale.setScalar(s * 0.9); });
    gHem.position.set(body.x, CF + 0.012, body.z); gHem.scale.set(0.135 * s, 0.24 * s, 1);
    ghost.position.set(0, 0, 0);
  }
  function steamAt(t, pos, amt) {
    steam.forEach((s, i) => {
      const ph = ((t * 0.55 + i * 0.137) % 1);
      s.visible = amt > 0.01; s.position.set(pos.x + Math.sin(i * 2.1 + t) * 0.06, pos.y + 0.05 + ph * 0.35, pos.z + Math.cos(i * 1.7) * 0.05);
      s.scale.setScalar(0.05 + ph * 0.12); s.material.opacity = 0.28 * amt * Math.sin(ph * PI);
    });
  }
  function stepY(z) {   // stair height under Mia's feet; she drops to the next step over the front 35 % of each tread
    const d = (HM.stairZ0 - z) / HM.tread;
    if (d < 0) return 0;
    const i = Math.min(Math.floor(d), HM.steps - 1), f = d - i, top = (n) => (n + 1) * HM.rise;
    return lerp(top(i - 1), top(i), smooth(f / 0.35));
  }

  // ---------------------------------------------------------------- bedroom shots (parents in the big bed / Mia in hers)
  function bedShot(t, mode, o) {
    pip.g.visible = false;
    const B = BD.bed, parents = mode !== 'mia';
    bed.bed.scale.x = parents ? 1.7 : 1; bed.bed.position.x = parents ? -B.cx * 0.7 : 0;
    if (bedWall) bedWall.color.set(parents ? 0xb9c8d6 : 0xe8c9d6);
    bed.decor.kid.visible = !parents; bed.decor.baby.visible = false; bed.decor.teen.visible = false; bed.decor.empty.visible = false;
    bed.setNightlight(parents ? 0 : 1); bed.setLamp(mode === 'parents' ? smooth((t - 15.95) / 0.12) : mode === 'awake' ? 0.8 : 0); bed.setXmas(parents ? 0 : 0.6, t);
    bed.lights.spot.intensity = 0; bed.lights.hemi.intensity = 1.05; bed.lights.moon.intensity = 1.9;
    duvet.visible = parents; miaQuilt.visible = !parents; dClock.visible = parents; clockGlow.intensity = parents ? 0.5 : 0;
    dadS.g.visible = momS.g.visible = parents; miaS.g.visible = !parents; dadPillow.visible = false;
    const Y = B.top + 0.12, Z = -2.12;
    if (parents) {
      duvet.position.set(B.cx, B.top, -1.18);
      dadS.g.position.set(B.cx - 0.25, Y, Z); momS.g.position.set(B.cx + 0.25, Y, Z);
      if (mode === 'parents') {
        const open = o.open, lk = o.look;
        for (const [S, s] of [[dadS, -1], [momS, 1]]) {
          S.head.eyesOpen.visible = open; S.head.eyesClosed.visible = !open;
          S.turn.rotation.z = s * 0.15 - s * 0.6 * lk; S.g.position.y = Y + 0.02 * (open ? 1 : 0);
        }
      } else {
        dadS.head.eyesOpen.visible = false; dadS.head.eyesClosed.visible = true;
        dadPillow.visible = true; dadPillow.position.set(B.cx - 0.25, Y + 0.13, Z + 0.02); dadPillow.rotation.set(0.25, 0, PI / 2 + 0.1 * Math.sin(t * 3));
        const bl = (t % 1.7) < 0.15;
        momS.head.eyesOpen.visible = !bl; momS.head.eyesClosed.visible = bl; momS.turn.rotation.z = K(t, [[36.6, 0.05], [37.3, 0.5], [38.0, 0.5], [38.6, -0.1]]);
        dadPillow.scale.set(1, 1 - 0.08 * Math.abs(Math.sin(t * 5)), 0.5); duvet.children[1].position.y = 0.12 + 0.03 * Math.abs(Math.sin(t * 6.5));
      }
    } else {
      miaQuilt.position.set(B.cx, B.top, -1.35 + 0.7 * smooth((t - 40.35) / 0.4)); miaQuilt.rotation.x = 0.9 * smooth((t - 40.35) / 0.4);
      miaS.g.position.set(B.cx, B.top + 0.13, Z);
      miaS.head.eyesOpen.visible = true; miaS.head.eyesClosed.visible = false;
      miaS.turn.rotation.z = -0.75 * smooth((t - 39.2) / 0.4) + 0.08 * Math.sin(t * 1.3);
      miaS.head.flat.visible = t < 39.9; miaS.head.smile.visible = t >= 39.9;
    }
  }

  // ---------------------------------------------------------------- pose lineup (t ≥ 200): one Pip pose per second
  const LINE = [
    { name: 'stand' }, { name: 'sit', sit: 1 }, { name: 'lie', lie: 1 }, { name: 'sleep', sleep: 1 },
    { name: 'whimper', sit: 1, whimper: 1 }, { name: 'howl', howl: 1 }, { name: 'wag', wag: 1, mouth: 'pant' }, { name: 'tilt', sit: 1, tilt: 0.35, ears: 1 },
    { name: 'sad', sit: 1, sad: 1, ears: 0.2 }, { name: 'happy', sit: 1, eyes: 'happy', mouth: 'pant', wag: 1 }, { name: 'run', run: 1 }, { name: 'beg', beg: 1, mouth: 'pant' },
    { name: 'wide', eyes: 'wide', ears: 1, hop: 0.12 }, { name: 'roll', lie: 1, roll: PI * 0.93 }, { name: 'lick', lie: 1, lick: 1 }, { name: 'walk', walk: 1 },
  ];
  function lineup(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = 'none';
    lights('eve'); crate.g.visible = false; banner.visible = false;
    const i = Math.floor(t - 200) % LINE.length, L = LINE[i];
    placePip(0.4, 0.5, 0, (t - 200) % 1 > 0.4 ? 1.3 : 0.45);
    pip.update(t, { ...L, still: true });
    if (t - 200 >= 16) { // family lineup
      pip.g.visible = false;
      [[mia, 0.0], [mom, 0.6], [dad, 1.1]].forEach(([P, x]) => { const p = basePose(); Object.assign(p, { x, z: -0.6, glasses: P === dad }); if (t - 200 >= 17) Object.assign(p, KNEEL, { rotY: 0.6 }); P.root.visible = true; putP(P, p); });
      setCamera([0.55, 0.9, 2.6], [0.55, 0.75, -0.6], 44, 0, 0);
    }
  }

  return { update };
}

const RoundedBoxGeometryLite = (w, h, d) => new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.3);
