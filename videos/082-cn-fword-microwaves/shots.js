// 082 — Scribe promo, the f-word explainer series #4 (058 finals, 062 airplanes, 063 penguins): "How fucking microwaves fucking
// work", voiced by the user's new favourite narrator (Fish "chinese", Nov 10). Fast deadpan explainer, one toon gag per line, hard
// cuts between framings, each in its own place: INSIDE a giant microwave (Derek's face pressed to the door window, the burrito
// spinning), a top cutaway of the magnetron firing waves through the waveguide into the metal box, the WATER MOLECULE world (a
// polar H₂O with a face: − on the oxygen, + on the hydrogens; two plates flip the field and every molecule flip-flops after it →
// they glow hot = dielectric heating), the burrito sliced in half on the giant turntable (a lava ring around a frozen core), Derek's
// two bites (lava → frozen), the standing-wave heat map (hot + cold spots) with the plate spinning through it, a fork → charge piling
// on the tines → lightning (the dorm wide: the room blacks out, Vex looks down from her room upstairs — a cameo), 1945 (sepia: a
// radar engineer's candy bar melting in his pocket), the pivot at ~52 %: chemistry homework, draw the water molecule, by hand →
// "you are microwaved" (Derek spinning on the giant turntable) → Scribe (~63 %): open it, one photo, all three solved, the page
// written ON THE PHONE SCREEN stroke by stroke (user rule, Nov 9: never a pen on paper by itself) — the Lewis structure of H₂O, bent,
// two lone pairs, the wavelength maths — in Derek's handwriting → the dorm wide (homework: done; Vex nods) → the burrito: still
// frozen. End card.
// Facts (web-checked Nov 10 2026; caption.md comment): ovens run at 2.45 GHz (an ISM band, NOT a water resonance — that's ~20 GHz);
// water is polar (bent, O δ−, H δ+) and its molecules keep re-aligning with the oscillating field → dielectric heating; at 2.45 GHz the
// waves reach ~1–3 cm into food, the middle heats by conduction (the frozen middle), ice absorbs far less than liquid water; the
// metal box reflects the waves into a standing-wave pattern of hot + cold spots ~6 cm apart (half of the 12.2 cm wavelength) → the
// turntable; sharp metal edges concentrate the field → arcing; Percy Spencer (Raytheon, radar magnetrons) noticed a candy bar melt in
// his pocket (~1945; the bar's kind is disputed — we only say "candy bar"), patent filed Oct 8 1945. Worksheet: λ = c/f =
// 3.00×10⁸ / 2.45×10⁹ = 0.122 m = 12.2 cm; q = mcΔT = 250 g × 4.18 J/g°C × 80 °C = 83,600 J.
// Product (Scribe README + tryscribe.ink): photo → worked solutions (chemistry incl. Lewis structures with lone pairs) written in your
// own handwriting stroke by stroke on screen → PDF. The comedy is about the TOPIC, never the voice's accent.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, rng, canvasTex } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeArrows } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeSpecs } from '@engine/build/brprops.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { FIG } from '@engine/build/subjects.js';
import { makeHud } from '@engine/build/brhud.js';
import { buildDorm, D, makeMiniFridge } from '@engine/build/dorm.js';
import { makeVroid, dressGoth } from '@engine/vroid.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra });
const box = (w, h, d, m, parent, x = 0, y = 0, z = 0) => mk(new THREE.BoxGeometry(w, h, d), m, parent, x, y, z);
const rbox = (w, h, d, r, m, parent, x = 0, y = 0, z = 0) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, parent, x, y, z);
const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
const bump = (t, a, b) => smooth(u01(t, a, b));
const pulse = (t, t0, up = 0.12, hold = 0.3, down = 0.3) => (t < t0 ? 0 : t < t0 + up ? (t - t0) / up : t < t0 + up + hold ? 1 : Math.max(0, 1 - (t - t0 - up - hold) / down));

