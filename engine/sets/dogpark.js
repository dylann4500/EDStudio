// SET: sunny dog park (video 030, Pip ep. 3) — a fenced lawn ("BARK PARK") with a double-gate entry, a big shade tree,
// agility gear (A-frame, weave poles, tunnel, jump bar, tire jump, a pause table), a blue kiddie pool, a dog fountain,
// benches along the fence, a waste-bag station, toys in the grass. Outside: a gravel path with lamps, a parking lot,
// a ring of trees, rooftops and hills. Reusable for any park / dog / picnic beat.
//
// Coordinates (meters, y up). Park floor y = 0. Chain-link fence (1.2 m) around x∈[-16, 16], z∈[-15, 11].
//   Gate: the double-gate vestibule at the front fence, x∈[-9.7, -8.3] (inner gate z = 11, outer z = 13.2), BARK PARK arch
//   above it. DIMS.tree = the big shade tree, DIMS.table = pause table (top DIMS.tableY), DIMS.pool (+ waterY),
//   DIMS.benches [{x, z, rotY}] (seat top DIMS.seatY; a bench faces +z of its own frame), DIMS.aframe, DIMS.weave, …
// Handles: aimSun(cx, cz, half), fog, gates.{inner, outer} (hinge groups: rotation.y opens), fence.{front, back, left, right}
//   (chain-link panels — hide the one between the lens and the subject), setSign(text), update(t) (pool ripples, leaves).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

const PI = Math.PI;
export const DIMS = {
  x0: -16, x1: 16, z0: -15, z1: 11, fenceH: 1.2,
  gate: { x: -9, w: 1.4, zIn: 11, zOut: 13.2 },
  tree: [-6, -5], table: [6.5, 1.5], tableY: 0.5, pool: [3.2, 4.0], poolR: 0.85, waterY: 0.09,
  aframe: [10, -7], weave: [2, -10], tunnel: [-2, -12.5], jump: [13, -3], tire: [-11, -10], fountain: [-14.5, -2],
  benches: [{ x: 11.6, z: 10.25, rotY: PI }, { x: -15.0, z: 1.5, rotY: PI / 2 }, { x: 0.5, z: 10.25, rotY: PI }, { x: 15.0, z: -6, rotY: -PI / 2 }],
  seatY: 0.45,
};

