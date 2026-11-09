// flat2d critters: a side-on cartoon dog (and its robot twin) in the same ink as the puppets.
//   const dog = makeDog2d({ fur: '#d9a066', patch: '#ffffff', ear: '#8a5a32', collar: '#e5483d', seed: 4 });
//   dog.draw(I, { x, y (feet), s, flip (1 = facing right), run: phase | null, wag, tongue, eyes: 'open'|'happy'|'wide', bark, sit, mouthOpen })
//   makeRobotDog({ body, accent }).draw(I, { x, y, s, flip, run, chomp: 0..1 (jaw open), eye: '#ff3b30', smoke })
import { INK, tone } from './ink.js';

const PI = Math.PI;
const dir = (a) => [Math.cos(a), Math.sin(a)];

export function makeDog2d(o = {}) {
  const fur = o.fur ?? '#d9a066', patch = o.patch ?? '#ffffff', ear = o.ear ?? tone(fur, 0.7), seed = o.seed ?? 4;
  return {
    draw(I, p = {}) {
      const ctx = I.ctx; I.group(seed, () => {
        ctx.save(); ctx.translate(p.x ?? 0, p.y ?? 0);
        if (p.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, 120 * (p.s ?? 1), 14 * (p.s ?? 1), 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
        ctx.scale((p.s ?? 1) * (p.flip ?? 1), p.s ?? 1);
        const t = p.t ?? I.t, ph = p.run != null ? p.run * PI * 2 : 0, run = p.run != null;
        const bodyY = -130 - (run ? Math.abs(Math.sin(ph)) * 14 : 0) - (p.hop ?? 0);
        const legs = [[-70, 1], [-40, 0], [60, 1], [88, 0]];
        // tail
        const wag = (p.wag ?? 0.6) * Math.sin(t * 16 + seed);
        I.limb([[-105, bodyY - 10], [-140, bodyY - 50 - wag * 10], [-150 + wag * 30, bodyY - 92]], 18, fur, { lw: 5 });
        for (const [lx, back] of legs) if (back) { const sw = run ? Math.sin(ph + lx) * 0.6 : 0; I.limb([[lx, bodyY + 20], [lx + Math.sin(sw) * 50, -14]], 30, tone(fur, 0.86), { lw: 5 }); I.ellipse(lx + Math.sin(sw) * 50 + 10, -12, 24, 13, { fill: tone(fur, 0.86), lw: 5 }); }
        if (p.sit) I.ellipse(-60, -60, 70, 60, { fill: fur, shade: tone(fur, 0.82), lw: 6 });
        I.ellipse(0, bodyY, 120, 66, { fill: fur, shade: tone(fur, 0.82), lw: 6.5 });
        I.ellipse(-20, bodyY - 18, 46, 30, { fill: patch, line: null });
        for (const [lx, back] of legs) if (!back) { const sw = run ? Math.sin(ph + lx + PI) * 0.6 : 0; I.limb([[lx, bodyY + 24], [lx + Math.sin(sw) * 50, -14]], 32, fur, { lw: 5.5 }); I.ellipse(lx + Math.sin(sw) * 50 + 12, -12, 26, 14, { fill: patch, lw: 5 }); }
        // head
        const hx = 120, hy = bodyY - 80 + (p.headDy ?? 0);
        if (p.collar !== false) I.limb([[80, bodyY - 40], [96, bodyY - 4]], 20, o.collar ?? '#e5483d', { lw: 4.5 });
        I.ellipse(hx, hy, 74, 66, { fill: fur, shade: tone(fur, 0.84), lw: 6.5 });
        const mo = p.mouthOpen ?? (p.bark ? 0.8 : 0);
        I.ellipse(hx + 66, hy + 22 + mo * 6, 46, 30, { fill: patch, lw: 6 });
        if (mo > 0.05) I.shape([[hx + 40, hy + 40], [hx + 108, hy + 34], [hx + 100, hy + 40 + 46 * mo], [hx + 50, hy + 44 + 30 * mo]], { fill: '#5a1d22', lw: 5 });
        if (p.tongue || mo > 0.4) I.ellipse(hx + 82, hy + 52 + 30 * mo, 16, 24, { fill: '#ee7f8b', lw: 4.5 });
        I.ellipse(hx + 106, hy + 10, 16, 12, { fill: INK, line: null });
        const eyes = p.eyes ?? 'open';
        if (eyes === 'happy') I.arc(hx + 30, hy - 10, 16, 12, PI * 1.1, PI * 1.9, { lw: 6.5 });
        else { I.ellipse(hx + 30, hy - 12, eyes === 'wide' ? 22 : 17, eyes === 'wide' ? 26 : 21, { fill: '#fff', lw: 5 }); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hx + 35 + (p.look ?? 0) * 6, hy - 9, 9, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx + 32, hy - 13, 3.5, 0, PI * 2); ctx.fill(); }
        const ef = Math.sin(t * 7 + seed) * 0.06 + (run ? Math.sin(ph) * 0.2 : 0);
        I.shape([[hx - 40, hy - 50], [hx - 4, hy - 60], [hx - 20 + Math.sin(ef) * 30, hy + 30], [hx - 60, hy + 14]], { fill: ear, shade: tone(ear, 0.82), lw: 6 });
        if (p.label) I.text(p.label, hx, hy - 120, { size: 44 });
        ctx.restore();
      });
    },
  };
}

