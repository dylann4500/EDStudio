// SET (engine/sets/football.js — renamed from stadium.js on merge; 019's concert bowl owns stadium.js): a sunny football (soccer) stadium on cup-final day — striped pitch with full markings, two goals with nets
// (`setBulge` pushes a ball-shaped dent into the back net), LED ad boards, four tiered stands packed with ~22,000 instanced
// fans (home = red/white behind the +x goal, away = blue behind the −x goal, mixed sides), a roof ring with floodlights, a big
// scoreboard (`setScore(text)`), photographers' corner, a low city around it and a sky dome. Built for video 017 (gravity off).
//
// Coordinates (meters, y up). Pitch centered at the origin, length along x (±52.5), width along z (±34). The "action" goal is
// at x = +52.5 (DIMS.goalX), its stand ("east", home fans) starts 6 m behind the goal line and climbs toward +x.
// Stand rows: row r stands at height DIMS.rowY(r) and depth DIMS.rowD(r) from the stand front.
// Animate fans: `stands.east.fans[i]` = {x, y, z, row, col} in WORLD coords (east stand), `stands.east.setFan(i, dy, tilt, rotY)`
// then `stands.east.commit()`. Hide instanced fans where rigs stand in: `stands.east.hide((f) => bool)`.
// Call `aimSun(cx, cz, half)` per shot so shadows are sharp where the action is. Set camera.far ≥ 900.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
const ROWS = 34, ROW_D = 0.8, ROW_H = 0.42, ROW0 = 0.8, SEAT = 0.62;
export const DIMS = {
  pitch: { L: 105, W: 68 }, goalX: 52.5, goal: { w: 7.32, h: 2.44, d: 2.0 }, gap: 6,
  rows: ROWS, rowY: (r) => ROW0 + r * ROW_H, rowD: (r) => r * ROW_D + 0.4,
};

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];

function pitchTexture() {
  const ppm = 18, w = Math.round(115 * ppm), h = Math.round(78 * ppm);   // 5 m of grass around the lines
  return canvasTex(w, h, (g) => {
    for (let i = 0; i < 22; i++) { g.fillStyle = i % 2 ? '#4f9a3f' : '#5aa848'; g.fillRect(i * w / 22, 0, w / 22 + 1, h); }
    const X = (x) => (x + 57.5) * ppm, Z = (z) => (z + 39) * ppm;
    g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 0.13 * ppm;
    g.strokeRect(X(-52.5), Z(-34), 105 * ppm, 68 * ppm);
    g.beginPath(); g.moveTo(X(0), Z(-34)); g.lineTo(X(0), Z(34)); g.stroke();
    g.beginPath(); g.arc(X(0), Z(0), 9.15 * ppm, 0, PI * 2); g.stroke();
    for (const s of [-1, 1]) {
      const gx = s * 52.5;
      g.strokeRect(Math.min(X(gx), X(gx - s * 16.5)), Z(-20.16), 16.5 * ppm, 40.32 * ppm);
      g.strokeRect(Math.min(X(gx), X(gx - s * 5.5)), Z(-9.16), 5.5 * ppm, 18.32 * ppm);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(gx - s * 11), Z(0), 0.2 * ppm, 0, PI * 2); g.fill();
      g.beginPath(); g.arc(X(gx - s * 11), Z(0), 9.15 * ppm, s > 0 ? PI - 0.93 : -0.93, s > 0 ? PI + 0.93 : 0.93); g.stroke();
    }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(X(0), Z(0), 0.2 * ppm, 0, PI * 2); g.fill();
  });
}
function adTexture(R) {
  const ads = [['NEWTON AIRWAYS', '#1d3f73', '#ffffff'], ['ORBIT COLA', '#c8302c', '#ffffff'], ['APPLE FALLS CIDER', '#2f7a3a', '#f2e6b8'],
    ['APEX TYRES', '#111111', '#f2c14e'], ['FREEFALL BANK', '#f2c14e', '#1d2a3a'], ['LIFT-OFF MOBILE', '#6a2f8a', '#ffffff']];
  return canvasTex(2048, 64, (g, w, h) => { let x = 0, i = 0; while (x < w) { const [t, bg, fg] = ads[(i + Math.floor(R() * 2)) % ads.length]; const bw = 340; g.fillStyle = bg; g.fillRect(x, 0, bw, h); g.fillStyle = fg; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x + bw / 2, h / 2 + 2); x += bw; i++; } }, [1, 1]);
}

