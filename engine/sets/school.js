// SET: a sunny high-school front (057 homework doubling). Built for the pixel look (engine/pixel.js): flat colours, crisp texel
// textures (engine/pixeltex.js), big readable shapes. Coordinates (meters, y up), the street runs along x:
//   Road            z∈[6, 13]  (center z 9.5), crosswalk at x∈[-1.8, 1.8] in front of the entrance path
//   Near sidewalk   z∈[3, 6]   top y = SW_H. Far sidewalk z∈[13, 16], houses beyond (z 20…30)
//   Lawn            z∈[-12, 3]; entrance path x∈[-1.6, 1.6]; steps z∈[-11.2, -10.4] up to the landing (y 0.45) under a portico
//   School          x∈[-24, 24], front facade at z = -12 (2 floors, 8.6 m), WESTFIELD HIGH SCHOOL band, clock, a gym block behind
//   Parking lot     x∈[11, 34], z∈[-11, 2]; DIMS.cars = parked cars (nose to -z); the school bus at the near curb (front to -x)
//   Flagpole DIMS.flag (11 m), marquee sign DIMS.marquee (FINALS WEEK), benches, bike rack, lamp posts, trees, hills, clouds
// set.aimSun(cx, cz, half) per shot (sharp shadows where the action is); set.update(t) waves the flag. Own fog: save it after building.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeCar } from '@engine/sets/city.js';
import { makeBus } from '@engine/props.js';
import { pixelTex, speckle } from '@engine/pixeltex.js';

export const SW_H = 0.12;
export const DIMS = {
  road: { z0: 6, z1: 13 }, walk: { z0: 3, z1: 6 }, far: { z0: 13, z1: 16 },
  school: { x0: -24, x1: 24, z0: -30, z1: -12, h: 8.6 }, facadeZ: -12, landingY: 0.45, steps: { z0: -11.2, z1: -10.4 },
  path: { x0: -1.6, x1: 1.6 }, door: [0, -12],
  flag: [-12.5, -5.5], flagH: 11, marquee: [-10, 1.0], lot: { x0: 11, x1: 34, z0: -11, z1: 2 },
  cars: [[13.4, -6.6], [16.2, -6.6], [19.0, -6.6], [21.8, -6.6], [24.6, -6.6], [27.4, -6.6]],
  bus: [-13.5, 7.75], benches: [[-4.6, -8.4], [4.6, -8.4]],
};

const PALETTE = { brick: '#b45a3c', brickD: '#94452d', mortar: '#d9c7b0', trim: '#f1ece2', glass: '#3c5f86', glassL: '#7fa8cf' };

function brickWindowTex(cols = 2, rows = 2) {
  // one tile = `cols` windows × `rows` floors of brick facade (64 px per window bay, 64 px per floor)
  return pixelTex(64 * cols, 64 * rows, (g, w, h) => {
    g.fillStyle = PALETTE.brick; g.fillRect(0, 0, w, h);
    g.fillStyle = PALETTE.brickD; for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 1, 4);
    g.fillStyle = 'rgba(70,30,20,.35)'; for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = c * 64 + 14, y = r * 64 + 12;
      g.fillStyle = PALETTE.trim; g.fillRect(x - 3, y - 3, 42, 40);
      g.fillStyle = PALETTE.glass; g.fillRect(x, y, 36, 32);
      g.fillStyle = PALETTE.glassL; g.fillRect(x + 2, y + 2, 10, 14); g.fillRect(x + 20, y + 2, 6, 8);
      g.fillStyle = PALETTE.trim; g.fillRect(x + 17, y, 2, 32); g.fillRect(x, y + 15, 36, 2); g.fillRect(x - 4, y + 34, 44, 3);
    }
  }, { k: 2, repeat: [1, 1] });
}
function grassTex() { return pixelTex(64, 64, (g, w, h) => speckle(g, w, h, '#6fae4c', ['#5f9d40', '#7dbd57', '#66a646', '#89c561'], 700, 11), { k: 1, repeat: [1, 1] }); }
function asphaltTex() { return pixelTex(64, 64, (g, w, h) => speckle(g, w, h, '#5d6068', ['#53565d', '#686b73', '#4e5157'], 600, 5), { k: 1, repeat: [1, 1] }); }
function concreteTex() {
  return pixelTex(64, 64, (g, w, h) => { speckle(g, w, h, '#cfc8bc', ['#c4bdb0', '#d8d2c7', '#bdb6a9'], 400, 7); g.fillStyle = '#ada597'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); }, { k: 1, repeat: [1, 1] });
}
function textTex(w, h, draw) { return canvasTex(w, h, draw); }

