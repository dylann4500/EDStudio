// Goth anime tutor ("cheat mommy") for the Scribe pixel-art reels: a procedural, cel-shaded, outlined adult anime woman (~1.75 m,
// ~7 heads tall) built from lathes/spheres — no downloaded model. Pairs with engine/pixel.js (the pixel post pass) + pixeltex.toonRamp.
//   const v = makeGoth(); scene.add(v.root); v.set({ x, z, rotY, armR: { x: -1.2, z: 0.3, el: 0.6 }, eyes: 'wink', mouth: 'smirk', t });
// Look: jet-black hime cut (blunt bangs, chin sidelocks, waist-length back) with a Scribe-red under-layer, red irises + winged liner,
// plum lips, a black corset top with red lacing, a red/black tartan pleated mini, thigh-high stockings, platform boots, striped arm
// warmers, a choker with a red pen-nib charm (Scribe's logo nib). Feet at y = 0, facing +z.
// Pose fields (all optional): x, y, z, rotY, scale, sway (hip roll), twist (torso yaw), lean (torso pitch), bend (torso roll),
// head {x nod, y turn, z tilt}, armL/armR {x forward(−)/back(+), z out(+), y twist, el elbow bend(+)}, handL/handR 'relax' | 'fist' |
// 'point' | 'peace' | 'open' | 'hold', legL/legR {x, z, kn}, eyes 'open'|'half'|'closed'|'wink'|'winkR'|'wide'|'roll'|'side',
// look [dx, dy], brows -1 (angry) … +1 (raised), mouth 'smirk'|'smile'|'talk'|'open'|'tongue'|'flat'|'pout'|'o', talk 0..1 (lip flap), t.
import * as THREE from 'three';
import { toonRamp } from './pixeltex.js';

const PI = Math.PI, TAU = PI * 2;
const C = {
  skin: 0xf6ddd2, skinShade: 0xe9c3b8, hair: 0x17141d, hairHi: 0x2c2638, red: 0x9a1c25, red2: 0xc42a35, black: 0x16151a, black2: 0x2a2730,
  plum: 0x4a1424, silver: 0xc9ccd6, boot: 0x141317, lace: 0x2b0b10, white: 0xffffff,
};
let RAMP = null;
const ramp = () => (RAMP ??= toonRamp([0.5, 0.58, 0.72, 0.9, 1, 1, 1, 1]));
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp(), ...extra });
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

// ---------------------------------------------------------------- the anime ink line (inverted hull pushed out along the normals)
const OUTLINE = new THREE.ShaderMaterial({
  uniforms: { uW: { value: 0.0045 }, uCol: { value: new THREE.Color(0x0b0a0e) } }, side: THREE.BackSide,
  vertexShader: 'uniform float uW; void main(){ vec3 p = position + normalize(normal) * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
  fragmentShader: 'uniform vec3 uCol; void main(){ gl_FragColor = vec4(uCol, 1.0); }',
});
function part(geo, mat, parent, x = 0, y = 0, z = 0, { outline = true, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m);
  if (outline) { const o = new THREE.Mesh(geo, OUTLINE); o.castShadow = false; m.add(o); }
  return m;
}
/** A tapered capsule along −y: top joint at y = 0, length `len` to the bottom joint, radii r0 (top) → r1 (bottom), optional bulge. */
function taper(len, r0, r1, { bulge = 0, at = 0.35, seg = 18 } = {}) {
  const pts = [], N = 14;
  for (let i = 0; i <= 6; i++) { const a = -PI / 2 + (i / 6) * (PI / 2); pts.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * r1), -len + Math.sin(a) * r1)); }
  for (let i = 1; i < N; i++) { const u = i / N, y = -len + u * len, r = r1 + (r0 - r1) * u + bulge * Math.exp(-((1 - u - at) ** 2) / 0.02); pts.push(new THREE.Vector2(r, y)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (PI / 2); pts.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * r0), Math.sin(a) * r0)); }
  const g = new THREE.LatheGeometry(pts, seg); g.computeVertexNormals(); return g;
}
/** Lathe with an elliptical cross-section (z scaled) and optional pleats: prof = [[y, r], …] bottom → top. */
function body(prof, { zs = 0.7, seg = 40, pleats = 0, pleatAmp = 0, phi0 = PI } = {}) {
  const pts = prof.map(([y, r]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, seg, phi0, TAU), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), z = P.getZ(i); const y = P.getY(i);
    if (pleats) { const a = Math.atan2(x, z), k = 1 + pleatAmp * Math.abs(Math.sin(a * pleats / 2)) * ((prof[prof.length - 1][0] - y) / (prof[prof.length - 1][0] - prof[0][0])); x *= k; z *= k; }
    P.setXYZ(i, x, y, z * zs);
  }
  g.computeVertexNormals(); return g;
}

