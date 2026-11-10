// Motion-capture stage (075, "Why GTA 6 took 13 years"): a game studio's performance-capture volume, built for the pixel look.
//   const M = buildMocap(studio);  scene root = M.root (origin = the middle of the capture volume, floor y = 0, the back wall at −z)
//   M.D = { vol: 9 (m, square volume), desk: {x, z, top}, screen: {x, y, z}, buck: {x, z, seatY}, mat: {x, z, top} }
//   M.actors = 4 makePerson rigs in black marker suits (white markers on every joint + a head-mounted camera boom);
//   M.monitors = [canvas textures] (video village), M.wall = the big retarget screen texture; draw on them per frame with
//   M.drawSolve(ctx, w, h, pose2d, opts) — a skeleton of dots + bones (2-D joints {head, neck, sh:[L,R], el:[L,R], ha:[L,R], hip, kn:[L,R], an:[L,R]}).
//   M.update(t) blinks the camera ring LEDs (deterministic).
// Everything generic: no studio name, no logos. Black curtains, a taped grid floor, a truss ring of ~30 cameras with red rings,
// crash mats, a pipe-frame "car buck", apple boxes, a suit rack, a calibration wand, a lit QUIET sign, a director's chair.
import * as THREE from 'three';
import { makePerson } from '../rig.js';
import { pixelTex, speckle } from '../pixeltex.js';

const PI = Math.PI;

