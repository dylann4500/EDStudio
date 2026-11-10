// 079 — "A spaceship from 1977 is about to be one light-day away" (Scribe lane, Vex explainer, anime/pixel look). News of the week
// (Nov 9 2026): on Wed Nov 18 2026 Voyager 1 becomes the first human-made object one light-day from Earth (16.1 billion miles,
// 25.9 billion km; a signal takes 24 h each way). Vex explains it from a desert deep-space dish station at dusk.
//   place   = NEW: engine/sets/dishstation.js — a gravel visitor overlook (her camp table + tablet, chair, cooler, telescope, her car,
//             a VISITOR OVERLOOK sign) in front of a chain-link fence, a 70 m dish aimed into the sunset sky, two 34 m dishes, a control
//             building (DEEP SPACE STATION), a lot of cars, poles, Joshua trees, creosote, rocks, mountains, a dusk dome + stars;
//             + NEW engine/sets/deepspace.js — our own toy 1977 probe (white dish, foil bus, power boom, science boom, 13 m mast, the
//             golden record) in a star shell with the Sun as a bright star and Earth a pale blue dot; radio wavefronts heading home.
//   facts   = (sources in caption.md's comment) Nov 18 2026, one light-day = 16.1 billion miles; 24 h each way; launched 1977 (49 years);
//             70 m dishes; the transmitter ≈ a fridge light bulb (≈ 22 W); what reaches Earth < a billionth of a billionth of a watt;
//             a golden record with spoken greetings in 55 languages; the power units lose ~4 W a year.
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480, shown ×4 pixelated, low in the frame so her face stays clear).
//   Scribe  = the app ON A TABLET on her camp table (a stand, screen to the lens): the homework photo + "show your work" → the desk:
//             TWO PAGES written stroke by stroke (README §The writing desk: "2 pages · Shuffle · Replay · Export PDF" row; page 1 =
//             the light-time problem with an Earth → probe figure, page 2 = the inverse-square law with a drawn spreading-beam
//             figure) → DARK MODE from the account menu (README §Dark mode: the desk goes dark, "the handwritten pages … are paper and
//             are never themed"). Physics (PHYS 1 · Problem Set 7).
//   persona = confident, teasing goth tutor (lighter 071/077 tone): one "Cute.", "Dark mode, obviously.", "I'm listening."
//             Fish "Dolly", less-breathy settings. Nothing handheld (the tablet stands on a stand).
// Guardrails: swimwear only, no kink lines, no promises, no claims about real people; no agency logos (the station + probe are our own
// generic toy versions; no agency is named on screen or in the narration).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { buildDishStation, D } from '@engine/sets/dishstation.js';
import { buildDeepSpace } from '@engine/sets/deepspace.js';

