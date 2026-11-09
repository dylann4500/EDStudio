// 061 — Scribe promo in the motion-graphics look (engine/mg): "What if every human on Earth clapped at the same time?"
// A dupe of @thewhatifstudio's 2.5M-view reel (TikTok, Oct 13 2026, 61 s, text-led with sound design, no narrator): the same
// escalation — a countdown on a beach, 8 billion people clap, the sound's distance clock rolls (gulls, car alarms, a landmark
// N seconds away, "like thunder", New York's clap would take hours, the energy in gallons of gas), "things the clap changed: 0" —
// then the twist. Theirs: the sea pulls back (a tsunami). Ours: every phone on the beach buzzes — every physics teacher on Earth
// just assigned the clap, 40 problems, handwritten. One photo → Scribe solves all 40 and writes them in YOUR handwriting (a
// sound-wave / inverse-square figure + the dB working, stroke by stroke) → you start a slow clap, everyone joins in.
// Facts (sources in caption.md): 8.3 billion people (UN WPP 2024, mid-2026); sound 343 m/s at 20 °C (NPL); a loud clap ≈ 100 dB
// at 1 m (Fu et al., Phys Rev Research 7, 013259, 2025); −6 dB per doubling of distance; +10·log10(N) dB for N equal sources
// (199 dB > the 194 dB ceiling of sound in air); Santa Monica Pier → Venice Beach 3.2 km (9.3 s); → New York 3,959 km (3:12:22);
// hands' energy ≈ 1 J a clap (hand = 0.6 % of body mass, Dempster) → ≈ 8 GJ ≈ 60 US gallons of gasoline (EIA 126.8 MJ/gal); the
// sound itself under 0.1 % of that. Every time lives in story.json (make_story.py) so make_cues.py lands the foley on the frame.
import { E, tw, env, seqv, clamp, lerp, rng, shade, mixc } from '@engine/mg/ease.js';
import { createMG, PAL } from '@engine/mg/stage.js';
import { circle, rrect, ring, line, shape, ellipse, glow, qpts, cloud, contact, TAU } from '@engine/mg/draw.js';
import { makeFolk, makeCrowd, drawCrowd, clapArms, clapCycle, drawHandsPOV } from '@engine/mg/people.js';
import { makeWorld, gcPts } from '@engine/mg/geo.js';
import { lineChart } from '@engine/mg/charts.js';
import { label, ktext, txt, FONT } from '@engine/mg/type.js';
import { soundRings, burst, confetti, sparkle, buzz } from '@engine/mg/fx.js';
import { space, beach, beachFG, street } from '@engine/mg/scenes.js';
import { gull, gullStand, car, phone, gascan, speaker, pin, paperStack, handPhone, check } from '@engine/mg/icons.js';
import { mgOverlay } from '@engine/mg/overlay.js';
import { drawEndCard } from '@engine/mg/endcard.js';
import { makeWorksheet, scribeApp, SCRIBE } from '@engine/mg/scribe2d.js';
import { loadHand, loadImg } from '@engine/build/scribe.js';

