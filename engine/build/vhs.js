// 056: a VHS rewind pass (the @whatifpov cold open → rewind, docs/reference/whatifpov.md): horizontal tracking tears (bands of
// rows shoved sideways), a rolling noise bar, chroma split, a little desaturation + scanlines. Deterministic (driven by t).
//   const vhs = addVhsPass(studio);   // in build(), after createStudio (appended after the grade pass)
//   vhs.set(k, t)                       // k 0 = off (pass disabled) … 1 = full rewind mess
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const VhsShader = {
  uniforms: { tDiffuse: { value: null }, uK: { value: 0 }, uT: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uK, uT; varying vec2 vUv;
    float h(float n){ return fract(sin(n * 127.1) * 43758.5453); }
    float n2(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      float fr = floor(uT * 30.0);                       // a new tear pattern every frame of tape
      float band = floor(uv.y * 48.0);
      float tear = step(0.72, h(band * 1.7 + fr * 3.1)) * (h(band + fr) - 0.5) * 0.09;
      float roll = fract(uT * 0.9);                     // the noise bar rolling down the frame
      float bar = smoothstep(0.05, 0.0, abs(uv.y - (1.0 - roll))) ;
      uv.x += uK * (tear + bar * 0.04 * (h(fr) - 0.5) + 0.004 * sin(uv.y * 900.0 + uT * 40.0));
      float ca = uK * 0.006;
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(ca, 0.0)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - vec2(ca, 0.0)).b);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, vec3(l), uK * 0.35);
      c *= 1.0 - uK * 0.12 * step(0.5, fract(vUv.y * 480.0));          // scanlines
      c = mix(c, vec3(n2(vUv * 400.0 + fr)), uK * (0.06 + 0.55 * bar));  // snow, thick in the rolling bar
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export function addVhsPass(studio) {
  const pass = new ShaderPass(VhsShader);
  studio.composer.addPass(pass);
  const set = (k = 0, t = 0) => { pass.uniforms.uK.value = k; pass.uniforms.uT.value = t; pass.enabled = k > 0.001; };
  set(0);
  return { pass, set };
}
