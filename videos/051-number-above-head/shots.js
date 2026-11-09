// 051 — Scribe promo: "In my town, everyone has a number above their head: how many hours of homework they have left."
// The viral number-over-heads trope as a toon town tour (049's look: toon cast + brprops makeCrowd + hard cuts between places, one
// gliding rail per shot), one gag per place: a dog at 0 (he ate it), the class president always at 0 (suspicious), a couple whose
// numbers match to the minute (copying), a 42-year-old dropout on the subway at 9,000 and still climbing, a party liar at 61, Mr.
// Dawson's GRADING number. Tyler sits at 312; finals week pushes it to 800; forty handwritten-only calc problems due at midnight →
// he's cooked → Scribe (tryscribe.ink): one photo of the worksheet, all forty solved, written out in HIS handwriting stroke by
// stroke (the glyphs are Scribe's own demo handwriting set, videos/049-scribe-promo/hand.json) → his number crashes to 0 and the
// whole library turns around. Payoff: the class president had Scribe all along; by Friday the whole town is at 0; except Mr.
// Dawson, who now has to grade all of it (his number explodes). Scribe end card.
// Product facts (Scribe repo README + tryscribe.ink, Nov 2026): photo/PDF upload → every problem solved with worked steps →
// written in a handwriting cloned from one practice sheet, drawn stroke by stroke like a pen → PDF; "10 free assignments".
// Numbers: engine/build/numtags.js (camera-facing badges sized for the lens every frame; 0 green, <100 yellow, <500 orange, red).
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad, drop } from '@engine/build/anim.js';
import { makeFX } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeCrowd, makeSpecs } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice as buildLounge, makePen, makeLaptop, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { makeNumTags } from '@engine/build/numtags.js';
import { buildHallway } from '@engine/build/school.js';
import { makeDalmatian } from '@engine/build/firetruck.js';
import { tex } from '@engine/build/lighthouse.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildRestaurant } from '@engine/sets/restaurant.js';
import { buildSubway } from '@engine/sets/subway.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const ASSET = '/videos/049-scribe-promo/';
const OFF = { street: [0, 0, 0], hall: [1000, 0, 0], cafe: [2000, 0, 0], sub: [3000, 0, 0], party: [4000, 0, 0], lounge: [5000, 0, 0], lib: [6000, 0, 0] };
const O = (k, x, y, z) => [OFF[k][0] + x, OFF[k][1] + y, OFF[k][2] + z];
const SH = SIDEWALK_H;
/** A look point on the vertical through head H so that H projects at fraction f of the frame height (0.4 = the build look: the
 *  face sits above the one-word caption at 52 %, its number above it). Pitch-only maths, exact for a head on the centre line. */
