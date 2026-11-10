// Blocky-avatar game style (069, docs/STYLES.md → rbx): materials. Smooth, slightly glossy plastic (a RoomEnvironment IBL gives
// the soft studio highlights), studded tops (our own stud tile: a raised disc with a lit rim and a soft shadow, colour + normal
// map), neon (unlit, values > 1 so bloom catches it), wood / grass / brick / metal / glass parts. All canvases are procedural.
//   rbxEnv(studio)                       // once, before materials: scene.environment = a soft studio IBL (glossy plastic)
//   plastic(0x3c8dff)                    // cached MeshStandardMaterial (roughness 0.42)
//   part([w, h, d], { color, top: 'studs', mat: 'plastic'|'smooth'|'neon'|'wood'|'grass'|'brick'|'metal'|'glass'|'sand', parent, pos, rot })
//   S = 0.34 m = one stud (the avatar is ~5.2 studs tall); textures repeat once per stud, whatever the part's size (boxUV)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const S = 0.34;
export const hexs = (c) => '#' + (c >>> 0).toString(16).padStart(6, '0').slice(-6);
export function shade(c, k) {                    // k > 0 lightens toward white, k < 0 darkens
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  const f = (v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return (f(r) << 16) | (f(g) << 8) | f(b);
}
export function prng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

let ENV = null;
/** soft studio IBL for the plastic look; call once in build() (sets scene.environment + intensity) */
export function rbxEnv(studio, intensity = 0.55) {
  if (!ENV) { const pm = new THREE.PMREMGenerator(studio.renderer); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); }
  studio.scene.environment = ENV; studio.scene.environmentIntensity = intensity;
  return ENV;
}

function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function tex(c, { srgb = true, repeat = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.needsUpdate = true; return t;
}

// ---------------------------------------------------------------- the stud tile (one stud per texture repeat)
const STUD = { r: 0.27, rim: 0.035 };           // disc radius / bevel, in tile units
function studHeight(u, v) {                     // 0..1 height field of one stud tile (raised disc with a rounded bevel)
  const d = Math.hypot(u - 0.5, v - 0.5);
  if (d < STUD.r - STUD.rim) return 1;
  if (d > STUD.r) return 0;
  const k = (STUD.r - d) / STUD.rim; return Math.sin(k * Math.PI / 2);
}
let STUD_MAPS = null;
/** { color (white-based, tint with material.color), normal } — 64 px tiles */
export function studMaps() {
  if (STUD_MAPS) return STUD_MAPS;
  const N = 64;
  const color = canvas(N, N, (g) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, N, N);
    const id = g.getImageData(0, 0, N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = (x + 0.5) / N, v = (y + 0.5) / N, d = Math.hypot(u - 0.5, v - 0.5);
      let k = 1;
      // a contact shadow just outside the disc (down-right), a lit top-left rim, the flat top a hair brighter
      const sx = u - 0.5 - 0.03, sy = v - 0.5 - 0.035, ds = Math.hypot(sx, sy);
      if (d > STUD.r && ds < STUD.r + 0.03) k -= 0.13 * (1 - Math.max(0, ds - STUD.r + 0.03) / 0.06);
      if (d <= STUD.r && d > STUD.r - STUD.rim - 0.01) { const a = Math.atan2(v - 0.5, u - 0.5); k += 0.1 * -Math.cos(a - Math.PI * 1.25) - 0.02; }
      if (d <= STUD.r - STUD.rim - 0.01) k += 0.035;
      // the faint seam of the tile edge (reads as separate plates up close)
      if (x === 0 || y === 0) k -= 0.025;
      const o = (y * N + x) * 4, c = Math.max(0, Math.min(255, Math.round(232 * k)));
      id.data[o] = id.data[o + 1] = id.data[o + 2] = c;
    }
    g.putImageData(id, 0, 0);
  });
  const normal = canvas(N, N, (g) => {
    const id = g.createImageData(N, N), e = 1 / N;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = (x + 0.5) / N, v = (y + 0.5) / N;
      const dx = (studHeight(u + e, v) - studHeight(u - e, v)) * 1.2, dy = (studHeight(u, v + e) - studHeight(u, v - e)) * 1.2;
      const n = new THREE.Vector3(-dx, dy, 1).normalize(), o = (y * N + x) * 4;
      id.data[o] = (n.x * 0.5 + 0.5) * 255; id.data[o + 1] = (n.y * 0.5 + 0.5) * 255; id.data[o + 2] = (n.z * 0.5 + 0.5) * 255; id.data[o + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  });
  STUD_MAPS = { color: tex(color), normal: tex(normal, { srgb: false }) };
  return STUD_MAPS;
}

