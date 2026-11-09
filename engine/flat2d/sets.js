// flat2d sets: cartoon rooms seen front-on (a back wall, a baseboard, a floor that recedes to a vanishing point) and the
// furniture/props that dress them. Every function draws in WORLD units with the stage's ink (I), anchored at its BOTTOM-centre
// unless noted, so `couch(I, 300, -240, 520)` stands a couch on a baseboard at y = −240. Characters stand on the floor in front
// (y ≈ 0…250). Lines on sets are thinner (lw 4–5) than on characters (6–7) so people pop off the background.
//   room(I, { wall, floor, kind, x0, x1, top, base, front })   one call = wall + baseboard + floor
//   window2d, door2d, frame2d, poster, shelf, clock2d, plant, lamp, couch, tv, coffeeTable, rug, bed, desk, chair, chalkboard,
//   schoolDesk, teacherDesk, pegboard, workbench, garageDoor, box, bulb, bunting, laptop2d, phone2d, paper2d, sign, board
import { INK, tone } from './ink.js';

const PI = Math.PI;
const sh = (c) => tone(c, 0.82);

// ---------------------------------------------------------------- the room shell
export function room(I, o = {}) {
  const x0 = o.x0 ?? -1600, x1 = o.x1 ?? 1600, top = o.top ?? -2000, base = o.base ?? -240, front = o.front ?? 900, ctx = I.ctx;
  const wall = o.wall ?? '#f2d6a2', floor = o.floor ?? '#c98f5a';
  ctx.fillStyle = wall; ctx.fillRect(x0, top, x1 - x0, base - top);
  const pat = o.pattern ?? 'none';
  if (pat === 'stripes') { ctx.fillStyle = tone(wall, 0.93); for (let x = x0; x < x1; x += 120) ctx.fillRect(x, top, 50, base - top); }
  if (pat === 'dots') { ctx.fillStyle = tone(wall, 0.9); for (let y = top + 40; y < base; y += 90) for (let x = x0 + ((y / 90) % 2) * 45; x < x1; x += 90) { ctx.beginPath(); ctx.arc(x, y, 7, 0, PI * 2); ctx.fill(); } }
  if (pat === 'panel') { ctx.fillStyle = tone(wall, 0.9); for (let x = x0; x < x1; x += 160) ctx.fillRect(x, top, 8, base - top); ctx.fillStyle = tone(wall, 0.96); for (let x = x0 + 60; x < x1; x += 160) ctx.fillRect(x, top, 4, base - top); }
  if (pat === 'brick') { ctx.strokeStyle = tone(wall, 0.84); ctx.lineWidth = 4; for (let y = base; y > top; y -= 60) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); for (let x = x0 + ((Math.round((base - y) / 60)) % 2) * 70; x < x1; x += 140) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 60); ctx.stroke(); } } }
  if (pat === 'cinder') { ctx.strokeStyle = tone(wall, 0.86); ctx.lineWidth = 4; for (let y = base; y > top; y -= 100) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); for (let x = x0 + ((Math.round((base - y) / 100)) % 2) * 100; x < x1; x += 200) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 100); ctx.stroke(); } } }
  if (o.wainscot) { const wy = base - (o.wainscotH ?? 300); ctx.fillStyle = o.wainscot; ctx.fillRect(x0, wy, x1 - x0, base - wy); I.line([[x0, wy], [x1, wy]], { lw: 5, subStep: 120 }); }
  // floor
  ctx.fillStyle = floor; ctx.fillRect(x0, base, x1 - x0, front - base);
  const vp = o.vp ?? [0, base - 1400], kind = o.kind ?? 'boards';
  ctx.save(); ctx.beginPath(); ctx.rect(x0, base, x1 - x0, front - base); ctx.clip();
  if (kind === 'boards' || kind === 'tile') {
    ctx.strokeStyle = tone(floor, 0.8); ctx.lineWidth = 4;
    const step = kind === 'tile' ? 150 : 110;
    for (let x = x0 - 2000; x < x1 + 2000; x += step) { const k = (front - vp[1]) / (base - vp[1]); ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(vp[0] + (x - vp[0]) * k, front); ctx.stroke(); }
    if (kind === 'tile') { let y = base, d = 30; while (y < front) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); y += d; d *= 1.45; } }
    else { let y = base + 24, d = 36, k = 0; while (y < front) { for (let x = x0 + (k % 3) * 70; x < x1; x += 330) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y + d * 0.8); ctx.stroke(); } y += d; d *= 1.3; k++; } }
  }
  if (kind === 'concrete') { ctx.fillStyle = tone(floor, 0.92); for (let i = 0; i < 26; i++) { const x = x0 + ((i * 397) % (x1 - x0)), y = base + 30 + ((i * 211) % (front - base - 40)); ctx.beginPath(); ctx.ellipse(x, y, 60 + (i % 5) * 18, 10 + (i % 3) * 5, 0, 0, PI * 2); ctx.fill(); } }
  if (kind === 'carpet') { ctx.fillStyle = tone(floor, 0.94); for (let y = base + 20; y < front; y += 26) ctx.fillRect(x0, y, x1 - x0, 6); }
  ctx.restore();
  // baseboard: a strip + one ink line where wall meets floor
  ctx.fillStyle = o.baseboard ?? tone(wall, 0.78); ctx.fillRect(x0, base - 34, x1 - x0, 34);
  I.line([[x0, base - 34], [x1, base - 34]], { lw: 4, subStep: 140 }); I.line([[x0, base], [x1, base]], { lw: 5, subStep: 140 });
  if (o.ceiling) { ctx.fillStyle = o.ceiling; ctx.fillRect(x0, top - 400, x1 - x0, 400); I.line([[x0, top], [x1, top]], { lw: 5, subStep: 140 }); }
}

