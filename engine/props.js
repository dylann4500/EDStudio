// Reusable props: draped blanket (deformable), plush bunny, phone, toys, moving boxes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

// ---------------------------------------------------------------- blanket
function roundHang(d, r) { // distance past a mattress edge -> [outward offset, drop]
  const q = (Math.PI * r) / 2;
  if (d < q) { const a = d / r; return [r * Math.sin(a), r * (1 - Math.cos(a))]; }
  return [r, r + (d - q)];
}
/** Capsule-shaped bump under the blanket. body: {x, zA (feet), zB (shoulders), h, r} */
export function bodyBump(x, z, b) {
  const zc = Math.min(Math.max(z, Math.min(b.zA, b.zB)), Math.max(b.zA, b.zB));
  const d2 = ((x - b.x) ** 2 + (z - zc) ** 2) / (b.r * b.r);
  return b.h * Math.exp(-d2 * 1.6);
}
/**
 * A blanket that drapes over a mattress and over a body bump. Call update(p) whenever p changes:
 * p = { cx, w, top, zFoot, zHead (the folded edge near the pillow), hang, footHang, r, body|null, lift }
 */
export class Blanket {
  constructor(material, segX = 44, segZ = 64) {
    this.segX = segX; this.segZ = segZ;
    this.geo = new THREE.PlaneGeometry(1, 1, segX, segZ);
    this.mesh = new THREE.Mesh(this.geo, material);
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.key = '';
  }
  heightAt(x, z, p) {
    return p.top + (p.lift ?? 0.014) + (p.body ? bodyBump(x, z, p.body) : 0);
  }
  update(p) {
    const key = JSON.stringify(p);
    if (key === this.key) return; this.key = key;
    const pos = this.geo.attributes.position, uv = this.geo.attributes.uv;
    const totalW = p.w + 2 * p.hang, totalL = p.zHead - p.zFoot + p.footHang;
    for (let j = 0; j <= this.segZ; j++) {
      const v = j / this.segZ, along = v * totalL;
      let z, dropZ = 0;
      if (along < p.footHang) { const [lat, drop] = roundHang(p.footHang - along, p.r); z = p.zFoot - lat; dropZ = drop; }
      else z = p.zFoot + (along - p.footHang);
      for (let i = 0; i <= this.segX; i++) {
        const u = i / this.segX, s = (u - 0.5) * totalW, ax = Math.abs(s) - p.w / 2;
        let x, dropX = 0;
        if (ax > 0) { const [lat, drop] = roundHang(ax, p.r); x = p.cx + Math.sign(s) * (p.w / 2 + lat); dropX = drop; }
        else x = p.cx + s;
        let y = this.heightAt(ax > 0 ? p.cx + Math.sign(s) * p.w / 2 : x, Math.max(z, p.zFoot), p) - dropX - dropZ;
        if (ax > 0 || along < p.footHang) y += 0.004 * Math.sin(u * 37 + v * 11); // tiny cloth wobble on the hanging parts
        const idx = j * (this.segX + 1) + i;
        pos.setXYZ(idx, x, y, z);
        uv.setXY(idx, u * totalW * 1.4, v * totalL * 1.4);
      }
    }
    pos.needsUpdate = true; uv.needsUpdate = true;
    this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
    const n = this.geo.attributes.normal; // degenerate triangles (coincident hang vertices) give zero normals -> NaN in shading
    for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i), z = n.getZ(i); if (!(x * x + y * y + z * z > 1e-8)) n.setXYZ(i, 0, 1, 0); }
  }
}

