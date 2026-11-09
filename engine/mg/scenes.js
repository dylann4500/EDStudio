// Ready-made motion-graphics backdrops (parallax layers). Each draws in its own layers via M.view; the shot draws people and
// props on top in the focal layer (depth 1), then calls the matching *FG for foreground pieces (depth < 1) if any.
//   space(M, g, t, cam)                         deep-blue starfield + soft planets (title cards, globe shots, the end card)
//   beach(M, g, t, cam, { sun, pier, ferris })  golden-hour beach: sky gradient, sun, headland, sea bands with moving foam, pier +
//                                               Ferris wheel, sand. Horizon at y = −120 (depth 3); sand from y = 40 (depth 1).
//   beachFG(M, g, t, cam)                       foreground palms (depth 0.7)
//   street(M, g, t, cam, { lights })            a palm-lined avenue: buildings, road, parked cars side-on (car alarms)
import { clamp, lerp, E, shade, rng } from './ease.js';
import { shape, circle, rrect, ellipse, line, glow, cloud, blobPts, TAU } from './draw.js';
import { PAL } from './stage.js';
import { palm, ferris, sun as sunIcon, building, car } from './icons.js';

export function space(M, g, t, cam = {}, o = {}) {
  M.sky(g, o.sky ?? ['#13265a', '#0b1736', '#070f28']);
  M.view(g, cam, 4, (gg) => M.stars(gg, t, { n: 170, seed: o.seed ?? 3 }));
  if (o.planets !== false) M.view(g, cam, 2.2, (gg) => { circle(gg, -460, -760, 120, { fill: PAL.purple, shadow: { len: 240, a: 0.22 } }); circle(gg, 520, 820, 170, { fill: PAL.violet, shadow: { len: 260, a: 0.22 } }); circle(gg, 430, -620, 26, { fill: PAL.yellow }); });
}

export function beach(M, g, t, cam = {}, o = {}) {
  const k = o.dusk ?? 0;   // 0 = golden afternoon, 1 = sunset
  M.sky(g, [[0, mixK('#1b4fa0', '#1b2f6e', k)], [0.38, mixK('#4f8fe0', '#5a5ab8', k)], [0.5, mixK('#ffc98a', '#ff9a7a', k)], [1, '#ffd9a0']], 0, 1920);
  M.view(g, cam, 5, (gg) => {
    sunIcon(gg, o.sunX ?? 260, (o.sunY ?? -300) + k * 160, 70, t, { glow: '#ffd27a' });
    for (const [cx, cy, w, sp] of [[-380, -620, 260, 6], [300, -760, 200, 4], [-80, -880, 320, 5]]) cloud(gg, cx + t * sp, cy, w, { alpha: 0.95 });
  });
  // headland (the mountains up the coast)
  M.view(g, cam, 3.4, (gg) => { shape(gg, [[-900, -110], [-760, -230], [-610, -260], [-430, -205], [-300, -170], [-180, -128], [-120, -110]], { fill: '#6a7fc4', light: 0.06, alpha: 0.9 }); shape(gg, [[-900, -110], [-700, -170], [-520, -165], [-330, -120], [-240, -110]], { fill: '#8195d4', light: 0.05 }); });
  // the sea: horizon at y −110 (depth 3), bands toward the shore
  M.view(g, cam, 3, (gg) => {
    const sg = gg.createLinearGradient(0, -112, 0, 260); sg.addColorStop(0, '#5b9be0'); sg.addColorStop(0.35, '#2f7fd0'); sg.addColorStop(1, '#1d68bd'); gg.fillStyle = sg; gg.fillRect(-2000, -112, 4000, 900);
    gg.save(); gg.globalAlpha = 0.5; gg.fillStyle = '#ffe2b0'; gg.fillRect((o.sunX ?? 260) - 60, -108, 120, 4); gg.fillRect((o.sunX ?? 260) - 30, -98, 60, 3); gg.restore();
    for (let i = 0; i < 9; i++) { const y = -90 + i * i * 4.2 + i * 6, ph = (t * 0.25 + i * 0.37) % 1; line(gg, [[-1400 + ((i * 271) % 500), y], [1400, y]], { w: 2 + i * 0.5, color: '#bfe2ff', alpha: 0.18 + 0.03 * i, dash: [40 + i * 18, 70 + i * 22], dashOff: -t * (20 + i * 6) }); }
  });
  if (o.pier !== false) M.view(g, cam, 2.4, (gg) => {
    // the pier: a deck on pilings running out to sea on the right, the Ferris wheel on it
    const y = -40; shape(gg, [[1000, y + 30], [230, y - 4], [230, y + 8], [1000, y + 52]], { fill: '#e8dccb', light: 0.06 });
    for (let x = 250; x < 1000; x += 46) { const yy = y + 8 + ((x - 230) / 770) * 44; rrect(gg, x, yy, 7, 34 + ((x - 230) / 770) * 30, 2, { fill: '#7b6a5a', flat: true }); }
    if (o.ferris !== false) ferris(gg, 520, y - 150, 120, t, { color: '#fff7ea' });
    rrect(gg, 660, y - 46, 150, 46, 6, { fill: '#ff6f8f' }); rrect(gg, 670, y - 64, 130, 20, 6, { fill: '#ffd23f' });
  });
  // shore + foam (depth 1.6) then sand (depth 1)
  M.view(g, cam, 1.6, (gg) => {
    const fy = 6 + Math.sin(t * 0.9) * 8;
    shape(gg, [[-1600, -10], [1600, -10], [1600, fy + 40], [-1600, fy + 40]], { fill: '#58b6e8', flat: true });
    line(gg, Array.from({ length: 40 }, (_, i) => [-1600 + i * 82, fy + 36 + Math.sin(i * 1.3 + t * 2) * 7]), { w: 14, color: '#f2fbff', alpha: 0.9 });
  });
  M.view(g, cam, 1, (gg) => {
    const sg = gg.createLinearGradient(0, 40, 0, 1400); sg.addColorStop(0, '#f8dca0'); sg.addColorStop(1, '#e8b06a'); gg.fillStyle = sg; gg.fillRect(-3000, 40, 6000, 3000);
    const R = rng(9); gg.save(); gg.fillStyle = 'rgba(190,130,70,.22)'; for (let i = 0; i < 70; i++) { const x = -1600 + R() * 3200, y = 80 + R() ** 1.5 * 1300, s = 6 + R() * 10; gg.beginPath(); gg.ellipse(x, y, s * 1.6, s * 0.5, 0, 0, TAU); gg.fill(); } gg.restore();
  });
}
const mixK = (a, b, k) => (k <= 0 ? a : lerpHex(a, b, k));
function lerpHex(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); }

