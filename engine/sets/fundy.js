// SET: FUNDY FLOWERPOTS — the ocean floor at low tide in the Bay of Fundy (in the spirit of the Hopewell Rocks), built for 029
// ("What if the Moon were twice as close?"): wet red-brown mud with ripples and puddles, five sandstone "flowerpot" stacks
// (eroded narrow waists, dark seaweed band up to the high-tide line, fir trees on top), a layered red cliff with forest on top,
// a steel staircase down the cliff with a landing, a sign at the foot, the sea far out (−z) — and setSea(level) raises the
// whole bay (a time-lapse tide). Bright late-morning sun, blue sky.
//
// Coordinates (meters, y up). Floor y ≈ 0 (today's low tide). Cliff face along z ≈ +16 (the land is +z), its top at y = DIMS.cliffY.
// Stacks at DIMS.pots[i] = [x, z, height]. Staircase from the cliff top (DIMS.stairTop) down to DIMS.stairFoot. Sea edge at
// low tide z ≈ −70. Camera usually on the stair landing (DIMS.landing) or on the floor looking −z / +z. far ≥ 1500.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
export const DIMS = {
  cliffY: 21, pots: [[4.3, 1.6, 15], [12.1, -12.5, 17], [-4.9, -11.5, 19], [2.1, -25.1, 14], [-11.6, -3.9, 16]],
  stairTop: [24, 21, 17], stairFoot: [18, 0, 8], landing: [21.5, 10.5, 12.5], sign: [15.5, 7.2],
};

