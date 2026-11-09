// Voxel style (059): a block grid + a cheap mesher. Author a set or a prop as integer block cells, then turn the whole grid
// into ONE merged mesh (+ one for plants, one for water): hidden faces between solid blocks are culled, each visible corner
// gets baked ambient occlusion (the soft dark creases that make a block world read), faces get a fixed per-direction shade,
// and every face samples its 16 px tile from the shared atlas (tex.js). One draw call per grid.
//   const G = new VoxGrid();                       // sparse-free: grows to fit (block coords = world metres / bs)
//   G.fill(-5, 0, -5, 5, 0, 5, 'grass');            // inclusive boxes; blocks by name (tex.js BLOCKS) or id
//   G.set(0, 1, 0, colorBlock(0xd8413a));           // any colour = the 'plain' tile tinted
//   const m = meshGrid(G, { bs: 1 });               // THREE.Group (opaque + cross + water meshes), add it to a set root
// Props at a finer grain: the same grid with bs = 1/8 or 1/16 m (a car, a phone, a pencil). itemFromCanvas() extrudes a
// pixel sprite into a one-voxel-thick model (a held item).
import * as THREE from 'three';
import { blockAtlas, BLOCKS } from './tex.js';

// ---------------------------------------------------------------- block registry
const REG = [null];                         // id → {name, tiles:[+x,−x,+y,−y,+z,−z], opaque, cross, see, tint:[r,g,b] linear}
const BYNAME = new Map();
const _c = new THREE.Color();
function register(name, def, tint = 0xffffff) {
  const t = (k) => def[k] || def.side || def.all || 'plain';
  const top = def.top || def.all || 'plain', bottom = def.bottom || def.all || def.side || 'plain';
  _c.setHex(tint);
  const id = REG.length;
  REG.push({ name, tiles: [t('side'), t('side'), top, bottom, t('side'), t('side')], opaque: !def.cross && !def.see && !def.cut, cross: !!def.cross, see: !!def.see, tint: [_c.r, _c.g, _c.b] });
  BYNAME.set(name, id);
  return id;
}
/** Block id for a name in tex.js BLOCKS (registered on first use). */
export function blockId(name) {
  if (typeof name === 'number') return name;
  if (BYNAME.has(name)) return BYNAME.get(name);
  if (!BLOCKS[name]) throw new Error('voxel: unknown block ' + name);
  return register(name, BLOCKS[name]);
}
/** A colour block: the near-white 'plain' (or 'smooth') tile tinted by hex — any colour, cached. */
export function colorBlock(hex, tile = 'plain') {
  const key = `#${tile}:${hex}`;
  if (BYNAME.has(key)) return BYNAME.get(key);
  return register(key, { all: tile }, hex);
}
/** A tinted version of a named block (grass colour variants, darker bricks). */
export function tintBlock(name, hex) {
  const key = `${name}~${hex}`;
  if (BYNAME.has(key)) return BYNAME.get(key);
  return register(key, BLOCKS[name], hex);
}
export const blockInfo = (id) => REG[id];

