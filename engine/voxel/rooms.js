// Voxel style (059): interiors. Each builder returns its own root (park it at an offset, show one set per shot), its own
// lights (hemi + a window sun + a ceiling bounce) and a painted outside view behind real window openings.
//   const C = buildVoxClassroom(studio);   C.root, C.D = {w, d, h, board, teacher, printer, door, windows:[…], desks:[[x,z]…]}
//   C.setBoard(lines)                        chalkboard text (big pixel letters)
//   const B = buildVoxBedroom(studio);      B.root, B.D = {bed, desk, window, door}
// Room local frame: floor at y = 0, the camera side is +z (no front wall: film cheat, like a sitcom set), back wall at z = 0.
import * as THREE from 'three';
import { VoxGrid, meshGrid, boxModel, colorBlock } from './vox.js';
import { voxDesk, voxPrinter, textCanvas } from './props.js';
import { pixelCanvas, nearestTex, shade, tileTexture } from './tex.js';
import { voxTree } from './world.js';

function roomLights(root, { sun = [3, 6, -6], target = [0, 0, 2], hemi = 1.15, sunI = 1.5, half = 9 } = {}) {
  const H = new THREE.HemisphereLight(0xfdf6ea, 0x9a8c78, hemi); root.add(H);
  const S = new THREE.DirectionalLight(0xfff1dc, sunI); S.position.set(...sun); S.target.position.set(...target); S.castShadow = true;
  S.shadow.mapSize.set(2048, 2048); Object.assign(S.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 0.1, far: 40 }); S.shadow.bias = -0.0005; S.shadow.normalBias = 0.02;
  root.add(S, S.target);
  return { hemi: H, sun: S };
}
/** a painted outside view (sky, hills, a lawn, block trees) on a big plane */
function outsideView(w = 64, h = 36, { ground = '#6cbf45' } = {}) {
  const c = pixelCanvas(128, 72, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 72); gr.addColorStop(0, '#4f8fe8'); gr.addColorStop(0.62, '#a9d0f7'); gr.addColorStop(0.62, '#7cc552'); gr.addColorStop(1, ground);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 72);
    g.fillStyle = '#f7fbff'; for (const [x, y, ww] of [[10, 10, 18], [44, 6, 12], [80, 13, 22], [104, 8, 10]]) { g.fillRect(x, y, ww, 4); g.fillRect(x + 3, y - 2, ww - 6, 2); }
    g.fillStyle = '#5aa04a'; for (let x = 0; x < 128; x += 6) g.fillRect(x, 40 - ((x * 7) % 5), 5, 5 + ((x * 7) % 5));
    g.fillStyle = '#3f8a34'; for (let x = 3; x < 128; x += 11) { g.fillRect(x, 36, 6, 6); g.fillStyle = '#6b4a2c'; g.fillRect(x + 2, 42, 2, 3); g.fillStyle = '#3f8a34'; }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: nearestTex(c), fog: false }));
  return m;
}
/** a window opening helper: frame boxes around a hole (wall plane z = wz, facing +z), glass pane */
function windowFrame(parent, x, y, w, h, wz, color = 0xf3f1ec) {
  const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color });
  const bar = (bw, bh, bx, by) => { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.16), m); b.position.set(bx, by, wz + 0.04); b.castShadow = true; g.add(b); };
  bar(w + 0.2, 0.12, x, y - h / 2); bar(w + 0.2, 0.12, x, y + h / 2); bar(0.12, h, x - w / 2, y); bar(0.12, h, x + w / 2, y); bar(0.08, h, x, y); bar(w, 0.08, x, y);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.12, depthWrite: false }));
  pane.position.set(x, y, wz); g.add(pane);
  parent.add(g); return g;
}

