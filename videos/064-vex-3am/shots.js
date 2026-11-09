// 064 — "POV: it's 3 AM and goth mommy catches you doing homework" (Scribe lane, anime/pixel look; user steer Nov 9: not informative,
// mommy comforts + teases you and Scribe slides in; flirty for an 18+ college audience, no kink commands, no sexual promises).
// Vex (VRoid, engine/vroid.js; thicker build + a cuter face in code: thigh 1.4, calf 1.15, head 1.07, flat iris scale 1.12) on the Ally
// voxel beach at NIGHT (voxbeach setNight: navy sky, stars, a pixel moon), the homework desk + a bed as stations with the sea behind her.
// Voice: Fish Audio "Mommy ASMR" (a generic library voice, not a clone). Scribe: the chemistry pack (engine/build/subjects.js) —
// the pen draws the Lewis structure ("even the little molecules"); claims per docs/lanes/scribe.md.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { makePen, makeLaptop, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeScreen } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4;
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
    mommy1: W('hook', 'mommy'), roast: B.roast.t0, chewed: W('roast', 'chewedup'), forty: W('roast', 'forty'), pity: B.pity.t0, baby1: W('pity', 'baby'),
    come: B.come.t0, down: W('come', 'down'), tease: B.tease.t0, mommy2: W('tease', 'mommy'), not: W('tease', 'not'),
    scribe: B.scribe.t0, scribeW: W('scribe', 'scribe'), and2: W('scribe', 'and'), even: W('scribe', 'even'),
    secret: B.secret.t0, mommy3: W('secret', 'mommy'), relax: B.relax.t0, bed: B.bed.t0, mommy4: W('bed', 'mommys'), end: B.end.t0, dreams: W('end', 'dreams'),
  };
  T.card = T.dreams + 0.55;

  // ---------------------------------------------------------------- the night beach + stations (turned 180°: the sea behind her)
  const BEACH = buildVoxBeach(studio);
  BEACH.setNight(1);
  const OFF = { beach: [0, 0, 0], desk: [6, 0, 8], bed: [0, 0, 10] };
  const station = (name) => { const g = new THREE.Group(); g.position.set(...OFF[name]); g.rotation.y = PI; BEACH.root.add(g); return g; };
  const ST = { desk: station('desk'), bed: station('bed') };
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const plank = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#b88a55', ['#a67a48', '#c99a62', '#9a6e40'], 40, 5); g.fillStyle = '#8a6238'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [2, 1] });
  const plankM = lam({ map: plank });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const lantern = (parent, x, y, z, k = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); bx(g, 0.16, 0.22, 0.16, toon(0x2a2030), 0, 0, 0); const glow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), new THREE.MeshBasicMaterial({ color: 0xffc070, toneMapped: false })); g.add(glow); const L = new THREE.PointLight(0xffb060, 1.6 * k, 4.5, 1.6); L.position.y = 0.05; g.add(L); return g; };

  // the homework desk: the chem worksheet, a 40-sheet stack, cold coffee, a chewed pencil, a lamp, the laptop
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'chemistry', { name: 'Alex' });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex', n: 40 });   // the pack labels it (a string subject printed the class line twice)
  const S = ST.desk;
  bx(S, 2.3, 0.06, 1.15, plankM, LD.desk[0], LD.deskY - 0.03, LD.desk[1]); for (const [x, z] of [[-1.08, -0.5], [1.08, -0.5], [-1.08, 0.5], [1.08, 0.5]]) bx(S, 0.08, LD.deskY - 0.06, 0.08, plankM, LD.desk[0] + x, (LD.deskY - 0.06) / 2, LD.desk[1] + z);
  const laptop = makeLaptop(screen.tex, icon); laptop.g.position.set(0.62, LD.deskY, -0.85); laptop.g.rotation.y = -0.35; S.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  const sheetM = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), lam({ map: sheet.tex })); sheetM.rotation.set(-PI / 2, 0, 0.08); sheetM.position.set(-0.05, LD.deskY + 0.012, -0.45); S.add(sheetM);
  const paperT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d3c4'; for (let y = 1; y < h; y += 2) g.fillRect(0, y, w, 1); }, { k: 1 });
  const stack = bx(S, 0.44, 0.24, 0.57, [lam({ map: paperT }), lam({ map: paperT }), lam({ map: sheet.tex }), lam({ map: paperT }), lam({ map: paperT }), lam({ map: paperT })], -0.45, LD.deskY + 0.12, -0.92); stack.rotation.y = 0.12;
  const mug = new THREE.Group(); mug.position.set(0.12, LD.deskY, -0.92); S.add(mug);
  { const mm = toon(0xefe6f2, 0x1a1420); mm.side = THREE.DoubleSide; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 18, 1, true), mm); m.position.y = 0.055; mug.add(m);   // open top: the cold coffee shows
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.045, 0.09, 18), new THREE.MeshBasicMaterial({ color: 0x2a160c })); c.position.y = 0.053; mug.add(c);   // a solid dark fill
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 6, 12), toon(0xefe6f2, 0x1a1420)); h.position.set(0.055, 0.06, 0); mug.add(h);
    const ice = new THREE.Mesh(new THREE.CircleGeometry(0.016, 6), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, toneMapped: false })); ice.rotation.x = -PI / 2; ice.position.set(-0.01, 0.099, 0.012); mug.add(ice); }
  const pencil = new THREE.Group(); pencil.position.set(0.28, LD.deskY + 0.012, -0.42); pencil.rotation.set(0, 0.5, PI / 2); S.add(pencil);
  { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), toon(0xffc93c)); pencil.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.025, 6), toon(0xe8c9a0)); tip.position.y = 0.097; pencil.add(tip); const er = new THREE.Mesh(new THREE.CylinderGeometry(0.0082, 0.0082, 0.02, 6), toon(0xf08aa0)); er.position.y = -0.093; pencil.add(er);
    for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.TorusGeometry(0.0086, 0.0024, 4, 8), toon(0x8a5a20)); n.rotation.x = PI / 2; n.position.y = -0.05 + i * 0.012; pencil.add(n); } }   // bite marks
  const lamp = new THREE.Group(); lamp.position.set(-0.95, LD.deskY, -0.2); S.add(lamp); bx(lamp, 0.14, 0.03, 0.14, toon(0x1a1420), 0, 0.015, 0); bx(lamp, 0.02, 0.42, 0.02, toon(0x1a1420), 0, 0.22, 0); bx(lamp, 0.16, 0.08, 0.12, toon(0x6a2a7a), 0.05, 0.44, 0);
  const lampL = new THREE.PointLight(0xffb070, 2.4, 4, 1.5); lampL.position.set(-0.9, LD.deskY + 0.45, -0.1); S.add(lampL);
  lantern(S, 1.4, LD.deskY + 0.11, -0.3, 0.8);
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
  // the bed under the moon
  { const Bd = ST.bed; bx(Bd, 1.7, 0.35, 2.3, plankM, 1.3, 0.18, -1.6); bx(Bd, 1.6, 0.22, 2.15, lam({ color: 0xf4f0ea }), 1.3, 0.46, -1.6); bx(Bd, 1.62, 0.1, 1.4, lam({ color: 0x5a2a6a }), 1.3, 0.6, -1.15);
    bx(Bd, 0.9, 0.18, 0.45, lam({ color: 0xffffff }), 1.3, 0.66, -2.45); bx(Bd, 1.7, 0.9, 0.12, plankM, 1.3, 0.62, -2.78); lantern(Bd, 2.4, 0.11, -2.2, 1.2); lantern(Bd, -0.7, 0.11, -2.5, 0.6); }

  // ---------------------------------------------------------------- Vex (thicker + a cuter face, in code)
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body2.png' }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.07, eyes: 1.12 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xc8b8ff, 1.0, 0, 1.6); scene.add(fill);   // a moon-coloured fill AT the lens, intensity ∝ d^1.6 = the same on her face at any distance
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // pure: the previous pose is re-evaluated from time, not remembered
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.14) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);

  // ---------------------------------------------------------------- FX: pixel hearts on every "mommy" + the kiss
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [T.mommy1, T.mommy2, T.mommy3, T.mommy4, T.dreams].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ["POV: IT'S 3 AM AND MOMMY", 'CAUGHT YOU DOING HOMEWORK'], t0: 0, t1: B.roast.t0 - 0.1, y: 0.135, plain: true, s: 7, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- shots (station-local: the camera at +z looks −z; her rotY 0 faces it)
  // the Lewis structure (problem 2, pi 1): where it sits on the page + where it falls in the writing order, so the macro shot sees it drawn
  const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, L0 = -1, L1 = 0; const mol = [];
  for (const it of sheet.items) { const x = it.kind === 'p' ? it.pts[0][0] : it.x; if (it.pi === 1 && x < 470) { if (L0 < 0) L0 = acc; L1 = acc + wt(it); if (it.kind === 'p') mol.push(it.pts[0]); } acc += wt(it); }
  if (L0 < 0) throw new Error('no Lewis structure on the chemistry sheet');
  const figC = [mol.reduce((s2, q) => s2 + q[0], 0) / mol.length, mol.reduce((s2, q) => s2 + q[1], 0) / mol.length];
  const VX = { x: 0.05, z: -1.3 };   // right behind the desk (far edge z −1.175): 'lean' plants her hands on it
  const SH = [
    { id: 'hook', t0: 0, set: 'desk', vex: (t) => ({ ...VX, pose: t < T.mommy1 - 0.25 ? 'cross' : 'lean', lean: 0.75 * bump(t, T.mommy1 - 0.25, 0.8), tilt: t < T.mommy1 ? 0.14 : -0.12, sway: 0.15, face: { relaxed: 0.25, blink: lids(t), blinkLeft: t > T.mommy1 + 0.35 && t < T.mommy1 + 0.9 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy1 - 0.1); return { pos: [0.05, 1.12 + 0.08 * k, 0.75 - 0.45 * k], look: [0.05, 1.12 + 0.1 * k, -1.3], fov: 46 }; } },
    { id: 'mug', t0: T.roast, set: 'desk', p: [[0.16, LD.deskY + 0.36, -0.7], [0.15, LD.deskY + 0.3, -0.74]], a: [[0.12, LD.deskY + 0.07, -0.92], [0.12, LD.deskY + 0.07, -0.92]], fov: 42 },
    { id: 'pencil', t0: T.chewed - 0.05, set: 'desk', p: [[0.33, LD.deskY + 0.24, -0.2], [0.31, LD.deskY + 0.2, -0.24]], a: [[0.28, LD.deskY, -0.42], [0.28, LD.deskY, -0.42]], fov: 42 },
    { id: 'stack', t0: T.forty - 0.05, set: 'desk', vex: (t) => ({ ...VX, pose: 'point', lean: 0.3, tilt: 0.1, face: { relaxed: 0.2, blink: lids(t) } }), p: [[-0.3, 1.28, 0.6], [-0.24, 1.28, 0.42]], a: [[-0.26, 1.02, -1.1], [-0.22, 1.05, -1.1]], fov: 52 },
    { id: 'pity', t0: T.pity, set: 'desk', vex: (t) => ({ ...VX, pose: 'lean', lean: 0.25, tilt: 0.16, look: [0, 0.15], face: { sad: 0.3, blink: lids(t, 0.08) } }), cam: (t) => ({ pos: [0.05, 1.5, -0.4 - 0.12 * u01(t, T.pity, T.come)], look: [0.05, 1.43, -1.3], fov: 40 }) },
    { id: 'come', t0: T.come, set: 'desk', vex: (t) => ({ ...VX, pose: t < T.down - 0.4 ? 'beckon' : 'shh', lean: 0.3, tilt: -0.1, face: { relaxed: 0.35, blink: lids(t) } }), p: [[0.1, 1.3, 0.5], [0.08, 1.3, 0.3]], a: [[0.05, 1.2, -1.3], [0.05, 1.22, -1.3]], fov: 44 },
    { id: 'tease', t0: T.tease, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: t > T.not - 0.1 ? 'peace' : 'hairflip', tilt: -0.15, sway: 0.2, face: { happy: t > T.not + 0.1 ? 0.5 : 0, relaxed: 0.35, blink: lids(t), blinkLeft: t > T.not ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.05, 1.42, 2.6 + 0.65 * k], look: [0, 1.32 + 0.08 * k, 4.5], fov: 42 }; } },
    { id: 's2', t0: T.scribe, set: 'desk', p: [[0.0, LD.deskY + 0.62, 0.15], [0.0, LD.deskY + 0.6, 0.1]], a: [[-0.05, LD.deskY + 0.12, -0.42], [-0.05, LD.deskY + 0.12, -0.42]], fov: 46, snap: 1 },
    { id: 's3', t0: T.scribeW - 0.05, set: 'desk', screen: 0.85, dx: 0.12 },
    { id: 's4', t0: T.and2 - 0.05, set: 'desk', p: [[-0.05, LD.deskY + 0.78, -0.25], [-0.05, LD.deskY + 0.66, -0.28]], a: [[-0.05, LD.deskY, -0.45], [-0.05, LD.deskY, -0.45]], fov: 44, write: 1 },
    { id: 's5', t0: T.even - 0.05, set: 'desk', macro: 1, write: 1 },
    { id: 'secret', t0: T.secret, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: t > T.mommy3 - 0.3 ? 'shh' : 'hip', lean: 0.25, tilt: -0.12, sway: 0.2, face: { relaxed: 0.35, blink: lids(t), blinkLeft: t > T.mommy3 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy3 - 0.1, 1.0); return { pos: [0.08, 1.4 + 0.05 * k, 2.4 + 0.75 * k], look: [0, 1.28 + 0.12 * k, 4.5], fov: 42 }; } },
    { id: 'relax', t0: T.relax, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: 'kiss', lean: 0.3, tilt: 0.14 * Math.sin(t * 0.8), sway: 0.25 * Math.sin(t * 0.7), face: { relaxed: 0.55, blink: lids(t, 0.3) } }), cam: (t) => ({ pos: [0.3 - 0.3 * u01(t, T.relax, T.bed), 1.45, 3.0 + 0.3 * u01(t, T.relax, T.bed)], look: [0, 1.36, 4.5], fov: 40 }) },
    { id: 'bed', t0: T.bed, set: 'bed', vex: (t) => ({ x: 0.25, z: -0.75, pose: t > T.mommy4 - 0.2 ? 'shh' : 'beckon', tilt: -0.12, sway: 0.22, face: { relaxed: 0.45, blink: lids(t), blinkLeft: t > T.mommy4 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy4 - 0.1, 1.0); return { pos: [0.6 - 0.3 * k, 1.38 + 0.08 * k, 1.35 - 0.95 * k], look: [0.55 - 0.27 * k, 1.12 + 0.28 * k, -1.4], fov: 46 }; } },
    { id: 'end', t0: T.end, set: 'bed', vex: (t) => ({ x: 0.25, z: -0.75, pose: t > T.dreams - 0.2 ? 'kissOut' : 'kiss', lean: 0.25, tilt: -0.12, sway: 0.2, face: { relaxed: 0.5, blink: lids(t), blinkLeft: t > T.dreams + 0.2 ? 1 : 0 } }), p: [[0.4, 1.42, 0.75], [0.36, 1.42, 0.95]], a: [[0.34, 1.32, -0.9], [0.36, 1.3, -1.0]], fov: 46 },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipLocal = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); sheetM.updateWorldMatrix(true, false); sheetM.localToWorld(v); return S.worldToLocal(v); };
  const total = sheet.total;
  const writeP = (t) => L0 * ease(u01(t, T.and2, T.even - 0.1)) + (L1 - L0) * ease(u01(t, T.even, T.even + 1.5)) + (total - L1) * 0.25 * u01(t, T.even + 1.5, T.secret);

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    for (const [n, r] of Object.entries(ST)) r.visible = n === sh.set;
    BEACH.setNight(1);   // never setMood here: setNight resets the mood cache and setMood(0) would repaint a day sky
    const St = ST[sh.set]; St?.updateMatrixWorld(true);
    const W3 = (q) => (St ? St.localToWorld(V(...q)).toArray() : q);
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { sheet.draw(writeP(t)); const c = tipLocal(figC); cam = { pos: W3([c.x + 0.02, c.y + 0.36 - 0.06 * k, c.z + 0.1]), look: W3([c.x, c.y, c.z]), fov: 40 }; }
    else if (sh.cam) { const c = sh.cam(t); cam = { pos: W3(c.pos), look: W3(c.look), fov: c.fov }; }
    else cam = { pos: W3(lerp3(sh.p[0], sh.p[1], ease(k))), look: W3(lerp3(sh.a[0], sh.a[1], ease(k))), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    // the moon in view + moonlight from behind the lens; a soft violet fill rides by the camera
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look).setY(0);
      BEACH.setSun(studio.camera.position, f.clone().addScaledVector(side, sh.moon?.[0] ?? 0.19).add(V(0, sh.moon?.[1] ?? 0.2, 0)));
      BEACH.sun.target.position.copy(tg); BEACH.sun.position.copy(tg).addScaledVector(f, -9).addScaledVector(side, -5).add(V(0, 10, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(2.2, 0.32 * Math.pow(d, 1.6)) : 0; }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)), wp = W3([v.x, 0, v.z]); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: wp[0], z: wp[2], y: 0, rotY: (v.rotY ?? 0) + (St ? PI : 0) }); }
    fx(t, !!sh.vex);
    laptop.scr.material.map = screen.tex;
    screen.draw(t < T.scribeW + 0.25 ? { mode: 'scan', k: u01(t, T.scribeW - 0.05, T.scribeW + 0.25) } : t < T.and2 ? { mode: 'solve', k: u01(t, T.scribeW + 0.25, T.and2 - 0.1) } : { mode: 'write', k: 0 });
    const tip = sheet.draw(writeP(t));
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(sh.macro ? 0.022 : 0.07); pen.glow.material.opacity = sh.macro ? 0.55 : 1;   // the magic-pen glow hid the H in the macro
    if (sh.write) { const p = tipLocal(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    snap.visible = sh.snap === 1;
    if (sh.snap) { const sw = [-0.05, LD.deskY, -0.45], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = sh.t0 + 0.45; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    pencil.visible = true; pencil.position.y = LD.deskY + 0.012 + (sh.id === 'come' && t > T.down - 0.3 && t < T.down ? 0.06 * Math.sin((t - T.down + 0.3) / 0.3 * PI) : 0);
    pixel.set(Math.max(sh.screen ? 1 : sh.write ? 2 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
