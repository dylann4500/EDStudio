// Blocky-avatar game style (069): critters + crowds + everyday props built from plastic parts.
//   const D = makeBlockDog({ coat: 0xd9893a, jersey: 0x2f7cf6, number: '7' });  scene.add(D.root)
//   D.pose({ x, z, rotY, run: D.phaseFor(dist), sit, mouth: 'open'|'closed', look }) — faces +z; a corgi by default (long body, short legs, big ears)
//   const C = rbxCrowd(parent, seats, { seed })  instanced blocky spectators (4 draw calls); C.update(t, (i, t) => ({ jump, arms, turn }))
//   rbxDesk(), rbxChair(), rbxLaptop(tex) (lid hinge), rbxPhone(tex), rbxPaper(tex), rbxLamp(), rbxBed()
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { S, plastic, part, cyl, shade, makeCanvas, canvasTexture, prng } from './mats.js';

const RB = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const M = (geo, m, parent, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me; };

// ---------------------------------------------------------------- a blocky dog (a corgi unless told otherwise)
export function makeBlockDog(o = {}) {
  const coat = o.coat ?? 0xd9893a, white = o.white ?? 0xf6f1e8, dark = o.dark ?? null;
  const L = o.legLen ?? 0.17, BW = o.bodyW ?? 0.36, BH = o.bodyH ?? 0.3, BL = o.bodyL ?? 0.78;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mc = plastic(coat, { rough: 0.5 }), mw = plastic(white, { rough: 0.5 }), mk = plastic(0x17171a, { rough: 0.25 });
  const chest = L + BH / 2;
  M(RB(BW, BH, BL, 0.06), mc, body, 0, chest, 0);
  M(RB(BW * 0.82, BH * 0.4, BL * 0.7, 0.04), mw, body, 0, chest - BH * 0.36, 0.02);                // white belly
  if (dark) M(RB(BW * 1.02, BH * 0.36, BL * 0.62, 0.05), plastic(dark, { rough: 0.5 }), body, 0, chest + BH * 0.34, -0.04);   // tricolour saddle
  // jersey (racing vest) with a number on both flanks
  if (o.jersey) {
    M(RB(BW * 1.06, BH * 1.04, BL * 0.5, 0.06), plastic(o.jersey, { rough: 0.55 }), body, 0, chest + 0.005, 0.03);
    if (o.number) {
      const t = canvasTexture(128, 128, (g) => { g.fillStyle = '#ffffff'; g.font = '700 96px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.number, 64, 70); });
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); p.position.set(s * (BW * 0.53 + 0.003), chest + 0.01, 0.03); p.rotation.y = s * Math.PI / 2; body.add(p); }
    }
  }
  // head
  const neck = new THREE.Group(); neck.position.set(0, chest + BH * 0.32, BL / 2 - 0.02); body.add(neck);
  const head = new THREE.Group(); neck.add(head);
  M(RB(0.32, 0.27, 0.28, 0.06), mc, head, 0, 0.1, 0.1);
  M(RB(0.08, 0.12, 0.05, 0.02), mw, head, 0, 0.1, 0.237);                                           // white blaze
  M(RB(0.18, 0.12, 0.15, 0.03), mw, head, 0, 0.03, 0.29);                                           // muzzle
  M(RB(0.07, 0.05, 0.04, 0.015), mk, head, 0, 0.075, 0.37);                                         // nose
  const eyeM = plastic(0x111114, { rough: 0.15, env: 1.4 });
  const eyes = [-1, 1].map((s) => { const e = M(new THREE.SphereGeometry(0.03, 12, 10), eyeM, head, s * 0.085, 0.16, 0.235); e.scale.set(1, 1.2, 0.6); const gl = M(new THREE.SphereGeometry(0.009, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), head, s * 0.085 - 0.01, 0.175, 0.255); gl.castShadow = false; return e; });
  const mouth = new THREE.Group(); mouth.position.set(0, 0.0, 0.31); head.add(mouth);
  const jaw = M(RB(0.14, 0.04, 0.1, 0.015), mw, mouth, 0, -0.025, -0.02);
  const tongue = M(RB(0.07, 0.015, 0.1, 0.007), plastic(0xff7b8f, { rough: 0.4 }), mouth, 0, -0.035, 0.02);
  // ears: big pointy triangles (4-sided cones flattened), pink inside
  const ears = [-1, 1].map((s) => {
    const g = new THREE.Group(); g.position.set(s * 0.1, 0.23, 0.06); head.add(g);
    const e = M(new THREE.ConeGeometry(0.075, 0.2, 4), mc, g, 0, 0.09, 0); e.scale.set(1, 1, 0.38); e.rotation.y = Math.PI / 4;
    const inner = M(new THREE.ConeGeometry(0.05, 0.14, 4), plastic(0xf2a2a8, { rough: 0.5 }), g, 0, 0.075, 0.018); inner.scale.set(1, 1, 0.2); inner.rotation.y = Math.PI / 4;
    g.rotation.z = -s * 0.22; return g;
  });
  // legs (pivot at the top) + paws
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => {
    const g = new THREE.Group(); g.position.set(sx * (BW / 2 - 0.06), L + 0.02, sz * (BL / 2 - 0.1)); body.add(g);
    M(RB(0.1, L + 0.02, 0.1, 0.02), mc, g, 0, -(L + 0.02) / 2, 0);
    M(RB(0.11, 0.05, 0.13, 0.02), mw, g, 0, -L + 0.005, 0.01);
    return g;
  });
  // tail: a fluffy stub
  const tail = new THREE.Group(); tail.position.set(0, chest + BH * 0.25, -BL / 2 + 0.02); body.add(tail);
  M(RB(0.12, 0.12, 0.1, 0.05), mc, tail, 0, 0.02, -0.04);
  const D = {
    root, body, head, neck, ears, legs, tail, eyes, mouth, tongue, jaw,
    phaseFor: (dist, sc = 1) => (dist / (0.55 * sc)) * Math.PI * 2,
    pose(p = {}) {
      root.visible = p.visible ?? true; root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(0, p.rotY ?? 0, 0);
      root.scale.setScalar(p.scale ?? o.scale ?? 1);
      const ph = p.run, run = ph != null, a = run ? Math.sin(ph) : 0, b = run ? Math.cos(ph) : 0;
      // gallop: front pair and back pair out of phase, the body rocks and bobs
      legs[0].rotation.x = run ? 0.9 * a : 0; legs[1].rotation.x = run ? 0.9 * Math.sin(ph + 0.5) : 0;
      legs[2].rotation.x = run ? -0.9 * a : 0; legs[3].rotation.x = run ? -0.9 * Math.sin(ph + 0.5) : 0;
      body.position.y = run ? 0.035 * Math.abs(b) : 0; body.rotation.x = run ? 0.1 * a : 0;
      if (p.sit) { legs[2].rotation.x = legs[3].rotation.x = -1.3; body.rotation.x = -0.45; body.position.y = -0.06; legs[0].rotation.x = legs[1].rotation.x = 0.4; }
      body.rotation.z = p.roll ?? 0;
      neck.rotation.set((p.headPitch ?? 0) + (run ? -0.08 * b : 0), p.look ?? 0, p.headRoll ?? 0);
      ears.forEach((e, i) => { e.rotation.x = run ? -0.3 + 0.15 * b : -0.05; e.rotation.z = (i ? -1 : 1) * -0.22 + (run ? (i ? -1 : 1) * 0.08 * a : 0); });
      const open = p.mouth === 'open' || (run && p.mouth !== 'closed');
      jaw.position.y = open ? -0.055 : -0.025; tongue.visible = open; tongue.position.y = open ? -0.05 : -0.035; tongue.position.z = open ? 0.05 + 0.01 * Math.sin((ph ?? 0) * 2) : 0.02;
      tail.rotation.y = 0.45 * Math.sin((p.t ?? 0) * (run ? 18 : 8)) * (p.wag ?? 1);
      eyes.forEach((e) => (e.scale.y = p.blink ? 0.15 : 1.2));
    },
  };
  D.pose({});
  return D;
}

