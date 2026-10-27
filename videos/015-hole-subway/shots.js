// 015 v3 — "How a Hole Becomes a Subway" (build genre, docs/BUILD.md). ONE continuous camera take: framings arrive on their
// word and leave early enough to glide (engine/build/rail.js planRail — v2's 11 sub-second whips read as cuts).
// Everything is keyed to the spoken word: W(beat, word) = when that word is said (story.json from tools/narrate.py), so
// re-voicing keeps every gag and move on its word.
// Continuity (round-2 logic review): one hole that only deepens; the raccoon and the pigeon enter AND leave on screen; Gary's
// hand-dug tunnel is where the boring machine starts; the machine crawls (the snail laps it), then time-lapses under the
// bakery, whose block sinks into the tunnel until the segment rings shove it back up; Gary falls into the tunnel through the
// crack (no teleports); the ending trains stop short of the turnstiles so the last gag reads in one frame.
//
// Facts (web-searched Oct 26 2026):
//   NYC base fare $3.00 since Jan 4 2026 (CBS New York / ABC7).
//   Second Avenue Subway Phase 2: $7.7 B for 1.8 mi ≈ $4.3 B per mile (NY Post via Yahoo; ENR; NY YIMBY Aug 2025).
//   TBMs average ~10–30 m/day; metro projects ~13–18 m/day (Dubai Blue Line 15, Quito 15–18) → "50 feet a day".
//   NYC subway third rail: 625 V DC nominal (ETHW "Lewis B. Stillwell"; Wikipedia NYC Subway infobox 600–650 V).
//   MTA pump rooms remove ~13 million gallons on a dry day (NY1, Apr 2018; THE CITY 2021: 14 M).
//   Lining ring ≈ 132,000 lb ≈ 60 t (Metrolinx, Scarborough Subway Extension).
//   Hand excavation ≈ 3 m³ per worker-day (CPWD / DPWH output norms) → a 3-mile, ~6 m tunnel ≈ 114,000 m³ ≈ 100 years alone.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, drop, squash, wobble, shake, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeArrows, makeDizzy } from '@engine/build/fx.js';
import { makeToon, makeRaccoon, makePigeon, makeShades } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeRim } from '@engine/build/cutaway.js';
import { buildSubway, D, tunnelHalf, makeShovel, makeCroissant, makeTrain } from '@engine/build/subway.js';

const T = D.T, PI = Math.PI;
const BAND = [T.y - tunnelHalf, T.y + tunnelHalf];          // the tunnel band on the cut face
const HOLE = D.hole, HX = (HOLE[0] + HOLE[1]) / 2;          // Gary's hole (x −7.6..−5.8)
const LS = D.launch;                                         // the launch shaft (x −10..−4.2)
const SZ = -1.35;                                            // where people stand inside the shaft (z)
const TBM_X0 = -5.6;                                         // TBM parked in the launch shaft (shield front x)
const GAP_X = -4.55;                                         // Gary's spot between the cutterhead and the shaft wall
const HT = { y0: -6.0, y1: -3.9, x1: -2.9 };                 // Gary's hand-dug tunnel: floor, ceiling, how far 100 years gets
const PLUG = D.plug, CRACK_X = PLUG[0];                      // the bakery's block; the crack runs up its left edge
const ST = D.station, PLAT = ST.platY;
const T1_STOP = 18.8;                                        // the last train's centre at the platform (nose 22.8: turnstiles stay clear)