// ---------------------------------------------------------------- the grid (grows to fit what you put in it)
export class VoxGrid {
  constructor() { this.cells = new Map(); this.min = [Infinity, Infinity, Infinity]; this.max = [-Infinity, -Infinity, -Infinity]; }
  static key(x, y, z) { return ((x + 4096) * 8192 + (y + 4096)) * 8192 + (z + 4096); }
  set(x, y, z, b) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    const k = VoxGrid.key(x, y, z);
    if (!b) { this.cells.delete(k); return; }
    this.cells.set(k, blockId(b));
    if (x < this.min[0]) this.min[0] = x; if (y < this.min[1]) this.min[1] = y; if (z < this.min[2]) this.min[2] = z;
    if (x > this.max[0]) this.max[0] = x; if (y > this.max[1]) this.max[1] = y; if (z > this.max[2]) this.max[2] = z;
  }
  get(x, y, z) { return this.cells.get(VoxGrid.key(x, y, z)) || 0; }
  /** inclusive box; b = 0/null clears. opts.ifEmpty keeps what's there. */
  fill(x0, y0, z0, x1, y1, z1, b, opts = {}) {
    const id = b ? blockId(b) : 0;
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) {
      if (opts.ifEmpty && this.get(x, y, z)) continue;
      this.set(x, y, z, id);
    }
  }
  /** the four walls of a box (no floor/ceiling) */
  walls(x0, y0, z0, x1, y1, z1, b) {
    this.fill(x0, y0, z0, x1, y1, z0, b); this.fill(x0, y0, z1, x1, y1, z1, b);
    this.fill(x0, y0, z0, x0, y1, z1, b); this.fill(x1, y0, z0, x1, y1, z1, b);
  }
  /** a blobby ellipsoid (tree crowns, bushes, clouds); jag (0..1) nibbles the surface with a seeded hash */
  blob(cx, cy, cz, rx, ry, rz, b, jag = 0, seed = 1, opts = {}) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
      if (d > 1) continue;
      if (jag && d > 0.55 && hash3(x, y, z, seed) < jag) continue;
      if (opts.ifEmpty && this.get(x, y, z)) continue;
      this.set(x, y, z, b);
    }
  }
  /** copy another grid in at an offset (stamping a prefab: a house, a tree) */
  stamp(src, ox, oy, oz, opts = {}) {
    for (const [k, id] of src.cells) {
      const z = (k % 8192) - 4096, y = (Math.floor(k / 8192) % 8192) - 4096, x = Math.floor(k / 8192 / 8192) - 4096;
      let X = x, Z = z;
      if (opts.flipZ) Z = -z; if (opts.flipX) X = -x;
      if (opts.rot === 1) [X, Z] = [Z, -X]; else if (opts.rot === 2) [X, Z] = [-X, -Z]; else if (opts.rot === 3) [X, Z] = [-Z, X];
      if (opts.ifEmpty && this.get(X + ox, y + oy, Z + oz)) continue;
      this.set(X + ox, y + oy, Z + oz, id);
    }
  }
  get count() { return this.cells.size; }
}
export function hash3(x, y, z, s = 1) { let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// ---------------------------------------------------------------- mesher
// faces: normal, U, V axes and the origin corner of the unit cell; corner(u, v) = o + u·U + v·V, U × V = normal (outward)
const FACES = [
  { n: [1, 0, 0], U: [0, 0, -1], V: [0, 1, 0], o: [1, 0, 1], shade: 0.86 },
  { n: [-1, 0, 0], U: [0, 0, 1], V: [0, 1, 0], o: [0, 0, 0], shade: 0.86 },
  { n: [0, 1, 0], U: [1, 0, 0], V: [0, 0, -1], o: [0, 1, 1], shade: 1.0 },
  { n: [0, -1, 0], U: [1, 0, 0], V: [0, 0, 1], o: [0, 0, 0], shade: 0.66 },
  { n: [0, 0, 1], U: [1, 0, 0], V: [0, 1, 0], o: [0, 0, 1], shade: 0.95 },
  { n: [0, 0, -1], U: [-1, 0, 0], V: [0, 1, 0], o: [1, 0, 0], shade: 0.95 },
];
const AO = [1.0, 0.8, 0.64, 0.5];

let _mat = null, _crossMat = null, _waterMat = null;
/** the shared materials (Lambert + atlas + baked vertex colours); voxMaterials().opaque etc. */
export function voxMaterials() {
  if (_mat) return { opaque: _mat, cross: _crossMat, water: _waterMat };
  const A = blockAtlas();
  _mat = new THREE.MeshLambertMaterial({ map: A.tex, vertexColors: true });
  _crossMat = new THREE.MeshLambertMaterial({ map: A.tex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });
  _waterMat = new THREE.MeshLambertMaterial({ map: A.tex, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false });
  return { opaque: _mat, cross: _crossMat, water: _waterMat };
}

/**
 * Mesh a grid. opts: bs (block size, m), ao (true), faceShade (true), material (override for the opaque mesh),
 * shadows (true), skipBottom (true: faces pointing down at y ≤ minY are dropped — the underside of the ground nobody sees).
 * Returns a Group with .userData.{opaque, cross, water} meshes (any may be null).
 */
export function meshGrid(G, opts = {}) {
  const bs = opts.bs ?? 1, useAO = opts.ao ?? true, useShade = opts.faceShade ?? true, A = blockAtlas();
  const skipBottomY = (opts.skipBottom ?? true) ? G.min[1] : -Infinity;
  const buf = { o: newBuf(), c: newBuf(), w: newBuf() };
  const solid = (x, y, z) => { const b = G.get(x, y, z); return b && REG[b].opaque ? 1 : 0; };
  const uvCache = new Map();
  const tileUV = (name) => { let r = uvCache.get(name); if (!r) uvCache.set(name, (r = A.uv(name))); return r; };
  for (const [k, id] of G.cells) {
    const z = (k % 8192) - 4096, y = (Math.floor(k / 8192) % 8192) - 4096, x = Math.floor(k / 8192 / 8192) - 4096;
    const B = REG[id];
    if (B.cross) { crossQuads(buf.c, x, y, z, bs, tileUV(B.tiles[0]), B.tint); continue; }
    const out = B.see ? buf.w : buf.o;
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2];
      const nb = G.get(nx, ny, nz);
      if (nb && (REG[nb].opaque || nb === id || (B.see && REG[nb].see))) continue;
      if (f === 3 && y <= skipBottomY) continue;
      const uv = tileUV(B.tiles[f]);
      const ao = [1, 1, 1, 1];
      if (useAO && !B.see) {
        let i = 0;
        for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
          const su = u ? 1 : -1, sv = v ? 1 : -1;
          const s1 = solid(nx + su * F.U[0], ny + su * F.U[1], nz + su * F.U[2]);
          const s2 = solid(nx + sv * F.V[0], ny + sv * F.V[1], nz + sv * F.V[2]);
          const cc = solid(nx + su * F.U[0] + sv * F.V[0], ny + su * F.U[1] + sv * F.V[1], nz + su * F.U[2] + sv * F.V[2]);
          ao[i++] = AO[s1 && s2 ? 3 : s1 + s2 + cc];
        }
      }
      quad(out, x, y, z, bs, F, uv, B.tint, useShade ? F.shade : 1, ao);
    }
  }
  const g = new THREE.Group(), M = voxMaterials();
  const mk = (b, m, sh) => { if (!b.pos.length) return null; const mesh = new THREE.Mesh(toGeo(b), m); mesh.castShadow = sh; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  const shadows = opts.shadows ?? true;
  g.userData.opaque = mk(buf.o, opts.material || M.opaque, shadows);
  g.userData.cross = mk(buf.c, M.cross, false);
  g.userData.water = mk(buf.w, M.water, false);
  if (g.userData.water) g.userData.water.renderOrder = 2;
  return g;
}
function newBuf() { return { pos: [], nor: [], uv: [], col: [], idx: [] }; }
function quad(b, x, y, z, bs, F, uv, tint, sh, ao) {
  const base = b.pos.length / 3;
  const C = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (let i = 0; i < 4; i++) {
    const [u, v] = C[i];
    b.pos.push((x + F.o[0] + u * F.U[0] + v * F.V[0]) * bs, (y + F.o[1] + u * F.U[1] + v * F.V[1]) * bs, (z + F.o[2] + u * F.U[2] + v * F.V[2]) * bs);
    b.nor.push(F.n[0], F.n[1], F.n[2]);
    b.uv.push(uv[0] + u * (uv[2] - uv[0]), uv[1] + v * (uv[3] - uv[1]));
    const k = sh * ao[i]; b.col.push(tint[0] * k, tint[1] * k, tint[2] * k);
  }
  if (ao[0] + ao[2] >= ao[1] + ao[3]) b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  else b.idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
}
function crossQuads(b, x, y, z, bs, uv, tint) {
  for (const [ax, az, bx, bz] of [[0.15, 0.15, 0.85, 0.85], [0.15, 0.85, 0.85, 0.15]]) {
    const base = b.pos.length / 3;
    for (const [px, py, pz, u, v] of [[ax, 0, az, 0, 0], [bx, 0, bz, 1, 0], [bx, 1, bz, 1, 1], [ax, 1, az, 0, 1]]) {
      b.pos.push((x + px) * bs, (y + py) * bs, (z + pz) * bs); b.nor.push(0, 1, 0);
      b.uv.push(uv[0] + u * (uv[2] - uv[0]), uv[1] + v * (uv[3] - uv[1])); b.col.push(tint[0], tint[1], tint[2]);
    }
    b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}
function toGeo(b) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
  g.setIndex(b.pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.idx, 1) : new THREE.Uint16BufferAttribute(b.idx, 1));
  g.computeBoundingSphere();
  return g;
}