export function buildVoxClassroom(studio, opts = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const Wd = opts.w ?? 12, Dp = opts.d ?? 9, Hh = opts.h ?? 4;           // x from −Wd/2, z from 0 (back) to Dp (camera side)
  const G = new VoxGrid(), x0 = -Wd / 2, x1 = Wd / 2 - 1;
  G.fill(x0 - 1, -1, -1, x1 + 1, -1, Dp + 2, 'floor_tile');
  G.fill(x0 - 1, 0, -1, x1 + 1, Hh, -1, 'plaster_cream');                  // back wall (the chalkboard wall)
  G.fill(x0 - 1, 0, -1, x0 - 1, Hh, Dp + 2, 'plaster_cream');              // left wall (door)
  G.fill(x1 + 1, 0, -1, x1 + 1, Hh, Dp + 2, 'plaster_cream');              // right wall: windows
  G.fill(x0 - 1, Hh + 1, -1, x1 + 1, Hh + 1, Dp + 2, 'plaster');           // ceiling
  G.fill(x0 - 1, 0, -1, x1 + 1, 0, -1, 'planks_dark');                     // baseboard row
  // window openings in the right wall (x = x1 + 1): z 1..2, 4..5, 7..8 at y 1..2
  const wins = [];
  for (const z of [1, 4, 7]) { G.fill(x1 + 1, 1, z, x1 + 1, 2, z + 1, null); wins.push(z + 1); }
  G.fill(x0 - 1, 0, 6, x0 - 1, 1, 6, 'door'); G.set(x0 - 1, 2, 6, null);
  G.fill(x0, 0, -1 + 1, x0, 1, 0, 'bookshelf');                             // shelves in the back-left corner
  const mesh = meshGrid(G, { bs: 1, ao: true }); root.add(mesh);
  // door blocks drawn on the inside face: a door canvas over the left wall
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.4), new THREE.MeshLambertMaterial({ map: nearestTex(pixelCanvas(16, 38, (g) => { g.fillStyle = '#8a5a33'; g.fillRect(0, 0, 16, 38); g.fillStyle = '#9fd2f2'; g.fillRect(4, 4, 8, 10); g.fillStyle = '#f2c53d'; g.fillRect(12, 20, 2, 2); g.fillStyle = '#6b4325'; g.fillRect(0, 0, 1, 38); g.fillRect(15, 0, 1, 38); })) }));
  doorM.rotation.y = Math.PI / 2; doorM.position.set(x0 + 0.01, 1.2, 6.5); root.add(doorM);
  for (const z of wins) windowFrame(root, 0, 2, 2, 2, 0).position.set(0, 0, 0);
  root.children.filter((c) => c.isGroup && c !== mesh).forEach((g, i) => { if (i < wins.length) { g.rotation.y = -Math.PI / 2; g.position.set(x1 + 1, 0, wins[i]); } });
  const view = outsideView(80, 45); view.rotation.y = -Math.PI / 2; view.position.set(x1 + 30, 6, Dp / 2); root.add(view);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ map: tileTexture('grass_top', [3000, 3000]) }));
  lawn.rotation.x = -Math.PI / 2; lawn.position.set(x1 + 1502, -0.05, Dp / 2); lawn.receiveShadow = true; root.add(lawn);   // real ground outside the windows
  // chalkboard on the back wall
  let boardMesh = null;
  function setBoard(lines, o = {}) {
    const c = textCanvas(lines, { w: 192, h: 72, bg: '#2f5e46', fg: '#eef3ea', font: o.font ?? 'bold 13px monospace', border: '#8a5a33', lh: o.lh });
    if (!boardMesh) { boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.4), new THREE.MeshLambertMaterial({ map: nearestTex(c) })); boardMesh.position.set(-0.5, 2.2, 0.02); root.add(boardMesh); }
    else { boardMesh.material.map.dispose(); boardMesh.material.map = nearestTex(c); boardMesh.material.needsUpdate = true; }
  }
  setBoard(opts.board ?? ['BIOLOGY  ·  ROOM 4', 'CELL DIVISION + GENETICS', 'HOMEWORK DUE 8:00']);
  // clock + posters
  const clockC = pixelCanvas(24, 24, (g) => { g.fillStyle = '#f3f1ec'; g.beginPath(); g.arc(12, 12, 11, 0, 7); g.fill(); g.strokeStyle = '#26282c'; g.lineWidth = 2; g.beginPath(); g.arc(12, 12, 11, 0, 7); g.stroke(); g.fillStyle = '#26282c'; g.fillRect(11, 5, 2, 8); g.fillRect(11, 11, 6, 2); });
  const clock = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshLambertMaterial({ map: nearestTex(clockC), transparent: true, alphaTest: 0.5 })); clock.position.set(3.4, 3.4, 0.02); root.add(clock);
  const poster = (draw, w, h, x, y, z = 0.02, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: nearestTex(pixelCanvas(32, Math.round(32 * h / w), draw)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  poster((g) => { g.fillStyle = '#f3e7c8'; g.fillRect(0, 0, 32, 40); g.fillStyle = '#56b04a'; g.beginPath(); g.ellipse(16, 20, 13, 15, 0, 0, 7); g.fill(); g.fillStyle = '#8a55c9'; g.beginPath(); g.arc(16, 20, 5, 0, 7); g.fill(); g.fillStyle = '#f08a35'; g.fillRect(7, 12, 4, 2); g.fillRect(21, 27, 4, 2); g.fillStyle = '#26282c'; g.font = 'bold 6px monospace'; g.fillText('THE CELL', 3, 38); }, 1.1, 1.4, 4.6, 2.2);
  poster((g) => { g.fillStyle = '#cfe0f2'; g.fillRect(0, 0, 32, 40); g.fillStyle = '#d8413a'; for (let i = 0; i < 4; i++) { g.fillRect(4 + i * 7, 8 + (i % 2) * 14, 5, 12); g.fillStyle = i % 2 ? '#d8413a' : '#3c6fd8'; } g.fillStyle = '#26282c'; g.font = 'bold 6px monospace'; g.fillText('DNA', 10, 38); }, 1.0, 1.25, -5.0 + 0.0, 2.3, 0.02);
  // desks: 3 rows × 4, facing the board (−z): voxDesk faces +z, so turn them around
  const desks = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const d = voxDesk({ chair: [0x3c6fd8, 0xd8413a, 0x56b04a, 0xf2c53d][(r + c) % 4] }); d.rotation.y = Math.PI; d.position.set(-4.2 + c * 2.6, 0, 3.6 + r * 1.9); root.add(d); desks.push([d.position.x, d.position.z]);
  }
  // teacher's desk + printer on a side cart
  const tdesk = boxModel([[-10, 0, -4, 9, 6, 3, 0x8a5a33], [-10, 6, -4, 9, 6, 3, 0xc89b62], [-10, 0, 4, 9, 5, 4, 0x6d4a2c]], { bs: 0.1 }); tdesk.position.set(-3.6, 0, 1.6); root.add(tdesk);
  const apple = boxModel([[0, 0, 0, 1, 1, 1, 0xd8413a], [1, 2, 1, 1, 2, 1, 0x56b04a]], { bs: 0.05 }); apple.position.set(-2.6, 0.7, 1.4); root.add(apple);
  const cart = boxModel([[-3, 0, -3, 3, 6, 3, 0x6b6f78], [-4, 7, -4, 4, 7, 4, 0xc3c7cc]], { bs: 0.1 }); cart.position.set(4.4, 0, 1.4); root.add(cart);
  const printer = voxPrinter({ bs: 1 / 14 }); printer.position.set(4.4, 0.8, 1.4); printer.rotation.y = -0.35; root.add(printer);
  const plant = voxTree(1); plant.scale.setScalar(0.18); plant.position.set(-5.3, 0, 8.6); root.add(plant);
  const L = roomLights(root, { sun: [12, 9, 5], target: [0, 0, 4], sunI: 1.6 });
  const fill = new THREE.PointLight(0xfff4e0, 6, 14, 1.6); fill.position.set(0, Hh - 0.3, 5); root.add(fill);
  const D = { w: Wd, d: Dp, h: Hh, x0, x1: x1 + 1, board: [-0.5, 2.2, 0], teacher: [-2.2, 2.6], printer: [4.4, 0.8 + 0.4, 1.4], door: [x0, 6.5], windows: wins.map((z) => [x1 + 1, 2, z]), desks };
  return { root, D, setBoard, printer, clock, lights: L, fill, view, lawn };
}

