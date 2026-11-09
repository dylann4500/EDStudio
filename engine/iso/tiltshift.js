// iso style (060): a depth-aware TILT-SHIFT pass — the shallow depth of field of a macro lens on a tabletop miniature.
//   const ts = addTiltShift(studio, { blur: 26, range: 3, ramp: 10 });   // once in build(), after createStudio
//   ts.focusOn([x, y, z])        every frame (world point that is pin sharp; usually the subject on the diorama)
//   ts.set({ blur, range, ramp, band, bandH, bandMix })                    per shot when a framing needs it
// How it works: the scene's depth is rendered once more into a depth texture (a colour-less override pass, transparent
// sprites/smoke excluded, shadow maps not re-rendered), a circle of confusion grows with the distance from the focus plane
// (|z − focus| − range, full blur `ramp` metres further), plus an optional screen-y term (the classic fake tilt-shift strip),
// a half-res golden-angle gather blur (Gustafsson's single-pass bokeh: far samples can't bleed over sharp near pixels), and a
// full-res composite (sharp where the CoC is ~0). Inserted BEFORE bloom, in linear HDR, so blurred highlights bloom softly.
// The DOM text overlay (#ui) is never touched: captions, HUD and the end card stay crisp.
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { W, H } from '../core.js';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const COMMON = `
  #include <packing>
  uniform sampler2D tDepth; uniform float uNear, uFar, uFocus, uRange, uRamp, uBandY, uBandH, uBandFall, uBandMix;
  float linZ(vec2 uv){ float d = texture2D(tDepth, uv).x; return -perspectiveDepthToViewZ(d, uNear, uFar); }
  // 0 = sharp … 1 = full blur
  float cocAt(vec2 uv, float z){
    float cd = clamp((abs(z - uFocus) - uRange) / uRamp, 0.0, 1.0);
    float cy = clamp((abs(uv.y - uBandY) - uBandH) / uBandFall, 0.0, 1.0) * uBandMix;
    float c = max(cd, cy);
    return c * c * (3.0 - 2.0 * c) * 0.85 + c * 0.15;
  }`;

// pass 1 (half res): colour + CoC (px at half res) in alpha
const PrepShader = {
  uniforms: {}, vertexShader: VS,
  fragmentShader: COMMON + `
    uniform sampler2D tColor; uniform float uMaxH; varying vec2 vUv;
    void main(){ float z = linZ(vUv); gl_FragColor = vec4(texture2D(tColor, vUv).rgb, cocAt(vUv, z) * uMaxH); }`,
};
// pass 2 (half res): golden-angle gather
const BlurShader = {
  uniforms: {}, vertexShader: VS,
  fragmentShader: COMMON + `
    uniform sampler2D tPrep; uniform vec2 uTexel; uniform float uMaxH, uStep; varying vec2 vUv;
    void main(){
      vec4 c0 = texture2D(tPrep, vUv); float cz = linZ(vUv), cs = c0.a;
      vec3 col = c0.rgb; float tot = 1.0, r = uStep, ang = 0.0;
      for (int i = 0; i < 260; i++) {
        if (r >= uMaxH) break;
        vec2 tc = vUv + vec2(cos(ang), sin(ang)) * uTexel * r;
        vec4 s = texture2D(tPrep, tc); float ss = s.a;
        if (linZ(tc) > cz) ss = clamp(ss, 0.0, cs * 2.0);       // a far sample never bleeds over a sharper near pixel
        float m = smoothstep(r - 0.5, r + 0.5, ss);
        col += mix(col / tot, s.rgb, m); tot += 1.0;
        ang += 2.39996323; r += uStep / r;
      }
      gl_FragColor = vec4(col / tot, cs);
    }`,
};
// pass 3 (full res): sharp ↔ blurred by the full-res CoC
const MixShader = {
  uniforms: {}, vertexShader: VS,
  fragmentShader: COMMON + `
    uniform sampler2D tColor, tBlur; uniform float uMaxH, uDebug; varying vec2 vUv;
    void main(){
      vec4 s = texture2D(tColor, vUv); float c = cocAt(vUv, linZ(vUv)) * uMaxH;   // half-res px
      vec3 b = texture2D(tBlur, vUv).rgb;
      vec3 o = mix(s.rgb, b, smoothstep(0.15, 1.1, c));
      if (uDebug > 0.5) o = vec3(c / uMaxH, 1.0 - c / uMaxH, 0.0) * 0.6 + o * 0.4;
      gl_FragColor = vec4(o, s.a);
    }`,
};

function uniformsFor(extra) {
  return {
    tDepth: { value: null }, uNear: { value: 0.1 }, uFar: { value: 100 }, uFocus: { value: 10 }, uRange: { value: 2 }, uRamp: { value: 8 },
    uBandY: { value: 0.5 }, uBandH: { value: 0.16 }, uBandFall: { value: 0.3 }, uBandMix: { value: 0 }, uMaxH: { value: 13 }, ...extra,
  };
}