function grassTex(base = '#79a84e', seed = 4, rep = [60, 60]) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(seed);
    for (let i = 0; i < 4200; i++) { g.fillStyle = R() < 0.5 ? 'rgba(40,85,20,.16)' : 'rgba(185,225,120,.15)'; g.fillRect(R() * w, R() * h, 2, 5 + R() * 3); }
  }, rep);
}
/** mowed stripes: alternating light/dark bands (the inside lawn) */
function lawnTex() {
  return canvasTex(512, 512, (g, w, h) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7fb253' : '#8cbd5c'; g.fillRect(0, (i * h) / 8, w, h / 8); }
    const R = rng(12);
    for (let i = 0; i < 5000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(40,85,20,.15)' : 'rgba(200,235,140,.14)'; g.fillRect(R() * w, R() * h, 2, 5 + R() * 3); }
    for (let i = 0; i < 90; i++) { g.fillStyle = ['#fff6d8', '#f6e27a', '#ffffff'][i % 3]; g.beginPath(); g.arc(R() * w, R() * h, 1.6, 0, 7); g.fill(); }   // tiny daisies
  }, [4, 4]);
}
function dirtTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(176,140,96,1)'); gr.addColorStop(0.6, 'rgba(176,140,96,.85)'); gr.addColorStop(1, 'rgba(176,140,96,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(3);
    for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h, d = Math.hypot(x - w / 2, y - h / 2) / (w / 2); if (d > 0.9) continue; g.fillStyle = R() < 0.5 ? 'rgba(90,70,45,.25)' : 'rgba(225,200,160,.25)'; g.fillRect(x, y, 3, 3); }
  });
}
function chainTex() {
  return canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w / 2, 0); g.lineTo(w, h / 2); g.lineTo(w / 2, h); g.closePath(); g.stroke();
  });
}
function gravelTex() {
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d8ccb6'; g.fillRect(0, 0, w, h); const R = rng(6); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '120,105,85' : '255,250,240'},${0.15 + R() * 0.2})`; g.fillRect(R() * w, R() * h, 2 + R() * 2, 2 + R() * 2); } }, [24, 2]);
}
function asphaltTex() {
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#6a6c70'; g.fillRect(0, 0, w, h); const R = rng(2); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},${0.04 + R() * 0.06})`; g.fillRect(R() * w, R() * h, 2, 2); } }, [6, 3]);
}
function skyTex() {
  return canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4b8fd8'); gr.addColorStop(0.42, '#a9d1f0'); gr.addColorStop(0.5, '#eef3ee'); gr.addColorStop(1, '#eef3ee'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
}
/** a sign board texture: big centered lines, auto-fit */
function signTex(lines, { w = 1024, h = 256, bg = '#2f6a4a', fg = '#fff8e8', border = '#f2c14e', font = 'bold 150px Georgia, serif', paw = true } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = border; g.lineWidth = 16; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = lines.length, lh = (h - 40) / n;
    lines.forEach((L, i) => {
      let size = parseInt(font.match(/(\d+)px/)[1], 10) / (n > 1 ? 1.6 : 1); g.font = font.replace(/\d+px/, `${size}px`);
      while (g.measureText(L).width > w - (paw ? 260 : 80) && size > 20) { size -= 4; g.font = font.replace(/\d+px/, `${size}px`); }
      g.fillText(L, w / 2, 20 + lh * (i + 0.5) + 4);
    });
    if (paw) for (const x of [70, w - 70]) {   // paw prints on both ends
      g.fillStyle = border; g.beginPath(); g.ellipse(x, h / 2 + 18, 30, 24, 0, 0, 7); g.fill();
      for (const [dx, dy] of [[-30, -22], [-11, -42], [11, -42], [30, -22]]) { g.beginPath(); g.ellipse(x + dx, h / 2 + dy, 11, 14, 0, 0, 7); g.fill(); }
    }
  });
}

