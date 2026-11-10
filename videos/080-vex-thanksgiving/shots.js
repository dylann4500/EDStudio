// 080 — "What Thanksgiving dinner actually does to your body, hour by hour" (Scribe lane, Vex EXPLAINER, anime/pixel look). Manager
// brief (Nov 9): a Vex explainer in the exact style of 076 (energy drinks) for Thanksgiving week (Thu Nov 26, 2026).
//   format  = an HOUR-BY-HOUR explainer with a clock HUD (4:00 PM dinner → 4:30 PM → 6:00 PM couch → 10:00 PM → 2:00 AM leftovers);
//   place   = a NEW set, engine/sets/feast.js: a Thanksgiving house at dusk — the table spread for 8 with four blocky relatives eating,
//             a lounge with the uncle asleep on the couch in front of a generic football game, a kitchen whose fridge we film from
//             INSIDE at 2 AM, the island with the leftovers;
//   facts   = (sources in caption.md's comment) ~3,000 calories at the meal (ACE + Calorie Control Council estimates) = 1.5 days of a
//             2,000-calorie diet (FDA Daily Value basis); the stomach is about fist-sized empty and can stretch to hold as much as 4 L
//             (OpenStax Anatomy & Physiology 2e §23.4); turkey has about as much tryptophan as chicken (Texas A&M's Nicolaas Deutz;
//             USDA data); the sleepiness is the quantity of food + the carbs (Texas A&M; Psychology Today / A. Korb; Popular Science);
//             a fatty meal can stay in the stomach 6 h or longer (OpenStax §23.4); leftovers out over 2 h → toss (USDA FSIS);
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated): the calorie bar vs a 2,000 day, 1.5 days,
//             the stomach fist → 4 L, turkey vs chicken tryptophan, size + carbs → ZZZ, the 6 h timeline, the 2-hour rule + a clock HUD;
//   Scribe  = a feature no Vex reel has shown: DARK MODE (README §Dark mode: the account menu's Theme row, Light · Dark · System as
//             sun / moon / screen icons; the pages stay paper, with a hairline edge on the dark desk; the accent lifts to #e46c74).
//             She opens Scribe, flips it dark, and the BIOLOGY page writes itself ON THE PHONE SCREEN with an on-screen pen cursor
//             (never a pencil on paper): calorie math, two reasons you get sleepy, and a hand-drawn negative FEEDBACK LOOP for blood
//             glucose (README §Biology figures: `@feedback` — names in the writer's hand joined by freehand bowed arrows round an uneven
//             loop, its sign checked).
//   persona = the lighter 076 tone: confident, teasing ("Cute.", "I'm watching you."); Fish "Mommy" with the less-breathy settings.
// Guardrails: no real brands or team logos (a generic HOME/AWAY game), swimwear only, no kink lines, no medical advice beyond the
// sourced general facts above. Props rule (Nov 9): the drumstick rides her LEFT hand bone (attached at build in the hold pose: its axis
// along the knuckle line, centred in the fist), so it can never float; the tossed one (2 AM) is a copy that starts where the held one was.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { buildFeast, makeDrumstick } from '@engine/sets/feast.js';
import { makePuffs } from '@engine/sets/launchbeach.js';

