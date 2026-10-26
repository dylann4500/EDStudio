// 015 — "How a Hole Becomes a Subway" (build genre, docs/BUILD.md). One cutaway diorama (engine/build/subway.js), Gary the
// toon as the recurring victim, a gag + an effect on almost every phrase. Every time below comes from the narration:
// W(beat, word) = when that word is spoken (story.json from tools/narrate.py), so re-voicing (scratch → ElevenLabs) keeps
// every gag on its word.
//
// Facts (web-searched Oct 26 2026):
//   NYC base fare $3.00 since Jan 4 2026 (CBS New York / ABC7, "MTA fare increases to $3").
//   Second Avenue Subway Phase 2: $7.7 B for 1.8 mi ≈ $4.3 B per mile (NY Post via Yahoo; ENR; NY YIMBY Aug 2025).
//   TBMs average ~10–30 m/day; metro projects ~13–18 m/day (Dubai Blue Line 15 m/day, Quito 15–18) → "about 50 feet a day".
//   NYC subway third rail: 625 V DC nominal (ETHW "Lewis B. Stillwell"; Wikipedia NYC Subway infobox 600–650 V).
//   MTA pump rooms remove ~13 million gallons on a dry day (NY1, Apr 2018; THE CITY 2021: 14 M).
//   Lining ring ≈ 132,000 lb ≈ 60 t, 8 segments (Metrolinx, Scarborough Subway Extension).
//   Hand excavation ≈ 3 m³ per worker-day (CPWD / DPWH output norms) → a 3-mile, ~6 m tunnel ≈ 114,000 m³ ≈ 100 years alone.
//   "Longer than a football field": metro TBMs with their trailing gear run ~100–140 m (Second Ave TBM "Adi" ~450 ft).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { KV, clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, unpop, drop, squash, wobble, shake, u01, easeOutBack, camAt } from '@engine/build/anim.js';
import { makeFX, makeArrows, makeDizzy } from '@engine/build/fx.js';
import { makeToon, makeRaccoon, makePigeon } from '@engine/build/toon.js';
import { buildSubway, D, tunnelHalf, makeShovel, makeCroissant, makeHalfRing } from '@engine/build/subway.js';

const T = D.T, PI = Math.PI;
const BAND = [T.y - tunnelHalf, T.y + tunnelHalf];          // tunnel band on the cut face
const HOLE = D.hole, HX = (HOLE[0] + HOLE[1]) / 2;          // Gary's hole (x -7.6..-5.8)
const STAND_Z = -1.4;                                        // where people stand inside the shaft

