// iso style (060): the miniature-world look — warm saturated toy colours, a soft studio-like sun, a gradient backdrop.
//   story.look = { ...ISO_LOOK }                         (copy the values into story.json; main.js builds the studio from it)
//   const L = isoLights(studio, { sun: [-0.6, 1, 0.5] })   once in build()
//   L.focus(x, z, half)      per shot: the sun's shadow box around the diorama on screen (sharper, cheaper shadows)
//   L.setNight(k)            0 = day, 1 = a blue night (sun → moon, hemi down): lamps + windows carry the frame
//   const bd = isoBackdrop(studio, { top, bottom, glow })   the soft gradient void the dioramas float in; bd.set({...}) per shot
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { lerp } from '../core.js';

// ACES, a touch over-exposed, saturated + warm: the "tabletop photographed in a sunny window" grade.
export const ISO_LOOK = {
  exposure: 1.12, bloom: 0.16, bloomThreshold: 0.9, vignette: 0.22, grain: 0.012, warm: 0.1, saturation: 1.22, lift: 0.01, fill: 0,
};

export function isoLights(studio, o = {}) {
  const { scene, renderer } = studio;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = o.env ?? 0.38;
  const hemi = new THREE.HemisphereLight(o.sky ?? 0xd6e6ff, o.ground ?? 0xc8a070, o.hemi ?? 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(o.sunColor ?? 0xffe9cc, o.sunI ?? 2.7);
  const dir = new THREE.Vector3(...(o.sun ?? [-0.62, 1, 0.48])).normalize();
  sun.castShadow = true; sun.shadow.mapSize.set(o.shadowMap ?? 4096, o.shadowMap ?? 4096);
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = o.softness ?? 3;
  scene.add(sun, sun.target);
  const base = { hemi: hemi.intensity, sun: sun.intensity, env: scene.environmentIntensity };
  const DAY = { sky: new THREE.Color(o.sky ?? 0xd6e6ff), sunC: new THREE.Color(o.sunColor ?? 0xffe9cc) };
  const NIGHT = { sky: new THREE.Color(0x3a4f8a), sunC: new THREE.Color(0x9fb4ff) };
  function focus(x = 0, z = 0, half = o.half ?? 14, y = 0) {
    sun.target.position.set(x, y, z); sun.position.set(x + dir.x * 60, y + dir.y * 60, z + dir.z * 60);
    const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = 160; c.updateProjectionMatrix();
  }
  function setNight(k) {
    hemi.intensity = lerp(base.hemi, 0.42, k); sun.intensity = lerp(base.sun, 0.55, k); scene.environmentIntensity = lerp(base.env, 0.1, k);
    hemi.color.copy(DAY.sky).lerp(NIGHT.sky, k); sun.color.copy(DAY.sunC).lerp(NIGHT.sunC, k);
  }
  focus(...(o.target ?? [0, 0]));
  return { hemi, sun, env, dir, focus, setNight };
}

/** The void behind the dioramas: a vertical gradient + a soft glow behind the subject, drawn as the scene background
 *  (screen-space, so it never moves with the camera — the dioramas float in front of it). */
export function isoBackdrop(studio, o = {}) {
  const c = document.createElement('canvas'); c.width = 270; c.height = 480;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const st = { top: '#bfe0f2', bottom: '#f6dcc4', glow: '#fff6e6', glowY: 0.46, glowA: 0.75, ...o };
  function set(p = {}) {
    Object.assign(st, p);
    const lg = g.createLinearGradient(0, 0, 0, c.height); lg.addColorStop(0, st.top); lg.addColorStop(1, st.bottom);
    g.fillStyle = lg; g.fillRect(0, 0, c.width, c.height);
    const rg = g.createRadialGradient(c.width / 2, c.height * st.glowY, 0, c.width / 2, c.height * st.glowY, c.height * 0.55);
    rg.addColorStop(0, st.glow); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalAlpha = st.glowA; g.fillStyle = rg; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1;
    tex.needsUpdate = true;
  }
  set();
  studio.scene.background = tex;
  return { tex, set, state: st };
}

/** Floating dust/bokeh motes in the void around a diorama (instanced soft dots; they give a moving camera parallax
 *  against the screen-space backdrop). Call m.update(t) each frame. */
export function makeMotes(parent, { n = 70, box = [60, 40, 60], center = [0, 6, 0], seed = 7, color = 0xfff3dc, size = 0.35, opacity = 0.5 } = {}) {
  let s = seed >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: opacity * (0.4 + 0.6 * r()), depthWrite: false, fog: false }));
    m.userData = { x: (r() - 0.5) * box[0], y: (r() - 0.5) * box[1], z: (r() - 0.5) * box[2], ph: r() * 6.28, sc: size * (0.5 + r()) };
    m.scale.setScalar(m.userData.sc); parent.add(m); pts.push(m);
  }
  return {
    pts,
    update(t) { for (const m of pts) { const u = m.userData; m.position.set(center[0] + u.x + Math.sin(t * 0.21 + u.ph) * 0.8, center[1] + u.y + Math.sin(t * 0.33 + u.ph * 2) * 0.6, center[2] + u.z); } },
    setVisible(v) { for (const m of pts) m.visible = v; },
  };
}
