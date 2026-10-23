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

// ---------------------------------------------------------------- flashlight (handheld; beam along local +z)
/** Returns {g, setOn(v), aim(pos, target)}: a toy flashlight with a soft additive beam cone + a spot light. */
export function makeFlashlight({ length = 34, radius = 2.4, color = 0xfff0d2 } = {}) {
  const g = new THREE.Group();
  const body = mk(new THREE.CylinderGeometry(0.022, 0.026, 0.19, 14), mat(0x2b2f36, 0.45), g, 0, 0, -0.02); body.rotation.x = Math.PI / 2;
  const headM = mat(0x3a3f47, 0.4);
  const head = mk(new THREE.CylinderGeometry(0.038, 0.028, 0.06, 16), headM, g, 0, 0, 0.1); head.rotation.x = Math.PI / 2;
  const lensM = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.5), toneMapped: false });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.034, 18), lensM); lens.position.z = 0.131; g.add(lens);
  // soft volumetric cone: alpha fades along the length and toward the silhouette edges (no texture → no hard end cap)
  const geo = new THREE.CylinderGeometry(0.035, radius, length, 40, 1, true); geo.translate(0, -length / 2, 0); geo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0.3 }, uLen: { value: length } },
    vertexShader: 'varying float vD; varying vec3 vN; varying vec3 vV; void main(){ vD = position.z; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity, uLen; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ float d = clamp(vD / uLen, 0.0, 1.0); float a = pow(1.0 - d, 1.7) * uOpacity; float edge = abs(dot(normalize(vN), normalize(-vV))); a *= mix(0.45, 1.0, smoothstep(0.0, 0.7, edge)); gl_FragColor = vec4(uColor * a, a); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(geo, beamMat);
  beam.position.z = 0.13; beam.castShadow = false; g.add(beam);
  const spot = new THREE.SpotLight(color, 0, 60, 0.12, 0.6, 1.2); spot.position.z = 0.13; spot.target.position.set(0, 0, 10); g.add(spot, spot.target);
  const setOn = (v, beamOpacity = 0.3) => { lensM.color.setHex(color).multiplyScalar(0.1 + 2.4 * v); beamMat.uniforms.uOpacity.value = beamOpacity * v; beam.visible = v > 0.001; spot.intensity = 60 * v; };
  const aim = (pos, target) => { g.position.copy(pos); g.lookAt(target); };
  setOn(0);
  return { g, beam, spot, setOn, aim };
}

// ---------------------------------------------------------------- search bubble (008): a floating search bar above a head
/**
 * makeSearchBubble({ query, history: [..], width (m), maxChars, offX })
 *   A camera-facing card: magnifier + query on top, optional history rows (clock icon) below, a small tail pointing down.
 *   Bottom-anchored (sprite.center.y = 0): put `sprite.position` at the top of the head. offX shifts the card sideways
 *   (-0.5…0.5 of its width) so two neighbours' cards don't overlap. setRows(n) reveals history rows one by one (textures are
 *   prebuilt per row count — no per-frame canvas work). setPop(k) scales it (0 = hidden; use a boing for the pop).
 *   Unlit SpriteMaterial (house rule for screens), slightly off-white so it never trips the bloom threshold.
 */