// ---------------------------------------------------------------- surface textures (white-based where they tint)
const SURF = {};
function surface(kind) {
  if (SURF[kind]) return SURF[kind];
  const r = prng(kind.length * 97 + kind.charCodeAt(0));
  let c;
  if (kind === 'wood') c = canvas(64, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(90,55,25,${0.08 + r() * 0.1})`; g.fillRect(0, (i * 7 + r() * 3) | 0, 64, 1 + (r() * 2 | 0)); } g.fillStyle = 'rgba(70,40,15,.18)'; g.fillRect(0, 31, 64, 1); });
  else if (kind === 'grass') c = canvas(64, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,40,0,.09)' : 'rgba(255,255,200,.10)'; g.fillRect(r() * 64 | 0, r() * 64 | 0, 1, 2); } });
  else if (kind === 'brick') c = canvas(64, 64, (g) => { g.fillStyle = '#d9d6d2'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ffffff'; for (let row = 0; row < 4; row++) for (let i = -1; i < 3; i++) g.fillRect(i * 32 + (row % 2) * 16 + 1, row * 16 + 1, 30, 14); });
  else if (kind === 'metal') c = canvas(64, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 64; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(0, i, 64, 1); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, 64, 1); g.fillRect(0, 0, 1, 64); });
  else if (kind === 'sand') c = canvas(64, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,60,20,.08)' : 'rgba(255,255,255,.2)'; g.fillRect(r() * 64 | 0, r() * 64 | 0, 1, 1); } });
  else c = canvas(8, 8, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 8, 8); });
  return (SURF[kind] = tex(c));
}

// ---------------------------------------------------------------- materials (cached by kind + colour)
const MATS = new Map();
/** glossy plastic: the default look of every part + avatar */
export function plastic(color, { rough = 0.42, map = null, normalMap = null, env = 1 } = {}) {
  const key = `p:${color}:${rough}:${map ? map.uuid : ''}:${normalMap ? normalMap.uuid : ''}:${env}`;
  if (!MATS.has(key)) MATS.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, map, normalMap, envMapIntensity: env, normalScale: new THREE.Vector2(0.9, 0.9) }));
  return MATS.get(key);
}
/** unlit glowing part (kill bricks, checkpoints, neon signs); k > 1 feeds the bloom */
export function neon(color, k = 1.6) {
  const key = `n:${color}:${k}`;
  if (!MATS.has(key)) { const c = new THREE.Color(color).multiplyScalar(k); MATS.set(key, new THREE.MeshBasicMaterial({ color: c, toneMapped: true })); }
  return MATS.get(key);
}
export function matFor(kind, color) {
  if (kind === 'neon') return neon(color);
  if (kind === 'studs') { const m = studMaps(); return plastic(color, { map: m.color, normalMap: m.normal, rough: 0.48 }); }
  if (kind === 'glass') { const key = `g:${color}`; if (!MATS.has(key)) MATS.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.38, envMapIntensity: 1.4, depthWrite: false })); return MATS.get(key); }
  if (kind === 'metal') return plastic(color, { map: surface('metal'), rough: 0.3, env: 1.3 });
  if (kind === 'smooth') return plastic(color, { rough: 0.32 });
  if (kind === 'plastic') return plastic(color);
  return plastic(color, { map: surface(kind), rough: kind === 'wood' ? 0.6 : kind === 'grass' ? 0.75 : 0.6 });
}

/** UVs in studs: every box face's UV spans (face size / S), so stud tiles keep one stud per repeat at any size */
export function boxUV(geo, w, h, d, unit = S) {
  const uv = geo.attributes.uv, nrm = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i));
    const [a, b] = nx > 0.5 ? [d, h] : ny > 0.5 ? [w, d] : [w, h];
    uv.setXY(i, uv.getX(i) * a / unit, uv.getY(i) * b / unit);
  }
  uv.needsUpdate = true; return geo;
}

/** one game part (a brick). top: 'studs' puts studs on the top face only; mat applies to the sides (and the top otherwise).
 *  radius > 0 = a rounded brick (avatars, soft props). Returns the mesh (castShadow + receiveShadow on). */
export function part(size, { color = 0xa3a2a5, mat = 'plastic', top = null, parent = null, pos = null, rot = null, radius = 0, shadow = true } = {}) {
  const [w, h, d] = size;
  let mesh;
  if (radius > 0) {
    mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 2, h / 2, d / 2)), matFor(mat, color));
  } else {
    const geo = boxUV(new THREE.BoxGeometry(w, h, d), w, h, d);
    const side = matFor(mat, color), up = top ? matFor(top, color) : side, down = top === 'studs' ? matFor('plastic', shade(color, -0.12)) : side;
    mesh = new THREE.Mesh(geo, top ? [side, side, up, down, side, side] : side);
  }
  mesh.castShadow = shadow; mesh.receiveShadow = true;
  if (pos) mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  if (parent) parent.add(mesh);
  return mesh;
}

/** a cylinder part (posts, wheels, coins) with plastic sides; axis 'y' | 'x' | 'z' */
export function cyl(r, h, { color = 0xa3a2a5, mat = 'plastic', parent = null, pos = null, axis = 'y', seg = 28, rTop = null } = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop ?? r, r, h, seg), matFor(mat, color));
  if (axis === 'x') mesh.rotation.z = Math.PI / 2; else if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true; mesh.receiveShadow = true;
  if (pos) mesh.position.set(...pos);
  if (parent) parent.add(mesh);
  return mesh;
}

/** canvas → texture helper for signs, decals and screens (sRGB, clamp) */
export function canvasTexture(w, h, draw, { repeat = false } = {}) { return tex(canvas(w, h, draw), { repeat }); }
export { canvas as makeCanvas };
