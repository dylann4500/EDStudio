// 056 — Scribe dupe of @whatifpov's "What if you didn't shower for 365 days?" (51.1K likes / 434 comments in a day, 40.1 s): the same
// format beat for beat — a cold open on the gross end state (the train car emptied around you), a VHS rewind (⏪, the counter spinning
// back), the mundane start ("Mornings are a rush" → ours: homework's due at eight, skip the shower), then ONE escalation per shot with the
// HUD's WITHOUT A SHOWER / Day N / a real fact line (sebum, bacteria make the smell, nose-blindness, dermatitis neglecta, body lice), the
// seasons as the time cue (summer street → autumn → snow → spring), the train car emptying. Our twist (the plug, 51 % → 64 %): the reason
// you never showered is homework; on Day 220 the professor won't come within ten feet but wants forty problems handwritten by morning →
// Scribe: one photo, all forty solved and written in YOUR handwriting (Scribe's real demo glyphs, videos/049-scribe-promo/hand.json) →
// Day 221 you finally shower (it takes three hours), the counter rewinds to 0, the Scribe end card.
// Toon look (engine/build toon cast, fx, 60 fps + blur, Adam v3) with the reference's own text layer (engine/build/pov.js, VHS pass
// engine/build/vhs.js). Sets: street.js (seasons), subway.js, bathroom.js, library.js (desk + office). All art and lines are ours.
// Facts (dermatology basics, cited in caption.md's source comment): fresh sweat is odourless — skin bacteria make the smell; sebum is the
// scalp's oil; olfactory adaptation makes you nose-blind to your own smell; dermatitis neglecta = a brown crust of skin from not washing;
// body lice live and lay eggs in the seams of unwashed clothes. Product claims: the Scribe README + tryscribe.ink (photo → solved → written
// in the student's own handwriting, stroke by stroke).
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { beatClock, u01, easeOutBack, easeInQuad, softTex } from '@engine/build/anim.js';
import { makeFX } from '@engine/build/fx.js';
import { makeToon, makePigeon } from '@engine/build/toon.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeCrowd } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice, makePen, makeClockFace, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildSubway } from '@engine/sets/subway.js';
import { buildBathroom, DIMS as BD } from '@engine/sets/bathroom.js';
import { createPov } from '@engine/build/pov.js';
import { addVhsPass } from '@engine/build/vhs.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (c, r = 0.7, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o });
const mk = (geo, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const keysAt = (list, t) => { if (t <= list[0][0]) return list[0][1]; for (let i = 0; i < list.length - 1; i++) { const [a, va] = list[i], [b, vb] = list[i + 1]; if (t < b) return va + (vb - va) * smooth((t - a) / Math.max(1e-3, b - a)); } return list[list.length - 1][1]; };
const cam2 = (t, t0, t1, p0, p1, a0, a1, f0, f1 = f0) => { const u = smooth(u01(t, t0, t1)); return { pos: p0.map((v, i) => lerp(v, p1[i], u)), look: a0.map((v, i) => lerp(v, a1[i], u)), fov: lerp(f0, f1, u) }; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  const S0 = (id) => story.beats[id].s0, S1 = (id) => story.beats[id].s1, T0 = (id) => story.beats[id].t0;
  await Promise.all(['600 30px Inter', '400 60px Newsreader', 'italic 400 58px Newsreader', '700 40px Fredoka'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  renderer.localClippingEnabled = true;

  // ---------------------------------------------------------------- word times (everything keys to the narrator)
  const t = {
    what: W('hook', 'what'), days: W('hook', 'days'),
    due: W('due', 'due'), eight: W('due', 'eight'),
    skip: W('skip', 'skip'), showerS: W('skip', 'shower'), just: W('skip', 'just'), once: W('skip', 'once'),
    d3: W('d3', 'day'), nobody: W('d3', 'nobody'),
    d10: W('d10', 'day'), never: W('d10', 'never'), shiny: W('d10', 'shiny'),
    d30: W('d30', 'day'), smell: W('d30', 'smell'), arrives: W('d30', 'arrives'),
    everyone: W('blind', 'everyone'), smells: W('blind', 'smells'), butB: W('blind', 'but'), youB: W('blind', 'you'),
    d80: W('d80', 'day'), people: W('d80', 'people'), cross: W('d80', 'cross'), street: W('d80', 'street'),
    winter: W('crust', 'winter'), brown: W('crust', 'brown'), crust: W('crust', 'crust'),
    d180: W('train', 'day'), train: W('train', 'train'), empties: W('train', 'empties'),
    spring: W('flies', 'spring'), flies: W('flies', 'flies'), homework: W('flies', 'homework'),
    d220: W('prof', 'day'), professor: W('prof', 'professor'), wont: W('prof', 'wont'), within: W('prof', 'within'), feet: W('prof', 'feet'),
    but: W('forty', 'but'), forty: W('forty', 'forty'), handwritten: W('forty', 'handwritten'), by: W('forty', 'by'), morning: W('forty', 'morning'),
    so: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), one: W('scribe', 'one'), photo: W('scribe', 'photo'),
    all: W('hand', 'all'), solved: W('hand', 'solved'), written: W('hand', 'written'), handwriting: W('hand', 'handwriting'),
    d221: W('shower', 'day'), finally: W('shower', 'finally'), shower: W('shower', 'shower'),
    takes: W('hours', 'takes'), hours: W('hours', 'hours'),
  };
  const COLD1 = S1('hook') + 0.1, RW0 = COLD1, RW1 = T0('due') - 0.02;      // cold open → VHS rewind → Day 1
  const ENDC = S1('hours') + 0.32;                                         // the Scribe end card
  const WATER_ON = t.finally - 0.1, RST0 = S1('shower') + 0.25, RST1 = RST0 + 0.85;   // the shower; the counter rewinds 221 → 0

  // ---------------------------------------------------------------- sets (street at the origin: its sky/fog; the rest parked far away)
  const ST = buildStreet(studio), streetFog = scene.fog;
  const BO = [2000, 0, 0], LO = [3000, 0, 0], OO = [3040, 0, 0], SO = [4000, 0, 0];
  const BA = buildBathroom(studio); BA.root.position.set(...BO);
  const SU = buildSubway(studio); SU.root.position.set(...SO);
  const Bw = (x, y, z) => [BO[0] + x, BO[1] + y, BO[2] + z], Lw = (x, y, z) => [LO[0] + x, LO[1] + y, LO[2] + z], Ow = (x, y, z) => [OO[0] + x, OO[1] + y, OO[2] + z], Sw = (x, y, z) => [SO[0] + x, SO[1] + y, SO[2] + z];

  // Scribe kit (049): the worksheet written glyph by glyph, the app on the laptop, the pen
  const sheet = makeSheet(G, { seed: 12, title: 'PHYS 101 · PROBLEM SET 12', note: '40 PROBLEMS  ·  HANDWRITTEN WORK ONLY  ·  DUE 8:00 AM', name: 'Sam', page: 'p. 1 of 7', problems: [
    { q: '1.  A 2 kg cart, F = 10 N. Find a.', a: 'a = F/m = 10/2\n= 5 m/s^2' },
    { q: '2.  d/dx [ x³ + 4x ]', a: '= 3x^2 + 4' },
    { q: '3.  v = 12 m/s, t = 3 s. Find d.', a: 'd = vt = 36 m' },
    { q: '4.  ∫ 6x dx', a: '= 3x^2 + C' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  KE of 4 kg at 3 m/s', a: 'KE = 1/2 mv^2 = 18 J' },
  ] });
  const screen = makeScreen(G, icon, sheet);
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon }); LIB.root.position.set(...LO);
  const OFF = buildOffice(studio); OFF.root.position.set(...OO); for (const m of [OFF.desk, OFF.front, OFF.mug, OFF.handle]) m.visible = false;
  const Y = LD.deskY;
  const pen = makePen(); LIB.root.add(pen.g);

  // ---------------------------------------------------------------- cast
  const SKIN = 0xe0a97e;
  const you = makeToon({ shirt: 0xf4f2ec, pants: 0x2b3140, hair: 0x2b1d14, hairStyle: 'messy', skin: SKIN }); scene.add(you.root);
  const woman = makeToon({ shirt: 0x8e5bd6, pants: 0x34495e, hair: 0xb5502c, hairStyle: 'side', skin: 0xf2c29a }); scene.add(woman.root);
  const prof = makeToon({ shirt: 0x7a5a3a, pants: 0x3d3d3d, hair: 0xd9d9d9, hairStyle: 'side', mustache: true, skin: 0xf2c29a }); scene.add(prof.root);
  { const bow = mk(new THREE.BoxGeometry(0.12, 0.05, 0.03), std(0xc1121f, 0.5), prof.armL.g.parent, 0, 0.36, 0.13); void bow; }
  const pin = new THREE.Group(); prof.head.add(pin); pin.position.set(0, -0.03, 0.3);   // a clothespin on the professor's nose
  mk(new THREE.BoxGeometry(0.025, 0.1, 0.03), std(0xd9b27a, 0.6), pin, -0.016, 0, 0).rotation.z = 0.12; mk(new THREE.BoxGeometry(0.025, 0.1, 0.03), std(0xd9b27a, 0.6), pin, 0.016, 0, 0).rotation.z = -0.12;
  mk(new THREE.TorusGeometry(0.02, 0.005, 6, 12), std(0x9aa3ad, 0.3, { metalness: 0.8 }), pin, 0, 0.0, 0.016);
  const hairBase = { r: you.M.hair.roughness, m: you.M.hair.metalness }, skinBase = you.M.skin.roughness;
  const shirtC = new THREE.Color(0xf4f2ec), pantsC = new THREE.Color(0x2b3140);
  // the lather on your head in the shower
  const foam = new THREE.Group(); you.head.add(foam); foam.position.set(0, 0.2, -0.02);
  { const R = rng(56), fm = std(0xffffff, 0.35); for (let i = 0; i < 9; i++) mk(new THREE.SphereGeometry(0.07 + R() * 0.05, 14, 10), fm, foam, (R() - 0.5) * 0.36, R() * 0.12, (R() - 0.5) * 0.3); }
  const crowd = makeCrowd(scene, 40, { seed: 56 });
  { const SH_C = [0x3b7dd8, 0xe2574c, 0x58b368, 0xf2c14e, 0x9b59d0, 0xf08a3c, 0x2bb3a3, 0xe58fa6, 0x5a6b7d, 0xd8d0c0], C = new THREE.Color();
    crowd.people.forEach((p, i) => { p.shirt = SH_C[(i * 7) % SH_C.length]; crowd.meshes.chest.setColorAt(i, C.setHex(p.shirt)); for (const k of [0, 1]) crowd.meshes.arm.setColorAt(i * 2 + k, C.setHex(p.shirt)); }); crowd.commit(); }
  const pigeon = makePigeon(); scene.add(pigeon.root);

  // ---------------------------------------------------------------- props
  const paperTop = ctex(256, 320, (g, w, h) => { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3a3a'; g.fillRect(24, 22, 120, 10); g.fillStyle = 'rgba(40,60,120,.45)'; for (let y = 56; y < h - 16; y += 18) g.fillRect(24, y, 150 + ((y * 37) % 60), 4); });
  const paperSide = ctex(64, 64, (g, w, h) => { g.fillStyle = '#efeadf'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,110,95,.5)'; for (let y = 2; y < h; y += 4) g.fillRect(0, y, w, 1); });
  const reamMats = [std(0xffffff, 0.9, { map: paperSide }), std(0xffffff, 0.9, { map: paperSide }), std(0xffffff, 0.85, { map: paperTop }), std(0xe6e0d4, 0.9), std(0xffffff, 0.9, { map: paperSide }), std(0xffffff, 0.9, { map: paperSide })];
  const reamGeo = new THREE.BoxGeometry(0.3, 0.055, 0.38);
  function makeStack(n, seed) {   // a leaning tower of homework: setN(k) shows the bottom k reams
    const g = new THREE.Group(), R = rng(seed), reams = [];
    for (let i = 0; i < n; i++) { const r = mk(reamGeo, reamMats, g, (R() - 0.5) * 0.045 + i * 0.002, 0.0275 + i * 0.055, (R() - 0.5) * 0.04); r.rotation.y = (R() - 0.5) * 0.22; reams.push(r); }
    g.setN = (k) => reams.forEach((r, i) => (r.visible = i < k)); return g;
  }
  const carry = makeStack(8, 3); you.root.add(carry); carry.position.set(0, 0.62, 0.3);   // in your arms
  const seatTower = makeStack(12, 5); scene.add(seatTower);
  const deskTower = makeStack(20, 7); LIB.root.add(deskTower); deskTower.position.set(-0.42, Y, -0.98); deskTower.rotation.y = 0.15;
  const pillow = makeStack(4, 9); LIB.root.add(pillow); pillow.position.set(0.05, Y, -0.78);
  const floorTowers = [[-1.2, -1.4, 14], [1.5, -0.9, 10], [-1.6, 0.2, 9], [1.1, -2.1, 16]].map(([x, z, n], i) => { const s = makeStack(n, 20 + i); s.position.set(x, 0, z); s.rotation.y = i * 0.7; LIB.root.add(s); return s; });
  const bathStack = makeStack(3, 31); BA.root.add(bathStack); bathStack.position.set(1.0, 0.43, 0.32); bathStack.rotation.y = 0.3;   // on the toilet lid
  // a wilted desk plant
  const plant = new THREE.Group(); LIB.root.add(plant); plant.position.set(0.72, Y, -0.35);
  mk(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 14), std(0xb5652e, 0.8), plant, 0, 0.06, 0);
  for (let i = 0; i < 4; i++) { const a = i * 1.7, lf = mk(new THREE.SphereGeometry(0.06, 10, 8), std(0x7d6a2a, 0.8), plant, Math.cos(a) * 0.08, 0.1, Math.sin(a) * 0.08); lf.scale.set(0.5, 0.18, 1.3); lf.rotation.set(0.9 * Math.sin(a), a, 0.9 * Math.cos(a)); }
  mk(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), std(0x6b5a22, 0.8), plant, 0.02, 0.15, 0).rotation.z = 1.1;
  // the 10-foot pole + the problem set clamped to it + hazard tape on the office floor
  const pSheet = ctex(860, 1112, (g, w, h) => {
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f1f1f'; g.font = '600 46px Inter, Arial'; g.textAlign = 'center'; g.fillText('PHYS 101 · PROBLEM SET 12', w / 2, 96);
    g.font = '700 150px Inter, Arial'; g.fillText('40', w / 2, 300); g.font = '600 64px Inter, Arial'; g.fillText('PROBLEMS', w / 2, 380);
    g.save(); g.translate(w / 2, 560); g.rotate(-0.07); g.strokeStyle = '#c1121f'; g.lineWidth = 12; g.strokeRect(-360, -78, 720, 150); g.fillStyle = '#c1121f'; g.font = '800 82px Inter, Arial'; g.fillText('HANDWRITTEN', 0, -2); g.font = '700 50px Inter, Arial'; g.fillText('ONLY · SHOW YOUR WORK', 0, 56); g.restore();
    g.fillStyle = '#1f1f1f'; g.font = '700 70px Inter, Arial'; g.fillText('DUE 8:00 AM', w / 2, 760);
    g.fillStyle = 'rgba(30,40,80,.45)'; for (let y = 840; y < h - 50; y += 44) { g.fillRect(90, y, 40, 10); g.fillRect(150, y, 420 + ((y * 31) % 200), 10); }
  });
  const poleG = new THREE.Group(); scene.add(poleG);
  const pole = mk(new THREE.CylinderGeometry(0.02, 0.02, 1, 10), std(0x9a6b3c, 0.6), poleG);
  const clampM = mk(new THREE.BoxGeometry(0.1, 0.06, 0.05), std(0x2a2f36, 0.4, { metalness: 0.6 }), poleG);
  const poleSheet = mk(new THREE.PlaneGeometry(0.43, 0.556), std(0xffffff, 0.85, { map: pSheet, side: THREE.DoubleSide }), poleG); poleSheet.castShadow = false;
  const tape = mk(new THREE.PlaneGeometry(2.6, 0.13), new THREE.MeshStandardMaterial({ map: ctex(512, 26, (g, w, h) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; for (let x = -26; x < w; x += 26) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 13, h); g.lineTo(x + 26, 0); g.lineTo(x + 13, 0); g.fill(); } }), roughness: 0.6 }), OFF.root, 0, 0.004, 1.35); tape.rotation.x = -PI / 2; tape.castShadow = false;
  const tenFt = mk(new THREE.PlaneGeometry(0.9, 0.36), new THREE.MeshStandardMaterial({ map: ctex(400, 160, (g, w, h) => { g.fillStyle = '#f2c230'; g.font = '800 120px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10 FT', w / 2, h / 2 + 6); }), transparent: true, roughness: 0.6 }), OFF.root, -0.35, 0.005, 0.62); tenFt.rotation.set(-PI / 2, 0, PI); tenFt.castShadow = false;
  // the POV arm for the winter crust beat (camera space: x right, y up, −z forward)
  const crustTex = ctex(256, 256, (g, w, h) => { g.fillStyle = '#e0a97e'; g.fillRect(0, 0, w, h); const R = rng(130); for (let i = 0; i < 150; i++) { g.fillStyle = `rgba(${90 + R() * 30},${55 + R() * 20},${28 + R() * 12},${0.55 + R() * 0.4})`; g.beginPath(); g.ellipse(R() * w, R() * h, 4 + R() * 12, 3 + R() * 8, R() * 3, 0, TAU); g.fill(); } });
  const povArm = new THREE.Group(); scene.add(povArm);
  { const E1 = V(0.25, -0.36, -0.2), H1 = V(0.055, -0.118, -0.47), dir = H1.clone().sub(E1), L = dir.length();
    const fore = mk(new THREE.CapsuleGeometry(0.048, L, 6, 14), std(0xffffff, 0.6, { map: crustTex }), povArm); fore.position.copy(E1.clone().add(H1).multiplyScalar(0.5)); fore.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    const sl = mk(new THREE.CylinderGeometry(0.075, 0.07, 0.1, 16), std(0xe9e4d6, 0.8), povArm); sl.position.copy(E1); sl.quaternion.copy(fore.quaternion);
    mk(new THREE.SphereGeometry(0.058, 16, 12), std(0xffffff, 0.6, { map: crustTex }), povArm, H1.x, H1.y, H1.z).scale.set(1.1, 0.9, 1.0);
    const cup = new THREE.Group(); povArm.add(cup); cup.position.set(H1.x - 0.005, H1.y + 0.055, H1.z - 0.01); cup.rotation.x = 0.19;   // upright in the world (the camera looks down 0.19 rad)
    mk(new THREE.CylinderGeometry(0.042, 0.034, 0.12, 18), std(0xf6f3ec, 0.6), cup, 0, 0, 0); mk(new THREE.CylinderGeometry(0.044, 0.041, 0.042, 18), std(0x8a5a34, 0.8), cup, 0, -0.004, 0);
    mk(new THREE.CylinderGeometry(0.045, 0.045, 0.016, 18), std(0x222222, 0.5), cup, 0, 0.066, 0);
    for (const [x, z] of [[-0.06, 0.0], [0.06, 0.01], [0.0, -0.05]]) mk(new THREE.SphereGeometry(0.028, 10, 8), std(0xffffff, 0.6, { map: crustTex }), povArm, H1.x + x * 0.6, H1.y + 0.03, H1.z + z * 0.5 + 0.03).scale.set(0.8, 1.4, 0.8); }   // fingers round the cup
  povArm.traverse((o) => { if (o.isMesh) { o.castShadow = false; } });
  // the bathroom wall clock (it spins three hours)
  const bclock = makeClockFace(); { const g = new THREE.Group(); BA.root.add(g); g.position.set(-0.45, 1.98, BD.room.z0 + 0.03); mk(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 30), std(0x2a2f36, 0.4), g, 0, 0, 0).rotation.x = PI / 2; mk(new THREE.CircleGeometry(0.15, 30), std(0xffffff, 0.6, { map: bclock.tex }), g, 0, 0, 0.017); }

  // ---------------------------------------------------------------- critters + FX: flies, stink lines, sparkles, bubbles, steam, water
  const flyN = 16, flyBody = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 8, 6), std(0x1a1a1a, 0.4), flyN), flyWing = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.026), new THREE.MeshBasicMaterial({ color: 0xe8f2ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }), flyN * 2);
  for (const m of [flyBody, flyWing]) { m.frustumCulled = false; m.castShadow = false; scene.add(m); }
  const FR = rng(77), flyP = Array.from({ length: flyN }, () => ({ r: 0.2 + FR() * 0.35, w: (1.6 + FR() * 2.2) * (FR() < 0.5 ? -1 : 1), ph: FR() * TAU, h: 0.1 + FR() * 0.25, hw: 2 + FR() * 3, ex: [FR() - 0.5, FR() * 0.6, FR() - 0.5] }));
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), SV = new THREE.Vector3(), PV = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function flies(center, n, tt, flee = 0, spread = 1) {
    for (let i = 0; i < flyN; i++) {
      if (!center || i >= n) { flyBody.setMatrixAt(i, ZERO); flyWing.setMatrixAt(i * 2, ZERO); flyWing.setMatrixAt(i * 2 + 1, ZERO); continue; }
      const f = flyP[i], a = f.ph + f.w * tt, r = f.r * spread * (1 + flee * 6), fl = flee * flee * 3;
      PV.set(center[0] + Math.cos(a) * r + f.ex[0] * fl, center[1] + f.h * Math.sin(f.hw * tt + f.ph) + f.ex[1] * fl * 1.5, center[2] + Math.sin(a) * r + f.ex[2] * fl);
      const head = a + (f.w > 0 ? PI / 2 : -PI / 2);
      M4.compose(PV, Q.setFromEuler(E.set(0, -head, 0)), SV.set(1, 0.8, 1.4)); flyBody.setMatrixAt(i, M4);
      for (const s of [0, 1]) { const flap = Math.sin(tt * 90 + i) * 0.7; M4.compose(V(PV.x, PV.y + 0.012, PV.z), Q.setFromEuler(E.set((s ? 1 : -1) * (0.3 + flap), -head, 0, 'YXZ')), SV.set(1, 1, 1)); flyWing.setMatrixAt(i * 2 + s, M4); }
    }
    flyBody.instanceMatrix.needsUpdate = true; flyWing.instanceMatrix.needsUpdate = true;
  }
  const stinkTex = ctex(64, 256, (g, w, h) => { for (const [lw, col] of [[16, 'rgba(60,90,20,.55)'], [9, '#a8d84e']]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); for (let y = 12; y <= h - 12; y += 4) { const x = w / 2 + Math.sin(y * 0.055) * 15; y === 12 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } });
  const stinks = Array.from({ length: 9 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: stinkTex, transparent: true, depthWrite: false, opacity: 0 })); s.scale.set(0.13, 0.5, 1); scene.add(s); return s; });
  let stinkReq = null;
  function stink(center, k, tt, size = 1, ring = 0.36) { stinkReq = center && k > 0 ? { center, k, tt, size, ring } : null; }
  function drawStink(cam) {   // wavy green stink lines rising around a point (each lives 1.5 s, staggered), set back from the lens
    const R0 = stinkReq;
    let c = R0 && R0.center; if (c) { const d = V(c[0] - cam.x, 0, c[2] - cam.z); const L = d.length() || 1; c = [c[0] + d.x / L * 0.28 * R0.size, c[1], c[2] + d.z / L * 0.28 * R0.size]; }
    stinks.forEach((s, i) => {
      if (!R0) { s.visible = false; return; }
      const { k, tt, size, ring } = R0, center = c;
      const life = 1.5, a = ((tt + i * (life / stinks.length)) % life) / life, ang = i * 2.4;
      s.visible = true; s.material.opacity = k * Math.sin(PI * a) * 0.95;
      s.position.set(center[0] + Math.cos(ang) * ring * size, center[1] + a * 0.55 * size, center[2] + Math.sin(ang) * ring * size);
      s.scale.set(0.13 * size, 0.5 * size, 1); s.material.rotation = Math.sin(tt * 3 + i) * 0.12;
    });
  }
  const starTex = ctex(128, 128, (g, w, h) => { const c = w / 2; const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,240,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (const r of [0, PI / 2]) { g.save(); g.translate(c, c); g.rotate(r); g.beginPath(); g.moveTo(-c, 0); g.quadraticCurveTo(0, -5, c, 0); g.quadraticCurveTo(0, 5, -c, 0); g.fill(); g.restore(); } });
  const sparks = Array.from({ length: 6 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); scene.add(s); return s; });
  const bubTex = ctex(128, 128, (g, w, h) => { const c = w / 2; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(c, c, c - 6, 0, TAU); g.stroke(); const gr = g.createRadialGradient(c, c, c * 0.5, c, c, c - 4); gr.addColorStop(0, 'rgba(180,220,255,0)'); gr.addColorStop(1, 'rgba(200,170,255,.35)'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c - 6, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(c * 0.62, c * 0.55, 12, 7, -0.6, 0, TAU); g.fill(); });
  const BUBN = 46, bubbles = Array.from({ length: BUBN }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); return s; });
  const BR = rng(91), bubP = Array.from({ length: BUBN * 3 }, (_, i) => ({ tb: WATER_ON + 0.2 + i * 0.075, x: (BR() - 0.5) * 0.9, z: (BR() - 0.5) * 0.5, y: 0.9 + BR() * 0.9, s: 0.05 + BR() * 0.1, ph: BR() * TAU, v: 0.18 + BR() * 0.2 }));
  const fx = makeFX(scene, { max: { smoke: 420, rain: 1400, drops: 500, spark: 200, dust: 200 }, nearFade: [0.25, 0.9] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  // the morning shower (due/skip) and THE shower (the payoff): spray from the head on the tub's left wall, steam, splashes
  const HEAD = Bw(BD.room.x0 + 0.16, 1.92, (BD.tub.z0 + BD.tub.z1) / 2), TUBC = Bw(-0.5, BD.tubFloor, (BD.tub.z0 + BD.tub.z1) / 2);
  const AM0 = T0('due') - 0.6, AM1 = T0('d3');
  fx.stream('rain', AM0, AM1, { pos: HEAD, dir: [0.5, -1, 0], spread: 0.22, speed: [2.2, 3.0], rate: 160, life: [0.42, 0.55], floor: BD.tubFloor, seed: 3 });
  fx.stream('smoke', AM0 - 1.5, AM1, { pos: add(TUBC, [0.1, 1.1, -0.1]), box: [1.1, 0.8, 0.4], rate: 10, size: [0.25, 0.5], life: [1.8, 2.6], g: -0.35, color: 0xffffff, speed: [0.05, 0.25], seed: 4 });
  fx.stream('rain', WATER_ON, END + 1, { pos: HEAD, dir: [0.55, -1, 0], spread: 0.3, speed: [2.6, 3.6], rate: 260, life: [0.4, 0.55], floor: BD.tubFloor, seed: 5 });
  fx.stream('drops', WATER_ON + 0.2, END + 1, { pos: add(TUBC, [0, 1.42, 0.05]), box: [0.3, 0.05, 0.25], rate: 26, speed: [0.6, 1.4], spread: 1.2, size: [0.015, 0.03], floor: BD.tubFloor, seed: 6 });
  fx.stream('smoke', WATER_ON, END + 1, { pos: add(TUBC, [0.1, 1.2, -0.2]), box: [1.3, 0.9, 0.4], rate: 12, size: [0.22, 0.45], life: [1.6, 2.4], g: -0.3, color: 0xffffff, speed: [0.05, 0.25], seed: 7 });
  fx.burst('smoke', WATER_ON + 0.05, { pos: add(TUBC, [0.2, 1.2, -0.15]), n: 9, speed: [0.6, 1.6], size: [0.3, 0.55], color: 0xffffff, life: [1.6, 2.4], g: -0.4, spread: 1.4 });
  kick(WATER_ON + 0.05, 0.9);

  // ---------------------------------------------------------------- per-scene choreography (pure functions of τ; idle motion from tt)
  const pose0 = { armL: {}, armR: {}, legL: {}, legR: {} };
  const CARRY = { armL: { x: -1.15, z: 0.28, el: 0.95 }, armR: { x: -1.15, z: 0.28, el: 0.95 } };
  const SIT = { legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 } };
  const BEHIND = { armL: { x: 0.35, z: 1.45, el: 0.25 }, armR: { x: 0.35, z: 1.45, el: 0.25 } };   // arms spread along the seat back: the whole car is yours
  const mudAt = (tt) => keysAt([[0, 0], [t.d30, 0], [t.arrives, 0.22], [T0('d80'), 0.35], [T0('crust'), 0.6], [T0('train'), 0.7], [T0('prof'), 0.82]], tt);
  const headW = (r) => { r.root.updateMatrixWorld(true); return r.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const youSet = (p, tt) => you.set({ beard: 0, t: tt, mud: mudAt(tt), mudColor: 0x6b4a2b, ...p });

  // street walk paths (shot-local)
  const P3 = (tt) => [1.6 - 1.15 * (tt - T0('d3')), SH, -1.35];
  const P10 = (tt) => [-2.0 + 0.85 * (tt - T0('d10')), SH, -1.35];
  const P30 = (tt) => [-8.0 + 1.0 * (tt - T0('d30')), SH, -1.25];
  const P80 = (tt) => [-3.5 + 1.0 * (tt - T0('d80')), SH, -1.4];
  const PCR = (tt) => [2.0 - 0.95 * (tt - T0('crust')), SH, -1.3];
  const SNIFF = [9.05, SH, -1.15], PIG = [9.75, SH + 0.45, -2.25];
  // d80: a stream of walkers that step off the curb and cross the street before they reach you (simulated once, sampled per frame)
  const XR = rng(80), X0T = T0('d80') - 0.6, XDT = 1 / 60;
  const crossers = Array.from({ length: 14 }, (_, i) => {
    let x = 1.2 + i * 1.05 + XR() * 0.5, z = -0.55 - (i % 3) * 0.75 - XR() * 0.2; const v = 1.0 + XR() * 0.35, S = []; let crossing = false;
    for (let tt = X0T; tt <= T0('crust') + 0.2; tt += XDT) {
      const yx = P80(tt)[0]; if (!crossing && x - yx < 5.6 + (i % 3) * 0.6) crossing = true;
      if (crossing && z < 8.3) { z += 2.1 * XDT; x -= v * 0.55 * XDT; } else x -= v * XDT;
      S.push([x, z, crossing && z < 8.3 ? 1 : 0]);
    }
    return { S, ph: XR() * TAU };
  });
  const crAt = (c, tt) => c.S[clamp(Math.round((tt - X0T) / XDT), 0, c.S.length - 1)];
  // the train: everyone gets up and packs the far end of the car
  const TR = rng(180), SEATS = [[-1, -6.4], [-1, -5.5], [-1, -3.1], [-1, -2.2], [-1, -0.9], [-1, 0.1], [-1, 1.0], [-1, 2.0], [-1, 4.1], [-1, 5.0], [1, -6.2], [1, -2.9], [1, -1.0], [1, 0.2], [1, 1.9], [1, 3.15]];
  const STAND = [[0.25, 0.9], [-0.3, -1.6], [0.2, 2.6], [0.3, -4.0]];
  const EMPTY = t.empties - 0.35;
  const riders = [...SEATS.map(([s, z]) => ({ a: [s * 1.17, z], sit: true, rot: s > 0 ? -PI / 2 : PI / 2 })), ...STAND.map(([x, z]) => ({ a: [x, z], sit: false, rot: TR() * TAU }))]
    .map((r, i) => { const col = i % 6, row = Math.floor(i / 6); return { ...r, b: [-1.15 + col * 0.46 + (TR() - 0.5) * 0.1, -4.6 + row * 0.5 + (TR() - 0.5) * 0.1], go: EMPTY + Math.max(0, r.a[1] + 4) * 0.03 + TR() * 0.12, ph: TR() * TAU }; });
  const YOU_T = [1.17, 0.125, 4.6];
  const TRAIN_HOLD = S1('train') + 0.25;
  const TPOS = (r, tt) => { const u = smooth(u01(tt, r.go, r.go + 0.55 + Math.abs(r.a[1] - r.b[1]) * 0.07)); return { x: lerp(r.a[0], r.b[0], u), z: lerp(r.a[1], r.b[1], u), u }; };
  // the office: the professor at the board end, you behind the tape, ten feet apart
  const PROF = Ow(0, 0, -1.4), YOU_O = Ow(0.12, 0, 1.72), POLE_TIP = Ow(0.1, 0.8, 1.34), POLE_UP = Ow(0.78, 2.15, -0.95);
  const POLE_OUT = t.wont - 0.15;
  kick(POLE_OUT + 0.22, 0.6);
  // the library desk (049 layout): you on the chair, facing +z over the desk
  const TY = Lw(LD.seat[0], 0.145, LD.seat[1]);
  const LID0 = t.open - 0.05, LID1 = t.open + 0.3, FLASH = t.photo + 0.05, SOLVE0 = T0('hand') + 0.05, SOLVE1 = t.solved + 0.35, WRITE0 = t.written - 0.1, WRITE1 = T0('shower') - 0.15;
  kick(FLASH, 0.35); kick(t.by + 0.05, 0.7); kick(t.empties, 0.5); kick(t.smell + 0.25, 0.35); kick(t.cross, 0.3);
  const items = sheet.items, N = sheet.total, cum = []; { let a = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; cum.push(a); } }
  const writeP = (tt) => N * smooth(u01(tt, WRITE0, WRITE1));
  fx.stream('spark', WRITE0, WRITE1, { pos: Lw(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 16, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = mk(new THREE.CapsuleGeometry(0.045, 0.2, 4, 10), std(0xffffff, 0.6, { map: crustTex }), shotHand, 0, -0.02, -0.17); sleeve.rotation.x = PI / 2; mk(new THREE.SphereGeometry(0.068, 14, 10), std(0xffffff, 0.6, { map: crustTex }), shotHand, 0, 0, 0); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { mk(new THREE.BoxGeometry(0.13, 0.016, 0.25), std(0x15161a, 0.3), camPhone, 0, 0, 0); const sc = mk(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false }), camPhone, 0, 0.0085, -0.01); sc.rotation.x = -PI / 2; const ui = mk(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false }), camPhone, 0, 0.0086, 0.1); ui.rotation.x = -PI / 2; }
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('255,255,255', 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  // sweat drops when the forty problems land; sparkles on the shiny hair; a golden glow in the shower
  fx.burst('drops', t.by + 0.1, { pos: add(YOU_O, [0, 1.42, 0.05]), n: 10, color: 0xbfe6ff, speed: [0.5, 1.2], spread: 1.0, size: [0.018, 0.03] });
  fx.burst('drops', t.morning + 0.1, { pos: add(YOU_O, [0, 1.42, 0.05]), n: 8, color: 0xbfe6ff, speed: [0.5, 1.2], spread: 1.0, size: [0.018, 0.03] });
  const glowL = new THREE.PointLight(0xffd58a, 0, 4, 1.6); scene.add(glowL);
  { // the office's front wall (behind you in the forty shot): a door, a bulletin board, a clock
    const wm = std(0xd9cdb4, 0.9); mk(new THREE.BoxGeometry(8, 4.2, 0.2), wm, OFF.root, 0, 2.1, 3.3);
    mk(new THREE.BoxGeometry(1.0, 2.1, 0.06), std(0x6e4a2c, 0.6), OFF.root, -1.2, 1.05, 3.18); mk(new THREE.SphereGeometry(0.035, 10, 8), std(0xc9a24a, 0.3, { metalness: 0.7 }), OFF.root, -0.82, 1.0, 3.13);
    const bb = mk(new THREE.PlaneGeometry(1.3, 0.9), new THREE.MeshStandardMaterial({ map: ctex(390, 270, (g, w, h) => { g.fillStyle = '#b98a58'; g.fillRect(0, 0, w, h); const cols = ['#fff6c8', '#ffd1dc', '#cfe8ff', '#ffffff', '#d9f2c4']; for (let i = 0; i < 9; i++) { g.fillStyle = cols[i % 5]; g.save(); g.translate(30 + (i % 3) * 120 + 10, 24 + Math.floor(i / 3) * 82); g.rotate(((i * 37) % 9 - 4) * 0.03); g.fillRect(0, 0, 95, 66); g.fillStyle = 'rgba(40,40,60,.5)'; for (let k = 0; k < 4; k++) g.fillRect(10, 14 + k * 12, 60 + ((i + k) * 13) % 20, 4); g.fillStyle = '#c1121f'; g.beginPath(); g.arc(47, 6, 5, 0, TAU); g.fill(); g.restore(); } }), roughness: 0.8 }), OFF.root, 0.55, 1.55, 3.19); bb.rotation.y = PI; }
  const offFill = new THREE.PointLight(0xfff0dc, 2.4, 6, 1.5); offFill.position.set(0.5, 2.1, 0.4); OFF.root.add(offFill);

  // ---------------------------------------------------------------- SHOTS (hard cuts; each = one place, one slow move)
  const head3 = (tt, r) => headW(r);
  const SHOTS = [
    { id: 'train', t0: T0('train'), set: 'sub', cam: (tt) => cam2(tt, T0('train'), TRAIN_HOLD, Sw(0.15, 1.45, 7.75), Sw(0.62, 1.3, 7.3), Sw(0.3, 1.0, -3), Sw(1.0, 1.42, -2), 52, 50) },
    { id: 'due', t0: T0('due'), set: 'bath', cam: (tt) => cam2(tt, T0('due'), T0('skip'), Bw(0.5, 1.5, 1.75), Bw(0.45, 1.46, 1.6), Bw(-0.35, 1.0, -0.55), Bw(-0.32, 1.0, -0.52), 52, 50) },
    { id: 'skip', t0: t.skip - 0.06, set: 'bath', cam: (tt) => cam2(tt, t.skip, T0('d3'), Bw(-0.85, 1.45, -0.62), Bw(-0.75, 1.42, -0.5), Bw(0.5, 1.05, 1.3), Bw(0.5, 1.05, 1.3), 54, 52) },
    { id: 'd3', t0: T0('d3'), set: 'street', season: 'summer', cam: (tt) => { const p = P3(tt); return { pos: [p[0] + 2.35, 1.42, -0.98], look: [p[0] - 5, 0.95, -1.45], fov: 46 }; } },
    { id: 'd10', t0: T0('d10'), set: 'street', season: 'summer', cam: (tt) => { const h = head3(tt, you), u = u01(tt, T0('d10'), T0('d30')); return { pos: [h[0] + 1.75 - 0.25 * u, h[1] + 0.12, h[2] + 0.15], look: [h[0], h[1] + 0.04, h[2]], fov: 34 }; } },
    { id: 'd30', t0: T0('d30'), set: 'street', season: 'summer', cam: (tt) => { const p = P30(tt); return { pos: [p[0] - 0.3, 1.32, 3.1], look: [p[0] - 0.35, 0.95, -1.5], fov: 48 }; } },
    { id: 'blind', t0: T0('blind'), set: 'street', season: 'summer', cam: (tt) => cam2(tt, T0('blind'), T0('d80'), [9.3, 1.28, 1.95], [9.32, 1.25, 1.6], [9.35, 0.98, -1.6], [9.35, 0.97, -1.6], 46, 45) },
    { id: 'd80', t0: T0('d80'), set: 'street', season: 'autumn', cam: (tt) => cam2(tt, T0('d80'), T0('crust'), [3.4, 3.9, 9.2], [2.6, 3.4, 9.0], [-0.4, 0.4, -0.6], [0.2, 0.4, -0.6], 50, 48) },
    { id: 'crust', t0: T0('crust'), set: 'street', season: 'winter', pov: true, cam: (tt) => { const p = PCR(tt), bob = 0.025 * Math.sin(tt * 9.5); return { pos: [p[0] + 0.05, 1.24 + bob, p[2] + 0.02], look: [p[0] - 3.2, 0.62, p[2] - 0.15], fov: 52 }; } },
    { id: 'flies', t0: T0('flies'), set: 'lib', cam: (tt) => cam2(tt, T0('flies'), T0('prof'), Lw(0.25, 1.3, 0.55), Lw(0.18, 1.25, 0.3), Lw(-0.05, 1.05, -0.9), Lw(-0.05, 1.05, -0.92), 46, 44) },
    { id: 'prof', t0: T0('prof'), set: 'office', cam: (tt) => cam2(tt, T0('prof'), t.wont, Ow(0.32, 1.32, -0.05), Ow(0.26, 1.28, -0.25), Ow(0.0, 1.12, -1.4), Ow(0.0, 1.12, -1.4), 40, 40) },
    { id: 'ten', t0: t.wont - 0.06, set: 'office', cam: (tt) => cam2(tt, t.wont, T0('forty'), Ow(-0.4, 2.5, -2.3), Ow(-0.35, 2.35, -2.0), Ow(0.1, 0.55, 1.2), Ow(0.1, 0.6, 1.2), 50, 48) },
    { id: 'forty', t0: T0('forty'), set: 'office', cam: (tt) => cam2(tt, T0('forty'), T0('scribe'), Ow(0.2, 1.12, -0.75), Ow(0.18, 1.1, -0.5), Ow(0.12, 0.84, 1.72), Ow(0.12, 0.84, 1.72), 40, 40) },
    { id: 'open', t0: T0('scribe'), set: 'lib', cam: (tt) => cam2(tt, T0('scribe'), t.scribe, Lw(0.5, 1.4, 1.6), Lw(0.45, 1.36, 1.38), Lw(-0.05, 0.98, -0.95), Lw(-0.05, 0.98, -0.95), 44, 44) },
    { id: 'screen', t0: t.scribe - 0.06, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.one - 0.06, set: 'lib', pov: true, cam: (tt) => { const s = Lw(LD.sheet[0], Y, LD.sheet[1]); return cam2(tt, t.one, T0('hand'), add(s, [0.12, 0.95, 0.85]), add(s, [0.1, 0.9, 0.72]), add(s, [0.03, 0.32, 0.05]), add(s, [0.03, 0.32, 0.05]), 44); } },
    { id: 'solve', t0: T0('hand'), set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'macro', t0: t.written - 0.08, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'shower', t0: T0('shower'), set: 'bath', cam: (tt) => cam2(tt, T0('shower'), S1('shower') + 0.2, Bw(0.92, 1.55, 1.15), Bw(0.75, 1.45, 0.95), Bw(-0.45, 1.05, -0.7), Bw(-0.45, 1.08, -0.72), 52, 50) },
    { id: 'bliss', t0: S1('shower') + 0.2, set: 'bath', cam: (tt) => { const h = head3(tt, you), u = u01(tt, S1('shower'), T0('hours')); return { pos: [h[0] + 0.55, h[1] + 0.12, h[2] + 2.15 - 0.25 * u], look: [h[0], h[1] - 0.1, h[2]], fov: 40 }; } },
    { id: 'hours', t0: T0('hours'), set: 'bath', cam: (tt) => cam2(tt, T0('hours'), END, Bw(0.7, 1.45, 1.05), Bw(0.95, 1.6, 1.2), Bw(-0.35, 1.2, -0.75), Bw(-0.35, 1.25, -0.75), 52, 54) },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; });
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };
  // the cold open replays the train's end state; the rewind plays earlier shots backwards (VHS)
  const RWMAP = [[0, 20.45], [0.28, 19.1], [0.3, 18.2], [0.52, 16.8], [0.54, 12.6], [0.76, 11.1], [0.78, 5.6], [1, T0('due') + 0.02]];
  const rwTau = (tt) => { const u = u01(tt, RW0, RW1); for (let i = 0; i < RWMAP.length - 1; i++) { const [a, x] = RWMAP[i], [b, y] = RWMAP[i + 1]; if (u <= b) return lerp(x, y, (u - a) / Math.max(1e-4, b - a)); } return RWMAP[RWMAP.length - 1][1]; };
  window.EDSTUDIO_CUTS = [RW0, ...SHOTS.slice(1).map((s) => s.t0).filter((x) => x > RW1)];
  const kickR = makeKick(KICKS);
  const vhs = addVhsPass(studio);

  // screen insert + the pen macro (049)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) { LIB.laptop.scr.updateWorldMatrix(true, false); LIB.laptop.scr.getWorldPosition(scrP); LIB.laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq); const d = 1.75; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.02, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.02 - dy, scrP.z], fov: 40 }; }
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  function macroCam(tt) { const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length); return { pos: add(m, [-0.06, 0.3, 0.2]), look: add(m, [0.01, 0, -0.02]), fov: 44 }; }

  // ---------------------------------------------------------------- the text layer (@whatifpov grammar)
  const subs = story.order.filter((id) => story.beats[id].sub).map((id, i, arr) => { const nx = arr[i + 1]; const t1 = Math.min(S1(id) + 0.6, nx ? S0(nx) - 0.08 : ENDC - 0.05); return { t0: S0(id) - 0.06, t1, text: story.beats[id].sub }; });
  const DAYK = [[RW0, 183], [RW1, 1], [S0('d3'), 3], [S0('d10'), 10], [S0('d30'), 30], [S0('blind'), 45], [S0('d80'), 80], [S0('crust'), 130], [S0('train'), 180], [S0('flies'), 210], [S0('prof'), 220], [S0('shower') - 0.4, 220], [S0('shower') + 0.3, 221], [RST0, 221], [RST1, 0]];
  const pov = createPov({
    title: { html: 'What if you didn’t<br>shower for 365 days?', t0: 0.04, t1: COLD1 },
    rewind: [[RW0, RW1 + 0.05], [RST0 - 0.05, RST1 + 0.3]],
    hud: {
      show: [RW0, ENDC + 0.2], label: [[0, 'WITHOUT A SHOWER']],
      value: (tt) => `Day ${Math.round(keysAt(DAYK, tt))}`,
      bpm: (tt) => keysAt([[RW0, 96], [RW1, 72], [S0('d30'), 80], [S0('d80'), 86], [S0('train'), 92], [S0('prof'), 104], [S0('forty'), 118], [S0('scribe'), 96], [S0('shower'), 76], [RST1, 62]], tt),
      facts: [[RW0, 'BODY LICE LIVE IN UNWASHED CLOTHES', true], [RW1, '10 MINUTES SAVED EVERY MORNING'], [S0('d3') - 0.1, 'NOBODY NOTICES YET'], [S0('d10') - 0.1, "SEBUM: YOUR SCALP'S OWN OIL"],
        [S0('d30') - 0.1, 'SWEAT HAS NO SMELL. BACTERIA MAKE IT', true], [S0('blind') - 0.1, 'NOSE-BLIND TO YOUR OWN SMELL'], [S0('d80') - 0.1, 'STRANGERS KEEP THEIR DISTANCE'],
        [S0('crust') - 0.1, 'DERMATITIS NEGLECTA: A SKIN CRUST', true], [S0('train') - 0.1, 'BODY LICE LIVE IN UNWASHED CLOTHES', true], [S0('flies') - 0.1, 'HOMEWORK PILE: 4 FT AND RISING', true],
        [S0('prof') - 0.1, 'YOUR PROFESSOR: 10 FT AWAY'], [S0('forty') - 0.1, '40 PROBLEMS · HANDWRITTEN · DUE 8 AM', true], [S0('scribe') - 0.1, 'SCRIBE: ONE PHOTO OF THE SHEET'],
        [S0('hand') - 0.1, 'SOLVED, IN YOUR OWN HANDWRITING'], [RST0, 'FIRST SHOWER IN 221 DAYS']],
    },
    subs,
    end: { t: ENDC, icon: '/videos/049-scribe-promo/scribe-icon.png', tag: 'Your homework, in your handwriting.', url: 'tryscribe.ink', offer: '10 free assignments ✦' },
  });

  // ---------------------------------------------------------------- per-frame
  function setWorld(sh) {
    ST.root.visible = sh.set === 'street'; BA.root.visible = sh.set === 'bath'; SU.root.visible = sh.set === 'sub'; LIB.root.visible = sh.set === 'lib'; OFF.root.visible = sh.set === 'office';
    if (sh.set === 'street') { scene.fog = streetFog; scene.background = null; renderer.toneMappingExposure = 1.0; studio.camera.far = 400; }
    else { scene.fog = null; scene.background = new THREE.Color(sh.set === 'lib' ? 0x14100c : 0x1c1a18); studio.camera.far = 60; renderer.toneMappingExposure = sh.set === 'lib' ? 1.1 : 1.0; }
    studio.camera.updateProjectionMatrix();
  }

  function scene3d(tau, tt) {   // tau = story time of the picture (the cold open + rewind remap it); tt = real time (idle motion)
    const sh = shotAt(tau), id = sh.id; setWorld(sh);
    for (const r of [you, woman, prof]) r.root.visible = false;
    crowd.hideAll(); pigeon.root.visible = false; poleG.visible = false; seatTower.visible = false; carry.visible = false; povArm.visible = false; shotHand.visible = false; pen.g.visible = false; foam.visible = false;
    flies(null, 0, tt); stink(null); sparks.forEach((s) => (s.visible = false)); bubbles.forEach((b) => (b.visible = false)); glowL.intensity = 0;
    you.M.hair.roughness = hairBase.r; you.M.hair.metalness = hairBase.m; you.M.skin.roughness = skinBase;
    you.M.shirt.color.copy(shirtC); you.M.pants.color.copy(pantsC);
    BA.door.rotation.y = -1.45;
    let fxT = tau;

    // ----- bathroom, morning: the shower runs; you choose the homework
    if (id === 'due' || id === 'skip') {
      you.root.visible = true; carry.visible = true; carry.setN(3); bathStack.visible = false;
      // due: facing the running shower, then you turn to us with the stack ("due at eight"); skip: out the door, then one finger up
      const leave = id === 'skip', u = smooth(u01(tau, t.skip + 0.05, t.just - 0.12));
      const p = leave ? [lerp(0.15, 0.5, u), 0, lerp(0.1, 1.08, u)] : [0.15, 0, 0.1];
      const face = smooth(u01(tau, t.due - 0.3, t.due + 0.05));
      const turn = leave ? lerp(0.36, 0.25, u) : lerp(-2.3 + 0.2 * Math.sin(tau * 1.3), 0.36, face);
      const finger = leave && tau > t.just - 0.12, w = leave && tau > t.skip && tau < t.just - 0.12 ? tau * 10 : null;
      youSet({ x: BO[0] + p[0], y: 0, z: BO[2] + p[2], rotY: finger ? lerp(0.25, -2.45, smooth(u01(tau, t.just - 0.12, t.just + 0.18))) : turn, walk: w, ...CARRY,
        armR: finger ? { x: -2.5, z: 0.35, el: 0.5 } : CARRY.armR, eyes: finger ? 'half' : tau > t.eight - 0.05 ? 'wide' : 'open', mouth: finger ? 'grin' : tau > t.eight - 0.05 ? 'o' : 'flat', brows: finger ? -0.3 : 0.6,
        look: finger ? [0, 0.1] : face > 0.5 ? [0, -0.75] : [0, 0], head: { x: !leave && face > 0.5 ? 0.22 : 0 } }, tt);
    } else bathStack.visible = true;

    // ----- the street
    if (id === 'd3') {
      you.root.visible = true; carry.visible = true; carry.setN(4); const p = P3(tau);
      youSet({ x: p[0], y: p[1], z: p[2], rotY: -PI / 2, walk: tau * 9.5, ...CARRY, eyes: 'open', mouth: 'smile', look: [0, 0] }, tt);
      for (let i = 0; i < 6; i++) { const z = i % 2 ? -2.35 : -0.3, x = p[0] - 3.2 - i * 2.4 + 1.1 * (tau - T0('d3')); crowd.set(i, { x, y: SH, z, rotY: PI / 2, kick: 1, t: tau + i, armL: { x: Math.sin(tau * 9 + i) * 0.6 }, armR: { x: -Math.sin(tau * 9 + i) * 0.6 }, look: [0, 0] }); }
    }
    if (id === 'd10') {
      you.root.visible = true; carry.visible = true; carry.setN(4); const p = P10(tau);
      you.M.hair.roughness = 0.12; you.M.hair.metalness = 0.35; you.M.skin.roughness = 0.22;
      youSet({ x: p[0], y: p[1], z: p[2], rotY: PI / 2, walk: tau * 8.5, walkAmt: 0.6, ...CARRY, eyes: 'open', mouth: tau > t.shiny ? 'grin' : 'smile', brows: -0.2, look: [0, 0.05] }, tt);
      const h = headW(you);
      sparks.forEach((s, i) => { const tb = t.never + i * 0.22, a = tau - tb; s.visible = a > 0 && a < 0.7; if (!s.visible) return; s.material.opacity = Math.sin(PI * a / 0.7); const off = [[0.05, 0.27, 0.12], [-0.12, 0.22, 0.14], [0.14, 0.12, 0.2], [-0.04, 0.1, 0.25], [0.1, 0.3, 0.02], [-0.15, 0.28, 0.0]][i]; s.position.set(h[0] + off[2], h[1] + off[1], h[2] - off[0]); s.scale.setScalar(0.09 + 0.07 * Math.sin(PI * a / 0.7)); s.material.rotation = a * 2; });
    }
    if (id === 'd30') {
      you.root.visible = true; carry.visible = true; carry.setN(5); const p = P30(tau);
      youSet({ x: p[0], y: p[1], z: p[2], rotY: PI / 2, walk: tau * 9, ...CARRY, eyes: 'open', mouth: 'smile', look: [0.3, 0] }, tt);
      woman.root.visible = true;
      const rel = 1.9 * (t.smell + 0.05 - tau), hit = tau > t.smell + 0.12, a = tau - (t.smell + 0.12);
      const wx = p[0] + rel + (hit ? -0.6 * a : 0);
      woman.set({ x: wx, y: SH, z: -2.05 + (hit ? Math.min(0.35, a * 0.5) * -1 : 0), rotY: hit ? -PI / 2 + 0.9 : -PI / 2, walk: hit ? null : tau * 9.5, lean: hit ? -0.25 : 0.03,
        armL: hit ? { x: -2.2, z: 0.3, el: 2.0 } : {}, armR: hit ? { x: -0.5, z: 1.4, el: 0.6 } : {}, eyes: hit ? (a > 0.35 ? 'spiral' : 'wide') : 'open', mouth: hit ? 'wavy' : 'smile', brows: hit ? 0.8 : 0,
        faceTint: hit ? [0x7bd34a, Math.min(0.6, a * 1.2)] : [0, 0], head: { x: hit ? -0.25 : 0 }, t: tau });
      if (tau > t.smell - 0.2) stink(add(p, [0, 1.05, 0]), smooth(u01(tau, t.smell - 0.2, t.smell + 0.2)), tt, 1.0);
      for (let i = 0; i < 4; i++) { const x = p[0] + 4 + i * 1.8 - 1.0 * (tau - T0('d30')); crowd.set(i, { x, y: SH, z: -2.5 + (i % 2) * 0.2, rotY: -PI / 2, kick: 1, t: tau + i * 3, armL: { x: Math.sin(tau * 9 + i) * 0.5 }, armR: { x: -Math.sin(tau * 9 + i) * 0.5 } }); }
    }
    if (id === 'blind') {
      you.root.visible = true; const sn = tau > t.smells - 0.1 && tau < t.butB + 0.05, happy = tau >= t.butB + 0.05;
      youSet({ x: SNIFF[0], y: SNIFF[1], z: SNIFF[2], rotY: -0.25, armL: sn ? { x: -0.1, z: 2.5, el: 0.9 } : happy ? { x: -0.3, z: 0.9, el: 1.4 } : {}, armR: happy ? { x: -0.3, z: 0.9, el: 1.4 } : {},
        head: sn ? { y: 0.75, x: 0.35, z: 0.2 } : { y: 0, z: happy ? -0.12 : 0 }, eyes: sn ? 'closed' : happy ? 'half' : 'open', mouth: sn ? 'o' : happy ? 'grin' : 'smile', brows: happy ? -0.4 : 0, look: [0, 0] }, tt);
      stink(add(SNIFF, [0, 1.05, 0]), 1, tt, 1.15);
      pigeon.root.visible = true; const out = smooth(u01(tau, t.youB - 0.05, t.youB + 0.25));
      pigeon.set({ x: PIG[0], y: PIG[1], z: PIG[2], rotY: -1.2, t: tau, out, peck: out > 0 ? 0 : 1 });
      for (let i = 0; i < 2; i++) { const away = smooth(u01(tau, T0('blind') + 0.2 + i * 0.4, T0('d80'))); crowd.set(i, { x: 7.2 - i * 1.0 - away * 1.6, y: SH, z: -2.4 + i * 0.3, rotY: -PI / 2 + 0.3, kick: 1, t: tau * 1.6 + i, armL: { x: -2.4, z: 0.2 }, armR: { x: Math.sin(tau * 12) * 0.6 }, wide: true, headY: 0.6 }); }
    }
    if (id === 'd80') {
      you.root.visible = true; carry.visible = true; carry.setN(7); const p = P80(tau);
      youSet({ x: p[0], y: p[1], z: p[2], rotY: PI / 2, walk: tau * 9, ...CARRY, eyes: 'open', mouth: 'smile', look: [0, 0] }, tt);
      stink(add(p, [0, 1.05, 0]), 1, tt, 1.3);
      crossers.forEach((c, i) => { const [x, z, cr] = crAt(c, tau); const onRoad = z > 0.05 && z < 7.0; crowd.set(i, { x, y: onRoad ? 0 : SH, z, rotY: cr ? -PI / 2 + 0.95 : -PI / 2, kick: 1, t: tau * 1.2 + c.ph, armL: cr ? { x: -2.3, z: 0.2 } : { x: Math.sin(tau * 9 + c.ph) * 0.5 }, armR: { x: -Math.sin(tau * 9 + c.ph) * 0.5 }, wide: !!cr, headY: cr ? -0.7 : 0, look: cr ? [-0.6, 0] : [0, 0] }); });
    }
    if (id === 'crust') {
      povArm.visible = true; const p = PCR(tau);
      for (let i = 0; i < 4; i++) { const x = p[0] - 3.5 - i * 1.9 - 0.4 * (tau - T0('crust')), z = -0.5 - (i % 2) * 1.5, flinch = i === 0 ? smooth(u01(tau, t.brown, t.crust)) : 0; crowd.set(i, { x, y: SH, z: z - flinch * 0.8, rotY: PI / 2 - flinch * 1.2, kick: 0.6, t: tau + i, wide: flinch > 0.3, armL: flinch > 0.3 ? { x: -2.3, z: 0.2 } : {}, look: [0, 0] }); }
    }
    if (sh.set === 'street') {
      const c = id === 'crust' ? PCR(tau) : id === 'd80' ? P80(tau) : id === 'd30' ? P30(tau) : id === 'd10' ? P10(tau) : id === 'd3' ? P3(tau) : SNIFF;
      ST.setSeason(sh.season, tt, [c[0], c[2]]); ST.aimSun(c[0], c[2], 9);
    }

    // ----- the train (also the cold open: the state after the car emptied)
    if (id === 'train') {
      you.root.visible = true; seatTower.visible = true; seatTower.setN(12); seatTower.position.set(...Sw(1.17, 0.45, 3.95)); seatTower.rotation.y = 0.2;
      const relax = smooth(u01(tau, t.empties + 0.25, t.empties + 0.85));
      youSet({ x: SO[0] + YOU_T[0], y: YOU_T[1], z: SO[2] + YOU_T[2], rotY: -PI / 2, ...SIT, lean: lerp(0.06, -0.2, relax), armL: relax > 0.5 ? BEHIND.armL : { x: -0.5, z: 0.25, el: 1.3 }, armR: relax > 0.5 ? BEHIND.armR : { x: -0.5, z: 0.25, el: 1.3 },
        eyes: relax > 0.5 ? 'half' : 'open', mouth: relax > 0.5 ? 'grin' : 'flat', brows: relax > 0.5 ? -0.3 : 0, look: relax > 0.5 ? [0.5, 0.15] : [0.6, 0], head: { y: relax > 0.5 ? 0.7 : 0.4, z: relax > 0.5 ? -0.08 : 0 } }, tt);
      const hy = headW(you); flies(add(hy, [0, 0.15, 0]), 9, tt, 0, 1.2); stink(add(hy, [0, -0.15, 0]), 1, tt, 1.2);
      riders.forEach((r, i) => {
        const P = TPOS(r, tau), going = tau > r.go, moving = P.u > 0.02 && P.u < 0.98;
        const seated = r.sit && !going, y = seated ? 0.09 : 0;
        crowd.set(i, { x: SO[0] + P.x, y: y + (moving ? Math.abs(Math.sin(tau * 12 + r.ph)) * 0.05 : 0.01 * Math.sin(tt * 2 + r.ph)), z: SO[2] + P.z, rotY: going ? (moving ? PI : 0.15 * Math.sin(r.ph)) : r.rot,
          sit: seated ? 1 : 0, kick: moving ? 1 : 0, t: tau, wide: going, lean: moving ? 0.3 : 0, armL: going && !moving && i % 3 === 0 ? { x: -2.3, z: 0.2 } : moving ? { x: Math.sin(tau * 12 + r.ph) * 0.8 } : seated ? { x: -0.5, z: 0.2, el: 1.2 } : { x: -2.6, z: 0.3 },
          armR: moving ? { x: -Math.sin(tau * 12 + r.ph) * 0.8 } : seated ? { x: -0.5, z: 0.2, el: 1.2 } : {}, look: going ? [0.1 * Math.sin(r.ph), 0.1] : [0.4 * Math.sin(r.ph * 3), -0.2], headY: going && !moving ? 0.2 * Math.sin(r.ph) : 0 });
      });
      SU.update(tt, 10);
    }

    // ----- the library desk at night: asleep on the homework, flies (spring)
    if (id === 'flies') {
      you.root.visible = true; deskTower.setN(20); pillow.visible = true; floorTowers.forEach((s) => (s.visible = true)); plant.visible = true;
      const snore = 0.04 * Math.sin(tt * 2.2);
      youSet({ x: TY[0], y: TY[1], z: TY[2], rotY: 0, ...SIT, lean: -0.22 + snore, armL: { x: -0.2, z: 0.5, el: 0.3 }, armR: { x: -1.25, z: 0.45, el: 1.1 }, head: { x: -0.28, y: 0.12, z: 0.25 }, eyes: 'closed', mouth: 'o', brows: 0.2, look: [0, 0] }, tt);
      const hy = headW(you); flies(add(hy, [0, 0.08, 0.22]), 14, tt, 0, 1.0); stink(add(hy, [0.0, -0.45, 0.1]), 1, tt, 0.9);
      LIB.laptop.hinge.rotation.x = PI / 2 - 0.02; LIB.scrL.intensity = 0; LIB.setClock(3, 12);
    } else { pillow.visible = sh.set === 'lib' && false; }

    // ----- the professor's office: ten feet + a pole
    if (sh.set === 'office') {
      prof.root.visible = true; you.root.visible = true; poleG.visible = true;
      // the pole: held up (prof close-up) → swung out to you across the 10-ft tape → you take the sheet (forty: it's in your hands)
      const out = easeOutBack(u01(tau, POLE_OUT, POLE_OUT + 0.45)), cooked = tau > t.by - 0.05, held = id === 'forty';
      const tip = held ? add(POLE_UP, [0, 0, -0.6]) : [lerp(POLE_UP[0], POLE_TIP[0], out), lerp(POLE_UP[1], POLE_TIP[1], out) + 0.02 * Math.sin(tt * 3), lerp(POLE_UP[2], POLE_TIP[2], out)], base = add(PROF, [0.18, 1.0, 0.42]);
      const d = V(tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]), L = d.length();
      pole.scale.set(1, L, 1); pole.position.set((tip[0] + base[0]) / 2, (tip[1] + base[1]) / 2, (tip[2] + base[2]) / 2); pole.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
      clampM.visible = !held; clampM.position.set(tip[0], tip[1] + 0.27, tip[2]);
      if (held) { poleSheet.position.set(YOU_O[0], 0.73 + 0.012 * Math.sin(tt * 18) * (cooked ? 1 : 0), YOU_O[2] - 0.34); poleSheet.rotation.set(0.12, PI, 0); poleSheet.scale.setScalar(0.62); }
      else { poleSheet.position.set(tip[0], tip[1], tip[2] + 0.02); poleSheet.rotation.set(-0.12, 0, 0.03 * Math.sin(tt * 2.5)); poleSheet.scale.setScalar(1); }
      const gag = 0.3 + 0.08 * Math.sin(tt * 7);
      prof.set({ x: PROF[0], y: PROF[1], z: PROF[2], rotY: 0, lean: -0.18, armR: { x: -1.25, z: 0.15, el: 0.35 }, armL: { x: -1.15, z: -0.05, el: 0.6 }, eyes: 'half', mouth: 'wavy', brows: 0.75,
        faceTint: [0x7bd34a, gag], head: { x: -0.18, y: 0.08 * Math.sin(tt * 5) }, look: [0, 0.2], t: tt });
      youSet({ x: YOU_O[0], y: 0, z: YOU_O[2], rotY: PI, armL: held ? { x: -0.95, z: 0.3, el: 0.75 } : {}, armR: held ? { x: -0.95, z: 0.3, el: 0.75 } : {}, eyes: cooked ? 'spiral' : tau > t.forty ? 'wide' : 'open', mouth: cooked ? 'wavy' : tau > t.forty ? 'o' : 'flat',
        brows: cooked ? 0.9 : 0.3, look: [0, -0.1], head: { x: cooked ? 0.1 : 0, z: cooked ? 0.08 * Math.sin(tt * 14) : 0 } }, tt);
      const hy = headW(you); flies(add(hy, [0, 0.15, 0]), 8, tt, 0, 1.2); stink(add(hy, [0, -0.25, -0.2]), id === 'forty' ? 0.55 : 0.9, tt, 1.2);
    }

    // ----- the desk: Scribe (049's kit)
    if (sh.set === 'lib' && id !== 'flies') {
      const povS = !!sh.pov; you.root.visible = !povS; LIB.chair.visible = !povS; deskTower.setN(20); floorTowers.forEach((s) => (s.visible = true)); plant.visible = true;
      const lid = tau < LID0 ? PI / 2 - 0.02 : lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tau, LID0, LID1)));
      LIB.laptop.hinge.rotation.x = lid; LIB.scrL.intensity = tau > LID0 ? 1.6 : 0;
      const mode = tau < FLASH ? 'home' : tau < SOLVE0 ? 'scan' : tau < WRITE0 ? 'solve' : 'write';
      const k = mode === 'scan' ? u01(tau, FLASH + 0.1, SOLVE0) : mode === 'solve' ? u01(tau, SOLVE0, SOLVE1) : 0;
      sheet.draw(writeP(tau)); screen.draw({ mode, k }); LIB.setClock(3, 40);
      const lit = tau > LID1;
      youSet({ x: TY[0], y: TY[1], z: TY[2], rotY: 0, ...SIT, lean: 0.25, armL: { x: -0.35, z: 0.4, el: 1.5 }, armR: tau > t.open - 0.15 && tau < LID1 + 0.2 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: lit ? 'wide' : 'half', mouth: lit ? 'o' : 'flat', brows: 0.4, look: lit ? [0.35, -0.35] : [-0.15, -0.6], faceTint: lit ? [0xffd0d0, 0.1] : [0, 0] }, tt);
      if (!povS) { const hy = headW(you); flies(add(hy, [0, 0.15, 0]), 6, tt, 0, 1.2); }
      shotHand.visible = id === 'photo'; if (shotHand.visible) { const u = smooth(u01(tau, t.one - 0.1, t.photo - 0.05)); shotHand.position.set(LD.sheet[0] + 0.05, Y + lerp(0.55, 0.4, u), LD.sheet[1] + lerp(0.5, 0.2, u)); shotHand.rotation.set(0.1, 0, 0); flashSpr.material.opacity = tau > FLASH ? 1 - u01(tau, FLASH, FLASH + 0.25) : 0; }
      pen.g.visible = tau > WRITE0 - 0.4;
      if (pen.g.visible) { const tip = tipWorld(writeP(tau)), loc = LIB.root.worldToLocal(V(...tip)), from = V(LD.laptop[0], Y + 0.25, LD.laptop[1]), u = smooth(u01(tau, WRITE0 - 0.4, WRITE0)), scrib = tau > WRITE0 ? 0.004 * Math.sin(tau * 60) : 0;
        pen.g.position.set(lerp(from.x, loc.x, u) + scrib, lerp(from.y + 0.15, loc.y + 0.004, u) + (1 - u) * 0.2 * Math.sin(u * PI), lerp(from.z, loc.z, u)); pen.g.rotation.set(-0.5, 0.4, -0.55 + scrib * 20); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tau * 20); }
    }
    if (sh.set !== 'lib') { deskTower.setN(20); }

    // ----- THE shower: in the tub, water on, the crust melts, flies flee, lather, bubbles, three hours
    if (id === 'shower' || id === 'bliss' || id === 'hours') {
      you.root.visible = true; bathStack.visible = true;
      const hop = smooth(u01(tau, T0('shower') + 0.05, t.finally - 0.25)), on = tau > WATER_ON, clean = smooth(u01(tau, WATER_ON + 0.15, WATER_ON + 2.4));
      const p = [lerp(0.05, -0.5, hop), lerp(0, BD.tubFloor, hop) + 0.28 * Math.sin(PI * hop), lerp(0.05, (BD.tub.z0 + BD.tub.z1) / 2, hop)];
      you.M.shirt.color.setHex(SKIN); you.M.pants.color.setHex(0x4aa3df);   // shirt off, swim shorts on
      const bliss = tau > WATER_ON + 0.4;
      you.set({ x: BO[0] + p[0], y: p[1], z: BO[2] + p[2], rotY: hop < 0.5 ? -2.2 : lerp(-0.6, 0.25, smooth(u01(tau, t.finally - 0.3, WATER_ON + 0.3))), t: tt, beard: 0,
        mud: 0.85 * (1 - clean), mudColor: 0x6b4a2b, walk: hop > 0 && hop < 1 ? tau * 9 : null,
        armL: bliss ? { x: 0.2, z: 2.6, el: 2.3 } : on ? { x: -0.3, z: 1.3, el: 0.4 } : {}, armR: bliss ? { x: 0.2, z: 2.6, el: 2.3 } : on ? { x: -0.3, z: 1.3, el: 0.4 } : {},
        eyes: bliss ? 'closed' : on ? 'wide' : 'open', mouth: bliss ? 'grin' : on ? 'o' : 'smile', brows: bliss ? -0.2 : 0.6, look: [0, 0.4], head: { x: bliss ? -0.25 : 0, z: bliss ? 0.06 * Math.sin(tt * 2) : 0 } });
      foam.visible = tau > WATER_ON + 0.5; foam.scale.setScalar(easeOutBack(u01(tau, WATER_ON + 0.5, WATER_ON + 1.4)) * (1 + 0.04 * Math.sin(tt * 3)));
      const hy = headW(you);
      flies(add(hy, [0, 0.15, 0]), 10, tt, smooth(u01(tau, WATER_ON + 0.1, WATER_ON + 1.4)), 1.2);
      stink(add(hy, [0, -0.2, 0]), 1 - clean, tt, 1.2);
      glowL.intensity = 3.2 * smooth(u01(tau, WATER_ON + 0.4, WATER_ON + 1.2)); glowL.position.set(hy[0] + 0.4, hy[1] + 0.5, hy[2] + 0.7);
      bubbles.forEach((b, i) => {
        let best = null; for (let k = i; k < bubP.length; k += BUBN) { const q = bubP[k], a = tau - q.tb; if (a >= 0 && a < 3.2) best = { q, a }; }
        if (!best) { b.visible = false; return; }
        const { q, a } = best; b.visible = true; b.material.opacity = Math.min(1, a / 0.2) * (1 - smooth(u01(a, 2.6, 3.2)));
        b.position.set(TUBC[0] + q.x + 0.06 * Math.sin(a * 3 + q.ph), TUBC[1] + q.y + a * q.v, TUBC[2] + 0.35 + q.z); b.scale.setScalar(q.s * (1 + 0.1 * Math.sin(a * 5)));
      });
      const ck = smooth(u01(tau, T0('hours') + 0.1, ENDC)); const hrs = 7 + 3 * ck; bclock.set(Math.floor(hrs) % 12 || 12, (hrs % 1) * 60);
    } else bclock.set(7, 2);
    if (id === 'due' || id === 'skip') { const hy = headW(you); void hy; }

    crowd.commit();
    return { sh, fxT };
  }

  function update(tt) {
    // the cold open = the train after it emptied; the rewind = earlier shots played backwards through a VHS
    let tau = tt;
    if (tt < COLD1) tau = TRAIN_HOLD; else if (tt < RW1) tau = rwTau(tt);
    const { sh } = scene3d(tau, tt);
    let cam = sh.cam(tau);
    if (tt < COLD1) cam = cam2(tt, 0, COLD1, Sw(0.62, 1.3, 7.3), Sw(0.58, 1.3, 7.0), Sw(1.0, 1.42, -2), Sw(0.98, 1.42, -2), 50, 49);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    if (povArm.visible) { povArm.position.copy(studio.camera.position); povArm.quaternion.copy(studio.camera.quaternion); }
    drawStink(studio.camera.position);
    studio.fill.intensity = sh.set === 'street' ? 0.45 : 0.6; studio.fill.distance = 9;
    fx.update(tau, studio.camera);
    const rk = tt >= RW0 && tt < RW1 ? Math.min(1, (tt - RW0) / 0.08, (RW1 - tt) / 0.1) : 0;
    vhs.set(rk, tt);
    pov.update(tt);
  }

  // QC hook: faces under the subtitle band / HUD, shot list
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0);
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of [['you', you], ['woman', woman], ['prof', prof]]) {
        if (!r.root.visible) continue; r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0 || hx > 1 || hy < 0 || hy > 1) continue;
        const sb = subs.find((s) => tt >= s.t0 && tt <= s.t1); if (sb && hy > 0.62 && hy < 0.74 && Math.abs(hx - 0.5) < 0.3) out.push(`${tt.toFixed(1)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under the subtitle`);
        if (tt > RW0 && tt < ENDC && hy > 0.22 && hy < 0.36 && hx < 0.45) out.push(`${tt.toFixed(1)}s ${who}'s face (x ${(hx * 100).toFixed(0)}%, y ${(hy * 100).toFixed(0)}%) under the HUD`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)}`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}
