// iso style (060): tiny people for a miniature world. Three tiers, all ~1 m tall in diorama units (a 10–12 m landmark next
// to them = toy proportions, like model-railway figures):
//   makeMini(o)  the HERO: rig.js makePerson at scale `s` (0.6) with a bigger head (headR 0.17): every pose/arm preset in CLAUDE.md
//                works. Pose with mini.pose(p) (p from basePose(); p.x/z/rotY in the parent's units, walking `dist` in metres —
//                the helper divides by s). rig.js defaults are untouched.
//   makePeg(o)   a cheap jointed figure (legs, body, head, hair, two arms, optional hat 'chef'|'cap'|'hard'|'sun'): peg.set({x, z,
//                rotY, walk (phase), armL, armR (rad, + = raised forward/up), hop, lean}) — chefs, workers, extras that gesture.
//   makePegCrowd(parent, n, o) an INSTANCED crowd (4 draw calls for any n): crowd.set(i, {x, y, z, rotY, hop, s, visible}) then
//                crowd.commit(); colours per figure from a seeded palette (o.palette, o.hats). Arms down, read as tourists.
import * as THREE from 'three';
import { makePerson, applyPose } from '../rig.js';
import { rng } from '../core.js';

const SHIRTS = [0xe8533f, 0x3d7fd6, 0xf2c14e, 0x5bb36a, 0xf4f1ea, 0xe07bb0, 0x7a5cc7, 0x2fb5b0, 0xff8a3d, 0x2b3a55];
const PANTS = [0x2e3b55, 0x4a4a52, 0xcab48f, 0x2c5d8f, 0x6b4e3d, 0x1f2a36];
const SKINS = [0xf2c9a8, 0xe3ad86, 0xc98e66, 0x9a6544, 0x6e4630, 0xf6d6bd];
const HAIRS = [0x2b1d16, 0x5a3a22, 0x111111, 0xc9a35a, 0x8a4b2a, 0xd9d4cc];

export function makeMini(o = {}) {
  const s = o.s ?? 0.6;
  const rig = makePerson({ headR: 0.17, ...o });
  rig.root.scale.setScalar(s);
  rig.root.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return {
    rig, s,
    /** p: a basePose() with x/z/rotY in parent units; p.dist/p.speed in metres (scaled here); p.groundY = floor height. */
    pose(p) {
      const q = { ...p, dist: (p.dist ?? 0) / s, speed: (p.speed ?? 0) / s, y: 0, floor: 0 };
      applyPose(rig, q);
      rig.root.position.y = (p.groundY ?? 0) + (p.y ?? 0) * s;
    },
  };
}

const M = (c, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r });