// ---------------------------------------------------------------- props from pixels
/**
 * Extrude a pixel sprite into a voxel model (a held item, a sign): each opaque pixel = one colour block, `depth` voxels
 * thick. The model lies in the x/y plane, centred on x, bottom at y = 0, front facing +z. bs = metres per pixel.
 */
export function itemFromCanvas(canvas, { bs = 1 / 16, depth = 1, tile = 'smooth', ao = false } = {}) {
  const g = canvas.getContext('2d'), { width: w, height: h } = canvas, d = g.getImageData(0, 0, w, h).data, G = new VoxGrid();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (d[i + 3] < 128) continue;
    const id = colorBlock((d[i] << 16) | (d[i + 1] << 8) | d[i + 2], tile);
    for (let k = 0; k < depth; k++) G.set(x - Math.floor(w / 2), h - 1 - y, k, id);
  }
  const m = meshGrid(G, { bs, ao, faceShade: true, skipBottom: false });
  m.userData.grid = G; return m;
}

/** A colour-voxel model from a list of boxes [[x0,y0,z0,x1,y1,z1,hex], …] (inclusive, block units) at block size bs. */
export function boxModel(boxes, { bs = 1 / 8, ao = true, tile = 'plain' } = {}) {
  const G = new VoxGrid();
  for (const [x0, y0, z0, x1, y1, z1, c] of boxes) G.fill(x0, y0, z0, x1, y1, z1, typeof c === 'string' ? c : colorBlock(c, tile));
  const m = meshGrid(G, { bs, ao, skipBottom: false }); m.userData.grid = G; return m;
}

/** Many copies of one meshed model (trees, towers, clouds): an InstancedMesh per sub-mesh. items = [{x, y, z, s, r}] */
export function instanceModel(model, items, parent) {
  const out = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  model.traverse((o) => {
    if (!o.isMesh) return;
    const im = new THREE.InstancedMesh(o.geometry, o.material, items.length);
    items.forEach((it, i) => { q.setFromAxisAngle(up, it.r || 0); const sc = it.s ?? 1; s.set(it.sx ?? sc, it.sy ?? sc, it.sz ?? sc); p.set(it.x, it.y || 0, it.z); m4.compose(p, q, s); im.setMatrixAt(i, m4); });
    im.castShadow = o.castShadow; im.receiveShadow = true; im.frustumCulled = false; parent.add(im); out.push(im);
  });
  return out;
}
