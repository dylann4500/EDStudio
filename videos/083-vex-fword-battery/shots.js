// 083 — "Why your f*cking phone dies at 20%" (Scribe lane: the f-word explainer series × the Vex explainer). User, Nov 10: "a video where
// goth mommy just says fucking a lot too… one of those funny profane ones… merge the fucking with the goth mommy".
//   format  = 076/077's Vex explainer (Vex IN the place, sourced numbers on pixel cards, a teasing "Cute.", Scribe at ~52 %) with the f-word
//             series' rhythm (058/062/063: "fucking" in almost every line, 19 in 46 s; censored on screen as F*CKING in red);
//   place   = 073's dorm cutaway (engine/build/dorm.js): Vex's goth room upstairs, DEREK (073's toon) downstairs on his loft bed — his phone
//             dies at 20 % on "Ask Derek" (the crossover cameo), the dorm ROOF at night for the cold beat (pixel snow, Vex in her
//             bikini shivering), a nightstand with a charging stand for the Scribe beat;
//   facts   = (sources in caption.md's comment) a Li-ion cell = lithium ions shuttling between a graphite anode and a metal-oxide cathode
//             (charging pushes them into the graphite, using the phone lets them flow back); the battery % is an estimate from the voltage
//             (+ current) — a fuel gauge, not a measurement; Apple: impedance rises with chemical age, at a low state of charge and in the
//             cold, and a battery that can't supply a peak load drops under the cutoff voltage = an "unexpected shutdown" with charge left;
//             iPhone 14 and earlier: 80 % of the original capacity at 500 complete charge cycles; ambient heat above 35 °C (95 °F) can
//             permanently damage capacity; cold is a temporary drop;
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated, 076's band y 0.44–0.69): ions doing laps / charging /
//             scrolling, the % gauge + a voltmeter, the voltage sagging under the cutoff (OFF), battery health 100 → 80 % over 500 cycles,
//             slow ions in the cold, a phone cooking on a dashboard; + a battery HUD top-left (her phone: 20 % → dead → charging);
//   Scribe  = a feature no Vex reel has shown: README §The handwriting picker — the set's own "Aa" control above the sheet ("Whose
//             handwriting": Your handwriting · 89 characters, then each library hand with its note) → she picks the library hand "Quick
//             print" (the real library hand from the Scribe repo, videos/083/quickprint.json) and the page on the desk is rewritten in it
//             ("Changing hands rewrites the page on the desk at once"). Before that the page writes itself ON THE PHONE SCREEN (never a pen
//             on paper): chemistry — the Li-ion half-reactions, Q = It → mol Li⁺ → grams, and a hand-drawn cell diagram (anode | separator
//             | cathode, Li⁺ arrows, the wire through the phone with e⁻).
//   persona = the lighter Vex: annoyed, deadpan, confident; Fish Dolly at the Nov 10 regular pace (speed 1.2 + tempo 1.2 → 3.3 words/s).
// Guardrails: no real brands or OS screens (a generic lock screen + feed), swimwear only, no sexual lines; props on hand bones (phone in her
// LEFT hand: back on the palm, screen out of the palm, searched per arm preset so the screen faces the lens or her eyes; Derek's phone rides
// his toon hand).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet, layoutHand } from '@engine/build/scribe.js';
import { buildDorm, D as DD, makeCord } from '@engine/build/dorm.js';
import { makeToon } from '@engine/build/toon.js';

