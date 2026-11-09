// Voxel style (059): the block texture atlas. Every block face is a 16 × 16 px pixel-art tile painted procedurally
// (seeded, deterministic), packed into one atlas (8 × 8 cells of 32 px: each tile sits in the middle of its cell with an
// 8 px wrapped border so mipmaps don't bleed neighbours into it). NEAREST when magnified = crisp texels up close.
//   const A = blockAtlas();            // cached; A.tex (THREE texture), A.uv(tileName) → [u0, v0, u1, v1]
//   BLOCKS.grass → {top, side, bottom}  // tile names per face (vox.js maps block ids → tiles)
// Our own palette and tiles (bright toy-town daylight), not any game's.
import * as THREE from 'three';

export const TILE = 16, CELL = 32, COLS = 8;

// ---------------------------------------------------------------- tiny seeded painter
function R(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
function shade(c, k) {
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255, f = (v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))));
  return (f(r) << 16) | (f(g) << 8) | f(b);
}
/** fill the tile with a base colour + n speckles drawn from darker/lighter versions of it */
function noisy(g, base, n, seed, spread = [-0.14, -0.07, 0.07, 0.12], size = 1) {
  const r = R(seed); g.fillStyle = hex(base); g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < n; i++) { g.fillStyle = hex(shade(base, spread[Math.floor(r() * spread.length)])); g.fillRect(Math.floor(r() * TILE), Math.floor(r() * TILE), size, size); }
}
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = typeof c === 'number' ? hex(c) : c; g.fillRect(x, y, w, h); };

