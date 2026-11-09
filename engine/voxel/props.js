// Voxel style (059): small props as colour-voxel models (boxModel at a fine block size) and pixel items (itemFromCanvas).
// Each returns a THREE.Group whose origin is on the ground at the prop's centre (unless noted); scale it freely.
import * as THREE from 'three';
import { boxModel, itemFromCanvas, VoxGrid, meshGrid, colorBlock } from './vox.js';
import { shade, pixelCanvas, nearestTex } from './tex.js';

const wrap = (m, ox = 0, oy = 0, oz = 0) => { const g = new THREE.Group(); m.position.set(ox, oy, oz); g.add(m); return g; };

/** a toy car, 4.5 m long along x (bs 0.25): body colour; .body (crushable: scale.y), .setCrush(k) */
export function voxCar(color = 0xd8413a, { seed = 1, bs = 0.25 } = {}) {
  const c = color, d = shade(color, -0.2), gl = 0x9fd2f2, t = 0x26282c, w = 0xd8d8d8;
  const m = boxModel([
    [-9, 1, -4, 8, 3, 3, c], [-5, 4, -4, 4, 6, 3, c], [-4, 4, -4, 3, 5, -4, gl], [-4, 4, 3, 3, 5, 3, gl], [5, 4, -3, 5, 5, 2, gl], [-6, 4, -3, -6, 5, 2, gl],
    [-9, 1, -4, -9, 2, 3, d], [8, 2, -3, 8, 2, -2, 0xfff2b0], [8, 2, 1, 8, 2, 2, 0xfff2b0], [-9, 2, -3, -9, 2, -2, 0xe04040], [-9, 2, 1, -9, 2, 2, 0xe04040],
    [-7, 0, -4, -5, 1, -4, t], [4, 0, -4, 6, 1, -4, t], [-7, 0, 3, -5, 1, 3, t], [4, 0, 3, 6, 1, 3, t],
    [-6, 0, -4, -6, 0, -4, w], [5, 0, -4, 5, 0, -4, w], [-6, 0, 3, -6, 0, 3, w], [5, 0, 3, 5, 0, 3, w],
  ], { bs });
  const g = new THREE.Group(), body = new THREE.Group(); body.add(m); g.add(body);
  g.userData = { body, len: 18 * bs };
  g.setCrush = (k) => { body.scale.set(1 + 0.12 * k, Math.max(0.12, 1 - 0.85 * k), 1 + 0.25 * k); };
  return g;
}
/** a yellow school bus, 10 m long along x */
export function voxBus({ bs = 0.25 } = {}) {
  const Y = 0xf2b51d, D = 0x26282c, G = 0x9fd2f2;
  const boxes = [[-20, 1, -5, 19, 11, 4, Y], [-20, 1, -5, 19, 2, 4, D], [-24, 1, -5, -21, 6, 4, Y], [-25, 2, -4, -25, 4, 3, D], [-23, 7, -4, -21, 9, 3, G]];
  for (let x = -18; x <= 16; x += 4) { boxes.push([x, 7, -5, x + 2, 9, -5, G]); boxes.push([x, 7, 4, x + 2, 9, 4, G]); }
  boxes.push([-20, 5, -5, 19, 5, -5, D], [-20, 5, 4, 19, 5, 4, D]);
  for (const x of [-20, 12]) for (const z of [-5, 4]) boxes.push([x, 0, z, x + 3, 2, z, D]);
  const m = boxModel(boxes, { bs }); const g = new THREE.Group(), body = new THREE.Group(); body.add(m); g.add(body);
  g.setCrush = (k) => body.scale.set(1 + 0.1 * k, Math.max(0.12, 1 - 0.85 * k), 1 + 0.2 * k);
  g.userData.body = body; return g;
}
/** street lamp, 5 m (bs 0.25): arm over +z */
export function voxLamp({ bs = 0.25, color = 0x3a3d44 } = {}) {
  return wrap(boxModel([[0, 0, 0, 0, 19, 0, color], [-1, 0, -1, 1, 1, 1, color], [0, 19, 0, 0, 19, 4, color], [-1, 18, 4, 1, 18, 6, color], [0, 17, 5, 0, 17, 5, 0xfff2b0]], { bs }), -0.5 * bs, 0, -0.5 * bs);
}
/** driveway basketball hoop facing +z, rim at 3.05 m (bs 0.25 → 12.2 blocks) */
export function voxHoop({ bs = 0.25 } = {}) {
  const P = 0x6b6f78, B = 0xf3f1ec, O = 0xe8762a;
  return wrap(boxModel([[0, 0, 0, 0, 14, 0, P], [0, 13, 0, 0, 13, 2, P], [-3, 11, 2, 3, 15, 2, B], [-1, 12, 3, 1, 12, 3, 0xd8413a], [-1, 12, 3, 1, 12, 5, O], [-1, 12, 5, 1, 12, 5, O]], { bs }), -0.5 * bs, 0, -0.5 * bs);
}
export function voxMailbox({ bs = 0.125, color = 0x3c6fd8 } = {}) {
  return wrap(boxModel([[0, 0, 0, 0, 7, 0, 0x7d5434], [-1, 8, -2, 1, 10, 2, color], [2, 9, 1, 2, 11, 1, 0xd8413a]], { bs }), -0.5 * bs, 0, -0.5 * bs);
}
export function voxHydrant({ bs = 0.125 } = {}) {
  return wrap(boxModel([[-1, 0, -1, 1, 5, 1, 0xd8413a], [-2, 3, 0, 2, 3, 0, 0xd8413a], [0, 6, 0, 0, 6, 0, 0xd8413a]], { bs }), -0.5 * bs, 0, -0.5 * bs);
}
export function voxBench({ bs = 0.125, color = 0x8a5a33 } = {}) {
  return wrap(boxModel([[-6, 3, -1, 5, 3, 1, color], [-6, 4, -2, 5, 6, -2, color], [-5, 0, 0, -5, 2, 0, 0x3a3d44], [4, 0, 0, 4, 2, 0, 0x3a3d44]], { bs }));
}
/** flag pole (bs 0.25, 9 m) with a flag that flies toward +x: .flag (set rotation for wave) */
export function voxFlagpole({ bs = 0.25, flag = null } = {}) {
  const g = wrap(boxModel([[0, 0, 0, 0, 35, 0, 0xd8d8d8], [-1, 0, -1, 1, 0, 1, 0x8b8e94], [0, 36, 0, 0, 36, 0, 0xf2c53d]], { bs }), -0.5 * bs, 0, -0.5 * bs);
  const tex = flag || nearestTex(pixelCanvas(24, 16, (c) => { c.fillStyle = '#3c6fd8'; c.fillRect(0, 0, 24, 16); c.fillStyle = '#f3f1ec'; c.fillRect(0, 6, 24, 4); c.fillStyle = '#f2c53d'; c.fillRect(3, 2, 4, 3); }));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6, 6, 1), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  f.geometry.translate(1.2, 0, 0); f.position.set(0.1, 8.2, 0); g.add(f); g.flag = f;
  g.wave = (t) => { const p = f.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(t * 5 - x * 2.2) * 0.12 * x); } p.needsUpdate = true; };
  return g;
}
/** a classroom desk + chair facing +z (bs 0.125) */
export function voxDesk({ bs = 0.125, top = 0xc89b62, frame = 0x6b6f78, chair = 0x3c6fd8 } = {}) {
  return wrap(boxModel([
    [-4, 5, -3, 3, 5, 2, top], [-4, 0, -3, -4, 4, -3, frame], [3, 0, -3, 3, 4, -3, frame], [-4, 0, 2, -4, 4, 2, frame], [3, 0, 2, 3, 4, 2, frame],
    [-3, 3, 4, 2, 3, 7, chair], [-3, 4, 8, 2, 7, 8, chair], [-3, 0, 4, -3, 2, 4, frame], [2, 0, 4, 2, 2, 4, frame], [-3, 0, 8, -3, 2, 8, frame], [2, 0, 8, 2, 2, 8, frame],
  ], { bs }), -0.5 * bs, 0, -0.5 * bs);
}
/** office printer (bs 1/16, ~0.5 m wide), output tray toward +z; .out = where printed pages land (local) */
export function voxPrinter({ bs = 1 / 16 } = {}) {
  const W = 0xe9e9e6, D = 0x4a4d52;
  const g = wrap(boxModel([[-4, 0, -3, 3, 5, 3, W], [-4, 6, -3, 3, 6, 1, D], [-3, 2, 4, 2, 2, 6, 0xd0d0cc], [2, 6, 2, 3, 6, 3, 0x56b04a], [-4, 4, 3, -4, 4, 3, D]], { bs }), -0.5 * bs, 0, -0.5 * bs);
  g.userData.out = new THREE.Vector3(-0.5 * bs, 3 * bs, 5 * bs);
  return g;
}
/** a wooden pencil (pixel item, ~0.19 m long along +y from its tip at y = 0 when not rotated) */
export function voxPencil({ bs = 1 / 80 } = {}) {
  const c = pixelCanvas(3, 15, (g) => {
    g.fillStyle = '#26282c'; g.fillRect(1, 14, 1, 1); g.fillStyle = '#e8c79a'; g.fillRect(0, 12, 3, 2);
    g.fillStyle = '#f2c53d'; g.fillRect(0, 2, 3, 10); g.fillStyle = '#d9a82a'; g.fillRect(2, 2, 1, 10);
    g.fillStyle = '#b8bcc4'; g.fillRect(0, 1, 3, 1); g.fillStyle = '#f09ab8'; g.fillRect(0, 0, 3, 1);
  });
  const m = itemFromCanvas(c, { bs: 0.19 / 15, depth: 3 }); m.position.z = -1.5 * 0.19 / 15;
  const g = new THREE.Group(); m.rotation.z = Math.PI; m.position.y = 15 * 0.19 / 15; g.add(m); return g;
}
/** a sheet of paper as a thin box (0.216 × 0.279 m) with a canvas texture on top; origin at its centre */
export function voxPaper(tex, { w = 0.216, h = 0.279, t = 0.002 } = {}) {
  const side = new THREE.MeshLambertMaterial({ color: 0xf3f1ea });
  const top = new THREE.MeshLambertMaterial({ map: tex });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, t, h), [side, side, top, side, side, side]);
  m.castShadow = true; m.receiveShadow = true; return m;
}
/** a chunky phone (0.075 × 0.155 m) with a screen texture (any canvas texture); the screen faces +z, origin at its centre */
export function voxPhone(tex, { case: col = 0x26282c, w = 0.078, h = 0.158, t = 0.011 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), new THREE.MeshLambertMaterial({ color: col })); body.castShadow = true; g.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.88, h * 0.9), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.z = t / 2 + 0.0006; g.add(scr);
  const cam = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, w * 0.3, 0.004), new THREE.MeshLambertMaterial({ color: 0x111114 })); cam.position.set(-w * 0.22, h * 0.36, -t / 2 - 0.002); g.add(cam);
  g.userData.screen = scr; return g;
}
/** a sign: a canvas plane on two posts (bs 0.125 posts); text canvas from the caller */
export function voxSign(canvas, { w = 3, h = 1.2, post = 2.0, color = 0x6b4a2c } = {}) {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), [0, 1, 2, 3].map(() => new THREE.MeshLambertMaterial({ color })).concat([new THREE.MeshLambertMaterial({ map: nearestTex(canvas) }), new THREE.MeshLambertMaterial({ color })]));
  board.position.y = post + h / 2; board.castShadow = true; g.add(board);
  for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, post, 0.14), new THREE.MeshLambertMaterial({ color })); p.position.set(x, post / 2, 0); p.castShadow = true; g.add(p); }
  return g;
}
/** big crisp text on a canvas (signs, banners, chalkboards): pixel font look via a small canvas scaled up NEAREST */
export function textCanvas(lines, { w = 256, h = 64, bg = '#f3f1ec', fg = '#26282c', font = 'bold 20px monospace', border = null, lh = null } = {}) {
  return pixelCanvas(w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (border) { g.strokeStyle = border; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    const L = Array.isArray(lines) ? lines : [lines], step = lh ?? h / (L.length + 0.4);
    L.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (L.length - 1) / 2) * step));
  });
}
export { meshGrid, VoxGrid, colorBlock };
