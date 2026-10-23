// VIDEO 011 — "The story of Elon Musk"  (tone: BIOGRAPHY — docs/BIOGRAPHY.md)
// Narrated by script.json → tools/biography.py → story.json (shot times follow the narration). Every performance below is
// authored in SHOT-LOCAL time: lt = seconds since the shot started, L = shot length, u = lt / L.
// Living person: birth → today, factual and neutral. Sets: engine/sets/tech.js (space, launch site, factory, suburb, campus,
// flight) + capital.js buildRoom (1980s bedroom, 1990s office) + street.js (Twitter → X) + mars.js (the ending).
// Cameo: Gary (002) in the beach crowd at the booster catch.
//
// Facts (checked Oct 23 2026): born June 28 1971, Pretoria; first computer ~10 (VIC-20, 1981); sold Blastar at 12 for ~$500
// (Biography.com); moved to Canada at 17 (June 1989); Stanford PhD 1995, left after two days; Zip2 with Kimbal (slept in the
// office, showered at the YMCA), sold to Compaq Feb 1999 for $307M; X.com → PayPal, eBay bought it for $1.5B (2002); SpaceX
// 2002; Falcon 1 failed 2006, 2007, Aug 2008, reached orbit Sept 28 2008 (first privately developed liquid-fuel rocket);
// NASA $1.6B CRS contract Dec 2008; Tesla near bankruptcy 2008; Model S 2012; Cybertruck (reveal 2019, deliveries 2023);
// first orbital-class booster landing Dec 21 2015; Falcon Heavy + Roadster/Starman Feb 6 2018; Crew Dragon Demo-2 May 30–31
// 2020; bought Twitter Oct 2022 for $44B (walked into HQ carrying a sink), renamed X 2023; first booster catch Oct 13 2024;
// Starlink ≈ 11,150 in orbit (KeepTrack, Oct 21 2026); still the world's richest person (Forbes, Oct 2026).
import * as THREE from 'three';
import { K, clamp, lerp, smooth, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, makeSleeper } from '@engine/rig.js';
import { makeBabyBundle } from '@engine/props.js';
import { buildSpace, buildLaunch, buildFactory, buildSuburb, buildCampus, buildFlight, makeFalcon, makeSuperHeavy, makeDragon, makeISS,
  makeRoadster, makeModelS, makeCybertruck, makeJet, makeCRT, makeSink, makeStarship, makeSpritePool, DIMS as TD } from '@engine/sets/tech.js';
import { makePhone } from '@engine/props.js';
import { buildRoom } from '@engine/sets/capital.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildMars, DIMS as MD } from '@engine/sets/mars.js';

const PI = Math.PI;
const OFF = { space: [0, 0, 0], suburb: [6000, 0, 0], room80: [7000, 0, 0], campus: [8000, 0, 0], office: [9000, 0, 0], factory: [10000, 0, 0],
  launch: [14000, 0, 0], flight: [20000, 0, 0], street: [26000, 0, 0], mars: [30000, 0, 0] };
const FAR = { space: 6000, suburb: 700, room80: 40, campus: 700,   // > sky-dome radius + camera offset, or the dome clips to black
  office: 40, factory: 140, launch: 3600, flight: 3000, street: 400, mars: 900 };
const FILL = { space: 0.2, suburb: 0.3, room80: 0.9, campus: 0.3, office: 1.2, factory: 0.4, launch: 0.3, flight: 0.2, street: 0.35, mars: 0.3 };
const R = TD.space.R;

