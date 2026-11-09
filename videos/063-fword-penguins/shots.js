// 063 — Scribe promo, the f-word explainer #3: "How fucking penguins fucking survive fucking Antarctica". A deadpan nature-doc
// explainer (058's narrator + format: "fucking" between the words, F*CKING on screen in its own colour, numbered steps, one toon gag
// each) on emperor penguins: snowed in during the hook, (1) the huddle — frozen solid on the windward edge, then crowd-surfed into the
// middle where it's up to +37 °C (sunglasses, sweating), (2) the egg — Mom flips it onto Dad's feet and leaves; two months of polar
// night on his feet, no food, he gets skinny and dreams of fish, (3) the belly slide — faster than walking, then a strike through ten
// penguins, (4) the leopard seal — never go in first: push Kevin (Kevin rockets back out), and the one penguin walking the wrong way.
// Hard pivot (~57 %): the biology teacher wants the penguin worksheet HANDWRITTEN → you're cooked → Scribe: one photo, solves the
// worksheet, writes it in your handwriting stroke by stroke, and DRAWS the food chain (manager steer, Nov 9: the pen draws a figure)
// → A+. Last gag: that penguin, still walking the wrong way. Scribe end card.
// Facts (cited in caption.md): emperor males incubate the single egg on their feet for ~65 days (62–67) while fasting, the female
// leaves to feed at sea (Australian Antarctic Division); huddles rotate so everyone takes turns in the warm centre and on the cold
// edge (AAD); huddle temperatures rose up to 37.5 °C (Gilbert et al. 2006, Physiol. Behav. 88: 479–488); leopard seals hunt
// penguins at the ice edge; penguins toboggan on their bellies. Product facts (Scribe README + tryscribe.ink, Nov 2026): photo/PDF
// → worked solutions written in your handwriting, stroke by stroke, biology included, with the diagrams a solution needs.
// Sets: the new Antarctic sea-ice set (engine/build/penguins.js) at the origin; the 049 library at LO and office at OO.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, smooth, rng, mk } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeSpecs, cardTex } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice, makePen, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { makePenguin, makePenguinCrowd, makeEgg, makeLeopardSeal, buildIce } from '@engine/build/penguins.js';
import { makeSnowfall } from '@engine/winter.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

