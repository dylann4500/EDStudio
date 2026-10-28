// PROPS for oxygen / fire stories (built for videos/037-oxygen-doubles). Everything is a cartoon: no real hazard detail.
//   makeFlames({n, r, seed})   a fire made of n cartoon flame tongues (3 nested teardrops: red → orange → yellow, unlit Basic
//                              materials, so they read in DAYLIGHT — additive glow sprites wash out to white blobs on a bright
//                              sky). update(t, h, {wind:[x,z], width, maxW, spread}) sets the fire's height h (m) every frame; h = 0
//                              hides it. maxW caps a tongue's width (a 4 m column must not be 2 m wide: it hid every face).
//   makeCake({candles})        two-tier birthday cake, frosting drips, candles; `wicks` = local wick tips (for flames), top at `topY`.
//   makeGrill()                kettle grill on legs: `lid` hinge (rotation.x −1.9 = open), `grateY`, `patties[]` (fly them).
//   makeCampfire()             stone ring + crossed logs + embers; makeTent(color); makeStick() (marshmallow stick, `tip`, `mallow`).
//   makeFireTruck()            ~8.5 m toy pumper facing +x: cab, ladder, hose reel, light bar (`setLights(t, on)`), `nozzleAt`.
//   makeHelmet(color)          firefighter helmet (parent to rig.head.g, y ≈ headR·0.9).
//   makeDragonfly({span})      giant dragonfly (span in m, nose +z): `update(t, rate)` flaps 4 wings, `wings[]`.
//   makeExtinguisher()         red extinguisher, `nozzle` (local tip), `g`.
//   makeFinishArch(text, w)    inflatable FINISH arch over a road (spans x = ±w/2) + a tape that snaps: setTape(k 0..1, t).
//   makeBarrier(len)           steel crowd barrier along x.  makeBib(n) = a race bib plane (attach to rig.spine).
//   makePartyHat(color)        striped cone + pom-pom.  makeBalloon(color) = balloon on a string (origin = string end).
import * as THREE from 'three';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';

const PI = Math.PI;
const unlit = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

// ---------------------------------------------------------------- flames
let TONGUE = null;
function tongueGeo() {
  if (TONGUE) return TONGUE;
  // teardrop profile (radius, height): round bottom, pointy top. No two equal consecutive points (LatheGeometry NaN rule).
  const pts = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14, y = u; const r = u < 0.25 ? Math.sin((u / 0.25) * PI / 2) * 0.36 : 0.36 * Math.pow(1 - (u - 0.25) / 0.75, 1.35); pts.push(new THREE.Vector2(Math.max(0.001, r), y - 0.04 + 0.0001 * i)); }
  TONGUE = new THREE.LatheGeometry(pts, 14);
  return TONGUE;
}
const FL_MATS = { a: null };
function flameMats() {
  if (FL_MATS.a) return FL_MATS.a;
  // transparent + no depth write + renderOrder 0/1/2: the inner layers draw OVER the outer one (they sit inside it), so the
  // red → orange → yellow bands always show; an opaque outer shell hid them and every fire read as one flat orange curtain.
  FL_MATS.a = [0xe0391a, 0xff8c1f, 0xffe27a].map((c, k) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: [0.9, 0.95, 1][k], depthWrite: false }));
  return FL_MATS.a;
}
export function makeFlames({ n = 7, r = 0.35, seed = 1 } = {}) {
  const g = new THREE.Group(), R = rng(seed), M = flameMats(), geo = tongueGeo();
  const tongues = Array.from({ length: n }, (_, i) => {
    const t = new THREE.Group(); g.add(t);
    const layers = [1, 0.7, 0.42].map((s, k) => { const m = new THREE.Mesh(geo, M[k]); m.scale.set(s, s * 0.92, s); m.position.y = 0.015 * k; m.renderOrder = 5 + k; m.castShadow = false; t.add(m); return m; });
    const a = R() * PI * 2, d = i === 0 ? 0 : Math.sqrt(R()) * r;
    return { t, layers, x: Math.cos(a) * d, z: Math.sin(a) * d, ph: R() * 10, f: 7 + R() * 6, k: i === 0 ? 1 : 0.5 + R() * 0.45 };
  });
  function update(t, h, o = {}) {
    g.visible = h > 0.005;
    if (!g.visible) return;
    const wx = o.wind ? o.wind[0] : 0, wz = o.wind ? o.wind[1] : 0;
    tongues.forEach((T) => {
      const fl = 1 + 0.16 * Math.sin(t * T.f + T.ph) + 0.1 * Math.sin(t * T.f * 2.3 + T.ph * 2);
      const hh = h * T.k * fl, w = Math.min(o.maxW ?? 1e9, Math.max(0.05, h * 0.55)) * (0.75 + 0.25 * T.k) * (o.width ?? 1);
      T.t.position.set(T.x * (o.spread ?? 1), 0, T.z * (o.spread ?? 1));
      T.t.scale.set(w, hh, w);
      T.t.rotation.set(wz * 0.6 + 0.08 * Math.sin(t * 5 + T.ph), 0, -wx * 0.6 + 0.08 * Math.sin(t * 4.3 + T.ph));
    });
  }
  return { g, update, tongues };
}

