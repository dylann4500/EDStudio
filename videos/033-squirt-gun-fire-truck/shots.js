// 033 — "How a Squirt Gun Becomes a Fire Truck" (build genre, docs/BUILD.md). ONE continuous camera take over a front-yard
// cutaway (engine/build/firetruck.js): the ground is sliced at the curb, so the city water main and the hydrant's dry barrel are
// seen in section; the truck's near side is cut open, so the tank water (level ∩ tank) sloshes and the centrifugal pump spins in
// section. Gary builds every step and takes every failure; the CAT watches from its branch (≈ 20 ft up) the whole time; a
// Dalmatian turns up in the finishing list. Everything is keyed to the spoken word: W(beat, word) (story.json from
// tools/narrate.py), so re-voicing keeps every gag on its word.
// Continuity: one tote → booster tank (the wagon pancakes under it, the pancaked wagon springs it onto the flatbed); the flatbed
// is parked from frame 1 and drives 4 m to its spot (the brake = the surge); Gary's pants burn from the fireball until the dribble;
// one supply hose (truck intake → hydrant); the ladder rises, overshoots, tips the truck, then rests on the cat's branch;
// the cat climbs down by itself, the Dalmatian retracts the ladder, Gary is left on the branch, the cat eats the burgers.
//
// Facts (web-searched Oct 27 2026):
//   750 gal tank + 1,500 gpm pump: Pierce pumper for South Metro Fire Rescue (CO): Pierce PUC pump 1,500 gpm, 750-gal tank
//     (piercemfg.com new deliveries #30935); NFPA 1901 pumper minimum: ≥ 300-gal tank, ≥ 750-gpm pump. 750 / 1,500 = 30 s.
//   3 tons: 750 gal × 8.34 lb/gal (a US gallon of water ≈ 3.785 kg) = 6,255 lb ≈ 3.1 short tons.
//   Water on burning grease sinks, flashes to steam (~1,700×) and throws the burning oil = a fireball; cover it to cut the air
//     (ScienceABC; Lane Fire Authority via KVAL). The fire triangle: heat, fuel, oxygen.
//   Tank baffles / swash partitions stop the surge when braking (NFPA 1901 tank-baffle requirement; patent US4789170 quoting NFPA).
//   Centrifugal pump: the impeller flings water outward into the volute (Montgomery County MD FRS pump-operations module).
//   Deck gun / master stream: above ~350 gpm, nozzle reaction is too much for a handline (Fire Engineering).
//   Hydrant: the pentagon operating nut has no parallel sides, so ordinary wrenches can't turn it (tamper deterrent; Kennedy Valve
//     and tamper-resistant hydrant patents); the dry-barrel main valve sits below the frost line (Wikipedia "Fire hydrant").
//   100-ft aerial ladders; outriggers widen the base and lift the truck so it can't tip (IFSTA apparatus stabilization).
//   $2.2 M: Walla Walla (WA) council approved a $2.2 M Pierce 100-ft aerial ladder truck, March 2026 (Elkhorn Media Group).
//   "You never see a cat skeleton in a tree": firefighter saying (Bangor ME assistant chief; Straight Dope).
//   Dalmatians ran beside/ahead of horse-drawn engines and guarded the horses (FireRescue1; York County fire history).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, drop, squash, wobble, u01, easeOutBack, easeInQuad } from '@engine/build/anim.js';
import { makeFX, makeDizzy, makeArrows } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildYard, D, TANK, makeFireTruck, makeTank, makeFires, makeJet, makeHose, makeGrill, makeWagon, makeYardCat, makeDalmatian, makeTriangleSign, makeSquirtGun, makeNozzle, makeWrench } from '@engine/build/firetruck.js';

const PI = Math.PI, V = (x, y, z) => new THREE.Vector3(x, y, z);

