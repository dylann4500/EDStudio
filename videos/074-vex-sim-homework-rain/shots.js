// 074 — "What if it rained homework?" (Scribe lane, anime/pixel look). Vex lives through a what-if SIMULATION (docs/TONES.md: the
// premise on frame 1, a HUD that is the plot, one escalation per beat across places, the biggest visual last, then the product):
//   beach  9 AM  drizzle      one worksheet floats down and lands on her head ("Cute.")
//   beach 10 AM  showers      a goth umbrella pops open; the sheets pile on it and it flips inside out
//   town  noon   heavy rain   the street is buried 1.3 m deep; car roofs poke out; she stands on one ("Buried in chemistry")
//   town  2 PM   tornado      a funnel of essays tears down the street past her
//   town  4 PM   flood        3.6 m of paper: rooftops, a school roof, and Vex surfing a classroom desk
//   town  6 PM   tsunami      a 35 m wave of homework curls over the town — the biggest visual
//   pivot                     "Relax, babe. I don't panic. I scan." — she scans the wave with her phone
//   Scribe                    in the APP (user rule, Nov 9): Scanned pages · 12 pages → solving → the page written on screen stroke
//                             by stroke with an on-screen pen, zooming onto the Lewis structure it draws → Download PDF
//   clear                     "it only rains when it's not done": the wave and the rain fly back UP, the sky clears
//   beach sunset              "Tomorrow's forecast? Zero percent homework." → wink → the Scribe end card
// HUD = a weather alert (time · SHEETS FALLEN · condition · depth). The count is the paper on HER STREET (the voxel town, ~260 × 84 m
// ≈ 22,000 m²): a US-letter sheet = 0.0603 m² × 0.1 mm, a loose pile ≈ 1.6× the paper's volume → ~104,000 sheets per m² per metre of
// depth → 1.3 m ≈ 3.0 billion, 3.6 m ≈ 8.2 billion, + a 35 m wave (~900 m² section × 150 m) ≈ 14 billion more → 22 billion.
// Scribe claims (README): a phone's camera scans pages into one "Scanned pages" chip (≤ 12 pages a request), every problem is solved
// with worked steps, written in your own handwriting and drawn on screen as if a pen were doing it, chemistry with Lewis structures,
// then a PDF. Guardrails: flirty-confident for an 18+ college audience, swimwear at most, no kink lines, no promises.
import * as THREE from 'three';
import { addPixelPass, mosaicAt } from '@engine/pixel.js';
import { makeVroid, dressGoth, ARMS } from '@engine/vroid.js';
import { makePixelOverlay, pixelText } from '@engine/pixelcaps.js';
import { buildVoxBeach } from '@engine/sets/voxbeach.js';
import { buildVoxTown, voxCar, voxDesk } from '@engine/voxel/index.js';
import { pixelTex } from '@engine/pixeltex.js';
import { loadHand, loadImg } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';

const PI = Math.PI, PIXEL = 4;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, k) => a + (b - a) * k;
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const hr = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const wrap = (v, lo, w) => lo + ((((v - lo) % w) + w) % w);
/** piecewise keyframes (eased): K(t, [[t0, v0], [t1, v1], …]) */
const K = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], ease(u01(t, ks[i - 1][0], ks[i][0]))); return ks[ks.length - 1][1]; };
const GEO = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const u = u01(t, ks[i - 1][0], ks[i][0]); return Math.exp(lerp(Math.log(ks[i - 1][1]), Math.log(ks[i][1]), u)); } return ks[ks.length - 1][1]; };

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

// ---------------------------------------------------------------- paper: textures + the instanced systems (all pure functions of t)
const SHEET_W = 0.216, SHEET_H = 0.279;
function sheetTex(kind) {   // a worksheet as a 24 × 31 px pixel texture: title bar, printed lines, a little figure
  return pixelTex(24, 31, (g, w, h) => {
    g.fillStyle = '#f7f5ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9d4c6'; g.fillRect(0, h - 1, w, 1); g.fillRect(w - 1, 0, 1, h);
    g.fillStyle = '#2a2a33'; g.fillRect(2, 2, kind === 1 ? 14 : 18, 2); g.fillStyle = '#b3261e'; g.fillRect(2, 5, 9, 1);
    g.fillStyle = '#9a9aa4'; for (let y = 8; y < h - 3; y += 3) g.fillRect(2, y, (y * 7 + kind * 5) % 9 > 3 ? 19 : 13, 1);
    if (kind === 1) { g.fillStyle = '#4a5a9a'; g.fillRect(14, 12, 2, 2); g.fillRect(11, 15, 2, 2); g.fillRect(17, 15, 2, 2); g.fillRect(13, 14, 1, 1); g.fillRect(16, 14, 1, 1); }
    if (kind === 2) { g.fillStyle = '#4a5a9a'; g.fillRect(12, 11, 1, 8); g.fillRect(12, 18, 8, 1); g.fillRect(13, 16, 2, 1); g.fillRect(15, 14, 2, 1); g.fillRect(17, 12, 2, 1); }
  }, { k: 1 });
}
function messTex() {   // a pile of overlapping sheets (tiles seamlessly at the edges by drawing each sheet with wrap copies)
  return pixelTex(96, 96, (g, w, h) => {
    g.fillStyle = '#cfcabc'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      const x = hr(i, 1) * w, y = hr(i, 2) * h, a = (hr(i, 3) - 0.5) * 1.6, sw = 15 + hr(i, 4) * 5, sh = sw * 1.3;
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
        g.save(); g.translate(x + ox, y + oy); g.rotate(a);
        g.fillStyle = 'rgba(60,55,50,.22)'; g.fillRect(-sw / 2 + 1, -sh / 2 + 1, sw, sh);
        g.fillStyle = ['#fbfaf4', '#f2efe6', '#f7f5ee', '#ebe7dc'][i % 4]; g.fillRect(-sw / 2, -sh / 2, sw, sh);
        g.fillStyle = '#2a2a33'; g.fillRect(-sw / 2 + 2, -sh / 2 + 2, sw * 0.6, 1.5);
        g.fillStyle = '#a4a3ab'; for (let k = 0; k < 5; k++) g.fillRect(-sw / 2 + 2, -sh / 2 + 6 + k * 3.2, sw * (k % 2 ? 0.5 : 0.75), 1);
        if (i % 5 === 0) { g.fillStyle = '#c23a33'; g.fillRect(sw / 2 - 5, -sh / 2 + 2, 3, 3); }
        g.restore();
      }
    }
  }, { k: 1 });
}

/** falling (or rising) sheets in a box that follows a centre; positions are world-fixed patterns wrapped into the box */
function makeRain(parent, N, texes) {
  const geo = new THREE.PlaneGeometry(SHEET_W, SHEET_H), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = V(), s = V(1, 1, 1);
  const meshes = texes.map((tx) => { const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }), Math.ceil(N / texes.length)); im.frustumCulled = false; im.count = 0; parent.add(im); return im; });
  function update(t, o) {
    const { n = 0, c = [0, 0, 0], w = 16, h = 12, d = 16, v = 2.0, wind = [0, 0], dir = 1, scale = 1, cam = null, near = 0.7, floor = -1e9, gust = 0 } = o;
    const cnt = meshes.map(() => 0);
    for (let i = 0; i < Math.min(n, N); i++) {
      const mi = i % meshes.length, a = hr(i, 1), b = hr(i, 2), cc = hr(i, 3), ph = hr(i, 4), vi = v * (0.7 + 0.6 * cc);
      const fall = (t * vi + ph * h) % h;
      const y = dir > 0 ? c[1] + h / 2 - fall : c[1] - h / 2 + fall;
      if (y < floor) continue;
      const fl = 0.35 * Math.sin(t * (1.3 + a) + ph * 9) * (1 - gust * 0.5);
      const x = wrap(a * 997 + wind[0] * t + fl, c[0] - w / 2, w), z = wrap(b * 991 + wind[1] * t + 0.3 * Math.cos(t * 1.1 + ph * 7), c[2] - d / 2, d);
      p.set(x, y, z); if (cam && p.distanceToSquared(cam) < near * near) continue;
      e.set(Math.sin(t * 2.3 * (0.6 + a) + ph * 9) * 1.3 + gust * 1.2, t * (0.9 + b) * 1.5 + ph * 6, Math.cos(t * 1.7 * (0.5 + cc) + ph * 5) * 1.0);
      q.setFromEuler(e); s.setScalar(scale); m4.compose(p, q, s); meshes[mi].setMatrixAt(cnt[mi]++, m4);
    }
    meshes.forEach((im, k) => { im.count = cnt[k]; im.instanceMatrix.needsUpdate = true; });
  }
  return { update, meshes, set visible(v) { meshes.forEach((m) => (m.visible = v)); } };
}
/** sheets lying on a surface: n of them scattered round a centre (disc radius r), at height y */
function makeLitter(parent, N, texes) {
  const geo = new THREE.PlaneGeometry(SHEET_W, SHEET_H); geo.rotateX(-PI / 2);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = V(), s = V(1, 1, 1);
  const meshes = texes.map((tx) => { const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }), Math.ceil(N / texes.length)); im.frustumCulled = false; im.count = 0; im.receiveShadow = true; parent.add(im); return im; });
  function update(n, c, r, y, { lift = 0, bob = 0, t = 0, scale = 1 } = {}) {
    const cnt = meshes.map(() => 0);
    for (let i = 0; i < Math.min(n, N); i++) {
      const mi = i % meshes.length, rr = r * Math.sqrt(hr(i, 11)), a = hr(i, 12) * 2 * PI;
      p.set(c[0] + Math.cos(a) * rr, y + 0.002 * (i % 7) + hr(i, 13) * lift + bob * Math.sin(t * 1.3 + i), c[2] + Math.sin(a) * rr);
      e.set((hr(i, 14) - 0.5) * 0.25, hr(i, 15) * 2 * PI, (hr(i, 16) - 0.5) * 0.25); q.setFromEuler(e); s.setScalar(scale);
      m4.compose(p, q, s); meshes[mi].setMatrixAt(cnt[mi]++, m4);
    }
    meshes.forEach((im, k) => { im.count = cnt[k]; im.instanceMatrix.needsUpdate = true; });
  }
  return { update, meshes, set visible(v) { meshes.forEach((m) => (m.visible = v)); } };
}