// ---------------------------------------------------------------- the tiles (name → painter on a 16 × 16 context)
const PAL = {
  grass: 0x6cbf45, grassD: 0x58a637, dirt: 0x8a5a36, stone: 0x8f9296, asphalt: 0x4a4d52, walk: 0xc9c7c0, sand: 0xe6d49a,
  water: 0x3a8fe0, snow: 0xf4f7fb, leaf: 0x3f9a34, bark: 0x6b4a2c, brick: 0xb3503c, tan: 0xd6a066, roofR: 0xc0473a,
  roofG: 0x5a5f6b, white: 0xf1eee6, glass: 0x9fd2f2,
};
export const SOLID_COLORS = {
  white: 0xf3f1ec, black: 0x26282c, red: 0xd8413a, blue: 0x3c6fd8, yellow: 0xf2c53d, green: 0x56b04a, orange: 0xf08a35,
  purple: 0x8a55c9, pink: 0xf09ab8, brown: 0x7d5434, gray: 0x8b8e94, cyan: 0x3fb8c8, navy: 0x2a3b6e, cream: 0xf3e7c8,
  scribe: 0x9a1c25, lime: 0x9ed84a, teal: 0x2f8f86, maroon: 0x7a2630,
};
const T = {
  grass_top: (g) => noisy(g, PAL.grass, 70, 1, [-0.16, -0.08, 0.08, 0.14]),
  grass_side: (g) => { T.dirt(g); const r = R(2); for (let x = 0; x < TILE; x++) { const h = 3 + Math.floor(r() * 3); px(g, PAL.grass, x, 0, 1, h); if (r() < 0.5) px(g, PAL.grassD, x, h - 1); } },
  dirt: (g) => noisy(g, PAL.dirt, 60, 3, [-0.2, -0.1, 0.1, 0.16]),
  stone: (g) => { noisy(g, PAL.stone, 50, 4); const r = R(5); for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 13), y = Math.floor(r() * 15); px(g, shade(PAL.stone, -0.22), x, y, 3, 1); } },
  cobble: (g) => { px(g, shade(PAL.stone, -0.3), 0, 0, TILE, TILE); const r = R(6); for (const [x, y, w, h] of [[0, 0, 6, 5], [7, 0, 9, 4], [0, 6, 4, 5], [5, 5, 6, 6], [12, 5, 4, 6], [0, 12, 7, 4], [8, 12, 8, 4]]) { px(g, shade(PAL.stone, (r() - 0.5) * 0.2), x, y, w - 1, h - 1); px(g, shade(PAL.stone, 0.18), x, y, w - 1, 1); } },
  asphalt: (g) => noisy(g, PAL.asphalt, 70, 7, [-0.12, -0.06, 0.06, 0.1]),
  road_line: (g) => { T.asphalt(g); px(g, 0xf2c53d, 7, 0, 2, 9); },
  road_edge: (g) => { T.asphalt(g); px(g, 0xeeeeea, 0, 0, TILE, 1); },
  crosswalk: (g) => { T.asphalt(g); px(g, 0xf1f0ea, 0, 2, TILE, 5); px(g, 0xf1f0ea, 0, 10, TILE, 5); },
  sidewalk: (g) => { noisy(g, PAL.walk, 40, 8, [-0.08, -0.04, 0.04]); px(g, shade(PAL.walk, -0.18), 0, 15, TILE, 1); px(g, shade(PAL.walk, -0.18), 15, 0, 1, TILE); },
  curb: (g) => { noisy(g, shade(PAL.walk, 0.05), 30, 9, [-0.06, 0.04]); px(g, shade(PAL.walk, -0.25), 0, 14, TILE, 2); },
  sand: (g) => noisy(g, PAL.sand, 60, 10, [-0.1, -0.05, 0.06]),
  water: (g) => { noisy(g, PAL.water, 40, 11, [-0.08, 0.08, 0.14]); const r = R(12); for (let i = 0; i < 4; i++) px(g, 0xcfeaff, Math.floor(r() * 12), Math.floor(r() * 16), 4, 1); },
  snow: (g) => noisy(g, PAL.snow, 30, 13, [-0.05, -0.03]),
  log: (g) => { px(g, PAL.bark, 0, 0, TILE, TILE); const r = R(14); for (let x = 0; x < TILE; x += 3) { px(g, shade(PAL.bark, -0.25), x, 0, 1, TILE); } for (let i = 0; i < 10; i++) px(g, shade(PAL.bark, 0.15), Math.floor(r() * 16), Math.floor(r() * 16), 1, 2); },
  log_top: (g) => { px(g, PAL.bark, 0, 0, TILE, TILE); px(g, 0xc89b62, 1, 1, 14, 14); for (const k of [3, 6]) { g.strokeStyle = hex(0xa47844); g.lineWidth = 1; g.strokeRect(k + 0.5, k + 0.5, 15 - 2 * k, 15 - 2 * k); } },
  leaves: (g) => { noisy(g, PAL.leaf, 90, 15, [-0.25, -0.15, 0.1, 0.18]); const r = R(16); for (let i = 0; i < 6; i++) px(g, shade(PAL.leaf, -0.45), Math.floor(r() * 15), Math.floor(r() * 15), 2, 1); },
  leaves_b: (g) => { noisy(g, 0x7bb83a, 90, 17, [-0.22, -0.12, 0.1, 0.16]); const r = R(18); for (let i = 0; i < 6; i++) px(g, shade(0x7bb83a, -0.42), Math.floor(r() * 15), Math.floor(r() * 15), 2, 1); },
  leaves_pink: (g) => noisy(g, 0xf2a6c4, 90, 19, [-0.18, -0.08, 0.08, 0.14]),
  hedge: (g) => noisy(g, 0x3b8a3a, 100, 20, [-0.25, -0.12, 0.08, 0.15]),
  brick: (g) => { px(g, 0xd9cfc0, 0, 0, TILE, TILE); for (let row = 0; row < 4; row++) for (let k = -1; k < 3; k++) { const x = k * 8 + (row % 2) * 4; px(g, shade(PAL.brick, ((row * 3 + k * 5) % 7) / 40 - 0.08), x, row * 4, 7, 3); } },
  brick_tan: (g) => { px(g, 0xe7dccb, 0, 0, TILE, TILE); for (let row = 0; row < 4; row++) for (let k = -1; k < 3; k++) { const x = k * 8 + (row % 2) * 4; px(g, shade(PAL.tan, ((row * 3 + k * 5) % 7) / 40 - 0.06), x, row * 4, 7, 3); } },
  planks: (g) => planks(g, 0xb98a52, 21),
  planks_light: (g) => planks(g, 0xdcc38d, 22),
  planks_dark: (g) => planks(g, 0x6d4a2c, 23),
  siding_white: (g) => siding(g, 0xf0ece2), siding_blue: (g) => siding(g, 0x8fb6e8), siding_yellow: (g) => siding(g, 0xf2d27a),
  siding_mint: (g) => siding(g, 0xa9dcc1), siding_pink: (g) => siding(g, 0xf3b9c6), siding_gray: (g) => siding(g, 0xb9bdc4),
  plaster: (g) => noisy(g, PAL.white, 25, 24, [-0.04, -0.02, 0.02]),
  plaster_cream: (g) => noisy(g, 0xf1e3c4, 25, 25, [-0.04, -0.02, 0.02]),
  concrete: (g) => noisy(g, 0xb5b6b4, 40, 26, [-0.06, -0.03, 0.04]),
  roof_red: (g) => shingles(g, PAL.roofR), roof_gray: (g) => shingles(g, PAL.roofG), roof_blue: (g) => shingles(g, 0x46669c), roof_brown: (g) => shingles(g, 0x7a4f35),
  window: (g) => { px(g, 0xf3f1ec, 0, 0, TILE, TILE); px(g, PAL.glass, 1, 1, 14, 14); px(g, 0xd6eefc, 3, 3, 2, 6); px(g, 0xd6eefc, 5, 3, 1, 3); px(g, 0xf3f1ec, 7, 1, 2, 14); px(g, 0xf3f1ec, 1, 7, 14, 2); px(g, shade(PAL.glass, -0.15), 9, 9, 6, 6); },
  window_dark: (g) => { px(g, 0xf3f1ec, 0, 0, TILE, TILE); px(g, 0x2c3d55, 1, 1, 14, 14); px(g, 0x4a6488, 3, 3, 2, 5); px(g, 0xf3f1ec, 7, 1, 2, 14); px(g, 0xf3f1ec, 1, 7, 14, 2); },
  window_lit: (g) => { px(g, 0xf3f1ec, 0, 0, TILE, TILE); px(g, 0xffd98a, 1, 1, 14, 14); px(g, 0xf3f1ec, 7, 1, 2, 14); px(g, 0xf3f1ec, 1, 7, 14, 2); },
  glass: (g) => { px(g, PAL.glass, 0, 0, TILE, TILE); px(g, 0xe3f4ff, 3, 2, 1, 7); px(g, 0xe3f4ff, 4, 2, 1, 4); px(g, shade(PAL.glass, -0.2), 0, 0, TILE, 1); px(g, shade(PAL.glass, -0.2), 0, 0, 1, TILE); },
  tower_glass: (g) => { px(g, 0x6f8fae, 0, 0, TILE, TILE); for (let y = 0; y < TILE; y += 4) { px(g, 0x9cc0dd, 1, y + 1, 6, 2); px(g, 0x9cc0dd, 9, y + 1, 6, 2); } px(g, 0x4a5e74, 0, 0, TILE, 1); px(g, 0x4a5e74, 8, 0, 1, TILE); },
  tower_stone: (g) => { px(g, 0xd9d2c2, 0, 0, TILE, TILE); for (let y = 0; y < TILE; y += 4) { px(g, 0x45566b, 2, y + 1, 4, 2); px(g, 0x45566b, 10, y + 1, 4, 2); } },
  door: (g) => { planks(g, 0x8a5a33, 27); px(g, shade(0x8a5a33, -0.3), 0, 0, 1, TILE); px(g, shade(0x8a5a33, -0.3), 15, 0, 1, TILE); px(g, 0xf2c53d, 12, 8, 2, 2); },
  door_top: (g) => { planks(g, 0x8a5a33, 28); px(g, PAL.glass, 3, 3, 10, 7); px(g, 0xd6eefc, 4, 4, 2, 3); px(g, shade(0x8a5a33, -0.3), 0, 0, 1, TILE); px(g, shade(0x8a5a33, -0.3), 15, 0, 1, TILE); },
  door_red: (g) => { px(g, 0xc0393a, 0, 0, TILE, TILE); px(g, 0xa22f30, 2, 2, 5, 12); px(g, 0xa22f30, 9, 2, 5, 12); px(g, 0xf2c53d, 12, 8, 2, 2); },
  door_glass: (g) => { px(g, 0x6f747c, 0, 0, TILE, TILE); px(g, PAL.glass, 2, 1, 12, 15); px(g, 0xe3f4ff, 4, 2, 1, 8); px(g, 0x6f747c, 7, 1, 2, 15); },
  metal: (g) => { noisy(g, 0xc3c7cc, 20, 29, [-0.06, 0.05]); for (const [x, y] of [[1, 1], [14, 1], [1, 14], [14, 14]]) px(g, 0x8d9299, x, y); },
  bookshelf: (g) => { planks(g, 0xb98a52, 30); const C = [0xd8413a, 0x3c6fd8, 0x56b04a, 0xf2c53d, 0x8a55c9, 0xf3f1ec]; const r = R(31); for (const y of [1, 9]) { px(g, 0x3b2a1b, 1, y, 14, 6); for (let x = 1; x < 15; x += 2) px(g, C[Math.floor(r() * C.length)], x, y + Math.floor(r() * 2), 2, 6 - Math.floor(r() * 2)); } },
  chalkboard: (g) => { noisy(g, 0x2f5e46, 30, 32, [-0.06, 0.05]); },
  checker: (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) px(g, (x + y) % 2 ? 0x3a3c44 : 0xeeeae0, x * 8, y * 8, 8, 8); },
  floor_tile: (g) => { noisy(g, 0xe6e1d4, 20, 33, [-0.04, 0.03]); px(g, 0xc8c2b4, 0, 0, TILE, 1); px(g, 0xc8c2b4, 0, 0, 1, TILE); },
  carpet: (g) => noisy(g, 0x5f86c9, 90, 34, [-0.08, -0.04, 0.05]),
  carpet_red: (g) => noisy(g, 0xb84646, 90, 35, [-0.08, -0.04, 0.05]),
  wallpaper: (g) => { px(g, 0xf3e9d2, 0, 0, TILE, TILE); for (let x = 2; x < TILE; x += 8) for (let y = 2; y < TILE; y += 8) px(g, 0xe5c99a, x, y, 2, 2); },
  wallpaper_blue: (g) => { px(g, 0xcfe0f2, 0, 0, TILE, TILE); for (let x = 0; x < TILE; x += 4) px(g, 0xbcd2ea, x, 0, 2, TILE); },
  hay: (g) => { noisy(g, 0xe0b84a, 60, 36, [-0.12, 0.08]); px(g, 0xb48a2c, 0, 5, TILE, 1); px(g, 0xb48a2c, 0, 11, TILE, 1); },
  pumpkin: (g) => { px(g, 0xe8862a, 0, 0, TILE, TILE); for (let x = 2; x < TILE; x += 4) px(g, 0xc96d1c, x, 0, 1, TILE); },
  tnt: (g) => { px(g, 0xd8413a, 0, 0, TILE, TILE); px(g, 0xf3f1ec, 0, 5, TILE, 6); },
  // plain = flat near-white with a whisper of noise: colour blocks (vox.js colorBlock) tint this tile
  plain: (g) => noisy(g, 0xf4f4f4, 34, 37, [-0.05, -0.025, 0.02]),
  smooth: (g) => { px(g, 0xf8f8f8, 0, 0, TILE, TILE); },
  // cross sprites (flowers, tufts): drawn on a transparent tile
  tuft: (g) => { g.clearRect(0, 0, TILE, TILE); const r = R(38); for (let i = 0; i < 9; i++) { const x = 1 + Math.floor(r() * 14), h = 5 + Math.floor(r() * 8); px(g, i % 2 ? PAL.grass : PAL.grassD, x, 16 - h, 1, h); } },
  flower_red: (g) => flower(g, 0xe0403a), flower_yellow: (g) => flower(g, 0xf4cf3a), flower_white: (g) => flower(g, 0xf7f5ee), flower_blue: (g) => flower(g, 0x5a7fe6),
};
function planks(g, base, seed) {
  noisy(g, base, 40, seed, [-0.1, -0.05, 0.05]);
  for (let y = 0; y < TILE; y += 4) { px(g, shade(base, -0.28), 0, y + 3, TILE, 1); const x = ((y / 4) * 7 + seed) % 14 + 1; px(g, shade(base, -0.28), x, y, 1, 3); }
}
function siding(g, base) { px(g, base, 0, 0, TILE, TILE); for (let y = 0; y < TILE; y += 4) { px(g, shade(base, -0.16), 0, y + 3, TILE, 1); px(g, shade(base, 0.12), 0, y, TILE, 1); } }
function shingles(g, base) {
  px(g, shade(base, -0.3), 0, 0, TILE, TILE);
  for (let row = 0; row < 4; row++) for (let k = -1; k < 4; k++) { const x = k * 5 + (row % 2) * 2; px(g, shade(base, ((row + k * 3) % 5) / 30 - 0.04), x, row * 4, 4, 3); }
}
function flower(g, c) { g.clearRect(0, 0, TILE, TILE); px(g, 0x3f8a2e, 7, 6, 2, 10); px(g, 0x58a637, 4, 10, 3, 2); px(g, 0x58a637, 9, 12, 3, 2); px(g, c, 5, 2, 6, 4); px(g, c, 6, 1, 4, 6); px(g, 0xf8e070, 7, 3, 2, 2); }

