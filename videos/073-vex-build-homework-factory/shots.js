// 073 — Scribe promo, BUILD format with Vex as the builder AND the narrator (user, Nov 9: "builder vids… with goth mommy, because it's
// just funny when she's the character"): "How a Dorm Desk Becomes a Homework Factory". One continuous gliding take over a dorm cut
// open at the front (engine/build/dorm.js): Vex's goth room upstairs, Derek's loft bed downstairs (the background toon who takes the
// hits). The loop: a door on two milk crates → it wobbles, her coffee lands on Derek → a diagonal brace (TRIANGULATION) → textbooks
// sag the floor into Derek's room → a steel beam (LOAD PATH; floors rated 40 lb/sq ft) → lamp + laptop + fridge + kettle on one
// strip = blackout → her own line (DEDICATED CIRCUIT; 15 A outlet, 12.5 A kettle) → 40 physics problems, handwritten only → Scribe
// (AUTOMATION): one photo → solved → written in HER handwriting IN THE APP on the laptop screen with the free-body diagrams (user rule,
// Nov 9: the handwriting is generated on screen, never a pencil on paper) → printer, conveyor, a stapling robot arm, a snack chute
// → the callback (door, coffee, Derek under the beam) → "Cute." → the Scribe end card.
// Facts (web-checked Nov 9 2026): IBC Table 1607.1 — hotels/multifamily (R-2, where dorms sit) private rooms + their corridors:
// 40 psf uniform live load; a standard 120 V receptacle circuit is 15 A; a 1,500 W kettle draws 1500/120 = 12.5 A (manufacturer
// specs list 1,500 W · 120 V · 12.5 A). Triangulation (a braced triangle can't rack), load path (load → slab → beam → walls →
// footings) and dedicated circuit (one appliance per breaker) are the real terms. Scribe claims (README / tryscribe.ink): photo →
// worked solutions in physics with free-body diagrams → written in your own handwriting stroke by stroke → PDF.
// Look: build toon look (60 fps + blur, word-keyed gags, impact kicks, Fredoka one-word captions + TERM callouts), Vex = 067/071's
// VRoid (big eyes, chest shading) under the dorm's warm night light; voice = Fish "Mommy", less-breathy settings (script.json).
import * as THREE from 'three';
import { clamp, lerp, smooth } from '@engine/core.js';
import { beatClock, u01, easeOutBack, squash, wobble } from '@engine/build/anim.js';
import { makeFX, makeArrows, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, makeScreen } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { makeHud } from '@engine/build/brhud.js';
import { makeRobotArm } from '@engine/build/factory.js';
import { makeMug } from '@engine/props.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { buildDorm, sagAt, D, makeDoorDesk, makeTextbook, makeDeskLamp, makeMiniFridge, makeKettle, makePowerStrip, makeCord, makeConduit, makePanel, makePrinter, makeConveyor, makeChute, makeDrill, makePhone, makePaperStack, makeIBeam } from '@engine/build/dorm.js';

const PI = Math.PI;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const ease = (u) => smooth(u);
const bump = (t, a, b) => smooth(u01(t, a, b));
const pulse = (t, t0, up = 0.12, hold = 0.3, down = 0.3) => (t < t0 ? 0 : t < t0 + up ? (t - t0) / up : t < t0 + up + hold ? 1 : Math.max(0, 1 - (t - t0 - up - hold) / down));