export function buildVoxBedroom(studio, opts = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const Wd = 7, Dp = 6, Hh = 3, x0 = -3, x1 = 3;
  const G = new VoxGrid();
  G.fill(x0 - 1, -1, -1, x1 + 1, -1, Dp + 1, 'planks');
  G.fill(x0 - 1, 0, -1, x1 + 1, Hh, -1, opts.wall ?? 'wallpaper_blue');
  G.fill(x0 - 1, 0, -1, x0 - 1, Hh, Dp + 1, opts.wall ?? 'wallpaper_blue');
  G.fill(x1 + 1, 0, -1, x1 + 1, Hh, Dp + 1, opts.wall ?? 'wallpaper_blue');
  G.fill(x0 - 1, Hh + 1, -1, x1 + 1, Hh + 1, Dp + 1, 'plaster');
  G.fill(x0 - 1, 0, -1, x1 + 1, 0, -1, 'planks_dark');
  G.fill(1, 1, -1, 2, 2, -1, null);                                        // window opening in the back wall
  G.fill(-1, -1, 1, 1, -1, 3, 'carpet_red');                               // rug (a block row in the floor)
  G.fill(x1, 0, 4, x1, 1, 5, 'bookshelf');
  const mesh = meshGrid(G, { bs: 1 }); root.add(mesh);
  windowFrame(root, 2, 2, 2, 2, -0.02);
  const view = outsideView(60, 34); view.position.set(2, 3, -24); root.add(view);
  // bed (head against the back wall, left), desk + chair + lamp + laptop on the right
  const bed = boxModel([[0, 0, 0, 15, 3, 19, 0x6d4a2c], [1, 4, 1, 14, 4, 18, 0xf3f1ec], [1, 5, 6, 14, 5, 18, 0x3c6fd8], [2, 5, 1, 13, 6, 4, 0xf3f1ec], [0, 0, 0, 15, 8, 0, 0x6d4a2c]], { bs: 0.125 });
  bed.position.set(-3, 0, 0.01); root.add(bed);
  const desk = boxModel([[0, 6, 0, 11, 6, 5, 0xc89b62], [0, 0, 0, 0, 5, 0, 0x6b6f78], [11, 0, 0, 11, 5, 0, 0x6b6f78], [0, 0, 5, 0, 5, 5, 0x6b6f78], [11, 0, 5, 11, 5, 5, 0x6b6f78], [9, 7, 1, 9, 10, 1, 0x26282c], [8, 11, 0, 10, 11, 2, 0xf2c53d]], { bs: 0.125 });
  desk.position.set(1.4, 0, 0.02); root.add(desk);
  const chair = boxModel([[0, 3, 0, 4, 3, 4, 0xd8413a], [0, 4, 4, 4, 8, 4, 0xd8413a], [2, 0, 2, 2, 2, 2, 0x26282c]], { bs: 0.125 }); chair.position.set(1.85, 0, 0.9); root.add(chair);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), new THREE.MeshLambertMaterial({ map: nearestTex(pixelCanvas(16, 22, (g) => { g.fillStyle = '#26282c'; g.fillRect(0, 0, 16, 22); g.fillStyle = '#f2c53d'; g.fillRect(3, 4, 10, 10); g.fillStyle = '#d8413a'; g.fillRect(5, 6, 6, 6); g.fillStyle = '#f3f1ec'; g.fillRect(3, 17, 10, 2); })) }));
  poster.position.set(-1.0, 1.9, 0.02); root.add(poster);
  const L = roomLights(root, { sun: [3, 6, -8], target: [0, 0, 2], sunI: 1.3, half: 7 });
  const fill = new THREE.PointLight(0xfff0d8, 4, 10, 1.6); fill.position.set(0, Hh - 0.3, 3); root.add(fill);
  return { root, D: { w: Wd, d: Dp, h: Hh, bed: [-2, 0.6, 1.2], desk: [2.1, 0.8, -0.6], window: [2, 2, -1], door: [x0, 4] }, lights: L, fill };
}
