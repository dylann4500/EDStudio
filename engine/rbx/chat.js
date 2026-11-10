// Blocky-avatar game style (069): the in-game text layer, our own design. Floating name tags over heads, chat bubbles that pop
// above a speaker (camera-facing sprites, sized for the lens every frame so they read the same at any distance), and a DOM chat
// log (a translucent rounded panel with coloured user names) for the top of the frame.
//   const tags = makeTags(scene);  tags.add(P, 'Quinn', { color: '#ffd84a' });   tags.update(camera, t)
//   const chat = makeBubbles(scene); chat.say(P, 'GO QUINN GO', 3.2, 5.0);           chat.update(camera, t)
//   const log = makeChatLog({ lines: [[t, 'user', '#7cf', 'message'], …], top: 300 });  log.update(t)
// Sizes are in px of the 1920-high frame (sizeFor: world height for a sprite that must be px tall at distance d).
import * as THREE from 'three';
import { makeCanvas } from './mats.js';

const _v = new THREE.Vector3(), _c = new THREE.Vector3();
export function sizeFor(camera, pos, px) {
  const d = camera.getWorldPosition(_c).distanceTo(pos);
  return px / 1920 * 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
}

function spriteFrom(canvas) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: true, fog: false }));
  s.renderOrder = 20; s.userData.aspect = canvas.width / canvas.height; return s;
}

// ---------------------------------------------------------------- name tags
function tagCanvas(name, color = '#ffffff', sub = null) {
  const font = '700 64px Fredoka, sans-serif';
  const meas = makeCanvas(8, 8, () => {}).getContext('2d'); meas.font = font;
  const w = Math.ceil(meas.measureText(name).width) + 40, h = sub ? 132 : 92;
  return makeCanvas(w, h, (g) => {
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(name, w / 2, 48);
    g.fillStyle = color; g.fillText(name, w / 2, 46);
    if (sub) { g.font = '600 34px Fredoka, sans-serif'; g.lineWidth = 7; g.strokeText(sub, w / 2, 108); g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(sub, w / 2, 106); }
  });
}
/** tags over heads: add(target, name, { color, px, sub, at: (v) => worldPos }) — target = an avatar (P.tagWorld) or any Object3D */
export function makeTags(parent) {
  const list = [];
  return {
    list,
    add(target, name, { color = '#ffffff', px = 46, sub = null, at = null, minPx = 26, maxPx = 70 } = {}) {
      const s = spriteFrom(tagCanvas(name, color, sub)); parent.add(s);
      const e = { s, target, px, at, minPx, maxPx, on: true, hasSub: !!sub }; list.push(e); return e;
    },
    update(camera, t = 0) {
      for (const e of list) {
        const vis = e.on && (e.target.root ? e.target.root.visible && e.target.body.visible : e.target.visible !== false);
        e.s.visible = vis; if (!vis) continue;
        const p = e.at ? e.at(_v) : e.target.tagWorld ? e.target.tagWorld(_v) : e.target.getWorldPosition(_v).add(new THREE.Vector3(0, 1, 0));
        e.s.position.copy(p);
        // keep a steady on-screen size between minPx and maxPx (natural size = px at 6 m)
        const d = camera.getWorldPosition(_c).distanceTo(p), nat = e.px * 6 / Math.max(0.5, d);
        const hpx = Math.min(e.maxPx, Math.max(e.minPx, nat)) * (e.hasSub ? 1.4 : 1);
        const hw = sizeFor(camera, p, hpx); e.s.scale.set(hw * e.s.userData.aspect, hw, 1);
        e.s.center.set(0.5, 0);
      }
    },
  };
}

