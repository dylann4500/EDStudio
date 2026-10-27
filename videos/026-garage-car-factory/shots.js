// 026 — "How a Garage Becomes a Car Factory" (build genre, docs/BUILD.md). ONE continuous camera take over a dollhouse cutaway
// (engine/build/factory.js): the story marches +x — the yard (the tow truck takes your car away), your garage (the junk car),
// then the hall pops up over the yard and every fix is built further right: the line, the stamping press + the Cadillac test,
// the robot cell, the e-coat dip tank, the JIT dock, the QC gate + crash lane, the CEO's corner office, and finally QUIK FIX
// AUTO, where your old car is still on the lift. Everything is keyed to the spoken word: W(beat, word) (story.json from
// tools/narrate.py), so re-voicing keeps every gag on its word.
// Continuity: one line of cars (slot k sits at x = line start + s(t) − k·pitch, all cars move together); Gary is welded to the
// door of the car that the line then carries into the dip tank; the Roomba goes intern → supervisor (hard hat) → manager (tie)
// → CEO (top hat) and Gary carries it up to the office; nobody teleports on screen.
//
// Facts (web-searched Oct 26 2026):
//   Ford's moving line, Highland Park, Dec 1 1913: chassis assembly from 12.5 h (">12 hours") to 1 h 33 min (History.com;
//     Guinness "first industrial moving assembly line").
//   Cadillac, Dewar Trophy, Brooklands, March 1908: three Model Ks taken apart, parts mixed (89 swapped from stock), rebuilt,
//     then driven 500 miles (Wikipedia "Dewar Trophy"; EBSCO "Cadillac demonstrates interchangeable parts").
//   Unimate, the first industrial robot: GM's Inland Fisher Guide plant, Ewing Twp NJ, 1961 (Wikipedia "Unimation"; Guinness).
//   "About 30,000 parts, counting every part down to the smallest screws" (Toyota: global.toyota plant tours; Toyota Times).
//   Just-in-time = the Toyota Production System (Taiichi Ohno).
//   Crumple zone: Béla Barényi, Mercedes-Benz patent 854157 (filed 1951, granted 1952), first in the 1959 W111.
//   E-coat: the body is dipped in a paint bath; a DC current deposits the film, which reaches recesses (Kluthe; Ford/BETA CAE).
//   $7.6 B: Hyundai Motor Group Metaplant America, Georgia, opened Mar 2025, $7.59 B (Georgia.org; Wikipedia).
//   53 s: Ford's Dearborn Truck Plant builds one F-150 every 52–53 s (IndustryWeek; Ford Authority).
//   35 mph: NHTSA NCAP full-frontal crash speed (the sign on the crash lane).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, drop, squash, wobble, shake, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { buildFactory, D, makeKitCar, makeJunkCar, makeRobotArm, makeRoomba, makeSteeringWheel, makeTire, makeAirbag, makeTugger, makeVacuum, makeEasel, makeInvoice, makeTowTruck } from '@engine/build/factory.js';

const PI = Math.PI, L = D.line, P = L.pitch, OF = D.office;
const COLORS = [0xd94b3d, 0x4fc2c9, 0xf2c14e, 0x58b368, 0xb36bff, 0xff8a3d];   // no blue: your car is the blue one