export function makePeg({ top = 0xe8533f, pants = 0x2e3b55, skin = 0xf2c9a8, hair = 0x2b1d16, hat = null, hatColor, apron = false, scale = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.scale.setScalar(scale);
  const mT = M(top), mP = M(pants), mS = M(skin, 0.6), mH = M(hair, 0.8);
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(0.07 * s, 0.44, 0); body.add(hip);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.32, 4, 10), mP); leg.position.y = -0.22; hip.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.16), M(0x2a2420)); shoe.position.set(0, -0.42, 0.03); hip.add(shoe);
    legs.push(hip);
  }
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.22, 6, 14), mT); torso.position.y = 0.62; torso.scale.set(1.05, 1, 0.78); body.add(torso);
  if (apron) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.02), M(0xffffff)); a.position.set(0, 0.52, 0.125); body.add(a); }
  const head = new THREE.Group(); head.position.y = 0.92; body.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), mS); head.add(hd);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), M(0x1b1310, 0.3)); e.position.set(sx * 0.05, 0.02, 0.137); head.add(e); }
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.157, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), mH); cap.rotation.x = -0.25; cap.position.z = -0.012; head.add(cap);
  if (hat === 'chef') {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 18), M(hatColor ?? 0xffffff, 0.9)); band.position.y = 0.14; head.add(band);
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), M(hatColor ?? 0xffffff, 0.9)); puff.scale.set(1, 0.85, 1); puff.position.y = 0.3; head.add(puff);
  } else if (hat === 'cap') {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(hatColor ?? 0xd8342c)); c.position.y = 0.03; head.add(c);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.14), c.material); b.position.set(0, 0.04, 0.17); head.add(b);
  } else if (hat === 'hard') {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(hatColor ?? 0xffc928, 0.5)); c.position.y = 0.03; head.add(c);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 20), c.material); b.position.y = 0.04; head.add(b);
  } else if (hat === 'sun') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.12, 18), M(hatColor ?? 0xe9d39a, 0.9)); c.position.y = 0.14; head.add(c);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), c.material); b.position.y = 0.09; head.add(b);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(0.19 * s, 0.76, 0); body.add(sh);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.26, 4, 8), mT); a.position.y = -0.15; sh.add(a);
    const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mS); hnd.position.y = -0.31; sh.add(hnd);
    arms.push({ sh, hand: hnd, s });
  }
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  const P = {
    g, body, head, arms, legs, mats: { top: mT, pants: mP, skin: mS, hair: mH },
    /** walk = stride phase (rad) or null; armL/armR = forward swing (rad, PI ≈ straight up); spread = outward (rad); hop = m. */
    set({ x = 0, y = 0, z = 0, rotY = 0, walk = null, armL = 0, armR = 0, spreadL = 0.12, spreadR = 0.12, hop = 0, lean = 0, headYaw = 0, headPitch = 0 } = {}) {
      g.position.set(x, y + hop, z); g.rotation.y = rotY; body.rotation.x = lean;
      const sw = walk == null ? 0 : Math.sin(walk) * 0.55;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      arms[0].sh.rotation.set(-(armL + (walk == null ? 0 : -sw * 0.6)), 0, -spreadL);
      arms[1].sh.rotation.set(-(armR + (walk == null ? 0 : sw * 0.6)), 0, spreadR);
      head.rotation.set(headPitch, headYaw, 0);
      body.position.y = walk == null ? 0 : Math.abs(Math.cos(walk)) * 0.03;
    },
  };
  P.set();
  return P;
}

export function makePegCrowd(parent, n, { seed = 3, palette = SHIRTS, hats = 0, s = 1 } = {}) {
  const R = rng(seed);
  const geo = {
    legs: new THREE.CapsuleGeometry(0.12, 0.3, 3, 8).translate(0, 0.27, 0),
    torso: new THREE.CapsuleGeometry(0.15, 0.24, 4, 10).scale(1.05, 1, 0.8).translate(0, 0.63, 0),
    head: new THREE.SphereGeometry(0.15, 12, 9).translate(0, 0.93, 0),
    hair: new THREE.SphereGeometry(0.158, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).translate(0, 0.95, -0.01),
  };
  const mk = (gg) => { const m = new THREE.InstancedMesh(gg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 }), n); m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false; parent.add(m); return m; };
  const L = mk(geo.legs), T = mk(geo.torso), Hd = mk(geo.head), Hr = mk(geo.hair);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    L.setColorAt(i, c.set(PANTS[Math.floor(R() * PANTS.length)]));
    T.setColorAt(i, c.set(palette[Math.floor(R() * palette.length)]));
    Hd.setColorAt(i, c.set(SKINS[Math.floor(R() * SKINS.length)]));
    Hr.setColorAt(i, c.set(R() < hats ? 0xffffff : HAIRS[Math.floor(R() * HAIRS.length)]));
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const C = {
    n, meshes: [L, T, Hd, Hr],
    set(i, { x = 0, y = 0, z = 0, rotY = 0, hop = 0, tilt = 0, s: si = 1, visible = true } = {}) {
      const k = visible ? si * s : 0;
      m4.compose(p.set(x, y + hop, z), q.setFromEuler(e.set(tilt, rotY, 0)), sc.set(k, k, k));
      for (const m of C.meshes) m.setMatrixAt(i, m4);
    },
    commit() { for (const m of C.meshes) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } },
  };
  for (let i = 0; i < n; i++) C.set(i, { visible: false });
  C.commit();
  return C;
}

export const PEG_COLORS = { SHIRTS, PANTS, SKINS, HAIRS };
