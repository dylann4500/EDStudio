// 066 — "GRWM: the econ final" (Scribe lane, anime/pixel look). Its own FORMAT, PLACE and Scribe FEATURE (user via manager, Nov 9:
// vary 064's POV and 065's rating list):
//   format  = get-ready-with-me: Vex talks to camera while she does her winged liner (a compact in one hand), a black-cherry lip, an
//             iced latte, step cards on screen (STEP 1: LINER …), then the review sheet that's due today;
//   place   = a café at golden hour: a window wall with a low sun behind her, a brick wall + chalkboard menu, the espresso counter;
//   feature = README §Worksheets: attach the PDF → Scribe finds its blanks, the empty table cells and the open space → writes the
//             answers ON the worksheet in your handwriting; README §The handwriting picker: Pen = Pencil (graphite); the archive's
//             Download PDF. The pen (here: a pencil) draws the supply shift (subjects.js FIG.market: a frost moves S left, P up, Q down).
// Same guardrails: flirty for an 18+ college audience, swimwear only, no kink lines, no promises.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay } from '@engine/pixelcaps.js';
import { makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, layoutHand, penKit } from '@engine/build/scribe.js';
import { FIG } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, TOP = 1.02, GRAPHITE = '#55575e';
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// the chest shading pass: soft rose shapes on an offscreen layer (blurred), multiplied onto the body atlas once. Atlas coords (2048²):
// the cups are triangles, apexes (874, 395) / (1174, 395), bases y ≈ 615–625 from x 709–994 and 1052–1342; the gap centre x = 1023.
async function shadeBody(url) {
  const img = await loadImg(url), W = img.width, S = W / 2048;
  const c = document.createElement('canvas'); c.width = W; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const L = document.createElement('canvas'); L.width = W; L.height = img.height; const l = L.getContext('2d');
  l.fillStyle = '#fff'; l.fillRect(0, 0, W, img.height); l.scale(S, S); l.lineCap = 'round';
  const stroke = (pts, w, blur, col, a) => { l.save(); l.filter = `blur(${blur * S}px)`; l.globalAlpha = a; l.strokeStyle = col; l.lineWidth = w; l.beginPath(); pts.forEach(([x, y], i) => (i ? l.lineTo(x, y) : l.moveTo(x, y))); l.stroke(); l.restore(); };
  const arc = (cx, cy, rx, ry, a0, a1, w, blur, col, a) => { const P = []; for (let i = 0; i <= 24; i++) { const t = a0 + (a1 - a0) * i / 24; P.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } stroke(P, w, blur, col, a); };
  stroke([[1023, 495], [1021, 560], [1023, 622]], 12, 9, '#b06878', 0.5);          // the cleavage shadow, fuller toward the band
  stroke([[1023, 548], [1022, 590], [1023, 618]], 2.6, 1.2, '#8e4858', 0.7);       // its crisp core line
  stroke([[892, 440], [1006, 620]], 16, 10, '#b87884', 0.38); stroke([[1156, 440], [1040, 620]], 16, 10, '#b87884', 0.38);   // inner-cup shade
  arc(852, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42); arc(1196, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42);   // under-cup
  arc(852, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45); arc(1196, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45);
  g.globalCompositeOperation = 'multiply'; g.drawImage(L, 0, 0);
  return c.toDataURL('image/png');
}