const PI = Math.PI, PIXEL = 4, SIDE_DBG = false;   // SIDE_DBG: a side view of her drumstick hand for the props check
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + Math.sin(u * PI * 1.5) * (1 - u) * 0.35 - (1 - u) * (1 - u) * 0.9 * (1 - u));
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
    here: W('hook', 'heres'), hour: W('hook', 'hour'), plate: B.plate.t0, plateW: W('plate', 'plate'), two: W('plate', 'two'), about: W('plate', 'about'),
    three: W('plate', 'three'), calories: W('plate', 'calories'), thats: W('plate', 'thats'), half: W('plate', 'half'), stomach: B.stomach.t0, fist: W('stomach', 'fist'), it: W('stomach', 'it'),
    stretch: W('stomach', 'stretch'), four: W('stomach', 'four'), myth: B.myth.t0, everyone: W('myth', 'everyone'), turkey: W('myth', 'turkey'), but: W('myth', 'but'),
    trypto: W('myth', 'tryptophan'), chicken: W('myth', 'chicken'), size: B.size.t0, sheer: W('size', 'sheer'), carbs: W('size', 'carbs'), pivot: B.pivot.t0,
    monday: W('pivot', 'monday'), cute: W('pivot', 'cute'), scribe: B.scribe.t0, dark: W('scribe', 'dark'), writes: W('scribe', 'writes'), feedback: W('scribe', 'feedback'),
    fatty: B.fatty.t0, fattyW: W('fatty', 'fatty'), six: W('fatty', 'six'), longer: W('fatty', 'longer'), late: B.leftovers.t0, out: W('leftovers', 'out'),
    usda: W('leftovers', 'usda'), toss: W('leftovers', 'toss'), them: W('leftovers', 'them'), end: B.end.t0, close: W('end', 'close'), bed: W('end', 'bed'),
    watching: W('end', 'watching'), you: W('end', 'you'),
  };
  T.card = T.you + 0.6; T.flip = T.dark + 0.25; T.release = T.toss + 0.12;

  // ---------------------------------------------------------------- the house
  scene.background = new THREE.Color(0x1a120c);
  const F = buildFeast(studio);
  const tbl = F.D.table;
  // her plate (the near-middle setting): helping 1 is there from the start, helping 2 pops on "two"
  const plateG = F.settings[4], toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const heap = (lvl) => { const g = new THREE.Group(); g.position.y = 0.02 + lvl * 0.045; plateG.add(g); const s = 1 - lvl * 0.18;
    const m = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, mat); o.position.set(x * s, y, z * s); o.scale.set(sx, sy, sz); o.castShadow = true; g.add(o); return o; };
    m(new THREE.SphereGeometry(0.05, 12, 8), toon(0xfaf4e2), -0.04, 0.02, 0.03, 1, 0.6, 1);                                      // potatoes
    m(new THREE.SphereGeometry(0.03, 10, 6), toon(0x7a4a22), -0.04, 0.045, 0.03, 1.3, 0.3, 1.3);                                 // gravy
    m(new THREE.BoxGeometry(0.09, 0.012, 0.06), toon(0xe8c8a0), 0.04, 0.012 + lvl * 0.004, -0.03).rotation.y = 0.4;              // turkey slices
    m(new THREE.BoxGeometry(0.085, 0.012, 0.055), toon(0xd8b088), 0.05, 0.024, -0.02).rotation.y = 0.2;
    for (let i = 0; i < 7; i++) m(new THREE.BoxGeometry(0.022, 0.022, 0.022), toon(i % 2 ? 0x9a6630 : 0x6a8a3a), 0.03 + (hash(i + lvl * 9) - 0.5) * 0.06, 0.02 + hash(i + 3) * 0.02, 0.05 + (hash(i + 5) - 0.5) * 0.04);
    m(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 10), toon(0xa0102a), -0.06, 0.012, -0.05);                                    // cranberry
    for (let i = 0; i < 6; i++) m(new THREE.CapsuleGeometry(0.005, 0.04, 2, 4), toon(0x4a8a3a), 0.075 + (hash(i * 3) - 0.5) * 0.03, 0.012, 0.03 + (hash(i * 3 + 1) - 0.5) * 0.04).rotation.set(PI / 2, hash(i) * 3, 0);
    if (lvl) m(new THREE.SphereGeometry(0.035, 10, 8), toon(0xd8a050), 0.0, 0.06, 0.0, 1, 0.8, 1);                                  // a roll on top
    return g; };
  const help1 = heap(0), help2 = heap(1);
  // steam off the turkey + potatoes, Z's over the uncle (pixel sprites)
  const puffs = makePuffs(F.root, 10);
  const zTex = (() => { const c = pixelText('Z', { color: '#f2e6ff' }); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const zs = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false })); s.visible = false; F.root.add(s); return s; });

  // ---------------------------------------------------------------- Scribe on the phone: home (light) → account menu, Theme → moon → DARK → the desk writes the page
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const loopFig = ({ k, y }) => { const cx = 512, cy = y + 300, rx = 262, ry = 152, out = [], at = (deg) => [cx + rx * Math.cos(deg * PI / 180), cy + ry * Math.sin(deg * PI / 180)];
    const arc = (a0, a1) => { const P = []; for (let i = 0; i <= 14; i++) P.push(at(a0 + (a1 - a0) * i / 14)); return [...k.poly(P.slice(0, -2), { line: 3.4 }), ...k.arrow(P[P.length - 3], P[P.length - 1], { head: 15, line: 3.4 })]; };
    out.push(...k.text('big meal', 92, cy - ry - 8, { u: 22 }), ...k.arrow([205, cy - ry - 16], [330, cy - ry - 8], { head: 14 }));
    out.push(...k.text('blood glucose ↑', cx, cy - ry, { u: 24, align: 'center', valign: 'middle' }));
    out.push(...arc(-58, -24));
    out.push(...k.text('pancreas:\ninsulin out', cx + rx + 8, cy, { u: 23, align: 'center', valign: 'middle', lineH: 1.8 }));
    out.push(...arc(24, 60));
    out.push(...k.text('cells take in\nglucose', cx, cy + ry + 6, { u: 23, align: 'center', valign: 'middle', lineH: 1.8 }));
    out.push(...arc(120, 156));
    out.push(...k.text('blood glucose ↓', cx - rx + 18, cy, { u: 24, align: 'center', valign: 'middle' }));
    out.push(...arc(204, 236));
    out.push(...k.text('( - )', at(222)[0] - 70, at(222)[1] - 14, { u: 24 }));
    const lab = k.text('negative\nfeedback', cx, cy - 4, { u: 26, align: 'center', valign: 'middle', lineH: 1.7 });
    out.push(...lab, ...k.ring(lab, { pad: 14 }));
    return out; };
  const sheet = makeSheet(G, { rich: true, seed: 17, name: 'Vex', title: 'BIO 101 · Digestion + homeostasis', note: 'Due Mon, Nov 30  ·  show your work', page: 'p. 1',
    qFont: '500 26px Georgia, serif', qLineH: 34, problems: [
      { q: '1. A holiday dinner has 3,000 kcal. How many days of a\n    2,000 kcal diet is that?', h: 0.62, a: 'days = 3000 kcal / 2000 kcal per day', au: 26,
        fig: ({ k, y }) => { const a = k.text('=  1.5 days', 640, y + 168, { u: 28 }); return [...a, ...k.ring(a, { pad: 10 })]; } },
      { q: '2. Turkey has about as much tryptophan as chicken. Give two\n    better reasons you feel sleepy after the meal.', h: 0.72, a: '1)  the meal is huge: about 3000 kcal\n2)  lots of carbs + fat to digest', au: 26, lineH: 1.9 },
      { q: '3. Draw the negative feedback loop that brings blood glucose\n    back down after the meal.', h: 1.66, fig: loopFig },
    ] });
  const PHW = 720, PHH = 1500;
  const phT = (() => { const c = document.createElement('canvas'); c.width = PHW; c.height = PHH; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; })();
  const PX = 40, PY = 380, PWp = 640, PHp = Math.round(640 * sheet.h / sheet.w);
  const nib = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#ece6dc'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); return c; })();
  const LIGHT = { bg: '#f3f1eb', panel: '#ffffff', text: '#1d1d1d', muted: '#6a6a6a', line: 'rgba(0,0,0,.12)', accent: '#9a1c25', accentText: '#9a1c25', bubble: '#e8e2d6' };
  const DARK = { bg: '#1b1a19', panel: '#262422', text: '#ece6dc', muted: '#a39e96', line: 'rgba(255,255,255,.12)', accent: '#a3222c', accentText: '#e46c74', bubble: '#33302d' };
  const hexRGB = (h) => { if (h.startsWith('rgba')) return h.match(/[\d.]+/g).map(Number); const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255, 1]; };
  const mixC = (a, b, m) => { const A = hexRGB(a), Bc = hexRGB(b); const c = [0, 1, 2].map((i) => Math.round(A[i] + (Bc[i] - A[i]) * m)); return `rgba(${c.join(',')},${(A[3] ?? 1) + ((Bc[3] ?? 1) - (A[3] ?? 1)) * m})`; };
  const theme = (m) => Object.fromEntries(Object.keys(LIGHT).map((k) => [k, mixC(LIGHT[k], DARK[k], m)]));
  const PROMPT = 'bio hw due monday. show work + draw the feedback loop';
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? `${line} ${w}` : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; };
  const sun = (g, x, y, c) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI; g.beginPath(); g.moveTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17); g.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24); g.stroke(); } };
  const moon = (g, x, y, c, bg) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(x + 9, y - 7, 15, 0, 7); g.fill(); };
  const screen = (g, x, y, c) => { g.strokeStyle = c; g.lineWidth = 4; g.strokeRect(x - 20, y - 15, 40, 26); g.beginPath(); g.moveTo(x - 10, y + 19); g.lineTo(x + 10, y + 19); g.moveTo(x, y + 11); g.lineTo(x, y + 19); g.stroke(); };
  let phKey = '';
  // mode: home (light) | menu (k 0..1: the menu opens, the moon is tapped at 0.32, the theme fades dark 0.4 → 0.8) | desk (dark, p = written)
  function drawPhone(mode, k, p) {
    const key = `${mode}${Math.round(k * 60)}${Math.round((p || 0) * 3)}`; if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d'), m = mode === 'desk' ? 1 : mode === 'menu' ? ease(u01(k, 0.4, 0.8)) : 0, C = theme(m);
    g.fillStyle = C.bg; g.fillRect(0, 0, PHW, PHH);
    g.fillStyle = C.text; g.font = '600 26px Inter, Arial'; g.fillText('6:12', 40, 46); g.strokeStyle = C.text; g.lineWidth = 2; g.strokeRect(620, 26, 46, 22); g.fillStyle = C.text; g.fillRect(623, 29, 30, 16);
    g.drawImage(icon, 30, 78, 52, 52); g.fillStyle = C.text; g.font = '38px Georgia, serif'; g.fillText('Scribe', 94, 118);
    g.fillStyle = C.accent; g.beginPath(); g.arc(PHW - 64, 104, 28, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('V', PHW - 64, 115); g.textAlign = 'left';
    g.fillStyle = C.line; g.fillRect(0, 152, PHW, 2);
    if (mode !== 'desk') {
      g.fillStyle = C.text; g.font = '46px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PHW / 2, 470); g.fillText('solving today?', PHW / 2, 528); g.textAlign = 'left';
      g.fillStyle = C.panel; g.beginPath(); g.roundRect(36, 600, PHW - 72, 380, 28); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      // the attached worksheet chip + the typed instruction
      g.fillStyle = C.bubble; g.beginPath(); g.roundRect(64, 632, 330, 70, 16); g.fill(); g.fillStyle = C.accent; g.fillRect(84, 646, 32, 42); g.fillStyle = '#fff'; g.font = '700 13px Inter, Arial'; g.fillText('PDF', 88, 674);
      g.fillStyle = C.text; g.font = '600 24px Inter, Arial'; g.fillText('bio_hw.pdf', 132, 664); g.fillStyle = C.muted; g.font = '20px Inter, Arial'; g.fillText('1 page', 132, 690);
      g.fillStyle = C.text; g.font = '30px Inter, Arial'; wrap(g, PROMPT, PHW - 140).forEach((L, i) => g.fillText(L, 66, 760 + i * 42));
      g.fillStyle = C.accent; g.beginPath(); g.arc(PHW - 92, 922, 34, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(PHW - 92, 938); g.lineTo(PHW - 92, 906); g.moveTo(PHW - 106, 920); g.lineTo(PHW - 92, 906); g.lineTo(PHW - 78, 920); g.stroke();
    }
    if (mode === 'menu') {
      const open = ease(u01(k, 0, 0.16)), x0 = 250, y0 = 150, w = 430, h = 470 * open;
      g.fillStyle = `rgba(0,0,0,${0.18 * open})`; g.fillRect(0, 152, PHW, PHH);
      g.save(); g.beginPath(); g.rect(x0 - 10, y0, w + 20, h + 20); g.clip();
      g.fillStyle = C.panel; g.beginPath(); g.roundRect(x0, y0, w, 470, 22); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      g.fillStyle = C.text; g.font = '600 26px Inter, Arial'; g.fillText('Vex', x0 + 30, y0 + 50); g.fillStyle = C.muted; g.font = '22px Inter, Arial'; g.fillText('vex@example.edu', x0 + 30, y0 + 82);
      g.fillStyle = C.line; g.fillRect(x0 + 20, y0 + 104, w - 40, 2);
      g.fillStyle = C.text; g.font = '600 26px Inter, Arial'; g.fillText('Theme', x0 + 30, y0 + 160);
      const sel = k < 0.32 ? 0 : 1, ix = [x0 + 196, x0 + 276, x0 + 356], iy = y0 + 150;
      g.fillStyle = C.bubble; g.beginPath(); g.roundRect(ix[0] - 34, iy - 34, 3 * 80 - 12, 68, 34); g.fill();
      const selX = ix[0] + (ix[1] - ix[0]) * ease(u01(k, 0.3, 0.42)); g.fillStyle = C.accent; g.beginPath(); g.arc(selX, iy, 31, 0, 7); g.fill();
      sun(g, ix[0], iy, sel === 0 && selX < ix[0] + 30 ? '#fff' : C.muted); moon(g, ix[1], iy, selX > ix[1] - 30 ? '#fff' : C.muted, selX > ix[1] - 30 ? C.accent : C.bubble); screen(g, ix[2], iy, C.muted);
      if (k > 0.28 && k < 0.6) { const r = (k - 0.28) * 260; g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - (k - 0.28) / 0.32)})`; g.lineWidth = 6; g.beginPath(); g.arc(ix[1], iy, r, 0, 7); g.stroke(); }
      g.fillStyle = C.muted; g.font = '20px Inter, Arial'; g.fillText(['Light', 'Dark'][sel], x0 + 30, y0 + 192);
      [['Assignments archive', 250], ['Account settings', 320], ['Help', 390], ['Sign out', 450]].forEach(([s, yy]) => { g.fillStyle = C.text; g.font = '26px Inter, Arial'; g.fillText(s, x0 + 30, y0 + yy); });
      g.restore();
      if (k > 0.2 && k < 0.42) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(ix[1] + 6, iy + 8, 22, 0, 7); g.fill(); }   // her fingertip
    }
    if (mode === 'desk') {
      g.font = '26px Inter, Arial'; const lines = wrap(g, PROMPT, 440);
      g.fillStyle = C.bubble; g.beginPath(); g.roundRect(PHW - 500, 178, 470, 34 + lines.length * 36 + 54, 22); g.fill();
      g.fillStyle = C.accent; g.fillRect(PHW - 478, 196, 22, 28); g.fillStyle = C.text; g.font = '600 22px Inter, Arial'; g.fillText('bio_hw.pdf', PHW - 446, 218);
      g.font = '26px Inter, Arial'; lines.forEach((L, i) => g.fillText(L, PHW - 478, 262 + i * 36));
      // the page stays paper (README: "the handwritten pages … are paper and are never themed"); a hairline edge on the dark desk
      const tip = sheet.draw(p); g.drawImage(sheet.canvas, PX, PY, PWp, PHp); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.strokeRect(PX - 0.5, PY - 0.5, PWp + 1, PHp + 1);
      if (p < sheet.total - 0.5) { const cx = PX + tip[0] * PWp / sheet.w, cy = PY + tip[1] * PHp / sheet.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
      const yb = PY + PHp + 30; g.fillStyle = C.muted; g.font = '26px Inter, Arial'; g.fillText('1 page', 40, yb + 34);
      g.font = '600 26px Inter, Arial'; g.fillStyle = C.text; g.fillText('Shuffle', 250, yb + 34); g.fillText('Replay', 380, yb + 34); g.fillStyle = C.accentText; g.fillText('Export PDF', 510, yb + 34);
    }
    phT.needsUpdate = true;
  }
  const phone = F.phone, phScr = new THREE.Mesh(new THREE.PlaneGeometry(phone.W, phone.H), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.set(0, 0, 0.0006); phone.g.add(phScr);
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const phoneCam = (u, v, d) => { phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * phone.W, (0.5 - v) * phone.H, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const pp = scrP.clone().addScaledVector(scrN, d); return { pos: pp.toArray(), look: scrP.toArray(), fov: 40 }; };
  // writing pace: problems 1–2 on "it writes it in my handwriting", the loop (problem 3) on "feedback loop and all"
  const p3 = sheet.items.findIndex((it) => it.pi === 2), wOf = (it) => (it.kind === 'p' ? it.w : 1);
  const P12 = sheet.items.slice(0, p3).reduce((s, it) => s + wOf(it), 0), totalS = sheet.total;
  const writeP = (t) => (t < T.feedback - 0.15 ? P12 * ease(u01(t, T.writes - 0.15, T.feedback - 0.15)) : P12 + (totalS - P12) * u01(t, T.feedback - 0.15, T.fatty - 0.2));
  const g3 = sheet.items.filter((it) => it.pi === 2).flatMap((it) => (it.kind === 'p' ? it.pts : [[it.x, it.y], [it.x + it.w, it.y + it.h]])), gx = g3.map((q) => q[0]), gy = g3.map((q) => q[1]);
  const loopC = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];

  // ---------------------------------------------------------------- Vex (067's look) + the drumstick in her LEFT hand
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const GRIP = [0.5, 0.62, 0.72, 0.8, 0.86];   // a fist round a ~2.7 cm drumstick end
  // her left arm (her frame: +x = her left, +z = forward): chest height, raised toward the lens, low by her hip, back over her shoulder (toss)
  const STICK = {
    chest: [[0.2, -0.88, 0.32], [-0.42, 0.14, 0.9]],
    show: [[0.3, -0.66, 0.6], [-0.22, 0.3, 0.93]],
    low: [[0.22, -1, 0.08], [0.12, -0.6, 0.79]],
    toss: [[0.42, 0.62, -0.3], [0.05, 0.95, -0.3]],
  };
  const L_FREE = { hip: ARMS.hip.L, rest: ARMS.rest.L };
  const R_ARMS = { rest: [[-0.24, -1, 0.04], [-0.12, -1, 0.14]], hip: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]], ...Object.fromEntries(['point', 'peace', 'shh', 'kissOut', 'wave', 'beckon'].map((k) => [k, ARMS[k].R])),
    fist: [[-0.3, -0.45, 0.6], [0.25, 0.92, 0.25]], wide: [[-0.92, -0.38, 0.12], [-0.88, 0.12, 0.45]], temple: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]] };
  const R_HAND = { rest: 'relax', hip: 'relax', point: 'point', peace: 'peace', shh: 'point', kissOut: 'open', wave: 'open', beckon: 'beckon', temple: 'point', fist: 'fist', wide: 'open' };
  VEX.update(0, { pose: 'rest', armL: STICK.chest, hands: { L: GRIP } }); VEX.root.updateMatrixWorld(true);
  const hb = VEX.bpos('leftHand'), mid = VEX.bpos('leftMiddleProximal'), idx = VEX.bpos('leftIndexProximal'), lit = VEX.bpos('leftLittleProximal');
  const fwd = mid.clone().sub(hb).normalize(), axis = idx.clone().sub(lit).normalize(), palm = fwd.clone().cross(axis).normalize();
  const gripC = hb.clone().lerp(mid, 0.62).addScaledVector(palm, 0.027 + 0.012);
  const stickGrp = VEX.attach('leftHand', gripC.toArray()), held = makeDrumstick();
  held.quaternion.setFromUnitVectors(V(0, 1, 0), axis); held.position.addScaledVector(axis, 0.006); stickGrp.add(held);
  // a fist holds a stick along its knuckle line: turn the forearm (and bend the wrist) until the meat end stands up — per preset, at build
  const FIX = {}, qq = new THREE.Quaternion(), up = V(0, 1, 0);
  for (const [name, arm] of Object.entries(STICK)) {
    let best = { score: -9, tw: 0, hd: arm[1] };
    for (const sb of [0, 0.35, 0.7, 1.05]) for (let tw = -1.6; tw <= 1.6001; tw += 0.08) {
      const hd = V(arm[1][0], arm[1][1] + sb, arm[1][2]).normalize().toArray();
      VEX.update(0, { pose: 'rest', armL: arm, hands: { L: GRIP }, aim: { 'twist.leftLowerArm': tw, leftHand: hd } }); VEX.root.updateMatrixWorld(true);
      const ax = up.clone().applyQuaternion(held.getWorldQuaternion(qq)), score = ax.y - 0.04 * sb - 0.02 * Math.abs(tw);
      if (score > best.score) best = { score, tw, hd, y: ax.y };
    }
    FIX[name] = best;
  }
  console.log('[080] stick fix', JSON.stringify(Object.fromEntries(Object.entries(FIX).map(([k, v]) => [k, [v.tw.toFixed(2), v.y.toFixed(2)]]))));
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const armsOf = (v) => ({ L: v.can ? STICK[v.can] : L_FREE[v.l || 'hip'], R: R_ARMS[v.r || 'rest'] });
  const fixOf = (v) => (v.can ? FIX[v.can] : { tw: 0, hd: null });
  function glide(vexFn, t, v) {   // blend the arms over 0.28 s whenever the shot's pose function switches preset (pure: re-evaluates the past)
    const cur = armsOf(v); let L = cur.L, R = cur.R; const fx = fixOf(v); let tw = fx.tw, hd = fx.hd;
    for (const side of ['L', 'R']) for (let d = 0.04; d <= 0.32; d += 0.04) { const pvv = vexFn(t - d), pv = armsOf(pvv); if (pv[side] !== cur[side]) { const k = ease(clamp((d - 0.02) / 0.28));
      if (side === 'L') { L = mixArm(pv.L, cur.L, k); const f0 = fixOf(pvv); if (f0.hd && fx.hd) { tw = f0.tw + (fx.tw - f0.tw) * k; hd = f0.hd.map((x, i) => x + (fx.hd[i] - x) * k); } } else R = mixArm(pv.R, cur.R, k); break; } }
    return { ...v, armL: L, armR: R, stTw: tw, stHd: hd };
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face

  // ---------------------------------------------------------------- overlay: title, callouts, end card; the PIXEL cards + the clock HUD (270 × 480, ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHAT THANKSGIVING', 'DOES TO YOUR BODY'], t0: 0, t1: T.plate - 0.05, y: 0.13, plain: false, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const txtCache = new Map(), ptxt = (s, color, x, y, sc = 1, align = 'center') => { const kk = s + color; let cv = txtCache.get(kk); if (!cv) { cv = pixelText(s, { color }); txtCache.set(kk, cv); } const w = cv.width * sc; dctx.drawImage(cv, Math.round(align === 'left' ? x : x - w / 2), Math.round(y - cv.height * sc / 2), w, cv.height * sc); };
  const panel = (x0, y0, x1, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(x0, y0, x1 - x0, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y1, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y0, 2, y1 - y0); dctx.fillRect(x1, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const ORANGE = '#ff9a3a', CREAM = '#fff4c2', RED = '#ff6a6a', GREEN = '#7cf05f', LILAC = '#c8a0ff';
  const pxLeg = (x, y, s = 1) => { R('#b8662a', x + 2 * s, y, 7 * s, 8 * s); R('#d88a40', x + 3 * s, y + s, 3 * s, 3 * s); R('#f2ead8', x + 4 * s, y + 8 * s, 2 * s, 4 * s); R('#f2ead8', x + 3 * s, y + 12 * s, 4 * s, 2 * s); };
  const pxPlate = (x, y) => { R('#f2ead8', x, y + 6, 22, 4); R('#ffffff', x + 2, y + 5, 18, 2); R('#faf4e2', x + 3, y, 7, 5); R('#c0702e', x + 10, y + 1, 8, 4); R('#a0102a', x + 6, y + 3, 3, 2); R('#5aa04a', x + 15, y + 3, 3, 2); };
  const stomachPx = (cx, cy, s, fill) => {   // a pixel J-bean stomach scaled by s (1 = full size ≈ 120 × 70 canvas px)
    for (let yy = -40; yy <= 40; yy += 2) for (let xx = -70; xx <= 70; xx += 2) { const X = xx / 70, Y = yy / 40, bean = ((X + 0.1) ** 2) / 0.8 + ((Y - 0.18 * X * X) ** 2) / 0.62;
      if (bean < 1) R(bean > 0.82 ? '#ff7aa0' : (Y + 1) / 2 > 1 - fill ? '#ffb0c4' : '#7a2a48', cx + xx * s, cy + yy * s, Math.max(1, 2 * s), Math.max(1, 2 * s)); }
    R('#ff7aa0', cx - 58 * s, cy - 44 * s, 6 * s + 1, 22 * s); R('#ff7aa0', cx + 62 * s, cy + 14 * s, 18 * s, 6 * s + 1); };
  const Y0 = 210, Y1 = 330;
  let dgKey = '';
  const CLOCK = (t) => (t < T.plate ? null : t < T.stomach ? ['4:00 PM', 'DINNER'] : t < T.myth ? ['4:30 PM', 'STRETCHING'] : t < T.pivot ? ['6:00 PM', 'THE COUCH'] : t < T.fatty ? ['6:05 PM', 'HOMEWORK'] : t < T.late ? ['10:00 PM', 'STILL FULL'] : t < T.end ? ['2:00 AM', 'LEFTOVERS'] : ['2:05 AM', 'BEDTIME']);
  function diagram(t, sh) {
    let id = sh.card || null, k = 0;
    if (id === 'cal') k = u01(t, T.three - 0.1, T.calories + 0.4);
    else if (id === 'days') k = u01(t, sh.t0, T.half + 0.3);
    else if (id === 'stomach') k = t < T.it ? 0 : u01(t, T.stretch, T.four + 0.5);
    else if (id === 'trypto') k = u01(t, T.trypto - 0.1, T.chicken + 0.3);
    else if (id === 'coma') k = u01(t, T.size, T.carbs + 0.4);
    else if (id === 'gastric') k = u01(t, T.fatty, T.six + 0.5);
    else if (id === 'rule') k = u01(t, T.out - 0.1, T.usda + 0.2);
    const clock = !sh.phone && t < T.card ? CLOCK(t) : null;
    const key = `${id}${Math.round(k * 50)}${id === 'coma' || id === 'gastric' ? Math.round(t * 6) : ''}${clock ? clock[0] : ''}${id === 'stomach' && t >= T.it ? 'b' : ''}`; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480);
    if (clock) { panel(10, 80, 112, 116); ptxt(clock[0], '#ffffff', 61, 91, 2); ptxt(clock[1], ORANGE, 61, 108); }
    if (!id) return;
    panel(18, Y0, 252, Y1);
    if (id === 'cal') { ptxt('CALORIES IN ONE MEAL', '#ffd43b', 135, Y0 + 11);
      const base = Y1 - 14, H = 84, kc = 3000 * ease(k), h = H * kc / 3000, y2k = base - H * 2000 / 3000;
      R('#2a2640', 120, base - H, 34, H); R(ORANGE, 120, base - h, 34, h); R('#ffc070', 122, base - h, 4, h);
      for (let x = 60; x < 200; x += 8) R(RED, x, Math.round(y2k), 5, 2); ptxt('1 DAY: 2,000', RED, 214, y2k - 8);
      ptxt(`${Math.round(kc / 10) * 10 >= 1000 ? (Math.round(kc / 10) * 10).toLocaleString('en-US') : Math.round(kc / 10) * 10}`, '#ffffff', 82, base - h + 2, 1); pxPlate(70, base - 12); }
    if (id === 'days') { ptxt(k > 0.6 ? 'A DAY AND A HALF OF FOOD' : '3,000 CALORIES =', '#ffd43b', 135, Y0 + 11);
      const day = (x, f, lbl) => { R('#f2e6ff', x, Y0 + 30, 64, 70); R('#e04a3a', x, Y0 + 30, 64, 14); R('#2a2640', x + 3, Y0 + 47, 58, 50); R(ORANGE, x + 3, Y0 + 47 + 50 * (1 - f), 58, 50 * f); ptxt(lbl, '#ffffff', x + 32, Y0 + 37); };
      day(48, 1, 'DAY 1'); if (k > 0.3) day(158, 0.5 * ease(u01(k, 0.3, 0.8)), 'DAY 2'); ptxt('1.5 DAYS', '#ffffff', 135, Y1 - 12, 1); }
    if (id === 'stomach') { const big = t >= T.it, s = big ? 0.42 + 0.58 * boing(k) : 0.42;
      ptxt(big ? 'IT STRETCHES' : 'YOUR STOMACH, EMPTY', '#ffd43b', 135, Y0 + 11);
      stomachPx(big ? 110 : 135, Y0 + 66, s, big ? k : 0.1);
      if (!big) { ptxt('ABOUT THE SIZE', '#ffffff', 135, Y1 - 22); ptxt('OF YOUR FIST', '#ffffff', 135, Y1 - 11); }
      else { for (let i = 0; i < 4; i++) { if (k < 0.25 + i * 0.18) continue; const x = 196 + (i % 2) * 22, y = Y0 + 34 + Math.floor(i / 2) * 34; R('#f2f6ff', x, y + 4, 16, 24); R('#3a8ac8', x, y + 12, 16, 6); R('#f2f6ff', x + 4, y, 8, 4); }
        ptxt('UP TO 4 LITERS', '#ffffff', 135, Y1 - 11); } }
    if (id === 'trypto') { ptxt('TRYPTOPHAN PER SERVING', '#ffd43b', 135, Y0 + 11);
      const base = Y1 - 26, H = 62 * ease(k); R('#2a2640', 64, base - 62, 40, 62); R('#2a2640', 166, base - 62, 40, 62); R(ORANGE, 64, base - H, 40, H); R('#ffd43b', 166, base - H * 0.98, 40, H * 0.98);
      pxLeg(76, base + 3); ptxt('TURKEY', ORANGE, 84, Y1 - 10); ptxt('CHICKEN', '#ffd43b', 186, Y1 - 10); if (k > 0.85) ptxt('ABOUT THE SAME', '#ffffff', 135, Y0 + 28); }
    if (id === 'coma') { ptxt(t > T.carbs - 0.2 ? '+ ALL THOSE CARBS' : 'IT\'S THE SIZE OF THE MEAL', '#ffd43b', 135, Y0 + 11);
      const n = Math.round(14 * ease(k)), icons = [(x, y) => { R('#d8a050', x, y + 2, 12, 8); R('#f0c070', x + 2, y, 8, 3); }, (x, y) => { R('#faf4e2', x, y, 12, 9); R('#ffe070', x + 4, y + 1, 4, 2); }, (x, y) => { R('#9a6630', x, y + 2, 12, 8); R('#6a8a3a', x + 3, y + 4, 3, 3); }, (x, y) => { R('#d8742a', x, y + 3, 12, 7); R('#d89a50', x, y + 8, 12, 2); }];
      for (let i = 0; i < n; i++) { const row = Math.floor(i / 5), col = i % 5; icons[i % 4](70 + col * 16 + (row % 2) * 8, Y1 - 22 - row * 11); }
      const zN = Math.floor(t * 3) % 4; for (let i = 0; i < zN; i++) ptxt('Z', LILAC, 196 + i * 12, Y1 - 30 - i * 12, 1 + i * 0.5); ptxt('FOOD COMA', '#ffffff', 196, Y1 - 10); }
    if (id === 'gastric') { ptxt('STILL DIGESTING', '#ffd43b', 135, Y0 + 11);
      const x0 = 34, x1 = 236, yb = Y1 - 30, hr = (x1 - x0) / 8; R('#f2e6ff', x0, yb, x1 - x0, 2);
      for (let h = 0; h <= 8; h += 2) { R('#f2e6ff', x0 + h * hr, yb - 3, 2, 8); ptxt(['4P', '6P', '8P', '10P', '12A'][h / 2], '#c8c0d8', x0 + h * hr + 1, yb + 12); }
      const tNow = 6 * ease(k), xn = x0 + tNow * hr; R(ORANGE, x0, yb - 3, xn - x0, 4);
      stomachPx(xn, yb - 32, 0.26, 0.85 - 0.18 * ease(k)); if (k > 0.75) { R(RED, x0 + 2 * hr, yb - 62, 6 * hr - 2 * hr + 2, 2); ptxt('6+ HOURS', RED, x0 + 4 * hr, yb - 70); } }
    if (id === 'rule') { ptxt('LEFTOVERS OUT SINCE 4 PM', '#ffd43b', 135, Y0 + 11);
      const x0 = 34, x1 = 236, yb = Y0 + 64, hr = (x1 - x0) / 10, f = ease(k);
      R('#2a2640', x0, yb, x1 - x0, 12); R(GREEN, x0, yb, Math.min(2, 10 * f) * hr, 12); if (f * 10 > 2) R(RED, x0 + 2 * hr, yb, (10 * f - 2) * hr, 12);
      ptxt('4 PM', '#c8c0d8', x0 + 10, yb + 22); ptxt('6 PM', GREEN, x0 + 2 * hr, yb + 22); ptxt('2 AM', RED, x1 - 8, yb + 22);
      if (f > 0.5) ptxt('USDA: 2 HOURS MAX', '#ffffff', 135, Y1 - 30); if (f > 0.9) ptxt('10 H OUT = TOSS IT', RED, 135, Y1 - 13); }
  }

  // ---------------------------------------------------------------- shots
  const PT = { ...F.D.vex.table, rotY: 0 }, PL = { ...F.D.vex.lounge, rotY: -0.55 }, PN = { x: 0.55, z: 0.4, rotY: -0.2 }, PK = { ...F.D.vex.island, rotY: PI }, PF = { ...F.D.vex.fridge, rotY: PI };
  const SH = [
    { id: 'open', t0: 0, mode: 'dusk', vex: (t) => ({ ...PT, can: t < 0.9 ? 'low' : 'chest', r: 'hip', tilt: 0.08, face: CONF(t) }), cam: (t) => { const k = ease(u01(t, 0, T.here)); return { pos: [0.55 - 0.35 * k, 1.42, 3.0 - 0.7 * k], look: [0.0, 1.22, -0.6], fov: 50 }; } },
    { id: 'hook', t0: T.here - 0.1, mode: 'dusk', vex: (t) => ({ ...PT, can: 'show', r: t > T.hour - 0.3 ? 'point' : 'hip', tilt: -0.08, turn: 0.05, face: CONF(t, { relaxed: 0.18 }) }), cam: (t) => ({ pos: [0.1, 1.5, 1.95 - 0.15 * u01(t, T.here, T.plate)], look: [0.0, 1.36, 0.42], fov: 46 }) },
    { id: 'plate', t0: T.plate, mode: 'dusk', cam: (t) => { const k = ease(u01(t, T.plate, T.about)); return { pos: [0.34 - 0.08 * k, 1.28 - 0.08 * k, 0.32 - 0.06 * k], look: [0.0, 0.8, -0.3], fov: 46 }; } },
    { id: 'cal', t0: T.about - 0.05, mode: 'dusk', card: 'cal', vex: (t) => ({ ...PT, can: 'chest', r: t > T.three - 0.2 ? 'peace' : 'hip', tilt: 0.1, face: CONF(t) }), cam: (t) => ({ pos: [-0.1, 1.42, 2.15 - 0.2 * u01(t, T.about, T.thats)], look: [0.0, 1.26, 0.42], fov: 48 }) },
    { id: 'days', t0: T.thats - 0.1, mode: 'dusk', card: 'days', vex: (t) => ({ ...PT, can: 'show', r: 'hip', tilt: -0.06, turn: -0.15, face: CONF(t, { surprised: 0.2 }) }), cam: (t) => ({ pos: [0.95, 1.45, 2.0 - 0.1 * u01(t, T.thats, T.stomach)], look: [0.05, 1.27, 0.2], fov: 46 }) },
    { id: 'fist', t0: T.stomach, mode: 'dusk', card: 'stomach', vex: (t) => ({ ...PT, can: 'low', r: t > T.fist - 0.45 ? 'fist' : 'hip', tilt: 0.06, face: CONF(t) }), cam: (t) => ({ pos: [0.3, 1.45, 2.0 - 0.15 * u01(t, T.stomach, T.it)], look: [0.0, 1.28, 0.42], fov: 46 }) },
    { id: 'stretch', t0: T.it - 0.1, mode: 'dusk', card: 'stomach', vex: (t) => ({ ...PT, can: 'chest', r: t > T.stretch - 0.2 ? 'wide' : 'fist', tilt: -0.1, face: CONF(t, { surprised: t > T.four - 0.2 ? 0.35 : 0.1 }) }), cam: (t) => ({ pos: [-0.75, 1.42, 2.05 - 0.12 * u01(t, T.it, T.myth)], look: [-0.05, 1.27, 0.3], fov: 46 }) },
    { id: 'couch', t0: T.myth, mode: 'dusk', uncle: true, zs: true, cam: (t) => { const k = ease(u01(t, T.myth, T.everyone)); return { pos: [6.05 - 0.1 * k, 1.85, -2.45 + 0.15 * k], look: [6.3, 0.85, 1.9], fov: 52 }; } },
    { id: 'blame', t0: T.everyone - 0.1, mode: 'dusk', uncle: true, vex: (t) => ({ ...PL, can: t > T.everyone + 0.15 ? 'show' : 'chest', r: 'hip', turn: t > T.everyone + 0.1 && t < T.turkey - 0.3 ? 0.45 : 0.05, tilt: 0.06, face: CONF(t, { relaxed: 0.16 }) }), cam: (t) => { const k = ease(u01(t, T.everyone, T.turkey)); return { pos: [4.0 + 0.12 * k, 1.45, 1.55 - 0.12 * k], look: [5.55, 1.12, -0.45], fov: 50 }; } },
    { id: 'turkey', t0: T.turkey - 0.15, mode: 'dusk', steam: true, cam: (t) => { const k = ease(u01(t, T.turkey - 0.15, T.but)); return { pos: [0.55 - 0.15 * k, 1.12, -0.05 - 0.05 * k], look: [0.0, 0.92, -0.6], fov: 44 }; } },
    { id: 'trypto', t0: T.but - 0.1, mode: 'dusk', uncle: true, card: 'trypto', vex: (t) => ({ ...PL, can: 'show', r: 'hip', tilt: -0.08, face: CONF(t, { relaxed: 0.18 }) }), cam: (t) => ({ pos: [4.35, 1.5, 1.35 - 0.12 * u01(t, T.but, T.size)], look: [5.12, 1.3, -0.12], fov: 46 }) },
    { id: 'coma', t0: T.size, mode: 'dusk', uncle: true, card: 'coma', zs: true, cam: (t) => { const k = ease(u01(t, T.size, T.carbs)); return { pos: [6.3 + 0.08 * k, 1.35, 1.3 - 0.15 * k], look: [6.58, 0.95, -0.95], fov: 50 }; } },
    { id: 'carbs', t0: T.carbs - 0.3, mode: 'dusk', uncle: true, zs: true, vex: (t) => ({ ...PL, can: 'low', r: 'temple', tilt: 0.12, face: CONF(t, { relaxed: 0.3, blink: 0.35 }) }), cam: (t) => ({ pos: [4.4, 1.45, 1.25], look: [5.12, 1.38, -0.12], fov: 44 }) },
    { id: 'pivot', t0: T.pivot, mode: 'dusk', uncle: true, vex: (t) => ({ ...PL, can: 'low', r: t > T.cute - 0.35 ? 'kissOut' : 'hip', tilt: -0.12, lean: 0.06, face: CONF(t, { relaxed: t > T.cute - 0.3 ? 0.22 : 0.1, blinkLeft: t > T.cute + 0.15 ? 1 : 0 }) }), cam: (t) => ({ pos: [4.55, 1.55, 0.95 - 0.08 * u01(t, T.pivot, T.scribe)], look: [5.12, 1.47, -0.12], fov: 42 }) },
    { id: 'home', t0: T.scribe, mode: 'dusk', phone: 'home' },
    { id: 'theme', t0: T.dark - 0.05, mode: 'dusk', phone: 'menu' },
    { id: 'write', t0: T.writes - 0.25, mode: 'dusk', phone: 'write' },
    { id: 'loop', t0: T.feedback - 0.1, mode: 'dusk', phone: 'loop' },
    { id: 'ten', t0: T.fatty, mode: 'night', card: 'gastric', vex: (t) => ({ ...PN, can: 'chest', r: 'hip', tilt: 0.1, lean: 0.04, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => { const k = ease(u01(t, T.fatty, T.six)); return { pos: [1.35 - 0.2 * k, 1.42, 2.1 - 0.15 * k], look: [0.45, 1.24, 0.1], fov: 48 }; } },
    { id: 'sixh', t0: T.six - 0.1, mode: 'night', card: 'gastric', vex: (t) => ({ ...PN, can: 'show', r: 'point', tilt: -0.08, face: CONF(t, { angry: 0.18 }) }), cam: (t) => ({ pos: [0.2, 1.48, 1.85 - 0.1 * u01(t, T.six, T.late)], look: [0.5, 1.33, 0.4], fov: 46 }) },
    { id: 'late', t0: T.late, mode: 'late', fridge: 1, vex: (t) => ({ ...PK, can: 'show', r: 'hip', tilt: 0.08, face: CONF(t, { relaxed: 0.25 }) }), cam: (t) => { const k = ease(u01(t, T.late, T.out)); return { pos: [-5.4 + 0.15 * k, 1.45, -1.7 + 0.2 * k], look: [-5.2, 1.18, 0.55], fov: 50 }; } },
    { id: 'rule', t0: T.out - 0.1, mode: 'late', fridge: 1, card: 'rule', vex: (t) => ({ ...PK, can: 'chest', r: t > T.usda - 0.2 ? 'point' : 'hip', tilt: -0.08, face: CONF(t, { surprised: 0.2 }) }), cam: (t) => ({ pos: [-4.85, 1.48, -1.2 + 0.12 * u01(t, T.out, T.toss)], look: [-5.2, 1.3, 0.55], fov: 46 }) },
    { id: 'toss', t0: T.toss - 0.15, mode: 'late', fridge: 1, vex: (t) => ({ ...PK, can: t > T.toss - 0.12 ? 'toss' : 'chest', r: 'hip', tilt: 0.05, turn: t > T.toss ? -0.25 : 0, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => ({ pos: [-5.75, 1.5, -1.65], look: [-5.25, 1.45, 0.6], fov: 54 }) },
    { id: 'end', t0: T.end, mode: 'late', fridge: 1, fridgeCam: true, vex: (t) => ({ ...PF, l: 'hip', r: t > T.watching - 0.35 ? 'point' : t > T.close - 0.2 ? 'hip' : 'rest', tilt: -0.08, face: CONF(t, { relaxed: t > T.watching ? 0.22 : 0.1, blinkLeft: t > T.you + 0.1 && t < T.you + 0.9 ? 1 : 0 }) }), cam: (t) => ({ pos: [-5.2, 1.44, -2.72 + 0.06 * u01(t, T.end, T.card)], look: [-5.2, 1.47, -1.32], fov: 56 }) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  // the tossed drumstick: starts where the held one is at the release, flies back over her shoulder, spinning
  const tossed = makeDrumstick(); F.root.add(tossed); tossed.visible = false;
  const tossSh = SH.find((s2) => s2.id === 'toss');
  const poseVex = (sh, t) => { const v = glide(sh.vex, t, sh.vex(t)); const aim = v.stHd ? { 'twist.leftLowerArm': v.stTw, leftHand: v.stHd } : {};
    const hL = v.can ? (sh.id === 'toss' && t >= T.release ? 'open' : GRIP) : 'relax';
    VEX.update(t, { ...lips(t), sway: 0.15, ...v, aim, hands: { L: hL, R: R_HAND[v.r || 'rest'] }, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: v.y ?? 0, rotY: v.rotY ?? 0 }); VEX.root.updateMatrixWorld(true); return v; };
  poseVex(tossSh, T.release); const tossP0 = held.getWorldPosition(V()), tossQ0 = held.getWorldQuaternion(new THREE.Quaternion());
  const tossV = V(0.5, 2.6, 1.9), spinAx = V(1, 0, 0.3).normalize(), spinQ = new THREE.Quaternion();

  // the family at the table (dusk): eating, chatting; the uncle asleep on the couch
  const ARM_EAT = (u) => ({ x: -0.75 - 0.6 * u, z: -0.18 - 0.08 * u, bend: -0.45 - 1.2 * u });
  const FACES = ['happy', 'talk', 'grin', 'talk'];
  function poseFamily(t, show) {
    F.family.forEach(({ P, seat }, i) => {
      P.root.visible = show; if (!show) return;
      const fx = Math.sin(seat.rotY), fz = Math.cos(seat.rotY), cyc = ((t * 0.55 + i * 0.37) % 1), bite = cyc < 0.35 ? Math.sin(cyc / 0.35 * PI) : 0;
      const talking = !bite && ((t * 1.3 + i) % 2) < 1.1, mouthOpen = talking && ((t * 7 + i) % 1) < 0.5;
      const shock = i === 3 && t > T.three && t < T.stomach;
      P.pose({ x: seat.x - 0.1 * fx, z: seat.z - 0.1 * fz, y: -0.09, rotY: seat.rotY, legL: { x: -1.57, bend: 1.57 }, legR: { x: -1.57, bend: 1.57 },
        armR: ARM_EAT(bite), armL: { x: -0.7, z: -0.1, bend: -0.5 }, lean: 0.12 + 0.08 * bite, head: { pitch: 0.15 - 0.2 * bite + Math.sin(t * 1.7 + i) * 0.05, yaw: Math.sin(t * 0.6 + i * 2) * 0.35 },
        face: shock ? 'shock' : bite ? 'idle' : mouthOpen ? 'talk' : FACES[i] });
    });
    const U = F.uncle; if (!U) return;
    const breath = Math.sin(t * 1.4);
    U.pose({ x: F.D.couch.x + 0.5, z: F.D.couch.z + 0.0, y: -0.06 + breath * 0.004, rotY: 0, legL: { x: -1.35, bend: 1.4, z: 0.12 }, legR: { x: -1.35, bend: 1.45, z: 0.15 }, lean: -0.38,
      armL: { x: -0.35, z: 0.3, bend: -0.9 }, armR: { x: -0.2, z: 0.45, bend: -0.6 }, head: { pitch: -0.42 + breath * 0.03, roll: 0.25, yaw: -0.2 }, face: 'sleepy' });
  }

  const camQ = new THREE.Quaternion();
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    F.setMode(sh.mode); F.setFridge(sh.fridge ?? 0); F.fridge.light.distance = 4.5;
    help2.visible = t >= T.two; { const s = boing(u01(t, T.two, T.two + 0.4)); help2.scale.setScalar(Math.max(0.001, s)); }
    poseFamily(t, sh.mode === 'dusk'); if (F.uncle) F.uncle.root.visible = sh.mode === 'dusk';
    // the phone: light home → account menu (moon) → dark desk writing the page
    if (t < T.dark - 0.05) drawPhone('home', 0, 0);
    else if (t < T.writes - 0.25) drawPhone('menu', u01(t, T.dark - 0.05, T.writes - 0.3), 0);
    else drawPhone('desk', 0, writeP(t));
    // Vex + her drumstick
    VEX.root.visible = !!sh.vex;
    let v = null;
    if (sh.vex) v = poseVex(sh, t);
    held.visible = !!(v && v.can) && !(sh.id === 'toss' && t >= T.release);
    tossed.visible = sh.id === 'toss' && t >= T.release;
    if (tossed.visible) { const s = t - T.release; tossed.position.copy(tossP0).addScaledVector(tossV, s); tossed.position.y -= 4.9 * s * s; tossed.quaternion.copy(tossQ0).premultiply(spinQ.setFromAxisAngle(spinAx, s * 14)); }
    // steam + Z's
    puffs.hide();
    if (sh.steam) for (let i = 0; i < 6; i++) { const a = ((t * 0.5 + i / 6) % 1); puffs.set(i, V(0.02 + Math.sin(i * 2.1 + t) * 0.05, tbl.y + 0.28 + a * 0.45, -0.6 + Math.cos(i * 1.3) * 0.05), 0.12 + a * 0.18, 0.3 * Math.sin(a * PI)); }
    zs.forEach((z, i) => { z.visible = !!sh.zs; if (!sh.zs) return; const a = ((t * 0.45 + i / 3) % 1); z.position.set(F.D.couch.x + 0.5 + 0.15 * a + Math.sin(t * 2 + i) * 0.03, 1.25 + a * 0.55, F.D.couch.z - 0.05); z.scale.setScalar(0.07 + a * 0.08); z.material.opacity = Math.sin(a * PI); });
    // camera
    let cam;
    if (sh.phone === 'home') cam = phoneCam(0.5, 0.48, 0.24 - 0.02 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'menu') cam = phoneCam(0.56, 0.26, 0.18 - 0.01 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'write') cam = phoneCam(0.5, 0.45, 0.158 - 0.01 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'loop') { const gu = (PX + loopC[0] * PWp / sheet.w) / PHW, gv = (PY + loopC[1] * PHp / sheet.h) / PHH; cam = phoneCam(gu + 0.025, gv + 0.035, 0.135 - 0.012 * u01(t, sh.t0, sh.t1)); }
    else cam = sh.cam(t);
    if (SIDE_DBG && sh.vex) { const h = VEX.bpos('leftHand'), f = V(Math.sin(v?.rotY ?? 0), 0, Math.cos(v?.rotY ?? 0)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, 0.75).addScaledVector(f, 0.15).add(V(0, 0.05, 0)).toArray(), look: h.toArray(), fov: 40 }; }
    let amp = 0;
    if (sh.id === 'toss') { const a = t - T.release; if (a >= 0 && a < 0.3) amp = 0.012 * (1 - a / 0.3); }
    studio.camera.far = 40; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, amp);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -3).addScaledVector(side, -1.5).add(V(0, 3, 0)); key.intensity = sh.mode === 'dusk' ? 0.55 : sh.mode === 'night' ? 0.3 : 0.12;
      key.color.set(sh.mode === 'late' ? 0xbcd0ff : 0xfff0dc);
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0));
      fill.intensity = sh.vex ? Math.min(1.6, 0.26 * Math.pow(d, 1.6)) * (sh.mode === 'late' ? 0.7 : d < 1.2 ? 0.8 : 1) : 0; fill.color.set(sh.mode === 'late' ? 0xe0ecff : 0xfff0f0); }
    F.update(t);
    diagram(t, sh);
    pixel.set(sh.phone ? 1 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
    void camQ;
  }
  const key = new THREE.DirectionalLight(0xfff0dc, 0.55); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 24 }); scene.add(key, key.target);
  update(0);
  return { update };
}
