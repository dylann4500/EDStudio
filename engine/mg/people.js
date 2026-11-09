// Motion-graphics people: simple round-headed explainer characters (front view), built from a few soft-gradient shapes.
// Unit R = head radius (px) = 40·s. Feet at (x, y); the head centre sits 3.85 R above the feet; arms are two-bone limbs posed by
// angles ({a, e}) or by an IK target ({to: [x, y]} in R units from the feet, e.g. the clap = hands at [±0.1, -2.5]).
//   const P = makeFolk({ skin, shirt, pants, hair, hairStyle: 'short'|'bob'|'long'|'bun'|'curly'|'spiky'|'cap'|'bald', glasses, seed })
//   P.draw(g, { x, y, s, arms: {L, R}, eyes: 'open'|'happy'|'closed'|'wide', look: [dx, dy], mouth: 'smile'|'grin'|'o'|'flat'|'frown'|'none',
//               blink: 0..1, lean, bob, alpha, flat (no gradients: far crowds), shadow: px (long shadow), hold: (g, hand) => {} })
//   clapArms(k) → arms for the clap (0 apart … 1 together); ARMS.* presets; makeCrowd(seed, n, opts) + drawCrowd(g, crowd, t, fn)
//   drawHandsPOV(g, k, o) = the viewer's own two big hands rising from the bottom of the frame (the POV clap)
import { clamp, lerp, shade, rng, E } from './ease.js';
import { shape, circle, rrect, ellipse, line, contact, TAU, circlePts } from './draw.js';
import { PAL } from './stage.js';

export const ARMS = {
  down: { a: 0.12, e: 0.1 }, relax: { a: 0.2, e: 0.35 }, out: { a: 1.25, e: 0.2 }, up: { a: 2.75, e: 0.15 }, cheer: { a: 2.3, e: -0.5 },
  wave: { a: 2.2, e: 0.9 }, hips: { a: 0.75, e: 2.2 }, shrug: { a: 0.9, e: -1.6 }, chin: { to: [0.15, -3.25] }, phone: { to: [0.18, -3.05] },
  hold: { to: [0.55, -2.15] }, point: { a: 1.45, e: 0 },
};
/** the clap: k = 0 hands wide apart at chest height, 1 = together in front of the chest */
export const clapArms = (k, h = -2.55) => ({ L: { to: [lerp(-1.75, -0.13, k), h + 0.15 * (1 - k)] }, R: { to: [lerp(1.75, 0.13, k), h + 0.15 * (1 - k)] } });
/** a clap cycle at rate hz starting at t0 (k: 0 apart → 1 together on each beat) */
export const clapCycle = (t, t0, hz = 2.2) => { if (t < t0) return 0; const ph = ((t - t0) * hz) % 1; return ph < 0.42 ? E.io2(ph / 0.42) : 1 - E.io2((ph - 0.42) / 0.58); };

function solveArm(sx, sy, tx, ty, l1, l2, side) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const max = (l1 + l2) * 0.999; if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const base = Math.atan2(dy, dx), off = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, 1e-6)), -1, 1));
  // elbow goes OUTWARD (away from the body) and a little down
  const c1 = base + off, c2 = base - off, e1 = [sx + Math.cos(c1) * l1, sy + Math.sin(c1) * l1], e2 = [sx + Math.cos(c2) * l1, sy + Math.sin(c2) * l1];
  const el = side * e1[0] + e1[1] * 0.3 > side * e2[0] + e2[1] * 0.3 ? e1 : e2;
  return [el, [sx + dx, sy + dy]];
}

