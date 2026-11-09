// The goth cheat-tutor, v2 (Ally-grade): a sculpted Blender body (tools/anime/body.py → body.glb, loaded by engine/vrm.js) + an anime
// head built here: a warped head with a painted face patch (redrawn per expression), hair from ~45 tapered, layered clumps (blunt
// hime bangs, sidelocks, a waist-length back with a Scribe-red under-layer and an "angel ring" sheen), and accessories on the bones
// (choker with a red pen-nib charm, red-rimmed shades on her head, spiked cuffs, bikini side bows, platform sandals).
//   const g = await makeAnimeGoth('/videos/…/body.glb'); scene.add(g.root);
//   g.set({ x, z, rotY, t, arms: { L: [x, y, z], R: [...] }, legs, spine, head: [x, y, z], eyes: 'smug'|'open'|'wink'|'closed'|'wide'|'roll',
//           mouth: 'smirk'|'smile'|'talk'|'open'|'tongue'|'pout', talk 0..1, look [dx, dy], brows -1..1 })
import * as THREE from 'three';
import { loadVRM, outlineMaterial } from './vrm.js';
import { toonRamp } from './pixeltex.js';

const PI = Math.PI, TAU = PI * 2;
let RAMP = null;
const ramp = () => (RAMP ??= toonRamp([0.62, 0.66, 0.8, 0.96, 1, 1, 1, 1]));
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp(), ...extra });
const INK = outlineMaterial(0.0018);
function mk(geo, mat, parent, x = 0, y = 0, z = 0, ink = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m);
  if (ink) { const o = new THREE.Mesh(geo, INK); o.castShadow = false; m.add(o); }
  return m;
}

// ---------------------------------------------------------------- head shape (shared by the skull and the face patch)
const R = 0.102;
function warp(geo) {
  const P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    if (y < 0.15 * R) { const u = Math.min(1, (0.15 * R - y) / (1.15 * R)), t = Math.pow(u, 0.95), front = Math.max(0, z / R); x *= 1 - 0.62 * t * (0.55 + 0.45 * front); if (y < 0) y *= 0.94; z = z * (1 - 0.2 * t) + front * 0.07 * R * t; }
    else { x *= 1.0 + 0.02 * (y / R); }
    if (z > 0) z *= 0.93;   // a flatter anime face
    P.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals(); return geo;
}