export async function build(studio, story) {
  const S = await buildSubway(studio), B = beatClock(story), W = B.W, scene = S.root;
  const s0 = (id) => B.T(id).t0, s1 = (id) => B.T(id).t1;
  const fx = makeFX(scene);
  const label = (txt, size = 0.5, color = '#fff') => { // camera-facing text sprite ("?", "WET FLOOR")
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.font = '200px "Luckiest Guy", Arial Black'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 22; g.strokeStyle = '#1b1b1b'; g.strokeText(txt, 128, 140); g.fillStyle = color; g.fillText(txt, 128, 140);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(size); scene.add(sp); return sp;
  };

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const baker = makeToon({ shirt: 0xffffff, pants: 0x8a8f99, hair: 0x2f2f2f, hairStyle: 'side', hat: 'chef', mustache: true, skin: 0xe8b48c }); S.plug.add(baker.root);
  const commuterLook = [[0xd9534f, 0x2f3542, 0x3b2a20, 'side', 0xf0c8a0], [0xf2c14e, 0x4a5568, 0x111111, 'messy', 0xc68a5e], [0x8a5bd9, 0x2d3436, 0x7a4a2a, 'tuft', 0xf2c29a], [0x58b368, 0x3d3d3d, 0xd8b26a, 'side', 0xe9b48f], [0xff8a3d, 0x2c3e50, 0x222222, 'none', 0x8d5a3b]];
  const commuters = commuterLook.map(([shirt, pants, hair, hs, skin]) => { const c = makeToon({ shirt, pants, hair, hairStyle: hs, skin, hat: hs === 'none' ? 'cap' : null, hatColor: 0x2f6fd6 }); scene.add(c.root); return c; });
  const raccoon = makeRaccoon(); scene.add(raccoon.root);
  const pigeon = makePigeon(); scene.add(pigeon.root);
  const dizzy = makeDizzy(scene);
  const clipboard = new THREE.Group(); mk(new THREE.BoxGeometry(0.2, 0.28, 0.02), mat(0xa77b4f, 0.7), clipboard); mk(new THREE.BoxGeometry(0.17, 0.22, 0.01), mat(0xffffff, 0.8), clipboard, 0, -0.01, 0.012); clipboard.position.set(0, -0.05, 0.08); clipboard.rotation.x = -0.6; gary.hand(1).add(clipboard);
  const handShovel = makeShovel(); handShovel.scale.setScalar(0.62); handShovel.rotation.set(1.3, 0, 0); handShovel.position.set(0, 0, 0.05); gary.hand(1).add(handShovel);
  const handCroissant = makeCroissant(); handCroissant.position.set(0, 0.02, 0.08); gary.hand(-1).add(handCroissant);
  // cobweb + spider on Gary's hard hat (the 100-year gag)
  const webT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(a) * 62, 64 + Math.sin(a) * 62); g.stroke(); } for (let r = 12; r < 64; r += 12) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i / 8) * PI * 2; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.stroke(); } const t = new THREE.CanvasTexture(c); return t; })();
  const web = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide })); web.position.set(0.12, 0.3, 0.12); web.rotation.set(-0.5, 0.4, 0); gary.hat.add(web);
  const spider = new THREE.Group(); mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0x111111, 0.4), spider); for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const l = mk(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4), mat(0x111111), spider, sd * 0.04, -0.01, -0.03 + i * 0.02); l.rotation.z = sd * 1.0; }
  const thread = mk(new THREE.CylinderGeometry(0.002, 0.002, 1, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), spider, 0, 0.5, 0); gary.hat.add(spider);
  // dirt mound (after the cave-in), sponge, cheese wedge, goalposts, donut, loose ring segment, wet-floor sign, puddle on the road
  const dirtM = new THREE.MeshStandardMaterial({ color: 0x6b4426, roughness: 1, flatShading: true });
  const mound = mk(new THREE.SphereGeometry(1.2, 18, 10, 0, PI * 2, 0, PI / 2), dirtM, scene, HX, 0, -1.6); mound.scale.set(1, 0.5, 1.4);
  const sponge = new THREE.Group(); scene.add(sponge); sponge.position.set(-3.4, -5.1, 0);
  const spT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#f7d038'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { g.fillStyle = '#c9a21c'; g.beginPath(); g.ellipse((i * 53) % 128, (i * 37) % 128, 5, 4, 0, 0, 7); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  mk(new RoundedBoxGeometry(0.9, 0.5, 0.5, 3, 0.08), new THREE.MeshStandardMaterial({ map: spT, roughness: 0.9 }), sponge);
  mk(new RoundedBoxGeometry(0.9, 0.12, 0.5, 3, 0.04), mat(0x58b368, 0.8), sponge, 0, 0.3, 0);
  const cheese = new THREE.Group(); scene.add(cheese);
  { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.1, 0); sh.lineTo(0, 0.75); sh.closePath(); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false }); geo.translate(-0.37, -0.25, -0.35);
    const cT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffcf3d'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 9; i++) { g.fillStyle = '#e0a91e'; g.beginPath(); g.arc((i * 47) % 120 + 4, (i * 29) % 120 + 4, 6 + (i % 3) * 4, 0, 7); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    mk(geo, new THREE.MeshStandardMaterial({ map: cT, roughness: 0.6 }), cheese); }
  const goalM = mat(0xf2c418, 0.4);
  const goals = [0, 1].map(() => { const g = new THREE.Group(); scene.add(g); mk(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), goalM, g, 0, 0.65, 0); mk(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), goalM, g, 0, 1.3, 0).rotation.x = PI / 2; for (const z of [-0.8, 0.8]) mk(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), goalM, g, 0, 2.0, z); return g; });
  const donut = new THREE.Group(); scene.add(donut);
  { const ang = Math.acos(T.z / T.R) * 2; const tor = mk(new THREE.TorusGeometry(T.R - 0.08, 0.32, 16, 40, ang), mat(0xd8a35a, 0.6), donut); tor.rotation.set(0, PI / 2, -ang / 2); const ice = mk(new THREE.TorusGeometry(T.R - 0.08, 0.27, 16, 40, ang), mat(0xff8fc1, 0.35), donut, -0.07, 0, 0); ice.rotation.copy(tor.rotation);
    const sp = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.018, 0.06, 2, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), 80); const R = (k) => (Math.sin(k * 91.7) * 43758.5) % 1; const cols = [0xffffff, 0x3ec7ff, 0xffd23f, 0x58d36b, 0xb36bff];
    for (let i = 0; i < 80; i++) { const a = -ang / 2 + Math.abs(R(i)) * ang, r = T.R - 0.08 + (Math.abs(R(i + 7)) - 0.5) * 0.3, m4 = new THREE.Matrix4().compose(new THREE.Vector3(-0.33, Math.sin(a) * r, -Math.cos(a) * r), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.abs(R(i + 3)) * 6, Math.abs(R(i + 5)) * 6, 0)), new THREE.Vector3(1, 1, 1)); sp.setMatrixAt(i, m4); sp.setColorAt(i, new THREE.Color(cols[i % 5])); }
    donut.add(sp); }
  const looseSeg = new THREE.Group(); scene.add(looseSeg);
  { const sh = new THREE.Shape(); sh.absarc(0, 0, 1.0, 0.2, 1.2, false); sh.absarc(0, 0, 0.8, 1.2, 0.2, true); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false }); geo.translate(-0.55, -0.6, -0.4); mk(geo, mat(0xbdbab2, 0.92), looseSeg); }
  const wetSign = new THREE.Group(); scene.add(wetSign);
  { const wT = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#ffd400'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#111'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText('CAUTION', 64, 40); g.fillText('WET', 64, 90); g.fillText('FLOOR', 64, 122); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    for (const s of [-1, 1]) { const p = mk(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshStandardMaterial({ map: wT, side: THREE.DoubleSide }), wetSign, 0, 0.27, s * 0.09); p.rotation.x = s * 0.3; } }
  const roadPuddle = mk(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: 0x6fa8cc, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.8 }), scene, -4.6, 0.02, -6.6); roadPuddle.rotation.x = -PI / 2;
  // "water table": a glowing line traced along the top of the wet layer (fades in once, out once)
  const wetGlow = [[-16, HOLE[0]], [HOLE[1], 34]].map(([a, b]) => { const pts = []; for (let x = a; x <= b + 1e-6; x += 0.2) pts.push(new THREE.Vector3(x, D.layer.clay + 0.09 * Math.sin(x * 1.1 + 3) + 0.05 * Math.sin(x * 3.3 + 6) + 0.03 * Math.sin(x * 8), 0.02));
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.045, 6, false), new THREE.MeshBasicMaterial({ color: 0x8ae4ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); scene.add(m); return m; });
  const qMark = label('?', 0.55, '#ffd43b');
  const extraCroissants = [0, 1, 2, 3].map(() => { const c = makeCroissant(); c.scale.setScalar(1.6); scene.add(c); return c; });
  const shovel = S.shovel;
  const raft = mk(new RoundedBoxGeometry(0.8, 0.08, 0.5, 2, 0.03), mat(0xb07f4a, 0.85), scene, 0, 0, 0);
  const airIn = makeArrows(scene, [[8.6, 1.2, 0.05], [8.6, -4.6, 0.05], [10.6, -5.6, 0.05]], { color: 0x9fe3ff, count: 9, size: 0.38, speed: 2.4 });
  const airOut = makeArrows(scene, [[11.8, -5.6, 0.05], [13.6, -4.6, 0.05], [13.6, 1.3, 0.05]], { color: 0xb6dd5c, count: 9, size: 0.38, speed: 2.4 });
  const route = makeArrows(scene, [[-5.6, -4.6, 0.15], [32, -4.6, 0.15]], { color: 0xffd43b, count: 16, size: 1.1, speed: 7, emissive: 0.9 });
  const cobShovel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide })); scene.add(cobShovel);

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    shovel: W('hook', 'shovel'), dig: W('hook', 'dig'), digEnd: s1('hook') + 0.15, congrats: W('congrats', 'congratulations'),
    racc: W('congrats', 'raccoon'), walkIn: W('cavein', 'your') - 0.15, climbs: W('cavein', 'climbs'), inspect: W('cavein', 'inspect'), thumbs: W('cavein', 'it'),
    walls: W('cavein', 'walls'), cave: W('cavein', 'cave'), fossil: W('cavein', 'gary', 2),
    digOut: W('shoring', 'dig'), out: W('shoring', 'out'), brace: W('shoring', 'brace'), beams: W('shoring', 'beams'), shoring: W('shoring', 'shoring'), hug: W('shoring', 'hug'),
    deeper: W('water', 'dig'), pours: W('water', 'water'), table: W('water', 'water', 2), soggy: W('water', 'soggy'), sponge: W('water', 'sponge'), back: W('water', 'gary'),
    install: W('pumps', 'install'), never: W('pumps', 'never'), ny: W('pumps', 'new'),
    sideways: W('byhand', 'sideways'), withOne: W('byhand', 'with'), years: W('byhand', 'years'), beard: W('byhand', 'garys'), floor: W('byhand', 'floor'),
    bring: W('tbm', 'bring'), tunnel: W('tbm', 'tunnel'), giant: W('tbm', 'giant'), cheese: W('tbm', 'cheese'), longer: W('tbm', 'longer'), chews: W('tbm', 'it'),
    unfort: W('sink', 'unfortunately'), bakery: W('sink', 'bakery'), settle: W('sink', 'settlement'), sinking: W('sink', 'sinking'), crois: W('sink', 'croissants'),
    behind: W('rings', 'behind'), bolts: W('rings', 'bolts'), place: W('rings', 'place'), each: W('rings', 'each'), tons: W('rings', '60'), holds: W('rings', 'holds'), donut: W('rings', 'donut'),
    miles: W('air', 'miles'), awful: W('air', 'awful'), passed: W('air', 'gary'), so: W('air', 'so'), vent: W('air', 'add'), fans: W('air', 'fans'), fresh: W('air', 'fresh'),
    trains: W('power', 'trains'), third: W('power', 'third'), volts: W('power', '625'), dont: W('power', 'dont'), garyT: W('power', 'gary', 2), zap: W('power', 'touched'),
    stations: W('finish', 'stations'), esc: W('finish', 'escalators'), turn: W('finish', 'turnstiles'), map: W('finish', 'map'), puddle: W('finish', 'puddle'),
    end: W('end', 'congratulations'), started: W('end', 'started'), now: W('end', 'now'), ride: W('end', 'every'), stuck: W('end', 'gary'), racEnd: W('end', 'raccoon'), free: W('end', 'free'),
  };
  const END = story.duration;

  // ---------------------------------------------------------------- the hole / shaft over time
  const DIG_DEPTH = 2.6;
  function holeState(tt) {
    // returns { rect: [x0, y0, x1, y1] | null, rough, burrow, side }
    if (tt < t.dig) return null;
    if (tt < t.cave) { // dig in 5 scoops, then hold; walls close after the cave
      const u = clamp((tt - t.dig) / (t.digEnd - t.dig)), k = Math.min(4, Math.floor(u * 5)), f = u * 5 - k;
      const depth = DIG_DEPTH * (u >= 1 ? 1 : (k + smooth(clamp(f * 1.6))) / 5);
      return { rect: [HOLE[0], -depth, HOLE[1], 0.3], rough: 0.06, burrow: tt > t.racc - 0.3 && tt < t.cave };
    }
    if (tt < t.digOut) { const k = clamp((tt - t.cave) / 0.45); if (k >= 1) return null; const c = 0.9 * smooth(k); return { rect: [HOLE[0] + c, -DIG_DEPTH * (1 - smooth(k) * 0.6), HOLE[1] - c, 0.3], rough: 0.1 }; }
    if (tt < t.deeper) { const k = clamp((tt - t.digOut) / (t.out + 0.25 - t.digOut)); return { rect: [HOLE[0], -3.0 * smooth(k), HOLE[1], 0.3], rough: 0.06 }; }
    if (tt < t.bring + 0.2) {
      const k = clamp((tt - t.deeper) / 0.7), bot = -3.0 - 2.2 * smooth(k);
      const side = tt > t.withOne ? clamp((tt - t.withOne) / (t.floor - t.withOne)) * 0.75 : 0;
      return { rect: [HOLE[0], bot, HOLE[1], 0.3], rough: 0.06, side };
    }
    return { rect: [D.launch[0], -8.0, D.launch[1], 0.3], rough: 0.05, launch: true };
  }
  const bottomAt = (tt) => { const h = holeState(tt); return h ? h.rect[1] : 0; };

  // ---------------------------------------------------------------- the TBM path (x of its shield front)
  const TBM_X0 = -4.75;
  const tbmX = (tt) => {
    if (tt < t.chews) return TBM_X0;
    if (tt < s1('sink')) return lerp(TBM_X0, 9.0, (tt - t.chews) / (s1('sink') - t.chews));
    if (tt < s0('air')) return lerp(9.0, 12.5, (tt - s1('sink')) / (s0('air') - s1('sink')));
    return 12.5 + Math.pow(Math.max(0, tt - s0('air')), 2) * 30; // zooms off "miles" down the tunnel
  };
  const tbmLand = t.tunnel;
  const tunnelFront = (tt) => (tt < t.chews ? (tt > tbmLand ? D.launch[1] : -99) : Math.min(34.5, tbmX(tt) + 0.5));
  // when each ring appears: the batch in the rings beat, then right behind the tail as the machine moves on
  const ringT = S.rings.map((r) => {
    const batchEnd = tbmX(t.place) - 4.2;
    if (r.x < batchEnd) return lerp(t.behind + 0.2, t.place + 0.2, (batchEnd - r.x) / Math.max(1, batchEnd - T.x0)); // from the tail backwards
    for (let tt = t.place; tt < END; tt += 0.02) if (tbmX(tt) - 4.6 > r.x) return tt;
    return 1e9;
  });

  // ---------------------------------------------------------------- the bakery block (settlement) — drop (m) + tilt (rad)
  const plugDrop = (tt) => (tt < t.settle - 0.5 ? 0 : tt < t.sinking ? 0.4 * easeOutBack(u01(tt, t.settle - 0.5, t.settle - 0.1)) : tt < t.bolts ? 0.4 + 0.95 * smooth(u01(tt, t.sinking, t.sinking + 1.6)) + wobble(tt, t.sinking + 1.6, 0.05)
    : tt < t.holds ? lerp(1.35, 0.6, smooth(u01(tt, t.bolts, t.place + 0.3))) : 0.6 * (1 - easeOutBack(u01(tt, t.holds, t.holds + 0.5))));
  const plugTilt = (tt) => plugDrop(tt) * 0.075;
  const PLUG_C = new THREE.Vector2((D.plug[0] + D.plug[1]) / 2, -2.2);

  // ---------------------------------------------------------------- effects scheduled from the narration
  // hook: shovel stab + 5 scoops of dirt
  fx.burst('dust', t.shovel + 0.3, { pos: [HX, 0.1, -1.2], n: 8, speed: [0.5, 1.2], spread: 1.3 });
  for (let k = 0; k < 5; k++) { const tk = t.dig + ((k + 0.6) / 5) * (t.digEnd - t.dig), d = (DIG_DEPTH * (k + 1)) / 5; fx.burst('dirt', tk, { pos: [HX, -d + 0.3, -0.6], n: 26, dir: [0.35, 1, 0.3], spread: 0.45, speed: [4, 6.5], floor: -d, seed: 40 + k }); }
  fx.burst('confetti', t.congrats, { pos: [HX, 0.2, -0.6], n: 220, dir: [0, 1, 0.2], spread: 0.55, speed: [5, 8], seed: 3 });
  fx.burst('confetti', t.congrats + 0.15, { pos: [HX - 1.5, 0.3, 0.2], n: 90, dir: [0.4, 1, 0.3], spread: 0.6, speed: [4, 6], seed: 4 });
  fx.burst('dirt', t.racc - 0.15, { pos: [HOLE[0] + 0.1, -2.4, -0.6], n: 14, dir: [1, 0.6, 0.2], spread: 0.5, speed: [1, 2], floor: -2.6, size: [0.03, 0.06] });
  // cave-in
  fx.stream('dirt', t.walls, t.cave, { pos: [HX, -0.2, -0.3], box: [1.8, 0.1, 0.4], rate: 30, dir: [0, -1, 0], spread: 0.3, speed: [0.2, 1], size: [0.03, 0.07], seed: 7 });
  fx.burst('dirt', t.cave, { pos: [HX, -0.8, -0.2], box: [2.0, 1.6, 0.5], n: 160, dir: [0, 1, 0.3], spread: 1.1, speed: [2, 5], floor: -2.6, seed: 8 });
  fx.burst('dust', t.cave + 0.05, { pos: [HX, 0.2, 0.2], box: [2.4, 0.6, 0.6], n: 26, speed: [0.6, 2], spread: 1.3, seed: 9 });
  // dig out + Gary launched out
  fx.burst('dirt', t.out, { pos: [HX, -1.5, -0.4], n: 120, dir: [0, 1, 0.2], spread: 0.5, speed: [5, 9], floor: -3.0, seed: 11 });
  fx.burst('dust', t.out, { pos: [HX, 0.3, 0.1], n: 16, speed: [0.5, 1.6], spread: 1.3, seed: 12 });
  // shoring clunks
  // water: deeper dig, jets from the wet layer, sponge squeeze
  fx.burst('dirt', t.deeper + 0.35, { pos: [HX, -4.0, -0.4], n: 60, dir: [0.2, 1, 0.3], spread: 0.4, speed: [6, 9], seed: 13 });
  for (const [x, dir] of [[HOLE[0], 1], [HOLE[1], -1]]) for (let k = 0; k < 3; k++) fx.stream('drops', t.pours - 0.3, t.pours + 2.2, { pos: [x, -3.9 - k * 0.45, -0.2 - k * 0.5], dir: [dir, 0.25, 0.2], spread: 0.18, speed: [2.5, 4], rate: 60, seed: 20 + k * 2 + (dir > 0 ? 0 : 1) });
  fx.stream('mist', t.pours, t.pours + 2, { pos: [HX, -3.8, 0.1], box: [1.6, 0.6, 0.4], rate: 12, speed: [0.3, 0.8], spread: 1.2, seed: 27 });
  fx.burst('drops', t.sponge, { pos: [-3.4, -4.85, 0.15], box: [0.8, 0.1, 0.4], n: 60, dir: [0, 1, 0.1], spread: 0.9, speed: [1.5, 3.0], size: [0.012, 0.024], jitter: 0.25, seed: 28 });
  // pumps: splash, then the hose blasting the traffic jam
  fx.burst('drops', t.install + 0.45, { pos: [HX + 0.3, -2.2, -0.6], n: 70, dir: [0, 1, 0.3], spread: 0.7, speed: [2, 4.5], seed: 30 });
  fx.stream('drops', t.never + 0.6, s1('pumps'), { pos: [-4.6, 0.55, -4.6], dir: [0.15, 0.55, -1], spread: 0.08, speed: [6.5, 8], rate: 140, size: [0.04, 0.08], seed: 31 });
  fx.stream('mist', t.ny, s1('pumps'), { pos: [-4.4, 1.2, -6.6], box: [2.5, 0.6, 1.2], rate: 10, speed: [0.3, 0.8], spread: 1.4, seed: 32 });
  // by hand: little dirt flicks while Gary digs
  for (let k = 0; k < 9; k++) fx.burst('dirt', t.withOne + 0.2 + k * 0.42, { pos: [-5.6, -4.7, -1.2], n: 6, dir: [-0.6, 1, 0.3], spread: 0.4, speed: [1.5, 2.5], floor: -5.2, size: [0.03, 0.06], seed: 50 + k });
  // TBM: shaft blasts open, the machine lands, cheese grated, boring
  fx.burst('dust', t.bring + 0.05, { pos: [-6.8, -4.0, -1.0], box: [5.2, 7, 0.4], n: 14, speed: [0.3, 0.9], spread: 1.4, size: [0.5, 0.9], seed: 60 });
  fx.burst('rock', t.bring + 0.05, { pos: [-6.8, -4, 0], box: [5, 7, 0.4], n: 60, dir: [0, 0.3, 1], spread: 1.2, speed: [2, 5], seed: 61 });
  fx.burst('dust', tbmLand, { pos: [-6.8, -7.8, 0.4], box: [5, 0.4, 1], n: 24, speed: [1, 2.6], dir: [0, 1, 0.2], spread: 1.2, size: [0.6, 1.2], seed: 62 });
  fx.stream('crumb', t.cheese + 0.05, t.longer - 0.1, { pos: [-4.0, -6.0, 0.8], n: 0, rate: 160, dir: [0.4, 0.8, 0.5], spread: 0.7, speed: [2, 4.5], color: 0xffcf3d, seed: 63 });
  for (let k = 0; k < 60; k++) { const tk = t.chews + k * 0.2; if (tk > t.miles) break; fx.burst('dirt', tk, { pos: [tbmX(tk) + 0.55, T.y + (k % 5 - 2) * 0.5, 0.6], n: 5, dir: [-0.3, 0.5, 1], spread: 0.5, speed: [1.5, 3.5], size: [0.04, 0.1], seed: 100 + k }); }
  // settlement: cracks + dust, croissants rain on Gary
  fx.burst('dust', t.settle - 0.45, { pos: [3.0, 0.1, -0.3], box: [5, 0.3, 0.4], n: 10, speed: [0.3, 0.9], spread: 1.2, size: [0.3, 0.6], seed: 70 });
  fx.burst('dust', t.sinking + 0.2, { pos: [3.0, -0.6, -0.3], box: [5, 0.6, 0.4], n: 12, speed: [0.3, 1.0], spread: 1.2, size: [0.3, 0.6], seed: 71 });
  fx.burst('dirt', t.sinking + 0.2, { pos: [3.0, -4.6, 0.2], box: [4.6, 0.2, 0.4], n: 70, dir: [0, -1, 0.2], spread: 0.5, speed: [0.5, 2], seed: 72 });
  // rings: a dust puff per ring + the 60-ton slam
  S.rings.forEach((r, i) => { if (ringT[i] < t.miles) fx.burst('dust', ringT[i] + 0.12, { pos: [r.x, T.y - 1.4, 0.2], n: 3, speed: [0.3, 0.7], spread: 1.2, size: [0.3, 0.6], seed: 200 + i }); });
  fx.burst('dust', t.tons, { pos: [1.2, T.floor + 0.1, -0.6], n: 6, speed: [0.3, 0.9], spread: 1.3, size: [0.25, 0.5], seed: 75 });
  fx.burst('crumb', t.donut + 0.1, { pos: [2.4, -5.0, 0.2], n: 40, dir: [0, 0.6, 1], spread: 0.8, speed: [1.5, 3], color: 0xd8a35a, seed: 76 });
  // air: stink haze, then blown out the second shaft
  fx.stream('stink', t.awful - 0.6, t.fresh, { pos: [10.5, -6.0, -1.3], box: [9, 2.0, 0.6], rate: 26, speed: [0.05, 0.3], spread: 1.4, size: [0.25, 0.5], grow: 1.2, seed: 80 });
  fx.stream('stink', t.fresh - 0.3, t.fresh + 1.6, { pos: [13.6, -3.0, -1.2], box: [1, 2.5, 0.6], dir: [0, 1, 0], spread: 0.3, speed: [2, 3.5], rate: 20, size: [0.25, 0.5], grow: 1.2, seed: 81 });
  fx.burst('dust', t.vent, { pos: [11, -2.2, 0.3], box: [7, 4, 0.5], n: 24, speed: [0.4, 1.2], spread: 1.3, seed: 82 });
  // power: crackle on the third rail, the zap, smoke
  fx.stream('spark', t.volts, t.zap + 1.0, { pos: [8, T.floor + 0.4, T.z + 1.05], box: [14, 0.05, 0.1], rate: 30, dir: [0, 1, 0], spread: 1.2, speed: [0.5, 1.5], seed: 90 });
  fx.burst('spark', t.zap, { pos: [10.35, T.floor + 0.45, T.z + 1.0], n: 120, dir: [0, 1, 0.3], spread: 1.4, speed: [2, 5], seed: 91 });
  fx.burst('glow', t.zap, { pos: [10.35, T.floor + 0.5, T.z + 1.0], n: 2, speed: [0, 0.01], size: [0.6, 0.8] });
  fx.stream('smoke', t.zap + 0.5, t.zap + 2.4, { pos: [10.0, T.floor + 1.3, -0.4], box: [0.4, 0.3, 0.3], rate: 8, dir: [0, 1, 0], spread: 0.3, speed: [0.3, 0.6], seed: 92 });
  // finish + end: station pops, confetti, money rain
  fx.burst('dust', t.stations, { pos: [21.5, -5.5, 0.4], box: [9, 4, 0.5], n: 30, speed: [0.4, 1.2], spread: 1.3, seed: 93 });
  fx.burst('dust', t.esc, { pos: [28, -3.5, 0.4], box: [5, 6, 0.5], n: 20, speed: [0.4, 1.2], spread: 1.3, seed: 94 });
  fx.burst('confetti', t.end, { pos: [21.5, -3.6, -0.6], box: [8, 0.2, 1.4], n: 320, dir: [0, -1, 0.3], spread: 0.9, speed: [0.5, 2], seed: 95 });
  fx.burst('confetti', t.end + 0.1, { pos: [8, 0.5, -0.5], box: [30, 0.5, 2], n: 300, dir: [0, 1, 0.2], spread: 0.7, speed: [4, 7], seed: 96 });
  fx.stream('confetti', t.now - 0.2, t.ride, { pos: [8, 7, -0.4], box: [18, 1, 1.6], rate: 160, dir: [0, -1, 0], spread: 0.4, speed: [0.5, 1.5], color: 0x5fbf5a, size: [0.45, 0.6], life: [3.5, 4.5], g: 1.4, seed: 97 });
  fx.burst('spark', t.ride + 0.5, { pos: [18.5, D.station.platY + 1.0, -3.0], n: 12, speed: [0.5, 1.2], spread: 1.3, color: 0x7dff9a, seed: 98 });

  // the train: arrives for the finale wide shot, leaves, comes back for the raccoon (who rides on the roof)
  const TR = { arr1: t.end - 0.4, dep1: t.now, arr2: t.racEnd + 0.45, inDur: 0.8 };
  TR.dep2 = Math.max(t.free + 0.5, TR.arr2 + TR.inDur + 0.6);
  function trainAt(tt) {
    if (tt < TR.arr1) return 60;
    if (tt < TR.dep1) return lerp(60, 22.4, 1 - Math.pow(1 - u01(tt, TR.arr1, TR.arr1 + 2.2), 3));
    if (tt < TR.arr2) return 22.4 + Math.pow(Math.max(0, tt - TR.dep1), 2) * 8;
    if (tt < TR.dep2) return lerp(60, 22.4, 1 - Math.pow(1 - u01(tt, TR.arr2, TR.arr2 + TR.inDur), 3));
    return 22.4 + Math.pow(tt - TR.dep2, 2) * 5;
  }
  // ---------------------------------------------------------------- camera: one entry per shot (absolute time), hard cuts between
  const tb = (tt) => tbmX(tt);
  const seatX = (tt) => tb(tt) - 4.2 - 1.2;
  const shots = [
    { t0: 0, pos: [[0, [-15.5, 4.6, 1.5]], [W('hook', 'so'), [-14.0, 4.0, 1.0]]], look: [[0, [-3.0, 0.4, -7.5]], [W('hook', 'so'), [-2.0, 0.4, -7.6]]], fov: 36 },
    { t0: W('hook', 'so') - 0.05, pos: [[0, [-4.4, 2.7, 3.6]], [t.dig, [-4.8, 2.3, 3.0]]], look: [-6.6, 0.0, -1.2], fov: 42 },
    { t0: t.dig, pos: [[t.dig, [HX + 0.4, -0.3, 8.4]], [t.digEnd, [HX + 0.2, -0.9, 7.6]]], look: [[t.dig, [HX, -0.6, 0]], [t.digEnd, [HX, -1.5, 0]]], fov: 40 },
    { t0: t.congrats, pos: [[t.congrats, [HX + 0.3, -0.6, 9.0]], [W('congrats', 'it'), [HX + 0.3, -0.8, 8.4]]], look: [HX, -0.6, 0], fov: 44 },
    { t0: W('congrats', 'it') - 0.05, pos: [[0, [HX + 0.1, -1.5, 4.8]], [s1('congrats'), [HX, -1.7, 4.2]]], look: [HX - 0.5, -2.25, -0.6], fov: 40 },
    { t0: t.walkIn, pos: [[t.walkIn, [-2.2, 1.0, 4.8]], [t.climbs, [-3.0, 1.0, 4.4]]], look: [[t.walkIn, [-3.4, 0.7, -1.2]], [t.climbs, [-5.2, 0.6, -1.2]]], fov: 40 },
    { t0: t.climbs, pos: [[t.climbs, [HX + 0.6, -0.5, 7.6]], [t.walls, [HX + 0.3, -0.9, 6.8]]], look: [HX, -1.4, -0.5], fov: 40 },
    { t0: t.walls - 0.05, pos: [[0, [HX + 0.5, -1.25, 3.1]], [t.cave, [HX + 0.4, -1.3, 2.7]]], look: [HX, -1.55, -1.3], fov: 38 },
    { t0: t.cave - 0.08, pos: [[0, [HX + 0.4, -0.7, 9.4]], [t.fossil, [HX + 0.4, -0.5, 10]]], look: [HX, -1.0, 0], fov: 42 },
    { t0: t.fossil - 0.1, pos: [[0, [-2.3, -2.3, 4.6]], [s1('cavein'), [-2.4, -2.4, 4.0]]], look: [-2.55, -2.55, 0], fov: 38 },
    { t0: s0('shoring'), pos: [[0, [HX + 0.4, -0.6, 9.2]], [t.shoring, [HX + 0.3, -0.9, 8.4]]], look: [HX, -1.3, 0], fov: 42 },
    { t0: W('shoring', 'this') - 0.05, pos: [[0, [-4.5, -0.6, 5.6]], [t.hug, [-5.1, -1.0, 4.5]]], look: [HX, -1.6, -1.4], fov: 42 },
    { t0: t.hug - 0.15, pos: [[0, [HX + 0.75, -2.0, 2.4]], [s1('shoring'), [HX + 0.6, -2.0, 2.1]]], look: [HX, -2.25, -0.9], fov: 38 },
    { t0: s0('water'), pos: [[0, [HX + 0.5, -2.3, 9.8]], [t.table, [HX + 0.4, -2.5, 9.0]]], look: [HX, -3.0, 0], fov: 44 },
    { t0: t.table - 0.05, pos: [[0, [-3.5, -4.0, 13.5]], [t.soggy, [-3.2, -4.1, 12.5]]], look: [-4.2, -5.0, 0], fov: 46 },
    { t0: t.soggy - 0.05, pos: [[0, [-3.2, -4.7, 2.6]], [t.back, [-3.25, -4.85, 2.1]]], look: [-3.4, -5.0, 0], fov: 38 },
    { t0: t.back - 0.05, pos: [[0, [HX + 0.4, -0.6, 3.6]], [s1('water'), [HX + 0.3, -0.7, 3.2]]], look: [HX, -2.3, -1.4], fov: 44 },
    { t0: s0('pumps'), pos: [[0, [HX + 0.4, -2.0, 9.6]], [t.ny, [HX + 0.4, -2.6, 9.4]]], look: [[0, [HX, -2.4, 0]], [t.ny, [HX, -3.4, 0]]], fov: 44 },
    { t0: t.ny - 0.05, pos: [[0, [-1.3, 1.6, 0.6]], [s1('pumps'), [-1.8, 1.5, 0.0]]], look: [-4.8, 0.7, -6.3], fov: 44 },
    { t0: s0('byhand'), pos: [[0, [4, -2.2, 22]], [t.withOne, [6, -2.4, 24]]], look: [[0, [-2, -4.2, 0]], [t.withOne, [6, -4.4, 0]]], fov: 46 },
    { t0: t.withOne - 0.05, pos: [[0, [-5.2, -4.25, 3.2]], [t.beard, [-5.5, -4.35, 2.8]]], look: [-6.3, -4.6, -1.2], fov: 40 },
    { t0: t.beard - 0.05, pos: [[0, [-6.1, -4.15, 2.1]], [s1('byhand'), [-6.2, -4.2, 1.8]]], look: [-6.5, -4.35, -1.3], fov: 36 },
    { t0: s0('tbm'), pos: [[0, [-6.4, -2.4, 16.5]], [t.tunnel + 0.6, [-6.4, -3.0, 15.5]]], look: [[0, [-6.6, -3.3, 0]], [t.tunnel, [-6.6, -4.4, 0]]], fov: 46 },
    { t0: t.giant - 0.05, pos: [[0, [-2.0, -5.0, 6.0]], [t.longer, [-2.4, -5.3, 5.2]]], look: [-4.2, -6.1, 0.3], fov: 40 },
    { t0: t.longer - 0.05, pos: [[0, [-6.5, -3.6, 16]], [t.chews, [-6.5, -3.4, 18]]], look: [-6.4, -5.5, 0], fov: 44 },
    { t0: t.chews - 0.05, pos: (tt) => [seatX(tt) + 0.9, -4.6, 6.4], look: (tt) => [seatX(tt) + 1.1, -5.4, -0.3], fov: 42 },
    { t0: t.unfort - 0.05, pos: [[0, [3.0, -4.8, 12.5]], [t.settle - 0.4, [3.0, -1.2, 13]]], look: [[0, [3.0, -5.0, 0]], [t.settle - 0.4, [3.0, -1.8, 0]]], fov: 44 },
    { t0: t.settle - 0.35, pos: [[0, [3.4, -1.0, 13.4]], [W('sink', 'the', 2), [3.2, -1.2, 12.8]]], look: [3.0, -1.9, 0], fov: 44 },
    { t0: W('sink', 'the', 2) - 0.05, pos: [[0, [3.4, 1.4, 8.6]], [t.crois - 0.1, [3.3, 0.8, 8.0]]], look: [[0, [3.0, 0.1, -1.4]], [t.crois - 0.1, [3.0, -0.9, -1.4]]], fov: 42 },
    { t0: t.crois - 0.08, pos: [[0, [3.6, -2.8, 6.4]], [s1('sink'), [3.6, -3.4, 6.2]]], look: [[0, [3.4, -1.6, 0]], [s1('sink'), [3.5, -4.8, 0]]], fov: 44 },
    { t0: s0('rings'), pos: [[0, [4.4, -4.8, 9.4]], [t.behind + 0.2, [4.2, -4.8, 9.4]], [t.place + 0.3, [-0.8, -5.0, 8.6]], [t.each, [-1.2, -5.0, 8.6]]], look: [[0, [6.6, -6.0, -0.8]], [t.behind + 0.2, [6.2, -6.0, -0.8]], [t.place + 0.3, [0.4, -6.0, -0.8]], [t.each, [0.0, -6.0, -0.8]]], fov: 44 },
    { t0: t.each - 0.05, pos: [[0, [1.5, -6.2, 4.8]], [t.holds, [1.4, -6.3, 4.3]]], look: [0.9, -6.85, -0.5], fov: 40 },
    { t0: t.holds - 0.05, pos: [[0, [3.0, -2.6, 14]], [t.donut, [3.0, -2.6, 13.4]]], look: [3.0, -3.0, 0], fov: 46 },
    { t0: t.donut - 0.15, pos: [[0, [-3.9, -5.7, 2.3]], [s1('rings'), [-3.5, -5.8, 2.1]]], look: [2.4, -6.2, -0.7], fov: 44 },
    { t0: s0('air'), pos: [[0, [5.0, -5.0, 9.5]], [t.awful + 0.2, [8.5, -5.2, 9.0]]], look: [[0, [9.0, -6.0, -0.6]], [t.awful + 0.2, [10.5, -6.1, -0.6]]], fov: 46 },
    { t0: t.passed - 0.1, pos: [[0, [10.9, -6.2, 3.4]], [t.so, [10.8, -6.3, 3.0]]], look: [10.7, -7.0, -0.6], fov: 40 },
    { t0: t.so - 0.05, pos: [[0, [11.2, -2.4, 15.5]], [t.fresh, [11.2, -2.6, 14.6]]], look: [11.1, -3.2, 0], fov: 46 },
    { t0: t.fresh - 0.05, pos: [[0, [11.0, -6.3, 3.4]], [s1('air'), [11.0, -6.3, 3.0]]], look: [10.9, -6.9, -0.6], fov: 40 },
    { t0: s0('power'), pos: [[0, [3.5, -5.3, 6.2]], [t.dont, [5.5, -5.6, 5.4]]], look: [[0, [9, -7.0, -1.0]], [t.dont, [10.2, -7.0, -1.0]]], fov: 42 },
    { t0: t.dont - 0.05, pos: [[0, [10.9, -6.2, 3.4]], [t.zap, [10.75, -6.3, 3.0]]], look: [10.35, -6.75, -0.3], fov: 38 },
    { t0: t.zap + 0.9, pos: [[0, [10.9, -5.8, 4.6]], [s1('power'), [10.8, -5.8, 4.2]]], look: [10.3, -6.9, -0.6], fov: 40 },
    { t0: s0('finish'), pos: [[0, [21.5, -4.4, 11.5]], [t.map - 0.1, [21.5, -4.6, 10.6]]], look: [[0, [21.5, -5.2, 0]], [t.map, [22.5, -5.0, 0]]], fov: 46 },
    { t0: t.map - 0.05, pos: [[0, [19.4, -5.0, 1.8]], [t.puddle, [19.2, -5.0, 1.4]]], look: [18.7, -5.0, -3.2], fov: 42 },
    { t0: t.puddle - 0.05, pos: [[0, [21.2, -5.8, 2.6]], [s1('finish'), [21.6, -5.6, 3.6]]], look: [[0, [20.6, -6.9, -2.4]], [s1('finish'), [22, -6.2, -1.2]]], fov: 44 },
    { t0: t.end - 0.02, pos: [[0, [13, -2.6, 22]], [t.started, [12, -2.0, 26]]], look: [[0, [13, -4.0, 0]], [t.started, [12, -3.6, 0]]], fov: 48 },
    { t0: t.started - 0.05, pos: [[0, [-2.1, 0.95, 2.2]], [W('end', 'because'), [-2.2, 0.95, 1.9]], [t.now, [-1.6, 1.3, 1.9]]], look: [[0, [-3.25, 0.75, -0.7]], [W('end', 'because'), [-3.25, 0.75, -0.7]], [W('end', 'traffic'), [-2.8, 1.0, -6.5]]], fov: 40 },
    { t0: t.now - 0.05, pos: [[0, [7, 0.4, 17]], [t.ride, [7.5, -0.4, 15]]], look: [[0, [7, 0.0, 0]], [t.ride, [7.5, -1.6, 0]]], fov: 46 },
    { t0: t.ride - 0.05, pos: [[0, [19.6, -5.4, 3.6]], [t.stuck, [19.3, -5.5, 2.6]], [t.racEnd, [19.1, -5.6, 2.0]]], look: [[0, [18.4, -6.3, -2.6]], [t.stuck, [18.4, -6.1, -2.6]]], fov: 42 },
    { t0: t.racEnd - 0.05, pos: [[0, [19.4, -5.2, 5.4]], [TR.arr2 + TR.inDur, [21.2, -4.6, 7.0]], [END, [23.2, -4.4, 8.0]]], look: [[0, [19.0, -6.4, -1.8]], [TR.arr2 + TR.inDur, [22.0, -5.6, -1.2]], [END, [24.2, -5.2, -1]]], fov: 44 },
  ];
  // keyframes written at time 0 mean "the start of this shot"
  for (const sh of shots) for (const k of ['pos', 'look']) if (Array.isArray(sh[k]) && Array.isArray(sh[k][0])) sh[k] = sh[k].map(([a, v]) => [a === 0 ? sh.t0 : a, v]);
  const hits = [[t.shovel + 0.28, 0.05, 0.4], [t.cave, 0.22, 0.9], [t.out, 0.08, 0.5], [t.deeper + 0.35, 0.06, 0.5], [t.bring + 0.05, 0.12, 0.6], [tbmLand, 0.35, 1.1],
    [t.settle - 0.45, 0.12, 0.6], [t.sinking + 0.2, 0.2, 1.0], [t.tons, 0.16, 0.6], [t.vent, 0.06, 0.5], [t.zap, 0.18, 0.7], [t.stations, 0.08, 0.5], [t.esc, 0.05, 0.4]];

  // ---------------------------------------------------------------- per-frame
  const v3 = new THREE.Vector3();
  function hop(tt, a, b, p0, p1, h) { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; }

  function update(tt) {
    // ---- holes
    const hs = holeState(tt), shapes = [], verge = [];
    if (hs) {
      shapes.push({ rect: hs.rect, rough: hs.rough });
      verge.push({ rect: [hs.rect[0], -3.4, hs.rect[2], 0.1] });
      if (hs.burrow) shapes.push({ circle: [HOLE[0] - 0.12, -DIG_DEPTH + 0.33, 0.36] });
      if (hs.side > 0) shapes.push({ rect: [HOLE[1] - 0.05, -5.2, HOLE[1] + hs.side, -4.05], rough: 0.04 });
      S.rims.shaft.set([hs.rect[0], hs.rect[1], hs.rect[2], 0]);
    } else S.rims.shaft.set([0, 0, 0, 0]);
    const tf = tunnelFront(tt);
    if (tf > D.launch[1]) shapes.push({ rect: [D.launch[1] - 0.05, BAND[0], tf, BAND[1]], rough: 0.025 });
    const ventOpen = tt > t.vent;
    D.vents.forEach(([a, b], i) => { if (ventOpen) { shapes.push({ rect: [a, BAND[1] - 0.3, b, 0.3], rough: 0.03 }); verge.push({ rect: [a, -3.4, b, 0.1] }); } S.rims['v' + i].set(ventOpen ? [a, BAND[1], b, 0] : [0, 0, 0, 0], { l: 1, r: 1 }); });
    const stOpen = tt > t.stations, escOpen = tt > t.esc, St = D.station;
    if (stOpen) shapes.push({ rect: [St.x0, St.y0, St.x1, St.y1], rough: 0.03 });
    S.rims.station.set(stOpen ? [St.x0, St.y0, St.x1, St.y1] : [0, 0, 0, 0], { l: 1, r: 1, b: 0, t: 1 });
    if (escOpen) { shapes.push({ poly: [[D.esc.bot[0], St.platY - 0.25], [D.esc.bot[1] + 0.8, St.platY - 0.25], [D.esc.top[1], 0.3], [D.esc.top[0], 0.3]], rough: 0.03 }); verge.push({ rect: [D.esc.top[0], -3.4, D.esc.top[1], 0.1] }); }
    S.setHoles(shapes); S.setVergeHoles(verge);

    // ---- traffic: idling, brake lights; honks are in the audio
    for (const c of S.cars) { c.body.position.y = 0.012 * Math.sin(tt * 23 + c.ph) + (tt > t.never + 0.8 && tt < s1('pumps') + 0.5 && c.lane === 0 && Math.abs(c.x + 4.3) < 3 ? 0.02 * Math.sin(tt * 9) : 0); c.setLights(0.15, 0.7); }

    // ---- shovel: drops in, stabs the lawn, digs by itself, then stays stuck in the lawn (the ending callback)
    shovel.visible = tt > t.shovel - 0.4;
    if (tt < t.dig) { const h = drop(tt, t.shovel - 0.35, 6, 0.35); shovel.position.set(HX, 0.15 + h, -1.2); shovel.rotation.set(0.12, 0, wobble(tt, t.shovel, 0.25, 22, 6)); }
    else if (tt < t.digEnd + 0.4) {
      const u = clamp((tt - t.dig) / (t.digEnd - t.dig)), k = Math.min(4, Math.floor(u * 5)), f = u * 5 - k, d = DIG_DEPTH * (k + Math.min(1, f * 1.6)) / 5;
      const scoop = Math.sin(clamp(f) * PI);
      shovel.position.set(HX + 0.1, -d + 0.15 + scoop * 0.6 + (u >= 1 ? clamp((tt - t.digEnd) / 0.4) * 3 : 0), -0.8);
      shovel.rotation.set(0.15, 0, -0.5 * scoop + (u >= 1 ? clamp((tt - t.digEnd) / 0.4) * 4 : 0));
    } else { const h = drop(tt, t.digEnd + 0.4, 3, 0.4); shovel.position.set(-3.3, 0.18 + h, -0.7); shovel.rotation.set(0.2, 0.3, -0.25 + wobble(tt, t.digEnd + 0.8, 0.2, 20, 6)); }
    cobShovel.visible = tt > t.started - 0.05 && tt < t.now; cobShovel.position.set(-3.15, 1.05, -0.62); cobShovel.rotation.set(0, 0.5, 0);

    // ---- mound after the cave-in
    mound.visible = tt > t.cave + 0.2 && tt < t.out; mound.scale.set(1, 0.5 * easeOutBack(u01(tt, t.cave + 0.2, t.cave + 0.5)), 1.4);

    // ---- shoring parts pop in one by one (planks on "brace", timbers on "beams"), gone when the launch shaft opens
    S.shoring.visible = tt > t.brace - 0.1 && tt < t.bring + 0.05;
    S.shoring.userData.parts.forEach((p, i) => { const isStrut = p.geometry.type === 'CylinderGeometry'; const at = isStrut ? t.beams - 0.2 + (i % 6) * 0.07 : t.brace + (i % 16) * 0.055; p.scale.setScalar(pop(tt, at, 0.25)); });

    // ---- water in the shaft
    const level = tt < t.pours - 0.2 ? -9 : tt < t.never ? lerp(-5.2, -2.2, smooth(u01(tt, t.pours - 0.2, t.pours + 1.4))) + 0.04 * Math.sin(tt * 3) : lerp(-2.2, -5.05, smooth(u01(tt, t.never, t.never + 1.0)));
    S.setWater(HOLE[0], HOLE[1], -5.2, tt < s0('byhand') ? level : -9, tt);
    // wet layer glow (fades in once on "water table", out once)
    const wg = 1.0 * smooth(u01(tt, t.table - 0.1, t.table + 0.3)) * (1 - smooth(u01(tt, t.soggy + 0.6, t.back)));
    wetGlow.forEach((m) => { m.material.opacity = wg; m.visible = wg > 0.005; });
    sponge.visible = tt > t.soggy - 0.35 && tt < t.back + 0.1; sponge.scale.set(1 + 0.25 * smooth(u01(tt, t.sponge, t.sponge + 0.2)), pop(tt, t.soggy - 0.35) * (1 - 0.45 * smooth(u01(tt, t.sponge, t.sponge + 0.2))), 1);
    raft.visible = tt > t.back - 0.1 && tt < t.install; raft.position.set(HOLE[0] + 0.45, level + 0.03, -0.9); raft.rotation.set(0.05 * Math.sin(tt * 2), 0, 0.06 * Math.sin(tt * 2.6));

    // ---- pump + hose
    S.pumpG.visible = tt > t.install - 0.1 && tt < s0('byhand');
    S.pumpG.position.set(HX + 0.3, -5.2, -1.6);
    S.pump.position.y = drop(tt, t.install - 0.1, 5, 0.5);
    S.hose.geometry.setDrawRange(0, Math.floor(S.hoseIdx * smooth(u01(tt, t.install + 0.4, t.never + 0.6)) / 3) * 3);
    roadPuddle.visible = tt > t.never + 1 && tt < s0('byhand'); roadPuddle.scale.setScalar(0.2 + 2.2 * smooth(u01(tt, t.never + 1, s1('pumps'))));

    // ---- TBM
    const tbmOn = tt > t.bring + 0.1 && tbmX(tt) < 40;
    S.tbm.g.visible = tbmOn;
    const dropH = tt < tbmLand ? drop(tt, t.bring + 0.1, 13, tbmLand - t.bring - 0.1) : 0;
    S.tbm.g.position.set(tbmX(tt), T.y + dropH, T.z);
    S.tbm.spin(tt < t.giant ? tt * 0.5 : (tt - t.giant) * 5 + t.giant * 0.5); S.tbm.conveyor(tt);
    S.clipFace.constant = tunnelFront(tt) - 0.02;
    S.tbm.seat.parent.visible = tt > t.chews - 0.05; // trailing gear appears once it is boring
    cheese.visible = tt > t.cheese - 0.25 && tt < t.longer; cheese.position.set(-3.85, -6.2, 0.7); cheese.rotation.set(0.1, -1.2, 0); cheese.scale.setScalar(pop(tt, t.cheese - 0.25) * (1 - smooth(u01(tt, t.cheese + 0.1, t.longer - 0.1))));
    goals.forEach((g, i) => { g.visible = tt > t.longer - 0.05 && tt < t.chews; g.position.set(i ? -9.1 : -3.7, T.floor - 0.4, 0.9); g.scale.setScalar(pop(tt, t.longer + i * 0.15)); g.rotation.y = PI / 2; });

    // ---- bakery block: settles, then the rings jack it back up
    const dz = plugDrop(tt), a = plugTilt(tt);
    S.plug.rotation.z = -a;
    v3.set(PLUG_C.x, PLUG_C.y, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -a);
    S.plug.position.set(PLUG_C.x - v3.x, PLUG_C.y - v3.y - dz, 0);
    const spill = tt > t.crois - 0.6;
    S.bakery.croissants.forEach((c) => (c.visible = !spill || tt > t.holds));
    extraCroissants.forEach((c, i) => {
      const a0 = t.crois - 0.6 + i * 0.12, a1 = a0 + 1.1;
      c.visible = tt > a0 && tt < s0('rings') + 0.3;
      const [x, y, z] = hop(tt, a0, a1, [2.4 + i * 0.3, 0.7 - dz, 0.0], [seatX(a1) + (i - 1.5) * 0.25, -4.9, 0.25], 0.6);
      c.position.set(x, y, z); c.rotation.set(tt * 6 + i, tt * 4, 0);
    });

    // ---- rings, track, third rail, donut, loose segment
    S.rings.forEach((r, i) => { const inStation = r.x > D.station.x0 - 0.3 && r.x < D.station.x1 + 0.3; r.g.visible = tt > ringT[i] && !(inStation && tt > t.stations); r.g.scale.setScalar(easeOutBack(u01(tt, ringT[i], ringT[i] + 0.22), 2.2)); });
    S.trackClip.constant = lerp(T.x0, 34.5, smooth(u01(tt, t.trains - 0.2, t.trains + 1.1)));
    S.thirdClip.constant = lerp(T.x0, 34.5, smooth(u01(tt, t.third - 0.1, t.third + 0.9)));
    S.thirdMat.emissiveIntensity = tt > t.volts - 0.1 ? 0.55 + 0.25 * Math.sin(tt * 7) * Math.sin(tt * 3.1) : 0;
    const dRing = S.rings.reduce((b, r) => (Math.abs(r.x - 2.4) < Math.abs(b.x - 2.4) ? r : b));
    donut.visible = tt > t.donut - 0.12 && tt < t.donut + 0.95; donut.position.set(dRing.x, T.y, T.z); donut.scale.setScalar(pop(tt, t.donut - 0.12));
    if (donut.visible) dRing.g.visible = false;
    looseSeg.visible = tt > t.each - 0.1 && tt < t.holds; looseSeg.position.set(1.05, T.floor + 0.62, 0.25); looseSeg.rotation.set(0, 0.15, wobble(tt, t.tons, 0.04, 30, 6));

    // ---- vents: fans + grates
    S.fans.forEach((f, i) => { f.g.visible = tt > t.fans - 0.15; f.g.scale.setScalar(pop(tt, t.fans - 0.15 + i * 0.12)); f.spin(Math.max(0, tt - t.fans) ** 1.6 * 9); });
    S.grates.forEach((g, i) => { g.visible = ventOpen; g.scale.setScalar(pop(tt, t.vent + 0.1 + i * 0.1)); });
    const air = smooth(u01(tt, t.fresh - 0.4, t.fresh)) * (1 - smooth(u01(tt, s1('air') - 0.3, s1('air'))));
    airIn.update(tt, air); airOut.update(tt, air);
    route.update(tt, smooth(u01(tt, t.sideways - 0.1, t.sideways + 0.3)) * (1 - smooth(u01(tt, t.withOne - 0.3, t.withOne))));

    // ---- station: pieces pop on their words
    S.stn.visible = stOpen; S.bore.visible = !stOpen;
    S.stn.children.forEach((c, i) => { const isTs = S.turnstiles.some((x) => x.g === c); const at = isTs ? t.turn + 0.08 * S.turnstiles.findIndex((x) => x.g === c) : t.stations + 0.05 + (i % 9) * 0.06; c.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, at, at + 0.28), 2.2))); });
    S.puddle.scale.set(1.5, 0.8, 1); S.puddle.visible = tt > t.stations + 0.4;
    const dripP = ((tt - t.puddle) % 1.1 + 1.1) % 1.1; S.drip.visible = tt > t.puddle - 0.2; S.drip.position.y = D.station.y1 - 0.1 - Math.min(1, dripP / 0.55) ** 2 * (D.station.y1 - D.station.platY - 0.1);
    S.esc.visible = escOpen; S.esc.scale.set(1, easeOutBack(u01(tt, t.esc, t.esc + 0.3)), 1);
    S.entrance.visible = escOpen; S.entrance.scale.setScalar(easeOutBack(u01(tt, t.esc + 0.15, t.esc + 0.45)));
    wetSign.visible = tt > t.puddle; wetSign.position.set(21.4, D.station.platY, -2.4); wetSign.scale.setScalar(pop(tt, t.puddle + 0.2)); wetSign.rotation.y = -0.4;
    S.turnstiles.forEach((ts, i) => { ts.arms.rotation.x = i === 0 && tt > t.ride + 0.45 ? Math.min(1, (tt - t.ride - 0.45) / 0.4) * (2 * PI / 3) : 0; });

    // ---- train: arrives during the finishing list, leaves with the raccoon
    const trainX = trainAt(tt);
    S.train.g.position.x = trainX; S.train.g.visible = trainX < 45;

    // ---- Gary
    garyAt(tt);
    // ---- baker (rides the bakery block)
    const panic = tt > t.settle - 0.5 && tt < t.holds;
    baker.root.visible = true;
    baker.set({ x: 4.15, y: 0, z: -0.25, rotY: panic ? 0 : -0.2, t: tt, eyes: panic ? 'wide' : 'open', mouth: panic ? 'scream' : tt > t.holds && tt < s1('rings') ? 'grin' : 'smile',
      armL: panic ? { x: -2.4, z: 0.5, el: 1.7 } : tt > t.holds ? { x: -2.8, z: 0.4, el: 0.2 } : { x: 0, z: 0.15, el: 0.3 }, armR: panic ? { x: -2.4, z: 0.5, el: 1.7 } : tt > t.holds ? { x: -2.8, z: 0.4, el: 0.2 } : { x: 0, z: 0.15, el: 0.3 },
      brows: panic ? 1 : 0, head: { x: 0, y: 0, z: panic ? 0.15 * Math.sin(tt * 14) : 0 } });
    // ---- raccoon
    raccoonAt(tt);
    // ---- pigeon: passed out next to Gary, wakes on the fresh air
    pigeon.root.visible = tt > t.passed - 0.2 && tt < s0('power');
    pigeon.set({ x: 11.65, y: T.floor + 0.02, z: -0.45, rotY: -0.4, t: tt, out: tt < t.fresh + 0.3 ? 1 : 0, peck: tt > t.fresh + 0.3 ? 1 : 0 });
    // ---- commuters (station + ending)
    commutersAt(tt);

    // ---- camera
    const sh = camAt(tt, shots, KV);
    const pos = typeof sh.shot.pos === 'function' ? sh.shot.pos(tt) : sh.pos, look = typeof sh.shot.look === 'function' ? sh.shot.look(tt) : sh.look;
    studio.setCamera(pos, look, sh.fov, tt, 0.006);
    const k = shake(tt, hits); studio.camera.position.x += k.x; studio.camera.position.y += k.y; studio.camera.rotation.z += k.r;
    S.aimSun(look[0], look[1], Math.max(6, Math.hypot(pos[0] - look[0], pos[2] - look[2]) * 0.55));
    fx.update(tt, studio.camera);
  }

  // ---------------------------------------------------------------- Gary's day
  const hide = (m) => (m.root.visible = false);
  function garyAt(tt) {
    const g = gary; g.root.visible = true;
    clipboard.visible = tt > t.climbs && tt < t.cave; handShovel.visible = tt > s0('byhand') && tt < t.bring; handCroissant.visible = tt > s0('rings') - 0.2 && tt < t.each - 0.1;
    web.visible = tt > t.beard + 0.3 && tt < t.bring; spider.visible = tt > t.beard + 0.6 && tt < t.bring;
    if (spider.visible) { const L = 0.25 + 0.25 * smooth(u01(tt, t.beard + 0.6, t.beard + 1.4)); spider.position.set(0.18, 0.32 - L, 0.22); thread.scale.y = L; thread.position.y = L / 2; spider.rotation.y = tt * 2; }
    dizzy.update(tt, 0, [0, 0, 0]);
    const base = { t: tt, eyes: 'open', mouth: 'smile', brows: 0 };
    const bot = bottomAt(tt);
    // hidden before he arrives, during the fossil cut-away handled below
    if (tt < t.walkIn) return hide(g);
    if (tt < t.climbs) { // walks in along the verge
      const u = u01(tt, t.walkIn, t.climbs - 0.05), x = lerp(-2.4, -5.35, u);
      return g.set({ ...base, x, y: 0, z: -1.3, rotY: -PI / 2 + 0.25, walk: tt * 9, walkAmt: u < 1 ? 1 : 0, mouth: 'grin', head: { x: 0, y: 0.6, z: 0 } });
    }
    if (tt < t.climbs + 0.55) { const [x, y, z] = hop(tt, t.climbs, t.climbs + 0.55, [-5.35, 0, -1.3], [HX, -DIG_DEPTH, STAND_Z], 0.7); return g.set({ ...base, x, y, z, rotY: -0.3, eyes: 'wide', mouth: 'o', armL: { x: -2.6, z: 0.4 }, armR: { x: -2.6, z: 0.4 } }); }
    if (tt < t.walls) { // inspecting with a clipboard, thumbs up
      const sq = squash(tt, t.climbs + 0.55, 0.3), look = Math.sin((tt - t.inspect) * 2.2);
      return g.set({ ...base, x: HX, y: -DIG_DEPTH, z: STAND_Z, rotY: 0.15 * look, squash: sq, head: { x: -0.1, y: 0.5 * look, z: 0 }, armR: { x: -1.0, z: 0.25, el: 1.3 }, armL: tt > t.thumbs ? { x: -1.6, z: 0.5, el: 1.2 } : { x: 0.1, z: 0.15 }, mouth: tt > t.thumbs ? 'grin' : 'smile', eyes: 'open' });
    }
    if (tt < t.cave + 0.05) { const sh = 0.05 * Math.sin(tt * 40); return g.set({ ...base, x: HX + sh, y: -DIG_DEPTH, z: STAND_Z, rotY: 0, eyes: 'wide', mouth: tt > t.cave - 0.35 ? 'scream' : 'o', brows: 1, look: [0, 1], head: { x: -0.35, y: 0, z: 0 }, armL: { x: -2.6, z: 0.6, el: 0.6 }, armR: { x: -2.6, z: 0.6, el: 0.6 } }); }
    if (tt < t.fossil - 0.1) { // buried: only his eyes + hat poke out of the mound
      return g.set({ ...base, x: HX, y: 0.62 - 1.33, z: -1.0, rotY: 0, eyes: 'wide', look: [Math.sin(tt * 6), 0], mouth: 'flat' });
    }
    if (tt < s0('shoring')) { // the fossil, next to the dinosaur
      const blink = tt > t.fossil + 0.75 && tt < t.fossil + 0.9;
      return g.set({ ...base, x: -1.95, y: -2.55 - 0.62, z: 0.0, rotY: 0, rz: PI / 2 + 0.08, eyes: tt < t.fossil + 0.55 || blink ? 'closed' : 'open', look: [1, 0], mouth: 'flat', tint: [0xdccfaf, 0.78],
        armL: { x: 0, z: 1.3, el: -0.6 }, armR: { x: -0.3, z: 1.1, el: 0.9 }, legL: { x: -0.5, kn: 0.7 }, legR: { x: 0.4, kn: 0.2 } });
    }
    if (tt < t.out + 0.05) return hide(g);
    if (tt < t.out + 0.75) { const [x, y, z] = hop(tt, t.out + 0.05, t.out + 0.75, [HX, -2.0, STAND_Z], [HX, -3.0, STAND_Z], 2.2); return g.set({ ...base, x, y, z, rx: (tt - t.out) * 9, eyes: 'spiral', mouth: 'o', armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    if (tt < t.shoring) { // dizzy, then amazed at the shoring
      const dz = tt < t.beams; dizzy.update(tt, dz ? 1 : 0, [HX, -3.0 + 1.62, STAND_Z]);
      return g.set({ ...base, x: HX, y: -3.0, z: STAND_Z, squash: squash(tt, t.out + 0.75, 0.35), rotY: dz ? 0.2 * Math.sin(tt * 4) : 0, eyes: dz ? 'spiral' : 'wide', mouth: dz ? 'wavy' : 'o', head: { x: dz ? 0 : -0.2, y: dz ? 0.2 * Math.sin(tt * 5) : 0.6 * Math.sin(tt * 2), z: dz ? 0.2 * Math.sin(tt * 4) : 0 } });
    }
    if (tt < t.hug - 0.15) return g.set({ ...base, x: HX + 0.15, y: -3.0, z: STAND_Z, rotY: 0.2, mouth: 'grin', armR: { x: -1.6, z: 0.3, el: 0.3 }, head: { x: 0, y: 0.2, z: 0.1 } });
    if (tt < s0('water')) return g.set({ ...base, x: HX, y: -3.0, z: -1.32, rotY: 0, eyes: 'closed', mouth: 'grin', armL: { x: -1.35, z: 0.25, el: 1.0 }, armR: { x: -1.35, z: 0.25, el: 1.0 }, head: { x: 0, y: 0, z: 0.25 + 0.05 * Math.sin(tt * 3) }, rz: 0.04 * Math.sin(tt * 3) });
    if (tt < t.pours - 0.1) { const y = Math.max(bot, -3.0 - 2.2 * smooth(u01(tt, t.deeper + 0.1, t.deeper + 0.6))); return g.set({ ...base, x: HX, y, z: STAND_Z, eyes: 'wide', mouth: 'o', squash: squash(tt, t.deeper + 0.6, 0.35), armL: { x: -2.6, z: 0.3 }, armR: { x: -2.6, z: 0.3 } }); }
    if (tt < t.back - 0.1) { // treading water, panicking
      const lv = lerp(-5.2, -2.2, smooth(u01(tt, t.pours - 0.2, t.pours + 1.4))), ph = tt * 9;
      return g.set({ ...base, x: HX + 0.1 * Math.sin(tt * 2), y: Math.max(-5.2, lv - 1.0), z: STAND_Z + 0.4, eyes: 'wide', mouth: 'scream', brows: 1, armL: { x: -2.3 + 0.5 * Math.sin(ph), z: 0.9 }, armR: { x: -2.3 + 0.5 * Math.sin(ph + 2), z: 0.9 }, legL: { x: 0.4 * Math.sin(ph) }, legR: { x: -0.4 * Math.sin(ph) } });
    }
    if (tt < t.never) { // backstroke
      const ph = tt * 4.5;
      return g.set({ ...base, x: HX + 0.15 * Math.sin(tt * 1.3), y: -2.2 - 0.62 + 0.12, z: STAND_Z + 0.2, rotY: PI / 2, rx: -PI / 2 + 0.12, eyes: 'closed', mouth: 'grin',
        armL: { x: -PI + PI * Math.sin(ph), z: 0.35, el: 0.2 }, armR: { x: -PI + PI * Math.sin(ph + PI), z: 0.35, el: 0.2 }, legL: { x: 0.25 * Math.sin(ph * 3) }, legR: { x: -0.25 * Math.sin(ph * 3) } });
    }
    if (tt < s0('byhand')) { const lv = lerp(-2.2, -5.05, smooth(u01(tt, t.never, t.never + 1.0))); return g.set({ ...base, x: HX, y: Math.max(-5.2 - 0.62 + 0.18, lv - 0.62 + 0.12), z: STAND_Z, rotY: PI / 2, rx: -PI / 2 + 0.12, eyes: tt > t.never + 1.0 ? 'spiral' : 'wide', mouth: 'o' }); }
    if (tt < t.withOne) return g.set({ ...base, x: HX + 0.2, y: -5.2, z: STAND_Z, rotY: 0.6, eyes: 'half', mouth: 'frown', brows: 1, head: { x: 0, y: 0.7, z: 0 }, armR: { x: -0.4, z: 0.2, el: 0.6 } });
    if (tt < t.beard) { // digging sideways for a hundred years
      const ph = (tt - t.withOne) * 2.4 * PI;
      const age = smooth(u01(tt, t.years - 0.3, t.floor));
      return g.set({ ...base, x: HOLE[1] - 0.55, y: -5.2, z: STAND_Z, rotY: PI / 2 - 0.35, lean: 0.3, eyes: 'half', mouth: 'flat', beard: age, gray: age, armR: { x: -1.2 + 0.7 * Math.sin(ph), z: 0.2, el: 0.6 }, armL: { x: -1.0 + 0.7 * Math.sin(ph), z: 0.35, el: 1.0 } });
    }
    if (tt < t.bring + 0.4) { const age = smooth(u01(tt, t.years - 0.3, t.floor)); return g.set({ ...base, x: HOLE[1] - 0.6, y: -5.2, z: STAND_Z + 0.2, rotY: 0.1, eyes: tt > t.bring ? 'wide' : 'half', mouth: tt > t.bring ? 'scream' : 'flat', brows: tt > t.bring ? 1 : -0.3, beard: age, gray: age, look: tt > t.bring ? [0, 1] : [0, 0], head: { x: tt > t.bring ? -0.5 : 0, y: 0, z: 0 } }); }
    if (tt < t.chews - 0.05) return hide(g); // under the machine
    if (tt < t.each - 0.1) { // riding the TBM seat (moves with it); croissants rain; munching one
      const x = seatX(tt), hit = tt > t.crois + 0.5 && tt < s1('sink');
      return g.set({ ...base, x, y: T.y + 0.9 - 0.4 - 0.02, z: T.z + 0.45, rotY: 1.0, legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.45 }, armR: { x: -1.2, z: 0.1, el: 0.5 },
        armL: tt > s0('rings') - 0.2 ? { x: -1.9 + 0.3 * Math.sin(tt * 6), z: 0.2, el: 1.6 } : { x: -1.0, z: 0.1, el: 0.4 },
        eyes: tt > t.unfort && tt < t.crois + 0.5 ? 'wide' : 'open', mouth: tt > s0('rings') - 0.2 ? (Math.sin(tt * 12) > 0 ? 'grin' : 'flat') : tt > t.unfort && tt < s1('sink') ? 'o' : 'grin',
        look: tt > t.unfort && tt < s1('sink') ? [0, 1] : [0.4, 0], head: { x: tt > t.unfort && tt < s1('sink') ? -0.5 : 0, y: -0.6, z: 0 }, squash: hit ? squash(tt, t.crois + 0.5, 0.25) : [1, 1] });
    }
    if (tt < t.holds - 0.05) { // trying to lift a 60-ton segment
      const strain = Math.sin(tt * 30) * 0.02;
      return g.set({ ...base, x: 0.45 + strain, y: T.floor, z: -0.35, rotY: 1.1, lean: 0.55, legL: { x: -0.7, kn: 1.1 }, legR: { x: -0.7, kn: 1.1 }, armL: { x: -0.9, z: 0.1, el: 0.2 }, armR: { x: -0.9, z: 0.1, el: 0.2 },
        eyes: tt > t.tons ? 'closed' : 'half', mouth: 'teeth', brows: -1, tint: [0xe0483a, 0.35 * smooth(u01(tt, t.each, t.tons))], squash: tt > t.tons ? [1.12, 0.86] : [1, 1] });
    }
    if (tt < t.donut - 0.15) return g.set({ ...base, x: 1.2, y: T.floor, z: -0.15, rotY: 0.3, mouth: 'smile', head: { x: -0.3, y: 0, z: 0 }, look: [0, 1] });
    if (tt < s1('rings')) { const yum = smooth(u01(tt, t.donut - 0.1, t.donut + 0.15)); return g.set({ ...base, x: dRingX() - 0.9, y: T.floor, z: -0.35, rotY: -PI / 2 + 0.7, eyes: yum > 0.5 ? 'wide' : 'open', mouth: yum > 0.5 ? 'grin' : 'smile', look: [-0.6, 0.3], armL: { x: -2.7 * yum, z: 0.4 }, armR: { x: -2.7 * yum, z: 0.4 }, squash: squash(tt, t.donut + 0.15, 0.2) }); }
    if (tt < t.passed - 0.1) { // walking down the stinky tunnel
      const x = lerp(8.4, 10.4, u01(tt, s0('air'), t.passed - 0.1)), gag = tt > t.awful;
      return g.set({ ...base, x, y: T.floor, z: -0.35, rotY: PI / 2 - 0.5, walk: tt * 8, eyes: gag ? 'half' : 'open', mouth: gag ? 'wavy' : 'smile', tint: [0x7fbf3f, gag ? 0.35 : 0], armL: gag ? { x: -2.0, z: 0.1, el: 1.8 } : undefined });
    }
    if (tt < t.fresh + 0.2) return g.set({ ...base, x: 10.8, y: T.floor - 0.62 + 0.18, z: -0.45, rotY: PI / 2, rx: -PI / 2 + 0.05, eyes: 'x', mouth: 'o', tint: [0x7fbf3f, 0.35], armL: { x: -0.2, z: 1.2 }, armR: { x: -0.2, z: 1.2 }, legL: { x: 0.1 }, legR: { x: -0.2 } });
    if (tt < s0('power')) { const up = smooth(u01(tt, t.fresh + 0.2, t.fresh + 0.7)); return g.set({ ...base, x: 10.8, y: T.floor - 0.62 + 0.18 + 0.4 * up, z: -0.45, rotY: PI / 2 - 0.6 * up, rx: lerp(-PI / 2 + 0.05, 0, up), eyes: up > 0.5 ? 'open' : 'x', mouth: up > 0.5 ? 'grin' : 'o', hairUp: 0.6 + 0.3 * Math.sin(tt * 12), armL: { x: -2.6 * up, z: 0.4 }, armR: { x: -2.6 * up, z: 0.4 } }); }
    if (tt < t.dont - 0.1) return g.set({ ...base, x: 10.4, y: T.floor, z: -0.15, rotY: 0.6, eyes: tt > t.third ? 'wide' : 'open', mouth: tt > t.third ? 'o' : 'smile', look: [-0.3, -0.6], head: { x: 0.3, y: -0.4, z: 0 } });
    if (tt < t.zap) { const reach = smooth(u01(tt, t.dont, t.garyT + 0.25)); return g.set({ ...base, x: 10.35, y: T.floor + 0.08, z: -0.45, rotY: -0.25, lean: 0.15 + 0.45 * reach, legL: { x: -0.4 * reach, kn: 0.8 * reach }, legR: { x: 0.1, kn: 0.5 * reach }, armR: { x: -0.7 - 0.35 * reach, z: 0.05, el: 0.05 }, armL: { x: 0.2, z: 0.3 }, eyes: 'half', mouth: 'grin', brows: -0.6, look: [-0.2, -0.6] }); }
    if (tt < t.zap + 0.65) { const on = Math.floor((tt - t.zap) * 9) % 2 === 0; return g.set({ ...base, x: 10.35 + 0.03 * Math.sin(tt * 60), y: T.floor + 0.08, z: -0.45, rotY: -0.25, lean: 0.5, armR: { x: -1.05, z: 0.05, el: 0.05 }, armL: { x: -0.4, z: 1.3 }, eyes: 'wide', mouth: 'scream', hairUp: 1, xray: on }); }
    if (tt < s0('finish')) { const fall = smooth(u01(tt, t.zap + 0.9, t.zap + 1.3)); return g.set({ ...base, x: 10.35, y: T.floor + 0.08 - 0.45 * fall, z: -0.6, rotY: -0.25, rx: -1.4 * fall, eyes: 'spiral', mouth: 'o', hairUp: 1, char: 0.85, armL: { x: -0.3, z: 0.9 }, armR: { x: -0.3, z: 0.9 } }); }
    if (tt < t.turn) { // riding the escalator up, still charred
      const u = u01(tt, t.esc + 0.4, t.turn + 0.8), bx = D.esc.bot[1] - 0.2, ex = D.esc.top[0] + 0.3;
      if (tt < t.esc + 0.4) return hide(g);
      return g.set({ ...base, x: lerp(bx, ex, u), y: lerp(D.station.platY + 0.12, 0.12, u), z: -2.2, rotY: PI / 2 - 0.4, eyes: 'half', mouth: 'flat', hairUp: 1, char: 0.85 });
    }
    if (tt < t.stuck - 0.15) return hide(g);
    // the ending: wedged in the turnstile, kicking
    const ts = S.turnstiles[1].g.position;
    return g.set({ ...base, x: ts.x + 0.2, y: D.station.platY, z: ts.z + 0.3, rotY: PI / 2 - 0.75, lean: 0.35, squash: [1.14, 0.92], walk: tt * 16, walkAmt: 0.7, eyes: 'half', mouth: 'frown', brows: -1, armL: { x: -2.2, z: 0.8, el: 0.4 }, armR: { x: -1.0, z: 0.9, el: 0.3 }, head: { x: 0, y: 0.6, z: 0 } });
  }
  const dRingX = () => S.rings.reduce((b, r) => (Math.abs(r.x - 2.4) < Math.abs(b.x - 2.4) ? r : b)).x;

  function raccoonAt(tt) {
    const r = raccoon; r.root.visible = true;
    if (tt < t.racc - 0.2) return hide(r);
    if (tt < t.climbs + 0.35) { const up = easeOutBack(u01(tt, t.racc - 0.2, t.racc + 0.15)); return r.set({ x: HOLE[0] + 0.05, y: -DIG_DEPTH - 0.4 + 0.4 * up, z: -0.6, rotY: 0.5, stand: smooth(u01(tt, t.racc, t.racc + 0.4)), wave: tt > t.racc + 0.3 && tt < s1('congrats') ? 1 : 0, t: tt, look: [0.3, 0] }); }
    if (tt > t.back - 0.1 && tt < t.install) { const lv = -2.2; return r.set({ x: HOLE[0] + 0.45, y: lv + 0.08, z: -0.9, rotY: 0.6, stand: 1, wave: 1, t: tt }); }
    if (tt > t.racEnd - 0.1) { // hops the turnstile, rides free
      const ts = S.turnstiles[2].g.position, a = t.racEnd - 0.1, b = a + 0.55;
      if (tt < b) { const [x, y, z] = hop(tt, a, b, [ts.x - 0.6, D.station.platY, ts.z + 0.2], [ts.x + 0.7, D.station.platY, ts.z + 0.2], 1.0); return r.set({ x, y, z, rotY: PI / 2, t: tt, scale: 1.2 }); }
      const tx = trainAt(tt) + 0.5, j0 = TR.arr2 + TR.inDur, j1 = j0 + 0.45;
      if (tt < j0) return r.set({ x: lerp(ts.x + 0.7, 22.4, u01(tt, b, b + 0.5)), y: D.station.platY, z: lerp(ts.z + 0.2, -2.0, u01(tt, b, b + 0.5)), rotY: PI / 2 + 0.3, stand: tt > b + 0.55 ? 1 : 0, look: [0, 1], t: tt * 3, scale: 1.2 });
      if (tt < j1) { const [x, y, z] = hop(tt, j0, j1, [22.4, D.station.platY, -2.0], [trainAt(j1) + 0.5, T.floor + 2.52, -0.6], 0.9); return r.set({ x, y, z, rotY: PI / 2 + 0.4, t: tt * 3, scale: 1.2 }); }
      return r.set({ x: tx, y: T.floor + 2.52, z: -0.6, rotY: 0.5, stand: 1, wave: 1, t: tt, scale: 1.2 }); // subway surfing
    }
    return hide(r);
  }

  function commutersAt(tt) {
    const on = tt > t.stations + 0.3;
    const spots = [[23.2, -3.0, -0.3], [24.6, -2.6, 0.6], [19.6, -3.1, PI], [21.0, -2.2, 0.2], [25.2, -3.2, -0.6]];
    commuters.forEach((c, i) => {
      c.root.visible = on; if (!on) return;
      let [x, z, ry] = spots[i], extra = {};
      if (i === 2) { // stares at the map
        extra = tt > t.map - 0.1 && tt < t.puddle ? { eyes: 'spiral', mouth: 'wavy', head: { x: 0, y: 0, z: 0.3 * Math.sin(tt * 3) } } : {};
        x = 18.9; z = -2.6; ry = PI;
      }
      if (i === 3 && tt > t.puddle && tt < s1('finish')) { const u = u01(tt, t.puddle, s1('finish')); x = lerp(19.8, 21.8, u); z = -2.2 + 0.5 * Math.sin(u * PI); ry = PI / 2 - Math.cos(u * PI) * 0.6; extra = { walk: tt * 9, eyes: 'wide', look: [0, -1], head: { x: 0.4, y: 0, z: 0 } }; }
      if (tt > t.ride && i === 0) { const u = u01(tt, t.ride + 0.1, t.ride + 1.4); const ts = S.turnstiles[0].g.position; x = lerp(ts.x - 0.8, ts.x + 1.2, u); z = ts.z + 0.25; ry = PI / 2; extra = { walk: u < 1 ? tt * 9 : undefined, armR: u < 0.4 ? { x: -1.3, z: 0.2, el: 0.3 } : undefined }; }
      if (tt > t.stuck && i === 4) { const ts = S.turnstiles[1].g.position; x = ts.x - 0.8; z = ts.z + 0.3; ry = PI / 2; extra = { eyes: 'half', mouth: 'flat', brows: -0.6, armL: { x: 0, z: 0.5, el: 2.0 }, armR: { x: 0, z: 0.5, el: 2.0 }, legR: { x: -0.25 * Math.max(0, Math.sin(tt * 10)) } }; }
      c.set({ x, y: D.station.platY, z, rotY: ry, t: tt, eyes: 'open', mouth: 'smile', ...(tt > t.end && tt < t.started ? { mouth: 'grin', armL: { x: -2.8, z: 0.3 }, armR: { x: -2.8, z: 0.3 } } : {}), ...extra, head: extra.head || { x: 0, y: 0.25 * Math.sin(tt * 0.7 + i), z: 0 } });
    });
    qMark.visible = tt > t.map + 0.2 && tt < t.puddle; qMark.position.set(18.9, D.station.platY + 1.85, -2.6); qMark.scale.setScalar(0.55 * pop(tt, t.map + 0.2));
  }

  update(0);
  return { update };
}