export function makeFolk(o = {}) {
  const R0 = rng(o.seed ?? 1);
  const F = {
    skin: o.skin ?? PAL.skins[Math.floor(R0() * PAL.skins.length)], shirt: o.shirt ?? PAL.shirts[Math.floor(R0() * PAL.shirts.length)],
    pants: o.pants ?? ['#2a3a6e', '#3b2f5c', '#24535e', '#5a4632', '#2d2d3f'][Math.floor(R0() * 5)], hair: o.hair ?? ['#2b1d16', '#4a2e1c', '#121212', '#c98b3a', '#7a3b1e', '#e8d39a'][Math.floor(R0() * 6)],
    hairStyle: o.hairStyle ?? ['short', 'bob', 'long', 'bun', 'curly', 'spiky', 'cap', 'short'][Math.floor(R0() * 8)], glasses: o.glasses ?? false,
    shoes: o.shoes ?? '#f1f4ff', cap: o.capColor ?? PAL.shirts[Math.floor(R0() * PAL.shirts.length)], dress: o.dress ?? false,
  };
  const hairBack = (g, hx, hy, R, flat) => {   // hair that sits BEHIND the head
    if (F.hairStyle === 'long') shape(g, [[hx - R * 1.08, hy - R * 0.2], [hx - R * 1.12, hy + R * 1.45], [hx + R * 1.12, hy + R * 1.45], [hx + R * 1.08, hy - R * 0.2], ...circlePts(hx, hy - R * 0.08, R * 1.08, 24).slice(13, 24), ...circlePts(hx, hy - R * 0.08, R * 1.08, 24).slice(0, 2)], { fill: F.hair, flat });
    if (F.hairStyle === 'bun') circle(g, hx + R * 0.15, hy - R * 1.12, R * 0.42, { fill: F.hair, flat });
    if (F.hairStyle === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circle(g, hx + Math.cos(a) * R * 0.98, hy + Math.sin(a) * R * 0.9 + R * 0.1, R * 0.36, { fill: F.hair, flat }); }
  };
  const hairFront = (g, hx, hy, R, flat) => {
    const st = F.hairStyle;
    if (st === 'bald') return;
    if (st === 'cap') {   // a baseball cap
      shape(g, [...circlePts(hx, hy, R * 1.02, 40).slice(20, 40), [hx + R * 1.02, hy - R * 0.18], [hx - R * 1.02, hy - R * 0.18]], { fill: F.cap, flat });
      rrect(g, hx - R * 0.15, hy - R * 0.32, R * 1.35, R * 0.22, R * 0.1, { fill: shade(F.cap, -0.18), flat }); return;
    }
    const top = circlePts(hx, hy, R * 1.04, 48).slice(26, 46);   // the crown arc (left → right over the top)
    let fr;
    if (st === 'spiky') { fr = []; for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.08 + i * 0.14); fr.push([hx + Math.cos(a) * R * 1.0, hy + Math.sin(a) * R * 1.0]); fr.push([hx + Math.cos(a + 0.07) * R * 1.32, hy + Math.sin(a + 0.07) * R * 1.32]); } fr.push([hx + R * 0.98, hy - R * 0.2], [hx, hy - R * 0.5], [hx - R * 0.98, hy - R * 0.2]); shape(g, fr, { fill: F.hair, flat }); return; }
    if (st === 'bob' || st === 'long') fr = [[hx - R * 1.06, hy + R * 0.45], ...top, [hx + R * 1.06, hy + R * 0.45], [hx + R * 0.8, hy + R * 0.45], [hx + R * 0.72, hy - R * 0.32], [hx - R * 0.1, hy - R * 0.5], [hx - R * 0.72, hy - R * 0.3], [hx - R * 0.8, hy + R * 0.45]];
    else fr = [[hx - R * 1.0, hy - R * 0.1], ...top, [hx + R * 1.0, hy - R * 0.1], [hx + R * 0.55, hy - R * 0.52], [hx - R * 0.2, hy - R * 0.42], [hx - R * 0.7, hy - R * 0.5]];
    shape(g, fr, { fill: F.hair, flat });
  };
  const face = (g, hx, hy, R, p, flat) => {
    if (flat && R < 9) return;
    const [lx, ly] = p.look ?? [0, 0], eyes = p.eyes ?? 'open', bl = p.blink ?? 0, ex = R * 0.34, ey = hy + R * 0.02;
    g.save(); g.fillStyle = PAL.ink; g.strokeStyle = PAL.ink; g.lineCap = 'round'; g.lineWidth = Math.max(1.5, R * 0.1);
    for (const sx of [-1, 1]) {
      const x = hx + sx * ex + lx * R * 0.12, y = ey + ly * R * 0.1;
      if (eyes === 'happy') { g.beginPath(); g.arc(x, y + R * 0.05, R * 0.12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      else if (eyes === 'half') { g.beginPath(); g.ellipse(x, y + R * 0.03, R * 0.09, R * 0.06, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - R * 0.13, y - R * 0.03); g.lineTo(x + R * 0.13, y - R * 0.03); g.stroke(); }
      else if (eyes === 'closed' || bl > 0.6) { g.beginPath(); g.moveTo(x - R * 0.11, y); g.lineTo(x + R * 0.11, y); g.stroke(); }
      else if (eyes === 'wide') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, R * 0.17, 0, TAU); g.fill(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(x + lx * R * 0.05, y + ly * R * 0.05, R * 0.09, 0, TAU); g.fill(); }
      else { g.beginPath(); g.ellipse(x, y, R * 0.085, R * 0.11 * (1 - bl * 0.8), 0, 0, TAU); g.fill(); }
    }
    const m = p.mouth ?? 'smile', my = hy + R * 0.42;
    if (m === 'smile') { g.beginPath(); g.arc(hx, my - R * 0.12, R * 0.2, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
    else if (m === 'grin') { g.beginPath(); g.moveTo(hx - R * 0.26, my - R * 0.1); g.quadraticCurveTo(hx, my + R * 0.3, hx + R * 0.26, my - R * 0.1); g.closePath(); g.fill(); }
    else if (m === 'o') { g.beginPath(); g.ellipse(hx, my, R * 0.11, R * 0.14 * (p.open ?? 1), 0, 0, TAU); g.fill(); }
    else if (m === 'flat') { g.beginPath(); g.moveTo(hx - R * 0.16, my); g.lineTo(hx + R * 0.16, my); g.stroke(); }
    else if (m === 'frown') { g.beginPath(); g.arc(hx, my + R * 0.16, R * 0.18, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
    if (!flat && (p.blush ?? 0.5) > 0) { g.globalAlpha = 0.35 * (p.blush ?? 0.5); g.fillStyle = '#ff7a8a'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(hx + sx * R * 0.55, hy + R * 0.3, R * 0.15, R * 0.09, 0, 0, TAU); g.fill(); } }
    g.restore();
    if (F.glasses) { g.save(); g.strokeStyle = PAL.ink; g.lineWidth = Math.max(1.5, R * 0.07); for (const sx of [-1, 1]) { g.beginPath(); g.arc(hx + sx * ex, ey, R * 0.22, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(hx - ex + R * 0.22, ey); g.lineTo(hx + ex - R * 0.22, ey); g.stroke(); g.restore(); }
  };

  /** draw at pose p; returns {head: [x, y, r], hands: {L, R}} in the current transform */
  F.draw = (g, p = {}) => {
    const s = p.s ?? 1, R = 40 * s, flat = p.flat ?? false, bob = (p.bob ?? 0) * R;
    const fx = p.x ?? 0, fy = p.y ?? 0;
    g.save(); if (p.alpha !== undefined) g.globalAlpha *= clamp(p.alpha);
    g.translate(fx, fy); if (p.lean) g.rotate(p.lean); if (p.sq) g.scale(1 + p.sq * 0.5, 1 - p.sq);
    if (!flat) contact(g, 0, 0, R * 1.3, R * 0.28, 0.25);
    const sh = p.shadow ? { len: p.shadow, a: 0.16 } : null;
    // legs + shoes
    const legW = R * 0.46, hipY = -1.35 * R + bob * 0.3;
    if (!F.dress) for (const sx of [-1, 1]) rrect(g, sx * R * 0.38 - legW / 2, hipY - R * 0.1, legW, -hipY + R * 0.05, legW * 0.45, { fill: F.pants, flat, shadow: sh });
    for (const sx of [-1, 1]) ellipse(g, sx * R * 0.42, -R * 0.06, R * 0.33, R * 0.17, { fill: F.shoes, flat });
    // body (shirt): a rounded trapezoid
    const sy = -2.95 * R + bob, by = hipY + R * 0.15;
    const body = [[-R * 0.78, sy + R * 0.25], [-R * 0.55, sy], [R * 0.55, sy], [R * 0.78, sy + R * 0.25], [R * (F.dress ? 1.05 : 0.86), by - R * 0.12], [R * (F.dress ? 0.95 : 0.78), by + (F.dress ? R * 0.75 : 0)], [-R * (F.dress ? 0.95 : 0.78), by + (F.dress ? R * 0.75 : 0)], [-R * (F.dress ? 1.05 : 0.86), by - R * 0.12]];
    const hx = 0, hy = sy - R * 0.92;
    hairBack(g, hx, hy, R, flat);
    shape(g, body, { fill: F.shirt, flat, shadow: sh });
    // arms (shirt-coloured sleeves, skin hands) — IK target or angles
    const hands = {}, l1 = R * 1.0, l2 = R * 0.95;
    for (const [key, side] of [['L', -1], ['R', 1]]) {
      const A = (p.arms && p.arms[key]) || ARMS.down, shX = side * R * 0.68, shY = sy + R * 0.22;
      let el, hd;
      if (A.to) [el, hd] = solveArm(shX, shY, A.to[0] * R, A.to[1] * R + bob, l1, l2, side);
      else { const p1 = Math.PI / 2 - side * (A.a ?? 0), p2 = p1 + side * (A.e ?? 0); el = [shX + Math.cos(p1) * l1, shY + Math.sin(p1) * l1]; hd = [el[0] + Math.cos(p2) * l2, el[1] + Math.sin(p2) * l2]; }
      if (!A.behind) { line(g, [[shX, shY], el, hd], { w: R * 0.36, color: shade(F.shirt, -0.1) }); circle(g, hd[0], hd[1], R * 0.24, { fill: F.skin, flat }); }
      hands[key] = hd;
      if (p.hold && key === (p.holdHand ?? 'R')) { g.save(); p.hold(g, hd, R); g.restore(); }
    }
    // head
    circle(g, hx, hy, R, { fill: F.skin, flat, light: 0.1, shadow: sh });
    hairFront(g, hx, hy, R, flat);
    face(g, hx, hy, R, p, flat);
    const m = g.getTransform(); const out = { head: [m.a * hx + m.c * hy + m.e, m.b * hx + m.d * hy + m.f, R * Math.hypot(m.a, m.b)], hands, hy, R };
    g.restore(); return out;
  };
  return F;
}

/** a crowd: n people scattered in rows (depth 0 = front … 1 = back) across [x0, x1]; returns sorted back → front */
export function makeCrowd(seed, n, { x0 = -600, x1 = 600, y0 = 0, y1 = -300, s0 = 1, s1 = 0.45 } = {}) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const d = R() ** 0.8, folk = makeFolk({ seed: seed * 1000 + i });
    out.push({ folk, d, x: lerp(x0, x1, R()), y: lerp(y0, y1, d) + (R() - 0.5) * 18, s: lerp(s0, s1, d) * (0.9 + R() * 0.2), ph: R() * 10, rate: 0.85 + R() * 0.3, i });
  }
  return out.sort((a, b) => b.d - a.d);
}
/** draw a crowd; fn(person) → pose overrides; haze = colour drawn over the back half (atmospheric depth) */
export function drawCrowd(g, crowd, t, fn = () => ({}), { haze = null, hazeA = 0.35, flatBelow = 0.7 } = {}) {
  let hazed = !haze; const heads = [];
  for (const c of crowd) {
    if (!hazed && c.d < 0.5) { g.save(); g.globalAlpha = hazeA; g.fillStyle = haze; g.fillRect(-4000, -4000, 8000, 8000); g.restore(); hazed = true; }
    const p = { x: c.x, y: c.y, s: c.s, flat: c.s < flatBelow * 0.6, blink: ((t * c.rate + c.ph) % 3.7) < 0.12 ? 1 : 0, ...fn(c) };
    heads.push(c.folk.draw(g, p));
  }
  return heads;
}

/** the viewer's own hands (POV), rising from the bottom of the frame. k 0 = apart … 1 = touching. o: {skin, sleeve, y, spread, s, rot} */
export function drawHandsPOV(g, k, o = {}) {
  const skin = o.skin ?? '#f0bf93', sleeve = o.sleeve ?? PAL.blue, s = o.s ?? 1, cx = o.x ?? 540, by = o.y ?? 1920;
  const gap = lerp(o.spread ?? 300, 46, E.io2(k)) * s;
  for (const side of [-1, 1]) {
    g.save(); g.translate(cx + side * gap, by - (o.rise ?? 520) * s); g.rotate(side * (lerp(0.32, 0.06, k) + (o.rot ?? 0))); g.scale(s, s);
    // forearm + cuff
    rrect(g, -78, 120, 156, 520, 70, { fill: sleeve, shadow: { len: 60, a: 0.18 } });
    rrect(g, -88, 108, 176, 70, 34, { fill: shade(sleeve, 0.12) });
    // palm (back of the hand toward us), four long fingers fanned a little, the thumb out on the inner side
    const fx = [-57, -19, 19, 57], fh = [148, 178, 170, 132], fr = [-0.07, -0.02, 0.02, 0.08];
    g.save(); g.translate(-side * 70, 40); g.rotate(-side * (0.85 - 0.25 * k)); rrect(g, -26, -150, 52, 165, 26, { fill: shade(skin, -0.05), light: 0.1 }); ellipse(g, 0, -128, 12, 9, { fill: shade(skin, 0.25), flat: true, alpha: 0.5 }); g.restore();
    for (let i = 0; i < 4; i++) { const xx = side < 0 ? fx[i] : -fx[i]; g.save(); g.translate(xx, -60); g.rotate(side < 0 ? fr[i] : -fr[i]); rrect(g, -18, -fh[i], 36, fh[i] + 30, 18, { fill: skin, light: 0.1 }); ellipse(g, 0, -fh[i] + 20, 10, 8, { fill: shade(skin, 0.25), flat: true, alpha: 0.55 }); g.restore(); }
    rrect(g, -80, -84, 160, 210, 70, { fill: skin, light: 0.12 });
    for (let i = 0; i < 3; i++) { const xx = (side < 0 ? fx[i] : -fx[i]) + (side < 0 ? 19 : -19); line(g, [[xx, -70], [xx, -40]], { w: 4, color: shade(skin, -0.12), alpha: 0.5 }); }
    g.restore();
  }
}