// ---------------------------------------------------------------- birthday
export function makeCake({ candles = 7, r = 0.17 } = {}) {
  const g = new THREE.Group();
  const sponge = mat(0xf6d7a6, 0.8), frost = mat(0xfdf3f6, 0.5), pink = mat(0xf29ab8, 0.5);
  mk(new THREE.CylinderGeometry(r + 0.06, r + 0.06, 0.012, 32), mat(0xf4f4f4, 0.3), g, 0, 0.006, 0);
  mk(new THREE.CylinderGeometry(r, r, 0.09, 32), frost, g, 0, 0.057, 0);
  mk(new THREE.CylinderGeometry(r * 0.72, r * 0.72, 0.07, 28), frost, g, 0, 0.137, 0);
  mk(new THREE.TorusGeometry(r, 0.012, 6, 32), pink, g, 0, 0.1, 0).rotation.x = PI / 2;
  mk(new THREE.TorusGeometry(r * 0.72, 0.011, 6, 28), pink, g, 0, 0.17, 0).rotation.x = PI / 2;
  for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2; const d = mk(new THREE.CapsuleGeometry(0.009, 0.02 + (i % 3) * 0.01, 3, 6), pink, g, Math.cos(a) * r, 0.085, Math.sin(a) * r); d.scale.z = 0.6; }
  void sponge;
  const wicks = [], cols = [0x6fb3e8, 0xf2c14e, 0x8fd18a, 0xe58fa6, 0xb08fe0];
  for (let i = 0; i < candles; i++) {
    const a = candles === 1 ? 0 : i / candles * PI * 2, d = candles === 1 ? 0 : r * 0.45;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    mk(new THREE.CylinderGeometry(0.0065, 0.0065, 0.07, 8), mat(cols[i % cols.length], 0.4), g, x, 0.207, z);
    mk(new THREE.CylinderGeometry(0.0015, 0.0015, 0.012, 4), mat(0x222222, 0.8), g, x, 0.248, z);
    wicks.push(new THREE.Vector3(x, 0.252, z));
  }
  return { g, wicks, topY: 0.172 };
}
export function makePartyHat(color = 0x4f9bd9) {
  const g = new THREE.Group();
  const tex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(color).getHexString(); c.fillRect(0, 0, w, h); c.fillStyle = '#fff3a8'; for (let i = -4; i < 8; i++) { c.save(); c.translate(i * 22, 0); c.rotate(0.5); c.fillRect(0, -40, 7, 260); c.restore(); } });
  mk(new THREE.ConeGeometry(0.075, 0.2, 18, 1, true), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }), g, 0, 0.1, 0);
  mk(new THREE.SphereGeometry(0.024, 10, 8), mat(0xffffff, 0.8), g, 0, 0.205, 0);
  return g;
}
export function makeBalloon(color = 0xe2574c) {
  const g = new THREE.Group();
  const b = mk(new THREE.SphereGeometry(0.16, 20, 16), mat(color, 0.25), g, 0, 0.9, 0); b.scale.set(1, 1.18, 1);
  mk(new THREE.CylinderGeometry(0.003, 0.003, 0.72, 4), mat(0xeeeeee, 0.8), g, 0, 0.38, 0);
  return g;
}

