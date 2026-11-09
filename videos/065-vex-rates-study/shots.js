// 065 — "Mommy rates your study habits" (Scribe lane, anime/pixel look). A different FORMAT, PLACE and Scribe FEATURE from 064 (user
// via manager, Nov 9: "make sure there's some variance… I know this one's a POV, we can do another thingy"):
//   format  = a rating list: Vex scores your habits out loud, each with a prop gag + a pixel rating card (47 tabs 2/10, a third energy
//             drink 0/10, highlighting the whole page −1/10, studying in bed 6/10, the bio worksheet 10/10, final score 10/10);
//   place   = her goth bedroom at dusk (plum walls, string lights, a lava lamp, a dusk window, a black bed, posters), not the beach;
//   feature = Scribe learns your handwriting from ONE practice sheet (README §Teaching it your handwriting: "practice sheet → your
//             handwriting (once)") + the Writing → Messiness setting (README §The panels: Page style → Writing → messiness) — "I make it
//             a little messy so it looks like you rushed it"; then the pen draws the Punnett square (Bb × Bb, 3 : 1).
// Same guardrails: flirty for an 18+ college audience, swimwear only, no kink lines, no promises.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { makePen, makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, layoutHand } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, DESK = 0.76, BEDY = 0.605;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    me: W('hook', 'me'), tabs: B.tabs.t0, two: W('tabs', 'two'), drink: B.drink.t0, zero: W('drink', 'zero'), heart: W('drink', 'heart'),
    hl: B.highlight.t0, its: W('highlight', 'its'), minus: W('highlight', 'minus'), bed: B.bed.t0, hmm: W('bed', 'hmm'), six: W('bed', 'six'), mommy: W('bed', 'mommy'),
    turn: B.turn.t0, worksheet: W('turn', 'worksheet'), ten1: W('turn', 'ten'), watch: W('turn', 'watch'),
    scribe: B.scribe.t0, then: W('scribe', 'then'), messy: W('scribe', 'messy'), rushed: W('scribe', 'rushed'), punnett: W('scribe', 'punnett'),
    secret: B.secret.t0, your: W('secret', 'your'), end: B.end.t0, ten3: W('end', 'ten'), come: W('end', 'come'), baby: W('end', 'baby'),
  };
  T.card = T.baby + 0.55;

  // ---------------------------------------------------------------- her goth bedroom at dusk (a dollhouse open toward +z)
  scene.background = new THREE.Color(0x1a0f22);
  const R = new THREE.Group(); scene.add(R);
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z, shadow = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };
  const plane = (parent, w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const wallT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#4a2a5a', ['#432550', '#52305f', '#3c2149'], 30, 3); g.fillStyle = '#5a3670'; for (const [x, y] of [[3, 3], [11, 3], [7, 8], [3, 12], [11, 12]]) { g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); } }, { k: 1, repeat: [6, 4] });
  const floorT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#3a2a24', ['#33251f', '#42302a', '#2c201b'], 40, 5); g.fillStyle = '#251a16'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1); }, { k: 1, repeat: [5, 5] });
  const wallM = lam({ map: wallT });
  plane(R, 4.6, 4.6, lam({ map: floorT }), 0, 0, -0.7, 0, -PI / 2);
  plane(R, 4.6, 2.8, wallM, 0, 1.4, -3.0);
  plane(R, 4.6, 2.8, wallM, -2.3, 1.4, -0.7, PI / 2);
  plane(R, 4.6, 2.8, wallM, 2.3, 1.4, -0.7, -PI / 2);
  plane(R, 4.6, 4.6, lam({ color: 0x24152e }), 0, 2.8, -0.7, 0, PI / 2);
  bx(R, 4.6, 0.1, 0.03, toon(0x1a1020), 0, 0.05, -2.985); // skirting
  // the dusk window (back wall, right): violet → tangerine sky, a crescent moon, a far skyline
  const skyT = crisp(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a1f5a'); gr.addColorStop(0.55, '#a04a8a'); gr.addColorStop(1, '#ff9a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff2d8'; g.beginPath(); g.arc(70, 64, 22, 0, 7); g.fill(); g.fillStyle = '#2f2160'; g.beginPath(); g.arc(82, 58, 20, 0, 7); g.fill();
    g.fillStyle = '#1c1230'; for (let i = 0; i < 14; i++) { const bw = 12 + hash(i) * 22, bh = 30 + hash(i + 9) * 70; g.fillRect(i * 19, h - bh, bw, bh); } g.fillStyle = '#ffd27a'; for (let i = 0; i < 30; i++) g.fillRect(hash(i * 3) * w, h - 10 - hash(i * 5) * 80, 3, 3); });
  plane(R, 1.2, 1.2, new THREE.MeshBasicMaterial({ map: skyT, toneMapped: false }), 0.95, 1.6, -2.985);
  const black = toon(0x161018);
  bx(R, 1.32, 0.06, 0.08, black, 0.95, 2.23, -2.96); bx(R, 1.32, 0.06, 0.08, black, 0.95, 0.97, -2.96); bx(R, 0.06, 1.3, 0.08, black, 0.32, 1.6, -2.96); bx(R, 0.06, 1.3, 0.08, black, 1.58, 1.6, -2.96); bx(R, 0.04, 1.2, 0.05, black, 0.95, 1.6, -2.96); bx(R, 1.2, 0.04, 0.05, black, 0.95, 1.6, -2.96);
  for (const x of [0.12, 1.78]) bx(R, 0.28, 1.6, 0.06, toon(0x5a1424), x, 1.62, -2.93);   // velvet curtains
  // string lights along the back wall (catenary) + warm point lights
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xffc070, toneMapped: false });
  for (let i = 0; i <= 20; i++) { const u = i / 20, x = -2.2 + 4.4 * u, y = 2.5 - 0.22 * Math.sin(PI * ((u * 2) % 1)); const b = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), bulbM); b.position.set(x, y, -2.95); R.add(b); }
  for (const [x, y, z, c, I] of [[-1.3, 2.1, -2.2, 0xffb070, 1.8], [1.0, 2.1, -2.2, 0xffb070, 1.6], [0.0, 2.3, -0.5, 0xd8a0ff, 0.9]]) { const L = new THREE.PointLight(c, I, 5, 1.6); L.position.set(x, y, z); R.add(L); }
  // the bed (back-left): black frame + spiky headboard, purple duvet, pillows, a plush bat; your study pile on it
  bx(R, 1.6, 0.3, 2.0, black, -1.45, 0.15, -2.0); bx(R, 1.55, 0.22, 1.95, lam({ color: 0xece6f0 }), -1.45, 0.41, -2.0);
  bx(R, 1.6, 1.1, 0.08, black, -1.45, 0.55, -2.96);
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), black); s.position.set(-2.15 + i * 0.235, 1.17, -2.96); R.add(s); }
  const duvetT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#5a2a7a', ['#4e2470', '#66308a', '#45205f'], 30, 4); g.fillStyle = '#7a3a9a'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); }, { k: 1, repeat: [2, 2] });
  bx(R, 1.58, 0.1, 1.25, lam({ map: duvetT }), -1.45, 0.555, -1.62);
  bx(R, 0.6, 0.15, 0.36, lam({ color: 0xf4f0f6 }), -1.8, 0.6, -2.62); bx(R, 0.6, 0.15, 0.36, toon(0x2a1a30), -1.1, 0.6, -2.62);
  { const bat = new THREE.Group(); bat.position.set(-1.1, 0.74, -2.55); R.add(bat); const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), black); body.scale.set(1, 1.1, 0.9); bat.add(body);
    for (const s of [-1, 1]) { const wg = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 3), black); wg.rotation.z = s * 1.9; wg.position.set(s * 0.13, 0.02, 0); bat.add(wg); const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff4f9a, toneMapped: false })); e.position.set(s * 0.03, 0.02, 0.07); bat.add(e); } }
  // nightstand + lava lamp
  bx(R, 0.45, 0.5, 0.4, black, -0.38, 0.25, -2.6);
  { const ll = new THREE.Group(); ll.position.set(-0.38, 0.5, -2.6); R.add(ll); bx(ll, 0.1, 0.06, 0.1, toon(0xc0c0c8), 0, 0.03, 0); const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.18, 4, 10), new THREE.MeshBasicMaterial({ color: 0xff5ab0, toneMapped: false })); glass.position.y = 0.2; ll.add(glass);
    const L = new THREE.PointLight(0xff5ab0, 0.9, 3, 1.6); L.position.set(0, 0.35, 0.75); ll.add(L); }
  // posters: a pixel bat over the bed, a band poster on the left wall, a moon-phase banner over the window
  const posterBat = crisp(128, 160, (g, w, h) => { g.fillStyle = '#1a1020'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff4f9a'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#e8d8ff'; g.beginPath(); g.arc(64, 70, 34, 0, 7); g.fill(); g.fillStyle = '#1a1020'; g.beginPath(); g.moveTo(24, 70); g.quadraticCurveTo(44, 50, 64, 66); g.quadraticCurveTo(84, 50, 104, 70); g.quadraticCurveTo(84, 84, 64, 80); g.quadraticCurveTo(44, 84, 24, 70); g.fill(); g.fillStyle = '#ff4f9a'; g.font = '700 20px Inter, Arial'; g.textAlign = 'center'; g.fillText('NOCTURNE', 64, 140); });
  plane(R, 0.62, 0.78, new THREE.MeshLambertMaterial({ map: posterBat }), -1.45, 1.85, -2.985);
  const posterBand = crisp(128, 180, (g, w, h) => { g.fillStyle = '#0e0a12'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f0f4'; g.font = '900 40px Inter, Arial'; g.textAlign = 'center'; g.fillText('VOID', 64, 52); g.fillStyle = '#9a1c25'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(64, 110, 50 - i * 10, 0, 7); g.lineWidth = 3; g.strokeStyle = i % 2 ? '#9a1c25' : '#f2f0f4'; g.stroke(); } g.font = '600 14px Inter, Arial'; g.fillStyle = '#c8c0d0'; g.fillText('WORLD TOUR', 64, 170); });
  plane(R, 0.6, 0.84, new THREE.MeshLambertMaterial({ map: posterBand }), -2.285, 1.6, -0.6, PI / 2);
  const banner = crisp(256, 48, (g, w, h) => { g.fillStyle = '#1a1020'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8d8ff'; for (let i = 0; i < 7; i++) { const x = 22 + i * 35, k = i / 6; g.beginPath(); g.arc(x, 24, 13, 0, 7); g.fill(); g.fillStyle = '#1a1020'; g.beginPath(); g.arc(x + 26 * (k - 0.5), 24, 13, 0, 7); g.fill(); g.fillStyle = '#e8d8ff'; } });
  plane(R, 1.4, 0.26, new THREE.MeshLambertMaterial({ map: banner }), 0.95, 2.48, -2.98);
  // rug
  const rugT = pixelTex(32, 32, (g, w, h) => { g.fillStyle = '#1e1226'; g.beginPath(); g.arc(16, 16, 15.5, 0, 7); g.fill(); g.strokeStyle = '#7a3a9a'; g.lineWidth = 1; g.beginPath(); g.arc(16, 16, 13, 0, 7); g.stroke(); g.fillStyle = '#c8a0e8'; for (let i = 0; i < 5; i++) { const a = -PI / 2 + i * 2 * PI / 5; g.fillRect(16 + Math.cos(a) * 8, 16 + Math.sin(a) * 8, 2, 2); } }, { k: 2 });
  { const rug = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), new THREE.MeshLambertMaterial({ map: rugT, transparent: true })); rug.rotation.x = -PI / 2; rug.position.set(0.25, 0.006, -0.8); rug.receiveShadow = true; R.add(rug); }
  // the desk (right wall): laptop (47 tabs), energy drinks, a purple lamp, a candle, a cactus; a black chair
  bx(R, 0.65, 0.05, 1.5, black, 1.97, DESK - 0.025, -1.65); for (const [x, z] of [[1.7, -2.35], [2.25, -2.35], [1.7, -0.95], [2.25, -0.95]]) bx(R, 0.05, DESK - 0.05, 0.05, black, x, (DESK - 0.05) / 2, z);
  bx(R, 0.45, 0.05, 0.45, black, 1.3, 0.47, -1.55); bx(R, 0.45, 0.6, 0.05, black, 1.3, 0.8, -1.8);
  { const lp = new THREE.Group(); lp.position.set(2.05, DESK, -2.25); R.add(lp); bx(lp, 0.14, 0.03, 0.14, black, 0, 0.015, 0); bx(lp, 0.02, 0.4, 0.02, black, 0, 0.21, 0); bx(lp, 0.18, 0.09, 0.13, toon(0x6a2a7a), -0.05, 0.42, 0);
    const L = new THREE.PointLight(0xffb0e0, 1.2, 3.5, 1.6); L.position.set(-0.55, 0.4, 0.2); lp.add(L); }
  { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), toon(0x1a1020)); c.position.set(2.15, DESK + 0.045, -1.05); R.add(c); const f = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffc070, toneMapped: false })); f.scale.y = 1.8; f.position.set(2.15, DESK + 0.11, -1.05); R.add(f); }
  { const cac = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 3, 8), toon(0x3a8a4a)); cac.position.set(2.15, DESK + 0.09, -0.98); R.add(cac); bx(R, 0.08, 0.06, 0.08, toon(0x2a1a30), 2.15, DESK + 0.03, -0.98); }
  const canT = pixelTex(16, 16, (g, w, h) => { g.fillStyle = '#121014'; g.fillRect(0, 0, w, h); g.fillStyle = '#7cf05f'; g.fillRect(0, 5, w, 6); g.fillStyle = '#121014'; for (const [x, y] of [[2, 6], [3, 8], [4, 9], [6, 6], [7, 8], [9, 6], [10, 9], [12, 6], [13, 7]]) g.fillRect(x, y, 1, 1); }, { k: 1 });
  const cans = [0, 1, 2].map((i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 12), [new THREE.MeshToonMaterial({ map: canT }), toon(0xc8ccd6), toon(0xc8ccd6)]); c.position.set(2.0 + (i % 2) * 0.03, DESK + 0.06, -2.02 + i * 0.1); c.castShadow = true; R.add(c); return c; });
  const tabsT = crisp(1280, 800, (g, w, h) => {
    g.fillStyle = '#1e1b22'; g.fillRect(0, 0, w, h); g.fillStyle = '#2c2832'; g.fillRect(0, 0, w, 64);
    const cols = ['#ff4f6a', '#ffae3c', '#ffd43b', '#7cf05f', '#3aa0e8', '#b48ad8', '#ff5ab0'];
    for (let i = 0; i < 47; i++) { const x = 8 + i * 26.4; g.fillStyle = i === 46 ? '#3a3542' : '#262229'; g.fillRect(x, 10, 25, 50); g.fillStyle = cols[i % cols.length]; g.fillRect(x + 7, 25, 11, 11); }
    g.fillStyle = '#3a3542'; g.fillRect(90, 78, w - 180, 44); g.fillStyle = '#a8a0b0'; g.font = '500 24px Inter, Arial'; g.fillText('vidtube.example/watch?v=10-hours-of-cat-loaf', 112, 108);
    g.fillStyle = '#0c0a0e'; g.fillRect(60, 150, 800, 450); g.fillStyle = '#f0a050'; g.fillRect(330, 300, 260, 170); g.fillRect(350, 260, 50, 50); g.fillRect(520, 260, 50, 50); g.fillStyle = '#1a1020'; g.fillRect(380, 350, 20, 20); g.fillRect(520, 350, 20, 20);
    g.fillStyle = '#f2f0f4'; g.font = '700 34px Inter, Arial'; g.fillText('10 HOURS OF CAT LOAF', 60, 650);
    for (let i = 0; i < 5; i++) { g.fillStyle = '#2c2832'; g.fillRect(900, 150 + i * 110, 320, 95); g.fillStyle = cols[(i + 2) % 7]; g.fillRect(912, 162 + i * 110, 120, 70); }
    g.fillStyle = '#ff4f6a'; g.beginPath(); g.arc(w - 40, 34, 24, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 24px Inter, Arial'; g.textAlign = 'center'; g.fillText('47', w - 40, 43); g.textAlign = 'left'; });

  // ---------------------------------------------------------------- Scribe: the practice sheet, the messiness setting, the bio sheet
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'biology', { name: 'Alex' });
  const drawHand = (g, list, ox = 0, oy = 0, s = 1, jit = 0, seed = 1) => { list.forEach((it, i) => { g.save(); g.translate(ox + (it.x + it.w / 2) * s + (hash(i * 3 + seed) - 0.5) * 10 * jit, oy + (it.y + it.h / 2) * s + (hash(i * 7 + seed) - 0.5) * 34 * jit); g.rotate((it.rot || 0) + (hash(i * 13 + seed) - 0.5) * 1.0 * jit); g.drawImage(it.c, -it.w * s / 2, -it.h * s / 2, it.w * s, it.h * s); g.restore(); }); };
  const practiceT = crisp(1024, 1325, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d1d1d'; g.font = '600 40px Inter, Arial'; g.fillText('Scribe · Practice sheet', 60, 90); g.font = '500 24px Inter, Arial'; g.fillStyle = '#777'; g.fillText('Write each character in its box  ·  page 1 of 2', 60, 130);
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789+=()×→°'.split('');
    chars.forEach((ch, i) => { const c = i % 9, r = Math.floor(i / 9), x = 60 + c * 100, y = 180 + r * 136; g.strokeStyle = '#b8c0d0'; g.lineWidth = 2; g.strokeRect(x, y, 92, 120); g.setLineDash([5, 5]); g.beginPath(); g.moveTo(x + 4, y + 86); g.lineTo(x + 88, y + 86); g.stroke(); g.setLineDash([]); g.fillStyle = '#9aa2b0'; g.font = '500 18px Inter, Arial'; g.fillText(ch, x + 6, y + 20);
      drawHand(g, layoutHand(G, ch, { x: 0, y: 0, u: 44, seed: 3 + i }), x + 30, y + 30, 1); }); });
  const MESS0 = 0.12, MESS1 = 0.62, preview = layoutHand(G, 'Bb x Bb -> 3 : 1', { x: 0, y: 0, u: 50, seed: 21 }), sig = layoutHand(G, 'Alex', { x: 0, y: 0, u: 40, seed: 8 });   // laid out ONCE: a layoutHand per frame made thousands of canvases and crashed Chrome at frame 271
  const messT = crisp(1280, 800, () => {});
  let messK = -1;
  function drawMess(k) {
    k = Math.round(k * 100) / 100; if (k === messK) return; messK = k;   // redraw (and re-upload) only when the slider moves
    const g = messT.canvas.getContext('2d'), w = 1280, h = 800, RED = '#9a1c25';
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 78, w, 2);
    g.drawImage(icon, 30, 15, 48, 48); g.fillStyle = '#1d1d1d'; g.font = '34px Georgia, serif'; g.fillText('Scribe', 88, 52);
    const X0 = 345, X1 = 935, WD = X1 - X0;   // the vertical frame sees the middle ~640 px of this 1280 px screen
    g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.roundRect(X0 - 25, 110, WD + 50, 650, 24); g.fill(); g.stroke();
    g.fillStyle = '#1d1d1d'; g.font = '600 38px Inter, Arial'; g.fillText('Page style', X0, 170); g.fillStyle = '#888'; g.font = '600 24px Inter, Arial'; g.fillText('WRITING', X0, 228);
    g.fillStyle = '#1d1d1d'; g.font = '600 36px Inter, Arial'; g.fillText('Messiness', X0, 290); g.fillStyle = RED; g.textAlign = 'right'; g.fillText(`${Math.round(k * 100)}%`, X1, 290); g.textAlign = 'left';
    g.fillStyle = '#e4dfd4'; g.beginPath(); g.roundRect(X0, 322, WD, 16, 8); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(X0, 322, WD * k, 16, 8); g.fill();
    g.fillStyle = '#fff'; g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.arc(X0 + WD * k, 330, 26, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#999'; g.font = '500 24px Inter, Arial'; g.fillText('neat', X0, 385); g.textAlign = 'right'; g.fillText('rushed', X1, 385); g.textAlign = 'left';
    g.fillStyle = '#fffdf6'; g.fillRect(X0, 415, WD, 320); g.strokeStyle = 'rgba(120,150,200,.35)'; g.lineWidth = 1.5; for (let y = 520; y < 735; y += 58) { g.beginPath(); g.moveTo(X0 + 10, y); g.lineTo(X1 - 10, y); g.stroke(); }
    g.fillStyle = '#888'; g.font = '500 22px Inter, Arial'; g.fillText('Preview · your handwriting', X0 + 14, 450);
    drawHand(g, preview, X0 + 20, 540, 0.82, k, 5); drawHand(g, sig, X0 + 360, 640, 1, k, 9);
    messT.needsUpdate = true;
  }
  drawMess(MESS0);

  // the bed: your study pile (the highlighted textbook, the bio worksheet, the practice sheet, a closed laptop)
  const hlT = crisp(512, 340, (g, w, h) => { g.fillStyle = '#f8f3e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d0c0'; g.fillRect(w / 2 - 2, 0, 4, h);
    for (const ox of [20, w / 2 + 20]) { g.fillStyle = '#2a2a2a'; g.font = '700 20px Georgia, serif'; g.fillText(ox < 100 ? 'Ch. 11  Mendelian Genetics' : 'Dominant & recessive alleles', ox, 34); for (let y = 58; y < h - 14; y += 18) { g.fillStyle = '#ffe94a'; g.fillRect(ox - 4, y - 11, w / 2 - 34, 16); g.fillStyle = '#6a6a6a'; g.fillRect(ox, y - 6, (w / 2 - 50) * (0.7 + 0.3 * hash(y + ox)), 5); } } });
  const book = new THREE.Group(); book.position.set(-1.62, BEDY + 0.01, -1.55); book.rotation.y = 0.25; R.add(book);
  bx(book, 0.5, 0.03, 0.34, toon(0x2e7d5a), 0, 0.015, 0); plane(book, 0.48, 0.32, lam({ map: hlT }), 0, 0.032, 0, 0, -PI / 2);
  const sheetM = plane(R, 0.33, 0.427, lam({ map: sheet.tex }), -0.98, BEDY + 0.012, -1.42, 0, -PI / 2); sheetM.rotation.z = -0.12;
  const pracM = plane(R, 0.33, 0.427, lam({ map: practiceT }), -1.25, BEDY + 0.008, -1.25, 0, -PI / 2); pracM.rotation.z = 0.2;
  bx(R, 0.36, 0.022, 0.25, toon(0xc9cdd3), -1.9, BEDY + 0.011, -1.25);   // a closed laptop on the duvet
  const laptop = makeLaptop(tabsT, icon); laptop.g.position.set(1.95, DESK, -1.45); laptop.g.rotation.y = -1.05; laptop.g.scale.setScalar(0.85); R.add(laptop.g); laptop.hinge.rotation.x = -0.22;
  const pen = makePen(); R.add(pen.g);
  // her hand + phone snapping the practice sheet (black nails, a spiked cuff)
  const snap = new THREE.Group(); R.add(snap);
  { const skin = toon(0xffe6da, 0x5a4640), blk = toon(0x141218), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 18), blk); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), silver); s.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.012, 0.07); snap.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.045, 3, 8), skin); f.rotation.z = PI / 2; f.position.set(-0.06, -0.004, 0.035 + i * 0.02); snap.add(f); const n = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), blk); n.position.set(-0.09, -0.002, 0.035 + i * 0.02); snap.add(n); }
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), toon(0xb48ad8)); phone.position.set(0, 0.006, 0); snap.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: practiceT, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }

  // ---------------------------------------------------------------- light: a purple room bounce, a soft warm key from the lens side
  const hemi = new THREE.HemisphereLight(0x9a7ac0, 0x2a1a2a, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd8c0, 1.1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 }); scene.add(key, key.target);

  // ---------------------------------------------------------------- Vex (064's thicker, cuter build)
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: '/videos/054-goth-tutor/vex-body2.png' }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.07, eyes: 1.12 });
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xffd8e8, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064: the previous pose is re-evaluated from time, then the arms blend over 0.28 s
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.14) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);

  // ---------------------------------------------------------------- FX: pixel hearts
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [0.15, T.mommy, T.baby].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay + the pixel RATING CARDS
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['MOMMY RATES YOUR', 'STUDY HABITS'], t0: 0, t1: B.tabs.t0 - 0.1, y: 0.135, plain: true, s: 9, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui'), CY = 0.095;   // above her head in every medium shot (0.165 sat on her hair/face)
  const pop = (a) => (a < 0.05 ? 0.7 : a < 0.1 ? 1.12 : 1);
  const CARDS = [['47 TABS OPEN', '2/10', '#ff4f6a', T.two - 0.05, T.drink], ['3RD ENERGY DRINK', '0/10', '#ff4f6a', T.zero - 0.05, T.hl], ['HIGHLIGHTING EVERYTHING', '-1/10', '#ff4f6a', T.minus - 0.05, T.bed],
    ['STUDYING IN BED', '6/10', '#ffae3c', T.six - 0.05, T.turn], ['BIO WORKSHEET', '10/10', '#7cf05f', T.ten1 - 0.05, T.scribe], ['FINAL SCORE', '10/10', '#7cf05f', T.ten3 - 0.05, T.card]].map(([label, score, col, t0, t1]) => {
    const box = document.createElement('div'); box.className = 'pxbox'; box.style.width = '700px'; box.style.height = '230px'; box.style.top = `${CY * 1920}px`; ui.appendChild(box);
    const mkImg = (cv, s, y) => { const el = document.createElement('img'); el.className = 'px'; el.src = cv.toDataURL(); el.style.width = `${cv.width * s}px`; el.style.height = `${cv.height * s}px`; el.style.left = '540px'; el.style.top = `${y * 1920}px`; ui.appendChild(el); return el; };
    const lc = pixelText(label, { color: '#fff4c2' }), sc = pixelText(score, { color: col });
    return { box, l: mkImg(lc, Math.min(6, Math.floor(640 / lc.width)), CY - 0.035), s: mkImg(sc, Math.min(14, Math.floor(640 / sc.width)), CY + 0.022), t0, t1 };
  });
  function cards(t) { for (const c of CARDS) { const on = t >= c.t0 && t < c.t1, a = t - c.t0, op = on ? clamp((c.t1 - t) / 0.12) : 0; for (const el of [c.box, c.l, c.s]) { el.style.opacity = op; if (on) el.style.transform = `translate(-50%, -50%) scale(${pop(el === c.s ? a - 0.12 : a)})`; } c.s.style.opacity = on && a > 0.12 ? op : 0; } }

  // ---------------------------------------------------------------- the Punnett square (problem 1, pi 0) on the bio sheet
  const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, P0 = -1, P1 = 0; const grid = [], ratio = [];
  for (const it of sheet.items) { if (it.pi === 0) { if (P0 < 0) P0 = acc; P1 = acc + wt(it); const q = it.kind === 'p' ? it.pts[0] : [it.x, it.y]; (q[0] < 520 ? grid : ratio).push(q); } acc += wt(it); }
  if (P0 < 0 || !grid.length) throw new Error('no Punnett square on the biology sheet');
  const avg = (L) => [L.reduce((s2, q) => s2 + q[0], 0) / L.length, L.reduce((s2, q) => s2 + q[1], 0) / L.length];
  const gridC = avg(grid), bothC = ratio.length ? avg([...grid, ...ratio]) : gridC;
  const writeP = (t) => (P1 - P0) * ease(u01(t, T.punnett - 0.4, T.your - 0.2)) + P0;

  // ---------------------------------------------------------------- shots (room coords: the camera looks −z into the room; her rotY 0 faces it)
  const VC = { x: 0.25, z: -0.95 };
  const SH = [
    { id: 'hook', t0: 0, vex: (t) => ({ ...VC, pose: t < T.me - 0.3 ? 'hip' : 'point', tilt: 0.12, sway: 0.2, face: { relaxed: 0.25, blink: lids(t), blinkLeft: t > 0.4 && t < 0.95 ? 1 : 0 } }), cam: (t) => ({ pos: [0.3, 1.32, 1.3 - 0.35 * u01(t, 0, T.tabs)], look: [0.25, 1.3, -0.95], fov: 50 }) },
    { id: 'tabs', t0: T.tabs, screen: 0.9, dx: 0.09, tex: 'tabs' },
    { id: 'two', t0: T.two - 0.25, vex: (t) => ({ ...VC, pose: 'shrug', tilt: 0.16, sway: 0.2, face: { relaxed: 0.2, sad: 0.15, blink: lids(t) } }), p: [[0.35, 1.2, 0.7], [0.3, 1.2, 0.55]], a: [[0.25, 1.15, -0.95], [0.25, 1.15, -0.95]], fov: 48 },
    { id: 'cans', t0: T.drink, p: [[1.55, DESK + 0.22, -1.62], [1.6, DESK + 0.2, -1.68]], a: [[2.02, DESK + 0.08, -1.95], [2.02, DESK + 0.08, -1.95]], fov: 42 },
    { id: 'zero', t0: T.zero - 0.25, vex: (t) => ({ ...VC, pose: t < T.heart - 0.2 ? 'cross' : 'kiss', tilt: -0.1, sway: 0.15, face: { sad: 0.35, blink: lids(t, 0.1) } }), cam: (t) => ({ pos: [0.25, 1.6, 0.05 - 0.15 * u01(t, T.zero, T.hl)], look: [0.25, 1.48, -0.95], fov: 44 }) },
    { id: 'book', t0: T.hl, p: [[-1.45, BEDY + 0.5, -1.05], [-1.5, BEDY + 0.42, -1.12]], a: [[-1.62, BEDY + 0.03, -1.55], [-1.62, BEDY + 0.03, -1.55]], fov: 42 },
    { id: 'minus', t0: T.its - 0.05, vex: (t) => ({ ...VC, pose: t > T.minus - 0.3 ? 'point' : 'shrug', tilt: 0.14, sway: 0.2, face: { happy: t < T.minus - 0.3 ? 0.55 : 0.2, blink: lids(t) } }), p: [[-0.1, 1.25, 0.65], [0.0, 1.25, 0.5]], a: [[0.2, 1.18, -0.95], [0.2, 1.18, -0.95]], fov: 48 },
    { id: 'bedpile', t0: T.bed, p: [[-0.35, 1.25, -0.1], [-0.45, 1.15, -0.25]], a: [[-1.4, BEDY, -1.5], [-1.4, BEDY, -1.5]], fov: 46 },
    { id: 'six', t0: T.hmm - 0.1, vex: (t) => ({ ...VC, pose: t < T.six - 0.2 ? 'shh' : t < T.mommy - 0.2 ? 'peace' : 'hairflip', tilt: t < T.six ? 0.2 : -0.12, sway: 0.2, look: t < T.six - 0.2 ? [0.4, 0.3] : [0, 0], face: { relaxed: 0.3, happy: t > T.mommy ? 0.4 : 0, blink: lids(t), blinkLeft: t > T.mommy + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy - 0.1, 1.0); return { pos: [0.3, 1.4, 0.7 - 0.6 * k], look: [0.25, 1.3 + 0.08 * k, -0.95], fov: 46 }; } },
    { id: 'turn', t0: T.turn, vex: (t) => ({ ...VC, pose: 'point', lean: 0.2, tilt: -0.1, sway: 0.2, face: { relaxed: 0.25, happy: 0.3, blink: lids(t) } }), p: [[0.6, 1.3, 0.6], [0.5, 1.3, 0.45]], a: [[0.0, 1.2, -1.0], [0.0, 1.2, -1.05]], fov: 50 },
    { id: 'sheet', t0: T.ten1 - 0.3, p: [[-0.92, BEDY + 0.52, -1.0], [-0.95, BEDY + 0.44, -1.08]], a: [[-0.98, BEDY, -1.42], [-0.98, BEDY, -1.42]], fov: 44 },
    { id: 'practice', t0: T.scribe, p: [[-1.2, BEDY + 0.6, -0.95], [-1.22, BEDY + 0.5, -1.0]], a: [[-1.25, BEDY, -1.25], [-1.25, BEDY, -1.25]], fov: 44, snap: 1 },
    { id: 'mess', t0: T.then - 0.05, screen: 0.8, dx: 0.0, tex: 'mess' },
    { id: 'macro', t0: T.rushed + 0.15, macro: 1, write: 1 },
    { id: 'secret', t0: T.your - 0.1, vex: (t) => ({ ...VC, pose: 'shh', lean: 0.25, tilt: -0.12, sway: 0.2, face: { relaxed: 0.35, blink: lids(t), blinkLeft: t > T.your + 0.4 ? 1 : 0 } }), cam: (t) => ({ pos: [0.27, 1.48, 0.05 - 0.2 * u01(t, T.your, T.end)], look: [0.25, 1.4, -0.95], fov: 44 }) },
    { id: 'end', t0: T.end, vex: (t) => ({ ...VC, pose: t > T.baby - 0.15 ? 'kissOut' : t > T.come - 0.25 ? 'beckon' : 'hip', tilt: -0.12, sway: 0.2, face: { relaxed: 0.45, happy: t < T.come ? 0.3 : 0, blink: lids(t), blinkLeft: t > T.baby + 0.2 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.come - 0.1, 1.0); return { pos: [0.3, 1.36 + 0.06 * k, 0.75 - 0.75 * k], look: [0.25, 1.22 + 0.16 * k, -0.95], fov: 48 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipW = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.33, (0.5 - tip[1] / sheet.h) * 0.427, 0); sheetM.updateWorldMatrix(true, false); return sheetM.localToWorld(v); };
  const CAN2 = cans[2].position.clone();

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    let cam;
    laptop.scr.material.map = sh.tex === 'mess' || (t >= T.then - 0.05 && t < T.rushed + 0.15) ? messT : tabsT;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { sheet.draw(writeP(t)); const kk = ease(u01(t, T.punnett + 0.9, T.your - 0.3)), c = tipW(lerp3(gridC, bothC, kk)); cam = { pos: [c.x + 0.02, c.y + 0.24 + 0.1 * kk, c.z + 0.08], look: [c.x, c.y, c.z], fov: 40 }; }
    else if (sh.cam) cam = sh.cam(t);
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look);
      key.target.position.copy(tg); key.position.copy(tg).addScaledVector(f, -4).addScaledVector(side, -2.5).add(V(0, 3.5, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(tg)); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.8, 0.26 * Math.pow(d, 1.6)) : 0.12; }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: { ...(v.face || {}) }, x: v.x, z: v.z, y: 0, rotY: v.rotY ?? 0 }); }
    fx(t, !!sh.vex);
    drawMess(MESS0 + (MESS1 - MESS0) * ease(u01(t, T.messy - 0.25, T.messy + 0.55)));
    const tip = sheet.draw(writeP(t));
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(0.02); pen.glow.material.opacity = 0.5;
    if (sh.write) { const p = tipW(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    snap.visible = sh.snap === 1;
    if (sh.snap) { const sw = [-1.25, BEDY, -1.25], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = sh.t0 + 0.5; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    // the third can drops onto the desk on "third" (a bounce), the first two already there
    { const a = t - (T.drink + 0.05), y = a < 0 ? 0.6 : a < 0.28 ? 0.6 * (1 - (a / 0.28) ** 2) : a < 0.42 ? 0.05 * Math.sin(PI * (a - 0.28) / 0.14) : 0; cans[2].position.set(CAN2.x, CAN2.y + y, CAN2.z); cans[2].rotation.z = a > 0 && a < 0.42 ? 0.3 * (1 - a / 0.42) : 0; }
    pixel.set(Math.max(sh.screen ? 1 : sh.write ? 2 : PIXEL, mosaicAt(t, CUTS)));
    ov.update(t); cards(t);
  }
  update(0);
  return { update };
}
