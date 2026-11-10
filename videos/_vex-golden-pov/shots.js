// 065 — "POV: you brought your bio homework to the beach and goth mommy found you" (Scribe lane, anime/pixel look; the 064 recipe the
// user loved: comfort/tease "mommy", Vex's thick/cute look, her Fish voice, Scribe at ~55 % with a crisp screen, end card ≥ 3.5 s).
// New situation + time of day (manager, Nov 9): GOLDEN HOUR on the voxel beach (setMood 0.8, a low sun behind her, warm key from the
// lens side). Two stations, both turned 180° so the sea is behind her: your beach towel (umbrella, laptop, clipboard sheet, a textbook,
// a sandy sneaker) and the shoreline (the sunset, "come swim with mommy"). Scribe: the biology pack — the pen draws the Punnett square
// Bb × Bb with 1 BB : 2 Bb : 1 bb / 3 black : 1 white beside it ("three to one says your professor never notices").
// Flirty for an 18+ college audience, swimwear only, no kink lines, no promises. Claims per docs/lanes/scribe.md.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { makePen, makeLaptop } from '@engine/build/library.js';
import { loadHand, loadImg, makeScreen } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

const PI = Math.PI, PIXEL = 4, GOLD = 0.8;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const bump = (t, t0, d = 1.2) => (t < t0 ? 0 : t > t0 + d ? 1 : ease((t - t0) / d));

// the chest shading pass: soft rose shapes on an offscreen layer (blurred), multiplied onto the body atlas once. Atlas coords (2048²):
// the cups are triangles, apexes (874, 395) / (1174, 395), bases y ≈ 615–625 from x 709–994 and 1052–1342; the gap centre x = 1023.
async function shadeBody(url) {
  const img = await loadImg(url), W = img.width, S = W / 2048;
  const c = document.createElement('canvas'); c.width = W; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const L = document.createElement('canvas'); L.width = W; L.height = img.height; const l = L.getContext('2d');
  l.fillStyle = '#fff'; l.fillRect(0, 0, W, img.height); l.scale(S, S); l.lineCap = 'round';
  const stroke = (pts, w, blur, col, a) => { l.save(); l.filter = `blur(${blur * S}px)`; l.globalAlpha = a; l.strokeStyle = col; l.lineWidth = w; l.beginPath(); pts.forEach(([x, y], i) => (i ? l.lineTo(x, y) : l.moveTo(x, y))); l.stroke(); l.restore(); };
  const arc = (cx, cy, rx, ry, a0, a1, w, blur, col, a) => { const P = []; for (let i = 0; i <= 24; i++) { const t = a0 + (a1 - a0) * i / 24; P.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } stroke(P, w, blur, col, a); };
  stroke([[1023, 495], [1021, 560], [1023, 622]], 12, 9, '#b06878', 0.5);          // the cleavage shadow, fuller toward the band
  stroke([[1023, 548], [1022, 590], [1023, 618]], 2.6, 1.2, '#8e4858', 0.7);       // its crisp core line
  stroke([[892, 440], [1006, 620]], 16, 10, '#b87884', 0.38); stroke([[1156, 440], [1040, 620]], 16, 10, '#b87884', 0.38);   // inner-cup shade
  arc(852, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42); arc(1196, 606, 150, 34, 0.18 * PI, 0.82 * PI, 14, 9, '#b06878', 0.42);   // under-cup
  arc(852, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45); arc(1196, 612, 136, 28, 0.3 * PI, 0.7 * PI, 2.2, 1.0, '#8e4858', 0.45);
  g.globalCompositeOperation = 'multiply'; g.drawImage(L, 0, 0);
  return c.toDataURL('image/png');
}