const PI = Math.PI, PIXEL = 4, DBG = '';   // 'side' | 'side2' = the phone grip from either side (props check; never ship it set)
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
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
    ions: B.ions.t0, lithium: W('ions', 'lithium'), charging: W('ions', 'charging'), shoves: W('ions', 'shoves'), scrolling: W('ions', 'scrolling'),
    guess: B.guess.t0, that: W('guess', 'that'), guessW: W('guess', 'guess'), reads: W('guess', 'reads'), voltage: W('guess', 'voltage'),
    dip: B.dip.t0, old: W('dip', 'old'), open: W('dip', 'open'), dips: W('dip', 'dips'), cutoff: W('dip', 'cutoff'), shuts: W('dip', 'shuts'), off: W('dip', 'off'),
    with: W('dip', 'with'), twenty: W('dip', 'twenty'), derek: B.derek.t0, derekW: W('derek', 'derek'), every: W('derek', 'every'), night: W('derek', 'night'),
    pivot: B.pivot.t0, chem: W('pivot', 'chem'), its: W('pivot', 'its'), cute: W('pivot', 'cute'),
    scribe: B.scribe.t0, scribeW: W('scribe', 'scribe'), writes: W('scribe', 'writes'), cell: W('scribe', 'cell'),
    swap: B.swap.t0, cant: W('swap', 'cant'), swapW: W('swap', 'swap'), hand2: W('swap', 'handwriting'),
    age: B.age.t0, every2: W('age', 'every'), five: W('age', 'five'), cycles: W('age', 'cycles'), eighty: W('age', 'eighty'),
    cold: B.cold.t0, ions2: W('cold', 'ions'), slow: W('cold', 'slow'), heat: B.heat.t0, heatW: W('heat', 'heat'), ninety: W('heat', 'ninetyfive'), cooks: W('heat', 'cooks'), aboutW: W('age', 'about'),
    end: B.end.t0, now: W('end', 'now'), phone: W('end', 'phone'),
  };
  T.card = T.phone + 0.55; T.dead = T.off; T.derekDead = T.every + 0.0; T.send = T.scribeW + 0.12; T.page = T.writes - 0.08;
  T.tapAa = T.cant + 0.05; T.tapQP = T.swapW - 0.02; T.rewrite = T.swapW + 0.1;

  const toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const std = (c, r = 0.7, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...x });
  const basic = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (shadow) o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };

  // ---------------------------------------------------------------- the dorm (073): Vex upstairs, Derek downstairs, the roof
  const dorm = buildDorm(studio); dorm.setSag(0); dorm.setPower(1, 1);
  const FY = DD.FY, ROOF = DD.ROOF;
  scene.background = new THREE.Color(0x1a1636);
  // a nightstand by her bed with a charging stand (the phone goes there after it dies) + its cord to an outlet
  const NS = [-1.02, -3.08], NSH = 0.52;
  const ns = new THREE.Group(); ns.position.set(NS[0], FY, NS[1]); dorm.root.add(ns);
  bx(ns, 0.46, NSH, 0.42, std(0x1f1a24, 0.6), 0, NSH / 2, 0); bx(ns, 0.4, 0.02, 0.01, std(0x8a6aa8, 0.4), 0, NSH * 0.55, 0.211, false);
  { const can = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 10), std(0xf4efe4, 0.6)); can.position.set(0.15, NSH + 0.05, -0.08); ns.add(can); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), basic({ color: 0xffb050 })); fl.position.set(0.15, NSH + 0.115, -0.08); ns.add(fl); }
  bx(ns, 0.09, 0.02, 0.09, std(0x2a2a30, 0.4), -0.04, NSH + 0.01, 0.0, false);   // the stand's base
  const stand = new THREE.Group(); stand.position.set(-0.04, NSH + 0.02, 0.0); stand.rotation.x = -0.32; ns.add(stand);
  bx(stand, 0.05, 0.11, 0.012, std(0x2a2a30, 0.4), 0, 0.055, -0.012, false);
  makeCord(dorm.root, [[NS[0] - 0.04, FY + NSH + 0.02, NS[1] - 0.05], [NS[0] - 0.05, FY + NSH - 0.02, NS[1] - 0.21], [NS[0] - 0.05, FY + 0.32, NS[1] - 0.22], [NS[0] + 0.02, FY + 0.3, -3.58]], { r: 0.006, color: 0xe8e8ec });
  bx(dorm.root, 0.08, 0.12, 0.02, std(0xf4f1ea, 0.6), NS[0] + 0.02, FY + 0.3, -3.59, false);   // outlet plate

  // ---------------------------------------------------------------- phones: one for her hand, one on the stand, one for Derek
  const PW = 0.072, PH = 0.152, PT = 0.009;
  function makePhoneMesh(caseCol, canvasW, canvasH) {
    const g = new THREE.Group(), body = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, PT), toon(caseCol)); body.castShadow = true; g.add(body);
    const tex = crisp(canvasW, canvasH), scr = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.006, PH - 0.008), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    scr.position.z = PT / 2 + 0.0004; g.add(scr);
    const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 12), toon(0x1a1a1e)); cam.rotation.x = PI / 2; cam.position.set(-0.02, 0.055, -PT / 2 - 0.0015); g.add(cam);
    return { g, scr, tex, W: PW - 0.006, H: PH - 0.008 };
  }
  const heldPh = makePhoneMesh(0x2a1a34, 330, 710), standPh = makePhoneMesh(0x2a1a34, 720, 1550);
  standPh.g.position.set(0, 0.085, 0.0); stand.add(standPh.g);
  // the held phone's screens: a generic lock screen at 20 %, a generic video feed, black (dead)
  const clockFont = (g, s) => (g.font = `900 ${s}px Inter, Arial`);
  function drawHeld(mode) {
    const g = heldPh.tex.canvas.getContext('2d'), w = 330, h = 710;
    if (mode === 'dead') { g.fillStyle = '#050507'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.05)'; g.save(); g.rotate(-0.5); g.fillRect(-60, 260, 600, 50); g.restore(); heldPh.tex.needsUpdate = true; return; }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a0f24'); gr.addColorStop(1, '#4a1a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const batt = (x, y, s, col) => { g.strokeStyle = '#ffffff'; g.lineWidth = 3 * s; g.strokeRect(x, y, 46 * s, 22 * s); g.fillStyle = '#ffffff'; g.fillRect(x + 46 * s, y + 7 * s, 4 * s, 8 * s); g.fillStyle = col; g.fillRect(x + 4 * s, y + 4 * s, 8 * s, 14 * s); };
    if (mode === 'lock') {
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = '600 22px Inter, Arial'; g.fillText('Tuesday, November 10', w / 2, 92); clockFont(g, 96); g.fillText('1:47', w / 2, 190);
      batt(85, 300, 3.2, '#ff3b3b'); g.fillStyle = '#ff4f6a'; clockFont(g, 84); g.fillText('20%', w / 2, 500); g.font = '700 22px Inter, Arial'; g.fillStyle = '#ffd0d8'; g.fillText('LOW BATTERY', w / 2, 545);
      // goth wallpaper bits: a bat + a moon
      g.fillStyle = '#f2e9ff'; g.beginPath(); g.arc(250, 620, 26, 0, 7); g.fill(); g.fillStyle = '#2a1238'; g.beginPath(); g.arc(262, 612, 24, 0, 7); g.fill();
      g.textAlign = 'left';
    } else {   // a generic short-video feed: a big clip, side icons, caption bars + the status bar at 20 %
      g.fillStyle = '#101014'; g.fillRect(0, 0, w, h);
      const cg = g.createLinearGradient(0, 60, 0, 640); cg.addColorStop(0, '#ff8a3c'); cg.addColorStop(1, '#ff3c8a'); g.fillStyle = cg; g.fillRect(0, 50, w, 600);
      g.fillStyle = '#ffd43b'; g.beginPath(); g.arc(150, 300, 90, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(120, 280, 12, 0, 7); g.arc(180, 280, 12, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#1a1a1a'; g.beginPath(); g.arc(150, 315, 40, 0.2, PI - 0.2); g.stroke();
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(290, 380 + i * 80, 22, 0, 7); g.fill(); }
      g.fillStyle = '#ff3b5c'; g.beginPath(); g.arc(290, 380, 12, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(20, 580, 200, 14); g.fillRect(20, 604, 150, 12);
      g.fillStyle = '#ffffff'; g.font = '700 20px Inter, Arial'; g.fillText('1:48', 22, 34); g.fillStyle = '#ff4f6a'; g.fillText('20%', 236, 34); batt(280, 18, 0.8, '#ff3b3b');
    }
    heldPh.tex.needsUpdate = true;
  }
  let heldKey = ''; const setHeld = (m) => { if (m !== heldKey) { heldKey = m; drawHeld(m); } };

  // ---------------------------------------------------------------- Scribe: two sheets of the same homework (her hand + the library's "Quick print")
  const [G, GQ, icon] = await Promise.all([loadHand('/videos/049-scribe-promo/hand.json'), loadHand('/videos/083-vex-fword-battery/quickprint.json'), loadImg('/videos/049-scribe-promo/scribe-icon.png')]);
  const cellFig = ({ k, y }) => {   // the cell, drawn by the pen: container | anode (C6) : separator : cathode (CoO2), Li+ arrows, the wire through the phone
    const top = y + 215, bot = y + 418, wy = y + 150, out = [];
    out.push(...k.text('(-)', 196, top - 14, { u: 22 }), ...k.text('(+)', 790, top - 14, { u: 22 }));
    out.push(...k.poly([[268, top], [268, wy], [452, wy]], { line: 3.4 }), ...k.poly([[452, wy - 34], [578, wy - 34], [578, wy + 34], [452, wy + 34]], { close: true }), ...k.text('phone', 466, wy + 9, { u: 20 }));
    out.push(...k.poly([[578, wy], [762, wy], [762, top]], { line: 3.4 }), ...k.arrow([292, wy - 24], [418, wy - 24], { head: 13 }), ...k.text('e^-', 334, wy - 40, { u: 22 }));
    out.push(...k.poly([[170, top], [862, top], [862, bot], [170, bot]], { close: true }));
    out.push(...k.poly([[186, top + 16], [350, top + 16], [350, bot - 16], [186, bot - 16]], { close: true }), ...k.text('C_6', 236, top + 112, { u: 30 }));
    out.push(...k.poly([[682, top + 16], [846, top + 16], [846, bot - 16], [682, bot - 16]], { close: true }), ...k.text('CoO_2', 704, top + 112, { u: 28 }));
    out.push(...k.dashed([516, top + 8], [516, bot - 8]));
    out.push(...k.arrow([372, top + 66], [662, top + 66], { head: 15 }), ...k.text('Li^+', 474, top + 50, { u: 24 }), ...k.arrow([372, top + 150], [662, top + 150], { head: 15 }));
    out.push(...k.text('anode', 218, bot + 40, { u: 20 }), ...k.text('cathode', 716, bot + 40, { u: 20 }));
    return out; };
  const PROBS = [
    { q: '', h: 0.7, a: '1)  anode:  LiC_6 → C_6 + Li^+ + e^-\ncathode:  CoO_2 + Li^+ + e^- → LiCoO_2', au: 26, lineH: 2.0 },
    { q: '', h: 0.85, a: '2)  Q = 4.0 Ah × 3600 s/h = 14,400 C\nn = Q / F = 14,400 / 96,485\n= 0.149 mol Li^+', au: 25, lineH: 1.9,
      fig: ({ k, y }) => { const yy = y + 74 + 3 * 47.5, a = k.text('m = 0.149 × 6.94 =', 120, yy, { u: 25 }), b = k.text('1.04 g', k.bbox(a).x1 + 28, yy, { u: 25 }); return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
    { q: '', h: 1.4, a: '3)  discharging  (your phone on):', au: 25, fig: cellFig },
  ];
  const sheetOpts = { rich: true, seed: 8, name: 'Vex', title: 'Li-ion batteries', note: 'CHEM 102  ·  electrochemistry  ·  show work', page: 'p. 1', problems: PROBS };
  const sheetA = makeSheet(G, sheetOpts), sheetQ = makeSheet(GQ, sheetOpts);
  const PHW = 720, PHH = 1550, RED = '#9a1c25', phT = standPh.tex;
  const PX = 40, PY = 424, PWp = 640, PHp = Math.round(640 * sheetA.h / sheetA.w);
  const nib = crisp(64, 64, (g) => { g.save(); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.restore(); }).canvas;
  const PROMPT = 'battery homework. solve all 3, show work + draw the cell';
  const thumbC = crisp(120, 150, (g, w, h) => { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#9aa0aa'; for (let i = 0; i < 9; i++) g.fillRect(12, 16 + i * 14, 40 + hash(i) * 60, 4); g.strokeStyle = '#9aa0aa'; g.lineWidth = 2; g.strokeRect(20, 108, 80, 30); }).canvas;
  const sampleA = layoutHand(G, 'Your handwriting', { x: 0, y: 0, u: 30, seed: 4 }), sampleQ = layoutHand(GQ, 'Quick print', { x: 0, y: 0, u: 30, seed: 4 });
  const drawItems = (g, its, x, y, s = 1) => { for (const it of its) g.drawImage(it.c, x + it.x * s, y + it.y * s, it.w * s, it.h * s); };
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? `${line} ${w}` : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; };
  const AA = { x: 330, y: 362, w: 330, h: 50 }, ROWQ = { x: 160, y: 556, w: 480, h: 84 };
  let phKey = '';
  // mode: charge | home (k = typed, ≥ 1 sent) | desk (p = written of sheet S; pick = 0 none, (0,1] popover, tap = row pressed)
  function drawStand(mode, k = 0, p = 0, o = {}) {
    const key = `${mode}${Math.round(k * 60)}${Math.round(p * 2)}${o.q ? 'q' : ''}${o.pop ? Math.round(o.pop * 10) : ''}${o.tap ?? ''}${o.pct ?? ''}`; if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d');
    if (mode === 'charge') {
      g.fillStyle = '#050507'; g.fillRect(0, 0, PHW, PHH); g.fillStyle = '#7cf05f'; g.beginPath(); g.moveTo(400, 420); g.lineTo(280, 700); g.lineTo(370, 700); g.lineTo(320, 960); g.lineTo(460, 640); g.lineTo(370, 640); g.closePath(); g.fill();
      g.textAlign = 'center'; clockFont(g, 120); g.fillText(`${o.pct ?? 21}%`, PHW / 2, 1150); g.textAlign = 'left'; phT.needsUpdate = true; return;
    }
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    g.fillStyle = '#1d1d1d'; g.font = '600 28px Inter, Arial'; g.fillText('1:52', 40, 48); g.fillStyle = '#2f9a3a'; g.fillText(`⚡ ${o.pct ?? 22}%`, 590, 48);
    g.drawImage(icon, 30, 78, 54, 54); g.fillStyle = '#1d1d1d'; g.font = '40px Georgia, serif'; g.fillText('Scribe', 96, 120); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 156, PHW, 2);
    if (mode === 'home') {
      g.fillStyle = '#1d1d1d'; g.font = '46px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PHW / 2, 440); g.fillText('solving today?', PHW / 2, 498); g.textAlign = 'left';
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(36, 580, PHW - 72, 380, 28); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.stroke();
      g.drawImage(thumbC, 66, 606, 96, 120); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(66, 606, 96, 120);
      g.font = '30px Inter, Arial'; const n = Math.round(PROMPT.length * clamp(k)), lines = wrap(g, PROMPT.slice(0, n), PHW - 140);
      g.fillStyle = '#1d1d1d'; lines.forEach((L, i) => g.fillText(L, 66, 780 + i * 42));
      if (k < 1 && Math.floor(k * 30) % 2 === 0) { const L = lines[lines.length - 1] || '', x = 66 + g.measureText(L).width + 3; g.fillRect(x, 752 + Math.max(0, lines.length - 1) * 42, 3, 36); }
      const pressed = k >= 1; g.fillStyle = pressed ? '#5a0e14' : RED; g.beginPath(); g.arc(PHW - 92, 906, 34 * (pressed ? 0.9 : 1), 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(PHW - 92, 922); g.lineTo(PHW - 92, 890); g.moveTo(PHW - 106, 904); g.lineTo(PHW - 92, 890); g.lineTo(PHW - 78, 904); g.stroke();
      if (pressed) { g.fillStyle = 'rgba(40,30,40,.28)'; g.beginPath(); g.arc(PHW - 86, 914, 40, 0, 7); g.fill(); }
      phT.needsUpdate = true; return;
    }
    // the desk: her prompt (photo + words) on the right, the round's row, the set's pen / paper / Aa controls, the page, the docked composer
    g.fillStyle = '#e8e2d6'; g.beginPath(); g.roundRect(PHW - 500, 176, 470, 120, 22); g.fill(); g.drawImage(thumbC, PHW - 488, 186, 76, 96);
    g.fillStyle = '#1d1d1d'; g.font = '24px Inter, Arial'; wrap(g, PROMPT, 340).slice(0, 3).forEach((L, i) => g.fillText(L, PHW - 400, 218 + i * 30));
    g.fillStyle = '#6a6a6a'; g.font = '26px Inter, Arial'; g.fillText('1 page', 40, 340); g.font = '600 26px Inter, Arial'; g.fillStyle = '#3a3a3a'; g.fillText('Shuffle', 290, 340); g.fillText('Replay', 418, 340); g.fillStyle = RED; g.fillText('Export PDF', 540, 340);
    // pen + paper icons, then the Aa pill
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(52, 404); g.lineTo(84, 368); g.lineTo(92, 376); g.lineTo(60, 412); g.closePath(); g.stroke(); g.fillStyle = '#26346b'; g.beginPath(); g.moveTo(52, 404); g.lineTo(48, 416); g.lineTo(60, 412); g.fill();
    g.strokeRect(118, 366, 34, 44); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(124, 378 + i * 10); g.lineTo(146, 378 + i * 10); g.stroke(); }
    g.fillStyle = o.pop ? '#e8e2d6' : '#ffffff'; g.beginPath(); g.roundRect(AA.x - AA.w / 2 + 40, AA.y - AA.h / 2 + 26, AA.w, AA.h, 25); g.fill(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#1d1d1d'; g.font = '700 26px Georgia, serif'; g.fillText('Aa', AA.x - AA.w / 2 + 60, AA.y + 36); g.font = '26px Inter, Arial'; g.fillText(o.q ? 'Quick print' : 'Your handwriting', AA.x - AA.w / 2 + 110, AA.y + 36);
    g.beginPath(); g.moveTo(AA.x + AA.w / 2 + 6, AA.y + 22); g.lineTo(AA.x + AA.w / 2 + 18, AA.y + 34); g.lineTo(AA.x + AA.w / 2 + 30, AA.y + 22); g.strokeStyle = '#1d1d1d'; g.lineWidth = 3; g.stroke();
    const S = o.q ? sheetQ : sheetA, tip = S.draw(p);
    g.fillStyle = '#fff'; g.fillRect(PX - 4, PY - 4, PWp + 8, PHp + 8); g.drawImage(S.canvas, PX, PY, PWp, PHp); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PX, PY, PWp, PHp);
    if (p < S.total - 0.5 && p > 0) { const cx = PX + tip[0] * PWp / S.w, cy = PY + tip[1] * PHp / S.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
    // the docked composer
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(30, PHH - 190, PHW - 60, 140, 26); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#9a9a9a'; g.font = '30px Inter, Arial'; g.fillText('Ask Scribe', 64, PHH - 130);
    g.fillStyle = '#c8a0a4'; g.beginPath(); g.arc(PHW - 96, PHH - 120, 30, 0, 7); g.fill();
    // the handwriting popover ("Whose handwriting"), each hand's name written in that hand
    if (o.pop) {
      const a = clamp(o.pop * 3); g.globalAlpha = a;
      g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.roundRect(166, 420, 500, 262, 22); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(160, 414, 500, 262, 22); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#6a6a6a'; g.font = '600 22px Inter, Arial'; g.fillText('WHOSE HANDWRITING', 188, 456);
      const row = (yy, its, note, on, hl) => { if (hl) { g.fillStyle = '#f3e4e6'; g.fillRect(166, yy - 4, 488, 92); }
        g.fillStyle = on ? RED : '#c8c2b6'; g.font = '700 30px Inter, Arial'; g.fillText(on ? '✓' : '', 186, yy + 44); drawItems(g, its, 232, yy + 46, 1); g.fillStyle = '#7a7a7a'; g.font = '20px Inter, Arial'; g.fillText(note, 232, yy + 76); };
      row(470, sampleA, 'Yours · 89 characters', !o.q, false); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(180, 562, 460, 2);
      row(568, sampleQ, 'Library · light, quick everyday print', !!o.q, o.tap === 2);
      g.globalAlpha = 1;
    }
    if (o.tap) { const [tx, ty] = o.tap === 1 ? [AA.x + 40, AA.y + 50] : [420, 620]; g.fillStyle = 'rgba(40,30,40,.25)'; g.beginPath(); g.arc(tx, ty, 38, 0, 7); g.fill(); g.strokeStyle = 'rgba(40,30,40,.35)'; g.lineWidth = 4; g.beginPath(); g.arc(tx, ty, 52, 0, 7); g.stroke(); }
    phT.needsUpdate = true;
  }
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrUp = V();
  const phoneCam = (ph, u, v, d, fov = 40) => { ph.scr.updateWorldMatrix(true, false); ph.scr.localToWorld(scrP.set((u - 0.5) * ph.W, (0.5 - v) * ph.H, 0)); ph.scr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrUp.set(0, 1, 0).applyQuaternion(scrQ);
    const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov, up: scrUp.clone() }; };
  // writing pace: problems 1–2 on "it writes the whole fucking thing in my handwriting", the cell (problem 3) on "cell diagram and all"
  const wOf = (it) => (it.kind === 'p' ? it.w : 1), pStart = (S, pi) => S.items.slice(0, S.items.findIndex((it) => it.pi === pi)).reduce((s, it) => s + wOf(it), 0);
  const P12 = pStart(sheetA, 2);
  const writeP = (t) => (t < T.cell - 0.12 ? P12 * ease(u01(t, T.page, T.cell - 0.12)) : P12 + (sheetA.total - P12) * u01(t, T.cell - 0.12, T.swap - 0.05));
  const rewriteP = (t) => sheetQ.total * u01(t, T.rewrite, T.rewrite + 1.45);
  const figBox = (S) => { const its = S.items.filter((it) => it.pi === 2 && it.kind === 'p').flatMap((it) => it.pts); const xs = its.map((q) => q[0]), ys = its.map((q) => q[1]); return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; };
  const FIGC = figBox(sheetA), toUV = (sx, sy) => [(PX + sx * PWp / sheetA.w) / PHW, (PY + sy * PHp / sheetA.h) / PHH];

  // ---------------------------------------------------------------- Derek (073's toon) on his loft bed, scrolling; his phone rides his right hand
  const derek = makeToon({ skin: 0xf1c7a0, shirt: 0xd8343a, pants: 0x34495e, hair: 0x3a2414, hairStyle: 'messy' }); dorm.root.add(derek.root);
  { const hp = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 20, PI * 1.2), std(0x1c1c22, 0.4)); derek.head.add(hp); hp.rotation.set(PI / 2 + 0.3, 0, -0.1 * PI - 0.2); hp.position.set(0, -0.26, 0); }
  const dX = DD.derek[0], dZ = DD.derek[1], DY = DD.loftTop + 0.08 - 0.42;
  const derekPose = (t, scream, slump) => ({ x: dX, y: DY + 0.06 * scream, z: dZ, rotY: 0, t, lean: 0.12 - 0.25 * scream + 0.1 * slump, eyes: scream > 0.2 ? 'wide' : slump > 0.5 ? 'half' : 'open', mouth: scream > 0.2 ? 'o' : slump > 0.5 ? 'frown' : 'smile',
    brows: scream > 0.2 ? 0.9 : slump > 0.5 ? 0.6 : 0, look: [0, -0.6 + 0.2 * scream],
    armL: { x: -0.75 - 1.9 * scream + 0.12 * Math.sin(t * 13) * scream, z: 0.25 + 0.45 * scream, el: 1.2 - 0.8 * scream }, armR: { x: -0.75, z: 0.25, el: 1.2 },
    legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.5 }, head: { x: 0.32 - 0.22 * scream + 0.15 * slump, y: 0, z: 0.07 * Math.sin(t * 9) * scream } });
  const dPh = makePhoneMesh(0x1e3b78, 330, 710); dPh.g.scale.setScalar(1.5);   // toon scale (his head is ~0.54 m)
  const dGlow = new THREE.PointLight(0x7ad8ff, 1.3, 1.1, 1.6); dGlow.position.set(0, 0, 0.12); dPh.g.add(dGlow);   // the feed lights his face; it dies with the phone
  { derek.set(derekPose(0, 0, 0)); derek.root.updateMatrixWorld(true);
    const hR = derek.hand(1), hL = derek.hand(-1), pR = hR.getWorldPosition(V()), pL = hL.getWorldPosition(V()), head = derek.head.getWorldPosition(V());
    const c = pR.clone().lerp(pL, 0.5).add(V(0, 0.05, 0)), n = head.clone().sub(c).normalize(), xA = pL.clone().sub(pR); xA.addScaledVector(n, -xA.dot(n)).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, n.clone().cross(xA), n));   // screen (local +z) toward his face
    hR.add(dPh.g); dPh.g.position.copy(hR.worldToLocal(c.clone())); dPh.g.quaternion.copy(hR.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q)); }
  let dKey = ''; const setDerekScreen = (dead) => { const m = dead ? 'dead' : 'feed'; if (m === dKey) return; dKey = m; const g = dPh.tex.canvas.getContext('2d');
    if (dead) { g.fillStyle = '#050507'; g.fillRect(0, 0, 330, 710); } else { const gr = g.createLinearGradient(0, 0, 0, 710); gr.addColorStop(0, '#3ac7ff'); gr.addColorStop(1, '#7a3fd0'); g.fillStyle = gr; g.fillRect(0, 0, 330, 710); g.fillStyle = '#ffd43b'; g.fillRect(60, 220, 210, 210); g.fillStyle = '#ff4f6a'; g.font = '800 36px Inter'; g.fillText('20%', 220, 40); }
    dPh.tex.needsUpdate = true; dGlow.intensity = dead ? 0 : 1.3; };

  // ---------------------------------------------------------------- Vex (067's look) + her phone in the LEFT hand
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  // left arm (her frame: +x = her left, +z = forward): the phone shown to the lens, looked at, low by her side
  const L_ARMS = {
    show: [[0.3, -0.66, 0.6], [-0.22, 0.3, 0.93]], look: [[0.22, -0.92, 0.3], [-0.5, 0.32, 0.8]], low: [[0.22, -1, 0.08], [0.12, -0.6, 0.79]],
    hip: ARMS.hip.L, rest: ARMS.rest.L, cross: ARMS.cross.L,
  };
  const PHONE_ARMS = ['show', 'look', 'low'];
  const R_ARMS = { rest: [[-0.24, -1, 0.04], [-0.12, -1, 0.14]], hip: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]], ...Object.fromEntries(['point', 'peace', 'kissOut', 'shades', 'wave', 'beckon', 'cross'].map((k) => [k, ARMS[k].R])),
    temple: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]], fist: [[-0.3, -0.45, 0.6], [0.25, 0.92, 0.25]], down: [[-0.28, -0.55, 0.78], [-0.1, -0.72, 0.68]], fan: [[-0.32, -0.62, 0.62], [0.35, 0.88, 0.3]] };
  const R_HAND = { rest: 'relax', hip: 'relax', point: 'point', peace: 'peace', kissOut: 'open', shades: 'relax', wave: 'open', beckon: 'beckon', cross: 'relax', temple: 'point', fist: 'fist', down: 'point', fan: 'open' };
  const GRIP = [0.08, 0.05, 0.05, 0.06, 0.08];   // a flat hand under the phone's back: fingers along it, never through the screen
  // attach in the 'show' pose: long axis along the hand (wrist → middle knuckle), back on the palm, screen = out of the palm
  VEX.update(0, { pose: 'rest', armL: L_ARMS.show, hands: { L: GRIP } }); VEX.root.updateMatrixWorld(true);
  const eyeH = VEX.bpos('head').y + 0.11 - VEX.root.position.y;
  const hb = VEX.bpos('leftHand'), mid = VEX.bpos('leftMiddleProximal'), idx = VEX.bpos('leftIndexProximal'), lit = VEX.bpos('leftLittleProximal');
  const fwd = mid.clone().sub(hb).normalize(), across = idx.clone().sub(lit).normalize(), palm = fwd.clone().cross(across).normalize();
  const acr = fwd.clone().cross(palm).normalize();   // (acr, fwd, palm) is right-handed
  const phGrp = VEX.attach('leftHand', hb.clone().addScaledVector(fwd, 0.072).addScaledVector(palm, 0.021 + PT / 2).toArray());
  // spinG turns the phone about the palm normal (its back stays flat on the palm: portrait ↔ diagonal is a real way to hold one)
  const spinG = new THREE.Group(); phGrp.add(spinG); const palmL = palm.clone();
  heldPh.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(acr, fwd, palm)); spinG.add(heldPh.g);
  const setSpin = (a) => spinG.quaternion.setFromAxisAngle(palmL, a);
  // search a forearm twist + wrist bend per phone preset so the screen faces its target (the lens side, or her eyes for 'look')
  const PHFIX = {}, qq = new THREE.Quaternion(); setSpin(0);
  for (const name of PHONE_ARMS) {
    const arm = L_ARMS[name]; let best = { score: -9, tw: 0, hd: arm[1] };
    for (const sb of [-0.35, 0, 0.35, 0.7]) for (let tw = -1.6; tw <= 1.6001; tw += 0.08) {
      const hd = V(arm[1][0], arm[1][1] + sb, arm[1][2]).normalize().toArray();
      VEX.update(0, { pose: 'rest', armL: arm, hands: { L: GRIP }, aim: { 'twist.leftLowerArm': tw, leftHand: hd } }); VEX.root.updateMatrixWorld(true);
      const n = V(0, 0, 1).applyQuaternion(heldPh.g.getWorldQuaternion(qq)), c = heldPh.g.getWorldPosition(V());
      const tgt = name === 'look' ? V(0, VEX.bpos('head').y + 0.06, 0.12).sub(c).normalize() : V(0, name === 'low' ? 0.1 : 0.3, 1).normalize();
      const score = n.dot(tgt) - 0.04 * Math.abs(sb) - 0.02 * Math.abs(tw);
      if (score > best.score) best = { score, tw, hd, d: n.dot(tgt) };
    }
    // the spin that stands the phone upright at that pose: world up projected onto the screen plane vs the phone's long axis
    VEX.update(0, { pose: 'rest', armL: arm, hands: { L: GRIP }, aim: { 'twist.leftLowerArm': best.tw, leftHand: best.hd } }); VEX.root.updateMatrixWorld(true);
    const n = V(0, 0, 1).applyQuaternion(heldPh.g.getWorldQuaternion(qq)), yAx = V(0, 1, 0).applyQuaternion(qq), u = V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    best.spin = Math.atan2(n.dot(yAx.clone().cross(u)), yAx.dot(u));
    PHFIX[name] = best;
  }
  console.log('[083] phone fix', JSON.stringify(Object.fromEntries(Object.entries(PHFIX).map(([k, v]) => [k, [v.tw.toFixed(2), v.d.toFixed(2), v.spin.toFixed(2)]]))));
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const armsOf = (v) => ({ L: L_ARMS[v.l || 'hip'], R: R_ARMS[v.r || 'rest'] });
  function glide(vexFn, t, v) {   // blend the arms over 0.28 s whenever the pose function switches preset (pure: re-evaluates the past)
    const cur = armsOf(v); let L = cur.L, R = cur.R; const fx = PHFIX[v.l]; let tw = fx?.tw ?? 0, hd = fx?.hd ?? null, spin = fx?.spin ?? 0;
    for (const side of ['L', 'R']) for (let d = 0.04; d <= 0.32; d += 0.04) { const pvv = vexFn(t - d), pv = armsOf(pvv); if (pv[side] !== cur[side]) { const k = ease(clamp((d - 0.02) / 0.28));
      if (side === 'L') { L = mixArm(pv.L, cur.L, k); const f0 = PHFIX[pvv.l]; if (f0 && fx) { tw = f0.tw + (fx.tw - f0.tw) * k; hd = f0.hd.map((x, i) => x + (fx.hd[i] - x) * k); spin = f0.spin + Math.atan2(Math.sin(fx.spin - f0.spin), Math.cos(fx.spin - f0.spin)) * k; } } else R = mixArm(pv.R, cur.R, k); break; } }
    return { ...v, armL: L, armR: R, phTw: tw, phHd: hd, phSpin: spin };
  }
  const jitterArm = (arm, t, a) => arm.map((d, i) => [d[0] + Math.sin(t * 61 + i) * a, d[1] + Math.sin(t * 47 + i * 2) * a, d[2] + Math.sin(t * 57 + i * 3) * a]);
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face
  const ANNOYED = (t, x = {}) => CONF(t, { angry: 0.3, relaxed: 0.18, ...x });

  // ---------------------------------------------------------------- the roof at night: pixel snow that follows the lens (none within 0.9 m of it)
  const SNOW_N = 420, snow = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.018, 0.018), basic({ color: 0xf4f8ff }), SNOW_N); snow.frustumCulled = false; scene.add(snow); snow.visible = false;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = V(1, 1, 1);
  const sZero = V(0, 0, 0), placeSnow = (t, c, camP) => { for (let i = 0; i < SNOW_N; i++) { const bx0 = (hash(i) - 0.5) * 5, bz = (hash(i + 99) - 0.5) * 4, by = ((hash(i + 7) * 3.2 - t * (0.35 + hash(i + 3) * 0.25)) % 3.2 + 3.2) % 3.2;
    const pp = V(c.x + bx0 + Math.sin(t * 1.3 + i) * 0.08, c.y - 1.2 + by, c.z + bz); m4.compose(pp, q4, pp.distanceTo(camP) < 1.2 ? sZero : s4); snow.setMatrixAt(i, m4); } snow.instanceMatrix.needsUpdate = true; };

  // ---------------------------------------------------------------- overlay: title, callouts, end card; the PIXEL cards + the battery HUD (270 × 480, ×4)
  const ov = makePixelOverlay(story, { crisp: true, wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHY YOUR F*CKING PHONE', 'DIES AT 20%'], t0: 0, t1: T.ions - 0.05, y: 0.13, plain: false, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const txtCache = new Map(), ptxt = (s, color, x, y, sc = 1, align = 'center') => { const kk = s + color; let cv = txtCache.get(kk); if (!cv) { cv = pixelText(s, { color }); txtCache.set(kk, cv); } const w = cv.width * sc; dctx.drawImage(cv, Math.round(align === 'left' ? x : x - w / 2), Math.round(y - cv.height * sc / 2), w, cv.height * sc); };
  const panel = (x0, y0, x1, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(x0, y0, x1 - x0, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y1, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y0, 2, y1 - y0); dctx.fillRect(x1, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const ION = '#ffd43b', RED2 = '#ff4f6a', GRN = '#7cf05f', ICE = '#9fd8ff';
  const battIcon = (x, y, w, h, frac, col, out = '#f2e6ff') => { R(out, x, y, w, 2); R(out, x, y + h - 2, w, 2); R(out, x, y, 2, h); R(out, x + w - 2, y, 2, h); R(out, x + w, y + Math.round(h * 0.3), 3, Math.round(h * 0.4)); if (frac > 0) R(col, x + 3, y + 3, Math.max(1, (w - 6) * frac), h - 6); };
  const bolt = (x, y, c) => { R(c, x + 3, y, 3, 4); R(c, x + 1, y + 4, 6, 2); R(c, x, y + 6, 3, 4); };
  const cell = (x0, y0, wq, hq) => {   // graphite block (left) | dashed separator | oxide block (right)
    R('#3a3a46', x0, y0, 56, hq); for (let yy = y0 + 4; yy < y0 + hq; yy += 6) R('#5a5a6a', x0 + 2, yy, 52, 1);
    R('#5a3a6a', x0 + wq - 56, y0, 56, hq); for (let yy = y0 + 4; yy < y0 + hq - 2; yy += 6) for (let xx = x0 + wq - 52; xx < x0 + wq - 4; xx += 6) R('#8a6aa0', xx, yy, 2, 2);
    for (let yy = y0; yy < y0 + hq; yy += 6) R('#c8c0d8', x0 + wq / 2, yy, 1, 3); };
  const ionAt = (x0, wq, s) => x0 + 10 + s * (wq - 26);
  const Y0 = 210, Y1 = 330;
  let dgKey = '';
  function diagram(t, sh) {
    let id = null, k = 0;
    if (t >= T.lithium - 0.1 && t < T.guess) id = 'ions';
    else if (t >= T.that && t < T.dip) id = 'gauge';
    else if (t >= T.old && t < T.derek && !sh.held) id = 'dip';
    else if (t >= T.every2 - 0.1 && t < T.cold) id = 'cycles';
    else if (t >= T.cold + 0.15 && t < T.heat) id = 'cold';
    else if (t >= T.heatW - 0.1 && t < T.end) id = 'heat';
    if (sh.screen || sh.held || t >= T.card) id = null;
    // the battery HUD: her phone (20 % → dead → charging)
    let hud = null;
    if (t >= T.ions && t < T.derek && !sh.held) hud = t < T.dead ? ['20%', RED2, 0.2] : ['DEAD', '#c8c0d8', 0];
    else if (t >= T.pivot && t < T.card && !sh.screen && !sh.derek) hud = [`${21 + Math.floor(3 * u01(t, T.pivot, T.end))}%`, GRN, 0.21 + 0.03 * u01(t, T.pivot, T.end), true];
    const key = `${id}${sh.id}${Math.round(t * 15)}${hud ? hud[0] : ''}`; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480);
    if (hud) { panel(10, 80, 92, 112); ptxt('MY PHONE', '#c8c0d8', 51, 88); battIcon(16, 96, 30, 13, hud[2], hud[1]); if (hud[3]) bolt(27, 98, '#ffffff'); ptxt(hud[0], hud[1], 69, 103); }
    if (sh.id === 'derekC' && t > T.derekDead + 0.08 && t < T.night + 0.3) ptxt('NOOO!', RED2, 196, 128, 3);
    if (!id) return;
    panel(18, Y0, 252, Y1);
    if (id === 'ions') {
      const ph = t < T.charging ? 0 : t < T.scrolling ? 1 : 2;
      ptxt(['LITHIUM IONS DOING LAPS', 'CHARGING: IONS SHOVED IN', 'SCROLLING: IONS RUN BACK'][ph], ['#ffd43b', GRN, '#ffffff'][ph], 135, Y0 + 11);
      const x0 = 34, wq = 202, y0 = Y0 + 26; cell(x0, y0, wq, 70);
      for (let i = 0; i < 12; i++) {
        const lap = 0.5 + 0.5 * Math.sin(t * 2.6 + i * 1.7), toL = ease(u01(t, T.charging + i * 0.04, T.charging + 0.7 + i * 0.04)), toR = ease(u01(t, T.scrolling + i * 0.04, T.scrolling + 0.8 + i * 0.04));
        const s = ph === 0 ? lap : ph === 1 ? lap * (1 - toL) : toR * (0.75 + 0.25 * hash(i)) + (1 - toR) * 0.02;
        R(ION, ionAt(x0, wq, s), y0 + 6 + (i % 6) * 10 + (i > 5 ? 4 : 0), 4, 4); }
      ptxt('GRAPHITE', '#c8c0d8', x0 + 28, Y1 - 12); ptxt('METAL OXIDE', '#c8c0d8', x0 + wq - 28, Y1 - 12);
      if (ph === 2 && t > T.scrolling + 0.4) { bolt(131, Y0 + 30, '#ffd43b'); ptxt('POWER', '#ffd43b', 135, Y0 + 50); }
    }
    if (id === 'gauge') {
      const g1 = t >= T.guessW - 0.05, g2 = t >= T.voltage - 0.05;
      ptxt(g2 ? 'VOLTAGE IN, % OUT' : g1 ? "IT'S A GUESS" : 'BATTERY 20%', g2 ? '#ffffff' : '#ffd43b', 135, Y0 + 11);
      battIcon(36, Y0 + 32, 82, 38, 0.2, RED2); ptxt('20%', RED2, 77, Y0 + 86, 2);
      if (g1 && !g2) ptxt('?', '#ffffff', 190, Y0 + 52, 5);
      if (g2) { const cx = 190, cy = Y0 + 78, r = 38; for (let a = 0; a <= 20; a++) { const an = PI + a / 20 * PI; R(a < 5 ? RED2 : '#f2e6ff', cx + Math.cos(an) * r - 1, cy + Math.sin(an) * r - 1, 3, 3); }
        const an = PI + (0.24 + 0.03 * Math.sin(t * 7)) * PI; for (let s = 0; s < r - 6; s += 2) R('#ffd43b', cx + Math.cos(an) * s, cy + Math.sin(an) * s, 2, 2); R('#ffffff', cx - 3, cy - 3, 6, 6);
        ptxt('3.6 V', '#ffffff', cx, cy + 14); ptxt('= ABOUT 20%', '#c8c0d8', 135, Y1 - 10); }
    }
    if (id === 'dip') {
      const off = t >= T.dead, hd = off ? 'OFF.  20% STILL LEFT' : t >= T.dips - 0.05 ? 'VOLTAGE DIPS' : 'OLD BATTERY + BIG APP';
      ptxt(hd, off ? RED2 : '#ffd43b', 135, Y0 + 11);
      const ox = 34, oy = Y1 - 14, x1 = 238; R('#f2e6ff', ox, oy, x1 - ox, 2); R('#f2e6ff', ox, Y0 + 22, 2, oy - Y0 - 20);
      const cutY = oy - 28; for (let x = ox + 4; x < x1; x += 8) R(RED2, x, cutY, 5, 2); ptxt('CUTOFF', RED2, x1 - 22, cutY - 7);
      const vAt = (tt) => oy - 70 + 10 * ease(u01(tt, T.open, T.open + 0.9)) + 8 * Math.sin(tt * 9) * u01(tt, T.open, T.open + 0.5) + 44 * Math.pow(u01(tt, T.dips - 0.1, T.dead - 0.25), 1.6);
      const tEnd = Math.min(t, T.dead), xN = ox + 4 + (x1 - ox - 8) * u01(tEnd, T.old, T.dead); let py = null;
      for (let x = ox + 4; x <= xN; x += 2) { const tt = T.old + (T.dead - T.old) * (x - ox - 4) / (x1 - ox - 8), y = Math.round(vAt(tt)); if (py !== null && Math.abs(y - py) > 2) R(y > cutY ? RED2 : GRN, x, Math.min(y, py), 2, Math.abs(y - py)); R(y > cutY ? RED2 : GRN, x, y, 2, 2); py = y; }
      if (off) { ptxt('OFF', RED2, 150, Y0 + 52, 3); }
      ptxt('VOLTAGE', '#c8c0d8', ox + 22, Y0 + 26);
    }
    if (id === 'cycles') {
      const k2 = u01(t, T.five - 0.2, T.eighty - 0.05), n = Math.round(500 * ease(k2)), hp = 1 - 0.2 * ease(k2);
      ptxt('BATTERY HEALTH', '#ffd43b', 135, Y0 + 11);
      battIcon(40, Y0 + 30, 180, 34, hp, hp > 0.86 ? GRN : '#ffd43b'); ptxt(`${Math.round(hp * 100)}%`, '#ffffff', 130, Y0 + 47, 2);
      ptxt(`CHARGE CYCLES: ${n}`, '#c8c0d8', 135, Y0 + 84);
      if (t >= T.eighty - 0.05) ptxt('ABOUT 80% LEFT', '#ffd43b', 135, Y1 - 12);
    }
    if (id === 'cold') {
      ptxt(t >= T.ions2 - 0.05 ? 'IONS GET SLOW' : 'COLD', ICE, 135, Y0 + 11);
      const x0 = 34, wq = 202, y0 = Y0 + 26; cell(x0, y0, wq, 70);
      for (let i = 0; i < 12; i++) { const s = 0.15 + 0.5 * ((hash(i) + (t - T.cold) * 0.05) % 0.7); R(ICE, ionAt(x0, wq, s), y0 + 6 + (i % 6) * 10 + (i > 5 ? 4 : 0), 4, 4); }
      for (let i = 0; i < 14; i++) R('#ffffff', 24 + hash(i + 40) * 222, Y0 + 20 + ((hash(i + 60) * 90 + (t - T.cold) * 18) % 92), 2, 2);
      R('#f2e6ff', 236, Y0 + 30, 6, 50); R(ICE, 238, Y0 + 70, 2, 9); R(ICE, 235, Y0 + 79, 8, 6);
      ptxt('LESS POWER OUT', '#c8c0d8', 135, Y1 - 12);
    }
    if (id === 'heat') {
      const hot = u01(t, T.ninety - 0.2, T.ninety + 0.6), cooked = t >= T.cooks - 0.05;
      ptxt(cooked ? 'PERMANENT DAMAGE' : 'HOT CAR DASHBOARD', cooked ? RED2 : '#ffd43b', 135, Y0 + 11);
      for (let a = 0; a < 8; a++) { const an = a / 8 * 2 * PI + t * 0.6; R('#ffd43b', 210 + Math.cos(an) * 20, Y0 + 44 + Math.sin(an) * 20, 3, 3); } R('#ffd43b', 202, Y0 + 36, 16, 16);
      R('#5a4a40', 30, Y0 + 84, 160, 10); R('#3a3030', 30, Y0 + 94, 160, 20);   // the dashboard
      R('#2a1a34', 74, Y0 + 70, 44, 14); R(cooked ? '#3a0a10' : '#101014', 77, Y0 + 72, 38, 10);   // a phone lying on it
      for (let i = 0; i < 3; i++) R(`rgba(255,120,80,${0.5 + 0.3 * Math.sin(t * 6 + i)})`, 80 + i * 12, Y0 + 60 - ((t * 20 + i * 7) % 14), 2, 6);
      R('#f2e6ff', 40, Y0 + 26, 6, 46); R(RED2, 42, Y0 + 70 - 40 * hot, 2, 40 * hot + 2); R(RED2, 39, Y0 + 70, 8, 6);
      if (hot > 0.3) ptxt('95 F', RED2, 70, Y0 + 40, 2);
      if (cooked) { battIcon(150, Y0 + 60, 70, 26, 0.6, '#c8c0d8', RED2); for (let s = 0; s < 6; s++) R(RED2, 182 + (s % 2) * 3, Y0 + 61 + s * 4, 2, 4); }
    }
  }

  // ---------------------------------------------------------------- shots
  const VP = { x: 0.45, z: -1.5, y: FY }, VN = { x: -0.42, z: -2.42, y: FY, rotY: 0.32 }, VR = { x: 0.35, z: -1.35, y: ROOF }, VD = { x: 0.32, z: -0.62, y: FY };
  // face-anchored framing (078): the camera at pos, aimed at her (x, z) so her eyes land at `frac` of the frame height
  const frame = (pos, at, frac, fov) => { const ey = at.y + eyeH, dx = at.x - pos[0], dz = at.z - pos[2], hd = Math.hypot(dx, dz), el = Math.atan2(ey - pos[1], hd), d = Math.atan((1 - 2 * frac) * Math.tan(fov * PI / 360));
    const pitch = el - d; return { pos, look: [pos[0] + dx / hd * Math.cos(pitch), pos[1] + Math.sin(pitch), pos[2] + dz / hd * Math.cos(pitch)], fov }; };
  const L = (a, b, k) => a + (b - a) * k;
  const SH = [
    // HOOK — the phone at 20 % shown to the lens, then the screen itself
    { id: 'open', t0: 0, vex: (t) => ({ ...VP, l: 'show', r: 'hip', tilt: 0.08, phone: 1, face: ANNOYED(t) }), cam: (t) => { const k = ease(u01(t, 0, 1.5)); return frame([L(0.75, 0.55, k), 4.25, L(0.75, 0.2, k)], VP, 0.4, 48); } },
    { id: 'lockA', t0: W('hook', 'twenty') - 0.12, held: 'lock', vex: (t) => ({ ...VP, l: 'show', r: 'hip', tilt: 0.08, phone: 1, face: ANNOYED(t) }), pcam: (t) => [0.5, 0.52, 0.3 - 0.05 * u01(t, 1.5, 2.8)] },
    // IONS — card from "lithium"; she explains with the free hand
    { id: 'ions1', t0: T.ions, vex: (t) => ({ ...VP, l: 'low', r: t > T.lithium - 0.3 ? 'point' : 'hip', tilt: -0.06, phone: 1, face: ANNOYED(t) }), cam: (t) => frame([-0.3 + 0.15 * u01(t, T.ions, T.charging), 4.3, 0.05], VP, 0.32, 46) },
    { id: 'ions2', t0: T.charging - 0.06, vex: (t) => ({ ...VP, l: t > T.scrolling - 0.25 ? 'look' : 'low', r: t > T.shoves - 0.25 && t < T.scrolling - 0.3 ? 'kissOut' : 'hip', tilt: 0.06, phone: 1, lean: t > T.shoves - 0.2 && t < T.scrolling ? 0.05 : 0, face: CONF(t, { angry: 0.22 }) }), cam: (t) => frame([0.95, 4.35, -0.05 - 0.1 * u01(t, T.charging, T.guess)], VP, 0.32, 44) },
    // GUESS — "a fucking guess" with a hand at her temple, then the phone close
    { id: 'guess1', t0: T.guess, vex: (t) => ({ ...VP, l: 'low', r: t > T.that ? 'temple' : 'hip', tilt: -0.12, turn: 0.08, phone: 1, face: ANNOYED(t, { angry: 0.35 }) }), cam: (t) => frame([0.2, 4.3, 0.12 - 0.12 * u01(t, T.guess, T.reads)], VP, 0.32, 46) },
    { id: 'guess2', t0: T.reads - 0.35, vex: (t) => ({ ...VP, l: 'look', r: 'hip', tilt: 0.1, nod: 0.12, phone: 1, look: [0, -0.5], face: CONF(t, { angry: 0.25 }) }), cam: (t) => frame([-0.45, 4.25, -0.2], VP, 0.32, 46) },
    // DIP — she opens an app, the phone's screen dies mid-video, she shows the black phone
    { id: 'dip1', t0: T.dip, vex: (t) => ({ ...VP, l: 'look', r: 'hip', tilt: 0.06, nod: 0.1, phone: 1, look: [0, -0.5], face: CONF(t, { angry: 0.2 }) }), cam: (t) => frame([0.75, 4.45, -0.08 - 0.12 * u01(t, T.dip, T.dips)], VP, 0.32, 44) },
    { id: 'dipPh', t0: T.dips - 0.05, held: 'app', vex: (t) => ({ ...VP, l: 'look', r: 'hip', tilt: 0.06, nod: 0.1, phone: 1, face: CONF(t) }), pcam: (t) => [0.5, 0.5, 0.29 - 0.05 * u01(t, T.dips, T.dead)], shake: () => [T.dead] },
    { id: 'dip2', t0: T.with - 0.12, vex: (t) => ({ ...VP, l: 'show', r: 'fist', tilt: -0.1, phone: 1, face: ANNOYED(t, { angry: 0.55 }) }), cam: (t) => frame([0.25, 4.3, 0.05], VP, 0.32, 46) },
    // DEREK — the dollhouse wide: Vex upstairs pointing down, Derek's phone dies at 20 %, he screams
    { id: 'derek', t0: T.derek, derek: true, vex: (t) => ({ ...VD, l: 'low', r: 'down', nod: 0.38, tilt: 0.1, phone: 1, look: [0, -0.7], face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => ({ pos: [1.0 - 0.1 * u01(t, T.derek, T.every), 3.0, 3.6 - 0.25 * u01(t, T.derek, T.every)], look: [0.25, 2.85, -0.9], fov: 52 }) },
    { id: 'derekC', t0: T.every - 0.14, derek: true, vex: (t) => ({ ...VD, l: 'low', r: 'down', nod: 0.38, tilt: 0.1, phone: 1, look: [0, -0.7], face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => ({ pos: [0.78 - 0.1 * u01(t, T.every, T.pivot), 2.05, 1.25 - 0.2 * u01(t, T.every, T.pivot)], look: [0.12, 1.7, -0.98], fov: 44 }), shake: () => [T.derekDead + 0.1] },
    // PIVOT — the phone charging on the stand; "Cute." + a wink
    { id: 'pivot', t0: T.pivot, stand: 'charge', vex: (t) => ({ ...VN, l: 'hip', r: t > T.cute - 0.35 ? 'peace' : t > T.its - 0.2 ? 'point' : 'hip', tilt: t > T.cute - 0.3 ? -0.14 : -0.05, face: CONF(t, { relaxed: t > T.cute - 0.3 ? 0.24 : 0.12, blinkLeft: t > T.cute + 0.1 ? 1 : 0 }) }), cam: (t) => frame([0.3 - 0.12 * u01(t, T.pivot, T.scribe), 4.22, -0.95], VN, 0.31, 50) },
    // SCRIBE — on the phone's screen (crisp): send → the page writes itself → the cell diagram is drawn
    { id: 'send', t0: T.scribe, screen: 'home', scam: (t) => [0.5, 0.5, 0.215 - 0.012 * u01(t, T.scribe, T.page)] },
    { id: 'write', t0: T.page - 0.04, screen: 'desk', scam: (t) => [0.5, 0.52, 0.205 - 0.012 * u01(t, T.page, T.cell)] },
    { id: 'fig', t0: T.cell - 0.12, screen: 'desk', scam: (t) => { const [u, v] = toUV(...FIGC); return [u, v, 0.122 - 0.012 * u01(t, T.cell, T.swap)]; } },
    // SWAP — the set's Aa control → "Whose handwriting" → Quick print → the page is rewritten in it
    { id: 'pick', t0: T.swap, screen: 'desk', scam: (t) => [0.5, L(0.27, 0.34, ease(u01(t, T.swap, T.tapAa + 0.4))), 0.175] },
    { id: 'rewrite', t0: T.swapW + 0.05, screen: 'desk', scam: (t) => [0.5, 0.5, L(0.19, 0.212, ease(u01(t, T.swapW, T.age)))] },
    // AGE — 500 cycles → about 80 %; an open hand for "five hundred"
    { id: 'age1', t0: T.age, vex: (t) => ({ ...VP, l: 'hip', r: t > T.every2 - 0.2 ? 'point' : 'hip', tilt: 0.08, face: CONF(t) }), cam: (t) => frame([0.75, 4.3, 0.05 - 0.1 * u01(t, T.age, T.five)], VP, 0.32, 46) },
    { id: 'age2', t0: T.five - 0.1, vex: (t) => ({ ...VP, l: 'hip', r: t < T.aboutW ? 'wave' : 'hip', tilt: -0.08, face: CONF(t, { surprised: t > T.eighty - 0.1 ? 0.2 : 0 }) }), cam: (t) => frame([-0.35, 4.35, -0.15 - 0.08 * u01(t, T.five, T.cold)], VP, 0.32, 44) },
    // COLD — the roof at night, snowing, arms crossed, shivering
    { id: 'cold', t0: T.cold, roof: true, vex: (t) => ({ ...VR, l: 'cross', r: 'cross', tilt: 0.05, jitter: 0.03, shiver: 1, face: ANNOYED(t, { angry: 0.45 }) }), cam: (t) => frame([0.75 - 0.2 * u01(t, T.cold, T.heat), 7.0, 0.25], VR, 0.32, 48) },
    // HEAT — back inside: fanning herself
    { id: 'heat', t0: T.heat, vex: (t) => ({ ...VP, l: 'hip', r: t > T.heatW - 0.2 && t < T.cooks - 0.1 ? 'shades' : 'point', tilt: 0.06, face: ANNOYED(t, { angry: t > T.cooks - 0.1 ? 0.5 : 0.25 }), fanT: t }), cam: (t) => frame([-0.2 + 0.1 * u01(t, T.heat, T.end), 4.3, 0.0], VP, 0.32, 46) },
    // END — "Now go charge your fucking phone." → the end card over the room
    { id: 'end', t0: T.end, vex: (t) => ({ ...VP, l: 'hip', r: t < T.phone + 0.4 ? 'point' : 'peace', tilt: -0.08, face: CONF(t, { relaxed: t > T.phone + 0.3 ? 0.24 : 0.12, blinkLeft: t > T.phone + 0.45 && t < T.phone + 0.9 ? 1 : 0 }) }), cam: (t) => frame([0.15, 4.35, 0.35 - 0.3 * ease(u01(t, T.end, T.card))], VP, 0.33, 46) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const poseVex = (sh, t) => { const v = glide(sh.vex, t, sh.vex(t)); const jit = v.jitter ? { armL: jitterArm(v.armL, t, v.jitter), armR: jitterArm(v.armR, t, v.jitter) } : {};
    const aim = v.phone && v.phHd ? { 'twist.leftLowerArm': v.phTw, leftHand: v.phHd } : {}; setSpin(v.phone ? v.phSpin : 0);
    VEX.update(t, { ...lips(t), sway: v.shiver ? 0.04 : 0.15, ...v, ...jit, aim, hands: { L: v.phone ? GRIP : 'relax', R: R_HAND[v.r || 'rest'] }, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: v.y ?? 0, rotY: v.rotY ?? 0, turn: (v.turn ?? 0) + (v.shiver ? Math.sin(t * 40) * 0.02 : 0) });
    VEX.root.updateMatrixWorld(true); return v; };

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    // screens
    setHeld(t < T.open ? 'lock' : t < T.dead ? 'app' : 'dead');
    if (t < T.scribe) drawStand('charge', 0, 0, { pct: 21 });
    else if (t < T.page) drawStand('home', u01(t, T.scribe + 0.05, T.send - 0.1) + (t > T.send ? 1 : 0), 0, { pct: 22 });
    else if (t < T.tapAa) drawStand('desk', 0, writeP(t), { pct: 22 });
    else if (t < T.tapQP + 0.12) drawStand('desk', 0, sheetA.total, { pct: 22, pop: u01(t, T.tapAa + 0.08, T.tapAa + 0.5), tap: t < T.tapAa + 0.22 ? 1 : t > T.tapQP - 0.05 ? 2 : undefined });
    else drawStand('desk', 0, rewriteP(t), { pct: 22, q: true });
    setDerekScreen(t >= T.derekDead);
    // Derek: scrolling; at "Derek" his phone dies → he screams; then slumps
    const sc = t >= T.derekDead ? clamp((t - T.derekDead) / 0.12) * (1 - u01(t, T.night + 0.2, T.night + 0.7)) : 0, sl = u01(t, T.night + 0.2, T.night + 0.8);
    derek.set(derekPose(t, sc, sl)); derek.root.updateMatrixWorld(true);
    // Vex + her phone (in her hand until it's on the stand)
    VEX.root.visible = !!sh.vex || !!sh.held;
    let v = null; if (sh.vex) v = poseVex(sh, t);
    heldPh.g.visible = !!v?.phone; standPh.g.visible = t >= T.pivot;   // the phone moves from her hand to the stand at the cut to the pivot
    snow.visible = !!sh.roof;

    // camera
    let cam, up = null;
    if (sh.held) { const [u, vv, d] = sh.pcam(t); cam = phoneCam(heldPh, u, vv, d, 44); up = cam.up; }
    else if (sh.screen) { const [u, vv, d] = sh.scam(t); cam = phoneCam(standPh, u, vv, d, 40); up = cam.up; }
    else cam = sh.cam(t);
    if (DBG === 'side' && v?.phone) { const h = heldPh.g.getWorldPosition(V()), f = V(Math.sin(v.rotY ?? 0), 0, Math.cos(v.rotY ?? 0)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, 0.6).addScaledVector(f, 0.1).add(V(0, 0.05, 0)).toArray(), look: h.toArray(), fov: 40 }; up = null; }
    if (DBG === 'side2' && v?.phone) { const h = heldPh.g.getWorldPosition(V()), f = V(Math.sin(v.rotY ?? 0), 0, Math.cos(v.rotY ?? 0)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, -0.6).addScaledVector(f, 0.15).add(V(0, 0.1, 0)).toArray(), look: h.toArray(), fov: 40 }; up = null; }
    let amp = sh.screen || sh.held ? 0 : 0.003;
    if (sh.shake) for (const kt of sh.shake()) { const a = t - kt; if (a >= 0 && a < 0.35) amp = Math.max(amp, (sh.held ? 0.006 : 0.025) * (1 - a / 0.35)); }
    studio.camera.up.copy(up ?? V(0, 1, 0));
    studio.camera.far = 60; studio.camera.near = sh.screen || sh.held ? 0.02 : 0.05; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, amp);
    { const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex && !sh.held ? Math.min(1.4, 0.22 * Math.pow(d, 1.6)) : 0; }
    if (sh.roof) placeSnow(t, V(VR.x, VR.y + 1.3, VR.z + 1.0), studio.camera.position);
    diagram(t, sh);
    pixel.set(sh.screen ? 1 : sh.held ? 2 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
