// 052 — Scribe promo in the SIM style (docs/STYLES.md → sim; @officialwriteit's Sims-like look): "I upgraded my bedroom every day
// until I never had to leave it." A dollhouse-cutaway ranch house (engine/sim/house.js), a realistic teen (engine/sim/person.js) who
// gets one upgrade per beat — a mini fridge, a light-switch pulley (at night), a swing desk, a snack chute from Mom's kitchen, a robot
// arm, a ceiling TV, a bed on rails that drives to the window, a delivery drone. Then the obstacle (~50 %): his teacher emails 40
// problems, HANDWRITTEN ONLY, due tomorrow, and he refuses to get up for a pen → Scribe: one photo of the worksheet → all forty solved
// → written in HIS handwriting stroke by stroke (Scribe's real demo glyphs, engine/build/scribe.js) → printed → the drone flies it to
// school → his teacher finds a perfect match → day 30: the whole house feeds the bed. End card: Scribe, tryscribe.ink.
// Product facts (Scribe repo README + tryscribe.ink, Nov 2026): photo/PDF of the homework in → problems solved with steps → written in
// the student's own handwriting (learned from one practice sheet), stroke by stroke → a PDF; "10 free assignments". Printing and the
// drone are his own upgrades, not Scribe features.
// Every gag is keyed to a spoken word (story.json from tools/narrate.py) so re-voicing keeps it on its word; make_cues.py mirrors the times.
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { basePose, applyPose, blink, HIP_H } from '@engine/rig.js';
import { beatClock, u01, easeOutBack, drop, squash, shake, wobble } from '@engine/build/anim.js';
import { makeSim, simFace, legsOut, legsShow, lift } from '@engine/sim/person.js';
import { buildSimHouse, D, FY, CY, ROOM_C } from '@engine/sim/house.js';
import { simMat } from '@engine/sim/mats.js';
import { makeMiniFridge, makeCan, makeChips, makePizzaBox, makePhone, makeLaptop, makeRope, makePulley, makeBedDesk, makeChute, makeRobotArm, makeDrone, makePrinter, makeRails, makeGrassBox, makePaper } from '@engine/sim/props.js';
import { makeSimHud, SIM_FONTS } from '@engine/sim/hud.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';

const PI = Math.PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const KK = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (t < b) return lerp(va, vb, smooth((t - a) / (b - a))); } return keys[keys.length - 1][1]; };
const pulse = (t, a, b, f = 0.12) => smooth((t - a) / f) * (1 - smooth((t - b) / f));