// ---------------------------------------------------------------- instanced blocky crowd (spectators in the stands)
let FACE_HEAD = null;
function crowdHeadTex() {
  if (FACE_HEAD) return FACE_HEAD;
  // white skin (tinted per instance) with a simple smile at u = 0.5 (thetaStart −π puts the face at the canvas centre)
  FACE_HEAD = canvasTexture(256, 64, (g) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#1b1b1f'; g.strokeStyle = '#1b1b1f';
    g.beginPath(); g.ellipse(120, 26, 3, 6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(136, 26, 3, 6, 0, 0, 7); g.fill();
    g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(128, 31, 12, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  });
  return FACE_HEAD;
}
/** seats = [{x, y, z, rotY}] (y = seat height); spectators sit (torso + head + arms; legs hidden in the rows) */
export function rbxCrowd(parent, seats, { seed = 3, shirts = [0xe5384f, 0x2f7cf6, 0x2fd06a, 0xffc73b, 0xff8a2f, 0x9b5cf6, 0xf2f2f2, 0x24272e, 0x37c8d8, 0xff6fb5], skins = [0xf5cd30, 0xf2c79b, 0xd8a173, 0x8d5a3b, 0xffe0bd, 0xf5cd30], scale = 1 } = {}) {
  const n = seats.length, r = prng(seed);
  const torso = new THREE.InstancedMesh(RB(2 * S, 2 * S, S, 0.03), plastic(0xffffff), n);
  const headG = new THREE.CylinderGeometry(0.6 * S, 0.6 * S, 1.15 * S, 18, 1, false, -Math.PI, Math.PI * 2);
  const head = new THREE.InstancedMesh(headG, new THREE.MeshStandardMaterial({ map: crowdHeadTex(), roughness: 0.4 }), n);
  const arms = new THREE.InstancedMesh(RB(S, 2 * S, S, 0.03), plastic(0xffffff), n * 2);
  const legs = new THREE.InstancedMesh(RB(2 * S, S, 2 * S, 0.03), plastic(0xffffff), n);       // thighs forward on the seat
  [torso, head, arms, legs].forEach((m) => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; parent.add(m); });
  const info = seats.map((s, i) => ({ ...s, shirt: shirts[(r() * shirts.length) | 0], skin: skins[(r() * skins.length) | 0], pants: [0x2b4c8c, 0x24272e, 0x6b5a45, 0x3c3f46][(r() * 4) | 0], ph: r() * 6.28, i }));
  const col = new THREE.Color();
  info.forEach((s, i) => { torso.setColorAt(i, col.setHex(s.shirt)); head.setColorAt(i, col.setHex(s.skin)); arms.setColorAt(2 * i, col.setHex(s.shirt)); arms.setColorAt(2 * i + 1, col.setHex(s.shirt)); legs.setColorAt(i, col.setHex(s.pants)); });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(scale, scale, scale), Y = new THREE.Vector3(0, 1, 0);
  const place = (mesh, idx, base, rotY, off, rx = 0, rz = 0) => {
    p.copy(off).multiplyScalar(scale).applyAxisAngle(Y, rotY).add(base);
    q.setFromEuler(e.set(rx, rotY, rz, 'YXZ')); m4.compose(p, q, sc); mesh.setMatrixAt(idx, m4);
  };
  const C = {
    info, meshes: [torso, head, arms, legs],
    /** f(i, t, seat) → { jump 0..1 (stands up a bit + hops), arms 0..1 (up), turn (yaw offset), hide } */
    update(t, f = () => ({})) {
      const base = new THREE.Vector3();
      info.forEach((s, i) => {
        const o = f(i, t, s) || {}, hide = o.hide, jump = o.jump ?? 0, armsUp = o.arms ?? 0, ry = (s.rotY ?? 0) + (o.turn ?? 0);
        base.set(s.x, (s.y ?? 0) + jump * 0.35 * scale, s.z);
        const k = hide ? 0 : 1;
        if (!k) { m4.makeScale(0, 0, 0); torso.setMatrixAt(i, m4); head.setMatrixAt(i, m4); arms.setMatrixAt(2 * i, m4); arms.setMatrixAt(2 * i + 1, m4); legs.setMatrixAt(i, m4); return; }
        const hipY = 0.5 * S;
        place(legs, i, base, ry, new THREE.Vector3(0, hipY - 0.5 * S + 0.5 * S, 0.5 * S));
        place(torso, i, base, ry, new THREE.Vector3(0, hipY + S, 0));
        place(head, i, base, ry, new THREE.Vector3(0, hipY + 2 * S + 0.6 * S, 0));
        for (const sd of [-1, 1]) {
          const a = armsUp * (Math.PI - 0.3), sw = armsUp * 0.35 * sd;
          // arm pivot at the shoulder; centre is 0.5 S below it along the rotated arm
          const off = new THREE.Vector3(0, -0.5 * S, 0).applyEuler(new THREE.Euler(-a, 0, sw, 'XYZ')).add(new THREE.Vector3(sd * 1.5 * S, hipY + 1.5 * S, 0));
          place(arms, 2 * i + (sd > 0 ? 1 : 0), base, ry, off, -a, sw);
        }
      });
      [torso, head, arms, legs].forEach((m) => (m.instanceMatrix.needsUpdate = true));
    },
  };
  C.update(0);
  return C;
}

