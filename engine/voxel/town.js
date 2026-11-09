// Voxel style (059): a blocky suburban town — one main street along x (asphalt + a dashed centre line, a zebra crossing),
// sidewalks, two rows of gabled houses with yards, hedges, trees, flower beds, driveways, lamp posts, mailboxes, parked toy
// cars, a driveway hoop, and (opts.school) a two-storey brick school with a clock tower, a front plaza, a flag and a bus.
// All blocks are 1 m; the ground surface is y = 0 (blocks at y = −1). One merged mesh for the grid + small voxel props.
//   const T = buildVoxTown(studio, { school: true });   // T.root, T.D (dims below), T.world (voxWorld: sky, lights, fog)
//   T.D.road = {z0: −4, z1: 4}, T.D.walkN = 6 (north sidewalk centre z), T.D.walkS = −6, T.D.houses[i] = {x, z, side, door:[x,z]},
//   T.D.school = {x0, x1, z0 (front), z1, roofY, door:[x, z], flag:[x, z], plaza}, T.cars[i] (setCrush), T.lamps, T.hoop, T.bus
//   T.setBanner(canvas | null) puts a canvas on the school roof (readable from above), T.update(t)
import * as THREE from 'three';
import { VoxGrid, meshGrid, colorBlock, hash3 } from './vox.js';
import { voxWorld, voxTree } from './world.js';
import { voxCar, voxBus, voxLamp, voxHoop, voxMailbox, voxHydrant, voxBench, voxFlagpole, textCanvas } from './props.js';
import { nearestTex, pixelCanvas } from './tex.js';

const SIDINGS = ['siding_white', 'siding_blue', 'siding_yellow', 'siding_mint', 'siding_pink', 'siding_gray', 'brick'];
const ROOFS = ['roof_red', 'roof_gray', 'roof_blue', 'roof_brown'];
const CAR_COLORS = [0xd8413a, 0x3c6fd8, 0xf2c53d, 0x56b04a, 0xf3f1ec, 0x26282c, 0xf08a35, 0x3fb8c8];

/** a gabled two-storey house into grid G; front wall at z = zf facing dir (−1: faces −z, +1: faces +z), x centred on cx */
export function stampHouse(G, cx, zf, dir, { w = 9, d = 8, siding = 'siding_white', roof = 'roof_red', seed = 1 } = {}) {
  const x0 = cx - Math.floor(w / 2), x1 = x0 + w - 1;
  const zb = zf - dir * (d - 1), za = Math.min(zf, zb), zz = Math.max(zf, zb);
  G.fill(x0, 0, za, x1, 5, zz, siding);
  G.fill(x0 + 1, 0, za + 1, x1 - 1, 5, zz - 1, null);                          // hollow (no interior faces to mesh)
  G.fill(x0 + 1, 2, za + 1, x1 - 1, 2, zz - 1, 'planks');                      // 2nd floor slab (seen through nothing, keeps it solid-looking)
  // windows: two per storey on the front + back, one per storey on the sides
  for (const z of [za, zz]) for (const x of [x0 + 1, x0 + 2, x1 - 2, x1 - 1]) { G.set(x, 1, z, 'window'); G.set(x, 4, z, 'window'); }
  for (const x of [x0, x1]) for (const z of [za + 3, zz - 3]) { G.set(x, 1, z, 'window'); G.set(x, 4, z, 'window'); }
  // door in the middle of the front + a step + a porch light block
  const dx = cx; G.set(dx, 0, zf, 'door'); G.set(dx, 1, zf, 'door_top'); G.set(dx, -1, zf + dir, 'cobble');
  G.set(dx + 1, 2, zf + dir, colorBlock(0xfff2b0));
  // gable roof along x: layers step in from front and back, 1 block overhang
  const depth = zz - za + 1, layers = Math.ceil(depth / 2) + 1;
  for (let k = 0; k < layers; k++) {
    const y = 6 + k, a = za - 1 + k, b = zz + 1 - k; if (a > b) break;
    G.fill(x0 - 1, y, a, x1 + 1, y, a, roof); G.fill(x0 - 1, y, b, x1 + 1, y, b, roof);
    if (b - a > 1) { G.fill(x0, y, a + 1, x0, y, b - 1, siding); G.fill(x1, y, a + 1, x1, y, b - 1, siding); }   // gable ends
    if (b - a <= 1) G.fill(x0 - 1, y, a, x1 + 1, y, b, roof);
  }
  // chimney
  const cxm = hash3(seed, 1, 2) < 0.5 ? x0 + 1 : x1 - 1;
  G.fill(cxm, 6, za + 2, cxm, 6 + layers, za + 2, 'brick');
  return { x0, x1, za, zz, door: [dx + 0.5, zf + (dir > 0 ? 1 : 0) + dir * 0.5] };
}

