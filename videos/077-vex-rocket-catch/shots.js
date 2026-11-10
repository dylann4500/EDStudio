// 077 — "How to catch a rocket with chopsticks" (Scribe lane, Vex explainer, anime/pixel look). Topic of the week (Nov 9 2026):
// Starship Flight 15, targeted for Friday Nov 13, tries the FIRST catch of the ship (the top half) by the launch tower's arms, after
// ~14 orbits; the booster has been caught three times (Flights 5, 7, 8). Vex explains it from the public viewing beach at sunset.
//   place   = NEW: engine/sets/launchbeach.js — the viewing beach (rope fence, spectators filming, chairs, coolers, RV, cars, gulls,
//             a rocket sandcastle, the Gulf) and the pad behind her (146 m catch tower with two chopstick arms, the launch mount,
//             tank farm, an older tower, the assembly bay); + tech.js buildSpace (Earth ×20) for the orbit and the reentry.
//   facts   = (sources in caption.md's comment) booster 72 m, 33 engines (V3/Block 3); caught 3 times; the ship circles Earth ~14 times
//             (~21 h) before the catch try; reentry at ~17,500 mph; belly-flop then flip; Flight 15 NET Fri Nov 13 2026.
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480, shown ×4 pixelated, low in the frame so her face stays clear): the
//             booster vs a 20-floor building, 3 catches with dates, an orbit counter to 14, CATCH → REFUEL → FLY.
//   Scribe  = the app ON THE PHONE SCREEN (her phone on a tripod, filming the pad): the homework photo + "show your work" → the page
//             writes itself stroke by stroke (a free-body diagram of a braking booster) → a FOLLOW-UP prompt typed on the desk
//             ("show more steps on 2", README §Follow-ups: "gives back the same assignment with only that changed"; the problems
//             it didn't change appear at once, the changed one at a hand's pace). Physics (PHYS 1 · Problem Set 6).
//   persona = confident, teasing goth tutor (lighter 071/072 tone): "Ambitious.", "Cute.", "I'll be watching from the beach."
//             Fish "Dolly", less-breathy settings. Nothing handheld (the phone stands on a tripod).
// Guardrails: swimwear only, no kink lines, no promises, no claims about real people; no company logos (all hardware is our own
// generic toy version; the name in the narration is not said).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { FIG } from '@engine/build/subjects.js';
import { buildLaunchBeach, makeBooster, makeShip, makePlume, makePuffs, D } from '@engine/sets/launchbeach.js';
import { buildSpace } from '@engine/sets/tech.js';