// ---------------------------------------------------------------- chat bubbles
function bubbleCanvas(text, { maxW = 560, fg = '#16181d', bg = 'rgba(255,255,255,0.96)', name = null, nameColor = '#2f7cf6' } = {}) {
  const font = '600 52px Fredoka, sans-serif', meas = makeCanvas(8, 8, () => {}).getContext('2d'); meas.font = font;
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (meas.measureText(s).width > maxW && cur) { lines.push(cur); cur = w; } else cur = s; }
  if (cur) lines.push(cur);
  const tw = Math.max(...lines.map((l) => meas.measureText(l).width)), nh = name ? 48 : 0;
  const W = Math.ceil(tw) + 72, H = lines.length * 62 + 52 + nh + 30;
  return makeCanvas(W, H, (g) => {
    const bh = H - 30;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.roundRect(4, 8, W - 8, bh - 4, 30); g.fill();
    g.fillStyle = bg; g.beginPath(); g.roundRect(2, 2, W - 8, bh - 6, 30); g.fill();
    g.beginPath(); g.moveTo(W / 2 - 22, bh - 6); g.lineTo(W / 2 - 1, H - 2); g.lineTo(W / 2 + 18, bh - 6); g.fill();
    if (name) { g.font = '700 38px Fredoka, sans-serif'; g.fillStyle = nameColor; g.textAlign = 'center'; g.fillText(name, W / 2 - 3, 44); }
    g.font = font; g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => g.fillText(l, W / 2 - 3, 28 + nh + 31 + i * 62));
  });
}
const easeBack = (u) => { u = Math.min(1, Math.max(0, u)); const s = 2.2; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
/** bubbles: say(target, text, t0, t1, { px, lift, name }) — pops in with a boing at t0, floats up + fades after t1. Several on
 *  one speaker stack (the newer pushes the older up). px = the bubble's height on screen (natural, clamped 70–200). */
export function makeBubbles(parent) {
  const list = [];
  return {
    list,
    say(target, text, t0, t1, o = {}) {
      const s = spriteFrom(bubbleCanvas(text, o)); s.visible = false; parent.add(s);
      const e = { s, target, t0, t1, px: o.px ?? 120, lift: o.lift ?? 0.15, at: o.at ?? null, minPx: o.minPx ?? 70, maxPx: o.maxPx ?? 210 }; list.push(e); return e;
    },
    update(camera, t) {
      const byT = new Map();
      for (const e of list) {
        const on = t >= e.t0 && t < e.t1 + 0.35 && (e.target.root ? e.target.root.visible : true);
        e.s.visible = on; if (!on) continue;
        const k = byT.get(e.target) || []; k.push(e); byT.set(e.target, k);
      }
      for (const [target, es] of byT) {
        es.sort((a, b) => b.t0 - a.t0);                 // newest first (lowest)
        let stack = 0;
        for (const e of es) {
          const base = e.at ? e.at(_v) : target.tagWorld ? target.tagWorld(_v) : target.getWorldPosition(_v);
          const d = camera.getWorldPosition(_c).distanceTo(base), nat = e.px * 6 / Math.max(0.5, d);
          const hpx = Math.min(e.maxPx, Math.max(e.minPx, nat)), hw = sizeFor(camera, base, hpx);
          const pop = easeBack((t - e.t0) / 0.28), out = Math.min(1, Math.max(0, (t - e.t1) / 0.35));
          e.s.material.opacity = 1 - out;
          e.s.scale.set(hw * e.s.userData.aspect * pop, hw * pop, 1);
          e.s.center.set(0.5, 0);
          e.s.position.copy(base).add(new THREE.Vector3(0, sizeFor(camera, base, 18) + e.lift + stack + out * hw * 0.4, 0));
          stack += hw * 1.06;
        }
      }
    },
  };
}

// ---------------------------------------------------------------- the DOM chat log (crisp, in #ui)
let CSS_DONE = false;
function css() {
  if (CSS_DONE) return; CSS_DONE = true;
  const st = document.createElement('style');
  st.textContent = `
.rbx-log { position: absolute; left: 40px; width: 560px; padding: 14px 20px 16px; border-radius: 22px; background: rgba(22,26,34,.52);
  font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 34px; line-height: 1.28; color: #fff; text-shadow: 0 2px 3px rgba(0,0,0,.6);
  opacity: 0; }
.rbx-log .rbx-row { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rbx-log .rbx-name { font-weight: 700; }`;
  document.head.appendChild(st);
}
/** lines = [[t, user, colour, text]]; shows the last `max` lines at time t; the panel fades in at `show[0]`, out at `show[1]` */
export function makeChatLog({ lines = [], top = 300, max = 5, show = [0, 1e9] } = {}) {
  css();
  const el = document.createElement('div'); el.className = 'rbx-log'; el.style.top = top + 'px';
  (document.getElementById('ui') || document.body).appendChild(el);
  let last = '';
  return {
    el,
    update(t) {
      const a = Math.min(1, Math.max(0, (t - show[0]) / 0.25)) * (1 - Math.min(1, Math.max(0, (t - show[1]) / 0.25)));
      el.style.opacity = a.toFixed(3);
      const vis = lines.filter((l) => l[0] <= t).slice(-max), key = vis.map((l) => l[0]).join(',');
      if (key === last) return; last = key;
      el.innerHTML = vis.map(([, u, c, m]) => `<div class="rbx-row"><span class="rbx-name" style="color:${c}">${u}:</span> ${m}</div>`).join('');
    },
  };
}
