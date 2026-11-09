// 063 (the f-word explainer #3, "How f*cking penguins f*cking survive f*cking Antarctica"): a toon emperor penguin with the build
// cast's face kit (big eyes + lids + pupils that look, a beak that opens for screams), an instanced huddle of hundreds, an egg, a
// leopard seal, and an Antarctic sea-ice set (colony plain, a floe edge with open water, ice cliffs + icebergs across the water,
// mountains inland, a pastel polar sky, a polar night with an aurora for time-lapses, blizzard fog + blowing snow).
//   const P = makePenguin({ tuft: true }); scene.add(P.root);
//   P.set({ x, z, rotY, waddle: phase, lie: 0..1 (belly slide), flipL/flipR: { z: out, x: fwd }, head: { x, y, z }, eyes, look,
//           brows, mouth: 'flat'|'o'|'scream'|'smile', drift 0..1 (snowed in), ice 0..1 (frozen in a block), frost 0..1, thin 0..1,
//           pouch 0..1 (the brood fold over the egg), shades, hot 0..1 (red-faced), squash [sx, sy], scale, t });
// Model faces +z, feet at the origin, ~1.1 m to the top of the head. eyes: 'open'|'wide'|'half'|'closed'|'happy'|'spiral'|'x'.
import * as THREE from 'three';
import { clamp, lerp, mk, rng, canvasTex } from '../core.js';
import { makeShades } from './toon.js';

const PI = Math.PI, TAU = PI * 2;
const std = (color, roughness = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

let EYEFX = null;
function eyeFx() {
  if (EYEFX) return EYEFX;
  EYEFX = {
    spiral: canvasTex(128, 128, (g, w) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 7; g.beginPath(); for (let a = 0; a < 6 * PI; a += 0.1) { const r = 3 + a * 3.2; g.lineTo(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r); } g.stroke(); }),
    x: canvasTex(128, 128, (g, w) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(34, 34); g.lineTo(94, 94); g.moveTo(94, 34); g.lineTo(34, 94); g.stroke(); }),
    happy: canvasTex(128, 128, (g, w) => { g.strokeStyle = '#f4f2ec'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.arc(w / 2, w * 0.68, w * 0.3, 1.15 * PI, 1.85 * PI); g.stroke(); }),
  };
  return EYEFX;
}
/** A lumpy dome (snow cap / drift), unit radius, origin at the base center. */
function lumpyDome(seed, segs = 28) {
  const geo = new THREE.SphereGeometry(1, segs, Math.round(segs / 2), 0, TAU, 0, PI / 2), p = geo.attributes.position, R = rng(seed), ph = [R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    const n = 1 + 0.09 * Math.sin(3 * a + ph[0]) + 0.06 * Math.sin(5 * a + ph[1]) + 0.05 * Math.sin(7 * a + y * 5 + ph[2]);
    p.setXYZ(i, x * n, y * (1 + 0.12 * Math.sin(4 * a + ph[1])), z * n);
  }
  geo.computeVertexNormals(); return geo;
}
/** The belly: white with the emperor's pale-gold upper chest (vertex colours by height). */
function bellyGeo(chest) {
  const geo = new THREE.SphereGeometry(0.3, 32, 24), p = geo.attributes.position, col = new Float32Array(p.count * 3), c0 = new THREE.Color(0xf8f7f2), c1 = new THREE.Color(chest), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 0.3; const k = clamp((y - 0.35) / 0.45); c.copy(c0).lerp(c1, k * k * (3 - 2 * k)); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo;
}

