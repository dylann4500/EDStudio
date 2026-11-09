// 051 (Scribe promo, "everyone in my town has a number above their head"): floating number badges over heads.
// Each tag is a camera-facing sprite (canvas texture, redrawn only when its text/colour changes) anchored at its BOTTOM centre
// (put `pos` just above the head top). Sized for the lens every frame (CLAUDE.md "Floating labels above heads", 016 say()):
// its on-screen height stays between minPx and maxPx (of a 1920 px frame) whatever the distance, so a crowd 12 m away still
// reads and a hero close-up doesn't fill the frame.
//   const tags = makeNumTags(scene, 40);
//   tags.set(i, { pos: [x, y, z], value: 47.3 | text: '46:59', label: 'GRADING', tier: 'auto'|'zero'|'low'|'mid'|'high',
//                 pop: 0..1.3 (scale), minPx, maxPx, natH (m, the size it has in the world when that fits), lift (m) });
//   tags.set(i, null) hides it; tags.update(camera) after the camera moves (every frame); tags.hideAll().
// Colours: 0 = green + a soft glow, < 100 = yellow rim, < 1000 = orange, ≥ 1000 = red (digits white on a dark pill, black stroke).
import * as THREE from 'three';

const TIER = {
  zero: { rim: '#2fe06a', fg: '#7dff9f', glow: 'rgba(60,255,120,.9)' },
  low: { rim: '#ffd23f', fg: '#ffffff', glow: null },
  mid: { rim: '#ff9f1c', fg: '#ffffff', glow: null },
  high: { rim: '#ff3b30', fg: '#ffe1de', glow: 'rgba(255,60,40,.55)' },
};
export const tierOf = (v) => (v <= 0 ? 'zero' : v < 100 ? 'low' : v < 1000 ? 'mid' : 'high');
export const fmtNum = (v) => Math.max(0, Math.round(v)).toLocaleString('en-US');

const CW = 640, CH = 300;
function drawTag(g, text, label, tier) {
  const T = TIER[tier] || TIER.low;
  g.clearRect(0, 0, CW, CH);
  const fs = label ? 132 : 158;
  g.font = `400 ${fs}px "Luckiest Guy", "Arial Black"`;
  const tw = Math.min(g.measureText(text).width, CW - 120);
  g.font = '700 40px Fredoka, Arial';
  const lw = label ? g.measureText(label).width : 0;
  const w = Math.max(tw, lw) + 74, h = label ? 222 : 196, x = (CW - w) / 2, y = 22;
  // pill + tail (a nameplate pointing at the head)
  g.save();
  if (T.glow) { g.shadowColor = T.glow; g.shadowBlur = 34; }
  g.fillStyle = 'rgba(14,17,26,.86)'; g.beginPath(); g.roundRect(x, y, w, h, 46); g.fill();
  g.beginPath(); g.moveTo(CW / 2 - 26, y + h - 2); g.lineTo(CW / 2, y + h + 34); g.lineTo(CW / 2 + 26, y + h - 2); g.closePath(); g.fill();
  g.restore();
  g.lineWidth = 11; g.strokeStyle = T.rim; g.beginPath(); g.roundRect(x, y, w, h, 46); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  if (label) { g.font = '700 40px Fredoka, Arial'; g.fillStyle = T.rim; g.fillText(label, CW / 2, y + 58); }
  g.font = `400 ${fs}px "Luckiest Guy", "Arial Black"`;
  const by = label ? y + h - 30 : y + h / 2 + fs * 0.36;
  const sx = Math.min(1, (CW - 120) / Math.max(1, g.measureText(text).width));
  g.save(); g.translate(CW / 2, by); g.scale(sx, 1);
  g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = '#0b0d12'; g.strokeText(text, 0, 0);
  g.fillStyle = T.fg; g.fillText(text, 0, 0);
  g.restore();
}

export function makeNumTags(parent, n, { minPx = 64, maxPx = 300, natH = 0.36, renderOrder = 20 } = {}) {
  const tags = Array.from({ length: n }, () => {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false });
    const s = new THREE.Sprite(mat); s.center.set(0.5, 0.02); s.visible = false; s.renderOrder = renderOrder; s.frustumCulled = false;
    parent.add(s);
    return { s, c, g: c.getContext('2d'), tex, key: '', o: null };
  });
  const v = new THREE.Vector3();
  function set(i, o) {
    const T = tags[i]; if (!T) return;
    if (!o || o.vis === false || (o.pop ?? 1) <= 0.001) { T.s.visible = false; T.o = null; return; }
    const text = o.text ?? fmtNum(o.value ?? 0), tier = !o.tier || o.tier === 'auto' ? tierOf(o.value ?? (parseFloat(String(text).replace(/,/g, '')) || 0)) : o.tier;
    const key = text + '|' + (o.label || '') + '|' + tier;
    if (key !== T.key) { drawTag(T.g, text, o.label, tier); T.tex.needsUpdate = true; T.key = key; }
    T.s.position.set(...o.pos); T.s.visible = true; T.o = o;
  }
  /** size every visible tag for this camera (call after setCamera). */
  function update(camera) {
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 1920;
    camera.updateMatrixWorld();
    for (const T of tags) {
      if (!T.s.visible || !T.o) continue;
      T.s.getWorldPosition(v); const d = Math.max(0.3, v.distanceTo(camera.position));
      const lo = (T.o.minPx ?? minPx) * k * d, hi = (T.o.maxPx ?? maxPx) * k * d;
      const h = Math.min(hi, Math.max(lo, T.o.natH ?? natH)) * (T.o.pop ?? 1);
      T.s.scale.set(h * CW / CH, h, 1);
      if (T.o.lift) T.s.position.y = T.o.pos[1] + T.o.lift;
    }
  }
  function hideAll() { for (const T of tags) { T.s.visible = false; T.o = null; } }
  return { set, update, hideAll, tags, n };
}