// ---------------------------------------------------------------- the face (a sphere patch over the front of the head)
const FW = 1024, FH = 640, PHI = 2.2, TH0 = 0.3 * PI, TH1 = 0.8 * PI;
const fx = (deg) => FW / 2 + (deg / (PHI * 180 / PI)) * FW, fy = (deg) => ((deg - TH0 * 180 / PI) / ((TH1 - TH0) * 180 / PI)) * FH;
function drawFace(g, o) {
  g.clearRect(0, 0, FW, FH);
  const ink = '#140c12', lx = (o.look || [0, 0])[0], ly = (o.look || [0, 0])[1];
  // soft shadow under the bangs + under the chin line
  for (const sd of [-1, 1]) { const a0 = fx(sd * 64), a1 = fx(sd * 42), sg = g.createLinearGradient(a0, 0, a1, 0); sg.addColorStop(0, 'rgba(190,110,100,.28)'); sg.addColorStop(1, 'rgba(190,110,100,0)'); g.fillStyle = sg; g.fillRect(Math.min(a0, a1), 0, Math.abs(a1 - a0), FH); }
  const gr = g.createLinearGradient(0, fy(80), 0, fy(92)); gr.addColorStop(0, 'rgba(120,70,110,.28)'); gr.addColorStop(1, 'rgba(120,70,110,0)'); g.fillStyle = gr; g.fillRect(0, fy(76), FW, fy(92) - fy(76));
  for (const side of [-1, 1]) {
    const st = side < 0 ? (o.eyes === 'wink' ? 'closed' : o.eyes) : (o.eyes === 'winkR' ? 'closed' : o.eyes);
    const cx = fx(side * 23.5), cy = fy(103), W = 124, Hh = 98;
    if (st === 'closed') {   // a happy closed arc with a flick
      g.strokeStyle = ink; g.lineCap = 'round'; g.lineWidth = 16;
      g.beginPath(); g.moveTo(cx - W, cy + 6); g.quadraticCurveTo(cx, cy - 34, cx + W, cy + 6); g.stroke();
      g.lineWidth = 10; g.beginPath(); g.moveTo(cx + side * W * 0.95, cy + 2); g.lineTo(cx + side * W * 1.25, cy - 14); g.stroke();
    } else {
      const lid = st === 'smug' || st === undefined ? 0.36 : st === 'half' ? 0.55 : st === 'wide' ? -0.1 : st === 'roll' ? 0.2 : 0.12;   // how far the upper lid comes down
      // the eye opening: an almond, flatter on top, lower outer corner
      const top = cy - Hh * (1 - lid), bot = cy + Hh * 0.92;
      g.save(); g.beginPath();
      g.moveTo(cx - side * W, cy + Hh * 0.2);
      g.bezierCurveTo(cx - side * W * 0.7, top - 6, cx + side * W * 0.5, top - 10, cx + side * W * 1.02, cy - Hh * 0.18 + lid * 30);
      g.bezierCurveTo(cx + side * W * 0.8, bot - 10, cx - side * W * 0.4, bot + 6, cx - side * W, cy + Hh * 0.2);
      g.closePath(); g.fillStyle = '#fbf3f4'; g.fill(); g.clip();
      // iris: tall oval, deep crimson, dark top, a lighter rim at the bottom, pupil, two highlights
      const ix = cx + (st === 'roll' ? 0 : lx * 34) + side * 6, iy = cy + 12 + (st === 'roll' ? -Hh * 0.9 : -ly * 20), iw = 66, ih = 88;
      const ig = g.createLinearGradient(0, iy - ih, 0, iy + ih); ig.addColorStop(0, '#26030a'); ig.addColorStop(0.45, '#7d0f1d'); ig.addColorStop(0.85, '#d23a4a'); ig.addColorStop(1, '#ff8a92');
      g.fillStyle = ig; g.beginPath(); g.ellipse(ix, iy, iw, ih, 0, 0, TAU); g.fill();
      g.strokeStyle = '#1a0408'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#12020a'; g.beginPath(); g.ellipse(ix, iy + 2, 22, 38, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,170,180,.55)'; g.beginPath(); g.ellipse(ix, iy + 40, 30, 12, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix - side * 22, iy - 32, 19, 24, -0.3, 0, TAU); g.fill();
      g.beginPath(); g.arc(ix + side * 16, iy + 24, 6, 0, TAU); g.fill();
      // the lid's shadow on the eyeball
      const sh = g.createLinearGradient(0, top - 10, 0, top + 34); sh.addColorStop(0, 'rgba(60,20,40,.55)'); sh.addColorStop(1, 'rgba(60,20,40,0)'); g.fillStyle = sh; g.fillRect(cx - W * 1.1, top - 10, W * 2.2, 44);
      g.restore();
      // the heavy upper lash line (thick, lower at the inner corner, a sharp wing at the outer corner) + lash flicks
      g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 17;
      g.beginPath(); g.moveTo(cx - side * W * 0.98, cy + Hh * 0.18);
      g.bezierCurveTo(cx - side * W * 0.7, top - 8, cx + side * W * 0.5, top - 12, cx + side * W * 1.04, cy - Hh * 0.2 + lid * 30); g.stroke();
      g.beginPath(); g.moveTo(cx + side * W * 0.85, cy - Hh * 0.2 + lid * 26); g.lineTo(cx + side * W * 1.42, cy - Hh * 0.62 + lid * 18); g.lineTo(cx + side * W * 1.05, cy - Hh * 0.02 + lid * 30); g.closePath(); g.fill();
      g.lineWidth = 7; for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(cx + side * W * (0.62 + k * 0.18), top - 2 + k * 6); g.lineTo(cx + side * W * (0.82 + k * 0.22), top - 26 + k * 4); g.stroke(); }
      // lower lid: a thin line on the outer half + a lash dot
      g.lineWidth = 5; g.strokeStyle = 'rgba(30,10,20,.9)';
      g.beginPath(); g.moveTo(cx - side * W * 0.1, bot - 4); g.quadraticCurveTo(cx + side * W * 0.55, bot - 2, cx + side * W * 0.95, cy + Hh * 0.25); g.stroke();
      // eyeshadow wash (goth smoky, plum)
      const es = g.createRadialGradient(cx + side * 20, top - 10, 10, cx + side * 20, top - 10, W * 1.2); es.addColorStop(0, 'rgba(80,20,60,.32)'); es.addColorStop(1, 'rgba(80,20,60,0)');
      g.fillStyle = es; g.fillRect(cx - W * 1.4, top - 70, W * 2.8, 80);
    }
    // brows: thin, high, a little angled (b < 0 = angry inner end down, b > 0 = raised)
    const b = o.brows ?? 0, by = fy(83) - b * 16 - (st === 'wide' ? 14 : 0);
    g.strokeStyle = '#1c1018'; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - side * 54, by + 16 + (b < 0 ? 18 * -b : 0)); g.quadraticCurveTo(cx + side * 16, by - 14, cx + side * 92, by + 12); g.stroke();
    // blush: hatching
    g.strokeStyle = 'rgba(232,96,120,.75)'; g.lineWidth = 5;
    for (let k = 0; k < 3; k++) { const bx = fx(side * 34) + (k - 1) * 22, byy = fy(119); g.beginPath(); g.moveTo(bx - 8, byy + 10); g.lineTo(bx + 8, byy - 10); g.stroke(); }
    const bl = g.createRadialGradient(fx(side * 35), fy(119), 4, fx(side * 35), fy(119), 70); bl.addColorStop(0, 'rgba(240,120,140,.32)'); bl.addColorStop(1, 'rgba(240,120,140,0)'); g.fillStyle = bl; g.beginPath(); g.ellipse(fx(side * 35), fy(119), 80, 40, 0, 0, TAU); g.fill();
  }
  // nose: a tiny highlight + shadow tick
  g.strokeStyle = 'rgba(160,90,90,.8)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx(1.5), fy(119)); g.lineTo(fx(-1), fy(122)); g.stroke();
  // beauty mark
  g.fillStyle = '#2a0f18'; g.beginPath(); g.arc(fx(32), fy(127), 5, 0, TAU); g.fill();
  // mouth
  const mx = fx(0), my = fy(132), m = o.mouth || 'smirk', talk = o.talk ?? 0, lip = '#5b1530';
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (m === 'smirk' || m === 'pout' || (m === 'talk' && talk < 0.2)) {
    g.strokeStyle = lip; g.lineWidth = 9; g.beginPath();
    if (m === 'pout') { g.moveTo(mx - 20, my); g.quadraticCurveTo(mx, my - 10, mx + 20, my); }
    else { g.moveTo(mx - 30, my - 2); g.quadraticCurveTo(mx - 4, my + 12, mx + 36, my - 12); }
    g.stroke();
    g.fillStyle = 'rgba(91,21,48,.45)'; g.beginPath(); g.ellipse(mx + 2, my + 9, 16, 5, 0, 0, TAU); g.fill();
  } else {
    const open = m === 'open' ? 1 : m === 'tongue' ? 0.75 : m === 'smile' ? 0.6 : 0.35 + 0.65 * talk, wd = m === 'smile' ? 40 : 28, h = 10 + 30 * open;
    g.fillStyle = '#3a0812'; g.beginPath();
    if (m === 'smile') { g.moveTo(mx - wd, my - 6); g.quadraticCurveTo(mx, my + 4, mx + wd, my - 6); g.quadraticCurveTo(mx, my + h + 10, mx - wd, my - 6); }
    else { g.moveTo(mx - wd, my - 2); g.quadraticCurveTo(mx, my - 8, mx + wd, my - 2); g.quadraticCurveTo(mx + wd * 0.6, my + h, mx, my + h); g.quadraticCurveTo(mx - wd * 0.6, my + h, mx - wd, my - 2); }
    g.fill();
    if (m !== 'tongue') { g.fillStyle = '#fff'; g.fillRect(mx - wd * 0.7, my - 4, wd * 1.4, 7); }
    if (m === 'tongue' || m === 'open') { g.fillStyle = '#e06878'; g.beginPath(); g.ellipse(mx + 2, my + h * (m === 'tongue' ? 1.0 : 0.7), 18, m === 'tongue' ? 22 : 10, 0, 0, TAU); g.fill(); }
    g.strokeStyle = lip; g.lineWidth = 7; g.stroke();
  }
}

