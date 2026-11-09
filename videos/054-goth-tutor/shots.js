// 054 — "Can your professor tell you used AI?" (Scribe promo, anime/pixel look; docs/lanes/scribe.md, docs/STYLES.md → anime).
// Vex, a goth "mommy" cheat-tutor (a VRoid Studio model, vex.vrm, animated by engine/vroid.js + dressGoth), walks through three tells
// (typed work / chatbot words / an overnight grade jump), then shows the trick: Scribe solves the worksheet and writes it out in
// YOUR handwriting (Scribe's real glyphs, engine/build/scribe.js). Four places under the pixel pass with mosaic cuts: a voxel
// beach (engine/sets/voxbeach.js), the professor's office + a night library desk (engine/build/library.js), a classroom
// (engine/sets/classroom.js). Pixel-font captions/title/end card: engine/pixelcaps.js. Voice: ElevenLabs Lily (eleven_v3).
// Product claims (docs/lanes/scribe.md): one practice page → it learns your hand; photo of the sheet → every problem solved with
// the work → written out in your handwriting, stroke by stroke → print the PDF. Detector/teacher/app names on screen are fictional.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { makePen, makeLaptop, D as LD } from '@engine/build/library.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';
import { loadHand, loadImg, makeSheet, makeScreen, layoutHand } from '@engine/build/scribe.js';