export function makePenguin(o = {}) {
  const C = { back: 0x1f2329, belly: 0xf8f7f2, chest: 0xffd77a, ear: 0xffb52e, beak: 0x23262b, stripe: 0xff8f5a, feet: 0x2e3238, lid: 0x4b525d, ...o };
  const M = {
    back: std(C.back, 0.5), belly: std(0xffffff, 0.62, { vertexColors: true }), ear: std(C.ear, 0.45), beak: std(C.beak, 0.35), stripe: std(C.stripe, 0.4),
    feet: std(C.feet, 0.7), white: std(0xffffff, 0.22), pupil: std(0x15110f, 0.2), lid: std(C.lid, 0.5), snow: std(0xf6f9fd, 0.85), bow: std(o.bowColor ?? 0xff5d8f, 0.5),
    ice: new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.42, depthWrite: false }),
    icicle: std(0xd6f1ff, 0.15, { transparent: true, opacity: 0.85 }),
  };
  const base = { back: M.back.color.clone(), lid: M.lid.color.clone() };
  const root = new THREE.Group(), pivot = new THREE.Group(), body = new THREE.Group();
  root.add(pivot); pivot.position.y = 0.42; pivot.add(body); body.position.y = -0.42;
  const fat = o.fat ?? 1;
  // torso (black back) + belly (white → gold chest) + tail
  const trunk = new THREE.Group(); body.add(trunk);
  const torso = mk(new THREE.SphereGeometry(0.3, 32, 24), M.back, trunk, 0, 0.42, 0); torso.scale.set(1 * fat, 1.3, 0.92 * fat);
  const belly = mk(bellyGeo(C.chest), M.belly, trunk, 0, 0.4, 0.07 * fat); belly.scale.set(0.84 * fat, 1.18, 0.8 * fat);
  const tail = mk(new THREE.ConeGeometry(0.07, 0.16, 10), M.back, trunk, 0, 0.1, -0.22 * fat); tail.rotation.x = -2.2;
  // neck stripes of gold that run from the ear patches into the chest
  for (const s of [-1, 1]) { const n = mk(new THREE.SphereGeometry(0.06, 14, 10), M.ear, trunk, s * 0.2 * fat, 0.76, 0.0); n.scale.set(0.32, 1.1, 0.5); n.rotation.z = -s * 0.3; n.castShadow = false; }
  // head
  const neck = new THREE.Group(); body.add(neck); neck.position.y = 0.78;
  const head = new THREE.Group(); neck.add(head); head.position.set(0, 0.14, 0.02);
  const skull = mk(new THREE.SphereGeometry(0.21, 32, 24), M.back, head, 0, 0, 0); skull.scale.set(1, 1.02, 1.04);
  for (const s of [-1, 1]) { const ear = mk(new THREE.SphereGeometry(0.06, 14, 10), M.ear, head, s * 0.188, -0.06, -0.07); ear.scale.set(0.32, 1.3, 0.8); ear.rotation.set(0.3, 0, -s * 0.22); ear.castShadow = false; }
  // eyes: white + pupil + glint + lid (a grey cap that rotates down) + fx decal (spiral / X / happy arc)
  const eyes = [], E = eyeFx();
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); head.add(eg); eg.position.set(s * 0.078, 0.045, 0.168); eg.rotation.set(-0.12, s * 0.42, 0);
    const white = mk(new THREE.SphereGeometry(0.068, 24, 16), M.white, eg); white.scale.set(0.9, 1.15, 0.55); white.castShadow = false;
    const pg = new THREE.Group(); eg.add(pg);
    const pupil = mk(new THREE.SphereGeometry(0.034, 16, 12), M.pupil, pg, 0, 0, 0.027); pupil.scale.set(1, 1.12, 0.55); pupil.castShadow = false;
    const glint = mk(new THREE.SphereGeometry(0.01, 8, 6), M.white, pg, 0.011, 0.015, 0.046); glint.castShadow = false;
    const lidG = new THREE.Group(); eg.add(lidG);
    const lid = mk(new THREE.SphereGeometry(0.071, 24, 12, 0, TAU, 0, PI / 2), M.lid, lidG); lid.scale.set(0.95, 1.18, 0.62); lid.castShadow = false;
    const fx = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), new THREE.MeshBasicMaterial({ map: E.spiral, transparent: true })); fx.position.z = 0.04; fx.visible = false; eg.add(fx);
    const brow = mk(new THREE.CapsuleGeometry(0.012, 0.06, 4, 8), M.lid, head, s * 0.082, 0.145, 0.165); brow.rotation.z = PI / 2; brow.castShadow = false;
    eyes.push({ s, eg, white, pg, pupil, lid, lidG, fx, brow });
  }
  // beak: black upper bill + the orange-pink stripe on the lower bill (a hinge that opens)
  const beak = new THREE.Group(); head.add(beak); beak.position.set(0, -0.045, 0.188); beak.rotation.x = 0.32;   // tipped down so it reads as a bill from the front
  const upper = new THREE.Group(); beak.add(upper);
  const up = mk(new THREE.ConeGeometry(0.044, 0.22, 14), M.beak, upper, 0, 0, 0.1); up.rotation.x = PI / 2 + 0.1; up.scale.set(1, 1, 0.75);
  const jaw = new THREE.Group(); beak.add(jaw); jaw.position.set(0, -0.012, -0.005);
  const low = mk(new THREE.ConeGeometry(0.038, 0.19, 12), M.stripe, jaw, 0, -0.008, 0.088); low.rotation.x = PI / 2 + 0.16; low.scale.set(1.05, 1, 0.62);
  const mouthIn = mk(new THREE.SphereGeometry(0.03, 12, 8), std(0x7a1f22, 0.6), beak, 0, -0.012, 0.012); mouthIn.scale.set(1, 0.6, 1); mouthIn.castShadow = false;
  // icicles under the bill (frost)
  const icicles = new THREE.Group(); beak.add(icicles); icicles.position.set(0, -0.03, 0.08);
  for (let i = 0; i < 3; i++) { const c = mk(new THREE.ConeGeometry(0.009, 0.06 + i * 0.012, 6), M.icicle, icicles, (i - 1) * 0.018, -0.03 - i * 0.004, i * 0.025); c.rotation.x = PI; c.castShadow = false; }
  // tuft (the hero) + bow (Mom)
  const tuft = new THREE.Group(); head.add(tuft); tuft.visible = !!o.tuft;
  for (let i = 0; i < 4; i++) { const c = mk(new THREE.ConeGeometry(0.03, 0.13, 8), M.back, tuft, (i - 1.5) * 0.026, 0.235, -0.01 - Math.abs(i - 1.5) * 0.01); c.rotation.set(-0.35 + i * 0.05, 0, (i - 1.5) * 0.35); }
  const bow = new THREE.Group(); head.add(bow); bow.position.set(0.08, 0.17, 0.05); bow.rotation.set(0.3, 0, -0.4); bow.visible = !!o.bow;
  { for (const s of [-1, 1]) { const w = mk(new THREE.ConeGeometry(0.045, 0.08, 10), M.bow, bow, s * 0.04, 0, 0); w.rotation.z = s * PI / 2; } mk(new THREE.SphereGeometry(0.02, 10, 8), M.bow, bow, 0, 0, 0); }
  const shades = makeShades(0.052, 0.078); head.add(shades); shades.position.set(0, 0.05, 0.236); shades.rotation.x = -0.12;
  // flippers (hinge at the shoulder; the inner face is white)
  const flip = (s) => {
    const g = new THREE.Group(); body.add(g); g.position.set(s * 0.27 * fat, 0.64, -0.01);
    const outer = mk(new THREE.SphereGeometry(1, 20, 14), M.back, g, 0, -0.22, 0); outer.scale.set(0.034, 0.25, 0.095);
    const inner = mk(new THREE.SphereGeometry(1, 20, 14), M.belly, g, -s * 0.012, -0.22, 0.004); inner.scale.set(0.026, 0.235, 0.085);
    return g;
  };
  const flipL = flip(-1), flipR = flip(1);
  // feet (each a flattened webbed paddle with three toe bumps)
  const footG = [];
  for (const s of [-1, 1]) {
    const f = new THREE.Group(); body.add(f); f.position.set(s * 0.1, 0, 0.12);
    const pad = mk(new THREE.SphereGeometry(1, 18, 10), M.feet, f, 0, 0.022, 0.05); pad.scale.set(0.075, 0.026, 0.115);
    for (let k = -1; k <= 1; k++) { const toe = mk(new THREE.SphereGeometry(0.022, 10, 8), M.feet, f, k * 0.04, 0.02, 0.15 - Math.abs(k) * 0.02); toe.scale.set(1, 0.7, 1.3); }
    footG.push(f);
  }
  // the brood fold (a skin flap that drops over the egg on the feet)
  const pouch = mk(new THREE.SphereGeometry(1, 24, 14, 0, TAU, 0, PI / 2), std(0xe7e2d6, 0.7), body, 0, 0.16, 0.16); pouch.rotation.x = PI; pouch.visible = false;
  // snow: a cap on the head, slabs on the shoulders, a drift that buries him (hook), an ice block (frozen at the edge)
  const cap = mk(lumpyDome(7), M.snow, head, 0, 0.13, -0.01); cap.scale.set(0.2, 0.12, 0.2); cap.visible = false;
  const sh = [-1, 1].map((s) => { const m = mk(lumpyDome(11 + s), M.snow, body, s * 0.2, 0.74, -0.02); m.scale.set(0.12, 0.06, 0.13); m.visible = false; return m; });
  const drift = mk(lumpyDome(23, 36), M.snow, root, 0, 0, 0); drift.visible = false;
  const ice = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.32, 0.78), M.ice); ice.position.y = 0.64; ice.renderOrder = 3; ice.visible = false; root.add(ice);
  const iceEdges = new THREE.LineSegments(new THREE.EdgesGeometry(ice.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); ice.add(iceEdges);

  function set(p = {}) {
    const s = p.scale ?? 1;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.y = p.rotY ?? 0; root.scale.setScalar(s);
    const [sx, sy] = p.squash || [1, 1]; body.scale.set(sx, sy, sx);
    const lie = clamp(p.lie ?? 0), wk = p.waddle, wa = p.walkAmt ?? 1, sw = wk == null ? 0 : Math.sin(wk) * wa;
    pivot.position.y = lerp(0.42, 0.27, lie) + (wk == null ? 0 : Math.abs(Math.cos(wk)) * 0.02 * wa);
    pivot.rotation.set((p.lean ?? 0) + lie * PI / 2, 0, (p.roll ?? 0) + sw * 0.13 * (1 - lie));
    const th = clamp(p.thin ?? 0); trunk.scale.set(1 - 0.38 * th, 1 - 0.04 * th, 1 - 0.3 * th); flipL.position.x = -0.27 * fat * (1 - 0.36 * th); flipR.position.x = 0.27 * fat * (1 - 0.36 * th);
    for (const [g, q, side] of [[flipL, p.flipL || {}, -1], [flipR, p.flipR || {}, 1]]) g.rotation.set(q.x ?? 0, q.y ?? 0, side * (q.z ?? 0.12));   // +z swings the flipper OUT (away from the body)
    // feet: waddle steps (each foot lifts on its half of the gait), point backward when lying
    footG.forEach((f, i) => { const ph = wk == null ? 0 : Math.max(0, Math.sin(wk + (i ? PI : 0))) * wa; f.position.y = ph * 0.05 * (1 - lie); f.position.z = 0.12 + ph * 0.04; f.rotation.x = lie * -0.9 + (p.feetX ?? 0); });
    const hd = p.head || {}; head.rotation.set((hd.x ?? 0) - lie * 1.35, hd.y ?? 0, hd.z ?? 0);
    // eyes
    const ek = p.eyes || 'open', [lx, ly] = p.look || [0, 0], b = p.brows ?? 0;
    for (const e of eyes) {
      const wide = ek === 'wide' ? 1.22 : 1;
      e.white.scale.set(0.9 * wide, 1.15 * wide, 0.55); e.lid.scale.set(0.95 * wide, 1.18 * wide, 0.62);
      e.pg.position.set(clamp(lx, -1, 1) * 0.024, clamp(ly, -1, 1) * 0.028, 0); e.pg.scale.setScalar(ek === 'wide' ? 0.86 : 1);
      e.lid.rotation.x = ek === 'closed' || ek === 'happy' ? 1.62 : ek === 'half' ? 0.55 : -0.95;
      e.lidG.rotation.z = e.s * b * 0.35;
      const fx = ek === 'spiral' || ek === 'x' || ek === 'happy'; e.fx.visible = fx; e.pg.visible = !fx;
      if (fx) { e.fx.material.map = EYEFX[ek]; e.fx.material.needsUpdate = true; e.fx.rotation.z = ek === 'spiral' ? (p.t ?? 0) * -9 * e.s : 0; e.fx.position.z = ek === 'happy' ? 0.064 : 0.04; }
      e.white.visible = ek !== 'happy';
      e.brow.rotation.z = PI / 2 + e.s * b * 0.45; e.brow.position.y = 0.145 + Math.abs(b) * 0.01 + (ek === 'wide' ? 0.02 : 0);
    }
    const mo = p.mouth || 'flat', open = p.open ?? (mo === 'scream' ? 1 : mo === 'o' ? 0.45 : mo === 'smile' ? 0.12 : 0);
    jaw.rotation.x = open * 0.75; upper.rotation.x = -open * 0.18; mouthIn.visible = open > 0.05;
    // extras
    const fr = clamp(p.frost ?? 0), dr = clamp(p.drift ?? 0), ic = clamp(p.ice ?? 0), hot = clamp(p.hot ?? 0);
    cap.visible = fr > 0.02 || dr > 0.02; const cs = Math.max(fr, dr * 1.4); cap.scale.set(0.2 * Math.min(1.2, 0.5 + cs * 0.7), 0.12 * cs + 0.01, 0.2 * Math.min(1.2, 0.5 + cs * 0.7));
    sh.forEach((m) => { m.visible = fr > 0.1 || dr > 0.1; m.scale.set(0.12, 0.06 * Math.max(fr, dr), 0.13); });
    icicles.visible = fr > 0.3 || ic > 0.3; icicles.scale.setScalar(Math.max(fr, ic));
    drift.visible = dr > 0.01; drift.scale.set(0.42 + 0.12 * dr, 0.92 * dr + 0.01, 0.4 + 0.1 * dr);
    ice.visible = ic > 0.01; ice.scale.setScalar(0.4 + 0.6 * Math.min(1, ic * 1.15)); M.ice.opacity = 0.42 * Math.min(1, ic * 1.5);
    M.back.color.copy(base.back).lerp(new THREE.Color(0x8fb3d9), Math.max(fr * 0.35, ic * 0.4)).lerp(new THREE.Color(0xa83a3a), hot * 0.3);
    M.lid.color.copy(base.lid).lerp(new THREE.Color(0xc0485a), hot * 0.5);
    shades.visible = !!p.shades;
    pouch.visible = (p.pouch ?? 0) > 0.01; pouch.scale.set(0.2, 0.13 * (p.pouch ?? 0) + 0.001, 0.15);
  }
  set({});
  return { root, set, head, neck, beak, jaw, flipL, flipR, feet: footG, body, trunk, M, shades, eyes };
}

