// Voxel style (068): a blocky polar bear — our own model (white fur voxels at bs 1/20 m, a cream snout, a black nose, 2 × 2 px
// eyes with a highlight, round ears, chunky paws with dark toe lines) built from boxModel parts on a small skeleton, so it can
// walk on all fours, SIT UP on its haunches with the front legs planted (the "Polar Bear 2026" pose), stand upright with free
// front paws (slap a board, hold a sheet, wave), nod, sing and whisper (an opening jaw with a tongue).
//   const bear = makeVoxBear();  scene.add(bear.root);   // ~2.5 m nose to tail, back 1.1 m at scale 1
//   bear.pose({ x, z, rotY, scale, mode: 'four' | 'sit' | 'upright', walk: phase (rad) | undefined, pitch (body, rad: front up),
//               head: { yaw, pitch (> 0 looks down), roll }, jaw: 0..1, eyes: 'open' | 'blink' | 'happy' | 'squint' | 'wide',
//               pawL / pawR: { x: WORLD angle of the front leg (0 = straight down, −1.57 = reaching forward, −2.7 = up), z: spread },
//               roll (body lean sideways) })
//   bear.phaseFor(dist)  gait phase for a walked distance;  bear.pawWorld('L'|'R'), bear.noseWorld(), bear.eyeWorld()
// The figure faces +z (like makeVoxPerson). pawL = the bear's left (+x). The root sits on the ground under the hips.
import * as THREE from 'three';
import { boxModel } from './vox.js';

const FUR = 0xf2efe6, FUR2 = 0xe2dccd, SNOUT = 0xece4d3, BELLY = 0xe7e0d0, PAW = 0xd6ccb8, DARK = 0x3a3436, NOSE = 0x1d1d22,
  EYE = 0x1d1d22, MOUTH = 0x5a1f2a, TONGUE = 0xd76a7c, INNER = 0xb8aca0;
const LEG = 13;                                   // leg length (px) from the hip / shoulder pivot to the bottom of the paw