// ---------------------------------------------------------------- fabric textures
export function quiltTexture(c1, c2, line = 'rgba(255,255,255,.35)') {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? c1 : c2; g.fillRect(x * s, y * s, s, s); }
    g.strokeStyle = line; g.lineWidth = 3; g.setLineDash([10, 8]);
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  }, [1, 1]);
}
export function starsTexture(bg, fg) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const R = rng(11); g.fillStyle = fg;
    for (let i = 0; i < 26; i++) {
      const x = R() * w, y = R() * h, r = 10 + R() * 12;
      g.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
  }, [1, 1]);
}
export function dotsTexture(bg, fg) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc(x * 32 + (y % 2) * 16 + 8, y * 32 + 8, 4, 0, 7); g.fill(); }
  }, [1, 1]);
}

// ---------------------------------------------------------------- small props
export function makeBunny(color = 0xeee2d6) {
  const g = new THREE.Group(), m = mat(color, 0.95), pink = mat(0xe9a6b0, 0.9), dark = mat(0x1b1310, 0.4);
  const body = mk(new THREE.SphereGeometry(0.055, 18, 14), m, g, 0, 0.055, 0); body.scale.set(1, 1.1, 0.9);
  mk(new THREE.SphereGeometry(0.046, 18, 14), m, g, 0, 0.13, 0.008);
  for (const s of [-1, 1]) {
    const ear = mk(new THREE.CapsuleGeometry(0.014, 0.06, 4, 10), m, g, s * 0.02, 0.2, -0.005); ear.rotation.z = s * -0.25;
    const inner = mk(new THREE.CapsuleGeometry(0.007, 0.045, 4, 8), pink, g, s * 0.021, 0.2, 0.007); inner.rotation.z = s * -0.25;
    mk(new THREE.SphereGeometry(0.006, 8, 6), dark, g, s * 0.016, 0.138, 0.05);
    mk(new THREE.SphereGeometry(0.02, 10, 8), m, g, s * 0.045, 0.06, 0.03);
    mk(new THREE.SphereGeometry(0.022, 10, 8), m, g, s * 0.03, 0.012, 0.035);
  }
  mk(new THREE.SphereGeometry(0.007, 8, 6), pink, g, 0, 0.124, 0.054);
  return g;
}
export function makePhone() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.075, 0.009, 0.15, 2, 0.004), mat(0x1c1c22, 0.35), g, 0, 0.0045, 0);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, emissive: 0x8fb7ff, emissiveIntensity: 1.6, roughness: 0.3 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), screenMat); screen.rotation.x = -Math.PI / 2; screen.position.y = 0.0095; g.add(screen);
  return { g, screenMat };
}
export function makeBlock(color, s = 0.075) { const g = new THREE.Group(); mk(new RoundedBoxGeometry(s, s, s, 2, s * 0.12), mat(color, 0.6), g, 0, s / 2, 0); return g; }
export function makeToyCar(color = 0xd2483f) {
  const g = new THREE.Group(), m = mat(color, 0.45), t = mat(0x222222, 0.6);
  mk(new RoundedBoxGeometry(0.2, 0.06, 0.1, 2, 0.02), m, g, 0, 0.05, 0);
  mk(new RoundedBoxGeometry(0.1, 0.05, 0.09, 2, 0.02), m, g, -0.01, 0.095, 0);
  for (const [x, z] of [[0.065, 0.05], [-0.065, 0.05], [0.065, -0.05], [-0.065, -0.05]]) { const w = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 14), t, g, x, 0.025, z); w.rotation.x = Math.PI / 2; }
  return g;
}
export function makeBall(c1 = 0x3d7bd9, c2 = 0xf2c14e) {
  const tex = canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? c1hex(c1) : c2hex(c2); g.fillRect((i * w) / 6, 0, w / 6 + 1, h); } });
  const g = new THREE.Group(); mk(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), g, 0, 0.07, 0); return g;
}
const c1hex = (c) => '#' + c.toString(16).padStart(6, '0'), c2hex = c1hex;
export function makeMovingBox(w = 0.46, h = 0.36, d = 0.4) {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(w, h, d, 2, 0.012), mat(0xb98b5c, 0.95), g, 0, h / 2, 0);
  mk(new THREE.BoxGeometry(w * 1.002, 0.004, 0.06), mat(0xd8c49a, 0.5), g, 0, h + 0.001, 0);
  return g;
}