// ---------------------------------------------------------------- hair clumps: tapered lens-section blades along a curve
function blade(pts, { w0 = 0.03, w1 = 0.002, thick = 0.008, center = new THREE.Vector3(0, 0, 0), N = 14, taper = 1.2, flat = 0 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const pos = [], idx = [], col = [], ring = 6, T = new THREE.Vector3(), O = new THREE.Vector3(), S = new THREE.Vector3(), P = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const u = i / N; curve.getPointAt(u, P); curve.getTangentAt(u, T);
    O.copy(P).sub(center); if (flat) O.lerp(new THREE.Vector3(0, 0, -1), flat); O.addScaledVector(T, -O.dot(T)).normalize();
    S.crossVectors(T, O).normalize();
    const w = w1 + (w0 - w1) * Math.pow(1 - u, taper) * (u < 0.08 ? 0.7 + 3.75 * u : 1), t = thick * (1 - 0.7 * u);
    const sec = [[-1, 0], [-0.5, 1], [0.5, 1], [1, 0], [0.5, -0.6], [-0.5, -0.6]];
    for (const [a, b] of sec) { pos.push(P.x + S.x * a * w + O.x * b * t, P.y + S.y * a * w + O.y * b * t, P.z + S.z * a * w + O.z * b * t); }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < ring; k++) { const a = i * ring + k, b = i * ring + ((k + 1) % ring), c = a + ring, d = b + ring; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export async function makeAnimeGoth(url, opts = {}) {
  const ch = await loadVRM(url, { outline: 0.0018 });
  const root = new THREE.Group(); root.add(ch.root);
  const bone = (n) => ch.bone(n) || ch.bone(n.replace('.', ''));
  ch.root.updateMatrixWorld(true);
  // attach a group to a bone so that at rest its axes match the character's (rotations follow the bone from then on)
  const attach = (bn, worldPos) => { const b = bone(bn), g = new THREE.Group(); b.add(g); const inv = new THREE.Matrix4().copy(b.matrixWorld).invert(); g.position.copy(new THREE.Vector3(...worldPos).applyMatrix4(inv)); const q = new THREE.Quaternion(); b.getWorldQuaternion(q); g.quaternion.copy(q.invert()); return g; };
  const bpos = (bn) => bone(bn).getWorldPosition(new THREE.Vector3());
  const C = { skin: 0xffe4da, hair: 0x1d1826, hairRim: 0x3c3054, red: 0x9a1c25, black: 0x121016, silver: 0xc9ccd6 };
  const M = { skin: toon(C.skin), hair: toon(0xffffff, { vertexColors: true, side: THREE.DoubleSide }), hairIn: toon(C.red, { side: THREE.DoubleSide }), black: toon(C.black), red: toon(C.red), silver: toon(C.silver), lens: new THREE.MeshBasicMaterial({ color: 0x1a0d14 }) };
  // ---- head
  const hb = bpos('head'), HC = [hb.x, hb.y + 0.098, hb.z + 0.006];
  const head = attach('head', HC); head.scale.setScalar(opts.headScale ?? 1.12);
  mk(warp(new THREE.SphereGeometry(R, 48, 36)), M.skin, head);
  const faceC = document.createElement('canvas'); faceC.width = FW; faceC.height = FH; const faceG = faceC.getContext('2d');
  const faceT = new THREE.CanvasTexture(faceC); faceT.colorSpace = THREE.SRGBColorSpace; faceT.anisotropy = 8;
  const face = new THREE.Mesh(warp(new THREE.SphereGeometry(R * 1.004, 64, 32, PI / 2 - PHI / 2, PHI, TH0, TH1 - TH0)), new THREE.MeshBasicMaterial({ map: faceT, transparent: true, depthWrite: false })); face.renderOrder = 3; head.add(face);
  for (const s of [-1, 1]) { const ear = mk(new THREE.SphereGeometry(0.02, 12, 10), M.skin, head, s * 0.093, -0.01, -0.005); ear.scale.set(0.5, 1.1, 0.8); }
  // ---- hair: a scalp shell + clumps (the colour per vertex makes the angel-ring sheen band)
  const HAIR = [], add = (geo, mat = M.hair, ink = true) => { const m = mk(geo, mat, head, 0, 0, 0, ink); HAIR.push(m); return m; };
  const shine = (geo) => { const P = geo.attributes.position, c = new Float32Array(P.count * 3), base = new THREE.Color(C.hair), hi = new THREE.Color(C.hairRim), tmp = new THREE.Color();
    for (let i = 0; i < P.count; i++) { const y = P.getY(i), k = Math.exp(-(((y - 0.055) / 0.012) ** 2)) * 0.9 + Math.max(0, Math.min(1, (y + 0.4) / 0.6)) * 0.12; tmp.copy(base).lerp(hi, k); c.set([tmp.r, tmp.g, tmp.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo; };
  const cap = new THREE.SphereGeometry(R * 1.06, 40, 14, 0, TAU, 0, 0.4 * PI); cap.translate(0, 0.004, -0.006); add(shine(cap));   // the crown, above the brows
  const nape = new THREE.SphereGeometry(R * 1.055, 40, 12, PI / 2 + 1.0, TAU - 2.0, 0.36 * PI, 0.32 * PI); nape.translate(0, 0.002, -0.006); add(shine(nape));   // back + sides, open at the face
  const onHead = (az, el, r = R * 1.05) => [Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r, Math.cos(az) * Math.cos(el) * r];   // az 0 = front (+z)
  // a solid fringe base (so no skin shows between the clump tips), then blunt hime bangs: 11 clumps from the crown to just above the brows
  { const fr = new THREE.SphereGeometry(R * 1.075, 40, 8, PI / 2 - 1.05, 2.1, 0.12 * PI, 0.27 * PI); add(shine(fr)); }
  for (let i = 0; i < 11; i++) {
    const az = (-0.95 + (i / 10) * 1.9) + (i % 2 ? 0.03 : -0.03), r0 = onHead(az * 0.6, 1.2, R * 1.02), mid = onHead(az, 0.66, R * 1.1), tip = onHead(az * 1.02, 0.36 + (i % 3) * 0.012, R * 1.085);
    add(shine(blade([r0, mid, tip], { w0: 0.034, w1: 0.008, thick: 0.007, taper: 0.6 })));
  }
  // sidelocks (2 per side) framing the face down past the chin
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const az = s * (1.05 + k * 0.22), a = onHead(az, 0.8, R * 1.03), b = onHead(az * 1.02, 0.1, R * 1.1), c = [s * (0.088 + k * 0.012), -0.11 - k * 0.03, 0.03 - k * 0.025], d = [s * (0.085 + k * 0.014), -0.2 - k * 0.04, 0.02 - k * 0.03];
    add(shine(blade([a, b, c, d], { w0: 0.03, w1: 0.004, thick: 0.007, taper: 0.9 })));
    add(blade([a, b, c, d].map((p) => [p[0] * 0.96, p[1], p[2] - 0.004]), { w0: 0.022, w1: 0.003, thick: 0.004 }), M.hairIn, false);   // red under-layer
  }
  // the back: a full mass of 24 wide, overlapping clumps to the waist (puffed out past the head at the sides) + 10 red under-layer clumps
  for (let i = 0; i < 24; i++) {
    const az = PI + (-1.5 + (i / 23) * 3.0) + (i % 2 ? 0.02 : -0.02), el0 = 0.95 - Math.abs(Math.sin(az)) * 0.25, sx = Math.sin(az), cz = Math.cos(az), j = (i * 7) % 5;
    const a = onHead(az, el0, R * 1.03), b = onHead(az, 0.02, R * 1.24), c = [sx * 0.15, -0.3, cz * 0.13 - 0.07], d = [sx * (0.15 + j * 0.004), -0.6 - j * 0.025, cz * 0.12 - 0.1];
    add(shine(blade([a, b, c, d], { w0: 0.085, w1: 0.01, thick: 0.014, taper: 0.8, N: 18 })));
  }
  for (let i = 0; i < 10; i++) {
    const az = PI + (-1.4 + (i / 9) * 2.8), sx = Math.sin(az), cz = Math.cos(az);
    add(blade([onHead(az, 0.4, R * 1.0), onHead(az, -0.05, R * 1.16), [sx * 0.135, -0.3, cz * 0.12 - 0.06], [sx * 0.14, -0.55, cz * 0.1 - 0.09]], { w0: 0.07, w1: 0.008, thick: 0.008, taper: 1.0 }), M.hairIn, false);
  }
  // side volume: 3 clumps per side puffing out at the temples, down to the shoulders
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const az = s * (1.45 + k * 0.22), a = onHead(az, 0.9, R * 1.02), b = onHead(az, 0.15, R * 1.26), c = [Math.sin(az) * 0.15, -0.16 - k * 0.04, Math.cos(az) * 0.12], d = [Math.sin(az) * 0.15, -0.34 - k * 0.05, Math.cos(az) * 0.1 - 0.03];
    add(shine(blade([a, b, c, d], { w0: 0.07, w1: 0.008, thick: 0.012, taper: 0.9 })));
  }
  // two long front locks per side that fall over the shoulders and frame the chest (red under-layer under the outer one)
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const az = s * (1.18 + k * 0.16), a = onHead(az, 0.6, R * 1.04), b = [s * (0.1 + k * 0.012), -0.06, 0.035 - k * 0.012], c = [s * (0.118 + k * 0.012), -0.17, 0.07 - k * 0.012], d = [s * (0.128 + k * 0.01), -0.3, 0.108 - k * 0.012], e = [s * (0.125 + k * 0.012), -0.46 - k * 0.04, 0.075 - k * 0.012];
    add(shine(blade([a, b, c, d, e], { w0: 0.045, w1: 0.005, thick: 0.01, taper: 1.0, N: 18 })));
    if (k === 1) add(blade([a, b, c, d, e].map((p) => [p[0] * 1.03, p[1], p[2] - 0.006]), { w0: 0.036, w1: 0.004, thick: 0.005, N: 18 }), M.hairIn, false);
  }
  // a few crown clumps to break the cap's silhouette + one antenna strand
  for (let i = 0; i < 7; i++) { const az = (i / 7) * TAU, a = onHead(az, 1.35, R * 1.0), b = onHead(az, 0.95, R * 1.1), c = onHead(az + 0.1, 0.6, R * 1.12); add(shine(blade([a, b, c], { w0: 0.04, w1: 0.006, thick: 0.006, taper: 0.8 }))); }
  add(shine(blade([onHead(0.2, 1.5, R), [0.02, R * 1.35, 0.01], [0.05, R * 1.4, 0.04]], { w0: 0.012, w1: 0.002, thick: 0.004 })));
  // black rectangular shades pushed up on her head (red lenses)
  const sg = new THREE.Group(); head.add(sg); sg.position.set(0, R * 0.9, R * 0.6); sg.rotation.x = -0.42;
  for (const s2 of [-1, 1]) { mk(new THREE.BoxGeometry(0.052, 0.03, 0.008), M.black, sg, s2 * 0.034, 0, 0); mk(new THREE.BoxGeometry(0.042, 0.021, 0.004), toon(0x6a0d18), sg, s2 * 0.034, 0, 0.005, false); }
  mk(new THREE.BoxGeometry(0.018, 0.006, 0.006), M.black, sg, 0, 0.006, 0, false);
  // ---- choker + nib charm on the neck
  const nb = bpos('neck'), neck = attach('neck', [nb.x, nb.y + 0.045, nb.z + 0.004]);
  const chk = mk(new THREE.TorusGeometry(0.039, 0.008, 8, 28), M.black, neck); chk.rotation.x = PI / 2; chk.scale.set(1, 0.92, 1);
  const nib = mk(new THREE.ConeGeometry(0.011, 0.028, 8), M.red, neck, 0, -0.018, 0.04, false); nib.rotation.x = PI;
  // ---- spiked cuffs on the wrists, bikini side bows, platform sandals
  for (const k of ['L', 'R']) {
    const wb = bpos('hand.' + k), cuff = attach('hand.' + k, [wb.x, wb.y + 0.015, wb.z]);
    const cf = mk(new THREE.CylinderGeometry(0.028, 0.028, 0.026, 16), M.black, cuff); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU, sp = mk(new THREE.ConeGeometry(0.006, 0.016, 5), M.silver, cf, Math.cos(a) * 0.03, 0, Math.sin(a) * 0.03, false); sp.rotation.z = -PI / 2; sp.rotation.y = -a; }
    const s = k === 'L' ? 1 : -1, hp = bpos('hips'), bow = attach('hips', [s * 0.158, 0.95, hp.z + 0.02]);
    for (const d of [-1, 1]) { const loop = mk(new THREE.TorusGeometry(0.011, 0.004, 6, 12), M.red, bow, 0, 0, d * 0.012, false); loop.rotation.y = PI / 2; }
    const tail = mk(new THREE.BoxGeometry(0.005, 0.045, 0.005), M.red, bow, 0.002, -0.025, 0.004, false); tail.rotation.z = s * 0.25;
    const fb = bpos('foot.' + k), foot = attach('foot.' + k, [fb.x, 0, fb.z]);
    mk(new THREE.BoxGeometry(0.085, 0.045, 0.22), M.black, foot, 0, 0.0225, -0.03 + 0.0);
    mk(new THREE.BoxGeometry(0.08, 0.018, 0.03), M.black, foot, 0, 0.075, -0.06, false);
    const ank = mk(new THREE.TorusGeometry(0.03, 0.005, 6, 18), M.black, foot, 0, 0.095, 0.0, false); ank.rotation.x = PI / 2;
  }
  // ---- fingers: 3-joint capsule chains on each hand bone (palm faces her thigh at rest: fingers fan along z, curl toward −x·side)
  const INKF = outlineMaterial(0.0009);
  const FING = [   // [z on the palm, y of the knuckle, radius, segment lengths]
    [0.02, 0.868, 0.0062, [0.029, 0.019, 0.016]], [0.0065, 0.864, 0.0063, [0.032, 0.021, 0.017]], [-0.007, 0.867, 0.0059, [0.029, 0.019, 0.016]], [-0.019, 0.873, 0.0052, [0.023, 0.015, 0.013]]];
  const HAND = {};
  for (const k of ['L', 'R']) {
    const s = k === 'L' ? 1 : -1, hg = attach('hand.' + k, [0, 0, 0]), fingers = [];
    const chain = (base, r, segs) => { const js = []; let par = hg; segs.forEach((L, i) => { const j = new THREE.Group(); j.position.set(...(i ? [0, -segs[i - 1], 0] : base)); par.add(j); const g = new THREE.CapsuleGeometry(r * (1 - 0.07 * i), L, 3, 8); g.translate(0, -L / 2, 0); const m = new THREE.Mesh(g, M.skin); m.castShadow = true; j.add(m); m.add(new THREE.Mesh(g, INKF)); js.push(j); par = j; }); return js; };
    for (const [z, y, r, segs] of FING) fingers.push(chain([s * 0.307, y, z], r, segs));
    const thumb = chain([s * 0.298, 0.912, 0.024], 0.0068, [0.024, 0.019, 0.015]);
    HAND[k] = { s, fingers, thumb };
  }
  // hand shapes: per finger curl (index, middle, ring, pinky; 0 = straight), spread, thumb curl
  const SHAPES = { relax: { c: [0.3, 0.4, 0.45, 0.5], sp: 0.4, th: 0.3 }, open: { c: [0.05, 0.05, 0.08, 0.1], sp: 1.4, th: 0.05 }, fist: { c: [1.45, 1.5, 1.5, 1.45], sp: 0, th: 1.1 },
    point: { c: [0.02, 1.5, 1.5, 1.45], sp: 0, th: 1.0 }, peace: { c: [0.02, 0.02, 1.5, 1.45], sp: 2.6, th: 1.1 }, claw: { c: [0.7, 0.75, 0.8, 0.85], sp: 1.2, th: 0.5 } };
  const SPREAD = [-0.1, -0.03, 0.04, 0.11];
  const HANDS = { point: { R: 'point' }, wave: { R: 'open' }, peace: { R: 'peace' }, ally: { R: 'open' } };
  function shapeHand(k, name) {
    const H = HAND[k], S = SHAPES[name] || SHAPES.relax, s = H.s;
    H.fingers.forEach((js, f) => js.forEach((j, i) => { const c = S.c[f] * (i === 0 ? 0.9 : i === 1 ? 1.15 : 0.8); j.rotation.set(i === 0 ? SPREAD[f] * S.sp * -1 : 0, 0, -s * c); }));
    H.thumb.forEach((j, i) => j.rotation.set(i === 0 ? -0.35 + S.th * 0.5 : S.th * 0.6, 0, -s * (i === 0 ? 0.35 + S.th * 0.4 : S.th * 0.5)));
  }
  root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });

  let faceKey = '';
  // ---- aim posing: each listed bone points along a direction in HER frame ([x = her left, y = up, z = front]); twist is free
  const NEXT = { hips: 'spine', spine: 'chest', chest: 'neck', neck: 'head', 'shoulder.L': 'upperArm.L', 'upperArm.L': 'lowerArm.L', 'lowerArm.L': 'hand.L', 'shoulder.R': 'upperArm.R', 'upperArm.R': 'lowerArm.R', 'lowerArm.R': 'hand.R', 'upperLeg.L': 'lowerLeg.L', 'lowerLeg.L': 'foot.L', 'upperLeg.R': 'lowerLeg.R', 'lowerLeg.R': 'foot.R' };
  const CHAIN = ['hips', 'spine', 'chest', 'neck', 'head', 'shoulder.L', 'upperArm.L', 'lowerArm.L', 'hand.L', 'shoulder.R', 'upperArm.R', 'lowerArm.R', 'hand.R', 'upperLeg.L', 'lowerLeg.L', 'foot.L', 'upperLeg.R', 'lowerLeg.R', 'foot.R'].filter((n) => bone(n));
  const AXIS = {}, REST = {};
  for (const n of CHAIN) { const b = bone(n); REST[n] = b.quaternion.clone(); const k = NEXT[n] && bone(NEXT[n]); AXIS[n] = k && k.parent === b ? k.position.clone().normalize() : new THREE.Vector3(0, 1, 0); }
  const qP = new THREE.Quaternion(), qW = new THREE.Quaternion(), d0 = new THREE.Vector3(), dT = new THREE.Vector3(), qD = new THREE.Quaternion(), qR = new THREE.Quaternion(), qT = new THREE.Quaternion();
  function aim(dirs) {
    for (const n of CHAIN) bone(n).quaternion.copy(REST[n]);
    root.updateMatrixWorld(true); root.getWorldQuaternion(qR);
    for (const n of CHAIN) {
      const b = bone(n), tw = dirs['twist.' + n];
      if (dirs[n]) {
        b.parent.getWorldQuaternion(qP); qW.copy(qP).multiply(REST[n]);
        d0.copy(AXIS[n]).applyQuaternion(qW).normalize(); dT.set(...dirs[n]).normalize().applyQuaternion(qR);
        qD.setFromUnitVectors(d0, dT); qW.premultiply(qD); b.quaternion.copy(qP.invert().multiply(qW));
      }
      if (tw) b.quaternion.multiply(qT.setFromAxisAngle(AXIS[n], tw));
      b.updateMatrixWorld(true);
    }
  }
  /** named poses (bone directions in her frame; x = her left). Mirror L → R by negating x. */
  const POSES = {
    rest: { 'upperArm.L': [0.2, -1, 0.04], 'lowerArm.L': [0.08, -1, 0.14], 'upperArm.R': [-0.2, -1, 0.04], 'lowerArm.R': [-0.08, -1, 0.14] },
    hips: { 'upperArm.L': [0.62, -0.75, -0.12], 'lowerArm.L': [-0.75, -0.62, 0.15], 'upperArm.R': [-0.62, -0.75, -0.12], 'lowerArm.R': [0.75, -0.62, 0.15] },
    ally: { 'upperArm.L': [0.62, -0.75, -0.12], 'lowerArm.L': [-0.75, -0.62, 0.15], 'upperArm.R': [-0.55, 0.8, -0.1], 'lowerArm.R': [0.62, 0.55, -0.45] },
    point: { 'upperArm.R': [-0.25, -0.15, 1], 'lowerArm.R': [-0.15, 0.05, 1] },
    peace: { 'upperArm.L': [0.62, -0.75, -0.12], 'lowerArm.L': [-0.75, -0.62, 0.15], 'upperArm.R': [-0.45, -0.6, 0.45], 'lowerArm.R': [0.2, 0.92, 0.3] },
    wave: { 'upperArm.L': [0.62, -0.75, -0.12], 'lowerArm.L': [-0.75, -0.62, 0.15], 'upperArm.R': [-0.85, 0.35, 0.2], 'lowerArm.R': [-0.15, 1, 0.15] },
  };
  function set(p = {}) {
    const t = p.t ?? 0;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0;
    // bones: rotations in degrees on top of the rest (A-) pose; arms default down at the sides
    // pose: named pose + per-bone overrides (p.aim), hip sway (S-curve), breathing, head tilt/nod/turn
    const breath = Math.sin(t * 1.7) * 0.012, sw = p.sway ?? 0, tilt = p.tilt ?? 0, nod = p.nod ?? 0;
    aim({ ...POSES.rest, ...(POSES[p.pose] || {}), ...(p.aim || {}),
      hips: [Math.sin(sw) * 0.25, 1, 0], spine: [-Math.sin(sw) * 0.35, 1, -0.02 + breath], chest: [-Math.sin(sw) * 0.1, 1, 0.02 + breath],
      neck: [tilt * 0.3, 1, 0.06 + nod * 0.3], head: [tilt * 0.6, 1, 0.03 + nod * 0.6], 'twist.head': p.turn ?? 0, 'twist.neck': (p.turn ?? 0) * 0.4,
      ...(p.legs || {}) });
    const hs = { L: 'relax', R: 'relax', ...(HANDS[p.pose] || {}), ...(p.hands || {}) }; shapeHand('L', hs.L); shapeHand('R', hs.R);
    const blink = p.blink ?? ((t % 3.6) < 0.11 ? 1 : 0);
    const eyes = blink && (p.eyes ?? 'smug') !== 'closed' && !String(p.eyes).startsWith('wink') ? 'closed' : (p.eyes ?? 'smug');
    const talk = p.mouth === 'talk' ? Math.round((p.talk ?? (0.5 + 0.5 * Math.sin(t * 22))) * 4) / 4 : 0;
    const key = [eyes, (p.look || [0, 0]).map((v) => v.toFixed(2)), p.brows ?? 0, p.mouth ?? 'smirk', talk].join('|');
    if (key !== faceKey) { faceKey = key; drawFace(faceG, { eyes, look: p.look, brows: p.brows, mouth: p.mouth, talk }); faceT.needsUpdate = true; }
  }
  set({});
  return { root, set, ch, head, bone, M };
}
