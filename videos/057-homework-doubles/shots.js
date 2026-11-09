// 057 — "What if your homework DOUBLED every 3 seconds?" — Scribe promo, PIXEL style (engine/pixel.js), no narrator.
// A dupe of @whatifpov's "What if your speed DOUBLED every 3 seconds?" (264K likes, docs/reference/whatifpov.md): cold open on
// the end state → VHS rewind (⏪, counter spinning back) → a mundane POV baseline → one beat = one shot = one subtitle every 3 s
// with real-world benchmarks → the HUD switches metric in the last quarter (HOMEWORK → SOLVED) → back to the cold open's frame.
// Our variable: your homework. POV walking to class with a coffee and one worksheet; the stack doubles; at the peak one photo
// with Scribe → every sheet is written in YOUR handwriting (engine/build/scribe.js, Scribe's real glyphs) → the Scribe end card.
//
// THE MATH (shown in the HUD, so nitpickers can check it): sheets = 2^(T/3), T = story seconds since the first sheet. T runs at
// real time for the first two beats (1 → 2 → 4, the rule) and then fast-forwards (the HUD's clock line "T+0:36" shows it), so the
// benchmarks below are true at the moment they're said. Paper = US letter (0.216 × 0.279 m), 20 lb bond (75 g/m²) = 4.5 g and
// ~0.1 mm per sheet (a 500-sheet ream ≈ 5 cm, 2.3 kg — standard paper specs). A loose pile takes ~1.6× the paper's own volume.
//   4,096 sheets   = a 41 cm stack, 18 kg ("up to your chin")              2^12, T 36
//   32,768         = 3.3 m (taller than a teacher)                          2^15, T 45
//   262,144        = 26 m (the school is 8.6 m)                             2^18, T 54
//   524,288        = 52 m, 2.4 t (a car is ~1.4–1.9 t)                       2^19, T 57
//   2,147,483,648  = 13,000 m³ of paper → a 16 m heap 76 m across            2^31, T 93
//   8,589,934,592  = 1:39 after the first sheet                              2^33, T 99
// Scribe claims (docs/lanes/scribe.md): a photo of the homework → every problem solved → written out in the student's own
// handwriting, stroke by stroke → a PDF. The 8.6 billion pages are the joke premise; the end card carries the real offer.
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, smooth, easeIO, rng, mat, mk, walkLegs, faceToward } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makeMug } from '@engine/props.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildSchool, SW_H } from '@engine/sets/school.js';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { pixelTex, paintPixels, pixelTexture, speckle } from '@engine/pixeltex.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';

const PI = Math.PI;
const OFF = [1000, 0, 0];                           // the school set is parked here; street.js stays at the origin
const PIXEL = 8;                                    // block size (px) of the pixel look (135 blocks across); phone shots drop to 5 / 3
export const CUTS = [3.4, 6.4, 9.4, 12.4, 15.4, 18.4, 21.4, 24.4, 27.4, 30.4, 33.4];   // mosaic transitions
export const RW = [2.2, 3.4];                       // the VHS rewind
export const ENDC = 37.0;                           // the Scribe end card
export const SHOTS = [
  { t0: 0, t1: 2.2, cam: 'cold' }, { t0: 2.2, t1: 3.4, cam: 'rewind' },
  { t0: 3.4, t1: 6.4, cam: 'pov1' }, { t0: 6.4, t1: 9.4, cam: 'side' }, { t0: 9.4, t1: 12.4, cam: 'pov3' },
  { t0: 12.4, t1: 15.4, cam: 'teacher' }, { t0: 15.4, t1: 18.4, cam: 'tower' }, { t0: 18.4, t1: 21.4, cam: 'crash' },
  { t0: 21.4, t1: 24.4, cam: 'bury' }, { t0: 24.4, t1: 27.4, cam: 'summit' }, { t0: 27.4, t1: 30.4, cam: 'phone' },
  { t0: 30.4, t1: 33.4, cam: 'wave' }, { t0: 33.4, t1: 99, cam: 'loop' },
];

// ---------------------------------------------------------------- the doubling clock
export const TK = [[3.4, 0], [6.4, 3], [9.4, 6], [12.4, 36], [15.4, 45], [18.4, 54], [21.4, 57], [24.4, 93], [27.4, 99]];
export function storyT(t) {
  if (t <= TK[0][0]) return 0;
  for (let i = 0; i < TK.length - 1; i++) { const [a, va] = TK[i], [b, vb] = TK[i + 1]; if (t <= b) return va + ((vb - va) * (t - a)) / (b - a); }
  return 99;
}
const sheetsAt = (T) => Math.pow(2, T / 3);
const SHEET = [0.216, 0.279], SHEET_T = 0.0001, SHEET_V = 0.216 * 0.279 * 0.0001, LOOSE = 1.6;
const COL_W = 2.4;                                   // the paper column is drawn 2.4× wider than a sheet so it reads at 30 m (a cheat)
const heapDims = (N) => { const h = Math.cbrt((N * SHEET_V * LOOSE) / (0.892 * 2.4 * 2.4)); return { h, R: 2.4 * h }; };
const WAVE_END = [-16, 52, 92], WAVE_AIM = [3, 7, -6];
const waveDist = (t) => 1.05 * Math.pow(100, Math.pow(clamp((t - 30.75) / 2.05), 0.85));
export const TCRASH = 20.05, TFALL = 19.2, TPOP = 25.62, SOLVE0 = 27.9, SOLVE1 = 32.8, WAVE0 = 30.55, WAVE1 = 33.0;

// ---------------------------------------------------------------- heap shape (unit: radius 1, height 1)
const HC = [4, -10];
const lumpF = (th, r) => 0.07 * Math.sin(5 * th + 3 * r) + 0.05 * Math.sin(11 * th - 7 * r + 1.3) + 0.035 * Math.sin(23 * th + 13 * r + 0.4);
const unitY = (r, th) => (r >= 1 ? -0.02 : Math.pow(1 - r, 1.2) * (1 + lumpF(th, r) * 4 * r * (1 - r)));
const heapAt = (x, z, d) => { const dx = x - HC[0], dz = z - HC[1]; return d.h * unitY(Math.hypot(dx, dz) / d.R, Math.atan2(dz, dx)); };
function heapGeometry(NR = 64, NS = 128) {
  const pos = [], idx = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j <= NS; j++) {
    const r = 1.1 * Math.pow(i / NR, 0.9), th = (j / NS) * PI * 2;
    pos.push(r * Math.cos(th), unitY(r, th), r * Math.sin(th));
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
    const a = i * (NS + 1) + j, b = a + NS + 1;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- the handwriting wave: one patched material for every paper surface
const SW = { c: { value: new THREE.Vector2() }, r: { value: -1 }, band: { value: 6 }, glow: { value: 0 } };
function sweepMat(mapU, mapS, tile = 0, extra = {}) {
  const m = new THREE.MeshLambertMaterial({ map: mapU, ...extra });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uMapS: { value: mapS }, uSC: SW.c, uSR: SW.r, uSB: SW.band, uSG: SW.glow, uTile: { value: tile } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uTile;')
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vec4 wq = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wq = instanceMatrix * wq;
        #endif
        wq = modelMatrix * wq; vWP = wq.xyz;
        if (uTile > 0.0) vMapUv = vWP.xz / uTile;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform sampler2D uMapS; uniform vec2 uSC; uniform float uSR, uSB, uSG;')
      .replace('#include <map_fragment>', `
        float dS = length(vWP.xz - uSC);
        float solved = 1.0 - smoothstep(uSR - 0.25, uSR, dS);
        diffuseColor *= mix(texture2D(map, vMapUv), texture2D(uMapS, vMapUv), solved);
        float band = smoothstep(uSR - uSB, uSR, dS) * (1.0 - smoothstep(uSR, uSR + 0.12 * uSB, dS));`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += vec3(0.95, 0.14, 0.05) * band * uSG;');
  };
  m.customProgramCacheKey = () => 'sweep' + tile;
  return m;
}

// ---------------------------------------------------------------- VHS rewind (a post pass after the pixel pass)
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
      float roll2 = fract(uT * 0.7 + 0.65), d2 = abs(uv.y - roll2);
      off -= smoothstep(0.03, 0.0, d2) * 0.03 * uAmt;
      float ca = 0.004 * uAmt;
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(off + ca, 0.0)).r, texture2D(tDiffuse, uv + vec2(off, 0.0)).g, texture2D(tDiffuse, uv + vec2(off - ca, 0.0)).b);
      float line = step(0.985, h(floor(uv.y * 640.0) + fr * 13.0)) * 0.22 * uAmt;
      c = mix(c, vec3(dot(c, vec3(0.3, 0.59, 0.11))), 0.25 * uAmt) * (1.0 - 0.08 * uAmt) + line + smoothstep(0.012, 0.0, d) * 0.25 * uAmt;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

