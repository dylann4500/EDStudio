// iso style (060): the DIORAMA BASE — a chunky slab of ground cut out of the world and floating in the void: the world on
// top (y = 0), a cut edge of soil strata on the sides (a grass lip with a ragged fringe, dark topsoil with roots, sandy and
// clay layers with pebbles, grey rock at the bottom), rounded edges that catch the light, and a soft shadow far below.
//   const B = makeBase({ shape: 'square' | 'round', w: 24, d: 24, h: 5, top: 0x86c35a, soil: 'earth' | 'sand' | 'rock', seed })
//   scene.add(B.g); put the world in B.world (y = 0 is the top surface)
//   B.update(t)            gentle float bob (B.bob = amplitude m; 0 = still) + the shadow breathing with it
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng } from '../core.js';

const PALETTES = {
  earth: { grass: ['#6fae3f', '#5a9634', '#4c842b'], layers: ['#5b3a24', '#7a5034', '#9a6a43', '#b98a58', '#8d6142', '#a77a52', '#6c6660'], peb: ['#c9b49a', '#8f8a84', '#e0d2bd', '#6e6258'] },
  sand: { grass: ['#d9c08a', '#cfb37a', '#c4a56c'], layers: ['#c9a46e', '#d8b884', '#e2c796', '#cfae79', '#b9935f', '#a98457', '#8d8378'], peb: ['#f1e2c3', '#9c917f', '#e8d6b3'] },
  rock: { grass: ['#8a8f96', '#7c8189', '#70757d'], layers: ['#6b6460', '#7d756f', '#8f8780', '#a39b92', '#7a736c', '#686260', '#555150'], peb: ['#b4aca2', '#5c5650', '#cfc6bb'] },
  paving: { grass: ['#c9b9a0', '#bcab90', '#b19f84'], layers: ['#8b7a68', '#a38f78', '#7a6a5a', '#b29c80', '#91806c', '#7d6e60', '#6a6058'], peb: ['#d8ccb8', '#8a8076', '#efe4d2'] },
};

/** The cut-soil texture for a side of `len` m by `h` m (canvas px scale ~ 40 px/m, capped). */
export function soilTexture({ len = 24, h = 5, soil = 'earth', grass, seed = 1, lip = 0.09 } = {}) {
  const P = PALETTES[soil] || PALETTES.earth, R = rng(seed);
  const pxm = Math.min(48, 2048 / len), cw = Math.round(len * pxm), ch = Math.round(h * pxm);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  // strata from the bottom up, wavy boundaries
  const bands = P.layers.length, lipPx = ch * lip;
  let yTop = lipPx;
  const bh = (ch - lipPx) / bands;
  for (let b = 0; b < bands; b++) {
    const y0 = yTop + b * bh, ph = R() * 9, amp = bh * (0.12 + R() * 0.18);
    g.fillStyle = P.layers[b]; g.beginPath(); g.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 8) g.lineTo(x, y0 + Math.sin(x / (35 + b * 9) + ph) * amp + Math.sin(x / 13 + ph * 2) * amp * 0.3);
    g.lineTo(cw, ch); g.closePath(); g.fill();
  }
  // speckle + pebbles
  for (let i = 0; i < cw * ch / 90; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,240,220'},${0.05 + R() * 0.08})`; g.fillRect(R() * cw, lipPx + R() * (ch - lipPx), 2 + R() * 3, 2 + R() * 2); }
  for (let i = 0; i < cw * ch / 900; i++) {
    const x = R() * cw, y = lipPx + 6 + R() * (ch - lipPx - 6), r = 2 + R() * R() * 9;
    g.fillStyle = P.peb[Math.floor(R() * P.peb.length)]; g.beginPath(); g.ellipse(x, y, r * 1.3, r, R() * 3, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x + r * 0.3, y + r * 0.35, r * 1.1, r * 0.7, 0, 0, 7); g.fill();
  }
  // roots under the grass
  if (soil === 'earth') {
    g.strokeStyle = 'rgba(60,38,22,.55)'; g.lineWidth = 1.6; g.lineCap = 'round';
    for (let i = 0; i < cw / 18; i++) {
      let x = R() * cw, y = lipPx; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 10; y += 4 + R() * bh * 0.25; g.lineTo(x, y); }
      g.stroke();
    }
  }
  // the grass lip with a ragged fringe
  const gc = grass || P.grass;
  g.fillStyle = gc[0]; g.beginPath(); g.moveTo(0, 0); g.lineTo(cw, 0); g.lineTo(cw, lipPx * 0.8);
  for (let x = cw; x >= 0; x -= 5) g.lineTo(x, lipPx * (0.85 + 0.5 * R()) + (R() < 0.12 ? lipPx * 0.6 * R() : 0));
  g.closePath(); g.fill();
  g.fillStyle = gc[1]; g.fillRect(0, lipPx * 0.45, cw, lipPx * 0.18);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, cw, lipPx * 0.22);
  // a soft shade toward the bottom (the slab reads thick)
  const sh = g.createLinearGradient(0, ch * 0.5, 0, ch); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)');
  g.fillStyle = sh; g.fillRect(0, 0, cw, ch);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

