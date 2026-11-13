// POV story body (086, docs/POVSTORY.md): the viewer IS the main character. Their arms come up from the bottom of the frame
// (hoodie sleeves + simple cartoon hands), a phone lives in the left hand, and the camera is their head: moves() = eased head
// turns/ducks that hold between moves, shake() = handheld breathing/nerves. All pure in t (stills at any time render the same).
//   const arms = makePovArms(studio.camera, { sleeve: 0x5b6475, cuff: 0x4a5262, skin: 0xf0c49c });
//   arms.L.set({ cam: [x, y, z], rot: [rx, ry, rz], pose: 'rest' | 'point' | 'flat' | 'fist' | 'hidden' })   // camera-space hand
//   arms.L.hold(phone)                                  // the left hand becomes the phone's grip (fingers round its edges)
//   const ph = makePhone({ w: 0.072, h: 0.152 }); studio.camera.add(ph.g); ph.g.position.set(...)   // screen faces +z
//   ph.setMap(texture)   ph.setOn(k)   ph.light (a weak PointLight that lights the hands from the screen)
//   const head = moves(t, start, [{ t, d, p: [x,y,z], yaw, pitch, roll, fov, ease }])   // a move ARRIVES at t after d s, then holds
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, easeIO, easeOut, rng } from '../core.js';

const toon = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const UP = new THREE.Vector3(0, 1, 0);

// ---- hands ------------------------------------------------------------------------------------------------------------
// Hand-local frame: wrist at the origin, fingers point −z, back of the hand +y (palm faces −y), thumb toward the body's
// middle (+x for the left hand, −x for the right). ~1.25× a real hand: POV hands this close read small otherwise.
function makeHand(side, skin) {
  const g = new THREE.Group(), M = toon(skin);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), M); palm.scale.set(1.0, 0.5, 1.1); palm.position.set(0, 0, -0.05); g.add(palm);
  const fingers = [];
  for (let i = 0; i < 4; i++) {   // index (toward the thumb) … little
    const f = new THREE.Group(); f.position.set(side * (0.034 - i * 0.023), 0, -0.098 + Math.abs(i - 1.2) * 0.006); g.add(f);
    const L = 0.05 - Math.abs(i - 1.3) * 0.006;
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.0125, L, 4, 10), M); c.rotation.x = Math.PI / 2; c.position.z = -L / 2; f.add(c);
    fingers.push(f);
  }
  const thumb = new THREE.Group(); thumb.position.set(side * 0.05, -0.006, -0.038); g.add(thumb);
  const tc = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.04, 4, 10), M); tc.rotation.x = Math.PI / 2; tc.position.z = -0.026; thumb.add(tc);
  thumb.rotation.y = side * 0.75;
  const pose = (k) => {   // finger curls per preset
    const P = { rest: [0.35, 0.3, 0.3, 0.35, 0.2], flat: [0.05, 0.05, 0.05, 0.08, 0.05], point: [0.05, 1.5, 1.6, 1.6, 0.9], fist: [1.5, 1.6, 1.6, 1.6, 1.0] }[k] || [0.3, 0.3, 0.3, 0.3, 0.2];
    fingers.forEach((f, i) => { f.rotation.x = -P[i]; });
    thumb.rotation.x = -P[4] * 0.6;
  };
  pose('rest');
  return { g, pose, M };
}