export function makeVoxBear({ bs = 1 / 20, fur = FUR, shadows = true } = {}) {
  const root = new THREE.Group(); root.name = 'voxBear';
  const part = (boxes, parent, at = [0, 0, 0]) => {
    const g = new THREE.Group(); g.position.set(at[0] * bs, at[1] * bs, at[2] * bs); parent.add(g);
    const m = boxModel(boxes, { bs }); m.traverse((o) => { if (o.isMesh) { o.castShadow = shadows; o.receiveShadow = true; } }); g.add(m);
    return g;
  };
  // ---- body: pivot at the hips (rear-leg tops); the torso runs from z −4 (rump) to z 24 (chest)
  const body = new THREE.Group(); root.add(body);
  part([
    [-8, -4, -4, 7, 8, 23, fur], [-7, 9, -3, 6, 9, 22, fur], [-7, -5, 2, 6, -5, 20, BELLY],
    [-8, 3, 2, -8, 5, 6, FUR2], [7, 4, 9, 7, 6, 13, FUR2], [-8, 0, 15, -8, 2, 18, FUR2], [7, -1, 0, 7, 1, 3, FUR2], [-3, 9, 10, 2, 9, 14, FUR2],
    [-1, 5, -6, 0, 7, -5, fur],                                                    // tail nub
  ], body);
  // ---- head: pivot at the neck (top front of the torso); a long neck (polar bears have one), skull, snout, nose
  const head = new THREE.Group(); head.position.set(0, 4 * bs, 22 * bs); body.add(head);
  part([
    [-5, -4, 0, 4, 5, 5, fur], [-6, -3, 5, 5, 8, 13, fur], [-5, 9, 6, 4, 9, 12, fur],
    [-3, -2, 14, 2, 1, 18, SNOUT], [-3, -3, 14, 2, -3, 18, MOUTH], [-2, 2, 14, 1, 2, 17, SNOUT],
    [-1, 0, 19, 0, 1, 19, NOSE], [-2, 1, 18, 1, 1, 18, NOSE],
    [-6, 9, 8, -4, 10, 9, fur], [-5, 9, 9, -5, 9, 9, INNER], [3, 9, 8, 5, 10, 9, fur], [4, 9, 9, 4, 9, 9, INNER],   // ears
    [-6, 0, 12, -6, 2, 13, FUR2], [5, 0, 12, 5, 2, 13, FUR2],
  ], head);
  // eyes (own group: blink = squash in y around the eye centre), happy arcs, brows
  const eyes = new THREE.Group(); eyes.position.set(0, 5 * bs, 0); head.add(eyes);
  part([[-5, -1, 14, -4, 0, 14, EYE], [-4, 0, 14, -4, 0, 14, 0xffffff], [3, -1, 14, 4, 0, 14, EYE], [4, 0, 14, 4, 0, 14, 0xffffff]], eyes);
  const happy = part([[-6, 4, 14, -6, 4, 14, EYE], [-5, 5, 14, -4, 5, 14, EYE], [-3, 4, 14, -3, 4, 14, EYE], [2, 4, 14, 2, 4, 14, EYE], [3, 5, 14, 4, 5, 14, EYE], [5, 4, 14, 5, 4, 14, EYE]], head);
  const brows = part([[-6, 7, 14, -4, 7, 14, 0x9a9086], [3, 7, 14, 5, 7, 14, 0x9a9086]], head);
  // jaw: hinged under the snout (rotation.x > 0 opens it); the tongue shows on top when open
  const jaw = new THREE.Group(); jaw.position.set(0, -3 * bs, 14 * bs); head.add(jaw);
  part([[-3, -2, 0, 2, -1, 4, SNOUT], [-2, -1, 1, 1, -1, 3, TONGUE], [-4, -2, -3, 3, -1, -1, fur]], jaw);
  // ---- legs: front ones hang from the shoulders (children of the body), rear ones from the hips (children of the root)
  const legBoxes = (thigh) => [
    [-3, -12, -3, 2, -1, 2, fur], ...(thigh ? [[-3, -6, -4, 2, -1, 3, fur], [-4, -5, -3, 3, -1, 2, fur]] : [[-3, -5, -3, 2, -1, 3, fur]]),
    [-3, -13, -3, 2, -12, 3, PAW], [-2, -13, 3, -2, -12, 3, DARK], [0, -13, 3, 0, -12, 3, DARK], [2, -13, 3, 2, -13, 3, DARK],
  ];
  const legs = {};
  for (const [k, sx, front] of [['FL', 1, true], ['FR', -1, true], ['RL', 1, false], ['RR', -1, false]]) {
    const pivot = new THREE.Group();
    if (front) { pivot.position.set(sx * 5 * bs, 0, 19 * bs); body.add(pivot); } else { pivot.position.set(sx * 5 * bs, LEG * bs, 0); root.add(pivot); }
    const scaler = new THREE.Group(); pivot.add(scaler);           // scale.y stretches a planted front leg when the bear sits up
    part(legBoxes(!front), scaler);
    const paw = new THREE.Group(); paw.position.set(0, -LEG * bs, 1 * bs); scaler.add(paw);
    legs[k] = { pivot, scaler, paw, side: sx, front };
  }

  const _q = new THREE.Quaternion(), _e = new THREE.Euler();
  /** the hip height (px) and front-leg stretch for a body pitch while sitting: the rump's lowest corner rests on the ground */
  function sitGeom(pitch) {
    const c = Math.cos(pitch), s = Math.sin(pitch);
    const lowY = Math.min(...[[-4, -4], [-5, 2], [-4, 23]].map(([y, z]) => y * c + z * s));   // body corners after the pitch (y' = y cos p + z sin p)
    const hip = -lowY + 0.3;
    const shoulder = hip + 0 * c + 19 * s;
    return { hip, stretch: Math.max(1, shoulder / LEG) };
  }
  function pose(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(0, p.rotY ?? 0, 0);
    if (p.scale !== undefined) root.scale.setScalar(p.scale);
    const mode = p.mode ?? 'four', ph = p.walk, walking = ph !== undefined && ph !== null, sw = walking ? Math.sin(ph) : 0;
    const pitch = p.pitch ?? (mode === 'sit' ? 0.62 : mode === 'upright' ? 1.32 : 0);
    let hip = LEG, stretch = 1;
    if (mode === 'sit') ({ hip, stretch } = sitGeom(pitch));
    else if (mode === 'four') hip = LEG + (walking ? Math.abs(Math.cos(ph)) * 0.5 : 0);
    body.position.set(0, hip * bs, 0); body.rotation.set(-pitch, 0, p.roll ?? 0);
    // rear legs
    for (const k of ['RL', 'RR']) {
      const L = legs[k]; L.pivot.position.y = hip * bs; L.scaler.scale.y = 1;
      if (mode === 'sit') L.pivot.rotation.set(-1.3, 0, 0.12 * L.side);
      else L.pivot.rotation.set(walking ? (k === 'RR' ? sw : -sw) * 0.5 : 0, 0, mode === 'upright' ? 0.06 * L.side : 0);
    }
    // front legs: angles are WORLD angles (pitch is cancelled), so 0 = straight down whatever the body does
    for (const k of ['FL', 'FR']) {
      const L = legs[k], a = (k === 'FL' ? p.pawL : p.pawR) || {};
      let wx = a.x ?? (mode === 'upright' ? -0.35 : 0);
      if (walking && a.x === undefined) wx = (k === 'FL' ? sw : -sw) * 0.5;
      L.pivot.rotation.set(pitch + wx, 0, (a.z ?? (mode === 'upright' ? 0.18 : 0)) * L.side);
      L.scaler.scale.y = mode === 'sit' && a.x === undefined ? stretch : 1;
    }
    // head: level it against the body pitch, then yaw / pitch / roll
    const hp = p.head?.pitch ?? (mode === 'four' ? 0.12 : 0) + (walking ? Math.sin(ph * 2) * 0.04 : 0);
    head.quaternion.setFromEuler(_e.set(pitch, 0, 0)).multiply(_q.setFromEuler(_e.set(hp, p.head?.yaw ?? 0, p.head?.roll ?? 0, 'YXZ')));
    jaw.rotation.x = 0.62 * Math.max(0, Math.min(1, p.jaw ?? 0));
    const ey = p.eyes ?? 'open';
    eyes.visible = ey !== 'happy'; happy.visible = ey === 'happy'; brows.visible = ey === 'squint';
    eyes.scale.set(ey === 'wide' ? 1.25 : 1, ey === 'blink' ? 0.18 : ey === 'squint' ? 0.5 : ey === 'wide' ? 1.3 : 1, 1);
  }
  const phaseFor = (dist, s = 1) => (dist / (4 * LEG * bs * s * Math.sin(0.5) * 2)) * Math.PI * 2;
  const pawWorld = (side, out = new THREE.Vector3()) => { root.updateMatrixWorld(true); return legs[side === 'L' ? 'FL' : 'FR'].paw.getWorldPosition(out); };
  const noseWorld = (out = new THREE.Vector3()) => { root.updateMatrixWorld(true); return head.localToWorld(out.set(0, 1 * bs, 20 * bs)); };
  const eyeWorld = (out = new THREE.Vector3()) => { root.updateMatrixWorld(true); return head.localToWorld(out.set(0, 5 * bs, 14 * bs)); };
  pose({});
  return { root, body, head, jaw, eyes, legs, bs, pose, phaseFor, pawWorld, noseWorld, eyeWorld };
}
