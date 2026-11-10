// 076 — "What 3 energy drinks do to your body, hour by hour" (Scribe lane, Vex EXPLAINER, anime/pixel look). Manager brief (Nov 9):
// a Vex explainer on something big right now with 18–24-year-old college students, lane = money / the body / everyday life.
//   format  = an HOUR-BY-HOUR explainer with a clock HUD (11:00 PM → 2:00 AM → 8:00 AM → 11:00 AM, and back to 2:06 AM), not 072's tour;
//   place   = a 24-hour convenience store at night (NEW set: a glowing fridge wall of our own made-up cans — BZZT, ZOOMR, YIKES, WAKEY —
//             snack gondolas, a counter with a register, hot-dog roller, slushie machine, coffee, posters, a wall clock) + the same
//             store from OUTSIDE at sunrise (facade, ALL-NITE MART sign, ice chest, parking lot);
//   facts   = (sources in caption.md's comment) a lot of energy drinks carry ~200 mg per can (CSPI chart: 12 oz 200 mg, 16 oz up to
//             300 mg); caffeine blocks adenosine receptors (adenosine = the sleep pressure that builds while you're awake; Sleep
//             Foundation / StatPearls); FDA: 400 mg a day is the amount not generally tied to dangerous effects in healthy adults;
//             half-life ≈ 5 h in the average adult (StatPearls; range ~1.5–9.5 h); cans at 11 PM, 12:30 AM and 2 AM (200 mg each)
//             leave ≈ 215 mg at 8 AM (≈ a whole can); when it clears, the built-up adenosine binds = the crash;
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated): receptors blocked while adenosine piles up,
//             a 600 vs 400 mg meter, the 3-can caffeine curve to 8 AM, the receptors flooding (the crash) + a clock/can HUD;
//   Scribe  = a feature not shown before: README §The composer "Typed problems alone. No file is needed" — she TYPES the problem into
//             "What are we solving today?", the desk shows its waiting page (README §The writing desk: the Scribe logo + "Be patient,
//             Scribe is doing your homework." written in the writer's own hand), then the page WRITES ITSELF ON THE PHONE SCREEN with an
//             on-screen pen cursor (user rule: never a pencil on paper), ending on the hand-drawn decay graph. Chemistry: first-order
//             kinetics (k = ln2 / t½, m = m₀e^(−kt)) + moles of caffeine C₈H₁₀N₄O₂ (194.2 g/mol).
//   persona = the lighter 071/072 tone: confident, teasing ("Cute.", "I'll know."); Fish "Mommy" with the less-breathy settings.
// Guardrails: no real brands (our own cans/store), swimwear only, no kink lines, no promises, no claims about real people.
// Props rule (Nov 9): the can rides her LEFT hand bone (attached at build in the hold pose: axis along the knuckle line, centre in the
// palm), so it can never float; the dropped can (crash) is a separate copy that starts exactly where the held one was.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet, layoutHand } from '@engine/build/scribe.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, SIDE_DBG = false;   // SIDE_DBG: a side view of her can hand for the props check
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const caffeine = (h) => [0, 1.5, 3].reduce((s, d) => s + (h >= d ? 200 * Math.pow(0.5, (h - d) / 5) : 0), 0);   // mg; h = hours after 11 PM

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
    here: W('hook', 'heres'), can1: B.can1.t0, canOne: W('can1', 'can'), two: W('can1', 'two'), block: B.block.t0, blocks: W('block', 'blocks'),
    youre: W('block', 'youre'), can3: B.can3.t0, six: W('can3', 'six'), fdas: W('can3', 'fdas'), pivot: B.pivot.t0, cute: W('pivot', 'cute'), scribe: B.scribe.t0,
    type: W('scribe', 'type'), writes: W('scribe', 'writes'), graph: W('scribe', 'graph'), morning: B.morning.t0, at8: W('morning', 'at'),
    whole: W('morning', 'whole'), crash: B.crash.t0, wears: W('crash', 'wears'), hits: W('crash', 'hits'), thats: W('crash', 'thats'),
    crashW: W('crash', 'crash'), end: B.end.t0, go: W('end', 'go'), ill: W('end', 'ill'), know: W('end', 'know'),
  };
  T.card = T.know + 0.55; T.send = T.writes - 0.75; T.page = T.writes - 0.05;

  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const basic = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (shadow) o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0, 'YXZ'); parent.add(o); return o; };
  const sign = (w, h, bg, lines, o = {}) => crisp(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (o.border) { g.strokeStyle = o.border; g.lineWidth = o.bw ?? 8; g.strokeRect(6, 6, w - 12, h - 12); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach(([txt, col, size, y, font]) => { g.fillStyle = col; g.font = `${font ?? '900'} ${size}px Inter, Arial`; g.fillText(txt, w / 2, y); }); });

  // ---------------------------------------------------------------- the cans (our own brands; label wraps the cylinder twice)
  const BRANDS = {
    BZZT: { bg: '#7cf05f', bg2: '#1a1a1a', fg: '#101010', ink: '#7cf05f' }, ZOOMR: { bg: '#2a6aff', bg2: '#0e1a40', fg: '#ffffff', ink: '#9fd0ff' },
    YIKES: { bg: '#ff4fa3', bg2: '#2a0a1a', fg: '#ffffff', ink: '#ffd0e8' }, WAKEY: { bg: '#ff8a2a', bg2: '#1a1a1a', fg: '#101010', ink: '#ffe0a0' },
    POPP: { bg: '#e0302a', bg2: '#ffffff', fg: '#ffffff', ink: '#ffffff' },
  };
  const labelTex = {};
  for (const [name, c] of Object.entries(BRANDS)) labelTex[name] = crisp(256, 128, (g, w, h) => {
    g.fillStyle = c.bg2; g.fillRect(0, 0, w, h); g.fillStyle = c.bg; g.fillRect(0, 16, w, h - 32);
    for (let k = 0; k < 2; k++) { const x0 = k * 128;
      g.save(); g.translate(x0 + 64, 64); g.fillStyle = c.fg; g.font = '900 34px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, 2); g.restore();
      g.fillStyle = c.bg2; g.beginPath(); g.moveTo(x0 + 18, 26); g.lineTo(x0 + 30, 26); g.lineTo(x0 + 24, 44); g.lineTo(x0 + 34, 44); g.lineTo(x0 + 16, 74); g.lineTo(x0 + 22, 52); g.lineTo(x0 + 12, 52); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 20, w, 3); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, h - 22, w, 3); });
  const metal = toon(0xc8ccd4), CANMAT = {}, canMat = (name) => (CANMAT[name] ??= [new THREE.MeshToonMaterial({ map: labelTex[name], emissive: 0x111111 }), metal, metal]);
  const CAN_R = 0.031, CAN_H = 0.155, canGeo = new THREE.CylinderGeometry(CAN_R, CAN_R, CAN_H, 20, 1);
  function makeCan(name) {
    const g = new THREE.Group(), body = new THREE.Mesh(canGeo, canMat(name)); body.castShadow = true; g.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(CAN_R * 0.93, 0.004, 6, 20), metal); rim.rotation.x = PI / 2; rim.position.y = CAN_H / 2; g.add(rim);
    const tab = new THREE.Group(); tab.position.set(0, CAN_H / 2 + 0.002, -0.008); g.add(tab);
    bx(tab, 0.016, 0.003, 0.026, toon(0xdfe2e8), 0, 0, 0.008, false); g.tab = tab;
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), basic({ color: 0x15151a })); hole.rotation.x = -PI / 2; hole.position.set(0, CAN_H / 2 + 0.0015, 0.012); hole.visible = false; g.add(hole); g.hole = hole;
    g.setLabel = (n) => { body.material = canMat(n); };
    return g;
  }

  // ---------------------------------------------------------------- the store, inside (fridge wall at z −5, she stands at z −3.7 facing +z)
  scene.background = new THREE.Color(0x0a0c12);
  const IN = new THREE.Group(); scene.add(IN);
  const tileT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8b2a4'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); }, { k: 1, repeat: [9, 8] });
  plane(IN, 9.2, 8.4, lam({ map: tileT }), 0, 0, -1.0, 0, -PI / 2).receiveShadow = true;
  const ceilT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#d8d8d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8a8a4'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillStyle = '#c4c4c0'; for (let i = 0; i < 9; i++) g.fillRect((i * 5) % 15 + 1, (i * 7) % 15 + 1, 1, 1); }, { k: 1, repeat: [9, 8] });
  plane(IN, 9.2, 8.4, lam({ map: ceilT }), 0, 3.0, -1.0, 0, PI / 2);
  const wallM = lam({ color: 0xf0e6c8 }), wallDark = lam({ color: 0x23262e });
  plane(IN, 8.4, 3.0, wallM, -4.55, 1.5, -1.0, PI / 2); plane(IN, 8.4, 3.0, wallM, 4.55, 1.5, -1.0, -PI / 2); plane(IN, 9.2, 3.0, wallDark, 0, 1.5, -5.6);
  bx(IN, 9.1, 0.12, 0.05, toon(0xe0302a), 0, 0.06, -4.92, false);   // red kick plate under the fridges
  for (let i = 0; i < 6; i++) { const s = bx(IN, 1.25, 0.05, 0.6, basic({ color: 0xf4f8ff }), -2.6 + (i % 3) * 2.6, 2.97, -3.6 + Math.floor(i / 3) * 3.4, false); void s; }
  // the fridge wall: 8 glass doors, 5 lit shelves of cans each (instanced per brand), a lit header sign
  const DOOR_W = 0.74, NDOORS = 8, FZ = -4.95, DOOR_BRAND = ['POPP', 'WAKEY', 'BZZT', 'BZZT', 'ZOOMR', 'ZOOMR', 'YIKES', 'YIKES'];
  const canCounts = {}; DOOR_BRAND.forEach((b) => (canCounts[b] = (canCounts[b] || 0) + 5 * 9));
  const fridgeCans = {}; for (const b of Object.keys(canCounts)) { const im = new THREE.InstancedMesh(canGeo, canMat(b), canCounts[b]); im.frustumCulled = false; im.count = 0; IN.add(im); fridgeCans[b] = im; }
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = V(1, 1, 1);
  const glowM = basic({ color: 0xeaf6ff }), frameM = toon(0x1c1e24), shelfM = toon(0x9aa4b0, 0x202830);
  for (let d = 0; d < NDOORS; d++) {
    const cx = -2.59 + d * DOOR_W;
    plane(IN, DOOR_W - 0.02, 2.05, glowM, cx, 1.18, FZ - 0.5);                 // the lit back of the cabinet
    for (const sy of [0.28, 0.68, 1.08, 1.48, 1.88]) { bx(IN, DOOR_W - 0.04, 0.02, 0.45, shelfM, cx, sy, FZ - 0.27, false);
      const im = fridgeCans[DOOR_BRAND[d]];
      for (let k = 0; k < 9; k++) { m4.compose(V(cx - 0.3 + k * 0.075, sy + 0.01 + CAN_H / 2, FZ - 0.12 - (k % 2) * 0.012), q4.setFromAxisAngle(V(0, 1, 0), hash(d * 50 + k + sy * 9) * 6.28), s4); im.setMatrixAt(im.count++, m4); } }
    bx(IN, 0.035, 2.12, 0.05, frameM, cx - DOOR_W / 2, 1.18, FZ, false);
    bx(IN, DOOR_W, 0.05, 0.05, frameM, cx, 0.13, FZ, false); bx(IN, DOOR_W, 0.05, 0.05, frameM, cx, 2.22, FZ, false);
    const glass = plane(IN, DOOR_W - 0.04, 2.04, new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.1, depthWrite: false }), cx, 1.18, FZ + 0.02); glass.renderOrder = 2;
    plane(IN, 0.06, 2.0, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false }), cx - 0.18 + hash(d) * 0.2, 1.18, FZ + 0.025, 0, 0).renderOrder = 3;
    bx(IN, 0.025, 0.7, 0.03, toon(0xd8dce4), cx + (d % 2 ? -1 : 1) * (DOOR_W / 2 - 0.08), 1.2, FZ + 0.06, false);   // chrome handle
  }
  bx(IN, 0.035, 2.12, 0.05, frameM, -2.59 + NDOORS * DOOR_W - DOOR_W / 2, 1.18, FZ, false);
  for (const b of Object.values(fridgeCans)) b.instanceMatrix.needsUpdate = true;
  bx(IN, NDOORS * DOOR_W + 0.1, 0.62, 0.3, toon(0x1c1e24), -2.59 + (NDOORS - 1) * DOOR_W / 2, 2.56, FZ - 0.1, false);
  plane(IN, NDOORS * DOOR_W - 0.1, 0.46, basic({ map: sign(1024, 64, '#101218', [['ENERGY  ·  COLD DRINKS  ·  2 FOR $5', '#7cf05f', 40, 34]]) }), -2.59 + (NDOORS - 1) * DOOR_W / 2, 2.56, FZ + 0.06);
  // snack gondolas along the left wall + an end cap of cans; chips/candy are instanced boxes
  const snackCols = [0xff4f4f, 0xffd43b, 0x2a6aff, 0x7cf05f, 0xff8a2a, 0xb06aff, 0xf2f2f2], snacks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam({ color: 0xffffff }), 900); snacks.frustumCulled = false; snacks.count = 0; IN.add(snacks);
  const col = new THREE.Color();
  const gondola = (x, z0, z1, faces) => {
    const L = z1 - z0; bx(IN, 0.9, 1.65, L, toon(0xe8e8ec), x, 0.825, (z0 + z1) / 2);
    for (const side of faces) for (const sy of [0.25, 0.65, 1.05, 1.45]) { bx(IN, 0.08, 0.03, L, toon(0x9aa0aa), x + side * 0.47, sy - 0.02, (z0 + z1) / 2, false);
      for (let z = z0 + 0.1; z < z1 - 0.08; z += 0.16) { const n = snacks.count, hh = 0.16 + hash(n) * 0.14; m4.compose(V(x + side * 0.42, sy + hh / 2, z + (hash(n + 7) - 0.5) * 0.03), q4.identity(), V(0.06 + hash(n + 3) * 0.04, hh, 0.13)); snacks.setMatrixAt(n, m4); snacks.setColorAt(n, col.set(snackCols[Math.floor(hash(n * 3 + Math.round(sy * 10)) * snackCols.length)])); snacks.count++; } } };
  gondola(-3.9, -4.4, 1.6, [1]); gondola(-2.35, -2.6, 1.0, [-1, 1]);
  plane(IN, 1.4, 0.36, basic({ map: sign(640, 165, '#ffd43b', [['CHIPS · CANDY', '#1a1a1a', 72, 86]], { border: '#e0302a' }) }), -1.885, 1.92, -0.8, PI / 2);
  // the counter (right): register, gum rack, hot-dog roller, coffee, slushie machine, wall clock
  const CTR = { x0: 2.25, x1: 3.25, z0: -2.7, z1: 0.6, y: 1.0 };
  bx(IN, CTR.x1 - CTR.x0, 0.96, CTR.z1 - CTR.z0, toon(0x8a3a2a), (CTR.x0 + CTR.x1) / 2, 0.48, (CTR.z0 + CTR.z1) / 2);
  bx(IN, CTR.x1 - CTR.x0 + 0.08, 0.05, CTR.z1 - CTR.z0 + 0.08, toon(0xe8e4dc), (CTR.x0 + CTR.x1) / 2, 0.985, (CTR.z0 + CTR.z1) / 2);
  plane(IN, CTR.z1 - CTR.z0 - 0.2, 0.5, lam({ map: sign(1024, 160, '#8a3a2a', [['ALL-NITE MART', '#ffd43b', 84, 84]]) }), CTR.x0 - 0.005, 0.58, (CTR.z0 + CTR.z1) / 2, -PI / 2);
  const reg = new THREE.Group(); reg.position.set(2.85, 1.01, 0.05); IN.add(reg);
  bx(reg, 0.36, 0.14, 0.34, toon(0x2a2d33), 0, 0.07, 0); const regScr = bx(reg, 0.03, 0.2, 0.28, toon(0x2a2d33), 0.12, 0.26, 0); void regScr;
  plane(reg, 0.26, 0.16, basic({ map: sign(256, 160, '#0e2a1a', [['TOTAL', '#7cf05f', 30, 50], ['$8.97', '#7cf05f', 54, 108]]) }), 0.1, 0.27, 0, -PI / 2);
  const roller = new THREE.Group(); roller.position.set(2.75, 1.01, -2.2); IN.add(roller);
  bx(roller, 0.5, 0.1, 0.42, toon(0xb8bcc4), 0, 0.05, 0); const dogs = [];
  for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.34, 4, 8), toon(0xc0502a, 0x401000)); d.rotation.x = PI / 2; d.position.set(-0.2 + i * 0.08, 0.125, 0); roller.add(d); dogs.push(d); }
  bx(roller, 0.52, 0.02, 0.44, new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.25 }), 0, 0.3, 0, false);
  const slush = new THREE.Group(); slush.position.set(4.15, 1.01, -3.6); IN.add(slush);   // on the back counter by the right wall
  bx(IN, 0.8, 1.0, 2.2, toon(0x8a3a2a), 4.15, 0.5, -3.4); bx(IN, 0.84, 0.05, 2.24, toon(0xe8e4dc), 4.15, 1.0, -3.4);
  const slushT = (a, b) => { const t = pixelTex(8, 16, (g) => { for (let y = 0; y < 16; y++) { g.fillStyle = y % 6 < 3 ? a : b; g.fillRect(0, y, 8, 1); } }, { k: 1, repeat: [1, 1] }); t.wrapT = THREE.RepeatWrapping; return t; };
  const slushTex = [slushT('#3c8cff', '#7ab8ff'), slushT('#ff3c5a', '#ff8aa0')];
  slushTex.forEach((tx, i) => { const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 16), basic({ map: tx })); tank.position.set(0, 0.42, -0.2 + i * 0.4); slush.add(tank); bx(slush, 0.34, 0.2, 0.34, toon(0xe8e8ec), 0, 0.1, -0.2 + i * 0.4); });
  plane(slush, 0.7, 0.22, basic({ map: sign(512, 160, '#1a1a1a', [['SLUSH', '#7ab8ff', 96, 84]]) }), -0.19, 0.78, 0, -PI / 2);
  const coffee = new THREE.Group(); coffee.position.set(4.15, 1.01, -2.65); IN.add(coffee);
  bx(coffee, 0.4, 0.55, 0.36, toon(0x1a1a1e), 0, 0.27, 0); for (let i = 0; i < 2; i++) { const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.15, 12), new THREE.MeshToonMaterial({ color: 0x3a2010, transparent: true, opacity: 0.85 })); pot.position.set(-0.16, 0.08, -0.08 + i * 0.16); coffee.add(pot); }
  // the wall clock over the counter (hands set per shot to the HUD time)
  const clk = new THREE.Group(); clk.position.set(4.5, 2.25, -1.0); clk.rotation.y = -PI / 2; IN.add(clk);
  { const face = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), lam({ map: crisp(128, 128, (g) => { g.fillStyle = '#fbfaf6'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(64 + Math.sin(a) * 52 - 2, 64 - Math.cos(a) * 52 - 2, 5, 5); } }) })); clk.add(face);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.02, 8, 32), toon(0x1a1a1e)); clk.add(ring); }
  const hand = (len, w) => { const p = new THREE.Group(); bx(p, w, len, 0.01, basic({ color: 0x1a1a1a }), 0, len / 2 - 0.02, 0.01, false); clk.add(p); return p; };
  const clkH = hand(0.12, 0.018), clkM = hand(0.18, 0.012);
  const setClock = (h, m) => { clkM.rotation.z = -m / 60 * 2 * PI; clkH.rotation.z = -((h % 12) + m / 60) / 12 * 2 * PI; };
  // posters, a wet-floor sign, the door mat, the night windows at the front
  plane(IN, 0.9, 1.2, lam({ map: sign(300, 400, '#2a6aff', [['2 FOR', '#ffffff', 64, 90], ['$5', '#ffd43b', 150, 210], ['ENERGY', '#ffffff', 50, 330]], { border: '#ffffff' }) }), -4.53, 1.75, -3.2, PI / 2);
  plane(IN, 0.9, 1.2, lam({ map: sign(300, 400, '#ffd43b', [['HOT', '#e0302a', 70, 90], ['COFFEE', '#1a1a1a', 56, 170], ['99', '#e0302a', 150, 290]], { border: '#e0302a' }) }), 4.53, 1.85, 0.6, -PI / 2);
  plane(IN, 1.2, 0.5, basic({ map: sign(480, 200, '#140a10', [['OPEN 24 HRS', '#ff4fa3', 78, 104, '800']]) }), -4.53, 2.35, -0.6, PI / 2);
  const wet = new THREE.Group(); wet.position.set(-1.25, 0, -1.2); wet.rotation.y = 0.5; IN.add(wet);
  for (const s of [-1, 1]) { const p = plane(wet, 0.32, 0.62, lam({ map: sign(128, 248, '#ffd43b', [['!', '#1a1a1a', 90, 70], ['WET', '#1a1a1a', 34, 160], ['FLOOR', '#1a1a1a', 30, 196]]), side: THREE.DoubleSide }), 0, 0.31, s * 0.09, 0, s * 0.28); p.castShadow = true; }
  const nightT = crisp(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0e22'); gr.addColorStop(0.6, '#141a34'); gr.addColorStop(0.62, '#20202a'); gr.addColorStop(1, '#14141a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,200,120,.55)'; g.beginPath(); g.ellipse(380, 120, 60, 40, 0, 0, 7); g.fill(); g.fillStyle = '#ffe2a8'; g.fillRect(376, 100, 8, 10); g.fillStyle = '#2a2a34'; g.fillRect(378, 110, 4, 60); g.fillStyle = '#3a3a4a'; g.fillRect(80, 150, 140, 40); g.fillRect(100, 132, 90, 22); g.fillStyle = '#ff3a3a'; g.fillRect(84, 160, 10, 6); });
  plane(IN, 8.8, 2.4, basic({ map: nightT }), 0, 1.4, 2.98, PI);
  const counterCans = [makeCan('ZOOMR'), makeCan('YIKES')]; counterCans.forEach((c, i) => { c.position.set(2.5 + i * 0.1, 1.01 + CAN_H / 2, -0.85 - i * 0.16); c.rotation.set(i ? 0.0 : 0.1, i * 1.3, 0); IN.add(c); c.hole.visible = true; c.tab.rotation.x = -1.2; });
  const fallen = makeCan('YIKES'); fallen.rotation.set(0, 0.6, PI / 2); fallen.position.set(2.62, 1.01 + CAN_R, -1.0); fallen.hole.visible = true; fallen.tab.rotation.x = -1.2; IN.add(fallen); fallen.visible = false;
  // lights: cool fluorescent hemi + ceiling points, the fridge glow, a shadow key
  const hemiIn = new THREE.HemisphereLight(0xeef4ff, 0x6a6458, 1.15); IN.add(hemiIn);
  for (const [x, z] of [[-2.6, -3.4], [0, -3.4], [2.6, -3.4], [-2.6, 0], [0, 0], [2.6, 0]]) { const L = new THREE.PointLight(0xf4f8ff, 1.6, 6, 1.5); L.position.set(x, 2.8, z); IN.add(L); }
  for (const x of [-2, 0, 2]) { const L = new THREE.PointLight(0xbfe8ff, 2.4, 3.2, 1.6); L.position.set(x, 1.6, -4.3); IN.add(L); }
  const key = new THREE.DirectionalLight(0xfff4e8, 0.7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 24 }); scene.add(key, key.target);

  // ---------------------------------------------------------------- the store, outside at sunrise (facade at z 3; she stands on the sidewalk)
  const OUT = new THREE.Group(); scene.add(OUT); OUT.visible = false;
  const SW = 0.12;
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, toneMapped: false, map: crisp(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a6ab8'); gr.addColorStop(0.32, '#7aa6e0'); gr.addColorStop(0.46, '#f4c4b0'); gr.addColorStop(0.5, '#ffd0a0'); gr.addColorStop(0.52, '#b8a898'); gr.addColorStop(1, '#5a5048'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) })); OUT.add(sky);
    const asphaltT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#4a4a50', ['#3e3e44', '#56565c', '#44444a'], 60, 5), { k: 1, repeat: [40, 40] });
    plane(OUT, 200, 200, lam({ map: asphaltT }), 0, 0, 0, 0, -PI / 2).receiveShadow = true;
    const swT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#c8c4bc', ['#bcb8b0', '#d4d0c8'], 30, 9); g.fillStyle = '#a8a49c'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); }, { k: 1, repeat: [12, 3] });
    bx(OUT, 14, SW, 2.6, lam({ map: swT }), 0, SW / 2, 4.3);
    for (let i = -3; i <= 3; i++) bx(OUT, 0.1, 0.01, 4.5, basic({ color: 0xf0f0e8 }), i * 2.8, 0.005, 8.2, false);   // parking stripes
    // the facade: boxes around two big windows + a glass door, a sign band, a roof edge
    const brick = lam({ map: pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#c8b8a0'; g.fillRect(0, 0, w, h); g.fillStyle = '#a89880'; for (let y = 0; y < h; y += 4) { g.fillRect(0, y, w, 1); for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 1, 4); } }, { k: 1, repeat: [6, 2] }) });
    bx(OUT, 12, 0.45, 0.25, brick, 0, 0.225, 3.0); bx(OUT, 12, 1.4, 0.3, toon(0xf4f0e8), 0, 3.3, 3.05);
    for (const x of [-5.5, -0.95, 0.95, 5.5]) bx(OUT, x === -5.5 || x === 5.5 ? 1.0 : 0.25, 2.6, 0.25, brick, x, 1.3, 3.0);
    const dayGlass = crisp(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#7a98b0'); gr.addColorStop(0.5, '#a8c4d8'); gr.addColorStop(1, '#6a88a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.save(); g.rotate(-0.5); g.fillRect(40, 200, 30, 300); g.fillRect(100, 200, 12, 300); g.restore(); g.fillStyle = '#2a3440'; for (let i = 0; i < 4; i++) g.fillRect(40 + i * 110, 170, 70, 86); });
    plane(OUT, 4.4, 2.15, lam({ map: dayGlass, emissive: 0x101820 }), -3.2, 1.52, 3.16); plane(OUT, 4.4, 2.15, lam({ map: dayGlass, emissive: 0x101820 }), 3.2, 1.52, 3.16);
    plane(OUT, 0.95, 1.2, lam({ map: sign(300, 380, '#2a6aff', [['2 FOR', '#ffffff', 60, 80], ['$5', '#ffd43b', 140, 200], ['ENERGY', '#ffffff', 46, 320]], { border: '#ffffff' }) }), -2.2, 1.4, 3.18);
    plane(OUT, 0.95, 0.95, lam({ map: sign(300, 300, '#ffd43b', [['ICE', '#2a6aff', 110, 120], ['COLD', '#1a1a1a', 50, 220]]) }), 2.4, 1.6, 3.18);
    plane(OUT, 1.3, 0.5, basic({ map: sign(480, 180, '#140a10', [['OPEN 24 HRS', '#ff4fa3', 74, 92, '800']]) }), 4.2, 2.25, 3.18);
    const door = plane(OUT, 1.6, 2.5, lam({ map: crisp(256, 400, (g, w, h) => { g.fillStyle = '#5a7890'; g.fillRect(0, 0, w, h); g.fillStyle = '#1c1e24'; g.fillRect(0, 0, w, 10); g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h); g.fillRect(w / 2 - 5, 0, 10, h); g.fillStyle = '#d8dce4'; g.fillRect(w / 2 - 30, 180, 14, 90); g.fillRect(w / 2 + 16, 180, 14, 90); g.fillStyle = '#ffffff'; g.font = '800 26px Inter'; g.textAlign = 'center'; g.fillText('PUSH', w / 4, 320); g.fillText('PUSH', 3 * w / 4, 320); }), emissive: 0x0a1018 }), 0, 1.25, 3.12); void door;
    plane(OUT, 9.0, 0.95, lam({ map: sign(1536, 160, '#ffffff', [['ALL-NITE MART', '#e0302a', 112, 86]]), emissive: 0x303030 }), 0, 3.32, 3.21);
    bx(OUT, 12.2, 0.1, 0.5, toon(0xe0302a), 0, 4.0, 3.1);
    const ice = new THREE.Group(); ice.position.set(3.4, SW, 3.55); OUT.add(ice);
    bx(ice, 1.3, 1.05, 0.65, toon(0xf4f8ff), 0, 0.525, 0); plane(ice, 1.1, 0.5, lam({ map: sign(400, 180, '#f4f8ff', [['ICE', '#2a6aff', 130, 96]]) }), 0, 0.6, 0.33);
    const can2 = new THREE.Group(); can2.position.set(-3.2, SW, 3.6); OUT.add(can2);
    { const tc = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.9, 14), toon(0x2a5a3a)); tc.position.y = 0.45; tc.castShadow = true; can2.add(tc); }
    for (const x of [-1.6, 1.6]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 10), toon(0xffd43b)); b.position.set(x, SW + 0.45, 5.4); OUT.add(b); }
    const car = new THREE.Group(); car.position.set(-4.3, 0, 7.4); car.rotation.y = 0.05; OUT.add(car);
    bx(car, 1.8, 0.7, 4.2, toon(0x2a8a9a), 0, 0.55, 0); bx(car, 1.6, 0.55, 2.2, toon(0x2a8a9a), 0, 1.15, -0.2); bx(car, 1.62, 0.42, 2.0, toon(0x2a3440), 0, 1.16, -0.2);
    for (const [x, z] of [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14), toon(0x1a1a1e)); w.rotation.z = PI / 2; w.position.set(x, 0.34, z); car.add(w); }
    const pole = new THREE.Group(); pole.position.set(5.6, 0, 6.5); OUT.add(pole); bx(pole, 0.14, 6.5, 0.14, toon(0x5a5f68), 0, 3.25, 0); bx(pole, 1.2, 0.12, 0.3, toon(0x5a5f68), -0.6, 6.4, 0);
    const treeM = toon(0x3a7a3a), treeM2 = toon(0x2e6a32);
    for (let i = 0; i < 9; i++) { const tx = -14 + i * 3.6 + hash(i) * 1.2, tz = -2 - hash(i + 4) * 4, r = 1.6 + hash(i + 9) * 0.9; const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? treeM : treeM2); s.position.set(tx, 3.4 + r * 0.6, tz); OUT.add(s); bx(OUT, 0.3, 3.4, 0.3, toon(0x5a3a2a), tx, 1.7, tz, false); }
    bx(OUT, 12.2, 4.2, 6, toon(0xe8e0d0), 0, 2.1, -0.1, false);   // the store's body behind the facade
  }
  const sunOut = new THREE.DirectionalLight(0xffd8b0, 1.55); sunOut.position.set(4, 5, 14); sunOut.target.position.set(0, 1, 3.5); sunOut.castShadow = true; sunOut.shadow.mapSize.set(2048, 2048); Object.assign(sunOut.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 }); OUT.add(sunOut, sunOut.target);
  OUT.add(new THREE.HemisphereLight(0xbcd4f4, 0x8a7a68, 0.95));

  // ---------------------------------------------------------------- Scribe: a TYPED problem (no photo) → waiting page → the page writes itself
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = makeSheet(G, { rich: true, seed: 11, name: 'Vex', title: 'Caffeine at 8 AM', note: 'CHEM 101  ·  first-order kinetics', page: 'p. 1', problems: [
    { q: '', h: 1.15, a: '1)  t_{1/2} = 5.0 h,  m_0 = 500 mg,  t = 6.0 h\nk = 0.693 / 5.0 h = 0.139 h^{-1}\nm = 500 e^{-(0.139)(6.0)}', au: 28, lineH: 2.0,
      fig: ({ k, y }) => { const a = k.text('m = 500(0.435) =', 120, y + 74 + 3 * 56, { u: 28 }), b = k.text('218 mg', k.bbox(a).x1 + 30, y + 74 + 3 * 56, { u: 28 }); return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
    { q: '', h: 0.55, a: '2)  600 mg C_8H_{10}N_4O_2  (M = 194.2 g/mol)\nn = 0.600 / 194.2 = 3.09 × 10^{-3} mol', au: 26, lineH: 2.0 },
    { q: '', h: 1.3, a: '3)  m(t) = 500 e^{-0.139 t}', au: 26,
      fig: ({ k, y }) => { const ox = 330, oy = y + 400, sx = 62, sy = 0.56, out = [];
        out.push(...k.arrow([ox - 10, oy], [ox + 9 * sx, oy], { head: 14 }), ...k.arrow([ox, oy + 10], [ox, oy - 296], { head: 14 }));
        out.push(...k.text('m (mg)', ox - 150, oy - 290, { u: 22 }), ...k.text('t (h)', ox + 8.6 * sx, oy + 46, { u: 22 }));
        const P = []; for (let i = 0; i <= 32; i++) { const h = 8.4 * i / 32; P.push([ox + h * sx, oy - 500 * Math.pow(0.5, h / 5) * sy]); } out.push(...k.poly(P, { line: 4 }));
        out.push(...k.text('500', ox - 78, oy - 500 * sy + 10, { u: 22 }), ...k.dashed([ox, oy - 250 * sy], [ox + 5 * sx, oy - 250 * sy]), ...k.dashed([ox + 5 * sx, oy - 250 * sy], [ox + 5 * sx, oy]));
        out.push(...k.text('250', ox - 78, oy - 250 * sy + 10, { u: 22 }), ...k.text('t_{1/2}', ox + 5 * sx - 18, oy + 46, { u: 22 }));
        const mx = ox + 6 * sx, my = oy - 218 * sy; out.push(...k.dot(mx, my, { r: 6 }), ...k.label('8 AM: 218 mg', [mx + 40, my - 70], [mx + 6, my - 8], { u: 22 }));
        return out; } },
  ] });
  const waitHand = layoutHand(G, 'Be patient, Scribe is\ndoing your homework.', { x: 0, y: 0, u: 34, seed: 5, lineH: 2.2 });
  const PHW = 720, PHH = 1280, phT = crisp(PHW, PHH), RED = '#9a1c25';
  const PX = 40, PY = 330, PWp = 640, PHp = Math.round(640 * sheet.h / sheet.w);
  const nib = crisp(64, 64, (g) => { g.save(); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.restore(); }).canvas;
  const PROMPT = 'caffeine half-life 5 h. 500 mg in me at 2 AM, how much is left at my 8 AM exam? also 600 mg = how many mol? show work + graph';
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? `${line} ${w}` : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; };
  // the waiting page's logo: the S traced in one pen movement (README: the Scribe logo, then "Be patient…" in the writer's hand)
  const S_PATH = []; for (let i = 0; i <= 24; i++) { const a = (-40 - 230 * i / 24) * PI / 180; S_PATH.push([26 * Math.cos(a), -26 + 26 * Math.sin(a)]); }
  for (let i = 1; i <= 24; i++) { const a = (-90 + 230 * i / 24) * PI / 180; S_PATH.push([26 * Math.cos(a), 26 + 26 * Math.sin(a)]); }
  let phKey = '';
  function drawPhone(mode, k, p) {   // mode: home (k = typed fraction, 1 + = arrow pressed) | wait (k 0..1) | desk (p = written)
    const key = `${mode}${Math.round(k * 60)}${Math.round((p || 0) * 3)}`; if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d');
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    g.fillStyle = '#1d1d1d'; g.font = '600 26px Inter, Arial'; g.fillText('2:05', 40, 46); g.fillRect(620, 26, 46, 22); g.fillStyle = '#7cf05f'; g.fillRect(623, 29, 10, 16);   // status bar (battery low, 2 AM)
    g.drawImage(icon, 30, 78, 52, 52); g.fillStyle = '#1d1d1d'; g.font = '38px Georgia, serif'; g.fillText('Scribe', 94, 118); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 152, PHW, 2);
    if (mode === 'home') {
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PHW / 2, 400); g.fillText('solving today?', PHW / 2, 456); g.textAlign = 'left';
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(36, 520, PHW - 72, 360, 28); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.stroke();
      g.font = '30px Inter, Arial'; const n = Math.round(PROMPT.length * clamp(k)), lines = wrap(g, PROMPT.slice(0, n), PHW - 140);
      g.fillStyle = '#1d1d1d'; lines.forEach((L, i) => g.fillText(L, 66, 580 + i * 42));
      if (k < 1 && Math.floor(k * 30) % 2 === 0) { const L = lines[lines.length - 1] || '', x = 66 + g.measureText(L).width + 3; g.fillRect(x, 552 + Math.max(0, lines.length - 1) * 42, 3, 36); }
      g.fillStyle = '#6a6a6a'; g.font = '600 40px Inter, Arial'; g.fillText('+', 62, 852); g.strokeStyle = '#6a6a6a'; g.lineWidth = 3; g.strokeRect(116, 822, 26, 34); g.beginPath(); g.moveTo(178, 852); g.lineTo(198, 820); g.lineTo(206, 826); g.lineTo(186, 858); g.closePath(); g.stroke();
      const pressed = k >= 1; g.fillStyle = pressed ? '#5a0e14' : RED; g.beginPath(); g.arc(PHW - 92, 836, 34 * (pressed ? 0.9 : 1), 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(PHW - 92, 852); g.lineTo(PHW - 92, 820); g.moveTo(PHW - 106, 834); g.lineTo(PHW - 92, 820); g.lineTo(PHW - 78, 834); g.stroke();
    } else {
      // the desk: the prompt in a bubble on the right, then the page (the waiting page first, then the written sheet)
      g.font = '24px Inter, Arial'; const lines = wrap(g, PROMPT, 420).slice(0, 3); lines[2] += '…';
      g.fillStyle = '#e8e2d6'; g.beginPath(); g.roundRect(PHW - 480, 176, 450, 30 + lines.length * 32, 22); g.fill(); g.fillStyle = '#1d1d1d'; lines.forEach((L, i) => g.fillText(L, PHW - 458, 210 + i * 32));
      g.fillStyle = '#fff'; g.fillRect(PX - 4, PY - 4, PWp + 8, PHp + 8);
      if (mode === 'wait') {
        g.fillStyle = '#fffdf6'; g.fillRect(PX, PY, PWp, PHp); g.strokeStyle = 'rgba(120,150,200,.28)'; g.lineWidth = 1; for (let ly = PY + 190; ly < PY + PHp - 20; ly += 28) { g.beginPath(); g.moveTo(PX + 20, ly); g.lineTo(PX + PWp - 20, ly); g.stroke(); }
        const kl = clamp(k / 0.35), cx = PX + PWp / 2, cy = PY + 240; g.strokeStyle = RED; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); S_PATH.slice(0, Math.max(2, Math.ceil(S_PATH.length * kl))).forEach(([x, y], i) => (i ? g.lineTo(cx + x, cy + y) : g.moveTo(cx + x, cy + y))); g.stroke();
        if (kl >= 1) { g.fillStyle = RED; g.beginPath(); g.moveTo(cx + 40, cy + 30); g.lineTo(cx + 70, cy + 64); g.lineTo(cx + 52, cy + 68); g.closePath(); g.fill(); }
        const kt = clamp((k - 0.38) / 0.62), nW = Math.round(waitHand.length * kt), wx = PX + 70, wy = PY + 380;
        for (let i = 0; i < nW; i++) { const it = waitHand[i]; g.drawImage(it.c, wx + it.x, wy + it.y, it.w, it.h); }
      } else {
        const tip = sheet.draw(p); g.drawImage(sheet.canvas, PX, PY, PWp, PHp); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PX, PY, PWp, PHp);
        if (p < sheet.total - 0.5) { const cx = PX + tip[0] * PWp / sheet.w, cy = PY + tip[1] * PHp / sheet.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
      }
      const yb = PY + PHp + 26; g.fillStyle = '#6a6a6a'; g.font = '26px Inter, Arial'; g.fillText(mode === 'wait' ? '' : '1 page', 40, yb + 34);
      g.font = '600 26px Inter, Arial'; g.fillStyle = mode === 'wait' ? '#c8c2b6' : '#3a3a3a'; g.fillText('Shuffle', 250, yb + 34); g.fillText('Replay', 380, yb + 34); g.fillStyle = mode === 'wait' ? '#d8a8ac' : RED; g.fillText('Export PDF', 510, yb + 34);
    }
    phT.needsUpdate = true;
  }
  // the phone lies on a little stand on the counter, screen up toward the customer (−x)
  const PW = 0.072, PH = 0.128, phone = new THREE.Group(); phone.position.set(2.42, 1.05, -1.55); phone.rotation.set(-1.05, -PI / 2, 0, 'YXZ'); IN.add(phone);
  bx(phone, PW + 0.008, PH + 0.012, 0.009, toon(0x2a1a34), 0, 0, 0); bx(IN, 0.06, 0.03, 0.08, toon(0x1a1a1e), 2.48, 1.02, -1.55);
  const phScr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.set(0, 0, 0.0047); phone.add(phScr);
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const phoneCam = (u, v, d) => { phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  // writing pace: problems 1–2 while she says "it writes it in my handwriting", the graph (problem 3) on "graph and all"
  const p3 = sheet.items.findIndex((it) => it.pi === 2), wOf = (it) => (it.kind === 'p' ? it.w : 1);
  const P12 = sheet.items.slice(0, p3).reduce((s, it) => s + wOf(it), 0), totalS = sheet.total;
  const writeP = (t) => (t < T.graph - 0.2 ? P12 * ease(u01(t, T.page, T.graph - 0.2)) : P12 + (totalS - P12) * u01(t, T.graph - 0.2, T.morning - 0.25));
  const g3 = sheet.items.filter((it) => it.pi === 2 && it.kind === 'p').flatMap((it) => it.pts), gx = g3.map((q) => q[0]), gy = g3.map((q) => q[1]);
  const graphC = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];

  // ---------------------------------------------------------------- Vex (067's look) + her can in the LEFT hand
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  // her left arm (her frame: +x = her left, +z = forward): the can at chest height, low by her hip, raised toward the lens
  const CANARM = {
    chest: [[0.2, -0.88, 0.32], [-0.42, 0.14, 0.9]],
    show: [[0.3, -0.66, 0.6], [-0.22, 0.3, 0.93]],
    low: [[0.22, -1, 0.08], [0.12, -0.6, 0.79]],
    face: [[0.24, -0.78, 0.48], [-0.42, 0.62, 0.62]],
  };
  const R_ARMS = { rest: [[-0.24, -1, 0.04], [-0.12, -1, 0.14]], hip: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]], ...Object.fromEntries(['point', 'peace', 'shh', 'kissOut', 'shades', 'wave', 'beckon'].map((k) => [k, ARMS[k].R])),
    temple: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]], slump: [[-0.18, -1, 0.0], [-0.06, -1, 0.06]] };
  const R_HAND = { rest: 'relax', hip: 'relax', point: 'point', peace: 'peace', shh: 'point', kissOut: 'open', shades: 'relax', wave: 'open', beckon: 'beckon', temple: 'point', slump: 'relax' };
  // attach: pose the hold, read the knuckle line (= the can's axis in a fist) and the palm direction, centre the can in the grip
  VEX.update(0, { pose: 'rest', armL: CANARM.chest, hands: { L: 'hold' } }); VEX.root.updateMatrixWorld(true);
  const hb = VEX.bpos('leftHand'), mid = VEX.bpos('leftMiddleProximal'), idx = VEX.bpos('leftIndexProximal'), lit = VEX.bpos('leftLittleProximal');
  const fwd = mid.clone().sub(hb).normalize(), axis = idx.clone().sub(lit).normalize(), palm = fwd.clone().cross(axis).normalize();
  const gripC = hb.clone().lerp(mid, 0.62).addScaledVector(palm, CAN_R + 0.012);
  const canGrp = VEX.attach('leftHand', gripC.toArray()), held = makeCan('ZOOMR');
  held.quaternion.setFromUnitVectors(V(0, 1, 0), axis); held.position.addScaledVector(axis, 0.012); canGrp.add(held);
  // a fist holds a can along its knuckle line, so turn the forearm (and bend the wrist a little) until the can stands upright:
  // searched once per arm preset at build, then blended like the arm directions
  const CANFIX = {}, qq = new THREE.Quaternion(), up = V(0, 1, 0);
  for (const [name, arm] of Object.entries(CANARM)) {
    let best = { score: -9, tw: 0, hd: arm[1] };
    for (const sb of [0, 0.35, 0.7, 1.05]) for (let tw = -1.6; tw <= 1.6001; tw += 0.08) {
      const hd = V(arm[1][0], arm[1][1] + sb, arm[1][2]).normalize().toArray();
      VEX.update(0, { pose: 'rest', armL: arm, hands: { L: 'hold' }, aim: { 'twist.leftLowerArm': tw, leftHand: hd } }); VEX.root.updateMatrixWorld(true);
      const ax = up.clone().applyQuaternion(held.getWorldQuaternion(qq)), score = ax.y - 0.04 * sb - 0.02 * Math.abs(tw);
      if (score > best.score) best = { score, tw, hd, y: ax.y };
    }
    CANFIX[name] = best;
  }
  console.log('[076] can fix', JSON.stringify(Object.fromEntries(Object.entries(CANFIX).map(([k, v]) => [k, [v.tw.toFixed(2), v.y.toFixed(2)]]))));
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const armsOf = (v) => ({ L: CANARM[v.can || 'chest'], R: R_ARMS[v.r || 'rest'] });
  function glide(vexFn, t, v) {   // blend the arms over 0.28 s whenever the shot's pose function switches preset (pure: re-evaluates the past)
    const cur = armsOf(v); let L = cur.L, R = cur.R, fx = CANFIX[v.can || 'chest'], tw = fx.tw, hd = fx.hd;
    for (const side of ['L', 'R']) for (let d = 0.04; d <= 0.32; d += 0.04) { const pvv = vexFn(t - d), pv = armsOf(pvv); if (pv[side] !== cur[side]) { const k = ease(clamp((d - 0.02) / 0.28));
      if (side === 'L') { L = mixArm(pv.L, cur.L, k); const f0 = CANFIX[pvv.can || 'chest']; tw = f0.tw + (fx.tw - f0.tw) * k; hd = f0.hd.map((x, i) => x + (fx.hd[i] - x) * k); } else R = mixArm(pv.R, cur.R, k); break; } }
    return { ...v, armL: L, armR: R, canTw: tw, canHd: hd };
  }
  const shake = (t, a) => (a ? [[Math.sin(t * 71) * a, Math.sin(t * 53 + 1) * a, Math.sin(t * 67 + 2) * a]] : null);
  const jitterArm = (arm, t, a) => arm.map((d, i) => [d[0] + Math.sin(t * 61 + i) * a, d[1] + Math.sin(t * 47 + i * 2) * a, d[2] + Math.sin(t * 57 + i * 3) * a]);
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face
  void shake;

  // ---------------------------------------------------------------- overlay: title, callouts, end card; the PIXEL cards + the clock HUD (270 × 480, ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHAT 3 ENERGY DRINKS', 'DO TO YOUR BODY'], t0: 0, t1: B.can1.t0 - 0.05, y: 0.13, plain: false, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const txtCache = new Map(), ptxt = (s, color, x, y, sc = 1, align = 'center') => { const kk = s + color; let cv = txtCache.get(kk); if (!cv) { cv = pixelText(s, { color }); txtCache.set(kk, cv); } const w = cv.width * sc; dctx.drawImage(cv, Math.round(align === 'left' ? x : x - w / 2), Math.round(y - cv.height * sc / 2), w, cv.height * sc); };
  const panel = (x0, y0, x1, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(x0, y0, x1 - x0, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y1, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y0, 2, y1 - y0); dctx.fillRect(x1, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const pxCan = (x, y, c, full = true) => { R(full ? c : '#2a2640', x, y + 1, 6, 10); R('#c8ccd4', x + 1, y, 4, 1); R('#c8ccd4', x, y + 11, 6, 1); if (full) R('rgba(255,255,255,.5)', x + 1, y + 3, 1, 6); };
  const CAFF = '#7cf05f', ADEN = '#b06aff';
  // the cards sit in a band y 0.44–0.69 (canvas 210–330) with her face framed at ≈ 0.27–0.36 above them; the HUD at 0.165–0.235 left
  const Y0 = 210, Y1 = 330;
  function receptors(t, y, pile, out, flood) {   // 6 receptor cups; caffeine (green) plugs them; adenosine (purple) piles up above; flood = it drops in
    const cupY = y, nPile = Math.round(pile);
    for (let i = 0; i < 6; i++) { const x = 42 + i * 33; R('#ff9ab8', x, cupY, 3, 12); R('#ff9ab8', x + 17, cupY, 3, 12); R('#ff9ab8', x, cupY + 12, 20, 3);
      const go = clamp(out * 1.5 - i * 0.08); if (go < 1) { dctx.globalAlpha = 1 - go; const cy = cupY + 2 - go * 30; R(CAFF, x + 5, cy, 10, 9); R('#1a3a10', x + 8, cy + 3, 4, 3); dctx.globalAlpha = 1; } }
    const drop = ease(clamp(flood * 1.3));
    for (let j = 0; j < nPile; j++) { const row = Math.floor(j / 6), c = j % 6, x = 47 + c * 33 + (row % 2 ? 8 : -2), yy = cupY - 12 - row * 9 + drop * (row === 0 ? 14 : 12); R(ADEN, x, Math.round(yy), 8, 8); }
  }
  let dgKey = '';
  const CLOCK = (t) => (t < T.can1 ? null : t < T.block ? ['11:00 PM', 1] : t < T.can3 ? ['11:40 PM', 1] : t < T.pivot ? ['2:00 AM', 3] : t < T.morning ? ['2:05 AM', 3] : t < T.crash ? ['8:00 AM', 3] : t < T.end ? ['11:00 AM', 3] : ['2:06 AM', 3]);
  function diagram(t, sh) {
    let id = null, k = 0;
    if (t >= T.blocks - 0.1 && t < T.can3) { id = 'block'; k = u01(t, T.blocks, T.can3); }
    else if (t >= T.six - 0.1 && t < T.pivot) { id = 'meter'; k = u01(t, T.six - 0.1, T.six + 1.4); }
    else if (sh.card === 'decay') { id = 'decay'; k = u01(t, sh.t0, T.at8 + 0.6); }
    else if (t >= T.wears - 0.1 && t < T.thats - 0.05) { id = 'crash'; k = u01(t, T.wears, T.thats); }
    const clock = !sh.phone && t < T.card ? CLOCK(t) : null;
    const key = `${id}${Math.round(k * 50)}${id === 'block' || id === 'crash' ? Math.round(t * 8) : ''}${clock ? clock[0] : ''}${id === 'decay' && t > T.whole - 0.1 ? 'w' : ''}${t > T.youre - 0.1 ? 'y' : ''}`; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480);
    if (clock) { panel(10, 80, 104, 112); ptxt(clock[0], '#ffffff', 57, 91, 2); for (let i = 0; i < 3; i++) pxCan(40 + i * 10, 101, ['#2a6aff', '#ff4fa3', '#7cf05f'][i], i < clock[1]); }
    if (!id) return;
    panel(18, Y0, 252, Y1);
    if (id === 'block') { ptxt(t > T.youre - 0.1 ? 'STILL PILING UP' : 'YOUR BRAIN', t > T.youre - 0.1 ? '#ffffff' : '#ffd43b', 135, Y0 + 11);
      receptors(t, Y0 + 92, 6 + 30 * ease(k), 0, 0); ptxt('CAFFEINE', CAFF, 74, Y1 - 10); ptxt('ADENOSINE', ADEN, 194, Y1 - 10); }
    if (id === 'meter') { ptxt('CAFFEINE TODAY', '#ffd43b', 135, Y0 + 11);
      const base = Y1 - 10, per = 26, nCan = Math.min(3, 1 + Math.floor(k * 3.2));
      for (let i = 0; i < 3; i++) { const y0 = base - (i + 1) * per; R(i < nCan ? ['#2a6aff', '#ff4fa3', '#7cf05f'][i] : '#2a2640', 110, y0 + 2, 46, per - 3); if (i < nCan) ptxt(`CAN ${i + 1}`, '#101010', 133, y0 + per / 2 + 1); }
      const y4 = base - 2 * per; for (let x = 74; x < 194; x += 8) R('#ff6a6a', x, y4, 5, 2); ptxt('FDA: 400', '#ff6a6a', 220, y4); ptxt(`${nCan * 200} MG`, nCan > 2 ? '#ff6a6a' : '#ffffff', 64, base - nCan * per + 8); }
    if (id === 'decay') { const w = t > T.whole - 0.1; ptxt(w ? 'ABOUT 1 CAN LEFT AT 8 AM' : 'CAFFEINE IN YOU', w ? '#ffffff' : '#ffd43b', 135, Y0 + 11);
      const ox = 38, oy = Y1 - 20, sx = 21, sy = 0.15; R('#f2e6ff', ox, oy, 202, 2); R('#f2e6ff', ox, oy - 82, 2, 84);
      const hMax = 9 * clamp(k); let py = null;
      for (let i = 0; i <= 270; i++) { const h = 9 * i / 270; if (h > hMax) break; const v = caffeine(h), y = Math.round(oy - 2 - v * sy); if (py !== null && Math.abs(y - py) > 2) R(CAFF, ox + 2 + h * sx, Math.min(y, py), 2, Math.abs(y - py)); R(v > 400 ? '#ff6a6a' : CAFF, ox + 2 + h * sx, y, 2, 2); py = y; }
      for (let x = ox + 4; x < ox + 196; x += 7) R('rgba(255,106,106,.7)', x, Math.round(oy - 2 - 400 * sy), 4, 1);
      ptxt('11PM', '#c8c0d8', ox + 10, oy + 8); ptxt('2AM', '#c8c0d8', ox + 3 * sx + 2, oy + 8); ptxt('8AM', '#ffffff', ox + 9 * sx - 2, oy + 8);
      if (w) pxCan(ox + 9 * sx - 2, Math.round(oy - 2 - caffeine(9) * sy) - 15, '#7cf05f'); }
    if (id === 'crash') { const flood = u01(t, T.hits - 0.05, T.hits + 0.45); ptxt(t > T.hits - 0.1 ? 'ALL AT ONCE' : 'CAFFEINE WEARS OFF', '#ffd43b', 135, Y0 + 11);
      receptors(t, Y0 + 92, 36, u01(t, T.wears, T.wears + 1.0), flood); ptxt('ADENOSINE', ADEN, 135, Y1 - 10); if (flood > 0 && flood < 0.5) { dctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - flood * 2)})`; dctx.fillRect(18, Y0, 234, Y1 - Y0); } }
  }

  // ---------------------------------------------------------------- shots
  const P0 = { x: 0, z: -3.7 }, PC = { x: 1.72, z: -1.55, rotY: -0.95 }, PO = { x: 0.35, z: 4.15 };   // fridge spot, at the counter, outside
  // framing: face (y ≈ 1.52 inside, 1.64 on the sidewalk) at ≈ 0.27–0.36 of the frame in every card beat, so the cards + HUD never cover it
  const SH = [
    { id: 'open', t0: 0, set: 'in', vex: (t) => ({ ...P0, can: t < 1.6 ? 'low' : 'chest', r: 'hip', tilt: 0.08, face: CONF(t) }), cam: (t) => { const k = ease(u01(t, 0, T.here)); return { pos: [0.7 - 0.4 * k, 1.35, -0.1 - 0.9 * k], look: [0.0, 1.32, -3.9], fov: 50 }; } },
    { id: 'show', t0: T.here - 0.1, set: 'in', vex: (t) => ({ ...P0, can: 'show', r: t > 4.5 ? 'point' : 'hip', tilt: -0.08, turn: 0.05, face: CONF(t, { relaxed: 0.18 }) }), cam: (t) => ({ pos: [0.12, 1.45, -2.05 - 0.15 * u01(t, T.here, T.can1)], look: [0.0, 1.3, -3.7], fov: 46 }) },
    { id: 'crack', t0: T.can1, set: 'in', vex: (t) => ({ ...P0, can: 'chest', r: 'hip', tilt: 0.05, face: CONF(t) }), canCam: true },
    { id: 'can1', t0: T.two - 0.1, set: 'in', vex: (t) => ({ ...P0, can: 'show', r: 'peace', tilt: 0.1, face: CONF(t) }), cam: (t) => ({ pos: [-0.1, 1.42, -2.05 - 0.2 * u01(t, T.two, T.block)], look: [0.0, 1.28, -3.7], fov: 48 }) },
    { id: 'nope', t0: T.block, set: 'in', vex: (t) => ({ ...P0, can: 'chest', r: 'hip', tilt: -0.06, turn: t < T.block + 1.1 ? 0.22 * Math.sin((t - T.block) * 11) * (1 - u01(t, T.block + 0.6, T.block + 1.1)) : 0, face: CONF(t, { angry: 0.2 }) }), cam: (t) => ({ pos: [0.28, 1.5, -2.45 - 0.1 * u01(t, T.block, T.blocks)], look: [0.0, 1.38, -3.7], fov: 44 }) },
    { id: 'block', t0: T.blocks - 0.25, set: 'in', vex: (t) => ({ ...P0, can: 'low', r: 'temple', tilt: -0.1, face: CONF(t) }), cam: (t) => ({ pos: [-0.35, 1.38, -1.4 - 0.25 * u01(t, T.blocks, T.youre)], look: [0.0, 1.12, -3.7], fov: 50 }) },
    { id: 'tired', t0: T.youre - 0.1, set: 'in', vex: (t) => ({ ...P0, can: 'chest', r: 'rest', tilt: 0.12, nod: t < T.youre + 1.0 ? 0.12 : 0, face: t < T.youre + 1.0 ? { relaxed: 0.35, blink: 0.45 } : CONF(t, { surprised: 0.3 }) }), cam: (t) => ({ pos: [0.42, 1.45, -1.95 + 0.1 * u01(t, T.youre, T.can3)], look: [0.0, 1.22, -3.7], fov: 44 }) },
    { id: 'can3', t0: T.can3, set: 'in', vex: (t) => ({ ...PC, can: 'show', r: 'hip', tilt: 0.06, jitter: 0.035, face: CONF(t, { surprised: 0.35, angry: 0 }), label: 'BZZT' }), cam: (t) => { const k = ease(u01(t, T.can3, T.six)); return { pos: [0.1 + 0.12 * k, 1.5, 0.3 - 0.2 * k], look: [1.72, 1.16, -1.55], fov: 48 }; }, shakeAmp: 0.004 },
    { id: 'meter', t0: T.six - 0.1, set: 'in', vex: (t) => ({ ...PC, can: 'chest', r: 'hip', tilt: 0.1, jitter: 0.03, face: CONF(t, { surprised: 0.2 }), label: 'BZZT' }), cam: (t) => ({ pos: [0.52, 1.38, -0.5 - 0.12 * u01(t, T.six, T.fdas)], look: [1.72, 1.27, -1.55], fov: 48 }), shakeAmp: 0.002 },
    { id: 'fda', t0: T.fdas - 0.1, set: 'in', vex: (t) => ({ ...PC, can: 'chest', r: 'point', tilt: -0.08, turn: -0.12, jitter: 0.03, face: CONF(t, { angry: 0.2 }), label: 'BZZT' }), cam: (t) => ({ pos: [0.92 - 0.06 * u01(t, T.fdas, T.pivot), 1.48, -0.78 + 0.06 * u01(t, T.fdas, T.pivot)], look: [1.72, 1.29, -1.55], fov: 46 }), shakeAmp: 0.002 },
    { id: 'pivot', t0: T.pivot, set: 'in', vex: (t) => ({ ...PC, can: 'low', r: t > T.cute - 0.35 ? 'shh' : 'hip', tilt: -0.12, lean: 0.06, face: CONF(t, { relaxed: t > T.cute - 0.3 ? 0.22 : 0.1, blinkLeft: t > T.cute + 0.15 ? 1 : 0 }), label: 'BZZT' }), cam: (t) => ({ pos: [0.95, 1.55, -0.85 - 0.08 * u01(t, T.pivot, T.scribe)], look: [1.72, 1.45, -1.55], fov: 42 }) },
    { id: 'type', t0: T.scribe, set: 'in', phone: 'type' },
    { id: 'write', t0: T.page - 0.05, set: 'in', phone: 'write' },
    { id: 'graph', t0: T.graph - 0.1, set: 'in', phone: 'graph' },
    { id: 'dawn', t0: T.morning, set: 'out', vex: (t) => ({ ...PO, y: SW, can: 'chest', r: 'hip', tilt: 0.06, jitter: 0.02, face: CONF(t, { surprised: 0.25 }), label: 'BZZT' }), cam: (t) => { const k = ease(u01(t, T.morning, T.morning + 1.7)); return { pos: [1.7 - 0.5 * k, 0.75, 12.5 - 2.5 * k], look: [0.3, 2.55, 3.2], fov: 50 }; } },
    { id: 'decay', t0: T.morning + 1.6, card: 'decay', set: 'out', vex: (t) => ({ ...PO, y: SW, can: 'chest', r: 'hip', tilt: 0.06, jitter: 0.025, face: CONF(t, { surprised: 0.25 }), label: 'BZZT' }), cam: (t) => ({ pos: [-0.45, 1.5, 6.25 - 0.15 * u01(t, T.morning + 1.6, T.at8)], look: [0.35, 1.33, 4.15], fov: 46 }) },
    { id: 'eight', t0: T.at8 - 0.1, card: 'decay', set: 'out', vex: (t) => ({ ...PO, y: SW, can: 'face', r: 'rest', tilt: -0.08, jitter: 0.045, face: { surprised: 0.45, blink: 0, blinkLeft: ((t * 3.1) % 1) < 0.18 ? 0.7 : 0 }, look: [0.1 * Math.sin(t * 19), 0], label: 'BZZT' }), cam: (t) => ({ pos: [0.95, 1.62, 5.85 - 0.12 * u01(t, T.at8, T.crash)], look: [0.38, 1.41, 4.15], fov: 42 }), shakeAmp: 0.003 },
    { id: 'crash', t0: T.crash, set: 'out', vex: (t) => { const s = ease(u01(t, T.hits - 0.2, T.hits + 0.5)); return { ...PO, y: SW, can: 'low', r: s > 0.5 ? 'slump' : 'rest', tilt: 0.2 * s, nod: 0.3 * s, lean: 0.15 * s, face: { relaxed: 0.2 + 0.35 * s, blink: 0.1 + 0.5 * s, sad: 0.25 * s }, label: 'BZZT' }; },
      cam: (t) => { const k = ease(u01(t, T.crash, T.thats)); return { pos: [-0.5 + 0.25 * k, 1.12, 6.6 - 0.6 * k], look: [0.35, 1.24, 4.15], fov: 48 }; }, kicks: () => [T.hits] },
    { id: 'drop', t0: T.thats - 0.05, set: 'out', vex: (t) => ({ ...PO, y: SW, can: 'low', r: 'slump', tilt: 0.24, nod: 0.42, lean: 0.22, face: { relaxed: 0.55, blink: 0.6, sad: 0.25 }, label: 'BZZT' }),
      cam: (t) => ({ pos: [1.75, 1.05, 6.35 - 0.12 * u01(t, T.thats, T.end)], look: [0.38, 1.02, 4.3], fov: 50 }), kicks: () => [T.crashW + 0.3] },
    { id: 'end', t0: T.end, set: 'in', vex: (t) => ({ ...P0, can: t > T.go - 0.4 ? 'low' : 'chest', r: t > T.ill - 0.3 ? 'shh' : t > T.go - 0.2 ? 'point' : 'hip', tilt: -0.1, face: CONF(t, { relaxed: t > T.ill - 0.2 ? 0.22 : 0.1, blinkLeft: t > T.know + 0.05 ? 1 : 0 }), label: 'BZZT' }), cam: (t) => ({ pos: [0.06, 1.48, -2.6 - 0.25 * u01(t, T.end, T.card)], look: [0.0, 1.38, -3.7], fov: 46 }) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  // the dropped can (crash): starts exactly where the held can is at the moment she lets go, falls, bounces, rolls toward the lens
  const dropped = makeCan('BZZT'); dropped.hole.visible = true; dropped.tab.rotation.x = -1.2; OUT.add(dropped); dropped.visible = false;
  const crashSh = SH.find((s2) => s2.id === 'drop');
  const poseVex = (sh, t) => { const v = glide(sh.vex, t, sh.vex(t)); const arm = v.jitter ? { armL: jitterArm(v.armL, t, v.jitter) } : {}; VEX.update(t, { ...lips(t), sway: 0.15, ...v, ...arm, aim: { 'twist.leftLowerArm': v.canTw, leftHand: v.canHd }, hands: { L: 'hold', R: R_HAND[v.r || 'rest'] }, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: v.y ?? 0, rotY: v.rotY ?? 0 }); VEX.root.updateMatrixWorld(true); return v; };
  poseVex(crashSh, T.crashW); const dropP0 = held.getWorldPosition(V()), dropQ0 = held.getWorldQuaternion(new THREE.Quaternion());
  const dropAt = (t) => { const s = t - T.crashW, g = 9.8, fallT = Math.sqrt(2 * Math.max(0.01, dropP0.y - SW - CAN_R) / g);
    const pos = dropP0.clone(); let tilt = 0;
    if (s < fallT) { pos.y = dropP0.y - 0.5 * g * s * s; pos.z += 0.25 * s; tilt = ease(clamp(s / fallT)) * 0.9; }
    else { const b = s - fallT, hop = Math.max(0, 0.9 * b - 4.9 * b * b) * 0.25; pos.y = SW + CAN_R + hop; pos.z += 0.25 * fallT + 0.35 * (1 - Math.exp(-b * 2.5)); tilt = 1; }
    return { pos, tilt }; };

  const camQ = new THREE.Quaternion();
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    IN.visible = sh.set === 'in'; OUT.visible = sh.set === 'out';
    scene.background.set(sh.set === 'out' ? 0xf4c4b0 : 0x0a0c12);
    // the HUD time on the wall clock too
    const ck = CLOCK(t); if (ck) { const [hm, ap] = ck[0].split(' '), [hh, mm] = hm.split(':').map(Number); setClock(hh + (ap === 'PM' && hh !== 12 ? 12 : 0), mm); } else setClock(22, 58);
    counterCans.forEach((c) => (c.visible = t >= T.can3)); fallen.visible = false;
    // the phone: typing → arrow → waiting page → the page writes itself
    if (t < T.scribe) drawPhone('home', 0, 0);
    else if (t < T.send) drawPhone('home', u01(t, T.scribe + 0.1, T.send - 0.12) + (t > T.send - 0.12 ? 1 : 0), 0);
    else if (t < T.page) drawPhone('wait', u01(t, T.send, T.page), 0);
    else drawPhone('desk', 0, writeP(t));
    // Vex + her can
    VEX.root.visible = !!sh.vex;
    let v = null;
    if (sh.vex) v = poseVex(sh, t);
    held.setLabel(v?.label || 'ZOOMR');
    held.tab.rotation.x = t >= T.canOne + 0.05 ? -1.2 * ease(u01(t, T.canOne + 0.05, T.canOne + 0.17)) : 0; held.hole.visible = t >= T.canOne + 0.1;
    held.visible = !(sh.id === 'drop' && t >= T.crashW);
    dropped.visible = sh.id === 'drop' && t >= T.crashW;
    if (dropped.visible) { const d = dropAt(t); dropped.position.copy(d.pos); dropped.quaternion.copy(dropQ0).slerp(camQ.setFromUnitVectors(V(0, 1, 0), V(1, 0, 0.3).normalize()), d.tilt); }
    // camera
    let cam;
    if (sh.phone === 'type') cam = phoneCam(0.5, 0.42, 0.205 - 0.015 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'write') cam = phoneCam(0.5, 0.47, 0.2 - 0.02 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'graph') { const gu = (PX + graphC[0] * PWp / sheet.w) / PHW, gv = (PY + graphC[1] * PHp / sheet.h) / PHH; cam = phoneCam(gu, gv, 0.12 - 0.015 * u01(t, sh.t0, sh.t1)); }
    else if (sh.canCam) { const c = held.getWorldPosition(V()), k = ease(u01(t, sh.t0, sh.t1)); cam = { pos: [c.x + 0.34 - 0.04 * k, c.y + 0.17, c.z + 0.3 - 0.05 * k], look: [c.x - 0.02, c.y + 0.07, c.z], fov: 40 }; }
    else cam = sh.cam(t);
    if (SIDE_DBG && sh.vex) { const h = VEX.bpos('leftHand'), f = V(Math.sin(v?.rotY ?? 0), 0, Math.cos(v?.rotY ?? 0)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, 0.75).addScaledVector(f, 0.15).add(V(0, 0.05, 0)).toArray(), look: h.toArray(), fov: 40 }; }
    let amp = sh.shakeAmp ?? 0;
    if (sh.kicks) for (const kt of sh.kicks()) { const a = t - kt; if (a >= 0 && a < 0.35) amp = Math.max(amp, 0.028 * (1 - a / 0.35)); }
    studio.camera.far = sh.set === 'out' ? 450 : 60; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, amp);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -3).addScaledVector(side, -1.5).add(V(0, 3, 0)); key.intensity = sh.set === 'in' ? 0.7 : 0;
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.26 * Math.pow(d, 1.6)) * (sh.set === 'out' ? 0.6 : 1) : 0; }
    // life: slush swirls, hot dogs roll, fridge LEDs steady
    slushTex.forEach((tx, i) => (tx.offset.y = t * (0.25 + i * 0.07)));
    dogs.forEach((d, i) => (d.rotation.y = t * 3 + i));
    diagram(t, sh);
    pixel.set(sh.phone ? 1 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