/** A tileable ground texture: base colour + speckle (grass, sand, paving, wood…). repeat = metres per tile. */
export function groundTexture({ base = '#86c35a', speck = ['#78b44c', '#94cd66', '#6aa443'], n = 900, size = 256, seed = 3, stripes = 0, stripeC = 'rgba(255,255,255,.06)' } = {}) {
  const R = rng(seed), c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, size, size);
  if (stripes) { g.fillStyle = stripeC; for (let i = 0; i < stripes; i += 2) g.fillRect(0, (i * size) / stripes, size, size / stripes); }
  for (let i = 0; i < n; i++) { g.fillStyle = speck[Math.floor(R() * speck.length)]; g.globalAlpha = 0.35 + R() * 0.5; g.fillRect(R() * size, R() * size, 1 + R() * 3, 1 + R() * 3); }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  return tex;
}

let _shadowTex = null;
function shadowTex() {
  if (_shadowTex) return _shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(40,24,20,.55)'); gr.addColorStop(0.55, 'rgba(40,24,20,.28)'); gr.addColorStop(1, 'rgba(40,24,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return (_shadowTex = new THREE.CanvasTexture(c));
}

/** The soft shadow a floating piece casts on the void far below (for rooms and props that float without makeBase). */
export function makeFloatShadow(w, d, y) {
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, fog: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = y; sh.scale.set(w * 1.5, d * 1.5, 1); sh.renderOrder = -1;
  return sh;
}

export function makeBase({ shape = 'square', w = 24, d, r, h, top = 0x86c35a, topMap = null, topRepeat = 6, soil = 'earth', grass, seed = 1, bevel, shadow = true, drop } = {}) {
  d = d ?? w; r = r ?? w / 2; h = h ?? Math.max(w, d) * 0.2;
  const g = new THREE.Group(), world = new THREE.Group(); g.add(world);
  const tmap = topMap || groundTexture({ seed: seed + 5, base: '#' + new THREE.Color(top).getHexString() });
  if (!topMap) tmap.repeat.set((shape === 'round' ? 2 * r : w) / topRepeat, (shape === 'round' ? 2 * r : d) / topRepeat);
  const topMat = new THREE.MeshStandardMaterial({ color: topMap ? top : 0xffffff, map: tmap, roughness: 0.92 });
  const botMat = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 1 });
  let slab, lip = null;
  if (shape === 'round') {
    const side = soilTexture({ len: 2 * Math.PI * r, h, soil, grass, seed });
    const sideMat = new THREE.MeshStandardMaterial({ map: side, roughness: 0.95 });
    slab = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.985, h, 96, 1, false), [sideMat, topMat, botMat]);
    // a bevel ring of grass so the top edge rounds over like a sod cut
    lip = new THREE.Mesh(new THREE.TorusGeometry(r - 0.04 * h, 0.05 * h, 8, 96), new THREE.MeshStandardMaterial({ color: (PALETTES[soil] || PALETTES.earth).grass[0], roughness: 0.9 }));
    lip.rotation.x = Math.PI / 2; lip.position.y = -0.03 * h; g.add(lip);
  } else {
    const sx = soilTexture({ len: w, h, soil, grass, seed }), sz = soilTexture({ len: d, h, soil, grass, seed: seed + 17 });
    const mx = new THREE.MeshStandardMaterial({ map: sx, roughness: 0.95 }), mz = new THREE.MeshStandardMaterial({ map: sz, roughness: 0.95 });
    // RoundedBoxGeometry keeps BoxGeometry's groups: +x, −x, +y, −y, +z, −z
    slab = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, bevel ?? Math.min(h * 0.08, 0.5)), [mz, mz, topMat, botMat, mx, mx]);
  }
  slab.position.y = -h / 2; slab.receiveShadow = true; slab.castShadow = true; g.add(slab);
  let sh = null;
  if (shadow) {
    sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, fog: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -h - (drop ?? h * 1.4); sh.scale.set((shape === 'round' ? 2 * r : w) * 1.5, (shape === 'round' ? 2 * r : d) * 1.5, 1);
    sh.renderOrder = -1; g.add(sh);
  }
  const B = {
    g, world, slab, topMat, shadow: sh, bob: 0.06, D: { w: shape === 'round' ? 2 * r : w, d: shape === 'round' ? 2 * r : d, h, r },
    update(t) {
      const y = Math.sin(t * 0.9 + seed) * B.bob;
      slab.position.y = -h / 2 + y; world.position.y = y; if (lip) lip.position.y = -0.03 * h + y;
      if (sh) { const k = 1 - y * 0.6; sh.scale.set(B.D.w * 1.5 * k, B.D.d * 1.5 * k, 1); }
    },
  };
  return B;
}