// ---------------------------------------------------------------- textures
const corsetTex = () => canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = '#16151a'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.2)'; g.fillRect((k * w) / 9, 0, 3, h); }   // boning
  const cx = w * 0.5;   // the front (lathe phiStart π puts u = 0.5 at +z)
  g.strokeStyle = '#c42a35'; g.lineWidth = 7;
  for (let y = 18; y < h - 10; y += 24) { g.beginPath(); g.moveTo(cx - 20, y); g.lineTo(cx + 20, y + 20); g.moveTo(cx + 20, y); g.lineTo(cx - 20, y + 20); g.stroke(); }
  g.fillStyle = '#9aa0ad'; for (let y = 18; y < h - 4; y += 24) for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 22, y, 4, 0, TAU); g.fill(); }
  g.fillStyle = '#9a1c25'; g.fillRect(0, h - 14, w, 14); g.fillRect(0, 0, w, 8);   // red piping
});
const tartanTex = () => { const t = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#7d1520'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(10,8,12,.62)'; for (const x of [40, 168]) { g.fillRect(x, 0, 52, h); g.fillRect(0, x, w, 52); }
  g.fillStyle = 'rgba(10,8,12,.35)'; for (const x of [0, 128]) { g.fillRect(x + 10, 0, 14, h); g.fillRect(0, x + 10, w, 14); }
  g.fillStyle = 'rgba(255,90,100,.35)'; for (const x of [110, 238]) { g.fillRect(x, 0, 4, h); g.fillRect(0, x, w, 4); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 1.4); return t; };