const PI = Math.PI, PIXEL = 4, DEG = PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const eOut = (u) => 1 - (1 - u) ** 3;
const lerp = (a, b, k) => a + (b - a) * k;
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
    with: W('hook', 'with'), tower: B.tower.t0, its: W('tower', 'its'), chop2: W('tower', 'chopsticks'),
    booster: B.booster.t0, half: W('booster', 'half'), s72: W('booster', 'seventytwo'), t33: W('booster', 'thirtythree'), falls: W('booster', 'falls'),
    brakes: W('booster', 'brakes'), slides: W('booster', 'slides'), armsB: W('booster', 'arms'), catches: B.catches.t0, three: W('catches', 'three'),
    ship: B.ship.t0, theShip: W('ship', 'ship'), circles: W('ship', 'circles'), fourteen: W('ship', 'fourteen'), times: W('ship', 'times'), then: W('ship', 'then'), hits: W('ship', 'hits'),
    pivot: B.pivot.t0, your: W('pivot', 'your'), friday: W('pivot', 'friday'), cute: W('pivot', 'cute'),
    scribe: B.scribe.t0, draws: W('scribe', 'draws'), fbd: W('scribe', 'freebody'), hand: W('scribe', 'handwriting'), want: W('scribe', 'want'), ask: W('scribe', 'ask'), it: W('scribe', 'it'),
    flip: B.flip.t0, bfalls: W('flip', 'falls'), flips: W('flip', 'flips'), fand: W('flip', 'and'), fcatch: W('flip', 'catch'),
    end: B.end.t0, refuel: W('end', 'refuel'), fly: W('end', 'fly'), ill: W('end', 'ill'), beach: W('end', 'beach'),
  };
  T.card = T.beach + 0.55;

  // ---------------------------------------------------------------- the place: viewing beach + pad (origin) and orbit (parked far away)
  const L = buildLaunchBeach(studio); const beachFog = L.fog; scene.fog = beachFog;
  const C = { x: D.catch[0], z: D.catch[1] }, tower = L.tower;
  const SP = buildSpace(studio); SP.root.visible = false; SP.root.scale.setScalar(20);
  const SPO = V(0, -8000, 60000); SP.root.position.copy(SPO);
  { const S0 = V(1000, 250, 300).normalize(), S1 = V(0.42, 0.9, 0.12).normalize();   // tilt the whole space set so the sun stands high over the top
    SP.root.quaternion.setFromUnitVectors(S0, S1); SP.lights.material.uniforms.uSun.value.copy(S1); SP.atm.material.uniforms.uSun.value.copy(S1); }
  const spinBase = SP.spin.quaternion.clone(), qTmp = new THREE.Quaternion(), Z = V(0, 0, 1);
  const TOP = V(0, 0, 60000);   // the point on the scaled Earth straight under +y

  // rockets (scene children: the ship appears at the pad AND in orbit)
  const booster = makeBooster({ soot: true }); scene.add(booster.g);
  const booster2 = makeBooster({ soot: true }); booster2.g.position.set(-170, 20, -330); L.root.add(booster2.g);   // a second one on the old pad
  const ship = makeShip(); scene.add(ship.g);
  const bPlume = makePlume(); booster.g.add(bPlume.g);
  const sPlume = makePlume(); ship.g.add(sPlume.g);
  const highFog = new THREE.Fog(0xd8b0b4, 1200, 9000);
  const steam = makePuffs(scene, 44), plasma = makePuffs(scene, 46, { fire: true }), sky = makePuffs(scene, 10);
  // 33 engine glows (the "thirty-three engines" ripple)
  const eGlow = new THREE.InstancedMesh(new THREE.CircleGeometry(0.55, 14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), 33);
  { const m4 = new THREE.Matrix4(), rx = new THREE.Matrix4().makeRotationX(PI / 2); let k = 0;
    for (const [n, r] of [[3, 0.85], [10, 2.15], [20, 3.65]]) for (let i = 0; i < n; i++) { const a = (i / n) * 2 * PI + (n === 10 ? 0.3 : 0); m4.makeTranslation(Math.cos(a) * r, -1.32, Math.sin(a) * r).multiply(rx); eGlow.setMatrixAt(k, m4); eGlow.setColorAt(k++, new THREE.Color(0)); } }
  eGlow.frustumCulled = false; booster.g.add(eGlow);
  const colTmp = new THREE.Color();

  // ---------------------------------------------------------------- Scribe: physics homework (a braking booster) + its follow-up version
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  let figCount = 0;   // items in P1's sketch + FBD (the pen draws those slowly, under the macro)
  const P1 = { q: '1.  A 2.0 × 10⁵ kg booster falls with its engines firing (T = 3.0 × 10⁶ N).\n     Draw its free-body diagram and find its acceleration.', h: 2.0, fig: ({ k, y }) => {
    // mg = 1.96 × 10⁶ N; ΣF = T − mg = ma → a = (3.0 − 1.96) × 10⁶ / 2.0 × 10⁵ = 5.2 m/s² (upward: it slows down)
    const yb = y + 400, sk = [...k.poly([[150, y + 176], [150, yb], [204, yb], [204, y + 176]], { close: true }), ...k.poly([[150, y + 176], [177, y + 120], [204, y + 176]]),
      ...k.poly([[150, yb - 50], [128, yb + 8], [150, yb]]), ...k.poly([[204, yb - 50], [226, yb + 8], [204, yb]]), ...k.poly([[163, yb + 6], [177, yb + 58], [191, yb + 6]]), ...k.poly([[170, yb + 8], [177, yb + 34], [184, yb + 8]])];   // the exhaust: a long V + a short inner V
    const F = FIG.fbdDot(k, 345, y + 290, [{ dir: [0, -1], len: 130, label: 'T' }, { dir: [0, 1], len: 86, label: 'mg' }]);
    figCount = sk.length + F.length;
    const Wl = [], L1 = ['mg = (2.0 × 10^5)(9.8)', 'mg = 1.96 × 10^6 N', 'ΣF = T - mg = ma', 'a = (3.0 - 1.96) × 10^6 / 2.0 × 10^5'];
    L1.forEach((s, i) => Wl.push(...k.text(s, 480, y + 168 + i * 56, { u: 23 })));
    const a = k.text('a = 5.2 m/s^2 up', 480, y + 168 + 4 * 56 + 8, { u: 26 });
    return [...sk, ...F, ...Wl, ...a, ...k.ring(a, { pad: 10 })]; } };
  const P2q = '2.  It is falling at 60 m/s. How far does it need to stop?';
  const P2a = { q: P2q, h: 1.6, fig: ({ k, y }) => { const l = k.text('d = v_0^2 / 2a = 3600 / 10.4', 124, y + 130, { u: 26 }), r = k.text('d = 346 m', 124, y + 196, { u: 28 }); return [...l, ...r, ...k.ring(r, { pad: 10 })]; } };
  const P2b = { q: P2q, h: 1.6, fig: ({ k, y }) => { const out = [], L2 = ['v^2 = v_0^2 - 2ad      (v = 0 when it stops)', '0 = (60)^2 - 2(5.2)d', '2(5.2)d = 3600', '10.4d = 3600', 'd = 3600 / 10.4'];
    L2.forEach((s, i) => out.push(...k.text(s, 124, y + 120 + i * 50, { u: 25 }))); const r = k.text('d = 346 m', 124, y + 120 + 5 * 50 + 8, { u: 28 }); return [...out, ...r, ...k.ring(r, { pad: 10 })]; } };
  const SHEET = (P2) => makeSheet(G, { rich: true, seed: 15, name: 'Vex', title: 'PHYS 1 · PROBLEM SET 6', note: 'Due Friday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 1', problems: [P1, P2] });
  const sheetA = SHEET(P2a), sheetB = SHEET(P2b);
  const p1Tot = sheetB.items.filter((it) => it.pi === 0).reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);
  const thumb = document.createElement('canvas'); thumb.width = 256; thumb.height = Math.round(256 * sheetA.h / sheetA.w); sheetA.draw(0, true); thumb.getContext('2d').drawImage(sheetA.canvas, 0, 0, thumb.width, thumb.height);

  // the phone on Vex's tripod (screen faces +z, toward the lens)
  const PW = 0.072, PH = 0.128, PHW = 720, PHH = 1280;
  const crisp = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const phT = crisp(PHW, PHH);
  { const body = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.008, PH + 0.012, 0.009), new THREE.MeshLambertMaterial({ color: 0x2a1a34 })); L.phone.add(body); }
  const phScr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.z = 0.0047; L.phone.add(phScr);
  const RED = '#9a1c25', SX = 30, SY = 330, SW = 660, SHh = Math.round(660 * sheetA.h / sheetA.w), KS = SW / sheetA.w;
  const nib = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); return c; })();
  const rr = (g, x, y, w, h, r, fill, stroke) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } };
  const header = (g, title) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, PHW, 100); g.drawImage(icon, 24, 26, 50, 50); g.fillStyle = '#1d1d1d'; g.font = '36px Georgia, serif'; g.fillText('Scribe', 86, 64);
    g.font = '500 21px Inter, Arial'; g.fillStyle = '#6b6b6b'; g.textAlign = 'right'; g.fillText(title, 696, 60); g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 100, PHW, 2); };
  const arrowBtn = (g, x, y, on, pressed) => { g.fillStyle = pressed ? '#5a0f16' : on ? RED : '#d8d2c6'; g.beginPath(); g.arc(x, y, 30, 0, 2 * PI); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y + 13); g.lineTo(x, y - 13); g.moveTo(x - 11, y - 3); g.lineTo(x, y - 14); g.lineTo(x + 11, y - 3); g.stroke(); };
  const tools = (g, y) => { g.strokeStyle = '#6b6b6b'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(70, y, 22, 0, 2 * PI); g.moveTo(60, y); g.lineTo(80, y); g.moveTo(70, y - 10); g.lineTo(70, y + 10); g.stroke();
    g.beginPath(); g.moveTo(118, y + 14); g.lineTo(136, y - 14); g.lineTo(144, y - 8); g.lineTo(126, y + 18); g.closePath(); g.stroke(); g.strokeRect(166, y - 15, 22, 30); };
  const typed = (s, a, b, t) => s.slice(0, Math.round(s.length * u01(t, a, b)));
  const TYPE1 = 'Physics HW 6, show your work', TYPE2 = 'show more steps on 2';
  const figW = sheetA.items.filter((it) => it.pi === 0).slice(0, figCount).reduce((s2, it) => s2 + (it.kind === 'p' ? it.w : 1), 0);
  const writeA = (t) => (t < T.fbd + 1.1 ? figW * u01(t, T.scribe + 0.1, T.fbd + 1.1) : figW + (sheetA.total - figW) * u01(t, T.fbd + 1.1, T.want - 0.1));   // sketch → FBD under the macro → the working flies
  const writeB = (t) => p1Tot + (sheetB.total - p1Tot) * u01(t, T.ask + 0.55, T.flip - 0.25);
  const scrollAt = (t) => (t < T.ask + 0.1 ? 170 * ease(u01(t, T.hand + 0.3, T.hand + 0.9)) : lerp(170, 1102, ease(u01(t, T.ask + 0.1, T.ask + 0.5))));
  let phKey = '';
  function drawPhone(t) {
    const home = t < T.friday + 0.15, round2 = t >= T.ask + 0.1;
    const pA = home ? 0 : writeA(t), pB = round2 ? writeB(t) : 0, s = home ? 0 : scrollAt(t);
    const ty1 = typed(TYPE1, T.your + 0.1, T.friday - 0.35, t), ty2 = round2 ? '' : typed(TYPE2, T.want + 0.3, T.ask - 0.05, t);
    const key = `${home}|${round2}|${Math.round(pA * 3)}|${Math.round(pB * 3)}|${Math.round(s)}|${ty1.length}|${ty2.length}|${Math.floor(t * 2) % 2}`;
    if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d');
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    if (home) {
      header(g, 'New assignment');
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we solving today?', 360, 360); g.textAlign = 'left';
      rr(g, 36, 420, 648, 360, 30, '#ffffff', 'rgba(0,0,0,.12)');
      rr(g, 60, 444, 360, 150, 18, '#f3efe6', 'rgba(0,0,0,.08)'); g.drawImage(thumb, 76, 458, 94, 122); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(76, 458, 94, 122);
      g.fillStyle = '#1d1d1d'; g.font = '600 24px Inter, Arial'; g.fillText('physics-hw6.jpg', 186, 504); g.fillStyle = '#6b6b6b'; g.font = '500 22px Inter, Arial'; g.fillText('1 page', 186, 540); g.fillText('×', 392, 474);
      g.fillStyle = '#1d1d1d'; g.font = '30px Georgia, serif'; g.fillText(ty1 + ((Math.floor(t * 2) % 2 && ty1.length < TYPE1.length) ? '|' : ''), 64, 660);
      tools(g, 726); arrowBtn(g, 626, 726, ty1.length > 0, t > T.friday - 0.2);
      phT.needsUpdate = true; return;
    }
    header(g, 'PHYS 1 · Problem Set 6');
    g.save(); g.beginPath(); g.rect(0, 102, PHW, 1000); g.clip(); g.translate(0, -s);
    // round 1: the prompt bubble (right), its row, its sheet
    rr(g, 250, 122, 446, 150, 26, '#e9e2d4'); g.drawImage(thumb, 270, 140, 86, 112); g.fillStyle = '#1d1d1d'; g.font = '27px Georgia, serif'; g.fillText('Physics HW 6,', 374, 186); g.fillText('show your work', 374, 224);
    const row = (y) => { g.font = '500 22px Inter, Arial'; g.fillStyle = '#6b6b6b'; g.fillText('1 page', 30, y); g.fillText('Shuffle', 370, y); g.fillText('Replay', 470, y); g.fillStyle = RED; g.font = '600 22px Inter, Arial'; g.fillText('Export PDF', 568, y); };
    row(306);
    const tipA = sheetA.draw(pA); g.fillStyle = '#fff'; g.fillRect(SX - 4, SY - 4, SW + 8, SHh + 8); g.drawImage(sheetA.canvas, SX, SY, SW, SHh); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(SX, SY, SW, SHh);
    if (!round2 && pA > 0 && pA < sheetA.total - 0.5) g.drawImage(nib, SX + tipA[0] * KS - 6, SY + tipA[1] * KS - 58, 64, 64);
    const Y2 = SY + SHh + 30;
    if (round2) {
      rr(g, 340, Y2, 356, 76, 26, '#e9e2d4'); g.fillStyle = '#1d1d1d'; g.font = '27px Georgia, serif'; g.fillText(TYPE2, 362, Y2 + 47);
      row(Y2 + 120);
      const tipB = sheetB.draw(pB), SY2 = Y2 + 140; g.fillStyle = '#fff'; g.fillRect(SX - 4, SY2 - 4, SW + 8, SHh + 8); g.drawImage(sheetB.canvas, SX, SY2, SW, SHh); g.strokeStyle = 'rgba(0,0,0,.15)'; g.strokeRect(SX, SY2, SW, SHh);
      if (pB < sheetB.total - 0.5) g.drawImage(nib, SX + tipB[0] * KS - 6, SY2 + tipB[1] * KS - 58, 64, 64);
    }
    g.restore();
    // the docked composer ("Ask Scribe")
    rr(g, 20, 1112, 680, 150, 30, '#ffffff', 'rgba(0,0,0,.12)');
    g.font = '30px Georgia, serif'; g.fillStyle = ty2 ? '#1d1d1d' : '#9a948a'; g.fillText(ty2 ? ty2 + (Math.floor(t * 2) % 2 && ty2.length < TYPE2.length ? '|' : '') : 'Ask Scribe', 48, 1166);
    tools(g, 1220); arrowBtn(g, 640, 1214, ty2.length > 0, t > T.ask - 0.15 && t < T.ask + 0.25);
    phT.needsUpdate = true;
  }
  // screen points (u, v) of the money shots
  const UV = (x, y) => [x / PHW, y / PHH];
  const uvFBD = UV(SX + 270 * KS, SY + (300 + 300) * KS), uvWork = UV(SX + 700 * KS, SY + (300 + 330) * KS);
  const uvP2B = UV(SX + 420 * KS, SY + SHh + 170 + (847 + 250) * KS - 1102);

  // ---------------------------------------------------------------- Vex
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const HIP_R = [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]];
  ARMS.upL = { L: [[0.55, 0.72, -0.22], [0.42, 0.86, -0.12]], R: HIP_R };   // her left arm up toward the tower (screen right)
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
    title: { lines: ['HOW TO CATCH A ROCKET', 'WITH CHOPSTICKS'], t0: 0, t1: T.tower - 0.05, y: 0.13, plain: true, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const ptxt = (s, color, x, y, sc = 1) => { const cv = pixelText(s, { color }); dctx.drawImage(cv, Math.round(x - cv.width * sc / 2), Math.round(y - cv.height * sc / 2), cv.width * sc, cv.height * sc); };
  const panel = (y0, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(18, y0, 234, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(16, y0 - 2, 238, 2); dctx.fillRect(16, y1, 238, 2); dctx.fillRect(16, y0, 2, y1 - y0); dctx.fillRect(252, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const rocketIcon = (x, y, s = 1, flame = 0) => { R('#c8ccd2', x, y + 4 * s, 6 * s, 30 * s); R('#e2e5ea', x + s, y + 4 * s, 2 * s, 30 * s); R('#c8ccd2', x + s, y + 2 * s, 4 * s, 2 * s); R('#c8ccd2', x + 2 * s, y, 2 * s, 2 * s); R('#3a3e45', x, y + 6 * s, 6 * s, s); R('#3a3e45', x - s, y + 8 * s, s, 3 * s); R('#3a3e45', x + 6 * s, y + 8 * s, s, 3 * s);
    if (flame) { R('#ff9a3a', x + s, y + 34 * s, 4 * s, 3 * s * flame); R('#ffe08a', x + 2 * s, y + 34 * s, 2 * s, 2 * s * flame); } };
  const armsIcon = (x, y, s = 1) => { R('#5a606a', x - 12 * s, y, 8 * s, 2 * s); R('#5a606a', x + 10 * s, y, 8 * s, 2 * s); R('#f2c230', x - 5 * s, y, 2 * s, 2 * s); R('#f2c230', x + 9 * s, y, 2 * s, 2 * s); };
  let dgKey = '';
  function diagram(t) {
    let id = null, k = 0;
    if (t >= T.s72 - 0.05 && t < T.t33 - 0.1) { id = 'tall'; k = u01(t, T.s72, T.s72 + 0.9); }
    else if (t >= T.three - 0.1 && t < T.ship) { id = 'three'; k = u01(t, T.three - 0.05, T.three + 0.75); }
    else if (t >= T.circles && t < T.then) { id = 'orbits'; k = u01(t, T.circles + 0.1, T.times + 0.4); }
    else if (t >= T.end && t < T.ill) { id = 'loop'; k = t < T.refuel ? 0 : t < T.fly ? 1 : 2; }
    const key = id ? `${id}${Math.round(k * 40)}${id === 'orbits' ? Math.round(t * 12) : ''}` : 'none'; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480); if (!id) return;
    dctx.save(); dctx.translate(0, 96);   // the cards sit low (y ≈ 0.41–0.69): above them her face stays clear
    if (id === 'tall') { panel(90, 226); ptxt('72 M', '#ffd43b', 80, 103); ptxt('20 FLOORS', '#ffffff', 186, 103);
      const h = Math.round(100 * ease(k)); R('#c8ccd2', 68, 218 - h, 24, h); R('#e2e5ea', 72, 218 - h, 5, h); if (h > 10) { R('#3a3e45', 68, 218 - h + 5, 24, 3); R('#3a3e45', 62, 218 - h + 8, 6, 8); R('#3a3e45', 92, 218 - h + 8, 6, 8); }
      const f = Math.round(20 * ease(clamp(k * 1.2))); for (let i = 0; i < f; i++) { const y = 213 - i * 5; R(i % 2 ? '#6a6f8a' : '#5f6480', 156, y, 60, 5); for (let w = 0; w < 5; w++) R(hash(i * 5 + w) > 0.4 ? '#ffd88a' : '#2a2a3a', 160 + w * 11, y + 1, 6, 3); }
      R('#f2e6ff', 40, 219, 190, 2); }
    if (id === 'three') { panel(90, 226); ptxt('3 CATCHES', '#ffd43b', 135, 104);
      ['OCT 24', 'JAN 25', 'MAR 25'].forEach((d, i) => { if (k < i * 0.33) return; const x = 60 + i * 75; rocketIcon(x, 120, 1); armsIcon(x + 3, 148); ptxt(d, '#ffffff', x + 3, 180); });
      ptxt('ALL BY THE ARMS', '#7cf05f', 135, 208); }
    if (id === 'orbits') { panel(90, 226); const cx = 135, cy = 162;
      for (let y = -34; y <= 34; y++) for (let x = -34; x <= 34; x++) if (x * x + y * y <= 34 * 34) R((hash(Math.floor((x + 50) / 5) * 31 + Math.floor((y + 50) / 5)) > 0.62) ? '#5fae5a' : '#3a78c8', cx + x, cy + y, 1, 1);
      for (let i = 0; i < 64; i++) { const a = (i / 64) * 2 * PI; R('#f2e6ff', cx + Math.cos(a) * 58, cy + Math.sin(a) * 20, 1, 1); }
      const n = Math.min(14, 1 + Math.floor(k * 14)), a = k * 14 * 2 * PI; const sx = cx + Math.cos(a) * 58, sy = cy + Math.sin(a) * 20; if (Math.sin(a) < 0 || Math.abs(Math.cos(a)) > 0.6) R('#ffd43b', sx - 2, sy - 2, 5, 5);
      ptxt(`ORBIT ${n}`, '#ffd43b', cx, 103); ptxt('THEN COME HOME', '#ffffff', cx, 212); }
    if (id === 'loop') { panel(90, 226); const L3 = [['CATCH', 60], ['REFUEL', 135], ['FLY', 210]];
      L3.forEach(([s, x], i) => { const on = i <= k; dctx.globalAlpha = on ? 1 : 0.35; if (i === 0) { rocketIcon(x, 112, 1); armsIcon(x + 3, 140); } if (i === 1) { R('#58c8ff', x - 6, 130, 14, 14); R('#58c8ff', x - 3, 123, 8, 7); R('#58c8ff', x, 118, 2, 5); R('#1a1424', x - 2, 134, 3, 4); }
        if (i === 2) rocketIcon(x, 104, 1, 1); ptxt(s, i === k ? '#ffd43b' : '#ffffff', x + 3, 182); dctx.globalAlpha = 1;
        if (i < 2) { R('#f2e6ff', x + 22, 140, 22, 2); R('#f2e6ff', x + 40, 136, 2, 10); } });
      ptxt('THE WHOLE POINT', '#7cf05f', 135, 208); }
    dctx.restore();
  }

  // ---------------------------------------------------------------- rocket choreography helpers (C = catch point; arms reach +x from the tower)
  const BOOST_CAUGHT = (armY) => armY + 2.25 - 62.5, SHIP_CAUGHT = (armY) => armY + 2.25 - 33.55;
  const qS = new THREE.Quaternion(), cgOff = V();
  function placeShip(cg, rotZ) { ship.cg = cg.clone(); ship.g.rotation.set(0, 0, rotZ); qS.setFromEuler(ship.g.rotation); cgOff.set(0, ship.cgY, 0).applyQuaternion(qS); ship.g.position.copy(cg).sub(cgOff); }
  const ST = {
    stack(t) { booster.g.visible = ship.g.visible = true; booster.g.position.set(C.x, D.mountY, C.z); ship.g.position.set(C.x, D.mountY + 72, C.z); ship.g.rotation.set(0, 0, 0); tower.setArmY(80); tower.setArms(1); },
    boosterCaught() { booster.g.visible = true; ship.g.visible = false; booster.g.position.set(C.x, BOOST_CAUGHT(88), C.z); tower.setArmY(88); tower.setArms(0); },
    shipCaught() { ship.g.visible = true; booster.g.visible = false; placeShip(V(C.x, SHIP_CAUGHT(70) + ship.cgY, C.z), 0); tower.setArmY(70); tower.setArms(0); },
  };
  // the booster's last 3 s (fall → brake → slide in): y of its engine plane over the pad
  const boosterY = (t) => {
    if (t < T.brakes) return lerp(1650, 520, u01(t, T.falls - 0.2, T.brakes));
    if (t < T.slides) return lerp(520, 150, u01(t, T.brakes, T.slides));
    return lerp(150, BOOST_CAUGHT(88), eOut(u01(t, T.slides, T.armsB)));
  };
  const shipCG = (t) => {   // the ship's centre over the pad during the belly flop, flip and catch
    if (t < T.flips) { const u = u01(t, T.flip - 0.1, T.flips); return [V(C.x - 160 + 140 * u, lerp(1150, 430, u), C.z), -PI / 2]; }
    if (t < T.fand) { const u = u01(t, T.flips, T.fand); return [V(C.x - 20 + 20 * ease(u), lerp(430, 260, u), C.z), -PI / 2 + (PI / 2) * ease(u)]; }
    const u = eOut(u01(t, T.fand, T.fcatch)); return [V(C.x, lerp(260, SHIP_CAUGHT(70) + ship.cgY, u), C.z), 0];
  };

  // ---------------------------------------------------------------- shots
  const aimCam = (pos, yaw, pitch, fov) => { const d = V(-Math.sin(yaw * DEG) * Math.cos(pitch * DEG), Math.sin(pitch * DEG), -Math.cos(yaw * DEG) * Math.cos(pitch * DEG)); return { pos, look: [pos[0] + d.x * 10, pos[1] + d.y * 10, pos[2] + d.z * 10], fov }; };
  const VA = { x: 0, z: 0 };
  const SH = [
    { id: 'hook', t0: 0, set: 'beach', rk: ST.stack, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: 'hip', tilt: 0.08, sway: 0.15, face: CONF(t) }),
      cam: (t) => aimCam([0.95, 0.7, 2.55 - 0.25 * u01(t, 0, T.with)], 15.5, 6, 56) },
    { id: 'chop', t0: T.with - 0.05, set: 'beach', sun: [C.x - 10, C.z, 60], rk: (t) => { ST.stack(t); tower.setArms(0.25 + 0.75 * Math.abs(Math.cos((t - T.with) * 3.4))); },
      cam: (t) => ({ pos: [C.x + 2, 250 - 14 * u01(t, T.with, T.tower), C.z + 28], look: [C.x - 4, 85, C.z], fov: 30 }) },
    { id: 'towerUp', t0: T.tower, set: 'beach', sun: [D.tower[0], D.tower[1], 80], rk: ST.stack,
      cam: (t) => { const k = ease(u01(t, T.tower, T.its)); return { pos: [D.tower[0] + 26, 3, D.tower[1] + 30], look: [D.tower[0] - 2, 60 + 50 * k, D.tower[1]], fov: 62 }; } },
    { id: 'point', t0: T.its - 0.05, set: 'beach', rk: ST.stack, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: t > T.its + 0.15 ? 'upL' : 'hip', hands: { L: 'point' }, tilt: -0.06, turn: -0.15, sway: 0.12, face: CONF(t) }),
      cam: (t) => aimCam([1.3, 0.62, 2.3 - 0.15 * u01(t, T.its, T.chop2)], 21, 9, 58) },
    { id: 'topDown', t0: T.chop2 - 0.05, set: 'beach', sun: [C.x, C.z, 60], rk: (t) => { booster.g.visible = ship.g.visible = false; tower.setArmY(90); tower.setArms(1 - ease(u01(t, T.chop2, T.chop2 + 0.6))); },
      cam: (t) => ({ pos: [C.x, 210 - 20 * u01(t, T.chop2, T.booster), C.z + 8], look: [C.x - 1, 90, C.z], fov: 28 }) },
    { id: 'stack', t0: T.booster, set: 'beach', sun: [C.x, C.z, 80], rk: (t) => { ST.stack(t); ship.g.position.y += 14 * ease(u01(t, T.half - 0.1, T.half + 0.6)); },
      cam: (t) => { const k = u01(t, T.booster, T.s72); return { pos: [C.x + 120 - 12 * k, 40, C.z + 250], look: [C.x, 92, C.z], fov: 42 }; } },
    { id: 'tall', t0: T.s72 - 0.05, set: 'beach', rk: ST.stack, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: 'hip', tilt: -0.08, sway: 0.15, nod: 0.03, face: CONF(t) }),
      cam: (t) => aimCam([0.35, 1.0, 2.0 - 0.15 * u01(t, T.s72, T.t33)], 9, 5, 52) },
    { id: 'engines', t0: T.t33 - 0.1, set: 'beach', sun: [C.x, C.z, 40], rk: ST.stack,
      cam: (t) => { const a = 0.4 + 0.5 * u01(t, T.t33, T.falls); return { pos: [C.x + Math.cos(a) * 2.2, 6.5, C.z + Math.sin(a) * 2.2], look: [C.x, 30, C.z], fov: 64 }; } },
    { id: 'fall', t0: T.falls - 0.06, set: 'beach', sun: [C.x, C.z, 200], rk: (t) => { booster.g.visible = true; ship.g.visible = false; booster.g.position.set(C.x, boosterY(t), C.z); tower.setArmY(88); tower.setArms(1); },
      cam: (t) => { const y = boosterY(t); return { pos: [C.x - 34, y + 72, C.z + 40], look: [C.x, y - 40, C.z], fov: 54 }; } },
    { id: 'brake', t0: T.brakes - 0.04, set: 'beach', sun: [-2, -8, 16], rk: (t) => { booster.g.visible = true; ship.g.visible = false; booster.g.position.set(C.x, boosterY(t), C.z); tower.setArmY(88); tower.setArms(1); },
      cam: (t) => ({ pos: [-1.05, 0.95, -6.6], look: [C.x, Math.max(170, boosterY(t) - 30), C.z], fov: 32 }) },
    { id: 'catchB', t0: T.slides - 0.04, set: 'beach', sun: [C.x, C.z, 60], kick: () => T.armsB,
      rk: (t) => { booster.g.visible = true; ship.g.visible = false; booster.g.position.set(C.x, boosterY(t), C.z); tower.setArmY(88); tower.setArms(1 - ease(u01(t, T.armsB - 0.55, T.armsB))); },
      cam: (t) => ({ pos: [C.x + 62, 70, C.z + 68], look: [C.x - 2, 82 - 6 * u01(t, T.slides, T.catches), C.z], fov: 46 }) },
    { id: 'three', t0: T.catches, set: 'beach', rk: ST.boosterCaught, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: t > T.three - 0.1 ? 'shades' : 'hip', tilt: 0.1, sway: 0.15, face: CONF(t, { happy: t > T.three ? 0.25 : 0 }) }),
      cam: (t) => aimCam([-0.3, 0.75, 2.3 - 0.15 * u01(t, T.catches, T.ship)], 4, 8, 54) },
    { id: 'topHalf', t0: T.ship, set: 'beach', sun: [C.x, C.z, 80], rk: ST.stack,
      cam: (t) => { const k = ease(u01(t, T.ship, T.circles)); return { pos: [C.x + 58, 70 + 55 * k, C.z + 92], look: [C.x, 92 + 26 * k, C.z], fov: 42 }; } },
    { id: 'orbit', t0: T.circles - 0.05, set: 'space', rk: (t) => { const x = -60 + 40 * u01(t, T.circles, T.then); booster.g.visible = false; ship.g.visible = true; placeShip(V(TOP.x + x, TOP.y + 2500, TOP.z), -PI / 2); },
      cam: (t) => { const p = ship.g.position, k = u01(t, T.circles, T.then); return { pos: [p.x - 50 + 20 * k, p.y + 34, p.z + 84], look: [p.x + 26, p.y - 24, p.z], fov: 48 }; } },
    { id: 'reentry', t0: T.then - 0.05, set: 'space', rk: (t) => { booster.g.visible = false; ship.g.visible = true; placeShip(V(TOP.x + 40 * u01(t, T.then, T.pivot), TOP.y + 820, TOP.z), -PI / 2 + 0.72); },
      cam: (t) => { const p = ship.cg, k = u01(t, T.then, T.pivot); return { pos: [p.x + 62 - 8 * k, p.y + 8, p.z + 80 - 6 * k], look: [p.x + 2, p.y - 22, p.z], fov: 50 }; } },
    { id: 'ambitious', t0: T.pivot, set: 'beach', rk: ST.boosterCaught, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: 'cross', tilt: -0.1, sway: 0.1, face: CONF(t, { relaxed: 0.2 }) }),
      cam: (t) => aimCam([0.8, 0.85, 2.0 - 0.12 * u01(t, T.pivot, T.your)], 17, 7, 50) },
    { id: 'phoneHome', t0: T.your - 0.04, set: 'beach', phone: 'home' },
    { id: 'cute', t0: T.cute - 0.08, set: 'beach', rk: ST.boosterCaught, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: 'shh', tilt: 0.12, sway: 0.1, face: CONF(t, { relaxed: 0.24, blinkLeft: t > T.cute + 0.2 ? 1 : 0 }) }),
      cam: (t) => aimCam([0.35, 1.25, 1.25], 12, 4, 44) },
    { id: 'write', t0: T.scribe, set: 'beach', phone: 'full' },
    { id: 'fbd', t0: T.fbd - 0.06, set: 'beach', phone: 'fbd' },
    { id: 'hand', t0: T.hand - 0.04, set: 'beach', phone: 'work' },
    { id: 'ask', t0: T.want - 0.05, set: 'beach', phone: 'ask' },
    { id: 'rewrite', t0: T.it - 0.05, set: 'beach', phone: 'p2' },
    { id: 'belly', t0: T.flip, set: 'beach', sun: [C.x, C.z, 300], rk: (t) => { booster.g.visible = false; ship.g.visible = true; const [cg, rz] = shipCG(t); placeShip(cg, rz); tower.setArmY(70); tower.setArms(1); },
      cam: (t) => { const [cg] = shipCG(t); return { pos: [cg.x + 12, cg.y - 10, cg.z + 150], look: [cg.x + 6, cg.y - 18, cg.z], fov: 46 }; } },
    { id: 'flipS', t0: T.flips - 0.05, set: 'beach', sun: [-2, -8, 16], rk: (t) => { booster.g.visible = false; ship.g.visible = true; const [cg, rz] = shipCG(t); placeShip(cg, rz); tower.setArmY(70); tower.setArms(1); },
      cam: (t) => ({ pos: [2.6, 0.9, -7.4], look: [C.x, lerp(300, 230, u01(t, T.flips, T.fand)), C.z], fov: 46 }) },
    { id: 'catchS', t0: T.fand - 0.04, set: 'beach', sun: [C.x, C.z, 60], kick: () => T.fcatch,
      rk: (t) => { booster.g.visible = false; ship.g.visible = true; const [cg, rz] = shipCG(t); placeShip(cg, rz); tower.setArmY(70); tower.setArms(1 - ease(u01(t, T.fcatch - 0.5, T.fcatch))); },
      cam: (t) => ({ pos: [C.x + 60, 56, C.z + 70], look: [C.x - 2, 68 - 4 * u01(t, T.fand, T.end), C.z], fov: 48 }) },
    { id: 'loop', t0: T.end, set: 'beach', rk: ST.shipCaught, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: 'hip', tilt: 0.06, sway: 0.15, face: CONF(t) }),
      cam: (t) => aimCam([0.95, 0.72, 2.6 - 0.2 * u01(t, T.end, T.ill)], 15.5, 6, 56) },
    { id: 'wink', t0: T.ill - 0.05, set: 'beach', rk: ST.shipCaught, sun: [0, -2, 12], vex: (t) => ({ ...VA, pose: t > T.beach - 0.15 ? 'kissOut' : 'hip', tilt: -0.1, sway: 0.15, face: CONF(t, { blinkLeft: t > T.beach + 0.1 ? 1 : 0, happy: t > T.beach + 0.1 ? 0.2 : 0 }) }),
      cam: (t) => aimCam([0.6, 0.95, 1.75 - 0.25 * u01(t, T.ill, T.card + 2)], 13, 7, 50) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;
  const MCUTS = SH.slice(1).filter((s2, i) => !(s2.phone && SH[i].phone)).map((s2) => s2.t0);   // phone → phone = a hard cut (a mosaic swell turned the short macros into pixel mush)

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const phoneCam = (u, v, d) => { phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const PHONE = {
    home: (t) => phoneCam(0.5, 0.48, 0.2 - 0.02 * u01(t, T.your, T.cute)),
    full: (t) => phoneCam(0.5, 0.52, 0.2 - 0.02 * u01(t, T.scribe, T.fbd)),
    fbd: (t) => phoneCam(lerp(0.5, uvFBD[0], ease(u01(t, T.fbd - 0.06, T.fbd + 0.4))), lerp(0.52, uvFBD[1], ease(u01(t, T.fbd - 0.06, T.fbd + 0.4))), 0.085),
    work: (t) => phoneCam(uvWork[0], uvWork[1] - 0.08 * u01(t, T.hand, T.want), 0.105),
    ask: (t) => phoneCam(0.5, lerp(0.7, 0.79, ease(u01(t, T.want, T.want + 0.5))), 0.16),
    p2: (t) => phoneCam(uvP2B[0], uvP2B[1], 0.12),
  };

  const SPEC = L.people;
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const space = sh.set === 'space';
    L.root.visible = !space; SP.root.visible = space; scene.fog = space ? null : (sh.id === 'fall' || sh.id === 'belly') ? highFog : beachFog;
    booster.g.visible = false; ship.g.visible = false; bPlume.set(0); sPlume.set(0); steam.hide(); plasma.hide(); sky.hide();
    // the rockets (an empty tower when a shot has none)
    if (sh.rk) sh.rk(t); else { ST.boosterCaught(); if (t < T.catches) ST.stack(t); }
    if (space) { qTmp.setFromAxisAngle(Z, 0.004 * (t - T.circles) + (t >= T.then ? 0.02 : 0)); SP.spin.quaternion.copy(qTmp).multiply(spinBase); }
    // engines: the booster's landing burn + the ship's flip burn; steam at the mount; plasma on reentry
    if (sh.id === 'brake' || sh.id === 'catchB') { const k = t < T.armsB - 0.1 ? 1 : clamp(1 - (t - T.armsB + 0.1) / 0.3); bPlume.set(k * (t < T.slides ? 1 : 0.6), t < T.slides ? 48 : 26, t < T.slides ? 4.2 : 2.4, t); }
    if (sh.id === 'engines') { for (let i = 0; i < 33; i++) { const ring = i < 3 ? 0 : i < 13 ? 1 : 2, on = ease(u01(t, T.t33 + ring * 0.22, T.t33 + ring * 0.22 + 0.25)); eGlow.setColorAt(i, colTmp.setRGB(2.4 * on, 1.3 * on, 0.5 * on)); } eGlow.instanceColor.needsUpdate = true; eGlow.visible = true; } else eGlow.visible = false;
    if ((sh.id === 'flipS' || sh.id === 'catchS') && t > T.flips + 0.25) { const k = t < T.fcatch - 0.05 ? 1 : clamp(1 - (t - T.fcatch + 0.05) / 0.3); sPlume.set(k, 22, 2.6, t); }
    const steamAt = (t0, n0) => { const a = t - t0; if (a < -0.4 || a > 3) return; for (let i = 0; i < 22; i++) { const ang = hash(i + n0) * 2 * PI, r = 8 + hash(i * 3 + n0) * 18 + Math.max(0, a) * 6, life = clamp(1 - Math.max(0, a) / 3) * clamp((a + 0.4) / 0.4); steam.set(i + n0, V(C.x + Math.cos(ang) * r, 4 + hash(i * 7) * 14 + Math.max(0, a) * 3, C.z + Math.sin(ang) * r), 14 + hash(i * 5) * 16 + a * 6, 0.85 * life); } };
    if (sh.id === 'brake' || sh.id === 'catchB' || sh.id === 'three') steamAt(T.slides - 0.2, 0);
    if (sh.id === 'catchS' || sh.id === 'loop') steamAt(T.fand + 0.2, 22);
    if (sh.id === 'fall') for (let i = 0; i < 10; i++) { const y = 720 + i * 46, a = hash(i) * 2 * PI, r = 30 + hash(i * 9) * 50; sky.set(i, V(C.x + Math.cos(a) * r, y, C.z + Math.sin(a) * r * 0.5 + 20), 60 + hash(i * 4) * 60, 0.8); }
    if (sh.id === 'reentry') { ship.g.updateMatrixWorld(true); const cA = new THREE.Color(1.0, 0.55, 0.25), cB = new THREE.Color(1.0, 0.3, 0.7), k = clamp(u01(t, T.then, T.then + 0.6));
      for (let i = 0; i < 46; i++) { const along = hash(i) * 52, side = (hash(i * 3) - 0.5) * 7, out = 5.5 + hash(i * 5) * 4 + (i > 30 ? 12 + (i - 30) * 3 : 0);
        const p = ship.g.localToWorld(V(out, along, side)); if (i > 30) p.x -= (i - 30) * 6; const fl = 0.75 + 0.25 * Math.sin(t * 31 + i * 1.7);
        plasma.set(i, p, (i > 30 ? 22 : 10 + hash(i * 7) * 8) * fl, k * (i > 30 ? 0.5 : 0.9), i % 3 ? cA : cB); } }
    // camera (+ a hard kick when the arms close)
    let cam = sh.phone ? PHONE[sh.phone](t) : sh.cam(t);
    if (sh.kick) { const a = t - sh.kick(); if (a > 0 && a < 0.45) { const s = (1 - a / 0.45) ** 2 * 1.1; cam = { ...cam, pos: [cam.pos[0] + Math.sin(a * 71) * s, cam.pos[1] + Math.sin(a * 53 + 1) * s, cam.pos[2]] }; } }
    studio.camera.near = sh.phone ? 0.02 : space ? 1 : 0.08; studio.camera.far = space ? 70000 : 2800; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, sh.phone ? 0.0004 : 0.004);
    // the sky darkens toward the edge of space
    L.sky.material.color.setRGB(1, 1, 1).lerp(colTmp.setRGB(0.42, 0.46, 0.75), clamp((studio.camera.position.y - 300) / 1300));
    if (sh.sun) L.aim(sh.sun[0], sh.sun[1], sh.sun[2]);
    { const tg = V(...cam.look), d = Math.max(0.6, studio.camera.position.distanceTo(V(0, 1.3, 0))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.4, 0.22 * Math.pow(d, 1.6)) : 0; void tg; }
    VEX.root.visible = !!sh.vex && !space;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); }
    // the crowd: phones up, a cheer when the arms close
    const cheer = (t > T.armsB + 0.15 && t < T.armsB + 2.6) || (t > T.fcatch + 0.15 && t < T.fcatch + 3);
    if (!space) for (const s of SPEC) { const w = Math.sin(t * 2 + s.i), ch = cheer && s.i % 3 !== 2;
      s.p.pose({ x: s.x, z: s.z, rotY: s.ry, armR: ch ? { x: -0.25, z: 2.6 + 0.15 * w, bend: 0 } : s.arm === 'phone' ? { x: -1.05 + 0.04 * w, z: -0.32, bend: -0.75 } : s.arm ?? 'down', armL: ch ? { x: -0.25, z: 2.5 - 0.15 * w, bend: 0 } : 'down', head: { yaw: 0.1 * Math.sin(t * 0.7 + s.i) } }); }
    L.update(t);
    if (sh.phone || (t >= T.your - 0.1 && t < T.flip)) drawPhone(t);
    diagram(t);
    pixel.set(Math.max(sh.phone ? 1 : PIXEL, mosaicAt(t, MCUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
