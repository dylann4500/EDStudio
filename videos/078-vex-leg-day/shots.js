// 078 — "What one leg day does to your body, hour by hour" (Scribe lane, Vex EXPLAINER, anime/pixel look). Manager brief (Nov 9):
// a Vex explainer in 076's style, lane = the gym / the body (siblings: 079 = this week's news, 080 = Thanksgiving).
//   format  = an HOUR-BY-HOUR explainer with an HUD that moves through time (HOUR 0 → 1 → 24 → 48 → 72 → DAY 7) + a soreness meter;
//   place   = IRON MOON 24/7, a gym at night (NEW set engine/sets/nightgym.js: three power racks on platforms, a mirror wall + an instanced
//             dumbbell rack, kettlebells, plate tree, plyo boxes, med balls, a punching bag, a cable stack, steel stairs to a cardio
//             mezzanine with treadmills, the front desk with made-up tubs GRRR / KAPOW / MOONDUST, a pink LEG DAY neon, night windows) +
//             the same gym the next morning (setMode('morning'): morning windows, warmer light);
//   facts   = (sources in caption.md's comment) eccentric (lengthening) contractions cause microscopic muscle-fibre damage and DOMS;
//             lactic acid isn't the cause: lactate is back to resting levels within about an hour, long before DOMS starts; DOMS starts
//             12–24 h after, peaks 24–72 h, fades by 5–7 days; protein synthesis is up +112 % at 3 h, +65 % at 24 h, +34 % at 48 h
//             (Phillips et al. 1997, untrained, fasted); one bout protects against the next for weeks (repeated bout effect: ~50 % less
//             strength loss after one session + 2 weeks' rest; Nosaka et al. 2005: most measures protected ≥ 6 months);
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated): a side-view leg whose quad lengthens as she
//             squats, muscle fibres tearing, blood lactate back to baseline by +1 h, the soreness curve (24–72 h band), protein-synthesis
//             bars, first vs next leg day + the HUD (HOUR / DAY + a 5-block soreness meter);
//   Scribe  = a feature not shown before: DARK MODE (README §Dark mode: the account menu's first row, Theme = sun / moon / screen; the
//             handwritten pages are paper and never themed, on the dark desk a page gets a hairline edge). She types the A&P lab into the
//             composer, sends, opens the drawer (README §The workspace: on a phone the sidebar is a drawer, ☰), taps the moon, and the page
//             WRITES ITSELF ON THE PHONE SCREEN on the dark desk with an on-screen pen cursor, ending on the hand-drawn repair cycle
//             (README §Biology: Anatomy & physiology class; flowcharts / cycles "joined by freehand bowed arrows").
//   persona = the lighter 071–076 tone: confident, teasing ("Cute.", "I'll know."); Fish "Mommy" with the less-breathy settings.
// Guardrails: no real brands (our own gym/tubs), swimwear only, no kink lines, no promises, no medical advice beyond sourced facts.
// Props rule (Nov 9): the shaker rides her LEFT hand bone (attached at build in the hold pose: axis along the knuckle line, centre in the
// palm, forearm-twist search per arm preset as 076's can), so it can never float; off-hand it stands on the bench (cuts only).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet, layoutHand } from '@engine/build/scribe.js';
import { makeVoxPerson } from '@engine/voxel/person.js';
import { buildNightGym } from '@engine/sets/nightgym.js';

