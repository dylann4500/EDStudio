// 049 — Scribe promo: "No Nut November" as a toy battle royale (story after @officialwriteit's reel, shortened: the island part runs
// 0–23 s instead of 32 s), then the last man alive turns out to be Tyler, who has been in the library since Halloween with forty
// handwritten-only calculus problems due at midnight. He one-shots them with Scribe (tryscribe.ink): one photo of the worksheet,
// Scribe solves all forty and writes them in HIS handwriting (the glyphs on screen are Scribe's own demo handwriting set), his
// professor finds a perfect match, done at 11:04 PM… and with 56 minutes left and 99 men in a blimp watching, he eliminates himself.
// Build-genre look (toon cast, word-keyed gags, impact kicks, 60 fps + blur, ElevenLabs Adam v3) but NOT the build format (manager
// brief): many places with hard cuts between scenes (one gliding rail per scene), a battle-royale HUD (engine/build/brhud.js).
// Product facts (the Scribe repo README + tryscribe.ink, Nov 2026): photo/PDF upload → solved problems written in a handwriting
// cloned from one practice sheet, adjustable messiness, hand-drawn figures/graphs, PDF out; "10 free assignments" (site hero).
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad, drop } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeGull } from '@engine/build/lighthouse.js';
import { buildIsland, groundY, SPOT, shoreR, makePeach } from '@engine/build/island.js';
import { makeCrowd, makeChutes, makeBeams, makePlane, makeBlimp, makeCrate, makeSpecs, cardTex } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice, makePen, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const at = (x, z, dy = 0) => [x, groundY(x, z) + dy, z];
const hop = (t, t0, t1, a, b, h) => { const u = clamp((t - t0) / (t1 - t0)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4 * h * u * (1 - u), lerp(a[2], b[2], u)]; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const I = await buildIsland(studio), IS = I.S.root, islandFog = scene.fog;
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---------------------------------------------------------------- word times
  const t = {
    hundred: W('hook', 'hundred'), jump: W('hook', 'jump'), plane: W('hook', 'plane'), no: W('hook', 'no'), november: W('hook', 'november'), last: W('hook', 'last'), wins: W('hook', 'wins'),
    seven: W('orchard', 'seven'), peach: W('orchard', 'peach'), bold: W('orchard', 'bold'), stupid: W('orchard', 'stupid'), gone: W('orchard', 'gone'),
    day4: W('wifi', 'day'), somebody: W('wifi', 'somebody'), wifi: W('wifi', 'wifi'), thirty: W('wifi', 'thirty'), go: W('wifi', 'go'), seconds: W('wifi', 'seconds'),
    day15: W('drop', 'day'), supply: W('drop', 'supply'), dropW: W('drop', 'drop'), twenty: W('drop', 'twenty'), rip: W('drop', 'rip'), open: W('drop', 'open'), two: W('drop', 'two'), cantaloupes: W('drop', 'cantaloupes'), nobody: W('drop', 'nobody'), survives: W('drop', 'survives'),
    everyone: W('blimp', 'everyone'), blimpW: W('blimp', 'blimp'), watch: W('blimp', 'watch'), judge: W('blimp', 'judge'),
    day29: W('seagull', 'day'), twoLeft: W('seagull', 'two'), trevor: W('seagull', 'trevor'), guy: W('seagull', 'guy'), libraryS: W('seagull', 'library'), seagull: W('seagull', 'seagull'), winks: W('seagull', 'winks'), trevor3: W('seagull', 'trevor', 3), out: W('seagull', 'out'),
    lastM: W('twist', 'last'), playing: W('twist', 'playing'),
    tyler: W('library', 'tyler'), halloween: W('library', 'halloween'), forty: W('library', 'forty'), handwritten: W('library', 'handwritten'), due: W('library', 'due'), midnight: W('library', 'midnight'), hes: W('library', 'hes'), number: W('library', 'number'),
    cooked: W('cooked', 'cooked'), so: W('cooked', 'so'), opens: W('cooked', 'opens'), scribe: W('cooked', 'scribe'),
    photo: W('solve', 'photo'), worksheet: W('solve', 'worksheet'), scribe2: W('solve', 'scribe'), solves: W('solve', 'solves'), forty2: W('solve', 'forty'),
    but: W('hand', 'but'), hw2: W('hand', 'handwritten'), soH: W('hand', 'so'), writes: W('hand', 'writes'), handwriting: W('hand', 'handwriting'), chicken: W('hand', 'chicken'), messy: W('hand', 'messy'), sevens: W('hand', 'sevens'), even: W('hand', 'even'), graphs: W('hand', 'graphs'),
    professor: W('match', 'professor'), holds: W('match', 'holds'), homework: W('match', 'homework'), perfect: W('match', 'perfect'), match: W('match', 'match'),
    oneShot: W('done', 'one'), shot: W('done', 'shot'), done: W('done', 'done'), eleven: W('done', 'eleven'), four: W('done', 'four'),
    tylerW: W('walk', 'tyler'), walks: W('walk', 'walks'), outside: W('walk', 'outside'), ninetynine: W('walk', 'ninetynine'), staring: W('walk', 'staring'), him: W('walk', 'him'), he: W('walk', 'he'), minutes: W('walk', 'minutes'), nothing: W('walk', 'nothing'), hands: W('walk', 'hands'),
    zero: W('zero', 'zero'), alive: W('zero', 'alive'),
  };
  const ENDCARD = t.alive + 0.75;

  // ---------------------------------------------------------------- the island cast + props
  const crowd = makeCrowd(IS, 100, { seed: 49 }), chutes = makeChutes(IS, 100), beams = makeBeams(IS, 48);
  const plane = makePlane(); IS.add(plane.g);
  const blimp = makeBlimp(); IS.add(blimp.g);
  const crate = makeCrate(); IS.add(crate.g);
  const bigPeach = makePeach(0.42); IS.add(bigPeach);
  const peaches2 = [0, 1, 2].map(() => { const p = makePeach(0.36); IS.add(p); return p; });
  const hugPeach = makePeach(0.4); IS.add(hugPeach);
  const gull = makeGull(); IS.add(gull.root);
  const gullEyes = gull.head.children.filter((c) => c.isGroup && c.children.length > 2);
  const spot = new THREE.SpotLight(0xfff1d0, 0, 40, 0.32, 0.5, 1.2); spot.castShadow = true; IS.add(spot, spot.target);
  const doorL = new THREE.PointLight(0xffc77a, 0, 8, 1.5); IS.add(doorL);
  const lampLs = [0, 1].map(() => { const l = new THREE.PointLight(0xffd590, 0, 9, 1.6); IS.add(l); return l; });
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const RED = 0xd8393b;
  const chris = mk1({ shirt: RED, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'side', skin: 0xf2c29a });
  const dev = mk1({ shirt: RED, pants: 0x2f3e5a, hair: 0x1a1a1a, hairStyle: 'messy', skin: 0x9c6644 });
  const trevor = mk1({ shirt: RED, pants: 0x5a4a3a, hair: 0xd8a55a, hairStyle: 'messy', skin: 0xf6d2b0, beard: 0xc89a4a });
  const tyler = mk1({ shirt: 0x2c3e66, pants: 0x3d3d3d, hair: 0x3a2a1c, hairStyle: 'messy', skin: 0xe0a97e, beard: 0x3a2a1c });
  const prof = mk1({ shirt: 0x7a5a3a, pants: 0x3d3d3d, hair: 0xd9d9d9, hairStyle: 'side', mustache: true, skin: 0xf2c29a });
  const specs = makeSpecs(); prof.head.add(specs); specs.position.set(0, 0.05, 0.262);
  { const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.5 })); bow.position.set(0, 0.36, 0.13); prof.armL.g.parent.add(bow); }
  // Tyler's hoodie hood (a fat roll behind his neck) + drawstrings
  { const hood = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.07, 10, 20), tyler.M.shirt); hood.position.set(0, 0.36, -0.1); hood.rotation.x = PI / 2 - 0.55; hood.scale.set(0.95, 0.95, 0.8); tyler.armL.g.parent.add(hood); }
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), new THREE.MeshStandardMaterial({ color: 0xffc93c, roughness: 0.5 })); tyler.hand(1).add(pencil); pencil.position.set(0, -0.03, 0.05); pencil.rotation.x = 1.2;
  const devPhone = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.16, 0.014), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.3 })); devPhone.add(b); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.145), new THREE.MeshBasicMaterial({ color: 0x9fd2ff, toneMapped: false })); s.position.z = -0.008; s.rotation.y = PI; devPhone.add(s); devPhone.scr = s; } dev.hand(1).add(devPhone); devPhone.position.set(0, -0.06, 0.06);
  const dizzy = makeDizzy(scene, { r: 0.3 });

  // ---------------------------------------------------------------- the library + office (parked far from the island)
  const sheet = makeSheet(G, { seed: 9, page: 'p. 1 of 7', problems: [
    { q: '1.  ∫ x sin x dx', a: '= x cos x\n= -x cos x + sin x + C', pre: true, cross: 9 },
    { q: '2.  d/dx [ ln(x² + 1) ]', a: '= 2x / (x^2 + 1)' },
    { q: '3.  lim (x→0)  sin(3x) / x', a: '= 3' },
    { q: '4.  ∫ (7x⁶ + 77) dx', a: '= x^7 + 77x + 7 + C' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  Σ 1/n²  (n = 1 → ∞)', a: '= π^2/6' },
  ] });
  const old = makeSheet(G, { seed: 4, title: 'MATH 1B · PROBLEM SET 8', note: 'Due Nov 23, 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 6', problems: [
    { q: '1.  ∫ 2x eˣ dx', a: '= 2x e^x - 2e^x + C', pre: true },
    { q: '2.  d/dx [ x³ sin x ]', a: '= 3x^2 sin x + x^3 cos x', pre: true },
    { q: '3.  lim (x→∞)  (2x + 1) / x', a: '= 2', pre: true },
    { q: '4.  ∫ 1/(1 + x²) dx', a: '= arctan x + C', pre: true },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true, pre: true },
    { q: '6.  Σ (1/2)ⁿ  (n = 0 → ∞)', a: '= 2', pre: true },
  ] });
  const spare = [makeSheet(G, { seed: 21, page: 'p. 2 of 7', problems: [{ q: '7.  ∫ cos²x dx', a: 'x/2 + sin(2x)/4 + C', pre: true }, { q: '8.  d/dx eˣ²', a: '2x e^x^2', pre: true }, { q: '9.  ∫ ln x dx', a: 'x ln x - x + C', pre: true }, { q: '10.  lim (1 + 1/n)ⁿ', a: '= e', pre: true }, { q: '11.  y′ = 3y', a: 'y = Ce^3x', pre: true }, { q: '12.  ∫ 1/x dx', a: 'ln|x| + C', pre: true }] })];
  const screen = makeScreen(G, icon, sheet);
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon }), LO = [3000, 0, 0]; LIB.root.position.set(...LO);
  const OFF = buildOffice(studio), OO = [3040, 0, 0]; OFF.root.position.set(...OO); for (const m of [OFF.desk, OFF.front, OFF.mug, OFF.handle]) m.visible = false;   // he stands in front of the board with both sheets
  const L = (x, y, z) => [LO[0] + x, LO[1] + y, LO[2] + z], O = (x, y, z) => [OO[0] + x, OO[1] + y, OO[2] + z];
  const Y = LD.deskY;
  // the finished stack (pages slide onto it as Scribe finishes them) + the pen + the photo insert (a hand holding a phone)
  const stackPages = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshStandardMaterial({ map: (i % 2 ? old : spare[0]).tex, roughness: 0.85 })); m.rotation.set(-PI / 2, 0, -0.1 + i * 0.04); LIB.stack.add(m); return m; });
  const pen = makePen(); LIB.root.add(pen.g);
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), tyler.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.26); shotHand.add(sleeve); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), tyler.M.skin); shotHand.add(hand); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.016, 0.25), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.3 })); camPhone.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0085, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0086, 0.1); camPhone.add(ui); }
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: crate.glow.material.map, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  const aPlus = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), new THREE.MeshBasicMaterial({ map: cardTex('A+', { bg: 'rgba(0,0,0,0)', fg: '#d0141e', w: 256, h: 190, px: 170 }), transparent: true, depthWrite: false }));
  const profSheets = [old, sheet].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.556), new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.85, side: THREE.DoubleSide })); OFF.root.add(m); return m; });
  profSheets[1].add(aPlus); aPlus.position.set(0.1, 0.17, 0.004);

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 420, confetti: 700, spark: 400, glow: 120, smoke: 300, drops: 400, crumb: 400 }, nearFade: [0.5, 1.6] });
  const FXN = { burst: 0, stream: 0, times: [] }; { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx); fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); return b0(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); return s0(k, t0, t1, o); }; }
  const KICKS = [];
  const kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);

  // ---------------------------------------------------------------- S1/S2: the plane + 100 jumpers (simulated once, sampled per frame)
  const PL = (tt) => [-42 + 17 * tt, 70, 30];
  const JDT = 1 / 60, JT1 = 4.6, NJ = 100, R = rng(1049);
  const jumpers = Array.from({ length: NJ }, (_, i) => {
    const te = 0.42 + i * 0.0125, to = t.no + 0.05 + R() * 0.55, p0 = add(PL(te), [-6.2, -1.6, (R() - 0.5) * 1.6]);
    const ang = R() * TAU, spd = 1.5 + R() * 3.5, tgt = [Math.cos(ang) * spd, Math.sin(ang) * spd * 0.7 + 1.2];
    let [x, y, z] = p0, vx = 13 + R() * 3, vy = -1, vz = (R() - 0.5) * 2;
    const S = [];
    for (let tt = te; tt <= JT1 + 1e-6; tt += JDT) {
      const u = clamp((tt - to) / 0.45), kD = lerp(0.045, 0.4, u);
      vx += (-0.9 * vx * (1 - u) + (tgt[0] - vx) * 1.6 * u) * JDT; vz += (-0.9 * vz * (1 - u) + (tgt[1] - vz) * 1.6 * u) * JDT; vy += (-9.8 + kD * vy * vy) * JDT;
      x += vx * JDT; y += vy * JDT; z += vz * JDT; S.push([x, y, z, u]);
    }
    return { te, to, S, spin: [(R() - 0.5) * 8, (R() - 0.5) * 6], ph: R() * TAU };
  });
  const jAt = (j, tt) => { const k = (tt - j.te) / JDT; if (k < 0) return null; const i = Math.min(j.S.length - 2, Math.floor(k)), f = Math.min(1, k - i); const a = j.S[i], b = j.S[i + 1]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(a[3], b[3], f)]; };
  const centroid = (tt) => { const c = [0, 0, 0]; let n = 0; for (const j of jumpers) { const p = jAt(j, tt); if (!p) continue; c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; n++; } return n ? c.map((v) => v / n) : PL(tt); };
  const C2 = Array.from({ length: 200 }, (_, k) => centroid(1.9 + k * 0.015));
  const cAt = (tt) => { const k = clamp((tt - 1.9) / 0.015, 0, 198.999), i = Math.floor(k), f = k - i; return C2[i].map((v, c) => lerp(v, C2[i + 1][c], f)); };

  // ---------------------------------------------------------------- S3: the orchard drop
  const OC = SPOT.orchard, CH = at(OC[0], OC[1] + 1.0), LAND = [[-4.6, 0.3], [4.4, -0.6], [0.3, -4.4], [-4.5, -4.3], [4.5, -4.1], [-2.3, -8.6]].map(([dx, dz]) => at(OC[0] + dx, OC[1] + dz));
  const landT = [5.32, 5.45, 5.58, 5.25, 5.66, 5.4], CHL = t.bold - 0.22;
  const BONK = t.stupid + 0.02, BONK2 = [t.stupid + 0.16, t.stupid + 0.36], GONE = t.gone - 0.05;
  kick(BONK, 1.0); kick(BONK2[0], 0.5); kick(BONK2[1], 0.45); kick(CHL, 0.5); kick(GONE, 0.6);
  fx.burst('dust', CHL, { pos: add(CH, [0, 0.05, -0.4]), n: 6, dir: [0, 1, 0], spread: 1.4, speed: [0.5, 1.2], size: [0.18, 0.35] });
  landT.forEach((lt, i) => fx.burst('dust', lt, { pos: add(LAND[i], [0, 0.1, 0]), n: 6, spread: 1.4, speed: [0.5, 1.2], size: [0.3, 0.5] }));
  fx.burst('crumb', BONK, { pos: add(CH, [0, 1.55, 0]), n: 22, color: 0xffa266, speed: [1.5, 3.5], spread: 1.2, floor: CH[1] });
  fx.burst('spark', BONK, { pos: add(CH, [0, 1.5, 0.2]), n: 14, speed: [2, 4], spread: 1.5 });
  BONK2.forEach((bt, k) => fx.burst('crumb', bt, { pos: add(LAND[[3, 5][k]], [0, 1.5, 0]), n: 14, color: 0xffa266, speed: [1.5, 3], floor: LAND[[3, 5][k]][1] }));

  // ---------------------------------------------------------------- S4: wifi hill
  const WF = SPOT.wifi, WY = groundY(...WF), ARC = t.wifi;
  const devPath = (tt) => { const a = at(WF[0] - 2.6, WF[1] - 2.6), b = at(WF[0] - 0.95, WF[1] + 0.95); const u = smooth(u01(tt, t.day4, t.wifi - 0.15)); return [lerp(a[0], b[0], u), groundY(lerp(a[0], b[0], u), lerp(a[2], b[2], u)), lerp(a[2], b[2], u)]; };
  const RUN0 = t.thirty - 0.05, RUN1 = t.go - 0.02, BEAM0 = t.go + 0.04;
  const runners = Array.from({ length: 30 }, (_, i) => { const ang = PI / 2 + 0.75 + (i / 29) * (TAU - 1.5) + (R() - 0.5) * 0.1, r0 = 10 + R() * 4, r1 = 1.9 + (i % 3) * 0.75; const a = at(WF[0] + Math.cos(ang) * r0, WF[1] + Math.sin(ang) * r0), b = at(WF[0] + Math.cos(ang) * r1, WF[1] + Math.sin(ang) * r1); return { a, b, tb: BEAM0 + 0.03 + i * 0.03, rot: Math.atan2(WF[0] - b[0], WF[1] - b[2]), ph: R() * TAU }; });
  kick(ARC, 0.35); kick(BEAM0, 0.7); kick(BEAM0 + 0.45, 0.4); kick(BEAM0 + 0.85, 0.5);
  fx.burst('spark', ARC, { pos: add(at(...WF), [0, 1.6, 0]), n: 24, speed: [1, 3], spread: 3.0, color: 0x9ff3ff });
  runners.forEach((r, i) => { if (i % 3 === 0) fx.burst('dust', RUN0 + 0.1, { pos: add(r.a, [0, 0.2, 0]), n: 4, spread: 1.2, speed: [0.5, 1.2], size: [0.3, 0.5] }); });
  
  // ---------------------------------------------------------------- S5: supply drop
  const DP = at(...SPOT.drop), LANDC = t.dropW + 0.02, BURST = t.open - 0.03, BEAMS5 = t.survives - 0.06;
  const ringR = Array.from({ length: 20 }, (_, i) => { const ang = PI / 2 + 0.55 + (i / 19) * (TAU - 1.1); const r0 = 12 + R() * 4, r1 = 1.75 + (i % 2) * 0.45; return { a: at(DP[0] + Math.cos(ang) * r0, DP[2] + Math.sin(ang) * r0), b: at(DP[0] + Math.cos(ang) * r1, DP[2] + Math.sin(ang) * r1), rot: Math.atan2(-Math.cos(ang), -Math.sin(ang)), ph: R() * TAU, arr: t.twenty + 0.25 + R() * 0.25 }; });
  kick(LANDC, 0.9); kick(BURST, 1.0); kick(BEAMS5, 1.2, 0.55); kick(t.cantaloupes, 0.3);
  fx.stream('smoke', t.day15, LANDC, { pos: add(DP, [0, 0, 0]), rate: 1, n: 1 });
  fx.burst('dust', LANDC, { pos: add(DP, [0, 0.15, 0]), n: 16, spread: 1.5, speed: [1, 2.6], size: [0.4, 0.9] });
  fx.burst('rock', BURST, { pos: add(DP, [0, 0.8, -0.3]), n: 12, color: 0xb07a46, size: [0.04, 0.09], speed: [2.5, 5], spread: 1.0, dir: [0, 1, -0.4], floor: DP[1] });
      fx.burst('spark', t.cantaloupes, { pos: add(DP, [0, 0.6, 0]), n: 24, color: 0xfff1a8, speed: [0.6, 1.8], spread: 3.0 });
    // purple flare smoke trailing the crate on the way down (sampled along its path)
  const crateY = (tt) => (tt < LANDC ? DP[1] + 22 * (1 - u01(tt, t.day15 - 0.3, LANDC)) : DP[1]);
  for (let k = 0; k < 26; k++) { const tt = t.day15 - 0.2 + k * ((LANDC - t.day15) / 26); fx.burst('smoke', tt, { pos: [DP[0] + Math.sin(tt * 2) * 0.3, crateY(tt) + 1.3, DP[2]], n: 2, color: 0x9b59d0, speed: [0.2, 0.6], size: [0.5, 0.9], life: [1.4, 2.0], g: -0.6 }); }

  // ---------------------------------------------------------------- S6/S14: the blimp
  const BP = [0, 37, -8], BPN = [SPOT.library[0] - 0.5, groundY(SPOT.library[0], SPOT.library[1] + 6) + 9.4, SPOT.library[1] + 8.6];
  const JUDGE = t.judge + 0.02; kick(JUDGE, 0.35);

  // ---------------------------------------------------------------- S7: dusk, Trevor + the gull
  const BC = SPOT.beach, BY = groundY(...BC), TREV = [BC[0], BY + 0.155, BC[1]];
  const PERCH = [BC[0] + 1.15, groundY(BC[0] + 1.15, BC[1] + 0.3) + 0.93, BC[1] + 0.3];
  const GULL0 = t.seagull - 0.35, GULL1 = t.seagull + 0.12, WINK = t.winks + 0.05, TOUT = t.out - 0.05;
  kick(TOUT, 0.8); kick(GULL1, 0.25);
  fx.burst('drops', WINK + 0.15, { pos: add(TREV, [0, 1.35, 0.15]), n: 10, color: 0xbfe6ff, speed: [0.6, 1.4], spread: 0.9, size: [0.02, 0.035] });
  fx.burst('glow', TOUT, { pos: add(TREV, [0, 1.0, 0]), n: 3, size: [2, 3] });

  // ---------------------------------------------------------------- library times
  const LID0 = t.opens - 0.05, LID1 = t.opens + 0.3, FLASH = t.photo + 0.05;
  const SCAN0 = FLASH + 0.15, SOLVE0 = t.scribe2 + 0.1, SOLVE1 = t.forty2 + 0.2;
  const PEN0 = t.soH + 0.05, WRITE0 = t.writes - 0.05, WRITE1 = t.graphs + 0.45;
  kick(FLASH, 0.35); kick(t.cooked, 0.6); kick(LID1, 0.3); kick(t.perfect + 0.05, 0.9); kick(t.match + 0.25, 0.5); kick(t.shot + 0.05, 0.5); kick(t.done, 0.5); kick(t.eleven, 0.35);
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.4, { pos: L(0, 1.62, LD.seat[1]), rate: 14, size: [0.12, 0.25], speed: [0.3, 0.8], spread: 0.4, life: [0.7, 1.1], g: -1.5, color: 0xdddddd });
    // handwriting progress: answers 2–3 (chicken scratch), 4 (the sevens), the graph, 6
  const items = sheet.items, cum = []; { let a = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; cum.push(a); } }
  const N = sheet.total;
  const lastOf = (pred) => { let k = -1; items.forEach((it, i) => { if (pred(it.pi)) k = i; }); return k < 0 ? 0 : cum[k]; };
  const pBefore7 = lastOf((pi) => pi < 3), pAfter7 = lastOf((pi) => pi <= 3), pAfterGraph = lastOf((pi) => pi <= 4);
  const PK = [[WRITE0, 0], [t.messy - 0.05, pBefore7], [t.sevens + 0.35, pAfter7], [t.even - 0.05, pAfter7 + 1], [t.graphs + 0.35, pAfterGraph], [WRITE1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  fx.stream('spark', WRITE0, WRITE1, { pos: L(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 18, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });

  // ---------------------------------------------------------------- walk + zero
  const LIBG = I.L, PORCH = [LIBG.porch[0], LIBG.porch[1], LIBG.porch[2]];
  const DOOR0 = t.walks - 0.1, WALK1 = t.outside + 0.45, SPOT_ON = t.staring - 0.25, ZAP = t.zero + 0.04;
  kick(SPOT_ON, 0.45); kick(ZAP, 1.1, 0.55); kick(t.alive, 0.5);
    fx.burst('drops', t.nothing, { pos: add(PORCH, [0.32, 1.62, 1.0]), n: 5, color: 0xbfe6ff, speed: [0.4, 0.9], spread: 0.6, dir: [1, 1, 0], size: [0.012, 0.02] });
  fx.burst('confetti', ZAP + 0.1, { pos: add(PORCH, [0, 2.2, 1.2]), n: 80, speed: [2, 4.5], spread: 1.1, floor: PORCH[1] });

  // ---------------------------------------------------------------- HUD (battle royale) + end card
  const feed = [
    { t: BONK + 0.05, name: 'CHRIS', by: 'A PEACH' }, { t: BONK2[0] + 0.06, name: 'LUIS', by: 'ANOTHER PEACH' }, { t: BONK2[1] + 0.1, name: 'ETHAN', by: null }, { t: GONE + 0.05, name: 'MATT', by: 'THE SAME PEACH' },
    { t: BEAM0 + 0.02, name: 'DEV', by: 'WIFI' }, { t: BEAM0 + 0.3, name: 'WES', by: 'A POP-UP' }, { t: BEAM0 + 0.55, name: 'FRANK', by: null }, { t: BEAM0 + 0.8, name: 'EVAN', by: null },
    { t: BEAMS5 + 0.05, name: 'ARJUN', by: 'TWO CANTALOUPES' }, { t: BEAMS5 + 0.3, name: 'WILL', by: 'TWO CANTALOUPES' }, { t: BEAMS5 + 0.55, name: 'VIK', by: null },
    { t: t.everyone + 0.25, name: 'MARCUS', by: 'A SOCK' }, { t: t.everyone + 0.65, name: 'RYAN', by: "HIS EX'S STORY" }, { t: t.blimpW + 0.1, name: 'NIKO', by: 'A POP-UP' },
    { t: t.watch + 0.05, name: 'ELLIOT', by: null }, { t: t.judge - 0.1, name: 'MAX', by: 'A FULLY CHARGED PHONE' }, { t: t.judge + 0.3, name: 'LUCAS', by: null },
    { t: TOUT + 0.05, name: 'TREVOR', by: 'A SEAGULL', life: 3.2 },
  ];
  const ALIVE = [[0, 100], [GONE, 100], [GONE + 0.3, 93], [BEAM0, 93], [BEAM0 + 0.95, 63], [BEAMS5, 63], [BEAMS5 + 0.25, 43], [t.everyone + 0.2, 43], [t.judge + 0.5, 2], [TOUT, 2], [TOUT + 0.15, 1], [ZAP + 0.25, 1], [ZAP + 0.45, 0]];
  const DAY = [[0, 'DAY 1 · 9:00 AM'], [t.day4, 'DAY 4 · 2:12 PM'], [t.day15, 'DAY 15 · 4:30 PM'], [t.everyone + 0.4, 'DAY 18 · 1:05 PM'], [t.blimpW, 'DAY 22 · 8:40 PM'], [t.judge, 'DAY 27 · 6:15 AM'], [t.day29, 'DAY 29 · 7:42 PM'], [t.lastM, 'DAY 30 · 11:00 PM'], [t.cooked, 'DAY 30 · 11:02 PM'], [t.but, 'DAY 30 · 11:03 PM'], [t.eleven, 'DAY 30 · 11:04 PM']];
  const MAPD = Array.from({ length: 14 }, () => { const a = R() * TAU, r = 10 + R() * 26; return [Math.cos(a) * r * 1.1, Math.sin(a) * r]; });
  const hud = makeHud({
    show: [t.last - 0.05, ENDCARD + 0.1], alive: ALIVE, day: DAY, feed,
    banner: { t: ZAP + 0.12, t1: ENDCARD + 0.3, name: 'TYLER', text: 'eliminated himself' },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' },
    map: { shoreR, spots: [[SPOT.orchard[0], SPOT.orchard[1], 'PEACHES'], [SPOT.wifi[0], SPOT.wifi[1], 'WIFI HILL'], [SPOT.library[0], SPOT.library[1], 'LIBRARY']],
      dots: (tt) => { const n = Math.round(ALIVE.reduce((v, [a, b]) => (tt >= a ? b : v), 100)); if (n <= 0) return []; if (n === 1) return [[SPOT.library[0], SPOT.library[1] + 2]]; if (n === 2) return [[SPOT.library[0], SPOT.library[1] + 2], [SPOT.beach[0], SPOT.beach[1] - 3]]; return MAPD.slice(0, Math.max(3, Math.round(14 * n / 100))); } },
  });

  // ---------------------------------------------------------------- SHOTS: one gliding rail per place, hard cuts between places
  const PLC = PL(1.0);
  const libWin = [LIBG.g.position.x - 4.25, LIBG.g.position.y + 1.9, LIBG.g.position.z + LIBG.zf + 0.1];
  const head = (tt, toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const sheetW = L(LD.sheet[0], Y, LD.sheet[1]), clockW = L(1.2, 3.55, -3.96), jackW = L(LD.jack[0], Y, LD.jack[1]);
  const TY = L(LD.seat[0], 0.145, LD.seat[1]), TYH = add(TY, [0, 1.16, 0]);
  const SHOTS = [
    { id: 'plane', t0: 0, set: 'island', mood: 'golden', frames: [
      { t: 0, pos: [-44, 60, 66], look: add(PL(0.7), [-8, -5, 0]), fov: 44 },
      { t: 1.9, pos: [-22, 57, 63], look: add(PL(1.5), [-10, -8, 0]), fov: 46 } ] },
    { id: 'fall', t0: 1.95, set: 'island', mood: 'golden', cam: (tt) => { const c = cAt(tt), s = smooth(u01(tt, t.last - 0.4, t.wins + 0.4)); return { pos: add(c, [lerp(2, 6, s), lerp(10, 14, s), lerp(16, 22, s)]), look: add(c, [0, lerp(-4, -26, s), lerp(-2, -22, s)]), fov: lerp(52, 56, s) }; } },
    { id: 'orchard', t0: t.seven, set: 'island', mood: 'golden', frames: [
      { t: t.seven, pos: add(CH, [0.5, 1.6, 12.5]), look: add(CH, [0, 5.0, -1]), fov: 52 },
      { t: CHL + 0.05, pos: add(CH, [0.45, 1.25, 4.2]), look: add(CH, [0, 0.62, 0]), fov: 46, keep: true, until: t.stupid + 0.5 },
      { t: t.gone, pos: add(CH, [0.5, 1.6, 7.2]), look: add(CH, [0, 3.0, -1]), fov: 52 } ] },
    { id: 'wifi', t0: t.day4, set: 'island', mood: 'day', frames: [
      { t: t.day4, pos: at(WF[0] + 1.2, WF[1] + 7.8, 1.3), look: add(at(...WF), [-0.4, 0.75, 0]), fov: 46 },
      { t: t.wifi - 0.05, pos: at(WF[0] + 0.3, WF[1] + 4.9, 1.45), look: add(at(...WF), [-0.3, 0.7, 0.6]), fov: 44, keep: true },
      { t: t.go, pos: at(WF[0] + 1.0, WF[1] + 11.5, 6.0), look: add(at(...WF), [0, 1.6, 0]), fov: 50 } ] },
    { id: 'drop', t0: t.day15, set: 'island', mood: 'day', frames: [
      { t: t.day15, pos: add(DP, [2.5, 1.5, 12.5]), look: add(DP, [0, 8.5, 0]), fov: 52 },
      { t: LANDC - 0.1, pos: add(DP, [2.0, 2.4, 8.0]), look: add(DP, [0, 1.0, 0]), fov: 48 } ] },
    { id: 'ring', t0: t.twenty - 0.08, set: 'island', mood: 'day', frames: [
      { t: t.twenty - 0.08, pos: add(DP, [0.1, 10.5, 3.8]), look: add(DP, [0, 0.4, 0.3]), fov: 52 },
      { t: t.open, pos: add(DP, [0.1, 8.6, 3.0]), look: add(DP, [0, 0.4, 0.3]), fov: 50, stop: true } ] },
    { id: 'melons', t0: t.two - 0.06, set: 'island', mood: 'day', frames: [
      { t: t.two - 0.06, pos: add(DP, [0, 2.0, 2.9]), look: add(DP, [0, 0.5, 0]), fov: 44 },
      { t: t.nobody, pos: add(DP, [1.4, 3.2, 9.0]), look: add(DP, [0, 2.6, 0]), fov: 52 } ] },
    { id: 'blimp', t0: t.everyone, set: 'island', mood: 'day', frames: [
      { t: t.everyone, pos: add(BP, [5, -16, 16]), look: add(BP, [0, -6, 0]), fov: 50 },
      { t: t.blimpW, pos: add(BP, [3, -5, 24]), look: add(BP, [0.5, -2.8, 0]), fov: 50 } ] },
    { id: 'stands', t0: t.watch - 0.1, set: 'island', mood: 'day', frames: [
      { t: t.watch - 0.1, pos: add(BP, [0.5, -5.5, 6.9]), look: add(BP, [0.5, -6.6, 0]), fov: 50 },
      { t: t.judge + 0.4, pos: add(BP, [0.5, -5.6, 6.2]), look: add(BP, [0.5, -6.5, 0]), fov: 50, stop: true } ] },
    { id: 'dusk', t0: t.day29, set: 'island', mood: 'dusk', frames: [
      { t: t.day29, pos: [22, 15, 86], look: [6, 4, 0], fov: 38 },
      { t: t.trevor - 0.3, pos: [18, 12, 78], look: [5, 4, -2], fov: 36 } ] },
    { id: 'trevor', t0: t.trevor - 0.05, set: 'island', mood: 'dusk', frames: [
      { t: t.trevor - 0.05, pos: add(TREV, [-0.3, 1.1, 4.5]), look: add(TREV, [0.15, 0.62, 0]), fov: 40 },
      { t: t.libraryS - 0.2, pos: add(TREV, [-0.25, 1.1, 4.1]), look: add(TREV, [0.15, 0.62, 0]), fov: 40, stop: true } ] },
    { id: 'libwin', t0: t.libraryS - 0.18, set: 'island', mood: 'dusk', frames: [
      { t: t.libraryS - 0.18, pos: add(libWin, [-1.3, 0.35, 5.4]), look: add(libWin, [0, 0.05, 0]), fov: 40 },
      { t: t.seagull - 0.15, pos: add(libWin, [-0.9, 0.25, 4.4]), look: add(libWin, [0, 0.05, 0]), fov: 40, stop: true } ] },
    { id: 'gull', t0: t.seagull - 0.12, set: 'island', mood: 'dusk', frames: [
      { t: t.seagull - 0.12, pos: add(TREV, [0.6, 1.1, 4.6]), look: add(TREV, [0.58, 0.7, 0.15]), fov: 42, keep: true, until: t.out },
      { t: t.out + 0.25, pos: add(TREV, [0.6, 1.8, 5.4]), look: add(TREV, [0.4, 2.2, 0.15]), fov: 44 } ] },
    { id: 'twist', t0: t.lastM - 0.08, set: 'island', mood: 'night', frames: [
      { t: t.lastM - 0.08, pos: add(libWin, [1.0, 1.0, 16]), look: add(libWin, [1.2, 1.5, 0]), fov: 44 },
      { t: t.playing + 0.3, pos: add(libWin, [0.0, 0.1, 3.0]), look: add(libWin, [0, 0, 0]), fov: 40, stop: true } ] },
    { id: 'lib', t0: t.tyler, set: 'lib', frames: [
      { t: t.tyler, pos: L(0.6, 1.55, 2.0), look: L(0, 0.86, -0.9), fov: 46 },
      { t: t.halloween - 0.2, pos: L(0.45, 1.5, 1.6), look: L(0, 0.84, -0.9), fov: 46, stop: true } ] },
    { id: 'jack', t0: t.halloween - 0.12, set: 'lib', frames: [
      { t: t.halloween - 0.12, pos: add(jackW, [0.45, 0.5, 1.3]), look: add(jackW, [0.3, 0.3, -0.45]), fov: 44 },
      { t: t.forty - 0.15, pos: add(jackW, [0.4, 0.46, 1.1]), look: add(jackW, [0.3, 0.3, -0.45]), fov: 44, stop: true } ] },
    { id: 'sheet', t0: t.forty - 0.1, set: 'lib', frames: [
      { t: t.forty - 0.1, pos: add(sheetW, [0.0, 0.66, 0.16]), look: add(sheetW, [0, 0, 0.03]), fov: 46, keep: true },
      { t: t.handwritten - 0.12, pos: add(sheetW, [0.0, 0.34, -0.1]), look: add(sheetW, [-0.02, 0, -0.2]), fov: 44, stop: true } ] },
    { id: 'clock', t0: t.due - 0.06, set: 'lib', frames: [
      { t: t.due - 0.06, pos: add(clockW, [0.3, -0.35, 1.75]), look: add(clockW, [0.05, -0.08, 0]), fov: 42 },
      { t: t.hes - 0.1, pos: add(clockW, [0.22, -0.28, 1.45]), look: add(clockW, [0.05, -0.08, 0]), fov: 42, stop: true } ] },
    { id: 'two', t0: t.hes - 0.06, set: 'lib', frames: [
      { t: t.hes - 0.06, pos: L(-0.6, 1.2, 0.75), look: L(-0.2, 0.84, -0.9), fov: 44 },
      { t: t.cooked - 0.15, pos: L(-0.55, 1.18, 0.6), look: L(-0.2, 0.84, -0.9), fov: 44, stop: true } ] },
    { id: 'cooked', t0: t.cooked - 0.1, set: 'lib', cam: (tt) => { const h = head(tt, tyler); return { pos: add(h, [0.18, -0.02, 2.2 - 0.15 * u01(tt, t.cooked, t.so)]), look: add(h, [0, -0.3, 0]), fov: 40 }; } },
    { id: 'opens', t0: t.so - 0.04, set: 'lib', frames: [
      { t: t.so - 0.04, pos: L(0.7, 1.4, 1.5), look: L(0.2, 0.92, -0.95), fov: 44 },
      { t: t.scribe - 0.15, pos: L(0.65, 1.38, 1.3), look: L(0.2, 0.92, -0.95), fov: 44, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: W('solve', 'one'), set: 'lib', frames: [
      { t: W('solve', 'one'), pos: add(sheetW, [0.35, 0.72, 0.85]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42 },
      { t: t.scribe2 - 0.15, pos: add(sheetW, [0.3, 0.68, 0.72]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42, stop: true } ] },
    { id: 'solve', t0: t.scribe2 - 0.1, set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'worry', t0: t.but - 0.05, set: 'lib', cam: (tt) => { const h = head(tt, tyler); return { pos: add(h, [0.3, -0.02, 1.8 - 0.15 * u01(tt, t.but, t.soH)]), look: add(h, [0.02, -0.2, 0]), fov: 40 }; } },
    { id: 'write', t0: t.soH - 0.05, set: 'lib', frames: [
      { t: t.soH - 0.05, pos: L(0.05, 1.42, 0.75), look: L(0.05, 0.86, -0.8), fov: 46 },
      { t: t.writes + 0.05, pos: add(sheetW, [0.02, 0.48, 0.32]), look: add(sheetW, [-0.01, 0, -0.04]), fov: 44, stop: true } ] },
    { id: 'macro', t0: t.chicken - 0.12, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'prof', t0: t.professor - 0.12, set: 'office', frames: [
      { t: t.professor - 0.12, pos: O(0.05, 1.3, 3.5), look: O(0, 0.8, 0.3), fov: 46 },
      { t: t.homework - 0.1, pos: O(0.03, 1.25, 3.0), look: O(0, 0.8, 0.35), fov: 46, keep: true, until: t.match + 0.3 } ] },
    { id: 'done', t0: t.oneShot - 0.06, set: 'lib', cam: (tt) => { const h = head(tt, tyler); return { pos: add(h, [0.45, 0.0, 2.5 - 0.2 * u01(tt, t.oneShot, t.eleven)]), look: add(h, [0, -0.42, 0.2]), fov: 44 }; } },
    { id: 'clock2', t0: t.eleven - 0.12, set: 'lib', frames: [
      { t: t.eleven - 0.12, pos: add(clockW, [0.15, -0.15, 1.3]), look: add(clockW, [0.0, -0.02, 0]), fov: 40 },
      { t: t.tylerW - 0.1, pos: add(clockW, [0.12, -0.13, 1.1]), look: add(clockW, [0.0, -0.02, 0]), fov: 40, stop: true } ] },
    { id: 'walk', t0: t.tylerW - 0.05, set: 'island', mood: 'night', frames: [
      { t: t.tylerW - 0.05, pos: add(PORCH, [0.6, 1.0, 5.0]), look: add(PORCH, [0, 0.7, 0]), fov: 46 },
      { t: t.ninetynine - 0.15, pos: add(PORCH, [0.5, 1.0, 4.3]), look: add(PORCH, [0, 0.7, 0.5]), fov: 46, stop: true } ] },
    { id: 'stare', t0: t.ninetynine - 0.1, set: 'island', mood: 'night', frames: [
      { t: t.ninetynine - 0.1, pos: add(PORCH, [0.35, 1.55, -1.0]), look: add(BPN, [-0.5, -5.4, 0]), fov: 52 },
      { t: t.he - 0.15, pos: add(PORCH, [0.35, 1.5, -0.7]), look: add(BPN, [-0.5, -5.6, 0]), fov: 48, stop: true } ] },
    { id: 'face', t0: t.he - 0.08, set: 'island', mood: 'night', cam: (tt) => { const h = head(0, tyler); return { pos: add(h, [0.25, -0.02, 1.75 - 0.15 * u01(tt, t.he, t.nothing)]), look: add(h, [0, -0.2, 0]), fov: 40 }; } },
    { id: 'hands', t0: t.nothing - 0.12, set: 'island', mood: 'night', cam: (tt) => { const h = head(0, tyler); return { pos: add(h, [0.1, -0.35, 2.1 - 0.15 * u01(tt, t.nothing, t.hands + 0.3)]), look: add(h, [0, -0.5, 0]), fov: 44 }; } },
    { id: 'zero', t0: t.zero - 0.06, set: 'island', mood: 'night', frames: [
      { t: t.zero - 0.06, pos: add(PORCH, [0.9, 1.1, 6.0]), look: add(PORCH, [0, 2.0, 0]), fov: 52 },
      { t: ENDCARD + 0.9, pos: add(PORCH, [1.4, 0.7, 4.6]), look: add(PORCH, [0, 6.0, 0.5]), fov: 56, stop: true } ] },
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
  // the macro follow-cam on the pen tip (smoothed over the last 0.35 s so line breaks glide)
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  function macroCam(tt) {
    const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length);
    const g = tt > t.even - 0.1 ? 0.12 : 0;   // the graph is bigger: back off a little
    return { pos: add(m, [-0.06, 0.24 + g, 0.15 + g * 0.6]), look: add(m, [0.01, 0, -0.015]), fov: 42 };
  }

  // ---------------------------------------------------------------- per-frame
  const vA = V(0, 0, 0);
  function setWorld(sh, tt) {
    const isl = sh.set === 'island';
    IS.visible = isl; LIB.root.visible = sh.set === 'lib'; OFF.root.visible = sh.set === 'office';
    if (isl) { scene.fog = islandFog; I.setMood(sh.mood); scene.environmentIntensity = sh.mood === 'night' ? 0.35 : 0.7; }
    else { scene.fog = null; scene.background = new THREE.Color(0x1a1410); renderer.toneMappingExposure = 1.06; scene.environmentIntensity = 0.3; }
    if (isl && sh.mood === 'night') renderer.toneMappingExposure = 1.42;
  }
  const hideToons = () => { for (const r of [chris, dev, trevor, tyler, prof]) r.root.visible = false; };

  function update(tt) {
    const sh = shotAt(tt); setWorld(sh, tt); hideToons();
    crowd.hideAll(); for (let i = 0; i < 100; i++) chutes.set(i, null); for (let i = 0; i < 48; i++) beams.set(i, 0, 0, 0, 0);
    plane.g.visible = false; crate.g.visible = false; bigPeach.visible = false; peaches2.forEach((p) => (p.visible = false)); hugPeach.visible = false; gull.root.visible = false;
    blimp.g.visible = true; blimp.spotM.opacity = 0; spot.intensity = 0; doorL.intensity = 0; lampLs.forEach((l) => (l.intensity = 0)); LIBG.lamps.forEach((b) => (b.material.emissiveIntensity = 0.2));
    blimp.g.position.set(...BP); blimp.g.rotation.set(0, 0, 0);
    LIBG.doors.forEach((d, i) => (d.rotation.y = 0));
    I.router.arcs.forEach((a) => (a.material.opacity = 0.12)); I.router.leds.forEach((l) => (l.visible = true));
    const id = sh.id;

    // ----- the plane + the jump + the chutes (S1, S2)
    if (id === 'plane' || id === 'fall') {
      plane.g.visible = true; plane.g.position.set(...PL(tt)); plane.g.rotation.set(0.05 * Math.sin(tt * 1.3), 0, 0.03 * Math.sin(tt)); plane.update(tt); plane.ramp.rotation.z = 0.55 * smooth(u01(tt, 0, 0.3));
      jumpers.forEach((j, i) => {
        const p = jAt(j, tt); if (!p) return;
        const a = tt - j.te, op = p[3], fallSpin = (1 - op);
        const body = [p[0], p[1] - (op > 0 ? 0 : 0.7), p[2]];
        crowd.set(i, { x: p[0], y: p[1] - 1.1 * op - (1 - op) * 0.7, z: p[2], rotY: j.ph, tumble: [fallSpin * (1.25 + 0.3 * Math.sin(a * j.spin[0])), fallSpin * 0.4 * Math.sin(a * j.spin[1])],
          armL: op > 0.5 ? { x: 0, z: 2.6 } : { x: 0, z: 1.35 }, armR: op > 0.5 ? { x: 0, z: 2.6 } : { x: 0, z: 1.35 }, wide: true, kick: 1 - op, t: tt, look: [0, op > 0.5 ? 0.5 : -0.4] });
        if (op > 0.01) chutes.set(i, [p[0], p[1] + 1.25 * op + 0.9, p[2]], [p[0], p[1] - 1.1 * op - 0.0 + 0.79, p[2]], op, 0.05 * Math.sin(tt * 1.5 + j.ph));
      });
    }
    // ----- S3: the orchard
    if (id === 'orchard') {
      const desc = (lt, base, tt2) => { const u = clamp((tt2 - (lt - 1.3)) / 1.3); return [base[0] + (1 - u) * 1.2, base[1] + 16 * (1 - u) ** 1.25, base[2] - (1 - u) * 0.8]; };
      LAND.forEach((b, i) => {
        const lt = landT[i], p = tt < lt ? desc(lt, b, tt) : b, landed = tt >= lt, beamT = GONE + i * 0.04, lift = tt > beamT ? 9 * easeInQuad(u01(tt, beamT + 0.08, beamT + 0.9)) : 0;
        const hugger = i === 1, bonked = i === 1 ? 0 : i === 3 ? BONK2[0] : i === 5 ? BONK2[1] : 0;
        const hurt = bonked && tt > bonked;
        crowd.set(i, { x: p[0], y: p[1] + lift, z: p[2], rotY: Math.atan2(CH[0] - p[0], (CH[2] + 6) - p[2]), armL: landed ? (hugger ? { x: -1.2, z: 0.4 } : { x: 0, z: 0.2 }) : { x: 0, z: 2.5 }, armR: landed ? (hugger ? { x: -1.2, z: 0.4 } : { x: 0, z: 0.2 }) : { x: 0, z: 2.5 },
          wide: hurt || lift > 0, tumble: hurt ? [0, 0.4 * Math.exp(-(tt - bonked) * 4) * Math.sin((tt - bonked) * 20)] : null, look: [0, landed ? 0 : 0.5] });
        if (!landed) chutes.set(i, add(p, [0, 2.5, 0]), add(p, [0, 0.79, 0]), 1, 0.06 * Math.sin(tt * 2 + i));
        if (lift > 0) beams.set(i, b[0], b[1], b[2], clamp((tt - beamT) / 0.12) * (1 - u01(tt, beamT + 1.2, beamT + 1.6)));
      });
      hugPeach.visible = tt > landT[1] + 0.1; hugPeach.position.set(...add(LAND[1], [0, 0.7 + (tt > GONE + 0.04 ? 9 * easeInQuad(u01(tt, GONE + 0.12, GONE + 0.94)) : 0), 0.35]));
      BONK2.forEach((bt, k) => { const b = LAND[[3, 5][k]], p = peaches2[k]; p.visible = tt > bt - 0.3 && tt < bt + 0.8; if (!p.visible) return; const top = add(b, [0, 1.62, 0]); p.position.set(...(tt < bt ? add(top, [0, 3.2 * (1 - easeInQuad(u01(tt, bt - 0.3, bt))), 0]) : hop(tt, bt, bt + 0.6, top, add(b, [0.9, 0.36, 0.5]), 0.8))); p.rotation.z = tt * 6; });
      // Chris: falls in on his chute, lands, BOLD pose, the giant peach, X eyes, beamed up
      chris.root.visible = true;
      const cp = tt < CHL ? desc(CHL, CH, tt) : CH, lift = tt > GONE ? 10 * easeInQuad(u01(tt, GONE + 0.1, GONE + 0.85)) : 0, hit = tt > BONK;
      const [sx, sy] = squash(tt, CHL, 0.3), [hx, hy] = hit ? squash(tt, BONK, 0.5) : [1, 1];
      const pose = tt < CHL ? { armL: { x: 0, z: 2.6 }, armR: { x: 0, z: 2.6 }, eyes: 'wide', mouth: 'grin' }
        : !hit ? { armL: { x: -0.2, z: 2.2, el: 1.8 }, armR: { x: -0.2, z: 2.2, el: 1.8 }, eyes: 'open', mouth: 'grin', brows: -0.4, look: [0, 0.2] }
        : { armL: { x: 0, z: 0.9 }, armR: { x: 0, z: 0.9 }, eyes: 'x', mouth: 'wavy', brows: 0.5 };
      chris.set({ x: cp[0], y: cp[1] + lift, z: cp[2], rotY: 0.08, squash: [sx * hx, sy * hy], t: tt, ...pose });
      if (tt < CHL) chutes.set(99, add(cp, [0, 2.6, 0]), add(cp, [0, 0.85, 0]), 1, 0.05 * Math.sin(tt * 2));
      dizzy.update(tt, hit && tt < GONE + 0.2 ? 1 : 0, add(cp, [0, 1.62 + lift, 0]));
      bigPeach.visible = tt > BONK - 0.35 && tt < BONK + 1.0;
      if (bigPeach.visible) { const top = add(CH, [0, 1.72, 0]); bigPeach.position.set(...(tt < BONK ? add(top, [0, 3.6 * (1 - easeInQuad(u01(tt, BONK - 0.32, BONK))), 0]) : hop(tt, BONK, BONK + 0.75, top, add(CH, [1.3, 0.42, 0.9]), 1.1))); bigPeach.rotation.set(0.3, 0, -tt * 5); }
      if (lift > 0) beams.set(7, CH[0], CH[1], CH[2], clamp((tt - GONE) / 0.12));
    }
    // ----- S4: wifi hill
    if (id === 'wifi') {
      const lit = tt > ARC; I.router.arcs.forEach((a, k) => { a.material.opacity = 0.12 + 0.85 * smooth(u01(tt, ARC + k * 0.07, ARC + k * 0.07 + 0.12)); });
      dev.root.visible = true; devPhone.scr.material.color.setHex(lit ? 0xbff0ff : 0x334455);
      const dp = devPath(tt), walking = tt < t.wifi - 0.15, dLift = tt > BEAM0 ? 10 * easeInQuad(u01(tt, BEAM0 + 0.08, BEAM0 + 0.9)) : 0;
      dev.set({ x: dp[0], y: dp[1] + dLift, z: dp[2], rotY: walking ? Math.atan2(1.65, 3.55) : 0.25, walk: walking ? tt * 11 : null, armR: { x: -2.3, z: 0.3, el: 0.3 }, armL: lit ? { x: -0.4, z: 1.6 } : {},
        eyes: lit ? 'wide' : 'half', mouth: lit ? (tt > ARC + 0.25 ? 'grin' : 'o') : 'flat', look: [0, 0.6], t: tt });
      if (dLift > 0) beams.set(30, dp[0], dp[1], dp[2], clamp((tt - BEAM0) / 0.1));
      runners.forEach((r, i) => {
        if (tt < RUN0) return;
        const u = smooth(u01(tt, RUN0 + (i % 5) * 0.04, RUN1 + (i % 4) * 0.05)), x = lerp(r.a[0], r.b[0], u), z = lerp(r.a[2], r.b[2], u), y = groundY(x, z), up = tt > r.tb ? 10 * easeInQuad(u01(tt, r.tb + 0.06, r.tb + 0.8)) : 0;
        const running = u < 0.98;
        crowd.set(i, { x, y: y + up + (running ? Math.abs(Math.sin(tt * 12 + r.ph)) * 0.08 : 0), z, rotY: r.rot, phone: !running, armL: running ? { x: Math.sin(tt * 12 + r.ph) * 0.9, z: 0.2 } : { x: -1.3, z: 0.2 }, armR: running ? { x: -Math.sin(tt * 12 + r.ph) * 0.9, z: 0.2 } : { x: -1.3, z: 0.2 },
          kick: running ? 1 : 0, t: tt, wide: !running, lean: running ? 0.3 : 0 });
        if (up > 0) beams.set(i, r.b[0], r.b[1], r.b[2], 0.45 * clamp((tt - r.tb) / 0.1) * (1 - u01(tt, r.tb + 0.7, r.tb + 1.0)), 70, 0.6);
      });
      crowd.setGlow(lit ? 1.4 : 0);
    } else crowd.setGlow(0);
    // ----- S5: the supply drop
    if (id === 'drop' || id === 'ring' || id === 'melons') {
      crate.g.visible = true; const cy = crateY(tt); crate.g.position.set(DP[0], cy, DP[2]); crate.g.rotation.set(tt < LANDC ? 0.08 * Math.sin(tt * 2.2) : 0, 0.4, tt < LANDC ? 0.06 * Math.cos(tt * 1.7) : 0);
      { const cu = u01(tt, LANDC, LANDC + 0.45); crate.chute.visible = tt < LANDC + 0.45; crate.chute.scale.set(1, Math.max(0.05, 1 - cu), 1); crate.chute.position.set(0, 0, -2.2 * cu); crate.chute.rotation.x = -0.9 * cu; }
      crate.burst(tt > BURST ? Math.min(1.4, tt - BURST) : 0); crate.inside.visible = tt > BURST;
      crate.glow.material.opacity = 0.9 * smooth(u01(tt, t.two - 0.2, t.cantaloupes));
      crate.melons.forEach((m, k) => { m.position.y = 0.46 + 0.04 * Math.sin(tt * 3 + k); });
      ringR.forEach((r, i) => {
        if (tt < t.twenty - 0.1) return;
        const u = smooth(u01(tt, t.twenty - 0.1, r.arr)), x = lerp(r.a[0], r.b[0], u), z = lerp(r.a[2], r.b[2], u), y = groundY(x, z), up = tt > BEAMS5 ? 12 * easeInQuad(u01(tt, BEAMS5 + 0.05, BEAMS5 + 0.85)) : 0, running = u < 0.98;
        crowd.set(i, { x, y: y + up, z, rotY: r.rot, armL: running ? { x: Math.sin(tt * 12 + r.ph) * 0.9 } : tt < BURST + 0.2 ? { x: -1.4, z: 0.3 } : { x: 0, z: 2.6 }, armR: running ? { x: -Math.sin(tt * 12 + r.ph) * 0.9 } : tt < BURST + 0.2 ? { x: -1.4, z: 0.3 } : { x: 0, z: 2.6 },
          wide: tt > t.two - 0.2, look: [0, -0.5], kick: running ? 1 : 0, t: tt, lean: running ? 0.3 : tt < BURST ? 0.35 : 0 });
        if (up > 0) beams.set(i, r.b[0], r.b[1], r.b[2], 0.5 * clamp((tt - BEAMS5) / 0.1), 70, 0.6);
      });
    }
    // ----- the blimp's grandstand (S6) + the night stare (S14, S15)
    const night = id === 'walk' || id === 'stare' || id === 'face' || id === 'hands' || id === 'zero';
    if (night) { blimp.g.position.set(...BPN); blimp.g.rotation.y = PI; }
    if (id === 'blimp' || id === 'stands' || night || id === 'dusk' || id === 'twist') {
      blimp.g.position.y += 0.25 * Math.sin(tt * 0.8); blimp.g.updateMatrixWorld(true);
      const seated = id === 'blimp' ? Math.round(lerp(44, 64, u01(tt, t.everyone, t.watch))) : 64, gs = id === 'blimp' || id === 'stands';
      blimp.seats.forEach((s, i) => {
        if (i >= seated || (!gs && !night)) return;
        const p = blimp.gond.localToWorld(V(...s));
        const lookTy = night ? [0, -0.65 + 0.1 * Math.sin(i)] : [0.2 * Math.sin(i * 1.7), -0.2];
        const card = gs && tt > JUDGE && i % 2 === 0, cardUp = card ? easeOutBack(u01(tt, JUDGE + (i % 7) * 0.03, JUDGE + 0.3 + (i % 7) * 0.03)) : 0;
        crowd.set(i, { x: p.x, y: p.y - 0.36, z: p.z, rotY: blimp.g.rotation.y, sit: 1, look: lookTy, card, cardUp, t: tt, mouthW: 1, armL: card ? { x: -0.3, z: 2.3, el: 0.8 } : { x: -0.5, z: 0.2, el: 1.2 }, armR: { x: -0.5, z: 0.2, el: 1.2 } });
      });
      if (id === 'blimp') for (let k = 0; k < 6; k++) { const tb = t.everyone + k * 0.15, p0 = add(BP, [-4 + k * 1.6, -36, 2]), p1 = add(BP, [-4 + k * 1.6, -7.2, 1.0]); const u = easeInQuad(u01(tt, tb, tb + 0.8)); if (u >= 1) continue; crowd.set(64 + k, { x: lerp(p0[0], p1[0], u), y: lerp(p0[1], p1[1], u), z: p0[2], rotY: 0.3 * k, armL: { x: 0, z: 2.6 }, armR: { x: 0, z: 2.6 }, wide: true }); beams.set(10 + k, p0[0], p0[1], p0[2], 0.7, 36, 0.8); }
    }
    // ----- S7: dusk, Trevor + the gull
    if (id === 'trevor' || id === 'gull' || id === 'dusk') {
      trevor.root.visible = id !== 'dusk';
      const up = tt > TOUT ? 9 * easeInQuad(u01(tt, TOUT + 0.1, TOUT + 0.85)) : 0, wink = tt > WINK && tt < WINK + 0.45;
      trevor.set({ x: TREV[0], y: TREV[1] + up, z: TREV[2], rotY: 0.12 + (tt > t.seagull + 0.1 && tt < TOUT ? 0.45 : 0), legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.45, kn: 1.5 },
        armL: { x: -0.9, z: 0.3, el: 1.4 }, armR: { x: -0.9, z: 0.3, el: 1.4 }, lean: 0.25 + 0.04 * Math.sin(tt * 9),
        eyes: tt > WINK + 0.05 ? 'wide' : 'half', mouth: tt > WINK + 0.05 ? 'o' : 'wavy', beard: 0.12, look: tt > t.seagull ? [0.8, 0.1] : [0, -0.2], brows: 0.8, faceTint: tt > WINK + 0.1 ? [0xff7a7a, 0.25] : [0, 0], head: { y: tt > t.seagull ? 0.35 : 0, z: 0.04 * Math.sin(tt * 7) }, t: tt });
      if (up > 0) beams.set(0, TREV[0], BY, TREV[2], clamp((tt - TOUT) / 0.1));
      gull.root.visible = id === 'gull'; if (gull.root.visible) {
        const g0 = add(PERCH, [3.5, 1.6, 0.6]), fly = tt < GULL1, p = fly ? hop(tt, GULL0, GULL1, g0, PERCH, 0.4) : PERCH;
        gull.set({ x: p[0], y: p[1] + (tt > TOUT ? 0 : 0), z: p[2], rotY: -PI / 2 + 0.55, flap: fly ? 1 : 0, t: tt, scale: 1.25, headY: tt > t.seagull + 0.15 ? (tt > TOUT + 0.1 ? -0.2 : -0.35) : 0, headX: tt > TOUT + 0.2 ? -0.7 : 0, spread: fly ? 1 : 0 });
        gullEyes.forEach((e, k) => { e.scale.y = k === 1 && wink ? 0.15 : 1; });
      }
    }
    // ----- the library exterior (dusk window, night twist, walk, stare, zero)
    const ext = id === 'libwin' || id === 'twist' || night;
    if (ext) {
      LIBG.lamps.forEach((b) => (b.material.emissiveIntensity = night || id === 'twist' ? 2.2 : 0.6));
      if (night || id === 'twist') lampLs.forEach((l, k) => { l.intensity = 2.2; l.position.set(LIBG.g.position.x + (k ? 3.4 : -3.4), LIBG.g.position.y + 3.2, LIBG.g.position.z + 4.5); });
    }
    if (night) {
      const open = smooth(u01(tt, DOOR0, DOOR0 + 0.35)); LIBG.doors.forEach((d, i) => (d.rotation.y = (i ? -1 : 1) * -1.35 * open));
      doorL.intensity = 3 * open; doorL.position.set(LIBG.g.position.x, LIBG.g.position.y + 2.2, LIBG.g.position.z + LIBG.zf + 1.2);
      tyler.root.visible = true;
      const p0 = add(PORCH, [0, 0, -1.6]), p1 = add(PORCH, [0, 0, 0.9]), u = smooth(u01(tt, DOOR0 + 0.1, WALK1)), up = tt > ZAP ? 30 * easeInQuad(u01(tt, ZAP + 0.12, ZAP + 1.0)) : 0;
      const p = [lerp(p0[0], p1[0], u), PORCH[1], lerp(p0[2], p1[2], u)];
      const stretch = smooth(u01(tt, WALK1 - 0.1, WALK1 + 0.3)) * (1 - smooth(u01(tt, t.staring - 0.3, t.staring)));
      const fid = tt > t.nothing - 0.15, fpos = Math.sin(tt * 9), f2 = Math.sin(tt * 6.3 + 1);
      tyler.set({ x: p[0], y: p[1] + up, z: p[2], rotY: 0, walk: u > 0 && u < 0.99 ? tt * 10 : null, beard: 0, t: tt,
        armL: fid ? { x: -0.55 + 0.2 * fpos, z: -0.35, el: 1.55 + 0.35 * f2 } : stretch > 0.1 ? { x: 0, z: 2.6 * stretch, el: 1.2 * stretch } : {},
        armR: fid ? { x: -0.55 - 0.2 * fpos, z: -0.35, el: 1.55 - 0.35 * f2 } : stretch > 0.1 ? { x: 0, z: 2.6 * stretch, el: 1.2 * stretch } : {},
        eyes: tt > t.staring ? (tt > ZAP ? 'wide' : 'wide') : stretch > 0.4 ? 'closed' : 'open', mouth: tt > ZAP ? 'scream' : tt > t.he ? 'wavy' : tt > t.staring ? 'flat' : stretch > 0.4 ? 'o' : 'smile',
        look: fid ? [0.2 * Math.sin(tt * 5), -0.8] : tt > t.he ? [0.85 * Math.sign(Math.sin(tt * 3.3)), 0.3] : [0, 0.5], brows: tt > t.staring ? 0.9 : 0, head: { x: fid ? 0.25 : tt > t.staring ? -0.2 : 0 }, faceTint: tt > t.minutes ? [0xff6b6b, 0.18] : [0, 0] });
      if (tt > SPOT_ON) { blimp.spotM.opacity = (id === 'stare' ? 0.06 : 0.16) * smooth(u01(tt, SPOT_ON, SPOT_ON + 0.2)); blimp.aimSpots(V(p[0], p[1], p[2])); spot.intensity = 60 * smooth(u01(tt, SPOT_ON, SPOT_ON + 0.2)); blimp.gond.localToWorld(spot.position.set(0, -2, 1)); spot.target.position.set(p[0], p[1] + 1, p[2]); }
      if (tt > ZAP) beams.set(0, p[0], p[1], p[2], clamp((tt - ZAP) / 0.12) * (1 - u01(tt, ZAP + 1.0, ZAP + 1.5)), 70, 0.9);
    }
    // ----- the library interior: Tyler at the desk
    if (sh.set === 'lib') {
      const pov = !!sh.pov; tyler.root.visible = !pov; LIB.chair.visible = !pov;
      const lid = tt < LID0 ? PI / 2 - 0.02 : tt > t.shot ? lerp(-0.22, PI / 2 - 0.02, easeInQuad(u01(tt, t.shot, t.shot + 0.25))) : lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tt, LID0, LID1)));
      LIB.laptop.hinge.rotation.x = lid; LIB.scrL.intensity = tt > LID0 && tt < t.shot + 0.2 ? 1.6 : 0;
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      const wp = writeP(tt); sheet.draw(wp); screen.draw({ mode, k });
      LIB.setClock(11, tt > t.eleven + 0.05 ? 4 : tt > t.cooked ? 3 : 1 + 2 * u01(tt, t.tyler, t.due + 0.5));
      const leanBack = tt > t.oneShot - 0.1, cooked = tt > t.cooked - 0.05 && tt < t.opens - 0.1, worried = tt > t.but - 0.1 && tt < t.soH + 0.3, writing = tt > t.hes - 0.2 && tt < t.cooked - 0.1;
      const lean = leanBack ? -0.18 : 0.32 + (writing ? 0.08 : 0);
      tyler.set({ x: TY[0], y: TY[1], z: TY[2], rotY: 0, legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 }, lean, beard: 0, t: tt,
        armL: leanBack ? { x: 0.2, z: 2.6, el: 2.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        armR: leanBack ? { x: 0.2, z: 2.6, el: 2.3 } : writing ? { x: -1.35 + 0.08 * Math.sin(tt * 14), z: 0.15, el: 0.5 } : tt > t.opens - 0.15 && tt < LID1 + 0.2 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: cooked ? 'spiral' : leanBack ? 'half' : worried ? 'wide' : tt > LID1 ? 'wide' : 'half', mouth: cooked ? 'wavy' : leanBack ? 'grin' : worried ? 'wavy' : tt > LID1 ? 'o' : 'flat',
        brows: worried ? 0.9 : leanBack ? -0.3 : 0.5, look: leanBack ? [0.3, 0.3] : tt > LID1 && tt < t.but ? [0.35, -0.35] : [-0.15, -0.6], head: { x: leanBack ? -0.15 : 0.15, z: cooked ? 0.1 * Math.sin(tt * 18) : 0 },
        faceTint: tt > LID0 && tt < t.but ? [0xffd0d0, 0.12] : [0, 0] });
      pencil.visible = tt < t.opens;
      // the photo insert: a hand holds the phone over the sheet, flash
      shotHand.visible = id === 'photo'; if (shotHand.visible) { const u = smooth(u01(tt, W('solve', 'one') - 0.1, t.photo - 0.05)); shotHand.position.set(LD.sheet[0] + 0.05, Y + lerp(0.55, 0.4, u), LD.sheet[1] + lerp(0.5, 0.2, u)); shotHand.rotation.set(0.1, 0, 0); flashSpr.material.opacity = tt > FLASH ? 1 - u01(tt, FLASH, FLASH + 0.25) : 0; }
      // the pen: out of the screen, onto the sheet, writing
      pen.g.visible = tt > PEN0 && tt < WRITE1 + 0.25;
      if (pen.g.visible) {
        const tip = tipWorld(writeP(tt)), loc = LIB.root.worldToLocal(V(...tip));
        const from = V(LD.laptop[0], Y + 0.25, LD.laptop[1]), u = smooth(u01(tt, PEN0, WRITE0));
        const scrib = tt > WRITE0 ? 0.004 * Math.sin(tt * 60) : 0;
        pen.g.position.set(lerp(from.x, loc.x, u) + scrib, lerp(from.y + 0.15, loc.y + 0.004, u) + (1 - u) * 0.2 * Math.sin(u * PI), lerp(from.z, loc.z, u));
        pen.g.rotation.set(-0.5, 0.4, -0.55 + scrib * 20); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tt * 20);
      }
      // the stack fills as pages finish
      const pages = tt < WRITE0 ? 0 : Math.min(6, Math.floor(1 + 6 * u01(tt, t.graphs, WRITE1)));
      stackPages.forEach((m, i) => { m.visible = i < pages || tt > t.oneShot - 0.1; m.position.y = 0.003 + i * 0.004; });
      LIB.stack.scale.setScalar(tt > t.done ? 1 + 0.08 * Math.exp(-(tt - t.done) * 9) * Math.sin((tt - t.done) * 30) : 1);
    }
    // ----- the professor
    if (sh.set === 'office') {
      prof.root.visible = true; old.draw(old.total, false); sheet.draw(N);
      const P0 = O(0, 0, 0.05), react = tt > t.perfect - 0.05, darts = Math.sign(Math.sin((tt - t.holds) * 7.5));
      prof.set({ x: P0[0], y: P0[1], z: P0[2], rotY: 0, armL: { x: -0.9, z: 1.0, el: 0.9 }, armR: { x: -0.9, z: 1.0, el: 0.9 }, eyes: react ? 'wide' : 'half', mouth: react ? 'o' : 'flat', brows: react ? 1 : -0.6,
        look: react ? [0, 0.2] : [darts * 0.7, -0.3], head: { x: react ? -0.1 : 0.1, y: react ? 0 : darts * 0.12 }, t: tt });
      const sep = 0.47 + 0.04 * Math.sin((tt - t.holds) * 2.2) * (react ? 0 : 1);
      profSheets.forEach((m, i) => { m.position.set((i ? 1 : -1) * sep, 0.98 + (react && i ? 0.05 * Math.exp(-(tt - t.perfect) * 6) : 0), 0.42); m.rotation.set(-0.08, (i ? -1 : 1) * 0.14, (i ? -1 : 1) * 0.05); });
      aPlus.visible = tt > t.match + 0.22; aPlus.scale.setScalar(aPlus.visible ? easeOutBack(u01(tt, t.match + 0.22, t.match + 0.45)) * 1.0 : 1);
    }
    crowd.commit(); chutes.commit(); beams.commit();

    // ----- camera
    let cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 8));
    if (sh.set === 'island') I.aimSun(cam.look[0], Math.max(0, cam.look[1] - 2), cam.look[2], clamp(d * 0.8, 10, 45));
    studio.fill.intensity = sh.set === 'island' && sh.mood === 'night' ? 1.4 : 0.55; studio.fill.distance = 9;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 049-scribe-promo --qc`): faces under the caption / callouts, shot lengths, counts
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0);
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of [['Chris', chris], ['Dev', dev], ['Trevor', trevor], ['Tyler', tyler], ['the professor', prof]]) {
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
    out.push(`counts: kicks ${KICKS.length} (${KICKS.filter((k) => k[1] >= 0.8).length} full-strength), fx bursts ${FXN.burst} + streams ${FXN.stream}, callouts ${story.callouts.length}, feed ${feed.length}`);
    out.push('events: ' + JSON.stringify({ fx: FXN.times.map((x) => +x.toFixed(2)), kicks: KICKS.map((k) => +k[0].toFixed(2)), frames: SHOTS.flatMap((s) => (s.frames || [{ t: s.t0 }]).map((f) => +f.t.toFixed(2))) }));
    update(0); return out;
  };
  update(0);
  return { update };
}