export function makeSearchBubble(o = {}) {
  const W = 1024, PAD = 26, TAIL = 34, R = 44;
  const width = o.width ?? 0.9, history = o.history || [], maxChars = o.maxChars ?? 24;
  const wrap = (s) => { const out = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > maxChars && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };
  const qLines = wrap(o.query || ''), rows = history.map((h) => wrap(h));
  const QH = 70, RH = 60, TOPH = 46 + qLines.length * QH;
  const texFor = (n) => {
    const rowLines = rows.slice(0, n).reduce((a, r) => a + r.length, 0);
    const cardH = TOPH + (n ? 22 + rowLines * RH + n * 18 + 14 : 0);
    const H = cardH + PAD * 2 + TAIL;
    const tex = canvasTex(W, H, (g) => {
      const x0 = PAD, y0 = PAD, w = W - PAD * 2;
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(x0, y0, w, cardH, R); g.fill();
      const tx = Math.min(W - PAD - 90, Math.max(PAD + 90, (0.5 + (o.offX ?? 0)) * W)); // tail points at the anchor (the head)
      g.beginPath(); g.moveTo(tx - 30, y0 + cardH - 2); g.lineTo(tx, y0 + cardH + TAIL - 4); g.lineTo(tx + 30, y0 + cardH - 2); g.fill();
      g.restore();
      // magnifier
      const my = y0 + 23 + QH / 2 + 4;
      g.strokeStyle = '#6b7078'; g.lineWidth = 9; g.beginPath(); g.arc(x0 + 62, my - 6, 20, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + 77, my + 9); g.lineTo(x0 + 92, my + 24); g.stroke();
      g.fillStyle = '#202124'; g.font = '600 56px Helvetica, Arial, sans-serif'; g.textBaseline = 'middle';
      qLines.forEach((l, i) => g.fillText(l, x0 + 122, y0 + 23 + QH / 2 + 2 + i * QH));
      if (!n) return;
      let y = y0 + TOPH + 4;
      g.fillStyle = '#e3e5e8'; g.fillRect(x0 + 30, y, w - 60, 4); y += 22;
      rows.slice(0, n).forEach((r) => {
        const cy = y + RH / 2;
        g.strokeStyle = '#9aa0a6'; g.lineWidth = 6; g.beginPath(); g.arc(x0 + 62, cy, 19, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + 62, cy - 11); g.lineTo(x0 + 62, cy); g.lineTo(x0 + 71, cy + 6); g.stroke();
        g.fillStyle = '#5b2a9a'; g.font = '500 46px Helvetica, Arial, sans-serif';
        r.forEach((l, i) => g.fillText(l, x0 + 122, cy + i * RH));
        y += r.length * RH + 18;
      });
    });
    return { tex, aspect: H / W };
  };
  const texs = Array.from({ length: history.length + 1 }, (_, n) => texFor(n));
  const material = new THREE.SpriteMaterial({ map: texs[0].tex, color: o.color ?? 0xf2f2f2, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(material); sprite.center.set(0.5 + (o.offX ?? 0), 0); sprite.renderOrder = 5;
  let rowsShown = 0, pop = 1;
  const resize = () => { const a = texs[rowsShown].aspect; sprite.scale.set(width * pop, width * a * pop, 1); sprite.visible = pop > 0.001; };
  const setRows = (n) => { n = Math.max(0, Math.min(history.length, Math.floor(n))); if (n !== rowsShown) { rowsShown = n; material.map = texs[n].tex; } resize(); };
  const setPop = (k) => { pop = Math.max(0, k); resize(); };
  resize();
  return { sprite, material, setRows, setPop, width };
}

// ---------------------------------------------------------------- city bus + basketball hoop (010; reusable)
/**
 * City bus (12 m, faces +z, front at z=+L/2). Returns {g, body, wheels, setSag(k), setSign(text)}.
 * setSag(k 0..1): the body sinks onto its axles and rolls toward the curb (−x side) — "too heavy".
 */
export function makeBus({ color = 0x2f7d6a, stripe = 0xf2c14e, L = 12, sign = '42 DOWNTOWN' } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const W = 2.55, H = 3.0, paint = mat(color, 0.4), glass = new THREE.MeshStandardMaterial({ color: 0x1d2a38, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.55 });
  mk(new RoundedBoxGeometry(W, 0.9, L, 3, 0.12), paint, body, 0, 0.75, 0);                       // lower body
  mk(new RoundedBoxGeometry(W, 0.35, L, 3, 0.12), paint, body, 0, H - 0.18, 0);                  // roof
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.08, 1.55, 0.12), paint, body, s * (W / 2 - 0.04), 2.0, -L / 2 + 0.6 + k * (L - 1.2) / 5); // window pillars
  const win = mk(new THREE.BoxGeometry(W - 0.06, 1.55, L - 0.3), glass, body, 0, 2.0, 0); win.castShadow = false;            // glass box (people inside show through)
  mk(new THREE.BoxGeometry(W + 0.01, 0.16, L + 0.01), mat(stripe, 0.5), body, 0, 1.12, 0);
  const signTex = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffb21c'; c.font = 'bold 64px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sign, w / 2, h / 2 + 3); });
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false });
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.34), signMat); signM.position.set(0, H - 0.5, L / 2 + 0.07); body.add(signM);
  const door = mk(new THREE.BoxGeometry(0.06, 2.1, 1.1), glass, body, -W / 2 - 0.01, 1.25, L / 2 - 1.6); door.castShadow = false;
  const wheels = [];
  for (const z of [L / 2 - 2.2, -L / 2 + 2.4]) for (const s of [-1, 1]) {
    const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 18), mat(0x1c1c1e, 0.8), g, s * (W / 2 - 0.15), 0.5, z); w.rotation.z = Math.PI / 2; wheels.push(w);
    mk(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 14), mat(0xbfc4ca, 0.3), w, 0, 0, 0);
  }
  const setSag = (k) => { body.position.y = -0.42 * k; body.rotation.z = 0.06 * k; wheels.forEach((w) => w.scale.set(1, 1, 1 - 0.18 * k)); };
  const setSign = (text) => { const c = signTex.image.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#ffb21c'; c.font = 'bold 64px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 51); signTex.needsUpdate = true; };
  return { g, body, wheels, door, setSag, setSign, W, H, L };
}
/** Driveway basketball hoop: pole + backboard + orange rim at y=3.05 (regulation). Rim center at (0, 3.05, 0.55) local. */
export function makeHoop() {
  const g = new THREE.Group(), metal = mat(0x3d4a45, 0.5);
  mk(new THREE.CylinderGeometry(0.07, 0.09, 3.6, 12), metal, g, 0, 1.8, -0.35);
  mk(new THREE.BoxGeometry(0.06, 0.06, 0.5), metal, g, 0, 3.35, -0.12);
  const board = mk(new THREE.BoxGeometry(1.8, 1.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.3 }), g, 0, 3.4, 0.12);
  mk(new THREE.BoxGeometry(0.6, 0.45, 0.01), mat(0xd2483f, 0.5), g, 0, 3.27, 0.15).scale.set(1, 1, 1);
  mk(new THREE.BoxGeometry(0.52, 0.37, 0.012), new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.3 }), g, 0, 3.27, 0.152);
  const rim = mk(new THREE.TorusGeometry(0.23, 0.018, 8, 28), mat(0xe2572b, 0.4), g, 0, 3.05, 0.4); rim.rotation.x = Math.PI / 2;
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.15, 0.4, 14, 3, true), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 }));
  net.position.set(0, 2.84, 0.4); g.add(net);
  return { g, rim: new THREE.Vector3(0, 3.05, 0.4), board };
}
export function makeBasketball(r = 0.12) {
  const tex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#e0722f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a1a10'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.moveTo(w / 4, 0); c.lineTo(w / 4, h); c.moveTo((3 * w) / 4, 0); c.lineTo((3 * w) / 4, h); c.stroke(); });
  const g = new THREE.Group(); mk(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), g); return g;
}
