// 059 — "What if you DOUBLED in size every 3 seconds?" — Scribe promo, the NEW VOXEL style (engine/voxel/), no narrator.
// A dupe of @whatifpov's reel of the same name (instagram.com/whatifpov/reel/DemVHQDooNo, Oct 17 2026, 108.5K likes by Nov 9;
// docs/reference/whatifpov.md): cold open on the end state → VHS rewind (⏪, the counter spinning back) → a mundane POV walk →
// one doubling = one shot = one italic subtitle every 3 s, real benchmarks in the HUD → back to the cold open's frame.
// Their beats: walking to work with a coffee · getting shorter (everyone else) · your coffee didn't grow · cars crunch like cans ·
// taller than the rooftops · people look like ants · buildings at your knees · every step an earthquake · taller than the
// Empire State · your head enters the clouds. Ours: walking to SCHOOL with a biology worksheet (the coffee → the homework), the
// pencil didn't grow, cars crunch, taller than your school, the roof banner (40 problems, handwritten, due at 8), the homework is
// a grain of rice → ONE PHOTO WITH SCRIBE (58 % in) → solved in YOUR handwriting (the Punnett square drawn by the pen) → printed
// in Room 4 → your head is in the clouds → the Scribe end card.
//
// THE MATH (HUD): height H = 1.70 m · 2^((t − 4)/3), real time, from t = 4 s. Benchmarks are printed when H passes them:
//   basketball rim 3.05 m (regulation)                          t =  6.5      giraffe 5.8 m (the tallest on record ≈ 5.88 m)   t =  9.3
//   a 4-storey building ≈ 14 m                                  t = 13.1      our school's clock tower 21 m                    t = 14.9
//   Leaning Tower of Pisa 56.7 m (high side)                    t = 19.2      Big Ben (Elizabeth Tower) 96 m                   t = 21.5
//   Great Pyramid of Giza 138.5 m (today)                       t = 23.1      Washington Monument 169.3 m                      t = 23.9
//   Eiffel Tower 330 m (with antennas, 2022)                    t = 26.8      Empire State Building 443 m (to the tip)         t = 28.1
//   Burj Khalifa 828 m                                          t = 30.8      fair-weather cumulus bases ≈ 1–2 km (our layer 1.3 km)
// Sizes: a US-letter worksheet 21.6 × 27.9 cm, a pencil 19 cm. At 2× the pencil is a 9.5 cm stick to you, at 3× (5.1 m) a 6.3 cm
// toothpick; at 50× (86 m) the sheet is 5.6 mm (a grain of rice ≈ 6 mm).
// Scribe claims (docs/lanes/scribe.md; Scribe README §Biology): a photo of the homework → every problem solved with worked steps →
// written in the student's own handwriting, stroke by stroke, with the figures a solution needs (Punnett squares) → a PDF. The
// classroom printer prints that PDF. Biology is a real Scribe subject (manager steer, Nov 9: rotate subjects, no math-only sheets).
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { K, clamp, lerp, smooth, easeIO, rng, walkLegs } from '@engine/core.js';
import { buildVoxTown, buildVoxClassroom, makeVoxPerson, randomOutfit, ARMS, voxPhone, voxPaper, voxPencil, boxModel, colorBlock, textCanvas, nearestTex, pixelCanvas } from '@engine/voxel/index.js';
import { loadHand, loadImg, makeSheet, punnettFig } from '@engine/build/scribe.js';

const PI = Math.PI;
export const H0 = 1.7, T0 = 4.0;
export const Hof = (tau) => H0 * Math.pow(2, Math.max(0, tau - T0) / 3);
export const sOf = (tau) => Hof(tau) / H0;
const OFF_C = [0, 0, 9000];                         // the classroom (Room 4) is parked far from the town
export const RW = [2.0, 3.0];                       // the VHS rewind
export const ENDC = 37.0;                           // the Scribe end card
export const SHOTS = [
  { t0: 3, t1: 6, cam: 'povWalk' }, { t0: 6, t1: 9, cam: 'side' }, { t0: 9, t1: 12, cam: 'povPencil' }, { t0: 12, t1: 15, cam: 'crunch' },
  { t0: 15, t1: 16.5, cam: 'kids' }, { t0: 16.5, t1: 18, cam: 'school' }, { t0: 18, t1: 21, cam: 'povRoof' }, { t0: 21, t1: 24, cam: 'povSpeck' },
  { t0: 24, t1: 27, cam: 'phone' }, { t0: 27, t1: 30, cam: 'screen' }, { t0: 30, t1: 33, cam: 'classroom' }, { t0: 33, t1: 36, cam: 'clouds' },
  { t0: 36, t1: 99, cam: 'loop' },
];
export const TCRUNCH = 13.55, TFLASH = 25.15, TSCAN = [25.35, 26.9], TWRITE = [27.0, 29.7], TPRINT = [30.05, 31.3];
const G_LATE = [-40, 0, 4200];                      // where the giant stands for the clouds + loop shots (4.2 km north of town, facing it)
const BAN = [72.5, 28];                             // the roof banner's centre (the school's west wing)

// ---------------------------------------------------------------- VHS rewind (post pass)
const VHS = {
  uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 }, uT: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmt, uT; varying vec2 vUv;
    float h(float n){ return fract(sin(n * 91.345) * 47453.21); }
    void main(){
      vec2 uv = vUv; float fr = floor(uT * 30.0);
      float band = floor(uv.y * 48.0);
      float off = (h(band + fr * 7.0) - 0.5) * 0.018 * step(0.72, h(band * 1.7 + fr)) * uAmt;
      float roll = fract(uT * 1.3 + 0.2), d = abs(uv.y - roll);
      off += smoothstep(0.05, 0.0, d) * 0.045 * uAmt * (0.6 + 0.4 * sin(uv.y * 900.0));
      float ca = 0.004 * uAmt;
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(off + ca, 0.0)).r, texture2D(tDiffuse, uv + vec2(off, 0.0)).g, texture2D(tDiffuse, uv + vec2(off - ca, 0.0)).b);
      float line = step(0.985, h(floor(uv.y * 640.0) + fr * 13.0)) * 0.22 * uAmt;
      c = mix(c, vec3(dot(c, vec3(0.3, 0.59, 0.11))), 0.25 * uAmt) * (1.0 - 0.08 * uAmt) + line + smoothstep(0.012, 0.0, d) * 0.25 * uAmt;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

