// 066 — "POV: it's finals week and goth mommy finds you crying over econ at the beach bar" (Scribe lane, anime/pixel look; the 064
// recipe: comfort/tease "mommy", Vex's thick/cute look, her Fish voice, Scribe at ~53 % with a crisp screen, end card ≥ 3.5 s).
// New situation + light (manager, Nov 9): bright MIDDAY on the voxel beach (the original Ally look), at a tiki smoothie bar — she
// leans over the bar at you; the menu board says ORANGE ~~$6~~ $12; a crate of frosted oranges; the shoreline for the tease.
// Scribe: the economics pack — the pen draws the market for oranges: a frost shifts supply left (S → S′), the new P* up, Q* down,
// which is the punchline ("a frost hit the oranges, that's why your smoothie costs twelve").
// Flirty for an 18+ college audience, swimwear only, no kink lines, no promises. Claims per docs/lanes/scribe.md.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { makePen, makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, makeScreen } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, TOP = 0.98;   // TOP = the bar counter's top
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    mommy1: W('hook', 'mommy'), roast: B.roast.t0, twelve1: W('roast', 'twelvedollar'), econ: W('roast', 'econ'), andR: W('roast', 'and'), twelve2: W('roast', 'twelve'),
    pity: B.pity.t0, graph: W('pity', 'graph'), come: B.come.t0, give: W('come', 'give'), pencilW: W('come', 'pencil'),
    tease: B.tease.t0, mommy2: W('tease', 'mommy'), limited: W('tease', 'limited'), very: W('tease', 'very'),
    scribe: B.scribe.t0, scribeW: W('scribe', 'scribe'), and2: W('scribe', 'and'), shifts: W('scribe', 'shifts'),
    secret: B.secret.t0, frost: W('secret', 'frost'), thats: W('secret', 'thats'), relax: B.relax.t0, class: W('relax', 'class'),
    pay: B.pay.t0, drink: W('pay', 'drink'), mommy3: W('pay', 'mommys'), end: B.end.t0, baby: W('end', 'baby'),
  };
  T.card = T.baby + 0.55;

  // ---------------------------------------------------------------- midday beach + two stations (turned 180°: the sea behind her)
  const BEACH = buildVoxBeach(studio);
  BEACH.setMood(0);
  const OFF = { bar: [-6, 0, 8], shore: [8, 0, 16.3] };   // shore: between the huts at x 4 and 12; the foam line = local z −1.9
  const station = (name) => { const g = new THREE.Group(); g.position.set(...OFF[name]); g.rotation.y = PI; BEACH.root.add(g); return g; };
  const ST = { bar: station('bar'), shore: station('shore') };
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  // the tiki bar: a bamboo front, a plank counter, a deck behind it for her, a low back counter (bottles, blender), a straw roof
  const S = ST.bar;
  const bambooT = pixelTex(16, 16, (g, w, h) => { for (let x = 0; x < w; x++) { g.fillStyle = ['#d8b65a', '#c9a24a', '#e6c873', '#b8913e'][x % 4]; g.fillRect(x, 0, 1, h); } g.fillStyle = '#8a6a2a'; for (let x = 0; x < w; x += 4) { g.fillRect(x, 5, 3, 1); g.fillRect(x + 1, 12, 3, 1); } }, { k: 1, repeat: [4, 2] });
  const plankT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#a8784a', ['#966a40', '#b98a58', '#8a5e36'], 40, 5); g.fillStyle = '#7a5230'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [3, 1] });
  const strawT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#d9b45e', ['#c49a44', '#e8c878', '#b88a3a'], 90, 11); g.fillStyle = '#a8803a'; for (let y = 2; y < h; y += 5) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [3, 2] });
  const plankM = lam({ map: plankT }), bambooM = lam({ map: bambooT });
  bx(S, 2.6, 0.12, 1.3, plankM, 0, 0.06, -1.55);                       // the deck she stands on (top 0.12)
  bx(S, 2.5, 0.07, 0.62, plankM, 0, TOP - 0.035, -0.78);               // counter top
  bx(S, 2.4, TOP - 0.07, 0.08, bambooM, 0, (TOP - 0.07) / 2, -0.5);    // bamboo front
  for (const x of [-1.2, 1.2]) bx(S, 0.08, TOP - 0.07, 0.56, bambooM, x, (TOP - 0.07) / 2, -0.78);
  bx(S, 2.4, 0.8, 0.4, plankM, 0, 0.12 + 0.4, -2.05);                  // back counter
  for (const x of [-1.3, 1.3]) for (const z of [-0.5, -2.15]) bx(S, 0.1, 2.5, 0.1, bambooM, x, 1.25, z);
  { const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 0.75, 4), lam({ map: strawT })); roof.rotation.y = PI / 4; roof.scale.z = 0.75; roof.position.set(0, 2.85, -1.3); roof.receiveShadow = true; S.add(roof);   // no castShadow: it would shade her face
    for (let i = 0; i < 18; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.02), lam({ map: strawT })); const a = (i / 18) * 2 * PI; f.position.set(Math.cos(a) * 1.55, 2.42, -1.3 + Math.sin(a) * 1.15); f.rotation.y = -a; S.add(f); } }
  const bottleCols = [0x3fa86a, 0xc8402a, 0x3b6fd0, 0xf0b030, 0x8a3ac8, 0x2a8a9a];
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.24, 8), toon(bottleCols[i % 6])); m.position.set(-1.0 + i * 0.25, 0.92 + 0.12, -2.05); S.add(m); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.07, 6), toon(bottleCols[i % 6])); n.position.set(m.position.x, 1.2, -2.05); S.add(n); }
  { const bl = new THREE.Group(); bl.position.set(0.85, 0.92, -2.0); S.add(bl); bx(bl, 0.14, 0.1, 0.14, toon(0x2a2430), 0, 0.05, 0); const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.22, 10), toon(0xff9a3a)); jar.position.y = 0.21; bl.add(jar); }
  // the menu board on the counter's right end: ORANGE $6 crossed out → $12
  const menuT = crisp(256, 340, (g, w, h) => { g.fillStyle = '#1e2a24'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8913e'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.textAlign = 'center'; g.fillStyle = '#ffd43b'; g.font = '700 40px Inter, Arial'; g.fillText('SMOOTHIES', w / 2, 62);
    g.fillStyle = '#ff9a3a'; g.font = '800 46px Inter, Arial'; g.fillText('ORANGE', w / 2, 140);
    g.fillStyle = '#f4f0ea'; g.font = '700 40px Inter, Arial'; g.fillText('$6', w / 2 - 60, 206); g.strokeStyle = '#ff4f6a'; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2 - 98, 210); g.lineTo(w / 2 - 22, 180); g.stroke();
    g.fillStyle = '#ff4f6a'; g.font = '900 64px Inter, Arial'; g.fillText('$12', w / 2 + 52, 214);
    g.fillStyle = '#9fd0b4'; g.font = '600 26px Inter, Arial'; g.fillText('mango  $9', w / 2, 272); g.fillText('berry  $9', w / 2, 310); });
  const menu = new THREE.Group(); menu.position.set(1.02, TOP, -0.86); menu.rotation.y = -0.35; S.add(menu);
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshBasicMaterial({ map: menuT, toneMapped: false })); bd.position.y = 0.3; menu.add(bd); bx(menu, 0.44, 0.58, 0.02, toon(0x8a6a2a), 0, 0.3, -0.012); }
  // your stuff on the counter: the econ sheet, the laptop, the $12 orange smoothie, crumpled tissues, a crate of frosted oranges
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'economics', { name: 'Alex', note: 'FINAL tomorrow 9:00 AM  ·  HANDWRITTEN WORK ONLY' });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex', n: 25 });
  const sheetM = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.427), lam({ map: sheet.tex })); sheetM.rotation.set(-PI / 2, 0, 0.08); sheetM.position.set(-0.18, TOP + 0.003, -0.74); S.add(sheetM);
  const laptop = makeLaptop(screen.tex, icon); laptop.g.position.set(0.42, TOP, -0.86); laptop.g.rotation.y = -0.3; laptop.g.scale.setScalar(0.85); S.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  const glass = new THREE.Group(); glass.position.set(0.72, TOP, -0.6); S.add(glass);
  { const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.036, 0.19, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); shell.position.y = 0.095; glass.add(shell);
    const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.033, 0.16, 14), toon(0xff8a2a, 0x3a1a00)); juice.position.y = 0.082; glass.add(juice);
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 6), toon(0xff5a9a)); straw.position.set(0.015, 0.2, 0); straw.rotation.z = -0.25; glass.add(straw);
    const um = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.03, 8), toon(0x3aa0e8)); um.position.set(-0.03, 0.24, 0.01); um.rotation.z = 0.4; glass.add(um);
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12, 1, false, 0, PI), toon(0xffa030)); sl.rotation.set(PI / 2, 0, 0); sl.position.set(0.045, 0.19, 0); glass.add(sl); }
  for (const [x, z, s2] of [[-0.62, -0.58, 1], [-0.55, -0.66, 0.8], [-0.7, -0.68, 0.7]]) { const tissue = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 * s2, 0), lam({ color: 0xf6f4f0 })); tissue.position.set(x, TOP + 0.035 * s2, z); tissue.rotation.set(x * 7, z * 5, 0.3); S.add(tissue); }
  const crate = new THREE.Group(); crate.position.set(-0.98, TOP, -0.85); crate.rotation.y = 0.25; S.add(crate);
  { bx(crate, 0.34, 0.1, 0.26, plankM, 0, 0.05, 0); const org = toon(0xff8a1a, 0x2a1000), frost = lam({ color: 0xf4fbff, emissive: 0x6a7a8a });
    for (let i = 0; i < 6; i++) { const x = -0.11 + (i % 3) * 0.11, z = i < 3 ? -0.055 : 0.055; const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), org); o.position.set(x, 0.12, z); crate.add(o);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 6, 0, 2 * PI, 0, 0.9), frost); cap.position.set(x, 0.124, z); cap.scale.set(1.04, 1.0, 1.04); crate.add(cap); }
    const sign = crisp(128, 48, (g, w, h) => { g.fillStyle = '#f4f0ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#3b6fd0'; g.font = '800 28px Inter, Arial'; g.textAlign = 'center'; g.fillText('FROST!', w / 2, 34); });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: sign, toneMapped: false })); tag.position.set(0, 0.07, 0.132); crate.add(tag); }
  const pen = makePen(); S.add(pen.g);
  // her hand + phone snapping the sheet (black nails, a spiked cuff)
  const snap = new THREE.Group(); S.add(snap);
  { const skin = toon(0xffe6da, 0x5a4640), black = toon(0x141218), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 18), black); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), silver); s.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.012, 0.07); snap.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.045, 3, 8), skin); f.rotation.z = PI / 2; f.position.set(-0.06, -0.004, 0.035 + i * 0.02); snap.add(f); const n = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), black); n.position.set(-0.09, -0.002, 0.035 + i * 0.02); snap.add(n); }
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), toon(0xb48ad8)); phone.position.set(0, 0.006, 0); snap.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }

  // ---------------------------------------------------------------- Vex (064's thicker, cuter build)
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body2.png' }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.07, eyes: 1.12 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0e0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064): the straw roof shades her
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064: the previous pose is re-evaluated from time, then the arms blend over 0.28 s
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.14) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);

  // ---------------------------------------------------------------- FX: pixel hearts on every "mommy" + the kiss
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [T.mommy1, T.mommy2, T.very, T.mommy3, T.baby].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ["POV: IT'S FINALS WEEK AND MOMMY", 'FOUND YOU CRYING OVER ECON'], t0: 0, t1: B.roast.t0 - 0.1, y: 0.135, plain: true, s: 7, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- the market graph (problem 1, pi 0): where it sits + its writing range
  const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, P0 = -1, P1 = 0; const graph = [];
  for (const it of sheet.items) { if (it.pi === 0) { const q = it.kind === 'p' ? it.pts[0] : [it.x, it.y]; if (q[0] < 580) { if (P0 < 0) P0 = acc; P1 = acc + wt(it); graph.push(q); } } acc += wt(it); }
  if (P0 < 0) throw new Error('no market graph on the economics sheet');
  const gx = graph.map((q) => q[0]), gy = graph.map((q) => q[1]), graphC = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];
  const total = sheet.total;
  const writeP = (t) => P0 + (P1 - P0) * (0.5 * ease(u01(t, T.and2, T.shifts - 0.1)) + 0.5 * ease(u01(t, T.shifts, T.secret - 0.3))) + (total - P1) * 0.2 * u01(t, T.secret - 0.3, T.relax);

  // ---------------------------------------------------------------- shots (station-local: the camera at +z looks −z; her rotY 0 faces it)
  const VB = { x: 0.0, z: -1.32, y: 0.12 };   // behind the bar on the deck; 'lean' plants her hands on the counter
  const VS = { x: 0, z: -1.7, y: 0 };
  const SH = [
    { id: 'hook', t0: 0, set: 'bar', vex: (t) => ({ ...VB, pose: t < T.mommy1 - 0.25 ? 'cross' : 'lean', lean: 0.6 * bump(t, T.mommy1 - 0.25, 0.8), tilt: t < T.mommy1 ? 0.14 : -0.12, sway: 0.15, face: { relaxed: 0.25, blink: lids(t), blinkLeft: t > T.mommy1 + 0.35 && t < T.mommy1 + 0.9 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy1 - 0.1); return { pos: [0.0, 1.22 + 0.06 * k, 0.75 - 0.5 * k], look: [0.0, 1.3 + 0.1 * k, -1.32], fov: 48 }; } },
    { id: 'bar', t0: T.roast, set: 'bar', vex: (t) => ({ ...VB, pose: 'hip', tilt: 0.12, sway: 0.2, face: { relaxed: 0.2, blink: lids(t) } }), p: [[-0.9, 1.5, 1.6], [-0.7, 1.45, 1.4]], a: [[0.0, 1.2, -1.2], [0.0, 1.2, -1.2]], fov: 50 },
    { id: 'smoothie', t0: T.twelve1 - 0.05, set: 'bar', p: [[0.5, TOP + 0.24, -0.12], [0.55, TOP + 0.22, -0.2]], a: [[0.85, TOP + 0.22, -0.78], [0.85, TOP + 0.22, -0.8]], fov: 44 },
    { id: 'econ', t0: T.econ - 0.05, set: 'bar', p: [[-0.16, TOP + 0.5, -0.4], [-0.16, TOP + 0.42, -0.45]], a: [[-0.18, TOP, -0.76], [-0.18, TOP, -0.78]], fov: 44 },
    { id: 'explain', t0: T.andR - 0.05, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.twelve2 - 0.3 ? 'point' : 'shrug', lean: t > T.twelve2 - 0.3 ? 0.3 : 0, tilt: 0.12, sway: 0.2, face: { relaxed: 0.2, happy: t < T.twelve2 - 0.3 ? 0.25 : 0, blink: lids(t) } }), p: [[0.25, 1.28, 0.55], [0.18, 1.3, 0.4]], a: [[0.05, 1.28, -1.3], [0.05, 1.3, -1.3]], fov: 48 },
    { id: 'pity', t0: T.pity, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.graph - 0.3 ? 'point' : 'lean', lean: t > T.graph - 0.3 ? 0.35 : 0.3, tilt: 0.16, look: t > T.graph - 0.3 ? [0, -0.3] : [0, 0.15], nod: t > T.graph - 0.3 ? 0.15 : 0, face: { sad: 0.3, blink: lids(t, 0.08) } }), cam: (t) => ({ pos: [0.0, 1.62, -0.42 - 0.12 * u01(t, T.pity, T.come)], look: [0.0, 1.52, -1.32], fov: 40 }) },
    { id: 'come', t0: T.come, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.give - 0.3 ? 'beckon' : 'shrug', lean: 0.3, tilt: -0.1, face: { relaxed: 0.35, blink: lids(t), blinkLeft: t > T.pencilW + 0.2 ? 1 : 0 } }), p: [[0.15, 1.3, 0.45], [0.1, 1.32, 0.25]], a: [[0.0, 1.32, -1.32], [0.0, 1.35, -1.32]], fov: 44 },
    { id: 'tease', t0: T.tease, set: 'shore', vex: (t) => ({ ...VS, pose: t > T.limited - 0.3 ? 'peace' : 'hairflip', tilt: -0.15, sway: 0.2, face: { happy: t > T.limited ? 0.3 : 0, relaxed: 0.35, blink: lids(t), blinkLeft: t > T.mommy2 + 0.3 && t < T.mommy2 + 0.9 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.08, 1.4, 0.6 - 0.65 * k], look: [0, 1.3 + 0.08 * k, -1.7], fov: 42 }; } },
    { id: 'demand', t0: T.very - 0.05, set: 'shore', vex: (t) => ({ ...VS, pose: 'kiss', lean: 0.25, tilt: -0.14, sway: 0.25, face: { happy: 0.35, relaxed: 0.3, blink: lids(t), blinkLeft: t > T.very + 0.5 ? 1 : 0 } }), p: [[-0.35, 1.45, -0.4], [-0.25, 1.45, -0.6]], a: [[0.0, 1.38, -1.7], [0.0, 1.4, -1.7]], fov: 42 },
    { id: 's2', t0: T.scribe, set: 'bar', p: [[-0.16, TOP + 0.62, -0.3], [-0.16, TOP + 0.6, -0.34]], a: [[-0.18, TOP + 0.12, -0.74], [-0.18, TOP + 0.12, -0.74]], fov: 46, snap: 1 },
    { id: 's3', t0: T.scribeW - 0.05, set: 'bar', screen: 0.75, dx: 0.1 },
    { id: 's4', t0: T.and2 - 0.05, set: 'bar', p: [[-0.18, TOP + 0.6, -0.48], [-0.18, TOP + 0.5, -0.52]], a: [[-0.18, TOP, -0.74], [-0.18, TOP, -0.74]], fov: 44, write: 1 },
    { id: 's5', t0: T.shifts - 0.05, set: 'bar', macro: 1, write: 1 },
    { id: 'frost', t0: T.secret, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.frost - 0.3 ? 'point' : 'peace', lean: 0.3, tilt: 0.1, face: { happy: 0.35, relaxed: 0.2, blink: lids(t) } }), p: [[-0.65, 1.3, 0.45], [-0.6, 1.28, 0.3]], a: [[-0.55, 1.15, -1.1], [-0.55, 1.12, -1.1]], fov: 50 },
    { id: 'price', t0: T.thats - 0.05, set: 'bar', p: [[0.55, TOP + 0.3, -0.08], [0.62, TOP + 0.28, -0.22]], a: [[0.92, TOP + 0.24, -0.8], [0.95, TOP + 0.26, -0.84]], fov: 44 },
    { id: 'relax', t0: T.relax, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.class - 0.6 ? 'shh' : 'hip', lean: 0.35, tilt: -0.12, sway: 0.2, face: { relaxed: 0.35, blink: lids(t), blinkLeft: t > T.class ? 1 : 0 } }), cam: (t) => ({ pos: [0.12, 1.42, 0.1 - 0.35 * u01(t, T.relax, T.pay)], look: [0.0, 1.45, -1.32], fov: 44 }) },
    { id: 'pay', t0: T.pay, set: 'bar', vex: (t) => ({ ...VB, pose: t < T.mommy3 - 0.25 ? 'lean' : 'kiss', lean: 0.45, tilt: -0.1, sway: 0.18, face: { relaxed: 0.4, happy: 0.2, blink: lids(t), blinkLeft: t > T.mommy3 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy3 - 0.1, 1.0); return { pos: [0.3 - 0.2 * k, 1.25 + 0.08 * k, 0.4 - 0.55 * k], look: [0.2 - 0.15 * k, 1.18 + 0.2 * k, -1.1], fov: 48 }; }, slide: 1 },
    { id: 'end', t0: T.end, set: 'bar', vex: (t) => ({ ...VB, pose: t > T.baby - 0.2 ? 'kissOut' : 'kiss', lean: 0.3, tilt: -0.12, sway: 0.2, face: { relaxed: 0.45, blink: lids(t), blinkLeft: t > T.baby + 0.2 ? 1 : 0 } }), p: [[0.1, 1.45, 0.0], [0.08, 1.45, 0.2]], a: [[0.0, 1.42, -1.32], [0.0, 1.4, -1.32]], fov: 46, slide: 1 },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipLocal = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.33, (0.5 - tip[1] / sheet.h) * 0.427, 0); sheetM.updateWorldMatrix(true, false); sheetM.localToWorld(v); return S.worldToLocal(v); };
  const GLASS0 = glass.position.clone();

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    for (const [n, r] of Object.entries(ST)) r.visible = n === sh.set;
    BEACH.setMood(0);
    const St = ST[sh.set]; St.updateMatrixWorld(true);
    const W3 = (q) => St.localToWorld(V(...q)).toArray();
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { sheet.draw(writeP(t)); const c = tipLocal(graphC); cam = { pos: W3([c.x + 0.02, c.y + 0.3 - 0.04 * k, c.z + 0.09]), look: W3([c.x, c.y, c.z]), fov: 40 }; }
    else if (sh.cam) { const c = sh.cam(t); cam = { pos: W3(c.pos), look: W3(c.look), fov: c.fov }; }
    else cam = { pos: W3(lerp3(sh.p[0], sh.p[1], ease(k))), look: W3(lerp3(sh.a[0], sh.a[1], ease(k))), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    // the midday sun high in the sky (out of frame), key from behind the lens; a fill at the lens for the shade under the roof
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look).setY(0);
      BEACH.setSun(studio.camera.position, f.clone().addScaledVector(side, 0.3).add(V(0, 0.9, 0)));
      BEACH.sun.target.position.copy(tg); BEACH.sun.position.copy(tg).addScaledVector(f, -8).addScaledVector(side, -5).add(V(0, 11, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.2 * Math.pow(d, 1.6)) : 0; }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)), wp = W3([v.x, 0, v.z]); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: wp[0], z: wp[2], y: v.y ?? 0, rotY: (v.rotY ?? 0) + PI }); }
    fx(t, !!sh.vex);
    laptop.scr.material.map = screen.tex;
    screen.draw(t < T.scribeW + 0.25 ? { mode: 'scan', k: u01(t, T.scribeW - 0.05, T.scribeW + 0.25) } : t < T.and2 ? { mode: 'solve', k: u01(t, T.scribeW + 0.25, T.and2 - 0.1) } : { mode: 'write', k: 0 });
    const tip = sheet.draw(writeP(t));
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(sh.macro ? 0.02 : 0.06); pen.glow.material.opacity = sh.macro ? 0.5 : 1;
    if (sh.write) { const p = tipLocal(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    snap.visible = sh.snap === 1;
    if (sh.snap) { const sw = [-0.18, TOP, -0.74], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = sh.t0 + 0.45; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    // "now drink up": she slides the smoothie across the bar to you
    const ks = ease(u01(t, T.drink - 0.1, T.drink + 0.45)); glass.position.set(GLASS0.x - 0.55 * ks, GLASS0.y, GLASS0.z + 0.18 * ks);
    pixel.set(Math.max(sh.screen ? 1 : sh.write ? 2 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