// ---------------------------------------------------------------- food + baby props (video 002; reusable)
/** Swaddled newborn: blanket capsule + tiny sleeping head. Lies along local x (head at +x). */
export function makeBabyBundle(blanket = 0xf3d9e2, skin = 0xebb996) {
  const g = new THREE.Group(), m = mat(blanket, 0.95);
  const body = mk(new THREE.CapsuleGeometry(0.075, 0.16, 6, 14), m, g, -0.03, 0, 0); body.rotation.z = Math.PI / 2;
  const hood = mk(new THREE.SphereGeometry(0.085, 16, 12), m, g, 0.11, 0.01, -0.01); hood.scale.set(1, 1, 0.9);
  const face = mk(new THREE.SphereGeometry(0.058, 16, 12), mat(skin, 0.6), g, 0.12, 0.02, 0.04); face.scale.set(1, 1, 0.75);
  const dark = mat(0x1b1310, 0.4);
  for (const s of [-1, 1]) { const e = mk(new THREE.TorusGeometry(0.011, 0.003, 4, 10, Math.PI), dark, g, 0.12 + s * 0.02, 0.03, 0.083); e.rotation.z = Math.PI; }
  return g;
}
export function makePickleJar() {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8b8, roughness: 0.08, transparent: true, opacity: 0.38, depthWrite: false });
  const jar = mk(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 24), glass, g, 0, 0.17, 0); jar.castShadow = false;
  const brine = mk(new THREE.CylinderGeometry(0.122, 0.122, 0.28, 20), new THREE.MeshStandardMaterial({ color: 0xb9c95a, roughness: 0.3, transparent: true, opacity: 0.5, depthWrite: false }), g, 0, 0.15, 0); brine.castShadow = false;
  const pk = mat(0x5f8a2e, 0.55), R = rng(17);
  for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = 0.06 * (i % 3) / 2 + 0.02, p = mk(new THREE.CapsuleGeometry(0.025, 0.14, 4, 8), pk, g, Math.cos(a) * rr, 0.15 + (R() - 0.5) * 0.06, Math.sin(a) * rr); p.rotation.set((R() - 0.5) * 0.5, 0, (R() - 0.5) * 0.5); }
  mk(new THREE.CylinderGeometry(0.135, 0.135, 0.05, 24), mat(0xd9b23a, 0.35, { metalness: 0.5 }), g, 0, 0.36, 0);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.1315, 0.1315, 0.12, 24, 1, true), new THREE.MeshStandardMaterial({ map: canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#fff4d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f7d4f'; c.font = 'bold 54px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('PICKLES', w / 4, 66); c.fillText('PICKLES', (3 * w) / 4, 66); }), roughness: 0.7 }));
  label.position.y = 0.17; g.add(label);
  return g;
}
export function makeIceCreamTub() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.11, 0.09, 0.15, 24), mat(0xf2a7bb, 0.6), g, 0, 0.075, 0);
  mk(new THREE.CylinderGeometry(0.115, 0.115, 0.025, 24), mat(0xfaf6ee, 0.5), g, 0, 0.16, 0);
  return g;
}
export function makeHotDog() {
  const g = new THREE.Group();
  const bun = mk(new THREE.CapsuleGeometry(0.035, 0.13, 4, 10), mat(0xd9a05b, 0.8), g); bun.rotation.z = Math.PI / 2; bun.scale.set(1, 1, 0.8);
  const dog = mk(new THREE.CapsuleGeometry(0.02, 0.17, 4, 8), mat(0xb5462e, 0.5), g, 0, 0.03, 0); dog.rotation.z = Math.PI / 2;
  const mus = mk(new THREE.CapsuleGeometry(0.006, 0.14, 3, 6), mat(0xf1c24a, 0.5), g, 0, 0.052, 0); mus.rotation.z = Math.PI / 2;
  return g;
}
