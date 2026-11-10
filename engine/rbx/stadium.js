// Blocky-avatar game style (069): a blocky football stadium (our own design, no league/team marks). The field runs along x
// (goal lines at x = ±45.72, end zones to ±54.86, 5-yard lines every 4.572 m, painted 10…50…10 numbers), width along z (±24.4).
// Studded green turf, plain blue / red end zones, padded field wall with our own ad boards, 12-row stands on both sides with an
// instanced blocky crowd (rbxCrowd), a jumbotron at the −x end (setScreen(lines, bg) redraws it), goal posts, a race START gate
// + a FINISH arch with a ribbon (for halftime races), a TV camera on a tripod.
//   const ST = buildStadium(studio, { world: W });   ST.yardX(40) = x of the 40 on the +x half (−: the −x half)
//   ST.crowd.update(t, f) per frame (cheering), ST.setScreen(['LIVE', 'CORGI LOOSE'], '#c81e3a'), ST.ribbon.visible / ST.snap(k)
import * as THREE from 'three';
import { S, part, cyl, plastic, neon, shade, canvasTexture, prng } from './mats.js';
import { rbxCrowd } from './props.js';
import { makeSign } from './obby.js';

const YD = 0.9144;
export function buildStadium(studio, { world = null, rows = 12, seatStep = 0.95, crowdSeed = 5, ads = ['HALFTIME SHOW', 'CORGI CUP', 'BLOCK BOWL', 'GO TEAM!'] } = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const L = 54.86, Wd = 24.38, GL = 45.72;
  const yardX = (n) => Math.sign(n || 1) * (50 - Math.abs(n)) * YD;          // yardX(40) = 9.14 (the +x half); yardX(-40) = −9.14
  // turf: studded green slab + a darker border, white lines on top
  part([L * 2 + 12, 0.2, Wd * 2 + 10], { color: 0x2f8f3c, top: 'studs', parent: root, pos: [0, -0.1, 0] });
  part([GL * 2, 0.02, Wd * 2], { color: 0x3fae49, top: 'studs', parent: root, pos: [0, 0.01, 0], shadow: false });
  for (const s of [-1, 1]) part([L - GL, 0.02, Wd * 2], { color: s < 0 ? 0x2f6fe0 : 0xd83a4a, top: 'studs', parent: root, pos: [s * (GL + L) / 2, 0.012, 0], shadow: false });
  const white = plastic(0xf6f6f2, { rough: 0.6 });
  const line = (x0, z0, x1, z1, w = 0.12) => { const len = Math.hypot(x1 - x0, z1 - z0), m = new THREE.Mesh(new THREE.BoxGeometry(len + w, 0.03, w), white); m.position.set((x0 + x1) / 2, 0.025, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.receiveShadow = true; root.add(m); return m; };
  line(-L, -Wd, L, -Wd, 0.2); line(-L, Wd, L, Wd, 0.2); line(-L, -Wd, -L, Wd, 0.2); line(L, -Wd, L, Wd, 0.2);
  for (let yd = 0; yd <= 100; yd += 5) line(-GL + yd * YD, -Wd, -GL + yd * YD, Wd, yd % 50 === 0 ? 0.2 : 0.12);
  for (let yd = 1; yd < 100; yd++) if (yd % 5) for (const z of [-Wd + 0.5, -2.8, 2.8, Wd - 0.5]) line(-GL + yd * YD, z - 0.3, -GL + yd * YD, z + 0.3, 0.1);   // hash marks
  // painted numbers (read from the +z sideline on the near side, flipped on the far side), arrows point to the nearer goal
  const numTex = new Map();
  const num = (n) => { if (!numTex.has(n)) numTex.set(n, canvasTexture(256, 160, (g) => { g.fillStyle = '#ffffff'; g.font = '700 150px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 86); })); return numTex.get(n); };
  const numbers = [];
  for (let yd = 10; yd <= 90; yd += 10) {
    const n = yd <= 50 ? yd : 100 - yd, x = -GL + yd * YD;
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.8), new THREE.MeshStandardMaterial({ map: num(n), transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      m.rotation.set(-Math.PI / 2, 0, s > 0 ? 0 : Math.PI); m.position.set(x, 0.03, s * (Wd - 8.2 - 0.9)); m.receiveShadow = true; root.add(m); numbers.push({ n, x, side: s, m });
    }
  }
  // a plain star at midfield (no logos)
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.6, map: canvasTexture(256, 256, (g) => { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 46 : 118; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.fill(); g.fillStyle = '#ffc73b'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 36 : 96; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.fill(); }) })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; root.add(m); }

  // goal posts (yellow)
  const yel = plastic(0xffd23f, { rough: 0.35 });
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(s * (L + 0.3), 0, 0); root.add(g);
    const p = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), yel); m.position.set(x, y, z); m.castShadow = true; g.add(m); };
    p(0.25, 3.05, 0.25, 0, 1.52, 0); p(0.22, 0.22, 5.64, 0, 3.05, 0); p(0.18, 6, 0.18, 0, 6.05, -2.82); p(0.18, 6, 0.18, 0, 6.05, 2.82);
  }

  // field wall + ad boards (our own words) + the stands on both sides
  const adTex = (txt, i) => canvasTexture(1024, 96, (g) => { g.fillStyle = ['#1f63d6', '#e5384f', '#16a34a', '#ff8a2f'][i % 4]; g.fillRect(0, 0, 1024, 96); g.fillStyle = '#ffffff'; g.font = '700 64px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let k = 0; k < 2; k++) g.fillText(txt, 256 + k * 512, 52); });
  const seats = [];
  const standZ0 = Wd + 4.6;
  for (const s of [-1, 1]) {
    // padded wall with LED boards (12 boards along x)
    part([L * 2 + 14, 1.3, 0.4], { color: 0x2b2f36, parent: root, pos: [0, 0.65, s * (standZ0 - 0.6)] });
    for (let i = 0; i < 8; i++) {
      const x = -L - 4 + (i + 0.5) * (L * 2 + 8) / 8, board = new THREE.Mesh(new THREE.PlaneGeometry((L * 2 + 8) / 8 - 0.3, 0.9), new THREE.MeshBasicMaterial({ map: adTex(ads[(i + (s > 0 ? 0 : 2)) % ads.length], i + (s > 0 ? 1 : 0)), toneMapped: true }));
      board.position.set(x, 0.7, s * (standZ0 - 0.6 - 0.205)); board.rotation.y = s > 0 ? Math.PI : 0; root.add(board);
    }
    for (let r = 0; r < rows; r++) {
      const z = s * (standZ0 + r * 0.95), y = 1.0 + r * 0.55;
      part([L * 2 + 14, y, 0.95], { color: r % 2 ? 0x8a8f96 : 0x9a9ea6, parent: root, pos: [0, y / 2, z + s * 0.475], shadow: false });
      for (let x = -L - 5; x <= L + 5; x += seatStep) seats.push({ x: x + (r % 2) * seatStep * 0.5, y, z: z + s * 0.38, rotY: s > 0 ? Math.PI : 0, row: r, side: s });
    }
    // top wall + light towers
    const topY = 1.0 + rows * 0.55, topZ = s * (standZ0 + rows * 0.95);
    part([L * 2 + 14, 3.2, 0.6], { color: 0x5c6068, parent: root, pos: [0, topY + 1.6, topZ + s * 0.3] });
    for (const x of [-40, 0, 40]) {
      part([0.6, 16, 0.6], { color: 0x6b6f76, parent: root, pos: [x, topY + 8, topZ + s * 0.8] });
      part([5, 2.4, 0.4], { color: 0x3c3f46, parent: root, pos: [x, topY + 16.5, topZ + s * 0.8], rot: [s * 0.35, 0, 0] });
      const lamp = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.0), neon(0xfff6d8, 1.3)); lamp.position.set(x, topY + 16.5, topZ + s * 0.58); lamp.rotation.set(s * 0.35, s > 0 ? Math.PI : 0, 0); root.add(lamp);
    }
  }
  const crowd = rbxCrowd(root, seats, { seed: crowdSeed });
  // end-zone stands (lower) behind each goal, and the jumbotron over the −x end
  const endSeats = [];
  for (const s of [-1, 1]) for (let r = 0; r < 8; r++) {
    const x = s * (L + 7 + r * 0.95), y = 0.8 + r * 0.5;
    part([0.95, y, Wd * 2 + 8], { color: r % 2 ? 0x8a8f96 : 0x9a9ea6, parent: root, pos: [x + s * 0.475, y / 2, 0], shadow: false });
    for (let z = -Wd - 3; z <= Wd + 3; z += seatStep) endSeats.push({ x: x + s * 0.38, y, z: z + (r % 2) * seatStep * 0.5, rotY: s > 0 ? -Math.PI / 2 : Math.PI / 2 });
  }
  for (const s of [-1, 1]) part([0.4, 1.2, Wd * 2 + 8], { color: 0x2b2f36, parent: root, pos: [s * (L + 6.4), 0.6, 0] });
  const endCrowd = rbxCrowd(root, endSeats, { seed: crowdSeed + 3 });

  // jumbotron (−x end, high, facing +x)
  const jt = new THREE.Group(); jt.position.set(-L - 16, 0, 0); jt.rotation.y = Math.PI / 2; root.add(jt);
  part([1.2, 15, 1.2], { color: 0x5c6068, parent: jt, pos: [-7, 7.5, -0.6] }); part([1.2, 15, 1.2], { color: 0x5c6068, parent: jt, pos: [7, 7.5, -0.6] });
  part([22, 12.5, 1.2], { color: 0x1d1f24, parent: jt, pos: [0, 19, -0.6] });
  const scr = document.createElement('canvas'); scr.width = 1024; scr.height = 512;
  const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(21, 10.5), new THREE.MeshBasicMaterial({ map: scrTex, color: new THREE.Color(1.15, 1.15, 1.15) })); screen.position.set(0, 19, 0.02); jt.add(screen);
  let scrKey = '';
  const setScreen = (lines, bg = '#1f63d6', fg = '#ffffff', draw = null) => {
    const key = lines.join('|') + bg + fg + (draw ? 'd' : ''); if (key === scrKey) return; scrKey = key;
    const g = scr.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < 512; y += 6) g.fillRect(0, y, 1024, 2);
    if (draw) draw(g);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((s, i) => { let f = i === 0 ? 150 : 110; g.font = `700 ${f}px Fredoka, sans-serif`; while (g.measureText(s).width > 960 && f > 20) g.font = `700 ${(f -= 4)}px Fredoka, sans-serif`; g.fillText(s, 512, 512 / (lines.length + 1) * (i + 1) + (lines.length === 1 ? 0 : (i ? 18 : -18))); });
    scrTex.needsUpdate = true;
  };
  setScreen(['HALFTIME', 'CORGI CUP']);

  // race: START gate across the +z side, FINISH arch on the −z side (lanes along z at x ∈ [12, 22])
  const race = { x0: 12.5, x1: 21.5, zStart: 19.5, zFinish: -19.5, lanes: 5 };
  race.laneX = (i) => race.x0 + (i + 0.5) * (race.x1 - race.x0) / race.lanes;
  const gate = new THREE.Group(); gate.position.set((race.x0 + race.x1) / 2, 0, race.zStart); root.add(gate);
  for (const s of [-1, 1]) part([0.25, 1.0, 0.25], { color: 0xf2f2f2, parent: gate, pos: [s * (race.x1 - race.x0) / 2, 0.5, 0] });
  const gateBar = part([race.x1 - race.x0, 0.18, 0.18], { color: 0xe5384f, mat: 'smooth', parent: gate, pos: [0, 0.55, 0] });
  const arch = new THREE.Group(); arch.position.set((race.x0 + race.x1) / 2, 0, race.zFinish); root.add(arch);
  for (const s of [-1, 1]) part([0.9, 4.2, 0.9], { color: 0xffc73b, parent: arch, pos: [s * ((race.x1 - race.x0) / 2 + 0.6), 2.1, 0], radius: 0.25 });
  part([race.x1 - race.x0 + 2.1, 0.9, 0.9], { color: 0xffc73b, parent: arch, pos: [0, 4.2, 0], radius: 0.25 });
  const fin = makeSign('FINISH', { w: 6.4, h: 0.8, d: 0.1, bg: '#ffffff', fg: '#16181d' }); fin.g.position.set(0, 4.2, 0.48); arch.add(fin.g);
  const fin2 = makeSign('FINISH', { w: 6.4, h: 0.8, d: 0.1, bg: '#ffffff', fg: '#16181d' }); fin2.g.position.set(0, 4.2, -0.48); fin2.g.rotation.y = Math.PI; arch.add(fin2.g);
  const ribbonM = new THREE.MeshStandardMaterial({ color: 0xe5384f, roughness: 0.5, side: THREE.DoubleSide });
  const ribbon = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * ((race.x1 - race.x0) / 2 + 0.2), 0.42, 0); arch.add(g); const m = new THREE.Mesh(new THREE.PlaneGeometry((race.x1 - race.x0) / 2 + 0.2, 0.08), ribbonM); m.position.x = -s * ((race.x1 - race.x0) / 4 + 0.1); g.add(m); return g; });
  const snap = (k) => ribbon.forEach((g, i) => { g.rotation.y = (i ? -1 : 1) * 1.3 * k; g.rotation.z = (i ? 1 : -1) * 0.9 * k; });
  // lane line: a dashed straight line from the gate to the finish under one lane (setLane(i, k) shows it, k = reveal 0..1)
  const dashM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.25, 0.6), transparent: true, opacity: 0.9, depthWrite: false });
  const dashes = []; for (let i = 0; i < 22; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 1.0), dashM); d.position.y = 0.05; d.visible = false; root.add(d); dashes.push(d); }
  const setLane = (lane, k) => dashes.forEach((d, i) => { const u = (i + 0.5) / dashes.length; d.visible = k > u && lane != null; d.position.set(race.laneX(lane ?? 0), 0.05, race.zStart + (race.zFinish - race.zStart) * u); });

  // TV camera on a tripod (operator = your own avatar beside it)
  const tv = new THREE.Group(); root.add(tv);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, m = part([0.06, 1.5, 0.06], { color: 0x2b2f36, parent: tv, pos: [Math.sin(a) * 0.3, 0.72, Math.cos(a) * 0.3] }); m.rotation.set(Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22); }
  const tvHead = new THREE.Group(); tvHead.position.y = 1.5; tv.add(tvHead);
  part([0.42, 0.42, 0.8], { color: 0x2b2f36, parent: tvHead, pos: [0, 0.18, 0], radius: 0.05 });
  cyl(0.16, 0.35, { color: 0x15171b, parent: tvHead, pos: [0, 0.18, 0.55], axis: 'z' });
  part([0.3, 0.12, 0.12], { color: 0xe5384f, mat: 'neon', parent: tvHead, pos: [0, 0.45, -0.1] });

  world?.setFog?.(160, 1400);
  return { root, D: { L, Wd, GL, standZ0, YD }, yardX, numbers, crowd, endCrowd, setScreen, screen, jt, race, gate, gateBar, arch, ribbon, snap, setLane, tv, tvHead };
}