class TiltShiftPass extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene; this.camera = camera; this.focusPoint = new THREE.Vector3(); this.focusDist = null;
    const w = W / 2, h = H / 2;
    this.depthRT = new THREE.WebGLRenderTarget(W, H, { depthTexture: new THREE.DepthTexture(W, H), samples: 0 });
    this.prepRT = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.blurRT = this.prepRT.clone();
    this.depthMat = new THREE.MeshBasicMaterial({ colorWrite: false });
    const mk = (S, extra) => new THREE.ShaderMaterial({ uniforms: uniformsFor(extra), vertexShader: S.vertexShader, fragmentShader: S.fragmentShader, depthTest: false, depthWrite: false });
    this.prep = mk(PrepShader, { tColor: { value: null } });
    this.blur = mk(BlurShader, { tPrep: { value: this.prepRT.texture }, uTexel: { value: new THREE.Vector2(1 / w, 1 / h) }, uStep: { value: 0.8 } });
    this.mix = mk(MixShader, { tColor: { value: null }, tBlur: { value: this.blurRT.texture }, uDebug: { value: 0 } });
    this.mats = [this.prep, this.blur, this.mix];
    this.quad = new FullScreenQuad(null);
    this._hide = []; this._v = new THREE.Vector3();
  }
  setU(name, v) { for (const m of this.mats) if (m.uniforms[name]) m.uniforms[name].value = v; }
  render(renderer, writeBuffer, readBuffer) {
    const cam = this.camera, scene = this.scene;
    // 1. depth of the opaque scene (sprites, smoke, glows and anything flagged userData.noDepth are left out)
    const hide = this._hide; hide.length = 0;
    scene.traverseVisible((o) => {
      const m = o.material;
      if (o.isSprite || o.isPoints || o.isLine || o.userData.noDepth || (m && !Array.isArray(m) && m.transparent && !m.depthWrite)) hide.push(o);
    });
    for (const o of hide) o.visible = false;
    const bg = scene.background, ov = scene.overrideMaterial, au = renderer.shadowMap.autoUpdate;
    scene.background = null; scene.overrideMaterial = this.depthMat; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.depthRT); renderer.clear(); renderer.render(scene, cam);
    scene.background = bg; scene.overrideMaterial = ov; renderer.shadowMap.autoUpdate = au;
    for (const o of hide) o.visible = true;
    // focus distance from the world point (camera matrices are current here)
    const f = this.focusDist ?? -this._v.copy(this.focusPoint).applyMatrix4(cam.matrixWorldInverse).z;
    this.setU('tDepth', this.depthRT.depthTexture); this.setU('uNear', cam.near); this.setU('uFar', cam.far); this.setU('uFocus', f);
    // 2. half-res prep + gather, 3. full-res mix
    this.prep.uniforms.tColor.value = readBuffer.texture; this.quad.material = this.prep;
    renderer.setRenderTarget(this.prepRT); this.quad.render(renderer);
    this.quad.material = this.blur; renderer.setRenderTarget(this.blurRT); this.quad.render(renderer);
    this.mix.uniforms.tColor.value = readBuffer.texture; this.quad.material = this.mix;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
  }
}

/**
 * Add the tilt-shift pass (before bloom). o: blur = max blur radius in output px at 1080 wide (default 26), range = in-focus
 * half-depth in metres (3), ramp = metres beyond it to full blur (10), band/bandH/bandMix = optional screen-y strip (centre
 * 0..1 from the bottom, half-height, strength 0..1 — off by default; the depth term already blurs the top and bottom of a
 * look-down shot), debug = true tints the CoC (green sharp → red blurred).
 */
export function addTiltShift(studio, o = {}) {
  const pass = new TiltShiftPass(studio.scene, studio.camera);
  const passes = studio.composer.passes, i = passes.indexOf(studio.bloom);
  studio.composer.insertPass(pass, i < 0 ? passes.length : i);
  const st = { blur: 26, range: 3, ramp: 10, band: 0.5, bandH: 0.16, bandFall: 0.3, bandMix: 0, debug: false };
  function set(p = {}) {
    Object.assign(st, p);
    pass.setU('uMaxH', st.blur / 2); pass.setU('uRange', st.range); pass.setU('uRamp', Math.max(0.01, st.ramp));
    pass.setU('uBandY', st.band); pass.setU('uBandH', st.bandH); pass.setU('uBandFall', Math.max(0.01, st.bandFall)); pass.setU('uBandMix', st.bandMix);
    pass.mix.uniforms.uDebug.value = st.debug ? 1 : 0;
    pass.enabled = st.blur > 0.5;
  }
  set(o);
  return {
    pass, set, state: st,
    focusOn(p) { pass.focusDist = null; if (p.isVector3) pass.focusPoint.copy(p); else pass.focusPoint.set(p[0], p[1], p[2]); },
    focusAt(dist) { pass.focusDist = dist; },
  };
}