const stripeTex = () => { const t = canvasTex(64, 128, (g, w, h) => { for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#16151a' : '#9a1c25'; g.fillRect(0, (k * h) / 8, w, h / 8 + 1); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const hairTex = () => { const t = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#17141d'; g.fillRect(0, 0, w, h);
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${70 + r() * 40},${60 + r() * 40},${100 + r() * 50},${0.18 + r() * 0.2})`; g.lineWidth = 1 + r() * 2.5; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + (r() - 0.5) * 20, h / 2, x + (r() - 0.5) * 12, h); g.stroke(); }
  const gr = g.createLinearGradient(0, h * 0.12, 0, h * 0.3); gr.addColorStop(0, 'rgba(120,110,170,0)'); gr.addColorStop(0.5, 'rgba(120,110,170,.28)'); gr.addColorStop(1, 'rgba(120,110,170,0)'); g.fillStyle = gr; g.fillRect(0, h * 0.12, w, h * 0.18);   // the anime "angel ring" sheen
}); t.wrapS = THREE.RepeatWrapping; return t; };

// ---------------------------------------------------------------- the face (a sphere patch over the front of the head, redrawn per expression)
const FW = 1024, FH = 600, PHI = 2.3, TH0 = 0.3 * PI, TH1 = 0.78 * PI;   // patch: ±66° around +z, from 54° to 140° below the crown
const fx = (deg) => FW / 2 + (deg / (PHI * 180 / PI)) * FW, fy = (deg) => ((deg - TH0 * 180 / PI) / ((TH1 - TH0) * 180 / PI)) * FH;
function drawFace(g, o) {
  g.clearRect(0, 0, FW, FH);
  g.fillStyle = 'rgba(70,40,90,.22)'; g.fillRect(0, 0, FW, fy(84));   // the bangs' shadow on the forehead
  const sh = g.createLinearGradient(0, fy(84), 0, fy(90)); sh.addColorStop(0, 'rgba(70,40,90,.22)'); sh.addColorStop(1, 'rgba(70,40,90,0)'); g.fillStyle = sh; g.fillRect(0, fy(84), FW, fy(90) - fy(84));
  for (const sd of [-1, 1]) { const bl = g.createRadialGradient(fx(sd * 31), fy(110), 2, fx(sd * 31), fy(110), 60); bl.addColorStop(0, 'rgba(235,120,140,.35)'); bl.addColorStop(1, 'rgba(235,120,140,0)'); g.fillStyle = bl; g.beginPath(); g.ellipse(fx(sd * 31), fy(110), 70, 34, 0, 0, TAU); g.fill(); }
  const eyeY = fy(98), eyeDX = 22;   // eyes centred 23° either side of the nose line
  const [lx, ly] = o.look || [0, 0];
  for (const side of [-1, 1]) {
    const cx = fx(side * eyeDX), cy = eyeY, ew = 86, eh = 74;
    const state = side < 0 ? (o.eyes === 'wink' ? 'closed' : o.eyes) : (o.eyes === 'winkR' ? 'closed' : o.eyes);
    // shadow + liner wing
    g.fillStyle = 'rgba(60,20,50,.28)'; g.beginPath(); g.ellipse(cx, cy - 18, ew * 1.05, eh * 0.75, 0, PI, TAU); g.fill();
    if (state === 'closed') {
      g.strokeStyle = '#0d0b10'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - ew * 0.95, cy + 2); g.quadraticCurveTo(cx, cy + 26, cx + ew * 0.95, cy + 2); g.stroke();
      g.beginPath(); g.moveTo(cx + side * ew * 0.9, cy + 4); g.lineTo(cx + side * ew * 1.32, cy - 18); g.stroke();
    } else {
      const lid = state === 'half' ? 0.48 : state === 'wide' ? -0.12 : state === 'roll' ? 0.3 : 0.06;
      g.save(); g.beginPath(); g.ellipse(cx, cy, ew, eh * (1 - Math.max(0, lid) * 0.5), 0, 0, TAU); g.clip();
      g.fillStyle = '#fbf6f7'; g.fillRect(cx - ew, cy - eh, ew * 2, eh * 2);
      const ix = cx + (state === 'side' ? side * 0 + 30 : lx * 26), iy = cy + (state === 'roll' ? -eh * 0.85 : ly * -18) + 6, ir = 52;
      const gr = g.createLinearGradient(0, iy - ir, 0, iy + ir); gr.addColorStop(0, '#3a050c'); gr.addColorStop(0.55, '#9a1c25'); gr.addColorStop(1, '#ff5866');
      g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, ir * 0.78, ir, 0, 0, TAU); g.fill();
      g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(ix, iy + 4, ir * 0.3, ir * 0.48, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(ix - 16, iy - 22, 13, 16, -0.4, 0, TAU); g.fill();
      g.beginPath(); g.arc(ix + 14, iy + 20, 6, 0, TAU); g.fill();
      if (lid > 0) { g.fillStyle = '#f6ddd2'; g.fillRect(cx - ew, cy - eh, ew * 2, eh * 2 * lid * 0.62); }   // the lid comes down
      g.restore();
      // upper lash line + the cat-eye wing, lower lash
      const top = cy - eh * (1 - Math.max(0, lid) * 1.25) + 6;
      g.strokeStyle = '#0d0b10'; g.lineCap = 'round'; g.lineWidth = 15;
      g.beginPath(); g.moveTo(cx - side * ew * 0.95, cy + 6); g.quadraticCurveTo(cx - side * 10, top - 16, cx + side * ew * 1.0, cy - eh * 0.3 + (lid > 0 ? 20 : 0)); g.lineTo(cx + side * ew * 1.42, cy - eh * 0.62); g.stroke();
      for (let k = 0; k < 3; k++) { g.lineWidth = 6; g.beginPath(); g.moveTo(cx + side * (ew * 0.55 + k * 14), top + 8 + k * 6); g.lineTo(cx + side * (ew * 0.75 + k * 22), top - 14 + k * 6); g.stroke(); }
      g.lineWidth = 4; g.strokeStyle = 'rgba(30,10,25,.85)'; g.beginPath(); g.moveTo(cx - ew * 0.75, cy + eh * 0.82); g.quadraticCurveTo(cx, cy + eh * 1.05, cx + side * ew * 0.95, cy + eh * 0.55); g.stroke();
    }
    // brow: thin, arched; brows −1 angry (inner end down), +1 raised
    const b = o.brows ?? 0, by = fy(80) - b * 14 - (o.eyes === 'wide' ? 12 : 0);
    g.strokeStyle = '#141018'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - side * 64, by + 10 + (b < 0 ? 22 : 0) * -b); g.quadraticCurveTo(cx + side * 10, by - 22, cx + side * 82, by + 6); g.stroke();
  }
  // beauty mark, nose, mouth
  g.fillStyle = '#2a1018'; g.beginPath(); g.arc(fx(30), fy(112), 5, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(150,80,80,.75)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx(1.5), fy(110)); g.lineTo(fx(-1.5), fy(114)); g.stroke();
  const mx = fx(0), my = fy(124), m = o.mouth || 'smirk', talk = o.talk ?? 0;
  const lip = '#4a1424', inner = '#2a070f';
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (m === 'smirk' || m === 'flat' || m === 'pout' || (m === 'talk' && talk < 0.15)) {
    g.fillStyle = '#5a1628'; g.beginPath(); g.moveTo(mx - 40, my + 2); g.quadraticCurveTo(mx - 14, my - 12, mx, my - 4); g.quadraticCurveTo(mx + 14, my - 12, mx + 42, my - 8); g.quadraticCurveTo(mx + 6, my + 24, mx - 40, my + 2); g.fill();   // plum lips
    g.strokeStyle = lip; g.lineWidth = 10; g.beginPath();
    if (m === 'smirk' || m === 'talk') { g.moveTo(mx - 42, my + 3); g.quadraticCurveTo(mx, my + 10, mx + 46, my - 12); }
    else if (m === 'pout') { g.moveTo(mx - 24, my + 2); g.quadraticCurveTo(mx, my - 8, mx + 24, my + 2); }
    else { g.moveTo(mx - 38, my + 2); g.lineTo(mx + 38, my + 2); }
    g.stroke();
    g.fillStyle = 'rgba(255,200,220,.35)'; g.beginPath(); g.ellipse(mx - 6, my + 9, 10, 3, 0, 0, TAU); g.fill();   // a gloss highlight
  } else {
    const open = m === 'o' ? 0.9 : m === 'open' ? 1 : m === 'tongue' ? 0.8 : m === 'smile' ? 0.55 : 0.25 + 0.75 * talk, wdt = m === 'o' ? 26 : 48, hgt = 10 + 36 * open;
    g.fillStyle = inner; g.beginPath();
    if (m === 'smile') { g.moveTo(mx - 52, my - 6); g.quadraticCurveTo(mx, my + 8, mx + 52, my - 6); g.quadraticCurveTo(mx, my + 52, mx - 52, my - 6); }
    else g.ellipse(mx, my + hgt * 0.35, wdt, hgt * 0.6, 0, 0, TAU);
    g.fill();
    if (m === 'smile' || m === 'open' || m === 'talk') { g.fillStyle = '#fff'; g.fillRect(mx - wdt * 0.7, my - 6, wdt * 1.4, 9); }
    if (m === 'tongue') { g.fillStyle = '#d4566a'; g.beginPath(); g.ellipse(mx + 4, my + hgt * 0.75, 24, 26, 0, 0, TAU); g.fill(); g.strokeStyle = '#a03048'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx + 4, my + hgt * 0.4); g.lineTo(mx + 4, my + hgt * 0.95); g.stroke(); }
    g.strokeStyle = lip; g.lineWidth = 9; g.stroke();
  }
}

// ---------------------------------------------------------------- the head: a sphere with a narrowed, lengthened jaw + the same warp on the face patch
const HR = 0.115;
function headWarp(geo, r) {
  const P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    if (y < 0) { const u = Math.min(1, -y / r), t = Math.pow(u, 1.15); x *= 1 - 0.42 * t * (0.6 + 0.4 * Math.abs(z) / r); y *= 1.1; z = z * (1 - 0.16 * t) + (z > 0 ? 0.07 * r * t : 0); }
    else { const u = y / r; x *= 1 + 0.02 * u; z *= 1 - 0.04 * u; }
    P.setXYZ(i, x, y, z * 0.97);
  }
  geo.computeVertexNormals(); return geo;
}

function makeHand(side, skin) {   // palm faces the body (−side·x) when the arm hangs; fingers spread front → back along z
  const g = new THREE.Group(), fingers = [];
  part(new THREE.SphereGeometry(0.034, 14, 10), skin, g, 0, -0.035, 0).scale.set(0.55, 1.15, 0.95);
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Group(); f.position.set(0, -0.068, 0.024 - i * 0.016); g.add(f);
    const L = [0.05, 0.058, 0.055, 0.045][i];
    part(taper(L, 0.0095, 0.008), skin, f); const nail = part(new THREE.SphereGeometry(0.0075, 8, 6), toon(0x121015), f, side * 0.004, -L - 0.002, 0, { outline: false }); nail.scale.set(0.5, 1.3, 1);
    fingers.push({ f, L });
  }
  const thumb = new THREE.Group(); thumb.position.set(-side * 0.012, -0.03, 0.03); g.add(thumb); part(taper(0.045, 0.011, 0.009), skin, thumb);
  return { g, fingers, thumb, side };
}

export function makeGoth(opts = {}) {
  const bik = opts.outfit === 'bikini';   // 'goth' (default: corset + tartan mini + stockings + boots) | 'bikini' (the beach look: black + Scribe-red bikini, platform sandals, sunglasses on her head)
  const M = {
    skin: toon(C.skin), hair: toon(0xffffff, { map: hairTex() }), hairIn: toon(C.red, { side: THREE.DoubleSide }), black: toon(C.black), black2: toon(C.black2),
    stock: toon(0x2c2834), red: toon(C.red), corset: toon(0xffffff, { map: corsetTex() }), tartan: toon(0xffffff, { map: tartanTex(), side: THREE.DoubleSide }),
    stripe: toon(0xffffff, { map: stripeTex() }), silver: toon(C.silver), boot: toon(C.boot), lace: toon(C.red2),
  };
  M.stripe.map.repeat.set(1, 3);
  const root = new THREE.Group(), hips = new THREE.Group(); root.add(hips); hips.position.y = 0.92;
  const torso = new THREE.Group(); hips.add(torso);
  // torso (corset band + skin above it) — one lathe, coloured by a canvas: skin above y≈1.34, corset below
  const prof = [[-0.135, 0.0005], [-0.12, 0.085], [-0.1, 0.12], [-0.05, 0.162], [0.0, 0.17], [0.06, 0.15], [0.12, 0.112], [0.17, 0.098], [0.23, 0.108], [0.29, 0.126], [0.35, 0.134], [0.43, 0.134], [0.455, 0.124], [0.48, 0.1], [0.505, 0.068], [0.53, 0.047]];
  part(body(prof.filter(([y]) => y <= 0.43), { zs: 0.68 }), bik ? M.skin : M.corset, torso);
  part(body(prof.filter(([y]) => y >= 0.43), { zs: 0.68 }), M.skin, torso);
  for (const s of [-1, 1]) {   // the bust (the corset's cups) + straps
    const b = part(new THREE.SphereGeometry(0.093, 28, 20), bik ? M.skin : M.black, torso, s * 0.068, 0.352, 0.05); b.scale.set(1, 0.9, 0.86);
    if (!bik) { const trim = part(new THREE.TorusGeometry(0.08, 0.006, 6, 28, PI), M.red, torso, s * 0.068, 0.36, 0.06, { outline: false }); trim.rotation.set(-0.5, 0, 0); trim.scale.set(1, 1, 0.9); }   // red piping over each cup
    else {   // bikini top: a black cup over the front of each, red halter strings up to the neck
      const cup = part(new THREE.SphereGeometry(0.097, 28, 16, PI / 2 - 0.95 + s * 0.1, 1.9, 0.3 * PI, 0.56 * PI), M.black, torso, s * 0.068, 0.352, 0.05); cup.scale.set(1, 0.9, 0.86);
      const A = new THREE.Vector3(s * 0.07, 0.43, 0.075), Bv = new THREE.Vector3(s * 0.032, 0.535, -0.02), d = Bv.clone().sub(A);
      const str = part(new THREE.CylinderGeometry(0.004, 0.004, d.length(), 5), M.red, torso, 0, 0, 0, { outline: false }); str.position.copy(A).add(Bv).multiplyScalar(0.5); str.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    }
  }
  if (!bik) { const belt = part(new THREE.TorusGeometry(0.162, 0.007, 6, 48), M.silver, hips, 0, 0.0, 0.004, { outline: false }); belt.rotation.set(PI / 2, 0.12, 0); belt.scale.set(1, 0.8, 1); }   // a slung chain belt
  else {
    const ring = part(new THREE.TorusGeometry(0.012, 0.004, 6, 14), M.silver, torso, 0, 0.345, 0.118, { outline: false });   // the O-ring between the cups
    const back = part(new THREE.TorusGeometry(0.131, 0.005, 5, 40), M.red, torso, 0, 0.33, 0, { outline: false }); back.rotation.x = PI / 2; back.scale.set(1, 0.7, 1);   // the band round the back
    const navel = part(new THREE.SphereGeometry(0.006, 8, 6), toon(0xd9aea3), torso, 0, 0.13, 0.071, { outline: false }); navel.scale.set(1, 1.6, 0.4);
    part(body([[-0.137, 0.0005], [-0.12, 0.087], [-0.1, 0.123], [-0.075, 0.149], [-0.042, 0.167]], { zs: 0.69 }), M.black, hips);   // bikini bottom (low on the hips)
    for (const s of [-1, 1]) { const bow = part(new THREE.TorusGeometry(0.012, 0.0045, 6, 12), M.red, hips, s * 0.168, -0.05, 0.0, { outline: false }); bow.rotation.y = PI / 2; const tail = part(new THREE.BoxGeometry(0.006, 0.05, 0.006), M.red, hips, s * 0.17, -0.08, 0.008, { outline: false }); tail.rotation.z = s * 0.2; }
  }
  // neck, choker + pen-nib charm, head
  const neck = new THREE.Group(); torso.add(neck); neck.position.set(0, 0.52, -0.005);
  part(new THREE.CylinderGeometry(0.036, 0.05, 0.12, 18), M.skin, neck, 0, 0.04, 0);
  const choker = part(new THREE.TorusGeometry(0.041, 0.009, 8, 28), M.black, neck, 0, 0.035, 0); choker.rotation.x = PI / 2;
  const nib = part(new THREE.ConeGeometry(0.011, 0.03, 8), M.red, neck, 0, 0.012, 0.047, { outline: false }); nib.rotation.x = PI;
  const head = new THREE.Group(); neck.add(head); head.position.y = 0.1;
  const hc = new THREE.Group(); head.add(hc); hc.position.set(0, 0.085, 0.006);
  part(headWarp(new THREE.SphereGeometry(HR, 40, 30), HR), M.skin, hc);
  const faceC = document.createElement('canvas'); faceC.width = FW; faceC.height = FH; const faceG = faceC.getContext('2d');
  const faceT = new THREE.CanvasTexture(faceC); faceT.colorSpace = THREE.SRGBColorSpace; faceT.anisotropy = 8;
  const faceGeo = headWarp(new THREE.SphereGeometry(HR * 1.006, 48, 24, PI / 2 - PHI / 2, PHI, TH0, TH1 - TH0), HR * 1.006);
  const face = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: faceT, transparent: true, depthWrite: false })); face.renderOrder = 2; hc.add(face);
  // hair: cap, blunt bangs, chin sidelocks, the waist-length curtain (black outside, Scribe red inside)
  const cap = part(new THREE.SphereGeometry(HR * 1.085, 36, 12, 0, TAU, 0, 0.42 * PI), M.hair, hc, 0, 0.006, -0.008); cap.scale.set(1.02, 1.04, 1.04);   // the crown (above the face)
  const nape = part(new THREE.SphereGeometry(HR * 1.08, 36, 10, PI / 2 + 0.95, TAU - 1.9, 0.38 * PI, 0.3 * PI), M.hair, hc, 0, 0.0, -0.006); nape.scale.set(1.03, 1.0, 1.04);   // back + sides, open at the face
  const bangs = part(new THREE.SphereGeometry(HR * 1.11, 40, 12, PI / 2 - 1.15, 2.3, 0.1 * PI, 0.335 * PI), M.hair, hc, 0, 0.004, 0.0); bangs.scale.set(1.0, 1.0, 1.04);   // blunt, just above the brows
  for (const s of [-1, 1]) {
    const lock = part(new THREE.CapsuleGeometry(0.026, 0.16, 4, 12), M.hair, hc, s * 0.094, -0.07, 0.052); lock.scale.set(1.25, 1, 0.55); lock.rotation.set(-0.12, s * 0.35, s * 0.05);
    const lockIn = part(new THREE.CapsuleGeometry(0.02, 0.14, 4, 8), M.hairIn, hc, s * 0.09, -0.075, 0.04, { outline: false }); lockIn.scale.set(1.0, 1, 0.5); lockIn.rotation.y = s * 0.35;
  }
  const back = new THREE.Group(); hc.add(back);
  const curtain = (r0, r1, mat, ol) => { const g = new THREE.CylinderGeometry(r0, r1, 0.66, 40, 8, true, PI - 1.3, 2.6); g.translate(0, -0.33, 0); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i), u = -y / 0.66; P.setZ(i, P.getZ(i) * (0.9 - 0.15 * u) - 0.035 * u); } g.computeVertexNormals(); return part(g, mat, back, 0, 0.02, -0.01, { outline: ol }); };
  curtain(HR * 1.1, 0.165, M.hair, true); curtain(HR * 1.04, 0.158, M.hairIn, false);
  // arms: shoulder → elbow → wrist, striped arm warmers on the forearms, spiked cuffs
  const limbs = {};
  for (const [k, s] of [['L', -1], ['R', 1]]) {
    const sh = new THREE.Group(); torso.add(sh); sh.position.set(s * 0.142, 0.452, -0.01);
    part(new THREE.SphereGeometry(0.04, 14, 10), M.skin, sh);
    part(taper(0.25, 0.037, 0.029, { bulge: 0.004 }), M.skin, sh);
    const el = new THREE.Group(); sh.add(el); el.position.y = -0.25;
    part(taper(0.22, 0.03, 0.024), bik ? M.skin : M.stripe, el);
    const cuff = part(new THREE.CylinderGeometry(0.029, 0.029, 0.03, 14), M.black, el, 0, -0.19, 0);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU, sp = part(new THREE.ConeGeometry(0.006, 0.016, 5), M.silver, cuff, Math.cos(a) * 0.033, 0, Math.sin(a) * 0.033, { outline: false }); sp.rotation.z = -Math.PI / 2; sp.rotation.y = -a; }
    const hand = makeHand(s, M.skin); el.add(hand.g); hand.g.position.y = -0.225;
    limbs['arm' + k] = { sh, el, hand };
    // legs: hip → knee → ankle; thigh skin above the stocking, stocking + lace band, platform boot
    const hp = new THREE.Group(); hips.add(hp); hp.position.set(s * 0.083, -0.03, 0);
    part(taper(0.4, 0.08, 0.046, { bulge: 0.006, at: 0.25 }), M.skin, hp);
    if (!bik) { part(taper(0.18, 0.066, 0.05), M.stock, hp, 0, -0.22, 0);   // thigh-high stocking (a band of skin shows under the skirt)
      part(new THREE.TorusGeometry(0.067, 0.009, 6, 22), M.lace, hp, 0, -0.222, 0, { outline: false }).rotation.x = PI / 2; }
    const kn = new THREE.Group(); hp.add(kn); kn.position.y = -0.4;
    part(taper(0.38, 0.046, 0.028, { bulge: 0.014, at: 0.28 }), bik ? M.skin : M.stock, kn);
    const boot = new THREE.Group(); kn.add(boot); boot.position.y = -0.38;
    if (!bik) {
      part(taper(0.2, 0.046, 0.04), M.boot, boot, 0, 0.17, 0);
      part(new THREE.BoxGeometry(0.085, 0.07, 0.2), M.boot, boot, 0, -0.035, 0.04);
      for (let i = 0; i < 3; i++) part(new THREE.BoxGeometry(0.06, 0.008, 0.01), M.lace, boot, 0, 0.12 - i * 0.05, 0.046, { outline: false });
      part(new THREE.BoxGeometry(0.03, 0.022, 0.01), M.silver, boot, s * 0.045, 0.02, 0.02, { outline: false });
    } else {   // platform sandals: a bare foot, a black strap over the instep + an ankle strap
      const ft = part(new THREE.CapsuleGeometry(0.034, 0.12, 4, 10), M.skin, boot, 0, -0.03, 0.045); ft.rotation.x = PI / 2; ft.scale.set(1.05, 1, 0.7);
      part(new THREE.BoxGeometry(0.08, 0.022, 0.035), M.black, boot, 0, -0.012, 0.07);
      const ank = part(new THREE.TorusGeometry(0.031, 0.006, 6, 18), M.black, boot, 0, 0.03, 0); ank.rotation.x = PI / 2;
    }
    part(new THREE.BoxGeometry(0.095, 0.05, 0.22), M.black2, boot, 0, -0.085, 0.045);   // the platform sole
    limbs['leg' + k] = { hp, kn, boot };
  }
  // the skirt: a pleated tartan mini on the hips
  if (!bik) {
    part(body([[-0.2, 0.215], [-0.12, 0.19], [-0.04, 0.162], [0.08, 0.13], [0.1, 0.128]], { zs: 0.78, seg: 64, pleats: 18, pleatAmp: 0.06 }), M.tartan, hips);
    const band = part(new THREE.TorusGeometry(0.13, 0.012, 6, 40), M.black, hips, 0, 0.095, 0); band.rotation.x = PI / 2; band.scale.set(1, 0.78, 1);
  } else {   // round black sunglasses pushed up on her head (like the reference's)
    const sg = new THREE.Group(); hc.add(sg); sg.position.set(0, 0.118, 0.078); sg.rotation.x = -0.28;
    for (const s of [-1, 1]) { const l = part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 20), new THREE.MeshBasicMaterial({ color: 0x1a0d14 }), sg, s * 0.04, 0, 0.0); l.rotation.x = PI / 2; part(new THREE.CircleGeometry(0.009, 10), new THREE.MeshBasicMaterial({ color: 0x8a5070 }), sg, s * 0.04 - 0.012, 0.012, 0.0045, { outline: false }); part(new THREE.TorusGeometry(0.031, 0.004, 6, 20), M.red, sg, s * 0.04, 0, 0.005, { outline: false }); }
    part(new THREE.BoxGeometry(0.022, 0.005, 0.005), M.red, sg, 0, 0.004, 0.004, { outline: false });
  }

  let faceKey = '';
  const curl = (hd, mode) => {
    const cl = { relax: [0.35, 0.4, 0.45, 0.5, 0.3], fist: [1.5, 1.6, 1.6, 1.5, 0.9], point: [0, 1.6, 1.6, 1.5, 0.9], peace: [0, 0, 1.6, 1.5, 0.9], open: [0.05, 0.05, 0.05, 0.1, 0], hold: [1.0, 1.1, 1.15, 1.2, 0.8] }[mode || 'relax'];
    hd.fingers.forEach((f, i) => { f.f.rotation.set(mode === 'peace' && i < 2 ? (i ? -0.18 : 0.18) : 0, 0, -hd.side * cl[i]); });
    hd.thumb.rotation.set(-0.5 - cl[4] * 0.3, 0, -hd.side * cl[4] * 0.8);
  };
  function set(p = {}) {
    const s = p.scale ?? 1, t = p.t ?? 0;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(s);
    const breath = Math.sin(t * 1.6) * 0.006;
    hips.rotation.set(0, (p.hipYaw ?? 0), p.sway ?? 0); hips.position.y = 0.92 - Math.abs(p.sway ?? 0) * 0.04 - (p.crouch ?? 0);
    torso.rotation.set((p.lean ?? 0) + breath, p.twist ?? 0, (p.bend ?? 0) - (p.sway ?? 0) * 0.6);
    torso.scale.set(1, 1 + breath * 0.5, 1);
    const hd = p.head || {}; head.rotation.set(hd.x ?? 0, hd.y ?? 0, hd.z ?? 0);
    for (const [k, s2] of [['L', -1], ['R', 1]]) {
      const A = { x: 0.05, z: 0.18, y: 0, el: 0.15, ...(p['arm' + k] || {}) }, a = limbs['arm' + k];
      a.sh.rotation.set(A.x, A.y * s2, s2 * A.z); a.el.rotation.set(-A.el, 0, 0);
      curl(a.hand, p['hand' + k]);
      const Lg = { x: 0, z: 0, kn: 0, ...(p['leg' + k] || {}) }, l = limbs['leg' + k];
      l.hp.rotation.set(Lg.x, 0, s2 * Lg.z); l.kn.rotation.set(Lg.kn, 0, 0); l.boot.rotation.set(-(Lg.x + Lg.kn) * 0.6 + (Lg.foot ?? 0), 0, 0);
    }
    const blink = p.blink ?? ((t % 3.7) < 0.12 ? 1 : 0);
    const eyes = blink && (p.eyes ?? 'open') === 'open' ? 'closed' : (p.eyes ?? 'open');
    const look = p.look || [0, 0], talk = p.mouth === 'talk' ? Math.round((p.talk ?? (0.5 + 0.5 * Math.sin(t * 22))) * 4) / 4 : 0;
    const key = [eyes, look.map((v) => v.toFixed(2)), p.brows ?? 0, p.mouth ?? 'smirk', talk].join('|');
    if (key !== faceKey) { faceKey = key; drawFace(faceG, { eyes, look, brows: p.brows, mouth: p.mouth, talk }); faceT.needsUpdate = true; }
  }
  set({});
  return { root, set, head, hc, torso, hips, limbs, M, hand: (side) => (side < 0 ? limbs.armL.hand.g : limbs.armR.hand.g), face };
}