export function buildMocap(studio) {
  const root = new THREE.Group();
  const toon = (c, e = 0) => new THREE.MeshToonMaterial({ color: c, emissive: e });
  const lam = (o) => new THREE.MeshLambertMaterial(o);
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const bx = (parent, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const cyl = (parent, r0, r1, h, m, x, y, z, seg = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const crisp = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.canvas = c; return t; };
  const VOL = 9, W = 22, DEP = 18, HT = 7;

  // ---- room: floor, curtain walls, ceiling
  const floorT = pixelTex(16, 16, (g, w, h) => speckle(g, w, h, '#4c5058', ['#484c54', '#52565e', '#454950'], 40, 7), { k: 1, repeat: [22, 18] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, DEP), lam({ map: floorT })); floor.rotation.x = -PI / 2; floor.position.set(0, 0, 0.5); floor.receiveShadow = true; root.add(floor);
  const volT = pixelTex(16, 16, (g, w, h) => { speckle(g, w, h, '#7a7e86', ['#747880', '#80848c', '#767a82'], 30, 3); }, { k: 1, repeat: [9, 9] });
  const vol = new THREE.Mesh(new THREE.PlaneGeometry(VOL, VOL), lam({ map: volT })); vol.rotation.x = -PI / 2; vol.position.y = 0.003; vol.receiveShadow = true; root.add(vol);
  const tape = lam({ color: 0xe8e8e2 }), ytape = lam({ color: 0xf2c230 });
  for (let i = -3; i <= 3; i++) { bx(root, 0.035, 0.004, VOL, tape, i * 1.5, 0.006, 0).castShadow = false; bx(root, VOL, 0.004, 0.035, tape, 0, 0.006, i * 1.5).castShadow = false; }
  for (const s of [-1, 1]) { bx(root, 0.08, 0.005, VOL + 0.08, ytape, s * VOL / 2, 0.007, 0).castShadow = false; bx(root, VOL + 0.08, 0.005, 0.08, ytape, 0, 0.007, s * VOL / 2).castShadow = false; }
  { const x1 = bx(root, 0.7, 0.006, 0.07, lam({ color: 0xff4f6a }), 0, 0.009, 0); x1.rotation.y = PI / 4; x1.castShadow = false; const x2 = x1.clone(); x2.rotation.y = -PI / 4; root.add(x2); }
  const curtT = pixelTex(32, 16, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 0.5 + 0.5 * Math.sin(x * 0.8); g.fillStyle = `rgb(${54 + v * 18},${58 + v * 18},${68 + v * 20})`; g.fillRect(x, 0, 1, h); } }, { k: 1, repeat: [6, 1] });
  const curt = lam({ map: curtT });
  const wall = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, HT), curt); m.position.set(x, HT / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m; };
  const back = wall(W, 0, -DEP / 2 + 0.5, 0), front = wall(W, 0, DEP / 2 + 0.5, PI), left = wall(DEP, -W / 2, 0.5, PI / 2), right = wall(DEP, W / 2, 0.5, -PI / 2);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, DEP), lam({ color: 0x24262c })); ceil.rotation.x = PI / 2; ceil.position.set(0, HT, 0.5); root.add(ceil);
  // ceiling light panels (soft, even light = a capture stage)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bx(root, 1.6, 0.05, 0.6, glow(0xeef2ff), -5 + i * 5, HT - 0.05, -4 + j * 4).castShadow = false;

  // ---- truss ring + cameras (red IR rings) aimed at the volume
  const trussT = pixelTex(8, 8, (g, w, h) => { g.fillStyle = '#26282d'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a8f98'; g.fillRect(0, 0, w, 1); g.fillRect(0, h - 1, w, 1); for (let i = 0; i < w; i++) g.fillRect(i, i, 1, 1); }, { k: 1, repeat: [40, 1] });
  const trussM = lam({ map: trussT }), TY = 5.3, TR = 5.4;
  for (const s of [-1, 1]) { bx(root, TR * 2 + 0.3, 0.3, 0.3, trussM, 0, TY, s * TR); bx(root, 0.3, 0.3, TR * 2 + 0.3, trussM, s * TR, TY, 0); }
  for (const [x, z] of [[-TR, -TR], [TR, -TR], [-TR, TR], [TR, TR]]) bx(root, 0.08, HT - TY, 0.08, toon(0x2a2c31), x, TY + (HT - TY) / 2, z);
  const camBody = toon(0x1d1f24), ringM = glow(0xff2a36), lens = glow(0x101014);
  const rings = [], aim = new THREE.Vector3(0, 0.9, 0);
  const addCam = (x, y, z) => {
    const g = new THREE.Group(); g.position.set(x, y, z); root.add(g); g.lookAt(aim);
    bx(g, 0.13, 0.11, 0.2, camBody, 0, 0, 0); const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 14), ringM.clone()); r.position.z = 0.105; g.add(r);
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), lens); l.position.z = 0.106; g.add(l); rings.push(r); return g;
  };
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { const u = -TR + 0.7 + i * (2 * TR - 1.4) / 7; addCam(u, TY - 0.24, s * (TR - 0.05)); addCam(s * (TR - 0.05), TY - 0.24, u); }
  // tripod cams at the corners
  for (const [x, z] of [[-5.6, -5.6], [5.6, -5.6], [-5.6, 5.0]]) { for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4, leg = cyl(root, 0.012, 0.012, 1.7, toon(0x2a2c31), x + Math.cos(a) * 0.25, 0.8, z + Math.sin(a) * 0.25, 5); leg.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18); } addCam(x, 1.7, z); }

  // ---- crash mats, apple boxes, ladder, suit rack, wand, QUIET sign, cable reel
  const matM = toon(0x3d5a8a), matSide = toon(0x2f4670);
  const D = { vol: VOL };
  D.mat = { x: -2.6, z: 1.6, top: 0.3 };
  bx(root, 2.2, 0.3, 1.5, [matSide, matSide, matM, matSide, matSide, matSide], D.mat.x, 0.15, D.mat.z); bx(root, 1.4, 0.2, 1.3, [matSide, matSide, matM, matSide, matSide, matSide], -4.6, 0.1, -3.6);
  const wood = toon(0xb98a52), woodD = toon(0x8c6438);
  for (const [x, z, n] of [[3.9, 2.8, 2], [4.4, 3.4, 1], [-4.3, -1.0, 3]]) for (let k = 0; k < n; k++) bx(root, 0.5, 0.2, 0.3, k % 2 ? woodD : wood, x + (k % 2) * 0.05, 0.1 + k * 0.2, z);
  { const lad = new THREE.Group(); lad.position.set(-8.6, 0, -6.4); root.add(lad); const al = toon(0xb8bcc4);
    for (const s of [-1, 1]) for (const f of [-1, 1]) { const r = bx(lad, 0.05, 2.6, 0.05, al, s * 0.3, 1.25, f * 0.35); r.rotation.x = -f * 0.14; } for (let k = 0; k < 7; k++) bx(lad, 0.6, 0.03, 0.06, al, 0, 0.3 + k * 0.32, 0.33 - k * 0.045); }
  { const rack = new THREE.Group(); rack.position.set(8.2, 0, -4.2); rack.rotation.y = -PI / 2; root.add(rack); const al = toon(0x8a8f98);
    for (const s of [-1, 1]) bx(rack, 0.04, 1.8, 0.04, al, s * 0.9, 0.9, 0); bx(rack, 1.9, 0.04, 0.04, al, 0, 1.78, 0);
    for (let k = 0; k < 6; k++) { const suit = bx(rack, 0.08, 1.1, 0.42, toon(0x18181c), -0.75 + k * 0.3, 1.2, 0); for (let j = 0; j < 4; j++) bx(suit, 0.09, 0.03, 0.03, glow(0xf4f4f4), 0, -0.4 + j * 0.25, (j % 2 ? 1 : -1) * 0.12).castShadow = false; } }
  { const w = new THREE.Group(); w.position.set(-6.4, 0, 4.4); w.rotation.z = 0.12; root.add(w); bx(w, 0.03, 1.5, 0.03, toon(0x2a2c31), 0, 0.75, 0); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glow(0xffffff)); m.position.set(0, 1.0 + k * 0.22, 0); w.add(m); } }
  const quietT = crisp(256, 96, (g, w, h) => { g.fillStyle = '#2a0608'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff3b3b'; g.font = '800 40px Inter, Arial'; g.textAlign = 'center'; g.fillText('QUIET', w / 2, 46); g.font = '700 22px Inter, Arial'; g.fillText('CAPTURE IN PROGRESS', w / 2, 80); });
  { const q = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.45), new THREE.MeshBasicMaterial({ map: quietT, toneMapped: false })); q.position.set(3.2, 4.2, -DEP / 2 + 0.52); root.add(q); }
  const stageT = crisp(512, 128, (g, w, h) => { g.fillStyle = '#121318'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8e8e2'; g.font = '800 64px Inter, Arial'; g.textAlign = 'center'; g.fillText('STAGE B', w / 2, 76); g.fillStyle = '#9aa0aa'; g.font = '600 24px Inter, Arial'; g.fillText('PERFORMANCE CAPTURE', w / 2, 112); });
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), lam({ map: stageT })); s.position.set(-5.4, 4.3, -DEP / 2 + 0.52); root.add(s); }
  { const reel = cyl(root, 0.35, 0.35, 0.3, toon(0xc0392b), 6.4, 0.35, -6.6, 16); reel.rotation.x = PI / 2; cyl(root, 0.12, 0.12, 0.32, toon(0x1d1f24), 6.4, 0.35, -6.6).rotation.x = PI / 2; }
  // cables snaking across the floor (outside the volume)
  for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(5.2 + i * 0.35, 0.02, -6 + k * 0.4 + Math.sin(i * 0.9 + k) * 0.3 + i * 0.5)); const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.018, 5), toon(0x111114)); root.add(c); }

  // ---- the car buck: a pipe-frame car the actors sit in (seats, a wheel on a post), stand-in for any car in the game
  D.buck = { x: 2.6, z: -2.6, seatY: 0.45 };
  { const b = new THREE.Group(); b.position.set(D.buck.x, 0, D.buck.z); b.rotation.y = -0.5; root.add(b); D.buck.g = b; const pipe = toon(0xc9cdd4), y = toon(0xf2c230);
    const P = (a, c, m = pipe) => { const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c), L = A.distanceTo(C), o = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, L, 6), m); o.position.copy(A).add(C).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), C.clone().sub(A).normalize()); o.castShadow = true; b.add(o); };
    const xs = [-0.8, 0.8], zs = [-1.9, 1.9];
    for (const x of xs) { P([x, 0.25, zs[0]], [x, 0.25, zs[1]]); P([x, 0.25, -0.5], [x * 0.85, 1.2, -0.2]); P([x * 0.85, 1.2, -0.2], [x * 0.85, 1.2, 0.9]); P([x * 0.85, 1.2, 0.9], [x, 0.7, 1.6]); P([x, 0.25, zs[1]], [x, 0.7, 1.6]); }
    for (const z of zs) P([xs[0], 0.25, z], [xs[1], 0.25, z], y);
    P([xs[0] * 0.85, 1.2, -0.2], [xs[1] * 0.85, 1.2, -0.2]); P([xs[0] * 0.85, 1.2, 0.9], [xs[1] * 0.85, 1.2, 0.9]);
    for (const x of [-0.42, 0.42]) { bx(b, 0.5, 0.12, 0.5, toon(0x2a2c31), x, D.buck.seatY - 0.06, 0.1); bx(b, 0.5, 0.6, 0.1, toon(0x2a2c31), x, 0.72, -0.18); }
    for (const x of [-0.42, 0.42]) bx(b, 0.5, 0.12, 0.5, toon(0x2a2c31), x, D.buck.seatY - 0.06, -1.0);
    P([-0.42, 0.3, 0.95], [-0.42, 0.95, 0.75]); const wh = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 6, 18), toon(0x1d1f24)); wh.position.set(-0.42, 0.98, 0.72); wh.rotation.x = -0.9; b.add(wh); D.buck.wheel = wh;
    for (const [x, z] of [[-0.9, -1.5], [0.9, -1.5], [-0.9, 1.4], [0.9, 1.4]]) { const tire = cyl(b, 0.28, 0.28, 0.18, toon(0x1a1a1c), x, 0.28, z, 14); tire.rotation.z = PI / 2; } }

  // ---- video village: a table with monitors, a laptop, the director's chair, a phone on a little stand (Scribe's screen)
  D.desk = { x: 6.6, z: 2.6, top: 0.78 };
  const desk = new THREE.Group(); desk.position.set(D.desk.x, 0, D.desk.z); desk.rotation.y = -PI / 2; root.add(desk); D.desk.g = desk;   // the desk faces −x (the volume)
  bx(desk, 2.6, 0.05, 0.85, toon(0x2a2c31), 0, D.desk.top, 0); for (const [x, z] of [[-1.2, -0.35], [1.2, -0.35], [-1.2, 0.35], [1.2, 0.35]]) bx(desk, 0.05, D.desk.top, 0.05, toon(0x5a5f68), x, D.desk.top / 2, z);
  const monitors = [];
  for (let i = 0; i < 3; i++) { const t = crisp(320, 200); monitors.push(t); const mg = new THREE.Group(); mg.position.set(-0.9 + i * 0.9, D.desk.top, -0.22); mg.rotation.y = (i - 1) * -0.18; desk.add(mg);
    bx(mg, 0.06, 0.25, 0.06, toon(0x1d1f24), 0, 0.12, 0); bx(mg, 0.72, 0.46, 0.04, toon(0x111114), 0, 0.5, 0); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.42), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); s.position.set(0, 0.5, 0.021); mg.add(s); }
  { const lap = new THREE.Group(); lap.position.set(0.65, D.desk.top + 0.03, 0.18); desk.add(lap); bx(lap, 0.36, 0.015, 0.24, toon(0x9aa0aa), 0, 0, 0); const scr = bx(lap, 0.36, 0.23, 0.012, toon(0x9aa0aa), 0, 0.11, -0.12); scr.rotation.x = -0.25; }
  // the phone on a small stand (the Scribe screen), near the front edge on the volume side
  const PW = 0.072, PH = 0.15, phone = new THREE.Group(); phone.position.set(-0.35, D.desk.top + 0.03, 0.2); phone.rotation.x = -0.32; desk.add(phone);
  bx(desk, 0.08, 0.06, 0.05, toon(0x3a3f48), -0.35, D.desk.top + 0.05, 0.15);   // the stand sits BEHIND the tilted phone (in front, it hid the screen's lower third)
  bx(phone, PW + 0.008, PH + 0.012, 0.009, toon(0x1a1a20), 0, PH / 2, 0);
  const PHW = 720, PHH = 1500, phT = crisp(PHW, PHH), phScr = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: phT, toneMapped: false })); phScr.position.set(0, PH / 2, 0.0047); phone.add(phScr);
  { const mug = cyl(desk, 0.045, 0.04, 0.1, toon(0xff4f6a), 1.05, D.desk.top + 0.075, 0.25, 12); mug.castShadow = true; }
  // director's chair (canvas back + seat, wood frame), beside the desk
  { const ch = new THREE.Group(); ch.position.set(D.desk.x - 0.9, 0, D.desk.z - 1.9); ch.rotation.y = -PI / 2; root.add(ch); const wd = toon(0x6b4a2e), cv = toon(0x1d1f24);
    for (const s of [-1, 1]) { const a = bx(ch, 0.04, 0.95, 0.04, wd, s * 0.26, 0.47, 0.2); a.rotation.x = 0.35; const c = bx(ch, 0.04, 0.95, 0.04, wd, s * 0.26, 0.47, -0.2); c.rotation.x = -0.35; bx(ch, 0.04, 0.6, 0.04, wd, s * 0.26, 0.95, -0.22); bx(ch, 0.04, 0.04, 0.5, wd, s * 0.28, 0.75, 0); }
    bx(ch, 0.5, 0.02, 0.42, cv, 0, 0.66, 0); bx(ch, 0.52, 0.22, 0.02, cv, 0, 1.12, -0.23); }

  // ---- the big retarget screen at the back-left: the live solve becomes a game character
  const wallT = crisp(640, 360); D.screen = { x: -3.6, y: 2.9, z: -7.6 };
  { const sg = new THREE.Group(); sg.position.set(D.screen.x, 0, D.screen.z); root.add(sg); bx(sg, 0.12, 1.4, 0.12, toon(0x2a2c31), -1.6, 0.7, 0); bx(sg, 0.12, 1.4, 0.12, toon(0x2a2c31), 1.6, 0.7, 0);
    bx(sg, 4.3, 2.5, 0.12, toon(0x111114), 0, D.screen.y, 0); const s = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.3), new THREE.MeshBasicMaterial({ map: wallT, toneMapped: false })); s.position.set(0, D.screen.y, 0.065); sg.add(s); }

  // ---- actors in marker suits (black suit, white markers on the joints, a head-mounted camera boom)
  const mk = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), mkGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const dot = (parent, x, y, z) => { const m = new THREE.Mesh(mkGeo, mk); m.position.set(x, y, z); parent.add(m); return m; };
  const SKIN = [0xf0c8a8, 0xc68a5e, 0xe8b894, 0x8d5a3a];
  const actors = SKIN.map((skin, i) => {
    const r = makePerson({ skin, top: 0x18181c, pants: 0x18181c, shoes: 0x111114, hair: 0x111114, hairStyle: 'short', collar: null, headR: 0.135 });
    root.add(r.root);
    // markers: head (3), chest + back, shoulders, elbows, wrists, pelvis sides, knees, ankles
    dot(r.headG, 0, 0.29, 0.02); dot(r.headG, 0.1, 0.22, 0.06); dot(r.headG, -0.1, 0.22, 0.06);
    dot(r.spine, 0, 0.42, 0.13); dot(r.spine, 0, 0.3, -0.13); dot(r.spine, 0.12, 0.2, 0.12); dot(r.spine, -0.12, 0.2, 0.12);
    for (const a of r.arms) { dot(a.shoulder, 0, 0.06, 0); dot(a.elbow, 0.05 * a.s, 0, -0.03); dot(a.hand, 0.04 * a.s, 0.02, 0); }
    dot(r.pelvis, 0.17, 0.02, 0.05); dot(r.pelvis, -0.17, 0.02, 0.05); dot(r.pelvis, 0, 0.06, -0.12);
    for (const l of r.legs) { dot(l.knee, 0.0, 0, 0.07); dot(l.ankle, 0.05 * l.s, 0.03, 0.0); dot(l.knee, 0.07 * l.s, -0.2, 0); }
    // head rig: a band + a boom with a little camera in front of the face
    const hg = r.head.g; const band = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.012, 6, 20), toon(0x111114)); band.rotation.x = PI / 2; band.position.y = 0.05; hg.add(band);
    const boom = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.2), toon(0x2a2c31)); boom.position.set(0.0, -0.05, 0.16); boom.rotation.x = -0.35; hg.add(boom);
    const hcam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.04), toon(0x111114)); hcam.position.set(0, -0.12, 0.23); hg.add(hcam);
    return r;
  });

  // ---- light: an even, cool-white stage
  const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x50545c, 1.25); root.add(hemi);
  for (const [x, z] of [[-4, -3], [4, -3], [0, 3], [-4, 4]]) { const L = new THREE.PointLight(0xf2f4ff, 3.2, 12, 1.4); L.position.set(x, 5.8, z); root.add(L); }

  // ---- solve drawing (2-D skeleton of dots + bones) for the monitors / wall
  function drawSolve(g, w, h, J, o = {}) {
    const col = o.color ?? '#5cf0ff', bones = [['head', 'neck'], ['neck', 'hip'], ['neck', 'sh0'], ['neck', 'sh1'], ['sh0', 'el0'], ['el0', 'ha0'], ['sh1', 'el1'], ['el1', 'ha1'], ['hip', 'kn0'], ['kn0', 'an0'], ['hip', 'kn1'], ['kn1', 'an1']];
    g.strokeStyle = col; g.lineWidth = o.lw ?? 4; g.lineCap = 'round';
    for (const [a, b] of bones) { g.beginPath(); g.moveTo(...J[a]); g.lineTo(...J[b]); g.stroke(); }
    g.fillStyle = o.dot ?? '#ffffff'; for (const k of Object.keys(J)) { g.beginPath(); g.arc(J[k][0], J[k][1], o.r ?? 5, 0, 2 * PI); g.fill(); }
    if (o.head) { g.beginPath(); g.arc(J.head[0], J.head[1] - 6, o.head, 0, 2 * PI); g.stroke(); }
  }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function update(t) { rings.forEach((r, i) => { const k = 0.65 + 0.35 * (hash(i * 7 + Math.floor(t * 3)) > 0.4 ? 1 : 0.4); r.material.color.setRGB(k, 0.14 * k, 0.2 * k); }); }

  return { root, D, actors, monitors, wall: wallT, phone, phScr, phT, PW, PH, PHW, PHH, drawSolve, update, hemi, walls: { back, front, left, right } };
}