// ---------------------------------------------------------------- DOM: whatifpov-style HUD (top-left, steady), ⏪ icon, end card
const CSS = `
#hud { display: none !important; }
.sub { top: 1262px; font-size: 54px; line-height: 1.18; left: 110px; right: 110px; }
.sub::before { background: radial-gradient(closest-side, rgba(0,0,0,.66), rgba(0,0,0,.42) 55%, rgba(0,0,0,0)) !important; }
.title { font-size: 84px; line-height: 1.1; }
.ph-hud { position: absolute; left: 64px; top: 440px; font-family: 'Inter'; color: #fff; opacity: 0; z-index: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,.85), 0 0 14px rgba(0,0,0,.65), 0 0 32px rgba(0,0,0,.45); }
.ph-hud::before { content: ''; position: absolute; z-index: -1; left: -70px; top: -50px; width: 640px; height: 290px;
  background: radial-gradient(closest-side, rgba(0,0,0,.5), rgba(0,0,0,.28) 55%, rgba(0,0,0,0)); }
.ph-hud .lab { font-weight: 600; font-size: 24px; letter-spacing: .17em; color: rgba(255,255,255,.94); }
.ph-hud .val { font-family: 'Newsreader'; font-weight: 300; font-size: 92px; line-height: 1.0; margin: 4px 0 8px -3px; white-space: nowrap; }
.ph-hud .val small { font-size: 40px; margin-left: 12px; letter-spacing: .01em; }
.ph-hud .cmp { font-weight: 600; font-size: 22px; letter-spacing: .15em; color: rgba(255,255,255,.86); white-space: nowrap; }
.ph-hud .clk { font-weight: 500; font-size: 20px; letter-spacing: .16em; color: rgba(255,255,255,.7); margin-top: 8px; }
.ph-hud.solved .lab { color: #ffd9a8; }
.ph-rw { position: absolute; left: 96px; top: 212px; width: 92px; height: 64px; opacity: 0; z-index: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,.6)); }
.ph-end { position: absolute; inset: 0; opacity: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #fff; }
.ph-end .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(20,12,14,.62), rgba(10,6,8,.9)); }
.ph-end img { width: 330px; height: 330px; position: relative; filter: drop-shadow(0 10px 0 rgba(0,0,0,.35)); }
.ph-end .wm { position: relative; font-family: Georgia, 'Times New Roman', serif; font-size: 190px; letter-spacing: -2px; line-height: 1; margin-top: 6px; color: #fffdf6; text-shadow: 0 8px 0 rgba(0,0,0,.35); }
.ph-end .tag { position: relative; font-family: 'Newsreader'; font-style: italic; font-weight: 400; font-size: 62px; margin-top: 26px; color: #f3e6d3; }
.ph-end .url { position: relative; margin-top: 56px; padding: 18px 46px 22px; background: #9a1c25; border: 6px solid #fffdf6; border-radius: 999px; font-family: 'Inter'; font-weight: 600; font-size: 84px; box-shadow: 0 10px 0 rgba(0,0,0,.35); }
.ph-end .offer { position: relative; margin-top: 38px; font-family: 'Inter'; font-weight: 600; font-size: 50px; color: #ffd23f; }
`;
function fmtSheets(n) {
  n = Math.max(1, n);
  if (n < 1e7) { const r = Math.round(n); return `${r.toLocaleString('en-US')}<small>${r === 1 ? 'sheet' : 'sheets'}</small>`; }
  const [w, u] = n >= 1e9 ? ['billion', 1e9] : ['million', 1e6], x = n / u;
  return `${x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : x.toFixed(0)} ${w}<small>sheets</small>`;
}
const fmtClock = (T) => { const s = Math.floor(T + 1e-6); return `T+${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const CMP = [[3.4, 'ONE WORKSHEET'], [6.4, 'A STAPLED PACKET'], [9.4, '41 CM · 18 KG'], [12.4, '3.3 M TALL'], [15.4, '26 M TALL'],
  [18.4, '2.4 TONNES'], [21.4, '13,000 M³ OF PAPER'], [24.4, 'DUE TOMORROW, 8 AM'], [SOLVE0, 'IN YOUR HANDWRITING']];

function makeDom(story) {
  const ui = document.getElementById('ui'), st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const hud = document.createElement('div'); hud.className = 'ph-hud';
  hud.innerHTML = '<div class="lab">HOMEWORK</div><div class="val"></div><div class="cmp"></div><div class="clk"></div>'; ui.appendChild(hud);
  const rw = document.createElement('div'); rw.className = 'ph-rw';
  rw.innerHTML = '<svg viewBox="0 0 92 64" width="92" height="64"><path d="M44 4 L4 32 L44 60 Z M88 4 L48 32 L88 60 Z" fill="#fff"/></svg>'; ui.appendChild(rw);
  const end = document.createElement('div'); end.className = 'ph-end';
  end.innerHTML = '<div class="bg"></div><img src="/videos/049-scribe-promo/scribe-icon.png"><div class="wm">Scribe</div><div class="tag">Your homework, in your handwriting.</div><div class="url">tryscribe.ink</div><div class="offer">10 free assignments ✦</div>';
  ui.appendChild(end);
  const [lab, val, cmp, clk] = hud.children;
  let last = {};
  const set = (k, el, v, html = false) => { if (last[k] !== v) { html ? (el.innerHTML = v) : (el.textContent = v); last[k] = v; } };
  const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  function update(t) {
    const tin = story.title.out;
    hud.style.opacity = smooth((t - tin) / 0.25) * (1 - smooth((t - ENDC) / 0.35));
    rw.style.opacity = smooth((t - RW[0]) / 0.08) * (1 - smooth((t - (RW[1] - 0.12)) / 0.12));
    let T, solved = t >= SOLVE0 && t < 900;
    if (t < RW[0]) T = 99;
    else if (t < RW[1]) T = 99 * Math.pow(1 - clamp((t - RW[0]) / (RW[1] - RW[0] - 0.08)), 1.7);
    else T = storyT(t);
    hud.classList.toggle('solved', solved);
    set('lab', lab, solved ? 'SOLVED ✓' : 'HOMEWORK');
    if (solved) { const u = clamp((t - SOLVE0) / (SOLVE1 - SOLVE0)); set('val', val, fmtSheets(u >= 1 ? 2 ** 33 : Math.pow(2, 33 * u)), true); }
    else set('val', val, fmtSheets(sheetsAt(T)), true);
    let c = ''; for (const [a, s] of CMP) if (t >= a) c = s;
    set('cmp', cmp, t < RW[1] ? '' : c);
    set('clk', clk, fmtClock(T));
    end.style.opacity = smooth((t - ENDC) / 0.45);
    end.querySelector('img').style.transform = `scale(${t < ENDC ? 0.6 : 0.6 + 0.4 * easeOutBack((t - ENDC) / 0.5)})`;
  }
  return { update };
}

// ---------------------------------------------------------------- paper textures
function smallSheet(solved, seed = 1) {
  const R = rng(seed);
  return paintPixels(24, 31, (g, w, h) => {
    g.fillStyle = '#fbfaf5'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8c8c8c'; g.fillRect(2, 2, 13, 2);
    for (let k = 0; k < 6; k++) {
      g.fillStyle = '#b9b9b9'; g.fillRect(2, 7 + k * 4, 6 + (k % 3) * 3, 1);
      if (solved) { g.fillStyle = '#22307a'; g.fillRect(3 + R() * 3, 8.2 + k * 4, 9 + R() * 9, 2.0); }
    }
  }, 4);
}
function pileTexture(solved) {
  const S = [0, 1, 2, 3].map((i) => smallSheet(solved, 3 + i));
  return pixelTex(160, 160, (g, w, h) => {
    g.fillStyle = solved ? '#b8bccb' : '#c9c6be'; g.fillRect(0, 0, w, h);
    const R = rng(77);
    for (let i = 0; i < 170; i++) {
      const x = R() * w, y = R() * h, a = R() * PI * 2, s = S[i % 4];
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
        if (x + ox < -14 || x + ox > w + 14 || y + oy < -14 || y + oy > h + 14) continue;
        g.save(); g.translate(x + ox, y + oy); g.rotate(a);
        g.fillStyle = 'rgba(60,55,50,.35)'; g.fillRect(-5.5, -6.5, 12, 15.5);
        g.drawImage(s, -6.5, -8, 12, 15.5); g.restore();
      }
    }
  }, { k: 2, repeat: [1, 1], wrap: true });
}
function edgeTexture() {
  const R = rng(5);
  return pixelTex(8, 64, (g, w, h) => { g.fillStyle = '#f3f1ea'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = R() < 0.5 ? '#d9d5cb' : '#e6e3db'; g.fillRect(0, Math.floor(R() * h), w, 1); } }, { k: 1, repeat: [1, 1], wrap: true });
}

// ---------------------------------------------------------------- props
function makeCup() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.043, 0.034, 0.13, 14), mat(0xf4f1ea, 0.6), g, 0, 0.065, 0);
  mk(new THREE.CylinderGeometry(0.0445, 0.039, 0.05, 14), mat(0x9a1c25, 0.7), g, 0, 0.07, 0);
  mk(new THREE.CylinderGeometry(0.047, 0.047, 0.014, 14), mat(0xfbfaf6, 0.5), g, 0, 0.136, 0);
  mk(new THREE.CylinderGeometry(0.03, 0.04, 0.012, 14), mat(0xfbfaf6, 0.5), g, 0, 0.148, 0);
  return g;
}
function povArm(side, sleeve = 0x2f4f8f, skin = 0xe0ac86) {
  // a blocky first-person forearm: origin at the wrist, the sleeve runs back toward the viewer (+z)
  const g = new THREE.Group(), sm = mat(sleeve, 0.9), km = mat(skin, 0.65);
  mk(new THREE.BoxGeometry(0.115, 0.11, 0.46), sm, g, 0, 0, 0.27);
  mk(new THREE.BoxGeometry(0.125, 0.12, 0.05), mat(0x24406f, 0.9), g, 0, 0, 0.045);
  const hand = new THREE.Group(); g.add(hand);
  mk(new RoundedBoxGeometry(0.095, 0.058, 0.1, 2, 0.02), km, hand, 0, 0, -0.04);
  mk(new RoundedBoxGeometry(0.09, 0.05, 0.05, 2, 0.018), km, hand, 0, 0.03, -0.085);
  mk(new RoundedBoxGeometry(0.03, 0.03, 0.065, 2, 0.01), km, hand, -side * 0.055, 0.025, -0.03);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return { g, hand };
}
function makePhone3D(tex) {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.074, 0.154, 0.009, 2, 0.008), mat(0x17181c, 0.35), g, 0, 0, 0);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.067, 0.143), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.z = 0.0048; g.add(scr);
  mk(new THREE.BoxGeometry(0.012, 0.012, 0.004), mat(0x0a0a0c, 0.3), g, -0.022, 0.06, -0.0055);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return g;
}
function backpack(rig, color) {
  const b = mk(new RoundedBoxGeometry(0.3, 0.38, 0.15, 2, 0.04), mat(color, 0.85), rig.spine, 0, 0.3, -0.18);
  mk(new RoundedBoxGeometry(0.22, 0.15, 0.06, 2, 0.02), mat(color, 0.85), b, 0, -0.08, -0.09);
  return b;
}
const _q = new THREE.Quaternion(), _v = new THREE.Vector3();
function uprightIn(hand, obj, off = [0, -0.06, 0.03], world = null) {     // keep a held cup/mug upright whatever the arm does
  hand.updateMatrixWorld(true); hand.getWorldQuaternion(_q); obj.quaternion.copy(_q).invert(); if (world) obj.quaternion.multiply(world); obj.position.set(...off);
}
const Q_FACE = (yaw) => new THREE.Quaternion().setFromEuler(new THREE.Euler(PI / 2 - 0.25, yaw, 0, 'YXZ'));

// ---------------------------------------------------------------- the Scribe app on the phone (portrait canvas, the 049 app's look)
function makeApp(icon, sheet, pileCanvas) {
  const W = 600, H = 1280, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const view = document.createElement('canvas'); view.width = W; view.height = H;   // the viewfinder: the paper mountain from the top
  { const v = view.getContext('2d'); const gr = v.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5d9ee0'); gr.addColorStop(0.42, '#bcd8f0'); gr.addColorStop(0.46, '#9fb79a'); gr.addColorStop(1, '#7c9a74'); v.fillStyle = gr; v.fillRect(0, 0, W, H);
    v.fillStyle = '#8fb4c9'; for (let i = 0; i < 9; i++) v.fillRect(i * 70 - 10, 560 - (i % 3) * 14, 60, 30);
    v.save(); v.beginPath(); v.moveTo(-40, H); v.quadraticCurveTo(W * 0.15, 640, W * 0.55, 600); v.quadraticCurveTo(W * 0.9, 640, W + 40, 760); v.lineTo(W + 40, H); v.closePath(); v.clip();
    for (let y = 560; y < H; y += 160) for (let x = 0; x < W; x += 160) v.drawImage(pileCanvas, x, y, 160, 160); v.restore(); }
  const bar = () => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, W, 110); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 110, W, 3);
    g.drawImage(icon, 26, 22, 66, 66); g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.fillText('Scribe', 104, 72);
  };
  let lastKey = '';
  function draw({ mode = 'cam', k = 0, n = 0 } = {}) {
    const key = `${mode}:${Math.round(k * 60)}:${n}`; if (key === lastKey) return; lastKey = key;
    g.textAlign = 'left';
    if (mode === 'cam' || mode === 'flash' || mode === 'scan') {
      g.drawImage(view, 0, 0); bar();
      if (mode === 'cam') {
        g.strokeStyle = '#fff'; g.lineWidth = 8; const B = 60;
        for (const [x, y, sx, sy] of [[60, 200, 1, 1], [W - 60, 200, -1, 1], [60, 1060, 1, -1], [W - 60, 1060, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * B); g.lineTo(x, y); g.lineTo(x + sx * B, y); g.stroke(); }
        g.fillStyle = 'rgba(20,20,20,.62)'; g.beginPath(); g.roundRect(W / 2 - 220, 1100, 440, 64, 32); g.fill();
        g.fillStyle = '#fff'; g.font = '600 32px Inter, Arial'; g.textAlign = 'center'; g.fillText('Snap your homework', W / 2, 1143);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, 1215, 44, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.arc(W / 2, 1215, 34, 0, 7); g.stroke();
      }
      if (mode === 'scan') {
        const sy = 120 + (H - 120) * k; g.fillStyle = 'rgba(154,28,37,.2)'; g.fillRect(0, 120, W, sy - 120); g.fillStyle = RED; g.fillRect(0, sy - 5, W, 10);
        g.fillStyle = 'rgba(251,250,246,.96)'; g.beginPath(); g.roundRect(30, 820, W - 60, 300, 26); g.fill();
        g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '44px Georgia, serif'; g.fillText('Reading', W / 2, 890);
        g.font = '600 64px Inter, Arial'; g.fillText('8,589,934,592', W / 2, 976); g.font = '44px Georgia, serif'; g.fillText('pages…', W / 2, 1046);
        g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(70, 1072, W - 140, 16, 8); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(70, 1072, (W - 140) * k, 16, 8); g.fill();
      }
      if (mode === 'flash') { g.fillStyle = `rgba(255,255,255,${1 - k})`; g.fillRect(0, 0, W, H); }
    } else {
      g.fillStyle = CREAM; g.fillRect(0, 0, W, H); bar();
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '48px Georgia, serif';
      if (mode === 'write') { g.fillText('Writing it in', W / 2, 186); g.fillText('your handwriting…', W / 2, 244); }
      else g.fillText('Done. Every page.', W / 2, 214);
      // the sheet, cropped to its top 62 % so the handwriting reads big
      g.save(); g.beginPath(); g.roundRect(24, 286, W - 48, 760, 10); g.clip(); g.drawImage(sheet.canvas, 0, 0, 1024, 1325 * 0.62, 24, 286, W - 48, (W - 48) * (1325 * 0.62) / 1024); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath(); g.roundRect(24, 286, W - 48, 760, 10); g.stroke();
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 1086, W - 100, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 1086, (W - 100) * k, 18, 9); g.fill();
      g.fillStyle = '#4b463d'; g.font = '600 34px Inter, Arial'; g.fillText(`${n.toLocaleString('en-US')} / 8,589,934,592`, W / 2, 1160);
      g.font = '500 28px Inter, Arial'; g.fillStyle = '#6b665c'; g.fillText('solved · ballpoint · navy', W / 2, 1210);
    }
    tex.needsUpdate = true;
  }
  draw({ mode: 'cam' });
  return { canvas: c, tex, draw };
}

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, camera, setCamera } = studio;
  const pixel = addPixelPass(studio);
  const vhs = new ShaderPass(VHS); studio.composer.addPass(vhs); vhs.enabled = false;
  const dom = makeDom(story);
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // two sets: the walk (street.js at the origin) and the school (parked at OFF)
  const street = buildStreet(studio, {}); const fogStreet = scene.fog;
  const school = buildSchool(studio, {}); const fogSchool = school.fog;
  school.root.position.set(...OFF);
  const SG = new THREE.Group(); SG.position.set(...OFF); scene.add(SG);          // everything we add at the school (local coords)
  function useSet(name) {
    street.root.visible = name === 'street'; school.root.visible = SG.visible = name === 'school';
    scene.fog = name === 'street' ? fogStreet : fogSchool; camera.far = name === 'street' ? 400 : 1300; camera.near = 0.03;
  }

  // ---- paper
  const wsProblems = [
    { q: '1.  Solve  3x + 7 = 22', a: '3x = 15\nx = 5' },
    { q: '2.  Factor  x² − 5x + 6', a: '= (x - 2)(x - 3)' },
    { q: '3.  Simplify  (2x³)(4x²)', a: '= 8x^5' },
    { q: '4.  Solve  x² = 49', a: 'x = 7  or  x = -7' },
    { q: '5.  Sketch  y = x² − 4x + 3', a: 'vertex (2, -1)', graph: true },
  ];
  const wsBlank = makeSheet(G, { title: 'ALGEBRA 2 · HOMEWORK 12', note: 'Due tomorrow, 8:00 AM  ·  SHOW ALL WORK', name: '', seed: 5, problems: wsProblems });
  const wsHero = makeSheet(G, { title: 'ALGEBRA 2 · HOMEWORK 12', note: 'Due tomorrow, 8:00 AM  ·  SHOW ALL WORK', name: '', seed: 5, problems: wsProblems });
  wsBlank.draw(0, true);
  const sheetU = pixelTexture(smallSheet(false, 1)), sheetS = pixelTexture(smallSheet(true, 2));
  const pileU = pileTexture(false), pileS = pileTexture(true);
  const edgeTex = edgeTexture();
  const paperTop = new THREE.MeshLambertMaterial({ map: wsBlank.tex });
  const edgeM = new THREE.MeshLambertMaterial({ map: edgeTex });
  const plainM = mat(0xf3f1ea, 0.9);

  // a stack/column of paper: unit box with its base at the origin (scale.y = height)
  const stackGeo = new THREE.BoxGeometry(SHEET[0], 1, SHEET[1]); stackGeo.translate(0, 0.5, 0);
  const makeStack = (parent, wide = 1) => { const m = new THREE.Mesh(stackGeo, [edgeM, edgeM, paperTop, plainM, edgeM, edgeM]); m.scale.set(wide, 0.01, wide); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

  // the heap (+ a small crash pile) with the wave material
  const heapM = sweepMat(pileU, pileS, 3.0);
  const heapGeo = heapGeometry();
  const heap = new THREE.Mesh(heapGeo, heapM); heap.castShadow = true; heap.receiveShadow = true; SG.add(heap);
  heap.position.set(HC[0], 0, HC[1]);
  const crashPiles = [[16.2, -6.9, 2.6, 1.15], [21.6, -7.1, 2.2, 0.95], [9.4, -7.3, 1.8, 0.7], [27.6, -7.0, 2.0, 0.8]].map(([x, z, R, h]) => {
    const m = new THREE.Mesh(heapGeo, heapM); m.position.set(x, 0.02, z); m.userData.d = [R, h]; m.castShadow = m.receiveShadow = true; SG.add(m); return m;
  });

  // flying sheets: one analytic pool (deterministic: every pose is a function of t)
  const NF = 700;
  const flyM = sweepMat(sheetU, sheetS, 0, { side: THREE.DoubleSide, emissive: 0x8a8a86 });   // lit from inside a bit: seen from below against the sky they read as paper, not specks
  const fly = new THREE.InstancedMesh(new THREE.PlaneGeometry(SHEET[0], SHEET[1]), flyM, NF); fly.frustumCulled = false; scene.add(fly);
  const FR = rng(91), FS = Array.from({ length: NF }, () => [FR(), FR(), FR(), FR(), FR(), FR(), FR(), FR()]);
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _qq = new THREE.Quaternion();
  // cfg: {c:[x,y,z] world, box:[sx,sy,sz], n, life, wind:[vx,vy,vz], sway, spin, burst:{t0, v}, scale}
  function flyers(t, cfg) {
    const n = cfg ? Math.min(NF, cfg.n) : 0;
    for (let i = 0; i < NF; i++) {
      if (i >= n) { _m.makeScale(0, 0, 0); fly.setMatrixAt(i, _m); continue; }
      const [a, b, c, d, e, f, gg, hh] = FS[i];
      let age, life = cfg.life * (0.7 + 0.6 * d), k;
      if (cfg.burst) { age = t - cfg.burst.t0 - a * 0.08; if (age < 0) { _m.makeScale(0, 0, 0); fly.setMatrixAt(i, _m); continue; } k = 1; }
      else { age = (t + a * life * 3.7) % life; k = smooth(age / 0.35) * (1 - smooth((age - (life - 0.5)) / 0.5)); }
      const [sx, sy, sz] = cfg.box, [wx, wy, wz] = cfg.wind;
      let x = cfg.c[0] + (b - 0.5) * sx, y = cfg.c[1] + (c - 0.5) * sy, z = cfg.c[2] + (e - 0.5) * sz;
      if (cfg.burst) {
        const v = cfg.burst.v * (0.4 + 0.8 * f), th = gg * PI * 2, el = 0.25 + hh * 1.0, dr = 1 - Math.exp(-age * 2.2);
        x += (Math.cos(th) * Math.cos(el) * v * dr) / 2.2; z += (Math.sin(th) * Math.cos(el) * v * dr) / 2.2;
        y = Math.max(0.05, y + (Math.sin(el) * v * dr) / 2.2 - 0.9 * age);
      } else { x += wx * age; y += wy * age; z += wz * age; }
      const sw = cfg.sway * Math.sin(age * (2 + 3 * f) + gg * 6);
      x += sw; z += sw * 0.6 * (hh - 0.5);
      _p.set(x, y, z);
      _e.set(age * cfg.spin * (f - 0.5) * 2 + a * 6, age * cfg.spin * (gg - 0.3) + b * 6, Math.sin(age * 3 + c * 6) * 0.8);
      _qq.setFromEuler(_e); const s = (cfg.scale || 1) * k; _s.set(s, s, s);
      _m.compose(_p, _qq, _s); fly.setMatrixAt(i, _m);
    }
    fly.instanceMatrix.needsUpdate = true;
  }
  const W3 = (x, y, z) => [x + OFF[0], y + OFF[1], z + OFF[2]];

  // reams scattered along the fallen column (instanced boxes)
  const NR = 230, RR = rng(17);
  const reams = new THREE.InstancedMesh(new THREE.BoxGeometry(SHEET[0] * COL_W, 0.06, SHEET[1] * COL_W), new THREE.MeshLambertMaterial({ color: 0xf2f0e9 }), NR);
  reams.castShadow = true; reams.receiveShadow = true; reams.frustumCulled = false; SG.add(reams);
  const REAM = Array.from({ length: NR }, (_, i) => { const x = 1 + (i / NR) * 50 + (RR() - 0.5) * 0.8, z = -7.2 + (RR() - 0.5) * 2.6; return { x, z, y: 0.03 + RR() * 0.25, ry: RR() * PI, rx: (RR() - 0.5) * 0.5, d: RR() }; });

  // ---- people
  const SKIN = [0xe0ac86, 0xc98f6a, 0x8d5a3c, 0xf0c7a4, 0xb5784f];
  const youSt = makePerson({ skin: 0xe0ac86, top: 0x2f4f8f, pants: 0x3a3f4a, hair: 0x3b2a20, hairStyle: 'messy' });
  const youSc = makePerson({ skin: 0xe0ac86, top: 0x2f4f8f, pants: 0x3a3f4a, hair: 0x3b2a20, hairStyle: 'messy' });
  street.root.add(youSt.root); const youCarrier = new THREE.Group(); SG.add(youCarrier); youCarrier.add(youSc.root);
  backpack(youSt, 0xc0392b); backpack(youSc, 0xc0392b);
  const cupSt = makeCup(), cupSc = makeCup(); youSt.arms[0].hand.add(cupSt); youSc.arms[0].hand.add(cupSc);
  const handStack = makeStack(youSt.arms[1].hand);           // the few sheets you carry in the side shot
  const appScreenTex = { tex: null };
  const teacher = makePerson({ skin: 0xd9a27e, top: 0x7a5c8e, collar: 0xf3efe6, pants: 0x4a4f5a, hair: 0xa8a8a8, hairStyle: 'short', glasses: true, mustache: 0x8a8a8a });
  SG.add(teacher.root); const tMug = makeMug(0x2f6b4f); teacher.arms[1].hand.add(tMug);
  const studs = [
    { o: { skin: SKIN[1], top: 0xe2a33a, pants: 0x2f3e5c, hair: 0x1f1610, hairStyle: 'bob' }, p: [-3.3, -8.6], pack: 0x3d7bd9 },
    { o: { skin: SKIN[2], top: 0x6aa36f, pants: 0x3a3a40, hair: 0x15100c, hairStyle: 'short' }, p: [2.6, -9.6], pack: 0xe2a33a },
    { o: { skin: SKIN[3], top: 0xd2483f, pants: 0x5a4a3a, hair: 0x8a5a2b, hairStyle: 'messy' }, p: [-2.2, -10.9], pack: 0x2f2f33, step: true },
    { o: { skin: SKIN[4], top: 0xb8a6c9, pants: 0x2f3e5c, hair: 0x2b1d14, hairStyle: 'bob' }, p: [3.7, -7.5], pack: 0x6aa36f },
  ].map((s) => { const r = makePerson(s.o); backpack(r, s.pack); SG.add(r.root); return { r, ...s }; });
  const walkers = [
    { o: { skin: SKIN[3], top: 0xe6b8b8, pants: 0x3a3f4a, hair: 0x6b4a2b, hairStyle: 'bob' }, z: -0.75, x0: 4, sp: 1.25, ph: 0.2 },
    { o: { skin: SKIN[2], top: 0xefe0b8, pants: 0x34405c, hair: 0x15100c, hairStyle: 'short', glasses: true }, z: -2.15, x0: 7.5, sp: 1.1, ph: 0.6 },
    { o: { skin: SKIN[0], top: 0x6aa36f, pants: 0x4a4f5a, hair: 0x9c6a3a, hairStyle: 'short' }, z: -1.0, x0: -3, sp: 1.3, ph: 0.4 },
  ].map((w) => { const r = makePerson(w.o); street.root.add(r.root); return { r, ...w }; });

  // ---- POV: blocky forearms + cup + sheet / stack / phone, in a "body frame" (yaw only) at the eye
  const pov = new THREE.Group(); scene.add(pov);
  const armL = povArm(-1), armR = povArm(1); pov.add(armL.g, armR.g);
  const povCup = makeCup(); armL.hand.add(povCup); povCup.position.set(0.0, -0.05, -0.02);
  const povSheets = new THREE.Group(); pov.add(povSheets);
  const sheetGeo = new THREE.PlaneGeometry(SHEET[0], SHEET[1]);
  const povSheetM = new THREE.MeshLambertMaterial({ map: wsBlank.tex, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(sheetGeo, povSheetM); m.renderOrder = 2 - i; povSheets.add(m); }
  const povStack = makeStack(pov); const povTopCup = makeCup(); pov.add(povTopCup);
  const app = makeApp(icon, wsHero, pileU.image);
  const phone = makePhone3D(app.tex); pov.add(phone);
  const phoneSc = makePhone3D(app.tex); youSc.arms[1].hand.add(phoneSc); phoneSc.scale.setScalar(1.3);

  // ---- the school tower + hero sheet
  const tower = new THREE.Group(); SG.add(tower); tower.position.set(-0.5, 0.06, -7.2);
  const column = makeStack(tower, COL_W);
  const hero = new THREE.Mesh(new THREE.PlaneGeometry(SHEET[0] * 2.2, SHEET[1] * 2.2), new THREE.MeshLambertMaterial({ map: wsHero.tex, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 })); SG.add(hero); hero.renderOrder = 3;
  // crushed cars: remember their parts
  const carParts = school.cars.map((c) => ({ c, cab: c.body.children[1], glass: c.body.children[2], y0: c.body.position.y }));

  // ---------------------------------------------------------------- poses
  function pose(rig, o) { const p = basePose(); Object.assign(p, o); applyPose(rig, p); return p; }
  const lookUp = (fromY, dist, topY) => -clamp(Math.atan2(topY - fromY, Math.max(0.5, dist)) * 0.8, -0.2, 0.8);
  const A_CUP = { sx: -0.62, sz: 0.12, el: -1.25, free: 0 }, A_CUP_B = { sx: -0.62, sz: 0.12, el: -1.25, free: 0 };
  const A_TOAST = { sx: -2.85, sz: 0.35, el: -0.35, free: 0 }, A_PHONE = { sx: -1.05, sz: 0.0, el: -1.05, twist: 0.2, free: 0 };

  // ---------------------------------------------------------------- one frame of the world at (scene) time t
  let lastCam = null;
  function world(t, real) {
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    const cam = shot.cam, u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const T = cam === 'cold' || cam === 'loop' ? 99 : storyT(t), N = sheetsAt(T);
    const onSchool = !['pov1', 'side', 'pov3'].includes(cam);
    useSet(onSchool ? 'school' : 'street');
    pov.visible = ['pov1', 'pov3', 'summit', 'phone'].includes(cam);
    // defaults: hide everything shot-specific
    [armL.g, armR.g, povCup, povSheets, povStack, povTopCup, phone, phoneSc, hero, handStack].forEach((o) => (o.visible = false));
    youSt.root.visible = false; walkers.forEach((w) => (w.r.root.visible = false));
    street.trash.visible = true;
    youSc.root.visible = false; teacher.root.visible = false; studs.forEach((s) => (s.r.root.visible = false));
    school.houses.forEach((hh) => (hh.visible = true));
    tower.visible = false; heap.visible = false; crashPiles.forEach((m) => (m.visible = false)); reams.visible = false;
    let flyCfg = null, P, Aim, fov = 50, amp = 0.004, shake = 0;
    const solvedAll = cam === 'cold' || cam === 'loop';
    SW.c.value.set(HC[0] + OFF[0], HC[1] + OFF[2]);
    SW.r.value = solvedAll ? 1e5 : cam === 'wave' ? (t > WAVE1 + 0.45 ? 1e5 : Math.min(90, 1.2 + 0.5 * waveDist(t) + 30 * smooth((t - 32.55) / 0.85))) : cam === 'phone' ? 2.5 : -1;
    SW.glow.value = cam === 'wave' ? 2.6 * (1 - smooth((t - (WAVE1 + 0.05)) / 0.35)) : 0;
    SW.band.value = cam === 'wave' ? 0.6 + 0.26 * waveDist(t) : 4;

    // ---------------- the street (B1–B3)
    if (cam === 'pov1' || cam === 'pov3' || cam === 'side') {
      street.aimSun(12, -1, 14);
      // passersby walking toward you on the back sidewalk
      walkers.forEach((w, i) => {
        const x = w.x0 + w.sp * (t - 3.4) - (cam === 'side' ? 0 : 0); const d = w.sp * (t - 3.4) + w.ph * 3;
        w.r.root.visible = true;
        pose(w.r, { x, z: cam === 'pov1' ? w.z : -2.4 - 0.12 * i, y: SIDEWALK_H, floor: SIDEWALK_H, rotY: PI / 2, dist: d, speed: w.sp, eyes: blink(t, i), headYaw: cam === 'side' ? -0.5 : 0 });
      });
    }
    if (cam === 'pov1' || cam === 'pov3') {
      const x0 = cam === 'pov1' ? 21 : 16.8, sp = 1.35, dt = t - shot.t0, x = x0 - sp * dt;
      const ph = (sp * dt) / 0.38 * PI, bob = 0.016 * Math.abs(Math.sin(ph)), sway = 0.008 * Math.sin(ph / 2);
      const eye = [x, SIDEWALK_H + 1.6 + bob, -1.35 + sway];
      pov.position.set(...eye); pov.rotation.set(0, PI / 2, 0);          // body faces -x (local -z → world -x)
      armL.g.visible = armR.g.visible = true;
      if (cam === 'pov1') {
        P = eye; Aim = [x - 6, eye[1] - 1.25, -1.25]; fov = 58; amp = 0.003;
        armL.g.position.set(-0.075, -0.235, -0.44); armL.g.rotation.set(0.55, 0.22, 0.12); povCup.visible = true;
        armR.g.position.set(0.12, -0.36, -0.47); armR.g.rotation.set(0.55, -0.22, -0.3);
        povSheets.visible = true;
        const n = Math.min(6, Math.round(N)), pop = K(t, [[5.12, 0], [5.3, 1]]);
        povSheets.children.forEach((m, i) => {
          m.visible = i < n; const fan = i === 1 ? pop : 1;
          m.position.set(0.06 + i * 0.022 * fan, -0.29 + i * 0.004, -0.56 + i * 0.006);
          m.rotation.set(-0.95, 0.08, 0.2 - i * 0.12 * fan);
          m.scale.setScalar(i === 1 ? 0.3 + 0.7 * smooth(pop * 1.4) : 1);
        });
      } else {
        // B3: both arms hug a stack that grows to your chin; the coffee rides on top
        const H = N * SHEET_T * 1.02, wob = 0.03 * smooth((t - 11.2) / 0.8) * Math.sin(t * 9);
        P = eye; Aim = [x - 3.5, eye[1] - 1.85 + 0.75 * smooth((t - 11.3) / 1.0), -1.3]; fov = 60; amp = 0.003;
        const gy = -0.5 + Math.min(0.2, H * 0.5);
        armL.g.position.set(-0.2, gy, -0.43); armL.g.rotation.set(0.15, -0.25, -1.2);
        armR.g.position.set(0.2, gy, -0.43); armR.g.rotation.set(0.15, 0.25, 1.2);
        povStack.visible = true; povStack.scale.set(1.45, Math.max(0.002, H), 1.45); povStack.position.set(0, -0.5, -0.45); povStack.rotation.set(0, 0.04, wob * 0.3);
        povTopCup.visible = true; povTopCup.position.set(-0.07 + wob, -0.5 + Math.max(0.002, H) + 0.001, -0.56); povTopCup.rotation.set(0, 0, wob * 3);
        flyCfg = { c: [x - 0.5, SIDEWALK_H + 1.2, -1.35], box: [1.0, 0.8, 1.0], n: Math.round(40 * smooth((t - 10.6) / 1.2)), life: 1.6, wind: [1.6, -0.7, 0.4], sway: 0.25, spin: 4 };
      }
    }
    if (cam === 'side') {
      // B2: side tracking shot from the road; you walk -x along the back sidewalk, the sheets in your hand go 2 → 3 → 4
      const sp = 1.25, x = 11 - sp * (t - 6.4);
      youSt.root.visible = true;
      pose(youSt, { x, z: -1.55, y: SIDEWALK_H, floor: SIDEWALK_H, rotY: -PI / 2, dist: sp * (t - 6.4), speed: sp, armA: A_CUP, armB: { sx: -0.5, sz: 0.18, el: -1.1, twist: -0.3, free: 0 }, eyes: blink(t, 2), headYaw: -0.15, headPitch: 0.25, smile: 1 });
      cupSt.visible = true; uprightIn(youSt.arms[0].hand, cupSt, [0, -0.11, 0.02]);
      street.trash.visible = false;
      handStack.visible = true; uprightIn(youSt.arms[1].hand, handStack, [0, -0.07, 0.08], Q_FACE(0));
      const n = Math.round(N), pop = Math.max(K(t, [[7.36, 0], [7.5, 1]]) * (1 - K(t, [[7.5, 0], [7.7, 1]])), K(t, [[8.82, 0], [8.96, 1]]) * (1 - K(t, [[8.96, 0], [9.16, 1]])));
      handStack.scale.set(1.5 * (1 + 0.25 * pop), Math.max(0.003, n * 0.006), 1.5 * (1 + 0.25 * pop));   // a few sheets: drawn bigger + thicker so they read
      P = [x + 0.15, 1.25, 3.3]; Aim = [x - 0.45, 1.12, -1.6]; fov = 44; amp = 0.004;
      flyCfg = { c: [x + 0.2, 1.3, -1.4], box: [0.6, 0.5, 0.6], n: n >= 3 ? 3 : 0, life: 1.4, wind: [1.4, -0.6, 0.2], sway: 0.2, spin: 4 };
    }

    // ---------------- the school (B4–B11 + cold open)
    if (onSchool) school.update(t);
    if (cam === 'teacher' || cam === 'tower' || cam === 'crash') {
      const H = N * SHEET_T;
      tower.visible = cam !== 'crash' || t < TCRASH;
      let lean = 0;
      if (cam === 'tower') lean = 0.012 * smooth((t - 16.5) / 1.5) * Math.sin(t * 2.2);
      if (cam === 'crash') lean = t < TFALL ? 0.02 + 0.05 * smooth((t - 18.4) / 0.8) : lerp(0.07, PI / 2 - 0.05, Math.pow(clamp((t - TFALL) / (TCRASH - TFALL)), 2.1));
      if (cam === 'teacher') lean = 0.01 * smooth((t - 14.4) / 1) * Math.sin(t * 4);
      tower.rotation.set(0, 0, -lean); column.scale.set(COL_W, Math.max(0.01, H), COL_W);
      const topY = Math.min(H, 60);
      // teacher + students look up at the top
      const tx = -1.6, tz = -7.9;
      teacher.root.visible = cam !== 'crash';
      pose(teacher, { x: tx, z: tz, rotY: 0.2, headYaw: 0.5, headPitch: lookUp(1.6, 1.2, topY), lean: -0.06 - 0.1 * smooth((topY - 2) / 6), armB: { sx: -0.55, sz: 0.1, el: -1.45, free: 0 }, mouth: topY > 2.2 ? 'o' : 'flat', glasses: true, eyes: blink(t, 4) });
      uprightIn(teacher.arms[1].hand, tMug, [0, -0.07, 0.03]);
      studs.forEach((s, i) => {
        s.r.root.visible = cam !== 'crash';
        const d = Math.hypot(s.p[0] + 0.5, s.p[1] + 7.2);
        pose(s.r, { x: s.p[0], z: s.p[1], y: s.step ? 0.45 : 0, floor: s.step ? 0.45 : 0, rotY: faceToward(s.p[0], s.p[1], -0.5, -7.2) + (i % 2 ? 0.3 : -0.3), headPitch: lookUp(1.6, d, topY), mouth: topY > 3 ? 'o' : 'smile', eyes: blink(t, 5 + i), armA: i === 1 ? { sx: -2.4, sz: 0.3, el: -0.5, free: 0 } : basePose().armA });
      });
      youSc.root.visible = cam !== 'crash'; youCarrier.position.set(0, 0, 0);
      pose(youSc, { x: 0.75, z: -6.45, rotY: faceToward(0.75, -6.45, -0.5, -7.2) + 0.35, headPitch: lookUp(1.6, 1.3, topY), headYaw: -0.4, armA: A_CUP, mouth: 'o', eyes: blink(t, 1) });
      cupSc.visible = true; uprightIn(youSc.arms[0].hand, cupSc, [0, -0.11, 0.02]);
      if (cam === 'teacher') {
        school.aimSun(0, -8, 9);
        P = W3(1.5, 0.75 + 0.15 * u, -2.2 - 0.3 * u); Aim = W3(-0.3, 1.2 + 0.45 * smooth((t - 13.4) / 2), -7.6); fov = 56; amp = 0.004;
        flyCfg = { c: W3(-0.5, Math.max(0.6, topY * 0.6), -7.2), box: [0.8, Math.max(0.6, topY), 0.8], n: Math.round(30 * smooth((topY - 1) / 2)), life: 1.8, wind: [1.2, -0.5, 0.8], sway: 0.3, spin: 4 };
      }
      if (cam === 'tower') {
        school.aimSun(0, -7, 14);
        const e = easeIO(clamp((t - 15.6) / 2.6));
        P = W3(lerp(1.7, 6.5, e), lerp(0.4, 2.2, e), lerp(-4.6, 17, e)); Aim = W3(lerp(-0.4, -0.5, e), lerp(3.2, 11.5, e), lerp(-7.2, -8, e)); fov = lerp(64, 58, e); amp = 0.006;
        flyCfg = { c: W3(-0.5, topY * 0.55, -7.2), box: [1.6, topY, 1.6], n: 160, life: 2.4, wind: [2.2, -0.6, 1.2], sway: 0.6, spin: 3 };
      }
      if (cam === 'crash') {
        school.aimSun(16, -6, 18);
        const hit = t >= TCRASH, e = smooth((t - TCRASH - 0.1) / 1.1);
        // follow the falling column: aim at a point 16 m up it, whip down onto the cars at the impact, then push in on the crushed car
        const cpL = 16, colPt = [-0.5 + Math.sin(lean) * cpL, 0.06 + Math.cos(lean) * cpL, -7.2];
        const f = smooth((t - 19.75) / 0.32), pre = [lerp(colPt[0], 16.2, f), lerp(colPt[1], 1.6, f), lerp(colPt[2], -6.6, f)];
        P = hit ? W3(lerp(9.5, 14.4, e), lerp(2.6, 1.5, e), lerp(16.0, -1.3, e)) : W3(9.5, 2.6, 16.0);
        Aim = hit ? W3(lerp(16.2, 16.3, e), lerp(1.6, 0.9, e), -6.6) : W3(...pre);
        fov = hit ? lerp(60, 50, e) : 60; amp = 0.005;
        shake = hit ? 0.5 * Math.exp(-(t - TCRASH) * 5) : 0;
        if (!hit) flyCfg = { c: W3(8, 10, -7.2), box: [12, 18, 3], n: 90, life: 2.4, wind: [1.5, -0.8, 1.0], sway: 0.6, spin: 3 };
        else flyCfg = { c: W3(16.5, 1.4, -6.9), box: [26, 1.2, 1.5], n: 520, life: 3, wind: [0, 0, 0], sway: 0.3, spin: 4, burst: { t0: TCRASH, v: 9 } };
      }
    }
    // crushed cars + the reams line: from the crash on
    const crashed = onSchool && (t >= TCRASH || ['bury', 'summit', 'phone', 'wave', 'cold', 'loop'].includes(cam));
    carParts.forEach((cp, i) => {
      const hitT = TCRASH + 0.004 * i, k = crashed ? clamp((t - hitT) / 0.07) : 0, sq = (cam === 'crash' ? k : crashed ? 1 : 0);
      const bounce = sq * (1 + 0.12 * Math.sin(clamp((t - hitT) / 0.4) * PI) * (cam === 'crash' ? 1 : 0));
      cp.cab.scale.y = 1 - 0.68 * bounce; cp.glass.scale.y = 1 - 0.7 * bounce; cp.cab.position.y = 1.15 - 0.3 * bounce; cp.glass.position.y = 1.18 - 0.32 * bounce;
      cp.c.body.position.y = cp.y0 - 0.12 * sq; cp.c.body.rotation.z = (i % 2 ? 0.05 : -0.04) * sq;
      cp.c.setLights(cam === 'crash' && t > TCRASH + 0.2 ? (Math.sin((t - TCRASH) * 9) > 0 ? 0.9 : 0.1) : 0, 0);
    });
    if (crashed) {
      reams.visible = true;
      REAM.forEach((r, i) => {
        const land = cam === 'crash' ? clamp((t - TCRASH - r.d * 0.12) / 0.3) : 1, onCar = school.D.cars.some(([cx, cz]) => Math.abs(r.x - cx) < 1.0 && Math.abs(r.z - cz) < 1.9);
        const y = (onCar ? 0.95 : 0) + r.y + (1 - land) * (1.8 + r.d * 2);
        _e.set(r.rx * land, r.ry, 0); _qq.setFromEuler(_e); _p.set(r.x, y, r.z); _s.set(land > 0 || cam !== 'crash' ? 1 : 0, 1, 1);
        _m.compose(_p, _qq, _s); reams.setMatrixAt(i, _m);
      });
      reams.instanceMatrix.needsUpdate = true;
      crashPiles.forEach((m) => { const [R, h] = m.userData.d, k = cam === 'crash' ? smooth((t - TCRASH - 0.05) / 0.5) : 1; m.visible = k > 0; m.scale.set(R * (0.6 + 0.4 * k), h * k + 0.001, R * (0.6 + 0.4 * k)); });
    }

    // the heap: B7 grows it from the crash to the whole school, then you ride its summit
    if (['bury', 'summit', 'phone', 'wave', 'cold', 'loop'].includes(cam)) {
      const d = heapDims(N); heap.visible = true; heap.scale.set(d.R, d.h, d.R);
      school.houses.forEach((hh) => (hh.visible = Math.hypot(hh.position.x - HC[0], hh.position.z - HC[1]) > d.R * 0.75));
      const top = heapAt(HC[0], HC[1], d);
      youSc.root.visible = cam !== 'summit' && cam !== 'phone';
      youCarrier.position.set(HC[0], top - 0.02, HC[1]);
      if (cam === 'bury') {
        school.aimSun(2, -8, 45);
        const e = easeIO(u);
        P = W3(lerp(-6, -16, e), lerp(22, 52, e), lerp(40, 92, e)); Aim = W3(3, lerp(4, 9, e), -10); fov = 50; amp = 0.01;
        pose(youSc, { x: 0, z: 0, rotY: 0.4, armA: A_TOAST, headPitch: -0.2, eyes: 'open', mouth: 'o' }); cupSc.visible = true; uprightIn(youSc.arms[0].hand, cupSc, [0, -0.11, 0.02]);
        flyCfg = { c: W3(HC[0], d.h * 0.6, HC[1] + 4), box: [d.R * 1.5, d.h * 1.4 + 4, d.R * 1.2], n: 600, life: 3, wind: [3, -1.2, 2], sway: 1.2, spin: 3, scale: 2.2 };
      }
      if (cam === 'summit' || cam === 'phone') {
        // POV on top of the mountain: coffee in the left hand, Scribe on the phone in the right
        const eye = [HC[0] + 0.0, top + 1.62, HC[1] + 0.4];
        pov.position.set(...W3(...eye)); pov.rotation.set(0, PI + 0.1, 0);       // facing +z (over the road and the houses)
        armL.g.visible = armR.g.visible = phone.visible = true;
        if (cam === 'summit') {
          const raise = smooth((t - 24.5) / 0.6);
          armL.g.position.set(-0.15, -0.33, -0.36); armL.g.rotation.set(0.5, 0.15, 0.08); povCup.visible = true;
          phone.position.set(lerp(0.12, 0.03, raise), lerp(-0.42, -0.045, raise), -0.3); phone.rotation.set(lerp(-0.9, -0.08, raise), -0.05, 0.03);
          armR.g.position.copy(phone.position).add(_v.set(0.055, -0.115, 0.08)); armR.g.rotation.set(1.15, -0.4, -0.7);
          P = W3(...eye); Aim = W3(eye[0] + 0.6, eye[1] - 3.0 + 1.6 * raise, eye[2] + 8); fov = 56; amp = 0.004;
          if (t < TPOP) app.draw({ mode: 'cam' }); else if (t < TPOP + 0.22) app.draw({ mode: 'flash', k: (t - TPOP) / 0.22 }); else app.draw({ mode: 'scan', k: clamp((t - TPOP - 0.22) / 1.45) });
          flyCfg = { c: W3(eye[0], eye[1] - 1.2, eye[2] + 4.5), box: [10, 4, 7], n: 120, life: 2.2, wind: [3.5, 0.6, 1.4], sway: 0.5, spin: 4 };
        } else {
          phone.position.set(0.011, -0.043, -0.255); phone.rotation.set(-0.03, 0, 0.02);
          armR.g.position.set(0.064, -0.128, -0.232); armR.g.rotation.set(1.35, -0.5, -0.95);
          armL.g.visible = false;
          P = W3(...eye); Aim = W3(eye[0], eye[1] - 0.02, eye[2] + 3); fov = 50; amp = 0.0015;
          const k = clamp((t - 27.55) / 2.75);
          wsHero.draw(wsHero.total * Math.min(1, k * 1.05));
          app.draw({ mode: 'write', k, n: Math.round(Math.pow(2, 33 * clamp((t - SOLVE0) / (SOLVE1 - SOLVE0)))) * (t >= SOLVE0 ? 1 : 0) });
          flyCfg = { c: W3(eye[0], eye[1] - 1.5, eye[2] + 6), box: [12, 5, 6], n: 80, life: 2.2, wind: [3.5, 0.6, 1.4], sway: 0.5, spin: 4 };
        }
      }
      if (cam === 'wave') {
        // the hero sheet near the summit finishes writing, then the camera pulls back as the wave rolls down the mountain
        const hx = HC[0] + 1.7, hz = HC[1] + 2.3, hy = heapAt(hx, hz, d);
        const ex = 0.05, gx = (heapAt(hx + ex, hz, d) - heapAt(hx - ex, hz, d)) / (2 * ex), gz = (heapAt(hx, hz + ex, d) - heapAt(hx, hz - ex, d)) / (2 * ex);
        const n = new THREE.Vector3(-gx, 1, -gz).normalize();
        hero.visible = true; hero.position.set(hx, hy, hz).addScaledVector(n, 0.12);
        hero.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); hero.rotateZ(0.12);
        wsHero.draw(wsHero.total);
        pose(youSc, { x: 0, z: 0, rotY: 0.7, armA: A_TOAST, armB: A_PHONE, headPitch: -0.1, eyes: 'open', mouth: 'smile' }); cupSc.visible = true; uprightIn(youSc.arms[0].hand, cupSc, [0, -0.11, 0.02]);
        phoneSc.visible = true; phoneSc.position.set(0, -0.09, 0.05); phoneSc.rotation.set(PI / 2, 0, 0);
        const e = clamp((t - 30.75) / 2.05), ee = easeIO(e);
        const dist = waveDist(t);
        const hp0 = new THREE.Vector3(hx, hy, hz), endV = new THREE.Vector3(...WAVE_END).sub(hp0), endD = endV.length();
        const dir = n.clone().lerp(endV.normalize(), smooth(e * 1.1)).normalize();
        const hp = hp0, tgt = hp.clone().lerp(new THREE.Vector3(...WAVE_AIM), ee);
        P = W3(...hp.clone().addScaledVector(dir, Math.min(dist, endD)).toArray()); Aim = W3(...tgt.toArray()); fov = 50; amp = 0.002;
        school.aimSun(HC[0], HC[1], 70);
        flyCfg = { c: W3(HC[0], d.h * 0.7, HC[1] + 6), box: [d.R * 1.2, d.h, d.R], n: 600, life: 3, wind: [3, -1, 2], sway: 1.2, spin: 3, scale: 2.4 };
      }
      if (cam === 'cold' || cam === 'loop') {
        // the end state = frame 0: you on the summit of a solved paper mountain, coffee up; L runs -3.6 → 0 (B11) → 4.4 (end card)
        const L = cam === 'cold' ? t : t - ENDC;
        const a = 0.42 + 0.075 * L, D = 18.5 - 0.9 * L, top3 = [HC[0], top, HC[1]];
        const camY = heapAt(HC[0] + Math.sin(a) * D, HC[1] + Math.cos(a) * D, d) + 1.3;
        P = W3(top3[0] + Math.sin(a) * D, camY, top3[2] + Math.cos(a) * D); Aim = W3(top3[0], top3[1] + 10.0, top3[2]); fov = 54; amp = 0.004;
        const wave = Math.sin(t * 5.5) * 0.35;
        pose(youSc, { x: 0, z: 0, rotY: a - 0.35, armA: { ...A_TOAST, sz: A_TOAST.sz + wave }, armB: A_PHONE, headPitch: -0.15, headRoll: wave * 0.2, eyes: blink(t, 3), mouth: 'smile', lean: -0.05 });
        cupSc.visible = true; uprightIn(youSc.arms[0].hand, cupSc, [0, -0.11, 0.02]);
        phoneSc.visible = true; phoneSc.position.set(0, -0.09, 0.05); phoneSc.rotation.set(PI / 2, 0, 0); app.draw({ mode: 'done', k: 1, n: 2 ** 33 });
        school.aimSun(HC[0], HC[1], 30);
        flyCfg = { c: W3(top3[0], top3[1] + 1, top3[2]), box: [24, 9, 24], n: 420, life: 2.6, wind: [3.2, 0.4, 1.6], sway: 0.8, spin: 3 };
      }
    }
    flyM.map = SW.r.value > 1e4 ? sheetS : sheetU;
    flyers(t, flyCfg);
    return { P, Aim, fov, amp, shake, cam };
  }

  // ---------------------------------------------------------------- per frame
  function update(t) {
    let st = t, rew = 0;
    if (t >= RW[0] && t < RW[1]) {           // the rewind: three earlier moments played backward, fast
      const segs = [[2.2, 2.6, 24.2, 22.0], [2.6, 3.0, 18.2, 16.2], [3.0, 3.4, 6.2, 3.55]];
      const s = segs.find(([a, b]) => t >= a && t < b) || segs[2];
      st = lerp(s[2], s[3], (t - s[0]) / (s[1] - s[0])); rew = 1;
    }
    const w = world(st, t);
    const n = w.shake ? [Math.sin(t * 61) * w.shake, Math.sin(t * 47 + 1) * w.shake * 0.7, 0] : [0, 0, 0];
    setCamera([w.P[0] + n[0], w.P[1] + n[1], w.P[2]], w.Aim, w.fov, t, w.amp);
    vhs.enabled = rew > 0; vhs.uniforms.uAmt.value = rew; vhs.uniforms.uT.value = t;
    const base = w.cam === 'phone' ? 3 : w.cam === 'summit' ? 5 : w.cam === 'wave' ? Math.round(lerp(3, PIXEL, smooth((t - 31.0) / 0.9))) : PIXEL;
    pixel.set(rew ? PIXEL : Math.max(base, mosaicAt(t, CUTS, 0.34, 40)), { avg: 4 });
    dom.update(t);
    if (story.debugLineup && t >= 200) document.getElementById('ui').style.display = 'none';
  }
  return { update };
}