/** a tree into grid G (trunk h, crown radius r) */
export function stampTree(G, x, z, { h = 4, r = 2.4, leaf = 'leaves', seed = 1 } = {}) {
  G.fill(x, 0, z, x, h - 1, z, 'log');
  G.blob(x, h + 0.6, z, r, r * 0.85, r, leaf, 0.4, seed);
  G.set(x, h + Math.round(r * 0.85) + 1, z, leaf);
}

/** the school into grid G: front wall at z = zf (faces −z), x from x0 (width w), returns dims */
export function stampSchool(G, x0, zf, { w = 50, d = 16, h = 10 } = {}) {
  const x1 = x0 + w - 1, z1 = zf + d - 1, cx = x0 + Math.floor(w / 2);
  G.fill(x0, 0, zf, x1, h - 1, z1, 'brick_tan');
  G.fill(x0 + 1, 0, zf + 1, x1 - 1, h - 2, z1 - 1, null);
  G.fill(x0, h - 1, zf, x1, h - 1, z1, 'concrete');                         // flat roof
  G.walls(x0, h, zf, x1, h, z1, 'brick_tan');                               // parapet
  G.fill(x0, 4, zf, x1, 4, zf, 'concrete'); G.fill(x0, 4, z1, x1, 4, z1, 'concrete');   // floor band
  for (let x = x0 + 2; x <= x1 - 3; x += 4) for (const y of [1, 2, 6, 7]) for (const z of [zf, z1]) { G.set(x, y, z, 'window'); G.set(x + 1, y, z, 'window'); }
  // entrance block: protrudes 3 m, a clock tower up to h + 7
  const ex0 = cx - 5, ex1 = cx + 5, ez = zf - 3;
  G.fill(ex0, 0, ez, ex1, h + 1, zf, 'brick');
  G.fill(ex0 + 1, 0, ez + 1, ex1 - 1, h, zf - 1, null);
  G.fill(cx - 2, 0, ez, cx + 2, 2, ez, 'door_glass');
  G.fill(cx - 3, h + 2, ez + 1, cx + 3, h + 8, zf - 1, 'brick');
  G.fill(cx - 4, h + 9, ez, cx + 4, h + 9, zf, 'roof_gray'); G.fill(cx - 3, h + 10, ez + 1, cx + 3, h + 10, zf - 1, 'roof_gray'); G.fill(cx - 1, h + 11, ez + 2, cx + 1, h + 11, zf - 2, 'roof_gray');
  G.fill(cx - 6, 3, ez - 1, cx + 6, 3, ez - 1, 'concrete');                 // canopy over the door
  // steps
  G.fill(cx - 4, -1, ez - 3, cx + 4, -1, ez - 1, 'cobble');
  return { x0, x1, z0: zf, z1, cx, h, roofY: h, entrance: { x0: ex0, x1: ex1, z: ez }, door: [cx + 0.5, ez - 1.5], towerTop: h + 11, clock: [cx + 0.5, h + 5.5, ez + 0.98] };
}