export function buildSchool(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 57);
  const box = (w, h, d, m, x, y, z, parent = root) => mk(new THREE.BoxGeometry(w, h, d), m, parent, x, y, z);
  const tiled = (tex, rx, ry) => { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const std = (map, rough = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness: rough, ...extra });

  // ---------------------------------------------------------------- sky, fog, light
  const HAZE = new THREE.Color(0xdfe9f2);
  const fog = new THREE.Fog(HAZE, 110, 520); scene.fog = fog;
  const skyTex = canvasTex(64, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#3f86d8'); gr.addColorStop(0.32, '#6fa9e6'); gr.addColorStop(0.47, '#bcd8f0'); gr.addColorStop(0.5, '#e4eef5'); gr.addColorStop(1, '#e4eef5');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(560, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false }));
  sky.renderOrder = -2; sky.frustumCulled = false; root.add(sky);
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x7d8f5c, 1.05); hemi.position.set(0, 1, 0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.5); sun.position.set(-30, 60, 40); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; root.add(sun); root.add(sun.target);
  const SUN_DIR = new THREE.Vector3(-0.42, 0.78, 0.46).normalize();
  function aimSun(cx, cz, half = 20) {
    const c = sun.shadow.camera; c.left = c.bottom = -half; c.right = c.top = half; c.near = 1; c.far = 400; c.updateProjectionMatrix();
    sun.target.position.set(cx, 0, cz); sun.position.set(cx + SUN_DIR.x * 150, SUN_DIR.y * 150, cz + SUN_DIR.z * 150);
  }
  aimSun(0, -4, 30);

  // ---------------------------------------------------------------- ground
  const grass = std(tiled(grassTex(), 300, 300), 1);
  const ground = mk(new THREE.PlaneGeometry(1200, 1200), grass, root, 0, 0, 0); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const asph = std(tiled(asphaltTex(), 150, 2), 0.95);
  const road = mk(new THREE.PlaneGeometry(600, 7), asph, root, 0, 0.01, 9.5); road.rotation.x = -Math.PI / 2; road.castShadow = false;
  const white = mat(0xf2efe6, 0.7), yellow = mat(0xf1c24a, 0.7);
  for (let x = -300; x < 300; x += 4) box(2, 0.01, 0.14, yellow, x, 0.015, 9.5).castShadow = false;
  for (let i = 0; i < 6; i++) box(0.42, 0.012, 6.4, white, -1.6 + i * 0.64, 0.016, 9.5).castShadow = false;
  const conc = (rx, ry) => std(tiled(concreteTex(), rx, ry), 0.92);
  for (const [z0, z1] of [[3, 6], [13, 16]]) {
    box(600, SW_H, z1 - z0, conc(300, 1.5), 0, SW_H / 2, (z0 + z1) / 2);
    box(600, SW_H + 0.01, 0.16, mat(0xb9b2a6, 0.85), 0, SW_H / 2, z0 === 3 ? 6.0 : 13.0);
  }
  box(3.2, 0.06, 13.4, conc(2, 8), 0, 0.03, -3.7);                                     // entrance path
  // steps up to the landing under the portico
  for (let i = 0; i < 3; i++) box(9.4, 0.15 * (i + 1), 0.4 - 0, conc(5, 0.3), 0, 0.075 * (i + 1), -10.6 - i * 0.3);
  box(9.4, DIMS.landingY, 1.0, conc(5, 0.6), 0, DIMS.landingY / 2, -11.5);
  // parking lot + stall lines
  const lot = DIMS.lot;
  const lotM = mk(new THREE.PlaneGeometry(lot.x1 - lot.x0, lot.z1 - lot.z0), std(tiled(asphaltTex(), 12, 7), 0.95), root, (lot.x0 + lot.x1) / 2, 0.02, (lot.z0 + lot.z1) / 2);
  lotM.rotation.x = -Math.PI / 2; lotM.castShadow = false;
  for (let x = 12; x <= 29; x += 2.8) box(0.12, 0.01, 4.6, white, x, 0.03, -6.6).castShadow = false;
  box(lot.x1 - lot.x0, 0.01, 0.14, white, (lot.x0 + lot.x1) / 2, 0.03, -3.9).castShadow = false;
  box(0.6, 0.18, 6, mat(0xb9b2a6, 0.85), lot.x0 - 0.3, 0.09, -5);                       // curb island

  // ---------------------------------------------------------------- the school
  const S = DIMS.school, W = S.x1 - S.x0, Dp = S.z1 - S.z0;
  const facade = std(tiled(brickWindowTex(2, 2), W / 6, 1), 0.9);
  const sideFac = std(tiled(brickWindowTex(2, 2), Dp / 6, 1), 0.9);
  const roofM = mat(0x8d8a86, 0.95);
  const bld = mk(new THREE.BoxGeometry(W, S.h, Dp), [sideFac, sideFac, roofM, roofM, facade, facade], root, 0, S.h / 2, (S.z0 + S.z1) / 2);
  box(W + 0.4, 0.45, 0.5, mat(PALETTE.trim, 0.8), 0, S.h + 0.12, S.z1 + 0.05);                      // parapet front
  box(W + 0.3, 0.22, 0.3, mat(PALETTE.trim, 0.8), 0, 4.3, S.z1 + 0.1);                               // belt course between floors
  // side wing + gym
  const wing = std(tiled(brickWindowTex(2, 1), 2, 1), 0.9);
  mk(new THREE.BoxGeometry(12, 4.6, 14), [wing, wing, roofM, roofM, wing, wing], root, 30, 2.3, -19);
  const gymM = std(tiled(brickWindowTex(1, 1), 4, 1), 0.9);
  mk(new THREE.BoxGeometry(26, 12, 16), [gymM, gymM, roofM, roofM, gymM, gymM], root, -4, 6, -38);
  box(26.5, 0.5, 16.5, mat(0x6f7b86, 0.6), -4, 12.1, -38);
  // portico: canopy on four columns, double doors, the name band and a clock
  const trim = mat(PALETTE.trim, 0.75);
  box(9.6, 0.4, 2.8, trim, 0, 4.0, -10.7);
  for (const x of [-4.2, -1.6, 1.6, 4.2]) mk(new THREE.CylinderGeometry(0.2, 0.22, 3.6, 12), trim, root, x, DIMS.landingY + 1.8 - 0.05, -9.6);
  const doorM = mat(0x2e5b4f, 0.5), doorGlass = new THREE.MeshStandardMaterial({ color: 0x9fc3df, roughness: 0.2, emissive: 0x2a4258, emissiveIntensity: 0.3 });
  for (const s of [-1, 1]) {
    box(1.45, 2.4, 0.12, doorM, s * 0.76, DIMS.landingY + 1.2, -11.97);
    box(0.7, 1.1, 0.04, doorGlass, s * 0.76, DIMS.landingY + 1.65, -11.9);
    box(0.06, 0.06, 0.5, mat(0xd8d2c4, 0.3, { metalness: 0.6 }), s * 0.18, DIMS.landingY + 1.1, -11.75);
  }
  box(3.4, 0.25, 0.2, trim, 0, DIMS.landingY + 2.5, -11.94);
  const nameTex = textTex(1024, 128, (g, w, h) => {
    g.fillStyle = '#21493c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f1ece2'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#f7f1e3'; g.font = 'bold 78px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WESTFIELD HIGH SCHOOL', w / 2, h / 2 + 4);
  });
  const band = mk(new THREE.PlaneGeometry(13, 1.6), new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.7 }), root, 0, 5.25, -11.93); band.castShadow = false;
  const clockTex = textTex(128, 128, (g, w) => {
    g.fillStyle = '#f7f3ea'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#2b2b2b'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#2b2b2b'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); }
    g.lineWidth = 7; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 34 * Math.sin(-0.5), 64 - 34 * Math.cos(-0.5)); g.stroke();   // ~7:55
    g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 50 * Math.sin(5.76), 64 - 50 * Math.cos(5.76)); g.stroke();
  });
  const clock = mk(new THREE.CircleGeometry(0.75, 28), new THREE.MeshBasicMaterial({ map: clockTex }), root, 0, 7.15, -11.92); clock.castShadow = false;
  // bushes along the facade
  const bushM = mat(0x3f7f3a, 0.95), bushL = mat(0x4f9445, 0.95);
  for (let x = -22.5; x <= 22.5; x += 1.5) {
    if (Math.abs(x) < 5.2) continue;
    const b = mk(new THREE.IcosahedronGeometry(0.75 + R() * 0.25, 0), R() < 0.5 ? bushM : bushL, root, x, 0.45, -11.1 + R() * 0.3); b.scale.y = 0.8;
  }

  // ---------------------------------------------------------------- flagpole (waving flag), marquee sign, benches, bike rack, lamps
  const [fx, fz] = DIMS.flag, FH = DIMS.flagH;
  const steel = mat(0xd5d8dc, 0.35, { metalness: 0.6 });
  mk(new THREE.CylinderGeometry(0.06, 0.1, FH, 10), steel, root, fx, FH / 2, fz);
  mk(new THREE.SphereGeometry(0.14, 10, 8), mat(0xe2b23c, 0.3, { metalness: 0.7 }), root, fx, FH + 0.1, fz);
  box(1.6, 0.25, 1.6, conc(1, 1), fx, 0.12, fz);
  const flagTex = canvasTex(256, 150, (g, w, h) => {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f6f3ee' : '#b8313a'; g.fillRect(0, (i * h) / 13, w, h / 13 + 1); }
    g.fillStyle = '#2c3e78'; g.fillRect(0, 0, w * 0.42, (h * 7) / 13);
    g.fillStyle = '#f6f3ee'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) g.fillRect(8 + c * 17 + (r % 2) * 8, 8 + r * 14, 4, 4);
  });
  const flagGeo = new THREE.PlaneGeometry(2.4, 1.4, 16, 4), flagBase = flagGeo.attributes.position.array.slice();
  const flag = mk(flagGeo, new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.8 }), root, fx + 1.25, FH - 0.85, fz);
  const [mx, mz] = DIMS.marquee;
  for (const s of [-1, 1]) box(0.25, 2.2, 0.25, mat(0x6b6f75, 0.6), mx + s * 1.9, 1.1, mz);
  box(4.4, 0.5, 0.5, mat(0x21493c, 0.6), mx, 2.75, mz);
  const marqTex = textTex(512, 256, (g, w, h) => {
    g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#21493c'; g.fillRect(0, 0, w, 64);
    g.fillStyle = '#f7f1e3'; g.font = 'bold 42px Georgia, serif'; g.textAlign = 'center'; g.fillText('WESTFIELD HIGH', w / 2, 47);
    g.fillStyle = '#1e1e1e'; g.font = 'bold 50px Helvetica, Arial, sans-serif'; g.fillText('FINALS WEEK', w / 2, 134); g.fillText('GOOD LUCK!', w / 2, 204);
  });
  const marq = mk(new THREE.BoxGeometry(3.6, 1.8, 0.3), [mat(0x6b6f75), mat(0x6b6f75), mat(0x6b6f75), mat(0x6b6f75), new THREE.MeshStandardMaterial({ map: marqTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: marqTex, emissiveIntensity: 0.15 }), mat(0x6b6f75)], root, mx, 1.6, mz);
  const wood = mat(0x9a6a3f, 0.8), iron = mat(0x2f3338, 0.5);
  for (const [bx, bz] of DIMS.benches) {
    box(1.8, 0.07, 0.45, wood, bx, 0.45, bz); box(1.8, 0.4, 0.06, wood, bx, 0.72, bz - 0.22);
    for (const s of [-1, 1]) box(0.06, 0.45, 0.45, iron, bx + s * 0.8, 0.22, bz);
  }
  for (let i = 0; i < 6; i++) { const x = -8.6 + i * 0.5; mk(new THREE.TorusGeometry(0.32, 0.03, 6, 14, Math.PI), iron, root, x, 0.02, -9.4).rotation.y = Math.PI / 2; }
  const lampM = mat(0x2f3338, 0.5), bulb = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
  for (let x = -60; x <= 60; x += 15) {
    if (Math.abs(x) < 3 || (x > 8 && x < 36)) continue;
    mk(new THREE.CylinderGeometry(0.06, 0.08, 4.4, 8), lampM, root, x, 2.2, 5.6);
    mk(new THREE.BoxGeometry(0.3, 0.3, 0.3), bulb, root, x, 4.5, 5.6).castShadow = false;
  }
  mk(new THREE.CylinderGeometry(0.28, 0.25, 0.85, 12), mat(0x2f6b4f, 0.7), root, -4.6, 0.55, 4.2);    // trash can

  // ---------------------------------------------------------------- trees (lawn + street), houses across the street, hills, clouds
  const trunkM = mat(0x7a5434, 0.9), leafA = mat(0x4f9a3e, 0.95), leafB = mat(0x3f8434, 0.95), leafC = mat(0x66ad49, 0.95);
  const trees = [];
  function tree(x, z, s = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); root.add(g);
    mk(new THREE.CylinderGeometry(0.16, 0.22, 2.4, 7), trunkM, g, 0, 1.2, 0);
    const L = [leafA, leafB, leafC][Math.floor(R() * 3)];
    mk(new THREE.IcosahedronGeometry(1.6, 0), L, g, 0, 3.3, 0); mk(new THREE.IcosahedronGeometry(1.15, 0), L, g, 0.7, 4.2, 0.2);
    trees.push(g); return g;
  }
  for (const [x, z, s] of [[-20, -3, 1.2], [-15.5, -7.5, 1], [-21, 1.5, 0.9], [9.2, -9.5, 1.1], [9.5, 0.5, 0.95], [36, -4, 1.2], [37, -12, 1]]) tree(x, z, s);
  for (let x = -70; x <= 70; x += 11) if (Math.abs(x - 4) > 6) tree(x + R() * 2, 14.6, 0.85 + R() * 0.25);
  const houseCols = [0xe9c9a3, 0xa9c4c9, 0xefe0b8, 0xc9d6a8, 0xe6b8b8, 0x9fb6d6, 0xd9b38c];
  const houses = [];
  for (let i = 0, x = -84; x < 84; x += 14, i++) {
    const g = new THREE.Group(); g.position.set(x + R() * 2, 0, 25 + R() * 3); root.add(g); houses.push(g);
    const w = 8 + R() * 2, h = 3.4 + R() * 1.6;
    mk(new THREE.BoxGeometry(w, h, 7), mat(houseCols[i % houseCols.length], 0.9), g, 0, h / 2, 0);
    const roof = mk(new THREE.ConeGeometry(w * 0.72, 2.6, 4), mat(i % 2 ? 0x7c4a3a : 0x55606e, 0.85), g, 0, h + 1.3, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.75);
    for (const s of [-1, 1]) box(1.1, 1.0, 0.06, mat(0x3c5f86, 0.3), s * 2.2, 1.7, -3.52, g);
    box(1.0, 2.0, 0.06, mat(0x6b4a33, 0.7), 0, 1.0, -3.52, g);
    // picket fence
    for (let k = -w / 2; k <= w / 2; k += 0.5) box(0.08, 0.8, 0.05, mat(0xf3efe6, 0.8), k, 0.4, -5.2, g);
  }
  const hillM = [mat(0x6f9a6a, 1), mat(0x7ea877, 1), mat(0x5f8a64, 1)];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + R() * 0.2, r = 300 + R() * 120, hh = 30 + R() * 50;
    const hill = mk(new THREE.ConeGeometry(70 + R() * 50, hh, 7), hillM[i % 3], root, Math.cos(a) * r, hh / 2 - 2, Math.sin(a) * r - 40); hill.castShadow = false;
  }
  const cloudM = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xe8eef6, emissiveIntensity: 0.55 });
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group(); const a = R() * Math.PI * 2, r = 160 + R() * 200; g.position.set(Math.cos(a) * r, 70 + R() * 50, Math.sin(a) * r); root.add(g);
    for (let k = 0; k < 4; k++) { const c = mk(new THREE.IcosahedronGeometry(8 + R() * 6, 1), cloudM, g, (k - 1.5) * 9, R() * 3, R() * 4); c.scale.y = 0.55; c.castShadow = false; }
  }

  // ---------------------------------------------------------------- cars in the lot, the school bus at the curb, a car on the road
  const carCols = [0xc9503f, 0x3d6fb4, 0xe8e4da, 0x2f2f33, 0x6aa36f, 0xe3a33a];
  const cars = DIMS.cars.map(([x, z], i) => { const c = makeCar(carCols[i % carCols.length], 11 + i); c.g.position.set(x, 0.02, z); c.g.rotation.y = Math.PI; root.add(c.g); return c; });
  const bus = makeBus({ color: 0xf2b705, stripe: 0x1d1d1d, sign: 'WESTFIELD' });
  bus.g.position.set(DIMS.bus[0], 0.01, DIMS.bus[1]); bus.g.rotation.y = -Math.PI / 2; root.add(bus.g);
  const busTex = textTex(1024, 128, (g, w, h) => { g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d1d1d'; g.font = 'bold 86px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SCHOOL BUS', w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) {
    const p = mk(new THREE.PlaneGeometry(6.4, 0.6), new THREE.MeshStandardMaterial({ map: busTex, roughness: 0.6 }), bus.body, s * (bus.W / 2 + 0.012), 0.6, 0);
    p.rotation.y = s * Math.PI / 2; p.castShadow = false;
  }

  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  sky.receiveShadow = false; ground.castShadow = false;
  function update(t) {
    const p = flagGeo.attributes.position, a = p.array;
    for (let i = 0; i < p.count; i++) {
      const x0 = flagBase[i * 3], y0 = flagBase[i * 3 + 1], u = (x0 + 1.2) / 2.4;
      a[i * 3 + 2] = Math.sin(t * 5.2 - u * 5.5) * 0.16 * u + Math.sin(t * 3.1 - u * 3) * 0.05 * u;
      a[i * 3 + 1] = y0 - u * u * 0.05;
    }
    p.needsUpdate = true; flagGeo.computeVertexNormals();
  }
  return { root, D: DIMS, fog, lights: { hemi, sun }, aimSun, update, cars, bus, flag, trees, houses, building: bld, marquee: marq, sky };
}
