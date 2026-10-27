// PROPS (022): the logistics of something that keeps doubling. A camera-facing pixel CENSOR block (the "post-production" mosaic,
// drawn on top of everything), a blue TARP load with ropes (one lumpy mound, never a shape), a contractor WHEELBARROW that
// collapses, a 26-ft moving TRUCK whose box bulges and bursts, a TOWER CRANE that buckles, a folding LAWN CHAIR, a tailor's
// TAPE (a ribbon between two points), a rolling CLOTHES RACK that tips over, a green ROAD SIGN, a mosaic FLAG. All generic.
// Every builder returns { g, ... } with its origin on the ground unless noted.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';

const PI = Math.PI;
const DENIM = ['#20324f', '#2b4166', '#36507a', '#43608c', '#53729c', '#6585ad', '#7a97ba', '#93a9c4', '#aab8c9'];

/** A mosaic censor block: a camera-facing sprite of n×n crisp pixels (smooth blobs of denim blues/greys, like a pixelated
 *  photo of jeans). Drawn over everything (depthTest off) like an edit in post. setSize(meters) sets the edge length. */
export function makeCensor({ seed = 5, n = 9, palette = DENIM } = {}) {
  const tex = canvasTex(n, n, (g) => {
    const R = rng(seed), a = R() * 6, b = R() * 6;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = 0.5 + 0.28 * Math.sin(x * 0.9 + a) * Math.cos(y * 0.75 + b) + 0.18 * Math.sin((x + y) * 0.55 + a * 2) + (R() - 0.5) * 0.3;
      g.fillStyle = palette[Math.max(0, Math.min(palette.length - 1, Math.floor(v * palette.length)))]; g.fillRect(x, y, 1, 1);
    }
  });
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  const m = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, toneMapped: false, transparent: true, fog: false });
  const sp = new THREE.Sprite(m); sp.renderOrder = 20; sp.frustumCulled = false;
  return { g: sp, sp, mat: m, setSize(s) { sp.scale.set(s, s, 1); } };
}

function tarpTex() {
  return canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#2f6db5'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
    for (let x = -h; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }
    const R = rng(4);
    for (let i = 0; i < 26; i++) { // soft fold creases
      const x = R() * w, y = R() * h, l = 60 + R() * 200, a = R() * PI;
      const gr = g.createLinearGradient(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l); gr.addColorStop(0, 'rgba(10,30,70,0)'); gr.addColorStop(0.5, 'rgba(10,30,70,.28)'); gr.addColorStop(1, 'rgba(10,30,70,0)');
      g.strokeStyle = gr; g.lineWidth = 6 + R() * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.fillStyle = '#d8dde2'; for (let x = 20; x < w; x += 64) for (const y of [h * 0.86, h * 0.93]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  }, [2, 1]);
}
/** A blue tarp load: ONE lumpy draped mound tied down with ropes. Built at diameter 2 (radius 1), origin at the bottom center;
 *  setSize(d) = diameter in meters. `squash` (0.62) keeps it a pile, not a ball. */