const aimAt = (C, H, fov, f = 0.4) => { const d = Math.hypot(H[0] - C[0], H[2] - C[2]), a = Math.atan2(C[1] - H[1], d) + Math.atan((1 - 2 * f) * Math.tan((fov * PI) / 360)); return [H[0], C[1] - d * Math.tan(a), H[2]]; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  renderer.localClippingEnabled = true;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), WE = (b, w, n) => B.WE(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand(ASSET + 'hand.json'), icon = await loadImg(ASSET + 'scribe-icon.png');

  // ---------------------------------------------------------------- word times
  const t = {
    in: W('hook', 'in'), everyone: W('hook', 'everyone'), number: W('hook', 'number'), head: W('hook', 'head'), its: W('hook', 'its'), hours: W('hook', 'hours'), homework: W('hook', 'homework'), left: W('hook', 'left'),
    dog: W('dog', 'dog'), dzero: W('dog', 'zero'), ate: W('dog', 'ate'), dit: W('dog', 'it'),
    pclass: W('pres', 'class'), president: W('pres', 'president'), pzero: W('pres', 'zero'), always2: W('pres', 'always', 2), nobody: W('pres', 'nobody'), trusts: W('pres', 'trusts'),
    these: W('couple', 'these'), match: W('couple', 'match'), minute: W('couple', 'minute'), love: W('couple', 'love'), copying: W('couple', 'copying'),
    guy: W('subway', 'guy'), nine: W('subway', 'nine'), hes: W('subway', 'hes'), dropped: W('subway', 'dropped'), still: W('subway', 'still'), going: W('subway', 'going'), up: W('subway', 'up'),
    parties: W('party', 'parties'), lie: W('party', 'lie'), yeah: W('party', 'yeah'), caught: W('party', 'caught'), sixtyone: W('party', 'sixtyone'),
    teachers: W('lounge', 'teachers'), mister: W('lounge', 'mister'), grading: W('lounge', 'grading'), four: W('lounge', 'four'), hoursL: W('lounge', 'hours'),
    and: W('tyler', 'and'), three: W('tyler', 'three'), finals: W('tyler', 'finals'), hits: W('tyler', 'hits'), five: W('tyler', 'five'), eight: W('tyler', 'eight'),
    forty: W('obstacle', 'forty'), handwritten: W('obstacle', 'handwritten'), due: W('obstacle', 'due'), midnight: W('obstacle', 'midnight'),
    im: W('cooked', 'im'), cooked: W('cooked', 'cooked'), so: W('cooked', 'so'), opens: W('cooked', 'open'), scribe: W('cooked', 'scribe'),
    one: W('solve', 'one'), photo: W('solve', 'photo'), scribe2: W('solve', 'scribe'), solves: W('solve', 'solves'), forty2: W('solve', 'forty'),
    then: W('hand', 'then'), writes: W('hand', 'writes'), my: W('hand', 'my'), handwriting: W('hand', 'handwriting'), stroke: W('hand', 'stroke'), even: W('hand', 'even'), lazy: W('hand', 'lazy'), sevens: W('hand', 'sevens'),
    myN: W('zero', 'my'), drops: W('zero', 'drops'), zero: W('zero', 'zero'), whole: W('zero', 'whole'), turns: W('zero', 'turns'), around: W('zero', 'around'),
    rturns: W('reveal', 'turns'), rpres: W('reveal', 'president'), rscribe: W('reveal', 'scribe'), along: W('reveal', 'along'),
    by: W('spread', 'by'), friday: W('spread', 'friday'), town: W('spread', 'town'), z1: W('spread', 'zero', 1), z2: W('spread', 'zero', 2), z3: W('spread', 'zero', 3),
    except: W('dawson', 'except'), dawson: W('dawson', 'dawson'), now: W('dawson', 'now'), grade: W('dawson', 'grade'), all: W('dawson', 'all'), it: W('dawson', 'it'),
  };
  const ENDCARD = Math.min(WE('dawson', 'it') + 0.3, END - 4.0);

  // ---------------------------------------------------------------- sets (one root visible per shot)
  const ST = buildStreet(studio), streetFog = scene.fog, streetFar = studio.camera.far;
  ST.cart.visible = false; ST.trash.visible = false;   // the hook's lens stands on the sidewalk where the hot-dog cart + bin were
  const HW = buildHallway(studio); HW.root.position.set(...OFF.hall);
  const RS = buildRestaurant(studio); RS.root.position.set(...OFF.cafe);
  const SB = buildSubway(studio); SB.root.position.set(...OFF.sub);
  const LR = buildLivingRoom(studio); LR.root.position.set(...OFF.party); LR.setMode('dinner');
  const LG = buildLounge(studio); LG.root.position.set(...OFF.lounge);
  const sheet = makeSheet(G, { seed: 9, title: 'CALC 1 · FINAL REVIEW', note: 'Due TONIGHT, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 7', problems: [
    { q: '1.  ∫ x sin x dx', a: '= -x cos x + sin x + C' },
    { q: '2.  d/dx [ ln(x² + 1) ]', a: '= 2x / (x^2 + 1)' },
    { q: '3.  lim (x→0)  sin(3x) / x', a: '= 3' },
    { q: '4.  ∫ (7x⁶ + 77) dx', a: '= x^7 + 77x + 7 + C' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  Σ 1/n²  (n = 1 → ∞)', a: '= π^2/6' },
  ] });
  const spare = makeSheet(G, { seed: 21, title: 'CALC 1 · FINAL REVIEW', note: 'Due TONIGHT, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 2 of 7', problems: [{ q: '7.  ∫ cos²x dx', a: 'x/2 + sin(2x)/4 + C', pre: true }, { q: '8.  d/dx eˣ²', a: '2x e^x^2', pre: true }, { q: '9.  ∫ ln x dx', a: 'x ln x - x + C', pre: true }, { q: '10.  lim (1 + 1/n)ⁿ', a: '= e', pre: true }, { q: '11.  y′ = 3y', a: 'y = Ce^3x', pre: true }, { q: '12.  ∫ 1/x dx', a: 'ln|x| + C', pre: true }] });
  const screen = makeScreen(G, icon, sheet), homeScreen = makeScreen(G, icon, sheet);
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon }); LIB.root.position.set(...OFF.lib);
  const L = (x, y, z) => O('lib', x, y, z), Y = LD.deskY;
  const roots = { street: ST.root, hall: HW.root, cafe: RS.root, sub: SB.root, party: LR.root, lounge: LG.root, lib: LIB.root };

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const hairM = (c) => std(c, 0.75);
  function girlHair(toon, color, { pony = false, long = false, bow = null } = {}) {
    const m = hairM(color);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.296, 28, 18, PI - 0.5, PI + 1.0, 0, PI * (long ? 0.74 : 0.66)), m); back.castShadow = true; toon.head.add(back);
    if (long) { const fall = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.22, 6, 14), m); fall.position.set(0, -0.26, -0.13); fall.scale.set(1.25, 1, 0.6); toon.head.add(fall); }
    if (pony) { [[0.1, -0.31, 0.1], [-0.03, -0.37, 0.085], [-0.16, -0.38, 0.068]].forEach(([y, z, r]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); b.position.set(0, y, z); b.scale.set(1, 1.25, 1); toon.head.add(b); }); }
    if (bow) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.022, 8, 16), std(bow, 0.5)); b.position.set(0, 0.2, -0.24); b.rotation.x = 0.6; toon.head.add(b); }
  }
  const tyler = mk1({ shirt: 0x2c3e66, pants: 0x3d3d3d, hair: 0x3a2a1c, hairStyle: 'messy', skin: 0xe0a97e });
  { const hood = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.07, 10, 20), tyler.M.shirt); hood.position.set(0, 0.36, -0.1); hood.rotation.x = PI / 2 - 0.55; hood.scale.set(0.95, 0.95, 0.8); tyler.armL.g.parent.add(hood); }
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), std(0xffc93c, 0.5)); tyler.hand(1).add(pencil); pencil.position.set(0, -0.03, 0.05); pencil.rotation.x = 1.2;
  const maya = mk1({ shirt: 0x1d3d6b, pants: 0x2f2f38, hair: 0x2b1d14, hairStyle: 'side', skin: 0xc68863 });
  girlHair(maya, 0x2b1d14, { bow: 0xffd23f });
  { const sash = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.6, 0.36), std(0xffd23f, 0.45, { metalness: 0.2 })); sash.position.set(0, 0.2, 0.0); sash.rotation.z = 0.62; maya.armL.g.parent.add(sash); }
  const jake = mk1({ shirt: 0x3a86ff, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'messy', skin: 0xf6d2b0 });
  const emma = mk1({ shirt: 0xffb703, pants: 0x2f3e5a, hair: 0xb5502c, hairStyle: 'side', skin: 0xf2c29a });
  girlHair(emma, 0xb5502c, { pony: true });
  const doug = mk1({ shirt: 0xe9eef2, pants: 0x3d4450, hair: 0x6b5a4a, hairStyle: 'side', skin: 0xf2c29a, mustache: true });
  { const tor = doug.armL.g.parent, tie = std(0xc1121f, 0.5); const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.24, 0.02), tie); t1.position.set(0, 0.17, 0.15); t1.rotation.x = -0.12; tor.add(t1); const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), tie); k.position.set(0, 0.31, 0.135); tor.add(k); }
  const chad = mk1({ shirt: 0x2ec4b6, pants: 0x5a4a3a, hair: 0x8a5a2b, hairStyle: 'tuft', skin: 0xe0a97e, hat: 'cap', hatColor: 0xe63946 });
  const zoe = mk1({ shirt: 0xff8fab, pants: 0x24324a, hair: 0x1a1a1a, hairStyle: 'side', skin: 0x9c6644 });
  girlHair(zoe, 0x1a1a1a, { long: true });
  const dawson = mk1({ shirt: 0x6b8e4e, pants: 0x4a4038, hair: 0x9a9a9a, hairStyle: 'side', skin: 0xf2c29a, mustache: true });
  { const sp = makeSpecs(); dawson.head.add(sp); sp.position.set(0, 0.05, 0.262); }
  const sam = mk1({ shirt: 0x06d6a0, pants: 0x34495e, hair: 0x3a2a1c, hairStyle: 'tuft', skin: 0x9c6644 });
  const samPhone = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.16, 0.014), std(0x15161a, 0.3)); samPhone.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.145), new THREE.MeshBasicMaterial({ color: 0x9fd2ff, toneMapped: false })); s.position.z = -0.008; s.rotation.y = PI; samPhone.add(s); samPhone.scr = s; } sam.hand(1).add(samPhone); samPhone.position.set(0, -0.06, 0.06);
  const cast = [tyler, maya, jake, emma, doug, chad, zoe, dawson, sam];
  const dog = makeDalmatian(); scene.add(dog.root);
  const SAM_S = 0.9;

  // ---------------------------------------------------------------- crowd (instanced mini toons) + numbers
  const NC = 60, crowd = makeCrowd(scene, NC, { seed: 51, shirt: 0xffffff });
  const SHIRTS = [0xff5a5f, 0x2ec4b6, 0xffb703, 0x8e7dff, 0x3a86ff, 0xff8fab, 0x06d6a0, 0xf77f00, 0x48cae4, 0xe9e4da, 0x6a994e, 0xd8393b];
  { const C = new THREE.Color(); for (let i = 0; i < NC; i++) { const c = SHIRTS[(i * 7) % SHIRTS.length]; crowd.meshes.chest.setColorAt(i, C.setHex(c)); crowd.meshes.arm.setColorAt(i * 2, C); crowd.meshes.arm.setColorAt(i * 2 + 1, C); } }
  const TAG = { tyler: 60, maya: 61, jake: 62, emma: 63, doug: 64, chad: 65, zoe: 66, dawson: 67, sam: 68, dog: 69 };
  const tags = makeNumTags(scene, 72, { minPx: 66, maxPx: 190, natH: 0.3 });
  const R = rng(1051);
  const pickVal = () => { const r = R(); return r < 0.08 ? 400 + Math.floor(R() * 600) : r < 0.3 ? 100 + Math.floor(R() * 300) : 3 + Math.floor(R() * 96); };
  const cHead = (y) => y + 1.47;   // a crowd member's tag sits on top of the hair (head centre 1.12 + 0.27 + gap)
  function ctag(i, x, y, z, value, o = {}) { tags.set(i, { pos: [x, cHead(y) + (o.bob || 0), z], value, ...o }); }
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)); };
  function ttag(name, toon, value, o = {}) { const h = headW(toon), s = toon.root.scale.x; tags.set(TAG[name], { pos: [h.x, h.y + 0.35 * s, h.z], value, ...o }); }
  const walkC = (i, p, rotY, tt, ph, o = {}) => crowd.set(i, { x: p[0], y: p[1] + Math.abs(Math.sin(tt * 7 + ph)) * 0.035, z: p[2], rotY, kick: 0.75, t: tt + ph, armL: { x: Math.sin(tt * 7 + ph) * 0.45, z: 0.15 }, armR: { x: -Math.sin(tt * 7 + ph) * 0.45, z: 0.15 }, ...o });

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 300, confetti: 700, spark: 300, glow: 60, smoke: 200, crumb: 300 }, nearFade: [0.5, 1.4] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);

  // ================================================================ STREET (hook, Sam, dog, spread)
  const LANES = [-2.45, -1.85, -0.65];
  const walkers = Array.from({ length: 28 }, (_, i) => {
    const lane = LANES[i % 3] + (R() - 0.5) * 0.18, dir = R() < 0.72 ? 1 : -1, sp = 0.95 + R() * 0.45;
    let x0 = -14 + R() * 17.5; if (dir > 0) x0 = Math.min(x0, 3.2 - sp * 2.4);
    return { lane, dir, sp, x0, ph: R() * TAU, val: pickVal(), phone: R() < 0.25, look: (R() - 0.5) * 0.6 };
  });
  const SAMZ = -1.25, samX = (tt) => -4.3 + 1.15 * tt;
  const SAM0 = 23, SAM_BUZZ = t.homework - 0.05, SAM1 = 31;
  kick(SAM_BUZZ + 0.05, 0.25);
  // the dog: sits outside the café on a pile of worksheet scraps
  const DOGP = O('street', -6.2, SH, -0.9);
  const BURP = t.ate + 0.1; kick(BURP, 0.35);
  fx.burst('confetti', BURP, { pos: add(DOGP, [0, 0.62, 0.3]), n: 14, color: 0xfdfbf4, size: [0.07, 0.12], speed: [0.8, 1.8], spread: 0.7, dir: [0, 0.6, 1], g: 2.5 });
  const scraps = new THREE.Group(); scene.add(scraps);
  { const pm = std(0xfbf8ef, 0.9, { side: THREE.DoubleSide }), lm = std(0xbcd0ec, 0.9, { side: THREE.DoubleSide }), R2 = rng(7);
    for (let k = 0; k < 16; k++) { const s = 0.06 + R2() * 0.09, m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * (0.6 + R2() * 0.6)), k % 4 ? pm : lm); m.rotation.set(-PI / 2, 0, R2() * TAU); m.position.set(DOGP[0] + (R2() - 0.5) * 0.9, DOGP[1] + 0.004 + k * 0.0004, DOGP[2] + 0.1 + (R2() - 0.3) * 0.7); m.castShadow = false; scraps.add(m); }
    const half = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.2), new THREE.MeshStandardMaterial({ map: spare.tex, roughness: 0.9, side: THREE.DoubleSide })); half.rotation.set(-PI / 2 + 0.05, 0, 0.5); half.position.set(DOGP[0] + 0.3, DOGP[1] + 0.006, DOGP[2] + 0.35); scraps.add(half); }
  // spread: Friday, a street party on the back sidewalk + the road; every number drops to 0 in three waves (far → near)
  const fans = Array.from({ length: 34 }, (_, i) => {
    const onRoad = i % 3 !== 0, x = -11 + R() * 14.5, z = onRoad ? 0.5 + R() * 4.2 : -2.5 + R() * 1.9;
    return { x, z, y: onRoad ? 0 : SH, rotY: PI / 2 + (R() - 0.5) * 1.2, ph: R() * TAU, val: pickVal() + 20, wave: x < -6 ? 0 : x < -1.2 ? 1 : 2, jump: R() * 0.3 };
  });
  const ZW = [t.z1, t.z2, t.z3];
  const SAMS = O('street', 5.1, 0, 1.6);
  ZW.forEach((zt, k) => { kick(zt + 0.03, 0.35 + 0.15 * k); for (const f of fans.filter((f) => f.wave === k).slice(0, 6)) fx.burst('confetti', zt + 0.05, { pos: [f.x, f.y + 1.9, f.z], n: 10, speed: [1.2, 2.6], spread: 0.9 }); });
  fx.burst('confetti', t.z3 + 0.05, { pos: add(SAMS, [0, 1.9, 0]), n: 40, speed: [1.5, 3.2], spread: 1.0 });

  // ================================================================ HALLWAY (pres, reveal)
  const MZ = (tt) => -5.6 + 1.3 * (tt - t.pclass);   // Maya walks toward the lens
  const hallKids = [[-1.38, -1.4], [1.38, -2.3], [-1.38, -3.3], [1.38, -4.6], [-1.38, -5.9], [1.38, -7.4], [-1.38, -8.6], [1.38, -9.9], [-1.38, -11.2], [0.7, -12.6], [-0.6, -13.8], [1.38, -15.0], [-1.38, 0.2], [1.38, 0.9]].map(([x, z], i) => ({ x, z, val: pickVal(), ph: R() * TAU }));
  const JE = [[-0.78, MZ(t.nobody) - 1.6], [0.8, MZ(t.nobody) - 2.2]];   // Jake + Emma stopped mid-hall, watching her go by
  // reveal: Maya at her locker with the laptop (Scribe on screen)
  const mayaLap = makeLaptop(homeScreen.tex, icon); HW.root.add(mayaLap.g); mayaLap.hinge.rotation.x = -0.22;
  const MREV = [-0.35, 0, -2.6];

  // ================================================================ CAFÉ (couple)
  const T0 = RS.tables[0]; T0.dishes.visible = false;
  T0.chairs.forEach((c, k) => { c.position.set(T0.x + (k ? 0.36 : -0.36), 0, T0.z - 0.52); c.rotation.y = 0; });
  const notebooks = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(T0.x + s * 0.24, 0.775, T0.z - 0.08); g.rotation.y = s * 0.12; RS.root.add(g); const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.27), new THREE.MeshStandardMaterial({ map: spare.tex, roughness: 0.9 })); pg.rotation.x = -PI / 2; pg.position.y = 0.012; g.add(pg); const cov = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.01, 0.28), std(s < 0 ? 0x3a86ff : 0xffb703, 0.6)); cov.position.y = 0.005; g.add(cov); return g; });
  for (const s of [-1, 1]) { const mug = new THREE.Group(); mug.position.set(T0.x + s * 0.4, 0.775, T0.z + 0.18); RS.root.add(mug); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 14), std(0xf4f1ea, 0.4)); c.position.y = 0.05; mug.add(c); const cf = new THREE.Mesh(new THREE.CircleGeometry(0.04, 14), std(0x5a3a22, 0.3)); cf.rotation.x = -PI / 2; cf.position.y = 0.098; mug.add(cf); }
  // the pendant over the hero table hangs right where the two numbers float: hide it
  RS.root.traverse((m) => { if (m.isMesh && Math.abs(m.position.x - T0.x) < 0.05 && Math.abs(m.position.z - T0.z) < 0.05 && m.position.y > 1.8 && m.position.y < 2.6) m.visible = false; });
  const MIN0 = 47 * 60 + 12;
  const coupleTxt = (tt) => { const m = MIN0 - (tt > t.minute ? 1 : 0) - (tt > t.copying - 0.1 ? 1 : 0); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
  const COPY = t.copying - 0.05; kick(COPY + 0.05, 0.4); kick(t.minute + 0.02, 0.2);
  const diners = [[1, -1], [1, 1], [2, -1], [2, 1]].map(([ti, s]) => ({ ti, s, val: pickVal() }));

  // ================================================================ SUBWAY (Doug)
  const DOUGP = O('sub', 0.5, 0, 2.3);
  const riders = [[-1.18, -2.9], [-1.18, -1.7], [-1.18, -0.5], [-1.18, 0.7], [-1.18, 1.8], [1.18, -2.6], [1.18, -1.3], [1.18, -0.1], [1.18, 1.1], [1.18, 4.4], [-1.18, 4.6]].map(([x, z], i) => ({ x, z, val: 4 + Math.floor(R() * 70), ph: R() * TAU, lean: 0 }));
  const strap = new THREE.Group(); scene.add(strap);
  { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6).translate(0, -0.5, 0), std(0x2a2d33, 0.6)); strap.add(band); strap.band = band; const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 18), std(0xe9e4da, 0.4)); strap.add(ring); strap.ring = ring; }
  const TICKS = [t.still + 0.05, t.up + 0.05]; TICKS.forEach((k) => kick(k, 0.2));
  const dougVal = (tt) => 9000 + (tt > TICKS[0] ? 1 : 0) + (tt > TICKS[1] ? 1 : 0);

  // ================================================================ PARTY (Chad)
  const LRC = (x, y, z) => O('party', x, y, z);
  const dancers = [[-1.3, -1.6], [-0.4, -1.9], [0.6, -1.7], [1.6, -1.6], [-0.9, -0.8], [0.15, -0.95], [1.1, -0.85], [2.2, -0.7], [-1.6, 0.0], [-0.5, 0.15], [2.4, 0.3], [-2.5, -0.9]].map(([x, z]) => ({ x, z, val: pickVal(), ph: R() * TAU, rot: (R() - 0.5) * 0.9 }));
  const CHADP = LRC(1.55, 0, 1.0), ZOEP = LRC(0.92, 0, 1.12);
  const REVEAL = t.sixtyone - 0.08; kick(REVEAL + 0.05, 0.3);
  // party dressing: colored lights, a disco ball, balloons, a string of lights
  const partyL = [[0xff3fa4, -1.5, 2.3, -0.5], [0x3fd2ff, 1.8, 2.3, -1.0], [0xb36bff, 0.2, 2.4, 1.2]].map(([c, x, y, z]) => { const l = new THREE.PointLight(c, 5, 6, 1.4); l.position.set(x, y, z); LR.root.add(l); return l; });
  const disco = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), std(0xdfe6ee, 0.15, { metalness: 0.9, flatShading: true })); disco.position.set(0.3, 2.35, -0.8); LR.root.add(disco);
  const balloons = [[-2.0, -2.4, 0xff4d5e], [-1.6, -2.5, 0xffd23f], [2.8, -2.0, 0x3ec7ff], [2.6, -2.4, 0xb36bff], [-4.2, -2.3, 0x58d36b]].map(([x, z, c]) => { const g = new THREE.Group(); g.position.set(x, 0, z); LR.root.add(g); const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), std(c, 0.25)); b.scale.y = 1.2; b.position.y = 2.0; g.add(b); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.4, 4), std(0xeeeeee)); s.position.y = 1.2; g.add(s); return g; });
  // string lights along the back wall
  { const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), 26); const M4 = new THREE.Matrix4(), C = new THREE.Color(); for (let k = 0; k < 26; k++) { const x = -4.6 + k * 0.3; M4.makeTranslation(x, 2.35 - 0.12 * Math.sin((k % 6) / 6 * PI), -2.7); bulbs.setMatrixAt(k, M4); bulbs.setColorAt(k, C.setHex([0xffd23f, 0xff4d5e, 0x3ec7ff, 0x58d36b][k % 4]).multiplyScalar(1.6)); } LR.root.add(bulbs); }
  const cup = (toon) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.12, 12), std(0xd42a22, 0.5)); c.position.set(0, -0.08, 0.05); toon.hand(-1).add(c); return c; };
  cup(chad); cup(zoe);

  // ================================================================ LOUNGE (Dawson)
  for (const m of [LG.front]) m.visible = true;
  const DAWP = O('lounge', 0, 0.125, 0.02);
  { const ch = new THREE.Group(); ch.position.set(0, 0, -0.05); LG.root.add(ch); const wd = std(0x5a3a22, 0.6); const s = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.5), wd); s.position.y = 0.45; ch.add(s); const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.06), wd); b.position.set(0, 0.83, -0.25); ch.add(b); }
  const loungeSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.42), new THREE.MeshStandardMaterial({ roughness: 0.6, map: tex(1024, 180, (c, w, h) => { c.fillStyle = '#7a1c22'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe9a8'; c.font = '700 104px Fredoka, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("TEACHERS' LOUNGE", w / 2, h / 2 + 4); }) }));
  loungeSign.position.set(-0.6, 2.95, -2.37); LG.root.add(loungeSign);
  { const cm = new THREE.Group(); cm.position.set(-2.1, 0, -1.9); LG.root.add(cm); const cnt = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.6), std(0x8a6a4a, 0.6)); cnt.position.y = 0.45; cm.add(cnt); const mac = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.3), std(0x2a2d33, 0.4)); mac.position.set(-0.3, 1.11, 0); cm.add(mac); const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 14), std(0xdfe8f0, 0.1, { transparent: true, opacity: 0.6 })); pot.position.set(-0.3, 0.98, 0.1); cm.add(pot); for (let k = 0; k < 4; k++) { const mg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 12), std([0xd42a22, 0xffffff, 0x3a86ff, 0xffd23f][k], 0.4)); mg.position.set(0.15 + k * 0.12, 0.95, 0.05); cm.add(mg); } }
  const paperT = tex(128, 128, (c, w, h) => { c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,120,130,.45)'; c.lineWidth = 1; for (let y = 2; y < h; y += 4) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const NPAPER = 64, stacks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.12, 0.23), std(0xffffff, 0.85, { map: paperT }), NPAPER); stacks.castShadow = true; stacks.receiveShadow = true; stacks.frustumCulled = false; LG.root.add(stacks);
  const DESKY = 0.82;
  const startStacks = [[-0.72, 0.42, 4], [-0.42, 0.55, 3], [0.5, 0.45, 5], [0.78, 0.6, 3]];
  const pileCols = [[-0.62, 0.55, 6], [-0.28, 0.74, 2], [0.04, 0.66, 2], [0.32, 0.76, 3], [0.62, 0.52, 6], [-0.92, 0.8, 7], [0.92, 0.84, 7], [-0.12, 0.95, 2], [0.18, 0.96, 2]];
  const PILE0 = t.now - 0.05, PILE1 = Math.max(t.all + 0.45, PILE0 + 0.8);
  const avalanche = []; { const R3 = rng(77), per = 7; pileCols.forEach(([x, z, n], c) => { for (let j = 0; j < n; j++) avalanche.push({ x: x + (R3() - 0.5) * 0.05, z: z + (R3() - 0.5) * 0.05, j, t: PILE0 + (PILE1 - PILE0) * ((j * pileCols.length + c) / (per * pileCols.length)) + R3() * 0.05, rot: (R3() - 0.5) * 0.3 }); }); }
  [0, 0.3, 0.6].forEach((k) => kick(PILE0 + (PILE1 - PILE0) * k + 0.02, 0.45));
  kick(t.all + 0.05, 0.8);
  fx.stream('confetti', PILE0, PILE1 + 0.6, { pos: O('lounge', 0, 3.0, 0.6), box: [2.4, 0.2, 1.4], rate: 30, color: 0xf7f4ec, size: [0.14, 0.2], speed: [0.1, 0.4], dir: [0, -1, 0], spread: 0.6, g: 1.2, life: [2.2, 2.8] });
  fx.stream('confetti', PILE1 + 0.6, END, { pos: O('lounge', 0, 3.0, 0.6), box: [2.6, 0.2, 1.6], rate: 9, color: 0xf7f4ec, size: [0.14, 0.2], speed: [0.1, 0.3], dir: [0, -1, 0], spread: 0.6, g: 0.9, life: [3.0, 3.6] });
  const DAWV = (tt) => (tt < t.now ? 400 : 400 + 11600 * easeInQuad(u01(tt, t.now, t.all + 0.35)));
  const teachers = [[-1.05, -1.75, 86], [1.1, -1.85, 140]];

  // ================================================================ LIBRARY (Tyler)
  const TY = L(LD.seat[0], 0.145, LD.seat[1]);
  const stackPages = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshStandardMaterial({ map: spare.tex, roughness: 0.85 })); m.rotation.set(-PI / 2, 0, -0.1 + i * 0.04); LIB.stack.add(m); return m; });
  const pen = makePen(); LIB.root.add(pen.g);
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), tyler.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.26); shotHand.add(sleeve); shotHand.add(new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), tyler.M.skin)); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.016, 0.25), std(0x15161a, 0.3)); camPhone.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0085, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0086, 0.1); camPhone.add(ui); }
  const flashT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  // finals: textbooks slam onto the desk (three drops: "finals", "five hundred", "eight hundred")
  const BOOKC = [0xb83a3a, 0x2f5ea8, 0x3f8f5a, 0xd9a441, 0x6b3fa0, 0x2a2f36, 0xc96a3a, 0x3a7c8c];
  const books = []; { const R4 = rng(31); [[t.finals + 0.02, -0.82, -0.62, 3], [t.five + 0.02, 0.78, -0.4, 3], [t.eight + 0.02, -0.66, -0.25, 4]].forEach(([tb, x, z, n]) => { for (let j = 0; j < n; j++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.25), std(BOOKC[(books.length * 3) % BOOKC.length], 0.6)); m.castShadow = true; LIB.root.add(m); books.push({ m, tb: tb + j * 0.05, x: x + (R4() - 0.5) * 0.04, z, y: Y + 0.035 + j * 0.072, rot: (R4() - 0.5) * 0.4 }); } kick(tb + 0.05, 0.6); fx.burst('dust', tb + 0.05, { pos: L(x, Y + 0.05, z), n: 6, spread: 1.4, speed: [0.4, 1], size: [0.15, 0.3] }); }); }
  const TYV = (tt) => { if (tt < t.finals) return 312; if (tt < t.five) return lerp(312, 500, easeOutBack(u01(tt, t.finals, t.finals + 0.35), 1.2)); if (tt < t.eight) return 500; if (tt < t.drops) return lerp(500, 800, easeOutBack(u01(tt, t.eight, t.eight + 0.35), 1.2)); return lerp(800, 0, easeInQuad(u01(tt, t.drops, t.zero))); };
  // the room behind him: students at a long study table under the shelves (backs to us, then they turn around)
  { const tb = new THREE.Group(); tb.position.set(0, 0, -3.1); LIB.root.add(tb); const wd = std(0x6e4a2c, 0.6); const top = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.05, 0.62), wd); top.position.y = Y; tb.add(top); for (const x of [-1.85, 1.85]) for (const z of [-0.25, 0.25]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, Y, 0.06), wd); l.position.set(x, Y / 2, z); tb.add(l); }
    const lampM = std(0x1f6b45, 0.35); for (const x of [-1.1, 1.1]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 0.12, 16, 1, true), lampM); sh.material.side = THREE.DoubleSide; sh.position.set(x, Y + 0.38, 0.05); tb.add(sh); const p = new THREE.PointLight(0xffd59a, 1.0, 3, 1.6); p.position.set(x, Y + 0.3, 0.2); tb.add(p); } }
  const libKids = [[-1.4, -2.45, 420], [-0.72, -2.45, 515], [0.72, -2.45, 380], [1.4, -2.45, 610], [-2.1, -1.1, 290], [2.1, -1.0, 455]].map(([x, z, val], i) => ({ x, z, val, ph: R() * TAU, side: i >= 4 }));
  for (const k of libKids.slice(0, 4)) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), std(0x5a3a22, 0.6)); s.position.set(k.x, 0.45, k.z); LIB.root.add(s); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), std(0x3a2a1c, 0.6)); leg.position.set(k.x, 0.225, k.z); LIB.root.add(leg); }
  const TURN0 = t.turns - 0.12;
  // library Scribe sequence (049's): lid, photo flash, scan, solve, the pen writes his handwriting
  const LID0 = t.opens - 0.05, LID1 = t.opens + 0.3, FLASH = t.photo + 0.05, SCAN0 = FLASH + 0.15, SOLVE0 = t.scribe2 + 0.1, SOLVE1 = t.forty2 + 0.2;
  const PEN0 = t.then + 0.02, WRITE0 = t.writes - 0.05, WRITE1 = WE('hand', 'sevens') + 0.25;
  kick(FLASH, 0.35); kick(t.cooked, 0.6); kick(LID1, 0.3); kick(t.finals + 0.02, 0.9); kick(t.zero + 0.02, 1.1, 0.55); kick(TURN0 + 0.15, 0.4);
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.4, { pos: L(0, 1.62, LD.seat[1]), rate: 14, size: [0.12, 0.25], speed: [0.3, 0.8], spread: 0.4, life: [0.7, 1.1], g: -1.5, color: 0xdddddd });
  const items = sheet.items, cum = []; { let a = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; cum.push(a); } }
  const N = sheet.total;
  const lastOf = (pred) => { let k = -1; items.forEach((it, i) => { if (pred(it.pi)) k = i; }); return k < 0 ? 0 : cum[k]; };
  const pBefore7 = lastOf((pi) => pi < 3), pAfter7 = lastOf((pi) => pi <= 3);
  const PK = [[WRITE0, 0], [t.even - 0.05, pBefore7], [t.sevens + 0.3, pAfter7], [WRITE1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  fx.stream('spark', WRITE0, WRITE1, { pos: L(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 18, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });
  // ZERO: confetti bursts around his number
  const tyHeadTop = add(TY, [0, 1.12 + 0.39, 0]);
  fx.burst('confetti', t.zero + 0.04, { pos: add(tyHeadTop, [0, 0.2, 0.1]), n: 90, speed: [1.8, 3.6], spread: 1.2, floor: 0 });
  fx.burst('glow', t.zero + 0.03, { pos: add(tyHeadTop, [0, 0.15, 0.05]), n: 1, size: [0.7, 0.9], color: 0x7dff9f });

  // ---------------------------------------------------------------- end card
  const hud = makeHud({ end: { t: ENDCARD, icon: ASSET + 'scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- SHOTS: one gliding rail per shot, hard cuts between places
  const sheetW = L(LD.sheet[0], Y, LD.sheet[1]), clockW = L(1.2, 3.55, -3.96);
  const TYH = add(TY, [0, 1.12, 0]);
  const SHOTS = [
    // STREET: the hook
    { id: 'hook', t0: 0, set: 'street', frames: [
      { t: 0, pos: O('street', 7.2, 1.75, -1.75), look: aimAt(O('street', 7.2, 1.75, -1.75), O('street', 0.5, SH + 1.12, -1.6), 50, 0.44), fov: 50 },
      { t: t.its, pos: O('street', 6.5, 1.7, -1.75), look: aimAt(O('street', 6.5, 1.7, -1.75), O('street', 0.5, SH + 1.12, -1.6), 48, 0.44), fov: 48, stop: true } ] },
    { id: 'sam', t0: t.its - 0.04, set: 'street', cam: (tt) => { const sx = samX(tt), h = [sx, SH + 1.12 * SAM_S, SAMZ]; const C = [sx + 2.55 - 0.15 * u01(tt, t.its, t.dog), h[1] + 0.06, SAMZ + 0.45]; return { pos: C, look: aimAt(C, [sx, h[1], SAMZ - 0.05], 46, 0.43), fov: 46 }; } },
    { id: 'dog', t0: t.dog - 0.04, set: 'street', frames: [
      { t: t.dog - 0.04, pos: add(DOGP, [0.14, 0.72, 1.8]), look: aimAt(add(DOGP, [0.14, 0.72, 1.8]), add(DOGP, [0, 0.8, 0.25]), 42), fov: 42 },
      { t: t.dit + 0.3, pos: add(DOGP, [0.1, 0.7, 1.5]), look: aimAt(add(DOGP, [0.1, 0.7, 1.5]), add(DOGP, [0, 0.8, 0.25]), 42), fov: 42, stop: true } ] },
    // HALLWAY: the class president at 0
    { id: 'hall', t0: t.pclass - 0.04, set: 'hall', frames: [
      { t: t.pclass - 0.04, pos: O('hall', 0.3, 1.3, 1.9), look: aimAt(O('hall', 0.3, 1.3, 1.9), O('hall', 0, 1.12, MZ(t.pzero)), 48), fov: 48 },
      { t: t.nobody - 0.1, pos: O('hall', 0.25, 1.28, 1.3), look: aimAt(O('hall', 0.25, 1.28, 1.3), O('hall', 0, 1.12, MZ(t.nobody)), 48), fov: 48, stop: true } ] },
    { id: 'sus', t0: t.nobody - 0.06, set: 'hall', cam: (tt) => { const z = MZ(tt); const C = O('hall', 0.34, 1.34, z + 2.75); return { pos: C, look: aimAt(C, O('hall', 0, 1.12, z), 52, 0.43), fov: 52 }; } },
    // CAFÉ: the couple
    { id: 'cafe', t0: t.these - 0.04, set: 'cafe', frames: [
      { t: t.these - 0.04, pos: O('cafe', 0.12, 1.3, 2.5), look: aimAt(O('cafe', 0.12, 1.3, 2.5), O('cafe', 0, 1.24, -0.32), 44), fov: 44 },
      { t: t.love - 0.1, pos: O('cafe', 0.1, 1.27, 2.2), look: aimAt(O('cafe', 0.1, 1.27, 2.2), O('cafe', 0, 1.24, -0.32), 44), fov: 44, stop: true } ] },
    { id: 'copy', t0: t.love - 0.06, set: 'cafe', frames: [
      { t: t.love - 0.06, pos: O('cafe', 1.3, 1.85, 2.45), look: O('cafe', -0.1, 0.9, -0.35), fov: 46 },
      { t: t.copying + 0.6, pos: O('cafe', 1.2, 1.8, 2.25), look: O('cafe', -0.1, 0.88, -0.35), fov: 46, stop: true } ] },
    // SUBWAY: Doug at 9,000
    { id: 'sub', t0: t.guy - 0.25, set: 'sub', frames: [
      { t: t.guy - 0.25, pos: O('sub', 0.35, 1.5, 6.0), look: aimAt(O('sub', 0.35, 1.5, 6.0), add(DOUGP, [0, 1.12, 0]), 50), fov: 50 },
      { t: t.hes - 0.1, pos: O('sub', 0.35, 1.45, 5.4), look: aimAt(O('sub', 0.35, 1.45, 5.4), add(DOUGP, [0, 1.12, 0]), 50), fov: 50, stop: true } ] },
    { id: 'doug', t0: t.hes - 0.06, set: 'sub', frames: [
      { t: t.hes - 0.06, pos: add(DOUGP, [0.34, 1.24, 2.6]), look: aimAt(add(DOUGP, [0.34, 1.24, 2.6]), add(DOUGP, [0, 1.12, 0]), 44, 0.43), fov: 44 },
      { t: t.up + 0.4, pos: add(DOUGP, [0.28, 1.22, 2.3]), look: aimAt(add(DOUGP, [0.28, 1.22, 2.3]), add(DOUGP, [0, 1.12, 0]), 44, 0.43), fov: 44, stop: true } ] },
    // PARTY: Chad at 61
    { id: 'party', t0: t.parties - 0.2, set: 'party', frames: [
      { t: t.parties - 0.2, pos: LRC(0.7, 1.8, 2.7), look: LRC(0.2, 1.0, -1.6), fov: 52 },
      { t: t.yeah - 0.1, pos: LRC(0.6, 1.72, 2.3), look: LRC(0.2, 1.0, -1.6), fov: 52, stop: true } ] },
    { id: 'chad', t0: t.yeah - 0.06, set: 'party', frames: [
      { t: t.yeah - 0.06, pos: LRC(1.32, 1.22, 3.75), look: aimAt(LRC(1.32, 1.22, 3.75), LRC(1.3, 1.12, 1.05), 40, 0.44), fov: 40, keep: true, until: REVEAL },
      { t: REVEAL + 0.35, pos: LRC(1.36, 1.42, 4.3), look: aimAt(LRC(1.36, 1.42, 4.3), LRC(1.38, 1.12, 1.0), 46, 0.42), fov: 46, stop: true } ] },
    // LOUNGE: Mr. Dawson's GRADING number
    { id: 'lounge', t0: t.teachers - 0.06, set: 'lounge', frames: [
      { t: t.teachers - 0.06, pos: O('lounge', 0.5, 1.6, 3.8), look: O('lounge', 0, 0.92, -0.3), fov: 48 },
      { t: t.mister - 0.1, pos: O('lounge', 0.42, 1.55, 3.3), look: O('lounge', 0, 0.92, -0.2), fov: 48, stop: true } ] },
    { id: 'grade', t0: t.mister - 0.06, set: 'lounge', frames: [
      { t: t.mister - 0.06, pos: add(DAWP, [0.3, 1.22, 2.75]), look: aimAt(add(DAWP, [0.3, 1.22, 2.75]), add(DAWP, [0, 1.12, 0]), 44, 0.43), fov: 44 },
      { t: t.hoursL + 0.4, pos: add(DAWP, [0.24, 1.2, 2.45]), look: aimAt(add(DAWP, [0.24, 1.2, 2.45]), add(DAWP, [0, 1.12, 0]), 44, 0.43), fov: 44, stop: true } ] },
    // LIBRARY: Tyler
    { id: 'me', t0: t.and - 0.06, set: 'lib', frames: [
      { t: t.and - 0.06, pos: L(0.42, 1.78, 1.85), look: aimAt(L(0.42, 1.78, 1.85), add(TY, [0, 1.1, 0]), 46), fov: 46 },
      { t: t.finals - 0.1, pos: L(0.36, 1.74, 1.5), look: aimAt(L(0.36, 1.74, 1.5), add(TY, [0, 1.1, 0]), 46), fov: 46, keep: true },
      { t: t.eight + 0.6, pos: L(0.34, 1.76, 1.65), look: aimAt(L(0.34, 1.76, 1.65), add(TY, [0, 1.1, 0]), 48), fov: 48, stop: true } ] },
    { id: 'sheet', t0: t.forty - 0.1, set: 'lib', frames: [
      { t: t.forty - 0.1, pos: add(sheetW, [0.0, 1.0, 0.22]), look: add(sheetW, [0, 0, 0.02]), fov: 46, keep: true },
      { t: t.handwritten - 0.12, pos: add(sheetW, [0.0, 0.82, 0.14]), look: add(sheetW, [0, 0, 0.0]), fov: 46, stop: true } ] },
    { id: 'clock', t0: t.due - 0.06, set: 'lib', frames: [
      { t: t.due - 0.06, pos: add(clockW, [0.3, -0.35, 1.75]), look: add(clockW, [0.05, -0.08, 0]), fov: 42 },
      { t: t.im - 0.1, pos: add(clockW, [0.22, -0.28, 1.45]), look: add(clockW, [0.05, -0.08, 0]), fov: 42, stop: true } ] },
    { id: 'cooked', t0: t.im - 0.06, set: 'lib', cam: (tt) => { const h = headW(tyler).toArray(), C = add(h, [0.18, -0.02, 2.7 - 0.15 * u01(tt, t.cooked, t.so)]); return { pos: C, look: aimAt(C, h, 42, 0.43), fov: 42 }; } },
    { id: 'opens', t0: t.so - 0.04, set: 'lib', frames: [
      { t: t.so - 0.04, pos: L(0.75, 1.55, 1.75), look: aimAt(L(0.75, 1.55, 1.75), add(TY, [0.1, 1.1, 0]), 44, 0.45), fov: 44 },
      { t: t.scribe - 0.15, pos: L(0.7, 1.52, 1.55), look: aimAt(L(0.7, 1.52, 1.55), add(TY, [0.1, 1.1, 0]), 44, 0.45), fov: 44, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.one - 0.04, set: 'lib', frames: [
      { t: t.one - 0.04, pos: add(sheetW, [0.35, 0.72, 0.85]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42 },
      { t: t.scribe2 - 0.15, pos: add(sheetW, [0.3, 0.68, 0.72]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42, stop: true } ] },
    { id: 'solve', t0: t.scribe2 - 0.1, set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'write', t0: t.then - 0.05, set: 'lib', frames: [
      { t: t.then - 0.05, pos: L(0.05, 1.42, 0.75), look: L(0.05, 0.86, -0.8), fov: 46 },
      { t: t.writes + 0.05, pos: add(sheetW, [0.02, 0.48, 0.32]), look: add(sheetW, [-0.01, 0, -0.04]), fov: 44, stop: true } ] },
    { id: 'macro', t0: t.stroke - 0.1, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'zero', t0: t.myN - 0.06, set: 'lib', frames: [
      { t: t.myN - 0.06, pos: L(0.42, 1.62, 1.75), look: aimAt(L(0.42, 1.62, 1.75), add(TY, [0, 1.1, 0]), 46, 0.43), fov: 46 },
      { t: t.zero, pos: L(0.36, 1.6, 1.45), look: aimAt(L(0.36, 1.6, 1.45), add(TY, [0, 1.1, 0]), 46, 0.43), fov: 46, keep: true },
      { t: t.whole - 0.1, pos: L(0.33, 1.6, 1.38), look: aimAt(L(0.33, 1.6, 1.38), add(TY, [0, 1.1, 0]), 47, 0.43), fov: 47, stop: true } ] },
    { id: 'stare', t0: t.whole - 0.06, set: 'lib', frames: [
      { t: t.whole - 0.06, pos: L(0.22, 1.78, 1.75), look: aimAt(L(0.22, 1.78, 1.75), add(TY, [0, 1.12, 0]), 60, 0.44), fov: 60 },
      { t: t.around + 0.5, pos: L(0.2, 1.72, 1.4), look: aimAt(L(0.2, 1.72, 1.4), add(TY, [0, 1.12, 0]), 60, 0.44), fov: 60, stop: true } ] },
    // HALLWAY again: the president's secret
    { id: 'reveal', t0: t.rturns - 0.06, set: 'hall', frames: [
      { t: t.rturns - 0.06, pos: O('hall', MREV[0] + 0.35, 1.32, MREV[2] + 3.0), look: aimAt(O('hall', MREV[0] + 0.35, 1.32, MREV[2] + 3.0), O('hall', MREV[0], 1.12, MREV[2]), 44, 0.42), fov: 44 },
      { t: t.along + 0.3, pos: O('hall', MREV[0] + 0.28, 1.3, MREV[2] + 2.6), look: aimAt(O('hall', MREV[0] + 0.28, 1.3, MREV[2] + 2.6), O('hall', MREV[0], 1.12, MREV[2]), 44, 0.42), fov: 44, stop: true } ] },
    // STREET: by Friday, everyone is at 0
    { id: 'spread', t0: t.by - 0.06, set: 'street', frames: [
      { t: t.by - 0.06, pos: O('street', 11.0, 3.5, 2.6), look: O('street', -5, 0.7, 0.4), fov: 46 },
      { t: t.town, pos: O('street', 9.8, 2.8, 2.3), look: O('street', -3, 0.8, 0.8), fov: 46 },
      { t: t.z3 - 0.08, pos: add(SAMS, [2.7, 1.45, 0.35]), look: aimAt(add(SAMS, [2.7, 1.45, 0.35]), add(SAMS, [0, 1.0, 0]), 48, 0.42), fov: 48, keep: true },
      { t: t.z3 + 0.6, pos: add(SAMS, [2.55, 1.42, 0.33]), look: aimAt(add(SAMS, [2.55, 1.42, 0.33]), add(SAMS, [0, 1.0, 0]), 48, 0.42), fov: 48, stop: true } ] },
    // LOUNGE again: except Mr. Dawson
    { id: 'bury', t0: t.except - 0.06, set: 'lounge', frames: [
      { t: t.except - 0.06, pos: add(DAWP, [0.35, 1.25, 2.6]), look: aimAt(add(DAWP, [0.35, 1.25, 2.6]), add(DAWP, [0, 1.12, 0]), 46, 0.45), fov: 46 },
      { t: t.now, pos: add(DAWP, [0.3, 1.3, 2.4]), look: aimAt(add(DAWP, [0.3, 1.3, 2.4]), add(DAWP, [0, 1.12, 0]), 46, 0.45), fov: 46 },
      { t: ENDCARD + 1.5, pos: add(DAWP, [0.45, 1.65, 3.6]), look: add(DAWP, [0, 1.0, 0]), fov: 50, stop: true } ] },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; if (s.frames) s.rail = makeRail(planRail(s.frames, { move: [0.35, 13], minHold: 0.6 })); });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // the screen insert: straight down the laptop screen's normal (Tyler + the chair are hidden: a POV cheat)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) {
    LIB.laptop.scr.updateWorldMatrix(true, false); LIB.laptop.scr.getWorldPosition(scrP); LIB.laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq);
    const d = 1.5; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.02, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.19 - dy, scrP.z], fov: 40 };
  }
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  function macroCam(tt) {
    const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length);
    return { pos: add(m, [-0.06, 0.24, 0.15]), look: add(m, [0.01, 0, -0.015]), fov: 42 };
  }

  // ---------------------------------------------------------------- per-frame
  const BG = { hall: 0xe8e2d4, cafe: 0x1a1410, sub: 0xbfd8ee, party: 0x161020, lounge: 0x2a2420, lib: 0x1a1410 };
  const EXPO = { street: 1.04, hall: 1.02, cafe: 1.08, sub: 0.98, party: 1.12, lounge: 1.04, lib: 1.05 };
  function setWorld(sh) {
    for (const k in roots) roots[k].visible = k === sh.set;
    scrapsVis(sh.set === 'street');
    if (sh.set === 'street') { scene.fog = streetFog; studio.camera.far = streetFar; scene.background = null; }
    else { scene.fog = null; studio.camera.far = 80; scene.background = new THREE.Color(BG[sh.set]); }
    renderer.toneMappingExposure = EXPO[sh.set];
  }
  function scrapsVis(v) { scraps.visible = v; }
  const hideCast = () => { for (const r of cast) r.root.visible = false; dog.root.visible = false; };
  const sitLegs = { legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 } };

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; setWorld(sh); hideCast(); crowd.hideAll(); tags.hideAll();
    for (const b of books) b.m.visible = false;
    stacks.count = 0; mayaLap.g.visible = false; strap.visible = false;
    // where the lens will be (rails + the pure tracking cams): extras never stand inside it
    const camP = sh.rail ? sh.rail.at(tt).pos : id === 'sam' || id === 'sus' ? sh.cam(tt).pos : null;
    const nearCam = (x, z) => camP && Math.hypot(x - camP[0], z - camP[2]) < 1.1;

    // ----- STREET: hook walkers + Sam
    if (id === 'hook' || id === 'sam' || id === 'dog') {
      const camX = id === 'sam' ? samX(tt) + 2.55 : 99;
      walkers.forEach((w, i) => {
        const x = w.x0 + w.dir * w.sp * tt, p = [x, SH, w.lane];
        if (id === 'sam' && x > samX(tt) - 0.9 && x < camX + 1.0 && Math.abs(w.lane - SAMZ) < 0.75) return;
        if (id === 'dog' && x > -8.4 && x < -4.0) return;
        if (nearCam(x, w.lane)) return;
        walkC(i, p, w.dir > 0 ? PI / 2 : -PI / 2, tt, w.ph, { phone: w.phone, look: w.phone ? [0, -0.6] : [w.look, 0.1] });
        ctag(i, x, SH, w.lane, w.val, { bob: Math.abs(Math.sin(tt * 7 + w.ph)) * 0.035 });
      });
      if (id !== 'dog') {
        sam.root.visible = true; const sx = samX(tt), buzz = tt > SAM_BUZZ, groan = tt > SAM_BUZZ + 0.25;
        sam.set({ x: sx, y: SH, z: SAMZ, rotY: PI / 2, scale: SAM_S, walk: tt * 7.6, walkAmt: 0.8, armR: { x: -1.25, z: 0.25, el: 1.25 }, eyes: groan ? 'half' : buzz ? 'wide' : 'open', mouth: groan ? 'wavy' : buzz ? 'o' : 'smile',
          look: buzz && !groan ? [0, 0.9] : [0.1, -0.45], head: { x: buzz && !groan ? -0.35 : 0.12 }, brows: groan ? 0.8 : 0, t: tt });
        samPhone.scr.material.color.setHex(buzz && tt < SAM_BUZZ + 0.5 && Math.sin(tt * 40) > 0 ? 0xffffff : 0x9fd2ff);
        const sv = tt < SAM_BUZZ ? SAM0 : lerp(SAM0, SAM1, easeOutBack(u01(tt, SAM_BUZZ, SAM_BUZZ + 0.3), 1.4));
        ttag('sam', sam, sv, { pop: tt > SAM_BUZZ ? 1 + 0.25 * Math.exp(-(tt - SAM_BUZZ) * 6) * Math.sin((tt - SAM_BUZZ) * 18) : 1, maxPx: id === 'sam' ? 230 : 270 });
      }
      if (id === 'dog') {
        dog.root.visible = true; const burp = tt > BURP && tt < BURP + 0.5;
        dog.set({ x: DOGP[0], y: DOGP[1], z: DOGP[2], rotY: 0.15, sit: 1, t: tt, headPitch: burp ? -0.35 : tt > t.dzero ? 0.05 : 0.2, headYaw: tt > t.dzero && tt < t.ate ? 0.15 : 0, tongue: tt > BURP + 0.3 ? 1 : 0 });
        dog.root.updateMatrixWorld(true); const dh = dog.head.getWorldPosition(V(0, 0, 0));
        tags.set(TAG.dog, { pos: [dh.x, dh.y + 0.16, dh.z], value: 0, maxPx: 230, pop: tt < t.dzero ? 1 : 1 + 0.2 * Math.exp(-(tt - t.dzero) * 7) * Math.sin((tt - t.dzero) * 20) });
      }
    }
    if (id === 'spread') {
      fans.forEach((f, i) => {
        if (nearCam(f.x, f.z)) return;
        const zt = ZW[f.wave], done = tt > zt, ju = done ? Math.abs(Math.sin((tt - zt) * 9 + f.jump * 5)) * 0.22 * Math.exp(-(tt - zt) * 1.2) : Math.abs(Math.sin(tt * 3 + f.ph)) * 0.02;
        crowd.set(i, { x: f.x, y: f.y + ju, z: f.z, rotY: f.rotY, armL: done ? { x: 0, z: 2.6 } : { x: -0.2, z: 0.2 }, armR: done ? { x: 0, z: 2.6 } : { x: -0.2, z: 0.2 }, wide: done, look: [0, 0.4], t: tt, mouthW: done ? 1.6 : 1 });
        const v = done ? 0 : f.val * (1 - 0.15 * u01(tt, t.by, zt));
        ctag(i, f.x, f.y + ju, f.z, v, { pop: done ? 1 + 0.3 * Math.exp(-(tt - zt) * 6) * Math.sin((tt - zt) * 16) : 1 });
      });
      sam.root.visible = true; const done = tt > t.z3, ju = done ? Math.abs(Math.sin((tt - t.z3) * 9)) * 0.25 : 0;
      sam.set({ x: SAMS[0], y: SAMS[1] + ju, z: SAMS[2], rotY: PI / 2 - 0.25, scale: SAM_S, armL: done ? { x: 0, z: 2.6, el: 0.3 } : {}, armR: done ? { x: 0, z: 2.6, el: 0.3 } : { x: -1.25, z: 0.25, el: 1.25 }, eyes: done ? 'closed' : 'wide', mouth: done ? 'grin' : 'o', look: [0, 0.6], head: { x: done ? -0.2 : -0.3 }, t: tt });
      ttag('sam', sam, done ? 0 : 31, { pop: done ? 1 + 0.18 * Math.exp(-(tt - t.z3) * 6) * Math.sin((tt - t.z3) * 16) : 1 });
    }

    // ----- HALLWAY
    if (id === 'hall' || id === 'sus') {
      const mz = MZ(tt), mp = O('hall', 0.0, 0, mz);
      maya.root.visible = true;
      maya.set({ x: mp[0], y: 0, z: mp[2], rotY: 0, walk: tt * 7.4, walkAmt: 0.85, armL: { x: -0.95, z: 0.25, el: 1.6 }, eyes: 'half', mouth: 'grin', brows: -0.25, head: { x: -0.12, z: 0.05 * Math.sin(tt * 3.7) }, look: [0.15, 0.1], t: tt });
      ttag('maya', maya, 0, { pop: tt < t.pzero ? 1 : 1 + 0.2 * Math.exp(-(tt - t.pzero) * 6) * Math.sin((tt - t.pzero) * 18) });
      hallKids.forEach((k, i) => {
        const p = O('hall', k.x, 0, k.z), face = k.x < 0 ? PI / 2 : -PI / 2, toward = Math.atan2(mp[0] - p[0], mp[2] - p[2]);
        let rel = toward - face; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
        crowd.set(i, { x: p[0], y: 0, z: p[2], rotY: face + clamp(rel, -0.9, 0.9) * 0.4, headY: clamp(rel, -1.3, 1.3) * 0.6, look: [0, 0], armL: { x: -0.1, z: 0.15 }, armR: { x: -0.1, z: 0.15 }, t: tt });
        ctag(i, p[0], 0, p[2], k.val);
      });
      [[jake, 'jake', 74], [emma, 'emma', 118]].forEach(([toon, name, val], k) => {
        const [x, z] = JE[k], p = O('hall', x, 0, z); toon.root.visible = true;
        const ang = Math.atan2(mp[0] - p[0], mp[2] - p[2]);
        toon.set({ x: p[0], y: 0, z: p[2], rotY: ang * 0.85, eyes: 'half', mouth: 'flat', brows: -0.7, look: [k ? -0.3 : 0.3, 0.05], head: { y: ang * 0.15, x: 0.05 }, armL: k ? { x: -0.5, z: 0.5, el: 2.0 } : { x: -0.3, z: 0.3, el: 1.9 }, armR: k ? { x: -0.5, z: 0.5, el: 2.0 } : {}, t: tt });
        ttag(name, toon, val);
      });
    }
    if (id === 'reveal') {
      maya.root.visible = true; const p = O('hall', ...MREV), show = smooth(u01(tt, t.rturns, t.rpres)), wink = tt > t.rscribe + 0.05;
      maya.set({ x: p[0], y: 0, z: p[2], rotY: 0, armL: { x: -0.85, z: 0.3, el: 0.35 }, armR: { x: -0.85, z: 0.3, el: 0.35 }, eyes: wink ? 'closed' : 'half', mouth: 'grin', brows: -0.3, head: { x: -0.1, z: wink ? 0.12 : 0 }, look: [0.2, 0], t: tt });
      ttag('maya', maya, 0);
      mayaLap.g.visible = true; mayaLap.g.position.set(MREV[0], 0.5, MREV[2] + 0.56); mayaLap.g.rotation.set(0.1, 0, 0); homeScreen.draw({ mode: 'home' });
      hallKids.slice(0, 6).forEach((k, i) => { const pp = O('hall', k.x, 0, k.z - 3.5); crowd.set(i, { x: pp[0], y: 0, z: pp[2], rotY: k.x < 0 ? PI / 2 : -PI / 2, headY: k.x < 0 ? 0.5 : -0.5, t: tt }); ctag(i, pp[0], 0, pp[2], k.val); });
    }

    // ----- CAFÉ
    if (id === 'cafe' || id === 'copy') {
      const look = tt > t.love - 0.05 && tt < t.copying - 0.15, peek = tt > t.copying - 0.15, slide = smooth(u01(tt, t.copying - 0.1, t.copying + 0.25));
      [[jake, 'jake', -1], [emma, 'emma', 1]].forEach(([toon, name, s]) => {
        toon.root.visible = true; const p = O('cafe', T0.x + s * 0.36, 0.105, T0.z - 0.52);
        const isE = s > 0;
        toon.set({ x: p[0], y: p[1], z: p[2], rotY: look ? -s * 0.35 : 0, ...sitLegs, lean: 0.12, armL: { x: -1.1, z: 0.15, el: 1.0 }, armR: { x: -1.1, z: 0.15, el: 1.0 + (isE ? 0 : 0.3 * slide) },
          eyes: look ? 'half' : 'open', mouth: look ? 'smile' : 'flat', brows: look ? 0.3 : 0, look: peek ? (isE ? [-0.9, -0.5] : [0.4, -0.2]) : look ? [-s * 0.8, 0] : [0, -0.4], head: { x: peek && isE ? 0.2 : 0.1, y: peek && isE ? -0.25 : 0 }, t: tt });
        ttag(name, toon, MIN0 / 60, { text: coupleTxt(tt), tier: 'low', pop: tt > t.minute && tt < t.minute + 0.5 ? 1 + 0.2 * Math.exp(-(tt - t.minute) * 7) * Math.sin((tt - t.minute) * 18) : 1 });
      });
      notebooks[0].position.x = T0.x - 0.24 + 0.2 * slide;
      diners.forEach((d, i) => { const tb = RS.tables[d.ti]; const p = O('cafe', tb.x + d.s * 0.62, 0.11, tb.z); crowd.set(i, { x: p[0], y: p[1], z: p[2], rotY: d.s < 0 ? PI / 2 : -PI / 2, sit: 1, armL: { x: -1.1, z: 0.2 }, armR: { x: -1.1, z: 0.2 }, t: tt }); ctag(i, p[0], p[1], p[2], d.val); });
    }

    // ----- SUBWAY
    if (id === 'sub' || id === 'doug') {
      doug.root.visible = true; const up = tt > t.still - 0.1;
      doug.set({ x: DOUGP[0], y: 0, z: DOUGP[2], rotY: -0.08, armR: { x: -0.15, z: 2.85, el: 0.15 }, armL: { x: -0.2, z: 0.1 }, eyes: up ? 'open' : 'half', mouth: up ? 'wavy' : 'flat', brows: 0.85, gray: 0.55, look: up ? [0.1, 1] : [0, -0.2], head: { x: up ? -0.3 : 0.08 }, t: tt });
      { doug.root.updateMatrixWorld(true); const hp = doug.hand(1).getWorldPosition(V(0, 0, 0)), top = 1.92; strap.visible = true; strap.position.set(hp.x, top, hp.z); strap.band.scale.y = Math.max(0.05, top - hp.y - 0.06); strap.ring.position.set(0, -(top - hp.y), 0); }
      const dv = dougVal(tt), lastTick = TICKS.filter((k) => tt > k).pop();
      ttag('doug', doug, dv, { pop: lastTick ? 1 + 0.18 * Math.exp(-(tt - lastTick) * 7) * Math.sin((tt - lastTick) * 18) : 1 });
      riders.forEach((r, i) => { const p = O('sub', r.x, 0.1, r.z); if (camP && Math.hypot(p[0] - camP[0], p[2] - camP[2]) < 1.7) return; const away = tt > t.dropped ? 0.2 : 0; crowd.set(i, { x: p[0] + (r.x < 0 ? -away * 0.3 : away * 0.3) * (Math.abs(r.z - 2.3) < 1.5 ? 1 : 0), y: p[1], z: p[2], rotY: r.x < 0 ? PI / 2 : -PI / 2, sit: 1, phone: i % 3 === 0, look: i % 3 === 0 ? [0, -0.6] : [r.x < 0 ? 0.6 : -0.6, 0.3], headY: i % 3 === 0 ? 0 : (r.x < 0 ? 0.35 : -0.35), armL: { x: -1.2, z: 0.2 }, armR: { x: -1.2, z: 0.2 }, t: tt }); ctag(i, p[0], p[1], p[2], r.val); });
      SB.update(tt, 11);
    }

    // ----- PARTY
    if (id === 'party' || id === 'chad') {
      const beat = tt * (140 / 60) * PI;
      dancers.forEach((d, i) => { const p = LRC(d.x, 0, d.z), b = Math.abs(Math.sin(beat + d.ph)) * 0.08, up = Math.sin(beat * 0.5 + d.ph) > 0; crowd.set(i, { x: p[0], y: b, z: p[2], rotY: d.rot, armL: up ? { x: 0, z: 2.5 } : { x: -0.6, z: 0.6 }, armR: up ? { x: -0.6, z: 0.6 } : { x: 0, z: 2.5 }, wide: up, mouthW: 1.5, look: [0, 0.2], t: tt }); ctag(i, p[0], b, p[2], d.val, { bob: 0 }); });
      chad.root.visible = id === 'chad'; zoe.root.visible = id === 'chad'; const busted = tt > REVEAL + 0.15;
      chad.set({ x: CHADP[0], y: 0, z: CHADP[2], rotY: -0.35, armL: { x: -0.55, z: 0.25, el: 0.9 }, armR: busted ? { x: -0.2, z: 0.2, el: 0.3 } : { x: -0.7, z: 0.5, el: 1.6 + 0.3 * Math.sin(tt * 6) }, eyes: busted ? 'wide' : 'half', mouth: busted ? 'teeth' : 'grin', brows: busted ? 0.6 : -0.3, look: busted ? [0.3, 0.9] : [-0.6, 0], head: { x: busted ? -0.25 : 0, y: 0.1 * Math.sin(tt * 2) }, t: tt });
      chad.hat.position.set(0, 0.1, -0.03); chad.hat.rotation.set(-0.3, PI, 0);   // toon.js's cap rim sits at eye level: lift it, worn backwards
      zoe.set({ x: ZOEP[0], y: 0, z: ZOEP[2], rotY: 0.95, armL: { x: -0.55, z: 0.25, el: 0.9 }, armR: busted ? { x: -0.4, z: 0.6, el: 2.2 } : {}, eyes: busted ? 'half' : 'open', mouth: busted ? 'flat' : 'smile', brows: busted ? -0.5 : 0.1, look: busted ? [0.8, 0.8] : [0.7, 0], head: { x: busted ? -0.25 : 0, z: busted ? 0.12 : 0 }, t: tt });
      ttag('chad', chad, 61, { pop: tt < REVEAL ? 1 : 1 + 0.25 * Math.exp(-(tt - REVEAL) * 6) * Math.sin((tt - REVEAL) * 16) });
      ttag('zoe', zoe, 12);
      disco.rotation.y = tt * 1.2; partyL.forEach((l, k) => { l.intensity = 4 + 1.2 * Math.sin(tt * 4.7 + k * 2.1); });
    }

    // ----- LOUNGE
    if (id === 'lounge' || id === 'grade' || id === 'bury') {
      dawson.root.visible = true; const buried = tt > t.now + 0.2, dv = DAWV(tt);
      dawson.set({ x: DAWP[0], y: DAWP[1], z: DAWP[2], rotY: 0, ...sitLegs, lean: 0.2, armL: { x: -1.25, z: 0.2, el: 1.3 }, armR: { x: -1.3, z: 0.25, el: 1.1 + 0.05 * Math.sin(tt * 12) },
        eyes: buried ? (tt > t.all ? 'spiral' : 'wide') : 'half', mouth: buried ? 'scream' : 'flat', brows: buried ? 1 : 0.6, look: [0, -0.5], head: { x: buried ? -0.15 : 0.18, z: buried ? 0.06 * Math.sin(tt * 14) : 0 }, faceTint: buried ? [0xff7a7a, 0.15] : [0, 0], t: tt });
      const last = tt > t.now ? t.now : null;
      ttag('dawson', dawson, dv, { label: 'GRADING', pop: last ? 1 + 0.1 * Math.sin((tt - last) * 25) * Math.exp(-(tt - last) * 1.5) : 1, maxPx: 200 });
      teachers.forEach(([x, z, val], i) => { const p = O('lounge', x, 0, z); crowd.set(i, { x: p[0], y: 0, z: p[2], rotY: x < 0 ? 0.5 : -0.5, armL: { x: -1.3, z: 0.2 }, phone: false, look: [0, 0], t: tt, wide: buried }); tags.set(i, { pos: [p[0], cHead(0), p[2]], value: val, label: 'GRADING' }); });
      // paper: the starting towers + the avalanche (each bundle drops onto its column)
      const M4 = new THREE.Matrix4(), Qx = new THREE.Quaternion(), Ex = new THREE.Euler(), S1 = V(1, 1, 1); let n = 0;
      for (const [x, z, h] of startStacks) for (let j = 0; j < h; j++) { M4.compose(V(x, DESKY + 0.06 + j * 0.12, z), Qx.setFromEuler(Ex.set(0, (j % 2) * 0.15 - 0.05, 0)), S1); stacks.setMatrixAt(n++, M4); }
      for (const a of avalanche) { if (tt < a.t - 0.5) continue; const hgt = drop(tt, a.t - 0.45, 3.2, 0.45); M4.compose(V(a.x, DESKY + 0.06 + a.j * 0.12 + hgt, a.z), Qx.setFromEuler(Ex.set(0, a.rot, 0)), S1); stacks.setMatrixAt(n++, M4); }
      stacks.count = n; stacks.instanceMatrix.needsUpdate = true;
    }

    // ----- LIBRARY
    if (sh.set === 'lib') {
      const pov = !!sh.pov; tyler.root.visible = !pov && id !== 'sheet'; LIB.chair.visible = !pov;   // the sheet insert hides him (his hands sat on the page)
      const lid = tt < LID0 ? PI / 2 - 0.02 : lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tt, LID0, LID1)));
      LIB.laptop.hinge.rotation.x = lid; LIB.scrL.intensity = tt > LID0 ? 1.6 : 0;
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      sheet.draw(writeP(tt)); screen.draw({ mode, k });
      LIB.setClock(11, tt > t.zero ? 9 : tt > t.cooked ? 3 : 1 + 2 * u01(tt, t.and, t.due + 0.5));
      const zeroed = tt > t.zero, cooked = tt > t.cooked - 0.05 && tt < t.opens - 0.1, writing = tt < t.cooked - 0.1 && !(tt > t.and - 0.1 && tt < t.eight + 0.8), finals = tt > t.finals && tt < t.cooked - 0.1;
      const drops0 = (tt > t.drops - 0.1 && !zeroed) || (tt > t.finals - 0.05 && tt < t.eight + 0.8), meLook = tt > t.and - 0.1 && tt < t.finals - 0.05;
      tyler.set({ x: TY[0], y: TY[1], z: TY[2], rotY: 0, ...sitLegs, lean: zeroed ? -0.18 : 0.32 + (writing ? 0.08 : 0), t: tt,
        armL: zeroed ? { x: 0.1, z: 2.6, el: 0.5 } : { x: -0.35, z: 0.4, el: 1.5 },
        armR: zeroed ? { x: 0.1, z: 2.6, el: 0.5 } : writing ? { x: -1.35 + 0.08 * Math.sin(tt * 14), z: 0.15, el: 0.5 } : tt > t.opens - 0.15 && tt < LID1 + 0.2 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: cooked ? 'spiral' : zeroed ? 'wide' : drops0 ? 'wide' : meLook ? 'half' : finals ? 'wide' : tt > LID1 ? 'wide' : 'half', mouth: cooked ? 'wavy' : zeroed ? 'grin' : drops0 ? 'o' : meLook ? 'flat' : finals ? 'wavy' : tt > LID1 ? 'o' : 'flat',
        brows: zeroed ? -0.2 : meLook ? 0.3 : finals ? 0.9 : 0.5, look: zeroed || drops0 ? [0, 0.9] : meLook ? [0.08, 0.35] : tt > LID1 && tt < t.then ? [0.35, -0.35] : [-0.15, -0.6], head: { x: zeroed || drops0 ? -0.3 : meLook ? -0.12 : 0.15, z: cooked ? 0.1 * Math.sin(tt * 18) : 0 },
        faceTint: finals && !cooked ? [0xff7a7a, 0.12] : [0, 0] });
      pencil.visible = tt < t.opens;
      if (!pov) { const tv = TYV(tt), hit = [t.finals, t.five, t.eight].filter((x) => tt > x).pop();
        ttag('tyler', tyler, tv, { pop: zeroed ? 1 + 0.22 * Math.exp(-(tt - t.zero) * 5) * Math.sin((tt - t.zero) * 14 + 1.57) : hit && tt < t.cooked ? 1 + 0.2 * Math.exp(-(tt - hit) * 6) * Math.sin((tt - hit) * 18) : 1, maxPx: 180 }); }
      for (const b of books) { if (tt < b.tb - 0.4) continue; b.m.visible = true; const h = drop(tt, b.tb - 0.35, 1.6, 0.35); b.m.position.set(b.x, b.y + h, b.z); b.m.rotation.set(0, b.rot, 0); }
      // the room behind him
      libKids.forEach((kd, i) => {
        const p = L(kd.x, 0, kd.z), turn = smooth(u01(tt, TURN0 + i * 0.06, TURN0 + 0.35 + i * 0.06)), sit = !kd.side;
        const rot0 = kd.side ? (kd.x < 0 ? PI / 2 + 0.6 : -PI / 2 - 0.6) : PI, rot1 = Math.atan2(TY[0] - p[0], TY[2] + 0.4 - p[2]);
        const rr = rot0 + (Math.atan2(Math.sin(rot1 - rot0), Math.cos(rot1 - rot0))) * turn;
        const st = sit ? 1 - smooth(u01(tt, TURN0 + 0.2 + i * 0.06, TURN0 + 0.5 + i * 0.06)) : 0;
        crowd.set(i, { x: p[0], y: 0.12 * st, z: p[2] + (sit ? 0.25 * (1 - st) : 0), rotY: rr, sit: st, wide: turn > 0.5, mouthW: turn > 0.5 ? 0.5 : 1, look: turn > 0.5 ? [0, 0.15] : [0, -0.6], armL: { x: -1.1 + 0.5 * turn, z: 0.2 }, armR: { x: -1.1, z: 0.2 }, t: tt });
        ctag(i, p[0], 0.12 * st, p[2] + (sit ? 0.25 * (1 - st) : 0), kd.val);
      });
      shotHand.visible = id === 'photo'; if (shotHand.visible) { const u = smooth(u01(tt, t.one - 0.1, t.photo - 0.05)); shotHand.position.set(LD.sheet[0] + 0.05, Y + lerp(0.55, 0.4, u), LD.sheet[1] + lerp(0.5, 0.2, u)); shotHand.rotation.set(0.1, 0, 0); flashSpr.material.opacity = tt > FLASH ? 1 - u01(tt, FLASH, FLASH + 0.25) : 0; }
      pen.g.visible = tt > PEN0 && tt < WRITE1 + 0.25;
      if (pen.g.visible) {
        const tip = tipWorld(writeP(tt)), loc = LIB.root.worldToLocal(V(...tip));
        const from = V(LD.laptop[0], Y + 0.25, LD.laptop[1]), u = smooth(u01(tt, PEN0, WRITE0)), scrib = tt > WRITE0 ? 0.004 * Math.sin(tt * 60) : 0;
        pen.g.position.set(lerp(from.x, loc.x, u) + scrib, lerp(from.y + 0.15, loc.y + 0.004, u) + (1 - u) * 0.2 * Math.sin(u * PI), lerp(from.z, loc.z, u));
        pen.g.rotation.set(-0.5, 0.4, -0.55 + scrib * 20); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tt * 20);
      }
      const pages = tt < WRITE0 ? 0 : Math.min(6, Math.floor(1 + 6 * u01(tt, t.even, WRITE1)));
      stackPages.forEach((m, i) => { m.visible = i < pages; m.position.y = 0.003 + i * 0.004; });
    }
    crowd.commit();

    // ----- camera
    const cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    if (sh.set === 'street') ST.aimSun(cam.look[0], cam.look[2], clamp(d * 0.9, 8, 26));
    studio.fill.intensity = sh.set === 'party' ? 0.9 : 0.55; studio.fill.distance = 8;
    if (tt > ENDCARD + 0.15) tags.hideAll();   // the end card's dark veil is see-through: no number behind the logo
    tags.update(studio.camera);
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 051-number-above-head --qc`): faces + numbers under the caption / callouts, shot list
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0);
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1);
      for (const [who, r] of [['Tyler', tyler], ['Maya', maya], ['Jake', jake], ['Emma', emma], ['Doug', doug], ['Chad', chad], ['Zoe', zoe], ['Dawson', dawson], ['Sam', sam]]) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06 && Math.abs(hy - 1000 / 1920) < 0.045) out.push(`${tt.toFixed(1)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under the caption "${cw.w}"`);
      }
      for (const [ti, T] of tags.tags.entries()) {
        if (!T.s.visible) continue;
        const hero = ti >= 60;
        T.s.getWorldPosition(v); const top = v.clone().add(V(0, T.s.scale.y, 0)); v.project(studio.camera); top.project(studio.camera);
        const hx = (v.x + 1) / 2, y0 = (1 - top.y) / 2, y1 = (1 - v.y) / 2; if (v.z > 1 || hx < 0 || hx > 1 || y1 < 0) continue;
        if (y0 < 0.12) out.push(`${tt.toFixed(1)}s number "${T.key.split('|')[0]}" at the top edge (y ${(y0 * 100).toFixed(0)}%)`);
        if (hero && cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.08 && y1 > 0.485 && y0 < 0.555) out.push(`${tt.toFixed(1)}s number "${T.key.split('|')[0]}" (${(y0 * 100).toFixed(0)}–${(y1 * 100).toFixed(0)}%) under the caption "${cw.w}"`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    out.push(`counts: kicks ${KICKS.length}, callouts ${story.callouts.length}, endcard ${ENDCARD.toFixed(2)} (visible ${(END - ENDCARD - 0.45).toFixed(2)} s)`);
    update(0); return out;
  };
  update(0);
  return { update };
}
