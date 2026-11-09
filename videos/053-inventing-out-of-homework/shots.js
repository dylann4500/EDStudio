// 053 — Scribe promo: "Day N of inventing my way out of homework", the first reel in the flat2d look (engine/flat2d/: a Canvas-2D
// cartoon — thick boiling ink lines, flat fills with one cel-shade step, big-headed puppets, bold in-world labels).
// Story after @officialwriteit's 2D "inventions" reel (INVENTIONS: 41 · WORKING: 0): Leo, 9, invents something every day to get out
// of homework and every invention fails in a new way (a robot dog that eats Dad's slipper, a pencil drone that draws a mustache on
// Mom, a clone machine that clones the dog eleven times, a time machine to 1982 where there's MORE homework). Then Mrs. Grimm
// drops thirty problems, handwritten, due tomorrow, and she knows his handwriting; invention 41 (a robot arm that fakes it) blows
// up. His big brother (the narrator, "ME") shows him Scribe: one practice page → one photo of the worksheet → all thirty solved
// step by step → written out in HIS handwriting stroke by stroke (the glyphs on screen are Scribe's own demo handwriting set,
// videos/049-scribe-promo/hand.json) → printed → "Perfect match." Leo calls it invention 42, the first one that works, and takes
// the credit. End card: the real logo + tryscribe.ink + "10 free assignments".
// Product facts (the Scribe repo README + tryscribe.ink, Nov 2026): practice sheet → your handwriting (once); photos/PDFs →
// problems + worked steps → pages of handwriting drawn stroke by stroke → PDF; free plan ("10 free assignments" on the site).
// Note: the narrator is the BIG BROTHER (the brief said big sister) because the voice is Adam (male) — "my little brother" in a
// man's voice under a sister on screen would read wrong.
import { K, clamp, lerp } from '@engine/core.js';
import { beatClock } from '@engine/build/anim.js';
import { createStage, shotAt } from '@engine/flat2d/stage.js';
import { makePuppet, ARM, talkAt, starPts } from '@engine/flat2d/puppet.js';
import * as SET from '@engine/flat2d/sets.js';
import * as FX from '@engine/flat2d/fx.js';
import { tone, INK } from '@engine/flat2d/ink.js';
import { makeDog2d, makeRobotDog } from '@engine/flat2d/critters.js';
import { drawEndCard } from '@engine/flat2d/endcard.js';
import { loadHand, loadImg, makeSheet, makeScreen, layoutHand } from '@engine/build/scribe.js';