// 067's look (Nov 9, the user loved it: "that look and the shading… is great"): eyes 1.24 + head 1.08 (makeVroid below), the chest
// shading pass, and its dominant face — a brow arch (angry 0.12) on every face but a sad or laughing one, and the half-lidded
// `relaxed` eased toward 067's 0.1 so the bigger eyes stay open (each shot keeps its own expression on top)
const vexLook = (f) => ({ ...f, relaxed: 0.1 + 0.5 * Math.max(0, (f.relaxed ?? 0.1) - 0.1), angry: f.angry ?? (f.sad ? 0 : 0.12 * Math.max(0, 1 - (f.happy || 0) / 0.4)) });

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const T = {
    mommy1: W('hook', 'mommy'), roast: B.roast.t0, golden: W('roast', 'golden'), sand: W('roast', 'sand'), lab: W('roast', 'lab'), andR: W('roast', 'and'),
    pity: B.pity.t0, come: B.come.t0, close: W('come', 'close'), tease: B.tease.t0, mommy2: W('tease', 'mommys'),
    scribe: B.scribe.t0, scribeW: W('scribe', 'scribe'), and2: W('scribe', 'and'), even: W('scribe', 'even'),
    secret: B.secret.t0, notices: W('secret', 'notices'), relax: B.relax.t0, out: W('relax', 'out'), swim: B.swim.t0, mommy3: W('swim', 'mommy'),
    end: B.end.t0, recessive: W('end', 'recessive'), baby: W('end', 'baby'),
  };
  T.card = T.baby + 0.55;

  // ---------------------------------------------------------------- the golden-hour beach + two stations (turned 180°: the sea behind her)
  const BEACH = buildVoxBeach(studio);
  BEACH.setMood(GOLD);
  const OFF = { towel: [6, 0, 8], shore: [0, 0, 16.3] };   // shore: between the huts at x ±4, the foam line (world z 18.2) = local z −1.9
  const station = (name) => { const g = new THREE.Group(); g.position.set(...OFF[name]); g.rotation.y = PI; BEACH.root.add(g); return g; };
  const ST = { towel: station('towel'), shore: station('shore') };
  const lam = (o) => new THREE.MeshLambertMaterial(o), toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const sandT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#ecd49c', ['#e0c588', '#f4dfae', '#d6b878'], 50, 7), { k: 1 });

  // your stuff on the towel: the bio worksheet on a clipboard, the laptop, an open textbook, sunscreen, a pail, a sandy sneaker
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'biology', { name: 'Alex', note: 'Lab report due 8:00 AM  ·  HANDWRITTEN WORK ONLY' });
  const screen = makeScreen(G, icon, sheet, { name: 'Alex', n: 30 });
  const S = ST.towel;
  const towelT = pixelTex(16, 32, (g, w, h) => { for (let y = 0; y < h; y++) { g.fillStyle = ['#3b6fd0', '#f4f0ea', '#e8508a', '#f4f0ea'][Math.floor(y / 4) % 4]; g.fillRect(0, y, w, 1); } g.fillStyle = '#f4f0ea'; for (let y = 0; y < h; y += 2) { g.fillRect(0, y, 1, 1); g.fillRect(w - 1, y + 1, 1, 1); } }, { k: 1 });
  const towel = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.9), lam({ map: towelT })); towel.rotation.x = -PI / 2; towel.position.set(0, 0.012, -0.1); towel.receiveShadow = true; S.add(towel);
  const board = bx(S, 0.36, 0.012, 0.47, lam({ color: 0x9a6a3a }), -0.12, 0.02, -0.42); board.rotation.y = 0.1;
  const sheetM = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.427), lam({ map: sheet.tex })); sheetM.rotation.set(-PI / 2, 0, 0.1); sheetM.position.set(-0.12, 0.028, -0.415); S.add(sheetM);
  const clip = bx(S, 0.12, 0.02, 0.035, new THREE.MeshStandardMaterial({ color: 0xc8ccd6, roughness: 0.3, metalness: 0.8 }), -0.14, 0.035, -0.64); clip.rotation.y = 0.1;
  const laptop = makeLaptop(screen.tex, icon); laptop.g.position.set(0.42, 0.014, -0.62); laptop.g.rotation.y = -0.45; S.add(laptop.g); laptop.hinge.rotation.x = -0.25;
  // the textbook: two covers on a spine hinge (the right half folds over on "close the textbook")
  const book = new THREE.Group(); book.position.set(-0.5, 0.016, -0.12); book.rotation.y = 0.35; S.add(book);
  const pageT = pixelTex(16, 20, (g, w, h) => { g.fillStyle = '#f6f1e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#b9b2a0'; for (let y = 2; y < h - 2; y += 2) g.fillRect(2, y, w - 4, 1); g.fillStyle = '#3aa06a'; g.fillRect(4, 9, 8, 5); }, { k: 1 });
  const coverC = document.createElement('canvas'); coverC.width = 128; coverC.height = 172;
  { const g = coverC.getContext('2d'); g.fillStyle = '#2e7d5a'; g.fillRect(0, 0, 128, 172); g.fillStyle = '#f4f0ea'; g.font = '700 22px Inter, Arial'; g.textAlign = 'center'; g.fillText('BIOLOGY', 64, 30);
    g.lineWidth = 5; for (const [c, ph] of [['#ffd43b', 0], ['#ff7aa8', Math.PI]]) { g.strokeStyle = c; g.beginPath(); for (let y = 48; y <= 160; y += 2) { const x = 64 + 30 * Math.sin(y * 0.075 + ph); y === 48 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; for (let y = 54; y <= 156; y += 10) { g.beginPath(); g.moveTo(64 + 30 * Math.sin(y * 0.075), y); g.lineTo(64 + 30 * Math.sin(y * 0.075 + Math.PI), y); g.stroke(); } }
  const coverTex = new THREE.CanvasTexture(coverC); coverTex.colorSpace = THREE.SRGBColorSpace; coverTex.center.set(0.5, 0.5); coverTex.rotation = PI;   // the flap's underside lands rotated 180° once it's shut
  const coverM = toon(0x2e7d5a), coverTop = new THREE.MeshToonMaterial({ map: coverTex }), pageM = lam({ map: pageT });
  bx(book, 0.2, 0.02, 0.27, [coverM, coverM, pageM, coverM, coverM, coverM], -0.1, 0.01, 0);
  const flap = new THREE.Group(); flap.position.y = 0.02; book.add(flap);   // hinge at the top of the spine: the flap lands ON the left half
  bx(flap, 0.2, 0.02, 0.27, [coverM, coverM, pageM, coverTop, coverM, coverM], 0.1, -0.01, 0);   // underside = the front cover (face up once it's shut)
  bx(S, 0.06, 0.16, 0.04, toon(0xff8a3a), 0.5, 0.08, -0.18);   // sunscreen
  { const pail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.15, 10), toon(0xe8402a)); pail.position.set(0.62, 0.075, 0.12); S.add(pail); }
  // your sneakers, full of sand: a pair with rounded toes, a blue stripe, laces, sand heaped in the openings and spilled beside them
  const shoe = new THREE.Group(); shoe.position.set(0.85, 0.012, 0.4); shoe.rotation.y = 0.55; S.add(shoe);
  { const white = toon(0xf6f4f0), sole = toon(0x2a2430), blue = toon(0x3b6fd0), sandM = lam({ map: sandT });
    for (const [ox, oz, ry] of [[-0.075, 0, 0.05], [0.075, 0.03, -0.12]]) {
      const one = new THREE.Group(); one.position.set(ox, 0, oz); one.rotation.y = ry; shoe.add(one);
      bx(one, 0.1, 0.025, 0.27, sole, 0, 0.0125, 0);
      bx(one, 0.095, 0.07, 0.15, white, 0, 0.06, 0.05);                          // heel + quarter
      const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.095, 12, 1, false, 0, PI), white); toe.rotation.set(0, 0, PI / 2); toe.rotation.order = 'ZYX'; toe.position.set(0, 0.025, -0.075); toe.scale.set(1, 1, 1.3); one.add(toe);
      bx(one, 0.097, 0.012, 0.13, blue, 0, 0.045, 0.04);                          // the side stripe
      for (let i = 0; i < 3; i++) bx(one, 0.07, 0.008, 0.01, blue, 0, 0.074 - i * 0.008, -0.01 - i * 0.025);   // laces
      const heap = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.05, 7), sandM); heap.position.set(0, 0.105, 0.07); one.add(heap);
    }
    for (const [x, z, sc] of [[0.15, 0.08, 1], [0.2, -0.03, 0.7], [-0.16, 0.12, 0.6], [0.05, 0.19, 0.8]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.05 * sc, 0.03 * sc, 7), sandM); m.position.set(x, 0.015 * sc, z); shoe.add(m); } }
  // the umbrella (red/white stripes) off to the left, behind the towel
  { const um = new THREE.Group(); um.position.set(-1.75, 0, -1.7); S.add(um); bx(um, 0.035, 2.0, 0.035, toon(0xf0f0f0), 0, 1.0, 0);
    const stripes = pixelTex(16, 4, (g, w) => { for (let x = 0; x < w; x++) { g.fillStyle = Math.floor(x / 2) % 2 ? '#f4f0ea' : '#d8343a'; g.fillRect(x, 0, 1, 4); } }, { k: 1 });
    const can = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.42, 8, 1, true), new THREE.MeshLambertMaterial({ map: stripes, side: THREE.DoubleSide })); can.position.y = 2.05; can.rotation.z = -0.12; can.castShadow = true; um.add(can); }
  const pen = makePen(); S.add(pen.g);
  // her hand + phone snapping the sheet (black nails, a spiked cuff)
  const snap = new THREE.Group(); S.add(snap);
  { const skin = toon(0xffe6da, 0x5a4640), black = toon(0x141218), silver = new THREE.MeshStandardMaterial({ color: 0xd6d8e0, roughness: 0.25, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.34, 4, 12), skin); arm.rotation.x = PI / 2; arm.position.set(0, 0, 0.3); snap.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 18), black); cuff.rotation.x = PI / 2; cuff.position.set(0, 0, 0.16); snap.add(cuff);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * PI, s = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), silver); s.position.set(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.16); s.rotation.z = a - PI / 2; snap.add(s); }
    // the hand GRIPS the phone (Nov 9 fix, as 065/067: the palm under it, four fingers curled over its left long edge, the thumb over
    // the right, black nails on top — v1's fingers lay beside the phone and the overhead lens saw a floating phone)
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); palm.scale.set(1.1, 0.5, 1.2); palm.position.set(0, -0.024, 0.045); snap.add(palm);
    const digit = (sx, z) => { const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.022, 3, 8), skin); up.position.set(sx * 0.052, -0.007, z); snap.add(up);
      const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.014, 3, 8), skin); tip.rotation.z = PI / 2; tip.position.set(sx * 0.041, 0.019, z); snap.add(tip);
      const nail = new THREE.Mesh(new THREE.SphereGeometry(0.0052, 8, 6), black); nail.scale.set(1, 0.4, 0.85); nail.position.set(sx * 0.034, 0.026, z); snap.add(nail); };
    for (let i = 0; i < 4; i++) digit(-1, 0.002 + i * 0.021);
    digit(1, 0.04);
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.17), toon(0xb48ad8)); phone.position.set(0, 0.006, 0); snap.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.15), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); scr.rotation.x = -PI / 2; scr.position.set(0, 0.0125, 0); snap.add(scr);
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); flash.rotation.x = PI / 2; flash.position.y = -0.02; snap.add(flash); snap.flash = flash; }
  // sand puffs (the book slam, her kick at the waterline)
  const puffT = pixelTex(8, 8, (g) => { g.fillStyle = 'rgba(240,220,170,0.9)'; g.beginPath(); g.arc(4, 4, 3.5, 0, 7); g.fill(); }, { k: 4 });
  const puffs = Array.from({ length: 10 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false })); s.visible = false; BEACH.root.add(s); return s; });
  const sprayT = pixelTex(8, 8, (g) => { g.fillStyle = 'rgba(220,245,255,0.95)'; g.beginPath(); g.arc(4, 4, 3.5, 0, 7); g.fill(); }, { k: 4 });
  const spray = Array.from({ length: 12 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprayT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; BEACH.root.add(s); return s; });

  // ---------------------------------------------------------------- Vex (064's thicker, cuter build)
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: await shadeBody('/videos/054-goth-tutor/vex-body2.png') }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });   // 067's look
  dressGoth(VEX); scene.add(VEX.root);
  const fill = new THREE.PointLight(0xffd8c0, 1.0, 0, 1.6); scene.add(fill);   // a warm fill AT the lens, intensity ∝ d^1.6 (064): faces read against the low sun
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  const armsOf = (pose) => { const A = ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064: the previous pose is re-evaluated from time, then the arms blend over 0.28 s
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv), b = armsOf(v.pose); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return v;
  }
  const lids = (t, base = 0.14) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);

  // ---------------------------------------------------------------- FX: pixel hearts on every "mommy" + the kiss
  const heartT = pixelTex(9, 8, (g) => { g.fillStyle = '#ff4d8d'; g.beginPath(); g.moveTo(4.5, 7.5); g.bezierCurveTo(-1, 3.5, 1, -0.5, 4.5, 2.2); g.bezierCurveTo(8, -0.5, 10, 3.5, 4.5, 7.5); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(2, 2, 1, 1); }, { k: 6 });
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, depthWrite: false, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  const BURSTS = [T.mommy1, T.mommy2, T.mommy3, T.baby].map((m) => m + 0.05);
  const headW = V();
  function fx(t, on) {
    hearts.forEach((h) => (h.visible = false)); if (!on) return;
    VEX.H.head.getWorldPosition(headW); let k = 0;
    BURSTS.forEach((b, bi) => { const a = t - b; if (a < 0 || a > 1.6) return; for (let i = 0; i < 6 && k < hearts.length; i++, k++) { const h = hearts[k], ang = i * 1.05 + bi, r = 0.14 + 0.18 * a; h.visible = true; h.position.set(headW.x + Math.cos(ang) * r, headW.y + 0.05 + a * 0.32 + (i % 2) * 0.06, headW.z + Math.sin(ang) * r * 0.5); h.scale.setScalar((a < 0.12 ? 0.06 : 0.075) * (1 - 0.3 * (i % 3) / 2)); h.material.opacity = 1 - clamp((a - 1.0) / 0.6); } });
  }

  // ---------------------------------------------------------------- overlay
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['POV: YOU BROUGHT BIO HOMEWORK', 'TO THE BEACH AND MOMMY FOUND YOU'], t0: 0, t1: B.roast.t0 - 0.1, y: 0.135, plain: true, s: 7, color: '#ffd43b' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });

  // ---------------------------------------------------------------- the Punnett square (problem 1, pi 0): where it sits + its writing range
  const wt = (it) => (it.kind === 'p' ? it.w : 1); let acc = 0, P0 = -1, P1 = 0; const grid = [], ratio = [];
  for (const it of sheet.items) { if (it.pi === 0) { if (P0 < 0) P0 = acc; P1 = acc + wt(it); const q = it.kind === 'p' ? it.pts[0] : [it.x, it.y]; (q[0] < 520 ? grid : ratio).push(q); } acc += wt(it); }
  if (P0 < 0 || !grid.length) throw new Error('no Punnett square on the biology sheet');
  const avg = (L) => [L.reduce((s2, q) => s2 + q[0], 0) / L.length, L.reduce((s2, q) => s2 + q[1], 0) / L.length];
  const gridC = avg(grid), bothC = ratio.length ? avg([...grid, ...ratio]) : gridC;
  const total = sheet.total;
  const writeP = (t) => P0 + (P1 - P0) * (0.45 * ease(u01(t, T.and2, T.even - 0.1)) + 0.55 * ease(u01(t, T.even, T.secret - 0.25))) + (total - P1) * 0.2 * u01(t, T.secret - 0.25, T.relax);

  // ---------------------------------------------------------------- shots (station-local: the camera at +z looks −z; her rotY 0 faces it)
  const VT = { x: 0.05, z: -1.4 };   // standing at the foot of your towel; you sit on it (the lens at ~0.85 m)
  const VS = { x: 0, z: -1.7 };      // at the shoreline, the foam just behind her
  const SH = [
    { id: 'hook', t0: 0, set: 'towel', vex: (t) => ({ ...VT, pose: t < T.mommy1 - 0.25 ? 'cross' : 'lean', lean: 0.6 * bump(t, T.mommy1 - 0.25, 0.8), tilt: t < T.mommy1 ? 0.14 : -0.12, sway: 0.18, face: { relaxed: 0.25, blink: lids(t), blinkLeft: t > T.mommy1 + 0.35 && t < T.mommy1 + 0.9 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy1 - 0.1); return { pos: [0.05, 0.85 + 0.12 * k, 0.45 - 0.55 * k], look: [0.05, 1.22 + 0.1 * k, -1.4], fov: 50 }; } },
    { id: 'golden', t0: T.roast, set: 'towel', vex: (t) => ({ ...VT, pose: t > T.sand - 0.25 ? 'point' : t > T.golden - 0.2 ? 'shrug' : 'hip', lean: t > T.sand - 0.25 ? 0.3 : 0, nod: t > T.sand - 0.25 ? 0.25 : 0, look: t > T.sand - 0.25 ? [0, -0.4] : [0, 0], tilt: 0.12, sway: 0.2, face: { relaxed: 0.2, happy: t > T.sand ? 0.3 : 0, blink: lids(t) } }), p: [[0.3, 1.0, 0.5], [0.15, 1.05, 0.3]], a: [[0.05, 1.18, -1.4], [0.05, 1.2, -1.4]], fov: 50, sun: [-0.18, 0.05] },
    { id: 'lab', t0: T.lab - 0.05, set: 'towel', p: [[-0.1, 0.52, -0.12], [-0.1, 0.44, -0.18]], a: [[-0.12, 0.03, -0.5], [-0.12, 0.03, -0.52]], fov: 44 },
    { id: 'one', t0: T.andR - 0.05, set: 'towel', vex: (t) => ({ ...VT, pose: 'point', lean: 0.35, tilt: 0.1, face: { relaxed: 0.2, blink: lids(t) } }), p: [[-0.35, 1.0, 0.55], [-0.3, 1.0, 0.4]], a: [[-0.1, 0.85, -1.2], [-0.08, 0.88, -1.2]], fov: 52 },
    { id: 'pity', t0: T.pity, set: 'towel', vex: (t) => ({ ...VT, pose: 'lean', lean: 0.3, tilt: 0.16, look: [0, 0.15], face: { sad: 0.3, blink: lids(t, 0.08) } }), cam: (t) => ({ pos: [0.05, 1.32, -0.55 - 0.12 * u01(t, T.pity, T.come)], look: [0.05, 1.4, -1.4], fov: 40 }) },
    { id: 'come', t0: T.come, set: 'towel', vex: (t) => ({ ...VT, pose: 'beckon', lean: 0.3, tilt: -0.1, face: { relaxed: 0.35, blink: lids(t) } }), p: [[0.1, 0.95, 0.4], [0.08, 1.0, 0.2]], a: [[0.05, 1.2, -1.4], [0.05, 1.24, -1.4]], fov: 46 },
    { id: 'book', t0: T.close - 0.05, set: 'towel', p: [[-0.52, 0.64, 0.28], [-0.53, 0.58, 0.22]], a: [[-0.6, 0.02, -0.09], [-0.6, 0.02, -0.09]], fov: 44 },
    { id: 'tease', t0: T.tease, set: 'shore', vex: (t) => ({ ...VS, pose: t > T.mommy2 + 0.3 ? 'peace' : 'hairflip', tilt: -0.15, sway: 0.2, face: { happy: t > T.mommy2 + 0.4 ? 0.45 : 0, relaxed: 0.35, blink: lids(t), blinkLeft: t > T.mommy2 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy2 - 0.1, 1.0); return { pos: [0.08, 1.4, 0.4 - 0.65 * k], look: [0, 1.3 + 0.08 * k, -1.7], fov: 42 }; }, sun: [0.16, 0.05] },
    { id: 's2', t0: T.scribe, set: 'towel', p: [[-0.1, 0.62, 0.1], [-0.1, 0.6, 0.05]], a: [[-0.12, 0.12, -0.42], [-0.12, 0.12, -0.42]], fov: 46, snap: 1 },
    { id: 's3', t0: T.scribeW - 0.05, set: 'towel', screen: 0.85, dx: 0.12 },
    { id: 's4', t0: T.and2 - 0.05, set: 'towel', p: [[-0.12, 0.62, -0.22], [-0.12, 0.52, -0.25]], a: [[-0.12, 0.02, -0.43], [-0.12, 0.02, -0.43]], fov: 44, write: 1 },
    { id: 's5', t0: T.even - 0.05, set: 'towel', macro: 1, write: 1 },
    { id: 'secret', t0: T.secret, set: 'towel', vex: (t) => ({ ...VT, pose: t > T.notices - 0.5 ? 'shh' : 'peace', lean: 0.35, tilt: -0.12, sway: 0.2, face: { relaxed: 0.35, happy: t < T.notices - 0.5 ? 0.3 : 0, blink: lids(t), blinkLeft: t > T.notices ? 1 : 0 } }), cam: (t) => ({ pos: [0.05, 1.05, 0.2 - 0.3 * u01(t, T.secret, T.relax)], look: [0.05, 1.3, -1.4], fov: 46 }) },
    { id: 'relax', t0: T.relax, set: 'shore', vex: (t) => ({ ...VS, rotY: t < T.out - 0.2 ? 0.75 : 0.15, pose: t < T.out - 0.2 ? 'hip' : 'kiss', tilt: 0.12, sway: 0.25 * Math.sin(t * 0.7), face: { relaxed: 0.45, blink: lids(t, 0.25) } }), p: [[0.95, 1.1, 0.05], [0.78, 1.15, -0.1]], a: [[-0.2, 1.25, -2.0], [-0.15, 1.28, -2.0]], fov: 46, sun: [0.24, 0.04] },
    { id: 'swim', t0: T.swim, set: 'shore', vex: (t) => ({ ...VS, pose: 'beckon', tilt: -0.12, sway: 0.22, face: { relaxed: 0.45, blink: lids(t), blinkLeft: t > T.mommy3 + 0.3 ? 1 : 0 } }), cam: (t) => { const k = bump(t, T.mommy3 - 0.1, 1.0); return { pos: [0.25 - 0.18 * k, 1.38 + 0.06 * k, 0.5 - 0.95 * k], look: [0.05, 1.18 + 0.2 * k, -1.7], fov: 46 }; }, sun: [-0.2, 0.05] },
    { id: 'end', t0: T.end, set: 'shore', vex: (t) => ({ ...VS, pose: t > T.baby - 0.2 ? 'kissOut' : t > T.recessive - 0.2 ? 'peace' : 'hip', lean: 0.2, tilt: -0.12, sway: 0.2, face: { relaxed: 0.45, happy: t > T.recessive && t < T.baby ? 0.4 : 0, blink: lids(t), blinkLeft: t > T.baby + 0.2 ? 1 : 0 } }), p: [[0.15, 1.42, -0.55], [0.12, 1.42, -0.35]], a: [[0.02, 1.32, -1.7], [0.02, 1.3, -1.75]], fov: 46, kick: 1, sun: [0.17, 0.06] },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V();
  const screenCam = (d, k, dx = 0) => { const s3 = laptop.scr; s3.updateWorldMatrix(true, false); s3.localToWorld(scrP.set(dx, 0, 0)); s3.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d - 0.08 * k); return { pos: p.toArray(), look: scrP.toArray(), fov: 40 }; };
  const tipLocal = (tip) => { const v = V((tip[0] / sheet.w - 0.5) * 0.33, (0.5 - tip[1] / sheet.h) * 0.427, 0); sheetM.updateWorldMatrix(true, false); sheetM.localToWorld(v); return S.worldToLocal(v); };
  const tmp = V();

  function update(t) {
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    for (const [n, r] of Object.entries(ST)) r.visible = n === sh.set;
    BEACH.setMood(GOLD);
    const St = ST[sh.set]; St.updateMatrixWorld(true);
    const W3 = (q) => St.localToWorld(V(...q)).toArray();
    let cam;
    if (sh.screen) cam = screenCam(sh.screen, k, sh.dx || 0);
    else if (sh.macro) { sheet.draw(writeP(t)); const kk = ease(u01(t, T.even + 0.6, T.secret - 0.2)), c = tipLocal(lerp3(gridC, bothC, kk)); cam = { pos: W3([c.x + 0.02, c.y + 0.24 + 0.1 * kk, c.z + 0.08]), look: W3([c.x, c.y, c.z]), fov: 40 }; }
    else if (sh.cam) { const c = sh.cam(t); cam = { pos: W3(c.pos), look: W3(c.look), fov: c.fov }; }
    else cam = { pos: W3(lerp3(sh.p[0], sh.p[1], ease(k))), look: W3(lerp3(sh.a[0], sh.a[1], ease(k))), fov: sh.fov };
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    // the low sun in view behind her (per-shot offset); the warm key comes from the lens side; a fill rides at the lens
    { const f = V(...cam.look).sub(V(...cam.pos)).setY(0).normalize(), side = V(f.z, 0, -f.x), tg = V(...cam.look).setY(0), sd = sh.sun || [0.14, 0.05];
      BEACH.setSun(studio.camera.position, f.clone().addScaledVector(side, sd[0]).add(V(0, sd[1], 0)));
      BEACH.sun.target.position.copy(tg); BEACH.sun.position.copy(tg).addScaledVector(f, -9).addScaledVector(side, -6).add(V(0, 6, 0));
      const d = Math.max(0.6, studio.camera.position.distanceTo(V(...cam.look))); fill.position.copy(studio.camera.position).add(V(0, 0.15, 0)); fill.intensity = sh.vex ? Math.min(1.6, 0.22 * Math.pow(d, 1.6)) : 0; }
    VEX.root.visible = !!sh.vex;
    if (sh.vex) { const v = glide(sh.vex, t, sh.vex(t)), wp = W3([v.x, 0, v.z]); VEX.update(t, { ...lips(t), sway: 0.15, ...v, face: vexLook(v.face || {}), x: wp[0], z: wp[2], y: 0, rotY: (v.rotY ?? 0) + PI }); }
    fx(t, !!sh.vex);
    laptop.scr.material.map = screen.tex;
    screen.draw(t < T.scribeW + 0.25 ? { mode: 'scan', k: u01(t, T.scribeW - 0.05, T.scribeW + 0.25) } : t < T.and2 ? { mode: 'solve', k: u01(t, T.scribeW + 0.25, T.and2 - 0.1) } : { mode: 'write', k: 0 });
    const tip = sheet.draw(writeP(t));
    pen.g.visible = !!sh.write; pen.glow.scale.setScalar(sh.macro ? 0.02 : 0.06); pen.glow.material.opacity = sh.macro ? 0.5 : 1;
    if (sh.write) { const p = tipLocal(tip); pen.g.position.set(p.x, p.y + 0.004 + 0.006 * Math.abs(Math.sin(t * 23)), p.z); pen.g.rotation.set(0.35, 0, -0.3); }
    snap.visible = sh.snap === 1;
    { const D = new URLSearchParams(location.search).get('cam'); if (D && sh.vex && ['wide', 'wide2'].includes(D)) { const fo = VEX.bpos('upperChest').add(V(0, 0.05, 0)), q = new THREE.Quaternion(); VEX.root.getWorldQuaternion(q); studio.setCamera(fo.clone().add(V(D === 'wide' ? -1.1 : 1.1, 0.05, 0.25).applyQuaternion(q)).toArray(), fo.toArray(), 40, 0, 0); } }   // debug: render --cam wide|wide2 = her upper body from each side (arms vs chest)
    if (sh.snap) { const sw = [-0.12, 0.02, -0.42], u = ease(u01(t, sh.t0, sh.t0 + 0.35)), tS = sh.t0 + 0.45; snap.position.set(sw[0] + 0.03, sw[1] + 0.34 - 0.08 * u, sw[2] + 0.3 - 0.12 * u); snap.rotation.set(-0.35, 0.1, 0); snap.flash.material.opacity = t > tS && t < tS + 0.18 ? 0.95 * (1 - (t - tS) / 0.18) : 0; }
    // the textbook: open flat, slams shut on "close" (the right cover swings over the spine)
    const kc = ease(u01(t, T.close, T.close + 0.32)); flap.rotation.z = PI * kc;
    // puffs: sand off the shoe as the shot lands, sand from the book slam; spray from her kick at the waterline
    puffs.forEach((p) => (p.visible = false)); spray.forEach((p) => (p.visible = false));
    const burst = (pool, at, a, n, rise, spread, size) => { for (let i = 0; i < n && i < pool.length; i++) { const s2 = pool[i], ang = i * 2.39996; S.updateMatrixWorld(true); s2.visible = true; tmp.set(at[0] + Math.cos(ang) * spread * (0.4 + a), at[1] + rise * a * (1 - a * 0.6) * (1 + (i % 3) * 0.3), at[2] + Math.sin(ang) * spread * (0.4 + a)); s2.position.copy(BEACH.root.worldToLocal(St.localToWorld(tmp.clone()))); s2.scale.setScalar(size * (0.6 + 0.6 * (1 - a))); s2.material.opacity = 1 - a; } };
    if (sh.id === 'book' && t > T.close + 0.28 && t < T.close + 1.1) burst(puffs, [-0.5, 0.03, -0.12], (t - T.close - 0.28) / 0.82, 8, 0.08, 0.13, 0.022);
    if (sh.kick && t > T.recessive && t < T.recessive + 1.0) burst(spray, [VS.x + 0.15, 0.05, VS.z - 0.15], (t - T.recessive) / 1.0, 12, 0.7, 0.35, 0.09);
    // the product shots (Scribe screen, the pen writing, the Punnett-square macro) render crisp at block 1 with NO mosaic: at block 2 +
    // the mosaic swell on both ends of a 1.9 s macro, the handwriting read as pixel mush (manager, Nov 9). A cut into or out of one
    // keeps only the other shot's half of the mosaic.
    pixel.set(sh.screen || sh.write ? 1 : Math.max(PIXEL, mosaicAt(t, CUTS)));
    ov.update(t);
  }
  update(0);
  return { update };
}