export async function build(studio, story) {
  const { scene, setCamera, renderer } = studio;
  renderer.localClippingEnabled = true;
  await Promise.all(SIM_FONTS.map((f) => document.fonts.load(f).catch(() => {})));
  const Bc = beatClock(story), W = (b, w, n) => Bc.W(b, w, n), BT = (id) => story.beats[id];
  const H = buildSimHouse(studio, {});
  const BD = H.bed.D, TOP = H.bed.top;
  const G = await loadHand('/videos/052-bedroom-never-leave/hand.json'), icon = await loadImg('/videos/052-bedroom-never-leave/scribe-icon.png');

  // ---------------------------------------------------------------- word times (all gags hang off these)
  const t = {
    upgraded: W('hook', 'upgraded'), never: W('hook', 'never'), leave: W('hook', 'leave'),
    d1: W('fridge', 'day'), mini: W('fridge', 'mini'), fridgeW: W('fridge', 'fridge'), arms: W('fridge', 'arms'), reach: W('fridge', 'reach'),
    d2: W('pulley', 'day'), pulleyW: W('pulley', 'pulley'), neverP: W('pulley', 'never'), touch: W('pulley', 'touch'), switchW: W('pulley', 'switch'), again: W('pulley', 'again'),
    d4: W('desk', 'day'), deskW: W('desk', 'desk'), swings: W('desk', 'swings'), over: W('desk', 'over'), bedD: W('desk', 'bed'),
    d7: W('chute', 'day'), snack: W('chute', 'snack'), chuteW: W('chute', 'chute'), straight: W('chute', 'straight'), kitchen: W('chute', 'kitchen'), mom: W('chute', 'mom'), hates: W('chute', 'hates'),
    d9: W('arm', 'day'), robot: W('arm', 'robot'), feeds: W('arm', 'feeds'), scratches: W('arm', 'scratches'), back: W('arm', 'back'),
    d10: W('tv', 'day'), tvW: W('tv', 'tv'), ceiling: W('tv', 'ceiling'),
    d12: W('window', 'day'), drives: W('window', 'drives'), windowW: W('window', 'window'), touchG: W('window', 'touch'), grass: W('window', 'grass'),
    d15: W('drone', 'day'), droneW: W('drone', 'drone'), deliveries: W('drone', 'deliveries'), pizza: W('drone', 'pizza'), lands: W('drone', 'lands'), lap: W('drone', 'lap'),
    then: W('email', 'then'), emails: W('email', 'emails'), forty: W('email', 'forty'), handwritten: W('email', 'handwritten'), only: W('email', 'only'), due: W('email', 'due'), tomorrow: W('email', 'tomorrow'),
    means: W('refuse', 'means'), finding: W('refuse', 'finding'), pen: W('refuse', 'pen'), refuse: W('refuse', 'refuse'), leaveR: W('refuse', 'leave'), bedR: W('refuse', 'bed'),
    so: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), photo: W('scribe', 'photo'), worksheet: W('scribe', 'worksheet'), solves: W('scribe', 'solves'), fortyS: W('scribe', 'forty'),
    writes: W('hand', 'writes'), every: W('hand', 'every'), handwriting: W('hand', 'handwriting'), stroke: W('hand', 'stroke'), strokeB: W('hand', 'stroke', 2),
    printer: W('deliver', 'printer'), prints: W('deliver', 'prints'), droneD: W('deliver', 'drone'), flies: W('deliver', 'flies'), school: W('deliver', 'school'),
    teacher: W('match', 'teacher'), checks: W('match', 'checks'), old: W('match', 'old'), perfect: W('match', 'perfect'), match: W('match', 'match'),
    d30: W('house', 'day'), whole: W('house', 'whole'), houseW: W('house', 'house'), every2: W('house', 'every'), feedsH: W('house', 'feeds'), bedH: W('house', 'bed'),
    havent: W('last', 'havent'), stood: W('last', 'stood'), october: W('last', 'october'),
  };
  const END = story.duration, ENDCARD = BT('last').s1 + 0.3;
  const S = (id) => BT(id).t0;

  // ---------------------------------------------------------------- cast
  const kid = makeSim({ skin: 0xd6a587, hair: 0x3b2a1d, hairStyle: 'swoop', top: 'hoodie', topColor: 0x4d7a5a, pants: 0x5a5f66, eyes: 0x4a3322 }); scene.add(kid.root);
  const mom = makeSim({ female: true, skin: 0xd9a88a, hair: 0x6b4a32, hairStyle: 'bun', top: 'cardigan', topColor: 0x9a7fa8, pants: 0x3e4a5e, shoes: 0x6b5a4a, sole: 0x3a302a }); scene.add(mom.root);
  const teach = makeSim({ female: true, skin: 0xc68e6e, hair: 0x2a1d16, hairStyle: 'long', top: 'shirt', topColor: 0x3f6f8f, pants: 0x2f3440, glasses: true, shoes: 0x2a2420, sole: 0x2a2420 }); scene.add(teach.root);

  // ---------------------------------------------------------------- the upgrades (bed-local props ride with the bed)
  const bedG = H.bed.g;
  const fridge = makeMiniFridge(); H.root.add(fridge.g); const FR = [-2.42, FY, -3.25]; fridge.g.position.set(...FR);
  const can = makeCan(0xc8322c); scene.add(can);
  const phone = makePhone(); scene.add(phone.g);
  // pulley: rope from a handle by his +x hand, up the headboard corner to a ceiling pulley, across the ceiling, down to the switch
  const pul = [makePulley(), makePulley()]; pul.forEach((p) => H.root.add(p));
  pul[0].position.set(-2.82, CY - 0.1, -4.3); pul[1].position.set(-1.72, CY - 0.1, D.switchPos[2]); pul[1].rotation.y = PI / 2;
  const ropes = [0, 1, 2].map(() => makeRope({ r: 0.012, color: 0xe2c08a })); ropes.forEach((r) => scene.add(r.mesh));
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 10), simMat('plastic', { color: 0xd23a2c })); handle.rotation.z = PI / 2; handle.castShadow = true; scene.add(handle);
  // swing desk (on the bed's left rail) + laptop + the worksheet on it
  const desk = makeBedDesk(); bedG.add(desk.g); desk.g.position.set(-0.86, 0, 1.25);
  desk.arm.children[1].scale.z = 1.25; desk.arm.children[1].position.z = 0.44; desk.top.position.z = 0.87;
  const swingDesk = (k) => { const th = lerp(0.12, 1.74, k); desk.arm.rotation.y = th; desk.top.rotation.y = -th; };
  const sheet = makeSheet(G, { title: 'ALGEBRA II · PROBLEM SET 9', note: 'Due tomorrow, 8:00 AM  ·  HANDWRITTEN WORK ONLY', name: 'Jake', seed: 52, page: 'p. 1 of 7', problems: [
    { q: '1.  Solve  3x + 7 = 22', a: '3x = 15\nx = 5' },
    { q: '2.  Factor  x² − 5x + 6', a: '= (x - 2)(x - 3)' },
    { q: '3.  Solve  x² = 49', a: 'x = 7  or  x = -7' },
    { q: '4.  Simplify  (2x³)²', a: '= 4x^6' },
    { q: '5.  Sketch  y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  Solve  2ˣ = 32', a: '2^x = 2^5\nx = 5' },
  ] });
  const blank = makeSheet(G, { title: 'ALGEBRA II · PROBLEM SET 9', note: 'Due tomorrow, 8:00 AM  ·  HANDWRITTEN WORK ONLY', name: 'Jake', seed: 52, page: 'p. 1 of 7', problems: [
    { q: '1.  Solve  3x + 7 = 22' }, { q: '2.  Factor  x² − 5x + 6' }, { q: '3.  Solve  x² = 49' }, { q: '4.  Simplify  (2x³)²' }, { q: '5.  Sketch  y = x² − 4x + 3' }, { q: '6.  Solve  2ˣ = 32' } ] });
  const oldHw = makeSheet(G, { title: 'ALGEBRA II · PROBLEM SET 8', note: 'Graded  ·  HANDWRITTEN WORK ONLY', name: 'Jake', seed: 41, page: 'p. 1 of 6', problems: [
    { q: '1.  Solve  5x − 3 = 17', a: '5x = 20\nx = 4', pre: true }, { q: '2.  Factor  x² + 7x + 12', a: '= (x + 3)(x + 4)', pre: true }, { q: '3.  Solve  x² = 81', a: 'x = 9  or  x = -9', pre: true },
    { q: '4.  Simplify  (3x²)³', a: '= 27x^6', pre: true }, { q: '5.  Sketch  y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true, pre: true }, { q: '6.  Solve  3ˣ = 81', a: '3^x = 3^4\nx = 4', pre: true } ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Jake' });
  const mail = (() => {   // our own mail client (no real brand): inbox list + the teacher's message
    const c = document.createElement('canvas'); c.width = 1280; c.height = 800; const g = c.getContext('2d'); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    let last = -1;
    const draw = (k) => { const key = Math.round(k * 20); if (key === last) return; last = key;
      g.fillStyle = '#f4f6f9'; g.fillRect(0, 0, 1280, 800); g.fillStyle = '#2c5d9e'; g.fillRect(0, 0, 1280, 70); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.fillText('✉  Mail', 30, 46);
      g.fillStyle = '#e6eaf0'; g.fillRect(0, 70, 360, 730);
      ['Ms. Ortiz', 'Coach Reed', 'Pizza Palace', 'Mom'].forEach((n, i) => { const y = 110 + i * 92; if (i === 0) { g.fillStyle = '#d5e3f7'; g.fillRect(0, y - 34, 360, 88); } g.fillStyle = '#1d2733'; g.font = `${i === 0 ? 700 : 500} 26px Inter, Arial`; g.fillText(n, 28, y); g.fillStyle = '#5b6675'; g.font = '500 20px Inter, Arial'; g.fillText(['Problem Set 9', 'Practice moved', 'Your order is on…', 'GET UP'][i], 28, y + 32); });
      const a = clamp(k * 1.6);
      g.globalAlpha = a; g.fillStyle = '#1d2733'; g.font = '700 40px Inter, Arial'; g.fillText('Problem Set 9', 400, 140); g.font = '500 24px Inter, Arial'; g.fillStyle = '#5b6675'; g.fillText('From: Ms. Ortiz  ·  Algebra II', 400, 182);
      g.fillStyle = '#1d2733'; g.font = '500 30px Inter, Arial'; g.fillText('Hi class,', 400, 260); g.fillText('Problem Set 9 is attached:', 400, 310); g.font = '800 34px Inter, Arial'; g.fillText('40 problems.', 400, 370);
      g.fillStyle = '#b3261e'; g.fillText('HANDWRITTEN ONLY.', 400, 425); g.fillStyle = '#1d2733'; g.fillText('Due tomorrow, 8:00 AM.', 400, 480);
      g.font = '500 30px Inter, Arial'; g.fillText('No typed work. No exceptions.', 400, 545); g.fillText('– Ms. Ortiz', 400, 600);
      g.fillStyle = '#dfe6ef'; g.beginPath(); g.roundRect(400, 640, 300, 70, 12); g.fill(); g.fillStyle = '#2c5d9e'; g.font = '600 24px Inter, Arial'; g.fillText('📎 PSet9.pdf', 422, 684); g.globalAlpha = 1;
      tx.needsUpdate = true; };
    draw(0); return { tex: tx, draw };
  })();
  const scrMat = new THREE.MeshBasicMaterial({ map: mail.tex, toneMapped: false });
  const laptop = makeLaptop(null); laptop.screen.material = scrMat; desk.top.add(laptop.g); laptop.g.position.set(0.05, 0.026, 0.02); laptop.g.rotation.y = PI;
  const wsPaper = makePaper(blank.tex); desk.top.add(wsPaper); wsPaper.rotation.set(-PI / 2, 0, PI + 0.15); wsPaper.position.set(-0.24, 0.028, 0.0);
  // snack chute: hopper on the kitchen counter → through two walls → ends by his +x hand
  const chutePts = [[1.25, FY + 1.48, -3.62], [0.3, FY + 1.4, -3.62], [-0.9, FY + 1.3, -3.62], [-1.95, FY + 1.18, -3.6], [-2.55, FY + 1.06, -3.45], [-2.9, FY + 0.96, -3.3]];
  const chute = makeChute(chutePts, { r: 0.15 }); H.root.add(chute.g);
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.1, 0.26, 20, 1, true), simMat('steel', { color: 0xd8dbdf, side: THREE.DoubleSide })); hopper.position.set(1.32, FY + 1.6, -3.62); hopper.castShadow = true; H.root.add(hopper);
  const collars = [D.walls[1], D.walls[0]].map((x) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 24), simMat('plastic', { color: 0x3a3c40 })); r.rotation.y = PI / 2; const u = x === D.walls[1] ? 0.31 : 0.6; const p = chute.curve.getPointAt(u); r.position.set(x, p.y - 0.02, p.z); H.root.add(r); return r; });
  const chips = makeChips(0xe7a61c); scene.add(chips);
  // robot arm on the headboard's left end
  const arm = makeRobotArm({ l1: 0.45, l2: 0.42 }); bedG.add(arm.g); arm.g.position.set(-0.6, 1.06, 0.07);
  const chip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 6, 0, PI * 2, 0, 0.9), simMat('plastic', { color: 0xf0c45a, rough: 0.6, side: THREE.DoubleSide })); chip.scale.set(1, 0.4, 1); arm.tip.add(chip);
  // ceiling TV on a drop-down arm
  const tv = new THREE.Group(); H.root.add(tv); tv.position.set(BD.x, CY, -3.25);
  const tvArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), simMat('metal', { color: 0x2b2b2b })); tv.add(tvArm);
  const tvBox = new THREE.Group(); tv.add(tvBox);
  { const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.6), simMat('plastic', { color: 0x141518, rough: 0.3 })); b.castShadow = true; tvBox.add(b); }
  const tvTex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 300; const g = c.getContext('2d'); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return { c, g, tx }; })();
  const tvScr = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.54), new THREE.MeshBasicMaterial({ map: tvTex.tx, toneMapped: false })); tvScr.rotation.x = PI / 2; tvScr.position.y = -0.021; tvBox.add(tvScr);
  const tvLight = new THREE.PointLight(0x9fc4ff, 0, 2.5, 2); tvBox.add(tvLight); tvLight.position.y = -0.3;
  const drawTV = (tt) => { const { g, tx } = tvTex; const k = Math.floor(tt * 6); if (drawTV.k === k) return; drawTV.k = k; g.fillStyle = '#3f8a3a'; g.fillRect(0, 0, 512, 300); g.fillStyle = '#4f9c47'; for (let i = 0; i < 8; i++) g.fillRect(i * 64, 0, 32, 300); g.strokeStyle = '#e8f2e4'; g.lineWidth = 4; g.strokeRect(20, 20, 472, 260); g.beginPath(); g.moveTo(256, 20); g.lineTo(256, 280); g.stroke(); g.beginPath(); g.arc(256, 150, 40, 0, 7); g.stroke(); const bx = 256 + Math.sin(tt * 2.1) * 150, by = 150 + Math.cos(tt * 3.3) * 80; g.fillStyle = '#fff'; g.beginPath(); g.arc(bx, by, 8, 0, 7); g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = i < 3 ? '#d23a2c' : '#2c5d9e'; g.beginPath(); g.arc(256 + Math.sin(tt * 1.3 + i) * 180, 150 + Math.cos(tt * 1.7 + i * 2) * 100, 9, 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(14, 14, 150, 34); g.fillStyle = '#fff'; g.font = '700 22px Inter, Arial'; g.fillText('HOME 2 – 1', 24, 39); tx.needsUpdate = true; };
  // rails + grass box outside the left window
  const rails = makeRails(3.0); H.root.add(rails); rails.position.set(-4.0, FY, -3.4);
  const grassBox = makeGrassBox(1.3); H.root.add(grassBox); grassBox.position.set(-5.9, D.winL.y[0] - 0.2, -3.4);
  // drone + pizza + printer
  const drone = makeDrone(); scene.add(drone.g);
  const pizza = makePizzaBox(); scene.add(pizza);
  const printer = makePrinter(); H.root.add(printer.g); printer.g.position.set(FR[0], FY + 0.62, FR[2] - 0.02); printer.g.rotation.y = -PI / 2 + 0.35;
  const carried = makePaper(sheet.tex); scene.add(carried);
  const pen = new THREE.Group(); H.root.add(pen); pen.position.set(-5.22, FY + 0.858, -1.45); pen.rotation.set(0, 0.5, PI / 2);
  { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 10), simMat('plastic', { color: 0x1f3c88, rough: 0.3 })); b.castShadow = true; pen.add(b); const c = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.02, 10), simMat('chrome')); c.position.y = -0.08; c.rotation.x = PI; pen.add(c); const cl = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.05, 0.004), simMat('chrome')); cl.position.set(0.007, 0.04, 0); pen.add(cl); }
  const penGlow = new THREE.PointLight(0xfff2c0, 0, 0.6, 2); penGlow.position.set(-5.22, FY + 1.05, -1.45); H.root.add(penGlow);
  // the phone-photo insert: a hoodie sleeve + hand holding the phone over the worksheet (parked over the desk top)
  const shotHand = new THREE.Group(); scene.add(shotHand);
  { const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 14), kid.mats.top); sl.rotation.x = PI / 2; sl.position.set(0, 0, 0.24); shotHand.add(sl); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), kid.mats.skin); hd.scale.set(1.1, 0.6, 1.4); shotHand.add(hd); }
  const camPhone = makePhone(); shotHand.add(camPhone.g); camPhone.g.position.set(0, 0.03, -0.04); camPhone.g.rotation.x = -PI / 2;
  camPhone.screen.material = new THREE.MeshBasicMaterial({ map: blank.tex, toneMapped: false });
  const flash = new THREE.PointLight(0xffffff, 0, 1.5, 2); shotHand.add(flash);
  // ---------------------------------------------------------------- the teacher's classroom corner (parked at x = +60)
  const CL = new THREE.Group(); scene.add(CL); CL.position.set(60, 0, 0);
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), simMat('tile', { color: 0xd9d4c8, repeat: [10, 8] })); fl.rotation.x = -PI / 2; fl.receiveShadow = true; CL.add(fl);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), simMat('paint', { color: 0xe4dcc8 })); wall.position.set(0, 1.6, -2.4); wall.receiveShadow = true; CL.add(wall);
    const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 400; const bg = bc.getContext('2d'); bg.fillStyle = '#2f4a3c'; bg.fillRect(0, 0, 1024, 400); bg.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 30; i++) { bg.beginPath(); bg.moveTo(Math.random() * 0, 0); } bg.fillStyle = '#f2f0e6'; bg.font = '500 52px Georgia, serif'; bg.fillText('x² − 5x + 6 = (x − 2)(x − 3)', 80, 300); bg.font = '500 36px Georgia, serif'; bg.fillText('PSet 9 due today', 640, 370);
    const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.25), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 })); board.position.set(0.2, 1.75, -2.38); CL.add(board);
    const frm = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.35, 0.03), simMat('lumber', { color: 0x8a6a4a })); frm.position.set(0.2, 1.75, -2.4); CL.add(frm);
    const dk = new THREE.Group(); CL.add(dk); dk.position.set(0, 0, 0);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.75), simMat('wood', { color: 0x9b6e46, rough: 0.5 })); top.position.set(0, 0.75, 0); top.castShadow = top.receiveShadow = true; dk.add(top);
    const front = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.6, 0.04), simMat('wood', { color: 0x8a6040 })); front.position.set(0, 0.42, 0.33); front.castShadow = true; dk.add(front);
    for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.72), simMat('wood', { color: 0x8a6040 })); sd.position.set(s * 0.72, 0.36, 0); dk.add(sd); }
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), simMat('plastic', { color: 0xc8322c, rough: 0.4 })); apple.position.set(0.58, 0.82, -0.1); apple.castShadow = true; dk.add(apple);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 16), simMat('plastic', { color: 0xf2f0ea })); mug.position.set(-0.6, 0.825, -0.15); mug.castShadow = true; dk.add(mug);
    const chair = new THREE.Group(); CL.add(chair); chair.position.set(0, 0, -0.62); const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.44), simMat('plastic', { color: 0x2b2d31 })); seat.position.y = 0.45; chair.add(seat); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.04), simMat('plastic', { color: 0x2b2d31 })); bk.position.set(0, 0.78, -0.22); chair.add(bk);
  }
  const clSheets = [oldHw, sheet].map((s, i) => { const p = makePaper(s.tex); CL.add(p); p.rotation.set(-PI / 2, 0, (i ? -0.04 : 0.05)); p.position.set(i ? 0.14 : -0.14, 0.778, 0.12); return p; });

  // ---------------------------------------------------------------- times derived from words (make_cues.py mirrors these)
  const T = {
    FRIDGE: t.mini - 0.05, DOOR: t.arms - 0.15, GRAB: t.reach + 0.05,
    PULL1: t.neverP - 0.05, PULL2: t.again - 0.05,
    SWING: t.swings - 0.1,
    DROPB: t.snack + 0.05, SLIDE0: t.straight - 0.15, SLIDE1: t.kitchen + 0.25,
    FEED: t.feeds - 0.05, SCRATCH: t.scratches - 0.05,
    TVDROP: t.tvW - 0.08,
    DRIVE0: t.drives - 0.05, DRIVE1: t.windowW + 0.15, SASH: t.windowW - 0.1, PAT: t.grass - 0.1,
    DRONE0: t.droneW - 0.3, PIZZA: t.lap - 0.15,
    FLASH: t.photo + 0.05, SOLVE0: t.solves - 0.05, SOLVE1: t.fortyS + 0.35,
    WRITE0: t.writes - 0.05, WRITE1: t.strokeB + 0.35,
    PRINT0: t.printer - 0.05, PRINT1: t.prints + 0.35, GRABP: t.droneD, FLYOUT: t.flies,
    STAMP: t.perfect, HOUSE: t.d30,
  };
  const DAYS = [[0, 0], [t.d1, 1], [t.d2, 2], [t.d4, 4], [t.d7, 7], [t.d9, 9], [t.d10, 10], [t.d12, 12], [t.d15, 15], [t.d30, 30]];
  const dayAt = (tt) => { let n = 0; for (const [a, v] of DAYS) if (tt >= a) n = v; return n; };
  const hud = makeSimHud({ show: [t.d1 - 0.05, ENDCARD + 0.1], day: DAYS.slice(1).map(([a, v]) => [a, v]),
    end: { t: ENDCARD, icon: '/videos/052-bedroom-never-leave/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });
  const KICKS = [[T.FRIDGE + 0.32, 0.03, 0.35], [T.TVDROP + 0.4, 0.025, 0.35], [T.STAMP + 0.05, 0.03, 0.4], [T.PIZZA + 0.25, 0.015, 0.3], [T.DROPB + 0.1, 0.01, 0.2]];

  // ---------------------------------------------------------------- the bed's x offset (drives to the window and back)
  const bedX = (tt) => (tt >= S('window') && tt < S('drone') ? -1.32 * smooth(u01(tt, T.DRIVE0, T.DRIVE1)) : 0);
  const kidBase = (tt) => [BD.x + bedX(tt), FY, BD.z0 + 0.6];

  // ---------------------------------------------------------------- 2-link IK for the robot arm (bed-local target)
  const armIK = (tgt, pitchEnd = 0.6) => {
    const base = V(-0.6, 1.06 + 0.24, 0.07), d = V(...tgt).sub(base);
    const yaw = Math.atan2(d.x, d.z), h = Math.hypot(d.x, d.z), v = d.y, L = Math.min(Math.hypot(h, v), arm.L1 + arm.L2 - 0.01);
    const phi = Math.atan2(h, v), al = Math.acos(clamp((arm.L1 ** 2 + L * L - arm.L2 ** 2) / (2 * arm.L1 * L), -1, 1)), be = Math.acos(clamp((arm.L1 ** 2 + arm.L2 ** 2 - L * L) / (2 * arm.L1 * arm.L2), -1, 1));
    const a1 = phi - al, a2 = PI - be; return { yaw, a1, a2, a3: pitchEnd + PI / 2 - (a1 + a2) };
  };
  const ARM_PARK = { yaw: 0.2, a1: -0.2, a2: 2.4, a3: 0.5, grip: 0 };
  const blendQ = (a, b, k) => ({ yaw: lerp(a.yaw, b.yaw, k), a1: lerp(a.a1, b.a1, k), a2: lerp(a.a2, b.a2, k), a3: lerp(a.a3, b.a3, k), grip: lerp(a.grip ?? 0, b.grip ?? 0, k) });

  // ---------------------------------------------------------------- poses
  const A = (sx, sz, el, twist = 0) => ({ sx, sz, el, twist, free: 0 });
  const PHONE_A = A(-0.95, 0.12, -1.25, 0.4), PHONE_B = A(-0.95, 0.12, -1.25, -0.4);
  const REST_A = A(-0.25, 0.2, -0.5, 0.3), REST_B = A(-0.25, 0.2, -0.5, -0.3);
  const TYPE_A = A(-0.7, 0.18, -0.95, 0.35), TYPE_B = A(-0.7, 0.18, -0.95, -0.35);
  const CROSS_A = A(-0.42, 0.1, -1.7, 1.3), CROSS_B = A(-0.55, 0.1, -1.6, -1.3);
  const mixA = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist ?? 0, b.twist ?? 0, k), free: 0 });
  function kidPose(tt) {
    const p = basePose(), [bx, , bz] = kidBase(tt);
    Object.assign(p, { x: bx, z: bz, y: TOP + 0.05 - HIP_H, rotY: 0, lean: -0.12, headPitch: 0.15, eyes: blink(tt, 2), mouth: 'flat' });
    let armA = REST_A, armB = REST_B, face = { look: [0, 0] }, roll = 0, twist = 0;
    const beat = Bc.at ? Bc.at(tt) : null;
    if (tt < S('fridge')) { armA = PHONE_A; armB = PHONE_B; p.headPitch = 0.35; p.lean = -0.18; face.look = [0, -0.25]; p.mouth = tt > t.never ? 'smile' : 'flat'; }
    else if (tt < S('pulley')) {   // reach down to the fridge (+x side), come back up with a can
      const r = smooth(u01(tt, T.DOOR - 0.25, T.DOOR + 0.25)) * (1 - smooth(u01(tt, T.GRAB + 0.1, T.GRAB + 0.55)));
      armA = PHONE_A; armB = mixA(A(-0.6, 0.2, -1.1, -0.3), A(-0.35, 0.75, -0.25, 0), r); roll = -0.22 * r; twist = 0.25 * r;
      p.headYaw = 0.45 * r; p.headPitch = 0.3; face.look = [0.3 * r, -0.3]; p.mouth = tt > T.GRAB + 0.3 ? 'smile' : 'flat';
    } else if (tt < S('desk')) {   // night: yank the rope handle down twice
      const y1 = pulse(tt, T.PULL1, T.PULL1 + 0.35, 0.1), y2 = pulse(tt, T.PULL2, T.PULL2 + 0.35, 0.1);
      armB = A(-0.9 + 0.5 * (y1 + y2), 0.55, -1.1 + 0.5 * (y1 + y2), -0.3); armA = REST_A; p.headYaw = 0.2; p.mouth = 'smile'; face.look = [0.2, 0.15];
    } else if (tt < S('chute')) {   // the desk swings in; he starts typing
      const k = smooth(u01(tt, T.SWING + 0.3, T.SWING + 0.7)); armA = mixA(REST_A, TYPE_A, k); armB = mixA(REST_B, TYPE_B, k);
      if (k > 0.9) { armA = { ...armA, el: armA.el + 0.08 * Math.sin(tt * 22) }; armB = { ...armB, el: armB.el + 0.08 * Math.sin(tt * 19 + 1) }; }
      p.headPitch = 0.4; face.look = [0, -0.2]; p.lean = -0.05;
    } else if (tt < S('arm')) {   // hand out at the chute's end; the bag lands; he holds it up
      const k = smooth(u01(tt, T.SLIDE0, T.SLIDE0 + 0.4)), up = smooth(u01(tt, T.SLIDE1 + 0.1, T.SLIDE1 + 0.5));
      armB = mixA(REST_B, mixA(A(-0.75, 0.55, -0.6, -0.2), A(-1.6, 0.35, -0.9, -0.2), up), k); armA = REST_A; p.headYaw = 0.35 * k * (1 - up); p.mouth = up > 0.5 ? 'smile' : 'flat'; face.look = [0.3 * (1 - up), 0];
    } else if (tt < S('tv')) {   // mouth open for the chip, then lean forward for the back scratch (eyes shut, smile)
      const sc = smooth(u01(tt, T.SCRATCH - 0.1, T.SCRATCH + 0.25));
      p.lean = lerp(-0.12, 0.32, sc); p.headPitch = lerp(0.05, 0.15, sc); armA = mixA(REST_A, A(-0.4, 0.2, -1.2, 0.3), sc); armB = mixA(REST_B, A(-0.4, 0.2, -1.2, -0.3), sc);
      face.open = pulse(tt, T.FEED + 0.15, T.FEED + 0.55, 0.12) * 0.8; face.look = [-0.25, 0.1];
      if (sc > 0.5) { p.eyes = 'closed'; p.mouth = 'smile'; face.brows = 0.6; p.headRoll = 0.08 * Math.sin(tt * 9); }
    } else if (tt < S('window')) {   // lie back under the ceiling TV
      const k = smooth(u01(tt, T.TVDROP + 0.1, T.TVDROP + 0.6)); p.lean = lerp(-0.12, -0.55, k); p.headPitch = lerp(0.1, -0.35, k); armA = CROSS_A; armB = CROSS_B; face.look = [0, 0.35 * k]; p.mouth = 'smile';
    } else if (tt < S('drone')) {   // the bed drives to the window; lean out to the left and pat the grass
      const k = smooth(u01(tt, T.SASH + 0.1, T.PAT)), pat = Math.max(0, Math.sin((tt - T.PAT) * 14)) * (tt > T.PAT ? 1 : 0);
      roll = 0.55 * k; twist = -0.55 * k; p.headYaw = -0.6 * k; p.headPitch = 0.25 + 0.2 * k;
      armA = mixA(REST_A, A(-0.25, 1.25 - 0.18 * pat, -0.15, 0.2), k); armB = REST_B; p.mouth = 'smile'; face.look = [-0.4 * k, -0.2];
    } else if (tt < S('email')) {   // looks up at the drone; arms out for the pizza; pizza in the lap
      const land = u01(tt, T.PIZZA - 0.3, T.PIZZA + 0.2);
      p.headPitch = lerp(-0.4, 0.3, smooth(land)); face.look = [0, lerp(0.4, -0.1, land)]; armA = mixA(A(-0.8, 0.45, -0.6, 0.3), A(-0.5, 0.25, -0.9, 0.3), land); armB = mixA(A(-0.8, 0.45, -0.6, -0.3), A(-0.5, 0.25, -0.9, -0.3), land); p.mouth = land > 0.5 ? 'smile' : 'o';
    } else if (tt < S('refuse')) {   // typing, then frozen at the email
      const st = smooth(u01(tt, t.forty - 0.2, t.forty + 0.1)); armA = TYPE_A; armB = TYPE_B; p.headPitch = 0.38; face.look = [0, -0.2];
      if (st < 1) { armA = { ...armA, el: armA.el + 0.08 * Math.sin(tt * 22) * (1 - st) }; }
      if (st > 0.5) { p.mouth = 'o'; face.brows = 1; }
    } else if (tt < S('scribe')) {   // refuses: arms crossed, head shake, angry brows
      armA = CROSS_A; armB = CROSS_B; face.brows = -1; p.mouth = 'flat'; p.headYaw = tt > t.refuse - 0.1 ? 0.28 * Math.sin((tt - t.refuse) * 13) * Math.exp(-(tt - t.refuse) * 1.5) : 0; face.look = [0, 0];
    } else if (tt < S('house')) {   // Scribe time: typing / grinning at the printer
      armA = TYPE_A; armB = TYPE_B; p.headPitch = 0.35; face.look = [0, -0.2]; p.mouth = tt > T.SOLVE1 ? 'smile' : 'flat';
      if (tt > S('deliver')) { armA = REST_A; armB = mixA(REST_B, A(-0.6, 0.6, -0.4, -0.2), pulse(tt, T.GRABP + 0.6, T.FLYOUT + 1.0, 0.2)); p.headYaw = 0.35; p.headPitch = 0; face.look = [0.3, 0.1]; p.mouth = 'smile'; }
    } else {   // day 30: lounging, fed by the arm
      armA = CROSS_A; armB = CROSS_B; p.lean = -0.25; p.mouth = 'smile'; face.look = [-0.25, 0.05];
      face.open = pulse(tt, t.stood - 0.1, t.stood + 0.3, 0.1) * 0.7; if (tt > t.october) { p.eyes = blink(tt, 2) === 'closed' ? 'closed' : 'open'; }
    }
    p.armA = armA; p.armB = armB;
    return { p, face, roll, twist };
  }

  // ---------------------------------------------------------------- shots (one held, slowly pushing framing each; hard cuts)
  const BX = BD.x, EYE = TOP + 0.05 + 0.785;   // his eye height sitting up
  const SH = (id, t0, p0, p1, a0, a1, fov = 45, opts = {}) => ({ id, t0, p0, p1, a0, a1, fov, ...opts });
  const SHOTS = [
    SH('hook', 0, [-3.4, 2.5, 8.6], [-3.45, 2.3, 6.9], [-3.55, 0.78, -2.6], [-3.55, 0.82, -2.6], 50),
    SH('fridge', S('fridge'), [-2.55, 1.85, 1.6], [-2.6, 1.78, 1.2], [-3.1, 1.25, -3.4], [-3.1, 1.25, -3.4], 42),
    SH('pulley', S('pulley'), [-2.85, 2.3, 4.6], [-2.85, 2.25, 4.1], [-2.85, 1.6, -2.6], [-2.85, 1.6, -2.6], 48, { night: true }),
    SH('desk', S('desk'), [-3.0, 1.75, 0.8], [-3.1, 1.7, 0.4], [-3.5, 1.45, -3.4], [-3.5, 1.45, -3.4], 42),
    SH('kitchen', S('chute'), [1.45, 1.95, 0.9], [1.42, 1.92, 0.6], [1.55, 1.55, -3.3], [1.55, 1.55, -3.3], 44),
    SH('chuteRide', T.SLIDE0 - 0.05, [0.6, 2.75, 2.6], [-2.7, 2.35, 2.0], [0.0, 1.55, -3.6], [-3.1, 1.35, -3.4], 46, { track: true }),
    SH('momFace', t.mom - 0.08, [1.86, 2.2, -1.25], [1.86, 2.2, -1.42], [1.86, 2.02, -3.3], [1.86, 2.02, -3.3], 34),
    SH('arm', S('arm'), [-3.2, 1.95, -1.2], [-3.25, 1.92, -1.45], [-3.6, 1.72, -3.8], [-3.6, 1.72, -3.8], 40),
    SH('tv', S('tv'), [-2.3, 1.35, -1.4], [-2.35, 1.3, -1.6], [-3.55, 2.15, -3.4], [-3.55, 2.15, -3.4], 50),
    SH('window', S('window'), [-3.4, 2.35, 4.4], [-3.75, 2.3, 3.6], [-4.15, 1.35, -2.9], [-4.6, 1.4, -2.9], 46),
    SH('grass', t.touchG - 0.12, [-7.15, 1.72, -2.55], [-7.05, 1.7, -2.65], [-5.85, 1.62, -3.45], [-5.85, 1.62, -3.45], 40, { outside: true }),
    SH('drone', S('drone'), [-3.75, 2.35, 3.6], [-3.7, 2.25, 3.0], [-4.1, 1.55, -3.1], [-3.75, 1.45, -3.0], 46),
    SH('email', S('email'), [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 40, { screen: 'mail' }),
    SH('pen', S('refuse'), [-5.48, 1.66, -1.0], [-5.45, 1.63, -1.12], [-4.4, 1.5, -2.9], [-4.4, 1.5, -2.9], 42),
    SH('refuse', t.refuse - 0.25, [-3.45, EYE + 0.02, -2.25], [-3.47, EYE + 0.02, -2.45], [-3.55, EYE - 0.05, -3.8], [-3.55, EYE - 0.05, -3.8], 36),
    SH('scribeOpen', S('scribe'), [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 40, { screen: 'scribe' }),
    SH('photo', t.one ?? (W('scribe', 'one') - 0.1), [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 42, { photo: true }),
    SH('solve', T.SOLVE0 - 0.1, [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 40, { screen: 'solve' }),
    SH('hand', S('hand'), [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 40, { screen: 'write' }),
    SH('strokes', t.every - 0.06, [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 40, { screen: 'page' }),
    SH('print', S('deliver'), [-2.25, 2.05, -0.55], [-2.3, 2.05, -0.85], [-2.9, 1.25, -3.4], [-2.95, 1.3, -3.4], 46),
    SH('flyout', T.FLYOUT - 0.12, [-10.5, 1.7, 1.2], [-11.0, 1.9, 1.5], [-6.0, 2.3, -3.2], [-7.5, 3.2, -2.8], 46, { outside: true }),
    SH('teacher', S('match'), [60.12, 1.18, 1.05], [60.1, 1.18, 0.88], [60, 1.12, -0.4], [60, 1.12, -0.4], 44, { cls: true }),
    SH('house', S('house'), [-3.3, 2.3, 6.8], [-0.2, 3.9, 21.5], [-3.5, 1.3, -2.6], [-0.1, 2.2, -2.4], 50, { house: true }),
    SH('last', S('last'), [-3.25, 1.95, -0.6], [-3.3, 1.92, -0.85], [-3.55, 1.6, -3.6], [-3.55, 1.6, -3.6], 42),
  ].sort((a, b) => a.t0 - b.t0);
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  story.debugView = { center: [-3.5, 0, -2.2], height: 12 };

  // the laptop screen as a camera target: world pose of the screen plane
  const scrPos = new THREE.Vector3(), scrN = new THREE.Vector3(), q = new THREE.Quaternion();
  function screenCam(tt, sh) {
    laptop.screen.updateMatrixWorld(true); laptop.screen.getWorldPosition(scrPos); laptop.screen.getWorldQuaternion(q); scrN.set(0, 0, 1).applyQuaternion(q);
    const page = sh.screen === 'page', d = (page ? 0.36 : 0.82) - (page ? 0.05 : 0.08) * u01(tt, sh.t0, sh.t0 + 3);
    const right = V(1, 0, 0).applyQuaternion(q), upV = V(0, 1, 0).applyQuaternion(q), off = page ? [-0.06, -0.005] : [0, -0.03];
    const c = scrPos.clone().addScaledVector(right, off[0]).addScaledVector(upV, off[1]);
    return { pos: [c.x + scrN.x * d, c.y + scrN.y * d + (page ? 0 : 0.02), c.z + scrN.z * d], look: [c.x, c.y - (page ? 0 : 0.035), c.z], fov: 40 };
  }

  // ---------------------------------------------------------------- per-frame
  function update(tt) {
    const sh = SHOTS.reduce((a, s) => (tt >= s.t0 ? s : a), SHOTS[0]);
    const next = SHOTS[SHOTS.indexOf(sh) + 1], t1 = next ? next.t0 : END;
    const u = smooth(u01(tt, sh.t0, t1));
    H.update(tt);
    // light: night only for the pulley beat; ceiling light follows the switch
    const night = !!sh.night;
    H.setDay(night ? 0.06 : 1);
    const lightOn = night ? !(tt >= T.PULL1 + 0.15 && tt < T.PULL2 + 0.15) : false;
    H.setLight('bed', lightOn ? 1 : 0); H.switch.set(night ? lightOn : true); H.lamp.set(night ? (lightOn ? 0.35 : 0.22) : 0);
    H.setCalendar(Math.max(1, dayAt(tt))); H.setClock(night ? 23 : 15, (tt * 7) % 60);
    // which sets show
    const cls = !!sh.cls; CL.visible = cls; teach.root.visible = cls;
    H.aim(cls ? 60 : sh.house ? 0 : sh.outside ? -6 : -3.4, cls ? 0 : -2.4, cls ? 3 : sh.house ? 9 : sh.outside ? 6 : 4.5);
    // ---- bed + upgrades (visibility by time)
    bedG.position.x = BD.x + bedX(tt);
    const fK = drop(tt, T.FRIDGE, 1.6, 0.3), [fsx, fsy] = squash(tt, T.FRIDGE + 0.3, 0.2);
    fridge.g.visible = tt >= T.FRIDGE - 0.02; fridge.g.position.y = FY + fK; fridge.g.scale.set(fsx, fsy, fsx);
    fridge.setDoor(tt < S('pulley') ? 1.6 * smooth(u01(tt, T.DOOR, T.DOOR + 0.3)) * (1 - smooth(u01(tt, T.GRAB + 0.3, T.GRAB + 0.6))) : 0);
    const pulleyOn = tt >= t.pulleyW - 0.1;
    pul.forEach((p) => (p.visible = pulleyOn)); ropes.forEach((r) => (r.mesh.visible = pulleyOn)); handle.visible = pulleyOn;
    desk.g.visible = tt >= T.SWING - 0.05 && !(tt >= S('window') && tt < S('drone'));
    // in over his lap for the desk beat, parked at the foot for the chute…drone gags, back in for the email/Scribe part
    swingDesk(tt < S('chute') ? smooth(u01(tt, T.SWING, T.SWING + 0.5)) - wobble(tt, T.SWING + 0.5, 0.06, 18, 6) : tt < S('email') || tt >= S('house') ? 0 : 1);
    laptop.setOpen(tt < S('chute') ? smooth(u01(tt, T.SWING + 0.35, T.SWING + 0.8)) : 1);
    const chuteOn = tt >= T.DROPB - 0.6; chute.g.visible = chuteOn; hopper.visible = chuteOn; collars.forEach((c) => (c.visible = chuteOn));
    arm.g.visible = tt >= t.robot - 0.1 && !(tt >= S('window') && tt < S('drone'));
    tv.visible = tt >= T.TVDROP && !(tt >= S('window') && tt < S('drone'));
    rails.visible = tt >= T.DRIVE0 - 0.3;
    grassBox.visible = true;
    H.winL.sash.position.y = tt < S('window') ? 0 : 0.55 * smooth(u01(tt, T.SASH, T.SASH + 0.35));
    printer.g.visible = tt >= T.PRINT0 - 0.05;
    // legs + leg bump: he's always in bed
    H.bed.legBump.visible = true;
    // ---- kid
    const K2 = kidPose(tt);
    applyPose(kid, K2.p); legsOut(kid);
    kid.spine.rotation.z += K2.roll; kid.spine.rotation.y += K2.twist;
    simFace(kid, K2.face);
    kid.root.visible = !cls && !sh.screen;
    // ---- phone (hook, fridge, hidden later)
    kid.root.updateMatrixWorld(true);
    const hA = kid.arms[0].hand.getWorldPosition(V(0, 0, 0)), hB = kid.arms[1].hand.getWorldPosition(V(0, 0, 0));
    phone.g.visible = tt < S('pulley');
    if (phone.g.visible) { const pp = tt < S('fridge') ? hA.clone().lerp(hB, 0.5) : hA; phone.g.position.copy(pp).add(V(0, -0.07, 0.05)); phone.g.rotation.set(-0.9, 0, 0); }
    // ---- can: in the fridge, then in his +x hand
    can.visible = tt >= T.FRIDGE + 0.2 && tt < S('pulley');
    if (tt > T.GRAB) { can.position.copy(hB).add(V(0, -0.09, 0.02)); can.rotation.set(0, 0, 0); } else { can.position.copy(fridge.g.localToWorld(V(0, 0.41, 0.06))); }
    // ---- pulley ropes (handle by his +x hand: follows it while he pulls)
    if (pulleyOn) {
      const hp = tt >= S('pulley') && tt < S('desk') ? hB.clone().add(V(0, -0.08, 0)) : V(-2.82, FY + 0.95, -3.95);
      handle.position.copy(hp);
      const p0 = pul[0].position, p1 = pul[1].position, sw = V(...D.switchPos);
      ropes[0].set([hp.x, hp.y + 0.02, hp.z], [p0.x, p0.y - 0.07, p0.z], 0.02); ropes[1].set([p0.x, p0.y + 0.07, p0.z], [p1.x, p1.y + 0.07, p1.z], 0.04); ropes[2].set([p1.x, p1.y - 0.07, p1.z], [sw.x + 0.02, sw.y + 0.02, sw.z], 0.01);
      pul.forEach((p) => (p.wheel.rotation.z = (tt - t.pulleyW) * 2));
    }
    // ---- chips: dropped in the hopper, slides the chute, lands in his hand
    chips.visible = tt >= T.DROPB - 0.5 && tt < S('arm');
    if (chips.visible) {
      if (tt < T.SLIDE0) { const k = u01(tt, T.DROPB - 0.4, T.DROPB + 0.2); mom.root.updateMatrixWorld(true); const mh = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); chips.position.copy(k < 1 ? mh.clone().add(V(-0.02, -0.12, 0.04)).lerp(V(1.32, FY + 1.62, -3.62), smooth(k)) : V(1.25, FY + 1.5, -3.62)); chips.rotation.set(0.4, 0, 0); }
      else if (tt < T.SLIDE1) { const k = u01(tt, T.SLIDE0, T.SLIDE1), uu = k * k * (3 - 2 * k) * 0.3 + k * 0.7; chips.position.copy(chute.at(uu)).add(V(0, 0.06, 0)); const tg = chute.curve.getTangentAt(Math.min(0.999, uu)); chips.rotation.set(0, Math.atan2(tg.x, tg.z) + PI / 2, -0.6); }
      else { chips.position.copy(hB).add(V(0, -0.02, 0.06)); chips.rotation.set(0, 0, 0.2); }
    }
    // ---- robot arm: park → chip to the mouth → back scratch → park (day 30: feeds again)
    if (arm.g.visible) {
      kid.head.g.updateMatrixWorld(true); const hw = kid.head.g.getWorldPosition(V(0, 0, 0)), mouthL = bedG.worldToLocal(hw.clone().add(V(0.0, -0.06, 0.1)));
      const backL = bedG.worldToLocal(kid.spine.localToWorld(V(0.05, 0.42, -0.2)));
      const feedQ = { ...armIK(mouthL.toArray(), 0.0), grip: 1 }, scrQ = { ...armIK([backL.x, backL.y + 0.04 * Math.sin(tt * 18), backL.z], -1.2), grip: 0.4 };
      let qA = ARM_PARK;
      if (tt < S('tv')) {
        const f = pulse(tt, T.FEED - 0.25, T.FEED + 0.45, 0.25), s2 = smooth(u01(tt, T.SCRATCH - 0.2, T.SCRATCH + 0.2));
        qA = blendQ(blendQ(ARM_PARK, feedQ, f), scrQ, s2);
        chip.visible = tt < T.FEED + 0.2;
      } else if (tt >= S('house')) {
        const f = pulse(tt, t.stood - 0.45, t.stood + 0.35, 0.25); qA = blendQ(ARM_PARK, feedQ, f); chip.visible = tt < t.stood;
      } else chip.visible = false;
      arm.set(qA);
    }
    // ---- ceiling TV drops on its arm, tilts toward his face
    if (tv.visible) {
      const dk = drop(tt, T.TVDROP, 0.0001, 0.01), k = easeOutBack(u01(tt, T.TVDROP, T.TVDROP + 0.45), 1.6), L = lerp(0.05, 0.62, k);
      tvArm.scale.y = L; tvArm.position.y = -L / 2; tvBox.position.y = -L; tvBox.rotation.x = 0.35 * k; drawTV(tt); tvLight.intensity = 0.5 * k;
    }
    // ---- drone (deliveries): in through the window with a pizza, lowers it into his lap; later carries the homework out
    const droneVis = (tt >= T.DRONE0 && tt < S('email')) || (tt >= S('deliver') && tt < S('match')) || tt >= S('house');
    drone.g.visible = droneVis; pizza.visible = tt >= T.DRONE0 && tt < S('email'); carried.visible = false;
    if (droneVis) {
      drone.update(tt, 1);
      const WIN = [-6.6, 2.15, -3.4], IN = [-5.0, 2.15, -3.35], OVER = [BX, 2.05, -3.0], LAP = [BX, 1.62, -3.0];
      let dp = OVER;
      if (tt < S('email')) { const a = u01(tt, T.DRONE0, t.pizza), b = u01(tt, t.pizza, T.PIZZA), c = u01(tt, T.PIZZA + 0.2, T.PIZZA + 1.0); dp = a < 1 ? L3(L3(WIN, IN, smooth(a)), L3(IN, OVER, smooth(a)), smooth(a)) : b < 1 ? L3(OVER, LAP, smooth(b)) : L3(LAP, [BX + 0.8, 2.4, -3.2], smooth(c)); }
      else if (tt < S('match')) { const PR = add(printer.g.position.toArray(), [0.05, 0.42, 0.12]); const a = u01(tt, T.GRABP - 0.4, T.GRABP + 0.05), b = u01(tt, T.GRABP + 0.25, T.FLYOUT + 0.1), c = u01(tt, T.FLYOUT + 0.1, T.FLYOUT + 1.6); dp = a < 1 ? L3([-2.6, 2.4, -2.8], PR, smooth(a)) : b < 1 ? L3(PR, [-5.0, 2.2, -3.35], smooth(b)) : L3([-5.0, 2.2, -3.35], [-14, 5.5, 3.5], c * c); carried.visible = tt >= T.GRABP; }
      else { const a = tt * 0.9; dp = [Math.cos(a) * 2.4, D.ridgeY + 1.3 + 0.2 * Math.sin(tt * 2), -2.3 + Math.sin(a) * 2.4]; }
      const bob = 0.02 * Math.sin(tt * 7); drone.g.position.set(dp[0], dp[1] + bob, dp[2]); drone.g.rotation.set(0.12 * Math.sin(tt * 3), tt < S('email') ? PI / 2 : -PI / 2, 0.08 * Math.sin(tt * 2.3));
      if (pizza.visible) { if (tt < T.PIZZA) { pizza.position.set(dp[0], dp[1] - 0.16, dp[2]); pizza.rotation.set(0, 0, 0); } else { pizza.position.set(BX, TOP + 0.36, BD.z0 + 1.15); pizza.rotation.set(0.15, 0.2, 0); } }
      if (carried.visible) { drone.g.updateMatrixWorld(true); carried.position.copy(drone.hook.getWorldPosition(V(0, 0, 0))).add(V(0, -0.05, 0)); carried.rotation.set(-0.2, drone.g.rotation.y, 0); carried.scale.setScalar(1); }
    }
    // printer: paper slides out
    printer.setPaper(tt >= S('deliver') && tt < T.GRABP ? smooth(u01(tt, T.PRINT0 + 0.1, T.PRINT1)) : 0, sheet.tex);
    // ---- the worksheet: blank until Scribe writes it; the screen modes
    const wp = tt < T.WRITE0 ? 0 : tt < T.WRITE1 ? sheet.total * smooth(u01(tt, T.WRITE0, T.WRITE1)) ** 0.85 : sheet.total;
    sheet.draw(wp);
    if (tt < S('scribe')) { scrMat.map = mail.tex; mail.draw(u01(tt, t.emails - 0.1, t.forty)); }
    else {
      scrMat.map = screen.tex;
      if (tt < T.FLASH + 0.2) screen.draw({ mode: 'home' });
      else if (tt < T.SOLVE0) screen.draw({ mode: 'scan', k: u01(tt, T.FLASH + 0.2, T.SOLVE0) });
      else if (tt < S('hand')) screen.draw({ mode: 'solve', k: u01(tt, T.SOLVE0, T.SOLVE1) });
      else if (tt < T.WRITE1 + 0.2) screen.draw({ mode: 'write' });
      else screen.draw({ mode: 'done' });
    }
    // ---- mom (kitchen: drops the chips in the hopper, then turns: arms crossed)
    mom.root.visible = tt >= S('chute') - 0.01 && tt < S('arm') || sh.house || tt >= S('last');
    { const p = basePose(); const turn = smooth(u01(tt, t.mom - 0.1, t.mom + 0.2));
      Object.assign(p, { x: 1.86, z: -3.3, rotY: lerp(-0.35, 0.0, turn), eyes: blink(tt, 5) }); lift(p, FY);
      const lift2 = pulse(tt, S('chute') + 0.05, T.DROPB + 0.15, 0.25);
      p.armA = A(-0.35 - 0.5 * lift2, 0.2 + 1.0 * lift2, -0.3 - 0.4 * lift2, 0.2); p.armB = REST_B;
      if (turn > 0.5) { p.armA = CROSS_A; p.armB = CROSS_B; }
      p.mouth = 'flat'; p.headPitch = turn > 0.5 ? 0.12 : 0.05; p.headYaw = turn > 0.5 ? 0 : -0.4 * lift2;
      if (sh.house || tt >= S('last')) { Object.assign(p, { x: 2.0, z: -2.6, rotY: -0.5 }); p.armA = CROSS_A; p.armB = CROSS_B; }
      applyPose(mom, p); simFace(mom, { brows: turn > 0.5 ? -1 : 0, look: [0, 0] });
    }
    // ---- teacher (classroom): looks down at the two sheets, then up, impressed
    if (cls) {
      const p = basePose(), up = smooth(u01(tt, T.STAMP - 0.15, T.STAMP + 0.2));
      Object.assign(p, { x: 60, z: -0.55, y: -0.375, footFwd: 0.42, rotY: 0, lean: lerp(0.2, 0.06, up), headPitch: lerp(0.3, -0.05, up), eyes: blink(tt, 9), glasses: true, mouth: up > 0.5 ? 'smile' : 'flat' });
      p.armA = A(-1.05, 0.12, -0.55, 0.3); p.armB = A(-1.05 + 0.1 * Math.sin(tt * 2), 0.12, -0.55, -0.3);
      applyPose(teach, p); simFace(teach, { brows: up > 0.5 ? 1 : 0, look: [lerp(0.25 * Math.sin(tt * 3), 0, up), 0] });
    }
    // ---- the house payoff: extra rigs show; a monorail of baskets along the ceiling, a kitchen robot arm, a roof drone pad
    house.set(tt, tt >= S('house'));
    // ---- photo insert hand
    shotHand.visible = !!sh.photo;
    if (sh.photo) {
      desk.top.updateMatrixWorld(true); const wsW = wsPaper.getWorldPosition(V(0, 0, 0));
      const k = u01(tt, sh.t0, T.FLASH + 0.4);
      shotHand.position.set(wsW.x + 0.02, wsW.y + 0.27 + 0.03 * (1 - k), wsW.z + 0.16); shotHand.rotation.set(0.25, 0, 0);
      flash.intensity = pulse(tt, T.FLASH, T.FLASH + 0.08, 0.04) * 3;
    }
    penGlow.intensity = sh.id === 'pen' ? 0.6 : 0;
    hud.update(tt);
    // ---- camera
    let pos, look, fov = sh.fov;
    if (sh.screen) { const c = screenCam(tt, sh); pos = c.pos; look = c.look; fov = c.fov; kid.root.visible = false; }
    else if (sh.photo) { camPhone.g.updateMatrixWorld(true); const m = camPhone.g.getWorldPosition(V(0, 0, 0)); pos = [m.x - 0.02, m.y + 0.36, m.z + 0.2]; look = [m.x, m.y - 0.02, m.z - 0.02]; fov = 42; }
    else if (sh.track) { const bx = clamp(chips.position.x, -2.95, 1.0); pos = [bx + 0.3, 2.95, 2.9 - 0.2 * u]; look = [bx - 0.05, 1.45, -3.5]; fov = 44; }
    else { pos = L3(sh.p0, sh.p1, u); look = L3(sh.a0, sh.a1, u); }
    const k = shake(tt, KICKS.map(([a, amp, d]) => [a, amp, d]));
    pos = [pos[0] + k.x, pos[1] + k.y, pos[2]];
    setCamera(pos, look, fov, tt, sh.screen ? 0.0015 : 0.004);
    studio.camera.rotation.z += k.r;
  }

  // ---------------------------------------------------------------- the day-30 house: every room feeds the bed
  const house = (() => {
    const g = new THREE.Group(); H.root.add(g);
    // a ceiling monorail from the living room to the bedroom with hanging baskets
    const railY = CY - 0.25, railZ = -1.25;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.05, 0.06), simMat('steel', { color: 0xb5b9be })); rail.position.set(0.4, railY, railZ); rail.castShadow = true; g.add(rail);
    for (let x = -4.2; x <= 5.0; x += 1.15) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, CY - railY, 6), simMat('metal')); h.position.set(x, (CY + railY) / 2, railZ); g.add(h); }
    const baskets = Array.from({ length: 6 }, (_, i) => { const b = new THREE.Group(); g.add(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.14, 14, 1, true), simMat('plastic', { color: [0xd23a2c, 0x2c5d9e, 0xe7a61c][i % 3], side: THREE.DoubleSide })); c.position.y = -0.32; b.add(c); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 4), simMat('metal')); w.position.y = -0.13; b.add(w); const item = i % 2 ? makeCan([0x3a9a55, 0x2f6fb5, 0xc8322c][i % 3]) : makeChips([0xe7a61c, 0x8a3fb0, 0x2f9e5b][i % 3]); item.scale.setScalar(0.6); item.position.y = -0.28; b.add(item); return b; });
    // kitchen robot arm flipping pancakes at the stove + a toaster cannon on the counter
    const karm = makeRobotArm({ l1: 0.45, l2: 0.4, accent: 0x2c5d9e }); g.add(karm.g); karm.g.position.set(2.3, D.counterY, -4.05);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.03, 18), simMat('metal', { color: 0x2b2b2b })); karm.tip.add(pan); pan.position.y = 0.02;
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 18), simMat('plastic', { color: 0xd9a35a, rough: 0.7 })); g.add(cake);
    // living room: a couch-side arm passing the remote along + a treadmill-belt conveyor through the hall at floor level
    const larm = makeRobotArm({ l1: 0.4, l2: 0.36, accent: 0x2f9e5b }); g.add(larm.g); larm.g.position.set(3.3, FY, -3.3);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.08, 0.4), simMat('rubber')); belt.position.set(-0.3, FY + 0.45, -0.75); belt.castShadow = true; g.add(belt);
    for (let x = -3.4; x <= 2.8; x += 0.8) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), simMat('steel')); l.position.set(x, FY + 0.22, -0.75); g.add(l); }
    const boxes = Array.from({ length: 7 }, (_, i) => { const b = i % 3 === 0 ? makePizzaBox() : i % 3 === 1 ? makeChips(0x8a3fb0) : makeCan(0xe8b12a); if (i % 3 === 1) b.rotation.x = -PI / 2; g.add(b); return b; });
    // roof: solar panels, a drone pad, a windsock; a zipline from the big backyard tree to the bedroom's side window
    const panels = new THREE.Group(); g.add(panels);
    const slope = Math.atan((D.ridgeY - (CY + 0.18)) / 5.75);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 1.5), new THREE.MeshStandardMaterial({ color: 0x1d2a44, roughness: 0.25, metalness: 0.5 })); const x = 1.2 + i * 1.15; p.position.set(x, D.ridgeY - x * Math.tan(slope) + 0.1, -1.4 - j * 1.65); p.rotation.z = -slope; p.castShadow = true; panels.add(p); }
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24), simMat('plastic', { color: 0x2b2d31 })); pad.position.set(0, D.ridgeY + 0.12, -2.4); g.add(pad);
    const padH = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#2b2d31'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#ffd23f'; x.font = '900 96px Inter, Arial'; x.textAlign = 'center'; x.fillText('H', 64, 100); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })() })); padH.rotation.x = -PI / 2; padH.position.set(0, D.ridgeY + 0.152, -2.4); g.add(padH);
    const zipA = V(-9, 6.2, -10), zipB = V(-5.9, D.winL.y[1] - 0.05, -3.4);
    const zip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(zipA, zipB), 2, 0.012, 6), simMat('steel')); g.add(zip);
    const zbag = makePizzaBox(); g.add(zbag);
    function set(tt, on) {
      g.visible = on; if (!on) return;
      const k = clamp((tt - S('house')) / 1.0);
      baskets.forEach((b, i) => { const x = 4.8 - ((tt * 1.1 + i * 1.6) % 9.0); b.position.set(x, railY - 0.03, railZ); b.rotation.z = 0.05 * Math.sin(tt * 3 + i); });
      // pancake arc: pan flips every 1.6 s
      const ph = (tt % 1.6) / 1.6, flip = Math.sin(ph * PI);
      karm.set({ yaw: -0.6 + 0.2 * Math.sin(tt), a1: 0.9, a2: 0.6 - 0.3 * flip, a3: 0.1 + 0.6 * flip, grip: 0 });
      karm.tip.updateMatrixWorld(true); const pw = karm.tip.getWorldPosition(V(0, 0, 0)); cake.position.set(pw.x, pw.y + 0.04 + 0.45 * flip, pw.z); cake.rotation.x = flip * PI * 2;
      larm.set({ yaw: Math.sin(tt * 1.3) * 1.2, a1: 0.5 + 0.2 * Math.sin(tt * 2), a2: 1.0, a3: 0.2, grip: 0.5 });
      boxes.forEach((b, i) => { const x = 2.9 - ((tt * 0.9 + i * 0.95) % 6.6); b.position.set(x, FY + 0.56, -0.75); });
      const z = ((tt * 0.35) % 1); zbag.position.copy(zipA.clone().lerp(zipB, z)).add(V(0, -0.22, 0));
    }
    set(0, false);
    return { set, g };
  })();

  return { update };
}
