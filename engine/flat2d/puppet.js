// flat2d puppets: big-headed 2D cartoon people drawn front-on (3/4 by shifting the face), every part a flat fill + ink outline.
//   const leo = makePuppet({ kind: 'kid', skin, hair, hairStyle: 'spiky', shirt, top: 'tee', logo: 'bolt', bottom: 'shorts', pants,
//                            shoes, extras: { goggles: true, freckles: true }, seed: 3 });
//   leo.draw(I, pose)      pose = { x, y (feet), s, flip, turn (−1..1, the way the face looks), lean, bob, sq: [sx, sy],
//     arms: { L: ARM.hips, R: { a, e, f, hand } }, legs: { L: { a, lift, k }, R }, walk: phase, sit: true,
//     head: { tilt, dx, dy }, eyes: 'open'|'happy'|'closed'|'wide'|'half'|'angry'|'sad'|'x'|'spiral', look: [x, y],
//     brows: 'neutral'|'up'|'angry'|'sad'|'skeptic', mouth: 'smile'|'grin'|'open'|'o'|'flat'|'frown'|'shout'|'smirk'|'wavy'|'teeth',
//     open (0..1, talk), blush, soot (0..1), puff (hair poof), sweat, under(I, H) / over(I, H) = props drawn in the puppet's
//     local frame before / after the arms (H.L, H.R = hand centres), face: (I, F) => extra face marks }
//   leo.hand(pose, 'R') → world [x, y] of a hand;  leo.headAt(pose) → { x, y, r } world (bubbles, labels, emotes)
// Arms: a = shoulder angle from hanging down (+ = out/up, π = straight up, − = across the body), e = elbow bend added to it,
// f = forearm foreshortening (1 = full, 0.5 = pointing at the camera). L/R are SCREEN sides (L = the left of the frame).
import { INK, tone } from './ink.js';