export function buildDogPark(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 30);
  const fog = new THREE.Fog(0xe6eef0, 45, 260);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const flat = (geo, m, x, y, z, p = root) => { const o = mk(geo, m, p, x, y, z); o.rotation.x = -PI / 2; o.castShadow = false; return o; };
  const { x0, x1, z0, z1, fenceH } = DIMS;

  // ---------------------------------------------------------------- sky + ground
  root.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, toneMapped: false })));
  flat(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: grassTex('#74a24a', 4, [90, 90]), roughness: 0.96 }), 0, -0.01, 0);
  const lawn = flat(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: lawnTex(), roughness: 0.95 }), 0, 0.002, (z0 + z1) / 2);
  lawn.receiveShadow = true;
  const dirtM = new THREE.MeshStandardMaterial({ map: dirtTex(), transparent: true, roughness: 1, depthWrite: false });
  for (const [x, z, r] of [[DIMS.gate.x, 9.6, 1.8], [DIMS.tree[0], DIMS.tree[1], 2.6], [DIMS.pool[0], DIMS.pool[1], 1.6], [DIMS.fountain[0] + 0.6, DIMS.fountain[1], 1.2], [DIMS.aframe[0], DIMS.aframe[1] + 2.2, 1.0], [DIMS.aframe[0], DIMS.aframe[1] - 2.2, 1.0]]) {
    const d = flat(new THREE.CircleGeometry(r, 24), dirtM, x, 0.006, z); d.receiveShadow = true; d.rotation.z = R() * 6;
  }
  // gravel path outside the front fence + a parking lot
  flat(new THREE.PlaneGeometry(120, 2.6), new THREE.MeshStandardMaterial({ map: gravelTex(), roughness: 0.98 }), 0, 0.004, 14.6).receiveShadow = true;
  flat(new THREE.PlaneGeometry(30, 9), new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.92 }), -6, 0.005, 21.5).receiveShadow = true;
  for (let i = 0; i < 6; i++) flat(new THREE.PlaneGeometry(0.12, 4.2), mat(0xf4f1ea, 0.8), -18 + i * 4.6, 0.008, 21.5);
  for (const [cx, col, rot] of [[-15.7, 0xd2483f, 0], [-6.5, 0x3d7bd9, 0], [-1.9, 0xf2c14e, 0], [7.3, 0x6fa84f, PI]]) {
    const c = new THREE.Group(); c.position.set(cx, 0, 21.4); c.rotation.y = PI / 2 + rot; root.add(c); const cm = mat(col, 0.35);
    mk(new RoundedBoxGeometry(3.9, 0.62, 1.8, 3, 0.2), cm, c, 0, 0.62, 0); mk(new RoundedBoxGeometry(2.05, 0.58, 1.56, 3, 0.22), cm, c, -0.25, 1.15, 0);
    mk(new RoundedBoxGeometry(2.1, 0.5, 1.6, 2, 0.18), new THREE.MeshStandardMaterial({ color: 0x9cc4e0, roughness: 0.1, metalness: 0.3 }), c, -0.25, 1.17, 0).scale.set(0.98, 0.9, 1.01);
    for (const [wx, wz] of [[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]]) mk(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 14), mat(0x1c1c1e, 0.8), c, wx, 0.33, wz).rotation.x = PI / 2;
  }

  // ---------------------------------------------------------------- fence (chain link) + gate
  const postM = mat(0x3d5a48, 0.5, { metalness: 0.3 });
  const linkTex = chainTex();
  const linkM = (len) => { const t = linkTex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 0.09, fenceH / 0.09); return new THREE.MeshStandardMaterial({ color: 0x8a9a94, alphaMap: t, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4 }); };
  const fence = { front: new THREE.Group(), back: new THREE.Group(), left: new THREE.Group(), right: new THREE.Group(), vest: new THREE.Group() };
  Object.values(fence).forEach((g) => root.add(g));
  const post = (x, z, p, h = fenceH + 0.06) => mk(new THREE.CylinderGeometry(0.035, 0.04, h, 8), postM, p, x, h / 2, z);
  const rail = (ax, az, bx, bz, y, p) => { const L = Math.hypot(bx - ax, bz - az), m = mk(new THREE.CylinderGeometry(0.022, 0.022, L, 6), postM, p, (ax + bx) / 2, y, (az + bz) / 2); m.rotation.set(0, -Math.atan2(bz - az, bx - ax), PI / 2); return m; };
  const run = (ax, az, bx, bz, p) => {   // one straight fence run: link panel + posts + top rail
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.5));
    const pl = mk(new THREE.PlaneGeometry(L, fenceH), linkM(L), p, (ax + bx) / 2, fenceH / 2, (az + bz) / 2); pl.rotation.y = -Math.atan2(bz - az, bx - ax); pl.castShadow = false;
    for (let i = 0; i <= n; i++) post(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n, p);
    rail(ax, az, bx, bz, fenceH, p); rail(ax, az, bx, bz, 0.05, p);
  };
  const gx = DIMS.gate.x, gw = DIMS.gate.w, zo = DIMS.gate.zOut;
  run(x0, z1, gx - gw / 2 - 0.5, z1, fence.front); run(gx + gw / 2 + 0.5, z1, x1, z1, fence.front);
  run(x0, z0, x1, z0, fence.back); run(x0, z0, x0, z1, fence.left); run(x1, z0, x1, z1, fence.right);
  // vestibule (a small pen between the two gates)
  run(gx - gw / 2 - 0.5, z1, gx - gw / 2 - 0.5, zo, fence.vest); run(gx + gw / 2 + 0.5, z1, gx + gw / 2 + 0.5, zo, fence.vest);
  run(gx - gw / 2 - 0.5, zo, gx - gw / 2, zo, fence.vest); run(gx + gw / 2, zo, gx + gw / 2 + 0.5, zo, fence.vest);
  run(gx - gw / 2 - 0.5, z1, gx - gw / 2, z1, fence.vest); run(gx + gw / 2, z1, gx + gw / 2 + 0.5, z1, fence.vest);
  const makeGate = (z) => {   // hinge at the −x post; rotation.y > 0 swings it into the park (−z)
    const hinge = new THREE.Group(); hinge.position.set(gx - gw / 2, 0, z); root.add(hinge);
    const pl = mk(new THREE.PlaneGeometry(gw - 0.06, fenceH - 0.1), linkM(gw), hinge, gw / 2, fenceH / 2 + 0.02, 0); pl.castShadow = false;
    rail(0.02, 0, gw - 0.04, 0, fenceH - 0.02, hinge); rail(0.02, 0, gw - 0.04, 0, 0.08, hinge);
    mk(new THREE.CylinderGeometry(0.025, 0.025, fenceH - 0.06, 6), postM, hinge, 0.02, fenceH / 2 + 0.02, 0); mk(new THREE.CylinderGeometry(0.025, 0.025, fenceH - 0.06, 6), postM, hinge, gw - 0.05, fenceH / 2 + 0.02, 0);
    mk(new THREE.BoxGeometry(0.08, 0.05, 0.06), mat(0xc9c2b6, 0.3, { metalness: 0.7 }), hinge, gw - 0.07, fenceH - 0.2, 0);   // latch
    post(gw, z, root);
    return hinge;
  };
  const gates = { inner: makeGate(z1), outer: makeGate(zo) };
  // the BARK PARK arch over the inner gate (readable from both sides)
  const arch = new THREE.Group(); arch.position.set(gx, 0, z1); root.add(arch);
  const woodM = mat(0x7a5236, 0.75);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.07, 0.08, 2.75, 10), woodM, arch, s * (gw / 2 + 0.55), 1.375, 0);
  let signTexs = [signTex(['BARK PARK'])];
  const signM = new THREE.MeshStandardMaterial({ map: signTexs[0], roughness: 0.7 });
  box(2.86, 0.62, 0.08, woodM, 0, 2.38, 0, arch);
  for (const s of [-1, 1]) { const f = mk(new THREE.PlaneGeometry(2.7, 0.52), signM, arch, 0, 2.38, s * 0.045); if (s < 0) f.rotation.y = PI; }
  const setSign = (text) => { signM.map = signTex([text]); signM.needsUpdate = true; };
  // rules board inside the gate + a "close both gates" plate on the vestibule
  const rules = new THREE.Group(); rules.position.set(gx - 2.6, 0, z1 - 0.35); rules.rotation.y = PI; root.add(rules);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), woodM, rules, s * 0.5, 0.8, 0);
  mk(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshStandardMaterial({ map: signTex(['PARK RULES', 'PLAY NICE', 'SHARE TOYS', 'CLOSE BOTH GATES'], { w: 512, h: 512, bg: '#f4ecd8', fg: '#2f4a3a', border: '#2f6a4a', font: 'bold 90px Helvetica, Arial, sans-serif', paw: false }), roughness: 0.8 }), rules, 0, 1.25, 0.05);
  const plate = mk(new THREE.PlaneGeometry(0.7, 0.24), new THREE.MeshStandardMaterial({ map: signTex(['PLEASE CLOSE BOTH GATES'], { w: 768, h: 256, bg: '#fff8e8', fg: '#b5462e', border: '#b5462e', font: 'bold 80px Helvetica, Arial, sans-serif', paw: false }), roughness: 0.8, side: THREE.DoubleSide }), fence.vest, gx + gw / 2 + 0.25, 0.9, zo + 0.02);

  // ---------------------------------------------------------------- trees (inside: the big shade tree + two more; outside: a ring)
  const leafMs = [0x4f8a3a, 0x5f9a42, 0x6aa84a, 0x467d34].map((c) => mat(c, 0.9));
  const barkM = mat(0x6b4a32, 0.9);
  const trees = [];
  const tree = (x, z, s = 1, p = root) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); p.add(g);
    const tr = mk(new THREE.CylinderGeometry(0.22, 0.34, 3.4, 10), barkM, g, 0, 1.7, 0);
    for (const [a, l] of [[0.6, 1.5], [2.6, 1.3], [4.4, 1.4]]) { const b = mk(new THREE.CylinderGeometry(0.08, 0.13, l, 6), barkM, g, Math.cos(a) * 0.35, 3.0, Math.sin(a) * 0.35); b.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7); }
    const crown = new THREE.Group(); crown.position.y = 4.3; g.add(crown);
    for (let i = 0; i < 11; i++) { const a = R() * PI * 2, r = R() * 1.6, y = (R() - 0.3) * 1.4; mk(new THREE.SphereGeometry(1.0 + R() * 0.7, 12, 10), leafMs[i % 4], crown, Math.cos(a) * r, y, Math.sin(a) * r); }
    trees.push({ g, crown, ph: R() * 6 });
    return g;
  };
  tree(DIMS.tree[0], DIMS.tree[1], 1.35);
  tree(11.5, -12.2, 1.0); tree(-13.2, 7.2, 0.95);
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * PI * 2 + R() * 0.08, rx = 24 + R() * 12, rz = 22 + R() * 12, x = Math.cos(a) * rx, z = Math.sin(a) * rz - 2;
    if (z > 15 && z < 27 && x > -24 && x < 12) continue;   // keep the parking lot open
    tree(x, z, 0.85 + R() * 0.5);
  }
  // hills + rooftops on the horizon
  const hillM = new THREE.MeshStandardMaterial({ color: 0x8fb07a, roughness: 1 });
  for (const [x, z, r, h] of [[-90, -150, 70, 22], [30, -170, 90, 30], [140, -120, 70, 20], [-160, -60, 60, 18], [170, 20, 60, 16], [-140, 90, 70, 18]]) { const m = mk(new THREE.SphereGeometry(r, 24, 12), hillM, root, x, -r + h, z); m.castShadow = false; }
  const WALLC = [0xe8d6b9, 0xb9cfd6, 0xefe7d2, 0xd6b9b0, 0xc9d6b4, 0xf2dcc0], ROOFC = [0x7a4a3a, 0x4a5560, 0x6a5040, 0x3f5a4a, 0x8a5a44];
  for (let i = 0; i < 26; i++) {
    const side = i % 3, u = R() * 2 - 1;
    const [x, z, ry] = side === 0 ? [u * 55, -48 - R() * 8, 0] : side === 1 ? [-50 - R() * 6, u * 30, PI / 2] : [50 + R() * 6, u * 30, -PI / 2];
    const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; root.add(h);
    box(7, 3, 6, mat(WALLC[i % 6], 0.9), 0, 1.5, 0, h);
    const roof = mk(new THREE.ConeGeometry(5.4, 2.2, 4), mat(ROOFC[i % 5], 0.8), h, 0, 4.1, 0); roof.rotation.y = PI / 4; roof.scale.set(1, 1, 0.85);
  }
  // lamp posts along the path
  const lampM = mat(0x2f3a36, 0.5, { metalness: 0.4 }), glowM = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xfff0c8, emissiveIntensity: 0.25 });
  for (let x = -26; x <= 26; x += 13) { mk(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8), lampM, root, x + 1.5, 1.8, 16.2); mk(new THREE.SphereGeometry(0.2, 12, 10), glowM, root, x + 1.5, 3.7, 16.2); }

  // ---------------------------------------------------------------- agility gear
  const RED = mat(0xe2574c, 0.5), YEL = mat(0xf2b632, 0.5), BLU = mat(0x3d7bd9, 0.5), WHT = mat(0xf6f3ec, 0.6), GRN = mat(0x58b368, 0.5);
  // A-frame: two striped ramps meeting at 1.3 m (along z)
  const af = new THREE.Group(); af.position.set(DIMS.aframe[0], 0, DIMS.aframe[1]); root.add(af);
  for (const s of [-1, 1]) {
    const ramp = new THREE.Group(); ramp.position.set(0, 0, s * 2.3); ramp.rotation.x = s * 0.6; af.add(ramp);   // pivot at the foot
    for (let i = 0; i < 6; i++) mk(new THREE.BoxGeometry(1.0, 0.05, 0.47), i < 2 ? YEL : BLU, ramp, 0, 0.03, -s * (0.24 + i * 0.47));
    for (let i = 0; i < 9; i++) mk(new THREE.BoxGeometry(0.98, 0.025, 0.03), WHT, ramp, 0, 0.065, -s * (0.2 + i * 0.3));
  }
  // weave poles along x
  const wv = new THREE.Group(); wv.position.set(DIMS.weave[0], 0, DIMS.weave[1]); root.add(wv);
  mk(new THREE.BoxGeometry(4.8, 0.04, 0.12), WHT, wv, 0, 0.02, 0);
  for (let i = 0; i < 8; i++) { mk(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), WHT, wv, -2.1 + i * 0.6, 0.5, 0); mk(new THREE.CylinderGeometry(0.021, 0.021, 0.2, 8), i % 2 ? RED : BLU, wv, -2.1 + i * 0.6, 0.92, 0); }
  // tunnel (open tube along x with ribs)
  const tun = new THREE.Group(); tun.position.set(DIMS.tunnel[0], 0.36, DIMS.tunnel[1]); root.add(tun);
  const tube = mk(new THREE.CylinderGeometry(0.38, 0.38, 3.2, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x3d7bd9, roughness: 0.6, side: THREE.DoubleSide }), tun); tube.rotation.z = PI / 2;
  for (let i = 0; i <= 8; i++) { const r = mk(new THREE.TorusGeometry(0.385, 0.018, 6, 24), mat(0x2a5ab0, 0.5), tun, -1.6 + i * 0.4, 0, 0); r.rotation.y = PI / 2; }
  // jump bar (two striped stands + a bar)
  const jp = new THREE.Group(); jp.position.set(DIMS.jump[0], 0, DIMS.jump[1]); jp.rotation.y = PI / 2; root.add(jp);
  for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.06, 1.0, 0.06), WHT, jp, s * 0.65, 0.5, 0); mk(new THREE.BoxGeometry(0.3, 0.04, 0.3), WHT, jp, s * 0.65, 0.02, 0); }
  const bar = new THREE.Group(); bar.position.set(0, 0.5, 0); jp.add(bar);
  for (let i = 0; i < 6; i++) { const b = mk(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 8), i % 2 ? RED : WHT, bar, -0.55 + i * 0.22, 0, 0); b.rotation.z = PI / 2; }
  // tire jump
  const tj = new THREE.Group(); tj.position.set(DIMS.tire[0], 0, DIMS.tire[1]); tj.rotation.y = 0.5; root.add(tj);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.07, 1.6, 0.07), YEL, tj, s * 0.7, 0.8, 0);
  mk(new THREE.BoxGeometry(1.47, 0.07, 0.07), YEL, tj, 0, 1.6, 0); mk(new THREE.BoxGeometry(1.47, 0.07, 0.07), YEL, tj, 0, 0.04, 0);
  mk(new THREE.TorusGeometry(0.34, 0.08, 10, 24), mat(0x2a2a2c, 0.8), tj, 0, 0.85, 0);
  // pause table (the poodles' stage): red top with a paw
  const tbl = new THREE.Group(); tbl.position.set(DIMS.table[0], 0, DIMS.table[1]); root.add(tbl);
  const topTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d24f45'; g.fillRect(0, 0, w, h); g.fillStyle = '#f6e9d2'; g.beginPath(); g.ellipse(w / 2, h / 2 + 22, 44, 36, 0, 0, 7); g.fill(); for (const [dx, dy] of [[-44, -28], [-16, -58], [16, -58], [44, -28]]) { g.beginPath(); g.ellipse(w / 2 + dx, h / 2 + dy, 15, 19, 0, 0, 7); g.fill(); } });
  mk(new RoundedBoxGeometry(1.3, 0.07, 1.0, 2, 0.02), new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.6 }), tbl, 0, DIMS.tableY - 0.035, 0);
  for (const [x, z] of [[-0.58, -0.43], [0.58, -0.43], [-0.58, 0.43], [0.58, 0.43]]) mk(new THREE.CylinderGeometry(0.03, 0.03, DIMS.tableY - 0.07, 8), WHT, tbl, x, (DIMS.tableY - 0.07) / 2, z);

  // ---------------------------------------------------------------- kiddie pool + fountain + water bowl
  const pool = new THREE.Group(); pool.position.set(DIMS.pool[0], 0, DIMS.pool[1]); root.add(pool);
  const pr = DIMS.poolR;
  const rimTex = canvasTex(256, 32, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#4aa3e0' : '#f6f3ec'; g.fillRect((i * w) / 16, 0, w / 16, h); } }, [4, 1]);
  mk(new THREE.CylinderGeometry(pr, pr, 0.24, 36, 1, true), new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.45, side: THREE.DoubleSide }), pool, 0, 0.12, 0);
  mk(new THREE.TorusGeometry(pr, 0.045, 10, 36), mat(0x4aa3e0, 0.4), pool, 0, 0.24, 0).rotation.x = PI / 2;
  flat(new THREE.CircleGeometry(pr, 36), mat(0x9fd3ef, 0.5), 0, 0.012, 0, pool);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x6cc4ec, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.78 });
  const water = flat(new THREE.CircleGeometry(pr - 0.01, 36), waterM, 0, DIMS.waterY, 0, pool); water.receiveShadow = true;
  const rippleM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
  const ripples = [0, 1, 2].map((i) => { const r = flat(new THREE.RingGeometry(0.9, 1.0, 36), rippleM.clone(), 0, DIMS.waterY + 0.004, 0, pool); r.renderOrder = 2; return r; });
  const duck = new THREE.Group(); pool.add(duck);   // a rubber duck bobbing
  mk(new THREE.SphereGeometry(0.06, 12, 10), YEL, duck, 0, 0.03, 0).scale.set(1, 0.75, 1.3); mk(new THREE.SphereGeometry(0.04, 12, 10), YEL, duck, 0, 0.09, 0.05); mk(new THREE.ConeGeometry(0.018, 0.04, 8), mat(0xe8822a, 0.5), duck, 0, 0.085, 0.1).rotation.x = PI / 2;
  // dog fountain: a green pedestal with a bowl at its foot + a big steel water bowl
  const ft = new THREE.Group(); ft.position.set(DIMS.fountain[0], 0, DIMS.fountain[1]); ft.rotation.y = PI / 2; root.add(ft);
  mk(new THREE.CylinderGeometry(0.16, 0.2, 0.95, 12), mat(0x3d6a4a, 0.5), ft, 0, 0.475, 0); mk(new THREE.CylinderGeometry(0.22, 0.2, 0.08, 16), mat(0x3d6a4a, 0.5), ft, 0, 0.96, 0);
  mk(new THREE.CylinderGeometry(0.26, 0.2, 0.1, 18), mat(0xb8bcc0, 0.3, { metalness: 0.6 }), ft, 0, 0.05, 0.3);
  flat(new THREE.CircleGeometry(0.23, 18), waterM, 0, 0.085, 0.3, ft);
  const bowl = new THREE.Group(); bowl.position.set(DIMS.fountain[0] + 0.9, 0, DIMS.fountain[1] - 0.7); root.add(bowl);
  mk(new THREE.CylinderGeometry(0.22, 0.17, 0.09, 20, 1, true), mat(0xc4c8cc, 0.25, { metalness: 0.7, side: THREE.DoubleSide }), bowl, 0, 0.045, 0);
  flat(new THREE.CircleGeometry(0.2, 20), waterM, 0, 0.07, 0, bowl);

  // ---------------------------------------------------------------- benches along the fence
  const benchWood = mat(0xa8744a, 0.7), benchMetal = mat(0x3d4a45, 0.5);
  const benches = DIMS.benches.map((b) => {
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rotY; root.add(g);
    for (let i = 0; i < 3; i++) mk(new RoundedBoxGeometry(1.9, 0.05, 0.14, 2, 0.015), benchWood, g, 0, DIMS.seatY - 0.025, -0.16 + i * 0.16);
    for (let i = 0; i < 2; i++) { const s = mk(new RoundedBoxGeometry(1.9, 0.12, 0.05, 2, 0.015), benchWood, g, 0, 0.72 + i * 0.16, -0.3); s.rotation.x = -0.15; }
    for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.06, DIMS.seatY, 0.45), benchMetal, g, s * 0.8, DIMS.seatY / 2, 0); mk(new THREE.BoxGeometry(0.06, 0.55, 0.06), benchMetal, g, s * 0.8, 0.72, -0.3); }
    return g;
  });

  // ---------------------------------------------------------------- small dressing: waste-bag station, trash can, toys
  const st = new THREE.Group(); st.position.set(-6.6, 0, 10.4); root.add(st);
  mk(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8), mat(0x3d6a4a, 0.5), st, 0, 0.65, 0); box(0.26, 0.34, 0.14, mat(0x58b368, 0.5), 0, 1.15, 0.07, st);
  mk(new THREE.PlaneGeometry(0.2, 0.14), new THREE.MeshStandardMaterial({ map: signTex(['BAGS'], { w: 256, h: 160, bg: '#58b368', fg: '#ffffff', border: '#ffffff', font: 'bold 90px Helvetica, Arial, sans-serif', paw: false }) }), st, 0, 1.18, 0.145).rotation.y = 0;
  const can = mk(new THREE.CylinderGeometry(0.26, 0.24, 0.85, 16), mat(0x3d6a4a, 0.55), root, -5.8, 0.425, 10.45);
  mk(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16), mat(0x2f4a3a, 0.5), root, -5.8, 0.87, 10.45);
  const toys = new THREE.Group(); root.add(toys);
  const ballM = mat(0xd9e84a, 0.8);
  for (let i = 0; i < 22; i++) { const x = (R() * 2 - 1) * 14, z = -13 + R() * 22; if (Math.hypot(x - DIMS.tree[0], z - DIMS.tree[1]) < 2) continue; mk(new THREE.SphereGeometry(0.033, 12, 10), ballM, toys, x, 0.033, z); }
  for (let i = 0; i < 4; i++) {   // rope toys: a knotted twist
    const g = new THREE.Group(); g.position.set((R() * 2 - 1) * 12, 0.02, -12 + R() * 20); g.rotation.y = R() * 6; toys.add(g);
    const cols = [0xe2574c, 0x3d7bd9, 0xf2b632]; const c = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), mat(cols[i % 3], 0.9), g, 0, 0, 0); c.rotation.z = PI / 2;
    for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0xf4ecd8, 0.9), g, s * 0.17, 0.01, 0);
  }
  for (const [x, z, c] of [[-3.5, 2.5, 0xe2574c], [8.5, -9.5, 0x3d7bd9]]) { const f = mk(new THREE.CylinderGeometry(0.12, 0.11, 0.02, 20), mat(c, 0.5), toys, x, 0.012, z); }

  // ---------------------------------------------------------------- clouds + lights
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 14; i++) { const cg = new THREE.Group(); const a = R() * PI * 2; cg.position.set(Math.cos(a) * 200, 60 + R() * 50, Math.sin(a) * 200 - 30); root.add(cg); for (let k = 0; k < 5; k++) { const p = mk(new THREE.SphereGeometry(8 + R() * 7, 12, 8), cloudM, cg, (k - 2) * 9, R() * 4, R() * 6); p.scale.y = 0.55; p.castShadow = false; } }
  const hemi = new THREE.HemisphereLight(0xd2e6ff, 0x7a8f52, opts.ambient ?? 1.3); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, opts.sun ?? 2.8); root.add(sun, sun.target);
  const SUN_DIR = new THREE.Vector3(-0.5, 0.82, 0.55).normalize();
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  function aimSun(cx = 0, cz = -2, half = 12) {
    sun.target.position.set(cx, 0, cz); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 60);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 5, far: 140 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun();
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; } if (o.isMesh && !o.material.transparent) o.receiveShadow = true; });

  function update(t) {
    ripples.forEach((r, i) => { const u = ((t * 0.45 + i / 3) % 1); r.scale.setScalar(0.08 + 0.75 * u * pr); r.material.opacity = 0.32 * (1 - u); });
    duck.position.set(0.35 * Math.cos(t * 0.3), DIMS.waterY + 0.004 * Math.sin(t * 3), 0.3 * Math.sin(t * 0.3)); duck.rotation.set(0.08 * Math.sin(t * 2.2), -t * 0.3, 0.06 * Math.sin(t * 2.7));
    trees.forEach((T) => { T.crown.rotation.z = 0.012 * Math.sin(t * 0.9 + T.ph); T.crown.rotation.x = 0.01 * Math.sin(t * 0.7 + T.ph * 2); });
  }
  return { root, D: DIMS, fog, gates, fence, arch, benches, pool, water, duck, table: tbl, aframe: af, jumpBar: bar, toys, trees, setSign, aimSun, update, lights: { hemi, sun } };
}
