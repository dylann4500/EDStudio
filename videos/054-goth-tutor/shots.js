// 054 v2 — "What happens to your body if you don't sleep for 24 hours?" (Scribe lane, anime/pixel look; manager pick A, Nov 9).
// The @allythetutor format, made indirect: Vex (a VRoid Studio model, engine/vroid.js) explains a viral question hour by hour on one
// sunny voxel beach, every fact a prop on the sand beside her; at ~66 % the all-nighter is for BIO homework and Scribe takes it
// (snap → solve → written in your handwriting, the alertness graph drawn by the pen). Seductive "mommy" delivery: bedroom eyes,
// a slow push-in + pixel hearts on every "mommy", a blown kiss, finger to the lips. Platform-safe: adult character, swimwear only.
// Facts (caption.md comment has the links): ~17 h awake ≈ 0.05 % BAC and ~24 h ≈ 0.10 % (Dawson & Reid 1997, Nature 388:235;
// Williamson & Feyer 2000); one night without sleep → ~40 % worse at forming new memories (Yoo, Walker et al. 2007, Nat Neurosci);
// sleep loss raises the hunger hormone ghrelin (Spiegel et al. 2004, Ann Intern Med); microsleeps = involuntary lapses of seconds.
// Product claims (docs/lanes/scribe.md): a photo of the sheet → every question answered → written in your handwriting, graphs too.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { makePen, makeLaptop, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.4) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));   // a push-in that stays in

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    come: W('hook', 'come'), mommy1: W('hook', 'mommy'), h17: B.h17.t0, drinks: W('h17', 'drinks'), h20: B.h20.t0, chips: W('h20', 'chips'), thats: W('h20', 'thats'),
    h22: B.h22.t0, naps: W('h22', 'naps'), withW: W('h22', 'with'), open: W('h22', 'open'), h24: B.h24.t0, forty: W('h24', 'forty'), so: W('h24', 'so'), gone: W('h24', 'gone'),
    turn: B.turn.t0, mommy2: W('turn', 'mommy'), you: W('turn', 'you'), scribe: B.scribe.t0, scribeW: W('scribe', 'scribe'), and2: W('scribe', 'and'), even: W('scribe', 'even'),
    payoff: B.payoff.t0, mommy3: W('payoff', 'mommys'), end: B.end.t0, dreams: W('end', 'dreams'),
  };
  T.card = T.dreams + 0.55;
  const MOMMY = [T.mommy1, T.mommy2, T.mommy3];

  // ---------------------------------------------------------------- the beach + stations (each turned 180°: the sea is behind her)
  const BEACH = buildVoxBeach(studio);
  const OFF = { beach: [0, 0, 0], clock: [-12, 0, 6], snack: [12, 0, 6], brain: [-6, 0, 8], desk: [6, 0, 8], bed: [0, 0, 10] };   // off the dunes (a dune swallowed the desk)
  const station = (name) => { const g = new THREE.Group(); g.position.set(...OFF[name]); g.rotation.y = PI; BEACH.root.add(g); return g; };
  const ST = { clock: station('clock'), snack: station('snack'), brain: station('brain'), desk: station('desk'), bed: station('bed') };
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const plank = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#b88a55', ['#a67a48', '#c99a62', '#9a6e40'], 40, 5); g.fillStyle = '#8a6238'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [2, 1] });
  const plankM = lam({ map: plank });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.draw = (...a) => { draw(c.getContext('2d'), w, h, ...a); t.needsUpdate = true; }; t.draw(); return t; };
  const pxText = (lines, o) => { const cv = pixelText(lines, o), t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; };

  // hour 17: a giant digital clock sign (HOURS AWAKE) + a giant cocktail glass
  const clockT = canvasTex(512, 256, (g, w, h, hrs = 17) => { g.fillStyle = '#120c16'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff3b4e'; g.font = '700 150px "Courier New", monospace'; g.textAlign = 'center'; g.fillText(`${hrs}:00`, w / 2, 160); g.font = '700 34px Inter, Arial'; g.fillStyle = '#ffb0b8'; g.fillText('HOURS AWAKE', w / 2, 226); });
  { const C = ST.clock; bx(C, 1.3, 0.68, 0.2, lam({ color: 0x2a2030 }), 0.85, 2.0, -1.7); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: clockT, toneMapped: false })); f.position.set(0.85, 2.0, -1.59); C.add(f); bx(C, 0.12, 1.7, 0.12, plankM, 0.85, 0.85, -1.75);
    const glass = new THREE.Group(); glass.position.set(-0.95, 0, -1.5); glass.scale.setScalar(0.85); C.add(glass); const gm = lam({ color: 0xdff4ff, transparent: true, opacity: 0.55 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.6, 24, 1, true), gm); cone.rotation.x = PI; cone.position.y = 1.5; glass.add(cone);
    const drink = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.48, 24), lam({ color: 0xff6aa8, transparent: true, opacity: 0.85 })); drink.rotation.x = PI; drink.position.y = 1.46; glass.add(drink);
    bx(glass, 0.06, 1.2, 0.06, gm, 0, 0.6, 0); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 20), gm); base.position.y = 0.02; glass.add(base);
    const olive = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), toon(0x6a9a3a)); olive.position.set(0.15, 1.72, 0); glass.add(olive); bx(glass, 0.02, 0.5, 0.02, toon(0xd02a3a), 0.12, 1.75, 0).rotation.z = 0.5; }
  // hour 20: a giant bag of chips + chips on the sand
  const bagT = canvasTex(256, 384, (g, w, h) => { g.fillStyle = '#e8322a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(w / 2, h * 0.48, 100, 70, 0, 0, 7); g.fill(); g.fillStyle = '#7a1a10'; g.font = '700 56px "Luckiest Guy", Arial'; g.textAlign = 'center'; g.fillText('CHIPS', w / 2, h * 0.53); g.fillStyle = '#fff'; g.font = '700 26px Inter, Arial'; g.fillText('PARTY SIZE', w / 2, h * 0.82); });
  { const S = ST.snack; const bag = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.5, 0.45), [lam({ color: 0xc8281f }), lam({ color: 0xc8281f }), lam({ color: 0xb02018 }), lam({ color: 0xb02018 }), lam({ map: bagT }), lam({ color: 0xc8281f })]); bag.position.set(0.85, 0.6, -1.5); bag.rotation.y = -0.25; bag.scale.setScalar(0.8); bag.castShadow = true; S.add(bag);
    const chipM = toon(0xf2c14e, 0x2a1a00); for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(0.06, 7), chipM); c.rotation.set(-PI / 2 + (i % 3) * 0.2, 0, i); c.position.set(0.3 + ((i * 37) % 100) / 100 * 1.6 - 0.4, 0.012, -1.2 + ((i * 53) % 100) / 100 * 1.1); S.add(c); } }
  // hour 24: a big pink brain on a pedestal + a SAVE FAILED sign
  const signT = canvasTex(512, 200, (g, w, h, glitch = 0) => { g.fillStyle = '#16101a'; g.fillRect(0, 0, w, h); g.fillStyle = glitch > 0.5 ? '#ff3b4e' : '#ffd43b'; g.font = '700 74px "Luckiest Guy", Arial'; g.textAlign = 'center'; g.fillText('SAVE FAILED', w / 2 + (glitch > 0.5 ? 6 : 0), 92); g.font = '700 34px Inter, Arial'; g.fillStyle = '#fff'; g.fillText('NEW MEMORIES  -40%', w / 2, 160); });
  const brain = new THREE.Group();
  { const S = ST.brain; bx(S, 0.8, 0.85, 0.8, plankM, 0.85, 0.425, -1.7); brain.position.set(0.85, 1.35, -1.7); S.add(brain); brain.scale.setScalar(0.8);
    const geo = new THREE.SphereGeometry(0.55, 40, 28), P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), n = 1 + 0.06 * Math.sin(x * 22 + y * 9) * Math.sin(z * 18 - y * 7) - (Math.abs(x) < 0.05 ? 0.08 : 0); P.setXYZ(i, x * n * 1.15, y * n * 0.85, z * n); }
    geo.computeVertexNormals(); const bm = new THREE.Mesh(geo, toon(0xf29ab8, 0x3a1020)); bm.castShadow = true; brain.add(bm);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.59), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); sg.position.set(0.85, 2.3, -1.85); sg.scale.setScalar(0.85); S.add(sg); bx(S, 0.08, 0.7, 0.08, plankM, 0.85, 1.95, -1.9); }
  // the bed (payoff + end, at sunset)
  { const S = ST.bed; bx(S, 1.7, 0.35, 2.3, plankM, 1.3, 0.18, -1.6); bx(S, 1.6, 0.22, 2.15, lam({ color: 0xf4f0ea }), 1.3, 0.46, -1.6); bx(S, 1.62, 0.1, 1.4, lam({ color: 0x5a2a6a }), 1.3, 0.6, -1.15);
    bx(S, 0.9, 0.18, 0.45, lam({ color: 0xffffff }), 1.3, 0.66, -2.45); bx(S, 1.7, 0.9, 0.12, plankM, 1.3, 0.62, -2.78); }

  // ---------------------------------------------------------------- Scribe: the bio worksheet (alertness graph), the screen, the desk
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = makeSheet(G, { seed: 12, name: 'Alex', title: 'BIO 101 · SLEEP & THE BRAIN · SET 4', page: 'p. 1 of 3', note: 'Due 8:00 AM  ·  HANDWRITTEN WORK ONLY', problems: [
    { q: '1.  Which hormone rises after sleep loss?', a: 'ghrelin (hunger) + cortisol' },
    { q: '2.  Which brain region encodes new memories?', a: 'the hippocampus' },
    { q: '3.  At 24 h awake, impairment is like a BAC of?', a: '~0.10%' },
    { q: '4.  Sketch alertness vs. hours awake.', a: 'drops after ~16 h', graph: { fn: (X) => 4.3 - 0.06 * X * X * X + 0.3 * Math.sin(X * 1.6), x0: 0, x1: 4.2, yl: 'alertness', xl: 'hours awake' } },
    { q: '5.  Why do microsleeps happen?', a: 'sleep pressure (adenosine)' },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex' });
  const DESK = { root: ST.desk };
  { const S = ST.desk; bx(S, 2.3, 0.06, 1.15, plankM, LD.desk[0], LD.deskY - 0.03, LD.desk[1]); for (const [x, z] of [[-1.08, -0.5], [1.08, -0.5], [-1.08, 0.5], [1.08, 0.5]]) bx(S, 0.08, LD.deskY - 0.06, 0.08, plankM, LD.desk[0] + x, (LD.deskY - 0.06) / 2, LD.desk[1] + z); }
  DESK.laptop = makeLaptop(screen.tex, icon); DESK.laptop.g.position.set(LD.laptop[0], LD.deskY, LD.laptop[1]); DESK.laptop.g.rotation.y = 0.25; ST.desk.add(DESK.laptop.g); DESK.laptop.hinge.rotation.x = -0.22;
  DESK.sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), lam({ map: sheet.tex })); DESK.sheet.rotation.set(-PI / 2, 0, 0.12); DESK.sheet.position.set(LD.sheet[0], LD.deskY + 0.002, LD.sheet[1]); ST.desk.add(DESK.sheet);
  const pen = makePen(); ST.desk.add(pen.g);
  // her hand + phone snapping the sheet (black nails, a spiked cuff)
  const snap = new THREE.Group(); ST.desk.add(snap);
  { const skin = toon(0xffe6da, 0x5a4640), black = toon(0x141218), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 18), black); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), silver); s.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.012, 0.07); snap.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.045, 3, 8), skin); f.rotation.z = PI / 2; f.position.set(-0.06, -0.004, 0.035 + i * 0.02); snap.add(f); const n = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), black); n.position.set(-0.09, -0.002, 0.035 + i * 0.02); snap.add(n); }
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), toon(0xb48ad8)); phone.position.set(0, 0.006, 0); snap.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }

  // ---------------------------------------------------------------- Vex
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' }, bust: 1.2, thigh: 1.18 });
  dressGoth(VEX); scene.add(VEX.root);
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const lids = (t, base = 0.28) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);   // bedroom eyes + a real blink now and then

  // ---------------------------------------------------------------- FX: pixel hearts on every "mommy" (+ the kiss), floating z's
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [...MOMMY.map((m) => m + 0.05), T.you + 0.1, T.dreams + 0.05];
  const zT = pxText('Z', { color: '#ffffff' }); const zz = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const headW = V();
  function fx(t) {
    VEX.H.head.getWorldPosition(headW);
    hearts.forEach((h) => (h.visible = false));
    let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5 + 0.12); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
    const R = V(1, 0, 0).applyQuaternion(studio.camera.quaternion); zz.forEach((z, i) => { const a = t - (T.naps + i * 0.32); z.visible = a > 0 && t < T.withW; if (z.visible) { z.position.copy(headW).addScaledVector(R, 0.13 + i * 0.06 + a * 0.04).add(V(0, 0.1 + i * 0.07 + a * 0.08, 0)); z.scale.setScalar(0.045 + i * 0.012); } });
  }

  // ---------------------------------------------------------------- overlay (yellow pixel title + fact cards, lowercase captions, end card)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ["WHAT HAPPENS IF YOU DON'T", 'SLEEP FOR 24 HOURS?'], t0: 0, t1: T.come - 0.05, y: 0.135, plain: true, s: 7, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- shots (station-local coords: the camera at +z looks −z; her rotY 0 faces the camera)
  const gItems = sheet.items.filter((it) => it.pi === 3 && it.kind === 'p');
  const graphC = gItems.length ? [gItems.reduce((s, it) => s + it.pts[Math.floor(it.pts.length / 2)][0], 0) / gItems.length, gItems.reduce((s, it) => s + it.pts[Math.floor(it.pts.length / 2)][1], 0) / gItems.length] : [700, 900];
  const SH = [
    { id: 'hook', t0: 0, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: t < T.come - 0.1 ? 'hairflip' : t < T.mommy1 ? 'beckon' : 'shh', tilt: t < T.come ? 0.12 : -0.14, sway: 0.18 + 0.05 * Math.sin(t * 1.3), face: { relaxed: 0.45, blink: lids(t), blinkLeft: t > T.mommy1 + 0.35 && t < T.mommy1 + 0.9 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy1 - 0.1); return { pos: [0.08, 1.4 + 0.06 * k, 2.15 + 0.15 * ease(u01(t, 0, T.mommy1)) + 1.0 * k], look: [0, 1.28 + 0.12 * k, 4.5], fov: 42 }; } },
    { id: 'h17', t0: T.h17, set: 'clock', vex: (t) => ({ x: -0.1, z: -0.9, pose: 'hip', tilt: 0.16 * Math.sin(t * 2.2), turn: 0.08 * Math.sin(t * 1.7), sway: 0.25 * Math.sin(t * 1.1), face: { relaxed: 0.3, blink: lids(t, 0.4) } }), p: [[0.22, 1.45, 2.8], [0.18, 1.42, 2.5]], a: [[0.22, 1.32, -1.0], [0.18, 1.32, -1.0]], fov: 50, clock: 17 },
    { id: 'h20', t0: T.h20, set: 'snack', vex: (t) => ({ x: -0.2, z: -0.9, pose: t > T.thats - 0.1 ? 'lean' : 'hip', lean: t > T.thats - 0.1 ? 0.55 : 0, sway: 0.2, face: { happy: t > T.thats ? 0.5 : 0, relaxed: 0.3, blink: lids(t) } }), p: [[0.25, 1.4, 2.6], [0.2, 1.38, 2.35]], a: [[0.25, 1.15, -1.0], [0.2, 1.15, -1.0]], fov: 50 },
    { id: 'h22', t0: T.h22, set: 'snack', vex: (t) => { const nod = t > T.naps && t < T.withW ? 0.45 * ease(u01(t, T.naps, T.naps + 0.5)) : 0; return { x: -0.2, z: -0.9, pose: 'cross', nod, tilt: 0.1, face: { surprised: t > T.withW + 0.05 ? 0.7 : 0, blink: t > T.naps && t < T.withW ? 0.95 : lids(t, 0.45) } }; }, p: [[-0.15, 1.52, 0.05], [-0.18, 1.5, -0.05]], a: [[-0.2, 1.45, -0.9], [-0.2, 1.45, -0.9]], fov: 42 },
    { id: 'h24a', t0: T.h24, set: 'brain', vex: (t) => ({ x: -0.3, z: -0.9, pose: 'cross', tilt: -0.1, sway: 0.15, face: { relaxed: 0.2, blink: lids(t) } }), p: [[0.2, 1.5, 2.7], [0.15, 1.48, 2.45]], a: [[0.2, 1.4, -1.2], [0.15, 1.4, -1.2]], fov: 50 },
    { id: 'h24b', t0: T.forty - 0.05, set: 'brain', p: [[0.9, 1.85, 0.4], [0.88, 1.85, 0.2]], a: [[0.85, 1.85, -1.75], [0.85, 1.85, -1.75]], fov: 48, brainShot: 1 },
    { id: 'h24c', t0: T.so - 0.05, set: 'brain', vex: (t) => ({ x: -0.3, z: -0.9, pose: t > T.gone - 0.15 ? 'shrug' : 'hip', tilt: 0.12, face: { relaxed: 0.4, blink: lids(t, 0.35) } }), p: [[-0.25, 1.48, 0.45], [-0.28, 1.46, 0.3]], a: [[-0.3, 1.38, -0.9], [-0.3, 1.38, -0.9]], fov: 42 },
    { id: 'turn', t0: T.turn, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: t < T.you ? 'kiss' : 'kissOut', lean: 0.35, tilt: -0.15, face: { relaxed: 0.55, blink: t > T.mommy2 && t < T.you ? 0.75 : lids(t) } }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.04, 1.46, 3.3 + 0.35 * k], look: [0, 1.42, 4.5], fov: 40 }; } },
    { id: 's2', t0: T.scribe, set: 'desk', p: [[LD.sheet[0] + 0.02, LD.deskY + 0.62, LD.sheet[1] + 0.6], [LD.sheet[0] + 0.02, LD.deskY + 0.6, LD.sheet[1] + 0.55]], a: [[LD.sheet[0], LD.deskY + 0.12, LD.sheet[1] + 0.05], [LD.sheet[0], LD.deskY + 0.12, LD.sheet[1] + 0.05]], fov: 46, snap: 1 },
    { id: 's3', t0: T.scribeW - 0.05, set: 'desk', screen: 0.85, dx: 0.12 },
    { id: 's4', t0: T.and2 - 0.05, set: 'desk', p: [[LD.sheet[0], LD.deskY + 0.78, LD.sheet[1] + 0.2], [LD.sheet[0], LD.deskY + 0.66, LD.sheet[1] + 0.17]], a: [[LD.sheet[0], LD.deskY, LD.sheet[1]], [LD.sheet[0], LD.deskY, LD.sheet[1]]], fov: 44, write: 1 },
    { id: 's5', t0: T.even - 0.05, set: 'desk', macro: 1, write: 1 },
    { id: 'payoff', t0: T.payoff, set: 'bed', mood: 1, vex: (t) => ({ x: -0.15, z: -0.8, pose: t > T.mommy3 - 0.1 ? 'shh' : 'hip', tilt: -0.12, sway: 0.22, face: { relaxed: 0.5, blink: lids(t), blinkLeft: t > T.mommy3 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy3 - 0.1, 1.1); return { pos: [0.3 - 0.42 * k, 1.42 + 0.06 * k, 1.9 - 1.15 * k], look: [0.3 - 0.45 * k, 1.28 + 0.12 * k, -1.0], fov: 46 }; } },
    { id: 'end', t0: T.end, set: 'bed', mood: 1, vex: (t) => ({ x: -0.15, z: -0.8, pose: t > T.dreams - 0.2 ? 'kissOut' : 'kiss', lean: 0.25, tilt: -0.12, sway: 0.2, face: { relaxed: 0.55, blink: lids(t), blinkLeft: t > T.dreams + 0.2 ? 1 : 0 } }), p: [[0.3, 1.42, 2.0], [0.25, 1.4, 1.8]], a: [[0.3, 1.28, -1.0], [0.25, 1.28, -1.0]], fov: 46 },
  ];
  SH.forEach((s, i) => (s.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s) => s.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = DESK.laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipLocal = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); DESK.sheet.updateWorldMatrix(true, false); DESK.sheet.localToWorld(v); return ST.desk.worldToLocal(v); };
  const total = sheet.total;
  const writeP = (t) => total * (0.05 * u01(t, T.scribe, T.scribeW) + 0.55 * ease(u01(t, T.and2, T.even)) + 0.4 * u01(t, T.even, T.payoff - 0.3));

  function update(t) {
    const sh = SH.find((s) => t >= s.t0 && t < s.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    for (const [n, r] of Object.entries(ST)) r.visible = n === sh.set;
    scene.background = new THREE.Color(sh.mood ? 0xe0708a : 0x86c2f2);
    BEACH.setMood(sh.mood || 0);
    const S = ST[sh.set]; S?.updateMatrixWorld(true);
    const W3 = (q) => (S ? S.localToWorld(V(...q)).toArray() : q);
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { sheet.draw(writeP(t)); const c = tipLocal(graphC); cam = { pos: W3([c.x + 0.02, c.y + 0.26 - 0.05 * k, c.z + 0.07]), look: W3([c.x, c.y, c.z]), fov: 40 }; }
    else if (sh.cam) { const c = sh.cam(t); cam = { pos: W3(c.pos), look: W3(c.look), fov: c.fov }; }
    else cam = { pos: W3(lerp3(sh.p[0], sh.p[1], ease(k))), look: W3(lerp3(sh.a[0], sh.a[1], ease(k))), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    // pixel sun in view + the key light from behind the lens
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look).setY(0);
      BEACH.setSun(studio.camera.position, f.clone().addScaledVector(side, 0.32).add(V(0, sh.mood ? 0.09 : 0.42, 0)));
      BEACH.sun.target.position.copy(tg); BEACH.sun.position.copy(tg).addScaledVector(f, -9).addScaledVector(side, -5).add(V(0, sh.mood ? 6 : 12, 0)); }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = sh.vex(t), wp = W3([v.x, 0, v.z]); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: wp[0], z: wp[2], y: 0, rotY: (v.rotY ?? 0) + (S ? PI : 0) }); }
    fx(t); hearts.forEach((h) => (h.visible = h.visible && !!sh.vex)); zz.forEach((z) => (z.visible = z.visible && sh.id === 'h22'));
    // props
    if (sh.clock) clockT.draw(17);
    brain.rotation.y = t * 0.6; brain.position.y = 1.35 + 0.04 * Math.sin(t * 2);
    if (sh.set === 'brain') signT.draw(sh.brainShot && Math.sin(t * 23) > 0.6 ? 1 : 0);
    DESK.laptop.scr.material.map = screen.tex;
    screen.draw(t < T.scribeW + 0.25 ? { mode: 'scan', k: u01(t, T.scribeW - 0.05, T.scribeW + 0.25) } : t < T.and2 ? { mode: 'solve', k: u01(t, T.scribeW + 0.25, T.and2 - 0.1) } : { mode: 'write', k: 0 });
    const tip = sheet.draw(writeP(t));
    pen.g.visible = !!sh.write;
    if (sh.write) { const p = tipLocal(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    snap.visible = sh.snap === 1;
    if (sh.snap) { const sw = [LD.sheet[0], LD.deskY, LD.sheet[1]], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = sh.t0 + 0.4; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    pixel.set(Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
