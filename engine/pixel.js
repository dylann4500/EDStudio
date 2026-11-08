// Pixel post pass: the crunchy low-poly pixel-art look (any video; see videos/_pixel-template).
//   const pixel = addPixelPass(studio);   // in build(): appended after createStudio's grade pass
//   pixel.set(n)                           // n = block size in output pixels (1 = off). 3–6 = the crunchy pixel-art look.
//   pixel.set(mosaicAt(t, CUTS))           // a MOSAIC cut transition: blocks swell to ~54 px and back across each cut
// Optional palette crunch: pixel.set(n, { levels: 24 }) posterizes each channel (0 = off).
// Optional block average: pixel.set(n, { avg: 4 }) = each block's mean colour (4 × 4 taps) instead of its centre pixel
//   (softer stair-steps that don't crawl in motion; the default point sample can shimmer on moving cameras).
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const PixelShader = {
  uniforms: { tDiffuse: { value: null }, uBlock: { value: 1 }, uRes: { value: [1080, 1920] }, uLevels: { value: 0 }, uAvg: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uBlock, uLevels, uAvg; uniform vec2 uRes; varying vec2 vUv;
    void main(){
      vec2 uv = vUv;
      vec4 c;
      if (uBlock > 1.0 && uAvg > 0.5) {
        // opt-in box average over the block (uAvg × uAvg taps, max 4 × 4): the mean colour of each block, like a frame
        // rendered small and scaled up — softer stair-steps that don't crawl in motion (the point sample below shimmers)
        vec2 b0 = floor(vUv * uRes / uBlock) * uBlock; vec4 acc = vec4(0.0); float n = 0.0;
        for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) {
          if (float(i) >= uAvg || float(j) >= uAvg) continue;
          acc += texture2D(tDiffuse, (b0 + (vec2(float(i), float(j)) + 0.5) / uAvg * uBlock) / uRes); n += 1.0;
        }
        c = acc / n;
      } else {
        if (uBlock > 1.0) { vec2 px = uv * uRes; px = (floor(px / uBlock) + 0.5) * uBlock; uv = px / uRes; }
        c = texture2D(tDiffuse, uv);
      }
      if (uLevels > 1.0) c.rgb = floor(c.rgb * uLevels + 0.5) / uLevels;
      gl_FragColor = c;
    }`,
};

export function addPixelPass(studio) {
  const pass = new ShaderPass(PixelShader);
  studio.composer.addPass(pass);
  const set = (n = 1, o = {}) => {
    pass.uniforms.uBlock.value = Math.max(1, n);
    pass.uniforms.uLevels.value = o.levels ?? 0;
    pass.uniforms.uAvg.value = o.avg ?? 0;   // opt-in: average avg × avg taps per block (≤ 4) instead of one point sample
    pass.enabled = n > 1.01 || (o.levels ?? 0) > 1;
  };
  set(1);
  return { pass, set };
}

/** Mosaic transition: block size around each cut time (dur = full width of the effect, peak = max block px). */
export function mosaicAt(t, cuts, dur = 0.36, peak = 54) {
  let n = 1;
  for (const c of cuts) {
    const u = Math.abs(t - c) / (dur / 2);
    if (u < 1) n = Math.max(n, 1 + (peak - 1) * Math.pow(1 - u, 1.6));
  }
  return Math.round(n);
}