// ---- arms ------------------------------------------------------------------------------------------------------------
export function makePovArms(camera, { sleeve = 0x5b6475, cuff = 0x4a5262, skin = 0xf0c49c, shoulderX = 0.2, shoulderY = -0.42, shoulderZ = 0.12 } = {}) {
  const root = new THREE.Group(); camera.add(root);
  const SM = toon(sleeve), CM = toon(cuff);
  const mkArm = (side) => {
    const sh = new THREE.Vector3(side * shoulderX, shoulderY, shoulderZ);
    const sleeveM = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 1, 18, 1, false), SM); root.add(sleeveM);
    const cuffM = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 18), CM); root.add(cuffM);
    const hand = makeHand(side, skin); root.add(hand.g);
    const wrist = new THREE.Vector3(), dir = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let held = null;
    const api = {
      hand, sleeve: sleeveM, cuff: cuffM,
      /** {cam: [x,y,z] wrist in camera space, rot: [rx,ry,rz] hand orientation in camera space, pose, visible} */
      set(o = {}) {
        const vis = o.visible !== false && o.pose !== 'hidden';
        sleeveM.visible = cuffM.visible = vis; hand.g.visible = vis && !held;
        if (!vis) return api;
        if (held) {   // the phone's grip IS the hand: the wrist sits at the phone's lower back, the sleeve runs to it
          held.g.updateMatrix(); wrist.set(0.006, -held.H * 0.47, -0.05).applyMatrix4(held.g.matrix);
        } else {
          wrist.fromArray(o.cam || [side * 0.16, -0.3, -0.42]);
          hand.g.position.copy(wrist); hand.g.rotation.set(...(o.rot || [0, 0, 0]), 'YXZ');
          hand.pose(o.pose || 'rest');
        }
        // sleeve from the shoulder to just behind the wrist, cuff at the wrist
        dir.subVectors(wrist, sh); const len = dir.length(); dir.normalize();
        q.setFromUnitVectors(UP, dir);
        const L = Math.max(0.05, len - 0.03);
        sleeveM.quaternion.copy(q); sleeveM.scale.set(1, L, 1); sleeveM.position.copy(sh).addScaledVector(dir, L / 2);
        cuffM.quaternion.copy(q); cuffM.position.copy(sh).addScaledVector(dir, L - 0.005);
        return api;
      },
      hold(ph) { held = ph; if (ph) ph.grip.visible = true; hand.g.visible = !ph; return api; },
    };
    return api;
  };
  return { root, L: mkArm(-1), R: mkArm(1) };
}

// ---- phone -----------------------------------------------------------------------------------------------------------
/** A phone (screen faces +z, up +y) with an optional left-hand grip (palm behind, four finger tips round the right edge,
 *  the thumb on the left edge — how the reference reels hold it). setMap(tex) puts any texture on the screen (a canvas UI,
 *  a render target = a video call / the camera viewfinder); setOn(k) dims it (0 = black glass). */
export function makePhone({ w = 0.072, h = 0.152, d = 0.009, body = 0x17181d, skin = 0xf0c49c, light = 0.5 } = {}) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, 0.009), toon(body)); g.add(shell);
  const SM = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, h - 0.006), SM); screen.position.z = d / 2 + 0.0004; g.add(screen);
  const UM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, toneMapped: false });
  const ui = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, h - 0.006), UM); ui.position.z = d / 2 + 0.0009; ui.visible = false; g.add(ui);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, h - 0.006), new THREE.MeshBasicMaterial({ color: 0x05060a })); glass.position.z = d / 2 + 0.0002; g.add(glass);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 14), toon(0x0c0d10)); lens.rotation.x = Math.PI / 2; lens.position.set(-w * 0.28, h * 0.4, -d / 2 - 0.001); g.add(lens);
  const flashDot = new THREE.Mesh(new THREE.CircleGeometry(0.003, 12), new THREE.MeshBasicMaterial({ color: 0xfff4d0, toneMapped: false })); flashDot.position.set(-w * 0.12, h * 0.42, -d / 2 - 0.0016); flashDot.rotation.y = Math.PI; g.add(flashDot);
  const pl = new THREE.PointLight(0xcfe0ff, 0, 1.2, 2); pl.position.set(0, 0, 0.12); g.add(pl);
  // grip
  const grip = new THREE.Group(); g.add(grip); grip.visible = false;
  const SK = toon(skin);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.052, 18, 12), SK); palm.scale.set(0.95, 1.25, 0.42); palm.position.set(0.008, -h * 0.26, -0.026); grip.add(palm);
  for (let i = 0; i < 4; i++) {   // finger tips round the right edge, a little over the glass (tips only: knuckle capsules behind them read as 8 blobs)
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 12, 10), SK); f.scale.set(1.15, 0.95, 0.85);
    f.position.set(w / 2 + 0.002, h * 0.14 - i * 0.03, 0.0035); grip.add(f);
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0155, 0.042, 4, 10), SK); thumb.position.set(-w / 2 - 0.002, -h * 0.2, 0.003); thumb.rotation.z = -0.35; grip.add(thumb);
  let on = 1;
  return {
    g, screen, ui, grip, light: pl, flashDot, W: w, H: h, D: d,
    setMap(tex) { if (SM.map !== tex) { SM.map = tex; SM.needsUpdate = true; } },
    /** a transparent canvas texture drawn over the screen (app UI over a live camera / call image); null hides it */
    setUI(tex) { ui.visible = !!tex && on > 0.003; if (tex && UM.map !== tex) { UM.map = tex; UM.needsUpdate = true; } },
    setOn(k) { on = clamp(k); SM.color.setScalar(on); UM.color.setScalar(on); screen.visible = on > 0.003; if (on <= 0.003) ui.visible = false; pl.intensity = light * on; },
    get on() { return on; },
  };
}

