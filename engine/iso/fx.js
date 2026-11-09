// iso style (060): analytic effects (pure functions of t → deterministic, motion-blur safe).
//   const fx = makePuffs(parent, { max: 160 })   soft camera-facing puffs (dust, flour, smoke, steam)
//   fx.burst({ t0, at: [x, y, z], n, speed, up, life, size, color, spread, grow, seed })   register once in build()
//   fx.stream({ t0, t1, at, rate, up, life, size, color, drift })                         a chimney / steam column
//   fx.update(t)   every frame (after the parent is posed)
//   boing(u)  0→1 overshoot ease for pops;  kick(t, times, amp, dur) → camera shake offset in metres
import * as THREE from 'three';
import { rng } from '../core.js';

let _puffTex = null;
function puffTex() {
  if (_puffTex) return _puffTex;
  const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
  const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
  return (_puffTex = new THREE.CanvasTexture(c));
}

export function makePuffs(parent, { max = 160 } = {}) {
  const pool = [];
  for (let i = 0; i < max; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false, opacity: 0 }));
    s.visible = false; parent.add(s); pool.push(s);
  }
  const parts = [];   // {t0, life, p0, v, g, size, grow, color, op}
  const P = {
    burst({ t0, at, n = 12, speed = 1.5, up = 1, life = 1.2, size = 0.6, color = 0xf3ead8, spread = 1, grow = 2.2, seed = 1, gravity = 0, op = 0.85 }) {
      const R = rng(seed);
      for (let i = 0; i < n; i++) {
        const a = R() * Math.PI * 2, sp = speed * (0.5 + R() * 0.7);
        parts.push({ t0: t0 + R() * 0.06, life: life * (0.7 + R() * 0.5), p0: [at[0] + (R() - 0.5) * spread, at[1] + R() * 0.2, at[2] + (R() - 0.5) * spread],
          v: [Math.cos(a) * sp, up * (0.4 + R()) , Math.sin(a) * sp], g: gravity, size: size * (0.7 + R() * 0.6), grow, color: new THREE.Color(color), op });
      }
    },
    stream({ t0, t1, at, rate = 6, up = 1.2, life = 2.2, size = 0.7, color = 0xdedad2, drift = [0.3, 0, 0], seed = 3, op = 0.6, grow = 2.4 }) {
      const R = rng(seed);
      for (let t = t0; t < t1; t += 1 / rate) parts.push({ t0: t + R() * 0.1, life: life * (0.8 + R() * 0.4), p0: [at[0] + (R() - 0.5) * 0.2, at[1], at[2] + (R() - 0.5) * 0.2], v: [drift[0] + (R() - 0.5) * 0.2, up * (0.8 + R() * 0.4), drift[2] + (R() - 0.5) * 0.2], g: 0, size: size * (0.8 + R() * 0.4), grow, color: new THREE.Color(color), op });
    },
    update(t) {
      let k = 0;
      for (const p of parts) {
        const age = t - p.t0; if (age < 0 || age > p.life || k >= pool.length) continue;
        const s = pool[k++], u = age / p.life, damp = 1 - Math.exp(-age * 2.2);
        s.visible = true;
        s.position.set(p.p0[0] + p.v[0] * damp / 2.2, p.p0[1] + p.v[1] * damp / 2.2 - 0.5 * p.g * age * age, p.p0[2] + p.v[2] * damp / 2.2);
        s.scale.setScalar(p.size * (1 + p.grow * Math.sqrt(u)));
        s.material.color.copy(p.color); s.material.opacity = p.op * Math.min(1, age / 0.08) * (1 - u) * (1 - u * 0.3);
      }
      for (; k < pool.length; k++) pool[k].visible = false;
    },
    clear() { parts.length = 0; },
  };
  return P;
}

/** 0 → 1 with a springy overshoot (pop-in). */
export function boing(u) { u = Math.min(1, Math.max(0, u)); if (u >= 1) return 1; return 1 - Math.exp(-6 * u) * Math.cos(10 * u); }

/** Camera shake (metres) from impacts at `times`: decays over `dur` s. Returns [dx, dy]. */
export function kick(t, times, amp = 0.2, dur = 0.5) {
  let x = 0, y = 0;
  for (const t0 of times) { const a = t - t0; if (a < 0 || a > dur) continue; const e = Math.exp(-a * 8) * amp; x += Math.sin(a * 61) * e; y += Math.cos(a * 47) * e; }
  return [x, y];
}