const PI = Math.PI;
const ob = (u, s = 2.0) => { u = clamp(u); return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
const pop = (t, t0, d = 0.28) => (t < t0 ? 0 : ob((t - t0) / d));
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export async function build(studio, story) {
  const S = await createStage(studio, { bg: '#f4e4c4', boil: 8, wob: 1.7 });
  const I = S.I, ctx = S.ctx;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---------------------------------------------------------------- word times (every gag is keyed to its word)
  const T = {
    homework0: W('hook', 'homework'), every: W('hook', 'every'),
    this: W('intro', 'this'), leo: W('intro', 'leo'), nine: W('intro', 'nine'),
    day1: W('dog', 'day'), robot: W('dog', 'robot'), eats: W('dog', 'eats'), hw1: W('dog', 'homework'), it1: W('dog', 'it'), ate: W('dog', 'ate'), slipper: W('dog', 'slipper'), wearing: W('dog', 'wearing'),
    day9: W('drone', 'day'), pencil: W('drone', 'pencil'), does: W('drone', 'does'), hw2: W('drone', 'homework'), it2: W('drone', 'it'), drew: W('drone', 'drew'), mustache: W('drone', 'mustache'), mom: W('drone', 'mom'),
    day23: W('clone', 'day'), clone: W('clone', 'clone'), so1: W('clone', 'so'), second: W('clone', 'second'), it3: W('clone', 'it', 2), cloned: W('clone', 'cloned'), eleven: W('clone', 'eleven'), times: W('clone', 'times'),
    day40: W('time', 'day'), tmach: W('time', 'time'), back: W('time', 'back'), before: W('time', 'before'), nineteen: W('time', 'nineteen'), they: W('time', 'they'), more: W('time', 'more'),
    then: W('teacher', 'then'), grimm: W('teacher', 'grimm'), drops: W('teacher', 'drops'), thirty: W('teacher', 'thirty'), handwritten: W('teacher', 'handwritten'), due: W('teacher', 'due'), and1: W('teacher', 'and'), knows: W('teacher', 'knows'),
    invention: W('boom', 'invention'), f41: W('boom', 'fortyone'), arm: W('boom', 'arm'), fake: W('boom', 'fake'), lasted: W('boom', 'lasted'), four: W('boom', 'four'), seconds: W('boom', 'seconds'),
    so2: W('scribe', 'so'), showed: W('scribe', 'showed'), scribe: W('scribe', 'scribe'), he: W('scribe', 'he'), wrote: W('scribe', 'wrote'), practice: W('scribe', 'practice'), learns: W('scribe', 'learns'),
    one: W('photo', 'one'), photo: W('photo', 'photo'), worksheet: W('photo', 'worksheet'), scribe2: W('photo', 'scribe'), reads: W('photo', 'reads'), solves: W('photo', 'solves'), step: W('photo', 'step'),
    then2: W('write', 'then'), writes: W('write', 'writes'), his: W('write', 'his'), pen: W('write', 'pen'),
    he2: W('print', 'he'), prints: W('print', 'prints'), done: W('print', 'done'), dinner: W('print', 'dinner'),
    next: W('match', 'next'), checks: W('match', 'checks'), page: W('match', 'page'), perfect: W('match', 'perfect'),
    so3: W('payoff', 'now'), f42: W('payoff', 'fortytwo'), first: W('payoff', 'first'), worked: W('payoff', 'worked'), and2: W('payoff', 'and'), takes: W('payoff', 'takes'), credit: W('payoff', 'credit'),
  };
  const ENDCARD = T.credit + 0.75;

  // ---------------------------------------------------------------- cast
  const leo = makePuppet({ kind: 'kid', seed: 3, skin: '#f2c49a', hair: '#4a2c17', hairStyle: 'spiky', shirt: '#ffc531', logo: 'bolt', bottom: 'shorts', pants: '#2f5fa8', shoes: '#e5483d', extras: { goggles: true, freckles: true } });
  const max = makePuppet({ kind: 'teen', seed: 5, skin: '#e9b58c', hair: '#1f1611', hairStyle: 'short', shirt: '#2fa39a', top: 'hoodie', pants: '#2b2f45', shoes: '#f4f4f4' });
  const mom = makePuppet({ kind: 'adult', seed: 7, skin: '#f0c3a0', hair: '#8a3f1d', hairStyle: 'curly', shirt: '#e06c8f', top: 'cardigan', pants: '#3d4a6b', shoes: '#7a4b2a', body: { sw: 186, hw: 166 } });
  const dad = makePuppet({ kind: 'adult', seed: 9, skin: '#e8b48c', hair: '#5a3b22', hairStyle: 'bald', shirt: '#3f7fc4', top: 'sweater', pants: '#c8a26a', shoes: '#9b7be0', mustache: '#5a3b22', nose: 'big', extras: { glasses: true } });
  const grimm = makePuppet({ kind: 'adult', seed: 11, skin: '#f1cfb0', hair: '#9ea3a8', hairStyle: 'bun', shirt: '#8e2f45', top: 'cardigan', bottom: 'dress', skirt: '#8e2f45', shoes: '#2a2a2a', extras: { glasses: true }, body: { sw: 180, hw: 160 } });
  const teach82 = makePuppet({ kind: 'adult', seed: 13, skin: '#f1c6a2', hair: '#c9873a', hairStyle: 'big80s', shirt: '#e06cc0', top: 'blazer', under: '#fff4c8', bottom: 'skirt', skirt: '#5a4a8a', shoes: '#5a4a8a', extras: { glasses: true }, body: { sw: 230, hw: 168 } });
  const kids = [
    makePuppet({ kind: 'kid', seed: 21, skin: '#c98e62', hair: '#1a1a1a', hairStyle: 'bob', shirt: '#e5483d', logo: 'star', pants: '#334', shoes: '#fff' }),
    makePuppet({ kind: 'kid', seed: 22, skin: '#f2c8a4', hair: '#c9733a', hairStyle: 'curly', shirt: '#4f86c6', logo: 'stripe', pants: '#556', shoes: '#e5b93c' }),
    makePuppet({ kind: 'kid', seed: 23, skin: '#8d5a3b', hair: '#1a1a1a', hairStyle: 'buzz', shirt: '#4fae6d', pants: '#2f5fa8', shoes: '#e5483d' }),
    makePuppet({ kind: 'kid', seed: 24, skin: '#f6d2b5', hair: '#e8c46a', hairStyle: 'ponytail', shirt: '#ff8ac0', pants: '#7b5cd6', shoes: '#fff' }),
  ];
  const kids82 = [
    makePuppet({ kind: 'kid', seed: 31, skin: '#f2c8a4', hair: '#8a5a32', hairStyle: 'big80s', shirt: '#d98a2b', logo: 'stripe', pants: '#6a4a2a', shoes: '#fff' }),
    makePuppet({ kind: 'kid', seed: 32, skin: '#c98e62', hair: '#2a1a12', hairStyle: 'curly', shirt: '#7a9a3a', pants: '#5a3a22', shoes: '#c9873a' }),
  ];
  const biscuit = makeDog2d({ fur: '#d9a066', seed: 4 }), robo = makeRobotDog({ seed: 41 });
  const BX = [...Array(11)].map((_, i) => makeDog2d({ fur: '#d9a066', seed: 50 + i }));

  // ---------------------------------------------------------------- Scribe: the worksheet, the app, the practice page
  const sheet = makeSheet(G, {
    title: 'MATH · HOMEWORK 12', note: '30 PROBLEMS  ·  HANDWRITTEN ONLY  ·  DUE TOMORROW', name: 'Leo', seed: 53, page: 'p. 1 / 5', ink: '#26346b',
    problems: [
      { q: '1)  346 × 27 =', a: '346 x 27 = 6920 + 2422 = 9342' },
      { q: '2)  1,248 ÷ 6 =', a: '1248 / 6 = 208' },
      { q: '3)  3/4 + 5/8 =', a: '6/8 + 5/8 = 11/8 = 1 3/8' },
      { q: '4)  2,005 − 1,738 =', a: '2005 - 1738 = 267' },
      { q: '5)  Round 7,482 to the nearest 100.', a: '7482 → 7500' },
      { q: '6)  24 pencils in a box. How many in 15 boxes?', a: '24 x 15 = 360 pencils' },
    ],
  });
  const scr = makeScreen(G, icon, sheet, { n: 30, name: 'Leo' });
  // the practice page (written once on a tablet so Scribe learns the hand)
  const prac = document.createElement('canvas'); prac.width = 600; prac.height = 800; const pg = prac.getContext('2d');
  const pracItems = layoutHand(G, 'abcdefghij\nklmnopqrs\ntuvwxyz\n0123456789\nThe quick fox', { x: 50, y: 150, u: 34, lineH: 3.4, seed: 9 });
  let pracKey = -1;
  function drawPractice(n) {
    n = Math.floor(n); if (n === pracKey) return; pracKey = n;
    pg.fillStyle = '#fffdf6'; pg.fillRect(0, 0, 600, 800);
    pg.fillStyle = '#9a1c25'; pg.font = '600 30px Inter, Arial'; pg.fillText('Practice sheet', 40, 60);
    pg.strokeStyle = 'rgba(120,150,200,.35)'; pg.lineWidth = 2; for (let y = 150; y < 800; y += 34 * 3.4) { pg.beginPath(); pg.moveTo(30, y); pg.lineTo(570, y); pg.stroke(); }
    for (let i = 0; i < Math.min(n, pracItems.length); i++) { const it = pracItems[i]; for (const [ox, oy] of [[0, 0], [0.8, 0], [0, 0.8]]) pg.drawImage(it.c, it.x + ox, it.y + oy, it.w, it.h); }
  }
  const sheetTotal = sheet.total;

  // ---------------------------------------------------------------- props
  const blueprint = (c, w, h) => { c.strokeStyle = '#3f6fb0'; c.lineWidth = 3; for (let x = -w / 2; x < w / 2; x += 26) { c.beginPath(); c.moveTo(x, -h / 2); c.lineTo(x, h / 2); c.stroke(); } for (let y = -h / 2; y < h / 2; y += 26) { c.beginPath(); c.moveTo(-w / 2, y); c.lineTo(w / 2, y); c.stroke(); } c.strokeStyle = '#1d3f80'; c.lineWidth = 5; c.strokeRect(-50, -40, 100, 70); c.beginPath(); c.arc(-25, 50, 18, 0, 7); c.arc(25, 50, 18, 0, 7); c.stroke(); };
  function junkPile(x, y, t) {   // forty failed inventions in a heap
    const wheel = (wx, wy, r) => { I.circle(wx, wy, r, { fill: '#3a3a3a', lw: 5 }); I.circle(wx, wy, r * 0.45, { fill: '#9aa3ad', lw: 4 }); };
    I.shape([[x - 420, y], [x - 330, y - 170], [x - 160, y - 260], [x + 60, y - 290], [x + 250, y - 220], [x + 400, y - 90], [x + 440, y]], { fill: '#8a8f96', shade: '#6f747b', lw: 5.5 });
    wheel(x - 250, y - 150, 60); wheel(x + 300, y - 90, 50);
    I.rect(x - 120, y - 330, 180, 130, { fill: '#5b8fd6', shade: '#3f6fb0', lw: 5, r: 12 }); I.rect(x - 100, y - 312, 120, 90, { fill: '#2b3a55', lw: 4, r: 6 });   // a busted TV
    I.line([[x - 60, y - 300], [x - 20, y - 250], [x - 40, y - 230]], { line: '#9fe2ff', lw: 4 });
    I.circle(x + 150, y - 260, 70, { fill: '#e8e2d8', lw: 5 }); for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4; I.shape([[x + 150, y - 260], [x + 150 + Math.cos(a) * 60, y - 260 + Math.sin(a) * 60], [x + 150 + Math.cos(a + 0.6) * 60, y - 260 + Math.sin(a + 0.6) * 60]], { fill: '#4fae6d', lw: 4, sharp: true, sub: false }); }   // a fan
    I.rect(x - 360, y - 120, 110, 80, { fill: '#c9d1d8', lw: 5, r: 10 }); I.shape([[x - 360, y - 100], [x - 450, y - 160], [x - 380, y - 70]], { fill: '#fff', lw: 4.5 });   // a toaster with a wing
    const sp = []; for (let k = 0; k < 24; k++) sp.push([x + 30 + k * 4, y - 300 - k * 5 + Math.sin(k * 1.6) * 14]); I.line(sp, { lw: 5, sub: false });   // a spring
    FX.puffs(I, x + 100, y - 320, 50, (t * 0.7) % 1.4, { life: 1.4, n: 3, seed: 7, color: '#c9c4bd', rise: 120 });
  }
  function controller(x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    I.line([[50, -40], [80, -140]], { lw: 5, sub: false }); I.circle(82, -146, 9, { fill: '#e5483d', lw: 4 });
    I.rect(-80, -50, 160, 90, { fill: '#7d8590', shade: '#5f6670', lw: 5, r: 22 }); I.circle(-40, -6, 16, { fill: '#2b2b2b', lw: 4 }); I.circle(40, -6, 16, { fill: '#2b2b2b', lw: 4 });
    ctx.restore();
  }
  function pencilDrone(x, y, s, t, tilt = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
    for (const k of [-1, 1]) { I.limb([[0, -40], [k * 150, -70]], 10, '#5f6670', { lw: 4 }); const sp = t * 40 + k; I.ellipse(k * 150, -84, 80 * Math.abs(Math.cos(sp)) + 14, 10, { fill: 'rgba(200,210,220,.7)', lw: 3.5 }); I.limb([[k * 150, -70], [k * 150, -84]], 8, '#2b2b2b', { lw: 3 }); }
    I.rect(-150, -42, 230, 54, { fill: '#ffc531', shade: '#d9a420', lw: 5, r: 4 }); I.line([[-150, -24], [80, -24]], { lw: 3, alpha: 0.4 }); I.line([[-150, -6], [80, -6]], { lw: 3, alpha: 0.4 });
    I.rect(-196, -42, 50, 54, { fill: '#ff8ac0', lw: 5, r: 10 }); I.rect(-154, -44, 16, 58, { fill: '#c9d1d8', lw: 4, r: 2 });
    I.shape([[80, -42], [150, -15], [80, 12]], { fill: '#f2c49a', lw: 5, sharp: true, sub: false }); I.shape([[128, -23], [150, -15], [128, -7]], { fill: '#2b2b2b', lw: 3, sharp: true, sub: false });
    I.circle(-30, -15, 10, { fill: '#e5483d', line: null });
    ctx.restore();
    return [x + Math.cos(tilt) * 150 * s, y + Math.sin(tilt) * 150 * s - 15 * s];   // the pencil tip
  }
  function cloneMachine(x, y, t, glow = 0) {
    const booth = (bx, label) => {
      I.rect(bx - 150, y - 620, 300, 620, { fill: '#c9d1d8', shade: '#9aa3ad', lw: 6, r: 30 });
      I.rect(bx - 110, y - 560, 220, 520, { fill: glow > 0 ? `rgba(160,240,255,${0.5 + 0.5 * glow})` : '#3a4a5c', lw: 5, r: 22 });
      I.rect(bx - 120, y - 680, 240, 70, { fill: '#e5483d', lw: 5, r: 14 }); I.text(label, bx, y - 645, { size: 46, fill: '#fff', line: null, shadow: false });
    };
    I.limb([[x - 230, y - 520], [x, y - 700], [x + 230, y - 520]], 54, '#9fd8e8', { lw: 6 });
    for (let k = 0; k < 5; k++) { const u = (k + 0.5) / 5, px = x - 230 + 460 * u, py = y - 520 - Math.sin(u * PI) * 180; I.circle(px, py, 12, { fill: (Math.floor(t * 8) + k) % 2 ? '#ffe14d' : '#ff8a1f', lw: 3.5 }); }
    booth(x - 330, 'IN'); booth(x + 330, 'OUT');
    I.text('CLONE-O-MATIC', x, y - 830, { size: 76, fill: '#ffc531' });
    // the console + lever between the booths
    I.rect(x - 130, y - 260, 260, 260, { fill: '#5b8fd6', shade: '#3f6fb0', lw: 6, r: 16 });
    for (let k = 0; k < 3; k++) I.circle(x - 70 + k * 70, y - 190, 24, { fill: '#fff', lw: 4.5 });
    for (let k = 0; k < 3; k++) { const a = t * (3 + k) + k; I.line([[x - 70 + k * 70, y - 190], [x - 70 + k * 70 + Math.cos(a) * 18, y - 190 + Math.sin(a) * 18]], { lw: 4, sub: false }); }
  }
  function lever(x, y, a) { I.limb([[x, y], [x + Math.sin(a) * 150, y - Math.cos(a) * 150]], 16, '#7d8590', { lw: 5 }); I.circle(x + Math.sin(a) * 150, y - Math.cos(a) * 150, 30, { fill: '#e5483d', lw: 5 }); }
  function timeBox(x, y, t, sh = 0, front = true) {   // a cardboard time machine: steering wheel, a taped-on clock, a year dial, lights
    const jx = sh * Math.sin(t * 60) * 10, jy = sh * Math.cos(t * 53) * 6;
    ctx.save(); ctx.translate(x + jx, y + jy);
    if (!front) { I.rect(-260, -330, 520, 330, { fill: '#b8864e', lw: 6, r: 6, sharp: true }); ctx.restore(); return; }
    I.rect(-260, -330, 520, 330, { fill: '#c99a5e', shade: '#a87b44', lw: 6, r: 6, sharp: true });
    I.line([[-260, -280], [260, -280]], { lw: 3.5, alpha: 0.5 });
    I.text('TIME MACHINE', 0, -220, { size: 50, font: 'Fredoka', weight: 700, fill: '#5a3b22', line: null, rot: -0.04 });
    SET.clock2d(I, -150, -110, 62, { h: (t * 30) % 12, m: (t * 360) % 60 });
    I.rect(-30, -150, 230, 90, { fill: '#2b2b2b', lw: 5, r: 8 }); ctx.font = '700 64px Fredoka'; ctx.fillStyle = '#7cf05f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const yr = t < T.back ? 2026 : Math.round(lerp(2026, 1982, u01(t, T.back, T.nineteen - 0.15))); ctx.fillText(String(yr), 85, -102);
    for (let k = 0; k < 7; k++) I.circle(-230 + k * 76, -330, 13, { fill: (Math.floor(t * 10) + k) % 3 ? '#ffe14d' : '#e5483d', lw: 3.5 });
    I.limb([[200, -330], [240, -470]], 8, '#7d8590', { lw: 4 }); I.circle(242, -478, 14, { fill: '#7cf05f', lw: 4 });
    ctx.restore();
  }
  function wheel(x, y, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); I.circle(0, 0, 70, { fill: null, line: INK, lw: 22 }); I.circle(0, 0, 70, { fill: null, line: '#3a3a3a', lw: 12 }); I.limb([[-66, 0], [66, 0]], 12, '#3a3a3a', { lw: 4 }); I.circle(0, 0, 20, { fill: '#e5483d', lw: 4 }); ctx.restore(); }
  function roboArm(x, y, t, k, shake = 0) {   // invention 41: a desk-mounted arm holding a pencil; returns the pencil tip
    const jx = shake * Math.sin(t * 70) * 14, jy = shake * Math.cos(t * 61) * 10;
    const base = [x, y], j1 = [x + 30 + jx, y - 230 + jy], wob = Math.sin(t * 26) * 30 * k;
    const tip = [x + 230 + wob + jx, y - 70 + Math.cos(t * 31) * 22 * k + jy], j2 = [(j1[0] + tip[0]) / 2 + 60, (j1[1] + tip[1]) / 2 - 90];
    I.rect(x - 90, y - 50, 180, 50, { fill: '#5f6670', lw: 5.5, r: 10 });
    I.limb([base, j1], 52, '#ff8a1f', { lw: 6 }); I.limb([j1, j2], 46, '#ff8a1f', { lw: 6 }); I.limb([j2, [tip[0] - 20, tip[1] - 80]], 40, '#ff8a1f', { lw: 6 });
    for (const j of [base, j1, j2]) I.circle(j[0], j[1], 30, { fill: '#7d8590', lw: 5 });
    I.circle(j1[0], j1[1], 10, { fill: '#e5483d', line: null });
    ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(-0.5); I.rect(-16, -170, 32, 150, { fill: '#ffc531', lw: 4.5, r: 3 }); I.shape([[-16, -20], [16, -20], [0, 12]], { fill: '#f2c49a', lw: 4, sharp: true, sub: false }); ctx.restore();
    I.rect(tip[0] - 50, tip[1] - 120, 70, 60, { fill: '#7d8590', lw: 5, r: 12 });
    return tip;
  }
  function newspaper(x, y, rot, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); I.rect(-150, -100, 300, 200, { fill: '#f4f1e6', lw: 5, r: 2, sharp: true }); I.text('NEWS', -60, -58, { size: 44, font: 'Fredoka', weight: 700, fill: INK, line: null }); for (let k = 0; k < 4; k++) I.line([[-130, -10 + k * 26], [k % 2 ? 40 : 120, -10 + k * 26]], { lw: 4, alpha: 0.5 }); I.rect(60, -80, 70, 60, { fill: '#cfd8dc', lw: 3.5, r: 2, sharp: true }); ctx.restore(); }
  function paperStack(x, y, n, w = 260) { for (let k = 0; k < n; k++) { const r = (h1(k * 3.7) - 0.5) * 0.12; ctx.save(); ctx.translate(x + (h1(k) - 0.5) * 16, y - k * 9); ctx.rotate(r); I.rect(-w / 2, -8, w, 16, { fill: k % 2 ? '#fffdf6' : '#f1ece0', lw: 3.5, r: 1, sharp: true, wob: 0.8 }); ctx.restore(); } }
  function magnifier(x, y, r, rot, inner) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    I.limb([[r * 0.72, r * 0.72], [r * 1.9, r * 1.9]], r * 0.28, '#7a4b2a', { lw: 6 });
    I.circle(0, 0, r, { fill: 'rgba(225,245,255,1)', lw: 7, inner: () => { ctx.rotate(-rot); if (inner) inner(); } });
    I.circle(0, 0, r, { fill: null, line: '#c9a030', lw: 12 }); I.circle(0, 0, r + 9, { fill: null, lw: 5 });
    I.arc(-r * 0.3, -r * 0.3, r * 0.5, r * 0.5, PI * 1.05, PI * 1.45, { line: '#fff', lw: 9 });
    ctx.restore();
  }
  function pen2d(x, y, s = 1, rot = -0.55) {   // a navy ballpoint whose tip is at (x, y)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    I.shape([[0, 0], [-14, -40], [14, -40]], { fill: '#c9d1d8', lw: 4.5, sharp: true, sub: false });
    I.rect(-18, -300, 36, 262, { fill: '#26346b', shade: '#1a2550', lw: 5, r: 10 }); I.rect(-20, -150, 40, 46, { fill: '#9aa3ad', lw: 4, r: 6 });
    I.limb([[22, -280], [22, -190]], 8, '#c9d1d8', { lw: 3.5 });
    ctx.restore();
  }
  function trifold(x, y) {   // the science-fair board for invention 42
    const panel = (px, w, skew) => I.shape([[px - w / 2, y - 560 - skew], [px + w / 2, y - 560 + skew], [px + w / 2, y - 120 + skew * 0.4], [px - w / 2, y - 120 - skew * 0.4]], { fill: '#fffdf6', shade: '#ede6d6', lw: 6 });
    panel(x - 330, 230, -26); panel(x + 330, 230, 26); panel(x, 430, 0);
    I.text('INVENTION', x, y - 500, { size: 66, fill: '#e5483d' }); I.text('#42', x, y - 420, { size: 88, fill: '#ffc531' });
    ctx.drawImage(icon, x - 80, y - 360, 160, 160);
    ctx.font = '400 70px Georgia, serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Scribe', x, y - 140);
    for (const [px, txt] of [[x - 330, 'IT WORKS'], [x + 330, 'BY LEO']]) I.text(txt, px, y - 470, { size: 40, font: 'Fredoka', weight: 700, fill: INK, line: null, maxW: 190 });
    for (const px of [x - 330, x + 330]) for (let k = 0; k < 4; k++) I.line([[px - 80, y - 400 + k * 50], [px + 70, y - 400 + k * 50]], { lw: 4, alpha: 0.35 });
  }
  function trophy(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); I.shape([[-80, -260], [80, -260], [60, -140], [-60, -140]], { fill: '#f2c94c', shade: '#c9a030', lw: 5.5 }); for (const k of [-1, 1]) I.arc(k * 80, -220, 40, 40, k > 0 ? -PI / 2 : PI / 2, k > 0 ? PI / 2 : PI * 1.5, { lw: 14, line: INK }); I.rect(-18, -140, 36, 70, { fill: '#f2c94c', lw: 4.5, r: 2 }); I.rect(-70, -70, 140, 70, { fill: '#7a4b2a', lw: 5, r: 6 }); I.text('#1', 0, -200, { size: 50, fill: '#fff' }); ctx.restore(); }
  function goldStar(x, y, r, k) { if (k <= 0) return; I.shape(starPts(x, y, r * k, r * k * 0.48, 5), { fill: '#ffd23f', shade: '#e0a820', lw: 6, sharp: false, sub: false }); }

  // ---------------------------------------------------------------- sets
  function chalkMath(c, x, y, w, h) {   // chalk sums on the board (no words: the counter board sits over it)
    c.strokeStyle = 'rgba(244,241,230,.85)'; c.lineWidth = 6; c.lineCap = 'round';
    for (let r = 0; r < 4; r++) { const yy = y - h / 2 + 70 + r * 80; for (let k = 0; k < 5; k++) { const xx = x - w / 2 + 60 + k * 130 + (r % 2) * 40; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 25, yy - 30, xx + 50, yy); c.quadraticCurveTo(xx + 75, yy + 30, xx + 100, yy - 10); c.stroke(); } }
    c.font = '700 64px Fredoka'; c.fillStyle = 'rgba(255,225,77,.95)'; c.textAlign = 'center'; c.fillText('x² + 7 = ?', x + 140, y + h / 2 - 40);
  }
  function nightOver(cx, cy, r, a = 0.42) {   // darken the frame except a pool of lamp light
    const m = ctx.getTransform(); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const [sx, sy] = S.toScreen(cx, cy), rr = r * S.cam.z, g = ctx.createRadialGradient(sx, sy, rr * 0.2, sx, sy, rr);
    g.addColorStop(0, 'rgba(18,22,52,0)'); g.addColorStop(1, `rgba(18,22,52,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); ctx.setTransform(m);
  }
  function garage(t, o = {}) {
    SET.room(I, { wall: '#cfd8dc', pattern: 'cinder', floor: '#9aa0a6', kind: 'concrete', base: -240, x0: -1700, x1: 1700, top: -2300 });
    SET.garageDoor(I, -980, -240, 640, 780);
    SET.pegboard(I, 420, -840, 560, 330);
    SET.sign(I, 420, -1120, "LEO'S LAB", { size: 72, fill: '#ffc531', rot: -0.05 });
    SET.poster(I, 860, -830, 190, 250, { text: 'KEEP', sub: 'OUT!!', size: 50 });
    SET.poster(I, -330, -1060, 260, 200, { color: '#cfe3ff', draw: blueprint, rot: 0.04 });
    SET.shelf(I, -330, -760, 380, { items: ['cans', 'robot'] });
    if (o.bench !== false) SET.workbench(I, 420, -240, 640);
    SET.box(I, 1000, -240, 230, 170, { label: 'JUNK' }); SET.box(I, -600, -240, 180, 140, { label: 'PARTS', rot: 0.05 });
    SET.tool(I, 'tape', 300, -630, 0.8); SET.tool(I, 'hammer', 560, -620, 0.7, 1.4);
    SET.bulb(I, 60, -2300, 900, { t, on: true, glow: 520 });
  }
  function living(t) {
    SET.room(I, { wall: '#f6d8a8', pattern: 'stripes', floor: '#b97a4a', kind: 'boards', base: -240, x0: -1500, x1: 1500, top: -2200 });
    SET.window2d(I, 40, -900, 300, 340, { sky: 'day', curtains: '#e5483d' });
    SET.frame2d(I, -380, -930, 160, 200, { art: 'family' }); SET.frame2d(I, 440, -940, 180, 140, { art: 'mountain' });
    SET.couch(I, -20, -240, 640, { color: '#4f86c6', pillow: '#ffc531' });
    SET.lamp(I, 470, -240, 1, { on: true }); SET.plant(I, -480, -240, 0.95);
    SET.rug(I, 20, 150, 520, 100, { color: '#c94f4f' });
  }
  function kitchen(t) {
    SET.room(I, { wall: '#d4ecdf', pattern: 'dots', floor: '#e9d3a8', kind: 'tile', base: -240, x0: -1500, x1: 1500, top: -2200, wainscot: '#fbfbf6', wainscotH: 200 });
    SET.fridge2d(I, -640, -240, 300, 660, { drawing: true });
    SET.window2d(I, 360, -940, 300, 260, { sky: 'day', curtains: '#ffc531' });
    const top = SET.counter2d(I, 360, -240, 760); SET.kettle(I, 180, top, 0.9); SET.mug(I, 560, top, 1, { color: '#e5483d' }); SET.plant(I, 650, top, 0.55, { pot: '#4f86c6' });
    SET.clock2d(I, -200, -1100, 66, { h: 8, m: 5 });
  }
  function classroom(t, o = {}) {
    const y82 = !!o.y82;
    SET.room(I, y82
      ? { wall: '#d9a066', pattern: 'panel', floor: '#8a6a4a', kind: 'boards', base: -260, x0: -1500, x1: 1500, top: -2200 }
      : { wall: '#f3e2b3', floor: '#7fa7b9', kind: 'tile', base: -260, x0: -1500, x1: 1500, top: -2200, wainscot: '#e3c27f', wainscotH: 240 });
    SET.chalkboard(I, -120, -930, 760, 380, y82
      ? { board: '#3a4a3a', lines: [], draw: chalkMath }
      : { lines: o.lines ?? [], draw: chalkMath });
    if (y82) { SET.poster(I, 520, -930, 220, 280, { color: '#fff4c8', text: '1982', size: 66, textColor: '#e06cc0', sub: 'NOVEMBER', subSize: 30 }); SET.bunting(I, -560, 560, -1270, { colors: ['#d98a2b', '#c9733a', '#7a9a3a', '#e06cc0'] }); }
    else { SET.clock2d(I, 520, -1110, 70, { h: o.h ?? 9, m: o.m ?? 0 }); SET.bunting(I, -560, 420, -1250, { letters: 'ABCDEFGHI' }); SET.poster(I, 540, -880, 200, 250, { text: 'MATH', size: 48, sub: '= FUN?', subSize: 34, color: '#e8f4ff', rot: 0.03 }); }
    SET.teacherDesk(I, 600, -260, 460, { color: y82 ? '#6a4a2a' : '#8a5a32' });
  }
  function bedroom(t) {
    SET.room(I, { wall: '#6a78b8', pattern: 'dots', floor: '#7a5c8a', kind: 'carpet', base: -240, x0: -1500, x1: 1500, top: -2200 });
    SET.window2d(I, 500, -980, 280, 300, { sky: 'night', curtains: '#ffc531' });
    SET.frame2d(I, -60, -1000, 200, 250, { art: 'rocket', bg: '#1d2550' });
    SET.bunting(I, -700, 300, -1260, { colors: ['#ffe14d', '#ffffff', '#ffe14d'], sag: 70, n: 9 });
    SET.shelf(I, -560, -820, 380, { items: ['trophy', 'robot', 'globe'] });
    SET.bed(I, -620, -240, 640, { blanket: '#e5483d', bump: false });
    const top = SET.desk(I, 260, -240, 600, { color: '#b07a46' });
    return top;
  }
  function deskLamp(x, y, on = true) { if (on) { const g = ctx.createRadialGradient(x + 40, y - 200, 20, x + 40, y - 200, 520); g.addColorStop(0, 'rgba(255,236,170,.5)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(x - 500, y - 720, 1100, 1000); } I.ellipse(x, y - 8, 60, 14, { fill: '#2b2b2b', lw: 4.5 }); I.limb([[x, y - 10], [x + 40, y - 170], [x + 100, y - 230]], 12, '#2b2b2b', { lw: 4 }); I.shape([[x + 60, y - 280], [x + 170, y - 240], [x + 140, y - 180], [x + 50, y - 210]], { fill: '#e5483d', lw: 5 }); }

  // ---------------------------------------------------------------- shot list (hard cuts on words)
  const cam = (x, y, z, x1, y1, z1, a, b) => (x1 == null ? { x, y, z } : { x: [[a, x], [b, x1]], y: [[a, y], [b, y1]], z: [[a, z], [b, z1]] });
  const SH = [
    { t0: 0, id: 'hook', cam: cam(90, -170, 1.12, 90, -200, 1.22, 0, T.this) },
    { t0: T.this, id: 'intro', cam: cam(-80, -230, 1.5, -80, -250, 1.62, T.this, T.day1) },
    { t0: T.day1, id: 'dog1', cam: cam(-60, -250, 1.06, -40, -250, 1.12, T.day1, T.it1) },
    { t0: T.it1, id: 'dog2', cam: cam(160, -280, 1.0, 160, -290, 1.08, T.it1, T.day9) },
    { t0: T.day9, id: 'drone1', cam: cam(-170, -261, 1.02, -150, -265, 1.08, T.day9, T.it2) },
    { t0: T.it2, id: 'drone2', cam: cam(-20, -320, 1.75, -20, -330, 1.88, T.it2, T.day23) },
    { t0: T.day23, id: 'clone1', cam: cam(0, -500, 0.86, 0, -480, 0.92, T.day23, T.so1) },
    { t0: T.so1, id: 'clone2', cam: cam(-60, -400, 1.05, -100, -400, 1.1, T.so1, T.it3) },
    { t0: T.it3, id: 'clone3', cam: cam(80, -420, 1.0, 60, -470, 0.82, T.it3, T.day40) },
    { t0: T.day40, id: 'time1', cam: cam(0, -360, 1.12, 0, -365, 1.3, T.day40, T.nineteen) },
    { t0: T.nineteen, id: 'time2', cam: cam(0, -205, 1.12, 0, -205, 1.2, T.nineteen, T.then) },
    { t0: T.then, id: 'teach1', cam: cam(-60, -150, 0.98, -40, -155, 1.06, T.then, T.and1) },
    { t0: T.and1, id: 'teach2', cam: cam(-170, -350, 1.9, -170, -350, 2.02, T.and1, T.invention) },
    { t0: T.invention, id: 'boom1', cam: cam(200, -200, 1.0, 220, -205, 1.06, T.invention, T.fake) },
    { t0: T.fake, id: 'boom2', cam: cam(400, -560, 1.45, 400, -560, 1.58, T.fake, T.four) },
    { t0: T.four, id: 'boom3', cam: cam(200, -200, 1.05, 200, -200, 1.05, T.four, T.so2) },
    { t0: T.so2, id: 'scribe1', cam: cam(130, -200, 1.1, 130, -205, 1.18, T.so2, T.he) },
    { t0: T.he, id: 'scribe2', cam: cam(230, -560, 1.35, 230, -560, 1.45, T.he, T.one) },
    { t0: T.one, id: 'photo1', cam: cam(0, 0, 1, 0, 0, 1.06, T.one, T.scribe2) },
    { t0: T.scribe2, id: 'screen', cam: cam(0, 0, 1, 0, 0, 1.05, T.scribe2, T.his) },
    { t0: T.his, id: 'paper', cam: cam(0, 0, 1, 0, 0, 1.05, T.his, T.he2) },
    { t0: T.he2, id: 'print', cam: cam(100, -200, 1.0, 100, -205, 1.06, T.he2, T.next) },
    { t0: T.next, id: 'match1', cam: cam(0, 0, 1, 0, 0, 1.06, T.next, T.perfect) },
    { t0: T.perfect, id: 'match2', cam: cam(0, 0, 1.06, 0, 0, 1.1, T.perfect, T.so3) },
    { t0: T.so3, id: 'pay1', cam: cam(-40, -150, 0.98, -40, -155, 1.04, T.so3, T.first) },
    { t0: T.first, id: 'pay2', cam: cam(0, -120, 0.9, 0, -125, 0.86, T.first, T.and2) },
    { t0: T.and2, id: 'pay3', cam: cam(40, -170, 1.0, 40, -180, 1.08, T.and2, ENDCARD) },
  ];
  window.EDSTUDIO_CUTS = SH.map((s) => s.t0).slice(1);
  const HITS = [[T.ate + 0.05, 26, 0.4], [T.drops + 0.12, 30, 0.45], [T.cloned, 22, 0.4], [T.nineteen, 30, 0.5], [T.more + 0.05, 30, 0.45], [T.seconds + 0.08, 46, 0.6], [T.perfect + 0.05, 18, 0.35], [T.worked, 14, 0.3]];

  // ---------------------------------------------------------------- per-shot drawing
  const talkMax = (t) => talkAt(t, story.words);
  const idle = (t, k = 1) => ({ bob: Math.abs(Math.sin(t * 2.2)) * 6 * k });
  const put = (P, pose, name) => { P.draw(I, pose); S.face(P.headAt(pose), name); };
  const counter = (t) => {
    if (t < T.day1 || t >= ENDCARD) return null;
    const inv = t < T.day9 ? 1 : t < T.day23 ? 9 : t < T.day40 ? 23 : t < T.f41 ? 40 : t < T.f42 ? 41 : 42;
    const changes = [T.day1, T.day9, T.day23, T.day40, T.f41, T.f42, T.worked];
    let last = T.day1; for (const c of changes) if (t >= c) last = c;
    return { inv, work: t >= T.worked ? 1 : 0, pop: 1 + 0.18 * Math.exp(-(t - last) * 9) * Math.cos((t - last) * 20) };
  };
  const dayLabel = (t) => { for (const [a, b, txt] of [[T.day1, T.day1 + 1.2, 'DAY 1'], [T.day9, T.day9 + 1.2, 'DAY 9'], [T.day23, T.day23 + 1.2, 'DAY 23'], [T.day40, T.day40 + 1.2, 'DAY 40'], [T.nineteen + 0.1, T.then, '1982'], [T.next, T.checks + 0.4, 'NEXT MORNING']]) if (t >= a && t < b) return { txt, k: pop(t, a), a: 1 - u01(t, b - 0.15, b) }; return null; };

  function draw(id, t, tt) {   // tt = character time on twos
    const lt = (a) => t - a;
    if (id === 'hook') {
      garage(t); junkPile(-60, -150, t);
      const swing = Math.sin(tt * 7) * 0.25;
      put(leo, { x: -160, y: 70, s: 1.1, t: tt, eyes: tt > T.every ? 'happy' : 'open', mouth: 'grin', arms: { L: { a: 2.6 + swing, e: 0.3, hand: 'fist' }, R: ARM.hips }, ...idle(tt) }, 'leo');
      SET.tool(I, 'wrench', ...leo.hand({ x: -160, y: 70, s: 1.1, arms: { L: { a: 2.6 + swing, e: 0.3 } } }, 'L'), 1.0, 0.3 + swing);
      put(max, { x: 330, y: 20, s: 1.0, t: tt, turn: -0.25, look: [-0.2, 0], eyes: 'half', mouth: 'open', open: talkMax(t), arms: { L: ARM.cross, R: ARM.cross } }, 'max');
      SET.nameTag(I, 'ME', 330, -790, { size: 64, sub: 'BIG BROTHER', pop: pop(t, 0.3) });
    }
    if (id === 'intro') {
      garage(t); junkPile(-60, -150, t);
      const wave = Math.sin(tt * 12) * 0.35;
      put(leo, { x: -160, y: 70, s: 1.1, t: tt, eyes: 'open', mouth: 'grin', open: 0.3, turn: 0.15, arms: { L: { a: 2.3 + wave, e: 0.6, hand: 'open' }, R: ARM.hips }, ...idle(tt) }, 'leo');
      SET.nameTag(I, 'LEO, 9', 150, -720, { size: 74, sub: 'INVENTOR', pop: pop(t, T.leo - 0.05) });
    }
    if (id === 'dog1') {
      living(t);
      const dp = { x: 140, y: SET && dad.seatY(-348), s: 1, t: tt, sit: true, eyes: 'half', mouth: 'flat', arms: { L: ARM.hold, R: ARM.hold } };
      put(dad, dp, 'dad'); newspaper(140, -420, 0.02, 0.8);
      // the homework on the floor; the robot dog trots in from Leo, sniffs it, ignores it
      const run = u01(t, T.robot - 0.3, T.it1);
      paperStack(-60, 170, 2, 200);
      robo.draw(I, { x: lerp(-480, 40, Math.min(1, run * 1.3)), y: 230, s: 1.0, t, run: run < 0.75 ? t * 2.2 : null, chomp: t > T.eats ? 0.5 + 0.5 * Math.sin(t * 22) : 0.1 });
      put(leo, { x: -380, y: 40, s: 1.05, t: tt, turn: 0.4, eyes: 'happy', mouth: 'grin', arms: { L: ARM.wave, R: ARM.out } }, 'leo');
      SET.nameTag(I, 'HOMEWORK EATER', -300, -660, { size: 52, sub: 'INVENTION #1', pop: pop(t, T.robot) });
    }
    if (id === 'dog2') {
      living(t);
      const k = u01(t, T.ate, T.ate + 0.25), hop = Math.abs(Math.sin((t - T.ate) * 9)) * 60 * k;
      const dp = { x: 120, y: 120, s: 1, t: tt, eyes: t > T.ate ? 'wide' : 'half', brows: t > T.ate ? 'up' : 'neutral', mouth: t > T.ate ? 'shout' : 'flat', open: 0.6, arms: { L: t > T.ate ? ARM.up : ARM.hold, R: t > T.ate ? ARM.out : ARM.hold }, legs: { R: { a: 1.15 * k + 0.05, lift: 0.2 * k, k: 0.3 * k } }, bob: hop + (t < T.ate ? 0 : 20), lean: -0.12 * k };
      put(dad, dp, 'dad');
      const [fx, fy] = dad.foot(dp, 'R');
      if (t < T.ate) robo.draw(I, { x: fx + 220 - 150 * u01(t, T.it1, T.ate), y: 200, s: 0.8, t, flip: -1, chomp: 0.6 + 0.4 * Math.sin(t * 25) });
      else { ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.sin((t - T.ate) * 13) * 0.3 + 0.35); robo.draw(I, { x: -60, y: 150, s: 0.72, t, flip: -1, chomp: 0.15, shadow: false }); ctx.restore(); }
      if (t > T.ate) newspaper(-260 - (t - T.ate) * 260, -760 - (t - T.ate) * 700 + (t - T.ate) ** 2 * 900, (t - T.ate) * 9, 0.75);
      FX.burst(I, fx + 40, fy - 30, 110, t - T.ate);
      if (t > T.ate) I.text('CHOMP!', fx - 40, fy - 300, { size: 96 * pop(t, T.ate), fill: '#ffe14d', rot: -0.15 });
      if (t > T.wearing) FX.sweat(I, 300, -800, 1, t);
    }
    if (id === 'drone1' || id === 'drone2') {
      kitchen(t);
      const stache = (c) => { const rx = mom.B.rx, ry = mom.B.ry, w = rx * 0.28, h = ry * 0.115; return { x0: c[0] - w / 2, y0: c[1] + ry * 0.275, w, h }; };   // ≈ the nose's width, right under it
      const mp = { x: -40, y: mom.seatY(-90), s: 1, t: tt, sit: true, turn: id === 'drone2' ? 0 : 0.2, eyes: t > T.mustache ? 'angry' : t > T.drew ? 'wide' : 'half', brows: t > T.mustache ? 'angry' : 'neutral', mouth: t > T.mom ? 'teeth' : t > T.drew ? 'o' : 'smile', arms: { L: ARM.hold, R: ARM.hold },
        face: (I2, F) => {   // the mustache the drone draws: a small square toothbrush mustache under her nose, pencil-dense
          const g = u01(t, T.drew, T.mom - 0.05); if (g <= 0) return;
          const { c } = F, M = stache(c), pts = [];
          I2.ctx.fillStyle = '#3a3a3a'; I2.ctx.fillRect(M.x0 + 1.5, M.y0 + 1.5, Math.max(0, M.w * g - 3), M.h - 3);   // dense graphite block…
          for (let x = M.x0, k = 0; x <= M.x0 + M.w * g; x += 1.8, k++) pts.push([x, k % 2 ? M.y0 + M.h : M.y0]);   // …with hand-scribbled edges, left to right
          if (pts.length > 1) I2.line(pts, { lw: 3.5, line: '#2e2e2e', sub: false, wob: 0.5 });
        } };
      put(mom, mp, 'mom'); SET.mug(I, 130, -40, 0.9, { color: '#4f86c6' });
      // the table in front of Mom
      I.rect(-420, -60, 760, 44, { fill: '#e8b06a', shade: '#c98f4f', lw: 5.5, r: 10 }); for (const k of [-370, 290]) I.rect(k - 14, -16, 28, 200, { fill: '#c98f4f', lw: 4.5, r: 3 });
      ctx.save(); ctx.translate(-250, -70); ctx.rotate(-0.06); I.rect(-90, -10, 180, 18, { fill: '#fffdf6', lw: 3.5, r: 1, sharp: true }); ctx.restore();
      // the drone: flies over the worksheet, then veers to Mom's lip
      const lip = mom.headAt(mp); let dx, dy, tilt;
      if (t < T.it2) { const u = u01(t, T.pencil - 0.2, T.it2); dx = lerp(-700, -230, ob(u, 1.2)) + Math.sin(t * 9) * 20; dy = -330 + Math.sin(t * 6) * 30 - (t > T.does ? -60 * Math.abs(Math.sin(t * 14)) : 0); tilt = 0.08; }
      else {   // the pencil tip rides the mustache as it fills in; the drone is drawn flipped in x AND y (body below-right of the tip,
               // rotors under the pencil, clear of her eyes), so the world tip = centre − local tip; it backs off once the mustache is done
        const M = stache([lip.x, lip.y]), u = u01(t, T.it2, T.drew), g = u01(t, T.drew, T.mom - 0.05), away = ob(u01(t, T.mom - 0.05, T.mom + 0.3), 1.2);
        const DS = 0.5, DT = 0.5, tx = M.x0 + M.w * g, ty = M.y0 + M.h / 2 + (t > T.drew && g < 1 ? Math.sin(t * 46) * M.h * 0.45 : 0);
        dx = lerp(-230, tx + Math.cos(DT) * 150 * DS, ob(u, 1.1)) + away * 230; dy = lerp(-330, ty + (Math.sin(DT) * 150 * DS - 15 * DS), u) + away * 90; tilt = DT;
      }
      if (id === 'drone1') put(leo, { x: -500, y: 330, s: 1.0, t: tt, turn: 0.45, look: [0.8, -0.3], eyes: 'open', mouth: t > T.does ? 'grin' : 'smirk', arms: { L: ARM.hold, R: ARM.hold }, sweat: 0 }, 'leo');
      if (id === 'drone1') controller(...leo.hand({ x: -500, y: 330, s: 1, arms: { L: ARM.hold, R: ARM.hold } }, 'R'), 0.8);
      if (id === 'drone2') { ctx.save(); ctx.translate(dx, dy); ctx.scale(-1, -1); pencilDrone(0, 0, 0.5, t, tilt); ctx.restore(); } else pencilDrone(dx, dy, 0.8, t, tilt);
      if (id === 'drone2' && t > T.mom) FX.vein(I, lip.x + 90, lip.y - 110, 1.2);
      if (id === 'drone1') SET.nameTag(I, 'HOMEWORK DRONE', -230, -700, { size: 50, sub: 'INVENTION #9', pop: pop(t, Math.max(T.pencil, T.day9 + 1.2)) });
    }
    if (id === 'clone1' || id === 'clone2' || id === 'clone3') {
      garage(t, { bench: id !== 'clone1' });
      const glow = id === 'clone3' ? Math.max(0, 1 - (t - T.cloned) * 2) : 0;
      cloneMachine(0, -200, t, glow);
      const la = id === 'clone3' ? 0.9 : id === 'clone2' ? lerp(-0.6, 0.9, u01(t, T.it3 - 0.35, T.it3)) : -0.6;
      if (id !== 'clone3') {
        lever(160, -120, la);
        // Biscuit trots into the IN booth while Leo isn't looking
        const bu = u01(t, T.second, T.it3 - 0.1);
        if (id === 'clone2' && bu < 1) biscuit.draw(I, { x: lerp(-800, -330, bu), y: -150, s: 0.75, t, run: t * 2.4, eyes: 'happy', tongue: true });
        if (id === 'clone1') biscuit.draw(I, { x: -620, y: 120, s: 0.8, t, sit: true, eyes: 'happy', tongue: true, wag: 1 });
        const lp = id === 'clone1' ? { x: 260, y: 160, s: 1.05, t: tt, turn: -0.2, eyes: 'happy', mouth: 'grin', arms: { L: ARM.out, R: ARM.wave } }
          : { x: 260, y: 330, s: 1.15, t: tt, turn: 0.3, look: [0.6, -0.3], eyes: 'open', mouth: 'grin', arms: { L: ARM.point, R: ARM.hold } };
        put(leo, lp, 'leo');
      } else {
        lever(160, -120, 0.9);
        const n = Math.min(11, Math.floor((t - T.cloned - 0.15) / 0.09) + 1);
        // Leo buried under the dog pile (only his head + an arm stick out)
        put(leo, { x: 120, y: 260, s: 1.05, t: tt, eyes: t > T.eleven ? 'spiral' : 'wide', mouth: 'wavy', arms: { L: ARM.up, R: ARM.out }, bob: -60 }, 'leo');
        for (let i = 0; i < n; i++) {
          const age = t - (T.cloned + 0.15 + i * 0.09), u = clamp(age / 0.45), x0 = 330, y0 = -320;
          const tx = [-260, -40, 200, 420, -420, 80, 300, -180, 560, -560, 140][i], ty = [80, 120, 60, 140, 200, 280, 260, 300, 240, 300, 360][i];
          const x = lerp(x0, tx, u), y = lerp(y0, ty, u) - Math.sin(u * PI) * 260;
          BX[i].draw(I, { x, y, s: 0.72, t: t + i, flip: tx < x0 ? -1 : 1, run: u < 1 ? t * 3 : null, eyes: i % 3 ? 'happy' : 'open', tongue: true, wag: 1, shadow: u >= 1 });
        }
        if (t > T.eleven) I.text('×11', 380, -900, { size: 150 * pop(t, T.eleven), fill: '#ffe14d', rot: -0.1 });
      }
    }
    if (id === 'time1') {
      garage(t);
      const shake = u01(t, T.before, T.nineteen);
      timeBox(0, -40, t, 0, false);
      put(leo, { x: 0, y: -90 - shake * 10 * Math.sin(t * 50), s: 1.05, t: tt, eyes: t > T.homework0 && t > T.back + 0.6 ? 'wide' : 'happy', mouth: t > T.back + 0.6 ? 'shout' : 'grin', arms: { L: { a: 0.9, e: -1.3, f: 0.8 }, R: { a: 0.9, e: -1.3, f: 0.8 } } }, 'leo');
      wheel(0, -350, Math.sin(t * 5) * 0.6 + shake * t * 12);
      timeBox(0, -40, t, shake);
      if (shake > 0.2) { FX.radial(I, 0, -500, 380, 1600, { alpha: 0.35 * shake, n: 46 }); FX.puffs(I, -250, -60, 70, (t * 1.5) % 1.1, { life: 1.1, seed: 5 }); FX.puffs(I, 250, -60, 70, (t * 1.5 + 0.5) % 1.1, { life: 1.1, seed: 6 }); }
      SET.nameTag(I, 'INVENTION #40', 0, -760, { size: 56, pop: pop(t, Math.max(T.tmach, T.day40 + 1.2)) });
    }
    if (id === 'time2') {
      classroom(t, { y82: true });
      kids82[0].draw(I, { x: -560, y: kids82[0].seatY(-150, 0.85), s: 0.85, t: tt, sit: true, eyes: 'half', mouth: 'flat' }); SET.schoolDesk(I, -560, 30, 0.85, { color: '#c9873a', paper: true });
      kids82[1].draw(I, { x: 560, y: kids82[1].seatY(-150, 0.85), s: 0.85, t: tt, sit: true, eyes: 'sad', brows: 'sad', mouth: 'frown' }); SET.schoolDesk(I, 560, 30, 0.85, { color: '#c9873a', paper: true });
      // the box lands; the 1982 teacher drops a mountain of homework on it
      const land = u01(t, T.nineteen, T.nineteen + 0.25), by = lerp(-900, 140, land * land);
      put(leo, { x: 0, y: by - 50, s: 1.05, t: tt, eyes: t > T.more ? 'x' : 'wide', mouth: t > T.more ? 'shout' : 'o', open: 1, arms: { L: t > T.more ? ARM.up : ARM.out, R: t > T.more ? ARM.up : ARM.out }, puff: t > T.more ? 0.6 : 0 }, 'leo');
      timeBox(0, by, t);
      const drop = u01(t, T.more - 0.25, T.more), sy = lerp(-1300, -330, drop * drop);
      put(teach82, { x: -330, y: 60, s: 1.0, t: tt, turn: 0.4, eyes: 'happy', mouth: 'grin', arms: { L: ARM.down, R: ARM.out } }, 'teacher82');
      if (t > T.more - 0.25) paperStack(300, by - 330 + (sy + 330) * (t < T.more ? 1 : 0), 34, 220);
      FX.puffs(I, 0, by, 170, t - T.nineteen - 0.25, { n: 8, seed: 9, life: 0.8, color: '#efe6d6' });
      FX.burst(I, 300, by - 650, 130, t - T.more);
    }
    if (id === 'teach1' || id === 'teach2') {
      classroom(t);
      kids[0].draw(I, { x: -620, y: kids[0].seatY(-150, 0.85), s: 0.85, t: tt, sit: true, eyes: 'wide', mouth: 'o', look: [0.6, 0] }); SET.schoolDesk(I, -620, 30, 0.85);
      if (id === 'teach1') {
        const gp = { x: -330, y: 70, s: 1.02, t: tt, turn: 0.35, eyes: 'angry', brows: 'angry', mouth: 'smirk', arms: { L: ARM.hips, R: t < T.drops ? ARM.hold : ARM.point } };
        put(grimm, gp, 'grimm');
        const lp = { x: 90, y: leo.seatY(-30), s: 1.0, t: tt, sit: true, turn: -0.4, look: [-0.6, -0.3], eyes: t > T.drops ? 'wide' : 'open', brows: t > T.drops ? 'sad' : 'neutral', mouth: t > T.drops ? 'wavy' : 'smile', sweat: t > T.handwritten ? 1 : 0, bob: t > T.drops ? Math.max(0, 1 - (t - T.drops) * 3) * 50 : 0 };
        put(leo, lp, 'leo');
        SET.schoolDesk(I, 160, 210, 1.05);
        const d = u01(t, T.drops - 0.2, T.drops + 0.05); paperStack(340, lerp(-900, -60, d * d), 16, 230);
        FX.puffs(I, 340, -50, 110, t - T.drops - 0.05, { n: 6, seed: 4 });
        if (t > T.drops) I.text('30', 360, -330, { size: 110 * pop(t, T.drops + 0.05), fill: '#e5483d', rot: 0.08 });
        SET.nameTag(I, 'MRS. GRIMM', -300, -770, { size: 60, sub: 'MATH', pop: pop(t, T.grimm) });
      } else {
        const gp = { x: -220, y: 160, s: 1.02, t: tt, turn: 0.2, eyes: 'angry', brows: 'angry', mouth: 'smirk', arms: { L: ARM.hips, R: ARM.down }, head: { tilt: 0.06 } };
        put(grimm, gp, 'grimm');
        const h = grimm.headAt(gp);
        magnifier(h.x + 44, h.y - 2, 92, 0.5, () => { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 0, 70, 80, 0, 0, PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-14 + Math.sin(t * 3) * 8, 6, 30, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-24, -6, 9, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#f1cfb0'; ctx.fillRect(-90, -100, 180, 40); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-80, -60); ctx.lineTo(80, -66); ctx.stroke(); });
      }
    }
    if (id === 'boom1' || id === 'boom2' || id === 'boom3') {
      garage(t);
      const bench = -580;
      paperStack(560, bench, 2, 240);
      const scrib = u01(t, T.fake, T.four), shake = id === 'boom2' ? u01(t, T.lasted, T.four) : 0;
      if (id !== 'boom3' || t < T.seconds + 0.08) {
        const tip = roboArm(330, bench, t, id === 'boom1' ? 0.2 : 1, shake);
        if (id === 'boom2') { const pts = []; for (let i = 0; i < 40 * scrib; i++) pts.push([500 + (i * 9) % 140 + Math.sin(i * 2.1) * 20, bench - 20 + Math.sin(i * 1.3) * 12 - Math.floor(i / 14) * 6]); if (pts.length > 1) I.line(pts, { lw: 4, line: '#3a3a3a', sub: false }); if (shake > 0.3) for (let k = 0; k < 4; k++) FX.sparkle(I, tip[0] + (h1(k + Math.floor(t * 12)) - 0.5) * 200, tip[1] - 140 + (h1(k * 5 + Math.floor(t * 12)) - 0.5) * 200, 34, (t * 5 + k * 0.3) % 0.5); }
      }
      const soot = id === 'boom3' && t > T.seconds + 0.08;
      const lp = { x: id === 'boom2' ? 190 : -120, y: id === 'boom2' ? 40 : 110, s: 1.05, t: tt, turn: 0.45, look: [0.8, -0.4], eyes: soot ? 'x' : shake > 0.5 ? 'wide' : 'happy', brows: shake > 0.5 ? 'sad' : 'neutral', mouth: soot ? 'wavy' : shake > 0.5 ? 'teeth' : 'grin', arms: soot ? { L: ARM.down, R: ARM.down } : { L: ARM.cheer, R: ARM.hold }, soot: soot ? 1 : 0, puff: soot ? 1 : 0 };
      put(leo, lp, 'leo');
      if (id === 'boom1') SET.nameTag(I, 'HANDWRITING FAKER', 260, -790, { size: 50, sub: 'INVENTION #41', pop: pop(t, T.f41) });
      if (id === 'boom3') { FX.explosion(I, 420, bench - 60, 330, t - T.seconds - 0.08, { word: 'BOOM!', seed: 8, wy: 300 }); if (soot) FX.puffs(I, -120, -560, 90, (t - T.seconds) % 1.2, { life: 1.2, seed: 11, color: '#8a8580' }); }
    }
    if (id === 'scribe1') {
      garage(t);
      paperStack(560, -580, 1, 240);
      FX.puffs(I, 460, -640, 120, (t - T.so2) * 0.6 + 0.4, { life: 1.6, seed: 12, color: '#8a8580', n: 6 });
      const lp = { x: -170, y: 110, s: 1.05, t: tt, turn: 0.4, look: [0.9, -0.2], eyes: t > T.scribe ? 'wide' : 'x', mouth: t > T.scribe ? 'o' : 'wavy', soot: 1, puff: 1, arms: { L: ARM.down, R: ARM.down } };
      put(leo, lp, 'leo');
      const walk = u01(t, T.so2 - 0.1, T.showed + 0.1);
      const mp = { x: lerp(760, 440, walk), y: 40, s: 1.0, t: tt, walk: walk < 1 ? tt * 2 : null, turn: -0.5, look: [-0.7, 0.1], eyes: 'half', mouth: 'open', open: talkMax(t), arms: { L: { a: 1.25, e: -0.15, hand: 'open' }, R: ARM.down } };
      put(max, mp, 'max');
      const hL = max.hand(mp, 'L');
      SET.laptop2d(I, hL[0] - 190, hL[1] + 40, 420, { screen: (c, x0, y0, w, h) => { scr.draw({ mode: 'home' }); c.drawImage(scr.canvas, x0, y0, w, h); } });
    }
    if (id === 'scribe2') {
      const top = bedroom(t); deskLamp(560, top);
      const lp = { x: 200, y: -330, s: 1.05, t: tt, sit: true, turn: 0.1, look: [0, 0.7], eyes: 'open', brows: 'neutral', mouth: 'smirk', arms: { L: ARM.hold, R: { a: 0.3, e: -1.4, f: 0.7 } } };
      put(leo, lp, 'leo');
      const nW = (t - T.wrote + 0.1) * 26; drawPractice(Math.max(0, nW));
      SET.tablet2d(I, 220, top + 140, 300, { rot: -0.06, screen: (c, x0, y0, w, h) => c.drawImage(prac, x0, y0, w, h) });
      const it = pracItems[Math.max(0, Math.min(pracItems.length - 1, Math.floor(nW) - 1))];
      const sx = 220 - 134 + (it.x + it.w) / 600 * 268, sy = top + 140 - 182 + (it.y + it.h) / 800 * 364;
      ctx.save(); ctx.translate(sx, sy); I.limb([[0, 0], [70, -190]], 16, '#e8e8ee', { lw: 4.5 }); ctx.restore();
            nightOver(560, top - 200, 1100, 0.35);
      if (t > T.learns) SET.nameTag(I, 'HANDWRITING: LEARNED', 230, top - 440, { size: 50, fill: '#7cf05f', pop: pop(t, T.learns) });
    }
    if (id === 'photo1') {   // over the desk: the worksheet, and the phone framing it
      S.cam.z = 1; ctx.fillStyle = '#b07a46'; ctx.fillRect(-900, -1400, 1800, 2800);
      for (let k = -6; k < 7; k++) I.line([[-900, k * 220], [900, k * 220 + 30]], { lw: 3, alpha: 0.25 });
      sheet.draw(0); SET.paper2d(I, 0, 60, 760, { canvas: sheet.canvas, rot: -0.03 });
      const k = ob(u01(t, T.one - 0.1, T.photo));
      SET.phone2d(I, 70, lerp(1200, 220, k), 470, { rot: 0.04, screen: (c, x0, y0, w, h) => {
        c.fillStyle = '#222'; c.fillRect(x0, y0, w, h); c.drawImage(sheet.canvas, x0 + 16, y0 + 90, w - 32, (w - 32) * 1325 / 1024);
        c.strokeStyle = '#ffe14d'; c.lineWidth = 6; const q = 40, X0 = x0 + 26, Y0 = y0 + 100, X1 = x0 + w - 26, Y1 = y0 + 90 + (w - 32) * 1325 / 1024 - 10;
        for (const [cx, cy, dx, dy] of [[X0, Y0, 1, 1], [X1, Y0, -1, 1], [X0, Y1, 1, -1], [X1, Y1, -1, -1]]) { c.beginPath(); c.moveTo(cx, cy + dy * q); c.lineTo(cx, cy); c.lineTo(cx + dx * q, cy); c.stroke(); }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(x0 + w / 2, y0 + h - 70, 40, 0, PI * 2); c.fill(); c.strokeStyle = '#999'; c.lineWidth = 6; c.beginPath(); c.arc(x0 + w / 2, y0 + h - 70, 50, 0, PI * 2); c.stroke();
      } });
      const hp = { x: 310, y: lerp(1500, 520, k) + 380, s: 1.6, t: tt, shadow: false };
      I.limb([[hp.x + 120, hp.y + 400], [hp.x + 30, hp.y - 120]], 80, '#2fa39a', { lw: 7 }); I.circle(hp.x + 10, hp.y - 160, 50, { fill: '#e9b58c', lw: 6 });
      S.flash(Math.max(0, 1 - (t - T.photo - 0.1) / 0.25) * (t > T.photo + 0.1 ? 1 : 0));
      if (t > T.worksheet) SET.nameTag(I, 'SNAP!', -260, -560, { size: 90, fill: '#ffe14d', pop: pop(t, T.photo + 0.1) });
    }
    if (id === 'screen') {   // the Scribe app on the laptop: read → solve → write
      ctx.fillStyle = '#3d4a7a'; ctx.fillRect(-900, -1400, 1800, 2800);
      let mode, k;
      if (t < T.reads + 0.2) { mode = 'scan'; k = u01(t, T.scribe2, T.reads + 0.2); }
      else if (t < T.then2) { mode = 'solve'; k = u01(t, T.reads + 0.2, T.step + 0.2); }
      else { mode = 'write'; k = 0; }
      if (mode === 'write') sheet.draw(sheetTotal * u01(t, T.then2, T.pen + 0.6) * 0.5); else sheet.draw(0);
      SET.laptop2d(I, 0, 60, 1000, { screen: (c, x0, y0, w, h) => { scr.draw({ mode, k }); c.drawImage(scr.canvas, x0, y0, w, h); } });
      I.rect(-560, 60, 1120, 900, { fill: '#b07a46', lw: 6, r: 0, sharp: true });
      // the brothers' heads in the foreground (backs to us is lazy — over-the-shoulder profiles)
      const lp = { x: -330, y: 1180, s: 1.25, t: tt, turn: 0.6, look: [0.7, -0.8], eyes: mode === 'solve' && k > 0.9 ? 'happy' : 'wide', mouth: mode === 'solve' && k > 0.9 ? 'grin' : 'o', arms: { L: ARM.down, R: ARM.down }, shadow: false, soot: 0.3 };
      put(leo, lp, 'leo');
      const mp = { x: 420, y: 1400, s: 1.15, t: tt, turn: -0.55, look: [-0.6, -0.8], eyes: 'half', mouth: 'smirk', arms: { L: ARM.down, R: ARM.down }, shadow: false };
      put(max, mp, 'max');
    }
    if (id === 'paper') {   // the worksheet writing itself in Leo's handwriting; the camera rides the pen down the page
      ctx.fillStyle = '#b07a46'; ctx.fillRect(-1400, -2400, 2800, 4800);
      for (let k = -10; k < 11; k++) I.line([[-1400, k * 220], [1400, k * 220 + 30]], { lw: 3, alpha: 0.25 });
      const p = sheetTotal * (0.5 + 0.5 * u01(t, T.his - 0.2, T.he2 - 0.1));
      const tip = sheet.draw(p);
      const W0 = 940, sc = W0 / 1024, ox = -W0 / 2, oy = -W0 * 1325 / 1024 / 2;
      SET.paper2d(I, 0, 0, W0, { canvas: sheet.canvas, lw: 6 });
      pen2d(ox + tip[0] * sc, oy + tip[1] * sc, 1.0);
      // Leo watching from below the caption band (the desk under the page was empty)
      const lyH = S.cam.y + (1420 - 960) / S.cam.z, lp = { x: 230, y: lyH + 404 * 1.25, s: 1.25, t: tt, turn: -0.5, look: [-0.7, -0.9], eyes: t > T.his + 0.5 ? 'happy' : 'wide', mouth: 'grin', arms: { L: ARM.down, R: ARM.down }, shadow: false };
      put(leo, lp, 'leo');
      if (t > T.his && t < T.his + 1.5) { ctx.save(); ctx.globalAlpha = 1 - u01(t, T.his + 1.3, T.his + 1.5); SET.nameTag(I, 'HIS HANDWRITING', 120, oy + tip[1] * sc + 120, { size: 58, fill: '#ffe14d', pop: pop(t, T.his) }); ctx.restore(); }
    }
    if (id === 'print') {
      const top = bedroom(t); deskLamp(560, top);
      SET.printer2d(I, 120, top, 320);
      // pages arc out of the printer into Leo's arms
      for (let i = 0; i < 6; i++) { const a = t - T.prints - i * 0.12; if (a < 0) continue; const u = clamp(a / 0.5), x = lerp(120, -200, u), y = lerp(top - 150, top - 330, u) - Math.sin(u * PI) * 160; ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0, -0.6, u) + i * 0.05); I.rect(-90, -110, 180, 220, { fill: '#fffdf6', lw: 4.5, r: 2, sharp: true, inner: () => ctx.drawImage(sheet.canvas, -90, -110, 180, 220) }); ctx.restore(); }
      const lp = { x: -230, y: 90, s: 1.05, t: tt, turn: 0.4, look: [0.6, -0.2], eyes: 'happy', mouth: 'grin', arms: { L: ARM.hold, R: ARM.hold }, bob: t > T.done ? Math.abs(Math.sin(t * 9)) * 30 : 0 };
      put(leo, lp, 'leo');
      const mp = { x: 520, y: 40, s: 0.95, t: tt, turn: -0.4, eyes: 'half', mouth: 'smirk', arms: { L: ARM.cross, R: t > T.done ? ARM.thumb : ARM.cross } };
      put(max, mp, 'max');
      SET.clock2d(I, -200, -1180, 70, { h: 5, m: 30, rim: '#ffc531' });
      nightOver(300, top - 200, 1300, 0.25);
      if (t > T.done) SET.nameTag(I, '5:30 PM', 20, -1180, { size: 56, pop: pop(t, T.done) });
    }
    if (id === 'match1' || id === 'match2') {   // the next morning: Mrs. Grimm checks the handwriting
      ctx.fillStyle = '#f3e2b3'; ctx.fillRect(-900, -1400, 1800, 2800);
      ctx.fillStyle = '#e3c27f'; ctx.fillRect(-900, 120, 1800, 1400); I.line([[-900, 120], [900, 120]], { lw: 5 });
      SET.clock2d(I, 380, -560, 64, { h: 8, m: 15 }); SET.poster(I, -380, -500, 200, 250, { text: 'MATH', size: 48, sub: '= FUN?', subSize: 34, color: '#e8f4ff', rot: -0.04 });
      const gp = { x: 40, y: 600, s: 1.5, t: tt, turn: -0.15, look: [-0.2, 0.9], eyes: id === 'match2' ? 'wide' : 'half', brows: id === 'match2' ? 'up' : 'skeptic', mouth: id === 'match2' ? 'o' : 'flat', arms: { L: ARM.hold, R: ARM.hold }, shadow: false };
      put(grimm, gp, 'grimm');
      sheet.draw(sheetTotal);
      const PX = -40, PY = 440, PW = 500, PH = PW * 1325 / 1024;
      ctx.save(); ctx.translate(PX, PY); ctx.rotate(-0.04); SET.paper2d(I, 0, 0, PW, { canvas: sheet.canvas }); goldStar(170, -230, 80, id === 'match2' ? pop(t, T.perfect + 0.05) : 0); ctx.restore();
      const u = u01(t, T.next, T.page), mx = id === 'match1' ? lerp(-150, -90, u) : -90, my = id === 'match1' ? lerp(320, 440, u) : 440;
      magnifier(mx, my, 135, 0.7, () => { ctx.save(); ctx.scale(1.9, 1.9); ctx.translate(-mx, -my); ctx.translate(PX, PY); ctx.rotate(-0.04); ctx.drawImage(sheet.canvas, -PW / 2, -PH / 2, PW, PH); ctx.restore(); });
    }
    if (id === 'pay1' || id === 'pay2' || id === 'pay3') {
      classroom(t, { h: 9, m: 30 });
      ctx.save(); ctx.translate(170, -300); ctx.scale(0.82, 0.82); trifold(0, 0); ctx.restore();
      if (id === 'pay3') { const mp = { x: 330, y: 150, s: 1.0, t: tt, turn: -0.3, eyes: 'closed', mouth: 'flat', arms: { L: ARM.face, R: ARM.down } }; put(max, mp, 'max'); SET.nameTag(I, 'ME', 330, -560, { size: 56, sub: 'THE ACTUAL INVENTOR?', pop: pop(t, T.credit) }); }
      put(grimm, { x: 560, y: -100, s: 0.9, t: tt, turn: -0.4, eyes: t > T.worked ? 'happy' : 'half', mouth: t > T.worked ? 'smile' : 'flat', arms: t > T.first ? { L: { a: 0.6, e: -1.7 + Math.sin(t * 12) * 0.2 }, R: { a: 0.6, e: -1.7 + Math.sin(t * 12) * 0.2 } } : { L: ARM.cross, R: ARM.cross } }, 'grimm');
      const bow = id === 'pay3' ? Math.max(0, Math.sin(clamp((t - T.takes) / 0.6) * PI)) : 0;
      const lp = { x: -250, y: 140, s: 1.1, t: tt, turn: 0.25, eyes: 'happy', mouth: 'grin', arms: id === 'pay3' ? { L: { a: 1.95, e: 0.25, hand: 'fist' }, R: ARM.hips } : { L: ARM.point, R: ARM.hips }, lean: bow * 0.5, bob: id === 'pay2' ? Math.abs(Math.sin(t * 8)) * 20 : 0 };
      put(leo, lp, 'leo');
      if (id === 'pay3') { const hp = leo.hand(lp, 'L'); trophy(hp[0], hp[1] + 60, 0.75); for (let k = 0; k < 5; k++) FX.sparkle(I, hp[0] + (h1(k) - 0.5) * 300, hp[1] - 100 + (h1(k * 3) - 0.5) * 200, 40, (t + k * 0.21) % 0.6); }
      kids.forEach((k, i) => {
        const x = [-560, -250, 300, 560][i], cl = t > T.first ? Math.sin(t * 14 + i) : 0;
        const kp = { x, y: k.seatY(330, 0.95), s: 0.95, t: tt + i, sit: true, turn: (x < 0 ? 0.3 : -0.3), eyes: t > T.worked ? 'happy' : 'open', mouth: t > T.first ? 'grin' : 'smile', arms: t > T.first ? { L: { a: 0.5 + 0.2 * cl, e: -1.6 }, R: { a: 0.5 + 0.2 * cl, e: -1.6 } } : { L: ARM.down, R: ARM.down } };
        if (id !== 'pay3' || i > 1) put(k, kp, 'kid'); SET.schoolDesk(I, x, 550, 0.95);
      });
      if (id === 'pay2' || id === 'pay3') FX.confetti(I, 0, -1300, 1400, t - T.worked + 0.4, { n: 70 });
    }
  }

  function update(t) {
    const { shot, cam: c } = shotAt(t, SH, K);
    if (shot.id === 'paper') {   // keep the pen tip at ~37 % of the frame (above the caption), handwriting big
      const p = sheetTotal * (0.5 + 0.5 * u01(t, T.his - 0.2, T.he2 - 0.1)), tip = sheet.draw(p), sc = 940 / 1024, ty = -940 * 1325 / 1024 / 2 + tip[1] * sc;
      c.z = 1.3 + 0.06 * u01(t, T.his, T.he2); c.x = 0; c.y = ty - (700 - 960) / c.z;
    }
    S.begin(t, c, HITS);
    draw(shot.id, t, S.twos(t));
    // frame-space overlays: the counter board, DAY labels, the end card
    S.screen();
    const cnt = counter(t);
    if (cnt) SET.board(I, 540, 236, [['INVENTIONS', cnt.inv], ['WORKING', cnt.work]], { size: 48, pop: cnt.pop, valueColors: [null, cnt.work ? '#2f9e5b' : '#e5483d'] });
    const dl = dayLabel(t);
    if (dl && dl.a > 0) { ctx.save(); ctx.globalAlpha = dl.a; ctx.translate(540, 360); ctx.scale(dl.k, dl.k); I.text(dl.txt, 0, 0, { size: dl.txt.length > 7 ? 74 : 104, fill: '#ffe14d', lw: 20, rot: -0.04 }); ctx.restore(); }
    drawEndCard(S, icon, t - ENDCARD, {
      extra: (I2, age) => {   // Leo + his big brother under the card
        const k = ob((age - 0.7) / 0.4);
        if (k <= 0) return;
        ctx.save(); ctx.translate(0, (1 - k) * 400);
        leo.draw(I2, { x: 330, y: 1990, s: 0.9, t: S.twos(t), turn: 0.2, eyes: 'happy', mouth: 'grin', arms: { L: ARM.thumb, R: ARM.hips }, shadow: false });
        max.draw(I2, { x: 800, y: 2080, s: 0.85, t: S.twos(t), turn: -0.3, eyes: 'half', mouth: 'smirk', arms: { L: ARM.cross, R: ARM.cross }, shadow: false });
        ctx.restore();
      },
    });
    S.end();
  }
  window.EDSTUDIO_QC = () => S.qcCaptions(update, story);
  return { update };
}