// camera coords LOCAL to the set (OFF added at runtime); p/a start → end over the shot, fov, amp (handheld drift)
export const CAMS = {
  earthOpen: { p: [[0, 140, 1350], [0, 120, 1150]], a: [[0, 40, 0], [0, 40, 0]], fov: 40, amp: 0 },
  birth:     { p: [[-4.6, 1.55, 13.4], [-4.2, 1.48, 12.4]], a: [[-1.6, 1.2, 8.0], [-1.6, 1.18, 8.0]], fov: 42, amp: 0.005 },
  coding:    { p: [[0.98, 1.32, -1.62], [0.92, 1.28, -1.6]], a: [[-0.05, 1.0, -0.45], [-0.05, 1.0, -0.45]], fov: 48, amp: 0.003 },
  blastar:   { p: [[0.0, 1.13, 0.28], [0.0, 1.12, 0.12]], a: [[0.0, 1.11, -1.2], [0.0, 1.11, -1.2]], fov: 40, amp: 0.001 },
  flight:    { p: [[-60, 18, 70], [-40, 14, 74]], a: [[0, 0, 0], [8, 0, 0]], fov: 40, amp: 0.004 },
  campus:    { p: [[2.4, 1.7, 10.5], [1.8, 1.6, 9.0]], a: [[0.2, 1.5, 0], [0.2, 1.5, 0.5]], fov: 46, amp: 0.005 },
  zip2:      { p: [[2.05, 1.85, 1.75], [1.95, 1.8, 1.6]], a: [[-0.4, 0.6, -0.4], [-0.4, 0.6, -0.4]], fov: 54, amp: 0.003 },
  zip2sale:  { p: [[0.45, 1.65, 1.85], [0.45, 1.62, 1.7]], a: [[0.45, 1.45, -1.0], [0.45, 1.45, -1.0]], fov: 54, amp: 0.004 },
  paypal:    { p: [[0.0, 1.13, 0.3], [0.0, 1.12, 0.14]], a: [[0.0, 1.12, -1.2], [0.0, 1.12, -1.2]], fov: 40, amp: 0.001 },
  spacex:    { p: [[-24.5, 2.1, 3.2], [-23.5, 2.0, 2.6]], a: [[-13, 2.4, -4.5], [-14, 2.4, -4.5]], fov: 46, amp: 0.005 },
  boom:      { p: [[140, 6, 160], [134, 6, 152]], a: [[0, 32, 0], [0, 38, 0]], fov: 40, amp: 0.006 },
  broke:     { p: [[4.4, 1.25, 13.6], [3.9, 1.2, 13.0]], a: [[0.6, 0.7, 8.0], [0.6, 0.7, 8.0]], fov: 44, amp: 0.003 },
  orbit:     { p: [[60, 2.2, 95], [60, 2.2, 95]], a: [[0, 22, 0], [0, 80, 0]], fov: 44, amp: 0.004 },
  cars:      { p: [[0.3, 2.4, 18.6], [0.3, 2.3, 17.6]], a: [[1.3, 1.3, 8.5], [1.3, 1.3, 8.5]], fov: 46, amp: 0.003 },
  landing:   { p: [[0, 4, 180], [0, 3.5, 170]], a: [[0, 60, 0], [0, 22, 0]], fov: 40, amp: 0.004 },
  roadster:  { p: [[5.5, R + 27.2, 8.5], [-2.5, R + 26.8, 9.5]], a: [[0, R + 23.6, 0], [0, R + 23.6, 0]], fov: 44, amp: 0.002 },
  crew:      { p: [[30, R + 32.5, 34], [26, R + 32, 30]], a: [[0, R + 30.5, 24], [0, R + 30.5, 22]], fov: 46, amp: 0.002 },
  twitter:   { p: [[-1.4, 1.5, 6.2], [-0.6, 1.45, 5.6]], a: [[0.6, 1.6, -1.4], [0.9, 1.6, -1.4]], fov: 46, amp: 0.005 },
  xsign:     { p: [[0.9, 1.6, 6.8], [0.9, 1.7, 6.2]], a: [[0.6, 5.0, -3.0], [0.6, 5.2, -3.0]], fov: 50, amp: 0.004 },
  catch:     { p: [[11.6, 1.0, 273.4], [11.8, 1.05, 273.0]], a: [[15, 60, 0], [15, 54, 0]], fov: 46, amp: 0.004 },
  starlink:  { p: [[-760, 240, 860], [-640, 300, 940]], a: [[0, 0, 0], [0, 0, 0]], fov: 44, amp: 0 },
  mars:      { p: [[-16.0, 5.0, 52.0], [-22.0, 25.0, 64.0]], a: [[16, 17.0, 8], [-1, 4.0, -30.0]], fov: 50, amp: 0.004 },
};

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const TYPE_A = A(-0.85, 0.08, -0.85, 0.35), TYPE_B = A(-0.85, 0.08, -0.85, -0.35);
const CRADLE_A = A(-0.55, 0.1, -1.55, 0.7), CRADLE_B = A(-0.65, 0.05, -1.35, -0.5);
const CHEER = A(-2.75, 0.3, -0.3, 0);
const CARRY_A = A(-0.75, 0.1, -1.0, 0.45), CARRY_B = A(-0.75, 0.1, -1.0, -0.45);   // a box/sink held at the belly
const PRESENT_A = A(-1.3, 0.55, -0.25, 0.1);
const POINT_B = A(-1.5, 0.2, -0.05, 0);
const HEAD_HANDS_A = A(-1.45, 0.15, -2.2, 0.6), HEAD_HANDS_B = A(-1.45, 0.15, -2.2, -0.6);
const WHEEL_A = A(-1.05, 0.1, -0.7, 0.4), WHEEL_B = A(-1.05, 0.1, -0.7, -0.4);
const SIT = { y: -0.22, footFwd: 0.4 };
const shotAt = (shots, t) => shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const Rn0 = rng(303);
  const SHOTS = story.shots;
  const V = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- sets
  const space = buildSpace(studio); space.root.position.set(...OFF.space);
  const suburb = buildSuburb(studio); suburb.root.position.set(...OFF.suburb);
  const room80 = buildRoom(studio); room80.root.position.set(...OFF.room80);
  const campus = buildCampus(studio); campus.root.position.set(...OFF.campus);
  const office = buildRoom(studio); office.root.position.set(...OFF.office);
  const factory = buildFactory(studio); factory.root.position.set(...OFF.factory);
  const launch = buildLaunch(studio); launch.root.position.set(...OFF.launch);
  const flight = buildFlight(studio); flight.root.position.set(...OFF.flight);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const mars = buildMars(studio, {}); mars.root.position.set(...OFF.mars);
  const ROOTS = { space: space.root, suburb: suburb.root, room80: room80.root, campus: campus.root, office: office.root, factory: factory.root, launch: launch.root, flight: flight.root, street: street.root, mars: mars.root };
  const FOGS = { space: null, suburb: suburb.fog, room80: null, campus: campus.fog, office: null, factory: null, launch: launch.fog, flight: flight.fog, street: streetFog, mars: mars.fog };
  // rooms: strip the 1860s dressing (proclamation, quill, flag, portrait, rocker, candle)
  for (const r of [room80, office]) { r.paper.visible = false; r.ink.visible = false; r.flag.g.visible = false; r.portrait.visible = false; r.rocker.visible = false; r.candle.visible = false; r.openBook.visible = false; r.chair.rotation.y = 0; r.sig.visible = false; }
  room80.setWallpaper('#a8743a', '#b8844a'); office.setWallpaper('#d8dcde', '#e4e8ea');

  // ---------------------------------------------------------------- props
  const crt80 = makeCRT(); room80.desk.add(crt80.g); crt80.g.position.set(0, 0.82, -0.02);
  const crt90 = makeCRT(); office.desk.add(crt90.g); crt90.g.position.set(0, 0.82, -0.02);
  const lamp80 = new THREE.PointLight(0xffb070, 2.5, 6, 1.8); lamp80.position.set(-0.8, 1.4, -0.7); room80.root.add(lamp80);
  // the Zip2 office: a mattress on the floor, pizza boxes, a whiteboard, a second desk
  const mattress = mk(new THREE.BoxGeometry(0.95, 0.18, 1.95), mat(0x5a6a8a, 0.95), office.root, -1.5, 0.09, 0.55);
  const pillow = mk(new THREE.BoxGeometry(0.6, 0.12, 0.35), mat(0xe8e4dc, 0.95), office.root, -1.5, 0.24, -0.25);
  const blanketLump = mk(new THREE.BoxGeometry(0.85, 0.22, 1.3), mat(0x8a3a3a, 0.95), office.root, -1.5, 0.24, 0.7);
  const sleeper = makeSleeper({ r: 0.14, skin: 0xe8b996, hair: 0x5a3a24, hairStyle: 'short' }); office.root.add(sleeper.g); sleeper.g.position.set(-1.5, 0.36, -0.12);
  const pizzas = new THREE.Group(); office.root.add(pizzas);
  for (let i = 0; i < 4; i++) { const b = mk(new THREE.BoxGeometry(0.42, 0.05, 0.42), mat(0xd8c49a, 0.9), pizzas, 1.5 + (i % 2) * 0.1, 0.03 + i * 0.05, 1.2); b.rotation.y = i * 0.3; }
  const board = mk(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#f4f6f6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a5ac8'; g.lineWidth = 5; g.strokeRect(40, 60, 120, 70); g.strokeRect(330, 60, 120, 70); g.beginPath(); g.moveTo(160, 95); g.lineTo(330, 95); g.stroke(); g.fillStyle = '#c83a2a'; g.font = 'bold 34px Helvetica, Arial'; g.fillText('MAPS + DIRECTORY', 70, 230); g.fillStyle = '#2a2a2a'; g.font = '26px Helvetica, Arial'; g.fillText('for newspapers', 150, 275); }), roughness: 0.6 }), office.root, -1.0, 1.7, -1.97);
  const check = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.66), new THREE.MeshStandardMaterial({ map: canvasTex(600, 264, (g, w, h) => { g.fillStyle = '#f2f0e4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a7a5a'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#2a2a2a'; g.font = 'bold 26px Helvetica, Arial'; g.fillText('PAY TO THE ORDER OF  ZIP2', 34, 62); g.font = 'bold 60px Helvetica, Arial'; g.fillText('$307,000,000', 34, 150); g.fillStyle = '#4a7a5a'; g.font = '22px Helvetica, Arial'; g.fillText('three hundred seven million dollars', 34, 200); }), roughness: 0.7, side: THREE.DoubleSide }));
  office.root.add(check);
  const sink = makeSink(); scene.add(sink.g);
  // 1980s bedroom: a space-shuttle poster, a model rocket on the shelf, a desk lamp
  const poster = (w, h, draw) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: canvasTex(256, Math.round(256 * h / w), draw), roughness: 0.8 }));
  const shuttle = poster(0.6, 0.85, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0e24'); gr.addColorStop(1, '#2a3a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % w, (i * 97) % (h * 0.7), 2, 2);
    g.fillStyle = '#f2f2f2'; g.beginPath(); g.moveTo(w * 0.5, h * 0.12); g.lineTo(w * 0.62, h * 0.55); g.lineTo(w * 0.76, h * 0.72); g.lineTo(w * 0.24, h * 0.72); g.lineTo(w * 0.38, h * 0.55); g.closePath(); g.fill(); g.fillStyle = '#c86a2a'; g.fillRect(w * 0.44, h * 0.3, w * 0.12, h * 0.42);
    g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(w * 0.4, h * 0.72); g.lineTo(w * 0.5, h * 0.95); g.lineTo(w * 0.6, h * 0.72); g.fill(); g.fillStyle = '#f2c430'; g.font = 'bold 26px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('SPACE SHUTTLE', w / 2, h * 0.08 + 18); });
  shuttle.position.set(-0.9, 1.75, -1.97); room80.root.add(shuttle);
  const galaxy = poster(0.5, 0.5, (g, w, h) => { g.fillStyle = '#05050c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { const a = i * 0.07, r = i * 0.18; g.fillStyle = `rgba(${180 + (i % 70)},${160 + (i % 90)},255,${0.5 + (i % 5) * 0.1})`; g.fillRect(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r * 0.6, 2, 2); } });
  galaxy.position.set(0.9, 1.7, -1.97); room80.root.add(galaxy);
  const modelRocket = new THREE.Group(); room80.desk.add(modelRocket); modelRocket.position.set(-0.62, 0.82, -0.22);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), mat(0xf4f4f2, 0.4), modelRocket, 0, 0.19, 0); mk(new THREE.ConeGeometry(0.03, 0.09, 12), mat(0xc83a2a, 0.5), modelRocket, 0, 0.4, 0);
  for (let i = 0; i < 3; i++) { const f = mk(new THREE.BoxGeometry(0.005, 0.07, 0.05), mat(0xc83a2a, 0.5), modelRocket, Math.cos(i * 2.1) * 0.04, 0.05, Math.sin(i * 2.1) * 0.04); f.rotation.y = -i * 2.1; }
  // office at night: city lights through the window, posters
  const cityNight = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), new THREE.MeshBasicMaterial({ map: canvasTex(256, 340, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1024'); gr.addColorStop(1, '#2a2a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9);
    for (let b = 0; b < 9; b++) { const bx = b * 30 - 6, bh = 80 + r() * 160; g.fillStyle = '#10141e'; g.fillRect(bx, h - bh, 26, bh); for (let y = h - bh + 8; y < h - 6; y += 10) for (let x = bx + 3; x < bx + 24; x += 6) if (r() < 0.45) { g.fillStyle = r() < 0.8 ? '#ffd890' : '#a8d0ff'; g.fillRect(x, y, 3, 4); } } }), toneMapped: false }));
  cityNight.position.set(2.49, 1.65, -0.2); cityNight.rotation.y = -PI / 2; office.root.add(cityNight);
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.04, 0.025), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), 260);
  conf.frustumCulled = false; office.root.add(conf); const CS = Array.from({ length: 260 }, () => [Rn0(), Rn0(), Rn0(), Rn0()]);
  CS.forEach((_, i) => conf.setColorAt(i, new THREE.Color([0xe2574c, 0xf2b632, 0x4f9bd9, 0x58b368, 0xa77bd1, 0xffffff][i % 6])));
  // Twitter HQ: a glass curtain wall + entrance over the market storefront (1355 Market St), a scissor lift for the sign crew
  const hq = new THREE.Group(); hq.position.set(0.15, 0, -2.55); street.root.add(hq);
  const curtain = canvasTex(512, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a5a7a'); gr.addColorStop(0.5, '#5a7a9a'); gr.addColorStop(1, '#2a4060'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(i * 120 - 60, 0); g.lineTo(i * 120 + 20, 0); g.lineTo(i * 120 - 120, h); g.lineTo(i * 120 - 200, h); g.fill(); }
    g.strokeStyle = '#d8dce0'; g.lineWidth = 6; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  mk(new THREE.BoxGeometry(7.3, 9.25, 0.25), new THREE.MeshStandardMaterial({ map: curtain, roughness: 0.15, metalness: 0.5 }), hq, 0, 4.75, 0);
  mk(new THREE.BoxGeometry(2.6, 2.5, 0.1), new THREE.MeshStandardMaterial({ color: 0xa8c8e0, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.75 }), hq, 0.45, 1.37, 0.14);
  mk(new THREE.BoxGeometry(2.8, 0.15, 0.4), mat(0xd8dce0, 0.3, { metalness: 0.6 }), hq, 0.45, 2.7, 0.2);
  const addr = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshStandardMaterial({ map: canvasTex(320, 60, (g, w, h) => { g.fillStyle = '#e8ecef'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2e34'; g.font = 'bold 30px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('1355 MARKET ST', w / 2, 41); }), roughness: 0.5 }));
  addr.position.set(0.45, 3.05, 0.14); hq.add(addr);
  const lift = new THREE.Group(); lift.position.set(2.6, 0.12, -1.6); street.root.add(lift);
  mk(new THREE.BoxGeometry(1.4, 0.4, 0.9), mat(0xf2b632, 0.5), lift, 0, 0.3, 0);
  for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) { const x = mk(new THREE.BoxGeometry(1.5, 0.08, 0.06), mat(0x3a3a3e, 0.5), lift, 0, 0.75 + k * 0.6, sx * 0.4); x.rotation.z = (k % 2 ? 1 : -1) * 0.35; }
  mk(new THREE.BoxGeometry(1.5, 0.12, 1.0), mat(0xf2b632, 0.5), lift, 0, 3.05, 0); for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(1.5, 0.05, 0.05), mat(0xf2b632, 0.5), lift, 0, 4.0, sx * 0.48);
  // hide the old storefront clutter + the street trees in front of the HQ
  street.trees.forEach((tr) => { const x = tr.t.position.x; if (x > -9 && x < 9 && tr.t.position.z < 3) tr.t.visible = false; });
  // the Starship that lands on Mars + the Starlink train
  const ship = makeStarship(); mars.root.add(ship.g); mars.lander.g.visible = false;
  const shipFlame = new THREE.Mesh(new THREE.ConeGeometry(4, 18, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(3), transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false }));
  shipFlame.rotation.x = PI; shipFlame.position.y = -9; ship.g.add(shipFlame);
  const train = space.makeTrain(70, 40, 0.6, -0.4); train.pts.visible = false;
  const crate = mk(new THREE.BoxGeometry(0.55, 0.44, 0.5), mat(0x9a7a50, 0.85), factory.root);
  const backpack = mk(new RoundedBoxGeometryCompat(0.32, 0.4, 0.16), mat(0x2a3a5a, 0.85), scene); backpack.removeFromParent();
  // the Falcon 1 (boom + orbit), the landing booster, the catch booster, the jet, the Roadster, Dragon + ISS, cars
  const f1 = makeFalcon('f1'); launch.root.add(f1.g);
  const f9 = makeFalcon('f9'); launch.root.add(f9.g); f9.upper.visible = false;          // the landing: first stage only
  const sh = makeSuperHeavy(); launch.root.add(sh.g);
  const jet = makeJet(); flight.root.add(jet.g);
  const roadster = makeRoadster(); space.root.add(roadster.g);
  const dragon = makeDragon(); space.root.add(dragon.g);
  const iss = makeISS(); space.root.add(iss.g);
  const swarm = space.makeStarlinkSwarm(1800, 22);
  const modelS = makeModelS(0xc81e1e); factory.root.add(modelS.g);
  const cyber = makeCybertruck(); factory.root.add(cyber.g);
  const roadsterF = makeRoadster(); factory.root.add(roadsterF.g);                          // Tesla's first car, in the dark factory
  // Twitter → X sign on the roof of a storefront (street x≈0, facade at z=-3)
  const signG = new THREE.Group(); signG.position.set(0.6, 5.9, -2.28); street.root.add(signG);   // a wall sign on the market facade (z=-3)
  const birdTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#1d9bf0'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, PI * 2); g.fill(); g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(w * 0.5, h * 0.55, w * 0.22, h * 0.15, -0.3, 0, PI * 2); g.fill(); g.beginPath(); g.arc(w * 0.66, h * 0.4, w * 0.09, 0, PI * 2); g.fill();
    g.beginPath(); g.moveTo(w * 0.74, h * 0.38); g.lineTo(w * 0.84, h * 0.36); g.lineTo(w * 0.74, h * 0.44); g.fill(); g.beginPath(); g.ellipse(w * 0.42, h * 0.48, w * 0.16, h * 0.07, -0.9, 0, PI * 2); g.fill(); });
  const xTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f4f4'; g.lineWidth = 46; g.lineCap = 'square'; g.beginPath(); g.moveTo(w * 0.24, h * 0.22); g.lineTo(w * 0.76, h * 0.78); g.moveTo(w * 0.76, h * 0.22); g.lineTo(w * 0.24, h * 0.78); g.stroke(); });
  const flipper = new THREE.Group(); signG.add(flipper);
  const signFront = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: birdTex, transparent: true, toneMapped: false })); signFront.position.z = 0.06; flipper.add(signFront);
  const signBack = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: xTex, toneMapped: false })); signBack.rotation.y = PI; signBack.position.z = -0.06; flipper.add(signBack);

  // ---------------------------------------------------------------- cast
  const SKIN = 0xeec0a0;
  const kid = makePerson({ skin: SKIN, top: 0x5a8a5a, pants: 0x4a5a7a, hair: 0x8a6a40, hairStyle: 'short', headR: 0.17 });
  const young = makePerson({ skin: SKIN, top: 0x5a7aaa, collar: 0x5a7aaa, pants: 0x3a3a44, hair: 0x5a3a24, hairStyle: 'short', headR: 0.14 });
  const elon = makePerson({ skin: SKIN, top: 0x1c1c20, pants: 0x2a2e3a, shoes: 0x111111, hair: 0x4a3020, hairStyle: 'short', headR: 0.14 });
  const kimbal = makePerson({ skin: 0xe8b996, top: 0x8a4a3a, pants: 0x3a3a44, hair: 0x3a2618, hairStyle: 'messy', headR: 0.14 });
  const maye = makePerson({ skin: 0xf0c8a8, top: 0xd88a3a, pants: 0xd88a3a, hair: 0xe8d8a8, hairStyle: 'bob', dress: 0xd88a3a });
  const errol = makePerson({ skin: 0xe8b996, top: 0x6a5a48, collar: 0xe8e0d0, pants: 0x4a4a52, hair: 0x3a2a1e, hairStyle: 'short', mustache: 0x3a2a1e });
  const starman = makePerson({ skin: 0xf4f4f4, top: 0xf4f4f2, collar: 0x1a1a1a, pants: 0xf4f4f2, shoes: 0x2a2a2a, hair: 0x1a1a1a, hairStyle: 'none' });
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.05, metalness: 0.8 })); starman.head.g.add(helmet); helmet.scale.set(1, 1.08, 1);
  starman.head.eyesOpen.visible = false;
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const Rn = rng(55);
  const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
  const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
  const crowd = Array.from({ length: 22 }, (_, i) => { const P = makePerson({ skin: SKINS[i % SKINS.length], top: TOPS[(i * 3) % TOPS.length], pants: [0x34405c, 0x2a2a2a, 0x6b5a48][i % 3], hair: [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a][i % 5], hairStyle: ['short', 'bob', 'messy', 'bob', 'short'][i % 5], glasses: i % 5 === 2 }); P.seed = Rn(); return P; });
  const engineers = Array.from({ length: 4 }, (_, i) => makePerson({ skin: SKINS[(i + 2) % SKINS.length], top: [0x2a3a5a, 0x3a3a40, 0x4a6a8a, 0x2a2a2e][i], pants: 0x2a2e3a, hair: [0x2a1d16, 0x5a3a24, 0x1a1a1a, 0x9a6a3a][i], hairStyle: ['short', 'bob', 'short', 'messy'][i], glasses: i === 1 }));
  const CAST = [kid, young, elon, kimbal, maye, errol, starman, gary, ...crowd, ...engineers];
  const phones = crowd.map((P, i) => { if (i % 3) return null; const ph = makePhone(); P.arms[1].hand.add(ph.g); ph.g.position.set(-0.03, -0.07, 0.04); ph.g.rotation.set(0.2, 0, 0); ph.screenMat.emissiveIntensity = 1.4; ph.g.visible = false; return ph; });
  CAST.forEach((P) => scene.add(P.root));
  young.spine.add(backpack); backpack.position.set(0, 0.32, -0.2);
  const SC = new Map([[kid, 0.62], [young, 1.08], [elon, 1.1], [kimbal, 1.06], [starman, 1.0]]);
  SC.forEach((s, P) => P.root.scale.setScalar(s));
  const baby = makeBabyBundle(0xf4ead8, 0xf0c0a0); maye.arms[0].hand.add(baby); baby.position.set(0.12, -0.02, 0.1); baby.rotation.set(0, PI / 2, 0.3);

  // ---------------------------------------------------------------- helpers
  function put(P, key, p) {
    const s = SC.get(P) || 1;
    p.floor = p.floor || 0; p.dist = (p.dist || 0) / s;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(P, p);
    P.root.position.y = (p.y || 0) * s + (p.lift || 0) + OFF[key][1];
    P.root.visible = true;
  }
  const pose = (lt, seed = 0, extra = {}) => Object.assign(basePose(), { eyes: blink(lt, seed) }, extra);
  const PROPS = [crate, sink.g, ship.g, lift, backpack, check, f1.g, f9.g, sh.g, roadster.g, dragon.g, iss.g, modelS.g, cyber.g, roadsterF.g];
  function hideAll() { CAST.forEach((P) => (P.root.visible = false)); PROPS.forEach((o) => (o.visible = false)); swarm.pts.visible = false; train.pts.visible = false; conf.visible = false; phones.forEach((ph) => ph && (ph.g.visible = false)); factory.setSparks(0, new THREE.Vector3(), false); launch.setExplosion(new THREE.Vector3(), -1); launch.setPlume(new THREE.Vector3(), 0); }
  const toWorld = (key, v) => v.clone().add(new THREE.Vector3(...OFF[key]));

  // ---------------------------------------------------------------- screens (CRT content)
  const BASIC = ['READY.', '10 PRINT "HELLO"', '20 GOTO 10', 'RUN', 'HELLO', 'HELLO', 'HELLO', 'HELLO'];
  function codeScreen(lt) {
    const n = clamp(Math.floor(lt * 2.2), 0, BASIC.length);
    crt80.setScreen((g, w, h) => { g.fillStyle = '#3a3ab8'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9aff'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillStyle = '#c8c8ff'; g.font = 'bold 18px Courier New, monospace';
      BASIC.slice(0, n).forEach((l, i) => g.fillText(l, 18, 40 + i * 22)); if (Math.floor(lt * 3) % 2) g.fillRect(18, 30 + n * 22, 10, 14); });
  }
  const EN = Array.from({ length: 10 }, (_, i) => [40 + (i % 5) * 56, 40 + Math.floor(i / 5) * 34]);
  function blastarScreen(lt, L) {
    crt80.setScreen((g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const r = rng(4); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(r() * w, (r() * h + lt * 30) % h, 2, 2);
      g.fillStyle = '#ffd040'; g.font = 'bold 22px Courier New, monospace'; g.textAlign = 'center'; g.fillText('BLASTAR', w / 2, 24);
      g.font = 'bold 13px Courier New, monospace'; g.fillStyle = '#7aff7a'; g.textAlign = 'left'; g.fillText('SCORE ' + String(Math.floor(lt * 340)).padStart(5, '0'), 8, 44);
      const shipX = w / 2 + Math.sin(lt * 2.4) * 90;
      EN.forEach(([x, y], i) => { const dead = lt > 0.6 + i * 0.32; if (dead && lt < 0.8 + i * 0.32) { g.fillStyle = '#ff9a3a'; g.fillRect(x + Math.sin(lt * 1.3) * 20 - 8, y + 30 - 8, 16, 16); return; } if (dead) return; g.fillStyle = '#ff4a8a'; g.fillRect(x + Math.sin(lt * 1.3) * 20 - 9, y + 30, 18, 10); g.fillRect(x + Math.sin(lt * 1.3) * 20 - 5, y + 40, 10, 5); });
      g.fillStyle = '#4ad0ff'; g.fillRect(shipX - 12, h - 34, 24, 10); g.fillRect(shipX - 4, h - 44, 8, 10);
      for (let k = 0; k < 4; k++) { const by = h - 50 - ((lt * 260 + k * 60) % 180); g.fillStyle = '#fff'; g.fillRect(shipX - 1, by, 3, 9); }
      const sold = K(lt, [[L * 0.62, 0], [L * 0.72, 1]]);
      if (sold > 0) { g.globalAlpha = sold; g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(30, 92, w - 60, 72); g.fillStyle = '#ffd040'; g.font = 'bold 30px Courier New, monospace'; g.textAlign = 'center'; g.fillText('SOLD! $500', w / 2, 140); g.globalAlpha = 1; g.textAlign = 'left'; }
    });
  }
  function paypalScreen(lt, L) {
    crt90.setScreen((g, w, h) => {
      g.fillStyle = '#eef2f8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a3a7a'; g.fillRect(0, 0, w, 30);
      g.fillStyle = '#fff'; g.font = 'bold 16px Helvetica, Arial'; g.fillText('SEND MONEY BY EMAIL', 12, 21);
      g.fillStyle = '#2a2a2a'; g.font = '14px Helvetica, Arial'; g.fillText('To:  friend@email.com', 16, 58); g.fillText('Amount:  $20.00', 16, 82);
      const users = Math.floor(1000 * Math.pow(10, clamp(lt / (L * 0.55)) * 4));
      g.fillStyle = '#1a3a7a'; g.font = 'bold 15px Helvetica, Arial'; g.fillText('USERS: ' + users.toLocaleString('en-US'), 16, 116);
      const sent = lt > L * 0.18; g.fillStyle = sent ? '#2a9a4a' : '#3a6ac8'; g.fillRect(16, 128, 120, 28); g.fillStyle = '#fff'; g.fillText(sent ? 'SENT  ✓' : 'SEND', 44, 147);
      const sold = K(lt, [[L * 0.6, 0], [L * 0.7, 1]]);
      if (sold > 0) { g.globalAlpha = sold; g.save(); g.translate(w / 2, h * 0.62); g.rotate(-0.12); g.strokeStyle = '#c83a2a'; g.lineWidth = 6; g.strokeRect(-130, -32, 260, 64); g.fillStyle = '#c83a2a'; g.font = 'bold 22px Helvetica, Arial'; g.textAlign = 'center'; g.fillText('SOLD TO eBay', 0, -6); g.fillText('$1.5 BILLION', 0, 22); g.restore(); g.globalAlpha = 1; }
    });
  }

  // ---------------------------------------------------------------- performances (lt = local seconds, L = shot length)
  const perf = {
    earthOpen(lt, L) { space.setSpin(-1.2 + lt * 0.04); },
    birth(lt, L) {
      suburb.update(lt + 3);
      put(maye, 'suburb', pose(lt, 2, { x: -2.2, z: 8.0, rotY: 0.35, armA: CRADLE_A, armB: CRADLE_B, headPitch: 0.4 + 0.05 * Math.sin(lt * 1.5), mouth: 'smile' })); maye.dress.visible = true;
      put(errol, 'suburb', pose(lt, 5, { x: -1.2, z: 7.8, rotY: -0.55, armA: REST, armB: A(-0.6, 0.6, -0.9, -0.3), headPitch: 0.3, headYaw: -0.3, mouth: 'smile' }));
    },
    coding(lt, L) {
      room80.setMode('candle'); room80.lights.candle.intensity = 0; codeScreen(lt); crt80.glow.intensity = 1.1;
      const tap = 0.06 * Math.max(0, Math.sin(lt * 18));
      put(kid, 'room80', pose(lt, 1, { x: 0, z: -0.45, rotY: PI, y: 0.07, footFwd: 0.25, lean: 0.12, headPitch: 0.12, armA: { ...TYPE_A, sx: TYPE_A.sx + tap }, armB: { ...TYPE_B, sx: TYPE_B.sx + 0.06 * Math.max(0, Math.sin(lt * 18 + 1.6)) }, eyes: 'open', mouth: lt > L * 0.6 ? 'smile' : 'flat' }));
    },
    blastar(lt, L) { room80.setMode('candle'); room80.lights.candle.intensity = 0; crt80.glow.intensity = 0.5; blastarScreen(lt, L); },
    flight(lt, L) {
      flight.setDrift(lt * 60); jet.g.position.set(lt * 9, 0.6 * Math.sin(lt * 0.8), 0); jet.g.rotation.set(0, PI / 2, 0.03 * Math.sin(lt * 0.7));
      jet.g.updateMatrixWorld(true); flight.setTrail(jet.engines.map((e) => jet.g.localToWorld(e.clone()).sub(new THREE.Vector3(...OFF.flight))), lt);
    },
    campus(lt, L) {
      const w = clamp(lt / (L * 0.9)), z = lerp(-4.5, 4.4, w);
      put(young, 'campus', pose(lt, 3, { x: 0.15, z, rotY: 0, dist: Math.abs(z + 4.5), speed: 1.2, armA: REST, armB: REST, mouth: 'flat' }));
      backpack.visible = true;
      // students crossing the quad
      crowd.slice(0, 5).forEach((P, i) => { const dir = i % 2 ? 1 : -1, x = -7 * dir + dir * 1.1 * lt + i * 0.6, z = -1.5 + i * 2.2; put(P, 'campus', pose(lt, i, { x, z, rotY: dir * PI / 2, dist: 1.1 * lt, speed: 1.1 })); });
    },
    zip2(lt, L) {
      crt90.glow.intensity = 1.6;
      office.setMode('candle'); office.lights.candle.intensity = 9; crt90.setScreen((g, w, h) => { g.fillStyle = '#101820'; g.fillRect(0, 0, w, h); g.fillStyle = '#6aff8a'; g.font = '14px Courier New, monospace'; for (let i = 0; i < 10; i++) g.fillText('> ' + 'map_tile_' + (i * 37 + Math.floor(lt * 3)) + '.gif  OK', 10, 24 + i * 20); });
      mattress.visible = pillow.visible = blanketLump.visible = sleeper.g.visible = true;
      put(kimbal, 'office', pose(lt, 6, { ...SIT, x: 0, z: -0.45, rotY: PI, lean: 0.85, headPitch: 0.6, armA: A(-1.1, 0.2, -1.6, 0.5), armB: A(-1.1, 0.2, -1.6, -0.5), eyes: 'closed', mouth: 'flat' }));
    },
    zip2sale(lt, L) {
      office.setMode('day'); crt90.glow.intensity = 0; mattress.visible = pillow.visible = blanketLump.visible = sleeper.g.visible = false;
      crt90.setScreen((g, w, h) => { g.fillStyle = '#e8eef4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a3a7a'; g.font = 'bold 22px Helvetica, Arial'; g.fillText('DEAL CLOSED', 70, 120); });
      const up = K(lt, [[0.3, 0], [0.7, 1]]);
      put(young, 'office', pose(lt, 3, { x: -0.05, z: -0.9, rotY: 0.25, armB: mixArm(REST, A(-0.9, 0.35, -0.5, -0.2), up), armA: mixArm(REST, CHEER, up), mouth: 'o', lift: up * Math.max(0, Math.sin(lt * 7)) * 0.05 }));
      put(kimbal, 'office', pose(lt, 6, { x: 0.95, z: -0.95, rotY: -0.3, armA: mixArm(REST, A(-0.9, 0.35, -0.5, 0.2), up), armB: mixArm(REST, CHEER, up), mouth: 'smile', lift: up * Math.max(0, Math.sin(lt * 7 + 1.2)) * 0.05 }));
      check.visible = true; check.position.set(0.45, 1.75, -1.95); check.rotation.set(0, 0, 0);
      // confetti
      conf.visible = true; const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
      CS.forEach(([a, b, c, d], i) => { const age = Math.max(0, lt - 0.5 - d * 0.6), y = 2.8 - ((age * (0.5 + c * 0.4)) % 3.0); v.set(-1.4 + a * 3.4 + Math.sin(lt * 2 + i) * 0.1, age > 0 ? y : -5, -1.8 + b * 3.2); q.setFromEuler(e3.set(lt * 4 * c + i, lt * 3 + i, i)); M4.compose(v, q, sc); conf.setMatrixAt(i, M4); });
      conf.instanceMatrix.needsUpdate = true;
    },
    paypal(lt, L) { office.setMode('day'); crt90.glow.intensity = 0.4; mattress.visible = pillow.visible = blanketLump.visible = sleeper.g.visible = false; paypalScreen(lt, L); },
    spacex(lt, L) {
      factory.setMode('day');
      const w = clamp(lt / L), x = lerp(-8.5, -14.0, w);
      put(elon, 'factory', pose(lt, 3, { x, z: -2.5, rotY: -PI / 2 + 0.15, dist: 5.5 * w, speed: 0.9, armB: lt > L * 0.5 ? POINT_B : REST, headYaw: lt > L * 0.5 ? 0.45 : 0, mouth: lt > L * 0.5 ? 'o' : 'flat' }));
      engineers.slice(0, 2).forEach((E, i) => put(E, 'factory', pose(lt, 9 + i, { x: x + 1.2 + i * 0.9, z: -1.8 + i * 0.6, rotY: -PI / 2, dist: 5.5 * w, speed: 0.9, headYaw: 0.3, armA: i ? A(-0.6, 0.05, -1.4, 0.6) : REST })));
      // a welder crouched by the engine section, sparks flying
      put(engineers[2], 'factory', pose(lt, 12, { x: -16.2, z: -3.7, rotY: PI - 0.4, crouch: 0.3, lean: 0.5, armB: A(-1.2, 0.1, -0.9, -0.3), armA: A(-0.9, 0.1, -1.2, 0.4), headPitch: 0.3 }));
      factory.setSparks(lt, handWorld(engineers[2], 1).sub(new THREE.Vector3(...OFF.factory)).add(new THREE.Vector3(0, 0, -0.15)));
      put(engineers[3], 'factory', pose(lt, 13, { x: -4.5, z: -3.4, rotY: PI, armA: A(-1.8, 0.2, -0.9, 0.3), armB: A(-1.6, 0.2, -1.0, -0.3), headPitch: -0.4 }));
    },
    boom(lt, L) {
      launch.setMode('island', 'day'); launch.setSky('day', 0, 0, 60);
      const t0 = 0.5, ign = lt - t0, h = ign > 0 ? 3 * ign * ign + 4 * ign : 0, blow = 2.3;
      f1.g.visible = lt < t0 + blow; f1.g.position.set(-5, h + 0.4, 0); f1.g.rotation.z = ign > blow - 0.8 ? (ign - (blow - 0.8)) * 0.35 : 0;
      if (f1.g.visible && ign > 0) launch.setPlume(new THREE.Vector3(-5, h + 0.4, 0), 1, 8, 1.4, h < 15 ? 22 : 0, 0, lt);
      launch.setExplosion(new THREE.Vector3(-5, 3 * blow * blow + 4 * blow, 0), lt - (t0 + blow));
    },
    broke(lt, L) {
      factory.setMode('night'); roadsterF.g.visible = true;
      const car = new THREE.Vector3(0, 0, 8), cam = new THREE.Vector3(4.15, 0, 13.3), n = cam.clone().sub(car).normalize();
      roadsterF.g.position.copy(car); roadsterF.g.rotation.y = Math.atan2(n.x, n.z) + PI / 2;   // its side faces us
      const ex = car.x + n.x * 1.35, ez = car.z + n.z * 1.35;
      crate.visible = true; crate.position.set(ex - n.x * 0.05, 0.22, ez - n.z * 0.05);
      put(elon, 'factory', pose(lt, 3, { ...SIT, x: ex, z: ez, rotY: Math.atan2(n.x, n.z), lean: 0.45, armA: HEAD_HANDS_A, armB: HEAD_HANDS_B, headPitch: 0.6, eyes: 'closed', mouth: 'flat' }));   // on a crate, head in his hands
    },
    orbit(lt, L) {
      launch.setMode('island', 'dusk'); launch.setSky('dusk', 0, 30, 60);
      const t0 = 0.6, ign = lt - t0, h = ign > 0 ? 2.2 * ign * ign + 3 * ign : 0;
      f1.g.visible = true; f1.g.position.set(-5, h + 0.4, 0); f1.g.rotation.z = 0;
      if (ign > 0) launch.setPlume(new THREE.Vector3(-5, h + 0.4, 0), 1, 12, 1.6, Math.max(0, 24 - h * 0.4), 0, lt);
      // the team on the beach, arms up as it climbs
      [elon, ...engineers].forEach((P, i) => { const up = K(lt, [[t0 + 1.2 + i * 0.12, 0], [t0 + 1.6 + i * 0.12, 1]]); put(P, 'launch', pose(lt, 20 + i, { x: 52 + i * 1.3 - 2.5, z: 86 - (i % 2) * 0.8, rotY: faceToward(52, 86, -5, 0), armA: mixArm(REST, CHEER, up), armB: mixArm(REST, CHEER, up), headPitch: -0.5, mouth: up > 0.5 ? 'o' : 'flat', lift: up * Math.max(0, Math.sin(lt * 6 + i)) * 0.08 })); });
    },
    cars(lt, L) {
      factory.setMode('showroom');
      const rev = K(lt, [[L * 0.48, 0], [L * 0.6, 1]]);
      modelS.g.visible = rev < 0.5; modelS.g.position.set(0, 0.3, 8); modelS.g.rotation.y = lt * 0.5 + 0.6;
      cyber.g.visible = rev >= 0.5; cyber.g.position.set(0, 0.3, 8); cyber.g.rotation.y = 0.6 + (lt - L * 0.55) * 0.5;
      put(elon, 'factory', pose(lt, 3, { x: 2.4, z: 11.2, rotY: -0.7, armB: REST, armA: PRESENT_A, mouth: Math.sin(lt * 8) > 0 ? 'o' : 'smile' }));
    },
    landing(lt, L) {
      launch.setMode('landing', 'night'); launch.setSky('night', 0, 0, 50);
      const land = L * 0.78, k = clamp(lt / land), y = 520 * Math.pow(1 - k, 2.6);
      f9.g.visible = true; f9.g.position.set(0, y, 0); f9.setLegs(K(lt, [[land - 1.6, 0], [land - 0.6, 1]])); f9.setFins(1);
      const burn = lt < land + 0.2 ? 1 : Math.max(0, 1 - (lt - land - 0.2) * 3);
      launch.setPlume(new THREE.Vector3(0, y, 0), burn, 22, 2.2, y < 60 ? (60 - y) * 0.7 + 8 : 0, 0, lt);
    },
    roadster(lt, L) {
      space.setSpin(-0.4 + lt * 0.02);
      const c = new THREE.Vector3(0, R + 24, 0);
      roadster.g.visible = true; roadster.g.position.copy(c); roadster.g.rotation.set(0.25, lt * 0.12 + 0.6, 0.12);
      space.focusShadow(c, 6);
      roadster.g.updateMatrixWorld(true);
      const seat = roadster.g.localToWorld(roadster.seat.clone());
      const p = pose(lt, 0, { ...SIT, x: 0, z: 0, rotY: 0, armA: WHEEL_A, armB: A(-0.2, 0.35, -0.3, -0.2), headPitch: -0.05 });
      applyPose(starman, p); starman.root.visible = true;
      starman.root.position.copy(seat); starman.root.quaternion.copy(roadster.g.quaternion); starman.root.translateY(-0.6 * 0.95); starman.root.translateZ(0.05);
    },
    crew(lt, L) {
      space.setSpin(0.8 + lt * 0.02);
      const issPos = new THREE.Vector3(0, R + 34, 0); iss.g.visible = true; iss.g.position.copy(issPos); iss.g.rotation.set(0, 0, 0);
      const port = issPos.clone().add(iss.port);
      const k = smooth(clamp(lt / (L * 0.85))), from = port.clone().add(new THREE.Vector3(-3, -1.5, 24));
      dragon.g.visible = true; dragon.g.position.lerpVectors(from, port.clone().add(new THREE.Vector3(0, 0, 3.4)), k); dragon.g.rotation.set(-PI / 2, 0, 0);
      space.focusShadow(issPos.clone().add(new THREE.Vector3(0, 0, 10)), 40);
    },
    twitter(lt, L) {
      street.aimSun(0, -1.5, 10); street.setSeason('autumn', lt, [0, -1]);
      const w = clamp(lt / (L * 0.95)), x = lerp(-3.4, 0.4, w);
      put(elon, 'street', pose(lt, 3, { x, z: -1.0, y: SH, floor: SH, rotY: PI / 2 - 0.35, dist: 3.8 * w, speed: 0.8, armA: CARRY_A, armB: CARRY_B, headYaw: -0.5, mouth: 'smile' }));
      const a = handWorld(elon, -1), b = handWorld(elon, 1); sink.g.visible = true; sink.g.position.copy(a).add(b).multiplyScalar(0.5); sink.g.position.y += 0.06; sink.g.rotation.set(0, elon.root.rotation.y, 0);
      flipper.rotation.y = 0;
      // passers-by do a double take at the man carrying a sink
      crowd.slice(0, 4).forEach((P, i) => { const dir = i % 2 ? -1 : 1, px = 3.5 * dir - dir * 0.9 * lt + (i > 1 ? 1.5 * dir : 0), pz = -1.75 - (i % 2) * 0.3;
        put(P, 'street', pose(lt, i, { x: px, z: pz, y: SH, floor: SH, rotY: dir < 0 ? PI / 2 : -PI / 2, headYaw: clamp((px - x) * dir * 0.5, -1, 1) * 0.9, dist: 0.9 * lt, speed: 0.9, mouth: 'o' })); });
    },
    xsign(lt, L) {
      street.aimSun(0, -1.5, 10); street.setSeason('autumn', lt, [0, -1]);
      flipper.rotation.y = K(lt, [[L * 0.32, 0], [L * 0.62, PI]]);
      lift.visible = true;
      put(engineers[1], 'street', pose(lt, 11, { x: 2.35, z: -1.6, y: 3.1 + SH, floor: 3.1 + SH, rotY: -PI / 2 - 0.4, armA: A(-1.9, 0.3, -0.5, 0.3), armB: A(-2.1, 0.2, -0.3, -0.2), headPitch: -0.3 }));
    },
    catch(lt, L) {
      launch.setMode('starbase', 'day'); launch.setSky('day', 20, 0, 90);
      const tw = launch.tower, cx = tw.catchX, catchT = L * 0.62;
      const base = tw.armY - 63.5, k = clamp(lt / catchT), y = lerp(560, base, 1 - Math.pow(1 - k, 2.4));
      sh.g.visible = true; sh.g.position.set(cx, y, 0);
      tw.setArms(K(lt, [[catchT - 0.5, 0], [catchT + 0.15, 1]]));
      launch.setPlume(new THREE.Vector3(cx, y, 0), lt < catchT ? 1 : Math.max(0, 1 - (lt - catchT) * 3), 46, 4.5, 0, 0, lt);
      // the beach crowd watches it come down; Gary's jaw drops, then he looks at us
      const BZ = TD.launch.beach;
      crowd.forEach((P, i) => { const x = 1 + (i % 8) * 2.1 + (P.seed - 0.5), z = BZ - 2 + Math.floor(i / 8) * 1.9; const cheer = K(lt, [[catchT + 0.2 + P.seed * 0.3, 0], [catchT + 0.6 + P.seed * 0.3, 1]]);
        const filming = phones[i] && cheer < 0.5; if (phones[i]) phones[i].g.visible = true;
        put(P, 'launch', pose(lt, i, { x, z, rotY: faceToward(x, z, cx, 0) + (P.seed - 0.5) * 0.2, headPitch: -0.45, armA: mixArm(REST, CHEER, cheer * (i % 2)), armB: filming ? A(-1.75, 0.15, -0.6, -0.3) : mixArm(REST, CHEER, cheer), mouth: cheer > 0.5 ? 'o' : 'flat', lift: cheer * Math.max(0, Math.sin(lt * 7 + i)) * 0.06 })); });
      const look = K(lt, [[catchT + 0.9, 0], [catchT + 1.3, 1]]);
      put(gary, 'launch', pose(lt, 2, { x: 12.0, z: BZ + 9.0, rotY: lerpAngle(faceToward(12.0, BZ + 9.0, cx, 0), faceToward(12.0, BZ + 9.0, 11.6, 273.4), look), headPitch: lerp(-0.45, 0.0, look), mouth: lt > catchT - 0.3 ? 'o' : 'flat', armA: REST, armB: REST }));
    },
    starlink(lt, L) { space.setSpin(lt * 0.05); swarm.pts.visible = true; swarm.update(lt, K(lt, [[0.2, 0.05], [L * 0.7, 1]])); train.pts.visible = true; train.update(lt + 2); },
    mars(lt, L) {   // only ~4 s are visible before the end card fades in: Starship lands fast, the city builds fast
      const e = clamp(lt / 1.0), y = 90 * Math.pow(1 - e, 2.2);
      ship.g.visible = true; ship.g.position.set(MD.pad[0], y, MD.pad[1]); shipFlame.visible = lt < 1.1; shipFlame.scale.set(1, 0.8 + 0.25 * Math.sin(lt * 37), 1);
      mars.setDust(Math.max(0, lt - 0.7), lt > 0.7 ? 1 : 0); mars.setBuild(clamp((lt - 1.0) / 2.6)); mars.setDusk(K(lt, [[2.6, 0], [3.9, 1]]));
      mars.rover.position.set(-24 + (lt * 4.5) % 48, 0, -6); mars.rover.rotation.y = PI / 2;
    },
  };

  // ---------------------------------------------------------------- per-frame update
  let lastSet = null;
  function update(t) {
    const shot = shotAt(SHOTS, t), S = shot.set, cam = shot.cam, L = shot.t1 - shot.t0, lt = t - shot.t0;
    if (S !== lastSet) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; lastSet = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' || S === 'launch' || S === 'flight' ? 0.3 : 0.03; studio.fill.intensity = FILL[S];
    hideAll();
    perf[cam](lt, L);
    const c = CAMS[cam], u = clamp(lt / L), o = OFF[S];
    let e = u * u * (3 - 2 * u) * 0.5 + u * 0.5;
    if (cam === 'mars') e = K(lt, [[0.6, 0], [4.1, 1]]);
    let P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    let Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    if (cam === 'orbit') { const ign = Math.max(0, lt - 0.6), h = 2.2 * ign * ign + 3 * ign; Aim = [-5 + o[0], Math.max(22, h * 0.8 + 12), o[2]]; }
    if (cam === 'landing') { const k = clamp(lt / (L * 0.78)), y = 520 * Math.pow(1 - k, 2.6); Aim = [o[0], Math.max(20, y * 0.9 + 18), o[2]]; }
    if (cam === 'catch') { const k = clamp(lt / (L * 0.62)), base = launch.tower.armY - 63.5, y = lerp(560, base, 1 - Math.pow(1 - k, 2.4)); Aim = [launch.tower.catchX * 0.5 + o[0], Math.max(62, y * 0.8 + 40), o[2]]; }
    if (cam === 'broke') { const pz = elon.root.position, car = new THREE.Vector3(o[0], 0, 8 + o[2]), n = new THREE.Vector3(pz.x - car.x, 0, pz.z - car.z).normalize(), side = new THREE.Vector3(n.z, 0, -n.x);
      P = [pz.x + side.x * 3.4 + n.x * 1.9 - lt * 0.05 * side.x, 1.2, pz.z + side.z * 3.4 + n.z * 1.9 - lt * 0.05 * side.z]; Aim = [pz.x + side.x * 0.35, 0.95, pz.z + side.z * 0.35]; }   // 3/4 side: him slumped on the crate, the car behind
    if (cam === 'twitter') { const p = elon.root.position; P = [p.x + 1.7, 1.75, p.z + 4.6]; Aim = [p.x + 0.35, 1.35, p.z]; }
    if (cam === 'flight') { Aim = [jet.g.position.x - 2 + o[0], o[1] + 1, o[2]]; P = [jet.g.position.x + 26 - lt * 2 + o[0], 6 + o[1], 58 + o[2]]; }   // 3/4 front, slightly below: the jet sails past the sunset
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}

// tiny helper (RoundedBoxGeometry without importing it into the video)
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
function RoundedBoxGeometryCompat(w, h, d) { return new RoundedBoxGeometry(w, h, d, 2, 0.04); }
