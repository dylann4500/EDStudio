// Blocky-avatar game style (069): obstacle-course ("obby") props, our own designs. All plastic parts (mats.js), neon where it glows.
//   makeSpinner({ len, height })   a post + a long glowing bar that sweeps round (update(t)); bar = the kill bar
//   makeKillBrick([w, h, d])       a red glowing brick (touch = oof)          makeLava([w, d])  bubbling lava slab (update(t))
//   makeCheckpoint({ color, n })   a spawn pad with a flag that waves; setOn(k) lights it up (update(t))
//   makeTruss(h)                   a grey lattice ladder            makeJumpPad()  a bouncy pad (setPress(k))
//   makeCoin()                     a spinning gold coin (update(t))  makeSign(lines, { w, h, bg, fg })  a part with text on it
//   obbyCourse(parent, steps)      a row of floating coloured bricks from a list of [x, y, z, w, d, color]
import * as THREE from 'three';
import { S, part, cyl, plastic, neon, shade, canvasTexture } from './mats.js';

export function makeSpinner({ len = 7, height = 1.1, color = 0xff3b3b, post = 0x6b6f76, speed = 2.2 } = {}) {
  const g = new THREE.Group();
  cyl(0.55, height, { color: post, parent: g, pos: [0, height / 2, 0] });
  cyl(0.62, 0.12, { color: shade(post, -0.2), parent: g, pos: [0, 0.06, 0] });
  const rot = new THREE.Group(); rot.position.y = height; g.add(rot);
  const bar = part([len, 0.38, 0.38], { mat: 'neon', color, parent: rot, pos: [0, 0.05, 0] }); bar.castShadow = true;
  cyl(0.28, 0.3, { color: 0xffd23f, parent: rot, pos: [0, 0.05, 0] });
  return { g, bar, rot, update(t, a0 = 0) { rot.rotation.y = a0 + t * speed; } };
}

export function makeKillBrick(size = [4, 0.4, 4], color = 0xff2f2f) { return part(size, { mat: 'neon', color }); }

/** lava: a glowing slab whose texture churns (an orange-red blob noise scrolled two ways) */
export function makeLava([w, d] = [6, 6], { depth = 0.3 } = {}) {
  const tx = canvasTexture(256, 256, (g) => {
    g.fillStyle = '#e8410f'; g.fillRect(0, 0, 256, 256);
    let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) { const x = r() * 256, y = r() * 256, rr = 8 + r() * 30; for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rr); gr.addColorStop(0, i % 3 ? 'rgba(255,190,40,.85)' : 'rgba(255,235,120,.9)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(x + dx - rr, y + dy - rr, rr * 2, rr * 2); } }
  }, { repeat: true });
  tx.repeat.set(w / 4, d / 4);
  const mat = new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color(1.35, 1.2, 1.1) });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, depth, d), mat); m.position.y = depth / 2;
  const g = new THREE.Group(); g.add(m);
  return { g, mesh: m, update(t) { tx.offset.set((t * 0.05) % 1, (t * 0.031) % 1); mat.color.setScalar(1.15 + 0.12 * Math.sin(t * 3)); mat.color.g *= 0.95; } };
}

export function makeCheckpoint({ color = 0x2fd06a, n = 1, pad = 2.6 } = {}) {
  const g = new THREE.Group();
  part([pad, 0.3, pad], { color: 0x9a9ea6, top: 'studs', parent: g, pos: [0, 0.15, 0] });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(pad * 0.36, pad * 0.36, 0.02, 32), neon(color, 1.0)); ring.position.y = 0.31; g.add(ring);
  const icon = new THREE.Mesh(new THREE.PlaneGeometry(pad * 0.5, pad * 0.5), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTexture(128, 128, (c) => { c.fillStyle = '#ffffff'; c.font = '700 72px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 64, 70); }) }));
  icon.rotation.x = -Math.PI / 2; icon.position.y = 0.325; g.add(icon);
  const pole = cyl(0.05, 2.2, { color: 0xeeeeee, parent: g, pos: [pad * 0.4, 1.4, -pad * 0.4] });
  const flagG = new THREE.Group(); flagG.position.set(pad * 0.4, 2.35, -pad * 0.4); g.add(flagG);
  const fgeo = new THREE.PlaneGeometry(0.9, 0.55, 8, 1); fgeo.translate(0.45, 0, 0);
  const flag = new THREE.Mesh(fgeo, new THREE.MeshStandardMaterial({ color, roughness: 0.5, side: THREE.DoubleSide })); flag.castShadow = true; flagG.add(flag);
  const base = fgeo.attributes.position.array.slice();
  void pole;
  return {
    g, ring, flag,
    setOn(k) { ring.material.color.setHex(color).multiplyScalar(0.6 + 1.4 * k); },
    update(t) { const p = fgeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(t * 6 - x * 4) * 0.08 * x); } p.needsUpdate = true; fgeo.computeVertexNormals(); },
  };
}