// ---------------------------------------------------------------- everyday props (plastic parts)
export function rbxDesk({ w = 1.6, d = 0.8, h = 0.78, color = 0xb07a4a } = {}) {
  const g = new THREE.Group();
  part([w, 0.08, d], { color, mat: 'wood', parent: g, pos: [0, h - 0.04, 0] });
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part([0.08, h - 0.08, 0.08], { color: shade(color, -0.25), parent: g, pos: [x * (w / 2 - 0.06), (h - 0.08) / 2, z * (d / 2 - 0.06)] });
  g.userData.top = h; return g;
}
export function rbxChair({ color = 0xe5384f, seat = 0.46 } = {}) {
  const g = new THREE.Group();
  part([0.5, 0.08, 0.5], { color, parent: g, pos: [0, seat, 0], radius: 0.02 });
  part([0.5, 0.55, 0.08], { color, parent: g, pos: [0, seat + 0.3, -0.21], radius: 0.02 });
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part([0.06, seat, 0.06], { color: 0x55595f, parent: g, pos: [x * 0.2, seat / 2, z * 0.2] });
  g.userData.seat = seat + 0.04; return g;
}
/** a laptop: base + a lid on a hinge (hinge.rotation.x: π/2 = closed, −0.28 = open); the screen faces +z (the user sits at +z) */
export function rbxLaptop(tex, { w = 0.5, d = 0.34, color = 0x2b2f36 } = {}) {
  const g = new THREE.Group();
  part([w, 0.025, d], { color, parent: g, pos: [0, 0.0125, 0], radius: 0.008 });
  part([w * 0.9, 0.002, d * 0.5], { color: 0x15171b, parent: g, pos: [0, 0.026, -d * 0.12] });
  const hinge = new THREE.Group(); hinge.position.set(0, 0.025, -d / 2); g.add(hinge);
  const lid = part([w, d, 0.02], { color, parent: hinge, pos: [0, d / 2, -0.01], radius: 0.008 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, d * 0.86), new THREE.MeshBasicMaterial({ map: tex || null, color: tex ? 0xffffff : 0x111111, toneMapped: false }));
  screen.position.set(0, d / 2, 0.0015); hinge.add(screen); void lid;
  hinge.rotation.x = -0.28;                                   // open (~105°); Math.PI / 2 = closed
  return { g, hinge, screen };
}
export function rbxPhone(tex, { w = 0.085, h = 0.17 } = {}) {
  const g = new THREE.Group();
  part([w, h, 0.012], { color: 0x1d1f24, parent: g, radius: 0.006 });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.88, h * 0.9), new THREE.MeshBasicMaterial({ map: tex || null, color: tex ? 0xffffff : 0x111111, toneMapped: false }));
  s.position.z = 0.0065; g.add(s);
  return { g, screen: s };
}
/** a sheet of paper (US letter, 0.216 × 0.279 m) lying flat, any canvas texture on top */
export function rbxPaper(tex, { w = 0.216, h = 0.279 } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.002, h), [0, 0, 1, 0, 0, 0].map((k) => (k ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }) : plastic(0xf3f0e8, { rough: 0.8 }))));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function rbxLamp({ color = 0xffc73b, on = 1 } = {}) {
  const g = new THREE.Group();
  cyl(0.1, 0.03, { color: 0x2b2f36, parent: g, pos: [0, 0.015, 0] });
  part([0.03, 0.4, 0.03], { color: 0x2b2f36, parent: g, pos: [0, 0.22, 0] });
  const shadeM = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.16, 16, 1, true), plastic(color, { rough: 0.4 })); shadeM.material.side = THREE.DoubleSide; shadeM.position.y = 0.44; g.add(shadeM);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.6, 1.1) })); bulb.position.y = 0.39; g.add(bulb);
  const light = new THREE.PointLight(0xffd59a, 2.4 * on, 5, 2); light.position.y = 0.35; g.add(light);
  return { g, light, bulb };
}
export function rbxBed({ color = 0x2f7cf6 } = {}) {
  const g = new THREE.Group();
  part([1.1, 0.35, 2.1], { color: 0x8a5a33, mat: 'wood', parent: g, pos: [0, 0.175, 0] });
  part([1.04, 0.16, 2.0], { color: 0xf2f2f2, parent: g, pos: [0, 0.43, 0], radius: 0.05 });
  part([1.06, 0.1, 1.3], { color, parent: g, pos: [0, 0.52, 0.32], radius: 0.04 });
  part([0.7, 0.12, 0.35], { color: 0xffffff, parent: g, pos: [0, 0.56, -0.72], radius: 0.05 });
  part([1.1, 0.8, 0.12], { color: 0x8a5a33, mat: 'wood', parent: g, pos: [0, 0.4, -1.04] });
  return g;
}

/** a chunky plastic pen with a soft glow at the tip (Scribe writing); the group origin = the nib tip, the pen leans back along +y */
export function rbxPen({ color = 0x9a1c25 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); body.rotation.set(-0.55, 0, -0.45);   // leans away from a camera on the +z side
  cyl(0.012, 0.03, { color: 0x2b2f36, parent: body, pos: [0, 0.015, 0], rTop: 0.012, seg: 12 }).geometry = new THREE.ConeGeometry(0.012, 0.03, 12).rotateX(Math.PI);
  body.children[0].position.y = 0.015;
  cyl(0.016, 0.16, { color, parent: body, pos: [0, 0.11, 0], seg: 16 });
  cyl(0.017, 0.02, { color: 0xf5c33b, parent: body, pos: [0, 0.2, 0], seg: 16 });
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64; const gg = glowC.getContext('2d');
  const gr = gg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,140,1)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 64, 64);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
  glow.scale.setScalar(0.05); g.add(glow);
  return { g, glow };
}