export function buildVoxTown(studio, opts = {}) {
  const W = voxWorld(studio, { fogNear: 140, fogFar: 1100, ...(opts.world || {}) });
  const root = new THREE.Group(); W.root.add(root);
  const G = new VoxGrid();
  const X0 = opts.x0 ?? -130, X1 = opts.x1 ?? 130, Z0 = -42, Z1 = 42;
  // ground: grass everywhere, then road / sidewalks / plaza
  G.fill(X0, -1, Z0, X1, -1, Z1, 'grass');
  G.fill(X0, -1, -4, X1, -1, 4, 'asphalt');
  for (let x = X0; x <= X1; x++) if (((x % 6) + 6) % 6 < 3) G.set(x, -1, 0, 'road_line');
  G.fill(X0, -1, 5, X1, -1, 7, 'sidewalk'); G.fill(X0, -1, -7, X1, -1, -5, 'sidewalk');
  const D = { road: { z0: -4, z1: 4 }, walkN: 6, walkS: -6, houses: [], trees: [], x0: X0, x1: X1 };
  const school = opts.school ?? true;
  const SX0 = 62, SZ = 20;
  if (school) G.fill(56, -1, -4, 58, -1, 4, 'crosswalk');
  // side streets crossing at x = −60 (gives the grid a town feel)
  G.fill(-63, -1, Z0, -57, -1, Z1, 'asphalt'); G.fill(-64, -1, 5, -56, -1, 7, 'asphalt'); G.fill(-64, -1, -7, -56, -1, -5, 'asphalt');
  for (let z = Z0; z <= Z1; z++) if (Math.abs(z) > 8 && ((z % 6) + 6) % 6 < 3) G.set(-60, -1, z, 'road_line');
  G.fill(-66, -1, 8, -64, -1, Z1, 'sidewalk'); G.fill(-56, -1, 8, -54, -1, Z1, 'sidewalk'); G.fill(-66, -1, Z0, -64, -1, -8, 'sidewalk'); G.fill(-56, -1, Z0, -54, -1, -8, 'sidewalk');

  // houses: north side faces −z (front at z = 12), south side faces +z (front at z = −12)
  let k = 0;
  for (const side of [1, -1]) {
    for (let cx = X0 + 14; cx <= X1 - 10; cx += 15) {
      if (cx > -68 && cx < -50) continue;                                       // the side street
      if (school && side === 1 && cx > 48) continue;                            // the school lot
      const seed = k++ * 7 + 3;
      const siding = SIDINGS[Math.floor(hash3(cx, side, 1) * SIDINGS.length)], roof = ROOFS[Math.floor(hash3(cx, side, 2) * ROOFS.length)];
      const zf = side * 12, dir = -side;
      const H = stampHouse(G, cx, zf, dir, { siding, roof, seed });
      // path from the sidewalk to the door, a driveway, flower beds, hedges between lots, a tree in the yard
      for (let z = Math.min(zf + dir, side * 8); z <= Math.max(zf + dir, side * 8); z++) G.set(cx, -1, z, 'cobble');
      G.fill(cx + 6, -1, side * 8, cx + 8, -1, side * 22, 'concrete');
      const fl = ['flower_red', 'flower_yellow', 'flower_white', 'flower_blue'];
      for (let x = cx - 4; x <= cx + 4; x++) if (x !== cx && hash3(x, side, 9) < 0.7) { G.set(x, -1, zf + dir, 'dirt'); G.set(x, 0, zf + dir, fl[Math.floor(hash3(x, side, 8) * 4)]); }
      G.fill(cx - 7, 0, side * 8, cx - 7, 0, side * 24, 'hedge');
      if (hash3(cx, side, 3) < 0.75) { const tx = cx - 4 + Math.floor(hash3(cx, side, 4) * 3), tz = side * 9; stampTree(G, tx, tz, { h: 3 + Math.floor(hash3(cx, side, 5) * 2), r: 2.2, leaf: hash3(cx, side, 6) < 0.8 ? 'leaves' : 'leaves_b', seed }); D.trees.push([tx, tz]); }
      // tufts of grass in the lawn
      for (let i = 0; i < 6; i++) { const x = cx - 6 + Math.floor(hash3(i, cx, side) * 12), z = side * (8 + Math.floor(hash3(cx, i, side) * 3)); if (!G.get(x, 0, z) && G.get(x, -1, z) === G.get(X0, -1, Z0)) G.set(x, 0, z, 'tuft'); }
      D.houses.push({ x: cx, z: zf, side, dir, siding, door: H.door, drive: [cx + 7, side * 15] });
    }
  }
  // school
  if (school) {
    G.fill(SX0 - 6, -1, 8, SX0 + 50, -1, SZ - 1, 'concrete');
    G.fill(SX0 + 20, -1, 8, SX0 + 30, -1, SZ - 1, 'cobble');
    const S = stampSchool(G, SX0, SZ, {});
    for (const x of [SX0 - 4, SX0 + 48]) stampTree(G, x, 10, { h: 4, r: 2.6, seed: x });
    G.fill(SX0 - 6, 0, 8, SX0 - 6, 0, 40, 'hedge');
    D.school = { ...S, plaza: { x0: SX0 - 6, x1: SX0 + 50, z0: 8, z1: SZ - 1 }, flag: [SX0 + 12.5, 12.5] };
  }
  const mesh = meshGrid(G, { bs: 1 }); root.add(mesh);

  // ---- props
  const P = new THREE.Group(); root.add(P);
  const add = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; P.add(o); return o; };
  const lamps = [];
  for (let x = X0 + 8; x <= X1 - 4; x += 20) { lamps.push(add(voxLamp(), x + 0.5, 0, 7.6, Math.PI)); lamps.push(add(voxLamp(), x + 10.5, 0, -6.6, 0)); }
  const cars = [];
  D.houses.forEach((h, i) => {
    add(voxMailbox({ color: CAR_COLORS[i % CAR_COLORS.length] }), h.x - 2.5, 0, h.side * 7.6 + h.side * 0.4);
    if (hash3(i, 3, 3) < 0.55) { const c = add(voxCar(CAR_COLORS[(i * 3) % CAR_COLORS.length]), h.drive[0] + 0.5, 0, h.drive[1], Math.PI / 2); cars.push(c); }
  });
  // cars parked along the curb (north lane z ≈ 3, south z ≈ −3)
  for (let i = 0; i < 14; i++) { const x = X0 + 20 + i * 17 + Math.floor(hash3(i, 1, 1) * 5); if (school && x > 52 && x < 60) continue; if (x > -68 && x < -50) continue; const side = i % 2 ? 1 : -1; cars.push(add(voxCar(CAR_COLORS[i % CAR_COLORS.length]), x, 0, side * 3.1, side > 0 ? Math.PI : 0)); }
  const hoopHouse = D.houses.find((h) => h.side === 1 && h.x > -40) || D.houses[0];
  const hoop = add(voxHoop(), hoopHouse.drive[0] + 0.5, 0, hoopHouse.side * 21, hoopHouse.side > 0 ? Math.PI : 0);
  add(voxHydrant(), -40.5, 0, 7.8); add(voxHydrant(), 30.5, 0, -7.8);
  add(voxBench(), -20, 0, 7.6, Math.PI); add(voxBench(), 45, 0, -7.6, 0);
  let bus = null, flag = null, banner = null, clock = null;
  if (school) {
    const S = D.school;
    flag = add(voxFlagpole(), S.flag[0], 0, S.flag[1]);
    bus = add(voxBus(), S.cx - 12, 0, 3.0, Math.PI);
    // SCHOOL sign over the canopy + a clock face on the tower
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.25), new THREE.MeshLambertMaterial({ map: nearestTex(textCanvas('MAPLE HIGH SCHOOL', { w: 256, h: 32, bg: '#26282c', fg: '#f3f1ec', font: 'bold 22px monospace' })) }));
    sign.position.set(S.cx + 0.5, 6.1, S.entrance.z - 0.02); sign.rotation.y = Math.PI; P.add(sign);
    const cc = pixelCanvas(32, 32, (g) => { g.fillStyle = '#f3f1ec'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.fillStyle = '#26282c'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(Math.round(16 + Math.sin(a) * 12) - 1, Math.round(16 - Math.cos(a) * 12) - 1, 2, 2); } });
    clock = new THREE.Group(); clock.position.set(S.clock[0], S.clock[1], S.entrance.z + 1 - 0.03); clock.rotation.y = Math.PI; P.add(clock);
    clock.add(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshLambertMaterial({ map: nearestTex(cc), transparent: true, alphaTest: 0.5 })));
    const hand = (L, wdt) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wdt, L, 0.05), new THREE.MeshLambertMaterial({ color: 0x26282c })); m.geometry.translate(0, L / 2, 0.04); clock.add(m); return m; };
    clock.userData = { hr: hand(1.2, 0.28), mn: hand(1.8, 0.2) };
    clock.set = (h, m) => { clock.userData.hr.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; clock.userData.mn.rotation.z = -(m / 60) * Math.PI * 2; };
    clock.set(7, 55);
  }
  function setBanner(canvas, { w = 34, h = 11, x = null, z = null } = {}) {
    if (banner) { banner.parent.remove(banner); banner = null; }
    if (!canvas || !school) return null;
    const S = D.school;
    banner = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: nearestTex(canvas) }));
    banner.rotation.x = -Math.PI / 2; banner.rotation.z = Math.PI; banner.position.set(x ?? (S.x0 + S.x1 + 1) / 2, S.roofY + 0.04, z ?? (S.z0 + S.z1 + 1) / 2 + 1); P.add(banner);
    return banner;
  }
  return { root, world: W, grid: G, mesh, props: P, D, cars, lamps, hoop, bus, flag, clock, setBanner, update(t) { W.update(t); flag?.wave(t); } };
}