export function makeTarpBall({ squash = 0.66, seed = 3 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const geo = new THREE.SphereGeometry(1, 72, 48), p = geo.attributes.position, R = rng(seed), ph = [R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + 0.05 * Math.sin(x * 3.1 + ph[0]) * Math.cos(z * 2.7 + ph[1]) + 0.035 * Math.sin(y * 4.3 + x * 2 + ph[2]);
    const flat = y < -0.55 ? 1 + (-0.55 - y) * 0.9 : 1;          // the bottom spreads where it rests
    p.setXYZ(i, x * n * flat, Math.max(y * n, -0.92), z * n * flat);
  }
  geo.computeVertexNormals();
  const tarpM = new THREE.MeshStandardMaterial({ map: tarpTex(), roughness: 0.55, metalness: 0.05 });
  const mesh = mk(geo, tarpM, body, 0, 0.92, 0);
  const ropeM = mat(0xd9c39a, 0.8);
  for (const [y, r] of [[0.92, 1.03], [1.35, 0.93], [0.5, 0.92]]) { const t = mk(new THREE.TorusGeometry(r, 0.018, 6, 64), ropeM, body, 0, y, 0); t.rotation.x = PI / 2; }
  for (const a of [0.35, PI / 2 + 0.35]) { const t = mk(new THREE.TorusGeometry(1.03, 0.018, 6, 64, PI), ropeM, body, 0, 0.92, 0); t.rotation.y = a; }
  body.scale.y = squash;
  return { g, body, mesh, mat: tarpM, setSize(d) { g.scale.setScalar(d / 2); } };
}

/** Contractor wheelbarrow, ~1.5 m long, wheel toward +z, handles toward −z (grips at y 0.62). setCrush(k): the tray slams
 *  down, the legs splay, the wheel squashes and rolls off to +x. */
export function makeWheelbarrow({ color = 0x3f8a4a } = {}) {
  const g = new THREE.Group(), steel = mat(color, 0.45, { metalness: 0.4 }), dark = mat(0x2a2a2a, 0.6);
  const trayG = new THREE.Group(); trayG.position.set(0, 0.55, 0.1); g.add(trayG);
  const tray = mk(new THREE.CylinderGeometry(0.52, 0.3, 0.32, 4, 1, true), new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.4, side: THREE.DoubleSide }), trayG, 0, 0, 0);
  tray.rotation.y = PI / 4; tray.scale.set(0.85, 1, 1.25);
  mk(new THREE.BoxGeometry(0.42, 0.02, 0.5), steel, trayG, 0, -0.16, 0);
  const handles = new THREE.Group(); g.add(handles);
  for (const s of [-1, 1]) {
    const h = mk(new THREE.CylinderGeometry(0.02, 0.02, 1.45, 8), dark, handles, s * 0.28, 0.48, -0.15); h.rotation.x = PI / 2 + 0.16;
    mk(new THREE.CylinderGeometry(0.028, 0.028, 0.16, 8), mat(0x111111, 0.8), handles, s * 0.28, 0.6, -0.82).rotation.x = PI / 2 + 0.16;
  }
  const legs = [];
  for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.set(s * 0.26, 0.42, -0.32); g.add(l); mk(new THREE.CylinderGeometry(0.016, 0.016, 0.42, 6), dark, l, 0, -0.21, 0); legs.push(l); }
  const wheel = new THREE.Group(); wheel.position.set(0, 0.2, 0.62); g.add(wheel);
  const tire = mk(new THREE.TorusGeometry(0.15, 0.055, 10, 24), mat(0x1c1c1c, 0.85), wheel); tire.rotation.y = PI / 2;
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16), mat(0xd23a3f, 0.5), wheel).rotation.z = PI / 2;
  function setCrush(k, spin = 0) {
    trayG.position.y = lerp(0.55, 0.2, k); trayG.rotation.x = 0.25 * k; trayG.scale.set(1 + 0.25 * k, 1 - 0.45 * k, 1 + 0.1 * k);
    handles.position.y = -0.3 * k; handles.rotation.z = 0.08 * k;
    legs.forEach((l, i) => { l.rotation.z = (i ? -1 : 1) * 1.2 * k; });
    wheel.scale.set(1, 1 - 0.4 * clamp(k * 3), 1); wheel.position.set(1.8 * k, 0.2 - 0.06 * clamp(k * 3), 0.62 + 0.6 * k); wheel.rotation.x = spin;
  }
  setCrush(0);
  return { g, trayG, wheel, setCrush };
}

function truckSideTex(text) {
  return canvasTex(1024, 320, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8762b'; g.fillRect(0, h * 0.7, w, h * 0.12); g.fillStyle = '#2f6db5'; g.fillRect(0, h * 0.82, w, h * 0.06);
    g.fillStyle = '#e8762b'; g.font = 'bold 120px Helvetica, Arial, sans-serif'; g.textAlign = 'left'; g.fillText(text, 40, 150);
    g.fillStyle = '#2a2d31'; g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.fillText('26 FT · ONE-WAY · NO JOB TOO BIG', 44, 210);
  });
}
/** A 26-ft moving truck. Box along +x: rear (open roll-up door) at x = 0, box to x = L, cab beyond. Origin on the ground at
 *  the rear, center line. `panels` (left wall, right wall, roof) can be blown off with setBurst(k); setBulge(k) puffs the box. */
