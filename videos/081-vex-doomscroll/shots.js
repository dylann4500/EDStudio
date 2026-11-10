// 081 — "What scrolling in bed does to your brain, hour by hour" (Scribe lane, Vex EXPLAINER, anime/pixel look). Manager brief (Nov 10):
// a Vex explainer like 076/077 voiced by the user's new Fish pick "Sua shy voice" at a normal, regular pace (not breathy), ASAP.
//   format  = 076's HOUR-BY-HOUR explainer with a clock HUD (12:00 AM → 1:00 → 1:30 → 2:00 → 2:10 → lights out);
//   place   = engine/build/dorm.js (073): Vex's goth dorm room upstairs at night, scrolling, and the cut-open dollhouse view with
//             Derek (073's toon) in his loft bed downstairs, scrolling too — until the phone drops on his face (the cameo);
//   facts   = (sources in caption.md's comment) blue light held melatonin back about twice as long as green light of similar
//             brightness (Harvard, 6.5 h exposure; Harvard Health "Blue light has a dark side"); Hjetland et al. 2025, Frontiers in
//             Psychiatry: 45,202 Norwegian students aged 18–28, each extra hour of screen use after going to bed ≈ 24 min less sleep and
//             59 % higher odds of insomnia symptoms (cross-sectional); Williamson & Feyer 2000 (Occup. Environ. Med.): after 17–19 h awake,
//             performance on some tests was equivalent to or worse than at 0.05 % BAC (8 AM → 2:10 AM = 18 h); Yoo, Walker et al. 2007
//             (Nature Neuroscience): one night without sleep → up to ~40 % worse at forming new memories;
//   diagrams= pixel cards (an overlay canvas drawn at 270 × 480 and shown ×4, pixelated) + the clock HUD;
//   Scribe  = a feature no Vex reel has shown: FINISH NOW (README §The writing desk: "Pause and Finish now are added while the pen
//             writes"). A photo of the bio worksheet + a typed line → the desk (an image preview over her prompt, README) → the page writes
//             itself ON THE PHONE SCREEN in her hand with an on-screen pen cursor (never a pencil on paper), the melatonin graph drawn by
//             the pen, then she taps Finish now and the rest lands at once; the row turns into 1 page · Shuffle · Replay · Export PDF;
//   persona = the lighter, regular-paced Vex (Sua): confident, teasing ("Cute.", "I'll know."), no mommy lines.
// Props rule (Nov 9): her phone rides her LEFT hand bone (attached at build in the hold pose: its long side along the knuckle line,
// its back on the palm, the screen facing out of the palm), and the forearm twist + wrist are searched per arm preset so the screen faces
// her eyes. Lighting: her phone's glow is a small light IN FRONT of her (no light behind her; cheek RGB checked against ~235/213/205).
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { buildDorm, D as DD, makeTextbook, makeDeskLamp, makeMiniFridge, makeDoorDesk } from '@engine/build/dorm.js';
import { makeToon } from '@engine/build/toon.js';
import { makeDizzy } from '@engine/build/fx.js';

