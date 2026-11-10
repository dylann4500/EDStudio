// 071 — "My study feed vs reality" (Scribe lane, anime/pixel look). User via manager (Nov 9): try a LIGHTER persona — no mommy/baby
// lines, no sighs, Vex confident, funny and a bit teasing (the look carries it); a real trend; a new place + format; a Scribe feature
// not shown yet; the less-breathy voice settings; voices alternate (Dolly here).
//   trend   = "Me vs My Insta Feed" (TikTok, late Oct–Nov 2026, trendhaus.ai: creators contrast their curated feed with real life);
//   format  = MY FEED / REALITY pairs: the feed shots sit in a generic social-post frame (avatar, likes, caption — no real app's
//             branding) with a warm filter; the reality shots are flat and unfiltered, with the mess;
//   place   = her apartment (engine/sets/livingroom.js, 016): a staged study corner at the dining table vs the sofa side;
//   feature = README §The panels: Page style → Paper ("white and ruled, blank, or a yellow legal pad") — the homework comes out in her
//             hand on a yellow legal pad ("because it looks expensive"); the math pack (049's calculus sheet).
// Guardrails: flirty-confident for an 18+ college audience, swimwear only, no kink lines, no promises, no claims about real people.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { makePen, makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, layoutHand } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';

const PI = Math.PI, PIXEL = 4;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));

