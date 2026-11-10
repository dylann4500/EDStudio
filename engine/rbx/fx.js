// Blocky-avatar game style (069): analytic effects (pure functions of t: any frame renders on its own).
//   const FX = makeRbxFX(scene);
//   FX.confetti(t0, [x, y, z], { n, spread, up })   coloured plastic squares that burst, tumble and settle on the floor
//   FX.puff(t0, [x, y, z], { n, size, color })      soft white dust puffs (camera-facing sprites) for landings and impacts
//   FX.studs(t0, [x, y, z], { n, color })           little plastic studs/bits that pop out of a crash (the "oof" debris)
//   FX.update(t, camera)
import * as THREE from 'three';
import { prng } from './mats.js';

const COLORS = [0xe5384f, 0x2f7cf6, 0xffc73b, 0x2fd06a, 0xff6fb5, 0x9b5cf6, 0xffffff, 0xff8a2f];
let PUFF_TEX = null;
function puffTex() {
  if (PUFF_TEX) return PUFF_TEX;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); PUFF_TEX = new THREE.CanvasTexture(c); return PUFF_TEX;
}

export function makeRbxFX(parent, { maxConfetti = 900, maxPuffs = 120, maxBits = 240 } = {}) {
  const conf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.02, 0.08), new THREE.MeshStandardMaterial({ roughness: 0.45 }), maxConfetti);
  const bits = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), new THREE.MeshStandardMaterial({ roughness: 0.4 }), maxBits);
  [conf, bits].forEach((m) => { m.frustumCulled = false; m.castShadow = true; parent.add(m); });
  const col = new THREE.Color();
  for (let i = 0; i < maxConfetti; i++) conf.setColorAt(i, col.setHex(COLORS[i % COLORS.length]));
  for (let i = 0; i < maxBits; i++) bits.setColorAt(i, col.setHex(COLORS[(i * 3) % COLORS.length]));
  const puffs = []; for (let i = 0; i < maxPuffs; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false, fog: true })); s.visible = false; s.renderOrder = 8; parent.add(s); puffs.push(s); }
  const C = [], P = [], B = [], POW = [];
  const powTex = new Map();
  const powSprite = (text, color) => {
    const key = text + color; if (powTex.has(key)) return powTex.get(key);
    const c = document.createElement('canvas'); c.width = 420; c.height = 300; const g = c.getContext('2d');
    g.translate(210, 150); g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 98 : 140; g.lineTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.95); } g.closePath();
    g.fillStyle = color; g.fill(); g.lineWidth = 10; g.strokeStyle = '#16181d'; g.stroke();
    g.font = '400 112px "Luckiest Guy", Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 14; g.strokeText(text, 0, 8); g.fillStyle = '#ffffff'; g.fillText(text, 0, 8);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; powTex.set(key, t); return t;
  };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const FX = {
    confetti(t0, pos, { n = 160, spread = 3.5, up = 7, floor = 0, seed = 1 } = {}) { C.push({ t0, pos, n, spread, up, floor, seed }); },
    puff(t0, pos, { n = 8, size = 0.7, spread = 1.2, color = 0xffffff, life = 0.7, seed = 2, alpha = 0.8 } = {}) { P.push({ t0, pos, n, size, spread, color, life, seed, alpha }); },
    studs(t0, pos, { n = 18, speed = 3.2, floor = 0, seed = 3, color = null } = {}) { B.push({ t0, pos, n, speed, floor, seed, color }); },
    /** a comic starburst with a word (OOF!, GOT HER!) that pops at t0 for `life` s; px = its height on screen */
    pow(t0, pos, text, { color = '#ffc73b', life = 0.7, px = 330, rot = -0.12 } = {}) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: powSprite(text, color), transparent: true, depthTest: false, depthWrite: false, fog: false }));
      s.renderOrder = 30; s.visible = false; s.material.rotation = rot; parent.add(s); POW.push({ t0, pos, life, px, s });
    },
    update(t, camera = null) {
      for (const p of POW) {
        const a = t - p.t0, on = a >= 0 && a < p.life && camera; p.s.visible = !!on; if (!on) continue;
        const v3 = new THREE.Vector3(...p.pos), d = camera.position.distanceTo(v3), hpx = p.px * Math.min(1, 0.4 + a / 0.12) * (1 + 0.15 * Math.exp(-a * 10));
        const h = hpx / 1920 * 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
        p.s.position.copy(v3); p.s.scale.set(h * 1.4, h, 1); p.s.material.opacity = 1 - Math.max(0, (a - p.life + 0.15) / 0.15);
      }
      let ci = 0;
      for (const b of C) {
        const a = t - b.t0, r = prng(b.seed * 977 + 13);
        for (let i = 0; i < b.n && ci < conf.count; i++, ci++) {
          const vx = (r() - 0.5) * b.spread * 2, vz = (r() - 0.5) * b.spread * 2, vy = b.up * (0.5 + r() * 0.7), sp = 4 + r() * 8;
          if (a < 0 || a > 6) { conf.setMatrixAt(ci, zero); continue; }
          // drag-limited fall: rises, then flutters down at ~1.4 m/s
          const tUp = vy / 14, y = a < tUp ? vy * a - 7 * a * a : vy * tUp - 7 * tUp * tUp - 1.4 * (a - tUp);
          const dx = vx * (1 - Math.exp(-a * 1.6)) / 1.6, dz = vz * (1 - Math.exp(-a * 1.6)) / 1.6;
          const yy = Math.max(b.floor + 0.012, b.pos[1] + y), landed = yy <= b.floor + 0.013;
          v.set(b.pos[0] + dx + (landed ? 0 : 0.15 * Math.sin(a * 6 + i)), yy, b.pos[2] + dz);
          q.setFromEuler(e.set(landed ? 0 : a * sp, i, landed ? 0 : a * sp * 0.7)); m4.compose(v, q, one); conf.setMatrixAt(ci, m4);
        }
      }
      for (; ci < conf.count; ci++) conf.setMatrixAt(ci, zero);
      conf.instanceMatrix.needsUpdate = true;
      let bi = 0;
      for (const b of B) {
        const a = t - b.t0, r = prng(b.seed * 331 + 7);
        for (let i = 0; i < b.n && bi < bits.count; i++, bi++) {
          const ang = r() * Math.PI * 2, sp = b.speed * (0.4 + r() * 0.8), vy = 2 + r() * 3.5;
          if (b.color != null) bits.setColorAt(bi, col.setHex(b.color));
          if (a < 0 || a > 2.5) { bits.setMatrixAt(bi, zero); continue; }
          let y = b.pos[1] + vy * a - 11 * a * a; const land = y <= b.floor + 0.025; if (land) y = b.floor + 0.025;
          const tl = land ? Math.min(a, (vy + Math.sqrt(vy * vy + 44 * Math.max(0, b.pos[1] - b.floor))) / 22) : a;
          v.set(b.pos[0] + Math.cos(ang) * sp * tl, y, b.pos[2] + Math.sin(ang) * sp * tl);
          q.setFromEuler(e.set(tl * 9, ang, tl * 7)); m4.compose(v, q, one); bits.setMatrixAt(bi, m4);
        }
      }
      for (; bi < bits.count; bi++) bits.setMatrixAt(bi, zero);
      bits.instanceMatrix.needsUpdate = true; if (bits.instanceColor) bits.instanceColor.needsUpdate = true;
      let pi = 0;
      for (const b of P) {
        const a = t - b.t0, r = prng(b.seed * 53 + 1);
        for (let i = 0; i < b.n && pi < puffs.length; i++) {
          const s = puffs[pi++], life = b.life * (0.7 + r() * 0.6), ang = r() * Math.PI * 2, dist = b.spread * (0.4 + r() * 0.6), rise = 0.2 + r() * 0.5, sz = b.size * (0.6 + r() * 0.6);
          if (a < 0 || a > life) { s.visible = false; continue; }
          const u = a / life, k = 1 - Math.exp(-u * 4);
          s.visible = true; s.position.set(b.pos[0] + Math.cos(ang) * dist * k, b.pos[1] + rise * k, b.pos[2] + Math.sin(ang) * dist * k);
          s.scale.setScalar(sz * (0.5 + 0.8 * k)); s.material.color.setHex(b.color); s.material.opacity = b.alpha * (1 - u) * Math.min(1, u * 8);
        }
      }
      for (; pi < puffs.length; pi++) puffs[pi].visible = false;
    },
  };
  return FX;
}