export function makeBoxTruck({ L = 7.9, text = 'HAUL-IT', ramp: withRamp = true } = {}) {
  const g = new THREE.Group(), W = 2.45, Y0 = 1.05, HB = 2.55;
  const white = mat(0xf2f0ea, 0.55), dark = mat(0x2a2d31, 0.6), tireM = mat(0x1a1a1a, 0.85);
  const box = new THREE.Group(); box.position.set(L / 2, Y0, 0); g.add(box);
  const side = new THREE.MeshStandardMaterial({ map: truckSideTex(text), roughness: 0.55 });
  const mkPanel = (geo, m, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); box.add(p); mk(geo, m, p); p.userData.home = p.position.clone(); return p; };
  const left = mkPanel(new THREE.BoxGeometry(L, HB, 0.06), [white, white, white, white, side, white], 0, HB / 2, W / 2);
  const right = mkPanel(new THREE.BoxGeometry(L, HB, 0.06), [white, white, white, white, white, side], 0, HB / 2, -W / 2);
  right.children[0].scale.x = -1;
  const roof = mkPanel(new THREE.BoxGeometry(L, 0.06, W), white, 0, HB, 0);
  mk(new THREE.BoxGeometry(0.06, HB, W), white, box, L / 2, HB / 2, 0);
  mk(new THREE.BoxGeometry(L, 0.1, W), mat(0x8a6a4a, 0.8), box, 0, 0.03, 0);
  const roll = mk(new THREE.CylinderGeometry(0.16, 0.16, W - 0.1, 16), mat(0xd8d8d8, 0.4, { metalness: 0.4 }), box, -L / 2 + 0.1, HB - 0.18, 0); roll.rotation.x = PI / 2;
  mk(new THREE.BoxGeometry(0.4, 0.12, W), dark, g, 0.1, Y0 - 0.15, 0);
  if (withRamp) { const ramp = mk(new THREE.BoxGeometry(2.2, 0.04, 0.9), mat(0xb8bcc2, 0.35, { metalness: 0.6 }), g, -1.0, 0.52, 0); ramp.rotation.z = -0.45; }
  // chassis + cab
  mk(new THREE.BoxGeometry(L + 2.4, 0.3, 1.2), dark, g, L / 2 + 1.1, 0.75, 0);
  const cab = new THREE.Group(); cab.position.set(L + 0.05, 0, 0); g.add(cab);
  mk(new RoundedBoxGeometry(2.3, 1.9, 2.3, 3, 0.18), white, cab, 1.15, 1.6, 0);
  mk(new RoundedBoxGeometry(0.9, 0.9, 2.2, 3, 0.12), white, cab, 2.45, 1.1, 0);
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fc6e0, roughness: 0.1, metalness: 0.3 });
  mk(new THREE.BoxGeometry(0.06, 0.75, 2.0), glass, cab, 2.29, 2.05, 0).rotation.z = -0.25;
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.9, 0.6, 0.04), glass, cab, 1.6, 2.05, s * 1.16);
  const wheels = [];
  for (const x of [1.3, 2.25, L + 2.0]) for (const s of [-1, 1]) { const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 22), tireM, g, x, 0.5, s * 1.05); w.rotation.x = PI / 2; wheels.push(w); }
  const panels = [left, right, roof];
  const FLY = [[-0.5, 1.4, 9, 0.9], [0.4, 1.6, -9, -0.8], [0.6, 7.5, 0.5, 0.4]];   // vx, vy, vz, spin per panel
  function setBurst(k) { // k = seconds since the burst (0 = intact)
    panels.forEach((p, i) => {
      const [vx, vy, vz, sp] = FLY[i], a = Math.max(0, k);
      p.position.set(p.userData.home.x + vx * a, Math.max(-Y0 + 0.1, p.userData.home.y + vy * a - 4.9 * a * a), p.userData.home.z + vz * a);
      p.rotation.set(sp * a * 2.2, 0, (i === 2 ? 1.4 : 0.7) * sp * a);
      p.visible = a < 2.5;
    });
  }
  function setBulge(k) { box.scale.set(1 + 0.04 * k, 1 + 0.14 * k, 1 + 0.2 * k); }
  setBurst(0);
  return { g, box, cab, panels, wheels, setBurst, setBulge, L, W, Y0, HB };
}

function latticeTex(color = '#f2c230') {
  const t = canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = color; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
  });
  return t;
}
/** A yellow tower crane: lattice mast (H m), slewing top with a jib along +x (J m) and a counter-jib with concrete blocks,
 *  a cab, a trolley + cable + hook block. setTrolley(x), setCable(len), setBuckle(k): the upper mast folds at 55 % height
 *  and the jib droops. hook = the hook-block group (read its world position to hang a load). */