export async function build(studio, story) {
  const S = await buildSubway(studio), B = beatClock(story), scene = S.root;
  const W = (b, w, n) => B.W(b, w, n), s1 = (id) => B.T(id).t1;
  const END = story.duration;
  const fx = makeFX(scene);
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const font = (px) => `${px}px "Luckiest Guy", Arial Black`;
  const sprite = (txt, size = 0.5, color = '#fff') => {
    const t = tex(256, 256, (g) => { g.font = font(200); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 22; g.strokeStyle = '#1b1b1b'; g.strokeText(txt, 128, 140); g.fillStyle = color; g.fillText(txt, 128, 140); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(size); scene.add(sp); return sp;
  };
  const board = (w, h, draw) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex(Math.round(256 * w / h), 256, draw), roughness: 0.7, transparent: true }));

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    traffic: W('hook', 'traffic'), so0: W('hook', 'so'), shovel: W('hook', 'shovel'), dig: W('hook', 'dig'), digEnd: s1('hook') + 0.35,
    congrats: W('congrats', 'congratulations'), built: W('congrats', 'built'), nowhere: W('congrats', 'nowhere'), racc: W('congrats', 'raccoon'), already: W('congrats', 'already'),
    send: W('cavein', 'send'), garyC: W('cavein', 'gary'), down: W('cavein', 'down'), inspect: W('cavein', 'inspect'), itC: W('cavein', 'it'),
    walls: W('cavein', 'walls'), imm: W('cavein', 'immediately'), give: W('cavein', 'give'), fossilG: W('cavein', 'gary', 2), fossil: W('cavein', 'fossil'),
    so1: W('shoring', 'so'), digOut: W('shoring', 'dig'), out: W('shoring', 'out'), planks: W('shoring', 'planks'), beams: W('shoring', 'beams'),
    shoring: W('shoring', 'shoring'), bouncer: W('shoring', 'bouncer'), dirt: W('shoring', 'dirt'), dirt2: W('shoring', 'dirt', 2), notW: W('shoring', 'not'), list: W('shoring', 'list'),
    digs: W('water', 'digs'), deeper: W('water', 'deeper'), floor: W('water', 'floor'), leak: W('water', 'leaking'), table: W('water', 'table'), soggy: W('water', 'soggy'),
    sponge: W('water', 'sponge'), cant: W('water', 'cant'), swim: W('water', 'swim'), racW: W('water', 'raccoon'), brought: W('water', 'brought'), floatie: W('water', 'floatie'),
    install: W('pumps', 'install'), pumps: W('pumps', 'pumps'), never: W('pumps', 'never'), ny: W('pumps', 'new'), n13: W('pumps', '13'),
    day: W('pumps', 'day'), yours: W('pumps', 'yours'), drain: W('pumps', 'drain'), trafficP: W('pumps', 'car'), car: W('pumps', 'car'),
    now: W('byhand', 'now'), sideways: W('byhand', 'sideways'), across: W('byhand', 'across'), with: W('byhand', 'with'), shovelB: W('byhand', 'shovel'),
    n100: W('byhand', '100'), years: W('byhand', 'years'), beard: W('byhand', 'beard'), load: W('byhand', 'longer'),
    soT: W('tbm', 'so'), buy: W('tbm', 'buy'), tunnel: W('tbm', 'tunnel'), machine: W('tbm', 'machine'), spinning: W('tbm', 'spinning'),
    cheese: W('tbm', 'cheese'), grater: W('tbm', 'grater'), chews: W('tbm', 'chews'), snail: W('tbm', 'snail'), lapped: W('tbm', 'lapped'),
    bad: W('sink', 'bad'), holding: W('sink', 'holding'), bakery: W('sink', 'bakery'), settle: W('sink', 'settlement'), sinking: W('sink', 'sinking'),
    tunnelS: W('sink', 'tunnel'), crois: W('sink', 'croissants'), first: W('sink', 'first'),
    soR: W('rings', 'so'), digsR: W('rings', 'digs'), bolts: W('rings', 'bolts'), concrete: W('rings', 'concrete'), segment: W('rings', 'segment'), ringsW: W('rings', 'rings'),
    n60: W('rings', '60'), they: W('rings', 'they'), up: W('rings', 'up'), load2: W('rings', 'loadbearing'), donuts: W('rings', 'donuts'),
    garyR: W('rings', 'gary'), carry: W('rings', 'carry'), garyR2: W('rings', 'gary', 2), pancake: W('rings', 'pancake'),
    miles: W('air', 'miles'), zero: W('air', 'zero'), passesG: W('air', 'gary'), passes: W('air', 'passes'), pigeon: W('air', 'pigeon'), fine: W('air', 'fine'),
    soA: W('air', 'so'), add: W('air', 'add'), shafts: W('air', 'shafts'), fans: W('air', 'fans'), blast: W('air', 'blast'), streetA: W('air', 'street'),
    wakes: W('air', 'wakes'), midair: W('air', 'midair'),
    trains: W('power', 'trains'), power: W('power', 'power'), third: W('power', 'third'), rail: W('power', 'rail'), v625: W('power', '625'),
    dont: W('power', 'dont'), garyD: W('power', 'gary'), garyD2: W('power', 'gary', 2), touched: W('power', 'touched'), night: W('power', 'nightlight'),
    addF: W('finish', 'add'), outA: W('air', 'out'), giantA: W('air', 'giant'), isNow: W('sink', 'now'), built: W('end', 'built'), n43: W('end', '43'), stations: W('finish', 'stations'), esc: W('finish', 'escalators'), turn: W('finish', 'turnstiles'), map: W('finish', 'map'), understands: W('finish', 'understands'),
    nobody: W('finish', 'nobody'), puddle: W('finish', 'puddle'), dries: W('finish', 'dries'),
    end: W('end', 'congratulations'), subwayE: W('end', 'subway'), skip: W('end', 'skip'), trafficE: W('end', 'traffic'), nowE: W('end', 'now'), mile: W('end', 'mile'),
    stuck: W('end', 'stuck'), train: W('end', 'train'), garyE: W('end', 'gary'), pays: W('end', 'pays'), n3: W('end', '3'), dollars2: W('end', 'dollars', 2), ride: W('end', 'ride'), hole: W('end', 'hole'), dug: W('end', 'dug'),
    andE: W('end', 'and'), racE: W('end', 'raccoon'), rides: W('end', 'rides'), free: W('end', 'free'),
  };
  // derived beats
  const PANC = t.pancake - 0.25;                 // the segment lands on Gary
  const POOF = t.miles - 0.4;                    // …and he pops back into shape
  const SLIP = t.first - 0.12, LAND = t.first + 0.42;   // croissants first — then Gary slips in after them and lands on the pile
  const BLOWN = t.blast + 0.2, LAND_A = t.midair + 0.68;   // blown up the vent shaft; falls back down
  const BUMP = t.stuck;                          // the second train bumps the first

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const garyShades = makeShades(0.075, 0.1); gary.head.add(garyShades); garyShades.position.set(0, 0.05, 0.3);
  const baker = makeToon({ shirt: 0xffffff, pants: 0x8a8f99, hair: 0x2f2f2f, hairStyle: 'side', hat: 'chef', mustache: true, skin: 0xe8b48c }); S.plug.add(baker.root);
  const looks = [[0xd9534f, 0x2f3542, 0x3b2a20, 'side', 0xf0c8a0], [0xf2c14e, 0x4a5568, 0x111111, 'messy', 0xc68a5e], [0x8a5bd9, 0x2d3436, 0x7a4a2a, 'tuft', 0xf2c29a], [0x58b368, 0x3d3d3d, 0xd8b26a, 'side', 0xe9b48f], [0xff8a3d, 0x2c3e50, 0x222222, 'none', 0x8d5a3b]];
  const commuters = looks.map(([shirt, pants, hair, hs, skin]) => { const c = makeToon({ shirt, pants, hair, hairStyle: hs, skin, hat: hs === 'none' ? 'cap' : null, hatColor: 0x2f6fd6 }); scene.add(c.root); return c; });
  const raccoon = makeRaccoon(); scene.add(raccoon.root);
  const pigeon = makePigeon(); scene.add(pigeon.root);
  const dizzy = makeDizzy(scene);
  const driver = makeToon({ shirt: 0xd9534f, pants: 0x2f3542, hair: 0x3b2a20, hairStyle: 'side', hat: 'cap', hatColor: 0xf2c14e });
  // the car the pump drains into: a glass cabin (roof only + see-through sides) so the water and the driver read
  const car = S.cars.find((c) => c.lane === 0 && Math.abs(c.x + 6.9) < 0.2) || S.cars[2];
  const behind = S.cars.find((c) => c.lane === 0 && Math.abs(c.x - (car.x - 4.55)) < 0.2);
  // the ending callback ("you just wanted to skip traffic"): a car above the station, still stuck — its driver has a 100-year
  // beard and a cobweb on the mirror
  const oldCar = S.cars.find((c) => c.lane === 0 && Math.abs(c.x - 20.4) < 0.3);
  const oldDriver = makeToon({ shirt: 0xd9534f, pants: 0x2f3542, hair: 0x9a9a9a, hairStyle: 'side', hat: 'cap', hatColor: 0xf2c14e });   // the hook's guy, 100 years on
  { const [paint, cab, glass] = oldCar.body.children; cab.scale.set(0.98, 0.16, 1); cab.position.y = 1.41;
    paint.material = cab.material = car.body.children[0].material;   // same blue car as the hook
    glass.material = new THREE.MeshStandardMaterial({ color: 0xa8dcf5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25, depthWrite: false });
    oldCar.body.add(oldDriver.root); oldDriver.root.position.set(-0.35, 0.52, -0.35); oldDriver.root.scale.setScalar(0.55);
    const webT = tex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; for (let k = 0; k < 9; k++) { const a = (k / 8) * PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * w, Math.sin(a) * h); g.stroke(); }
      for (let r = 30; r < w; r += 34) { g.beginPath(); for (let k = 0; k <= 8; k++) { const a = (k / 8) * PI / 2, rr = r * (0.92 + 0.08 * (k % 2)); k ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); } });
    const web = mk(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide }), oldCar.body, -0.81, 1.05, 0.55); web.rotation.set(0, -PI / 2, PI); }
  const [, carCab, carGlass] = car.body.children; carCab.scale.set(0.98, 0.16, 1); carCab.position.y = 1.41;
  carGlass.material = new THREE.MeshStandardMaterial({ color: 0xa8dcf5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3, depthWrite: false });
  car.body.add(driver.root);
  const snorkel = new THREE.Group(); driver.head.add(snorkel); snorkel.position.set(0.16, -0.05, 0.22);
  mk(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 10), mat(0xffd23f, 0.4), snorkel, 0, 0.22, 0); mk(new THREE.TorusGeometry(0.05, 0.02, 8, 14, PI), mat(0xffd23f, 0.4), snorkel, -0.05, -0.05, 0).rotation.z = PI;
  const cabinWater = mk(new THREE.BoxGeometry(1.5, 1, 1.85).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x2a7fc0, transparent: true, opacity: 0.68, roughness: 0.05 }), car.body, 0, 0.94, -0.25);
  const fish = new THREE.Group(); car.body.add(fish); mk(new THREE.SphereGeometry(0.07, 12, 8), mat(0xff8a1f, 0.4), fish).scale.set(1, 0.8, 1.5); mk(new THREE.ConeGeometry(0.05, 0.08, 8), mat(0xff8a1f, 0.4), fish, 0, 0, -0.12).rotation.x = -PI / 2;
  const flood = mk(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: 0x4aa8de, roughness: 0.05, transparent: true, opacity: 0.78, depthWrite: false }), scene, car.x, 0.03, D.lanes[0]); flood.rotation.x = -PI / 2;

  // Gary's props
  const handShovel = makeShovel(); handShovel.scale.setScalar(0.62); handShovel.rotation.set(1.3, 0, 0); handShovel.position.set(0, 0, 0.05); gary.hand(1).add(handShovel);
  const clipboard = new THREE.Group(); mk(new THREE.BoxGeometry(0.2, 0.28, 0.02), mat(0xa77b4f, 0.7), clipboard); mk(new THREE.BoxGeometry(0.17, 0.22, 0.01), mat(0xffffff, 0.8), clipboard, 0, -0.01, 0.012); clipboard.position.set(0, -0.05, 0.08); clipboard.rotation.x = -0.6; gary.hand(-1).add(clipboard);
  const handCroissant = makeCroissant(); handCroissant.position.set(0, 0.02, 0.08); gary.hand(-1).add(handCroissant);
  const card = mk(new THREE.BoxGeometry(0.11, 0.07, 0.006), mat(0x2f6fd6, 0.4), gary.hand(1), 0, -0.04, 0.08);
  const cheese = new THREE.Group(); gary.hand(1).add(cheese); cheese.position.set(0.05, 0.12, 0.12);
  { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.5, 0); sh.lineTo(0, 0.34); sh.closePath(); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); geo.translate(-0.17, -0.11, -0.15);
    const cT = tex(64, 64, (g) => { g.fillStyle = '#ffcf3d'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 6; i++) { g.fillStyle = '#e0a91e'; g.beginPath(); g.arc((i * 23) % 60 + 3, (i * 17) % 60 + 3, 4 + (i % 3) * 3, 0, 7); g.fill(); } });
    mk(geo, new THREE.MeshStandardMaterial({ map: cT, roughness: 0.6 }), cheese); }
  const butter = mk(new RoundedBoxGeometry(0.22, 0.08, 0.22, 2, 0.03), mat(0xfff0a0, 0.4), scene);
  const syrup = mk(new THREE.CylinderGeometry(0.42, 0.46, 0.03, 24), new THREE.MeshStandardMaterial({ color: 0x8a4a14, roughness: 0.15, transparent: true, opacity: 0.85 }), scene);
  const glowLight = new THREE.PointLight(0xffd27a, 0, 6, 1.4); scene.add(glowLight);
  const glowSprite = sprite('●', 1.1, '#fff3a8'); glowSprite.material.blending = THREE.AdditiveBlending; glowSprite.material.color.set(0xffe9a0);
  // set dressing for the gags
  const nowhere = board(0.7, 0.32, (g, w, h) => { g.fillStyle = '#b07f4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6b4a2a'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#3a2412'; g.font = font(110); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOWHERE ↓', w / 2, h / 2 + 6); }); scene.add(nowhere);
  const post = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), mat(0x7a5233), scene);
  const mat_ = mk(new RoundedBoxGeometry(0.42, 0.02, 0.26, 2, 0.01), new THREE.MeshStandardMaterial({ map: tex(256, 160, (g, w, h) => { g.fillStyle = '#c0392b'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = font(64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WELCOME', w / 2, h / 2 + 4); }) }), scene);
  const BX = HOLE[0] + 0.42, BZ = -D.depth, R_OUT = -1.5;   // the raccoon's burrow: an arch in the shaft's back wall (x, wall z); it stands at z R_OUT
  const burrowArch = mk(new THREE.PlaneGeometry(0.74, 0.64), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: tex(256, 224, (g, w, h) => {
    const arch = (pad) => { g.beginPath(); g.moveTo(pad, h); g.lineTo(pad, h * 0.5); g.arc(w / 2, h * 0.5, w / 2 - pad, PI, 0); g.lineTo(w - pad, h); g.closePath(); };
    g.fillStyle = '#6b4526'; arch(0); g.fill(); const gr = g.createRadialGradient(w / 2, h * 0.75, 10, w / 2, h * 0.7, w * 0.5); gr.addColorStop(0, '#0d0704'); gr.addColorStop(1, '#2a1709'); g.fillStyle = gr; arch(16); g.fill(); }) }), scene, BX, 0, BZ + 0.012);
  const suitcase = new THREE.Group(); mk(new RoundedBoxGeometry(0.3, 0.22, 0.1, 2, 0.03), mat(0x8e5a2b, 0.6), suitcase, 0, 0.11, 0); mk(new THREE.TorusGeometry(0.05, 0.012, 6, 12, PI), mat(0x222222), suitcase, 0, 0.23, 0); scene.add(suitcase);
  const floatie = mk(new THREE.TorusGeometry(0.3, 0.1, 12, 24), mat(0xff6fb1, 0.35), scene); floatie.rotation.x = PI / 2;
  const plaque = board(0.9, 0.36, (g, w, h) => { g.fillStyle = '#c9a227'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5f12'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#3a2a05'; g.font = font(96); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GARY, 2026', w / 2, h / 2 + 6); }); scene.add(plaque);
  const clodM = new THREE.MeshStandardMaterial({ color: 0x7a4f2c, roughness: 1, flatShading: true });
  const clod = mk(new THREE.IcosahedronGeometry(0.22, 1), clodM, scene), clod2 = mk(new THREE.IcosahedronGeometry(0.2, 1), clodM, scene);
  // the 100-year calendar: one page per decade, it lands on 2126 on "years"
  const calTex = Array.from({ length: 11 }, (_, i) => tex(160, 192, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9534f'; g.fillRect(0, 0, w, h * 0.26); g.fillStyle = '#fff'; g.font = font(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('JAN', w / 2, h * 0.14); g.fillStyle = '#222'; g.font = font(58); g.fillText(String(2026 + i * 10), w / 2, h * 0.63); }));
  const calendar = mk(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshStandardMaterial({ map: calTex[0], roughness: 0.7 }), scene, -4.95, -4.75, -D.depth + 0.06);
  const handRim = makeRim(scene, D.depth, 0x9a6a44);
  const beardCurve = new THREE.CatmullRomCurve3([[HT.x1 - 0.42, HT.y0 + 0.3, SZ + 0.32], [HT.x1 - 0.55, HT.y0 + 0.07, SZ + 0.3], [HT.x1 - 1.4, HT.y0 + 0.07, SZ + 0.15], [HOLE[1] + 0.1, HT.y0 + 0.07, SZ + 0.05],
    [HX, HT.y0 + 0.07, SZ], [HOLE[0] + 0.22, HT.y0 + 0.1, SZ], [HOLE[0] + 0.12, HT.y0 + 0.9, SZ - 0.1], [HOLE[0] + 0.12, -3.6, SZ - 0.1], [HOLE[0] + 0.2, -2.1, SZ - 0.15], [HOLE[0] + 0.45, -1.4, SZ - 0.15]].map((p) => new THREE.Vector3(...p)));
  const beardGeo = new THREE.TubeGeometry(beardCurve, 220, 0.12, 10, false), beardIdx = beardGeo.index.count;
  const beardTrail = mk(beardGeo, gary.M.beard, scene); beardTrail.castShadow = true;
  const ladderG = new THREE.Group(); scene.add(ladderG);
  { const wood = mat(0xb98a55, 0.8); for (const s of [-0.22, 0.22]) mk(new THREE.BoxGeometry(0.06, 9, 0.06), wood, ladderG, 0, -4.1, s); for (let i = 0; i < 30; i++) mk(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 6), wood, ladderG, 0, 0.3 - i * 0.3, 0).rotation.x = PI / 2; }
  const crane = new THREE.Group(); scene.add(crane);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 30, 6), mat(0x222222, 0.4), crane, 0, 15.6, 0); mk(new RoundedBoxGeometry(0.5, 0.35, 0.35, 2, 0.06), mat(0xf2c418, 0.5), crane, 0, 0.2, 0);
  // the snail that laps the machine: crawls ON the cut face (its foot on the wall), big enough to read
  const snail = new THREE.Group(); scene.add(snail);
  { const shellM = mat(0xc8834a, 0.45), shell2 = mat(0xa8622f, 0.45), skin = mat(0xb8c47a, 0.6);
    // upright on the machine's back, side-on: the shell's spiral faces the lens
    mk(new THREE.TorusGeometry(0.13, 0.075, 12, 28), shellM, snail, -0.03, 0.22, 0);
    mk(new THREE.TorusGeometry(0.055, 0.04, 10, 20), shell2, snail, -0.02, 0.23, 0.03);
    mk(new THREE.SphereGeometry(0.035, 10, 8), shell2, snail, -0.02, 0.23, 0.05);
    mk(new THREE.CapsuleGeometry(0.06, 0.32, 4, 10), skin, snail, 0, 0.05, 0).rotation.z = PI / 2;
    for (const s of [-1, 1]) { const st = mk(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), skin, snail, 0.2, 0.15, s * 0.03); st.rotation.z = -0.4; mk(new THREE.SphereGeometry(0.022, 8, 6), mat(0x111111), snail, 0.23, 0.21, s * 0.03); }
    mk(new THREE.SphereGeometry(0.07, 12, 8, 0, PI * 2, 0, PI / 2), mat(0xffc21a, 0.35), snail, 0.13, 0.12, 0); }
  const speedLines = new THREE.Group(); scene.add(speedLines);
  for (let i = 0; i < 3; i++) mk(new THREE.PlaneGeometry(0.9 - i * 0.2, 0.035), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }), speedLines, -i * 0.12, (i - 1) * 0.16, 0);
  const sponge = new THREE.Group(); scene.add(sponge); sponge.position.set(-4.9, -4.5, 0.25);
  { const spT = tex(128, 128, (g) => { g.fillStyle = '#f7d038'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { g.fillStyle = '#c9a21c'; g.beginPath(); g.ellipse((i * 53) % 128, (i * 37) % 128, 5, 4, 0, 0, 7); g.fill(); } });
    mk(new RoundedBoxGeometry(0.9, 0.5, 0.5, 3, 0.08), new THREE.MeshStandardMaterial({ map: spT, roughness: 0.9 }), sponge); mk(new RoundedBoxGeometry(0.9, 0.12, 0.5, 3, 0.04), mat(0x58b368, 0.8), sponge, 0, 0.3, 0); }
  const looseSeg = new THREE.Group(); scene.add(looseSeg);
  { const sh = new THREE.Shape(); sh.absarc(0, 0, 0.9, 0.25, 1.25, false); sh.absarc(0, 0, 0.7, 1.25, 0.25, true); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }); geo.translate(-0.45, -0.55, -0.3); mk(geo, mat(0xb4b1aa, 0.9), looseSeg); }
  const wetSign = new THREE.Group(); scene.add(wetSign);
  { const wT = tex(128, 160, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#111'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText('CAUTION', 64, 40); g.fillText('WET', 64, 90); g.fillText('FLOOR', 64, 122); });
    for (const s of [-1, 1]) { const p = mk(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshStandardMaterial({ map: wT, side: THREE.DoubleSide }), wetSign, 0, 0.27, s * 0.09); p.rotation.x = s * 0.3; } }
  const qMark = sprite('?', 0.55, '#ffd43b'), xMark = sprite('X', 0.32, '#ff3b30');
  const crois = [0, 1, 2, 3, 4].map(() => { const c = makeCroissant(); c.scale.setScalar(2.4); scene.add(c); return c; });
  // the crack that zips up from the tunnel crown to the bakery on "holding up a bakery"
  const crackPts = []; for (let i = 0; i <= 14; i++) { const y = lerp(BAND[1] + 0.05, 0.05, i / 14); crackPts.push(new THREE.Vector3(CRACK_X - 0.05 + (i % 2 ? 0.09 : -0.07) * (1 - i / 20), y, 0.03)); }
  const crackGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(crackPts, false, 'catmullrom', 0.1), 140, 0.035, 6, false), crackIdx = crackGeo.index.count;
  const crack = mk(crackGeo, mat(0x24140a, 1), scene); crack.castShadow = false;
  // "segment rings… load-bearing donuts": one ring clunks together face-on in front of the tunnel, then gets frosted
  const RF = { x: 6.4, R: 1.29, tube: 0.16, depth: 0.45, under: 3.0 }, RFY = T.floor + RF.R + RF.tube;   // R = mid radius, tube = half the band's thickness   // assembled behind the TBM, then rolls under the bakery
  const CARRY_X = 0.3, SEG_X = 0.62;   // where Gary tries to lift a spare segment (left of the donut)
  const ringFace = new THREE.Group(); scene.add(ringFace);
  const concreteM = new THREE.MeshStandardMaterial({ color: 0x9d9a93, roughness: 0.9 });
  const RO = RF.R + RF.tube, RI = RF.R - RF.tube;
  const arcs = [0, 1, 2, 3, 4, 5].map((k) => { const a = new THREE.Group(); ringFace.add(a); const a0 = (k * PI) / 3 + 0.02, a1 = ((k + 1) * PI) / 3 - 0.02;
    const sh = new THREE.Shape(); sh.absarc(0, 0, RO, a0, a1, false); sh.absarc(0, 0, RI, a1, a0, true);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: RF.depth, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 12 }); geo.translate(0, 0, -RF.depth / 2);
    mk(geo, concreteM, a); return a; });
  const icing = mk(new THREE.RingGeometry(RI - 0.03, RO + 0.03, 48, 1, -PI * 0.12, PI * 1.24), new THREE.MeshStandardMaterial({ color: 0xff8fc1, roughness: 0.3 }), ringFace, 0, 0, RF.depth / 2 + 0.03);
  const sprinkles = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.028, 0.09, 2, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), 80);
  { const cols = [0xffffff, 0x3ec7ff, 0xffd23f, 0x58d36b, 0xb36bff];
    for (let i = 0; i < 80; i++) { const a = -PI * 0.06 + ((i * 0.6180339) % 1) * PI * 1.12, r = RF.R + (((i * 0.37) % 1) - 0.5) * 0.3; sprinkles.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, RF.depth / 2 + 0.06), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, i * 1.7)), new THREE.Vector3(1, 1, 1))); sprinkles.setColorAt(i, new THREE.Color(cols[i % 5])); } }
  ringFace.add(sprinkles);
  // vent-shaft drills (they punch the shafts down from the street on "add")
  const drillM = new THREE.MeshStandardMaterial({ color: 0x8d969f, roughness: 0.35, metalness: 0.6 });
  const drills = D.vents.map(([a, b]) => { const g = new THREE.Group(); scene.add(g); const bit = new THREE.Group(); g.add(bit);
    const cone = mk(new THREE.ConeGeometry(0.5, 0.8, 18), drillM, bit, 0, -0.4, 0); cone.rotation.x = PI;
    for (let k = 0; k < 3; k++) { const fl = mk(new THREE.BoxGeometry(1.0, 0.06, 0.08), mat(0x5f666d, 0.4), bit, 0, 0.1 + k * 0.35, 0); fl.rotation.y = k * 1.05; }
    mk(new THREE.CylinderGeometry(0.14, 0.14, 14, 10), mat(0xf2c418, 0.5), g, 0, 7, 0); g.position.set((a + b) / 2, 5, -1.4); return { g, bit }; });
  // the turnstile's screen (TAP → SWIPE AGAIN)
  const dispTex = ['TAP CARD', 'SWIPE AGAIN'].map((s, i) => tex(256, 112, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = i ? '#ff3b30' : '#6cbe45'; g.font = font(i ? 40 : 46); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + 3); }));
  const disp = mk(new THREE.PlaneGeometry(0.68, 0.29), new THREE.MeshBasicMaterial({ map: dispTex[0], toneMapped: false }), S.turnstiles[1].g, -0.22, 1.14, 0.12); disp.rotation.x = -0.3;

  // the trains: the power-beat train (2 cars, dark until the third rail is live) + two 1-car trains for the ending
  const trainP = S.train, train1 = await makeTrain(1), train2 = await makeTrain(1), train3 = await makeTrain(1); scene.add(train1.g, train2.g, train3.g);
  const shovel = S.shovel;
  const lampMats = []; S.rings.forEach((r) => r.g.traverse((o) => { if (o.isMesh && o.material.emissiveIntensity > 1) lampMats.push(o.material); }));
  // big parts that enter from the shaft's far wall are clipped there (they slide out of the soil, never float in it)
  const wallClip = new THREE.Plane(new THREE.Vector3(1, 0, 0), -LS[0]);
  const clipAt = (m) => { const c = m.clone(); c.clippingPlanes = [...(m.clippingPlanes || []), wallClip]; c.clipShadows = true; return c; };
  for (const g of [S.tbm.g, trainP.g, train1.g, train2.g, train3.g]) g.traverse((o) => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(clipAt) : clipAt(o.material); });
  const pWin = [], pHead = [];
  trainP.g.traverse((o) => { if (!o.isMesh) return; for (const m of [o.material].flat()) { if (m.emissive && m.emissiveIntensity > 0.5) pWin.push(m); else if (m.isMeshBasicMaterial && !m.map) pHead.push(m); } });
  S.hose.visible = false;
  const HOSE0 = [[HX + 0.55, -4.75, -1.3], [HX + 0.75, -3.4, -1.45], [HX + 0.8, -1.0, -1.5], [HX + 0.7, 0.32, -1.65], [HX + 0.5, 0.45, -2.9]];
  const DRAIN_END = [[car.x - 0.5, 0.3, -4.55], [car.x - 0.6, 0.05, -4.95]], WIN_END = [[car.x - 0.1, 0.58, -4.25], [car.x - 0.2, 1.15, -5.3]];
  const hoseTube = (k) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...HOSE0, ...DRAIN_END.map((d, i) => d.map((v, c) => lerp(v, WIN_END[i][c], k)))].map((p) => new THREE.Vector3(...p))), 160, 0.07, 10, false);
  const hoseDrainGeo = hoseTube(0), hoseWinGeo = hoseTube(1), hose = mk(hoseDrainGeo, mat(0x2a8a4a, 0.5), scene), hoseIdx = hoseDrainGeo.index.count;
  let hoseWhip = null, hoseWhipK = -1;   // the whip frames rebuild the tube (only ~0.35 s of frames)
  const grate = mk(new THREE.BoxGeometry(0.7, 0.03, 0.45), mat(0x2a2c30, 0.5), scene, car.x - 0.6, 0.02, -5.0);   // the storm drain
  for (let i = 0; i < 5; i++) mk(new THREE.BoxGeometry(0.04, 0.035, 0.4), mat(0x55585e, 0.4), grate, -0.28 + i * 0.14, 0.005, 0);
  const airIn = makeArrows(scene, [[8.6, 1.2, 0.05], [8.6, -4.6, 0.05], [9.8, -6.6, 0.05]], { color: 0x9fe3ff, count: 9, size: 0.42, speed: 2.6 });
  const airOut = makeArrows(scene, [[11.2, -6.4, 0.05], [13.9, -4.6, -1.0], [13.9, 1.3, -1.0]], { color: 0xb6dd5c, count: 9, size: 0.42, speed: 2.6 });
  const route = makeArrows(scene, [[-5.6, -4.6, 0.15], [32, -4.6, 0.15]], { color: 0xffd43b, count: 16, size: 1.1, speed: 7, emissive: 0.9 });
  const wetGlow = [[-16, HOLE[0]], [HOLE[1], 34]].map(([a, b]) => { const pts = []; for (let x = a; x <= b + 1e-6; x += 0.2) pts.push(new THREE.Vector3(x, D.layer.clay + 0.09 * Math.sin(x * 1.1 + 3) + 0.05 * Math.sin(x * 3.3 + 6) + 0.03 * Math.sin(x * 8), 0.02));
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.045, 6, false), new THREE.MeshBasicMaterial({ color: 0x8ae4ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); scene.add(m); return m; });

  // ---------------------------------------------------------------- the hole (one hole, only ever deeper)
  const DIG = 2.6;
  const holeState = (tt) => {
    if (tt < t.dig) return null;
    if (tt < t.give) { const u = clamp((tt - t.dig) / (t.digEnd - t.dig)), k = Math.min(4, Math.floor(u * 5)), f = u * 5 - k; return { rect: [HOLE[0], -DIG * (u >= 1 ? 1 : (k + smooth(clamp(f * 1.6))) / 5), HOLE[1], 0.3], rough: 0.06, burrow: tt > t.racc - 0.3 }; }
    if (tt < t.out) { // caved in: the walls slump shut; the shovel's one stab before the whole fill pops out like a cork
      const k = clamp((tt - t.give) / 0.4);
      if (k < 1) { const c = 0.9 * smooth(k); return { rect: [HOLE[0] + c, -DIG * (1 - smooth(k) * 0.6), HOLE[1] - c, 0.3], rough: 0.1 }; }
      const stab = 0.7 * smooth(u01(tt, t.digOut - 0.15, t.out - 0.04));
      return stab > 0.03 ? { rect: [HOLE[0] + 0.35, -stab, HOLE[1] - 0.35, 0.3], rough: 0.08 } : null;
    }
    if (tt < t.digs) return { rect: [HOLE[0], -3.0, HOLE[1], 0.3], rough: 0.06 };
    if (tt < t.now) return { rect: [HOLE[0], -3.0 - 2.2 * smooth(u01(tt, t.digs, t.floor - 0.2)), HOLE[1], 0.3], rough: 0.06 };
    if (tt < t.soT + 0.1) return { rect: [HOLE[0], -5.2 + (HT.y0 + 5.2) * smooth(u01(tt, t.now, t.sideways)), HOLE[1], 0.3], rough: 0.06 };
    const w = smooth(u01(tt, t.soT, t.soT + 0.7));   // a 0.7 s dig-out, not a morph
    return { rect: [lerp(HOLE[0], LS[0], w), lerp(HT.y0, -8.0, w), lerp(HOLE[1], LS[1], w), 0.3], rough: 0.05, launch: true };
  };
  const bottomAt = (tt) => { const h = holeState(tt); return h ? h.rect[1] : 0; };
  const level = (tt) => tt < t.leak - 0.2 ? -9 : tt < t.never ? lerp(-5.2, D.layer.clay, smooth(u01(tt, t.leak - 0.2, t.table - 0.4))) + 0.03 * Math.sin(tt * 3) : lerp(D.layer.clay, -5.2, smooth(u01(tt, t.never, t.never + 0.8)));
  const handTip = (tt) => (tt < t.with ? HOLE[1] : lerp(HOLE[1] + 0.3, HT.x1, u01(tt, t.with, t.load - 0.1)));
  const handSag = () => 0;

  // ---------------------------------------------------------------- the TBM (shield front x), the tunnel front, the rings
  const tbmX = (tt) => {
    if (tt < t.chews) return TBM_X0;
    if (tt < t.bad) return TBM_X0 + 1.25 * smooth(u01(tt, t.chews, t.bad));     // "50 feet a day": a crawl (the snail laps it)
    if (tt < t.soR) return lerp(TBM_X0 + 1.25, 10.5, u01(tt, t.bad, t.soR));     // time-lapse: it bores on, under the bakery
    if (tt < t.ringsW + 0.5) return lerp(10.5, 13.5, u01(tt, t.soR, t.ringsW + 0.5)); // a ring clunks in at its tail every step
    if (tt < t.miles) return lerp(13.5, 15.5, u01(tt, t.ringsW + 0.5, t.miles));
    return 15.5 + Math.pow(tt - t.miles, 2) * 30;                                // …gone, miles away
  };
  const tbmIn = t.machine;  // lands on "machine"
  const front = (tt) => (tt < t.chews ? -99 : Math.min(34.5, tbmX(tt) + 0.62));
  const tail = (tt) => tbmX(tt) - 4.2;
  const SHRED = (() => { for (let tt = t.chews; tt < t.bad; tt += 0.01) if (tbmX(tt) + 0.74 >= LS[1] - 0.07) return tt; return t.bad; })(); // the cutterhead eats the ladder
  const tailR = tail(t.soR);
  const ringT = S.rings.map((r) => {
    if (r.x < CRACK_X) return lerp(t.digsR, t.bolts, (CRACK_X - r.x) / (CRACK_X - T.x0));           // catch-up wave, back toward the shaft
    if (r.x < PLUG[1]) return lerp(t.they - 0.1, t.up, (r.x - CRACK_X) / (PLUG[1] - CRACK_X));       // under the bakery: they shove it back up
    if (r.x < tailR) return t.bolts - 0.1 + (tailR - r.x) * 0.15;
    for (let tt = t.soR; tt < END; tt += 0.02) if (tail(tt) - 0.45 > r.x) return tt;                 // then one ring per step as it bores
    return 1e9;
  });
  // ---------------------------------------------------------------- the bakery block: sinks while the machine passes under,
  // keeps creeping into the tunnel, then the rings shove it back up to a shallow dip (the bakery keeps a slight lean)
  const plugParts = (tt) => {
    if (tt < t.settle - 0.3) return { d: 0, push: 0, pre: 0 };
    const pre = 0.6 * easeOutBack(u01(tt, t.settle - 0.3, t.settle + 0.1)) + 0.55 * smooth(u01(tt, t.isNow - 0.25, t.sinking + 0.15)) + 0.08 * u01(tt, t.sinking + 0.15, t.they);
    const push = easeOutBack(u01(tt, t.they + 0.25, t.up + 0.2), 1.4);   // shoved up as the ring rolls in under it
    return { d: pre * (1 - 0.85 * push) + wobble(tt, t.up + 0.25, 0.03), push, pre };
  };
  const plugDrop = (tt) => plugParts(tt).d;
  // ---------------------------------------------------------------- trains
  const TRK0 = LAND_A + 0.05, TRK1 = TRK0 + 1.0, TP0 = TRK0 + 0.25;   // the track zips in under Gary (he hops), then the dark train rolls in on it
  const DEP = t.night + 0.75;   // the nightlight gets its moment, THEN the train leaves   // the powered train honks and leaves — scooping Gary off the track on its nose
  const trainPX = (tt) => (tt < TP0 ? -40 : tt < DEP ? lerp(-22, 9.0, 1 - Math.pow(1 - u01(tt, TP0, TP0 + 1.35), 2.2)) : 9.0 + Math.pow(tt - DEP, 2) * 40);
  const SCOOP = DEP + Math.sqrt((13.2 - 12.2) / 40), FLING = DEP + Math.sqrt((17.3 - 12.2) / 40), FLAND = FLING + 0.85;
  const train1X = (tt) => (tt < t.end - 0.6 ? -40 : lerp(-14, T1_STOP, 1 - Math.pow(1 - u01(tt, t.end - 0.6, t.subwayE + 1.0), 2.4)) + (tt > BUMP ? 0.12 * Math.exp(-(tt - BUMP) * 5) * Math.sin((tt - BUMP) * 14) : 0) + (tt > t.free ? 11 * (tt - t.free) ** 2 : 0));   // pulls out with the raccoon surfing (Gary's head stays above the roof)
  const T2_HIT = T1_STOP - 6.43, BUMP2 = BUMP + 0.45, T3_HIT = T2_HIT - 0.3 - 6.43;   // bump… bump: each rebounds to a small gap
  const bounce = (tt, b) => (tt < b ? 0 : -0.3 * (1 - Math.exp(-(tt - b) * 3)) - 0.25 * Math.abs(Math.sin((tt - b) * 8)) * Math.exp(-(tt - b) * 4));
  const train2X = (tt) => (tt < t.nowE ? -40 : tt < BUMP ? lerp(-22, T2_HIT, 1 - Math.pow(1 - u01(tt, t.nowE, BUMP), 1.5)) : T2_HIT + bounce(tt, BUMP) + 0.06 * Math.exp(-(tt - BUMP2) * 5) * Math.sin(Math.max(0, tt - BUMP2) * 14) * (tt > BUMP2 ? 1 : 0));
  const train3X = (tt) => (tt < t.nowE + 0.5 ? -50 : tt < BUMP2 ? lerp(-34, T3_HIT, 1 - Math.pow(1 - u01(tt, t.nowE + 0.5, BUMP2), 1.5)) : T3_HIT + bounce(tt, BUMP2));
  const trackX = (tt) => lerp(T.x0, 34.5, smooth(u01(tt, TRK0, TRK1)));
  const TRACK_AT = (() => { for (let tt = TRK0; tt < TRK1; tt += 0.01) if (trackX(tt) > 13.4) return tt; return TRK1; })();

  // ---------------------------------------------------------------- effects (scheduled from the narration)
  const wood = 0xc49158;
  fx.burst('dust', t.shovel + 0.3, { pos: [HX, 0.1, -1.4], n: 6, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5] });
  for (let k = 0; k < 5; k++) { const tk = t.dig + ((k + 0.6) / 5) * (t.digEnd - t.dig), d = (DIG * (k + 1)) / 5; fx.burst('dirt', tk, { pos: [HX, -d + 0.3, -0.7], n: 24, dir: [0.35, 1, 0.3], spread: 0.45, speed: [4, 6.5], floor: -d, seed: 40 + k }); }
  fx.burst('confetti', t.congrats, { pos: [HX, 0.2, -0.6], n: 260, dir: [0, 1, 0.15], spread: 0.6, speed: [5, 8.5], seed: 3 });
  fx.burst('dirt', t.racc - 0.5, { pos: [HOLE[0] + 0.42, -DIG + 0.3, -D.depth + 0.25], n: 14, dir: [0, 0.6, 1], spread: 0.5, speed: [1, 2], floor: -DIG, size: [0.03, 0.06] });   // out of the burrow
  fx.stream('dirt', t.walls - 0.1, t.give, { pos: [HX, -0.15, -0.6], box: [1.6, 0.1, 0.4], rate: 30, dir: [0, -1, 0], spread: 0.3, speed: [0.2, 1], size: [0.03, 0.07], floor: -DIG, seed: 7 });
  fx.burst('dirt', t.give, { pos: [HX, -0.9, -0.4], box: [2.0, 1.6, 0.4], n: 150, dir: [0, 1, 0.3], spread: 1.1, speed: [2, 5], floor: -DIG, life: [0.5, 0.8], seed: 8 });
  fx.burst('dust', t.give + 0.05, { pos: [HX, 0.2, -0.6], box: [2.4, 0.6, 0.4], n: 12, speed: [0.5, 1.6], spread: 1.3, size: [0.4, 0.8], seed: 9 });
  fx.burst('dirt', t.out - 0.12, { pos: [HX, -0.25, -0.6], n: 18, dir: [0.3, 1, 0.2], spread: 0.5, speed: [2, 3.5], floor: -0.7, seed: 10 });
  fx.burst('dirt', t.out, { pos: [HX, -1.5, -0.6], box: [1.6, 2.8, 0.6], n: 190, dir: [0, 1, 0.15], spread: 0.5, speed: [5, 9.5], floor: -3.0, life: [0.8, 1.2], seed: 11 });
  fx.burst('dust', t.out, { pos: [HX, 0.3, -0.6], n: 10, speed: [0.5, 1.4], spread: 1.3, size: [0.4, 0.8], seed: 12 });
  for (let i = 0; i < 6; i++) fx.burst('dust', t.planks + i * 0.05, { pos: [HOLE[0] + 0.15 + i * 0.3, -1.5, -3.2], n: 2, speed: [0.2, 0.5], spread: 1.2, size: [0.2, 0.35], seed: 300 + i });
  fx.burst('dirt', t.dirt + 0.05, { pos: [HOLE[0] + 0.5, -2.6, -1.0], n: 20, dir: [0.4, 1, 0.3], spread: 0.5, speed: [2, 4], floor: -3.0, size: [0.03, 0.06], seed: 13 });
  for (let k = 0; k < 4; k++) fx.burst('dirt', t.digs + k * 0.22, { pos: [HX + 0.3, -3.0 - k * 0.5, -0.8], n: 16, dir: [0.3, 1, 0.3], spread: 0.45, speed: [3, 5], floor: -3.2 - k * 0.5, seed: 14 + k });
  for (const [x, dir] of [[HX - 0.5, 0.3], [HX + 0.5, -0.3]]) fx.stream('drops', t.floor - 0.1, t.table, { pos: [x, -5.15, -0.8], dir: [dir, 1, 0.15], spread: 0.15, speed: [2.5, 4], rate: 60, floor: -5.2, seed: 20 + (dir > 0 ? 0 : 1) });
  for (const x of [HOLE[0] + 0.05, HOLE[1] - 0.05]) fx.stream('drops', t.leak, t.table + 0.4, { pos: [x, D.layer.clay - 0.3, -0.7], box: [0.05, 0.8, 0.6], dir: [x < HX ? 1 : -1, 0.3, 0.1], spread: 0.2, speed: [1.5, 2.5], rate: 40, floor: -5.2, seed: 24 + (x < HX ? 0 : 1) }); // water squirts between the planks
  fx.stream('mist', t.floor, t.table, { pos: [HX, -4.8, -0.6], box: [1.4, 0.4, 0.4], rate: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.25, 0.5], seed: 27 });
  fx.burst('drops', t.sponge, { pos: [-4.9, -4.25, 0.35], box: [0.8, 0.1, 0.3], n: 60, dir: [0, 1, 0.1], spread: 0.9, speed: [1.5, 3.0], size: [0.012, 0.024], jitter: 0.25, seed: 28 });
  for (let k = 0; k < 7; k++) fx.burst('drops', t.cant + k * 0.3, { pos: [HX + (k % 2 ? 0.3 : -0.3), D.layer.clay + 0.05, -0.9], n: 16, dir: [0, 1, 0.2], spread: 0.6, speed: [1.2, 2.6], size: [0.02, 0.04], seed: 60 + k });
  for (let k = 0; k < 5; k++) fx.burst('drops', t.cant + 0.25 + k * 0.1, { pos: [HX, D.layer.clay - 0.3, -0.6], n: 4, dir: [0, 1, 0], spread: 0.3, speed: [0.6, 1.2], size: [0.03, 0.06], g: -2, seed: 160 + k }); // bubbles
  fx.burst('drops', t.brought - 0.05, { pos: [HOLE[0] + 0.35, D.layer.clay + 0.05, -2.2], n: 90, dir: [0, 1, 0.3], spread: 0.8, speed: [2.5, 5], seed: 69 });  // raccoon cannonball
  fx.burst('drops', t.install + 0.3, { pos: [HX + 0.4, D.layer.clay, -1.0], n: 70, dir: [0, 1, 0.2], spread: 0.7, speed: [2, 4.5], seed: 30 });
  fx.stream('smoke', t.never, t.ny, { pos: [HX + 0.4, -4.4, -1.4], box: [0.3, 0.1, 0.3], rate: 6, dir: [0, 1, 0], spread: 0.3, speed: [0.3, 0.6], size: [0.2, 0.35], seed: 31 });
  fx.stream('drops', t.n13 - 0.4, t.drain - 0.2, { pos: [car.x - 0.6, 0.1, -4.95], dir: [0, 0.6, -0.3], spread: 0.4, speed: [0.8, 1.6], rate: 50, size: [0.025, 0.05], floor: 0.02, seed: 32 });   // gushing into the drain
  fx.stream('drops', t.drain + 0.1, t.car + 0.3, { pos: [car.x - 0.2, 1.15, -5.3], dir: [0, -0.4, -1], spread: 0.25, speed: [1.5, 2.5], rate: 40, size: [0.025, 0.05], seed: 37 });   // into his window
  for (const s of [-1, 1]) fx.stream('drops', t.drain - 0.1, END, { pos: [car.x, 1.25, D.lanes[0] + s * 0.85], box: [1.6, 0.1, 0.05], dir: [0, 0.2, s], spread: 0.35, speed: [1.2, 2.2], rate: 26, size: [0.03, 0.05], floor: 0.04, seed: 33 + (s > 0 ? 1 : 0) }); // spills out of the windows
  for (let k = 0; k < 4; k++) fx.burst('dirt', t.now + k * 0.2, { pos: [HX + (k % 2 ? 0.3 : -0.3), -5.4 - k * 0.15, -0.9], n: 10, dir: [0.2, 1, 0.3], spread: 0.5, speed: [2, 3.5], floor: HT.y0, seed: 34 + k });
  for (let k = 0; k < 10; k++) fx.burst('dirt', t.with + 0.1 + k * 0.28, { pos: [lerp(HOLE[1] + 0.2, HT.x1, k / 10), -5.5, -1.2], n: 7, dir: [-0.6, 1, 0.3], spread: 0.4, speed: [1.5, 2.8], floor: HT.y0, size: [0.03, 0.06], seed: 50 + k });
  fx.stream('confetti', t.n100 - 0.2, t.beard, { pos: [-4.95, -4.75, -3.3], dir: [0.4, 0.4, 1], spread: 0.5, speed: [1.5, 2.5], rate: 14, color: 0xffffff, size: [0.16, 0.2], g: 3, seed: 51 });
  for (let k = 0; k < 4; k++) fx.burst('dirt', t.soT + k * 0.17, { pos: [lerp(HOLE[0], LS[0], k / 4) + 0.2, -4.5 - k * 0.6, -0.8], n: 20, dir: [0, 1, 0.3], spread: 0.6, speed: [3, 6], floor: -8.0, seed: 66 + k });
  fx.burst('dust', t.soT + 0.05, { pos: [-7.1, -4.0, -1.2], box: [5.6, 7, 0.4], n: 14, speed: [0.3, 0.9], spread: 1.4, size: [0.5, 0.9], seed: 60 });
  fx.burst('rock', t.soT + 0.05, { pos: [-7.1, -4, -1.0], box: [5.6, 7, 0.4], n: 50, dir: [0, 0.3, 1], spread: 1.2, speed: [1.5, 4], floor: -8.0, seed: 61 });
  fx.burst('dust', tbmIn, { pos: [-7.6, -7.8, 0.2], box: [5, 0.4, 0.8], n: 22, speed: [1, 2.4], dir: [0, 1, 0.2], spread: 1.2, size: [0.6, 1.1], seed: 62 });
  fx.burst('confetti', t.spinning + 0.2, { pos: [GAP_X - 0.1, -6.9, 0.3], n: 80, dir: [0.2, 1, 0.6], spread: 0.8, speed: [1.5, 3.5], color: 0xeeeeee, size: [0.03, 0.06], seed: 63 });
  fx.stream('crumb', t.cheese + 0.05, t.chews - 0.05, { pos: [GAP_X - 0.25, -6.3, 0.5], rate: 160, dir: [0.5, 0.8, 0.5], spread: 0.7, speed: [2, 4.5], color: 0xffcf3d, floor: -8.0, seed: 64 });
  fx.burst('crumb', SHRED, { pos: [LS[1] - 0.1, -6.2, -1.2], box: [0.2, 3.5, 0.3], n: 120, dir: [0.4, 0.6, 1], spread: 0.9, speed: [2, 5], color: wood, size: [0.04, 0.09], floor: -8.0, seed: 65 });
  for (let k = 0; k < 60; k++) { const tk = t.chews + k * 0.2; if (tk > t.miles) break; fx.burst('dirt', tk, { pos: [tbmX(tk) + 0.6, T.y + (k % 5 - 2) * 0.5, 0.6], n: 5, dir: [-0.3, 0.5, 1], spread: 0.5, speed: [1.5, 3.5], size: [0.04, 0.1], floor: BAND[0], seed: 100 + k }); }
  fx.burst('dust', t.settle - 0.3, { pos: [3.0, 0.1, -0.3], box: [5, 0.3, 0.4], n: 10, speed: [0.3, 0.9], spread: 1.2, size: [0.3, 0.6], seed: 70 });
  fx.burst('dust', t.sinking + 0.2, { pos: [3.0, -0.6, -0.3], box: [5, 0.6, 0.4], n: 12, speed: [0.3, 1.0], spread: 1.2, size: [0.3, 0.6], seed: 71 });
  fx.burst('dirt', t.sinking + 0.2, { pos: [CRACK_X + 0.05, -2.5, 0.1], box: [0.2, 4, 0.2], n: 50, dir: [0, -1, 0.2], spread: 0.4, speed: [0.5, 2], floor: T.floor, seed: 72 });
  fx.burst('dust', SHRED + 0.4, { pos: [-3.9, 0.1, -1.0], n: 6, speed: [0.4, 1.0], spread: 1.3, size: [0.2, 0.35], seed: 57 });
  fx.burst('dust', LAND, { pos: [CRACK_X, T.floor + 0.1, -0.2], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 73 });
  S.rings.forEach((r, i) => { if (ringT[i] < t.miles) fx.burst('dust', ringT[i] + 0.12, { pos: [r.x, T.y - 1.5, -0.4], n: 2, speed: [0.2, 0.5], spread: 1.2, size: [0.25, 0.45], seed: 200 + i }); });
  arcs.forEach((_, k) => fx.burst('dust', t.segment - 0.1 + k * 0.07 + 0.28, { pos: [RF.x + Math.cos(k * PI / 3 + PI / 6) * RF.R, RFY + Math.sin(k * PI / 3 + PI / 6) * RF.R, 0.5], n: 2, speed: [0.3, 0.6], spread: 1.3, size: [0.2, 0.35], seed: 260 + k }));
  fx.burst('dust', t.n60, { pos: [RF.x, T.floor + 0.1, 0.4], box: [3, 0.2, 0.3], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 74 });
  fx.burst('dust', t.they, { pos: [3.0, -0.2, -0.3], box: [5, 0.3, 0.4], n: 8, speed: [0.3, 0.9], spread: 1.2, size: [0.3, 0.6], seed: 77 });
  fx.burst('crumb', t.donuts - 0.05, { pos: [RF.under, RFY + 0.8, 0.6], box: [3, 0.3, 0.3], n: 50, dir: [0, 1, 0.4], spread: 0.8, speed: [1, 2.5], color: 0xff8fc1, seed: 76 });
  for (let k = 0; k < 4; k++) fx.burst('drops', t.carry + k * 0.25, { pos: [CARRY_X, T.floor + 1.9, 0.1], n: 5, dir: [k % 2 ? 1 : -1, 0.8, 0.3], spread: 0.4, speed: [0.8, 1.5], size: [0.03, 0.05], seed: 78 + k }); // sweat
  fx.burst('dust', PANC + 0.05, { pos: [CARRY_X, T.floor + 0.1, 0.1], n: 10, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 75 });
  fx.burst('dust', POOF, { pos: [CARRY_X, T.floor + 0.5, -0.3], n: 9, speed: [0.6, 1.4], spread: 1.4, size: [0.18, 0.32], seed: 79 });
  fx.stream('stink', t.zero - 0.4, t.blast + 0.1, { pos: [9.5, -6.7, -1.0], box: [8, 1.2, 0.5], rate: 30, dir: [0, 1, 0], spread: 0.6, speed: [0.2, 0.5], size: [0.16, 0.3], grow: 1.4, alpha: 0.3, seed: 80 });
  fx.stream('stink', t.blast, t.streetA + 0.6, { pos: [13.6, -3.2, -1.2], box: [1, 2.5, 0.5], dir: [0, 1, 0], spread: 0.3, speed: [2, 3.5], rate: 22, size: [0.16, 0.3], grow: 1.4, alpha: 0.3, seed: 81 });
  D.vents.forEach(([a, b], i) => { fx.burst('dust', t.shafts + 0.2 + i * 0.15, { pos: [(a + b) / 2, BAND[1] - 0.2, -0.6], n: 6, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 140 + i }); fx.stream('dirt', t.add + i * 0.15, t.shafts + 0.2 + i * 0.15, { pos: [(a + b) / 2, 0.3, -1.0], box: [0.9, 0.1, 0.6], dir: [0, 1, 0.3], spread: 0.6, speed: [2.5, 5], rate: 40, floor: 0.0, size: [0.04, 0.1], seed: 82 + i }); });
  fx.burst('dust', t.add, { pos: [11, 0.2, -0.8], box: [7, 0.4, 0.4], n: 12, speed: [0.3, 0.9], spread: 1.3, size: [0.4, 0.7], seed: 84 });
  fx.burst('dust', LAND_A, { pos: [13.55, T.floor + 0.1, -0.4], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 85 });
  for (let k = 0; k < 8; k++) { const tk = TRK0 + k * 0.15; fx.burst('spark', tk, { pos: [trackX(tk), T.floor + 0.15, T.z], n: 10, dir: [0, 1, 0.4], spread: 1.0, speed: [1, 2.5], seed: 86 + k }); }
  fx.stream('spark', t.v625, t.touched + 0.6, { pos: [12.5, T.floor + 0.4, T.z + 1.05], box: [10, 0.05, 0.1], rate: 30, dir: [0, 1, 0], spread: 1.2, speed: [0.5, 1.5], seed: 90 });
  fx.burst('spark', t.v625 + 0.05, { pos: [13.4, T.floor + 0.3, T.z + 1.05], box: [2.5, 0.05, 0.1], n: 60, dir: [0, 1, 0.3], spread: 1.2, speed: [1, 3], seed: 104 });
  for (let k = 0; k < 3; k++) fx.burst('drops', t.dont + 0.2 + k * 0.4, { pos: [13.45, T.floor + 1.55, 0.15], n: 3, dir: [k % 2 ? 1 : -1, 0.6, 0.3], spread: 0.3, speed: [0.6, 1.1], size: [0.025, 0.04], seed: 105 + k });   // sweat
  fx.burst('spark', t.touched, { pos: [13.42, T.floor + 0.3, T.z + 1.02], n: 140, dir: [0, 1, 0.3], spread: 1.4, speed: [2, 5], seed: 91 });
  fx.burst('glow', t.touched, { pos: [13.45, T.floor + 0.33, T.z + 1.0], n: 2, speed: [0, 0.01], size: [0.5, 0.7] });
  fx.stream('smoke', t.touched + 0.5, t.night + 0.4, { pos: [13.45, T.floor + 1.5, -0.4], box: [0.3, 0.2, 0.2], rate: 5, dir: [0, 1, 0], spread: 0.3, speed: [0.3, 0.6], size: [0.15, 0.3], seed: 92 });
  fx.burst('dust', t.stations, { pos: [21.5, -5.5, -0.5], box: [9, 4, 0.4], n: 16, speed: [0.3, 0.9], spread: 1.3, size: [0.4, 0.8], seed: 93 });
  fx.burst('dust', t.esc, { pos: [28, -3.5, -0.5], box: [5, 6, 0.4], n: 10, speed: [0.3, 0.9], spread: 1.3, size: [0.4, 0.8], seed: 94 });
  fx.burst('drops', t.puddle + 0.35, { pos: [20.6, PLAT + 0.05, -2.4], n: 40, dir: [0, 1, 0.2], spread: 0.7, speed: [1.5, 3], size: [0.02, 0.04], seed: 95 });
  fx.burst('confetti', t.end, { pos: [21.5, -4.4, -0.6], box: [8, 0.2, 1.6], n: 320, dir: [0, 1, 0.4], spread: 0.9, speed: [2, 4], seed: 96 });
  fx.burst('confetti', t.end + 0.1, { pos: [16, 0.5, -0.8], box: [22, 0.5, 1.6], n: 320, dir: [0, 1, 0.2], spread: 0.7, speed: [4, 7], seed: 97 });
  fx.stream('bill', t.skip + 0.25, t.stuck, { pos: [20.4, 3.2, -6.6], box: [6, 0.4, 2.2], rate: 120, dir: [0, -1, 0], spread: 0.4, speed: [0.5, 1.5], life: [3.8, 4.8], seed: 98 });   // money rains on the stuck car
  fx.burst('dust', BUMP2, { pos: [T3_HIT + 3.2, T.floor + 1.2, 0.4], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 103 });
  fx.burst('dust', BUMP, { pos: [T2_HIT + 3.2, T.floor + 1.2, 0.4], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 99 });
  fx.burst('spark', t.n3 + 0.05, { pos: [23.3, PLAT + 1.05, -2.5], n: 14, speed: [0.5, 1.2], spread: 1.3, color: 0xff6b5e, seed: 101 });

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words
  const Fr = [], F = (tt, pos, look, fov = 40, pass = false) => Fr.push({ t: tt, pos, look, fov, pass });
  const Fk = (tt, pos, look, fov = 40, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });   // a short hold that must stay a hold
  // look points sit ~1 m below a standing toon's head (head centre = root + 1.12) so faces stay above the caption band
  F(0, [-6.7, 2.0, 3.6], [-6.8, 0.9, -6.2]);                           // the jam, close: the car + the pigeon fill the frame
  F(t.so0, [-6.7, 1.9, 3.4], [-6.8, 0.7, -6.2]);
  F(t.dig, [-6.7, 1.7, 5.8], [-6.7, -0.1, -3.0], 40, true);
  F(t.congrats + 0.4, [-6.7, 0.6, 9.6], [-6.8, -1.5, 0]);
  Fk(t.racc, [-6.8, -0.6, 7.6], [-6.9, -2.5, 0]);                       // the NOWHERE sign + the tenant above the caption band
  F(t.garyC, [-6.2, -0.3, 9.0], [-6.3, -2.3, -0.5]);                   // held through "give"
  Fk(t.fossil, [-6.6, -1.7, 7.6], [-6.6, -3.1, 0]);
  F(t.out + 0.25, [-6.6, -0.4, 9.2], [-6.7, -2.6, 0]);
  F(t.shoring, [-6.7, -0.8, 7.6], [-6.7, -2.7, 0]);
  F(t.bouncer + 0.1, [-6.55, -1.2, 5.7], [-6.6, -2.35, -0.6]);       // his face below the SHORING band, over the plank
  F(t.deeper, [-6.6, -2.4, 8.0], [-6.6, -4.6, -0.6]);                 // the camera leads his dig down
  F(t.leak, [-6.3, -3.2, 10.2], [-6.3, -4.4, -0.6], 44);              // it floods + the sponge, one frame (x −8.7…−3.9)
  F(t.swim, [-6.6, -2.7, 6.6], [-6.6, -3.9, -0.8]);
  F(t.pumps, [-6.7, -2.7, 8.6], [-6.7, -4.2, 0]);
  F(t.ny, [-6.6, -0.8, 8.0], [-6.6, -1.0, -2.0], 40, true);
  F(t.n13, [-6.3, 1.8, 6.2], [-6.8, 0.6, -5.8]);                       // the hose gushes into a storm drain…
  Fk(t.drain, [-6.8, 1.6, 1.5], [-6.9, 0.85, -6.2], 36);                // …then whips into his window: cabin, snorkel, goldfish
  Fk(t.across, [-5.3, -3.8, 8.6], [-5.3, -5.7, 0], 44);
  F(t.n100, [-4.6, -4.3, 6.6], [-4.6, -5.8, -0.7], 40, true);
  Fk(t.load, [-5.3, -3.6, 11.0], [-5.3, -5.4, 0], 42);                  // "longer than the tunnel": the whole beard
  F(t.buy + 0.55, [-6.6, -3.0, 14.5], [-6.6, -5.0, 0], 44);
  F(t.cheese, [-4.0, -5.6, 7.6], [-4.9, -7.8, 0.2]);
  Fk(t.snail - 0.3, [-5.8, -3.5, 7.0], [-5.8, -4.3, -0.6]);            // the snail laps the machine along its back
  F(t.holding, [1.0, -2.6, 12.5], [1.2, -3.4, 0], 46);              // slide across at the same distance (no wide pull-out)
  Fk(t.settle, [2.2, -1.8, 13.5], [2.2, -2.6, -0.5], 46);              // held: the whole bakery drops and tips IN this frame
  F(t.crois, [1.6, -3.4, 11.5], [1.2, -5.0, 0], 44, true);             // then tilt down with the croissants
  Fk(t.first + 0.6, [1.0, -5.6, 6.6], [0.8, -7.2, -0.3]);
  F(t.ringsW, [4.8, -3.7, 14.0], [4.8, -4.4, 0], 44);                 // the bakery, the ring being bolted together, the TBM's tail
  Fk(t.carry + 0.1, [0.0, -5.8, 6.4], [0.4, -6.75, -0.4], 44, POOF + 0.05);   // the whole lift (segment overhead, buckling knees), the pancake + its spring-back
  // "miles of tunnel": a three-quarter follow down the bore, then face-on with Gary out cold across the centre (pigeon beside)
  F(t.miles + 0.45, [-1.4, -5.6, 4.4], [1.6, -6.7, -0.45], 44);
  F(t.zero + 0.55, [3.4, -5.6, 4.4], [7.6, -6.7, -0.45], 44, true);
  Fk(t.outA, [9.4, -6.0, 5.6], [9.8, -6.4, -0.5], 40);
  F(t.fans, [11.0, -2.8, 14.5], [11.0, -3.8, 0], 44);
  Fk(t.wakes, [13.4, -3.8, 7.0], [13.6, -4.3, -0.6]);
  F(t.power, [11.6, -5.4, 9.5], [12.2, -7.0, -0.4], 42);
  Fk(t.v625 + 0.3, [12.4, -6.0, 7.2], [12.9, -6.9, -0.2]);             // the train's nose (lights coming on) + Gary
  F(t.garyD, [15.0, -6.9, 3.4], [13.4, -6.8, -0.1]);                   // three-quarter from the side: the finger and the rail read
  Fk(t.night - 0.1, [14.2, -5.4, 8.6], [13.9, -7.0, -0.4], 44);        // the glow in the dark, then the train scoops him
  Fk(t.stations + 0.3, [20.6, -5.0, 12.5], [20.6, -6.5, -1.8], 52);   // ONE held wide for the whole list (stations, escalators, turnstiles, the map)
  Fk(t.puddle, [20.0, -5.2, 7.5], [19.8, -7.2, -2.2], 44);             // a slow push past the map to the puddle
  Fk(t.built, [20.5, -0.8, 16.5], [20.5, -3.0, -1.0], 50);             // one tall frame: the station + the train, the jam above (held to ~92.2)
  F(t.skip + 0.1, [20.4, 1.9, 11.0], [20.3, 0.8, -5.0], 40, true);      // rise to street level BEFORE pushing in
  Fk(t.n43, [20.2, 1.7, 3.2], [20.1, 0.5, -5.6], 30);                  // still stuck: the 100-year beard; money rains on him (held)
  F(t.stuck - 0.1, [18.0, -2.0, 9.4], [16.0, -5.8, -1.0], 46, true);   // back out, then down: looking over the trains — bump… bump
  Fk(t.pays + 0.05, [23.6, -6.0, 1.7], [23.45, -6.3, -2.3], 34);    // three swipes, SWIPE AGAIN, big; pulls back to the sign on "the hole he dug"
  F(t.rides, [22.4, -5.0, 7.0], [22.4, -6.4, -2.0], 44);               // raccoon on the roof (left), Gary stuck (right), the stamp over the train
  Fr.push({ t: END, pos: [22.4, -5.056, 6.64], look: [22.4, -6.4, -2.0], fov: 44, stop: true });   // a 4 % push along the same line
  planRail.verbose = true;   // the render log lists every framing that became a pass-through
  const rail = makeRail(planRail(Fr));
  const hits = [[t.shovel + 0.28, 0.05, 0.4], [t.give, 0.2, 0.9], [t.out, 0.12, 0.6], [t.digs + 0.3, 0.05, 0.4], [t.soT + 0.05, 0.12, 0.6], [tbmIn, 0.3, 1.0], [SHRED, 0.05, 0.4],
    [t.settle - 0.3, 0.12, 0.6], [t.sinking + 0.2, 0.15, 0.8], [LAND, 0.06, 0.4], [t.n60, 0.18, 0.7], [t.they, 0.08, 0.6], [PANC, 0.16, 0.6], [t.add, 0.06, 0.5], [LAND_A, 0.06, 0.4],
    [t.touched, 0.18, 0.7], [t.stations, 0.08, 0.5], [t.esc, 0.05, 0.4], [BUMP, 0.1, 0.6]];

  // ---------------------------------------------------------------- helpers
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const hide = (o) => (o.root.visible = false);
  const show = (obj, on) => (obj.visible = !!on);

  function update(tt) {
    // ---- holes in the cut face + the lawn
    const hs = holeState(tt), shapes = [], verge = [];
    if (hs) {
      shapes.push({ rect: hs.rect, rough: hs.rough }); verge.push({ rect: [hs.rect[0], -3.4, hs.rect[2], 0.1] });
      S.rims.shaft.set([hs.rect[0], hs.rect[1], hs.rect[2], 0]);
    } else S.rims.shaft.set([0, 0, 0, 0]);
    if (tt > t.with) { // Gary's hand tunnel (its ceiling sags onto him on "load-bearing")
      const tip = handTip(tt), sag = handSag(tt);
      shapes.push({ poly: [[HOLE[1] - 0.05, HT.y0], [tip, HT.y0], [tip, HT.y1 - sag * 0.5], [tip - 0.7, HT.y1 - sag], [tip - 1.5, HT.y1 - sag * 0.3], [HOLE[1] - 0.05, HT.y1]], rough: 0.04 });
      handRim.set([Math.max(HOLE[1], tt > t.soT ? LS[1] : HOLE[1]), HT.y0, tip, HT.y1], { l: 0, r: 1, b: 1, t: 1 });
    } else handRim.set([0, 0, 0, 0]);
    const tf = front(tt);
    if (tf > LS[1]) shapes.push({ rect: [LS[1] - 0.05, BAND[0], tf, BAND[1]], rough: 0.025 });
    const { d: dz, push: pPush, pre: pPre } = plugParts(tt);
    if (dz > 0.01) shapes.push({ poly: [[CRACK_X - 0.14 - dz * 0.12, 0.3], [CRACK_X + 0.02, 0.3], [CRACK_X + 0.02, BAND[1]], [CRACK_X - 0.08, BAND[1]]], rough: 0.05 });
    const drillU = D.vents.map((_, i) => smooth(u01(tt, t.add + i * 0.15, t.shafts + 0.2 + i * 0.15)));
    D.vents.forEach(([a, b], i) => { const bot = lerp(0.3, BAND[1] - 0.3, drillU[i]), open = drillU[i] > 0.01;
      if (open) { shapes.push({ rect: [a, bot, b, 0.3], rough: 0.03 }); verge.push({ rect: [a, -3.4, b, 0.1] }); }
      S.rims['v' + i].set(open ? [a, Math.max(bot, BAND[1]), b, 0] : [0, 0, 0, 0], { l: 1, r: 1 });
      const dr = drills[i]; dr.g.visible = tt > t.add - 0.3 && tt < t.fans + 0.6; dr.g.position.y = tt < t.shafts + 0.3 + i * 0.15 ? Math.min(6, bot + 0.8 + 4 * (1 - u01(tt, t.add - 0.3 + i * 0.15, t.add + i * 0.15))) : lerp(BAND[1] + 0.5, 10, smooth(u01(tt, t.shafts + 0.3 + i * 0.15, t.fans + 0.5))); dr.bit.rotation.y = tt * 18; });
    const ventOpen = drillU[0] > 0.01;
    const stOpen = tt > t.stations, escOpen = tt > t.esc;
    if (stOpen) shapes.push({ rect: [ST.x0, ST.y0, ST.x1, ST.y1], rough: 0.03 });
    S.rims.station.set(stOpen ? [ST.x0, ST.y0, ST.x1, ST.y1] : [0, 0, 0, 0], { l: 1, r: 1, b: 0, t: 1 });
    if (escOpen) { shapes.push({ poly: [[D.esc.bot[0], PLAT - 0.25], [D.esc.bot[1] + 0.8, PLAT - 0.25], [D.esc.top[1], 0.3], [D.esc.top[0], 0.3]], rough: 0.03 }); verge.push({ rect: [D.esc.top[0], -3.4, D.esc.top[1], 0.1] }); }
    S.setHoles(shapes); S.setVergeHoles(verge);
    crack.visible = tt > t.holding - 0.2; crackGeo.setDrawRange(0, Math.floor(crackIdx * smooth(u01(tt, t.holding - 0.2, t.bakery + 0.2)) / 3) * 3);

    // ---- the street: an idling jam (brake lights); the pumped car fills, overflows and floats
    for (const c of S.cars) { c.body.position.y = 0.012 * Math.sin(tt * 23 + c.ph); c.setLights(0.15, 0.75); }
    if (behind) { behind.g.position.x = behind.x + 0.55 * smooth(u01(tt, t.traffic - 0.35, t.traffic + 0.05)) - 0.12 * Math.max(0, wobble(tt, t.traffic + 0.05, 1, 14, 6)); car.body.rotation.z = wobble(tt, t.traffic + 0.05, 0.04, 20, 6); }
    const fillRaw = u01(tt, t.drain + 0.05, t.car + 0.1), fillU = (Math.floor(fillRaw * 3) + smooth(clamp((fillRaw * 3) % 1 * 1.6))) / 3, floatU = smooth(u01(tt, t.car - 0.2, t.car + 0.45));   // fills in three glugs, then floats
    cabinWater.visible = tt > t.n13 - 0.3; cabinWater.scale.y = 0.02 + 0.4 * fillU; fish.visible = fillU > 0.2; fish.position.set(0.25 * Math.sin(tt * 1.3), 1.1 + 0.05 * Math.sin(tt * 3), -0.25 + 0.55 * Math.sin(tt * 0.9)); fish.rotation.y = Math.cos(tt * 0.9) > 0 ? 0 : PI; snorkel.visible = tt > t.day - 0.3; snorkel.scale.setScalar(Math.max(0.01, pop(tt, t.day - 0.3)));
    car.g.position.y = floatU * (0.3 + 0.05 * Math.sin(tt * 2.3)); car.g.rotation.x = floatU * 0.05 * Math.sin(tt * 1.7); car.g.rotation.z = floatU * 0.04 * Math.sin(tt * 1.3 + 1);
    flood.visible = tt > t.drain - 0.2; flood.scale.setScalar(0.01 + 3.0 * smooth(u01(tt, t.drain - 0.2, t.trafficP + 0.7)));
    driver.set({ y: 0, rotY: 0, legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.45 }, armL: fillU > 0.4 ? { x: -2.8, z: 0.4 } : { x: -1.2, z: 0.1, el: 0.6 }, armR: fillU > 0.4 ? { x: -2.8, z: 0.4 } : { x: -1.2, z: 0.1, el: 0.6 }, t: tt,
      eyes: fillU > 0.2 ? 'wide' : 'half', mouth: fillU > 0.2 ? 'o' : 'flat', brows: fillU > 0.2 ? 1 : -0.4, look: [0.5, 0], head: { x: 0, y: 0.6 + 0.3 * Math.sin(tt * 4) * fillU, z: 0 } });
    oldDriver.set({ y: 0, rotY: 0, mouth: 'flat', legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.45 }, armL: { x: -1.2, z: 0.1, el: 0.6 }, armR: tt > t.skip + 0.15 && tt < t.skip + 0.6 ? { x: -1.6, z: -0.2, el: 1.2 } : { x: -1.2, z: 0.1, el: 0.6 }, t: tt, eyes: 'half', mouth: 'flat', brows: -0.6, beard: 1, gray: 1, look: [0, 0], head: { x: 0.1, y: -1.35 * smooth(u01(tt, t.n43 - 0.9, t.n43 - 0.3)), z: 0 } });   // slowly turns to the lens: a 100-year beard
    oldDriver.root.position.set(-0.4, 0.42, -0.35); oldDriver.root.scale.setScalar(0.7); oldCar.body.rotation.z = wobble(tt, t.skip + 0.2, 0.03, 22, 6); oldCar.body.position.y = -0.14 * smooth(u01(tt, t.n43, t.mile));   // sags under the money
    driver.root.position.set(-0.35, 0.52 + 0.05 * fillU, -0.35); driver.root.scale.setScalar(0.55); // head in the glass band (0.97–1.39)

    // ---- the shovel: drops in, digs by itself, stabs the cave-in once and is blown out with the cork, then stays in the lawn
    shovel.visible = tt > t.shovel - 0.4;
    const LAWN = [-3.3, 0.18, -0.7];
    if (tt < t.dig) { shovel.position.set(HX, 0.15 + drop(tt, t.shovel - 0.35, 6, 0.35), -1.2); shovel.rotation.set(0.12, 0, wobble(tt, t.shovel, 0.25, 22, 6)); }
    else if (tt < t.digEnd + 0.4) { const u = clamp((tt - t.dig) / (t.digEnd - t.dig)), k = Math.min(4, Math.floor(u * 5)), f = u * 5 - k, d = DIG * (k + Math.min(1, f * 1.6)) / 5, sc = Math.sin(clamp(f) * PI), out = u >= 1 ? clamp((tt - t.digEnd) / 0.4) : 0;
      shovel.position.set(HX + 0.1, -d + 0.15 + sc * 0.6 + out * 3, -0.8); shovel.rotation.set(0.15, 0, -0.5 * sc + out * 4); }
    else if (tt > t.digOut - 0.45 && tt < t.out) { const u = u01(tt, t.digOut - 0.45, t.out - 0.05); shovel.position.set(lerp(LAWN[0], HX + 0.2, smooth(clamp(u * 2))), lerp(1.2, -0.45, smooth(clamp(u * 1.6 - 0.4))), -0.8); shovel.rotation.set(0.15, 0, -0.3); }
    else if (tt >= t.out && tt < t.out + 0.9) { const p = hop(tt, t.out, t.out + 0.9, [HX + 0.2, -0.45, -0.8], LAWN, 2.4); shovel.position.set(...p); shovel.rotation.set(0.2, 0.3, (tt - t.out) * 12); }
    else { shovel.position.set(LAWN[0], LAWN[1] + (tt < t.out ? drop(tt, t.digEnd + 0.4, 3, 0.4) : 0), LAWN[2]); shovel.rotation.set(0.2, 0.3, -0.25 + wobble(tt, tt < t.out ? t.digEnd + 0.8 : t.out + 0.9, 0.2, 20, 6)); }

    // ---- set dressing that comes and goes with its gag
    show(nowhere, tt > t.nowhere - 0.1 && tt < t.give); show(post, nowhere.visible); nowhere.position.set(HX + 0.35, -DIG + 0.55, -1.0); post.position.set(HX + 0.35, -DIG + 0.3, -1.03); nowhere.scale.setScalar(pop(tt, t.nowhere - 0.1));
    show(mat_, tt > t.already - 0.1 && tt < t.give); mat_.position.set(BX, -DIG + 0.06, BZ + 0.45); mat_.rotation.x = 0.55; mat_.scale.setScalar(1.4 * pop(tt, t.already - 0.1));   // the doormat at its door
    show(burrowArch, tt > t.racc - 0.7 && tt < t.give); burrowArch.position.y = -DIG + 0.32;
    show(plaque, tt > t.fossil - 0.15 && tt < t.out); plaque.position.set(-5.95, -2.75, 0.05); plaque.scale.setScalar(pop(tt, t.fossil - 0.15));
    show(sponge, tt > t.soggy - 0.35 && tt < t.cant + 0.2); sponge.scale.set(1 + 0.25 * smooth(u01(tt, t.sponge, t.sponge + 0.2)), pop(tt, t.soggy - 0.35) * (1 - 0.45 * smooth(u01(tt, t.sponge, t.sponge + 0.2))) * unpop2(tt, t.cant), 1);
    beardTrail.visible = tt > t.load - 0.15 && tt < t.soT + 0.45; beardGeo.setDrawRange(0, Math.floor(beardIdx * smooth(u01(tt, t.load - 0.15, W('byhand', 'tunnel') + 0.25)) * (1 - smooth(u01(tt, t.soT, t.soT + 0.45))) / 3) * 3);
    show(calendar, tt > t.with + 0.3 && tt < t.soT + 0.1); calendar.material.map = calTex[Math.min(10, Math.floor(11 * u01(tt, t.n100 - 0.15, t.years + 0.2)))]; calendar.scale.setScalar(pop(tt, t.with + 0.3));
    // the ladder: slides into Gary's hole; vanishes in the dust when the shaft is widened; slides back in at the new wall; eaten by the cutterhead
    const ladderOn = (tt > t.send - 0.25 && tt < t.soT + 0.05) || (tt > t.buy + 0.2 && tt < SHRED);
    ladderG.visible = ladderOn; ladderG.position.set(ladderX(tt) + 0.05, tt < t.soT ? drop(tt, t.send - 0.25, 4, 0.4) : drop(tt, t.buy + 0.2, 6, 0.45), -1.5);
    S.shoring.visible = tt > t.planks - 0.1 && tt < t.soT + 0.35;
    S.shoring.userData.parts.forEach((p, i) => { const strut = p.geometry.type === 'CylinderGeometry'; const at = strut ? t.beams - 0.15 + (i % 6) * 0.06 : t.planks + (i % 16) * 0.04; p.scale.setScalar(pop(tt, at, 0.22)); });
    // the bouncer: a clod rolls down the wall, the bouncer flicks it out; a second one peeks over the rim and backs off
    const swat = S.shoring.userData.parts[0];
    show(clod, tt > t.bouncer - 0.35 && tt < t.dirt2 + 0.3);
    if (clod.visible) { const hitT = t.dirt; const p = tt < hitT ? hop(tt, t.bouncer - 0.35, hitT, [HOLE[0] + 0.2, -0.3, -1.0], [HOLE[0] + 0.6, -2.75, -1.0], 0.15) : hop(tt, hitT, hitT + 0.75, [HOLE[0] + 0.6, -2.75, -1.0], [HOLE[0] - 1.6, 1.8, -1.6], 1.4); clod.position.set(...p); clod.rotation.set(tt * 6, tt * 4, 0); }
    if (swat) swat.rotation.z = tt > t.dirt - 0.05 && tt < t.dirt + 0.5 ? -0.9 * Math.sin(PI * u01(tt, t.dirt - 0.05, t.dirt + 0.5)) : 0;
    show(clod2, tt > t.dirt2 - 0.2 && tt < t.list + 0.6);
    if (clod2.visible) { const peek = smooth(u01(tt, t.dirt2 - 0.2, t.dirt2 + 0.2)) * (1 - smooth(u01(tt, t.list, t.list + 0.5))); clod2.position.set(HOLE[1] - 0.15 - 0.35 * peek, -0.75, -1.1); clod2.rotation.set(0, 0, -0.5 * peek); clod2.scale.setScalar(Math.max(0.01, peek)); }
    // water: rises only to the water-table line
    const lv = level(tt); S.setWater(HOLE[0], HOLE[1], -5.2, tt < t.now ? lv : -9, tt);
    const wg = smooth(u01(tt, t.table - 0.1, t.table + 0.3)) * (1 - smooth(u01(tt, t.sponge + 0.5, t.cant)));
    wetGlow.forEach((m) => { m.material.opacity = wg; m.visible = wg > 0.005; });
    // pump + hose into traffic
    S.pumpG.visible = tt > t.install - 0.1 && tt < t.soT + 0.15; S.pumpG.position.set(HX + 0.3, -5.2, -1.6);
    S.pump.position.y = drop(tt, t.install - 0.1, 5, 0.45) + (tt > t.never && tt < t.ny ? 0.02 * Math.sin(tt * 40) : 0);
    hose.visible = tt > t.install + 0.3;
    const whipK = smooth(u01(tt, t.drain - 0.25, t.drain + 0.1));
    if (whipK <= 0) { hose.geometry = hoseDrainGeo; hoseDrainGeo.setDrawRange(0, Math.floor(hoseIdx * smooth(u01(tt, t.install + 0.3, t.never + 0.6)) / 3) * 3); }
    else if (whipK >= 1) hose.geometry = hoseWinGeo;
    else { if (hoseWhipK !== whipK) { if (hoseWhip) hoseWhip.dispose(); hoseWhip = hoseTube(whipK); hoseWhipK = whipK; } hose.geometry = hoseWhip; }
    hose.position.set(0.02 * Math.sin(tt * 31) * (tt > t.n13 && tt < t.drain ? 1 : 0), 0, 0);   // the hose bucks while it gushes
    if (tt > t.soT + 0.15) hose.visible = false;
    // crane + the TBM
    const tbmOn = tt > t.buy - 0.1 && tbmX(tt) < 40;
    S.tbm.g.visible = tbmOn; S.tbm.gear.visible = false;
    const lowerH = tt < tbmIn ? 16 * (1 - smooth(u01(tt, t.buy - 0.1, tbmIn))) : 0;
    S.tbm.g.position.set(tbmX(tt), T.y + lowerH, T.z);
    S.tbm.g.rotation.z = tt < tbmIn ? 0.03 * Math.sin(tt * 5) * (1 - u01(tt, tbmIn - 0.6, tbmIn)) : 0;
    S.tbm.spin(tt < t.spinning ? 0 : (tt - t.spinning) ** 1.3 * 5); S.tbm.conveyor(tt > t.chews ? tt : 0);
    show(crane, tt > t.buy - 0.1 && tt < tbmIn + 0.8); crane.position.set(tbmX(tt) - 2.1, T.y + lowerH + T.R + 0.1 + (tt > tbmIn ? (tt - tbmIn) ** 2 * 18 : 0), T.z);
    S.clipFace.constant = front(tt) - 0.02;
    // the snail laps the crawling machine: along the top of its shield, past the cutterhead, then a little wave on the rim
    show(snail, tt > t.snail - 0.75 && tt < t.bad + 0.8);
    const snU = smooth(u01(tt, t.snail - 0.6, t.lapped + 0.05)), snX = Math.min(LS[1] - 0.4, lerp(tbmX(tt) - 3.6, tbmX(tt) + 0.55, snU)), snY = T.y + T.R - 0.03 - 0.06 * smooth(u01(snX, tbmX(tt) + 0.2, tbmX(tt) + 0.55));
    snail.position.set(snX, snY, T.z + 0.15); snail.rotation.set(0, 0, 0); snail.scale.setScalar(2.2 * pop(tt, t.snail - 0.75));
    show(speedLines, snail.visible && tt > t.snail - 0.5 && tt < t.lapped + 0.1); speedLines.position.set(snX - 0.75, snY + 0.3, T.z + 0.2);
    // the bakery block + the croissants that fall through the crack onto Gary
    S.plug.position.set(0, -dz, 0); S.plug.rotation.z = 0;
    S.bakery.g.rotation.x = 0.13 * smooth(u01(tt, t.isNow - 0.25, t.sinking + 0.15)) * (1 - 0.6 * pPush);   // tips forward: the shelf pours out
    S.bakery.g.rotation.z = -0.09 * clamp(pPre / 0.6) * (1 - 0.55 * pPush) + wobble(tt, t.holding, 0.04, 26, 4) + wobble(tt, t.bakery, 0.03, 30, 5);
    S.bakery.croissants.forEach((c, i) => (c.rotation.z = wobble(tt, t.holding + i * 0.04, 0.5, 20, 4)));
    crois.forEach((cr, i) => {
      const a0 = t.crois - 0.4 + i * 0.08, a1 = a0 + 0.3, a2 = a1 + 0.28, a3 = a2 + 0.35;
      const shelf = S.bakery.croissants[i]; if (shelf) shelf.visible = tt < a0;
      cr.visible = tt > a0 && tt < t.zero; if (!cr.visible) return;
      const top = [CRACK_X - 0.06, -dz + 0.05, -0.3], crown = [CRACK_X - 0.04, BAND[1] - 0.1, -0.3], rest = [CRACK_X - 0.75 + i * 0.32, T.floor + 0.08, -0.05 + (i % 2) * 0.25];
      const p = tt < a1 ? hop(tt, a0, a1, [S.bakery.g.position.x - 0.7 - 0.35 * (i - 2), 0.6 - dz, -0.33], top, 0.25) : tt < a2 ? hop(tt, a1, a2, top, crown, 0) : tt < a3 ? hop(tt, a2, a3, crown, rest, 0.35) : rest;
      cr.position.set(...p); cr.rotation.set(tt < a3 ? tt * 7 + i : 0.2, tt < a3 ? tt * 5 : i, 0);
      if (i === 2 && tt > LAND + 0.3) cr.visible = false; // Gary grabbed this one
    });
    // rings: segments clunk in (the shaft side catches up, under the bakery they shove it back up, then one per step behind the machine)
    S.rings.forEach((r, i) => { const inStation = r.x > ST.x0 - 0.3 && r.x < ST.x1 + 0.3; r.g.visible = tt > ringT[i] && !(inStation && stOpen); if (!r.g.visible) return; r.g.children.forEach((seg, k) => seg.scale.setScalar(easeOutBack(u01(tt, ringT[i] + k * 0.045, ringT[i] + k * 0.045 + 0.18), 2.2)));
      const underVent = D.vents.some(([a, b], v) => drillU[v] > 0.6 && r.x > a - 0.45 && r.x < b + 0.45); r.g.children[4].visible = !underVent; });
    // the face-on ring: six arcs fly in and clunk ("segment rings"), slam down ("60 tons"), get frosted ("load-bearing donuts")
    show(ringFace, tt > t.segment - 0.15 && tt < t.garyR + 0.8);
    if (ringFace.visible) {
      const slam = tt < t.n60 - 0.15 ? 0.6 * smooth(u01(tt, t.n60 - 0.55, t.n60 - 0.15)) : drop(tt, t.n60 - 0.15, 0.6, 0.15);
      const xx = lerp(RF.x, RF.under, smooth(u01(tt, t.they - 0.15, t.they + 0.35))) + 11 * smooth(u01(tt, t.garyR - 0.3, t.garyR + 0.8));   // rolls under the bakery ("they hold the street up"), later rolls off down the tunnel
      ringFace.position.set(xx, RFY + slam, 0.0); ringFace.rotation.z = -(xx - RF.x) / (RF.R + RF.tube);
      arcs.forEach((a, k) => { const ta = t.segment - 0.15 + k * 0.07, e = easeOutBack(u01(tt, ta, ta + 0.3), 1.6), ang = (k * PI) / 3 + PI / 6; a.position.set(Math.cos(ang) * 3.2 * (1 - e), Math.sin(ang) * 3.2 * (1 - e), 1.2 * (1 - e)); a.rotation.z = (1 - e) * 1.4; a.visible = tt > ta; });
      icing.scale.setScalar(Math.max(0.001, pop(tt, t.load2 - 0.15))); icing.visible = tt > t.load2 - 0.15;
      sprinkles.visible = tt > t.donuts - 0.12; sprinkles.scale.setScalar(Math.max(0.001, pop(tt, t.donuts - 0.12)));
    }
    S.trackClip.constant = trackX(tt);
    S.thirdClip.constant = lerp(T.x0, 34.5, smooth(u01(tt, t.third - 0.1, t.third + 0.8)));
    const glowK = smooth(u01(tt, t.night - 0.3, t.night + 0.1)) * (1 - smooth(u01(tt, t.addF, t.addF + 0.3)));
    const dim = 1 - 0.85 * glowK;
    S.thirdMat.emissiveIntensity = tt > t.v625 - 0.1 && tt < t.addF ? 0.55 + 0.25 * Math.sin(tt * 7) * Math.sin(tt * 3.1) + 0.6 * smooth(u01(tt, t.dont, t.touched)) * (tt < t.touched + 0.6 ? 1 : 0) : tt > t.addF ? 0.15 : 0;
    S.sun.intensity = 3.1 * dim; S.hemi.intensity = 1.05 * dim; studio.scene.environmentIntensity = 0.45 * dim; studio.fill.intensity = (story.look.fill ?? 0.5) * dim;
    lampMats.forEach((m) => (m.emissiveIntensity = 1.6 * dim));
    // vents
    S.fans.forEach((f, i) => { f.g.visible = tt > t.giantA - 0.1; f.g.scale.setScalar(pop(tt, t.giantA - 0.1 + i * 0.12)); f.spin(Math.max(0, tt - t.giantA) ** 1.6 * 9); });
    S.grates.forEach((g, i) => { g.visible = tt > t.fans; g.scale.setScalar(pop(tt, t.fans + 0.1 + i * 0.1)); });
    const air = smooth(u01(tt, t.blast - 0.3, t.blast)) * (1 - smooth(u01(tt, t.midair + 0.2, t.midair + 0.6)));
    airIn.update(tt, air); airOut.update(tt, air); void ventOpen;
    route.update(tt, smooth(u01(tt, t.sideways - 0.1, t.sideways + 0.3)) * (1 - smooth(u01(tt, t.with - 0.4, t.with))));
    // station
    S.stn.visible = stOpen; S.bore.visible = !stOpen;
    S.stn.children.forEach((ch, i) => { const ts = S.turnstiles.findIndex((x) => x.g === ch); const at = ts >= 0 ? t.turn + 0.08 * ts : t.stations + 0.05 + (i % 9) * 0.05; ch.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, at, at + 0.26), 2.2))); });
    S.puddle.scale.set(2.0, 1.1, 1); S.puddle.visible = tt > t.stations + 0.4;
    const dripP = ((tt - t.puddle) % 1.1 + 1.1) % 1.1; S.drip.visible = tt > t.puddle - 0.2; S.drip.position.y = ST.y1 - 0.4 - Math.min(1, dripP / 0.55) ** 2 * (ST.y1 - 0.4 - PLAT);
    S.esc.visible = escOpen; S.esc.scale.set(1, easeOutBack(u01(tt, t.esc, t.esc + 0.3)), 1);
    S.entrance.visible = escOpen; S.entrance.scale.setScalar(easeOutBack(u01(tt, t.esc + 0.15, t.esc + 0.45)));
    S.map.visible = tt > t.map - 0.12; S.map.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, t.map - 0.12, t.map + 0.15), 2.6))); S.map.rotation.z = wobble(tt, t.map + 0.15, 0.12, 18, 6);
    show(wetSign, tt > t.puddle - 0.2); wetSign.position.set(21.5, PLAT, -2.0); wetSign.scale.setScalar(pop(tt, t.puddle - 0.2)); wetSign.rotation.y = -0.4;
    disp.material.map = tt > TAPS[2] + 0.08 || TAPS.some((k) => tt > k + 0.08 && tt < k + 0.3) ? dispTex[1] : dispTex[0];
    { const k = TAPS.find((a) => tt > a + 0.05 && tt < a + 0.32); xMark.visible = !!k; if (k) { const p1 = ts1(); xMark.position.set(p1.x - 0.2, PLAT + 1.5, p1.z + 0.3); xMark.scale.setScalar(0.4 * pop(tt, k + 0.05, 0.12)); } }
    S.turnstiles.forEach((ts, i) => { ts.arms.rotation.x = i === 1 && tt > t.ride ? 0.55 * smooth(u01(tt, t.ride, t.hole)) + 0.03 * Math.sin(tt * 30) - 0.25 * wobble(tt, t.dug, 1, 16, 5) : i === 0 ? PI * 0.667 * smooth(u01(tt, GW.through - 0.35, GW.through + 0.15)) : 0; });
    // trains
    const pX = trainPX(tt); trainP.g.position.set(pX, T.floor + 0.02, T.z); trainP.g.visible = pX > -16 && pX < 45;
    const lit = tt < t.v625 ? 0 : tt < t.v625 + 0.45 ? (Math.sin((tt - t.v625) * 70) > 0 ? 1 : 0.15) : 1;
    pWin.forEach((m) => (m.emissiveIntensity = 0.55 * lit)); pHead.forEach((m) => m.color.setHex(lit > 0.5 ? 0xfff3c8 : 0x3a3a3a));
    train1.g.position.set(train1X(tt), T.floor + 0.02, T.z); train1.g.visible = train1X(tt) > -16;
    train2.g.position.set(train2X(tt), T.floor + 0.02, T.z); train2.g.visible = train2X(tt) > -16;
    train3.g.position.set(train3X(tt), T.floor + 0.02, T.z); train3.g.visible = train3X(tt) > -16 && tt < t.dug;

    garyAt(tt); bakerAt(tt, pPush); raccoonAt(tt); pigeonAt(tt); commutersAt(tt);

    // ---- camera (one take) + impact shake; the sun follows what we look at
    const cam = rail.at(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const k = shake(tt, hits); studio.camera.position.x += k.x; studio.camera.position.y += k.y; studio.camera.rotation.z += k.r;
    S.aimSun(cam.look[0], cam.look[1], Math.max(6, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.6));
    fx.update(tt, studio.camera);
  }
  function unpop2(tt, t0) { return tt < t0 ? 1 : Math.max(0.001, 1 - clamp((tt - t0) / 0.2) ** 2); }

  // ---------------------------------------------------------------- Gary (never teleports on screen)
  function ladderX(tt) { return tt < t.soT ? HOLE[1] - 0.12 : LS[1] - 0.12; }
  // the ending walk: out of the puddle, OUT through the exit lane (free), back round to pay to get IN
  const ts0 = () => S.turnstiles[0].g.position, ts1 = () => S.turnstiles[1].g.position, ts2 = () => S.turnstiles[2].g.position;
  const GW = { up0: t.puddle + 0.9, up1: t.puddle + 1.3, a: t.puddle + 1.3, through: t.subwayE + 0.1, round: t.subwayE + 0.7, at: t.subwayE + 1.3 };
  const TAPS = [t.pays + 0.1, t.pays + 0.47, t.pays + 0.84];   // three separate tries (on the words they all fell inside 0.5 s)
  function garyAt(tt) {
    const g = gary; g.root.visible = true;
    const old = smooth(u01(tt, t.n100 - 0.2, t.beard)), trimmed = tt > t.spinning + 0.2;
    const age = { beard: tt < t.with ? 0 : trimmed ? 0.15 + 0.35 * easeOutBack(u01(tt, t.bad, t.bad + 0.45), 2.4) : old, gray: tt < t.with ? 0 : 1 };   // grated to stubble, boings back
    clipboard.visible = (tt > t.send && tt < t.give) || (tt > t.notW - 0.3 && tt < t.digs - 0.1); clipboard.scale.setScalar(tt > t.notW - 0.3 && tt < t.digs ? 1.9 : 1);
    handShovel.visible = (tt > t.digs - 0.1 && tt < t.leak) || (tt > t.now && tt < t.soT);
    handCroissant.visible = tt > LAND + 0.3 && tt < t.garyR - 0.35; handCroissant.scale.setScalar(Math.max(0.01, 1 - 0.75 * u01(tt, LAND + 0.6, t.garyR - 0.4)));
    cheese.visible = tt > t.cheese - 0.15 && tt < t.chews; cheese.scale.setScalar(Math.max(0.01, 1 - 0.9 * smooth(u01(tt, t.cheese + 0.05, t.chews - 0.1))));
    card.visible = tt > GW.at - 0.2;
    garyShades.visible = tt > t.bouncer - 0.25 && tt < t.digs - 0.2;
    dizzy.update(tt, 0, [0, 0, 0]);
    show(butter, tt > PANC + 0.15 && tt < POOF); show(syrup, butter.visible);
    glowLight.intensity = 0; glowSprite.visible = false; looseSeg.visible = tt > t.garyR - 0.6 && tt < t.zero; qMark.visible = false;
    looseSeg.position.set(lerp(1.5, SEG_X, smooth(u01(tt, t.garyR - 0.6, t.garyR - 0.1))), T.floor + 0.25, 0.3); looseSeg.rotation.set(0, 0.15, 0);
    const base = { t: tt, eyes: 'open', mouth: 'smile', brows: 0, ...age };
    if (tt < t.send - 0.15) return hide(g);
    if (tt < t.down) { const u = u01(tt, t.send - 0.15, t.down - 0.05); return g.set({ ...base, x: lerp(-3.4, ladderX(tt) - 0.25, u), y: 0, z: -1.5, rotY: -PI / 2 + 0.3, walk: tt * 9, walkAmt: u < 1 ? 1 : 0, mouth: 'grin', head: { x: 0, y: 0.6, z: 0 } }); }
    if (tt < t.inspect) { // climbs down the ladder
      const u = u01(tt, t.down, t.inspect - 0.05), c = Math.sin(tt * 16);
      return g.set({ ...base, x: ladderX(tt) - 0.3, y: -DIG * u, z: -1.5, rotY: PI / 2, armL: { x: -2.6 + 0.4 * c, z: 0.2, el: 0.6 }, armR: { x: -2.6 - 0.4 * c, z: 0.2, el: 0.6 }, legL: { x: -0.6 * Math.max(0, c), kn: 0.8 * Math.max(0, c) }, legR: { x: -0.6 * Math.max(0, -c), kn: 0.8 * Math.max(0, -c) } });
    }
    if (tt < t.walls) { const look = Math.sin((tt - t.inspect) * 2.2); return g.set({ ...base, x: HX, y: -DIG, z: SZ, rotY: 0.15 * look, head: { x: -0.1, y: 0.5 * look, z: 0 }, armL: { x: -1.0, z: 0.25, el: 1.3 }, armR: tt > t.itC ? { x: -1.6, z: 0.5, el: 1.2 } : { x: 0.1, z: 0.15 }, mouth: tt > t.itC ? 'grin' : 'smile' }); }
    if (tt < t.give + 0.15) { // a pebble on the hat, a look up, a gulp… then the scream
      const sh = tt > t.give - 0.3 ? 0.05 * Math.sin(tt * 40) : 0, gulp = tt > t.imm && tt < t.imm + 0.25;
      return g.set({ ...base, x: HX + sh, y: -DIG, z: SZ, eyes: 'wide', mouth: tt > t.give - 0.3 ? 'scream' : gulp ? 'flat' : 'o', brows: 1, look: [0, 1], head: { x: -0.45, y: 0, z: 0 }, squash: gulp ? [0.96, 1.04] : [1, 1], armL: tt > t.give - 0.3 ? { x: -0.5, z: 0.9, el: 1.4 } : { x: 0, z: 0.2 }, armR: tt > t.give - 0.3 ? { x: -0.5, z: 0.9, el: 1.4 } : { x: 0, z: 0.2 } });
    }
    if (tt < t.fossilG - 0.05) return hide(g);
    if (tt < t.out) { // a fossil, in the fill of his own hole, next to the dinosaur
      const blink = tt > t.fossil + 0.5 && tt < t.fossil + 0.65;
      return g.set({ ...base, x: HX + 0.15, y: -1.95 - 0.62, z: 0.0, rz: PI / 2 + 0.06, eyes: tt < t.fossil + 0.3 || blink ? 'closed' : 'open', look: [1, 0], mouth: 'flat', tint: [0xdccfaf, 0.78],
        armL: { x: 0, z: 1.3, el: -0.6 }, armR: { x: -0.3, z: 1.1, el: 0.9 }, legL: { x: -0.5, kn: 0.7 }, legR: { x: 0.4, kn: 0.2 } });
    }
    if (tt < t.out + 1.0) { const [x, y, z] = hop(tt, t.out, t.out + 1.0, [HX + 0.15, -2.6, 0.0], [HX, -3.0, SZ], 3.4); return g.set({ ...base, x, y, z, rx: (tt - t.out) * 10, eyes: 'spiral', mouth: 'o', tint: [0xdccfaf, 0.78 * (1 - u01(tt, t.out, t.out + 0.5))], armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    if (tt < t.bouncer - 0.25) { const dz = tt < t.beams; dizzy.update(tt, dz ? 1 : 0, [HX, -3.0 + 1.62, SZ]); return g.set({ ...base, x: HX, y: -3.0, z: SZ, squash: squash(tt, t.out + 1.0, 0.35), rotY: dz ? 0.2 * Math.sin(tt * 4) : 0, eyes: dz ? 'spiral' : 'wide', mouth: dz ? 'wavy' : 'grin', head: { x: dz ? 0 : -0.2, y: dz ? 0.2 * Math.sin(tt * 5) : 0.6 * Math.sin(tt * 2), z: 0 } }); }
    if (tt < t.digs - 0.1) { // the bouncer: shades on, hands folded, flicks the dirt out, checks the list, shakes his head
      const flick = tt > t.dirt - 0.1 && tt < t.dirt + 0.35, listUp = tt > t.notW - 0.3, shakeNo = tt > t.notW && tt < t.list + 0.4;
      return g.set({ ...base, x: HX + 0.1, y: -3.0, z: SZ, rotY: 0.1, mouth: 'flat', eyes: 'open', brows: -0.5,
        armR: flick ? { x: -0.6, z: 1.3, el: 0.3 } : { x: -0.35, z: -0.4, el: 0.7 }, armL: listUp ? { x: -1.5, z: 0.2, el: 1.3 } : { x: -0.35, z: -0.4, el: 0.7 },
        head: { x: -0.05, y: shakeNo ? 0.45 * Math.sin((tt - t.notW) * 18) : 0, z: 0 }, legL: { x: 0, z: -0.12 }, legR: { x: 0, z: 0.12 } });
    }
    if (tt < t.leak - 0.15) { const ph = (tt - t.digs) * 2.5 * PI; return g.set({ ...base, x: HX, y: bottomAt(tt), z: SZ, rotY: 0.3, lean: 0.35, eyes: 'half', mouth: 'flat', armR: { x: -1.2 + 0.7 * Math.sin(ph), z: 0.2, el: 0.6 }, armL: { x: -1.0 + 0.7 * Math.sin(ph), z: 0.35, el: 1.0 } }); }
    if (tt < t.pumps + 0.5) { // floats on the rising water (face above it); can't swim; flails
      const L = level(tt), ph = tt * 9, flail = tt > t.cant - 0.1, dip = Math.sin(PI * u01(tt, t.cant + 0.15, t.cant + 0.75)) * 0.75;   // "can't swim": goes under, the hat floats
      return g.set({ ...base, x: HX + 0.1 * Math.sin(tt * 2), y: Math.max(-5.2, L - 0.62 - dip - (flail ? 0.1 * Math.max(0, Math.sin(tt * 5)) : 0)), z: SZ + 0.4, eyes: 'wide', mouth: flail ? 'scream' : 'o', brows: 1, hatLift: dip * 1.25,
        armL: { x: -2.6 + 0.7 * Math.sin(ph), z: 0.9 }, armR: { x: -2.6 + 0.7 * Math.sin(ph + 2), z: 0.9 }, legL: { x: 0.4 * Math.sin(ph) }, legR: { x: -0.4 * Math.sin(ph) } });
    }
    if (tt < t.now) { const L = level(tt), sit = L <= -5.15; return g.set({ ...base, x: HX, y: sit ? -5.2 - 0.22 : Math.max(-5.2, L - 0.62), z: SZ + 0.4, eyes: sit ? 'spiral' : 'wide', mouth: 'o', legL: sit ? { x: -1.5, kn: 0.2 } : undefined, legR: sit ? { x: -1.5, kn: 0.2 } : undefined, armL: { x: 0, z: 0.5 }, armR: { x: 0, z: 0.5 } }); }
    if (tt < t.with) { const ph = (tt - t.now) * 2.5 * PI; return g.set({ ...base, x: HX + 0.4 * u01(tt, t.now, t.with), y: bottomAt(tt), z: SZ, rotY: 0.6, lean: 0.3, eyes: 'half', mouth: 'flat', brows: 1, armR: { x: -1.2 + 0.7 * Math.sin(ph), z: 0.2, el: 0.6 }, armL: { x: -1.0 + 0.7 * Math.sin(ph), z: 0.35, el: 1.0 } }); }
    if (tt < t.soT) { // digs sideways for a hundred years; the ceiling ends up resting on him (his beard is load-bearing)
      const ph = (tt - t.with) * 2.4 * PI, x = handTip(tt) - 0.45, load = tt > t.load - 0.1;
      return g.set({ ...base, x, y: HT.y0, z: SZ, rotY: load ? 0.15 : PI / 2 - 0.35, lean: load ? 0 : 0.3, eyes: 'half', mouth: 'flat', brows: load ? -0.3 : 0, squash: [1, 1],
        armR: load ? { x: 0, z: 0.25 } : { x: -1.2 + 0.7 * Math.sin(ph), z: 0.2, el: 0.6 }, armL: load ? { x: 0, z: 0.25 } : { x: -1.0 + 0.7 * Math.sin(ph), z: 0.35, el: 1.0 } });
    }
    if (tt < t.chews) { // runs back, drops to the shaft floor, pinned between the cutterhead and the wall; holds up the cheese
      const run = u01(tt, t.soT, t.buy + 0.2), x = lerp(HT.x1 - 0.45, GAP_X, run), y = lerp(HT.y0, -8.0, smooth(run));
      const cheesing = tt > t.cheese - 0.15;
      return g.set({ ...base, x, y, z: SZ + 0.55, rotY: cheesing ? -PI / 2 + 0.5 : 0.2, eyes: 'wide', mouth: tt > t.spinning && tt < t.cheese ? 'scream' : 'o', brows: 1, squash: tt > t.buy + 0.2 && tt < t.spinning ? [0.85, 1.05] : [1, 1],
        armL: cheesing ? { x: -1.5, z: 0.2, el: 0.4 } : { x: 0.2, z: 1.0, el: 0.2 }, armR: cheesing ? { x: -1.5, z: 0.2, el: 0.4 } : { x: 0.2, z: 1.0, el: 0.2 }, head: { x: 0, y: tt > t.grater + 0.3 ? -0.5 : 0.3, z: 0 } });
    }
    if (tt < SHRED + 0.05) { // scrambles up the ladder just ahead of the cutterhead
      const u = u01(tt, t.chews, SHRED), c = Math.sin(tt * 22);
      return g.set({ ...base, x: LS[1] - 0.45, y: lerp(-8.0, 0.0, smooth(u)), z: -1.4, rotY: PI / 2, eyes: 'wide', mouth: 'o', armL: { x: -2.6 + 0.4 * c, z: 0.2, el: 0.6 }, armR: { x: -2.6 - 0.4 * c, z: 0.2, el: 0.6 }, legL: { x: -0.7 * Math.max(0, c), kn: 0.9 * Math.max(0, c) }, legR: { x: -0.7 * Math.max(0, -c), kn: 0.9 * Math.max(0, -c) } });
    }
    const WALK0 = SHRED + 0.05, WALK1 = t.holding + 0.3, GX = CRACK_X - 0.35;
    if (tt < WALK1) { // hops out onto the lawn and walks over to look at the bakery
      const hp = u01(tt, WALK0, WALK0 + 0.35), u = u01(tt, WALK0 + 0.35, WALK1);
      const x = hp < 1 ? lerp(LS[1] - 0.45, -3.9, hp) : lerp(-3.9, GX, u), y = hp < 1 ? 0.35 * Math.sin(hp * PI) : 0, z = hp < 1 ? lerp(-1.4, -1.0, hp) : lerp(-1.0, -0.5, u);
      return g.set({ ...base, x, y, z, rotY: PI / 2 - 0.2, walk: hp < 1 ? undefined : tt * 10, eyes: 'open', mouth: 'smile' });
    }
    if (tt < SLIP) { // watches the bakery sink; peers into the crack as the croissants go first
      const scared = tt > t.settle - 0.3, peer = tt > t.crois - 0.5;
      return g.set({ ...base, x: GX + (peer ? 0.12 : 0), y: 0, z: -0.5, rotY: peer ? PI / 2 : PI / 2 - 0.5, lean: peer ? 0.5 : 0, eyes: scared ? 'wide' : 'open', mouth: scared ? 'o' : 'smile', brows: scared ? 1 : 0, look: peer ? [0, -1] : [0.6, 0.4], squash: squash(tt, t.settle - 0.25, 0.15), armL: scared && !peer ? { x: -2.4, z: 0.5, el: 1.6 } : undefined, armR: scared && !peer ? { x: -2.4, z: 0.5, el: 1.6 } : undefined });
    }
    if (tt < LAND) { // falls down the crack (squeezed thin) into the tunnel
      const u = u01(tt, SLIP, LAND), inSoil = u > 0.08 && u < 0.85;
      return g.set({ ...base, x: lerp(GX + 0.12, CRACK_X - 0.05, clamp(u * 4)), y: lerp(0, T.floor, u * u), z: lerp(-0.5, -0.35, u), rotY: 0.2, eyes: 'wide', mouth: 'scream', brows: 1, squash: inSoil ? [0.45, 1.25] : [1, 1], armL: { x: -2.9, z: 0.2 }, armR: { x: -2.9, z: 0.2 } });
    }
    if (tt < t.garyR - 0.35) { // lands on the croissant pile; grabs one and eats; hops when the 60-ton ring slams down
      const eat = tt > LAND + 0.3, chew = eat && Math.sin(tt * 12) > 0, lookUp = tt > t.they - 0.1 && tt < t.up + 0.6;
      const hopY = tt > t.n60 && tt < t.n60 + 0.35 ? 0.3 * Math.sin(PI * u01(tt, t.n60, t.n60 + 0.35)) : 0;
      dizzy.update(tt, tt < LAND + 0.6 ? 1 : 0, [CRACK_X - 0.05, T.floor + 1.65, -0.35]);
      return g.set({ ...base, x: CRACK_X - 0.05, y: T.floor + hopY, z: -0.35, rotY: eat ? 0.35 : 0.1, squash: squash(tt, LAND, 0.35), eyes: lookUp ? 'wide' : eat ? 'half' : 'wide', mouth: chew ? 'grin' : eat ? 'flat' : 'o', look: lookUp ? [0.6, 1] : [0, 0.6], head: lookUp ? { x: -0.45, y: 0.3, z: 0 } : { x: -0.15, y: 0, z: 0 },
        armL: eat ? { x: -1.9 + 0.3 * Math.sin(tt * 6), z: 0.2, el: 1.6 } : { x: -2.4, z: 0.4, el: 0.5 } });
    }
    if (tt < PANC) { // walks over to the spare segment and tries to lift it: knees buckle, face goes red
      const w = u01(tt, t.garyR - 0.35, t.carry - 0.15), lift = smooth(u01(tt, t.carry - 0.15, t.carry + 0.35)), strain = Math.sin(tt * 30) * 0.02 * lift;
      looseSeg.position.set(SEG_X - 0.3 * lift, T.floor + 0.25 + lift * 2.0, 0.3 - 0.25 * lift); looseSeg.rotation.set(0, 0.15, 0.04 * Math.sin(tt * 30) * lift);
      return g.set({ ...base, x: lerp(CRACK_X - 0.05, CARRY_X, w) + strain, y: T.floor, z: lerp(-0.35, 0.05, w), rotY: w < 1 ? -PI / 2 + 0.3 : 0.5, walk: w < 1 ? tt * 9 : undefined, lean: 0.3 * (1 - lift), legL: { x: -0.4 * lift, kn: 0.8 * lift + 0.15 * Math.sin(tt * 26) * lift }, legR: { x: -0.4 * lift, kn: 0.8 * lift + 0.15 * Math.sin(tt * 26 + 1) * lift },
        armL: { x: -0.6 - 2.5 * lift, z: 0.15, el: 0.2 }, armR: { x: -0.6 - 2.5 * lift, z: 0.15, el: 0.2 }, eyes: lift > 0.3 ? 'wide' : 'open', mouth: lift > 0.3 ? 'teeth' : 'grin', brows: -1 * lift, faceTint: [0xe0483a, 0.45 * lift] });
    }
    if (tt < POOF) { looseSeg.position.set(CARRY_X, T.floor + 0.35 + 2.0 * (1 - easeOutBack(u01(tt, PANC, PANC + 0.18))), 0.05); looseSeg.rotation.set(0, 0.15, 0);
      const flat = u01(tt, PANC + 0.03, PANC + 0.13); butter.position.set(CARRY_X, T.floor + 0.33, 0.05); syrup.position.set(CARRY_X, T.floor + 0.28, 0.05);
      return g.set({ ...base, x: CARRY_X, y: T.floor, z: 0.05, rotY: 0.6, squash: [1 + 0.9 * flat, 1 - 0.86 * flat], eyes: 'x', mouth: 'flat', tint: [0xc98a3a, 0.35 * flat] }); }
    if (tt < t.passes + 0.4) { // pops back into shape, jogs down the miles of tunnel, goes green, keels over
      looseSeg.position.set(CARRY_X - 0.6, T.floor + 0.25, 0.3); looseSeg.rotation.set(0, 0.6, 0);
      const u = u01(tt, POOF + 0.35, t.passesG), x = lerp(CARRY_X, 9.6, u), keel = smooth(u01(tt, t.passesG, t.passes + 0.35));
      return g.set({ ...base, x, y: T.floor - 0.4 * keel, z: -0.45, rotY: PI / 2 - 0.5 * (1 - keel), rx: -1.45 * keel, squash: tt < POOF + 0.3 ? [lerp(1.9, 1, u01(tt, POOF, POOF + 0.3)), Math.max(0.14, 0.14 + 1.0 * easeOutBack(u01(tt, POOF, POOF + 0.3), 2.6))] : squash(tt, POOF + 0.3, 0.3), walk: u > 0 && u < 1 ? tt * 13 : undefined, eyes: keel > 0.5 ? 'x' : 'half', mouth: 'wavy', faceTint: [0x7fbf3f, 0.45 * u01(tt, t.zero, t.passesG)] }); }
    if (tt < BLOWN) return g.set({ ...base, x: 9.6, y: T.floor - 0.62 + 0.18, z: -0.45, rotY: PI / 2, rx: -PI / 2 + 0.05, eyes: 'x', mouth: 'o', faceTint: [0x7fbf3f, 0.45], armL: { x: -0.2, z: 1.2 }, armR: { x: -0.2, z: 1.2 } });
    const HOV = [13.6, -4.5, -0.45];
    if (tt < t.streetA) { // blown along the tunnel and up the vent shaft
      const u = u01(tt, BLOWN, t.streetA), p = [lerp(9.6, HOV[0], smooth(u)), lerp(T.floor - 0.44, HOV[1], u * u), HOV[2]];
      return g.set({ ...base, x: p[0], y: p[1], z: p[2], rotY: PI / 2, rx: -PI / 2 + u * 4, eyes: 'x', mouth: 'o', faceTint: [0x7fbf3f, 0.45 * (1 - u)], hatLift: 1 + 2 * u, armL: { x: -2.6, z: 0.6 }, armR: { x: -2.6, z: 0.6 } });
    }
    if (tt < t.midair + 0.3) { // hovering in the updraft under the fan; wakes up mid-air
      const awake = tt > t.wakes, look = tt > t.midair - 0.2;
      return g.set({ ...base, x: HOV[0] + 0.05 * Math.sin(tt * 7), y: HOV[1] + 0.12 * Math.sin(tt * 5), z: HOV[2], rotY: 0.2, rx: awake ? 0 : 0.3 * Math.sin(tt * 3), eyes: awake ? 'wide' : 'x', mouth: awake ? (look ? 'scream' : 'o') : 'o', brows: awake ? 1 : 0, look: look ? [0, -1] : [0, 0], head: { x: look ? 0.45 : 0, y: 0, z: 0 },
        hatLift: 2.6 + 0.3 * Math.sin(tt * 6), hairUp: 0.8, armL: { x: -2.4 + 0.5 * Math.sin(tt * 14), z: 0.9 }, armR: { x: -2.4 + 0.5 * Math.sin(tt * 14 + 2), z: 0.9 }, legL: { x: 0.3 * Math.sin(tt * 12) }, legR: { x: -0.3 * Math.sin(tt * 12) } });
    }
    const PX = 13.5;
    if (tt < LAND_A + 0.4) { // falls back down; the hat lands back on his head a beat later
      const u = u01(tt, t.midair + 0.3, LAND_A), y = lerp(HOV[1], T.floor, u * u), hatL = tt < LAND_A ? 2.6 : 2.6 * (1 - u01(tt, LAND_A, LAND_A + 0.3) ** 2);
      return g.set({ ...base, x: lerp(HOV[0], PX, u), y, z: -0.45, rotY: 0.2, eyes: 'wide', mouth: 'scream', squash: squash(tt, LAND_A, 0.35), hatLift: hatL, hairUp: 0.8, armL: { x: -2.8, z: 0.3 }, armR: { x: -2.8, z: 0.3 } });
    }
    if (tt < t.dont) { // the rails zip in under him (hop), the dark train coasts to a stop behind him (no power); he eyes the third rail
      const atRail = tt > t.third, hopY = (tt > TRACK_AT && tt < TRACK_AT + 0.3 ? 0.3 * Math.sin(PI * u01(tt, TRACK_AT, TRACK_AT + 0.3)) : 0) + (tt > t.v625 && tt < t.v625 + 0.3 ? 0.22 * Math.sin(PI * u01(tt, t.v625, t.v625 + 0.3)) : 0);   // + a flinch when it crackles
      return g.set({ ...base, x: PX, y: T.floor + 0.08 + hopY, z: lerp(-0.45, 0.0, smooth(u01(tt, t.third, t.v625))), rotY: atRail ? 0.4 : 0.1, squash: squash(tt, LAND_A, 0.3), eyes: atRail ? 'wide' : 'open', mouth: atRail ? 'o' : 'smile', look: atRail ? [-0.3, -0.6] : [-0.6, 0], head: atRail ? { x: 0.3, y: -0.3, z: 0 } : { x: 0, y: -0.5, z: 0 } });
    }
    if (tt < t.touched) { // reaches… freezes on "Gary." with a look to camera… then the finger goes in
      const reach = smooth(u01(tt, t.dont, t.garyD)), caught = tt > t.garyD && tt < t.garyD2, poke = smooth(u01(tt, t.garyD2, t.touched));
      const r = caught ? reach * 0.75 : Math.max(reach * 0.75, poke);   // a real crouch: the fingertip lands on the rail cover on "touched"
      return g.set({ ...base, x: PX - 0.05, y: T.floor + 0.08 - 0.2 * r, z: 0.0, rotY: -0.15, lean: 0.2 + 0.6 * r, legL: { x: -0.6 * r, kn: 1.1 * r }, legR: { x: -0.2 * r, kn: 0.8 * r }, armR: { x: -0.5 - 0.45 * r, z: 0.05, el: 0.05 }, armL: { x: 0.2, z: 0.3 },
        eyes: caught ? 'half' : 'open', mouth: caught ? 'grin' : 'smile', brows: caught ? -0.7 : -0.3, look: caught ? [0, 0] : [-0.2, -0.6], head: caught ? { x: -0.1, y: 0, z: 0.1 } : { x: 0.3, y: -0.2, z: 0 } });
    }
    if (tt < t.touched + 0.65) { const on = Math.floor((tt - t.touched) * 9) % 2 === 0; return g.set({ ...base, x: PX - 0.05 + 0.03 * Math.sin(tt * 60), y: T.floor + 0.08, z: 0.0, rotY: -0.15, lean: 0.5, armR: { x: -1.05, z: 0.05, el: 0.05 }, armL: { x: -0.4, z: 1.3 }, eyes: 'wide', mouth: 'scream', hairUp: 1, hatLift: Math.min(3, (tt - t.touched) * 6), xray: on }); }
    if (tt < DEP) { // the nightlight
      const glow = smooth(u01(tt, t.night - 0.3, t.night + 0.1)); glowLight.intensity = 9 * glow; glowLight.position.set(PX, T.floor + 0.9, 0.3); glowSprite.visible = glow > 0.01; glowSprite.position.set(PX, T.floor + 0.95, 0.4); glowSprite.material.opacity = 0.45 * glow;
      return g.set({ ...base, x: PX - 0.05, y: T.floor + 0.08, z: 0.0, rotY: -0.1, eyes: glow > 0.5 ? 'closed' : 'spiral', mouth: glow > 0.5 ? 'smile' : 'o', hairUp: 1, noHat: true, char: 0.45 * (1 - glow), tint: [0xfff1a8, 0.55 * glow], glow: [0xffc84a, 1.1 * glow] });
    }
    const zapped = { hairUp: 1, noHat: true, char: 0.3 * (1 - u01(tt, t.addF, t.end)) };
    if (tt < SCOOP) { const glow = smooth(u01(tt, t.night - 0.3, t.night + 0.1)) * (1 - u01(tt, DEP, SCOOP)); glowLight.intensity = 9 * glow; glowLight.position.set(PX, T.floor + 0.9, 0.3); glowSprite.visible = glow > 0.01; glowSprite.position.set(PX, T.floor + 0.95, 0.4); glowSprite.material.opacity = 0.45 * glow;
      return g.set({ ...base, ...zapped, x: PX - 0.05, y: T.floor + 0.08, z: 0.0, rotY: -0.5, eyes: 'wide', mouth: 'o', brows: 1, look: [-1, 0], head: { x: 0, y: -0.7, z: 0 }, tint: [0xfff1a8, 0.55 * glow], glow: [0xffc84a, 1.1 * glow] }); }
    if (tt < FLING) { const fr = trainPX(tt) + 3.2 + 0.28; return g.set({ ...base, ...zapped, x: fr, y: T.floor + 0.5, z: T.z + 0.2, rotY: PI / 2, lean: -0.4, eyes: 'wide', mouth: 'scream', brows: 1, armL: { x: -0.4, z: 1.5 + 0.2 * Math.sin(tt * 30) }, armR: { x: -0.4, z: 1.5 + 0.2 * Math.sin(tt * 30 + 1) }, legL: { x: 0.4 }, legR: { x: -0.2 } }); }
    if (tt < FLAND) { const [x, y, z] = hop(tt, FLING, FLAND, [trainPX(FLING) + 3.48, T.floor + 0.5, T.z + 0.2], [18.9, PLAT, -2.6], 1.6); return g.set({ ...base, ...zapped, x, y, z, rx: (tt - FLING) * 9, eyes: 'spiral', mouth: 'o', armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    if (tt < t.map - 0.1) { dizzy.update(tt, 1 - u01(tt, FLAND + 0.6, t.map - 0.1), [18.9, PLAT + 1.65, -2.6]); return g.set({ ...base, ...zapped, x: 18.9, y: PLAT, z: -2.6, rotY: 0.3, squash: squash(tt, FLAND, 0.35), eyes: tt < FLAND + 0.6 ? 'spiral' : 'open', mouth: 'wavy' }); }
    if (tt < t.puddle - 0.4) { qMark.visible = tt > t.map + 0.2; qMark.position.set(18.9, PLAT + 1.85, -2.6); qMark.scale.setScalar(0.55 * pop(tt, t.map + 0.2)); return g.set({ ...base, ...zapped, x: 18.9, y: PLAT, z: -2.6, rotY: PI, head: { x: 0, y: 0, z: 1.3 * smooth(u01(tt, t.map, t.map + 0.5)) }, eyes: 'spiral', mouth: 'wavy' }); }
    if (tt < GW.up0) { const u = u01(tt, t.puddle - 0.4, t.puddle), sink = smooth(u01(tt, t.puddle, t.puddle + 0.4)); return g.set({ ...base, ...zapped, x: lerp(18.9, 20.6, u), y: PLAT - 0.75 * sink, z: lerp(-2.6, -2.4, u), rotY: 0.2, walk: u < 1 ? tt * 9 : undefined, eyes: sink > 0.5 ? 'wide' : 'open', mouth: sink > 0.5 ? 'o' : 'smile', armL: { x: -2.2 * sink, z: 0.6 }, armR: { x: -2.2 * sink, z: 0.6 } }); }
    // the ending: climbs out, walks OUT through the exit lane, comes round to pay to get back IN — and gets stuck
    const p2 = ts0(), p1 = ts1(), LANE2 = p2.z + 0.26, LANE1 = p1.z + 0.3;   // out through lane 0 (free), in through lane 1 ($3)
    if (tt < GW.at) {
      let x, z, y = PLAT, rotY = PI / 2, walk = tt * 10;
      if (tt < GW.up1) { const u = u01(tt, GW.up0, GW.up1); x = 20.6; z = -2.4; y = PLAT - 0.75 * (1 - u); walk = undefined; rotY = 0.3; }
      else if (tt < GW.through) { const u = smooth(u01(tt, GW.a, GW.through)); x = lerp(20.6, p2.x + 0.7, u); z = lerp(-2.4, LANE2, smooth(clamp(u * 1.5))); }
      else if (tt < GW.round) { const u = u01(tt, GW.through, GW.round); x = p2.x + 0.7; z = lerp(LANE2, LANE1, u); rotY = PI; }
      else { const u = smooth(u01(tt, GW.round, GW.at)); x = lerp(p2.x + 0.7, p1.x + 0.35, u); z = LANE1; rotY = -PI / 2; }
      return g.set({ ...base, ...zapped, x, y, z, rotY, walk, eyes: 'open', mouth: 'smile' });
    }
    // three swipes ("pays / 3 / dollars": SWIPE AGAIN), shoves through on "ride", wedged on "hole", the bar bonks him on "dug";
    // a sad point up at the GARY ST sign through "the hole he dug"; then kicking
    const tap = TAPS.some((k) => tt > k - 0.08 && tt < k + 0.18), push = tt > t.ride, stuck = tt > t.hole, point = tt > t.hole && tt < t.dug + 0.7;
    dizzy.update(tt, tt > t.dug && tt < t.dug + 1.1 ? 1 : 0, [p1.x + 0.27, PLAT + 1.6, LANE1]);
    return g.set({ ...base, ...zapped, x: p1.x + 0.35 - (push ? 0.12 * smooth(u01(tt, t.ride, t.hole)) : 0), y: PLAT, z: LANE1, rotY: -PI / 2 + 0.95, lean: push ? 0.3 : 0, squash: stuck ? [1.12, 0.93] : squash(tt, t.dug, 0.3), walk: stuck && !point ? tt * 16 : undefined, walkAmt: 0.7,
      eyes: stuck ? 'half' : 'open', mouth: stuck ? 'frown' : 'smile', brows: stuck ? -1 : 0, look: point ? [-0.5, 1] : stuck ? [0.3, 0] : [0, -0.4], head: point ? { x: -0.35, y: -0.3, z: 0 } : undefined,
      armR: tap ? { x: -1.3, z: -0.25, el: 0.9 } : stuck ? { x: -0.6, z: 0.6, el: 0.5 } : { x: -0.8, z: 0.1, el: 0.6 }, armL: point ? { x: -2.7, z: 0.5, el: 0.1 } : { x: -1.0, z: 0.9, el: 0.3 } });
  }
  function bakerAt(tt, push) {
    const panic = tt > t.settle - 0.3 && tt < t.up + 0.2, ok = tt > t.up + 0.2;
    baker.set({ x: 4.15 + (panic ? -0.4 * smooth(u01(tt, t.sinking, t.tunnelS + 0.3)) : 0), y: 0, z: -0.25, rotY: panic ? 0 : -0.2, t: tt, eyes: panic ? 'wide' : 'open', mouth: panic ? 'scream' : ok ? 'grin' : 'smile', brows: panic ? 1 : 0,
      armL: panic ? { x: -2.4, z: 0.5, el: 1.7 } : ok ? { x: -1.4, z: 0.2, el: 1.4 } : { x: 0, z: 0.15, el: 0.3 }, armR: panic ? { x: -2.4, z: 0.5, el: 1.7 } : ok ? { x: -1.9, z: 0.35, el: 1.5 } : { x: 0, z: 0.15, el: 0.3 }, head: { x: 0, y: 0, z: panic ? 0.15 * Math.sin(tt * 14) : 0 }, squash: squash(tt, t.they + 0.3, 0.2 * push) });
  }
  function raccoonAt(tt) {
    const r = raccoon; r.root.visible = true; suitcase.visible = false; floatie.visible = false; r.root.rotation.z = 0;
    if (tt < t.racc - 0.6) return hide(r);
    if (tt < t.send + 0.75) { // moves in: scurries out of its burrow (the arch in the back wall) with a suitcase, waves; backs into it when Gary comes down
      const uo = u01(tt, t.racc - 0.55, t.racc + 0.05), back = smooth(u01(tt, t.send + 0.05, t.send + 0.7)), z = lerp(lerp(BZ - 0.35, R_OUT, easeOutBack(uo, 1.3)), BZ - 0.35, back);
      suitcase.visible = true; suitcase.position.set(BX + 0.3, -DIG, z + 0.12); suitcase.scale.setScalar(1);
      return r.set({ x: BX, y: -DIG, z, rotY: back > 0.01 ? PI : lerp(0, 0.5, smooth(u01(tt, t.racc + 0.05, t.racc + 0.4))), stand: back > 0.01 ? 0 : smooth(u01(tt, t.racc + 0.05, t.racc + 0.45)), wave: tt > t.racc + 0.3 && tt < t.send ? 1 : 0, t: uo < 1 || (back > 0.01 && back < 1) ? tt * 3 : tt, look: [0.3, 0] });
    }
    if (tt > t.racW - 0.1 && tt < t.n13) { // cannonballs in with a floatie and shades; rides the water down when it's pumped out
      const L = level(tt), jump = u01(tt, t.racW - 0.1, t.brought);   // cannonball from the far rim
      const x = jump < 1 ? lerp(HOLE[0] + 0.15, HOLE[1] - 0.5, jump) : HOLE[1] - 0.5 + 0.06 * Math.sin(tt * 1.4);
      const y = jump < 1 ? lerp(0.3, L + 0.02, jump * jump) + 1.2 * Math.sin(jump * PI) * (1 - jump) : Math.max(-5.2, L) + 0.02;
      floatie.visible = true; floatie.position.set(x, Math.max(-5.2, L) + 0.03, -0.55); floatie.scale.setScalar(Math.max(0.01, pop(tt, t.brought - 0.05)));
      r.set({ x, y, z: -0.55, rotY: 0.4, stand: jump < 1 ? 0.3 : 1, t: tt, nod: 0.1 * Math.sin(tt * 2), shades: true }); r.root.rotation.z = jump < 1 ? jump * 4 : 0.08 * Math.sin(tt * 2.2); return;
    }
    if (tt > t.andE - 0.15) { // strolls under the exit turnstile (past Gary), hops onto the train's roof: rides free
      const ts = ts2(), a = t.andE - 0.15, b = t.rides - 0.3, j1 = t.rides + 0.2, ROOF = T.floor + 2.52, sx = (tt2) => train1X(tt2) + 2.4;   // near the nose, in the final frame
      suitcase.visible = true; suitcase.scale.setScalar(1);
      if (tt < b) { const x = lerp(ts.x + 1.6, ts.x - 0.75, u01(tt, a, b)); suitcase.position.set(x + 0.2, PLAT, ts.z + 0.32); return r.set({ x, y: PLAT, z: ts.z + 0.2, rotY: -PI / 2, t: tt * 3, scale: 1.25, shades: true }); }
      if (tt < j1) { const [x, y, z] = hop(tt, b, j1, [ts.x - 0.75, PLAT, ts.z + 0.2], [sx(j1), ROOF, -0.6], 1.0); suitcase.position.set(x + 0.2, y, z + 0.12); return r.set({ x, y, z, rotY: -PI / 2, t: tt * 3, scale: 1.25, shades: true }); }
      const x = sx(tt); suitcase.position.set(x + 0.32, ROOF, -0.48);
      return r.set({ x, y: ROOF, z: -0.6, rotY: 0.5, stand: 1, wave: 1, t: tt, scale: 1.25, shades: true }); // subway surfing
    }
    return hide(r);
  }
  function pigeonAt(tt) {
    const p = pigeon; p.root.visible = true;
    const carTop = 1.47 + car.g.position.y;
    if (tt < t.congrats + 0.1) return p.set({ x: car.x + 0.5, y: carTop, z: D.lanes[0] + 0.2, rotY: 0.6, t: tt, peck: tt > 0.4 && tt < t.dig ? 1 : 0, scale: 1.5 });
    if (tt < t.congrats + 1.2) { const u = u01(tt, t.congrats + 0.1, t.congrats + 1.2); return p.set({ x: car.x + 0.5 + 2.5 * u, y: carTop + 1.5 * u + 3.5 * u * u, z: D.lanes[0] + 0.2 + 1.5 * u, rotY: PI / 2, t: tt, flap: 1, scale: 1.5 }); }
    const IN0 = t.passes - 0.15, IN1 = t.pigeon - 0.05, BLOW = t.blast + 0.25;
    if (tt < IN0) return hide(p);
    if (tt < IN1) { const u = u01(tt, IN0, IN1); return p.set({ x: lerp(12.6, 10.4, u), y: lerp(T.floor + 1.8, T.floor + 0.02, smooth(u)), z: -0.4, rotY: -PI / 2, t: tt, flap: 1 - smooth(u01(tt, IN1 - 0.12, IN1)), scale: 1.6, shades: true }); }
    if (tt < BLOW) return p.set({ x: 10.4 + 0.12 * Math.sin((tt - IN1) * 1.6), y: T.floor + 0.02, z: -0.4, rotY: tt > t.fine ? 0.2 : -1.2, t: tt, peck: tt > t.fine + 0.25 ? 1 : 0, scale: 1.6, shades: true });
    if (tt < BLOW + 1.0) { const u = u01(tt, BLOW, BLOW + 1.0); return p.set({ x: 10.4 + 3.2 * u, y: T.floor + 0.02 + 6 * u * u, z: -0.45, rotY: tt * 9, t: tt, flap: 1, scale: 1.6, shades: true }); }
    hide(p);
  }
  function commutersAt(tt) {
    const on = tt > t.stations + 0.3, mapTilt = smooth(u01(tt, t.nobody, t.nobody + 0.4)) * (1 - smooth(u01(tt, t.puddle - 0.4, t.puddle)));
    const spots = [[18.2, -2.9, 0.3], [19.6, -3.0, -0.2], [21.9, -2.6, 0.5], [17.6, -2.2, 0.2], [22.6, -3.2, -0.6]];
    commuters.forEach((c, i) => {
      c.root.visible = on; if (!on) return;
      let [x, z, ry] = spots[i], extra = {};
      const cheer = tt > t.end && tt < t.skip;
      c.set({ x, y: PLAT, z, rotY: ry, t: tt, eyes: 'open', mouth: cheer ? 'grin' : 'smile', ...(cheer ? { armL: { x: -2.8, z: 0.3 }, armR: { x: -2.8, z: 0.3 } } : {}), ...extra, head: extra.head || { x: 0, y: 0.25 * Math.sin(tt * 0.7 + i) * (1 - mapTilt), z: 1.1 * mapTilt * (i % 2 ? 1 : -1) } });
    });
  }

  // QC (`node tools/render.mjs 015-hole-subway --qc`): every 0.25 s, project Gary's head to the screen and list the moments a
  // caption/callout band covers it (the look reviews flagged faces under text every round).
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };   // engine/build/captions.js tops (px of 1920)
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.25) {
      update(tt);
      for (const [who, rig] of [['Gary', gary], ['the old driver', oldDriver]]) { if (!rig.root.visible || (rig === oldDriver && tt < t.end)) continue;
      rig.root.updateMatrixWorld(true); rig.head.getWorldPosition(v); v.project(studio.camera);
      const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
      const bands = [];
      if (story.words.some((w) => tt >= w.t0 && tt < w.t1)) bands.push(['caption', 1000 / 1920]);
      for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
      for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`); }
    }
    update(0); return out;
  };

  update(0);
  return { update };
}