const PI = Math.PI;
export const BODY = {
  kid:   { leg: 150, torso: 150, sw: 150, hw: 136, rx: 128, ry: 120, arm: [76, 70], lw: 40, hand: 24, foot: [44, 23], neck: 8 },
  teen:  { leg: 238, torso: 206, sw: 166, hw: 146, rx: 120, ry: 126, arm: [104, 96], lw: 40, hand: 25, foot: [46, 24], neck: 18 },
  adult: { leg: 262, torso: 236, sw: 204, hw: 176, rx: 126, ry: 134, arm: [116, 106], lw: 46, hand: 27, foot: [52, 26], neck: 16 },
};
/** tested arm presets (screen-left arm; the right arm uses the same numbers, mirrored) */
export const ARM = {
  down: { a: 0.14, e: 0.12 }, relax: { a: 0.22, e: -0.25 }, hips: { a: 0.85, e: -2.25, f: 0.85 },
  up: { a: 2.75, e: 0.05, hand: 'open' }, cheer: { a: 2.35, e: 0.45, hand: 'fist' }, wave: { a: 2.2, e: 0.75, hand: 'open' },
  out: { a: 1.45, e: 0.2, hand: 'open' }, shrug: { a: 0.95, e: 1.35, hand: 'open' }, point: { a: 1.5, e: 0.05, hand: 'point' },
  hold: { a: 0.35, e: -1.25, f: 0.75 }, cross: { a: 0.18, e: -1.72, f: 0.95 }, chin: { a: 0.3, e: -2.75, f: 0.95 },
  face: { a: 1.15, e: -3.75, f: 1.45 }, phone: { a: 1.0, e: -3.6, f: 1.35 }, thumb: { a: 0.55, e: -1.5, f: 0.9, hand: 'thumb' },
  back: { a: 0.35, e: -0.6, behind: true },
};
const dir = (th) => [Math.sin(th), Math.cos(th)];
const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export function makePuppet(o = {}) {
  const B = { ...BODY[o.kind || 'kid'], ...(o.body || {}) };
  const C = {
    skin: o.skin ?? '#f2c49a', hair: o.hair ?? '#3b2618', shirt: o.shirt ?? '#ffcc33', pants: o.pants ?? '#3d5a99', shoes: o.shoes ?? '#e6463c',
    sock: o.sock ?? '#ffffff', top: o.top ?? 'tee', bottom: o.bottom ?? 'pants', hairStyle: o.hairStyle ?? 'short', sleeves: o.sleeves ?? 'long',
    under: o.underShirt ?? '#ffffff', ...o,
  };
  const ex = o.extras || {}, seed = o.seed ?? 1;
  const shadeOf = (c) => tone(c, 0.8);
  const P = { o: C, B, seed };

  // ---------------------------------------------------------------- geometry (local: feet at 0, y down)
  const hipY = -B.leg, shY = hipY - B.torso;
  const headC = (pose) => [(pose.head?.dx ?? 0), shY - B.neck - B.ry * 0.8 + (pose.head?.dy ?? 0)];
  function legPts(pose, sd) {
    const L = pose.legs?.[sd < 0 ? 'L' : 'R'] || {};
    let a = L.a ?? 0.05, lift = L.lift ?? 0, k = L.k ?? 0;
    if (pose.walk != null) { const ph = pose.walk * PI * 2 + (sd > 0 ? PI : 0); lift = Math.max(0, Math.sin(ph)) * 0.7; a = 0.05 + 0.05 * Math.cos(ph); }
    const hip = [sd * B.hw * 0.26, hipY + 6];
    const thigh = (B.leg * 0.5) * (1 - 0.55 * lift), shin = B.leg * 0.5 - B.foot[1] * 0.5;
    const t1 = sd * a, knee = add(hip, dir(t1), thigh), ank = add(knee, dir(t1 + sd * k), shin);
    return { hip, knee, ank, lift };
  }
  function armPts(pose, sd) {
    const A = pose.arms?.[sd < 0 ? 'L' : 'R'] || ARM.down;
    const sh = [sd * (B.sw / 2 - B.lw * 0.42), shY + B.lw * 0.52];
    const th = sd * (A.a ?? 0.14), el = add(sh, dir(th), B.arm[0]);
    const tf = sd * ((A.a ?? 0.14) + (A.e ?? 0)), hand = add(el, dir(tf), B.arm[1] * (A.f ?? 1));
    return { A, sh, el, hand, tf };
  }

  // ---------------------------------------------------------------- parts
  function shoe(I, pose, sd, ank) {
    const tw = (pose.turn ?? 0) * 0.5, x = ank[0] + sd * 8 + tw * B.foot[0] * 0.6, y = ank[1] + B.foot[1] * 0.35;
    I.shape([[x - B.foot[0] * 0.95, y + B.foot[1] * 0.55], [x - B.foot[0], y - B.foot[1] * 0.25], [x - B.foot[0] * 0.4, y - B.foot[1] * 0.85],
      [x + B.foot[0] * 0.5, y - B.foot[1] * 0.75], [x + B.foot[0] * 1.02, y], [x + B.foot[0] * 0.9, y + B.foot[1] * 0.6]],
      { fill: C.shoes, shade: shadeOf(C.shoes), lw: 6 });
    if (C.shoeSole !== false) I.line([[x - B.foot[0] * 0.92, y + B.foot[1] * 0.18], [x + B.foot[0] * 0.95, y + B.foot[1] * 0.18]], { lw: 3.5 });
  }
  function leg(I, pose, sd) {
    const { hip, knee, ank } = legPts(pose, sd), W = B.lw * 1.05;
    if (C.bottom === 'shorts') {
      I.limb([knee, ank], W * 0.82, C.skin, { lw: 6 });
      if (C.sock) I.limb([add(ank, [0, -1], 22), ank], W * 0.86, C.sock, { lw: 5, cap: 'butt' });
      I.limb([hip, knee], W * 1.12, C.pants, { lw: 6 });
    } else if (C.bottom === 'skirt' || C.bottom === 'dress') {
      I.limb([hip, knee, ank], W * 0.78, C.tights ?? C.skin, { lw: 6 });
    } else I.limb([hip, knee, ank], W, C.pants, { lw: 6 });
    shoe(I, pose, sd, ank);
  }
  function torso(I, pose) {
    const sw = B.sw, hw = B.hw, tw = (pose.turn ?? 0) * sw * 0.1, hem = C.top === 'hoodie' ? 16 : 10;
    const pts = [[-sw / 2, shY + 34], [-sw / 2 + 12, shY + 6], [-sw * 0.2 + tw, shY - 3], [sw * 0.2 + tw, shY - 3], [sw / 2 - 12, shY + 6], [sw / 2, shY + 34],
      [hw / 2 + 4, hipY - 18], [hw / 2 + 2, hipY + hem], [-hw / 2 - 2, hipY + hem], [-hw / 2 - 4, hipY - 18]];
    if (C.bottom === 'skirt' || C.bottom === 'dress') {   // the skirt flares out over the thighs
      const sl = C.bottom === 'dress' ? 0.62 : 0.42, sy = hipY + B.leg * sl, sx = hw * 0.78;
      I.shape([[-hw / 2 - 2, hipY - 14], [hw / 2 + 2, hipY - 14], [sx, sy], [-sx, sy]], { fill: C.skirt ?? C.pants, shade: shadeOf(C.skirt ?? C.pants), lw: 6, sharp: false });
    } else if (C.bottom !== 'shorts' || true) {   // a belt line where the shirt meets the pants
      I.shape([[-hw / 2 - 3, hipY - 6], [hw / 2 + 3, hipY - 6], [hw / 2 + 1, hipY + 24], [-hw / 2 - 1, hipY + 24]], { fill: C.pants, lw: 6 });
    }
    I.shape(pts, { fill: C.shirt, shade: shadeOf(C.shirt), shadeOff: [0.16, 0.06], lw: 6.5 });
    const cx = tw;
    if (C.top === 'tee') {
      I.arc(cx, shY - 2, sw * 0.17, 22, 0.15, PI - 0.15, { lw: 5 });
      if (C.logo === 'bolt') I.shape([[cx - 6, shY + 44], [cx + 22, shY + 44], [cx + 6, shY + 76], [cx + 26, shY + 76], [cx - 14, shY + 124], [cx - 2, shY + 88], [cx - 20, shY + 88]], { fill: '#fff4b0', lw: 4.5, sharp: true, sub: false });
      if (C.logo === 'star') I.shape(starPts(cx, shY + 80, 30, 14, 5), { fill: '#fff', lw: 4.5, sharp: true, sub: false });
      if (C.logo === 'stripe') I.rect(-sw / 2 + 4, shY + 70, sw - 8, 26, { fill: tone(C.shirt, 1.45), line: null, r: 0 });
    } else if (C.top === 'hoodie') {
      I.shape([[cx - sw * 0.24, shY - 4], [cx + sw * 0.24, shY - 4], [cx + sw * 0.18, shY + 22], [cx - sw * 0.18, shY + 22]], { fill: tone(C.shirt, 0.86), lw: 5 });
      I.line([[cx - 16, shY + 18], [cx - 18, shY + 70]], { lw: 4 }); I.line([[cx + 16, shY + 18], [cx + 18, shY + 66]], { lw: 4 });
      I.circle(cx - 18, shY + 74, 5, { fill: '#fff', lw: 3 }); I.circle(cx + 18, shY + 70, 5, { fill: '#fff', lw: 3 });
      I.rect(cx - hw * 0.34, hipY - B.torso * 0.36, hw * 0.68, B.torso * 0.24, { fill: tone(C.shirt, 0.9), r: 12, lw: 4.5 });
    } else if (C.top === 'sweater') {
      I.shape([[cx - 30, shY - 2], [cx + 30, shY - 2], [cx, shY + 50]], { fill: C.under, lw: 5, sharp: true, sub: false });
      I.line([[-hw / 2 + 4, hipY - 4], [hw / 2 - 4, hipY - 4]], { lw: 4, alpha: 0.6 });
    } else if (C.top === 'cardigan' || C.top === 'blazer') {
      I.shape([[cx - sw * 0.16, shY - 2], [cx + sw * 0.16, shY - 2], [cx + sw * 0.1, hipY + 8], [cx - sw * 0.1, hipY + 8]], { fill: C.under, lw: 5 });
      if (C.top === 'blazer') { I.shape([[cx - sw * 0.16, shY - 2], [cx - 4, shY + 70], [cx - sw * 0.28, shY + 40]], { fill: tone(C.shirt, 0.85), lw: 5, sharp: true, sub: false }); I.shape([[cx + sw * 0.16, shY - 2], [cx + 4, shY + 70], [cx + sw * 0.28, shY + 40]], { fill: tone(C.shirt, 0.85), lw: 5, sharp: true, sub: false }); }
      else for (let k = 0; k < 3; k++) I.circle(cx + sw * 0.14, shY + 50 + k * B.torso * 0.22, 6, { fill: '#f4e2b0', lw: 3 });
    } else if (C.top === 'apron') {
      I.rect(cx - hw * 0.36, shY + 30, hw * 0.72, B.torso, { fill: C.apron ?? '#ffffff', r: 10, lw: 5 });
    }
    if (C.tie) I.shape([[cx - 10, shY + 6], [cx + 10, shY + 6], [cx + 14, shY + 80], [cx, shY + 96], [cx - 14, shY + 80]], { fill: C.tie, lw: 4.5, sharp: true, sub: false });
  }
  function hand(I, A, p, tf, sd) {
    const r = B.hand, kind = A.hand || 'mitt';
    if (kind === 'point') {   // index finger along the forearm direction
      const d = dir(tf); I.limb([p, add(p, d, r * 1.55)], r * 0.62, C.skin, { lw: 5 });
    }
    if (kind === 'thumb') { I.limb([p, add(p, [0, -1], r * 1.3)], r * 0.6, C.skin, { lw: 5 }); }
    I.circle(p[0], p[1], r, { fill: C.skin, shade: shadeOf(C.skin), lw: 5.5 });
    if (kind === 'open') for (const k of [-1, 0, 1]) { const d = dir(tf + k * 0.42); I.line([add(p, d, r * 0.4), add(p, d, r * 0.98)], { lw: 3.5 }); }
    else if (kind === 'mitt') { const d = dir(tf + sd * 1.3); I.circle(p[0] + d[0] * r * 0.8, p[1] + d[1] * r * 0.8, r * 0.36, { fill: C.skin, lw: 4.5 }); }
    if (kind === 'fist') I.line([[p[0] - r * 0.4, p[1] - r * 0.1], [p[0] + r * 0.4, p[1] - r * 0.1]], { lw: 3.5 });
  }
  function arm(I, pose, sd) {
    const { A, sh, el, hand: hp, tf } = armPts(pose, sd), W = B.lw * 0.9;
    const sleeve = C.sleeves === 'long' ? C.shirt : C.skin;
    I.limb([sh, el, hp], W, sleeve, { lw: 6 });
    if (C.sleeves === 'short') I.limb([sh, add(sh, dir(sd * (A.a ?? 0.14)), B.arm[0] * 0.55)], W * 1.25, C.shirt, { lw: 6 });
    else if (C.cuff !== false) I.limb([add(el, dir(tf), B.arm[1] * (A.f ?? 1) - 12), add(el, dir(tf), B.arm[1] * (A.f ?? 1) - 4)], W * 1.02, tone(C.shirt, 0.85), { lw: 5, cap: 'butt' });
    hand(I, A, hp, tf, sd);
  }

  // ---------------------------------------------------------------- the head
  function hairBack(I, pose, c, rx, ry, puff) {
    const st = C.hairStyle, H = C.hair, sh = shadeOf(H);
    if (st === 'ponytail') {
      const sw = Math.sin((pose.t ?? I.t) * 3.1 + seed) * 0.12 + (pose.tailSwing ?? 0);
      const root = [c[0] + rx * 0.62, c[1] - ry * 0.55], d1 = dir(PI * 0.82 - sw), d2 = dir(PI * 0.92 - sw * 1.6);
      const a = add(root, d1, -ry * 0.1), m = add(root, [0.92, 0.5], rx * 0.62), e = add(m, [0.2, 1], ry * 0.8);
      I.shape([a, [m[0] + rx * 0.2, m[1] - ry * 0.12], [e[0] + rx * 0.08, e[1]], [e[0] - rx * 0.1, e[1] + ry * 0.12], [m[0] - rx * 0.16, m[1] + ry * 0.2]], { fill: H, shade: sh, lw: 6 });
      void d2;
    }
    if (st === 'long') I.shape([[c[0] - rx * 1.08, c[1] - ry * 0.2], [c[0] - rx * 1.12, c[1] + ry * 1.25], [c[0] + rx * 1.12, c[1] + ry * 1.25], [c[0] + rx * 1.08, c[1] - ry * 0.2], [c[0], c[1] - ry * 1.1]], { fill: H, shade: sh, lw: 6 });
    if (st === 'bun') I.circle(c[0], c[1] - ry * 1.08, rx * 0.36, { fill: H, shade: sh, lw: 6 });
    if (st === 'curly' || st === 'big80s') {
      const big = st === 'big80s' ? 1.5 : 1.3, n = st === 'big80s' ? 13 : 11;
      const pts = []; for (let i = 0; i <= n; i++) { const a = PI * 1.02 + (PI * 0.96) * i / n; pts.push([c[0] + Math.cos(a) * rx * big * (1 + puff * 0.2), c[1] + Math.sin(a) * ry * big * (1 + puff * 0.2) + ry * 0.12]); }
      const blob = []; for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; blob.push([x, y]); if (i < pts.length - 1) { const q = pts[i + 1], mx = (x + q[0]) / 2, my = (y + q[1]) / 2, nx = mx - c[0], ny = my - c[1], L = Math.hypot(nx, ny); blob.push([mx + nx / L * rx * 0.16, my + ny / L * rx * 0.16]); } }
      const low = st === 'big80s' ? ry * 1.15 : ry * 0.55;
      blob.push([c[0] + rx * big * 0.98, c[1] + low], [c[0] - rx * big * 0.98, c[1] + low]);
      I.shape(blob, { fill: H, shade: sh, lw: 6, sub: false });
    }
  }
  function headPts(c, rx, ry) {
    const out = [], n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const r = Math.pow(Math.pow(Math.abs(ca), 2.5) + Math.pow(Math.abs(sa), 2.5), -1 / 2.5);
      const jaw = sa > 0 ? 1 - 0.06 * sa * sa : 1;   // a softer chin
      out.push([c[0] + ca * rx * r * jaw, c[1] + sa * ry * r]);
    }
    return out;
  }
  function hairFront(I, pose, c, rx, ry, puff) {
    const st = C.hairStyle, H = C.hair, sh = shadeOf(H), tw = (pose.turn ?? 0) * rx * 0.18;
    const P2 = (fx, fy) => [c[0] + fx * rx, c[1] + fy * ry];
    if (st === 'spiky') {
      const pts = [P2(-1.02, -0.1)], n = 7;
      for (let i = 0; i <= n; i++) {
        const a = PI * 1.06 + (PI * 0.88) * i / n, rr = (i % 2 ? 1.36 + 0.1 * Math.sin(i * 2.3 + seed) : 1.02) * (1 + puff * (i % 2 ? 0.45 : 0.12));
        pts.push([c[0] + Math.cos(a) * rx * rr, c[1] + Math.sin(a) * ry * rr - ry * 0.02]);
      }
      pts.push(P2(1.02, -0.1), P2(0.82, -0.36), [c[0] + rx * 0.62 + tw, c[1] - ry * 0.26], [c[0] + rx * 0.4 + tw, c[1] - ry * 0.48], [c[0] + rx * 0.16 + tw, c[1] - ry * 0.3],
        [c[0] - rx * 0.06 + tw, c[1] - ry * 0.5], [c[0] - rx * 0.3 + tw, c[1] - ry * 0.32], [c[0] - rx * 0.5 + tw, c[1] - ry * 0.52], [c[0] - rx * 0.72 + tw, c[1] - ry * 0.3], P2(-0.86, -0.36));
      I.shape(pts, { fill: H, shade: sh, shadeOff: [0.08, 0.12], lw: 6.5, sharp: true, sub: false });
    } else if (st === 'ponytail' || st === 'long' || st === 'bob' || st === 'short' || st === 'bun' || st === 'buzz') {
      const top = st === 'buzz' ? 1.03 : 1.1, cap = [];
      for (let i = 0; i <= 14; i++) { const a = PI * 1.0 + PI * i / 14; cap.push([c[0] + Math.cos(a) * rx * top, c[1] + Math.sin(a) * ry * top - ry * 0.02]); }
      const side = st === 'bob' ? 0.55 : st === 'long' ? 0.3 : -0.05;
      if (st === 'buzz') cap.push(P2(1.0, -0.2), [c[0] + rx * 0.5, c[1] - ry * 0.62], [c[0] - rx * 0.5, c[1] - ry * 0.62], P2(-1.0, -0.2));
      else cap.push(P2(1.06, side), P2(0.92, side + 0.04), [c[0] + rx * 0.74 + tw, c[1] - ry * 0.3], [c[0] + rx * 0.3 + tw, c[1] - ry * 0.44], [c[0] - rx * 0.12 + tw, c[1] - ry * 0.34],
        [c[0] - rx * 0.5 + tw, c[1] - ry * 0.22], [c[0] - rx * 0.8 + tw, c[1] - ry * 0.02], P2(-0.95, side + 0.04), P2(-1.06, side));
      I.shape(cap, { fill: H, shade: sh, shadeOff: [0.08, 0.1], lw: 6.5, sub: false });
      if (st !== 'buzz') I.line([[c[0] + rx * 0.3 + tw, c[1] - ry * 0.88], [c[0] + rx * 0.1 + tw, c[1] - ry * 0.5]], { lw: 3.5, alpha: 0.8 });
    } else if (st === 'curly' || st === 'big80s') {
      for (let i = 0; i < 6; i++) { const fx = -0.72 + i * 0.29; I.circle(c[0] + fx * rx + tw * 0.5, c[1] - ry * (0.62 + 0.12 * Math.sin(i * 1.7)), rx * 0.24, { fill: H, shade: sh, lw: 5.5 }); }
    } else if (st === 'bald') {
      for (const sd of [-1, 1]) I.shape([[c[0] + sd * rx * 0.98, c[1] - ry * 0.32], [c[0] + sd * rx * 1.12, c[1] - ry * 0.12], [c[0] + sd * rx * 1.06, c[1] + ry * 0.2], [c[0] + sd * rx * 0.9, c[1] + ry * 0.1]], { fill: H, shade: sh, lw: 5.5 });
      I.arc(c[0] - rx * 0.35, c[1] - ry * 0.72, rx * 0.2, ry * 0.08, PI * 1.1, PI * 1.6, { line: '#fff', lw: 6, alpha: 0.7 });
    }
  }
  function eye(I, pose, c, rx, ry, sd, mood) {
    const turn = pose.turn ?? 0, far = Math.max(0, -sd * turn);
    const ex = c[0] + sd * rx * 0.36 * (1 - 0.3 * Math.abs(turn)) + turn * rx * 0.26, ey = c[1] + ry * 0.0;
    let erx = rx * 0.19 * (1 - 0.32 * far), ery = ry * 0.25;
    if (mood === 'wide') { erx *= 1.18; ery *= 1.2; }
    const L = pose.look ?? [turn * 0.6, 0];
    const lw = 5.5;
    if (mood === 'happy') { I.arc(ex, ey + ery * 0.35, erx * 0.95, ery * 0.7, PI * 1.12, PI * 1.88, { lw: 7 }); return [ex, ey, erx, ery]; }
    if (mood === 'closed') { I.arc(ex, ey - ery * 0.1, erx * 0.95, ery * 0.5, PI * 0.12, PI * 0.88, { lw: 6.5 }); return [ex, ey, erx, ery]; }
    if (mood === 'x') { const k = erx * 0.7; I.line([[ex - k, ey - k], [ex + k, ey + k]], { lw: 6.5, sub: false }); I.line([[ex + k, ey - k], [ex - k, ey + k]], { lw: 6.5, sub: false }); return [ex, ey, erx, ery]; }
    I.ellipse(ex, ey, erx, ery, { fill: '#ffffff', lw, wob: 1.1 });
    if (mood === 'spiral') { const pts = []; for (let i = 0; i < 40; i++) { const a = i * 0.45 + (pose.t ?? I.t) * 9 * sd, r = erx * 0.8 * i / 40; pts.push([ex + Math.cos(a) * r, ey + Math.sin(a) * r * ery / erx]); } I.line(pts, { lw: 3.5, sub: false }); return [ex, ey, erx, ery]; }
    const pr = rx * (mood === 'wide' ? 0.062 : 0.088) * (1 - 0.25 * far);
    const px = ex + L[0] * erx * 0.42, py = ey + L[1] * ery * 0.45 + ery * 0.08;
    I.ctx.fillStyle = INK; I.ctx.beginPath(); I.ctx.ellipse(px, py, pr, pr * 1.18, 0, 0, PI * 2); I.ctx.fill();
    I.ctx.fillStyle = '#fff'; I.ctx.beginPath(); I.ctx.arc(px - pr * 0.35, py - pr * 0.45, pr * 0.32, 0, PI * 2); I.ctx.fill();
    // lids: half = deadpan, angry = slanted in, sad = slanted out, blink = shut
    let lid = null;
    if (mood === 'half') lid = [0.1, 0.1];
    if (mood === 'angry') lid = sd < 0 ? [-0.55, 0.05] : [0.05, -0.55];
    if (mood === 'sad') lid = sd < 0 ? [0.2, -0.45] : [-0.45, 0.2];
    if (mood === 'sleepy') lid = [0.32, 0.32];
    if (pose._blink) lid = [0.95, 0.95];
    if (lid) {
      const yl = ey - ery + ery * 2 * (0.5 + lid[0] * 0.5) * 0.9, yr = ey - ery + ery * 2 * (0.5 + lid[1] * 0.5) * 0.9;
      const top = I.ellipsePts(ex, ey, erx * 1.05, ery * 1.06, PI, PI * 2, 10);
      I.shape([[ex - erx * 1.1, yl], ...top, [ex + erx * 1.1, yr]], { fill: C.skin, line: null, sub: false, wob: 0 });
      I.line([[ex - erx * 1.12, yl], [ex + erx * 1.12, yr]], { lw: 6, sub: false });
    }
    return [ex, ey, erx, ery];
  }
  function brow(I, pose, E, sd, b) {
    const [ex, ey, erx, ery] = E, by = ey - ery - B.ry * 0.12, len = erx * 1.5, inner = -sd;
    let di = 0, dout = 0, lift = 0;
    if (b === 'up') lift = -B.ry * 0.1;
    if (b === 'angry') { di = B.ry * 0.11; dout = -B.ry * 0.06; }
    if (b === 'sad') { di = -B.ry * 0.1; dout = B.ry * 0.04; }
    if (b === 'skeptic') { if (sd > 0) lift = -B.ry * 0.13; else { di = B.ry * 0.03; dout = B.ry * 0.03; } }
    const a = [ex + inner * len * 0.5, by + lift + di], z = [ex - inner * len * 0.5, by + lift + dout], m = [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2 - B.ry * 0.03];
    I.limb([a, m, z], B.rx * 0.075, C.brow ?? (C.hairStyle === 'bald' ? C.hair : INK), { line: null, lw: 0 });
  }
  function mouth(I, pose, c, rx, ry) {
    const turn = pose.turn ?? 0, mx = c[0] + turn * rx * 0.34, my = c[1] + ry * 0.46 + (pose.mouthDy ?? 0), mw = rx * 0.42;
    const kind = pose.mouth || 'smile', op = pose.open ?? 0, ctx = I.ctx;
    const DARK = '#5a1d22', TONGUE = '#ee7f8b';
    const openShape = (top, bot) => { // a filled open mouth: top/bottom edge point lists (left→right), teeth band at the top
      const pts = [...top, ...bot.slice().reverse()];
      I.shape(pts, { fill: DARK, lw: 5.5, sub: false, inner: () => {
        let y0 = 1e9; for (const p of top) y0 = Math.min(y0, p[1]);
        if (pose.teeth !== false) { ctx.fillStyle = '#fff'; ctx.fillRect(mx - mw, y0 - 4, mw * 2, Math.max(8, (bot[1][1] - y0) * 0.28)); }
        ctx.fillStyle = TONGUE; ctx.beginPath(); ctx.ellipse(mx, bot[Math.floor(bot.length / 2)][1], mw * 0.5, mw * 0.3, 0, 0, PI * 2); ctx.fill();
      } });
    };
    if (kind === 'smile') I.arc(mx, my - mw * 0.25, mw * 0.55, mw * 0.4, PI * 0.15, PI * 0.85, { lw: 6 });
    else if (kind === 'frown') I.arc(mx, my + mw * 0.2, mw * 0.45, mw * 0.28, PI * 1.15, PI * 1.85, { lw: 6 });
    else if (kind === 'flat') I.line([[mx - mw * 0.36, my], [mx + mw * 0.36, my + 2]], { lw: 6, sub: false });
    else if (kind === 'smirk') I.line([[mx - mw * 0.4, my + 4], [mx + mw * 0.1, my + 2], [mx + mw * 0.42, my - mw * 0.16]], { lw: 6, sub: false });
    else if (kind === 'wavy') { const pts = []; for (let i = 0; i <= 8; i++) pts.push([mx - mw * 0.45 + mw * 0.9 * i / 8, my + Math.sin(i * PI / 2) * mw * 0.08]); I.line(pts, { lw: 5.5, sub: false }); }
    else if (kind === 'o') I.ellipse(mx, my + 4, mw * 0.2 + op * mw * 0.1, mw * 0.24 + op * mw * 0.16, { fill: DARK, lw: 5.5 });
    else if (kind === 'teeth') {
      I.rect(mx - mw * 0.55, my - mw * 0.2, mw * 1.1, mw * 0.42, { fill: '#fff', r: mw * 0.16, lw: 5.5 });
      I.line([[mx - mw * 0.52, my + 1], [mx + mw * 0.52, my + 1]], { lw: 3.5, sub: false });
      for (const k of [-0.25, 0, 0.25]) I.line([[mx + k * mw, my - mw * 0.18], [mx + k * mw, my + mw * 0.2]], { lw: 3, sub: false });
    } else if (kind === 'grin') {
      const w = mw * 0.68, d = mw * 0.55 + op * mw * 0.2;
      openShape([[mx - w, my - mw * 0.16], [mx, my - mw * 0.06], [mx + w, my - mw * 0.16]], [[mx - w, my - mw * 0.16], [mx, my + d], [mx + w, my - mw * 0.16]]);
    } else if (kind === 'shout') {
      const w = mw * 0.55, d = mw * (0.8 + op * 0.3);
      openShape([[mx - w, my - mw * 0.2], [mx, my - mw * 0.3], [mx + w, my - mw * 0.2]], [[mx - w * 0.9, my + d * 0.5], [mx, my + d], [mx + w * 0.9, my + d * 0.5]]);
    } else if (kind === 'open') {   // talking: op 0 → a small line, 1 → wide open
      if (op < 0.08) I.arc(mx, my - mw * 0.2, mw * 0.45, mw * 0.3, PI * 0.18, PI * 0.82, { lw: 6 });
      else { const w = mw * (0.38 + op * 0.12), d = mw * (0.12 + op * 0.42); openShape([[mx - w, my - d * 0.3], [mx, my - d * 0.4], [mx + w, my - d * 0.3]], [[mx - w * 0.9, my + d * 0.2], [mx, my + d * 0.75], [mx + w * 0.9, my + d * 0.2]]); }
    }
    if (C.mustache) I.shape([[mx - mw * 0.75, my - mw * 0.05], [mx - mw * 0.5, my - mw * 0.42], [mx, my - mw * 0.36], [mx + mw * 0.5, my - mw * 0.42], [mx + mw * 0.75, my - mw * 0.05], [mx + mw * 0.3, my - mw * 0.2], [mx, my - mw * 0.14], [mx - mw * 0.3, my - mw * 0.2]], { fill: C.mustache, shade: shadeOf(C.mustache), lw: 5, sub: false });
  }
  function head(I, pose) {
    const c = headC(pose), rx = B.rx, ry = B.ry, puff = pose.puff ?? 0, turn = pose.turn ?? 0, ctx = I.ctx;
    const tilt = pose.head?.tilt ?? 0;
    ctx.save(); ctx.translate(0, shY); ctx.rotate(tilt); ctx.translate(0, -shY);
    // neck
    I.limb([[c[0] * 0.3, shY + 6], [c[0] * 0.6, shY - B.neck - 8]], B.lw * 0.95, C.skin, { lw: 5.5 });
    hairBack(I, pose, c, rx, ry, puff);
    // ears (the far ear hides behind the head when it turns)
    for (const sd of [-1, 1]) {
      if (sd * turn < -0.45) continue;
      const exx = c[0] + sd * rx * (0.97 - 0.12 * Math.abs(turn)) - turn * rx * 0.16;
      I.ellipse(exx, c[1] + ry * 0.12, rx * 0.17, ry * 0.22, { fill: C.skin, shade: shadeOf(C.skin), lw: 5.5 });
      I.arc(exx + sd * rx * 0.02, c[1] + ry * 0.12, rx * 0.08, ry * 0.11, sd > 0 ? -PI * 0.5 : PI * 0.5, sd > 0 ? PI * 0.5 : PI * 1.5, { lw: 3.5 });
    }
    I.shape(headPts(c, rx, ry), { fill: C.skin, shade: shadeOf(C.skin), shadeOff: [0.1, 0.06], lw: 7, sub: false });
    // soot (after an explosion) + blush
    if (pose.soot) { ctx.save(); ctx.globalAlpha = Math.min(1, pose.soot) * 0.75; ctx.fillStyle = '#4a4440'; for (let k = 0; k < 6; k++) { const a = h1(seed + k) * PI * 2, r = h1(seed * 3 + k) * 0.6; ctx.beginPath(); ctx.ellipse(c[0] + Math.cos(a) * rx * r, c[1] + Math.sin(a) * ry * r * 0.8, rx * 0.26, ry * 0.18, a, 0, PI * 2); ctx.fill(); } ctx.restore(); }
    const blush = pose.blush ?? (C.blush ?? 0.35);
    if (blush > 0) { ctx.save(); ctx.globalAlpha = blush * 0.55; ctx.fillStyle = '#f07a7a'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(c[0] + sd * rx * 0.56 + turn * rx * 0.2, c[1] + ry * 0.3, rx * 0.15, ry * 0.08, 0, 0, PI * 2); ctx.fill(); } ctx.restore(); }
    if (ex.freckles) { ctx.fillStyle = tone(C.skin, 0.62); for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(c[0] + sd * rx * (0.45 + 0.09 * k) + turn * rx * 0.2, c[1] + ry * (0.22 + (k % 2) * 0.06), 3.2, 0, PI * 2); ctx.fill(); } }
    // eyes, brows, nose, mouth
    const mood = pose.eyes ?? 'open';
    const bl = (mood === 'open' || mood === 'half' || mood === 'wide') && !pose.noBlink && ((pose.t ?? I.t) * 0.29 + seed * 0.173) % 1 < 0.03;
    const p2 = { ...pose, _blink: bl };
    const E = [-1, 1].map((sd) => eye(I, p2, c, rx, ry, sd, bl && mood === 'wide' ? 'open' : mood));
    if (!['happy', 'closed', 'x'].includes(mood) || pose.brows) [-1, 1].forEach((sd, i) => brow(I, pose, E[i], sd, pose.brows ?? 'neutral'));
    const nx = c[0] + turn * rx * 0.42, ny = c[1] + ry * 0.2;
    if ((C.nose ?? 'button') === 'button') I.ellipse(nx, ny, rx * 0.085, ry * 0.07, { fill: tone(C.skin, 0.88), lw: 5 });
    else if (C.nose === 'big') I.ellipse(nx, ny + 4, rx * 0.15, ry * 0.12, { fill: tone(C.skin, 0.9), shade: tone(C.skin, 0.78), lw: 5.5 });
    else I.arc(nx, ny, rx * 0.07, ry * 0.07, PI * 0.4, PI * 1.5, { lw: 4.5 });
    mouth(I, pose, c, rx, ry);
    if (pose.face) pose.face(I, { c, rx, ry, E });
    hairFront(I, pose, c, rx, ry, puff);
    // accessories
    if (ex.goggles) {   // inventor goggles pushed up on the forehead: a strap + two lenses
      const gy = c[1] - ry * 0.62, gx = c[0] + turn * rx * 0.2;
      I.limb([[c[0] - rx * 1.02, gy + ry * 0.12], [gx, gy - ry * 0.04], [c[0] + rx * 1.02, gy + ry * 0.12]], 16, '#3a3a3a', { lw: 4.5 });
      for (const sd of [-1, 1]) { const lx = gx + sd * rx * 0.3; I.circle(lx, gy, rx * 0.2, { fill: '#c98a2c', lw: 5.5 }); I.circle(lx, gy, rx * 0.13, { fill: '#9fe2ff', lw: 4.5 }); I.arc(lx - rx * 0.04, gy - rx * 0.03, rx * 0.06, rx * 0.06, PI * 1.1, PI * 1.6, { line: '#fff', lw: 4 }); }
    }
    if (ex.glasses) {
      const gy = E[0][1], col = ex.glassesColor ?? INK;
      for (const e of E) I.rect(e[0] - e[2] * 1.35, gy - e[3] * 1.05, e[2] * 2.7, e[3] * 2.1, { r: e[2] * 0.7, line: col, lw: 5.5, fill: 'rgba(200,235,255,.18)' });
      I.line([[E[0][0] + E[0][2] * 1.35, gy - 4], [E[1][0] - E[1][2] * 1.35, gy - 4]], { line: col, lw: 5, sub: false });
      if (ex.chain) I.line([[E[0][0] - E[0][2] * 1.35, gy], [c[0] - rx * 0.8, c[1] + ry * 0.9], [c[0] - rx * 0.6, c[1] + ry * 1.5]], { line: '#d9b44a', lw: 3 });
    }
    if (ex.pencil) { ctx.save(); ctx.translate(c[0] + rx * 0.98, c[1] - ry * 0.25); ctx.rotate(-0.6); I.rect(-70, -8, 120, 16, { fill: '#ffcf33', lw: 4, r: 0 }); I.shape([[50, -8], [74, 0], [50, 8]], { fill: '#f2c49a', lw: 4, sharp: true, sub: false }); ctx.restore(); }
    if (ex.bow) { const bx = c[0] + rx * 0.62, by = c[1] - ry * 0.86; I.shape([[bx, by], [bx - 34, by - 22], [bx - 34, by + 22]], { fill: ex.bow, lw: 5, sharp: true, sub: false }); I.shape([[bx, by], [bx + 34, by - 22], [bx + 34, by + 22]], { fill: ex.bow, lw: 5, sharp: true, sub: false }); I.circle(bx, by, 10, { fill: tone(ex.bow, 0.8), lw: 4 }); }
    if (pose.sweat) { const k = pose.sweat; I.shape([[c[0] + rx * 0.9, c[1] - ry * 0.5 - 30 * k], [c[0] + rx * 0.98, c[1] - ry * 0.25], [c[0] + rx * 0.9, c[1] - ry * 0.18], [c[0] + rx * 0.82, c[1] - ry * 0.25]], { fill: '#8fd3ff', lw: 4.5, sub: false }); }
    ctx.restore();
    return c;
  }

  // ---------------------------------------------------------------- draw
  P.draw = (I, pose = {}) => {
    const ctx = I.ctx, s = pose.s ?? 1, fl = pose.flip ?? 1, sq = pose.sq ?? [1, 1];
    const p = { ...pose, turn: (pose.turn ?? 0) * fl, look: pose.look ? [pose.look[0] * fl, pose.look[1]] : undefined };
    I.group(seed, () => {
      ctx.save();
      ctx.translate(pose.x ?? 0, (pose.y ?? 0) - (pose.bob ?? 0));
      if (pose.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.16 * (1 - Math.min(0.8, (pose.bob ?? 0) / 300)); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, (pose.bob ?? 0), B.hw * 0.75 * s, 16 * s, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
      ctx.scale(s * fl * sq[0], s * sq[1]);
      if (pose.rot) ctx.rotate(pose.rot);
      const H = { L: armPts(p, -1).hand, R: armPts(p, 1).hand };
      if (!pose.sit) { leg(I, p, -1); leg(I, p, 1); }
      else for (const sd of [-1, 1]) { const hip = [sd * B.hw * 0.26, hipY + 10], kn = [sd * B.hw * 0.32, hipY + 30], an = [sd * B.hw * 0.34, hipY + B.leg * 0.55]; I.limb([hip, kn, an], B.lw * 1.05, C.bottom === 'shorts' ? C.skin : C.pants, { lw: 6 }); shoe(I, p, sd, an); }
      ctx.save(); ctx.translate(0, hipY); ctx.rotate(pose.lean ?? 0); ctx.translate(0, -hipY);
      for (const sd of [-1, 1]) if (armPts(p, sd).A.behind) arm(I, p, sd);
      torso(I, p);
      if (C.top === 'hoodie') { const c = headC(p); I.ellipse(c[0] * 0.3, shY - 8, B.sw * 0.3, 26, { fill: tone(C.shirt, 0.86), lw: 5.5 }); }
      if (pose.under) pose.under(I, H);
      const order = pose.headFirst ? ['head', -1, 1] : [-1, 1, 'head'];
      for (const k of order) { if (k === 'head') { const c = head(I, p); P._lastHead = c; } else if (!armPts(p, k).A.behind) arm(I, p, k); }
      if (pose.over) pose.over(I, H);
      ctx.restore();
      ctx.restore();
    });
  };
  /** world position of a hand (call with the same pose you draw) */
  P.hand = (pose, side = 'R') => {
    const p = { ...pose, turn: (pose.turn ?? 0) * (pose.flip ?? 1) }, s = pose.s ?? 1, fl = pose.flip ?? 1, sq = pose.sq ?? [1, 1];
    let [x, y] = armPts(p, side === 'L' ? -1 : 1).hand;
    const ln = pose.lean ?? 0, dx = x, dy = y - hipY; x = dx * Math.cos(ln) - dy * Math.sin(ln); y = hipY + dx * Math.sin(ln) + dy * Math.cos(ln);
    return [(pose.x ?? 0) + x * s * fl * sq[0], (pose.y ?? 0) - (pose.bob ?? 0) + y * s * sq[1]];
  };
  /** world position of a foot (ankle) — e.g. a robot dog clamped on Dad's slipper */
  P.foot = (pose, side = 'R') => {
    const p = { ...pose, turn: (pose.turn ?? 0) * (pose.flip ?? 1) }, s = pose.s ?? 1, fl = pose.flip ?? 1, sq = pose.sq ?? [1, 1];
    const [x, y] = legPts(p, side === 'L' ? -1 : 1).ank;
    return [(pose.x ?? 0) + x * s * fl * sq[0], (pose.y ?? 0) - (pose.bob ?? 0) + (y + B.foot[1] * 0.35) * s * sq[1]];
  };
  /** the puppet's y for sitting on a seat whose top is at world y = seatY (feet dangle or rest below) */
  P.seatY = (seatY, s = 1) => seatY - (hipY + 8) * s;
  /** world centre + radius of the head (labels, bubbles, QC) */
  P.headAt = (pose) => {
    const s = pose.s ?? 1, fl = pose.flip ?? 1, sq = pose.sq ?? [1, 1], c = headC(pose), ln = pose.lean ?? 0;
    const dx = c[0], dy = c[1] - hipY, x = dx * Math.cos(ln) - dy * Math.sin(ln), y = hipY + dx * Math.sin(ln) + dy * Math.cos(ln);
    return { x: (pose.x ?? 0) + x * s * fl * sq[0], y: (pose.y ?? 0) - (pose.bob ?? 0) + y * s * sq[1], r: B.ry * s };
  };
  P.height = () => -(shY - B.neck - B.ry * 1.8);
  return P;
}

export function starPts(cx, cy, R, r, n = 5, rot = -PI / 2) {
  const out = []; for (let i = 0; i < n * 2; i++) { const a = rot + (i * PI) / n, rr = i % 2 ? r : R; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return out;
}

/** mouth flaps for an on-screen speaker from the narration words (story.words [{w,t0,t1}]): 0..1 */
export function talkAt(t, words, k0 = 0, k1 = Infinity) {
  for (const w of words || []) {
    if (w.t0 > t) break;
    if (t >= w.t0 && t < Math.min(w.t1, w.t0 + 0.6) && w.t0 >= k0 && w.t0 < k1) { const u = (t - w.t0) / Math.max(0.12, Math.min(w.t1, w.t0 + 0.6) - w.t0); return Math.max(0, Math.sin(u * PI * Math.max(1, Math.round((w.t1 - w.t0) / 0.16)))); }
  }
  return 0;
}