export function makeTowerCrane({ H = 48, J = 46 } = {}) {
  const g = new THREE.Group(), S = 2.0;
  const latM = (rx, ry) => { const t = latticeTex(); t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }); };
  const yellow = mat(0xf2c230, 0.5), conc = mat(0xb7b2a8, 0.9);
  mk(new THREE.BoxGeometry(6, 1.2, 6), conc, g, 0, 0.6, 0);
  const H1 = H * 0.55, H2 = H - H1;
  mk(new THREE.BoxGeometry(S, H1, S), latM(1, H1 / S), g, 0, H1 / 2 + 1.2, 0);
  const fold = new THREE.Group(); fold.position.set(S / 2, H1 + 1.2, 0); g.add(fold);
  mk(new THREE.BoxGeometry(S, H2, S), latM(1, H2 / S), fold, -S / 2, H2 / 2, 0);
  const top = new THREE.Group(); top.position.set(-S / 2, H2, 0); fold.add(top);
  mk(new THREE.BoxGeometry(2.4, 1.2, 2.4), yellow, top, 0, 0.6, 0);
  mk(new THREE.BoxGeometry(1.6, 1.8, 1.6), mat(0xf4f1ea, 0.5), top, 1.6, -0.2, 1.2);
  mk(new THREE.BoxGeometry(J, 1.6, 1.6), latM(J / 1.6, 1), top, J / 2 + 1.2, 2.0, 0);
  mk(new THREE.BoxGeometry(14, 1.2, 1.6), latM(14 / 1.2, 1), top, -7 - 1.2, 1.8, 0);
  for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(1.4, 2.2, 1.9), conc, top, -11 - i * 1.0, 1.2, 0);
  const peak = mk(new THREE.CylinderGeometry(0.4, 0.9, 7, 4), latM(1, 4), top, 0, 4.7, 0); void peak;
  for (const [x, y0] of [[J * 0.7, 2.6], [-12, 2.4]]) { const d = new THREE.Vector3(x, y0 - 8.2, 0), l = d.length(); const c = mk(new THREE.CylinderGeometry(0.06, 0.06, l, 6), mat(0x333333, 0.5), top, x / 2, (y0 + 8.2) / 2, 0); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
  const trolley = new THREE.Group(); trolley.position.set(J * 0.55, 1.1, 0); top.add(trolley);
  mk(new THREE.BoxGeometry(1.4, 0.5, 1.8), yellow, trolley);
  const cable = mk(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), mat(0x222222, 0.5), trolley, 0, -0.5, 0);
  const hook = new THREE.Group(); trolley.add(hook);
  mk(new THREE.BoxGeometry(0.9, 1.1, 0.6), mat(0xd23a3f, 0.5), hook, 0, 0.3, 0);
  mk(new THREE.TorusGeometry(0.35, 0.09, 8, 16, PI * 1.4), mat(0x333333, 0.4, { metalness: 0.6 }), hook, 0, -0.45, 0);
  function setTrolley(x) { trolley.position.x = x; }
  function setCable(len) { cable.scale.y = len; cable.position.y = -len / 2; hook.position.y = -len - 0.3; }
  function setBuckle(k) { fold.rotation.z = -0.95 * k; top.rotation.z = 0.25 * k; }
  setCable(10);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return { g, top, fold, trolley, hook, setTrolley, setCable, setBuckle, H, J };
}

/** Folding lawn chair (seat top 0.42, faces +z) with striped webbing. */
export function makeLawnChair({ c1 = '#e8762b', c2 = '#f2e6cf' } = {}) {
  const g = new THREE.Group(), al = mat(0xc9ccd2, 0.3, { metalness: 0.7 });
  const web = new THREE.MeshStandardMaterial({ map: canvasTex(64, 64, (c, w, h) => { for (let x = 0; x < w; x += 16) { c.fillStyle = x % 32 ? c2 : c1; c.fillRect(x, 0, 16, h); } }), roughness: 0.8, side: THREE.DoubleSide });
  mk(new THREE.BoxGeometry(0.5, 0.03, 0.46), web, g, 0, 0.42, 0.02);
  const back = mk(new THREE.BoxGeometry(0.5, 0.55, 0.03), web, g, 0, 0.7, -0.24); back.rotation.x = -0.22;
  for (const s of [-1, 1]) {
    for (const [z, r] of [[0.2, 0.35], [-0.2, -0.35]]) { const l = mk(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6), al, g, s * 0.25, 0.21, z); l.rotation.x = r; }
    mk(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6), al, g, s * 0.25, 0.6, 0.0).rotation.x = PI / 2;
  }
  return { g };
}

/** A tailor's tape: a yellow ribbon stretched between two world points (set(a, b)), cm ticks along it. */
export function makeTape() {
  const tex = canvasTex(1024, 32, (c, w, h) => { c.fillStyle = '#f2d23a'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 1.5, x % 64 ? 8 : 16); }, [1, 1]);
  tex.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.035), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }));
  const _d = new THREE.Vector3(), _q = new THREE.Quaternion();
  function set(a, b) {
    _d.subVectors(b, a); const l = Math.max(0.001, _d.length());
    m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(l, 1, 1); tex.repeat.x = l / 1.5;
    _q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), _d.normalize()); m.quaternion.copy(_q);
  }
  return { g: m, set };
}

