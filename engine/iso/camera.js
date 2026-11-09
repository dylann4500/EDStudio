// iso style (060): the camera rig — a long lens high above a tabletop, looking down ~35°, framed by WIDTH (metres across the
// frame at the target), with a gentle orbit drift. A long-lens perspective camera (not an OrthographicCamera) keeps every
// engine tool working (studio.camera, motion blur, bearing.py) and adds just enough perspective to feel like a photo.
//   isoCam(studio, { target: [x, y, z], az: deg, el: deg, frame: m, fov: deg, roll: deg })   every frame (az 0 = camera on +z)
//   const v = isoAt(t, [[t0, {tx, ty, tz, az, el, frame}], [t1, {...}]], { drift })        keyframed shot (eased per field)
//   isoView(o) → { pos, target, fov, dist }   the maths alone (for bearing checks)
import * as THREE from 'three';
import { K, W, H } from '../core.js';

const D2R = Math.PI / 180;

export function isoView({ target = [0, 0, 0], az = 45, el = 35, frame = 20, fov = 16 } = {}) {
  const hf = 2 * Math.atan(Math.tan((fov * D2R) / 2) * (W / H));
  const dist = frame / 2 / Math.tan(hf / 2);
  const a = az * D2R, e = el * D2R;
  const pos = [target[0] + dist * Math.sin(a) * Math.cos(e), target[1] + dist * Math.sin(e), target[2] + dist * Math.cos(a) * Math.cos(e)];
  return { pos, target, fov, dist };
}

const _t = new THREE.Vector3();
export function isoCam(studio, o = {}) {
  const v = isoView(o), cam = studio.camera;
  cam.position.set(...v.pos); cam.fov = v.fov;
  cam.near = Math.max(0.3, v.dist - (o.depth ?? 4) * (o.frame ?? 20)); cam.far = v.dist + (o.depth ?? 4) * (o.frame ?? 20) + (o.farPad ?? 0);
  cam.up.set(0, 1, 0); cam.updateProjectionMatrix(); cam.lookAt(_t.set(...v.target));
  if (o.roll) cam.rotateZ(o.roll * D2R);
  cam.updateMatrixWorld();
  return v;
}

/** Keyframed iso shot: keys = [[t, {tx, ty, tz, az, el, frame, fov}], …] (missing fields carry over); drift = deg/s of slow orbit
 *  added on top (the "gentle turntable" every iso shot has). Returns the isoCam options. */
export function isoAt(t, keys, { drift = 0, ease } = {}) {
  const f = (name, def) => {
    const ks = []; let last = def;
    for (const [kt, v] of keys) { if (v[name] !== undefined) last = v[name]; ks.push([kt, last]); }
    return K(t, ks, ease);
  };
  const t0 = keys[0][0];
  return {
    target: [f('tx', 0), f('ty', 0), f('tz', 0)], az: f('az', 45) + drift * (t - t0), el: f('el', 35), frame: f('frame', 20), fov: f('fov', 16),
  };
}