export async function build(studio, story) {
  const { scene, renderer, camera } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer), roomEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------------------------------------------------------------- word times
  const t = {
    hf1: W('hook', 'fucking', 1), hf2: W('hook', 'fucking', 2), hf3: W('hook', 'fucking', 3), ant: W('hook', 'antarctica'),
    step1: W('huddle', 'step'), huddle: W('huddle', 'huddle'), freeze: W('huddle', 'freeze'), edge: W('huddle', 'edge'), then: W('huddle', 'then'), swap: W('huddle', 'swap'), up: W('huddle', 'up'), t37: W('huddle', 'thirty-seven'), degrees: W('huddle', 'degrees'), middle: W('huddle', 'middle'),
    step2: W('egg', 'step'), egg: W('egg', 'egg'), mom: W('egg', 'mom'), leaves: W('egg', 'leaves'), dad: W('egg', 'dad'), holds: W('egg', 'holds'), feet: W('egg', 'feet'), two2: W('egg', 'two', 2), months: W('egg', 'months'), no: W('egg', 'no'), food: W('egg', 'food'),
    step3: W('slide', 'step'), belly: W('slide', 'belly'), slide: W('slide', 'slide'), faster: W('slide', 'faster'), walking: W('slide', 'walking'), sf4: W('slide', 'fucking', 4), strike: W('slide', 'strike'),
    step4: W('seal', 'step'), leopard: W('seal', 'leopard'), seal: W('seal', 'seal'), never: W('seal', 'never'), go: W('seal', 'go'), first: W('seal', 'first'), push: W('seal', 'push'), kevin: W('seal', 'kevin'),
    wAnd: W('wrong', 'and'), always: W('wrong', 'always'), one: W('wrong', 'one'), penguinW: W('wrong', 'penguin'), walkingW: W('wrong', 'walking'), wrong: W('wrong', 'wrong'), way: W('wrong', 'way'),
    tAnd: W('teacher', 'and'), biology: W('teacher', 'biology'), teacher: W('teacher', 'teacher'), penguinT: W('teacher', 'penguin'), worksheet: W('teacher', 'worksheet'), tf3: W('teacher', 'fucking', 3), handwritten: W('teacher', 'handwritten'),
    youre: W('cooked', 'youre'), cooked: W('cooked', 'cooked'),
    so: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), oneS: W('scribe', 'one'), photo: W('scribe', 'photo'), it: W('scribe', 'it'), solves: W('scribe', 'solves'), worksheet2: W('scribe', 'worksheet'),
    in: W('hand', 'in'), yourH: W('hand', 'your'), handwriting: W('hand', 'handwriting'), stroke: W('hand', 'stroke'), stroke2: W('hand', 'stroke', 2),
    yourM: W('match', 'your'), teacherM: W('match', 'teacher'), mf2: W('match', 'fucking', 2), plus: W('match', 'plus'),
    lAnd: W('last', 'and'), penguinL: W('last', 'penguin'), still: W('last', 'still'), wrongL: W('last', 'wrong'), wayL: W('last', 'way'),
  };
  const ENDCARD = t.wayL + 0.55;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the penguin worksheet (biology) + the app + your old homework
  const sheet = makeSheet(G, { seed: 63, name: 'Sam', title: 'BIO 1 · EMPEROR PENGUINS', note: 'Due Fri, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 3', problems: [
    { q: '1.  Why do emperor penguins huddle?', a: 'share body heat; rotate to the middle' },
    { q: '2.  Which parent incubates the egg? For how long?', a: 'the male, on his feet, about 65 days' },
    { q: '3.  Why do penguins slide on their bellies?', a: 'faster than walking + saves energy' },
    { q: '4.  Draw a food chain with the emperor penguin.', chain: ['algae', 'krill', 'fish', 'penguin', 'leopard seal'], u: 22, gap: 42, dy: 112, x0: 104 },
  ] });
  const old = makeSheet(G, { seed: 12, name: 'Sam', title: 'BIO 1 · CELLS', note: 'Due Oct 31, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 2', problems: [
    { q: '1.  What do mitochondria do?', a: 'make energy (ATP) for the cell', pre: true },
    { q: '2.  Which organelle controls the cell?', a: 'the nucleus', pre: true },
    { q: '3.  Plant cell or animal cell? Why?', a: 'plant - it has a cell wall', pre: true },
    { q: '4.  What does chlorophyll absorb?', a: 'light energy', pre: true },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Sam', n: 12, subject: 'Biology' });

  // ---------------------------------------------------------------- sets: the ice (origin), the library + office (parked)
  const ICE = buildIce(studio);
  const iceEnv = (() => { const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: ICE.sky.material.map, side: THREE.BackSide }))); const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xe6edf5 })); g.rotation.x = -PI / 2; g.position.y = -2; s.add(g); return pmrem.fromScene(s, 0.02).texture; })();
  const LO = [300, 0, 0], OO = [360, 0, 0];
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon }); LIB.root.position.set(...LO);
  const OFF = buildOffice(studio); OFF.root.position.set(...OO);
  const L = (x, y, z) => [LO[0] + x, LO[1] + y, LO[2] + z], O = (x, y, z) => [OO[0] + x, OO[1] + y, OO[2] + z];
  const Y = LD.deskY;
  LIB.jack.visible = false;
  LIB.root.traverse((o) => {   // the 049 sleeping bag + pillow go; the calendar becomes a November page with the worksheet circled
    if (!o.isMesh) return; const p = o.geometry.parameters || {};
    if (o.geometry.type === 'CapsuleGeometry' && p.radius === 0.25) o.visible = false;
    if (o.geometry.type === 'SphereGeometry' && p.radius === 0.22) o.visible = false;
    if (o.geometry.type === 'PlaneGeometry' && p.width === 0.62 && p.height === 0.72) o.material.map = tex(400, 460, (c, w, h) => {
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fbf'; c.fillRect(0, 0, w, 80); c.fillStyle = '#fff'; c.font = '600 46px Inter, Arial'; c.textAlign = 'center'; c.fillText('NOVEMBER', w / 2, 56);
      c.font = '500 26px Inter, Arial';
      for (let d = 0; d < 30; d++) { const x = 30 + (d % 7) * 52, y = 120 + Math.floor(d / 7) * 64; c.fillStyle = '#333'; c.fillText(String(d + 1), x + 12, y + 24); if (d < 8) { c.strokeStyle = '#c1121f'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 32, y + 36); c.moveTo(x + 32, y); c.lineTo(x - 6, y + 36); c.stroke(); } }
      c.strokeStyle = '#e2302f'; c.lineWidth = 7; c.beginPath(); c.ellipse(30 + 6 * 52 + 12, 120 + 1 * 64 + 16, 34, 30, 0, 0, TAU); c.stroke();
      c.fillStyle = '#e2302f'; c.font = '700 34px Fredoka, Arial'; c.fillText('PENGUIN', w / 2, 120 + 4 * 64 + 2); c.fillText('WORKSHEET!!', w / 2, 120 + 4 * 64 + 40);
    });
  });
  // the office becomes the biology classroom: the board, the diploma, a penguin poster
  OFF.root.traverse((o) => {
    if (!o.isMesh || o.geometry.type !== 'PlaneGeometry') return; const p = o.geometry.parameters;
    if (p.width === 3.4 && p.height === 1.7) o.material.map = tex(1024, 512, (c, w, h) => {
      c.fillStyle = '#2f4a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 211) % w, (i * 97) % h, 60, 0, 1); c.stroke(); }
      c.fillStyle = 'rgba(245,245,235,.92)'; c.font = '64px Fredoka, Arial'; c.fillText('BIOLOGY 101', 400, 92);
      c.font = '34px Fredoka, Arial'; ['Antarctic adaptations:', '• huddles share heat', '• dad holds the egg', '• algae → krill → fish', '   → penguin → seal'].forEach((l, i) => c.fillText(l, 400, 160 + i * 64));
      c.save(); c.translate(900, 330); c.scale(0.7, 0.7); c.strokeStyle = 'rgba(245,245,235,.9)'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 70, 120, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(0, 20, 42, 88, 0, 0, TAU); c.stroke(); c.beginPath(); c.arc(-22, -78, 8, 0, TAU); c.arc(22, -78, 8, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-14, -56); c.lineTo(0, -40); c.lineTo(14, -56); c.stroke(); c.restore();
    });
    if (p.width === 0.7 && p.height === 0.52) o.material.map = tex(320, 240, (c, w) => { c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, w, 240); c.fillStyle = '#5b2a1e'; c.font = 'italic 34px Georgia'; c.textAlign = 'center'; c.fillText('Doctor of', w / 2, 90); c.fillText('Biology', w / 2, 132); c.fillStyle = '#2f7d46'; c.beginPath(); c.arc(w / 2, 190, 22, 0, TAU); c.fill(); });
  });

  // ---------------------------------------------------------------- cast
  const pen1 = (o = {}) => { const p = makePenguin(o); scene.add(p.root); return p; };
  const hero = pen1({ tuft: true }), mom = pen1({ bow: true }), kevin = pen1({ fat: 1.18, chest: 0xffe39a });
  const ext = Array.from({ length: 10 }, (_, i) => pen1({ chest: [0xffd77a, 0xffe08f, 0xf9cf6a][i % 3], ear: [0xffb52e, 0xffa726, 0xffbf47][(i + 1) % 3] }));
  const pens = [hero, mom, kevin, ...ext];
  const crowd = makePenguinCrowd(scene, 520);
  const seal = makeLeopardSeal(); scene.add(seal.g);
  const egg = makeEgg(); scene.add(egg);
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const you = mk1({ shirt: 0x3a8f5c, pants: 0x3d4250, hair: 0x2b1d14, hairStyle: 'messy', skin: 0xe8b48a });
  { const hood = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.07, 10, 20), you.M.shirt); hood.position.set(0, 0.36, -0.1); hood.rotation.x = PI / 2 - 0.55; hood.scale.set(0.95, 0.95, 0.8); you.armL.g.parent.add(hood); }
  const prof = mk1({ shirt: 0x4f7a4a, pants: 0x3d3d3d, hair: 0xd9d9d9, hairStyle: 'side', mustache: true, skin: 0xf2c29a });
  { const specs = makeSpecs(); prof.head.add(specs); specs.position.set(0, 0.05, 0.262); const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), std(0xc1121f, 0.5)); bow.position.set(0, 0.36, 0.13); prof.armL.g.parent.add(bow); }
  const toons = [you, prof];
  const headW = (r) => { r.root.updateMatrixWorld(true); return r.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const localW = (p, x, y, z) => { p.root.updateMatrixWorld(true); return p.root.localToWorld(V(x, y, z)).toArray(); };

  // ---------------------------------------------------------------- props
  const paperM = std(0xf6f3ea, 0.9);
  // the fish dream (a thought bubble over the starving dad)
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(512, 420, (c, w, h) => {
    c.fillStyle = '#fff'; c.strokeStyle = '#1d2230'; c.lineWidth = 10;
    const blob = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); };
    blob(70, 380, 18); blob(118, 330, 28);
    c.beginPath(); for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, x = 300 + Math.cos(a) * 165, y = 170 + Math.sin(a) * 120; c.moveTo(x + 62, y); c.arc(x, y, 62, 0, TAU); } c.stroke(); c.beginPath(); c.ellipse(300, 170, 180, 130, 0, 0, TAU); c.fill(); for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; c.beginPath(); c.arc(300 + Math.cos(a) * 165, 170 + Math.sin(a) * 120, 58, 0, TAU); c.fill(); }
    c.fillStyle = '#4aa3df'; c.strokeStyle = '#1d4f7a'; c.lineWidth = 8; c.beginPath(); c.ellipse(285, 170, 105, 55, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(380, 170); c.lineTo(445, 115); c.lineTo(445, 225); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(225, 155, 16, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(229, 157, 8, 0, TAU); c.fill();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; c.beginPath(); c.moveTo(300 + Math.cos(a) * 140, 170 + Math.sin(a) * 90 - 20); c.lineTo(300 + Math.cos(a) * 165, 170 + Math.sin(a) * 110 - 25); c.stroke(); }
  }), transparent: true, depthWrite: false }));
  bubble.renderOrder = 8; scene.add(bubble);
  // the professor's stack of worksheets + his rubber stamp + the red imprint (as 058)
  const stack = new THREE.Group(); scene.add(stack);
  { mk(new THREE.BoxGeometry(0.43, 0.12, 0.56), paperM, stack, 0, 0.06, 0); const top = mk(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), stack, 0, 0.121, 0); top.rotation.x = -PI / 2; }
  const imprint = mk(new THREE.PlaneGeometry(0.4, 0.13), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), stack, 0, 0.124, 0.05);
  imprint.rotation.set(-PI / 2, 0, 0.22);
  const stamper = new THREE.Group(); prof.hand(1).add(stamper); stamper.position.set(0, -0.08, 0.02);
  { mk(new THREE.SphereGeometry(0.04, 12, 8), std(0x5a3a22, 0.5), stamper, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), std(0x5a3a22, 0.5), stamper, 0, -0.01, 0); mk(new THREE.BoxGeometry(0.12, 0.04, 0.08), std(0xc1121f, 0.5), stamper, 0, -0.07, 0); }
  const aPlus = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), new THREE.MeshBasicMaterial({ map: cardTex('A+', { bg: 'rgba(0,0,0,0)', fg: '#d0141e', w: 256, h: 190, px: 170 }), transparent: true, depthWrite: false }));
  const profSheets = [old, sheet].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.556), new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.85, side: THREE.DoubleSide })); scene.add(m); return m; });
  profSheets[1].add(aPlus); aPlus.position.set(0.0, 0.15, 0.004);
  // a penguin poster in the classroom (a cartoon emperor: the A+ shot)
  const poster = mk(new THREE.PlaneGeometry(0.6, 0.8), std(0xffffff, 0.8, { map: tex(300, 400, (c, w, h) => {
    c.fillStyle = '#dff0fb'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f2329'; c.beginPath(); c.ellipse(150, 230, 80, 120, 0, 0, TAU); c.fill(); c.fillStyle = '#f8f7f2'; c.beginPath(); c.ellipse(150, 245, 58, 96, 0, 0, TAU); c.fill();
    c.fillStyle = '#ffb52e'; c.beginPath(); c.ellipse(108, 140, 12, 22, 0.3, 0, TAU); c.ellipse(192, 140, 12, 22, -0.3, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(132, 130, 14, 0, TAU); c.arc(168, 130, 14, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(134, 132, 7, 0, TAU); c.arc(170, 132, 7, 0, TAU); c.fill();
    c.fillStyle = '#ff8f5a'; c.beginPath(); c.moveTo(140, 150); c.lineTo(160, 150); c.lineTo(150, 172); c.fill(); c.fillStyle = '#1f3b5a'; c.font = '700 34px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('EMPEROR', w / 2, 46); c.fillText('PENGUIN', w / 2, 82);
  }) }), OFF.root, 1.55, 1.75, -2.47);
  void poster;
  // the Scribe pieces (as 049/058): the pen, the photo insert (a hand holding a phone), the solved-page stack
  const pen = makePen(); LIB.root.add(pen.g);
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), you.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.26); shotHand.add(sleeve); shotHand.add(new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), you.M.skin)); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { mk(new THREE.BoxGeometry(0.13, 0.016, 0.25), std(0x15161a, 0.3), camPhone); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0085, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0086, 0.1); camPhone.add(ui); }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  const stackPages = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), std(0xffffff, 0.85, { map: old.tex })); m.rotation.set(-PI / 2, 0, -0.1 + i * 0.04); LIB.stack.add(m); return m; });
  // weather: a blizzard (wind) + light flurries; both follow a point ahead of the lens
  const blizzard = makeSnowfall(scene, { n: 3400, box: [12, 9, 12], speed: 1.5, size: 0.05, seed: 3, opacity: 0.9 });
  const flurry = makeSnowfall(scene, { n: 700, box: [14, 9, 14], speed: 0.45, size: 0.035, seed: 9, opacity: 0.75 });

  // ---------------------------------------------------------------- places on the ice
  const HK = [-8, 0, 14];                       // the hook: alone in the blizzard
  const HE = [6.0, 0, 0.9];                     // the windward edge of the huddle (wind from +x)
  const E = [-2, 0, 10], MOMP = [E[0] - 0.45, 0, E[2]], DADP = [E[0] + 0.45, 0, E[2]];   // the egg hand-off (the huddle behind)
  const SL_X = -30, SL_Z0 = -20, VS = 6.5;     // the belly slide lane (along +z)
  const LX = 45.45, LINE_Z = [-1.4, -0.7, 0, 0.7, 1.4], SEAL_P = [47.75, ICE.D.waterY, 0.12];   // the lineup on the tongue + the seal
  const MZ = 30, MX0 = 2;                       // the march to the sea (+x) and the one who turns round
  // the huddle: a packed disc of ~500 (hex grid), the hero's spots kept clear
  const HUD = []; { const R = rng(63), sp = 0.5; for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) { const x = (i + (j % 2) * 0.5) * sp, z = j * sp * 0.866, r = Math.hypot(x, z); if (r > 5.6 + 0.4 * Math.sin(Math.atan2(z, x) * 5) || r < 0.42) continue; HUD.push({ x: x + (R() - 0.5) * 0.08, z: z + (R() - 0.5) * 0.08, r, a: Math.atan2(z, x), ry: (R() - 0.5) * 0.7, ph: R() * TAU, s: 0.9 + R() * 0.16 }); } }

  // ---------------------------------------------------------------- derived times (make_cues.py mirrors these)
  const DRIFT = [[0, 0.06], [t.hf1 + 0.05, 0.28], [t.hf2 + 0.05, 0.5], [t.hf3 + 0.05, 0.7], [t.ant + 0.12, 0.88]];
  const driftAt = (tt) => { let v = 0; for (let i = 0; i < DRIFT.length; i++) { const [tb, val] = DRIFT[i], prev = i ? DRIFT[i - 1][1] : 0; if (tt >= tb) v = lerp(prev, val, easeOutBack(u01(tt, tb, tb + 0.16))); } return v; };
  const FRZ = t.freeze + 0.06, SW0 = t.then + 0.06, SW1 = t.up - 0.12;
  const HOP0 = t.mom + 0.02, HOP1 = t.mom + 0.36, MOMGO = t.leaves - 0.05;
  const N0 = t.two2 - 0.05, N1 = t.two2 + 0.35, N2 = t.months + 0.25, N3 = t.no - 0.02;
  const FLOP = t.belly - 0.08, GO = t.slide - 0.06, STRIKE = t.strike - 0.06;
  const zf = SL_Z0 + 0.35 * (FLOP - t.step3);
  const zHero = (tt) => tt < FLOP ? SL_Z0 + 0.35 * Math.max(0, tt - t.step3) : tt < GO ? zf + 0.25 * (tt - FLOP) : zf + 0.25 * (GO - FLOP) + VS * ((tt - GO) - 0.22 * (1 - Math.exp(-(tt - GO) / 0.22)));
  const PINZ = zHero(STRIKE) + 0.34, PASS = (t.faster + t.walking) / 2 + 0.12, WZ = (tt) => zHero(PASS) + 0.45 * (tt - PASS);
  const PINS = []; for (let r = 0; r < 4; r++) for (let k = 0; k <= r; k++) PINS.push({ x: SL_X + (k - r / 2) * 0.62, z: PINZ + r * 0.55, r });
  const PIN_V = PINS.map((p, i) => { const R = rng(400 + i); return { vx: (p.x - SL_X) * 2.6 + (R() - 0.5) * 1.6, vy: 3.2 + R() * 2.4, vz: 1.6 + R() * 2.2, sx: (R() - 0.5) * 14, sz: (R() - 0.5) * 14, t0: STRIKE + p.r * 0.045 }; });
  const RISE0 = t.leopard - 0.22, GRIN = t.seal - 0.04, PUSH = t.push + 0.04, SPLASH = t.kevin - 0.1, LUNGE = SPLASH + 0.1, ROCKET = SPLASH + 0.2, CHOMP = SPLASH + 0.32, KLAND = SPLASH + 0.9;
  const TURN0 = t.penguinW - 0.1, TURN1 = t.walkingW + 0.05;

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 300, confetti: 500, spark: 300, glow: 60, smoke: 260, drops: 400, rock: 200, mist: 200 }, nearFade: [0.35, 1.2] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.1, 0.18);
  // hook: each F*CKING dumps a slab of snow on him
  DRIFT.slice(1).forEach(([tb], i) => { kick(tb + 0.02, 0.3 + 0.08 * i, 0.3); fx.burst('dust', tb, { pos: add(HK, [0, 0.35, 0.15]), n: 5, dir: [0, 0.3, 1], spread: 1.6, speed: [0.5, 1.1], size: [0.18, 0.32], color: 0xffffff, alpha: 0.5 }); });
  // huddle
  fx.stream('smoke', t.step1 - 1.5, t.freeze, { pos: [0, 1.5, 0], box: [4, 0.4, 4], rate: 10, size: [0.8, 1.6], speed: [0.3, 0.7], life: [1.4, 2.2], g: -0.9, color: 0xf4f7fa, alpha: 0.3 });
  kick(FRZ, 0.7); fx.burst('spark', FRZ, { pos: add(HE, [0, 0.9, 0]), n: 22, color: 0xbfefff, speed: [0.6, 1.6], spread: 2.2 }); fx.burst('mist', FRZ, { pos: add(HE, [0, 0.5, 0]), n: 10, speed: [0.4, 1], spread: 2 });
  kick(SW0, 0.6); fx.burst('rock', SW0, { pos: add(HE, [0, 0.7, 0]), n: 26, color: 0xd6f1ff, speed: [1.5, 3.2], spread: 1.4, size: [0.05, 0.12], floor: 0.02 });
  kick(SW1 + 0.08, 0.4); fx.burst('dust', SW1 + 0.06, { pos: [0, 0.9, 0], n: 5, spread: 1.4, speed: [0.4, 1.0], size: [0.18, 0.3], life: [0.4, 0.7], color: 0xffffff, alpha: 0.4 });
  fx.stream('drops', t.up - 0.05, t.step2, { pos: [0, 1.05, 0.12], box: [0.3, 0.1, 0.15], rate: 16, color: 0x9fdcff, speed: [0.4, 0.9], spread: 1.3, size: [0.012, 0.022] });
  // egg
  kick(HOP1, 0.3); fx.burst('spark', HOP1, { pos: add(DADP, [0, 0.2, 0.1]), n: 12, color: 0xfff1a8, speed: [0.4, 1], spread: 2 });
  kick(t.food + 0.05, 0.3);
  // slide: flop, spray along the lane, the strike
  kick(FLOP + 0.15, 0.45); fx.burst('dust', FLOP + 0.15, { pos: [SL_X, 0.2, zHero(FLOP) + 0.3], n: 8, spread: 1.4, speed: [0.5, 1.2], size: [0.3, 0.6], color: 0xffffff });
  for (let tb = GO; tb < STRIKE + 0.6; tb += 0.05) fx.burst('dust', tb, { pos: [SL_X, 0.12, zHero(tb) - 0.55], n: 1, dir: [0, 0.6, -1], spread: 0.6, speed: [1.0, 2.2], size: [0.18, 0.35], color: 0xffffff, seed: Math.round(tb * 100) });
  kick(PASS + 0.04, 0.4); kick(STRIKE, 1.1); kick(STRIKE + 0.3, 0.4);
  fx.burst('dust', STRIKE, { pos: [SL_X, 0.25, PINZ + 0.8], n: 6, spread: 1.6, speed: [0.8, 1.8], size: [0.25, 0.45], life: [0.5, 0.9], color: 0xffffff, alpha: 0.45 });
  fx.burst('spark', STRIKE, { pos: [SL_X, 0.8, PINZ + 0.3], n: 30, color: 0xffe14d, speed: [1.5, 3.5], spread: 2.4 });
  // seal
  kick(RISE0 + 0.15, 0.6); kick(GRIN + 0.05, 0.3);
  fx.burst('drops', RISE0 + 0.1, { pos: add(SEAL_P, [0, 0.2, 0]), n: 40, color: 0x7fc8ee, speed: [1.2, 3.2], spread: 0.9, floor: ICE.D.waterY });
  fx.burst('mist', RISE0 + 0.12, { pos: add(SEAL_P, [0, 0.3, 0]), n: 10, speed: [0.4, 1.2], spread: 1.6 });
  kick(PUSH + 0.05, 0.3); kick(SPLASH, 0.6); kick(CHOMP, 1.0); kick(KLAND, 0.5);
  fx.burst('drops', SPLASH, { pos: [LX + 1.15, ICE.D.waterY + 0.1, LINE_Z[2]], n: 50, color: 0x7fc8ee, speed: [1.4, 3.6], spread: 0.8, floor: ICE.D.waterY });
  fx.burst('drops', LUNGE, { pos: [LX + 1.3, ICE.D.waterY + 0.2, LINE_Z[2]], n: 40, color: 0x7fc8ee, speed: [1.2, 3.0], spread: 1.0, floor: ICE.D.waterY });
  fx.burst('mist', CHOMP, { pos: [LX + 1.3, 0.6, LINE_Z[2]], n: 12, speed: [0.5, 1.4], spread: 1.8 });
  fx.burst('dust', KLAND, { pos: [LX - 2.4, 0.2, LINE_Z[2]], n: 8, spread: 1.4, speed: [0.5, 1.2], size: [0.3, 0.6], color: 0xffffff });
  // teacher (as 058)
  const SLAM = t.worksheet + 0.02, STAMP = t.handwritten + 0.05;
  kick(SLAM, 1.0); kick(STAMP, 0.9);
  fx.burst('confetti', SLAM, { pos: O(-0.2, 0.95, 0.5), n: 40, color: 0xffffff, speed: [1, 2.4], spread: 1.4, floor: 0.0 });
  fx.burst('dust', SLAM, { pos: O(-0.2, 0.85, 0.5), n: 8, spread: 1.4, speed: [0.5, 1.2], size: [0.2, 0.4], color: 0xe0d8c8 });
  fx.burst('spark', STAMP, { pos: O(-0.2, 0.96, 0.55), n: 16, color: 0xff6b6b, speed: [0.8, 2], spread: 1.6 });
  // cooked + Scribe (as 058)
  const LIDO0 = t.open - 0.05, LIDO1 = t.open + 0.3, FLASH = t.photo + 0.05, SCAN0 = FLASH + 0.15, SOLVE0 = t.it + 0.05, SOLVE1 = t.worksheet2 + 0.25;
  const PEN0 = t.in + 0.02, WRITE0 = t.yourH - 0.05, WRITE1 = t.stroke2 + 0.45;
  kick(t.cooked, 0.7); kick(LIDO1, 0.3); kick(FLASH, 0.35); kick(SOLVE1, 0.4);
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.1, { pos: L(0, 1.62, LD.seat[1]), rate: 16, size: [0.12, 0.25], speed: [0.3, 0.8], spread: 0.4, life: [0.7, 1.1], g: -1.5, color: 0xdddddd });
  const N = sheet.total, items = sheet.items;
  const C0 = items.filter((it) => it.pi < 3).reduce((a, it) => a + (it.kind === 'p' ? it.w : 1), 0);   // the food chain (problem 4) starts here
  const PK = [[WRITE0, 0], [t.stroke - 0.12, C0], [t.yourM - 0.25, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  fx.stream('spark', WRITE0, t.yourM, { pos: L(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 18, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });
  kick(t.mf2, 0.6); kick(t.plus + 0.05, 1.0);
  fx.burst('confetti', t.plus + 0.05, { pos: O(0, 1.6, 0.6), n: 120, speed: [1.5, 3.5], spread: 1.2, floor: 0 });

  // ---------------------------------------------------------------- the end card (Scribe) via the 049 HUD (only its end card is used)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: [[0, 0]], day: [[0, '']], feed: [], map: { shoreR: () => 1, spots: [], dots: () => [] },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- SHOTS (hard cuts; one gliding rail per framing)
  const SEAT = L(LD.seat[0], 0.145, LD.seat[1]), sheetW = L(LD.sheet[0], Y, LD.sheet[1]);
  const face = (toon, off, lk = [0, -0.12, 0], fov = 40, push = 0, t0 = 0, t1 = 1) => (tt) => { const h = headW(toon), u = u01(tt, t0, t1); return { pos: add(h, [off[0], off[1], off[2] * (1 - push * u)]), look: add(h, lk), fov }; };
  const M_FRONT = (tt) => MX0 + 0.45 * Math.max(0, tt - t.wAnd + 0.3) + 7 * 0.9;   // the lead marcher's x
  const loneX = (tt) => tt < TURN1 ? MX0 + 3 * 0.9 + 0.45 * Math.max(0, Math.min(tt, t.one) - t.wAnd + 0.3) : MX0 + 3 * 0.9 + 0.45 * (t.one - t.wAnd + 0.3) - 0.42 * (tt - TURN1);
  const LP = [-58, 0, MZ + 4];   // where he has got to by the last shot
  const lastX = (tt) => LP[0] - 0.4 * Math.max(0, Math.min(tt, t.still) - t.lAnd) - 0.4 * Math.max(0, tt - (t.wayL + 0.45));
  const SHOTS = [
    { id: 'hook', t0: 0, set: 'ice', wx: 0.66, frames: [
      { t: 0, pos: add(HK, [0.45, 1.0, 2.9]), look: add(HK, [0, 0.62, 0]), fov: 40 },
      { t: t.step1 - 0.05, pos: add(HK, [0.28, 0.98, 2.25]), look: add(HK, [0, 0.66, 0]), fov: 40, stop: true } ] },
    { id: 'huddle', t0: t.step1, set: 'ice', wx: 0.38, frames: [
      { t: t.step1, pos: [9.5, 5.2, 13.5], look: [0.8, 0.5, 0], fov: 42 },
      { t: t.freeze - 0.1, pos: [9.6, 4.2, 11.2], look: [2.2, 0.6, 0.3], fov: 42, stop: true } ] },
    { id: 'edge', t0: t.freeze - 0.06, set: 'ice', wx: 0.72, frames: [
      { t: t.freeze - 0.06, pos: add(HE, [1.55, 1.08, 1.25]), look: add(HE, [0, 0.8, 0]), fov: 42 },
      { t: t.then - 0.1, pos: add(HE, [1.35, 1.05, 1.08]), look: add(HE, [0, 0.82, 0]), fov: 42, stop: true } ] },
    { id: 'swap', t0: t.then - 0.04, set: 'ice', wx: 0.35, cam: (tt) => { const u = smooth(u01(tt, SW0 + 0.05, SW1)), x = lerp(HE[0], 0, u), z = lerp(HE[2], 0, u); return { pos: [x - 2.4, 2.25, z + 2.3], look: [x + 0.2, 0.85, z], fov: 44 }; } },
    { id: 'middle', t0: t.up - 0.06, set: 'ice', wx: 0.22, frames: [
      { t: t.up - 0.06, pos: [0.18, 1.48, 2.25], look: [0, 0.74, 0], fov: 44 },
      { t: t.step2 - 0.05, pos: [0.14, 1.4, 1.95], look: [0, 0.76, 0], fov: 44, stop: true } ] },
    { id: 'egg', t0: t.step2, set: 'ice', wx: 0.15, frames: [
      { t: t.step2, pos: add(E, [0.15, 1.0, 4.1]), look: add(E, [0, 0.58, 0]), fov: 40 },
      { t: t.dad - 0.1, pos: add(E, [0.1, 0.95, 3.6]), look: add(E, [0.1, 0.58, 0]), fov: 40, stop: true } ] },
    { id: 'feet', t0: t.dad - 0.06, set: 'ice', wx: 0.12, frames: [
      { t: t.dad - 0.06, pos: add(DADP, [0.2, 0.5, 1.75]), look: add(DADP, [0, 0.3, 0]), fov: 40 },
      { t: t.feet + 0.2, pos: add(DADP, [0.2, 1.05, 2.45]), look: add(DADP, [0, 0.55, 0]), fov: 44, stop: true } ] },
    { id: 'months', t0: t.two2 - 0.06, set: 'ice', wx: 0.55, frames: [
      { t: t.two2 - 0.06, pos: add(DADP, [1.5, 0.62, 3.6]), look: add(DADP, [0, 1.15, 0]), fov: 44 },
      { t: t.no - 0.1, pos: add(DADP, [1.3, 0.6, 3.2]), look: add(DADP, [0, 1.15, 0]), fov: 44, stop: true } ] },
    { id: 'food', t0: t.no - 0.06, set: 'ice', wx: 0.25, frames: [
      { t: t.no - 0.06, pos: add(DADP, [0.14, 1.16, 1.7]), look: add(DADP, [0.06, 0.84, 0]), fov: 40 },
      { t: t.step3 - 0.05, pos: add(DADP, [0.12, 1.12, 1.5]), look: add(DADP, [0.06, 0.85, 0]), fov: 40, stop: true } ] },
    { id: 'slide', t0: t.step3, set: 'ice', wx: 0.05, cam: (tt) => { const z = zHero(tt), lying = smooth(u01(tt, FLOP, FLOP + 0.2)); return { pos: [SL_X + 0.65, lerp(0.95, 0.8, lying), z + lerp(2.6, 2.5, lying)], look: [SL_X, lerp(0.62, 0.72, lying), z + 0.1], fov: 42 }; } },
    { id: 'faster', t0: t.faster - 0.04, set: 'ice', wx: 0.05, frames: [
      { t: t.faster - 0.04, pos: [SL_X + 2.5, 0.9, WZ(PASS) - 0.15], look: [SL_X - 0.7, 0.62, WZ(PASS) - 0.15], fov: 40 },
      { t: t.sf4 - 0.1, pos: [SL_X + 2.3, 0.9, WZ(PASS) - 0.05], look: [SL_X - 0.7, 0.62, WZ(PASS) - 0.05], fov: 40, stop: true } ] },
    { id: 'strike', t0: t.sf4 - 0.04, set: 'ice', wx: 0.05, cam: (tt) => { const zc = zHero(Math.min(tt, STRIKE)) - 2.5 + (tt > STRIKE ? 1.2 * (1 - Math.exp(-(tt - STRIKE) * 3)) : 0); return { pos: [SL_X + 0.4, 0.82, zc], look: [SL_X, 0.55, zc + 6], fov: 44 }; } },
    { id: 'seal', t0: t.step4, set: 'ice', wx: 0, frames: [
      { t: t.step4, pos: [51.2, 0.35, 1.9], look: [47.3, 0.25, 0.1], fov: 42 },
      { t: t.never - 0.1, pos: [50.7, 0.28, 1.55], look: [47.4, 0.3, 0.1], fov: 42, stop: true } ] },
    { id: 'never', t0: t.never - 0.06, set: 'ice', wx: 0, frames: [
      { t: t.never - 0.06, pos: [48.7, 1.18, -3.3], look: [LX, 0.72, 0.5], fov: 40 },
      { t: t.push - 0.1, pos: [48.4, 1.12, -3.0], look: [LX, 0.74, 0.5], fov: 40, stop: true } ] },
    { id: 'push', t0: t.push - 0.06, set: 'ice', wx: 0, frames: [
      { t: t.push - 0.06, pos: [50.9, 1.5, 3.3], look: [46.0, 0.55, 0], fov: 46 },
      { t: t.always - 0.1, pos: [51.4, 1.75, 3.7], look: [45.6, 0.65, 0], fov: 48, stop: true } ] },
    { id: 'march', t0: t.always - 0.06, set: 'ice', wx: 0.1, cam: (tt) => { const xf = M_FRONT(t.walkingW); return { pos: [xf + 5.0, 1.15, MZ + 2.3], look: [xf - 2.6, 0.55, MZ - 0.3], fov: 36 }; } },
    { id: 'lone', t0: t.walkingW - 0.04, set: 'ice', wx: 0.15, cam: (tt) => { const x = loneX(tt); return { pos: [x + 3.4, 0.95, MZ + 0.12], look: [x - 60, 6.5, MZ - 0.3], fov: 32 }; } },
    { id: 'teacher', t0: t.tAnd, set: 'off', frames: [
      { t: t.tAnd, pos: O(0.22, 1.32, 3.0), look: O(0, 0.74, 0.0), fov: 46 },
      { t: t.penguinT - 0.1, pos: O(0.15, 1.3, 2.6), look: O(0, 0.74, 0.0), fov: 46, stop: true } ] },
    { id: 'slam', t0: t.penguinT - 0.06, set: 'off', frames: [
      { t: t.penguinT - 0.06, pos: O(0.35, 1.45, 2.4), look: O(-0.1, 0.8, 0.3), fov: 44 },
      { t: t.youre - 0.1, pos: O(0.3, 1.4, 2.1), look: O(-0.1, 0.82, 0.35), fov: 44, stop: true } ] },
    { id: 'cooked', t0: t.youre - 0.06, set: 'lib', cam: face(you, [0.18, -0.02, 2.0], [0, -0.3, 0], 40, 0.1, t.youre, t.so) },
    { id: 'open', t0: t.so - 0.04, set: 'lib', frames: [
      { t: t.so - 0.04, pos: L(0.7, 1.4, 1.5), look: L(0.2, 0.92, -0.95), fov: 44 },
      { t: t.scribe - 0.15, pos: L(0.65, 1.38, 1.3), look: L(0.2, 0.92, -0.95), fov: 44, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.oneS - 0.04, set: 'lib', frames: [
      { t: t.oneS - 0.04, pos: add(sheetW, [0.35, 0.72, 0.85]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42 },
      { t: t.it - 0.1, pos: add(sheetW, [0.3, 0.68, 0.72]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42, stop: true } ] },
    { id: 'solve', t0: t.it - 0.04, set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'pen', t0: t.in - 0.04, set: 'lib', frames: [
      { t: t.in - 0.04, pos: L(0.05, 1.42, 0.75), look: L(0.05, 0.86, -0.8), fov: 46 },
      { t: t.yourH + 0.1, pos: add(sheetW, [0.02, 0.48, 0.32]), look: add(sheetW, [-0.01, 0, -0.04]), fov: 44, stop: true } ] },
    { id: 'macro', t0: t.handwriting - 0.04, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'match', t0: t.yourM - 0.04, set: 'off', frames: [
      { t: t.yourM - 0.04, pos: O(0.05, 1.28, 3.0), look: O(0, 0.84, 0.3), fov: 50 },
      { t: t.mf2 - 0.1, pos: O(0.03, 1.24, 2.65), look: O(0, 0.86, 0.35), fov: 50, keep: true, until: t.plus + 0.3 },
      { t: t.lAnd - 0.05, pos: O(0.03, 1.26, 2.45), look: O(0, 0.88, 0.35), fov: 50, stop: true } ] },
    { id: 'last', t0: t.lAnd - 0.04, set: 'ice', wx: 0.18, cam: (tt) => { const x = lastX(tt), u = smooth(u01(tt, t.lAnd, ENDCARD + 2)); return { pos: [x + 3.3 + 0.8 * u, 0.85, LP[2] + 0.2], look: [x - 60, -3.0, LP[2] - 0.4], fov: 32 }; } },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; if (s.frames) s.rail = makeRail(planRail(s.frames, { move: [0.35, 13], minHold: 0.6 })); });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // the screen insert: straight down the laptop screen's normal (the student + chair hidden: a POV cheat)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) {
    LIB.laptop.scr.updateWorldMatrix(true, false); LIB.laptop.scr.getWorldPosition(scrP); LIB.laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq);
    const d = 1.5; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.02, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.19 - dy, scrP.z], fov: 40 };
  }
  // the macro follow-cam on the pen tip (smoothed so line breaks glide)
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  const chainC = () => { LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(V((540 / sheet.w - 0.5) * 0.432, (0.5 - 1150 / sheet.h) * 0.559, 0)).toArray(); };
  function macroCam(tt) {
    const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length);
    const mp = add(m, [-0.06, 0.28, 0.17]), ml = add(m, [0.01, 0, -0.015]);
    // the food chain: the lens lifts off the pen tip to frame the whole chain as the pen draws it (the money shot)
    const b = smooth(u01(tt, t.stroke - 0.3, t.stroke + 0.25)), c = chainC(), op = add(c, [0.0, 0.8, 0.33]), ol = add(c, [0.0, 0, 0.065]);   // look below the chain: it sits at ~38 %, over the caption band
    return { pos: [0, 1, 2].map((k) => lerp(mp[k], op[k], b)), look: [0, 1, 2].map((k) => lerp(ml[k], ol[k], b)), fov: 42 };
  }

  // ---------------------------------------------------------------- per-frame
  function setWorld(sh) {
    ICE.root.visible = sh.set === 'ice'; LIB.root.visible = sh.set === 'lib'; OFF.root.visible = sh.set === 'off';
    if (sh.set === 'ice') { scene.fog = ICE.fog; scene.background = null; scene.environment = iceEnv; scene.environmentIntensity = 0.55; renderer.toneMappingExposure = 1.0; camera.far = 2600; ICE.setWeather(sh.wx ?? 0.2); }
    else { scene.fog = null; scene.environment = roomEnv; camera.far = 60; }
    if (sh.set === 'lib') { scene.background = new THREE.Color(0x1a1410); renderer.toneMappingExposure = 1.08; scene.environmentIntensity = 0.3; }
    if (sh.set === 'off') { scene.background = new THREE.Color(0x2a241e); renderer.toneMappingExposure = 1.0; scene.environmentIntensity = 0.35; }
    camera.updateProjectionMatrix();
  }
  const hideAll = () => { for (const p of pens) { p.root.visible = false; p.root.rotation.set(0, 0, 0); } for (const r of toons) r.root.visible = false; crowd.hide(); seal.g.visible = false; egg.visible = false; bubble.visible = false; stack.visible = false; shotHand.visible = false; pen.g.visible = false; profSheets.forEach((m) => (m.visible = false)); stamper.visible = false; blizzard.pts.visible = false; flurry.pts.visible = false; };
  const seated = { legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 } };
  const placeEgg = (p, dz = 0.27) => { const w = localW(p, 0, 0.04, dz); egg.position.set(...w); egg.rotation.y = p.root.rotation.y; egg.visible = true; };
  const huddle = (tt, { clearHero = null, clearCam = null, surf = null } = {}) => {
    let i = 0;
    for (const m of HUD) {
      const swirl = 0.05 * (tt - t.step1) * (1 - m.r / 7);   // the slow rotation (everyone takes turns)
      const a = m.a + swirl, x = Math.cos(a) * m.r, z = Math.sin(a) * m.r;
      if (clearHero && Math.hypot(x - clearHero[0], z - clearHero[2]) < 0.55) continue;
      if (clearCam && z > 0.2 && Math.abs(x - clearCam[0]) < 0.32 + 0.5 * z && z < 3) continue;
      let dip = 0; if (surf) { const d = Math.hypot(x - surf[0], z - surf[2]); dip = d < 0.9 ? 0.12 * (1 - d / 0.9) : 0; }
      crowd.set(i++, { x, z, y: -dip + 0.012 * Math.sin(tt * 3 + m.ph), rotY: m.ry + 0.08 * Math.sin(tt * 1.3 + m.ph), roll: 0.05 * Math.sin(tt * 2.4 + m.ph), s: m.s });
    }
    crowd.commit(i);
  };

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; setWorld(sh); hideAll();
    LIB.laptop.hinge.rotation.x = PI / 2 - 0.02; LIB.scrL.intensity = 0; LIB.chair.visible = true; LIB.setClock(10, 20);
    const sw = Math.sin(tt * 2.1);
    let night = 0;

    // ----- the ice
    if (id === 'hook') {
      hero.root.visible = true; const dr = driftAt(tt), blinkK = Math.abs(tt - (t.ant + 0.32)) < 0.07 || Math.abs(tt - 0.9 - 0.4) < 0.06;
      const hit = DRIFT.slice(1).reduce((s, [tb]) => (tt > tb && tt < tb + 0.25 ? squash(tt, tb, 0.18) : s), [1, 1]);
      hero.set({ x: HK[0], z: HK[2], rotY: 0.14, drift: dr, frost: 0.25 + 0.6 * u01(tt, 0, t.step1), eyes: blinkK ? 'closed' : 'half', look: [0.05, 0.05], brows: 0.25, mouth: 'flat', flipL: { z: 0.16 }, flipR: { z: 0.16 }, squash: hit, t: tt });
    }
    if (id === 'huddle' || id === 'edge' || id === 'swap' || id === 'middle' || id === 'egg' || id === 'months') {
      const surfP = id === 'swap' && tt > SW0 + 0.12 && tt < SW1 ? [lerp(HE[0], 0, smooth(u01(tt, SW0 + 0.12, SW1))), 0, lerp(HE[2], 0, smooth(u01(tt, SW0 + 0.12, SW1)))] : null;
      huddle(tt, { clearHero: id === 'middle' ? [0, 0, 0] : null, clearCam: id === 'middle' ? [0.15, 0, 2] : null, surf: surfP });
    }
    if (id === 'huddle' || id === 'edge' || id === 'swap') {
      hero.root.visible = true;
      if (id !== 'swap' || tt < SW0) {
        const iced = smooth(u01(tt, FRZ - 0.04, FRZ + 0.1)), shiv = id === 'edge' && tt < FRZ ? 0.012 * Math.sin(tt * 70) : 0;
        hero.set({ x: HE[0] + shiv, z: HE[2], rotY: 1.15, ice: id === 'huddle' ? 0 : iced, frost: id === 'huddle' ? 0.3 : 0.75, eyes: iced > 0.5 ? 'wide' : 'half', look: iced > 0.5 ? [Math.sign(Math.sin(tt * 9)) * 0.8, 0.1] : [0, 0], brows: 0.8, mouth: iced > 0.5 ? 'flat' : 'o', flipL: { z: iced > 0.5 ? 0.06 : 0.25 + 0.1 * Math.sin(tt * 40) }, flipR: { z: iced > 0.5 ? 0.06 : 0.25 + 0.1 * Math.sin(tt * 43) }, roll: shiv * 4, t: tt });
      } else {   // crowd-surfing into the middle
        const u = smooth(u01(tt, SW0 + 0.12, SW1)), up = smooth(u01(tt, SW0, SW0 + 0.18)), down = smooth(u01(tt, SW1 - 0.12, SW1 + 0.05));
        const x = lerp(HE[0], 0, u), z = lerp(HE[2], 0, u), y = 1.0 * up * (1 - down) + 0.04 * Math.sin(tt * 18) * up * (1 - down);
        hero.set({ x, y, z, rotY: -PI / 2 - 0.35, lie: up * (1 - down), flipL: { z: 1.4 }, flipR: { z: 1.4 }, eyes: 'wide', mouth: 'scream', brows: -0.2, frost: 0.4 * (1 - u), feetX: 0.4 * Math.sin(tt * 30), t: tt });
      }
    }
    if (id === 'middle') {
      hero.root.visible = true; const fan = Math.sin(tt * 24);
      hero.set({ x: 0, z: 0, rotY: 0.05, hot: 0.85 * smooth(u01(tt, t.up - 0.1, t.t37)), shades: true, mouth: 'smile', head: { x: -0.18, z: 0.1 * Math.sin(tt * 2) }, flipR: { z: 1.0 + 0.35 * fan, x: -0.6 }, flipL: { z: 0.2 }, eyes: 'half', t: tt });
    }
    if (id === 'egg') {
      hero.root.visible = mom.root.visible = true;
      const looks = tt > t.egg - 0.1 && tt < MOMGO, leaving = tt > MOMGO, wu = u01(tt, MOMGO + 0.25, MOMGO + 1.6);
      const mp = leaving ? add(MOMP, [-0.9 * wu, 0, -3.2 * wu]) : MOMP;
      const mRot = leaving ? lerp(PI / 2 - 0.55, PI + 0.35, smooth(u01(tt, MOMGO, MOMGO + 0.3))) : PI / 2 - 0.55;
      mom.set({ x: mp[0], z: mp[2], rotY: mRot, waddle: leaving && tt > MOMGO + 0.25 ? tt * 9 : null, shades: tt > t.leaves + 0.05, eyes: looks ? 'happy' : 'open', look: looks ? [0, -0.6] : [0.3, 0], head: { x: looks ? 0.35 : 0 }, mouth: 'smile',
        flipL: leaving ? { z: 0.2 } : { z: 0.15 }, flipR: leaving && tt > MOMGO + 0.7 ? { z: 2.2 + 0.4 * Math.sin(tt * 12) } : { z: 0.15 }, feetX: tt > HOP0 - 0.1 && tt < HOP0 + 0.1 ? -0.5 : 0, t: tt });
      const caught = tt > HOP1, wob = caught ? 0.07 * Math.exp(-(tt - HOP1) * 3) * Math.sin((tt - HOP1) * 18) : 0;
      hero.set({ x: DADP[0], z: DADP[2], rotY: -PI / 2 + 0.55, eyes: tt > HOP0 ? 'wide' : 'open', look: tt > HOP0 ? [0, -0.7] : looks ? [0, -0.6] : [-0.3, 0], head: { x: tt > HOP0 || looks ? 0.4 : 0 }, brows: tt > HOP0 ? 0.7 : 0, mouth: tt > HOP0 && tt < HOP1 ? 'o' : 'flat',
        flipL: { z: caught ? 0.7 + 0.3 * Math.sin(tt * 9) : 0.15 }, flipR: { z: caught ? 0.7 - 0.3 * Math.sin(tt * 9) : 0.15 }, roll: wob, squash: caught ? squash(tt, HOP1, 0.2) : [1, 1], t: tt });
      // the egg: on Mom's feet → a hop onto Dad's
      if (tt < HOP0) placeEgg(mom);
      else if (tt < HOP1) { const a = localW(mom, 0, 0.04, 0.27), b = localW(hero, 0, 0.04, 0.27), u = u01(tt, HOP0, HOP1); egg.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 0.32 * 4 * u * (1 - u), lerp(a[2], b[2], u)); egg.rotation.z = u * TAU; egg.visible = true; }
      else placeEgg(hero);
    }
    if (id === 'feet') {
      hero.root.visible = true; const bal = Math.sin(tt * 5.5);
      hero.set({ x: DADP[0], z: DADP[2], rotY: 0, pouch: smooth(u01(tt, t.holds, t.feet - 0.05)) * 0.55, eyes: 'wide', look: [0.1 * bal, -0.9], head: { x: 0.42, z: 0.06 * bal }, brows: 0.75, mouth: 'flat', flipL: { z: 0.95 + 0.25 * bal }, flipR: { z: 0.95 - 0.25 * bal }, roll: 0.02 * bal, t: tt });
      placeEgg(hero);
    }
    if (id === 'months' || id === 'food') {
      hero.root.visible = true; const u = u01(tt, N0, N3);
      night = id === 'months' ? (tt < N1 ? smooth(u01(tt, N0, N1)) : tt < N2 ? 1 : 1 - 0.65 * smooth(u01(tt, N2, N3))) : 0.35;
      ICE.night.rotation.y = (tt - N0) * 1.6;
      if (id === 'months') hero.set({ x: DADP[0], z: DADP[2], rotY: 0.3, pouch: 0.6, frost: 0.2 + 0.8 * u, drift: 0.3 * u, eyes: tt > N1 ? 'closed' : 'half', mouth: 'flat', brows: 0.3, flipL: { z: 0.12 }, flipR: { z: 0.12 }, thin: 0.6 * u, t: tt });
      else {
        const tw = Math.sin(tt * 31) > 0.55;
        hero.set({ x: DADP[0], z: DADP[2], rotY: 0.12, pouch: 0.6, frost: 0.95, thin: 0.9, eyes: 'half', look: [0.55, 0.45], brows: 0.75, mouth: tt > t.food ? 'o' : 'flat', head: { x: -0.08, y: 0.15 }, flipL: { z: 0.08 }, flipR: { z: 0.08 }, t: tt });
        if (tw) hero.eyes[1].lid.rotation.x = 0.9;
        bubble.visible = tt > t.food - 0.12; const h = headW(hero), k = easeOutBack(u01(tt, t.food - 0.12, t.food + 0.2));
        bubble.position.set(h[0] + 0.24, h[1] + 0.14, h[2] + 0.12); bubble.scale.set(0.3 * k, 0.246 * k, 1);
      }
      placeEgg(hero);
      for (const m of [egg]) m.visible = id === 'months' && tt < N1;
    }
    if (id === 'slide' || id === 'faster' || id === 'strike') {
      hero.root.visible = true; const z = zHero(tt), lying = id === 'slide' ? clamp(easeOutBack(u01(tt, FLOP, FLOP + 0.22))) : 1, going = tt > GO;
      hero.set({ x: SL_X, z, rotY: 0, lie: lying, waddle: lying < 0.05 ? tt * 9 : null, eyes: going ? 'happy' : lying > 0.5 ? 'wide' : 'half', mouth: going ? 'scream' : 'flat', brows: going ? -0.3 : 0.2,
        flipL: going ? { z: 0.3, x: 0.9 } : { z: 0.15 + 1.1 * lying }, flipR: going ? { z: 0.3, x: 0.9 } : { z: 0.15 + 1.1 * lying }, feetX: going ? 0.3 * Math.sin(tt * 28) : 0, t: tt });
      if (id === 'faster') {   // the walker he overtakes: side-eye, then the draft spins him round
        const w = ext[0]; w.root.visible = true; const spun = smooth(u01(tt, PASS + 0.04, PASS + 0.5));
        w.set({ x: SL_X - 1.0, z: WZ(tt), rotY: spun * TAU, waddle: tt * 9, eyes: tt > PASS + 0.5 ? 'half' : 'open', look: tt < PASS ? [0.8, 0] : [0, 0], head: { y: tt < PASS ? 1.0 : 0.6 * (1 - spun) }, mouth: tt > PASS && tt < PASS + 0.5 ? 'o' : 'flat', brows: 0.3, frost: 0, t: tt });
      }
      if (id === 'strike') PINS.forEach((p, i) => {
        const P = ext[i], v = PIN_V[i], a = tt - v.t0; P.root.visible = true;
        if (a < 0) { const scared = tt > t.sf4 + 0.1; P.set({ x: p.x, z: p.z, rotY: PI, eyes: scared ? 'wide' : 'open', look: [0, -0.2], brows: scared ? 0.8 : 0, mouth: scared ? 'scream' : 'flat', flipL: { z: scared ? 1.6 : 0.15 }, flipR: { z: scared ? 1.6 : 0.15 }, t: tt }); return; }
        const tl = 2 * v.vy / 9.8, aa = Math.min(a, tl), y = Math.max(0, v.vy * aa - 4.9 * aa * aa);
        P.set({ x: p.x + v.vx * aa, y, z: p.z + v.vz * aa, rotY: PI, eyes: a > tl ? 'x' : 'spiral', mouth: 'scream', flipL: { z: 2 }, flipR: { z: 2 }, t: tt });
        P.root.rotation.x = a < tl ? v.sx * a : PI / 2 * Math.sign(v.sx); P.root.rotation.z = a < tl ? v.sz * a : 0;
        if (a >= tl) P.root.position.y = 0.3;
      });
    }
    if (id === 'seal' || id === 'never' || id === 'push') {
      const line = [ext[0], hero, kevin, ext[1], ext[2]];
      line.forEach((P, i) => {
        P.root.visible = true; const z = LINE_Z[i], peek = id === 'never' ? 0.35 : id === 'seal' ? 0.25 : 0.15;
        const toK = i === 2 ? 0 : (i < 2 ? 1 : -1) * 1.1, looking = id === 'never' && tt > t.first - 0.2;
        if (i === 2 && id === 'push' && tt > PUSH) {   // Kevin: shoved in, splash, rockets out, lands on his belly
          const fall = u01(tt, PUSH, SPLASH), roc = u01(tt, ROCKET, KLAND), landed = tt > KLAND;
          let x, y, lie;
          if (tt < ROCKET) { x = LX + 1.1 * smooth(fall); y = 0.22 * Math.sin(PI * Math.min(1, fall * 1.4)) - 1.05 * fall * fall * fall - (tt > SPLASH ? 0.5 : 0); lie = smooth(fall) * 0.9; }
          else if (!landed) { x = lerp(LX + 1.2, LX - 2.4, roc); y = (ICE.D.waterY - 0.5) * (1 - roc) + 2.6 * 4 * roc * (1 - roc); lie = 0.2 + roc * 0.8; }
          else { x = LX - 2.4 - 0.9 * (1 - Math.exp(-(tt - KLAND) * 3)); y = 0; lie = 1; }
          P.set({ x, y, z, rotY: tt > ROCKET ? -PI / 2 : PI / 2, lie, eyes: landed ? 'spiral' : tt > ROCKET ? 'wide' : 'wide', mouth: 'scream', flipL: { z: 1.8 }, flipR: { z: 1.8 }, t: tt });
          return;
        }
        const shove = id === 'push' && (i === 1 || i === 3) && tt > PUSH - 0.12 && tt < PUSH + 0.4;
        const recoil = id === 'push' && tt > LUNGE;
        P.set({ x: LX - (i === 2 ? 0 : 0.05), z, rotY: PI / 2 + (looking ? toK * 0.6 : 0) + (shove ? toK * 0.8 : 0), lean: shove ? 0.25 : recoil ? -0.15 : peek, eyes: recoil ? 'wide' : i === 2 && id !== 'seal' ? 'happy' : 'wide', look: looking ? [toK > 0 ? 0.8 : -0.8, -0.1] : [0, -0.6], brows: i === 2 ? 0 : 0.7,
          mouth: recoil ? 'scream' : i === 2 ? 'smile' : 'flat', head: { x: recoil ? -0.2 : 0.35, y: looking ? toK * 0.5 : 0 }, flipL: shove && i === 3 ? { z: 0.3, x: -1.4 } : { z: recoil ? 1.5 : 0.15 }, flipR: shove && i === 1 ? { z: 0.3, x: -1.4 } : { z: recoil ? 1.5 : 0.15 }, t: tt });
      });
      seal.g.visible = true; seal.g.position.set(...SEAL_P); seal.g.rotation.y = id === 'seal' ? 1.1 : -PI / 2;
      if (id === 'seal') seal.set({ rise: smooth(u01(tt, RISE0, RISE0 + 0.3)), open: tt > GRIN ? 0.75 * easeOutBack(u01(tt, GRIN, GRIN + 0.25)) : 0 });
      else if (id === 'never') { seal.g.position.set(SEAL_P[0] + 0.6, SEAL_P[1], SEAL_P[2] + 0.4); seal.set({ rise: 0.42 + 0.03 * Math.sin(tt * 2), open: 0 }); }
      else { seal.g.position.set(LX + 1.35, SEAL_P[1], LINE_Z[2]); seal.set({ rise: tt < LUNGE ? 0 : smooth(u01(tt, LUNGE, LUNGE + 0.15)) * (1 - smooth(u01(tt, CHOMP + 0.35, CHOMP + 0.8))), lunge: tt > LUNGE && tt < CHOMP + 0.4 ? 0.6 : 0, open: tt < CHOMP ? smooth(u01(tt, LUNGE, LUNGE + 0.1)) : 0 }); }
    }
    if (id === 'march' || id === 'lone') {
      for (let i = 0; i < 8; i++) {
        if (id === 'lone' || i === 3) continue;
        const P = ext[i]; P.root.visible = true; const x = MX0 + i * 0.9 + 0.45 * Math.max(0, tt - t.wAnd + 0.3);
        P.set({ x, z: MZ + 0.22 * Math.sin(i * 2.3), rotY: PI / 2, waddle: tt * 9 + i, eyes: 'open', look: [0.2, 0], t: tt });
      }
      const P = ext[9]; P.root.visible = true; const turning = tt > TURN0, ru = smooth(u01(tt, TURN0, TURN1));
      const walk = tt < t.one || tt > TURN1;
      P.set({ x: loneX(tt), z: MZ, rotY: PI / 2 + PI * ru, waddle: walk ? tt * 8 : null, eyes: turning ? 'half' : 'open', brows: 0.1, mouth: 'flat', t: tt });
    }
    if (id === 'last') {
      const P = ext[9]; P.root.visible = true; const look = smooth(u01(tt, t.still - 0.05, t.still + 0.3)) * (1 - smooth(u01(tt, t.wayL + 0.2, t.wayL + 0.5)));
      const walk = tt < t.still - 0.05 || tt > t.wayL + 0.45;
      P.set({ x: lastX(tt), z: LP[2], rotY: -PI / 2 + 1.5 * look, waddle: walk ? tt * 8 : null, head: { y: 0.9 * look }, eyes: 'half', look: [0.4 * look, 0], brows: 0.15, mouth: 'flat', t: tt });
    }
    if (sh.set === 'ice') {
      ICE.setNight(night); ICE.update(tt, camera);
      const sn = (sh.wx ?? 0) >= 0.5 ? blizzard : flurry; sn.pts.visible = true;
      const f = V(0, 0, -1).applyQuaternion(camera.quaternion), c = camera.position;
      sn.update(tt, [c.x + f.x * 6, c.y + f.y * 6, c.z + f.z * 6], sn === blizzard ? [-7, 1.2] : [-1.2, 0.3]);
      ICE.aimSun(...({ hook: [HK[0], HK[2], 6], huddle: [0, 0, 12], edge: [HE[0], HE[2], 5], swap: [2, 0.5, 9], middle: [0, 0, 4], egg: [E[0], E[2], 6], feet: [DADP[0], DADP[2], 4], months: [DADP[0], DADP[2], 6], food: [DADP[0], DADP[2], 4],
        slide: [SL_X, zHero(tt), 6], faster: [SL_X, WZ(PASS), 6], strike: [SL_X, PINZ, 9], seal: [46, 0, 7], never: [46, 0, 5], push: [46, 0, 7], march: [M_FRONT(t.walkingW) - 3, MZ, 9], lone: [loneX(tt), MZ, 6], last: [lastX(tt), LP[2], 6] }[id] || [0, 0, 10]));
    }

    // ----- the professor (biology teacher)
    if (sh.set === 'off') {
      prof.root.visible = true; OFF.desk.visible = OFF.front.visible = OFF.mug.visible = OFF.handle.visible = id !== 'match';
      if (id === 'teacher' || id === 'slam') {
        stack.visible = id === 'slam' || tt > t.penguinT - 0.1;
        const held = tt < SLAM, raise = smooth(u01(tt, t.tf3 - 0.1, t.handwritten - 0.12)), down = tt > STAMP - 0.06;
        sheet.draw(0);
        const s0 = O(0.0, 1.32, 0.38), s1 = O(-0.18, 0.82, 0.52); const u = u01(tt, SLAM - 0.12, SLAM);
        if (held) stack.position.set(...(id === 'slam' ? [lerp(s0[0], s1[0], u * u), lerp(s0[1], s1[1], u * u), lerp(s0[2], s1[2], u * u)] : s0)); else { const [sx, sy] = squash(tt, SLAM, 0.25); stack.position.set(...s1); stack.scale.set(sx, sy, sx); }
        stack.rotation.set(held ? -0.25 * (1 - u) : 0, 0.08, 0); imprint.visible = tt > STAMP;
        imprint.scale.setScalar(tt > STAMP ? 1 + 0.4 * Math.exp(-(tt - STAMP) * 14) : 1);
        stamper.visible = tt > t.tf3 - 0.3;
        const wi = id === 'teacher' ? smooth(u01(tt, t.tAnd - 0.05, t.biology + 0.1)) : 1, walking = wi > 0.01 && wi < 0.99;
        prof.set({ x: OO[0] + 1.3 * (1 - wi), y: 0, z: OO[2] - 0.1, rotY: walking ? -PI / 2 + 0.5 * wi : 0, walk: walking ? tt * 9 : null, lean: held ? 0.05 : 0.22, t: tt,
          armL: held ? { x: -1.45, z: 0.25, el: 0.5 } : { x: -0.5, z: 0.3, el: 1.0 },
          armR: held && tt < t.tf3 - 0.3 ? { x: -1.45, z: 0.25, el: 0.5 } : stamper.visible ? (down ? { x: -1.05, z: -0.15, el: 0.55 } : { x: -2.4 * raise - 0.6, z: 0.2, el: 1.4 * raise + 0.2 }) : { x: -0.5, z: 0.3, el: 1.0 },
          eyes: tt > SLAM ? 'open' : 'half', mouth: tt > STAMP ? 'grin' : 'flat', brows: -0.8, look: [0, -0.2], head: { x: tt > SLAM ? 0.15 : 0, y: 0.08 * Math.sin(tt * 1.7 + 1) } });
      }
      if (id === 'match') {
        old.draw(old.total, false); sheet.draw(N);
        const react = tt > t.mf2 - 0.05, darts = Math.sign(Math.sin((tt - t.yourM) * 7.5));
        prof.set({ x: OO[0], y: 0, z: OO[2] + 0.05, rotY: 0, armL: { x: -0.9, z: 1.0, el: 0.9 }, armR: { x: -0.9, z: 1.0, el: 0.9 }, eyes: react ? 'wide' : 'half', mouth: tt > t.plus ? 'grin' : react ? 'o' : 'flat', brows: react ? 1 : -0.6,
          look: react ? [0, 0.2] : [darts * 0.7, -0.3], head: { x: react ? -0.1 : 0.1, y: react ? 0 : darts * 0.12 }, t: tt });
        profSheets.forEach((m, i) => { m.visible = true; const sep = 0.37 + 0.03 * Math.sin((tt - t.yourM) * 2.2) * (react ? 0 : 1); m.position.set(OO[0] + (i ? 1 : -1) * sep, 0.98 + (react && i ? 0.05 * Math.exp(-(tt - t.mf2) * 6) : 0), OO[2] + 0.42); m.rotation.set(-0.08, (i ? -1 : 1) * 0.14, (i ? -1 : 1) * 0.05); });
        aPlus.visible = tt > t.plus - 0.02; aPlus.scale.setScalar(aPlus.visible ? easeOutBack(u01(tt, t.plus - 0.02, t.plus + 0.22)) * 1.3 : 1);
      }
    }
    // ----- the library desk: the student, the laptop, the app, the pen (as 049/058)
    if (sh.set === 'lib') {
      const pov = id === 'macro'; you.root.visible = !pov && id !== 'screen' && id !== 'solve';
      const cooked = id === 'cooked', opened = id === 'open' || id === 'pen' || id === 'photo';
      you.set({ x: SEAT[0], y: SEAT[1], z: SEAT[2], ...seated, lean: 0.3, t: tt, armL: { x: -0.35, z: 0.4, el: 1.5 }, armR: opened && tt < LIDO1 + 0.2 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: cooked ? 'spiral' : opened ? 'wide' : 'half', mouth: cooked ? 'wavy' : opened ? 'o' : 'flat', brows: cooked ? 0.9 : 0.5, look: opened ? [0.35, -0.35] : [0, 0], head: { x: 0.1, z: cooked ? 0.1 * Math.sin(tt * 18) : 0 }, faceTint: cooked ? [0xff6b6b, 0.22] : opened ? [0xd8e6ff, 0.12] : [0, 0] });
      if (id === 'screen' || id === 'solve') LIB.chair.visible = false;
      const lidOpen = tt > LIDO0 && tt > t.so - 0.2;
      LIB.laptop.hinge.rotation.x = lidOpen ? lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tt, LIDO0, LIDO1))) : PI / 2 - 0.02; LIB.scrL.intensity = lidOpen ? 1.6 : 0;
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 - 0.25 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      const wp = writeP(tt); sheet.draw(tt > t.so - 0.2 ? wp : 0); screen.draw({ mode, k });
      LIB.setClock(11, cooked ? 52 : 54);
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
    void sw;

    // ----- camera
    const cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    studio.fill.intensity = sh.set === 'ice' ? (night > 0.5 ? 1.1 : 0.45) : 0.55; studio.fill.distance = 7;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 063-fword-penguins --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['you', you], ['the teacher', prof], ['the hero penguin', hero], ['Mom', mom], ['Kevin', kevin], ...ext.map((p, i) => ['penguin ' + (i + 1), p])];
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