/** A cream-white emperor egg (~12 cm), origin at its bottom. */
export function makeEgg() {
  const g = new THREE.Group();
  const m = mk(new THREE.SphereGeometry(0.075, 24, 16), std(0xdfe6c8, 0.4), g, 0, 0.095, 0); m.scale.set(1, 1.3, 1);   // greenish-white (an emperor egg), a touch bigger than life so it reads on white snow
  const spec = mk(new THREE.SphereGeometry(0.016, 10, 8), std(0xffffff, 0.1), g, -0.03, 0.15, 0.06); spec.castShadow = false;
  return g;
}

/**
 * A crowd of hundreds of simplified penguins (instanced: back, belly, head, eye whites, pupils, beak, ear patches), the same
 * proportions as makePenguin. set(i, {x, y, z, rotY, s, tilt, roll, look}) then commit(). Faces +z per instance.
 */
export function makePenguinCrowd(parent, n = 400, { chest = 0xffd77a } = {}) {
  const parts = [
    ['torso', new THREE.SphereGeometry(0.3, 16, 12), std(0x1f2329, 0.5), [0, 0.42, 0], [1, 1.3, 0.92]],
    ['belly', bellyGeo(chest), std(0xffffff, 0.62, { vertexColors: true }), [0, 0.4, 0.07], [0.84, 1.18, 0.8]],
    ['head', new THREE.SphereGeometry(0.21, 16, 12), std(0x1f2329, 0.5), [0, 0.94, 0.02], [1, 1.02, 1.04]],
    ['earL', new THREE.SphereGeometry(0.06, 10, 8), std(0xffb52e, 0.45), [-0.172, 0.87, -0.01], [0.45, 1.45, 0.95]],
    ['earR', new THREE.SphereGeometry(0.06, 10, 8), std(0xffb52e, 0.45), [0.172, 0.87, -0.01], [0.45, 1.45, 0.95]],
    ['eyeL', new THREE.SphereGeometry(0.068, 12, 10), std(0xffffff, 0.22), [-0.078, 0.985, 0.188], [0.9, 1.15, 0.55]],
    ['eyeR', new THREE.SphereGeometry(0.068, 12, 10), std(0xffffff, 0.22), [0.078, 0.985, 0.188], [0.9, 1.15, 0.55]],
    ['pupL', new THREE.SphereGeometry(0.034, 10, 8), std(0x15110f, 0.2), [-0.083, 0.985, 0.225], [1, 1.12, 0.55]],
    ['pupR', new THREE.SphereGeometry(0.034, 10, 8), std(0x15110f, 0.2), [0.083, 0.985, 0.225], [1, 1.12, 0.55]],
    ['beak', new THREE.ConeGeometry(0.042, 0.19, 10), std(0xff8f5a, 0.4), [0, 0.92, 0.29], [1, 1, 0.72], [PI / 2 + 0.12, 0, 0]],
  ];
  const meshes = parts.map(([name, geo, m]) => { const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = name === 'torso' || name === 'head'; im.receiveShadow = true; im.frustumCulled = false; im.name = name; parent.add(im); return im; });
  const local = parts.map(([, , , p, s, r]) => new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(r || [0, 0, 0]))), new THREE.Vector3(...s)));
  const M4 = new THREE.Matrix4(), W = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(0, 0, 0, 'YXZ'), P = new THREE.Vector3(), S = new THREE.Vector3(), H = new THREE.Matrix4(), HL = new THREE.Matrix4();
  const T2 = new THREE.Matrix4();
  const headParts = new Set(['head', 'earL', 'earR', 'eyeL', 'eyeR', 'pupL', 'pupR', 'beak']);
  let count = 0;
  function set(i, q) {
    E.set(q.tilt ?? 0, q.rotY ?? 0, q.roll ?? 0); Q.setFromEuler(E); P.set(q.x, q.y ?? 0, q.z); S.setScalar(q.s ?? 1);
    W.compose(P, Q, S);
    // the head turns (headYaw) around the neck
    const hy = q.headYaw ?? 0; HL.makeTranslation(0, 0.8, 0).multiply(H.makeRotationY(hy)).multiply(T2.makeTranslation(0, -0.8, 0));
    meshes.forEach((im, k) => { M4.copy(W); if (headParts.has(im.name)) M4.multiply(HL); M4.multiply(local[k]); im.setMatrixAt(i, M4); });
    count = Math.max(count, i + 1);
  }
  function commit(nUsed = count) { for (const im of meshes) { im.count = nUsed; im.instanceMatrix.needsUpdate = true; } count = 0; }
  function hide() { for (const im of meshes) im.count = 0; }
  return { meshes, set, commit, hide, n };
}

