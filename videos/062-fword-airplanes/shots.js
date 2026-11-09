// 062 — Scribe promo: "How fucking airplanes fucking fly", the f-word explainer series #2 (058 is #1; user, Nov 9: "we need more
// fucking ones like that, even if it's like unrelated scenes that go to Scribe"). A deadpan narrator explains flight with "fucking"
// between the words, one toon gag per line, each in its own place: the planespotter under a landing jet (hook), the security line
// (shoes, belt, pants… still beeps), the engine at the gate (a ramp agent's cap goes through the cutaway turbofan and comes out of
// the back on fire), the wing on the takeoff roll (air arrows bent DOWN off the trailing edge), liftoff under a giant LIFT arrow, the
// cockpit in the clouds (throttle doubled → the plane rockets up: lift ∝ speed²), turbulence in the cabin (the plane's fine, your
// coffee isn't), one pretzel, the landing — and the one guy who claps is your physics teacher (pivot at ~55 %): ten lift problems,
// handwritten. Scribe clears it for real: one photo of the sheet → solved (PHYSICS) → the pen DRAWS the free-body diagram (lift,
// weight, thrust, drag as labelled arrows, each on its spoken word) next to the working, in your handwriting (Scribe's demo glyphs,
// videos/049-scribe-promo/hand.json) → you fold it into a paper plane, it flies (same physics), lands on the teacher, he claps. End card.
// Physics (kept simple + correct): a wing deflects air DOWN, the air pushes the wing UP (Newton's third law) = lift; L = ½ρv²SC_L, so at
// the same angle twice the speed gives four times the lift; a jet engine compresses air, burns fuel in it and blasts it out the back
// (thrust); level flight = lift balances weight and thrust balances drag (ΣF = 0); turbulence = irregular air motion the airframe is
// built for. Worksheet numbers: 70,000 kg × 9.8 m/s² = 686,000 N; 600 kN × (140/70)² = 2,400 kN.
// Product facts (Scribe repo README + tryscribe.ink, Nov 2026): photo/PDF upload → worked solutions (maths, physics, chemistry,
// biology, economics, with the diagrams they need, free-body diagrams included) written in your own handwriting stroke by stroke → PDF.
// Look: 058's toon look (engine/build cast, word-keyed gags, impact kicks, 60 fps + blur), hard cuts between framings; the f-word is
// F*CKING on screen in its own colour (script.json swap/wordColor). Sets: engine/build/airport.js (new) + jet.js's airliner + turbofan +
// plane.js's cabin.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, smooth, mk } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeArrows } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeSpecs, makeCrowd, cardTex } from '@engine/build/brprops.js';
import { makeLaptop, makePen } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { makeAirliner, makeEngine, P as AP } from '@engine/build/jet.js';
import { buildPlane, seatPos } from '@engine/sets/plane.js';
import { buildAirfield, buildSecurity, makeCockpit, relivery, makePretzel, makePretzelBag, makeCup, makePaperPlane, makeWand, makeSuitcase, makeBoxers, AD } from '@engine/build/airport.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"', '30px Georgia'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer); const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = envTex;
  renderer.localClippingEnabled = true;

  // ---------------------------------------------------------------- word times
  const t = {
    f1: W('hook', 'fucking', 1), airplanes: W('hook', 'airplanes'), fly: W('hook', 'fly'),
    sec: W('security', 'the'), airport: W('security', 'airport'), shoes: W('security', 'shoes'), off1: W('security', 'off', 1), belt: W('security', 'belt'), off2: W('security', 'off', 2), pants: W('security', 'pants'), down: W('security', 'down'), still: W('security', 'still'), beeps: W('security', 'beeps'),
    eng: W('engines', 'the'), engines: W('engines', 'engines'), suck: W('engines', 'suck'), air1: W('engines', 'air'), set: W('engines', 'set'), fire: W('engines', 'fire'), and: W('engines', 'and'), throw: W('engines', 'throw'), back: W('engines', 'back'),
    this: W('wing', 'this'), wing: W('wing', 'wing'), it1: W('wing', 'it'), shoves1: W('wing', 'shoves'), air2: W('wing', 'air'), down2: W('wing', 'down'),
    lift0: W('lift', 'the'), shoves2: W('lift', 'shoves'), plane1: W('lift', 'plane'), up: W('lift', 'up'), thats: W('lift', 'thats'), lift1: W('lift', 'lift'),
    twice: W('speed', 'twice'), speed: W('speed', 'speed'), four: W('speed', 'four'), lift2: W('speed', 'lift'),
    turb: W('turb', 'turbulence'), bumpy: W('turb', 'bumpy'), the2: W('turb', 'the'), planes: W('turb', 'planes'), fine: W('turb', 'fine'), your1: W('turb', 'your'), coffee: W('turb', 'coffee'), isnt: W('turb', 'isnt'),
    your2: W('snack', 'your'), snack: W('snack', 'snack'), one1: W('snack', 'one'), pretzel: W('snack', 'pretzel'),
    it2: W('land', 'it'), lands: W('land', 'lands'), one2: W('land', 'one'), guy1: W('land', 'guy'), claps1: W('land', 'claps'),
    its: W('teacher', 'its'), physics: W('teacher', 'physics'), teacher: W('teacher', 'teacher'), ten: W('teacher', 'ten'), problems: W('teacher', 'problems'), handwritten: W('teacher', 'handwritten'),
    youre: W('cooked', 'youre'), cooked: W('cooked', 'cooked'),
    so: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), one3: W('scribe', 'one'), photo: W('scribe', 'photo'), it3: W('scribe', 'it'), solves: W('scribe', 'solves'), ten2: W('scribe', 'ten'),
    it4: W('hand', 'it'), draws: W('hand', 'draws'), diagram: W('hand', 'diagram'), hl: W('hand', 'lift'), hw: W('hand', 'weight'), ht: W('hand', 'thrust'), hd: W('hand', 'drag'), in: W('hand', 'in'), handwriting: W('hand', 'handwriting'),
    you: W('fold', 'you'), fold: W('fold', 'fold'), plane2: W('fold', 'plane'), it5: W('fold', 'it', 2), flies: W('fold', 'flies'), one4: W('fold', 'one'), guy2: W('fold', 'guy'), claps2: W('fold', 'claps'),
  };
  const ENDCARD = t.claps2 + 0.55;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the worksheet (physics: lift problems) + the app
  const sheet = makeSheet(G, { seed: 62, name: 'Alex', title: 'PHYSICS · LIFT PROBLEMS', note: 'Due Monday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 3', problems: [
    { q: '1.  Draw the free-body diagram of a plane in level flight.', a: 'Level flight:\nL = W\nT = D', fbd: { x: 690, dy: 205, len: 112 }, rows: 2 },
    { q: '2.  L = ½ρv²SC_L. 600 kN of lift at 70 m/s. Lift at 140 m/s?', a: 'v x2 → L x4 = 2400 kN' },
    { q: '3.  Level flight, m = 70,000 kg. Find the lift. (g = 9.8 m/s²)', a: 'L = W = mg = 686,000 N' },
    { q: '4.  Thrust = drag = 240 kN. Find the acceleration.', a: 'ΣF = 0 → a = 0' },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex', n: 10, subject: 'Physics' });
  const items = sheet.items, N = sheet.total;
  const cumAt = (pred) => { let a = 0, last = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; if (pred(it)) last = a; } return last; };
  const C_BODY = cumAt((it) => it.tag === 'body'), C_LIFT = cumAt((it) => it.tag === 'lift'), C_WEIGHT = cumAt((it) => it.tag === 'weight'), C_THRUST = cumAt((it) => it.tag === 'thrust'), C_DRAG = cumAt((it) => it.tag === 'drag');

  // ---------------------------------------------------------------- sets: the airfield (origin), the security checkpoint + the cabin (parked far away)
  const AF = await buildAirfield(studio);
  const SEC = buildSecurity(studio), SO = [-7000, 0, 0]; SEC.root.position.set(...SO);
  const CAB = buildPlane(studio), CO = [-7000, 0, 3000]; CAB.root.position.set(...CO);
  const S = (x, y, z) => [SO[0] + x, SO[1] + y, SO[2] + z], C = (x, y, z) => [CO[0] + x, CO[1] + y, CO[2] + z];
  const seatW = (row, col, y = 0.1) => { const p = seatPos(row, col); return C(p.x, y, p.z + 0.02); };
  // trays (hinged down from the seat backs of row 1): the hero's (col 3) + the empty middle seat's (col 4) for the laptop
  const trayM = std(0x9aa2ab, 0.5), TRAY = (col) => C(seatPos(1, col).x, 0.71, -1.31);
  const trays = [3, 4].map((col) => { const g = new THREE.Group(); scene.add(g); g.position.set(...TRAY(col)); mk(new THREE.BoxGeometry(0.44, 0.025, 0.36), trayM, g).castShadow = true; mk(new THREE.BoxGeometry(0.04, 0.02, 0.3), std(0x6b737b, 0.4), g, -0.21, -0.02, 0.05); mk(new THREE.BoxGeometry(0.04, 0.02, 0.3), std(0x6b737b, 0.4), g, 0.21, -0.02, 0.05); return g; });
  const TY = 0.71 + 0.0125;   // tray top

  // ---------------------------------------------------------------- the airliner (PRETZEL AIR) + its right engine (jet.js turbofan, cut open for the engine beat) + a second one parked
  const air = await makeAirliner(); scene.add(air.g); relivery(air, 'PRETZEL AIR');
  const eng = makeEngine(); air.engineMount.add(eng.g);
  const ck = makeCockpit(); air.body.add(ck.g); ck.g.position.set(15.9, 5.0, 0);
  const airParts = air.body.children.filter((c) => c !== ck.g);
  const air2 = await makeAirliner(); scene.add(air2.g); relivery(air2, 'PRETZEL AIR');
  { const ne = air2.farEng.clone(); ne.position.set(AP.engine[0], AP.engine[1], AP.engine[2]); air2.body.add(ne); air2.set({ x: AD.gate[0] - 150, y: -0.55, z: AD.gate[2] }); }
  AF.root.add(air2.g);
  const engState = (tt, o = {}) => ({ t: tt, spin: tt * 40, fanSpin: tt * 22, dryer: 0, boxFan: 0, duct: 4, stages: 6, shaftA: 1, shaft: 1, comb: 1, flame: 1, turbCase: 1, turbDisc: 1, turbBlades: 14, petals: 10, nacelle: 6, fanHub: 1, fan: 16, cowl: 1, ogv: 24, swirl: 1, pylon: 1, ...o });
  // the big LIFT arrow under the right wing (body frame) + the flow arrows past the wingtip (the textbook picture: the air bent DOWN)
  const liftArrow = new THREE.Group(); air.body.add(liftArrow); liftArrow.position.set(-6.2, -3.4, 11);
  { const m = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb300, emissiveIntensity: 0.6, roughness: 0.4 });
    mk(new THREE.CylinderGeometry(1.0, 1.0, 4.6, 24), m, liftArrow, 0, 2.3, 0); mk(new THREE.ConeGeometry(2.2, 2.4, 28), m, liftArrow, 0, 5.8, 0); liftArrow.traverse((o) => { if (o.isMesh) o.castShadow = false; }); }
  const TIP = { le: -10.7, te: -13.0, y: 7.55, z: 27.9 };
  const airDown = new THREE.Group(); air.body.add(airDown);   // the air the wing shoves DOWN: blue arrows under the trailing edge, sliding down
  for (const [x, z, y] of [[-8.0, 8.5, 4.6], [-9.6, 13.5, 5.1], [-11.2, 18.5, 5.6], [-12.6, 23, 6.1]]) for (let k = 0; k < 3; k++) {
    const a = new THREE.Group(); airDown.add(a); a.position.set(x - k * 0.15, y, z); a.userData.y0 = y; const m = () => new THREE.MeshStandardMaterial({ color: 0x7fd0ff, emissive: 0x3aa0ff, emissiveIntensity: 0.6, roughness: 0.4, transparent: true, opacity: 0.9, depthWrite: false });
    mk(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 14), m(), a, 0, -0.7, 0); mk(new THREE.ConeGeometry(0.62, 0.9, 18), m(), a, 0, -1.85, 0).rotation.x = PI; a.traverse((o) => { if (o.isMesh) o.castShadow = false; }); }
  airDown.children.forEach((a, i) => { a.userData.y0 -= (i % 3) * 1.2; });   // the right wingtip airfoil (body frame): LE/TE x, mid height, just outside the tip
  const flowPaths = [
    [[8, 9.2], [-3, 9.1], [-9, 8.8], [-13.5, 7.6], [-17.5, 5.0], [-20.5, 2.2]],
    [[8, 10.9], [-4, 10.8], [-11, 10.3], [-16, 8.6], [-20, 5.8], [-23.5, 3.0]],
    [[8, 4.4], [-3, 4.45], [-10, 4.9], [-14, 4.1], [-17, 2.4], [-19, 0.9]],
    [[8, 12.6], [-6, 12.5], [-13, 11.8], [-18, 10.0], [-22.5, 7.0], [-26, 4.2]],
  ].map((P, i) => makeArrows(air.body, P.map(([x, y]) => [x, y, TIP.z + 1.2 + 0.3 * i]), { color: i === 2 ? 0x7fd8ff : 0xbfeaff, count: 6, size: 0.95, speed: 15, emissive: 0.9 }));
  const intakeArrows = makeArrows(eng.g, [[7.5, 0.9, -0.2], [5.8, 0.8, -0.2], [4.2, 0.7, -0.2], [3.0, 0.5, -0.2], [2.2, 0.3, -0.2]], { color: 0x9fe8ff, count: 8, size: 0.32, speed: 4.5 });
  const intakeArrows2 = makeArrows(eng.g, [[7.5, -0.9, -0.2], [5.8, -0.8, -0.2], [4.2, -0.6, -0.2], [3.0, -0.4, -0.2], [2.2, -0.25, -0.2]], { color: 0x9fe8ff, count: 8, size: 0.32, speed: 4.5 });
  const coreArrows = makeArrows(eng.g, [[2.6, 0.26, -0.12], [1.6, 0.25, -0.12], [0.6, 0.22, -0.12], [-0.3, 0.22, -0.12], [-1.4, 0.16, -0.12], [-3.4, 0.1, -0.12]], { color: 0xffd23f, count: 9, size: 0.18, speed: 3.6 });
  const exhaustArrows = makeArrows(eng.g, [[-1.0, 0.0, -0.3], [-3.0, 0.0, -0.3], [-6.0, 0.05, -0.3], [-9.0, 0.1, -0.3]], { color: 0xffa040, count: 8, size: 0.45, speed: 8 });

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const hero = mk1({ shirt: 0xf2a33a, pants: 0x34507a, hair: 0x3a2516, hairStyle: 'messy', skin: 0xe8b48a });
  const heroBelt = new THREE.Group(); hero.armL.g.parent.add(heroBelt); heroBelt.position.y = 0.03;
  { const b = mk(new THREE.TorusGeometry(0.168, 0.022, 8, 28), std(0x5a3216, 0.5), heroBelt); b.rotation.x = PI / 2; b.scale.set(1, 0.86, 1); mk(new THREE.BoxGeometry(0.07, 0.05, 0.02), std(0xd8c070, 0.3, { metalness: 0.7 }), heroBelt, 0, 0, 0.152); }
  const boxers = makeBoxers(hero);
  // the coffee splash: brown splats + drips on the FRONT of the face (a partial sphere shell; eyes + mouth stay clear)
  const coffeeMask = new THREE.Mesh(new THREE.SphereGeometry(0.279, 32, 20, PI / 2 - 0.95, 1.9, 0.5, 1.85), new THREE.MeshStandardMaterial({ roughness: 0.15, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, map: tex(512, 384, (c, w, h) => {
    c.clearRect(0, 0, w, h); const col = 'rgba(92,50,20,.94)'; c.fillStyle = col;
    const blot = (x, y, r) => { c.beginPath(); for (let i = 0; i <= 14; i++) { const a = (i / 14) * TAU, rr = r * (0.78 + 0.3 * Math.sin(i * 2.7 + x)); i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); };
    const drip = (x, y, len, wd) => { c.fillRect(x - wd / 2, y, wd, len); c.beginPath(); c.arc(x, y + len, wd * 0.8, 0, TAU); c.fill(); };
    blot(256, 62, 96); blot(150, 100, 58); blot(360, 92, 62); blot(220, 150, 40); blot(300, 150, 36);   // forehead
    blot(112, 228, 62); blot(398, 220, 64); blot(256, 205, 26);   // cheeks + nose
    drip(150, 260, 70, 14); drip(405, 262, 88, 16); drip(222, 165, 40, 10); drip(330, 170, 34, 9); drip(256, 220, 36, 9); drip(360, 120, 30, 8);
    blot(318, 352, 16); blot(194, 346, 12);   // chin drops
  }) }));
  coffeeMask.renderOrder = 3; coffeeMask.castShadow = false; hero.head.add(coffeeMask); coffeeMask.visible = false;
  const teacher = mk1({ shirt: 0x4f7a9a, pants: 0x4a4038, hair: 0x6a6258, hairStyle: 'side', mustache: true, skin: 0xf2c29a });
  { const sp = makeSpecs(); teacher.head.add(sp); sp.position.set(0, 0.05, 0.262); const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), std(0xc1121f, 0.5)); bow.position.set(0, 0.36, 0.13); teacher.armL.g.parent.add(bow);
    const pk = mk(new THREE.BoxGeometry(0.07, 0.08, 0.01), std(0xffffff, 0.6), teacher.armL.g.parent, -0.08, 0.24, 0.142); pk.castShadow = false; for (const [x, c] of [[-0.1, 0x2f6fd1], [-0.08, 0xd62f2f], [-0.06, 0x1d1d1d]]) mk(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6), std(c, 0.4), teacher.armL.g.parent, x, 0.28, 0.146); }
  const pilot = mk1({ shirt: 0xf4f4f2, pants: 0x1d2a4a, hair: 0x5a3216, hairStyle: 'side', mustache: true, skin: 0xd99b6c, hat: 'cap', hatColor: 0x1d2a4a });
  const copilot = mk1({ shirt: 0xf4f4f2, pants: 0x1d2a4a, hair: 0xd8a55a, hairStyle: 'tuft', skin: 0xf6d2b0, hat: 'cap', hatColor: 0x1d2a4a });
  for (const p of [pilot, copilot]) { const badge = mk(new THREE.BoxGeometry(0.08, 0.04, 0.01), std(0xe0b04a, 0.3, { metalness: 0.7 }), p.hat, 0, 0.12, 0.25); badge.rotation.x = -0.5; const tie = mk(new THREE.BoxGeometry(0.05, 0.2, 0.01), std(0x1d2a4a, 0.5), p.armL.g.parent, 0, 0.24, 0.145); void tie; }
  const flyingCap = pilot.hat.clone(); scene.add(flyingCap);
  const attendant = mk1({ shirt: 0xd2452c, pants: 0x1d2a4a, hair: 0x2b1d14, hairStyle: 'side', skin: 0xc68863 });
  { mk(new THREE.SphereGeometry(0.11, 14, 10), attendant.M.hair, attendant.head, 0, 0.18, -0.2); const sc = mk(new THREE.ConeGeometry(0.07, 0.1, 3), std(0xffc21a, 0.5), attendant.armL.g.parent, 0, 0.38, 0.13); sc.rotation.x = PI; }
  const officer = mk1({ shirt: 0x2f3e5a, pants: 0x24324a, hair: 0x1a1a1a, hairStyle: 'side', mustache: true, skin: 0x9c6644, hat: 'cap', hatColor: 0x24324a });
  { const bd = mk(new THREE.BoxGeometry(0.06, 0.07, 0.01), std(0xe0b04a, 0.3, { metalness: 0.7 }), officer.armL.g.parent, -0.08, 0.27, 0.145); void bd; }
  const wand = makeWand(); officer.hand(1).add(wand.g); wand.g.position.set(0, -0.05, 0.05); wand.g.rotation.x = -1.3;
  const crew = mk1({ shirt: 0xff8a1a, pants: 0x2f3e5a, hair: 0x6b3f22, hairStyle: 'tuft', skin: 0xe0a97e, hat: 'cap', hatColor: 0x2f6fd1 });
  { const band = mk(new THREE.TorusGeometry(0.29, 0.02, 6, 20, PI), std(0x2a2d31, 0.5), crew.head, 0, 0.02, 0); band.rotation.z = 0; for (const s of [-1, 1]) { const cup = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), std(0xffd23f, 0.5), crew.head, s * 0.29, 0, 0); cup.rotation.z = PI / 2; }
    for (const s of [-1, 1]) { const st = mk(new THREE.BoxGeometry(0.34, 0.035, 0.01), std(0xfff27a, 0.4, { emissive: 0xfff27a, emissiveIntensity: 0.25 }), crew.armL.g.parent, 0, 0.12 + (s > 0 ? 0.1 : 0), 0.146); void st; }
    for (const side of [-1, 1]) { const w = new THREE.Group(); crew.hand(side).add(w); w.position.set(0, -0.06, 0.04); w.rotation.x = -1.0; mk(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 10), new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 0.5 }), w, 0, 0.19, 0); mk(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 10), std(0x1b1b1d), w, 0, -0.02, 0); } }
  const crewCap = crew.hat.clone(); scene.add(crewCap);
  const capFire = new THREE.Group(); scene.add(capFire);   // the burning cap's flames (camera-facing, additive; follows the cap in world space)
  const PAX = [
    { shirt: 0xe2574c, pants: 0x34495e, hair: 0x1a1a1a, hairStyle: 'side', skin: 0x9c6644 },
    { shirt: 0xf2d232, pants: 0x4a3a2a, hair: 0xc8873a, hairStyle: 'tuft', skin: 0xf6d2b0, hat: 'cap', hatColor: 0x2f6fd1 },
    { shirt: 0x8e5bd0, pants: 0x2f3e5a, hair: 0x5a3216, hairStyle: 'side', skin: 0xd99b6c },
    { shirt: 0x3fb0c9, pants: 0x3d3d3d, hair: 0xe0c070, hairStyle: 'messy', skin: 0xf2c29a },
    { shirt: 0x2f8f4e, pants: 0x3d4250, hair: 0x6b3f22, hairStyle: 'tuft', skin: 0x7a4a2e },
    { shirt: 0xd96aa0, pants: 0x2f3e5a, hair: 0x2b1d14, hairStyle: 'side', skin: 0xe0a97e },
  ].map(mk1);
  { const s = makeSpecs(); PAX[2].head.add(s); s.position.set(0, 0.05, 0.262); mk(new THREE.SphereGeometry(0.11, 14, 10), PAX[2].M.hair, PAX[2].head, 0, 0.2, -0.2); mk(new THREE.SphereGeometry(0.1, 12, 10), PAX[5].M.hair, PAX[5].head, 0, 0.16, -0.22); }
  const crowd = makeCrowd(scene, 24, { seed: 62, shirt: 0x5b7fb5 }), crowd2 = makeCrowd(scene, 24, { seed: 63, shirt: 0xc9774a });
  const people = [hero, teacher, pilot, copilot, attendant, officer, crew, ...PAX];
  const eyeLids = (toon) => toon.head.children.filter((c) => c.isGroup && c.children.length === 4).map((g) => g.children[2]);
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const handW = (toon, s) => { toon.root.updateMatrixWorld(true); return toon.hand(s).getWorldPosition(V(0, 0, 0)).toArray(); };
  void eyeLids;

  // ---------------------------------------------------------------- props
  const paperM = std(0xf6f3ea, 0.9);
  const binOf = SEC.bins[0];   // the hero's bin at the loading end of the belt
  const shoesFly = [0, 1].map(() => { const s = mk(new THREE.BoxGeometry(0.13, 0.085, 0.215), hero.M.shoes.clone(), scene); s.castShadow = true; return s; });
  const beltFly = mk(new THREE.BoxGeometry(0.72, 0.04, 0.012), std(0x5a3216, 0.5), scene); beltFly.castShadow = true;
  const suitcases = [0x2f6fd1, 0xd62f2f, 0x2f8f4e, 0x6a3fa0, 0xe8833a].map((c) => { const s = makeSuitcase(c); scene.add(s); return s; });
  // the cabin: coffee cup, the pretzel bag + THE pretzel, a PHYSICS book for the teacher, the stack of ten problems, the stamp, the laptop, the pen, the phone insert, the paper plane
  const cup = makeCup(); scene.add(cup.g);
  const blob = mk(new THREE.SphereGeometry(0.05, 16, 12), std(0x5a3416, 0.15), scene); blob.castShadow = false;
  const bag = makePretzelBag(); scene.add(bag.g); bag.g.scale.setScalar(1.5);
  const pretzel = makePretzel(1.6); scene.add(pretzel);
  const book = new THREE.Group(); scene.add(book);
  { const bt = tex(256, 320, (c, w, h) => { c.fillStyle = '#1f5fbf'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.font = '48px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.fillText('PHYSICS', w / 2, 110); c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(60, 230); c.lineTo(196, 230); c.moveTo(128, 170); c.lineTo(128, 290); c.stroke(); c.fillStyle = '#fff'; c.font = '600 22px Inter'; c.fillText('L = ½ρv²SC', w / 2, 158); });
    mk(new THREE.BoxGeometry(0.2, 0.26, 0.035), [std(0x1f5fbf), std(0x1f5fbf), std(0xf6f3ea), std(0xf6f3ea), std(0xffffff, 0.6, { map: bt }), std(0x1f5fbf)], book).castShadow = true; }
  const stack = new THREE.Group(); scene.add(stack);
  { mk(new THREE.BoxGeometry(0.31, 0.05, 0.4), paperM, stack, 0, 0.025, 0); const top = mk(new THREE.PlaneGeometry(0.311, 0.4026), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), stack, 0, 0.0505, 0); top.rotation.x = -PI / 2; top.castShadow = false; }
  const imprint = mk(new THREE.PlaneGeometry(0.29, 0.094), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), stack, 0, 0.052, 0.12);
  imprint.rotation.set(-PI / 2, 0, 0.2);
  const stamper = new THREE.Group(); teacher.hand(1).add(stamper); stamper.position.set(0, -0.08, 0.02);
  { mk(new THREE.SphereGeometry(0.04, 12, 8), std(0x5a3a22, 0.5), stamper, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), std(0x5a3a22, 0.5), stamper, 0, -0.01, 0); mk(new THREE.BoxGeometry(0.12, 0.04, 0.08), std(0xc1121f, 0.5), stamper, 0, -0.07, 0); }
  const laptop = makeLaptop(screen.tex, icon); scene.add(laptop.g); laptop.g.scale.setScalar(0.62);
  const pen = makePen(); scene.add(pen.g); pen.g.scale.setScalar(0.55);
  const shotHand = new THREE.Group(); scene.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.28, 4, 10), hero.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.22); shotHand.add(sleeve); shotHand.add(new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 10), hero.M.skin)); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.09); camPhone.rotation.x = 0.55;
  { mk(new THREE.BoxGeometry(0.11, 0.014, 0.21), std(0x15161a, 0.3), camPhone); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.098, 0.126), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0075, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.098, 0.026), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0076, 0.085); camPhone.add(ui); }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.7); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  const paperPlane = makePaperPlane(sheet.tex); scene.add(paperPlane); paperPlane.scale.setScalar(1.6);
  const aPlus = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.09), new THREE.MeshBasicMaterial({ map: cardTex('A+', { bg: 'rgba(0,0,0,0)', fg: '#d0141e', w: 256, h: 190, px: 170 }), transparent: true, depthWrite: false })); paperPlane.add(aPlus); aPlus.position.set(-0.03, 0.02, 0); aPlus.rotation.x = -PI / 2;
  [0xffd23f, 0xff8a1a, 0xff4a1a].forEach((c) => capFire.add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))));
  const flatSheet = mk(new THREE.PlaneGeometry(0.311, 0.4026), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85, side: THREE.DoubleSide }), scene); flatSheet.castShadow = true;

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 400, confetti: 400, spark: 300, glow: 60, smoke: 500, drops: 300, crumb: 120 }, nearFade: [0.3, 1.1] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.1, 0.18);   // the rhythm: every F*CKING lands with a tiny jolt
  // hook: the jet roars over the planespotter
  const TOVER = t.fly + 0.06;
  kick(TOVER, 1.0, 0.7); kick(TOVER + 0.25, 0.5);
  fx.burst('dust', TOVER + 0.05, { pos: add(AD.spot, [0, 0.3, 0]), n: 14, spread: 3, speed: [1.5, 4], size: [0.4, 0.9], color: 0xd8d0b8 });
  fx.burst('confetti', TOVER + 0.05, { pos: add(AD.spot, [0.5, 1.2, 0]), n: 30, color: 0x7ab84a, speed: [2, 5], spread: 2.5, floor: 0 });   // grass + leaves
  // security
  const SHOE = [t.shoes + 0.2, t.shoes + 0.5], BELTF = t.belt + 0.08, DROP = t.down - 0.12, WALK0 = t.still - 0.35, BEEP = t.beeps - 0.02;
  SHOE.forEach((s) => kick(s + 0.42, 0.3)); kick(BELTF + 0.38, 0.35); kick(DROP + 0.12, 0.7); kick(BEEP, 0.8); kick(BEEP + 0.3, 0.4);
  // engines
  const CAP0 = t.suck - 0.05, CAPIN = t.air1 + 0.12, CAPFIRE = t.fire - 0.02, CAPOUT = t.back + 0.02;
  kick(CAPIN, 0.4); kick(CAPFIRE, 0.8); kick(CAPOUT, 1.0); kick(CAPOUT + 0.35, 0.4);
  // takeoff + lift
  kick(t.up, 0.9, 0.6); kick(t.lift1, 0.5);
  // speed
  kick(t.twice + 0.12, 0.5); kick(t.four + 0.05, 1.0, 0.7); kick(t.lift2, 0.6);
  // turbulence + coffee
  const SPLASH = t.isnt - 0.02;
  kick(SPLASH, 0.9); kick(t.bumpy, 0.4);
  // snack
  const BAGOPEN = t.one1 - 0.15, PRETZ = t.pretzel - 0.08;
  kick(BAGOPEN + 0.1, 0.3); kick(PRETZ + 0.25, 0.4);
  // landing + clap
  kick(t.lands, 1.0, 0.6); kick(t.claps1, 0.4);
  // teacher
  const STACKDROP = t.problems - 0.05, STAMP = t.handwritten + 0.05;
  kick(STACKDROP, 1.0); kick(STAMP, 0.9);
  fx.burst('confetti', STACKDROP, { pos: add(TRAY(3), [0, 0.1, 0]), n: 30, color: 0xffffff, speed: [0.8, 2], spread: 1.2, floor: 0.7 });
  fx.burst('spark', STAMP, { pos: add(TRAY(3), [0, 0.08, 0.05]), n: 16, color: 0xff6b6b, speed: [0.6, 1.6], spread: 1.4 });
  // cooked + Scribe
  const LIDO0 = t.open - 0.05, LIDO1 = t.open + 0.3, FLASH = t.photo + 0.05, SCAN0 = FLASH + 0.15, SOLVE0 = t.it3 + 0.05, SOLVE1 = t.ten2 + 0.22;
  const PEN0 = t.it4 + 0.02, WRITE0 = t.draws + 0.05, WRITE1 = t.fold - 0.25;
  kick(t.cooked, 0.7); kick(LIDO1, 0.3); kick(FLASH, 0.35); kick(SOLVE1, 0.4);
  for (const w of [t.hl, t.hw, t.ht, t.hd]) kick(w + 0.25, 0.3);
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.05, { pos: add(seatW(2, 3), [0, 1.55, 0]), rate: 16, size: [0.1, 0.22], speed: [0.3, 0.8], spread: 0.35, life: [0.6, 1.0], g: -1.5, color: 0xdddddd });
  const PK = [[WRITE0, 0], [t.diagram + 0.3, C_BODY], [t.hl - 0.06, C_BODY], [t.hw - 0.06, C_LIFT], [t.ht - 0.04, C_WEIGHT], [t.hd - 0.06, C_THRUST], [t.hd + 0.3, C_DRAG], [WRITE1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  // fold + fly + clap
  const FOLD0 = t.fold - 0.05, FOLD1 = t.plane2 + 0.05, LAUNCH = t.it5 - 0.05, CATCH = t.one4 + 0.05;
  kick(FOLD1, 0.5); kick(CATCH, 0.6); kick(t.claps2, 0.5);
  fx.burst('spark', FOLD1 - 0.05, { pos: add(TRAY(3), [0, 0.2, 0]), n: 26, color: 0xffe08a, speed: [0.5, 1.5], spread: 1.6 });

  // ---------------------------------------------------------------- the end card (Scribe) via the 049 HUD (only its end card is used)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: [[0, 0]], day: [[0, '']], feed: [], map: { shoreR: () => 1, spots: [], dots: () => [] },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- the airliner's path per shot
  const XT0 = 250, VT0 = 40, AT = 3;   // takeoff roll from the wing beat on
  const takeoffX = (tt) => { const d = tt - t.this; return XT0 + VT0 * d + 0.5 * AT * d * d; };
  const takeoffY = (tt) => { const a = Math.max(0, tt - t.up); return -0.55 + (a < 1 ? 7 * a * a : 7 + 14 * (a - 1)); };
  const CRUISE_Y = AD.cloudY + 90;
  function airAt(tt, id) {
    if (id === 'hook') { const x = AD.spot[0] + 72 * (tt - TOVER); return { x, y: -0.55 + Math.max(0, 210 - x) * 0.026, z: 0, pitch: 0.05, gear: 1 }; }
    if (id.startsWith('eng')) return { x: AD.gate[0], y: -0.55, z: AD.gate[2], pitch: 0, gear: 1 };
    if (id.startsWith('wing') || id.startsWith('lift')) return { x: takeoffX(tt), y: takeoffY(tt), z: 0, pitch: 0.17 * smooth(u01(tt, t.up - 0.45, t.up + 0.35)), gear: 1 - smooth(u01(tt, t.up + 0.9, t.up + 1.6)) };
    if (id.startsWith('ck')) { const a = Math.max(0, tt - t.four - 0.05); return { x: 1800 + 120 * (tt - t.twice) + 140 * a * a, y: CRUISE_Y + 70 * a * a, z: 0, pitch: 0.42 * smooth(u01(tt, t.four - 0.05, t.four + 0.45)), gear: 0 }; }
    if (id === 'tb2') { return { x: 2600 + 110 * (tt - t.the2), y: CRUISE_Y + 30 + 0.35 * Math.sin(tt * 3.1) + 0.2 * Math.sin(tt * 5.3), z: 0, pitch: 0.02 * Math.sin(tt * 2.7), roll: 0.035 * Math.sin(tt * 2.3), gear: 0 }; }
    if (id === 'ld1') { const a = t.lands - tt; return { x: 260 + 62 * (tt - t.lands), y: -0.55 + Math.max(0, a) * 2.2, z: 0, pitch: a > 0 ? 0.08 : 0.08 * Math.exp(a * 3), gear: 1 }; }
    return null;
  }
  const bodyW = (p) => { air.g.updateMatrixWorld(true); return air.body.localToWorld(V(...p)).toArray(); };
  for (let k = 0; k < 9; k++) { const tk = t.it1 + k * 0.17; fx.burst('dust', tk, { pos: [takeoffX(tk) - 17, 0.3, 14], n: 5, spread: 4, speed: [1.5, 4], size: [1.2, 2.4], color: 0xd8d2c4, life: [0.6, 1.0] }); }   // the downwash hits the runway
  // tire smoke on touchdown (the two main bogies) + the lift-off dust
  for (const z of [-2.7, 2.7]) fx.burst('smoke', t.lands, { pos: [260 - 3.5, 0.4, z], n: 26, spread: 1.6, speed: [0.5, 2.5], size: [0.8, 1.8], color: 0xe8e8e8, life: [0.8, 1.4] });

  // ---------------------------------------------------------------- SHOTS (hard cuts; one gliding rail per framing)
  const HS = seatW(2, 3), TS = C(0.0, 0, -0.75);   // the teacher's spot in the aisle (everyone stares at it)   // hero + teacher seats (root positions)
  const face = (toon, off, lk = [0, -0.1, 0], fov = 40, push = 0, t0 = 0, t1 = 1) => (tt) => { const h = headW(toon), u = u01(tt, t0, t1); return { pos: add(h, [off[0] * (1 - push * u), off[1], off[2] * (1 - push * u)]), look: add(h, lk), fov }; };
  const side = (pos, lk, fov, t0, t1) => (tt) => { const h = headW(hero), u = u01(tt, t0, t1), p = [lerp(pos[0], h[0], 0.08 * u), pos[1], lerp(pos[2], h[2], 0.08 * u)]; return { pos: p, look: add(h, lk), fov }; };
  const chase = (off, lk, fov) => (tt) => { const p = bodyW(off), l = bodyW(lk); return { pos: p, look: l, fov }; };
  const ckCam = (pos, look, fov) => (tt) => { ck.g.updateWorldMatrix(true, false); return { pos: ck.g.localToWorld(V(...pos)).toArray(), look: ck.g.localToWorld(V(...look)).toArray(), fov, up: true }; };
  const SHOTS = [
    // HOOK — the planespotter outside the approach fence; the jet roars over him on "fly"
    { id: 'hook', t0: 0, set: 'af', cam: (tt) => { const u = smooth(u01(tt, 0, TOVER + 0.3)); return { pos: [AD.spot[0] + 3.6, 0.8, AD.spot[2] + 1.4], look: [AD.spot[0] - 8, 4.2 + 2.6 * u, AD.spot[2] - 1.2], fov: 58 }; } },
    // SECURITY
    { id: 'sec1', t0: t.sec - 0.02, set: 'sec', frames: [
      { t: t.sec, pos: S(1.0, 2.2, 4.4), look: S(-0.7, 0.5, -2.4), fov: 50 },
      { t: t.shoes - 0.12, pos: S(0.9, 2.05, 3.8), look: S(-0.75, 0.5, -2.4), fov: 48, stop: true } ] },
    { id: 'shoes', t0: t.shoes - 0.08, set: 'sec', frames: [
      { t: t.shoes - 0.08, pos: S(-0.2, 1.0, -0.25), look: S(-1.1, 0.64, -2.25), fov: 50 },
      { t: t.belt - 0.12, pos: S(-0.25, 0.98, -0.45), look: S(-1.1, 0.64, -2.25), fov: 50, stop: true } ] },
    { id: 'belt', t0: t.belt - 0.08, set: 'sec', frames: [
      { t: t.belt - 0.08, pos: S(-0.35, 1.2, -0.7), look: S(-1.15, 0.85, -2.25), fov: 44 },
      { t: t.pants - 0.12, pos: S(-0.38, 1.18, -0.85), look: S(-1.15, 0.85, -2.25), fov: 44, stop: true } ] },
    { id: 'pants', t0: t.pants - 0.08, set: 'sec', frames: [
      { t: t.pants - 0.08, pos: S(-0.2, 0.95, -0.3), look: S(-1.05, 0.58, -2.25), fov: 50 },
      { t: t.still - 0.15, pos: S(-0.22, 0.92, -0.45), look: S(-1.05, 0.58, -2.25), fov: 50, stop: true } ] },
    { id: 'beep', t0: t.still - 0.1, set: 'sec', frames: [
      { t: t.still - 0.1, pos: S(0.3, 1.3, 3.5), look: S(0.05, 0.9, 0), fov: 52 },
      { t: t.eng - 0.1, pos: S(0.25, 1.28, 3.0), look: S(0.05, 0.92, 0), fov: 52, stop: true } ] },
    // ENGINES — at the gate
    { id: 'eng1', t0: t.eng - 0.04, set: 'af', frames: [
      { t: t.eng, pos: add(AD.gate, [8.6, 1.35, 16.2]), look: add(AD.gate, [3.4, 1.75, 9.8]), fov: 48 },
      { t: t.set - 0.12, pos: add(AD.gate, [8.1, 1.35, 15.5]), look: add(AD.gate, [3.3, 1.8, 9.6]), fov: 48, stop: true } ] },
    { id: 'eng2', t0: t.set - 0.08, set: 'af', frames: [
      { t: t.set - 0.08, pos: add(AD.gate, [-0.8, 2.6, 15.6]), look: add(AD.gate, [-1.2, 2.35, 8.5]), fov: 46 },
      { t: t.and - 0.12, pos: add(AD.gate, [-1.1, 2.55, 14.9]), look: add(AD.gate, [-1.5, 2.35, 8.5]), fov: 46, stop: true } ] },
    { id: 'eng3', t0: t.and - 0.08, set: 'af', cam: (tt) => { const f = smooth(u01(tt, CAPOUT - 0.08, CAPOUT + 0.25)), cx = AD.gate[0] - 1.6 - 2.6 * f; return { pos: [AD.gate[0] - 2.4 - 0.6 * f, 2.3, AD.gate[2] + 15.6], look: [cx, 2.3 - 0.3 * f, AD.gate[2] + 8.5], fov: 50 }; } },
    // WING + LIFT — the takeoff roll
    { id: 'wing1', t0: t.this - 0.04, set: 'af', cam: chase([-24, 14.5, 24], [-6, 5.8, 11], 48) },
    { id: 'wing2', t0: t.it1 - 0.06, set: 'af', cam: chase([-6.5, 2.6, 38], [-9.6, 3.9, 14], 48) },
    { id: 'lift1', t0: t.lift0 - 0.04, set: 'af', cam: (tt) => { const x = takeoffX(Math.min(tt, t.up + 0.2)); return { pos: [x + 16, 2.0, 40], look: [takeoffX(tt) - 6, 4.2 + takeoffY(tt) * 0.7, 8], fov: 50 }; } },
    { id: 'lift2', t0: t.thats - 0.08, set: 'af', cam: (tt) => ({ pos: [takeoffX(t.thats) + 46, 1.0, 30], look: [takeoffX(tt) - 4, takeoffY(tt) + 5.0, 6], fov: 54 }) },
    // SPEED — the cockpit in the clouds
    { id: 'ck1', t0: t.twice - 0.04, set: 'af', mood: 'air', cam: ckCam([-1.05, 1.62, 0.12], [1.6, 1.15, -0.1], 52) },
    { id: 'ck2', t0: t.four - 0.06, set: 'af', mood: 'air', cam: ckCam([0.95, 1.3, 0.42], [-0.1, 0.95, -0.5], 52) },
    // TURBULENCE
    { id: 'tb1', t0: t.turb - 0.04, set: 'cab', frames: [
      { t: t.turb, pos: C(-0.05, 1.62, 1.5), look: C(0.35, 1.0, -2.6), fov: 50 },
      { t: t.the2 - 0.1, pos: C(-0.05, 1.55, 1.15), look: C(0.4, 1.0, -2.6), fov: 50, stop: true } ] },
    { id: 'tb2', t0: t.the2 - 0.06, set: 'af', mood: 'air', cam: chase([4, 10.5, 34], [-4, 6.2, 0], 50) },
    { id: 'tb3', t0: t.your1 - 0.06, set: 'cab', cam: side(C(-0.55, 1.62, -0.42), [0, -0.34, 0.05], 50, t.your1, t.your2) },
    // SNACK
    { id: 'sn1', t0: t.your2 - 0.04, set: 'cab', frames: [
      { t: t.your2, pos: C(0.0, 1.64, 0.4), look: C(0.5, 1.25, -1.6), fov: 52 },
      { t: t.one1 - 0.12, pos: C(0.02, 1.62, 0.2), look: C(0.52, 1.25, -1.6), fov: 52, stop: true } ] },
    { id: 'sn2', t0: t.one1 - 0.06, set: 'cab', cam: side(C(-0.5, 1.6, -0.5), [0, -0.36, 0.1], 48, t.one1, t.it2) },
    // LAND
    { id: 'ld1', t0: t.it2 - 0.04, set: 'af', cam: (tt) => { const x = 260 + 62 * (tt - t.lands); return { pos: [x + 16, 1.0, 30], look: [x - 4, 3.2, 0], fov: 46 }; } },
    { id: 'ld2', t0: t.one2 - 0.06, set: 'cab', frames: [
      { t: t.one2, pos: C(0.0, 1.72, 1.65), look: C(0.3, 0.98, -1.0), fov: 56 },
      { t: t.its - 0.1, pos: C(0.02, 1.7, 1.42), look: C(0.3, 0.98, -1.0), fov: 56, stop: true } ] },
    // TEACHER
    { id: 'tc1', t0: t.its - 0.06, set: 'cab', frames: [
      { t: t.its, pos: C(0.0, 1.5, -2.8), look: C(0.36, 0.92, -1.1), fov: 52 },
      { t: t.ten - 0.12, pos: C(0.02, 1.5, -2.62), look: C(0.36, 0.92, -1.1), fov: 52, stop: true } ] },
    { id: 'tc2', t0: t.ten - 0.08, set: 'cab', frames: [
      { t: t.ten - 0.08, pos: C(1.58, 1.42, -1.42), look: C(0.42, 0.98, -1.15), fov: 54 },
      { t: t.handwritten - 0.2, pos: C(1.52, 1.4, -1.4), look: C(0.42, 0.98, -1.15), fov: 54, stop: true } ] },
    { id: 'tc3', t0: t.handwritten - 0.16, set: 'cab', frames: [
      { t: t.handwritten - 0.16, pos: add(TRAY(3), [0.0, 0.62, -0.2]), look: add(TRAY(3), [0, 0.0, 0.03]), fov: 46 },
      { t: t.youre - 0.08, pos: add(TRAY(3), [0.0, 0.56, -0.18]), look: add(TRAY(3), [0, 0.0, 0.03]), fov: 46, stop: true } ] },
    // COOKED
    { id: 'cooked', t0: t.youre - 0.04, set: 'cab', cam: side(C(-0.55, 1.62, -0.45), [0, -0.32, 0.05], 48, t.youre, t.so) },
    // SCRIBE
    { id: 'open', t0: t.so - 0.04, set: 'cab', frames: [
      { t: t.so, pos: C(0.76, 1.46, -1.66), look: C(1.12, 0.95, -1.3), fov: 56 },
      { t: t.scribe - 0.15, pos: C(0.78, 1.44, -1.6), look: C(1.12, 0.95, -1.3), fov: 56, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'cab', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.one3 - 0.04, set: 'cab', frames: [
      { t: t.one3 - 0.04, pos: add(TRAY(3), [-0.25, 0.62, -0.3]), look: add(TRAY(3), [0.0, 0.15, 0.0]), fov: 46 },
      { t: t.it3 - 0.1, pos: add(TRAY(3), [-0.22, 0.58, -0.27]), look: add(TRAY(3), [0.0, 0.15, 0.0]), fov: 46, stop: true } ] },
    { id: 'solve', t0: t.it3 - 0.04, set: 'cab', pov: true, cam: () => screenCam(0.02) },
    // HAND — the pen draws the free-body diagram, arrow by arrow on its word
    { id: 'pen', t0: t.it4 - 0.04, set: 'cab', frames: [
      { t: t.it4, pos: add(TRAY(3), [0.15, 0.62, -0.5]), look: add(TRAY(3), [0.15, 0.02, 0.02]), fov: 48 },
      { t: t.diagram - 0.3, pos: add(TRAY(3), [0.06, 0.5, -0.38]), look: add(TRAY(3), [0.04, 0.0, 0.02]), fov: 46, stop: true } ] },
    { id: 'fbd', t0: t.diagram - 0.26, set: 'cab', cam: (tt) => fbdCam(tt) },
    { id: 'page', t0: t.in - 0.08, set: 'cab', frames: [
      { t: t.in - 0.08, pos: add(TRAY(3), [0.0, 0.55, -0.3]), look: add(TRAY(3), [0.0, 0.0, -0.01]), fov: 48 },
      { t: t.you - 0.08, pos: add(TRAY(3), [0.0, 0.62, -0.34]), look: add(TRAY(3), [0.0, 0.0, -0.01]), fov: 48, stop: true } ] },
    // FOLD — a paper plane; it flies; it lands on the teacher; one guy claps
    { id: 'fold', t0: t.you - 0.04, set: 'cab', frames: [
      { t: t.you, pos: C(0.02, 1.64, 0.32), look: C(0.55, 1.22, -1.5), fov: 50 },
      { t: t.it5 - 0.12, pos: C(0.06, 1.62, 0.05), look: C(0.58, 1.24, -1.5), fov: 50, stop: true } ] },
    { id: 'fly', t0: t.it5 - 0.06, set: 'cab', cam: (tt) => { const p = planeAt(tt), base = C(0.3, 0.72, -1.0); return { pos: C(0.05, 1.68, 1.75), look: [lerp(base[0], p[0], 0.3), lerp(base[1], p[1], 0.3), lerp(base[2], p[2], 0.3)], fov: 56 }; } },
    { id: 'clap', t0: t.one4 - 0.06, set: 'cab', frames: [
      { t: t.one4, pos: C(0.02, 1.72, 1.4), look: C(0.3, 0.8, -1.0), fov: 54 },
      { t: ENDCARD + 2, pos: C(0.0, 1.76, 1.7), look: C(0.3, 0.8, -1.0), fov: 56, stop: true } ] },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; if (s.frames) s.rail = makeRail(planRail(s.frames, { move: [0.35, 13], minHold: 0.6 })); });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // the screen insert: straight down the laptop screen's normal (the seats between are hidden: a POV cheat)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) {
    laptop.scr.updateWorldMatrix(true, false); laptop.scr.getWorldPosition(scrP); laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq);
    const d = 0.9; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.015, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.12 - dy, scrP.z], fov: 40 };
  }
  // the sheet on the tray: canvas px → world
  const sheetToW = (px, py) => { flatSheet.updateWorldMatrix(true, false); return flatSheet.localToWorld(V((px / sheet.w - 0.5) * 0.311, (0.5 - py / sheet.h) * 0.4026, 0)).toArray(); };
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  // the FBD framing: the diagram + the working beside it, high in the frame (the one-word caption sits at the centre)
  function fbdCam(tt) {
    const c = sheetToW(720, 500), u = u01(tt, t.diagram, t.in);
    return { pos: add(c, [0.0, 0.47 - 0.03 * u, -0.22 + 0.015 * u]), look: add(c, [0, 0, -0.065]), fov: 38 };
  }
  // the paper plane's flight: from the hero's tray, up the aisle, a loop by the galley, back down onto the teacher's hands
  const HOLD = C(0.48, 1.44, -1.15);   // the sheet held up in front of his face (seen over the seat back)
  const FLY = [HOLD, C(0.48, 1.62, -0.95), C(0.3, 1.78, -0.6), C(0.15, 1.55, 0.05), C(-0.1, 1.28, 0.35), C(-0.3, 1.45, 0.0), C(-0.1, 1.65, -0.45), C(0.0, 1.6, -0.7)].map((p) => V(...p));
  const flyCurve = new THREE.CatmullRomCurve3(FLY);
  const planeU = (tt) => smooth(u01(tt, LAUNCH, CATCH));
  const planeAt = (tt) => flyCurve.getPoint(planeU(tt)).toArray();

  // ---------------------------------------------------------------- per-frame
  const fogNone = null;
  function useSet(sh) {
    AF.root.visible = air.g.visible = sh.set === 'af'; SEC.root.visible = sh.set === 'sec'; CAB.root.visible = sh.set === 'cab';
    trays.forEach((g) => (g.visible = sh.set === 'cab'));
    if (sh.set === 'af') { AF.setMood(sh.mood || 'day'); scene.fog = AF.fog; scene.background = AF.fog.color; scene.environmentIntensity = 0.5; renderer.toneMappingExposure = 1.0; studio.camera.near = 0.1; }
    else { scene.fog = fogNone; scene.background = new THREE.Color(sh.set === 'sec' ? 0xd8d4cc : 0x2a2f38); scene.environmentIntensity = 0.35; renderer.toneMappingExposure = 1.04; studio.camera.near = 0.03; }
    studio.camera.updateProjectionMatrix();
  }
  const hideAll = () => {
    for (const r of people) r.root.visible = false;
    for (const x of [airDown, flyingCap, crewCap, capFire, beltFly, cup.g, blob, bag.g, pretzel, book, stack, laptop.g, pen.g, shotHand, paperPlane, flatSheet, liftArrow, ...shoesFly, ...suitcases]) x.visible = false;
    crowd.hideAll(); crowd2.hideAll(); boxers.set(false); heroBelt.visible = true; stamper.visible = false; imprint.visible = false;
    flowPaths.forEach((f) => f.update(0, 0)); intakeArrows.update(0, 0); intakeArrows2.update(0, 0); coreArrows.update(0, 0); exhaustArrows.update(0, 0);
    CAB.rows.forEach((r) => (r.visible = true)); ck.g.visible = false; airParts.forEach((p) => (p.visible = true));
  };
  const seated = { legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 } };
  const CS = 1.12;   // toons ×1.12 in the cabin: plane.js seat backs (1.22 m) are sized for the wooden rig, a toon's face sat behind them
  const sit = (toon, row, col, p = {}) => { const s = seatW(row, col, 0.06); toon.root.visible = true; toon.set({ x: s[0], y: s[1], z: s[2], rotY: 0, scale: CS, ...seated, ...p }); };
  const SEATED_CROWD = [[3, 3], [4, 0], [4, 2], [4, 4], [5, 1], [5, 3], [5, 5], [6, 0], [6, 2], [6, 4], [7, 1], [7, 3], [7, 5], [8, 0], [8, 2], [8, 4], [9, 1], [9, 3], [9, 5], [10, 0], [10, 2], [10, 4], [11, 1], [11, 3]];
  const wiggle = (k, tt) => 0.15 * Math.sin(tt * 1.3 + k * 1.7);

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; useSet(sh); hideAll();
    const sw = Math.sin(tt * 2.1);
    let camUp = null;

    // ======================================================== AIRFIELD shots
    if (sh.set === 'af') {
      const A = airAt(tt, id); air.set(id === 'eng2' || id === 'eng3' ? { ...A, gear: 0 } : A); AF.update(tt);
      eng.set(engState(tt, { flame: id.startsWith('eng') ? 1 : 1, flameBig: id === 'eng2' ? 1 + 1.4 * Math.exp(-Math.abs(tt - CAPFIRE) * 3) : 1 }));
      eng.updateClip(); if (!(id === 'eng2' || id === 'eng3')) eng.clip.constant = 1e6;   // closed nacelle except the two section shots
      if (id === 'hook') {
        AF.aimSun(AD.spot[0] - 4, 1, AD.spot[2], 14);
        hero.root.visible = true; const over = tt > TOVER - 0.15, blast = Math.exp(-Math.max(0, tt - TOVER) * 3) * (over ? 1 : 0);
        hero.set({ x: AD.spot[0], y: 0, z: AD.spot[2], rotY: 1.0, lean: -0.1 - 0.25 * blast, head: { x: -0.35 - 0.25 * smooth(u01(tt, 0.5, TOVER)), y: 0.2 }, armL: over ? { x: -2.6, z: 0.5, el: 1.2 } : { x: -0.3, z: 0.25 }, armR: over ? { x: -2.4, z: 0.6, el: 1.4 } : { x: -1.1, z: 0.2, el: 1.8 },
          eyes: over ? 'wide' : 'open', mouth: over ? 'scream' : 'o', brows: over ? 0.9 : 0.4, hairUp: blast, look: [0.2, 0.8], squash: [1 + 0.06 * blast, 1 - 0.06 * blast], t: tt });
        crowd.set(0, { x: AD.spot[0] - 2.4, y: 0, z: AD.spot[2] + 3.4, rotY: PI / 2 + 0.9, armR: { x: over ? -2.8 : -1.5, z: 0.3 }, look: [0.3, 0.9], headX: -0.4, phone: !over, wide: over, t: tt });
        crowd.set(1, { x: AD.spot[0] - 4.6, y: 0, z: AD.spot[2] + 1.1, rotY: PI / 2 + 0.2, armL: { x: -2.9, z: 0.4 }, armR: { x: -2.9, z: 0.4 }, look: [0, 0.9], headX: -0.45, wide: true, t: tt });
        crowd.commit();
      }
      if (id.startsWith('eng')) {
        AF.aimSun(AD.gate[0], 2, AD.gate[2] + 9, 14);
        const ew = eng.g.localToWorld(V(0, 0, 0)).toArray(), EW = (lx, ly = 0, lz = 0) => add(ew, [lx, ly, lz]);
        // the ramp agent in front of the intake, facing the lens, oblivious; the cap is ripped off his head on "suck"
        crew.root.visible = id === 'eng1';
        const capOff = tt > CAP0, sucked = smooth(u01(tt, CAP0, CAP0 + 0.25));
        if (id === 'eng1') {
          const CP = add(AD.gate, [5.0, 0, 12.6]);
          crew.set({ x: CP[0], y: 0, z: CP[2], rotY: 0.75 - 0.35 * sucked, armL: capOff ? { x: -0.2, z: 1.4 - 0.3 * Math.sin(tt * 9), el: 0.8 } : { x: -2.6, z: 0.5 + 0.25 * Math.sin(tt * 7), el: 0.6 }, armR: capOff ? { x: -2.7, z: 0.4, el: 1.4 } : { x: -2.6, z: 0.5 - 0.25 * Math.sin(tt * 7 + 1), el: 0.6 },
            noHat: capOff, hairUp: capOff ? 1 : 0, eyes: capOff ? 'wide' : 'half', mouth: capOff ? 'scream' : 'grin', brows: capOff ? 0.9 : -0.2, look: capOff ? [-0.6, 0.3] : [0, 0], head: { y: capOff ? -0.7 * sucked : 0, x: capOff ? -0.15 : 0 }, lean: -0.15 * sucked, t: tt });
        }
        // the cap: off his head → into the intake → through the core (section shot) → out of the nozzle on fire
        const head = add(AD.gate, [5.0, 1.62, 12.6]);
        let cp = null, rot = [0, tt * 6, 0], sc = 1, burn = 0;
        if (tt > CAP0 && tt < CAPIN) { const u = (tt - CAP0) / (CAPIN - CAP0), u2 = u * u; const a = EW(3.4, 0.2, 0.0); cp = [lerp(head[0], a[0], u2), lerp(head[1], a[1], u2) + 0.6 * Math.sin(u * PI), lerp(head[2], a[2], u2)]; rot = [u * 9, u * 14, u * 5]; }
        else if (tt >= CAPIN && tt < CAPOUT) { const u = (tt - CAPIN) / (CAPOUT - CAPIN); const xs = [2.6, 1.2, 0.3, -0.2, -0.8, -1.3], k = Math.min(xs.length - 1.001, u * (xs.length - 1)), i = Math.floor(k); const lx = lerp(xs[i], xs[i + 1], k - i); cp = EW(lx, 0.02 * Math.sin(tt * 30), -0.16); rot = [tt * 30, tt * 4, 0]; sc = 0.7; burn = smooth(u01(tt, CAPFIRE - 0.05, CAPFIRE + 0.2)); }
        else if (tt >= CAPOUT) { const a = tt - CAPOUT; const p0 = EW(-1.6, 0, -0.16); cp = [p0[0] - 16 * a + 2.5 * a * a, p0[1] + 1.4 * a - 4.9 * a * a, p0[2] + 1.6 * a]; if (cp[1] < 0.05) cp[1] = 0.05; rot = [a * 20, a * 6, a * 13]; sc = 0.75; burn = 1; }
        if (cp && !(id === 'eng1' && tt > CAPIN + 0.05)) { crewCap.visible = true; capFire.position.set(...cp); crewCap.position.set(...cp); crewCap.rotation.set(...rot); crewCap.scale.setScalar(sc); crewCap.traverse((o) => { if (o.isMesh) { o.material = o.userData.burnM || (o.userData.burnM = o.material.clone()); o.material.color.setHex(0x2f6fd1).lerp(new THREE.Color(0x221c18), burn * 0.85); } }); }
        capFire.visible = !!cp && burn > 0.3 && crewCap.visible; capFire.children.forEach((f, k) => { f.material.opacity = burn * (0.6 + 0.3 * Math.sin(tt * 37 + k * 2)); f.scale.setScalar((0.28 + 0.1 * Math.sin(tt * 23 + k)) * (1 + k * 0.25)); f.position.set(0.04 * Math.sin(k * 2.1), 0.1 + k * 0.09, 0); });
        intakeArrows.update(tt, id === 'eng3' ? 0 : 1); intakeArrows2.update(tt, id === 'eng3' ? 0 : 1); coreArrows.update(tt, id === 'eng2' ? 1 : 0); exhaustArrows.update(tt, id === 'eng3' ? 1 : 0);
      }
      if (id.startsWith('wing') || id.startsWith('lift')) {
        const px = takeoffX(tt); AF.aimSun(px - 4, 3, 8, 32);
        flowPaths.forEach((f) => f.update(tt, 0));
        const dn = id === 'wing2' ? easeOutBack(u01(tt, t.shoves1 - 0.1, t.shoves1 + 0.2)) : id === 'lift1' ? 1 : 0;
        airDown.visible = dn > 0.01; airDown.children.forEach((a, k) => { const ph = ((tt * 1.6 + k * 0.33) % 1); a.position.y = a.userData.y0 - 1.6 * ph; a.scale.setScalar(Math.max(0.01, dn) * (0.75 + 0.25 * Math.sin(ph * PI))); a.children.forEach((m) => (m.material.opacity = 0.9 * Math.sin(ph * PI))); });
        liftArrow.visible = id.startsWith('lift') && tt > t.shoves2 - 0.15; { const k = 1.35 * (liftArrow.visible ? Math.max(0.01, easeOutBack(u01(tt, t.shoves2 - 0.15, t.shoves2 + 0.25))) : 1); liftArrow.scale.set(k, k * (1 + 0.06 * Math.sin(tt * 14)), k); }
      }
      if (id.startsWith('ck')) {
        AF.aimSun(A.x, A.y, 0, 30);
        airParts.forEach((p) => (p.visible = false)); ck.g.visible = true; camUp = true;
        const shove = smooth(u01(tt, t.twice + 0.02, t.twice + 0.2)), g4 = smooth(u01(tt, t.four - 0.05, t.four + 0.35));
        ck.setThrottle(0.3 + 0.7 * shove); ck.setSpeed(lerp(200, 400, smooth(u01(tt, t.twice + 0.1, t.speed + 0.25))), 18000 + 9000 * g4 * u01(tt, t.four, t.lift2 + 0.5), 0.42 * g4);
        const sl = ck.S.seatL, sr = ck.S.seatR, P0 = ck.g.localToWorld(V(sl[0] + 0.05, sl[1] - 0.3, sl[2])), P1 = ck.g.localToWorld(V(sr[0] + 0.05, sr[1] - 0.3, sr[2]));
        // the crew rides the cockpit: pose in the cockpit's frame (parent them to it for the shot)
        for (const [toon, p, k] of [[pilot, sl, 0], [copilot, sr, 1]]) { if (toon.root.parent !== ck.g) ck.g.add(toon.root); toon.root.visible = true;
          const hand = k === 0 ? { x: -1.25 + 0.2 * shove, z: 0.55 - 0.15 * shove, el: 0.7 - 0.4 * shove } : { x: -1.2, z: 0.2, el: 1.3 };
          toon.set({ x: p[0] + 0.05, y: p[1] - 0.27, z: p[2], rotY: PI / 2, ...seated, lean: 0.12 - 0.35 * g4, armL: k === 0 ? hand : { x: -1.3, z: 0.25, el: 1.2 }, armR: { x: -1.25, z: 0.2, el: 1.25 },
            eyes: g4 > 0.2 ? 'wide' : 'half', mouth: g4 > 0.2 ? (k ? 'scream' : 'grin') : 'flat', brows: g4 > 0.2 ? 0.8 : -0.3, head: { x: -0.25 * g4, y: k ? 0.3 * g4 : 0 }, noHat: k === 0 && g4 > 0.05, hairUp: g4 * 0.8, squash: [1 + 0.1 * g4, 1 - 0.1 * g4], faceTint: [0xff8a6a, 0.12 * g4], look: [0, 0.3 * g4], t: tt }); }
        void P0; void P1;
        if (g4 > 0.05) { flyingCap.visible = true; const a = Math.max(0, tt - t.four); const hp = ck.g.localToWorld(V(sl[0] - 0.4 - 1.2 * a, 1.95 + 0.6 * a - 1.4 * a * a, sl[2] + 0.2 * a)); flyingCap.position.copy(hp); flyingCap.rotation.set(a * 6, a * 3, a * 9); flyingCap.quaternion.premultiply(air.g.quaternion); }
      } else { for (const toon of [pilot, copilot]) if (toon.root.parent !== scene) scene.add(toon.root); }
      if (id === 'tb2') { AF.aimSun(A.x, A.y, 0, 40); }
      if (id === 'ld1') { AF.aimSun(260 + 62 * (tt - t.lands), 3, 0, 30); }
    }

    // ======================================================== SECURITY
    if (sh.set === 'sec') {
      const shoesOff = tt > SHOE[0], beltOff = tt > BELTF, pantsDown = tt > DROP;
      const walk = smooth(u01(tt, WALK0, t.eng + 0.3)), DV = S(-1.0, 0, -2.2);
      const hz = lerp(DV[2], S(0, 0, 1.05)[2], walk), hx = lerp(DV[0], S(0.05, 0, 0)[0], smooth(u01(tt, WALK0, WALK0 + 0.5)));
      hero.root.visible = true; boxers.set(pantsDown); heroBelt.visible = !beltOff;
      const kickF = (s) => Math.max(0, Math.sin(clamp((tt - s + 0.12) / 0.3) * PI));
      const beeped = tt > BEEP;
      hero.set({ x: hx, y: 0, z: hz, rotY: walk > 0.02 ? 0.05 : 0.35,
        walk: walk > 0.02 && walk < 0.99 ? tt * 16 : null, walkAmt: 0.35,
        legL: walk > 0.02 ? undefined : { x: -1.1 * kickF(SHOE[0]), kn: 0.5 * kickF(SHOE[0]) }, legR: walk > 0.02 ? undefined : { x: -1.1 * kickF(SHOE[1]), kn: 0.5 * kickF(SHOE[1]) },
        armL: tt > t.belt - 0.05 && tt < BELTF + 0.35 ? { x: -0.8 - 1.6 * smooth(u01(tt, t.belt - 0.05, BELTF)), z: 1.3, el: 0.3 } : pantsDown ? { x: -0.5, z: 0.35, el: 1.2 } : { x: -0.2, z: 0.2 },
        armR: tt > t.belt - 0.05 && tt < BELTF ? { x: -0.6, z: 0.2, el: 1.4 } : pantsDown ? { x: -0.5, z: 0.35, el: 1.2 } : { x: -0.2, z: 0.2 },
        eyes: beeped ? 'x' : pantsDown ? 'half' : 'half', mouth: beeped ? 'wavy' : pantsDown ? 'flat' : 'flat', brows: beeped ? 0.9 : 0.5, look: [0, 0.1], head: { x: beeped ? 0.05 : 0.08, z: 0.03 * sw }, faceTint: pantsDown ? [0xff6b6b, 0.18] : [0, 0], t: tt });
      if (shoesOff) hero.M.shoes.color.setHex(0xf4f4f0);   // socks
      if (pantsDown) { hero.M.pants.color.copy(hero.M.skin.color); }
      // the shoes + the belt fly into the bin on the belt
      binOf.position.set(0, 0.72, -2.25);
      const binW = S(-1.75, 0.76, -2.25);
      shoesFly.forEach((s, k) => { const t0 = SHOE[k]; if (!(id === 'shoes' || id === 'belt' || id === 'pants' || id === 'sec1' || id === 'beep') || tt < t0) return; s.visible = true; const u = clamp((tt - t0) / 0.42), from = add(DV, [(k ? 0.085 : -0.085), 0.05, 0.05]), to = add(binW, [k ? 0.13 : -0.13, 0.02, 0]); s.position.set(lerp(from[0], to[0], u), lerp(from[1], to[1], u) + 0.9 * Math.sin(u * PI), lerp(from[2], to[2], u)); s.rotation.set(u < 1 ? u * 9 : 0, k ? 0.4 : -0.3, u < 1 ? u * 5 : 0); });
      if (beltOff) { beltFly.visible = true; const u = clamp((tt - BELTF) / 0.38), from = add(DV, [-0.25, 0.75, 0.1]), to = add(binW, [0, 0.06, 0]); beltFly.position.set(lerp(from[0], to[0], u), lerp(from[1], to[1], u) + 0.5 * Math.sin(u * PI), lerp(from[2], to[2], u)); beltFly.rotation.set(0, u < 1 ? u * 12 : 0.3, u < 1 ? Math.sin(u * 20) * 0.6 : 0); }
      // the arch: green → red on "beeps" (pulses while it beeps)
      SEC.detector.setLight(beeped ? 'red' : 'green', beeped ? 0.6 + 0.4 * (Math.sin((tt - BEEP) * 18) > 0 ? 1 : 0) : 1);
      // the officer, the queue
      officer.root.visible = true; const O = S(1.3, 0, 0.45);
      officer.set({ x: O[0], y: 0, z: O[2], rotY: -1.0, armR: beeped ? { x: -2.0, z: 0.3, el: 0.5 } : { x: -0.9, z: 0.3, el: 1.6 }, armL: beeped ? { x: -1.6, z: -0.2, el: 0.2 } : { x: -0.2, z: 0.3, el: 0.4 }, eyes: beeped ? 'half' : 'half', mouth: beeped ? 'flat' : 'flat', brows: -0.7, look: [-0.4, -0.1], head: { y: -0.15 }, t: tt });
      wand.led.material.emissiveIntensity = beeped ? 2 : 0;
      const Q = [[-0.4, -3.0, 0.1], [0.5, -3.4, -0.2], [1.6, -2.85, 0.3], [-0.2, -4.4, 0.0], [1.1, -4.3, 0.15], [2.6, -4.35, -0.25]];
      PAX.forEach((p, k) => { const q = Q[k], w = S(q[0], 0, q[1]); p.root.visible = true; p.set({ x: w[0], y: 0, z: w[2], rotY: q[2], armL: { x: -0.2, z: 0.2 }, armR: k % 2 ? { x: -0.5, z: 0.15, el: 1.2 } : { x: -0.2, z: 0.2 },
        eyes: pantsDown ? 'wide' : 'half', mouth: pantsDown ? (k % 3 === 0 ? 'o' : k % 3 === 1 ? 'grin' : 'flat') : 'flat', brows: 0.3, look: [0.1 * Math.sin(k), 0], head: { y: wiggle(k, tt), x: 0.05 }, t: tt });
        if (k < suitcases.length) { suitcases[k].visible = true; suitcases[k].position.set(w[0] + 0.32, 0, w[2] + 0.05); suitcases[k].rotation.y = q[2]; } });
      for (let i = 0; i < 18; i++) { const r = i % 6, c = Math.floor(i / 6); const w = S(-1.0 + r * 0.75 + (c % 2) * 0.3, 0, -5.8 - c * 1.1); crowd.set(i, { x: w[0], y: 0, z: w[2], rotY: (i % 3 - 1) * 0.3, look: [0, 0], phone: i % 4 === 0, wide: pantsDown && i % 2 === 0, t: tt }); }
      crowd.commit();
    }

    // ======================================================== CABIN
    if (sh.set === 'cab') {
      const turbOn = id === 'tb1' || id === 'tb3', bump = turbOn ? 0.045 * (Math.sin(tt * 23) * Math.sin(tt * 7.3)) + 0.03 * Math.sin(tt * 41) : 0;
      const bumpK = (k) => (turbOn ? 0.05 * Math.sin(tt * 19 + k * 1.3) * Math.sin(tt * 6.1 + k) : 0);
      const coffeeOn = tt > t.isnt - 0.02 && tt < t.youre + 1.5;   // the coffee stays on his face until he opens Scribe
      const coffeeK = coffeeOn ? smooth(u01(tt, SPLASH, SPLASH + 0.08)) * (tt > t.so ? 0.0 : 1) : 0;
      const reveal = id === 'tc1' || id === 'tc2' || id === 'tc3';
      const staring = id === 'ld2';
      // the hero (row 2, aisle)
      if (!(['fbd', 'screen', 'solve', 'page', 'pen', 'tc1', 'tc2', 'tc3', 'open', 'photo'].includes(id))) {
        const look = staring ? [0.6, 0.15] : reveal ? [0.4, 0.4] : [0, -0.2];
        const cooked = id === 'cooked', snack = id === 'sn1' || id === 'sn2', opened = id === 'open' || id === 'photo' || id === 'pen';
        sit(hero, 2, 3, { y: 0.06 + bump, lean: 0.15, head: { x: staring ? 0.05 : 0.15, y: staring ? 0.35 : reveal ? 0.25 : cooked ? -0.55 : id === 'tb3' ? -0.35 : id === 'sn2' ? -0.3 : 0, z: turbOn ? 0.08 * Math.sin(tt * 17) : cooked ? 0.1 * Math.sin(tt * 18) : 0 },
          armL: id === 'sn2' ? { x: -1.5, z: 0.25, el: 1.4 } : id === 'fold' ? { x: -2.0, z: 0.05, el: 0.9 } : { x: -0.6, z: 0.35, el: 1.3 }, armR: id === 'sn1' ? { x: -1.6, z: 0.4, el: 0.4 } : id === 'sn2' ? { x: -1.55, z: -0.1, el: 1.5 } : id === 'fold' ? { x: -2.0, z: 0.05, el: 0.9 + 0.3 * Math.sin(tt * 14) } : { x: -0.6, z: 0.35, el: 1.3 },
          eyes: cooked ? 'spiral' : id === 'tb3' && tt > SPLASH ? 'closed' : turbOn ? 'wide' : id === 'sn2' ? 'half' : reveal ? 'wide' : opened ? 'wide' : staring ? 'half' : 'open',
          mouth: cooked ? 'wavy' : id === 'tb3' && tt > SPLASH ? 'scream' : turbOn ? 'o' : id === 'sn2' ? 'flat' : reveal ? (id === 'tc2' ? 'scream' : 'o') : staring ? 'flat' : id === 'fold' || id === 'fly' || id === 'clap' ? 'grin' : 'smile',
          brows: cooked ? 0.9 : id === 'sn2' ? -0.4 : reveal ? 0.8 : 0.3, look, faceTint: cooked ? [0xff6b6b, 0.22] : opened ? [0xd8e6ff, 0.1] : [0, 0], t: tt });
      }
      // the teacher (row 1, middle seat): reading PHYSICS → clapping → turned round over his seat back → back in his seat
      const turned = reveal;
      if (!(['screen', 'solve', 'fbd', 'page', 'photo', 'fold', 'pen', 'open'].includes(id))) {
        teacher.root.visible = true;
        if (turned) {   // he stood up to clap; now he turns round in the aisle to the hero, the stack in his hands
          const TA = C(0.16, 0, -1.02), up = smooth(u01(tt, t.its - 0.1, t.its + 0.3));
          const reach = id === 'tc2' ? smooth(u01(tt, t.ten - 0.05, STACKDROP)) : 0, stampUp = id === 'tc3' ? smooth(u01(tt, t.handwritten - 0.3, STAMP - 0.08)) : 0, stampDn = id === 'tc3' && tt > STAMP - 0.06;
          const hold = { x: -1.35 + 0.35 * reach, z: 0.42, el: 0.85 - 0.4 * reach };
          teacher.set({ x: TA[0], y: 0, z: TA[2], rotY: id === 'tc1' ? 2.75 : 2.4, scale: CS, lean: id === 'tc2' ? 0.12 + 0.1 * reach : 0.12 + 0.18 * up,
            armL: id === 'tc3' ? { x: -0.4, z: 0.3, el: 1.1 } : hold, armR: id === 'tc3' ? (stampDn ? { x: -1.3, z: -0.1, el: 0.45 } : { x: -2.5 * stampUp - 0.8, z: 0.2, el: 1.3 * stampUp + 0.3 }) : hold,
            eyes: 'open', mouth: 'grin', brows: -0.5, look: id === 'tc2' ? [-0.4, 0.2] : [0.3, -0.25], head: id === 'tc2' ? { x: -0.1, y: -0.6 } : { x: 0.08, y: 0.1 * Math.sin(tt * 2) }, t: tt });
          stamper.visible = id === 'tc3';
        } else if (id === 'ld2' || id === 'clap' || id === 'fly') {   // standing in the aisle, clapping at chest height
          const TA = C(0.0, 0, -0.75), clapping = id === 'ld2' || (id === 'clap' && tt > t.claps2 - 0.15), cl = Math.sin(tt * 26);
          teacher.set({ x: TA[0], y: 0, z: TA[2], rotY: 0, scale: CS, lean: 0.05, armL: clapping ? { x: -1.45, z: 0.1 + 0.32 * cl, el: 1.15 } : { x: -0.25, z: 0.25, el: 0.3 }, armR: clapping ? { x: -1.45, z: 0.1 + 0.32 * cl, el: 1.15 } : { x: -0.25, z: 0.25, el: 0.3 },
            eyes: clapping ? 'closed' : 'wide', mouth: 'grin', brows: -0.2, look: [0, 0.4], head: { x: -0.12, z: clapping ? 0.06 * Math.sin(tt * 9) : 0 }, t: tt });
        } else {
          sit(teacher, 1, 4, { y: 0.06 + bumpK(9), lean: 0.2, armL: { x: -1.2, z: 0.2, el: 1.4 }, armR: { x: -1.2, z: 0.2, el: 1.4 }, eyes: 'half', mouth: 'flat', brows: -0.3, look: [0, -0.6], head: { x: 0.3 }, t: tt });
          if (!(id === 'cooked' || id === 'open')) { book.visible = true; const h = handW(teacher, 1), h2 = handW(teacher, -1); book.position.set((h[0] + h2[0]) / 2, (h[1] + h2[1]) / 2 + 0.06, (h[2] + h2[2]) / 2 + 0.03); book.rotation.set(-0.5, PI, 0); }
        }
      }
      coffeeMask.visible = coffeeK > 0.01 && hero.root.visible; coffeeMask.material.opacity = coffeeK; coffeeMask.scale.setScalar(0.9 + 0.1 * coffeeK);
      // the other passengers (+ an instanced crowd further back): bounce in turbulence, stare at the clapper, watch the plane fly
      const PAXSEAT = [[1, 2], [0, 5], [2, 2], [0, 1], [3, 5], [3, 1]];   // never two toons side by side (a ×1.12 toon head is wider than a seat)
      PAX.forEach((p, k) => {
        if (id === 'screen' || id === 'solve' || id === 'fbd' || id === 'page' || (id === 'cooked' && k === 4)) return;
        const [r, c] = PAXSEAT[k], s = seatW(r, c), toT = Math.atan2(TS[0] - s[0], TS[2] - s[2]);
        const stare = id === 'ld2' || (id === 'clap' && tt > t.claps2 - 0.2), watch = id === 'fly';
        sit(p, r, c, { y: 0.06 + bumpK(k), lean: 0.1, head: { y: stare ? clamp(toT, -1.2, 1.2) : wiggle(k, tt), x: stare ? 0.05 : 0.1 }, armL: turbOn ? { x: -1.8, z: 0.5, el: 0.6 } : { x: -0.6, z: 0.3, el: 1.3 }, armR: turbOn ? { x: -1.8, z: 0.5, el: 0.6 } : { x: -0.6, z: 0.3, el: 1.3 },
          eyes: turbOn ? 'wide' : stare ? 'half' : watch ? 'wide' : 'open', mouth: turbOn ? (k % 2 ? 'scream' : 'o') : stare ? 'flat' : watch ? 'o' : 'smile', brows: stare ? -0.6 : 0.2, look: watch ? [0, 0.6] : [0, 0], t: tt });
      });
      SEATED_CROWD.forEach(([r, c], i) => { if (id === 'tc1' && i === 0) return; const s = seatW(r, c); const cr = i % 2 ? crowd2 : crowd; cr.set(Math.floor(i / 2), { x: s[0], y: 0.08 + bumpK(i + 20), z: s[2], rotY: 0, sit: 1, scale: CS, look: [0, 0], wide: turbOn, headY: id === 'ld2' ? Math.atan2(TS[0] - s[0], TS[2] - s[2]) * 0.8 : 0, armL: turbOn ? { x: -2.4, z: 0.4 } : { x: -0.8, z: 0.2 }, armR: turbOn ? { x: -2.4, z: 0.4 } : { x: -0.8, z: 0.2 }, t: tt }); });
      crowd.commit(); crowd2.commit();
      // the flight attendant (snack)
      if (id === 'sn1') { attendant.root.visible = true; const a = C(0.1, 0, -1.85); attendant.set({ x: a[0], y: 0, z: a[2], rotY: 0.6, scale: CS, lean: 0.25, armR: { x: -1.6, z: 0.1, el: 0.4 }, armL: { x: -0.4, z: 0.25, el: 1.3 }, eyes: 'open', mouth: 'grin', brows: -0.2, look: [0.3, -0.3], head: { y: 0.1 }, t: tt }); }
      // the tray: coffee → stack → sheet
      const tray = TRAY(3);
      if (id === 'tb1' || id === 'tb3' || id === 'sn1' || id === 'sn2') {
        cup.g.visible = true; const jump = turbOn ? Math.max(0, Math.sin(tt * 23)) * 0.02 : 0;
        cup.g.position.set(tray[0] + 0.1, TY + jump, tray[2] - 0.05); cup.g.rotation.set(0, 0, turbOn ? 0.15 * Math.sin(tt * 19) : 0); cup.lid.visible = false; cup.setLevel(tt < SPLASH ? 0.9 : 0.05);
        if (id === 'tb3' && tt > SPLASH - 0.28 && tt < SPLASH + 0.04) { blob.visible = true; const u = clamp((tt - SPLASH + 0.28) / 0.3), h = headW(hero), f = add(h, [0, -0.08, 0.2]), s0 = [cup.g.position.x, TY + 0.12, cup.g.position.z]; blob.position.set(lerp(s0[0], f[0], u), lerp(s0[1], f[1], u) + 0.25 * Math.sin(u * PI), lerp(s0[2], f[2], u)); blob.scale.set(1 + 0.6 * u, 1.4 - 0.4 * u, 1 + 0.6 * u); }
      }
      if (id === 'sn1' || id === 'sn2') {
        bag.g.visible = true; const opened = smooth(u01(tt, BAGOPEN, BAGOPEN + 0.18)); bag.open(opened);
        if (id === 'sn1') { const h = handW(attendant, 1), hh = handW(hero, 1), u = smooth(u01(tt, t.snack - 0.1, t.snack + 0.25)); bag.g.position.set(lerp(h[0], hh[0], u), lerp(h[1], hh[1], u) - 0.08, lerp(h[2], hh[2], u)); bag.g.rotation.set(0, PI + 0.3, 0); }
        else { const hh = handW(hero, 1), tip = smooth(u01(tt, PRETZ - 0.25, PRETZ)); bag.g.position.set(hh[0], hh[1] - 0.04, hh[2] + 0.02); bag.g.rotation.set(0, PI * 0.9, -2.4 * tip); }
        if (id === 'sn2' && tt > PRETZ) { pretzel.visible = true; const hl = handW(hero, -1), u = clamp((tt - PRETZ) / 0.22), b = bag.g.position; pretzel.position.set(lerp(b.x, hl[0], u), lerp(b.y + 0.1, hl[1] + 0.06, u) + 0.06 * Math.sin(u * PI), lerp(b.z, hl[2] + 0.02, u)); pretzel.rotation.set(-0.6 + (1 - u) * 6, 0.3, 0); pretzel.scale.setScalar(1 + 0.15 * Math.exp(-(tt - PRETZ - 0.22) * 10) * (u >= 1 ? 1 : 0)); }
      }
      if (reveal || id === 'cooked' || id === 'open' || id === 'photo' || id === 'pen' || id === 'fbd' || id === 'page') {
        stack.visible = true; const fall = id === 'tc2' ? u01(tt, STACKDROP - 0.22, STACKDROP) : 1;
        if (id === 'tc1' || (id === 'tc2' && tt < STACKDROP - 0.22)) { const h = handW(teacher, -1), h2 = handW(teacher, 1); stack.position.set((h[0] + h2[0]) / 2, (h[1] + h2[1]) / 2 - 0.05, (h[2] + h2[2]) / 2); stack.rotation.set(0.2, PI + 0.2, 0); }
        else { const top = [tray[0], TY, tray[2]], hh = id === 'tc2' ? [handW(teacher, -1), handW(teacher, 1)] : null, from = hh ? [(hh[0][0] + hh[1][0]) / 2, (hh[0][1] + hh[1][1]) / 2 - 0.05, (hh[0][2] + hh[1][2]) / 2] : top; stack.position.set(lerp(from[0], top[0], fall * fall), lerp(from[1], top[1], fall * fall), lerp(from[2], top[2], fall * fall)); stack.rotation.set(0, PI + 0.04, 0); if (id === 'tc2' && tt > STACKDROP) { const [sx, sy] = squash(tt, STACKDROP, 0.25); stack.scale.set(sx, sy, sx); } else stack.scale.set(1, 1, 1); }
        imprint.visible = (id === 'tc3' && tt > STAMP) || ['cooked', 'open', 'photo'].includes(id); imprint.scale.setScalar(id === 'tc3' && tt > STAMP ? 1 + 0.4 * Math.exp(-(tt - STAMP) * 14) : 1);
      }
      // the laptop on the empty middle seat's tray
      const lidOpen = ['open', 'screen', 'photo', 'solve', 'pen', 'fbd', 'page', 'fold'].includes(id);
      if (lidOpen) {
        laptop.g.visible = true; const tr4 = TRAY(4); laptop.g.position.set(tr4[0] - 0.02, TY, tr4[2] - 0.07); laptop.g.rotation.set(0, PI - 0.25, 0);
        laptop.hinge.rotation.x = id === 'open' ? lerp(PI / 2 - 0.02, -0.12, easeOutBack(u01(tt, LIDO0, LIDO1))) : -0.12;
      }
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 - 0.2 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      if (tt > t.so - 0.2) { sheet.draw(writeP(tt)); screen.draw({ mode, k }); } else sheet.draw(0);
      if (id === 'screen' || id === 'solve') { for (const [r, c] of [[2, 3], [2, 4], [3, 3], [3, 4]]) CAB.rows[r * 6 + c].visible = false; }
      // the photo insert: a hand holding a phone over the sheet
      if (id === 'photo') { shotHand.visible = true; const u = smooth(u01(tt, t.one3 - 0.1, t.photo - 0.05)); shotHand.position.set(tray[0] - 0.02, TY + lerp(0.42, 0.3, u), tray[2] + lerp(0.35, 0.12, u)); shotHand.rotation.set(0.1, PI, 0); flashSpr.material.opacity = tt > FLASH ? 1 - u01(tt, FLASH, FLASH + 0.25) : 0; }
      // the sheet lies flat on the stack for the pen shots; the pen writes (the tip glides between strokes)
      if (id === 'pen' || id === 'fbd' || id === 'page' || id === 'fold') {
        const fold = id === 'fold' ? smooth(u01(tt, FOLD0, FOLD1)) : 0;
        if (fold < 0.97) { const up = id === 'fold' ? smooth(u01(tt, FOLD0 - 0.15, FOLD0 + 0.35)) : 0, f2 = smooth(u01(tt, FOLD0 + 0.35, FOLD1)); flatSheet.visible = true; flatSheet.position.set(lerp(tray[0], HOLD[0], up), lerp(TY + 0.052, HOLD[1], up), lerp(tray[2], HOLD[2], up)); flatSheet.rotation.set(lerp(-PI / 2, -0.15, up) + f2 * 0.6, f2 * 9, PI * (1 - up)); flatSheet.scale.set(1 - 0.85 * f2, 1 - 0.45 * f2, 1); }
        stack.visible = id !== 'fold'; if (stack.visible) { stack.position.set(tray[0], TY - 0.002, tray[2]); stack.rotation.set(0, PI, 0); stack.scale.set(1, 1, 1); }
        if (id !== 'fold') flatSheet.position.y = TY + 0.054;
        pen.g.visible = (id === 'pen' || id === 'fbd' || id === 'page') && tt > PEN0 && tt < WRITE1 + 0.2;
        if (pen.g.visible) {
          const tip = sheetTipAt(writeP(tt)), tw = sheetToW(tip[0], tip[1]), lp = laptop.g.position, from = [lp.x, lp.y + 0.3, lp.z], u = smooth(u01(tt, PEN0, WRITE0));
          const scrib = tt > WRITE0 ? 0.003 * Math.sin(tt * 60) : 0;
          pen.g.position.set(lerp(from[0], tw[0], u) + scrib, lerp(from[1], tw[1] + 0.003, u) + (1 - u) * 0.15 * Math.sin(u * PI), lerp(from[2], tw[2], u)); pen.g.rotation.set(0.55, -0.3, -0.35); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tt * 20);
        }
      }
      if (id === 'fold' && tt > FOLD1 - 0.04 || id === 'fly' || id === 'clap') {
        paperPlane.visible = true;
        if (id === 'fold' || tt < LAUNCH) { paperPlane.position.set(HOLD[0], HOLD[1] + 0.02 * Math.sin(tt * 6), HOLD[2]); paperPlane.rotation.set(0.25, PI / 2 + 0.5, 0.15); aPlus.visible = false; }
        else if (tt < CATCH) { const u = planeU(tt), p = flyCurve.getPoint(u), d = flyCurve.getTangent(Math.min(0.999, u)); paperPlane.position.copy(p); paperPlane.rotation.set(0, Math.atan2(-d.z, d.x), Math.asin(clamp(d.y, -1, 1)) * 0.8); paperPlane.rotateX(0.5 * Math.sin(u * TAU)); aPlus.visible = false; }
        else { const h = headW(teacher), wob = 0.12 * Math.exp(-(tt - CATCH) * 6) * Math.sin((tt - CATCH) * 30); paperPlane.position.set(h[0] + 0.04, h[1] + 0.32, h[2] + 0.02); paperPlane.rotation.set(0.95 + wob, -0.35, -0.55); aPlus.visible = tt > CATCH + 0.15; aPlus.scale.setScalar(aPlus.visible ? easeOutBack(u01(tt, CATCH + 0.15, CATCH + 0.4)) * 1.5 : 1); }
      }
    }

    // ----- camera
    const cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    if (camUp) { const up = V(0, 1, 0).applyQuaternion(air.g.quaternion); studio.camera.up.copy(up); } else studio.camera.up.set(0, 1, 0);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    if (sh.set === 'cab' && (id === 'tb1' || id === 'tb3')) { studio.camera.position.y += 0.02 * Math.sin(tt * 23) * Math.sin(tt * 7.3); studio.camera.rotation.z += 0.012 * Math.sin(tt * 17); }
    studio.fill.intensity = sh.set === 'af' ? 0.45 : 0.6; studio.fill.distance = 8;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 062-fword-airplanes --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['you', hero], ['the teacher', teacher], ['the pilot', pilot], ['the attendant', attendant], ['the officer', officer], ['the ramp agent', crew], ...PAX.map((f, i) => ['passenger ' + (i + 1), f])];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of names) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}
