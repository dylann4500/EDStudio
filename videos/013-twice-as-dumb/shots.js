// VIDEO 013 — "What if every human became twice as dumb?"  (tone: MONTAGE — the funny counterpart of 007 "twice as smart")
// 76 s, 13 beats, NINE sets in one scene (each set's root parked at its own offset; only the current one is visible).
// Same energy as 007 (one premise, many places, ~5 s per beat, spectacle) but every beat is a dumb consequence + a REAL number
// in the HUD stat line (user steer: "more informativeness, cool numbers of bad things that would happen to society").
// Sources (checked Oct 2026):
//   scams $1.03 T stolen in 12 months — GASA Global State of Scams 2024 · "123456" most common password — NordPass 2024
//   1.19 M road deaths / year — WHO Global Status Report on Road Safety 2023 · ~100,000 flights / day — FlightAware 2024
//   crow "007" solved an 8-stage puzzle — Alex Taylor (Univ. of Auckland), BBC 2014 · Chaser the border collie learned 1,022 object
//   names — Pilley & Reid 2011, Behavioural Processes · world GDP ≈ $117 T — IMF WEO Oct 2025 · IQ tests are normed so the average
//   is 100 (SD 15) and re-normed periodically (Flynn effect ≈ 3 points / decade, APA) · ~86 B neurons (Azevedo et al. 2009).
//
// Shot list (seconds)                     | set      | what happens
//  0.0– 8.2  street  9:41 AM (quiet open)  | street   | crowd walks; a grey puff + "?" pops over every head (wave); all stop, scratch heads; one walks into a wall
//  8.2–13.4  class   +1 minute             | classroom| board "2 + 2 = ?"; kids hold up signs 5 / 22 / FISH / 5…; the teacher counts, writes "= 5 ✓"
// 13.4–18.6  office  +1 hour               | office   | password field: 1-2-3-4-5-6 → "STRONG ✓"; a YOU WON popup; types the PIN; money streams out of the screen
// 18.6–23.8  traffic +2 hours              | city     | queue waits at green while cross traffic runs its red; light turns red → they floor it → bonk pile-up
// 23.8–29.0  door    +1 day                | street   | a queue at a PULL door: push, bonk, step aside, scratch head, next
// 29.0–34.2  sky     +1 day                | city roof| jets circle with contrails; one skywrites a giant "?"
// 34.2–39.4  remote  +1 week               | kitchen  | Gary holds the TV remote to his ear… the TV shows "CALLING MOM…" → Mom picks up (holding a remote too)
// 39.4–44.6  crows   +1 month              | suburb   | crows hop in sync, one steals the sandwich, the rest take over the bench
// 44.6–49.8  dog     +1 month              | suburb   | the dog walks a man (collar + leash in the dog's mouth); both sniff a hydrant
// 49.8–55.0  war     +1 year               | war room | the hologram globe becomes a tic-tac-toe grid; every game is a draw; leaders shrug + clap
// 55.0–60.2  rocket  +5 years              | city roof| the Mars rocket launches… hovers… and lands right back on its pad. Crowd cheers.
// 60.2–66.2  press   RE-SCORED             | podium   | a scientist at a press briefing: bell curve "AVERAGE 50" → re-scored "100"; flashes
// 66.2–76.0  sheet   +5 years              | bedroom  | Gary (cameo) still loses to the fitted sheet (007 callback). End card 72.0
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld } from '@engine/rig.js';
import { makeDog } from '@engine/props.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildCity, makeCar, ROOF_Y } from '@engine/sets/city.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildSuburb, DIMS as SD, SW_H } from '@engine/sets/suburb.js';
import { buildWarRoom, DIMS as WD } from '@engine/sets/warroom.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildBedroom } from '@engine/sets/bedroom.js';

const PI = Math.PI;
const OFF = { city: [0, 0, 0], street: [1500, 0, 0], cls: [3000, 0, 0], office: [4500, 0, 0], sub: [-3000, 0, 0], kit: [-4500, 0, 0],
  war: [6000, 0, 0], press: [7500, 0, 0], bed: [-6000, 0, 0] };
const WAVE = 5.4;        // the dumb wave starts (street)
const T_RED = 21.6;      // the light turns red (traffic)
const LIFT = 55.6;       // rocket lift-off
const TS = 16.2;         // the bedroom ending reuses 007's timing (authored at 50.0 → starts at 66.2)
const KS = 0.62;

export const SHOTS = [
  { t0: 0, t1: 8.2, cam: 'street', set: 'street' },
  { t0: 8.2, t1: 13.4, cam: 'class', set: 'cls' },
  { t0: 13.4, t1: 18.6, cam: 'office', set: 'office' },
  { t0: 18.6, t1: 23.8, cam: 'traffic', set: 'city' },
  { t0: 23.8, t1: 29.0, cam: 'door', set: 'street' },
  { t0: 29.0, t1: 34.2, cam: 'sky', set: 'city' },
  { t0: 34.2, t1: 39.4, cam: 'remote', set: 'kit' },
  { t0: 39.4, t1: 44.6, cam: 'crows', set: 'sub' },
  { t0: 44.6, t1: 49.8, cam: 'dog', set: 'sub' },
  { t0: 49.8, t1: 55.0, cam: 'war', set: 'war' },
  { t0: 55.0, t1: 60.2, cam: 'rocket', set: 'city' },
  { t0: 60.2, t1: 66.2, cam: 'press', set: 'press' },
  { t0: 66.2, t1: 76.0, cam: 'sheet', set: 'bed' },
];
// camera coordinates are LOCAL to the shot's set (OFF is added at runtime). p/a = start→end, fov, amp = handheld drift
export const CAMS = {
  street:  { p: [[-20.0, 1.45, 5.6], [-20.0, 1.42, 4.6]], a: [[-20.0, 1.5, -1.6], [-20.0, 1.48, -1.6]], fov: 48, amp: 0.006 },
  class:   { p: [[0.35, 2.2, 2.6], [0.3, 2.15, 2.2]], a: [[0.3, 1.0, -3.0], [0.3, 1.0, -3.0]], fov: 56, amp: 0.004 },
  office:  { p: [[0.95, 1.42, 0.75], [0.88, 1.36, 0.5]], a: [[0.18, 1.08, -0.95], [0.18, 1.08, -0.95]], fov: 46, amp: 0.003 },
  traffic: { p: [[4.2, 3.0, 16.0], [4.0, 2.8, 14.6]], a: [[1.6, 1.5, -5.0], [1.6, 1.4, -5.0]], fov: 50, amp: 0.006 },
  door:    { p: [[1.0, 1.55, 4.3], [0.9, 1.5, 3.7]], a: [[0.6, 1.25, -2.4], [0.6, 1.25, -2.4]], fov: 54, amp: 0.005 },
  sky:     { p: [[-12.0, ROOF_Y + 1.6, 14.0], [-12.2, ROOF_Y + 1.55, 13.4]], a: [[-16, ROOF_Y + 150, -300], [-16, ROOF_Y + 160, -300]], fov: 58, amp: 0.003 },
  remote:  { p: [[0.15, 1.6, 2.45], [0.15, 1.55, 2.2]], a: [[1.25, 1.2, -1.4], [1.25, 1.2, -1.4]], fov: 56, amp: 0.004 },
  crows:   { p: [[58.9, 1.15, -1.7], [58.7, 1.1, -2.1]], a: [[58.0, 0.65, -6.3], [58.0, 0.65, -6.3]], fov: 50, amp: 0.004 },
  dog:     { p: [[0, 1.15, 3.4], [0, 1.15, 3.4]], a: [[0, 0.75, -1.0], [0, 0.75, -1.0]], fov: 48, amp: 0.004, ease: 'track' },
  war:     { p: [[0.0, 2.25, 3.8], [0.0, 2.1, 3.25]], a: [[0, 1.4, -0.2], [0, 1.42, -0.2]], fov: 52, amp: 0.004 },
  rocket:  { p: [[-13.6, ROOF_Y + 1.7, 12.6], [-13.8, ROOF_Y + 1.6, 12.4]], a: [[300, ROOF_Y + 20, -60], [300, ROOF_Y + 20, -60]], fov: 34, amp: 0.003, ease: 'rocket' },
  press:   { p: [[0.95, 1.75, 2.05], [0.9, 1.72, 1.75]], a: [[0.7, 1.75, -3.0], [0.7, 1.75, -3.0]], fov: 44, amp: 0.004 },   // in front of the back rows: their flashes behind the lens washed the frame out
  sheet:   { p: [[1.75, 1.6, 1.45], [1.45, 1.52, 1.05]], a: [[-0.3, 1.05, -1.6], [-0.2, 1.05, -1.65]], fov: 52, amp: 0.004 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const SCRATCH_B = A(-2.35, 0.55, -2.1, -0.4);              // scratching the top of the head
const CROSS_A = A(-0.5, -0.05, -1.6, 0.75);
const PUSH_A = A(-1.45, 0.12, -0.3, 0.2), PUSH_B = A(-1.45, 0.12, -0.3, -0.2);   // both palms on a door
const HOLD_A = A(-2.75, 0.3, -0.6, 0.3), HOLD_B = A(-2.75, 0.3, -0.6, -0.3);     // a sign held up over the head
const TYPE_A = A(-0.72, 0.08, -0.95, 0.35), TYPE_B = A(-0.72, 0.08, -0.95, -0.35);
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);                // remote to the right ear
const POINT_B = A(-1.35, 0.12, -0.08, 0);
const UP_B = A(-2.0, 0.15, -0.05, 0);                        // pointing at the sky
const SHRUG_A = A(-0.25, 0.65, -1.35, -0.4), SHRUG_B = A(-0.25, 0.65, -1.35, 0.4);
const CHEER_A = A(-2.7, 0.35, -0.3, 0), CHEER_B = A(-2.7, 0.35, -0.3, 0);
const CLAP_A = A(-1.0, 0.1, -1.2, 0.6), CLAP_B = A(-1.0, 0.1, -1.2, -0.6);
const BOARD_B = A(-2.3, 0.25, -0.35, -0.2);
const SNACK_B = A(-0.75, 0.12, -1.7, -0.45);                 // sandwich at chest height
const TALK_B = A(-0.85, 0.35, -1.15, -0.35);
const SHEET_A = A(-1.15, 0.65, -0.35, 0.2), SHEET_B = A(-1.15, 0.65, -0.35, -0.2);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));
function walkDist(t, v, tStop = 1e9, ramp = 0.5) { if (t <= tStop) return v * t; const u = Math.min(t - tStop, ramp); return v * (tStop + u - (u * u) / (2 * ramp)); }
const bell = (x, w) => Math.exp(-(x * x) / (w * w));
const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const SIGNS = ['4?', '5', 'FISH', '5', '5', '22', '5', '3.5', '5'];   // the four in the middle of the frame: 5 · FISH · 22 · 5
const FONT = (px, w = 'bold') => `${w} ${px}px Helvetica, Arial, sans-serif`;