// ---------------------------------------------------------------- DOM: the whatifpov text layer (HUD top-left, steady), ⏪, end card
const CSS = `
#hud { display: none !important; }
.sub { top: 1262px; font-size: 56px; line-height: 1.18; left: 100px; right: 100px; }
.sub::before { background: radial-gradient(closest-side, rgba(0,0,0,.62), rgba(0,0,0,.4) 55%, rgba(0,0,0,0)) !important; }
.title { font-size: 86px; line-height: 1.1; }
.vx-hud { position: absolute; left: 64px; top: 440px; font-family: 'Inter'; color: #fff; opacity: 0; z-index: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,.85), 0 0 14px rgba(0,0,0,.65), 0 0 32px rgba(0,0,0,.45); }
.vx-hud::before { content: ''; position: absolute; z-index: -1; left: -70px; top: -50px; width: 700px; height: 260px;
  background: radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,.28) 55%, rgba(0,0,0,0)); }
.vx-hud .lab { font-weight: 600; font-size: 24px; letter-spacing: .17em; color: rgba(255,255,255,.94); }
.vx-hud .val { font-family: 'Newsreader'; font-weight: 300; font-size: 96px; line-height: 1.0; margin: 4px 0 8px -3px; white-space: nowrap; }
.vx-hud .val small { font-size: 46px; margin-left: 10px; }
.vx-hud .cmp { font-weight: 600; font-size: 22px; letter-spacing: .14em; color: rgba(255,255,255,.88); white-space: nowrap; }
.vx-rw { position: absolute; left: 96px; top: 212px; width: 92px; height: 64px; opacity: 0; z-index: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,.6)); }
.vx-end { position: absolute; inset: 0; opacity: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #fff; }
.vx-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.6), rgba(10,6,8,.88)); }
.vx-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.vx-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.vx-end .tag { position: relative; font-family: 'Newsreader'; font-style: italic; font-weight: 400; font-size: 62px; margin-top: 26px; color: #f3e6d3; }
.vx-end .url { position: relative; margin-top: 56px; padding: 18px 46px 22px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-family: 'Inter'; font-weight: 600; font-size: 84px; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.vx-end .offer { position: relative; margin-top: 38px; font-family: 'Inter'; font-weight: 600; font-size: 50px; color: #ffd23f; }
`;
const CMP = [[0, 'AVERAGE HEIGHT'], [6.53, 'TALLER THAN A BASKETBALL HOOP'], [9.31, 'TALLER THAN A GIRAFFE'], [13.1, 'TALLER THAN A 4-STOREY BUILDING'],
  [15.0, 'TALLER THAN YOUR SCHOOL'], [19.18, 'TALLER THAN THE LEANING TOWER OF PISA'], [21.46, 'TALLER THAN BIG BEN'], [23.05, 'TALLER THAN THE GREAT PYRAMID'],
  [24.0, 'TALLER THAN THE WASHINGTON MONUMENT'], [26.8, 'TALLER THAN THE EIFFEL TOWER'], [28.1, 'TALLER THAN THE EMPIRE STATE BUILDING'],
  [30.8, 'TALLER THAN THE BURJ KHALIFA'], [33.0, 'HEAD IN THE CLOUDS']];
function fmtH(m) {
  if (m < 10) return `${m.toFixed(2)}<small>m</small>`;
  if (m < 100) return `${m.toFixed(1)}<small>m</small>`;
  if (m < 1000) return `${Math.round(m)}<small>m</small>`;
  return `${(m / 1000).toFixed(2)}<small>km</small>`;
}
/** the HUD's height at real time t (the rewind spins it back geometrically) */
export function hudH(t) {
  if (t < RW[0]) return Hof(36 + t * 0.5);
  if (t < RW[1]) { const u = clamp((t - RW[0]) / (RW[1] - RW[0] - 0.06)); return Math.exp(lerp(Math.log(Hof(37)), Math.log(H0), Math.pow(u, 0.75))); }
  return Hof(t);
}
function makeDom(story) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const hud = document.createElement('div'); hud.className = 'vx-hud';
  hud.innerHTML = '<div class="lab">YOUR HEIGHT</div><div class="val"></div><div class="cmp"></div>'; ui.appendChild(hud);
  const rw = document.createElement('div'); rw.className = 'vx-rw';
  rw.innerHTML = '<svg viewBox="0 0 92 64" width="92" height="64"><path d="M44 4 L4 32 L44 60 Z M88 4 L48 32 L88 60 Z" fill="#fff"/></svg>'; ui.appendChild(rw);
  const end = document.createElement('div'); end.className = 'vx-end';
  end.innerHTML = '<div class="bg"></div><img src="/videos/049-scribe-promo/scribe-icon.png"><div class="wm">Scribe</div><div class="tag">Your homework, in your handwriting.</div><div class="url">tryscribe.ink</div><div class="offer">10 free assignments ✦</div>';
  ui.appendChild(end);
  const [, val, cmp] = hud.children;
  const last = {};
  const set = (k, el, v, html = false) => { if (last[k] !== v) { html ? (el.innerHTML = v) : (el.textContent = v); last[k] = v; } };
  const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  function update(t) {
    hud.style.opacity = smooth((t - story.title.out) / 0.25) * (1 - smooth((t - ENDC) / 0.35));
    rw.style.opacity = smooth((t - RW[0]) / 0.08) * (1 - smooth((t - (RW[1] - 0.12)) / 0.12));
    set('val', val, fmtH(hudH(t)), true);
    let c = ''; for (const [a, s] of CMP) if (t >= a) c = s;
    set('cmp', cmp, t < RW[1] ? '' : c);
    end.style.opacity = smooth((t - ENDC) / 0.45);
    end.querySelector('img').style.transform = `scale(${t < ENDC ? 0.6 : 0.6 + 0.4 * easeOutBack((t - ENDC) / 0.5)})`;
  }
  return { update };
}