// ---------------------------------------------------------------- backyard grill
export function makeGrill() {
  const g = new THREE.Group(), black = mat(0x24262a, 0.35, { metalness: 0.4 }), steel = mat(0xb9bcc2, 0.35, { metalness: 0.7 });
  const bowl = mk(new THREE.SphereGeometry(0.33, 28, 14, 0, PI * 2, PI / 2, PI / 2), black, g, 0, 0.82, 0); bowl.material.side = THREE.DoubleSide;
  for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2; const l = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 8), steel, g, Math.cos(a) * 0.22, 0.42, Math.sin(a) * 0.22); l.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); }
  mk(new THREE.TorusGeometry(0.33, 0.012, 6, 30), steel, g, 0, 0.82, 0).rotation.x = PI / 2;
  // grate
  for (let i = -5; i <= 5; i++) mk(new THREE.BoxGeometry(0.6 * Math.sqrt(Math.max(0.02, 1 - (i / 5.6) ** 2)), 0.008, 0.008), steel, g, 0, 0.8, i * 0.055);
  // coals
  for (let i = 0; i < 18; i++) { const a = i * 2.4, d = 0.05 + (i % 5) * 0.045; mk(new THREE.DodecahedronGeometry(0.035), mat(0x3a3330, 0.9), g, Math.cos(a) * d, 0.62 + (i % 3) * 0.01, Math.sin(a) * d); }
  // lid on a hinge at the back (−z): rotation.x −1.9 = flipped open
  const lid = new THREE.Group(); lid.position.set(0, 0.83, -0.33); g.add(lid);
  mk(new THREE.SphereGeometry(0.335, 28, 14, 0, PI * 2, 0, PI / 2.2), black, lid, 0, 0, 0.33).material.side = THREE.DoubleSide;
  mk(new THREE.BoxGeometry(0.16, 0.025, 0.04), mat(0x5a3a22, 0.6), lid, 0, 0.32, 0.33);
  const patties = Array.from({ length: 4 }, (_, i) => { const p = mk(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 14), mat(0x6a3a22, 0.8), g, -0.12 + (i % 2) * 0.22, 0.82, -0.1 + Math.floor(i / 2) * 0.2); return p; });
  return { g, lid, patties, grateY: 0.81 };
}
export function makeCampfire() {
  const g = new THREE.Group(), stone = mat(0x8a857c, 0.9), bark = mat(0x5a4230, 0.95), char = mat(0x2a2220, 0.95);
  for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; const s = mk(new THREE.DodecahedronGeometry(0.13 + (i % 3) * 0.03), stone, g, Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62); s.scale.y = 0.7; }
  for (let i = 0; i < 4; i++) { const l = mk(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 8), i % 2 ? bark : char, g, 0, 0.14, 0); l.rotation.set(PI / 2 - 0.35, i * PI / 2 + 0.3, 0); l.position.set(Math.cos(i * PI / 2 + 0.3) * 0.12, 0.17, Math.sin(i * PI / 2 + 0.3) * 0.12); }
  const emberM = unlit(new THREE.Color(0xff6a20));
  for (let i = 0; i < 10; i++) mk(new THREE.DodecahedronGeometry(0.03), emberM, g, Math.cos(i * 2.1) * 0.15, 0.04, Math.sin(i * 2.1) * 0.15);
  return { g };
}
export function makeTent(color = 0xe08a3a) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.5, 4, 1, true), new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide }));
  shell.rotation.y = PI / 4; shell.position.y = 0.75; shell.scale.set(1, 1, 1.35); g.add(shell); shell.castShadow = true;
  const door = mk(new THREE.PlaneGeometry(0.7, 0.9), mat(0x2a2a30, 0.9), g, 0, 0.45, 0.93); door.rotation.x = -0.55;
  return g;
}
export function makeStick() {
  const g = new THREE.Group();
  const s = mk(new THREE.CylinderGeometry(0.006, 0.008, 1.0, 6), mat(0x8a6a48, 0.9), g, 0, 0, 0.5); s.rotation.x = PI / 2;
  const mallow = mk(new THREE.CylinderGeometry(0.028, 0.028, 0.045, 12), mat(0xfbf7ee, 0.7), g, 0, 0, 0.98); mallow.rotation.x = PI / 2;
  return { g, mallow, tip: new THREE.Vector3(0, 0, 0.98) };
}

