// 050 — Scribe promo: "I upgraded my backyard shed every day until it became a university" (the @officialwriteit "upgrade X every
// day" format; their 751K "Get into an Ivy" reel went shed → brick hall → columns → campus). Max narrates in the first person:
// day 1 a desk + a whiteboard + one student (him), a 2nd floor whose fire exit is a trampoline (into the trash can), a bell tower
// (the neighbor "loves it"), the trash-can raccoon as the mascot on a full scholarship, bricks + columns (a gnome pays the price),
// students he never invited (Mom becomes the dining hall), a stadium on the neighbor's pool. Then the accreditation inspector:
// every student hands in forty problems, HANDWRITTEN, by midnight — including the dean, and he is the dean. He's cooked, so he
// one-shots it with Scribe (tryscribe.ink): one photo → all forty solved → written in HIS handwriting stroke by stroke (the
// glyphs on screen are Scribe's own demo handwriting set, videos/049-scribe-promo/hand.json), even the graph; the inspector holds
// it next to his old notes: perfect match, accredited. Day 100: ivy on every wall, a clock tower, 10,000 students, graduation —
// the raccoon graduates top of the class, the neighbor wants his pool back. End card: Scribe.
// Promo look (docs/PROMO.md): build toon cast, word-keyed gags, impact kicks, 60 fps + blur, ElevenLabs Adam v3; hard cuts between
// places, one gliding rail per shot. Product facts (Scribe README + tryscribe.ink, Nov 2026): photo/PDF upload → worked solutions
// written in a handwriting cloned from one practice sheet, drawn stroke by stroke, hand-drawn graphs, PDF out; "10 free assignments".
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad, drop, wobble } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon, makeShades, makeRaccoon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildCampus, D as CD } from '@engine/build/campus.js';
import { makeCrowd, makeSpecs, cardTex } from '@engine/build/brprops.js';
import { buildLibraryRoom, buildOffice, makePen, D as LD } from '@engine/build/library.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { makeDayHud } from '@engine/build/dayhud.js';
import { tex } from '@engine/build/lighthouse.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const arc = (t, t0, t1, a, b, h) => { const u = clamp((t - t0) / (t1 - t0)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4 * h * u * (1 - u), lerp(a[2], b[2], u)]; };
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const mkm = (geo, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const C = buildCampus(studio), CR = C.root, campusFog = scene.fog;
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---------------------------------------------------------------- word times
  const t = {
    univ: W('hook', 'university'),
    d1: W('day1', 'day'), desk: W('day1', 'desk'), board: W('day1', 'whiteboard'), student: W('day1', 'student'), me: W('day1', 'me'),
    d3: W('day3', 'day'), second: W('day3', 'second'), floor: W('day3', 'floor'), fire: W('day3', 'fire'), tramp: W('day3', 'trampoline'),
    d8: W('day8', 'day'), bell: W('day8', 'bell'), tower: W('day8', 'tower'), nbr: W('day8', 'neighbor'), loves: W('day8', 'loves'),
    d15: W('day15', 'day'), mascot: W('day15', 'mascot'), raccoon: W('day15', 'raccoon'), trash: W('day15', 'trash'), full: W('day15', 'full'), scholarship: W('day15', 'scholarship'),
    d30: W('day30', 'day'), bricks: W('day30', 'bricks'), columns: W('day30', 'columns'), real: W('day30', 'real'), colleges: W('day30', 'colleges'), columns2: W('day30', 'columns', 2),
    d45: W('day45', 'day'), students: W('day45', 'students'), show: W('day45', 'show'), i: W('day45', 'i'), invite: W('day45', 'invite'), my: W('day45', 'my'), mom: W('day45', 'mom'), dining: W('day45', 'dining'), hall: W('day45', 'hall'),
    d60: W('day60', 'day'), stadium: W('day60', 'stadium'), where: W('day60', 'where'), pool: W('day60', 'pool'), used: W('day60', 'used'), be: W('day60', 'be'),
    then: W('inspector', 'then'), insp: W('inspector', 'inspector'), shows: W('inspector', 'shows'), every: W('inspector', 'every'), forty: W('inspector', 'forty'), problems: W('inspector', 'problems'),
    handwritten: W('inspector', 'handwritten'), by: W('inspector', 'by'), midnight: W('inspector', 'midnight'), including: W('inspector', 'including'), dean: W('inspector', 'dean'), im: W('inspector', 'im'), dean2: W('inspector', 'dean', 2),
    cooked: W('cooked', 'cooked'), so: W('cooked', 'so'), oneshot: W('cooked', 'oneshot'), scribe: W('cooked', 'scribe'),
    one: W('solve', 'one'), photo: W('solve', 'photo'), sheet: W('solve', 'sheet'), scribe2: W('solve', 'scribe'), solves: W('solve', 'solves'), forty2: W('solve', 'forty'),
    writes: W('hand', 'writes'), handwriting: W('hand', 'handwriting'), stroke: W('hand', 'stroke'), even: W('hand', 'even'), graph: W('hand', 'graph'),
    insp2: W('match', 'inspector'), holds: W('match', 'holds'), notes: W('match', 'notes'), perfect: W('match', 'perfect'), match: W('match', 'match'), accredited: W('match', 'accredited'),
    d100: W('payoff', 'day'), ivy: W('payoff', 'ivy'), wall: W('payoff', 'wall'), clock: W('payoff', 'clock'), tower2: W('payoff', 'tower'), ten: W('payoff', 'ten'), students2: W('payoff', 'students'), graduation: W('payoff', 'graduation'),
    raccoon2: W('last', 'raccoon'), graduates: W('last', 'graduates'), top: W('last', 'top'), class: W('last', 'class'), the2: W('last', 'the', 3), nbr3: W('last', 'neighbor'), wants: W('last', 'wants'), pool2: W('last', 'pool'), back: W('last', 'back'),
  };
  const ENDCARD = t.back + 0.62;

  // ---------------------------------------------------------------- cast
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const max = mk1({ shirt: 0x3d7bd9, pants: 0x6b5b45, hair: 0x4a2c1a, hairStyle: 'messy', skin: 0xf2c29a });
  const mom = mk1({ shirt: 0xe86a92, pants: 0x4a4a6a, hair: 0x7a4a2a, hairStyle: 'side', skin: 0xf2c29a });
  const nbr = mk1({ shirt: 0xf4f4f0, pants: 0xe0566e, hair: 0x9a9a9a, hairStyle: 'none', mustache: true, skin: 0xf6d2b0, browScale: 1.35 });
  const insp = mk1({ shirt: 0x5d6570, pants: 0x4a4f57, hair: 0x2a2a2a, hairStyle: 'side', mustache: true, skin: 0xe0a97e });
  const torso = (r) => r.armL.g.parent;
  // Max: a hammer (hook), a DEAN lanyard badge, a mortarboard (graduation)
  const hammer = new THREE.Group(); { mkm(new THREE.CylinderGeometry(0.018, 0.02, 0.3, 8), std(0xa77b4f, 0.6), hammer, 0, -0.04, 0.0).rotation.x = PI / 2; mkm(new THREE.BoxGeometry(0.05, 0.05, 0.16), std(0x3a3e44, 0.4, { metalness: 0.7 }), hammer, 0, -0.04, 0.15).rotation.y = PI / 2; } max.hand(1).add(hammer); hammer.position.set(0, -0.05, 0.02);
  const badgeT = tex(256, 180, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1f2b'; g.fillRect(0, 0, w, 52); g.fillStyle = '#ffd96a'; g.font = '700 34px Fredoka'; g.textAlign = 'center'; g.fillText('SHED U', w / 2, 38); g.fillStyle = '#1b1b1b'; g.font = '400 92px "Luckiest Guy"'; g.fillText('DEAN', w / 2, 150); });
  const badge = new THREE.Group(); torso(max).add(badge); badge.position.set(0, 0.2, 0.162); badge.rotation.x = -0.12;
  mkm(new THREE.PlaneGeometry(0.17, 0.12), std(0xffffff, 0.6, { map: badgeT }), badge).castShadow = false;
  for (const s of [-1, 1]) { const l = mkm(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 5), std(0x7a1f2b, 0.6), badge, s * 0.06, 0.15, -0.03); l.rotation.z = s * 0.35; }
  const makeCap = (s = 1, col = 0x1c2a44) => { const g = new THREE.Group(), m = std(col, 0.6); mkm(new THREE.CylinderGeometry(0.2 * s, 0.22 * s, 0.12 * s, 18), m, g, 0, 0, 0); mkm(new THREE.BoxGeometry(0.5 * s, 0.03 * s, 0.5 * s), m, g, 0, 0.07 * s, 0).rotation.y = PI / 4; mkm(new THREE.CylinderGeometry(0.006 * s, 0.006 * s, 0.16 * s, 5), std(0xffd23f, 0.5), g, 0.17 * s, 0.0, 0.0); return g; };
  const maxCap = makeCap(1, 0x7a1f2b); max.head.add(maxCap); maxCap.position.set(0, 0.22, -0.02); maxCap.rotation.x = -0.12;
  // Mom: a bun + an apron + a ladle
  mkm(new THREE.SphereGeometry(0.12, 14, 10), mom.M.hair, mom.head, 0, 0.14, -0.22);
  { const ap = mkm(new THREE.BoxGeometry(0.3, 0.36, 0.03), std(0xf4f4f0, 0.8), torso(mom), 0, 0.12, 0.155); ap.rotation.x = -0.08; }
  const ladle = new THREE.Group(); { mkm(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 6), std(0xc8cdd2, 0.3, { metalness: 0.8 }), ladle, 0, -0.12, 0.08).rotation.x = 1.2; mkm(new THREE.SphereGeometry(0.06, 12, 8, 0, TAU, PI / 2, PI / 2), std(0xc8cdd2, 0.3, { metalness: 0.8 }), ladle, 0, -0.2, 0.25); } mom.hand(1).add(ladle);
  // the neighbor: a toupee that can fly off, shades + a float ring + a drink (pool day), a protest sign (the end)
  const toupee = new THREE.Group(); nbr.head.add(toupee);
  { const tp = mkm(new THREE.SphereGeometry(0.2, 18, 10, 0, TAU, 0, PI * 0.33), std(0x6b4a2a, 0.8), toupee, 0, 0.13, 0.02); tp.scale.set(1, 0.7, 1.05); }
  const nShades = makeShades(0.055, 0.1); nbr.head.add(nShades); nShades.position.set(0, 0.05, 0.268);
  const ring = mkm(new THREE.TorusGeometry(0.27, 0.11, 12, 24), std(0xffd23f, 0.4), nbr.root, 0, 0.55, 0); ring.rotation.x = PI / 2; ring.scale.set(1, 1.05, 1);
  const drink = new THREE.Group(); { mkm(new THREE.CylinderGeometry(0.045, 0.035, 0.13, 12), new THREE.MeshStandardMaterial({ color: 0xff9a3d, roughness: 0.2, transparent: true, opacity: 0.85 }), drink, 0, 0, 0); mkm(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 5), std(0xff4d6d), drink, 0.02, 0.08, 0).rotation.z = 0.3; } nbr.hand(1).add(drink); drink.position.set(0, -0.06, 0.05);
  const protest = new THREE.Group(); { mkm(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6), std(0xa77b4f, 0.7), protest, 0, 0.3, 0); const st = tex(512, 320, (g, w, h) => { g.fillStyle = '#f4efe3'; g.fillRect(0, 0, w, h); g.fillStyle = '#c1121f'; g.font = '400 92px "Luckiest Guy", Arial'; g.textAlign = 'center'; g.fillText('GIVE BACK', w / 2, 130); g.fillText('MY POOL', w / 2, 240); }); mkm(new THREE.BoxGeometry(0.66, 0.42, 0.02), std(0xffffff, 0.8, { map: st }), protest, 0, 0.95, 0.02); } scene.add(protest);
  // the inspector: specs, a tie, a clipboard, a fat stack of problems
  const iSpecs = makeSpecs(); insp.head.add(iSpecs); iSpecs.position.set(0, 0.05, 0.262);
  mkm(new THREE.BoxGeometry(0.06, 0.24, 0.02), std(0xc1121f, 0.5), torso(insp), 0, 0.2, 0.152).rotation.x = -0.1;
  const clip = new THREE.Group(); { mkm(new THREE.BoxGeometry(0.24, 0.32, 0.015), std(0x8a5a2b, 0.6), clip, 0, 0, 0); const ct = tex(256, 340, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.font = '700 26px Fredoka'; g.fillText('ACCREDITATION', 18, 40); g.font = '600 24px Fredoka'; ['☑ columns', '☑ mascot', '☑ stadium', '☐ homework'].forEach((s, i) => g.fillText(s, 22, 100 + i * 52)); }); mkm(new THREE.PlaneGeometry(0.21, 0.28), std(0xffffff, 0.7, { map: ct }), clip, 0, -0.01, 0.009).castShadow = false; mkm(new THREE.BoxGeometry(0.1, 0.03, 0.03), std(0xc8cdd2, 0.3, { metalness: 0.8 }), clip, 0, 0.16, 0.01); } insp.hand(-1).add(clip); clip.position.set(0, -0.08, 0.08); clip.rotation.set(-0.5, 0, 0);
  const stack = new THREE.Group(); { for (let i = 0; i < 9; i++) mkm(new THREE.BoxGeometry(0.22, 0.012, 0.28), std(i % 2 ? 0xfaf8f2 : 0xf0ede4, 0.9), stack, (i % 3 - 1) * 0.006, i * 0.013, 0).rotation.y = (i % 2 - 0.5) * 0.06; const top = tex(256, 320, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.font = '700 30px Inter'; g.fillText('FINAL', 20, 50); g.fillText('40 PROBLEMS', 20, 90); g.fillStyle = '#b3261e'; g.font = '600 22px Inter'; g.fillText('HANDWRITTEN ONLY', 20, 130); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let y = 170; y < h - 10; y += 22) { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); } }); const tp = mkm(new THREE.PlaneGeometry(0.22, 0.28), std(0xffffff, 0.8, { map: top }), stack, 0, 0.12, 0); tp.rotation.x = -PI / 2; } insp.hand(1).add(stack); stack.position.set(0, -0.06, 0.12); stack.rotation.set(1.2, 0, 0);
  // the raccoon: maroon sweater with an S, shades, a cap + diploma later, the scholarship check
  const rac = makeRaccoon(); scene.add(rac.root);
  const rBody = rac.root.children[0], rHead = rBody.children.find((c) => c.isGroup && Math.abs(c.position.y - 0.4) < 1e-3);
  { const sw = mkm(new THREE.SphereGeometry(0.205, 20, 14), std(0x7a1f2b, 0.85), rBody, 0, 0.24, -0.01); sw.scale.set(0.95, 0.9, 1.22);
    const st = tex(128, 128, (g, w) => { g.fillStyle = '#ffd96a'; g.font = '700 110px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('S', w / 2, w / 2 + 6); });
    const S = mkm(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.7 }), rBody, 0, 0.055, 0.06); S.rotation.x = PI / 2 + 0.25; S.castShadow = false; }
  const racCap = makeCap(0.55); rHead.add(racCap); racCap.position.set(0, 0.13, -0.01);
  const diploma = new THREE.Group(); { mkm(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12), std(0xf6efdc, 0.8), diploma, 0, 0, 0).rotation.z = PI / 2; mkm(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 12), std(0xc1121f, 0.5), diploma, 0, 0, 0).rotation.z = PI / 2; } scene.add(diploma);
  const check = new THREE.Group(); { const ct = tex(640, 290, (g, w, h) => { g.fillStyle = '#e9f5df'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5fae4c'; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#2f5a24'; g.font = '700 30px Inter'; g.fillText('SHED UNIVERSITY', 34, 58); g.fillText('No. 0001', w - 170, 58); g.font = '600 26px Inter'; g.fillText('PAY TO:', 34, 126); g.fillStyle = '#1b1b1b'; g.font = '400 60px "Luckiest Guy"'; g.fillText('THE RACCOON', 160, 132); g.fillStyle = '#2f5a24'; g.font = '700 40px Inter'; g.fillText('ONE (1) FULL SCHOLARSHIP', 34, 210); g.strokeStyle = '#2f5a24'; g.lineWidth = 3; g.beginPath(); g.moveTo(400, 258); g.lineTo(600, 258); g.stroke(); }); mkm(new THREE.BoxGeometry(0.95, 0.43, 0.012), std(0xffffff, 0.7, { map: ct }), check, 0, 0, 0); } scene.add(check);
  // the football (stadium), the scholarship check, the dizzy stars
  const ball = new THREE.Group(); { const b = mkm(new THREE.SphereGeometry(0.13, 16, 12), std(0x8a4a24, 0.6), ball); b.scale.set(1, 0.62, 0.62); mkm(new THREE.BoxGeometry(0.1, 0.008, 0.02), std(0xffffff, 0.5), ball, 0, 0.08, 0); } scene.add(ball);
  const dizzy = makeDizzy(scene, { r: 0.3 });
  // students: one instanced crowd reused per shot, varied college tees; grads in navy gowns
  const crowd = makeCrowd(CR, 160, { seed: 50 });
  const TEES = [0x7a1f2b, 0x2f5fb3, 0xe8e2d0, 0x3f8f5a, 0xf2c418, 0x6a6f78, 0xd8393b, 0x1c2a44, 0xff8a3d, 0xb36bff];
  const Ccol = new THREE.Color(), RS = rng(1050);
  const teeOf = crowd.people.map(() => TEES[Math.floor(RS() * TEES.length)]);
  const pantsOf = crowd.people.map((p) => p.pants);
  let gowns = null;
  const dress = (grad) => { if (gowns === grad) return; gowns = grad; crowd.people.forEach((p, i) => { const sh = grad ? 0x1c2a44 : teeOf[i], pa = grad ? 0x1c2a44 : pantsOf[i]; crowd.meshes.chest.setColorAt(i, Ccol.setHex(sh)); for (const k of [0, 1]) { crowd.meshes.arm.setColorAt(i * 2 + k, Ccol.setHex(sh)); crowd.meshes.leg.setColorAt(i * 2 + k, Ccol.setHex(pa)); } crowd.meshes.pelvis.setColorAt(i, Ccol.setHex(pa)); }); };
  dress(false);
  // graduation caps for the crowd (instanced) + a far crowd of tiny grads (body + head + cap) for the day-100 wide
  const NCAP = 160, NMINI = 640;
  const capSkull = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), std(0x1c2a44, 0.6), NCAP + NMINI), capBoard = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.03, 0.5), std(0x1c2a44, 0.6), NCAP + NMINI);
  for (const m of [capSkull, capBoard]) { m.frustumCulled = false; m.castShadow = true; CR.add(m); }
  const miniBody = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.2, 0.55, 4, 10), std(0x1c2a44, 0.75), NMINI), miniHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.24, 14, 10), std(0xffffff, 0.55), NMINI);
  for (const m of [miniBody, miniHead]) { m.frustumCulled = false; m.castShadow = true; CR.add(m); }
  const SKN = [0xf2c29a, 0xe0a97e, 0xc68863, 0x9c6644, 0x7a4a2e, 0xf6d2b0];
  const minis = []; { const R = rng(77); for (let i = 0; i < NMINI; i++) { const c = i % 32, r = Math.floor(i / 32); minis.push({ x: -17 + c * 1.1 + (R() - 0.5) * 0.4, z: 18.5 + r * 1.05 + (R() - 0.5) * 0.3, s: 0.9 + R() * 0.2, ph: R() * TAU, cap: [R(), R(), R()] }); miniHead.setColorAt(i, Ccol.setHex(SKN[Math.floor(R() * SKN.length)])); } }
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const setCap = (i, x, y, z, rx = 0, ry = 0, rz = 0, s = 1) => { Q.setFromEuler(E.set(rx, ry, rz)); M4.compose(PV.set(x, y, z), Q, SV.set(s, s, s)); capSkull.setMatrixAt(i, M4); const up = V(0, 0.07 * s, 0).applyQuaternion(Q); Q.multiply(new THREE.Quaternion().setFromEuler(E.set(0, PI / 4, 0))); M4.compose(PV.set(x + up.x, y + up.y, z + up.z), Q, SV.set(s, s, s)); capBoard.setMatrixAt(i, M4); };
  const hideCaps = () => { for (let i = 0; i < NCAP + NMINI; i++) { capSkull.setMatrixAt(i, ZERO); capBoard.setMatrixAt(i, ZERO); } };
  const hideMinis = () => { for (let i = 0; i < NMINI; i++) { miniBody.setMatrixAt(i, ZERO); miniHead.setMatrixAt(i, ZERO); } };

  // ---------------------------------------------------------------- the dean's office (night) + the inspector's office, parked far away
  const sheet = makeSheet(G, { seed: 12, name: 'Max', title: 'SHED U · MATH 101 · FINAL', note: 'Due 11:59 PM  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 7', problems: [
    { q: '1.  Solve  3x + 7 = 22', a: '3x = 15\nx = 5' },
    { q: '2.  Factor  x² − 9', a: '= (x - 3)(x + 3)' },
    { q: '3.  d/dx [ 4x³ − 2x ]', a: '= 12x^2 - 2' },
    { q: '4.  ∫ 6x² dx', a: '= 2x^3 + C' },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
    { q: '6.  lim (x→2)  (x² − 4)/(x − 2)', a: '= 4' },
  ] });
  const old = makeSheet(G, { seed: 5, name: 'Max', title: 'SHED U · MATH 101 · NOTES', note: 'Week 3  ·  my notes', page: 'p. 4', problems: [
    { q: '1.  Solve  2x − 5 = 9', a: '2x = 14\nx = 7', pre: true },
    { q: '2.  Factor  x² − 25', a: '= (x - 5)(x + 5)', pre: true },
    { q: '3.  d/dx [ x³ + 3x ]', a: '= 3x^2 + 3', pre: true },
    { q: '4.  ∫ 4x dx', a: '= 2x^2 + C', pre: true },
    { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true, pre: true },
    { q: '6.  lim (x→3)  (x² − 9)/(x − 3)', a: '= 6', pre: true },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Max' });
  const LIB = await buildLibraryRoom(studio, { sheetTex: sheet.tex, screenTex: screen.tex, iconImg: icon }), LO = [3000, 0, 0]; LIB.root.position.set(...LO);
  LIB.jack.visible = false;
  const OFF = buildOffice(studio), OO = [3040, 0, 0]; OFF.root.position.set(...OO); for (const m of [OFF.desk, OFF.front, OFF.mug, OFF.handle]) m.visible = false;
  const L = (x, y, z) => [LO[0] + x, LO[1] + y, LO[2] + z], O = (x, y, z) => [OO[0] + x, OO[1] + y, OO[2] + z];
  const Y = LD.deskY;
  { const np = new THREE.Group(); np.position.set(0.2, Y, -0.18); LIB.root.add(np); const nt = tex(256, 80, (g, w, h) => { g.fillStyle = '#2a1c14'; g.fillRect(0, 0, w, h); g.fillStyle = '#e2b34a'; g.font = '700 54px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DEAN', w / 2, h / 2 + 3); }); const pl = mkm(new THREE.BoxGeometry(0.34, 0.1, 0.03), std(0xffffff, 0.5, { map: nt }), np, 0, 0.06, 0); pl.rotation.x = -0.25;
    const pen2 = tex(512, 160, (g, w, h) => { g.fillStyle = '#7a1f2b'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h / 2); g.lineTo(0, h); g.fill(); g.fillStyle = '#ffd96a'; g.font = '400 84px "Luckiest Guy"'; g.textBaseline = 'middle'; g.fillText('SHED U', 30, h / 2 + 4); });
    const pn = mkm(new THREE.PlaneGeometry(1.3, 0.4), std(0xffffff, 0.7, { map: pen2, transparent: true }), LIB.root, -2.6, 2.7, -3.94); pn.rotation.z = -0.1; pn.castShadow = false; }
  const stackPages = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.432, 0.559), new THREE.MeshStandardMaterial({ map: (i % 2 ? old : sheet).tex, roughness: 0.85 })); m.rotation.set(-PI / 2, 0, -0.1 + i * 0.04); LIB.stack.add(m); return m; });
  const pen = makePen(); LIB.root.add(pen.g);
  const shotHand = new THREE.Group(); LIB.root.add(shotHand);
  { const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), max.M.shirt); sleeve.rotation.x = PI / 2; sleeve.position.set(0, 0, -0.26); shotHand.add(sleeve); shotHand.add(new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), max.M.skin)); }
  const camPhone = new THREE.Group(); shotHand.add(camPhone); camPhone.position.set(0, 0.02, 0.1); camPhone.rotation.x = 0.55;
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.016, 0.25), std(0x15161a, 0.3)); camPhone.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.148), new THREE.MeshBasicMaterial({ map: sheet.tex, toneMapped: false })); sc.rotation.x = -PI / 2; sc.position.set(0, 0.0085, -0.01); camPhone.add(sc); const ui = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.03), new THREE.MeshBasicMaterial({ color: 0x9a1c25, toneMapped: false })); ui.rotation.x = -PI / 2; ui.position.set(0, 0.0086, 0.1); camPhone.add(ui); }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flashSpr.scale.setScalar(0.9); camPhone.add(flashSpr); flashSpr.position.y = -0.03;
  const profSheets = [old, sheet].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.556), new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.85, side: THREE.DoubleSide })); OFF.root.add(m); return m; });
  const accT = tex(512, 200, (g, w, h) => { g.strokeStyle = '#d0141e'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = '#d0141e'; g.font = '400 104px "Luckiest Guy", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ACCREDITED', w / 2, h / 2 + 8); });
  const accMark = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.14), new THREE.MeshBasicMaterial({ map: accT, transparent: true, depthWrite: false })); profSheets[1].add(accMark); accMark.position.set(0.0, -0.05, 0.004); accMark.rotation.z = 0.18;

  // ---------------------------------------------------------------- FX + kicks + bell rings
  const fx = makeFX(scene, { max: { dust: 500, confetti: 700, spark: 300, glow: 80, smoke: 260, drops: 300, crumb: 300, rock: 200 }, nearFade: [0.5, 1.6] });
  const FXN = { burst: 0, stream: 0, times: [] }; { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx); fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); return b0(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); return s0(k, t0, t1, o); }; }
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  const ringMeshes = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); scene.add(m); return m; });

  // ---------------------------------------------------------------- the timeline of the build (global, any shot shows the same state)
  const S = CD.shed, RIDGE0 = S.h + 0.12, RIDGE2 = RIDGE0 + S.h2;      // roof base before / after the 2nd floor
  const F2_UP = t.second - 0.02, F2_LAND = t.floor + 0.08, ROOF_LAND = F2_LAND + 0.12;
  const WIN = add(CD.win2, [0, 0, -0.32]), TRAMP_TOP = [CD.tramp[0], CD.trampY + 0.02, CD.tramp[1]];
  const JUMP0 = t.fire + 0.02, TL = t.tramp + 0.1, CANL = TL + 0.5;
  const BELL_LAND = t.tower + 0.12, BONGS = [t.nbr - 0.1, t.loves - 0.05, t.loves + 0.4];
  const LIDPOP = t.mascot - 0.05, CHECK = t.full - 0.15;
  const BRICK0 = t.bricks - 0.04, BRICK1 = BRICK0 + 0.55, COLS = [0, 1, 2, 3].map((k) => t.columns + 0.02 + k * 0.13), COLL = 0.3, TOP0 = t.colleges - 0.1, CRUSH = COLS[3] + COLL;
  const GATE0 = t.d45 - 0.1, STAD0 = t.stadium - 0.04, BONK = t.be + 0.03;
  const IVY0 = t.ivy - 0.05, TOWER0 = t.clock - 0.15, TOWER1 = TOWER0 + 0.6, CAPS = t.graduation + 0.05;
  kick(F2_LAND, 0.8); kick(ROOF_LAND, 0.4); kick(TL, 0.5); kick(CANL, 0.9); kick(BELL_LAND, 0.6); BONGS.forEach((b) => kick(b, 0.35, 0.3)); kick(t.loves + 0.02, 0.3);
  kick(LIDPOP, 0.4); kick(CHECK + 0.25, 0.3); kick(BRICK0 + 0.1, 0.9, 0.6); COLS.forEach((c, k) => kick(c + COLL, k === 3 ? 1.0 : 0.55)); kick(TOP0 + 0.3, 0.8);
  kick(STAD0 + 0.1, 0.5); kick(BONK, 1.0); kick(t.handwritten, 0.6); kick(t.dean2 + 0.05, 0.4);
  kick(TOWER1, 0.9, 0.55); kick(CAPS, 0.7); kick(t.back + 0.02, 0.5);
  fx.burst('dust', F2_LAND, { pos: [0, RIDGE0, 1.2], n: 12, spread: 2.0, speed: [0.8, 1.8], size: [0.4, 0.8] });
  fx.burst('dust', ROOF_LAND, { pos: [0, RIDGE2 + 0.4, 0.6], n: 8, spread: 1.6, speed: [0.6, 1.4], size: [0.3, 0.6] });
  fx.burst('dust', CANL, { pos: [CD.can[0], 0.9, CD.can[1]], n: 8, spread: 1.4, speed: [0.6, 1.4], size: [0.25, 0.5] });
  fx.burst('crumb', CANL, { pos: [CD.can[0], 0.9, CD.can[1]], n: 14, color: 0x9ab06a, speed: [1.5, 3.2], spread: 1.0, floor: 0 });
  fx.burst('dust', BELL_LAND, { pos: [0, RIDGE2 + 0.75, 0], n: 10, spread: 1.6, speed: [0.6, 1.4], size: [0.3, 0.6] });
  fx.burst('spark', LIDPOP, { pos: [CD.can[0], 1.0, CD.can[1]], n: 16, speed: [1, 2.6], spread: 1.6 });
  fx.burst('confetti', CHECK + 0.3, { pos: [CD.can[0] + 0.3, 1.4, CD.can[1] + 0.4], n: 50, speed: [1.5, 3.2], spread: 1.0, floor: 0 });
  fx.burst('dust', BRICK0 + 0.05, { pos: [0, 0.5, -1.5], n: 40, spread: 6, speed: [2, 5], size: [1.2, 2.4], box: [8, 1, 6] });
  COLS.forEach((c, k) => fx.burst('dust', c + COLL, { pos: [CD.hall.colX[k], 0.25, CD.hall.colZ], n: 7, spread: 1.6, speed: [0.8, 1.8], size: [0.4, 0.8] }));
  fx.burst('crumb', CRUSH, { pos: [CD.gnome[0], 0.2, CD.gnome[1]], n: 16, color: 0xd23a2e, speed: [1.5, 3.5], spread: 1.4, floor: 0 });
  fx.burst('dust', TOP0 + 0.3, { pos: [0, 5.8, 2.6], n: 14, spread: 3, speed: [1, 2.4], size: [0.6, 1.2], box: [6, 0.5, 1] });
  fx.burst('dust', STAD0 + 0.1, { pos: [CD.field[0], 0.3, CD.field[1]], n: 30, spread: 5, speed: [1.5, 3.5], size: [0.8, 1.6], box: [9, 0.5, 6] });
  fx.burst('drops', STAD0 + 0.05, { pos: [CD.pool[0], 0.2, CD.pool[1]], n: 60, color: 0x7fd6f2, speed: [2, 4.5], spread: 1.2, dir: [0, 1, 0], floor: 0 });
  fx.burst('spark', BONK, { pos: [CD.field[0] - 0.2, 1.1, CD.field[1] + 0.05], n: 14, speed: [1.5, 3.5], spread: 1.6 });
  fx.burst('dust', TOWER0 + 0.05, { pos: [CD.tower[0], 0.4, CD.tower[1] + 1.6], n: 30, spread: 5, speed: [1.5, 4], size: [1, 2], box: [4, 0.5, 4] });
  fx.burst('confetti', CAPS, { pos: [0, 3.5, 11], n: 400, speed: [2, 6], spread: 1.4, box: [12, 1, 8], floor: 0 });
  fx.burst('confetti', t.top - 0.1, { pos: [0, 3.0, 2.6], n: 180, speed: [2, 5], spread: 1.3, box: [3, 0.5, 1], floor: 0.12 });
  fx.burst('confetti', ENDCARD - 0.5, { pos: [0, 4.0, 9], n: 200, speed: [2, 5], spread: 1.4, box: [10, 1, 6], floor: 0 });

  // students walk in through the gate (day 45): polyline start → gate → spot, staggered
  const R = rng(4050);
  const QUEUE = Array.from({ length: 9 }, (_, k) => [CD.table[0] - 0.15 - k * 0.2, CD.table[1] + 0.95 + k * 0.62]);
  const walkers = Array.from({ length: 70 }, (_, i) => {
    const gz = CD.gate[1] + (R() - 0.5) * 0.9, a = [-16.2 - (i % 5) * 0.5 - R() * 0.5, 0, gz + (R() - 0.5) * 1.0], g = [CD.fenceL + 0.4, 0, gz];
    const q = i < QUEUE.length ? QUEUE[i] : null;
    let b = q ? [q[0], 0, q[1]] : null; for (let k = 0; !b && k < 40; k++) { const c = [-11 + R() * 13.5, 0, 3.6 + R() * 5.0]; if ([[-3.9, 4.9], [-1.2, 9.6], [-1.8, 6.0], [CD.table[0], CD.table[1]]].every(([x, z]) => Math.hypot(c[0] - x, c[2] - z) > 1.4)) b = c; } b = b || [-9, 0, 5];
    const segs = [Math.hypot(g[0] - a[0], g[2] - a[2]), Math.hypot(b[0] - g[0], b[2] - g[2])];
    return { a, g, b, segs, ts: GATE0 + 0.15 + (q ? i * 0.1 : 0.35 + (i - 9) * 0.028), v: 3.4 + R() * 0.6, ph: R() * TAU, queue: !!q, qk: q ? i : -1 };
  });
  const walkerAt = (w, tt) => {
    const s = Math.max(0, (tt - w.ts) * w.v), [s1, s2] = w.segs;
    if (s < s1) { const u = s / s1; return { p: [lerp(w.a[0], w.g[0], u), 0, lerp(w.a[2], w.g[2], u)], head: Math.atan2(w.g[0] - w.a[0], w.g[2] - w.a[2]), moving: tt > w.ts }; }
    const u = Math.min(1, (s - s1) / s2); return { p: [lerp(w.g[0], w.b[0], u), 0, lerp(w.g[2], w.b[2], u)], head: u < 1 ? Math.atan2(w.b[0] - w.g[0], w.b[2] - w.g[2]) : (w.queue ? PI : PI + 0.4 * Math.sin(w.ph)), moving: u < 1 };
  };
  const lawnCrowd = Array.from({ length: 40 }, (_, i) => ({ x: -5.6 + (i % 10) * 0.85 + (R() - 0.5) * 0.3, z: 6.3 + Math.floor(i / 10) * 1.05 + (R() - 0.5) * 0.3, ph: R() * TAU }));

  // ---------------------------------------------------------------- HUD
  const hud = makeDayHud({
    show: [t.d1 - 0.05, ENDCARD + 0.1],
    day: [[0, 1], [t.d1, 1], [t.d3, 3], [t.d8, 8], [t.d15, 15], [t.d30, 30], [t.d45, 45], [t.d60, 60], [t.then, 61], [t.d100, 100]],
    count: { label: 'STUDENTS', keys: [[0, 1], [t.scholarship, 2], [t.students, 340], [t.stadium, 1200], [t.ten, 10000]] },
    clock: [[0, ''], [t.cooked - 0.15, '11:02 PM'], [t.writes, '11:03 PM'], [t.insp2 - 0.12, '']],
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' },
  });

  // ---------------------------------------------------------------- SHOTS: one gliding rail per place, hard cuts between places
  const head = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const sheetW = L(LD.sheet[0], Y, LD.sheet[1]), clockW = L(1.2, 3.55, -3.96);
  const TY = L(LD.seat[0], 0.145, LD.seat[1]);
  const FC = CD.field, NB = [FC[0] - 0.2, 0, FC[1]];          // the neighbor on his float, where the pool was
  const STEP = [0.1, 0.12, 3.2], DEANP = [2.0, 0.12, 3.3];       // the inspector at the top of the steps; Max beside the steps
  const SHOTS = [
    { id: 'hook', t0: 0, frames: [
      { t: 0, pos: [0.9, 1.9, 9.6], look: [-0.15, 1.35, 0.4], fov: 46 },
      { t: t.univ - 0.1, pos: [0.2, 1.65, 6.4], look: [-0.25, 1.45, 0.6], fov: 46, keep: true, stop: true } ] },
    { id: 'class', t0: t.d1 - 0.02, frames: [
      { t: t.d1 - 0.02, pos: [0.25, 1.32, 3.6], look: [0.0, 1.05, -0.3], fov: 48 },
      { t: t.me, pos: [0.3, 1.25, 3.0], look: [0.1, 1.0, -0.2], fov: 48, stop: true } ] },
    { id: 'floor2', t0: t.d3 - 0.02, frames: [
      { t: t.d3 - 0.02, pos: [1.1, 2.3, 8.6], look: [0.75, 2.35, 0.6], fov: 48 },
      { t: t.bell - 0.2, pos: [1.0, 2.2, 8.0], look: [0.8, 2.3, 0.6], fov: 48, stop: true } ] },
    { id: 'bell', t0: t.bell - 0.18, frames: [
      { t: t.bell - 0.18, pos: [2.0, 1.5, 7.6], look: [0.1, RIDGE2 + 0.9, 0], fov: 44 },
      { t: t.nbr - 0.06, pos: [1.7, 1.6, 6.8], look: [0.1, RIDGE2 + 0.9, 0], fov: 44, stop: true } ] },
    { id: 'neighbor', t0: t.nbr - 0.06, frames: [
      { t: t.nbr - 0.06, pos: [7.6, 3.5, 0.3], look: [CD.nwin[0], CD.nwin[1] - 0.35, CD.nwin[2]], fov: 40 },
      { t: t.d15 - 0.02, pos: [7.9, 3.6, -0.3], look: [CD.nwin[0], CD.nwin[1] - 0.3, CD.nwin[2]], fov: 40, stop: true } ] },
    { id: 'mascot', t0: t.d15 - 0.02, frames: [
      { t: t.d15 - 0.02, pos: [2.75, 1.0, 4.4], look: [2.45, 0.85, 0.8], fov: 46 },
      { t: t.full - 0.2, pos: [2.8, 1.05, 3.9], look: [2.5, 0.9, 0.85], fov: 46, keep: true },
      { t: t.d30 - 0.04, pos: [2.85, 1.1, 3.75], look: [2.55, 0.95, 0.85], fov: 46, stop: true } ] },
    { id: 'hall', t0: t.d30 - 0.02, frames: [
      { t: t.d30 - 0.02, pos: [1.2, 3.2, 18.5], look: [0.4, 3.1, 0], fov: 46 },
      { t: t.columns - 0.1, pos: [1.1, 3.1, 17.0], look: [0.4, 3.1, 0], fov: 46, keep: true, until: CRUSH + 0.05 },
      { t: t.columns2 + 0.25, pos: [1.25, 2.6, 14.0], look: [0.6, 3.0, 1.2], fov: 46, stop: true } ] },
    { id: 'students', t0: t.d45 - 0.02, frames: [
      { t: t.d45 - 0.02, pos: [-7.4, 2.1, 9.6], look: [-12.6, 1.0, 3.9], fov: 50 },
      { t: t.i - 0.08, pos: [-7.0, 2.3, 10.4], look: [-11.4, 1.0, 4.4], fov: 50, stop: true } ] },
    { id: 'invite', t0: t.i - 0.06, frames: [
      { t: t.i - 0.06, pos: [-1.2, 1.35, 9.6], look: [-1.8, 0.85, 6.0], fov: 44 },
      { t: t.my - 0.08, pos: [-1.3, 1.3, 9.2], look: [-1.8, 0.85, 6.0], fov: 44, stop: true } ] },
    { id: 'mom', t0: t.my - 0.06, frames: [
      { t: t.my - 0.06, pos: [-4.4, 1.7, 4.9], look: [CD.table[0] - 0.05, 0.78, CD.table[1] - 0.4], fov: 46 },
      { t: t.d60 - 0.04, pos: [-4.6, 1.65, 4.4], look: [CD.table[0] - 0.05, 0.8, CD.table[1] - 0.4], fov: 46, stop: true } ] },
    { id: 'stadium', t0: t.d60 - 0.02, frames: [
      { t: t.d60 - 0.02, pos: [5.0, 10.5, 15.5], look: [12.2, 1.9, -1.0], fov: 50 },
      { t: t.used - 0.3, pos: [6.6, 7.0, 11.2], look: [11.9, 1.9, -0.6], fov: 48, stop: true } ] },
    { id: 'bonk', t0: t.used - 0.28, frames: [
      { t: t.used - 0.28, pos: [NB[0] + 0.7, 1.2, NB[2] + 3.3], look: [NB[0], 0.75, NB[2]], fov: 44 },
      { t: t.then - 0.04, pos: [NB[0] + 0.6, 1.15, NB[2] + 2.9], look: [NB[0], 0.75, NB[2]], fov: 44, stop: true } ] },
    { id: 'arrive', t0: t.then - 0.02, frames: [
      { t: t.then - 0.02, pos: [-0.3, 1.75, 1.9], look: [2.6, 1.15, 5.2], fov: 46 },
      { t: t.every - 0.08, pos: [-0.65, 1.85, 1.65], look: [1.0, 1.25, 4.2], fov: 48, stop: true } ] },
    { id: 'decree', t0: t.every - 0.06, frames: [
      { t: t.every - 0.06, pos: [0.9, 2.7, 11.2], look: [0.1, 1.6, STEP[2]], fov: 36 },
      { t: t.handwritten - 0.12, pos: [0.8, 2.6, 10.4], look: [0.1, 1.6, STEP[2]], fov: 36, stop: true } ] },
    { id: 'gasp', t0: t.handwritten - 0.1, frames: [
      { t: t.handwritten - 0.1, pos: [-1.1, 2.0, 4.2], look: [-1.5, 1.1, 8.5], fov: 50 },
      { t: t.including - 0.08, pos: [-1.1, 2.1, 4.5], look: [-1.3, 1.1, 8.5], fov: 50, stop: true } ] },
    { id: 'dean', t0: t.including + 0.12, cam: (tt) => { const h = head(max); return { pos: add(h, [0.25, 0.02, 2.0 - 0.25 * u01(tt, t.dean, t.cooked)]), look: add(h, [0.02, -0.22, 0]), fov: 40 }; } },
    { id: 'cooked', t0: W('cooked', 'im') - 0.02, set: 'lib', cam: (tt) => { const h = head(max); return { pos: add(h, [0.18, -0.02, 2.2 - 0.15 * u01(tt, t.cooked, t.so)]), look: add(h, [0, -0.3, 0]), fov: 40 }; } },
    { id: 'opens', t0: t.so - 0.04, set: 'lib', frames: [
      { t: t.so - 0.04, pos: L(0.7, 1.4, 1.5), look: L(0.2, 0.92, -0.95), fov: 44 },
      { t: t.scribe - 0.15, pos: L(0.65, 1.38, 1.3), look: L(0.2, 0.92, -0.95), fov: 44, stop: true } ] },
    { id: 'screen', t0: t.scribe - 0.08, set: 'lib', pov: true, cam: () => screenCam(0) },
    { id: 'photo', t0: t.one - 0.02, set: 'lib', frames: [
      { t: t.one - 0.02, pos: add(sheetW, [0.35, 0.72, 0.85]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42 },
      { t: t.scribe2 - 0.15, pos: add(sheetW, [0.3, 0.68, 0.72]), look: add(sheetW, [0.02, 0.25, -0.05]), fov: 42, stop: true } ] },
    { id: 'solve', t0: t.scribe2 - 0.1, set: 'lib', pov: true, cam: () => screenCam(0.02) },
    { id: 'write', t0: t.writes - 0.1, set: 'lib', frames: [
      { t: t.writes - 0.1, pos: L(0.05, 1.42, 0.75), look: L(0.05, 0.86, -0.8), fov: 46 },
      { t: t.handwriting - 0.1, pos: add(sheetW, [0.02, 0.48, 0.32]), look: add(sheetW, [-0.01, 0, -0.04]), fov: 44, stop: true } ] },
    { id: 'macro', t0: t.handwriting - 0.06, set: 'lib', cam: (tt) => macroCam(tt) },
    { id: 'prof', t0: t.insp2 - 0.12, set: 'office', frames: [
      { t: t.insp2 - 0.12, pos: O(0.05, 1.3, 3.5), look: O(0, 0.8, 0.3), fov: 46 },
      { t: t.notes - 0.1, pos: O(0.03, 1.25, 3.0), look: O(0, 0.8, 0.35), fov: 46, keep: true, until: t.accredited + 0.5 } ] },
    { id: 'ivy', t0: t.d100 - 0.02, frames: [
      { t: t.d100 - 0.02, pos: [-5.4, 5.6, 14.0], look: [0, 3.2, 0.5], fov: 50 },
      { t: t.clock - 0.4, pos: [-4.6, 5.0, 12.4], look: [0, 3.4, 0.5], fov: 50, stop: true } ] },
    { id: 'tower', t0: t.clock - 0.38, frames: [
      { t: t.clock - 0.38, pos: [0.4, 2.6, 16.5], look: [0, 9.0, -7.5], fov: 50 },
      { t: t.ten - 0.14, pos: [0.4, 2.7, 15.4], look: [0, 9.6, -7.5], fov: 50, stop: true } ] },
    { id: 'quad', t0: t.ten - 0.12, frames: [
      { t: t.ten - 0.12, pos: [4.0, 7.5, 31], look: [0, 2.2, 6], fov: 50 },
      { t: t.graduation + 0.1, pos: [5.0, 11, 35], look: [0, 3.0, 5], fov: 52 },
      { t: t.raccoon2 - 0.1, pos: [5.5, 13, 37], look: [0, 4.0, 5], fov: 52, stop: true } ] },
    { id: 'podium', t0: t.raccoon2 - 0.1, frames: [
      { t: t.raccoon2 - 0.1, pos: [0.55, 1.75, 6.6], look: [-0.3, 1.5, 2.4], fov: 42 },
      { t: t.the2 - 0.06, pos: [0.45, 1.7, 5.9], look: [-0.3, 1.55, 2.4], fov: 42, stop: true } ] },
    { id: 'protest', t0: t.the2 - 0.04, frames: [
      { t: t.the2 - 0.04, pos: [0.5, 1.85, 13.0], look: [0.42, 1.78, 9.3], fov: 46 },
      { t: END, pos: [0.5, 2.1, 14.0], look: [0.42, 1.95, 9.3], fov: 48, stop: true } ] },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; s.set = s.set || 'campus'; if (s.frames) s.rail = makeRail(planRail(s.frames, { move: [0.35, 13], minHold: 0.6 })); });
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // the screen insert: straight down the laptop screen's normal (Max + the chair are hidden: a POV cheat)
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), qq = new THREE.Quaternion();
  function screenCam(dy) { LIB.laptop.scr.updateWorldMatrix(true, false); LIB.laptop.scr.getWorldPosition(scrP); LIB.laptop.scr.getWorldQuaternion(qq); scrN.set(0, 0, 1).applyQuaternion(qq); const d = 1.5; return { pos: [scrP.x + scrN.x * d, scrP.y + scrN.y * d + 0.02, scrP.z + scrN.z * d], look: [scrP.x, scrP.y - 0.19 - dy, scrP.z], fov: 40 }; }
  // handwriting progress (item weights): answers 1–4, then the graph on "graph", then 6
  const items = sheet.items, cum = []; { let a = 0; for (const it of items) { a += it.kind === 'p' ? it.w : 1; cum.push(a); } }
  const N = sheet.total, lastOf = (pred) => { let k = -1; items.forEach((it, i) => { if (pred(it.pi)) k = i; }); return k < 0 ? 0 : cum[k]; };
  const PEN0 = t.writes - 0.05, WRITE0 = t.writes + 0.25, WRITE1 = t.graph + 0.38;
  const pBeforeGraph = lastOf((pi) => pi < 4), pAfterGraph = lastOf((pi) => pi <= 4);
  const PK = [[WRITE0, 0], [t.even - 0.08, pBeforeGraph], [t.graph + 0.3, pAfterGraph], [WRITE1, N]];
  const writeP = (tt) => { if (tt <= PK[0][0]) return 0; for (let i = 0; i < PK.length - 1; i++) if (tt < PK[i + 1][0]) return lerp(PK[i][1], PK[i + 1][1], (tt - PK[i][0]) / (PK[i + 1][0] - PK[i][0])); return N; };
  fx.stream('spark', WRITE0, WRITE1, { pos: L(LD.sheet[0], Y + 0.03, LD.sheet[1]), box: [0.3, 0.02, 0.35], rate: 18, color: 0xffe08a, speed: [0.1, 0.4], size: [0.008, 0.016], life: [0.2, 0.4], g: 0 });
  const tipWorld = (p) => { const tip = sheetTipAt(p); const v = V((tip[0] / sheet.w - 0.5) * 0.432, (0.5 - tip[1] / sheet.h) * 0.559, 0); LIB.sheet.updateWorldMatrix(true, false); return LIB.sheet.localToWorld(v).toArray(); };
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  function macroCam(tt) { const s = [0, 0.08, 0.16, 0.24, 0.32].map((d) => tipWorld(writeP(tt - d))), m = [0, 1, 2].map((c) => s.reduce((a, v) => a + v[c], 0) / s.length); const g = tt > t.even - 0.1 ? 0.12 : 0; return { pos: add(m, [-0.06, 0.24 + g, 0.15 + g * 0.6]), look: add(m, [0.01, 0, -0.015]), fov: 42 }; }
  fx.stream('smoke', t.cooked - 0.1, t.so + 0.4, { pos: L(LD.seat[0], 1.62, LD.seat[1]), rate: 14, size: [0.12, 0.25], speed: [0.3, 0.8], spread: 0.4, life: [0.7, 1.1], g: -1.5, color: 0xdddddd });
  const LID0 = t.so - 0.02, LID1 = t.so + 0.32, FLASH = t.photo + 0.05, SCAN0 = FLASH + 0.15, SOLVE0 = t.scribe2 + 0.1, SOLVE1 = t.forty2 + 0.2;
  kick(FLASH, 0.35); kick(t.cooked, 0.6); kick(LID1, 0.3); kick(t.perfect + 0.05, 0.9); kick(t.accredited + 0.05, 1.0); kick(t.match + 0.25, 0.4);

  // ---------------------------------------------------------------- per-frame
  const hideAll = () => { for (const r of [max, mom, nbr, insp]) r.root.visible = false; rac.root.visible = false; check.visible = false; ball.visible = false; diploma.visible = false; protest.visible = false; ringMeshes.forEach((m) => (m.visible = false)); };
  function setWorld(sh) {
    const camp = sh.set === 'campus';
    CR.visible = camp; LIB.root.visible = sh.set === 'lib'; OFF.root.visible = sh.set === 'office';
    if (camp) { scene.fog = campusFog; scene.background = new THREE.Color(0xd6ecf8); renderer.toneMappingExposure = 1.0; scene.environmentIntensity = 0.55; }
    else { scene.fog = null; scene.background = new THREE.Color(0x1a1410); renderer.toneMappingExposure = 1.06; scene.environmentIntensity = 0.3; }
  }
  function buildState(tt, id) {
    // shed + its upgrades
    const hallUp = tt >= BRICK0 + 0.12;
    C.shed.g.visible = !hallUp; C.shed.front.visible = id !== 'class';
    C.tramp.g.visible = !hallUp; C.can.g.visible = !hallUp;
    // the cardboard sign: hangs crooked from "university" on
    { const k = tt > t.univ ? 1 : 0; C.shed.sign.rotation.z = k ? -0.42 + wobble(tt, t.univ, 0.35, 16, 4.5) : 0; }
    // 2nd floor: the roof launches, the floor drops in, the roof lands on it
    C.shed.floor2.visible = tt > F2_UP;
    if (tt < F2_UP) C.shed.roof.position.y = RIDGE0;
    else if (tt < F2_LAND) { C.shed.roof.position.y = RIDGE0 + 4.2 * Math.sin(PI / 2 * u01(tt, F2_UP, F2_UP + 0.2)); C.shed.floor2.position.y = RIDGE0 + 6.5 * (1 - easeInQuad(u01(tt, F2_UP + 0.04, F2_LAND))); }
    else { C.shed.floor2.position.y = RIDGE0; C.shed.roof.position.y = tt < ROOF_LAND ? lerp(RIDGE0 + 4.2, RIDGE2, easeInQuad(u01(tt, F2_LAND, ROOF_LAND))) : RIDGE2; }
    { const [sx, sy] = squash(tt, F2_LAND, 0.12); C.shed.g.scale.set(sx, sy, sx); }
    // whiteboard text (day 1)
    C.shed.setBoard(u01(tt, t.board + 0.15, t.student - 0.15));
    C.shed.board.scale.setScalar(tt < t.board - 0.08 ? 0.001 : Math.max(0.001, easeOutBack(u01(tt, t.board - 0.08, t.board + 0.18))));
    C.shed.desk.visible = tt > t.desk - 0.25; C.shed.desk.position.y = 0.12 + (tt < t.desk + 0.1 ? drop(tt, t.desk - 0.25, 1.4, 0.3) : 0);
    // trampoline dip + trash can lid
    C.tramp.mat.position.y = CD.trampY - 0.02 - 0.28 * Math.exp(-Math.max(0, tt - TL) * 7) * Math.max(0, Math.sin(Math.max(0, tt - TL) * 9)) * (tt > TL ? 1 : 0);
    const lidFly = (a, dx, dz, vy) => { const T = (vy + Math.sqrt(vy * vy + 2 * 9.8 * 0.69)) / 9.8, u = Math.min(1, a / T); C.can.lid.position.set(dx * u, a < T ? 0.74 + vy * a - 4.9 * a * a : 0.05, dz * u); C.can.lid.rotation.set(a < T ? a * 7 : 1.35, 0.4, a < T ? a * 4 : 0.3); };
    if (tt > CANL && tt < t.d15) lidFly(tt - CANL, 1.1, 0.5, 2.2);
    else if (tt >= t.d15 && tt > LIDPOP) lidFly(tt - LIDPOP, 1.6, -0.9, 3.0);
    else { C.can.lid.position.set(0, 0.74, 0); C.can.lid.rotation.set(0, 0, 0); }
    // the bell tower: drops on the shed ridge, later rides up onto the hall roof
    C.bell.g.visible = tt > BELL_LAND - 0.35;
    if (!hallUp) C.bell.g.position.set(0, RIDGE2 + S.rise - 0.12 + drop(tt, BELL_LAND - 0.35, 6, 0.35), 0);
    else C.bell.g.position.set(0, CD.hall.h + 0.1 + 0.2 * (1 - easeOutBack(u01(tt, BRICK0 + 0.1, BRICK1 + 0.2))), -1.7);
    { let sw = 0; for (const b of BONGS) if (tt > b - 0.15) sw = 0.55 * Math.exp(-(tt - b + 0.15) * 2.2) * Math.sin((tt - b + 0.15) * 9); C.bell.swing.rotation.z = sw; }
    // the gnome: flattened by column 4
    { const k = tt > CRUSH ? 1 : 0; C.gnome.body.scale.set(1 + 0.6 * k, k ? 0.16 : 1, 1 + 0.6 * k); C.gnome.g.visible = id !== 'mascot'; }
    // the hall: walls grow, columns drop, top drops
    C.hall.g.visible = hallUp;
    { const u = easeOutBack(u01(tt, BRICK0, BRICK1), 1.4); C.hall.body.scale.set(1, Math.max(0.001, u), 1); }
    C.hall.cols.forEach((c, k) => { c.visible = tt > COLS[k] - 0.02; c.position.y = 0.12 + drop(tt, COLS[k], 9, COLL); });
    C.hall.top.visible = tt > TOP0; C.hall.top.position.y = drop(tt, TOP0, 9, 0.3);
    // the neighbor's yard: pool until the stadium, then the field + stands
    const stadOn = tt > STAD0;
    C.pool.g.visible = !stadOn; C.stadium.g.visible = stadOn; C.fences.mid.visible = !stadOn;
    C.stadium.rows.forEach((r, k) => { const tk = STAD0 + 0.05 + Math.floor(k / 2) * 0.08; r.scale.set(1, Math.max(0.001, easeOutBack(u01(tt, tk, tk + 0.25), 2)), 1); });
    C.stadium.field.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, STAD0, STAD0 + 0.3))));
    C.stadium.board.visible = tt > STAD0 + 0.4;
    // Mom's table appears for day 45
    C.table.g.visible = tt > t.d45 - 0.2;
    C.gate.rotation.y = 1.35 * smooth(u01(tt, GATE0, GATE0 + 0.35));
    // day 100: ivy, banner, podium, clock tower, the far campus, chairs
    const d100 = tt > t.d100 - 0.05; C.setDay(d100 ? 1 : 0);
    C.hall.banner.visible = d100; C.hall.podium.visible = d100; C.chairs.forEach((c) => (c.visible = d100));
    C.hall.ivy.forEach((v, k) => { const tk = IVY0 + (k % 9) * 0.06 + Math.floor(k / 9) * 0.04; v.g.visible = tt > tk; v.g.scale.set(1, Math.max(0.001, easeOutBack(u01(tt, tk, tk + 0.35), 1.6)), 1); });
    C.tower.g.visible = tt > TOWER0; C.tower.g.position.y = -16 * (1 - easeOutBack(u01(tt, TOWER0, TOWER1), 1.3));
    C.tower.clock.set(d100 ? 2 : 4, d100 ? Math.floor(lerp(0, 30, u01(tt, TOWER0, TOWER1 + 2))) : 0);
    C.nwin.open.visible = tt > t.nbr - 0.02 && tt < t.d15; C.nwin.glass.visible = !C.nwin.open.visible;
  }

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; setWorld(sh); hideAll(); buildState(tt, id);
    crowd.hideAll(); hideCaps(); hideMinis(); dress(tt > t.d100 - 0.05);
    let crowdOn = false;

    // ----- HOOK: Max proudly hammers the last nail; the sign swings crooked on "university"
    if (id === 'hook') {
      max.root.visible = true; badge.visible = false; maxCap.visible = false; hammer.visible = true;
      const turn = smooth(u01(tt, t.univ - 0.75, t.univ - 0.35)), swing = tt < t.univ - 0.7 ? Math.max(0, Math.sin(tt * 13)) : 0;
      max.set({ x: -0.95, y: 0, z: 1.75, rotY: lerp(2.0, 0.35, turn), armR: { x: -2.2 + swing * 0.9, z: 0.25, el: 0.6 - swing * 0.4 }, armL: turn > 0.5 ? { x: -0.2, z: 0.5, el: 1.6 } : {},
        eyes: tt > t.univ + 0.15 ? 'wide' : 'open', mouth: tt > t.univ + 0.15 ? 'o' : 'grin', look: tt > t.univ + 0.1 ? [0.8, 0.35] : [0, 0], head: { y: tt > t.univ + 0.1 ? 0.45 : 0 }, brows: tt > t.univ + 0.1 ? 0.7 : -0.3, t: tt });
    }
    // ----- DAY 1: the classroom (front wall hidden): desk drops, whiteboard pops, he writes, sits, raises his hand
    if (id === 'class') {
      max.root.visible = true; badge.visible = false; maxCap.visible = false; hammer.visible = false;
      const sit = tt > t.student + 0.12, hopU = u01(tt, t.student - 0.12, t.student + 0.18);
      const writing = tt > t.board + 0.1 && tt < t.student - 0.15;
      const stand = [-0.45, 0.125, -0.42], seat = [0.35, 0.23, 0.03];
      if (!sit && hopU <= 0) {
        max.set({ x: stand[0], y: stand[1], z: stand[2], rotY: writing ? PI + 0.45 : tt > t.desk ? 0.7 : 0.15, armR: writing ? { x: -2.0 + 0.15 * Math.sin(tt * 22), z: 0.3, el: 0.4 } : { x: 0, z: 1.2, el: 0.4 }, armL: writing ? {} : { x: 0, z: 1.2, el: 0.4 },
          eyes: 'open', mouth: tt > t.desk && tt < t.board ? 'o' : 'grin', look: tt > t.desk - 0.1 && tt < t.board ? [0.7, -0.4] : [0, 0], t: tt });
      } else {
        const p = sit ? seat : arc(tt, t.student - 0.12, t.student + 0.18, stand, seat, 0.5);
        const raise = smooth(u01(tt, t.me - 0.25, t.me));
        max.set({ x: p[0], y: p[1], z: p[2], rotY: 0, legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 },
          armR: raise > 0 ? { x: 0, z: 0.4 + 2.4 * raise + 0.08 * Math.sin(tt * 18) * raise, el: 0.2 } : { x: -0.5, z: 0.2, el: 1.2 }, armL: { x: -0.5, z: 0.2, el: 1.2 },
          eyes: raise > 0.5 ? 'wide' : 'open', mouth: raise > 0.3 ? 'grin' : 'smile', brows: raise > 0.3 ? -0.2 : 0, look: [0, 0.1], lean: 0.08, t: tt });
      }
    }
    // ----- DAY 3: 2nd floor drops in; Max leaps from the window onto the trampoline … into the trash can
    if (id === 'floor2' || id === 'bell') {
      max.root.visible = true; badge.visible = false; maxCap.visible = false; hammer.visible = false;
      if (tt < JUMP0) {
        const shown = tt > F2_LAND + 0.05; max.root.visible = shown && id === 'floor2';
        max.set({ x: WIN[0], y: RIDGE0 + 0.06, z: WIN[2], rotY: 0, armL: { x: -0.4, z: 0.8, el: 1.0 }, armR: { x: -0.4, z: 0.8, el: 1.0 }, eyes: 'wide', mouth: 'grin', look: [0, -0.6], t: tt });
      } else if (tt < TL) {
        const p = arc(tt, JUMP0, TL, [WIN[0], RIDGE0 + 0.5, WIN[2] + 0.35], TRAMP_TOP, 0.55);
        max.set({ x: p[0], y: p[1], z: p[2], rotY: 0.2, armL: { x: 0, z: 2.6, el: 0.2 }, armR: { x: 0, z: 2.6, el: 0.2 }, legL: { x: -0.4, kn: 0.6 }, legR: { x: 0.3, kn: 0.2 }, eyes: 'wide', mouth: 'scream', brows: 0.8, t: tt });
      } else if (tt < CANL) {
        const u = u01(tt, TL + 0.05, CANL), p = tt < TL + 0.05 ? TRAMP_TOP : arc(tt, TL + 0.05, CANL, TRAMP_TOP, [CD.can[0], 0.38, CD.can[1]], 1.5), [sx, sy] = squash(tt, TL, 0.35);
        max.set({ x: p[0], y: p[1] - (tt < TL + 0.05 ? 0.15 : 0), z: p[2], rotY: 0.6, rx: PI * smooth(u), squash: [sx, sy], armL: { x: 0, z: 2.4 }, armR: { x: 0, z: 2.4 }, eyes: u > 0.5 ? 'spiral' : 'wide', mouth: 'scream', t: tt });
      } else {
        const k = Math.sin(tt * 16), [sx, sy] = squash(tt, CANL, 0.3);
        max.set({ x: CD.can[0], y: 0.38, z: CD.can[1], rotY: 0.6, rx: PI, squash: [sx, sy], legL: { x: 0.5 * k, kn: 0.6 + 0.4 * k }, legR: { x: -0.5 * k, kn: 0.6 - 0.4 * k }, armL: { x: 0, z: 2.4 }, armR: { x: 0, z: 2.4 }, eyes: 'spiral', mouth: 'wavy', t: tt });
      }
    }
    // ----- DAY 8: the bell rings (rings fly out); the neighbor at his window
    if (id === 'neighbor') {
      nbr.root.visible = true; ring.visible = false; drink.visible = false; protest.visible = false; nShades.visible = false;
      const out = smooth(u01(tt, t.nbr, t.nbr + 0.25)), fist = Math.sin(tt * 20);
      const P0 = [CD.nwin[0], CD.nwin[1] - 0.98, CD.nwin[2] - 0.4 + 0.1 * out];
      nbr.set({ x: P0[0], y: P0[1], z: P0[2], rotY: -0.25, lean: 0.15 + 0.35 * out, armR: tt > t.loves - 0.1 ? { x: -0.2, z: 2.3 + 0.25 * fist, el: 1.9 } : { x: -0.6, z: 0.5, el: 1.0 }, armL: { x: -0.7, z: 0.4, el: 1.2 },
        eyes: 'wide', mouth: tt > t.loves - 0.05 ? 'teeth' : 'o', brows: -1, faceTint: [0xff5a4a, 0.35 * smooth(u01(tt, t.nbr + 0.1, t.loves))], look: [-0.5, -0.1], t: tt });
      // the toupee: launched by the second BONG, flips off
      const a = tt - (BONGS[1] + 0.05); toupee.visible = true;
      if (a > 0) { toupee.position.set(-0.4 * a, 0.9 * a - 1.6 * a * a + 0.06, 0.2 * a); toupee.rotation.set(-a * 8, 0, a * 3); } else { toupee.position.set(0, 0, 0); toupee.rotation.set(0, 0, 0); }
    } else { toupee.position.set(0, 0, 0); toupee.rotation.set(0, 0, 0); }
    // ----- DAY 15: the raccoon climbs out of the can in a sweater; Max hands him the check
    if (id === 'mascot') {
      rac.root.visible = true; racCap.visible = false;
      const up = smooth(u01(tt, LIDPOP, LIDPOP + 0.35)), grab = tt > CHECK + 0.3;
      rac.set({ x: CD.can[0], y: 0.35 + 0.42 * up, z: CD.can[1] + 0.05, rotY: 0.25 + (grab ? 0.5 : 0), stand: up, wave: tt > t.raccoon - 0.1 && tt < CHECK ? 1 : 0, shades: tt > t.raccoon - 0.2, t: tt, look: grab ? [0.6, 0] : [0, 0] });
      max.root.visible = true; badge.visible = false; maxCap.visible = false; hammer.visible = false;
      const walk = u01(tt, CHECK - 0.45, CHECK), mp = [lerp(4.1, 3.0, walk), 0, lerp(1.6, 1.2, walk)];
      max.set({ x: mp[0], y: 0, z: mp[2], rotY: -1.25, walk: walk > 0 && walk < 1 ? tt * 11 : null, armL: { x: -1.3, z: 0.2, el: 0.3 }, armR: { x: -1.3, z: 0.2, el: 0.3 }, eyes: 'open', mouth: 'grin', brows: -0.3, t: tt });
      check.visible = tt > CHECK - 0.45;
      if (check.visible) { max.root.updateMatrixWorld(true); const h1p = max.hand(-1).getWorldPosition(V(0, 0, 0)), h2p = max.hand(1).getWorldPosition(V(0, 0, 0)); const mid = h1p.add(h2p).multiplyScalar(0.5); check.position.set(mid.x - 0.25 - (grab ? 0.15 : 0), mid.y + 0.1, mid.z + 0.1); check.rotation.set(0, 0.35, 0.05 * Math.sin(tt * 3)); check.scale.setScalar(grab ? 1 + 0.08 * Math.exp(-(tt - CHECK - 0.3) * 8) : 1); }
    }
    // ----- DAY 30: the hall rises; Max admires it (the gnome pays for it)
    if (id === 'hall') {
      max.root.visible = true; badge.visible = false; maxCap.visible = false; hammer.visible = false;
      const proud = tt > t.columns2 - 0.2;
      max.set({ x: 1.6, y: 0, z: 4.8, rotY: proud ? 0.25 : PI + 0.2, armL: proud ? { x: 0.2, z: 2.5, el: 0.3 } : { x: 0, z: 0.3 }, armR: proud ? { x: 0.2, z: 2.5, el: 0.3 } : { x: 0, z: 0.3 }, eyes: proud ? 'open' : 'wide', mouth: proud ? 'grin' : 'o', look: [0, 0.4], t: tt });
    }
    // ----- DAY 45: students pour in through the gate; Max (did not invite them); Mom = the dining hall
    if (id === 'students' || id === 'invite' || id === 'mom') {
      crowdOn = true;
      walkers.forEach((w, i) => {
        const s = walkerAt(w, tt); if (tt < w.ts) return;
        const run = s.moving, sw = Math.sin(tt * 12 + w.ph), atTable = w.queue && !run;
        crowd.set(i, { x: s.p[0], y: run ? Math.abs(sw) * 0.06 : 0, z: s.p[2], rotY: s.head, kick: run ? 1 : 0, t: tt, armL: run ? { x: sw * 0.8, z: 0.2 } : atTable && w.qk === 0 ? { x: -1.2, z: 0.2 } : { x: 0, z: 0.15 }, armR: run ? { x: -sw * 0.8, z: 0.2 } : { x: 0, z: 0.15 }, look: atTable ? [0, -0.3] : [0.3 * Math.sin(w.ph), 0.2], lean: run ? 0.15 : 0 });
      });
      max.root.visible = true; badge.visible = true; maxCap.visible = false; hammer.visible = false;
      const huh = tt > t.i - 0.1;
      max.set({ x: -1.8, y: 0, z: 6.0, rotY: huh ? 0.15 : -1.3, armL: huh ? { x: -0.5, z: 1.3, el: 0.6 } : {}, armR: huh ? { x: -0.5, z: 1.3, el: 0.6 } : {}, eyes: 'wide', mouth: huh ? 'wavy' : 'o', brows: 0.9, look: huh ? [0.3 * Math.sign(Math.sin(tt * 4)), 0.2] : [-0.8, 0], head: { z: huh ? 0.12 * Math.sin(tt * 3) : 0 }, t: tt });
      mom.root.visible = true; const ld = Math.sin(tt * 8);
      mom.set({ x: CD.table[0] + 0.25, y: 0, z: CD.table[1] - 0.62, rotY: 0.35, armR: { x: -1.0 + 0.45 * ld, z: 0.25, el: 1.0 + 0.3 * ld }, armL: { x: -0.9, z: 0.3, el: 0.9 }, eyes: tt > t.dining ? 'spiral' : 'wide', mouth: tt > t.dining ? 'wavy' : 'o', brows: 0.8, look: [0.4, -0.2], faceTint: [0xff7a7a, 0.12], t: tt });
    }
    // ----- DAY 60: the stadium; the neighbor on his float where the pool was; BONK
    if (id === 'stadium' || id === 'bonk') {
      crowdOn = true;
      C.stadium.seats.forEach((s, i) => { if (i >= 150) return; const tk = STAD0 + 0.05 + s.row * 0.08 + 0.12; if (tt < tk) return; const ch = Math.max(0, Math.sin(tt * 7 + i)); crowd.set(i, { x: s.x, y: s.y - 0.36 + 0.06 * ch, z: s.z, rotY: s.side === 'back' ? 0.15 * Math.sin(i) : -PI / 2, sit: 1, scale: Math.max(0.01, easeOutBack(u01(tt, tk, tk + 0.25))), armL: { x: 0, z: 1.2 + 1.2 * ch }, armR: { x: 0, z: 1.2 + 1.2 * Math.max(0, Math.sin(tt * 7 + i + 1.5)) }, look: [0, 0.2], t: tt }); });
      nbr.root.visible = true; ring.visible = true; drink.visible = true; protest.visible = false; nShades.visible = true; toupee.visible = true;
      const hit = tt > BONK, [hx, hy] = hit ? squash(tt, BONK, 0.35) : [1, 1];
      nbr.set({ x: NB[0], y: 0.02, z: NB[2], rotY: 0.2, legL: { x: -1.5, kn: 0.2 }, legR: { x: -1.5, kn: 0.25 }, armR: { x: -0.9, z: 0.3, el: 1.3 }, armL: { x: -0.2, z: 0.6, el: 0.4 }, squash: [hx, hy], lean: -0.1,
        eyes: hit ? 'x' : 'half', mouth: hit ? 'wavy' : 'flat', brows: hit ? 0.5 : -0.6, look: [0.4, 0], t: tt });
      dizzy.update(tt, hit ? 1 : 0, add(head(nbr), [0, 0.32, 0]));
      ball.visible = tt > BONK - 0.55 && tt < BONK + 0.9;
      if (ball.visible) { const hp = head(nbr), p = tt < BONK ? arc(tt, BONK - 0.55, BONK, [NB[0] + 5.5, 2.2, NB[2] - 1.5], add(hp, [0.05, 0.22, 0]), 1.2) : arc(tt, BONK, BONK + 0.9, add(hp, [0.05, 0.22, 0]), [NB[0] - 1.4, 0.1, NB[2] + 1.0], 1.0); ball.position.set(...p); ball.rotation.set(tt * 9, 0.6, tt * 4); }
    } else dizzy.update(tt, 0, [0, 0, 0]);
    // ----- DAY 61: the inspector walks up; FORTY PROBLEMS; the crowd gasps; everyone turns to the dean
    if (id === 'arrive' || id === 'decree' || id === 'gasp' || id === 'dean') {
      crowdOn = true;
      const turn = smooth(u01(tt, t.including + 0.05, t.dean + 0.1)), gasp = tt > t.handwritten;
      lawnCrowd.forEach((c, i) => { const toDean = Math.atan2(DEANP[0] - c.x, DEANP[2] - c.z), toSteps = Math.atan2(STEP[0] - c.x, STEP[2] - c.z); crowd.set(i, { x: c.x, y: 0, z: c.z, rotY: lerp(toSteps, toDean, turn * (0.7 + 0.3 * Math.sin(c.ph))), wide: gasp, armL: gasp && i % 3 === 0 ? { x: -2.2, z: 0.4 } : { x: 0, z: 0.15 }, armR: gasp && i % 2 === 0 ? { x: -2.4, z: 0.3 } : { x: 0, z: 0.15 }, look: [0, 0.3], mouthW: gasp ? 1.6 : 1, t: tt }); });
      insp.root.visible = true;
      const walkU = u01(tt, t.then - 0.1, t.every - 0.15), ip = [lerp(3.6, STEP[0], walkU), STEP[1] * smooth(u01(walkU, 0.7, 1)), lerp(5.6, STEP[2], walkU)];
      const raise = smooth(u01(tt, t.forty - 0.3, t.forty));
      insp.set({ x: ip[0], y: ip[1], z: ip[2], rotY: tt < t.every ? Math.atan2(STEP[0] - 3.6, STEP[2] - 5.6) : 0.0, walk: walkU > 0 && walkU < 1 ? tt * 10 : null,
        armR: raise > 0 ? { x: -0.2, z: 1.0 + 1.4 * raise, el: 0.6 } : { x: -0.6, z: 0.2, el: 0.9 }, armL: { x: -1.1, z: 0.25, el: 1.0 },
        eyes: tt > t.handwritten ? 'wide' : 'half', mouth: tt > t.handwritten ? 'o' : 'flat', brows: -0.8, look: tt > t.including ? [0.8, 0] : [0, 0], head: { y: tt > t.including ? 0.6 * turn : 0 }, t: tt });
      max.root.visible = true; badge.visible = true; maxCap.visible = false; hammer.visible = false;
      const sweat = tt > t.dean;
      max.set({ x: DEANP[0], y: DEANP[1], z: DEANP[2], rotY: 0.35 - 0.2 * turn, armL: sweat ? { x: -1.6, z: 0.3, el: 1.9 } : {}, eyes: sweat ? 'wide' : 'open', mouth: sweat ? 'wavy' : 'smile', brows: sweat ? 0.9 : 0, look: sweat ? [-0.4, 0] : [-0.6, 0], faceTint: sweat ? [0xff8080, 0.15] : [0, 0], t: tt });
    }
    // ----- NIGHT: the dean's office (library room) — Max at the desk; Scribe
    if (sh.set === 'lib') {
      const pov = !!sh.pov; max.root.visible = !pov; LIB.chair.visible = !pov; badge.visible = true; maxCap.visible = false; hammer.visible = false;
      const lid = tt < LID0 ? PI / 2 - 0.02 : lerp(PI / 2 - 0.02, -0.22, easeOutBack(u01(tt, LID0, LID1)));
      LIB.laptop.hinge.rotation.x = lid; LIB.scrL.intensity = tt > LID0 ? 1.6 : 0;
      const mode = tt < FLASH ? 'home' : tt < SOLVE0 ? 'scan' : tt < WRITE0 ? 'solve' : tt < WRITE1 + 0.2 ? 'write' : 'done';
      const k = mode === 'scan' ? u01(tt, SCAN0, SOLVE0) : mode === 'solve' ? u01(tt, SOLVE0, SOLVE1) : 0;
      sheet.draw(writeP(tt)); screen.draw({ mode, k });
      LIB.setClock(11, tt > t.writes ? 3 : 2);
      const cooked = tt > t.cooked - 0.05 && tt < t.so + 0.1, writing = tt > WRITE0 && tt < WRITE1, happy = tt > t.oneshot;
      max.set({ x: TY[0], y: TY[1], z: TY[2], rotY: 0, legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 }, lean: happy ? -0.05 : 0.3, t: tt,
        armL: { x: -0.35, z: 0.4, el: 1.5 }, armR: tt > LID0 - 0.1 && tt < LID1 + 0.15 ? { x: -1.5, z: 0.35, el: 0.3 } : { x: -0.35, z: 0.4, el: 1.5 },
        eyes: cooked ? 'spiral' : happy ? 'wide' : 'half', mouth: cooked ? 'wavy' : happy ? 'grin' : 'flat', brows: cooked ? 0.9 : happy ? -0.4 : 0.5,
        look: happy ? [0.35, -0.35] : [-0.15, -0.6], head: { x: 0.12, z: cooked ? 0.1 * Math.sin(tt * 18) : 0 }, faceTint: happy ? [0xffd0d0, 0.1] : [0, 0] });
      shotHand.visible = id === 'photo'; if (shotHand.visible) { const u = smooth(u01(tt, t.one - 0.1, t.photo - 0.05)); shotHand.position.set(LD.sheet[0] + 0.05, Y + lerp(0.55, 0.4, u), LD.sheet[1] + lerp(0.5, 0.2, u)); shotHand.rotation.set(0.1, 0, 0); flashSpr.material.opacity = tt > FLASH ? 1 - u01(tt, FLASH, FLASH + 0.25) : 0; }
      pen.g.visible = tt > PEN0 && tt < WRITE1 + 0.25;
      if (pen.g.visible) {
        const tip = tipWorld(writeP(tt)), loc = LIB.root.worldToLocal(V(...tip)), from = V(LD.laptop[0], Y + 0.25, LD.laptop[1]), u = smooth(u01(tt, PEN0, WRITE0)), scrib = tt > WRITE0 ? 0.004 * Math.sin(tt * 60) : 0;
        pen.g.position.set(lerp(from.x, loc.x, u) + scrib, lerp(from.y + 0.15, loc.y + 0.004, u) + (1 - u) * 0.2 * Math.sin(u * PI), lerp(from.z, loc.z, u)); pen.g.rotation.set(-0.5, 0.4, -0.55 + scrib * 20); pen.glow.material.opacity = 0.6 + 0.3 * Math.sin(tt * 20);
      }
      const pages = tt < WRITE0 ? 0 : Math.min(6, Math.floor(1 + 6 * u01(tt, t.graph, WRITE1))); stackPages.forEach((m, i) => { m.visible = i < pages; m.position.y = 0.003 + i * 0.004; });
    }
    // ----- the inspector's office: two sheets side by side → PERFECT MATCH → ACCREDITED
    if (sh.set === 'office') {
      insp.root.visible = true; old.draw(old.total, false); sheet.draw(N);
      const P0 = O(0, 0, 0.05), react = tt > t.perfect - 0.05, darts = Math.sign(Math.sin((tt - t.holds) * 7.5)), acc = tt > t.accredited;
      insp.set({ x: P0[0], y: P0[1], z: P0[2], rotY: 0, armL: { x: -0.9, z: 1.0, el: 0.9 }, armR: { x: -0.9, z: 1.0, el: 0.9 }, eyes: react ? 'wide' : 'half', mouth: acc ? 'grin' : react ? 'o' : 'flat', brows: react ? 1 : -0.6,
        look: react ? [0, 0.2] : [darts * 0.7, -0.3], head: { x: react ? -0.1 : 0.1, y: react ? 0 : darts * 0.12 }, t: tt });
      const sep = 0.47 + 0.04 * Math.sin((tt - t.holds) * 2.2) * (react ? 0 : 1);
      profSheets.forEach((m, i) => { m.position.set((i ? 1 : -1) * sep, 0.98 + (react && i ? 0.05 * Math.exp(-(tt - t.perfect) * 6) : 0), 0.42); m.rotation.set(-0.08, (i ? -1 : 1) * 0.14, (i ? -1 : 1) * 0.05); });
      accMark.visible = acc; if (acc) { const u = clamp((tt - t.accredited) / 0.14); accMark.scale.setScalar(2.2 - 1.2 * u * u); }
    }
    // ----- DAY 100: graduates on the quad (seated, then standing + caps fly), the far crowd, the podium, the neighbor's protest
    if (tt > t.d100 - 0.05 && sh.set === 'campus') {
      crowdOn = true;
      const stand = tt > CAPS - 0.25;
      C.chairSpots.forEach((s, i) => {
        if (i >= 120) return;
        const jump = stand ? Math.max(0, Math.sin((tt - CAPS) * 8 + i)) * 0.12 : 0;
        crowd.set(i, { x: s.x, y: stand ? jump : 0.465 - 0.36, z: s.z, rotY: PI + 0.1 * Math.sin(i), sit: stand ? 0 : 1, armL: stand ? { x: 0, z: 2.5 } : { x: -0.5, z: 0.2 }, armR: stand ? { x: 0, z: 2.5 } : { x: -0.5, z: 0.2 }, look: [0, 0.3], mouthW: stand ? 1.5 : 1, wide: stand, t: tt });
        const hy = (stand ? jump : 0.465 - 0.36 + (1.12 - 0.0)) + (stand ? 1.12 : 0) + 0.24;
        capOf(i, s.x, hy, s.z, tt);
      });
      minis.forEach((m, i) => {
        const jump = stand ? Math.max(0, Math.sin((tt - CAPS) * 7 + m.ph)) * 0.15 : 0.03 * Math.sin(tt * 2 + m.ph);
        Q.identity(); M4.compose(PV.set(m.x, 0.55 * m.s + jump, m.z), Q, SV.set(m.s, m.s, m.s)); miniBody.setMatrixAt(i, M4);
        M4.compose(PV.set(m.x, 1.2 * m.s + jump, m.z), Q, SV.set(m.s, m.s, m.s)); miniHead.setMatrixAt(i, M4);
        capOf(NCAP + i, m.x, 1.42 * m.s + jump, m.z, tt, m.cap);
      });
    }
    if (id === 'podium' || id === 'protest' || id === 'quad') {
      rac.root.visible = id !== 'quad'; racCap.visible = true;
      rac.set({ x: CD.podium[0], y: CD.podium[1] + 1.1, z: CD.podium[2] - 0.05, rotY: 0, stand: 1, wave: tt > t.class ? 1 : 0, shades: true, t: tt });
      diploma.visible = rac.root.visible; if (diploma.visible) diploma.position.set(CD.podium[0] + 0.2, CD.podium[1] + 1.1 + 0.62 + (tt > t.top ? 0.25 * smooth(u01(tt, t.top, t.top + 0.3)) : 0), CD.podium[2] + 0.12);
      max.root.visible = id === 'podium'; badge.visible = true; maxCap.visible = true; hammer.visible = false;
      max.set({ x: CD.podium[0] - 0.62, y: CD.podium[1], z: CD.podium[2] + 0.95, rotY: 0.5, armL: { x: -0.3, z: 0.4, el: 0.5 }, armR: tt > t.top ? { x: 0, z: 2.4, el: 0.4 } : { x: -1.0, z: 0.5, el: 0.4 }, eyes: 'open', mouth: 'grin', look: [0.6, 0.2], t: tt });
      nbr.root.visible = id === 'protest'; ring.visible = true; drink.visible = false; protest.visible = id === 'protest'; nShades.visible = false; toupee.visible = true;
      const angry = Math.sin(tt * 9);
      nbr.set({ x: 0.42, y: 0, z: 9.3, rotY: 0.05, armR: { x: -0.35, z: 2.75 + 0.12 * angry, el: 0.35 }, armL: { x: -0.5, z: 0.5, el: 1.0 }, eyes: 'open', mouth: 'teeth', brows: -1, faceTint: [0xff5a4a, 0.3], look: [0.4, 0], t: tt, head: { z: 0.06 * angry } });
    }
    if (protest.visible) { const hp = nbr.hand(1).getWorldPosition(V(0, 0, 0)); protest.position.set(hp.x, hp.y - 0.35, hp.z + 0.04); protest.rotation.set(0, 0.05, -0.08 + 0.06 * Math.sin(tt * 9)); }
    // the hall crowd on the inspector day / grads / students — commit
    crowd.commit(); capSkull.instanceMatrix.needsUpdate = true; capBoard.instanceMatrix.needsUpdate = true; miniBody.instanceMatrix.needsUpdate = true; miniHead.instanceMatrix.needsUpdate = true;
    if (!crowdOn) crowd.hideAll(), crowd.commit();

    // ----- camera
    const cam = sh.rail ? sh.rail.at(tt) : sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(d, 8));
    if (sh.set === 'campus') C.aimSun(cam.look[0], Math.max(0, cam.look[1] - 2), cam.look[2], clamp(d * 0.8, 8, 40));
    if (sh.set === 'campus') { const gold = tt > t.d100 - 0.05 ? 1 : 0; C.sun.color.setHex(gold ? 0xffd9a8 : 0xfff0d8); C.sun.intensity = gold ? 3.1 : 2.9; }
    studio.fill.intensity = 0.55; studio.fill.distance = 9;
    if (id === 'bell' || id === 'neighbor') {   // BONG: rings fly out of the bell
      const bp = C.bell.g.position;
      BONGS.forEach((b, k) => { const a = tt - b, m = ringMeshes[k]; if (a < 0 || a > 1.4) return; m.visible = true; m.position.set(bp.x, bp.y + 1.0, bp.z + 0.1); m.lookAt(studio.camera.position); m.scale.setScalar(0.5 + a * 6); m.material.opacity = 0.75 * (1 - a / 1.4); });
    }
    fx.update(tt, studio.camera);
    hud.update(tt);
  }
  // a mortarboard: on the head, then thrown at CAPS (ballistic, spinning), landing on the lawn
  function capOf(i, x, y, z, tt, rr) {
    const r = rr || [((i * 37) % 100) / 100, ((i * 61) % 100) / 100, ((i * 13) % 100) / 100];
    if (tt < CAPS) { setCap(i, x, y, z, 0, r[0] * TAU, 0, 1); return; }
    const a = tt - CAPS, vy = 6 + r[1] * 3, vx = (r[0] - 0.5) * 2.4, vz = (r[2] - 0.5) * 2.4, h = Math.max(0.03, y + vy * a - 4.9 * a * a);
    setCap(i, x + vx * a, h, z + vz * a, a * (4 + r[1] * 6), r[0] * TAU + a * 3, a * (3 + r[2] * 5), 1);
  }
  // sweat drops off the dean's face
  fx.burst('drops', t.dean + 0.05, { pos: add(DEANP, [-0.2, 1.45, 0.2]), n: 6, color: 0xbfe6ff, speed: [0.4, 1.0], spread: 0.6, dir: [-1, 1, 0], size: [0.015, 0.025] });
  fx.burst('drops', t.dean2 + 0.05, { pos: add(DEANP, [0.2, 1.45, 0.2]), n: 6, color: 0xbfe6ff, speed: [0.4, 1.0], spread: 0.6, dir: [1, 1, 0], size: [0.015, 0.025] });

  // QC (`node tools/render.mjs 050-shed-university --qc`): faces under the caption / callouts, shot lengths, counts
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0);
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of [['Max', max], ['Mom', mom], ['the neighbor', nbr], ['the inspector', insp]]) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        if (hx < 0.32 && hy > 0.06 && hy < 0.2) bands.push(['the DAY box', 0.13, 0.07]);
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    out.push(`counts: kicks ${KICKS.length} (${KICKS.filter((k) => k[1] >= 0.8).length} full-strength), fx bursts ${FXN.burst} + streams ${FXN.stream}, callouts ${story.callouts.length}`);
    update(0); return out;
  };
  update(0);
  return { update };
}