// ---------------------------------------------------------------- props built for this video
function makeCrow(seed = 1) {
  const R = rng(seed), g = new THREE.Group(), black = mat(0x16161c, 0.55), beakM = mat(0x2d2b2a, 0.4);
  const body = new THREE.Group(); g.add(body);
  mk(new THREE.SphereGeometry(0.1, 14, 12), black, body, 0, 0.17, 0).scale.set(1, 0.95, 1.55);
  const head = new THREE.Group(); head.position.set(0, 0.27, 0.12); body.add(head);
  mk(new THREE.SphereGeometry(0.068, 14, 12), black, head);
  const beak = mk(new THREE.ConeGeometry(0.026, 0.1, 10), beakM, head, 0, -0.01, 0.1); beak.rotation.x = PI / 2;
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.016, 8, 6), mat(0xffffff, 0.3), head, s * 0.045, 0.02, 0.04); mk(new THREE.SphereGeometry(0.009, 8, 6), mat(0x000000, 0.2), head, s * 0.052, 0.022, 0.05); }
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); w.position.set(s * 0.085, 0.21, 0.02); body.add(w); const m = mk(new THREE.BoxGeometry(0.2, 0.02, 0.22), black, w, s * 0.09, 0, -0.03); m.rotation.z = s * 0.05; return w; });
  const tail = mk(new THREE.BoxGeometry(0.1, 0.02, 0.16), black, body, 0, 0.16, -0.2); tail.rotation.x = 0.35;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 5), beakM, g, s * 0.035, 0.045, 0.01);
  const flap = (k, t) => wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (k * (0.9 + 0.8 * Math.sin(t * 38)) + 0.05)));
  return { g, body, head, flap, seed: R() };
}
function makeJet() {
  const g = new THREE.Group(), white = mat(0xf4f5f7, 0.4), blue = mat(0x2f6aa8, 0.5);
  const f = mk(new THREE.CapsuleGeometry(1.9, 28, 6, 14), white, g); f.rotation.x = PI / 2;
  mk(new THREE.BoxGeometry(32, 0.5, 5), white, g, 0, -0.4, 1.0);
  mk(new THREE.BoxGeometry(11, 0.4, 2.6), white, g, 0, 0.6, -13.5);
  mk(new THREE.BoxGeometry(0.5, 6, 4), blue, g, 0, 3.6, -13.6);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(1.1, 1.1, 4, 12), mat(0xc9ccd2, 0.4), g, s * 6, -1.6, 2.5).rotation.x = PI / 2;
  return g;
}
const signTex = (txt) => canvasTex(256, 180, (g, w, h) => {
  g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2b2b2b'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = txt === 'FISH' ? '#2f6aa8' : '#1d1d22'; g.font = FONT(txt.length > 2 ? 78 : 130); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 6);
});

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (each parked at its offset; fogs kept per set)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const sub = buildSuburb(studio, {}); sub.root.position.set(...OFF.sub); const subFog = sub.fog || scene.fog;
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 1, golden: 0, power: 1, milky: 0, moon: 0 }); city.setSignal('green'); city.setGrowth(0); city.setSnow(0);
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls); cls.setClock(9, 42); cls.setSeason('autumn', 0); cls.setDoor(0);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(8, 5);
  const war = buildWarRoom(studio, {}); war.root.position.set(...OFF.war);
  const press = buildPodium(studio, {}); press.root.position.set(...OFF.press);
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.setDoor(0); bed.setLamp(1); bed.setNightlight(0); bed.setXmas(0, 0);
  bed.lights.spill.intensity = 0;
  const ROOTS = { street: street.root, city: city.root, cls: cls.root, office: office.root, sub: sub.root, kit: kit.root, war: war.root, press: press.root, bed: bed.root };
  const FOGS = { street: streetFog, city: cityFog, cls: null, office: null, sub: subFog, kit: null, war: null, press: null, bed: null };
  const FAR = { street: 400, city: 1500, cls: 60, office: 60, sub: 400, kit: 40, war: 60, press: 60, bed: 60 };

  // ---- street: the PULL door (over the market door) + "?" and puff sprites for the dumb wave
  const door = new THREE.Group(); door.position.set(0.6, SH, -2.9); street.root.add(door);
  const frameM = mat(0x2b2f36, 0.4);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.08, 2.25, 0.1), frameM, door, s * 0.6, 1.12, 0);
  mk(new THREE.BoxGeometry(1.28, 0.1, 0.1), frameM, door, 0, 2.25, 0);
  const leaf = new THREE.Group(); leaf.position.set(-0.55, 0, 0.02); door.add(leaf);       // hinge on the left (it never opens)
  mk(new THREE.BoxGeometry(1.1, 2.15, 0.04), new THREE.MeshStandardMaterial({ color: 0xbfe0f0, roughness: 0.05, transparent: true, opacity: 0.45 }), leaf, 0.55, 1.1, 0);
  mk(new THREE.BoxGeometry(1.1, 0.12, 0.05), frameM, leaf, 0.55, 0.06, 0); mk(new THREE.BoxGeometry(1.1, 0.08, 0.05), frameM, leaf, 0.55, 2.15, 0);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), mat(0xc9ccd0, 0.2, { metalness: 0.8 }), leaf, 0.95, 1.05, 0.08);
  const pull = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(256, 124, (g, w, h) => { g.fillStyle = '#d23a3f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = FONT(84); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PULL', w / 2, h / 2 + 4); }) }));
  pull.position.set(0.55, 1.88, 0.03); leaf.add(pull);
  const qTex = canvasTex(128, 160, (g, w, h) => { g.font = FONT(140); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#3a2a10'; g.strokeText('?', w / 2, h / 2 + 8); g.fillStyle = '#ffd34a'; g.fillText('?', w / 2, h / 2 + 8); });
  const puffTex = canvasTex(128, 128, (g, w, h) => { const r = rng(4); for (let i = 0; i < 9; i++) { const x = 30 + r() * 68, y = 34 + r() * 60, rr = 18 + r() * 16; const gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, 'rgba(150,150,155,.95)'); gr.addColorStop(1, 'rgba(150,150,155,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } });

  // ---- classroom: big chalk text over the board (the set's board font is too small for a 1-second read) + the kids' signs
  const chalk = (txt) => canvasTex(1024, 330, (g, w, h) => { g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % w, (i * 53) % h, 120, 6);
    g.fillStyle = '#f4f2ea'; g.font = FONT(170, '600'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 8); });
  const boardStates = [chalk('2 + 2 = ?'), chalk('2 + 2 = 5 ✓')];
  const boardM = new THREE.MeshStandardMaterial({ map: boardStates[0], roughness: 0.9 });
  mk(new THREE.PlaneGeometry(3.4, 1.1), boardM, cls.root, CD.board.x, CD.board.y, -2.95).castShadow = false;
  const signMats = SIGNS.map((s) => new THREE.MeshStandardMaterial({ map: signTex(s), roughness: 0.8 }));
  // ---- office: a desktop monitor facing the guest seat + keyboard; its screen swaps between canvas textures
  const mon = new THREE.Group(); mon.position.set(OD.desk[0] + 0.15, OD.deskTop, OD.desk[1] + 0.05); office.root.add(mon);
  mk(new THREE.BoxGeometry(0.2, 0.012, 0.16), mat(0x2b2d31, 0.4), mon, 0, 0.006, -0.05); mk(new THREE.BoxGeometry(0.05, 0.3, 0.03), mat(0x2b2d31, 0.4), mon, 0, 0.16, -0.08);
  mk(new THREE.BoxGeometry(0.78, 0.48, 0.03), mat(0x1d1f23, 0.4), mon, 0, 0.38, -0.06);
  const screenM = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xe8e8e8 });
  const screen = mk(new THREE.PlaneGeometry(0.74, 0.44), screenM, mon, 0, 0.38, -0.044); screen.castShadow = false;
  mk(new THREE.BoxGeometry(0.46, 0.02, 0.15), mat(0xd9dbe0, 0.5), mon, -0.05, 0.01, 0.3);
  const scr = (draw) => canvasTex(740, 440, (g, w, h) => { g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; draw(g, w, h); });
  const pwTex = Array.from({ length: 8 }, (_, n) => scr((g, w, h) => {
    g.fillStyle = '#2f4f73'; g.fillRect(0, 0, w, 90); g.fillStyle = '#fff'; g.font = FONT(42); g.fillText('CREATE A PASSWORD', w / 2, 47);
    g.fillStyle = '#fff'; g.strokeStyle = '#9aa6b5'; g.lineWidth = 4; g.fillRect(70, 135, w - 140, 110); g.strokeRect(70, 135, w - 140, 110);
    g.fillStyle = '#1d1d22'; g.font = FONT(84); g.fillText('123456'.slice(0, Math.min(n, 6)) + (n < 6 && n % 2 === 0 ? '|' : ''), w / 2, 194);
    if (n >= 7) { g.fillStyle = '#2f9a5a'; g.fillRect(70, 290, w - 140, 34); g.font = FONT(52); g.fillText('STRONG ✓', w / 2, 380); }
    else { g.fillStyle = '#e1e5ea'; g.fillRect(70, 290, w - 140, 34); g.fillStyle = '#d23a3f'; g.fillRect(70, 290, (w - 140) * 0.12 * n / 6, 34); }
  }));
  const scamTex = Array.from({ length: 6 }, (_, n) => scr((g, w, h) => {
    g.fillStyle = '#ffd34a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d23a3f'; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#d23a3f'; g.font = FONT(58); g.fillText('YOU WON', w / 2, 80); g.font = FONT(92); g.fillText('$1,000,000', w / 2, 170);
    g.fillStyle = '#1d1d22'; g.font = FONT(36); g.fillText('ENTER BANK PIN:', w / 2, 262);
    g.fillStyle = '#fff'; g.fillRect(170, 300, w - 340, 90); g.fillStyle = '#1d1d22'; g.font = FONT(70); g.fillText('1234'.slice(0, Math.min(n, 4)), w / 2, 348);
    if (n >= 5) { g.fillStyle = '#2f9a5a'; g.font = FONT(30); g.fillText('SENT ✓', w - 105, 348); }
  }));
  const BILLS = 160, billTex = canvasTex(128, 56, (g, w, h) => { g.fillStyle = '#9ccf8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f7a3a'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#3f7a3a'; g.font = FONT(40); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 2); });
  const bills = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.07), new THREE.MeshStandardMaterial({ map: billTex, side: THREE.DoubleSide, roughness: 0.7 }), BILLS);
  bills.frustumCulled = false; office.root.add(bills);
  const BR = rng(31), billSeeds = Array.from({ length: BILLS }, () => [BR(), BR(), BR(), BR(), BR()]);

  // ---- city: traffic (a queue at the light + cross traffic), jets + skywriter, the boomerang rocket
  const CAR_COLS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xf5f0e2, 0x8f6fb8, 0x2f4f73, 0xe08a3a];
  const queue = [0, 1, 2].map((j) => { const c = makeCar(CAR_COLS[(j * 3 + 1) % 8], 40 + j); city.root.add(c.g); return c; });
  const cross = [];
  for (const [lane, z, dir] of [[0, -4, 1], [1, -8, -1]]) for (let j = -3; j <= 4; j++) { const c = makeCar(CAR_COLS[(j + 3 + lane * 4) % 8], 60 + lane * 10 + j); city.root.add(c.g); cross.push({ c, z, dir, j, lane }); }
  const jets = Array.from({ length: 16 }, (_, i) => { const j = makeJet(); city.root.add(j); return { g: j, i }; });
  const writer = makeJet(); city.root.add(writer);
  const PUFFS = 16 * 26 + 160, puffs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.85, emissive: 0xffffff, emissiveIntensity: 0.25 }), PUFFS);
  puffs.frustumCulled = false; city.root.add(puffs);
  // the "?" path (skywriter): a hook + a stem + a dot, in a vertical plane facing the roof; u = 0..1
  const Q = { c: [-16, ROOF_Y + 135, -300], s: 72 };
  const qPts = [];
  for (let k = 0; k <= 60; k++) { const a = PI * 1.05 - (k / 60) * PI * 1.55; qPts.push([Math.cos(a) * 0.62, 0.75 + Math.sin(a) * 0.62]); }
  for (let k = 1; k <= 14; k++) qPts.push([lerp(qPts[60][0], 0, k / 14), lerp(qPts[60][1], -0.3, k / 14)]);
  const qAt = (u) => { const f = clamp(u) * (qPts.length - 1), i = Math.min(Math.floor(f), qPts.length - 2), r = f - i; const [x0, y0] = qPts[i], [x1, y1] = qPts[i + 1]; return [lerp(x0, x1, r), lerp(y0, y1, r), Math.atan2(y1 - y0, x1 - x0)]; };
  const ROCKET = [300, 0, -60];
  const rocket = new THREE.Group(); city.root.add(rocket);
  const hull = mat(0xf4f4f2, 0.35);
  mk(new THREE.CylinderGeometry(3.2, 3.2, 44, 24), hull, rocket, 0, 22, 0);
  mk(new THREE.ConeGeometry(3.2, 10, 24), hull, rocket, 0, 49, 0);
  mk(new THREE.CylinderGeometry(3.25, 3.25, 3, 24), mat(0x2b2f36, 0.5), rocket, 0, 36, 0);
  for (let f = 0; f < 4; f++) { const fin = mk(new THREE.BoxGeometry(0.5, 8, 5), mat(0x2b2f36, 0.5), rocket, Math.sin(f * PI / 2) * 4, 4, Math.cos(f * PI / 2) * 4); fin.rotation.y = f * PI / 2; }
  const rocketSign = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.6, map: canvasTex(512, 160, (g, w, h) => { g.fillStyle = '#d23a3f'; g.font = FONT(110); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MARS →', w / 2, h / 2 + 6); }) }));
  rocketSign.position.set(0, 28, 3.25); rocketSign.rotation.y = -0.6; rocket.add(rocketSign);
  const pad = mk(new THREE.CylinderGeometry(14, 15, 2, 28), mat(0x8a8f96, 0.8), city.root, ROCKET[0], 1, ROCKET[2]);
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(3), transparent: true, opacity: 0.95, toneMapped: false, depthWrite: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(3.4, 22, 20, 1, true), flameMat); flame.rotation.x = PI; flame.position.y = -10; rocket.add(flame);
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(1.8, 12, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(4), toneMapped: false })); flameCore.rotation.x = PI; flameCore.position.y = -5; rocket.add(flameCore);
  const launchLight = new THREE.PointLight(0xffb060, 0, 600, 1.2); city.root.add(launchLight);
  const SMOKE = 160, smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 1, transparent: true, opacity: 0.92 }), SMOKE);
  smoke.frustumCulled = false; city.root.add(smoke);
  const SR = rng(55), smokeSeeds = Array.from({ length: SMOKE }, () => [SR(), SR(), SR(), SR()]);
  // boomerang flight: up (eased) → hover → back down onto the same pad (tail first, like a booster)
  const rocketH = (t) => { const u = t - LIFT; if (u <= 0) return 0; if (u < 2.1) return 230 * smooth(u / 2.1); if (u < 2.5) return 230 + 4 * Math.sin((u - 2.1) * 8); return 230 * (1 - smooth((u - 2.5) / 1.8)); };

  // ---- kitchen: a TV on the counter + the remote
  const tv = new THREE.Group(); tv.position.set(1.85, 0.92, -2.3); kit.root.add(tv);
  mk(new THREE.BoxGeometry(0.3, 0.02, 0.18), mat(0x1d1f23, 0.4), tv, 0, 0.01, 0); mk(new THREE.BoxGeometry(0.06, 0.12, 0.04), mat(0x1d1f23, 0.4), tv, 0, 0.07, 0);
  mk(new THREE.BoxGeometry(0.92, 0.56, 0.05), mat(0x15161a, 0.35), tv, 0, 0.42, 0);
  const tvM = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xe0e0e0 });
  mk(new THREE.PlaneGeometry(0.86, 0.5), tvM, tv, 0, 0.42, 0.027).castShadow = false;
  const tvCall = [0, 1, 2, 3].map((n) => canvasTex(516, 300, (g, w, h) => { g.fillStyle = '#1d3354'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = FONT(40, '600'); g.fillText('CALLING', w / 2, 100); g.font = FONT(84); g.fillText('MOM' + '.'.repeat(n), w / 2, 175); g.fillStyle = '#58b368'; g.beginPath(); g.arc(w / 2, 255, 22, 0, 7); g.fill(); }));
  const tvMom = canvasTex(516, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6d9b8'); gr.addColorStop(1, '#e9b98f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8a5a3a'; g.beginPath(); g.ellipse(w / 2, 150, 110, 120, 0, 0, 7); g.fill();             // hair
    g.fillStyle = '#f0c49e'; g.beginPath(); g.ellipse(w / 2, 165, 80, 92, 0, 0, 7); g.fill();               // face
    g.fillStyle = '#2b2018'; for (const s of [-1, 1]) { g.beginPath(); g.arc(w / 2 + s * 30, 150, 8, 0, 7); g.fill(); }
    g.strokeStyle = '#7a3a2a'; g.lineWidth = 7; g.beginPath(); g.arc(w / 2, 180, 34, 0.2, PI - 0.2); g.stroke();
    g.fillStyle = '#d2483f'; g.fillRect(w / 2 - 120, 262, 240, 40);                                         // sweater
    g.fillStyle = '#1d1d22'; g.save(); g.translate(w / 2 + 92, 150); g.rotate(-0.25); g.fillRect(-12, -55, 24, 110); g.restore(); // she's holding a remote too
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, 120, 44); g.fillStyle = '#fff'; g.font = FONT(30); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MOM', 60, 23);
  });
  const remote = new THREE.Group(); mk(new THREE.BoxGeometry(0.045, 0.02, 0.18), mat(0x1d1d22, 0.4), remote); mk(new THREE.BoxGeometry(0.012, 0.004, 0.012), mat(0xd23a3f, 0.4), remote, 0, 0.012, 0.06);

  // ---- suburb: crows + sandwich, hydrant, leash
  const crows = Array.from({ length: 7 }, (_, i) => { const c = makeCrow(i + 3); c.g.scale.setScalar(1.15); sub.root.add(c.g); return c; });
  const sandwich = new THREE.Group(); mk(new THREE.BoxGeometry(0.12, 0.025, 0.1), mat(0xe8c48a, 0.8), sandwich, 0, -0.022, 0); mk(new THREE.BoxGeometry(0.13, 0.015, 0.11), mat(0x6fa84f, 0.8), sandwich); mk(new THREE.BoxGeometry(0.12, 0.025, 0.1), mat(0xe8c48a, 0.8), sandwich, 0, 0.02, 0);
  scene.add(sandwich);
  const HYD = [0.98, -0.45];                      // where the dog stops (walkX(SNIFF) + 0.55)
  const hyd = new THREE.Group(); hyd.position.set(HYD[0], SW_H, HYD[1]); sub.root.add(hyd);
  mk(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 14), mat(0xd23a3f, 0.5), hyd, 0, 0.28, 0); mk(new THREE.SphereGeometry(0.12, 14, 8, 0, 2 * PI, 0, PI / 2), mat(0xd23a3f, 0.5), hyd, 0, 0.55, 0);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 10), mat(0xd23a3f, 0.5), hyd, s * 0.14, 0.38, 0).rotation.z = PI / 2;
  const dog = makeDog({ color: 0x2a2420, patch: 0xf2efe8 }); dog.g.scale.setScalar(1.3); sub.root.add(dog.g);
  const leashM = mat(0xd23a3f, 0.6), leash = new THREE.Mesh(new THREE.BufferGeometry(), leashM); leash.frustumCulled = false; scene.add(leash);

  // ---- war room: a tic-tac-toe hologram where the globe used to be
  const GAME = [4, 0, 8, 2, 1, 7, 6, 3, 5];       // a perfect game → draw (X O X O X O X O X)
  const GAME2 = [0, 4, 8, 2, 6];
  const tttTex = (moves, draw) => canvasTex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.shadowColor = '#7fe4ff'; g.shadowBlur = 18; g.strokeStyle = '#a8f0ff'; g.lineWidth = 12; g.lineCap = 'round';
    for (const k of [1, 2]) { g.beginPath(); g.moveTo(k * w / 3, 30); g.lineTo(k * w / 3, h - 30); g.stroke(); g.beginPath(); g.moveTo(30, k * h / 3); g.lineTo(w - 30, k * h / 3); g.stroke(); }
    moves.forEach((cell, i) => { const cx = (cell % 3 + 0.5) * w / 3, cy = (Math.floor(cell / 3) + 0.5) * h / 3, r = 52;
      if (i % 2 === 0) { g.strokeStyle = '#ff9a6a'; g.shadowColor = '#ff7a4a'; g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke(); }
      else { g.strokeStyle = '#a8f0ff'; g.shadowColor = '#7fe4ff'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); } });
    if (draw) { g.shadowColor = '#000'; g.shadowBlur = 0; g.fillStyle = 'rgba(10,20,30,.7)'; g.fillRect(40, h / 2 - 62, w - 80, 124); g.fillStyle = '#ffd34a'; g.font = FONT(96); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DRAW', w / 2, h / 2 + 4); }
  });
  const tttStates = [...Array.from({ length: 10 }, (_, n) => tttTex(GAME.slice(0, n), false)), tttTex(GAME, true), ...Array.from({ length: 6 }, (_, n) => tttTex(GAME2.slice(0, n), false))];
  const tttM = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide, map: tttStates[0] });
  const ttt = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), tttM); ttt.position.set(0, WD.globe.y, 0); ttt.castShadow = false; war.root.add(ttt);

  // ---- press room: a big screen with the bell curve (AVERAGE 50 → re-scored 100)
  const curveTex = (stage) => canvasTex(800, 500, (g, w, h) => {
    g.fillStyle = '#10243a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = FONT(40); g.textAlign = 'center'; g.fillText('HUMAN IQ', w / 2, 58);
    const x0 = 70, x1 = w - 70, yb = 400, px = (v) => x0 + (v - 25) / 150 * (x1 - x0); // axis 25..175
    const mu = stage ? 100 : 50, muX = stage ? px(100) : px(50);
    g.beginPath(); g.moveTo(x0, yb); for (let x = x0; x <= x1; x += 4) { const v = 25 + (x - x0) / (x1 - x0) * 150; const d = (v - (stage ? 100 : 50)) / 15; g.lineTo(x, yb - 230 * Math.exp(-d * d / 2)); } g.lineTo(x1, yb); g.closePath();
    g.fillStyle = stage ? 'rgba(88,179,104,.55)' : 'rgba(242,182,50,.5)'; g.fill(); g.strokeStyle = stage ? '#7fe08f' : '#ffd34a'; g.lineWidth = 6; g.stroke();
    g.strokeStyle = '#cfd8e3'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x1, yb); g.stroke();
    g.fillStyle = '#cfd8e3'; g.font = FONT(28, '600'); for (const v of [50, 100, 150]) g.fillText(String(v), px(v), yb + 40);
    g.setLineDash([12, 10]); g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(muX, yb); g.lineTo(muX, 130); g.stroke(); g.setLineDash([]);
    g.font = FONT(44); g.fillStyle = stage ? '#7fe08f' : '#ffd34a'; g.fillText(stage ? 'AVERAGE = 100 ✓' : 'AVERAGE = 50', stage ? w / 2 : muX + 60, 112);
    if (stage) { g.fillStyle = '#ff8a7a'; g.font = FONT(30); g.fillText('(RE-SCORED)', w / 2, h - 30); }
    void mu;
  });
  const curveStates = [curveTex(0), curveTex(1)];
  const curveM = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xd8d8d8, map: curveStates[0] });
  const curve = new THREE.Group(); curve.position.set(0.85, 2.3, -3.9); curve.scale.setScalar(0.95); press.root.add(curve);
  mk(new THREE.BoxGeometry(1.86, 1.2, 0.06), mat(0x15161a, 0.35), curve);
  mk(new THREE.PlaneGeometry(1.76, 1.1), curveM, curve, 0, 0, 0.032).castShadow = false;

  // ---------------------------------------------------------------- cast
  const R = rng(13);
  const randPerson = () => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.25, mustache: style !== 'bob' && R() < 0.3 ? HAIRS[Math.floor(R() * 3)] : null });
    scene.add(p.root); p.seed = R(); p.seed2 = R(); p.seed3 = R(); return p;
  };
  const extras = Array.from({ length: 26 }, randPerson);
  const qs = extras.map((e) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: qTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); s.scale.set(0.24, 0.3, 1); s.position.set(0, 0.48, 0); e.headG.add(s); return s; });
  const pf = extras.map((e) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, opacity: 0, depthWrite: false })); s.position.set(0, 0.3, 0); e.headG.add(s); return s; });
  const kids = Array.from({ length: 9 }, (_, i) => {
    const k = makePerson({ skin: SKINS[(i * 3) % 7], top: TOPS[(i * 7 + 2) % 10], pants: PANTS[i % 5], hair: HAIRS[(i * 5) % 6], hairStyle: STYLES[(i * 2) % 7], headR: 0.175 });
    k.root.scale.setScalar(KS); scene.add(k.root);
    const sg = new THREE.Group(); sg.position.set(0, 1.92, 0.12); k.root.add(sg);       // both faces readable (teacher side + camera side)
    for (const ry of [0, PI]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.46), signMats[i]); pl.rotation.y = ry; pl.position.z = ry ? -0.006 : 0.006; sg.add(pl); }
    mk(new THREE.BoxGeometry(0.68, 0.48, 0.008), mat(0xc89a66, 0.8), sg);
    k.sign = sg; return k;
  });
  const teacher = makePerson({ skin: 0xe2ad8c, top: 0x7a9e7e, collar: 0xf3e9dc, pants: 0x4a4f5c, hair: 0x8a5a3a, hairStyle: 'bob', glasses: true }); scene.add(teacher.root);
  const worker = makePerson({ skin: 0xc98e6a, top: 0xf5f0e2, collar: 0x2f4f73, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'messy', glasses: true }); scene.add(worker.root);
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 }); scene.add(gary.root);
  gary.arms.find((a) => a.s === 1).hand.add(remote); remote.position.set(0.0, -0.06, 0.05); remote.rotation.set(1.2, 0, 0);
  const parkGuy = makePerson({ skin: 0x9a6447, top: 0xe08a3a, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a }); scene.add(parkGuy.root);
  const walker = makePerson({ skin: 0xf3d0b5, top: 0x6fa84f, pants: 0x34405c, hair: 0xd9b46a, hairStyle: 'messy' }); scene.add(walker.root);
  mk(new THREE.TorusGeometry(0.075, 0.018, 8, 20), mat(0xd23a3f, 0.5), walker.spine, 0, 0.555, 0.0).rotation.x = PI / 2;   // a red dog collar
  const tag = mk(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12), mat(0xf2c14e, 0.3, { metalness: 0.6 }), walker.spine, 0, 0.5, 0.085); tag.rotation.x = PI / 2;
  const LEAD = [
    { a: -1.25, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short' },
    { a: PI + 0.75, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob' },
    { a: PI - 1.25, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short' },
    { a: PI + 1.95, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', glasses: true },
    { a: 1.25, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob' },
    { a: PI - 0.75, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy' },
  ];
  const leaders = LEAD.map((L) => { const P = makePerson({ ...L, collar: 0xf1ede4 }); scene.add(P.root); return P; });
  const sci = makePerson({ skin: 0xd9a37f, top: 0xf7f7f4, collar: 0x7fb7b0, pants: 0x34405c, hair: 0xc9c4be, hairStyle: 'messy', glasses: true }); scene.add(sci.root);
  const ALL = [...extras, ...kids, teacher, worker, gary, parkGuy, walker, ...leaders, sci];
  const hide = () => ALL.forEach((p) => (p.root.visible = false));

  // fitted sheet (007's cloth between Gary's hands, or crumpled into a ball)
  const SW = 18, SHt = 14, sheetGeo = new THREE.PlaneGeometry(1, 1, SW, SHt);
  const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.9, side: THREE.DoubleSide }));
  sheet.castShadow = true; sheet.frustumCulled = false; scene.add(sheet);
  const SRn = rng(3), sheetNoise = Array.from({ length: (SW + 1) * (SHt + 1) }, () => [SRn() - 0.5, SRn() - 0.5, SRn() - 0.5]);
  const _a = new THREE.Vector3(), _b = new THREE.Vector3();
  function updateSheet(t, hA, hB, crumple, ballPos) {
    const pos = sheetGeo.attributes.position;
    const span = _b.subVectors(hB, hA), len = span.length();
    const fwd = new THREE.Vector3(-span.z, 0, span.x).normalize();
    for (let j = 0; j <= SHt; j++) for (let i = 0; i <= SW; i++) {
      const u = i / SW, v = j / SHt, idx = j * (SW + 1) + i, n = sheetNoise[idx];
      const sag = 0.12 * Math.sin(PI * u), flap = 0.06 * Math.sin(t * 7.0 + u * 5 + v * 3) * v, curl = 0.22 * v * v * (Math.abs(u - 0.5) * 2) ** 2;
      _a.copy(hA).lerp(hB, u); _a.y -= sag + v * 1.0 - curl * 0.6;
      _a.addScaledVector(fwd, 0.1 * v + flap + curl * 0.8 + n[2] * 0.03 * v);
      _a.addScaledVector(span, (0.5 - u) * curl * 0.5 / Math.max(len, 0.01));
      if (crumple > 0) { const dir = new THREE.Vector3(u - 0.5 + n[0], v - 0.5 + n[1], n[2] * 2).normalize(); const ball = new THREE.Vector3().copy(ballPos).addScaledVector(dir, 0.16 + 0.05 * Math.abs(n[0] * 2)); _a.lerp(ball, crumple); }
      pos.setXYZ(idx, _a.x, _a.y, _a.z);
    }
    pos.needsUpdate = true; sheetGeo.computeVertexNormals(); sheetGeo.computeBoundingSphere();
    const nn = sheetGeo.attributes.normal; for (let i = 0; i < nn.count; i++) { const x = nn.getX(i), y = nn.getY(i), z = nn.getZ(i); if (!(x * x + y * y + z * z > 1e-8)) nn.setXYZ(i, 0, 1, 0); }
  }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p, scale = 1) {
    p.floor = p.floor || 0;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    if (scale !== 1) rig.root.position.y = (p.y || 0) * scale;
    rig.root.visible = p.visible !== false;
  }
  const seatY = (seatTop) => -0.375 + (seatTop - 0.42);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E3 = new THREE.Euler(), S3 = new THREE.Vector3(), V3 = new THREE.Vector3();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

  // ---------------------------------------------------------------- performances (local coords)
  function streetCrowd(t, e, i) { // S1: side-on walkers; the dumb wave; stop; scratch heads; one walks into the wall
    const p = basePose(); p.eyes = blink(t, i + 3); p.y = SH; p.floor = SH;
    const v = (e.seed < 0.5 ? -1 : 1) * (0.75 + e.seed2 * 0.45), lanes = [-2.5, -2.0, -1.5, -1.0, -0.55];
    const hit = i === 0 ? WAVE + 0.2 : WAVE + ((((i * 0.37 + e.seed * 0.3) % 1) * 12) / 12) * 0.6;    // when the puff reaches this head (the wall-walker: fixed, for the bonk SFX)
    const tStop = hit + 0.35 + e.seed2 * 0.2;
    const d = walkDist(t, v, tStop, 0.45);
    p.x = wrap(((i * 0.37 + e.seed * 0.3) % 1) * 12 - 26 + d, -26, -14); p.z = lanes[i % lanes.length] + (e.seed3 - 0.5) * 0.15;
    p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(d); p.speed = t < tStop ? Math.abs(v) : 0;
    const think = K(t, [[tStop + 0.3, 0], [tStop + 0.7, 1]]);
    p.armB = mixArm(REST, SCRATCH_B, think); p.armB.el += 0.25 * Math.sin(t * 16 + i) * think;
    p.headPitch = lerp(0.05, -0.1, think); p.headRoll = 0.18 * think * (i % 2 ? 1 : -1); p.headYaw = (e.seed - 0.5) * 0.6 * think;
    p.mouth = think > 0.5 ? 'o' : 'smile'; if (think > 0.5) p.eyes = blink(t, i + 3);
    if (i === 0) { // the wall-walker: after the wave he faces the shop and keeps walking into it
      p.x = -19.35; p.z = -2.45; p.rotY = t < hit ? PI / 2 : PI; p.speed = t < hit ? 0.9 : 0.8; p.dist = t * 0.9;
      const bonk = t > hit + 0.4 ? Math.abs(Math.sin((t - hit) * 4.2)) : 0;
      p.z = -2.4 - 0.16 * (1 - bonk); p.lean = -0.12 * (bonk > 0.95 ? 1 : 0); p.armB = REST; p.headRoll = 0;
      if (t < hit) { p.x = -21.0 + 0.9 * t * 0.2; }
    }
    const puffK = bell(t - hit - 0.25, 0.3);
    pf[i].material.opacity = clamp(puffK * 1.4) * 0.9; pf[i].scale.setScalar(0.25 + 0.6 * clamp((t - hit) / 0.6));
    const q = K(t, [[hit + 0.15, 0], [hit + 0.4, 1], [8.0, 1], [8.2, 0]]);
    qs[i].material.opacity = q; qs[i].position.y = 0.48 + 0.04 * Math.sin(t * 5 + i);
    return p;
  }
  function kidPose(t, i) { // S2: seated, facing the board; signs go up one by one
    const d = CD.desks[[1, 2, 3, 4, 7, 8, 9, 10, 0][i]];
    const p = basePose(); p.eyes = blink(t, i + 4);
    Object.assign(p, { x: d.x, z: d.z + CD.chair.dz, rotY: PI, y: -0.22, footFwd: 0.4, lean: 0.04 });
    const up = K(t, [[9.9 + i * 0.16, 0], [10.3 + i * 0.16, 1]]);
    const wave = 0.12 * Math.sin(t * 6 + i * 2) * up;
    p.armA = mixArm(A(-0.7, 0.05, -0.9, 0.3), HOLD_A, up); p.armB = mixArm(A(-0.7, 0.05, -0.9, -0.3), HOLD_B, up);
    p.armA.sz += wave; p.armB.sz -= wave;
    p.headPitch = -0.15 * up; p.mouth = up > 0.5 ? 'o' : 'smile';
    return { p, up, wave };
  }
  function teacherPose(t) {
    const p = basePose(); p.eyes = blink(t, 1);
    const [x, z] = [-1.15, -2.3];
    const write = K(t, [[12.05, 0], [12.3, 1], [12.75, 1], [12.95, 0]]);
    Object.assign(p, { x, z, rotY: lerpAngle(0.25, PI - 0.25, write) });
    p.headYaw = t < 11.6 ? 0 : K(t, [[11.6, -0.6], [12.0, 0.6]]) * (1 - write);   // counts the signs
    p.armB = mixArm(mixArm(REST, POINT_B, K(t, [[11.5, 0], [11.7, 1], [12.0, 1], [12.1, 0]])), BOARD_B, write);
    p.armB.sx += 0.08 * Math.sin(t * 18) * write;
    p.mouth = t > 12.95 ? 'smile' : t > 10.4 ? 'o' : 'flat';
    if (t > 13.0) p.headPitch = 0.12 * Math.max(0, Math.sin((t - 13) * 9));      // nods: yep, 5
    return p;
  }
  function workerPose(t) {
    const p = basePose(); p.eyes = blink(t, 6);
    Object.assign(p, { x: OD.guest[0], z: OD.guest[1] - 0.05, rotY: PI, y: seatY(OD.seat), footFwd: 0.42, lean: 0.12 });
    const typing = (t > 13.9 && t < 15.2) || (t > 16.5 && t < 17.2);
    p.armA = { ...TYPE_A }; p.armB = { ...TYPE_B };
    if (typing) { p.armA.sx += 0.08 * Math.sin(t * 30); p.armB.sx += 0.08 * Math.sin(t * 30 + 1.7); }
    const proud = K(t, [[15.3, 0], [15.6, 1], [15.9, 1], [16.15, 0]]);
    p.armB = mixArm(p.armB, A(-1.2, 0.2, -1.9, -0.2), proud);                     // a proud fist
    const cheer = K(t, [[17.4, 0], [17.8, 1]]);
    p.armA = mixArm(p.armA, CHEER_A, cheer); p.armB = mixArm(p.armB, CHEER_B, cheer);
    p.armA.sz += 0.15 * Math.sin(t * 9) * cheer; p.armB.sz += 0.15 * Math.sin(t * 9 + 1) * cheer;
    p.lean = lerp(0.12, -0.05, cheer); p.headPitch = lerp(0.08, -0.15, cheer);
    p.mouth = cheer > 0.4 || proud > 0.4 ? 'o' : 'flat';
    return p;
  }
  function doorQueue(t, e, i) { // S5: the PULL door — walk up, push, bonk, step aside, scratch head
    if (i >= 5) return null;
    const ti = 24.3 + i * 0.95;
    const wait = [1.35 + i * 0.5, -1.45], doorSpot = [0.62, -2.42], aside = [-0.35 - i * 0.42, -1.75 + (i % 2) * 0.35];
    const p = basePose(); p.eyes = blink(t, i + 7); p.y = SH; p.floor = SH;
    const go = K(t, [[ti, 0], [ti + 0.38, 1]], (u) => u), leave = K(t, [[ti + 0.85, 0], [ti + 1.35, 1]], (u) => u);
    // queue shuffles left as the people in front take their turn
    const wx = Math.max(1.35, wait[0] - 0.5 * Math.max(0, Math.min(i, Math.floor((t - 24.3) / 0.95 + 1)))) ;
    let x = lerp(wx, doorSpot[0], go), z = lerp(wait[1], doorSpot[1], go);
    x = lerp(x, aside[0], leave); z = lerp(z, aside[1], leave);
    p.x = x; p.z = z; p.dist = (go + leave) * 1.4 + t * 0.02; p.speed = (go > 0.02 && go < 0.98) || (leave > 0.02 && leave < 0.98) ? 1.2 : 0;
    p.rotY = leave > 0.05 ? (leave < 0.95 ? -PI / 2 - 0.4 : 0.25) : go > 0.05 ? PI : -PI / 2;
    const push = K(t, [[ti + 0.38, 0], [ti + 0.5, 1], [ti + 0.62, 1], [ti + 0.8, 0]]);
    const bonk = bell(t - ti - 0.6, 0.07);
    p.armA = mixArm(REST, PUSH_A, push); p.armB = mixArm(REST, PUSH_B, push); p.lean = 0.15 * push - 0.25 * bonk; p.z += 0.12 * bonk;
    p.headPitch = -0.35 * bonk;
    const scratch = leave > 0.95 ? K(t, [[ti + 1.35, 0], [ti + 1.6, 1]]) : 0;
    if (scratch > 0) { p.armB = mixArm(REST, SCRATCH_B, scratch); p.armB.el += 0.25 * Math.sin(t * 16 + i) * scratch; p.headRoll = 0.15; }
    p.mouth = bonk > 0.3 || scratch > 0.5 ? 'o' : 'flat';
    if (t > 28.2) { p.headYaw = 0.5; }                                            // everyone stares at the door
    return { p, bonk };
  }
  function roofCrowd(t, e, i, cam) { // S6/S11: people on the roof looking at the sky / the rocket
    const spots = cam === 'sky' ? [[-13.6, 10.4, PI + 0.15], [-10.6, 10.0, PI - 0.2], [-12.2, 9.2, PI]] : [[-8.5, 10.6, PI / 2], [-8.4, 12.4, PI / 2], [-8.6, 14.2, PI / 2], [-9.4, 11.4, PI / 2]];
    if (i >= spots.length) return null;
    const [x, z, r] = spots[i];
    const p = basePose(); p.eyes = blink(t, i); p.y = ROOF_Y; p.floor = ROOF_Y; p.x = x; p.z = z; p.rotY = r + (e.seed - 0.5) * 0.2;
    if (cam === 'sky') {
      p.headPitch = -0.55; p.headYaw = 0.25 * Math.sin(t * 0.7 + i);
      if (i !== 1) { p.armB = mixArm(REST, UP_B, K(t, [[30.2 + i * 0.4, 0], [30.6 + i * 0.4, 1]])); }
      else { p.armB = mixArm(REST, SCRATCH_B, K(t, [[31.4, 0], [31.8, 1]])); p.armB.el += 0.25 * Math.sin(t * 16); }
      return p;
    }
    const h = rocketH(t);
    p.headPitch = lerp(0, -0.6, clamp(h / 120));
    const land = K(t, [[LIFT + 4.4, 0], [LIFT + 4.8, 1]]);
    if (i % 2 === 0) p.armB = mixArm(mixArm(REST, UP_B, K(t, [[LIFT + 0.6 + i * 0.2, 0], [LIFT + 1.0 + i * 0.2, 1]])), CHEER_B, land);
    else p.armB = mixArm(REST, CHEER_B, land);
    p.armA = mixArm(REST, CHEER_A, land);
    p.y = ROOF_Y + land * Math.max(0, Math.sin((t - LIFT - 4.4) * 7 + i)) * 0.12;
    p.mouth = land > 0.4 ? 'o' : 'flat';
    return p;
  }
  function garyRemote(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: 0.42, z: 0.4, rotY: faceToward(0.42, 0.4, 0.15, 2.45) + 0.4 });
    p.armB = PHONE_B; p.armA = A(-0.3, 0.2, -1.4, 0.4);
    const pick = K(t, [[37.0, 0], [37.3, 1]]);
    p.headYaw = K(t, [[35.6, 0], [36.0, 0.55], [36.6, 0.55], [36.9, 0]]) + 0.6 * pick;   // glances at the TV, then turns to it
    p.mouth = pick > 0.5 ? (Math.sin(t * 11) > 0 ? 'o' : 'smile') : 'flat';
    p.armA = mixArm(p.armA, A(-1.7, 0.4, -0.3, 0), K(t, [[37.4, 0], [37.7, 1]]));    // waves at Mom
    p.armA.sz += 0.25 * Math.sin(t * 10) * K(t, [[37.6, 0], [37.8, 1]]);
    return p;
  }
  function parkGuyPose(t) {
    const B = SD.bench, p = basePose(); p.eyes = blink(t, 4);
    const stand = K(t, [[43.0, 0], [43.5, 1]]);
    Object.assign(p, { x: lerp(B[0] - 0.55, B[0] + 0.5, stand), z: lerp(B[1] + 0.02, B[1] + 0.7, stand), rotY: lerp(0, 0.25, stand), y: lerp(seatY(0.475), 0, stand), footFwd: 0.42 * (1 - stand) });
    p.dist = stand * 1.2; p.speed = stand > 0.05 && stand < 0.95 ? 1 : 0;
    const snatch = t > 41.85;
    p.armB = snatch ? mixArm(SNACK_B, SHRUG_B, K(t, [[42.1, 0], [42.4, 1]])) : SNACK_B; p.armA = snatch ? mixArm(REST, SHRUG_A, K(t, [[42.1, 0], [42.4, 1]])) : REST;
    if (stand > 0.9) { p.armB = mixArm(SHRUG_B, SCRATCH_B, K(t, [[43.6, 0], [43.9, 1]])); p.armB.el += 0.25 * Math.sin(t * 16); p.armA = REST; }
    p.headPitch = t < 41.6 ? 0.35 : -0.25 * K(t, [[41.7, 0], [42.0, 1]]);
    p.headYaw = t > 43.6 ? -0.75 : 0;
    p.mouth = snatch ? 'o' : 'flat';
    return p;
  }
  function crowAt(t, i) { // crows: hop in sync toward the bench; #0 snatches the sandwich; the rest take the bench
    const B = SD.bench, c = crows[i];
    const start = [B[0] - 1.7 + i * 0.55, B[1] + 1.6 + (i % 2) * 0.45];
    const benchSpot = [B[0] - 0.9 + i * 0.36, B[1] - 0.02];
    const hops = Math.min(4, Math.max(0, Math.floor((t - 39.8) / 0.45)));
    const hp = (t - 39.8) / 0.45 - hops, inHop = t > 39.8 && hops < 4;
    let x = start[0], z = start[1] - hops * 0.22 - (inHop ? 0.22 * smooth(hp) : 0), y = inHop ? 0.12 * Math.sin(PI * hp) : 0, ry = PI, fl = inHop ? 0.4 : 0;
    if (i === 0) {
      const hand = parkGuy.root.visible ? handWorld(parkGuy, 1).sub(new THREE.Vector3(...OFF.sub)) : new THREE.Vector3(B[0] - 0.4, 0.9, B[1] + 0.3);
      const grab = K(t, [[41.5, 0], [41.85, 1]], (u) => u), away = K(t, [[41.95, 0], [44.4, 1]], (u) => u);
      if (grab > 0) { x = lerp(x, hand.x, grab); y = lerp(y, hand.y - 0.2, grab); z = lerp(z, hand.z + 0.05, grab); fl = 1; ry = faceToward(start[0], start[1], hand.x, hand.z); }
      if (away > 0) { x = lerp(hand.x, B[0] + 5.5, away); y = lerp(hand.y - 0.2, 3.4, smooth(away)); z = lerp(hand.z, B[1] - 4, away); fl = 1; ry = faceToward(hand.x, hand.z, B[0] + 5.5, B[1] - 4); }
      if (t > 41.85) { sandwich.visible = true; sandwich.position.set(x + OFF.sub[0], y + 0.06 * 1.15, z + 0.14); }
    } else {
      const take = K(t, [[42.6 + i * 0.12, 0], [43.1 + i * 0.12, 1]], (u) => u);
      if (take > 0) { x = lerp(x, benchSpot[0], take); z = lerp(z, benchSpot[1], take); y = lerp(y, 0.475, take) + 0.25 * Math.sin(PI * take); fl = take < 1 ? 1 : 0; ry = take > 0.98 ? 0 : faceToward(start[0], start[1], benchSpot[0], benchSpot[1]); }
      if (take >= 1) { c.head.rotation.y = 0.4 * Math.sin(t * 2 + i); }
    }
    c.g.position.set(x, y, z); c.g.rotation.y = ry; c.flap(fl, t + i); c.g.visible = true;
    c.head.rotation.x = t < 41.4 && !inHop ? 0.25 * Math.max(0, Math.sin(t * 6 + i)) : 0;   // pecking
  }
  const DOGV = 1.05, WALK0 = 44.8, SNIFF = 47.3;
  const walkX = (t) => -2.2 + DOGV * Math.max(0, Math.min(t, SNIFF) - WALK0);
  function walkerPose(t) {
    const p = basePose(); p.eyes = blink(t, 8); p.y = SW_H; p.floor = SW_H;
    const x = walkX(t) - 1.25;
    const sniff = K(t, [[SNIFF + 0.7, 0], [SNIFF + 1.2, 1]]);
    Object.assign(p, { x: lerp(x, HYD[0] + 0.05, sniff), z: lerp(-1.05, HYD[1] - 0.45, sniff), rotY: lerpAngle(PI / 2, 0.15, sniff), dist: Math.max(0, Math.min(t, SNIFF) - WALK0) * DOGV + sniff * 0.5, speed: t < SNIFF || (sniff > 0.05 && sniff < 0.95) ? DOGV : 0 });
    p.lean = 0.85 * sniff; p.crouch = 0.12 * sniff; p.headPitch = 0.2 * sniff + 0.05; p.mouth = 'o';
    p.armA = A(-0.3, 0.15, -1.6, 0.6); p.armB = A(-0.3, 0.15, -1.6, -0.6);           // "paws" up, like a good boy
    if (sniff > 0.5) p.headYaw = 0.2 * Math.sin(t * 9);
    return p;
  }
  function leaderPose(t, i) {
    const L = LEAD[i], Rr = WD.ring, p = basePose(); p.eyes = blink(t, i + 1); p.glasses = !!L.glasses;
    p.x = Math.sin(L.a) * Rr; p.z = Math.cos(L.a) * Rr; p.rotY = L.a + PI;
    const k = Math.floor((t - 50.3) / 0.3), myTurn = k >= 0 && k < 9 && k % 6 === i;
    p.armB = myTurn ? mixArm(REST, POINT_B, clamp(((t - 50.3) / 0.3 - k) * 4)) : REST;
    p.headPitch = -0.05; p.lean = 0.12;
    const shrug = K(t, [[53.15, 0], [53.4, 1], [53.9, 1], [54.1, 0]]), clap = K(t, [[54.1, 0], [54.3, 1]]);
    p.armA = mixArm(REST, SHRUG_A, shrug); p.armB = mixArm(p.armB, SHRUG_B, shrug);
    if (clap > 0) { const c = 0.18 * Math.max(0, Math.sin((t - 54) * 18 + i)); p.armA = mixArm(p.armA, { ...CLAP_A, sz: CLAP_A.sz + c }, clap); p.armB = mixArm(p.armB, { ...CLAP_B, sz: CLAP_B.sz + c }, clap); }
    p.mouth = shrug > 0.4 ? 'o' : clap > 0.5 ? 'smile' : 'flat';
    return p;
  }
  function sciPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    Object.assign(p, { x: PD.speaker[0] - 0.15, z: PD.speaker[1] + 0.05, y: 0.25, floor: 0.25, rotY: 0.12 });
    const turn = K(t, [[61.6, 0], [61.9, 1], [62.9, 1], [63.2, 0]]);
    p.rotY = lerpAngle(0.12, 1.2, turn); p.armB = mixArm(TALK_B, POINT_B, turn);
    p.armB.sx += 0.1 * Math.sin(t * 5) * (1 - turn);
    const shrug = K(t, [[63.9, 0], [64.2, 1], [65.2, 1], [65.5, 0]]);
    p.armA = mixArm(REST, SHRUG_A, shrug); p.armB = mixArm(p.armB, SHRUG_B, shrug);
    p.mouth = Math.sin(t * 10) > 0.1 && t < 63.8 ? 'o' : 'smile'; p.headRoll = 0.12 * shrug;
    return p;
  }
  function reporterPose(t, i) {
    if (i >= 12) return null;
    const row = PD.rows[Math.floor(i / 6)], sx = PD.seats[i % 6];
    const p = basePose(); p.eyes = blink(t, i); Object.assign(p, { x: sx, z: row + 0.05, rotY: PI, y: seatY(0.45), footFwd: 0.42 });
    const cheer = K(t, [[63.9 + (i % 4) * 0.1, 0], [64.3 + (i % 4) * 0.1, 1]]);
    p.armA = mixArm(A(-0.6, 0.1, -1.2, 0.4), CHEER_A, cheer); p.armB = mixArm(A(-0.6, 0.1, -1.2, -0.4), CHEER_B, cheer);
    p.headYaw = 0.15 * Math.sin(t + i); return p;
  }
  function garyPose(t) { // 007's fitted-sheet performance (tb timeline)
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: 0.55, z: -1.15, rotY: faceToward(0.55, -1.15, 1.6, 1.3) - 0.35 });
    const fold = (a) => K(t, [[a, 0], [a + 0.45, 1], [a + 0.8, 1], [a + 1.15, 0]]);
    const f = Math.max(fold(50.6), fold(51.9), fold(53.1));
    const wad = K(t, [[54.1, 0], [54.6, 1]]), toss = K(t, [[55.0, 0], [55.35, 1]]);
    const spread = mixArm(SHEET_A, A(-1.0, 0.1, -0.8, 0.3), f), spreadB = mixArm(SHEET_B, A(-1.0, 0.1, -0.8, -0.3), f);
    p.armA = mixArm(spread, A(-0.8, 0.05, -1.4, 0.6), wad); p.armB = mixArm(spreadB, A(-0.8, 0.05, -1.4, -0.6), wad);
    if (toss > 0) { p.armB = mixArm(p.armB, A(-1.4, 0.2, -0.2, 0), toss); p.armA = mixArm(p.armA, REST, toss); }
    p.headPitch = lerp(0.3, 0.1, wad) - 0.05 * f; p.headYaw = K(t, [[55.6, 0], [56.0, 0.35]]);
    p.mouth = t > 52.9 && t < 53.8 ? 'o' : 'flat';
    return p;
  }

  // traffic kinematics (local city coords)
  const crossX = (c, t) => { const xT = c.dir > 0 ? -0.75 + 9 * c.j : 3 - 9 * c.j; if (t < T_RED) return xT - c.dir * 11 * (T_RED - t); const u = Math.min(t - T_RED, 0.5); return xT + c.dir * 11 * (u - (u * u) / (2 * 0.5)); };
  const QUEUE = [{ z0: 1.6, go: T_RED + 0.15, stop: -1.15 }, { z0: 6.2, go: T_RED + 0.35, stop: 2.8 }, { z0: 10.8, go: T_RED + 0.55, stop: 6.75 }];
  const queueZ = (q, t) => { if (t < q.go) return q.z0; const s = Math.sqrt((2 * (q.z0 - q.stop)) / 9), u = t - q.go; if (u < s) return q.z0 - 4.5 * u * u; return q.stop + 0.15 * Math.sin(Math.min(1, (u - s) / 0.25) * PI); };
  const impact = (q) => q.go + Math.sqrt((2 * (q.z0 - q.stop)) / 9);

  // ---------------------------------------------------------------- per-frame update
  let lastSet = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== lastSet) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; lastSet = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = S === 'bed' ? 1.4 : S === 'war' ? 0.8 : 0.4;
    hide(); sheet.visible = false; sandwich.visible = false; leash.visible = false;
    crows.forEach((c) => (c.g.visible = false)); dog.g.visible = false;
    qs.forEach((s) => (s.material.opacity = 0)); pf.forEach((s) => (s.material.opacity = 0));

    if (S === 'street') {
      const center = shot.cam === 'street' ? [-20, -1.5] : [0.6, -1.8];
      street.aimSun(center[0], center[1], 9); street.setSeason('autumn', t, center);
      if (shot.cam === 'street') extras.forEach((e, i) => put(e, 'street', streetCrowd(t, e, i)));
      else {
        let bonk = 0;
        extras.forEach((e, i) => { const r = doorQueue(t, e, i); if (r) { put(e, 'street', r.p); bonk = Math.max(bonk, r.bonk); } });
        leaf.rotation.y = 0.03 * bonk * Math.sin(t * 60); leaf.position.z = 0.02 - 0.015 * bonk;
      }
    } else if (S === 'cls') {
      cls.setBoard(''); boardM.map = boardStates[t < 12.6 ? 0 : 1];
      kids.forEach((k, i) => { const r = kidPose(t, i); put(k, 'cls', r.p, KS); k.sign.visible = r.up > 0.05; k.sign.position.y = lerp(1.2, 1.92, r.up); k.sign.rotation.z = r.wave * 0.6; });
      put(teacher, 'cls', teacherPose(t));
    } else if (S === 'office') {
      put(worker, 'office', workerPose(t));
      const n = Math.floor((t - 13.9) / 0.2) + 1;
      screenM.map = t < 16.2 ? pwTex[t < 13.9 ? 0 : t < 15.3 ? clamp(n, 0, 6) : 7] : scamTex[t < 16.5 ? 0 : t < 17.15 ? clamp(Math.floor((t - 16.5) / 0.15) + 1, 1, 4) : 5];
      screenM.needsUpdate = true;
      const age = t - 17.3;
      billSeeds.forEach((s, i) => {
        const b = age - s[0] * 1.3;
        if (b < 0) { bills.setMatrixAt(i, hidden); return; }
        V3.set(0.15 + (s[1] - 0.5) * 0.5 + (s[1] - 0.5) * b * 1.2, 1.13 + b * (1.0 + s[2]) - 0.25 * b * b, -0.86 + b * (1.4 + s[3] * 1.2));
        Q4.setFromEuler(E3.set(t * (3 + s[4] * 5) + i, t * 2 + i, i * 0.7)); S3.set(1, 1, 1);
        M4.compose(V3, Q4, S3); bills.setMatrixAt(i, M4);
      });
      bills.instanceMatrix.needsUpdate = true;
    } else if (S === 'city') {
      const cam = shot.cam;
      queue.forEach((c) => (c.g.visible = cam === 'traffic')); cross.forEach(({ c }) => (c.g.visible = cam === 'traffic'));
      jets.forEach((j) => (j.g.visible = cam === 'sky')); writer.visible = cam === 'sky'; puffs.visible = cam === 'sky';
      rocket.visible = smoke.visible = cam === 'rocket'; launchLight.intensity = 0;
      if (cam === 'traffic') {
        city.setShadowFocus(1, -2, 22); city.setTime({ day: 1, power: 1 });
        city.setSignal(t < T_RED - 0.3 ? 'green' : t < T_RED ? 'yellow' : 'red');
        const lead = QUEUE[0], hitT = impact(lead), hit = t > hitT;
        cross.forEach((cc) => {
          const { c, z, dir } = cc; let x = crossX(cc, t), zz = z, ry = dir > 0 ? PI / 2 : -PI / 2;
          if (cc.lane === 0 && cc.j === 0 && hit) { const k = smooth((t - hitT) / 0.3); zz = z - 0.4 * k; ry += 0.22 * k; }
          c.g.position.set(x, 0, zz); c.g.rotation.y = ry;
        });
        queue.forEach((c, k) => {
          const q = QUEUE[k], z = queueZ(q, t); c.g.position.set(2, 0, z); c.g.rotation.y = PI;
          const jolt = bell(t - impact(q), 0.08); c.body.rotation.x = -0.06 * jolt; c.body.position.y = 0.03 * jolt;
          c.setLights(0, t > impact(q) + 0.3 ? (Math.sin(t * 9) > 0 ? 1 : 0.1) : 0.15);
        });
      } else {
        city.setShadowFocus(-12, 12, 16); city.setTime({ day: 1, power: 1 }); city.setSignal('green');
        cityFog.color.setHex(0xa9c8ec); cityFog.near = 250; cityFog.far = 1400;
        extras.forEach((e, i) => { const p = roofCrowd(t, e, i, cam); if (p) put(e, 'city', p); });
      }
      if (cam === 'sky') {
        let n = 0;
        // circling jets (two rings above the "?"), each dragging a short contrail
        jets.forEach(({ g, i }) => {
          const ring = i % 2, rad = ring ? 260 : 190, alt = ROOF_Y + (ring ? 420 : 360), w = (ring ? -1 : 1) * (0.32 + (i % 3) * 0.03), ph = i * 0.79;
          const at = (tt) => [Q.c[0] + Math.cos(w * tt + ph) * rad, alt + 18 * Math.sin(i * 1.7 + tt * 0.5), Q.c[2] - 260 + Math.sin(w * tt + ph) * rad * 0.8];
          const P0 = at(t), P1 = at(t + 0.05);
          g.position.set(...P0); g.lookAt(P1[0], P1[1], P1[2]);
          for (let k = 0; k < 26; k++) { const tt = t - 0.12 - k * 0.11, Pk = at(tt), r = 2.6 + k * 0.28; V3.set(...Pk); S3.set(r, r, r); M4.compose(V3, Q4.identity(), S3); puffs.setMatrixAt(n++, M4); }
        });
        // the skywriter draws a giant "?" between 29.4 and 33.4, then flies off
        const u = clamp((t - 29.4) / 4.0), [qx, qy, ang] = qAt(u);
        const wp = (x, y) => [Q.c[0] + x * Q.s, Q.c[1] + y * Q.s, Q.c[2]];
        const [wx, wy, wz] = u < 1 ? wp(qx, qy) : wp(qPts.at(-1)[0] + (t - 33.4) * 0.9, qPts.at(-1)[1] - (t - 33.4) * 0.4);
        writer.position.set(wx, wy, wz); writer.lookAt(wx + Math.cos(ang) * 10, wy + Math.sin(ang) * 10, wz);
        for (let k = 0; k < 148; k++) {
          const uk = k / 147;
          if (uk > u || t < 29.4) { puffs.setMatrixAt(n++, hidden); continue; }
          const [x, y] = qAt(uk), r = 6.5 + 1.4 * Math.sin(k * 1.7) + 1.5 * clamp((u - uk) * 4);
          V3.set(...wp(x, y)); S3.set(r, r, r); M4.compose(V3, Q4.identity(), S3); puffs.setMatrixAt(n++, M4);
        }
        // the dot of the "?" pops at 33.6
        const dot = K(t, [[33.5, 0], [33.8, 1]]);
        for (let k = 0; k < 12; k++) { const a = k * 2.1, r = (5 + (k % 3)) * dot; V3.set(...wp(Math.cos(a) * 0.07, -0.58 + Math.sin(a) * 0.07)); S3.set(r, r, r); M4.compose(V3, Q4.identity(), S3); puffs.setMatrixAt(n++, dot > 0 ? M4 : hidden); }
        puffs.count = n; puffs.instanceMatrix.needsUpdate = true;
      }
      if (cam === 'rocket') {
        const h = rocketH(t);
        rocket.position.set(ROCKET[0], h + 2, ROCKET[2]);
        const ign = clamp((t - (LIFT - 0.2)) / 0.4) * (1 - K(t, [[LIFT + 4.35, 0], [LIFT + 4.6, 1]]));
        flame.visible = flameCore.visible = ign > 0.02; flame.scale.set(1, 0.7 + 0.3 * ign + 0.08 * Math.sin(t * 40), 1);
        launchLight.position.set(ROCKET[0], h + 5, ROCKET[2] + 20); launchLight.intensity = 40 * ign;
        smokeSeeds.forEach((s, i) => {
          const landing = i >= SMOKE / 2, birth = landing ? LIFT + 3.4 + ((i - SMOKE / 2) / (SMOKE / 2)) * 1.1 : LIFT - 0.2 + (i / (SMOKE / 2)) * 1.6;
          if (t < birth) { smoke.setMatrixAt(i, hidden); return; }
          const age = t - birth, hy = landing ? 3 : Math.max(2, rocketH(birth) - 6), sp = landing ? 14 : 9;
          V3.set(ROCKET[0] + (s[0] - 0.5) * (8 + age * sp), Math.min(hy, 30) + age * (landing ? 0.8 : 1.6), ROCKET[2] + (s[1] - 0.5) * (8 + age * sp));
          const r = (landing ? 3 + age * 2.5 + s[2] * 3 : 4 + age * 5 + s[2] * 4) * (landing ? 1 : 1 - 0.9 * smooth((age - 1.8) / 1.6)); S3.set(r, r * 0.85, r); M4.compose(V3, Q4.identity(), S3); smoke.setMatrixAt(i, M4);
        });
        smoke.instanceMatrix.needsUpdate = true;
      }
    } else if (S === 'kit') {
      put(gary, 'kit', garyRemote(t));
      tvM.map = t < 37.0 ? tvCall[Math.floor((t - 34.2) / 0.45) % 4] : tvMom; tvM.needsUpdate = true;
    } else if (S === 'sub') {
      if (shot.cam === 'crows') {
        sub.aimSun(SD.bench[0], SD.bench[1], 8);
        put(parkGuy, 'sub', parkGuyPose(t));
        if (t < 41.85) { const h = handWorld(parkGuy, 1); sandwich.visible = true; sandwich.position.set(h.x, h.y + 0.02, h.z + 0.05); }
        crows.forEach((c, i) => crowAt(t, i));
      } else {
        sub.aimSun(walkX(t), -1, 8);
        put(walker, 'sub', walkerPose(t));
        const dx = walkX(t), sniff = K(t, [[SNIFF, 0], [SNIFF + 0.5, 1]]);
        dog.g.visible = true; dog.g.position.set(Math.min(dx, HYD[0] - 0.55), SW_H, lerp(-1.0, -0.6, sniff)); dog.g.rotation.y = lerpAngle(PI / 2, PI / 2 + 0.5, sniff);
        dog.update(t, t < SNIFF ? 1 : 0); dog.head.rotation.x = 0.55 * sniff + 0.08 * Math.sin(t * 14) * sniff;
        // leash: from the dog's mouth to the man's collar (a sagging curve)
        sub.root.updateMatrixWorld(true); walker.root.updateMatrixWorld(true);
        const mouth = new THREE.Vector3(0, -0.04, 0.17); dog.head.localToWorld(mouth);
        const neck = new THREE.Vector3(0, 0.5, 0.09); walker.spine.localToWorld(neck);
        const mid = mouth.clone().lerp(neck, 0.5); mid.y -= 0.22;
        leash.geometry.dispose(); leash.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(mouth, mid, neck), 16, 0.008, 5, false); leash.visible = true;
      }
    } else if (S === 'war') {
      if (war.setGlobeLight) war.setGlobeLight(0.35);
      war.globe.g.visible = false;
      const k = Math.floor((t - 50.3) / 0.3) + 1;
      tttM.map = t < 50.3 ? tttStates[0] : t < 53.0 ? tttStates[clamp(k, 0, 9)] : t < 53.9 ? tttStates[10] : tttStates[11 + clamp(Math.floor((t - 54.0) / 0.25) + 1, 0, 5)];
      tttM.needsUpdate = true; ttt.rotation.y = 0.04 * Math.sin(t * 0.8);
      leaders.forEach((L, i) => put(L, 'war', leaderPose(t, i)));
    } else if (S === 'press') {
      press.setFlashes(t, t > 62.6 ? 1.6 : 0.4);
      curveM.map = curveStates[t < 62.6 ? 0 : 1]; curveM.needsUpdate = true;
      put(sci, 'press', sciPose(t));
      extras.forEach((e, i) => { const p = reporterPose(t, i); if (p) put(e, 'press', p); });
    } else if (S === 'bed') {
      const tb = t - TS; put(gary, 'bed', garyPose(tb));
      bed.setSeason('summer', t); bed.lights.moon.intensity = 1.2;
      const hA = handWorld(gary, -1), hB = handWorld(gary, 1);
      const crumple = K(tb, [[54.1, 0], [54.6, 1]]), toss = K(tb, [[55.05, 0], [55.6, 1]]);
      const mid = new THREE.Vector3().addVectors(hA, hB).multiplyScalar(0.5);
      const bedSpot = new THREE.Vector3(-0.25 + OFF.bed[0], 0.72, -1.45);
      const ball = mid.clone().lerp(bedSpot, toss); ball.y += Math.sin(PI * toss) * 0.35;
      sheet.visible = true; updateSheet(t, hA, hB, crumple, ball);
    }

    // camera (local → world)
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4, o = OFF[S];
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    let Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (c.ease === 'track') { const x = walkX(t) - 0.6 + 0.5 * K(t, [[SNIFF, 0], [SNIFF + 1.2, 1]]); P = [x + 0.1 + o[0], 1.25, 4.4]; Aim = [x - 0.25 + o[0], 1.15, -1.0]; }
    if (c.ease === 'rocket') { const h = rocketH(t); Aim = [ROCKET[0], Math.max(ROOF_Y + 22, h * 0.8 + 24), ROCKET[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
