// sim style: the lighting + grade preset — clean neutral daylight, soft shadows, slightly desaturated (the @officialwriteit look).
//   story.look = { ...SIM_LOOK }               (script.json "look" for narrated reels)
//   const L = simLights(studio, { sun, target, half })   once in build()
//   L.focus(x, z, half)    per shot: tighten the sun's shadow box around the action (sharper, cheaper shadows)
//   L.setDay(k)            1 = noon daylight, 0 = night (sky + sun + hemi fade; interior lamps carry the frame)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { lerp } from '../core.js';

export const SIM_LOOK = {
  exposure: 1.0, toneMapping: 'neutral', bloom: 0.05, bloomThreshold: 0.97, vignette: 0.1, grain: 0.008,
  warm: 0.03, saturation: 0.9, lift: 0.008, fill: 0.18, fillColor: 0xfff4e8,
};

export function simLights(studio, o = {}) {
  const { scene, renderer } = studio;
  // soft image-based ambient: three's RoomEnvironment, prefiltered once (gives every material a believable soft fill + reflections)
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = o.env ?? 0.42;
  const hemi = new THREE.HemisphereLight(o.sky ?? 0xd9e8f6, o.ground ?? 0x8d806c, o.hemi ?? 0.85); scene.add(hemi);
  const sun = new THREE.DirectionalLight(o.sunColor ?? 0xfff3e2, o.sunI ?? 2.4);
  const dir = new THREE.Vector3(...(o.sun ?? [-0.55, 1, 0.75])).normalize();
  sun.castShadow = true; sun.shadow.mapSize.set(o.shadowMap ?? 2048, o.shadowMap ?? 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  sun.shadow.radius = o.softness ?? 4; scene.add(sun, sun.target);
  const base = { hemi: hemi.intensity, sun: sun.intensity, env: scene.environmentIntensity };
  function focus(x = 0, z = 0, half = o.half ?? 9, y = 1) {
    sun.target.position.set(x, y, z); sun.position.set(x + dir.x * 30, y + dir.y * 30, z + dir.z * 30);
    const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = 1; c.far = 80; c.updateProjectionMatrix();
  }
  function setDay(k) {
    hemi.intensity = lerp(0.06, base.hemi, k); sun.intensity = lerp(0, base.sun, k); scene.environmentIntensity = lerp(0.05, base.env, k);
    hemi.color.set(0xd9e8f6).lerp(new THREE.Color(0x30406a), 1 - k);
  }
  focus(...(o.target ?? [0, 0]));
  return { hemi, sun, env, focus, setDay, dir };
}