export async function build(studio, story) {
  const M = await createMG(studio);
  const TXT = mgOverlay(story);
  const T = story.T, EV = story.E, CLAP = EV.clap, D = story.duration;
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const W = makeWorld();
  M.hits = [[CLAP, 34, 0.5], [EV.stamp, 18, 0.3], [EV.mo_clap, 22, 0.7]];

  // ------------------------------------------------------------------ cast
  const hero = makeFolk({ seed: 61, skin: '#e9b083', shirt: PAL.yellow, hair: '#2b1d16', hairStyle: 'short', glasses: true, pants: '#2a3a6e' });
  const crowd = makeCrowd(61, 42, { x0: -660, x1: 660, y0: 610, y1: 130, s0: 1.3, s1: 0.48 }).filter((c) => !(c.d < 0.22 && Math.abs(c.x) < 230));
  const crowdB = makeCrowd(62, 30, { x0: -700, x1: 700, y0: 330, y1: 120, s0: 0.85, s1: 0.42 });   // behind the hero
  const LA = [34.009, -118.497], NYC = [40.7128, -74.006];
  // arms: k 0 = hanging … 1 = wide apart at chest height (ready to clap)
  const raise = (k) => ({ L: { to: [lerp(-0.85, -1.75, k), lerp(-1.15, -2.4, k)] }, R: { to: [lerp(0.85, 1.75, k), lerp(-1.15, -2.4, k)] } });
  const clapK = (t, c = 0) => (t < CLAP - 0.24 ? 0 : t < CLAP ? E.in2((t - (CLAP - 0.24)) / 0.24) : t < CLAP + 0.12 ? 1 : 1 - 0.55 * E.out3((t - CLAP - 0.12) / 0.4));
  const phoneArms = { L: { to: [-0.25, -2.2] }, R: { to: [0.32, -2.32] } };

  // ------------------------------------------------------------------ the worksheet (PHYSICS) — figure + dB working, written by Scribe
  const sheet = makeWorksheet(G, {
    title: 'PHYSICS · PROBLEM SET 7: THE CLAP', note: '40 PROBLEMS  ·  SHOW YOUR WORK  ·  HANDWRITTEN ONLY  ·  DUE 11:59 PM', name: 'Sam', page: 'p. 1 / 12', seed: 61,
    top: 300,
    problems: [
      { q: '1) One clap is 100 dB at 1 m. How loud is it 500 m away? Sketch the intensity I against the distance r.', h: 470, ay: 96, u: 27,
        a: ['L = 100 - 20 log(500/1)', '   = 100 - 54', '   = 46 dB'], box: true,
        fig: (F) => {   // the sound source, its wavefronts, and the I-vs-r curve (inverse square)
          const y0 = F.y0 + 110, ox = 600, oy = y0 + 300;
          F.dot(ox - 2, y0 + 40, 7); for (let i = 1; i <= 3; i++) F.arc(ox - 2, y0 + 40, 26 * i, -0.9, 0.9, 4, 3.5);
          F.text('clap', ox - 30, y0 + 102, 18);
          F.line([[ox + 30, oy], [ox + 360, oy]], 5); F.line([[ox + 30, oy], [ox + 30, y0 + 110]], 5);
          F.line([[ox + 350, oy - 8], [ox + 362, oy], [ox + 350, oy + 8]], 2, 3.5); F.line([[ox + 22, y0 + 122], [ox + 30, y0 + 108], [ox + 38, y0 + 122]], 2, 3.5);
          F.curve((X) => 1 / (X * X), 0.55, 3.2, ox + 30 - 0.4 * 100, oy, 100, 52, 14, 4.5);
          F.text('I', ox + 8, y0 + 132, 22); F.text('r', ox + 366, oy + 8, 22); F.text('I = P/4πr^2', ox + 130, y0 + 170, 22);
          F.line([[ox + 30 + 0.6 * 100 - 40, oy - 7], [ox + 30 + 0.6 * 100 - 40, oy + 7]], 1, 3); F.text('1m', ox + 46, oy + 40, 16);
          F.line([[ox + 30 + 2.6 * 100 - 40, oy - 7], [ox + 30 + 2.6 * 100 - 40, oy + 7]], 1, 3); F.text('500m', ox + 228, oy + 40, 16);
        } },
      { q: '2) All 8.3 billion claps in one spot. How loud is it 1 m away?', h: 250, ay: 70, u: 27,
        a: ['L = 100 + 10 log(8.3 x 10^9)', '   = 100 + 99 = 199 dB > 194 dB', '   too loud for air: a shock wave!'] },
      { q: '3) How long does New York\'s clap take to reach LA? (3,959 km)', h: 230, ay: 70, u: 27,
        a: ['t = d / v = 3959000 / 343', '   = 11542 s = 3.2 h'] },
    ],
  });
  const P1 = sheet.items.filter((it) => it.pi === 0).reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);
  const PH = sheet.h * 760 / sheet.w;   // the page drawn 760 px wide

  // ------------------------------------------------------------------ helpers
  const dbgCam = (cam) => cam;
  const shake = () => M._sh || { x: 0, y: 0, r: 0 };
  const markHead = (h, name) => M.markS(h.head[0], h.head[1], h.head[2], name);
  /** the worksheet page in world space (centre x, top y, width) */
  const page = (g, cx, y, w, rot = 0, sh = 160) => { const h = w * sheet.h / sheet.w; g.save(); g.translate(cx, y + h / 2); g.rotate(rot); rrect(g, -w / 2, -h / 2, w, h, 6, { fill: '#fffdf6', shadow: { len: sh, a: 0.28 }, flat: true }); g.drawImage(sheet.canvas, -w / 2, -h / 2, w, h); g.restore(); return h; };
  /** a notification card on a phone screen */
  const note = (g, x, y, w, who, line1, line2, k, col = PAL.purple) => {
    if (k <= 0) return; const e = E.back(clamp(k / 0.6), 1.1), h = w * 0.32;
    g.save(); g.globalAlpha *= clamp(k * 2.5); g.translate(x + (1 - e) * 60, y); rrect(g, 0, 0, w, h, w * 0.06, { fill: '#f5f7ff', flat: true });
    rrect(g, w * 0.04, h * 0.14, w * 0.11, w * 0.11, w * 0.025, { fill: col, flat: true }); txt(g, '⚛', w * 0.095, h * 0.14 + w * 0.056, { size: w * 0.07, color: '#fff', shadow: false, font: FONT.body });
    txt(g, who, w * 0.19, h * 0.24, { size: w * 0.046, weight: 800, font: FONT.body, color: '#5a6585', align: 'left', shadow: false, track: 1 });
    txt(g, line1, w * 0.19, h * 0.5, { size: w * 0.055, weight: 700, font: FONT.body, color: '#141a33', align: 'left', shadow: false });
    txt(g, line2, w * 0.19, h * 0.76, { size: w * 0.045, weight: 600, font: FONT.body, color: '#b3261e', align: 'left', shadow: false });
    g.restore();
  };
  /** the hand-held pen (Scribe red) whose nib sits at (x, y) */
  const pen = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.rotate(-0.72); rrect(g, -9 * s, -250 * s, 18 * s, 205 * s, 9 * s, { fill: SCRIBE.red, shadow: { len: 90, a: 0.2 } }); shape(g, [[-9 * s, -46 * s], [9 * s, -46 * s], [2 * s, -4 * s], [-2 * s, -4 * s]], { fill: '#d9c3a0', flat: true }); circle(g, 0, -3 * s, 2.5 * s, { fill: SCRIBE.ink, flat: true }); rrect(g, -11 * s, -150 * s, 22 * s, 40 * s, 6 * s, { fill: '#2a2a3a', flat: true }); g.restore(); };
  /** the beach crowd, posed by fn(c) */
  const beachCrowd = (g, t, list, fn, o = {}) => drawCrowd(g, list, t, fn, { haze: '#ffe9c4', hazeA: 0.22, ...o });

  // ------------------------------------------------------------------ the stylised coast map (Santa Monica → Venice), 1 km = 220 px
  const KM = 220, PIER = [-80, -20], VEN = [PIER[0] + 0.636 * KM * 3.2, PIER[1] + 0.772 * KM * 3.2];   // Venice is 3.2 km SSE of the pier along the coast
  const coast = [[-1500, -1310], [-700, -640], [-180, -170], [-30, -10], [VEN[0] - 40, VEN[1] - 30], [VEN[0] + 400, VEN[1] + 420], [1700, 2000]];
  const R2 = rng(5), blocks = []; for (let i = 0; i < 140; i++) { const x = -1600 + R2() * 3600, y = -1600 + R2() * 3800; blocks.push([x, y, 60 + R2() * 70, 40 + R2() * 60, R2()]); }
  function coastMap(g, t, cam) {
    M.sky(g, ['#1d5fb4', '#1a4f9c']);
    M.view(g, cam, 1, (gg) => {
      // land = everything NE of the coastline polygon
      const land = [...coast, [2600, 2000], [2600, -1600], [-1500, -1600]];
      shape(gg, land, { fill: '#f1e3c2', light: 0.04 });
      gg.save(); tracePoly(gg, land); gg.clip();
      for (const [x, y, w, h, r] of blocks) { rrect(gg, x, y, w, h, 8, { fill: r < 0.15 ? '#9fd99a' : r < 0.3 ? '#e6d2ab' : '#f8eed6', flat: true }); }
      for (let i = -12; i <= 12; i++) line(gg, [[-1600 + i * 180, -1700], [400 + i * 180, 2100]], { w: 10, color: '#ffffff', alpha: 0.55 });
      gg.restore();
      line(gg, coast, { w: 36, color: '#f8dca0' }); line(gg, coast.map(([x, y]) => [x - 26, y + 22]), { w: 10, color: '#e9f8ff', alpha: 0.7 });
      // the pier into the ocean
      rrect(gg, -160, -40, 150, 26, 8, { fill: '#e8dccb', flat: true });
    });
  }
  const tracePoly = (g, P) => { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (const p of P) g.lineTo(p[0], p[1]); g.closePath(); };

  // ------------------------------------------------------------------ the seismograph (things the clap changed: 0)
  function seismo(g, t, cam) {
    M.sky(g, ['#16306b', '#0d1b42']);
    M.view(g, cam, 2.5, (gg) => M.stars(gg, t, { n: 60, seed: 12, a: 0.5 }));
    M.view(g, cam, 1, (gg) => {
      rrect(gg, -470, -150, 940, 520, 40, { fill: '#2a3f7e', shadow: { len: 260, a: 0.25 } });
      // the paper strip scrolling left, a flat line with one tiny blip (the clap) drifting away
      rrect(gg, -420, -60, 840, 300, 16, { fill: '#fffaf0', flat: true });
      gg.save(); gg.beginPath(); gg.rect(-420, -60, 840, 300); gg.clip();
      for (let x = -420; x < 420; x += 42) line(gg, [[x - ((t * 120) % 42), -60], [x - ((t * 120) % 42), 240]], { w: 1.5, color: '#f2a7a7', alpha: 0.6 });
      for (let y = -30; y < 240; y += 42) line(gg, [[-420, y], [420, y]], { w: 1.5, color: '#f2a7a7', alpha: 0.6 });
      const pts = [], blipX = 300 - (t - CLAP) * 25 - 160;
      for (let x = -420; x <= 300; x += 4) { const d = x - blipX, b = Math.abs(d) < 26 ? Math.sin(d * 0.6) * 9 * Math.exp(-Math.abs(d) * 0.08) : 0; pts.push([x, 90 + b + Math.sin(x * 0.31 + t * 6) * 0.8]); }
      line(gg, pts, { w: 4.5, color: '#1b2760' });
      gg.restore();
      // the pen arm
      line(gg, [[300, 90], [470, -40]], { w: 14, color: '#c9d2ea' }); circle(gg, 300, 90, 11, { fill: PAL.red }); circle(gg, 470, -40, 22, { fill: '#8a96b8' });
      const bx = blipX; label(gg, 'BARELY A BLIP', Math.max(-250, bx), 360, { k: tw(t, T.later + 0.35, 0.6, E.lin), leader: [Math.max(-250, bx), 112], size: 34, bg: PAL.yellow });
      ktext(gg, 'SEISMOGRAPH', 170, -250, { size: 64, k: tw(t, T.later + 0.05, 0.6, E.lin), track: 6 });
    });
  }

  // ------------------------------------------------------------------ SHOTS
  const laOnGlobe = (() => { const v = { lat0: 24, lon0: -150 + T.ready * 11 }, p = W.globeXY(LA[0], LA[1], 0, 40, 400, v), z = lerp(0.95, 1.18, E.io2(T.ready / 3.2)); return [540 + p[0] * z, 960 + p[1] * z]; })();
  const SHOTS = [];
  const S = (t0, id, draw, tr) => SHOTS.push({ t0, id, draw, tr });

  // 1. the title over the Earth (the Americas turning into view, Santa Monica pinged)
  S(0, 'earth', (g, t) => {
    const cam = { x: 0, y: 0, z: lerp(0.95, 1.18, E.io2(t / 3.2)) };
    space(M, g, t, cam);
    M.view(g, cam, 1, (gg) => {
      const v = W.globe(gg, 0, 40, 400, { lon0: -150 + t * 11, lat0: 24, dots: 0.55, dotFn: (d, i) => 0.55 + 0.45 * Math.sin(t * 1.7 + i * 0.37) });
      const p = W.globeXY(LA[0], LA[1], 0, 40, 400, v);
      if (t > 1.4) { soundRings(gg, p[0], p[1], (t - 1.4) % 0.9, { n: 2, speed: 90, max: 70, w: 4, color: PAL.yellow }); circle(gg, p[0], p[1], 7, { fill: PAL.yellow, flat: true }); }
    });
  });
  // 2. Santa Monica Beach: your hands come up, everyone's arms go wide… CLAP
  S(T.ready, 'pov', (g, t) => {
    const u = tw(t, T.ready, 2.4, E.io2), cam = { x: lerp(-10, 25, u), y: 175, z: lerp(1.06, 1.12, u) };
    beach(M, g, t, cam, { sunX: 300 });
    M.view(g, cam, 1, (gg) => {
      beachCrowd(gg, t, crowd, (c) => ({ arms: t < CLAP - 0.3 ? raise(E.io2(tw(t, T.ready + 0.15 + c.d * 0.25, 0.55))) : clapArms(clapK(t)), eyes: t > CLAP && t < CLAP + 0.6 ? 'happy' : 'open', mouth: t > CLAP ? 'grin' : 'smile', look: [0, -0.2] }));
    });
    beachFG(M, g, t, cam);
    const sh = shake(), rise = E.out3(tw(t, T.ready + 0.05, 0.6));
    g.save(); g.translate(sh.x, sh.y); drawHandsPOV(g, clapK(t), { y: 1920 + (1 - rise) * 700, rise: 470, spread: 290, sleeve: PAL.blue }); g.restore();
    if (t >= CLAP) { burst(g, 540 + sh.x, 1410 + sh.y, t - CLAP, { r: 260, n: 14, w: 16 }); soundRings(g, 540, 1410, t - CLAP, { n: 5, speed: 1500, max: 1900, w: 16 }); M.flash(g, 0.5 * (1 - tw(t, CLAP, 0.22, E.lin))); }
  });
  // 3. …all at once, all over the planet
  S(CLAP + 1.1, 'planet', (g, t) => {
    const a = t - (CLAP + 1.1), cam = { x: 0, y: 0, z: lerp(1.15, 1.0, E.out3(a / 1.2)) };
    space(M, g, t, cam);
    M.view(g, cam, 1, (gg) => {
      const v = W.globe(gg, 0, 30, 430, { lon0: -95 + a * 8, lat0: 18, dots: 1, dotSize: 1.25, dotFn: (d, i) => 0.55 + 1.2 * Math.exp(-a * 1.6) + 0.15 * Math.sin(i + t * 3) });
      for (const c of [[40.7, -74], [19.4, -99.1], [-23.5, -46.6], [34, -118.5], [41.9, -87.6], [4.7, -74.1], [-34.6, -58.4], [29.8, -95.4], [45.5, -73.6], [-12, -77], [6.5, 3.4], [51.5, -0.1]]) {
        const p = W.globeXY(c[0], c[1], 0, 30, 430, v); if (p[2] > 0.15) soundRings(gg, p[0], p[1], a % 1.1, { n: 2, speed: 120, max: 90, w: 4 });
      }
    });
  }, { kind: 'zoomout', dur: 0.5, x: 540, y: 1150 });
  // 4. every seagull on the beach takes off (the sound ring sweeps in from the left)
  const GULLS = Array.from({ length: 13 }, (_, i) => ({ x: -560 + i * 95 + (i % 2) * 30, y: 300 + ((i * 53) % 190), s: 1.25 + ((i * 37) % 40) / 100, flip: i % 3 === 0 })).sort((a, b) => a.y - b.y);
  S(T.gulls, 'gulls', (g, t) => {
    const u = tw(t, T.gulls, 2.4, E.io2), cam = { x: lerp(-50, 60, u), y: lerp(170, 120, u), z: 1.22 };
    beach(M, g, t, cam, { sunX: 120, ferris: true });
    M.view(g, cam, 1, (gg) => {
      beachCrowd(gg, t, crowdB.slice(0, 18), (c) => ({ y: c.y - 30, s: c.s * 0.7, arms: c.i % 2 ? clapArms(0.3) : { L: { a: 0.3, e: 0.4 }, R: { a: 0.3, e: 0.4 } } }), { flatBelow: 1 });
      const ringX = -1100 + (t - T.gulls) * 900; ring(gg, -1100, 420, Math.max(1, (t - T.gulls) * 900), { w: 14, color: '#ffffff', alpha: 0.75 }); ring(gg, -1100, 420, Math.max(1, (t - T.gulls) * 900 - 60), { w: 6, color: '#ffffff', alpha: 0.4 });
      for (const b of GULLS) {
        const go = T.gulls + (b.x + 1100) / 900 + 0.05 + (b.y % 7) * 0.02, a = t - go;
        if (a < 0) { gullStand(gg, b.x, b.y, b.s, { flip: b.flip }); contact(gg, b.x, b.y, 40 * b.s, 9 * b.s, 0.25); continue; }
        const x = b.x + (b.flip ? -1 : 1) * 190 * a + Math.sin(a * 3 + b.x) * 18, y = b.y - 70 - 330 * a - 90 * a * a;
        contact(gg, b.x, b.y, 40 * b.s * Math.max(0, 1 - a * 2), 9 * b.s, 0.25); gull(gg, x, y, b.s * 0.8 * (1 + a * 0.35), (a * 3.2 + b.s) % 1, { rot: (b.flip ? 0.14 : -0.14) });
      }
    });
  });
  // 5. every car alarm on Ocean Avenue goes off
  const WALK = {};
  const CARS = [[-1000, PAL.red, false], [-520, PAL.teal, true], [-40, PAL.yellow, false], [440, PAL.purple, true], [920, PAL.orange, false], [1400, PAL.blue, true]];
  S(T.alarms, 'alarms', (g, t) => {
    const u = tw(t, T.alarms, 2.6, E.io2), cam = { x: lerp(-260, 300, u), y: 330, z: 1.24 };
    street(M, g, t, cam);
    M.view(g, cam, 1, (gg) => {
      // street sign
      const front = -1700 + (t - T.alarms) * 1250;   // the sound front sweeping in from the beach (left)
      // the near sidewalk (cars park at its curb), meters, a hydrant, the street sign
      rrect(gg, -3000, 352, 6000, 26, 0, { fill: '#d9dcec', flat: true }); { const sg = gg.createLinearGradient(0, 378, 0, 1100); sg.addColorStop(0, '#c4c8de'); sg.addColorStop(1, '#a9aecb'); gg.fillStyle = sg; gg.fillRect(-3000, 378, 6000, 1200); }
      for (let x = -3000; x < 3000; x += 160) line(gg, [[x, 378], [x - 60, 1100]], { w: 4, color: '#9aa0bd', alpha: 0.6 });
      for (const mx of [-690, -250, 620, 1040]) { line(gg, [[mx, 470], [mx, 330]], { w: 12, color: '#6d7594' }); rrect(gg, mx - 24, 290, 48, 64, 14, { fill: '#8a96b8' }); rrect(gg, mx - 14, 302, 28, 18, 6, { fill: '#bfe6ff', flat: true }); }
      rrect(gg, 168, 410, 64, 90, 18, { fill: PAL.red }); rrect(gg, 156, 400, 88, 22, 10, { fill: shade(PAL.red, -0.15) }); circle(gg, 200, 398, 20, { fill: shade(PAL.red, 0.1) });
      for (const [px, fl, sd] of [[-560, 1, 71], [-140, -1, 72], [330, 1, 73], [760, -1, 74]]) { const P = WALK[sd] || (WALK[sd] = makeFolk({ seed: sd })); P.draw(gg, { x: px, y: 640, s: 1.05, arms: front > px - 200 ? { L: { to: [-0.55, -3.85] }, R: { to: [0.55, -3.85] } } : { L: { a: 0.15, e: 0.2 }, R: { a: 0.15, e: 0.2 } }, eyes: front > px - 200 ? 'wide' : 'open', mouth: front > px - 200 ? 'o' : 'smile', look: [fl * 0.7, 0] }); }
      line(gg, [[420, 400], [420, 40]], { w: 12, color: '#7d8aa8' }); rrect(gg, 290, 18, 260, 74, 10, { fill: '#1f8a4c', shadow: { len: 80, a: 0.2 } }); txt(gg, 'OCEAN AV', 420, 56, { size: 44, weight: 800, font: FONT.body, track: 3, shadow: false });
      ring(gg, -1700, 300, Math.max(1, front + 1700), { w: 12, color: '#ffffff', alpha: 0.5 });
      CARS.forEach(([x, col, flip], i) => {
        const on = front > x - 120, a = t - (T.alarms + (x + 1700 - 120) / 1250);
        const L = on ? (Math.floor(a * 6) % 2 === 0 ? 1 : 0.15) : 0;
        car(gg, x, 340, 1.75, { color: col, flip, lights: L, shadow: 110 });
        if (on) soundRings(gg, x, 150, a % 0.6, { n: 2, speed: 300, max: 180, w: 7, a0: -2.6, a1: -0.55, color: '#ffe08a' });
      });
    });
  }, { kind: 'slide', dur: 0.4, dir: 1 });
  // 6. your clap reaches Venice Beach 9 seconds later (a map: the ring arrives on the frame the HUD says 9.3 s)
  S(T.venice, 'venice', (g, t) => {
    const u = tw(t, T.venice, 2.5, E.io2), cam = { x: lerp(120, VEN[0] - 30, u), y: lerp(160, VEN[1] - 80, u), z: lerp(0.62, 0.95, u) };
    coastMap(g, t, cam);
    M.view(g, cam, 1, (gg) => {
      const r = Math.max(1, 343 * (t - CLAP) * KM / 1000), hit = t >= EV.venice_hit;
      gg.save(); gg.fillStyle = 'rgba(255,214,90,.12)'; gg.beginPath(); gg.arc(PIER[0], PIER[1], r, 0, TAU); gg.fill(); gg.restore();
      ring(gg, PIER[0], PIER[1], r, { w: 16, color: PAL.yellow }); ring(gg, PIER[0], PIER[1], Math.max(1, r - 50), { w: 6, color: PAL.yellow, alpha: 0.5 });
      line(gg, [PIER, VEN], { w: 8, color: '#1b2760', dash: [24, 18], alpha: 0.75 });
      pin(gg, PIER[0], PIER[1], 1.3, { color: PAL.red, shadow: 80 }); label(gg, 'SANTA MONICA PIER', PIER[0] + 330, PIER[1] - 120, { k: tw(t, T.venice, 0.5, E.lin), size: 40, bg: '#ffffff' });
      pin(gg, VEN[0], VEN[1], 1.3, { color: hit ? PAL.green : PAL.purple, shadow: 80 });
      if (hit) soundRings(gg, VEN[0], VEN[1] - 80, t - EV.venice_hit, { n: 3, speed: 380, max: 260, w: 8, color: PAL.yellow });
      label(gg, 'VENICE BEACH', VEN[0], VEN[1] + 140, { k: tw(t, EV.venice_hit - 0.05, 0.5, E.lin), size: 46, sub: '3.2 KM · 9.3 S', bg: PAL.yellow });
      label(gg, '3.2 KM', (PIER[0] + VEN[0]) / 2 + 120, (PIER[1] + VEN[1]) / 2 - 40, { k: tw(t, T.venice + 0.3, 0.5, E.lin), size: 34, bg: '#1b2760', color: '#ffffff' });
    });
  }, { kind: 'iris', dur: 0.45, x: 540, y: 980 });
  // 7. so the clap rolls on, like thunder: what you'd actually hear (a line chart that draws itself)
  const RUMBLE = (() => { const R = rng(7), out = [[0, 0.02]]; for (let i = 1; i <= 140; i++) { const u = i / 140; out.push([u, i < 4 ? [0.3, 0.95, 0.7][i - 1] : 0.62 * Math.exp(-u * 3.1) + 0.06 + R() * 0.22 * Math.exp(-u * 2.2)]); } return out; })();
  S(T.thunder, 'thunder', (g, t) => {
    const u = tw(t, T.thunder, 2.3, E.io2), cam = { x: 0, y: lerp(30, 0, u), z: lerp(1, 1.05, u) };
    space(M, g, t, cam, { planets: false });
    M.view(g, cam, 2, (gg) => { for (let i = 0; i < 6; i++) ring(gg, -380, 420, ((t * 160 + i * 170) % 1020), { w: 5, color: '#8fb8ff', alpha: 0.18 * (1 - ((t * 160 + i * 170) % 1020) / 1020) }); });
    M.view(g, cam, 1, (gg) => {
      ktext(gg, 'WHAT YOU HEAR', 60, -250, { size: 80, k: tw(t, T.thunder + 0.05, 0.55, E.lin), track: 4 });
      const k = tw(t, T.thunder + 0.2, 1.8, E.io2);
      lineChart(gg, -440, 290, 900, 440, RUMBLE, { k, color: PAL.yellow, xLabel: 'TIME', yLabel: 'LOUDNESS', w: 8 });
      label(gg, 'PEOPLE NEXT TO YOU', -60, -130, { k: tw(t, T.thunder + 0.45, 0.5, E.lin), leader: [-410, -110], size: 34, bg: '#ffffff' });
      label(gg, 'FARTHER + FARTHER AWAY', 170, 40, { k: tw(t, T.thunder + 1.1, 0.5, E.lin), leader: [230, 200], size: 34, bg: PAL.teal, color: PAL.ink });
    });
  }, { kind: 'wipe', dur: 0.45, color: PAL.yellow });
  // 8. New York's clap would take over 3 hours (a US map, the great-circle route drawing on)
  S(T.newyork, 'newyork', (g, t) => {
    const u = tw(t, T.newyork, 2.6, E.io2), cam = { x: lerp(160, -120, u), y: 40, z: lerp(1.0, 1.12, u) };
    M.sky(g, ['#10265e', '#0b1736']);
    M.view(g, cam, 3, (gg) => M.stars(gg, t, { n: 70, seed: 21, a: 0.45 }));
    const v = W.mapView({ lon0: -96, lat0: 38, scale: 23, cx: 540, cy: 960 });
    M.view(g, { ...cam, x: cam.x + 540, y: cam.y + 960 }, 1, (gg) => {
      W.map(gg, v, { codes: ['USA', 'CAN', 'MEX', 'CUB', 'GTM', 'BHS'], fill: { USA: '#35b98a' }, others: '#2c5d96', shadow: 26 });
      const a = W.mapXY(v, ...NYC), b = W.mapXY(v, ...LA), route = gcPts(NYC, LA, 60).map(([la, lo]) => W.mapXY(v, la, lo));
      line(gg, route, { w: 8, color: '#ffffff', dash: [20, 16], dashOff: -t * 30, k: tw(t, T.newyork + 0.2, 1.6, E.io2) });
      soundRings(gg, a[0], a[1], (t - T.newyork) % 1.0, { n: 2, speed: 50, max: 46, w: 5, color: PAL.yellow });
      pin(gg, a[0], a[1], 0.9, { color: PAL.red, shadow: 50 }); pin(gg, b[0], b[1], 0.9, { color: PAL.yellow, shadow: 50 });
      label(gg, 'NEW YORK', a[0] - 40, a[1] + 120, { k: tw(t, T.newyork + 0.1, 0.5, E.lin), size: 34, bg: '#ffffff' });
      label(gg, 'YOU', b[0] + 20, b[1] + 120, { k: tw(t, T.newyork + 0.4, 0.5, E.lin), size: 34, bg: PAL.yellow });
      label(gg, '3,959 KM', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 150, { k: tw(t, T.newyork + 1.2, 0.5, E.lin), size: 40, bg: '#1b2760', color: '#ffffff' });
    });
  }, { kind: 'zoom', dur: 0.45, x: 540, y: 900 });
  // 9. all that clapping: the energy in 60 gallons of gas (a unit chart of 60 cans) — and the sound is a sliver
  S(T.energy, 'energy', (g, t) => {
    const u = tw(t, T.energy, 3.0, E.io2), cam = { x: 0, y: lerp(20, -20, u), z: lerp(1.0, 1.04, u) };
    space(M, g, t, cam, { planets: false });
    M.view(g, cam, 1, (gg) => {
      ktext(gg, '60 GALLONS OF GAS', 40, -235, { size: 74, k: tw(t, T.energy + 0.1, 0.6, E.lin), track: 3 });
      for (let i = 0; i < 60; i++) { const c = i % 12, r = Math.floor(i / 12), k = E.back(tw(t, T.energy + 0.25 + i * 0.02, 0.32, E.lin), 1.6); if (k <= 0) continue;
        gg.save(); gg.translate(-451 + c * 82, -110 + r * 82); gg.scale(k, k); gascan(gg, 0, 34, 0.66, 1, { color: r % 2 ? PAL.red : '#ff6b5e' }); gg.restore(); }
      const k2 = tw(t, T.energy + 1.85, 0.5, E.lin);
      if (k2 > 0) { speaker(gg, -360, 300, 0.55 * E.back(k2), 1, { color: PAL.teal }); rrect(gg, -285, 288, 3 * E.out3(k2), 26, 1, { fill: PAL.teal, flat: true }); txt(gg, 'THE SOUND: UNDER 0.1 %', -262, 302, { size: 36, weight: 800, font: FONT.body, color: PAL.teal, align: 'left', alpha: k2, track: 2 }); }
    });
  }, { kind: 'slide', dur: 0.4, dir: 1 });
  // 10. minutes later… the seismograph: barely a blip
  S(T.later, 'later', (g, t) => seismo(g, t, { x: 0, y: 60, z: lerp(1.04, 1.1, tw(t, T.later, 1.6)) }), { kind: 'fade', dur: 0.35 });
  // 11. …why is every phone on the beach buzzing?
  S(T.buzz, 'buzz', (g, t) => {
    const u = tw(t, T.buzz, 2.5, E.io2), cam = { x: 0, y: lerp(160, 210, u), z: lerp(1.05, 1.32, u) };
    beach(M, g, t, cam, { sunX: 330, dusk: 0.25 });
    M.view(g, cam, 1, (gg) => {
      const on = (c) => clamp((t - T.buzz - 0.25 - c.d * 0.5) * 4);
      beachCrowd(gg, t, crowdB, (c) => ({ arms: phoneArms, look: [0, 0.8], mouth: 'o', open: 0.6, hold: (g2, hd, R) => { handPhone(g2, hd[0], hd[1] - R * 0.25, R * 0.75, on(c)); if (on(c) > 0.5) buzz(g2, hd[0], hd[1] - R * 0.25, R * 0.4, R, t + c.ph); } }));
      const h = hero.draw(gg, { x: 0, y: 610, s: 1.55, arms: phoneArms, look: [0, 0.9], eyes: 'wide', mouth: 'o', hold: (g2, hd, R) => { handPhone(g2, hd[0], hd[1] - R * 0.25, R * 0.8, on({ d: 0 })); buzz(g2, hd[0], hd[1] - R * 0.25, R * 0.4, R, t); } });
      markHead(h, 'hero');
    });
    beachFG(M, g, t, cam);
  }, { kind: 'zoom', dur: 0.45, x: 540, y: 1050 });
  // 12. every physics teacher on Earth just assigned the clap (your phone, notifications piling up)
  const TEACHERS = [['PHYSICS · MR. ALVAREZ', 'Problem Set 7: THE CLAP', '40 problems · handwritten', PAL.purple],
    ['PHYSICS · MS. OKAFOR', 'Homework: "The Clap"', 'Handwritten work only', PAL.blue], ['PHYSICS · DR. LINDQVIST', 'Problem set: 8.3B claps', 'Show ALL work. By hand.', PAL.teal],
    ['PHYSICS · MRS. TANAKA', 'Tonight: the clap (40)', 'Due 11:59 PM · by hand', PAL.orange], ['PHYSICS · MR. DIALLO', 'The clap: 40 problems', 'Handwritten only', PAL.pink]];
  S(T.teacher, 'teacher', (g, t) => {
    const u = tw(t, T.teacher, 2.85, E.io2);
    M.sky(g, ['#1b3a7a', '#0f2152']);
    M.view(g, { x: 0, y: 0, z: 1 }, 2, (gg) => { const R = rng(3); for (let i = 0; i < 14; i++) circle(gg, -700 + R() * 1400, -1000 + R() * 2000, 60 + R() * 140, { fill: PAL.shirts[i % 9], flat: true, alpha: 0.12 }); });
    const px = 680, py = 1040 + lerp(30, -10, u), pw = 520, sc = lerp(1, 1.04, u);
    g.save(); g.translate(px, py); g.scale(sc, sc); g.translate(-px, -py);
    phone(g, px, py, pw, { glow: 0.35, shadow: 120, screen: (gg, x0, y0, sw, sh) => {
      const bg = gg.createLinearGradient(0, y0, 0, y0 + sh); bg.addColorStop(0, '#3b6fd8'); bg.addColorStop(1, '#7a5cd6'); gg.fillStyle = bg; gg.fillRect(x0, y0, sw, sh);
      txt(gg, '11:02', x0 + sw / 2, y0 + 130, { size: 110, weight: 600, color: '#ffffff', shadow: false });
      TEACHERS.forEach((n, i) => note(gg, x0 + 18, y0 + 220 + i * (sw - 36) * 0.36, sw - 36, n[0], n[1], n[2], tw(t, T.teacher + 0.15 + i * 0.42, 0.45, E.lin), n[3]));
    } });
    g.restore();
  }, { kind: 'cut' });
  // 13. and yes, it's handwritten (the page lands, the stamp slams)
  S(T.handwritten, 'handwritten', (g, t) => {
    const u = tw(t, T.handwritten, 1.6, E.io2), cam = { x: 0, y: 0, z: lerp(1.02, 1.08, u) };
    M.sky(g, ['#163571', '#0d1c45']);
    M.view(g, cam, 1, (gg) => {
      sheet.draw(0);
      const y = lerp(700, -300, E.out3(tw(t, T.handwritten - 0.1, 0.45)));
      page(gg, 20, y, 780, -0.03);
      const k = tw(t, EV.stamp, 0.18, E.in2); if (k > 0) {
        const sc = lerp(2.2, 1, k); gg.save(); gg.translate(30, 60); gg.rotate(-0.12); gg.scale(sc, sc); gg.globalAlpha *= clamp(k * 1.5);
        rrect(gg, -390, -70, 780, 140, 22, { fill: 'rgba(255,250,240,0.55)', stroke: '#d0283a', lw: 14, flat: true }); txt(gg, 'HANDWRITTEN ONLY', 0, 4, { size: 62, weight: 800, font: FONT.body, color: '#d0283a', shadow: false, track: 3 }); gg.restore(); }
    });
  }, { kind: 'cut' });
  // 14. it's never the clap — it's the homework (you, a 40-page stack; then your phone: Scribe)
  S(T.never, 'never', (g, t) => {
    const u = tw(t, T.never, 1.2, E.io2), cam = { x: lerp(-40, 30, u), y: lerp(300, 280, u), z: lerp(1.12, 1.2, u) };
    beach(M, g, t, cam, { sunX: 330, dusk: 0.3 });
    M.view(g, cam, 1, (gg) => {
      beachCrowd(gg, t, crowdB, (c) => ({ arms: { L: { a: 0.2, e: 0.3 }, R: { a: 0.2, e: 0.3 } }, look: [c.x < 0 ? 0.8 : -0.8, 0.3], mouth: 'flat' }));
      rrect(gg, -470, 600, 520, 70, 12, { fill: PAL.pink, flat: true, alpha: 0.95 }); for (let i = 0; i < 5; i++) rrect(gg, -470 + i * 104, 600, 52, 70, 0, { fill: '#ffffff', flat: true, alpha: 0.35 });
      paperStack(gg, 230, 640, 230, Math.round(40 * tw(t, T.never, 0.9, E.out2)), { th: 9 });
      txt(gg, '× 40', 230, 640 - 9 * 40 - 50, { size: 54, weight: 600, alpha: tw(t, T.never + 0.6, 0.4, E.lin) });
      const h = hero.draw(gg, { x: -180, y: 640, s: 1.5, arms: phoneArms, look: [0.5, 0.7], eyes: 'half', mouth: 'frown', hold: (g2, hd, R) => handPhone(g2, hd[0], hd[1] - R * 0.25, R * 0.8, 1, { screen: '#f3f1eb', glow: '#ffd9c0' }) });
      markHead(h, 'hero');
    });
    // the phone insert: Scribe's home screen
    const k = tw(t, EV.app_home, 0.35, E.io3);
    if (k > 0) { g.save(); g.globalAlpha = k; M.sky(g, ['#163571', '#0d1c45']); g.restore();
      g.save(); g.globalAlpha = k; const y = lerp(1240, 1040, E.out3(k)); phone(g, 680, y, 470, { glow: 0.3, shadow: 120, bg: '#fbfaf6', screen: (gg, x0, y0, sw, sh) => scribeApp(gg, x0, y0 + sw * 0.11, sw, sh - sw * 0.11, { mode: 'home', icon, name: 'Sam' }) }); g.restore(); }
  }, { kind: 'cut' });
  // 15. so you snap one photo (Scribe's camera over the worksheet)
  S(T.photo, 'photo', (g, t) => {
    const u = tw(t, T.photo, 2.0, E.io2);
    M.sky(g, ['#f6dba4', '#e8b06a']);
    M.view(g, { x: 0, y: 0, z: lerp(1.0, 1.06, u) }, 1.3, (gg) => { sheet.draw(0); page(gg, -30, -620, 980, 0.06, 80); });
    phone(g, 680, 1040 + lerp(40, 0, E.out3(u)), 500, { shadow: 140, screen: (gg, x0, y0, sw, sh) => scribeApp(gg, x0, y0 + sw * 0.11, sw, sh - sw * 0.11, { mode: 'camera', k: tw(t, EV.shutter - 0.08, 0.3, E.lin), sheet, icon, name: 'Sam' }) });
    M.flash(g, 0.6 * env(t, EV.shutter, EV.shutter + 0.3, 0.04, 0.24));
  }, { kind: 'cut' });
  // 16. Scribe solves all 40 problems
  S(T.solve, 'solve', (g, t) => {
    const u = tw(t, T.solve, 2.4, E.io2);
    M.sky(g, ['#1b3a7a', '#0d1c45']);
    M.view(g, { x: 0, y: 0, z: 1 }, 2, (gg) => { for (let i = 0; i < 40; i++) { const k = clamp((t - EV.solve0) * 28 - i); if (k > 0) check(gg, -480 + (i % 8) * 137, -820 + Math.floor(i / 8) * 400 + (i % 2) * 120, 0.5, 1, { fill: mixc(PAL.green, '#1b3a7a', 0.45) }); } });
    const mode = t < EV.solve0 ? 'scan' : 'solve', k = mode === 'scan' ? tw(t, EV.scan0, EV.solve0 - EV.scan0, E.io2) : tw(t, EV.solve0, EV.solve1 - EV.solve0, E.lin);
    const sc = lerp(1, 1.05, u); g.save(); g.translate(680, 1060); g.scale(sc, sc); g.translate(-680, -1060);
    phone(g, 680, 1060, 580, { glow: 0.35, shadow: 140, bg: '#fbfaf6', screen: (gg, x0, y0, sw, sh) => scribeApp(gg, x0, y0 + sw * 0.11, sw, sh - sw * 0.11, { mode, k, sheet, icon, name: 'Sam' }) });
    g.restore();
  }, { kind: 'zoom', dur: 0.4, x: 680, y: 1040 });
  // 17. …and writes them in YOUR handwriting (the pen draws the figure + the dB working; the camera rides the nib)
  S(T.write, 'write', (g, t) => {
    const a = EV.write0, mid = a + 1.9, b = EV.write1;
    const p = t < mid ? P1 * E.io2(tw(t, a, mid - a, E.lin)) : lerp(P1, sheet.total, E.io2(tw(t, mid, b - mid, E.lin)));
    const tip = sheet.draw(p), PW = 1250, sc = PW / sheet.w;
    const zoomOut = E.io3(tw(t, mid + 0.15, b - mid, E.lin));
    M.sky(g, ['#f6dba4', '#e8b06a']);
    const z = lerp(1.18, 0.66, zoomOut), cx = lerp(tip[0] * sc - PW / 2 + 40, 40, zoomOut), cy = lerp(tip[1] * sc - 120, 200 / 0.66, zoomOut);
    M.view(g, { x: cx, y: cy, z }, 1, (gg) => { page(gg, 0, 0, PW, 0, 120); if (t < b) pen(gg, tip[0] * sc - PW / 2, tip[1] * sc, 1.4); });
  }, { kind: 'cut' });
  // 18. you start a slow clap (the stack is done; the beach turns to look)
  S(T.slowclap, 'slowclap', (g, t) => {
    const u = tw(t, T.slowclap, 2.1, E.io2), cam = { x: 0, y: lerp(290, 320, u), z: lerp(1.1, 1.2, u) };
    beach(M, g, t, cam, { sunX: 330, dusk: 0.45 });
    M.view(g, cam, 1, (gg) => {
      beachCrowd(gg, t, crowdB, (c) => ({ arms: { L: { a: 0.2, e: 0.3 }, R: { a: 0.2, e: 0.3 } }, look: [c.x < 0 ? 0.8 : -0.8, 0.2], mouth: t > T.slowclap + 1.2 ? 'smile' : 'o', open: 0.5 }));
      paperStack(gg, 300, 640, 220, 40, { th: 9 }); check(gg, 300, 640 - 9 * 40 - 70, 0.9, tw(t, T.slowclap, 0.5, E.lin));
      const h = hero.draw(gg, { x: -60, y: 640, s: 1.55, arms: clapArms(clapCycle(t, EV.slow0 - 0.3, 1.15)), eyes: 'happy', mouth: 'grin', bob: 0.04 * Math.sin(t * 7) });
      markHead(h, 'hero');
      if (t > EV.slow0) soundRings(gg, -60, 640 - 2.55 * 62, (t - EV.slow0) % (1 / 1.15), { n: 2, speed: 420, max: 260, w: 6 });
    });
    beachFG(M, g, t, cam);
  }, { kind: 'zoom', dur: 0.45, x: 540, y: 900 });
  // 19. everyone joins in (the beach, then the planet lights up again — a wave spreading out from you)
  S(T.joins, 'joins', (g, t) => {
    const u = tw(t, T.joins, 1.0, E.io2), cam = { x: 0, y: 160, z: lerp(1.0, 1.06, u) };
    beach(M, g, t, cam, { sunX: 330, dusk: 0.55 });
    M.view(g, cam, 1, (gg) => beachCrowd(gg, t, crowd, (c) => ({ arms: clapArms(clapCycle(t, EV.join0 + c.d * 0.3 + (c.i % 5) * 0.06, 2.3)), eyes: 'happy', mouth: 'grin', bob: 0.05 * Math.abs(Math.sin(t * 7 + c.ph)) })));
    M.view(g, cam, 1, (gg) => { for (const c of crowd.slice(-12)) if (t > EV.join0 + c.d * 0.3) soundRings(gg, c.x, c.y - 100 * c.s, (t - EV.join0) % 0.45, { n: 1, speed: 500, max: 200, w: 5, a: 0.6 }); });
    beachFG(M, g, t, cam);
    confetti(g, 540, 1500, t - EV.join0 - 0.2, { n: 70, v: 1700 });
  }, { kind: 'cut' });
  S(T.joins + 0.95, 'joinsGlobe', (g, t) => {
    const a = t - (T.joins + 0.95), cam = { x: 0, y: 0, z: lerp(1.2, 1.05, E.out3(a / 1.0)) };
    space(M, g, t, cam);
    M.view(g, cam, 1, (gg) => {
      const v = { lat0: 22, lon0: -110 + a * 10 }, lp = W.project(LA[0], LA[1], v);
      W.globe(gg, 0, 30, 430, { ...v, dots: 1, dotSize: 1.2, dotFn: (d, i, p) => { const dd = Math.acos(clamp(p[0] * lp[0] + p[1] * lp[1] + p[2] * lp[2], -1, 1)); return clamp((a * 2.6 + 0.4 - dd) * 3) * (0.8 + 0.4 * Math.sin(i + t * 9)); } });
    });
  }, { kind: 'zoomout', dur: 0.4, x: 540, y: 1100 });
  // 20. here's the second clap, slowed down
  S(T.slowmo, 'slowmo', (g, t) => {
    const u = tw(t, T.slowmo, 2.5, E.io2), cam = { x: lerp(-15, 15, u), y: 175, z: lerp(1.12, 1.2, u) };
    beach(M, g, t, cam, { sunX: 300, dusk: 0.65 });
    M.view(g, cam, 1, (gg) => beachCrowd(gg, t, crowd, (c) => ({ arms: c.i % 3 ? { L: { a: 2.6, e: 0.2 }, R: { a: 2.6, e: 0.2 } } : clapArms(0.4 + 0.2 * Math.sin(t * 3 + c.i)), eyes: 'happy', mouth: 'grin', bob: 0.03 * Math.sin(t * 2 + c.ph) })));
    beachFG(M, g, t, cam);
    const k = t < EV.mo_clap ? E.in2(tw(t, T.slowmo, EV.mo_clap - T.slowmo, E.lin)) : 1 - 0.25 * E.out3(tw(t, EV.mo_clap + 0.2, 0.8, E.lin));
    const sh = shake(); g.save(); g.translate(sh.x, sh.y); drawHandsPOV(g, k, { rise: 470, spread: 300, sleeve: PAL.blue }); g.restore();
    if (t >= EV.mo_clap) { const a = (t - EV.mo_clap) * 0.4; burst(g, 540, 1410, a, { r: 340, n: 16, w: 18, dur: 0.42 }); soundRings(g, 540, 1410, a, { n: 6, gap: 0.05, speed: 2200, max: 2000, w: 22 }); confetti(g, 540, 1400, (t - EV.mo_clap) * 0.5, { n: 90, v: 1900, seed: 4 }); M.flash(g, 0.35 * (1 - tw(t, EV.mo_clap, 0.4, E.lin))); }
  }, { kind: 'zoom', dur: 0.4, x: 540, y: 960 });
  // 21. the end card (≥ 3.5 s readable): the original's last fact on top, then Scribe
  S(T.end, 'end', (g, t) => drawEndCard(M, g, icon, t - T.end, { t, top: ['A CLAP FROM THE FAR SIDE OF EARTH', 'WOULD TAKE 16 HOURS TO REACH YOU'], topY: 230 }), { kind: 'fade', dur: 0.35 });

  // the dashed street-map + zoom transitions need the source point of the first zoom
  SHOTS[1].tr = { kind: 'zoom', dur: 0.5, x: laOnGlobe[0], y: laOnGlobe[1], scale: 4 };
  SHOTS.sort((a, b) => a.t0 - b.t0);

  function update(t) { M.render(t, SHOTS); TXT.update(t); }
  window.EDSTUDIO_QC = () => M.qc(update, story);
  return { update };
}