// ---------------------------------------------------------------- windows, doors, wall art
export function window2d(I, x, y, w, h, o = {}) {   // x,y = centre
  const ctx = I.ctx, sky = o.sky ?? 'day', fr = o.frame ?? '#ffffff';
  const skyCol = { day: ['#8fd3ff', '#cdeeff'], night: ['#1d2550', '#2f3b7a'], sunset: ['#ff9d5c', '#ffd27a'], dusk: ['#5a4b9a', '#f08a7a'] }[sky];
  I.rect(x - w / 2 - 18, y - h / 2 - 18, w + 36, h + 36, { fill: fr, shade: sh(fr), lw: 5, r: 6 });
  I.rect(x - w / 2, y - h / 2, w, h, { fill: skyCol[0], lw: 4.5, r: 2, inner: () => {
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, skyCol[0]); g.addColorStop(1, skyCol[1]); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    if (sky === 'day') { ctx.fillStyle = '#ffffff'; for (const [cx, cy, r] of [[-0.2, -0.2, 0.12], [0.05, -0.24, 0.16], [0.3, 0.1, 0.1]]) { ctx.beginPath(); ctx.ellipse(x + cx * w, y + cy * h, r * w, r * w * 0.5, 0, 0, PI * 2); ctx.fill(); } ctx.fillStyle = '#7cc46a'; ctx.beginPath(); ctx.ellipse(x - w * 0.2, y + h * 0.55, w * 0.5, h * 0.25, 0, 0, PI * 2); ctx.ellipse(x + w * 0.35, y + h * 0.6, w * 0.45, h * 0.28, 0, 0, PI * 2); ctx.fill(); }
    if (sky === 'night') { ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(x + w * 0.22, y - h * 0.2, w * 0.13, 0, PI * 2); ctx.fill(); ctx.fillStyle = skyCol[0]; ctx.beginPath(); ctx.arc(x + w * 0.28, y - h * 0.24, w * 0.11, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(x - w / 2 + ((i * 137) % 100) / 100 * w, y - h / 2 + ((i * 59) % 70) / 100 * h, 3 + (i % 3), 0, PI * 2); ctx.fill(); } }
    if (o.view) o.view(ctx, x, y, w, h);
  } });
  I.line([[x, y - h / 2], [x, y + h / 2]], { line: fr, lw: 14, sub: false, wob: 0 }); I.line([[x - w / 2, y], [x + w / 2, y]], { line: fr, lw: 14, sub: false, wob: 0 });
  I.line([[x, y - h / 2], [x, y + h / 2]], { lw: 3, subStep: 200, alpha: 0.5 }); I.line([[x - w / 2, y], [x + w / 2, y]], { lw: 3, subStep: 200, alpha: 0.5 });
  I.rect(x - w / 2 - 34, y + h / 2 + 12, w + 68, 26, { fill: fr, shade: sh(fr), lw: 5, r: 4 });
  if (o.curtains) for (const sd of [-1, 1]) {
    const cx = x + sd * (w / 2 + 6), c = o.curtains;
    I.shape([[cx - sd * 20, y - h / 2 - 50], [cx + sd * 80, y - h / 2 - 50], [cx + sd * 70, y + h / 2 + 60], [cx + sd * 30, y + h / 2 + 80], [cx - sd * 50, y + h / 2 + 50], [cx - sd * 10, y]], { fill: c, shade: sh(c), lw: 5 });
  }
  if (o.curtains) I.limb([[x - w / 2 - 110, y - h / 2 - 54], [x + w / 2 + 110, y - h / 2 - 54]], 12, '#8a5a32', { lw: 4 });
}
export function door2d(I, x, y, w = 260, h = 520, o = {}) {   // x = centre, y = bottom
  const c = o.color ?? '#b5733c';
  I.rect(x - w / 2 - 22, y - h - 22, w + 44, h + 22, { fill: o.trim ?? '#f7f0e2', lw: 5, r: 4 });
  if (o.open) { I.rect(x - w / 2, y - h, w, h, { fill: '#3b2c25', lw: 5, r: 2 }); I.shape([[x - w / 2, y - h], [x - w / 2 + w * 0.3, y - h - 30], [x - w / 2 + w * 0.3, y + 30], [x - w / 2, y]], { fill: c, shade: sh(c), lw: 5, sharp: true }); return; }
  I.rect(x - w / 2, y - h, w, h, { fill: c, shade: sh(c), lw: 5, r: 2 });
  I.rect(x - w * 0.36, y - h * 0.92, w * 0.72, h * 0.36, { fill: null, lw: 4, r: 4 }); I.rect(x - w * 0.36, y - h * 0.48, w * 0.72, h * 0.4, { fill: null, lw: 4, r: 4 });
  I.circle(x + w * 0.36, y - h * 0.5, 14, { fill: '#f2c94c', lw: 4 });
  if (o.sign) sign(I, x, y - h * 0.72, o.sign, { w: w * 0.8, h: 70, fill: o.signFill ?? '#ffffff', color: o.signColor ?? INK, size: 40, rot: -0.04 });
}
export function frame2d(I, x, y, w, h, o = {}) {   // x,y = centre
  const fr = o.frame ?? '#7a4b2a', ctx = I.ctx;
  I.rect(x - w / 2, y - h / 2, w, h, { fill: fr, shade: sh(fr), lw: 4.5, r: 3, sharp: true });
  I.rect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, { fill: o.bg ?? '#cfe8f5', lw: 3.5, r: 0, inner: () => {
    const art = o.art ?? 'mountain';
    if (art === 'mountain') { ctx.fillStyle = '#6b9e5e'; ctx.beginPath(); ctx.moveTo(x - w / 2, y + h / 2); ctx.lineTo(x - w * 0.1, y - h * 0.15); ctx.lineTo(x + w * 0.12, y + h * 0.08); ctx.lineTo(x + w * 0.3, y - h * 0.05); ctx.lineTo(x + w / 2, y + h / 2); ctx.fill(); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(x + w * 0.22, y - h * 0.22, w * 0.08, 0, PI * 2); ctx.fill(); }
    if (art === 'family') { for (const [k, c] of [[-0.24, '#ffc531'], [0, '#7b5cd6'], [0.24, '#4fae6d']]) { ctx.fillStyle = c; ctx.fillRect(x + k * w - w * 0.08, y + h * 0.05, w * 0.16, h * 0.4); ctx.fillStyle = '#f2c49a'; ctx.beginPath(); ctx.arc(x + k * w, y - h * 0.05, w * 0.09, 0, PI * 2); ctx.fill(); } }
    if (art === 'heart') { ctx.fillStyle = '#e5483d'; ctx.beginPath(); ctx.arc(x - w * 0.1, y - h * 0.05, w * 0.12, 0, PI * 2); ctx.arc(x + w * 0.1, y - h * 0.05, w * 0.12, 0, PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - w * 0.22, y); ctx.lineTo(x, y + h * 0.28); ctx.lineTo(x + w * 0.22, y); ctx.fill(); }
    if (art === 'rocket') { ctx.fillStyle = '#e5483d'; ctx.beginPath(); ctx.moveTo(x, y - h * 0.32); ctx.lineTo(x + w * 0.12, y + h * 0.1); ctx.lineTo(x - w * 0.12, y + h * 0.1); ctx.fill(); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(x - w * 0.08, y + h * 0.12); ctx.lineTo(x, y + h * 0.36); ctx.lineTo(x + w * 0.08, y + h * 0.12); ctx.fill(); }
    if (o.draw) o.draw(ctx, x, y, w, h);
  } });
}
export function poster(I, x, y, w, h, o = {}) {   // a taped paper poster, x,y = centre
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  I.rect(-w / 2, -h / 2, w, h, { fill: o.color ?? '#ffffff', lw: 4.5, r: 2, sharp: true, inner: () => { if (o.draw) o.draw(ctx, w, h); } });
  if (o.text) I.text(o.text, 0, o.ty ?? -h * 0.28, { size: o.size ?? 54, fill: o.textColor ?? '#e5483d', line: o.textLine ?? INK, lw: (o.size ?? 54) * 0.16, shadow: false, maxW: w * 0.86 });
  if (o.sub) I.text(o.sub, 0, o.sy ?? h * 0.3, { size: o.subSize ?? 34, font: 'Fredoka', weight: 700, fill: o.subColor ?? INK, line: null, maxW: w * 0.86 });
  ctx.fillStyle = 'rgba(255,255,240,.75)'; ctx.fillRect(-26, -h / 2 - 12, 52, 24);
  ctx.restore();
}
export function clock2d(I, x, y, r, o = {}) {
  I.circle(x, y, r, { fill: o.rim ?? '#e5483d', lw: 5 }); I.circle(x, y, r * 0.84, { fill: '#ffffff', lw: 4 });
  const ctx = I.ctx; ctx.fillStyle = INK; for (let i = 0; i < 12; i++) { const a = i * PI / 6; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, i % 3 ? 3 : 5.5, 0, PI * 2); ctx.fill(); }
  const hA = ((o.h ?? 3) % 12 + (o.m ?? 0) / 60) * PI / 6 - PI / 2, mA = (o.m ?? 0) * PI / 30 - PI / 2;
  I.line([[x, y], [x + Math.cos(hA) * r * 0.42, y + Math.sin(hA) * r * 0.42]], { lw: 8, sub: false }); I.line([[x, y], [x + Math.cos(mA) * r * 0.62, y + Math.sin(mA) * r * 0.62]], { lw: 5, sub: false });
}
export function plant(I, x, y, s = 1, o = {}) {
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const leaf = o.leaf ?? '#4fae6d';
  for (const [a, l] of [[-0.9, 150], [-0.45, 190], [0, 210], [0.45, 185], [0.9, 145], [-0.2, 160], [0.25, 170]]) {
    const tip = [Math.sin(a) * l, -90 - Math.cos(a) * l], mid = [tip[0] * 0.5 + 18 * Math.sign(a || 1), -90 + tip[1] * 0.5 - 90 * 0.5];
    I.shape([[0, -90], [mid[0] - 22, mid[1]], tip, [mid[0] + 22, mid[1] + 8]], { fill: leaf, shade: sh(leaf), lw: 4.5 });
  }
  I.shape([[-62, -100], [62, -100], [48, 0], [-48, 0]], { fill: o.pot ?? '#d8723c', shade: sh(o.pot ?? '#d8723c'), lw: 5 });
  I.rect(-70, -112, 140, 26, { fill: tone(o.pot ?? '#d8723c', 1.1), lw: 5, r: 6 });
  ctx.restore();
}
export function lamp(I, x, y, s = 1, o = {}) {   // a floor lamp
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.on) { const g = ctx.createRadialGradient(0, -520, 10, 0, -520, 260); g.addColorStop(0, 'rgba(255,230,150,.55)'); g.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -800, 600, 600); }
  I.ellipse(0, -6, 70, 14, { fill: '#5a4a3a', lw: 4.5 }); I.limb([[0, -10], [0, -480]], 12, '#5a4a3a', { lw: 4 });
  I.shape([[-80, -470], [80, -470], [55, -600], [-55, -600]], { fill: o.shade ?? '#ffe08a', shade: sh(o.shade ?? '#ffe08a'), lw: 5 });
  ctx.restore();
}