// ---------------------------------------------------------------- firefighting
export function makeFireTruck() {
  const g = new THREE.Group();
  const red = mat(0xc8231e, 0.35), white = mat(0xf2f2ee, 0.4), chrome = mat(0xd0d4d8, 0.25, { metalness: 0.8 }), black = mat(0x1c1c1e, 0.8), glass = mat(0x1d2633, 0.15);
  mk(new THREE.BoxGeometry(6.0, 1.45, 2.4), red, g, -0.9, 1.35, 0);             // body
  mk(new THREE.BoxGeometry(2.3, 2.0, 2.4), red, g, 3.2, 1.6, 0);                // cab
  mk(new THREE.BoxGeometry(0.05, 0.8, 2.1), glass, g, 4.36, 2.05, 0);           // windshield
  for (const z of [-1.21, 1.21]) {
    mk(new THREE.BoxGeometry(1.1, 0.7, 0.03), glass, g, 3.35, 2.1, z);
    mk(new THREE.BoxGeometry(6.0, 0.12, 0.03), white, g, -0.9, 1.0, z);        // stripe
    for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(1.25, 0.95, 0.04), mat(0xb21d19, 0.3), g, -3.2 + i * 1.5, 1.4, z);   // lockers
    for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.06, 0.06, 0.05), chrome, g, -2.7 + i * 1.5, 1.4, z * 1.01);
  }
  mk(new THREE.BoxGeometry(0.2, 0.5, 2.5), chrome, g, 4.45, 0.75, 0);            // bumper
  for (const z of [-0.85, 0.85]) mk(new THREE.BoxGeometry(0.04, 0.18, 0.3), unlit(new THREE.Color(0xfff6d8)), g, 4.37, 1.15, z);
  for (const [x, z] of [[3.1, -1.1], [3.1, 1.1], [-1.6, -1.1], [-1.6, 1.1], [-2.9, -1.1], [-2.9, 1.1]]) { const w = mk(new THREE.CylinderGeometry(0.52, 0.52, 0.34, 18), black, g, x, 0.52, z); w.rotation.x = PI / 2; mk(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 12), chrome, g, x, 0.52, z).rotation.x = PI / 2; }
  // ladder on top
  const lad = new THREE.Group(); lad.position.set(-0.8, 2.15, 0); g.add(lad);
  for (const z of [-0.4, 0.4]) mk(new THREE.BoxGeometry(6.4, 0.08, 0.08), chrome, lad, 0, 0, z);
  for (let i = 0; i < 16; i++) mk(new THREE.BoxGeometry(0.05, 0.05, 0.8), chrome, lad, -3.1 + i * 0.41, 0, 0);
  // hose reel at the back
  const reel = mk(new THREE.CylinderGeometry(0.42, 0.42, 1.6, 18), mat(0xd9c69a, 0.8), g, -4.05, 1.25, 0); reel.rotation.x = PI / 2;
  // light bar on the cab: red/white, `setLights` blinks them (alternating)
  const lights = [];
  for (let i = 0; i < 4; i++) { const m = new THREE.MeshBasicMaterial({ color: 0x441010, toneMapped: false }); lights.push(mk(new THREE.BoxGeometry(0.22, 0.14, 0.4), m, g, 3.2, 2.67, -0.75 + i * 0.5)); }
  const beacon = new THREE.PointLight(0xff3030, 0, 9, 1.6); beacon.position.set(3.2, 3.0, 0); g.add(beacon);
  function setLights(t, on = 1) {
    lights.forEach((l, i) => { const k = on * (Math.sin(t * 9 + (i % 2) * PI) > 0 ? 1 : 0.08); l.material.color.setRGB(i % 2 ? 2.4 * k + 0.2 : 2.6 * k + 0.25, i % 2 ? 2.2 * k : 0.25 * k + 0.05, i % 2 ? 2.2 * k : 0.2 * k + 0.05); });
    beacon.intensity = on * (Math.sin(t * 9) > 0 ? 3 : 0.5);
  }
  setLights(0, 0);
  return { g, setLights };
}
export function makeHelmet(color = 0xd8b02a) {
  const g = new THREE.Group(), m = mat(color, 0.35);
  mk(new THREE.SphereGeometry(0.16, 22, 12, 0, PI * 2, 0, PI / 2), m, g, 0, 0, 0);
  const brim = mk(new THREE.CylinderGeometry(0.21, 0.23, 0.02, 24), m, g, 0, 0.005, -0.03); brim.scale.z = 1.15;
  mk(new THREE.BoxGeometry(0.03, 0.06, 0.26), m, g, 0, 0.15, 0);
  mk(new THREE.BoxGeometry(0.09, 0.08, 0.015), mat(0xf2f2f2, 0.5), g, 0, 0.09, 0.15).rotation.x = -0.5;
  return g;
}
export function makeExtinguisher() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.065, 0.065, 0.42, 16), mat(0xd22a22, 0.3), g, 0, 0.21, 0);
  mk(new THREE.SphereGeometry(0.065, 14, 8, 0, PI * 2, 0, PI / 2), mat(0xd22a22, 0.3), g, 0, 0.42, 0);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), mat(0x222222, 0.5), g, 0, 0.5, 0);
  mk(new THREE.BoxGeometry(0.14, 0.02, 0.03), mat(0x222222, 0.5), g, 0.03, 0.54, 0);
  const hose = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), mat(0x222222, 0.6), g, 0, 0.5, 0.12); hose.rotation.x = PI / 2 - 0.3;
  mk(new THREE.CylinderGeometry(0.02, 0.012, 0.06, 8), mat(0x111111, 0.6), g, 0, 0.55, 0.27).rotation.x = PI / 2;
  mk(new THREE.PlaneGeometry(0.08, 0.12), mat(0xf2f2ee, 0.5), g, 0, 0.24, 0.066);
  return { g, nozzle: new THREE.Vector3(0, 0.55, 0.3) };
}

