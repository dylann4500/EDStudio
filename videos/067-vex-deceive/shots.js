// 067 — "Why would I deceive you?" (Scribe lane, anime/pixel look). The user (via manager, Nov 9): Vex does real, current memes;
// vary format + place + Scribe feature again; new look settings; the new Fish voice "Mommy" (5233336f…, a generic library voice).
//   trend   = "Why Would I Deceive You?" (TikTok, Nov 2026: a deadpan "Why would I deceive you? There's no reason for me to do that."
//             under on-screen text about something that's obviously about to let you down; newengen.com/insights/tiktok-trends);
//   format  = meme text cards (white pixel setup lines at the top) + her deadpan line, four setups, then the confession;
//   place   = a sunny campus library (engine/sets/library.js, 019's reading room: windows, shelves, green lamps, a clock);
//   feature = README line 7 ("Scribe turns textbook pages … into …"): a phone PHOTO of a textbook page → the physics problems solved
//             with force diagrams drawn (subjects.js physics pack: the ramp + plane FBDs) → README §The handwriting picker: Ink =
//             Purple (Blue-black, Black, Blue, Pencil grey, Green, Purple, Red).
//   look    = bigger, rounder eyes (eyes 1.24) with a confident smirk; a stylised anime shading pass on her chest (a soft cleavage
//             line, inner-cup shade, under-cup crescents) painted onto the body atlas at runtime — same swimwear coverage.
// Same guardrails: flirty for an 18+ college audience, swimwear only, no kink lines, no promises, no claims about real people.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { buildLibrary } from '@engine/sets/library.js';
import { makePen, makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, layoutHand } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { pixelTex } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, TOP = 0.76, PURPLE = '#6a2fa0';
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));

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

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    mommy1: W('hook', 'mommy'), phone: B.phone.t0, my: W('phone', 'my'), why1: W('phone', 'why'), chapter: B.chapter.t0, why2: W('chapter', 'why'), theres: W('chapter', 'theres'),
    party: B.party.t0, tonight: W('party', 'tonight'), why3: W('party', 'why'), physics: B.physics.t0, myself: W('physics', 'myself'), okay: W('physics', 'okay'), lie: W('physics', 'lie'),
    scribe: B.scribe.t0, snapped: W('scribe', 'snapped'), scribeW: W('scribe', 'scribe'), drew: W('scribe', 'drew'), andS: W('scribe', 'and'), purple: W('scribe', 'purple'),
    end: B.end.t0, mommy2: W('end', 'mommy'), baby: W('end', 'baby'),
  };
  T.card = T.baby + 0.55;

  // ---------------------------------------------------------------- the library (sunny reading room)
  const LIB = buildLibrary(studio);
  const R = LIB.root;
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  // a wall clock IN FRONT of the set's static one (back wall, high): its hands race 4:00 → 7:12 on "five minutes"
  const clockT = crisp(256, 256);
  function drawClock(h) { const g = clockT.canvas.getContext('2d'); g.clearRect(0, 0, 256, 256); g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 12; g.stroke();
    g.fillStyle = '#3a2a1a'; for (let i = 0; i < 12; i++) { const a = i * PI / 6; g.fillRect(128 + Math.sin(a) * 98 - 4, 128 - Math.cos(a) * 98 - 4, 8, 8); }
    g.lineCap = 'round'; g.lineWidth = 11; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 52 * Math.sin(h / 12 * 2 * PI), 128 - 52 * Math.cos(h / 12 * 2 * PI)); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 86 * Math.sin(h * 2 * PI), 128 - 86 * Math.cos(h * 2 * PI)); g.stroke(); clockT.needsUpdate = true; }
  drawClock(4);
  plane(R, 0.56, 0.56, new THREE.MeshBasicMaterial({ map: clockT, transparent: true }), 0, 3.55, -4.87);
  // the left table: the shrink-wrapped textbook ($189.99, still sealed), the textbook page she photographs, the laptop
  const wrapT = crisp(256, 340, (g, w, h) => { g.fillStyle = '#1f3a6a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd43b'; g.font = '800 40px Inter, Arial'; g.textAlign = 'center'; g.fillText('PHYSICS', w / 2, 70); g.fillStyle = '#f4f0ea'; g.font = '600 22px Inter, Arial'; g.fillText('for Scientists & Engineers', w / 2, 104); g.fillText('11th edition', w / 2, 134);
    g.strokeStyle = '#ffd43b'; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 280); g.lineTo(210, 170); g.lineTo(210, 280); g.closePath(); g.stroke(); g.fillStyle = '#e8402a'; g.fillRect(118, 190, 34, 26);
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(140, 238, 104, 82, 10); g.fill(); g.fillStyle = '#c0392b'; g.font = '800 22px Inter, Arial'; g.fillText('NEW', 192, 266); g.fillStyle = '#1a1a1a'; g.font = '800 26px Inter, Arial'; g.fillText('$189.99', 192, 302); });
  const wrapped = new THREE.Group(); wrapped.position.set(-1.2, TOP, -1.05); wrapped.rotation.y = 0.35; R.add(wrapped);
  { const side = toon(0xe8e4dc); const bk = bx(wrapped, 0.24, 0.05, 0.31, [side, side, new THREE.MeshLambertMaterial({ map: wrapT }), side, side, side], 0, 0.025, 0);
    const shrink = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.056, 0.32), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, shininess: 120, specular: 0xffffff, depthWrite: false })); shrink.position.y = 0.025; wrapped.add(shrink);
    for (const [x, z, r] of [[0.06, -0.08, 0.3], [-0.05, 0.1, -0.4]]) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.012), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); gl.rotation.set(-PI / 2, 0, r); gl.position.set(x, 0.054, z); wrapped.add(gl); } void bk; }
  const pageT = crisp(1024, 1325, (g, w, h) => { g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f3a6a'; g.fillRect(0, 0, w, 90); g.fillStyle = '#fff'; g.font = '700 34px Inter, Arial'; g.fillText("CHAPTER 5  ·  NEWTON'S LAWS", 50, 58); g.fillText('142', w - 110, 58);
    g.fillStyle = '#1d1d1d'; g.font = '700 32px Georgia, serif'; g.fillText('Problems', 50, 160);
    const P = [['5.12', 'A 5.0 kg block slides down a 30° ramp', '(μk = 0.20). Draw its free-body diagram', 'and find its acceleration.'], ['5.13', 'A plane flies level at a constant', 'velocity. Draw its free-body diagram.'], ['5.14', 'Find the net force on a 1200 kg car', 'accelerating at 2.5 m/s².']];
    let y = 220; for (const [n, ...ls] of P) { g.font = '700 28px Georgia, serif'; g.fillText(n, 50, y); g.font = '500 28px Georgia, serif'; ls.forEach((s2, i) => g.fillText(s2, 140, y + i * 40)); y += ls.length * 40 + 40; }
    g.strokeStyle = '#888'; g.lineWidth = 4; g.beginPath(); g.moveTo(560, 1180); g.lineTo(940, 1180); g.lineTo(940, 960); g.closePath(); g.stroke(); g.fillStyle = '#9ab0d0'; g.save(); g.translate(760, 1060); g.rotate(-0.52); g.fillRect(-50, -60, 100, 60); g.restore();
    g.fillStyle = '#666'; g.font = 'italic 24px Georgia, serif'; g.fillText('Figure 5.21  A block on an incline.', 560, 1240);
    g.fillStyle = '#c8c0b0'; for (let i = 0; i < 9; i++) g.fillRect(50, 760 + i * 44, 440 - (i % 3) * 40, 12); });
  const pageM = plane(R, 0.3, 0.3 * 1325 / 1024, lam({ map: pageT }), -0.95, TOP + 0.004, -0.45, 0, -PI / 2); pageM.rotation.z = 0.1;
  // the right table: the physics worksheet Scribe writes in PURPLE (her own hand, loaded in the purple ink)
  const G = await loadHand('/videos/049-scribe-promo/hand.json', PURPLE), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'physics', { name: 'Vex', ink: PURPLE });
  const sheetM = plane(R, 0.33, 0.427, lam({ map: sheet.tex }), 0.98, TOP + 0.004, -0.55, 0, -PI / 2); sheetM.rotation.z = -0.08;
  const pen = makePen(); R.add(pen.g);
  // the Scribe screens (custom, designed inside the middle ~620 px): the photo → solving; then the ink picker
  const scrT = crisp(1280, 800), X0 = 345, X1 = 935, RED = '#9a1c25';
  const INKS = [['Blue-black', '#1b2760'], ['Black', '#1a1a1a'], ['Blue', '#2a5bd7'], ['Pencil grey', '#5b5d63'], ['Green', '#2f7d46'], ['Purple', PURPLE], ['Red', '#c0392b']];
  const sample = layoutHand(G, 'F = ma', { x: 0, y: 0, u: 54, seed: 4 });
  let scrKey = '';
  function drawScreen(mode, k) {
    const key = mode + Math.round(k * 30); if (key === scrKey) return; scrKey = key;
    const g = scrT.canvas.getContext('2d'), w = 1280, h = 800;
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, X0 - 10, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', X0 + 48, 52);
    g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.roundRect(X0 - 20, 105, X1 - X0 + 40, 660, 22); g.fill(); g.stroke();
    if (mode === 'solve') {
      g.save(); g.translate(X0 + 10, 125); g.rotate(-0.025); g.drawImage(pageT.canvas, 0, 0, 230, 298); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(0, 0, 230, 298);
      const sy = 298 * clamp(k / 0.35); if (k < 0.4) { g.fillStyle = 'rgba(154,28,37,.16)'; g.fillRect(0, 0, 230, sy); g.fillStyle = RED; g.fillRect(-6, sy - 3, 242, 6); } g.restore();
      g.fillStyle = '#888'; g.font = '500 22px Inter, Arial'; g.fillText('textbook-p142.jpg', X0 + 268, 160); g.fillStyle = RED; g.font = '600 22px Inter, Arial'; g.fillText('PHYSICS · 3 PROBLEMS', X0 + 268, 200);
      const n = Math.round(3 * clamp((k - 0.35) / 0.6)); g.fillStyle = '#1d1d1d'; g.font = '40px Georgia, serif'; g.fillText(n >= 3 ? 'All 3 solved.' : `Solving… ${n}/3`, X0 + 268, 258);
      ['FBD · ramp', 'FBD · plane', 'F = ma'].forEach((tag, i) => { const y = 470 + i * 92, done = i < n; g.fillStyle = done ? '#2f7d46' : '#e4dfd4'; g.beginPath(); g.roundRect(X0 + 10, y, 70, 70, 14); g.fill(); if (done) { g.strokeStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.moveTo(X0 + 28, y + 36); g.lineTo(X0 + 41, y + 50); g.lineTo(X0 + 64, y + 22); g.stroke(); }
        g.fillStyle = '#1d1d1d'; g.font = '600 30px Inter, Arial'; g.fillText(tag, X0 + 100, y + 46); });
    } else {
      g.fillStyle = '#1d1d1d'; g.font = '600 36px Inter, Arial'; g.fillText('Writing style', X0 + 10, 165); g.fillStyle = '#888'; g.font = '600 22px Inter, Arial'; g.fillText('INK', X0 + 10, 215);
      const sel = k > 0.4 ? 5 : 0;
      INKS.forEach(([name, col], i) => { const cx = X0 + 48 + (i % 4) * 140, cy = 280 + Math.floor(i / 4) * 140; g.fillStyle = col; g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.fill(); if (i === sel) { g.strokeStyle = RED; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.stroke(); }
        g.fillStyle = '#555'; g.font = `${i === sel ? 700 : 500} 20px Inter, Arial`; g.textAlign = 'center'; g.fillText(name, cx, cy + 76); g.textAlign = 'left'; });
      g.fillStyle = '#fffdf6'; g.fillRect(X0 + 4, 560, X1 - X0 - 8, 180); g.save(); if (sel !== 5) g.filter = 'grayscale(1) brightness(0.5)'; for (const it of sample) g.drawImage(it.c, X0 + 60 + it.x, 600 + it.y, it.w, it.h); g.restore();
    }
    scrT.needsUpdate = true;
  }
  drawScreen('solve', 0);
  const laptop = makeLaptop(scrT, icon); laptop.g.position.set(-1.0, TOP, -1.75); laptop.g.rotation.y = 0.55; laptop.g.scale.setScalar(0.85); R.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  // her phone (in hand), the snap rig over the textbook page
  const phone = new THREE.Group(); R.add(phone);
  { bx(phone, 0.075, 0.15, 0.01, toon(0xb48ad8), 0, 0, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshBasicMaterial({ color: 0x8ac8ff, toneMapped: false })); sc.position.z = 0.006; phone.add(sc); }
  const snap = new THREE.Group(); R.add(snap);
  { const skin = toon(0xffe6da, 0x5a4640), blk = toon(0x141218), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 18), blk); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), silver); s.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.012, 0.07); snap.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.045, 3, 8), skin); f.rotation.z = PI / 2; f.position.set(-0.06, -0.004, 0.035 + i * 0.02); snap.add(f); const n = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), blk); n.position.set(-0.09, -0.002, 0.035 + i * 0.02); snap.add(n); }
    const ph = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), toon(0xb48ad8)); ph.position.set(0, 0.006, 0); snap.add(ph);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: pageT, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }

  // ---------------------------------------------------------------- Vex: bigger, rounder eyes; the chest shading pass; party gear
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  const GM = dressGoth(VEX); scene.add(VEX.root);
  // party: the hair shades come down over her eyes (a clone at eye level), glow sticks round her neck + wrists
  const eyeC = VEX.bpos('rightEye').add(VEX.bpos('leftEye')).multiplyScalar(0.5);
  const onEyes = VEX.attach('head', [eyeC.x, eyeC.y + 0.004, eyeC.z + 0.025]); { const cl = GM.shades.clone(); cl.position.set(0, 0, 0); cl.rotation.set(0, 0, 0); const neon = new THREE.MeshBasicMaterial({ color: 0xff3fd0, toneMapped: false }), tint = new THREE.MeshBasicMaterial({ color: 0x5a1a70, toneMapped: false }); cl.traverse((m) => { if (m.isMesh) m.material = m.geometry.parameters?.depth < 0.005 ? tint : neon; }); onEyes.add(cl); } onEyes.visible = false;   // lenses ~0.085 in front of the eye bones: over the bangs
  const neck = VEX.bpos('neck'), glowM = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const glow = [];
  { const n1 = VEX.attach('upperChest', [neck.x, neck.y - 0.05, neck.z + 0.01]); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.006, 6, 28), glowM(0xff4fd8)); ring.rotation.x = PI / 2 - 0.35; ring.scale.set(1, 1.15, 1); n1.add(ring); glow.push(n1);
    const n2 = VEX.attach('upperChest', [neck.x, neck.y - 0.07, neck.z + 0.02]); const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.006, 6, 28), glowM(0x4ff0ff)); ring2.rotation.x = PI / 2 - 0.45; ring2.scale.set(1, 1.2, 1); n2.add(ring2); glow.push(n2);
    for (const side of ['left', 'right']) { const hb = VEX.bpos(side + 'Hand'), s = side === 'left' ? 1 : -1, g = VEX.attach(side + 'LowerArm', [hb.x - s * 0.05, hb.y, hb.z]); const b = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.005, 6, 18), glowM(side === 'left' ? 0x9cff4f : 0xffd43b)); b.rotation.y = PI / 2; g.add(b); glow.push(g); } }
  glow.forEach((g) => (g.visible = false));
  const discos = [0xff3fd0, 0x3fe0ff, 0xffd43b].map((c) => { const L = new THREE.PointLight(c, 0, 5, 1.5); scene.add(L); return L; });
  const fill = new THREE.PointLight(0xfff0e8, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064: the previous pose is re-evaluated from time, then the arms blend over 0.28 s
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.1) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const DOM = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t, 0.03), ...x });   // dominant but big-eyed: a brow arch, barely-lowered lids; NO 'happy' (VRoid's happy closes the eyes into arcs)

  // ---------------------------------------------------------------- FX: pixel hearts
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [T.mommy1, T.mommy2, T.baby].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay + the meme SETUP CARDS (white pixel text at the top)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['WHY WOULD I', 'DECEIVE YOU?'], t0: 0, t1: B.phone.t0 - 0.05, y: 0.13, plain: true, s: 11, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const pop = (a) => (a < 0.05 ? 0.7 : a < 0.1 ? 1.12 : 1);
  const SETUPS = [[['ME: JUST 5 MINUTES', 'ON MY PHONE'], T.phone, T.chapter], [['ME: I READ THE', 'WHOLE CHAPTER'], T.chapter, T.party], [["ME: I'M STAYING IN", 'TONIGHT'], T.party, T.physics], [['ME: I DID MY PHYSICS', 'HOMEWORK MYSELF'], T.physics, T.scribe]].map(([lines, t0, t1]) => {
    const cv = pixelText(lines, { color: '#ffffff', gap: 4 }), s = Math.min(9, Math.floor(980 / cv.width)), el = document.createElement('img'); el.className = 'px'; el.src = cv.toDataURL();
    el.style.width = `${cv.width * s}px`; el.style.height = `${cv.height * s}px`; el.style.left = '540px'; el.style.top = `${0.115 * 1920}px`; ui.appendChild(el); return { el, t0, t1 };
  });
  function setups(t) { for (const c of SETUPS) { const on = t >= c.t0 && t < c.t1; c.el.style.opacity = on ? clamp((c.t1 - t) / 0.1) : 0; if (on) c.el.style.transform = `translate(-50%, -50%) scale(${pop(t - c.t0)})`; } }

  // ---------------------------------------------------------------- the force diagram (problem 1, pi 0): where it sits + its writing range
  const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, F0 = -1, F1 = 0, P1 = 0; const fig = [];
  for (const it of sheet.items) { if (it.pi === 0) { const q = it.kind === 'p' ? it.pts[0] : [it.x, it.y]; if (q[0] < 540) { if (F0 < 0) F0 = acc; F1 = acc + wt(it); fig.push(q); } P1 = acc + wt(it); } acc += wt(it); }
  if (F0 < 0) throw new Error('no FBD on the physics sheet');
  const fx0 = fig.map((q) => q[0]), fy0 = fig.map((q) => q[1]), figC = [(Math.min(...fx0) + Math.max(...fx0)) / 2, (Math.min(...fy0) + Math.max(...fy0)) / 2];
  const total = sheet.total;
  const writeP = (t) => F0 + (F1 - F0) * ease(u01(t, T.drew - 0.1, T.andS - 0.1)) + (total - F1) * 0.6 * u01(t, T.andS - 0.1, T.purple - 0.3);
  void P1;

  // ---------------------------------------------------------------- shots (room coords: the camera at +z looks −z; she stands in the aisle facing +z)
  const VC = { x: 0.0, z: -0.95 };
  const SH = [
    { id: 'hook', t0: 0, vex: (t) => ({ ...VC, pose: 'hip', tilt: 0.12, sway: 0.15, face: DOM(t, { blinkLeft: t > T.mommy1 + 0.3 && t < T.mommy1 + 0.9 ? 1 : 0 }) }), cam: (t) => ({ pos: [0.05, 1.5, 0.4 - 0.3 * u01(t, 0, T.phone)], look: [0.0, 1.38, -0.95], fov: 44 }) },
    { id: 'phone', t0: T.phone, vex: (t) => ({ ...VC, pose: 'phone', tilt: 0.15, nod: 0.2, look: [0.1, -0.5], sway: 0.12, hands: { R: 'hold' }, face: DOM(t) }), p: [[0.3, 1.32, 0.9], [0.22, 1.32, 0.7]], a: [[0.0, 1.22, -0.95], [0.0, 1.24, -0.95]], fov: 48, hold: 'phone' },
    { id: 'clock', t0: T.my + 0.7, cam: () => ({ pos: [0.05, 3.25, -3.55], look: [0.0, 3.55, -4.87], fov: 34 }) },
    { id: 'phone2', t0: T.why1 - 0.1, vex: (t) => ({ ...VC, pose: 'phone', tilt: -0.08, sway: 0.1, hands: { R: 'hold' }, face: DOM(t) }), cam: () => ({ pos: [0.02, 1.57, -0.25], look: [0.0, 1.52, -0.95], fov: 40 }), hold: 'phone' },
    { id: 'chap', t0: T.chapter, vex: (t) => ({ ...VC, pose: 'hip', tilt: 0.1, sway: 0.18, face: DOM(t) }), p: [[-0.35, 1.35, 0.85], [-0.25, 1.35, 0.65]], a: [[0.0, 1.22, -0.95], [0.0, 1.24, -0.95]], fov: 48 },
    { id: 'wrap', t0: T.why2 - 0.1, cam: (t) => { const k = ease(u01(t, T.why2, T.theres)); return { pos: [-1.0, TOP + 0.5 - 0.12 * k, -0.62 - 0.1 * k], look: [-1.2, TOP + 0.03, -1.05], fov: 42 }; } },
    { id: 'reason', t0: T.theres - 0.1, vex: (t) => ({ ...VC, pose: 'cross', tilt: -0.06, sway: 0.08, face: DOM(t, { relaxed: 0.22, blink: lids(t, 0.08) }) }), cam: (t) => ({ pos: [0.02, 1.58, -0.2 - 0.12 * u01(t, T.theres, T.party)], look: [0.0, 1.53, -0.95], fov: 40 }) },
    { id: 'party', t0: T.party, vex: (t) => ({ ...VC, pose: t < T.tonight + 0.3 ? 'hip' : 'wave', tilt: 0.14 * Math.sin(t * 4), sway: 0.3 * Math.sin(t * 3.2), face: DOM(t, { surprised: 0.15 }) }), p: [[0.4, 1.3, 1.0], [0.25, 1.32, 0.75]], a: [[0.0, 1.2, -0.95], [0.0, 1.22, -0.95]], fov: 48, party: 1 },
    { id: 'shades', t0: T.why3 - 0.15, vex: (t) => ({ ...VC, pose: 'hip', tilt: -0.08, sway: 0.06, face: DOM(t) }), cam: (t) => ({ pos: [0.02, 1.57, -0.08 - 0.12 * u01(t, T.why3, T.physics)], look: [0.0, 1.5, -0.95], fov: 42 }), party: 1, shades: 1 },
    { id: 'phys', t0: T.physics, vex: (t) => ({ ...VC, pose: 'peace', tilt: -0.12, sway: 0.18, face: DOM(t, { surprised: 0.12 }) }), p: [[0.3, 1.35, 0.8], [0.2, 1.35, 0.6]], a: [[0.0, 1.24, -0.95], [0.0, 1.26, -0.95]], fov: 48 },
    { id: 'lie', t0: T.okay - 0.15, vex: (t) => ({ ...VC, pose: t < T.lie - 0.6 ? 'cross' : 'shrug', tilt: 0.14, sway: 0.15, face: DOM(t, { happy: t > T.lie - 0.6 ? 0.55 : 0, relaxed: t > T.lie - 0.6 ? 0.05 : 0.15 }) }), cam: (t) => { const k = bump(t, T.lie - 0.7, 1.0); return { pos: [0.05, 1.45, 0.3 - 0.55 * k], look: [0.0, 1.32 + 0.1 * k, -0.95], fov: 44 }; } },
    { id: 'snap', t0: T.scribe, p: [[-0.9, TOP + 0.62, -0.05], [-0.92, TOP + 0.58, -0.1]], a: [[-0.95, TOP + 0.1, -0.45], [-0.95, TOP + 0.1, -0.45]], fov: 46, snap: 1 },
    { id: 'solve', t0: T.scribeW - 0.05, screen: 0.78, mode: 'solve' },
    { id: 'fbd', t0: T.drew - 0.1, macro: 1, write: 1 },
    { id: 'write', t0: T.andS - 0.05, p: [[0.98, TOP + 0.58, -0.3], [0.98, TOP + 0.5, -0.33]], a: [[0.98, TOP, -0.55], [0.98, TOP, -0.55]], fov: 44, write: 1 },
    { id: 'ink', t0: T.purple - 0.2, screen: 0.78, mode: 'ink' },
    { id: 'end', t0: T.end, vex: (t) => ({ ...VC, pose: t > T.baby - 0.15 ? 'kissOut' : 'kiss', tilt: -0.12, sway: 0.18, face: DOM(t, { blinkLeft: t > T.baby + 0.2 ? 1 : 0 }) }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.05, 1.45 + 0.04 * k, 0.6 - 0.75 * k], look: [0.0, 1.3 + 0.14 * k, -0.95], fov: 46 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(0, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.06 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipW = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.33, (0.5 - tip[1] / sheet.h) * 0.427, 0); sheetM.updateWorldMatrix(true, false); return sheetM.localToWorld(v); };

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k);
    else if (sh.macro) { sheet.draw(writeP(t)); const c = tipW(figC); cam = { pos: [c.x + 0.02, c.y + 0.3 - 0.04 * k, c.z + 0.09], look: [c.x, c.y, c.z], fov: 40 }; }
    else if (sh.cam) cam = sh.cam(t);
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.24 * Math.pow(d, 1.6)) : 0.1; }
    drawClock(4 + 3.2 * ease(u01(t, T.my + 0.75, T.why1 - 0.2)));
    if (sh.mode === 'ink' || t >= T.purple - 0.2) drawScreen('ink', u01(t, T.purple - 0.3, T.purple + 0.6)); else drawScreen('solve', u01(t, T.scribeW - 0.05, T.drew - 0.2));
    const tip = sheet.draw(writeP(t));
    VEX.root.visible = !!sh.vex;
    glow.forEach((g) => (g.visible = !!sh.party)); onEyes.visible = !!sh.shades && t > T.why3 - 0.05; GM.shades.visible = !onEyes.visible;
    discos.forEach((L, i) => { L.intensity = sh.party ? 2.2 : 0; const a = t * 2.2 + i * 2.1; L.position.set(Math.cos(a) * 1.3, 2.1 + 0.3 * Math.sin(t * 3 + i), -0.95 + Math.sin(a) * 1.0); });
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); VEX.root.updateMatrixWorld(true); }
    fx(t, !!sh.vex);
    phone.visible = !!(sh.vex && sh.hold === 'phone');
    if (phone.visible) { const hR = VEX.bpos('rightHand'); phone.position.copy(hR).add(V(-0.02, 0.06, 0.03)); phone.rotation.set(-0.5, 0.25, 0); }
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(sh.macro ? 0.02 : 0.05); pen.glow.material.opacity = sh.macro ? 0.5 : 1;
    if (sh.write) { const p = tipW(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(-0.35, 0, -0.3); }
    snap.visible = sh.snap === 1; LIB.lampShades.forEach((m) => (m.visible = !sh.snap));   // the green shade sat between the lens and the page
    if (sh.snap) { const sw = [-0.95, TOP, -0.45], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = T.snapped + 0.15; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    pixel.set(Math.max(sh.screen ? 1 : sh.write ? 2 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t); setups(t);
  }
  update(0);
  return { update };
}