// 067's chest shading pass (soft rose strokes multiplied onto the body atlas once)
async function shadeBody(url) {
  const img = await loadImg(url), W = img.width, S = W / 2048;
  const c = document.createElement('canvas'); c.width = W; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  // 073: without the pixel pass, the lower half of the bikini's BACK panel (the two black squares at the atlas seam, x 450–592 /
  // 1458–1600) folded forward between her thighs (thigh 1.4) and read as a dark tab hanging from the front: end the back panel at
  // y 1095 with its red hem (unseen from the front)
  { const px = g.getImageData(Math.round(520 * S), Math.round(1210 * S), 1, 1).data; g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`;
    for (const x0 of [444, 1452]) { g.fillRect(x0 * S, 1095 * S, 156 * S, 82 * S); }
    g.fillStyle = '#a01828'; for (const x0 of [450, 1458]) g.fillRect(x0 * S, 1092 * S, 142 * S, 6 * S); }
  const L = document.createElement('canvas'); L.width = W; L.height = img.height; const l = L.getContext('2d');
  l.fillStyle = '#fff'; l.fillRect(0, 0, W, img.height); l.scale(S, S); l.lineCap = 'round';
  const stroke = (pts, w, blur, col, a) => { l.save(); l.filter = `blur(${blur * S}px)`; l.globalAlpha = a; l.strokeStyle = col; l.lineWidth = w; l.beginPath(); pts.forEach(([x, y], i) => (i ? l.lineTo(x, y) : l.moveTo(x, y))); l.stroke(); l.restore(); };
  const arc = (cx, cy, rx, ry, a0, a1, w, blur, col, a) => { const P = []; for (let i = 0; i <= 24; i++) { const t = a0 + (a1 - a0) * i / 24; P.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } stroke(P, w, blur, col, a); };
  stroke([[1023, 495], [1021, 560], [1023, 622]], 12, 9, '#b06878', 0.5); stroke([[1023, 548], [1022, 590], [1023, 618]], 2.6, 1.2, '#8e4858', 0.7);
  stroke([[892, 440], [1006, 620]], 16, 10, '#b87884', 0.38); stroke([[1156, 440], [1040, 620]], 16, 10, '#b87884', 0.38);
  arc(852, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42); arc(1196, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42);
  arc(852, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45); arc(1196, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45);
  g.globalCompositeOperation = 'multiply'; g.drawImage(L, 0, 0);
  return c.toDataURL('image/png');
}

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), END = story.duration;
  const W = (b, w, n = 1) => B.W(b, w, n), WE = (b, w, n = 1) => B.WE(b, w, n);
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '800 40px Fredoka', '400 40px "Luckiest Guy"', '30px Georgia'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  renderer.localClippingEnabled = true;
  const { FY, CY, TOP, BACK } = D, DT = FY + D.deskTop;

  // ---------------------------------------------------------------- word times
  const T = {
    homework: W('hook', 'homework'), so0: W('hook', 'so'), built: W('hook', 'built'), desk0: W('hook', 'desk'), door0: W('hook', 'door'), two0: W('hook', 'two'), crates: W('hook', 'crates'),
    congrats: W('congrats', 'congratulations'), desk1: W('congrats', 'desk'), wobbles: W('congrats', 'wobbles'), coffees: W('congrats', 'coffees'), on1: W('congrats', 'on'), derek1: W('congrats', 'derek'), down1: W('congrats', 'downstairs'),
    so1: W('brace', 'so'), bolt: W('brace', 'bolt'), diagonal: W('brace', 'diagonal'), triangulation: W('brace', 'triangulation'), triangles: W('brace', 'triangles'), cant: W('brace', 'cant'), fold: W('brace', 'fold'), unlike: W('brace', 'unlike'), two1: W('brace', 'two'), am: W('brace', 'am'),
    then1: W('books', 'then'), textbooks: W('books', 'textbooks'), go: W('books', 'go'), floor: W('books', 'floor'), sags: W('books', 'sags'), dereks: W('books', 'dereks'), room: W('books', 'room'),
    so2: W('beam', 'so'), steel1: W('beam', 'steel'), beam1: W('beam', 'beam'), load: W('beam', 'load'), path: W('beam', 'path'), dorm1: W('beam', 'dorm'), forty1: W('beam', 'forty'), foot: W('beam', 'foot'), brought: W('beam', 'brought'), three: W('beam', 'three'), hundred: W('beam', 'hundred'),
    lamp: W('power', 'lamp'), laptop: W('power', 'laptop'), fridge: W('power', 'fridge'), kettle0: W('power', 'kettle'), one0: W('power', 'one'), strip: W('power', 'strip'),
    so3: W('circuit', 'so'), run: W('circuit', 'run'), line: W('circuit', 'line'), dedicated: W('circuit', 'dedicated'), circuit: W('circuit', 'circuit'), outlet: W('circuit', 'outlet'), fifteen: W('circuit', 'fifteen'), amps: W('circuit', 'amps'), kettle1: W('circuit', 'kettle'), twelve: W('circuit', 'twelve'), half: W('circuit', 'half'),
    then2: W('prof', 'then'), professor: W('prof', 'professor'), drops: W('prof', 'drops'), forty2: W('prof', 'forty'), problems: W('prof', 'problems'), handwritten: W('prof', 'handwritten'), only: W('prof', 'only'),
    so4: W('scribe', 'so'), install: W('scribe', 'install'), scribe: W('scribe', 'scribe'), automation: W('scribe', 'automation'), one1: W('scribe', 'one'), photo: W('scribe', 'photo'), solves: W('scribe', 'solves'), forty3: W('scribe', 'forty'), writes: W('scribe', 'writes'), handwriting: W('scribe', 'handwriting'), diagrams: W('scribe', 'diagrams'), too0: W('scribe', 'too'),
    add: W('list', 'add'), printer: W('list', 'printer'), conveyor: W('list', 'conveyor'), belt: W('list', 'belt'), robot: W('list', 'robot'), arm: W('list', 'arm'), staples: W('list', 'staples'), snack: W('list', 'snack'), chute: W('list', 'chute'),
    congrats2: W('end', 'congratulations'), factory: W('end', 'factory'), started: W('end', 'started'), door1: W('end', 'door'), because: W('end', 'because'), desks: W('end', 'desks'), money: W('end', 'money'), now: W('end', 'now'), homeworks: W('end', 'homeworks'), done: W('end', 'done'), coffee2: W('end', 'coffee'), derek2: W('end', 'derek'), lives: W('end', 'lives'), steel2: W('end', 'steel'), beam2: W('end', 'beam'),
    he: W('tag', 'he'), wants: W('tag', 'wants'), his: W('tag', 'his'), too1: W('tag', 'too'), cute: W('tag', 'cute'),
  };
  T.card = T.cute + 0.62;
  const TERMS = story.callouts.filter((c) => c.style === 'term').map((c) => [c.t0 - 0.05, c.t1 + 0.05]);
  const inTerm = (t) => TERMS.some(([a, b]) => t > a && t < b);

  // ---------------------------------------------------------------- the set + the build's parts
  const S = buildDorm(studio), R = S.root;
  const desk = makeDoorDesk(); S.ride(desk.g, D.desk[0], D.desk[1]);
  // the homework sheet (pack = physics), its unsolved top page for the paper stack, the app
  const sheet = subjectSheet(G, 'physics', { name: 'Vex' });
  sheet.draw(0, true);
  const blankC = document.createElement('canvas'); blankC.width = sheet.w; blankC.height = sheet.h; blankC.getContext('2d').drawImage(sheet.canvas, 0, 0);
  const blankT = new THREE.CanvasTexture(blankC); blankT.colorSpace = THREE.SRGBColorSpace; blankT.anisotropy = 8;
  const screen = makeScreen(G, icon, sheet, { name: 'Vex', n: 40, subject: 'Physics' });
  const laptop = makeLaptop(screen.tex, icon); laptop.hinge.rotation.x = -0.24; laptop.g.position.set(0.42, DT, -1.32); laptop.g.rotation.y = -0.12; R.add(laptop.g);
  const lapLight = new THREE.PointLight(0xdfe8ff, 0, 1.6, 1.6); lapLight.position.set(0.42, DT + 0.3, -1.15); R.add(lapLight);
  const mug = makeMug(0x1c1a22); mug.scale.setScalar(1.3); R.add(mug);
  const books = [['CALCULUS', 0xd8343a], ['CHEMISTRY', 0x2f9e5b], ['PHYSICS', 0x2f6fd6], ['ORGO', 0x7a3fd0], ['ECON', 0xe0a020], ['LINEAR ALG', 0x1c1a22]].map(([n, c], i) => { const b = makeTextbook(n, c, { w: 0.5 - (i % 2) * 0.03, h: 0.1, d: 0.36 }); R.add(b); return b; });
  const lamp = makeDeskLamp(); R.add(lamp.g);
  const fridge = makeMiniFridge(); R.add(fridge);
  // the coffee maker on the fridge (the ending's "done before my coffee is"): it brews the whole reel and never gets past a few %
  const coffee = new THREE.Group(); coffee.position.set(0, 0.62, -0.02); fridge.add(coffee);
  const cm = (c, r = 0.5) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  { const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; coffee.add(o); return o; };
    b(0.24, 0.04, 0.22, cm(0x1c1a22), 0, 0.02, 0); b(0.09, 0.32, 0.2, cm(0x1c1a22), -0.075, 0.18, -0.01); b(0.24, 0.06, 0.22, cm(0x1c1a22), 0, 0.36, 0);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.035), new THREE.MeshBasicMaterial({ toneMapped: false, map: (() => { const c = document.createElement('canvas'); c.width = 160; c.height = 70; const x = c.getContext('2d'); x.fillStyle = '#081208'; x.fillRect(0, 0, 160, 70); x.fillStyle = '#58ff7a'; x.font = '700 30px "Courier New", monospace'; x.textAlign = 'center'; x.fillText('BREW', 80, 46); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() })); scr.position.set(-0.075, 0.28, 0.091); coffee.add(scr); }
  const carafe = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.15, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xd8f0ff, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); carafe.position.set(0.04, 0.115, 0.01); coffee.add(carafe);
  const brew = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.066, 1, 18), cm(0x3a2010, 0.2)); brew.position.set(0.04, 0.04, 0.01); coffee.add(brew);
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.13, 6), cm(0x3a2010, 0.2)); drip.position.set(0.04, 0.26, 0.01); coffee.add(drip);
  const kettle = makeKettle(); R.add(kettle.g);
  const strip = makePowerStrip(); R.add(strip.g);
  const STRIP = [-0.15, FY, -0.62];
  const cords = [
    makeCord(R, [[-0.9, DT + 0.01, -1.02], [-0.97, DT, -0.92], [-0.98, FY + 0.3, -0.85], [-0.6, FY + 0.02, -0.7], [STRIP[0] - 0.12, FY + 0.03, STRIP[2]]]),
    makeCord(R, [[0.4, DT + 0.01, -1.5], [0.05, DT, -0.9], [0.0, FY + 0.35, -0.8], [-0.08, FY + 0.03, -0.66]]),
    makeCord(R, [[0.82, DT + 0.01, -1.5], [0.95, DT, -0.92], [0.98, FY + 0.3, -0.85], [0.4, FY + 0.02, -0.68], [STRIP[0] + 0.06, FY + 0.03, STRIP[2]]]),
    makeCord(R, [[1.2, FY + 0.15, -1.6], [1.1, FY + 0.02, -1.0], [0.5, FY + 0.02, -0.66], [STRIP[0] + 0.12, FY + 0.03, STRIP[2]]]),
  ];
  const clock = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.09), new THREE.MeshBasicMaterial({ toneMapped: false, map: (() => { const c = document.createElement('canvas'); c.width = 220; c.height = 90; const g = c.getContext('2d'); g.fillStyle = '#120a0e'; g.fillRect(0, 0, 220, 90); g.fillStyle = '#ff3b4e'; g.font = '700 64px "Courier New", monospace'; g.textAlign = 'center'; g.fillText('2:00', 96, 66); g.font = '700 24px Inter, Arial'; g.fillText('AM', 190, 40); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() }));
  const clockBox = new THREE.Group(); R.add(clockBox); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x1c1a22, roughness: 0.5 })); b.position.y = 0.06; clockBox.add(b); clock.position.set(0, 0.06, 0.041); clockBox.add(clock); }
  const drill = makeDrill(); R.add(drill.g);
  const phone = makePhone(); R.add(phone.g);
  const phoneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })() })); phoneGlow.scale.setScalar(0.08); phoneGlow.position.set(-0.02, 0.055, 0.02); phone.g.add(phoneGlow); phoneGlow.visible = false;
  const homeworkSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.27), new THREE.MeshStandardMaterial({ map: blankT, side: THREE.DoubleSide, roughness: 0.9 })); R.add(homeworkSheet);
  const stack = makePaperStack(blankT); R.add(stack.g);
  { const wrap = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshStandardMaterial({ roughness: 0.8, map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 240; const x = c.getContext('2d'); x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, 512, 240); x.fillStyle = '#9a1c25'; x.fillRect(0, 0, 512, 16); x.fillRect(0, 224, 512, 16); x.fillStyle = '#1d1d1d'; x.font = '800 54px Fredoka, Arial'; x.textAlign = 'center'; x.fillText('PHYS 1 · PSET 5', 256, 92); x.fillStyle = '#9a1c25'; x.font = '800 62px Fredoka, Arial'; x.fillText('40 PROBLEMS', 256, 170); x.fillStyle = '#555'; x.font = '700 26px Fredoka, Arial'; x.fillText('HANDWRITTEN WORK ONLY', 256, 212); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })() })); wrap.position.set(0, stack.h * 0.5, 0.222); stack.g.add(wrap); }
  const beam = makeIBeam(); R.add(beam.g);
  const clipBeam = new THREE.Plane(new THREE.Vector3(-1, 0, 0), D.X - 0.01);   // the beam slides out of the right wall
  beam.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [clipBeam]; o.material.clipShadows = true; } });
  const panel = makePanel(); panel.g.position.set(D.panel[0], FY + 1.25, BACK + 0.005); R.add(panel.g);
  const gauge = (() => { const g = new THREE.Group(); const face = new THREE.Mesh(new THREE.CircleGeometry(0.075, 28), new THREE.MeshBasicMaterial({ toneMapped: false, map: (() => { const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#f6f2e6'; x.beginPath(); x.arc(80, 80, 78, 0, 7); x.fill(); x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; for (let i = 0; i <= 20; i += 5) { const a = PI * (1 - i / 20); x.beginPath(); x.moveTo(80 + 60 * Math.cos(a), 80 - 60 * Math.sin(a)); x.lineTo(80 + 70 * Math.cos(a), 80 - 70 * Math.sin(a)); x.stroke(); x.fillStyle = '#1a1a1a'; x.font = '700 18px Inter, Arial'; x.textAlign = 'center'; x.fillText(String(i), 80 + 46 * Math.cos(a), 86 - 46 * Math.sin(a)); } x.fillStyle = '#d8343a'; x.font = '800 20px Inter, Arial'; x.fillText('AMPS', 80, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() })); g.add(face); const needle = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.06, 0.004), new THREE.MeshBasicMaterial({ color: 0xd8343a })); needle.geometry.translate(0, 0.03, 0.003); g.add(needle); return { g, needle }; })();
  gauge.g.position.set(D.panel[0] - 0.4, FY + 1.3, BACK + 0.02); R.add(gauge.g);
  const conduit = makeConduit(R, [[STRIP[0] + 0.2, FY + 0.03, STRIP[2] - 0.02], [0.95, FY + 0.03, -0.66], [1.0, FY + 0.03, -1.2], [1.0, FY + 0.03, -2.6], [1.9, FY + 0.03, -3.45], [2.12, FY + 0.03, -3.52], [2.12, FY + 0.7, -3.53], [D.panel[0] - 0.1, FY + 0.95, BACK + 0.05]]);
  const printer = makePrinter(); R.add(printer.g);
  const pStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.4), new THREE.MeshStandardMaterial({ color: 0x2f6fd6, roughness: 0.55 })); R.add(pStand);
  const conv = makeConveyor(2.2); R.add(conv.g);
  const robot = makeRobotArm(0xff4fd8); robot.g.scale.setScalar(0.36); R.add(robot.g);
  const doneTray = new THREE.Group(); R.add(doneTray); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.42), new THREE.MeshStandardMaterial({ color: 0x1c1a22, roughness: 0.5 })); b.position.y = 0.03; doneTray.add(b); const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.09), new THREE.MeshBasicMaterial({ toneMapped: false, map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 76; const x = c.getContext('2d'); x.fillStyle = '#58d36b'; x.fillRect(0, 0, 256, 76); x.fillStyle = '#fff'; x.font = '800 54px Fredoka, Arial'; x.textAlign = 'center'; x.fillText('DONE ✓', 128, 56); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() })); tag.position.set(0, 0.04, 0.215); doneTray.add(tag); }
  const doneStand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.44), new THREE.MeshStandardMaterial({ color: 0x2f6fd6, roughness: 0.55 })); R.add(doneStand);
  const donePile = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1, 0.34), [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshStandardMaterial({ color: 0xffffff, map: i === 2 ? sheet.tex : null, roughness: 0.9 }))); R.add(donePile);
  const pages = Array.from({ length: 7 }, () => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.31), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.9, side: THREE.DoubleSide })); p.rotation.x = -PI / 2; R.add(p); return p; });
  const chute = makeChute(1.75); chute.g.position.set(-0.8, D.ROOF + 0.35, -2.08); R.add(chute.g);
  const outletPlate = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.19, 0.014), new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.5 })); outletPlate.position.set(D.panel[0] - 0.78, FY + 0.72, BACK + 0.008); R.add(outletPlate);
  for (const dy of [0.045, -0.045]) for (const dx of [-0.02, 0.02]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.026, 0.004), new THREE.MeshBasicMaterial({ color: 0x222222 })); sl.position.set(D.panel[0] - 0.78 + dx, FY + 0.72 + dy, BACK + 0.016); R.add(sl); }
  const bowl = new THREE.Group(); R.add(bowl); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 10, 0, PI * 2, PI / 2, PI / 2), new THREE.MeshStandardMaterial({ color: 0xff4fd8, roughness: 0.5, side: THREE.DoubleSide })); b.position.y = 0.11; bowl.add(b); }
  const chips = Array.from({ length: 9 }, (_, i) => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.025, 7), new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.6, side: THREE.DoubleSide })); bowl.add(c); c.position.set(Math.cos(i * 2.3) * 0.05, 0.1 + (i % 3) * 0.012, Math.sin(i * 2.3) * 0.05); c.rotation.set(i, i * 2, 0); return c; });
  const triGlow = (() => { const e = desk.braceEnds, m = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0, toneMapped: false, depthTest: false }); const g = new THREE.Group(); desk.g.add(g);
    const pts = [[e.foot[0], e.foot[1]], [e.top[0], e.top[1]], [e.foot[0], e.top[1]]]; for (let i = 0; i < 3; i++) { const a = pts[i], b = pts[(i + 1) % 3], L = Math.hypot(b[0] - a[0], b[1] - a[1]); const bar = new THREE.Mesh(new THREE.BoxGeometry(L + 0.03, 0.03, 0.01), m); bar.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, e.foot[2] + 0.06); bar.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); bar.renderOrder = 8; g.add(bar); } return { g, m }; })();
  const arrowsL = makeArrows(R, [[-0.3, DT + 0.55, 0.06], [-0.3, FY + 0.05, 0.06], [-0.3, CY - 0.12, 0.06], [-2.85, CY - 0.12, 0.06], [-2.85, 0.1, 0.06], [-3.1, -0.55, 0.06]], { color: 0xffd23f, count: 12, size: 0.3, speed: 1.6 });
  const arrowsR = makeArrows(R, [[0.1, DT + 0.55, 0.06], [0.1, FY + 0.05, 0.06], [0.1, CY - 0.12, 0.06], [2.85, CY - 0.12, 0.06], [2.85, 0.1, 0.06], [3.1, -0.55, 0.06]], { color: 0xffd23f, count: 12, size: 0.3, speed: 1.6 });

  // ---------------------------------------------------------------- Vex (067/071's look) + Derek (a toon)
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  const GM = dressGoth(VEX); scene.add(VEX.root); void GM;
  // grips: a group on each hand bone, posed at rest so the local frame = the hand's; props are posed in hand space each frame
  const gripR = new THREE.Group(), gripL = new THREE.Group(); VEX.H.rightHand.add(gripR); VEX.H.leftHand.add(gripL);
  const derek = makeToon({ skin: 0xf1c7a0, shirt: 0xd8343a, pants: 0x34495e, hair: 0x3a2414, hairStyle: 'messy' }); R.add(derek.root);
  const phones = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 20, PI * 1.2), new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.4 })); derek.head.add(phones); phones.rotation.set(0, 0, -0.1 * PI - 0.2); phones.position.set(0, -0.26, 0); phones.rotation.x = PI / 2 + 0.3;
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x2c2c32, roughness: 0.4 })); R.add(pad);
  const derekSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9, map: (() => { const c = document.createElement('canvas'); c.width = 420; c.height = 300; const x = c.getContext('2d'); x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, 420, 300); x.fillStyle = '#1a1a1a'; x.font = '800 40px Fredoka, Arial'; x.textAlign = 'center'; x.fillText("DEREK'S HW", 210, 70); x.fillStyle = '#d8343a'; x.font = '800 70px Fredoka, Arial'; x.fillText('PLS?', 210, 170); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 3; for (let y = 200; y < 290; y += 26) { x.beginPath(); x.moveTo(30, y); x.lineTo(390, y); x.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() })); R.add(derekSheet);
  const dizzy = makeDizzy(R, { r: 0.3, size: 0.08 });
  const fill = new THREE.PointLight(0xfff0e8, 0, 0, 1.6); scene.add(fill);   // a soft face fill at the lens (∝ d^1.6), 064's trick

  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  // her own arm presets (her frame: x = her left, y up, z front); each [upper, lower]
  const A = {
    sheetUp: { L: [[0.85, 0.3, 0.2], [0.12, 1, 0.12]], R: ARMS.hip.L.map((d) => [-d[0], d[1], d[2]]) },
    drill: { L: ARMS.hip.L, R: [[-0.3, -0.62, 0.72], [-0.25, -0.78, 0.58]] },
    push: { L: ARMS.hip.L, R: [[-0.42, -0.72, 0.55], [-0.3, -0.62, 0.72]] },
    pointDown: { L: ARMS.hip.L, R: [[-0.32, -0.5, 0.8], [-0.2, -0.86, 0.48]] },
    photo: { L: ARMS.hip.L, R: [[-0.32, -0.6, 0.73], [-0.12, -0.5, 0.86]] },
    tap: { L: [[0.28, -0.55, 0.79], [0.12, -0.42, 0.9]], R: ARMS.hip.L.map((d) => [-d[0], d[1], d[2]]) },
    catch: { L: ARMS.hip.L, R: [[-0.3, -0.55, 0.78], [-0.08, 0.05, 1.0]] },
  };
  const armsOf = (pose) => { const P = A[pose] || ARMS[pose] || ARMS.rest, L = P.L || ARMS.rest.L; return { L, R: P.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });
  const HANDS = { drill: { R: 'fist' }, push: { R: 'point' }, pointDown: { R: 'point' }, photo: { R: 'hold' }, tap: { L: 'point' }, catch: { R: 'open' }, sheetUp: { L: 'hold' } };
  const VX = D.vex[0], VZ = D.vex[1];
  // her beats: [t0, pose, extra(t)]
  const VSEQ = [
    [-1, 'sheetUp', (t) => ({ tilt: 0.1, face: CONF(t) })],
    [T.so0 + 0.1, 'hip', (t) => ({ tilt: -0.08, face: CONF(t) })],
    [T.congrats - 0.1, 'shrug', (t) => ({ tilt: 0.12, face: CONF(t, { relaxed: 0.25 }) })],
    [T.wobbles - 0.1, 'hip', (t) => ({ face: CONF(t, { surprised: bump(t, T.coffees - 0.1, T.coffees + 0.1) * 0.5 }), look: [0, -0.6 * bump(t, T.on1 - 0.2, T.on1)] })],
    [T.so1 - 0.1, 'drill', (t) => ({ lean: 0.32, nod: 0.25, face: CONF(t, { relaxed: 0.2 }) })],
    [T.this1 = W('brace', 'this') - 0.05, 'hip', (t) => ({ tilt: 0.1, face: CONF(t) })],
    [T.cant - 0.25, 'push', (t) => ({ lean: 0.2, face: CONF(t, { relaxed: 0.25 }) })],
    [T.unlike - 0.05, 'rest', (t) => { const k = bump(t, T.unlike, T.am); return { lean: 0.4 * k, nod: 0.24 * k, tilt: 0.3 * k, face: { relaxed: 0.45, blink: 0.35 + 0.4 * k } }; }],
    [T.then1 - 0.15, 'hip', (t) => ({ tilt: -0.06, face: CONF(t, { surprised: bump(t, T.sags, T.sags + 0.2) * 0.4 }), look: [0, -0.7 * bump(t, T.floor, T.sags)] })],
    [T.so2 - 0.05, 'pointDown', (t) => ({ lean: 0.15, nod: 0.3, face: CONF(t), look: [0, -0.6] })],
    [T.load - 0.3, 'hip', (t) => ({ tilt: 0.1, face: CONF(t) })],
    [T.brought - 0.3, 'shrug', (t) => ({ tilt: -0.14, face: CONF(t, { relaxed: 0.3 }) })],
    [T.lamp - 0.2, 'tap', (t) => ({ face: CONF(t), turn: -0.15 })],
    [T.fridge - 0.2, 'hip', (t) => ({ face: CONF(t), turn: 0.1 })],
    [T.strip - 0.05, 'rest', (t) => ({ face: { surprised: 0.8 * bump(t, T.strip, T.strip + 0.15), blink: 0 }, lean: -0.1 })],
    [T.so3 - 0.1, 'hip', (t) => ({ face: CONF(t, { angry: 0.3 }), turn: 0.35 * bump(t, T.so3, T.line) })],
    [T.dedicated - 0.2, 'hip', (t) => ({ face: CONF(t), turn: 0.3 })],
    [T.kettle1 - 0.3, 'cross', (t) => ({ tilt: 0.1, face: CONF(t, { relaxed: 0.25 }) })],
    [T.then2 - 0.1, 'hip', (t) => ({ face: CONF(t, { surprised: 0.7 * bump(t, T.drops, T.drops + 0.12) }) })],
    [T.handwritten - 0.2, 'cross', (t) => ({ face: CONF(t, { angry: 0.45 }), tilt: -0.08 })],
    [T.so4 - 0.1, 'tap', (t) => ({ face: CONF(t), turn: -0.2 })],
    [T.one1 - 0.25, 'photo', (t) => ({ lean: 0.15, nod: 0.35, face: CONF(t), turn: 0.15 })],
    [T.solves - 0.1, 'hip', (t) => ({ face: CONF(t, { relaxed: 0.25 }) })],
    [T.add - 0.2, 'point', (t) => ({ turn: 0.25, face: CONF(t) })],
    [T.robot - 0.2, 'point', (t) => ({ turn: -0.35, face: CONF(t) })],
    [T.snack - 0.2, 'catch', (t) => ({ face: CONF(t, { relaxed: 0.3 }), turn: 0.2 })],
    [T.congrats2 - 0.2, 'hip', (t) => ({ tilt: 0.12, face: CONF(t) })],
    [T.because - 0.15, 'shrug', (t) => ({ tilt: -0.15, face: CONF(t, { relaxed: 0.3 }) })],
    [T.now - 0.15, 'hip', (t) => ({ face: CONF(t) })],
    [T.he - 0.1, 'hip', (t) => ({ nod: 0.25, face: CONF(t), look: [0, -0.5] })],
    [T.cute - 0.25, 'hip', (t) => ({ tilt: -0.16, turn: -0.1, face: CONF(t, { relaxed: 0.25, blinkLeft: t > T.cute + 0.35 ? 1 : 0 }) })],
  ];
  const vexState = (t) => { let s = VSEQ[0]; for (const v of VSEQ) if (t >= v[0]) s = v; return { pose: s[1], ...s[2](t) }; };
  function glide(t, v) {
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexState(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    const a = armsOf(v.pose); return { ...v, armL: a.L, armR: a.R };
  }

  // ---------------------------------------------------------------- schedule (sag, power, drops)
  const SAG = (t) => (t < T.floor - 0.1 ? 0 : t < T.load + 0.2 ? 0.42 * easeOutBack(u01(t, T.floor - 0.1, T.sags + 0.35), 1.2) * (t > T.beam1 + 0.3 ? 1 - smooth(u01(t, T.beam1 + 0.3, T.load + 0.2)) : 1) : 0) + (t > T.three ? 0.05 * Math.exp(-(t - T.three) * 5) * Math.abs(Math.sin((t - T.three) * 18)) : 0);
  const BLACK = [T.strip + 0.08, T.circuit - 0.2];
  const POWER = (t) => { if (t < BLACK[0] || t > T.circuit + 0.5) return [1, 1]; if (t < BLACK[1]) return [0.06, 0.04]; const f = (k) => (Math.sin(k * 60) > 0 ? 1 : 0.3); return [t < BLACK[1] + 0.25 ? f(t) : 1, t < T.circuit + 0.1 ? 0.05 : t < T.circuit + 0.35 ? f(t * 1.3) : 1]; };
  const BOOK_T = [T.textbooks - 0.05, T.textbooks + 0.22, T.go - 0.02, T.on2 = W('books', 'on'), T.on2 + 0.28, T.three];
  const DEV = { lamp: T.lamp, laptop: T.laptop, fridge: T.fridge, kettle: T.kettle0, strip: T.one0 };
  const STACK_T = T.drops + 0.06;
  const BEAM_IN = [T.so2 + 0.15, T.steel1 + 0.04];
  const CONDUIT = [T.run - 0.05, T.line + 0.15];
  const PANEL = T.so3 + 0.05, FLIP = T.circuit - 0.25;
  const PRINT0 = T.printer + 0.25, CONV0 = T.conveyor - 0.05, ROBOT0 = T.robot - 0.05, STAPLE = T.staples, CHUTE0 = T.snack - 0.1, LAND = (i) => CHUTE0 + 0.56 + i * 0.4, CRUNCH = LAND(0);
  const DEREK_BONK = T.beam2 + 0.02, DEREK_UP = T.he - 0.1;
  // the in-app write: progress p over the screen beat; the ramp FBD lands on "diagrams"
  const cumAt = (pred) => { let a = 0, last = 0; for (const it of sheet.items) { a += it.kind === 'p' ? it.w : 1; if (pred(it)) last = a; } return last; };
  const P1 = cumAt((it) => it.pi === 0), PT = sheet.total;
  const writeP = (t) => (t < T.writes ? 0 : t < T.diagrams ? P1 * 0.55 * u01(t, T.writes, T.diagrams) : t < T.too0 + 0.35 ? P1 * (0.55 + 0.45 * u01(t, T.diagrams, T.too0 + 0.35)) : P1 + (PT - P1) * u01(t, T.too0 + 0.35, T.add + 0.4));

  // ---------------------------------------------------------------- fx + kicks
  const fx = makeFX(R, { max: { dust: 300, confetti: 500, spark: 260, smoke: 200, crumb: 400, rock: 200, drops: 300, glow: 60 }, nearFade: [0.35, 1.2] });
  const FXN = { burst: 0, stream: 0, times: [] }, fb = fx.burst, fs = fx.stream;
  fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); fb(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); fs(k, t0, t1, o); };
  const DX = D.desk[0], DZ = D.desk[1];
  // hook: the sheet tossed, crates land, the door lands
  fx.burst('dust', T.built + 0.02, { pos: [DX - 0.68, FY + 0.05, DZ], n: 6, spread: 1.4, speed: [0.3, 0.9], size: [0.12, 0.24], alpha: 0.45, color: 0xbfb2a4 });
  fx.burst('dust', T.desk0 + 0.02, { pos: [DX + 0.68, FY + 0.05, DZ], n: 6, spread: 1.4, speed: [0.3, 0.9], size: [0.12, 0.24], alpha: 0.45, color: 0xbfb2a4 });
  fx.burst('dust', T.door0 + 0.02, { pos: [DX, DT - 0.1, DZ - 0.25], n: 6, spread: 1.5, speed: [0.4, 1.0], size: [0.08, 0.16], life: [0.5, 0.8], alpha: 0.4, color: 0xc8bba8 });
  fx.burst('crumb', T.door0 + 0.02, { pos: [DX, DT, DZ], n: 14, spread: 1.2, speed: [1, 2.5], size: [0.02, 0.04], color: 0xe8dcc8, floor: FY });
  // congrats: the mug slides off, splash, the coffee drips through onto Derek
  const MUG_FALL = T.coffees - 0.25, MUG_HIT = T.coffees + 0.05;
  fx.burst('drops', MUG_HIT, { pos: [0.28, FY + 0.03, -0.67], n: 30, spread: 1.1, speed: [0.8, 2.2], size: [0.02, 0.04], color: 0x5a3416, floor: FY });
  fx.stream('drops', T.on1 - 0.15, T.down1 + 0.4, { pos: [D.derek[0] + 0.02, CY - 0.02, D.derek[1] - 0.05], rate: 14, spread: 0.08, dir: [0, -1, 0], speed: [0.2, 0.5], size: [0.018, 0.03], color: 0x5a3416, floor: 2.2 });
  fx.burst('drops', T.derek1, { pos: [D.derek[0], 2.33, D.derek[1]], n: 16, spread: 1.3, speed: [0.5, 1.4], size: [0.02, 0.035], color: 0x5a3416 });
  // brace: drill sawdust + sparks at the bolts, the glowing triangle
  fx.stream('crumb', T.bolt - 0.05, T.diagonal + 0.35, { pos: [DX + desk.braceEnds.top[0], FY + desk.braceEnds.top[1], DZ + desk.braceEnds.top[2] + 0.03], rate: 40, spread: 1.0, speed: [0.5, 1.4], size: [0.012, 0.025], color: 0xd9b27a, floor: FY });
  fx.burst('spark', T.diagonal + 0.3, { pos: [DX + desk.braceEnds.top[0], FY + desk.braceEnds.top[1], DZ + desk.braceEnds.top[2] + 0.05], n: 14, spread: 1.4, speed: [0.6, 1.6] });
  fx.burst('spark', T.bolt + 0.1, { pos: [DX + desk.braceEnds.foot[0], FY + desk.braceEnds.foot[1], DZ + desk.braceEnds.foot[2] + 0.05], n: 10, spread: 1.4, speed: [0.5, 1.2] });
  // books: dust per book, plaster rain on Derek during the sag, the bonk
  BOOK_T.slice(0, 5).forEach((tb, i) => fx.burst('dust', tb + 0.02, { pos: [DX - 0.5, DT + 0.1 * i, DZ], n: 5, spread: 1.4, speed: [0.3, 0.8], size: [0.12, 0.24], alpha: 0.45, color: 0xc8bba8 }));
  fx.stream('rock', T.floor, T.room + 0.3, { pos: [D.derek[0], CY - 0.35, -1.2], box: [1.6, 0.05, 1.2], rate: 22, spread: 0.6, dir: [0, -1, 0], speed: [0.1, 0.5], size: [0.025, 0.06], color: 0xece6dc, floor: D.loftTop + 0.08 });
  fx.burst('dust', T.sags, { pos: [D.derek[0], CY - 0.4, -1.2], n: 14, spread: 1.4, speed: [0.3, 1.0], size: [0.12, 0.24], alpha: 0.45, color: 0xe6e0d6 });
  fx.burst('rock', T.room - 0.12, { pos: [D.derek[0], CY - 0.3, D.derek[1] - 0.05], n: 5, spread: 0.3, dir: [0, -1, 0], speed: [1, 2], size: [0.06, 0.1], color: 0xece6dc, floor: D.loftTop + 0.08 });
  // beam: grinding sparks at the wall, the clang, the jack-up dust, the extra book
  fx.stream('spark', BEAM_IN[0], BEAM_IN[1], { pos: [D.X - 0.05, CY - 0.3, D.beam.z], rate: 50, spread: 1.0, dir: [-1, 0.3, 0.4], speed: [1, 2.4] });
  fx.burst('dust', BEAM_IN[1], { pos: [0.3, CY - 0.45, D.beam.z + 0.2], n: 12, spread: 1.4, speed: [0.4, 1.2], size: [0.12, 0.24], alpha: 0.45, color: 0xd8d2c8 });
  fx.burst('spark', BEAM_IN[1], { pos: [0.0, CY - 0.4, D.beam.z + 0.12], n: 20, spread: 1.6, speed: [0.8, 2] });
  fx.burst('dust', T.load - 0.2, { pos: [0, CY - 0.1, -0.5], box: [3, 0.1, 0.3], n: 14, spread: 1.4, speed: [0.3, 0.8], size: [0.12, 0.24], alpha: 0.45, color: 0xd8d2c8 });
  fx.burst('dust', T.three + 0.03, { pos: [DX - 0.5, DT + 0.6, DZ], n: 8, spread: 1.4, speed: [0.3, 0.9], size: [0.12, 0.24], alpha: 0.45, color: 0xc8bba8 });
  // power: pops, the zap, smoke; the circuit: conduit sparks, breaker sparks, kettle steam
  Object.values(DEV).forEach((tb) => fx.burst('confetti', tb + 0.02, { pos: [DX, DT + 0.25, DZ + 0.2], n: 6, spread: 1.2, speed: [0.6, 1.4], floor: FY }));
  fx.burst('spark', T.strip + 0.02, { pos: [STRIP[0], FY + 0.08, STRIP[2]], n: 36, spread: 1.6, speed: [1, 2.6], size: [0.02, 0.05] });
  fx.burst('glow', T.strip + 0.02, { pos: [STRIP[0], FY + 0.1, STRIP[2]], n: 1, size: [0.25, 0.35] });
  fx.stream('smoke', T.strip + 0.05, T.line, { pos: [STRIP[0], FY + 0.1, STRIP[2]], rate: 8, spread: 0.5, speed: [0.2, 0.5], size: [0.15, 0.3], color: 0x55555a });
  fx.stream('spark', CONDUIT[0], CONDUIT[1], { pos: [1.0, FY + 0.06, -2.0], box: [0.1, 0.02, 2.4], rate: 30, spread: 1.2, speed: [0.4, 1.0] });
  fx.burst('spark', FLIP, { pos: [D.panel[0] - 0.07, FY + 1.45, BACK + 0.15], n: 18, spread: 1.4, speed: [0.5, 1.4] });
  fx.stream('mist', T.half - 0.1, T.then2 + 0.4, { pos: [DX + 0.85 + 0.15, DT + 0.24, -1.5], rate: 9, spread: 0.4, speed: [0.3, 0.6], size: [0.05, 0.1], alpha: 0.45, color: 0xf4f4f4 });
  // the 40 problems slam down
  fx.burst('confetti', STACK_T, { pos: [DX - 0.05, DT + 0.35, DZ + 0.1], n: 40, spread: 1.5, speed: [1.2, 3], color: 0xfbfaf6, floor: FY });
  fx.burst('dust', STACK_T, { pos: [DX, DT + 0.1, DZ + 0.3], n: 10, spread: 1.6, speed: [0.4, 1.2], size: [0.12, 0.24], alpha: 0.45, color: 0xd0c8bc });
  fx.burst('rock', STACK_T + 0.05, { pos: [D.derek[0], CY - 0.1, -1.1], box: [1, 0.05, 0.8], n: 8, spread: 0.6, dir: [0, -1, 0], speed: [0.2, 0.6], size: [0.02, 0.04], color: 0xece6dc, floor: D.loftTop + 0.08 });
  // the photo flash; the list: printer puffs, conveyor clunk, staple sparks, chips
  fx.burst('spark', STAPLE, { pos: [0.95, FY + 0.45, -0.55], n: 16, spread: 1.4, speed: [0.6, 1.4] });
  fx.burst('crumb', CRUNCH, { pos: [-0.8, DT + 0.3, -1.7], n: 24, spread: 1.2, speed: [0.6, 1.5], size: [0.02, 0.04], color: 0xf2c14e, floor: DT });
  fx.burst('confetti', T.factory, { pos: [0, FY + 2.2, -1.2], box: [3, 0.2, 1], n: 90, spread: 1.4, speed: [0.5, 1.5], floor: FY });
  fx.burst('confetti', T.done + 0.05, { pos: [1.3, FY + 0.6, -0.45], n: 30, spread: 1.4, speed: [1, 2.2], floor: FY });
  fx.burst('dust', DEREK_BONK, { pos: [D.derek[0], CY - 0.3, D.derek[1] - 0.1], n: 8, spread: 1.4, speed: [0.3, 0.8], size: [0.12, 0.24], alpha: 0.45, color: 0xe6e0d6 });
  fx.burst('spark', DEREK_BONK, { pos: [D.derek[0], CY - 0.26, D.derek[1]], n: 12, spread: 1.6, speed: [0.5, 1.2] });
  // density fill (word-keyed): the 2 AM clock flashes, the footings take the load, the outlet sparks, angry steam, paper bits
  fx.burst('spark', T.two1, { pos: [0.28, DT + 0.12, -1.45], n: 8, spread: 1.4, speed: [0.3, 0.8] });
  for (const s2 of [-1, 1]) fx.burst('dust', T.dorm1 = W('beam', 'dorm'), { pos: [s2 * 3.1, -0.4, 0.1], n: 5, spread: 1.2, speed: [0.3, 0.7], size: [0.12, 0.24], alpha: 0.45, color: 0xc8bba8 });
  fx.burst('confetti', T.brought, { pos: [DX - 0.5, DT + 1.1, DZ], n: 10, spread: 1.4, speed: [0.5, 1.2], floor: FY });
  BOOK_T.slice(0, 5).forEach((tb, i) => fx.burst('crumb', tb + 0.03, { pos: [DX - 0.5, DT + 0.1 * (i + 1), DZ], n: 6, spread: 1.4, speed: [0.6, 1.4], size: [0.015, 0.03], color: 0xf4efe2, floor: DT }));
  [0.35, 0.7, 1.05].forEach((dt) => fx.burst('drops', T.on1 + dt, { pos: [D.derek[0], 2.3, D.derek[1]], n: 6, spread: 1.4, speed: [0.4, 1.0], size: [0.015, 0.03], color: 0x5a3416 }));
  for (let i = 0; i < 6; i++) fx.burst('spark', FLIP + 0.05 + i * 0.07, { pos: [D.panel[0] + (i % 2 ? 0.07 : -0.07), FY + 1.45 - Math.floor(i / 2) * 0.075, BACK + 0.15], n: 4, spread: 1.4, speed: [0.3, 0.8] });
  for (let i = 0; i < 5; i++) fx.burst('spark', lerp(CONDUIT[0], CONDUIT[1], (i + 1) / 6), { pos: [i < 2 ? 0.2 + i * 0.4 : 1.0, FY + 0.06, i < 2 ? -0.64 : -1.2 - (i - 2) * 0.7], n: 5, spread: 1.4, speed: [0.3, 0.8] });
  fx.burst('spark', T.outlet, { pos: [D.panel[0] - 0.78, FY + 0.72, BACK + 0.06], n: 10, spread: 1.4, speed: [0.4, 1.0] });
  [T.kettle1, T.twelve, T.half].forEach((tb) => fx.burst('mist', tb, { pos: [0.97, DT + 0.24, -1.5], n: 4, spread: 0.5, speed: [0.3, 0.7], size: [0.04, 0.08], alpha: 0.5, color: 0xf4f4f4 }));
  for (const s2 of [-1, 1]) fx.burst('mist', T.only, { pos: [VX + s2 * 0.09, FY + 1.6, VZ], n: 5, dir: [s2 * 0.5, 1, 0], spread: 0.35, speed: [0.6, 1.1], size: [0.03, 0.05], alpha: 0.55, color: 0xffffff });
  fx.burst('confetti', T.scribe + 0.2, { pos: [0.42, DT + 0.45, -1.2], n: 14, spread: 1.4, speed: [0.5, 1.2], floor: DT });
  fx.burst('confetti', T.physics = W('prof', 'physics'), { pos: [DX, DT + 0.4, DZ + 0.1], n: 12, spread: 1.4, speed: [0.6, 1.4], color: 0xfbfaf6, floor: FY });
  [0, 1, 2, 3].forEach((i) => fx.burst('crumb', LAND(i), { pos: [-0.85, DT + 0.2, -1.62], n: 6, spread: 1.2, speed: [0.4, 1.0], size: [0.02, 0.035], color: 0xf2c14e, floor: DT }));
  // printing / conveyor / staple loop: pages leave the printer every 0.5 s from PRINT0; puffs at each staple
  const PAGE_DT = 0.55, PG = (k) => PRINT0 + k * PAGE_DT;
  for (let k = 0; k < 30; k++) if (PG(k) < END - 0.5) fx.burst('dust', PG(k) + 0.02, { pos: [-1.45, FY + 0.5, -0.32], n: 2, spread: 1.0, speed: [0.2, 0.5], size: [0.08, 0.14], alpha: 0.35, color: 0xf4f4f4 });
  for (let k = 0; k < 30; k++) { const ts = PG(k) + 2.0; if (ts > STAPLE - 0.02 && ts < END) fx.burst('spark', ts, { pos: [0.95, FY + 0.45, -0.55], n: 5, spread: 1.2, speed: [0.3, 0.8] }); }

  const KICKS = [[T.built, 0.35], [T.desk0, 0.35], [T.door0 + 0.02, 0.95], [T.two0, 0.25], [T.crates, 0.25], [MUG_HIT, 0.45], [T.derek1, 0.3], [T.bolt + 0.1, 0.25], [T.diagonal + 0.3, 0.35],
    ...BOOK_T.slice(0, 5).map((tb) => [tb, 0.55]), [T.sags, 0.6], [T.room, 0.8], [BEAM_IN[1], 1.0], [T.three + 0.02, 0.7],
    ...Object.values(DEV).map((tb) => [tb, 0.25]), [T.strip + 0.02, 1.1], [CONDUIT[1], 0.35], [FLIP, 0.45], [T.half + 0.05, 0.3],
    [STACK_T, 1.2], [T.physics, 0.2], [T.handwritten, 0.55], [T.only, 0.2], [T.two1, 0.2], [T.am, 0.25], [T.dorm1, 0.3], [T.brought, 0.2], [T.outlet, 0.25], [T.scribe + 0.2, 0.25], [T.robot, 0.3], [T.snack, 0.25], [T.door1, 0.25], [T.desks, 0.2], [T.done, 0.35], [T.lives, 0.2], [T.he, 0.2], [T.photo, 0.3], [PRINT0, 0.35], [CONV0 + 0.3, 0.4], [STAPLE, 0.8], [CRUNCH, 0.4], [T.factory, 0.5], [DEREK_BONK, 0.9], [T.cute + 0.05, 0.2]]
    .filter(([t]) => !inTerm(t)).map(([t, s]) => [t, s, 0.45]);
  const kick = makeKick(KICKS);

  // ---------------------------------------------------------------- the camera: ONE continuous take (framings on their words)
  const Fr = [];
  const F = (t, look, d, yaw = 0, pitch = 4, fov = 40, o = {}) => { const y = yaw * PI / 180, p = pitch * PI / 180; Fr.push({ t, look, pos: [look[0] + d * Math.sin(y) * Math.cos(p), look[1] + d * Math.sin(p), look[2] + d * Math.cos(y) * Math.cos(p)], fov, ...o }); };
  const VF = [VX, FY + 1.42, VZ];   // her face
  const DF = [D.derek[0], 2.08, D.derek[1]];   // Derek's face
  F(0, [VX - 0.05, FY + 1.05, -1.7], 3.2, 14, 3, 40, { keep: true });
  F(T.door0 - 0.05, [DX, DT - 0.05, DZ - 0.1], 3.5, -18, 9, 40, { keep: true });
  F(T.two0, [DX + 0.1, FY + 0.55, DZ - 0.1], 3.1, 24, 12, 40);
  F(T.congrats, [VX, FY + 1.12, -1.75], 2.6, -16, 4, 40, { keep: true });
  F(T.wobbles, [DX + 0.2, 3.0, -1.3], 8.0, 18, 3, 42, { keep: true });
  F(T.on1 + 0.05, [D.derek[0], 1.5, -1.0], 3.0, -2, 5, 40, { keep: true, until: T.down1 });
  F(T.down1 + 0.6, [0.05, 2.7, -1.25], 3.9, 6, 2, 44, { pass: true });   // a crane past the slab (one 2.2 m rise read as a whip)
  F(T.bolt, [DX - 0.05, FY + 0.82, -1.6], 3.3, 14, 1, 44, { keep: true });
  F(T.triangulation, [DX - 0.1, FY + 0.38, DZ], 2.6, -16, 3, 40, { keep: true });
  F(T.cant - 0.1, [VX, FY + 1.0, -1.55], 3.0, 20, 4, 40);
  F(T.unlike + 0.1, [VX - 0.05, FY + 1.2, -1.85], 2.1, -28, 0, 38, { keep: true });
  F(T.textbooks - 0.05, [DX - 0.45, DT + 0.1, -1.3], 2.4, 10, 40, 40, { keep: true });
  F(T.floor + 0.1, [0.05, 2.75, -1.25], 8.3, -18, -1, 42, { keep: true });
  F(T.room - 0.15, [D.derek[0], 1.42, -1.05], 3.0, 18, 4, 40, { keep: true });
  F(T.so2 + 0.2, [0.3, 1.3, -1.15], 3.4, -16, 3, 42, { keep: true, until: T.beam1 - 0.2 });
  F(T.beam1 + 0.15, [0.6, 1.95, -1.2], 3.6, 24, 2, 42, { keep: true });
  F(T.load - 0.15, [0.0, 2.95, -1.3], 9.4, -12, 4, 44, { keep: true });
  F(T.forty1 - 0.1, [0.0, 3.0, -1.3], 7.8, 6, 3, 44, { keep: true, until: T.foot - 0.3 });
  F(T.three - 0.15, [DX - 0.4, FY + 1.05, -1.3], 2.9, 32, -14, 40, { keep: true });
  F(T.lamp - 0.05, [0.15, FY + 0.92, -1.45], 3.2, -26, 6, 40, { keep: true });
  F(T.fridge - 0.1, [1.05, FY + 0.55, -1.5], 3.1, 18, 6, 40);
  F(T.one0, [STRIP[0] + 0.1, FY + 0.2, -0.75], 2.3, -8, 44, 40, { keep: true });
  F(T.run, [0.9, FY + 0.8, -2.1], 5.0, 18, 6, 42, { keep: true });
  F(T.dedicated - 0.1, [D.panel[0] - 0.12, FY + 1.18, -3.2], 2.6, -20, 3, 40, { keep: true });
  F(T.fifteen - 0.1, [D.panel[0] - 0.55, FY + 1.0, -3.35], 2.0, 12, 2, 40, { keep: true });
  F(T.kettle1 - 0.1, [0.75, DT + 0.12, -1.35], 2.3, -22, 6, 40, { keep: true });
  F(T.professor, [DX, FY + 1.05, -1.5], 3.8, 16, 5, 40, { keep: true });
  F(T.handwritten - 0.1, [VX + 0.05, FY + 1.16, -1.95], 2.0, -20, 3, 40, { keep: true });
  F(T.install - 0.05, [0.3, FY + 0.95, -1.5], 2.4, 30, 6, 40, { keep: true });
  F(T.one1, [-0.2, FY + 1.0, -1.55], 2.4, -16, 7, 40, { keep: true });
  // the screen insert (filled in below from the laptop screen's pose)
  const SCR = [];
  F(T.add - 0.05, [-1.1, FY + 0.7, -0.75], 3.4, -22, 7, 40, { keep: true });
  F(T.conveyor + 0.05, [0.1, FY + 0.5, -0.75], 3.5, 16, 6, 40);
  F(T.robot + 0.05, [0.75, FY + 0.7, -0.9], 3.2, -10, 6, 42, { keep: true });
  F(T.snack - 0.15, [-0.7, TOP + 0.05, -1.9], 3.6, 8, 8, 44, { keep: true });
  F(T.congrats2 + 0.1, [0.0, 3.0, -1.4], 11.5, -6, 6, 44, { keep: true });
  F(T.started + 0.1, [0.72, DT + 0.02, -0.97], 1.9, 30, 12, 40, { keep: true });
  F(T.because, [VX + 0.15, FY + 1.05, -1.8], 2.8, -12, 3, 42, { keep: true });
  F(T.now, [1.3, FY + 0.6, -1.05], 3.0, -8, 24, 44, { keep: true, until: T.coffee2 + 0.25 });
  F(T.derek2 + 0.1, [D.derek[0], 1.45, -1.05], 3.0, -24, 4, 40, { keep: true, until: T.beam2 + 0.4 });
  F(T.he - 0.05, [0.05, 3.15, -1.45], 6.2, 12, 2, 42, { keep: true });
  F(T.cute + 0.05, [VX, FY + 1.18, -1.9], 2.5, -6, 3, 40, { stop: true });
  // the screen insert: straight down the laptop screen's normal; the look pans scan → tiles → the page → the FBD
  laptop.g.updateMatrixWorld(true); const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(0, 0, 1), scrX = V(1, 0, 0), scrY = V(0, 1, 0);
  laptop.scr.getWorldPosition(scrP); laptop.scr.getWorldQuaternion(scrQ); scrN.applyQuaternion(scrQ); scrX.applyQuaternion(scrQ); scrY.applyQuaternion(scrQ);
  const onScr = (px, py) => scrP.clone().addScaledVector(scrX, (px / 1280 - 0.5) * 0.58).addScaledVector(scrY, (0.5 - py / 800) * 0.363);
  const scrF = (t, px, py, d, o = {}) => { const c = onScr(px, py), p = c.clone().addScaledVector(scrN, d); Fr.push({ t, pos: p.toArray(), look: c.toArray(), fov: 40, lead: 0.02, maxLead: 0.04, keep: true, ...o }); SCR.push(t); };
  const tipPx = (tip) => [150 + tip[0] * 500 / sheet.w, 110 + tip[1] * 647 / sheet.h];
  scrF(T.photo + 0.45, 640, 400, 1.05);
  scrF(T.solves, 905, 330, 0.85);
  scrF(T.writes, 360, 330, 0.68);
  scrF(T.diagrams - 0.05, 300, 575, 0.62);
  const rail = makeRail(planRail(Fr, { move: [0.35, 13], minHold: 0.6 }));

  // ---------------------------------------------------------------- the end card (Scribe) over the live scene
  const hud = makeHud({ show: [1e9, 1e9 + 1], end: { t: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- per-frame
  const hv = V(), tmpQ = new THREE.Quaternion();
  const place = (o, x, z, yOff = 0, sag = 0) => o.position.set(x, FY + yOff - sagAt(sag, x, z), z);
  function update(t) {
    const sag = SAG(t); S.setSag(sag);
    const [pu, pl] = POWER(t); S.setPower(pu, pl);
    // ---- the desk: lands, racks (wobble) until the brace, rigid after; the scale pop for the drop-ins
    const crateDrop = (tb) => (t < tb - 0.3 ? 9 : t < tb ? 1.6 * (1 - ((t - (tb - 0.3)) / 0.3) ** 2) : Math.max(0, 0.05 * Math.exp(-(t - tb) * 9) * Math.sin((t - tb) * 30)));
    desk.crates[0].c.position.y = crateDrop(T.built); desk.crates[1].c.position.y = crateDrop(T.desk0);
    desk.crates.forEach((c) => (c.c.visible = c.c.position.y < 5));
    const dy = crateDrop(T.door0); desk.top.visible = dy < 5;
    const rackAmp = t < T.wobbles - 0.1 ? 0 : t < T.diagonal + 0.3 ? 0.07 * (0.6 + 0.4 * Math.sin(t * 2.1)) : t < T.cant ? 0.07 * Math.exp(-(t - T.diagonal - 0.3) * 3) : 0;
    const rack = rackAmp * Math.sin(t * 13) + (t > T.cant - 0.05 && t < T.fold + 0.6 ? 0.004 * Math.sin(t * 40) * Math.exp(-(t - T.cant) * 4) : 0);
    desk.set({ rack, brace: bump(t, T.bolt - 0.05, T.diagonal + 0.3), spin: t * 40 * (t > T.bolt - 0.1 && t < T.diagonal + 0.4 ? 1 : 0) });
    desk.top.position.y += dy;
    const sOff = (x, z) => -sagAt(sag, x, z);
    const deskY = (x, z) => DT + sOff(x, z) + dy;
    triGlow.m.opacity = 0.9 * pulse(t, T.triangulation - 0.1, 0.15, 0.9, 0.4) + 0.9 * pulse(t, T.triangles - 0.05, 0.1, 0.5, 0.3);
    // ---- the homework sheet in her raised hand → tossed
    VEX.root.updateMatrixWorld(true);
    // ---- Vex
    const v = glide(t, vexState(t));
    const hs = HANDS[v.pose] || {};
    VEX.update(t, { ...lips(t), sway: 0.12, ...v, hands: hs, face: { ...(v.face || {}) }, x: VX, z: VZ, y: FY + sOff(VX, VZ), rotY: 0 });
    VEX.root.updateMatrixWorld(true);
    // the props in her hands (posed in hand space: +y = along the fingers, the palm faces her local −x/+x)
    homeworkSheet.visible = t < T.so0 + 0.9;
    if (homeworkSheet.visible) {
      if (t < T.so0 + 0.15) { gripL.updateMatrixWorld(true); gripL.getWorldPosition(hv); homeworkSheet.position.copy(hv).add(V(0.02, 0.12, 0.05)); homeworkSheet.rotation.set(0, 0.2, 0.15); }
      else { const a = t - (T.so0 + 0.15); homeworkSheet.position.set(VX + 0.35 + 0.6 * a, FY + 1.7 + 1.2 * a - 4.5 * a * a, VZ + 0.1 + 0.2 * a); homeworkSheet.rotation.set(a * 6, a * 3, a * 9); }
    }
    drill.g.visible = t > T.so1 - 0.3 && t < W('brace', 'this') + 0.1;
    if (drill.g.visible) { const hR = VEX.bpos('rightHand'); drill.g.position.copy(hR).add(V(-0.01, -0.02, 0.03)); drill.g.rotation.set(0, PI / 2, -0.95); }
    phone.g.visible = t > T.one1 - 0.35 && t < T.solves + 0.1;
    if (phone.g.visible) { const hR = VEX.bpos('rightHand'); phone.g.position.copy(hR).add(V(0.0, 0.02, 0.06)); phone.g.rotation.set(-1.2, 0.15, 0); const fl = pulse(t, T.photo, 0.03, 0.06, 0.2); phone.flash.intensity = 0.7 * fl; phoneGlow.material.opacity = fl; phoneGlow.visible = fl > 0.01; }
    // ---- the coffee mug: set down, slides on the wobble, falls, splash
    mug.visible = t > T.congrats - 0.2 && t < MUG_HIT + 0.6;
    if (mug.visible) { const k = u01(t, T.wobbles, MUG_FALL); let x = 0.22 + 0.06 * k, z = -1.05 + 0.18 * k, y = deskY(x, z) + 0.002; let rx = 0;
      if (t > MUG_FALL) { const a = clamp((t - MUG_FALL) / (MUG_HIT - MUG_FALL)); x = 0.28; z = -0.87 + 0.2 * a; y = lerp(DT, FY, a * a); rx = 1.6 * a; }
      mug.position.set(x + Math.sin(rack) * 0.62, y, z); mug.rotation.set(rx, 0.5, 0); mug.scale.setScalar(1.3 * (t < T.congrats ? easeOutBack(u01(t, T.congrats - 0.2, T.congrats + 0.1)) : 1)); }
    // ---- textbooks: drop one by one onto the left end; the 6th (LINEAR ALG) on "three hundred"
    let yb = 0; books.forEach((b, i) => { const tb = BOOK_T[i], h = 0.1; b.visible = t > tb - 0.3; if (!b.visible) return; const f = t < tb ? 1.2 * (1 - ((t - (tb - 0.3)) / 0.3) ** 2) : 0; const sq = squash(t, tb, 0.25); const x = DX - 0.5 + Math.sin(rack) * 0.62, z = DZ - 0.05; b.position.set(x + (i % 2 ? 0.02 : -0.015), deskY(x, z) + yb + f, z + (i % 3) * 0.01); b.rotation.y = (i % 2 ? 0.08 : -0.05); b.scale.set(sq[0], sq[1], sq[0]); yb += h; });
    // ---- the beam: slides in low under the sagged ceiling, then jacks it back up
    const bk = bump(t, BEAM_IN[0], BEAM_IN[1]); beam.g.visible = t > BEAM_IN[0] - 0.05;
    beam.g.position.set(6.6 * (1 - bk) + wobble(t, BEAM_IN[1], 0.04, 30, 8), CY - D.beam.h - sagAt(sag, 0, D.beam.z) * 0.98, D.beam.z);
    const arr = clamp(pulse(t, T.load - 0.05, 0.2, T.foot - T.load + 0.2, 0.4));
    arrowsL.update(t, arr); arrowsR.update(t, arr);
    // ---- devices: pop on their words (scale), lit until the blackout
    const popS = (tb) => (t < tb - 0.02 ? 0 : easeOutBack(u01(t, tb - 0.02, tb + 0.28), 2.2));
    const lx = -0.9 + Math.sin(rack) * 0.62; lamp.g.position.set(lx, deskY(lx, -1.02), -1.02); lamp.g.rotation.y = -0.6; lamp.g.scale.setScalar(Math.max(0.001, popS(DEV.lamp))); lamp.g.visible = t > DEV.lamp - 0.05; lamp.set(t > DEV.lamp && pu > 0.5 ? 1 : 0);
    laptop.g.visible = t > DEV.laptop - 0.05; laptop.g.scale.setScalar(Math.max(0.001, popS(DEV.laptop))); laptop.g.position.y = DT;
    lapLight.intensity = laptop.g.visible ? (pu < 0.5 ? 0.9 : 0.25) : 0;
    { const lv = 0.004 + 0.012 * u01(t, T.fridge, END); brew.scale.y = lv; brew.position.y = 0.042 + lv / 2; drip.visible = (t * 3) % 1 < 0.7; }
    fridge.position.set(1.4, FY, -1.75); fridge.scale.setScalar(Math.max(0.001, popS(DEV.fridge))); fridge.visible = t > DEV.fridge - 0.05;
    kettle.g.position.set(0.82, DT, -1.52); kettle.g.scale.setScalar(Math.max(0.001, popS(DEV.kettle) * 1.2)); kettle.g.visible = t > DEV.kettle - 0.05; kettle.set(t > DEV.kettle && pu > 0.5 && t < T.half + 0.2);
    strip.g.position.set(...STRIP); strip.g.scale.setScalar(Math.max(0.001, popS(DEV.strip) * 1.3)); strip.g.visible = t > DEV.strip - 0.05; strip.scorch.material.opacity = t > T.strip ? 0.7 : 0;
    cords.forEach((c, i) => c.set(bump(t, DEV.strip + i * 0.06, DEV.strip + 0.32 + i * 0.06)));
    // ---- the circuit: conduit draws on, the panel pops + opens, the breaker flips, the gauge reads 15 then 12.5
    conduit.set(bump(t, CONDUIT[0], CONDUIT[1])); { const gl = t < CONDUIT[0] ? 0 : t < T.circuit ? 1 : Math.max(0, 1 - (t - T.circuit) / 0.6); conduit.m.material.emissive.setHex(0xff4fd8); conduit.m.material.emissiveIntensity = 1.4 * gl; }
    panel.g.visible = t > PANEL - 0.05; panel.g.scale.setScalar(Math.max(0.001, popS(PANEL)));
    panel.door.rotation.y = -1.9 * bump(t, PANEL + 0.25, PANEL + 0.6);
    gauge.g.visible = t > PANEL; gauge.g.scale.setScalar(Math.max(0.001, popS(PANEL + 0.1)));
    const amps = t < FLIP ? 0 : t < T.fifteen ? 4 : t < T.twelve - 0.05 ? 15 : 12.5;
    gauge.needle.rotation.z = PI / 2 - PI * (amps / 20) + wobble(t, T.fifteen, 0.12, 22, 6) + wobble(t, T.twelve, 0.12, 22, 6);
    // ---- the 40 problems drop (the desk stays rigid: the brace; the floor stays flat: the beam)
    stack.g.visible = t > STACK_T - 0.35;
    if (stack.g.visible) { const f = t < STACK_T ? 1.45 * (1 - ((t - (STACK_T - 0.35)) / 0.35) ** 2) : 0, sq = squash(t, STACK_T, 0.2); stack.g.position.set(DX - 0.08, DT + f, DZ + 0.05); stack.g.scale.set(sq[0], sq[1], sq[0]); stack.g.rotation.y = 0.06; }
    // ---- the app (laptop screen): desktop → installing → home → scan → solve → write (pen cursor) → done
    if (laptop.g.visible) {
      const g = screen.canvas.getContext('2d');
      if (t < T.install - 0.1) drawDesktop(g, 0);
      else if (t < T.scribe + 0.2) drawDesktop(g, u01(t, T.install - 0.1, T.scribe + 0.2));
      else if (t < T.photo + 0.4) screen.draw({ mode: 'home', k: 0.03 + 0.5 * u01(t, T.scribe, T.photo) });
      else if (t < T.solves - 0.02) screen.draw({ mode: 'scan', k: u01(t, T.photo + 0.4, T.solves - 0.02) });
      else if (t < T.writes - 0.05) screen.draw({ mode: 'solve', k: u01(t, T.solves, T.forty3 + 0.25) });
      else if (t < T.add + 0.4) { const tip = sheet.draw(writeP(t)); screen.draw({ mode: 'write', k: 0 }); penCursor(g, tipPx(tip), t); screen.tex.needsUpdate = true; }
      else { sheet.draw(PT); screen.draw({ mode: 'done', k: 0.5 }); }
    }
    // ---- the factory: printer + stand, conveyor, robot arm, DONE tray, chute, pages
    const pk = popS(T.printer); printer.g.visible = pStand.visible = t > T.printer - 0.05;
    pStand.position.set(-1.45, FY + 0.18, -0.55); pStand.scale.setScalar(Math.max(0.001, pk)); printer.g.position.set(-1.45, FY + 0.36 * pk, -0.55); printer.g.scale.setScalar(Math.max(0.001, pk));
    printer.led.material.color.setHex(t > PRINT0 && Math.sin(t * 20) > 0 ? 0x58d36b : 0x1f4a24);
    const ck = bump(t, CONV0, CONV0 + 0.55); conv.g.visible = t > CONV0 - 0.05; conv.g.position.set(-1.2 - 2.4 * (1 - ck), FY, -0.55); conv.set(t > CONV0 ? (t - CONV0) * 0.5 : 0);
    const rk = popS(ROBOT0); robot.g.visible = t > ROBOT0 - 0.05; robot.g.position.set(1.32, FY, -0.98); robot.g.scale.setScalar(0.36 * Math.max(0.001, rk));
    if (robot.g.visible) { const ph = t < STAPLE - 0.3 ? 0 : ((t - (STAPLE - 0.3)) / PAGE_DT) % 1, down = t < STAPLE - 0.3 ? 0 : Math.max(0, Math.sin(ph * PI * 2)) ** 3; robot.reach([0.95, FY + 0.42 + 0.18 * (1 - down), -0.55], { lift: 0 }); robot.turret.rotation.y += t < STAPLE - 0.3 ? 0.4 * Math.sin(t * 3) : 0; }
    doneStand.visible = doneTray.visible = donePile.visible = t > CONV0 + 0.2; doneStand.position.set(1.48, FY + 0.17, -0.5); doneTray.position.set(1.48, FY + 0.34, -0.5);
    const nDone = Math.max(0, Math.floor((t - (PRINT0 + 2.4)) / PAGE_DT)); donePile.scale.y = Math.max(0.001, Math.min(0.32, nDone * 0.012 + (t > T.done ? 0.12 * bump(t, T.done - 0.2, T.done + 0.2) : 0))); donePile.position.set(1.48, FY + 0.4 + donePile.scale.y / 2, -0.5); donePile.visible = nDone > 0;
    pages.forEach((p, i) => { p.visible = false; for (let k = i; k < 40; k += pages.length) { const ts = PG(k); if (t < ts || t > ts + 2.6) continue; const a = t - ts; p.visible = true;
      if (a < 0.35) p.position.set(-1.45, FY + 0.48, -0.5 + 0.25 * (a / 0.35));
      else if (a < 0.6) p.position.set(-1.45 + 0.35 * ((a - 0.35) / 0.25), FY + 0.48 - 0.06 * ((a - 0.35) / 0.25), -0.55);
      else if (a < 2.0) p.position.set(-1.1 + (0.95 + 1.1) * ((a - 0.6) / 1.4), FY + 0.42, -0.55);
      else { const b = (a - 2.0) / 0.6; p.position.set(0.95 + 0.53 * b, FY + 0.42 + 0.2 * Math.sin(b * PI), -0.55 + 0.05 * b); }
      p.rotation.set(-PI / 2, 0, 0.05); break; } if (t < PRINT0 || !conv.g.visible) p.visible = p.visible && t > PRINT0 && conv.g.visible; });
    printer.paper.visible = t > PRINT0;
    const chk = bump(t, CHUTE0 - 0.25, CHUTE0 + 0.2); chute.g.visible = t > CHUTE0 - 0.3; chute.g.scale.set(1, Math.max(0.001, chk), 1);
    chute.bags.forEach((b, i) => { const a = t - (LAND(i) - 0.36); b.position.y = -0.12 - (a < 0 ? 0 : Math.min(chute.len, a * a * 12)); b.visible = t > CHUTE0 + 0.1 && b.position.y > -chute.len + 0.06; });
    bowl.visible = t > CHUTE0; bowl.position.set(-0.8, deskY(-0.8, -1.62), -1.62); bowl.scale.setScalar(Math.max(0.001, popS(CHUTE0 + 0.2)));
    chips.forEach((c, i) => (c.visible = t > CRUNCH + i * 0.03));
    clockBox.visible = t > T.unlike - 0.45 && t < T.then1 + 0.2; clockBox.position.set(0.1, deskY(0.1, -1.55), -1.55); clockBox.rotation.y = -0.1; clockBox.scale.setScalar(Math.max(0.001, easeOutBack(u01(t, T.unlike - 0.45, T.unlike - 0.15))));
    // ---- Derek: on the loft's front edge, gaming; coffee on "Derek"; squashed by the sag; ducks the beam; bonks it at the end
    const dX = D.derek[0], dZ = D.derek[1], under = sagAt(sag, dX, dZ);
    let squ = [1, 1], lean = 0.05, eyes = 'open', mouth = 'smile', look = [0, 0.2], brows = 0, armUp = 0, rx = 0, ry = 0;
    if (t > T.on1 - 0.1 && t < T.down1 + 0.6) { eyes = 'wide'; mouth = 'o'; look = [0, 0.9]; brows = 0.6; }
    if (t > T.floor && t < T.load + 0.4) { const k = clamp(under / 0.3); squ = [1 + 0.25 * k, 1 - 0.3 * k]; eyes = 'wide'; mouth = 'scream'; look = [0, 0.8]; brows = 0.8; }
    if (t > T.room - 0.05 && t < T.so2) { eyes = 'spiral'; mouth = 'wavy'; }
    if (t > BEAM_IN[0] && t < BEAM_IN[1] + 0.6) { lean = 0.75 * pulse(t, BEAM_IN[0], 0.2, BEAM_IN[1] - BEAM_IN[0] - 0.1, 0.3); eyes = 'wide'; mouth = 'scream'; look = [0.8, 0.3]; }
    if (t > T.load && t < T.load + 0.5) { const s2 = squash(t, T.load, 0.3); squ = [s2[0], s2[1]]; }
    if (t > T.strip && t < T.circuit + 0.4) { eyes = 'wide'; mouth = 'o'; look = [0, 0.3]; }
    if (t > STACK_T - 0.05 && t < STACK_T + 0.7) { eyes = 'wide'; mouth = 'scream'; look = [0, 0.9]; squ = squash(t, STACK_T, 0.25); }
    if (t > T.derek2 - 0.3 && t < DEREK_BONK) { const k = bump(t, T.derek2 - 0.3, DEREK_BONK); armUp = k; mouth = 'grin'; eyes = 'open'; look = [0, 0.4]; }
    let yUp = 0;
    if (t > T.derek2 - 0.3 && t < DEREK_BONK + 0.2) yUp = 0.14 * Math.sin(PI * u01(t, T.derek2 - 0.3, DEREK_BONK + 0.2));
    if (t >= DEREK_BONK && t < T.he) { eyes = 'spiral'; mouth = 'wavy'; squ = squash(t, DEREK_BONK, 0.35); }
    if (t >= DEREK_UP) { eyes = 'open'; mouth = 'smile'; brows = 0.9; look = [0, 1]; armUp = bump(t, DEREK_UP, DEREK_UP + 0.3); }
    derek.set({ x: dX, y: D.loftTop + 0.08 - 0.42 + yUp, z: dZ, rotY: 0, lean, squash: squ, eyes, mouth, look, brows, rx, rz: ry, t,
      armL: armUp > 0 ? { x: (t >= DEREK_UP ? -1.35 : -2.6) * armUp - 0.6 * (1 - armUp), z: 0.25, el: t >= DEREK_UP ? 0.9 : 0.4 } : { x: -0.75, z: 0.25, el: 1.2 }, armR: armUp > 0 ? { x: (t >= DEREK_UP ? -1.35 : -2.6) * armUp - 0.6 * (1 - armUp), z: 0.25, el: t >= DEREK_UP ? 0.9 : 0.4 } : { x: -0.75, z: 0.25, el: 1.2 },
      legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.5 }, mud: t > T.derek1 ? 0.45 : 0, mudColor: 0x5a3416, head: { x: t > T.on1 - 0.1 && t < T.down1 + 0.6 ? -0.3 : 0 } });
    derek.root.updateMatrixWorld(true);
    { const h1 = derek.hand(-1).getWorldPosition(V()), h2 = derek.hand(1).getWorldPosition(V()); pad.position.copy(h1).add(h2).multiplyScalar(0.5); pad.visible = t < T.derek2 - 0.3; pad.rotation.set(0.3, 0, 0);
      derekSheet.visible = t >= DEREK_UP; if (derekSheet.visible) { derekSheet.position.copy(h1).add(h2).multiplyScalar(0.5).add(V(0, 0.1, 0.06)); derekSheet.rotation.set(0.05, 0, 0); derekSheet.scale.setScalar(easeOutBack(u01(t, DEREK_UP, DEREK_UP + 0.3)) + 1e-3); } }
    dizzy.update(t, t > DEREK_BONK && t < T.he ? 1 : t > T.room && t < T.so2 ? 1 : 0, [dX, 2.45 - (t < T.so2 ? under : 0), dZ]);
    // ---- camera
    const cam = rail.at(t);
    studio.setCamera(cam.pos, cam.look, cam.fov, t, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kick.apply(studio.camera, t, Math.min(d, 6));
    fill.position.copy(studio.camera.position).add(V(0, 0.2, 0)); fill.intensity = Math.min(1.0, 0.07 * Math.pow(Math.max(0.8, d), 1.6)) * (pu < 0.5 ? 0.25 : 1);
    studio.fill.intensity = pu < 0.5 ? 0.08 : 0.3;
    fx.update(t, studio.camera);
    hud.update(t);
  }
  // the laptop's own desktop (before Scribe) + the install dialog
  function drawDesktop(g, k) {
    const w = 1280, h = 800, key = 'desk:' + Math.round(k * 20); if (drawDesktop.key === key) return; drawDesktop.key = key;
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a1440'); gr.addColorStop(1, '#0e0a16'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,79,216,.18)'; g.beginPath(); g.arc(w * 0.72, h * 0.4, 220, 0, 7); g.fill(); g.fillStyle = '#ff4fd8'; g.font = '800 120px Fredoka, Arial'; g.textAlign = 'center'; g.fillText('VEX', w * 0.72, h * 0.46); g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(w / 2 - 300, h - 96, 600, 76, 24); g.fill();
    ['#5ab0ff', '#58d36b', '#ffd23f', '#ff4d5e', '#b36bff'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.roundRect(w / 2 - 270 + i * 112, h - 86, 56, 56, 14); g.fill(); });
    if (k > 0) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.beginPath(); g.roundRect(w / 2 - 330, 200, 660, 360, 28); g.fill(); g.drawImage(icon, w / 2 - 60, 230, 120, 120); g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.textAlign = 'center'; g.fillText(k < 1 ? 'Installing Scribe…' : 'Scribe installed', w / 2, 410); g.textAlign = 'left';
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(w / 2 - 240, 460, 480, 22, 11); g.fill(); g.fillStyle = '#9a1c25'; g.beginPath(); g.roundRect(w / 2 - 240, 460, 480 * k, 22, 11); g.fill(); }
    screen.tex.needsUpdate = true;
  }
  // the app's own pen cursor at the writing tip (the handwriting is generated ON SCREEN, user rule Nov 9)
  function penCursor(g, [x, y], t) {
    g.save(); g.translate(x, y); g.rotate(-0.7 + 0.04 * Math.sin(t * 30));
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(8, 10, 9, 22, 0.2, 0, 7); g.fill();
    g.fillStyle = '#1d1d22'; g.beginPath(); g.roundRect(-7, -88, 14, 64, 6); g.fill(); g.fillStyle = '#9a1c25'; g.fillRect(-7, -60, 14, 8);
    g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(-7, -24); g.lineTo(7, -24); g.lineTo(0, 0); g.closePath(); g.fill();
    g.restore();
  }

  // ---------------------------------------------------------------- QC (`node tools/render.mjs 073-… --qc`)
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(), CS = [];
    const faces = [['Vex', () => VEX.bpos('head').add(V(0, 0.06, 0.05)), () => true], ['Derek', () => derek.head.getWorldPosition(V()), () => true]];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      const c = rail.at(tt); CS.push([+tt.toFixed(2), ...c.pos.map((x) => +x.toFixed(2)), ...c.look.map((x) => +x.toFixed(2)), +c.fov.toFixed(1), 0]);
      if (Math.round(tt * 10) % 2) continue;
      for (const [who, fp] of faces) {
        v.copy(fp()).project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const cc of story.callouts) if (tt >= cc.t0 && tt <= cc.t1) { const x = cc.style === 'sfx' ? cc.pos[0] : cc.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([cc.style + ' ' + cc.text, cc.style === 'sfx' ? cc.pos[1] : cc.y ?? BAND_Y[cc.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`counts: framings ${Fr.length}, kicks ${KICKS.length} (${KICKS.filter((k) => k[1] >= 0.8).length} full-strength), fx bursts ${FXN.burst} + streams ${FXN.stream}, callouts ${story.callouts.length}`);
    out.push('events: ' + JSON.stringify({ fx: FXN.times.map((x) => +x.toFixed(2)), kicks: KICKS.map((k) => +k[0].toFixed(2)), frames: Fr.map((f) => +f.t.toFixed(2)) }));
    out.push('cams: ' + JSON.stringify(CS));
    out.push('mids: ' + Fr.map((f, i) => ((f.t + (Fr[i + 1]?.t ?? END)) / 2).toFixed(2)).join(','));
    update(0); return out;
  };
  update(0);
  return { update };
}