/** The leopard seal: spotted grey head + shoulders rising out of the water, a huge toothy grin. set({ rise 0..1, open 0..1, lunge 0..1 }). Faces +z. */
export function makeLeopardSeal() {
  const spots = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#59626d'); gr.addColorStop(0.5, '#78838f'); gr.addColorStop(1, '#c4cbd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(91); for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(38,42,48,${0.3 + R() * 0.35})`; g.beginPath(); g.ellipse(R() * w, R() * h * 0.75, 3 + R() * 8, 2 + R() * 5, R() * 3, 0, 7); g.fill(); }
  });
  const skin = std(0xffffff, 0.35, { map: spots }), belly = std(0xc8ced5, 0.4), gum = std(0x8e1f2c, 0.6), tongue = std(0xd9606e, 0.5), tooth = std(0xfffdf4, 0.25), eyeM = std(0x0b0c0f, 0.06), white = std(0xffffff, 0.2), dark = std(0x2a2f36, 0.5);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const trunk = mk(new THREE.CapsuleGeometry(0.4, 1.5, 8, 20), skin, body, 0, -0.9, -0.55); trunk.rotation.x = 0.5;
  const head = new THREE.Group(); body.add(head); head.position.set(0, 0.22, 0.05);
  const skull = mk(new THREE.SphereGeometry(1, 32, 22), skin, head, 0, 0, 0); skull.scale.set(0.36, 0.28, 0.44);
  for (const s of [-1, 1]) {   // big dark eyes up top + nostrils on the snout
    mk(new THREE.SphereGeometry(0.068, 16, 12), eyeM, head, s * 0.15, 0.12, 0.31);
    mk(new THREE.SphereGeometry(0.018, 8, 6), white, head, s * 0.15 + 0.022, 0.15, 0.372).castShadow = false;
    const brow = mk(new THREE.CapsuleGeometry(0.018, 0.09, 4, 8), dark, head, s * 0.15, 0.2, 0.3); brow.rotation.z = PI / 2 - s * 0.45; brow.castShadow = false;
    mk(new THREE.SphereGeometry(0.02, 8, 6), dark, head, s * 0.05, 0.03, 0.44).castShadow = false;
  }
  // the mouth: a dark gum cavity + an upper row of fangs along the snout's front edge; the lower jaw hinges open below
  const cav = mk(new THREE.SphereGeometry(1, 24, 14), gum, head, 0, -0.1, 0.12); cav.scale.set(0.28, 0.1, 0.3); cav.castShadow = false;
  const fang = (parent, y, down, k) => { for (let i = 0; i < k; i++) { const a = -1.05 + (i / (k - 1)) * 2.1, big = i === 1 || i === k - 2; const t = mk(new THREE.ConeGeometry(big ? 0.032 : 0.024, big ? 0.11 : 0.07, 8), tooth, parent, Math.sin(a) * 0.26, y, 0.19 + Math.cos(a) * 0.26); t.rotation.x = down ? PI : 0; t.castShadow = false; } };
  fang(head, -0.1, true, 8);
  const jaw = new THREE.Group(); head.add(jaw); jaw.position.set(0, -0.1, -0.08);
  const jawM = mk(new THREE.SphereGeometry(1, 24, 14), belly, jaw, 0, -0.06, 0.24); jawM.scale.set(0.3, 0.1, 0.36);
  const tng = mk(new THREE.SphereGeometry(1, 16, 10), tongue, jaw, 0, -0.01, 0.24); tng.scale.set(0.17, 0.05, 0.22); tng.castShadow = false;
  fang(jaw, -0.0, false, 7);
  for (const s of [-1, 1]) { const f = mk(new THREE.SphereGeometry(1, 16, 10), skin, body, s * 0.42, -0.55, 0.1); f.scale.set(0.08, 0.3, 0.16); f.rotation.z = s * 0.9; }
  function set({ rise = 1, open = 0, lunge = 0, tilt = 0 } = {}) {
    body.position.y = lerp(-1.6, 0, rise) + lunge * 0.6; body.position.z = lunge * 0.7; body.rotation.x = -0.12 - lunge * 0.35 + tilt;
    jaw.rotation.x = open * 0.85; head.rotation.x = -open * 0.25; cav.visible = open > 0.03;
  }
  set({});
  return { g, set, head, jaw };
}