export function buildFundy(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 16);
  const fog = new THREE.Fog(0xe2ecf2, 260, 1400);
  const sky = makeSkyDome(0x3f86d6, 0xeaf2f6, 1300); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 12; i++) { const a = -PI * 0.05 - R() * PI * 0.9, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 900, 150 + R() * 170, Math.sin(a) * 900); root.add(cg); for (let k = 0; k < 6; k++) { const p = mk(new THREE.SphereGeometry(30 + R() * 25, 12, 8), cloudM, cg, (k - 2.5) * 34, R() * 12, R() * 20); p.scale.y = 0.42; p.castShadow = false; } }

  // the ocean floor: red-brown wet mud, ripple marks, puddles that mirror the sky
  const mudT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#8a4a34'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${R() < 0.5 ? '60,30,20' : '170,110,85'},${0.12 + R() * 0.12})`; g.lineWidth = 2 + R() * 3; const y = R() * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 4 * Math.sin(x * 0.08 + i)); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(150,180,200,.35)'; g.beginPath(); g.ellipse(R() * w, R() * h, 8 + R() * 30, 3 + R() * 10, R() * 3, 0, 7); g.fill(); }
  }, [40, 40]);
  const floorGeo = new THREE.PlaneGeometry(600, 400, 120, 80); floorGeo.rotateX(-PI / 2);
  { const p = floorGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 150; p.setZ(i, z); p.setY(i, (z < -60 ? (z + 60) * 0.06 : 0) + 0.25 * Math.sin(x * 0.11 + z * 0.07) + 0.12 * Math.sin(x * 0.37 - z * 0.23)); } floorGeo.computeVertexNormals(); }
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: mudT, roughness: 0.32, metalness: 0.05 })); floor.receiveShadow = true; root.add(floor);
  // scattered boulders + seaweed clumps
  const stoneM = [mat(0x8a5a44, 0.9), mat(0x6e4a3a, 0.9), mat(0x9a6a50, 0.9)], weedM = mat(0x3a4222, 0.9);
  for (let i = 0; i < 70; i++) { const x = -60 + R() * 120, z = -50 + R() * 62; const r = mk(new THREE.IcosahedronGeometry(0.3 + R() * 0.8, 0), stoneM[i % 3], root, x, 0.15, z); r.scale.y = 0.6; r.rotation.set(R(), R(), R()); if (i % 3 === 0) { const wd = mk(new THREE.SphereGeometry(0.5, 8, 6), weedM, root, x + 0.4, 0.05, z); wd.scale.set(1.2, 0.2, 0.9); } }

  // sandstone: horizontal strata texture (shared by the cliff + the stacks), dark weed band to the old high-tide line
  const stoneT = canvasTex(256, 512, (g, w, h) => {
    for (let y = 0; y < h; y += 4) { const k = Math.sin(y * 0.09) * 0.5 + Math.sin(y * 0.031) * 0.5; g.fillStyle = `rgb(${168 + k * 28 + R() * 10},${88 + k * 18 + R() * 8},${62 + k * 12})`; g.fillRect(0, y, w, 4); }
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(60,30,20,${R() * 0.12})`; g.fillRect(R() * w, R() * h, 1 + R() * 10, 1 + R() * 3); }
  }, [3, 1]);
  const potM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.9 });
  const bandT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(45,40,25,.95)'); gr.addColorStop(0.75, 'rgba(55,48,30,.75)'); gr.addColorStop(1, 'rgba(55,48,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const firM = [mat(0x2f5a32, 0.9), mat(0x3a6a3a, 0.9)], trunkM = mat(0x5a4030, 0.9);
  const fir = (p, x, y, z, s) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); mk(new THREE.CylinderGeometry(0.15, 0.22, 2, 6), trunkM, g, 0, 1, 0); for (let k = 0; k < 4; k++) mk(new THREE.ConeGeometry(1.5 - k * 0.3, 2.2, 8), firM[k % 2], g, 0, 2.2 + k * 1.2, 0); return g; };
  // each stack: a lumpy column — narrow eroded waist, flaring top — with the old tide line baked in (dark weed below ~9 m)
  const stackM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.92, vertexColors: true });
  const weedC = new THREE.Color(0x4a3f2c), rockC = new THREE.Color(0xffffff);
  const pots = DIMS.pots.map(([x, z, H], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    const geo = new THREE.CylinderGeometry(1, 1, H, 30, 26); geo.translate(0, H / 2, 0);
    const p = geo.attributes.position, cols = [], ph = i * 1.7;
    const prof = (y) => { const u = y / H; return u < 0.08 ? 2.2 : u < 0.28 ? 2.2 - 0.8 * Math.sin((u - 0.08) / 0.2 * Math.PI / 2) : 1.4 + 2.3 * Math.pow((u - 0.28) / 0.72, 0.7); };
    for (let k = 0; k < p.count; k++) {
      const vx = p.getX(k), vy = p.getY(k), vz = p.getZ(k), a = Math.atan2(vz, vx), rr = Math.hypot(vx, vz);
      const n = 1 + 0.1 * Math.sin(3 * a + vy * 0.7 + ph) + 0.07 * Math.sin(7 * a - vy * 1.3 + ph * 2) + 0.05 * Math.sin(13 * a + vy * 2.1) + 0.04 * Math.sin(vy * 3.1 + a * 5);
      const r = prof(vy) * n * (0.9 + (i % 3) * 0.08) * rr;
      p.setX(k, Math.cos(a) * r); p.setZ(k, Math.sin(a) * r * 0.82); if (vy > H - 0.01) p.setY(k, H + 0.3 * Math.sin(a * 3 + ph) * rr);
      const c = weedC.clone().lerp(rockC, Math.min(1, Math.max(0, (vy - 7.5) / 2.0))); cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
    const m = mk(geo, stackM, g, 0, 0, 0); m.rotation.y = R() * PI;
    for (let k = 0; k < 5 + (i % 3); k++) fir(g, (R() - 0.5) * 4.6, H, (R() - 0.5) * 3.2, 0.7 + R() * 0.6);
    for (let k = 0; k < 8; k++) { const b = mk(new THREE.SphereGeometry(1.0, 8, 6), firM[k % 2], g, (R() - 0.5) * 5.4, H + 0.3, (R() - 0.5) * 4.2); b.scale.y = 0.5; }
    return g;
  });
  // the cliff: a wall of lumpy strata blocks, forest on top
  const cliff = new THREE.Group(); root.add(cliff);
  for (let i = 0; i < 26; i++) { const x = -120 + i * 9.5 + R() * 3, z = 17 + R() * 4; const b = mk(new THREE.BoxGeometry(10 + R() * 4, DIMS.cliffY + 2, 10), potM, cliff, x, DIMS.cliffY / 2 - 1, z + 4); b.rotation.y = (R() - 0.5) * 0.25; const bb = mk(new THREE.CylinderGeometry(5.5, 6, 9.5, 12, 1, true), new THREE.MeshStandardMaterial({ map: bandT, transparent: true, roughness: 0.9, depthWrite: false }), cliff, x, 4.25, z - 0.5); bb.scale.z = 0.2; }
  const top = mk(new THREE.BoxGeometry(260, 2, 80), mat(0x4f7a3a, 1), cliff, 0, DIMS.cliffY, 58); top.castShadow = false;
  for (let i = 0; i < 90; i++) { const x = -120 + R() * 240, z = 20 + R() * 40; if (Math.abs(x - DIMS.stairTop[0]) < 4 && z < 26) continue; fir(cliff, x, DIMS.cliffY + 1, z, 1.1 + R() * 0.8); }
  // staircase: two flights + a landing, steel grey with railings
  const steel = mat(0x5a6068, 0.5, { metalness: 0.5 }), rail = mat(0xd8dce0, 0.4, { metalness: 0.6 });
  const stairs = new THREE.Group(); root.add(stairs);
  const flight = (a, b, n) => { for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; mk(new THREE.BoxGeometry(1.6, 0.08, 0.36), steel, stairs, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u); }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); for (const s of [-0.85, 0.85]) { const r = mk(new THREE.CylinderGeometry(0.04, 0.04, L, 6), rail, stairs, (a[0] + b[0]) / 2 + s, (a[1] + b[1]) / 2 + 1.0, (a[2] + b[2]) / 2); r.lookAt(new THREE.Vector3(b[0] + s, b[1] + 1.0, b[2])); r.rotateX(PI / 2); } };
  const L1 = DIMS.landing;
  flight([DIMS.stairTop[0], DIMS.cliffY + 1, DIMS.stairTop[2]], [L1[0] + 1.5, L1[1], L1[2]], 30);
  mk(new THREE.BoxGeometry(4, 0.12, 3), steel, stairs, L1[0], L1[1] - 0.06, L1[2]);
  flight([L1[0] - 1.5, L1[1], L1[2]], [DIMS.stairFoot[0], 0.1, DIMS.stairFoot[2]], 30);
  for (const [x, z] of [[L1[0] - 1.8, L1[2] - 1.4], [L1[0] + 1.8, L1[2] - 1.4], [L1[0] - 1.8, L1[2] + 1.4], [L1[0] + 1.8, L1[2] + 1.4]]) mk(new THREE.CylinderGeometry(0.1, 0.1, L1[1] + 0.5, 6), steel, stairs, x, (L1[1] - 0.5) / 2, z);
  mk(new THREE.BoxGeometry(4, 0.05, 0.05), rail, stairs, L1[0], L1[1] + 1.0, L1[2] - 1.45);
  // sign at the foot of the stairs
  const signT = canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2efe6'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#f2efe6'; g.textAlign = 'center'; g.font = 'bold 54px Helvetica, Arial, sans-serif'; g.fillText('OCEAN FLOOR', w / 2, 92); g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.fillText('RETURN TO THE STAIRS', w / 2, 168); g.fillText('BEFORE HIGH TIDE', w / 2, 224); });
  const sg = new THREE.Group(); sg.position.set(DIMS.sign[0], 0, DIMS.sign[1]); root.add(sg);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), mat(0x6a4a30, 0.8), sg, s * 0.9, 1.3, 0);
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.6 })); sp.position.set(0, 2.0, -0.07); sp.rotation.y = PI; sg.add(sp);
  // far shore across the bay
  for (let i = 0; i < 5; i++) { const m = mk(new THREE.SphereGeometry(120 + R() * 80, 16, 8), mat(0x6a7a5a, 1), root, -400 + i * 220, -70, -900 - R() * 200); m.scale.y = 0.4; m.castShadow = false; }

  // the sea: one plane; setSea(level) lifts it; a foam ring around each stack at the waterline
  const seaT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#6f7f7a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,250,240,${0.04 + R() * 0.1})`; g.fillRect(R() * w, R() * h, 10 + R() * 40, 2); } }, [60, 60]);
  const seaM = new THREE.MeshStandardMaterial({ map: seaT, color: 0xb8c8c4, roughness: 0.18, metalness: 0.1, emissive: 0x2a3a40 });   // silty grey-green (Fundy water is murky)
  const sea = mk(new THREE.PlaneGeometry(3000, 3000), seaM, root, 0, -0.5, -300); sea.rotation.x = -PI / 2; sea.castShadow = false; sea.receiveShadow = true;
  const foamT = canvasTex(256, 32, (g, w, h) => { for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + R() * 0.5})`; g.beginPath(); g.ellipse(R() * w, h / 2 + (R() - 0.5) * h * 0.5, 4 + R() * 12, 2 + R() * 4, 0, 0, 7); g.fill(); } }, [6, 1]);
  const foams = pots.map((p, i) => { const f = mk(new THREE.CylinderGeometry(3.3, 3.3, 0.6, 24, 1, true), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, side: THREE.DoubleSide }), root, p.position.x, 0, p.position.z); f.scale.z = 0.9; f.visible = false; return { f, H: DIMS.pots[i][2] }; });
  const front = mk(new THREE.PlaneGeometry(400, 3), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, opacity: 0.8 }), root, 0, 0, -60); front.rotation.x = -PI / 2; front.visible = false;
  function setSea(level, t = 0, frontZ = null) {
    sea.position.y = level; seaT.offset.set(t * 0.02, t * 0.012);
    foams.forEach(({ f, H }) => { f.visible = level > 0.3 && level < H + 0.5; f.position.y = level; const w = level < 2 ? 1.0 : level < 5.5 ? 0.7 : 1.15; f.scale.set(w, 1, w * 0.9); });
    front.visible = frontZ !== null; if (frontZ !== null) front.position.set(0, level + 0.05, frontZ);
  }
  setSea(-0.5, 0);

  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x7a5040, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.7); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  function aimSun(cx = 0, cz = 0, half = 40) { sun.target.position.set(cx, 0, cz); sun.position.set(cx - 70, 150, cz + 110); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 20, far: 450 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, fog, sky, sea, floor, pots, cliff, stairs, setSea, aimSun, lights: { hemi, sun } };
}