const PI = Math.PI, PIXEL = 4;   // the reference's light, even blocks (the PR template default is 5)
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const ART = '/videos/054-goth-tutor/art/';

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    hook: 0, tell1: B.tell1.t0, typed: W('tell1', 'typed'), more: W('tell1', 'more'), handwritten: W('tell1', 'handwritten'), and1: W('tell1', 'and'), crime: W('tell1', 'crime'),
    tell2: B.tell2.t0, em: W('tell2', 'em'), dashes: W('tell2', 'dashes'), delve: W('tell2', 'delve'), nobody: W('tell2', 'nobody'),
    tell3: B.tell3.t0, d1: W('tell3', 'd'), d2: W('tell3', 'd', 2), hundred: W('tell3', 'hundred'), overnight: W('tell3', 'overnight'),
    turn: B.turn.t0, scribe: B.scribe.t0, then: W('scribe', 'then'), snap: W('scribe', 'snap'), it: W('scribe', 'it'), solves: W('scribe', 'solves'), and2: W('scribe', 'and'),
    messy: W('scribe', 'your', 3), payoff: B.payoff.t0, your: W('payoff', 'your'), perfect: W('payoff', 'perfect'), end: B.end.t0, me: W('end', 'me'),
  };
  T.card = T.me + 0.35; Object.assign(T, { let: W('hook', 'let'), babe: W('hook', 'babe'), one: W('tell1', 'one'), pasted: W('tell2', 'pasted'), totally: W('tell3', 'totally'), mommy: W('turn', 'mommy'), couldnt: W('end', 'couldnt') });

  // ---------------------------------------------------------------- one sunny voxel beach (like the reference: every fact is a prop/diorama on the sand)
  // stations: the professor's chalkboard + desk (office), a study desk with the laptop (lib), the gradebook board (cls)
  const OFF = { beach: [0, 0, 0], office: [-12, 0, 6], lib: [12, 0, 6], cls: [0, 0, 9] };
  const at = (set, x, y, z) => [OFF[set][0] + x, OFF[set][1] + y, OFF[set][2] + z];
  const BEACH = buildVoxBeach(studio);
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = makeSheet(G, { seed: 9, name: 'Alex', page: 'p. 1 of 7', note: 'Due Friday, 11:59 PM  ·  HANDWRITTEN WORK ONLY', problems: [
    { q: '1.  ∫ x sin x dx', a: '= -x cos x + sin x + C' },
    { q: '2.  d/dx [ ln(x² + 1) ]', a: '= 2x / (x^2 + 1)' },
    { q: '3.  lim (x→0)  sin(3x) / x', a: '= 3' },
    { q: '4.  ∫ (7x⁶ + 77) dx', a: '= x^7 + 77x + C' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  Σ 1/n²  (n = 1 → ∞)', a: '= π^2/6' },
  ] });
  const old = makeSheet(G, { seed: 4, name: 'Alex', title: 'MATH 1B · PROBLEM SET 8', page: 'p. 1 of 6', note: 'Due last Friday  ·  HANDWRITTEN WORK ONLY', problems: [
    { q: '1.  ∫ 2x eˣ dx', a: '= 2x e^x - 2e^x + C', pre: true }, { q: '2.  d/dx [ x³ sin x ]', a: '= 3x^2 sin x + x^3 cos x', pre: true },
    { q: '3.  lim (x→∞)  (2x + 1) / x', a: '= 2', pre: true }, { q: '4.  ∫ 7 dx', a: '= 7x + C', pre: true },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true, pre: true }, { q: '6.  Σ (1/2)ⁿ  (n = 0 → ∞)', a: '= 2', pre: true },
  ] });
  const practice = makeSheet(G, { seed: 31, name: 'Alex', title: 'HANDWRITING SAMPLE', note: 'Write each line once. Scribe learns your hand.', problems: [
    { q: '1.  Copy:', a: 'the quick brown fox jumps' }, { q: '2.  Copy:', a: 'over the lazy dog.' }, { q: '3.  Copy:', a: '0 1 2 3 4 5 6 7 8 9' },
    { q: '4.  Copy:', a: 'x y z = + - ( ) / ^2' }, { q: '5.  Sign:', a: 'Alex' },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex' });
  const plank = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#b88a55', ['#a67a48', '#c99a62', '#9a6e40'], 40, 5); g.fillStyle = '#8a6238'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [2, 1] });
  const plankM = new THREE.MeshLambertMaterial({ map: plank }), darkM = new THREE.MeshLambertMaterial({ color: 0x5a3a22 });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const station = (name) => { const g = new THREE.Group(); g.position.set(...OFF[name]); g.rotation.y = PI; BEACH.root.add(g); return g; };   // turned: the sea is behind her
  // office station: a chalkboard on posts (3.4 × 1.7 at y 2.25, z −2.43) + the professor's desk (top 0.82)
  const OFC = { root: station('office') };
  bx(OFC.root, 3.6, 1.9, 0.12, darkM, -0.6, 2.25, -2.5); for (const x of [-2.3, 1.1]) bx(OFC.root, 0.14, 3.2, 0.14, plankM, x, 1.6, -2.5);
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.7), new THREE.MeshLambertMaterial({ color: 0xffffff })); boardMesh.position.set(-0.6, 2.25, -2.43); OFC.root.add(boardMesh);
  const DX = 3; bx(OFC.root, 2.2, 0.08, 0.9, plankM, DX, 0.78, 0.6); for (const [x, z] of [[-1.0, 0.2], [1.0, 0.2], [-1.0, 1.0], [1.0, 1.0]]) bx(OFC.root, 0.08, 0.74, 0.08, plankM, DX + x, 0.37, z);
  // study station: desk + laptop (the Scribe screen / the detector), the worksheet, a lamp block
  const LIB = { root: station('lib'), setClock: () => {}, jack: { visible: false } };
  bx(LIB.root, 2.3, 0.06, 1.15, plankM, LD.desk[0], LD.deskY - 0.03, LD.desk[1]); for (const [x, z] of [[-1.08, -0.5], [1.08, -0.5], [-1.08, 0.5], [1.08, 0.5]]) bx(LIB.root, 0.08, LD.deskY - 0.06, 0.08, plankM, LD.desk[0] + x, (LD.deskY - 0.06) / 2, LD.desk[1] + z);
  LIB.laptop = makeLaptop(screen.tex, icon); LIB.laptop.g.position.set(LD.laptop[0], LD.deskY, LD.laptop[1]); LIB.laptop.g.rotation.y = PI + 0.25; LIB.laptop.g.scale.setScalar(1); LIB.root.add(LIB.laptop.g);
  LIB.laptop.hinge = LIB.laptop.hinge; LIB.scrL = new THREE.PointLight(0xdfe8ff, 0, 2); LIB.root.add(LIB.scrL);
  LIB.laptop.g.rotation.y = 0.25;   // screen faces +z (the camera side) on the beach
  LIB.sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshLambertMaterial({ map: sheet.tex })); LIB.sheet.rotation.set(-PI / 2, 0, 0.12); LIB.sheet.position.set(LD.sheet[0], LD.deskY + 0.002, LD.sheet[1]); LIB.root.add(LIB.sheet);
  // gradebook station: a chalkboard on posts (the grades plane sits on it)
  const CLS = { root: station('cls'), D: { board: { x: 0.3, y: 1.55, w: 3.6, h: 1.2 } }, setBoard: () => {} };
  bx(CLS.root, 3.8, 1.4, 0.12, darkM, 0.3, 1.55, -3.03); const gb = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.2), new THREE.MeshLambertMaterial({ color: 0x2f4a3a })); gb.position.set(0.3, 1.55, -2.96); CLS.root.add(gb);
  for (const x of [-1.5, 2.1]) bx(CLS.root, 0.14, 2.4, 0.14, plankM, x, 1.2, -3.03);
  const ROOTS = { office: OFC.root, lib: LIB.root, cls: CLS.root };

  // ---------------------------------------------------------------- canvases: chalk boards, the AI-check screen, the crime-scene page
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.draw = (...a) => { draw(c.getContext('2d'), w, h, ...a); t.needsUpdate = true; }; t.draw(); return t; };
  const chalkBg = (g, w, h) => { g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 3; for (let i = 0; i < 46; i++) { g.beginPath(); g.arc((i * 211) % w, (i * 97) % h, 50 + (i % 4) * 20, 0, 1.2); g.stroke(); } };
  const chalk = (g, text, x, y, px, color = 'rgba(248,246,236,.94)') => { g.fillStyle = color; g.font = `${px}px "Luckiest Guy", "Arial Black"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y); };
  // office board for tell 1 (HANDWRITTEN WORK ONLY + a typed essay with a red X) and for the payoff (LAST WEEK | THIS WEEK)
  // the vertical frame sees ~1.2 m of a 3.4 m board: the chalk is one centred column (HANDWRITTEN / WORK / ONLY), underlined on the word
  const board1 = canvasTex(1024, 512, (g, w, h, x = 0) => { chalkBg(g, w, h); chalk(g, 'HANDWRITTEN', 512, 120, 76); chalk(g, 'WORK', 512, 225, 96); chalk(g, 'ONLY!', 512, 335, 96); chalk(g, '— Prof. Hale', 512, 430, 38, 'rgba(248,246,236,.7)');
    if (x > 0) { g.strokeStyle = '#ff5b5b'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(330, 170); g.lineTo(330 + 364 * Math.min(1, x), 166); g.stroke(); } });
  const board2 = canvasTex(1024, 512, (g, w, h) => { chalkBg(g, w, h); chalk(g, 'LAST WEEK', 427, 52, 40); chalk(g, 'THIS WEEK', 597, 52, 40); });
  // classroom gradebook board (tell 3): D−, D−, then 100?!
  const gradeT = canvasTex(1200, 400, (g, w, h, k = 0) => { g.clearRect(0, 0, w, h); chalk(g, 'MIDTERM GRADES', w / 2, 52, 52, 'rgba(248,246,236,.8)');
    if (k >= 1) chalk(g, 'D-', 470, 235, 150); if (k >= 2) chalk(g, 'D-', 640, 235, 150); if (k >= 3) { chalk(g, '100', 830, 235, 170, '#ffdf5d'); chalk(g, '?!', 990, 205, 110, '#ff5b5b'); } });
  const gradePlane = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.13), new THREE.MeshBasicMaterial({ map: gradeT, transparent: true, toneMapped: false }));
  gradePlane.position.set(CLS.D?.board?.x ?? 0.3, (CLS.D?.board?.y ?? 1.55), -2.94); CLS.root.add(gradePlane);
  // the AI-check screen (a fictional detector) for tell 2
  const aiT = canvasTex(1280, 800, (g, w, h, em = 0, delve = 0, meter = 0) => {   // the screen POV sees x ≈ 300–980 of it
    g.fillStyle = '#f4f5f8'; g.fillRect(0, 0, w, h); g.fillStyle = '#20232b'; g.fillRect(0, 0, w, 96); g.fillStyle = '#ff4d5e'; g.font = '700 46px Inter, Arial'; g.textAlign = 'center'; g.fillText('DETECTR  ·  AI check', w / 2, 64); g.textAlign = 'left';
    const lines = ['In today’s world —', 'it is vital to delve', 'into the rich tapestry', 'of history — truly —', 'a nuanced journey.'];
    g.font = '46px Georgia, serif';
    lines.forEach((L, i) => { const y = 190 + i * 78; let x = 350; for (const part of L.split(/(—|delve)/)) { const wpx = g.measureText(part).width;
      if (part === '—' && em > 0) { g.fillStyle = `rgba(255,214,0,${Math.min(1, em)})`; g.fillRect(x - 4, y - 42, wpx + 8, 58); }
      if (part === 'delve' && delve > 0) { g.strokeStyle = '#e8283a'; g.lineWidth = 8; g.beginPath(); g.ellipse(x + wpx / 2, y - 15, wpx / 2 + 20, 40, -0.05, 0, 2 * PI * Math.min(1, delve)); g.stroke(); }
      g.fillStyle = '#1d1f24'; g.fillText(part, x, y); x += wpx; } });
    g.fillStyle = '#e3e6ec'; g.beginPath(); g.roundRect(350, 600, 580, 60, 30); g.fill();
    g.fillStyle = meter > 0.7 ? '#e8283a' : '#ff9f1c'; g.beginPath(); g.roundRect(350, 600, Math.max(60, 580 * meter), 60, 30); g.fill();
    g.fillStyle = '#1d1f24'; g.font = '700 48px Inter, Arial'; g.textAlign = 'center'; g.fillText(`AI: ${Math.round(98 * meter)}%`, 640, 728); g.textAlign = 'left'; });
  // her own handwriting = a crime scene (scribbles) + police tape
  const crimeT = canvasTex(1024, 1325, (g, w, h) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,150,200,.3)'; g.lineWidth = 1.5; for (let y = 200; y < h; y += 44) { g.beginPath(); g.moveTo(60, y); g.lineTo(w - 60, y); g.stroke(); }
    let R = 7; const r = () => (R = (R * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = '#3a3a48'; g.lineWidth = 5; g.lineCap = 'round';
    for (let row = 0; row < 18; row++) { const y0 = 230 + row * 58; let x = 90 + r() * 40; g.beginPath(); g.moveTo(x, y0); while (x < 900 - r() * 200) { x += 8 + r() * 14; g.lineTo(x, y0 + (r() - 0.5) * 40 - (r() < 0.2 ? 30 : 0)); } g.stroke(); if (r() < 0.3) { g.beginPath(); g.moveTo(100, y0 - 10); g.lineTo(700, y0 + 6); g.stroke(); } } });
  const tapeT = canvasTex(1024, 96, (g, w, h) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = '700 50px Inter, Arial'; for (let x = 10; x < w; x += 760) g.fillText('CRIME SCENE · DO NOT CROSS ·', x, 66); });

  // ---------------------------------------------------------------- props on the desks
  const paperM = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.DoubleSide });
  const deskY = 0.82;   // office desk top
  const crime = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), paperM(crimeT)); crime.rotation.set(-PI / 2, 0, 0.06); crime.position.set(DX - 0.2, deskY + 0.002, 0.55); OFC.root.add(crime);
  const tapes = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.07), new THREE.MeshBasicMaterial({ map: tapeT, toneMapped: false })); m.rotation.set(-PI / 2, 0, i ? -0.55 : 0.5); m.position.set(DX - 0.2, deskY + 0.006 + i * 0.002, 0.55); OFC.root.add(m); return m; });
  const markers = [1, 2].map((n, i) => { const g = new THREE.Group(); const t = canvasTex(128, 96, (c) => { c.fillStyle = '#ffd400'; c.fillRect(0, 0, 128, 96); c.fillStyle = '#111'; c.font = '700 70px Inter, Arial'; c.textAlign = 'center'; c.fillText(String(n), 64, 76); }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.055), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, toneMapped: false })); p.rotation.x = s * 0.5; p.position.set(0, 0.024, s * 0.012); g.add(p); } g.position.set(DX + (i ? 0.08 : -0.42), deskY, i ? 0.36 : 0.74); OFC.root.add(g); return g; });
  const turnedIn = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), paperM(sheet.tex)); turnedIn.rotation.set(-PI / 2, 0, -0.04); OFC.root.add(turnedIn);
  const pile = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), paperM(old.tex)); m.rotation.set(-PI / 2, 0, 0.08 - i * 0.07); m.position.set(DX + 0.35 + i * 0.01, deskY + 0.001 + i * 0.0015, 0.5); OFC.root.add(m); return m; });
  const pinned = [old, sheet].map((s, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.647), paperM(s.tex)); m.position.set(-0.6 + (i ? 0.28 : -0.28), 2.1, -2.39); m.rotation.z = i ? 0.02 : -0.03; OFC.root.add(m); return m; });
  const lens = new THREE.Group(); { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.016, 10, 40), new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.3, metalness: 0.4 })); lens.add(ring); const glass = new THREE.Mesh(new THREE.CircleGeometry(0.12, 40), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.18 })); lens.add(glass); const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x5a2a1a, roughness: 0.5 })); handle.position.set(0.1, -0.17, 0); handle.rotation.z = 0.55; lens.add(handle); } OFC.root.add(lens);
  const matchT = canvasTex(512, 256, (g) => { g.clearRect(0, 0, 512, 256); g.strokeStyle = '#2fd16b'; g.lineWidth = 34; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(150, 130); g.lineTo(230, 205); g.lineTo(380, 50); g.stroke(); });
  const check = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: matchT, transparent: true, depthWrite: false, toneMapped: false })); check.position.set(-0.6, 1.62, -2.36); OFC.root.add(check);
  // library desk: the practice page beside the worksheet, the floating pen, her hand snapping the sheet with a phone
  const practiceM = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), paperM(practice.tex)); practiceM.rotation.set(-PI / 2, 0, 0.1); practiceM.position.set(LD.sheet[0], LD.deskY + 0.004, LD.sheet[1]); LIB.root.add(practiceM); LIB.jack.visible = false;
  const pen = makePen(); LIB.root.add(pen.g);
  const snap = new THREE.Group(); LIB.root.add(snap);
  { const skin = new THREE.MeshToonMaterial({ color: 0xffe6da, emissive: 0x5a4640 }), black = new THREE.MeshStandardMaterial({ color: 0x141218, roughness: 0.35 }), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 18), black); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 5), silver); s.position.set(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.012, 0.07); snap.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.05, 3, 8), skin); f.rotation.z = PI / 2; f.position.set(-0.065, -0.004, 0.035 + i * 0.022); snap.add(f); const n = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 6), black); n.position.set(-0.098, -0.002, 0.035 + i * 0.022); snap.add(n); }
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), black); phone.position.set(0, 0.006, 0); snap.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }

  // ---------------------------------------------------------------- Vex: the VRoid model (engine/vroid.js), goth accessories, lip-sync from the word times
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body.png' }, bust: 1.08, thigh: 1.1 });
  dressGoth(VEX); scene.add(VEX.root);
  const hb = VEX.bpos('rightHand'), phoneG = VEX.attach('rightHand', [hb.x - 0.075, hb.y - 0.012, hb.z + 0.01]);
  { const caseM = new THREE.MeshToonMaterial({ color: 0xb48ad8 }), scrM = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, toneMapped: false });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.009, 0.074), caseM); phoneG.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.066), scrM); scr.rotation.x = Math.PI / 2; scr.position.y = -0.005; phoneG.add(scr);
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.012, 5), new THREE.MeshBasicMaterial({ color: 0x1a1020 })); star.rotation.x = -Math.PI / 2; star.position.y = 0.0048; phoneG.add(star); }
  // lip-sync: the active word's vowels, one per slice of the word, open-close inside each slice
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.25 + 0.6 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const walkTo = (t, t0, t1, from, to) => { const u = u01(t, t0, t1), e = u, x = from[0] + (to[0] - from[0]) * e, z = from[1] + (to[1] - from[1]) * e, d = Math.hypot(to[0] - from[0], to[1] - from[1]); return { x, z, walking: u > 0 && u < 1, dist: d * e, head: Math.atan2(to[0] - from[0], to[1] - from[1]) }; };

  // ---------------------------------------------------------------- overlay: pixel captions + the question card + the end card
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 10, calloutColor: '#ffd43b',
    title: { lines: ['CAN YOUR PROFESSOR', 'TELL YOU USED AI?'], t0: 0, t1: W('hook', 'babe') - 0.08, y: 0.135, plain: true, s: 7, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- shots (set-local cameras: p = [start, end] positions, a = [start, end] aims)
  const SH = [
    { id: 'hook', t0: 0, set: 'beach', vex: (t) => ({ x: 0, z: 4.5, rotY: PI, pose: t < T.let ? 'shades' : 'hip', tilt: t < T.babe ? 0.12 : -0.1, face: { relaxed: t > T.babe ? 0.45 : 0.15 } }), p: [[0.12, 1.38, 2.0], [0.0, 1.36, 2.45]], a: [[0, 1.27, 4.5], [0, 1.27, 4.5]], fov: 42, mood: 0 },
    { id: 't1a', t0: T.tell1, set: 'office', vex: (t) => { const w = walkTo(t, T.tell1, T.tell1 + 1.25, [-5.0, -1.2], [-3.6, -1.2]); return { x: w.x, z: w.z, rotY: w.walking ? w.head : PI / 2 * (1 - ease(u01(t, T.tell1 + 1.25, T.tell1 + 1.6))), walk: w.walking ? { dist: w.dist, speed: 1.05 } : null, pose: t > T.one ? 'point' : 'hip', lean: t > T.one ? 0.3 : 0 }; }, p: [[-3.55, 1.38, 1.0], [-3.6, 1.38, 0.75]], a: [[-3.6, 1.27, -1.2], [-3.6, 1.27, -1.2]], fov: 42 },
    { id: 't1b', t0: T.more - 0.05, set: 'office', p: [[-0.6, 2.22, -0.6], [-0.6, 2.22, -0.85]], a: [[-0.6, 2.2, -2.43], [-0.6, 2.21, -2.43]], fov: 50, board: 1 },
    { id: 't1c', t0: T.and1 - 0.05, set: 'office', p: [[DX - 0.2, deskY + 0.82, 0.68], [DX - 0.2, deskY + 0.7, 0.66]], a: [[DX - 0.2, deskY, 0.55], [DX - 0.2, deskY, 0.55]], fov: 44, crime: 1 },
    { id: 't2a', t0: T.tell2, set: 'lib', vex: (t) => { const up = t > T.pasted + 0.25; return { x: -1.2, z: -2.6, pose: 'phone', nod: up ? 0.05 : 0.35, look: up ? [0, 0] : [0, -0.7], face: { relaxed: up ? 0.35 : 0 } }; }, p: [[-1.15, 1.36, -0.95], [-1.2, 1.36, -1.1]], a: [[-1.2, 1.25, -2.6], [-1.2, 1.26, -2.6]], fov: 42, ai: 1 },
    { id: 't2b', t0: T.em - 0.05, set: 'lib', screen: 0.78, ai: 1 },
    { id: 't2c', t0: T.nobody - 0.05, set: 'lib', vex: (t) => ({ x: -1.2, z: -2.6, pose: 'shrug', tilt: 0.1 * Math.sin(t * 7), face: { happy: 0.55 } }), p: [[-1.22, 1.46, -1.55], [-1.2, 1.46, -1.68]], a: [[-1.2, 1.36, -2.6], [-1.2, 1.37, -2.6]], fov: 40, ai: 1 },
    { id: 't3a', t0: T.tell3, set: 'cls', p: [[0.72, 1.6, 1.0], [0.72, 1.6, 0.7]], a: [[0.72, 1.55, -2.94], [0.72, 1.55, -2.94]], fov: 52 },
    { id: 't3b', t0: T.overnight - 0.05, set: 'cls', vex: (t) => ({ x: -2.7, z: -1.6, pose: 'cross', tilt: 0.15, look: t > T.totally - 0.05 ? [0.25, 0.95] : [0, 0], face: { relaxed: 0.2 } }), p: [[-2.65, 1.38, 0.35], [-2.7, 1.38, 0.15]], a: [[-2.7, 1.27, -1.6], [-2.7, 1.27, -1.6]], fov: 42 },
    { id: 'turn', t0: T.turn, set: 'lib', vex: (t) => ({ x: -2.4, z: 0.2, pose: 'peace', lean: 0.45, tilt: -0.15, face: { relaxed: 0.5, blink: 0, blinkLeft: t > T.mommy ? 1 : 0 } }), p: [[-2.36, 1.44, 1.35], [-2.4, 1.42, 1.2]], a: [[-2.4, 1.36, 0.2], [-2.4, 1.36, 0.2]], fov: 40 },
    { id: 's1', t0: T.scribe, set: 'lib', p: [[LD.sheet[0], LD.deskY + 0.78, LD.sheet[1] + 0.2], [LD.sheet[0], LD.deskY + 0.66, LD.sheet[1] + 0.17]], a: [[LD.sheet[0], LD.deskY, LD.sheet[1]], [LD.sheet[0], LD.deskY, LD.sheet[1]]], fov: 44 },
    { id: 's2', t0: T.then - 0.05, set: 'lib', p: [[LD.sheet[0] + 0.02, LD.deskY + 0.62, LD.sheet[1] + 0.6], [LD.sheet[0] + 0.02, LD.deskY + 0.6, LD.sheet[1] + 0.55]], a: [[LD.sheet[0], LD.deskY + 0.12, LD.sheet[1] + 0.05], [LD.sheet[0], LD.deskY + 0.12, LD.sheet[1] + 0.05]], fov: 46, snap: 1 },
    { id: 's3', t0: T.it - 0.05, set: 'lib', screen: 0.85, dx: 0.12 },
    { id: 's4', t0: T.and2 - 0.05, set: 'lib', p: [[LD.sheet[0], LD.deskY + 0.78, LD.sheet[1] + 0.2], [LD.sheet[0], LD.deskY + 0.66, LD.sheet[1] + 0.17]], a: [[LD.sheet[0], LD.deskY, LD.sheet[1]], [LD.sheet[0], LD.deskY, LD.sheet[1]]], fov: 44, write: 1 },
    { id: 's5', t0: T.messy - 0.05, set: 'lib', macro: 1, write: 1 },
    { id: 'p1', t0: T.payoff, set: 'office', p: [[DX + 0.3, deskY + 0.85, 0.62], [DX + 0.3, deskY + 0.75, 0.6]], a: [[DX + 0.3, deskY, 0.5], [DX + 0.3, deskY, 0.5]], fov: 46, turnIn: 1 },
    { id: 'p2', t0: T.your - 0.05, set: 'office', p: [[-0.8, 2.12, -0.95], [-0.4, 2.12, -0.95]], a: [[-0.82, 2.1, -2.39], [-0.38, 2.1, -2.39]], fov: 50, board: 2 },
    { id: 'p3', t0: T.perfect - 0.05, set: 'office', p: [[-0.6, 2.12, -0.55], [-0.6, 2.12, -0.7]], a: [[-0.6, 2.1, -2.39], [-0.6, 2.1, -2.39]], fov: 54, board: 2, match: 1 },
    { id: 'end', t0: T.end, set: 'beach', vex: (t) => { const w = walkTo(t, T.end, T.end + 1.3, [0.15, 6.0], [0, 4.5]); return { x: w.x, z: w.z, rotY: PI, walk: w.walking ? { dist: w.dist, speed: 1.0 } : null, pose: t > T.couldnt - 0.1 ? 'peace' : 'hip', tilt: -0.12, face: { relaxed: 0.5, blink: 0, blinkLeft: t > T.couldnt + 0.15 ? 1 : 0 } }; }, p: [[0.12, 1.38, 2.0], [0.0, 1.36, 2.4]], a: [[0, 1.27, 4.5], [0, 1.27, 4.5]], fov: 40, mood: 1 },
  ];
  SH.forEach((s, i) => (s.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s) => s.t0);
  window.EDSTUDIO_CUTS = CUTS;

  // the laptop screen camera (screen-normal dolly) + the macro on the sevens
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = LIB.laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipLocal = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); LIB.sheet.localToWorld(v); return LIB.root.worldToLocal(v); };
  const sevens = sheet.items.filter((it) => it.pi === 3);
  const sevenC = sevens.length ? [sevens.reduce((s, it) => s + it.x + it.w / 2, 0) / sevens.length, sevens.reduce((s, it) => s + it.y + it.h / 2, 0) / sevens.length] : [400, 700];
  // writing progress (item weights): nothing before "then", the first rows while the app solves, all of it by "messy"
  const total = sheet.total;
  const writeP = (t) => total * (0.08 * u01(t, T.then, T.it) + 0.52 * ease(u01(t, T.and2, T.messy)) + 0.4 * u01(t, T.messy, T.payoff - 0.2));

  function update(t) {
    const sh = SH.find((s) => t >= s.t0 && t < s.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    for (const [n, r] of Object.entries(ROOTS)) r.visible = n === sh.set;
    scene.background = new THREE.Color(sh.mood ? 0xe0708a : 0x86c2f2);
    BEACH.setMood(sh.mood || 0);
    // Vex
    VEX.root.visible = !!sh.vex; phoneG.visible = sh.id === 't2a';
    // camera
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { const tip = sheet.draw(writeP(t)), c = tipLocal(sevenC); cam = { pos: [c.x + 0.02, c.y + 0.24 - 0.04 * k, c.z + 0.06], look: [c.x, c.y, c.z], fov: 40 }; }
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    const ST = ROOTS[sh.set]; ST?.updateMatrixWorld(true);
    const W3 = (q) => (ST ? ST.localToWorld(new THREE.Vector3(...q)).toArray() : q);
    const P2 = sh.screen ? cam.pos : W3(cam.pos), L2 = sh.screen ? cam.look : W3(cam.look);
    studio.setCamera(P2, L2, cam.fov, 0, 0);
    { const f = new THREE.Vector3(...L2).sub(new THREE.Vector3(...P2)).setY(0).normalize(), side = new THREE.Vector3(f.z, 0, -f.x), tg = new THREE.Vector3(...L2).setY(0);
      BEACH.setSun(studio.camera.position, f.clone().addScaledVector(side, 0.32).add(new THREE.Vector3(0, sh.mood ? 0.09 : 0.42, 0)));
      BEACH.sun.target.position.copy(tg); BEACH.sun.position.copy(tg).addScaledVector(f, -9).addScaledVector(side, -5).add(new THREE.Vector3(0, sh.mood ? 6 : 12, 0)); }   // key light from behind the lens
    if (sh.vex) {
      const v = sh.vex(t), wp = W3([v.x, 0, v.z]);
      VEX.update(t, { ...lips(t), sway: 0.12, ...v, face: { ...(v.face || {}) }, x: wp[0], z: wp[2], y: 0, rotY: (v.rotY ?? 0) + (ST ? PI : 0) });
    }
    // per-shot props
    OFC.root.visible && (boardMesh.material.map = sh.board === 2 ? board2 : board1, boardMesh.material.needsUpdate = true);
    if (sh.id === 't1b') board1.draw(u01(t, T.handwritten, T.handwritten + 0.35)); else if (sh.id === 't1a') board1.draw(0);
    crime.visible = tapes[0].visible = tapes[1].visible = sh.id === 't1c'; markers.forEach((m) => (m.visible = sh.id === 't1c'));
    tapes.forEach((m, i) => { const tt = t - T.crime - i * 0.12; m.visible = sh.id === 't1c' && tt > 0; m.scale.setScalar(tt > 0 ? (tt < 0.06 ? 1.3 : 1) : 1); });
    turnedIn.visible = sh.id === 'p1'; pile.forEach((m) => (m.visible = sh.id === 'p1'));
    if (sh.id === 'p1') { const u = ease(u01(t, T.payoff + 0.15, T.payoff + 0.75)); turnedIn.position.set(DX + 0.35 - 0.7 * (1 - u), deskY + 0.006, 0.5 + 0.3 * (1 - u)); turnedIn.rotation.z = -0.04 - 0.6 * (1 - u); }
    pinned.forEach((m) => (m.visible = sh.board === 2)); lens.visible = sh.id === 'p2'; check.visible = sh.id === 'p3' && t > T.perfect + 0.1;
    if (sh.id === 'p2') { const u = ease(k); lens.position.set(-0.95 + 0.7 * u, 2.15 + 0.04 * Math.sin(t * 4), -2.25); }
    if (sh.id === 'p3') check.scale.setScalar(t < T.perfect + 0.18 ? 1.3 : 1);
    gradeT.draw(t >= T.hundred ? 3 : t >= T.d2 ? 2 : t >= T.d1 ? 1 : 0);
    // AI check screen + Scribe screen on the laptop
    LIB.laptop.scr.material.map = sh.ai ? aiT : screen.tex; LIB.laptop.scr.material.needsUpdate = true;
    if (sh.ai) aiT.draw(u01(t, T.em, T.dashes + 0.4) * 1.0, u01(t, T.delve, T.delve + 0.4), u01(t, T.em, T.nobody));
    else screen.draw(t < T.solves ? { mode: 'scan', k: u01(t, T.it, T.solves) } : t < T.and2 ? { mode: 'solve', k: u01(t, T.solves, T.and2 - 0.1) } : { mode: 'write', k: 0 });
    LIB.laptop.hinge.rotation.x = -0.22; LIB.scrL.intensity = sh.set === 'lib' ? 1.2 : 0;
    // practice page writes itself, then the worksheet (the pen rides the tip)
    practice.draw(practice.total * ease(u01(t, T.scribe + 0.1, T.then - 0.1)));
    const wp = writeP(t), tip = sheet.draw(wp);
    pen.g.visible = sh.write === 1 || sh.id === 's1';
    if (sh.write) { const p = tipLocal(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    if (sh.id === 's1') { const tp = practice.draw.tip, v = V((tp[0] / practice.w - 0.5) * 0.432, (0.5 - tp[1] / practice.h) * 0.559, 0); practiceM.updateWorldMatrix(true, false); practiceM.localToWorld(v); LIB.root.worldToLocal(v); pen.g.position.set(v.x, v.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), v.z); pen.g.rotation.set(0.35, 0, -0.3); }
    practiceM.visible = sh.id === 's1'; LIB.sheet.visible = sh.id !== 's1';
    snap.visible = sh.snap === 1;
    if (sh.snap) { const sw = [LD.sheet[0], LD.deskY, LD.sheet[1]], u = ease(u01(t, sh.t0, T.snap)); snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > T.snap && t < T.snap + 0.18 ? 0.95 * (1 - (t - T.snap) / 0.18) : 0; }
    LIB.setClock(11, 52);
    pixel.set(Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