// ---------------------------------------------------------------- the set
function snowTexture(rep) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#eef3f9'; g.fillRect(0, 0, w, h); const R = rng(44);
    for (let i = 0; i < 220; i++) { const x = R() * w, y = R() * h, r = 14 + R() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(160,185,220,.17)'); gr.addColorStop(1, 'rgba(160,185,220,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 70; i++) { const y = R() * h; g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 6 * (R() - 0.5), w * 0.6, y + 8 * (R() - 0.5), w, y + 4 * (R() - 0.5)); g.stroke(); }
    for (let i = 0; i < 1600; i++) { g.fillStyle = R() < 0.6 ? 'rgba(255,255,255,.95)' : 'rgba(140,170,210,.2)'; g.fillRect(R() * w, R() * h, 1 + R() * 1.5, 1 + R() * 1.5); }
  }, rep);
  return t;
}
function iceWallTexture() {
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f7fbff'); gr.addColorStop(0.12, '#dff0fb'); gr.addColorStop(0.6, '#9fd3ee'); gr.addColorStop(1, '#4f9cc9'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(17);
    for (let i = 0; i < 260; i++) { const x = R() * w; g.strokeStyle = R() < 0.5 ? `rgba(255,255,255,${0.15 + R() * 0.35})` : `rgba(60,140,190,${0.08 + R() * 0.2})`; g.lineWidth = 1 + R() * 5; g.beginPath(); g.moveTo(x, h * R() * 0.2); g.lineTo(x + (R() - 0.5) * 20, h * (0.5 + R() * 0.5)); g.stroke(); }
    for (let i = 0; i < 9; i++) { const y = h * (0.15 + R() * 0.7); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2 + R() * 3; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (R() - 0.5) * 30); g.stroke(); }
  }, [6, 1]);
}
function skyTexture() {
  const t = canvasTex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#5f9ad9'); gr.addColorStop(0.3, '#93c0ea'); gr.addColorStop(0.44, '#d7e6f4'); gr.addColorStop(0.5, '#f6e4dc'); gr.addColorStop(1, '#f4e6e0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(5);
    for (let i = 0; i < 34; i++) {   // long thin polar cloud streaks
      const cx = R() * w, cy = 140 + R() * 320, L = 160 + R() * 380, th = 8 + R() * 18;
      for (let k = 0; k < 6; k++) { const x = cx + (R() - 0.5) * L, y = cy + (R() - 0.5) * th * 2, rx = L * (0.25 + R() * 0.3), ry = th * (0.6 + R() * 0.6); const cg = g.createRadialGradient(x, y, 0, x, y, rx); cg.addColorStop(0, 'rgba(255,255,255,.5)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.save(); g.translate(x, y); g.scale(1, ry / rx); g.beginPath(); g.arc(0, 0, rx, 0, 7); g.restore(); g.fill(); }
    }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}
function nightTexture() {
  const t = canvasTex(4096, 2048, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#050a1c'); gr.addColorStop(0.4, '#0d1a3a'); gr.addColorStop(0.5, '#1d2c55'); gr.addColorStop(1, '#1d2c55'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(77); for (let i = 0; i < 4200; i++) { const x = R() * w, y = R() * h * 0.5, r = R() < 0.95 ? 0.8 + R() * 1.2 : 2 + R() * 1.6; const a = 0.4 + R() * 0.6; const sg = g.createRadialGradient(x, y, 0, x, y, r * 1.6); sg.addColorStop(0, `rgba(255,255,255,${a})`); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}
function auroraTexture() {
  const t = canvasTex(2048, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = rng(31);
    for (let x = 0; x < w; x += 2) {
      const base = h * (0.62 + 0.18 * Math.sin(x * 0.004) + 0.08 * Math.sin(x * 0.011 + 1.2)), top = base - h * (0.25 + 0.2 * (0.5 + 0.5 * Math.sin(x * 0.02 + 2)) + 0.1 * R());
      const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(x * 0.033)) + 0.15 * R();
      const gr = g.createLinearGradient(0, top, 0, base); gr.addColorStop(0, 'rgba(180,80,220,0)'); gr.addColorStop(0.35, `rgba(120,255,170,${a * 0.6})`); gr.addColorStop(0.85, `rgba(90,255,150,${a})`); gr.addColorStop(1, 'rgba(90,255,150,0)');
      g.fillStyle = gr; g.fillRect(x, top, 2, base - top);
    }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}
function mountainGeo(seed, r, hgt) {
  const geo = new THREE.ConeGeometry(r, hgt, 24, 10, true), p = geo.attributes.position, R = rng(seed), col = new Float32Array(p.count * 3);
  const rock = new THREE.Color(0x7487a0), snow = new THREE.Color(0xf4f8fc), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = (y + hgt / 2) / hgt;
    const n = 1 + 0.16 * Math.sin(5 * a + seed) + 0.1 * Math.sin(11 * a + y * 0.05) + 0.06 * (R() - 0.5);
    p.setXYZ(i, x * n, y + (R() - 0.5) * hgt * 0.03, z * n);
    const sn = clamp((k - 0.16 + 0.12 * Math.sin(9 * a + seed)) / 0.1); c.copy(rock).lerp(snow, sn); col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); geo.translate(0, hgt / 2, 0); return geo;
}
function bergGeo(seed, r) {
  const geo = new THREE.IcosahedronGeometry(r, 3), p = geo.attributes.position, R = rng(seed), ph = [R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x); const n = 1 + 0.18 * Math.sin(3 * a + ph[0]) + 0.1 * Math.sin(5 * y / r + ph[1]); p.setXYZ(i, x * n, Math.max(-r * 0.5, y) * (y > 0 ? 0.75 : 1), z * n); }
  geo.computeVertexNormals(); return geo;
}

/**
 * The Antarctic sea-ice set (meters, y up). The colony plain is flat snow at y 0; the floe edge runs along x = D.edgeX with open water
 * beyond (+x), a jutting tongue at z ≈ 0 to x = D.tongueX where a lineup stands; ice cliffs + icebergs across the water; mountains
 * inland (−x, and round the −z/+z horizons). update(t, camera) moves the water + aurora + snow; setNight(0..1); setWeather(0..1)
 * (blizzard: fog closes in, blowing snow); aimSun(cx, cz, half). Needs camera.far ≥ 2600.
 */
export function buildIce(studio, opts = {}) {
  const { scene, camera } = studio;
  const root = new THREE.Group(); scene.add(root);
  const D = { edgeX: 40, tongueX: 46, tongueZ: [-5, 5], waterY: -0.62, huddle: [0, 0], ...opts.D };
  // sky (day dome + night dome that fades in) + aurora curtain
  const skyM = new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2200, 48, 24), skyM); sky.renderOrder = -3; sky.frustumCulled = false; root.add(sky);
  const nightM = new THREE.MeshBasicMaterial({ map: nightTexture(), side: THREE.BackSide, fog: false, transparent: true, opacity: 0, depthWrite: false });
  const night = new THREE.Mesh(new THREE.SphereGeometry(2150, 48, 24), nightM); night.renderOrder = -2; night.frustumCulled = false; root.add(night);
  const auroraT = auroraTexture();
  const auroraM = new THREE.MeshBasicMaterial({ map: auroraT, side: THREE.DoubleSide, fog: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const aurora = new THREE.Mesh(new THREE.CylinderGeometry(1900, 1900, 900, 64, 1, true, -PI * 0.15, PI * 1.3), auroraM); aurora.position.y = 900; aurora.renderOrder = -1; aurora.frustumCulled = false; root.add(aurora);
  // ground: the sea-ice plain (ends at the floe edge), a tongue jutting into the water
  const snowM = new THREE.MeshStandardMaterial({ map: snowTexture([160, 160]), color: 0xffffff, roughness: 0.88 });
  const ground = mk(new THREE.PlaneGeometry(3000, 3000), snowM, root, D.edgeX - 1500, 0, 0); ground.rotation.x = -PI / 2; ground.castShadow = false;
  const tongueM = new THREE.MeshStandardMaterial({ map: snowTexture([4, 4]), roughness: 0.88 });
  const tongue = mk(new THREE.BoxGeometry(D.tongueX - D.edgeX + 0.5, 0.01, D.tongueZ[1] - D.tongueZ[0]), tongueM, root, (D.tongueX + D.edgeX) / 2 - 0.25, -0.005, 0); tongue.castShadow = false;
  const wallM = new THREE.MeshStandardMaterial({ map: iceWallTexture(), roughness: 0.25, color: 0xffffff });
  const edgeWall = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = mk(new THREE.PlaneGeometry(L, 3.2), wallM, root, (x0 + x1) / 2, -1.6, (z0 + z1) / 2); m.rotation.y = Math.atan2(x1 - x0, z1 - z0) - PI / 2; m.castShadow = false; m.material.side = THREE.DoubleSide; return m; };
  edgeWall(D.edgeX, -1500, D.edgeX, D.tongueZ[0]); edgeWall(D.edgeX, D.tongueZ[1], D.edgeX, 1500);
  edgeWall(D.edgeX, D.tongueZ[0], D.tongueX, D.tongueZ[0]); edgeWall(D.tongueX, D.tongueZ[1], D.edgeX, D.tongueZ[1]); edgeWall(D.tongueX, D.tongueZ[0], D.tongueX, D.tongueZ[1]);
  // a snow lip along the edge (a soft rounded rim so it isn't a razor line)
  const lipM = new THREE.MeshStandardMaterial({ color: 0xf2f7fc, roughness: 0.8 });
  for (const [x, z, L, ry] of [[D.edgeX, -760, 1520, 0], [D.edgeX, 760, 1520, 0], [D.tongueX, 0, D.tongueZ[1] - D.tongueZ[0], 0], [(D.edgeX + D.tongueX) / 2, D.tongueZ[0], D.tongueX - D.edgeX, PI / 2], [(D.edgeX + D.tongueX) / 2, D.tongueZ[1], D.tongueX - D.edgeX, PI / 2]]) { const c = mk(new THREE.CapsuleGeometry(0.12, L, 4, 8), lipM, root, x, 0.0, z); c.rotation.set(PI / 2, 0, 0); c.rotation.z = ry; if (ry) c.rotation.set(0, 0, PI / 2); c.scale.set(1, 1, 0.6); c.castShadow = false; }
  // water: a deep blue-teal plane with a scrolling ripple normal map + a sparkle
  const nrm = canvasTex(512, 512, (g, w, h) => { g.fillStyle = 'rgb(128,128,255)'; g.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h, r = 6 + R() * 26, a = R() * TAU; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${128 + 60 * Math.cos(a)},${128 + 60 * Math.sin(a)},255,.5)`); gr.addColorStop(1, 'rgba(128,128,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, [60, 60]);
  nrm.colorSpace = THREE.NoColorSpace;
  const waterM = new THREE.MeshStandardMaterial({ color: 0x0b3a5e, roughness: 0.14, metalness: 0.1, normalMap: nrm, normalScale: new THREE.Vector2(0.55, 0.55), envMapIntensity: 1.2 });
  const water = mk(new THREE.PlaneGeometry(3000, 3000), waterM, root, D.edgeX + 1500, D.waterY, 0); water.rotation.x = -PI / 2; water.castShadow = false;
  // across the water: an ice-shelf cliff (jagged top) + icebergs
  const cliffs = new THREE.Group(); root.add(cliffs);
  { const R = rng(12); for (let z = -900; z < 900; z += 34 + R() * 30) { const hgt = 22 + R() * 16, wd = 40 + R() * 30; const b = mk(new THREE.BoxGeometry(18, hgt, wd), [wallM, wallM, lipM, lipM, wallM, wallM], cliffs, 260 + R() * 14, D.waterY + hgt / 2 - 2, z); b.rotation.y = (R() - 0.5) * 0.12; b.castShadow = false; } }
  const bergM = new THREE.MeshStandardMaterial({ color: 0xeef8ff, roughness: 0.35, emissive: 0x2a6f99, emissiveIntensity: 0.12 });
  const bergs = [[95, -60, 9], [150, 40, 14], [120, 160, 8], [70, 110, 4], [180, -170, 16], [62, -26, 2.4], [58, 22, 1.6], [85, 18, 3.2]].map(([x, z, r], i) => { const b = mk(bergGeo(40 + i, r), bergM, root, x, D.waterY + r * 0.25, z); b.castShadow = false; return b; });
  // mountains inland (−x) and round the far horizons
  const mtnM = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9, flatShading: true });
  const mtns = new THREE.Group(); root.add(mtns);
  { const R = rng(21);
    for (let i = 0; i < 26; i++) { const a = PI * 0.45 + (i / 25) * PI * 1.1, d = 700 + R() * 500, hgt = 140 + R() * 260, r = hgt * (0.9 + R() * 0.6); const m = mk(mountainGeo(i * 3 + 1, r, hgt), mtnM, mtns, Math.cos(a) * d, -2, Math.sin(a) * d); m.castShadow = false; m.receiveShadow = false; }
    for (let i = 0; i < 9; i++) { const a = PI * 0.82 + (i / 8) * PI * 0.36, d = 420 + R() * 120, hgt = 90 + R() * 120; const m = mk(mountainGeo(100 + i, hgt * 1.3, hgt), mtnM, mtns, Math.cos(a) * d, -2, Math.sin(a) * d); m.castShadow = false; } }
  // sastrugi (wind-carved ridges) + drifts round the colony
  const sasM = new THREE.MeshStandardMaterial({ color: 0xf7fafd, roughness: 0.85 });
  const sas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8, 0, TAU, 0, PI / 2), sasM, 900); sas.castShadow = true; sas.receiveShadow = true; root.add(sas);
  { const R = rng(8), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(); let k = 0;
    for (let i = 0; i < 900; i++) { const r = 6 + Math.sqrt(R()) * 160, a = R() * TAU; let x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > D.edgeX - 2) x = D.edgeX - 2 - R() * 30; const L = 0.6 + R() * 2.4; M4.compose(new THREE.Vector3(x, -0.02, z), Q.setFromEuler(E.set(0, 0.5 + (R() - 0.5) * 0.3, 0)), new THREE.Vector3(L, 0.08 + R() * 0.14, 0.22 + R() * 0.3)); sas.setMatrixAt(k++, M4); }
    sas.count = k; }
  // lights
  const hemi = new THREE.HemisphereLight(0xe6f1ff, 0xb9cbe2, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe7cf, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  root.add(sun, sun.target);
  const SUN_DIR = new THREE.Vector3(0.55, 0.42, 0.72).normalize();
  function aimSun(cx = 0, cz = 0, half = 8) {
    sun.target.position.set(cx, 0, cz); sun.position.set(cx + SUN_DIR.x * 60, SUN_DIR.y * 60, cz + SUN_DIR.z * 60);
    const c = sun.shadow.camera; c.left = c.bottom = -half; c.right = c.top = half; c.near = 1; c.far = 160; c.updateProjectionMatrix();
  }
  aimSun();
  const moon = new THREE.DirectionalLight(0x9fc0ff, 0); moon.position.set(-40, 60, 30); root.add(moon);
  const fog = new THREE.Fog(0xe4edf6, 80, 1900), FOGC = new THREE.Color(0xe4edf6), BLIZ = new THREE.Color(0xdfe7f1), NIGHTC = new THREE.Color(0x1a2648);
  let nightK = 0, weatherK = 0;
  function applyFog() {
    fog.color.copy(FOGC).lerp(BLIZ, weatherK).lerp(NIGHTC, nightK);
    fog.near = 2 * Math.pow(40, 1 - weatherK); fog.far = 34 * Math.pow(1900 / 34, 1 - weatherK) * lerp(1, 0.9, nightK);   // geometric: 0.5 = ~250 m, 0.85 = ~62 m
  }
  function setNight(k) {
    nightK = clamp(k); nightM.opacity = nightK; auroraM.opacity = nightK; skyM.color.setScalar(1 - 0.85 * nightK);
    sun.intensity = 2.5 * (1 - nightK); hemi.intensity = lerp(1.15, 0.32, nightK); hemi.color.set(nightK > 0.5 ? 0x7d95d6 : 0xe6f1ff); moon.intensity = 0.9 * nightK;
    snowM.color.setScalar(1 - 0.3 * nightK); applyFog();
  }
  function setWeather(k) { weatherK = clamp(k); applyFog(); }
  setNight(0); setWeather(0);
  const _v = new THREE.Vector3();
  function update(t, cam = camera) {
    nrm.offset.set(t * 0.012, t * 0.007);
    auroraT.offset.x = t * 0.01; aurora.rotation.y = Math.sin(t * 0.3) * 0.02;
    root.worldToLocal(_v.copy(cam.position)); sky.position.copy(_v); night.position.copy(_v); aurora.position.set(_v.x, _v.y + 900, _v.z);
  }
  return { root, D, sky, night, aurora, ground, tongue, water, cliffs, bergs, mtns, hemi, sun, moon, fog, aimSun, setNight, setWeather, update, snowM, sasM };
}
