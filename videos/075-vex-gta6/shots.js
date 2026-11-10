// 075 — "Why GTA 6 took 13 years" (Scribe lane, Vex explainer, anime/pixel look). Batch brief (manager, Nov 9): a Vex EXPLAINER on what
// college students are talking about THIS week, games/internet lane. GTA VI launches Nov 19 2026 (Take-Two reconfirmed it in its Nov 9
// results: "the launch is ten days away"), so: why the biggest game ever made took 13 years. TRUE numbers only (sources in caption.md):
//   facts   = 13 years after GTA V (Sept 17 2013); "more than eight years" of development, Rockstar 2,441 staff (RDR2, 2018) → 4,711 across
//             12 offices (Aug 2026), an L.A. team just for the NPCs (Bloomberg, Jason Schreier, Oct 14 2026); performance capture with real
//             actors (Rockstar's own capture stages; GTA V's cast on it); budget never disclosed — analysts estimate $1–1.5 B (Wedbush,
//             Business Insider via IGN); GTA V ≈ $265 M with marketing (The Scotsman, 2013); GTA V grossed $1 B in 3 days (Guinness);
//             on the homework: release gaps 1, 2, 4, 5, 13 yrs (mean 5, median 4) and Trailer 2's 475 M views in 24 h (Rockstar via THR).
//   places  = NEW: a performance-capture stage (engine/sets/mocap.js: taped volume, truss of red-ring cameras, actors in marker suits
//             sparring / driving a pipe-frame car buck / falling on a crash mat, a big retarget screen where the solve becomes a game
//             character, video village with the Scribe phone) + a NEW sunset neon beach strip, the "game world" (engine/sets/neonstrip.js:
//             pastel art-deco hotels with neon words, palms, a banded synthwave sun over the sea, coupes, pedestrians = "the randoms").
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated, low in the frame so her face stays clear):
//             2013 → 2026 bar, staff icons doubling, NPC tags over the walkers' heads, two money stacks (GTA 5 vs the GTA 6 estimate),
//             a $1 B counter over three calendar days.
//   Scribe  = the page WRITES ITSELF ON THE PHONE SCREEN (user rule, Nov 9), a STATS sheet with a hand-drawn bar chart (math:
//             statistics, user steer: rotate subjects), then the feature: the set's PEN + INK picker (README §The handwriting picker:
//             "Pen: Ballpoint, Gel pen, Fountain pen, Fine marker, Pencil" + "Ink: … Purple …"; §The writing desk: each answer set's pen
//             control "redraw[s] only that set … without solving again") → the page rewrites in purple fountain-pen ink.
//   persona = the lighter Vex: confident, teasing ("Rude.", "See you on the nineteenth."), Fish "Dolly", less-breathy settings.
// Guardrails: no game logos/art/characters/UI (our own generic city, studio and phone), no claims about real people, no politics.
// Props rule (Nov 9): Vex holds nothing in this reel (the phone stands on the director's desk).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet, layoutHand } from '@engine/build/scribe.js';
import { basePose, applyPose } from '@engine/rig.js';
import { buildMocap } from '@engine/sets/mocap.js';
import { buildNeonStrip } from '@engine/sets/neonstrip.js';