// ---------------------------------------------------------------- dragonfly (Meganeura-style giant; nose +z)
export function makeDragonfly({ span = 0.7, body = 0x2f7a6a, eye = 0x4fb0e0, seed = 1 } = {}) {
  const g = new THREE.Group(), k = span / 0.7;
  const bodyM = mat(body, 0.35, { metalness: 0.3 }), eyeM = mat(eye, 0.15, { metalness: 0.2 }), dark = mat(0x1f2a28, 0.5);
  const s = new THREE.Group(); s.scale.setScalar(k); g.add(s);
  const th = mk(new THREE.SphereGeometry(0.045, 16, 12), bodyM, s, 0, 0, 0.03); th.scale.set(1, 1.05, 1.5);
  for (let i = 0; i < 9; i++) { const seg = mk(new THREE.CylinderGeometry(0.018 - i * 0.0009, 0.02 - i * 0.0009, 0.04, 10), i % 2 ? bodyM : dark, s, 0, 0.004 * Math.sin(i * 0.4), -0.04 - i * 0.038); seg.rotation.x = PI / 2; }
  const head = mk(new THREE.SphereGeometry(0.03, 14, 10), bodyM, s, 0, 0.005, 0.1);
  for (const x of [-0.028, 0.028]) { mk(new THREE.SphereGeometry(0.03, 14, 12), eyeM, s, x, 0.012, 0.108); mk(new THREE.SphereGeometry(0.008, 8, 6), mat(0xffffff, 0.2), s, x * 1.25, 0.03, 0.125); }
  void head;
  for (let i = 0; i < 3; i++) for (const x of [-1, 1]) { const l = mk(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 4), dark, s, x * 0.03, -0.04, 0.05 - i * 0.025); l.rotation.set(0.3, 0, x * 0.9); }
  const wingTex = canvasTex(256, 64, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(190,225,250,0.72)'; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 4, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,60,70,0.55)'; c.lineWidth = 2; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 4, 0, 0, 7); c.stroke();
    c.lineWidth = 1; for (let i = 1; i < 14; i++) { c.beginPath(); c.moveTo(i * w / 14, 6); c.lineTo(i * w / 14 + 6, h - 6); c.stroke(); }
    c.beginPath(); c.moveTo(4, h / 2); c.lineTo(w - 4, h / 2 - 3); c.stroke();
    c.fillStyle = 'rgba(30,40,40,0.7)'; c.fillRect(w - 30, h / 2 - 8, 12, 6);
  });
  const wingM = new THREE.MeshBasicMaterial({ map: wingTex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const wings = [];
  for (const [z, len] of [[0.045, 0.34], [0.0, 0.32]]) for (const x of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(x * 0.02, 0.03, z); s.add(piv);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.075), wingM); w.rotation.x = -PI / 2; w.position.x = x * len / 2; piv.add(w); w.renderOrder = 3;
    wings.push({ piv, x, front: z > 0 });
  }
  const R = rng(seed), ph = R() * 6;
  function update(t, rate = 26) {
    wings.forEach((W) => { const a = 0.55 * Math.sin(t * rate + ph + (W.front ? 0 : 1.6)); W.piv.rotation.z = W.x * a; });
  }
  update(0);
  return { g, wings, update };
}