export function makeRobotDog(o = {}) {
  const body = o.body ?? '#a9b4bf', acc = o.accent ?? '#e5483d', dark = tone(body, 0.75);
  return {
    draw(I, p = {}) {
      const ctx = I.ctx; I.group(o.seed ?? 21, () => {
        ctx.save(); ctx.translate(p.x ?? 0, p.y ?? 0);
        if (p.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, 130 * (p.s ?? 1), 14 * (p.s ?? 1), 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
        ctx.scale((p.s ?? 1) * (p.flip ?? 1), p.s ?? 1);
        const t = p.t ?? I.t, ph = p.run != null ? p.run * PI * 2 : 0, run = p.run != null, by = -150 - (run ? Math.abs(Math.sin(ph * 2)) * 10 : 0);
        // tail antenna
        I.limb([[-110, by - 20], [-150, by - 90 + Math.sin(t * 20) * 8]], 10, dark, { lw: 4.5 }); I.circle(-150, by - 96 + Math.sin(t * 20) * 8, 13, { fill: acc, lw: 4.5 });
        for (const [lx, b] of [[-70, 1], [60, 1]]) { const sw = run ? Math.sin(ph * 2 + lx) * 0.5 : 0; I.limb([[lx, by + 30], [lx + Math.sin(sw) * 40, -10]], 26, dark, { lw: 5, sharp: true }); void b; }
        I.rect(-125, by - 60, 250, 120, { fill: body, shade: dark, lw: 6.5, r: 26 });
        for (let k = 0; k < 3; k++) I.circle(-60 + k * 40, by - 6, 9, { fill: [acc, '#ffc531', '#4fae6d'][k], lw: 3.5 });
        I.rect(-30, by + 22, 90, 18, { fill: dark, lw: 4, r: 4 });
        for (const [lx] of [[-40], [90]]) { const sw = run ? Math.sin(ph * 2 + lx + PI) * 0.5 : 0; I.limb([[lx, by + 40], [lx + Math.sin(sw) * 40, -10]], 28, body, { lw: 5.5, sharp: true }); I.rect(lx + Math.sin(sw) * 40 - 26, -26, 56, 26, { fill: dark, lw: 5, r: 6 }); }
        // head: a box with a hinged jaw (chomp 0..1)
        const hx = 150, hy = by - 70, ch = p.chomp ?? 0;
        I.limb([[90, by - 40], [hx - 30, hy + 20]], 34, dark, { lw: 5 });
        ctx.save(); ctx.translate(hx - 40, hy + 34); ctx.rotate(ch * 0.55);
        I.rect(0, 0, 150, 38, { fill: dark, lw: 6, r: 8 });
        for (let k = 0; k < 5; k++) I.shape([[14 + k * 26, 0], [26 + k * 26, -16], [38 + k * 26, 0]], { fill: '#fff', lw: 3.5, sharp: true, sub: false });
        ctx.restore();
        I.rect(hx - 50, hy - 60, 160, 96, { fill: body, shade: dark, lw: 6.5, r: 18 });
        for (let k = 0; k < 5; k++) I.shape([[hx - 36 + k * 26, hy + 36], [hx - 24 + k * 26, hy + 54], [hx - 12 + k * 26, hy + 36]], { fill: '#fff', lw: 3.5, sharp: true, sub: false });
        I.circle(hx + 50, hy - 18, 22, { fill: '#2b2b2b', lw: 5 }); I.circle(hx + 52, hy - 18, 12, { fill: p.eye ?? acc, line: null });
        I.limb([[hx - 30, hy - 58], [hx - 50, hy - 110]], 9, dark, { lw: 4 }); I.circle(hx - 52, hy - 116, 11, { fill: '#ffc531', lw: 4 });
        I.shape([[hx - 10, hy - 60], [hx + 20, hy - 100], [hx + 40, hy - 60]], { fill: dark, lw: 5, sharp: true, sub: false });
        if (p.label) I.text(p.label, 0, by - 170, { size: 44 });
        ctx.restore();
      });
    },
  };
}