/** Rolling clothes rack with suits on hangers. Pivot at the back foot (tip.rotation.x < 0 tips it backward, away from +z). */
export function makeClothesRack({ n = 9, seed = 2 } = {}) {
  const g = new THREE.Group(), tip = new THREE.Group(); tip.position.z = -0.25; g.add(tip);
  const chrome = mat(0xc9ccd2, 0.25, { metalness: 0.8 }), R = rng(seed);
  const COLS = [0x2f3a4a, 0x6b5a48, 0x3a3d42, 0x45607a, 0x8a3a3a, 0x2a4a3a, 0xc9b48e, 0x5a4a6a, 0x1f2a3a];
  for (const s of [-1, 1]) { mk(new THREE.CylinderGeometry(0.018, 0.018, 1.65, 8), chrome, tip, s * 0.75, 0.86, 0.25); mk(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 8), chrome, tip, s * 0.75, 0.06, 0.25).rotation.x = PI / 2; }
  mk(new THREE.CylinderGeometry(0.018, 0.018, 1.55, 8), chrome, tip, 0, 1.68, 0.25).rotation.z = PI / 2;
  const suits = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group(); s.position.set(-0.62 + (i / (n - 1)) * 1.24, 1.66, 0.25); s.rotation.y = PI / 2 + (R() - 0.5) * 0.2; tip.add(s);
    const c = COLS[i % COLS.length];
    mk(new RoundedBoxGeometry(0.44, 0.7, 0.1, 2, 0.04), mat(c, 0.85), s, 0, -0.42, 0);
    mk(new THREE.BoxGeometry(0.46, 0.02, 0.02), mat(0x8a6a4a, 0.6), s, 0, -0.06, 0);
    mk(new THREE.BoxGeometry(0.08, 0.3, 0.11), mat(0xf4f4f2, 0.8), s, 0, -0.2, 0.0);
    s.userData.home = s.position.clone(); suits.push(s);
  }
  return { g, tip, suits };
}

/** Green highway-style road sign on two posts; lines = [[text, px], …] (centered). Faces +z. */
export function makeRoadSign(lines, { w = 2.6, h = 1.5, post = 2.0 } = {}) {
  const g = new THREE.Group(), steel = mat(0x9aa0a6, 0.4, { metalness: 0.5 });
  const tex = canvasTex(512, Math.round(512 * h / w), (c, cw, ch) => {
    c.fillStyle = '#1f6b45'; c.fillRect(0, 0, cw, ch); c.strokeStyle = '#f4f4f2'; c.lineWidth = 8; c.strokeRect(10, 10, cw - 20, ch - 20);
    c.fillStyle = '#f4f4f2'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const tot = lines.reduce((s, [, px]) => s + px * 1.18, 0); let y = ch / 2 - tot / 2;
    for (const [t, px] of lines) { c.font = `bold ${px}px Helvetica, Arial, sans-serif`; y += px * 0.59; c.fillText(t, cw / 2, y); y += px * 0.59; }
  });
  const panel = mk(new THREE.BoxGeometry(w, h, 0.05), [steel, steel, steel, steel, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), steel], g, 0, post + h / 2, 0);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.05, 0.05, post + h, 8), steel, g, s * w * 0.32, (post + h) / 2, -0.06);
  return { g, panel };
}

/** A flag on a pole whose cloth is a pixel censor mosaic (the planted flag). update(t) waves it. */
export function makeMosaicFlag({ h = 1.4 } = {}) {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.015, 0.015, h, 8), mat(0xc9ccd2, 0.3, { metalness: 0.7 }), g, 0, h / 2, 0);
  const c = makeCensor({ seed: 11, n: 8 });
  const cloth = mk(new THREE.PlaneGeometry(0.6, 0.4, 10, 4), new THREE.MeshBasicMaterial({ map: c.mat.map, side: THREE.DoubleSide, toneMapped: false }), g, 0.31, h - 0.22, 0);
  const pos = cloth.geometry.attributes.position, x0 = Array.from({ length: pos.count }, (_, i) => pos.getX(i));
  function update(t) { for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.05 * Math.sin(t * 3 + x0[i] * 7) * (x0[i] + 0.3)); pos.needsUpdate = true; }
  update(0);
  return { g, update };
}