// ---------------------------------------------------------------- race day
export function makeFinishArch(text = 'FINISH', w = 7.4) {
  const g = new THREE.Group(), blue = mat(0x2f6ad0, 0.6), wht = mat(0xf2f2ee, 0.6);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, -w / 2), new THREE.Vector3(0, 3.6, -w / 2 + 0.3), new THREE.Vector3(0, 4.8, 0), new THREE.Vector3(0, 3.6, w / 2 - 0.3), new THREE.Vector3(0, 0, w / 2)]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.42, 14, false), blue); tube.castShadow = true; g.add(tube);
  const tex = canvasTex(1024, 192, (c, W, H) => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, W, H); for (let i = 0; i < 32; i++) { c.fillStyle = (i % 2) ? '#111' : '#f2f2ee'; c.fillRect(i * 32, 0, 32, 24); c.fillStyle = (i % 2) ? '#f2f2ee' : '#111'; c.fillRect(i * 32, H - 24, 32, 24); } c.fillStyle = '#d2302a'; c.font = 'bold 120px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W / 2, H / 2 + 4); });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 4.6), [wht, wht, wht, wht, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })]);
  banner.position.set(0, 3.75, 0); banner.rotation.y = PI / 2; g.add(banner);
  // tape: two halves pinned at the posts; setTape(k) — k 0 = taut, > 0 = snapped and flying back
  const tapeM = new THREE.MeshStandardMaterial({ color: 0xf2c94a, roughness: 0.6, side: THREE.DoubleSide });
  const halves = [-1, 1].map((sd) => { const piv = new THREE.Group(); piv.position.set(0, 1.15, sd * (w / 2 - 0.5)); g.add(piv); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, w / 2 - 0.5), tapeM); m.position.z = -sd * (w / 2 - 0.5) / 2; m.rotation.y = PI / 2; m.rotation.x = PI / 2; piv.add(m); return { piv, sd }; });
  function setTape(k, t = 0) { halves.forEach((H) => { H.piv.rotation.y = -H.sd * k * 2.2; H.piv.rotation.x = H.sd * 0.4 * k; H.piv.position.y = 1.15 - 0.5 * k + 0.05 * Math.sin(t * 9) * k; }); }
  setTape(0);
  return { g, setTape };
}
export function makeBarrier(len = 2.2) {
  const g = new THREE.Group(), m = mat(0xc9ccd0, 0.35, { metalness: 0.6 });
  for (const y of [0.25, 1.05]) mk(new THREE.CylinderGeometry(0.02, 0.02, len, 6), m, g, 0, y, 0).rotation.z = PI / 2;
  for (let i = 0; i <= 10; i++) mk(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 5), m, g, -len / 2 + i * len / 10, 0.65, 0);
  for (const x of [-len / 2, len / 2]) { mk(new THREE.CylinderGeometry(0.022, 0.022, 1.08, 6), m, g, x, 0.54, 0); const f = mk(new THREE.BoxGeometry(0.05, 0.03, 0.6), m, g, x, 0.03, 0); f.rotation.y = 0; }
  return g;
}
export function makeBib(n = 1, color = '#e2453c') {
  const tex = canvasTex(128, 96, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = color; c.fillRect(0, 0, w, 16); c.fillStyle = '#1a1a1a'; c.font = 'bold 54px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), w / 2, h / 2 + 10); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.12), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  m.position.set(0, 0.26, 0.135); m.rotation.x = -0.08;
  return m;
}

/** Crow (from 013, ~0.32 m long at scale 1 — scale 1.4 for a real crow): `flap(k, t)` 0 = folded … 1 = flying. Nose +z. */
export function makeCrow() {
  const g = new THREE.Group(), black = mat(0x16161c, 0.55), beakM = mat(0x2d2b2a, 0.4);
  const body = new THREE.Group(); g.add(body);
  mk(new THREE.SphereGeometry(0.1, 14, 12), black, body, 0, 0.17, 0).scale.set(1, 0.95, 1.55);
  const head = new THREE.Group(); head.position.set(0, 0.27, 0.12); body.add(head);
  mk(new THREE.SphereGeometry(0.068, 14, 12), black, head);
  const beak = mk(new THREE.ConeGeometry(0.026, 0.1, 10), beakM, head, 0, -0.01, 0.1); beak.rotation.x = PI / 2;
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.016, 8, 6), mat(0xffffff, 0.3), head, s * 0.045, 0.02, 0.04); mk(new THREE.SphereGeometry(0.009, 8, 6), mat(0x000000, 0.2), head, s * 0.052, 0.022, 0.05); }
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); w.position.set(s * 0.085, 0.21, 0.02); body.add(w); const m = mk(new THREE.BoxGeometry(0.2, 0.02, 0.22), black, w, s * 0.09, 0, -0.03); m.rotation.z = s * 0.05; return w; });
  const tail = mk(new THREE.BoxGeometry(0.1, 0.02, 0.16), black, body, 0, 0.16, -0.2); tail.rotation.x = 0.35;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 5), beakM, g, s * 0.035, 0.045, 0.01);
  const flap = (k, t) => wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (k * (0.9 + 0.8 * Math.sin(t * 38)) + 0.05)));
  return { g, body, head, flap };
}