export async function build(studio, story) {
  const S = await buildYard(studio), B = beatClock(story), scene = S.root;
  const W = (b, w, n) => B.W(b, w, n), T0 = (id) => B.T(id).t0, END = story.duration;
  const fx = makeFX(scene), fires = makeFires(scene);
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const font = (px) => `${px}px "Luckiest Guy", Arial Black`;
  const sprite = (txt, size = 0.5, color = '#fff') => { const t = tex(256, 256, (g) => { g.font = font(200); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 22; g.strokeStyle = '#1b1b1b'; g.strokeText(txt, 128, 140); g.fillStyle = color; g.fillText(txt, 128, 140); }); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(size); scene.add(sp); return sp; };

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    grill: W('hook', 'grill'), fireH: W('hook', 'fire'), squirt: W('hook', 'squirt'), gun: W('hook', 'gun'),
    congrats: W('congrats', 'congratulations'), built: W('congrats', 'built'), engine: W('congrats', 'engine'), holds: W('congrats', 'holds'), one: W('congrats', 'one'), cup: W('congrats', 'cup'), waterC: W('congrats', 'water'), catC: W('congrats', 'cat'), tree: W('congrats', 'tree'), impressed: W('congrats', 'impressed'),
    garyG: W('grease', 'gary'), squirts: W('grease', 'squirts'), grease: W('grease', 'grease'), fireball: W('grease', 'fireball'),
    waterT: W('triangle', 'water'), explode: W('triangle', 'explode'), needs: W('triangle', 'needs'), heat: W('triangle', 'heat'), fuel: W('triangle', 'fuel'), air: W('triangle', 'air'), slam: W('triangle', 'slam'), lid: W('triangle', 'lid'), calledT: W('triangle', 'called'), triangle: W('triangle', 'triangle'), nowT: W('triangle', 'now'), hedge: W('triangle', 'hedge'), fireT: W('triangle', 'fire', 3),
    waterK0: W('tank', 'water'), works: W('tank', 'works'), hedges: W('tank', 'hedges'), need: W('tank', 'need'), more: W('tank', 'more'), real: W('tank', 'real'), carries: W('tank', 'carries'), n750: W('tank', '750'), gallons: W('tank', 'gallons'), three: W('tank', 'three'), tons: W('tank', 'tons'), bye: Math.max(W('tank', 'bye'), W('tank', 'wagon')),
    soK: W('truck', 'so'), bolt: W('truck', 'bolt'), truckW: W('truck', 'truck'), thisK: W('truck', 'this'), booster: W('truck', 'booster'), tankK: W('truck', 'tank'), then: W('truck', 'then'), brake: W('truck', 'brake'), waterK: W('truck', 'water'), going: W('truck', 'going'), so2: W('truck', 'so', 2), garyK: W('truck', 'gary'),
    split: W('baffles', 'split'), walls: W('baffles', 'walls'), holes: W('baffles', 'holes'), baffles: W('baffles', 'baffles'), garys: W('baffles', 'garys'), pants: W('baffles', 'pants'), fireB: W('baffles', 'fire'),
    nowP: W('pump', 'now'), dribbles: W('pump', 'dribbles'), soP: W('pump', 'so'), addP: W('pump', 'add'), wheel: W('pump', 'wheel'), spins: W('pump', 'spins'), flings: W('pump', 'flings'), outP: W('pump', 'out'), centrifugal: W('pump', 'centrifugal'), n1500: W('pump', '1500'), minute: W('pump', 'minute'), garyP: W('pump', 'gary'), alone: W('pump', 'alone'), hose2: W('pump', 'hose', 2), garyP2: W('pump', 'gary', 2),
    realD: W('deckgun', 'real'), crew: W('deckgun', 'crew'), soD: W('deckgun', 'so'), boltD: W('deckgun', 'bolt'), nozzle: W('deckgun', 'nozzle'), roof: W('deckgun', 'roof'), deck: W('deckgun', 'deck'), gunD: W('deckgun', 'gun'),
    empties: W('hydrant', 'empties'), n30: W('hydrant', '30'), seconds: W('hydrant', 'seconds'), tap: W('hydrant', 'tap'), city: W('hydrant', 'city'), main: W('hydrant', 'main'), fireHy: W('hydrant', 'fire'), hydrant: W('hydrant', 'hydrant'), nut: W('hydrant', 'nut'), five: W('hydrant', 'five'), sides: W('hydrant', 'sides'), random: W('hydrant', 'random'), cant: W('hydrant', 'cant'), garyH: W('hydrant', 'gary'), person: W('hydrant', 'person'),
    withW: W('fireout', 'with'), right: W('fireout', 'right'), wrench: W('fireout', 'wrench'), fires: W('fireout', 'fires'), out: W('fireout', 'out'), secondsO: W('fireout', 'seconds'),
    but: W('ladder', 'but'), cats: W('ladder', 'cats'), there: W('ladder', 'there'), addL: W('ladder', 'add'), ladder1: W('ladder', 'ladder'), reaches: W('ladder', 'reaches'), n100: W('ladder', '100'), feet: W('ladder', 'feet'), aerial: W('ladder2', 'aerial'), catL: W('ladder2', 'cat'), twenty: W('ladder2', 'twenty'),
    itT: W('tip', 'it'), reachesT: W('tip', 'reaches'), outT: W('tip', 'out'), whole: W('tip', 'whole'), truckT: W('tip', 'truck'), tips: W('tip', 'tips'),
    addO: W('outriggers', 'add'), legs: W('outriggers', 'legs'), brace: W('outriggers', 'brace'), ground: W('outriggers', 'ground'), outriggers: W('outriggers', 'outriggers'), garyO: W('outriggers', 'gary'), under: W('outriggers', 'under'), oneO: W('outriggers', 'one'),
    addF: W('finish', 'add'), siren: W('finish', 'siren'), pole: W('finish', 'pole'), dalmatian: W('finish', 'dalmatian'), dalmatians: W('finish', 'dalmatians'), run: W('finish', 'run'), horses: W('finish', 'horses'), dont: W('finish', 'dont'), horses2: W('finish', 'horses', 2),
    garyR: W('rescue', 'gary'), climbs: W('rescue', 'climbs'), catR: W('rescue', 'cat'), firefighters: W('rescue', 'firefighters'), say: W('rescue', 'say'), never: W('rescue', 'never'), skeleton: W('rescue', 'skeleton'), treeR: W('rescue', 'tree'),
    end: W('end', 'congratulations'), truckE: W('end', 'truck'), wanted: W('end', 'wanted'), burgers: W('end', 'burgers'), nowE: W('end', 'now'), n22: W('end', '22'), dollars: W('end', 'dollars'), hedgeE: W('end', 'hedge'), charcoal: W('end', 'charcoal'), garyE: W('end', 'gary'), stuck: W('end', 'stuck'), treeE: W('end', 'tree'),
    catE: W('end2', 'cat'), ate: W('end2', 'ate'), burgers2: W('end2', 'burgers'),
  };
  const FB = t.fireball - 0.04;                           // the fireball
  const DRV0 = t.booster - 0.1, DRV1 = t.brake;            // the truck drives 4 m and brakes on "brake"
  const SPLAT = t.garyK - 0.02, FLY0 = Math.max(t.so2 - 0.1, SPLAT - 0.5);   // Gary flies off the tank top into the cab's back wall
  const SLAM = t.ground - 0.02;                            // the tail slams back down (outriggers)
  const SQUISH = t.oneO - 0.05;                            // the near rear jack lands on Gary
  const OPEN = t.wrench - 0.05;                            // the hydrant opens (the right wrench)
  const MEGA = OPEN + 0.25;                                // the deck gun's mega blast (fire out): a fast flat jet lands ~0.5 s later

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const cat = makeYardCat(); scene.add(cat.root); const CS = 1.25;
  const catBurger = new THREE.Group(); cat.head.add(catBurger); catBurger.position.set(0, -0.11, 0.2); catBurger.visible = false;
  mk(new THREE.SphereGeometry(0.06, 12, 8, 0, PI * 2, 0, PI / 2), mat(0xe0a95a, 0.6), catBurger, 0, 0.02, 0).scale.y = 0.7; mk(new THREE.CylinderGeometry(0.062, 0.062, 0.022, 12), mat(0x6b3b22, 0.8), catBurger, 0, 0.012, 0); mk(new THREE.CylinderGeometry(0.058, 0.058, 0.018, 12), mat(0xe0a95a, 0.6), catBurger, 0, -0.005, 0);
  const dog = makeDalmatian(); scene.add(dog.root);
  const truck = makeFireTruck(); scene.add(truck.g);
  const tank = makeTank(); scene.add(tank.g);
  const grill = makeGrill(); scene.add(grill.g); grill.g.position.set(D.grill.x, 0, D.grill.z);
  const wagon = makeWagon(); scene.add(wagon.g); wagon.g.position.set(D.wagon[0], 0, D.wagon[1]);
  const tri = makeTriangleSign(); scene.add(tri.g); const TRI = [-2.55, -5.15];
  const gun = makeSquirtGun(); gary.hand(1).add(gun.g); gun.g.rotation.set(0, 0, -PI / 2); gun.g.position.set(0, -0.04, 0.03);
  const noz = makeNozzle(); scene.add(noz.g);
  const gnoz = makeNozzle(); gnoz.g.scale.setScalar(0.55); scene.add(gnoz.g);   // the garden-hose nozzle
  const wrench = makeWrench(6); scene.add(wrench.g); const wrench5 = makeWrench(5); scene.add(wrench5.g);
  const hammer = new THREE.Group(); mk(new THREE.CylinderGeometry(0.02, 0.022, 0.34, 8), mat(0xb98a55, 0.7), hammer, 0, 0.12, 0); mk(new THREE.BoxGeometry(0.16, 0.06, 0.06), mat(0x555a60, 0.4), hammer, 0, 0.3, 0); hammer.rotation.x = 1.4; hammer.position.set(0, -0.02, 0.06); gary.hand(1).add(hammer);
  const dizzy = makeDizzy(scene);
  const pole = new THREE.Group(); scene.add(pole); mk(new THREE.CylinderGeometry(0.045, 0.045, 3.0, 14), new THREE.MeshStandardMaterial({ color: 0xe8c45a, roughness: 0.2, metalness: 0.85 }), pole, 0, 1.5, 0); mk(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 20), mat(0x2a2a2c, 0.6), pole, 0, 0.02, 0);
  const qMark = sprite('?', 0.55, '#ffd23f'); qMark.visible = false;
  const steamCol = 0xf2f4f6;
  // jets + hoses
  const squirtJet = makeJet(scene, { r: 0.014, drops: 16 }), gardenJet = makeJet(scene, { r: 0.03, drops: 20 }), lineJet = makeJet(scene, { r: 0.05 }), deckJet = makeJet(scene, { r: 0.085, drops: 60 });
  const gHose = makeHose(scene, { r: 0.03, color: 0x3fbf4f, seg: 40 }), lHose = makeHose(scene, { r: 0.055, color: 0xf4f1ea, seg: 36 }), sHose = makeHose(scene, { r: 0.075, color: 0xf2c418, seg: 36 });
  // fire sources: the grill, the hedge in 7 sections (it catches from behind the grill outward), Gary's pants
  fires.add('grill', { pos: [D.grill.x, 1.12, D.grill.z], box: [0.85, 0.05, 0.42], n: 34, size: 0.42, height: 0.85, smoke: 0.7 });
  const HX = [-12.4, -10.3, -8.2, -6.1, -4.0, -1.9, 0.2], HEDGE_Y = D.hedge.h - 0.05;
  HX.forEach((x, i) => fires.add('h' + i, { pos: [x, HEDGE_Y - 0.1, D.hedge.z + 0.25], box: [2.3, 0.2, 0.6], n: 48, size: 1.05, height: 2.0, smoke: 1, rate: 1.3 }));
  fires.add('pants', { pos: [0, 0, 0], box: [0.22, 0.05, 0.12], n: 18, size: 0.26, height: 0.45, rate: 2.4, smoke: 0.5 });
  fires.add('embers', { pos: [-6.2, HEDGE_Y - 0.05, D.hedge.z + 0.3], box: [13, 0.08, 0.5], n: 40, size: 0.11, height: 0.22, rate: 0.7 });   // the charcoal hedge keeps glowing
  fires.add('hedgeEmber', { pos: [-4.6, HEDGE_Y, D.hedge.z + 0.2], box: [1.6, 0.1, 0.5], n: 10, size: 0.3, height: 0.5, smoke: 0.4 });
  fires.fireball(FB, [D.grill.x, 1.75, D.grill.z + 0.1], 1.55, 1.0);
  fires.fireball(FB + 0.12, [D.grill.x - 0.5, 1.9, D.grill.z - 0.9], 0.9, 0.8);

  // ---------------------------------------------------------------- the truck: position, pitch, stages
  const TX0 = D.truck.tail0, TX1 = D.truck.tail, TZ = D.truck.z, FRONT_AX = -5.55;
  const truckX = (tt) => { if (tt < DRV0) return TX0; if (tt < DRV1) { const u = (tt - DRV0) / (DRV1 - DRV0); return TX0 - 3.4 * u * u * (1.6 - 0.6 * u); } return TX1 + 0.6 * Math.max(0, 1 - (tt - DRV1) / 0.35) ** 2; };
  const TIP0 = t.reachesT, TIPMAX = 0.36;
  const tipAngle = (tt) => {
    if (tt < TIP0) return 0;
    if (tt < t.brace + 0.2) { const u = u01(tt, TIP0, t.tips + 0.05); return TIPMAX * (u < 0.55 ? 0.12 * smooth(u / 0.55) : 0.12 + 0.88 * easeInQuad((u - 0.55) / 0.45)) + (tt > t.tips ? 0.025 * Math.sin((tt - t.tips) * 9) * Math.exp(-(tt - t.tips) * 1.5) : 0); }
    if (tt < SLAM) { const a0 = TIPMAX + 0.025 * Math.sin((t.brace + 0.2 - t.tips) * 9) * Math.exp(-(t.brace + 0.2 - t.tips) * 1.5); return a0 * (1 - easeInQuad(u01(tt, t.brace + 0.2, SLAM))); }
    return -0.012 * Math.sin((tt - SLAM) * 26) * Math.exp(-(tt - SLAM) * 7);
  };
  const diveAngle = (tt) => { const a = tt - DRV1; return a < 0 ? -0.025 * smooth(u01(tt, DRV0, DRV1)) : 0.07 * Math.exp(-a * 3.2) * Math.cos(a * 8.5); };   // squats while accelerating, dives on the brake
  const BODY0 = t.booster - 0.12, PUMP0 = t.addP - 0.05, DECK0 = t.nozzle - 0.15, LAD0 = t.addL - 0.05, OUT0 = t.legs - 0.12, SIR0 = t.siren - 0.08;
  const stageAt = (tt) => ({ body: easeOutBack(u01(tt, BODY0, BODY0 + 0.45), 1.6), pump: easeOutBack(u01(tt, PUMP0, t.wheel + 0.1), 2), deck: easeOutBack(u01(tt, DECK0, DECK0 + 0.35), 2.2), ladder: easeOutBack(u01(tt, LAD0, LAD0 + 0.4), 2), outr: tt > OUT0 ? 1 : 0, siren: easeOutBack(u01(tt, SIR0, SIR0 + 0.3), 2.4) });
  // ladder: (ext, yaw, elevation). The cat's branch tip: the ladder rests there for the rescue
  const PIV = V(TX1 - 4.0, D.truck.len ? 3.28 : 3.28, TZ), REST = V(-6.5, 6.05, -4.83);
  const dR = REST.clone().sub(PIV), REST_EL = Math.atan2(dR.y, Math.hypot(dR.x, dR.z)), REST_YAW = PI - Math.atan2(-dR.z, -dR.x), REST_EXT = clamp((dR.length() - 6.9) / 20.4);
  const RET0 = t.truckE - 0.35;                            // the Dalmatian hits the lever: the ladder pulls back
  const ladderAt = (tt) => {
    if (tt < t.ladder1) return [0, 0, -0.03];
    if (tt < t.reaches) { const u = u01(tt, t.ladder1, t.reaches); return [0, PI * smooth(clamp(u * 1.6 - 0.45)) - 0.07 * smooth(clamp(u * 1.6 - 0.45)), lerp(-0.03, 0.62, smooth(clamp(u * 2.2)))]; }
    if (tt < t.reachesT) { const u = u01(tt, t.reaches, t.feet); return [easeOutBack(u, 1.2), PI - 0.07, lerp(0.62, 1.0, smooth(u))]; }
    if (tt < t.addF) return [1, PI - 0.07, lerp(1.0, 0.62, smooth(u01(tt, t.reachesT, t.tips)))];
    if (tt < RET0) { const u = smooth(u01(tt, t.addF, t.horses)); return [lerp(1, REST_EXT, u), lerp(PI - 0.07, REST_YAW, u), lerp(0.62, REST_EL, u)]; }
    const u = smooth(u01(tt, RET0, RET0 + 1.6)); return [lerp(REST_EXT, 0, clamp(u * 3)), lerp(REST_YAW, 0.0, u), lerp(REST_EL, -0.03, u)];
  };
  // outriggers: beams out on "legs"; the front pair plants on "brace" (and pushes the nose up), the far rear pair on "ground",
  // the near rear one on Gary on "one"; it lifts off him on "Dalmatians"
  const PLANT = [SLAM - 0.1, SLAM - 0.1, t.brace + 0.05, t.brace + 0.05], PLANT_NEAR_REAR = SQUISH;
  // the tank: on the wagon (pops in on "more"), springs onto the bed, rides the truck
  const TOTE_IN = t.more - 0.1, HOP0 = t.bolt - 0.15, HOP1 = t.truckW + 0.05, WAGON_TOP = 0.38;
  const FILL0 = t.real - 0.15, FILL1 = t.gallons + 0.15, EMPTY0 = t.empties - 0.1, EMPTY1 = t.seconds + 0.35, REFILL0 = OPEN + 0.3, REFILL1 = MEGA + 0.4;
  const levelAt = (tt) => { let f = tt < FILL0 ? 0 : 0.88 * smooth(u01(tt, FILL0, FILL1)); if (tt > EMPTY0) f *= 1 - smooth(u01(tt, EMPTY0, EMPTY1)) * 0.97; if (tt > REFILL0) f = Math.max(f, 0.86 * smooth(u01(tt, REFILL0, REFILL1))); if (tt > t.out + 0.4) f -= 0.08 * smooth(u01(tt, t.out + 0.4, t.out + 2.5)); return f; };
  const BAF1 = t.walls - 0.05, BAF2 = t.holes - 0.05;
  const sloshAt = (tt, cell) => {   // the surface's own tilt (rad, + = higher toward +x): lag on the launch, the surge on the brake
    const bf = tt > BAF2 + 0.1 ? 0.28 : 1;
    let s = 0;
    if (tt > DRV0 && tt < DRV1 + 0.05) s += 0.12 * Math.sin(PI * u01(tt, DRV0, DRV1));
    if (tt > DRV1) { const a = tt - DRV1, hold = t.going + 0.2; if (tt < hold) s += -0.5 * smooth(u01(tt, DRV1, DRV1 + 0.3)) * (1 + 0.08 * Math.sin(a * 9 + cell)); else { const b = tt - hold; s += -0.5 * Math.exp(-b * (tt > BAF2 ? 3.5 : 0.9)) * Math.cos(b * 5 + cell * 0.4) * bf; } }   // piles up at the front (−x) through "keeps going", then sloshes back
    if (tt > BAF2 + 0.3 && tt < BAF2 + 2.2) s += 0.06 * Math.sin((tt - BAF2) * 11 + cell) * Math.exp(-(tt - BAF2) * 1.2);   // the demo nudge: three small, calm cells
    if (tt > TIP0 && tt < SLAM + 1) s += 0.0;
    if (tt > SLAM && tt < SLAM + 1.6) s += 0.18 * Math.exp(-(tt - SLAM) * 2.5) * Math.sin((tt - SLAM) * 9 + cell) * bf;
    return s;
  };

  // ---------------------------------------------------------------- effects scheduled from the word times
  const G = D.grill, GX = G.x, GZ = G.z, CATP = V(...D.cat);
  fx.stream('smoke', 0, t.lid, { pos: [GX, 1.7, GZ], box: [0.6, 0.1, 0.3], rate: 6, color: 0x55524f, alpha: 0.5, dir: [0.2, 1, 0], spread: 0.35, speed: [0.5, 1.0], size: [0.3, 0.55], seed: 1 });
  fx.burst('spark', 0.15, { pos: [GX, 1.3, GZ], n: 30, dir: [0, 1, 0], spread: 0.7, speed: [1.5, 3], seed: 2 });
  for (let k = 0; k < 4; k++) fx.burst('drops', t.squirt - 0.05 + k * 0.2, { pos: [GX + 0.2, 1.2, GZ + 0.15], n: 5, dir: [0, 1, 0.2], spread: 0.6, speed: [0.5, 1.2], size: [0.015, 0.03], seed: 3 + k });
  for (let k = 0; k < 3; k++) fx.burst('mist', t.squirt + 0.1 + k * 0.2, { pos: [GX + 0.1, 1.3, GZ + 0.1], n: 3, speed: [0.3, 0.6], spread: 0.8, size: [0.15, 0.25], color: steamCol, seed: 7 + k });   // each pew hisses into steam
  fx.burst('confetti', t.congrats, { pos: [-3.5, 1.8, -4.9], n: 160, dir: [0, 1, 0.3], spread: 0.6, speed: [3, 5.5], seed: 10 });
  fx.burst('drops', t.cup, { pos: [-3.3, 1.7, -4.9], n: 10, dir: [0, 1, 0.2], spread: 0.5, speed: [0.6, 1.4], size: [0.02, 0.035], seed: 11 });   // a sad little squirt for "one cup"
  fx.burst('glow', t.impressed, { pos: [CATP.x, CATP.y + 0.5, CATP.z + 0.2], n: 1, speed: [0, 0.01], size: [0.4, 0.5], seed: 12 });
  fx.burst('mist', t.squirts + 0.25, { pos: [GX, 1.25, GZ + 0.1], n: 8, speed: [0.5, 1.2], spread: 0.9, size: [0.2, 0.35], color: steamCol, seed: 13 });
  fx.burst('glow', FB, { pos: [GX, 1.5, GZ + 0.2], n: 1, speed: [0, 0.01], size: [1.0, 1.3], seed: 14 });
  fx.burst('spark', FB, { pos: [GX, 1.4, GZ], n: 120, dir: [0, 1, 0.2], spread: 1.3, speed: [3, 7], seed: 15 });
  fx.burst('crumb', FB + 0.02, { pos: [GX, 1.3, GZ], n: 50, dir: [0, 0.8, -0.6], spread: 0.9, speed: [3, 6], color: 0xffa23a, floor: 0.02, seed: 16 });   // flaming oil flung back at the hedge
  fx.burst('smoke', FB + 0.25, { pos: [-3.4, 1.4, -4.9], n: 8, speed: [0.3, 0.8], spread: 1.0, size: [0.25, 0.45], color: 0x2b2b2b, seed: 17 });   // Gary smokes
  fx.burst('drops', t.waterT, { pos: [GX, 1.2, GZ + 0.1], n: 14, dir: [0, 1, 0], spread: 0.5, speed: [0.5, 1.2], size: [0.02, 0.04], seed: 18 });
  fx.burst('mist', t.waterT + 0.15, { pos: [GX, 1.3, GZ + 0.1], n: 6, speed: [0.6, 1.3], spread: 0.6, size: [0.2, 0.4], color: steamCol, seed: 19 });   // the replay: water → steam
  fx.burst('crumb', t.explode, { pos: [GX, 1.25, GZ], n: 34, dir: [0, 1, 0], spread: 1.1, speed: [2, 4], color: 0xffa23a, floor: 0.02, seed: 20 });
  for (const [k, w] of [[0, t.heat], [1, t.fuel], [2, t.air]]) fx.burst('spark', w, { pos: [TRI[0] + [-0.55, 0.55, 0][k], [0.62, 0.62, 1.55][k], TRI[1] + 0.1], n: 18, speed: [1, 2.2], spread: 1.3, seed: 21 + k });
  fx.burst('dust', t.lid + 0.02, { pos: [GX, 1.2, GZ + 0.2], box: [1.0, 0.1, 0.3], n: 8, speed: [0.5, 1.2], spread: 1.2, size: [0.25, 0.45], color: 0x5a5652, seed: 24 });
  fx.stream('smoke', t.lid + 0.05, t.tons, { pos: [GX, 1.32, GZ + 0.25], box: [0.9, 0.02, 0.05], rate: 7, color: 0x6b6763, alpha: 0.45, dir: [0, 1, 0.2], spread: 0.25, speed: [0.3, 0.6], size: [0.15, 0.3], seed: 25 });   // smoke leaks out of the lid seam
  fx.burst('confetti', t.lid + 0.05, { pos: [TRI[0], 1.6, TRI[1] + 0.1], n: 25, dir: [-0.6, 1, 0.3], spread: 0.5, speed: [2, 3.5], color: 0x3e9be0, size: [0.03, 0.05], seed: 26 });   // the AIR badge snaps off
  for (let i = 0; i < HX.length; i++) fx.burst('spark', t.hedge - 0.3 + Math.abs(HX[i] - GX) / 16, { pos: [HX[i], HEDGE_Y + 0.3, D.hedge.z + 0.3], box: [2, 0.2, 0.4], n: 24, dir: [0, 1, 0.2], spread: 0.8, speed: [1.5, 3.5], seed: 30 + i });
  fx.burst('mist', t.works + 0.35, { pos: [-4.0, 1.5, D.hedge.z + 0.5], n: 4, speed: [0.3, 0.6], spread: 0.8, size: [0.2, 0.35], color: steamCol, seed: 140 });   // one squirt: tss
  fx.burst('smoke', t.need + 0.05, { pos: [GX + 0.95, 1.2, GZ + 0.5], n: 10, speed: [0.4, 1.0], spread: 1.2, size: [0.25, 0.45], color: 0x2b2b2b, seed: 141 });   // the soot blows off him
  for (let k = 0; k < 6; k++) fx.burst('dust', t.need + k * 0.22, { pos: [lerp(-3.2, 5.0, k / 5), 0.12, lerp(-4.9, -2.1, k / 5)], n: 3, speed: [0.3, 0.7], spread: 1.2, size: [0.18, 0.3], seed: 40 + k });   // Gary's dash
  fx.burst('dust', TOTE_IN + 0.12, { pos: [D.wagon[0], 0.1, D.wagon[1] + 0.9], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.25, 0.4], seed: 47 });
  fx.burst('crumb', t.three + 0.1, { pos: [D.wagon[0], 0.25, D.wagon[1] + 0.25], n: 10, dir: [0, 1, 0.5], spread: 0.8, speed: [1, 2], color: 0xd2302a, size: [0.02, 0.04], floor: 0.02, seed: 48 });
  fx.burst('dust', t.bye, { pos: [D.wagon[0], 0.1, D.wagon[1] + 0.85], box: [1.4, 0.1, 0.2], n: 14, speed: [0.8, 1.8], spread: 1.3, size: [0.3, 0.55], seed: 49 });
  fx.burst('crumb', t.bye, { pos: [D.wagon[0], 0.15, D.wagon[1]], n: 30, dir: [0, 1, 0.3], spread: 1.2, speed: [1.5, 3.5], color: 0xd2302a, floor: 0.02, seed: 50 });
  fx.burst('drops', t.bye + 0.05, { pos: [D.wagon[0], 1.3, D.wagon[1]], box: [1.6, 0.1, 0.8], n: 30, dir: [0, 1, 0], spread: 0.6, speed: [1, 2.2], size: [0.025, 0.045], seed: 51 });
  fx.burst('spark', HOP0 + 0.05, { pos: [D.wagon[0], 0.2, D.wagon[1]], n: 24, dir: [0, 1, 0], spread: 0.9, speed: [1.5, 3], seed: 52 });   // the wagon's springs boing
  fx.burst('dust', HOP1, { pos: [TX0 - 1.5, 1.15, TZ + 1.35], box: [2.2, 0.1, 0.2], n: 12, speed: [0.6, 1.4], spread: 1.3, size: [0.3, 0.5], seed: 53 });
  for (let k = 0; k < 3; k++) fx.burst('spark', HOP1 + 0.18 + k * 0.22, { pos: [TX0 - 2.6 + k * 0.9, 1.22, TZ + 0.62], n: 22, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3.2], seed: 54 + k });   // three bolts
  fx.burst('confetti', BODY0 + 0.3, { pos: [TX0 - 3.5, 2.6, TZ + 0.6], box: [5, 0.4, 0.6], n: 90, dir: [0, 1, 0.3], spread: 0.6, speed: [2, 4], seed: 57 });
  fx.burst('glow', BODY0 + 0.25, { pos: [TX0 - 3.5, 1.8, TZ + 1.3], box: [5, 0.6, 0.1], n: 5, speed: [0, 0.01], size: [0.8, 1.2], seed: 58 });
  fx.stream('dust', DRV0 + 0.1, DRV1, { pos: [TX0 - 2, 0.15, TZ + 1.2], box: [4, 0.1, 0.3], rate: 14, speed: [0.3, 0.8], spread: 1.2, size: [0.25, 0.5], seed: 59 });
  fx.burst('dust', DRV1, { pos: [TX1 - 5.6, 0.15, TZ + 1.2], box: [1.2, 0.1, 0.4], n: 14, dir: [-1, 0.4, 0], spread: 0.9, speed: [1, 2.4], size: [0.3, 0.55], seed: 60 });   // skid
  fx.burst('drops', t.going - 0.25, { pos: [TX1 - 2.75, 2.24, TZ + 0.4], box: [0.15, 0.05, 0.8], n: 26, dir: [-0.3, 1, 0.3], spread: 0.5, speed: [1.2, 2.4], size: [0.03, 0.05], floor: 1.12, life: [0.5, 0.8], seed: 61 });   // the surge slops over the tank's front lip onto the deck   // the surge slops out the top
  fx.burst('dust', SPLAT, { pos: [TX1 - 4.4, 2.0, TZ + 0.6], n: 10, speed: [0.5, 1.4], spread: 1.3, size: [0.25, 0.45], seed: 62 });
  fx.burst('spark', SPLAT, { pos: [TX1 - 4.4, 2.1, TZ + 0.7], n: 30, dir: [1, 0.6, 0.3], spread: 1.0, speed: [1.5, 3], seed: 63 });
  for (const [k, w] of [[0, BAF1], [1, BAF2]]) { fx.burst('spark', w + 0.18, { pos: [TX1 - 1.5 + (k ? 0.38 : -0.38), 2.1, TZ + 0.6], n: 26, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3], seed: 64 + k }); fx.burst('drops', w + 0.2, { pos: [TX1 - 1.5 + (k ? 0.38 : -0.38), 1.9, TZ + 0.3], n: 12, dir: [0, 1, 0.3], spread: 0.6, speed: [0.8, 1.6], size: [0.025, 0.04], seed: 66 + k }); }
  fx.burst('spark', t.pants, { pos: [TX1 - 2.9, 0.6, TZ + 1.9], n: 18, dir: [0, 1, 0], spread: 0.8, speed: [1, 2], seed: 68 });
  fx.burst('mist', t.dribbles + 0.35, { pos: [TX1 - 2.95, 0.55, TZ + 2.05], n: 10, speed: [0.5, 1.2], spread: 0.8, size: [0.2, 0.35], color: steamCol, seed: 69 });   // the dribble puts his pants out
  fx.burst('dust', PUMP0 + 0.2, { pos: [TX1 - 3.6, 1.2, TZ + 0.5], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.25, 0.4], seed: 70 });
  fx.burst('spark', t.spins, { pos: [TX1 - 3.6, 1.7, TZ + 0.75], n: 30, speed: [1.5, 3], spread: 1.3, seed: 71 });
  fx.burst('drops', t.flings, { pos: [TX1 - 3.6, 1.7, TZ + 0.55], n: 40, dir: [0, 0, 1], spread: 1.4, speed: [1.5, 3], size: [0.025, 0.045], seed: 72 });
  fx.burst('glow', t.n1500, { pos: [TX1 - 2.95, 1.2, TZ + 2.0], n: 2, speed: [0, 0.01], size: [0.6, 0.9], seed: 73 });
  fx.stream('dust', t.garyP, t.garyP2, { pos: [TX1 - 2.6, 0.08, TZ + 2.05], box: [0.4, 0.05, 0.3], rate: 10, speed: [0.3, 0.8], spread: 1.2, size: [0.18, 0.3], seed: 74 });   // his heels plough the lawn
  fx.burst('dust', t.crew + 0.05, { pos: [TX1 - 3.0, 0.15, TZ + 2.1], n: 12, speed: [0.5, 1.3], spread: 1.3, size: [0.3, 0.5], seed: 75 });
  for (let k = 0; k < 2; k++) fx.burst('spark', t.boltD + k * 0.4, { pos: [TX1 - 1.6, 2.5, TZ + 0.72], n: 24, dir: [0, 1, 0.4], spread: 1.1, speed: [1.5, 3.2], seed: 76 + k });
  fx.burst('glow', t.deck, { pos: [TX1 - 2.3, 2.7, TZ + 0.72], n: 2, speed: [0, 0.01], size: [0.6, 0.9], seed: 78 });
  for (let k = 0; k < 4; k++) fx.burst('mist', t.deck + 0.9 + k * 0.35, { pos: [lerp(-7, -3, k / 3), 1.6, D.hedge.z + 0.4], n: 6, speed: [0.6, 1.4], spread: 0.7, size: [0.4, 0.8], color: steamCol, seed: 79 + k });
  fx.burst('spark', t.main, { pos: [-1.3, 0.42, -0.42], n: 18, speed: [1, 2], spread: 1.2, seed: 83 });   // the supply hose couples on
  for (const w of [t.five, W('hydrant', 'sides')]) fx.burst('spark', w, { pos: [D.hyd.x, 0.82, D.hyd.z], n: 16, speed: [1, 2], spread: 1.3, seed: 152 + Math.round(w) });
  fx.burst('spark', t.cant, { pos: [D.hyd.x, 0.82, D.hyd.z], n: 22, speed: [1.2, 2.4], spread: 1.3, seed: 84 });   // the hex wrench skids round the pentagon
  fx.burst('spark', t.person - 0.05, { pos: [D.hyd.x - 0.05, 1.45, D.hyd.z - 0.5], n: 26, speed: [1.5, 3], spread: 1.3, seed: 85 });   // BONK
  fx.burst('dust', t.withW, { pos: [TX1 - 2.9, 1.1, TZ + 1.3], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.18, 0.3], seed: 86 });
  fx.burst('glow', t.wrench, { pos: [D.hyd.x - 0.1, 1.1, D.hyd.z - 0.4], n: 1, speed: [0, 0.01], size: [0.5, 0.7], seed: 87 });
  fx.burst('drops', OPEN + 0.25, { pos: [-1.25, 0.42, -0.42], n: 22, dir: [1, 0.6, 0], spread: 0.6, speed: [1.5, 3], size: [0.025, 0.045], seed: 88 });
  fx.burst('glow', MEGA, { pos: [TX1 - 2.3, 2.7, TZ + 0.72], n: 3, speed: [0, 0.01], size: [0.9, 1.3], seed: 89 });
  for (let i = 0; i < HX.length; i++) { fx.burst('mist', MEGA + 0.55 + i * 0.06, { pos: [HX[i], HEDGE_Y + 0.4, D.hedge.z + 0.3], box: [2, 0.3, 0.5], n: 12, dir: [0, 1, 0.1], spread: 0.6, speed: [1.2, 2.6], size: [0.6, 1.3], color: steamCol, alpha: 0.75, seed: 90 + i }); fx.burst('smoke', MEGA + 0.9 + i * 0.06, { pos: [HX[i], HEDGE_Y + 0.6, D.hedge.z + 0.2], box: [2, 0.3, 0.4], n: 5, speed: [0.5, 1.2], spread: 0.6, size: [0.5, 0.9], color: 0xb9b6b2, seed: 98 + i }); }
  fx.burst('drops', MEGA + 0.5, { pos: [-5.5, 1.6, D.hedge.z + 0.4], box: [8, 0.4, 0.6], n: 90, dir: [0, 1, 0.3], spread: 0.6, speed: [1.5, 3.5], size: [0.03, 0.05], seed: 106 });
  fx.burst('confetti', t.out + 0.1, { pos: [D.hyd.x, 1.5, D.hyd.z - 0.3], n: 60, dir: [0, 1, 0.3], spread: 0.6, speed: [2.5, 4], seed: 107 });
  fx.stream('smoke', t.out + 1.2, END, { pos: [-6.2, HEDGE_Y + 0.2, D.hedge.z], box: [12, 0.1, 0.4], rate: 4, color: 0x4a4642, alpha: 0.5, dir: [0.2, 1, 0], spread: 0.3, speed: [0.25, 0.5], size: [0.35, 0.7], seed: 108 });   // the charcoal hedge smoulders
  fx.burst('spark', t.ladder1, { pos: [TX1 - 4.0, 2.7, TZ + 0.4], n: 24, speed: [1, 2.5], spread: 1.3, seed: 109 });
  for (let k = 0; k < 3; k++) fx.burst('spark', t.reaches + 0.15 + k * 0.28, { pos: [TX1 - 4.0 - (2 + k * 2.4) * Math.cos(0.8), 3.4 + (2 + k * 2.4) * Math.sin(0.8), TZ - 0.1], n: 14, speed: [1, 2], spread: 1.3, seed: 110 + k });   // each section clanks out
  fx.burst('confetti', t.feet, { pos: [TX1 - 4.0 - 15.5, 3.3 + 23.5, TZ - 0.4], n: 40, dir: [0, 1, 0], spread: 0.8, speed: [2, 3.5], seed: 113 });   // a flag-day at 100 ft
  fx.burst('dust', t.tips, { pos: [TX1 - 5.6, 0.15, TZ + 1.1], box: [1.2, 0.1, 0.4], n: 12, speed: [0.6, 1.4], spread: 1.3, size: [0.3, 0.5], seed: 114 });
  fx.burst('dust', t.brace + 0.12, { pos: [TX1 - 6.6, 0.1, TZ], box: [0.4, 0.1, 4.4], n: 12, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.5], seed: 115 });
  fx.burst('dust', SLAM, { pos: [TX1 - 2.5, 0.15, TZ + 1.2], box: [6, 0.1, 0.4], n: 26, speed: [0.8, 2.0], spread: 1.3, size: [0.4, 0.8], seed: 116 });
  fx.burst('rock', SLAM, { pos: [TX1 - 2.5, 0.1, TZ + 1.3], box: [5, 0.1, 0.3], n: 24, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3], floor: 0.02, life: [0.5, 0.9], seed: 117 });
  fx.burst('dust', t.outriggers - 0.15, { pos: [TX1 - 0.35, 0.12, -2.1], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.25, 0.4], seed: 118 });
  fx.burst('dust', SQUISH, { pos: [TX1 - 0.35, 0.1, -2.05], n: 14, speed: [0.6, 1.5], spread: 1.3, size: [0.3, 0.5], seed: 119 });
  fx.burst('spark', SQUISH, { pos: [TX1 - 0.35, 0.25, -2.0], n: 30, dir: [0, 1, 0.4], spread: 1.2, speed: [1.5, 3], seed: 120 });
  fx.burst('glow', t.siren, { pos: [TX1 - 5.75, 2.9, TZ + 0.6], n: 2, speed: [0, 0.01], size: [0.7, 1.0], seed: 121 });
  fx.burst('spark', t.pole, { pos: [TX1 - 3.65, 2.9, -2.75], n: 22, speed: [1, 2.2], spread: 1.3, seed: 122 });
  fx.burst('dust', t.dalmatians - 0.12, { pos: [TX1 - 3.65, 0.1, -2.75], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.2, 0.35], seed: 123 });
  fx.stream('dust', t.run - 0.1, t.horses + 0.1, { pos: [lerp(TX1 - 3.65, -3.6, 0.5), 0.08, -2.5], box: [3.5, 0.05, 0.4], rate: 10, speed: [0.3, 0.7], spread: 1.2, size: [0.15, 0.25], seed: 124 });
  fx.burst('dust', t.dalmatians + 0.1, { pos: [TX1 - 0.35, 0.1, -2.05], n: 8, speed: [0.4, 1.0], spread: 1.3, size: [0.2, 0.35], seed: 125 });   // Gary peels off the lawn
  fx.stream('crumb', t.never, t.treeR, { pos: [D.tree.x + 0.05, 3.0, D.tree.z + 0.45], box: [0.3, 4.5, 0.1], rate: 22, dir: [0, -1, 0.5], spread: 0.6, speed: [0.5, 1.2], color: 0x6b4a32, floor: 0.02, size: [0.02, 0.04], seed: 126 });   // bark scratched off as the cat backs down
  fx.burst('dust', t.treeR, { pos: [D.tree.x + 0.1, 0.1, D.tree.z + 0.6], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.18, 0.3], seed: 127 });
  fx.burst('spark', RET0 + 0.05, { pos: [TX1 - 3.85, 3.05, TZ + 0.62], n: 24, speed: [1, 2.4], spread: 1.3, seed: 128 });
  fx.burst('crumb', RET0 + 0.3, { pos: [REST.x, REST.y, REST.z], n: 26, dir: [0, 1, 0.3], spread: 1.0, speed: [1, 2.2], color: 0x4f9a3f, floor: 0.02, seed: 129 });   // leaves shaken off the branch
  fx.burst('crumb', t.stuck, { pos: [-6.6, 6.1, -4.8], n: 22, dir: [0, 1, 0.3], spread: 1.0, speed: [0.6, 1.4], color: 0x4f9a3f, floor: 0.02, seed: 150 });   // the branch sags, leaves drop
  fx.burst('confetti', t.end + 0.05, { pos: [-3.0, 3.5, -4.3], box: [3, 0.4, 1], n: 120, dir: [0, 1, 0.3], spread: 0.6, speed: [2.5, 4.5], seed: 151 });
  fx.burst('bill', t.n22, { pos: [-4.2, 5.8, -4.6], box: [2.2, 0.3, 1.0], n: 60, dir: [0, 1, 0.3], spread: 0.8, speed: [1, 2.5], life: [3.5, 4.5], seed: 130 });
  fx.burst('dust', t.burgers - 0.1, { pos: [GX, 1.42, GZ], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.18, 0.3], seed: 131 });
  for (let k = 0; k < 3; k++) fx.burst('crumb', t.burgers2 - 0.25 + k * 0.32, { pos: [GX + 0.62, 1.25, GZ + 0.05], n: 12, dir: [0, 1, 0.3], spread: 1.0, speed: [0.8, 1.8], color: 0xe0a95a, floor: 1.1, size: [0.015, 0.03], seed: 132 + k });

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words
  const Fr = [], F = (tt, pos, look, fov = 44, pass = false) => Fr.push({ t: tt, pos, look, fov, pass });
  const Fk = (tt, pos, look, fov = 44, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  // round-1 camera review: framings projected against the word times (subject in frame ON its word; no whips)
  F(0, [-3.75, 1.45, 1.6], [-4.1, 0.85, -5.4], 42);                          // the grill on fire, Gary + his squirt gun
  Fk(t.squirt - 0.25, [-3.7, 1.35, 0.6], [-4.15, 0.95, -5.3], 38, t.gun + 0.4);   // pew pew
  Fk(t.built - 0.1, [-3.65, 1.6, 1.2], [-3.9, 0.7, -5.2], 42, t.cup + 0.35);   // ta-da; ONE cup
  Fk(t.tree, [-4.55, 3.5, 5.0], [-5.0, 3.85, -5.0], 50, t.impressed + 0.6);   // a tall two-shot: the cat yawns over Gary
  Fk(t.fireball - 0.2, [-3.9, 2.0, 3.0], [-4.3, 1.45, -5.4], 46, t.fireball + 0.7);   // the fireball
  F(t.explode - 0.1, [-3.45, 1.35, 0.6], [-3.75, 0.9, -5.2], 38);            // the replay at the grill, Gary charred
  F(t.heat - 0.25, [-2.85, 1.6, 1.4], [-2.8, 0.72, -5.15], 38);               // the fire-triangle sign beside him
  Fk(t.lid - 0.25, [-3.35, 1.9, 3.0], [-3.45, 0.68, -5.3], 44, t.lid + 0.6);   // SLAM: the AIR corner flies off across the frame
  Fk(t.fireT - 0.25, [-5.0, 4.0, 8.6], [-5.3, 3.6, -6.2], 48, t.works + 0.7);   // the hedge goes up — the cat above it; one useless squirt
  F(t.more, [2.2, 2.2, 7.6], [2.6, 1.0, -3.2], 46, true);                    // follow Gary's dash right
  Fk(t.real - 0.25, [6.5, 1.95, 4.8], [6.6, 0.95, -2.6], 44);                // the wagon + tote + the garden hose
  Fk(t.three - 0.25, [6.55, 1.1, 5.6], [6.6, 0.75, -2.3], 44, t.bye + 0.45);   // it creaks… CRUNCH
  Fk(t.bolt - 0.2, [6.9, 1.95, 5.0], [6.9, 1.2, -3.2], 44, t.truckW + 0.7);   // the pancaked wagon springs the tote onto the bed; three bolts
  F(t.booster - 0.05, [6.8, 2.5, 6.6], [6.7, 1.7, -4.3], 46);                // the flatbed grows into a red engine (tank in frame)
  F(t.brake - 0.35, [3.4, 2.5, 6.6], [3.3, 1.7, -4.3], 46, true);            // follow it 4 m to the brake
  Fk(t.going - 0.35, [3.2, 2.3, 4.9], [3.0, 1.75, -3.6], 46, t.going + 0.3);   // the surge in section
  F(t.garyK, [1.5, 2.2, 4.6], [1.3, 1.7, -3.6], 48);                         // pan with Gary: the splat on the cab's back wall
  Fk(t.walls - 0.1, [2.6, 1.9, 4.4], [2.6, 1.5, -3.5], 48, t.baffles + 0.5);   // all three cells + Gary hammering
  F(t.pants - 0.15, [2.1, 1.3, 1.6], [1.85, 0.85, -2.6], 38);                // his pants are still on fire
  Fk(t.dribbles - 0.3, [1.85, 1.3, 1.9], [1.65, 0.8, -2.4], 38);             // the dribble puts them out
  F(t.wheel - 0.2, [1.35, 1.85, 2.9], [1.1, 1.45, -3.6], 40);                // the pump drops into the bay
  Fk(t.centrifugal - 0.25, [1.25, 1.75, 2.0], [1.2, 1.5, -3.2], 38, t.minute - 0.2);   // the impeller in section, Gary's face below it
  F(t.garyP - 0.3, [1.0, 1.7, 4.6], [1.3, 0.95, -3.0], 46);                  // 1,500 gpm over the cab, Gary braced
  Fk(t.garyP2 - 0.25, [1.3, 3.0, 6.8], [1.25, 2.95, -2.3], 52, t.crew + 0.35);   // the hose holds Gary
  F(t.roof - 0.2, [3.4, 3.25, 3.0], [3.0, 2.4, -3.8], 40);                   // the deck gun bolts on
  Fk(t.deck - 0.2, [2.4, 3.5, 4.4], [2.2, 2.9, -3.8], 46, t.gunD + 0.4);     // DECK GUN: the gun + its arc leaving
  F(t.seconds, [2.9, 2.6, 5.4], [2.9, 1.9, -3.4], 46);                       // the tank empties, the stream dies
  F(t.city, [-0.1, 0.65, 5.0], [-0.2, -0.15, -1.5], 50);                     // down to the cut: the main, the barrel, the hose dragged over
  Fk(t.nut - 0.2, [-1.45, 2.15, 1.7], [-1.6, 0.8, -0.7], 36, t.person + 0.25);   // from above: the pentagon nut + Gary's face; BONK
  Fk(t.out + 0.15, [-1.0, 3.0, 8.4], [-1.5, 2.4, -3.6], 50, t.out + 0.35);   // up the barrel → the hose → the deck gun: fire OUT
  F(t.there + 0.3, [-4.8, 6.4, 5.0], [-6.6, 5.9, -5.0], 34);                 // the cat's still up there
  Fk(t.aerial, [-4.4, 9.5, 26], [-5.4, 12.6, -4.5], 62, t.twenty + 0.3);     // pull back as the ladder rises: 100 FEET, the cat at twenty
  Fk(t.truckT, [0.6, 4.6, 17.0], [0.0, 3.6, -4.3], 50, t.tips + 0.6);        // it reaches out… the truck TIPS
  Fk(t.ground - 0.05, [-6.0, 2.3, 5.4], [-1.2, 0.9, -3.8], 48);              // a front three-quarter: the legs swing out, brace … SLAM
  Fk(t.under - 0.25, [3.9, 1.3, 2.9], [3.8, 0.55, -2.4], 40, t.oneO + 0.35);   // Gary under one
  Fk(t.pole - 0.05, [-0.6, 2.0, 6.6], [-0.4, 1.6, -3.0], 44, t.dalmatians + 0.3);   // siren (left) + the pole: the Dalmatian slides down
  Fk(t.horses, [-2.3, 1.25, 2.9], [-2.7, 0.6, -2.6], 40, t.horses2 + 0.5);   // … runs ahead of no horses
  F(t.climbs - 0.2, [-2.2, 4.8, 8.0], [-2.4, 4.6, -4.6], 50);                // Gary climbs the ladder
  Fk(t.firefighters - 0.2, [-6.0, 6.45, 1.8], [-6.55, 6.0, -4.8], 40, t.never - 0.15);   // Gary + the cat at the branch tip
  F(t.skeleton, [-7.8, 3.6, 3.2], [-8.4, 3.0, -5.8], 44);                    // the cat backs down the trunk by itself
  F(t.treeR + 0.05, [-7.6, 2.2, 3.4], [-8.2, 1.2, -5.8], 44);                // … lands
  Fk(t.truckE - 0.5, [-0.8, 3.4, 6.0], [-0.6, 2.8, -3.6], 46, RET0 + 0.3);   // the Dalmatian hits the lever
  Fk(t.burgers, [-5.6, 3.3, 3.8], [-5.45, 3.35, -5.2], 46);                  // Gary hanging, the cat at the burgers, the charcoal hedge
  F(t.burgers2 - 0.2, [-4.8, 2.9, 1.4], [-4.6, 2.35, -5.6], 40);             // push in: the cat eats the burgers
  Fr.push({ t: END, pos: [-4.75, 2.85, 1.1], look: [-4.6, 2.3, -5.6], fov: 39, stop: true });
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr, { shortHoldPass: true }));
  const kick = makeKick([[FB, 1.3], [t.lid, 0.9], [t.hedge, 0.6], [t.bye, 0.9], [HOP0 + 0.05, 0.4], [HOP1, 1.0], [HOP1 + 0.18, 0.3], [HOP1 + 0.4, 0.3], [HOP1 + 0.62, 0.3], [BODY0 + 0.3, 0.5],
    [DRV1, 1.1], [SPLAT, 1.0], [BAF1 + 0.18, 0.45], [BAF2 + 0.18, 0.45], [t.pants, 0.3], [PUMP0 + 0.2, 0.5], [t.n1500, 0.5], [t.garyP2, 0.8], [t.crew, 0.7], [t.boltD, 0.35], [t.boltD + 0.4, 0.35], [t.deck, 0.7],
    [t.main, 0.4], [t.person - 0.05, 1.0], [t.wrench, 0.35], [OPEN + 0.2, 0.6], [MEGA, 1.0], [t.ladder1, 0.4], [t.reaches + 0.15, 0.3], [t.reaches + 0.43, 0.3], [t.reaches + 0.71, 0.3], [t.tips, 1.4],
    [t.brace + 0.12, 0.6], [SLAM, 1.3], [t.outriggers - 0.15, 0.5], [SQUISH, 1.0], [t.siren, 0.35], [t.dalmatians - 0.12, 0.4], [RET0 + 0.05, 0.4], [t.n22, 0.4], [t.stuck, 0.6], [t.burgers2, 0.5]]);

  // ---------------------------------------------------------------- helpers
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const path = (tt, a, b, pts) => { const u = smooth(u01(tt, a, b)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), f = u - i; return pts[i].map((v, k) => lerp(v, pts[i + 1][k], f)); };
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), e1 = new THREE.Euler(), m4 = new THREE.Matrix4();
  const wpos = (o, out = new THREE.Vector3()) => { o.updateWorldMatrix(true, false); return o.getWorldPosition(out); };
  const toWorld = (lx, ly, lz) => truck.inner.localToWorld(new THREE.Vector3(lx, ly, lz));
  const aimV = (p0, target, T) => new THREE.Vector3((target[0] - p0.x) / T, (target[1] - p0.y) / T + 4.9 * T, (target[2] - p0.z) / T);
  const hedgeStop = (p) => p.z < D.hedge.z + D.hedge.d / 2 && p.y < D.hedge.h + 0.1;
  const cabStop = (p) => { const X = truck.g.position.x; return p.x > X - 7.1 && p.x < X - 4.4 && Math.abs(p.z - TZ) < 1.2 && p.y < 2.75; };

  // ---------------------------------------------------------------- per-frame state
  function truckAt(tt) {
    const X = truckX(tt); truck.g.position.set(X, 0, TZ); truck.spin((TX0 - X) / 0.52);
    const st = stageAt(tt); truck.setStage(st);
    const tip = tipAngle(tt), dive = tt < SLAM - 3 ? diveAngle(tt) : 0;
    truck.pitch(tip + (tt < t.split + 1 ? dive : 0), FRONT_AX);
    const [ext, yaw, el] = ladderAt(tt); truck.ladder.set(ext, yaw, el);
    truck.setRun(tt < t.spins - 0.2 ? 0 : smooth(u01(tt, t.spins - 0.2, t.flings)) * (tt > MEGA + 3 ? 1 - smooth(u01(tt, MEGA + 3, MEGA + 4)) : 1), tt);
    truck.imp.rotation.z = tt < t.spins ? 0 : -((tt - t.spins) ** 2 * 6 + (tt - t.spins) * 12) * (tt < t.out + 3 ? 1 : 1);   // spins up on "spins"
    truck.lights.update(tt, tt > t.siren);
    truck.needles.forEach((n, i) => (n.rotation.z = tt < t.n1500 ? 2.4 : lerp(2.4, -0.4 - i * 0.3, smooth(u01(tt, t.n1500, t.n1500 + 0.5))) + 0.05 * Math.sin(tt * 23 + i)));
    truck.compDoor.scale.y = tt > t.withW - 0.05 ? 1 - 0.85 * smooth(u01(tt, t.withW - 0.05, t.withW + 0.2)) : 1; truck.compDoor.position.y = 1.06 + 0.13 * (1 - truck.compDoor.scale.y);
    truck.levers.forEach((l, i) => (l.rotation.x = (tt > t.ladder1 && tt < t.tips ? 0.5 * Math.sin(tt * 9 + i) : 0) + (i === 1 && tt > RET0 ? -0.7 : 0)));
    truck.g.updateMatrixWorld(true);
    // outriggers: extend on "legs"; jacks reach the ground at their plant time
    truck.outr.forEach((o, i) => {
      if (tt < OUT0) return o.set(0, 0.05);
      const e = easeOutBack(u01(tt, OUT0, OUT0 + 0.35), 1.5);
      o.set(e, 0.05); o.jack.updateWorldMatrix(true, false); const y = wpos(o.jack, v3).y;
      const plantT = i === 0 ? PLANT_NEAR_REAR : PLANT[i], full = Math.max(0.05, y - 0.07);
      let L = 0.05 + (full - 0.05) * easeInQuad(u01(tt, plantT - 0.18, plantT));
      if (i === 0 && tt > SQUISH - 0.02) L = Math.max(0.05, y - 0.07 - 0.13) + (tt > t.dalmatians ? -0.3 * smooth(u01(tt, t.dalmatians, t.dalmatians + 0.3)) : 0);   // the pad lands on Gary (and lifts off on "Dalmatians")
      o.set(e, L);
    });
  }

  function tankAt(tt) {
    tank.g.visible = tt > TOTE_IN; if (!tank.g.visible) return;
    tank.setLook(tt > BODY0 + 0.15 ? 1 : 0);
    tank.setBaffles(Math.max(easeOutBack(u01(tt, BAF1, BAF1 + 0.3), 1.8) * 0.5 + (tt > BAF2 ? 0.5 : 0) * 0, 0));
    tank.baffles[0].visible = tt > BAF1; tank.baffles[0].scale.y = Math.max(0.01, easeOutBack(u01(tt, BAF1, BAF1 + 0.3), 1.8));
    tank.baffles[1].visible = tt > BAF2; tank.baffles[1].scale.y = Math.max(0.01, easeOutBack(u01(tt, BAF2, BAF2 + 0.3), 1.8));
    // pose: on the wagon → sprung onto the bed → rides the bed (tankSeat)
    const crush = smooth(u01(tt, t.three, t.tons)) * 0.3 + easeOutBack(u01(tt, t.bye - 0.08, t.bye + 0.1), 1.2) * 0.7;
    const onWagon = [D.wagon[0], WAGON_TOP + 0.12 - 0.26 * crush, D.wagon[1]];
    truck.tankSeat.updateWorldMatrix(true, false); truck.tankSeat.getWorldPosition(v3); truck.tankSeat.getWorldQuaternion(q2);
    if (tt < HOP0) { tank.g.position.set(...onWagon); tank.g.quaternion.identity(); tank.g.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, TOTE_IN, TOTE_IN + 0.3), 2))); }
    else if (tt < HOP1) { const p = hop(tt, HOP0, HOP1, onWagon, [v3.x, v3.y, v3.z], 1.1); tank.g.position.set(...p); tank.g.scale.setScalar(1); q1.identity(); tank.g.quaternion.copy(q1).slerp(q2, smooth(u01(tt, HOP0, HOP1))); tank.g.rotateX(-0.25 * Math.sin(PI * u01(tt, HOP0, HOP1))); }
    else { tank.g.position.copy(v3); tank.g.quaternion.copy(q2); const sq = squash(tt, HOP1, 0.18); tank.g.scale.set(sq[0], sq[1], sq[0]); }
    tank.g.updateMatrixWorld(true);
    // the water: level ∩ tank, its surface level in the WORLD (so tilt the line in the tank frame by the tank's own roll) + slosh
    e1.setFromQuaternion(tank.g.quaternion, 'XYZ'); const roll = e1.z, lev = levelAt(tt);
    const cells = tt > BAF1 + 0.15 ? 3 : 1, W3 = (TANK.x1 - TANK.x0) / cells, Ly = TANK.y0 + lev * (TANK.y1 - TANK.y0);
    tank.water.set(Array.from({ length: cells }, (_, i) => ({ x0: TANK.x0 + i * W3 + (cells > 1 && i ? 0.02 : 0), x1: TANK.x0 + (i + 1) * W3 - (cells > 1 && i < cells - 1 ? 0.02 : 0), y0: TANK.y0, y1: TANK.y1, L: Ly, s: Math.tan(clamp(sloshAt(tt, i) - roll, -1.1, 1.1)) })), tt);
  }

  function wagonAt(tt) { const crush = smooth(u01(tt, t.three, t.tons)) * 0.3 + easeOutBack(u01(tt, t.bye - 0.08, t.bye + 0.1), 1.2) * 0.7, boing = tt > HOP0 && tt < HOP0 + 0.6 ? 0.35 * Math.sin(PI * u01(tt, HOP0, HOP0 + 0.3)) * Math.exp(-(tt - HOP0) * 3) : 0; wagon.setCrush(clamp(crush - boing)); wagon.g.position.y = tt > HOP0 ? 0.08 * Math.sin(PI * u01(tt, HOP0, HOP0 + 0.25)) : 0; }

  function grillAt(tt) {
    const slam = u01(tt, t.slam, t.lid); grill.setLid(tt < t.slam ? 1 : 1 - easeInQuad(slam)); grill.lid.rotation.z = tt > t.lid ? wobble(tt, t.lid, 0.04, 30, 9) : 0;
    grill.g.position.y = tt > t.lid ? Math.max(0, 0.03 * Math.sin((tt - t.lid) * 30) * Math.exp(-(tt - t.lid) * 9)) : 0;
    grill.burgers.forEach((b, i) => { b.visible = true; b.position.y = 0.024 + (tt > FB && tt < FB + 0.8 ? drop(tt, FB, 0, 0.8) * 0 + 0.6 * Math.sin(PI * u01(tt, FB, FB + 0.7)) * (0.6 + i * 0.15) : 0); b.rotation.x = tt > FB && tt < FB + 0.7 ? (tt - FB) * 9 * (i % 2 ? 1 : -1) : 0; });   // the patties flip in the blast
    // the cat eats the burgers on the plate, one by one
    grill.plateBurgers.forEach((b, i) => { const at = [t.ate - 0.1, t.burgers2 - 0.05, t.burgers2 + 0.45][i]; const k = 1 - smooth(u01(tt, at, at + 0.35)); b.visible = k > 0.02; b.scale.setScalar(Math.max(0.02, k)); });
  }

  // Gary
  const G0 = [-3.55, -5.0], GLOOK = -1.1;
  const pantsOn = (tt) => tt > FB + 0.1 && tt < t.dribbles + 0.45;
  const pantsK = (tt) => !pantsOn(tt) ? 0 : (tt > t.garys - 0.1 && tt < t.dribbles ? 1.0 : 0.55);
  function garyAt(tt) {
    const g = gary; g.root.visible = true;
    gun.g.visible = tt < FB + 0.05; hammer.visible = false; gnoz.g.visible = false; noz.g.visible = false; wrench.g.visible = false; wrench5.g.visible = false;
    dizzy.update(tt, 0, [0, 0, 0]);
    const char = tt < FB ? 0 : 0.85 * (1 - smooth(u01(tt, t.need, t.more + 0.6))) + 0.12;   // the soot blows off in his sprint   // soot from the fireball, slowly brushed off (a little stays)
    const base = { t: tt, eyes: 'open', mouth: 'smile', brows: 0, char: Math.min(0.95, char * (tt < FB ? 0 : 1)) };
    // HOOK + CONGRATS: at the grill with the squirt gun
    if (tt < t.squirts - 0.1) {
      const pew = tt > t.squirt - 0.1 && tt < t.gun + 0.5, rec = pew ? 0.15 * Math.max(0, Math.sin(tt * 30)) : 0;
      if (tt > t.congrats && tt < t.cup + 0.4) { const up = easeOutBack(u01(tt, t.congrats, t.congrats + 0.3), 2); return g.set({ ...base, x: G0[0], z: G0[1], rotY: GLOOK + 0.6, eyes: 'open', mouth: 'grin', armR: { x: lerp(-0.3, -2.7, up), z: 0.3, el: 0.3 }, armL: { x: lerp(0, -2.4, up), z: 0.5, el: 0.4 }, look: [0.3, 0.4], head: { x: -0.1, y: 0.2, z: 0 } }); }
      if (tt > t.cup + 0.4) { const lk = smooth(u01(tt, t.catC - 0.3, t.catC + 0.2)); return g.set({ ...base, x: G0[0], z: G0[1], rotY: GLOOK + 0.3, mouth: tt > t.impressed ? 'frown' : 'smile', brows: tt > t.impressed ? 0.6 : 0, armR: { x: -0.6, z: 0.15, el: 0.6 }, look: [-0.5 * lk, 0.9 * lk], head: { x: -0.35 * lk, y: -0.3 * lk, z: 0 } }); }
      return g.set({ ...base, x: G0[0], z: G0[1], rotY: GLOOK, eyes: pew ? 'half' : 'open', mouth: pew ? 'flat' : 'smile', brows: pew ? -0.6 : 0.2, armR: { x: -1.35 + rec, z: 0.1, el: 0.15 }, look: [-0.6, -0.1] });
    }
    // GREASE: aim, squirt → FIREBALL
    if (tt < FB) return g.set({ ...base, x: G0[0], z: G0[1], rotY: GLOOK, eyes: 'half', mouth: 'flat', brows: -0.8, armR: { x: -1.4 + 0.12 * Math.max(0, Math.sin(tt * 30)), z: 0.1, el: 0.1 }, look: [-0.6, -0.1], lean: 0.1 });
    if (tt < t.waterT) { const a = tt - FB, [x, y, z] = hop(tt, FB, FB + 0.55, [G0[0], 0, G0[1]], [G0[0] + 0.55, 0, G0[1] + 0.35], 0.6); return g.set({ ...base, glow: a < 0.35 ? [0xff7a1a, 0.9 * (1 - a / 0.35)] : undefined, x, y, z, rotY: GLOOK, eyes: a < 0.6 ? 'x' : 'spiral', mouth: a < 0.6 ? 'scream' : 'o', brows: 1, hairUp: 1, hatLift: clamp(1 - a * 0.9), rx: 0.4 * Math.sin(PI * u01(tt, FB, FB + 0.55)), armR: { x: -2.6, z: 0.6, el: 0.4 }, armL: { x: -2.6, z: 0.6, el: 0.4 }, squash: squash(tt, FB + 0.55, 0.25) }); }
    const GA = [G0[0] + 0.55, G0[1] + 0.35];
    // TRIANGLE: dazed, then slams the lid, turns to the hedge
    if (tt < t.slam - 0.35) { const pt = tt > t.needs - 0.1; return g.set({ ...base, x: GA[0], z: GA[1], rotY: pt ? 0.2 : GLOOK + 0.4, eyes: tt < t.needs ? 'spiral' : 'open', mouth: tt < t.needs ? 'wavy' : 'flat', hairUp: clamp(1 - (tt - t.waterT) * 0.6), armR: pt ? { x: -1.5, z: 0.6, el: 0.1 } : undefined, look: pt ? [0.8, 0.1] : [0, 0] }); }
    const GL0 = [G.x + 0.95, G.z + 0.5];
    if (tt < t.calledT) { const u = u01(tt, t.slam - 0.35, t.slam - 0.05), [x, , z] = [lerp(GA[0], GL0[0], smooth(u)), 0, lerp(GA[1], GL0[1], smooth(u))]; const sl = u01(tt, t.slam - 0.05, t.lid); return g.set({ ...base, x, z, rotY: -1.0, walk: u < 1 ? tt * 14 : null, eyes: 'wide', mouth: 'teeth', brows: -0.8, armL: { x: lerp(-2.9, -1.3, easeInQuad(sl)), z: -0.35, el: 0.15 }, armR: { x: lerp(-2.6, -1.1, easeInQuad(sl)), z: -0.1, el: 0.3 }, lean: 0.1 + 0.15 * sl, squash: squash(tt, t.lid, 0.2) }); }
    if (tt < t.hedges - 0.1) { const turn = smooth(u01(tt, t.hedge - 0.3, t.hedge + 0.1)); return g.set({ ...base, x: GL0[0], z: GL0[1], rotY: lerp(-0.3, -2.5, turn), eyes: turn > 0.5 ? 'wide' : 'open', mouth: turn > 0.5 ? 'scream' : 'grin', brows: turn > 0.5 ? 1 : 0, head: { x: 0, y: turn * 1.4, z: 0 }, look: [turn * 0.8, 0.2], armR: { x: -0.5 * turn, z: 0.4 * turn, el: 1.2 * turn }, armL: { x: -0.5 * turn, z: 0.4 * turn, el: 1.2 * turn } }); }
    // TANK: dash to the wagon, fill the tote with the garden hose
    const GW = [5.35, -1.95];
    if (tt < t.need) { gun.g.visible = tt > t.waterK0 - 0.25; return g.set({ ...base, x: GL0[0], z: GL0[1], rotY: -2.25, eyes: 'half', mouth: 'flat', brows: -0.7, armR: { x: -1.5 + 0.12 * Math.max(0, Math.sin(tt * 30)), z: 0.1, el: 0.1 }, head: { x: 0, y: -0.9, z: 0 }, look: [-0.8, 0] }); }
    if (tt < t.more + 0.1) { const [x, , z] = path(tt, t.need, t.more + 0.1, [[GL0[0], 0, GL0[1]], [-1.0, 0, -3.0], [3.5, 0, -1.9], [GW[0], 0, GW[1]]]); return g.set({ ...base, x, z, rotY: PI / 2 - 0.2, walk: tt * 22, walkAmt: 1.3, lean: 0.35, eyes: 'wide', mouth: 'o', brows: 0.8 }); }
    if (tt < HOP0 - 0.1) { gnoz.g.visible = tt < t.bye; const creak = tt > t.three - 0.1; return g.set({ ...base, x: GW[0], z: GW[1], rotY: 0.95, eyes: creak ? 'wide' : 'half', mouth: tt > t.bye ? 'scream' : creak ? 'o' : 'smile', brows: creak ? 0.8 : 0, armR: { x: -2.0, z: 0.2, el: 0.2 }, armL: tt > t.bye ? { x: -2.4, z: 0.5, el: 1.4 } : undefined, look: [0.6, creak ? -0.4 : 0.3], squash: squash(tt, t.bye, 0.15) }); }
    // TRUCK: bolts the tote down, hops onto it, rides it, flies into the cab's back wall
    const seatTop = () => toWorld(-1.35, 2.2, 0.15);
    if (tt < t.booster - 0.2) { wrench.g.visible = tt > HOP1; return g.set({ ...base, x: GW[0] + 0.3, z: GW[1] - 0.25, rotY: 0.2, eyes: tt < HOP1 ? 'wide' : 'half', mouth: tt < HOP1 ? 'o' : 'teeth', brows: -0.5, armR: { x: -2.3 + (tt > HOP1 ? 0.4 * Math.max(0, Math.sin(tt * 20)) : 0), z: 0.2, el: 0.5 }, look: [0.5, 0.6] }); }
    if (tt < t.booster + 0.2) { const p = seatTop(); const [x, y, z] = hop(tt, t.booster - 0.2, t.booster + 0.2, [GW[0] + 0.3, 0, GW[1] - 0.25], [p.x, p.y - 0.36, p.z], 1.0); return g.set({ ...base, x, y, z, rotY: 0.3, eyes: 'wide', mouth: 'grin', legL: { x: -1.2, kn: 1.2 }, legR: { x: -1.2, kn: 1.2 }, armR: { x: -2.6, z: 0.4, el: 0.2 } }); }
    const slideTop = (tt2) => toWorld(lerp(-1.35, -2.75, smooth(u01(tt2, DRV1, FLY0))), 2.2, 0.15);
    if (tt < FLY0) { const p = slideTop(tt), sl = tt > DRV1; return g.set({ ...base, x: p.x, y: p.y - 0.36 + (sl ? 0.06 * Math.abs(Math.sin(tt * 14)) : 0), z: p.z, rotY: sl ? 0.6 : 0.25, eyes: sl ? 'wide' : 'open', mouth: sl ? 'scream' : 'grin', brows: sl ? 1 : 0, legL: { x: -1.4, kn: 1.3 }, legR: { x: -1.4, kn: 1.3 }, armR: sl ? { x: -2.0 + 1.6 * Math.sin(tt * 16), z: 0.9 } : { x: -2.8 + 0.4 * Math.sin(tt * 9), z: 0.4, el: 0.3 }, armL: sl ? { x: -2.0 + 1.6 * Math.sin(tt * 16 + 2), z: 0.9 } : { x: -0.5, z: 0.5, el: 0.3 }, rz: sl ? 0.15 : 0 }); }
    const WALLX = TX1 - 4.38;
    if (tt < SPLAT + 0.6) { const p = slideTop(FLY0), u = u01(tt, FLY0, SPLAT); const [x, y, z] = hop(tt, FLY0, SPLAT, [p.x, p.y - 0.36, p.z], [WALLX + 0.2, 1.55, TZ + 0.55], 0.45); if (tt < SPLAT) return g.set({ ...base, x, y, z, rotY: -PI / 2, rz: -0.9 * u, eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.8, z: 0.4 }, armL: { x: -2.8, z: 0.4 }, legL: { x: 0.4 }, legR: { x: -0.4 } });
      const a = tt - SPLAT; return g.set({ ...base, x: WALLX + 0.2, y: 1.55 - 0.5 * easeInQuad(clamp(a / 0.6)), z: TZ + 0.55, rotY: 0.3, squash: [lerp(1.45, 1, clamp(a / 0.5)), lerp(0.6, 1, clamp(a / 0.5))], eyes: 'x', mouth: 'wavy', hatLift: 0.3, armR: { x: -2.4, z: 1.2 }, armL: { x: -2.4, z: 1.2 } }); }
    // BAFFLES: down to the lawn beside the tank; slots two baffles in (hammer), pants still burning
    const GB = [TX1 - 2.95, TZ + 1.9];
    if (tt < t.garys - 0.05) { hammer.visible = tt > t.split - 0.1; const [x, y, z] = tt < t.split ? hop(tt, SPLAT + 0.6, t.split, [WALLX + 0.2, 1.05, TZ + 0.55], [GB[0], 0, GB[1]], 0.5) : [GB[0], 0, GB[1]]; const hit = tt > BAF1 && tt < BAF2 + 0.5 ? Math.max(0, Math.sin((tt - BAF1) * 11)) : 0; return g.set({ ...base, x, y, z, rotY: 0.85, eyes: tt < t.split ? 'spiral' : 'half', mouth: 'teeth', brows: -0.6, armR: { x: -2.4 + 1.0 * hit, z: 0.6, el: 0.4 }, look: [0.7, 0.5], head: { x: -0.2, y: 0.3, z: 0 } }); }
    if (tt < t.nowP) { const u = u01(tt, t.garys - 0.05, t.fireB + 0.3); const run = tt > t.fireB - 0.2; const ang = (tt - (t.fireB - 0.2)) * 6; return g.set({ ...base, x: GB[0] + (run ? 0.45 * Math.sin(ang) : 0), z: GB[1] + (run ? 0.3 * (1 - Math.cos(ang)) : 0), rotY: run ? ang + PI / 2 : lerp(0.85, -0.9, smooth(clamp(u * 3))), walk: run ? tt * 20 : null, eyes: 'wide', mouth: 'scream', brows: 1, head: { x: run ? 0 : 0.35, y: run ? 0 : 1.0, z: 0 }, look: [run ? 0 : 0.8, -0.8], armR: { x: -1.2, z: 0.8, el: 1.3 }, armL: { x: -1.2, z: 0.8, el: 1.3 } }); }
    // PUMP: the dribble on his pants; the pump; 1,500 gpm; the hose holds Gary
    const GP = [TX1 - 2.95, TZ + 2.05];
    if (tt < t.n1500) { noz.g.visible = true; const dr = tt < t.soP; return g.set({ ...base, x: GP[0], z: GP[1], rotY: dr ? 0.35 : 0.9, eyes: dr ? 'half' : 'open', mouth: dr ? 'flat' : 'grin', brows: dr ? -0.4 : 0, armR: dr ? { x: -2.7, z: 0.0, el: 1.7 } : { x: -1.3, z: 0.1, el: 0.2 }, armL: dr ? undefined : { x: -1.2, z: -0.2, el: 0.4 }, look: dr ? [0.2, -0.6] : [0.7, 0.4] }); }
    if (tt < t.garyP2 - 0.05) { noz.g.visible = true; const slide = smooth(u01(tt, t.garyP, t.garyP2)); return g.set({ ...base, x: GP[0] + 0.6 * slide, z: GP[1], rotY: -1.05, eyes: tt > t.garyP ? 'wide' : 'half', mouth: tt > t.garyP ? 'teeth' : 'grin', brows: tt > t.garyP ? 0.5 : -0.5, armR: { x: -1.35, z: -0.25, el: 0.2 }, armL: { x: -1.25, z: 0.35, el: 0.3 }, lean: -0.25 * slide, legL: { x: -0.5 * slide }, legR: { x: 0.3 * slide } }); }
    const LOOP = V(TX1 - 3.3, 2.95, TZ + 2.0), LR = 0.8, ang = (tt) => -PI / 2 + (tt - (t.garyP2 - 0.05)) * 7.5;
    if (tt < t.crew) { noz.g.visible = true; const a = ang(tt), lift = smooth(u01(tt, t.garyP2 - 0.05, t.garyP2 + 0.3)), d = V(Math.cos(a), Math.sin(a), 0), H = LOOP.clone().addScaledVector(d, LR); const up = [GP[0] + 0.6, 0, GP[1]], fly = [H.x + 1.33 * d.x, H.y + 1.33 * d.y - 0.62, H.z]; const rz = Math.atan2(d.x, -d.y);
      return g.set({ ...base, x: lerp(up[0], fly[0], lift), y: lerp(up[1], fly[1], lift), z: lerp(up[2], fly[2], lift), rotY: lerp(-1.05, 0, lift), rz: rz * lift, eyes: 'spiral', mouth: 'scream', brows: 1, hairUp: 1, armR: { x: -2.95, z: 0.1 }, armL: { x: -2.95, z: 0.1 }, legL: { x: 0.6 * Math.sin(tt * 17) }, legR: { x: -0.6 * Math.sin(tt * 17) } }); }
    // DECK GUN: dropped; hops onto the roof, bolts the deck gun, rides it
    const GD = toWorld(-1.05, 2.46, 0.35);
    if (tt < t.soD) { const a = tt - t.crew; return g.set({ ...base, x: TX1 - 3.0, y: Math.max(0, drop(tt, t.crew, 1.1, 0.25) * 0), z: TZ + 2.1, rotY: 0.2, eyes: 'x', mouth: 'wavy', squash: squash(tt, t.crew, 0.3), rz: a < 0.1 ? 1.2 : 0 }); }
    if (tt < t.empties + 0.2) { hammer.visible = tt > t.boltD - 0.2 && tt < t.roof + 0.3; const [x, y, z] = hop(tt, t.soD, t.soD + 0.45, [TX1 - 3.0, 0, TZ + 2.1], [GD.x, GD.y, GD.z], 1.0); const hit = Math.max(0, Math.sin((tt - t.boltD) * 12)); const blast = tt > t.deck; return g.set({ ...base, x, y, z, rotY: blast ? -0.6 : 0.5, eyes: blast ? 'open' : 'half', mouth: blast ? 'grin' : 'teeth', brows: blast ? 0 : -0.5, armR: blast ? { x: -1.6, z: -0.3, el: 0.6 } : { x: -2.3 + 0.9 * hit, z: 0.3, el: 0.5 }, look: blast ? [-0.6, 0.2] : [0.3, -0.5], lean: blast ? 0 : 0.35 }); }
    // HYDRANT: empties; drags the supply hose to the hydrant; 6-sided wrench on a 5-sided nut; BONK
    const GH = [D.hyd.x + 0.02, D.hyd.z - 0.62];
    if (tt < t.main) { const worried = tt > t.n30; if (tt < t.tap - 0.1) return g.set({ ...base, x: GD.x, y: GD.y, z: GD.z, rotY: -0.3, eyes: worried ? 'wide' : 'open', mouth: worried ? 'frown' : 'grin', brows: worried ? 0.9 : 0, look: [0.3, -0.5] });
      const [x, y, z] = path(tt, t.tap - 0.1, t.main, [[GD.x, GD.y, GD.z], [TX1 - 3.2, 0, TZ + 1.6], [0.3, 0, -1.6], [GH[0] + 0.45, 0, GH[1]]]); return g.set({ ...base, x, y: Math.max(y, 0), z, rotY: -PI / 2 + 0.4, walk: tt * 18, lean: 0.4, eyes: 'wide', mouth: 'teeth', brows: -0.6, armR: { x: 0.7, z: 0.2, el: 0.3 } }); }
    if (tt < t.withW) { wrench.g.visible = tt > t.five - 0.2 && tt < t.person + 0.05; const crank = tt > t.random - 0.1 ? (tt - t.random) * 18 : 0; const bonk = tt > t.person - 0.05; if (bonk) dizzy.update(tt, 1, [GH[0], 1.62 + gary.root.position.y, GH[1] + 0.02]);
      return g.set({ ...base, x: GH[0], z: GH[1], rotY: 0.05, eyes: bonk ? 'spiral' : tt > t.cant ? 'wide' : 'half', mouth: bonk ? 'wavy' : tt > t.cant ? 'teeth' : 'flat', brows: bonk ? 1 : -0.6, armR: { x: -1.0 + 0.25 * Math.sin(crank), z: -0.35, el: 0.9 }, armL: { x: -1.0 - 0.25 * Math.sin(crank), z: -0.35, el: 0.9 }, look: [0, -0.7], squash: squash(tt, t.person - 0.05, 0.25), hatLift: bonk ? clamp(1 - (tt - t.person) * 2) * 0.5 : 0 }); }
    if (tt < t.cats) { wrench5.g.visible = tt > t.wrench - 0.1; const crank = tt > t.wrench ? Math.min(1, (tt - t.wrench) / 0.4) * 2.5 : 0; const cheer = tt > t.out; return g.set({ ...base, x: GH[0], z: GH[1], rotY: 0.05, eyes: cheer ? 'open' : 'half', mouth: cheer ? 'grin' : 'teeth', brows: cheer ? 0 : -0.6, armR: cheer ? { x: -2.7, z: 0.4, el: 0.3 } : { x: tt < t.wrench ? -1.6 : -1.0 + 0.25 * Math.sin(crank * 4), z: -0.35, el: tt < t.wrench ? 0.2 : 0.9 }, armL: cheer ? { x: -2.7, z: 0.4, el: 0.3 } : { x: -1.0, z: -0.35, el: 0.9 }, look: tt < t.wrench ? [0.8, 0.3] : [0, -0.7], squash: squash(tt, t.out, 0.12) }); }
    // LADDER: (while the camera is on the cat) runs + climbs onto the roof by the turntable, works the levers
    const GL = toWorld(-3.05, 2.46, 0.72);
    if (tt < t.reachesT) { if (tt < t.addL) { const [x, , z] = path(tt, t.cats, t.addL - 0.2, [[GH[0], 0, GH[1]], [0.6, 0, -2.0], [GL.x, 0, GL.z + 0.6]]); if (tt > t.addL - 0.6) { const [hx, hy, hz] = hop(tt, t.addL - 0.6, t.addL - 0.2, [GL.x, 0, GL.z + 0.6], [GL.x, GL.y, GL.z], 1.0); return g.set({ ...base, x: hx, y: hy, z: hz, rotY: PI / 2, legL: { x: -0.8, kn: 1.2 }, legR: { x: -0.8, kn: 1.2 } }); } return g.set({ ...base, x, y: 0, z, rotY: PI / 2, walk: tt * 18 }); }
      const up = tt > t.n100; return g.set({ ...base, x: GL.x, y: GL.y, z: GL.z, rotY: -0.4, eyes: up ? 'wide' : 'half', mouth: up ? 'o' : 'teeth', brows: up ? 0.6 : -0.4, armR: { x: -1.5 + 0.3 * Math.sin(tt * 9), z: -0.3, el: 0.6 }, look: up ? [-0.5, 1] : [-0.3, 0.2], head: { x: up ? -0.5 : 0, y: 0, z: 0 } }); }
    // TIP: runs back along the roof to the tail as it tips; rides the tail up; the slam throws him off; lands under the near rear jack
    const tailTop = (k) => toWorld(lerp(-3.05, -0.55, k), 2.46, 0.6);
    if (tt < SLAM) { const k = smooth(u01(tt, t.outT - 0.1, t.tips - 0.1)), p = tailTop(k); return g.set({ ...base, x: p.x, y: p.y, z: p.z, rotY: tt < t.tips ? PI / 2 + 0.5 : 0.3, walk: k > 0 && k < 1 ? tt * 18 : null, eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.6, z: 0.6 }, armL: { x: -2.6, z: 0.6 }, rz: -tipAngle(tt) * 0.8 }); }
    const LAND = [TX1 - 0.35, -2.05], OUTL = t.outriggers - 0.15;
    if (tt < OUTL) { const p0 = toWorld(-0.55, 2.46, 0.6); const [x, y, z] = hop(tt, SLAM, OUTL, [p0.x, p0.y, p0.z], [LAND[0] - 0.45, 0.25, LAND[1]], 1.4); return g.set({ ...base, x, y, z, rotY: 0, rz: -PI / 2 * u01(tt, SLAM, OUTL), rx: 2 * PI * u01(tt, SLAM, OUTL) * 0, eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.8, z: 0.6 }, armL: { x: -2.8, z: 0.6 } }); }
    // lying on his side under the near rear jack, face to the lens; SQUISH; peels off on "Dalmatians"
    if (tt < t.dalmatians + 0.15) { const sq = tt > SQUISH ? 1 : 0; return g.set({ ...base, x: LAND[0] - 0.45, y: -0.35 + (sq ? -0.12 : 0), z: LAND[1], rotY: 0, rz: -PI / 2, squash: sq ? [lerp(0.35, 0.25, clamp((tt - SQUISH) / 0.1)), 1.15] : squash(tt, OUTL, 0.2), eyes: sq ? 'x' : 'spiral', mouth: sq ? 'wavy' : 'o', brows: 1, armR: { x: -0.6, z: 1.0 }, armL: { x: -0.6, z: 1.0 }, hatLift: sq ? 0.4 : 0 }); }
    // FINISH → RESCUE: springs back, runs to the truck, climbs onto the turntable, up the ladder to the branch tip
    const ladBase = toWorld(-4.0, 3.28 - 0.12, 0), ladTip = REST.clone();
    if (tt < t.climbs - 0.1) { const a = tt - (t.dalmatians + 0.15); const pop2 = easeOutBack(clamp(a / 0.35), 2.5); if (a < 0.4) return g.set({ ...base, x: LAND[0] - 0.45, y: 0, z: LAND[1], rotY: 0.2, squash: [lerp(1.6, 1, pop2), lerp(0.2, 1, pop2)], eyes: 'spiral', mouth: 'wavy' });
      const [x, , z] = path(tt, t.dalmatians + 0.55, t.dont + 0.1, [[LAND[0] - 0.45, 0, LAND[1]], [TX1 - 1.5, 0, -2.4], [ladBase.x + 0.6, 0, -2.6]]); const y = tt > t.dont ? ladBase.y * smooth(u01(tt, t.dont, t.climbs - 0.1)) : 0; const zz = tt > t.dont ? lerp(-2.6, ladBase.z + 0.1, smooth(u01(tt, t.dont, t.climbs - 0.1))) : z; return g.set({ ...base, x: tt > t.dont ? lerp(ladBase.x + 0.6, ladBase.x, smooth(u01(tt, t.dont, t.climbs - 0.1))) : x, y, z: zz, rotY: -PI / 2, walk: tt * 18, lean: 0.2, eyes: 'open', mouth: 'grin' }); }
    if (tt < t.firefighters - 0.05) { const u = smooth(u01(tt, t.climbs - 0.1, t.catR + 0.05)), p = ladBase.clone().lerp(ladTip, u); return g.set({ ...base, x: p.x, y: p.y + 0.05, z: p.z + 0.18, rotY: -PI / 2 + 0.35, walk: u < 1 ? tt * 16 : null, lean: 0.45, eyes: 'open', mouth: 'grin', armR: { x: -1.6, z: 0.2, el: 0.4 }, armL: { x: -1.6 + 0.3 * Math.sin(tt * 16), z: 0.2, el: 0.4 } }); }
    const BR = REST.clone().add(V(0.0, -0.06, 0.18));
    if (tt < RET0 + 0.25) { const reach = tt < t.never; return g.set({ ...base, x: BR.x, y: BR.y, z: BR.z, rotY: -PI / 2 + 0.5, eyes: tt > t.say ? 'wide' : 'open', mouth: tt > t.skeleton ? 'o' : tt > t.say ? 'frown' : 'grin', brows: tt > t.say ? 0.6 : 0, armR: reach ? { x: -1.6, z: 0.1, el: 0.1 } : { x: -0.4, z: 0.4, el: 0.9 }, armL: reach ? { x: -1.5, z: 0.3, el: 0.2 } : undefined, look: tt > t.never ? [-0.6, -0.8] : [-0.6, 0.2], head: { x: tt > t.never ? 0.35 : 0, y: tt > t.never ? 0.5 : 0, z: 0 } }); }
    // END: the ladder pulls away — he grabs the branch and hangs there, legs kicking
    { const u = smooth(u01(tt, RET0 + 0.25, RET0 + 0.6)); const HANG = REST.clone().add(V(-0.25, -0.08 - (tt > t.stuck ? 0.12 * Math.exp(-(tt - t.stuck) * 3) * Math.abs(Math.cos((tt - t.stuck) * 12)) : 0), 0.05)); return g.set({ ...base, x: HANG.x, y: lerp(BR.y, HANG.y - 1.98, u), z: HANG.z + 0.12, rotY: 0.15, eyes: 'wide', mouth: tt > t.burgers2 - 0.2 ? 'scream' : 'teeth', brows: 1, armR: { x: lerp(-0.4, -3.05, u), z: 0.15 }, armL: { x: lerp(0, -3.05, u), z: 0.15 }, legL: { x: 0.5 * Math.sin(tt * 9) }, legR: { x: -0.5 * Math.sin(tt * 9) }, look: [0.4, -0.7], head: { x: 0.2, y: 0.2, z: 0 } }); }
  }

  // props in Gary's hands / the world, after he is posed
  function propsAt(tt) {
    gary.root.updateMatrixWorld(true);
    const hR = wpos(gary.hand(1), new THREE.Vector3()), hL = wpos(gary.hand(-1), new THREE.Vector3());
    // the squirt gun's jet (hook pews + the grease squirt)
    const pewOn = (tt > t.squirt - 0.05 && tt < t.gun + 0.5 && Math.sin((tt - t.squirt) * 9) > -0.2) || (tt > t.squirts && tt < FB - 0.02), hedgePew = tt > t.works - 0.05 && tt < t.need - 0.1;
    if ((pewOn || hedgePew) && gun.g.visible) { const p0 = wpos(gun.tip, v4); squirtJet.set(tt, p0, aimV(p0, hedgePew ? [-4.0, 1.4, D.hedge.z + 0.5] : [G.x + 0.15, 1.13, G.z + 0.05], hedgePew ? 0.55 : 0.32), { k: 1, age: (tt - (hedgePew ? t.works - 0.05 : tt > t.squirts ? t.squirts : t.squirt)) * 6 + 0.05, floor: hedgePew ? 1.2 : 1.1, spray: 0.4 }); } else squirtJet.set(tt, v4, v4, { k: 0 });
    // the garden hose (reel → Gary's hand) + its jet into the tote's top cap
    const gOn = tt > t.need && tt < t.bye + 0.2; gHose.mesh.visible = gOn; gardenJet.set(tt, v4, v4, { k: 0 });
    if (gOn) { gnoz.g.position.copy(hR).add(V(0.05, 0.02, 0)); gnoz.g.rotation.set(0, 0, 0.75); gHose.set([[4.3, 0.42, -11.4], [4.6, 0.04, -9.5], [4.9, 0.04, -6], [5.0, 0.05, -3.2], [hR.x - 0.25, hR.y - 0.25, hR.z], [hR.x, hR.y, hR.z]], 0.03);
      if (tt > FILL0 && tt < t.bye) { const p0 = wpos(gnoz.tip, v4); gardenJet.set(tt, p0, aimV(p0, [D.wagon[0] - 0.2, 1.5, D.wagon[1]], 0.38), { k: 1, age: tt - FILL0, floor: 1.35, spray: 0.3 }); } }
    // the handline: discharge → nozzle in Gary's hands; dribble, then 1,500 gpm, then the whip
    const lOn = tt > t.nowP - 0.4 && tt < t.crew + 0.15; lHose.mesh.visible = lOn; noz.g.visible = noz.g.visible && lOn; lineJet.set(tt, v4, v4, { k: 0 });
    if (lOn) {
      const D0 = toWorld(-3.85, 1.0, 1.3), hand = hR.clone().lerp(hL, 0.5);
      let dir;
      if (tt < t.n1500) dir = V(-0.25, -0.9, -0.35).normalize();
      else if (tt < t.garyP2 - 0.05) dir = aimV(hand, [-5.2, 1.3, D.hedge.z + 0.4], 1.5).normalize();
      else { const a = -PI / 2 + (tt - (t.garyP2 - 0.05)) * 7.5; dir = V(Math.sin(a), -Math.cos(a), 0.12).normalize(); }   // the spout kicks back against its own jet
      noz.g.position.copy(hand); noz.g.quaternion.setFromUnitVectors(V(1, 0, 0), dir);
      const mid = D0.clone().lerp(hand, 0.5); lHose.set([[D0.x, D0.y, D0.z], [D0.x + 0.1, 0.2, D0.z + 0.35], [mid.x, 0.06, mid.z + 0.2], [hand.x - dir.x * 0.6, Math.max(0.06, hand.y - 0.5), hand.z - dir.z * 0.6], [hand.x, hand.y, hand.z]], tt > t.n1500 ? 0.062 : 0.048);
      const p0 = wpos(noz.tip, v4);
      if (tt > t.dribbles - 0.15 && tt < t.soP) lineJet.set(tt, p0, dir.clone().multiplyScalar(0.6), { k: 0.35, age: tt - (t.dribbles - 0.15), floor: 0.05, r: 0.03, spray: 0.2 });
      else if (tt > t.n1500 - 0.05 && tt < t.garyP2 - 0.05) lineJet.set(tt, p0, aimV(p0, [-5.2, 1.3, D.hedge.z + 0.4], 1.5), { k: 1, age: tt - (t.n1500 - 0.05), floor: 0.05, stop: (q) => hedgeStop(q) || cabStop(q), r: 0.08 });
      else if (tt >= t.garyP2 - 0.05) lineJet.set(tt, p0, dir.clone().multiplyScalar(9), { k: 1, age: tt - (t.garyP2 - 0.05), floor: 0.05, stop: (q) => hedgeStop(q) || cabStop(q), r: 0.08 });
    }
    // the deck gun: aim at the hedge, blast on "deck gun"; the tank empties; the mega blast on "out"
    const dOn = tt > t.deck - 0.05 && tt < MEGA + 2.6;
    const tgt = [lerp(-3.5, -7.5, 0.5 + 0.5 * Math.sin(tt * 1.3)), 1.3, D.hedge.z + 0.3], TF2 = tt > MEGA - 0.1 ? 0.55 : 1.15;
    truck.g.updateMatrixWorld(true); const base0 = wpos(truck.deckGun, v3), vA = aimV(base0, tgt, TF2);
    const yaw = Math.atan2(-vA.z, vA.x), pitch = Math.atan2(vA.y, Math.hypot(vA.x, vA.z));
    if (tt > DECK0) { truck.dgYaw.rotation.y = yaw + 0; truck.dgPitch.rotation.z = pitch; }
    deckJet.set(tt, v4, v4, { k: 0 });
    if (dOn) { const p0 = wpos(truck.dgTip, v4), v0 = aimV(p0, tgt, TF2); const weak = tt < EMPTY1 ? 1 - 0.8 * smooth(u01(tt, EMPTY0, EMPTY1)) : 0; const mega = tt > MEGA ? clamp(1 - Math.max(0, tt - (MEGA + 2.2)) / 0.4) : 0;
      if (mega > 0) deckJet.set(tt, p0, v0, { k: Math.max(0.25, mega), age: tt - MEGA, floor: 0.05, stop: hedgeStop, r: 0.18, spray: 2 });
      else if (weak > 0.02) deckJet.set(tt, p0, v0.multiplyScalar(0.55 + 0.45 * weak), { k: Math.max(0.25, weak), age: tt - (t.deck - 0.05), floor: 0.05, stop: hedgeStop, r: 0.13 });
      else if (tt < EMPTY1 + 0.9) deckJet.set(tt, p0, v0.multiplyScalar(0.12), { k: 0.18, age: tt - EMPTY1, floor: 2.0, r: 0.05, spray: 0.2 }); }   // one last dribble off the nozzle
    // the supply hose (yellow LDH): truck intake → (dragged by Gary) → the hydrant; it swells when the hydrant opens
    const sOn = tt > t.tap - 0.15; sHose.mesh.visible = sOn;
    if (sOn) { const I0 = toWorld(-3.25, 0.98, 1.3), end = tt < t.main ? hR.clone() : V(D.hyd.x + 0.32, 0.4, D.hyd.z), swell = tt > OPEN + 0.2 ? 1 + 0.35 * smooth(u01(tt, OPEN + 0.2, OPEN + 0.6)) : 1;
      sHose.set([[I0.x, I0.y, I0.z], [I0.x - 0.05, 0.15, I0.z + 0.4], [lerp(I0.x, end.x, 0.4), 0.08, lerp(I0.z + 0.4, end.z, 0.5) + 0.2], [lerp(I0.x, end.x, 0.8), 0.08, end.z - 0.25], [end.x + 0.15, Math.max(0.12, end.y - 0.1), end.z], [end.x, end.y, end.z]], 0.075 * swell); }
    // wrenches
    if (wrench.g.visible) { if (tt < t.split + 1) { wrench.g.position.copy(hR); wrench.g.rotation.set(0, 0, 1.4); }
      else if (tt < t.person - 0.05) { const spin = tt > t.random ? (tt - t.random) * 14 : 0; wrench.g.position.set(D.hyd.x, 0.79, D.hyd.z); wrench.g.rotation.set(PI / 2, 0, spin + 0.3); wrench.g.translateY(-0.44); }
      else { const a = tt - (t.person - 0.05); wrench.g.position.set(D.hyd.x + 1.4 * a, 1.55 + 2.2 * a - 4.9 * a * a, D.hyd.z - 0.5 + 0.6 * a); wrench.g.rotation.set(a * 9, 0, a * 14); } }
    if (wrench5.g.visible) { if (tt < t.wrench) { const p = hop(tt, t.withW, t.wrench, toWorld(-2.9, 1.1, 1.3).toArray(), [hR.x, hR.y, hR.z], 1.2); wrench5.g.position.set(...p); wrench5.g.rotation.set(tt * 12, 0, tt * 8); }
      else { const crank = Math.min(1, (tt - t.wrench) / 0.4) * 2.5; wrench5.g.position.set(D.hyd.x, 0.79, D.hyd.z); wrench5.g.rotation.set(PI / 2, 0, crank + 0.3); wrench5.g.translateY(-0.44); } }
    // the hydrant + the main: closed until the right wrench; then the stem drops, water climbs the barrel, the main flows to it
    const open = tt > OPEN ? smooth(u01(tt, OPEN, OPEN + 0.25)) : 0; S.setBarrel(open, tt > OPEN + 0.1 ? smooth(u01(tt, OPEN + 0.1, OPEN + 0.5)) : 0, tt); S.setMainFlow(tt, tt > OPEN ? 1 : 0.35);
    S.hyd.nut.rotation.y = tt > t.wrench ? Math.min(1, (tt - t.wrench) / 0.4) * 2.5 : 0;
  }

  // the cat
  const BS = V(...D.tree.branch[0]), BE = V(...D.tree.branch[1]), bpt = (u) => BS.clone().lerp(BE, u).add(V(0, 0.09, 0));
  const TRUNK = V(D.tree.x + 0.05, 0, D.tree.z + 0.44), LID = V(G.x - 0.1, 1.4, G.z + 0.02);
  const qBack = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(-1, 0, 0), V(0, 0, 1), V(0, 1, 0)));   // head up, back to the lens, belly on the trunk
  function catAt(tt) {
    const c = cat; c.root.quaternion.identity();
    const blink = (tt % 3.7) < 0.12 ? 0.95 : 0;
    if (tt < t.firefighters) {
      const yawn = tt > t.impressed - 0.25 ? Math.sin(PI * u01(tt, t.impressed - 0.25, t.impressed + 0.8)) : 0;
      const startle = tt > FB && tt < FB + 0.7 ? 1 - u01(tt, FB, FB + 0.7) : 0, up = tt > t.reaches && tt < t.aerial ? smooth(u01(tt, t.reaches, t.n100)) : 0;
      let lx = 0.5, ly = -0.5; if (tt > t.hedges && tt < t.ladder1) { lx = 0.9; ly = -0.6; } if (up) { lx = 0.6; ly = 1; } if (tt > t.climbs) { lx = 0.8; ly = -0.3; }
      return c.set({ x: CATP.x, y: CATP.y, z: CATP.z, rotY: 0.55, sit: 1, scale: CS, lids: Math.max(blink, lerp(0.58, 0.05, startle)), look: [lx, ly], yawn, t: tt, headYaw: tt > t.twenty - 0.3 && tt < t.twenty + 1 ? -0.3 : 0, headPitch: up ? -0.5 * up : 0, tail: 1 });
    }
    if (tt < t.never) { const st = smooth(u01(tt, t.firefighters, t.firefighters + 0.3)), u = lerp(0.83, 0.05, smooth(u01(tt, t.firefighters + 0.25, t.never))), p = bpt(u); return c.set({ x: p.x, y: p.y - 0.03, z: p.z, rotY: lerp(0.55, -2.35, st), sit: 1 - st, walk: tt * 14, walkAmt: st, scale: CS, lids: 0.6, t: tt }); }
    if (tt < t.treeR + 0.1) { const u = smooth(u01(tt, t.never + 0.25, t.treeR)), y = lerp(5.1, 0.25, u), b = smooth(u01(tt, t.never, t.never + 0.25)), p0 = bpt(0.05); c.set({ x: lerp(p0.x, TRUNK.x, b), y: lerp(p0.y, y, b), z: lerp(p0.z, TRUNK.z, b), rotY: -2.35, scale: CS, sit: 0, walk: tt * 16, lids: 0.5, t: tt }); q1.setFromEuler(new THREE.Euler(0, -2.35, 0)); c.root.quaternion.copy(q1).slerp(qBack, b); return; }
    const p = path(tt, t.treeR + 0.1, t.burgers - 0.25, [[TRUNK.x, 0, TRUNK.z + 0.2], [-7.0, 0, -4.6], [G.x - 0.9, 0, G.z + 0.5]]);
    if (tt < t.burgers - 0.25) return c.set({ x: p[0], y: 0, z: p[2], rotY: PI / 2 - 0.2, walk: tt * 13, scale: CS, lids: 0.55, t: tt });
    if (tt < t.burgers + 0.1) { const [x, y, z] = hop(tt, t.burgers - 0.25, t.burgers + 0.1, [G.x - 0.9, 0, G.z + 0.5], [LID.x, LID.y, LID.z], 0.9); return c.set({ x, y, z, rotY: PI / 2, scale: CS, lids: 0.4, t: tt }); }
    const eat = tt > t.catE - 0.1 ? 1 : 0; catBurger.visible = tt > t.ate - 0.1; return c.set({ x: LID.x, y: LID.y, z: LID.z, rotY: PI / 2 - 0.3, sit: eat ? 0.3 : 1, scale: CS, lids: eat ? 0.85 : 0.6, eat, headPitch: eat ? 0.25 : 0.15 + 0.1 * Math.sin(tt * 3), headYaw: eat ? 0 : 0.25, t: tt, tail: 1.5 });
  }

  // the Dalmatian
  const POLE = [TX1 - 3.65, -2.75], DOGRUN = [-3.6, -2.45];
  function dogAt(tt) {
    const d = dog; d.root.visible = tt > t.dalmatian - 0.05; pole.visible = tt > t.pole - 0.1; qMark.visible = false;
    pole.position.set(POLE[0], 0, POLE[1]); pole.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, t.pole - 0.1, t.pole + 0.2), 2)));
    if (!d.root.visible) return;
    if (tt < t.dalmatians - 0.12) { const y = lerp(2.55, 0.05, easeInQuad(u01(tt, t.dalmatian + 0.15, t.dalmatians - 0.12))); return d.set({ x: POLE[0] + 0.22, y, z: POLE[1] + 0.12, rotY: -PI / 2, pole: 1, scale: easeOutBack(u01(tt, t.dalmatian - 0.05, t.dalmatian + 0.2), 2.4), t: tt, tongue: 1 }); }
    if (tt < t.horses + 0.05) { const [x, , z] = path(tt, t.run - 0.25, t.horses, [[POLE[0] + 0.3, 0, POLE[1] + 0.3], [DOGRUN[0], 0, DOGRUN[1]]]); return d.set({ x, y: 0, z, rotY: -PI / 2, run: tt * 16, t: tt, tongue: 1 }); }
    if (tt < t.end) { const look = tt > t.dont - 0.1 && tt < t.horses2 + 0.6 ? Math.sin((tt - t.dont) * 5) * 0.8 : 0; qMark.visible = tt > t.horses2 - 0.05 && tt < t.firefighters; if (qMark.visible) { qMark.position.set(DOGRUN[0], 1.15, DOGRUN[1]); qMark.scale.setScalar(0.5 * easeOutBack(u01(tt, t.horses2 - 0.05, t.horses2 + 0.2), 2.5)); }
      return d.set({ x: DOGRUN[0], y: 0, z: DOGRUN[1], rotY: 0.3, sit: tt > t.horses2 - 0.1 ? 1 : 0, headYaw: look, headPitch: tt > t.firefighters ? -0.5 : 0, t: tt, tongue: tt < t.dont ? 1 : 0 }); }
    const PED = toWorld(-3.85, 2.46, 0.95);
    if (tt < RET0) { const run = path(tt, t.end, RET0 - 0.45, [[DOGRUN[0], 0, DOGRUN[1]], [PED.x - 0.4, 0, -2.4]]); if (tt < RET0 - 0.45) return d.set({ x: run[0], y: 0, z: run[2], rotY: PI / 2, run: tt * 16, t: tt, tongue: 1 });
      const [x, y, z] = hop(tt, RET0 - 0.45, RET0 - 0.05, [PED.x - 0.4, 0, -2.4], [PED.x, PED.y, PED.z], 0.9); return d.set({ x, y, z, rotY: PI / 2, t: tt }); }
    return d.set({ x: PED.x, y: PED.y, z: PED.z, rotY: 0.2, sit: tt > RET0 + 0.6 ? 1 : 0, headPitch: tt < RET0 + 0.4 ? 0.6 : -0.3, t: tt, tongue: 1 });
  }

  // the fire-triangle sign + fires
  function triAt(tt) {
    tri.g.visible = tt > t.needs - 0.12 && tt < t.hedge + 1.0; if (!tri.g.visible) return;
    tri.g.position.set(TRI[0], 0, TRI[1]); tri.g.rotation.y = -0.25; tri.g.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, t.needs - 0.12, t.needs + 0.15), 2.2) * (tt > t.hedge + 0.7 ? 1 - u01(tt, t.hedge + 0.7, t.hedge + 1.0) : 1)));
    for (const [b, w] of [[tri.heat, t.heat], [tri.fuel, t.fuel], [tri.air, t.air]]) b.g.scale.setScalar(1 + 0.35 * Math.sin(PI * u01(tt, w - 0.05, w + 0.3)));
    if (tt > t.lid) { const a = tt - t.lid; tri.air.g.position.set(-1.5 * a, 1.05 + 1.3 * 0.38 + 2.2 * a - 4.9 * a * a, 0.4 * a); tri.air.g.rotation.z = -a * 8; tri.air.g.visible = a < 0.9; } else { tri.air.g.position.set(0, 1.05 + 1.3 * 0.38, 0); tri.air.g.rotation.z = 0; tri.air.g.visible = true; }
  }
  function firesAt(tt) {
    fires.set('grill', tt < t.lid ? (tt < FB ? 1 : 1.6 - 0.6 * u01(tt, FB, FB + 1)) : 0);
    HX.forEach((x, i) => { const ig = t.hedge - 0.3 + Math.abs(x - G.x) / 16; let k = tt < ig ? 0 : smooth(u01(tt, ig, ig + 0.25)); if (tt > t.deck + 0.9) k *= 1 - 0.65 * smooth(u01(tt, t.deck + 0.9, t.deck + 1.8)); if (tt > EMPTY0 + 0.4) k = Math.max(k, smooth(u01(tt, EMPTY0 + 0.4, EMPTY1 + 0.4))); if (tt > MEGA + 0.45) k *= 1 - smooth(u01(tt, MEGA + 0.4 + i * 0.04, MEGA + 0.85 + i * 0.04)); fires.set('h' + i, k); });
    fires.set('embers', tt > MEGA + 1.0 ? 0.7 * smooth(u01(tt, MEGA + 1.0, MEGA + 1.6)) : 0);
    fires.set('hedgeEmber', tt > FB + 0.3 && tt < t.hedge ? 0.5 * smooth(u01(tt, FB + 0.3, FB + 1.2)) : 0);
    S.setChar(tt < t.hedge ? 0 : 0.9 * smooth(u01(tt, t.hedge, MEGA + 1.2)));
    if (pantsOn(tt)) { const r = gary.root, b = V(0, 0.42, -0.16).applyAxisAngle(V(0, 1, 0), r.rotation.y).add(r.position); fires.set('pants', pantsK(tt), [b.x, b.y, b.z]); } else fires.set('pants', 0);
  }

  function update(tt) {
    truckAt(tt); tankAt(tt); wagonAt(tt); grillAt(tt); triAt(tt);
    garyAt(tt); catAt(tt); dogAt(tt); propsAt(tt); firesAt(tt);
    const cam = rail.at(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    kick.apply(studio.camera, tt, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]));
    S.aimSun(cam.look[0], cam.look[1], Math.max(8, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.7));
    fx.update(tt, studio.camera); fires.update(tt, studio.camera);
  }

  // QC (`node tools/render.mjs 033-squirt-gun-fire-truck --qc`): faces (Gary, the cat) under the caption/callouts (from 026)
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, head] of [['Gary', gary.head], ['the cat', cat.head]]) {
        head.updateWorldMatrix(true, false); head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    update(0); return out;
  };
  update(0);
  return { update };
}