const PI = Math.PI, PIXEL = 4;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SX = 1000;   // the neon strip is parked at x = +1000 (the mocap stage sits at the origin)

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
    thirteen: W('hook', 'thirteen'), heres: W('hook', 'heres'), team: B.team.t0, nearly: W('team', 'nearly'),
    mocap: B.mocap.t0, suits: W('mocap', 'suits'), theres: W('mocap', 'theres'), just: W('mocap', 'just'),
    pivot: B.pivot.t0, your: W('pivot', 'your'), handwritten: W('pivot', 'handwritten'), rude: W('pivot', 'rude'),
    scribe: B.scribe.t0, chart: W('scribe', 'chart'), dont: W('scribe', 'dont'), sw: W('scribe', 'switch'), purple: W('scribe', 'purple'), rewrites: W('scribe', 'rewrites'), page: W('scribe', 'page'),
    money: B.money.t0, over: W('money', 'over'), gta5: W('money', 'gta'), end: B.end.t0, billion: W('end', 'billion'), see: W('end', 'see'), nineteenth: W('end', 'nineteenth'),
  };
  T.card = T.nineteenth + 0.6;
  T.fall = T.nearly + 0.5;                                    // the stunt actor falls onto the mat in the team wide
  T.tapPen = T.sw + 0.25; T.tapInk = T.sw + 0.75; T.close = T.purple - 0.05;   // the picker: tap Fountain, tap Purple, close
  scene.background = new THREE.Color(0x0c0d12);

  // ---------------------------------------------------------------- sets
  const M = buildMocap(studio); scene.add(M.root);
  const N = buildNeonStrip(studio); N.root.position.x = SX; scene.add(N.root); N.root.visible = false;
  const stripFog = N.fog;
  // the hero coupe parked by the hotel sidewalk near x = 3 (money shot)
  const hero = N.cars[0]; hero.g.position.set(3.2, 0, 3.55); hero.g.rotation.y = PI / 2;
  N.cars[4].g.position.set(-14, 0, 3.6);

  // ---------------------------------------------------------------- Scribe: the stats homework, blue, and the same page in purple
  const HAND = '/videos/049-scribe-promo/hand.json', BLUE = '#1b2760', PURP = '#5b2a86';
  const G = await loadHand(HAND, BLUE), GP = await loadHand(HAND, PURP), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const cut = { a: 0, b: 0 };   // weight where the bar chart starts / ends (Q1's text, then the chart, then Q2)
  const SHEET = (Gx, ink) => makeSheet(Gx, { rich: true, seed: 11, ink, name: 'Vex', title: 'STATS 101 · PROBLEM SET 6', note: 'Due Friday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 2', problems: [
    { q: '1.  GTA release years: 2001, 2002, 2004, 2008, 2013, 2026.\n     Find the gaps between games, their mean and median.\n     Which is the better "typical" gap? Draw a bar chart.', h: 2.25, fig: ({ k, y }) => {
      const tx = [
        ...k.text('gaps: 1, 2, 4, 5, 13', 124, y + 200, { u: 26 }),
        ...k.text('mean = 25/5 = 5 yrs', 124, y + 270, { u: 26 }),
        ...k.text('median = 4 yrs', 124, y + 340, { u: 26 }),
      ];
      const fin = k.text('median: 13 is an outlier', 124, y + 430, { u: 24 });
      const ox = 610, oy = y + 610, sy = 26, bw = 40, gap = 64, out = [];
      out.push(...k.arrow([ox, oy + 4], [ox, oy - 13 * sy - 40], { head: 12 }), ...k.line([ox - 6, oy], [ox + 5 * gap + 20, oy]));
      [1, 2, 4, 5, 13].forEach((v, i) => { const x0 = ox + 16 + i * gap; out.push(...k.poly([[x0, oy], [x0, oy - v * sy], [x0 + bw, oy - v * sy], [x0 + bw, oy]])); });
      ['VC', 'SA', 'IV', 'V', 'VI'].forEach((s, i) => out.push(...k.text(s, ox + 16 + i * gap + bw / 2, oy + 40, { u: 20, align: 'center' })));
      out.push(...k.dashed([ox - 4, oy - 5 * sy], [ox + 5 * gap + 16, oy - 5 * sy]), ...k.text('mean', ox + 5 * gap + 20, oy - 5 * sy + 8, { u: 18 }), ...k.text('yrs', ox + 14, oy - 13 * sy - 30, { u: 18 }));
      const ring = k.ring(fin, { pad: 8 });
      return Object.assign([...tx, ...fin, ...ring, ...out], { nText: tx.length + fin.length + ring.length });
    } },
    { q: '2.  Trailer 2 got 475 million views in its first 24 hours.\n     About how many views per second?', h: 1.0, fig: ({ k, y }) => {
      const a = k.text('475,000,000 / 86,400', 124, y + 140, { u: 27 }), b = k.text('= about 5,500 views/s', 124, y + 210, { u: 27 }); return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
  ] });
  const sheetA = SHEET(G, BLUE), sheetB = SHEET(GP, PURP);
  { // where the chart's strokes start/end in writing order (weights: a glyph = 1, a pen stroke = its w)
    const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, q1 = sheetA.items.filter((it) => it.pi === 0), n = q1.length;
    // the chart = Q1's items after its text + ring: find the first item of the y-axis arrow (the first 'p' item left of x 640 and below y 700)
    let first = q1.findIndex((it) => it.kind === 'p' && it.pts[0][0] > 590 && it.pts[0][0] < 630 && it.pts[0][1] > 800);
    if (first < 0) first = Math.floor(n * 0.6);
    for (let i = 0; i < first; i++) acc += wt(q1[i]); cut.a = acc; for (let i = first; i < n; i++) acc += wt(q1[i]); cut.b = acc;
  }
  const totalA = sheetA.total;
  const chartC = [770, 300 + 610 - 170];   // canvas px of the chart's middle (for the close-up)
  // the phone screen (720 × 1500): header, the prompt bubble, the round's row (pen + paper icons, Shuffle · Replay · Export PDF), the sheet, the composer
  const PHW = M.PHW, PHH = M.PHH, phT = M.phT, RED = '#9a1c25';
  const SX0 = 24, SY0 = 330, SWp = 672, SHp = Math.round(672 * sheetA.h / sheetA.w);
  const nib = (col) => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = col; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.fillStyle = '#e0b04a'; g.fillRect(40, -7, 4, 14); return c; };
  const nibB = nib('#3a4a8a'), nibP = nib('#7a3aa8');
  const PENS = ['Ballpoint', 'Gel pen', 'Fountain pen', 'Fine marker', 'Pencil'], INKS = [['#1b2760', 'Blue-black'], ['#111111', 'Black'], ['#1f4fd0', 'Blue'], ['#6b6e74', 'Pencil grey'], ['#1f7a3a', 'Green'], [PURP, 'Purple'], ['#b3261e', 'Red']];
  const preview = (Gx) => { const c = document.createElement('canvas'); c.width = 600; c.height = 90; const g = c.getContext('2d');
    for (const it of layoutHand(Gx, '2x + 5 = 13,  x = 4', { x: 10, y: 66, u: 30, seed: 5 })) g.drawImage(it.c, it.x, it.y, it.w, it.h); return c; };
  const prevB = preview(G), prevP = preview(GP);
  let phKey = '';
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  function drawPen(g, kind, x, y, ink, lift) {   // a little pen standing on its end (the README's pen tray)
    const by = y - lift, w = 34;
    g.save(); g.translate(x, by);
    const body = { Ballpoint: '#2a3a8a', 'Gel pen': '#3a3a40', 'Fountain pen': '#1d1d22', 'Fine marker': '#e8e2d6', Pencil: '#f2c230' }[kind];
    g.fillStyle = body; rr(g, -w / 2, -150, w, 120, 8); g.fill();
    if (kind === 'Ballpoint') { g.fillStyle = '#c0c4cc'; g.fillRect(w / 2 - 6, -146, 5, 46); }
    if (kind === 'Gel pen') { g.fillStyle = '#5a5a62'; for (let k = 0; k < 6; k++) g.fillRect(-w / 2, -62 + k * 5, w, 2); }
    if (kind === 'Fountain pen') { g.fillStyle = '#e0b04a'; g.fillRect(-w / 2, -60, w, 6); }
    if (kind === 'Pencil') { g.fillStyle = '#ff9aa8'; rr(g, -w / 2, -164, w, 18, 4); g.fill(); g.fillStyle = '#c0c4cc'; g.fillRect(-w / 2, -150, w, 8); }
    g.fillStyle = kind === 'Pencil' ? '#e8c08a' : kind === 'Fountain pen' ? '#e0b04a' : '#c0c4cc';
    g.beginPath(); g.moveTo(-w / 2, -30); g.lineTo(w / 2, -30); g.lineTo(kind === 'Fine marker' ? 6 : 3, 0); g.lineTo(kind === 'Fine marker' ? -6 : -3, 0); g.closePath(); g.fill();
    g.fillStyle = ink; g.beginPath(); g.arc(0, -2, kind === 'Fine marker' ? 6 : 4, 0, 2 * PI); g.fill();
    g.restore();
  }
  function drawPhone(mode, p, k = 0) {   // mode: 'write' | 'picker' | 'rewrite'
    const sheet = mode === 'rewrite' ? sheetB : sheetA, purple = mode === 'rewrite' || (mode === 'picker' && k >= 1);
    const key = `${mode}${Math.round(p * 3)}${Math.round(k * 30)}`; if (key === phKey) return; phKey = key;
    const tip = sheet.draw(mode === 'picker' ? sheet.total : p), g = phT.canvas.getContext('2d');
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    // header
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, PHW, 112); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 112, PHW, 2);
    g.drawImage(icon, 24, 34, 52, 52); g.fillStyle = '#1d1d1d'; g.font = '36px Georgia, serif'; g.fillText('Scribe', 88, 74); g.fillStyle = '#6a6a6a'; g.font = '500 24px Inter, Arial'; g.textAlign = 'right'; g.fillText('Stats pset 6', PHW - 28, 72); g.textAlign = 'left';
    // the prompt bubble (right) with a little photo of the worksheet
    g.fillStyle = '#e8e2d6'; rr(g, 230, 132, 466, 92, 26); g.fill(); g.fillStyle = '#fff'; g.fillRect(250, 146, 48, 62); g.fillStyle = '#c8c4bc'; for (let i = 0; i < 6; i++) g.fillRect(256, 154 + i * 9, 36, 3);
    g.fillStyle = '#1d1d1d'; g.font = '500 25px Inter, Arial'; g.fillText('do 1 & 2, show work', 316, 186);
    // the round's row: page count, pen icon (current ink) + paper icon, Shuffle · Replay · Export PDF
    const ry = 252; g.fillStyle = '#6a6a6a'; g.font = '500 22px Inter, Arial'; g.fillText('2 pages', 24, ry + 34);
    const penOn = mode === 'picker' && k < 1;
    g.fillStyle = penOn ? '#2a2a2a' : '#e8e2d6'; rr(g, 120, ry + 6, 50, 44, 12); g.fill(); g.save(); g.translate(145, ry + 28); g.rotate(-0.8); g.fillStyle = penOn ? '#fff' : '#3a3a40'; g.fillRect(-4, -16, 8, 26); g.fillStyle = purple ? PURP : BLUE; g.beginPath(); g.moveTo(-4, 10); g.lineTo(4, 10); g.lineTo(0, 20); g.fill(); g.restore();
    g.fillStyle = '#e8e2d6'; rr(g, 180, ry + 6, 50, 44, 12); g.fill(); g.fillStyle = '#fffdf6'; g.fillRect(193, ry + 14, 24, 28); g.fillStyle = '#9ab0d0'; for (let i = 0; i < 4; i++) g.fillRect(195, ry + 20 + i * 5, 20, 1);
    g.font = '600 23px Inter, Arial'; g.fillStyle = '#1d1d1d'; g.fillText('Shuffle', 300, ry + 36); g.fillText('Replay', 410, ry + 36); g.fillStyle = RED; g.fillText('Export PDF', 520, ry + 36);
    // the sheet + the on-screen pen at the tip while it writes
    g.fillStyle = '#fff'; g.fillRect(SX0 - 4, SY0 - 4, SWp + 8, SHp + 8); g.drawImage(sheet.canvas, SX0, SY0, SWp, SHp); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(SX0, SY0, SWp, SHp);
    if ((mode === 'write' || mode === 'rewrite') && p < sheet.total - 0.5) { const cx = SX0 + tip[0] * SWp / sheet.w, cy = SY0 + tip[1] * SHp / sheet.h; g.drawImage(purple ? nibP : nibB, cx - 6, cy - 58, 64, 64); }
    // the composer
    g.fillStyle = '#fff'; rr(g, 24, PHH - 104, PHW - 48, 76, 38); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#9a9a9a'; g.font = '500 26px Inter, Arial'; g.fillText('Ask Scribe', 60, PHH - 56);
    g.fillStyle = RED; g.beginPath(); g.arc(PHW - 72, PHH - 66, 26, 0, 2 * PI); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(PHW - 72, PHH - 54); g.lineTo(PHW - 72, PHH - 78); g.moveTo(PHW - 82, PHH - 68); g.lineTo(PHW - 72, PHH - 78); g.lineTo(PHW - 62, PHH - 68); g.stroke();
    // the Writing style popover (pen tray + ink swatches), growing from the pen icon
    if (mode === 'picker' && k < 1) {
      const o = ease(clamp(k / 0.12)), px = 24, py = 318, pw = PHW - 48, ph = 640 * o;
      g.save(); g.globalAlpha = o; g.fillStyle = 'rgba(0,0,0,.18)'; rr(g, px + 4, py + 8, pw, ph, 28); g.fill(); g.fillStyle = '#fffdf8'; rr(g, px, py, pw, ph, 28); g.fill(); g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.rect(px, py, pw, ph); g.clip();
      const fountain = k >= 0.42, purpleIn = k >= 0.62;
      g.fillStyle = '#1d1d1d'; g.font = '600 30px Inter, Arial'; g.fillText('Writing style', px + 30, py + 54);
      g.fillStyle = '#fffdf6'; rr(g, px + 30, py + 76, pw - 60, 110, 16); g.fill(); g.strokeStyle = 'rgba(120,150,200,.35)'; g.beginPath(); g.moveTo(px + 44, py + 160); g.lineTo(px + pw - 44, py + 160); g.stroke();
      g.drawImage(purpleIn ? prevP : prevB, px + 44, py + 92, 520, 78);
      g.fillStyle = '#1d1d1d'; g.font = '600 24px Inter, Arial'; g.fillText(`Pen · ${fountain ? 'Fountain pen' : 'Ballpoint'}`, px + 30, py + 232);
      g.fillStyle = '#e8e2d6'; rr(g, px + 30, py + 410, pw - 60, 34, 12); g.fill();
      PENS.forEach((nm, i) => { const sel = fountain ? i === 2 : i === 0; drawPen(g, nm, px + 90 + i * 120, py + 420, purpleIn ? PURP : BLUE, sel ? 34 : 0); });
      g.fillStyle = '#1d1d1d'; g.font = '600 24px Inter, Arial'; g.fillText('Ink', px + 30, py + 500);
      INKS.forEach(([c], i) => { const cx = px + 62 + i * 76, cy = py + 556, sel = purpleIn ? i === 5 : i === 0; g.fillStyle = c; g.beginPath(); g.arc(cx, cy, 24, 0, 2 * PI); g.fill(); if (sel) { g.strokeStyle = '#1d1d1d'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 32, 0, 2 * PI); g.stroke(); } });
      { const cx = px + 62 + 7 * 76, cy = py + 556; for (let a = 0; a < 12; a++) { g.fillStyle = `hsl(${a * 30},70%,55%)`; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 24, a * PI / 6, (a + 1) * PI / 6); g.fill(); } }
      g.restore();
      // the tap: a soft finger dot that moves to Fountain pen, then to Purple
      const P0 = [PHW * 0.5, 1150], P1 = [px + 90 + 2 * 120, py + 330], P2 = [px + 62 + 5 * 76, py + 556];
      const m1 = ease(u01(k, 0.15, 0.36)), m2 = ease(u01(k, 0.48, 0.6)), fx = P0[0] + (P1[0] - P0[0]) * m1 + (P2[0] - P1[0]) * m2, fy = P0[1] + (P1[1] - P0[1]) * m1 + (P2[1] - P1[1]) * m2;
      const press = (k > 0.36 && k < 0.44) || (k > 0.6 && k < 0.68);
      if (k > 0.12 && k < 0.9) { g.fillStyle = press ? 'rgba(60,60,70,.45)' : 'rgba(60,60,70,.3)'; g.beginPath(); g.arc(fx, fy, press ? 30 : 36, 0, 2 * PI); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.stroke(); }
    }
    if (mode === 'rewrite' && p < sheet.total - 0.5) { g.fillStyle = 'rgba(91,42,134,.92)'; rr(g, PHW / 2 - 200, SY0 + SHp + 40, 400, 56, 28); g.fill(); g.fillStyle = '#fff'; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('Rewriting in Fountain · Purple', PHW / 2, SY0 + SHp + 77); g.textAlign = 'left'; }
    phT.needsUpdate = true;
  }
  // writing progress: Q1's text, then the chart (on "chart and all"), then Q2; the purple rewrite after the picker closes
  const writeP = (t) => {
    if (t < T.scribe + 0.1) return 0;
    if (t < T.chart - 0.15) return cut.a * ease(u01(t, T.scribe + 0.1, T.chart - 0.15));
    if (t < T.dont - 0.1) return cut.a + (cut.b - cut.a) * u01(t, T.chart - 0.15, T.dont - 0.1);
    return cut.b + (totalA - cut.b) * u01(t, T.dont - 0.1, T.dont + 0.3);
  };
  const rewriteP = (t) => sheetB.total * ease(u01(t, T.close + 0.05, T.page - 0.15));

  // ---------------------------------------------------------------- Vex (067's look)
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const key = new THREE.DirectionalLight(0xfff2ea, 0.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 }); scene.add(key, key.target);
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });

  // ---------------------------------------------------------------- the mocap actors: A punches, B takes it, C drives the buck, D falls on the mat
  const [A, Bk, C, Dm] = M.actors;
  const guardA = { sx: -0.62, sz: 0.28, el: -2.15, twist: 0.55, free: 0 }, guardB = { sx: -0.62, sz: 0.28, el: -2.15, twist: -0.55, free: 0 };
  const mixP = (a, b, k) => ({ sx: a.sx + (b.sx - a.sx) * k, sz: a.sz + (b.sz - a.sz) * k, el: a.el + (b.el - a.el) * k, twist: (a.twist ?? 0) + ((b.twist ?? 0) - (a.twist ?? 0)) * k, free: 0 });
  const punchK = (t) => { const ph = ((t + 10) % 1.4) / 1.4; return ph < 0.4 ? 0 : ph < 0.5 ? ease((ph - 0.4) / 0.1) : ph < 0.62 ? 1 : ph < 0.8 ? 1 - ease((ph - 0.62) / 0.18) : 0; };
  const hitK = (t) => punchK(t - 0.08);
  const DM = M.D.mat;
  function poseActors(t) {
    const kP = punchK(t), kH = hitK(t), bob = 0.02 * Math.sin(t * 7);
    const pa = basePose(); Object.assign(pa, { x: -0.95 + 0.1 * kP, z: -0.6, rotY: PI / 2, lean: 0.1 + 0.18 * kP, crouch: 0.06 + bob, footFwd: 0.12, headPitch: 0.08, armA: guardA, armB: mixP(guardB, { sx: -1.52, sz: 0.1, el: -0.08, twist: 0 }, kP), smile: 0, mouth: 'flat' });
    applyPose(A, pa);
    const pb = basePose(); Object.assign(pb, { x: 0.2 + 0.1 * kH, z: -0.6, rotY: -PI / 2, lean: 0.06 - 0.32 * kH, crouch: 0.06 - bob, footFwd: 0.1, headPitch: -0.4 * kH, headYaw: 0.25 * kH, armA: mixP(guardA, { sx: -0.2, sz: 0.6, el: -1.2, twist: 0.3 }, kH), armB: mixP(guardB, { sx: -0.2, sz: 0.6, el: -1.2, twist: -0.3 }, kH), mouth: kH > 0.5 ? 'o' : 'flat' });
    applyPose(Bk, pb);
    // C in the buck's driver seat: buck at (2.6, −2.6) turned −0.5; the seat local (−0.42, 0.45, 0.1)
    const bq = M.D.buck, cs = Math.cos(-0.5), sn = Math.sin(-0.5), lx = -0.42, lz = 0.12;
    const pc = basePose(); Object.assign(pc, { x: bq.x + lx * cs + lz * sn, z: bq.z - lx * sn + lz * cs, rotY: -0.5, y: -0.345, footFwd: 0.42, headYaw: 0.15 * Math.sin(t * 0.9), armA: { sx: -1.0, sz: 0.2, el: -0.55, twist: 0.35, free: 0 }, armB: { sx: -1.0, sz: 0.2, el: -0.55, twist: -0.35, free: 0 } });
    applyPose(C, pc); bq.wheel.rotation.z = 0.5 * Math.sin(t * 1.3);
    // D: braces, then falls backward onto the crash mat (pivot at the feet), stays down
    const kF = clamp((t - T.fall) / 0.55) ** 2, pd = basePose();
    Object.assign(pd, { x: DM.x, z: DM.z + 0.95, rotY: 0, lean: -0.1 - 0.2 * kF, armA: mixP({ sx: -0.9, sz: 0.5, el: -0.6 }, { sx: -2.6, sz: 0.4, el: -0.3 }, kF), armB: mixP({ sx: -0.9, sz: 0.5, el: -0.6 }, { sx: -2.6, sz: 0.4, el: -0.3 }, kF), mouth: kF > 0 ? 'o' : 'flat', crouch: 0.05 * (1 - kF) });
    applyPose(Dm, pd); Dm.root.rotation.x = -1.42 * kF; Dm.root.position.y = DM.top * kF + 0.05 * kF;
  }
  // the solve on the wall screen + the monitors: A and B's joints projected side-on (world x, y)
  const jw = (o) => o.getWorldPosition(V()), J2 = (r, map) => { r.root.updateMatrixWorld(true); const j = (o) => map(jw(o));
    return { head: j(r.headG), neck: map(r.spine.localToWorld(V(0, 0.52, 0))), sh0: j(r.arms[0].shoulder), sh1: j(r.arms[1].shoulder), el0: j(r.arms[0].elbow), el1: j(r.arms[1].elbow), ha0: j(r.arms[0].hand), ha1: j(r.arms[1].hand), hip: j(r.pelvis), kn0: j(r.legs[0].knee), kn1: j(r.legs[1].knee), an0: j(r.legs[0].ankle), an1: j(r.legs[1].ankle) }; };
  function drawChar(g, J, shirt, pants, skin, hair) {   // the "in game" body: thick strokes over the same joints
    const ln = (a, b, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(...J[a]); g.lineTo(...J[b]); g.stroke(); };
    ln('hip', 'kn0', 13, pants); ln('kn0', 'an0', 11, pants); ln('hip', 'kn1', 13, pants); ln('kn1', 'an1', 11, pants);
    ln('hip', 'neck', 24, shirt); ln('sh0', 'el0', 10, shirt); ln('el0', 'ha0', 9, skin); ln('sh1', 'el1', 10, shirt); ln('el1', 'ha1', 9, skin);
    g.fillStyle = skin; g.beginPath(); g.arc(J.head[0], J.head[1] - 4, 13, 0, 2 * PI); g.fill(); g.fillStyle = hair; g.beginPath(); g.arc(J.head[0], J.head[1] - 9, 13, PI, 2 * PI); g.fill();
  }
  let solveKey = -1;
  function drawSolves(t) {
    const kk = Math.round(t * 15); if (kk === solveKey) return; solveKey = kk;
    const g = M.wall.canvas.getContext('2d'), w = 640, h = 360;
    g.fillStyle = '#07090e'; g.fillRect(0, 0, w, h);
    // left panel: the solve (cyan skeletons over a grid); right panel: the same moves on two game characters at a sunset street
    g.strokeStyle = 'rgba(92,240,255,.15)'; g.lineWidth = 1; for (let x = 0; x < 310; x += 20) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, h); g.stroke(); } for (let y = 40; y < h; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(310, y); g.stroke(); }
    const gr = g.createLinearGradient(0, 40, 0, h); gr.addColorStop(0, '#4a2a78'); gr.addColorStop(0.55, '#ff8a5a'); gr.addColorStop(0.62, '#3a2a5a'); gr.addColorStop(1, '#2a2440'); g.fillStyle = gr; g.fillRect(330, 40, 310, h - 40);
    g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(560, 210, 34, PI, 2 * PI); g.fill(); g.fillStyle = '#3a3442'; g.fillRect(330, 290, 310, 70); g.fillStyle = '#ffd43b'; for (let x = 340; x < 640; x += 40) g.fillRect(x, 322, 20, 4);
    for (let i = 0; i < 3; i++) { g.fillStyle = ['#7ad8d0', '#ffb0c8', '#fff0a8'][i]; g.fillRect(340 + i * 100, 230 - i * 14, 90, 60 + i * 14); g.fillStyle = '#ff4fa3'; g.fillRect(340 + i * 100, 228 - i * 14, 90, 3); }
    const mapL = (p) => [40 + (p.x + 1.7) * 105, 300 - p.y * 105], mapR = (p) => [350 + (p.x + 1.7) * 105, 330 - p.y * 105];
    const a = J2(A, mapL), b = J2(Bk, mapL), ar = J2(A, mapR), br = J2(Bk, mapR);
    M.drawSolve(g, w, h, a, { color: '#5cf0ff', r: 4, lw: 3 }); M.drawSolve(g, w, h, b, { color: '#ffd43b', r: 4, lw: 3 });
    drawChar(g, ar, '#ff4fa3', '#2a3a6a', '#e8b894', '#2a1a10'); drawChar(g, br, '#2ec4b6', '#3a2a2a', '#a86a48', '#111');
    g.fillStyle = '#0d0f14'; g.fillRect(0, 0, w, 40); g.font = '700 20px Inter, Arial'; g.fillStyle = '#5cf0ff'; g.fillText('LIVE SOLVE', 14, 27); g.fillStyle = '#ff6ab0'; g.fillText('IN GAME', 344, 27);
    g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(612, 20, 7, 0, 2 * PI); g.fill(); g.fillStyle = '#e8e8e2'; g.font = '600 16px Inter, Arial'; g.fillText(`TAKE 14  ${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`, 440, 27);
    M.wall.needsUpdate = true;
    M.monitors.forEach((tx, i) => { const m = tx.canvas.getContext('2d'); m.fillStyle = '#07090e'; m.fillRect(0, 0, 320, 200);
      if (i === 2) { m.fillStyle = '#5cf0ff'; m.font = '700 18px Inter, Arial'; m.fillText('TAKE 14 · REC', 14, 30); m.strokeStyle = '#7cf05f'; m.lineWidth = 2; m.beginPath(); for (let x = 0; x < 300; x += 4) m.lineTo(10 + x, 120 + 30 * Math.sin(x * 0.11 + t * 6) * Math.sin(x * 0.023 + t)); m.stroke(); }
      else { const mp = (p) => [20 + (p.x + 1.7) * 62, 180 - p.y * 62], aa = J2(A, mp), bb = J2(Bk, mp); M.drawSolve(m, 320, 200, aa, { color: i ? '#ff6ab0' : '#5cf0ff', r: 3, lw: 2 }); M.drawSolve(m, 320, 200, bb, { color: '#ffd43b', r: 3, lw: 2 }); }
      tx.needsUpdate = true; });
  }

  // ---------------------------------------------------------------- the neon strip's walkers ("the randoms on the street")
  const WSPEC = [[6.95, -1, 10.0], [-2.7, 1, -6], [6.75, -1, 12.6], [-3.25, -1, 4], [6.9, 1, 11.4], [-2.9, 1, -14], [6.8, -1, 15.6], [-3.1, -1, 22]];   // [z, dir, x at T.just]
  const WALK = N.walkers.map((r, i) => { const [z, dir, xj] = WSPEC[i], v = 1.05 + hash(i * 3) * 0.35; return { r, z, dir, v, x0: xj - dir * v * T.just }; });
  const walkerAt = (w, t) => w.x0 + w.dir * w.v * t;
  function poseWalkers(t, camP) {
    for (const w of WALK) { const x = walkerAt(w, t), p = basePose(); Object.assign(p, { x, z: w.z, rotY: w.dir > 0 ? PI / 2 : -PI / 2, dist: w.v * t, speed: w.v, floor: N.SW, smile: 1 });
      applyPose(w.r, p); const wx = SX + x; w.r.root.visible = !camP || Math.hypot(wx - camP.x, w.z - camP.z) > 2.2; }
  }

  // ---------------------------------------------------------------- overlay: title, callouts, the PIXEL DIAGRAM cards (270 × 480, shown ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHY GTA 6 TOOK', '13 YEARS'], t0: 0, t1: T.team - 0.05, y: 0.13, plain: true, s: 9, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const ptxt = (s, color, x, y, sc = 1) => { const cv = pixelText(s, { color }); dctx.drawImage(cv, Math.round(x - cv.width * sc / 2), Math.round(y - cv.height * sc / 2), cv.width * sc, cv.height * sc); };
  const panel = (y0, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(18, y0, 234, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(16, y0 - 2, 238, 2); dctx.fillRect(16, y1, 238, 2); dctx.fillRect(16, y0, 2, y1 - y0); dctx.fillRect(252, y0, 2, y1 - y0); };
  const person = (x, y, lit, c = '#ffd43b') => { dctx.fillStyle = lit ? c : '#3a3550'; dctx.fillRect(x + 1, y, 2, 2); dctx.fillRect(x, y + 2, 4, 3); dctx.fillRect(x, y + 5, 1, 2); dctx.fillRect(x + 3, y + 5, 1, 2); };
  const bills = (x, y, n, c) => { for (let i = 0; i < n; i++) { dctx.fillStyle = i % 2 ? '#3a9a4a' : '#5cc86a'; dctx.fillRect(x, y - i * 3, 34, 3); dctx.fillStyle = c; dctx.fillRect(x + 15, y - i * 3 + 1, 4, 1); } };
  let dgKey = '';
  const scr = V();
  function diagram(t) {
    let id = null, k = 0;
    if (t >= T.thirteen - 0.05 && t < T.heres - 0.1) { id = 'years'; k = u01(t, T.thirteen, T.thirteen + 1.8); }
    else if (t >= T.nearly - 0.1 && t < T.mocap) { id = 'staff'; k = u01(t, T.nearly, T.nearly + 2.2); }
    else if (t >= T.just - 0.05 && t < T.pivot) { id = 'npc'; k = u01(t, T.just, T.just + 0.4); }
    else if (t >= T.money + 0.2 && t < T.end) { id = 'money'; k = u01(t, T.over - 0.2, T.over + 0.8); }
    else if (t >= T.billion - 0.1 && t < T.see + 0.2) { id = 'days'; k = u01(t, T.billion, T.billion + 1.4); }
    const key = id ? `${id}${Math.round(k * 40)}${id === 'npc' ? Math.round(t * 30) : ''}${id === 'money' ? (t > T.gta5 ? 'b' : 'a') : ''}` : 'none'; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480); if (!id) return;
    if (id === 'npc') {   // NPC tags over the walkers' heads (projected each frame)
      studio.camera.updateMatrixWorld();   // setCamera ran this frame: refresh matrixWorldInverse before projecting
      for (const w of WALK) { if (!w.r.root.visible) continue; w.r.headG.getWorldPosition(scr); scr.y += 0.42; const d = scr.distanceTo(studio.camera.position); scr.project(studio.camera); if (scr.z > 1 || Math.abs(scr.x) > 0.95 || scr.y > 0.9 || scr.y < -0.6 || d > 14) continue;
        const x = (scr.x + 1) / 2 * 270, y = (1 - scr.y) / 2 * 480, s = d < 5 ? 2 : 1, pop = clamp(k * 1.2); if (pop <= 0) continue;
        const cv = pixelText('NPC', { color: '#5cf0ff' }); dctx.fillStyle = 'rgba(10,8,16,.8)'; dctx.fillRect(Math.round(x - cv.width * s / 2 - 3), Math.round(y - cv.height * s / 2 - 3), cv.width * s + 6, cv.height * s + 6); dctx.drawImage(cv, Math.round(x - cv.width * s / 2), Math.round(y - cv.height * s / 2), cv.width * s, cv.height * s); }
      return;
    }
    dctx.save(); dctx.translate(0, 84);   // the cards sit low (y ≈ 0.40–0.675, above the caption word at 0.72): her face stays clear above them
    if (id === 'years') { panel(104, 240); ptxt('2013', '#ffffff', 52, 124); ptxt('2026', '#ffd43b', 218, 124);
      dctx.fillStyle = '#2a2640'; dctx.fillRect(34, 140, 202, 16); dctx.fillStyle = '#ff6ab0'; dctx.fillRect(36, 142, Math.round(198 * ease(k)), 12);
      for (let i = 0; i <= 13; i++) { dctx.fillStyle = i <= Math.round(13 * ease(k)) ? '#ffd43b' : '#4a4560'; dctx.fillRect(36 + Math.round(i * 198 / 13), 160, 1, 4); }
      ptxt(`${Math.round(13 * ease(k))} YEARS`, '#ffffff', 135, 192, 2); ptxt('GTA 5 TO GTA 6', '#b8a8d8', 135, 226); }
    if (id === 'staff') { panel(94, 240); ptxt('2018', '#b8a8d8', 135, 104); for (let i = 0; i < 24; i++) person(30 + i * 9, 113, true, '#b8a8d8'); ptxt('2,441', '#ffffff', 135, 130);
      ptxt('2026', '#ffd43b', 135, 147); const n = Math.round(47 * ease(k)); for (let i = 0; i < 47; i++) person(30 + (i % 24) * 9, 156 + Math.floor(i / 24) * 11, i < n);
      ptxt(`${Math.round(2441 + (4711 - 2441) * ease(k)).toLocaleString('en-US')}`, '#ffffff', 135, 198, 2); ptxt('1 ICON = 100 PEOPLE', '#8a80a8', 135, 228); }
    if (id === 'money') { panel(94, 240); ptxt('BUDGET', '#ffd43b', 135, 106);
      const a = Math.round(8 * ease(clamp(k * 2))), b = t > T.over - 0.2 ? Math.round(28 * ease(k)) : 0;
      bills(54, 212, a, '#2a6a3a'); bills(170, 212, b, '#2a6a3a'); ptxt('GTA 5', '#ffffff', 71, 228); ptxt('GTA 6', '#ffffff', 187, 228);
      if (t > T.gta5) ptxt('$265M', '#7cf05f', 71, 204 - a * 3);
      if (b > 0) { ptxt('$1B+', '#7cf05f', 187, 204 - b * 3); ptxt('EST.', '#ff9a8a', 228, 214 - Math.round(b * 1.5)); } }
    if (id === 'days') { panel(104, 240); ptxt('GTA 5 · SEPT 2013', '#b8a8d8', 135, 118);
      for (let i = 0; i < 3; i++) { const on = k > i / 3; dctx.fillStyle = on ? '#f2e6ff' : '#3a3550'; dctx.fillRect(48 + i * 62, 132, 50, 44); dctx.fillStyle = on ? '#ff3b3b' : '#2a2640'; dctx.fillRect(48 + i * 62, 132, 50, 10); ptxt(`DAY ${i + 1}`, on ? '#1a1424' : '#6a6080', 73 + i * 62, 162); }
      ptxt(`$${Math.round(1e9 * ease(k)).toLocaleString('en-US')}`, '#7cf05f', 135, 210, 2); }
    dctx.restore();
  }

  // ---------------------------------------------------------------- shots
  // mocap stage (origin): the volume ±4.5 m, the big screen at the back-left, video village at x 6.6 (the desk faces −x)
  // neon strip (x + 1000): road along x, hotels at +z, the beach + the sun at −z
  const S = (x, y, z) => [SX + x, y, z];
  const ent = (t) => ({ x: 0.35, z: 2.7 + 1.5 * ease(u01(t, T.heres - 0.1, T.heres + 2.2)) });
  const strollX = (t) => -3.6 + 2.4 * ease(u01(t, 0.15, T.thirteen + 0.2));
  const VD = { x: 4.7, z: 3.7 };      // Vex by the video village, the volume behind her (pivot)
  const VM = { x: 3.0, z: 5.05 };     // Vex on the sidewalk edge, the pink coupe behind her (money)
  const SH = [
    { id: 'stroll', t0: 0, set: 'strip', vex: (t) => ({ x: SX + strollX(t), z: 5.75, y: N.SW, rotY: PI / 2, pose: 'rest', walk: t < T.thirteen + 0.2 ? { dist: 2.4 * ease(u01(t, 0.15, T.thirteen + 0.2)), speed: 0.55 } : null, tilt: 0.08, sway: 0.15, face: CONF(t) }),
      cam: (t) => { const x = strollX(t); return { pos: S(x + 2.8, 1.45, 5.05), look: S(x - 1.4, 1.25, 5.6), fov: 46 }; } },
    { id: 'sunset', t0: T.thirteen - 0.05, set: 'strip', cam: (t) => { const k = ease(u01(t, T.thirteen, T.heres)); return { pos: S(-2 - 1.5 * k, 1.6 + 2.0 * k, 0.8), look: S(-8, 3.0 + 1.2 * k, -40), fov: 50 }; } },
    { id: 'enter', t0: T.heres - 0.1, set: 'mocap', vex: (t) => ({ ...ent(t), rotY: 0, pose: t > T.team + 0.25 ? 'hip' : 'rest', walk: t < T.heres + 2.2 ? { dist: 1.5 * ease(u01(t, T.heres - 0.1, T.heres + 2.2)), speed: 0.5 } : null, tilt: 0.08, sway: 0.15, face: CONF(t) }),
      cam: (t) => { const v = ent(t); return { pos: [0.55, 1.45, v.z + 2.25], look: [0.25, 1.28, v.z - 1.2], fov: 48 }; } },
    { id: 'team', t0: T.nearly - 0.1, set: 'mocap', vex: (t) => ({ x: 0.35, z: 4.2, rotY: -0.15, pose: 'hip', tilt: -0.08, sway: 0.15, face: CONF(t) }),
      cam: (t) => { const k = u01(t, T.nearly, T.mocap); return { pos: [1.4 - 0.4 * k, 1.75 + 0.15 * k, 7.6 + 0.3 * k], look: [-0.4, 0.2, 0.6], fov: 48 }; } },
    { id: 'spar', t0: T.mocap, set: 'mocap', cam: (t) => { const a = 0.35 - 0.5 * u01(t, T.mocap, T.suits); return { pos: [-0.38 + 3.7 * Math.sin(a), 1.4, -0.6 + 3.7 * Math.cos(a)], look: [-0.38, 1.1, -0.6], fov: 48 }; } },
    { id: 'dots', t0: T.suits - 0.12, set: 'mocap', cam: (t) => { const k = u01(t, T.suits, T.theres); return { pos: [1.17 + 0.2 * k, 1.25, 0.4 - 0.4 * k], look: [2.18, 0.98, -2.71], fov: 42 }; } },
    { id: 'screen', t0: T.theres - 0.1, set: 'mocap', cam: (t) => { const k = ease(u01(t, T.theres, T.just)); return { pos: [-2.2 - 0.6 * (1 - k), 1.9, -3.6], look: [-4.6 + 2.0 * k, 2.75, -7.6], fov: 44 }; } },
    { id: 'npc', t0: T.just - 0.1, set: 'strip', cam: (t) => { const k = u01(t, T.just, T.pivot); return { pos: S(5.5 - 0.6 * k, 1.5, 4.3), look: S(14 - 1.0 * k, 1.35, 6.7), fov: 44 }; } },
    { id: 'pivotA', t0: T.pivot, set: 'mocap', vex: (t) => ({ ...VD, rotY: 1.2, pose: t < T.your - 0.1 ? 'hip' : 'point', tilt: 0.1, sway: 0.12, turn: 0.1, face: CONF(t) }),
      cam: (t) => ({ pos: [6.9 - 0.25 * u01(t, T.pivot, T.your), 1.5, 4.5], look: [VD.x, 1.3, VD.z], fov: 46 }) },
    { id: 'pivotB', t0: T.handwritten - 0.12, set: 'mocap', vex: (t) => ({ ...VD, rotY: 1.2, pose: t > T.rude - 0.2 ? 'point' : 'hip', tilt: 0.12, turn: t > T.rude - 0.2 ? -0.1 : 0, sway: 0.1, face: CONF(t, { angry: t > T.rude - 0.2 ? 0.3 : 0.18, blinkLeft: t > T.rude + 0.35 ? 1 : 0 }) }),
      cam: (t) => ({ pos: [6.0 - 0.15 * u01(t, T.handwritten, T.scribe), 1.6, 4.2], look: [VD.x, 1.5, VD.z], fov: 42 }) },
    { id: 'write', t0: T.scribe, set: 'mocap', phone: 'write' },
    { id: 'chart', t0: T.chart - 0.15, set: 'mocap', phone: 'chart' },
    { id: 'picker', t0: T.dont - 0.1, set: 'mocap', phone: 'picker' },
    { id: 'rewrite', t0: T.close, set: 'mocap', phone: 'rewrite' },
    { id: 'money', t0: T.money, set: 'strip', vex: (t) => ({ x: SX + VM.x, z: VM.z, y: N.SW, rotY: 1.21, pose: 'hip', tilt: 0.12, sway: 0.15, face: CONF(t) }),
      cam: (t) => { const k = u01(t, T.money, T.gta5); return { pos: S(6.6 - 0.3 * k, 1.4, 6.4), look: S(2.9, 0.95, 4.9), fov: 48 }; } },
    { id: 'money2', t0: T.gta5 - 0.1, set: 'strip', vex: (t) => ({ x: SX + VM.x, z: VM.z, y: N.SW, rotY: -1.24, pose: 'point', tilt: -0.1, sway: 0.15, face: CONF(t) }),
      cam: (t) => { const k = u01(t, T.gta5, T.end); return { pos: S(0.2 - 0.3 * k, 0.75, 6.0), look: S(3.0, 1.1, 5.05), fov: 50 }; } },
    { id: 'end', t0: T.end, set: 'strip', vex: (t) => ({ x: SX + 0.0, z: -3.05, y: N.SW, rotY: 0.1, pose: t > T.see - 0.1 ? 'kissOut' : 'hip', tilt: -0.1, sway: 0.15, face: CONF(t, { blinkLeft: t > T.nineteenth + 0.15 ? 1 : 0 }) }),
      cam: (t) => { const k = u01(t, T.end, T.card); return { pos: S(0.35, 1.42, 0.45 - 0.35 * k), look: S(-0.05, 1.42, -3.05), fov: 46 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).filter((s2, i) => !(SH[i].phone && s2.phone)).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const phoneCam = (u, v, d, fov = 40) => { M.phScr.updateWorldMatrix(true, false); M.phScr.localToWorld(scrP.set((u - 0.5) * M.PW, (0.5 - v) * M.PH, 0)); M.phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov }; };

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    const strip = sh.set === 'strip';
    M.root.visible = !strip; N.root.visible = strip;
    scene.fog = strip ? stripFog : null; scene.background.set(strip ? 0x2a1a40 : 0x0c0d12);
    // the phone: writes the stats page, the pen picker, the purple rewrite
    if (t < T.dont - 0.1) drawPhone('write', writeP(t));
    else if (t < T.close) drawPhone('picker', totalA, u01(t, T.dont - 0.1, T.close));
    else drawPhone('rewrite', rewriteP(t));
    let cam;
    if (sh.phone === 'write') cam = phoneCam(0.5, 0.5, 0.212 - 0.01 * k);
    else if (sh.phone === 'chart') { const gu = (SX0 + chartC[0] * SWp / sheetA.w) / PHW, gv = (SY0 + chartC[1] * SHp / sheetA.h) / PHH; cam = phoneCam(gu, gv, 0.13 - 0.015 * k); }
    else if (sh.phone === 'picker') cam = phoneCam(0.5, 0.42, 0.2 - 0.015 * k);
    else if (sh.phone === 'rewrite') cam = phoneCam(0.5, 0.5, 0.205 + 0.01 * k);
    else cam = sh.cam(t);
    studio.camera.far = strip ? 760 : 60; studio.camera.near = sh.phone ? 0.02 : 0.08; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -3).addScaledVector(side, -1.5).add(V(0, 3, 0)); key.intensity = strip ? 0.45 : 0.85; key.color.set(strip ? 0xffc8a8 : 0xf2f4ff);
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, (strip ? 0.32 : 0.24) * Math.pow(d, 1.6)) : 0; }
    if (strip) N.aimSun(cam.look[0] - SX, cam.look[2]);
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: v.y ?? 0, rotY: v.rotY ?? 0 }); }
    poseActors(t); M.update(t); N.update(t);
    poseWalkers(t, strip ? studio.camera.position : null);
    if (!strip && !sh.phone) drawSolves(t);
    diagram(t);
    pixel.set(Math.max(sh.phone ? 1 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