export async function build(studio, story) {
  const S = await buildFactory(studio), B = beatClock(story), scene = S.root;
  const W = (b, w, n) => B.W(b, w, n), s1 = (id) => B.T(id).t1;
  const END = story.duration;
  const fx = makeFX(scene);
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const font = (px) => `${px}px "Luckiest Guy", Arial Black`;
  const sprite = (txt, size = 0.5, color = '#fff') => {
    const t = tex(256, 256, (g) => { g.font = font(200); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 22; g.strokeStyle = '#1b1b1b'; g.strokeText(txt, 128, 140); g.fillStyle = color; g.fillText(txt, 128, 140); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(size); scene.add(sp); return sp;
  };

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    mech: W('hook', 'mechanic'), n900: W('hook', '900'), dollars: W('hook', 'dollars'), dollars2: W('end', 'dollars'), fix: W('hook', 'fix'), carH: W('hook', 'car'), soH: W('hook', 'so'), buildH: W('hook', 'build'), newH: W('hook', 'new'), garage: W('hook', 'garage'),
    congrats: W('congrats', 'congratulations'), builtC: W('congrats', 'built'), three: W('congrats', 'three'), wheels: W('congrats', 'wheels'), mower: W('congrats', 'lawnmower'), engine: W('congrats', 'engine'), horn: W('congrats', 'horn'), garyC: W('congrats', 'gary'),
    now: W('queue', 'now'), everyone: W('queue', 'everyone'), wantsL: W('queue', 'wants'), garyL: W('queue', 'gary'), builds: W('queue', 'builds'), alone: W('queue', 'alone'),
    soL: W('line', 'so'), roll: W('line', 'roll'), past: W('line', 'past'), row: W('line', 'row'), stations: W('line', 'stations'), job: W('line', 'job'), assembly: W('line', 'assembly'), fords: W('line', 'fords'), n12: W('line', '12'), hours: W('line', 'hours'), n93: W('line', '93'), minutes: W('line', 'minutes'),
    yourR: W('line', 'your'), roomba: W('line', 'roomba'), pulls: W('line', 'pulls'), rope: W('line', 'rope'), promoted: W('line', 'promoted'),
    but: W('fits', 'but'), fits: W('fits', 'fits'), garyP: W('fits', 'gary'), hammering: W('fits', 'hammering'), doorP: W('fits', 'door'), sunroof: W('fits', 'sunroof'),
    soP: W('parts', 'so'), make: W('parts', 'make'), exactly: W('parts', 'exactly'), alike: W('parts', 'alike'), inter: W('parts', 'interchangeable'), partsW: W('parts', 'parts'), n1908: W('parts', '1908'), cadillac: W('parts', 'cadillac'), mixed: W('parts', 'mixed'),
    pile: W('parts', 'pile'), rebuilt: W('parts', 'rebuilt'), three2: W('parts', 'three', 2), garyP2: W('parts', 'gary'), pile2: W('parts', 'pile', 2), hood: W('parts', 'hood'), ornament: W('parts', 'ornament'),
    called: W('robots', 'called'), garys: W('robots', 'garys'), bolt: W('robots', 'bolt'), day: W('robots', 'day'), falls: W('robots', 'falls'), asleep: W('robots', 'asleep'), up: W('robots', 'up'), soR: W('robots', 'so'), buy: W('robots', 'buy'), robot: W('robots', 'robot'), arms: W('robots', 'arms'),
    never: W('robots', 'never'), sleep: W('robots', 'sleep'), industrial: W('robots', 'industrial'), just: W('robots', 'just'), welded: W('robots', 'welded'), garyW: W('robots', 'gary'), doorW: W('robots', 'door'),
    thenE: W('ecoat', 'then'), carsE: W('ecoat', 'cars'), rusts: W('ecoat', 'rusting'), rain: W('ecoat', 'rain'), soE: W('ecoat', 'so'), dip: W('ecoat', 'dip'), body: W('ecoat', 'body'), electrified: W('ecoat', 'electrified'), seals: W('ecoat', 'seals'), crack: W('ecoat', 'crack'),
    ecoating: W('ecoat', 'ecoating'), garyE: W('ecoat', 'gary'), still: W('ecoat', 'still'), weldedE: W('ecoat', 'welded'), doorE: W('ecoat', 'door'), rustproof: W('ecoat', 'rustproof'), nowE: W('ecoat', 'now'),
    n30000: W('jit', '30000'), partsJ: W('jit', 'parts'), all: W('jit', 'all'), arrive: W('jit', 'arrive'), once: W('jit', 'once'), garyJ: W('jit', 'gary'), buried: W('jit', 'buried'), steering: W('jit', 'steering'), soJ: W('jit', 'so'), arrives: W('jit', 'arrives'), minutesJ: W('jit', 'minutes'), needed: W('jit', 'needed'),
    jitW: W('jit', 'justintime'), toyota: W('jit', 'toyota'), roombaJ: W('jit', 'roomba'), credit: W('jit', 'credit'), manager: W('jit', 'manager'),
    safe: W('crash', 'safe'), crashW: W('crash', 'crash'), wall: W('crash', 'wall'), garyX: W('crash', 'gary'), dummy: W('crash', 'dummy'), fine: W('crash', 'fine'), garyX2: W('crash', 'gary', 2), not: W('crash', 'not'),
    soX: W('crumple', 'so'), front: W('crumple', 'front'), fold: W('crumple', 'fold'), soda: W('crumple', 'soda'), can: W('crumple', 'can'), crumple: W('crumple', 'crumple'), zone: W('crumple', 'zone'), garyX3: W('crumple', 'gary'), walks: W('crumple', 'walks'), away: W('crumple', 'away'), fine2: W('crumple', 'fine'), airbag: W('crumple', 'airbag'), off: W('crumple', 'off'),
    thenQ: W('qc', 'then'), carQ: W('qc', 'car'), ships: W('qc', 'ships'), garyQ: W('qc', 'gary'), inside: W('qc', 'inside'), soQ: W('qc', 'so'), check: W('qc', 'check'), endQ: W('qc', 'end'), quality: W('qc', 'quality'), control: W('qc', 'control'),
    car2Q: W('qc', 'car', 2), inspector: W('qc', 'inspector'), rejects: W('qc', 'rejects'), garyQ2: W('qc', 'gary', 2), twice: W('qc', 'twice'),
    add: W('finish', 'add'), vending: W('finish', 'vending'), meatloaf: W('finish', 'meatloaf'), test: W('finish', 'test'), track: W('finish', 'track'), roofF: W('finish', 'roof'), parking: W('finish', 'parking'), lot: W('finish', 'lot'), town: W('finish', 'town'),
    end: W('end', 'congratulations'), factory: W('end', 'factory'), didnt: W('end', 'didnt'), pay: W('end', 'pay'), n900E: W('end', '900'), spent: W('end', 'spent'), n76: W('end', '76'), billion: W('end', 'billion'),
    makeE: W('end', 'make'), n53: W('end', '53'), seconds: W('end', 'seconds'), garyEnd: W('end', 'gary'), works: W('end', 'works'), roombaE: W('end', 'roomba'), still2: W('end', 'still'), shop: W('end', 'shop'), mechanicE: W('end', 'mechanic'), n1400: W('end', '1400'), nowEnd: W('end', 'now'),
  };

  // ---------------------------------------------------------------- the line: every car rides the same conveyor offset s(t)
  // segments [t0, t1, s0, s1] (eased); between them the line is stopped. Slot k sits at x = L.x0 + s − k·P.
  const HOLD = D.cadillac[2] - L.x0;                  // the parts beat: cars at 23.4 (k0), 18.8 (k1, Gary's), 14.2 (k2) …
  const SEG = [
    [t.roll, t.promoted + 0.4, 0, HOLD],                                   // the line runs (Ford's line)
    [t.garys - 0.05, t.garys + 0.95, HOLD, HOLD + P],                      // k1 (hood ornament) → the robot station 23.4
    [t.bolt + 0.05, t.day + 0.35, HOLD + P, HOLD + 2 * P],                 // "all day": one more car rushes in (k2 = the hero car)
    [t.doorW + 0.1, t.soE + 0.1, HOLD + 2 * P, HOLD + 2 * P + (29.75 - 23.4)],   // the hero car (Gary welded on) → the dip tank
    [t.rustproof + 0.4, t.thenQ - 0.3, HOLD + 2 * P + 6.35, HOLD + 4 * P + 6.35],   // slow running (JIT deliveries, the crash tests)
  ];
  { // qc: the car Gary falls into ships out of the end door; then the next car rolls into the QC gate; the line stops with a
    // gap where Gary crosses it at the end; "a car every 53 seconds" is the time-lapse
    const s5 = SEG[SEG.length - 1][3], sQ = s5 + P, xg = D.qc.x;
    SEG.push([t.carQ - 0.3, t.inside + 0.4, s5, sQ]);
    let best = 0; for (let k = 0; k < 60; k++) { const x = L.x0 + sQ - k * P; if (x < xg && x > best) best = x; }
    const s7 = sQ + (xg - best); SEG.push([t.check - 0.1, t.endQ + 0.3, sQ, s7]);
    SEG.push([t.n53 - 0.8, END + 1, s7, s7 + 40]);
    SEG.qcEnd = s7;
  }
  const lineS = (tt) => { let s = 0; for (const [a, b, s0, s1_] of SEG) { if (tt <= a) return s; s = s1_; if (tt < b) { const u = (tt - a) / (b - a); return lerp(s0, s1_, a === SEG[SEG.length - 1][0] ? u * u * 0.4 + u * 0.6 : smooth(u)); } } return s; };
  const slotX = (k, tt) => L.x0 + lineS(tt) - k * P;
  const towX = (tt2) => 5.6 + Math.max(0, tt2 - (t.carH + 0.1)) ** 2 * 3.0;   // the tow truck pulls away on "car"
  const HERO = 2;                                     // the car Gary is welded to
  const SUN = D.cadillac[2];                          // Gary's sunroof car = the lead car k0 (it is also one of the Cadillac three)
  const KSHIP = (() => { let b = 0, d = 1e9; for (let k = 0; k < 60; k++) { const x = L.x0 + lineS(t.ships - 0.05) - k * P; if (Math.abs(x - 47.4) < d) { d = Math.abs(x - 47.4); b = k; } } return b; })();
  let SHIPOUT = [D.road, 0.25, -6];
  const GAPX = (() => { let b = 0, d = 1e9; for (let k = 0; k < 60; k++) { const c = L.x0 + SEG.qcEnd - k * P - P / 2; if (Math.abs(c - 41.6) < d) { d = Math.abs(c - 41.6); b = c; } } return b; })();   // a gap between two stopped cars near the stairs
  const NPOOL = 14, lineCars = Array.from({ length: NPOOL }, (_, i) => { const c = makeKitCar(COLORS[i % COLORS.length]); scene.add(c.g); return c; });
  const carColor = (k) => COLORS[(k * 5 + 1) % COLORS.length];
  // the three Cadillac-test cars (k2, k1, k0 at 14.2 / 18.8 / 23.4): their parts fly into one pile in front of k1 and back
  const PILE = new THREE.Vector3(D.st.gary, 0.35, -1.25);
  const pileParts = [];   // {k, obj, rest:{p, r}, pile:{p, r}, d}
  const PR = (() => { let s = 99; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const mech = makeToon({ shirt: 0x2f6fd6, pants: 0x2f6fd6, hair: 0x2f2f2f, hairStyle: 'side', mustache: true, skin: 0xe0a882 }); scene.add(mech.root);   // no cap (its brim read as a blindfold)
  const looks = [[0xd9534f, 0x2f3542, 0x3b2a20, 'side', 0xf0c8a0, 'cap', 0xf2c14e], [0xf2c14e, 0x4a5568, 0x111111, 'messy', 0xc68a5e, null], [0x8a5bd9, 0x2d3436, 0x7a4a2a, 'tuft', 0xf2c29a, 'hardhat'], [0x58b368, 0x3d3d3d, 0xd8b26a, 'side', 0xe9b48f, 'cap', 0x2f6fd6], [0xffffff, 0x4a5568, 0x6b3f22, 'side', 0x8d5a3b, null]];
  const crew = looks.map(([shirt, pants, hair, hs, skin, hat, hatColor]) => { const c = makeToon({ shirt, pants, hair, hairStyle: hs, skin, hat, hatColor }); scene.add(c.root); return c; });
  const [wA, wB, wC, wD, insp] = crew;                 // the neighbours in the queue → the line crew; the white shirt = the QC inspector
  const roomba = makeRoomba(); scene.add(roomba.g); const RS = 1.7;   // its gags need it big
  const dizzy = makeDizzy(scene);
  const junk = makeJunkCar(); scene.add(junk.g); const JX = -4.3, JZ = -1.3;
  const tow = await makeTowTruck(); scene.add(tow.g);
  const myCar = makeKitCar(0x3d7bd9); scene.add(myCar.g);   // your old car (towed in the hook, on the lift at the end)
  const crash1 = makeKitCar(0xd94b3d), crash2 = makeKitCar(0x2f6fd6); scene.add(crash1.g, crash2.g);
  const racer = makeKitCar(0xffd23f); scene.add(racer.g); racer.set({ stage: 4, color: 0xffd23f });   // laps the roof test track
  const CR = [25.3, -1.15];   // robot #2 comes in a crate Gary opens himself (front side of the line, at his right)
  const robots = [[21.4, -4.6], CR].map(([x, z]) => { const r = makeRobotArm(); r.g.scale.setScalar(1.12); r.g.position.set(x, 0, z); scene.add(r.g); return r; });
  const airbag = makeAirbag(); scene.add(airbag.g);
  const crate = new THREE.Group(); scene.add(crate); crate.position.set(CR[0], 0, CR[1]);
  const crateT = tex(128, 128, (g, w, h) => { g.fillStyle = '#c49158'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5233'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.beginPath(); g.moveTo(4, 4); g.lineTo(w - 4, h - 4); g.stroke(); g.fillStyle = '#3a2412'; g.font = font(22); g.textAlign = 'center'; g.fillText('ROBOT', w / 2, h / 2 + 34); });
  const crateM = new THREE.MeshStandardMaterial({ map: crateT, roughness: 0.85 });
  const cPanels = [[0, 0.75, 0.66, 0, 0], [0, 0.75, -0.66, 0, 0], [0.66, 0.75, 0, 0, PI / 2], [-0.66, 0.75, 0, 0, PI / 2], [0, 1.5, 0, PI / 2, 0]].map(([x, y, z, rx, ry]) => { const p2 = new THREE.Group(); crate.add(p2); p2.position.set(x, y, z); p2.rotation.set(rx, ry, 0); mk(new THREE.BoxGeometry(1.34, rx ? 1.34 : 1.5, 0.05), crateM, p2); p2.userData.rest = [x, y, z, rx, ry]; return p2; });
  const tug = makeTugger(); scene.add(tug.g);
  const vac = makeVacuum(); scene.add(vac);
  const easel = makeEasel('MY IDEA'); scene.add(easel);
  const invoice = makeInvoice('$900'); scene.add(invoice);
  const invoice2 = makeInvoice('$1,400'); scene.add(invoice2);
  // Gary's hand props
  const hammer = new THREE.Group(); mk(new THREE.CylinderGeometry(0.02, 0.022, 0.34, 8), mat(0xb98a55, 0.7), hammer, 0, 0.12, 0); mk(new THREE.BoxGeometry(0.16, 0.06, 0.06), mat(0x555a60, 0.4), hammer, 0, 0.3, 0); hammer.rotation.x = 1.4; hammer.position.set(0, -0.02, 0.06); gary.hand(1).add(hammer);
  const wrench = new THREE.Group(); mk(new THREE.BoxGeometry(0.04, 0.32, 0.02), mat(0x9aa3ad, 0.35), wrench, 0, 0.12, 0); mk(new THREE.TorusGeometry(0.04, 0.015, 6, 12, PI * 1.6), mat(0x9aa3ad, 0.35), wrench, 0, 0.3, 0); wrench.rotation.x = 1.4; wrench.position.set(0, -0.02, 0.06); gary.hand(1).add(wrench);
  const thumb = mk(new THREE.SphereGeometry(0.07, 12, 10), mat(0xe0483a, 0.5), gary.hand(-1), 0, 0.02, 0.08);   // the thumb he hammers on "alone"
  const handWheel = makeSteeringWheel(); handWheel.scale.setScalar(0.9); handWheel.position.set(0, 0, 0.1); gary.hand(-1).add(handWheel);
  const sprayGun = new THREE.Group(); mk(new THREE.BoxGeometry(0.06, 0.16, 0.05), mat(0x2f6fd6, 0.4), sprayGun, 0, 0.05, 0); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), mat(0x999999), sprayGun, 0, 0.12, 0.08).rotation.x = PI / 2; sprayGun.position.set(0, -0.03, 0.06); wC.hand(1).add(sprayGun);
  const cash = crew.map((c) => { const b = mk(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x7fd06b, side: THREE.DoubleSide, roughness: 0.6 }), c.hand(1), 0, -0.02, 0.1); b.rotation.x = 0.5; return b; });
  const clip = new THREE.Group(); mk(new THREE.BoxGeometry(0.2, 0.28, 0.02), mat(0xa77b4f, 0.7), clip); mk(new THREE.BoxGeometry(0.17, 0.22, 0.01), mat(0xffffff, 0.8), clip, 0, -0.01, 0.012); clip.position.set(0, -0.05, 0.08); clip.rotation.x = -0.6; insp.hand(-1).add(clip);
  const stampT = new THREE.Group(); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), mat(0x3a2412, 0.6), stampT, 0, 0.08, 0); mk(new THREE.BoxGeometry(0.12, 0.04, 0.08), mat(0xd12f3a, 0.5), stampT, 0, 0, 0); stampT.position.set(0, -0.06, 0.08); insp.hand(1).add(stampT);
  // decals on Gary: crash-dummy targets on the temples, the REJECTED stamp on his forehead
  const targetT = tex(64, 64, (g, w) => { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#111' : '#ffd23f'; g.beginPath(); g.moveTo(w / 2, w / 2); g.arc(w / 2, w / 2, w / 2, (k * PI) / 2, ((k + 1) * PI) / 2); g.fill(); } });
  const targets = [-1, 1].map((s) => { const d = mk(new THREE.CircleGeometry(0.075, 20), new THREE.MeshBasicMaterial({ map: targetT, transparent: true }), gary.head, s * 0.285, 0.1, 0.06); d.rotation.y = s * PI / 2; d.castShadow = false; return d; });
  const rejT = tex(256, 96, (g, w, h) => { g.strokeStyle = '#d12f3a'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#d12f3a'; g.font = font(64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('REJECTED', w / 2, h / 2 + 4); });
  const rejDecal2 = mk(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshBasicMaterial({ map: rejT, transparent: true, depthWrite: false, side: THREE.DoubleSide }), gary.hat, 0, 0.16, 0.25); rejDecal2.rotation.set(-0.5, 0, 0.15); rejDecal2.castShadow = false;   // the second stamp lands on his hard hat
  const rejDecal = mk(new THREE.PlaneGeometry(0.34, 0.13), new THREE.MeshBasicMaterial({ map: rejT, transparent: true, depthWrite: false }), gary.head, 0, 0.16, 0.282); rejDecal.rotation.set(-0.3, 0, -0.12); rejDecal.castShadow = false;
  const sparkle = sprite('✦', 0.6, '#fff8c8'); sparkle.material.blending = THREE.AdditiveBlending;
  const qMark = sprite('?', 0.5, '#ffd43b');
  // the door that doesn't fit (Gary hammers it into the cockpit) + the press's three identical doors
  const looseDoor = new THREE.Group(); scene.add(looseDoor); mk(new RoundedBoxGeometry(1.14, 0.46, 0.1, 2, 0.04), mat(0x2f8fd0, 0.4), looseDoor, 0, 0, 0); mk(new THREE.PlaneGeometry(0.5, 0.2), mat(0xbfe6ff, 0.1), looseDoor, -0.15, 0.08, 0.052); mk(new THREE.BoxGeometry(0.16, 0.035, 0.04), mat(0xd5d9de, 0.3), looseDoor, 0.3, -0.05, 0.06);
  const pressDoors = [0, 1, 2].map(() => { const d = new THREE.Group(); scene.add(d); mk(new RoundedBoxGeometry(1.14, 0.46, 0.1, 2, 0.04), new THREE.MeshStandardMaterial({ color: 0xa9b0b7, roughness: 0.4, metalness: 0.55 }), d); return d; });
  const stool = new THREE.Group(); scene.add(stool); mk(new THREE.BoxGeometry(0.5, 0.05, 0.4), mat(0xd12f3a, 0.5), stool, 0, 0.55, 0); for (const [x, z] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) mk(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), mat(0x555555), stool, x, 0.27, z);
  // the rope the Roomba pulls (Ford's 1913 line was a chassis pulled by a rope + windlass)
  const rope = mk(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), mat(0xc9a06b, 0.8), scene, 0, 0, 0);
  // JIT: the parts avalanche (instanced steering wheels + tires) + the tugger's two deliveries
  const wheelGeo = mergeGeometries([new THREE.TorusGeometry(0.17, 0.035, 6, 18), ...[0, 1, 2].map((k) => new THREE.BoxGeometry(0.17, 0.035, 0.025).translate(0.085, 0, 0).rotateZ((k * 2 * PI) / 3 - PI / 2)), new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10).rotateX(PI / 2)]);
  const NW = 420, NT = 120, heapW = new THREE.InstancedMesh(wheelGeo, new THREE.MeshStandardMaterial({ roughness: 0.5 }), NW), heapT = new THREE.InstancedMesh(new THREE.TorusGeometry(0.24, 0.1, 8, 16), mat(0x1c1c1e, 0.8), NT);
  heapW.castShadow = heapT.castShadow = true; heapW.frustumCulled = heapT.frustumCulled = false; scene.add(heapW, heapT);
  const HEAP = { x: D.jit, z: -2.1, R: 3.1, Hh: 3.2 }, GBUR = [D.jit - 0.4, -1.25], TUG0 = [D.jit - 0.35, -1.25], TUG1 = [D.jit + 2.6, -1.25];
  const heapPts = (n, seed) => { let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; return Array.from({ length: n }, () => { const a = r() * PI * 2, d = Math.sqrt(r()) * HEAP.R, x = HEAP.x + Math.cos(a) * d * 1.15, z = clamp(HEAP.z + Math.sin(a) * d * 0.9, -5.6, -0.25), h = HEAP.Hh * (1 - (d / HEAP.R) ** 2) * (0.35 + 0.65 * r()); return { to: [x, Math.max(0.08, h), z], from: [D.dock.x0 + 0.3 + r() * (D.dock.x1 - D.dock.x0 - 0.6), 0.25 + r() * 3.2, D.hall.back + 0.12 + r() * 0.25], dl: r() * 0.55, rot: [r() * 6, r() * 6, r() * 6] }; }); };
  const HW = heapPts(NW, 7), HT = heapPts(NT, 19);
  { const wc = [0xc49158, 0x2a2d31, 0xd12f3a, 0x9aa3ad, 0x2a2d31]; for (let i = 0; i < NW; i++) heapW.setColorAt(i, new THREE.Color(wc[i % wc.length])); heapW.instanceColor.needsUpdate = true; HT.forEach((p) => (p.to[1] = Math.min(p.to[1], 0.9))); }   // tan / red / steel rims; tyres stay low in the heap
  const jitWheel = makeSteeringWheel(), jitTire = makeTire(); tug.trailers[0].add(jitWheel); jitWheel.position.set(0, 0.5, 0); jitWheel.rotation.x = PI / 2; tug.trailers[1].add(jitTire); jitTire.position.set(0, 0.5, 0); jitTire.rotation.x = PI / 2;
  const glowLight = new THREE.PointLight(0x9ad6ff, 0, 5, 1.6); scene.add(glowLight);
  const tallyC = document.createElement('canvas'); tallyC.width = 256; tallyC.height = 110; const tallyT = new THREE.CanvasTexture(tallyC); tallyT.colorSpace = THREE.SRGBColorSpace; let tallyN = -1;
  const tally = mk(new THREE.PlaneGeometry(1.3, 0.56), new THREE.MeshBasicMaterial({ map: tallyT, toneMapped: false }), scene, D.robot - 1.2, 2.5, -4.8); tally.castShadow = false;   // BOLTS TODAY over Gary's station
  const setTally = (n) => { if (n === tallyN) return; tallyN = n; const g = tallyC.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, 256, 110); g.fillStyle = '#ffd23f'; g.font = font(30); g.textAlign = 'center'; g.fillText('BOLTS TODAY', 128, 34); g.fillStyle = '#7cf05f'; g.font = font(58); g.fillText(n.toLocaleString('en-US'), 128, 94); tallyT.needsUpdate = true; };
  const scanner = mk(new THREE.PlaneGeometry(0.08, 2.0), new THREE.MeshBasicMaterial({ color: 0x7cf05f, transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }), scene, 0, 0, 0); scanner.rotation.x = -PI / 2; scanner.castShadow = false;   // QC: a light sweeping over the car at the gate
  const spider = new THREE.Group(); scene.add(spider); mk(new THREE.SphereGeometry(0.05, 10, 8), mat(0x111111, 0.6), spider); const thread = mk(new THREE.CylinderGeometry(0.003, 0.003, 1, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), spider, 0, 0.5, 0);
  const cloud = new THREE.Group(); scene.add(cloud);   // a cartoon storm cloud indoors, over the line (soft puffs)
  { const cm = new THREE.MeshStandardMaterial({ color: 0x8b939c, roughness: 1 }); [[0, 0, 0, 1.0], [-1.1, -0.15, 0.1, 0.8], [1.1, -0.1, -0.1, 0.85], [-0.5, 0.45, 0, 0.75], [0.6, 0.4, 0.1, 0.7], [-1.9, -0.3, 0, 0.55], [1.9, -0.25, 0, 0.6]].forEach(([x, y, z, r]) => mk(new THREE.SphereGeometry(r, 18, 14), cm, cloud, x, y, z).castShadow = false); }
  const meat = mk(new RoundedBoxGeometry(0.22, 0.12, 0.14, 2, 0.04), mat(0x8a4a24, 0.8), scene, 0, 0, 0);   // the meatloaf drops into the tray
  const shoe = mk(new RoundedBoxGeometry(0.16, 0.1, 0.3, 2, 0.04), mat(0xd12f3a, 0.6), scene, 0, 0, 0);   // Gary's shoe, left in the Cadillac pile
  const cushion = mk(new RoundedBoxGeometry(1.05, 0.24, 1.05, 3, 0.08), mat(0xd12f3a, 0.7), S.office.desk, 0.2, 0.88, 0.1);   // the CEO sits up on a cushion (else the desk hides it)

  // ---------------------------------------------------------------- derived times
  const PILE_IN = t.mixed, PILE_AT = t.pile - 0.05, PILE_OUT = t.rebuilt - 0.05, PILE_BACK = t.three2 + 0.1;   // into the pile … back into three cars
  const ORN = t.hood - 0.25;                                       // Gary springs onto the hood
  const WELD = t.welded;
  const PIT0 = t.dip - 0.15, PIT1 = t.dip + 0.45, LIFT0 = t.dip + 0.2, DIP0 = t.body + 0.05, DIP1 = t.electrified + 0.2, OUT0 = t.garyE - 0.05, OUT1 = t.doorE - 0.05, SET1 = t.rustproof - 0.15;   // the e-coat dip
  const UNWELD = t.rustproof + 0.35;
  const AVA0 = t.all ?? W('jit', 'all'), AVA1 = AVA0 + 0.75, DRAIN0 = t.soJ + 0.05, DRAIN1 = t.needed - 0.2;   // the avalanche + the drain
  const C = D.crash, CAR_X0 = C.x0 + 0.9, HIT_X = C.wall - 1.66;  // crash car centre at the start / when its bumper hits the wall
  const L1 = t.crashW, HIT1 = t.wall, L2 = Math.max(t.can + 0.7, t.crumple - 0.5), HIT2 = Math.max(t.crumple + 0.05, L2 + 0.35), BAG = t.off - 0.08;
  const LANDQ = t.ships + 0.25, HOPQ = t.soQ - 0.1, GQ = [D.qc.x + 0.5, D.qc.z], STAMP = t.rejects, STAMP2 = t.twice;   // Gary falls into a shipping car, hops out on the road, is stamped at the QC gate
  // the crash cars' x: launched (x ∝ t²), stopped by the wall; car 1 bounces back off it (rigid), car 2 crumples (decelerates)
  const crashX = (tt, t0, t1, crum) => { if (tt < t0) return CAR_X0; if (tt < t1) { const u = (tt - t0) / (t1 - t0); return lerp(CAR_X0, HIT_X, u * u); } const a = tt - t1; return crum ? HIT_X + 0.78 * smooth(clamp(a / 0.45)) : HIT_X - 0.35 * Math.sin(Math.min(1, a / 0.35) * PI / 2) * Math.exp(-a * 1.5); };   // the crumple run keeps going while the nose folds

  // ---------------------------------------------------------------- effects (scheduled from the narration)
  fx.stream('smoke', 0.2, t.soH + 0.4, { pos: [2.4, 1.6, -3.0], box: [0.4, 0.1, 0.4], rate: 6, color: 0xd8d0c4, alpha: 0.4, dir: [0, 1, 0], spread: 0.4, speed: [0.3, 0.7], size: [0.25, 0.45], seed: 1 });   // your car smokes on the hook
  fx.burst('dust', t.newH + 0.1, { pos: [JX, 0.2, JZ], box: [2, 0.2, 0.6], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 2 });
  fx.burst('confetti', t.congrats, { pos: [JX, 0.6, JZ + 0.2], n: 240, dir: [0, 1, 0.2], spread: 0.6, speed: [4, 7], seed: 3 });
  fx.stream('smoke', t.engine - 0.1, t.horn, { pos: [JX - 0.95, 1.45, JZ - 0.1], rate: 10, dir: [-0.3, 1, 0], spread: 0.4, speed: [0.4, 0.9], size: [0.15, 0.3], seed: 4 });
  for (let k = 0; k < 5; k++) fx.burst('drops', t.builds + k * 0.18, { pos: [-4.4 + (k % 2 ? 0.2 : -0.2), 1.55, -2.2], n: 3, dir: [k % 2 ? 1 : -1, 0.8, 0.3], spread: 0.4, speed: [0.8, 1.4], size: [0.03, 0.05], seed: 5 + k });   // sweat
  for (let i = 0; i < 8; i++) fx.burst('dust', t.roll - 0.25 + i * 0.12, { pos: [D.hall.x0 + 3 + i * 6.2, 0.2, -4.6], box: [5, 0.3, 6], n: 5, speed: [0.5, 1.4], spread: 1.3, size: [0.6, 1.1], seed: 20 + i });   // the hall slams up bay by bay
  fx.burst('dust', t.rope + 0.1, { pos: [slotX(0, t.rope) + 2.6, 0.2, L.z], n: 4, speed: [0.3, 0.7], spread: 1.2, size: [0.15, 0.3], seed: 30 });
  fx.burst('spark', t.fits, { pos: [SUN, 0.7, -2.4], n: 16, speed: [1, 2], spread: 1.2, color: 0xffffff, seed: 31 });
  for (let k = 0; k < 4; k++) fx.burst('spark', t.hammering + 0.1 + k * 0.3, { pos: [SUN - 0.1, 1.15, -3.2], n: 10, speed: [1, 2.5], spread: 1.1, seed: 32 + k });
  for (let k = 0; k < 3; k++) { const tk = t.make + k * 0.42; fx.burst('dust', tk + 0.08, { pos: [D.press, 1.0, -6.6], box: [1.6, 0.2, 0.5], n: 4, speed: [0.4, 0.9], spread: 1.3, size: [0.25, 0.45], seed: 40 + k }); }
  fx.burst('dust', PILE_AT, { pos: [PILE.x, 0.4, PILE.z], box: [2.2, 0.4, 0.8], n: 12, speed: [0.5, 1.4], spread: 1.3, size: [0.35, 0.7], seed: 44 });
  fx.burst('dust', PILE_BACK, { pos: [PILE.x, 0.3, -3.2], box: [11, 0.3, 1.0], n: 12, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.6], seed: 45 });
  fx.burst('confetti', ORN + 0.3, { pos: [D.st.gary + 1.6, 1.6, L.z + 0.4], n: 60, dir: [0, 1, 0.4], spread: 0.6, speed: [2, 3.5], color: 0xffd23f, size: [0.03, 0.05], seed: 46 });
  for (const [i, r] of robots.entries()) fx.burst('dust', t.robot - 0.1 + i * 0.35 + 0.42, { pos: [r.g.position.x, 0.2, r.g.position.z], n: 8, speed: [0.5, 1.3], spread: 1.3, size: [0.4, 0.8], seed: 50 + i });
  fx.burst('dust', t.buy + 0.05, { pos: [CR[0], 0.2, CR[1]], n: 8, speed: [0.5, 1.3], spread: 1.3, size: [0.3, 0.6], seed: 123 });
  fx.burst('crumb', t.arms, { pos: [CR[0], 0.9, CR[1]], box: [1.2, 1.2, 1.2], n: 50, dir: [0, 1, 0.3], spread: 1.2, speed: [2, 4], color: 0xc49158, floor: 0.03, seed: 124 });
  fx.burst('spark', WELD, { pos: [D.robot, 0.95, -2.25], n: 120, dir: [0, 1, 0.5], spread: 1.3, speed: [1.5, 4], seed: 55 });
  fx.burst('smoke', WELD + 0.3, { pos: [D.robot, 1.0, -2.0], n: 5, speed: [0.3, 0.6], spread: 0.6, size: [0.2, 0.35], seed: 56 });
  fx.stream('drops', t.carsE - 0.1, t.dip + 0.4, { pos: [27.2, 3.5, L.z + 0.1], box: [4.6, 0.1, 1.6], dir: [0, -1, 0], spread: 0.06, speed: [3, 4.5], rate: 160, floor: 0.06, size: [0.025, 0.05], seed: 60 });   // rain from the indoor cloud
  fx.burst('drops', t.rusts + 0.1, { pos: [S.crack.position.x, 1.0, -3.0], box: [3, 0.2, 1.4], n: 30, dir: [0, 1, 0.2], spread: 0.8, speed: [0.5, 1.4], size: [0.03, 0.05], seed: 61 });
  fx.burst('dust', t.rusts + 0.2, { pos: [slotX(1, t.rusts) + 0.2, 0.25, -2.4], n: 6, speed: [0.3, 0.8], spread: 1.3, size: [0.2, 0.4], seed: 62 });   // a rusty door drops off
  fx.burst('dust', PIT0 + 0.1, { pos: [29.75, 0.2, -1.2], box: [4.6, 0.3, 2.4], n: 12, speed: [0.5, 1.4], spread: 1.3, size: [0.4, 0.8], seed: 63 });
  fx.burst('rock', PIT0 + 0.05, { pos: [29.75, -0.6, -0.4], box: [4.4, 1.2, 0.6], n: 40, dir: [0, 0.4, 1], spread: 1.1, speed: [1, 3], floor: D.tank.y0, life: [0.5, 0.8], seed: 64 });
  fx.burst('drops', DIP0 + 0.3, { pos: [29.75, D.tank.level + 0.05, D.tank.dipZ], box: [3.6, 0.1, 1.6], n: 80, dir: [0, 1, 0.3], spread: 0.8, speed: [1.5, 3.5], color: 0x6f8aa0, seed: 65 });
  fx.stream('spark', t.electrified - 0.05, t.crack + 0.3, { pos: [29.75, D.tank.level + 0.06, -1.3], box: [4.0, 0.02, 2.0], rate: 60, dir: [0, 1, 0], spread: 1.4, speed: [0.4, 1.2], color: 0x9fe8ff, seed: 66 });
  fx.stream('drops', t.seals - 0.2, OUT0, { pos: [29.75, D.tank.y0 + 0.6, -1.0], box: [2.4, 0.6, 0.8], rate: 26, dir: [0, 1, 0], spread: 0.3, speed: [0.5, 0.9], g: -2.5, size: [0.03, 0.06], color: 0xbfe6ff, seed: 67 });   // bubbles
  fx.stream('drops', OUT0 + 0.2, SET1 + 0.3, { pos: [29.75, 0.6, D.tank.dipZ], box: [3.0, 0.1, 1.4], rate: 70, dir: [0, -1, 0], spread: 0.15, speed: [0.3, 0.8], floor: D.tank.level, size: [0.03, 0.05], color: 0x6f8aa0, seed: 68 });   // drips off the body
  fx.burst('drops', t.rustproof - 0.05, { pos: [29.75 - 0.15, 1.5, -2.1], n: 8, dir: [0, 1, 0.5], spread: 0.6, speed: [0.8, 1.4], size: [0.03, 0.05], seed: 69 });   // a raindrop pings off him
  fx.burst('dust', AVA0 + 0.2, { pos: [HEAP.x, 0.4, -2.5], box: [6, 0.5, 4], n: 16, speed: [0.5, 1.5], spread: 1.3, size: [0.6, 1.2], seed: 70 });
  fx.burst('dust', DRAIN0 + 0.3, { pos: [HEAP.x, 0.3, -2.5], box: [6, 0.3, 4], n: 10, speed: [0.4, 1.0], spread: 1.3, size: [0.4, 0.8], seed: 71 });
  fx.burst('dust', HIT1, { pos: [C.wall - 0.1, 0.6, C.z], box: [0.3, 0.8, 1.4], n: 12, speed: [1, 2.5], dir: [-1, 0.5, 0.3], spread: 1.1, size: [0.3, 0.6], seed: 72 });
  fx.burst('spark', HIT1, { pos: [C.wall - 0.1, 0.6, C.z], n: 60, dir: [-1, 0.6, 0.3], spread: 1.2, speed: [2, 5], seed: 73 });
  fx.burst('dust', HIT2, { pos: [C.wall - 0.1, 0.6, C.z], box: [0.3, 0.8, 1.4], n: 14, speed: [1, 2.5], dir: [-1, 0.5, 0.3], spread: 1.1, size: [0.3, 0.6], seed: 74 });
  fx.burst('crumb', HIT2, { pos: [C.wall - 0.4, 0.7, C.z], n: 40, dir: [-0.5, 1, 0.4], spread: 1.0, speed: [1.5, 3.5], color: 0x2f6fd6, size: [0.03, 0.07], floor: 0.02, seed: 75 });
  fx.burst('dust', t.dummy - 0.35, { pos: [C.wall - 0.3, 0.2, C.z], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 76 });
  fx.burst('glow', BAG, { pos: [HIT_X - 0.1, 1.0, C.z + 0.3], n: 2, speed: [0, 0.01], size: [0.7, 1.0], seed: 77 });
  fx.burst('dust', LANDQ, { pos: [47.4, 0.8, L.z], n: 9, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 78 });
  fx.burst('bill', t.everyone, { pos: [1.8, 1.7, -3.0], box: [3, 0.3, 2], n: 24, dir: [0, 1, 0.3], spread: 0.8, speed: [1.5, 3], life: [1.8, 2.4], seed: 83 });   // the queue waves cash
  fx.burst('spark', t.roll - 0.05, { pos: [-2.25, 1.3, -1.8], n: 30, speed: [1, 2.5], spread: 1.3, seed: 84 });   // the start lever
  fx.burst('dust', t.roll + 0.3, { pos: [-1.0, 0.2, L.z], box: [1.5, 0.3, 1.6], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 85 });
  fx.burst('confetti', t.promoted, { pos: [slotX(0, t.promoted) + 2.75, 0.5, L.z + 0.3], n: 50, dir: [0, 1, 0.3], spread: 0.6, speed: [2, 3.5], size: [0.03, 0.05], seed: 86 });
  fx.burst('dust', t.fits + 0.05, { pos: [SUN + 0.2, 0.4, -2.2], n: 6, speed: [0.4, 1.0], spread: 1.3, size: [0.2, 0.4], seed: 87 });
  for (let k = 0; k < 3; k++) fx.burst('spark', t.make + k * 0.42 + 0.12, { pos: [D.press, 0.95, -6.4], box: [1.4, 0.05, 0.4], n: 26, dir: [0, 0.6, 1], spread: 1.1, speed: [1.5, 3.5], seed: 88 + k });
  fx.burst('spark', t.inter + 0.35, { pos: [SUN - 0.06, 0.7, L.z + 0.75], n: 24, speed: [1, 2.5], spread: 1.2, seed: 91 });
  fx.burst('crumb', PILE_IN + 0.1, { pos: [D.st.gary, 0.9, L.z], box: [12, 0.5, 1.2], n: 60, dir: [0, 1, 0.6], spread: 0.9, speed: [2, 4], color: 0x9aa3ad, floor: 0.05, seed: 92 });
  fx.burst('spark', PILE_AT, { pos: [PILE.x, 0.9, PILE.z], n: 50, speed: [1.5, 3.5], spread: 1.3, seed: 93 });
  fx.burst('confetti', PILE_BACK + 0.05, { pos: [D.st.gary, 1.4, L.z + 0.4], box: [10, 0.3, 0.5], n: 120, dir: [0, 1, 0.3], spread: 0.7, speed: [2, 4], seed: 94 });
  fx.burst('dust', t.pile2 + 0.2, { pos: [PILE.x + 0.8, 0.15, PILE.z + 0.15], n: 4, speed: [0.3, 0.7], spread: 1.2, size: [0.12, 0.25], seed: 95 });   // the Roomba slurps the shoe
  fx.burst('glow', t.garys + 0.9, { pos: [slotX(1, t.garys + 0.9) + 1.25, L.y + 1.5, L.z], n: 2, speed: [0, 0.01], size: [0.7, 1.0], seed: 122 });
  fx.burst('glow', ORN + 0.3, { pos: [slotX(1, ORN) + 1.25, L.y + 1.6, L.z], n: 2, speed: [0, 0.01], size: [0.6, 0.9], seed: 96 });
  for (const [i, x] of [21.4, 25.0].entries()) fx.stream('spark', t.never - 0.1, WELD - 0.5, { pos: [23.4 + (i ? 1.2 : -1.2), 1.05, L.z + 0.2], box: [0.9, 0.2, 0.6], rate: 40, dir: [0, 1, 0.2], spread: 1.3, speed: [0.8, 2.2], seed: 97 + i });   // the robots weld
  fx.burst('drops', t.asleep, { pos: [D.robot - 0.1, 1.5, -2.0], n: 3, dir: [0, 1, 0.3], spread: 0.3, speed: [0.4, 0.8], size: [0.03, 0.05], seed: 99 });   // drool
  fx.stream('mist', t.rain - 0.2, t.dip + 0.3, { pos: [27.2, 1.15, L.z + 0.1], box: [4.6, 0.1, 1.6], rate: 14, speed: [0.2, 0.6], spread: 1.3, size: [0.25, 0.45], seed: 100 });   // spray off the car roofs
  fx.burst('dust', t.rusts + 0.5, { pos: [27.2, 0.3, -2.3], box: [4, 0.2, 0.6], n: 8, speed: [0.3, 0.8], spread: 1.3, size: [0.25, 0.45], color: 0xb0683a, seed: 101 });   // rust flakes
  fx.burst('dust', t.n30000 + 0.4, { pos: [(D.dock.x0 + D.dock.x1) / 2, 2.0, D.hall.back + 0.4], box: [4, 3, 0.3], n: 8, speed: [0.3, 0.8], spread: 1.3, size: [0.4, 0.7], seed: 102 });
  fx.burst('crumb', AVA0 + 0.25, { pos: [HEAP.x, 1.2, HEAP.z], box: [5, 1.5, 3], n: 80, dir: [0, 1, 0.4], spread: 1.0, speed: [2, 4], color: 0x2a2d31, floor: 0.05, seed: 103 });
  fx.stream('dust', t.needed - 0.6, t.toyota + 0.2, { pos: [D.jit + 1.0, 0.1, -1.25], box: [3, 0.1, 0.4], rate: 6, speed: [0.2, 0.5], spread: 1.2, size: [0.15, 0.3], seed: 104 });   // the tugger's dust trail
  fx.burst('spark', t.needed + 0.3, { pos: [D.jit + 1.4, 0.8, L.z + 0.2], n: 20, speed: [1, 2], spread: 1.2, seed: 105 });
  fx.burst('spark', t.jitW + 0.3, { pos: [D.jit + 2.2, 0.8, L.z + 0.2], n: 20, speed: [1, 2], spread: 1.2, seed: 106 });
  fx.burst('confetti', t.manager, { pos: [D.jit + 3.9, 0.5, -0.95], n: 50, dir: [0, 1, 0.3], spread: 0.6, speed: [2, 3.5], size: [0.03, 0.05], seed: 107 });
  fx.burst('crumb', HIT1, { pos: [C.wall - 0.3, 1.0, C.z], n: 40, dir: [-1, 0.8, 0.3], spread: 1.0, speed: [2, 4], color: 0xbfe6ff, size: [0.03, 0.06], floor: 0.02, seed: 108 });   // glass
  fx.stream('smoke', HIT2 + 0.3, t.off, { pos: [C.wall - 0.5, 0.9, C.z], rate: 6, dir: [0, 1, 0], spread: 0.4, speed: [0.3, 0.6], size: [0.2, 0.35], seed: 109 });
  fx.burst('spark', t.front - 0.05, { pos: [CAR_X0 + 1.7, 0.7, C.z + 0.8], n: 24, speed: [1, 2.2], spread: 1.2, seed: 110 });   // the striped nose slapped on
  fx.burst('dust', t.fold, { pos: [CAR_X0 + 1.6, 0.5, C.z + 0.6], n: 5, speed: [0.3, 0.7], spread: 1.2, size: [0.2, 0.35], seed: 111 });
  fx.burst('dust', BAG + 0.05, { pos: [HIT_X, 0.3, C.z + 0.6], n: 10, speed: [0.5, 1.5], spread: 1.3, size: [0.3, 0.6], seed: 112 });
  fx.burst('glow', t.check, { pos: [D.qc.x, 2.4, L.z], n: 2, speed: [0, 0.01], size: [0.8, 1.1], seed: 113 });   // the QC gate lights up
  fx.burst('dust', STAMP, { pos: [GQ[0], 1.5, GQ[1] + 0.2], n: 5, speed: [0.3, 0.7], spread: 1.2, size: [0.15, 0.3], color: 0xd12f3a, seed: 114 });
  fx.burst('dust', STAMP2, { pos: [GQ[0], 1.8, GQ[1] + 0.2], n: 6, speed: [0.3, 0.8], spread: 1.2, size: [0.15, 0.3], color: 0xd12f3a, seed: 115 });
  fx.burst('dust', t.vending - 0.1, { pos: [D.vend[0], 0.3, D.vend[1] - 0.3], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.3, 0.5], seed: 116 });
  fx.burst('dust', t.meatloaf + 0.15, { pos: [D.vend[0] - 0.1, 0.35, D.vend[1]], n: 4, speed: [0.2, 0.5], spread: 1.2, size: [0.1, 0.2], seed: 117 });
  fx.stream('smoke', t.test, END, { pos: [33, D.roof.top + 0.3, -1.8], box: [22, 0.1, 0.3], rate: 4, speed: [0.2, 0.4], spread: 0.6, size: [0.2, 0.35], seed: 118 });   // tyre smoke on the roof track
  fx.stream('dust', t.parking - 0.1, t.town + 0.4, { pos: [18, 0.5, -30], box: [70, 0.5, 30], rate: 30, speed: [0.3, 0.9], spread: 1.3, size: [1.0, 1.8], seed: 119 });   // the town turns into a parking lot
  fx.stream('dust', t.n53 + 0.4, t.shop + 0.4, { pos: [S.office.desk.position.x - 1.0, OF.y + 0.1, S.office.desk.position.z + 1.1], box: [0.6, 0.1, 0.3], rate: 8, speed: [0.1, 0.3], spread: 1.2, size: [0.08, 0.16], seed: 120 });   // the vacuum
  fx.burst('dust', t.shop - 0.3, { pos: [D.shop.x0 + 3.7, 3.0, -2.9], box: [3, 0.2, 1.2], n: 8, speed: [0.2, 0.5], spread: 1.3, size: [0.2, 0.4], color: 0xddd6c8, seed: 121 });   // dust on your old car
  fx.stream('mist', t.roll + 2, END, { pos: [(D.booth.x0 + D.booth.x1) / 2, 1.2, -7.4], box: [3.0, 1.2, 1.8], rate: 10, speed: [0.2, 0.6], spread: 1.3, size: [0.3, 0.6], color: 0xff8fc1, seed: 79 });
  fx.burst('confetti', t.end, { pos: [24, 3.0, -2.5], box: [44, 1.0, 3], n: 600, dir: [0, 1, 0.2], spread: 0.7, speed: [3, 6], seed: 80 });
  fx.stream('bill', t.n76 - 0.2, t.makeE + 0.6, { pos: [32, 9.0, -2.2], box: [26, 0.4, 3.0], rate: 220, dir: [0, -1, 0], spread: 0.4, speed: [0.5, 1.5], life: [3.8, 4.8], seed: 81 });
  fx.burst('dust', t.n1400 - 0.1, { pos: [D.shop.x0 + 1.1, 2.3, D.shop.back + 0.3], n: 4, speed: [0.2, 0.5], spread: 1.3, size: [0.15, 0.3], seed: 82 });

  // a puff/spark as each car crosses a station (crossing times solved from s(t), like a cue sheet)
  const crossT = (k, x) => { for (let tt = t.roll; tt < END; tt += 0.01) if (slotX(k, tt) >= x) return tt; return null; };
  for (let k = 0; k < 24; k++) { const st = [[D.st.body, 'dust', 0xc9c5bd], [D.st.doors, 'spark', null], [D.st.paint, 'mist', 0xff8fc1]];
    for (const [x, kind, col] of st) { const tc = crossT(k, x); if (tc == null || tc > END - 0.5) continue; fx.burst(kind, tc, { pos: [x + 0.2, kind === 'spark' ? 0.7 : 0.6, L.z + 0.85], n: kind === 'spark' ? 14 : 4, speed: [0.4, 1.4], spread: 1.3, size: kind === 'spark' ? undefined : [0.25, 0.45], color: col ?? undefined, seed: 400 + k * 3 + st.findIndex((q) => q[0] === x) }); } }
  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words
  const Fr = [], F = (tt, pos, look, fov = 42, pass = false) => Fr.push({ t: tt, pos, look, fov, pass });
  const Fk = (tt, pos, look, fov = 42, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  // look points sit ~1 m below a standing toon's head (head centre = root + 1.12) so faces stay above the caption band (52 %)
  F(0, [2.3, 1.5, 7.4], [2.3, 0.75, -2.0], 42);                       // the yard: the mechanic, the invoice, your car on the tow hook
  Fk(t.dollars, [2.6, 1.4, 6.6], [2.8, 0.7, -2.2], 42);               // the truck pulls away with your car (and the mechanic on its bed)
  F(t.garage, [-4.1, 1.4, 6.8], [-4.2, 0.55, -2.0], 42);              // into the garage: the junk car pops together
  Fk(t.builtC, [-4.3, 1.3, 5.8], [-4.3, 0.5, -1.6], 42);
  Fk(t.mower, [-4.8, 1.2, 4.6], [-4.8, 0.6, -1.4], 40);               // the pull cord
  Fk(t.horn, [-3.95, 1.25, 4.2], [-3.95, 0.8, -1.4], 38, t.garyC + 0.35);   // the horn is Gary
  F(t.wantsL + 0.05, [-0.6, 1.6, 7.6], [0.2, 0.75, -2.6], 44);       // the queue at the roll-up door
  Fk(t.alone - 0.3, [-3.4, 1.8, 6.2], [-3.5, 0.3, -2.6], 42);        // Gary alone: hammer, thumb
  Fk(t.stations - 0.2, [3.0, 2.4, 15.5], [3.2, 0.4, -3.5], 46);       // the hall slams up bay by bay
  F(t.assembly, [4.0, 1.4, 9.0], [4.2, -0.05, -3.6], 42);             // one job each, the line rolling
  Fk(t.n12 - 0.3, [16.0, 3.2, 10.0], [16.4, 3.0, -4.0], 46, t.minutes - 0.75);   // Ford: the clock spins (clear of the label band)
  Fk(t.rope - 0.3, [25.9, 1.05, 4.6], [25.9, 0.35, -3.0], 38, t.promoted + 0.25);   // the Roomba pulls the rope; the hard hat pops IN frame
  F(t.fits - 0.1, [23.9, 1.7, 6.6], [23.6, 0.85, -2.8], 42);          // Gary's car: nothing fits
  Fk(t.sunroof - 0.2, [23.3, 1.9, 5.8], [23.0, 1.2, -2.8], 40);
  F(t.exactly - 0.1, [20.9, 1.9, 7.2], [21.0, 0.35, -5.0], 44);        // the stamping press (Gary on its buttons)
  F(t.inter, [22.5, 1.5, 7.4], [22.8, 0.35, -2.8], 42);               // the press door clicks onto his car
  Fk(t.mixed - 0.25, [7.0, 4.2, 3.5], [19.5, -0.5, -3.4], 46, t.three2 + 0.15);   // down the line: three cars → one pile → three cars
  Fk(t.ornament + 0.2, [19.6, 1.6, 5.8], [19.9, 1.1, -2.6], 38);      // the push lands on the hood ornament
  F(t.bolt, [23.6, 1.5, 6.8], [23.5, 0.75, -2.6], 42);                // the bolt station
  Fk(t.asleep, [23.4, 1.3, 5.2], [23.4, 0.85, -2.3], 40);
  Fk(t.arms, [24.3, 2.0, 10.6], [24.2, 0.35, -3.6], 44);              // Gary wakes, rips the crate open, bolts his own robot down
  Fk(t.welded - 0.15, [23.7, 1.3, 5.4], [23.6, 0.55, -2.4], 40, t.doorW - 0.3);   // welded to the door, held while the car carries him off
  F(t.carsE, [27.4, 2.4, 11.0], [27.6, 1.4, -3.0], 44);               // the rain cloud, the rust
  Fk(t.dip, [29.75, 0.2, 9.6], [29.75, -2.0, -1.6], 44);             // the floor opens; the hoist dips the body
  Fk(t.ecoating - 0.2, [29.75, -0.6, 6.4], [29.75, -1.7, -1.4], 42); // in the bath, in section
  F(t.weldedE, [29.7, 1.0, 7.4], [29.7, 0.5, -1.8], 42);
  Fk(t.rustproof, [29.6, 1.3, 5.6], [29.6, 0.85, -2.2], 40, t.rustproof + 0.45);
  F(t.n30000 + 0.9, [34.6, 2.0, 11.0], [35.0, 0.35, -5.5], 44);       // the dock: 30,000 parts behind the door
  Fk(t.once - 0.2, [35.1, 1.7, 9.0], [35.2, 0.45, -2.2], 44);          // the avalanche + Gary's hand out of the heap
  F(t.needed, [36.4, 1.5, 8.6], [36.6, 0.1, -2.6], 44);               // Gary drives the tugger, tossing parts in just in time
  Fk(t.credit - 0.2, [39.9, 1.05, 4.8], [39.8, 0.4, -1.1], 38, t.manager - 0.15);   // the Roomba took credit; the tie IN frame
  F(t.safe, [43.6, 1.5, 7.0], [43.6, 0.7, -1.2], 42);               // Gary, the dummy, in the car
  Fk(t.wall, [46.0, 1.4, 8.4], [46.1, -0.3, -1.2], 44, t.not + 0.3);   // crash 1 + the splat, held
  F(t.fold, [44.4, 1.5, 8.2], [44.4, 0.3, -1.3], 44);
  Fk(t.crumple - 0.3, [45.9, 1.5, 8.2], [46.0, 0.3, -1.2], 44, t.fine2 + 0.2);   // crash 2: the crumple zone
  Fk(t.off - 0.2, [45.2, 2.3, 11.0], [45.0, 0.6, -1.4], 44);          // the airbag launches him up out of the frame
  Fk(t.garyQ, [50.8, 2.6, 9.0], [49.6, 0.8, -3.6], 44, t.inside + 0.3);   // from outside the end wall: he rides out on the road
  Fk(t.car2Q, [45.6, 1.7, 8.0], [45.6, 0.5, -2.4], 42);               // back in; the QC gate scans a car
  Fk(t.rejects - 0.1, [45.3, 1.55, 6.6], [45.3, 0.55, -2.1], 40, t.twice + 0.35);   // REJECTED. Twice.
  Fk(t.meatloaf - 0.1, [43.6, 1.6, 6.2], [43.3, 0.75, -1.0], 40, t.meatloaf + 0.1);   // the meatloaf drops
  F(t.roofF + 0.15, [42.0, 6.0, 13.0], [40.8, 6.4, -1.5], 44, true);  // the crane rises past the TEST TRACK sign …
  Fk(t.factory + 0.2, [50.0, 20.0, 26.0], [36.0, 0.5, -20.0], 48);    // … to the town that's now a parking lot, and the whole factory
  F(t.n53 - 0.3, [47.4, 3.2, 10.5], [47.6, 1.2, -3.0], 44);           // descend through the money rain: a car every 53 seconds out of the end door
  Fk(t.garyEnd, [46.0, 6.2, 6.0], [46.0, 3.3, -4.0], 40, t.roombaE + 0.6);   // the corner office: Gary works for the Roomba (CEO stamp in frame)
  Fk(t.mechanicE + 0.1, [51.8, 1.7, 9.8], [54.6, 0.3, -3.0], 46);    // QUIK FIX AUTO: your car still on the lift, the board clear of the posts
  Fr.push({ t: END, pos: [52.0, 1.65, 8.8], look: [54.6, 0.3, -3.0], fov: 46, stop: true });   // a slow push to the last frame
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr, { shortHoldPass: true }));
  const hits = [[t.newH + 0.1, 0.04, 0.4], [t.roll - 0.1, 0.12, 0.9], [t.roll + 0.5, 0.08, 0.6], [t.hammering + 0.1, 0.03, 0.3], [t.make + 0.1, 0.08, 0.4], [t.make + 0.52, 0.08, 0.4], [t.make + 0.94, 0.08, 0.4],
    [PILE_AT, 0.08, 0.5], [PILE_BACK, 0.06, 0.4], [t.robot + 0.32, 0.1, 0.5], [t.buy + 0.05, 0.08, 0.4], [t.arms, 0.06, 0.35], [WELD, 0.05, 0.4], [t.rusts + 0.2, 0.04, 0.3], [PIT0 + 0.1, 0.12, 0.6], [DIP0 + 0.3, 0.06, 0.4],
    [AVA0 + 0.2, 0.18, 0.9], [DRAIN0 + 0.3, 0.06, 0.4], [HIT1, 0.22, 0.7], [HIT2, 0.2, 0.7], [BAG, 0.1, 0.5], [LANDQ, 0.08, 0.4], [STAMP, 0.06, 0.3], [STAMP2, 0.08, 0.35], [t.fits, 0.05, 0.3], [t.roll - 0.05, 0.05, 0.3], [t.front - 0.05, 0.04, 0.3], [t.vending - 0.1, 0.04, 0.3], [t.parking, 0.06, 0.6], [t.end, 0.05, 0.5]];

  // ---------------------------------------------------------------- helpers
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const hide = (o) => (o.root.visible = false);
  const show = (o, on) => (o.visible = !!on);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const tmpV = new THREE.Vector3();

  // pile parts: built once from the three cars' part objects (rest = their build pose)
  for (const k of [0, 1, 2]) { const c = lineCars[k % NPOOL]; const objs = [c.chassis, ...c.slices.map((s) => s), c.tail, ...c.body.children.filter((o) => o.isMesh), c.doors[0], c.doors[1], c.inner, c.glass];
    objs.forEach((o, i) => { const ang = PR() * PI * 2, rr = Math.sqrt(PR()) * 1.5; pileParts.push({ k, o, rp: o.position.clone(), rr: o.rotation.clone(), pp: new THREE.Vector3(PILE.x + Math.cos(ang) * rr * 1.2, PILE.y + PR() * 0.7, PILE.z + Math.sin(ang) * rr * 0.35), pr: [PR() * 6, PR() * 6, PR() * 6], d: i * 0.03 + PR() * 0.1 }); }); }

  function lineCarsAt(tt) {
    const s = lineS(tt), kMax = Math.floor((s + 1.0) / P);
    lineCars.forEach((c) => (c.g.visible = false));
    for (const pp of pileParts) { pp.o.position.copy(pp.rp); pp.o.rotation.copy(pp.rr); }   // the Cadillac parts at rest (the pile overrides below)
    for (let k = Math.max(0, kMax - NPOOL + 1); k <= kMax; k++) {
      const c = lineCars[k % NPOOL]; let x = L.x0 + s - k * P, lag = 0;
      if (x < L.x0) { lag = L.x0 - x; if (lag > 1.0) continue; x = L.x0; }   // the next chassis drops onto the line start as its slot comes up
      if (k === 0 && tt < t.builds - 0.3) continue;                           // the first chassis appears when Gary starts building
      if (x > D.road + 10) continue;
      c.g.visible = true;
      // past the end door: a tight turn onto the road between the hall and the shop, then off behind it (−z)
      let px = x, pz = L.z, ry = 0;
      const X1 = D.hall.x1 + 0.3;
      if (x > X1) { const d = x - X1, R = 1.0, th = Math.min(PI / 2, d / R); px = X1 + R * Math.sin(th); pz = L.z - R + R * Math.cos(th); ry = th; if (d > R * PI / 2) pz -= d - R * PI / 2; }
      c.g.position.set(px, L.y + (k === 0 && tt < t.roll ? 0 : lag * 1.6), pz); c.g.rotation.set(0, ry, 0);
      // build stage by station (the first car: by Gary's hands); a part pops on as the car crosses its station
      let stage = x >= D.st.paint ? 4 : x >= D.st.doors ? 2 : x >= D.st.body ? 1 : 0;
      if (k === 0 && tt < t.roll) stage = tt < t.builds ? 0 : tt < t.builds + 0.35 ? 1 : tt < t.alone ? 2 : 4;
      let finish = x >= D.st.paint ? 'paint' : 'steel', rust = 0, doorOff = 0, mix = null;
      if (k === 0 && tt < t.roll) finish = tt < t.alone + 0.1 ? 'steel' : 'paint';
      // the rust: cars under the leak rust on "rusts" (the hero car loses it in the bath)
      if (tt > t.rusts - 0.3 && x > 22.0 && x < 32.5 && tt < t.add) rust = smooth(u01(tt, t.rusts - 0.3, t.rusts + 0.3));
      if (k === 1 && tt > t.rusts - 0.3 && tt < t.add) doorOff = Math.min(1, u01(tt, t.rusts + 0.15, t.rusts + 0.5) * 1.2);
      if (k === HERO && tt > DIP0) { rust *= 1 - smooth(u01(tt, t.seals, t.crack + 0.4)); finish = tt > t.seals ? 'ecoat' : finish; }
      if (k <= 2 && tt > PILE_OUT) mix = [carColor((k + 1) % 3), carColor((k + 2) % 3), carColor(k)];   // the rebuilt Cadillac three: parts swapped
      c.set({ stage, finish, color: carColor(k), mix, rust, doorOff, spin: -s / 0.32 });
      if (k === 0 && tt > t.but - 0.2 && tt < t.partsW) c.doors[0].visible = false;   // Gary's car waits for a new door
      const pk = (st) => Math.max(0.001, easeOutBack(clamp((x - st) / 0.5), 2.2));
      if (!(k === 0 && tt < t.roll)) { const b = pk(D.st.body); c.nose.scale.setScalar(b); c.tail.scale.setScalar(b); c.doors.forEach((d) => d.scale.setScalar(pk(D.st.doors))); const ip = pk(D.st.paint); c.inner.scale.setScalar(ip); c.glass.scale.setScalar(ip); }
      else { c.nose.scale.setScalar(1); c.tail.scale.setScalar(1); c.doors.forEach((d) => d.scale.setScalar(1)); c.inner.scale.setScalar(1); c.glass.scale.setScalar(1); }
    }
    // the e-coat dip: the hero car leaves its slot on the hoist
    const hc = lineCars[HERO % NPOOL];
    if (tt > LIFT0 && tt < SET1 + 0.5) {
      const xH = 29.75, up = 1.25, zD = D.tank.dipZ, yDip = D.tank.y0 + 0.4;
      let y = L.y, z = L.z;
      if (tt < DIP0) { const u = smooth(u01(tt, LIFT0, DIP0)); y = L.y + up * Math.sin(Math.min(1, u * 1.6) * PI / 2); z = lerp(L.z, zD, smooth(u01(tt, LIFT0 + 0.15, DIP0))); if (u > 0.7) y = lerp(L.y + up, yDip, smooth(u01(tt, lerp(LIFT0, DIP0, 0.7), DIP0))); }
      else if (tt < OUT0) { y = yDip + 0.03 * Math.sin(tt * 3); z = zD; }
      else if (tt < OUT1) { const u = smooth(u01(tt, OUT0, OUT1)); y = lerp(yDip, L.y + up, u); z = zD; }
      else { const u = smooth(u01(tt, OUT1, SET1)); y = lerp(L.y + up, L.y, u); z = lerp(zD, L.z, u); }
      hc.g.position.set(xH, y, z); hc.g.rotation.z = tt > OUT0 && tt < OUT1 ? 0.06 * Math.sin((tt - OUT0) * 9) : 0;
      S.hoist.setHoist(z, y);
    } else { hc.g.rotation.z = 0; S.hoist.setHoist(L.z, L.y + 1.25); }
    // the Cadillac test: k0..k2's parts fly into one pile in front of k1 and back
    const inPile = tt > PILE_IN - 0.05 && tt < PILE_BACK + 0.4;
    for (const pp of pileParts) {
      const c = lineCars[pp.k % NPOOL];
      if (!inPile) continue;
      const carP = c.g.position; const toLocal = (w) => tmpV.set(w.x - carP.x, w.y - carP.y, w.z - carP.z);
      const restW = new THREE.Vector3().copy(pp.rp).add(carP);
      let u = 0; if (tt < PILE_AT) u = smooth(u01(tt, PILE_IN + pp.d, PILE_AT)); else if (tt < PILE_OUT) u = 1; else u = 1 - smooth(u01(tt, PILE_OUT + pp.d * 0.6, PILE_BACK));
      const arc = 4 * u * (1 - u) * 1.2;
      const w = new THREE.Vector3().lerpVectors(restW, pp.pp, u); w.y += arc;
      pp.o.position.copy(toLocal(w));
      pp.o.rotation.set(pp.rr.x + pp.pr[0] * u, pp.rr.y + pp.pr[1] * u, pp.rr.z + pp.pr[2] * u);
      pp.o.visible = true;
    }
  }

  function update(tt) {
    // ---- the hall: pops up bay by bay on "roll each car past a row of stations"; the line runs
    const hk = smooth(u01(tt, t.roll - 0.3, t.stations + 0.1));
    S.setHall(hk); S.setLine(lineS(tt));
    S.garage.setRollDoor(Math.max(0.8 * smooth(u01(tt, t.soH - 0.2, t.soH + 0.3)) * (1 - smooth(u01(tt, t.garage + 0.4, t.congrats + 0.4))), smooth(u01(tt, t.now - 0.2, t.everyone + 0.2))));   // open for Gary, shut, then up for the queue
    S.daysSign.material.map = S.daysTex[0];
    S.pressSign.visible = tt > t.exactly; S.tpsSign.visible = S.tpsSign.visible && tt > t.jitW;
    const dayOne = (tt > t.toyota && tt < HIT1) || (tt > t.walks && tt < BAG) || (tt > t.check && tt < STAMP);   // the runner: it reaches 1 … and snaps back to 0 at every Gary accident
    S.daysSign2.material.map = S.daysTex[dayOne ? 1 : 0]; S.daysSign2.rotation.z = wobble(tt, HIT1, 0.12, 20, 6) + wobble(tt, BAG, 0.12, 20, 6) + wobble(tt, STAMP, 0.12, 20, 6);
    // the wall clock spins through "12 hours" (and again through Gary's "all day")
    const spin = 14 * PI * smooth(u01(tt, t.n12 - 0.2, t.minutes)) + 10 * PI * smooth(u01(tt, t.bolt, t.up));
    S.hands[0].rotation.z = -spin / 12 - 1.0; S.hands[1].rotation.z = -spin - 0.3;
    // ---- the press: three slams on "make every part exactly alike"; its doors slide out onto a stack
    const slam = [0, 1, 2].map((k) => t.make + k * 0.42);
    let ramY = 2.9; for (const s0 of slam) if (tt > s0 && tt < s0 + 0.42) ramY = 2.9 - 1.75 * Math.sin(PI * clamp((tt - s0) / 0.3));
    S.ram.position.y = ramY;
    pressDoors.forEach((d, k) => { const a = slam[k] + 0.18; d.visible = tt > a && tt < t.inter + 0.6 + k * 0.1;
      const stack = [D.press - 0.9, 0.05 + k * 0.11, -1.6];
      if (tt < a + 0.5) { const u = smooth(u01(tt, a, a + 0.5)); d.position.set(lerp(D.press, stack[0], u), lerp(1.0, stack[1], u) + 0.6 * Math.sin(u * PI), lerp(-6.6, stack[2], u)); d.rotation.set(-PI / 2 * u, 0, 0); }
      else if (k === 2 && tt > t.inter - 0.1) { const u = smooth(u01(tt, t.inter - 0.1, t.inter + 0.35)); d.position.set(lerp(stack[0], SUN - 0.06, u), lerp(stack[1], L.y + 0.62, u) + 0.7 * Math.sin(u * PI), lerp(stack[2], L.z + 0.7, u)); d.rotation.set(-PI / 2 * (1 - u), 0, 0); if (u >= 1) d.visible = false; }
      else { d.position.set(...stack); d.rotation.set(-PI / 2, 0, 0); } });
    // the door that doesn't fit: bounces off the car, then is hammered into the cockpit (a sunroof), pops out for the real one
    show(looseDoor, tt > t.but - 0.2 && tt < t.inter + 0.4);
    if (looseDoor.visible) { const gx = SUN;
      if (tt < t.fits + 0.25) { const u = smooth(u01(tt, t.but - 0.2, t.fits)), b = tt > t.fits ? wobble(tt, t.fits, 0.25, 22, 6) : 0; looseDoor.position.set(gx + 0.2, 0.75, lerp(-1.4, -2.38, u) + Math.abs(b)); looseDoor.rotation.set(0, 0, b); looseDoor.scale.set(1.25, 1.15, 1); }
      else if (tt < t.hammering) { const u = smooth(u01(tt, t.fits + 0.25, t.hammering)); looseDoor.position.set(lerp(gx + 0.2, gx - 0.1, u), lerp(0.75, 1.12, u), lerp(-2.0, L.z, u)); looseDoor.rotation.set(-PI / 2 * u, 0, 0); looseDoor.scale.set(1.25, 2.6, 1); }   // laid flat across the cockpit like a roof
      else if (tt < t.inter - 0.05) { const hits2 = Math.floor(clamp((tt - t.hammering) / 0.3, 0, 4)); looseDoor.position.set(gx - 0.1, 1.12 - hits2 * 0.03, L.z); looseDoor.rotation.set(-PI / 2 + wobble(tt, t.hammering + hits2 * 0.3, 0.05, 30, 8), 0, 0); looseDoor.scale.set(1.25, 2.6, 1); }
      else { const [x, y, z] = hop(tt, t.inter - 0.05, t.inter + 0.4, [gx - 0.1, 1.12, L.z], [gx - 1.6, 0.05, -1.0], 1.0); looseDoor.position.set(x, y, z); looseDoor.rotation.set(-PI / 2 + tt * 8, 0, 0); looseDoor.scale.set(1.25, 2.6, 1); } }
    stool.visible = false;
    lineCarsAt(tt);
    scanner.visible = tt > t.check && tt < t.quality; if (scanner.visible) { const u = (tt - t.check) * 1.6 % 1; scanner.position.set(D.qc.x - 1.6 + 3.2 * u, 1.25, L.z); }
    tally.visible = tt > t.garys + 0.8 && tt < t.soR; setTally(Math.round(9999 * smooth(u01(tt, t.bolt, t.up))));
    // ---- robots: drop in on "robot arms", weld cars ("never sleep"), then one turns and welds Gary to the door
    robots.forEach((r, i) => {
      const at = i ? t.arms : t.robot - 0.1; r.g.visible = tt > at; if (!r.g.visible) return;
      r.g.position.y = i ? 0 : drop(tt, at, 6, 0.42); if (i) r.g.scale.setScalar(1.12 * Math.max(0.05, easeOutBack(u01(tt, at, at + 0.4), 1.8)));
      const busy = tt > t.never - 0.2;
      const cx = 23.4 + (i ? 1.2 : -1.2), ph = tt * 3 + i;
      if (i === 1 && tt > WELD - 0.6 && tt < t.doorW + 0.6) r.reach([D.robot + 0.15, 0.95, -2.3], { lift: tt < WELD - 0.15 ? 0.4 * (1 - u01(tt, WELD - 0.6, WELD - 0.15)) : 0 });
      else if (busy) r.reach([cx + 0.5 * Math.sin(ph), 1.05 + 0.08 * Math.sin(ph * 2.3), L.z + 0.4 * Math.cos(ph * 0.7)]);
      else r.pose(0, 0.15, 1.0, 0.7);
    });
    // the crate: drops in on "buy", bursts open on "arms" (Gary rips it)
    crate.visible = tt > t.buy - 0.3 && tt < t.arms + 1.3; crate.position.y = drop(tt, t.buy - 0.3, 5, 0.35);
    cPanels.forEach((p2, k) => { const [x, y, z, rx, ry] = p2.userData.rest, u = u01(tt, t.arms, t.arms + 0.9), out = k === 4 ? [0, 1, 0] : [Math.sign(x) || 0, 0.4, Math.sign(z) || 0]; p2.position.set(x + out[0] * 1.6 * u, Math.max(0.03, y + out[1] * 2.2 * u - 4.9 * u * u), z + out[2] * 1.6 * u); p2.rotation.set(rx + (k % 2 ? 1 : -1) * 1.6 * u, ry + 0.8 * u, 0); });
    // weld sparks while busy (the tips are only known at runtime: a small analytic stream is cheap to fake with sprites)
    // ---- the e-coat tank: the floor opens, the bath fills, glows blue while it's electrified
    const pit = smooth(u01(tt, PIT0, PIT1)); S.setPit(pit); S.tank.setBath(lerp(D.tank.y0, D.tank.level, smooth(u01(tt, PIT1 - 0.2, t.body))));
    S.tank.bath.material.emissive = S.tank.bath.material.emissive || new THREE.Color(); S.tank.bath.material.emissive.setHex(0x3a8fd0); S.tank.bath.material.emissiveIntensity = 0.5 * smooth(u01(tt, t.electrified - 0.1, t.electrified + 0.2)) * (1 - smooth(u01(tt, t.crack + 0.3, t.ecoating)));
    S.crack.visible = false;
    // the rain cloud: forms over the line on "then the cars", rains through "rusting in the rain", then drifts up and away
    const cl = smooth(u01(tt, t.thenE - 0.2, t.carsE + 0.1)) * (1 - smooth(u01(tt, t.dip + 0.2, t.dip + 0.9)));
    cloud.visible = cl > 0.01; cloud.position.set(27.2 + 0.4 * Math.sin(tt * 0.7), 4.0 + 1.5 * smooth(u01(tt, t.dip + 0.2, t.dip + 0.9)), L.z + 0.1); cloud.scale.setScalar(Math.max(0.01, cl));
    // ---- the dock (avalanche), the paint booth, the roof test track, the office
    S.dock.setDock(smooth(u01(tt, t.n30000 + 0.2, t.n30000 + 0.9)) * (1 - smooth(u01(tt, DRAIN1, DRAIN1 + 0.5))));
    S.vend.visible = tt > t.vending - 0.15; S.vend.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, t.vending - 0.15, t.vending + 0.2), 2)));
    meat.visible = tt > t.meatloaf - 0.1; if (meat.visible) { const u = u01(tt, t.meatloaf - 0.1, t.meatloaf + 0.25); meat.position.set(D.vend[0] - 0.1, 0.9 - 0.62 * u * u + (u >= 1 ? wobble(tt, t.meatloaf + 0.25, 0.04, 20, 6) : 0), D.vend[1] - 0.05); }
    S.setLot(smooth(u01(tt, t.parking - 0.2, t.factory)));
    S.lvArm.rotation.z = tt > t.roll - 0.35 ? -1.1 * smooth(u01(tt, t.roll - 0.35, t.roll - 0.05)) : 0;   // Gary yanks the start lever
    const pb = [t.make, t.exactly, t.alike].some((a) => tt > a - 0.05 && tt < a + 0.15); S.pButtons.forEach((b) => (b.position.y = pb ? 1.07 : 1.1));
    S.booth.userData.arm.pose(0.6 + 0.4 * Math.sin(tt * 2), 0.5, 1.3 + 0.15 * Math.sin(tt * 3), 0.9);
    S.boothMist.forEach((m, i) => { const a = ((tt * 0.6 + i / 10) % 1); m.position.set(-1.2 + a * 2.4, 0.6 + 0.8 * Math.sin(i * 1.7 + tt), 0.3 * Math.sin(i * 2.3)); m.scale.setScalar(0.6 + a); m.material.opacity = 0.22 * (1 - a); });
    S.roofTrack.visible = tt > t.test - 0.15; S.roofTrack.scale.set(1, Math.max(0.001, easeOutBack(u01(tt, t.test - 0.15, t.test + 0.2), 2)), 1);
    racer.g.visible = tt > t.test; if (racer.g.visible) { const [a, b] = D.roof.track, Rr = 2.4, zc = -4.8, zh = 3.0, Ls = (b - a - 2 * Rr), per = 2 * Ls + 2 * PI * Rr, d = ((tt - t.test) * 9 + 14.8) % per;   // an oval centre-line, 9 m/s, along the front straight first
      let x, z, ry; if (d < Ls) { x = a + Rr + d; z = zc + zh; ry = 0; } else if (d < Ls + PI * Rr) { const th = (d - Ls) / Rr; x = b - Rr + Rr * Math.sin(th) * 0.0 + Rr * Math.sin(th); z = zc + zh * Math.cos(th); ry = th; } else if (d < 2 * Ls + PI * Rr) { x = b - Rr - (d - Ls - PI * Rr); z = zc - zh; ry = PI; } else { const th = (d - 2 * Ls - PI * Rr) / Rr; x = a + Rr - Rr * Math.sin(th); z = zc - zh * Math.cos(th); ry = PI + th; }
      racer.g.position.set(x, D.roof.top, z); racer.g.rotation.set(0, ry, 0); racer.set({ stage: 4, color: 0xffd23f, spin: -tt * 28 }); }
    const officeOn = tt > t.end - 0.5; S.office.g.visible = officeOn; S.stairs.visible = tt > t.roll;
    S.office.g.scale.setScalar(1);
    // ---- the parts avalanche (instanced): out of the dock into a heap over Gary, then back out (just-in-time)
    const heapOn = tt > t.n30000 + 0.2 && tt < DRAIN1 + 0.2; heapW.visible = heapT.visible = heapOn;   // packed in the open dock door, then the avalanche
    if (heapOn) for (const [mesh, pts] of [[heapW, HW], [heapT, HT]]) { pts.forEach((p, i) => {
      const uin = smooth(u01(tt, AVA0 + p.dl, AVA0 + p.dl + 0.45)), uout = smooth(u01(tt, DRAIN0 + p.dl * 0.8, DRAIN0 + p.dl * 0.8 + 0.4)), u = uin * (1 - uout);
      v3.set(lerp(p.from[0], p.to[0], u), lerp(p.from[1], p.to[1], u) + 1.6 * Math.sin(u * PI) * (1 - uin * (1 - uout) > 0.5 ? 1 : 0.3), lerp(p.from[2], p.to[2], u));
      e3.set(p.rot[0] + tt * 3 * (1 - u), p.rot[1], p.rot[2]); q.setFromEuler(e3); m4.compose(v3, q, one.set(1, 1, 1).multiplyScalar(u > 0.02 || uout < 1 ? 1 : 0.001)); mesh.setMatrixAt(i, m4); }); mesh.instanceMatrix.needsUpdate = true; }
    // the tugger: in from the dock with a steering wheel + a tire, one part per car, just as each car arrives
    tug.g.visible = tt > DRAIN0; const tu = smooth(u01(tt, Math.max(DRAIN1, t.needed - 0.6), t.toyota + 0.2)); tug.g.position.set(lerp(TUG0[0], TUG1[0], tu), 0, lerp(TUG0[1], TUG1[1], tu)); tug.g.rotation.y = 0;
    for (const [part, tt0] of [[jitWheel, t.needed - 0.1], [jitTire, t.jitW - 0.1]]) { const u = u01(tt, tt0, tt0 + 0.45); if (u <= 0) { part.parent !== tug.trailers[part === jitWheel ? 0 : 1] && tug.trailers[part === jitWheel ? 0 : 1].add(part); part.position.set(0, 0.5, 0); part.visible = tt > DRAIN0; continue; }
      if (part.parent !== scene) scene.add(part); const tr = tug.g.position, [x, y, z] = hop(tt, tt0, tt0 + 0.45, [tr.x - 1.05 - (part === jitTire ? 1.0 : 0), 0.6, tr.z], [tr.x - 0.6, 0.75, L.z + 0.2], 0.9); part.position.set(x, y, z); part.rotation.set(PI / 2 + tt * 6 * (1 - u), 0, 0); part.visible = u < 1; }
    // ---- your car + the tow truck (hook), then on the lift at the end (cobwebs, still in the shop)
    tow.g.visible = towX(tt) < 22; tow.g.position.set(towX(tt), 0, -3.3); tow.beacon.visible = Math.floor(tt * 3) % 2 === 0;
    if (tow.g.visible) { const hx = towX(tt) + tow.hook.x; myCar.g.position.set(hx - 1.3, 0.34, -3.3); myCar.g.rotation.set(0, 0, 0.32 + 0.03 * Math.sin(tt * 5)); myCar.g.visible = true; myCar.set({ stage: 4, color: 0x3d7bd9, doorOff: 0 }); }
    else { myCar.g.visible = tt > t.end; myCar.g.rotation.set(0, 0, 0); myCar.g.position.set(D.shop.x0 + 3.7, 2.0, -2.9); myCar.set({ stage: 4, color: 0x3d7bd9, rust: 0.25 }); }
    const sag = tt > t.n1400 ? 0.12 * smooth(u01(tt, t.n1400, t.n1400 + 0.3)) - wobble(tt, t.n1400 + 0.3, 0.05, 16, 5) : 0; S.shop.liftArms.position.y = 2.0 - sag; if (tt > t.end) myCar.g.position.y = 2.0 - sag; S.shop.cobwebs.forEach((w) => (w.visible = true));
    S.shop.priceBoard.material.map = tt > t.n1400 - 0.05 ? S.shop.prices['$1,400'] : S.shop.prices['$900']; S.shop.priceBoard.rotation.y = tt > t.n1400 - 0.3 && tt < t.n1400 + 0.2 ? PI * 2 * smooth(u01(tt, t.n1400 - 0.3, t.n1400 + 0.2)) : 0;
    spider.visible = tt > t.shop; if (spider.visible) { const dn = 1.1 * smooth(u01(tt, t.n1400 + 0.4, t.n1400 + 1.4)) + 0.05 * Math.sin(tt * 3); spider.position.set(D.shop.x0 + 1.75, 2.8 - dn, -1.85); thread.scale.y = Math.max(0.01, dn); thread.position.y = dn / 2; }
    // ---- the crash cars
    crashCarsAt(tt);
    // ---- the junk car: pops together in the garage (crate, three wheels, the lawnmower's engine), sputters, Gary's head is the horn
    junk.g.visible = tt > t.newH - 0.1; junk.g.position.set(JX, 0, JZ);
    junk.g.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, t.newH - 0.1, t.newH + 0.25), 2)));
    junk.wheels.forEach((w, i) => (w.visible = tt > t.garage - 0.1 + i * 0.1));
    const engOn = tt > t.garage + 0.25; junk.eng.visible = engOn; S.garage.lmEng.visible = !engOn;
    if (engOn) { const u = smooth(u01(tt, t.garage + 0.25, t.congrats)); junk.eng.position.set(lerp(-6.2 - JX, -0.75, u), lerp(0.43, 0.97, u) + 0.6 * Math.sin(u * PI), lerp(-0.9 - JZ, 0, u)); }
    junk.g.rotation.z = (tt > t.engine - 0.1 && tt < t.horn ? 0.02 * Math.sin(tt * 47) : 0) + (tt > t.three && tt < t.mower ? -0.05 * smooth(u01(tt, t.three, t.wheels)) : 0);
    junk.cord.position.x = tt > t.mower && tt < t.engine ? -0.1 - 0.5 * Math.sin(PI * u01(tt, t.mower, t.engine)) : -0.1;
    // ---- the Roomba's rope + characters
    garyAt(tt); mechAt(tt); crewAt(tt); roombaAt(tt);
    // ---- camera (one take) + impact shake; the sun follows what we look at
    const cam = rail.at(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const k = shake(tt, hits); studio.camera.position.x += k.x; studio.camera.position.y += k.y; studio.camera.rotation.z += k.r;
    S.aimSun(cam.look[0], cam.look[1], Math.max(7, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.65));
    fx.update(tt, studio.camera);
  }

  // ---------------------------------------------------------------- the crash lane
  function crashCarsAt(tt) {
    const z = C.z; crash2.g.visible = false;
    crash1.g.visible = tt > t.toyota && tt < t.end + 0.5;
    // run 1: rigid, bounces off the wall; then winched back to the start while it gets the striped crumple nose; run 2: it folds
    const back = smooth(u01(tt, t.not + 0.15, t.soX + 0.7));
    const x = (tt < L2 ? lerp(crashX(tt, L1, HIT1, false), CAR_X0, back) : crashX(tt, L2, HIT2, true)) - (CAR_X0 + 0.78 - 40.2 + (HIT_X - CAR_X0)) * smooth(u01(tt, t.thenQ + 0.3, t.check - 0.4));   // winched back out of the QC corridor while we're out on the road
    crash1.g.position.set(x, 0, z);
    const squeeze = tt > t.fold - 0.05 && tt < t.can + 0.45 ? 0.6 * Math.sin(PI * u01(tt, t.fold - 0.05, t.can + 0.45)) : 0;   // Gary squeezes it like a soda can (it springs back)
    crash1.set({ stage: 4, color: 0xd94b3d, stripes: tt > t.front - 0.05 ? 1 : 0, crumple: tt > HIT2 - 0.02 ? smooth(u01(tt, HIT2 - 0.02, HIT2 + 0.45)) : squeeze, spin: -(x - CAR_X0) / 0.32 });   // run 2 folds in slow motion
    if (tt > t.front - 0.05 && tt < t.front + 0.35) crash1.nose.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, t.front - 0.05, t.front + 0.25), 2.4)));   // the striped nose pops on as he slaps it
    crash1.g.rotation.z = tt > HIT1 && tt < L2 ? wobble(tt, HIT1, 0.06, 18, 6) : tt > HIT2 ? wobble(tt, HIT2, 0.04, 16, 6) : 0;
    // the car is fine: a sparkle on its polish
    sparkle.visible = tt > t.fine - 0.15 && tt < t.fine + 0.6; if (sparkle.visible) { sparkle.position.set(x + 0.6, 1.0, z + 0.85); sparkle.scale.setScalar(0.5 * pop(tt, t.fine - 0.15, 0.2) * (1 - u01(tt, t.fine + 0.3, t.fine + 0.6))); sparkle.material.rotation = tt * 4; }
    // the airbag: bursts out of the cockpit on "off" and launches Gary
    airbag.set(tt > BAG ? 1.7 * easeOutBack(u01(tt, BAG, BAG + 0.14), 2.5) * (1 - smooth(u01(tt, BAG + 0.5, BAG + 1.6))) : 0);
    airbag.g.position.set(x - 0.2, 1.0, z + 0.5);   // it balloons out of the cockpit, then deflates
  }

  // ---------------------------------------------------------------- Gary (never teleports on screen)
  const GH = { x: 1.3, z: -1.2 };   // the hook spot in the yard
  const WALKS = {};                  // filled below
  function garyAt(tt) {
    const g = gary; g.root.visible = true;
    hammer.visible = false; wrench.visible = false; thumb.visible = tt > t.alone - 0.05 && tt < t.roll; thumb.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, t.alone - 0.05, t.alone + 0.2), 2.6) * 1.4)); handWheel.visible = false; targets.forEach((d) => (d.visible = false)); rejDecal.visible = false; qMark.visible = false;
    dizzy.update(tt, 0, [0, 0, 0]); glowLight.intensity = 0;
    const base = { t: tt, eyes: 'open', mouth: 'smile', brows: 0 };
    const gold = tt > ORN && tt < t.garys + 0.9 ? [0xf2c418, 0.75] : null;
    const grey = tt > OUT0 ? [0x7d858e, 0.55 * smooth(u01(tt, OUT0, OUT0 + 0.4))] : null;   // the e-coat stays on him
    const dummy = tt > t.toyota && tt < t.add;
    if (dummy) targets.forEach((d) => (d.visible = true));
    if (tt > STAMP) { rejDecal.visible = true; rejDecal.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, STAMP, STAMP + 0.15), 2.4))); }
    rejDecal2.visible = tt > STAMP2; if (rejDecal2.visible) rejDecal2.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, STAMP2, STAMP2 + 0.15), 2.4)));
    const tint = grey || undefined;
    if (tt < t.soH + 0.1) { // the hook: Gary hears the price (jaw drop on "900")
      const shock = tt > t.n900 + 0.05;
      return g.set({ ...base, x: GH.x, y: 0, z: GH.z, rotY: 0.75, eyes: shock ? 'wide' : 'open', mouth: shock ? 'scream' : 'smile', brows: shock ? 1 : 0, squash: squash(tt, t.n900 + 0.05, 0.25), look: [0.6, 0.1], head: { x: shock ? -0.15 : 0, y: 0.3, z: 0 }, armL: shock ? { x: -2.4, z: 0.5, el: 1.6 } : undefined, armR: shock ? { x: -2.4, z: 0.5, el: 1.6 } : undefined });
    }
    if (tt < t.garage + 0.2) { // "so you build a new one in your garage": off through the roll-up door… (the door is open a crack: he ducks under)
      const u = u01(tt, t.soH + 0.1, t.garage + 0.2); const pts = [[GH.x, GH.z], [-0.4, -2.4], [-2.6, -2.4]];
      const a = u < 0.5 ? pts[0] : pts[1], b = u < 0.5 ? pts[1] : pts[2], v = u < 0.5 ? u * 2 : u * 2 - 1;
      return g.set({ ...base, x: lerp(a[0], b[0], v), y: 0, z: lerp(a[1], b[1], v), rotY: -PI / 2 + 0.2, walk: tt * 13, eyes: 'open', mouth: 'grin', lean: 0.2 });
    }
    if (tt < t.congrats) { // builds the junk car (hammer)
      hammer.visible = true; const ph = tt * 18;
      return g.set({ ...base, x: -2.9, y: 0, z: -1.5, rotY: -PI / 2 + 0.5, eyes: 'half', mouth: 'flat', brows: -0.6, armR: { x: -1.8 + 0.8 * Math.sin(ph), z: 0.2, el: 0.6 }, lean: 0.25 });
    }
    if (tt < t.mower - 0.25) { // ta-da
      return g.set({ ...base, x: -2.9, y: 0, z: -1.4, rotY: -0.2, eyes: 'open', mouth: 'grin', squash: squash(tt, t.congrats, 0.2), armL: { x: -0.5, z: 1.2, el: 0.2 }, armR: { x: -0.5, z: 1.2, el: 0.2 }, look: [-0.3, 0] });
    }
    if (tt < t.engine + 0.3) { // walks to the back of the crate and yanks the pull cord
      const u = u01(tt, t.mower - 0.25, t.mower), x = lerp(-2.9, JX - 1.35, u), yank = tt > t.mower && tt < t.engine ? Math.sin(PI * u01(tt, t.mower, t.engine)) : 0;
      return g.set({ ...base, x, y: 0, z: JZ + 0.55, rotY: u < 1 ? -PI / 2 : 0.6, walk: u < 1 ? tt * 12 : undefined, eyes: tt > t.engine ? 'wide' : 'open', mouth: tt > t.engine ? 'o' : 'grin', armR: { x: -1.2 + 1.2 * yank, z: 0.3, el: 0.3 + yank }, lean: -0.15 * yank });
    }
    if (tt < t.horn - 0.15) { // hops into the crate (in through the seat), sinks out of sight
      const u = u01(tt, t.engine + 0.3, t.horn - 0.15), [x, y, z] = hop(tt, t.engine + 0.3, t.horn - 0.35, [JX - 1.35, 0, JZ + 0.55], [JX - 0.2, 0.95, JZ], 0.6);
      const sink = smooth(u01(tt, t.horn - 0.45, t.horn - 0.15));
      return g.set({ ...base, x, y: y - 0.9 * sink, z, rotY: 0.3, eyes: 'open', mouth: 'grin', squash: [1, 1 - 0.3 * sink] });
    }
    if (tt < t.now + 0.15) { // the horn: his head pops out of the hood hole and yells HONK
      const hx = JX + 0.62, up = easeOutBack(u01(tt, t.horn - 0.15, t.horn + 0.1), 2.6), honk = tt > t.garyC - 0.05 && tt < t.garyC + 0.6;
      return g.set({ ...base, x: hx, y: lerp(0.05, 0.42, up), z: JZ, rotY: 0.15, eyes: honk ? 'wide' : 'open', mouth: honk ? 'scream' : 'o', brows: honk ? 1 : 0, squash: [1, 0.86], legL: { x: -1.5, kn: 1.4 }, legR: { x: -1.5, kn: 1.4 }, armL: { x: 0, z: 0.1 }, armR: { x: 0, z: 0.1 }, hatLift: honk ? 0.35 * Math.sin(PI * u01(tt, t.garyC - 0.05, t.garyC + 0.6)) : 0 });
    }
    if (tt < t.builds - 0.15) { // climbs out and over to the line start
      const [x, y, z] = hop(tt, t.now + 0.15, t.now + 0.6, [JX + 0.62, 0.15, JZ], [JX + 0.9, 0, JZ - 0.45], 0.5), u = u01(tt, t.now + 0.6, t.builds - 0.15);
      return g.set({ ...base, x: lerp(x, L.x0 + 1.4, u), y, z: lerp(z, L.z + 1.0, u), rotY: PI - 0.4, walk: u > 0 && u < 1 ? tt * 12 : undefined, eyes: 'open', mouth: 'smile' });
    }
    if (tt > t.roll - 0.55 && tt < t.roll + 0.2) { // yanks the start lever: the line rolls, the hall slams up
      const u = smooth(u01(tt, t.roll - 0.55, t.roll - 0.35)), yank = smooth(u01(tt, t.roll - 0.35, t.roll - 0.05));
      return g.set({ ...base, x: lerp(L.x0 + 1.4, -2.25, u), y: 0, z: lerp(L.z + 1.0, -1.35, u), rotY: PI - 0.3, eyes: 'wide', mouth: 'grin', armR: { x: -2.6 + 1.4 * yank, z: 0.2, el: 0.3 }, armL: { x: -2.6 + 1.4 * yank, z: 0.1, el: 0.3 }, lean: 0.2 * yank }); }
    if (tt < t.roll + 0.2) { // builds the first car alone, frantic (sweat), while the queue taps its watches
      hammer.visible = true; const ph = tt * 22, ouch = tt > t.alone - 0.05;
      return g.set({ ...base, x: L.x0 + 1.4 + 0.25 * Math.sin(tt * 4), y: 0, z: L.z + 1.0, rotY: ouch ? 0.3 : PI + 0.5 * Math.sin(tt * 4), eyes: ouch ? 'wide' : 'wide', mouth: ouch ? 'scream' : 'teeth', squash: squash(tt, t.alone, 0.3), brows: -0.8, armR: { x: -2.0 + 0.9 * Math.sin(ph), z: 0.2, el: 0.6 }, armL: { x: -1.2, z: 0.3, el: 0.9 }, lean: 0.3, faceTint: [0xe0483a, 0.3] });
    }
    // to his station (x = st.gary) as the hall grows, then faces the lens behind his car's spot
    const SPOT = [SUN - 0.6, -1.85];
    if (tt < t.but - 0.3) { // hops onto the lead car and rides the line like a surfer (the Roomba pulls him), waving, to his station
      const c0 = slotX(0, tt), onDeck = c0 >= D.st.body, deckY = L.y + (onDeck ? 0.9 : 0.38) + (onDeck ? 0 : 0), [hx, hy, hz] = hop(tt, t.roll + 0.2, t.roll + 0.6, [-2.25, 0, -1.35], [slotX(0, t.roll + 0.6) - 1.1, L.y + 0.38, L.z], 0.6);
      if (tt < t.roll + 0.6) return g.set({ ...base, x: hx, y: hy, z: hz, rotY: -0.3, eyes: 'wide', mouth: 'grin' });
      return g.set({ ...base, x: c0 - 1.1, y: deckY - 0.22, z: L.z, rotY: 0.35 + 0.15 * Math.sin(tt * 1.3), eyes: 'open', mouth: 'grin', legL: { x: -0.7, kn: 1.1 }, legR: { x: -0.5, kn: 1.0 }, armR: { x: -2.7, z: 0.5 + 0.25 * Math.sin(tt * 8), el: 0.2 }, armL: { x: -0.4, z: 1.0, el: 0.2 }, lean: 0.15, look: [0.4, 0] }); }   // a surfer's crouch
    if (tt < t.soP - 0.1) { // nothing fits → climbs into the cockpit (stands on the seat) and hammers the door in as a "sunroof"
      const onStool = tt > t.fits + 0.25, hamm = tt > t.hammering; hammer.visible = hamm; const ph = (tt - t.hammering) / 0.3 * PI * 2;
      const shoved = tt < t.fits + 0.25 ? smooth(u01(tt, t.but - 0.2, t.fits)) : 0, hd = hop(tt, t.but - 0.3, t.but + 0.1, [SUN - 1.1, L.y + 0.9, L.z], [SPOT[0] + 0.5, 0, -1.6], 0.4), [cx, cy, cz] = hop(tt, t.fits + 0.25, t.fits + 0.6, [SPOT[0] + 0.5, 0, -1.95], [SUN - 1.15, L.y + 0.88, L.z + 0.15], 0.6);   // up onto the rear deck
      if (tt < t.but + 0.1) return g.set({ ...base, x: hd[0], y: hd[1], z: hd[2], rotY: 0.4, eyes: 'open', mouth: 'smile' });
      return g.set({ ...base, x: onStool ? cx : SPOT[0] + 0.5, y: onStool ? cy : 0, z: onStool ? cz : lerp(-1.6, -1.95, shoved), rotY: onStool ? -0.5 : 0.9,
        eyes: tt > t.fits && tt < t.fits + 0.4 ? 'wide' : hamm ? 'half' : 'open', mouth: hamm ? 'teeth' : tt > t.fits ? 'o' : 'flat', brows: hamm ? -1 : 0.5, squash: squash(tt, t.fits, 0.25),
        armR: hamm ? { x: -2.6 + 1.0 * Math.max(0, Math.sin(ph)), z: 0.2, el: 0.4 } : { x: -1.2, z: 0.2, el: 0.4 }, armL: onStool ? { x: -0.6, z: 1.0, el: 0.6 } : { x: -1.2, z: 0.25, el: 0.4 } }); }
    const PED = [D.press - 1.1, -2.15];   // behind the press's two-hand pedestal, facing the lens
    if (tt < t.inter - 0.1) { // "So you make every part exactly alike": hops off, slams both press buttons three times
      const [x, y, z] = hop(tt, t.soP - 0.1, t.make - 0.12, [SUN - 1.15, L.y + 0.88, L.z + 0.15], [PED[0], 0, PED[1]], 0.5), slam = [t.make, t.exactly, t.alike].some((a) => tt > a - 0.08 && tt < a + 0.12);
      return g.set({ ...base, x, y, z, rotY: 0.05, eyes: slam ? 'wide' : 'open', mouth: slam ? 'teeth' : 'grin', brows: slam ? -0.8 : 0, squash: slam ? [1.05, 0.95] : [1, 1], armL: { x: slam ? -1.0 : -1.7, z: 0.3, el: 0.4 }, armR: { x: slam ? -1.0 : -1.7, z: 0.3, el: 0.4 } });
    }
    if (tt < PILE_IN) { // watches the new door click on (thumbs up), walks round to the front of k1 (the pile spot)
      const u = smooth(u01(tt, t.partsW, PILE_IN - 0.2));
      return g.set({ ...base, x: lerp(PED[0], D.st.gary - 0.9, u), y: 0, z: lerp(PED[1], -1.6, u), rotY: u > 0 && u < 1 ? -PI / 2 : 0.3, walk: u > 0 && u < 1 ? tt * 11 : undefined, eyes: 'open', mouth: 'grin', look: [0.4, -0.2], armL: tt > t.partsW && u < 0.05 ? { x: -2.4, z: 0.4, el: 1.5 } : undefined });
    }
    if (tt < PILE_AT + 0.05) { // sucked into the pile with the parts
      const u = smooth(u01(tt, PILE_IN, PILE_AT)); return g.set({ ...base, x: lerp(D.st.gary - 0.9, PILE.x - 0.1, u), y: 0.6 * Math.sin(u * PI), z: lerp(-1.6, PILE.z, u), rx: u * 6, eyes: 'wide', mouth: 'scream', brows: 1, armL: { x: -2.8, z: 0.6 }, armR: { x: -2.8, z: 0.6 } }); }
    if (tt < PILE_BACK + 0.05) return hide(g);   // inside the pile
    if (tt < ORN) { // the parts leave: Gary is the last thing in the pile spot — dazed, then a "?"
      dizzy.update(tt, 1 - u01(tt, PILE_BACK + 0.6, ORN), [PILE.x, 0.95, PILE.z]); qMark.visible = tt > t.pile2 - 0.2; qMark.position.set(PILE.x, 1.5, PILE.z); qMark.scale.setScalar(0.45 * pop(tt, t.pile2 - 0.2));
      return g.set({ ...base, x: PILE.x, y: 0, z: PILE.z, rotY: 0.1, legL: { x: -1.5, kn: 0.2 }, legR: { x: -1.5, kn: 0.2 }, squash: squash(tt, PILE_BACK + 0.05, 0.3), eyes: 'spiral', mouth: 'wavy', armL: { x: 0, z: 0.4 }, armR: { x: 0, z: 0.4 } }); }
    const HOODX = () => slotX(1, tt) + 1.25, HOODY = L.y + 0.92;
    if (tt < t.garys + 0.95) { // springs onto k1's hood and strikes the pose; turns gold; rides it to the robot station
      const [x, y, z] = tt < ORN + 0.3 ? hop(tt, ORN, ORN + 0.3, [PILE.x, 0, PILE.z], [HOODX(), HOODY, L.z], 1.1) : [HOODX(), HOODY, L.z];
      return g.set({ ...base, x, y, z, rotY: PI / 2 - 0.35, eyes: tt > ORN + 0.3 ? 'closed' : 'wide', mouth: 'smile', lean: -0.25, squash: squash(tt, ORN + 0.3, 0.2), armL: { x: 1.2, z: 0.35, el: 0.1 }, armR: { x: 1.2, z: 0.35, el: 0.1 }, head: { x: -0.25, y: 0, z: 0 }, tint: gold, glow: tt > ORN + 0.3 ? [0xf2c418, 0.25] : undefined });
    }
    const BS = [D.robot - 0.1, -1.95];   // the bolt spot in front of the hero car's near door
    if (tt < t.falls - 0.1) { // hops off, wrench, one bolt all day (the cars rush past)
      wrench.visible = tt > t.garys + 1.2; const [x, y, z] = hop(tt, t.garys + 0.95, t.garys + 1.3, [HOODX(), HOODY, L.z], [BS[0], 0, BS[1]], 0.4); const ph = tt * 20;
      return g.set({ ...base, x, y, z, rotY: 1.15, eyes: 'half', mouth: 'flat', brows: -0.4, lean: 0.25, armR: { x: -1.5, z: 0.15 + 0.3 * Math.sin(ph), el: 0.8 + 0.3 * Math.cos(ph) } });
    }
    const CS = [CR[0] - 0.75, CR[1] - 0.05];
    if (tt > t.soR - 0.05 && tt < t.called) { // jolts awake ("So you buy"), dashes to the crate, rips it open, bolts the robot down, walks back
      wrench.visible = tt > t.arms;
      if (tt < t.robot) { const u = smooth(u01(tt, t.soR - 0.05, t.robot)); return g.set({ ...base, x: lerp(BS[0], CS[0], u), y: 0.15 * Math.sin(PI * u), z: lerp(-2.12, CS[1], u), rotY: PI / 2 - 0.3, walk: tt * 16, eyes: 'wide', mouth: 'o', brows: 1, squash: squash(tt, t.soR, 0.3), hairUp: 0.4 }); }
      if (tt < t.sleep) { const rip = tt < t.arms + 0.15, ph = tt * 22; return g.set({ ...base, x: CS[0], y: 0, z: CS[1], rotY: PI / 2 - 0.55, eyes: 'wide', mouth: rip ? 'teeth' : 'grin', brows: rip ? -0.8 : 0, lean: 0.25,
        armR: rip ? { x: -2.0, z: 0.5, el: 0.4 } : { x: -1.3, z: 0.15 + 0.3 * Math.sin(ph), el: 0.8 }, armL: rip ? { x: -2.0, z: 0.5, el: 0.4 } : { x: -0.9, z: 0.3, el: 0.6 }, squash: squash(tt, t.arms, 0.25) }); }
      const u = smooth(u01(tt, t.sleep, t.called - 0.1)); return g.set({ ...base, x: lerp(CS[0], BS[0], u), y: 0, z: lerp(CS[1], -2.12, u), rotY: u < 1 ? -PI / 2 : 0.1, walk: u < 1 ? tt * 10 : undefined, eyes: 'half', mouth: 'smile' });
    }
    if (tt < WELD - 0.05) { // turns, leans back on the door, nods off (ZZZ)
      wrench.visible = true; const sl = tt > t.called ? smooth(u01(tt, t.called, t.industrial + 0.3)) : smooth(u01(tt, t.falls - 0.1, t.asleep + 0.2)), nod = sl * (0.25 + 0.1 * Math.sin(tt * 2.2));
      return g.set({ ...base, x: BS[0], y: 0, z: lerp(BS[1], -2.12, sl), rotY: lerp(PI - 0.25, 0.1, sl), eyes: sl > 0.6 ? 'closed' : 'half', mouth: sl > 0.6 ? 'o' : 'flat', lean: -0.12 * sl, head: { x: nod, y: 0, z: 0.15 * sl }, armR: { x: 0, z: 0.15 }, armL: { x: 0, z: 0.15 } });
    }
    if (tt < t.doorW + 0.1) { // welded: wakes up, pulls — stuck
      wrench.visible = true; const woke = tt > t.garyW - 0.1, pull = woke ? Math.max(0, Math.sin((tt - t.garyW) * 9)) : 0;
      return g.set({ ...base, x: BS[0], y: 0, z: -2.12, rotY: 0.1, eyes: woke ? 'wide' : 'closed', mouth: woke ? 'scream' : 'o', brows: woke ? 1 : 0, lean: 0.25 * pull, squash: [1 - 0.05 * pull, 1 + 0.08 * pull], armL: woke ? { x: -1.8, z: 0.7, el: 0.3 } : { x: 0, z: 0.15 }, armR: woke ? { x: -1.8, z: 0.7, el: 0.3 } : { x: 0, z: 0.15 }, hairUp: woke ? 0.3 : 0 });
    }
    // welded to the hero car's near door: rides with it (line → hoist → bath → back)
    if (tt < UNWELD) {
      const hc = lineCars[HERO % NPOOL].g.position, under = tt > DIP0 + 0.1 && tt < OUT0 + 0.3, drag = tt < t.soE ? Math.sin(tt * 14) : 0;
      const zapX = tt > t.electrified && tt < t.electrified + 0.55 && Math.floor((tt - t.electrified) * 10) % 2 === 0;
      return g.set({ ...base, x: hc.x - 0.1, y: hc.y - L.y, z: hc.z + 0.98, rotY: 0.1, eyes: 'wide', mouth: under ? 'o' : tt > t.rustproof ? 'grin' : 'scream', brows: 1, tint: tt > OUT0 ? [0x7d858e, 0.75] : tint, xray: zapX, hairUp: tt > t.electrified ? 1 : 0,
        legL: { x: 0.3 * drag, kn: 0.2 }, legR: { x: -0.3 * drag, kn: 0.2 }, armL: { x: -2.4 + 0.5 * Math.sin(tt * 11), z: 0.8 }, armR: { x: -2.4 + 0.5 * Math.sin(tt * 11 + 2), z: 0.8 }, faceTint: under ? [0x6fb7ff, 0.25] : undefined });
    }
    if (tt < AVA0 + 0.25) { // pops off the door (grey, rustproof), walks to the dock to see the parts
      const p0 = [29.65, -1.9 + 0.0], u = smooth(u01(tt, UNWELD, t.arrive)), x = lerp(p0[0], GBUR[0], u), z = lerp(-2.12, GBUR[1], u);
      return g.set({ ...base, x, y: 0, z, rotY: u < 1 ? PI / 2 : 0.4, walk: u > 0 && u < 1 ? tt * 11 : undefined, tint, squash: squash(tt, UNWELD, 0.3), eyes: tt > t.once - 0.2 ? 'wide' : 'open', mouth: tt > t.once - 0.2 ? 'scream' : 'smile', look: [0.5, 0.4] });
    }
    if (tt < DRAIN0 + 0.5) { // buried: only his hand (and a hard hat) out of the heap, waving
      return g.set({ ...base, x: GBUR[0], y: -0.15, z: GBUR[1], rotY: 0.2, tint, eyes: 'wide', mouth: 'o', armR: { x: -3.0, z: 0.25 + 0.25 * Math.sin(tt * 10), el: 0.2 }, armL: { x: 0, z: 0.3 } });
    }
    if (tt < t.toyota + 0.3) { // revealed sitting on the buried tugger, dizzy; then drives it along the line, steering with the loose wheel, and tosses parts in just in time
      handWheel.visible = tt < t.jitW; dizzy.update(tt, 1 - u01(tt, DRAIN1 + 0.6, t.needed - 0.3), [tug.g.position.x - 0.05, 1.75, tug.g.position.z]);
      const toss = (tt > t.needed - 0.15 && tt < t.needed + 0.2) || (tt > t.jitW - 0.15 && tt < t.jitW + 0.2);
      return g.set({ ...base, x: tug.g.position.x - 0.05, y: 0.23, z: tug.g.position.z, rotY: PI / 2 - 0.6, tint, legL: { x: -1.5, kn: 1.3 }, legR: { x: -1.5, kn: 1.3 }, eyes: tt < t.needed - 0.3 ? 'spiral' : toss ? 'wide' : 'open', mouth: tt < t.needed - 0.3 ? 'wavy' : 'grin',
        armL: toss ? { x: -2.6, z: -0.2, el: 0.2 } : { x: -1.4, z: 0.2, el: 0.6 }, armR: { x: -1.4, z: 0.2, el: 0.6 } });
    }
    // to crash car 1 (the dummy: targets on his temples) and in
    const SEAT = () => { const p = crash1.g.position; return [p.x - 0.28, p.y + 0.17, p.z + 0.34]; };
    if (tt < t.safe - 0.35) { const u = smooth(u01(tt, t.toyota + 0.3, t.safe - 0.7)), [sx, sy, sz] = SEAT(), [tx0, tz0] = [TUG1[0] + 0.3, TUG1[1] + 0.5];
      if (u < 1) return g.set({ ...base, x: lerp(tx0, sx - 0.2, u), y: 0, z: lerp(tz0 - 0.45, sz + 1.0, u), rotY: PI / 2, walk: tt * 12, tint, eyes: 'open', mouth: 'flat' });
      const [x, y, z] = hop(tt, t.safe - 0.7, t.safe - 0.35, [sx - 0.2, 0, sz + 1.0], [sx, sy, sz], 0.6); return g.set({ ...base, x, y, z, rotY: PI / 2, tint, eyes: 'open', mouth: 'flat' }); }
    if (tt < HIT1) { const [sx, sy, sz] = SEAT(); return g.set({ ...base, x: sx, y: sy, z: sz, rotY: PI / 2 - 0.4, tint, eyes: tt > L1 ? 'wide' : 'open', mouth: tt > L1 ? 'scream' : 'grin', brows: tt > L1 ? 1 : 0, legL: { x: -1.5, kn: 1.4 }, legR: { x: -1.5, kn: 1.4 }, armR: tt < L1 ? { x: -2.6, z: 0.3, el: 0.6 } : { x: -1.3, z: 0.1, el: 0.4 }, hairUp: tt > L1 ? 0.5 : 0 }); }
    const WALLX = C.wall - 0.12, SPL = HIT1 + 0.22;
    if (tt < SPL) { const [sx, sy, sz] = SEAT(), u = u01(tt, HIT1, SPL); return g.set({ ...base, x: lerp(sx, WALLX - 0.2, u), y: sy + 0.9 * Math.sin(u * PI * 0.8), z: lerp(sz, -0.3, u), rotY: PI / 2, rx: 0, rz: -1.2 * u, tint, eyes: 'wide', mouth: 'scream', armL: { x: -3.0, z: 0.4 }, armR: { x: -3.0, z: 0.4 } }); }
    if (tt < t.garyX2) { // splat on the wall (face to the lens), slides down
      const sl = smooth(u01(tt, t.dummy - 0.25, t.dummy + 0.4));
      return g.set({ ...base, x: WALLX - 0.18, y: lerp(0.95, 0.0, sl), z: -0.3, rotY: -0.25, rz: 0, squash: [1.35, 0.8], tint, eyes: 'x', mouth: 'flat', armL: { x: 0, z: 2.4 }, armR: { x: 0, z: 2.4 }, legL: { x: 0, z: -0.45 }, legR: { x: 0, z: 0.45 } });
    }
    if (tt < t.not + 0.35) { dizzy.update(tt, 1, [WALLX - 1.05, 0.35, -0.2]); // flat on the floor at the wall's foot, in front of the car
      const peel = smooth(u01(tt, t.not + 0.05, t.not + 0.35));
      return g.set({ ...base, x: WALLX - 1.05, y: lerp(-0.36, 0, peel), z: -0.2, rx: lerp(-PI / 2 + 0.05, 0, peel), rotY: -PI / 2, tint, eyes: 'x', mouth: 'wavy', armL: { x: -0.2, z: 1.3 }, armR: { x: -0.2, z: 1.3 } }); }
    const SEAT2 = SEAT, NOSE = () => [crash1.g.position.x + 1.9, 0, C.z + 0.95];
    if (tt < t.can + 0.45) { // peels up, limps after the winched car, slaps the striped nose on ("front"), squeezes it like a soda can
      const u = smooth(u01(tt, t.not + 0.35, t.front - 0.1)), [nx, , nz] = NOSE(), slap = tt > t.front - 0.15 && tt < t.front + 0.1, sq = tt > t.fold - 0.05;
      return g.set({ ...base, x: lerp(WALLX - 1.05, nx, u), y: 0, z: lerp(-0.2, nz, u), rotY: u < 1 ? -PI / 2 : -PI / 2 + 0.9, walk: u > 0 && u < 1 ? tt * 9 : undefined, walkAmt: 0.7, lean: sq ? 0.45 : 0.2, tint, eyes: sq ? 'wide' : 'half', mouth: sq ? 'teeth' : 'wavy', brows: sq ? -1 : 0,
        armR: slap ? { x: -2.2, z: 0.2, el: 0.2 } : sq ? { x: -1.5, z: 0.1, el: 0.2 } : undefined, armL: sq ? { x: -1.5, z: 0.1, el: 0.2 } : undefined, squash: squash(tt, t.front, 0.15) }); }
    if (tt < L2 - 0.15) { const [nx, , nz] = NOSE(), [sx, sy, sz] = SEAT2(), [x, y, z] = hop(tt, t.can + 0.45, L2 - 0.15, [nx, 0, nz], [sx, sy, sz], 0.7); return g.set({ ...base, x, y, z, rotY: PI / 2, tint, eyes: 'open', mouth: 'grin' }); }
    if (tt < t.garyX3 - 0.1) { const [sx, sy, sz] = SEAT2(), jolt = tt > HIT2 ? 0.25 * Math.exp(-(tt - HIT2) * 6) * Math.sin((tt - HIT2) * 20) : 0;
      return g.set({ ...base, x: sx + jolt, y: sy, z: sz, rotY: PI / 2 - 0.4, lean: jolt, tint, eyes: tt > L2 ? 'wide' : 'half', mouth: tt > HIT2 + 0.3 ? 'o' : 'scream', brows: 1, legL: { x: -1.5, kn: 1.4 }, legR: { x: -1.5, kn: 1.4 }, armL: { x: -1.3, z: 0.1, el: 0.4 }, armR: { x: -1.3, z: 0.1, el: 0.4 } }); }
    const OUTP = [HIT_X - 0.55, 0, C.z + 1.05];
    if (tt < BAG) { // climbs out fine, a thumbs-up to the lens, then leans in over the door to pat the steering wheel …
      const [sx, sy, sz] = SEAT2(), [x, y, z] = hop(tt, t.garyX3 - 0.1, t.walks + 0.1, [sx, sy, sz], OUTP, 0.5), pat = tt > BAG - 0.45;
      return g.set({ ...base, x, y, z, rotY: pat ? PI - 0.6 : 0.25, lean: pat ? 0.55 : 0, tint, eyes: 'open', mouth: 'grin', armR: pat ? { x: -1.9, z: 0.2, el: 0.3 + 0.3 * Math.sin(tt * 18) } : tt > t.away ? { x: -1.4, z: 0.6, el: 1.8 } : undefined, squash: squash(tt, t.walks + 0.1, 0.2) }); }
    const shipSeat = () => { const c = lineCars[KSHIP % NPOOL]; c.g.updateMatrixWorld(true); return c.g.localToWorld(v3.set(-0.28, 0.17, 0.34)).clone(); };
    if (tt < LANDQ) { // the airbag goes off: launched straight up out of the frame … and down into a car on its way out
      const up = u01(tt, BAG, BAG + 0.6), ss = shipSeat();
      const x = up < 1 ? lerp(OUTP[0], OUTP[0] + 0.8, up) : lerp(OUTP[0] + 0.8, ss.x, u01(tt, BAG + 0.6, LANDQ)), z = up < 1 ? OUTP[2] : lerp(OUTP[2], ss.z, u01(tt, BAG + 0.6, LANDQ));
      const y = up < 1 ? 9 * (1 - (1 - up) ** 2) : lerp(9, ss.y, smooth(u01(tt, BAG + 0.6, LANDQ)) ** 1.6);
      return g.set({ ...base, x, y, z, rx: (tt - BAG) * 7, tint, eyes: 'wide', mouth: 'scream', brows: 1, hatLift: 1, armL: { x: -2.8, z: 0.6 }, armR: { x: -2.8, z: 0.6 } }); }
    if (tt < HOPQ) { const ss = shipSeat(), c = lineCars[KSHIP % NPOOL]; // rides out of the end door, waving for help
      return g.set({ ...base, x: ss.x, y: ss.y, z: ss.z, rotY: PI / 2 + c.g.rotation.y - 0.7, squash: squash(tt, LANDQ, 0.35), tint, eyes: 'wide', mouth: 'scream', brows: 1, hatLift: 1 - smooth(u01(tt, LANDQ, LANDQ + 0.5)), legL: { x: -1.5, kn: 1.3 }, legR: { x: -1.5, kn: 1.3 }, armR: { x: -2.9, z: 0.4 + 0.3 * Math.sin(tt * 12), el: 0.2 } }); }
    if (tt < STAMP2 + 0.9) { // hops out on the road, walks back in through the end door to the QC gate: REJECTED. Twice.
      const [x0, y0, z0] = SHIPOUT, inT = t.inspector - 0.15, door = [D.hall.x1 + 0.5, -2.1];
      if (tt < HOPQ + 0.35) { const [x, y, z] = hop(tt, HOPQ, HOPQ + 0.35, [x0, y0, z0], [x0 - 0.6, 0, z0], 0.5); return g.set({ ...base, x, y, z, rotY: -PI / 2, tint, eyes: 'open', mouth: 'flat' }); }
      if (tt < inT) { const u = u01(tt, HOPQ + 0.35, inT), m = u < 0.55 ? 0 : 1, v = m ? (u - 0.55) / 0.45 : u / 0.55, a = m ? door : [x0 - 0.6, z0], b = m ? GQ : door;
        return g.set({ ...base, x: lerp(a[0], b[0], v), y: 0, z: lerp(a[1], b[1], v), rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), walk: tt * 11, tint, eyes: 'open', mouth: 'smile' }); }
      const st = tt > STAMP2 - 0.05 ? 2 : tt > STAMP - 0.05 ? 1 : 0;
      return g.set({ ...base, x: GQ[0], y: 0, z: GQ[1], rotY: -0.6, squash: st === 2 ? squash(tt, STAMP2, 0.3) : squash(tt, STAMP, 0.3), tint, eyes: st ? 'half' : 'open', mouth: st ? 'frown' : 'smile', brows: st ? -1 : 0.3, hatLift: 0 });
    }
    // the ending: picks up the Roomba, crosses the (stopped) line in a gap, carries it up the stairs to the corner office,
    // sets it on the desk, then vacuums the CEO's office
    const pth = endPath(tt), carrying = tt > EP.pick + 0.25 && tt < EP.desk + 0.1;
    if (tt < EP.desk + 0.1) return g.set({ ...base, x: pth[0], y: pth[1], z: pth[2], rotY: pth[3], walk: pth[4] ? tt * 11 : undefined, tint, eyes: 'half', mouth: 'flat', brows: -0.3,
      lean: tt > EP.pick - 0.1 && tt < EP.pick + 0.25 ? 0.6 : 0, armL: carrying ? { x: -1.5, z: 0.25, el: 0.9 } : undefined, armR: carrying ? { x: -1.5, z: 0.25, el: 0.9 } : undefined });
    const sweep = Math.sin(tt * 4);
    return g.set({ ...base, x: EP.vac[0] + 0.22 * sweep, y: OF.y, z: EP.vac[2], rotY: 0.45, tint, eyes: 'half', mouth: 'frown', brows: -0.8, armR: { x: -1.0, z: 0.1, el: 0.6 }, armL: { x: -1.0, z: 0.1, el: 0.6 }, walk: tt * 6, walkAmt: 0.4 });
  }
  // the ending route (waypoints [t, x, y, z]); the stairs climb +x from (OF.x0 − 2.6, −5.3) to the office floor
  const EP = { leave: t.end + 0.5, pick: t.end + 1.2, desk: t.n53 + 0.1, vac: [S.office.desk.position.x - 0.9, OF.y, S.office.desk.position.z + 1.05] };
  const ROUTE = [[EP.leave, GQ[0], 0, GQ[1]], [EP.pick, D.qc.x - 1.15, 0, D.qc.z], [EP.pick + 0.25, D.qc.x - 1.15, 0, D.qc.z], [t.didnt + 0.2, GAPX, 0, -2.05], [t.pay + 0.6, GAPX, 0, -4.55],
    [t.dollars2 - 0.3, OF.x0 - 2.75, 0, -5.3], [t.n76 - 0.1, OF.x0 + 0.1, OF.y, -5.3], [EP.desk - 0.35, EP.vac[0] + 0.3, OF.y, EP.vac[2] - 0.15], [EP.desk, EP.vac[0] + 0.3, OF.y, EP.vac[2] - 0.15]];
  function endPath(tt) {
    let i = 0; while (i < ROUTE.length - 2 && tt > ROUTE[i + 1][0]) i++;
    const [a0, x0, y0, z0] = ROUTE[i], [a1, x1, y1, z1] = ROUTE[i + 1], u = u01(tt, a0, a1), moving = u > 0 && u < 1 && Math.hypot(x1 - x0, z1 - z0) > 0.1;
    return [lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u), moving ? Math.atan2(x1 - x0, z1 - z0) : 0.4, moving];
  }
  function mechAt(tt) {
    const m = mech; m.root.visible = true; invoice.visible = false; invoice2.visible = false;
    if (tt < t.soH - 0.25) { // holds up the invoice; it unrolls to the floor on "900"; thumbs back at your car on "fix your car"
      invoice.visible = true; const un = easeOutBack(u01(tt, t.n900 - 0.15, t.n900 + 0.25), 1.6), point = tt > t.fix - 0.1;
      m.set({ x: 3.15, y: 0, z: -1.25, rotY: -0.8, t: tt, eyes: 'half', mouth: 'grin', brows: -0.5, armR: { x: -0.7, z: 1.25, el: 0.2 }, armL: point ? { x: 0.6, z: 1.2, el: 1.2 } : { x: 0, z: 0.2 }, head: { x: 0, y: point ? 0.6 : 0, z: 0 } });
      m.root.updateMatrixWorld(true); m.hand(1).getWorldPosition(v3); invoice.position.set(v3.x, v3.y - 0.35 * un + 0.05, v3.z + 0.05); invoice.scale.set(1, Math.max(0.1, un * 1.6), 1); invoice.rotation.y = -0.6;
      return;
    }
    if (tt < t.garage + 1.0) { const bed = [towX(tt) - 0.6, 1.0, -2.55], [x, y, z] = tt < t.soH + 0.35 ? hop(tt, t.soH - 0.25, t.soH + 0.35, [3.15, 0, -1.25], [towX(t.soH + 0.35) - 0.6, 1.0, -2.55], 0.5) : bed;   // hops onto the tow truck's bed and rides off with your car, waving the invoice
      invoice.visible = true; m.set({ x, y, z, rotY: -0.3, t: tt, eyes: 'half', mouth: 'grin', armR: { x: -2.7, z: 0.5 + 0.3 * Math.sin(tt * 9), el: 0.2 } }); m.root.updateMatrixWorld(true); m.hand(1).getWorldPosition(v3); invoice.position.set(v3.x, v3.y - 0.4, v3.z + 0.05); invoice.scale.set(1, 1.6, 1); return; }
    if (tt < t.end + 1) return hide(m);
    // the shop: asleep by the lift, wakes on "shop", swaps the price to $1,400 with a grin
    const awake = tt > t.shop - 0.3, flip = tt > t.n1400 - 0.4 && tt < t.n1400 + 0.3;
    m.set({ x: D.shop.x0 + 1.55, y: 0, z: -1.7, rotY: awake ? 0.35 : 0.1, t: tt, eyes: awake ? (tt > t.n1400 ? 'half' : 'open') : 'closed', mouth: awake ? 'grin' : 'o', brows: tt > t.n1400 ? -0.6 : 0, head: { x: awake ? 0 : 0.35, y: 0, z: 0 },
      armR: flip ? { x: -2.9, z: 0.6, el: 0.4 } : tt > t.n1400 ? { x: -1.6, z: 0.35, el: 0.6 } : { x: 0, z: 0.2 }, armL: { x: 0, z: 0.2 } });
    if (tt > t.n1400 + 0.2) { invoice2.visible = true; m.root.updateMatrixWorld(true); m.hand(1).getWorldPosition(v3); const un = easeOutBack(u01(tt, t.n1400 + 0.2, t.n1400 + 0.6), 1.6) + 1.4 * smooth(u01(tt, t.n1400 + 0.6, t.n1400 + 1.6)); invoice2.position.set(v3.x - 0.05, v3.y - 0.35 * un + 0.05, v3.z + 0.08 + 0.1 * un); invoice2.scale.set(1, Math.max(0.1, un * 1.6), 1); invoice2.rotation.y = -0.3; }   // it unrolls to the floor
  }
  // the neighbours: a queue outside the garage waving cash → the line crew (A body, B doors, C paint, D the JIT station); the
  // white-shirt neighbour walks off down the hall to become the QC inspector
  function crewAt(tt) {
    const Q = [[0.4, -2.0], [1.1, -2.6], [1.8, -3.2], [2.5, -3.8], [3.2, -4.4]], STN = [[D.st.body, D.work], [D.st.doors, D.work], [D.st.paint, D.work], [D.jit, D.work], [D.qc.x - 0.05, D.qc.z]];
    crew.forEach((c, i) => {
      cash[i].visible = tt < t.roll; c.root.visible = tt > t.now - 0.3;
      if (!c.root.visible) return;
      const base = { t: tt, eyes: 'open', mouth: 'smile' };
      if (tt < t.roll) { const wave = Math.sin(tt * 10 + i), tap = tt > t.alone - 0.2; return c.set({ ...base, x: Q[i][0], y: 0, z: Q[i][1], rotY: -PI / 2 + 0.5, mouth: tap ? 'frown' : 'grin', brows: tap ? -0.7 : 0, armR: tap ? { x: -1.5, z: 0.2, el: 1.6 } : { x: -2.6 + 0.3 * wave, z: 0.4, el: 0.5 }, armL: tap ? { x: -1.6, z: -0.3, el: 1.5 } : { x: 0, z: 0.2 }, squash: [1, 1 + 0.03 * Math.abs(wave)] }); }
      const walkEnd = t.roll + 0.8 + Math.abs(STN[i][0] - Q[i][0]) / 2.8;
      if (tt < walkEnd && i !== 4) { const u = smooth(u01(tt, t.roll + 0.2, walkEnd)), far = i >= 3, AISLE = -6.3; const z = far ? (u < 0.1 ? lerp(Q[i][1], AISLE, u / 0.1) : u > 0.92 ? lerp(AISLE, STN[i][1], (u - 0.92) / 0.08) : AISLE) : lerp(Q[i][1], STN[i][1], smooth(clamp(u * 3)));
        return c.set({ ...base, x: lerp(Q[i][0], STN[i][0], u), y: 0, z, rotY: STN[i][0] > Q[i][0] ? PI / 2 : -PI / 2, walk: tt * 12 }); }
      const [x, z] = STN[i];
      if (i === 4 && tt < t.thenQ) { // off down the back aisle and out of the end door (he's out on the road until the QC)
        const AIS = -6.3, D0 = [D.hall.x1 - 0.8, AIS], D1 = [D.hall.x1 + 0.6, -3.4], D2 = [D.road, -14];
        const tA = t.roll + 0.8 + (D0[0] - Q[i][0]) / 2.8, u = u01(tt, t.roll + 0.2, tA);
        if (tt < tA) return c.set({ ...base, x: lerp(Q[i][0], D0[0], u), y: 0, z: u < 0.06 ? lerp(Q[i][1], AIS, u / 0.06) : AIS, rotY: PI / 2, walk: tt * 12 });
        const v = u01(tt, tA, tA + 4.5), pts = v < 0.3 ? [D0, D1, v / 0.3] : [D1, D2, (v - 0.3) / 0.7];
        if (v >= 1) return hide(c);
        return c.set({ ...base, x: lerp(pts[0][0], pts[1][0], pts[2]), y: 0, z: lerp(pts[0][1], pts[1][1], pts[2]), rotY: Math.atan2(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), walk: tt * 12 }); }
      if (i === 4 && tt < t.check - 0.2) { const u = smooth(u01(tt, t.thenQ, t.check - 0.2)), door = [D.hall.x1 + 0.6, -2.1];   // back in through the end door to the QC gate
        return c.set({ ...base, x: lerp(door[0], x, u), y: 0, z: lerp(door[1], z, u), rotY: -PI / 2, walk: tt * 11, mouth: 'flat' }); }
      if (i === 4) { // the inspector: clipboard, looks Gary over, stamps him
        const stamp = (tt > STAMP - 0.25 && tt < STAMP + 0.25) || (tt > STAMP2 - 0.25 && tt < STAMP2 + 0.25), look = tt > t.check && tt < t.end;
        return c.set({ ...base, x, y: 0, z, rotY: look ? 1.0 : 0.3, eyes: look ? 'half' : 'open', mouth: look ? 'flat' : 'smile', brows: look ? -0.6 : 0, armL: { x: -1.5, z: 0.2, el: 1.3 }, armR: stamp ? { x: -1.9 + 0.7 * Math.sin(PI * u01(tt, (tt < STAMP2 - 0.25 ? STAMP : STAMP2) - 0.25, (tt < STAMP2 - 0.25 ? STAMP : STAMP2) + 0.25)), z: -0.1, el: 0.9 } : { x: -0.6, z: 0.2, el: 0.6 } });
      }
      // a job each: A + B swing hammers (body / doors), C sprays, D sorts parts; they cheer on the ending
      const cheer = tt > t.end && tt < t.factory + 0.6, ph = tt * (8 + i) + i;
      if (cheer) return c.set({ ...base, x, y: 0, z, rotY: 0, mouth: 'grin', armL: { x: -2.8, z: 0.3 }, armR: { x: -2.8, z: 0.3 } });
      return c.set({ ...base, x, y: 0, z, rotY: 0.15 * Math.sin(tt * 0.7 + i), eyes: 'open', mouth: 'smile', lean: 0.2, armR: { x: -1.6 + 0.6 * Math.sin(ph), z: 0.2, el: 0.5 }, armL: { x: -1.2, z: 0.25, el: 0.7 } });
    });
    sprayGun.visible = tt > t.roll;
  }
  // the Roomba: cleans the garage → pulls the line's rope (supervisor's hard hat on "promoted") → MY IDEA easel + tie on
  // "manager" → waves the crash test's chequered flag → carried up to the corner office: CEO (top hat + tie)
  function roombaAt(tt) {
    rope.visible = false; easel.visible = false; vac.visible = false;
    shoe.visible = tt > PILE_BACK && tt < t.pile2 + 0.3; if (shoe.visible) { const k = 1 - smooth(u01(tt, t.pile2 - 0.05, t.pile2 + 0.3)); shoe.position.set(PILE.x + 0.55 + 0.25 * (1 - k), 0.05, PILE.z + 0.15); shoe.scale.setScalar(Math.max(0.01, k)); shoe.rotation.y = 0.6 + (1 - k) * 6; }
    const acc = { badge: tt > t.promoted - 0.05 && tt < t.end ? Math.max(0.001, pop(tt, t.promoted - 0.05)) : 0, tie: tt > t.manager - 0.05 ? Math.max(0.001, pop(tt, t.manager - 0.05)) : 0, hat: tt > EP.desk + 0.45 ? Math.max(0.001, pop(tt, EP.desk + 0.45)) : 0, flag: tt > t.manager + 0.7 && tt < t.fold ? 1 : 0, t: tt };
    roomba.g.position.y = 0;
    if (tt < t.roll - 0.2) { // cleaning the garage floor: a lazy figure-eight, bumping the junk car
      const a = tt * 0.9, x = -2.0 + 0.55 * Math.sin(a), z = -0.75 + 0.35 * Math.sin(2 * a), dx = 0.55 * Math.cos(a), dz = 0.7 * Math.cos(2 * a);
      const toStart = smooth(u01(tt, t.alone - 0.6, t.roll - 0.2));
      return roomba.set({ scale: RS, ...acc, x: lerp(x, L.x0 + 2.75, toStart), z: lerp(z, L.z, toStart), rotY: lerp(-Math.atan2(dz, dx), 0, toStart) });
    }
    if (tt < t.promoted + 0.5) { // pulls the rope: 2.6 m ahead of the lead car
      const lead = Math.max(slotX(0, tt), L.x0 + 1.2), x = lead + 3.0, strain = tt > t.pulls - 0.1 && tt < t.rope + 0.4;
      roomba.set({ scale: RS, ...acc, x: x + (strain ? 0.02 * Math.sin(tt * 40) : 0), z: L.z, rotY: 0 }); roomba.g.position.y = L.y;
      rope.visible = true; const a = new THREE.Vector3(lead + 1.68, L.y + 0.42, L.z), b = new THREE.Vector3(x - 0.5, L.y + 0.15, L.z); rope.position.copy(a).add(b).multiplyScalar(0.5); rope.scale.set(1, a.distanceTo(b), 1); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return;
    }
    const P0 = [slotX(0, t.promoted + 0.5) + 3.0, L.z], SUP = [SUN + 1.4, -0.85];
    if (tt < t.pile2 - 0.3) { const u = smooth(u01(tt, t.promoted + 0.5, t.but + 0.5)); roomba.set({ scale: RS, ...acc, x: lerp(P0[0], SUP[0], u), z: lerp(P0[1], SUP[1], u), rotY: u < 1 ? PI * 0.8 : PI - 0.3 + 0.3 * Math.sin(tt) }); return; }   // supervises Gary's station
    const SHOE = [PILE.x + 0.55, PILE.z + 0.15];
    if (tt < t.garys) { const u = smooth(u01(tt, t.pile2 - 0.3, t.pile2 + 0.2)); roomba.set({ scale: RS, ...acc, x: lerp(SUP[0], SHOE[0] + 0.25, u), z: lerp(SUP[1], SHOE[1], u), rotY: PI }); return; }   // zips over and vacuums up Gary's shoe
    const RIDE = [21.1, L.z];   // the gap between two cars, between the robot arms
    if (tt < t.doorW + 0.1) { const u = smooth(u01(tt, t.garys, t.robot - 0.4)); roomba.set({ scale: RS, ...acc, x: lerp(SHOE[0] + 0.25, RIDE[0], u), z: lerp(SHOE[1], RIDE[1], u), rotY: 0.2 * Math.sin(tt * 3), blinkAt: WELD - 0.3 }); roomba.g.position.y = u >= 1 ? L.y : 0; return; }
    if (tt < t.soE + 0.1) { const x = RIDE[0] + (lineS(tt) - lineS(t.doorW + 0.1)); roomba.set({ scale: RS, ...acc, x, z: RIDE[1], rotY: 0 }); roomba.g.position.y = L.y; return; }   // rides the line on toward the rain
    const JZ_ = [D.jit + 3.9, -0.95];
    if (tt < t.manager + 0.7) { const u = smooth(u01(tt, t.soE + 0.1, t.roombaJ - 0.3)), x0 = RIDE[0] + (lineS(t.soE + 0.1) - lineS(t.doorW + 0.1)); roomba.set({ scale: RS, ...acc, x: lerp(x0, JZ_[0], u), z: lerp(L.z, JZ_[1], u), rotY: u < 1 ? 0 : -0.5 }); if (u < 0.05) roomba.g.position.y = L.y;
      if (tt > t.roombaJ - 0.5) { easel.visible = true; easel.position.set(JZ_[0] + 0.75, 0, JZ_[1] - 0.15); easel.rotation.y = -0.2; easel.scale.setScalar(pop(tt, t.roombaJ - 0.5)); } return; }
    const FLAG = [C.x0 + 0.3, 0.1];
    const WATCH = [D.qc.x - 1.4, D.qc.z + 0.05];
    if (tt < t.thenQ) { const u = smooth(u01(tt, t.manager + 0.7, t.safe + 0.2)); roomba.set({ scale: RS, ...acc, x: lerp(JZ_[0], FLAG[0], u), z: lerp(JZ_[1], FLAG[1], u), rotY: u < 1 ? 0 : 0.5, wave: tt > t.crashW - 0.3 && tt < t.wall ? 1 : 0 }); return; }
    if (tt < EP.pick + 0.25) { const u = smooth(u01(tt, t.thenQ, t.check)); roomba.set({ scale: RS, ...acc, x: lerp(FLAG[0], WATCH[0], u), z: lerp(FLAG[1], WATCH[1], u), rotY: u < 1 ? -0.6 : 0.4, blinkAt: STAMP2 + 0.2 }); return; }   // watches the QC (blinks at the second stamp)
    // carried by Gary (in his arms), set on the desk
    if (tt < EP.desk + 0.1) { gary.root.updateMatrixWorld(true); gary.hand(-1).getWorldPosition(v3); const h2 = gary.hand(1).getWorldPosition(new THREE.Vector3()); roomba.set({ scale: RS, ...acc, x: (v3.x + h2.x) / 2, z: (v3.z + h2.z) / 2 + 0.05, rotY: gary.root.rotation.y }); roomba.g.position.y = (v3.y + h2.y) / 2 - 0.05; return; }
    const dk = S.office.desk.position; const [x, y, z] = hop(tt, EP.desk + 0.1, EP.desk + 0.4, [dk.x - 0.6, OF.y + 0.9, dk.z + 0.7], [dk.x + 0.2, OF.y + 0.76 + 0.24, dk.z + 0.1], 0.3);   // onto its red cushion
    roomba.set({ scale: RS, ...acc, x, z, rotY: 0.2, blinkAt: t.roombaE + 0.3 }); roomba.g.position.y = y;
    vac.position.set(gary.root.position.x + 0.45, OF.y, gary.root.position.z + 0.35); vac.rotation.y = 0.5; vac.visible = tt > EP.desk + 0.1;
  }

  // QC (`node tools/render.mjs 026-garage-car-factory --qc`): every 0.25 s, project the tracked faces to the screen and list the
  // moments a caption/callout band covers them (copied from 024).
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.25) {
      update(tt);
      for (const [who, rig] of [['Gary', gary], ['the mechanic', mech]]) { if (!rig.root.visible) continue;
        rig.root.updateMatrixWorld(true); rig.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        if (story.words.some((w) => tt >= w.t0 && tt < w.t1)) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`); }
    }
    update(0); return out;
  };

  { lineCarsAt(HOPQ); const c = lineCars[KSHIP % NPOOL]; c.g.updateMatrixWorld(true); const w = c.g.localToWorld(new THREE.Vector3(-0.28, 0.17, 0.34)); SHIPOUT = [w.x, w.y, w.z]; }
  update(0);
  return { update };
}