// ---------------------------------------------------------------- furniture
export function couch(I, x, y, w = 560, o = {}) {
  const c = o.color ?? '#d9534f', d = sh(c), h = 300;
  I.rect(x - w / 2 + 30, y - h, w - 60, h * 0.62, { fill: c, shade: d, lw: 5.5, r: 34 });                              // back
  for (const k of [-1, 1]) I.rect(x + k * (w / 2 - 48) - 48, y - h * 0.62, 96, h * 0.56, { fill: c, shade: d, lw: 5.5, r: 30 });   // arms
  const seats = o.seats ?? 2; for (let i = 0; i < seats; i++) { const sw = (w - 170) / seats; I.rect(x - w / 2 + 85 + i * sw, y - h * 0.36, sw, h * 0.2, { fill: tone(c, 1.08), shade: c, lw: 5, r: 18 }); }
  I.rect(x - w / 2 + 70, y - h * 0.18, w - 140, h * 0.14, { fill: d, lw: 5, r: 8 });
  for (const k of [-1, 1]) I.rect(x + k * (w / 2 - 70) - 12, y - 18, 24, 18, { fill: '#5a3a22', lw: 4, r: 3 });
  if (o.pillow) I.rect(x - w / 2 + 100, y - h * 0.58, 120, 100, { fill: o.pillow, shade: sh(o.pillow), lw: 5, r: 26 });
}
export function tv(I, x, y, w = 420, o = {}) {   // a TV on a low stand
  const h = w * 0.6;
  I.rect(x - w * 0.7, y - 150, w * 1.4, 150, { fill: o.stand ?? '#8a5a32', shade: sh(o.stand ?? '#8a5a32'), lw: 5, r: 8 });
  I.rect(x - w * 0.6, y - 120, w * 0.5, 80, { fill: tone(o.stand ?? '#8a5a32', 0.9), lw: 4, r: 4 }); I.rect(x + w * 0.1, y - 120, w * 0.5, 80, { fill: tone(o.stand ?? '#8a5a32', 0.9), lw: 4, r: 4 });
  I.rect(x - 20, y - 190, 40, 44, { fill: '#2b2b2b', lw: 4, r: 4 });
  I.rect(x - w / 2, y - 190 - h, w, h, { fill: '#2b2b2b', lw: 5.5, r: 14 });
  I.rect(x - w / 2 + 18, y - 190 - h + 18, w - 36, h - 36, { fill: o.screen ?? '#3a4f78', lw: 4, r: 6, inner: () => { if (o.draw) o.draw(I.ctx, x, y - 190 - h / 2, w - 36, h - 36); } });
}
export function coffeeTable(I, x, y, w = 380, o = {}) {
  const c = o.color ?? '#a8693a';
  I.rect(x - w / 2, y - 120, w, 40, { fill: c, shade: sh(c), lw: 5, r: 10 });
  for (const k of [-1, 1]) I.rect(x + k * (w / 2 - 40) - 14, y - 84, 28, 84, { fill: sh(c), lw: 4.5, r: 3 });
}
export function rug(I, x, y, rx, ry, o = {}) {
  const c = o.color ?? '#c94f4f';
  I.ellipse(x, y, rx, ry, { fill: c, lw: 4.5 }); I.ellipse(x, y, rx * 0.8, ry * 0.75, { fill: null, line: tone(c, 1.35), lw: 8 });
}
export function bed(I, x, y, w = 620, o = {}) {   // side-on bed, headboard on the LEFT (flip with o.flip)
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1);
  const wood = o.wood ?? '#a8693a', bl = o.blanket ?? '#4f86c6';
  I.rect(-w / 2 - 20, -360, 50, 360, { fill: wood, shade: sh(wood), lw: 5, r: 14 });
  I.rect(w / 2 - 30, -200, 40, 200, { fill: wood, shade: sh(wood), lw: 5, r: 12 });
  I.rect(-w / 2 + 20, -200, w - 30, 90, { fill: '#f6f2ea', lw: 5, r: 14 });
  I.rect(-w / 2 + 40, -260, 160, 80, { fill: '#ffffff', shade: '#e8e2d8', lw: 5, r: 30 });
  if (o.bump) I.shape([[-w / 2 + 150, -200], [-w / 2 + 230, -280], [w / 2 - 120, -270], [w / 2 - 10, -180], [w / 2 - 10, -110], [-w / 2 + 150, -110]], { fill: bl, shade: sh(bl), lw: 5.5 });
  else I.rect(-w / 2 + 150, -212, w - 160, 110, { fill: bl, shade: sh(bl), lw: 5.5, r: 16 });
  I.rect(-w / 2 + 20, -110, w - 30, 40, { fill: sh(wood), lw: 4.5, r: 4 });
  for (const k of [-w / 2 + 40, w / 2 - 40]) I.rect(k - 14, -70, 28, 70, { fill: sh(wood), lw: 4, r: 3 });
  ctx.restore();
}
export function desk(I, x, y, w = 520, o = {}) {   // a wooden desk, top at y − 300
  const c = o.color ?? '#b07a46', h = o.h ?? 300;
  I.rect(x - w / 2 - 14, y - h, w + 28, 38, { fill: tone(c, 1.06), shade: c, lw: 5, r: 8 });
  I.rect(x - w / 2, y - h + 38, w * 0.36, h - 38, { fill: c, shade: sh(c), lw: 5, r: 4 });
  for (let k = 0; k < 3; k++) { const yy = y - h + 54 + k * (h - 70) / 3; I.rect(x - w / 2 + 12, yy, w * 0.36 - 24, (h - 90) / 3, { fill: tone(c, 1.04), lw: 4, r: 4 }); I.limb([[x - w / 2 + w * 0.12, yy + 26], [x - w / 2 + w * 0.24, yy + 26]], 7, '#e8c86a', { lw: 3 }); }
  I.rect(x + w / 2 - 30, y - h + 38, 30, h - 38, { fill: sh(c), lw: 4.5, r: 3 });
  return y - h;   // the top surface
}
export function chair(I, x, y, s = 1, o = {}) {   // a desk chair seen from the front-ish
  const c = o.color ?? '#3d5a99', ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  I.rect(-90, -440, 180, 220, { fill: c, shade: sh(c), lw: 5, r: 40 });
  I.limb([[0, -220], [0, -90]], 22, '#555', { lw: 4 }); I.rect(-110, -240, 220, 46, { fill: tone(c, 1.1), shade: c, lw: 5, r: 18 });
  I.limb([[-100, -10], [0, -90], [100, -10]], 14, '#555', { lw: 4 }); for (const k of [-100, 100]) I.circle(k, -8, 14, { fill: '#2b2b2b', lw: 4 });
  ctx.restore();
}
export function chalkboard(I, x, y, w, h, o = {}) {   // x,y = centre; o.lines = [[text, size], …] chalk text
  const ctx = I.ctx;
  I.rect(x - w / 2 - 26, y - h / 2 - 26, w + 52, h + 52, { fill: o.frame ?? '#a8693a', shade: sh(o.frame ?? '#a8693a'), lw: 5, r: 6 });
  I.rect(x - w / 2, y - h / 2, w, h, { fill: o.board ?? '#2f5d46', lw: 4.5, r: 2, inner: () => {
    ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 6; i++) ctx.fillRect(x - w / 2 + i * w / 6 + 20, y - h / 2 + 10, w / 9, h - 20);
    let yy = y - h / 2 + (o.pad ?? 70);
    for (const [txt, size = 54, col = '#f4f1e6'] of o.lines || []) { ctx.font = `700 ${size}px Fredoka`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const ww = ctx.measureText(txt).width; ctx.save(); ctx.translate(x, yy); if (ww > w * 0.9) ctx.scale(w * 0.9 / ww, w * 0.9 / ww); ctx.fillText(txt, 0, 0); ctx.restore(); yy += size * 1.25; }
    if (o.draw) o.draw(ctx, x, y, w, h);
  } });
  I.rect(x - w / 2 - 10, y + h / 2 + 4, w + 20, 22, { fill: tone(o.frame ?? '#a8693a', 1.1), lw: 4.5, r: 4 });
  ctx.fillStyle = '#fff'; ctx.fillRect(x - w * 0.3, y + h / 2 + 2, 36, 10); ctx.fillStyle = '#ffd34d'; ctx.fillRect(x - w * 0.2, y + h / 2 + 2, 30, 10);
}
export function schoolDesk(I, x, y, s = 1, o = {}) {   // a student desk (top + legs), front view
  const ctx = I.ctx, c = o.color ?? '#d9a35c'; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const k of [-1, 1]) I.limb([[k * 150, -230], [k * 150, 0]], 16, '#7d8590', { lw: 4 });
  I.rect(-190, -262, 380, 44, { fill: c, shade: sh(c), lw: 5, r: 10 });
  if (o.paper) { ctx.save(); ctx.translate(-30, -268); ctx.rotate(-0.05); I.rect(-80, -10, 160, 16, { fill: '#ffffff', lw: 3.5, r: 2, sharp: true }); ctx.restore(); }
  ctx.restore();
}
export function teacherDesk(I, x, y, w = 600, o = {}) {
  const c = o.color ?? '#8a5a32';
  I.rect(x - w / 2, y - 300, w, 300, { fill: c, shade: sh(c), lw: 5.5, r: 6 });
  I.rect(x - w / 2 - 20, y - 330, w + 40, 40, { fill: tone(c, 1.1), lw: 5, r: 6 });
  I.rect(x - w * 0.3, y - 250, w * 0.6, 140, { fill: tone(c, 1.06), lw: 4, r: 4 });
  if (o.apple !== false) { const ax = x + w * 0.32, ay = y - 330; I.circle(ax, ay - 34, 36, { fill: '#e5483d', shade: '#b8352d', lw: 5 }); I.limb([[ax, ay - 66], [ax + 4, ay - 86]], 7, '#6b4226', { lw: 3 }); I.ellipse(ax + 20, ay - 82, 16, 8, { fill: '#4fae6d', lw: 3.5 }); }
  if (o.books !== false) { let bx = x - w * 0.38; for (const [col, bh] of [['#4f86c6', 110], ['#e5b93c', 90], ['#7b5cd6', 120]]) { I.rect(bx, y - 330 - bh, 34, bh, { fill: col, shade: sh(col), lw: 4.5, r: 3 }); bx += 38; } }
}
export function pegboard(I, x, y, w, h, o = {}) {   // x,y = centre; tool silhouettes
  const ctx = I.ctx, c = o.color ?? '#d8b07a';
  I.rect(x - w / 2, y - h / 2, w, h, { fill: c, lw: 5, r: 4, inner: () => { ctx.fillStyle = tone(c, 0.72); for (let yy = y - h / 2 + 30; yy < y + h / 2; yy += 44) for (let xx = x - w / 2 + 30; xx < x + w / 2; xx += 44) { ctx.beginPath(); ctx.arc(xx, yy, 5, 0, PI * 2); ctx.fill(); } } });
  const tools = o.tools ?? ['hammer', 'wrench', 'saw', 'pliers', 'screwdriver'];
  tools.forEach((tk, i) => { const tx = x - w / 2 + (i + 0.5) * w / tools.length, ty = y - h * 0.05; tool(I, tk, tx, ty); });
}
export function tool(I, kind, x, y, s = 1, rot = 0) {
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (kind === 'hammer') { I.limb([[0, -40], [0, 110]], 22, '#c98a4a', { lw: 4.5 }); I.rect(-58, -78, 116, 46, { fill: '#7d8590', shade: '#5f6670', lw: 5, r: 8 }); }
  if (kind === 'wrench') { I.limb([[0, -70], [0, 100]], 24, '#9aa3ad', { lw: 4.5 }); I.shape([[-30, -110], [-12, -70], [12, -70], [30, -110], [16, -116], [0, -92], [-16, -116]], { fill: '#9aa3ad', lw: 4.5, sharp: true, sub: false }); }
  if (kind === 'saw') { I.shape([[-30, -100], [30, -100], [30, -40], [-30, -40]], { fill: '#e5483d', lw: 4.5 }); I.shape([[-24, -40], [24, -40], [16, 130], [-16, 130]], { fill: '#c9d1d8', lw: 4.5, sharp: true }); }
  if (kind === 'pliers') { I.limb([[-10, 100], [-4, -20], [10, -80]], 16, '#e5483d', { lw: 4.5 }); I.limb([[10, 100], [4, -20], [-10, -80]], 16, '#e5483d', { lw: 4.5 }); }
  if (kind === 'screwdriver') { I.limb([[0, -90], [0, 0]], 30, '#ffc531', { lw: 4.5 }); I.limb([[0, 0], [0, 100]], 9, '#9aa3ad', { lw: 4 }); }
  if (kind === 'tape') { I.circle(0, 0, 50, { fill: '#c9d1d8', lw: 5 }); I.circle(0, 0, 20, { fill: '#7d8590', lw: 4 }); }
  ctx.restore();
}
export function workbench(I, x, y, w = 700, o = {}) {   // top at y − 320
  const c = o.color ?? '#b5733c';
  for (const k of [-1, 1]) I.rect(x + k * (w / 2 - 40) - 22, y - 300, 44, 300, { fill: sh(c), lw: 5, r: 3 });
  I.rect(x - w / 2 + 30, y - 120, w - 60, 30, { fill: sh(c), lw: 4.5, r: 3 });
  I.rect(x - w / 2, y - 340, w, 50, { fill: c, shade: sh(c), lw: 5.5, r: 6 });
  if (o.vise !== false) { const vx = x + w / 2 - 90; I.rect(vx - 40, y - 400, 80, 62, { fill: '#5b8fd6', shade: '#3f6fb0', lw: 5, r: 6 }); I.limb([[vx - 70, y - 380], [vx + 70, y - 380]], 10, '#9aa3ad', { lw: 4 }); }
  return y - 340;
}
export function garageDoor(I, x, y, w, h, o = {}) {   // x = centre, y = bottom
  const c = o.color ?? '#e9e4da';
  I.rect(x - w / 2 - 30, y - h - 30, w + 60, h + 30, { fill: '#9aa3ad', lw: 5, r: 4 });
  I.rect(x - w / 2, y - h, w, h, { fill: c, shade: sh(c), lw: 5, r: 2, sharp: true });
  for (let k = 1; k < 5; k++) I.line([[x - w / 2, y - h + k * h / 5], [x + w / 2, y - h + k * h / 5]], { lw: 4, subStep: 120 });
  I.rect(x - 60, y - h * 0.24, 120, 22, { fill: '#9aa3ad', lw: 4, r: 8 });
}
export function box(I, x, y, w = 200, h = 160, o = {}) {   // a cardboard box, bottom-centre
  const c = o.color ?? '#c99a5e';
  I.rect(x - w / 2, y - h, w, h, { fill: c, shade: sh(c), lw: 5, r: 4, sharp: true });
  I.line([[x - w / 2, y - h + 34], [x + w / 2, y - h + 34]], { lw: 3.5, alpha: 0.6 });
  I.rect(x - 20, y - h, 40, h * 0.5, { fill: 'rgba(255,240,200,.5)', line: null, r: 0 });
  if (o.label) I.text(o.label, x, y - h * 0.42, { size: o.size ?? 34, font: 'Fredoka', weight: 700, fill: '#5a3b22', line: null, rot: o.rot ?? -0.05, maxW: w * 0.8 });
}
export function bulb(I, x, y, len = 300, o = {}) {   // a bare bulb hanging from y (ceiling) down len
  const ctx = I.ctx, sw = Math.sin((o.t ?? I.t) * 1.7) * (o.swing ?? 0.03), bx = x + Math.sin(sw) * len, by = y + Math.cos(sw) * len;
  if (o.on !== false) { const g = ctx.createRadialGradient(bx, by + 30, 10, bx, by + 30, o.glow ?? 380); g.addColorStop(0, 'rgba(255,236,170,.6)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(bx - 400, by - 370, 800, 800); }
  I.line([[x, y], [bx, by]], { lw: 4, sub: false }); I.rect(bx - 16, by - 4, 32, 30, { fill: '#7d8590', lw: 4, r: 4 });
  I.ellipse(bx, by + 52, 30, 36, { fill: o.on === false ? '#e8e2d8' : '#fff4b8', lw: 4.5 });
}
export function bunting(I, x0, x1, y, o = {}) {   // a string of pennant flags (o.letters → an alphabet banner)
  const n = o.n ?? Math.round((x1 - x0) / 110), cols = o.colors ?? ['#e5483d', '#ffc531', '#4f86c6', '#4fae6d', '#7b5cd6'];
  const sag = o.sag ?? 50, P = (u) => [x0 + (x1 - x0) * u, y + Math.sin(u * PI) * sag];
  const pts = []; for (let i = 0; i <= 20; i++) pts.push(P(i / 20)); I.line(pts, { lw: 3.5, sub: false });
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, [px, py] = P(u), c = cols[i % cols.length], fw = (x1 - x0) / n * 0.4;
    I.shape([[px - fw, py], [px + fw, py], [px, py + fw * 2.2]], { fill: c, lw: 4, sharp: true, sub: false });
    if (o.letters) I.text(o.letters[i % o.letters.length], px, py + fw * 0.7, { size: fw * 0.9, font: 'Fredoka', weight: 700, fill: '#fff', line: null });
  }
}
export function shelf(I, x, y, w, o = {}) {   // a wall shelf, x = centre, y = shelf top; items: 'books' | 'cans' | 'trophy' | fn
  const c = o.color ?? '#a8693a';
  I.rect(x - w / 2, y, w, 26, { fill: c, shade: sh(c), lw: 5, r: 4 });
  for (const k of [-1, 1]) I.shape([[x + k * (w / 2 - 50), y + 26], [x + k * (w / 2 - 50), y + 80], [x + k * (w / 2 - 50) - k * 50, y + 26]], { fill: sh(c), lw: 4, sharp: true, sub: false });
  let bx = x - w / 2 + 24;
  for (const it of o.items || ['books']) {
    if (it === 'books') for (const [col, bh, bw] of [['#e5483d', 120, 36], ['#4f86c6', 140, 40], ['#ffc531', 110, 34], ['#4fae6d', 130, 38]]) { I.rect(bx, y - bh, bw, bh, { fill: col, shade: sh(col), lw: 4.5, r: 3 }); bx += bw + 4; }
    else if (it === 'cans') for (const col of ['#7d8590', '#e5483d', '#4f86c6']) { I.rect(bx, y - 100, 64, 100, { fill: col, shade: sh(col), lw: 4.5, r: 8 }); bx += 72; }
    else if (it === 'trophy') { I.shape([[bx, y - 160], [bx + 80, y - 160], [bx + 64, y - 90], [bx + 16, y - 90]], { fill: '#f2c94c', shade: '#c9a030', lw: 4.5 }); I.rect(bx + 30, y - 90, 20, 50, { fill: '#f2c94c', lw: 4, r: 2 }); I.rect(bx + 10, y - 40, 60, 40, { fill: '#7a4b2a', lw: 4.5, r: 3 }); bx += 100; }
    else if (it === 'robot') { I.rect(bx, y - 110, 80, 80, { fill: '#9aa3ad', shade: '#7d8590', lw: 4.5, r: 10 }); I.circle(bx + 24, y - 76, 10, { fill: '#8fe3ff', lw: 3.5 }); I.circle(bx + 56, y - 76, 10, { fill: '#8fe3ff', lw: 3.5 }); I.rect(bx + 10, y - 30, 60, 30, { fill: '#7d8590', lw: 4, r: 4 }); I.line([[bx + 40, y - 110], [bx + 40, y - 140]], { lw: 4 }); I.circle(bx + 40, y - 146, 8, { fill: '#e5483d', lw: 3.5 }); bx += 100; }
    else if (it === 'globe') { I.circle(bx + 50, y - 80, 50, { fill: '#6fb7e8', lw: 4.5, inner: () => { const ctx = I.ctx; ctx.fillStyle = '#6cc26a'; ctx.beginPath(); ctx.ellipse(bx + 40, y - 92, 22, 30, 0.4, 0, PI * 2); ctx.ellipse(bx + 70, y - 64, 16, 14, 0, 0, PI * 2); ctx.fill(); } }); I.rect(bx + 30, y - 26, 40, 26, { fill: '#7a4b2a', lw: 4, r: 3 }); bx += 110; }
    else if (typeof it === 'function') bx = it(I, bx, y) ?? bx + 100;
  }
}

// ---------------------------------------------------------------- screens, paper, signs
/** a laptop seen from the front-ish: x = centre, y = the desk surface; o.screen(ctx, x, y, w, h) paints the display */
export function laptop2d(I, x, y, w = 420, o = {}) {
  const h = w * 0.64, open = o.open ?? 1, c = o.color ?? '#b8bec6';
  I.shape([[x - w * 0.56, y], [x + w * 0.56, y], [x + w * 0.5, y - 26], [x - w * 0.5, y - 26]], { fill: tone(c, 0.9), lw: 5, sharp: true, sub: false });
  if (open <= 0.02) return;
  const sy = y - 26, top = sy - h * open;
  I.rect(x - w / 2, top, w, sy - top, { fill: c, lw: 5.5, r: 12 });
  if (o.back) { I.rect(x - w / 2, top, w, sy - top, { fill: c, shade: tone(c, 0.85), lw: 5.5, r: 12 }); if (o.logo) I.ctx.drawImage(o.logo, x - w * 0.12, (top + sy) / 2 - w * 0.12, w * 0.24, w * 0.24); return; }
  I.rect(x - w / 2 + 16, top + 16, w - 32, sy - top - 30, { fill: '#111', lw: 4, r: 4, inner: () => { if (o.screen && open > 0.9) o.screen(I.ctx, x - w / 2 + 16, top + 16, w - 32, sy - top - 30); } });
}
/** a phone (portrait): x,y = centre; o.screen(ctx, x0, y0, w, h) paints the display */
export function phone2d(I, x, y, w = 160, o = {}) {
  const h = w * 2.05, ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  I.rect(-w / 2, -h / 2, w, h, { fill: o.color ?? '#2b2b33', lw: 5.5, r: w * 0.18 });
  I.rect(-w / 2 + 10, -h / 2 + 12, w - 20, h - 24, { fill: '#000', line: null, r: w * 0.12, inner: () => { if (o.screen) o.screen(ctx, -w / 2 + 10, -h / 2 + 12, w - 20, h - 24); } });
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(-w * 0.18, -h / 2 + 18, w * 0.36, 16, 8); ctx.fill();
  ctx.restore();
}
/** a sheet of paper; o.canvas = the page image (scribe.js makeSheet().canvas), x,y = centre */
export function paper2d(I, x, y, w, o = {}) {
  const ctx = I.ctx, h = w * (o.aspect ?? 1325 / 1024); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
  I.rect(-w / 2, -h / 2, w, h, { fill: '#fffdf6', lw: o.lw ?? 5, r: 2, sharp: true, inner: () => { if (o.canvas) ctx.drawImage(o.canvas, -w / 2, -h / 2, w, h); if (o.draw) o.draw(ctx, w, h); } });
  ctx.restore();
}
/** a hand-painted sign board (x,y = centre) */
export function sign(I, x, y, text, o = {}) {
  const ctx = I.ctx, size = o.size ?? 56; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  const w = o.w ?? I.measure(text, size, o.font ?? '"Luckiest Guy"') + size * 1.2, h = o.h ?? size * 1.6;
  I.rect(-w / 2, -h / 2, w, h, { fill: o.fill ?? '#ffffff', shade: o.shade, lw: o.lw ?? 5.5, r: o.r ?? 10 });
  I.text(text, 0, size * 0.06, { size, fill: o.color ?? INK, line: o.textLine ?? null, font: o.font, weight: o.weight, maxW: w * 0.88, shadow: false });
  ctx.restore();
}
/** the counter board ("INVENTIONS: 41 · WORKING: 0") in FRAME px: call after S.screen(). cells = [[label, value], …] */
export function board(I, cx, cy, cells, o = {}) {
  const size = o.size ?? 50, gap = size * 0.9;
  const parts = cells.map(([l, v]) => `${l}: ${v}`), ws = parts.map((p) => I.measure(p, size, 'Fredoka', 700));
  const w = ws.reduce((a, b) => a + b, 0) + gap * (parts.length - 1) + size * 1.1, h = size * 1.55;
  const ctx = I.ctx; ctx.save(); ctx.translate(cx, cy); ctx.scale(o.pop ?? 1, o.pop ?? 1);
  I.rect(-w / 2, -h / 2, w, h, { fill: o.fill ?? '#ffffff', lw: 6, r: 12 });
  let x = -w / 2 + size * 0.55;
  parts.forEach((p, i) => {
    const [l, v] = cells[i]; ctx.font = `700 ${size}px Fredoka`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = INK; ctx.fillText(`${l}: `, x, size * 0.05); const lw = ctx.measureText(`${l}: `).width;
    ctx.fillStyle = (o.valueColors && o.valueColors[i]) || INK; ctx.fillText(String(v), x + lw, size * 0.05);
    x += ws[i] + gap;
    if (i < parts.length - 1) { ctx.fillStyle = '#b9b2a4'; ctx.fillRect(x - gap / 2 - 3, -h * 0.28, 6, h * 0.56); }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- kitchen + office pieces
export function fridge2d(I, x, y, w = 300, h = 640, o = {}) {   // bottom-centre
  const c = o.color ?? '#eef2f4';
  I.rect(x - w / 2, y - h, w, h, { fill: c, shade: tone(c, 0.86), lw: 5.5, r: 22 });
  I.line([[x - w / 2, y - h * 0.62], [x + w / 2, y - h * 0.62]], { lw: 4.5 });
  for (const yy of [y - h * 0.8, y - h * 0.45]) I.limb([[x + w / 2 - 34, yy - 50], [x + w / 2 - 34, yy + 50]], 12, '#9aa3ad', { lw: 4 });
  for (const [mx, my, col] of [[-0.2, -0.85, '#e5483d'], [0.1, -0.74, '#ffc531'], [-0.28, -0.5, '#4f86c6']]) I.rect(x + mx * w - 18, y + my * h - 18, 36, 36, { fill: col, lw: 3.5, r: 6 });
  if (o.drawing) { I.ctx.save(); I.ctx.translate(x - w * 0.05, y - h * 0.32); I.ctx.rotate(0.06); I.rect(-60, -70, 120, 140, { fill: '#fff', lw: 3.5, r: 2, sharp: true }); I.circle(0, -20, 26, { fill: '#ffd34d', lw: 3.5 }); I.line([[-40, 40], [40, 40]], { line: '#4fae6d', lw: 8 }); I.ctx.restore(); }
}
export function counter2d(I, x, y, w = 900, o = {}) {   // base cabinets + counter top at y − 300 (+ optional sink, stove)
  const c = o.color ?? '#f2f0e8', top = o.top ?? '#d0d7dc';
  I.rect(x - w / 2, y - 280, w, 280, { fill: c, shade: tone(c, 0.88), lw: 5, r: 4 });
  const n = Math.max(2, Math.round(w / 220)); for (let i = 0; i < n; i++) { const cx = x - w / 2 + (i + 0.5) * w / n; I.rect(cx - w / n / 2 + 14, y - 260, w / n - 28, 230, { fill: tone(c, 1.02), lw: 4, r: 6 }); I.limb([[cx - 20, y - 230], [cx + 20, y - 230]], 9, '#9aa3ad', { lw: 3 }); }
  I.rect(x - w / 2 - 16, y - 312, w + 32, 36, { fill: top, shade: tone(top, 0.86), lw: 5, r: 6 });
  if (o.upper) { const uy = y - 760; I.rect(x - w / 2, uy, w, 220, { fill: c, shade: tone(c, 0.88), lw: 5, r: 4 }); for (let i = 0; i < n; i++) { const cx = x - w / 2 + (i + 0.5) * w / n; I.rect(cx - w / n / 2 + 14, uy + 16, w / n - 28, 188, { fill: tone(c, 1.02), lw: 4, r: 6 }); } }
  return y - 312;
}
export function kettle(I, x, y, s = 1, o = {}) {
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  I.shape([[-60, 0], [60, 0], [50, -90], [-50, -90]], { fill: o.color ?? '#e5483d', shade: tone(o.color ?? '#e5483d', 0.8), lw: 5 });
  I.limb([[-40, -100], [0, -140], [40, -100]], 12, '#2b2b2b', { lw: 4 }); I.limb([[50, -50], [100, -90]], 18, o.color ?? '#e5483d', { lw: 4.5 });
  ctx.restore();
}
export function mug(I, x, y, s = 1, o = {}) {
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  I.arc(34, -40, 22, 24, -PI / 2, PI / 2, { lw: 10, line: INK }); I.arc(34, -40, 22, 24, -PI / 2, PI / 2, { lw: 4, line: o.color ?? '#4f86c6' });
  I.rect(-34, -80, 68, 80, { fill: o.color ?? '#4f86c6', shade: tone(o.color ?? '#4f86c6', 0.8), lw: 5, r: 8 });
  ctx.restore();
}
export function printer2d(I, x, y, w = 320, o = {}) {   // a desktop printer, bottom-centre on a surface at y
  const c = o.color ?? '#e9e9ee';
  I.rect(x - w / 2, y - 150, w, 150, { fill: c, shade: tone(c, 0.85), lw: 5.5, r: 16 });
  I.rect(x - w * 0.36, y - 190, w * 0.72, 46, { fill: tone(c, 0.92), lw: 5, r: 8 });
  I.rect(x - w * 0.4, y - 70, w * 0.8, 22, { fill: '#2b2b2b', lw: 4, r: 6 });
  I.circle(x + w * 0.36, y - 115, 10, { fill: o.light ?? '#4fae6d', lw: 3.5 });
}
export function tablet2d(I, x, y, w = 360, o = {}) {   // a tablet (landscape-ish portrait), x,y = centre; o.screen paints it
  const h = w * 1.32, ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0);
  I.rect(-w / 2, -h / 2, w, h, { fill: o.color ?? '#3a3a44', lw: 5.5, r: 26 });
  I.rect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, { fill: '#fffdf6', line: null, r: 8, inner: () => { if (o.screen) o.screen(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32); } });
  ctx.restore();
}
/** a bold in-world name label ("LEO, 9") with an optional small line under it (x,y = centre) */
export function nameTag(I, text, x, y, o = {}) {
  const k = o.pop ?? 1; if (k <= 0) return;
  const ctx = I.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.rot ?? -0.03);
  I.text(text, 0, 0, { size: o.size ?? 70, fill: o.fill ?? '#ffffff', lw: (o.size ?? 70) * 0.22 });
  if (o.sub) I.text(o.sub, 0, (o.size ?? 70) * 0.78, { size: (o.size ?? 70) * 0.42, font: 'Fredoka', weight: 700, fill: o.subFill ?? '#ffe14d', lw: (o.size ?? 70) * 0.11 });
  ctx.restore();
}