const PI = Math.PI, PIXEL = 4, SIDE_DBG = false;   // SIDE_DBG: a side view of her phone hand for the props check
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
    heres: W('hook', 'heres'), brain: W('hook', 'brain'), hour: W('hook', 'hour'),
    mid: B.midnight.t0, blue: W('midnight', 'blue'), melatonin: W('midnight', 'melatonin'), hormone: W('midnight', 'hormone'), about: W('midnight', 'about'), twice: W('midnight', 'twice'), green: W('midnight', 'green'),
    study: B.study.t0, studyW: W('study', 'study'), forty5: W('study', 'fortyfive'), students: W('study', 'students'), found: W('study', 'found'), every: W('study', 'every'), bed1: W('study', 'bed'),
    t24: W('study', 'twentyfour'), sleep1: W('study', 'sleep'), odds: B.odds.t0, f59: W('odds', 'fiftynine'), oddsW: W('odds', 'odds'), insomnia: W('odds', 'insomnia'),
    derek: B.derek.t0, learning: W('derek', 'learning'), hard: W('derek', 'hard'), way: W('derek', 'way'), cute: W('derek', 'cute'),
    pivot: B.pivot.t0, bio: W('pivot', 'bio'), still: W('pivot', 'still'), nine: W('pivot', 'nine'),
    scribe: B.scribe.t0, open: W('scribe', 'open'), it: W('scribe', 'it'), writes: W('scribe', 'writes'), handwriting: W('scribe', 'handwriting'), graph: W('scribe', 'graph'), tap: W('scribe', 'tap'), finish: W('scribe', 'finish'), now: W('scribe', 'now'),
    tipsy: B.tipsy.t0, eighteen: W('tipsy', 'eighteen'), awake: W('tipsy', 'awake'), test: W('tipsy', 'test'), tipsyW: W('tipsy', 'tipsy'),
    mem: B.memory.t0, allnighter: W('memory', 'allnighter'), memories: W('memory', 'memories'), drop: W('memory', 'drop'), forty: W('memory', 'forty'), percent: W('memory', 'percent'),
    end: B.end.t0, phoneW: W('end', 'phone'), down: W('end', 'down'), go: W('end', 'go'), sleep2: W('end', 'sleep'), ill: W('end', 'ill'), know: W('end', 'know'),
  };
  T.card = T.know + 0.6; T.drop = T.hard - 0.05; T.bonk = T.drop + 0.2; T.tapAt = T.finish + 0.02;

  // ---------------------------------------------------------------- the dorm (073): Vex's goth room upstairs, Derek's room downstairs
  const DM = buildDorm(studio), FY = DD.FY;
  scene.fog = null;
  DM.lights.hemi.color.set(0xd6c6f0);   // a warmer night ambient than 073's lavender (her cheeks read cool)
  // dress her room a little more: a door desk with textbooks + a lamp, a mini fridge (073's props, no build loop)
  const desk = makeDoorDesk(); if (desk.g) { DM.ride(desk.g, -1.05, -2.95); desk.g.rotation.y = 0; desk.g.scale.setScalar(0.8); }
  [['BIO 101', 0x3a8a4a], ['CHEM', 0x8a3a9a], ['CALC', 0xc8462a]].forEach(([tt, c], i) => { const b = makeTextbook(tt, c, { w: 0.4, h: 0.08, d: 0.3 }); const g = b.g || b; DM.ride(g, -1.55, -2.95, 0.55 + i * 0.085); g.rotation.y = 0.2 * (i - 1); });
  { const L = makeDeskLamp(); const g = L.g || L; DM.ride(g, -0.65, -3.05, 0.55); }
  { const F = makeMiniFridge(); const g = F.g || F; DM.ride(g, 2.45, -3.1); }

  // ---------------------------------------------------------------- phones (her phone: a 720 × 1500 canvas screen; Derek's: a small glow)
  const PHW = 720, PHH = 1500, PW = 0.072, PH = 0.15;
  const crisp = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const phT = crisp(PHW, PHH);
  const toonM = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  function phoneModel(screenMat, caseColor) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.006, PH + 0.008, 0.008), toonM(caseColor)); g.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), screenMat); scr.position.z = 0.0042; g.add(scr);
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.03, 0.003), toonM(0x1a1a1e)); cam.position.set(-0.018, 0.05, -0.0052); g.add(cam);
    return { g, scr };
  }
  const herPhone = phoneModel(new THREE.MeshBasicMaterial({ map: phT, toneMapped: false }), 0x2a1a34);
  const glowV = new THREE.PointLight(0xa8c8ff, 0.0, 0.9, 2); glowV.position.set(0, 0, 0.08); herPhone.g.add(glowV);
  const povPhone = phoneModel(herPhone.scr.material, 0x2a1a34); scene.add(povPhone.g); povPhone.g.visible = false;   // the phone-POV shots: a copy at her held phone's exact pose

  // ---------------------------------------------------------------- Scribe: a photo of the bio worksheet + a typed line → the desk writes → FINISH NOW
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const graphFig = ({ k, y }) => { const ox = 250, oy = y + 330, sx = 66, out = [];
    out.push(...k.arrow([ox - 10, oy], [ox + 10 * sx, oy], { head: 14 }), ...k.arrow([ox, oy + 10], [ox, oy - 270], { head: 14 }));
    const bump = (h, peak, w, amp) => Math.max(0, amp * Math.exp(-(((h - peak) / w) ** 2)));   // a smooth night-time rise and fall
    const A = [], Bc = []; for (let i = 0; i <= 30; i++) { const h = 10 * i / 30; A.push([ox + h * sx, oy - 8 - bump(h, 5.2, 2.6, 215)]); Bc.push([ox + h * sx, oy - 8 - bump(h, 7.4, 2.0, 170)]); }
    out.push(...k.poly(A, { line: 4 }));
    for (let i = 0; i < 30; i += 2) out.push(...k.line(Bc[i], Bc[i + 1], { line: 3.4 }));
    out.push(...k.text('melatonin', ox - 200, oy - 262, { u: 21 }));
    ['9p', '11p', '1a', '3a', '5a', '7a'].forEach((s, i) => out.push(...k.text(s, ox + i * 2 * sx - 12, oy + 40, { u: 20 })));
    out.push(...k.label('lights out at 11', [ox + 0.4 * sx, oy - 312], [ox + 4.4 * sx, oy - 210], { u: 20 }));
    out.push(...k.label('screen till 2', [ox + 6.4 * sx, oy - 300], [ox + 7.6 * sx, oy - 176], { u: 20 }));
    const n = k.text('peak shifts later', ox + 2.6 * sx, oy + 92, { u: 22 }); out.push(...n, ...k.ring(n, { pad: 8 }));
    return out; };
  const sheet = makeSheet(G, { rich: true, seed: 23, name: 'Vex', title: 'BIO 101 · Sleep + the brain', note: 'Due 9:00 AM  ·  show your work', page: 'p. 1',
    qFont: '500 26px Georgia, serif', qLineH: 34, problems: [
      { q: '1. Which hormone tells your body it is time to sleep, and\n    which gland releases it?', h: 0.5, a: 'melatonin, from the pineal gland', au: 27 },
      { q: '2. Why does a bright screen at night push sleep later?', h: 0.62, a: 'blue light hits the brain\'s clock (the SCN)\n→ melatonin is held back → sleep starts later', au: 25, lineH: 1.9 },
      { q: '3. Sketch melatonin over one night: lights out at 11 PM\n    vs. a screen until 2 AM.', h: 1.55, fig: graphFig },
    ] });
  const PX = 40, PY = 420, PWp = 640, PHp = Math.round(640 * sheet.h / sheet.w), RED = '#9a1c25';
  const nib = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); return c; })();
  const PROMPT = 'bio hw due 9am. show work + draw the graph pls';
  const wrap = (g, s, maxW) => { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? `${line} ${w}` : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; };
  // the photo of the worksheet (a printed page shot at an angle on her duvet), drawn once
  const photo = (() => { const c = document.createElement('canvas'); c.width = 240; c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#4a2a6a'; g.fillRect(0, 0, 240, 300);
    g.save(); g.translate(120, 150); g.rotate(-0.08); g.fillStyle = '#f6f4ee'; g.fillRect(-90, -125, 180, 250); g.fillStyle = '#2a2a2a'; g.font = '700 13px Georgia, serif'; g.fillText('BIO 101 · Sleep', -76, -100);
    g.fillStyle = '#6a6a6a'; for (let i = 0; i < 9; i++) g.fillRect(-76, -80 + i * 22, i % 3 === 2 ? 90 : 150, 4); g.strokeStyle = '#8a8a8a'; g.lineWidth = 2; g.strokeRect(-60, 60, 120, 50); g.restore(); return c; })();
  // a generic short-video feed (no real app's logo or UI): bright clips that swipe up
  const CLIPS = [['#ff6aa8', '#ffd25a'], ['#3ad0ff', '#7a4aff'], ['#7cf05f', '#1aa0a0'], ['#ffb04a', '#ff4a6a'], ['#c8a0ff', '#4a6aff'], ['#ffe26a', '#3ac88a']];
  function drawClip(g, i, y0) {
    const [a, b] = CLIPS[((i % CLIPS.length) + CLIPS.length) % CLIPS.length], gr = g.createLinearGradient(0, y0, PHW, y0 + PHH); gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.fillStyle = gr; g.fillRect(0, y0, PHW, PHH);
    g.fillStyle = 'rgba(255,255,255,.85)'; const cx = PHW / 2 + Math.sin(i * 2.1) * 90, cy = y0 + PHH * 0.42;
    if (i % 3 === 0) { g.beginPath(); g.arc(cx, cy - 120, 70, 0, 7); g.fill(); g.fillRect(cx - 60, cy - 50, 120, 220); }   // a figure
    else if (i % 3 === 1) { g.beginPath(); g.ellipse(cx, cy, 170, 120, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx - 150, cy - 70); g.lineTo(cx - 110, cy - 190); g.lineTo(cx - 60, cy - 100); g.moveTo(cx + 150, cy - 70); g.lineTo(cx + 110, cy - 190); g.lineTo(cx + 60, cy - 100); g.fill(); }   // a cat-ish blob
    else { for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx - 200 + k * 100, cy + Math.sin(k + i) * 60, 40, 0, 7); g.fill(); } }   // bouncing dots
    g.fillStyle = '#ffffff'; for (let k = 0; k < 3; k++) { const yy = y0 + 900 + k * 150; g.beginPath(); g.arc(PHW - 70, yy, 34, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.55)'; g.font = '700 26px Inter, Arial'; g.textAlign = 'center'; ['1.2M', '8,410', 'Share'].forEach((s, k) => g.fillText(s, PHW - 70, y0 + 980 + k * 150)); g.textAlign = 'left';
    g.fillStyle = '#ffffff'; g.font = '700 32px Inter, Arial'; g.fillText(['@sleepy.cat', '@dorm.life', '@3am.thoughts', '@snack.lab', '@vibes.only', '@study.w.me'][((i % 6) + 6) % 6], 40, y0 + 1240);
    g.font = '28px Inter, Arial'; g.fillText('wait for it... #fyp', 40, y0 + 1290);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(40, y0 + PHH - 60, PHW - 80, 6); g.fillStyle = '#ffffff'; g.fillRect(40, y0 + PHH - 60, (PHW - 80) * ((i * 0.37) % 1), 6);
  }
  let phKey = '';
  // mode: off | feed (k = scroll position, clips) | home (k = typed fraction; ≥ 1 = sent) | desk (p = written, fin = Finish now pressed)
  function drawPhone(mode, k = 0, p = 0, fin = 0) {
    const key = `${mode}${Math.round(k * 90)}${Math.round(p * 3)}${Math.round(fin * 20)}`; if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d');
    if (mode === 'off') { g.fillStyle = '#050508'; g.fillRect(0, 0, PHW, PHH); phT.needsUpdate = true; return; }
    if (mode === 'feed') {
      const i = Math.floor(k), f = k - i, sw = ease(clamp((f - 0.72) / 0.28));   // each clip holds, then swipes up
      drawClip(g, i, -sw * PHH); drawClip(g, i + 1, PHH - sw * PHH);
      g.fillStyle = '#ffffff'; g.font = '600 26px Inter, Arial'; g.fillText(`12:0${Math.min(9, Math.floor(k / 3))}`, 40, 46); g.fillRect(620, 26, 46, 22);
      phT.needsUpdate = true; return;
    }
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    g.fillStyle = '#1d1d1d'; g.font = '600 26px Inter, Arial'; g.fillText('2:03', 40, 46); g.fillRect(620, 26, 46, 22); g.fillStyle = '#ff6a6a'; g.fillRect(623, 29, 9, 16);
    g.drawImage(icon, 30, 78, 52, 52); g.fillStyle = '#1d1d1d'; g.font = '38px Georgia, serif'; g.fillText('Scribe', 94, 118);
    g.fillStyle = RED; g.beginPath(); g.arc(PHW - 64, 104, 28, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('V', PHW - 64, 115); g.textAlign = 'left';
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 152, PHW, 2);
    if (mode === 'home') {
      g.fillStyle = '#1d1d1d'; g.font = '46px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PHW / 2, 440); g.fillText('solving today?', PHW / 2, 498); g.textAlign = 'left';
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(36, 570, PHW - 72, 470, 28); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.stroke();
      g.drawImage(photo, 64, 598, 120, 150); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(64, 598, 120, 150);   // the attached photo (an image preview)
      g.font = '30px Inter, Arial'; const n = Math.round(PROMPT.length * clamp(k)), lines = wrap(g, PROMPT.slice(0, n), PHW - 140);
      g.fillStyle = '#1d1d1d'; lines.forEach((L, i) => g.fillText(L, 66, 806 + i * 42));
      if (k < 1 && Math.floor(k * 30) % 2 === 0) { const L = lines[lines.length - 1] || '', x = 66 + g.measureText(L).width + 3; g.fillRect(x, 778 + Math.max(0, lines.length - 1) * 42, 3, 36); }
      g.fillStyle = '#6a6a6a'; g.font = '600 40px Inter, Arial'; g.fillText('+', 62, 1002);
      const pressed = fin >= 1; g.fillStyle = pressed ? '#5a0e14' : RED; g.beginPath(); g.arc(PHW - 92, 986, 34 * (pressed ? 0.9 : 1), 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(PHW - 92, 1002); g.lineTo(PHW - 92, 970); g.moveTo(PHW - 106, 984); g.lineTo(PHW - 92, 970); g.lineTo(PHW - 78, 984); g.stroke();
      if (fin > 0) { g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(PHW - 86, 994, 26 * (fin >= 1 ? 1.4 : 1), 0, 7); g.fill(); }   // her fingertip on the arrow
    } else {
      // the desk: her prompt on the right with the photo's preview over it, then the page, then the round's row
      g.drawImage(photo, PHW - 196, 176, 136, 170); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(PHW - 196, 176, 136, 170);
      g.font = '24px Inter, Arial'; const lines = wrap(g, PROMPT, 410);
      g.fillStyle = '#e8e2d6'; g.beginPath(); g.roundRect(PHW - 470, 358, 440, 26 + lines.length * 32, 22); g.fill(); g.fillStyle = '#1d1d1d'; lines.forEach((L, i) => g.fillText(L, PHW - 450, 390 + i * 32));
      const py = PY + 40; g.fillStyle = '#fff'; g.fillRect(PX - 4, py - 4, PWp + 8, PHp + 8);
      const tip = sheet.draw(p); g.drawImage(sheet.canvas, PX, py, PWp, PHp); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PX, py, PWp, PHp);
      if (p < sheet.total - 0.5) { const cx = PX + tip[0] * PWp / sheet.w, cy = py + tip[1] * PHp / sheet.h; g.drawImage(nib, cx - 6, cy - 58, 64, 64); }
      const yb = py + PHp + 26; g.fillStyle = '#6a6a6a'; g.font = '26px Inter, Arial'; g.fillText('1 page', 40, yb + 34);
      if (fin < 1) {   // while the pen writes: Pause + Finish now (README §The writing desk); Shuffle · Replay · Export PDF wait, faded
        g.font = '600 26px Inter, Arial'; g.fillStyle = '#3a3a3a'; g.fillText('Pause', 200, yb + 34);
        const fx = 330, fw = 170, pr = fin > 0 ? 1 : 0; g.fillStyle = pr ? '#5a0e14' : RED; g.beginPath(); g.roundRect(fx - 14, yb + 2, fw, 48, 24); g.fill(); g.fillStyle = '#fff'; g.fillText('Finish now', fx, yb + 34);
        g.fillStyle = '#d0cbc0'; g.fillText('Export PDF', 530, yb + 34);
        if (fin > 0) { g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(fx + 70, yb + 30, 30 * (1 + fin * 0.6), 0, 7); g.fill(); }
      } else { g.font = '600 26px Inter, Arial'; g.fillStyle = '#3a3a3a'; g.fillText('Shuffle', 200, yb + 34); g.fillText('Replay', 330, yb + 34); g.fillStyle = RED; g.fillText('Export PDF', 460, yb + 34); }
    }
    phT.needsUpdate = true;
  }
  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrU = V();
  const phoneCam = (u, v, d, fov = 40) => { povPhone.scr.updateWorldMatrix(true, false); povPhone.scr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); povPhone.scr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const pp = scrP.clone().addScaledVector(scrN, d); return { pos: pp.toArray(), look: scrP.toArray(), fov, up: scrU.clone() }; };
  // writing pace: problems 1–2 on "it writes the page in my handwriting", the graph on "graph and all", then FINISH NOW lands the rest
  const p3 = sheet.items.findIndex((it) => it.pi === 2), wOf = (it) => (it.kind === 'p' ? it.w : 1);
  const P12 = sheet.items.slice(0, p3).reduce((s, it) => s + wOf(it), 0), totalS = sheet.total;
  const writeP = (t) => (t >= T.tapAt + 0.08 ? totalS : t < T.graph - 0.15 ? P12 * ease(u01(t, T.it, T.graph - 0.15)) : P12 + (totalS - P12) * 0.8 * u01(t, T.graph - 0.15, T.tapAt));
  const g3 = sheet.items.filter((it) => it.pi === 2 && it.kind === 'p').flatMap((it) => it.pts), gx = g3.map((q) => q[0]), gy = g3.map((q) => q[1]);
  const graphC = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];

  // ---------------------------------------------------------------- Vex (067's look) + the phone in her LEFT hand
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xffdcc4, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const PGRIP = [0.45, 0.3, 0.36, 0.42, 0.48];   // fingers along the phone's back, the tips round its far edge, the thumb on the near edge
  // her left arm (her frame: +x = her left, +z = forward): phone up to read (look), lower at her waist while she talks (waist)
  const HOLD = {
    look: [[0.16, -0.9, 0.3], [-0.32, 0.42, 0.85]],
    waist: [[0.2, -0.97, 0.12], [-0.22, -0.32, 0.92]],
  };
  const L_FREE = { hip: ARMS.hip.L, rest: ARMS.rest.L };
  const R_ARMS = { rest: [[-0.24, -1, 0.04], [-0.12, -1, 0.14]], hip: [[-0.62, -0.72, -0.18], [0.72, -0.62, 0.22]], ...Object.fromEntries(['point', 'peace', 'kissOut', 'wave', 'beckon'].map((k) => [k, ARMS[k].R])),
    fist: [[-0.3, -0.45, 0.6], [0.25, 0.92, 0.25]], wide: [[-0.92, -0.38, 0.12], [-0.88, 0.12, 0.45]], temple: [[-0.5, 0.82, 0.12], [0.72, 0.42, 0.1]] };
  const R_HAND = { rest: 'relax', hip: 'relax', point: 'point', peace: 'peace', kissOut: 'open', wave: 'open', beckon: 'beckon', temple: 'point', fist: 'fist', wide: 'open' };
  const P0 = { x: 0.32, z: -1.5, y: FY, rotY: 0 };
  VEX.update(0, { pose: 'rest', ...P0, armL: HOLD.look, hands: { L: PGRIP } }); VEX.root.updateMatrixWorld(true);
  const HEADY = VEX.bpos('head').y;
  {
    const hb = VEX.bpos('leftHand'), mid = VEX.bpos('leftMiddleProximal'), idx = VEX.bpos('leftIndexProximal'), lit = VEX.bpos('leftLittleProximal');
    const fwd = mid.clone().sub(hb).normalize(), axis = idx.clone().sub(lit).normalize(), palm = fwd.clone().cross(axis).normalize();
    const zA = palm.clone(), yA = axis.clone().addScaledVector(zA, -axis.dot(zA)).normalize(), xA = yA.clone().cross(zA).normalize();
    const c = hb.clone().lerp(mid, 0.5).addScaledVector(palm, 0.004 + 0.013).addScaledVector(fwd, 0.028).addScaledVector(yA, 0.012);
    const grp = VEX.attach('leftHand', c.toArray()); grp.add(herPhone.g);
    // VEX.attach gives a group whose axes match the world at attach time: orient the phone in world terms
    herPhone.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
  }
  // a hand holds a phone so its screen faces her eyes: search the forearm twist + wrist per preset (at build)
  const FIX = {}, qq = new THREE.Quaternion(), up = V(0, 1, 0);
  for (const [name, arm] of Object.entries(HOLD)) {
    let best = { score: -9, tw: 0, hd: arm[1] };
    for (const dx of [-0.6, -0.3, 0, 0.3, 0.6]) for (const dy of [-0.6, -0.3, 0, 0.3, 0.6]) for (let tw = -1.6; tw <= 1.6001; tw += 0.1) {
      const hd = V(arm[1][0] + dx, arm[1][1] + dy, arm[1][2]).normalize().toArray();
      VEX.update(0, { pose: 'rest', ...P0, armL: arm, hands: { L: PGRIP }, aim: { 'twist.leftLowerArm': tw, leftHand: hd } }); VEX.root.updateMatrixWorld(true);
      const pc = herPhone.g.getWorldPosition(V()), q = herPhone.g.getWorldQuaternion(qq), n = V(0, 0, 1).applyQuaternion(q), ya = V(0, 1, 0).applyQuaternion(q);
      const eye = VEX.bpos('head').add(V(0, 0.06, 0.08)), to = eye.sub(pc).normalize();
      const score = n.dot(to) + 0.35 * ya.dot(up) - 0.03 * Math.abs(tw) - 0.02 * (Math.abs(dx) + Math.abs(dy));
      if (score > best.score) best = { score, tw, hd, nd: n.dot(to), yu: ya.dot(up) };
    }
    FIX[name] = best;
  }
  console.log('[081] phone fix', JSON.stringify(Object.fromEntries(Object.entries(FIX).map(([k, v]) => [k, [v.tw.toFixed(2), v.nd.toFixed(2), v.yu.toFixed(2)]]))));
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  const armsOf = (v) => ({ L: v.ph ? HOLD[v.ph] : L_FREE[v.l || 'hip'], R: R_ARMS[v.r || 'rest'] });
  const fixOf = (v) => (v.ph ? FIX[v.ph] : { tw: 0, hd: null });
  function glide(vexFn, t, v) {   // blend the arms over 0.28 s whenever the shot's pose function switches preset (pure: re-evaluates the past)
    const cur = armsOf(v); let L = cur.L, R = cur.R; const fx = fixOf(v); let tw = fx.tw, hd = fx.hd;
    for (const side of ['L', 'R']) for (let d = 0.04; d <= 0.32; d += 0.04) { const pvv = vexFn(t - d), pv = armsOf(pvv); if (pv[side] !== cur[side]) { const k = ease(clamp((d - 0.02) / 0.28));
      if (side === 'L') { L = mixArm(pv.L, cur.L, k); const f0 = fixOf(pvv); if (f0.hd && fx.hd) { tw = f0.tw + (fx.tw - f0.tw) * k; hd = f0.hd.map((x, i) => x + (fx.hd[i] - x) * k); } } else R = mixArm(pv.R, cur.R, k); break; } }
    return { ...v, armL: L, armR: R, phTw: tw, phHd: hd };
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident, big-eyed face

  // ---------------------------------------------------------------- Derek (073's toon), lying on his loft bed, scrolling
  const derek = makeToon({ skin: 0xf1c7a0, shirt: 0xd8343a, pants: 0x34495e, hair: 0x3a2414, hairStyle: 'messy' });
  const dCar = new THREE.Group(); DM.root.add(dCar); dCar.add(derek.root); dCar.rotation.y = PI / 2;   // head toward −x (his pillow)
  const dPhoneMat = new THREE.MeshBasicMaterial({ color: 0xcfe4ff, toneMapped: false });
  const dPhone = phoneModel(dPhoneMat, 0x3ec7ff); dPhone.g.scale.setScalar(1.25); DM.root.add(dPhone.g);
  const glowD = new THREE.PointLight(0xa8c8ff, 0.5, 1.0, 2); dPhone.g.add(glowD); glowD.position.set(0, 0, 0.1);
  const dizzy = makeDizzy(DM.root, { r: 0.2, n: 4, size: 0.06 });
  const DPOSE = (t) => {
    const dropped = t >= T.drop, k = u01(t, T.drop, T.bonk), hit = t >= T.bonk;
    return { rx: -PI / 2, x: 0, y: 0, z: 0, lean: 0, legL: { x: 0.05, kn: 0.15 }, legR: { x: -0.05, kn: 0.35 },
      armL: dropped ? { x: -1.0 + 0.9 * k, z: 0.5, el: 0.4 } : { x: -1.45 + 0.04 * Math.sin(t * 2), z: 0.32, el: 0.95 },
      armR: dropped ? { x: -1.0 + 0.9 * k, z: 0.5, el: 0.4 } : { x: -1.45 + 0.04 * Math.sin(t * 2), z: 0.32, el: 0.95 },
      head: { x: 0.55, y: 0, z: 0 }, eyes: hit ? 'spiral' : t > T.learning ? 'half' : 'open', mouth: hit ? 'o' : 'flat', look: [0, 0.6], brows: hit ? 0.8 : 0.2, t };
  };
  derek.set(DPOSE(0)); dCar.updateMatrixWorld(true);
  const DLX = (DD.loft.x0 + DD.loft.x1) / 2 - 0.05, DLZ = (DD.loft.z0 + DD.loft.z1) / 2;
  { const bb = new THREE.Box3().setFromObject(derek.root); const ctr = bb.getCenter(V()); dCar.position.set(DLX - ctr.x, DD.loftTop + 0.08 - bb.min.y, DLZ - ctr.z); }
  const dHead = () => derek.head.getWorldPosition(V());
  const dHeadC = () => new THREE.Box3().setFromObject(derek.head).getCenter(V());

  // ---------------------------------------------------------------- overlay: title, callouts, end card; the PIXEL cards + the clock HUD (270 × 480, ×4)
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 8, calloutColor: '#ffd43b',
    title: { lines: ['WHAT SCROLLING IN BED', 'DOES TO YOUR BRAIN'], t0: 0, t1: T.mid - 0.05, y: 0.13, plain: false, s: 8, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const dg = document.createElement('canvas'); dg.width = 270; dg.height = 480; Object.assign(dg.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', imageRendering: 'pixelated', pointerEvents: 'none' }); ui.insertBefore(dg, ui.firstChild);
  const dctx = dg.getContext('2d'); dctx.imageSmoothingEnabled = false;
  const txtCache = new Map(), ptxt = (s, color, x, y, sc = 1, align = 'center') => { const kk = s + color; let cv = txtCache.get(kk); if (!cv) { cv = pixelText(s, { color }); txtCache.set(kk, cv); } const w = cv.width * sc; dctx.drawImage(cv, Math.round(align === 'left' ? x : x - w / 2), Math.round(y - cv.height * sc / 2), w, cv.height * sc); };
  const panel = (x0, y0, x1, y1) => { dctx.fillStyle = 'rgba(10,8,16,.86)'; dctx.fillRect(x0, y0, x1 - x0, y1 - y0); dctx.fillStyle = '#f2e6ff'; dctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y1, x1 - x0 + 4, 2); dctx.fillRect(x0 - 2, y0, 2, y1 - y0); dctx.fillRect(x1, y0, 2, y1 - y0); };
  const R = (c, x, y, w, h) => { dctx.fillStyle = c; dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const ORANGE = '#ff9a3a', CREAM = '#fff4c2', RD = '#ff6a6a', GREEN = '#7cf05f', LILAC = '#c8a0ff', BLUE = '#4aa8ff', GREY = '#9a92aa';
  const pxPhone = (x, y, glow) => { R('#2a1a34', x, y, 18, 32); R(glow ? '#cfe4ff' : '#101018', x + 2, y + 3, 14, 25); if (glow) for (let i = 0; i < 4; i++) R(BLUE, x + 22 + i * 7, y + 6 + i * 2, 4, 2); };
  const pxMoon = (x, y) => { R(CREAM, x, y, 14, 14); R('#0a0810', x + 5, y - 2, 12, 12); };
  const pxPerson = (x, y, c) => { R(c, x + 1, y, 3, 3); R(c, x, y + 4, 5, 5); };
  const pxBrain = (x, y) => { for (let yy = -16; yy <= 16; yy += 2) for (let xx = -24; xx <= 24; xx += 2) { const e = (xx / 24) ** 2 + (yy / 16) ** 2; if (e < 1) R(e > 0.78 ? '#ff7aa0' : ((xx + yy * 3 + 64) % 10 < 2 ? '#d85a80' : '#ffb0c4'), x + xx, y + yy, 2, 2); } R('#ff7aa0', x - 2, y - 15, 2, 30); };
  const Y0 = 210, Y1 = 330;
  let dgKey = '';
  const CLOCK = (t) => (t < T.mid ? null : t < T.study ? ['12:00 AM', 'JUST ONE MORE'] : t < T.derek ? ['1:00 AM', 'STILL SCROLLING'] : t < T.pivot ? ['1:30 AM', 'DEREK, TOO'] : t < T.tipsy ? ['2:00 AM', 'HOMEWORK'] : t < T.mem ? ['2:10 AM', '18 H AWAKE'] : t < T.end ? ['2:10 AM', 'ALL-NIGHTER?'] : ['2:12 AM', 'LIGHTS OUT']);
  function diagram(t, sh) {
    const id = sh.card || null; let k = 0;
    if (id === 'blue') k = t < T.about - 0.1 ? u01(t, T.melatonin - 0.3, T.hormone + 0.3) : u01(t, T.about - 0.1, T.green + 0.4);
    else if (id === 'study') k = t < T.every - 0.1 ? u01(t, T.forty5 - 0.1, T.students + 0.5) : u01(t, T.cost ?? T.t24 - 0.6, T.t24 + 0.4);
    else if (id === 'odds') k = u01(t, T.f59 - 0.1, T.insomnia + 0.2);
    else if (id === 'tipsy') k = t < T.test - 0.2 ? u01(t, T.tipsy, T.awake + 0.3) : u01(t, T.test - 0.2, T.tipsyW + 0.3);
    else if (id === 'memory') k = u01(t, T.memories - 0.3, T.percent + 0.2);
    const clock = !sh.phone && t < T.card ? CLOCK(t) : null;
    const bonk = sh.id === 'derek' && t > T.bonk && t < T.bonk + 0.55;
    const key = `${id}${Math.round(k * 50)}${clock ? clock[0] + clock[1] : ''}${id === 'blue' && t >= T.about - 0.1 ? 'b' : ''}${id === 'study' && t >= T.every - 0.1 ? 'b' : ''}${id === 'tipsy' && t >= T.test - 0.2 ? 'b' : ''}${id === 'blue' || id === 'memory' ? Math.round(t * 6) : ''}${bonk ? 'K' + Math.round(t * 20) : ''}`; if (key === dgKey) return; dgKey = key;
    dctx.clearRect(0, 0, 270, 480);
    if (clock) { panel(10, 80, 124, 116); ptxt(clock[0], '#ffffff', 67, 91, 2); ptxt(clock[1], ORANGE, 67, 108); }
    if (bonk) { const s = 2 + boing(u01(t, T.bonk, T.bonk + 0.25)); ptxt('BONK!', '#ffd43b', 150, 168, s); }
    if (!id) return;
    panel(18, Y0, 252, Y1);
    if (id === 'blue') {
      if (t < T.about - 0.1) { ptxt('MELATONIN: YOUR SLEEP HORMONE', '#ffd43b', 135, Y0 + 11);
        pxPhone(44, Y0 + 40, true); for (let i = 0; i < 6; i++) { const ph = ((t * 2 + i / 6) % 1); R(BLUE, 70 + ph * 70, Y0 + 44 + i * 5, 6, 2); }
        const base = Y1 - 22, H = 70, f = 0.85 - 0.6 * ease(k) + 0.03 * Math.sin(t * 9); R('#2a2640', 170, base - H, 30, H); R(LILAC, 170, base - H * f, 30, H * f); pxMoon(212, base - H + 4);
        ptxt('MELATONIN', LILAC, 185, Y1 - 10); if (k > 0.55) ptxt('HELD BACK', RD, 100, Y1 - 10); }
      else { ptxt('HOW LONG MELATONIN IS HELD BACK', '#ffd43b', 135, Y0 + 11);
        const x0 = 90, wG = 60 * ease(clamp(k * 2)), wB = 120 * ease(u01(k, 0.35, 1));
        ptxt('GREEN', GREEN, 54, Y0 + 44); R('#2a2640', x0, Y0 + 38, 130, 14); R(GREEN, x0, Y0 + 38, wG, 14); if (k > 0.3) ptxt('1X', '#ffffff', x0 + wG + 12, Y0 + 45);
        ptxt('BLUE', BLUE, 54, Y0 + 74); R('#2a2640', x0, Y0 + 68, 130, 14); R(BLUE, x0, Y0 + 68, wB, 14); if (k > 0.85) ptxt('2X', '#ffffff', Math.min(236, x0 + wB + 12), Y0 + 75);
        ptxt('SAME BRIGHTNESS, 6.5 H OF LIGHT', GREY, 135, Y1 - 12); }
    }
    if (id === 'study') {
      if (t < T.every - 0.1) { ptxt('45,202 STUDENTS, AGES 18-28', '#ffd43b', 135, Y0 + 11);
        const n = Math.round(72 * ease(k)); for (let i = 0; i < n; i++) { const col = i % 18, row = Math.floor(i / 18); pxPerson(40 + col * 11, Y0 + 32 + row * 14, [LILAC, CREAM, BLUE, ORANGE][(i * 7) % 4]); }
        ptxt('A 2022 NATIONAL SURVEY', GREY, 135, Y1 - 12); }
      else { ptxt('EACH EXTRA HOUR ON A SCREEN IN BED', '#ffd43b', 135, Y0 + 11);
        pxPhone(48, Y0 + 40, true); ptxt('+1 H', '#ffffff', 58, Y0 + 86, 1);
        for (let i = 0; i < 5; i++) R('#f2e6ff', 96 + i * 8, Y0 + 54, 5, 2); R('#f2e6ff', 134, Y0 + 51, 2, 8);
        pxMoon(156, Y0 + 44); if (k > 0) ptxt('-24 MIN', RD, 204, Y0 + 54, 1 + ease(k)); ptxt('OF SLEEP', '#ffffff', 204, Y0 + 82); }
    }
    if (id === 'odds') { ptxt('ODDS OF INSOMNIA SYMPTOMS', '#ffd43b', 135, Y0 + 11);
      const base = Y1 - 26, h0 = 48, h1 = 48 * (1 + 0.59 * ease(k));
      R('#2a2640', 70, base - 80, 40, 80); R(LILAC, 70, base - h0, 40, h0); R('#2a2640', 160, base - 80, 40, 80); R(RD, 160, base - h1, 40, h1);
      ptxt('BEFORE', '#ffffff', 90, Y1 - 12); ptxt('+1 HOUR', '#ffffff', 180, Y1 - 12); if (k > 0.6) ptxt('+59%', RD, 180, base - h1 - 10, 2); }
    if (id === 'tipsy') {
      if (t < T.test - 0.2) { ptxt('AWAKE SINCE 8 AM', '#ffd43b', 135, Y0 + 11);
        const x0 = 34, x1 = 236, yb = Y0 + 60, f = ease(k); R('#2a2640', x0, yb, x1 - x0, 12); R(ORANGE, x0, yb, (x1 - x0) * f, 12);
        ptxt('8 AM', GREY, x0 + 10, yb + 24); ptxt('2 AM', '#ffffff', x1 - 12, yb + 24); ptxt(`${Math.round(18 * f)} HOURS`, '#ffffff', 135, Y1 - 22, 2); }
      else { ptxt('17-19 H AWAKE, ON SOME TESTS', '#ffd43b', 135, Y0 + 11);
        ptxt('AS BAD AS', '#ffffff', 135, Y0 + 44, 1); ptxt('0.05% BAC', RD, 135, Y0 + 70, 2 + 0.6 * ease(k));
        ptxt('(THAT\'S TIPSY)', GREY, 135, Y1 - 14); }
    }
    if (id === 'memory') { ptxt('MAKING NEW MEMORIES', '#ffd43b', 135, Y0 + 11);
      pxBrain(58, Y0 + 62); const f = ease(k), x0 = 104, W1 = 120;
      ptxt('SLEPT', GREEN, x0 + 4, Y0 + 32, 1, 'left'); R('#2a2640', x0, Y0 + 40, W1, 12); R(GREEN, x0, Y0 + 40, W1, 12);
      ptxt('ALL-NIGHTER', RD, x0 + 4, Y0 + 66, 1, 'left'); R('#2a2640', x0, Y0 + 74, W1, 12); R(RD, x0, Y0 + 74, W1 * (1 - 0.4 * f), 12);
      if (f > 0.6) ptxt('UP TO -40%', RD, 135, Y1 - 14, 1 + f); }
  }

  // ---------------------------------------------------------------- shots
  const LK = (drop) => HEADY - drop;   // aim heights relative to her head bone
  const eyesW = () => VEX.bpos('leftEye').add(VEX.bpos('rightEye')).multiplyScalar(0.5);
  function faceFrame(c) {   // eyes at c.frac of the frame height (0 = top): solve the look height from the lens, the fov and her eyes
    const E = eyesW(), C = V(...c.pos), a = Math.atan2(E.y - C.y, Math.hypot(E.x - C.x, E.z - C.z)), th = a - Math.atan((1 - 2 * c.frac) * Math.tan(c.fov * PI / 360));
    return { ...c, look: [c.at[0], C.y + Math.tan(th) * Math.hypot(c.at[0] - C.x, c.at[1] - C.z), c.at[1]] };
  }
  const SH = [
    { id: 'open', t0: 0, vex: (t) => ({ ...P0, ph: 'look', r: 'rest', tilt: 0.06, nod: 0.18, face: CONF(t, { relaxed: 0.2 }), look: [0, -0.5] }),
      cam: (t) => { const k = ease(u01(t, 0, T.heres)); return { pos: [P0.x + 0.3 - 0.12 * k, LK(0.02), P0.z + 1.25 - 0.25 * k], at: [P0.x + 0.02, P0.z], frac: 0.36, fov: 44 }; } },
    { id: 'hook', t0: T.heres - 0.12, vex: (t) => ({ ...P0, ph: 'waist', r: t > T.brain - 0.35 ? 'temple' : 'hip', tilt: -0.06, turn: 0.04, face: CONF(t, { relaxed: 0.16 }) }),
      cam: (t) => ({ pos: [P0.x - 0.15, LK(0.08), P0.z + 1.85 - 0.12 * u01(t, T.heres, T.mid)], at: [P0.x, P0.z], frac: 0.35, fov: 46 }) },
    { id: 'feed', t0: T.mid, phone: 'feed' },
    { id: 'blue', t0: T.melatonin - 0.45, card: 'blue', vex: (t) => ({ ...P0, ph: t < T.about - 0.2 ? 'look' : 'waist', r: t > T.twice - 0.3 ? 'peace' : 'hip', tilt: 0.08, face: CONF(t, { relaxed: 0.14, surprised: t > T.twice - 0.1 ? 0.18 : 0 }), look: t < T.about - 0.2 ? [0, -0.4] : [0, 0] }),
      cam: (t) => ({ pos: [P0.x + 0.55, LK(0.06), P0.z + 2.0 - 0.15 * u01(t, T.melatonin, T.study)], at: [P0.x + 0.05, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'dorm', t0: T.study, wide: true, derek: true, vex: (t) => ({ ...P0, ph: 'look', r: 'rest', tilt: 0.05, nod: 0.15, face: CONF(t, { relaxed: 0.2 }), look: [0, -0.5] }),
      cam: (t) => { const k = ease(u01(t, T.study, T.forty5)); return { pos: [0.3 - 0.05 * k, 2.75, 6.0 - 0.25 * k], look: [0.25, 2.7, -1.6], fov: 46 }; } },
    { id: 'stat', t0: T.forty5 - 0.1, card: 'study', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.t24 - 0.3 ? 'point' : 'hip', tilt: -0.07, face: CONF(t, { relaxed: 0.12 }) }),
      cam: (t) => ({ pos: [P0.x - 0.6, LK(0.05), P0.z + 1.95 - 0.12 * u01(t, T.forty5, T.odds)], at: [P0.x - 0.05, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'stat2', t0: T.every - 0.1, card: 'study', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.t24 - 0.3 ? 'point' : 'hip', tilt: 0.06, turn: 0.06, face: CONF(t, { relaxed: 0.14 }) }),
      cam: (t) => ({ pos: [P0.x + 0.38, LK(0.0), P0.z + 1.6 - 0.1 * u01(t, T.every, T.odds)], at: [P0.x + 0.02, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'odds', t0: T.odds, card: 'odds', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.f59 - 0.2 ? 'fist' : 'hip', tilt: 0.1, lean: 0.04, face: CONF(t, { surprised: 0.15 }) }),
      cam: (t) => ({ pos: [P0.x + 0.2, LK(0.02), P0.z + 1.8 - 0.1 * u01(t, T.odds, T.derek)], at: [P0.x, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'derek', t0: T.derek, derek: true,
      cam: (t) => { const h = dHeadC(), k = ease(u01(t, T.derek, T.hard)); return { pos: [h.x + 1.55 - 0.12 * k, h.y + 0.72 - 0.04 * k, h.z + 0.95 - 0.08 * k], look: [h.x + 0.3, h.y + 0.02, h.z], fov: 44 }; } },
    { id: 'cute', t0: T.cute - 0.18, vex: (t) => ({ ...P0, ph: 'waist', r: 'hip', tilt: -0.12, nod: 0.12, turn: -0.08, face: CONF(t, { relaxed: 0.25, blinkLeft: t > T.cute + 0.18 ? 1 : 0 }), look: [-0.1, -0.35] }),
      cam: (t) => ({ pos: [P0.x + 0.1, LK(-0.02), P0.z + 1.05], at: [P0.x, P0.z], frac: 0.38, fov: 42 }) },
    { id: 'pivot', t0: T.pivot, vex: (t) => ({ ...P0, ph: 'waist', r: t > T.bio - 0.3 ? 'wide' : 'hip', tilt: 0.12, lean: 0.03, face: CONF(t, { relaxed: 0.2, angry: 0.18 }), look: t > T.still - 0.1 && t < T.nine ? [0.2, 0.6] : [0, 0] }),
      cam: (t) => ({ pos: [P0.x - 0.45, LK(0.06), P0.z + 1.7 - 0.12 * u01(t, T.pivot, T.scribe)], at: [P0.x, P0.z], frac: 0.35, fov: 46 }) },
    { id: 'home', t0: T.scribe, phone: 'home' },
    { id: 'write', t0: T.it - 0.06, phone: 'write' },
    { id: 'graph', t0: T.graph - 0.12, phone: 'graph' },
    { id: 'finish', t0: T.tap - 0.3, phone: 'finish' },
    { id: 'tipsy', t0: T.tipsy, card: 'tipsy', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.test - 0.3 ? 'wave' : 'hip', tilt: 0.14 * Math.sin(t * 2.2), lean: 0.03, face: CONF(t, { relaxed: 0.3, blink: Math.max(0.18, lids(t)) }) }),
      cam: (t) => ({ pos: [P0.x + 0.6, LK(0.04), P0.z + 1.95 - 0.12 * u01(t, T.tipsy, T.mem)], at: [P0.x + 0.05, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'tipsy2', t0: T.test - 0.25, card: 'tipsy', vex: (t) => ({ ...P0, ph: 'waist', r: 'wave', tilt: 0.16 * Math.sin(t * 2.2), lean: 0.03, face: CONF(t, { relaxed: 0.32, blink: Math.max(0.2, lids(t)) }) }),
      cam: (t) => ({ pos: [P0.x - 0.32, LK(0.0), P0.z + 1.6 - 0.1 * u01(t, T.test, T.mem)], at: [P0.x, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'memory', t0: T.mem, card: 'memory', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.allnighter - 0.2 ? 'temple' : 'hip', tilt: -0.08, face: CONF(t, { angry: 0.16 }) }),
      cam: (t) => ({ pos: [P0.x - 0.5, LK(0.04), P0.z + 1.9 - 0.12 * u01(t, T.mem, T.end)], at: [P0.x - 0.03, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'mem2', t0: T.memories - 0.1, card: 'memory', vex: (t) => ({ ...P0, ph: 'waist', r: t > T.drop - 0.2 ? 'point' : 'temple', tilt: 0.08, face: CONF(t, { angry: 0.14, surprised: t > T.forty - 0.1 ? 0.15 : 0 }) }),
      cam: (t) => ({ pos: [P0.x + 0.42, LK(0.02), P0.z + 1.6 - 0.1 * u01(t, T.memories, T.end)], at: [P0.x + 0.02, P0.z], frac: 0.31, fov: 46 }) },
    { id: 'end', t0: T.end, dim: true, vex: (t) => ({ ...P0, ph: 'waist', r: t > T.ill - 0.35 ? 'point' : t > T.go - 0.2 ? 'hip' : 'rest', tilt: -0.08, face: CONF(t, { relaxed: t > T.ill ? 0.22 : 0.1, blinkLeft: t > T.know + 0.1 && t < T.know + 0.9 ? 1 : 0 }) }),
      cam: (t) => ({ pos: [P0.x + 0.05, LK(0.02), P0.z + 1.35 + 0.1 * u01(t, T.end, T.card)], at: [P0.x, P0.z], frac: 0.37, fov: 46 }) },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const poseVex = (sh, t, frozen = false) => { const tv = frozen ? sh.t0 : t, v = glide(sh.vex, tv, sh.vex(tv)); const aim = v.phHd ? { 'twist.leftLowerArm': v.phTw, leftHand: v.phHd } : {};
    VEX.update(tv, { ...(frozen ? { mouth: 0 } : lips(t)), sway: frozen ? 0 : 0.15, ...v, aim, hands: { L: PGRIP, R: R_HAND[v.r || 'rest'] }, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: v.y ?? 0, rotY: v.rotY ?? 0 }); VEX.root.updateMatrixWorld(true); return v; };
  // the phone-POV shots ride her held phone: pose her in the 'look' hold (frozen) and hide her head (the lens sits where her eyes are)
  const PHONE_VEX = (t) => ({ ...P0, ph: 'look', r: 'rest', face: CONF(t) });

  const KEYK = 0.6, FILLK = 0.6;   // the dorm's key + the lens fill, scaled down for Vex's toon skin (cheek RGB vs ~235/213/205)
  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    // night: the room lamp low, fairy lights on; Derek's room dimmer; "go to sleep" dims both
    const dimK = sh.dim ? ease(u01(t, T.go - 0.1, T.ill)) : 0;
    { const u = 0.62 - 0.32 * dimK, l = sh.derek ? (sh.wide ? 0.7 : 0.95) : 0.42 - 0.2 * dimK; DM.setPower(u, l); DM.lights.key.intensity = 1.7 * (0.08 + 0.92 * Math.min(u, l)) * KEYK; }
    // the phone screen: the feed while she scrolls, Scribe from 2 AM, off on "phone down"
    if (t < T.scribe) drawPhone('feed', Math.max(0, (t - 0.2) * 1.15));
    else if (t < T.it - 0.06) drawPhone('home', u01(t, T.scribe - 0.6, T.open + 0.2), 0, t > T.it - 0.28 ? 1 : t > T.it - 0.55 ? 0.5 : 0);
    else if (t < T.tipsy) drawPhone('desk', 0, writeP(t), t < T.tapAt ? 0 : t < T.tapAt + 0.3 ? u01(t, T.tapAt, T.tapAt + 0.3) * 0.99 : 1);
    else if (t < T.down) drawPhone('feed', 40 + (t - T.tipsy) * 0.9);
    else drawPhone('off');
    // Vex
    const onPhone = !!sh.phone;
    VEX.root.visible = !!sh.vex;
    if (sh.vex) poseVex(sh, t);
    else if (onPhone) { VEX.root.visible = true; poseVex({ t0: sh.t0, vex: PHONE_VEX }, sh.t0, true); herPhone.g.updateWorldMatrix(true, false); herPhone.g.matrixWorld.decompose(povPhone.g.position, povPhone.g.quaternion, povPhone.g.scale); VEX.root.visible = false; }
    povPhone.g.visible = onPhone;
    glowV.intensity = t < T.down ? (sh.wide ? 0.35 : 0.13) : 0;
    // Derek: on his back on the loft, scrolling; the phone drops on his face on "the hard way"
    const showD = !!sh.derek;
    derek.root.visible = showD; dPhone.g.visible = showD; glowD.intensity = showD ? 0.45 : 0;
    if (showD) {
      derek.set(DPOSE(t)); dCar.updateMatrixWorld(true);
      const h1 = derek.hand(-1).getWorldPosition(V()), h2 = derek.hand(1).getWorldPosition(V()), hd = dHead();
      const held = h1.add(h2).multiplyScalar(0.5).add(V(0, 0.02, 0)), rest = hd.clone().add(V(0.02, 0.2, 0.0));
      const k = u01(t, T.drop, T.bonk), pos = t < T.drop ? held : t < T.bonk ? held.clone().lerp(rest, k * k) : rest.clone().add(V(0, 0.04 * Math.max(0, 1 - (t - T.bonk) / 0.15) * Math.sin((t - T.bonk) * 40), 0));
      dPhone.g.position.copy(pos); dPhone.g.rotation.set(PI / 2, 0, PI / 2 + (t >= T.drop ? 0.4 * k : 0));   // screen down toward his face
      dPhoneMat.color.set(t < T.bonk ? 0xcfe4ff : 0x9ab8e0);
      dizzy.update(t, t > T.bonk ? 1 : 0, hd.clone().add(V(0, 0.32, 0)).toArray());
    } else dizzy.update(t, 0, [0, 0, 0]);
    // camera
    let cam;
    if (sh.phone === 'feed') cam = phoneCam(0.5, 0.5, 0.235 - 0.02 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'home') cam = phoneCam(0.5, 0.52, 0.215 - 0.015 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'write') cam = phoneCam(0.5, 0.48, 0.17 - 0.012 * u01(t, sh.t0, sh.t1));
    else if (sh.phone === 'graph') { const gu = (PX + graphC[0] * PWp / sheet.w) / PHW, gv = (PY + 40 + graphC[1] * PHp / sheet.h) / PHH; cam = phoneCam(gu, gv + 0.01, 0.13 - 0.012 * u01(t, sh.t0, sh.t1)); }
    else if (sh.phone === 'finish') cam = phoneCam(0.5, 0.6, 0.2 + 0.02 * u01(t, sh.t0, sh.t1));
    else { cam = sh.cam(t); if (cam.frac) cam = faceFrame(cam); }
    if (SIDE_DBG && sh.vex) { const h = VEX.bpos('leftHand'), f = V(Math.sin(P0.rotY), 0, Math.cos(P0.rotY)), sd = V(f.z, 0, -f.x); cam = { pos: h.clone().addScaledVector(sd, 0.7).addScaledVector(f, 0.2).add(V(0, 0.05, 0)).toArray(), look: h.toArray(), fov: 40 }; }
    let amp = 0;
    if (sh.id === 'derek') { const a = t - T.bonk; if (a >= 0 && a < 0.3) amp = 0.02 * (1 - a / 0.3); }
    studio.camera.up.copy(cam.up || up);
    studio.camera.near = onPhone ? 0.02 : 0.05; studio.camera.far = 60; studio.camera.updateProjectionMatrix();
    studio.setCamera(cam.pos, cam.look, cam.fov, t, amp);
    { const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0));
      fill.intensity = sh.vex ? FILLK * Math.min(1.4, 0.24 * Math.pow(d, 1.6)) * (d < 1.2 ? 0.8 : 1) * (1 - 0.35 * dimK) : sh.derek ? (sh.wide ? 1.1 : 2.4) : 0; }
    diagram(t, sh);
    pixel.set(onPhone ? 1 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