// 067's chest shading pass for Vex (soft rose strokes multiplied onto the body atlas once) + 073's back-panel fix (no pixel pass)
async function shadeBody(url) {
  const img = await loadImg(url), W = img.width, S = W / 2048;
  const c = document.createElement('canvas'); c.width = W; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  { const px = g.getImageData(Math.round(520 * S), Math.round(1210 * S), 1, 1).data; g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`;
    for (const x0 of [444, 1452]) { g.fillRect(x0 * S, 1095 * S, 156 * S, 82 * S); }
    g.fillStyle = '#a01828'; for (const x0 of [450, 1458]) g.fillRect(x0 * S, 1092 * S, 142 * S, 6 * S); }
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

// ---------------------------------------------------------------- the microwave (real size, metres; origin = bottom centre, door +z)
// Cavity x −0.235…0.10, y 0.03…0.27, z −0.17…0.17; the right bay (x 0.115…0.235) holds the magnetron, waveguide, transformer, fan.
const CAV = { x0: -0.235, x1: 0.1, y0: 0.03, y1: 0.27, z0: -0.17, z1: 0.17 }; CAV.cx = (CAV.x0 + CAV.x1) / 2; CAV.cy = (CAV.y0 + CAV.y1) / 2;
function makeMicrowave() {
  const g = new THREE.Group(), W = 0.5, H = 0.3, Dp = 0.38;
  const shell = std(0xf2f0ec, 0.42), trim = std(0x26282d, 0.45), metal = std(0xc9ced3, 0.35, { metalness: 0.55 });
  const inside = new THREE.MeshStandardMaterial({ color: 0xdfe2e4, roughness: 0.4, metalness: 0.2, side: THREE.BackSide });
  const ceilM = inside.clone(), hidden = new THREE.MeshBasicMaterial({ visible: false });
  const P = {};
  P.top = box(W, 0.03, Dp, shell, g, 0, H - 0.015, 0);
  box(W, 0.03, Dp, shell, g, 0, 0.015, 0);
  box(0.015, H - 0.06, Dp, shell, g, -W / 2 + 0.0075, H / 2, 0);
  P.right = box(0.015, H - 0.06, Dp, shell, g, W / 2 - 0.0075, H / 2, 0);
  box(W - 0.03, H - 0.06, 0.02, shell, g, 0, H / 2, -Dp / 2 + 0.01);
  for (const x of [-0.2, 0.2]) for (const z of [-0.14, 0.14]) mk(new THREE.CylinderGeometry(0.012, 0.014, 0.01, 10), trim, g, x, -0.005, z);
  // the cavity liner (inside faces), its open front, the ceiling (hidden for the top cutaway)
  const cav = mk(new THREE.BoxGeometry(CAV.x1 - CAV.x0, CAV.y1 - CAV.y0, CAV.z1 - CAV.z0), [inside, inside, ceilM, inside, hidden, inside], g, CAV.cx, CAV.cy, 0);
  cav.receiveShadow = true; cav.castShadow = false;
  box(0.004, CAV.y1 - CAV.y0, CAV.z1 - CAV.z0, std(0xb9bec3, 0.5, { metalness: 0.3 }), g, CAV.x1 + 0.004, CAV.cy, 0);   // the divider, seen from the bay
  const mica = mk(new THREE.PlaneGeometry(0.075, 0.06), std(0xd9c79a, 0.8), g, CAV.x1 - 0.002, 0.215, -0.03); mica.rotation.y = -PI / 2;   // the waveguide cover
  // the bay: magnetron (copper body, cooling fins, two magnets, antenna), waveguide, transformer, fan
  const mag = new THREE.Group(); g.add(mag); mag.position.set(0.175, 0.105, -0.03);
  const magGlowM = new THREE.MeshStandardMaterial({ color: 0xc87a3e, roughness: 0.3, metalness: 0.6, emissive: 0xff5a1f, emissiveIntensity: 0 });
  mk(new THREE.CylinderGeometry(0.028, 0.028, 0.055, 20), magGlowM, mag, 0, 0, 0);
  for (let i = 0; i < 6; i++) box(0.085, 0.004, 0.085, std(0xd5d9dd, 0.35, { metalness: 0.6 }), mag, 0, -0.03 + i * 0.012, 0);
  for (const y of [-0.04, 0.04]) { const r = mk(new THREE.TorusGeometry(0.03, 0.009, 8, 24), std(0x3a3d42, 0.5), mag, 0, y, 0); r.rotation.x = PI / 2; }
  mk(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 10), metal, mag, 0, 0.07, 0);
  mk(new THREE.SphereGeometry(0.013, 12, 8), metal, mag, 0, 0.1, 0);
  box(0.09, 0.045, 0.07, metal, g, 0.15, 0.222, -0.03);   // waveguide (a duct from the antenna to the cavity wall)
  const tr = new THREE.Group(); g.add(tr); tr.position.set(0.172, 0.06, 0.1);
  box(0.075, 0.07, 0.07, std(0x3d4148, 0.5), tr); for (const s of [-1, 1]) { const c = mk(new THREE.TorusGeometry(0.025, 0.012, 8, 18), std(0xb86b2e, 0.4, { metalness: 0.6 }), tr, 0, 0.0, s * 0.036); void c; }
  const fan = new THREE.Group(); g.add(fan); fan.position.set(0.175, 0.17, -0.155);
  for (let i = 0; i < 5; i++) { const b = box(0.012, 0.045, 0.004, std(0x9aa0a6, 0.5), fan); b.rotation.z = (i / 5) * TAU; b.position.set(Math.cos((i / 5) * TAU + PI / 2) * 0.02, Math.sin((i / 5) * TAU + PI / 2) * 0.02, 0); }
  // control panel (front of the bay): a display + keypad
  const dispT = tex(256, 80, () => {});
  let dispNow = null;
  const setDisplay = (text, on = 1) => { const key = text + on; if (key === dispNow) return; dispNow = key; const c = dispT.canvas.getContext('2d');
    c.fillStyle = '#0d1410'; c.fillRect(0, 0, 256, 80); c.fillStyle = on ? '#6dff9b' : '#1d3326'; c.font = '700 58px "Courier New", monospace'; c.textAlign = 'center'; c.fillText(text, 128, 60); dispT.needsUpdate = true; };
  setDisplay('3:00');
  mk(new THREE.PlaneGeometry(0.12, 0.038), new THREE.MeshBasicMaterial({ map: dispT, toneMapped: false }), g, 0.175, 0.255, Dp / 2 + 0.0015);
  const padT = tex(256, 384, (c, w, h) => {
    c.fillStyle = '#2b2d32'; c.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { c.fillStyle = '#e9e9ea'; c.beginPath(); c.roundRect(28 + k * 70, 20 + r * 62, 58, 46, 10); c.fill(); c.fillStyle = '#2b2d32'; c.font = '600 28px Inter, Arial'; c.textAlign = 'center'; c.fillText(String([1, 2, 3, 4, 5, 6, 7, 8, 9, '+30', 0, '⏻'][r * 3 + k]), 57 + k * 70, 53 + r * 62); }
    c.fillStyle = '#d8343a'; c.beginPath(); c.roundRect(28, 276, 92, 70, 12); c.fill(); c.fillStyle = '#2f9e5b'; c.beginPath(); c.roundRect(136, 276, 92, 70, 12); c.fill();
    c.fillStyle = '#fff'; c.font = '700 24px Inter, Arial'; c.textAlign = 'center'; c.fillText('STOP', 74, 320); c.fillText('START', 182, 320);
  });
  mk(new THREE.PlaneGeometry(0.115, 0.17), std(0xffffff, 0.5, { map: padT }), g, 0.175, 0.13, Dp / 2 + 0.0015);
  box(0.135, H - 0.02, 0.006, trim, g, 0.175, H / 2, Dp / 2 - 0.002);
  // the door: hinge on the left edge; a frame round a window of perforated metal (holes smaller than the 12 cm wave) + glass
  const door = new THREE.Group(); g.add(door); door.position.set(-W / 2, 0, Dp / 2 + 0.0125);
  const DW = 0.35, wx0 = 0.04, wx1 = 0.29, wy0 = 0.05, wy1 = 0.25;
  for (const [w, h, x, y] of [[DW, wy0, DW / 2, wy0 / 2], [DW, H - wy1, DW / 2, (H + wy1) / 2], [wx0, wy1 - wy0, wx0 / 2, (wy0 + wy1) / 2], [DW - wx1, wy1 - wy0, (DW + wx1) / 2, (wy0 + wy1) / 2]]) box(w, h, 0.025, trim, door, x, y, 0);
  const meshT = tex(512, 400, (c, w, h) => { c.fillStyle = 'rgba(16,17,20,0.9)'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out'; for (let y = 6; y < h; y += 13) for (let x = (Math.floor(y / 13) % 2) * 6.5 + 4; x < w; x += 13) { c.beginPath(); c.arc(x, y, 4.6, 0, TAU); c.fill(); } });
  const winMesh = mk(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), new THREE.MeshBasicMaterial({ map: meshT, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.55 }), door, (wx0 + wx1) / 2, (wy0 + wy1) / 2, 0.002);
  const glass = mk(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), new THREE.MeshStandardMaterial({ color: 0x16181c, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), door, (wx0 + wx1) / 2, (wy0 + wy1) / 2, -0.004);
  winMesh.castShadow = glass.castShadow = false;
  box(0.012, 0.18, 0.014, metal, door, DW - 0.025, H / 2, 0.022);
  // turntable
  const plate = new THREE.Group(); g.add(plate); plate.position.set(CAV.cx, CAV.y0 + 0.006, 0);
  const plateM = new THREE.MeshStandardMaterial({ color: 0xd6eef2, roughness: 0.06, metalness: 0.0, transparent: true, opacity: 0.6 });
  mk(new THREE.CylinderGeometry(0.14, 0.14, 0.006, 56), plateM, plate, 0, 0, 0).receiveShadow = true;
  mk(new THREE.TorusGeometry(0.075, 0.004, 6, 32), std(0x6a6f75, 0.5), plate, 0, -0.005, 0).rotation.x = PI / 2;
  // the light inside (scaled by the caller: intensity ∝ s²)
  const light = new THREE.PointLight(0xffd59a, 0, 0, 2); light.position.set(CAV.cx, CAV.y1 - 0.03, 0.02); g.add(light);
  const bulb = mk(new THREE.BoxGeometry(0.04, 0.004, 0.03), basic(0xfff0c8), g, CAV.cx + 0.05, CAV.y1 - 0.002, -0.06);
  g.traverse((o) => { if (o.isMesh && o !== cav) { o.castShadow = true; o.receiveShadow = true; } });
  winMesh.castShadow = glass.castShadow = false;
  return { g, door, plate, light, bulb, P, ceilM, magGlowM, mag, fan, setDisplay, winMesh, glass,
    cutaway(on) { P.top.visible = !on; ceilM.visible = !on; },
    side(on) { P.right.visible = !on; } };
}

// ---------------------------------------------------------------- props
function makeBurrito() {   // L 0.18 m, r 0.036; two halves that split at x = 0 (cut faces: the lava ring round a frozen core)
  const r = 0.036, L = 0.18, g = new THREE.Group();
  const tortT = tex(512, 256, (c, w, h) => { c.fillStyle = '#e9c98c'; c.fillRect(0, 0, w, h); const R = rng(82);
    for (let i = 0; i < 70; i++) { const x = R() * w, y = R() * h, rr = 3 + R() * 12; const gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(150,92,40,.75)'); gr.addColorStop(1, 'rgba(150,92,40,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(160,110,60,.55)'; c.lineWidth = 4; for (const y of [70, 150, 210]) { c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y - 14, w * 0.7, y + 14, w, y); c.stroke(); } });
  const faceT = tex(512, 512, (c, w) => {
    const C = w / 2; c.fillStyle = '#dcb779'; c.beginPath(); c.arc(C, C, C, 0, TAU); c.fill();
    const hot = c.createRadialGradient(C, C, C * 0.5, C, C, C * 0.92); hot.addColorStop(0, '#ffd23f'); hot.addColorStop(0.55, '#ff7a1f'); hot.addColorStop(1, '#ff3d17');
    c.fillStyle = hot; c.beginPath(); c.arc(C, C, C * 0.9, 0, TAU); c.fill();
    const R = rng(7); for (let i = 0; i < 26; i++) { const a = R() * TAU, d = C * (0.62 + R() * 0.24); c.fillStyle = R() < 0.5 ? 'rgba(255,240,170,.85)' : 'rgba(110,40,20,.8)'; c.beginPath(); c.arc(C + Math.cos(a) * d, C + Math.sin(a) * d, 4 + R() * 9, 0, TAU); c.fill(); }
    c.fillStyle = '#bfe8ff'; c.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU, d = C * (0.5 + 0.04 * Math.sin(i * 2.7) + (i % 2 ? 0.035 : -0.02)); i ? c.lineTo(C + Math.cos(a) * d, C + Math.sin(a) * d) : c.moveTo(C + Math.cos(a) * d, C + Math.sin(a) * d); } c.fill();
    c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 6; c.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const x = C + (R() - 0.5) * C * 0.5, y = C + (R() - 0.5) * C * 0.5, s = 18 + R() * 16; for (let j = 0; j < 3; j++) { const a = (j / 3) * PI; c.beginPath(); c.moveTo(x - Math.cos(a) * s, y - Math.sin(a) * s); c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); c.stroke(); } }
    c.strokeStyle = 'rgba(120,190,235,.9)'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU, d = C * (0.5 + 0.04 * Math.sin(i * 2.7) + (i % 2 ? 0.035 : -0.02)); i ? c.lineTo(C + Math.cos(a) * d, C + Math.sin(a) * d) : c.moveTo(C + Math.cos(a) * d, C + Math.sin(a) * d); } c.stroke();
  });
  const tm = std(0xffffff, 0.75, { map: tortT }), fm = new THREE.MeshBasicMaterial({ map: faceT, toneMapped: false });
  const halves = [-1, 1].map((s) => {
    const h = new THREE.Group(); g.add(h);
    const body = mk(new THREE.CylinderGeometry(r, r, L / 2 - r, 28, 1, true), tm, h); body.rotation.z = PI / 2; body.position.x = s * (L / 2 - r) / 2;
    const cap = mk(new THREE.SphereGeometry(r, 28, 14, 0, TAU, 0, PI / 2), tm, h); cap.rotation.z = -s * PI / 2; cap.position.x = s * (L / 2 - r);
    const face = mk(new THREE.CircleGeometry(r * 0.995, 40), fm, h); face.rotation.y = -s * PI / 2; face.visible = false; face.castShadow = false;
    body.castShadow = cap.castShadow = true;
    return { h, body, cap, face };
  });
  return { g, halves, r, L,
    split(k, open = 0) { halves.forEach((H, i) => { const s = i ? 1 : -1; H.h.visible = true; H.face.visible = k > 0.001; H.h.position.set(s * 0.045 * k, 0, 0); H.h.rotation.set(0, s * (PI / 2) * open, 0); }); },
    bitten(n) { const right = halves[1], left = halves[0]; right.h.visible = n < 1; left.face.visible = n >= 1; left.h.position.x = 0; left.h.rotation.y = 0; right.face.visible = false; right.h.position.x = 0; right.h.rotation.y = 0; } };
}
function makeFork() {   // L ≈ 0.19 m along +y (tines up)
  const g = new THREE.Group(), m = std(0xdfe4e8, 0.18, { metalness: 0.9 });
  box(0.014, 0.12, 0.004, m, g, 0, 0.06, 0); box(0.03, 0.012, 0.004, m, g, 0, 0.125, 0);
  const tips = [];
  for (let i = 0; i < 4; i++) { const x = -0.0115 + i * 0.0077; box(0.0035, 0.05, 0.0035, m, g, x, 0.155, 0); const tp = new THREE.Object3D(); tp.position.set(x, 0.181, 0); g.add(tp); tips.push(tp); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, tips };
}
function makeBowl() {   // r 0.065 m, mac & cheese inside
  const g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * (PI / 2); pts.push(new THREE.Vector2(0.065 * Math.sin(a) + 0.001, 0.05 - 0.05 * Math.cos(a))); }
  const bowl = mk(new THREE.LatheGeometry(pts, 40), std(0x4a8fd6, 0.4, { side: THREE.DoubleSide }), g); bowl.castShadow = true;
  const mac = mk(new THREE.CircleGeometry(0.058, 32), std(0xf2b630, 0.55), g, 0, 0.04, 0); mac.rotation.x = -PI / 2;
  const R = rng(5); for (let i = 0; i < 26; i++) { const a = R() * TAU, d = R() * 0.045; const n = mk(new THREE.TorusGeometry(0.007, 0.0035, 6, 10, PI), std(0xffc63d, 0.5), g, Math.cos(a) * d, 0.043, Math.sin(a) * d); n.rotation.set(R() * 3, R() * 3, R() * 3); }
  return g;
}
function makeBolt(parent, { segs = 9, color = 0xd8f6ff } = {}) {   // a jagged lightning bolt: unit cylinders posed between seeded jitter points
  const g = new THREE.Group(); parent.add(g);
  const m = new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const mc = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  const S = Array.from({ length: segs }, () => { const o = new THREE.Mesh(geo, m), c = new THREE.Mesh(geo, mc); g.add(o, c); o.renderOrder = 6; return [o, c]; });
  const A = V(0, 0, 0), Bv = V(0, 0, 0), d = V(0, 0, 0), up = V(0, 1, 0), q = new THREE.Quaternion();
  return { g, set(a, b, seed, on = 1, jag = 0.16, width = 0.01) {
    g.visible = on > 0.01; if (!g.visible) return; m.opacity = 0.55 * on;
    A.set(...a); Bv.set(...b); const L = A.distanceTo(Bv), R = rng(seed), pts = [];
    for (let i = 0; i <= segs; i++) { const p = A.clone().lerp(Bv, i / segs); if (i > 0 && i < segs) p.add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(jag * L)); pts.push(p); }
    S.forEach(([o, c], i) => { const p0 = pts[i], p1 = pts[i + 1]; d.subVectors(p1, p0); const l = d.length(); for (const x of [o, c]) { x.position.copy(p0).addScaledVector(d, 0.5); x.quaternion.copy(q.setFromUnitVectors(up, d.clone().normalize())); } o.scale.set(width * 2.6, l, width * 2.6); c.scale.set(width * 0.7, l, width * 0.7); });
  } };
}
function makeWater({ face = false } = {}) {   // H₂O: O r 0.5 at the centre, the two H r 0.3 at 104.5°, below
  const g = new THREE.Group(), oM = std(0xe5463d, 0.42), hM = std(0xf4f4f6, 0.42);
  oM.emissive = new THREE.Color(0xff5a1f); oM.emissiveIntensity = 0; hM.emissive = new THREE.Color(0xff7a2a); hM.emissiveIntensity = 0;
  mk(new THREE.SphereGeometry(0.5, 32, 24), oM, g);
  const half = (104.5 / 2) * PI / 180;
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.3, 28, 20), hM, g, s * 0.62 * Math.sin(half), -0.62 * Math.cos(half), 0.05);
  const F = {};
  if (face) {
    const white = std(0xffffff, 0.25), black = std(0x141414, 0.3);
    F.eyes = [-1, 1].map((s) => { const e = new THREE.Group(); g.add(e); e.position.set(s * 0.17, 0.1, 0.43); mk(new THREE.SphereGeometry(0.115, 18, 14), white, e).scale.set(0.95, 1.15, 0.5); const p = mk(new THREE.SphereGeometry(0.06, 14, 10), black, e, 0, -0.01, 0.05); p.scale.z = 0.5; return { e, p }; });
    F.mouth = mk(new THREE.SphereGeometry(0.07, 16, 10), std(0x5a1010, 0.5), g, 0, -0.14, 0.47); F.mouth.scale.set(1.3, 0.55, 0.4);
    for (const s of [-1, 1]) { const b = box(0.12, 0.025, 0.02, black, g, s * 0.17, 0.27, 0.45); b.rotation.z = -s * 0.15; }
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return { g, oM, hM, F, setHeat(k) { oM.emissiveIntensity = 0.9 * k; hM.emissiveIntensity = 0.8 * k; oM.color.setHex(0xe5463d).lerp(new THREE.Color(0xff8a3a), k * 0.5); hM.color.setHex(0xf4f4f6).lerp(new THREE.Color(0xffc08a), k * 0.6); } };
}
function signSprite(text, color, bg, px = 150) {
  const t = tex(256, 256, (c, w, h) => { c.fillStyle = bg; c.beginPath(); c.arc(w / 2, h / 2, 110, 0, TAU); c.fill(); c.lineWidth = 12; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke(); c.fillStyle = color; c.font = `800 ${px}px Fredoka, Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 8); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })); s.renderOrder = 4; return s;
}

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '800 40px Fredoka', '400 40px "Luckiest Guy"', '30px Georgia'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer); const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = envTex;
  const canvasEl = renderer.domElement;

  // ---------------------------------------------------------------- word times
  const t = {
    microwaves: W('hook', 'microwaves'), work: W('hook', 'work'),
    a1: W('mag', 'a'), magnetron: W('mag', 'magnetron'), fires: W('mag', 'fires'), into: W('mag', 'into'), metal: W('mag', 'metal'), box: W('mag', 'box'),
    water1: W('water', 'water'), tiny: W('water', 'tiny'), magnet: W('water', 'magnet'),
    the1: W('spin', 'the'), field: W('spin', 'field'), flips: W('spin', 'flips'), billions: W('spin', 'billions'), second: W('spin', 'second'), so1: W('spin', 'so'), spins1: W('spin', 'spins'), spinning: W('spin', 'spinning'), heat: W('spin', 'heat'),
    but: W('deep', 'but'), inch: W('deep', 'inch'), deep: W('deep', 'deep'), outside: W('deep', 'outside'), lava: W('deep', 'lava'), middle: W('deep', 'middle'), frozen1: W('deep', 'frozen'),
    waves: W('spots', 'waves'), bounce: W('spots', 'bounce'), cold: W('spots', 'cold'), so2: W('spots', 'so'), plate: W('spots', 'plate'), spins2: W('spots', 'spins'),
    fork: W('fork', 'fork'), there: W('fork', 'there'), charge: W('fork', 'charge'), points: W('fork', 'points'), f8: W('fork', 'fucking'), lightning: W('fork', 'lightning'),
    invented: W('history', 'invented'), a2: W('history', 'a'), radar: W('history', 'radar'), candy: W('history', 'candy'), melted: W('history', 'melted'), pocket: W('history', 'pocket'),
    now: W('teacher', 'now'), chemistry: W('teacher', 'chemistry'), homework1: W('teacher', 'homework'), draw: W('teacher', 'draw'), molecule1: W('teacher', 'molecule'), by: W('teacher', 'by'), hand1: W('teacher', 'hand'),
    you: W('cooked', 'you'), microwaved: W('cooked', 'microwaved'),
    so3: W('scribe', 'so'), open: W('scribe', 'open'), scribe: W('scribe', 'scribe'), one: W('scribe', 'one'), photo: W('scribe', 'photo'), it1: W('scribe', 'it'), solves: W('scribe', 'solves'), sheet: W('scribe', 'sheet'),
    it2: W('hand', 'it'), draws: W('hand', 'draws'), molecule2: W('hand', 'molecule'), bent: W('hand', 'bent'), two: W('hand', 'two'), pairs: W('hand', 'pairs'), does: W('hand', 'does'), wavelength: W('hand', 'wavelength'), math: W('hand', 'math'), all: W('hand', 'all'), handwriting: W('hand', 'handwriting'),
    homework2: W('end', 'homework'), done: W('end', 'done'), burrito: W('end', 'burrito'), still: W('end', 'still'), frozen2: W('end', 'frozen'),
  };
  const ENDCARD = t.frozen2 + 0.6;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the worksheet (CHEM: Lewis H₂O, the oven's wavelength, q = mcΔT) — every figure tagged
  const tag = (list, tg) => list.map((q) => ({ ...q, tag: tg }));
  const sheet = makeSheet(G, { rich: true, seed: 82, name: 'Derek', title: 'CHEM 1A · PROBLEM SET 5', note: 'Due Friday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 1', problems: [
    { q: '1.  Draw the Lewis structure of H₂O.\n     Why is water polar?', h: 1.3, fig: ({ k, y }) => {
      const lw = tag(FIG.lewis(k, 290, y + 200, 'H2O', { u: 40, gap: 104 }), 'lewis');
      const lab = k.text('shape:', 520, y + 136, { u: 25 }), bent = k.text('bent', k.bbox(lab).x1 + 30, y + 136, { u: 27 }), ring = k.ring(bent, { pad: 8 });
      const deg = k.text('104.5°', k.bbox(ring).x1 + 16, y + 136, { u: 23 });
      const pairs = k.text('2 lone pairs on O', 520, y + 200, { u: 25 }), pol = k.text('O pulls e^- → polar', 520, y + 262, { u: 25 });
      return [...lw, ...tag([...lab, ...bent, ...ring, ...deg], 'bent'), ...tag(pairs, 'pairs'), ...tag(pol, 'polar')]; } },
    { q: '2.  A microwave oven runs at 2.45 GHz. Find the wavelength.', h: 0.85, fig: ({ k, y }) => {
      const a = k.text('wavelength = c / f', 124, y + 118, { u: 26 }), b = k.text('= (3.00 × 10^8) / (2.45 × 10^9)', 124, y + 172, { u: 25 });
      const c = k.text('= 0.122 m = 12.2 cm', 124, y + 228, { u: 27 });
      return tag([...a, ...b, ...c, ...k.ring(c, { pad: 9 })], 'p2'); } },
    { q: '3.  Heat to warm 250 g of water from 20 °C to 100 °C?\n     (c = 4.18 J/g°C)', h: 0.85, fig: ({ k, y }) => {
      const a = k.text('q = mcΔT = (250)(4.18)(80)', 124, y + 150, { u: 26 }), b = k.text('= 83,600 J', 124, y + 206, { u: 28 });
      return tag([...a, ...b, ...k.ring(b, { pad: 9 })], 'p3'); } },
  ] });
  const items = sheet.items, N = sheet.total;
  const cumAt = (pred) => { let a = 0, last = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; if (pred(it)) last = a; } return last; };
  const C_LEWIS = cumAt((it) => it.tag === 'lewis'), C_BENT = cumAt((it) => it.tag === 'bent'), C_PAIRS = cumAt((it) => it.tag === 'pairs'), C_POLAR = cumAt((it) => it.tag === 'polar'), C_P2 = cumAt((it) => it.tag === 'p2');
  const bboxOf = (tg) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const it of items) { if (it.tag !== tg) continue; const ps = it.kind === 'p' ? it.pts : [[it.x, it.y], [it.x + it.w, it.y + it.h]]; for (const [x, y] of ps) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
  const BB = { lewis: bboxOf('lewis'), bent: bboxOf('bent'), pairs: bboxOf('pairs'), p2: bboxOf('p2') };
  const WRITE0 = t.it2 - 0.08, WRITE1 = t.handwriting + 0.25;
  const PK = [[WRITE0, 0], [t.bent - 0.05, C_LEWIS], [t.two - 0.05, C_BENT], [t.does - 0.05, C_PAIRS], [t.wavelength - 0.02, C_POLAR], [t.math + 0.35, C_P2], [WRITE1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  const PHOTO = t.photo + 0.04, SOLVE0 = t.it1 + 0.02, SOLVE1 = t.sheet + 0.3;

  // ---------------------------------------------------------------- sets: the dorm (origin), the giant microwave, the molecule world, the 1945 lab (parked far away)
  const DS = buildDorm(studio); const dormBg = scene.background.clone();
  const { FY } = D;
  const GO = [400, 0, 0], MO = [800, 0, 0], LO = [-400, 0, 0];
  const GW = new THREE.Group(); scene.add(GW); GW.position.set(...GO);
  const MW = new THREE.Group(); scene.add(MW); MW.position.set(...MO);
  const LB = new THREE.Group(); scene.add(LB); LB.position.set(...LO);

  // --- the dorm: a dresser with the microwave on it + the mini fridge (Derek's room, right side, against the back wall)
  const DR = [2.28, 0, -2.95];
  const dresser = new THREE.Group(); DS.low.add(dresser); dresser.position.set(...DR);
  { const wd = std(0x7a5236, 0.7); box(0.64, 0.9, 0.46, wd, dresser, 0, 0.45, 0); for (let i = 0; i < 3; i++) { box(0.58, 0.25, 0.012, std(0x8a6040, 0.65), dresser, 0, 0.16 + i * 0.29, 0.236); box(0.1, 0.02, 0.02, std(0xd8c070, 0.3, { metalness: 0.7 }), dresser, 0, 0.2 + i * 0.29, 0.25); } }
  const fridge = makeMiniFridge(); DS.low.add(fridge); fridge.position.set(1.55, 0, -3.2);
  const mw = makeMicrowave(); DS.low.add(mw.g); mw.g.position.set(DR[0], 0.9, DR[2] + 0.02);
  mw.light.intensity = 0.03;
  const MWW = (x, y, z) => [DR[0] + x, 0.9 + y, DR[2] + 0.02 + z];   // microwave-local → dorm world
  const mwBurrito = makeBurrito(); mw.plate.add(mwBurrito.g); mwBurrito.g.position.y = 0.04;
  const mwBowl = makeBowl(); mw.plate.add(mwBowl);
  const mwFork = makeFork(); mwBowl.add(mwFork.g); mwFork.g.position.set(0.01, 0.02, 0); mwFork.g.rotation.z = -0.3;
  // the stack of worksheets on the microwave top, the teacher's stamp imprint
  const paperM = std(0xf6f3ea, 0.9);
  const stack = new THREE.Group(); DS.low.add(stack);
  { mk(new THREE.BoxGeometry(0.22, 0.03, 0.285), paperM, stack, 0, 0.015, 0).castShadow = true; const top = mk(new THREE.PlaneGeometry(0.22, 0.2847), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), stack, 0, 0.0305, 0); top.rotation.x = -PI / 2; }
  const imprint = mk(new THREE.PlaneGeometry(0.2, 0.065), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), stack, 0, 0.032, 0.06);
  imprint.rotation.set(-PI / 2, 0, 0.2);
  const STACK_AT = MWW(-0.05, 0.3, 0.0);

  // --- the giant microwave (×10) on a giant dresser top in a dim dorm
  const GS = 10;
  const gmw = makeMicrowave(); GW.add(gmw.g); gmw.g.scale.setScalar(GS);
  const GL = (x, y, z) => [GO[0] + x * GS, GO[1] + y * GS, GO[2] + z * GS];   // giant microwave local → world
  { const top = mk(new THREE.PlaneGeometry(40, 30), std(0x7a5236, 0.7), GW, 0, -0.002, -4); top.rotation.x = -PI / 2; top.receiveShadow = true;
    const wall = mk(new THREE.PlaneGeometry(60, 30), std(0x55607a, 0.95), GW, 0, 8, -7); void wall;
    const poster = mk(new THREE.PlaneGeometry(4.4, 3.2), std(0xffffff, 0.8, { map: tex(440, 320, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff4d5e'; c.font = '800 96px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('GAME', w / 2, 140); c.fillText('OVER', w / 2, 240); }) }), GW, -6.5, 6, -6.95); void poster; }
  const gHemi = new THREE.HemisphereLight(0xc9c4ff, 0x4a3828, 0.55); GW.add(gHemi);
  const gKey = new THREE.DirectionalLight(0xfff0dc, 1.1); gKey.position.set(-8, 14, 12); gKey.target.position.set(-0.7, 1.5, 0); GW.add(gKey, gKey.target);
  gKey.castShadow = true; gKey.shadow.mapSize.set(2048, 2048); Object.assign(gKey.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 50 }); gKey.shadow.bias = -0.0005; gKey.shadow.normalBias = 0.03;
  const gBurrito = makeBurrito(); gmw.plate.add(gBurrito.g); gBurrito.g.position.y = 0.04;
  const gBowl = makeBowl(); gmw.plate.add(gBowl); gBowl.position.set(0, 0, 0);
  const gFork = makeFork(); gBowl.add(gFork.g); gFork.g.position.set(0.012, 0.02, 0.005); gFork.g.rotation.set(0.05, 0.4, -0.32);
  // the standing-wave heat map (fixed in the cavity; the plate turns through it)
  const heatT = tex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); const n = 5; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5) * w / n, y = (j + 0.5) * h / n, hot = (i + j) % 2 === 0, r = w / n * 0.62; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hot ? 'rgba(255,70,30,.95)' : 'rgba(60,150,255,.9)'); gr.addColorStop(0.6, hot ? 'rgba(255,120,40,.5)' : 'rgba(80,170,255,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } });
  const heatMap = mk(new THREE.PlaneGeometry(0.31, 0.31), new THREE.MeshBasicMaterial({ map: heatT, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }), gmw.g, CAV.cx, CAV.y0 + 0.012, 0); heatMap.rotation.x = -PI / 2; heatMap.renderOrder = 3;
  // wave chevrons (microwave-local units): from the magnetron through the waveguide into the cavity, then bouncing wall to wall
  const WAVE = 0xff5a3d;
  const wavePaths = [
    [[0.175, 0.2, -0.03], [0.15, 0.225, -0.03], [0.1, 0.225, -0.03], [0.02, 0.2, -0.03], [-0.12, 0.08, 0.08], [-0.22, 0.2, 0.0], [-0.08, 0.26, -0.12], [0.08, 0.1, -0.15], [-0.05, 0.05, 0.12]],
    [[0.09, 0.22, 0.0], [-0.05, 0.12, -0.14], [-0.22, 0.06, -0.02], [-0.1, 0.25, 0.14], [0.07, 0.14, 0.02], [-0.18, 0.2, -0.13]],
    [[0.09, 0.2, -0.06], [-0.2, 0.25, 0.1], [-0.08, 0.05, -0.05], [0.08, 0.24, 0.14], [-0.23, 0.12, -0.12]],
  ];
  const waves = wavePaths.map((P, i) => makeArrows(gmw.g, P, { color: WAVE, count: i ? 10 : 14, size: 0.034, speed: 0.24, emissive: 1.4 }));
  // "only an inch deep": short arrows that stop at the burrito's skin (cavity frame; the plate is parked for that shot)
  const skinArrows = [[[CAV.cx, 0.2, -0.03], [CAV.cx, 0.122, -0.03]], [[CAV.cx - 0.085, 0.17, -0.03], [CAV.cx - 0.042, 0.098, -0.03]], [[CAV.cx + 0.085, 0.17, -0.03], [CAV.cx + 0.042, 0.098, -0.03]]].map((P) => makeArrows(gmw.g, P, { color: 0xffb03a, count: 3, size: 0.016, speed: 0.12, emissive: 1.2 }));
  const gBolts = Array.from({ length: 5 }, () => makeBolt(gmw.g, { segs: 9 }));
  const dBolts = Array.from({ length: 6 }, () => makeBolt(DS.root, { segs: 9 }));
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const tipGlow = gFork.tips.map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xfff27a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); GW.add(s); s.renderOrder = 7; return s; });
  const magGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xff7a3a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); gmw.mag.add(magGlow); magGlow.scale.setScalar(0.24);

  // --- the molecule world: a deep-blue void, a hero H₂O with a face, a field of plain ones, two field plates that swap charge
  { const bg = mk(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, toneMapped: false, map: tex(64, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1838'); gr.addColorStop(0.5, '#123e66'); gr.addColorStop(1, '#0a1838'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) }), MW); void bg; }
  { const R = rng(31); for (let i = 0; i < 260; i++) { const s = mk(new THREE.SphereGeometry(0.04 + R() * 0.05, 8, 6), basic(0x7fc4ff, { transparent: true, opacity: 0.35 + R() * 0.4 }), MW, (R() - 0.5) * 30, (R() - 0.5) * 20, -4 - R() * 20); void s; } }
  const mHemi = new THREE.HemisphereLight(0xdfeaff, 0x1a2a4a, 1.0); MW.add(mHemi);
  const mKey = new THREE.DirectionalLight(0xffffff, 1.5); mKey.position.set(3, 6, 8); MW.add(mKey);
  const hero = makeWater({ face: true }); MW.add(hero.g);
  const minus = signSprite('−', '#ffffff', '#2f6fd1', 190), plusL = signSprite('+', '#ffffff', '#d62f2f', 170), plusR = signSprite('+', '#ffffff', '#d62f2f', 170);
  hero.g.add(minus, plusL, plusR); minus.position.set(0, 0.78, 0.3); plusL.position.set(-0.78, -0.62, 0.3); plusR.position.set(0.78, -0.62, 0.3);
  const crowdM = []; { const R = rng(17); for (let i = 0; i < 34; i++) { const m = makeWater(); MW.add(m.g); const x = (R() - 0.5) * 9, y = (R() - 0.5) * 5.4, z = -3.2 - R() * 7; if (Math.abs(x) < 1.4 && Math.abs(y) < 1.3 && z > -4.5) continue; m.g.position.set(x, y, z); m.g.scale.setScalar(0.75 + R() * 0.4); m.ph = R() * 0.4; m.base = (R() - 0.5) * 0.8; crowdM.push(m); } }
  const plates = [1, -1].map((s) => { const g = new THREE.Group(); MW.add(g); g.position.set(0, s * 3.0, -2.5); const m = new THREE.MeshStandardMaterial({ color: 0xff4a3a, emissive: 0xff2a1a, emissiveIntensity: 0.7, roughness: 0.4 }); box(12, 0.32, 9, m, g); const sg = signSprite('+', '#ffffff', '#d62f2f', 170); g.add(sg); sg.position.set(-2.2, -s * 0.5, 4.2); sg.scale.setScalar(0.85); const sg2 = signSprite('−', '#ffffff', '#2f6fd1', 190); g.add(sg2); sg2.position.copy(sg.position); sg2.scale.setScalar(0.85); return { g, m, sg, sg2 }; });

  // --- the 1945 lab (sepia via a CSS filter on the canvas): radar transmitter cabinet, a magnetron on the bench, signs
  { const fl = mk(new THREE.PlaneGeometry(12, 10), std(0xffffff, 0.85, { map: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(0,0,0,${0.1 + (i % 3) * 0.05})`; g.fillRect(0, i * 32, w, 2); } }, [3, 3]) }), LB, 0, 0, -1); fl.rotation.x = -PI / 2; fl.receiveShadow = true;
    mk(new THREE.PlaneGeometry(12, 5), std(0xb8c4a6, 0.95), LB, 0, 2.5, -3.2);
    mk(new THREE.PlaneGeometry(10, 5), std(0xa8b496, 0.95), LB, -3.6, 2.5, 0).rotation.y = PI / 2;
    mk(new THREE.PlaneGeometry(12, 0.15), std(0x5a4a3a, 0.8), LB, 0, 1.0, -3.19);
    const cab = new THREE.Group(); LB.add(cab); cab.position.set(-1.6, 0, -2.75);
    box(1.3, 2.1, 0.7, std(0x6f7d62, 0.6, { metalness: 0.3 }), cab, 0, 1.05, 0);
    mk(new THREE.PlaneGeometry(1.1, 1.3), std(0xffffff, 0.6, { map: tex(330, 390, (c, w, h) => { c.fillStyle = '#5d6a52'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 60 + (i % 3) * 105, y = 70 + Math.floor(i / 3) * 120; c.fillStyle = '#f2ead6'; c.beginPath(); c.arc(x, y, 38, 0, TAU); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26 * Math.cos(-2 + i), y + 26 * Math.sin(-2 + i)); c.stroke(); } for (let i = 0; i < 8; i++) { c.fillStyle = i % 3 ? '#222' : '#c8402a'; c.beginPath(); c.arc(40 + i * 36, 330, 10, 0, TAU); c.fill(); } }) }), cab, 0, 1.35, 0.351);
    const bench = new THREE.Group(); LB.add(bench); bench.position.set(0.9, 0, -2.4);
    box(1.8, 0.06, 0.8, std(0x6a4a30, 0.6), bench, 0, 0.9, 0); for (const x of [-0.82, 0.82]) for (const z of [-0.34, 0.34]) box(0.06, 0.9, 0.06, std(0x4a3420, 0.6), bench, x, 0.45, z);
    const lm = new THREE.Group(); bench.add(lm); lm.position.set(-0.35, 1.05, 0); lm.scale.setScalar(2.2);   // the magnetron on its stand
    mk(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 20), std(0xc87a3e, 0.3, { metalness: 0.7 }), lm); for (let i = 0; i < 6; i++) box(0.09, 0.004, 0.09, std(0xd5d9dd, 0.35, { metalness: 0.6 }), lm, 0, -0.03 + i * 0.012, 0);
    const horn = mk(new THREE.CylinderGeometry(0.05, 0.12, 0.3, 4, 1, true), std(0x9aa0a6, 0.4, { metalness: 0.6, side: THREE.DoubleSide }), bench, 0.45, 1.15, 0); horn.rotation.z = PI / 2;
    for (const [x, c] of [[-0.75, 0x2a2a2a], [0.2, 0x8a3a2a]]) box(0.25, 0.2, 0.2, std(c, 0.6), bench, x, 1.03, 0.15);
    const sign = (text, w, h, fg, bg2, x, y, px) => mk(new THREE.PlaneGeometry(w, h), std(0xffffff, 0.7, { map: tex(Math.round(w * 300), Math.round(h * 300), (c, cw, ch) => { c.fillStyle = bg2; c.fillRect(0, 0, cw, ch); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(10, 10, cw - 20, ch - 20); c.fillStyle = fg; c.font = `800 ${px}px Fredoka, Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, cw / 2, ch / 2 + 4); }) }), LB, x, y, -3.18);
    sign('RADAR LAB', 1.6, 0.4, '#1d2a1d', '#efe6c8', 0.9, 2.25, 82); sign('DANGER · HIGH VOLTAGE', 1.2, 0.3, '#f2e6c8', '#a8261c', -1.6, 2.45, 34);
    const win = mk(new THREE.PlaneGeometry(1.2, 1.1), basic(0xf6ecd0), LB, 2.6, 1.9, -3.15); void win; }
  const lHemi = new THREE.HemisphereLight(0xfff4e0, 0x5a4a3a, 0.8); LB.add(lHemi);
  const lKey = new THREE.DirectionalLight(0xffe8c8, 1.6); lKey.position.set(3, 6, 6); lKey.target.position.set(0, 1, -1.5); LB.add(lKey, lKey.target); lKey.castShadow = true; lKey.shadow.mapSize.set(1024, 1024); Object.assign(lKey.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const derek = mk1({ skin: 0xf1c7a0, shirt: 0xd8343a, pants: 0x34495e, hair: 0x3a2414, hairStyle: 'messy' });   // 073's Derek
  const phones = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 20, PI * 1.2), std(0x1c1c22, 0.4)); derek.head.add(phones); phones.rotation.set(PI / 2 + 0.3, 0, -0.1 * PI - 0.2); phones.position.set(0, -0.26, 0);
  phones.visible = false;
  const giant = mk1({ skin: 0xf1c7a0, shirt: 0xd8343a, pants: 0x34495e, hair: 0x3a2414, hairStyle: 'messy' });   // Derek ×10 outside the giant door
  const teacher = mk1({ shirt: 0x4f7a9a, pants: 0x4a4038, hair: 0x6a6258, hairStyle: 'side', mustache: true, skin: 0xf2c29a });
  { const sp = makeSpecs(); teacher.head.add(sp); sp.position.set(0, 0.05, 0.262); const bow = box(0.12, 0.05, 0.03, std(0xc1121f, 0.5), teacher.armL.g.parent, 0, 0.36, 0.13); void bow; }
  const stamper = new THREE.Group(); teacher.hand(1).add(stamper); stamper.position.set(0, -0.08, 0.02);
  { mk(new THREE.SphereGeometry(0.04, 12, 8), std(0x5a3a22, 0.5), stamper, 0, 0.04, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), std(0x5a3a22, 0.5), stamper, 0, -0.01, 0); box(0.12, 0.04, 0.08, std(0xc1121f, 0.5), stamper, 0, -0.07, 0); }
  const eng = mk1({ shirt: 0xf4f2ec, pants: 0x4a4a52, hair: 0x2a2018, hairStyle: 'side', skin: 0xf2c29a });   // the 1945 radar engineer (lab coat white, tie)
  { const sp = makeSpecs(); eng.head.add(sp); sp.position.set(0, 0.05, 0.262); box(0.05, 0.22, 0.012, std(0x23324a, 0.5), eng.armL.g.parent, 0, 0.2, 0.148); }
  const pocket = new THREE.Group(); eng.armL.g.parent.add(pocket); pocket.position.set(-0.09, 0.235, 0.158);
  const choc = std(0x5a3418, 0.35);
  { box(0.075, 0.07, 0.008, std(0xe8e6e0, 0.7), pocket, 0, -0.01, 0.004); const bar = new THREE.Group(); pocket.add(bar); bar.position.set(0.006, 0.045, 0.012); bar.rotation.z = 0.12; const wr = tex(128, 192, (c, w, h) => { c.fillStyle = '#b81616'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(0, 70, w, 52); c.fillStyle = '#b81616'; c.font = '800 34px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('CANDY', w / 2, 108); });
    mk(new THREE.BoxGeometry(0.06, 0.1, 0.014), [std(0xd8231f), std(0xd8231f), std(0xd8231f), std(0xd8231f), std(0xffffff, 0.5, { map: wr }), std(0xd8231f)], bar, 0, 0, 0); box(0.058, 0.035, 0.015, choc, bar, 0, 0.058, 0); }
  const stain = mk(new THREE.CircleGeometry(0.06, 24), new THREE.MeshStandardMaterial({ color: 0x4a2a12, roughness: 0.3, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), pocket, 0, -0.06, 0.0092); stain.scale.set(0.6, 1, 1);
  const drips = [-0.025, 0.0, 0.022].map((x, i) => { const d = mk(new THREE.CapsuleGeometry(0.008, 0.04, 4, 8), choc, pocket, x, -0.06, 0.012); d.userData.k = [1.0, 1.4, 0.8][i]; return d; });
  const people = [derek, giant, teacher, eng];
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const handW = (toon, s) => { toon.root.updateMatrixWorld(true); return toon.hand(s).getWorldPosition(V(0, 0, 0)).toArray(); };

  // Vex (cameo upstairs in the two dorm wides): 067/073's look, standing in her room looking down at Derek's floor
  const vbody = await shadeBody('/videos/054-goth-tutor/vex-body2.png');
  const VEX = await makeVroid('/videos/054-goth-tutor/vex.vrm', { textures: { Body_00_SKIN: vbody }, bust: 1.22, thigh: 1.4, calf: 1.15, head: 1.08, eyes: 1.24 });
  dressGoth(VEX); scene.add(VEX.root);
  const vFill = new THREE.PointLight(0xfff0e8, 0, 0, 2); scene.add(vFill);
  const VXZ = [0.95, -1.7];
  const GHS = 5; giant.set({ x: 0, y: 0, z: 0, scale: GHS, rotY: PI }); const GH0 = headW(giant);
  const DK = [1.62, 0, -2.05];   // Derek's spot (dorm)
  const mouthW = () => { const h = headW(derek); const a = derek.root.rotation.y; return [h[0] + Math.sin(a) * 0.3, h[1] - 0.1, h[2] + Math.cos(a) * 0.3]; };
  derek.set({ x: DK[0], y: 0, z: DK[2], rotY: 0.05 }); const BITEPOS = mouthW();
  eng.set({ x: LO[0] - 0.1, y: 0, z: -1.45, rotY: 0.15 }); eng.root.updateMatrixWorld(true); const POCKET = pocket.getWorldPosition(V(0, 0, 0)).toArray();

  // the props in Derek's hands: the burrito (×1.7 for the toon's big hands), a fork, the phone + the printed page
  const hBurrito = makeBurrito(); scene.add(hBurrito.g); hBurrito.g.scale.setScalar(2.3);
  const hFork = makeFork(); scene.add(hFork.g); hFork.g.scale.setScalar(1.7);
  const flatSheet = mk(new THREE.PlaneGeometry(0.22, 0.2847), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85, side: THREE.DoubleSide }), scene); flatSheet.castShadow = true;
  const aPlus = mk(new THREE.PlaneGeometry(0.09, 0.07), new THREE.MeshBasicMaterial({ map: tex(256, 200, (c, w, h) => { c.fillStyle = '#d0141e'; c.font = '170px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A+', w / 2, h / 2 + 10); }), transparent: true, depthWrite: false }), flatSheet, 0.05, 0.09, 0.002);
  // the phone (portrait 720 × 1440 screen canvas) — POV shots ride its screen normal; a hand + sleeve hold it
  const PW = 0.072, PH = 0.144, PHW = 720, PHH = 1440;
  const phone = new THREE.Group(); scene.add(phone);
  const phT = tex(PHW, PHH, () => {});
  rbox(PW + 0.008, PH + 0.012, 0.009, 0.006, std(0x22232a, 0.35), phone);
  const phScr = mk(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false }), phone, 0, 0, 0.0047);
  const phHand = new THREE.Group(); phone.add(phHand);
  { const sk = std(0xf1c7a0, 0.6); const palm = mk(new THREE.SphereGeometry(0.05, 16, 12), sk, phHand, 0.03, -0.06, -0.03); palm.scale.set(1, 1.2, 0.7); const thumb = mk(new THREE.CapsuleGeometry(0.013, 0.04, 4, 8), sk, phHand, -0.046, -0.03, 0.004); thumb.rotation.z = -0.3; const slv = mk(new THREE.CapsuleGeometry(0.05, 0.16, 4, 10), std(0xd8343a, 0.7), phHand, 0.06, -0.17, -0.06); slv.rotation.z = 0.35; }
  const phFlash = mk(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }), phone, 0, 0, 0.0052);
  // the camera insert: a hand holds the phone flat over the stack (the back camera down, its screen up shows the shot)
  const snap = new THREE.Group(); scene.add(snap);
  const snapT = tex(360, 720, () => {});
  { rbox(0.08, 0.009, 0.155, 0.005, std(0x22232a, 0.35), snap); const sc = mk(new THREE.PlaneGeometry(0.072, 0.144), new THREE.MeshBasicMaterial({ map: snapT, toneMapped: false }), snap, 0, 0.0048, 0); sc.rotation.x = -PI / 2;
    const sk = std(0xf1c7a0, 0.6); const palm = mk(new THREE.SphereGeometry(0.05, 16, 12), sk, snap, 0.05, -0.02, 0.06); palm.scale.set(0.9, 0.6, 1.2); const slv = mk(new THREE.CapsuleGeometry(0.05, 0.18, 4, 10), std(0xd8343a, 0.7), snap, 0.11, -0.03, 0.2); slv.rotation.set(PI / 2, 0, 0.5); }
  const snapFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); snap.add(snapFlash); snapFlash.position.y = -0.03; snapFlash.scale.setScalar(0.6);

  // ---------------------------------------------------------------- the phone screen (Scribe): home → camera → solving → the page written in his hand → Download PDF
  const RED = '#9a1c25', SX = 20, SY = 176, SW = 680, SHh = Math.round(680 * sheet.h / sheet.w), KS = SW / sheet.w;
  const nib = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(8, 56); g.rotate(-0.8); g.fillStyle = '#1a1b20'; g.fillRect(0, -7, 54, 14); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(-14, 0); g.lineTo(0, 7); g.fill(); return c; })();
  const rr = (g, x, y, w, h, r, fill, stroke) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } };
  const header = (g, title) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, PHW, 120); g.drawImage(icon, 26, 30, 60, 60); g.fillStyle = '#1d1d1d'; g.font = '42px Georgia, serif'; g.fillText('Scribe', 100, 76);
    if (title) { g.font = '600 22px Inter, Arial'; const tw = g.measureText(title).width; rr(g, 690 - tw - 32, 38, tw + 32, 44, 22, 'rgba(154,28,37,.1)'); g.fillStyle = RED; g.fillText(title, 690 - tw - 16, 68); }
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 120, PHW, 2); };
  const blank = document.createElement('canvas'); blank.width = sheet.w; blank.height = sheet.h;
  { sheet.draw(0, true); blank.getContext('2d').drawImage(sheet.canvas, 0, 0); }
  const TAGS = ['Lewis', 'Wavelength', 'q = mcΔT'];
  let phKey = '';
  function drawPhone(tt) {
    const mode = tt < PHOTO - 0.5 ? 'home' : tt < SOLVE0 ? 'cam' : tt < WRITE0 - 0.05 ? 'solve' : tt < WRITE1 + 0.15 ? 'write' : 'done';
    const p = mode === 'write' || mode === 'done' ? writeP(tt) : 0, k = mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0, fl = mode === 'cam' ? clamp(1 - (tt - PHOTO) / 0.3) * (tt >= PHOTO ? 1 : 0) : 0;
    const key = `${mode}|${Math.round(p * 4)}|${Math.round(k * 30)}|${Math.round(fl * 10)}`;
    if (key === phKey) return; phKey = key;
    const g = phT.canvas.getContext('2d');
    g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, PHW, PHH);
    if (mode === 'home') {
      header(g, '');
      g.drawImage(icon, PHW / 2 - 130, 300, 260, 260);
      g.fillStyle = '#1d1d1d'; g.font = '62px Georgia, serif'; g.textAlign = 'center'; g.fillText('Scribe', PHW / 2, 650);
      g.fillStyle = '#555'; g.font = 'italic 34px Georgia, serif'; g.fillText('Your homework,', PHW / 2, 730); g.fillText('in your handwriting.', PHW / 2, 776);
      rr(g, 110, 900, 500, 120, 60, RED); g.fillStyle = '#fff'; g.font = '600 40px Inter, Arial'; g.fillText('Snap homework', PHW / 2, 975);
      g.strokeStyle = '#fff'; g.lineWidth = 5; g.textAlign = 'left';
      rr(g, 110, 1060, 500, 100, 50, null, 'rgba(0,0,0,.2)'); g.fillStyle = '#555'; g.font = '500 32px Inter, Arial'; g.textAlign = 'center'; g.fillText('Upload a PDF', PHW / 2, 1122); g.textAlign = 'left';
    } else if (mode === 'cam') {
      g.fillStyle = '#111'; g.fillRect(0, 0, PHW, PHH);
      g.save(); g.translate(PHW / 2, 640); g.rotate(-0.04); g.drawImage(blank, -300, -388, 600, 776); g.restore();
      g.strokeStyle = '#ffd23f'; g.lineWidth = 8; for (const [x, y, sx, sy] of [[40, 230, 1, 1], [680, 230, -1, 1], [40, 1050, 1, -1], [680, 1050, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 70); g.lineTo(x, y); g.lineTo(x + sx * 70, y); g.stroke(); }
      g.fillStyle = '#fff'; g.font = '600 30px Inter, Arial'; g.textAlign = 'center'; g.fillText('CHEM 1A · 1 page', PHW / 2, 150);
      g.beginPath(); g.arc(PHW / 2, 1250, 72, 0, TAU); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.arc(PHW / 2, 1250, 60, 0, TAU); g.stroke(); g.textAlign = 'left';
      if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, PHW, PHH); }
    } else if (mode === 'solve') {
      header(g, 'CHEM 1A');
      g.save(); g.translate(PHW / 2, 470); g.rotate(-0.03); g.drawImage(blank, -190, -246, 380, 492); g.strokeStyle = 'rgba(0,0,0,.15)'; g.strokeRect(-190, -246, 380, 492); g.restore();
      const n = Math.min(3, Math.floor(k * 3.2));
      g.fillStyle = RED; g.font = '700 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('CHEMISTRY · 3 PROBLEMS', PHW / 2, 790);
      g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.fillText(n >= 3 ? 'All 3 solved.' : `Solving… ${n}/3`, PHW / 2, 860);
      for (let i = 0; i < 3; i++) { const x = 70 + i * 200, y = 920, done = i < n; rr(g, x, y, 180, 180, 24, done ? '#2f9e5b' : '#e3ddd0'); g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 70px Inter, Arial'; g.fillText(done ? '✓' : String(i + 1), x + 90, y + 115); g.fillStyle = done ? '#2f6e48' : '#6b665c'; g.font = '500 26px Inter, Arial'; g.fillText(TAGS[i], x + 90, y + 228); }
      rr(g, 70, 1210, 580, 22, 11, '#e3ddd0'); rr(g, 70, 1210, Math.max(22, 580 * k), 22, 11, RED); g.textAlign = 'left';
    } else {
      header(g, 'CHEM 1A');
      const tip = sheet.draw(p); g.fillStyle = '#fff'; g.fillRect(SX - 4, SY - 4, SW + 8, SHh + 8); g.drawImage(sheet.canvas, SX, SY, SW, SHh); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(SX, SY, SW, SHh);
      if (mode === 'write' && p > 0 && p < N - 0.5) g.drawImage(nib, SX + tip[0] * KS - 6, SY + tip[1] * KS - 58, 64, 64);
      g.fillStyle = '#6b6b6b'; g.font = '500 26px Inter, Arial'; g.fillText(mode === 'done' ? 'Done · 3/3 · in your handwriting' : 'Writing it in your handwriting…', 30, 150);
      if (mode === 'done') { rr(g, 110, 1250, 500, 110, 55, RED); g.fillStyle = '#fff'; g.font = '600 40px Inter, Arial'; g.textAlign = 'center'; g.fillText('Download PDF', PHW / 2, 1320); g.textAlign = 'left'; }
    }
    phT.needsUpdate = true;
  }
  // the snap phone's own screen: the viewfinder, then the flash
  let snapKey = '';
  function drawSnap(tt) {
    const fl = tt >= PHOTO ? clamp(1 - (tt - PHOTO) / 0.3) : 0, key = Math.round(fl * 10);
    if (key === snapKey) return; snapKey = key;
    const g = snapT.canvas.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, 360, 720); g.drawImage(blank, 30, 130, 300, 388);
    g.strokeStyle = '#ffd23f'; g.lineWidth = 5; g.strokeRect(24, 124, 312, 400); g.fillStyle = '#fff'; g.beginPath(); g.arc(180, 630, 40, 0, TAU); g.fill();
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, 360, 720); }
    snapT.needsUpdate = true;
  }
  const UV = (x, y) => [x / PHW, y / PHH];
  const sheetUV = (sx, sy) => UV(SX + sx * KS, SY + sy * KS);

  // ---------------------------------------------------------------- FX + kicks + per-gag times
  const fx = makeFX(scene, { max: { dust: 300, confetti: 400, spark: 300, glow: 60, smoke: 300, drops: 300, rock: 200, mist: 200 }, nearFade: [0.15, 0.7] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.1, 0.18);
  kick(t.work + 0.05, 0.5); kick(t.magnetron, 0.35); kick(t.box + 0.05, 0.6); kick(t.magnet, 0.45); kick(t.spins1, 0.5); kick(t.heat + 0.05, 0.7);
  const SPLIT = t.but + 0.1; kick(SPLIT + 0.25, 0.4); kick(t.deep, 0.3);
  const BITE1 = t.outside + 0.25, BITE2 = t.frozen1 - 0.05; kick(t.lava, 0.8); kick(BITE2 + 0.02, 0.8);
  kick(t.cold, 0.3); kick(t.spins2 + 0.05, 0.5);
  const ZAP = t.lightning - 0.08; kick(ZAP, 1.3, 0.8); kick(ZAP + 0.3, 0.6);
  kick(t.melted + 0.1, 0.3); kick(t.pocket, 0.7);
  const SLAM = t.homework1 + 0.05, STAMP = t.hand1 + 0.04; kick(SLAM, 0.8); kick(STAMP, 0.9);
  kick(t.microwaved, 0.8); kick(PHOTO, 0.4); kick(SOLVE1, 0.4); kick(t.done, 0.6); kick(t.frozen2 - 0.05, 0.9);
  const HEAT0 = t.heat - 0.12;
  // FX
  fx.stream('smoke', 0, t.a1, { pos: GL(CAV.cx - 0.02, CAV.y0 + 0.08, 0.02), rate: 4, size: [0.15, 0.3], speed: [0.1, 0.3], spread: 0.4, life: [0.8, 1.2], g: -0.4, color: 0xeeeeee, alpha: 0.35 });
  fx.stream('smoke', HEAT0, t.but - 0.05, { pos: [MO[0], MO[1] + 0.3, MO[2] - 1], box: [5, 3, 2], rate: 26, size: [0.3, 0.6], speed: [0.4, 1.0], spread: 0.6, life: [0.8, 1.3], g: -1.2, color: 0xffd8b0 });
  fx.burst('drops', t.heat + 0.05, { pos: [MO[0] + 0.3, MO[1] + 0.45, MO[2] + 0.45], n: 12, spread: 1.2, speed: [1, 2.2], size: [0.04, 0.07], color: 0x8fd8f7 });
  fx.stream('smoke', SPLIT, t.outside - 0.1, { pos: GL(CAV.cx, CAV.y0 + 0.1, 0.0), box: [0.6, 0.1, 0.4], rate: 14, size: [0.25, 0.5], speed: [0.3, 0.7], spread: 0.4, life: [0.8, 1.3], g: -1.0, color: 0xffffff });
  // the bites happen at Derek's mouth (dorm; positions resolved at the first frame of the shot)
  fx.burst('glow', t.lava - 0.05, { pos: add(BITEPOS, [0, 0, 0.15]), n: 4, spread: 0.2, speed: [0.3, 0.6], size: [0.35, 0.6], color: 0xff7a1f });
  fx.burst('smoke', t.lava, { pos: add(BITEPOS, [0, 0.05, 0.12]), n: 14, spread: 0.5, speed: [0.6, 1.4], size: [0.12, 0.24], life: [0.7, 1.1], g: -2, color: 0x6a6a6a });
  fx.burst('spark', t.lava - 0.02, { pos: add(BITEPOS, [0, 0, 0.12]), n: 30, spread: 1.4, speed: [0.8, 2.2], color: 0xff9a3a });
  fx.burst('rock', BITE2 + 0.02, { pos: add(BITEPOS, [0, 0, 0.14]), n: 22, spread: 1.6, speed: [0.8, 2.0], size: [0.012, 0.03], color: 0xd8f2ff, floor: 0 });
  fx.burst('mist', BITE2 + 0.04, { pos: add(BITEPOS, [0, 0.05, 0.1]), n: 12, spread: 0.6, speed: [0.3, 0.8], size: [0.12, 0.22], color: 0xe6f6ff });
  fx.burst('rock', t.frozen2 - 0.04, { pos: add(BITEPOS, [0, 0, 0.14]), n: 22, spread: 1.6, speed: [0.8, 2.0], size: [0.012, 0.03], color: 0xd8f2ff, floor: 0 });
  fx.burst('mist', t.frozen2, { pos: add(BITEPOS, [0, 0.05, 0.1]), n: 12, spread: 0.6, speed: [0.3, 0.8], size: [0.12, 0.22], color: 0xe6f6ff });
  // the fork: sparks at the tines (giant), the blast in the dorm
  for (let k = 0; k < 5; k++) fx.burst('spark', t.charge + 0.15 + k * 0.17, { pos: GL(CAV.cx + 0.01, CAV.y0 + 0.2, 0.0), n: 10, spread: 1.6, speed: [1.5, 4], size: [0.08, 0.18], color: 0xfff27a });
  fx.burst('glow', ZAP, { pos: MWW(-0.07, 0.15, 0.25), n: 5, spread: 0.6, speed: [0.5, 1], size: [1.2, 2.0], color: 0xbfe8ff });
  fx.burst('spark', ZAP, { pos: MWW(-0.07, 0.15, 0.25), n: 70, spread: 2.2, speed: [1.5, 4.5], size: [0.04, 0.1], color: 0xcff4ff });
  fx.stream('smoke', ZAP + 0.05, t.invented + 0.2, { pos: MWW(-0.07, 0.2, 0.22), box: [0.3, 0.1, 0.1], rate: 30, size: [0.2, 0.45], speed: [0.3, 0.9], spread: 0.6, life: [0.9, 1.4], g: -1.2, color: 0x4a4a4a });
  // 1945: steam off the melting bar
  fx.stream('mist', t.candy, t.now - 0.05, { pos: add(POCKET, [0, 0.05, 0.03]), rate: 8, size: [0.04, 0.08], speed: [0.1, 0.3], spread: 0.2, life: [0.6, 1.0], g: -0.6, color: 0xffffff });
  // the teacher's stack + the stamp; cooked; done
  fx.burst('dust', SLAM, { pos: add(STACK_AT, [0, 0.02, 0]), n: 10, spread: 1.2, speed: [0.3, 0.8], size: [0.1, 0.2], alpha: 0.45, color: 0xe6e0d6 });
  fx.burst('drops', t.microwaved + 0.02, { pos: add(GL(CAV.cx, CAV.y0 + 0.009, 0), [0, 1.5, 0]), n: 14, spread: 1.4, speed: [1.0, 2.2], size: [0.02, 0.035], color: 0x8fd8f7 });
  fx.burst('confetti', t.done, { pos: [DK[0], 2.0, DK[2] + 0.3], n: 140, spread: 1.6, speed: [1.5, 3.5], size: [0.03, 0.06] });

  // ---------------------------------------------------------------- the end card (Scribe) via the 049 HUD
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: [[0, 0]], day: [[0, '']], feed: [], map: { shoreR: () => 1, spots: [], dots: () => [] },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- cameras
  const dolly = (p0, p1, l0, l1, fov, t0, t1) => (tt) => { const u = smooth(u01(tt, t0, t1)); return { pos: [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), lerp(p0[2], p1[2], u)], look: [lerp(l0[0], l1[0], u), lerp(l0[1], l1[1], u), lerp(l0[2], l1[2], u)], fov }; };
  const faceCam = (toon, off, lk, fov, push = 0, t0 = 0, t1 = 1) => (tt) => { const h = headW(toon), u = smooth(u01(tt, t0, t1)), s = 1 - push * u; return { pos: [h[0] + off[0] * s, h[1] + off[1], h[2] + off[2] * s], look: add(h, lk), fov }; };
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), scrQ = new THREE.Quaternion(), scrU = V(0, 0, 0);
  const phoneCam = (u, v0, d, fov = 40, fy = 0.5) => { const v = v0 - (fy - 0.5) * (2 * d * Math.tan(fov * PI / 360) / PH); phScr.updateWorldMatrix(true, false); phScr.localToWorld(scrP.set((u - 0.5) * PW, (0.5 - v) * PH, 0)); phScr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const p = scrP.clone().addScaledVector(scrN, d); return { pos: p.toArray(), look: scrP.toArray(), fov, up: scrU.toArray() }; };
  const easeUV = (tt, a, b, A, Bp) => { const u = smooth(u01(tt, a, b)); return [lerp(A[0], Bp[0], u), lerp(A[1], Bp[1], u)]; };
  const uvLewis = sheetUV(BB.lewis.cx, BB.lewis.cy + 10), uvBent = sheetUV(BB.bent.cx - 40, (BB.bent.cy + BB.pairs.cy) / 2 + 10), uvP2 = sheetUV(BB.p2.cx - 10, BB.p2.cy);
  const GC = GL(CAV.cx, CAV.cy, 0);   // the giant cavity centre (world)
  const SHOTS = [
    // HOOK — inside the giant microwave: Derek's giant face at the door window, the burrito turning in front
    { id: 'hook', t0: 0, set: 'gmw', cam: dolly(GL(CAV.cx + 0.03, CAV.y0 + 0.1, CAV.z0 + 0.03), GL(CAV.cx + 0.025, CAV.y0 + 0.105, CAV.z0 + 0.08), GL(CAV.cx - 0.02, 0.1, CAV.z1 + 0.2), GL(CAV.cx - 0.02, 0.105, CAV.z1 + 0.2), 62, 0, t.a1) },
    // MAG — the top cutaway: the magnetron fires, the waves run through the waveguide into the box
    { id: 'mag1', t0: t.a1 - 0.04, set: 'gmw', cut: true, cam: dolly(GL(0.38, 0.62, 0.26), GL(0.34, 0.58, 0.22), GL(0.16, 0.16, -0.03), GL(0.13, 0.17, -0.03), 46, t.a1, t.into) },
    { id: 'mag2', t0: t.into - 0.05, set: 'gmw', cut: true, cam: dolly(GL(0.05, 0.78, 0.55), GL(-0.02, 0.7, 0.48), GL(-0.04, 0.12, -0.02), GL(-0.06, 0.12, -0.02), 50, t.into, t.water1) },
    // WATER — the hero molecule
    { id: 'water1', t0: t.water1 - 0.04, set: 'mol', cam: dolly([MO[0] + 0.1, MO[1] + 0.95, MO[2] + 4.4], [MO[0] + 0.05, MO[1] + 0.85, MO[2] + 3.7], [MO[0], MO[1] + 0.55, MO[2]], [MO[0], MO[1] + 0.5, MO[2]], 44, t.water1, t.the1) },
    // SPIN — the plates flip, every molecule flip-flops, then they glow
    { id: 'spin1', t0: t.the1 - 0.04, set: 'mol', cam: dolly([MO[0] + 0.4, MO[1] + 0.3, MO[2] + 7.8], [MO[0] + 0.2, MO[1] + 0.25, MO[2] + 7.0], [MO[0], MO[1], MO[2] - 1.5], [MO[0], MO[1], MO[2] - 1.5], 54, t.the1, t.so1) },
    { id: 'spin2', t0: t.so1 - 0.04, set: 'mol', cam: dolly([MO[0] - 1.2, MO[1] + 0.9, MO[2] + 5.2], [MO[0] - 0.6, MO[1] + 0.8, MO[2] + 4.6], [MO[0] - 0.2, MO[1] + 0.2, MO[2] - 1.0], [MO[0], MO[1] + 0.2, MO[2] - 1.0], 50, t.so1, t.spinning) },
    { id: 'heat', t0: t.spinning - 0.04, set: 'mol', cam: dolly([MO[0], MO[1] + 0.95, MO[2] + 4.2], [MO[0], MO[1] + 0.9, MO[2] + 3.6], [MO[0], MO[1] + 0.5, MO[2]], [MO[0], MO[1] + 0.48, MO[2]], 46, t.spinning, t.but) },
    // DEEP — the burrito sliced on the giant turntable: a lava ring round a frozen core
    { id: 'deep1', t0: t.but - 0.04, set: 'gmw', cam: dolly(GL(CAV.cx + 0.03, 0.12, 0.16), GL(CAV.cx + 0.015, 0.105, 0.15), GL(CAV.cx, 0.08, 0.0), GL(CAV.cx, 0.078, 0.0), 50, t.but, t.outside) },
    // the two bites (dorm)
    { id: 'lava', t0: t.outside - 0.06, set: 'dorm', cam: faceCam(derek, [0.25, 0.1, 2.3], [0, -0.3, 0], 40, 0.12, t.outside, t.middle) },
    { id: 'frozen', t0: t.middle - 0.06, set: 'dorm', cam: faceCam(derek, [-0.3, 0.08, 2.2], [0, -0.3, 0], 40, 0.12, t.middle, t.waves) },
    // SPOTS — the heat map from above, then the plate spinning through it
    { id: 'spots1', t0: t.waves - 0.04, set: 'gmw', cut: true, cam: dolly(GL(CAV.cx + 0.005, 0.66, 0.06), GL(CAV.cx + 0.005, 0.6, 0.05), GL(CAV.cx, CAV.y0, 0.0), GL(CAV.cx, CAV.y0, -0.005), 46, t.waves, t.so2) },
    { id: 'spots2', t0: t.so2 - 0.04, set: 'gmw', cut: true, cam: dolly(GL(CAV.cx + 0.1, 0.46, 0.13), GL(CAV.cx + 0.08, 0.42, 0.11), GL(CAV.cx, CAV.y0 + 0.02, -0.01), GL(CAV.cx, CAV.y0 + 0.02, -0.01), 50, t.so2, t.fork) },
    // FORK — Derek grins with a fork; the tines charge up (giant); LIGHTNING (the dorm wide + Vex upstairs)
    { id: 'fork1', t0: t.fork - 0.04, set: 'dorm', cam: faceCam(derek, [-0.3, 0.05, 2.3], [0.08, -0.3, 0], 40) },
    { id: 'fork2', t0: t.charge - 0.04, set: 'gmw', cut: true, cam: dolly(GL(CAV.cx + 0.17, 0.3, 0.22), GL(CAV.cx + 0.13, 0.28, 0.19), GL(CAV.cx + 0.005, CAV.y0 + 0.13, 0), GL(CAV.cx + 0.005, CAV.y0 + 0.14, 0), 46, t.charge, t.f8) },
    { id: 'boom', t0: t.f8 - 0.04, set: 'dorm', vex: true, cam: dolly([1.55, 3.0, 6.4], [1.5, 3.05, 6.0], [1.55, 3.0, -1.7], [1.5, 3.0, -1.7], 50, t.f8, t.invented) },
    // 1945 — the radar lab (sepia), the candy bar melting in his pocket
    { id: 'lab1', t0: t.invented - 0.04, set: 'lab', cam: dolly([LO[0] + 0.55, 1.25, 1.0], [LO[0] + 0.45, 1.22, 0.75], [LO[0] - 0.15, 0.82, -1.45], [LO[0] - 0.15, 0.82, -1.45], 48, t.invented, t.a2) },
    { id: 'lab2', t0: t.a2 - 0.04, set: 'lab', cam: dolly(add(POCKET, [0.3, 0.28, 1.15]), add(POCKET, [0.25, 0.25, 0.95]), add(POCKET, [0.04, 0.2, 0]), add(POCKET, [0.04, 0.19, 0]), 44, t.a2, t.now) },
    // TEACHER — the stack slams onto the microwave, the question, the stamp
    { id: 'tc1', t0: t.now - 0.04, set: 'dorm', cam: dolly([2.0, 1.45, 0.55], [2.0, 1.42, 0.25], [2.1, 0.78, -2.3], [2.1, 0.78, -2.3], 50, t.now, t.draw) },
    { id: 'tc2', t0: t.draw - 0.04, set: 'dorm', cam: dolly(add(STACK_AT, [-0.02, 0.34, 0.03]), add(STACK_AT, [-0.022, 0.31, 0.02]), add(STACK_AT, [-0.024, 0.03, -0.06]), add(STACK_AT, [-0.024, 0.03, -0.062]), 44, t.draw, t.by) },
    { id: 'tc3', t0: t.by - 0.04, set: 'dorm', cam: dolly(add(STACK_AT, [0.25, 0.5, 0.45]), add(STACK_AT, [0.22, 0.46, 0.4]), add(STACK_AT, [0.0, 0.05, 0.0]), add(STACK_AT, [0.0, 0.05, 0.0]), 48, t.by, t.you) },
    // COOKED — Derek spinning on the giant turntable
    { id: 'cooked', t0: t.you - 0.04, set: 'gmw', cam: dolly(GL(CAV.cx + 0.03, 0.14, 0.16), GL(CAV.cx + 0.02, 0.135, 0.15), GL(CAV.cx, 0.122, 0), GL(CAV.cx, 0.12, 0), 58, t.you, t.so3) },
    // SCRIBE — the phone: open, one photo, solved
    { id: 'ph1', t0: t.so3 - 0.04, set: 'dorm', phone: true, cam: (tt) => phoneCam(0.5, 0.42, lerp(0.26, 0.21, smooth(u01(tt, t.so3, t.one))), 40) },
    { id: 'ph2', t0: t.one - 0.04, set: 'dorm', snap: true, cam: dolly(add(STACK_AT, [-0.12, 0.78, 0.34]), add(STACK_AT, [-0.1, 0.72, 0.3]), add(STACK_AT, [0.0, 0.2, 0.02]), add(STACK_AT, [0.0, 0.2, 0.02]), 44, t.one, t.it1) },
    { id: 'ph3', t0: t.it1 - 0.04, set: 'dorm', phone: true, cam: (tt) => phoneCam(0.5, 0.5, lerp(0.2, 0.18, smooth(u01(tt, t.it1, t.it2))), 40) },
    // HAND — the page writes itself on the phone screen: the Lewis structure, bent, lone pairs, the wavelength, the whole page
    { id: 'w1', t0: t.it2 - 0.04, set: 'dorm', phone: true, cam: (tt) => { const uv = easeUV(tt, t.it2, t.it2 + 0.4, [0.5, 0.42], uvLewis); return phoneCam(uv[0], uv[1], lerp(0.12, 0.085, smooth(u01(tt, t.it2, t.it2 + 0.5))), 40, 0.7); } },
    { id: 'w2', t0: t.bent - 0.06, set: 'dorm', phone: true, cam: (tt) => { const uv = easeUV(tt, t.bent - 0.06, t.bent + 0.3, uvLewis, uvBent); return phoneCam(uv[0], uv[1], 0.09, 40, 0.7); } },
    { id: 'w3', t0: t.does - 0.04, set: 'dorm', phone: true, cam: (tt) => { const uv = easeUV(tt, t.does - 0.04, t.does + 0.3, uvBent, uvP2); return phoneCam(uv[0], uv[1], 0.1, 40, 0.7); } },
    { id: 'w4', t0: t.all - 0.04, set: 'dorm', phone: true, cam: (tt) => { const u = smooth(u01(tt, t.all, t.handwriting + 0.4)); return phoneCam(0.5, lerp(uvP2[1], 0.5, u), lerp(0.1, 0.2, u), 40, lerp(0.7, 0.5, u)); } },
    // END — the dorm wide (homework: done, Vex nods), then the burrito: still frozen
    { id: 'done', t0: t.homework2 - 0.04, set: 'dorm', vex: true, cam: dolly([1.5, 3.0, 6.1], [1.55, 3.0, 5.7], [1.5, 3.0, -1.7], [1.55, 3.0, -1.7], 50, t.homework2, t.burrito) },
    { id: 'end', t0: t.burrito - 0.04, set: 'dorm', cam: faceCam(derek, [0.2, 0.08, 2.4], [0, -0.3, 0], 40, 0.15, t.burrito, t.frozen2 + 0.3) },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // ---------------------------------------------------------------- per-frame
  const DORM_LIGHTS = { hemi: DS.lights.hemi.intensity, key: DS.lights.key.intensity };
  function useSet(sh) {
    DS.root.visible = sh.set === 'dorm'; GW.visible = sh.set === 'gmw'; MW.visible = sh.set === 'mol'; LB.visible = sh.set === 'lab';
    for (const o of [dresser, fridge, mw.g, stack]) o.visible = sh.set === 'dorm';
    scene.fog = null;
    scene.background = sh.set === 'dorm' ? dormBg : sh.set === 'gmw' ? new THREE.Color(0x1a1826) : sh.set === 'mol' ? new THREE.Color(0x0a1838) : new THREE.Color(0xd8ccb0);
    scene.environmentIntensity = sh.set === 'mol' ? 0.6 : 0.4;
    canvasEl.style.filter = sh.set === 'lab' ? 'sepia(0.85) contrast(1.08) brightness(1.03)' : '';
    studio.camera.near = sh.set === 'gmw' || sh.phone ? 0.01 : 0.05; studio.camera.far = 200; studio.camera.updateProjectionMatrix();
  }
  const hideAll = () => {
    for (const r of people) r.root.visible = false;
    VEX.root.visible = false; vFill.intensity = 0;
    for (const x of [hBurrito.g, hFork.g, flatSheet, phone, snap]) x.visible = false;
    for (const s of tipGlow) s.visible = false;
    gBolts.forEach((b) => (b.g.visible = false)); dBolts.forEach((b) => (b.g.visible = false));
    waves.forEach((w) => w.update(0, 0)); skinArrows.forEach((w) => w.update(0, 0));
    heatMap.material.opacity = 0; gmw.cutaway(false); gBurrito.split(0); gBowl.visible = false; mwBowl.visible = false; mwBurrito.g.visible = true;
    stamper.visible = false; imprint.visible = false; aPlus.visible = false;
    DS.setPower(1, 1);
  };
  const flipPhase = (tt) => { let ph = 0; const t0 = t.field, steps = 120, dt = Math.max(0, tt - t0) / steps; for (let i = 0; i < steps; i++) { const x = t0 + (i + 0.5) * dt; ph += dt * (x < t.so1 ? 7 : lerp(7, 34, smooth(u01(x, t.so1, t.spins1 + 0.2)))); } return ph; };

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; useSet(sh); hideAll();

    // ======================================================== the dorm
    if (sh.set === 'dorm') {
      // power: the lightning blacks out Derek's room (upstairs stays lit)
      if (id === 'boom') { const z = tt - ZAP; DS.setPower(1, z < 0 ? 1 : z < 0.12 ? 2.5 : 0.18 + 0.1 * (Math.sin(tt * 40) > 0.6 ? 1 : 0)); }
      mw.setDisplay(id === 'boom' && tt > ZAP ? 'ERR' : id === 'end' || id === 'done' ? 'BEEP' : '3:00', id === 'boom' && tt > ZAP + 0.2 ? 0 : 1);
      mw.door.rotation.y = id === 'fork1' || id === 'lava' || id === 'frozen' || id === 'end' ? -1.45 : id === 'boom' ? -lerp(0, 1.9, bump(tt, ZAP, ZAP + 0.12)) : 0;
      mw.light.intensity = (id === 'boom' && tt > ZAP + 0.15) ? 0 : 0.03;
      mw.plate.rotation.y = tt * 1.2;
      mwBowl.visible = id === 'fork1' || id === 'boom'; mwBurrito.g.visible = !mwBowl.visible && id !== 'lava' && id !== 'frozen' && id !== 'end';
      stack.visible = ['tc1', 'tc2', 'tc3', 'ph2'].includes(id);
      if (stack.visible) { const fall = id === 'tc1' ? smooth(u01(tt, SLAM - 0.25, SLAM)) : 1; const from = id === 'tc1' ? handW(teacher, 1) : STACK_AT; stack.position.set(lerp(from[0], STACK_AT[0], fall * fall), lerp(from[1] - 0.05, STACK_AT[1], fall * fall), lerp(from[2], STACK_AT[2], fall * fall)); stack.rotation.set(0, 0.06, 0); if (id === 'tc1' && tt > SLAM) { const [sx, sy] = squash(tt, SLAM, 0.25); stack.scale.set(sx, sy, sx); } else stack.scale.set(1, 1, 1); }
      imprint.visible = (id === 'tc3' && tt > STAMP) || id === 'ph2'; imprint.scale.setScalar(id === 'tc3' && tt > STAMP ? 1 + 0.4 * Math.exp(-(tt - STAMP) * 14) : 1);
      if (stack.visible) sheet.draw(0); if (id === 'done') sheet.draw(N);
      // Derek
      if (['lava', 'frozen', 'fork1', 'boom', 'tc1', 'end', 'done'].includes(id)) {
        derek.root.visible = true;
        const sooty = ['boom', 'tc1', 'done', 'end'].includes(id) ? (id === 'boom' ? bump(tt, ZAP, ZAP + 0.08) : 0.7) : 0;
        const base = { x: DK[0], y: 0, z: DK[2], rotY: 0.1, t: tt, soot: sooty, hairUp: id === 'boom' ? bump(tt, ZAP, ZAP + 0.1) : sooty * 0.6, noBrows: sooty > 0.5 };
        let p = { ...base };
        if (id === 'lava' || id === 'frozen' || id === 'end') {
          const bite = id === 'lava' ? BITE1 : id === 'frozen' ? BITE2 : t.frozen2 - 0.06;
          const toMouth = pulse(tt, bite - 0.22, 0.2, 0.12, 0.25);
          const hot = id === 'lava' ? bump(tt, t.lava - 0.1, t.lava + 0.1) : 0, cold = id === 'frozen' ? bump(tt, BITE2, BITE2 + 0.1) : id === 'end' ? bump(tt, t.frozen2 - 0.05, t.frozen2 + 0.05) : 0;
          const shiver = cold * 0.04 * Math.sin(tt * 60);
          p = { ...p, rotY: 0.05 + shiver, armL: { x: -1.0 - 0.4 * toMouth, z: 0.25, el: 1.1 + 0.3 * toMouth }, armR: { x: -1.0 - 0.4 * toMouth, z: 0.25, el: 1.1 + 0.3 * toMouth },
            eyes: hot > 0.5 || cold > 0.5 ? 'wide' : 'open', mouth: hot > 0.5 ? 'scream' : cold > 0.5 ? 'teeth' : toMouth > 0.3 ? 'o' : 'grin', brows: hot > 0.5 ? 0.9 : cold > 0.5 ? 0.7 : -0.2,
            faceTint: hot > 0.01 ? [0xff3a1a, 0.45 * hot] : cold > 0.01 ? [0x8fc8ff, 0.42 * cold] : [0, 0], hairUp: hot * 0.8 + base.hairUp, look: [0, -0.3], squash: [1 + 0.05 * (hot + cold) * Math.exp(-3 * Math.max(0, tt - bite)), 1 - 0.05 * (hot + cold) * Math.exp(-3 * Math.max(0, tt - bite))] };
          derek.set(p);
          // the burrito between his hands, lifted to the mouth on the bite; bitten = half (the cut face at the bitten end)
          hBurrito.g.visible = true; const hl = handW(derek, -1), hr = handW(derek, 1), m = mouthW();
          const mid = [(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 0.05, (hl[2] + hr[2]) / 2 + 0.08];
          hBurrito.g.position.set(lerp(mid[0], m[0], toMouth * 0.7), lerp(mid[1], m[1] - 0.06, toMouth * 0.7), Math.max(lerp(mid[2], m[2] + 0.1, toMouth * 0.7), m[2] + 0.04));
          hBurrito.g.rotation.set(0.2, -0.75, 0.05);
          hBurrito.bitten(id === 'lava' ? (tt > bite ? 1 : 0) : 1);
        } else if (id === 'fork1') {
          derek.set({ ...p, rotY: -0.15, armR: { x: -2.5, z: 0.55, el: 1.3 }, armL: { x: -0.3, z: 0.2 }, eyes: 'half', mouth: 'grin', brows: -0.7, look: [0.5, 0.2] });
          hFork.g.visible = true; const h = handW(derek, 1); hFork.g.position.set(h[0], h[1] - 0.06, h[2] + 0.04); hFork.g.rotation.set(0, 0.2, -0.15 + 0.06 * Math.sin(tt * 9));
        } else if (id === 'boom') {
          const z = tt - ZAP, blown = bump(tt, ZAP, ZAP + 0.18);
          derek.set({ ...p, x: DK[0] + 0.1 * blown, z: DK[2] + 0.85 * blown, rotY: 0.3, lean: -0.25 * blown, armL: { x: -2.6 * blown, z: 0.6 }, armR: { x: -2.6 * blown, z: 0.6 }, eyes: z > 0 ? 'spiral' : 'half', mouth: z > 0 ? 'scream' : 'grin', brows: 0.8, squash: z > 0 ? squash(tt, ZAP + 0.05, 0.3) : [1, 1] });
        } else if (id === 'tc1') {
          derek.set({ ...p, rotY: 0.6, eyes: 'wide', mouth: 'o', brows: 0.9, look: [0.6, 0.2] });
          teacher.root.visible = true; const sl = bump(tt, SLAM - 0.3, SLAM);
          teacher.set({ x: 2.55, y: 0, z: -2.05, rotY: -0.9, armR: { x: -1.6 + 0.6 * sl, z: 0.15, el: 0.4 }, armL: { x: -1.6 + 0.6 * sl, z: 0.15, el: 0.4 }, eyes: 'half', mouth: 'flat', brows: -0.8, look: [-0.5, 0], t: tt, lean: 0.15 * sl });
        } else if (id === 'done') {
          const up = bump(tt, t.homework2 + 0.1, t.done);
          derek.set({ ...p, rotY: 0.15, armR: { x: -2.9 * up, z: 0.3, el: 0.2 }, armL: { x: -2.9 * up, z: 0.4, el: 0.2 }, eyes: up > 0.5 ? 'closed' : 'open', mouth: 'grin', brows: 0.3, squash: squash(tt, t.done, 0.2) });
          flatSheet.visible = true; aPlus.visible = tt > t.done; const h = handW(derek, 1); flatSheet.position.set(h[0], h[1] + 0.17, h[2] + 0.03); flatSheet.rotation.set(0, 0.15, 0.05);
        }
      }
      if (id === 'tc3') { teacher.root.visible = true; const st = pulse(tt, STAMP - 0.2, 0.2, 0.15, 0.25); teacher.set({ x: STACK_AT[0] + 0.32, y: 0, z: STACK_AT[2] + 0.42, rotY: -2.4, armR: { x: -1.5 - 0.4 * (1 - st), z: 0.1, el: 0.6 * (1 - st) }, armL: { x: -0.2, z: 0.15 }, eyes: 'half', mouth: 'flat', brows: -0.8, t: tt }); stamper.visible = true; }
      // the phone (held up at a quiet spot in front of the loft) + the snap insert over the stack
      if (sh.phone) { phone.visible = true; phone.position.set(0.6, 1.2, -0.5); phone.rotation.set(-0.35, 0.0, 0); drawPhone(tt); }
      if (sh.snap) { snap.visible = true; drawSnap(tt); const u = smooth(u01(tt, t.one - 0.1, t.photo - 0.05)); snap.position.set(STACK_AT[0] - 0.02, STACK_AT[1] + lerp(0.36, 0.24, u), STACK_AT[2] + 0.02); snap.rotation.set(0, 0.06, 0); snapFlash.material.opacity = tt > PHOTO ? 1 - u01(tt, PHOTO, PHOTO + 0.25) : 0; }
      // Vex upstairs (the two wides)
      if (sh.vex) {
        VEX.root.visible = true;
        const look = id === 'boom' ? bump(tt, ZAP + 0.05, ZAP + 0.35) : 1;
        const nodK = id === 'done' ? 0.25 * Math.sin(Math.max(0, tt - t.done) * 7) * Math.exp(-Math.max(0, tt - t.done) * 1.5) : 0;
        VEX.update(tt, { x: VXZ[0], z: VXZ[1], y: FY, rotY: -0.2, pose: 'cross', sway: 0.1, nod: 0.15 + 0.55 * look + nodK, turn: 0.15, look: [0, -0.6 * look],
          face: { relaxed: 0.12, angry: id === 'boom' ? 0.3 * look : 0.1, surprised: id === 'boom' ? 0.25 * pulse(tt, ZAP, 0.1, 0.2, 0.3) : 0, blink: (((tt + 0.4) % 3.3) < 0.12) ? 1 : 0.03 } });
        vFill.position.set(VXZ[0] + 0.2, FY + 1.6, VXZ[1] + 1.8); vFill.intensity = 2.2;
      }
      // the lightning out of the open microwave door (dorm wide)
      if (id === 'boom' && tt > ZAP - 0.02 && tt < ZAP + 0.5) {
        const o = MWW(-0.07, 0.15, 0.2), on = 1 - u01(tt, ZAP + 0.25, ZAP + 0.5);
        dBolts.forEach((b, i) => { const a = (i / dBolts.length) * TAU + 0.4, L = 0.6 + 0.3 * ((i * 37) % 5) / 5; b.set(o, [o[0] + Math.cos(a) * L, o[1] + Math.sin(a) * L * 0.8, o[2] + 0.4 + 0.2 * Math.sin(a * 3)], 900 + i * 31 + Math.floor(tt * 24), on, 0.18, 0.012); });
      }
    }

    // ======================================================== the giant microwave
    if (sh.set === 'gmw') {
      gmw.cutaway(!!sh.cut); gmw.light.intensity = 0.03 * GS * GS * (id === 'fork2' ? 1.4 : 1); gmw.setDisplay('3:00');
      gmw.door.rotation.y = 0; gmw.fan.rotation.z = tt * 30;
      const spinRate = id === 'spots2' ? lerp(1.2, 9, bump(tt, t.so2 + 0.1, t.spins2 + 0.2)) : 1.2;
      gmw.plate.rotation.y = id === 'deep1' ? 0 : id === 'spots2' ? 1.2 * t.so2 + (tt - t.so2) * spinRate * 0.6 : tt * 1.2;
      gBurrito.g.visible = id !== 'fork2' && id !== 'cooked'; gBowl.visible = id === 'fork2';
      if (id === 'deep1') { const k = bump(tt, SPLIT, SPLIT + 0.35); gBurrito.split(k, 0); const [L, R] = gBurrito.halves; L.h.position.x = 0.02 * k; L.h.rotation.y = -(PI / 2) * k; R.h.position.set(0.05 + 0.12 * k, 0, -0.04 * k); R.h.rotation.y = 0.6 * k; R.face.visible = false;
        skinArrows.forEach((a) => a.update(tt, bump(tt, t.inch - 0.1, t.inch + 0.1))); }
      // the magnetron + waves
      const fire = id === 'hook' ? 0.5 : id === 'mag1' ? bump(tt, t.fires - 0.1, t.fires + 0.1) * 0.6 + bump(tt, t.magnetron - 0.15, t.magnetron + 0.05) * 0.4 : 1;
      gmw.magGlowM.emissiveIntensity = 3.2 * fire * (0.85 + 0.15 * Math.sin(tt * 30)); magGlow.material.opacity = (sh.cut ? 1 : 0) * fire;
      if (id === 'mag1' || id === 'mag2') waves.forEach((w, i) => w.update(tt + i * 0.37, i === 0 ? bump(tt, t.fires - 0.1, t.fires + 0.15) : bump(tt, t.into, t.into + 0.3)));
      if (id === 'spots1' || id === 'spots2') { waves.forEach((w, i) => w.update(tt + i * 0.37, i ? 0.9 : 0.6)); heatMap.material.opacity = 0.8 * bump(tt, t.cold - 0.15, t.cold + 0.15) + (id === 'spots2' ? 0.8 : 0); if (id === 'spots2') heatMap.material.opacity = 0.8; }
      // the fork: charge piles up on the tines, then lightning (seeded per 1/24 s)
      if (id === 'fork2') {
        const ch = bump(tt, t.charge, t.points + 0.15), zap = tt > t.f8 - 0.25;
        gFork.tips.forEach((tp, i) => { tp.updateWorldMatrix(true, false); const w = tp.getWorldPosition(V(0, 0, 0)); const s = tipGlow[i]; s.visible = true; s.position.copy(w); s.scale.setScalar((0.12 + 0.35 * ch) * (0.85 + 0.25 * Math.sin(tt * 40 + i * 2))); s.material.opacity = ch; });
        gBolts.forEach((b, i) => { const tp = gFork.tips[i % 4]; tp.updateWorldMatrix(true, false); const w = gmw.g.worldToLocal(tp.getWorldPosition(V(0, 0, 0))); const tgt = [[CAV.x0 + 0.01, 0.2, 0.05], [CAV.cx, CAV.y1 - 0.01, -0.1], [CAV.x1 - 0.01, 0.18, -0.06], [CAV.cx + 0.08, CAV.y1 - 0.01, 0.12], [CAV.x0 + 0.01, 0.12, -0.14]][i];
          const on = zap ? 1 : (ch > 0.6 && ((Math.floor(tt * 24) + i) % 3 === 0) ? 0.6 : 0); b.set(w.toArray(), zap ? tgt : [w.x + (tgt[0] - w.x) * 0.25, w.y + (tgt[1] - w.y) * 0.25, w.z + (tgt[2] - w.z) * 0.25], 300 + i * 17 + Math.floor(tt * 24), on, 0.22, zap ? 0.0016 : 0.0009); });
        gmw.light.intensity = 0.03 * GS * GS * (zap ? 4 : 1.2);
      }
      // giant Derek's face at the door window (hook)
      if (id === 'hook') {
        giant.root.visible = true; const win = GL(-0.075, 0.165, 0.215);
        giant.set({ x: win[0] - GH0[0], y: win[1] - GH0[1], z: win[2] + 1.75 - GH0[2], scale: GHS, rotY: PI, eyes: 'wide', mouth: 'o', brows: 0.5, look: [0.1, -0.6], t: tt, squash: [1 + 0.03 * Math.sin(tt * 3), 1 - 0.03 * Math.sin(tt * 3)] });
      }
      // you are microwaved: Derek on the giant turntable, spinning, sweating, glowing
      if (id === 'cooked') {
        derek.root.visible = true; const pc = GL(CAV.cx, CAV.y0 + 0.009, 0), a = gmw.plate.rotation.y, hot = bump(tt, t.you, t.microwaved);
        const spin = (tt - t.microwaved) * 2.4;
        derek.set({ x: pc[0], y: pc[1], z: pc[2], rotY: spin + 0.2, eyes: tt > t.microwaved ? 'spiral' : 'wide', mouth: 'scream', brows: 0.9, armL: { x: -0.6, z: 1.1, el: 0.6 }, armR: { x: -0.6, z: 1.1, el: 0.6 }, faceTint: [0xff5a2a, 0.38 * hot], glow: [0xff6a2a, 0.06 * hot], hairUp: hot * 0.7, t: tt, squash: squash(tt, t.microwaved, 0.18) });
        gmw.plate.rotation.y = spin;
      }
    }

    // ======================================================== the molecule world
    if (sh.set === 'mol') {
      const fieldOn = bump(tt, t.field - 0.1, t.field + 0.15) * (id === 'water1' ? 0 : 1);
      const ph = flipPhase(tt), pol = Math.sin(ph) >= 0 ? 1 : -1, ang = (k) => (PI / 2) * (1 - Math.tanh(4 * Math.sin(ph - k)));
      const heat = bump(tt, HEAT0, t.heat + 0.2);
      plates.forEach((P, i) => { P.g.visible = fieldOn > 0.01; const plus = (i === 0 ? pol : -pol) > 0; P.m.color.setHex(plus ? 0xff4a3a : 0x3a7aff); P.m.emissive.setHex(plus ? 0xff2a1a : 0x1a4aff); P.sg.visible = plus; P.sg2.visible = !plus; });
      const bob = (k) => 0.08 * Math.sin(tt * 1.6 + k);
      const pop = id === 'water1' ? easeOutBack(u01(tt, t.water1 - 0.05, t.water1 + 0.35)) : 1;
      hero.g.position.set(0, bob(0), 0); hero.g.scale.setScalar(Math.max(0.01, pop) * (id === 'water1' ? 1 + 0.08 * Math.exp(-Math.max(0, tt - t.magnet) * 6) : 1));
      hero.g.rotation.z = fieldOn > 0.01 ? ang(0.15) * fieldOn + 0.1 * Math.sin(tt * 2) * (1 - fieldOn) : 0.12 * Math.sin(tt * 2);
      const chg = id === 'water1' ? easeOutBack(u01(tt, t.magnet - 0.1, t.magnet + 0.2)) : 1;
      for (const s of [minus, plusL, plusR]) { s.visible = chg > 0.01; s.scale.setScalar(0.42 * Math.max(0.01, chg)); }
      hero.setHeat(heat);
      const F = hero.F; F.mouth.scale.set(heat > 0.5 ? 1.0 : 1.3, heat > 0.5 ? 1.1 : 0.55, 0.4);
      for (const e of F.eyes) { e.e.scale.setScalar(fieldOn > 0.5 || heat > 0.5 ? 1.18 : 1); e.p.position.set(0.02 * Math.sin(tt * 3), -0.01, 0.05); }
      crowdM.forEach((m, i) => { m.g.rotation.z = fieldOn > 0.01 ? ang(m.ph) * fieldOn + m.base * (1 - fieldOn) : m.base + 0.2 * Math.sin(tt * 1.3 + i); m.g.position.y += 0; m.setHeat(heat); });
    }

    // ======================================================== 1945
    if (sh.set === 'lab') {
      eng.root.visible = true; const melt = bump(tt, t.candy - 0.1, t.pocket + 0.1), look = bump(tt, t.melted - 0.2, t.melted + 0.1);
      eng.set({ x: LO[0] - 0.1, y: 0, z: -1.45, rotY: id === 'lab1' ? 0.35 : 0.15, eyes: look > 0.5 ? 'wide' : 'open', mouth: look > 0.5 ? 'o' : 'smile', brows: look > 0.5 ? 0.9 : 0.1, head: { x: 0.45 * look, y: 0, z: 0 }, look: [0, -0.9 * look],
        armL: id === 'lab1' ? { x: -1.0, z: 0.3, el: 1.2 } : { x: -0.15, z: 0.25 }, armR: id === 'lab1' ? { x: -0.4, z: 0.2 } : { x: -0.2, z: 0.3 }, squash: squash(tt, t.pocket, 0.15), t: tt });
      stain.scale.set(0.5 + 0.6 * melt, 0.5 + 1.0 * melt, 1); stain.position.y = -0.05 - 0.03 * melt; stain.material.opacity = 0.2 + 0.75 * melt;
      drips.forEach((d) => { d.scale.set(1, 0.2 + 2.2 * melt * d.userData.k, 1); d.position.y = -0.06 - 0.05 * melt * d.userData.k; d.visible = melt > 0.05; });
    }

    // ----- camera
    const cam = sh.cam(tt);
    if (cam.up) studio.camera.up.set(...cam.up); else studio.camera.up.set(0, 1, 0);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 6));
    studio.fill.intensity = sh.set === 'mol' ? 0.35 : sh.phone ? 0 : 0.5; studio.fill.distance = 8;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 082-cn-fword-microwaves --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['Derek', derek], ['giant Derek', giant], ['the teacher', teacher], ['the engineer', eng]];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of names) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}