const PI = Math.PI, PIXEL = 4, DEG = PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const eOut = (u) => 1 - (1 - u) ** 3;
const lerp = (a, b, k) => a + (b - a) * k;
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mixHex = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();

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
    spaceship: W('hook', 'spaceship'), s77: W('hook', 'seventyseven'), gets: W('hook', 'gets'), saying: W('hook', 'saying'),
    lightday: B.lightday.t0, voyager: W('lightday', 'voyager'), on: W('lightday', 'on'), sixteen: W('lightday', 'sixteen'), even: W('lightday', 'even'), twentyfour: W('lightday', 'twentyfour'),
    dish: B.dish.t0, dishes: W('dish', 'dishes'), seventy: W('dish', 'seventy'),
    radio: B.radio.t0, about: W('radio', 'about'), what: W('radio', 'what'), less: W('radio', 'less'), watt: W('radio', 'watt'),
    pivot: B.pivot.t0, still: W('pivot', 'still'), you: W('pivot', 'you'), worksheet: W('pivot', 'worksheet'), cute: W('pivot', 'cute'),
    scribe: B.scribe.t0, ld2: W('scribe', 'lightday'), hand: W('scribe', 'handwriting'), both: W('scribe', 'both'), dark: W('scribe', 'dark'), obviously: W('scribe', 'obviously'),
    record: B.record.t0, golden: W('record', 'golden'), hello: W('record', 'hello'), anyone: W('record', 'anyone'),
    end: B.end.t0, every: W('end', 'every'), until: W('end', 'until'), im: W('end', 'im'), listening: W('end', 'listening'),
  };
  T.card = T.listening + 0.62;

  // ---------------------------------------------------------------- the places: the dish station (origin) + deep space (parked far away)
  const S = buildDishStation(studio), stationFog = S.fog; scene.fog = stationFog;
  const SP = buildDeepSpace(studio), SPO = V(0, 30000, 0); SP.root.position.copy(SPO); SP.root.visible = false;
  const voy = SP.voy, home = SP.sunDir.clone();
  const out = home.clone().negate();                                   // the probe's direction of travel (away from the Sun)
  const SPW = (v) => v.clone().add(SPO);                               // space-local → world
  // greetings that pop out of the record (pixel text sprites)
  const GREET = ['HELLO', 'HOLA', 'BONJOUR', 'HALLO', 'CIAO', 'NI HAO'].map((s, i) => {
    const cv = pixelText(s, { color: i % 2 ? '#ffd43b' : '#fff4c2' }), tx = new THREE.CanvasTexture(cv); tx.magFilter = tx.minFilter = THREE.NearestFilter; tx.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false, fog: false })); sp.userData.ar = cv.width / cv.height; sp.visible = false; scene.add(sp); return sp;
  });

  // ---------------------------------------------------------------- Scribe: PHYS 1 problem set 7, two pages, on the tablet
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  let fig1 = 0, fig3 = 0;
  const P1 = { q: '1.  Voyager 1 is 2.59 × 10¹³ m from Earth. How long does a radio signal\n     take to reach it? (c = 3.00 × 10⁸ m/s)', h: 2.0, fig: ({ k, y }) => {
    // t = d / c = 2.59e13 / 3.00e8 = 8.63e4 s = 86,300 s = 24.0 h
    const cy = y + 262, E = [...k.ellipse(170, cy, 34, 34), ...k.poly([[150, cy - 14], [168, cy - 20], [176, cy - 6], [160, cy + 4]]), ...k.poly([[178, cy + 10], [192, cy + 4], [196, cy + 18]])];
    const pr = []; for (let i = 0; i <= 10; i++) { const a = (2 / 3) * PI + (i / 10) * (2 / 3) * PI; pr.push([536 + Math.cos(a) * 34, cy + Math.sin(a) * 34]); }
    const P = [...k.poly(pr), ...k.line([510, cy - 26], [510, cy + 26]), ...k.poly([[536, cy - 12], [562, cy - 12], [562, cy + 12], [536, cy + 12]], { close: true }), ...k.line([562, cy], [600, cy - 18])];
    const Lb = [...k.text('Earth', 132, cy + 52, { u: 20 }), ...k.text('V1', 520, cy + 52, { u: 20 })];
    const dl = [...k.dashed([212, cy], [494, cy]), ...k.arrow([352, cy - 66], [210, cy - 66]), ...k.arrow([352, cy - 66], [496, cy - 66]), ...k.text('d = 2.59 × 10^{13} m', 236, cy - 112, { u: 21 })];
    const sig = [...k.arrow([494, cy + 98], [214, cy + 98]), ...k.text('signal at c', 282, cy + 124, { u: 19 })];
    const fig = [...E, ...P, ...Lb, ...dl, ...sig]; fig1 = fig.length;
    const Wl = []; ['t = d / c', '= 2.59 × 10^{13} / 3.00 × 10^8', '= 8.63 × 10^4 s', '= 86,300 s / 3600'].forEach((s, i) => Wl.push(...k.text(s, 640, y + 150 + i * 54, { u: 22 })));
    const a = k.text('t = 24.0 h', 650, y + 150 + 4 * 54 + 14, { u: 27 });
    return [...fig, ...Wl, ...a, ...k.ring(a, { pad: 10 })]; } };
  const P2 = { q: '2.  It moves at 17 km/s. How far does it travel in one day?', h: 1.0, fig: ({ k, y }) => {
    const l = k.text('d = v t = (17 km/s)(86,400 s)', 124, y + 128, { u: 25 }), r = k.text('d = 1.47 × 10^6 km', 124, y + 196, { u: 27 });   // 17 × 86,400 = 1,468,800 km
    return [...l, ...r, ...k.ring(r, { pad: 10 })]; } };
  const P3 = { q: '3.  Its signal spreads over a sphere, so I ∝ 1/r². How much weaker is it\n     at 173 AU than at 1 AU?', h: 1.8, fig: ({ k, y }) => {
    const cy = y + 292, sx = 150, x1 = 330, x2 = 510, sl = 140 / 410, top = (x) => cy - (x - sx) * sl, bot = (x) => cy + (x - sx) * sl;
    const F = [...k.dot(sx, cy, { r: 7 }), ...k.line([sx, cy], [570, top(570)]), ...k.line([sx, cy], [570, bot(570)]), ...k.dashed([sx + 10, cy], [580, cy]),
      ...k.line([x1, top(x1)], [x1, bot(x1)]), ...k.line([x2, top(x2)], [x2, bot(x2)]), ...k.line([x2 - 14, cy - 1], [x2 + 14, cy + 1]),
      ...k.text('A', x1 + 14, cy - 40, { u: 22 }), ...k.text('4A', x2 + 16, cy - 70, { u: 22 }), ...k.text('r', x1 - 6, bot(x1) + 34, { u: 22 }), ...k.text('2r', x2 - 14, bot(x2) + 34, { u: 22 }),
      ...k.text('I', x1 + 14, cy + 22, { u: 22 }), ...k.text('I/4', x2 + 16, cy + 30, { u: 22 }), ...k.text('V1', sx - 30, cy + 40, { u: 20 })];
    fig3 = F.length;
    const Wl = []; ['I_2 / I_1 = (r_1 / r_2)^2', '= (1 / 173)^2', '= 1 / 29,929'].forEach((s, i) => Wl.push(...k.text(s, 640, y + 170 + i * 56, { u: 22 })));   // 173² = 29,929
    const a = k.text('30,000 × weaker', 640, y + 170 + 3 * 56 + 14, { u: 26 });
    return [...F, ...Wl, ...a, ...k.ring(a, { pad: 10 })]; } };
  const P4 = { q: '4.  How far is one light-day, in km?', h: 1.0, fig: ({ k, y }) => {
    const l = k.text('d = c t = (3.00 × 10^5 km/s)(86,400 s)', 124, y + 128, { u: 24 }), r = k.text('d = 2.59 × 10^{10} km', 124, y + 196, { u: 27 });   // 2.592e10 km
    return [...l, ...r, ...k.ring(r, { pad: 10 })]; } };
  const meta = { rich: true, name: 'Vex', title: 'PHYS 1 · PROBLEM SET 7', note: 'Due tomorrow  ·  HANDWRITTEN WORK ONLY' };
  const sheet1 = makeSheet(G, { ...meta, seed: 17, page: 'p. 1 of 2', problems: [P1, P2] });
  const sheet2 = makeSheet(G, { ...meta, seed: 18, page: 'p. 2 of 2', problems: [P3, P4] });
  const wsum = (sh, n) => sh.items.slice(0, n).reduce((s2, it) => s2 + (it.kind === 'p' ? it.w : 1), 0);
  const firstOf = (sh, pi) => sh.items.findIndex((it) => it.pi === pi);
  const fig1W = wsum(sheet1, firstOf(sheet1, 0) + fig1), fig3W = wsum(sheet2, firstOf(sheet2, 0) + fig3);
  const thumb = document.createElement('canvas'); thumb.width = 256; thumb.height = Math.round(256 * sheet1.h / sheet1.w); sheet1.draw(0, true); thumb.getContext('2d').drawImage(sheet1.canvas, 0, 0, thumb.width, thumb.height);
  // pen schedule: page 1 = the figure under the macro, then the working; page 2 = its figure, then the rest
  const write1 = (t) => (t < T.hand ? fig1W * u01(t, T.scribe + 0.15, T.hand) : fig1W + (sheet1.total - fig1W) * u01(t, T.hand, T.both - 0.05));
  const write2 = (t) => (t < T.dark ? fig3W * u01(t, T.both + 0.12, T.dark - 0.05) : fig3W + (sheet2.total - fig3W) * u01(t, T.dark, T.record - 0.2));

  // the tablet screen (portrait; S.tablet faces +z toward the lens)
  const TPW = 0.168, TPH = 0.224, TW = 900, TH = 1200;
  const tabT = (() => { const c = document.createElement('canvas'); c.width = TW; c.height = TH; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; })();
  const tabScr = new THREE.Mesh(new THREE.PlaneGeometry(TPW, TPH), new THREE.MeshBasicMaterial({ map: tabT, toneMapped: false })); tabScr.position.z = 0.0003; S.tablet.add(tabScr);
  const SX = 40, SW = 820, KS = SW / sheet1.w, SHh = Math.round(SW * sheet1.h / sheet1.w), SY1 = 372, SY2 = SY1 + SHh + 28;
  const nib = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); return c; })();
  const rr = (g, x, y, w, h, r, fill, stroke) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } };
  const typed = (s, a, b, t) => s.slice(0, Math.round(s.length * u01(t, a, b)));
  const TYPE1 = 'Physics HW 7, show your work';
  const scrollAt = (t) => (t < T.hand + 0.1 ? 0 : t < T.both ? 300 * ease(u01(t, T.hand + 0.1, T.hand + 0.5)) : lerp(300, SY2 - 150, ease(u01(t, T.both, T.both + 0.35))));
  let tabKey = '';
  function drawTablet(t) {
    const home = t < T.cute - 0.12, dk = ease(u01(t, T.dark + 0.32, T.dark + 0.62)), menu = t > T.dark - 0.08 && t < T.obviously + 0.45;
    const C = { bg: mixHex('#f3f1eb', '#17161b', dk), head: mixHex('#fbfaf6', '#1e1d23', dk), ink: mixHex('#1d1d1d', '#ece8e1', dk), mute: mixHex('#6b6b6b', '#9a948a', dk),
      bub: mixHex('#e9e2d4', '#2c2932', dk), acc: mixHex('#9a1c25', '#e46c74', dk), btn: mixHex('#9a1c25', '#a3222c', dk), box: mixHex('#ffffff', '#24222a', dk), line: dk > 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)' };
    const p1 = home ? 0 : write1(t), p2 = home || t < T.both ? 0 : write2(t), s = home ? 0 : scrollAt(t), ty = typed(TYPE1, T.you + 0.12, T.cute - 0.3, t);
    const key = `${home}|${Math.round(p1 * 3)}|${Math.round(p2 * 3)}|${Math.round(s)}|${ty.length}|${Math.round(dk * 20)}|${menu}|${t > T.dark + 0.22}|${Math.floor(t * 2) % 2}`;
    if (key === tabKey) return; tabKey = key;
    const g = tabT.canvas.getContext('2d');
    g.fillStyle = C.bg; g.fillRect(0, 0, TW, TH);
    if (!home) {
      g.save(); g.beginPath(); g.rect(0, 98, TW, 952); g.clip(); g.translate(0, -s);
      rr(g, 420, 118, 440, 150, 26, C.bub); g.drawImage(thumb, 440, 136, 88, 114); g.fillStyle = C.ink; g.font = '27px Georgia, serif'; g.fillText('Physics HW 7,', 548, 184); g.fillText('show your work', 548, 222);
      g.font = '500 22px Inter, Arial'; g.fillStyle = C.mute; g.fillText('2 pages', 44, 312); g.fillText('Shuffle', 520, 312); g.fillText('Replay', 620, 312); g.fillStyle = C.acc; g.font = '600 22px Inter, Arial'; g.fillText('Export PDF', 718, 312);
      // the set's own pen / paper / Aa controls above its first sheet
      g.strokeStyle = C.mute; g.lineWidth = 2.5; g.beginPath(); g.moveTo(50, 352); g.lineTo(64, 334); g.lineTo(70, 340); g.lineTo(56, 358); g.closePath(); g.stroke(); g.strokeRect(84, 334, 18, 24); g.fillStyle = C.mute; g.font = '600 20px Georgia, serif'; g.fillText('Aa', 116, 354);
      const sheetAt = (sh, p, Y, writing) => { const tip = sh.draw(p); g.fillStyle = '#fff'; g.fillRect(SX - 3, Y - 3, SW + 6, SHh + 6); g.drawImage(sh.canvas, SX, Y, SW, SHh); g.strokeStyle = dk > 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(SX, Y, SW, SHh);
        if (writing && p > 0 && p < sh.total - 0.5) g.drawImage(nib, SX + tip[0] * KS - 6, Y + tip[1] * KS - 58, 64, 64); };
      sheetAt(sheet1, p1, SY1, true);
      if (s > SHh * 0.4 || p2 > 0) sheetAt(sheet2, p2, SY2, true);
      g.restore();
    } else {
      g.fillStyle = C.ink; g.font = '46px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we solving today?', 450, 390); g.textAlign = 'left';
      rr(g, 50, 450, 800, 360, 30, C.box, C.line);
      rr(g, 76, 474, 380, 150, 18, mixHex('#f3efe6', '#2c2932', dk), C.line); g.drawImage(thumb, 92, 488, 94, 122); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(92, 488, 94, 122);
      g.fillStyle = C.ink; g.font = '600 24px Inter, Arial'; g.fillText('physics-hw7.jpg', 202, 534); g.fillStyle = C.mute; g.font = '500 22px Inter, Arial'; g.fillText('2 pages', 202, 570); g.fillText('×', 428, 504);
      g.fillStyle = C.ink; g.font = '31px Georgia, serif'; g.fillText(ty + ((Math.floor(t * 2) % 2 && ty.length < TYPE1.length) ? '|' : ''), 80, 694);
    }
    // header: sidebar, New assignment, the title, the account initial
    g.fillStyle = C.head; g.fillRect(0, 0, TW, 96); g.fillStyle = C.line; g.fillRect(0, 96, TW, 2);
    g.fillStyle = C.ink; for (let i = 0; i < 3; i++) g.fillRect(30, 34 + i * 11, 30, 4);
    g.fillStyle = C.mute; g.font = '500 21px Inter, Arial'; g.fillText('+ New', 82, 58); g.drawImage(icon, 172, 26, 44, 44); g.fillStyle = C.ink; g.font = '30px Georgia, serif'; g.fillText(home ? 'Scribe' : 'Physics HW 7', 226, 59);
    g.fillStyle = C.btn; g.beginPath(); g.arc(846, 48, 26, 0, 2 * PI); g.fill(); g.fillStyle = '#fff'; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('V', 846, 57); g.textAlign = 'left';
    // composer (home: in the middle box; desk: docked at the foot)
    const cy = home ? 760 : 1120;
    if (!home) { rr(g, 24, 1066, 852, 120, 30, C.box, C.line); g.font = '30px Georgia, serif'; g.fillStyle = C.mute; g.fillText('Ask Scribe', 56, 1116); }
    g.strokeStyle = C.mute; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(90, cy + (home ? 0 : 28), 20, 0, 2 * PI); g.moveTo(80, cy + (home ? 0 : 28)); g.lineTo(100, cy + (home ? 0 : 28)); g.moveTo(90, cy + (home ? -10 : 18)); g.lineTo(90, cy + (home ? 10 : 38)); g.stroke();
    { const ay = cy + (home ? 0 : 28), on = home && ty.length > 0, pressed = home && t > T.cute - 0.3; g.fillStyle = pressed ? '#5a0f16' : on ? C.btn : mixHex('#d8d2c6', '#3a3740', dk); g.beginPath(); g.arc(home ? 800 : 830, ay, 30, 0, 2 * PI); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; const ax = home ? 800 : 830; g.beginPath(); g.moveTo(ax, ay + 13); g.lineTo(ax, ay - 13); g.moveTo(ax - 11, ay - 3); g.lineTo(ax, ay - 14); g.lineTo(ax + 11, ay - 3); g.stroke(); }
    // the account menu: Theme · Light / Dark / System (the moon pressed at "dark")
    if (menu && !home) {
      const mx = 520, my = 92; rr(g, mx, my, 360, 250, 22, C.box, C.line);
      g.fillStyle = C.mute; g.font = '600 20px Inter, Arial'; g.fillText('THEME', mx + 28, my + 46);
      const opt = (i, kind) => { const ox = mx + 60 + i * 110, oy = my + 104, sel = kind === 'moon' ? t > T.dark + 0.22 : kind === 'sun' && t <= T.dark + 0.22;
        if (sel) { g.fillStyle = mixHex('#f2e4e2', '#3a2228', dk); g.beginPath(); g.arc(ox, oy, 38, 0, 2 * PI); g.fill(); g.strokeStyle = C.acc; g.lineWidth = 3; g.stroke(); }
        g.strokeStyle = sel ? C.acc : C.ink; g.fillStyle = sel ? C.acc : C.ink; g.lineWidth = 3;
        if (kind === 'sun') { g.beginPath(); g.arc(ox, oy, 11, 0, 2 * PI); g.stroke(); for (let r = 0; r < 8; r++) { const a = r * PI / 4; g.beginPath(); g.moveTo(ox + Math.cos(a) * 17, oy + Math.sin(a) * 17); g.lineTo(ox + Math.cos(a) * 23, oy + Math.sin(a) * 23); g.stroke(); } }
        if (kind === 'moon') { g.beginPath(); g.arc(ox, oy, 17, 0, 2 * PI); g.fill(); g.fillStyle = sel ? mixHex('#f2e4e2', '#3a2228', dk) : C.box; g.beginPath(); g.arc(ox + 9, oy - 7, 15, 0, 2 * PI); g.fill(); }
        if (kind === 'screen') { g.strokeRect(ox - 20, oy - 15, 40, 26); g.beginPath(); g.moveTo(ox - 10, oy + 19); g.lineTo(ox + 10, oy + 19); g.stroke(); } };
      opt(0, 'sun'); opt(1, 'moon'); opt(2, 'screen');
      g.fillStyle = C.mute; g.font = '500 20px Inter, Arial'; g.fillText('Light', mx + 38, my + 172); g.fillText('Dark', mx + 150, my + 172); g.fillText('System', mx + 248, my + 172);
      g.fillStyle = C.line; g.fillRect(mx + 20, my + 192, 320, 2); g.fillStyle = C.ink; g.font = '500 22px Inter, Arial'; g.fillText('Account settings', mx + 28, my + 230);
      if (t > T.dark - 0.05 && t < T.dark + 0.3) { const ox = mx + 170, oy = my + 104, a = u01(t, T.dark - 0.05, T.dark + 0.3); g.fillStyle = `rgba(154,28,37,${0.35 * (1 - a)})`; g.beginPath(); g.arc(ox, oy, 20 + 40 * a, 0, 2 * PI); g.fill(); }   // the tap
    }
    tabT.needsUpdate = true;
  }
  // screen points (u, v) of the money shots; v includes the desk's scroll at that moment
  const UVd = (x, y, s) => [x / TW, (y - s) / TH];
  const uvFig1 = UVd(SX + 370 * KS, SY1 + (300 + 262) * KS, 0), uvWork1 = UVd(SX + 815 * KS, SY1 + (300 + 280) * KS, 300), uvFig3 = UVd(SX + 365 * KS, SY2 + (300 + 292) * KS, SY2 - 150);

  // ---------------------------------------------------------------- Vex
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const HIP_R = [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]];
  ARMS.upL = { L: [[0.55, 0.72, -0.22], [0.42, 0.86, -0.12]], R: HIP_R };   // her left arm up toward the dish (screen right)
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, Lr = A.L || ARMS.rest.L; return { L: Lr, R: A.R || Lr.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });

  // ---------------------------------------------------------------- overlay: title, callouts, end card + the PIXEL DIAGRAM cards
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['A SPACESHIP FROM 1977', 'IS ALMOST ONE', 'LIGHT-DAY AWAY'], t0: 0, t1: T.saying - 0.05, y: 0.14, plain: true, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const ptxt = (s, color, x, y, sc = 1, o = {}) => { const cv = pixelText(s, { color, ...o }); dctx.drawImage(cv, Math.round(x - cv.width * sc / 2), Math.round(y - cv.height * sc / 2), cv.width * sc, cv.height * sc); };
  const panel = (y0, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(18, y0, 234, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(16, y0 - 2, 238, 2); dctx.fillRect(16, y1, 238, 2); dctx.fillRect(16, y0, 2, y1 - y0); dctx.fillRect(252, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const probeIcon = (x, y, s = 1) => {   // a tiny pixel probe: white dish (facing left), dark bus, booms
    for (let j = -6; j <= 6; j++) R('#f2f1ec', x - Math.round(Math.sqrt(36 - j * j) * 0.5) * s, y + j * s, 2 * s, s);
    R('#3a3b40', x + 2 * s, y - 3 * s, 5 * s, 6 * s); R('#8e939c', x + 7 * s, y - s, 9 * s, s); R('#8e939c', x - 4 * s, y + 3 * s, s, 6 * s); R('#e7bb4e', x + 3 * s, y - 2 * s, 2 * s, 2 * s); };
  const earthIcon = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) R(hash(Math.floor((i + 20) / 3) * 17 + Math.floor((j + 20) / 3)) > 0.62 ? '#5fae5a' : '#3a78c8', x + i, y + j, 1, 1); };
  let dgKey = '';
  function diagram(t) {
    let id = null, k = 0;
    if (t >= T.voyager && t < T.on - 0.05) { id = 'name'; k = u01(t, T.voyager, T.voyager + 0.5); }
    else if (t >= T.on && t < T.sixteen - 0.05) { id = 'cal'; k = u01(t, T.on, T.on + 0.6); }
    else if (t >= T.even && t < T.dish) { id = 'light'; k = u01(t, T.even + 0.3, T.dish - 0.2); }
    else if (t >= T.seventy && t < T.radio) { id = 'field'; k = u01(t, T.seventy, T.seventy + 0.7); }
    else if (t >= T.about && t < T.what - 0.05) { id = 'bulb'; k = u01(t, T.about, T.about + 0.4); }
    else if (t >= T.less && t < T.pivot) { id = 'watt'; k = u01(t, T.less + 0.15, T.watt + 0.1); }
    else if (t >= T.pivot && t < T.you - 0.05) { id = 'years'; k = u01(t, T.pivot + 0.1, T.still + 0.2); }
    else if (t >= T.end && t < T.until - 0.05) { id = 'battery'; k = u01(t, T.end + 0.2, T.until - 0.2); }
    const key = id ? `${id}${Math.round(k * 48)}` : 'none'; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480); if (!id) return;
    dctx.save(); dctx.translate(0, 96);   // the cards sit low (y ≈ 0.39–0.67): above them her face stays clear
    if (id === 'name') { panel(90, 226); probeIcon(130, 124, 3); ptxt('VOYAGER 1', '#ffd43b', 135, 170); ptxt('LAUNCHED 1977', '#ffffff', 135, 190); ptxt('STILL FLYING', '#7cf05f', 135, 210); }
    if (id === 'cal') { panel(90, 226); R('#f3f1ec', 40, 104, 86, 100); R('#d8413a', 40, 104, 86, 22); ptxt('NOV', '#ffffff', 83, 116); const ink = { edge: '#f3f1ec', shadow: 'rgba(0,0,0,0)' }; ptxt('18', '#26282c', 83, 158, 3, ink); ptxt('2026', '#d8413a', 83, 192, 1, ink);
      if (k > 0.3) { ptxt('1', '#ffd43b', 190, 124, 3); ptxt('LIGHT-DAY', '#ffd43b', 190, 160); ptxt('FROM EARTH', '#ffffff', 190, 178); } }
    if (id === 'light') { panel(90, 226); earthIcon(46, 150, 10); probeIcon(222, 150, 2); for (let x = 62; x < 204; x += 6) R('#6a6f8a', x, 150, 3, 1);
      const lx = 62 + (204 - 62) * k; R('#fff4c2', lx - 2, 148, 5, 5); R('#ffd43b', lx - 1, 149, 3, 3);
      ptxt(`${Math.round(k * 24)} H`, '#ffd43b', 135, 112); ptxt('EARTH', '#ffffff', 46, 176); ptxt('V1', '#ffffff', 222, 176); ptxt('LIGHT, ONE WAY', '#7cf05f', 135, 208); }
    if (id === 'field') { panel(90, 226); const dw = Math.round(196 * ease(k)), fw = Math.round(196 * 48.8 / 70 * ease(clamp(k * 1.3)));
      ptxt('DISH: 70 M', '#ffd43b', 135, 104); R('#e6e7ea', 37, 116, dw, 12); for (let x = 37; x < 37 + dw; x += 14) R('#b4b7bf', x, 116, 1, 12);
      ptxt('FOOTBALL FIELD', '#ffffff', 135, 146); R('#3f8f3a', 37, 158, fw, 26); for (let x = 37; x < 37 + fw; x += 10) R('#e8f0e0', x, 158, 1, 26);
      ptxt('49 M WIDE', '#ffffff', 135, 198); ptxt('THE DISH WINS', '#7cf05f', 135, 214); }
    if (id === 'bulb') { panel(90, 226); const cx = 70, cy = 150;
      for (let j = -16; j <= 10; j++) for (let i = -16; i <= 16; i++) if (i * i + j * j <= 16 * 16 * (k > 0.2 ? 1 : 0.85)) R(j < -2 && i < -4 ? '#fff8d8' : '#ffe08a', cx + i, cy + j, 1, 1);
      R('#9aa0a8', cx - 8, cy + 10, 16, 5); R('#7d828c', cx - 7, cy + 15, 14, 4); R('#9aa0a8', cx - 6, cy + 19, 12, 3);
      if (k > 0.3) { R('rgba(255,224,138,.25)', cx - 26, cy - 26, 52, 46); }
      ptxt('ABOUT', '#ffffff', 180, 122); ptxt('20 W', '#ffd43b', 180, 146, 2); ptxt('A FRIDGE', '#ffffff', 180, 180); ptxt('LIGHT BULB', '#ffffff', 180, 196); }
    if (id === 'watt') { panel(90, 226); ptxt('WHAT REACHES US', '#ffffff', 135, 106); ptxt('LESS THAN', '#ffffff', 135, 128);
      const z = '0.000000000000000001', n = Math.max(2, Math.round(z.length * k)); ptxt(z.slice(0, n), '#ffd43b', 135, 156); ptxt('WATTS', '#ffd43b', 135, 178); ptxt('IT STILL HEARS IT', '#7cf05f', 135, 208); }
    if (id === 'years') { panel(90, 226); ptxt('1977', '#ffffff', 52, 110); ptxt('2026', '#ffffff', 218, 110); R('#3a3b48', 34, 124, 202, 14); R('#ffd43b', 36, 126, Math.round(198 * ease(k)), 10); probeIcon(Math.round(42 + 186 * ease(k)), 154, 1);
      ptxt(`${Math.round(49 * ease(k))} YEARS`, '#ffd43b', 135, 178, 2); ptxt('STILL WORKING', '#7cf05f', 135, 210); }
    if (id === 'battery') { panel(90, 226); R('#f2e6ff', 40, 116, 112, 56); R('#f2e6ff', 152, 132, 8, 24); R('#140c14', 44, 120, 104, 48); const lvl = Math.round(100 * (1 - 0.3 * ease(k))); R(lvl > 80 ? '#7cf05f' : '#ffd43b', 48, 124, lvl, 40);
      ptxt('-4 W', '#ffd43b', 210, 134, 2); ptxt('EVERY YEAR', '#ffffff', 135, 190); ptxt('A DAY AWAY, STILL TALKING', '#7cf05f', 135, 210); }
    dctx.restore();
  }

  // ---------------------------------------------------------------- shots
  const aimCam = (pos, yaw, pitch, fov) => { const d = V(-Math.sin(yaw * DEG) * Math.cos(pitch * DEG), Math.sin(pitch * DEG), -Math.cos(yaw * DEG) * Math.cos(pitch * DEG)); return { pos, look: [pos[0] + d.x * 10, pos[1] + d.y * 10, pos[2] + d.z * 10], fov }; };
  const VA = { x: 0, z: 0 };
  const VP = V();   // the probe's position (space-local), moved per shot
  const EX = V(1, 0, 0).applyQuaternion(voy.g.quaternion), EY = V(0, 1, 0).applyQuaternion(voy.g.quaternion), EZ = home.clone();   // probe axes: EZ = its dish (home), EY = the record's face
  const spCam = (offL, lookL, fov) => ({ pos: SPW(offL).toArray(), look: SPW(lookL).toArray(), fov, up: EZ });   // dish up on screen
  const PP = () => voy.g.position.clone();
  const sideDir = (a) => EY.clone().multiplyScalar(Math.cos(a)).addScaledVector(EX, Math.sin(a));   // a horizontal look direction at the probe (screen up = its dish)
  const ring3 = (a, r, h) => EY.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(EX, Math.sin(a) * r).addScaledVector(EZ, h);
  const recN = V(), recP = V();
  const recordFrame = () => { voy.g.updateMatrixWorld(true); voy.recordAt(recP); recN.set(0, 0, 1).transformDirection(voy.record.matrixWorld); return [recP.clone().sub(SPO), recN.clone()]; };
  const dishPt = V(), dishFocus = () => S.dish.focus(dishPt).clone();
  const SH = [
    { id: 'hook', t0: 0, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: t > T.spaceship + 0.05 && t < T.s77 + 0.45 ? 'upL' : 'hip', tilt: t > T.s77 + 0.45 ? 0.12 : 0.04, nod: t > T.spaceship && t < T.s77 + 0.45 ? -0.25 : 0, look: t > T.spaceship && t < T.s77 + 0.45 ? [0.25, 0.5] : [0, 0], sway: 0.15, face: CONF(t) }),
      cam: (t) => { const k = ease(u01(t, 0, T.gets)); return aimCam([1.0 - 0.35 * k, 0.72 + 0.2 * k, 2.75 - 0.75 * k], 15.5 - 3 * k, 7 - 1 * k, 56); } },
    { id: 'away', t0: T.gets - 0.05, set: 'space', voy: (t) => VP.copy(sideDir(0.45)).multiplyScalar(-24 * ease(u01(t, T.gets - 0.05, T.saying + 0.3))),
      cam: () => spCam(ring3(0.45, 8, 2.4), PP().addScaledVector(EZ, -1.0), 44) },
    { id: 'hi', t0: T.saying - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: t > T.saying + 0.15 && t < T.lightday - 0.1 ? 'wave' : 'hip', tilt: 0.1, sway: 0.15, face: CONF(t, { happy: t > T.saying + 0.2 ? 0.25 : 0 }) }),
      cam: (t) => aimCam([0.55, 1.05, 1.95 - 0.12 * u01(t, T.saying, T.lightday)], 13, 4, 50) },
    { id: 'name', t0: T.lightday, set: 'space', voy: () => VP.set(0, 0, 0),
      cam: (t) => { const a = -0.35 + 0.3 * u01(t, T.lightday, T.on); return spCam(ring3(a, 10, 3.2), V().addScaledVector(EZ, -2.0), 44); } },
    { id: 'nov18', t0: T.on - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: t > T.on + 0.4 ? 'point' : 'hip', tilt: -0.06, sway: 0.12, face: CONF(t) }),
      cam: (t) => aimCam([0.9, 0.8, 2.25 - 0.15 * u01(t, T.on, T.sixteen)], 19, 8, 54) },
    { id: 'miles', t0: T.sixteen - 0.05, set: 'space', voy: () => VP.set(0, 0, 0),
      cam: (t) => { const k = eOut(u01(t, T.sixteen - 0.05, T.even)), d = 7 + 80 * k; return spCam(ring3(0.5, d, d * 0.25), V().addScaledVector(EZ, -0.6 * (1 - k)), 44); } },
    { id: 'lookUp', t0: T.even - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: 'hip', nod: -0.45, tilt: 0.05, sway: 0.1, look: [0.1, 0.6], face: CONF(t) }),
      cam: (t) => aimCam([0.75, 0.55, 1.95 - 0.12 * u01(t, T.even, T.dish)], 18, 15, 56) },
    { id: 'gesture', t0: T.dish, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: t > T.dish + 0.25 ? 'upL' : 'hip', turn: -0.15, tilt: -0.06, sway: 0.12, face: CONF(t) }),
      cam: (t) => aimCam([1.6, 0.6, 3.1 - 0.2 * u01(t, T.dish, T.dishes)], 20, 9, 58) },
    { id: 'dishUp', t0: T.dishes - 0.04, set: 'station', sun: [D.dish[0], D.dish[1], 70], dish: (t) => [0.12 + 0.05 * u01(t, T.dishes, T.radio), 0.42 + 0.08 * ease(u01(t, T.dishes, T.radio))],
      cam: (t) => { const k = u01(t, T.dishes, T.seventy); return { pos: [D.dish[0] + 26, 2.2, D.dish[1] + 92 - 8 * k], look: [D.dish[0] - 2, 40 + 6 * k, D.dish[1]], fov: 60 }; } },
    { id: 'dish70', t0: T.seventy - 0.05, set: 'station', sun: [D.dish[0], D.dish[1], 70], dish: (t) => [0.17, 0.5],
      cam: (t) => { const k = ease(u01(t, T.seventy - 0.05, T.radio)); return { pos: [D.dish[0] + 50 + 10 * k, 20 + 18 * k, D.dish[1] + 130], look: [D.dish[0] + 2, 44 + 4 * k, D.dish[1]], fov: 44 }; } },
    { id: 'radioS', t0: T.radio, set: 'space', voy: () => VP.set(0, 0, 0), waves: 1, wlen: 14,
      cam: (t) => { const k = u01(t, T.radio, T.about); return spCam(ring3(0.3, 16 - 1.5 * k, 3), V().addScaledVector(EZ, 1.8), 50); } },
    { id: 'bulb', t0: T.about - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: 'shrug', tilt: 0.1, sway: 0.12, face: CONF(t, { relaxed: 0.2 }) }),
      cam: (t) => aimCam([0.35, 0.95, 2.3 - 0.15 * u01(t, T.about, T.what)], 9, 4, 52) },
    { id: 'reach', t0: T.what - 0.05, set: 'station', sun: [D.dish[0], D.dish[1], 70], dish: () => [0.17, 0.5], waves: 1,
      cam: (t) => { const k = u01(t, T.what, T.less); return { pos: [D.dish[0] + 14, 6 + 4 * k, D.dish[1] + 68 - 6 * k], look: [D.dish[0] - 2, 52, D.dish[1] - 10], fov: 64 }; } },
    { id: 'watt', t0: T.less - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: 'cross', tilt: -0.1, sway: 0.1, face: CONF(t, { relaxed: 0.25, surprised: t > T.less + 0.6 && t < T.watt ? 0.25 : 0 }) }),
      cam: (t) => aimCam([0.6, 1.0, 1.75 - 0.1 * u01(t, T.less, T.pivot)], 14, 4, 50) },
    { id: 'years', t0: T.pivot, set: 'space', voy: (t) => VP.copy(out).multiplyScalar(1.5 * u01(t, T.pivot, T.you)),
      cam: (t) => { const a = 0.9 + 0.5 * u01(t, T.pivot, T.you); return spCam(ring3(a, 9, 2.6).add(PP()), PP().addScaledVector(EZ, -1.2), 46); } },
    { id: 'tabHome', t0: T.you - 0.04, set: 'station', tab: 'home' },
    { id: 'cute', t0: T.cute - 0.08, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: 'shh', tilt: 0.12, sway: 0.1, face: CONF(t, { relaxed: 0.24, blinkLeft: t > T.cute + 0.2 ? 1 : 0 }) }),
      cam: () => aimCam([0.35, 1.25, 1.25], 12, 4, 44) },
    { id: 'write', t0: T.scribe, set: 'station', tab: 'full' },
    { id: 'fig1', t0: T.ld2 - 0.06, set: 'station', tab: 'fig1' },
    { id: 'work1', t0: T.hand - 0.04, set: 'station', tab: 'work1' },
    { id: 'page2', t0: T.both - 0.04, set: 'station', tab: 'page2' },
    { id: 'darkS', t0: T.dark - 0.05, set: 'station', tab: 'dark' },
    { id: 'meanwhile', t0: T.record, set: 'space', voy: () => VP.set(0, 0, 0),
      cam: (t) => { const k = ease(u01(t, T.record, T.golden)); return spCam(ring3(1.4 - 1.15 * k, 7 - 3 * k, 1.8 - 0.9 * k), PP().addScaledVector(EZ, -0.5), 44); } },
    { id: 'record', t0: T.golden - 0.05, set: 'space', voy: () => VP.set(0, 0, 0), greet: true,
      cam: (t) => { const [p, n] = recordFrame(), k = u01(t, T.golden, T.anyone); return spCam(p.clone().addScaledVector(n, 2.3 - 0.35 * k).addScaledVector(EX, 0.12).addScaledVector(EZ, 0.1), p.clone().addScaledVector(EZ, 0.08), 44); } },
    { id: 'finds', t0: T.anyone - 0.05, set: 'space', voy: (t) => VP.copy(sideDir(-0.5)).multiplyScalar(-30 * u01(t, T.anyone - 0.05, T.end)),
      cam: (t) => spCam(ring3(-0.5, 7, 2.2), PP().multiplyScalar(0.6).addScaledVector(EZ, -0.8), 42) },
    { id: 'battery', t0: T.end, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: 'hip', tilt: 0.06, sway: 0.15, face: CONF(t) }),
      cam: (t) => aimCam([1.0, 0.75, 2.6 - 0.2 * u01(t, T.end, T.until)], 15.5, 7, 56) },
    { id: 'listen', t0: T.until - 0.05, set: 'station', sun: [D.dish[0], D.dish[1], 70], dish: () => [0.17, 0.5], waves: 0.7,
      cam: (t) => { const k = u01(t, T.until, T.im); return { pos: [D.dish[0] + 20 - 4 * k, 4 + 2 * k, D.dish[1] + 118 - 10 * k], look: [D.dish[0] - 2, 46, D.dish[1]], fov: 54 }; } },
    { id: 'wink', t0: T.im - 0.05, set: 'station', sun: [0, -4, 14], vex: (t) => ({ ...VA, pose: t > T.listening + 0.1 ? 'kissOut' : 'hip', tilt: -0.1, sway: 0.15, nod: t < T.listening ? -0.2 : 0, face: CONF(t, { blinkLeft: t > T.listening + 0.3 ? 1 : 0, happy: t > T.listening + 0.3 ? 0.2 : 0 }) }),
      cam: (t) => aimCam([0.6, 0.95, 1.8 - 0.25 * u01(t, T.im, T.card + 2)], 13, 7, 50) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;
  const MCUTS = SH.slice(1).filter((s2, i) => !(s2.tab && SH[i].tab)).map((s2) => s2.t0);   // tablet → tablet = a hard cut (no mosaic over the macros)

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrU = V();
  const tabCam = (u, v, d, fov = 40) => { tabScr.updateWorldMatrix(true, false); tabScr.localToWorld(scrP.set((u - 0.5) * TPW, (0.5 - v) * TPH, 0)); tabScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov, up: scrU.clone() }; };
  const TAB = {
    home: (t) => tabCam(0.5, 0.5, 0.43 - 0.04 * u01(t, T.you, T.cute)),
    full: (t) => tabCam(0.5, lerp(0.45, 0.4, u01(t, T.scribe, T.ld2)), 0.42 - 0.1 * ease(u01(t, T.scribe, T.ld2))),
    fig1: (t) => { const k = ease(u01(t, T.ld2 - 0.06, T.ld2 + 0.35)); return tabCam(lerp(0.5, uvFig1[0], k), lerp(0.4, uvFig1[1], k), lerp(0.32, 0.17, k)); },
    work1: (t) => tabCam(uvWork1[0], uvWork1[1] + 0.02 * u01(t, T.hand, T.both), 0.155),
    page2: (t) => { const k = ease(u01(t, T.both, T.both + 0.4)); return tabCam(lerp(uvWork1[0], uvFig3[0], k), lerp(uvWork1[1], uvFig3[1], k), lerp(0.17, 0.175, k)); },
    dark: (t) => { const k = ease(u01(t, T.dark - 0.05, T.dark + 0.35)); return tabCam(lerp(uvFig3[0], 0.5, k), lerp(uvFig3[1], 0.46, k), lerp(0.175, 0.46, k)); },
  };

  const UPY = V(0, 1, 0);
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const space = sh.set === 'space';
    S.root.visible = !space; SP.root.visible = space; scene.fog = space ? null : stationFog;
    // the probe + its radio waves (space-local)
    if (space) { voy.g.position.copy(sh.voy ? sh.voy(t) : V()); SP.waves(t, sh.waves ?? 0, sh.wlen ?? 40); }
    else SP.waves(t, 0);
    // the big dish: a slow slew; faint rings falling into it when it listens
    { const [az, el] = sh.dish ? sh.dish(t) : [0.12, 0.42]; S.dish.setPoint(az, el); }
    S.waves(t, !space && sh.waves ? sh.waves : 0);
    // camera
    const cam = sh.tab ? TAB[sh.tab](t) : sh.cam(t);
    studio.camera.up.copy(cam.up || UPY);
    studio.camera.near = sh.tab ? 0.01 : space ? 0.05 : 0.08; studio.camera.far = space ? 9000 : 2800; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, sh.tab ? 0.0003 : space ? 0.002 : 0.004);
    if (sh.sun) S.aim(sh.sun[0], sh.sun[1], sh.sun[2]);
    // greetings popping out of the record
    { const on = !!sh.greet, [p, n] = on ? recordFrame() : [null, null], cR = V(1, 0, 0).applyQuaternion(studio.camera.quaternion), cU = V(0, 1, 0).applyQuaternion(studio.camera.quaternion);
      GREET.forEach((sp, i) => { const a = t - (T.hello - 0.1 + i * 0.28); sp.visible = on && a > 0; if (!sp.visible) return;
        const ang = PI / 2 + (i % 2 ? -1 : 1) * (0.55 + Math.floor(i / 2) * 0.8), gr = eOut(clamp(a / 0.9));
        const pos = p.clone().addScaledVector(n, 0.1 + 0.1 * gr).addScaledVector(cR, Math.cos(ang) * (0.12 + 0.2 * gr)).addScaledVector(cU, Math.sin(ang) * (0.14 + 0.24 * gr));
        sp.position.copy(SPW(pos)); const hgt = 0.07 * (a < 0.06 ? 0.6 : a < 0.12 ? 1.15 : 1); sp.scale.set(hgt * sp.userData.ar, hgt, 1); sp.material.opacity = clamp(a / 0.08); }); }
    // the fill at the lens (Vex's face; a softer one on the probe in space)
    { const tgt = sh.vex ? V(0, 1.3, 0) : space ? SPW(voy.g.position) : null;
      if (tgt) { const d = Math.max(0.6, studio.camera.position.distanceTo(tgt)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.4, 0.22 * Math.pow(d, 1.6)) : Math.min(80, 0.9 * Math.pow(d, 1.6)); } else fill.intensity = 0; }
    VEX.root.visible = !!sh.vex && !space;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); }
    S.update(t);
    if (sh.tab || (t >= T.you - 0.1 && t < T.record)) drawTablet(t);
    diagram(t);
    pixel.set(Math.max(sh.tab ? 1 : PIXEL, mosaicAt(t, MCUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
