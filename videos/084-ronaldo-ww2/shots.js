// 084 — Scribe promo, f-word explainer series: "Could Cristiano Ronaldo end World War II?" Narrated by the Fish "chinese" voice
// (user's pick, Nov 10). A toon footballer (plain red/white kit, a 7 on the back, no crest, no logo, no catchphrase) falls out
// of a time tunnel into a 1944 Normandy field and tries to end the war with football. Every attempt is checked with a real
// number and fails: Plan A, a free kick over a wall of generic grey toon soldiers (blank helmets) at the bombers — his hardest
// shots ~130 km/h = 36 m/s, straight up that peaks at v²/2g ≈ 66 m, the bombers fly ~7.5 km up (the camera rises the whole way),
// and the ball comes back down on his teammate Gary. Plan B, outrun the tanks: his top sprint 34 km/h vs a Sherman's ~40 km/h,
// he gets lapped. Plan C, a V-2 at ~5,700 km/h vs his record 2.56 m header and a bicycle kick: nothing in 1944 could stop a V-2.
// Pivot (~53 %): Derek's physics homework in 2026 is this exact projectile problem, handwritten → Scribe on his phone: one photo,
// solved, and the page written ON SCREEN in his handwriting with the kick's trajectory drawn by the pen (never pen on paper).
// Then the honest answer: no. On D-Day (June 6, 1944) about 156,000 Allied troops landed in one day = ~14,000 football teams;
// that's who won it. Warm button: the victory party (May 1945), where he's the best player in the street. End card.
// Guardrails (manager brief): no Holocaust/genocide references, no deaths or casualties as a joke, no Nazi symbols, salutes,
// leaders or names; the other side = generic grey toons with blank helmets; jokes stay on football physics.
// Numbers (sources in caption.md): ~129–132 km/h reported for his hardest free kicks; 2.56 m header height (Sky Italia /
// Juventus, Sampdoria 2019); 33.98 ≈ 34 km/h top sprint (FIFA, World Cup 2018 vs Spain); USAAF heavy bombers flew 20,000–30,000 ft
// (B-17 ~25,000 ft ≈ 7.6 km); M4 Sherman 35–48 km/h on road (~40); V-2 max ~5,760 km/h, no defence once launched; D-Day 156,000
// Allied troops (National WWII Museum). 156,000 / 11 = 14,182 teams. Worksheet: 130 km/h = 36 m/s; h = v²/2g = 1296/19.6 = 66 m;
// at 45°: R = v²/g = 132 m, H = R/4 = 33 m.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, smooth, mk } from '@engine/core.js';
import { beatClock, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeCrowd } from '@engine/build/brprops.js';
import { loadHand, loadImg, makeSheet } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { buildNormandy, buildBeach, buildRoom, makeBomber, makeSherman, makeV2, makeTrail, makeBall, makeHelmet, makePortal, makePhone, tex, D as WD } from '@engine/build/ww2.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const pw = (tt, keys) => { if (tt <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) if (tt < keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], (tt - keys[i][0]) / (keys[i + 1][0] - keys[i][0])); return keys[keys.length - 1][1]; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"', '30px Georgia'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------------------------------------------------------------- word times (everything keys to the narration)
  const t = {
    could: W('hook', 'could'), we: W('hook', 'we'), sent: W('hook', 'sent'), y1944: W('hook', '1944'),
    planA: W('kick', 'plan'), bombers1: W('kick', 'bombers'), his1: W('kick', 'his'), hit: W('kick', 'hit'), k130: W('kick', '130'),
    the1: W('high', 'the'), seven: W('high', 'seven'), up: W('high', 'up'), ball: W('high', 'ball'), sixty: W('high', 'sixtysix'), and1: W('high', 'and', 2), gary: W('high', 'gary'),
    planB: W('tank', 'plan'), tanks: W('tank', 'tanks'), his2: W('tank', 'his'), a1: W('tank', 'a'), sherman: W('tank', 'sherman'), he: W('tank', 'he'), lapped: W('tank', 'lapped'), tank: W('tank', 'tank'),
    planC: W('v2', 'plan'), rocket: W('v2', 'rocket'), fifty: W('v2', 'fiftyseven'), his3: W('v2', 'his'), header: W('v2', 'header'), two: W('v2', 'two'), meters: W('v2', 'meters'),
    nothing: W('stop', 'nothing'), definitely: W('stop', 'definitely'), bicycle: W('stop', 'bicycle'), kick2: W('stop', 'kick'),
    back: W('hw', 'back'), derek1: W('hw', 'derek'), physics: W('hw', 'physics'), handwritten: W('hw', 'handwritten'), derek2: W('hw', 'derek', 2), cooked: W('hw', 'cooked'),
    so1: W('scribe', 'so'), scribe: W('scribe', 'scribe'), one: W('scribe', 'one'), photo: W('scribe', 'photo'), it1: W('scribe', 'it'), solves: W('scribe', 'solves'), draws: W('scribe', 'draws'), trajectory: W('scribe', 'trajectory'), handwriting: W('scribe', 'handwriting'),
    so2: W('answer', 'so'), no: W('answer', 'no'), fno: W('answer', 'fucking'),
    on: W('dday', 'on'), hundred: W('dday', 'hundred'), troops: W('dday', 'troops'), thats1: W('dday', 'thats'), fourteen: W('dday', 'fourteen'), teams: W('dday', 'teams'),
    thats2: W('party', 'thats'), ronaldo: W('party', 'ronaldo'), victory: W('party', 'victory'), partyW: W('party', 'party'),
  };
  const LASTW = story.beats.party.w[story.beats.party.w.length - 1][2];
  const ENDCARD = LASTW + 0.45;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the worksheet: PHYSICS · PROJECTILE MOTION (Derek's)
  const curveTag = [];
  const sheet = makeSheet(G, { seed: 84, rich: true, name: 'Derek', title: 'PHYSICS · PROJECTILE MOTION', note: 'Due Friday  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 2', qFont: '500 27px Georgia, serif', qLineH: 35, problems: [
    { q: '1.  A football is kicked straight up at 36 m/s (130 km/h).\n     How high does it go? (g = 9.8 m/s²)', a: 'h = v^2/2g = 66 m', at: [120, 112], au: 34, h: 0.62 },
    { q: '2.  A free kick leaves at 36 m/s, 45° up. Sketch the\n     trajectory. Find the range R and max height H.', h: 1.38,
      fig: ({ k, y, h }) => {
        const x0 = 150, x1 = 590, gy = y + h - 110, apex = 200, out = [];
        out.push(...k.line([x0 - 30, gy], [x1 + 40, gy + 2], { bow: 0.01 }));
        const pts = []; for (let i = 0; i <= 28; i++) { const u = i / 28, X = lerp(x0, x1, u); pts.push([X + k.J(1.2), gy - apex * 4 * u * (1 - u) + k.J(1.2)]); }
        const curve = k.poly(pts, { line: 4.4 }); curve.forEach((c) => (c.tag = 'curve')); out.push(...curve);
        out.push(...k.arrow([x0, gy], [x0 + 70, gy - 70], { head: 15 }));
        out.push(...k.text('v = 36 m/s', x0 - 10, gy - 96, { u: 22 }));
        out.push(...k.text('45°', x0 + 64, gy - 14, { u: 20 }));
        const mx = (x0 + x1) / 2; out.push(...k.dashed([mx, gy - apex], [mx, gy], { dash: 10, gap: 8 }));
        out.push(...k.text('H', mx + 12, gy - apex / 2 + 8, { u: 24 }));
        out.push(...k.arrow([mx - 20, gy + 34], [x0, gy + 34], { head: 11 }), ...k.arrow([mx + 20, gy + 34], [x1, gy + 34], { head: 11 }));
        out.push(...k.text('R', mx - 6, gy + 46, { u: 24 }));
        const r1 = k.text('R = v^2/g = 132 m', 640, y + 210, { u: 28 }), r2 = k.text('H = R/4 = 33 m', 640, y + 290, { u: 28 });
        out.push(...r1, ...r2, ...k.ring(r1, { pad: 8 }));
        return out;
      } },
  ] });
  const items = sheet.items, N = sheet.total;
  const cumAt = (pred) => { let a = 0, last = 0, first = null; for (const it of items) { if (pred(it) && first === null) first = a; a += it.kind === 'p' ? it.w : 1; if (pred(it)) last = a; } return [first ?? 0, last]; };
  const [C_P1a, C_P1b] = cumAt((it) => it.pi === 0), [C_CURVEa, C_CURVEb] = cumAt((it) => it.tag === 'curve');
  void curveTag;

  // ---------------------------------------------------------------- the Scribe app on a portrait phone (720 × 1540)
  const PW = 720, PH = 1540, pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
  const pg = pc.getContext('2d'), ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const PAGE = { x: 24, y: 236, w: 672 }; PAGE.h = PAGE.w * sheet.h / sheet.w;
  let phoneKey = '';
  function drawPhone(mode, k = 0, tt = 0) {
    const key = mode + ':' + Math.round(k * 60) + (mode === 'cam' ? ':' + Math.round(tt * 20) : '');
    if (key === phoneKey) return; phoneKey = key;
    const g = pg; g.fillStyle = CREAM; g.fillRect(0, 0, PW, PH);
    g.fillStyle = '#1d1d1d'; g.font = '600 30px Inter, Arial'; g.fillText('11:48', 40, 56); g.fillRect(PW - 96, 34, 52, 24); g.fillStyle = CREAM; g.fillRect(PW - 92, 38, 30, 16);
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 84, PW, 110); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 194, PW, 2);
    g.drawImage(icon, 30, 104, 70, 70); g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.fillText('Scribe', 112, 156);
    g.font = '600 28px Inter, Arial'; const chip = 'Physics', cw = g.measureText(chip).width + 44; g.fillStyle = '#e7f2e4'; g.beginPath(); g.roundRect(PW - cw - 30, 116, cw, 50, 25); g.fill(); g.fillStyle = '#2f7d46'; g.fillText(chip, PW - cw - 8, 151);
    const button = (x, y, w, h, text, on = true) => { g.fillStyle = on ? RED : '#d8d1c3'; g.beginPath(); g.roundRect(x, y, w, h, 22); g.fill(); g.fillStyle = '#fff'; g.font = '600 38px Inter, Arial'; g.textAlign = 'center'; g.fillText(text, x + w / 2, y + h / 2 + 13); g.textAlign = 'left'; };
    if (mode === 'home') {
      g.drawImage(icon, PW / 2 - 150, 330, 300, 300);
      g.fillStyle = '#1d1d1d'; g.font = '62px Georgia, serif'; g.textAlign = 'center'; g.fillText('Your homework,', PW / 2, 760); g.fillText('in your handwriting.', PW / 2, 840);
      g.fillStyle = '#6b665c'; g.font = '500 30px Inter, Arial'; g.fillText('Snap it. Solve it. Your hand.', PW / 2, 920); g.textAlign = 'left';
      button(80, 1010, PW - 160, 120, 'Take a photo'); button(80, 1160, PW - 160, 120, 'Upload a PDF', false);
    } else if (mode === 'cam') {
      g.fillStyle = '#121214'; g.fillRect(0, 196, PW, PH - 196);
      g.save(); g.translate(PW / 2, 760); g.rotate(-0.04); g.drawImage(sheet.canvas, -300, -388, 600, 776); g.restore();
      g.strokeStyle = '#ffffff'; g.lineWidth = 8; for (const [x, y, sx, sy] of [[70, 340, 1, 1], [PW - 70, 340, -1, 1], [70, 1180, 1, -1], [PW - 70, 1180, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 70); g.lineTo(x, y); g.lineTo(x + sx * 70, y); g.stroke(); }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(PW / 2, 1360, 70, 0, TAU); g.fill(); g.strokeStyle = '#121214'; g.lineWidth = 8; g.beginPath(); g.arc(PW / 2, 1360, 56, 0, TAU); g.stroke();
      if (k > 0) { g.fillStyle = `rgba(255,255,255,${clamp(1 - k) * 0.95})`; g.fillRect(0, 196, PW, PH - 196); }
    } else if (mode === 'solve') {
      g.save(); g.translate(60, 250); g.rotate(-0.03); g.drawImage(sheet.canvas, 0, 0, 300, 388); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(0, 0, 300, 388);
      const sy = 388 * clamp(k * 1.6); g.fillStyle = 'rgba(154,28,37,.16)'; g.fillRect(0, 0, 300, sy); g.fillStyle = RED; if (k < 0.62) g.fillRect(-6, sy - 3, 312, 6); g.restore();
      g.fillStyle = RED; g.font = '700 26px Inter, Arial'; g.fillText('PHYSICS · 2 PROBLEMS', 400, 290);
      const n = k > 0.92 ? 2 : k > 0.55 ? 1 : 0;
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.fillText(n >= 2 ? 'Both solved.' : 'Solving…', 400, 356); g.fillText(`${n}/2`, 400, 414);
      ['Kicked up', 'Trajectory'].forEach((lab, i) => { const x = 60 + i * 320, y = 720, done = i < n; g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(x, y, 280, 240, 24); g.fill();
        g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 110px Inter, Arial'; g.textAlign = 'center'; g.fillText(done ? '✓' : String(i + 1), x + 140, y + 160); g.font = '500 32px Inter, Arial'; g.fillStyle = done ? '#2f6e48' : '#6b665c'; g.fillText(lab, x + 140, y + 296); g.textAlign = 'left'; });
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(60, 1120, PW - 120, 26, 13); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(60, 1120, (PW - 120) * clamp(0.08 + k), 26, 13); g.fill();
    } else {   // write / done: the page in the app, writing itself, an on-screen pen cursor at the tip
      g.fillStyle = '#ffffff'; g.fillRect(PAGE.x - 4, PAGE.y - 4, PAGE.w + 8, PAGE.h + 8); g.drawImage(sheet.canvas, PAGE.x, PAGE.y, PAGE.w, PAGE.h);
      g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PAGE.x, PAGE.y, PAGE.w, PAGE.h);
      if (mode === 'write') {
        const tp = sheet.draw.tip, px = PAGE.x + tp[0] * PAGE.w / sheet.w, py = PAGE.y + tp[1] * PAGE.h / sheet.h;
        g.save(); g.translate(px, py); g.rotate(-0.6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(4, -76, 18, 80); g.fillStyle = '#1a1b20'; g.fillRect(-8, -84, 16, 70); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(-8, -14); g.lineTo(8, -14); g.lineTo(0, 4); g.closePath(); g.fill(); g.fillStyle = RED; g.fillRect(-8, -92, 16, 10); g.restore();
        g.fillStyle = 'rgba(154,28,37,.25)'; g.beginPath(); g.arc(px, py, 14, 0, TAU); g.fill();
      }
      const by = PAGE.y + PAGE.h + 40;
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.fillText(mode === 'done' ? 'Done. 2/2, your hand.' : 'Writing in your hand…', 40, by + 40);
      g.fillStyle = '#2f7d46'; g.font = '600 28px Inter, Arial'; g.fillText('Physics · diagrams drawn by hand', 40, by + 92);
      button(40, by + 130, PW - 80, 110, 'Download PDF', mode === 'done');
    }
    ptex.needsUpdate = true;
  }
  drawPhone('home');

  // ---------------------------------------------------------------- sets: Normandy (origin), the beach, Derek's room, the time tunnel
  const NM = await buildNormandy(studio); const NMfog = NM.fog;
  const BO = [6000, 0, 0], BC = buildBeach(studio); BC.root.position.set(...BO);
  const RM = [-6000, 0, 0], ROOM = buildRoom(studio); ROOM.root.position.set(...RM);
  const BW = (x, y, z) => [BO[0] + x, BO[1] + y, BO[2] + z], RW = (x, y, z) => [RM[0] + x, RM[1] + y, RM[2] + z];
  const TO = [0, 400, 9000];
  const tunnel = new THREE.Group(); scene.add(tunnel); tunnel.position.set(...TO);
  const tunT = tex(512, 1024, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2a0f6a'); gr.addColorStop(0.5, '#6a3fd8'); gr.addColorStop(1, '#2a0f6a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * w, y = (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1 * h, l = 40 + (i % 7) * 30; c.strokeStyle = ['rgba(255,255,255,.7)', 'rgba(170,220,255,.6)', 'rgba(255,170,240,.55)'][i % 3]; c.lineWidth = 2 + (i % 3); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + l); c.stroke(); } });
  tunT.wrapS = tunT.wrapT = THREE.RepeatWrapping; tunT.repeat.set(3, 4);
  { const cyl = mk(new THREE.CylinderGeometry(5, 5, 160, 48, 1, true), new THREE.MeshBasicMaterial({ map: tunT, side: THREE.BackSide, toneMapped: false, fog: false }), tunnel, 0, 0, -60); cyl.rotation.x = PI / 2; cyl.castShadow = false;
    const end = makePortal(4.6); tunnel.add(end.g); end.g.position.set(0, 0, -139); end.set(0, 1); tunnel.userData.end = end;
    tunnel.add(new THREE.HemisphereLight(0xd8c8ff, 0x5a3aa0, 1.6)); const pl = new THREE.PointLight(0xc8a8ff, 30, 30, 1.5); pl.position.set(0, 2, 4); tunnel.add(pl); }
  // the lookout mound on the beach (Ronaldo + Gary watch the landing from it)
  const MOUND = [36, 0, -18];
  { const m = mk(new THREE.CylinderGeometry(5.2, 6.4, 1.4, 28), std(0xc9b48a, 0.95), BC.root, MOUND[0], 0.7, MOUND[2]); m.castShadow = false; const gt = mk(new THREE.CircleGeometry(5.15, 28), std(0x8aa45a, 0.95), BC.root, MOUND[0], 1.41, MOUND[2]); gt.rotation.x = -PI / 2; }
  const MY = 1.41;

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const RS = 1.3, GS = 1.15;
  const ron = mk1({ skin: 0xd8a273, shirt: 0xd8262e, pants: 0xf6f6f2, shoes: 0x141416, hair: 0x1d1612, hairStyle: 'side', browScale: 1.1 });
  { const sock = std(0xd8262e, 0.8); for (const leg of [ron.legL, ron.legR]) { const shin = leg.el.children.find((c) => c.isMesh && c.geometry.type === 'CapsuleGeometry'); if (shin) shin.material = sock; }
    const torso = ron.armL.g.parent;
    const seven = mk(new THREE.PlaneGeometry(0.17, 0.17), new THREE.MeshStandardMaterial({ map: tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.font = '220px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeStyle = '#7a0d12'; c.strokeText('7', w / 2, h / 2 + 14); c.fillStyle = '#fff'; c.fillText('7', w / 2, h / 2 + 14); }), transparent: true, roughness: 0.7 }), torso, 0, 0.2, -0.149);
    seven.rotation.y = PI; seven.castShadow = false;
    const collar = mk(new THREE.TorusGeometry(0.075, 0.016, 6, 20), std(0xffffff, 0.7), torso, 0, 0.39, 0.0); collar.rotation.x = PI / 2;
    const quiff = mk(new THREE.SphereGeometry(0.13, 16, 10), ron.M.hair, ron.head, 0.02, 0.25, 0.1); quiff.scale.set(1.5, 0.55, 1.0); quiff.rotation.set(-0.35, 0, -0.15); }
  const gary = mk1({ shirt: 0x6f7a44, pants: 0x5b6438, hair: 0x6b3f22, hairStyle: 'side', skin: 0xf2c29a, browScale: 1.2 });
  const garyHelm = makeHelmet('allied'); gary.head.add(garyHelm); garyHelm.position.set(0, 0.03, 0);
  const plaster = new THREE.Group(); gary.head.add(plaster); plaster.position.set(-0.13, 0.0, 0.235); plaster.rotation.set(0, -0.45, 0.3);
  { const pm = std(0xf2e6d0, 0.7); mk(new THREE.BoxGeometry(0.13, 0.04, 0.015), pm, plaster); mk(new THREE.BoxGeometry(0.04, 0.13, 0.015), pm, plaster); }
  const ENEMY_SKIN = [0xf2c29a, 0xe0a97e, 0xf6d2b0, 0xc68863, 0xe8b48a];
  const enemies = ENEMY_SKIN.map((skin, i) => { const e = mk1({ shirt: 0x7a8088, pants: 0x676d74, hair: [0x3a2a1c, 0xd8a55a, 0x6b3f22, 0x1a1a1a, 0x8a5a2b][i], hairStyle: 'side', skin, browScale: 1.15 }); const h = makeHelmet('blank'); e.head.add(h); h.position.set(0, 0.03, 0); return e; });
  const derek = mk1({ shirt: 0x3a7bd5, pants: 0x2f3e5a, hair: 0x2b1d14, hairStyle: 'messy', skin: 0xc68863 });
  const PARTY = [
    { shirt: 0x6f7a44, pants: 0x5b6438, hair: 0x2b1d14, hairStyle: 'side', skin: 0x9c6644, helm: true },
    { shirt: 0x6f7a44, pants: 0x5b6438, hair: 0xd8a55a, hairStyle: 'side', skin: 0xf6d2b0, helm: true },
    { shirt: 0xe8d8b8, pants: 0x5a4a3a, hair: 0xe8e8e8, hairStyle: 'side', skin: 0xf2c29a, beard: true },
    { shirt: 0xd96aa0, pants: 0x3d4250, hair: 0x6b3f22, hairStyle: 'side', skin: 0xe0a97e },
    { shirt: 0x3fb0c9, pants: 0x34495e, hair: 0xd8a55a, hairStyle: 'tuft', skin: 0xf6d2b0, kid: true },
    { shirt: 0xf2d232, pants: 0x4a3a2a, hair: 0x2b1d14, hairStyle: 'messy', skin: 0x7a4a2e, kid: true },
    { shirt: 0xe2574c, pants: 0x34495e, hair: 0x8a5a2b, hairStyle: 'tuft', skin: 0xe8b48a, kid: true },
  ].map((o) => { const r = mk1(o); if (o.helm) { const h = makeHelmet('allied'); r.head.add(h); h.position.set(0, 0.03, 0); } if (o.kid) r.head.scale.setScalar(1.1); r.userData = o; return r; });
  const people = [ron, gary, ...enemies, derek, ...PARTY];
  const ball = makeBall(0.11 * RS); scene.add(ball);
  const ballTrail = Array.from({ length: 6 }, (_, i) => { const m = mk(new THREE.SphereGeometry(0.11 * RS, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 - i * 0.04, depthWrite: false }), scene); m.castShadow = false; return m; });
  const dizzy = makeDizzy(scene, { r: 0.36, n: 5, size: 0.08 });
  const portal = makePortal(1.5); scene.add(portal.g);
  const tunBall = makeBall(0.11 * RS); tunnel.add(tunBall);
  // beach troops (instanced toon crowd, olive + helmets) and the party crowd
  const troops = makeCrowd(BC.root, 900, { seed: 84, shirt: 0x6f7a44 });
  { const C = new THREE.Color(); troops.people.forEach((p, i) => { p.bald = false; troops.meshes.hair.setColorAt(i, C.setHex(0x55603a)); for (const k of [0, 1]) troops.meshes.leg.setColorAt(i * 2 + k, C.setHex(0x5b6438)); troops.meshes.pelvis.setColorAt(i, C.setHex(0x5b6438)); }); }
  const TR = troops.people.map((p, i) => { const h = (a) => { const s = Math.sin(i * 12.9898 + a * 78.233) * 43758.5453; return s - Math.floor(s); };
    return { x: -70 + h(1) * 140, z: 50 - h(2) * 80, ph: h(3) * TAU, sp: 1.1 + h(4) * 0.6, rot: PI + (h(5) - 0.5) * 0.5 }; });
  const pcrowdA = makeCrowd(NM.party, 18, { seed: 85, shirt: 0xd86a4a }), pcrowdB = makeCrowd(NM.party, 18, { seed: 86, shirt: 0x5b7fb5 });

  // ---------------------------------------------------------------- vehicles + rockets + bombers
  const sherman = makeSherman(); scene.add(sherman.g);
  const realB = Array.from({ length: 6 }, () => { const b = makeBomber(); scene.add(b.g); return b; });
  const skyB = Array.from({ length: 9 }, () => { const b = makeBomber(0x3e4248); b.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.fog = false; o.castShadow = false; } }); b.g.scale.setScalar(7); scene.add(b.g); return b; });
  const contrails = skyB.map(() => { const g = new THREE.Group(); scene.add(g); for (const z of [-60, -25, 25, 60]) { const c = mk(new THREE.BoxGeometry(900, 7, 7), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, fog: false, depthWrite: false }), g, -480, -2, z); c.castShadow = false; } return g; });
  const v2sky = makeV2(); v2sky.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.fog = false; } }); v2sky.g.scale.setScalar(11); scene.add(v2sky.g);
  const v2real = makeV2(); scene.add(v2real.g);
  const trailSky = makeTrail(scene, 170, 0xf4f6fa); trailSky.list.forEach((s) => (s.material.fog = false));
  const trailReal = makeTrail(scene, 70);
  const speedPuffs = makeTrail(scene, 60, 0xffffff);
  // the 2.56 m measuring pole (the header beat)
  const pole = new THREE.Group(); scene.add(pole);
  { const st = tex(64, 512, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#1d1d1d' : '#ffd23f'; c.fillRect(0, i * h / 16, w, h / 16); } });
    mk(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 10), new THREE.MeshStandardMaterial({ map: st, roughness: 0.5 }), pole, 0, 1.6, 0);
    const bar = mk(new THREE.BoxGeometry(1.5, 0.035, 0.035), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb300, emissiveIntensity: 0.6 }), pole, 0.75, 2.56, 0); bar.castShadow = false; pole.userData.bar = bar; }
  // Derek's desk: the printed worksheet (questions only) + the phone + the HANDWRITTEN stamp imprint
  const deskSheet = mk(new THREE.PlaneGeometry(0.27, 0.27 * sheet.h / sheet.w), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 }), scene); deskSheet.rotation.x = -PI / 2; deskSheet.castShadow = false;
  const SHEETP = RW(-0.15, 0.786, -1.55); deskSheet.position.set(...SHEETP); deskSheet.rotation.z = 0.06;
  const imprint = mk(new THREE.PlaneGeometry(0.2, 0.06), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), scene);
  imprint.rotation.set(-PI / 2, 0, 0.22); imprint.position.set(SHEETP[0] + 0.02, SHEETP[1] + 0.002, SHEETP[2] + 0.07);
  const phone = makePhone(ptex); scene.add(phone.g);
  const povHands = new THREE.Group(); scene.add(povHands);   // his two hands round the phone (the POV shots hide his rig)
  for (const sx of [-1, 1]) { const hg = new THREE.Group(); povHands.add(hg); hg.position.set(sx * 0.047, -0.07, -0.01); const m = mk(new THREE.SphereGeometry(0.027, 16, 12), derek.M.skin, hg); m.scale.set(0.8, 1.15, 0.9); const th = mk(new THREE.CapsuleGeometry(0.008, 0.028, 4, 8), derek.M.skin, hg, -sx * 0.012, 0.03, 0.014); th.rotation.z = sx * 0.25; mk(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 12), derek.M.skin, hg, sx * 0.01, -0.08, 0.07).rotation.x = -0.78; }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flash.scale.setScalar(0.35); scene.add(flash);
  const confettiOn = (tt) => tt > t.thats2 - 0.2;

  // ---------------------------------------------------------------- times + physics
  const KICK = t.k130 - 0.02;                                  // the free kick hits on "130"
  const LAND = t.gary;                                          // ...and lands on Gary on "Gary"
  const BALL0 = [0, 0.11 * RS, -0.42], GARYP = [2.0, 0, 0.85], VUP = 36, TAU_LAND = 7.3;
  const TK = [[KICK, 0], [t.the1, 2.55], [t.up, 3.35], [t.and1, 4.1], [LAND, TAU_LAND]];   // physics clock: slow hang at the top, fast fall
  const ballAt = (tt) => {
    if (tt < KICK) return [...BALL0];
    if (tt <= LAND) { const tau = pw(tt, TK); return [BALL0[0] + (GARYP[0] - BALL0[0]) * tau / TAU_LAND, BALL0[1] + VUP * tau - 4.9 * tau * tau, BALL0[2] + (GARYP[2] - BALL0[2]) * tau / TAU_LAND]; }
    const a = tt - LAND, y = 1.76 + 4.2 * a - 4.9 * a * a; return [GARYP[0] + 1.6 * a, Math.max(0.14, y), GARYP[2] + 1.9 * a];
  };
  // the race: GO on "tanks"; Ronaldo 34 km/h = 9.44 m/s, the tank a bit faster (it passes him on "Sherman")
  const GO = t.tanks, VR = 9.44, VT = 12.2, TANK0 = -9.5, RZ = WD.roadZ - 1.6, TZ = WD.roadZ + 0.9;
  const STOP0 = t.lapped + 0.15;
  const ronX = (tt) => { if (tt < GO) return 0; const a = Math.min(tt, STOP0) - GO; let x = VR * a; if (tt > STOP0) { const b = Math.min(tt - STOP0, 0.9); x += VR * b - VR * b * b / 1.8; } return x; };
  const tankX = (tt) => TANK0 + (tt < GO - 0.3 ? 0 : VT * (tt - GO + 0.3) - (tt < GO + 0.4 ? 0 : 0));
  // V-2 in the sky: a straight fast climb across the sky (×11 so it reads at ~3.5 km)
  const V2T0 = t.planC - 0.2, V2V = [1583, 140, 0];
  const v2skyAt = (tt) => [-2600 + V2V[0] * (tt - V2T0), 2300 + V2V[1] * (tt - V2T0), -2900];
  const V2C0 = t.fifty - 0.3;   // the chase: real scale, through the cloud layer
  const v2realAt = (tt) => [-900 + 1583 * (tt - V2C0), 2050 + 70 * (tt - V2C0), -420];
  // header + bicycle kick at the V-2 spot
  const VS = [-6, 0, 4];
  const JUMP0 = t.header - 0.12, JUMP1 = JUMP0 + 1.25;           // a long hang (his famous one)
  const BK0 = t.definitely - 0.05, BKHIT = t.kick2;
  // homework + Scribe
  const STAMP = t.handwritten + 0.04, FLASH = t.photo + 0.06, SOLVE0 = t.it1 - 0.05, SOLVE1 = t.draws - 0.12, WRITE0 = t.draws, WRITE1 = t.so2 - 0.32;
  const PK = [[WRITE0, 0], [WRITE0 + 0.42, C_P1b], [t.trajectory - 0.08, C_CURVEa], [t.trajectory + 0.5, C_CURVEb], [WRITE1, N]];
  const writeP = (tt) => pw(tt, PK);
  void C_P1a;

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 500, confetti: 700, spark: 300, glow: 60, smoke: 500, dirt: 300 }, nearFade: [0.3, 1.1] });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.1, 0.18);
  const LANDH = t.y1944 + 0.02;   // he lands out of the portal on "1944"
  kick(t.sent, 0.4); kick(LANDH, 1.0, 0.6);
  fx.burst('dust', LANDH, { pos: [0, 0.2, 0.6], n: 18, spread: 2.2, speed: [1.5, 4], size: [0.4, 1.0], color: 0xc9b48a });
  fx.burst('spark', t.sent + 0.05, { pos: [0, 2.0, -3.4], n: 40, color: 0xc8a8ff, speed: [2, 6], spread: 2.5 });
  kick(KICK, 1.0, 0.6); kick(KICK + 0.2, 0.4);
  fx.burst('dirt', KICK, { pos: [0, 0.1, -0.4], n: 26, dir: [0, 1, 0], spread: 0.8, speed: [2, 5], floor: 0 });
  fx.burst('dust', KICK, { pos: [0, 0.2, -0.3], n: 10, spread: 1.2, speed: [1, 3], size: [0.3, 0.7] });
  kick(t.seven, 0.3); kick(LAND, 1.1, 0.6); kick(LAND + 0.25, 0.4);
  fx.burst('spark', LAND, { pos: [GARYP[0], 1.75, GARYP[2]], n: 26, color: 0xffe08a, speed: [1, 3.5], spread: 1.6 });
  kick(GO, 0.6); kick(t.sherman, 0.5); kick(t.tank, 0.9);
  for (let k = 0; k < 40; k++) { const tt = GO + k * 0.11; if (tt > STOP0 + 0.5) break; fx.burst('dust', tt, { pos: [ronX(tt) - 0.3, 0.15, RZ], n: 2, spread: 0.4, speed: [0.5, 1.5], size: [0.25, 0.5], color: 0xb8946a, seed: 900 + k }); }
  for (let k = 0; k < 60; k++) { const tt = GO - 0.3 + k * 0.1; fx.burst('dust', tt, { pos: [tankX(tt) - 2.8, 0.3, TZ], n: 2, spread: 1.2, speed: [0.5, 2], size: [0.6, 1.3], color: 0xb8946a, seed: 1000 + k }); }
  for (let k = 0; k < 24; k++) { const tt = t.he - 0.1 + k * 0.07; fx.burst('smoke', tt, { pos: [tankX(tt) - 3.1, 1.3, TZ + 0.6], n: 3, dir: [-1, 0.2, -0.4], spread: 0.5, speed: [2, 4], size: [0.4, 0.8], color: 0x3a3a3a, life: [1.0, 1.6], seed: 1100 + k }); }
  kick(t.fifty, 0.6); kick(t.fifty + 0.4, 0.4);
  kick(JUMP0 + 0.05, 0.4); kick(t.two, 0.3);
  kick(BKHIT, 1.1, 0.6);
  fx.burst('dust', BKHIT, { pos: [VS[0], 0.2, VS[2]], n: 22, spread: 2.0, speed: [1.5, 4], size: [0.4, 1.0], color: 0xa8b878 });
  fx.burst('confetti', BKHIT, { pos: [VS[0], 0.2, VS[2]], n: 30, color: 0x6aa84a, speed: [1.5, 4], spread: 1.6, floor: 0 });
  kick(STAMP, 0.9); kick(t.cooked, 0.6);
  fx.stream('smoke', t.cooked - 0.25, t.so1 + 0.1, { pos: RW(-0.2, 1.75, -0.95), rate: 22, size: [0.08, 0.18], speed: [0.3, 0.8], spread: 0.3, life: [0.6, 1.0], g: -1.5, color: 0xcccccc });
  fx.burst('spark', STAMP, { pos: add(SHEETP, [0.02, 0.02, 0.07]), n: 16, color: 0xff6b6b, speed: [0.4, 1.2], spread: 1.4 });
  kick(FLASH, 0.35); kick(SOLVE1, 0.4); kick(t.trajectory, 0.3); kick(t.handwriting + 0.1, 0.4);
  kick(t.no, 0.8);
  fx.burst('dust', t.no + 0.05, { pos: [VS[0], 0.2, VS[2] - 0.4], n: 12, spread: 1.5, speed: [1, 3], size: [0.3, 0.8], color: 0xa8b878 });
  kick(t.hundred, 0.3); kick(t.fourteen, 0.4);
  kick(t.thats2, 0.3); kick(t.victory, 0.5);
  { const P = [WD.party[0], 4.5, WD.party[1] + 2]; for (let k = 0; k < 6; k++) fx.burst('confetti', t.thats2 - 0.2 + k * 0.9, { pos: [P[0] + (k % 3 - 1) * 3, P[1], P[2]], n: 60, speed: [1.5, 4], spread: 3, floor: 0, seed: 2000 + k }); }

  // ---------------------------------------------------------------- the end card (Scribe) via brhud (only its end card is used)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: null, day: [[0, '']], feed: [], end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- camera helpers
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const glide = (p0, l0, p1, l1, fov, t0, t1, fov1 = fov) => (tt) => { const u = smooth(u01(tt, t0, t1)); return { pos: L3(p0, p1, u), look: L3(l0, l1, u), fov: lerp(fov, fov1, u) }; };
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), scrQ = new THREE.Quaternion(), scrU = V(0, 0, 0), scrR = V(0, 0, 0);
  // a point on the phone screen in canvas px → world; and a camera straight down the screen's normal at distance d
  const phoneW = (px, py) => { phone.scr.updateWorldMatrix(true, false); return phone.scr.localToWorld(V((px / PW - 0.5) * 0.072, (0.5 - py / PH) * 0.154, 0)); };
  const screenCam = (px, py, d, fov = 34) => { phone.scr.updateWorldMatrix(true, false); phone.scr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const c = phoneW(px, py); scrP.copy(c).addScaledVector(scrN, d); return { pos: scrP.toArray(), look: c.toArray(), fov, up: scrU.toArray() }; };
  void scrR;

  // ---------------------------------------------------------------- SHOTS (hard cuts between framings; each glides)
  const SKY = { nm: true };
  const SHOTS = [
    // HOOK — the time tunnel, then out of the portal into a 1944 field
    { id: 'tun', t0: 0, set: 'tun', cam: (tt) => { const u = u01(tt, 0, t.we); return { pos: add(TO, [0.35 - 0.2 * u, 1.55, 3.3 - 0.9 * smooth(u)]), look: add(TO, [0, 1.08, 0]), fov: 46 }; } },
    { id: 'land', t0: t.we - 0.06, set: 'nm', far: 7000, cam: glide([5.6, 1.5, 6.4], [-0.2, 1.6, -3.2], [5.0, 1.45, 5.6], [-0.1, 1.55, -3.0], 50, t.we, t.planA) },
    // PLAN A — the wall, the free kick, the ball goes up
    { id: 'wall', t0: t.planA - 0.04, set: 'nm', far: 7000, cam: glide([0.75, 1.15, 3.6], [-0.1, 2.9, -9], [0.65, 1.05, 3.0], [-0.1, 3.1, -9], 52, t.planA, t.his1) },
    { id: 'face', t0: t.his1 - 0.05, set: 'nm', far: 7000, cam: (tt) => { const h = headW(ron); return { pos: [0.55, 1.62, -2.35], look: [h[0] * 0.6, h[1] - 0.12, h[2] * 0.6 + 0.2], fov: 46 }; } },
    { id: 'launch', t0: KICK + 0.07, set: 'nm', far: 7000, cam: (tt) => { const b = ballAt(tt), k = 1 + 0.045 * b[1]; return { pos: add(b, [1.5 * k, 1.9 * k, 2.3 * k]), look: add(b, [-0.35 * k, -1.6 * k, -1.2 * k]), fov: 56 }; } },
    // HIGH — the camera rises 7.5 km to the bombers; the ball hangs at 66 m; it lands on Gary
    { id: 'rise', t0: t.the1 - 0.04, set: 'nm', far: 9000, cam: (tt) => { const e = smooth(u01(tt, t.the1, t.up - 0.25)), y = 40 * Math.pow(7500 / 40, e), pitch = lerp(1.25, 0.05, smooth(u01(tt, t.the1 + 0.6, t.up - 0.2)));
      const pos = [3.5, y, 2.0]; return { pos, look: [pos[0] - Math.cos(pitch) * 10 * 0.35, y + Math.sin(pitch) * 10, pos[2] - Math.cos(pitch) * 10], fov: 56 }; } },
    { id: 'apex', t0: t.up - 0.04, set: 'nm', far: 3000, cam: (tt) => { const b = ballAt(tt), u = u01(tt, t.up, t.and1); return { pos: add(b, [1.1 + 0.3 * u, 1.45, 1.35 + 0.3 * u]), look: add(b, [-0.55, -2.2, -0.75]), fov: 52 }; } },
    { id: 'bonk', t0: t.and1 - 0.04, set: 'nm', far: 3000, cam: glide([2.2, 1.5, -1.45], [2.0, 1.62, 0.85], [2.18, 1.48, -1.3], [2.0, 1.62, 0.85], 54, t.and1, t.planB) },
    // PLAN B — the race against the Sherman
    { id: 'start', t0: t.planB - 0.04, set: 'nm', far: 3000, cam: glide([9.5, 1.0, WD.roadZ - 2.6], [-4.0, 1.3, WD.roadZ - 1.2], [8.6, 0.95, WD.roadZ - 2.6], [-4.0, 1.25, WD.roadZ - 1.2], 44, t.planB, t.his2) },
    { id: 'run', t0: t.his2 - 0.04, set: 'nm', far: 3000, cam: (tt) => { const x = ronX(tt); return { pos: [x + 0.8, 1.35, RZ - 4.6], look: [x - 0.1, 1.25, RZ], fov: 50 }; } },
    { id: 'pass', t0: t.a1 - 0.04, set: 'nm', far: 3000, cam: (tt) => { const x = (ronX(tt) + tankX(tt)) / 2; return { pos: [x + 1.2, 1.9, RZ - 8.2], look: [x - 0.3, 0.75, WD.roadZ], fov: 50 }; } },
    { id: 'lapped', t0: t.he - 0.04, set: 'nm', far: 3000, cam: (tt) => { const x = ronX(tt); return { pos: [x + 3.6, 1.45, RZ - 1.9], look: [x, 0.95, RZ], fov: 48 }; } },
    // PLAN C — the V-2: in the sky, the chase, the header, the bicycle kick
    { id: 'sky', t0: t.planC - 0.04, set: 'nm', far: 7000, cam: glide([VS[0] + 1.1, 0.75, VS[2] + 2.6], [VS[0] - 2.0, 4.6, VS[2] - 8], [VS[0] + 1.0, 0.7, VS[2] + 2.3], [VS[0] - 1.4, 5.2, VS[2] - 8], 54, t.planC, t.fifty) },
    { id: 'chase', t0: t.fifty - 0.06, set: 'nm', far: 7000, cam: (tt) => { const r = v2realAt(tt), u = u01(tt, t.fifty, t.his3); return { pos: add(r, [-4 - 6 * u, 3.5, 17 - 2 * u]), look: add(r, [4, 0.5, 0]), fov: 50 }; } },
    { id: 'header', t0: t.his3 - 0.05, set: 'nm', far: 7000, cam: (tt) => { const u = smooth(u01(tt, t.his3, t.nothing)), hy = headW(ron)[1]; return { pos: [VS[0] + lerp(3.9, 3.6, u), 1.55 + 0.4 * (hy - 1.45), VS[2] + lerp(2.4, 2.2, u)], look: [VS[0] - 0.2, hy - 0.42, VS[2]], fov: 50 }; } },
    { id: 'gone', t0: t.nothing - 0.05, set: 'nm', far: 7000, cam: glide([VS[0] + 9, 1.2, VS[2] + 14], [VS[0] - 6, 21, VS[2] - 30], [VS[0] + 8, 1.4, VS[2] + 12.5], [VS[0] - 5, 23, VS[2] - 30], 58, t.nothing, t.definitely) },
    { id: 'bike', t0: t.definitely - 0.05, set: 'nm', far: 3000, cam: glide([VS[0] + 3.4, 1.0, VS[2] + 1.8], [VS[0] - 0.1, 1.15, VS[2]], [VS[0] + 3.1, 0.9, VS[2] + 1.6], [VS[0] - 0.1, 0.9, VS[2]], 52, t.definitely, t.back) },
    // 2026 — Derek's homework
    { id: 'room', t0: t.back - 0.04, set: 'rm', cam: glide(RW(1.55, 1.75, 1.1), RW(-0.3, 1.0, -1.45), RW(1.25, 1.65, 0.75), RW(-0.3, 1.0, -1.45), 50, t.back, t.physics) },
    { id: 'sheet', t0: t.physics - 0.05, set: 'rm', cam: glide(add(SHEETP, [0.0, 0.5, 0.26]), add(SHEETP, [0, 0, 0.005]), add(SHEETP, [0.0, 0.42, 0.21]), add(SHEETP, [0, 0, 0.0]), 44, t.physics, t.derek2) },
    { id: 'cooked', t0: t.derek2 - 0.05, set: 'rm', cam: (tt) => { const h = headW(derek), u = u01(tt, t.derek2, t.so1); return { pos: [h[0] + 1.2 - 0.1 * u, h[1] + 0.12, h[2] - 0.98 + 0.03 * u], look: [h[0] + 0.05, h[1] - 0.2, h[2] - 0.05], fov: 46 }; } },
    // SCRIBE — on his phone, written ON SCREEN
    { id: 'open', t0: t.so1 - 0.04, set: 'rm', cam: (tt) => { const c = phoneW(PW / 2, PH * 0.5).toArray(), u = smooth(u01(tt, t.so1, t.one)); return { pos: add(c, [0.03, 0.1 - 0.02 * u, 0.36 - 0.07 * u]), look: c, fov: 46 }; } },
    { id: 'snap', t0: t.one - 0.05, set: 'rm', cam: (tt) => { const u = u01(tt, t.one, t.it1); return { pos: add(SHEETP, [0.05, 0.42 - 0.05 * u, 0.2]), look: add(SHEETP, [0, 0.08, 0.0]), fov: 46 }; } },
    { id: 'solve', t0: t.it1 - 0.05, set: 'rm', cam: () => screenCam(PW / 2, PH * 0.47, 0.25) },
    { id: 'write', t0: t.draws - 0.05, set: 'rm', cam: (tt) => { const u = smooth(u01(tt, t.draws, t.trajectory + 0.25)), v = smooth(u01(tt, t.handwriting - 0.15, t.so2)); const py = lerp(PH * 0.42, PAGE.y + PAGE.h * 0.72, u), d = lerp(0.24, 0.2, u) + 0.05 * v; return screenCam(PW / 2, lerp(py, PH * 0.45, v), d); } },
    // THE ANSWER
    { id: 'answer', t0: t.so2 - 0.04, set: 'nm', far: 3000, cam: glide([VS[0] + 2.5, 1.05, VS[2] + 2.2], [VS[0] + 0.15, 0.62, VS[2] - 0.25], [VS[0] + 2.3, 1.0, VS[2] + 1.95], [VS[0] + 0.15, 0.55, VS[2] - 0.3], 48, t.so2, t.on) },
    // D-DAY — the landing; 156,000 troops; 14,000 football teams
    { id: 'boats', t0: t.on - 0.04, set: 'bc', cam: glide(BW(-6, 5, 166), BW(0, 1.0, 40), BW(-4, 5.5, 157), BW(0, 0.8, 36), 50, t.on, t.hundred) },
    { id: 'crane', t0: t.hundred - 0.05, set: 'bc', cam: glide(BW(-24, 20, 104), BW(2, 0, 22), BW(-30, 46, 124), BW(2, 0, 12), 54, t.hundred, t.thats1) },
    { id: 'mound', t0: t.thats1 - 0.05, set: 'bc', cam: glide(BW(MOUND[0] - 0.3, MY + 1.35, MOUND[2] - 4.4), BW(MOUND[0] + 0.1, MY + 1.65, MOUND[2]), BW(MOUND[0] - 0.25, MY + 1.3, MOUND[2] - 3.9), BW(MOUND[0] + 0.1, MY + 1.6, MOUND[2]), 50, t.thats1, t.thats2) },
    // THE VICTORY PARTY (May 1945) — the end card lands over it
    { id: 'party', t0: t.thats2 - 0.04, set: 'nm', far: 3000, cam: glide(add([WD.party[0], 0, WD.party[1]], [2.2, 2.6, 10.5]), add([WD.party[0], 0, WD.party[1]], [0, 0.6, -2]), add([WD.party[0], 0, WD.party[1]], [1.8, 2.4, 9.4]), add([WD.party[0], 0, WD.party[1]], [0, 0.6, -2]), 52, t.thats2, t.ronaldo) },
    { id: 'juggle', t0: t.ronaldo - 0.05, set: 'nm', far: 3000, cam: glide(add([WD.party[0], 0, WD.party[1]], [0.7, 1.75, 6.4]), add([WD.party[0], 0, WD.party[1]], [0, 0.78, 1.0]), add([WD.party[0], 0, WD.party[1]], [0.5, 1.7, 5.2]), add([WD.party[0], 0, WD.party[1]], [0, 0.85, 1.0]), 50, t.ronaldo, END) },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };
  void SKY;

  // ---------------------------------------------------------------- per-frame
  function useSet(sh) {
    NM.root.visible = sh.set === 'nm'; BC.root.visible = sh.set === 'bc'; ROOM.root.visible = sh.set === 'rm'; tunnel.visible = sh.set === 'tun';
    const cam = studio.camera;
    if (sh.set === 'nm') { scene.fog = NMfog; scene.background = NMfog.color; scene.environmentIntensity = 0.45; renderer.toneMappingExposure = 1.0; cam.near = 0.08; cam.far = sh.far ?? 3000; }
    else if (sh.set === 'bc') { scene.fog = BC.fog; scene.background = BC.fog.color; scene.environmentIntensity = 0.45; renderer.toneMappingExposure = 1.0; cam.near = 0.1; cam.far = 3200; }
    else if (sh.set === 'rm') { scene.fog = null; scene.background = new THREE.Color(0x141826); scene.environmentIntensity = 0.25; renderer.toneMappingExposure = ['sheet', 'snap'].includes(sh.id) ? 0.82 : 1.05; cam.near = 0.01; cam.far = 60; }
    else { scene.fog = null; scene.background = new THREE.Color(0x2a0f6a); scene.environmentIntensity = 0.4; renderer.toneMappingExposure = 1.0; cam.near = 0.05; cam.far = 400; }
    cam.updateProjectionMatrix();
  }
  const hideAll = () => {
    for (const r of people) r.root.visible = false;
    for (const x of [povHands, ball, sherman.g, v2sky.g, v2real.g, pole, deskSheet, imprint, phone.g, flash, ...ballTrail, ...realB.map((b) => b.g), ...skyB.map((b) => b.g), ...contrails]) x.visible = false;
    trailSky.hide(); trailReal.hide(); speedPuffs.hide(); portal.set(0, 0); dizzy.update(0, 0, [0, 0, 0]);
    troops.hideAll(); pcrowdA.hideAll(); pcrowdB.hideAll(); troops.commit(); pcrowdA.commit(); pcrowdB.commit(); NM.party.visible = false; NM.clouds.visible = true; plaster.visible = false;
    garyHelm.rotation.set(0, 0, 0); garyHelm.position.set(0, 0.03, 0); garyHelm.scale.set(1, 1, 1);
  };
  const put = (toon, p) => { toon.root.visible = true; toon.set(p); };
  const STANCE = { legL: { x: 0.05, z: 0.14 }, legR: { x: -0.05, z: 0.14 }, armL: { x: 0.05, z: 0.22, el: 0.1 }, armR: { x: 0.05, z: 0.22, el: 0.1 } };
  const WALLPOSE = { armL: { x: -0.32, z: -0.32, el: 0.55 }, armR: { x: -0.32, z: -0.32, el: 0.55 }, legL: { x: 0, z: -0.02 }, legR: { x: 0, z: -0.02 } };
  const WALLX = [-1.05, -0.52, 0, 0.52, 1.05], WALLZ = -9.15;
  function wall(tt, look = 0) {   // the five grey toons in a free-kick wall (blank helmets), all eyes on the ball
    enemies.forEach((e, i) => { const up = look, sq = Math.sin(tt * 3 + i) * 0.01;
      put(e, { x: WALLX[i] + 0.04 * Math.sin(i * 7), y: 0, z: WALLZ, rotY: 0, scale: GS, ...WALLPOSE, eyes: up > 0.5 ? 'wide' : 'open', look: [0, up > 0.3 ? 0.9 : 0], head: { x: -0.7 * up, y: 0.05 * Math.sin(tt * 2 + i) }, mouth: up > 0.5 ? 'o' : 'flat', brows: up > 0.5 ? 0.6 : -0.3, squash: [1 + sq, 1 - sq], t: tt }); });
  }
  const garyIdle = (tt, o = {}) => put(gary, { x: GARYP[0], y: 0, z: GARYP[2], rotY: PI + 0.2, scale: GS, armL: { x: -0.2, z: 0.15, el: 0.4 }, armR: { x: -0.2, z: 0.15, el: 0.4 }, t: tt, ...o });
  const SIT = { legL: { x: -1.5, kn: 0.08, z: 0.1 }, legR: { x: -1.5, kn: 0.08, z: 0.1 } };

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; useSet(sh); hideAll();
    let camUp = null;
    if (sh.set === 'nm') {
      // the far bomber formation (silhouettes + contrails) crossing the sky
      const showSky = ['land', 'wall', 'launch', 'sky', 'gone'].includes(id) && tt < t.planB;
      skyB.forEach((b, i) => { const row = Math.floor(i / 3), col = i % 3; const p = [-1800 + 150 * (tt - 4) - row * 260 + (col === 1 ? 0 : -110), 2900 + row * 60, -3600 + (col - 1) * 230 - row * 150]; b.g.visible = showSky; b.g.position.set(...p); b.update(tt); contrails[i].visible = showSky; contrails[i].position.set(...p); });
    }

    // ======================================================== HOOK
    if (id === 'tun') {
      const u = u01(tt, 0, t.we), wob = Math.sin(tt * 2.2);
      put(ron, { x: TO[0], y: TO[1] + 0.12 * Math.sin(tt * 3), z: TO[2], rotY: 0.1 * wob, rz: 0.12 * Math.sin(tt * 1.7), rx: 0.08, scale: RS, armL: { x: -0.4, z: 1.25 + 0.2 * wob, el: 0.3 }, armR: { x: -0.4, z: 1.3 - 0.2 * wob, el: 0.3 }, legL: { x: -0.4, kn: 0.6 }, legR: { x: 0.3, kn: 0.3 },
        eyes: 'wide', mouth: tt > t.could + 0.9 ? 'grin' : 'o', brows: 0.5, hairUp: 0.6, look: [0, 0.1], t: tt });
      tunBall.position.set(0.85, 1.9 + 0.2 * Math.sin(tt * 2.6), -0.3); tunBall.rotation.set(tt * 5, tt * 3, 0);
      tunT.offset.y = tt * 2.2; tunnel.userData.end.set(tt, 1); void u;
    }
    if (id === 'land') {
      NM.aimSun(0, -2, 12);
      const open = tt < t.sent ? smooth(u01(tt, t.we - 0.1, t.sent)) : tt < LANDH + 0.3 ? 1 : 1 - smooth(u01(tt, LANDH + 0.3, LANDH + 0.75));
      portal.set(tt, open); portal.g.position.set(0, 2.0, -3.4);
      const fly = u01(tt, t.sent, LANDH), arc = Math.sin(PI * fly);
      const out = tt >= t.sent;
      if (out) { const z = lerp(-3.4, 0.6, fly), y = tt < LANDH ? lerp(1.6, 0, fly) + 1.2 * arc : 0, sq = tt > LANDH ? 0.22 * Math.exp(-(tt - LANDH) * 7) * Math.cos((tt - LANDH) * 18) : 0;
        put(ron, { x: 0, y, z, rotY: 0, scale: RS, rx: tt < LANDH ? -0.4 + 0.4 * fly : 0, squash: [1 + sq, 1 - sq], armL: tt < LANDH ? { x: -2.2, z: 0.6 } : { x: -0.1, z: 0.7, el: 1.6 }, armR: tt < LANDH ? { x: -2.2, z: 0.6 } : { x: -0.1, z: 0.7, el: 1.6 },
          legL: tt < LANDH ? { x: -0.6, kn: 0.9 } : STANCE.legL, legR: tt < LANDH ? { x: 0.2, kn: 0.4 } : STANCE.legR, eyes: tt < LANDH ? 'wide' : 'open', mouth: tt < LANDH ? 'scream' : 'grin', brows: tt < LANDH ? 0.6 : -0.2, t: tt });
        ball.visible = true; const bl = tt < LANDH + 0.1 ? [0.5, y + 1.0, z + 0.2] : (() => { const a = tt - LANDH - 0.1; return [0.5 - 0.4 * a, 0.14 + Math.abs(Math.sin(a * 7)) * 0.9 * Math.exp(-a * 2.4), 0.8 - 0.8 * Math.min(1, a)]; })(); ball.position.set(...bl); ball.rotation.set(tt * 8, tt * 3, 0); }
      wall(tt, tt > LANDH ? 0 : 0); enemies.forEach((e, i) => { e.set({ x: WALLX[i] * 2.4 - 1, y: 0, z: -14 + (i % 2), rotY: 0.05, scale: GS, eyes: out ? 'wide' : 'open', mouth: out ? 'o' : 'flat', brows: out ? 0.7 : 0, head: { y: -0.1 * (i - 2) }, armL: { x: 0, z: 0.15 }, armR: { x: 0, z: 0.15 }, t: tt }); });
      garyIdle(tt, { x: 3.2, z: -1.0, rotY: -0.9, eyes: out ? 'wide' : 'open', mouth: out ? 'o' : 'smile', brows: out ? 0.8 : 0, look: [-0.6, 0.1] });
    }
    // ======================================================== PLAN A
    if (id === 'wall' || id === 'face' || id === 'launch') {
      NM.aimSun(0, -3, 12);
      const run = u01(tt, t.his1 + 0.15, KICK), back = smooth(u01(tt, KICK - 0.3, KICK - 0.04)), strike = smooth(u01(tt, KICK - 0.04, KICK + 0.12)), follow = u01(tt, KICK, KICK + 0.5);
      const z = tt < t.his1 + 0.15 ? 1.35 : lerp(1.35, 0.15, smooth(run)), x = lerp(0.35, 0.2, run);
      const kicked = tt > KICK;
      const legR = kicked ? { x: lerp(-1.4, -0.4, smooth(follow)), kn: 0.2 } : tt > KICK - 0.3 ? { x: lerp(0, 1.1, back), kn: lerp(0, 1.3, back) } : null;
      const pointUp = id === 'wall' && tt > t.bombers1 - 0.1;
      put(ron, { x, y: 0, z, rotY: PI, scale: RS, walk: tt > t.his1 + 0.15 && !kicked ? run * 8 : undefined, walkAmt: 1.2,
        ...(tt < t.his1 + 0.15 ? STANCE : {}), ...(legR ? { legR } : {}), ...(pointUp ? { armR: { x: -2.9, z: 0.25, el: 0.1 } } : {}),
        ...(kicked ? { armL: { x: -0.6, z: 1.3, el: 0.3 }, armR: { x: 0.4, z: 1.1, el: 0.3 } } : {}),
        lean: kicked ? -0.15 : tt > t.his1 ? 0.2 : 0.03, head: { x: kicked ? -0.5 * smooth(follow) : 0 }, eyes: 'open', mouth: kicked ? 'grin' : id === 'face' ? 'flat' : 'smile', brows: id === 'face' ? -0.8 : -0.3, look: kicked ? [0, 0.8] : [0, 0], t: tt });
      ball.visible = true; const b = ballAt(tt); ball.position.set(...b); ball.rotation.set(tt * (kicked ? 25 : 0), 0, 0);
      if (kicked) ballTrail.forEach((m, i) => { const p = ballAt(tt - (i + 1) * 0.025); m.visible = true; m.position.set(...p); });
      wall(tt, kicked ? smooth(u01(tt, KICK + 0.1, KICK + 0.5)) : 0);
      garyIdle(tt, { eyes: kicked ? 'wide' : 'open', look: kicked ? [0, 0.9] : [-0.3, 0], head: { x: kicked ? -0.6 : 0 }, mouth: kicked ? 'o' : 'smile' });
    }
    // ======================================================== HIGH
    if (id === 'rise') {
      const cy = 40 * Math.pow(7500 / 40, smooth(u01(tt, t.the1, t.up - 0.25)));
      NM.aimSun(3.5, -120, 200, Math.min(cy, 7400));
      ball.visible = cy < 300; ball.position.set(...ballAt(tt));
      realB.forEach((b, i) => { const lead = [-60 + 80 * (tt - t.seven), 7505, -120]; const off = [[0, 0, 0], [-28, 6, -36], [-28, -4, 36], [-60, 10, -72], [-60, -8, 72], [-95, 4, 0]][i]; b.g.visible = cy > 2000; b.g.position.set(lead[0] + off[0], lead[1] + off[1], lead[2] + off[2]); b.g.rotation.set(0.02 * Math.sin(tt + i), 0, 0.03 * Math.sin(tt * 0.7 + i)); b.update(tt); });
      NM.clouds.visible = true;
    }
    if (id === 'apex' || id === 'bonk') {
      NM.aimSun(1, 0, 12);
      ball.visible = true; const b = ballAt(tt); ball.position.set(...b); ball.rotation.set(tt * 6, tt * 2, 0);
      if (id === 'apex') ballTrail.forEach((m, i) => { const p = ballAt(tt - (i + 1) * 0.04); m.visible = Math.hypot(p[1] - b[1]) > 0.05; m.position.set(...p); });
      put(ron, { x: 0.2, y: 0, z: 0.15, rotY: PI, scale: RS, armL: { x: -0.1, z: 0.6, el: 1.5 }, armR: { x: -0.1, z: 0.6, el: 1.5 }, ...STANCE.legL && { legL: STANCE.legL, legR: STANCE.legR }, head: { x: -0.7 }, look: [0, 1], eyes: 'open', mouth: 'smile', t: tt });
      wall(tt, 1);
      const hit = tt > LAND, k = hit ? Math.exp(-(tt - LAND) * 5) : 0;
      garyIdle(tt, { head: { x: hit ? 0.15 : -0.38, z: hit ? 0.25 * Math.sin((tt - LAND) * 9) : 0 }, eyes: hit ? 'spiral' : 'wide', look: [0, 1], mouth: hit ? 'wavy' : 'o', brows: 0.8, squash: [1 + 0.18 * k, 1 - 0.22 * k], lean: hit ? 0.1 : -0.1,
        armL: hit ? { x: -0.3, z: 0.9 + 0.2 * Math.sin(tt * 8), el: 0.6 } : { x: -0.4, z: 0.3, el: 0.6 }, armR: hit ? { x: -0.3, z: 0.9 - 0.2 * Math.sin(tt * 8), el: 0.6 } : { x: -0.4, z: 0.3, el: 0.6 } });
      if (hit) { garyHelm.rotation.set(0.15, 0, 0.3); garyHelm.scale.set(1.05, 0.8, 1.05); plaster.visible = false; dizzy.update(tt, 1, add(headW(gary), [0, 0.5, 0])); }
    }
    // ======================================================== PLAN B: the race
    if (['start', 'run', 'pass', 'lapped'].includes(id)) {
      const rx = ronX(tt), tx = tankX(tt); NM.aimSun((rx + tx) / 2, WD.roadZ, 16);
      sherman.g.visible = true; sherman.g.position.set(tx, 0, TZ); sherman.g.rotation.set(0, 0, 0.012 * Math.sin(tt * 13)); sherman.update(Math.max(0, tx - TANK0)); sherman.turret.rotation.y = 0.05 * Math.sin(tt);
      sherman.g.updateMatrixWorld(true); const hp = sherman.body.localToWorld(sherman.hatch.clone());
      put(gary, { x: hp.x, y: hp.y - 0.62 * GS - 0.15, z: hp.z, rotY: PI / 2 - 0.5, scale: GS, armL: { x: -0.2, z: 0.4 }, armR: tt > t.a1 ? { x: -2.7, z: 0.4 + 0.35 * Math.sin(tt * 14), el: 0.3 } : { x: -0.4, z: 0.6, el: 0.5 }, legL: { x: 0 }, legR: { x: 0 }, eyes: tt > t.a1 ? 'open' : 'half', mouth: 'grin', brows: 0.2, t: tt });
      plaster.visible = true; garyHelm.rotation.set(0.1, 0, 0.2);
      const running = tt > GO && tt < STOP0 + 0.9, ph = rx * 1.15;
      const stopK = smooth(u01(tt, STOP0, STOP0 + 0.9)), soot = smooth(u01(tt, t.he + 0.1, t.tank));
      put(ron, { x: rx, y: tt < GO ? -0.08 : 0, z: RZ, rotY: PI / 2, scale: RS, walk: running ? ph : undefined, walkAmt: 1.7 * (1 - stopK),
        lean: tt < GO ? 0.55 : 0.35 * (1 - stopK) + 0.45 * stopK, ...(tt < GO ? { legL: { x: -0.7, kn: 1.1 }, legR: { x: 0.55, kn: 0.7 }, armL: { x: 0.6, z: 0.1, el: 0.6 }, armR: { x: -0.7, z: 0.1, el: 0.6 } } : {}),
        ...(running && stopK < 0.5 ? { armL: { x: Math.sin(ph) * 1.1, z: 0.12, el: 1.4 }, armR: { x: -Math.sin(ph) * 1.1, z: 0.12, el: 1.4 } } : {}),
        ...(stopK >= 0.5 ? { armL: { x: -0.7, z: 0.15, el: 0.9 }, armR: { x: -0.7, z: 0.15, el: 0.9 } } : {}),
        eyes: id === 'pass' ? 'wide' : stopK > 0.5 ? 'half' : 'open', mouth: tt < GO ? 'flat' : id === 'pass' ? 'scream' : stopK > 0.3 ? 'o' : 'teeth', brows: tt < GO ? -0.8 : 0.5, look: id === 'pass' ? [-0.8, 0.2] : [0, 0], head: { y: id === 'pass' ? -0.6 : 0 }, soot, t: tt });
    }
    // ======================================================== PLAN C: the V-2
    if (['sky', 'chase', 'header', 'gone', 'bike'].includes(id)) {
      NM.aimSun(VS[0], VS[2], 12);
      // the rocket high in the sky + its contrail (×11, unfogged)
      if (id !== 'chase') { const p = v2skyAt(tt); v2sky.g.visible = tt > V2T0 && p[0] < 4000; v2sky.g.position.set(...p); v2sky.g.rotation.set(0, 0, -PI / 2 + Math.atan2(V2V[1], V2V[0])); v2sky.flame.scale.setScalar(1 + 0.15 * Math.sin(tt * 40));
        for (let i = 0; i < 170; i++) { const tau = tt - 0.04 - i * 0.04; if (tau < V2T0) { trailSky.set(i, [0, 0, 0], 1, 0); continue; } const q = v2skyAt(tau), age = tt - tau; trailSky.set(i, [q[0] - 80, q[1] - 5 + age * 5, q[2] + age * 4], 95 + age * 30, clamp(0.95 - age * 0.04)); } }
      else {
        const r = v2realAt(tt); v2real.g.visible = true; v2real.g.position.set(...r); v2real.g.rotation.set(0, 0, -PI / 2 + Math.atan2(70, 1583)); v2real.flame.scale.set(1.1 + 0.1 * Math.sin(tt * 50), 1.4, 1.1);
        for (let i = 0; i < 70; i++) { const d = 6 + i * 4.2, age = d / 1583; trailReal.set(i, [r[0] - d, r[1] - d * 70 / 1583, r[2] + Math.sin(i * 1.7) * 0.4], 1.2 + d * 0.035, clamp(0.85 - i * 0.011)); }
        NM.clouds.visible = false;   // the cloud layer's 400 m puffs white out the lens; small puffs whip past instead
        for (let i = 0; i < 60; i++) { const px = -1200 + i * 47 + (i % 7) * 13, py = 2050 + ((i * 37) % 23) - 11 + 70 * ((px + 900) / 1583), pz = -420 + ((i * 53) % 41) - 20 - (i % 2 ? 26 : -30); speedPuffs.set(i, [px, py, pz], 14 + (i % 5) * 4, 0.85); }
      }
      if (id === 'sky' || id === 'header' || id === 'gone') {
        const jump = u01(tt, JUMP0, JUMP1), jy = id === 'sky' ? 0 : 0.71 * RS / 1.3 * Math.sin(PI * clamp(jump)) ** 0.6, air = jump > 0 && jump < 1;
        const shade = id === 'sky';
        put(ron, { x: VS[0], y: jy, z: VS[2], rotY: id === 'sky' ? PI - 0.25 : PI * 0.62, scale: RS, head: { x: shade ? -0.75 : air ? -0.45 : -0.6 }, look: [0, 1], eyes: 'wide', mouth: shade ? 'o' : air ? 'teeth' : 'flat', brows: shade ? 0.7 : -0.4,
          armR: shade ? { x: -2.4, z: 0.2, el: 1.9 } : air ? { x: -0.4, z: 1.2, el: 0.4 } : { x: -0.1, z: 0.3 }, armL: air ? { x: -0.4, z: 1.2, el: 0.4 } : { x: 0, z: 0.25 },
          legL: air ? { x: -0.3, kn: 1.2 } : STANCE.legL, legR: air ? { x: 0.1, kn: 0.5 } : STANCE.legR, lean: air ? -0.1 : 0, t: tt });
        if (id === 'header') { pole.visible = true; pole.position.set(VS[0] - 0.85, 0, VS[2] - 0.55); pole.rotation.y = 0.5; const pb = pole.userData.bar; pb.visible = tt > t.two - 0.05; pb.scale.set(Math.max(0.01, easeOutBack(u01(tt, t.two - 0.05, t.two + 0.25))), 1, 1); }
      }
      if (id === 'bike') {
        const u = u01(tt, BK0, BKHIT), air = tt < BKHIT, k = tt > BKHIT ? Math.exp(-(tt - BKHIT) * 6) : 0;
        const y = air ? 1.25 * Math.sin(PI * Math.min(1, u * 1.15)) + (u > 0.87 ? -0.5 * (u - 0.87) : 0) : -0.45 * RS;
        const rx = air ? -2.7 * smooth(u) : -PI / 2;
        put(ron, { x: VS[0], y: Math.max(air ? 0 : -0.45 * RS, y), z: VS[2], rotY: PI / 2, rx, scale: RS, squash: [1 + 0.12 * k, 1 - 0.12 * k],
          legR: air ? { x: lerp(0.3, -2.6, smooth(u01(u, 0.3, 0.75))), kn: 0.2 } : { x: -0.2, kn: 0.3 }, legL: air ? { x: lerp(-0.6, 0.6, smooth(u01(u, 0.3, 0.75))), kn: 0.6 } : { x: 0.1, kn: 0.4 },
          armL: { x: 0.3, z: 1.3, el: 0.2 }, armR: { x: 0.3, z: 1.3, el: 0.2 }, eyes: air ? 'wide' : 'spiral', mouth: air ? 'teeth' : 'wavy', brows: 0.4, t: tt });
        if (!air) dizzy.update(tt, 1, add(headW(ron), [0, 0.35, 0]));
      }
    }
    // ======================================================== 2026: DEREK
    if (sh.set === 'rm') {
      deskSheet.visible = true; imprint.visible = tt > STAMP; imprint.scale.setScalar(imprint.visible ? Math.max(0.01, easeOutBack(u01(tt, STAMP, STAMP + 0.2))) : 1);
      const scribeOn = tt > t.so1 - 0.05;
      const cooked = tt > t.cooked - 0.1 && !scribeOn;
      put(derek, { x: RM[0] - 0.2, y: 0, z: RM[2] - 0.95, rotY: PI, scale: 1.1, legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 },
        armL: scribeOn ? { x: -1.25, z: -0.15, el: 1.0 } : { x: -1.0, z: 0.1, el: 1.1 }, armR: scribeOn ? { x: -1.25, z: -0.15, el: 1.0 } : cooked ? { x: -0.3, z: 0.7, el: 0.6 } : { x: -1.0, z: 0.1, el: 1.1 },
        head: { x: scribeOn ? 0.1 : id === 'sheet' ? 0.45 : cooked ? 0.1 : 0.25, y: cooked ? -0.5 : 0 }, eyes: cooked ? 'half' : scribeOn ? 'wide' : 'open', mouth: cooked ? 'wavy' : scribeOn ? 'grin' : 'flat', brows: cooked ? 0.9 : 0.3, look: [0, -0.4], lean: 0.12, t: tt });
      // the phone: up in his hands for "open", flat over the sheet for the photo, then in front of him for the solve/write close-ups
      if (scribeOn) {
        phone.g.visible = true;
        if (id === 'snap') { phone.g.position.set(SHEETP[0] + 0.01, SHEETP[1] + 0.14, SHEETP[2] + 0.02); phone.g.rotation.set(-PI / 2, 0, 0.06); drawPhone('cam', tt > FLASH ? u01(tt, FLASH, FLASH + 0.35) : 0, tt);
          flash.visible = tt > FLASH && tt < FLASH + 0.3; flash.material.opacity = 1 - u01(tt, FLASH, FLASH + 0.3); flash.position.set(SHEETP[0], SHEETP[1] + 0.13, SHEETP[2] + 0.05); }
        else { phone.g.position.set(...RW(-0.2, 1.22, -1.28)); phone.g.rotation.set(-0.12, 0, 0); }
        if (id === 'open') drawPhone('home');
        if (id === 'solve') drawPhone('solve', u01(tt, SOLVE0, SOLVE1));
        if (id === 'open' || id === 'solve' || id === 'write') derek.root.visible = false;   // POV: the lens is his eyes
        povHands.visible = id === 'open'; if (povHands.visible) { phone.g.updateMatrixWorld(true); povHands.position.copy(phone.g.position); povHands.quaternion.copy(phone.g.quaternion); }
        if (id === 'write') { const p = writeP(tt); sheet.draw(p); drawPhone(p >= N - 0.01 && tt > WRITE1 - 0.05 ? 'done' : 'write', p / N, tt); }
      } else sheet.draw(0);
    }
    // ======================================================== THE ANSWER
    if (id === 'answer') {
      NM.aimSun(VS[0], VS[2], 10);
      const flop = smooth(u01(tt, t.no - 0.05, t.no + 0.25));
      put(ron, { x: VS[0], y: lerp(-0.3 * RS, -0.45 * RS, flop), z: VS[2], rotY: 0, scale: RS, rx: -PI / 2 * flop, legL: { x: -1.5 * (1 - flop), kn: 0.08, z: 0.1 + 0.15 * flop }, legR: { x: -1.5 * (1 - flop), kn: 0.08, z: 0.1 + 0.15 * flop }, armL: { x: -0.6 + 0.6 * flop, z: 0.35 + 0.9 * flop, el: 0.9 }, armR: { x: -0.6 + 0.6 * flop, z: 0.35 + 0.9 * flop, el: 0.9 },
        head: { x: 0.35 * (1 - flop) }, eyes: flop > 0.5 ? 'closed' : 'half', mouth: 'frown', brows: 0.9, soot: 0.55, mud: 0.35, mudColor: 0x5d7a3a, t: tt });
      ball.visible = true; ball.position.set(VS[0] + 0.05, 0.14 + 0.32 * (1 - flop), VS[2] + 0.42 + 0.25 * flop); ball.rotation.set(0, 0, 0);
      put(gary, { x: VS[0] - 1.45, y: -0.3 * GS, z: VS[2] - 0.55, rotY: 0.55, scale: GS, ...SIT, armL: { x: -0.7, z: 0.3, el: 0.7 }, armR: tt > t.no ? { x: -1.4, z: -0.4, el: 0.4 } : { x: -0.7, z: 0.3, el: 0.7 }, head: { y: 0.35, z: -0.2 }, eyes: 'half', mouth: 'flat', brows: 0.7, t: tt });
      plaster.visible = true; garyHelm.rotation.set(0.1, 0, 0.2);
    }
    // ======================================================== D-DAY
    if (sh.set === 'bc') {
      BC.update(tt); BC.aimSun(id === 'mound' ? MOUND[0] : 0, id === 'mound' ? MOUND[2] : 10, id === 'mound' ? 14 : 60);
      BC.craft.forEach((c, i) => { const d = c.g.userData, arrive = d.row === 0; const z = arrive ? d.z : d.z - 6 * (tt - t.on); c.g.position.set(d.x, 0.05 * Math.sin(tt * 1.3 + i) - 0.35, z); c.g.rotation.set(0.015 * Math.sin(tt * 1.1 + i), 0, 0.02 * Math.sin(tt * 0.9 + i)); c.ramp.rotation.x = arrive ? 1.25 : 0; });
      const mx = MOUND[0], mz = MOUND[2];
      TR.forEach((p, i) => { const z = p.z - p.sp * (tt - t.on), x = p.x + Math.sin(i) * 0.2;
        const near = id === 'mound' ? Math.hypot(x - mx, z - mz) < 7.5 || (z < mz - 2 && Math.abs(x - mx) < 3.5) : false;
        if (z < -60 || near) { troops.set(i, null); return; }
        troops.set(i, { x, y: 0, z, rotY: p.rot, kick: 0.7, bob: 0.03 * Math.abs(Math.sin(tt * 6 + p.ph)), armL: { x: Math.sin(tt * 6 + p.ph) * 0.5, z: 0.15 }, armR: { x: -Math.sin(tt * 6 + p.ph) * 0.5, z: 0.15 }, look: [0, 0], t: tt + p.ph }); });
      troops.commit();
      if (id === 'mound') {
        const wow = u01(tt, t.fourteen - 0.2, t.fourteen + 0.2);
        put(ron, { x: BO[0] + mx - 0.55, y: MY, z: mz, rotY: PI + 0.25, scale: RS, armL: wow > 0.5 ? { x: -2.7, z: 0.6, el: 2.2 } : { x: -0.1, z: 0.2 }, armR: wow > 0.5 ? { x: -2.7, z: 0.6, el: 2.2 } : { x: -0.1, z: 0.2 }, eyes: 'wide', mouth: wow > 0.5 ? 'o' : 'flat', brows: 0.8, look: [0.2, -0.2], soot: 0.3, t: tt });
        put(gary, { x: BO[0] + mx + 0.6, y: MY, z: mz + 0.2, rotY: PI - 0.25, scale: GS, armL: { x: -0.2, z: 0.2 }, armR: { x: -0.2, z: 0.2 }, eyes: 'wide', mouth: 'o', brows: 0.8, look: [-0.2, -0.2], t: tt });
        plaster.visible = true; garyHelm.rotation.set(0.1, 0, 0.2);
      }
      BC.followSky(studio.camera);
    }
    // ======================================================== THE VICTORY PARTY
    if (id === 'party' || id === 'juggle') {
      const P0 = [WD.party[0], 0, WD.party[1]]; NM.aimSun(P0[0], P0[2], 12); NM.party.visible = true;
      const jk = (tt - t.ronaldo) * 2.4, bounce = Math.abs(Math.sin(jk * PI)), up = Math.sin(jk * PI) > 0;
      put(ron, { x: P0[0], y: 0, z: P0[2] + 1.0, rotY: 0.15, scale: RS, legR: { x: -1.2 * (1 - bounce) * (up ? 1 : 0.2), kn: 1.2 * (1 - bounce) }, legL: STANCE.legL, armL: { x: -0.3, z: 0.6, el: 0.4 }, armR: { x: -0.3, z: 0.6, el: 0.4 }, head: { x: 0.35 - 0.3 * bounce }, look: [0, -0.6 + bounce], eyes: 'open', mouth: 'grin', brows: -0.1, t: tt });
      ball.visible = true; ball.position.set(P0[0] + 0.12, 0.72 + 0.5 * bounce, P0[2] + 1.42); ball.rotation.set(tt * 6, 0, 0);
      put(gary, { x: P0[0] + 2.0, y: 0.08 * Math.abs(Math.sin(tt * 7)), z: P0[2] + 0.2, rotY: -0.5, scale: GS, walk: tt * 7, walkAmt: 0.8, armL: { x: -2.6, z: 0.5 + 0.3 * Math.sin(tt * 7), el: 0.4 }, armR: { x: -2.6, z: 0.5 - 0.3 * Math.sin(tt * 7), el: 0.4 }, eyes: 'closed', mouth: 'grin', t: tt });
      plaster.visible = true; garyHelm.rotation.set(0.1, 0, 0.2);
      const SP = [[-2.2, -0.6, 0.6], [2.6, -2.4, -0.7], [-3.4, -2.2, 0.4], [-1.6, -3.4, 0.2], [-1.45, 1.55, 0], [1.5, 1.35, 0], [-2.1, 0.35, 0]];
      PARTY.forEach((r, i) => { const [dx, dz, ry] = SP[i], o = r.userData, hop = Math.abs(Math.sin(tt * 6 + i));
        put(r, { x: P0[0] + dx, y: o.kid ? 0.06 * hop : 0, z: P0[2] + dz, rotY: o.kid ? Math.atan2(-dx, -(dz - 1.0)) : ry, scale: o.kid ? 0.82 : GS, beard: o.beard ? 0.35 : 0,
          armL: o.kid ? { x: -2.7, z: 0.4 + 0.2 * hop, el: 0.3 } : { x: -2.3 + 0.4 * Math.sin(tt * 5 + i), z: 0.6, el: 0.6 }, armR: o.kid ? { x: -2.7, z: 0.4 + 0.2 * hop, el: 0.3 } : { x: -0.6, z: 0.6 + 0.3 * Math.sin(tt * 5 + i), el: 1.0 },
          walk: o.kid ? undefined : tt * 6 + i, walkAmt: 0.6, eyes: o.kid ? 'wide' : 'closed', mouth: 'grin', look: o.kid ? [0, 0.4] : [0, 0], t: tt }); });
      for (const [cr, n, x0] of [[pcrowdA, 18, -9], [pcrowdB, 18, 1]]) { for (let i = 0; i < n; i++) { const x = x0 + (i % 6) * 1.4 + (i * 0.37 % 0.6), z = -5.5 + Math.floor(i / 6) * 1.5 + (i % 2) * 0.5; const ph = tt * 6 + i * 1.3;
        cr.set(i, { x, y: 0, z, rotY: 0.2 * Math.sin(i), bob: 0.06 * Math.abs(Math.sin(ph)), armL: { x: -2.6 + 0.3 * Math.sin(ph), z: 0.4 }, armR: { x: -2.4 - 0.3 * Math.sin(ph), z: 0.4 }, look: [0, 0.2], t: tt }); } cr.commit(); }
    }

    // ----- camera
    const cam = sh.cam(tt);
    if (cam.up) studio.camera.up.set(...cam.up); else studio.camera.up.set(0, 1, 0);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    studio.camera.updateMatrixWorld();
    if (sh.set === 'nm') NM.followSky(studio.camera);
    if (sh.set === 'bc') BC.followSky(studio.camera);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, id === 'rise' ? 3 : 6));
    if (id === 'chase') { studio.camera.position.y += 0.06 * Math.sin(tt * 31) * Math.sin(tt * 7.3); studio.camera.rotation.z += 0.01 * Math.sin(tt * 23); }
    studio.fill.intensity = sh.set === 'rm' ? (['sheet', 'snap'].includes(id) ? 0.12 : 0.4) : sh.set === 'tun' ? 0.7 : 0.45; studio.fill.distance = 8;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 084-ronaldo-ww2 --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['ronaldo', ron], ['gary', gary], ['derek', derek], ...enemies.map((e, i) => ['wall ' + (i + 1), e]), ...PARTY.map((p, i) => ['party ' + (i + 1), p])];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of names) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}
