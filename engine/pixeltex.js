// Pixel-art texture helpers: pair them with engine/pixel.js for the low-poly pixel look.
// Pixel-art reels use low-res hand-painted textures sampled with NEAREST filtering (the PS1/N64 look): crisp texels up
// close, flat colours, hard edges. We paint with ordinary canvas paths at k× resolution and then downsample each k×k block
// to its MAJORITY colour (not the average), so edges stay hard and no muddy in-between colours appear.
import * as THREE from 'three';

/** Draw at k× and downsample to w×h by majority colour (alpha < ~45 % coverage → transparent). Returns the small canvas. */
export function paintPixels(w, h, draw, k = 4, opts = {}) {
  const big = document.createElement('canvas'); big.width = w * k; big.height = h * k;
  const g = big.getContext('2d', { willReadFrequently: true });
  g.save(); g.scale(k, k); draw(g, w, h); g.restore();
  const src = g.getImageData(0, 0, w * k, h * k).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const og = out.getContext('2d');
  const img = og.createImageData(w, h), d = img.data;
  const keys = new Int32Array(k * k), cnt = new Int32Array(k * k);
  const minCover = opts.minCover ?? 0.45;
  for (let by = 0; by < h; by++) for (let bx = 0; bx < w; bx++) {
    let a = 0, nk = 0;
    for (let yy = 0; yy < k; yy++) {
      let i = ((by * k + yy) * w * k + bx * k) * 4;
      for (let xx = 0; xx < k; xx++, i += 4) {
        const al = src[i + 3]; a += al;
        if (al < 128) continue;
        const key = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
        let f = -1; for (let q = 0; q < nk; q++) if (keys[q] === key) { f = q; break; }
        if (f < 0) { keys[nk] = key; cnt[nk++] = 1; } else cnt[f]++;
      }
    }
    const o = (by * w + bx) * 4;
    if (!nk || a / (k * k * 255) < minCover) { d[o + 3] = 0; continue; }
    let best = 0; for (let q = 1; q < nk; q++) if (cnt[q] > cnt[best]) best = q;
    d[o] = (keys[best] >> 16) & 255; d[o + 1] = (keys[best] >> 8) & 255; d[o + 2] = keys[best] & 255; d[o + 3] = 255;
  }
  og.putImageData(img, 0, 0);
  return out;
}

/** A texture with the pixel look: NEAREST when magnified, mipmapped when minified (no shimmer in wide shots). */
export function pixelTexture(canvas, { repeat, wrap } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
  if (repeat || wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (repeat) t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** paintPixels + pixelTexture in one call. */
export function pixelTex(w, h, draw, opts = {}) {
  return pixelTexture(paintPixels(w, h, draw, opts.k ?? 4, opts), opts);
}

/** Seeded noise speckle (deterministic): fill a w×h canvas region with a base colour and n speckles from a palette. */
export function speckle(g, w, h, base, palette, n, seed = 1, size = 1) {
  let s = seed >>> 0 || 1; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { g.fillStyle = palette[Math.floor(r() * palette.length)]; g.fillRect(Math.floor(r() * w), Math.floor(r() * h), size, size); }
}

/** Toon ramp for MeshToonMaterial.gradientMap: N·L in [-1, 1] maps across the texels left → right. */
export function toonRamp(steps = [0.52, 0.6, 0.66, 0.78, 0.94, 1, 1, 1]) {
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => { const c = Math.round(Math.min(1, v) * 255); data.set([c, c, c, 255], i * 4); });
  const t = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