export const TILES = Object.keys(T);

// ---------------------------------------------------------------- blocks: tile names per face + flags
//   cross: drawn as two crossed quads (plants), cut: alpha-tested, see: transparent (water)
export const BLOCKS = {
  grass: { top: 'grass_top', side: 'grass_side', bottom: 'dirt' },
  dirt: { all: 'dirt' }, stone: { all: 'stone' }, cobble: { all: 'cobble' }, sand: { all: 'sand' }, snow: { all: 'snow' },
  asphalt: { all: 'asphalt' }, road_line: { top: 'road_line', side: 'asphalt' }, road_edge: { top: 'road_edge', side: 'asphalt' },
  crosswalk: { top: 'crosswalk', side: 'asphalt' }, sidewalk: { top: 'sidewalk', side: 'curb' }, curb: { top: 'curb', side: 'curb' },
  water: { all: 'water', see: true }, log: { top: 'log_top', side: 'log', bottom: 'log_top' },
  leaves: { all: 'leaves' }, leaves_b: { all: 'leaves_b' }, leaves_pink: { all: 'leaves_pink' }, hedge: { all: 'hedge' },
  brick: { all: 'brick' }, brick_tan: { all: 'brick_tan' }, planks: { all: 'planks' }, planks_light: { all: 'planks_light' },
  planks_dark: { all: 'planks_dark' }, plaster: { all: 'plaster' }, plaster_cream: { all: 'plaster_cream' }, concrete: { all: 'concrete' },
  siding_white: { all: 'siding_white' }, siding_blue: { all: 'siding_blue' }, siding_yellow: { all: 'siding_yellow' },
  siding_mint: { all: 'siding_mint' }, siding_pink: { all: 'siding_pink' }, siding_gray: { all: 'siding_gray' },
  roof_red: { all: 'roof_red' }, roof_gray: { all: 'roof_gray' }, roof_blue: { all: 'roof_blue' }, roof_brown: { all: 'roof_brown' },
  window: { all: 'window' }, window_dark: { all: 'window_dark' }, window_lit: { all: 'window_lit' }, glass: { all: 'glass' },
  tower_glass: { all: 'tower_glass', top: 'concrete' }, tower_stone: { all: 'tower_stone', top: 'concrete' },
  door: { side: 'door', top: 'planks', bottom: 'planks' }, door_top: { side: 'door_top', top: 'planks', bottom: 'planks' },
  door_red: { side: 'door_red', top: 'planks', bottom: 'planks' }, door_glass: { side: 'door_glass', top: 'concrete', bottom: 'concrete' },
  metal: { all: 'metal' }, bookshelf: { side: 'bookshelf', top: 'planks', bottom: 'planks' }, chalkboard: { all: 'chalkboard' },
  checker: { all: 'checker' }, floor_tile: { all: 'floor_tile' }, carpet: { all: 'carpet' }, carpet_red: { all: 'carpet_red' },
  wallpaper: { all: 'wallpaper' }, wallpaper_blue: { all: 'wallpaper_blue' }, hay: { all: 'hay', top: 'hay' }, pumpkin: { all: 'pumpkin' },
  tnt: { all: 'tnt' }, plain: { all: 'plain' }, smooth: { all: 'smooth' },
  tuft: { all: 'tuft', cross: true }, flower_red: { all: 'flower_red', cross: true }, flower_yellow: { all: 'flower_yellow', cross: true },
  flower_white: { all: 'flower_white', cross: true }, flower_blue: { all: 'flower_blue', cross: true },
};

