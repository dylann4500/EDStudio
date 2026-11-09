// 058 — Scribe promo: "How to fucking survive fucking finals week", the deadpan explainer where the narrator puts "fucking" in front
// of every other word (the user's pick, Nov 8). Six steps, one toon gag each: the whole coffee pot (an eye that won't stop twitching),
// moving into the library (sleeping bag = bed, pizza tower = kitchen), the study group (five people, one pizza, zero studying), six
// hundred flashcards that bury you, and then the obstacle (~50 % in): the professor wants forty problems HANDWRITTEN by midnight.
// Scribe clears it, shown for real: one photo of the worksheet → Scribe solves all forty → writes them in YOUR handwriting stroke by
// stroke (Scribe's own demo glyph set, videos/049-scribe-promo/hand.json) → the professor holds it next to your old homework: a match,
// A+. Callback: the study group is still buried in flashcards. Step six: sleep. Scribe end card.
// Toon look (engine/build cast, word-keyed gags, impact kicks, 60 fps + blur, ElevenLabs Adam v3 at tempo 1.6) with hard cuts between
// framings (docs/PROMO.md: cuts are cheap in a promo). On screen the f-word is F*CKING in its own colour (script.json swap/wordColor).
// Product facts (the Scribe repo README + tryscribe.ink, Nov 2026): photo/PDF upload → worked solutions written in your handwriting,
// learned once from a practice sheet, drawn stroke by stroke like a pen → a PDF; free plan to start ("10 free assignments", site hero).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, smooth, rng, mk } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad, drop } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeSpecs, cardTex } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice, makePen, D as LD } from '@engine/build/library.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { makeMug } from '@engine/props.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const hop = (t, t0, t1, a, b, h) => { const u = clamp((t - t0) / (t1 - t0)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4 * h * u * (1 - u), lerp(a[2], b[2], u)]; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------------------------------------------------------------- word times
  const t = {
    f1: W('hook', 'fucking', 1), f2: W('hook', 'fucking', 2), finals: W('hook', 'finals'), week: W('hook', 'week'),
    step1: W('coffee', 'step'), one1: W('coffee', 'one'), coffee: W('coffee', 'coffee'), not: W('coffee', 'not'), cup: W('coffee', 'cup'), whole: W('coffee', 'whole'), pot: W('coffee', 'pot'), now1: W('coffee', 'now'), eye: W('coffee', 'eye'), this: W('coffee', 'this'),
    step2: W('library', 'step'), library: W('library', 'library'), bed: W('library', 'bed'), kitchen: W('library', 'kitchen'), live: W('library', 'live'), now2: W('library', 'now'),
    step3: W('group', 'step'), study: W('group', 'study'), five: W('group', 'five'), people: W('group', 'people'), oneP: W('group', 'one'), pizza: W('group', 'pizza'), zero: W('group', 'zero'), studying: W('group', 'studying'),
    step4: W('cards', 'step'), cards1: W('cards', 'flashcards'), six: W('cards', 'six'), cards2: W('cards', 'flashcards', 2), theW: W('cards', 'the'), win: W('cards', 'win'),
    step5: W('prof', 'step'), professor: W('prof', 'professor'), forty: W('prof', 'forty'), problems: W('prof', 'problems'), all: W('prof', 'all'), handwritten: W('prof', 'handwritten'), due: W('prof', 'due'), midnight: W('prof', 'midnight'),
    youre: W('cooked', 'youre'), cooked: W('cooked', 'cooked'),
    so: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), oneS: W('scribe', 'one'), photo: W('scribe', 'photo'), it: W('scribe', 'it'), solves: W('scribe', 'solves'), forty2: W('scribe', 'forty'),
    then: W('hand', 'then'), writes: W('hand', 'writes'), yourH: W('hand', 'your'), handwriting: W('hand', 'handwriting'), stroke: W('hand', 'stroke'), stroke2: W('hand', 'stroke', 2),
    theM: W('match', 'the'), checks: W('match', 'checks'), thats: W('match', 'thats'), hw2: W('match', 'handwriting'), aW: W('match', 'a'), plus: W('match', 'plus'),
    yourF: W('friends', 'your'), still: W('friends', 'still'), cards3: W('friends', 'flashcards'),
    step6: W('sleep', 'step'), six6: W('sleep', 'six'), sleep: W('sleep', 'sleep'),
  };
  const ENDCARD = t.sleep + 0.55;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the worksheet (finals review) + the app + your old homework
  const sheet = makeSheet(G, { seed: 58, name: 'Sam', title: 'MATH 1A · FINAL REVIEW', note: 'Due Dec 12, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 7', problems: [
    { q: '1.  d/dx [ x³ − 5x ]', a: '= 3x^2 - 5' },
    { q: '2.  ∫ 6x² dx', a: '= 2x^3 + C' },
    { q: '3.  lim (x→2)  (x² − 4) / (x − 2)', a: '= x + 2 → 4' },
    { q: '4.  d/dx [ sin(2x) ]', a: '= 2cos(2x)' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  ∫ from 0 to 1 of 3x² dx', a: '= 1' },
  ] });
  const old = makeSheet(G, { seed: 12, name: 'Sam', title: 'MATH 1A · PROBLEM SET 11', note: 'Due Dec 5, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 5', problems: [
    { q: '1.  d/dx [ 4x² + x ]', a: '= 8x + 1', pre: true },
    { q: '2.  ∫ 2x dx', a: '= x^2 + C', pre: true },
    { q: '3.  lim (x→3)  (x² − 9) / (x − 3)', a: '= 6', pre: true },
    { q: '4.  d/dx [ cos x ]', a: '= -sin x', pre: true },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true, pre: true },
    { q: '6.  ∫ from 0 to 2 of x dx', a: '= 2', pre: true },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Sam' });

  // ---------------------------------------------------------------- sets: library (origin), office, kitchen (parked far apart)
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon });
  const OFF = buildOffice(studio), OO = [60, 0, 0]; OFF.root.position.set(...OO);
  const KIT = buildKitchen(studio), KO = [120, 0, 0]; KIT.root.position.set(...KO);
  const L = (x, y, z) => [x, y, z], O = (x, y, z) => [OO[0] + x, OO[1] + y, OO[2] + z], Kp = (x, y, z) => [KO[0] + x, KO[1] + y, KO[2] + z];
  const Y = LD.deskY;
  LIB.jack.visible = false;   // finals week is December: no rotting jack-o'-lantern
  // the library's own sleeping bag + pillow are replaced by the hero's bed (below); the November calendar becomes December/FINALS
  LIB.root.traverse((o) => {
    if (!o.isMesh) return; const p = o.geometry.parameters || {};
    if (o.geometry.type === 'CapsuleGeometry' && p.radius === 0.25) o.visible = false;
    if (o.geometry.type === 'SphereGeometry' && p.radius === 0.22) o.visible = false;
    if (o.geometry.type === 'PlaneGeometry' && p.width === 0.62 && p.height === 0.72) o.material.map = tex(400, 460, (c, w, h) => {
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fbf'; c.fillRect(0, 0, w, 80); c.fillStyle = '#fff'; c.font = '600 46px Inter, Arial'; c.textAlign = 'center'; c.fillText('DECEMBER', w / 2, 56);
      c.font = '500 26px Inter, Arial';
      for (let d = 0; d < 31; d++) { const x = 30 + (d % 7) * 52, y = 120 + Math.floor(d / 7) * 64; c.fillStyle = '#333'; c.fillText(String(d + 1), x + 12, y + 24); if (d < 11) { c.strokeStyle = '#c1121f'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 32, y + 36); c.moveTo(x + 32, y); c.lineTo(x - 6, y + 36); c.stroke(); } }
      c.strokeStyle = '#e2302f'; c.lineWidth = 7; c.beginPath(); c.ellipse(30 + 4 * 52 + 12, 120 + 1 * 64 + 16, 150, 34, 0, 0, TAU); c.stroke();
      c.fillStyle = '#e2302f'; c.font = '700 40px Fredoka, Arial'; c.fillText('FINALS!!', w / 2 + 60, 120 + 3 * 64 + 4);
    });
  });
  // kitchen: hide the front chair (its sitter would show the lens his back); remember the window view for night
  KIT.root.updateMatrixWorld(true);
  let kitView = null; KIT.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 3 && o.material.isMeshBasicMaterial) kitView = o; });
  KIT.chairs[3].visible = false;

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const hero = mk1({ shirt: 0x3a8f5c, pants: 0x3d4250, hair: 0x2b1d14, hairStyle: 'messy', skin: 0xe8b48a });
  { const hood = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.07, 10, 20), hero.M.shirt); hood.position.set(0, 0.36, -0.1); hood.rotation.x = PI / 2 - 0.55; hood.scale.set(0.95, 0.95, 0.8); hero.armL.g.parent.add(hood); }
  const prof = mk1({ shirt: 0x7a5a3a, pants: 0x3d3d3d, hair: 0xd9d9d9, hairStyle: 'side', mustache: true, skin: 0xf2c29a });
  { const specs = makeSpecs(); prof.head.add(specs); specs.position.set(0, 0.05, 0.262); const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), std(0xc1121f, 0.5)); bow.position.set(0, 0.36, 0.13); prof.armL.g.parent.add(bow); }
  const friends = [
    mk1({ shirt: 0xe2574c, pants: 0x34495e, hair: 0x1a1a1a, hairStyle: 'side', skin: 0x9c6644 }),
    mk1({ shirt: 0xf2b632, pants: 0x4a3a2a, hair: 0xc8873a, hairStyle: 'tuft', skin: 0xf6d2b0, hat: 'cap', hatColor: 0x2f6fd1 }),
    mk1({ shirt: 0x8e5bd0, pants: 0x2f3e5a, hair: 0x5a3216, hairStyle: 'side', skin: 0xd99b6c }),
    mk1({ shirt: 0x3fb0c9, pants: 0x3d3d3d, hair: 0xe0c070, hairStyle: 'messy', skin: 0xf2c29a }),
  ];
  { const s = makeSpecs(); friends[2].head.add(s); s.position.set(0, 0.05, 0.262); const bun = mk(new THREE.SphereGeometry(0.11, 14, 10), friends[2].M.hair, friends[2].head, 0, 0.2, -0.2); bun.castShadow = true; }
  const all = [hero, prof, ...friends];
  const eyeLids = (toon) => toon.head.children.filter((c) => c.isGroup && c.children.length === 4).map((g) => g.children[2]);
  const heroLids = eyeLids(hero);
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const handW = (toon, s) => { toon.root.updateMatrixWorld(true); return toon.hand(s).getWorldPosition(V(0, 0, 0)).toArray(); };

  // ---------------------------------------------------------------- props
  const paperM = std(0xf6f3ea, 0.9);
  // hook: two towers of textbooks on the desk that grow on every f-word
  const BOOKC = [0xb83a3a, 0x2f5ea8, 0x3f8f5a, 0xd9a441, 0x6b3fa0, 0x2a2f36, 0xc96a3a, 0x3a7c8c];
  const towers = [[-0.5, -0.86, 9], [0.52, -0.8, 9]].map(([x, z, n], ti) => Array.from({ length: n }, (_, k) => {
    const g = new THREE.Group(); LIB.root.add(g); const R2 = rng(ti * 31 + k);
    const w = 0.3 + R2() * 0.08, d = 0.22 + R2() * 0.05, h = 0.05 + R2() * 0.035;
    mk(new THREE.BoxGeometry(w, h, d), std(BOOKC[(k + ti * 3) % 8], 0.7), g, 0, h / 2, 0); mk(new THREE.BoxGeometry(w - 0.02, h - 0.012, d + 0.004), paperM, g, 0.012, h / 2, 0).castShadow = false;
    return { g, x, z, h, rot: (R2() - 0.5) * 0.4 };
  }));
  for (const tw of towers) { let y = Y; for (const b of tw) { b.y = y; y += b.h; } }
  const BOOKT = [t.f1, t.f2, t.finals, t.week].flatMap((x, i) => [x - 0.02, x + 0.1 + 0.03 * i]);
  // the coffee: a mug + a giant carafe
  const mug = makeMug(0xd2483f); mug.scale.setScalar(1.8); scene.add(mug);
  const carafe = new THREE.Group(); scene.add(carafe);
  { mk(new THREE.CylinderGeometry(0.15, 0.13, 0.36, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xdfefff, roughness: 0.05, transmission: 0.0, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), carafe, 0, 0.18, 0);
    mk(new THREE.CylinderGeometry(0.155, 0.155, 0.06, 24), std(0x1a1a1a, 0.4), carafe, 0, 0.37, 0); mk(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 24), std(0x1a1a1a, 0.4), carafe, 0, 0.005, 0);
    const hdl = mk(new THREE.TorusGeometry(0.08, 0.02, 8, 16, PI), std(0x1a1a1a, 0.4), carafe, 0.15, 0.2, 0); hdl.rotation.z = -PI / 2;
    const lbl = mk(new THREE.PlaneGeometry(0.18, 0.07), new THREE.MeshBasicMaterial({ map: cardTex('XXL', { bg: 'rgba(0,0,0,0)', fg: '#ffd23f', w: 256, h: 100, px: 84 }), transparent: true }), carafe, 0, 0.27, 0.152); lbl.castShadow = false; }
  const brew = mk(new THREE.CylinderGeometry(0.135, 0.12, 1, 24), std(0x3b2010, 0.25), carafe, 0, 0, 0); brew.castShadow = false;
  // the library life: the hero's sleeping bag + pillow, a pizza-box tower, a microwave on books, a toothbrush
  const BED = L(-1.95, 0, 1.0);
  const bag = new THREE.Group(); bag.position.set(...BED); LIB.root.add(bag);
  { const b = mk(new THREE.CapsuleGeometry(0.27, 1.05, 6, 16), std(0x2f6fd1, 0.75), bag, 0.25, 0.15, 0); b.rotation.z = PI / 2; b.scale.set(0.8, 1, 1.0);
    const flap = mk(new THREE.CapsuleGeometry(0.255, 0.55, 6, 14), std(0x3b84e8, 0.75), bag, 0.05, 0.27, 0.03); flap.rotation.z = PI / 2; flap.scale.set(0.35, 1, 0.95);
    const zip = mk(new THREE.BoxGeometry(1.1, 0.012, 0.02), std(0xd8d8d8, 0.3, { metalness: 0.6 }), bag, 0.3, 0.25, 0.24);
    const pil = mk(new THREE.SphereGeometry(0.2, 16, 12), std(0xf0ece2, 0.9), bag, -0.62, 0.1, 0); pil.scale.set(0.9, 0.45, 1.25); void zip; }
  const pizzaTex = tex(256, 256, (c, w, h) => { c.fillStyle = '#d9b98a'; c.fillRect(0, 0, w, h); c.fillStyle = '#c1121f'; c.font = '700 54px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('PIZZA', w / 2, h / 2 + 4); c.font = '600 26px Fredoka, Arial'; c.fillText('★ HOT ★', w / 2, h / 2 + 46); });
  const boxM = [std(0xcfae7c, 0.9), std(0xcfae7c, 0.9), std(0xffffff, 0.9, { map: pizzaTex }), std(0xcfae7c, 0.9), std(0xcfae7c, 0.9), std(0xcfae7c, 0.9)];
  for (let i = 0; i < 9; i++) { const R2 = rng(70 + i); const m = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), boxM); m.position.set(1.7 + (R2() - 0.5) * 0.07, 0.235 + i * 0.052, -1.9 + (R2() - 0.5) * 0.07); m.rotation.y = (R2() - 0.5) * 0.35; m.castShadow = true; LIB.root.add(m); }
  const mw = new THREE.Group(); mw.position.set(2.35, 0, -1.65); mw.rotation.y = -0.5; LIB.root.add(mw);
  { for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.42, 0.11, 0.32), std(BOOKC[i], 0.7), mw, (i % 2) * 0.02, 0.055 + i * 0.11, 0);
    mk(new THREE.BoxGeometry(0.5, 0.3, 0.36), std(0xeeeeee, 0.4), mw, 0, 0.59, 0); mk(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0x223040, roughness: 0.1, emissive: 0xffb050, emissiveIntensity: 0.25 }), mw, -0.06, 0.59, 0.181);
    mk(new THREE.BoxGeometry(0.08, 0.2, 0.01), std(0x333333, 0.4), mw, 0.18, 0.59, 0.181);
    for (let i = 0; i < 3; i++) { mk(new THREE.CylinderGeometry(0.055, 0.045, 0.1, 14), std([0xe2302f, 0xffd23f, 0xe2302f][i], 0.5), mw, -0.15 + i * 0.13, 0.79, 0.02); } }
  const brush = new THREE.Group(); { mk(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), std(0x3ec7ff, 0.4), brush, 0, 0.0, 0); mk(new THREE.BoxGeometry(0.018, 0.03, 0.02), std(0xffffff, 0.6), brush, 0, 0.09, 0.012); } hero.hand(1).add(brush); brush.position.set(0, 0.0, 0.05); brush.rotation.x = 1.2;
  const foam = new THREE.Group(); hero.head.add(foam); for (let i = 0; i < 7; i++) mk(new THREE.SphereGeometry(0.022 + (i % 3) * 0.006, 8, 6), std(0xffffff, 0.6), foam, -0.06 + i * 0.02, -0.15 - (i % 2) * 0.02, 0.24 - Math.abs(i - 3) * 0.008);
  // flashcards: one instanced pool, placed in world space per shot (the desk avalanche, the study group buried at night)
  const cardT = tex(256, 154, (c, w, h) => { c.fillStyle = '#fffdf4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e2574c'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 30); c.lineTo(w, 30); c.stroke(); c.strokeStyle = 'rgba(80,130,200,.5)'; c.lineWidth = 2; for (let y = 56; y < h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.fillStyle = '#26346b'; c.font = '600 28px Fredoka, Arial'; c.fillText('d/dx  =  ???', 30, 92); });
  const NC = 700, cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.15, 0.09), new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.8, side: THREE.DoubleSide }), NC);
  cards.frustumCulled = false; cards.castShadow = true; cards.receiveShadow = true; scene.add(cards);
  const CR = rng(580), CARD = Array.from({ length: NC }, () => ({ a: CR() * TAU, r: Math.sqrt(CR()), ex: CR(), ry: CR() * TAU, rx: (CR() - 0.5) * 0.9, rz: (CR() - 0.5) * 0.9, sp: (CR() - 0.5) * 14, dx: (CR() - 0.5) * 0.8, dz: (CR() - 0.5) * 0.8, k: CR() }));
  CARD.sort((a, b) => a.k - b.k);
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E4 = new THREE.Euler(), S1 = V(1, 1, 1), P4 = V(0, 0, 0);
  const handCard = mk(new THREE.PlaneGeometry(0.15, 0.09), new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.8, side: THREE.DoubleSide }), hero.hand(1), 0, -0.02, 0.09); handCard.rotation.set(-0.3, 0, 0.1);
  const deckM = new THREE.Group(); LIB.root.add(deckM); { for (let i = 0; i < 6; i++) mk(new THREE.BoxGeometry(0.15, 0.03, 0.09), std(0xfffdf4, 0.8), deckM, 0, 0.015 + i * 0.03, 0); } deckM.position.set(-0.32, Y, -0.78);
  // the study group's table: textbooks, a pizza box that opens, slices, phones
  const TT = Kp(0.4, 0.75, -0.4);
  const pizza = new THREE.Group(); pizza.position.set(TT[0] + 0.0, TT[1], TT[2] + 0.05); scene.add(pizza);
  const pizzaLid = new THREE.Group(); pizzaLid.position.set(0, 0.05, -0.22); pizza.add(pizzaLid);
  { mk(new THREE.BoxGeometry(0.45, 0.04, 0.45), std(0xcfae7c, 0.9), pizza, 0, 0.02, 0); const lid = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.012, 0.45), boxM); lid.position.set(0, 0, 0.22); pizzaLid.add(lid);
    const pie = mk(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), std(0xf2c45a, 0.6), pizza, 0, 0.05, 0); pie.castShadow = false;
    mk(new THREE.TorusGeometry(0.2, 0.018, 8, 32), std(0xc98a3a, 0.7), pizza, 0, 0.055, 0).rotation.x = PI / 2;
    const R2 = rng(9); for (let i = 0; i < 9; i++) { const a = R2() * TAU, r = 0.04 + R2() * 0.12; mk(new THREE.CylinderGeometry(0.025, 0.025, 0.008, 12), std(0xb8322a, 0.5), pizza, Math.cos(a) * r, 0.064, Math.sin(a) * r); } }
  const sliceGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-0.07, 0.17); s.quadraticCurveTo(0, 0.2, 0.07, 0.17); s.lineTo(0, 0); return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false }); })();
  const sliceM = std(0xf2c45a, 0.6);
  const slices = friends.concat([hero]).map((f) => { const s = new THREE.Mesh(sliceGeo, sliceM); f.hand(-1).add(s); s.position.set(0, -0.05, 0.06); s.rotation.set(-1.2, 0, PI); return s; });
  const phones = friends.concat([hero]).map((f) => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.075, 0.15, 0.012), std(0x15161a, 0.3), g); const sc = mk(new THREE.PlaneGeometry(0.065, 0.13), new THREE.MeshBasicMaterial({ color: 0x9fd2ff, toneMapped: false }), g, 0, 0, 0.007); sc.castShadow = false; f.hand(1).add(g); g.position.set(0, -0.06, 0.07); g.rotation.set(-0.9, 0, 0); return g; });
  const tableBooks = [[-0.42, -0.12, 0.3, 0x2f5ea8], [0.38, -0.2, -0.4, 0x3f8f5a], [-0.1, 0.25, 0.15, 0xb83a3a], [0.5, 0.2, 0.6, 0xd9a441]].map(([x, z, r, c]) => {
    const g = new THREE.Group(); g.position.set(TT[0] + x, TT[1], TT[2] + z); g.rotation.y = r; scene.add(g);
    mk(new THREE.BoxGeometry(0.34, 0.012, 0.26), std(c, 0.7), g, 0, 0.006, 0); mk(new THREE.BoxGeometry(0.32, 0.02, 0.24), paperM, g, 0, 0.022, 0); return g; });
  // the professor's stack of forty problems + his rubber stamp + the red imprint
  const stack = new THREE.Group(); scene.add(stack);   // world coords (O(...)): NOT inside the parked office root
  { mk(new THREE.BoxGeometry(0.43, 0.12, 0.56), paperM, stack, 0, 0.06, 0); const top = mk(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), stack, 0, 0.121, 0); top.rotation.x = -PI / 2; }
  const imprint = mk(new THREE.PlaneGeometry(0.4, 0.13), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), stack, 0, 0.124, 0.05);
  imprint.rotation.set(-PI / 2, 0, 0.22);
  const stamper = new THREE.Group(); prof.hand(1).add(stamper); stamper.position.set(0, -0.08, 0.02);
  { mk(new THREE.SphereGeometry(0.04, 12, 8), std(0x5a3a22, 0.5), stamper, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), std(0x5a3a22, 0.5), stamper, 0, -0.01, 0); mk(new THREE.BoxGeometry(0.12, 0.04, 0.08), std(0xc1121f, 0.5), stamper, 0, -0.07, 0); }
  // match: the professor's two sheets (your old homework, the new one) + the A+
  const aPlus = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), new THREE.MeshBasicMaterial({ map: cardTex('A+', { bg: 'rgba(0,0,0,0)', fg: '#d0141e', w: 256, h: 190, px: 170 }), transparent: true, depthWrite: false }));
  const profSheets = [old, sheet].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.556), new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.85, side: THREE.DoubleSide })); scene.add(m); return m; });
  profSheets[1].add(aPlus); aPlus.position.set(0.0, 0.15, 0.004);
  // the A+ page taped up by the bed (the sleep shot)
  const trophy = mk(new THREE.PlaneGeometry(0.43, 0.556), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), LIB.root, -2.95, 0.62, 0.55); trophy.rotation.set(-0.12, 0.55, 0);
  { const a2 = aPlus.clone(); trophy.add(a2); a2.position.set(0.1, 0.17, 0.004); }
  // the Scribe pieces (as 049): the pen, the photo insert (a hand holding a phone), the solved-page stack
  const pen = makePen(); LIB.root.add(pen.g);
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), hero.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.26); shotHand.add(sleeve); shotHand.add(new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), hero.M.skin)); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { mk(new THREE.BoxGeometry(0.13, 0.016, 0.25), std(0x15161a, 0.3), camPhone); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0085, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0086, 0.1); camPhone.add(ui); }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  const stackPages = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), std(0xffffff, 0.85, { map: old.tex })); m.rotation.set(-PI / 2, 0, -0.1 + i * 0.04); LIB.stack.add(m); return m; });
  // Z's over the sleeper
  const zT = tex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.strokeStyle = '#1d2a5a'; c.lineWidth = 10; c.font = '110px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('Z', w / 2, h / 2 + 6); c.fillText('Z', w / 2, h / 2 + 6); });
  const zs = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false })); s.renderOrder = 8; scene.add(s); return s; });
  const dizzy = makeDizzy(scene, { r: 0.3 });

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 300, confetti: 500, spark: 300, glow: 60, smoke: 260, drops: 300, crumb: 200 }, nearFade: [0.35, 1.2] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.1, 0.18);   // the rhythm: every F*CKING lands with a tiny jolt
  // hook: books slam onto the towers
  BOOKT.forEach((bt, i) => { kick(bt + 0.2, 0.22, 0.25); fx.burst('dust', bt + 0.2, { pos: L(i % 2 ? 0.66 : -0.62, Y + 0.5, -0.8), n: 3, spread: 0.6, speed: [0.3, 0.7], size: [0.12, 0.22] }); });
  // coffee
  const TOSS = t.cup - 0.12, POT0 = t.whole - 0.1, CHUG0 = t.pot - 0.08, CHUG1 = t.now1 + 0.05;
  kick(t.cup + 0.25, 0.5); kick(POT0 + 0.1, 0.4); kick(t.pot, 0.35); kick(t.eye, 0.7);
  fx.stream('smoke', t.step1, TOSS, { pos: Kp(-0.72, 1.02, -1.28), rate: 7, size: [0.05, 0.1], speed: [0.15, 0.35], spread: 0.06, life: [0.6, 0.9], g: -0.8, color: 0xf2f2f2 });
  fx.burst('drops', t.cup + 0.3, { pos: Kp(-2.3, 1.0, -1.7), n: 12, color: 0x5a3216, speed: [0.8, 1.8], spread: 1.2, size: [0.02, 0.04] });
  fx.stream('smoke', POT0, CHUG1, { pos: Kp(-1.0, 1.5, -1.25), rate: 6, size: [0.08, 0.16], speed: [0.2, 0.5], spread: 0.15, life: [0.6, 1.0], g: -1.0, color: 0xf2f2f2 });
  fx.burst('drops', t.eye + 0.05, { pos: Kp(-1.0, 1.35, -1.3), n: 8, color: 0xbfe6ff, speed: [0.6, 1.3], spread: 0.8, size: [0.015, 0.025] });
  // library life
  kick(t.bed, 0.35); kick(t.kitchen, 0.35); kick(t.now2, 0.4);
  // group
  const LID0 = t.pizza - 0.25;
  kick(LID0 + 0.15, 0.4); kick(t.studying + 0.1, 0.7);
  fx.burst('spark', LID0 + 0.15, { pos: add(TT, [0, 0.15, 0.05]), n: 18, color: 0xfff1a8, speed: [0.5, 1.4], spread: 2.0 });
  fx.stream('smoke', LID0 + 0.1, t.zero + 0.4, { pos: add(TT, [0, 0.1, 0.05]), rate: 8, size: [0.06, 0.12], speed: [0.2, 0.5], spread: 0.15, life: [0.6, 1.0], g: -0.9, color: 0xf6f0e0 });
  // cards: the avalanche over the desk (the hero buried to the chin)
  const AV0 = t.six - 0.05, AV1 = t.win + 0.05, MC = L(0, 0, -1.15), MR = 1.05, MH = 1.28;
  kick(t.six + 0.1, 0.5); kick(t.cards2, 0.5); kick(t.win, 1.0); kick(t.win + 0.3, 0.4);
  fx.burst('dust', t.win, { pos: L(0, 0.8, -1.0), n: 12, spread: 1.5, speed: [0.6, 1.5], size: [0.3, 0.6], color: 0xe8e2d0 });
  // professor
  const SLAM = t.problems + 0.02, STAMP = t.handwritten + 0.05;
  kick(SLAM, 1.0); kick(STAMP, 0.9); kick(t.midnight, 0.35);
  fx.burst('confetti', SLAM, { pos: O(-0.2, 0.95, 0.5), n: 40, color: 0xffffff, speed: [1, 2.4], spread: 1.4, floor: 0.0 });
  fx.burst('dust', SLAM, { pos: O(-0.2, 0.85, 0.5), n: 8, spread: 1.4, speed: [0.5, 1.2], size: [0.2, 0.4], color: 0xe0d8c8 });
  fx.burst('spark', STAMP, { pos: O(-0.2, 0.96, 0.55), n: 16, color: 0xff6b6b, speed: [0.8, 2], spread: 1.6 });
  // cooked + Scribe (as 049)
  const LIDO0 = t.open - 0.05, LIDO1 = t.open + 0.3, FLASH = t.photo + 0.05, SCAN0 = FLASH + 0.15, SOLVE0 = t.it + 0.05, SOLVE1 = t.forty2 + 0.25;
  const PEN0 = t.then + 0.02, WRITE0 = t.yourH - 0.05, WRITE1 = t.stroke2 + 0.45;
  kick(t.cooked, 0.7); kick(LIDO1, 0.3); kick(FLASH, 0.35); kick(SOLVE1, 0.4);
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.1, { pos: L(0, 1.62, LD.seat[1]), rate: 16, size: [0.12, 0.25], speed: [0.3, 0.8], spread: 0.4, life: [0.7, 1.1], g: -1.5, color: 0xdddddd });
  const items = sheet.items, cum = []; { let a = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; cum.push(a); } }
  const N = sheet.total;
  const PK = [[WRITE0, 0], [t.stroke - 0.05, N * 0.45], [t.theM - 0.1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  fx.stream('spark', WRITE0, t.theM, { pos: L(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 18, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });
  // match
  kick(t.hw2, 0.6); kick(t.plus + 0.05, 1.0);
  fx.burst('confetti', t.plus + 0.05, { pos: O(0, 1.6, 0.6), n: 120, speed: [1.5, 3.5], spread: 1.2, floor: 0 });
  // friends + sleep
  kick(t.cards3, 0.6); kick(t.sleep, 0.25);

  // ---------------------------------------------------------------- the end card (Scribe) via the 049 HUD (only its end card is used)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: [[0, 0]], day: [[0, '']], feed: [], map: { shoreR: () => 1, spots: [], dots: () => [] },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- SHOTS (hard cuts; one gliding rail per framing)
  const SEAT = L(LD.seat[0], 0.145, LD.seat[1]), sheetW = L(LD.sheet[0], Y, LD.sheet[1]), clockW = L(1.2, 3.55, -3.96);
  const KH = Kp(-1.0, 0, -1.45);   // the hero at the kitchen counter
  const SEATS = [Kp(-0.55, 0.115, -0.4), Kp(1.35, 0.115, -0.4), Kp(0.4, 0.115, -1.15)];
  const STAND = [Kp(-0.12, 0, -1.68), Kp(0.95, 0, -1.7)];
  const face = (toon, off, lk = [0, -0.12, 0], fov = 40, push = 0, t0 = 0, t1 = 1) => (tt) => { const h = headW(toon), u = u01(tt, t0, t1); return { pos: add(h, [off[0], off[1], off[2] * (1 - push * u)]), look: add(h, lk), fov }; };
  const SHOTS = [
    { id: 'hook', t0: 0, set: 'lib', frames: [
      { t: 0, pos: L(0.3, 1.5, 1.25), look: L(0, 0.9, -1.25), fov: 46 },
      { t: t.step1 - 0.05, pos: L(0.18, 1.42, 0.55), look: L(0, 1.0, -1.25), fov: 44, stop: true } ] },
    { id: 'coffee', t0: t.step1, set: 'kit', frames: [
      { t: t.step1, pos: Kp(-0.55, 1.25, 1.15), look: Kp(-1.0, 0.8, -1.45), fov: 46 },
      { t: t.now1 - 0.1, pos: Kp(-0.7, 1.2, 0.55), look: Kp(-1.0, 0.86, -1.45), fov: 44, stop: true } ] },
    { id: 'eye', t0: t.now1 - 0.04, set: 'kit', cam: face(hero, [0.14, 0.02, 2.05], [0, -0.26, 0], 36, 0.2, t.now1, t.step2) },
    { id: 'libwide', t0: t.step2, set: 'lib', frames: [
      { t: t.step2, pos: L(2.8, 2.6, 3.6), look: L(-0.6, 0.7, -0.6), fov: 50 },
      { t: t.bed - 0.3, pos: L(1.8, 2.2, 3.4), look: L(-1.1, 0.6, -0.2), fov: 48, stop: true } ] },
    { id: 'bed', t0: t.bed - 0.28, set: 'lib', frames: [
      { t: t.bed - 0.28, pos: add(BED, [1.55, 2.0, 0.55]), look: add(BED, [-0.4, 0.0, 0.0]), fov: 42 },
      { t: t.kitchen - 0.25, pos: add(BED, [1.3, 1.8, 0.5]), look: add(BED, [-0.42, 0.02, 0.0]), fov: 42, stop: true } ] },
    { id: 'kitch', t0: t.kitchen - 0.22, set: 'lib', frames: [
      { t: t.kitchen - 0.22, pos: L(1.55, 1.25, 0.35), look: L(2.0, 0.6, -1.75), fov: 44 },
      { t: t.live - 0.2, pos: L(1.75, 1.15, 0.15), look: L(2.05, 0.6, -1.75), fov: 44, stop: true } ] },
    { id: 'live', t0: t.live - 0.18, set: 'lib', frames: [
      { t: t.live - 0.18, pos: L(-0.75, 1.3, 3.2), look: L(-1.45, 0.74, 0.7), fov: 44 },
      { t: t.step3 - 0.05, pos: L(-0.85, 1.25, 2.8), look: L(-1.45, 0.76, 0.7), fov: 44, stop: true } ] },
    { id: 'group', t0: t.step3, set: 'kit', mood: 'day', frames: [
      { t: t.step3, pos: Kp(0.45, 1.75, 2.9), look: Kp(0.4, 0.82, -0.7), fov: 50 },
      { t: t.five - 0.1, pos: Kp(0.42, 1.6, 2.4), look: Kp(0.4, 0.84, -0.7), fov: 50, stop: true } ] },
    { id: 'faces', t0: t.five - 0.06, set: 'kit', mood: 'day', frames: [
      { t: t.five - 0.06, pos: Kp(-0.25, 1.45, 1.9), look: Kp(-0.2, 0.92, -0.8), fov: 42 },
      { t: t.oneP - 0.1, pos: Kp(1.05, 1.45, 1.9), look: Kp(1.0, 0.92, -0.8), fov: 42, stop: true } ] },
    { id: 'pizza', t0: t.oneP - 0.06, set: 'kit', mood: 'day', frames: [
      { t: t.oneP - 0.06, pos: add(TT, [0.05, 0.66, 1.2]), look: add(TT, [0, 0.3, -0.45]), fov: 44 },
      { t: t.zero - 0.1, pos: add(TT, [0.05, 0.62, 1.0]), look: add(TT, [0, 0.3, -0.45]), fov: 44, stop: true } ] },
    { id: 'zero', t0: t.zero - 0.06, set: 'kit', mood: 'day', frames: [
      { t: t.zero - 0.06, pos: Kp(0.5, 1.5, 2.2), look: Kp(0.4, 0.84, -0.7), fov: 50 },
      { t: t.step4 - 0.05, pos: Kp(0.48, 1.45, 1.9), look: Kp(0.4, 0.86, -0.7), fov: 50, stop: true } ] },
    { id: 'cards', t0: t.step4, set: 'lib', frames: [
      { t: t.step4, pos: L(0.35, 1.4, 0.95), look: L(0, 0.86, -1.2), fov: 44 },
      { t: t.six - 0.1, pos: L(0.25, 1.36, 0.6), look: L(0, 0.9, -1.2), fov: 44, stop: true } ] },
    { id: 'avalanche', t0: t.six - 0.06, set: 'lib', frames: [
      { t: t.six - 0.06, pos: L(0.3, 1.5, 1.2), look: L(0, 0.86, -1.2), fov: 46 },
      { t: t.win - 0.1, pos: L(0.45, 2.0, 2.3), look: L(0, 0.8, -1.1), fov: 48, keep: true },
      { t: t.step5 - 0.05, pos: L(0.38, 1.75, 1.7), look: L(0, 0.9, -1.15), fov: 46, stop: true } ] },
    { id: 'prof', t0: t.step5, set: 'off', frames: [
      { t: t.step5, pos: O(0.22, 1.32, 3.0), look: O(0, 0.78, 0.0), fov: 46 },
      { t: t.forty - 0.1, pos: O(0.15, 1.3, 2.6), look: O(0, 0.8, 0.0), fov: 46, stop: true } ] },
    { id: 'slam', t0: t.forty - 0.06, set: 'off', frames: [
      { t: t.forty - 0.06, pos: O(0.35, 1.45, 2.4), look: O(-0.1, 0.8, 0.3), fov: 44 },
      { t: t.due - 0.1, pos: O(0.3, 1.4, 2.1), look: O(-0.1, 0.82, 0.35), fov: 44, stop: true } ] },
    { id: 'clock', t0: t.due - 0.06, set: 'lib', frames: [
      { t: t.due - 0.06, pos: add(clockW, [0.3, -0.35, 1.75]), look: add(clockW, [0.05, -0.08, 0]), fov: 42 },
      { t: t.youre - 0.1, pos: add(clockW, [0.2, -0.28, 1.4]), look: add(clockW, [0.05, -0.08, 0]), fov: 42, stop: true } ] },
    { id: 'cooked', t0: t.youre - 0.06, set: 'lib', cam: face(hero, [0.18, -0.02, 2.0], [0, -0.3, 0], 40, 0.1, t.youre, t.so) },
    { id: 'open', t0: t.so - 0.04, set: 'lib', frames: [
      { t: t.so - 0.04, pos: L(0.7, 1.4, 1.5), look: L(0.2, 0.92, -0.95), fov: 44 },
      { t: t.scribe - 0.15, pos: L(0.65, 1.38, 1.3), look: L(0.2, 0.92, -0.95), fov: 44, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.oneS - 0.04, set: 'lib', frames: [
      { t: t.oneS - 0.04, pos: add(sheetW, [0.35, 0.72, 0.85]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42 },
      { t: t.it - 0.1, pos: add(sheetW, [0.3, 0.68, 0.72]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42, stop: true } ] },
    { id: 'solve', t0: t.it - 0.04, set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'pen', t0: t.then - 0.04, set: 'lib', frames: [
      { t: t.then - 0.04, pos: L(0.05, 1.42, 0.75), look: L(0.05, 0.86, -0.8), fov: 46 },
      { t: t.yourH, pos: add(sheetW, [0.02, 0.48, 0.32]), look: add(sheetW, [-0.01, 0, -0.04]), fov: 44, stop: true } ] },
    { id: 'macro', t0: t.yourH + 0.02, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'match', t0: t.theM - 0.04, set: 'off', frames: [
      { t: t.theM - 0.04, pos: O(0.05, 1.28, 3.0), look: O(0, 0.84, 0.3), fov: 50 },
      { t: t.thats - 0.1, pos: O(0.03, 1.24, 2.65), look: O(0, 0.86, 0.35), fov: 50, keep: true, until: t.plus + 0.3 },
      { t: t.yourF - 0.05, pos: O(0.03, 1.26, 2.45), look: O(0, 0.88, 0.35), fov: 50, stop: true } ] },
    { id: 'friends', t0: t.yourF - 0.04, set: 'kit', mood: 'night', frames: [
      { t: t.yourF - 0.04, pos: Kp(0.45, 1.55, 2.5), look: Kp(0.4, 0.95, -0.7), fov: 50 },
      { t: t.step6 - 0.05, pos: Kp(0.42, 1.4, 1.75), look: Kp(0.4, 0.95, -0.7), fov: 48, stop: true } ] },
    { id: 'sleep', t0: t.step6 - 0.02, set: 'lib', frames: [
      { t: t.step6 - 0.02, pos: add(BED, [1.3, 1.8, 0.5]), look: add(BED, [-0.42, 0.0, 0.0]), fov: 42 },
      { t: ENDCARD + 1.5, pos: add(BED, [2.1, 3.0, 0.8]), look: add(BED, [-0.4, 0.0, 0.0]), fov: 46, stop: true } ] },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; if (s.frames) s.rail = makeRail(planRail(s.frames, { move: [0.35, 13], minHold: 0.6 })); });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // the screen insert: straight down the laptop screen's normal (the hero + the chair are hidden: a POV cheat)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) {
    LIB.laptop.scr.updateWorldMatrix(true, false); LIB.laptop.scr.getWorldPosition(scrP); LIB.laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq);
    const d = 1.5; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.02, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.19 - dy, scrP.z], fov: 40 };
  }
  // the macro follow-cam on the pen tip (smoothed so line breaks glide)
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  function macroCam(tt) {
    const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length);
    const g = 0.04 * u01(tt, t.stroke, t.theM);
    return { pos: add(m, [-0.06, 0.26 + g, 0.16 + g * 0.6]), look: add(m, [0.01, 0, -0.015]), fov: 42 };
  }

  // ---------------------------------------------------------------- per-frame
  let curSet = null;
  function setWorld(sh) {
    LIB.root.visible = sh.set === 'lib'; OFF.root.visible = sh.set === 'off'; KIT.root.visible = sh.set === 'kit';
    scene.fog = null;
    if (sh.set === 'lib') { scene.background = new THREE.Color(0x1a1410); renderer.toneMappingExposure = 1.08; scene.environmentIntensity = 0.3; }
    if (sh.set === 'off') { scene.background = new THREE.Color(0x2a241e); renderer.toneMappingExposure = 1.0; scene.environmentIntensity = 0.35; }
    if (sh.set === 'kit') {
      const night = sh.mood === 'night'; scene.background = new THREE.Color(night ? 0x0d1020 : 0xcfe3ef); renderer.toneMappingExposure = night ? 1.15 : 1.0; scene.environmentIntensity = night ? 0.2 : 0.45;
      KIT.lights.sun.intensity = night ? 0 : 2.2; KIT.lights.hemi.intensity = night ? 0.28 : 1.1; KIT.lights.pend.intensity = night ? 5.0 : 3.5;
      if (kitView) kitView.material.color.setHex(night ? 0x1c2448 : 0xffffff);
    }
    curSet = sh.set;
  }
  const hideAll = () => { for (const r of all) r.root.visible = false; mug.visible = false; carafe.visible = false; pizza.visible = false; tableBooks.forEach((b) => (b.visible = false)); stack.visible = false; zs.forEach((z) => (z.visible = false)); shotHand.visible = false; pen.g.visible = false; brush.visible = false; foam.visible = false; handCard.visible = false; slices.forEach((s) => (s.visible = false)); phones.forEach((p) => (p.visible = false)); profSheets.forEach((m) => (m.visible = false)); stamper.visible = false; deckM.visible = false; cards.count = 0; for (const tw of towers) for (const b of tw) b.g.visible = false; };
  const seated = { legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 } };
  const lying = (p) => ({ ...p, rx: -PI / 2, rotY: PI / 2, legL: { x: 0.05 }, legR: { x: 0.05 } });
  let nCards = 0;
  const putCard = (x, y, z, rx, ry, rz) => { if (nCards >= NC) return; M4.compose(P4.set(x, y, z), Q4.setFromEuler(E4.set(rx, ry, rz)), S1); cards.setMatrixAt(nCards++, M4); };

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; setWorld(sh); hideAll(); nCards = 0;
    LIB.laptop.hinge.rotation.x = PI / 2 - 0.02; LIB.scrL.intensity = 0; LIB.chair.visible = true; LIB.setClock(10, 20);
    const sw = Math.sin(tt * 2.1), sw2 = Math.sin(tt * 1.7 + 1);

    // ----- the hero
    if (id === 'hook') {
      for (const tw of towers) { let k = 0; for (const b of tw) { const tb = k < 5 ? -1 : BOOKT[Math.min(BOOKT.length - 1, (k - 5) * 2 + (tw === towers[1] ? 1 : 0))]; b.g.visible = tt > tb - 0.25; b.g.position.set(b.x, b.y + (tb > 0 ? drop(tt, tb - 0.2, 0.9, 0.2) : 0), b.z); b.g.rotation.y = b.rot; k++; } }
      hero.root.visible = true;
      hero.set({ x: SEAT[0], y: SEAT[1], z: SEAT[2], ...seated, lean: 0.3, armL: { x: -0.4, z: 0.4, el: 1.5 }, armR: { x: -1.2, z: 0.2, el: 2.4 }, head: { x: 0.15, z: 0.12 + 0.03 * sw }, eyes: 'half', mouth: 'flat', brows: 0.6, look: [0, 0.3], faceTint: [0x8a7aa0, 0.12], t: tt });
      sheet.draw(0);
    }
    KIT.chairs[0].visible = !(id === 'coffee' || id === 'eye');
    if (sh.set === 'kit' && (id === 'coffee' || id === 'eye')) {
      hero.root.visible = true; const hold = tt < POT0, chug = tt > CHUG0 - 0.1, wired = tt > CHUG1;
      const tw = wired ? 0.02 * Math.sin(tt * 61) : 0;
      hero.set({ x: KH[0] + tw, y: KH[1], z: KH[2], rotY: 0.1, lean: chug && !wired ? -0.2 : 0,
        armL: chug && !wired ? { x: -1.7, z: 0.1, el: 1.5 } : tt > POT0 ? { x: -1.2, z: 0.35, el: 1.4 } : { x: 0, z: 0.15 },
        armR: hold ? (tt < t.not ? { x: -0.9 - 0.75 * Math.max(0, Math.sin((tt - t.step1) * 5.5)), z: 0.2, el: 2.0 + 0.3 * Math.max(0, Math.sin((tt - t.step1) * 5.5)) } : tt < TOSS + 0.25 ? { x: -2.6 * smooth(u01(tt, TOSS - 0.15, TOSS)), z: 0.6, el: 0.6 } : { x: 0, z: 0.2 }) : chug && !wired ? { x: -2.3, z: 0.75, el: 0.8 } : { x: -1.2, z: 0.35, el: 1.4 },
        eyes: wired ? 'wide' : chug ? 'closed' : 'half', mouth: wired ? 'grin' : chug ? 'o' : tt > t.not && tt < TOSS + 0.3 ? 'frown' : 'flat', brows: wired ? 0.2 : 0.5,
        head: { x: chug && !wired ? -0.45 : tt < t.not ? 0.05 - 0.22 * Math.max(0, Math.sin((tt - t.step1) * 5.5)) : 0.05, z: wired ? 0.06 * Math.sin(tt * 47) : 0.04 * sw }, hairUp: wired ? 1 : 0, look: wired ? [0.15 * Math.sin(tt * 37), 0] : [0, 0], faceTint: wired ? [0xff8a6a, 0.12] : [0x8a7aa0, 0.1], t: tt });
      if (wired) { const tw2 = Math.sin(tt * 38) > 0.15; heroLids[1].rotation.x = tw2 ? 0.75 : -0.95; heroLids[0].rotation.x = -0.95; }
      // the mug: in his hand, then flung over his shoulder
      if (tt < TOSS + 1.2) {
        mug.visible = true;
        if (tt < TOSS) { const h = handW(hero, 1); mug.position.set(h[0], h[1] - 0.07, h[2] + 0.06); mug.rotation.set(0, -0.6, 0); }
        else { const a = tt - TOSS, p0 = add(KH, [0.28, 1.3, 0.05]); mug.position.set(p0[0] - 1.6 * a, p0[1] + 3.2 * a - 4.9 * a * a, p0[2] - 0.9 * a); mug.rotation.set(a * 9, a * 4, a * 7); }
      }
      // the carafe: lifted into frame, then chugged (the level drops)
      if (tt > POT0 - 0.05 && tt < CHUG1 + 0.25) {
        carafe.visible = true; const h = headW(hero), up = easeOutBack(u01(tt, POT0 - 0.05, POT0 + 0.2));
        const chugK = smooth(u01(tt, CHUG0 - 0.08, CHUG0 + 0.12)) * (1 - smooth(u01(tt, CHUG1 - 0.05, CHUG1 + 0.2)));
        const rest = add(h, [0.02, -0.62 - 0.4 * (1 - up), 0.32]), top = add(h, [0.41, 0.14, 0.25]);
        carafe.position.set(lerp(rest[0], top[0], chugK), lerp(rest[1], top[1], chugK), lerp(rest[2], top[2], chugK)); carafe.rotation.set(0, 0, 0.05 + 2.15 * chugK);
        const lvl = 1 - smooth(u01(tt, CHUG0, CHUG1 - 0.05)) * 0.97; brew.scale.y = Math.max(0.01, 0.33 * lvl); brew.position.y = 0.012 + 0.165 * lvl; brew.visible = lvl > 0.04;
      }
    }
    if (id === 'libwide' || id === 'bed' || id === 'kitch' || id === 'live' || id === 'sleep') {
      hero.root.visible = id !== 'kitch';
      if (id === 'libwide') { const u = smooth(u01(tt, t.step2, t.bed - 0.3)), p = [lerp(1.4, -1.05, u), 0, lerp(1.6, 1.0, u)]; hero.set({ x: p[0], y: 0, z: p[2], rotY: -PI / 2 + 0.3, walk: tt * 10, armL: { x: -0.8, z: 0.3, el: 1.6 }, eyes: 'half', mouth: 'flat', t: tt }); }
      if (id === 'bed' || id === 'sleep') {
        const asleep = id === 'sleep' && tt > t.sleep - 0.1;
        const zipK = id === 'sleep' ? smooth(u01(tt, t.step6, t.six6 + 0.2)) : 1;
        hero.set(lying({ x: BED[0] - 0.05, y: 0.2 - 0.62 + 0.15 * (1 - zipK), z: BED[2], head: { y: -0.3, x: 0.15 }, armL: { x: 0, z: 0.1 }, armR: id === 'bed' ? { x: -2.2, z: 0.6, el: 0.4 } : { x: 0, z: 0.1 },
          eyes: asleep ? 'closed' : 'open', mouth: asleep ? 'smile' : id === 'bed' ? 'grin' : 'smile', brows: asleep ? -0.2 : 0, look: [0.3, 0.2], t: tt }));
        if (asleep) zs.forEach((z, k) => { const a = ((tt - t.sleep) * 0.6 + k / 3) % 1; const h = headW(hero); z.visible = true; z.position.set(h[0] - 0.12 - a * 0.4, h[1] + 0.3 + a * 0.5, h[2] + 0.05 + 0.08 * Math.sin(a * 6)); z.scale.setScalar(0.08 + a * 0.12); z.material.opacity = Math.sin(a * PI); });
      }
      if (id === 'live') {
        brush.visible = true; foam.visible = true; const sc = Math.sin(tt * 22);
        hero.set({ x: -1.45, y: 0, z: 0.7, rotY: 0.25, armR: { x: -1.9, z: -0.25 + 0.12 * sc, el: 1.95 }, armL: { x: -0.3, z: 2.2 + 0.25 * Math.sin(tt * 9), el: 0.5 }, eyes: 'half', mouth: 'grin', brows: 0.3, head: { z: 0.05 * sw }, look: [0.1, 0], t: tt });
      }
    }
    if (sh.set === 'kit' && (id === 'group' || id === 'faces' || id === 'pizza' || id === 'zero')) {
      pizza.visible = true; tableBooks.forEach((b) => (b.visible = true));
      const lid = easeOutBack(u01(tt, LID0, LID0 + 0.3)); pizzaLid.rotation.x = -3.05 * lid;
      const eat = tt > t.zero - 0.1, look = tt > LID0 + 0.1 && !eat;
      const seat = (f, p, rotY, k) => {
        const toPizza = Math.atan2(TT[0] - p[0], TT[2] - p[2]) - rotY;
        f.set({ x: p[0], y: p[1], z: p[2], rotY, ...seated, lean: look ? 0.22 : 0.12, head: { y: look ? clamp(toPizza, -0.9, 0.9) : eat && k === 2 ? 0 : 0.35 * Math.sin(tt * 1.5 + k), x: look ? 0.12 : eat && k === 2 ? 0.9 : 0.1 },
          armL: eat && k !== 2 ? { x: -1.6, z: 0.3, el: 1.6 + 0.2 * Math.sin(tt * 6 + k) } : { x: -0.6, z: 0.3, el: 1.2 }, armR: eat && k !== 2 ? { x: -1.1, z: 0.2, el: 1.5 } : { x: -0.6, z: 0.3, el: 1.2 },
          eyes: eat && k === 2 ? 'closed' : look ? 'wide' : 'open', mouth: eat ? (k === 2 ? 'o' : 'grin') : look ? 'o' : 'flat', look: eat ? [0, -0.6] : [0, -0.4], brows: look ? -0.3 : 0.2, t: tt });
        if (eat && k !== 2) { slices[k].visible = true; phones[k].visible = true; }
      };
      friends[0].root.visible = friends[1].root.visible = friends[2].root.visible = friends[3].root.visible = hero.root.visible = true;
      seat(friends[0], SEATS[0], PI / 2, 0); seat(friends[1], SEATS[1], -PI / 2, 1); seat(hero, SEATS[2], 0, 4);
      // the two standing behind
      [friends[2], friends[3]].forEach((f, i) => {
        const k = 2 + i, p = STAND[i];
        f.set({ x: p[0], y: 0, z: p[2], rotY: (i ? -0.25 : 0.25), lean: look ? 0.3 : 0.05, head: { x: look ? 0.4 : eat && k === 2 ? 0.75 : 0.05, y: 0.2 * Math.sin(tt * 1.3 + k) },
          armL: eat && k !== 2 ? { x: -1.6, z: 0.3, el: 1.6 } : { x: -0.2, z: 0.2 }, armR: eat && k !== 2 ? { x: -1.1, z: 0.2, el: 1.5 } : { x: -0.2, z: 0.2 },
          eyes: eat && k === 2 ? 'closed' : look ? 'wide' : 'open', mouth: eat ? (k === 2 ? 'o' : 'grin') : look ? 'o' : 'smile', look: eat ? [0, -0.6] : [0, -0.3], t: tt });
        if (eat && k !== 2) { slices[k].visible = true; phones[k].visible = true; }
      });
      if (eat) { slices[4].visible = true; phones[4].visible = true; }
    }
    if (id === 'cards' || id === 'avalanche' || id === 'cooked' || id === 'open' || id === 'pen' || id === 'macro' || id === 'photo' || id === 'clock') {
      const pov = id === 'macro' || id === 'clock'; hero.root.visible = !pov; LIB.chair.visible = true;
      const buried = id === 'avalanche' ? smooth(u01(tt, t.cards2, t.win)) : 0;
      const flip = id === 'cards' ? Math.max(0, Math.sin((tt - t.step4) * 7)) : 0;
      const cooked = id === 'cooked', opened = id === 'open' || id === 'pen' || id === 'photo';
      hero.set({ x: SEAT[0], y: SEAT[1], z: SEAT[2], ...seated, lean: 0.3, t: tt,
        armL: { x: -0.35, z: 0.4, el: 1.5 },
        armR: id === 'cards' ? { x: -1.5 - 0.3 * flip, z: 0.25, el: 1.3 } : id === 'avalanche' ? { x: -1.2 - 1.6 * buried, z: 0.3 + 0.3 * buried, el: 1.2 - 1.0 * buried } : opened && tt < LIDO1 + 0.2 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: cooked ? 'spiral' : id === 'avalanche' ? (tt > t.win - 0.05 ? 'x' : 'wide') : opened ? 'wide' : 'half', mouth: cooked ? 'wavy' : id === 'avalanche' ? (tt > t.win - 0.05 ? 'wavy' : 'scream') : opened ? 'o' : 'flat',
        brows: cooked ? 0.9 : id === 'avalanche' ? 0.9 : 0.5, look: id === 'cards' ? [0.4, 0.2] : opened ? [0.35, -0.35] : [0, 0], head: { x: id === 'avalanche' ? -0.25 * buried : 0.1, z: cooked ? 0.1 * Math.sin(tt * 18) : 0 }, faceTint: cooked ? [0xff6b6b, 0.22] : opened ? [0xd8e6ff, 0.12] : [0, 0] });
      handCard.visible = id === 'cards' || (id === 'avalanche' && tt < t.cards2);
      if (id === 'cards') for (let j = 0; j < 9; j++) {   // flip, read, fling: a card over the shoulder every 0.2 s
        const tl = t.step4 + 0.2 + j * 0.2, a2 = tt - tl; if (a2 < 0 || a2 > 1.4) continue;
        const c = CARD[j * 7], vx = (j % 2 ? 0.7 : -0.5) + c.dx * 0.4;
        putCard(SEAT[0] + 0.22 + vx * a2, SEAT[1] + 1.05 + 2.4 * a2 - 4.9 * a2 * a2, SEAT[2] + 0.3 - 0.9 * a2, c.rx + c.sp * a2, c.ry + 3 * a2, c.rz);
      }
      if (id === 'avalanche') {   // the pile
        const pileT = id === 'avalanche' ? tt : AV1 + 1;
        for (let i = 0; i < NC; i++) {
          const c = CARD[i], k = i / NC, tr = lerp(AV0 + 0.15, AV1, Math.pow(k, 0.85)), H = MH * Math.pow(k, 0.7), rr = c.r * MR * (1 - 0.35 * k);
          const rx = MC[0] + Math.cos(c.a) * rr * 1.15, rz = MC[2] + Math.sin(c.a) * rr * 0.85, ry = Math.max(rr < 0.5 ? 0 : 0, H * (1 - (rr / MR) ** 2) + (Math.abs(rx) < 1.15 && rz > -1.15 && rz < -0.05 ? Y * (1 - k) : 0));
          if (pileT < tr - 0.55) continue;
          const f = pileT < tr ? 1 - (tr - pileT) / 0.55 : 1;
          const y = pileT < tr ? ry + 2.6 * (1 - f * f) : ry;
          if (id === 'cooked' && k > 0.6) continue;   // after the cut the pile is "cleaned up": a low drift remains
          putCard(rx + (pileT < tr ? c.dx * (1 - f) : 0), (id === 'cooked' || id === 'clock') ? Math.min(y, 0.35 * k) : y, rz + (pileT < tr ? c.dz * (1 - f) : 0), c.rx + (pileT < tr ? c.sp * (1 - f) : 0) - PI / 2, c.ry, c.rz);
        }
      }
      if (id === 'cards') deckM.scale.y = 1; deckM.visible = id === 'cards' || id === 'avalanche';
    }
    // ----- the professor
    if (sh.set === 'off') {
      prof.root.visible = true; OFF.desk.visible = OFF.front.visible = OFF.mug.visible = OFF.handle.visible = id !== 'match';
      if (id === 'prof' || id === 'slam') {
        stack.visible = id === 'slam' || tt > t.forty - 0.1;
        const held = tt < SLAM, raise = smooth(u01(tt, t.all - 0.1, t.handwritten - 0.12)), down = tt > STAMP - 0.06;
        sheet.draw(0);
        const s0 = O(0.0, 1.32, 0.38), s1 = O(-0.18, 0.82, 0.52); const u = u01(tt, SLAM - 0.12, SLAM);
        if (held) stack.position.set(...(id === 'slam' ? [lerp(s0[0], s1[0], u * u), lerp(s0[1], s1[1], u * u), lerp(s0[2], s1[2], u * u)] : s0)); else { const [sx, sy] = squash(tt, SLAM, 0.25); stack.position.set(...s1); stack.scale.set(sx, sy, sx); }
        stack.rotation.set(held ? -0.25 * (1 - u) : 0, 0.08, 0); imprint.visible = tt > STAMP;
        imprint.scale.setScalar(tt > STAMP ? 1 + 0.4 * Math.exp(-(tt - STAMP) * 14) : 1);
        stamper.visible = tt > t.all - 0.3;
        const wi = id === 'prof' ? smooth(u01(tt, t.step5 - 0.05, t.professor + 0.1)) : 1, walking = wi > 0.01 && wi < 0.99;
        prof.set({ x: OO[0] + 1.3 * (1 - wi), y: 0, z: OO[2] - 0.1, rotY: walking ? -PI / 2 + 0.5 * wi : 0, walk: walking ? tt * 9 : null, lean: held ? 0.05 : 0.22, t: tt,
          armL: held ? { x: -1.45, z: 0.25, el: 0.5 } : { x: -0.5, z: 0.3, el: 1.0 },
          armR: held && tt < t.all - 0.3 ? { x: -1.45, z: 0.25, el: 0.5 } : stamper.visible ? (down ? { x: -1.05, z: -0.15, el: 0.55 } : { x: -2.4 * raise - 0.6, z: 0.2, el: 1.4 * raise + 0.2 }) : { x: -0.5, z: 0.3, el: 1.0 },
          eyes: tt > SLAM ? 'open' : 'half', mouth: tt > STAMP ? 'grin' : 'flat', brows: -0.8, look: [0, -0.2], head: { x: tt > SLAM ? 0.15 : 0, y: 0.08 * sw2 } });
      }
      if (id === 'match') {
        old.draw(old.total, false); sheet.draw(N);
        const react = tt > t.hw2 - 0.05, darts = Math.sign(Math.sin((tt - t.checks) * 7.5));
        prof.set({ x: OO[0], y: 0, z: OO[2] + 0.05, rotY: 0, armL: { x: -0.9, z: 1.0, el: 0.9 }, armR: { x: -0.9, z: 1.0, el: 0.9 }, eyes: react ? 'wide' : 'half', mouth: tt > t.plus ? 'grin' : react ? 'o' : 'flat', brows: react ? 1 : -0.6,
          look: react ? [0, 0.2] : [darts * 0.7, -0.3], head: { x: react ? -0.1 : 0.1, y: react ? 0 : darts * 0.12 }, t: tt });
        profSheets.forEach((m, i) => { m.visible = true; const sep = 0.37 + 0.03 * Math.sin((tt - t.checks) * 2.2) * (react ? 0 : 1); m.position.set(OO[0] + (i ? 1 : -1) * sep, 0.98 + (react && i ? 0.05 * Math.exp(-(tt - t.hw2) * 6) : 0), OO[2] + 0.42); m.rotation.set(-0.08, (i ? -1 : 1) * 0.14, (i ? -1 : 1) * 0.05); });
        aPlus.visible = tt > t.plus - 0.02; aPlus.scale.setScalar(aPlus.visible ? easeOutBack(u01(tt, t.plus - 0.02, t.plus + 0.22)) * 1.3 : 1);
      }
    }
    // ----- the study group at night, still on flashcards (buried)
    if (id === 'friends') {
      pizza.visible = true; pizzaLid.rotation.x = -3.05; tableBooks.forEach((b) => (b.visible = true));
      friends.forEach((f) => (f.root.visible = true));
      const twitch = Math.sin(tt * 40) > 0.3;
      const pose = (f, p, rotY, k, standing) => f.set({ x: p[0], y: standing ? 0 : p[1], z: p[2], rotY, ...(standing ? {} : seated), lean: 0.1, head: { x: -0.05, z: 0.08 * Math.sin(tt * 3 + k) }, armL: { x: -0.4, z: 0.3, el: 1.0 }, armR: k === 1 ? { x: -2.9, z: 0.3, el: 0.3 } : { x: -0.4, z: 0.3, el: 1.0 },
        eyes: k === 0 ? 'spiral' : k === 3 ? 'x' : 'half', mouth: k === 1 ? 'scream' : 'wavy', brows: 0.9, faceTint: [0x9aa0ff, 0.12], t: tt });
      pose(friends[0], SEATS[0], PI / 2 - 0.5, 0, false); pose(friends[1], SEATS[1], -PI / 2 + 0.5, 1, false); pose(friends[2], SEATS[2], 0, 2, false); pose(friends[3], STAND[1], -0.2, 3, true);
      if (twitch) eyeLids(friends[2])[0].rotation.x = 0.8;
      const C2 = add(TT, [0, -0.75, -0.3]);
      for (let i = 0; i < NC; i++) {
        const c = CARD[i], k = i / NC, rr = c.r * 1.55, rx = C2[0] + Math.cos(c.a) * rr * 1.1, rz = C2[2] + Math.sin(c.a) * rr * 0.7;
        const onTable = Math.abs(rx - TT[0]) < 0.7 && Math.abs(rz - TT[2]) < 0.45;
        const H = 1.05 * (1 - (rr / 1.55) ** 1.6) + (onTable ? 0.1 : 0), y = Math.max(onTable ? TT[1] + 0.02 : 0.01, H * Math.pow(k, 0.5));
        const fall = k > 0.93 ? ((tt * 0.9 + c.ex) % 1) : 1;   // a few still drifting down
        putCard(rx, y + 1.6 * (1 - fall), rz, c.rx - PI / 2 + (1 - fall) * c.sp, c.ry, c.rz);
      }
    }
    // ----- the library desk: the laptop, the app, the pen, the clock (as 049)
    if (sh.set === 'lib' && !(id === 'hook')) {
      if (id === 'screen' || id === 'solve') { LIB.chair.visible = false; }
      const lidOpen = tt > LIDO0 && tt < END + 5 && tt > t.so - 0.2;
      LIB.laptop.hinge.rotation.x = lidOpen ? lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tt, LIDO0, LIDO1))) : PI / 2 - 0.02; LIB.scrL.intensity = lidOpen ? 1.6 : 0;
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 - 0.25 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      const wp = writeP(tt); if (tt > t.so - 0.2) { sheet.draw(wp); screen.draw({ mode, k }); }
      LIB.setClock(tt > t.due - 0.2 && tt < t.so ? 11 : tt > t.so ? 11 : 10, tt > t.due - 0.2 && tt < t.so ? 3 * u01(tt, t.due, t.youre + 0.5) : tt > t.so ? 4 : 20);
      shotHand.visible = id === 'photo'; if (shotHand.visible) { const u = smooth(u01(tt, t.oneS - 0.1, t.photo - 0.05)); shotHand.position.set(LD.sheet[0] + 0.05, Y + lerp(0.55, 0.4, u), LD.sheet[1] + lerp(0.5, 0.2, u)); shotHand.rotation.set(0.1, 0, 0); flashSpr.material.opacity = tt > FLASH ? 1 - u01(tt, FLASH, FLASH + 0.25) : 0; }
      pen.g.visible = tt > PEN0 && tt < WRITE1 + 0.25 && (id === 'pen' || id === 'macro');
      if (pen.g.visible) {
        const tip = tipWorld(writeP(tt)), loc = LIB.root.worldToLocal(V(...tip));
        const from = V(LD.laptop[0], Y + 0.25, LD.laptop[1]), u = smooth(u01(tt, PEN0, WRITE0));
        const scrib = tt > WRITE0 ? 0.004 * Math.sin(tt * 60) : 0;
        pen.g.position.set(lerp(from.x, loc.x, u) + scrib, lerp(from.y + 0.15, loc.y + 0.004, u) + (1 - u) * 0.2 * Math.sin(u * PI), lerp(from.z, loc.z, u));
        pen.g.rotation.set(-0.5, 0.4, -0.55 + scrib * 20); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tt * 20);
      }
      const pages = tt < WRITE0 ? 0 : Math.min(6, Math.floor(1 + 6 * u01(tt, t.stroke, WRITE1)));
      stackPages.forEach((m, i) => { m.visible = i < pages; m.position.y = 0.003 + i * 0.004; });
    }
    if (id === 'hook' || id === 'libwide' || id === 'bed' || id === 'kitch' || id === 'live' || id === 'cards' || id === 'avalanche') stackPages.forEach((m) => (m.visible = false));
    trophy.visible = id === 'sleep';
    cards.count = nCards; cards.instanceMatrix.needsUpdate = true;
    dizzy.update(tt, id === 'avalanche' && tt > t.win ? 1 : 0, id === 'avalanche' ? add(headW(hero), [0, 0.32, 0]) : [0, -50, 0]);

    // ----- camera
    const cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    studio.fill.intensity = sh.set === 'kit' && sh.mood === 'night' ? 1.2 : 0.55; studio.fill.distance = 7;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 058-fword-explainer --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['you', hero], ['the professor', prof], ...friends.map((f, i) => ['friend ' + (i + 1), f])];
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