// ---------------------------------------------------------------- the Scribe app on the phone (portrait canvas, 049's look)
function makeApp(icon, sheet, viewCanvas, punnettBox) {
  const W = 600, H = 1280, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const bar = () => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, W, 110); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 110, W, 3);
    g.drawImage(icon, 26, 22, 66, 66); g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.textAlign = 'left'; g.fillText('Scribe', 104, 72);
    g.fillStyle = '#f1e3c4'; g.beginPath(); g.roundRect(W - 196, 32, 170, 46, 23); g.fill(); g.fillStyle = RED; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('Biology', W - 111, 64);
  };
  let lastKey = '';
  function draw({ mode = 'cam', k = 0, zoom = 0 } = {}) {
    const key = `${mode}:${Math.round(k * 80)}:${Math.round(zoom * 60)}`; if (key === lastKey) return; lastKey = key;
    g.textAlign = 'left';
    if (mode === 'cam' || mode === 'flash' || mode === 'scan') {
      g.drawImage(viewCanvas, 0, 0, W, H); bar();
      if (mode !== 'scan') {
        g.strokeStyle = '#fff'; g.lineWidth = 8; const B = 60;
        for (const [x, y, sx, sy] of [[90, 330, 1, 1], [W - 90, 330, -1, 1], [90, 950, 1, -1], [W - 90, 950, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * B); g.lineTo(x, y); g.lineTo(x + sx * B, y); g.stroke(); }
        g.fillStyle = 'rgba(20,20,20,.62)'; g.beginPath(); g.roundRect(W / 2 - 220, 1060, 440, 64, 32); g.fill();
        g.fillStyle = '#fff'; g.font = '600 32px Inter, Arial'; g.textAlign = 'center'; g.fillText('Snap your homework', W / 2, 1103);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, 1192, 46, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.arc(W / 2, 1192, 36, 0, 7); g.stroke();
      }
      if (mode === 'scan') {
        const sy = 120 + (H - 120) * k; g.fillStyle = 'rgba(154,28,37,.2)'; g.fillRect(0, 120, W, sy - 120); g.fillStyle = RED; g.fillRect(0, sy - 5, W, 10);
        g.fillStyle = 'rgba(251,250,246,.96)'; g.beginPath(); g.roundRect(30, 860, W - 60, 300, 26); g.fill();
        g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '44px Georgia, serif'; g.fillText('Reading your homework…', W / 2, 930);
        g.font = '600 56px Inter, Arial'; g.fillText('40 problems', W / 2, 1014); g.font = '500 32px Inter, Arial'; g.fillStyle = '#6b665c'; g.fillText('Biology · cell division · genetics', W / 2, 1066);
        g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(70, 1100, W - 140, 16, 8); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(70, 1100, (W - 140) * k, 16, 8); g.fill();
      }
      if (mode === 'flash') { g.fillStyle = `rgba(255,255,255,${1 - k})`; g.fillRect(0, 0, W, H); }
    } else {
      g.fillStyle = CREAM; g.fillRect(0, 0, W, H); bar();
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '40px Georgia, serif';
      g.fillText(mode === 'write' ? 'Writing in your handwriting…' : 'Done. All 40 problems.', W / 2, 162);
      // the page: full width at zoom 0, the Punnett square filling the card at zoom 1
      const [bx, by, bw, bh] = punnettBox, sw = sheet.w, shh = sheet.h;
      const fx = lerp(0, bx, zoom), fy = lerp(0, by, zoom), fw = lerp(sw, bw, zoom), fh = lerp(shh * 0.6, bh, zoom);
      const cx = 24, cy = 186, cw = W - 48, ch = 880;
      g.save(); g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.clip(); g.fillStyle = '#fffdf6'; g.fillRect(cx, cy, cw, ch);
      const sc = Math.min(cw / fw, ch / fh); g.drawImage(sheet.canvas, fx, fy, fw, fh, cx + (cw - fw * sc) / 2, cy, fw * sc, fh * sc); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.stroke();
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 1110, W - 100, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 1110, (W - 100) * k, 18, 9); g.fill();
      g.fillStyle = '#4b463d'; g.font = '600 34px Inter, Arial'; g.fillText(`${Math.max(1, Math.round(40 * k))} / 40 solved`, W / 2, 1182);
      g.font = '500 28px Inter, Arial'; g.fillStyle = '#6b665c'; g.fillText('your handwriting · ballpoint · navy', W / 2, 1230);
    }
    tex.needsUpdate = true;
  }
  draw({ mode: 'cam' });
  return { canvas: c, tex, draw };
}

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, camera, setCamera } = studio;
  const vhs = new ShaderPass(VHS); studio.composer.addPass(vhs); vhs.enabled = false;
  const dom = makeDom(story);
  const HAND = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---- sets: the town (+ the far world) at the origin, Room 4 parked at OFF_C
  const town = buildVoxTown(studio, { school: true, world: { clouds: { y: 1300, cell: 150, thick: 46, area: 30000, cover: 0.4, speed: 2, clear: [[-50, 1850, 520]] }, fogNear: 200, fogFar: 2000, far: { cityAt: [1400, 4200], citySpread: 900 } } });
  const W = town.world, townFog = scene.fog, D = town.D, S = D.school;
  const room = buildVoxClassroom(studio, { board: ['BIOLOGY  ·  ROOM 4', 'HW 7: CELL DIVISION', 'DUE 8:00 AM  (HANDWRITTEN)'] });
  room.root.position.set(...OFF_C);
  // the roof banner (the obstacle, readable from above)
  town.setBanner(textCanvas(['BIOLOGY HW', '40 PROBLEMS', 'HANDWRITTEN', 'DUE 8:00 AM'], { w: 120, h: 96, bg: '#f3f1ec', fg: '#b3261e', font: 'bold 15px monospace', border: '#26282c', lh: 21 }), { w: 18, h: 14.4, x: BAN[0], z: BAN[1] });

  // ---- the worksheet (biology: cell division + a Punnett square), Scribe's real glyphs
  const problems = [
    { q: '1.  A cell divides every 20 min. Cells after 2 h?', a: '2 h = 6 divisions\n2^6 = 64 cells' },
    { q: '2.  In which phase do chromosomes line up?', a: 'metaphase' },
    { q: '3.  Cross Bb × Bb. Draw the Punnett square.', a: 'ratio  3 : 1', fig: punnettFig({ ox: 520, oy: -10, cell: 84, parents: ['Bb', 'Bb'], u: 30 }) },
    { q: '4.  Mitosis makes how many daughter cells?', a: '2 identical cells' },
  ];
  const sheetOpts = { title: 'BIOLOGY · HW 7 · CELL DIVISION & GENETICS', note: '40 problems  ·  Due 8:00 AM  ·  HANDWRITTEN ONLY', name: 'Sam', seed: 9, page: 'p. 1 / 10', problems };
  const wsBlank = makeSheet(HAND, { ...sheetOpts, name: '' }); wsBlank.draw(0, true);
  const ws = makeSheet(HAND, sheetOpts);
  const rowH = (ws.h - 340) / problems.length, pY = 300 + 2 * rowH;               // problem 3's row top (canvas px)
  const punnettBox = [578, pY + 20, 284, 230];
  const fig0 = ws.items.findIndex((it) => it.pi === 2);
  const wAt = (n) => ws.items.slice(0, n).reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);
  const P_FIG0 = wAt(fig0), P_FIG1 = wAt(ws.items.filter((it) => it.pi <= 2).length);

  // ---- people
  const hero = makeVoxPerson({ height: H0, skin: 0xe0ac86, hair: 0x2a1c14, hairStyle: 'messy', top: 'hoodie', shirt: 0x9a1c25, pants: 0x34405c, shoes: 0xf3f1ec, backpack: 0x3c6fd8 });
  scene.add(hero.root);
  const heroHead = [hero.headMesh, ...hero.head.children.filter((c) => c !== hero.headMesh)];
  const teacher = makeVoxPerson({ height: 1.72, skin: 0xc98e66, hair: 0x3a2618, hairStyle: 'bun', top: 'cardigan', shirt: 0x5a7fbf, under: 0xf3f1ec, pants: 0x26282c, shoes: 0x7d5434, glasses: true });
  scene.add(teacher.root);
  const megaphone = boxModel([[-1, -1, 0, 1, 1, 3, 0xf2c53d], [-2, -2, 4, 2, 2, 5, 0xf2c53d], [0, -3, 1, 0, -2, 1, 0x26282c]], { bs: 0.05 });
  scene.add(megaphone);
  const kids = Array.from({ length: 9 }, (_, i) => { const p = makeVoxPerson({ height: 1.5 + (i % 3) * 0.08, ...randomOutfit(70 + i * 3, i % 4 === 0 ? { backpack: [0xd8413a, 0xf2c53d, 0x56b04a][i % 3] } : {}) }); scene.add(p.root); return p; });
  const neighbor = makeVoxPerson({ height: 1.78, skin: 0xf1c8a4, hair: 0x8c8c8c, hairStyle: 'short', top: 'shirt', shirt: 0xf3f1ec, tie: 0x3c6fd8, pants: 0x5a6270, mustache: 0x8c8c8c });
  scene.add(neighbor.root);
  const peds = Array.from({ length: 4 }, (_, i) => { const p = makeVoxPerson({ height: 1.7, ...randomOutfit(120 + i * 5) }); scene.add(p.root); return p; });
  const everyone = [hero, teacher, ...kids, neighbor, ...peds];

  // ---- props: worksheet + pencil in the hero's hands (true size: they do NOT grow), the phone (grows with him), printer pages
  const sheetProp = voxPaper(wsBlank.tex); scene.add(sheetProp);
  const pencil = voxPencil(); scene.add(pencil);
  const view = document.createElement('canvas'); view.width = 600; view.height = 1280;   // the phone viewfinder: his fingertip + the speck
  { const v = view.getContext('2d'); v.fillStyle = '#d99a72'; v.fillRect(0, 0, 600, 1280); v.fillStyle = '#c98a64'; for (let y = 0; y < 1280; y += 80) for (let x = (y / 80) % 2 ? 40 : 0; x < 600; x += 80) v.fillRect(x, y, 40, 40);
    v.fillStyle = 'rgba(0,0,0,.25)'; v.fillRect(196, 506, 214, 276); v.drawImage(wsBlank.canvas, 190, 496, 214, 277); }
  const app = makeApp(icon, ws, view, punnettBox);
  const phone = voxPhone(app.tex, { case: 0x26282c }); scene.add(phone);
  const pages = Array.from({ length: 6 }, () => { const m = voxPaper(ws.tex); room.root.add(m); return m; });
  // dust puffs (an instanced pool of white blocks) for stomps
  const dust = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xe9e2d2, transparent: true, opacity: 0.85 }), 60);
  dust.frustumCulled = false; scene.add(dust);
  const DR = rng(5), DS = Array.from({ length: 60 }, () => [DR(), DR(), DR(), DR()]);
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  function puffs(t, t0, c, size = 1, n = 40) {
    for (let i = 0; i < 60; i++) {
      const age = t - t0 - DS[i][3] * 0.05;
      if (i >= n || age < 0 || age > 1.6 || t0 < 0) { _m.makeScale(0, 0, 0); dust.setMatrixAt(i, _m); continue; }
      const a = DS[i][0] * PI * 2, v = (2 + 4 * DS[i][1]) * size, dr = (1 - Math.exp(-age * 3)) / 3;
      _p.set(c[0] + Math.cos(a) * v * dr, c[1] + (0.3 + DS[i][2] * 1.2) * size * dr * 2, c[2] + Math.sin(a) * v * dr);
      const sc = size * (0.35 + 0.5 * DS[i][2]) * (1 - smooth((age - 0.9) / 0.7));
      _q.setFromEuler(_e.set(DS[i][1] * 3, DS[i][2] * 3, 0)); _s.setScalar(Math.max(0.001, sc)); _m.compose(_p, _q, _s); dust.setMatrixAt(i, _m);
    }
    dust.instanceMatrix.needsUpdate = true;
  }

  // ---- helpers
  const hideCars = (pred) => town.cars.forEach((c) => { c.visible = !pred(c.position); });
  function useSet(name, { near = 0.05, far = 30000, fog = [200, 2000] } = {}) {
    W.root.visible = name === 'town'; room.root.visible = name === 'room';
    scene.fog = name === 'town' ? townFog : null; if (name === 'town') W.setFog(fog[0], fog[1]);
    camera.near = near; camera.far = far; camera.updateProjectionMatrix();
    scene.background = new THREE.Color(name === 'town' ? 0xcfe6fb : 0x9fc6ee);
  }
  function showHead(on) { heroHead.forEach((m) => (m.visible = on)); hero.torso.visible = on; }   // POV: the camera sits in the head; the hoodie's drawstrings poked into the frame
  /** pose the giant: scale s at (x, z) facing rotY; extra pose fields pass through */
  function giant(s, x, z, rotY, p = {}) { hero.pose({ x, z, y: 0, rotY, scale: s, ...p }); hero.root.updateMatrixWorld(true); }
  /** place an unscaled prop at a hero hand (offset in the hand's frame, metres × s) */
  const _v = new THREE.Vector3(), _hq = new THREE.Quaternion();
  function atHand(obj, side, off = [0, 0, 0], rot = [0, 0, 0]) {
    const h = hero.hand[side]; h.updateMatrixWorld(true);
    h.localToWorld(_v.set(off[0], off[1], off[2])); obj.position.copy(_v);
    h.getWorldQuaternion(_hq); obj.quaternion.copy(_hq).multiply(_q.setFromEuler(_e.set(rot[0], rot[1], rot[2])));
  }
  function povCam(fwdPitch, yawOff = 0, fov = 60, lookFar = 10) {
    const s = hero.root.scale.x, eye = hero.eyeWorld(new THREE.Vector3(), 3.0);
    const yaw = hero.root.rotation.y + (hero.head.rotation.y || 0) + yawOff;
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(fwdPitch), -Math.sin(fwdPitch), Math.cos(yaw) * Math.cos(fwdPitch));
    camera.near = 0.03 * s; camera.updateProjectionMatrix();
    return { P: eye.toArray(), A: eye.clone().addScaledVector(dir, lookFar * s).toArray(), fov };
  }
  /** lay a flat prop (paper) on the fist's +z face (the face that points up/back when the forearm is raised) */
  const _n = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  function onFist(obj, side, at) {
    hero.arms[side].lo.getWorldQuaternion(_hq); _n.set(0, 0, 1).applyQuaternion(_hq);
    obj.position.copy(at).addScaledVector(_n, 0.01); obj.quaternion.setFromUnitVectors(_up, _n); obj.rotateY(0.5);
  }
  const resetPeople = () => { everyone.forEach((p) => (p.root.visible = false)); [megaphone, sheetProp, pencil, phone].forEach((o) => (o.visible = false)); pages.forEach((p) => (p.visible = false)); showHead(true); puffs(0, -1, [0, 0, 0]); };

  // ---------------------------------------------------------------- the shots (tau = story time of the picture)
  function scene_(tau, t) {
    resetPeople();
    const shot = SHOTS.find((s) => tau >= s.t0 && tau < s.t1) || SHOTS[SHOTS.length - 1];
    const u = clamp((tau - shot.t0) / (shot.t1 - shot.t0)), s = sOf(tau), H = Hof(tau);
    town.update(tau); town.clock.set(7, 52 + Math.floor(clamp((tau - 3) / 30) * 7));
    hideCars(() => false);
    let cam = null, amp = 0.0, shake = 0;
    switch (shot.cam) {
      case 'povWalk': {                     // POV walking the north sidewalk, the worksheet + pencil in hand
        useSet('town', { fog: [140, 1400] });
        const w = walkLegs(tau, [-47, 6.2], [{ t0: 2.6, t1: 6.6, pts: [[-41, 6.2]] }]);
        const bob = Math.sin(hero.phaseFor(w.dist) * 2) * 0.05;
        giant(1, w.x, w.z, PI / 2, { walk: hero.phaseFor(w.dist), armL: { x: -1.1 + bob, z: -0.62, bend: -0.6 }, armR: { x: -0.95 - bob, z: -0.5, bend: -0.6 } });
        hero.root.visible = true; showHead(false);
        sheetProp.visible = pencil.visible = true;
        const eye = hero.eyeWorld(new THREE.Vector3(), -1);
        const gl = hero.gripWorld('L', -5.2, 1.5), gr = hero.gripWorld('R', -5.0, 1.8);
        sheetProp.position.copy(gl); sheetProp.lookAt(eye); sheetProp.rotateX(PI / 2 - 0.25); sheetProp.rotateY(0.15);
        pencil.position.copy(gr); pencil.rotation.set(0.5, 0.2, -1.1);
        W.aim(w.x + 6, 6, 18);
        peds[0].root.visible = true; const wp = walkLegs(tau, [-31, 5.3], [{ t0: 2.5, t1: 7, pts: [[-40, 5.3]] }]);
        peds[0].pose({ x: wp.x, z: wp.z, rotY: -PI / 2, walk: peds[0].phaseFor(wp.dist), face: 'happy', armR: tau > 4.6 ? ARMS.wave : undefined });
        const ahead = new THREE.Vector3(w.x + 7, 0.4, 6.0), mid = gl.clone().lerp(gr, 0.5);
        cam = { P: eye.toArray(), A: mid.lerp(ahead, 0.55).toArray(), fov: 74 }; amp = 0.004; camera.near = 0.03; camera.updateProjectionMatrix();
        break;
      }
      case 'side': {                        // tracking alongside from the road, he grows past the houses
        useSet('town', { fog: [160, 1600] });
        const x = lerp(-41, -27, u);
        giant(s, x, 6.2, PI / 2, { walk: hero.phaseFor(14 * u * 1.6, s), face: u < 0.4 ? 'idle' : 'wow', head: { yaw: -0.35 * smooth((u - 0.5) / 0.3) } });
        hero.root.visible = true; sheetProp.visible = pencil.visible = true;
        sheetProp.position.copy(hero.gripWorld('L', -5.5, 1.5)); sheetProp.rotation.set(0.2, PI / 2, 1.3);
        pencil.position.copy(hero.gripWorld('R', -5.5, 1.5)); pencil.rotation.set(0, 0, 0.2);
        neighbor.root.visible = false; neighbor.pose({ x: -25.4, z: 4.0, rotY: PI + 0.9 - 0.4 * smooth((u - 0.25) / 0.3), face: u > 0.45 ? 'shock' : 'idle', armR: u > 0.55 ? ARMS.pointUp : ARMS.down, armL: u > 0.55 ? ARMS.shock : ARMS.down, head: { pitch: -0.55 * smooth((u - 0.5) / 0.3) } });
        hideCars((p) => p.z < 5 && p.x > -60 && p.x < -10);
        W.aim(x, 6, 16);
        const back = Math.min(9.2, 6 + 2.6 * H);                          // stay on the road: the south lamp posts + houses start at z −6.6 / −12
        cam = { P: [x - 0.6, 0.5 + 0.5 * H, 6.2 - back], A: [x - 0.1, 0.5 * H, 6.2], fov: lerp(46, 54, u) }; amp = 0.01;
        break;
      }
      case 'povPencil': {                   // POV: the pencil is a toothpick in your blocky fist; people point up at you
        useSet('town', { fog: [200, 2200] });
        const x = lerp(-26, -12, u);
        giant(s, x, 6.2, PI / 2, { walk: hero.phaseFor(14 * u, s), stride: 0.35, armR: { x: -1.25, z: -0.45, bend: -0.75 }, armL: { x: -0.9, z: -0.35, bend: -0.5 } });
        hero.root.visible = true; showHead(false);
        pencil.visible = sheetProp.visible = true;
        const eye = hero.eyeWorld(new THREE.Vector3(), -1), gr = hero.gripWorld('R', -4.5, 2.05), gl = hero.gripWorld('L', -4.6, 2.05);
        pencil.position.copy(gr).add(new THREE.Vector3(0, -0.03, 0)); pencil.rotation.set(0.6, 0, -0.5); pencil.scale.setScalar(1.0);
        sheetProp.position.copy(gl); sheetProp.rotation.set(0.15, 0.5, 0.05);
        peds[1].root.visible = peds[2].root.visible = true;
        peds[1].pose({ x: x + 10, z: 5.4, rotY: -PI / 2 - 0.5, face: 'shock', armR: ARMS.pointUp, head: { pitch: -0.75 } });
        peds[2].pose({ x: x + 11.5, z: 6.9, rotY: -PI / 2 - 0.2, face: 'scream', armL: ARMS.shock, armR: ARMS.shock, head: { pitch: -0.7 } });
        W.aim(x + 6, 6, 18);
        const ahead = new THREE.Vector3(x + 11, 0, 6.2);
        cam = { P: eye.toArray(), A: gr.clone().lerp(ahead, 0.12).toArray(), fov: 56 }; amp = 0.006 * s; camera.near = 0.02 * s; camera.updateProjectionMatrix();
        break;
      }
      case 'crunch': {                      // ground level: the shoe comes down on a parked car
        useSet('town', { fog: [200, 2400] });
        const car = town.cars.find((c) => c.position.z > 2 && c.position.z < 5 && c.position.x > -5 && c.position.x < 40) || town.cars[0];
        car.visible = true;
        const cx = car.position.x, cz = car.position.z, land = TCRUNCH, k = smooth((tau - (land - 0.12)) / 0.14);
        car.setCrush(k);
        const footOff = 2 * hero.px * s, footY = K(tau, [[12.0, 3.0 + 0.25 * s], [land - 0.05, 1.35], [land, 0.3], [14.5, 0.3], [15, 0.8]]);
        giant(s, cx - 0.5 * hero.px * s, cz - footOff, PI / 2, { legR: { x: 0, bend: 0 }, legL: { x: 0.3, bend: 0 }, face: 'wow' });
        hero.root.position.y = footY; hero.root.visible = true;
        puffs(tau, land, [cx, 0.2, cz], 1.0, 40);
        peds[3].root.visible = true; const wr = walkLegs(tau, [cx - 6, -5.6], [{ t0: land + 0.05, t1: 15.2, pts: [[cx - 14, -5.6]] }]);
        peds[3].pose({ x: wr.x, z: wr.z, rotY: tau > land ? -PI / 2 : PI / 2 + 0.6, walk: peds[3].phaseFor(wr.dist), stride: 0.9, face: tau > land - 0.6 ? 'scream' : 'idle', armL: ARMS.shock, armR: ARMS.shock, head: { pitch: tau < land ? -0.5 : 0 } });
        W.aim(cx, cz, 16);
        shake = 0.2 * Math.exp(-Math.max(0, tau - land) * 5) * (tau > land ? 1 : 0);
        cam = { P: [cx - 3.6, 0.6, -4.2], A: [cx - 0.3, 1.7, cz], fov: 60 }; amp = 0.006;
        break;
      }
      case 'kids': {                        // reaction: kids + teacher on the plaza look up at you (the school behind them)
        useSet('town', { fog: [200, 2400] });
        giant(s, S.cx + 2, -4, 0, { face: 'wow' }); hero.root.visible = true;
        kids.forEach((k2, i) => { k2.root.visible = true; const kx = S.cx - 5.5 + i * 1.35, kz = 9.6 + (i % 3) * 1.0; k2.pose({ x: kx, z: kz, rotY: PI + (S.cx - kx) * 0.04, face: i % 3 === 0 ? 'shock' : i % 3 === 1 ? 'scream' : 'wow', head: { pitch: -0.7 + 0.1 * Math.sin(tau * 3 + i) }, armL: i % 2 ? ARMS.shock : ARMS.pointUp, armR: i % 2 ? ARMS.shock : ARMS.down }); });
        teacher.root.visible = true; teacher.pose({ x: S.cx + 0.6, z: 12.6, rotY: PI, face: 'shock', head: { pitch: -0.8 }, armR: ARMS.facepalm });
        W.aim(S.cx, 10, 24);
        cam = { P: [S.cx + 0.5 + lerp(-0.5, 0.5, u), 0.85, 3.0], A: [S.cx + 0.5, 1.75 + 0.25 * u, 14], fov: 54 }; amp = 0.008;
        break;
      }
      case 'school': {                      // the wide: you, taller than the clock tower
        useSet('town', { fog: [400, 4000] });
        const gx = S.cx + 6, gz = -1.0;
        giant(s, gx, gz, -PI / 2 + 0.5, { face: 'grin', armL: ARMS.hips, armR: ARMS.wave, head: { pitch: 0.2 } });
        hero.root.visible = true;
        kids.forEach((k2, i) => { k2.root.visible = true; k2.pose({ x: S.cx - 6 + i * 1.5, z: 9.4 + (i % 3) * 0.9, rotY: PI + 0.6, face: 'shock', head: { pitch: -0.7 }, armR: ARMS.pointUp }); });
        hideCars((p) => Math.abs(p.x - gx) < 12 && Math.abs(p.z - gz) < 7);
        W.aim(S.cx, 4, 60);
        cam = { P: [S.x0 - 30 + 6 * u, 1.6, -3.0], A: [gx - 15, 0.45 * H, 3], fov: 56 }; amp = 0.01;
        break;
      }
      case 'povRoof': {                     // POV straight down on the school: the roof banner + the teacher with a megaphone
        useSet('town', { fog: [600, 6000] });
        const gx = S.cx - 8, gz = -7;
        giant(s, gx, gz, 0, {}); hero.root.visible = true; showHead(false);
        teacher.root.visible = true; teacher.pose({ x: S.cx - 14, z: 12, rotY: PI, face: 'angry', head: { pitch: -0.9 }, armR: ARMS.megaphone, armL: ARMS.pointUp });
        megaphone.visible = true; megaphone.position.copy(teacher.gripWorld('R', -5.5, 2)); megaphone.rotation.set(-1.2, PI, 0); megaphone.scale.setScalar(1.4);
        kids.forEach((k2, i) => { k2.root.visible = true; k2.pose({ x: S.cx - 20 + i * 2.2, z: 10 + (i % 2) * 1.5, rotY: PI, head: { pitch: -0.8 }, face: 'shock' }); });
        W.aim(BAN[0], BAN[1], 30);
        const eye = hero.eyeWorld(new THREE.Vector3(), 3.0);
        cam = { P: eye.toArray(), A: [BAN[0] + 5, 0, BAN[1] + 6 + 2 * u], fov: lerp(60, 54, u) }; amp = 0.003 * s;
        camera.near = 0.5; camera.updateProjectionMatrix();
        break;
      }
      case 'povSpeck': {                    // POV: the worksheet is a grain of rice on your fist (a zoom from 42° to 4.5°)
        useSet('town', { fog: [900, 9000] });
        giant(s, S.cx - 8, -9, 0.15, { armL: { x: -1.45, z: -0.42, bend: -0.75 }, armR: { x: -1.3, z: -0.55, bend: -0.8 } });
        hero.root.visible = true; showHead(false);
        const eye = hero.eyeWorld(new THREE.Vector3(), -1), top = hero.gripWorld('L', -4.6, 2.03);
        sheetProp.visible = true; onFist(sheetProp, 'L', top);
        pencil.visible = false;
        W.aim(S.cx, 0, 40);
        cam = { P: eye.toArray(), A: top.toArray(), fov: 42 * Math.pow(4.5 / 42, smooth(u * 1.1)) }; amp = 0.00015 * s; camera.near = 0.02 * s; camera.updateProjectionMatrix();
        break;
      }
      case 'phone':                         // POV: one photo with Scribe (the phone grew with you)
      case 'screen': {                      // …then the screen fills the frame: solved, in YOUR handwriting, the Punnett square drawn
        useSet('town', { fog: [2000, 16000] });
        giant(s, S.cx - 8, -9, 0.15, { armL: { x: -1.45, z: -0.42, bend: -0.75 }, armR: { x: -1.2, z: -0.62, bend: -1.15 } });
        hero.root.visible = true; showHead(false);
        const eye = hero.eyeWorld(new THREE.Vector3(), -1), top = hero.gripWorld('L', -4.6, 2.03), gr = hero.gripWorld('R', -4.0, 0);
        sheetProp.visible = true; onFist(sheetProp, 'L', top);
        phone.visible = true; phone.scale.setScalar(s * 1.5);
        phone.position.copy(gr).add(new THREE.Vector3(0, 5.2 * hero.px * s, 0)); phone.lookAt(eye);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(phone.quaternion), rt = new THREE.Vector3(1, 0, 0).applyQuaternion(phone.quaternion), nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.quaternion);
        const ph = 0.158 * 1.5 * s;
        if (shot.cam === 'phone') {
          const mode = tau < TFLASH ? 'cam' : tau < TSCAN[0] ? 'flash' : 'scan';
          app.draw({ mode, k: mode === 'flash' ? (tau - TFLASH) / (TSCAN[0] - TFLASH) : mode === 'scan' ? clamp((tau - TSCAN[0]) / (TSCAN[1] - TSCAN[0])) : 0 });
          const Dp = eye.distanceTo(phone.position), fovP = 2 * Math.atan(ph / (0.66 * 2 * Dp)) * 180 / PI;
          cam = { P: eye.toArray(), A: phone.position.clone().addScaledVector(rt, -0.15 * ph).addScaledVector(up, 0.242 * ph).toArray(), fov: fovP };
          amp = 0.0008 * s;
        } else {
          const wk = clamp((tau - TWRITE[0]) / (TWRITE[1] - TWRITE[0]));
          const p = tau < 27.6 ? lerp(0, P_FIG0, smooth((tau - 27.0) / 0.6)) : tau < 29.5 ? lerp(P_FIG0, P_FIG1, (tau - 27.6) / 1.9) : lerp(P_FIG1, ws.total, smooth((tau - 29.5) / 0.4));
          ws.draw(p);
          app.draw({ mode: tau < 29.75 ? 'write' : 'done', k: clamp(0.04 + 0.96 * wk), zoom: smooth((tau - 27.3) / 0.45) * (1 - smooth((tau - 29.55) / 0.35)) });
          const d = lerp(2.12, 2.04, u) * ph, off = phone.position.clone().addScaledVector(rt, -0.15 * ph).addScaledVector(up, 0.242 * ph);
          cam = { P: off.clone().addScaledVector(nrm, d).toArray(), A: off.toArray(), fov: 40 };
          camera.up.copy(up); amp = 0.0004 * s;
        }
        W.aim(S.cx, 0, 60);
        camera.near = 0.01 * s; camera.updateProjectionMatrix();
        break;
      }
      case 'classroom': {                   // Room 4: the printer prints it (close) → the teacher reads it… then sees the shoe outside
        useSet('room', { near: 0.03, far: 300 });
        const O = OFF_C, pr = room.printer; pr.updateMatrixWorld(true);
        const out = pr.userData.out.clone(); pr.localToWorld(out); room.root.worldToLocal(out);
        const n = Math.floor(clamp((tau - TPRINT[0]) / (TPRINT[1] - TPRINT[0])) * 5.99);
        const second = tau >= 31.5, look = tau > 32.2;
        ws.draw(ws.total);
        teacher.root.visible = true;
        if (!second) {                      // (a) the printer: pages in YOUR handwriting slide out
          teacher.pose({ x: O[0] + 3.3, z: O[2] + 3.2, rotY: PI / 2 + 0.6, face: 'idle', head: { pitch: 0.3 } });
          pages.forEach((pg, i) => {
            if (i > n) return; pg.visible = true;
            const slide = i === n ? smooth((tau - (TPRINT[0] + (i / 6) * (TPRINT[1] - TPRINT[0]))) / 0.2) : 1;
            pg.position.set(out.x, out.y + 0.003 * i + 0.01, out.z + 0.02 + 0.13 * slide); pg.rotation.set(0, -0.78, 0);
          });
          const tray = out.clone().add(new THREE.Vector3(0, 0, 0.12)); room.root.localToWorld(tray);
          cam = { P: tray.clone().add(new THREE.Vector3(-0.42 + 0.06 * u, 0.42, 0.42)).toArray(), A: tray.toArray(), fov: 46 }; amp = 0.002;
        } else {                            // (b) the teacher reads the top page, then turns to the window: a giant sneaker
          teacher.pose({ x: O[0] + 3.7, z: O[2] + 3.3, rotY: -0.6, face: look ? 'shock' : 'wow', armL: look ? ARMS.shock : ARMS.hold, armR: ARMS.hold, head: { pitch: look ? -0.12 : 0.4, yaw: look ? 0.45 : 0 } });
          pages.forEach((pg, i) => { if (i < 5) { pg.visible = true; pg.position.set(out.x, out.y + 0.003 * i + 0.01, out.z + 0.15); pg.rotation.set(0, -0.35, 0); } });
          const top = pages[5]; top.visible = true;
          const a = teacher.gripWorld('L', -5, 1.6), b = teacher.gripWorld('R', -5, 1.6); a.lerp(b, 0.5);
          room.root.worldToLocal(a); top.position.copy(a).add(new THREE.Vector3(0, 0.06, 0));
          top.rotation.set(1.05, -0.75, 0, 'YXZ'); top.rotateX(0);
          const L = [O[0] + 1.2, 1.62, O[2] + 6.4], A = [O[0] + 4.6, 1.5, O[2] + 3.2];
          cam = { P: L.map((v, i) => v + [0.25, 0, -0.35][i] * clamp((tau - 31.5) / 1.5)), A, fov: 44 }; amp = 0.004;
          shake = look ? 0.02 * Math.abs(Math.sin(tau * 14)) : 0;
        }
        break;
      }
      case 'clouds': {                      // the wide: your head is in the clouds
        useSet('town', { fog: [4000, 26000], far: 60000 });
        giant(s, G_LATE[0], G_LATE[2], PI, { face: tau < 34.6 ? 'wow' : 'happy', head: { pitch: -0.12, yaw: 0.2 }, armL: ARMS.wave });
        hero.root.visible = true;
        W.aim(G_LATE[0], G_LATE[2], Math.max(80, H * 0.6));
        cam = { P: [G_LATE[0] - 0.7 * H, 1430, G_LATE[2] - 1.7 * H], A: [G_LATE[0], 0.78 * H, G_LATE[2]], fov: 50 }; amp = 0.0008 * H;
        break;
      }
      case 'loop':
      default: {                            // street level on the side street: the shoes and legs rising into the clouds (= frame 0)
        useSet('town', { fog: [2500, 26000], far: 60000 });
        giant(s, G_LATE[0], G_LATE[2], PI, { legL: { x: -0.06 }, legR: { x: 0.06 }, head: { pitch: 0.3 } });
        hero.root.visible = true;
        W.aim(-60, 0, 50);
        peds.forEach((p, i) => { p.root.visible = true; p.pose({ x: -61.6 + i * 1.05, z: -3 + (i % 2) * 1.8, rotY: (i % 2 ? 0.25 : -0.25), face: i % 2 ? 'shock' : 'scream', head: { pitch: -0.75 }, armR: i % 2 ? ARMS.pointUp : ARMS.shock, armL: ARMS.shock }); });
        const v = tau - 36;
        cam = { P: [-60 + 0.3 * v, 1.0, -13 + 0.4 * v], A: [-52, 1250 + 40 * v, 4200], fov: 60 }; amp = 0.02;
        shake = 0.06 * Math.max(0, Math.sin(tau * 2.1)) ** 8;
        break;
      }
    }
    if (shot.cam !== 'screen') camera.up.set(0, 1, 0);
    return { cam, amp, shake, shot };
  }

  // ---------------------------------------------------------------- per frame
  function update(t) {
    let tau = t, rew = 0;
    if (t < RW[0]) tau = 36 + t * 0.5;                                     // the cold open = the loop shot
    else if (t < RW[1]) {                                                    // the rewind: four moments played backward, fast
      const segs = [[2.0, 2.25, 35.6, 34.0], [2.25, 2.5, 26.6, 25.0], [2.5, 2.75, 17.6, 16.6], [2.75, 3.0, 5.6, 3.05]];
      const sg = segs.find(([a, b]) => t >= a && t < b) || segs[3];
      tau = lerp(sg[2], sg[3], (t - sg[0]) / (sg[1] - sg[0])); rew = 1;
    }
    const r = scene_(tau, t);
    const n = r.shake ? [Math.sin(t * 61) * r.shake, Math.sin(t * 47 + 1) * r.shake * 0.7, 0] : [0, 0, 0];
    setCamera([r.cam.P[0] + n[0], r.cam.P[1] + n[1], r.cam.P[2]], r.cam.A, r.cam.fov, t, r.amp);
    vhs.enabled = rew > 0; vhs.uniforms.uAmt.value = rew; vhs.uniforms.uT.value = t;
    dom.update(t);
  }
  return { update };
}