// 067's look (Nov 9, the user loved it: "that look and the shading… is great"): eyes 1.24 + head 1.08 (makeVroid below), the chest
// shading pass, and its dominant face — a brow arch (angry 0.12) on every face but a sad or laughing one, and the half-lidded
// `relaxed` eased toward 067's 0.1 so the bigger eyes stay open (each shot keeps its own expression on top)
const vexLook = (f) => ({ ...f, relaxed: 0.1 + 0.5 * Math.max(0, (f.relaxed ?? 0.1) - 0.1), angry: f.angry ?? (f.sad ? 0 : 0.12 * Math.max(0, 1 - (f.happy || 0) / 0.4)) });

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    mommy1: W('hook', 'mommy'), liner: B.liner.t0, curve: W('liner', 'curve'), lip: B.lip.t0, mommy2: W('lip', 'mommys'), up: W('lip', 'up'),
    coffee: B.coffee.t0, iced: W('coffee', 'iced'), opp: W('coffee', 'opportunity'), sleep: W('coffee', 'sleep'),
    sheet: B.sheet.t0, the: W('sheet', 'the'), blanks: W('sheet', 'blanks'), table0: W('sheet', 'table'), graph: W('sheet', 'graph'),
    scribe: B.scribe.t0, uploaded: W('scribe', 'uploaded'), andS: W('scribe', 'and'), blank: W('scribe', 'blank'), box: W('scribe', 'box'), my: W('scribe', 'my'),
    pencil: W('scribe', 'pencil'), even: W('scribe', 'even'), supply: W('scribe', 'supply'),
    download: B.download.t0, turned: W('download', 'turned'), end: B.end.t0, mommy3: W('end', 'mommy'), baby: W('end', 'baby'),
  };
  T.card = T.baby + 0.55;

  // ---------------------------------------------------------------- the café at golden hour (open toward +z; the window wall behind her)
  scene.background = new THREE.Color(0x2a1a14);
  const R = new THREE.Group(); scene.add(R);
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const floorT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#8a5a36', ['#7a4e2e', '#9a6840', '#6e4428'], 40, 5); g.fillStyle = '#5e3a22'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [5, 5] });
  const brickT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#d8c8b8'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { g.fillStyle = ['#a8543a', '#b8603f', '#9a4a32'][(r + c + 3) % 3]; g.fillRect(c * 8 + (r % 2) * 4 + 1, r * 4 + 1, 7, 3); } }, { k: 1, repeat: [6, 4] });
  const woodM = toon(0x5a3420), darkM = toon(0x2a1a14);
  plane(R, 4.8, 4.8, lam({ map: floorT }), 0, 0, -0.8, 0, -PI / 2);
  plane(R, 4.8, 4.8, lam({ color: 0x3a2418 }), 0, 2.9, -0.8, 0, PI / 2);
  plane(R, 4.8, 2.9, lam({ map: brickT }), -2.4, 1.45, -0.8, PI / 2);
  plane(R, 4.8, 2.9, lam({ color: 0xe8d8c0 }), 2.4, 1.45, -0.8, -PI / 2);
  // the window wall: a golden-hour street, a low sun, warm mullions
  const viewT = crisp(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffcf8a'); gr.addColorStop(0.62, '#ff9a52'); gr.addColorStop(1, '#e8743a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const sg = g.createRadialGradient(300, 300, 10, 300, 300, 160); sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.25, 'rgba(255,230,160,.9)'); sg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a3a2a'; for (let i = 0; i < 16; i++) { const bw = 50 + hash(i) * 60, bh = 90 + hash(i + 5) * 150; g.fillRect(i * 66 - 10, h - 120 - bh, bw, bh + 10); }
    g.fillStyle = '#ffd88a'; for (let i = 0; i < 40; i++) g.fillRect(hash(i * 3) * w, h - 140 - hash(i * 7) * 180, 6, 8);
    g.fillStyle = '#5a2a20'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(80 + i * 180, h - 120, 46, 0, 7); g.fill(); g.fillRect(76 + i * 180, h - 120, 8, 60); }
    g.fillStyle = '#4a2a22'; g.fillRect(0, h - 70, w, 70); g.fillStyle = '#f0b070'; g.fillRect(0, h - 74, w, 4); });
  plane(R, 4.8, 2.5, new THREE.MeshBasicMaterial({ map: viewT, toneMapped: false }), 0, 1.55, -3.19);
  for (const x of [-2.36, -0.8, 0.8, 2.36]) bx(R, 0.09, 2.6, 0.1, woodM, x, 1.55, -3.15);
  for (const y of [0.3, 2.82, 2.05]) bx(R, 4.8, 0.08, 0.1, woodM, 0, y, -3.15);
  bx(R, 4.8, 0.3, 0.3, woodM, 0, 0.15, -3.05);   // the window sill bench
  { const glowT = crisp(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,230,170,1)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.55 })); sun.position.set(-0.95, 1.5, -3.1); sun.scale.setScalar(1.6); R.add(sun); }
  // chalkboard menu + shelf on the brick wall
  const menuT = crisp(256, 320, (g, w, h) => { g.fillStyle = '#22302a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a5a36'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f4f0e6'; g.textAlign = 'center'; g.font = '700 36px Georgia, serif'; g.fillText('MENU', w / 2, 58);
    g.font = '500 24px Georgia, serif'; [['latte', '5'], ['iced latte', '5.5'], ['espresso', '3'], ['matcha', '6'], ['croissant', '4']].forEach(([a, b], i) => { g.textAlign = 'left'; g.fillText(a, 30, 110 + i * 40); g.textAlign = 'right'; g.fillText(b, w - 30, 110 + i * 40); }); });
  plane(R, 0.8, 1.0, lam({ map: menuT }), -2.385, 1.75, -1.2, PI / 2);
  bx(R, 0.25, 0.04, 1.4, woodM, -2.27, 1.1, -1.2);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 10), toon([0xf4f0e6, 0x2a2a2a, 0xe8a0a0, 0x9ad0c0, 0xf4f0e6][i])); m.position.set(-2.25, 1.17, -1.75 + i * 0.27); R.add(m); }
  // the espresso counter (right): counter, machine, pastry case, cups
  bx(R, 0.7, 1.0, 2.0, woodM, 2.0, 0.5, -1.6); bx(R, 0.76, 0.05, 2.06, toon(0xe8e0d4), 2.0, 1.025, -1.6);
  { const mc = new THREE.Group(); mc.position.set(2.05, 1.05, -2.2); R.add(mc); const st = new THREE.MeshStandardMaterial({ color: 0xc8ccd4, roughness: 0.25, metalness: 0.8 }); bx(mc, 0.45, 0.4, 0.4, st, 0, 0.2, 0); bx(mc, 0.45, 0.08, 0.42, toon(0x9a1c25), 0, 0.42, 0); for (const z of [-0.1, 0.1]) bx(mc, 0.06, 0.06, 0.06, toon(0x1a1a1a), -0.25, 0.22, z); }
  { const pc = new THREE.Group(); pc.position.set(2.05, 1.05, -1.2); R.add(pc); bx(pc, 0.6, 0.02, 0.6, toon(0x5a3420), 0, 0.01, 0); const gl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.6), new THREE.MeshLambertMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.25, depthWrite: false })); gl.position.y = 0.2; pc.add(gl);
    for (let i = 0; i < 4; i++) { const cr = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 6, 10, PI), toon(0xd89a50)); cr.position.set(-0.15 + (i % 2) * 0.3, 0.06, -0.15 + Math.floor(i / 2) * 0.3); cr.rotation.x = -PI / 2; pc.add(cr); } }
  // pendant lights + background tables
  for (const [x, z] of [[-1.2, -1.6], [0.1, -1.0], [1.2, -1.9]]) { bx(R, 0.01, 0.6, 0.01, darkM, x, 2.6, z, false); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 10, 1, true), new THREE.MeshToonMaterial({ color: 0x2a2a2a, side: THREE.DoubleSide })); sh.position.set(x, 2.22, z); R.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd090, toneMapped: false })); b.position.set(x, 2.13, z); R.add(b); const L = new THREE.PointLight(0xffc080, 1.1, 4, 1.6); L.position.set(x, 2.0, z); R.add(L); }
  for (const [x, z] of [[-1.55, -0.4], [-1.6, -2.3]]) { bx(R, 0.06, 0.72, 0.06, darkM, x, 0.36, z); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16), woodM); top.position.set(x, 0.74, z); R.add(top); for (const s of [-1, 1]) bx(R, 0.36, 0.45, 0.36, darkM, x + s * 0.5, 0.225, z); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 10), toon(0xf4f0e6)); cup.position.set(x + 0.08, 0.8, z); R.add(cup); }
  { const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 10), toon(0xd8c8b0)); pot.position.set(-2.0, 0.2, -2.8); R.add(pot); for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4), toon(0x3a7a4a)); lf.position.set(-2.0 + Math.cos(i) * 0.18, 0.7 + (i % 3) * 0.12, -2.8 + Math.sin(i) * 0.18); lf.rotation.set(Math.sin(i) * 0.7, i, Math.cos(i) * 0.7); R.add(lf); } }

  // ---------------------------------------------------------------- her tall table: laptop, the review sheet, a compact, the iced latte, a makeup bag
  bx(R, 1.05, 0.05, 0.62, woodM, 0.1, TOP - 0.025, -1.3); bx(R, 0.08, TOP - 0.05, 0.08, darkM, 0.1, (TOP - 0.05) / 2, -1.3); bx(R, 0.6, 0.03, 0.4, darkM, 0.1, 0.015, -1.3);
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), Gp = await loadHand('/videos/049-scribe-promo/hand.json', GRAPHITE), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  // the review worksheet: printed blanks + an empty table + a graph box; Scribe fills them in pencil (graphite) in her hand
  const SW = 1024, SHH = 1325, QF = '500 27px Georgia, serif';
  const meas = document.createElement('canvas').getContext('2d'); meas.font = QF; const tw = (s) => meas.measureText(s).width;
  const L1a = '1.  When supply falls, the price ', L1b = ' and the quantity ', BL = 150;
  const b1 = [60 + tw(L1a), 60 + tw(L1a) + BL], b2x = b1[1] + tw(L1b), b2 = [b2x, b2x + BL];
  const TX = [120, 300, 560, 820], TY = [450, 500, 548, 596, 644, 692], ROWS = [['4', '6.25', '1.25'], ['5', '5', '2.5'], ['6', '3.75', '3.75'], ['7', '2.5', '5']];
  const k0 = penKit(Gp, 7, { u: 26 }), ans = [];
  const push = (list) => { ans.push(list); return list; };
  push(k0.text('Vex', 160, 186, { u: 30 }));
  push(k0.text('rises', (b1[0] + b1[1]) / 2, 276, { u: 28, align: 'center' })); push(k0.text('falls', (b2[0] + b2[1]) / 2, 276, { u: 28, align: 'center' }));
  const QEND = ans.length;
  ROWS.forEach((r, i) => { push(k0.text(r[1], (TX[1] + TX[2]) / 2, TY[i + 1] + 34, { u: 26, align: 'center' })); push(k0.text(r[2], (TX[2] + TX[3]) / 2, TY[i + 1] + 34, { u: 26, align: 'center' })); });
  const TEND = ans.length;
  const MK = FIG.market(k0, 170, 1170, { shift: 'supply-left', cause: 'A frost cuts supply,' }); push(MK);
  const GEND = ans.length;
  MK.R.lines.forEach((s, i) => push(k0.text(s, 600, 880 + i * 52, { u: 22 })));
  const items = ans.flat(), wt = (it) => (it.kind === 'p' ? it.w : 1);
  const cum = []; { let a = 0; ans.forEach((l) => { a += l.reduce((s, it) => s + wt(it), 0); cum.push(a); }); }
  const PQ = cum[QEND - 1], PT = cum[TEND - 1], PG = cum[GEND - 1], PE = cum[cum.length - 1];
  const sheetT = crisp(SW, SHH);
  let sheetKey = -1, tipNow = [SW / 2, SHH / 2];
  function drawSheet(p) {
    const key = Math.round(p * 4) / 4; if (key === sheetKey) return tipNow; sheetKey = key;
    const g = sheetT.canvas.getContext('2d');
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, SW, SHH);
    g.fillStyle = '#1d1d1d'; g.font = '600 38px Inter, Arial'; g.fillText('ECON 1 · REVIEW SHEET 7', 60, 92); g.font = '500 24px Inter, Arial'; g.fillStyle = '#b3261e'; g.fillText('Due TODAY 5:00 PM  ·  write your answers on this sheet', 60, 134);
    g.fillStyle = '#333'; g.font = '500 26px Inter, Arial'; g.fillText('Name:', 60, 196); g.fillRect(140, 202, 300, 2);
    g.fillStyle = '#1d1d1d'; g.font = QF; g.fillText(L1a, 60, 280); g.fillText(L1b, b1[1], 280); g.fillText('.', b2[1] + 4, 280); g.fillRect(b1[0], 286, BL, 2); g.fillRect(b2[0], 286, BL, 2);
    g.fillText('2.  Complete the table: the orange market after the frost.', 60, 400);
    g.strokeStyle = '#333'; g.lineWidth = 2; for (const x of TX) { g.beginPath(); g.moveTo(x, TY[0]); g.lineTo(x, TY[5]); g.stroke(); } for (const y of TY) { g.beginPath(); g.moveTo(TX[0], y); g.lineTo(TX[3], y); g.stroke(); }
    g.font = '600 24px Inter, Arial'; g.textAlign = 'center'; g.fillText('Price ($)', (TX[0] + TX[1]) / 2, TY[0] + 33); g.fillText('Qd (demand)', (TX[1] + TX[2]) / 2, TY[0] + 33); g.fillText("Qs' (after frost)", (TX[2] + TX[3]) / 2, TY[0] + 33);
    g.font = QF; ROWS.forEach((r, i) => g.fillText(r[0], (TX[0] + TX[1]) / 2, TY[i + 1] + 34)); g.textAlign = 'left';
    g.fillText("3.  Draw the market after the frost. Label S, S', D, P and Q.", 60, 770);
    g.save(); g.globalAlpha = 0.93;
    let acc = 0, tip = tipNow;
    for (const it of items) {
      const w = wt(it); if (acc >= p) break; const f = Math.min(1, (p - acc) / w);
      if (it.kind === 'g') { g.save(); g.beginPath(); g.rect(it.x - 2, it.y - 4, (it.w + 4) * f, it.h + 8); g.clip(); g.translate(it.x + it.w / 2, it.y + it.h / 2); g.rotate(it.rot || 0); g.drawImage(it.c, -it.w / 2, -it.h / 2, it.w, it.h); g.restore(); tip = [it.x + it.w * f, it.y + it.h * 0.6]; }
      else { const P = it.pts, n = Math.max(2, Math.ceil(P.length * f)); g.strokeStyle = GRAPHITE; g.lineWidth = (it.line ?? 3.6) * 0.95; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); for (let j = 0; j < n; j++) { const [x, y] = P[Math.min(j, P.length - 1)]; j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); tip = P[Math.min(n - 1, P.length - 1)]; }
      acc += w;
    }
    g.restore();
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,253,246,${0.25 + 0.3 * hash(i)})`; g.fillRect(hash(i * 3.1) * SW, hash(i * 7.7) * SHH, 2, 2); }   // paper tooth = a graphite grain
    sheetT.needsUpdate = true; tipNow = tip; return tip;
  }
  drawSheet(0);
  const SWm = 0.33, SHm = 0.33 * SHH / SW;
  const sheetM = plane(R, SWm, SHm, lam({ map: sheetT }), -0.16, TOP + 0.003, -1.18, 0, -PI / 2); sheetM.rotation.z = 0.06;
  // the Scribe screens on her laptop: upload → pencil → Download PDF (designed inside the middle ~620 px: a vertical frame crops it)
  const scrT = crisp(1280, 800);
  const X0 = 345, X1 = 935, RED = '#9a1c25';
  const sigline = layoutHand(Gp, 'Price rises', { x: 0, y: 0, u: 46, seed: 11 });
  let scrKey = '';
  function drawScreen(mode, k) {
    const key = mode + Math.round(k * 30); if (key === scrKey) return; scrKey = key;
    const g = scrT.canvas.getContext('2d'), w = 1280, h = 800;
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, X0 - 10, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', X0 + 48, 52);
    const card = (y, hh) => { g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.roundRect(X0 - 20, y, X1 - X0 + 40, hh, 22); g.fill(); g.stroke(); };
    if (mode === 'upload') {
      card(130, 560); g.fillStyle = '#999'; g.font = '500 28px Inter, Arial'; g.fillText('Attach your homework…', X0 + 10, 190);
      const u = ease(clamp(k / 0.35)), cy = 260 + (1 - u) * 260; g.globalAlpha = u;
      g.fillStyle = '#f6efe8'; g.beginPath(); g.roundRect(X0 + 10, cy, X1 - X0 - 20, 96, 16); g.fill(); g.fillStyle = '#d23a2a'; g.beginPath(); g.roundRect(X0 + 28, cy + 16, 50, 64, 6); g.fill();
      g.fillStyle = '#fff'; g.font = '800 18px Inter, Arial'; g.fillText('PDF', X0 + 34, cy + 56); g.fillStyle = '#1d1d1d'; g.font = '600 28px Inter, Arial'; g.fillText('econ-review-7.pdf', X0 + 96, cy + 44); g.fillStyle = '#888'; g.font = '500 22px Inter, Arial'; g.fillText('1 page', X0 + 96, cy + 76); g.globalAlpha = 1;
      if (k > 0.42) { g.fillStyle = '#1d1d1d'; g.font = '600 26px Inter, Arial'; g.fillStyle = RED; g.beginPath(); g.roundRect(X0 + 10, 400, 270, 52, 26); g.fill(); g.fillStyle = '#fff'; g.fillText('On the worksheet', X0 + 28, 435); g.fillStyle = '#888'; g.fillText('Fresh paper', X0 + 310, 435); }
      if (k > 0.65) { g.fillStyle = '#2f7d46'; g.font = '600 26px Inter, Arial'; g.fillText('✓ Found 2 blanks, 8 table cells,', X0 + 10, 530); g.fillText('   and space for 1 graph', X0 + 10, 568); }
    } else if (mode === 'pen') {
      card(110, 640); g.fillStyle = '#1d1d1d'; g.font = '600 36px Inter, Arial'; g.fillText('Writing style', X0 + 10, 170); g.fillStyle = '#888'; g.font = '600 22px Inter, Arial'; g.fillText('PEN', X0 + 10, 220);
      const pens = ['Ballpoint', 'Gel pen', 'Fountain pen', 'Fine marker', 'Pencil'], sel = k > 0.45 ? 4 : 0;
      pens.forEach((p, i) => { const y = 238 + i * 64; if (i === sel) { g.fillStyle = '#f6e8e8'; g.beginPath(); g.roundRect(X0 + 4, y, X1 - X0 - 8, 54, 14); g.fill(); g.strokeStyle = RED; g.lineWidth = 3; g.stroke(); }
        g.fillStyle = i === 4 ? '#f2c230' : '#2a2d33'; g.fillRect(X0 + 22, y + 22, 60, 10); g.fillStyle = i === 4 ? GRAPHITE : '#1b2760'; g.beginPath(); g.moveTo(X0 + 82, y + 22); g.lineTo(X0 + 96, y + 27); g.lineTo(X0 + 82, y + 32); g.fill();
        g.fillStyle = '#1d1d1d'; g.font = `${i === sel ? 700 : 500} 28px Inter, Arial`; g.fillText(p, X0 + 116, y + 37); });
      g.fillStyle = '#fffdf6'; g.fillRect(X0 + 4, 580, X1 - X0 - 8, 150); g.globalAlpha = sel === 4 ? 1 : 0.25; for (const it of sigline) g.drawImage(it.c, X0 + 30 + it.x, 610 + it.y, it.w, it.h); g.globalAlpha = 1;
    } else {
      card(110, 640); g.save(); g.translate(X0 + 70, 135); g.rotate(-0.02); g.drawImage(sheetT.canvas, 0, 0, 340, 440); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; g.strokeRect(0, 0, 340, 440); g.restore();
      const pressed = k > 0.4; g.fillStyle = pressed ? '#741520' : RED; g.beginPath(); g.roundRect(X0 + 40, 610, X1 - X0 - 80, 80, 20); g.fill(); g.fillStyle = '#fff'; g.font = '700 32px Inter, Arial'; g.textAlign = 'center'; g.fillText('Download PDF', (X0 + X1) / 2, 662); g.textAlign = 'left';
      if (k < 0.75) { const cx = X1 - 120 + 60 * (1 - ease(clamp(k / 0.4))), cy = 655 + 50 * (1 - ease(clamp(k / 0.4))); g.fillStyle = '#111'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 34); g.lineTo(cx + 9, cy + 26); g.lineTo(cx + 20, cy + 30); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
      if (k > 0.55) { g.fillStyle = '#1d1d1d'; g.beginPath(); g.roundRect(X0 + 20, 500, X1 - X0 - 40, 50, 12); g.fill(); g.fillStyle = '#fff'; g.font = '600 24px Inter, Arial'; g.fillText('✓ econ-review-7 (filled).pdf', X0 + 40, 533); }
    }
    scrT.needsUpdate = true;
  }
  drawScreen('upload', 0);
  const laptop = makeLaptop(scrT, icon); laptop.g.position.set(0.4, TOP, -1.42); laptop.g.rotation.y = -0.2; laptop.g.scale.setScalar(0.72); R.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  const compact = new THREE.Group(); R.add(compact);
  { const silver = new THREE.MeshStandardMaterial({ color: 0x2a1a2a, roughness: 0.3, metalness: 0.6 }); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 20), silver); compact.add(base);
    const lid = new THREE.Group(); lid.position.set(0, 0.006, -0.045); compact.add(lid); const lt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 20), silver); lt.position.set(0, 0, 0.045); lid.add(lt);
    const mir = new THREE.Mesh(new THREE.CircleGeometry(0.039, 20), new THREE.MeshBasicMaterial({ color: 0xd8e4f0, toneMapped: false })); mir.rotation.x = PI / 2; mir.position.set(0, -0.0055, 0.045); lid.add(mir); lid.rotation.x = -1.9; compact.lid = lid; }
  const COMPACT_TABLE = [-0.36, TOP + 0.006, -1.42];
  const latte = new THREE.Group(); R.add(latte);
  { const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.036, 0.16, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); shell.position.y = 0.08; latte.add(shell);
    const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.034, 0.08, 14), toon(0xf0e0c8)); milk.position.y = 0.045; latte.add(milk); const cof = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.044, 0.05, 14), toon(0x7a4a2a)); cof.position.y = 0.11; latte.add(cof);
    for (let i = 0; i < 3; i++) { const ice = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.026, 0.026), new THREE.MeshLambertMaterial({ color: 0xe8f8ff, transparent: true, opacity: 0.8 })); ice.position.set(-0.015 + i * 0.015, 0.138, (i % 2) * 0.012); ice.rotation.set(i, i * 2, 0); latte.add(ice); }
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6), toon(0x1a1a1a)); straw.position.set(0.012, 0.18, 0); straw.rotation.z = -0.15; latte.add(straw); }
  const LATTE_TABLE = [0.48, TOP, -1.08];
  bx(R, 0.2, 0.09, 0.1, toon(0xe86aa0), -0.28, TOP + 0.045, -1.56);   // makeup bag
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.006, 0.12, 8), toon(0x0e0a10)); R.add(liner);
  const lipstick = new THREE.Group(); R.add(lipstick); { const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 10), toon(0x141014)); lipstick.add(tube); const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0085, 0.022, 10), toon(0x5a0a1e, 0x1a0006)); tip.position.y = 0.04; lipstick.add(tip); }
  // the pencil that writes (Pencil ink)
  const pencil = new THREE.Group(); pencil.scale.setScalar(0.6); R.add(pencil);   // 0.6: at a 0.3 m macro lens a 20 cm pencil hid the answers
  { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), toon(0xf2c230)); body.position.y = 0.11; pencil.add(body); const wood = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.022, 6), toon(0xe8c9a0)); wood.rotation.x = PI; wood.position.y = 0.014; pencil.add(wood);
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.003, 0.008, 6), toon(0x2a2a2e)); lead.rotation.x = PI; lead.position.y = 0.002; pencil.add(lead); const er = new THREE.Mesh(new THREE.CylinderGeometry(0.0082, 0.0082, 0.02, 6), toon(0xf08aa0)); er.position.y = 0.205; pencil.add(er); }

  // ---------------------------------------------------------------- light: golden window behind her (rim), warm room, a fill at the lens
  const hemi = new THREE.HemisphereLight(0xffd8a8, 0x4a2e22, 0.95); scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffb070, 1.4); rim.position.set(-1.5, 2.2, -4.5); rim.target.position.set(0.1, 1.2, -1.5); rim.castShadow = true; rim.shadow.mapSize.set(2048, 2048); Object.assign(rim.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 }); scene.add(rim, rim.target);
  const key = new THREE.DirectionalLight(0xfff0e0, 0.7); scene.add(key, key.target);

  // ---------------------------------------------------------------- Vex
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: await shadeBody('/videos/054-goth-tutor/vex-body2.png') }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });   // 067's look
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0e0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064): she's backlit by the window
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const ARM = { ...ARMS, liner: { L: [[0.5, -0.7, 0.5], [-0.3, 0.45, 0.85]], R: [[-0.7, -0.25, 0.65], [0.45, 0.88, 0.05]] }, lipstick: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.6, -0.45, 0.65], [0.55, 0.8, 0.25]] }, sip: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.16, -0.9, 0.3], [0.2, 0.55, 0.8]] } };   // liner/lipstick: hands BESIDE the face (in front of it, they hid it)
  const armsOf = (pose) => { const A = ARM[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064 pose blending; custom poses (liner, sip) always pass their arms explicitly
    const cur = armsOf(v.pose);
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv); return { ...v, armL: mixArm(a.L, cur.L, k), armR: mixArm(a.R, cur.R, k) }; } }
    return ARMS[v.pose] ? v : { ...v, armL: cur.L, armR: cur.R };
  }
  const lids = (t, base = 0.14) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const tipOf = (side) => { const H = VEX.H; const n = H[`${side}IndexDistal`] ? `${side}IndexDistal` : `${side}Hand`; return VEX.bpos(n); };

  // ---------------------------------------------------------------- props held for real (Nov 9 fix — the user: "the coffee… the lipstick… that shit's just
  // floating or going through her"). Contact points are VERTICES of her face mesh (the outer corner of the right eye opening, the lower
  // lip's inner edge), so they follow the head, the blink and every mouth shape. The holding hand is put where the prop needs it by a
  // two-bone reach (shoulder → elbow → wrist) + a palm twist, iterated on the measured finger grip; each prop is then placed from that
  // hand's bones every frame (it can't drift off the fingers). Debug: render --cam side | side2 | above | close (prop checks).
  let FACE = null; VEX.model.traverse((o) => { if (o.isSkinnedMesh && /Face_00_SKIN/.test([].concat(o.material)[0]?.name || '')) FACE = o; });
  const fpos = (i, out = V()) => FACE.getVertexPosition(i, out).applyMatrix4(FACE.matrixWorld);
  const ANC = (() => {
    VEX.update(0, { face: { blink: 0 } }); VEX.root.updateMatrixWorld(true);
    const g = FACE.geometry, ix = g.index.array, P0 = g.attributes.position, n = P0.count, weld = new Map(), id = new Int32Array(n);
    for (let i = 0; i < n; i++) { const k = `${P0.getX(i).toFixed(5)},${P0.getY(i).toFixed(5)},${P0.getZ(i).toFixed(5)}`; if (!weld.has(k)) weld.set(k, i); id[i] = weld.get(k); }
    const ec = new Map(); for (let k = 0; k < ix.length; k += 3) for (const [a, b] of [[ix[k], ix[k + 1]], [ix[k + 1], ix[k + 2]], [ix[k + 2], ix[k]]]) { const u = id[a], w = id[b], key = u < w ? u * n + w : w * n + u; ec.set(key, (ec.get(key) || 0) + 1); }
    const bnd = new Set(); for (const [key, c] of ec) if (c === 1) { bnd.add(Math.floor(key / n)); bnd.add(key % n); }
    const eR = VEX.bpos('rightEye'), eL = VEX.bpos('leftEye'), mx = (eR.x + eL.x) / 2, W0 = new Map([...bnd].map((i) => [i, fpos(i)]));
    const eyeB = [...bnd].filter((i) => { const p = W0.get(i); return Math.abs(p.y - eR.y) < 0.03 && Math.abs(p.x - eR.x) < 0.035 && p.z > eR.z - 0.015; });
    const corner = eyeB.reduce((m, i) => (W0.get(i).x < W0.get(m).x ? i : m), eyeB[0]);   // her right = −x: the outermost point of the opening
    const mouthB = [...bnd].filter((i) => { const p = W0.get(i); return p.y < eR.y - 0.035 && p.y > eR.y - 0.13 && Math.abs(p.x - mx) < 0.035 && p.z > eR.z - 0.01; });
    VEX.update(0, { face: { blink: 0 }, mouth: 1, vowel: 'a' }); VEX.root.updateMatrixWorld(true);
    const lower = mouthB.filter((i) => fpos(i).y < W0.get(i).y - 0.002).sort((a, b) => W0.get(a).x - W0.get(b).x);
    VEX.update(0, {}); VEX.root.updateMatrixWorld(true);
    console.warn(`[066 holds] face boundary ${bnd.size}, right-eye opening ${eyeB.length} (corner ${corner}), lower lip ${lower.length}, expressions ${Object.keys(VEX.EX).join(' ')}`);
    return { corner, lower };
  })();
  const SEG = {}; for (const sd of ['left', 'right']) { const u = VEX.bpos(sd + 'UpperArm'), l = VEX.bpos(sd + 'LowerArm'), h = VEX.bpos(sd + 'Hand'); SEG[sd] = [u.distanceTo(l), l.distanceTo(h)]; }
  const qRoot = new THREE.Quaternion(), qHead = new THREE.Quaternion();
  const toHer = (w) => w.clone().applyQuaternion(qRoot.clone().invert()).toArray();   // a world direction → her frame (x her left, y up, z front)
  const fromHer = (x, y, z) => V(x, y, z).applyQuaternion(qRoot);
  function reach(sd, W, pole) {   // wrist target (world) + elbow pole (world dir) → [upper, lower] aim directions in her frame
    const S = VEX.bpos(sd + 'UpperArm'), [a, b] = SEG[sd], d = W.clone().sub(S), L = clamp(d.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3), nn = d.normalize();
    const ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca)), p = pole.clone().addScaledVector(nn, -pole.dot(nn)).normalize();
    const E = S.clone().addScaledVector(nn, a * ca).addScaledVector(p, a * sa), Wc = S.clone().addScaledVector(nn, L);
    return [toHer(E.clone().sub(S)), toHer(Wc.sub(E))];
  }
  const handFrame = (sd) => {   // the measured hand: wrist, axis (wrist → knuckles), palm normal, knuckle line (little → index), pinch point, palm centre
    const b = (n) => VEX.bpos(sd + n), H = b('Hand'), M = b('MiddleProximal'), I = b('IndexProximal'), Lp = b('LittleProximal');
    const A = M.clone().sub(H).normalize(), K = I.clone().sub(Lp).normalize(), N = (sd === 'right' ? K.clone().cross(A) : A.clone().cross(K)).normalize();
    const tip = (f, prev) => { const d = b(f + 'Distal'); return d.clone().addScaledVector(d.clone().sub(b(f + prev)), 0.75); };
    const pinch = tip('Thumb', 'Proximal').add(tip('Index', 'Intermediate')).multiplyScalar(0.5), palm = H.clone().lerp(M, 0.55).addScaledVector(N, 0.012);
    return { H, A, N, K, pinch, palm };
  };
  const twistTo = (A, N, Nd) => { const nd = Nd.clone().addScaledVector(A, -Nd.dot(A)).normalize(), nc = N.clone().addScaledVector(A, -N.dot(A)).normalize(); return Math.atan2(A.dot(nc.clone().cross(nd)), nc.dot(nd)); };
  // pose one hand so its grip point (pinch | palm) lands on `target` with the hand axis along `axis` and the palm facing `palmN` (world)
  function holdPose(t, P, sd, { target, axis, palmN, grip = 'pinch', pole, shape }) {
    const S = sd === 'right' ? 'R' : 'L', U = sd + 'UpperArm', key = sd + 'Hand';
    let W = target.clone().addScaledVector(axis, -0.085).addScaledVector(palmN, -0.02), twH = 0, twF = 0, hf = null;
    const aimH = toHer(axis);
    for (let it = 0; it < 5; it++) {
      const arm = reach(sd, W, pole);
      Object.assign(P, { ['arm' + S]: arm, aim: { ...(P.aim || {}), [key]: aimH, ['twist.' + key]: twH, ['twist.' + sd + 'LowerArm']: twF }, hands: { ...(P.hands || {}), [S]: shape } });
      VEX.update(t, P); VEX.root.updateMatrixWorld(true);
      hf = handFrame(sd); const th = twistTo(hf.A, hf.N, palmN); twF += 0.55 * th; twH += 0.45 * th;
      W.add(target.clone().sub(hf[grip]));
    }
    void U; return handFrame(sd);
  }
  const lipLine = (u, out = V()) => { const L = ANC.lower, x = clamp(u) * (L.length - 1), i = Math.min(L.length - 2, Math.floor(x)); return fpos(L[i]).lerp(fpos(L[i + 1]), x - i); };
  const DBG = new URLSearchParams(location.search).get('cam');
  const PINCH = [0.62, 0.7, 1.15, 1.3, 1.35], CUPG = [0.35, 0.55, 0.62, 0.68, 0.74], FLAT = [0.15, 0.1, 0.12, 0.14, 0.18];
  const nrm = (...vs) => vs.reduce((a, [k, v]) => a.addScaledVector(v, k), V()).normalize();   // nrm([k1, v1], [k2, v2], …) = Σ k·v, normalized
  function placeCompact(h) {   // on the flat left palm, the lid open with its mirror toward her face
    compact.position.copy(h.palm).addScaledVector(h.N, 0.008);
    const y = h.N.clone(), f = VEX.bpos('head').sub(compact.position), z = f.addScaledVector(y, -f.dot(y)).normalize(), x = y.clone().cross(z);
    compact.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); compact.lid.rotation.x = -1.95;
  }
  function holds(t, sh, P) {
    VEX.root.getWorldQuaternion(qRoot);
    const frame = () => { VEX.H.head.getWorldQuaternion(qHead); return { hu: V(0, 1, 0).applyQuaternion(qHead), hf: V(0, 0, 1).applyQuaternion(qHead), hl: V(1, 0, 0).applyQuaternion(qHead) }; };
    const compactHold = () => placeCompact(holdPose(t, P, 'left', { target: VEX.bpos('upperChest').add(fromHer(0.17, -0.03, 0.36)), axis: nrm([-0.45, fromHer(1, 0, 0)], [0.15, fromHer(0, 1, 0)], [0.88, fromHer(0, 0, 1)]), palmN: nrm([0.92, fromHer(0, 1, 0)], [-0.38, fromHer(0, 0, 1)]), grip: 'palm', pole: fromHer(1, -1, -0.4), shape: FLAT }));
    if (sh.hold === 'liner') {   // the pencil comes in from the side at eye height; its tip rests on the outer corner and flicks the wing out
      P.face = { ...P.face, blinkRight: 0.45 }; VEX.update(t, P); VEX.root.updateMatrixWorld(true);
      compactHold();
      const { hu, hf, hl } = frame(), w = 0.5 - 0.5 * Math.cos((t - T.liner) * PI * 2.2);
      const tip = fpos(ANC.corner).addScaledVector(hl, -0.007 * w).addScaledVector(hu, 0.005 * w).addScaledVector(hf, 0.002);
      const D = nrm([-0.82, hl], [0.55, hf], [0.05, hu]);   // from the tip back toward her fingers
      const h = holdPose(t, P, 'right', { target: tip.clone().addScaledVector(D, 0.075), axis: nrm([0.9, hf], [0.3, hl], [0.2, hu]), palmN: nrm([0.8, hl], [-0.3, hf], [-0.3, hu]), grip: 'pinch', pole: fromHer(-1, -0.9, -0.1), shape: PINCH });
      const fresh = fpos(ANC.corner).addScaledVector(hl, -0.007 * w).addScaledVector(hu, 0.005 * w).addScaledVector(hf, 0.002);   // the corner after the final pose
      liner.visible = true; liner.position.copy(fresh).addScaledVector(h.pinch.clone().sub(fresh).normalize(), 0.06); aimAlong(liner, h.pinch, fresh);
    }
    if (sh.hold === 'lipstick') {   // the tube's tip ON the lower lip, gliding along it (a slight "o"), the compact open in the other hand
      const tA = T.lip + 0.3, tB = T.mommy2 - 0.3, app = ease(u01(t, T.lip, tA)) * (1 - ease(u01(t, tB, tB + 0.4))), raise = ease(u01(t, T.up - 0.35, T.up + 0.1));
      if (app > 0) { P.mouth = (P.mouth || 0) * (1 - app) + 0.32 * app; if (app > 0.5) P.vowel = 'o'; }
      VEX.update(t, P); VEX.root.updateMatrixWorld(true);
      compactHold();
      const { hu, hf, hl } = frame(), u = 0.5 + 0.3 * Math.sin((t - tA) * PI * 1.5);
      const lipT = lipLine(u).addScaledVector(hu, -0.0045).addScaledVector(hf, 0.004);
      const rest = VEX.bpos('upperChest').add(fromHer(-0.17, 0.06 + 0.2 * raise, 0.3 + 0.05 * raise)).addScaledVector(V(0, 1, 0), 0.065);   // tip of the tube held upright at her right (raised on "up")
      const tip = rest.clone().lerp(lipT, app), D = nrm([1 - app, V(0, -1, 0)], [app, nrm([-0.45, hl], [0.85, hf], [-0.25, hu])]);
      const h = holdPose(t, P, 'right', { target: tip.clone().addScaledVector(D, 0.065), axis: nrm([1 - app, nrm([0.95, hf], [0.2, hl], [0.2, hu])], [app, nrm([0.6, hu], [0.45, hl], [0.25, hf])]), palmN: nrm([1 - app, hl], [app, nrm([0.55, hl], [-0.7, hf], [-0.2, hu])]), grip: 'pinch', pole: fromHer(-1, -1, -0.2), shape: PINCH });
      const tipNow = app > 0 ? rest.clone().lerp(lipLine(u).addScaledVector(hu, -0.0045).addScaledVector(hf, 0.004), app) : rest;
      const d = tipNow.clone().sub(h.pinch).normalize(); lipstick.visible = true; lipstick.position.copy(tipNow).addScaledVector(d, -0.051); lipstick.quaternion.setFromUnitVectors(up, d);
    }
    if (sh.hold === 'latte') {   // the cup in the right hand: palm on its side, fingers round its front, in front of her (clear of her chest); lifted on "iced"
      const pres = sh.id === 'coffee' ? bump(t, T.iced - 0.25, 0.55) * (1 - bump(t, T.iced + 0.9, 0.6)) : 0, droop = sh.id === 'tired' ? 1 : 0;
      const C = VEX.bpos('upperChest').add(droop ? fromHer(-0.13, 0.03, 0.31) : fromHer(-0.11, -0.04 + 0.06 * pres, 0.37 + 0.05 * pres));   // tired close-up: at chest height on her right, so the whole cup is in frame
      const h = holdPose(t, P, 'right', { target: C.clone().add(fromHer(-0.05, 0, 0)), axis: nrm([0.22, fromHer(1, 0, 0)], [0.97, fromHer(0, 0, 1)]), palmN: fromHer(1, 0, 0), grip: 'palm', pole: fromHer(-1, -1, -0.3), shape: CUPG });
      const K = h.K.clone(), c = h.palm.clone().addScaledVector(h.N, 0.05);
      const fx = fromHer(0, 0, 1), xx = fx.addScaledVector(K, -fx.dot(K)).normalize(), zz = xx.clone().cross(K);   // cup x = her front: the straw (tilted toward local +x) leans away from her
      latte.position.copy(c).addScaledVector(K, -0.075); latte.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx, K, zz));
    }
  }

  // ---------------------------------------------------------------- FX: pixel hearts
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [T.mommy1, T.mommy2, T.mommy3, T.baby].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay (title, step cards = the callouts, end card)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['GRWM:', 'THE ECON FINAL'], t0: 0, t1: B.liner.t0 - 0.1, y: 0.135, plain: true, s: 10, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- writing progress (in item weights): name + blanks → table → graph → explanation
  const writeP = (t) => PQ * ease(u01(t, T.andS, T.blank + 0.3)) + (PT - PQ) * ease(u01(t, T.blank + 0.3, T.my - 0.1)) + (PG - PT) * ease(u01(t, T.even - 0.15, T.download - 0.1)) + (PE - PG) * u01(t, T.download, T.end);
  const sheetPt = (px, py) => { const v = V((px / SW - 0.5) * SWm, (0.5 - py / SHH) * SHm, 0); sheetM.updateWorldMatrix(true, false); return sheetM.localToWorld(v); };
  const gx = MK.filter((it) => it.kind === 'p').flatMap((it) => it.pts), graphC = [gx.reduce((s2, q) => s2 + q[0], 0) / gx.length, gx.reduce((s2, q) => s2 + q[1], 0) / gx.length];

  // ---------------------------------------------------------------- shots (room coords: the camera looks −z; she stands behind her table facing +z)
  const VC = { x: 0.1, z: -1.92 };
  const SH = [
    { id: 'hook', t0: 0, vex: (t) => ({ ...VC, pose: t < T.mommy1 + 0.6 ? 'wave' : 'hip', tilt: 0.12, sway: 0.2, face: { relaxed: 0.25, happy: 0.3, blink: lids(t), blinkLeft: t > T.mommy1 + 0.3 && t < T.mommy1 + 0.9 ? 1 : 0 } }), cam: (t) => ({ pos: [0.12, 1.45, 0.35 - 0.3 * u01(t, 0, T.liner)], look: [0.1, 1.34, -1.92], fov: 48 }) },
    { id: 'liner', t0: T.liner, vex: (t) => ({ ...VC, pose: 'liner', lean: 0.1, tilt: 0.18, turn: 0.12, look: [0.35, -0.25], hands: { L: 'hold', R: 'hold' }, face: { relaxed: 0.2, blink: lids(t), blinkLeft: 0.2 } }), cam: (t) => ({ pos: [-0.2, 1.5, -1.0 - 0.1 * u01(t, T.liner, T.lip)], look: [0.06, 1.46, -1.92], fov: 40 }), hold: 'liner' },
    { id: 'lip', t0: T.lip, vex: (t) => ({ ...VC, pose: t > T.up - 0.2 ? 'kissOut' : 'lipstick', hands: { R: 'hold' }, lean: 0.15, tilt: -0.12, sway: 0.15, face: { relaxed: 0.35, blink: lids(t), blinkLeft: t > T.mommy2 + 0.3 && t < T.mommy2 + 1.0 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.18, 1.5, -0.85 - 0.25 * k], look: [0.1, 1.45, -1.92], fov: 42 }; }, hold: 'lipstick' },
    { id: 'coffee', t0: T.coffee, vex: (t) => ({ ...VC, pose: 'sip', tilt: 0.1, sway: 0.18, hands: { R: 'hold' }, face: { relaxed: 0.3, blink: lids(t) } }), p: [[0.4, 1.38, 0.2], [0.32, 1.38, 0.05]], a: [[0.1, 1.3, -1.92], [0.1, 1.32, -1.92]], fov: 46, hold: 'latte' },
    { id: 'tired', t0: T.opp - 0.05, vex: (t) => ({ ...VC, pose: 'sip', tilt: 0.2, nod: 0.12, sway: 0.1, hands: { R: 'hold' }, face: { sad: 0.35, relaxed: 0.3, blink: lids(t, 0.35) } }), cam: (t) => ({ pos: [0.12, 1.49, -0.75], look: [0.1, 1.4, -1.92], fov: 42 }), hold: 'latte' },   // aimed 5 cm lower than v1 so the held cup is in frame
    { id: 'step4', t0: T.sheet, vex: (t) => ({ ...VC, pose: t < T.the - 0.2 ? 'shrug' : 'point', lean: 0.25, tilt: 0.12, sway: 0.18, face: { sad: 0.2, relaxed: 0.2, blink: lids(t) } }), p: [[-0.2, 1.4, 0.3], [-0.12, 1.38, 0.15]], a: [[0.05, 1.2, -1.6], [0.05, 1.18, -1.6]], fov: 48 },
    { id: 'blanks', t0: T.review0 ?? (W('sheet', 'review') - 0.05), sheetCam: (t) => { const k = ease(u01(t, T.blanks - 0.3, T.graph + 0.3)); return [[480, 290], [470, 560], [380, 1000]][k < 0.5 ? 0 : 1].map((v, i) => v + ([[480, 290], [470, 560], [380, 1000]][k < 0.5 ? 1 : 2][i] - v) * (k < 0.5 ? k * 2 : k * 2 - 1)); }, h: 0.38 },
    { id: 'upload', t0: T.scribe, screen: 0.78, mode: 'upload' },
    { id: 'fill', t0: T.andS - 0.05, sheetCam: (t) => { const k = ease(u01(t, T.blank + 0.2, T.box + 0.3)); return [500 - 20 * k, 290 + 290 * k]; }, h: 0.32, write: 1 },
    { id: 'pen', t0: T.my - 0.15, screen: 0.78, mode: 'pen' },
    { id: 'graph', t0: T.even - 0.15, sheetCam: () => graphC, h: 0.3, write: 1 },
    { id: 'download', t0: T.download, screen: 0.78, mode: 'download' },
    { id: 'turned', t0: T.turned - 0.1, vex: (t) => ({ ...VC, pose: 'peace', tilt: -0.14, sway: 0.2, face: { happy: 0.5, blink: lids(t), blinkLeft: t > T.turned + 0.3 ? 1 : 0 } }), cam: (t) => ({ pos: [0.12, 1.45, -0.6], look: [0.1, 1.38, -1.92], fov: 44 }) },
    { id: 'end', t0: T.end, vex: (t) => ({ ...VC, pose: t > T.baby - 0.15 ? 'kissOut' : t > T.mommy3 - 0.3 ? 'kiss' : 'hip', tilt: -0.12, sway: 0.2, face: { relaxed: 0.4, blink: lids(t), blinkLeft: t > T.baby + 0.2 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy3 - 0.1, 1.0); return { pos: [0.15, 1.42 + 0.05 * k, 0.5 - 0.9 * k], look: [0.1, 1.28 + 0.14 * k, -1.92], fov: 46 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(0, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.06 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const up = V(0, 1, 0), qtmp = new THREE.Quaternion();
  const aimAlong = (obj, from, to) => { const d = to.clone().sub(from).normalize(); qtmp.setFromUnitVectors(up, d); obj.quaternion.copy(qtmp); };

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k);
    else if (sh.sheetCam) { const c = sheetPt(...sh.sheetCam(t)); cam = { pos: [c.x + 0.03, c.y + sh.h - 0.03 * k, c.z + 0.12], look: [c.x, c.y, c.z], fov: 40 }; }
    else if (sh.cam) cam = sh.cam(t);
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -4).addScaledVector(side, 2).add(V(0, 3, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.8, 0.28 * Math.pow(d, 1.6)) : 0.1; }
    // screens: upload → pen → download, each driven by its words
    if (sh.mode === 'upload' || (t < T.my - 0.15)) drawScreen('upload', u01(t, T.uploaded - 0.15, T.andS - 0.1));
    else if (sh.mode === 'pen' || t < T.download) drawScreen('pen', u01(t, T.pencil - 0.4, T.pencil + 0.5));
    else drawScreen('download', u01(t, T.download, T.turned - 0.2));
    const tip = drawSheet(writeP(t));
    // props back on the table unless a hand holds them this frame (holds() places them from her finger bones)
    liner.visible = lipstick.visible = false;
    compact.position.set(...COMPACT_TABLE); compact.quaternion.identity(); compact.lid.rotation.x = -1.9;
    latte.position.set(...LATTE_TABLE); latte.quaternion.identity();
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)), P = { ...lips(t), sway: 0.15, ...v, face: vexLook(v.face || {}), x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }; VEX.update(t, P); VEX.root.updateMatrixWorld(true); if (sh.hold) holds(t, sh, P); }
    fx(t, !!sh.vex);
    pencil.visible = !!sh.write;
    if (sh.write) { const p = sheetPt(tip[0], tip[1]); pencil.position.set(p.x, p.y + 0.003 + 0.005 * Math.abs(Math.sin(t * 23)), p.z); pencil.rotation.set(-0.5, 0, -0.3); }   // leaning AWAY from the lens (toward it, the 20 cm pencil filled the macro frame)
    pixel.set(Math.max(sh.screen ? 1 : sh.sheetCam ? 2 : PIXEL, mosaicAt(t, CUTS)));
    if (DBG && sh.vex && ['side', 'side2', 'above', 'close'].includes(DBG)) {   // prop checks (render --cam side|side2|above|close): look at the held prop from her right, her left, above, up close
      const fo = liner.visible ? liner.position : lipstick.visible ? lipstick.position : sh.hold === 'latte' ? latte.position.clone().add(V(0, 0.08, 0)) : VEX.bpos('head');
      const off = { side: fromHer(-0.55, 0.02, 0.08), side2: fromHer(0.55, 0.02, 0.08), above: fromHer(0.05, 0.5, 0.25), close: fromHer(0.04, 0.02, 0.42) }[DBG];
      studio.setCamera(fo.clone().add(off).toArray(), fo.toArray(), 40, 0, 0); pixel.set(1);
    }
    ov.update(t);
  }
  update(0);
  return { update };
}
