// 072 — "How an AI data center actually works" (Scribe lane, anime/pixel look). User via manager (Nov 9): "explainer vids are really
// good… like data centers… with goth mommy, because it's just funny when she's the character." Vex explains with TRUE numbers
// (sources in caption.md's comment), props + diagrams around her, cutaways, quick cuts; then the pivot to Scribe.
//   place   = an AI data hall (the cold aisle between two rows of liquid-cooled racks, LEDs, cable trays, red/blue coolant pipes) +
//             the campus outside at dusk (long halls, a substation, box cooling towers steaming);
//   facts   = a GB200 NVL72 rack: 72 GPUs, ~132 kW (HPE) ≈ 111 average US homes (EIA 2024: 10,400 kWh/yr = 1.19 kW); a 1 GW campus ≈
//             800,000+ homes; almost all the power ends as heat, carried out by liquid loops to cooling towers; a median Gemini text
//             prompt = 0.24 Wh + 0.26 mL ≈ five drops (Google, arXiv 2508.15734); US data centers = 4.4 % of US power in 2023 (LBNL/DOE,
//             on the homework page);
//   diagrams= low-res pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated): 111 houses lighting up per rack, a
//             counter to 800,000, a steaming chat bubble, a battery + five drops;
//   Scribe  = the page WRITES ITSELF ON THE PHONE SCREEN (user rule, Nov 9: never a pencil on paper by itself), stroke by stroke with an
//             on-screen pen cursor, then SHUFFLE (README §The writing desk: "Shuffle sets it out another way at once") — the same
//             answers laid out another way. Homework: AI demand shifts the GPU market (FIG.market demand-right) + the homes math.
//   persona = the lighter 071 tone with a few teasing lines ("Cute.", "Class dismissed."); Fish "Mommy", less-breathy settings.
// Guardrails: flirty-confident for an 18+ college audience, swimwear only, no kink lines, no promises, no claims about real people.
// Props rule (Nov 9): nothing handheld here (the phone stands on a cart; the tray is part of the rack).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { FIG } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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
    hook: 0, rack: B.rack.t0, gpus: W('rack', 'gpus'), andR: W('rack', 'and'), thats: W('rack', 'thats'), oneRack: W('rack', 'rack'),
    campus: B.campus.t0, thats2: W('campus', 'thats'), heat: B.heat.t0, liquid: W('heat', 'liquid'), so: W('heat', 'so'), warm: W('heat', 'warm'),
    pivot: B.pivot.t0, cute: W('pivot', 'cute'), scribe: B.scribe.t0, graph: W('scribe', 'graph'), hit: W('scribe', 'hit'), shuffle: W('scribe', 'shuffle'),
    prompt: B.prompt.t0, quarter: W('prompt', 'quarter'), five: W('prompt', 'five'), end: B.end.t0, dismissed: W('end', 'dismissed'),
  };
  T.card = T.dismissed + 0.55;

  // ---------------------------------------------------------------- the data hall (the cold aisle runs along −z; she faces +z)
  scene.background = new THREE.Color(0x05070c);
  const HALL = new THREE.Group(); scene.add(HALL);
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const floorT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#9aa0a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#7e848c'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillStyle = '#6a7078'; for (let y = 3; y < 14; y += 2) for (let x = 3; x < 14; x += 2) g.fillRect(x, y, 1, 1); }, { k: 1, repeat: [6, 30] });
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(6, 30), lam({ map: floorT })); f.rotation.x = -PI / 2; f.position.set(0, 0, -8); f.receiveShadow = true; HALL.add(f);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(6, 30), lam({ color: 0x14181e })); ceil.rotation.x = PI / 2; ceil.position.set(0, 3.4, -8); HALL.add(ceil);
    for (const x of [-3, 3]) { const wl = new THREE.Mesh(new THREE.PlaneGeometry(30, 3.4), lam({ color: 0x1a1e26 })); wl.rotation.y = x < 0 ? PI / 2 : -PI / 2; wl.position.set(x, 1.7, -8); HALL.add(wl); }
    const end = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), lam({ map: crisp(256, 146, (g, w, h) => { g.fillStyle = '#1a1e26'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3a52'; g.fillRect(96, 50, 64, 96); g.fillStyle = '#58c8ff'; g.font = '700 22px Inter, Arial'; g.textAlign = 'center'; g.fillText('HALL 3 · AI CLUSTER', 128, 34); }) })); end.position.set(0, 1.7, -22); HALL.add(end); }
  // racks: two rows, fronts facing the aisle; each front a pixel texture of 1U sleds; LEDs = one instanced mesh that blinks
  const rackT = pixelTex(16, 40, (g, w, h) => { g.fillStyle = '#16181c'; g.fillRect(0, 0, w, h); for (let y = 1; y < h - 1; y += 3) { g.fillStyle = y % 6 === 1 ? '#262a30' : '#202328'; g.fillRect(1, y, w - 2, 2); g.fillStyle = '#0c0d10'; for (let x = 3; x < w - 3; x += 2) g.fillRect(x, y + 1, 1, 1); } g.fillStyle = '#3a3f48'; g.fillRect(0, 0, 1, h); g.fillRect(w - 1, 0, 1, h); }, { k: 1 });
  const rackSide = toon(0x1c1f24), RZ = [], N = 20, RW = 0.6, RH = 2.25;
  const ledGeo = new THREE.BoxGeometry(0.02, 0.012, 0.012), ledMat = new THREE.MeshBasicMaterial({ toneMapped: false }), LEDS_PER = 30;
  const leds = new THREE.InstancedMesh(ledGeo, ledMat, N * 2 * LEDS_PER); leds.frustumCulled = false; HALL.add(leds);
  const m4 = new THREE.Matrix4(), col = new THREE.Color(), LED_COL = [0x3cff7a, 0x3cb8ff, 0xffb83c];
  let li = 0;
  for (const side of [-1, 1]) for (let i = 0; i < N; i++) {
    const z = -1.0 - i * 0.66, fx = side * 0.45; RZ.push([side, z]);
    const r = new THREE.Mesh(new THREE.BoxGeometry(1.1, RH, RW), [rackSide, rackSide, rackSide, rackSide, rackSide, rackSide]); r.position.set(side * 1.0, RH / 2, z); r.castShadow = r.receiveShadow = true; HALL.add(r);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(RW - 0.04, RH - 0.06), lam({ map: rackT, emissive: 0x18202c })); front.position.set(fx - side * 0.001, RH / 2, z); front.rotation.y = side < 0 ? PI / 2 : -PI / 2; HALL.add(front);
    for (let k = 0; k < LEDS_PER; k++) { const y = 0.15 + (k % 15) * 0.135, dz = k < 15 ? -0.2 : 0.18; m4.makeTranslation(fx - side * 0.006, y, z + dz); leds.setMatrixAt(li, m4); leds.setColorAt(li, col.set(LED_COL[(i + k) % 3])); li++; }
  }
  // overhead: yellow fiber trays + black busway over each row, coolant pipes (blue supply, red return) along the aisle, ceiling light strips
  const flowT = (c1, c2) => { const t = pixelTex(4, 16, (g, w, h) => { for (let y = 0; y < h; y++) { g.fillStyle = y % 8 < 5 ? c1 : c2; g.fillRect(0, y, w, 1); } }, { k: 1, repeat: [1, 30] }); t.wrapT = THREE.RepeatWrapping; return t; };
  const blueT = flowT('#2a6aff', '#7ab0ff'), redT = flowT('#e0302a', '#ff8a6a');
  for (const side of [-1, 1]) { bx(HALL, 0.32, 0.07, 28, toon(0xf2c230), side * 1.0, 2.55, -8); bx(HALL, 0.16, 0.12, 28, toon(0x22252a), side * 1.0, 2.75, -8);
    for (let i = 0; i < 40; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), toon(0x2a6aff)); c.position.set(side * (0.75 + (i % 3) * 0.1), 2.38, -1 - i * 0.33); HALL.add(c); } }
  const pipes = [];
  for (const [x, t] of [[-0.42, blueT], [0.42, redT]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 28, 12), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); p.rotation.x = PI / 2; p.position.set(x, 3.22, -8); HALL.add(p); pipes.push(t); }
  for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 1.4), new THREE.MeshBasicMaterial({ color: 0xdff0ff, toneMapped: false })); s.position.set(0, 3.37, -1.2 - i * 2.4); HALL.add(s); }
  const hemi = new THREE.HemisphereLight(0xa8c8ff, 0x20242c, 0.85); HALL.add(hemi);
  for (let i = 0; i < 4; i++) { const L = new THREE.PointLight(0x9fc8ff, 2.2, 7, 1.6); L.position.set(0, 2.6, -2 - i * 4); HALL.add(L); }
  const key = new THREE.DirectionalLight(0xe8f0ff, 0.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 24 }); scene.add(key, key.target);
  // the hero compute tray, pulled out of a rack on the right row (z −3.64): two boards, four GPU cold plates, coolant tubes
  const HZ = RZ[N + 4][1], tray = new THREE.Group(); tray.position.set(0.45, 1.22, HZ); HALL.add(tray);
  { bx(tray, 0.62, 0.05, 0.56, toon(0x2a2d33), -0.31, 0, 0); const pcb = toon(0x1f6a3a);
    for (const dz of [-0.13, 0.13]) { bx(tray, 0.56, 0.012, 0.22, pcb, -0.31, 0.031, dz); for (const dx of [-0.45, -0.18]) { bx(tray, 0.13, 0.03, 0.13, toon(0xc98a4a, 0x2a1400), dx, 0.052, dz); const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), toon(0x2a6aff)); tb.rotation.z = PI / 2; tb.position.set(dx + 0.12, 0.07, dz - 0.03); tray.add(tb); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), toon(0xe0302a)); tr.rotation.z = PI / 2; tr.position.set(dx + 0.12, 0.07, dz + 0.03); tray.add(tr); }
      bx(tray, 0.08, 0.02, 0.08, toon(0x8a8f98), -0.06, 0.045, dz); }
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ map: crisp(256, 64, (g, w, h) => { g.fillStyle = '#0c0d10'; g.fillRect(0, 0, w, h); g.fillStyle = '#76d84a'; g.font = '700 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('COMPUTE TRAY', w / 2, 42); }), toneMapped: false })); lbl.rotation.x = -PI / 2; lbl.position.set(-0.55, 0.026, 0.2); lbl.rotation.z = PI / 2; tray.add(lbl); }
  // the crash cart in the aisle with the phone on a stand (Scribe writes ON this screen)
  const cart = new THREE.Group(); cart.position.set(0.0, 0, -7.6); HALL.add(cart);   // behind where she starts walking: never between the lens and her
  bx(cart, 0.5, 0.04, 0.4, toon(0x2a2d33), 0, 0.95, 0); bx(cart, 0.5, 0.04, 0.4, toon(0x2a2d33), 0, 0.3, 0); for (const [x, z] of [[-0.23, -0.18], [0.23, -0.18], [-0.23, 0.18], [0.23, 0.18]]) bx(cart, 0.03, 0.95, 0.03, toon(0x5a5f68), x, 0.475, z);
  const PW = 0.072, PH = 0.128, phone = new THREE.Group(); phone.position.set(0.0, 1.06, 0.0); phone.rotation.x = -0.12; cart.add(phone);
  bx(phone, PW + 0.008, PH + 0.012, 0.009, toon(0x1a1a20), 0, PH / 2, 0); bx(cart, 0.05, 0.06, 0.05, toon(0x3a3f48), 0, 0.99, -0.02);
  const PHW = 720, PHH = 1280, phT = crisp(PHW, PHH), phScr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.set(0, PH / 2, 0.0047); phone.add(phScr);

  // ---------------------------------------------------------------- the campus outside at dusk (parked far away)
  const CAMP = new THREE.Group(); CAMP.position.set(400, 0, 0); scene.add(CAMP); CAMP.visible = false;
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: crisp(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e1430'); gr.addColorStop(0.42, '#3a2a5a'); gr.addColorStop(0.5, '#ff8a5a'); gr.addColorStop(0.52, '#2a2030'); gr.addColorStop(1, '#14101a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), toneMapped: false })); CAMP.add(sky);
    const gT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#2e3a2a', ['#283424', '#344030', '#3a3a30'], 40, 3), { k: 1, repeat: [40, 40] });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), lam({ map: gT })); ground.rotation.x = -PI / 2; CAMP.add(ground);
    const hallM = lam({ color: 0xd8dce4 }), roofT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#9aa0aa'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3f48'; for (let x = 2; x < w; x += 4) for (let y = 2; y < h; y += 4) g.fillRect(x, y, 2, 2); }, { k: 1, repeat: [6, 16] });
    for (let i = 0; i < 4; i++) { const hx = -60 + i * 40; bx(CAMP, 28, 9, 110, hallM, hx, 4.5, -20); const r = new THREE.Mesh(new THREE.PlaneGeometry(28, 110), lam({ map: roofT })); r.rotation.x = -PI / 2; r.position.set(hx, 9.02, -20); CAMP.add(r);
      for (let w = 0; w < 10; w++) bx(CAMP, 0.4, 1.2, 6, new THREE.MeshBasicMaterial({ color: 0x9fd0ff, toneMapped: false }), hx + 14.05, 4, -70 + w * 11); }
    const cooler = toon(0x6a7078), steamT = crisp(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(235,240,250,.9)'); gr.addColorStop(1, 'rgba(235,240,250,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    CAMP.steam = [];
    for (let i = 0; i < 8; i++) { const cx = -70 + i * 14, cz = 48; bx(CAMP, 10, 7, 10, cooler, cx, 3.5, cz); const fan = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.6, 16), toon(0x2a2d33)); fan.position.set(cx, 7.3, cz); CAMP.add(fan);
      for (let s = 0; s < 4; s++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false })); sp.position.set(cx, 9, cz); CAMP.add(sp); CAMP.steam.push({ sp, cx, cz, ph: (i * 0.37 + s * 0.25) % 1 }); } }
    for (let i = 0; i < 6; i++) { bx(CAMP, 5, 4, 4, toon(0x5a5f68), 90 + (i % 3) * 9, 2, 10 + Math.floor(i / 3) * 9); }
    for (let i = 0; i < 5; i++) { const px = 80 + i * 22; bx(CAMP, 0.6, 26, 0.6, toon(0x8a8f98), px, 13, -60); bx(CAMP, 8, 0.4, 0.4, toon(0x8a8f98), px, 24, -60); }
    const town = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), 900); town.frustumCulled = false; let ti = 0;
    for (let i = 0; i < 900; i++) { const x = -260 + (i % 60) * 9 + hash(i) * 4, z = -170 - Math.floor(i / 60) * 9; m4.makeScale(3, 2 + hash(i + 3) * 2, 3); m4.setPosition(x, 1.2, z); town.setMatrixAt(ti, m4); town.setColorAt(ti, col.set(hash(i * 7) > 0.35 ? 0xffd88a : 0x2a2a34)); ti++; }
    CAMP.add(town);
    const sun = new THREE.DirectionalLight(0xffa070, 1.2); sun.position.set(-100, 40, -200); CAMP.add(sun, sun.target); CAMP.add(new THREE.HemisphereLight(0x6a6aa0, 0x2a2420, 0.9)); }

  // ---------------------------------------------------------------- Scribe: the homework (AI demand shifts the GPU market) + its shuffled twin
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const SHEET = (seed) => makeSheet(G, { rich: true, seed, name: 'Vex', title: 'ECON 1 · PROBLEM SET 7', note: 'Due Friday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 2', problems: [
    { q: '1.  AI data centers buy every GPU they can find. Show the effect\n     on the market for GPUs and explain.', h: 2.1, fig: ({ k, y }) => {
      const M = FIG.market(k, 160, y + 500, { shift: 'demand-right', cause: 'AI demand rises,' }), Wl = [];
      M.R.lines.forEach((s, i) => Wl.push(...k.text(s, 590, y + 214 + i * 50, { u: 22 }))); return [...M, ...Wl]; } },
    { q: '2.  In 2023, US data centers used 176 TWh: 4.4% of US electricity.\n     One AI rack draws 132 kW. How many homes is that? (1 home = 1.19 kW)', h: 0.9, fig: ({ k, y }) => {
      const a = k.text('132 / 1.19 =', 124, y + 140, { u: 28 }), b = k.text('111 homes', k.bbox(a).x1 + 36, y + 140, { u: 28 }); return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
  ] });
  const sheetA = SHEET(7), sheetB = SHEET(23);
  const PX = 30, PY = 168, PWp = 660, PHp = Math.round(660 * sheetA.h / sheetA.w);
  const nib = crisp(64, 64, (g) => { g.save(); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.restore(); }).canvas;
  let phKey = '';
  function drawPhone(sheet, p, mode, k) {   // mode: 'write' | 'done' | 'shuffle'
    const key = `${mode}${Math.round(p * 4)}${Math.round(k * 20)}${sheet === sheetA ? 'a' : 'b'}`; if (key === phKey) return; phKey = key;
    const tip = sheet.draw(p), g = phT.canvas.getContext('2d'), RED = '#9a1c25';
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, PHW, 100); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 100, PHW, 2);
    g.drawImage(icon, 24, 26, 50, 50); g.fillStyle = '#1d1d1d'; g.font = '36px Georgia, serif'; g.fillText('Scribe', 86, 64); g.fillStyle = RED; g.font = '600 20px Inter, Arial'; g.fillText('ECON 1 · PROBLEM SET 7', 24, 140);
    g.fillStyle = '#fff'; g.fillRect(PX - 4, PY - 4, PWp + 8, PHp + 8); g.drawImage(sheet.canvas, PX, PY, PWp, PHp); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PX, PY, PWp, PHp);
    if (mode === 'write') { const cx = PX + tip[0] * PWp / sheet.w, cy = PY + tip[1] * PHp / sheet.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
    const yb = PY + PHp + 20; g.fillStyle = '#1d1d1d'; g.font = '30px Georgia, serif'; g.fillText(mode === 'write' ? 'Writing it in your handwriting…' : 'Done · 2 pages', 24, yb + 30);
    const btn = (x, w, label, accent, pressed) => { g.fillStyle = pressed ? '#2a2a2a' : accent ? RED : '#e8e2d6'; g.beginPath(); g.roundRect(x, yb + 52, w, 60, 30); g.fill(); g.fillStyle = pressed || accent ? '#fff' : '#1d1d1d'; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText(label, x + w / 2, yb + 91); g.textAlign = 'left'; };
    btn(24, 190, 'Shuffle', false, mode === 'shuffle' && k < 0.5); btn(232, 180, 'Replay', false, false); btn(430, 266, 'Export PDF', true, false);
    if (mode === 'shuffle' && k < 0.8) { const cx = 120 + 30 * (1 - ease(clamp(k / 0.3))), cy = yb + 96 + 40 * (1 - ease(clamp(k / 0.3))); g.fillStyle = '#111'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 40); g.lineTo(cx + 11, cy + 30); g.lineTo(cx + 24, cy + 36); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
    phT.needsUpdate = true;
  }
  const totalA = sheetA.total;
  const gItems = sheetA.items.filter((it) => it.pi === 0 && it.kind === 'p').flatMap((it) => it.pts), gx = gItems.map((q) => q[0]), gy = gItems.map((q) => q[1]);
  const graphC = gItems.length ? [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2] : [400, 700];

  // ---------------------------------------------------------------- Vex (067's look)
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face

  // ---------------------------------------------------------------- overlay: title, callouts, the PIXEL DIAGRAM cards (270 × 480, shown ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['HOW AN AI DATA CENTER', 'ACTUALLY WORKS'], t0: 0, t1: B.rack.t0 - 0.05, y: 0.13, plain: true, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const ptxt = (s, color, x, y, sc = 1) => { const cv = pixelText(s, { color }); dctx.drawImage(cv, Math.round(x - cv.width * sc / 2), Math.round(y - cv.height * sc / 2), cv.width * sc, cv.height * sc); };
  const panel = (y0, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(18, y0, 234, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(16, y0 - 2, 238, 2); dctx.fillRect(16, y1, 238, 2); dctx.fillRect(16, y0, 2, y1 - y0); dctx.fillRect(252, y0, 2, y1 - y0); };
  const house = (x, y, lit, s = 1) => { dctx.fillStyle = lit ? '#ffd88a' : '#3a3550'; dctx.fillRect(x, y + 2 * s, 5 * s, 4 * s); dctx.fillRect(x + s, y + s, 3 * s, s); dctx.fillRect(x + 2 * s, y, s, s); if (lit) { dctx.fillStyle = '#ff9a3a'; dctx.fillRect(x + 2 * s, y + 4 * s, s, 2 * s); } };
  let dgKey = '';
  function diagram(t) {
    let id = null, k = 0;
    if (t >= T.thats - 0.1 && t < T.campus) { id = 'homes'; k = u01(t, T.thats, T.oneRack); }
    else if (t >= T.thats2 - 0.1 && t < T.heat) { id = 'gw'; k = u01(t, T.thats2, T.thats2 + 2.4); }
    else if (t >= T.so - 0.1 && t < T.pivot) { id = 'warm'; k = (t - T.so) % 1.2 / 1.2; }
    else if (t >= T.prompt && t < T.end) { id = 'drops'; k = u01(t, T.five - 0.1, T.five + 1.3); }
    const key = id ? `${id}${Math.round(k * 40)}${id === 'warm' ? Math.round(t * 10) : ''}` : 'none'; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480); if (!id) return;
    dctx.save(); dctx.translate(0, 96);   // the cards sit low (y ≈ 0.41–0.69): above them her face stays clear
    if (id === 'homes') { panel(98, 262); ptxt('1 RACK =', '#ffd43b', 135, 112); const n = Math.round(111 * ease(k)); for (let i = 0; i < 111; i++) house(36 + (i % 15) * 13, 128 + Math.floor(i / 15) * 13, i < n); ptxt(`${n} HOMES`, '#ffffff', 135, 248); }
    if (id === 'gw') { panel(98, 262); ptxt('1 GIGAWATT =', '#ffd43b', 135, 112); const n = Math.round(800000 * ease(k)); ptxt(n.toLocaleString('en-US'), '#ffffff', 135, 134, 2); const lit = Math.round(1200 * ease(k)); for (let i = 0; i < 1200; i++) { const x = 30 + (i % 60) * 3.5, y = 154 + Math.floor(i / 60) * 4; dctx.fillStyle = i < lit ? (hash(i) > 0.3 ? '#ffd88a' : '#ff9a3a') : '#2a2640'; dctx.fillRect(Math.round(x), y, 2, 2); } ptxt('HOMES', '#ffffff', 135, 248); }
    if (id === 'warm') { panel(120, 250); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(70, 170, 130, 50); dctx.fillRect(84, 220, 14, 10); dctx.fillStyle = '#1a1424'; for (const x of [108, 130, 152]) dctx.fillRect(x, 192, 8, 8);
      dctx.fillStyle = 'rgba(255,190,190,.9)'; for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) { const y = 162 - i * 4 - k * 8, x = 100 + s * 34 + Math.round(3 * Math.sin(i * 0.9 + t * 6 + s)); if (y > 124) dctx.fillRect(x, y, 2, 3); } ptxt('ANSWER: WARM', '#ff9a8a', 135, 240); }
    if (id === 'drops') { panel(98, 262); ptxt('ONE ANSWER', '#ffd43b', 135, 112); dctx.fillStyle = '#7cf05f'; dctx.fillRect(48, 136, 60, 26); dctx.fillRect(108, 144, 4, 10); dctx.fillStyle = '#1a1424'; dctx.fillRect(52 + Math.round(52 * k), 140, Math.max(0, 52 - Math.round(52 * k)), 18); ptxt('0.24 WH', '#ffffff', 80, 176);
      const nd = Math.min(5, Math.floor(k * 6)); for (let i = 0; i < 5; i++) { const x = 156 + (i % 3) * 22, y = 136 + Math.floor(i / 3) * 24; dctx.fillStyle = i < nd ? '#58c8ff' : '#2a2640'; dctx.fillRect(x + 3, y, 4, 4); dctx.fillRect(x + 1, y + 4, 8, 8); dctx.fillRect(x + 2, y + 12, 6, 2); }
      ptxt(`${nd} DROPS`, '#58c8ff', 190, 196); ptxt('0.26 ML OF WATER', '#ffffff', 135, 236); }
    dctx.restore();
  }

  // ---------------------------------------------------------------- shots (hall: the camera looks −z down the aisle; she faces +z)
  const walk = (t) => ({ x: 0, z: -6.4 + 1.7 * ease(u01(t, 0.2, 4.6)) });
  const VA = { x: 0.05, z: -4.7 };
  const SH = [
    { id: 'hook', t0: 0, set: 'hall', vex: (t) => ({ ...walk(t), pose: 'rest', walk: t < 4.6 ? { dist: 1.7 * ease(u01(t, 0.2, 4.6)), speed: 0.45 } : null, tilt: 0.08, sway: 0.15, face: CONF(t) }), cam: (t) => { const w = walk(t); return { pos: [0.1, 1.42, w.z + 2.2], look: [0, 1.25, w.z - 1.5], fov: 50 }; } },
    { id: 'tray', t0: T.rack, set: 'hall', cam: (t) => { const k = ease(u01(t, T.rack, T.andR)); return { pos: [0.05 - 0.05 * k, 1.72 - 0.08 * k, HZ + 0.62], look: [0.18, 1.22, HZ], fov: 46 }; } },
    { id: 'rack', t0: T.andR - 0.1, set: 'hall', vex: (t) => ({ ...VA, pose: 'point', tilt: 0.1, sway: 0.15, turn: 0.25, face: CONF(t) }), cam: (t) => ({ pos: [-0.45, 1.4, -2.0 + 0.2 * u01(t, T.andR, T.thats)], look: [0.15, 1.25, -4.4], fov: 48 }) },
    { id: 'homes', t0: T.thats - 0.1, set: 'hall', vex: (t) => ({ ...VA, pose: 'hip', tilt: -0.1, sway: 0.15, face: CONF(t) }), cam: (t) => ({ pos: [0.05, 1.3, -1.6 - 0.3 * u01(t, T.thats, T.campus)], look: [0.0, 1.05, -4.7], fov: 50 }) },
    { id: 'campus', t0: T.campus, set: 'camp', cam: (t) => { const k = u01(t, T.campus, T.heat); return { pos: [400 + 70 - 30 * k, 60 - 12 * k, 95 - 15 * k], look: [400 - 20, 4, -10], fov: 46 }; } },
    { id: 'pipes', t0: T.heat, set: 'hall', cam: (t) => { const k = u01(t, T.heat, T.liquid + 0.8); return { pos: [0.0, 2.4, -1.2 - 1.5 * k], look: [0.0, 3.22, -5 - 1.5 * k], fov: 48 }; } },
    { id: 'towers', t0: T.liquid + 0.8, set: 'camp', cam: (t) => { const k = u01(t, T.liquid, T.so); return { pos: [400 - 10 + 6 * k, 14, 84 - 6 * k], look: [400 - 30, 9, 48], fov: 44 }; } },
    { id: 'warm', t0: T.so - 0.1, set: 'hall', vex: (t) => ({ ...VA, pose: 'shrug', tilt: 0.14, sway: 0.12, face: CONF(t, { happy: t > T.warm - 0.3 ? 0.45 : 0 }) }), cam: (t) => ({ pos: [0.03, 1.38, -2.9 - 0.25 * u01(t, T.so, T.pivot)], look: [0.0, 1.16, -4.7], fov: 48 }) },
    { id: 'pivot', t0: T.pivot, set: 'hall', vex: (t) => ({ ...VA, pose: t > T.cute - 0.35 ? 'shh' : 'cross', tilt: -0.1, sway: 0.1, face: CONF(t, { relaxed: t > T.cute - 0.3 ? 0.22 : 0.1, blinkLeft: t > T.cute + 0.15 ? 1 : 0 }) }), cam: (t) => ({ pos: [0.02, 1.56, -3.9 - 0.15 * u01(t, T.pivot, T.scribe)], look: [0.0, 1.5, -4.7], fov: 42 }) },
    { id: 'phone', t0: T.scribe, set: 'hall', phone: 'write' },
    { id: 'graph', t0: T.graph - 0.1, set: 'hall', phone: 'graph' },
    { id: 'shuffle', t0: T.hit - 0.2, set: 'hall', phone: 'shuffle' },
    { id: 'prompt', t0: T.prompt, set: 'hall', vex: (t) => ({ ...VA, pose: t > T.five - 0.2 ? 'peace' : 'hip', tilt: 0.1, sway: 0.15, face: CONF(t) }), cam: (t) => ({ pos: [0.05, 1.3, -1.7 - 0.3 * u01(t, T.prompt, T.end)], look: [0.0, 1.05, -4.7], fov: 50 }) },
    { id: 'end', t0: T.end, set: 'hall', vex: (t) => ({ ...VA, pose: t > T.dismissed - 0.1 ? 'kissOut' : 'hip', tilt: -0.12, sway: 0.15, face: CONF(t, { blinkLeft: t > T.dismissed + 0.2 ? 1 : 0 }) }), cam: (t) => ({ pos: [0.05, 1.46, -3.0 - 0.2 * u01(t, T.end, T.card)], look: [0.0, 1.36, -4.7], fov: 46 }) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrX = V(), scrY = V();
  const phoneCam = (u, v, d) => { phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const writeP = (t) => totalA * ease(u01(t, T.scribe + 0.15, T.hit - 0.35));

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    HALL.visible = sh.set === 'hall'; CAMP.visible = sh.set === 'camp';
    scene.background.set(sh.set === 'camp' ? 0x1a1424 : 0x05070c);
    // the phone: the page writes itself on screen, then Shuffle lays it out another way at once
    const shuffled = t >= T.shuffle - 0.05;
    if (t < T.scribe) drawPhone(sheetA, 0, 'write', 0);
    else if (!shuffled) drawPhone(sheetA, writeP(t), writeP(t) >= totalA - 0.5 ? 'done' : 'write', 0);
    else drawPhone(sheetB, sheetB.total, 'shuffle', u01(t, T.shuffle - 0.05, T.shuffle + 0.8));
    let cam;
    if (sh.phone === 'write' || sh.phone === 'shuffle') cam = phoneCam(0.5, 0.5, 0.2 - 0.02 * k);
    else if (sh.phone === 'graph') { const gu = (PX + graphC[0] * PWp / sheetA.w) / PHW, gv = (PY + graphC[1] * PHp / sheetA.h) / PHH; cam = phoneCam(gu, gv, 0.11 - 0.015 * k); }
    else cam = sh.cam(t);
    studio.camera.far = sh.set === 'camp' ? 900 : 80; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -3).addScaledVector(side, -1.5).add(V(0, 3, 0)); key.intensity = sh.set === 'hall' ? 0.9 : 0;
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.26 * Math.pow(d, 1.6)) : 0; }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); }
    // LEDs blink (deterministic), coolant flows, steam rises
    for (let i = 0; i < li; i++) { const on = hash(i * 13 + Math.floor(t * (2 + (i % 5)))) > 0.25; col.set(LED_COL[i % 3]); if (!on) col.multiplyScalar(0.18); leds.setColorAt(i, col); } leds.instanceColor.needsUpdate = true;
    pipes[0].offset.y = -t * 0.6; pipes[1].offset.y = t * 0.6;
    if (CAMP.visible) for (const s of CAMP.steam) { const a = (t * 0.25 + s.ph) % 1; s.sp.position.set(s.cx + a * 6, 8 + a * 22, s.cz - a * 3); s.sp.scale.setScalar(6 + a * 16); s.sp.material.opacity = 0.75 * (1 - a); }
    tray.position.x = sh.id === 'tray' ? 0.45 : 1.08;   // pulled out only for its close-up (out, it sat between the lens and her)
    diagram(t);
    pixel.set(Math.max(sh.phone ? 1 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