// ---------------------------------------------------------------- the atlas
let _atlas = null;
/** The shared block atlas (built once): {canvas, tex, uv(name) → [u0, v0, u1, v1], tileCanvas(name)} */
export function blockAtlas() {
  if (_atlas) return _atlas;
  const N = TILES.length, rows = Math.ceil(N / COLS), W = COLS * CELL, H = Math.max(rows, 1) * CELL;
  const size = 2 ** Math.ceil(Math.log2(Math.max(W, H)));
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const tile = document.createElement('canvas'); tile.width = tile.height = TILE; const tg = tile.getContext('2d');
  const where = {}, tiles = {};
  TILES.forEach((name, i) => {
    tg.clearRect(0, 0, TILE, TILE); T[name](tg);
    const cx = (i % COLS) * CELL, cy = Math.floor(i / COLS) * CELL, o = (CELL - TILE) / 2;
    g.save(); g.beginPath(); g.rect(cx, cy, CELL, CELL); g.clip();                 // wrapped border, clipped to the cell
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) g.drawImage(tile, cx + o + dx * TILE, cy + o + dy * TILE);
    g.restore();
    where[name] = [cx + o, cy + o];
    const keep = document.createElement('canvas'); keep.width = keep.height = TILE; keep.getContext('2d').drawImage(tile, 0, 0); tiles[name] = keep;
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestMipmapLinearFilter;
  tex.anisotropy = 8; tex.generateMipmaps = true;
  const uv = (name) => { const [x, y] = where[name] || where.plain; return [x / size, 1 - (y + TILE) / size, (x + TILE) / size, 1 - y / size]; };
  _atlas = { canvas: c, tex, uv, size, tileCanvas: (name) => tiles[name] };
  return _atlas;
}

/** One tile as its own repeating texture (ground planes that go to the horizon: repeat = metres covered / block size). */
export function tileTexture(name, repeat = [1, 1]) {
  const A = blockAtlas(), src = A.tileCanvas(name);
  const c = document.createElement('canvas'); c.width = c.height = TILE; c.getContext('2d').drawImage(src, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  return t;
}

/** A pixel-art canvas (w × h px) painted by draw(g) with NEAREST sampling: signs, posters, item sprites. */
export function pixelCanvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h); return c;
}
export function nearestTex(canvas) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.anisotropy = 8; return t;
}
export { shade, hex };