const PI = Math.PI, PIXEL = 4, SIDE_DBG = false;   // SIDE_DBG: a side view of her shaker hand for the props check
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const soreAt = (h) => (h < 8 ? 0 : h < 48 ? Math.pow(Math.sin(((h - 8) / 40) * PI / 2), 1.6) : Math.exp(-Math.pow((h - 48) / 52, 2)));   // DOMS shape: 0 → peak 24–72 h → ~0 by day 6

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
    here: W('hook', 'heres'), body: W('hook', 'body'), squat: B.squat.t0, squats: W('squat', 'squats'), every: W('squat', 'every'), down: W('squat', 'down'),
    stretch: W('squat', 'stretch'), load: W('squat', 'load'), tears: B.tears.t0, micro: W('tears', 'microscopic'), fibers: W('tears', 'fibers'), totally: W('tears', 'totally'),
    myth: B.myth.t0, not: W('myth', 'not'), thats: W('myth', 'thats'), hour1: W('myth', 'hour'), peak: B.peak.t0, peaks: W('peak', 'peaks'), three: W('peak', 'three'),
    stairs: W('peak', 'stairs'), good: W('peak', 'good'), pivot: B.pivot.t0, sit: W('pivot', 'sit'), downP: W('pivot', 'down'), anatomy: W('pivot', 'anatomy'), cute: W('pivot', 'cute'),
    scribe: B.scribe.t0, dark: W('scribe', 'dark'), obviously: W('scribe', 'obviously'), hand: W('scribe', 'handwriting'), diagram: W('scribe', 'diagram'),
    rebuild: B.rebuild.t0, protein: W('rebuild', 'protein'), two: W('rebuild', 'two'), rebuilding: W('rebuild', 'rebuilding'),
    bout: B.bout.t0, next: W('bout', 'next'), hurt: W('bout', 'hurt'), one: W('bout', 'one'), protects: W('bout', 'protects'), weeks: W('bout', 'weeks'),
    end: B.end.t0, skip: W('end', 'skip'), ill: W('end', 'ill'), know: W('end', 'know'),
  };
  T.card = T.know + 0.55; T.send = T.dark - 0.68; T.tap = T.dark + 0.06; T.page = T.obviously + 0.15;

  // ---------------------------------------------------------------- the gym
  const GYM = buildNightGym(studio), GD = GYM.D;
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (shadow) o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };

  // the shaker bottle (IRON MOON pink; a flip cap + a carry loop); one held, one on the bench for the shots where her hands are busy
  const SH_R = 0.038, SH_H = 0.19;
  const shLabel = crisp(256, 128, (g, w, h) => { g.fillStyle = '#ff4fa3'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 10, w, 4); g.fillStyle = '#16161a'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const x of [64, 192]) { g.beginPath(); g.arc(x - 44, 64, 13, 0.6, 5.2); g.lineWidth = 6; g.strokeStyle = '#16161a'; g.stroke(); g.fillText('IRON', x + 8, 50); g.fillText('MOON', x + 8, 82); }
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 100; y < 124; y += 6) g.fillRect(0, y, w, 1); });
  function makeShaker() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(SH_R, SH_R * 0.93, SH_H, 20), [new THREE.MeshToonMaterial({ map: shLabel, emissive: 0x200810 }), toon(0x16161a), toon(0x16161a)]); body.castShadow = true; g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(SH_R * 1.04, SH_R * 1.04, 0.034, 20), toon(0x16161a)); cap.position.y = SH_H / 2 + 0.017; g.add(cap);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.02, 10), toon(0x16161a)); spout.position.set(0, SH_H / 2 + 0.044, 0.018); g.add(spout);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 14, PI), toon(0x16161a)); loop.position.set(0, SH_H / 2 + 0.034, -0.02); loop.rotation.y = PI / 2; g.add(loop);
    return g;
  }
  const benchShaker = makeShaker(); benchShaker.position.set(GD.benches[0].x - 0.42, GD.benchTop + SH_H / 2, GD.benches[0].z + 0.03); GYM.root.add(benchShaker);

  // ---------------------------------------------------------------- extras (voxel gym-goers: life in every wide, never between the lens and her)
  const ppl = {};
  const mkP = (key, o) => { const P = makeVoxPerson({ height: 1.72, shoes: 0x26282c, sleeves: 'short', ...o }); GYM.root.add(P.root); ppl[key] = P; return P; };
  const E1 = mkP('goblet', { skin: 0xc98e66, hair: 0x1d1d22, hairStyle: 'buzz', top: 'tee', shirt: 0x3c6fd8, pants: 0x26282c });
  const kb = new THREE.Group(); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), toon(0xd8333a)); b.position.y = -0.1; kb.add(b); const h = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 6, 12, PI), toon(0x1c1c20)); h.position.y = 0.0; kb.add(h); } E1.hand.R.add(kb); kb.position.set(0.12, -0.02, 0.06);
  const E2 = mkP('curl', { skin: 0xf1c8a4, hair: 0xc89b52, hairStyle: 'ponytail', top: 'vest', shirt: 0xf09ab8, pants: 0x2a3b6e, height: 1.66 });
  const db = new THREE.Group(); { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8), toon(0xd0d4dc)); h.rotation.z = PI / 2; db.add(h); for (const s of [-1, 1]) { const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), toon(0x1c1c20)); hd.rotation.z = PI / 2; hd.position.x = s * 0.1; db.add(hd); } } E2.hand.R.add(db);
  const E3 = mkP('run1', { skin: 0x7d4f33, hair: 0x1d1d22, hairStyle: 'afro', top: 'tee', shirt: 0x56b04a, pants: 0x26282c });
  const E4 = mkP('run2', { skin: 0xe0ac86, hair: 0x6b4325, hairStyle: 'bun', top: 'vest', shirt: 0x8a55c9, pants: 0x34405c, height: 1.64 });
  const E5 = mkP('desk', { skin: 0xa8714d, hair: 0x2a1c14, hairStyle: 'cap', cap: 0x16161a, top: 'tee', shirt: 0x16161a, pants: 0x26282c });
  const E6 = mkP('bro', { skin: 0xe0ac86, hair: 0x3a2618, hairStyle: 'messy', top: 'hoodie', shirt: 0x5a6270, pants: 0x26282c, height: 1.8 });
  const bphone = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.01), toon(0x16161a)); E6.hand.R.add(bphone); bphone.position.set(0, -0.04, 0.05); bphone.rotation.x = 0.4;
  function poseExtras(t) {
    const g = (t % 2.6) / 2.6, dip = Math.sin(g * PI) ** 1.3;                    // goblet squats in the left rack
    E1.pose({ x: GD.racks[0].x, z: -4.45, rotY: 0.15, crouch: 0.85 * dip, lean: 0.25 * dip, armL: { x: -1.25, z: -0.15, bend: -1.5 }, armR: { x: -1.25, z: -0.15, bend: -1.5 }, face: dip > 0.6 ? 'scream' : 'idle', head: { pitch: -0.1 * dip } });
    const c = 0.5 - 0.5 * Math.cos(t * 2.3);                                      // curls by the mirror
    E2.pose({ x: -5.15, z: -3.0, rotY: PI / 2 - 0.25, armR: { x: -0.2, z: 0.05, bend: -0.25 - 1.9 * c }, armL: { x: 0.05, z: 0.08, bend: -0.2 }, face: c > 0.8 ? 'grin' : 'idle', head: { yaw: -0.3, pitch: 0.05 } });
    E3.pose({ x: 4.7, y: GD.deckY + 0.185, z: -5.9, rotY: PI / 2, walk: E3.phaseFor(t * 2.6), stride: 0.75, face: 'idle' });
    E4.pose({ x: 4.7, y: GD.deckY + 0.185, z: -3.3, rotY: PI / 2, walk: E4.phaseFor(t * 1.5 + 3), face: 'smirk' });
    E5.pose({ x: GD.desk.x + 0.7, z: GD.desk.z + 0.45, rotY: PI, head: { yaw: 0.35 * Math.sin(t * 0.4), pitch: 0.1 }, armL: { x: -0.7, z: 0.1, bend: -0.6 }, armR: { x: -0.7, z: 0.1, bend: -0.6 } });
    const b2 = GD.benches[1];
    E6.pose({ x: b2.x + 0.05, y: GD.benchTop - 0.56, z: b2.z + 0.2, rotY: b2.rotY + PI / 2, legL: { x: -1.5, bend: 1.45 }, legR: { x: -1.5, bend: 1.45 }, armR: { x: -1.05, z: -0.25, bend: -0.75 }, armL: { x: -0.3, z: 0.1, bend: -0.3 }, head: { pitch: 0.45 }, face: 'smirk' });
  }

  // ---------------------------------------------------------------- Scribe: typed A&P lab → waiting page → DARK MODE → the page writes itself
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const CYC = { r: 150, dx: 245 };
  const sheet = makeSheet(G, { rich: true, seed: 17, name: 'Vex', title: 'Lab 6: Muscle Damage', note: 'A&P 101  ·  muscle physiology', page: 'p. 1', problems: [
    { q: '', h: 0.85, a: '1)  Eccentric = the muscle lengthens\nunder load (going down in a squat)\n→ micro-tears in the fibers', au: 26, lineH: 2.0 },
    { q: '', h: 0.85, a: '2)  DOMS starts 12-24 h, peaks 24-72 h\nNot lactic acid: lactate is back to\nbaseline about 1 h after the workout', au: 26, lineH: 2.0 },
    { q: '', h: 1.5, a: '3)  The repair cycle', au: 26,
      fig: ({ k, y }) => { const cx = 520, cy = y + 250, out = [], R = CYC.r, X = CYC.dx;
        const nodes = [['load', cx, cy - R], ['micro-tears', cx + X, cy], ['inflammation', cx, cy + R], ['repair', cx - X, cy]];
        const ang = [-PI / 2, 0, PI / 2, PI];
        nodes.forEach(([s, x, y2], i) => { out.push(...k.text(s, x, y2, { u: 25, align: 'center', valign: 'middle' }));
          const a0 = ang[i] + 0.42, a1 = ang[i] + PI / 2 - 0.42, P = []; for (let j = 0; j <= 10; j++) { const a = a0 + (a1 - a0) * j / 10; P.push([cx + Math.cos(a) * (X + 30), cy + Math.sin(a) * (R + 24)]); }
          out.push(...k.poly(P.slice(0, 9)), ...k.arrow(P[8], P[10], { head: 15 })); });
        const st = k.text('stronger', cx, cy, { u: 24, align: 'center', valign: 'middle' }); out.push(...st, ...k.ring(st, { pad: 10 }));
        return out; } },
  ] });
  const waitHand = layoutHand(G, 'Be patient, Scribe is\ndoing your homework.', { x: 0, y: 0, u: 34, seed: 5, lineH: 2.2 });
  const PHW = 720, PHH = 1280, phT = crisp(PHW, PHH), RED = '#9a1c25';
  const PX = 40, PY = 330, PWp = 640, PHp = Math.round(640 * sheet.h / sheet.w);
  const nib = crisp(64, 64, (g) => { g.save(); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.restore(); }).canvas;
  const nibW = crisp(64, 64, (g) => { g.save(); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#e8e4ee'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); g.restore(); }).canvas; void nibW;
  const PROMPT = 'A&P lab 6, muscle damage: explain eccentric contractions + DOMS (not lactic acid?), then draw the repair cycle';
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? `${line} ${w}` : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; };
  const S_PATH = []; for (let i = 0; i <= 24; i++) { const a = (-40 - 230 * i / 24) * PI / 180; S_PATH.push([26 * Math.cos(a), -26 + 26 * Math.sin(a)]); }
  for (let i = 1; i <= 24; i++) { const a = (-90 + 230 * i / 24) * PI / 180; S_PATH.push([26 * Math.cos(a), 26 + 26 * Math.sin(a)]); }
  // theme tokens (README §Dark mode: same names, light on :root, dark on [data-theme=dark]; the accent lifts to #e46c74 for text)
  const THEME = { light: { bg: '#f3f1eb', ink: '#1d1d1d', card: '#ffffff', line: 'rgba(0,0,0,.14)', muted: '#6a6a6a', bubble: '#e8e2d6', side: '#faf8f4', sel: '#ece6da', acc: RED, accT: RED },
    dark: { bg: '#1b1a1f', ink: '#ece8f2', card: '#26252c', line: 'rgba(255,255,255,.16)', muted: '#a09cab', bubble: '#2f2d36', side: '#222128', sel: '#33313b', acc: '#a3222c', accT: '#e46c74' } };
  const MOON = { x: 300, y: 0 };
  const icoSun = (g, x, y, c) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 12, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); g.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24); g.stroke(); } };
  const icoMoon = (g, x, y, c, bg) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(x + 11, y - 8, 17, 0, 7); g.fill(); };
  const icoScreen = (g, x, y, c) => { g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.roundRect(x - 22, y - 16, 44, 30, 4); g.stroke(); g.beginPath(); g.moveTo(x - 10, y + 22); g.lineTo(x + 10, y + 22); g.stroke(); };
  let phKey = '';
  // mode: home (k = typed fraction, 1+ = sent) | wait (k 0..1) | desk (p = written); dk = dark theme; dr = drawer 0..1; tap = tap ring 0..1
  function drawPhone(mode, k, p, dk, dr, tap) {
    const key = `${mode}${Math.round(k * 60)}${Math.round((p || 0) * 3)}${dk}${Math.round(dr * 20)}${Math.round(tap * 12)}`; if (key === phKey) return; phKey = key;
    const C = dk ? THEME.dark : THEME.light, g = phT.canvas.getContext('2d');
    g.fillStyle = C.bg; g.fillRect(0, 0, PHW, PHH);
    g.fillStyle = C.ink; g.font = '600 26px Inter, Arial'; g.fillText('7:42', 40, 46); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(620, 26, 46, 22); g.fillStyle = '#7cf05f'; g.fillRect(623, 29, 30, 16);
    // the mini-bar: ☰, the logo + wordmark
    g.fillStyle = C.ink; for (let i = 0; i < 3; i++) g.fillRect(34, 92 + i * 12, 30, 4);
    g.drawImage(icon, 84, 78, 52, 52); g.fillStyle = C.ink; g.font = '38px Georgia, serif'; g.fillText('Scribe', 146, 118); g.fillStyle = C.line; g.fillRect(0, 152, PHW, 2);
    if (mode === 'home') {
      g.fillStyle = C.ink; g.font = '44px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PHW / 2, 400); g.fillText('solving today?', PHW / 2, 456); g.textAlign = 'left';
      g.fillStyle = C.card; g.beginPath(); g.roundRect(36, 520, PHW - 72, 360, 28); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      g.font = '30px Inter, Arial'; const n = Math.round(PROMPT.length * clamp(k)), lines = wrap(g, PROMPT.slice(0, n), PHW - 140);
      g.fillStyle = C.ink; lines.forEach((L, i) => g.fillText(L, 66, 580 + i * 42));
      if (k < 1 && Math.floor(k * 30) % 2 === 0) { const L = lines[lines.length - 1] || '', x = 66 + g.measureText(L).width + 3; g.fillRect(x, 552 + Math.max(0, lines.length - 1) * 42, 3, 36); }
      g.fillStyle = C.muted; g.font = '600 40px Inter, Arial'; g.fillText('+', 62, 852); g.strokeStyle = C.muted; g.lineWidth = 3; g.strokeRect(116, 822, 26, 34); g.beginPath(); g.moveTo(178, 852); g.lineTo(198, 820); g.lineTo(206, 826); g.lineTo(186, 858); g.closePath(); g.stroke();
      const pressed = k >= 1; g.fillStyle = pressed ? '#5a0e14' : C.acc; g.beginPath(); g.arc(PHW - 92, 836, 34 * (pressed ? 0.9 : 1), 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(PHW - 92, 852); g.lineTo(PHW - 92, 820); g.moveTo(PHW - 106, 834); g.lineTo(PHW - 92, 820); g.lineTo(PHW - 78, 834); g.stroke();
    } else {
      // the desk on a phone: the message stacks above the pages (README §Drawing), then the paper (never themed: a hairline edge on dark)
      g.font = '24px Inter, Arial'; const lines = wrap(g, PROMPT, 420).slice(0, 3); lines[2] += '…';
      g.fillStyle = C.bubble; g.beginPath(); g.roundRect(PHW - 480, 176, 450, 30 + lines.length * 32, 22); g.fill(); g.fillStyle = C.ink; lines.forEach((L, i) => g.fillText(L, PHW - 458, 210 + i * 32));
      if (dk) { g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2; g.strokeRect(PX - 1, PY - 1, PWp + 2, PHp + 2); } else { g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(PX - 2, PY + 4, PWp + 8, PHp + 4); }
      if (mode === 'wait') {
        g.fillStyle = '#fffdf6'; g.fillRect(PX, PY, PWp, PHp); g.strokeStyle = 'rgba(120,150,200,.28)'; g.lineWidth = 1; for (let ly = PY + 190; ly < PY + PHp - 20; ly += 28) { g.beginPath(); g.moveTo(PX + 20, ly); g.lineTo(PX + PWp - 20, ly); g.stroke(); }
        const kl = clamp(k / 0.35), cx = PX + PWp / 2, cy = PY + 240; g.strokeStyle = RED; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); S_PATH.slice(0, Math.max(2, Math.ceil(S_PATH.length * kl))).forEach(([x, y], i) => (i ? g.lineTo(cx + x, cy + y) : g.moveTo(cx + x, cy + y))); g.stroke();
        if (kl >= 1) { g.fillStyle = RED; g.beginPath(); g.moveTo(cx + 40, cy + 30); g.lineTo(cx + 70, cy + 64); g.lineTo(cx + 52, cy + 68); g.closePath(); g.fill(); }
        const kt = clamp((k - 0.38) / 0.62), nW = Math.round(waitHand.length * kt), wx = PX + 70, wy = PY + 380;
        for (let i = 0; i < nW; i++) { const it = waitHand[i]; g.drawImage(it.c, wx + it.x, wy + it.y, it.w, it.h); }
      } else {
        const tip = sheet.draw(p); g.drawImage(sheet.canvas, PX, PY, PWp, PHp);
        if (p < sheet.total - 0.5) { const cx = PX + tip[0] * PWp / sheet.w, cy = PY + tip[1] * PHp / sheet.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
      }
      const yb = PY + PHp + 26; g.fillStyle = C.muted; g.font = '26px Inter, Arial'; g.fillText(mode === 'wait' ? '' : '1 page', 40, yb + 34);
      g.font = '600 26px Inter, Arial'; g.fillStyle = mode === 'wait' ? C.line : C.ink; g.fillText('Shuffle', 250, yb + 34); g.fillText('Replay', 380, yb + 34); g.fillStyle = mode === 'wait' ? C.line : C.accT; g.fillText('Export PDF', 510, yb + 34);
    }
    // the drawer (README §The workspace: on a phone the sidebar slides in over a dimmed page; the account menu opens upward, Theme first)
    if (dr > 0) {
      const e = ease(dr), DW = 520, x0 = -DW + DW * e;
      g.fillStyle = `rgba(0,0,0,${0.38 * e})`; g.fillRect(0, 0, PHW, PHH);
      g.fillStyle = C.side; g.fillRect(x0, 0, DW, PHH); g.fillStyle = C.line; g.fillRect(x0 + DW - 2, 0, 2, PHH);
      g.save(); g.translate(x0, 0);
      g.drawImage(icon, 30, 78, 52, 52); g.fillStyle = C.ink; g.font = '38px Georgia, serif'; g.fillText('Scribe', 94, 118);
      g.fillStyle = C.sel; g.beginPath(); g.roundRect(20, 176, DW - 40, 64, 14); g.fill();
      g.fillStyle = C.ink; g.font = '600 28px Inter, Arial'; g.fillText('New assignment', 44, 218); g.font = '28px Inter, Arial'; g.fillText('Handwriting', 44, 298);
      g.fillStyle = C.muted; g.font = '600 22px Inter, Arial'; g.fillText('RECENT', 44, 372); g.font = '26px Inter, Arial'; g.fillStyle = C.ink;
      ['Lab 5: bones', 'Stats HW 7', 'Chem quiz review', 'Lab 4: the heart'].forEach((s, i) => g.fillText(s, 44, 420 + i * 52));
      // the account menu (open, upward): Theme · Assignments archive · Account settings · Log out, then the account row
      const my = 690; g.fillStyle = C.card; g.beginPath(); g.roundRect(20, my, DW - 40, 360, 18); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      g.fillStyle = C.ink; g.font = '600 30px Inter, Arial'; g.fillText('Theme', 44, my + 72);
      const ix = [210, MOON.x, 390], iy = my + 62; MOON.y = iy;
      g.fillStyle = C.sel; g.beginPath(); g.roundRect((dk ? ix[1] : ix[0]) - 38, iy - 36, 76, 72, 14); g.fill(); g.font = '26px Inter, Arial';
      icoSun(g, ix[0], iy, C.ink); icoMoon(g, ix[1], iy, C.ink, dk ? C.sel : C.card); icoScreen(g, ix[2], iy, C.ink);
      g.fillStyle = C.ink; ['Assignments archive', 'Account settings', 'Log out'].forEach((s, i) => g.fillText(s, 44, my + 170 + i * 62));
      g.fillStyle = C.acc; g.beginPath(); g.arc(56, 1140, 26, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('V', 56, 1149); g.textAlign = 'left';
      g.fillStyle = C.ink; g.font = '26px Inter, Arial'; g.fillText('Vex', 98, 1149);
      if (tap > -1 && tap < 1) {   // the finger: arrives (tap −1…0), presses, a ring spreads (0…1)
        const a = tap < 0 ? 0.5 * (1 + tap) : 0.55 * (1 - tap), r = tap < 0 ? 34 - 8 * (1 + tap) : 26; g.fillStyle = `rgba(90,90,100,${a})`; g.beginPath(); g.arc(MOON.x, MOON.y, r, 0, 7); g.fill();
        if (tap > 0) { g.strokeStyle = `rgba(228,108,116,${0.8 * (1 - tap)})`; g.lineWidth = 5; g.beginPath(); g.arc(MOON.x, MOON.y, 30 + 46 * tap, 0, 7); g.stroke(); } }
      g.restore();
    }
    phT.needsUpdate = true;
  }
  // the phone on a little stand at the far end of the bench, screen up toward where she stands
  const B0 = GD.benches[0], PW = 0.072, PH = 0.128, phone = new THREE.Group();
  const bAx = V(Math.sin(B0.rotY), 0, Math.cos(B0.rotY));                                        // the bench's long axis
  const phoneAt = V(B0.x, GD.benchTop + 0.06, B0.z).addScaledVector(bAx, 0.42);
  phone.position.copy(phoneAt); phone.rotation.set(-1.0, 0.12, 0, 'YXZ'); GYM.root.add(phone);
  bx(phone, PW + 0.008, PH + 0.012, 0.009, toon(0x2a1a34), 0, 0, 0);
  { const st = bx(GYM.root, 0.06, 0.05, 0.08, toon(0x1a1a1e), phoneAt.x, GD.benchTop + 0.025, phoneAt.z - 0.035); void st; }
  const phScr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.set(0, 0, 0.0047); phone.add(phScr);
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrU = V();
  const phoneCam = (u, v, d) => { phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ);
    const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov: 40, up: scrU.toArray() }; };
  // writing pace: problems 1–2 from the page start to just before "diagram", the cycle on "diagram and all"
  const p3 = sheet.items.findIndex((it) => it.pi === 2), wOf = (it) => (it.kind === 'p' ? it.w : 1);
  const P12 = sheet.items.slice(0, p3).reduce((s, it) => s + wOf(it), 0), totalS = sheet.total;
  const writeP = (t) => (t < T.diagram - 0.2 ? P12 * ease(u01(t, T.page, T.diagram - 0.2)) : P12 + (totalS - P12) * u01(t, T.diagram - 0.2, T.rebuild - 0.15));
  const g3 = sheet.items.filter((it) => it.pi === 2 && it.kind === 'p').flatMap((it) => it.pts), gx = g3.map((q) => q[0]), gy = g3.map((q) => q[1]);
  const cycC = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];

  // ---------------------------------------------------------------- Vex (067's look) + her shaker in the LEFT hand
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xfff0f0, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  // arm presets in her frame (+x = her left, +z = forward). Left: the shaker holds (searched for an upright bottle) + free poses.
  const HOLD = { chest: [[0.2, -0.88, 0.32], [-0.42, 0.14, 0.9]], show: [[0.3, -0.66, 0.6], [-0.22, 0.3, 0.93]], low: [[0.22, -1, 0.08], [0.12, -0.6, 0.79]], shake: [[0.32, -0.7, 0.55], [-0.12, 0.42, 0.9]] };
  const mirror = (a) => a.map((d) => [-d[0], d[1], d[2]]);
  const FREE = { rest: [[0.24, -1, 0.04], [0.12, -1, 0.14]], fwd: [[0.14, -0.22, 1], [0.08, -0.12, 1]], knees: [[0.16, -0.75, 0.62], [0.06, -0.85, 0.5]], up: [[0.28, 1, 0.12], [-0.3, 1, 0.05]],
    wall: [[0.55, -0.82, 0.1], [0.5, -0.8, 0.3]] };
  const L_ARMS = { ...HOLD, ...FREE };
  const R_ARMS = { rest: [[-0.24, -1, 0.04], [-0.12, -1, 0.14]], hip: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]], ...Object.fromEntries(['point', 'peace', 'shh', 'kissOut', 'shades', 'wave', 'beckon'].map((k) => [k, ARMS[k].R])),
    shrug: mirror(ARMS.shrug.L), fwd: mirror(FREE.fwd), knees: mirror(FREE.knees), up: mirror(FREE.up), rail: [[-0.5, -0.84, 0.16], [-0.42, -0.86, 0.3]], flex: [[-0.82, 0.1, 0.55], [0.12, 1, 0.12]],
    temple: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]], down: [[-0.32, -0.9, 0.3], [-0.04, -0.75, 0.66]] };
  const R_HAND = { rest: 'relax', hip: 'relax', point: 'point', peace: 'peace', shh: 'point', kissOut: 'open', shades: 'relax', wave: 'open', beckon: 'beckon', shrug: 'open', fwd: 'relax', knees: 'relax', up: 'open', rail: 'hold', flex: 'fist', temple: 'point', down: 'point' };
  const L_HAND = { rest: 'relax', fwd: 'relax', knees: 'relax', up: 'open', wall: 'open' };
  const GRIP = [0.42, 0.42, 0.5, 0.58, 0.64];                                                   // a looser fist round a 7.6 cm bottle
  // attach: pose the hold, read the knuckle line (= the bottle's axis in a fist) and the palm direction, centre the bottle in the grip
  VEX.update(0, { pose: 'rest', armL: HOLD.chest, hands: { L: GRIP } }); VEX.root.updateMatrixWorld(true);
  const hb = VEX.bpos('leftHand'), mid = VEX.bpos('leftMiddleProximal'), idx = VEX.bpos('leftIndexProximal'), lit = VEX.bpos('leftLittleProximal');
  const fwd = mid.clone().sub(hb).normalize(), axis = idx.clone().sub(lit).normalize(), palm = fwd.clone().cross(axis).normalize();
  const gripC = hb.clone().lerp(mid, 0.6).addScaledVector(palm, SH_R + 0.012);
  const shGrp = VEX.attach('leftHand', gripC.toArray()), held = makeShaker();
  held.quaternion.setFromUnitVectors(V(0, 1, 0), axis); held.position.addScaledVector(axis, -0.02); shGrp.add(held);
  const SHFIX = {}, qq = new THREE.Quaternion(), up = V(0, 1, 0);
  for (const [name, arm] of Object.entries(HOLD)) {
    let best = { score: -9, tw: 0, hd: arm[1] };
    for (const sb of [0, 0.35, 0.7, 1.05]) for (let tw = -1.6; tw <= 1.6001; tw += 0.08) {
      const hd = V(arm[1][0], arm[1][1] + sb, arm[1][2]).normalize().toArray();
      VEX.update(0, { pose: 'rest', armL: arm, hands: { L: GRIP }, aim: { 'twist.leftLowerArm': tw, leftHand: hd } }); VEX.root.updateMatrixWorld(true);
      const ax = up.clone().applyQuaternion(held.getWorldQuaternion(qq)), score = ax.y - 0.04 * sb - 0.02 * Math.abs(tw);
      if (score > best.score) best = { score, tw, hd, y: ax.y };
    }
    SHFIX[name] = best;
  }
  console.log('[078] shaker fix', JSON.stringify(Object.fromEntries(Object.entries(SHFIX).map(([k, v]) => [k, [v.tw.toFixed(2), v.y.toFixed(2)]]))));
  // legs: a squat / sit of depth k (0..1) as aim directions + the root offset that keeps both feet planted (measured once at build)
  const legDirs = (k) => { const a = 1.3 * k, b = 0.52 * k, o = 0.04 + 0.1 * k;
    return { leftUpperLeg: [o, -Math.cos(a), Math.sin(a)], rightUpperLeg: [-o, -Math.cos(a), Math.sin(a)], leftLowerLeg: [0.03, -Math.cos(b), -Math.sin(b)], rightLowerLeg: [-0.03, -Math.cos(b), -Math.sin(b)], hips: [0, 1, 0.3 * k] }; };
  const FOOT = [];
  for (let i = 0; i <= 20; i++) { const k = i / 20; VEX.update(0, { pose: 'rest', lean: 0.75 * k, aim: legDirs(k) }); VEX.root.updateMatrixWorld(true);
    const f = VEX.root.worldToLocal(VEX.bpos('leftFoot')).add(VEX.root.worldToLocal(VEX.bpos('rightFoot'))).multiplyScalar(0.5); FOOT.push(f); }
  const legOff = (k) => { const i = Math.min(19, Math.floor(clamp(k) * 20)), u = clamp(k) * 20 - i, f = FOOT[i].clone().lerp(FOOT[i + 1], u); return [FOOT[0].x - f.x, FOOT[0].y - f.y, FOOT[0].z - f.z]; };
  VEX.update(0, { pose: 'rest' }); VEX.root.updateMatrixWorld(true); const HEAD_Y = VEX.bpos('head').y + 0.11;   // her eye line standing at y 0
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const armsOf = (v) => ({ L: L_ARMS[v.L || 'chest'], R: R_ARMS[v.r || 'rest'] });
  const fixOf = (v) => (v.hold === false ? { tw: 0, hd: null } : SHFIX[v.L || 'chest'] || { tw: 0, hd: null });
  function glide(vexFn, t, v) {   // blend the arms over 0.28 s whenever the shot's pose function switches preset (pure: re-evaluates the past)
    const cur = armsOf(v), fx = fixOf(v); let L = cur.L, R = cur.R, tw = fx.tw, hd = fx.hd;
    for (const side of ['L', 'R']) for (let d = 0.04; d <= 0.32; d += 0.04) { const pvv = vexFn(t - d), pv = armsOf(pvv); if (pv[side] !== cur[side]) { const k = ease(clamp((d - 0.02) / 0.28));
      if (side === 'L') { L = mixArm(pv.L, cur.L, k); const f0 = fixOf(pvv); tw = f0.tw + (fx.tw - f0.tw) * k; hd = f0.hd && fx.hd ? f0.hd.map((x, i) => x + (fx.hd[i] - x) * k) : fx.hd; } else R = mixArm(pv.R, cur.R, k); break; } }
    return { ...v, armL: L, armR: R, shTw: tw, shHd: hd };
  }
  const jitterArm = (arm, t, a) => arm.map((d, i) => [d[0] + Math.sin(t * 61 + i) * a, d[1] + Math.sin(t * 47 + i * 2) * a, d[2] + Math.sin(t * 57 + i * 3) * a]);
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face
  const OUCH = (t, x = {}) => ({ angry: 0.32, sad: 0.35, surprised: 0.1, blink: lids(t, 0.12), ...x });

  // ---------------------------------------------------------------- overlay: title, callouts, end card; the PIXEL cards + the HUD (270 × 480, ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHAT ONE LEG DAY', 'DOES TO YOUR BODY'], t0: 0, t1: T.squat - 0.05, y: 0.13, plain: false, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const txtCache = new Map(), ptxt = (s, color, x, y, sc = 1, align = 'center') => { const kk = s + color; let cv = txtCache.get(kk); if (!cv) { cv = pixelText(s, { color }); txtCache.set(kk, cv); } const w = cv.width * sc; dctx.drawImage(cv, Math.round(align === 'left' ? x : x - w / 2), Math.round(y - cv.height * sc / 2), w, cv.height * sc); };
  const panel = (x0, y0, x1, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(x0, y0, x1 - x0, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y1, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y0, 2, y1 - y0); dctx.fillRect(x1, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const pline = (x0, y0, x1, y1, w, c) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) R(c, x0 + (x1 - x0) * i / n - w / 2, y0 + (y1 - y0) * i / n - w / 2, w, w); };
  const SORE = ['#3a3450', '#7cf05f', '#ffd43b', '#ffae3c', '#ff6a6a', '#ff3b5a'];
  const Y0 = 210, Y1 = 330;   // the card band (0.44–0.69 of the frame); her face sits at ≈ 0.27–0.36 above it, the HUD at 0.165–0.235 left
  // the squat depth both she and the card's pixel leg follow (two reps in the squat beat, two in the "next leg day" beat)
  const repK = (t, t0, t1) => { if (t < t0 || t > t1) return 0; const u = (t - t0) / (t1 - t0); return u < 0.58 ? ease(u / 0.58) : 1 - ease((u - 0.58) / 0.42); };
  const squatK = (t) => 0.86 * Math.max(repK(t, T.every - 0.05, T.down + 0.45), repK(t, T.down + 0.62, T.load + 0.42), repK(t, T.next - 0.1, T.hurt + 0.3), repK(t, T.hurt + 0.45, T.one - 0.15));
  const goingDown = (t) => squatK(t + 0.04) > squatK(t) + 1e-4;
  function legCard(t, k) {   // side view: hip → knee → ankle; the quad (front of the thigh) lengthens as the knee bends
    const ax = 150, ay = Y1 - 22, sh = 46, th = 46, a = 1.3 * k, b = 0.52 * k;
    const kx = ax + Math.sin(b) * sh, ky = ay - Math.cos(b) * sh, hx = kx - Math.sin(a) * th, hy = ky - Math.cos(a) * th;
    R('#3a3450', 60, ay + 2, 160, 3);
    pline(ax, ay, kx, ky, 6, '#f2c8b8'); pline(kx, ky, hx, hy, 9, '#f2c8b8'); R('#16161a', ax - 2, ay - 3, 16, 5);
    const qa = 0.18, qx0 = kx + (hx - kx) * qa, qy0 = ky + (hy - ky) * qa, qx1 = kx + (hx - kx) * 0.92, qy1 = ky + (hy - ky) * 0.92, nx = -(hy - ky) / th, ny = (hx - kx) / th;
    const down = goingDown(t), col = down ? '#ff3b5a' : '#ff9ab8';
    pline(qx0 + nx * 6, qy0 + ny * 6, qx1 + nx * 6, qy1 + ny * 6, 5, col);
    pline(hx, hy, hx - 4 + Math.sin(0.75 * k) * 40, hy - Math.cos(0.75 * k) * 44, 9, '#2a2830');      // torso stub (leans forward)
    ptxt(down ? 'LENGTHENING' : k > 0.02 ? 'SHORTENING' : 'QUADS', down ? '#ff6a8a' : '#ffffff', 135, Y0 + 11);
    ptxt('UNDER LOAD', '#ffd43b', 70, Y1 - 10, 1); void t;
  }
  function fibers(t, nTear, label) {   // 6 striated fibres; tears = white zigzag gaps that pop in one by one
    ptxt(label[0], label[1], 135, Y0 + 11);
    for (let i = 0; i < 6; i++) { const y = Y0 + 26 + i * 13; R('#c8384a', 34, y, 202, 9); R('#e85a6a', 34, y, 202, 2); for (let x = 38; x < 234; x += 6) R('#8e2232', x, y + 2, 1, 6); }
    const spots = [[80, 1], [170, 3], [120, 0], [205, 4], [60, 5], [145, 2], [100, 4], [190, 1]];
    for (let j = 0; j < nTear; j++) { const [x, row] = spots[j], y = Y0 + 26 + row * 13; R('#fff4f4', x, y - 1, 3, 4); R('#fff4f4', x + 2, y + 3, 3, 4); R('#fff4f4', x, y + 7, 3, 3); R('#ffd43b', x + 5, y - 3, 1, 1); R('#ffd43b', x - 3, y + 9, 1, 1); }
    void t;
  }
  function graph(o) {   // axes + a curve drawn up to u (0..1) in the card band
    const ox = 34, oy = Y1 - 20, w = 206, h = 70; R('#f2e6ff', ox, oy, w, 2); R('#f2e6ff', ox, oy - h, 2, h + 2);
    if (o.band) { dctx.fillStyle = 'rgba(255,106,106,.22)'; dctx.fillRect(ox + 2 + o.band[0] * w, oy - h, (o.band[1] - o.band[0]) * w, h); }
    for (const c of o.curves) { let py = null; const n = 200; for (let i = 0; i <= n; i++) { const x = i / n; if (x > (c.u ?? 1)) break; const y = Math.round(oy - 2 - c.f(x) * (h - 6)); if (py !== null && Math.abs(y - py) > 2) R(c.col, ox + 2 + x * w, Math.min(y, py), 2, Math.abs(y - py)); R(c.col, ox + 2 + x * w, y, 2, 2); py = y; } }
    if (o.base) for (let x = ox + 4; x < ox + w; x += 7) R('rgba(242,230,255,.55)', x, Math.round(oy - 2 - o.base * (h - 6)), 4, 1);
    (o.ticks || []).forEach(([x, s, col]) => ptxt(s, col || '#c8c0d8', ox + 2 + x * w, oy + 8));
  }
  let dgKey = '';
  const HUD = (t) => (t < T.squat ? null : t < T.myth ? ['HOUR 0', 0] : t < T.peak ? ['HOUR 1', 0] : t < T.three - 0.1 ? ['HOUR 24', 3] : t < T.rebuild ? ['HOUR 48', 5] : t < T.rebuilding ? ['HOUR 48', 4] : t < T.bout ? ['HOUR 72', 2] : ['DAY 7', 1]);
  function diagram(t, sh) {
    let id = null, k = 0;
    if (sh.card === 'leg' && t >= T.every - 0.1) id = 'leg';
    else if (t >= T.micro - 0.1 && t < T.myth) { id = 'fib'; k = u01(t, T.micro - 0.05, T.fibers + 0.2); }
    else if (t >= T.not - 0.1 && t < T.peak) { id = 'lac'; k = u01(t, T.not - 0.1, T.hour1 + 0.3); }
    else if (t >= T.peaks - 0.1 && t < T.stairs - 0.1) { id = 'doms'; k = u01(t, T.peaks - 0.1, T.stairs - 0.4); }
    else if (t >= T.protein - 0.1 && t < T.bout) { id = 'mps'; k = u01(t, T.protein - 0.1, T.rebuilding); }
    else if (sh.card === 'bout' && t >= T.hurt - 0.1 && t < T.end) { id = 'bout'; k = u01(t, T.hurt - 0.1, T.protects + 0.3); }
    const hud = !sh.phone && t < T.card ? HUD(t) : null;
    const sk = id === 'leg' ? squatK(t) : 0;
    const key = `${id}${Math.round(k * 60)}${Math.round(sk * 40)}${goingDown(t)}${hud ? hud.join() : ''}${t > T.totally - 0.1 ? 'n' : ''}${t > T.thats - 0.1 ? 'g' : ''}`; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480);
    if (hud) { panel(10, 80, 104, 112); ptxt(hud[0], '#ffffff', 57, 90, 1.5); ptxt('SORE', '#c8c0d8', 30, 104); for (let i = 0; i < 5; i++) R(i < hud[1] ? SORE[hud[1]] : '#2a2640', 46 + i * 11, 100, 9, 7); }
    if (!id) return;
    panel(18, Y0, 252, Y1);
    if (id === 'leg') legCard(t, sk);
    if (id === 'fib') fibers(t, Math.round(8 * k), t > T.totally - 0.1 ? ['TOTALLY NORMAL', '#7cf05f'] : k > 0.05 ? ['MICRO-TEARS', '#ffd43b'] : ['MUSCLE FIBERS', '#ffffff']);
    if (id === 'lac') { const g2 = t > T.thats - 0.1; ptxt(g2 ? 'BACK TO NORMAL IN 1 H' : 'BLOOD LACTATE', g2 ? '#7cf05f' : '#ffd43b', 135, Y0 + 11);
      graph({ base: 0.12, curves: [{ col: '#ffd43b', u: k, f: (x) => (x < 0.12 ? 0.12 + 0.86 * ease(x / 0.12) : 0.12 + 0.86 * Math.exp(-(x - 0.12) * 7)) }], ticks: [[0.05, 'SET'], [0.5, '+1 H', g2 ? '#7cf05f' : null], [0.95, '+2 H']] });
      ptxt('DOMS STARTS', '#ff6a8a', 196, Y0 + 40); ptxt('12-24 H LATER', '#ff6a8a', 196, Y0 + 50); }
    if (id === 'doms') { ptxt('SORENESS', '#ffd43b', 135, Y0 + 11);
      graph({ band: [24 / 168, 72 / 168], curves: [{ col: '#ff6a6a', u: k, f: (x) => soreAt(x * 168) * 0.95 }], ticks: [[0.0, 'D1'], [1 / 7, 'D2'], [2 / 7, 'D3'], [3 / 7, 'D4'], [4 / 7, 'D5'], [5 / 7, 'D6'], [6 / 7, 'D7']] });
      ptxt('24-72 H', '#ff6a8a', 34 + 2 + 48 / 168 * 206, Y0 + 26); }
    if (id === 'mps') { ptxt('PROTEIN SYNTHESIS', '#ffd43b', 135, Y0 + 11);
      const bars = [['3 H', 112], ['24 H', 65], ['48 H', 34]], base = Y1 - 20; R('#f2e6ff', 40, base, 190, 2);
      bars.forEach(([lab, v], i) => { const kk = ease(clamp(k * 3 - i * 0.6)), hgt = Math.round(v / 112 * 62 * kk), x = 62 + i * 60; R('#7cf05f', x, base - hgt, 26, hgt); R('#b8ffa0', x, base - hgt, 26, 2); ptxt(lab, '#c8c0d8', x + 13, base + 8); if (kk > 0.6) ptxt(`+${v}%`, '#ffffff', x + 13, base - hgt - 7); }); }
    if (id === 'bout') { ptxt(t > T.one - 0.1 ? 'PROTECTED FOR WEEKS' : 'SORENESS', t > T.one - 0.1 ? '#7cf05f' : '#ffd43b', 135, Y0 + 11);
      graph({ curves: [{ col: '#ff6a6a', f: (x) => soreAt(x * 168) * 0.95 }, { col: '#7cf05f', u: k, f: (x) => soreAt(x * 168) * 0.3 }], ticks: [[0.12, 'LEG DAY 1', '#ff6a6a'], [0.72, 'THE NEXT ONE', '#7cf05f']] }); }
  }

  // ---------------------------------------------------------------- shots
  const P0 = { x: 0, z: -3.25, y: 0.035 }, PD = { x: -4.75, z: -1.05, rotY: 1.05 }, PB = { x: B0.x, z: B0.z + 0.44, rotY: 0.06 }, PF = { x: GD.desk.x + 0.25, z: GD.desk.z - 1.15, rotY: PI };
  const PSt = (t) => { const j = ease(clamp((t - T.good - 0.05) / 0.18)), y0 = GD.stepY(10), z0 = GD.stepZ(10), y1 = GD.stepY(9), z1 = GD.stepZ(9);   // one step down on "good"
    return { x: 5.82, y: y0 + (y1 - y0) * j, z: z0 + (z1 - z0) * j, rotY: 0.08 }; };
  const PS0 = { x: 5.0, z: 3.75, rotY: PI - 0.2 };   // at the foot of the stairs (facing up them toward −z)
  const morning = (t) => t >= T.peak && t < T.bout;
  const SH = [
    { id: 'open', t0: 0, vex: (t) => ({ ...P0, L: t < 1.4 ? 'low' : 'chest', r: 'hip', tilt: 0.08, face: CONF(t) }), cam: (t) => { const k = ease(u01(t, 0, T.here)); return { pos: [0.75 - 0.45 * k, 1.4, -0.2 - 0.8 * k], frac: 0.37, fov: 50 }; } },
    { id: 'show', t0: T.here - 0.1, vex: (t) => ({ ...P0, L: 'show', r: t > T.body - 0.25 ? 'point' : 'hip', tilt: -0.08, turn: 0.05, face: CONF(t, { relaxed: 0.18 }) }), cam: (t) => ({ pos: [0.16, 1.48, -1.6 - 0.15 * u01(t, T.here, T.squat)], frac: 0.37, fov: 46 }) },
    { id: 'wide', t0: T.squat, bench: true, vex: (t) => ({ ...P0, hold: false, L: 'up', r: 'up', tilt: 0.1 * Math.sin(t * 2), face: CONF(t) }), cam: (t) => { const k = ease(u01(t, T.squat, T.squats)); return { pos: [-2.4 + 0.5 * k, 2.55 - 0.3 * k, 2.6 - 0.6 * k], look: [0.2, 1.05, -3.6], fov: 52 }; } },
    { id: 'squatA', t0: T.squats - 0.1, bench: true, vex: (t) => ({ ...P0, hold: false, L: 'fwd', r: 'fwd', squat: squatK(t), face: CONF(t, { angry: 0.2 }) }), cam: (t) => ({ pos: [2.1, 1.3, -1.2 - 0.12 * u01(t, T.squats, T.stretch)], frac: 0.3, fov: 50 }) },
    { id: 'squatB', t0: T.stretch - 0.1, card: 'leg', bench: true, vex: (t) => ({ ...P0, hold: false, L: 'fwd', r: 'fwd', squat: squatK(t), face: CONF(t, { angry: 0.25 }) }), cam: (t) => ({ pos: [-0.3, 1.5, -1.25], frac: 0.29, fov: 52 }) },
    { id: 'tears', t0: T.tears, vex: (t) => ({ ...P0, L: 'chest', r: 'down', tilt: -0.1, face: CONF(t) }), cam: (t) => ({ pos: [-0.4, 1.45, -1.35 - 0.2 * u01(t, T.tears, T.totally)], frac: 0.29, fov: 50 }) },
    { id: 'normal', t0: T.totally - 0.1, vex: (t) => ({ ...P0, L: 'chest', r: 'shrug', tilt: 0.12, face: CONF(t, { relaxed: 0.3 }) }), cam: (t) => ({ pos: [0.32, 1.55, -2.1 + 0.08 * u01(t, T.totally, T.myth)], frac: 0.35, fov: 42 }) },
    { id: 'myth1', t0: T.myth, vex: (t) => ({ ...PD, L: 'chest', r: 'hip', tilt: 0.14, face: CONF(t, { surprised: 0.2 }) }), cam: (t) => { const k = ease(u01(t, T.myth, T.not)); return { pos: [-3.05 + 0.15 * k, 1.5, 0.05 - 0.15 * k], frac: 0.34, fov: 46 }; } },
    { id: 'myth2', t0: T.not - 0.1, vex: (t) => ({ ...PD, L: 'chest', r: 'point', tilt: -0.06, turn: t < T.not + 1.0 ? 0.2 * Math.sin((t - T.not) * 12) * (1 - u01(t, T.not + 0.6, T.not + 1.0)) : 0, face: CONF(t, { angry: 0.25 }) }), cam: (t) => ({ pos: [-3.15, 1.48, 0.05 - 0.1 * u01(t, T.not, T.peak)], frac: 0.3, fov: 50 }) },
    { id: 'peakA', t0: T.peak, vex: (t) => ({ ...PS0, L: 'chest', r: 'rest', nod: -0.32, tilt: 0.06, jitter: 0.02, face: OUCH(t) }), cam: (t) => ({ pos: [5.7, 2.3 - 0.1 * u01(t, T.peak, T.stairs), 1.45], frac: 0.3, fov: 50 }) },
    { id: 'stairs', t0: T.stairs - 0.1, vex: (t) => ({ ...PSt(t), hold: false, L: 'wall', r: 'rail', nod: 0.18, jitter: 0.03, face: t > T.good + 0.05 && t < T.good + 0.6 ? OUCH(t, { surprised: 0.5, angry: 0.4, blink: 0.3 }) : OUCH(t, { surprised: 0.3 }) }),
      cam: (t) => ({ pos: [5.5, 1.3, 4.45], frac: 0.37 + 0.03 * ease(u01(t, T.good, T.good + 0.3)), fov: 27 }), kicks: () => [T.good + 0.12] },
    { id: 'sit', t0: T.pivot, bench: true, vex: (t) => { const s = t < T.sit + 0.25 ? 0.72 * ease(u01(t, T.pivot + 0.15, T.sit + 0.1)) : 0.72 * (1 - ease(u01(t, T.sit + 0.35, T.downP + 0.25))), ouch = t > T.sit - 0.05 && t < T.downP + 0.4;
        return { ...PB, hold: false, L: t < T.downP + 0.3 ? 'knees' : 'rest', r: t < T.downP + 0.3 ? 'knees' : t > T.anatomy - 0.2 ? 'down' : 'rest', squat: s, face: ouch ? OUCH(t, { surprised: 0.55, angry: 0.35 }) : CONF(t, { sad: 0.15 }) }; },
      cam: (t) => ({ pos: [B0.x - 1.15, 1.3, B0.z + 2.35 - 0.15 * u01(t, T.pivot, T.cute)], frac: 0.31, fov: 52 }), kicks: () => [T.sit + 0.12] },
    { id: 'cute', t0: T.cute - 0.25, bench: true, vex: (t) => ({ ...PB, hold: false, L: 'rest', r: 'shh', tilt: -0.12, lean: 0.06, face: CONF(t, { relaxed: 0.25, blinkLeft: t > T.cute + 0.2 ? 1 : 0 }) }), cam: (t) => ({ pos: [B0.x + 0.15, 1.56, B0.z + 1.6 - 0.06 * u01(t, T.cute, T.scribe)], frac: 0.35, fov: 42 }) },
    { id: 'type', t0: T.scribe, phone: 'type' },
    { id: 'dark', t0: T.send + 0.2, phone: 'dark' },
    { id: 'write', t0: T.hand - 0.25, phone: 'write' },
    { id: 'cycle', t0: T.diagram - 0.1, phone: 'cycle' },
    { id: 'shake', t0: T.rebuild, vex: (t) => ({ ...PF, L: 'shake', r: 'hip', shake: 1, tilt: 0.06, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => { const k = ease(u01(t, T.rebuild, T.protein)); return { pos: [GD.desk.x + 0.55 - 0.2 * k, 1.45, GD.desk.z - 2.95 + 0.12 * k], frac: 0.34, fov: 46 }; } },
    { id: 'protein', t0: T.protein - 0.1, vex: (t) => ({ ...PF, L: t < T.two - 0.2 ? 'show' : 'chest', r: t > T.two - 0.3 && t < T.rebuilding ? 'peace' : 'hip', tilt: -0.08, face: CONF(t) }), cam: (t) => ({ pos: [GD.desk.x - 0.35, 1.45, GD.desk.z - 3.05 - 0.12 * u01(t, T.protein, T.bout)], frac: 0.29, fov: 50 }) },
    { id: 'next', t0: T.bout, card: 'bout', bench: true, vex: (t) => ({ ...P0, hold: false, L: 'fwd', r: 'fwd', squat: squatK(t), face: CONF(t, { relaxed: 0.25, angry: 0.05 }) }), cam: (t) => ({ pos: [-1.95, 1.34, -1.3 - 0.12 * u01(t, T.bout, T.one)], frac: 0.29, fov: 50 }) },
    { id: 'weeks', t0: T.one - 0.1, bench: true, vex: (t) => ({ ...P0, hold: false, L: 'rest', r: t > T.protects - 0.3 ? 'flex' : 'hip', tilt: -0.1, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => ({ pos: [0.26, 1.5, -1.3 - 0.15 * u01(t, T.one, T.end)], frac: 0.37, fov: 48 }) },
    { id: 'end', t0: T.end, vex: (t) => ({ ...P0, L: 'chest', r: t > T.ill - 0.3 ? 'shh' : t > T.skip - 0.2 ? 'point' : 'hip', tilt: -0.1, face: CONF(t, { relaxed: t > T.ill - 0.2 ? 0.22 : 0.1, blinkLeft: t > T.know + 0.05 ? 1 : 0 }) }), cam: (t) => ({ pos: [0.06, 1.52, -2.05 - 0.2 * u01(t, T.end, T.card)], frac: 0.34, fov: 46 }) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const poseVex = (sh, t) => {
    const v = glide(sh.vex, t, sh.vex(t)); let armL = v.jitter ? jitterArm(v.armL, t, v.jitter) : v.armL; const armR = v.jitter ? jitterArm(v.armR, t, v.jitter * 0.5) : v.armR;
    if (v.shake) { const s = Math.sin(t * 2 * PI * 4.2) * 0.16; armL = [armL[0], [armL[1][0], armL[1][1] + s, armL[1][2]]]; }
    const k = v.squat ?? null, aim = {};
    if (v.hold !== false && v.shHd) Object.assign(aim, { 'twist.leftLowerArm': v.shTw, leftHand: v.shHd });
    let x = v.x, y = v.y ?? 0, z = v.z, lean = v.lean ?? 0, nod = v.nod ?? 0;
    if (k !== null) { Object.assign(aim, legDirs(k)); const [ox, oy, oz] = legOff(k), ry = v.rotY ?? 0; x += ox * Math.cos(ry) + oz * Math.sin(ry); z += -ox * Math.sin(ry) + oz * Math.cos(ry); y += oy; lean += 0.75 * k; nod -= 0.55 * k; }
    VEX.update(t, { ...lips(t), sway: k !== null ? 0 : 0.15, ...v, armL, armR, lean, nod, aim, hands: { L: v.hold === false ? (L_HAND[v.L] || 'relax') : GRIP, R: R_HAND[v.r || 'rest'] }, face: { ...(v.face || {}) }, x, z, y, rotY: v.rotY ?? 0 });
    VEX.root.updateMatrixWorld(true); return v;
  };

  const camUp = V(0, 1, 0);
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    GYM.setMode(morning(t) ? 'morning' : 'night');
    const hh = HUD(t); GYM.setClock(hh && hh[0] !== 'HOUR 1' ? (morning(t) ? 7 : 19) : 20, hh ? (hh[0] === 'HOUR 0' ? Math.floor((t - T.squat) * 2) : 0) : 0);
    // the phone: typing → send → waiting page → the drawer + the moon → the page writes itself on the dark desk
    const dk = t >= T.tap + 0.04, dr = t < T.tap - 0.5 ? 0 : t < T.tap + 0.4 ? u01(t, T.tap - 0.5, T.tap - 0.25) : 1 - u01(t, T.tap + 0.4, T.tap + 0.65), tap = t < T.tap ? u01(t, T.tap - 0.25, T.tap) - 1 : u01(t, T.tap, T.tap + 0.35);
    if (t < T.scribe) drawPhone('home', 0, 0, false, 0, 0);
    else if (t < T.send) drawPhone('home', u01(t, T.scribe + 0.1, T.send - 0.12) + (t > T.send - 0.12 ? 1 : 0), 0, false, 0, 0);
    else if (t < T.page) drawPhone('wait', u01(t, T.send, T.page), 0, dk, dr, tap);
    else drawPhone('desk', 0, writeP(t), true, 0, 0);
    // Vex + her shaker
    VEX.root.visible = !!sh.vex;
    let v = null;
    if (sh.vex) v = poseVex(sh, t);
    held.visible = !!sh.vex && v.hold !== false;
    benchShaker.visible = !held.visible || !sh.vex;
    poseExtras(t);
    // camera
    let cam;
    if (sh.phone === 'type') cam = phoneCam(0.5, 0.5, 0.215 - 0.015 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'dark') { const z = ease(u01(t, T.tap - 0.45, T.tap - 0.15)) * (1 - ease(u01(t, T.tap + 0.35, T.tap + 0.75))); cam = phoneCam(0.48 - 0.1 * z, 0.5 + 0.085 * z, 0.25 - 0.09 * z); }
    else if (sh.phone === 'write') cam = phoneCam(0.5, 0.48, 0.2 - 0.02 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'cycle') { const gu = (PX + cycC[0] * PWp / sheet.w) / PHW, gv = (PY + cycC[1] * PHp / sheet.h) / PHH; cam = phoneCam(gu, gv, 0.125 - 0.015 * u01(t, sh.t0, sh.t1)); }
    else { cam = sh.cam(t);
      if (cam.frac !== undefined) {   // aim so her (standing) eye line lands at cam.frac of the frame height
        const fx = (v?.x ?? 0) + (cam.dx ?? 0), fz = (v?.z ?? 0) + (cam.dz ?? 0), fy = (v?.y ?? 0) + HEAD_Y, dh = Math.hypot(fx - cam.pos[0], fz - cam.pos[2]);
        const th = Math.atan2(fy - cam.pos[1], dh) - Math.atan((0.5 - cam.frac) * 2 * Math.tan(cam.fov * PI / 360));
        cam.look = [fx, cam.pos[1] + dh * Math.tan(th), fz]; } }
    if (SIDE_DBG && sh.vex) { const h = VEX.bpos('leftHand'), f = V(Math.sin(v?.rotY ?? 0), 0, Math.cos(v?.rotY ?? 0)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, 0.75).addScaledVector(f, 0.15).add(V(0, 0.05, 0)).toArray(), look: h.toArray(), fov: 40 }; }
    let amp = sh.shakeAmp ?? 0;
    if (sh.kicks) for (const kt of sh.kicks()) { const a = t - kt; if (a >= 0 && a < 0.35) amp = Math.max(amp, 0.026 * (1 - a / 0.35)); }
    studio.camera.up.copy(cam.up ? V(...cam.up) : camUp);
    studio.camera.far = 60; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, amp);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      GYM.key.target.position.copy(tg); GYM.key.position.copy(tg).addScaledVector(f, -3).addScaledVector(side, -1.5).add(V(0, 3, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.26 * Math.pow(d, 1.6)) * (d < 1.2 ? 0.8 : 1) : 0; }
    GYM.update(t);
    diagram(t, sh);
    pixel.set(sh.phone ? 1 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