// ---- head motion -----------------------------------------------------------------------------------------------------
const EASE = { io: easeIO, out: easeOut, whip: (u) => { u = clamp(u); return 1 - Math.pow(1 - u, 4); }, lin: (u) => clamp(u) };
/** Head track: start = {p:[x,y,z], yaw, pitch, roll, fov}; each move {t, d, …fields} arrives at t after d seconds (eased) and
 *  holds until the next move. Fields you leave out keep their value. Yaw 0 = looking −z, + = turn left; pitch + = look up. */
export function moves(t, start, list) {
  const v = { p: [...start.p], yaw: start.yaw ?? 0, pitch: start.pitch ?? 0, roll: start.roll ?? 0, fov: start.fov ?? 90 };
  for (const m of list) {
    const d = m.d ?? 0.5, u = (EASE[m.ease || 'io'])(clamp((t - (m.t - d)) / d));
    if (u <= 0) break;
    if (m.p) for (let i = 0; i < 3; i++) v.p[i] += (m.p[i] - v.p[i]) * u;
    for (const k of ['yaw', 'pitch', 'roll', 'fov']) if (m[k] !== undefined) v[k] += (m[k] - v[k]) * u;
  }
  return v;
}

/** Handheld noise in radians/metres: slow drift + breathing bob, scaled by amp (1 = calm, 3 = scared). Deterministic. */
export function shake(t, amp = 1, seed = 7) {
  const R = rng(seed), ph = [0, 1, 2, 3, 4, 5].map(() => R() * 6.283);
  const s = (f, i) => Math.sin(t * f + ph[i]);
  return {
    yaw: amp * 0.006 * (s(0.7, 0) + 0.5 * s(1.9, 1)),
    pitch: amp * 0.005 * (s(0.9, 2) + 0.5 * s(2.3, 3)) + 0.004 * Math.sin(t * 1.6),
    roll: amp * 0.004 * s(0.6, 4),
    y: 0.006 * Math.sin(t * 1.6 + 1) * Math.min(1, amp),
  };
}

/** Put the camera at a head pose (+ optional shake). YXZ order: yaw, then pitch, then roll. */
export function setHead(camera, h, sh = null, offset = null) {
  const o = offset || [0, 0, 0];
  camera.position.set(h.p[0] + o[0], h.p[1] + o[1] + (sh ? sh.y : 0), h.p[2] + o[2]);
  camera.rotation.set(h.pitch + (sh ? sh.pitch : 0), h.yaw + (sh ? sh.yaw : 0), h.roll + (sh ? sh.roll : 0), 'YXZ');
  if (camera.fov !== h.fov) { camera.fov = h.fov; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld(true);
}