export function makeTruss(h = 6, { color = 0x8a8f96 } = {}) {
  const g = new THREE.Group(), w = 0.7, n = Math.round(h / 0.7), m = plastic(color, { rough: 0.35 });
  for (const [x, z] of [[-w / 2, -w / 2], [w / 2, -w / 2], [-w / 2, w / 2], [w / 2, w / 2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.08), m); b.position.set(x, h / 2, z); b.castShadow = true; g.add(b); }
  for (let i = 0; i <= n; i++) for (const r of [0, Math.PI / 2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.06), m); b.position.y = i * (h / n); b.rotation.y = r; g.add(b); if (i < n) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.05, Math.hypot(w, h / n), 0.05), m); d.position.set(r ? 0 : 0, (i + 0.5) * (h / n), 0); d.rotation.set(r ? Math.atan2(w, h / n) : 0, r, r ? 0 : Math.atan2(w, h / n)); d.position.z += r ? 0 : w / 2; d.position.x += r ? w / 2 : 0; g.add(d); } }
  return g;
}

export function makeJumpPad({ color = 0x2fa8ff } = {}) {
  const g = new THREE.Group();
  part([2, 0.25, 2], { color: 0x5c6068, parent: g, pos: [0, 0.125, 0] });
  const top = part([1.7, 0.12, 1.7], { mat: 'neon', color, parent: g, pos: [0, 0.31, 0] });
  return { g, top, setPress(k) { top.scale.y = 1 - 0.7 * k; top.position.y = 0.31 - 0.04 * k; } };
}

export function makeCoin({ r = 0.45 } = {}) {
  const g = new THREE.Group();
  const gold = plastic(0xf5c33b, { rough: 0.22, env: 1.6 });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 32), gold); c.rotation.x = Math.PI / 2; c.castShadow = true; g.add(c);
  const star = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.14, 5), plastic(0xffe27a, { rough: 0.2 })); star.rotation.x = Math.PI / 2; g.add(star);
  return { g, update(t, y0 = 1.2) { g.rotation.y = t * 3; g.position.y = y0 + 0.12 * Math.sin(t * 2.4); } };
}

/** a part with text on its front (+z) face: a sign, a scoreboard line, a banner */
export function makeSign(lines, { w = 3, h = 1.2, d = 0.2, bg = '#2b2f36', fg = '#ffffff', font = 'Fredoka', weight = 700, color = 0x2b2f36, glow = false } = {}) {
  const g = new THREE.Group();
  part([w, h, d], { color, parent: g });
  const W = 512, H = Math.round(512 * h / w), L = Array.isArray(lines) ? lines : [lines];
  const tx = canvasTexture(W, H, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
    const lh = H / (L.length + 0.4);
    L.forEach((s, i) => { let f = Math.min(lh * 0.82, 200); c.font = `${weight} ${f}px ${font}, sans-serif`; while (c.measureText(s).width > W * 0.92 && f > 8) c.font = `${weight} ${(f -= 2)}px ${font}, sans-serif`; c.fillText(s, W / 2, lh * (i + 0.7)); });
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.92), glow ? new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color(1.15, 1.15, 1.15) }) : new THREE.MeshStandardMaterial({ map: tx, roughness: 0.45 }));
  face.position.z = d / 2 + 0.003; g.add(face);
  return { g, face, tex: tx };
}

export function obbyCourse(parent, steps) {
  return steps.map(([x, y, z, w = 2, d = 2, color = 0x3c8dff]) => part([w, 0.6, d], { color, top: 'studs', parent, pos: [x, y, z] }));
}