export function beachFG(M, g, t, cam = {}, o = {}) {
  M.view(g, cam, 0.7, (gg) => { palm(gg, -560, 900, 900, t, { lean: 0.22, ph: 1 }); palm(gg, 600, 980, 820, t, { lean: -0.3, ph: 2.4 }); });
}

export function street(M, g, t, cam = {}, o = {}) {
  M.sky(g, ['#2a5fb8', '#6fa8ea', '#ffd3a0'], 0, 1300);
  M.view(g, cam, 3, (gg) => { for (const [cx, cy, w] of [[-300, -700, 240], [260, -820, 180]]) cloud(gg, cx + t * 6, cy, w, { alpha: 0.9 }); });
  M.view(g, cam, 2, (gg) => {
    const R = rng(o.seed ?? 4); let x = -1300;
    while (x < 1300) { const w = 160 + R() * 160, h = 380 + R() * 520; building(gg, x, 120, w, h, { color: ['#3a5aa8', '#4a3f8f', '#2f6f9a', '#5a4fa8', '#2b4a8a'][Math.floor(R() * 5)], seed: Math.floor(R() * 99), lit: 0.25 }); x += w + 10 + R() * 30; }
  });
  M.view(g, cam, 1.4, (gg) => { for (let i = -3; i <= 3; i++) palm(gg, i * 380 + 80, 150, 520, t, { lean: (i % 2 ? 0.12 : -0.1), ph: i }); });
  M.view(g, cam, 1, (gg) => {
    rrect(gg, -3000, 120, 6000, 70, 0, { fill: '#c9cbe0', flat: true });
    const rg = gg.createLinearGradient(0, 190, 0, 900); rg.addColorStop(0, '#4a5170'); rg.addColorStop(1, '#2c3150'); gg.fillStyle = rg; gg.fillRect(-3000, 190, 6000, 1500);
    for (let x = -3000; x < 3000; x += 180) rrect(gg, x, 520, 100, 14, 7, { fill: '#f3e7a0', flat: true, alpha: 0.85 });
  });
}