/** Instanced fan figure (stands facing the pitch along −z local): pants+legs, shirt+arms (up or down), head. */
function fanGeometries() {
  const legs = mergeGeometries([new THREE.BoxGeometry(0.3, 0.82, 0.2).translate(0, 0.41, 0)]);
  const torso = new THREE.CapsuleGeometry(0.17, 0.32, 4, 10).scale(1.05, 1, 0.75).translate(0, 1.1, 0);
  const armUp = (s) => new THREE.CapsuleGeometry(0.055, 0.5, 3, 6).rotateZ(s * 0.45).translate(s * 0.3, 1.62, 0);
  const armDn = (s) => new THREE.CapsuleGeometry(0.055, 0.5, 3, 6).rotateZ(-s * 0.12).translate(s * 0.25, 1.05, 0);
  const shirtUp = mergeGeometries([torso.clone(), armUp(-1), armUp(1)]);
  const shirtDn = mergeGeometries([torso.clone(), armDn(-1), armDn(1)]);
  const head = new THREE.SphereGeometry(0.135, 10, 8).translate(0, 1.55, 0);
  return { legs, shirtUp, shirtDn, head };
}

export function buildStadium(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 17);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xdde8f0, 160, 760);

  // sky + soft clouds + a low city around the bowl
  const sky = makeSkyDome(0x3f80d0, 0xe6eef2, 800); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 14; i++) { const a = R() * PI * 2, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 520, 110 + R() * 90, Math.sin(a) * 520); root.add(cg); for (let k = 0; k < 5; k++) { const p = mk(new THREE.SphereGeometry(16 + R() * 14, 12, 8), cloudM, cg, (k - 2) * 18, R() * 6, R() * 10); p.scale.y = 0.5; p.castShadow = false; } }
  const ground = mk(new THREE.PlaneGeometry(1600, 1600), mat(0x7f9a6a, 1), root, 0, -0.02, 0); ground.rotation.x = -PI / 2; ground.castShadow = false;
  const bldC = [0xd8cbb8, 0xb9c4c9, 0xc9a98f, 0xe6dccb, 0x9fb0bf, 0xd0b8a8];
  for (let i = 0; i < 90; i++) { const a = R() * PI * 2, d = 150 + R() * 260, hgt = 8 + R() * (d > 300 ? 60 : 22); const b = box(14 + R() * 18, hgt, 14 + R() * 18, mat(bldC[i % 6], 0.9), Math.cos(a) * d, hgt / 2, Math.sin(a) * d); b.rotation.y = R() * PI; b.castShadow = false; }

  // pitch + markings + surround
  const pitch = mk(new THREE.PlaneGeometry(115, 78), new THREE.MeshStandardMaterial({ map: pitchTexture(), roughness: 0.95 }), root, 0, 0.01, 0); pitch.rotation.x = -PI / 2; pitch.castShadow = false;
  const surround = mk(new THREE.PlaneGeometry(140, 100), mat(0x3f7a3a, 1), root, 0, 0.0, 0); surround.rotation.x = -PI / 2; surround.castShadow = false;

  // goals: posts + crossbar, nets (back net is deformable: setBulge)
  const postM = mat(0xffffff, 0.35);
  const netTex = canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); }, [30, 10]);
  const netM = new THREE.MeshStandardMaterial({ map: netTex, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, roughness: 0.8 });
  const nets = {};
  for (const s of [-1, 1]) {
    const G = DIMS.goal, gx = s * DIMS.goalX, goal = new THREE.Group(); goal.position.set(gx, 0, 0); root.add(goal);
    for (const z of [-G.w / 2, G.w / 2]) mk(new THREE.CylinderGeometry(0.06, 0.06, G.h, 12), postM, goal, 0, G.h / 2, z);
    const bar = mk(new THREE.CylinderGeometry(0.06, 0.06, G.w + 0.12, 12), postM, goal, 0, G.h, 0); bar.rotation.x = PI / 2;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(G.w, G.h, 24, 10), netM); back.position.set(s * G.d, G.h / 2, 0); back.rotation.y = PI / 2; goal.add(back);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(G.d, G.w), netM); roof.rotation.x = -PI / 2; roof.position.set(s * G.d / 2, G.h, 0); goal.add(roof);
    for (const z of [-G.w / 2, G.w / 2]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(G.d, G.h), netM); side.position.set(s * G.d / 2, G.h / 2, z); goal.add(side); }
    for (const z of [-G.w / 2, G.w / 2]) { const st = mk(new THREE.CylinderGeometry(0.03, 0.03, G.h, 6), postM, goal, s * G.d, G.h / 2, z); }
    const base0 = back.geometry.attributes.position.array.slice();
    nets[s > 0 ? 'east' : 'west'] = { back, base0, s };
  }
  /** Push a dent into the east goal's back net: k = depth (m), at (y, z) world. */
  function setBulge(k, y = 1.2, z = 0, which = 'east') {
    const n = nets[which], p = n.back.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const lx = n.base0[i * 3], ly = n.base0[i * 3 + 1];   // plane local: x → −world z (rotated), y → height around G.h/2
      const wz = -lx * (n.s > 0 ? 1 : -1), wy = ly + DIMS.goal.h / 2, d2 = (wz - z) ** 2 + (wy - y) ** 2;
      p.setZ(i, k * Math.exp(-d2 / 0.8));
    }
    p.needsUpdate = true;
  }
  // corner flags
  for (const [x, z] of [[-52.5, -34], [52.5, -34], [-52.5, 34], [52.5, 34]]) { mk(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), postM, root, x, 0.75, z); const f = mk(new THREE.PlaneGeometry(0.4, 0.3), mat(0xf2c14e, 0.7, { side: THREE.DoubleSide }), root, x + 0.2, 1.35, z); f.castShadow = false; }

  // LED ad boards around the pitch
  const adT = adTexture(R), adM = new THREE.MeshBasicMaterial({ map: adT, toneMapped: false, color: new THREE.Color(0.9, 0.9, 0.9) });
  const board = (len, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(len, 0.9, 0.25, mat(0x222428, 0.6), 0, 0.45, 0.13, g); const t = adT.clone(); t.needsUpdate = true; t.repeat.set(len / 60, 1); const f = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.8), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: new THREE.Color(0.95, 0.95, 0.95) })); f.position.set(0, 0.46, -0.01); f.rotation.y = PI; g.add(f); };
  board(110, 0, -38, 0); board(110, 0, 38, PI); board(66, 56.5, 0, -PI / 2); board(66, -56.5, 0, PI / 2);
  void adM;

  // stands with instanced fans
  const G = fanGeometries();
  const concrete = mat(0xb9b6ae, 0.95), seatC = { east: [0xc8302c, 0xf2f2f2], west: [0x2f5fb3, 0xf2f2f2], north: [0xc8302c, 0x2f5fb3], south: [0x2f5fb3, 0xc8302c] };
  const stands = {};
  function addStand(name, x, z, ry, width, shirts, cheer) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    for (let r = 0; r < ROWS; r++) {
      const y = DIMS.rowY(r), d = r * ROW_D;
      box(width, y, ROW_D, concrete, 0, y / 2, d + ROW_D / 2, g).castShadow = r % 4 === 0;
      const seat = box(width, 0.08, 0.3, mat(seatC[name][Math.floor(r / 6) % 2], 0.6), 0, y + 0.04, d + 0.6, g); seat.castShadow = false;
    }
    const backZ = ROWS * ROW_D, topY = DIMS.rowY(ROWS);
    box(width + 2, topY + 9, 1.2, mat(0x8a9098, 0.9), 0, (topY + 9) / 2, backZ + 0.6, g); box(width + 2, 1.6, 0.2, mat(seatC[name][0], 0.7), 0, topY + 1.4, backZ - 0.05, g);
    const roof = box(width + 2, 0.6, 24, mat(0xe9e6e0, 0.6, { emissive: 0x7a7c80 }), 0, topY + 8.6, backZ - 10, g); roof.castShadow = false;
    box(width + 2, 1.1, 0.5, mat(0x2a2d31, 0.5), 0, topY + 8.0, backZ - 22, g);
    for (let k = -width / 2 + 4; k < width / 2; k += 9) { const fl = mk(new THREE.BoxGeometry(5, 0.9, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.55, 1.4), toneMapped: false }), g, k, topY + 7.5, backZ - 22.2); fl.castShadow = false; }
    box(width, 1.1, 0.3, mat(0x3a3d42, 0.7), 0, ROW0 - 0.2, -0.2, g);   // front wall
    // back wall dressing: a fans' banner + a row of glass hospitality boxes (the wall reads as a bare slab otherwise)
    const banText = { east: 'WE NEVER FALL', west: 'AWAY END', north: 'CUP FINAL', south: 'CUP FINAL' }[name];
    const bt = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = name === 'west' ? '#2f5fb3' : '#c8302c'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = 'bold 80px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(banText + '  ★', w / 2, h / 2 + 4); c.fillRect(0, 6, w, 5); c.fillRect(0, h - 11, w, 5); }, [4, 1]);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(48, width * 0.6), 3.6), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.8 })); ban.position.set(0, topY + 3.2, backZ - 0.02); ban.rotation.y = PI; g.add(ban);
    const glassT = canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#1d2a3a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(160,200,230,.35)'; c.fillRect(x + 3, 6, 26, h - 12); c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(x + 3, h - 18, 26, 8); } }, [width / 16, 1]);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(width, 2.2), new THREE.MeshStandardMaterial({ map: glassT, roughness: 0.3 })); gl.position.set(0, topY + 6.8, backZ - 0.02); gl.rotation.y = PI; g.add(gl);
    // fans
    const cols = Math.floor(width / SEAT), fans = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols; c++) { if (R() < 0.06) continue; fans.push({ lx: -width / 2 + (c + 0.5) * SEAT + (R() - 0.5) * 0.08, ly: DIMS.rowY(r), lz: r * ROW_D + 0.42, row: r, col: c, shirt: shirts[Math.floor(R() * shirts.length)], skin: SKINS[Math.floor(R() * SKINS.length)], up: cheer ? R() < 0.75 : R() < 0.12 }); }
    const nUp = fans.filter((f) => f.up).length, nDn = fans.length - nUp;
    const legM = new THREE.InstancedMesh(G.legs, mat(0x2f3a4a, 0.9), fans.length);
    const upM = new THREE.InstancedMesh(G.shirtUp, mat(0xffffff, 0.9), Math.max(1, nUp)), dnM = new THREE.InstancedMesh(G.shirtDn, mat(0xffffff, 0.9), Math.max(1, nDn));
    const headM = new THREE.InstancedMesh(G.head, mat(0xffffff, 0.7), fans.length);
    upM.count = nUp; dnM.count = nDn;
    [legM, upM, dnM, headM].forEach((m) => { m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; g.add(m); });
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), C = new THREE.Color();
    let iu = 0, id = 0;
    fans.forEach((f, i) => { f.i = i; if (f.up) f.si = iu++; else f.si = id++; (f.up ? upM : dnM).setColorAt(f.si, C.setHex(f.shirt)); headM.setColorAt(i, C.setHex(f.skin)); f.ry = PI + (R() - 0.5) * 0.4; });
    const v = new THREE.Vector3();
    fans.forEach((f) => { v.set(f.lx, f.ly, f.lz); g.localToWorld(v); f.x = v.x; f.y = v.y; f.z = v.z; });
    function setFan(i, dy = 0, tilt = 0, ry = null, scale = 1) {
      const f = fans[i]; P.set(f.lx, f.ly + dy, f.lz); Q.setFromEuler(E.set(tilt, ry ?? f.ry, 0)); S.setScalar(scale); M.compose(P, Q, S);
      legM.setMatrixAt(i, M); headM.setMatrixAt(i, M); (f.up ? upM : dnM).setMatrixAt(f.si, M);
    }
    function commit() { [legM, upM, dnM, headM].forEach((m) => (m.instanceMatrix.needsUpdate = true)); }
    fans.forEach((f, i) => setFan(i)); commit();
    [upM, dnM, headM].forEach((m) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    const hidden = new Set();
    function hide(pred) { fans.forEach((f, i) => { if (pred(f)) { hidden.add(i); setFan(i, 0, 0, null, 0.0001); } }); commit(); }
    stands[name] = { g, fans, setFan, commit, hide, hidden, cols };
  }
  const gap = DIMS.gap;
  addStand('east', DIMS.goalX + gap, 0, PI / 2, 80, [0xc8302c, 0xc8302c, 0xc8302c, 0xf2f2f2, 0x1d1d1f], true);
  addStand('west', -DIMS.goalX - gap, 0, -PI / 2, 80, [0x2f5fb3, 0x2f5fb3, 0xf2f2f2], false);
  addStand('north', 0, -34 - gap, PI, 125, [0xc8302c, 0xf2f2f2, 0x2f5fb3, 0xc8302c], false);
  addStand('south', 0, 34 + gap, 0, 125, [0x2f5fb3, 0xc8302c, 0xf2f2f2, 0xc8302c], false);
  // stand-local +z must point AWAY from the pitch: rotate each so its rows climb outward
  // (east: ry=+π/2 → local +z = world +x ✓; west: −π/2 → −x ✓; north: π → −z ✓; south: 0 → +z ✓)

  // scoreboard over the west stand (faces the pitch / the east end)
  const scoreM = new THREE.MeshBasicMaterial({ toneMapped: false });
  const scoreTex = (text, sub) => canvasTex(512, 200, (g, w, h) => { g.fillStyle = '#0d1117'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(sub, w / 2, 44); g.fillStyle = '#ffffff'; g.font = 'bold 84px Helvetica, Arial, sans-serif'; g.fillText(text, w / 2, 140); });
  const setScore = (text, sub = "CUP FINAL · 90+3'") => { if (scoreM.map) scoreM.map.dispose(); scoreM.map = scoreTex(text, sub); scoreM.needsUpdate = true; };
  setScore('1 – 1');
  const sb = new THREE.Group(); sb.position.set(-DIMS.goalX - gap - 4, DIMS.rowY(ROWS) + 12, 0); sb.rotation.y = PI / 2; root.add(sb);
  box(26, 11, 1, mat(0x1a1c20, 0.6), 0, 0, -0.6, sb); const screen = new THREE.Mesh(new THREE.PlaneGeometry(24.5, 9.6), scoreM); sb.add(screen);
  mk(new THREE.BoxGeometry(1, 12, 1), mat(0x3a3d42, 0.6), sb, -8, -10, -1); mk(new THREE.BoxGeometry(1, 12, 1), mat(0x3a3d42, 0.6), sb, 8, -10, -1);

  // dugouts + benches on the south touchline
  for (const x of [-12, 12]) { const d = new THREE.Group(); d.position.set(x, 0, 36.2); root.add(d); box(8, 0.2, 2, mat(0xd9d4ca, 0.8), 0, 0.1, 0, d); const r = box(8.2, 0.1, 2.3, new THREE.MeshStandardMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.45, roughness: 0.1 }), 0, 2.1, 0.1, d); r.castShadow = false; box(7.6, 0.45, 0.5, mat(x < 0 ? 0x2f5fb3 : 0xc8302c, 0.6), 0, 0.45, 0.4, d); }

  // lights
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x9a9a8a, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.7); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004;
  function aimSun(cx = 0, cz = 0, half = 30) {
    sun.target.position.set(cx, 0, cz); sun.position.set(cx - 40, 90, cz + 60);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 260 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun(50, 0, 30);
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, fog, sky, stands, nets, setBulge, setScore, aimSun, lights: { hemi, sun } };
}