// 067's chest shading pass (soft rose strokes multiplied onto the body atlas once; same coverage)
async function shadeBody(url) {
  const img = await loadImg(url), W = img.width, S = W / 2048;
  const c = document.createElement('canvas'); c.width = W; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const L = document.createElement('canvas'); L.width = W; L.height = img.height; const l = L.getContext('2d');
  l.fillStyle = '#fff'; l.fillRect(0, 0, W, img.height); l.scale(S, S); l.lineCap = 'round';
  const stroke = (pts, w, blur, col, a) => { l.save(); l.filter = `blur(${blur * S}px)`; l.globalAlpha = a; l.strokeStyle = col; l.lineWidth = w; l.beginPath(); pts.forEach(([x, y], i) => (i ? l.lineTo(x, y) : l.moveTo(x, y))); l.stroke(); l.restore(); };
  const arc = (cx, cy, rx, ry, a0, a1, w, blur, col, a) => { const P = []; for (let i = 0; i <= 24; i++) { const t = a0 + (a1 - a0) * i / 24; P.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } stroke(P, w, blur, col, a); };
  stroke([[1023, 495], [1021, 560], [1023, 622]], 12, 9, '#b06878', 0.5); stroke([[1023, 548], [1022, 590], [1023, 618]], 2.6, 1.2, '#8e4858', 0.7);
  stroke([[892, 440], [1006, 620]], 16, 10, '#b87884', 0.38); stroke([[1156, 440], [1040, 620]], 16, 10, '#b87884', 0.38);
  arc(852, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42); arc(1196, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42);
  arc(852, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45); arc(1196, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45);
  g.globalCompositeOperation = 'multiply'; g.drawImage(L, 0, 0);
  return c.toDataURL('image/png');
}

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    morning: B.morning.t0, real1: W('morning', 'reality'), woke: W('morning', 'woke'), notes: B.notes.t0, real2: W('notes', 'reality'), says: W('notes', 'says'),
    snacks: B.snacks.t0, real3: W('snacks', 'reality'), from: W('snacks', 'from'), turn: B.turn.t0, looks: W('turn', 'looks'),
    scribe: B.scribe.t0, andS: W('scribe', 'and'), yellow: W('scribe', 'yellow'), because: W('scribe', 'because'),
    end: B.end.t0, honestly: W('end', 'honestly'), tryW: W('end', 'try'), up: W('end', 'up'),
  };
  T.card = T.up + 0.55;

  // ---------------------------------------------------------------- her apartment (016's living room + dining area)
  const LR = buildLivingRoom(studio); const R = LR.root, D = LR.D;
  LR.diningChairs.forEach((c, i) => { if (i === 1 || i === 2) c.visible = false; });   // she stands where the two back chairs were
  const pendMeshes = []; R.traverse((o) => { if (o.isMesh && o.getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(D.dining[0], 2.1, D.dining[1])) < 0.6) pendMeshes.push(o); });   // the dining pendant (it sat behind the hook title)
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const DT = D.diningTop, [DX, DZ] = D.dining;
  // the FEED corner (dining table): pillar candles, a matcha latte, peonies, pastel highlighters, colour-coded notes, the laptop, the pad
  const flameT = crisp(64, 64, (g) => { const gr = g.createRadialGradient(32, 40, 2, 32, 36, 28); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.4, 'rgba(255,190,90,.9)'); gr.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const flames = [];
  for (const [x, z, h] of [[DX - 0.62, DZ - 0.25, 0.16], [DX - 0.5, DZ - 0.32, 0.11], [DX - 0.68, DZ - 0.12, 0.08]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 14), toon(0xf6efe4)); c.position.set(x, DT + h / 2, z); R.add(c);
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); f.position.set(x, DT + h + 0.03, z); f.scale.set(0.045, 0.07, 1); R.add(f); flames.push(f); }
  { const L = new THREE.PointLight(0xffb070, 0.9, 2.5, 1.6); L.position.set(DX - 0.55, DT + 0.45, DZ + 0.2); R.add(L); }
  const matcha = new THREE.Group(); matcha.position.set(DX + 0.55, DT, DZ + 0.28); R.add(matcha);
  { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.09, 16), toon(0xf4f0e8)); cup.position.y = 0.045; matcha.add(cup); const top = new THREE.Mesh(new THREE.CircleGeometry(0.041, 16), new THREE.MeshLambertMaterial({ map: crisp(64, 64, (g) => { g.fillStyle = '#8fbf5a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#f6f2e0'; g.beginPath(); g.moveTo(32, 50); g.bezierCurveTo(8, 30, 20, 10, 32, 24); g.bezierCurveTo(44, 10, 56, 30, 32, 50); g.fill(); }) })); top.rotation.x = -PI / 2; top.position.y = 0.088; matcha.add(top);
    const sau = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.008, 18), toon(0xf4f0e8)); matcha.add(sau); }
  { const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.16, 12), new THREE.MeshLambertMaterial({ color: 0xd8eef0, transparent: true, opacity: 0.6 })); vase.position.set(DX + 0.6, DT + 0.08, DZ - 0.3); R.add(vase);
    for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), toon([0xf6a6c8, 0xf8c8dc, 0xf08ab0][i % 3])); f.position.set(DX + 0.6 + Math.cos(i * 1.3) * 0.05, DT + 0.22 + (i % 2) * 0.04, DZ - 0.3 + Math.sin(i * 1.3) * 0.05); R.add(f); } }
  { const bowl = new THREE.Group(); bowl.position.set(DX + 0.36, DT, DZ + 0.4); R.add(bowl);   // healthy study snacks: strawberries, blueberries, almonds
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 10, 0, 2 * PI, PI / 2, PI / 2), new THREE.MeshToonMaterial({ color: 0xf4f0e8, side: THREE.DoubleSide })); b.position.y = 0.075; bowl.add(b);
    for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.032, 8), toon(0xe0303a)); s.rotation.x = PI; s.position.set(Math.cos(i) * 0.035, 0.085, Math.sin(i) * 0.035); bowl.add(s); const l = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.008, 5), toon(0x3a8a3a)); l.position.set(Math.cos(i) * 0.035, 0.1, Math.sin(i) * 0.035); bowl.add(l); }
    for (let i = 0; i < 9; i++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), toon(0x3a3a8a)); bb.position.set(Math.cos(i * 2.1) * 0.05, 0.08 + (i % 2) * 0.006, Math.sin(i * 2.1) * 0.05); bowl.add(bb); }
    for (let i = 0; i < 5; i++) { const al = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), toon(0xc89a6a)); al.scale.set(1.5, 0.7, 1); al.position.set(-0.02 + i * 0.012, 0.087, 0.03 - (i % 2) * 0.02); bowl.add(al); } }
  ['#ffb3c8', '#ffe28a', '#a8e6c8', '#b8c8ff', '#e0b8ff'].forEach((c, i) => { const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.1, 3, 8), toon(new THREE.Color(c).getHex())); h.rotation.set(0, 0.2 + i * 0.05, PI / 2); h.position.set(DX - 0.2 + i * 0.03, DT + 0.01, DZ + 0.38 - i * 0.012); R.add(h); });
  const notesT = crisp(1024, 1325, (g, w, h) => { g.fillStyle = '#fffdf8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6e0f0'; g.lineWidth = 2; for (let y = 160; y < h; y += 46) { g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke(); }
    const heads = [['Cell Biology', '#ffb3c8'], ['Mitosis vs Meiosis', '#a8e6c8'], ['Key terms', '#b8c8ff']]; let y = 120;
    heads.forEach(([s, c]) => { g.fillStyle = c; g.beginPath(); g.roundRect(60, y - 34, 520, 48, 22); g.fill(); g.fillStyle = '#3a3048'; g.font = 'italic 600 34px Georgia, serif'; g.fillText(s, 80, y); y += 70;
      for (let i = 0; i < 4; i++) { g.fillStyle = '#6a6078'; g.fillRect(90, y - 12, 520 + (i % 2) * 220, 6); g.fillStyle = '#ffe28a'; if (i === 1) g.fillRect(88, y - 22, 240, 22); y += 46; } y += 40; });
    g.fillStyle = '#f6a6c8'; g.font = '48px serif'; g.fillText('✿', w - 140, 130); });
  const notesM = plane(R, 0.3, 0.3 * 1325 / 1024, lam({ map: notesT }), DX - 0.15, DT + 0.004, DZ + 0.12, 0, -PI / 2); notesM.rotation.z = -0.12;
  // the homework on a YELLOW LEGAL PAD: the math sheet multiplied onto legal-pad paper (yellow, blue rules, a red double margin)
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'math', { name: 'Vex' });
  const padT = crisp(sheet.w, sheet.h); let padKey = -1;
  function drawPad(p) { const tip = sheet.draw(p), key = Math.round(p * 6); if (key === padKey) return tip; padKey = key; const g = padT.canvas.getContext('2d'), w = sheet.w, h = sheet.h;
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#fbea8e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,130,200,.45)'; g.lineWidth = 2; for (let y = 286; y < h; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(210,70,70,.55)'; g.lineWidth = 2; for (const x of [92, 100]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.globalCompositeOperation = 'multiply'; g.drawImage(sheet.canvas, 0, 0); g.globalCompositeOperation = 'source-over'; padT.needsUpdate = true; return tip; }
  drawPad(sheet.total);
  const padM = plane(R, 0.33, 0.427, lam({ map: padT }), DX + 0.22, DT + 0.004, DZ + 0.1, 0, -PI / 2); padM.rotation.z = 0.06;
  bx(R, 0.34, 0.01, 0.04, toon(0x3a3a48), DX + 0.22, DT + 0.006, DZ - 0.12);   // the pad's binding strip
  const pen = makePen(); R.add(pen.g);
  // the Scribe screen on her laptop: Page style → Paper (White · ruled / Blank / Yellow legal pad)
  const scrT = crisp(1280, 800), X0 = 345, X1 = 935, RED = '#9a1c25';
  const handLine = layoutHand(G, 'x sin x + cos x + C', { x: 0, y: 0, u: 40, seed: 6 });
  let scrKey = -1;
  function drawScreen(k) {
    const sel = k > 0.45 ? 2 : 0; if (sel === scrKey) return; scrKey = sel;
    const g = scrT.canvas.getContext('2d'), w = 1280, h = 800;
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, X0 - 10, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', X0 + 48, 52);
    g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.roundRect(X0 - 20, 105, X1 - X0 + 40, 660, 22); g.fill(); g.stroke();
    g.fillStyle = '#1d1d1d'; g.font = '600 36px Inter, Arial'; g.fillText('Page style', X0 + 10, 165); g.fillStyle = '#888'; g.font = '600 22px Inter, Arial'; g.fillText('PAPER', X0 + 10, 215);
    [['White · ruled', '#ffffff', true], ['Blank', '#ffffff', false], ['Yellow legal pad', '#fbea8e', true]].forEach(([name, col, ruled], i) => {
      const x = X0 + 10 + i * 196, y = 240; g.fillStyle = col; g.strokeStyle = i === sel ? RED : 'rgba(0,0,0,.18)'; g.lineWidth = i === sel ? 7 : 2; g.beginPath(); g.roundRect(x, y, 170, 220, 10); g.fill(); g.stroke();
      if (ruled) { g.strokeStyle = 'rgba(90,130,200,.5)'; g.lineWidth = 2; for (let yy = y + 40; yy < y + 210; yy += 22) { g.beginPath(); g.moveTo(x + 8, yy); g.lineTo(x + 162, yy); g.stroke(); } }
      if (i === 2) { g.strokeStyle = 'rgba(210,70,70,.6)'; for (const dx of [26, 30]) { g.beginPath(); g.moveTo(x + dx, y + 6); g.lineTo(x + dx, y + 214); g.stroke(); } }
      g.fillStyle = '#1d1d1d'; g.font = `${i === sel ? 700 : 500} 22px Inter, Arial`; g.textAlign = 'center'; g.fillText(name, x + 85, y + 252); g.textAlign = 'left'; });
    g.fillStyle = sel === 2 ? '#fbea8e' : '#ffffff'; g.fillRect(X0 + 4, 540, X1 - X0 - 8, 200); g.strokeStyle = 'rgba(90,130,200,.45)'; g.lineWidth = 2; for (let yy = 590; yy < 740; yy += 44) { g.beginPath(); g.moveTo(X0 + 8, yy); g.lineTo(X1 - 8, yy); g.stroke(); }
    g.fillStyle = '#888'; g.font = '500 20px Inter, Arial'; g.fillText('Preview', X0 + 18, 572); for (const it of handLine) g.drawImage(it.c, X0 + 40 + it.x, 620 + it.y, it.w, it.h);
    scrT.needsUpdate = true;
  }
  drawScreen(0);
  const laptop = makeLaptop(scrT, icon); laptop.g.position.set(DX + 0.05, DT, DZ - 0.28); laptop.g.rotation.y = 0.3; laptop.g.scale.setScalar(0.8); R.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  // the REALITY side (sofa + coffee table): cold pizza (Tuesday), cans, a blanket heap, laundry, a closed laptop with ONE sticky note
  const C0 = D.coffee, CT = D.coffeeTop;
  const pizza = new THREE.Group(); pizza.position.set(C0[0] + 0.15, CT, C0[1] + 0.05); pizza.rotation.y = 0.3; R.add(pizza);
  { const card = toon(0xd8c098); bx(pizza, 0.42, 0.012, 0.42, card, 0, 0.006, 0); const lid = new THREE.Group(); lid.position.set(0, 0.012, -0.21); pizza.add(lid); const lt = bx(lid, 0.42, 0.012, 0.42, new THREE.MeshLambertMaterial({ map: crisp(128, 128, (g) => { g.fillStyle = '#d8c098'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#c0392b'; g.font = '800 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('PIZZA', 64, 60); g.fillStyle = '#1a1a1a'; g.font = '700 22px Inter, Arial'; g.fillText('HOT & FRESH', 64, 92); }) }), 0, 0, 0.21); lid.rotation.x = -1.9; void lt;
    const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 3, 1, false, 0, PI / 3), toon(0xf0c060)); slice.position.set(0.02, 0.02, 0.02); pizza.add(slice);
    for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), toon(0xa83a2a)); p.position.set(0.06 + (i % 2) * 0.03, 0.028, 0.06 + Math.floor(i / 2) * 0.03); pizza.add(p); }
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.06), new THREE.MeshBasicMaterial({ map: crisp(128, 80, (g) => { g.fillStyle = '#fff36a'; g.fillRect(0, 0, 128, 80); g.fillStyle = '#1a1a1a'; g.font = '700 34px "Comic Sans MS", Arial'; g.textAlign = 'center'; g.fillText('TUE', 64, 52); }), toneMapped: false })); tag.rotation.x = -PI / 2; tag.position.set(-0.12, 0.014, 0.12); pizza.add(tag); }
  for (const [x, z] of [[C0[0] - 0.3, C0[1] - 0.1], [C0[0] - 0.22, C0[1] + 0.12], [C0[0] + 0.45, C0[1] - 0.15]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 12), toon(0x3a8ad8)); c.position.set(x, CT + 0.06, z); R.add(c); }
  const shut = new THREE.Group(); shut.position.set(C0[0] - 0.45, CT, C0[1] + 0.05); shut.rotation.y = -0.2; R.add(shut);
  { bx(shut, 0.36, 0.024, 0.25, toon(0xc9cdd3), 0, 0.012, 0); const st = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ map: crisp(256, 256, (g) => { g.fillStyle = '#fff36a'; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, 256, 30); g.fillStyle = '#1a1a1a'; g.font = '700 54px "Comic Sans MS", "Marker Felt", Arial'; g.textAlign = 'center'; g.fillText('homework', 128, 130); g.font = '800 70px "Comic Sans MS", Arial'; g.fillText('??', 128, 210); }), toneMapped: false })); st.rotation.set(-PI / 2, 0, 0.12); st.position.y = 0.0255; shut.add(st); }
  { const sofaZ = D.sofa[1]; for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), toon([0x8a6ab0, 0x9a7ac0, 0x7a5aa0][i % 3])); b.scale.set(1.2, 0.45, 1); b.position.set(1.3 + i * 0.22, 0.55 + (i % 2) * 0.05, sofaZ + 0.35 + (i % 3) * 0.05); R.add(b); }
    const ac = D.armchair; for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.3), toon([0x2a2a3a, 0xe8e0d0, 0x5a7ab0, 0xc04a5a][i])); l.position.set(ac[0] + (i - 1.5) * 0.08, 0.5 + i * 0.05, ac[1] + 0.05); l.rotation.y = i * 0.6; R.add(l); } }

  // ---------------------------------------------------------------- Vex: 067's look (big eyes, chest shading); a sleep mask for "just woke up"
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  const GM = dressGoth(VEX); scene.add(VEX.root);
  const hd = VEX.bpos('head'), mask = VEX.attach('head', [hd.x, hd.y + 0.15, hd.z + 0.05]); mask.rotation.x = -0.45;
  { const band = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.006, 6, 24, PI), toon(0xf0a8c8)); band.rotation.set(0, 0, 0); mask.add(band); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.07, 4, 10), toon(0xf6b8d4)); m.rotation.z = PI / 2; m.scale.set(1, 1, 0.5); m.position.set(0, 0.0, 0.07); mask.add(m);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0025, 4, 10, PI), toon(0x3a2030)); e.position.set(s * 0.028, -0.004, 0.087); e.rotation.z = PI; mask.add(e); } }
  mask.visible = false;
  const fill = new THREE.PointLight(0xfff0e8, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face (never 'happy' at rest: it closes the eyes)

  // ---------------------------------------------------------------- overlay: title, labels (MY FEED / REALITY), the social-post frame
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['MY STUDY FEED', 'VS REALITY'], t0: 0, t1: B.morning.t0 - 0.05, y: 0.13, plain: true, s: 11, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const mkLabel = (text, color) => { const cv = pixelText(text, { color }), el = document.createElement('img'); el.className = 'px'; el.src = cv.toDataURL(); const s = Math.min(10, Math.floor(700 / cv.width)); el.style.width = `${cv.width * s}px`; el.style.height = `${cv.height * s}px`; el.style.left = '540px'; el.style.top = `${0.1 * 1920}px`; el.style.transform = 'translate(-50%, -50%)'; ui.appendChild(el); return el; };
  const LBL = { feed: mkLabel('MY FEED', '#ffb3d9'), real: mkLabel('REALITY', '#ffd43b') };
  const frame = document.createElement('canvas'); frame.width = 1080; frame.height = 1920; Object.assign(frame.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', pointerEvents: 'none', opacity: 0 }); ui.insertBefore(frame, ui.firstChild);
  const POSTS = ['5am study session. candles + matcha', 'colour-coded everything', 'fuelling the grind', 'homework: done', 'effortless'];   // no emoji: headless Chrome may lack a colour-emoji font
  let frameKey = -1;
  function drawFrame(i, likes) {
    const key = i * 100000 + likes; if (key === frameKey) return; frameKey = key;
    const g = frame.getContext('2d'); g.clearRect(0, 0, 1080, 1920);
    g.fillStyle = 'rgba(255,255,255,.96)'; g.beginPath(); g.rect(0, 0, 1080, 1920); g.roundRect(60, 330, 960, 1130, 30); g.fill('evenodd');
    const av = g.createLinearGradient(80, 262, 136, 318); av.addColorStop(0, '#ff8ac8'); av.addColorStop(1, '#8a5aff'); g.fillStyle = av; g.beginPath(); g.arc(110, 290, 30, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('V', 110, 301); g.textAlign = 'left';
    g.fillStyle = '#1a1a1a'; g.font = '700 32px Inter, Arial'; g.fillText('vex.studies', 158, 302); g.fillStyle = '#888'; g.font = '700 36px Inter, Arial'; g.fillText('•••', 950, 300);
    const heart = (x, y, s) => { g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.4, y, x - s * 0.6, y - s * 0.9, x, y - s * 0.25); g.bezierCurveTo(x + s * 0.6, y - s * 0.9, x + s * 1.4, y, x, y + s * 0.9); g.fill(); };
    g.fillStyle = '#ff3b5c'; heart(110, 1508, 26); g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; g.beginPath(); g.arc(196, 1506, 24, 0.5, 2 * PI - 0.2); g.stroke(); g.beginPath(); g.moveTo(262, 1520); g.lineTo(300, 1490); g.lineTo(276, 1530); g.closePath(); g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = '700 28px Inter, Arial'; g.fillText(`${likes.toLocaleString('en-US')} likes`, 84, 1580); g.font = '600 28px Inter, Arial'; g.fillText('vex.studies', 84, 1624); g.font = '400 28px Inter, Arial'; g.fillText(POSTS[i], 256, 1624);
  }
  const glCanvas = studio.renderer.domElement;
  const FILTER = { feed: 'saturate(1.3) sepia(0.14) brightness(1.06) contrast(0.94)', real: 'saturate(0.7) contrast(1.08) brightness(0.95)' };

  // ---------------------------------------------------------------- shots (the camera looks −z; she faces +z). side: 'feed' | 'real'
  const VF = { x: DX, z: DZ - 0.72 }, VR = { x: 1.55, z: -1.35 };
  const SH = [
    { id: 'hook', t0: 0, side: null, vex: (t) => ({ ...VF, pose: 'hip', tilt: 0.12, sway: 0.15, face: CONF(t) }), cam: (t) => ({ pos: [DX + 0.05, 1.46, 0.25 - 0.2 * u01(t, 0, T.morning)], look: [DX, 1.38, VF.z], fov: 44 }) },
    { id: 'feed1', t0: T.morning, side: 'feed', post: 0, vex: (t) => ({ ...VF, pose: 'kiss', tilt: -0.12, sway: 0.12, face: CONF(t, { relaxed: 0.2 }) }), p: [[DX - 0.35, 1.3, 0.55], [DX - 0.25, 1.32, 0.4]], a: [[DX - 0.05, 1.12, VF.z], [DX - 0.05, 1.15, VF.z]], fov: 48 },
    { id: 'real1', t0: T.real1 - 0.1, side: 'real', vex: (t) => ({ ...VR, pose: t < T.woke - 0.3 ? 'hairflip' : 'shrug', tilt: 0.16, nod: 0.05, sway: 0.08, face: CONF(t, { relaxed: 0.35, surprised: t < T.real1 + 1.0 ? 0.35 : 0, blink: lids(t, 0.25) }) }), p: [[VR.x - 0.15, 1.32, 0.8], [VR.x - 0.1, 1.34, 0.6]], a: [[VR.x, 1.22, VR.z], [VR.x, 1.25, VR.z]], fov: 48, sleepy: 1 },
    { id: 'feed2', t0: T.notes, side: 'feed', post: 1, p: [[DX - 0.12, DT + 0.55, DZ + 0.42], [DX - 0.13, DT + 0.47, DZ + 0.38]], a: [[DX - 0.15, DT, DZ + 0.12], [DX - 0.15, DT, DZ + 0.12]], fov: 42 },
    { id: 'real2', t0: T.real2 - 0.1, side: 'real', p: [[C0[0] - 0.4, CT + 0.5, C0[1] + 0.38], [C0[0] - 0.42, CT + 0.42, C0[1] + 0.32]], a: [[C0[0] - 0.45, CT + 0.03, C0[1] + 0.05], [C0[0] - 0.45, CT + 0.03, C0[1] + 0.05]], fov: 42 },
    { id: 'real2b', t0: T.says + 0.6, side: 'real', vex: (t) => ({ ...VR, pose: 'shrug', tilt: 0.14, sway: 0.12, face: CONF(t, { happy: t > T.notes + 6.6 ? 0.4 : 0 }) }), cam: (t) => ({ pos: [VR.x - 0.05, 1.5, VR.z + 0.95 - 0.2 * u01(t, T.says, T.snacks)], look: [VR.x, 1.4, VR.z], fov: 42 }) },
    { id: 'feed3', t0: T.snacks, side: 'feed', post: 2, p: [[DX + 0.4, DT + 0.46, DZ + 0.8], [DX + 0.41, DT + 0.4, DZ + 0.72]], a: [[DX + 0.4, DT + 0.06, DZ + 0.38], [DX + 0.41, DT + 0.06, DZ + 0.38]], fov: 42 },
    { id: 'real3', t0: T.real3 - 0.1, side: 'real', p: [[C0[0] + 0.12, CT + 0.62, C0[1] + 0.5], [C0[0] + 0.14, CT + 0.52, C0[1] + 0.42]], a: [[C0[0] + 0.15, CT + 0.02, C0[1] + 0.05], [C0[0] + 0.15, CT + 0.02, C0[1] + 0.05]], fov: 44 },
    { id: 'real3b', t0: T.from - 0.05, side: 'real', vex: (t) => ({ ...VR, pose: 'peace', tilt: -0.12, sway: 0.15, face: CONF(t, { happy: 0.3 }) }), p: [[VR.x + 0.2, 1.36, 0.6], [VR.x + 0.15, 1.38, 0.45]], a: [[VR.x, 1.26, VR.z], [VR.x, 1.28, VR.z]], fov: 46 },
    { id: 'turnA', t0: T.turn, side: 'feed', post: 3, pad: 1, p: [[DX + 0.22, DT + 0.58, DZ + 0.42], [DX + 0.22, DT + 0.52, DZ + 0.38]], a: [[DX + 0.22, DT, DZ + 0.1], [DX + 0.22, DT, DZ + 0.1]], fov: 44 },
    { id: 'turnB', t0: T.looks + 0.4, side: 'real', pad: 1, p: [[DX + 0.22, DT + 0.58, DZ + 0.42], [DX + 0.22, DT + 0.52, DZ + 0.38]], a: [[DX + 0.22, DT, DZ + 0.1], [DX + 0.22, DT, DZ + 0.1]], fov: 44 },
    { id: 'write', t0: T.scribe, side: null, macro: 1, write: 1 },
    { id: 'paper', t0: T.andS - 0.05, side: null, screen: 0.8 },
    { id: 'expensive', t0: T.because - 0.1, side: null, vex: (t) => ({ ...VF, pose: 'hairflip', tilt: -0.14, sway: 0.15, face: CONF(t, { relaxed: 0.2, blinkLeft: t > T.because + 0.5 ? 1 : 0 }) }), cam: (t) => ({ pos: [DX + 0.05, 1.5, VF.z + 0.95 - 0.2 * u01(t, T.because, T.end)], look: [DX, 1.42, VF.z], fov: 42 }) },
    { id: 'end', t0: T.end, side: 'feed', post: 4, vex: (t) => ({ ...VF, pose: t > T.tryW - 0.2 ? 'point' : t > T.honestly - 0.2 ? 'shrug' : 'hip', tilt: -0.12, sway: 0.18, face: CONF(t, { happy: t > T.honestly && t < T.tryW ? 0.35 : 0, blinkLeft: t > T.up ? 1 : 0 }) }), cam: (t) => { const k = bump(t, T.tryW - 0.1, 0.9); return { pos: [DX + 0.05, 1.42 + 0.06 * k, 0.55 - 0.6 * k], look: [DX, 1.24 + 0.16 * k, VF.z], fov: 46 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(0, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.06 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipW = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.33, (0.5 - tip[1] / sheet.h) * 0.427, 0); padM.updateWorldMatrix(true, false); return padM.localToWorld(v); };
  const total = sheet.total;
  const writeP = (t) => (t >= T.scribe && t < T.andS - 0.05 ? total * (0.3 + 0.7 * u01(t, T.scribe, T.andS - 0.1)) : total);
  let mode = '';

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    const want = sh.side === 'real' ? 'dinner' : 'evening'; if (want !== mode) { LR.setMode(want); mode = want; }
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k);
    else if (sh.macro) { const tip = drawPad(writeP(t)), c = tipW(tip); cam = { pos: [c.x + 0.03, c.y + 0.26 - 0.03 * k, c.z + 0.1], look: [c.x, c.y, c.z], fov: 40 }; }
    else if (sh.cam) cam = sh.cam(t);
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.24 * Math.pow(d, 1.6)) : 0.12; }
    const tip = drawPad(writeP(t));
    drawScreen(u01(t, T.yellow - 0.3, T.yellow + 0.4));
    VEX.root.visible = !!sh.vex; pendMeshes.forEach((o) => (o.visible = sh.id !== 'hook'));
    mask.visible = !!sh.sleepy; GM.shades.visible = !sh.sleepy;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); }
    flames.forEach((f, i) => f.scale.set(0.045 + 0.006 * Math.sin(t * 13 + i), 0.07 + 0.01 * Math.sin(t * 9 + i * 2), 1));
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(0.02); pen.glow.material.opacity = 0.5;
    if (sh.write) { const p = tipW(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(-0.4, 0, -0.3); }
    // the feed vs reality layer: filter on the 3-D picture, the post frame on feed shots, the label on top
    glCanvas.style.filter = sh.side ? FILTER[sh.side] : 'none';
    const inPost = sh.side === 'feed' && t >= T.morning; frame.style.opacity = inPost ? 1 : 0;
    if (inPost) drawFrame(sh.post, Math.round([2481, 3107, 1876, 4520, 9999][sh.post] * (0.6 + 0.4 * ease(k))));
    LBL.feed.style.opacity = sh.side === 'feed' && t < T.card ? 1 : 0; LBL.real.style.opacity = sh.side === 'real' ? 1 : 0;
    pixel.set(Math.max(sh.screen ? 1 : sh.write ? 2 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