export async function build(studio, story) {
  const { scene } = studio;
  const pixel = addPixelPass(studio);
  studio.renderer.localClippingEnabled = true;
  const B = story.beats, W = (b, w, n = 1) => { const hits = B[b].w.filter((x) => x[0] === w); if (hits.length < n) throw new Error(`no '${w}'#${n} in ${b}`); return hits[n - 1][1]; };
  const WE = (b, w, n = 1) => B[b].w.filter((x) => x[0] === w)[n - 1][2];
  const T = {
    actually: W('hook', 'actually'), drizzle: B.drizzle.t0, one: W('drizzle', 'one'), cute: W('drizzle', 'cute'),
    showers: B.showers.t0, showersW: W('showers', 'showers'), umbrella: W('showers', 'umbrella'), not: W('showers', 'not'),
    noon: B.noon.t0, cars: W('noon', 'cars'), buried: W('noon', 'buried'), tornado: B.tornado.t0, tornadoW: W('tornado', 'tornado'), made: W('tornado', 'made'),
    flood: B.flood.t0, underwater: W('flood', 'underwater'), surfing: W('flood', 'surfing'), wave: B.wave.t0, big: W('wave', 'big'),
    pivot: B.pivot.t0, babe: W('pivot', 'babe'), dont: W('pivot', 'dont'), scan: W('pivot', 'scan'),
    scribe: B.scribe.t0, twelve: W('scribe', 'twelve'), handwriting: W('scribe', 'handwriting'), lewis: W('scribe', 'lewis'), included: W('scribe', 'included'), includedE: WE('scribe', 'included'),
    clear: B.clear.t0, rains: W('clear', 'rains'), done: W('clear', 'done'), end: B.end.t0, zero: W('end', 'zero'), homeworkE: WE('end', 'homework'), youre: W('end', 'youre'), welcomeE: WE('end', 'welcome'),
  };
  T.land = T.one + 0.25;                 // the first worksheet lands on her head
  T.pop = T.showersW + 0.1;              // the umbrella opens
  T.flip = T.not + 0.05;                 // …and flips inside out
  T.flash = T.scan + 0.3;                // the scan
  T.card = T.welcomeE + 0.5;

  // ---------------------------------------------------------------- sets: the beach at the origin, the voxel town parked at OX
  const BE = buildVoxBeach(studio); const BR = BE.root;
  const beachBg = scene.background.clone();
  const OX = 4000;
  const TW = buildVoxTown(studio); TW.world.root.position.set(OX, 0, 0); const TR = TW.world.root;
  const townFog = scene.fog; scene.fog = null;
  const FOG0 = townFog.color.clone();
  // storm skies: own gradient canvases on both sky domes (k 0 = clear, 1 = slate storm; `sun` = a sunset blend for the ending)
  const skyCanvas = () => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return { c, tx }; };
  const beachSky = []; BR.traverse((o) => { if (o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300) beachSky.push(o); });
  const bSky = skyCanvas(), tSky = skyCanvas(); beachSky.forEach((o) => { o.material.map = bSky.tx; o.material.needsUpdate = true; });
  TW.world.sky.material.map = tSky.tx; TW.world.sky.material.needsUpdate = true;
  const CLEAR = ['#4f9fe8', '#86c2f2', '#d4ebfb'], STORM = ['#3b4250', '#626b78', '#9aa0a6'], SUNSET = ['#5a3a8a', '#e0708a', '#ffc070'];
  const mixC = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
  let skyKey = '';
  function paintSky(k, sun, which) {
    const key = which + Math.round(k * 50) + ':' + Math.round(sun * 50); if (key === skyKey) return; skyKey = key;
    const S = which === 'beach' ? bSky : tSky, g = S.c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    [0, 0.55, 1].forEach((u, i) => gr.addColorStop(u, '#' + mixC(CLEAR[i], STORM[i], k).lerp(new THREE.Color(SUNSET[i]), sun).getHexString()));
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256); S.tx.needsUpdate = true;
  }
  const beachClouds = []; BR.traverse((o) => { if (o.isMesh && o.material?.emissiveIntensity === 0.55) beachClouds.push(o); });
  const BS0 = BE.sun.intensity, BH0 = BE.hemi.intensity, TS0 = TW.world.sun.intensity, TH0 = TW.world.hemi.intensity;
  function storm(which, k, sun = 0) {
    paintSky(k, sun, which);
    if (which === 'beach') {
      BE.setMood(sun); BE.sun.intensity = (2.0 - 0.6 * sun) * (1 - 0.55 * k); BE.hemi.intensity = (1.45 - 0.3 * sun) * (1 - 0.3 * k);
      BE.sun.position.set(-4 + 2 * sun, 12 - 6 * sun, -6); BE.sun.target.position.set(0, 0, 6);
      if (beachClouds[0]) { beachClouds[0].material.color.copy(mixC('#ffffff', '#7d838c', k)); }
      BE.sunSprite.visible = k < 0.3; scene.background.copy(beachBg).lerp(new THREE.Color(STORM[1]), k).lerp(new THREE.Color(SUNSET[1]), sun);
    } else {
      TW.world.sun.intensity = TS0 * (1 - 0.6 * k) * (1 + 0.1 * sun); TW.world.hemi.intensity = TH0 * (1 - 0.32 * k);
      TW.world.sun.color.copy(mixC('#fff4e2', '#ffb070', sun)); TW.world.hemi.color.copy(mixC('#dcebff', '#aab0b8', k)); TW.world.hemi.groundColor.set('#d6d3ca');
      townFog.color.copy(FOG0).lerp(new THREE.Color('#8f959c'), k).lerp(new THREE.Color('#f0b088'), sun); townFog.near = lerp(140, 40, k); townFog.far = lerp(1100, 420, k);
      if (TW.world.clouds) { TW.world.clouds.mesh.material.color.copy(mixC('#ffffff', '#6f7680', k)); TW.world.clouds.mesh.material.emissive.copy(mixC('#dfe9f7', '#4a5058', k)); }
      scene.background.copy(townFog.color);
    }
  }
  function useSet(which) {
    BR.visible = which === 'beach'; TR.visible = which === 'town';
    scene.fog = which === 'town' ? townFog : null;
    studio.camera.far = which === 'town' ? 12500 : 800; studio.camera.updateProjectionMatrix();
  }

  // town dressing: Vex's car in the road, her desk raft, the paper sea
  const CX = OX + 2, CZ = -0.5;
  const myCar = voxCar(0x7a4ad8, { seed: 7 }); myCar.position.set(CX, 0, CZ); scene.add(myCar);
  const ROOF = 1.75;
  for (const [dx, dz, c] of [[7, 0.3, 0xd8413a], [13.5, -0.7, 0x3c6fd8], [-7.5, -0.1, 0xf2b51d], [20, 0.4, 0x2fa05a]]) { const o = voxCar(c, { seed: dx }); o.position.set(CX + dx, 0, CZ + dz); o.rotation.y = dz > 0 ? 0 : PI; scene.add(o); TR.attach(o); }
  const desk = voxDesk({ bs: 0.125 }); scene.add(desk);
  const DESK_TOP = 0.75;
  const T1 = sheetTex(0), T2 = sheetTex(1), T3 = sheetTex(2), TEX = [T1, T2, T3];
  const mt = messTex(); mt.wrapS = mt.wrapT = THREE.RepeatWrapping;
  const seaTex = mt.clone(); seaTex.needsUpdate = true; seaTex.repeat.set(170, 170);
  const seaGeo = new THREE.PlaneGeometry(520, 520, 90, 90); seaGeo.rotateX(-PI / 2);
  const seaBase = Float32Array.from(seaGeo.attributes.position.array);
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshLambertMaterial({ map: seaTex })); sea.receiveShadow = true; sea.position.set(OX, 0, 0); scene.add(sea);
  function setSea(level, t, amp) {
    sea.visible = level > 0.02; sea.position.y = level;
    const P = seaGeo.attributes.position.array;
    for (let i = 0; i < P.length; i += 3) { const x = seaBase[i], z = seaBase[i + 2]; P[i + 1] = amp * (Math.sin(x * 0.21 + t * 1.3) * 0.6 + Math.sin(z * 0.17 - t * 0.9 + x * 0.05) * 0.4); }
    seaGeo.attributes.position.needsUpdate = true; seaGeo.computeVertexNormals();
  }
  // rain + litter (one set of systems; they live in world space and are re-centred per shot)
  const rain = makeRain(scene, 2400, TEX);
  const litter = makeLitter(scene, 1400, TEX);
  // readable worksheets for the close-ups: CHEM headings at a size a phone can read
  const chemTex = (() => { const c = document.createElement('canvas'); c.width = 432; c.height = 558; const g = c.getContext('2d');
    g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 432, 558); g.fillStyle = '#1d1d1d'; g.font = '800 64px Inter, Arial'; g.fillText('CHEM HW', 30, 86);
    g.fillStyle = '#b3261e'; g.font = '700 30px Inter, Arial'; g.fillText('DUE TONIGHT', 32, 134);
    g.fillStyle = '#1d1d1d'; g.font = '600 46px Georgia, serif'; g.fillText('CH₄ + O₂ → ?', 30, 240); g.fillText('Draw H₂O', 30, 330);
    g.strokeStyle = '#a4a3ab'; g.lineWidth = 4; for (let y = 380; y < 540; y += 40) { g.beginPath(); g.moveTo(30, y); g.lineTo(400, y); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
  const heldSheet = new THREE.Mesh(new THREE.PlaneGeometry(SHEET_W * 1.25, SHEET_H * 1.25), new THREE.MeshLambertMaterial({ map: chemTex, side: THREE.DoubleSide })); scene.add(heldSheet);

  // ---------------------------------------------------------------- the paper tornado: a streaky funnel + an orbit of sheets
  const twister = new THREE.Group(); scene.add(twister);
  const TWH = 34, TWR0 = 1.6, TWR1 = 11;
  const streak = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); g.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) { const x = hr(i, 21) * 256, y = hr(i, 22) * 256, L = 30 + hr(i, 23) * 70; g.strokeStyle = i % 3 ? 'rgba(236,232,222,.75)' : 'rgba(150,146,140,.6)'; g.lineWidth = 2 + hr(i, 24) * 5;
      for (const ox of [-256, 0, 256]) { g.beginPath(); g.moveTo(x + ox, y); g.quadraticCurveTo(x + ox + L * 0.5, y - 10, x + ox + L, y - 26); g.stroke(); } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(TWR1, TWR0, TWH, 40, 8, true), new THREE.MeshLambertMaterial({ map: streak, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  funnel.position.y = TWH / 2; twister.add(funnel);
  const funnel2 = new THREE.Mesh(new THREE.CylinderGeometry(TWR1 * 0.75, TWR0 * 0.6, TWH, 32, 8, true), new THREE.MeshLambertMaterial({ map: streak.clone(), color: 0xb8b4ac, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
  funnel2.material.map.needsUpdate = true; funnel2.position.y = TWH / 2; twister.add(funnel2);
  const twN = 2600, twGeo = new THREE.PlaneGeometry(SHEET_W * 2.2, SHEET_H * 2.2);
  const twIM = new THREE.InstancedMesh(twGeo, new THREE.MeshLambertMaterial({ map: T2, side: THREE.DoubleSide }), twN); twIM.frustumCulled = false; twister.add(twIM);
  function setTwister(t, x, z, k) {
    twister.visible = k > 0; if (!k) return; twister.position.set(x, 0, z);
    streak.offset.x = -t * 0.9; funnel2.material.map.offset.x = -t * 1.4; funnel.rotation.y = 0;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = V(), s = V(1, 1, 1);
    for (let i = 0; i < twN; i++) {
      const u = hr(i, 31), h = u * TWH * 1.08, r = (TWR0 + (TWR1 - TWR0) * Math.pow(u, 1.25)) * (0.75 + 0.6 * hr(i, 32)) + 0.6 * Math.sin(t * 3 + i);
      const th = hr(i, 33) * 2 * PI + t * (2.6 - 1.3 * u) * (0.8 + 0.4 * hr(i, 34));
      p.set(r * Math.cos(th), h + 0.4 * Math.sin(t * 2 + i), r * Math.sin(th)); e.set(t * 3 + i, t * 2.2 + i * 0.7, t * 1.7 + i * 1.3); q.setFromEuler(e); s.setScalar(k);
      m4.compose(p, q, s); twIM.setMatrixAt(i, m4);
    }
    twIM.instanceMatrix.needsUpdate = true; twister.scale.setScalar(Math.max(0.001, k));
  }

  // ---------------------------------------------------------------- the paper tsunami: a curling profile extruded across the street
  const wave = new THREE.Group(); scene.add(wave); wave.rotation.y = -PI / 2;   // local +z (the way it breaks) = world −x
  const PROF = [[-3.2, 0], [-2.2, 0.18], [-1.4, 0.45], [-0.75, 0.75], [-0.3, 0.93], [0.1, 1.0], [0.42, 0.97], [0.68, 0.87], [0.86, 0.71], [0.9, 0.56], [0.82, 0.47], [0.68, 0.47], [0.55, 0.53], [0.45, 0.47], [0.4, 0.34], [0.43, 0.2], [0.55, 0.08], [0.8, 0]];
  const waveMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: (() => { const t = mt.clone(); t.needsUpdate = true; t.repeat.set(1, 1); return t; })(), side: THREE.DoubleSide });
  const waveMesh = (() => {
    const WD = 220, NX = 60, pos = [], uv = [], idx = [];
    const arc = [0]; for (let i = 1; i < PROF.length; i++) arc.push(arc[i - 1] + Math.hypot(PROF[i][0] - PROF[i - 1][0], PROF[i][1] - PROF[i - 1][1]));
    for (let ix = 0; ix <= NX; ix++) { const x = -WD / 2 + (WD * ix) / NX; PROF.forEach(([z, y], j) => { pos.push(x, y, z); uv.push(x / 3, arc[j] * 12); }); }
    const np = PROF.length; for (let ix = 0; ix < NX; ix++) for (let j = 0; j < np - 1; j++) { const a = ix * np + j, b = a + np; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const SH8 = [0.72, 0.78, 0.86, 0.98, 1.12, 1.22, 1.28, 1.24, 1.12, 0.8, 0.4, 0.36, 0.4, 0.48, 0.56, 0.64, 0.7, 0.74], col = [];
    for (let ix = 0; ix <= NX; ix++) PROF.forEach((_, j) => { const c = SH8[j]; col.push(c, c, c * 1.02); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, waveMat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; return m;
  })();
  const waveBody = new THREE.Group(); waveBody.add(waveMesh); wave.add(waveBody);
  const sprayN = 1800, sprayIM = new THREE.InstancedMesh(new THREE.PlaneGeometry(SHEET_W * 5, SHEET_H * 5), new THREE.MeshLambertMaterial({ map: T1, side: THREE.DoubleSide }), sprayN); sprayIM.frustumCulled = false; scene.add(sprayIM);
  // H = height (m), x = world x of the crest, k = 0..1 visibility, up = the clear-out (sheets lift off into the sky, the body sinks)
  function setWave(t, x, H, k, up = 0) {
    wave.visible = sprayIM.visible = k > 0.01; if (!wave.visible) return;
    wave.position.set(x, 0, CZ); waveBody.scale.set(1, Math.max(0.01, H * (1 - up)), H * 1.15);
    waveMat.map.offset.y = -t * 0.35;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = V(), s = V(1, 1, 1);
    for (let i = 0; i < sprayN; i++) {
      const zz = -105 + hr(i, 41) * 210, ph = (t * (0.35 + 0.2 * hr(i, 42)) + hr(i, 43)) % 1;
      // spray: born at the lip, flies forward + falls (a cycle); the clear-out sends every sheet up and away
      const lipX = x - 0.86 * H * 1.15, lipY = 0.75 * H * (1 - up);
      const fx = lipX - ph * (3 + 6 * hr(i, 44)), fy = lipY + ph * (3 + 4 * hr(i, 45)) - ph * ph * (9 + 5 * hr(i, 46));
      const ux = x - hr(i, 47) * 1.1 * H, uy = hr(i, 48) * H * 0.9 + up * up * (40 + 120 * hr(i, 49));
      p.set(lerp(fx, ux, clamp(up * 3)), lerp(fy, uy, clamp(up * 3)), CZ + zz); e.set(t * 2 + i, t * 1.3 + i * 0.5, t + i * 1.7); q.setFromEuler(e); s.setScalar(k);
      m4.compose(p, q, s); sprayIM.setMatrixAt(i, m4);
    }
    sprayIM.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------------- Vex: 067's look (big eyes, chest shading)
  const body = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: body }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  const GM = dressGoth(VEX); scene.add(VEX.root);
  // the first worksheet: rides her head once it lands (a group on the head bone)
  const hd = VEX.bpos('head');
  const headSheetG = VEX.attach('head', [hd.x, hd.y + 0.2, hd.z + 0.01]);
  const headSheet = new THREE.Mesh(new THREE.PlaneGeometry(SHEET_W, SHEET_H), new THREE.MeshLambertMaterial({ map: T2, side: THREE.DoubleSide }));
  headSheet.rotation.set(-PI / 2 + 0.42, 0.25, 0); headSheetG.add(headSheet);
  const fallSheet = new THREE.Mesh(new THREE.PlaneGeometry(SHEET_W, SHEET_H), new THREE.MeshLambertMaterial({ map: T2, side: THREE.DoubleSide })); scene.add(fallSheet);
  const fill = new THREE.PointLight(0xfff0e8, 1.0, 0, 1.6); scene.add(fill);   // fill AT the lens, intensity ∝ d^1.6 (064)
  const lips = (t) => { const w = story.words.find((x) => t >= x.t0 && t < x.t1 - 0.03); if (!w) return { mouth: 0 }; const v = (w.w.toLowerCase().match(/[aeiouy]/g) || ['a']).map((c) => (c === 'y' ? 'i' : c)), u = clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0 - 0.03)) * v.length, i = Math.min(v.length - 1, Math.floor(u)); return { mouth: 0.22 + 0.55 * Math.sin(Math.PI * (u - i)), vowel: v[i] }; };
  // arm presets of this reel (her frame: x = her left, y up, z front)
  const MY = {
    umbrella: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.32, -0.82, 0.46], [0.18, 0.16, 1]] },
    surf: { L: [[0.95, -0.12, 0.2], [0.92, 0.18, 0.3]], R: [[-0.95, -0.25, -0.15], [-0.92, -0.05, -0.3]] },
    sheet: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.45, -0.74, 0.5], [-0.32, -0.02, 1]] },
    photo: { L: [[0.62, -0.72, -0.18], [-0.72, -0.62, 0.22]], R: [[-0.22, -0.32, 1], [0.1, 0.22, 1]] },
    look: { L: [[0.3, -0.9, 0.2], [0.1, -0.3, 1]], R: [[-0.3, -0.9, 0.2], [-0.1, -0.3, 1]] },
  };
  const armsOf = (pose) => { const A = MY[pose] || ARMS[pose] || ARMS.rest, L = A.L || ARMS.rest.L; return { L, R: A.R || L.map((d) => [-d[0], d[1], d[2]]) }; };
  const mixArm = (a, b, k) => a.map((d, i) => d.map((v, j) => v + (b[i][j] - v) * k));
  function glide(vexFn, t, v) {   // 064: blend the arms over 0.28 s when the pose changes (pure: re-evaluates the shot's pose fn back in time)
    const b = armsOf(v.pose);
    for (let d = 0.04; d <= 0.32; d += 0.04) { const pv = vexFn(t - d).pose; if (pv !== v.pose) { const k = ease(clamp((d - 0.02) / 0.28)), a = armsOf(pv); return { ...v, armL: mixArm(a.L, b.L, k), armR: mixArm(a.R, b.R, k) }; } }
    return { ...v, armL: b.L, armR: b.R };
  }
  const lids = (t, base = 0.03) => ((((t + 0.4) % 3.6) < 0.12) ? 1 : base);
  const CONF = (t, x = {}) => ({ relaxed: 0.1, angry: 0.12, blink: lids(t), ...x });   // 067's confident face (never 'happy' at rest)
  const gripR = () => VEX.bpos('rightHand').lerp(VEX.bpos('rightMiddleProximal'), 0.75);
  const eyeW = () => VEX.bpos('head').add(V(0, 0.07, 0)).add(V(0, 0, 0.09).applyQuaternion(VEX.root.quaternion));

  // ---- the goth umbrella (black + violet panels, silver tip); placed at her right fist every frame, shaft upright
  const umb = new THREE.Group(); scene.add(umb);
  const toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.92, 8), toon(0x2a2430)); sh.position.y = 0.4; umb.add(sh);
    const hk = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12, PI), toon(0x1a141c)); hk.position.set(0.045, -0.06, 0); hk.rotation.z = PI; umb.add(hk); }
  const canopy = new THREE.Group(); canopy.position.y = 0.86; umb.add(canopy);
  { const panels = 8; for (let i = 0; i < panels; i++) { const g = new THREE.ConeGeometry(0.62, 0.3, 2, 1, true, (i / panels) * 2 * PI, (2 * PI) / panels); const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: i % 2 ? 0x18121c : 0x4a2a6a, side: THREE.DoubleSide })); m.position.y = 0.15; canopy.add(m); }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.09, 6), toon(0xc8c8d0)); tip.position.y = 0.34; canopy.add(tip);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.008, 4, 32), toon(0xf06ab0)); trim.rotation.x = PI / 2; canopy.add(trim); }
  function setUmbrella(t, on, open, flip) {
    umb.visible = on; if (!on) return;
    const g = gripR(); umb.position.copy(g).add(V(0, -0.02, 0)); umb.rotation.set(0, VEX.root.rotation.y, 0);
    const o = ease(clamp(open)), f = ease(clamp(flip));
    canopy.scale.set(lerp(0.12, 1, o) * (1 + 0.15 * f), lerp(1.6, 1, o) * lerp(1, -1.25, f), lerp(0.12, 1, o) * (1 + 0.15 * f));
    canopy.rotation.z = 0.25 * f * Math.sin(t * 9); canopy.position.y = 0.86 + 0.06 * f;
  }

  // ---- her phone (a dark violet case) + its screen canvas: placed at her right grip every frame, screen toward her eyes
  const phone = new THREE.Group(); scene.add(phone);
  const PW = 0.078, PH = 0.158;
  phone.add(new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.011), toon(0x2e2238)));
  const scrC = document.createElement('canvas'); scrC.width = 600; scrC.height = 1280; const sg = scrC.getContext('2d');
  const scrT = new THREE.CanvasTexture(scrC); scrT.colorSpace = THREE.SRGBColorSpace; scrT.anisotropy = 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.006, PH - 0.008), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false })); screen.position.z = 0.0058; phone.add(screen);
  const flashL = new THREE.PointLight(0xffffff, 0, 6, 2); phone.add(flashL); flashL.position.z = -0.05;

  // ---------------------------------------------------------------- the Scribe app (portrait 600 × 1280), written ON SCREEN
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const sheet = subjectSheet(G, 'chemistry', { name: 'Vex' });
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  // the Lewis figure's box (problem 2, the left part) + where its strokes start/end in the writing order
  const lew = [1e9, 1e9, -1e9, -1e9]; let acc = 0, lewA = -1, lewB = 0;
  for (const it of sheet.items) {
    const wt = it.kind === 'p' ? it.w : 1;
    if (it.pi === 1) { const pts = it.kind === 'p' ? it.pts : [[it.x, it.y], [it.x + it.w, it.y + it.h]]; let inL = false; for (const [x, y] of pts) if (x < 480) { inL = true; lew[0] = Math.min(lew[0], x); lew[1] = Math.min(lew[1], y); lew[2] = Math.max(lew[2], x); lew[3] = Math.max(lew[3], y); } if (inL) { if (lewA < 0) lewA = acc; lewB = acc + wt; } }
    acc += wt;
  }
  // writing order: up to the Lewis figure by "lewis", the figure while "Lewis structures" is said, the rest by "included"
  const writeP = (t) => K(t, [[T.handwriting - 0.35, 0], [T.lewis - 0.05, lewA], [T.included - 0.1, lewB], [T.includedE + 0.25, sheet.total]]);
  const tileTags = ['Balance', 'Lewis', 'Molar mass', 'ICE table'];
  let scrKey = '';
  const scanPic = (g, x, y, w, h, k) => {   // the camera view of the wave (a little painting of a grey sky + a white curl over rooftops)
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#4a5260'); gr.addColorStop(1, '#8e959e'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = '#efece4'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + h * 0.42); g.quadraticCurveTo(x + w * 0.45, y + h * 0.05, x + w * 0.82, y + h * 0.26); g.quadraticCurveTo(x + w * 0.95, y + h * 0.36, x + w * 0.8, y + h * 0.44); g.quadraticCurveTo(x + w * 0.7, y + h * 0.36, x + w * 0.62, y + h * 0.5); g.lineTo(x + w, y + h); g.closePath(); g.fill();
    g.fillStyle = 'rgba(80,80,90,.35)'; for (let i = 0; i < 40; i++) g.fillRect(x + hr(i, 51) * w, y + h * 0.3 + hr(i, 52) * h * 0.6, 14, 3);
    g.fillStyle = '#5b4a6a'; for (let i = 0; i < 6; i++) g.fillRect(x + i * w / 6 + 8, y + h * 0.86, w / 6 - 16, h * 0.14);
  };
  function drawPhone(mode, k = 0, t = 0) {
    const key = `${mode}:${Math.round(k * 120)}`; if (key === scrKey && mode !== 'write') return; scrKey = key;
    const g = sg, Wd = 600, H = 1280; g.textAlign = 'left';
    const bar = () => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, Wd, 120); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 120, Wd, 3);
      g.drawImage(icon, 26, 26, 68, 68); g.fillStyle = '#1d1d1d'; g.font = '52px Georgia, serif'; g.fillText('Scribe', 108, 78);
      g.fillStyle = '#e7f2e4'; g.beginPath(); g.roundRect(Wd - 236, 38, 210, 48, 24); g.fill(); g.fillStyle = '#2f7d46'; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('Chemistry', Wd - 131, 71); g.textAlign = 'left'; };
    if (mode === 'cam' || mode === 'flash') {   // the in-app scanner pointed at the wave
      scanPic(g, 0, 0, Wd, H, k);
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, Wd, 110); g.fillStyle = '#fff'; g.font = '600 34px Inter, Arial'; g.textAlign = 'center'; g.fillText('Scan pages', Wd / 2, 70);
      g.strokeStyle = '#fff'; g.lineWidth = 9; const L = 70; for (const [x, y, sx, sy] of [[70, 230, 1, 1], [Wd - 70, 230, -1, 1], [70, 940, 1, -1], [Wd - 70, 940, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }
      g.fillStyle = 'rgba(20,20,20,.62)'; g.beginPath(); g.roundRect(Wd / 2 - 150, 1000, 300, 60, 30); g.fill(); g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.fillText('12 pages', Wd / 2, 1041);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(Wd / 2, 1160, 54, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 9; g.beginPath(); g.arc(Wd / 2, 1160, 42, 0, 7); g.stroke(); g.textAlign = 'left';
      if (mode === 'flash') { g.fillStyle = `rgba(255,255,255,${1 - k})`; g.fillRect(0, 0, Wd, H); }
    } else if (mode === 'compose') {            // Home: the question, the box, the "Scanned pages" chip, send
      g.fillStyle = CREAM; g.fillRect(0, 0, Wd, H); bar();
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '50px Georgia, serif'; g.fillText('What are we', Wd / 2, 300); g.fillText('solving today?', Wd / 2, 362);
      g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 3; g.beginPath(); g.roundRect(36, 430, Wd - 72, 470, 30); g.fill(); g.stroke();
      g.fillStyle = '#f1ece2'; g.beginPath(); g.roundRect(64, 462, Wd - 128, 150, 20); g.fill();
      scanPic(g, 84, 480, 92, 114, 0);
      g.textAlign = 'left'; g.fillStyle = '#1d1d1d'; g.font = '600 32px Inter, Arial'; g.fillText('Scanned pages', 200, 528); g.fillStyle = '#6b665c'; g.font = '500 28px Inter, Arial'; g.fillText('12 pages', 200, 572);
      g.fillStyle = '#9a958a'; g.font = '30px Inter, Arial'; g.fillText('do all of it. show work.', 70, 680);
      const press = clamp((k - 0.6) / 0.15); g.fillStyle = press > 0 ? '#7a1018' : RED; g.beginPath(); g.arc(Wd - 108, 832, 46 * (1 - 0.1 * Math.sin(PI * press)), 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(Wd - 108, 856); g.lineTo(Wd - 108, 810); g.moveTo(Wd - 128, 828); g.lineTo(Wd - 108, 808); g.lineTo(Wd - 88, 828); g.stroke();
    } else if (mode === 'solve') {              // the desk: the prompt bubble, then the paper filling as it solves
      g.fillStyle = CREAM; g.fillRect(0, 0, Wd, H); bar();
      g.fillStyle = '#e8e2d6'; g.beginPath(); g.roundRect(Wd - 330, 160, 290, 70, 26); g.fill(); g.fillStyle = '#3a362f'; g.font = '500 26px Inter, Arial'; g.textAlign = 'right'; g.fillText('12 pages · do all of it', Wd - 64, 204); g.textAlign = 'left';
      const n = Math.min(12, Math.floor(12 * k + 0.0001));
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '46px Georgia, serif'; g.fillText(n >= 12 ? 'All 12 pages solved.' : `Solving… ${n}/12`, Wd / 2, 320);
      for (let i = 0; i < 12; i++) { const cx = 56 + (i % 4) * 126, cy = 380 + Math.floor(i / 4) * 170, done = i < n;
        g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx, cy, 110, 140, 14); g.fill();
        g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 40px Inter, Arial'; g.fillText(done ? '✓' : `p.${i + 1}`, cx + 55, cy + 82);
        g.font = '500 20px Inter, Arial'; g.fillStyle = done ? '#dff3e6' : '#8a8578'; g.fillText(tileTags[i % 4], cx + 55, cy + 122); }
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 920, Wd - 100, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 920, (Wd - 100) * k, 18, 9); g.fill(); g.textAlign = 'left';
    } else {                                    // write / done: the sheet written on screen, stroke by stroke, a pen cursor on the tip
      g.fillStyle = CREAM; g.fillRect(0, 0, Wd, H); bar();
      const p = mode === 'done' ? sheet.total : writeP(t), tip = sheet.draw(p);
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '38px Georgia, serif'; g.fillText(mode === 'done' ? 'Done. 12 pages.' : 'Writing it in your handwriting…', Wd / 2, 178); g.textAlign = 'left';
      const cx = 24, cy = 206, cw = Wd - 48, ch = 840, asp = cw / ch;
      const zoom = mode === 'done' ? 0.25 : K(t, [[T.lewis - 0.5, 0], [T.lewis + 0.15, 1], [T.included - 0.15, 1], [T.included + 0.4, 0.25]]);
      const zx0 = lew[0] - 60, zx1 = lew[2] + 110, zw = zx1 - zx0, zh = zw / asp, zcy = (lew[1] + lew[3]) / 2 + 40;
      const fw = lerp(sheet.w, zw, zoom), fh = lerp(sheet.w / asp, zh, zoom), fx = lerp(0, zx0, zoom), fy = lerp(0, zcy - zh / 2, zoom);
      g.save(); g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.clip(); g.fillStyle = '#fffdf6'; g.fillRect(cx, cy, cw, ch);
      g.drawImage(sheet.canvas, fx, fy, fw, fh, cx, cy, cw, ch);
      if (mode === 'write' && p < sheet.total) {   // the on-screen pen: a nib at the stroke tip
        const px = cx + (tip[0] - fx) / fw * cw, py = cy + (tip[1] - fy) / fh * ch, wob = 2 * Math.sin(t * 40);
        g.save(); g.translate(px, py + wob); g.rotate(-0.6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(6, -84, 26, 92);
        g.fillStyle = '#2b2b33'; g.fillRect(-11, -96, 22, 70); g.fillStyle = RED; g.fillRect(-11, -112, 22, 18); g.fillStyle = '#c9c9d1'; g.beginPath(); g.moveTo(-11, -26); g.lineTo(11, -26); g.lineTo(0, 0); g.closePath(); g.fill(); g.restore();
      }
      g.restore(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.stroke();
      const prog = mode === 'done' ? 1 : p / sheet.total;
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 1080, Wd - 100, 16, 8); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 1080, (Wd - 100) * prog, 16, 8); g.fill();
      if (mode === 'done') { g.fillStyle = RED; g.beginPath(); g.roundRect(Wd / 2 - 190, 1130, 380, 84, 20); g.fill(); g.fillStyle = '#fff'; g.font = '600 34px Inter, Arial'; g.textAlign = 'center'; g.fillText('Download PDF', Wd / 2, 1184); g.textAlign = 'left'; }
      else { g.fillStyle = '#6b665c'; g.font = '500 28px Inter, Arial'; g.textAlign = 'center'; g.fillText('your handwriting · ballpoint · navy', Wd / 2, 1160); g.textAlign = 'left'; }
    }
    scrT.needsUpdate = true;
  }
  const phoneMode = (t) => {
    if (t < T.flash) return ['cam', 0];
    if (t < T.flash + 0.45) return ['flash', u01(t, T.flash, T.flash + 0.45)];
    if (t < T.scribe + 0.75) return ['compose', u01(t, T.scribe - 0.5, T.scribe + 0.75)];
    if (t < T.handwriting - 0.35) return ['solve', u01(t, T.scribe + 0.75, T.handwriting - 0.55)];
    if (t < T.includedE + 0.3) return ['write', 0];
    return ['done', 1];
  };

  // ---------------------------------------------------------------- overlay: title, words, callouts, the weather HUD, end card
  const ov = makePixelOverlay(story, { wordY: 0.72, wordS: 9, lower: true, calloutY: 0.14, calloutS: 9, calloutColor: '#ffd43b',
    title: { lines: ['WHAT IF IT', 'RAINED HOMEWORK?'], t0: 0, t1: T.drizzle - 0.05, y: 0.13, plain: true, s: 11, color: '#ffffff' },
    end: { t0: T.card, icon: '/videos/049-scribe-promo/scribe-icon.png', y: 0.6, lines: [['SCRIBE', '#ffffff', 11, -0.03], ['YOUR HOMEWORK,', '#fff4c2', 6, 0.025], ['IN YOUR HANDWRITING.', '#fff4c2', 6, 0.06], ['TRYSCRIBE.INK', '#ffd43b', 8, 0.11], ['10 FREE ASSIGNMENTS *', '#7cf05f', 5, 0.15]] } });
  const ui = document.getElementById('ui');
  const hudBox = document.createElement('div'); Object.assign(hudBox.style, { position: 'absolute', left: '40px', top: '356px', width: '420px', height: '226px', background: 'rgba(16,8,20,.55)', border: '6px solid rgba(242,230,255,.85)', boxShadow: '0 0 0 6px #160c1a', opacity: 0, pointerEvents: 'none' }); ui.appendChild(hudBox);
  const hudCache = new Map();
  const mkHud = (top, s) => { const el = document.createElement('img'); Object.assign(el.style, { position: 'absolute', left: '72px', top: `${top}px`, imageRendering: 'pixelated', opacity: 0, pointerEvents: 'none' }); el.dataset.s = s; ui.appendChild(el); return el; };
  const HUD = { time: mkHud(376, 4), num: mkHud(418, 7), lab: mkHud(486, 3), cond: mkHud(520, 4) };
  const setHud = (el, text, color) => { const k = text + color; if (el.dataset.k === k) return; el.dataset.k = k; let c = hudCache.get(k); if (!c) { const cv = pixelText(text, { color }); c = { src: cv.toDataURL(), w: cv.width, h: cv.height }; hudCache.set(k, c); } const s = +el.dataset.s; el.src = c.src; el.style.width = `${c.w * s}px`; el.style.height = `${c.h * s}px`; };
  const fmtN = (v) => (v >= 1e9 ? `${(v / 1e9).toFixed(v < 1e10 ? 1 : 0)} BILLION` : v >= 1e6 ? `${(v / 1e6).toFixed(v < 1e7 ? 1 : 0)} MILLION` : Math.round(v).toLocaleString('en-US'));
  const HUDK = [[T.drizzle, 1], [T.showers, 37], [T.noon, 52000], [T.noon + 0.8, 3.0e9], [T.tornado, 3.1e9], [T.tornado + 0.7, 3.4e9], [T.flood, 3.5e9], [T.flood + 0.8, 8.2e9], [T.wave, 8.4e9], [T.pivot, 2.2e10]];
  const COND = [[T.drizzle, '9:00 AM', 'DRIZZLE', '#7cf05f', ''], [T.showers, '10:00 AM', 'SHOWERS', '#ffe14d', ''], [T.noon, '12:00 PM', 'HEAVY RAIN', '#ffae3c', '1.3 M DEEP'],
    [T.tornado, '2:00 PM', 'TORNADO WARNING', '#ff8a3c', '1.5 M DEEP'], [T.flood, '4:00 PM', 'FLOOD WARNING', '#ff4f4f', '3.6 M DEEP'], [T.wave, '6:00 PM', 'TSUNAMI WARNING', '#ff3b3b', 'WAVE: 35 M'], [T.pivot, '6:01 PM', 'TSUNAMI WARNING', '#ff3b3b', 'WAVE: 35 M']];
  function hud(t) {
    const on = t >= T.drizzle && t < T.scribe, op = on ? clamp((t - T.drizzle) / 0.25) * clamp((T.scribe - t) / 0.2) : 0;
    hudBox.style.opacity = op; Object.values(HUD).forEach((el) => (el.style.opacity = op)); if (!on) return;
    const c = [...COND].reverse().find((x) => t >= x[0]) || COND[0];
    setHud(HUD.time, c[1], '#ffffff'); setHud(HUD.num, fmtN(GEO(t, HUDK)), '#ffffff'); setHud(HUD.lab, c[4] ? `SHEETS FALLEN  ${c[4]}` : 'SHEETS FALLEN', '#c9bfd8'); setHud(HUD.cond, c[2], c[3]);
  }
  // the forecast at the end ("0% HOMEWORK") rides the callout style, green
  const fc = (() => { const cv = pixelText(['TOMORROW:', '0% HOMEWORK'], { color: '#7cf05f', gap: 4 }), el = document.createElement('img'); el.src = cv.toDataURL(); Object.assign(el.style, { position: 'absolute', left: '540px', top: `${0.15 * 1920}px`, width: `${cv.width * 9}px`, height: `${cv.height * 9}px`, transform: 'translate(-50%, -50%)', imageRendering: 'pixelated', opacity: 0, pointerEvents: 'none' }); ui.appendChild(el); return el; })();

  // ---------------------------------------------------------------- the simulation's state over time (all pure functions of t)
  const level = (t) => K(t, [[T.noon, 1.3], [T.tornado, 1.3], [T.tornado + 1, 1.5], [T.flood, 1.5], [T.flood + 0.3, 3.6], [T.wave, 3.6], [T.wave + 1, 3.8], [T.clear + 0.4, 3.8], [T.done + 0.2, 0]]);
  const stormK = (t) => K(t, [[0, 0], [T.drizzle, 0.12], [T.showers, 0.25], [T.showersW + 0.4, 0.5], [T.noon, 0.62], [T.tornado, 0.8], [T.wave, 0.95], [T.clear + 0.3, 1], [T.done, 0]]);
  const sunK = (t) => K(t, [[T.clear + 0.3, 0], [T.done + 0.3, 0.55], [T.end, 1]]);
  const deskX = (t) => OX + K(t, [[T.flood, 34], [T.wave, 9], [T.pivot, 4], [T.clear, 2.5]]);
  const deskY = (t) => level(t) - 0.5 + 0.05 * Math.sin(t * 2.1);
  const waveX = (t) => deskX(t) + K(t, [[T.wave, 75], [T.big, 50], [T.pivot, 42], [T.scribe, 34], [T.clear, 31]]);
  const waveH = (t) => K(t, [[T.wave, 20], [T.big, 31], [T.pivot, 35]]);
  const twX = (t) => OX + K(t, [[T.tornado, 78], [T.made, 46], [T.flood, 30]]);
  const VB = { x: 0, z: 6, rotY: PI };   // her mark on the beach: the sea + huts behind her, the camera looks +z

  // ---------------------------------------------------------------- shots
  const top = (o) => ({ ...o, rotY: PI });
  const SH = [
    // HOOK — the sunny beach; one sheet drifts down
    { id: 'hook', t0: 0, set: 'beach', vex: (t) => ({ ...VB, pose: 'hip', tilt: 0.1, sway: 0.15, nod: t > T.actually ? -0.35 : 0, look: t > T.actually ? [0, 0.8] : [0, 0], face: CONF(t) }), cam: (t) => ({ pos: [0.15, 1.42, 4.1 + 0.3 * u01(t, 0, T.drizzle)], look: [0, 1.3, 6], fov: 45 }) },
    // DRIZZLE — a light drizzle (9 AM), then one lands on her head
    { id: 'drizzle', t0: T.drizzle, set: 'beach', rain: 45, vex: (t) => ({ ...VB, pose: 'shrug', nod: -0.25, look: [0, 0.6], tilt: -0.08, sway: 0.1, face: CONF(t, { surprised: 0.15 }) }), p: [[-0.75, 1.55, 3.55], [-0.6, 1.52, 3.75]], a: [[0, 1.18, 6.1], [0, 1.2, 6.1]], fov: 47 },
    { id: 'cute', t0: T.one - 0.35, set: 'beach', rain: 40, vex: (t) => ({ ...VB, pose: t > T.cute - 0.1 ? 'hip' : 'rest', nod: t > T.land + 0.2 ? -0.2 : 0, look: t > T.land ? [0.1, 0.9] : [0, 0.3], tilt: 0.12, sway: 0.12, face: CONF(t, { relaxed: t > T.cute ? 0.3 : 0.1, angry: t > T.cute ? 0.25 : 0.12 }) }), cam: (t) => ({ pos: [0.12, 1.6, 4.6 + 0.1 * u01(t, T.one, T.showers)], look: [0, 1.4, 6], fov: 44 }) },
    // SHOWERS — the umbrella pops open, sheets pile on, it flips inside out
    { id: 'showers', t0: T.showers, set: 'beach', rain: 700, umb: 1, vex: (t) => ({ ...VB, pose: t > T.showersW - 0.25 ? 'umbrella' : 'rest', tilt: 0.05, sway: 0.08, nod: -0.1, look: [0, 0.5], face: CONF(t, { relaxed: 0.2 }) }), p: [[0.9, 1.45, 3.2], [0.75, 1.5, 3.45]], a: [[0, 1.45, 6], [0, 1.5, 6]], fov: 47 },
    { id: 'notHelping', t0: T.umbrella - 0.2, set: 'beach', rain: 900, umb: 1, dump: 1, vex: (t) => ({ ...VB, pose: 'umbrella', tilt: -0.1, sway: 0.06, nod: t > T.flip ? 0.12 : -0.15, face: CONF(t, { angry: t > T.flip ? 0.45 : 0.15, relaxed: t > T.flip ? 0.25 : 0.1, blink: t > T.flip && t < T.flip + 0.25 ? 1 : lids(t) }) }), cam: (t) => ({ pos: [-0.75, 1.3, 3.55], look: [0.05, 1.55, 6], fov: 50 }) },
    // NOON — the town, buried 1.3 m deep; she stands on her car's roof
    { id: 'noon', t0: T.noon, set: 'town', rain: 1500, vex: (t) => ({ x: CX, z: CZ, y: ROOF, rotY: -PI * 0.78, pose: 'cross', tilt: 0.08, sway: 0.12, face: CONF(t, { relaxed: 0.25 }) }), p: [[CX - 4.6, 3.0, CZ - 3.6], [CX - 4.1, 2.95, CZ - 3.3]], a: [[CX + 1.5, 2.45, CZ + 0.9], [CX + 1.5, 2.5, CZ + 0.9]], fov: 48 },
    { id: 'chem', t0: T.buried - 0.15, set: 'town', rain: 1100, held: 1, vex: (t) => top({ x: CX, z: CZ, y: ROOF, pose: 'sheet', hands: { R: 'hold' }, tilt: -0.1, sway: 0.08, face: CONF(t, { angry: 0.3, relaxed: 0.3 }) }), cam: (t) => ({ pos: [CX + 0.5, ROOF + 1.28, CZ - 1.7 + 0.1 * u01(t, T.buried, T.tornado)], look: [CX + 0.24, ROOF + 1.2, CZ], fov: 44 }) },
    // TORNADO (2 PM) — a funnel of essays down the street
    { id: 'tornado', t0: T.tornado, set: 'town', rain: 900, wind: 6, vex: (t) => ({ x: CX, z: CZ, y: ROOF, rotY: PI / 2 - 0.35, pose: 'shades', tilt: 0.1, sway: 0.2, turn: -0.4, face: CONF(t) }), cam: (t) => ({ pos: [CX - 6.5, 2.4, CZ - 2.8], look: [CX + 18, 9.5, CZ + 4.6], fov: 52 }) },
    { id: 'essays', t0: T.made - 0.1, set: 'town', rain: 1600, wind: 14, vex: (t) => ({ x: CX, z: CZ, y: ROOF, rotY: -PI / 2, pose: 'cross', tilt: -0.12, sway: 0.25, face: CONF(t, { relaxed: 0.35, angry: 0.2 }) }), cam: (t) => ({ pos: [CX - 1.95, ROOF + 1.32, CZ + 0.15], look: [CX, ROOF + 1.5, CZ - 0.05], fov: 46 }) },
    // FLOOD (4 PM) — the town under 3.6 m of paper; she surfs a desk
    { id: 'flood', t0: T.flood, set: 'town', rain: 1200, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: -PI / 2, pose: 'surf', lean: 0.15, tilt: 0.15, sway: 0.1, face: CONF(t) }), cam: (t) => ({ pos: [deskX(t) - 6.2, level(t) + 6.4 - 1.0 * u01(t, T.flood, T.underwater + 0.55), CZ - 6.4], look: [deskX(t) + 0.8, level(t) + 0.9, CZ + 0.8], fov: 52 }) },
    { id: 'surf', t0: T.underwater + 0.55, set: 'town', rain: 1200, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: -PI / 2 - 0.25, pose: 'surf', lean: 0.2, tilt: -0.18 + 0.1 * Math.sin(t * 2), sway: 0.15, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => ({ pos: [deskX(t) - 3.4, deskY(t) + 2.2, CZ - 1.2], look: [deskX(t), deskY(t) + 1.65, CZ], fov: 48 }) },
    // TSUNAMI (6 PM) — the wave rises behind her
    { id: 'wave', t0: T.wave, set: 'town', rain: 900, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: -PI / 2, pose: 'surf', lean: 0.1, tilt: 0.1, turn: t > T.wave + 0.7 ? -0.9 : 0, sway: 0.1, face: CONF(t, { surprised: t > T.wave + 0.9 ? 0.35 : 0 }) }), cam: (t) => ({ pos: [deskX(t) - 3.6, deskY(t) + 1.25, CZ + 0.7], look: [deskX(t) + 10, deskY(t) + 6 + 2.5 * u01(t, T.wave, T.big), CZ], fov: 58 }) },
    { id: 'bigone', t0: T.big - 0.05, set: 'town', rain: 700, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: PI / 2 - 0.5, pose: 'look', tilt: 0.05, sway: 0.05, face: CONF(t, { surprised: 0.4 }) }), cam: (t) => ({ pos: [deskX(t) - 9 - 1.2 * u01(t, T.big, T.pivot), level(t) + 1.5, CZ - 7.6], look: [deskX(t) + 14, level(t) + 11, CZ + 5], fov: 60 }) },
    // PIVOT — "Relax, babe. I don't panic. I scan."
    { id: 'relax', t0: T.pivot, set: 'town', rain: 600, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: -PI / 2, pose: t > T.babe - 0.1 ? 'peace' : 'hip', tilt: -0.14, sway: 0.15, face: CONF(t, { relaxed: 0.25, blinkLeft: t > T.babe + 0.1 && t < T.babe + 0.55 ? 1 : 0 }) }), cam: (t) => ({ pos: [deskX(t) - 1.5, deskY(t) + DESK_TOP + 1.52, CZ - 0.25], look: [deskX(t), deskY(t) + DESK_TOP + 1.42, CZ], fov: 46 }) },
    { id: 'scan', t0: T.dont - 0.1, set: 'town', rain: 600, deskOn: 1, phone: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: PI / 2, pose: 'photo', hands: { R: 'hold' }, tilt: 0.05, sway: 0.08, face: CONF(t) }), cam: () => { const e = eyeW(), ph = phone.position; return { pos: [e.x - 0.5, e.y + 0.12, e.z + 0.3], look: [ph.x + 0.5, ph.y + 0.06, ph.z - 0.02], fov: 46 }; } },
    // SCRIBE — the app on her phone, close (crisp: pixel block 1)
    { id: 'app', t0: T.scribe, set: 'town', rain: 300, deskOn: 1, phone: 1, screen: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: deskY(t) + DESK_TOP, rotY: PI / 2, pose: 'photo', hands: { R: 'hold' }, tilt: 0.05, sway: 0.04, face: CONF(t) }) },
    // CLEAR — it only rains when it's not done: everything flies back up
    { id: 'clear', t0: T.clear, set: 'town', rain: 1400, up: 1, deskOn: 1, vex: (t) => ({ x: deskX(t), z: CZ, y: Math.max(0, deskY(t)) + DESK_TOP, rotY: -PI / 2 - 0.35, pose: t > T.done - 0.1 ? 'peace' : 'hip', tilt: 0.1, sway: 0.15, face: CONF(t, { relaxed: 0.2 }) }), cam: (t) => { const y0 = Math.max(0, deskY(t)) + DESK_TOP, u = u01(t, T.clear, T.end); return { pos: [deskX(t) - 3.4, y0 + 1.35, CZ - 1.5], look: [deskX(t) + 3, y0 + 2.4 + 1.6 * u, CZ + 0.6], fov: 54 }; } },
    // END — the beach at sunset: "Tomorrow's forecast? Zero percent homework." → wink → card
    { id: 'forecast', t0: T.end, set: 'beach', vex: (t) => ({ ...VB, pose: t > T.zero - 0.2 ? 'point' : 'hip', tilt: -0.1, sway: 0.15, turn: t > T.zero - 0.2 ? 0.25 : 0, face: CONF(t) }), p: [[0.4, 1.42, 3.7], [0.3, 1.45, 3.95]], a: [[-0.15, 1.2, 6], [-0.15, 1.22, 6]], fov: 46 },
    { id: 'wink', t0: T.youre - 0.15, set: 'beach', vex: (t) => ({ ...VB, pose: 'hairflip', tilt: -0.14, sway: 0.15, face: CONF(t, { relaxed: 0.2, blinkLeft: t > T.welcomeE - 0.35 && t < T.welcomeE + 0.6 ? 1 : 0 }) }), cam: (t) => { const k = u01(t, T.youre, T.card + 1.5); return { pos: [0.08, 1.5, 4.8 + 0.25 * ease(k)], look: [0, 1.42, 6], fov: 44 }; } },
  ];
  SH.forEach((s2, i) => (s2.t1 = SH[i + 1]?.t0 ?? story.duration));
  const CUTS = SH.slice(1).map((s2) => s2.t0);
  window.EDSTUDIO_CUTS = CUTS;

  const scrP = V(), scrQ = new THREE.Quaternion(), scrN = V(), scrU = V();
  const screenCam = (d, drop = 0.026) => { screen.updateWorldMatrix(true, false); screen.getWorldPosition(scrP); screen.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.clone().addScaledVector(scrU, -drop).toArray(), fov: 40, up: scrU.clone() }; };
  const camP = V();

  // ---------------------------------------------------------------- lineup (t ≥ 200): her props on the hand bones, close
  const LINE = [
    { pose: 'umbrella', umb: [1, 0], az: 0 }, { pose: 'umbrella', umb: [1, 0], az: 1.4 }, { pose: 'umbrella', umb: [1, 1], az: 0.4 },
    { pose: 'photo', phone: 1, az: 0.6 }, { pose: 'photo', phone: 1, az: 2.4 }, { pose: 'sheet', held: 1, az: 0 }, { pose: 'sheet', held: 1, az: 1.3 },
    { pose: 'surf', az: 0.3 }, { pose: 'look', az: 0.2 }, { pose: 'hip', head: 1, az: 0.3 },
  ];

  function update(t) {
    if (t >= 200) return lineup(t);
    const sh = SH.find((s2) => t >= s2.t0 && t < s2.t1) || SH[SH.length - 1];
    const k = u01(t, sh.t0, sh.t1);
    useSet(sh.set);
    const sk = stormK(t), sun = sh.set === 'beach' && t >= T.end ? 1 : sunK(t);
    storm(sh.set, sk, sun);
    const lv = sh.set === 'town' ? level(t) : 0;
    setSea(lv, t, sh.id === 'clear' ? 0.05 : 0.12);
    // Vex
    VEX.root.visible = !!sh.vex;
    let v = null;
    if (sh.vex) { v = glide(sh.vex, t, sh.vex(t)); VEX.update(t, { ...lips(t), ...v, face: { ...(v.face || {}) }, y: v.y ?? 0, rotY: v.rotY ?? 0 }); VEX.root.updateMatrixWorld(true); }
    GM.shades.visible = true; VEX.H.head.scale.setScalar(sh.screen ? 0.001 : 1);
    // props: car, desk, umbrella, phone, sheets
    myCar.visible = sh.set === 'town';
    desk.visible = !!sh.deskOn; if (sh.deskOn) { const dx = deskX(t); desk.position.set(dx, Math.max(0, deskY(t)), CZ); desk.rotation.set(0.04 * Math.sin(t * 1.7), PI / 2, 0.05 * Math.sin(t * 2.3)); }
    setUmbrella(t, !!sh.umb && t > T.showersW - 0.25, u01(t, T.pop, T.pop + 0.22), u01(t, T.flip, T.flip + 0.14));
    heldSheet.visible = !!sh.held;
    phone.visible = !!sh.phone;
    if (sh.phone) { const g = gripR(), eye = eyeW(); phone.position.copy(g).addScaledVector(V().subVectors(eye, g).normalize(), 0.012).add(V(0, 0.035, 0)); phone.lookAt(eye); const [m, kk] = phoneMode(t); drawPhone(m, kk, t); flashL.intensity = m === 'flash' ? 4 * (1 - kk) : 0; }
    // the first sheet: falls, lands on her head, stays there (until the town)
    const headOn = sh.set === 'beach' && t >= T.land && t < T.noon;
    headSheet.visible = headOn; headSheetG.updateMatrixWorld(true);
    fallSheet.visible = sh.set === 'beach' && t >= T.actually - 0.6 && t < T.land;
    if (fallSheet.visible) { const tgt = headSheet.getWorldPosition(V()), u = u01(t, T.actually - 0.6, T.land), drift = (1 - u) * 1.2;
      fallSheet.position.set(tgt.x + drift * Math.sin(t * 2.2) * 0.8, tgt.y + (1 - u) * 3.2, tgt.z - drift * 0.3); fallSheet.rotation.set(-PI / 2 + 0.6 * Math.sin(t * 3.1) * (1 - u) + 0.42 * u, t * 1.4 * (1 - u), 0.5 * Math.cos(t * 2.6) * (1 - u)); }
    // camera
    let cam;
    if (sh.screen) { cam = screenCam(0.39 - 0.02 * k); }
    else if (sh.cam) cam = sh.cam(t);
    else cam = { pos: lerp3(sh.p[0], sh.p[1], ease(k)), look: lerp3(sh.a[0], sh.a[1], ease(k)), fov: sh.fov };
    studio.camera.up.copy(cam.up || V(0, 1, 0));
    studio.setCamera(cam.pos, cam.look, cam.fov, 0, 0);
    camP.copy(studio.camera.position);
    if (sh.held) { const g = gripR(); heldSheet.position.copy(g).add(V(0, 0.07, 0)); heldSheet.lookAt(camP.clone().setY(heldSheet.position.y + 0.2)); }
    if (sh.set === 'beach') { const dir = V(...cam.look).sub(camP).normalize(); BE.setSun(camP, dir.add(V(-0.3, sun > 0.5 ? 0.05 : 0.32, 0))); }
    { const d = Math.max(0.6, camP.distanceTo(V(...cam.look))); fill.position.copy(camP).add(V(0, 0.15, 0)); fill.intensity = sh.screen ? 0.55 : sh.vex ? Math.min(1.8, (0.24 + 0.2 * sk) * Math.pow(d, 1.6)) : 0.1; }
    // shadows where the action is
    if (sh.set === 'town') { TW.update(t); TW.world.aim((v ? v.x : CX) - OX, CZ, sh.id === 'flood' || sh.id === 'bigone' || sh.id === 'clear' ? 60 : 24); }
    // the weather: rain (down, or back up at the clear), litter on the beach, the twister, the wave
    const fwd = V(...cam.look).sub(camP).setY(0).normalize(), rc = sh.rain || 0, center = sh.set === 'beach' ? [0, 5, 6] : [camP.x + fwd.x * 12, lv + 7, camP.z + fwd.z * 12];
    const up = sh.up ? clamp(u01(t, T.clear + 0.2, T.rains + 0.6)) : 0;
    const dumpK = sh.dump && t > T.flip ? u01(t, T.flip, T.flip + 0.25) : 0;
    if (dumpK > 0) rain.update(t, { n: Math.round(170 * (1 - 0.6 * u01(t, T.flip + 0.3, T.noon))), c: [0.05, 2.1, 6.25], w: 1.5, h: 2.4, d: 0.8, v: 2.6, dir: 1, cam: camP, near: 1.4, floor: 0 });
    else rain.update(t, { n: sh.up ? Math.round(rc * (1 - u01(t, T.done, T.end))) : rc, c: center, w: sh.set === 'beach' ? 14 : 34, h: sh.set === 'beach' ? 10 : 18, d: sh.set === 'beach' ? 14 : 34, v: sh.wind ? 3.2 : 2.0, wind: [sh.wind ? -sh.wind : 0.3, sh.wind ? sh.wind * 0.3 : 0], dir: up > 0.3 ? -1 : 1, scale: sh.set === 'beach' ? 1 : 1.3, cam: camP, near: 0.75, floor: lv - 0.2, gust: sh.wind ? 1 : 0 });
    const litN = sh.set === 'beach' ? Math.round(K(t, [[T.drizzle, 0], [T.showers, 30], [T.noon - 1, 520]])) : sh.set === 'town' && lv > 0.05 ? 1400 : 0;
    litter.update(t >= T.end ? 0 : litN, sh.set === 'beach' ? [0, 0, 6.2] : [camP.x + 8, 0, camP.z + 6], sh.set === 'beach' ? 4.5 : 16, sh.set === 'beach' ? 0.015 : lv + 0.02, { lift: sh.set === 'beach' ? 0.06 * u01(t, T.showers, T.noon) : 0.05, bob: sh.set === 'town' ? 0.03 : 0, t });
    setTwister(t, twX(t), 1.5, sh.set === 'town' && t >= T.tornado && t < T.flood ? 1 : 0);
    const wk = sh.set === 'town' && t >= T.wave ? 1 : 0, wUp = t >= T.clear ? u01(t, T.clear + 0.3, T.done + 0.3) : 0;
    setWave(t, waveX(t), waveH(t), wk * (1 - u01(t, T.done, T.done + 0.4)), wUp);
    // the overlay layer
    ov.update(t); hud(t);
    fc.style.opacity = t >= T.zero - 0.05 && t < T.card ? 1 : 0;
    pixel.set(Math.max(sh.screen ? 1 : PIXEL, sh.screen ? 1 : mosaicAt(t, CUTS)));
  }

  function lineup(t) {
    const i = Math.floor(t - 200), L = LINE[i % LINE.length];
    document.getElementById('ui').style.display = 'none';
    useSet('beach'); storm('beach', 0, 0); rain.update(t, { n: 0 }); litter.update(0, [0, 0, 0], 1, 0); setTwister(t, 0, 0, 0); setWave(t, 0, 1, 0); setSea(0, t, 0);
    VEX.root.visible = true; myCar.visible = false; desk.visible = false; fallSheet.visible = false;
    VEX.update(5, { x: 0, z: 6, rotY: PI, pose: L.pose, ...glide(() => ({ pose: L.pose }), 5, { pose: L.pose }), face: CONF(5) }); VEX.root.updateMatrixWorld(true);
    setUmbrella(5, !!L.umb, L.umb ? L.umb[0] : 0, L.umb ? L.umb[1] : 0);
    headSheet.visible = !!L.head; headSheetG.updateMatrixWorld(true);
    const ang = PI + L.az, R0 = L.umb ? 2.6 : 1.5, cy = L.umb ? 1.45 : 1.3;
    const pos = [Math.sin(ang) * R0, cy + 0.1, 6 + Math.cos(ang) * R0];
    studio.camera.up.set(0, 1, 0); studio.setCamera(pos, [0, cy, 6], 40, 0, 0);
    heldSheet.visible = !!L.held; if (L.held) { const g = gripR(); heldSheet.position.copy(g).add(V(0, 0.13, 0)); heldSheet.lookAt(studio.camera.position.clone().setY(heldSheet.position.y + 0.2)); }
    phone.visible = !!L.phone; if (L.phone) { const g = gripR(), eye = eyeW(); phone.position.copy(g).addScaledVector(V().subVectors(eye, g).normalize(), 0.012).add(V(0, 0.035, 0)); phone.lookAt(eye); drawPhone('compose', 0.3, 0); }
    fill.position.copy(studio.camera.position); fill.intensity = 0.6;
    pixel.set(1);
  }
  update(0);
  return { update };
}
