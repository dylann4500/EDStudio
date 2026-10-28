// 039 — "How a Flashlight Becomes a Lighthouse" (build genre, TURBO pace: docs/BUILD.md → Turbo pace). ONE continuous camera take
// around a rock islet in the open sea (engine/build/lighthouse.js). The tower is cut open at z = 0 (camera mostly on +z): spiral
// stairs, the weight shaft, the watch room clockwork, the lantern room + lens. Gary builds every step and takes every failure:
// flung into the sea by a tugboat, blinded by his own mirror, washed off the gallery, deafened by his own foghorn. A SEAGULL
// steals his batteries, pops out of the clockwork like a cuckoo, rides the lens like a carousel, poops on the daymark and,
// at the end, is the only thing still crashing into the rock. Everything is keyed to the spoken word: W(beat, word).
// Linear growth of the light (one visible stage per fix): flashlight → oil lamp → lamp rides up the rising tower → copper
// parabolic mirror → (glass boulder sliced into rings) Fresnel lens → clockwork + falling weight → mercury bath → a second
// bullseye (FL(2) 10 s) → flared granite base → foghorn → spiral daymark → radio, helipad, bird perch.
// Escalation: golden hook → sunset → night (beams) → storm (the tower leans) → fog → day → the giant wave → sunset ending.
//
// Facts (web-searched Oct 28 2026; full list in caption.md's comment):
//   Horizon / geographic range: d (nmi) = 1.17·√(h ft) (Bowditch; USCG Light List). 6 ft eye → 2.9 nmi ("three miles");
//     200 ft light → 16.5 + 15 ft bridge 4.5 = 21 nmi ("twenty miles"); √ → 4× higher = 2× farther. The sea's curve in the
//     range beat is EXAGGERATED (R = 150 m) so a tug 56 m out is hull-down from the rock and fully visible from the top.
//   Argand burner ≈ 5 candlepower; silvered copper parabolic reflectors raised it almost 400× (Britannica, "Lighthouse:
//     optical equipment"); the Fresnel lens system 80,000 cd (Britannica).
//   Fresnel lens (1822): a convex lens that size was impractical for its size and weight; Fresnel rebuilt the curvature in
//     rings (NPS Cape Hatteras "The Fresnel Lens"). First-order lens ≈ 8 ft tall, 6 ft across, ~4,000 lb (CA State Parks).
//   Clockwork: a weight on a cable down a tube in the tower; at St. Augustine it hit bottom every 2.5 h (staugustinelighthouse.org).
//   Mercury bath: Bourdelles, 1890; a ~4-ton optic turned with one finger (USLHS; South Foreland history).
//   Light characteristic: colour, rhythm, period (IALA R0110). Ours: two flashes every 10 s = two bullseyes 36° apart, one
//     turn per 10 s (beams below are driven by exactly that).
//   Smeaton's Tower (1759): dovetailed granite + marble dowels, shaped on an oak trunk; replaced in 1877 because the ROCK
//     under it was eroding; the tower stands on Plymouth Hoe today (Wikipedia; Trinity House).
//   Diaphone foghorn: compressed air, the largest heard up to ~8 nmi (Britannica "Lighthouse: sound signals").
//   Cape Hatteras: black-and-white spiral daymark, 1873 (NPS CAHA). Final cost $167,500 (NPS) × 25.49 (BLS CPI 1870 → 2026,
//     officialdata.org) ≈ $4.27 M. Bird perches on lanterns: Trinity House + RSPB at South Bishop. Helipad above the lantern:
//     Eddystone (Trinity House).
//   The big wave: real storm waves don't top a 200 ft tower (record ≈ 26–30 m); they bury rock lighthouses in white water —
//     La Jument, 21 Dec 1989, waves est. 20–30 m (Jean Guichard; Wikipedia "La Jument"; Snopes). On screen: an ~11 m breaker
//     whose spray climbs and swallows the tower. "Dovetailing" = the joint Smeaton cut into every granite course.
import * as THREE from 'three';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon, makeShades } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildLighthouse, D, seaH, floatPose, makeGull, makeTug, makeSailboat, makeCruise, makeBarge, makeFish, makeFlashlightProp, makeBoulder, makeFresnelDisc, makeOak, makeSkirt, makeHorn, makeHelipad, makePerch, makeRadio, makeBigWave, makeFreighter, tex } from '@engine/build/lighthouse.js';

const PI = Math.PI, TAU = PI * 2;

export async function build(studio, story) {
  const S = await buildLighthouse(studio), scene = S.root, B = beatClock(story);
  const W = (b, w, n) => B.W(b, w, n), END = story.duration;
  const fx = makeFX(scene, { max: { crumb: 900, drops: 1600, dust: 420, spark: 600, confetti: 900, smoke: 300, glow: 120, mist: 500, rain: 2400, rock: 400 }, nearFade: [1.4, 3.6], unlit: ['drops', 'rain'] });
  { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx), pale = (k, o) => (k === 'drops' ? { color: 0xe4f4ff, ...o, size: (o.size ?? [0.025, 0.06]).map((v) => v * 0.55) } : o);   // r2 look: spray = small pale droplets (blue spheres read as grapes)
    fx.burst = (k, tt, o = {}) => b0(k, tt, pale(k, o)); fx.stream = (k, a, b, o = {}) => s0(k, a, b, pale(k, o)); }
  const FXN = { burst: 0, stream: 0, times: [] }; { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx); fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); return b0(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); return s0(k, t0, t1, o); }; }   // turbo density counts (--qc prints them)
  const RY = D.RY, GY = D.GY, FY = D.focal[1], TW = D.T.watch, tw = S.tw, Lt = S.Lt;
  const skirt = makeSkirt(tw);
  let FALLS = [3, GY, 0];

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    crashing: W('hook', 'crashing'), so0: W('hook', 'so'), waves: W('hook', 'waves'), flashlight: W('hook', 'flashlight'), tugboat: W('hook', 'tugboat'), hits: W('hook', 'hits'), garyH: W('hook', 'gary', 2),
    congrats: W('congrats', 'congratulations'), built: W('congrats', 'built'), worst: W('congrats', 'worst'), seagull: W('congrats', 'seagull'), stole: W('congrats', 'stole'), batteries: W('congrats', 'batteries'), andC: W('congrats', 'its'), dark: W('congrats', 'dark'), yet: W('congrats', 'yet'),
    garyR: W('range', 'gary'), lights: W('range', 'lights'), oil: W('range', 'oil'), lamp: W('range', 'lamp'), ships: W('range', 'ships'), see: W('range', 'see'), deck: W('range', 'three'), horizons: W('range', 'three'), three: W('range', 'three'), away: W('range', 'out'), hides: W('range', 'curves'), behindR: W('range', 'over'),
    build: W('range', 'build'), up: W('range', 'up'), calledR: W('range', 'called'), geographic: W('range', 'geographic'), rangeW: W('range', 'range'), four: W('range', 'four'), higher: W('range', 'higher'), twice: W('range', 'twice'), far: W('range', 'far'), two: W('range', 'two'), feet: W('range', 'feet'), twenty: W('range', 'twenty'), miles: W('range', 'miles', 2),
    shines: W('reflector', 'shines'), everywhere: W('reflector', 'everywhere'), sky: W('reflector', 'everywhere') + 0.25, fish: W('reflector', 'everywhere') + 0.55, mirror: W('reflector', 'mirror'), parabolic: W('reflector', 'parabolic'), reflectorW: W('reflector', 'reflector'), one: W('reflector', 'one'), beam: W('reflector', 'beam'), fourR: W('reflector', 'four'), brighter: W('reflector', 'brighter'), garyF: W('reflector', 'gary'), looked: W('reflector', 'looked'), into: W('reflector', 'into'),
    garyL: W('lens', 'gary'), sunglasses: W('lens', 'sunglasses'), now: W('lens', 'now'), lensW: W('lens', 'lens'), big: W('lens', 'big'), glassL: W('lens', 'glass'), boulder: W('lens', 'boulder'), fresnel: W('lens', 'fresnel'), sliced: W('lens', 'sliced'), rings: W('lens', 'rings'), calledL: W('lens', 'called'), fresnel2: W('lens', 'fresnel', 2), lens2: W('lens', 'lens', 2),
    same: W('lens', 'same'), bend: W('lens', 'bend'), way: W('lens', 'way'), glass2: W('lens', 'glass', 2), garyC: W('lens', 'gary', 2), carries: W('lens', 'carries'), tons: W('lens', 'tons'), upstairs: W('lens', 'upstairs'), eighty: W('lens', 'upstairs') + 0.3, candlepower: W('lens', 'upstairs') + 0.9,
    oneC: W('clock', 'one'), beamC: W('clock', 'beam'), points: W('clock', 'points'), wayC: W('clock', 'way'), cruise: W('clock', 'cruise'), sneaks: W('clock', 'sneaks'), behind: W('clock', 'behind'), falling: W('clock', 'falling'), weights: W('clock', 'weights'), spin: W('clock', 'spin'), lensC: W('clock', 'lens'),
    giant: W('clock', 'giant'), cuckoo: W('clock', 'cuckoo'), clockW: W('clock', 'clock'), clockwork: W('clock', 'clockwork'), drive: W('clock', 'drive'), every: W('clock', 'every'), hours: W('clock', 'hours'), garyK: W('clock', 'gary'), cranks: W('clock', 'cranks'), upK: W('clock', 'up', 2), allK: W('clock', 'up', 2) + 0.35, night: W('clock', 'up', 2) + 0.55,
    twoM: W('mercury', 'two'), barely: W('mercury', 'barely'), turns: W('mercury', 'turns'), float: W('mercury', 'float'), mercury: W('mercury', 'mercury'), mercury2: W('mercury', 'mercury', 2), bath: W('mercury', 'bath'), nowM: W('mercury', 'now'), finger: W('mercury', 'finger'), spins: W('mercury', 'spins'), seagullM: W('mercury', 'seagull'), rides: W('mercury', 'rides'), carousel: W('mercury', 'carousel'),
    thenC: W('char', 'ship') - 0.15, mistakes: W('char', 'mistakes'), door: W('char', 'door'), each: W('char', 'each'), rhythm: W('char', 'rhythm'), characteristic: W('char', 'characteristic'), yours: W('char', 'yours'), twoC: W('char', 'two'), flashes: W('char', 'flashes'), seconds: W('char', 'seconds'), garys: W('char', 'garys'), help: W('char', 'help'),
    storm: W('storm', 'storm'), wavesS: W('storm', 'waves'), bricks: W('storm', 'bricks'), whole: W('storm', 'whole'), leans: W('storm', 'leans'),
    rebuild: W('smeaton', 'rebuild'), granite: W('smeaton', 'granite'), puzzle: W('smeaton', 'puzzle'), pieces: W('smeaton', 'pieces'), wide: W('smeaton', 'flared'), oak: W('smeaton', 'oak'), dovetailed: W('smeaton', 'dovetailing'), towerS: W('smeaton', 'dovetailing'), smeatons: W('smeaton', 'smeatons'), rockS: W('smeaton', 'rock'),
    fog: W('fog', 'fog'), inF: W('fog', 'in'), nobody: W('fog', 'in') + 0.1, anything: W('fog', 'in') + 0.3, horn: W('fog', 'horn'), compressed: W('fog', 'compressed'), air: W('fog', 'air'), foghorn: W('fog', 'foghorn'), hear: W('fog', 'hear'), eight: W('fog', 'eight'), out: W('fog', 'out'), garyFg: W('fog', 'gary'), foot: W('fog', 'foot'), what: W('fog', 'what'),
    by: W('daymark', 'by'), stick: W('daymark', 'stick'), paint: W('daymark', 'paint'), daymark: W('daymark', 'daymark'), cape: W('daymark', 'cape'), spiral: W('daymark', 'spiral'), seagullD: W('daymark', 'seagull'), polka: W('daymark', 'polka'), dots: W('daymark', 'dots'),
    bigW: W('wave', 'big'), waveW: W('wave', 'wave'), taller: W('wave', 'swallows'), towerW: W('wave', 'tower'), goes: W('wave', 'whole'), over: W('wave', 'swallows'), top: W('wave', 'tower'),
    holds: W('hold', 'holds'), lensH: W('hold', 'holds') + 0.35, turning: W('hold', 'and'), andH: W('hold', 'and'), once: W('hold', 'and') + 0.3, misses: W('hold', 'misses'), rockH: W('hold', 'rock'),
    add: W('finish', 'add'), radio: W('finish', 'radio'), helipad: W('finish', 'helipad'), perch: W('finish', 'perch'), birds: W('finish', 'birds'), fly: W('finish', 'fly'), lighthouses: W('finish', 'lighthouses'),
    end: W('end', 'congratulations'), lighthouseE: W('end', 'lighthouse'), wanted: W('end', 'wanted'), boats: W('end', 'boats'), rockE: W('end', 'rock'), fourE: W('end', 'four'), dollars: W('end', 'dollars'), garyE: W('end', 'gary'), blind: W('end', 'blind'), soaked: W('end', 'soaked'), deaf: W('end', 'deaf'), boats2: W('end', 'boats', 2), miss: W('end', 'miss'), seagullE: W('end', 'seagull'), doesnt: W('end', 'doesnt'),
    only: W('end2', 'only'), still: W('end2', 'still'), rockEnd: W('end2', 'rock'),
  };
  const mono = (...xs) => { for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + 0.12); return xs; };   // scratch word times can come out of order
  [t.same, t.bend, t.way, t.glass2, t.garyC, t.carries, t.tons, t.upstairs, t.eighty, t.candlepower] = mono(t.same, t.bend, t.way, t.glass2, t.garyC, t.carries, t.tons, t.upstairs, t.eighty, t.candlepower);
  [t.characteristic, t.yours, t.twoC, t.flashes, t.seconds] = mono(t.characteristic, t.yours, t.twoC, t.flashes, t.seconds);
  // derived event times (mirrored in make_cues.py)
  const SB = t.crashing + 0.05, TUG = t.hits + 0.04, FL0 = TUG + 0.06, SPL = FL0 + 0.55;                 // sailboat bonk; the tug hits; Gary flung → splash
  const CL0 = SPL + 0.3, CL1 = Math.max(CL0 + 0.7, t.worst - 0.25), STAND = CL1 + 0.3;                     // up the ladder
  const GIN = t.seagull - 0.55, GLAND = t.seagull + 0.05, BAT = t.batteries + 0.02, GOFF = BAT + 0.18;      // the gull: in, lands on the flashlight, YOINK
  const WALK0 = t.garyR - 0.15, LIGHT = t.oil, PICK = t.see;                                             // Gary lights the lamp, picks it up
  const CURVE0 = t.hides - 0.25, CURVE1 = t.behindR + 0.25, CURVEOFF0 = t.twenty, CURVEOFF1 = t.everywhere + 0.3, SEA_R = 70;     // the sea's curve (exaggerated: R 70 m hides a lamp 3.4 m up from a deck 2.3 m up, 55 m away), on "curves over it"
  const GROW0 = W('range', 'so') - 0.05, GROW1 = Math.max(GROW0 + 1.0, t.calledR), TOPPOP = GROW1, LAMPSET = t.far + 0.25;   // the tower rises, the lantern pops on
  const SPOT = t.geographic + 0.3;                                                                       // the tug's lookout spots the lamp
  const RAYS0 = t.shines - 0.05, MIR = t.mirror - 0.05, BEAM0 = MIR + 0.18, BRIGHT = t.fourR, LOOK0 = t.garyF - 0.1, BLAST = t.into;
  const SHADES = t.sunglasses - 0.05, SLIDE0 = t.now, SLIDE1 = t.boulder - 0.45, BARGE0 = t.garyL - 0.6, THUD = t.boulder;
  const CUTS = [t.sliced - 0.12, t.sliced + 0.2, t.sliced + 0.5], SPLIT = t.rings + 0.05, ASM0 = t.calledL - 0.1, ASM1 = t.lens2 + 0.15;
  const LIFT = t.way - 0.05, HOP0 = LIFT + 0.45, CLIMB0 = HOP0 + 0.25, CLIMB1 = Math.max(CLIMB0 + 1.2, t.eighty - 0.35), SET = CLIMB1 + 0.18, LIT = t.eighty;
  const CBONK = t.behind + 0.05, WT0 = t.falling - 0.05, CUCKOO = t.cuckoo - 0.08, TL0 = t.every - 0.1, BOT = t.hours + 0.1, CR0 = t.cranks - 0.15, CR1 = t.upK + 0.25, NIGHT0 = t.allK - 0.05;
  const STUCK0 = t.twoM, POUR0 = t.float - 0.1, POUR1 = t.bath + 0.05, POKE = t.finger, CAR0 = t.seagullM - 0.35;
  const SAIL_BONK = t.door + 0.02, BULL = t.rhythm - 0.25, MORSE0 = t.garys - 0.05, MORSE1 = t.help + 0.65;
  const STORM = t.storm, BRK = t.bricks - 0.05, LEAN0 = t.whole - 0.05, LEAN1 = t.leans + 0.45;
  const SK0 = t.granite - 0.15, SK1 = t.pieces + 0.35, FLARE = t.wide - 0.05, OAK = t.oak - 0.3;
  const FALL0 = t.leans + 0.05, FALLE = FALL0 + 0.7, GETUP = Math.max(SK0 - 0.6, FALLE + 0.35);   // Gary slides off the leaning lantern and lands on the rock
  const FOG0 = t.fog - 0.1, FOG1 = t.inF + 0.4, FBONK = t.anything + 0.02, HORN = t.horn - 0.05, PUMP0 = t.compressed - 0.25, PUMP1 = t.air + 0.25, HB1 = t.foghorn, HB2 = t.foot;
  const CLEAR0 = t.by - 0.35, CLEAR1 = t.by + 0.5, CHAIR0 = t.paint - 0.2, PAINT1 = t.spiral + 0.35, DOT = [t.polka - 0.15, t.polka + 0.05, t.dots + 0.02];
  const WV0 = t.bigW - 0.2, IMPACT = t.over - 0.08, WASH1 = IMPACT + 1.05;
  const SAIL_MISS0 = t.andH - 1.4, FLIP = t.rockH - 0.4;   // r3: the card has flipped by the time its callout lands
  const paintY = (tt) => lerp(RY + 0.45, GY - 0.3, smooth(u01(tt, CHAIR0 + 0.1, PAINT1)));   // the chair is hoisted from the rock (the paint starts above the granite skirt)
  const GLB = t.lighthouses + 0.02;   // r2 comedy: "birds really do fly into lighthouses" — the gull bonks the lantern glass (plants the final BONK)
  const GBONK = t.doesnt + 0.02, GFALL0 = GBONK + 0.12, GLAND2 = GFALL0 + 0.75, CARD0 = GBONK;   // the gull hits the sign: the card flips 1 → 0 on the BONK

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const shades = makeShades(0.075, 0.1); gary.head.add(shades); shades.position.set(0, 0.05, 0.3);
  const gull = makeGull(); scene.add(gull.root);
  const tug = makeTug(), sail = makeSailboat(), cruise = makeCruise(), barge = makeBarge(), freighter = makeFreighter(); [tug, sail, cruise, barge, freighter].forEach((b) => scene.add(b.g));
  const capt = makeToon({ shirt: 0x1d3f7a, pants: 0x1b1b1b, hair: 0x9a9a9a, hairStyle: 'messy', hat: 'cap', hatColor: 0x23315c, mustache: 0xdddddd });   // r4 logic: a navy captain's cap (yellow read as Gary) tug.body.add(capt.root);
  const scope = mk(new THREE.CylinderGeometry(0.03, 0.045, 0.32, 10), mat(0xc9a24a, 0.4), capt.hand(1), 0, -0.05, 0.12); scope.rotation.x = PI / 2;
  const tugCam = new THREE.Object3D(); tug.body.add(tugCam); tugCam.position.set(0.6, 1.6, 0.3);   // the camera mount on the tug's deck (behind the lookout on the foredeck)
  const TYAW = PI + 0.3, TUGCAM0 = [53 + 0.6 * Math.cos(TYAW) + 0.3 * Math.sin(TYAW), 3.2, -14.5 - 0.6 * Math.sin(TYAW) + 0.3 * Math.cos(TYAW)];
  const sailor = makeToon({ shirt: 0xffd23f, pants: 0x2b3f5a, hair: 0x3a2a1a, hairStyle: 'side' }); sail.body.add(sailor.root);
  const flash = makeFlashlightProp(); gary.hand(1).add(flash.g); flash.g.position.set(0, -0.12, 0.08); flash.g.rotation.set(0, -PI / 2, 0);
  flash.g.add(Lt.handBeam); Lt.handBeam.position.set(0.26, 0, 0);
  flash.cells.forEach((c) => scene.add(c));
  const boulder = makeBoulder(), fdisc = makeFresnelDisc(), oak = makeOak(), horn = makeHorn(), heli = makeHelipad(), perch = makePerch(), radio = makeRadio(), fish = makeFish();
  scene.add(boulder.g, fdisc.g, oak.g, horn.g, fish.g); tw.top.add(heli.g, perch.g, radio.g);
  boulder.g.position.set(1.9, RY + 1.1, 2.0); fdisc.g.position.copy(boulder.g.position);
  oak.g.position.set(-3.9, RY, -0.6); horn.g.position.set(2.55, RY, 1.25);
  heli.g.position.set(0, D.dome1 + 1.05, 0); perch.g.position.set(-2.25, GY, -0.55); radio.g.position.set(1.55, GY, -1.75);
  const cutter = new THREE.Group(); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), mat(0x2b1d14, 0.6), cutter, 0, 0.1, 0); const wheel = mk(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0xdfe8ee, metalness: 0.9, roughness: 0.2 }), cutter, 0, 0.4, 0); wheel.rotation.x = PI / 2; gary.hand(1).add(cutter); cutter.position.set(0, -0.1, 0.05); cutter.rotation.x = 1.4;
  const flask = new THREE.Group(); mk(new THREE.CylinderGeometry(0.08, 0.1, 0.24, 14), mat(0x5a5f66, 0.4), flask, 0, 0, 0); gary.hand(1).add(flask); flask.position.set(0, -0.12, 0.08);
  const stream = mk(new THREE.CylinderGeometry(0.035, 0.04, 1, 10), new THREE.MeshStandardMaterial({ color: 0xe8ecf0, metalness: 0.8, roughness: 0.05, emissive: 0xaab4be, emissiveIntensity: 0.6 }), scene, 0, 0, 0);
  const mallet = new THREE.Group(); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), mat(0x8a6a44, 0.7), mallet, 0, 0.15, 0); mk(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 14), mat(0x7a5232, 0.8), mallet, 0, 0.45, 0).rotation.z = PI / 2; gary.hand(1).add(mallet); mallet.position.set(0, -0.1, 0.05); mallet.rotation.x = 1.3;
  const roller = new THREE.Group(); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), mat(0x8a6a44, 0.7), roller, 0, 0.2, 0); mk(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 14), mat(0x1b1b1b, 0.8), roller, 0, 0.52, 0).rotation.z = PI / 2; gary.hand(1).add(roller); roller.position.set(0, -0.1, 0.05); roller.rotation.x = 1.0;
  const board = mk(new THREE.BoxGeometry(0.5, 0.6, 0.03), mat(0x8a6a44, 0.8), gary.hand(1), 0, -0.05, 0.2);
  const chair = new THREE.Group(); scene.add(chair); mk(new THREE.BoxGeometry(0.6, 0.05, 0.3), mat(0x8a6a44, 0.8), chair, 0, 0, 0); const ropeM = mat(0xd8c9a0, 0.9); const ropes = [-1, 1].map((s) => mk(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), ropeM, chair, s * 0.28, 0.5, 0));
  const scaffold = mk(new THREE.CircleGeometry(1.95, 40), mat(0xa88050, 0.8), scene, 0, 0, 0); scaffold.rotation.x = -PI / 2;
  const brickPile = new THREE.Group(); scene.add(brickPile); for (let i = 0; i < 14; i++) mk(new THREE.BoxGeometry(0.24, 0.08, 0.12), mat([0xc9824f, 0xb9734a, 0xd29462][i % 3], 0.8), brickPile, (i % 4) * 0.25 - 0.4, 0.04 + Math.floor(i / 4) * 0.085, (i % 2) * 0.13); brickPile.position.set(-2.6, RY, 2.2);
  const wallClock = new THREE.Group(); tw.g.add(wallClock); wallClock.position.set(-1.2, TW + 1.3, -1.25); wallClock.lookAt(0, TW + 1.3, 2);
  mk(new THREE.CircleGeometry(0.22, 24), new THREE.MeshStandardMaterial({ color: 0xf4f0e4, roughness: 0.6 }), wallClock, 0, 0, 0); const hH = mk(new THREE.BoxGeometry(0.025, 0.12, 0.01), mat(0x111111), wallClock, 0, 0.05, 0.01), hM = mk(new THREE.BoxGeometry(0.018, 0.18, 0.01), mat(0x111111), wallClock, 0, 0.08, 0.012);
  const rays = new THREE.Group(); Lt.g.add(rays);   // "it shines everywhere": short soft rays in every direction (up, down to the sea, sideways)
  for (let i = 0; i < 10; i++) { const r = Lt.beams[0].clone(); r.material = Lt.beams[0].material.clone(); r.material.uniforms.uLen.value = 70; r.scale.set(16 / 70, 0.35, 0.35); const el = [1.2, 0.6, -0.5, -1.0, 0.1, 0.9, -0.3, 0.3, -1.2, 0.5][i], az = i * 2.4; r.rotation.set(0, az, el, 'YZX'); rays.add(r); }
  const dizzy = makeDizzy(scene);
  const chunk = mk(new THREE.DodecahedronGeometry(0.75, 1), new THREE.MeshStandardMaterial({ color: 0x8c877f, roughness: 0.85 }), scene, 0, 0, 0); chunk.geometry.dispose(); chunk.geometry = new THREE.IcosahedronGeometry(0.75, 0); chunk.material.flatShading = true; chunk.material.color.set(0x7d776f); chunk.scale.set(2.2, 1.0, 1.6);   // r4 logic: an angular wedge of rock (the round one read as a boulder rolling off)   // r2: a real wedge of rock chunk.castShadow = true;
  const sticks = [[-35, 30, -300], [-10, 32, -300]].map((p) => { const c = S.coast.nd.clone(); c.position.set(...p); c.traverse((o) => { if (o.isMesh && o.material.uniforms) o.visible = false; }); S.coast.g.add(c); return c; });   // more white sticks on the coast: WHICH ONE?
  { // r4 logic: the far lighthouses floated 10–20 m above the cliff tops — seat each on the cliff ridge (raycast down onto the cliff mesh)
    S.coast.g.updateMatrixWorld(true); const cliffs = [S.coast.cliffs];
    const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0);
    for (const obj of [S.coast.nd, ...sticks]) { const p0 = obj.position, r0 = Math.hypot(p0.x, p0.z), ux = p0.x / r0, uz = p0.z / r0; let best = null;
      for (let r = r0 - 20; r < r0 + 80; r += 1) { rc.set(new THREE.Vector3(ux * r, 400, uz * r), dn); const h = rc.intersectObjects(cliffs, false)[0]; if (h && (!best || h.point.y > best.y)) best = { r, y: h.point.y }; }
      if (best) obj.position.set(ux * best.r, best.y - 0.4, uz * best.r); } }
  const bigWave = makeBigWave(); scene.add(bigWave.mesh);
  const foamTop = mk(new THREE.CircleGeometry(5.5, 48), new THREE.MeshBasicMaterial({ map: S.crown.m.map, transparent: true, depthWrite: false, opacity: 0, color: 0xf2faff }), scene, 0, RY + 0.06, 0); foamTop.rotation.x = -PI / 2; foamTop.renderOrder = 5;   // r4 logic: white water over the rock top after the wave, draining off
  const dots = []; for (let i = 0; i < 9; i++) { const d = mk(new THREE.CircleGeometry(0.09 + (i % 3) * 0.03, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), tw.g, 0, 0, 0); d.visible = false; dots.push(d); }
  const bolts = [0, 1].map(() => { const g = new THREE.Group(); scene.add(g); for (let k = 0; k < 9; k++) mk(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshBasicMaterial({ color: 0xe8f0ff, toneMapped: false, fog: false }), g, 0, 0, 0); g.visible = false; return g; });
  const soundRings = [0, 1, 2].map(() => { const r = mk(new THREE.TorusGeometry(1, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), scene, 0, 0, 0); r.rotation.y = PI / 2; return r; });

  // ---------------------------------------------------------------- the sea, moods, the lens' angle (integrated once: stateless frames)
  const MOODK = [[0, 'golden'], [t.andC, 'golden'], [t.four - 0.2, 'golden'], [t.far, 'dusk'], [t.miles, 'night'], [t.thenC, 'night'], [STORM - 0.35, 'storm'], [STORM + 0.15, 'storm'], [FOG0, 'storm'], [FOG1, 'fog'], [CLEAR0, 'fog'], [CLEAR1, 'dawn'], [t.stick + 0.15, 'dawn'], [t.paint, 'day'], [WV0, 'day'], [t.once + 0.3, 'day'], [t.birds, 'day'], [t.birds + 1.6, 'dusk']];
  const moodAt = (tt) => { let i = 0; while (i < MOODK.length - 1 && tt >= MOODK[i + 1][0]) i++; const a = MOODK[i], b = MOODK[Math.min(i + 1, MOODK.length - 1)]; return a === b || a[1] === b[1] ? [a[1], a[1], 0] : [a[1], b[1], smooth((tt - a[0]) / (b[0] - a[0]))]; };
  const flashAt = (tt) => [STORM, STORM + 0.35, LEAN1 + 0.05].reduce((s, f) => s + (tt > f && tt < f + 0.3 ? (1 - (tt - f) / 0.3) * (0.8 + 0.2 * Math.sin((tt - f) * 60)) : 0), 0);
  const stormAt = (tt) => clamp(u01(tt, STORM - 0.4, STORM + 0.5) - u01(tt, FOG0, FOG1 + 0.8) * 0.9) + 0.35 * clamp(u01(tt, WV0, WV0 + 0.6) - u01(tt, t.andH, t.once + 0.5));
  const curveAt = (tt) => smooth(u01(tt, CURVE0, CURVE1)) * (1 - smooth(u01(tt, CURVEOFF0, CURVEOFF1)));
  const bigAt = (tt) => { if (tt < WV0 || tt > WASH1 + 1.5) return { bigA: 0, bigZ: -80 }; const z = lerp(-70, 0, smooth(u01(tt, WV0, IMPACT))) + Math.max(0, tt - IMPACT) * 14; return { bigA: 2.4 * smooth(u01(tt, WV0, WV0 + 0.8)) * Math.exp(-Math.max(0, z) / 5), bigZ: z, bigW: 6, bigDX: 0, bigDZ: 1 }; };   // rolls in from behind the tower (-z) toward the lens
  const seaAt = (tt) => ({ t: tt, calm: 1 - 0.4 * clamp(u01(tt, FOG0, FOG1) - u01(tt, CLEAR0, CLEAR1)), storm: stormAt(tt), curve: curveAt(tt), R: SEA_R, ...bigAt(tt) });
  const OMEGA = (tt) => {   // rad/s of the lens: still → clockwork (8 s a turn) → stutters (too heavy) → floats → one-finger spin → characteristic (10 s a turn)
    if (tt < WT0) return 0;
    if (tt < STUCK0) return TAU / 8 * smooth(u01(tt, WT0, WT0 + 0.8));
    if (tt < POUR1) return TAU / 8 * (0.18 + 0.12 * Math.sin(tt * 19));
    if (tt < POKE) return TAU / 8;
    if (tt < t.thenC) return lerp(TAU / 1.3, TAU / 8, smooth(u01(tt, POKE + 1.6, t.thenC))) * smooth(u01(tt, POKE, POKE + 0.12));
    if (tt < BULL) return TAU / 8;
    return TAU / 10;
  };
  const ANG = [], DT = 1 / 120; { let a = 0; for (let tt = 0; tt <= END + 1; tt += DT) { ANG.push(a); a += OMEGA(tt) * DT; } const off = 0.3 - ANG[Math.round(t.oneC / DT)]; for (let i = 0; i < ANG.length; i++) ANG[i] += off; }   // r2: on "one beam points one way" the beam points right-back (yaw 0.3), away from the cruise ship's dark left
  const lensAng = (tt) => { const i = clamp(tt / DT, 0, ANG.length - 2), k = Math.floor(i); return lerp(ANG[k], ANG[k + 1], i - k); };
  const MORSE = '.... . .-.. .--.'; const morseOn = (tt) => { const u = (tt - MORSE0) / 0.075; if (u < 0 || tt > MORSE1) return 1; let k = 0; for (const ch of MORSE) { const L = ch === '.' ? 1 : ch === '-' ? 3 : 2; if (u < k + L) return ch === ' ' ? 0 : 1; k += L; if (u < k + 1) return 0; k += 1; } return 1; };
  function beamsAt(tt) {
    if (tt < BEAM0) return [];
    const on = smooth(u01(tt, BEAM0, BEAM0 + 0.25)) * (tt < BRIGHT ? 0.55 : 1) * morseOn(tt) * (tt > t.into - 0.05 && tt < t.into + 0.4 ? 1.4 : 1);
    const a = lensAng(tt);
    if (tt < BULL) return [{ on, yaw: a, k: tt < SET && tt > t.lensW ? 0.3 : 0.42 }];
    const k2 = smooth(u01(tt, BULL, BULL + 0.3));
    const kk = tt > t.spins - 0.2 && tt < t.carousel + 0.4 ? 0.8 : undefined;   // r4: the spinning beams read over the night sea
    return [{ on, yaw: a, k: kk }, { on: on * k2, yaw: a + 0.63 * k2, k: kk }];
  }

  // ---------------------------------------------------------------- helpers
  const K = (tt, keys) => { if (tt <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (tt <= b) { const u = smooth((tt - a) / (b - a)); return Array.isArray(va) ? va.map((v, k) => lerp(v, vb[k], u)) : lerp(va, vb, u); } } return keys[keys.length - 1][1]; };
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const v3 = new THREE.Vector3();
  const blinkE = (tt, open = 'open') => ((tt * 0.73) % 3.1 < 0.11 ? 'closed' : open);
  const place = (b, x, z, yaw, SU, extra = {}) => { const p = floatPose(x, z, yaw, SU, b.len * 0.8, b.bm); if (extra.flatCurve) { const q = floatPose(x, z, yaw, { ...SU, curve: 0 }, b.len * 0.8, b.bm); p.pitch = q.pitch; p.roll = q.roll; } if (extra.steady) { p.pitch = 0; p.roll = 0; }   // flatCurve: rides the curve's height but not its slope (the deck camera)
  b.g.position.set(x, p.y + (extra.dy ?? 0), z); b.g.rotation.set(0, yaw, 0); b.body.rotation.set(p.roll + (extra.roll ?? 0), 0, p.pitch + (extra.pitch ?? 0)); };
  const growY = (tt) => (tt < GROW0 ? RY - 0.05 : lerp(RY, GY, easeInQuad(u01(tt, GROW0, GROW1)) * 0.4 + smooth(u01(tt, GROW0, GROW1)) * 0.6));
  const leanAt = (tt) => 0.12 * smooth(u01(tt, LEAN0, LEAN1)) * (1 - smooth(u01(tt, SK0, SK1))) + (tt > LEAN1 && tt < SK0 ? 0.008 * Math.sin((tt - LEAN1) * 9) : 0);
  const lensPos = (tt) => {   // the lens: assembled on the rock → carried up the stairs → set round the lamp (world)
    if (tt < ASM0) return null;
    if (tt < LIFT) return [2.2, RY + 1.07, 2.0];
    const g = garyPath(tt), over = [g[0], g[1] + 2.35, g[2] - 0.05];
    if (tt < LIFT + 0.3) { const u = smooth(u01(tt, LIFT, LIFT + 0.3)); return [lerp(2.2, over[0], u), lerp(RY + 1.07, over[1], u), lerp(2.0, over[2], u)]; }
    if (tt < CLIMB1 - 0.25) return over;
    if (tt < SET + 0.25) { const o = (() => { const g0 = garyPath(CLIMB1 - 0.25); return [g0[0], g0[1] + 2.35, g0[2] - 0.05]; })(); return K(tt, [[CLIMB1 - 0.25, o], [CLIMB1, [0.5, TW + 1.2, 2.6]], [SET - 0.05, [0.3, D.focal[1] + 0.35, 2.3]], [SET + 0.25, D.focal]]); }   // r4 logic: hoisted up the open front (it used to rise through the lantern floor)
    return D.focal;
  };
  // Gary's route (world feet position) for the moving stretches; poses below
  const STAIR = (u) => tw.stairAt(u);
  function garyPath(tt) {
    if (tt < LIFT + 0.3) return [0.95, RY, 2.5];
    if (tt < HOP0) return K(tt, [[LIFT + 0.3, [0.95, RY, 2.5]], [HOP0, [-1.2, RY, 0.7]]]);
    if (tt < CLIMB0) return hop(tt, HOP0, CLIMB0, [-1.2, RY, 0.7], [-1.08, D.T.base, 0.05], 0.35);
    if (tt < CLIMB1 - 0.25) { const s = STAIR(smooth(u01(tt, CLIMB0, CLIMB1 - 0.25))); return [s.x, s.y, s.z]; }
    return K(tt, [[CLIMB1 - 0.25, [STAIR(1).x, TW, STAIR(1).z]], [CLIMB1 - 0.05, [0.35, TW, 1.02]], [SET + 0.05, [0.35, GY, 1.0]], [SET + 0.2, [1.15, GY, 0.45]]]);   // r4 logic: up the hatch ladder (not through the floor)
  }

  // ---------------------------------------------------------------- effects + kicks, scheduled from the word times
  const KM = [], kick = (tt, s, d) => KM.push(d ? [tt, s, d] : [tt, s]);
  const SEA = 0x2aa6b8, WHITE = 0xf4fbff;
  const splash = (tt, x, z, n = 40, sp = [2, 4.5], seed = 1) => { fx.burst('drops', tt, { pos: [x, 0.1, z], n, dir: [0, 1, 0], spread: 0.55, speed: sp, size: [0.04, 0.09], floor: -0.2, color: 0xe6f6ff, seed }); fx.burst('mist', tt + 0.02, { pos: [x, 0.3, z], n: Math.round(n / 5), speed: [0.6, 1.6], spread: 1.2, size: [0.4, 0.8], seed: seed + 1 }); };
  // HOOK: the sailboat bonks, the flashlight clicks on, the tug hits, Gary flies → SPLOOSH
  fx.burst('spark', SB, { pos: [-7.2, 1.2, 2.6], n: 18, speed: [1, 2.5], spread: 1.2, seed: 2 }); splash(SB, -7.0, 2.8, 30, [1.5, 3], 3); kick(SB, 0.8);
  fx.burst('glow', t.flashlight, { pos: [5.0, RY + 1.1, 2.6], n: 2, speed: [0, 0.01], size: [0.5, 0.7], seed: 5 });
  fx.burst('spark', TUG, { pos: [7.6, 1.0, 2.4], n: 24, speed: [1.5, 3], spread: 1.2, seed: 6 }); splash(TUG, 7.7, 2.6, 50, [2, 4], 7); kick(TUG, 1.1);
  fx.burst('dust', TUG + 0.05, { alpha: 0.4, grow: 1.5, pos: [4.4, RY + 0.2, 2.4], n: 8, speed: [0.4, 1.0], spread: 1.2, size: [0.3, 0.5], color: 0x9a948a, seed: 8 });
  splash(SPL, 2.9, 9.4, 70, [2.5, 5.5], 9); kick(SPL, 0.8);
  // CONGRATS: drips, ta-da confetti, the gull's feathers, the cells
  fx.burst('confetti', t.congrats + 0.1, { pos: [1.0, RY + 2.4, 2.6], n: 110, dir: [0, 1, 0.3], spread: 0.7, speed: [2.5, 4.5], seed: 11 });
  fx.burst('confetti', GLAND, { pos: [0.9, RY + 1.6, 3.6], n: 16, dir: [0, 1, 0], spread: 1, speed: [0.6, 1.4], color: 0xffffff, size: [0.04, 0.07], seed: 12 }); kick(GLAND, 0.3);
  fx.burst('spark', BAT, { pos: [1.2, RY + 1.9, 3.7], n: 16, speed: [1, 2], spread: 1.2, seed: 13 }); kick(BAT, 0.4);
  // RANGE: the match, the lamp; bricks fly as the tower rises; the lantern pops on; the lookout's spark
  fx.burst('spark', LIGHT, { pos: [0.75, RY + 0.25, -0.05], n: 20, speed: [0.8, 1.8], spread: 1.2, seed: 15 }); fx.burst('glow', LIGHT + 0.05, { pos: [0.75, RY + 0.3, -0.05], n: 2, speed: [0, 0.01], size: [0.3, 0.45], seed: 16 });
  for (let k = 0; k < 6; k++) { const tk = GROW0 + k * (GROW1 - GROW0) / 6; fx.burst('crumb', tk, { pos: [0, growY(tk) - 0.2, -0.6], box: [3.2, 0.2, 1.2], n: 26, dir: [0, 1, 0.3], spread: 1.0, speed: [1.5, 3.5], color: 0xc9824f, size: [0.05, 0.1], floor: RY, seed: 20 + k }); fx.burst('dust', tk + 0.03, { alpha: 0.35, grow: 1.5, pos: [0, growY(tk), 0.3], box: [3.0, 0.2, 0.3], n: 5, speed: [0.3, 0.8], spread: 1.2, size: [0.4, 0.7], color: 0xd8b892, seed: 30 + k }); kick(tk, 0.25); }
  fx.burst('spark', TOPPOP, { pos: [0, GY + 1.6, 0.2], box: [3, 2.6, 0.4], n: 50, speed: [1.5, 3.5], spread: 1.3, seed: 40 }); fx.burst('confetti', TOPPOP + 0.05, { pos: [0, GY + 3, 0], n: 80, dir: [0, 1, 0.2], spread: 0.8, speed: [2, 4], seed: 41 }); kick(TOPPOP, 0.35);   // r1 camera: a full kick on a 2.9 fw/s rise was the worst stack
  fx.burst('spark', SPOT, { pos: [51.4, 2.4 - 44.5 ** 2 / (2 * SEA_R), -14.1], n: 18, speed: [1, 2.5], spread: 1.3, size: [0.15, 0.3], seed: 42 });
  // REFLECTOR: rays; the fish jumps; CLANG; the beam forms; FWOOM in Gary's face
  splash(t.fish - 0.35, 4.5, 9.4, 24, [1.5, 3], 45); splash(t.fish + 0.55, 6.5, 9.8, 24, [1.5, 3], 47);
  fx.burst('spark', MIR, { pos: [-0.45, FY, -0.2], n: 26, speed: [1.5, 3], spread: 1.2, seed: 49 }); kick(MIR, 0.5);
  fx.burst('glow', BEAM0, { pos: [0.4, FY, 0], n: 3, speed: [0, 0.01], size: [1.2, 1.8], seed: 50 }); kick(BEAM0, 0.3);
  fx.burst('glow', BLAST, { pos: [0.8, FY, -0.45], n: 4, speed: [0, 0.01], size: [1.4, 2.2], seed: 51 }); fx.burst('smoke', BLAST + 0.1, { pos: [0.85, GY + 1.6, -0.5], n: 8, dir: [0, 1, 0], speed: [0.4, 1], spread: 0.6, size: [0.25, 0.45], color: 0x777777, seed: 52 }); kick(BLAST, 1.0);
  // LENS: the barge, THUD, slices, the split, assembly sparkles, the climb, the light-up
  fx.burst('rock', THUD, { pos: [1.9, RY + 0.05, 2.0], box: [1.5, 0.1, 1.2], n: 40, dir: [0, 1, 0], spread: 1.0, speed: [2, 4], floor: RY, seed: 55 }); fx.burst('dust', THUD + 0.02, { alpha: 0.45, grow: 1.7, pos: [1.9, RY + 0.2, 2.2], n: 14, speed: [0.6, 1.6], spread: 1.3, size: [0.5, 0.9], color: 0xb8b2a8, seed: 56 }); kick(THUD, 1.2);
  splash(THUD + 0.1, 11.6, 4.0, 40, [1.5, 3.5], 57);
  CUTS.forEach((c, k) => { fx.burst('spark', c, { pos: [2.1, RY + 1.1 + (k - 1) * 0.5, 2.3], n: 22, dir: [0, 1, 0.4], spread: 1.0, speed: [1.5, 3], seed: 60 + k }); kick(c, 0.3); });
  fx.burst('confetti', SPLIT, { pos: [2.3, RY + 1.1, 2.0], box: [0.6, 1.8, 1.8], n: 70, dir: [0.4, 0.6, 0.3], spread: 0.8, speed: [1.5, 3.5], color: 0xbfe6f6, size: [0.18, 0.32], seed: 64 }); kick(SPLIT, 0.7);   // flat glass slices
  fx.burst('spark', ASM0 + 0.2, { pos: [2.2, RY + 1.1, 2.2], box: [1.6, 2, 0.6], n: 40, speed: [1, 2.5], spread: 1.3, seed: 65 }); fx.burst('spark', ASM1, { pos: [2.2, RY + 1.1, 2.4], box: [1.4, 1.8, 0.3], n: 14, speed: [0.3, 0.8], spread: 1.2, size: [0.06, 0.12], seed: 66 });   // r3 logic: a glint, not a glow — the lens isn't lit yet
  for (let k = 0; k < 8; k++) { const tk = CLIMB0 + k * (CLIMB1 - CLIMB0) / 8, s = STAIR((k + 0.5) / 8); fx.burst('dust', tk, { alpha: 0.3, grow: 1.3, pos: [s.x, s.y, s.z], n: 3, speed: [0.2, 0.6], spread: 1, size: [0.25, 0.4], color: 0xc8bba8, seed: 70 + k }); kick(tk, 0.15); }
  fx.burst('spark', SET, { pos: [0, FY, 0.3], box: [1.6, 2, 0.4], n: 40, speed: [1.5, 3], spread: 1.2, seed: 80 }); kick(SET, 0.6);
  fx.burst('glow', LIT, { pos: [0.3, FY, 0.3], n: 4, speed: [0, 0.01], size: [2.0, 3.0], seed: 81 }); fx.burst('confetti', LIT + 0.05, { pos: [0, FY + 1.5, 0.3], n: 80, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 4], seed: 82 }); kick(LIT, 0.7);
  // CLOCK: the cruise ship BONK (drinks fly), the weight drops, CUCKOO, the crank, the time-lapse
  fx.burst('spark', CBONK, { pos: [-8.2, 1.6, -2.4], n: 30, speed: [1.5, 3], spread: 1.2, seed: 85 }); splash(CBONK, -8.0, -2.0, 60, [2, 4.5], 86); kick(CBONK, 1.3);
  fx.burst('confetti', CBONK + 0.05, { pos: [-16, 6.4, -2.4], box: [8, 0.4, 3], n: 60, dir: [1, 1, 0], spread: 0.8, speed: [1.5, 3], color: 0xffa0c8, size: [0.05, 0.09], seed: 87 });
  fx.burst('crumb', CBONK + 0.05, { pos: [-16, 6.4, -2.4], box: [8, 0.4, 3], n: 40, dir: [1, 1, 0], spread: 0.8, speed: [1.5, 3], color: 0xffe08a, size: [0.04, 0.07], floor: -0.5, seed: 88 });
  fx.burst('spark', WT0, { pos: [0, TW + 0.5, 0.3], n: 20, speed: [1, 2], spread: 1.2, seed: 89 }); kick(WT0, 0.35);
  fx.burst('confetti', CUCKOO, { pos: [-0.5, TW + 0.8, 0.2], n: 22, dir: [0, 1, 0.3], spread: 1, speed: [0.8, 1.6], color: 0xffffff, size: [0.04, 0.07], seed: 90 }); kick(CUCKOO, 0.4);
  fx.burst('dust', BOT, { alpha: 0.4, grow: 1.4, pos: [0, D.T.base + 0.2, 0.0], n: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.25, 0.45], color: 0xc8bba8, seed: 91 }); kick(BOT, 0.5);
  for (let k = 0; k < 6; k++) fx.burst('spark', CR0 + k * (CR1 - CR0) / 6, { pos: [0.25, TW + 0.4, 0.5], n: 8, speed: [0.8, 1.6], spread: 1, seed: 92 + k });
  // MERCURY: grinding smoke, the silver pour, the poke, the carousel sparkles
  for (let k = 0; k < 3; k++) fx.burst('smoke', STUCK0 + k * 0.25, { pos: [0.3, TW + 1.0, 0.3], n: 4, dir: [0, 1, 0], speed: [0.3, 0.8], spread: 0.6, size: [0.2, 0.35], color: 0x666666, seed: 100 + k });
  fx.burst('spark', POKE, { pos: [0.75, FY, 0.25], n: 18, speed: [1, 2], spread: 1.2, seed: 104 }); kick(POKE, 0.4);
  // r2 logic: no silver balls on the rim — the pour lands in a flat ring that rises (tw.setFill) and the stream is clipped at its surface   // silver splashes in the trough
  fx.burst('rock', t.rockS - 0.5, { pos: [3.6, RY - 0.1, 4.3], n: 22, dir: [0.5, 1, 0.3], spread: 0.8, speed: [1.5, 3], floor: -0.5, seed: 148 }); splash(t.rockS + 0.15, 4.4, 7.0, 90, [3, 6], 149); kick(t.rockS + 0.15, 0.9);
  fx.stream('spark', CAR0, t.thenC, { pos: [0, FY + 1.3, 0], box: [1.4, 0.2, 1.4], rate: 30, speed: [0.5, 1.2], spread: 1.2, seed: 105 });
  // CHAR: the sailboat bonk, the second bullseye clicks in
  fx.burst('spark', SAIL_BONK, { pos: [-8.2, 1.6, 3.4], n: 30, speed: [1.5, 3], spread: 1.2, seed: 110 }); splash(SAIL_BONK, -7.2, 3.3, 50, [2, 4], 111); kick(SAIL_BONK, 1.0);
  fx.burst('spark', BULL + 0.1, { pos: [0.6, FY, 0.4], n: 22, speed: [1, 2.2], spread: 1.2, seed: 113 }); kick(BULL + 0.1, 0.3);
  // STORM: lightning, rain, the wave slams the base (bricks), the lean
  fx.stream('rain', STORM - 0.2, FOG1, { pos: [0, 14, 4], box: [30, 4, 24], rate: 650, dir: [0.2, -1, 0.1], spread: 0.05, speed: [10, 14], seed: 120 });
  fx.burst('drops', BRK, { pos: [-2.4, RY + 0.6, 0.3], box: [1, 1.2, 1.2], n: 80, dir: [0.4, 1, 0.3], spread: 0.6, speed: [3, 7], size: [0.05, 0.1], floor: RY - 1, seed: 121 });
  fx.burst('crumb', BRK + 0.05, { pos: [-2.0, RY + 0.4, 0.2], box: [0.6, 0.6, 0.6], n: 60, dir: [0.6, 1, 0.4], spread: 0.6, speed: [2.5, 5], color: 0xc9824f, size: [0.07, 0.13], floor: RY, seed: 122 }); kick(BRK, 1.0);
  fx.burst('rain', BRK - 0.12, { pos: [-5.6, RY - 0.6, 1.2], box: [1.6, 0.3, 2.2], n: 180, dir: [0.75, 1, -0.15], spread: 0.45, speed: [4, 7.5], life: [0.5, 0.8], seed: 251 }); fx.burst('mist', BRK - 0.08, { pos: [-4.4, RY + 0.6, 1.0], n: 10, speed: [1, 2], spread: 1, size: [0.8, 1.4], seed: 252 });   // r2 logic: a surge over the edge rips the bricks out
  fx.burst('mist', BRK + 0.03, { pos: [-2.6, RY + 1, 0.5], n: 14, speed: [1, 2.5], spread: 1.2, size: [0.6, 1.2], seed: 123 });
  fx.burst('dust', LEAN1, { alpha: 0.45, grow: 1.6, pos: [2.8, RY + 0.3, 0.5], n: 14, speed: [0.6, 1.6], spread: 1.3, size: [0.5, 0.9], color: 0xb8b2a8, seed: 124 }); kick(LEAN1, 1.4);
  fx.burst('dust', FALLE, { alpha: 0.45, grow: 1.6, pos: [2.95, RY + 0.15, 1.8], n: 12, speed: [0.5, 1.4], spread: 1.3, size: [0.4, 0.7], color: 0x9a948a, seed: 125 }); kick(FALLE, 1.0);
  // SMEATON: granite THUNKs, the straightening, the oak pops, the waves now just splash
  for (let k = 0; k < 5; k++) { const tk = SK0 + k * (SK1 - SK0) / 5; fx.burst('rock', tk, { pos: [k % 2 ? 2.6 : -2.6, RY + 0.3 + k * 0.5, 0.6], n: 12, dir: [0, 1, 0.3], spread: 1, speed: [1.5, 3], floor: RY, seed: 130 + k }); fx.burst('dust', tk + 0.02, { alpha: 0.35, grow: 1.4, pos: [k % 2 ? 2.8 : -2.8, RY + 0.3 + k * 0.5, 0.8], n: 5, speed: [0.3, 0.8], spread: 1.2, size: [0.4, 0.7], color: 0xb8b2a8, seed: 140 + k }); kick(tk, k === 4 ? 0.7 : 0.3); }
  fx.burst('confetti', OAK + 0.1, { pos: [-3.9, RY + 2.2, -0.4], n: 40, dir: [0, 1, 0], spread: 1, speed: [1, 2.2], color: 0x5fa83a, size: [0.06, 0.1], seed: 146 }); kick(OAK + 0.1, 0.4);
  for (let k = 0; k < 3; k++) { const tk = t.smeatons - 0.2 + k * 0.45; fx.burst('drops', tk, { pos: [-3.2 + k * 3, RY - 0.2, 1.8], n: 40, dir: [0, 1, 0.2], spread: 0.5, speed: [3, 6], size: [0.05, 0.09], floor: -0.3, seed: 147 + k }); }
  // FOG: the tug's bonk in the fog, the horn bolts on, the pump, the blasts (rings)
  fx.burst('spark', FBONK, { pos: [7.6, 1.0, -1.0], n: 22, speed: [1.5, 3], spread: 1.2, seed: 150 }); splash(FBONK, 7.8, -1.0, 50, [2, 4], 151); kick(FBONK, 1.0);
  fx.burst('spark', HORN, { pos: [3.4, RY + 0.9, 1.3], n: 26, speed: [1.5, 3], spread: 1.2, seed: 153 }); kick(HORN, 0.6);
  for (let k = 0; k < 4; k++) fx.burst('mist', PUMP0 + k * 0.15, { pos: [2.0, RY + 0.9, 1.3], n: 3, speed: [0.3, 0.8], spread: 1, size: [0.2, 0.35], seed: 155 + k });
  fx.burst('mist', HB1, { pos: [4.6, RY + 0.9, 1.25], n: 16, dir: [1, 0, 0], spread: 0.4, speed: [3, 6], size: [0.4, 0.8], seed: 160 });   // no kick: it's inside the FOGHORN term
  fx.burst('mist', HB2, { pos: [4.6, RY + 0.9, 1.25], n: 20, dir: [1, 0.1, 0.1], spread: 0.3, speed: [4, 7], size: [0.4, 0.8], seed: 161 }); fx.burst('confetti', HB2 + 0.05, { pos: [4.8, RY + 1.6, 1.6], n: 20, dir: [1, 1, 0.3], spread: 0.6, speed: [2, 4], color: 0x6b3f22, size: [0.03, 0.05], seed: 162 }); kick(HB2, 1.2);
  // DAYMARK: roller flicks, the polka dots
  for (let k = 0; k < 7; k++) { const tk = CHAIR0 + 0.3 + k * 0.45, yC = paintY(tk), rr = tw.rAt(yC) + 0.2; fx.burst('drops', tk, { pos: [Math.cos(0.55) * rr, yC + 0.2, -Math.sin(0.55) * rr], n: 10, dir: [0.4, 0.6, 0.4], spread: 0.7, speed: [1, 2], color: 0x151515, size: [0.03, 0.05], floor: RY, seed: 170 + k }); kick(tk, 0.15); }
  DOT.forEach((d, k) => { kick(d, 0.25); });
  // WAVE: the wall of water rises, the impact (spray over the top), cascades
  for (let k = 0; k < 8; k++) { const tk = lerp(WV0 + 0.5, IMPACT - 0.1, k / 7), w = bigAt(tk); const lip = 11 * smooth(u01(tk, WV0, WV0 + 0.9)); fx.burst('mist', tk, { pos: [0, lip * 0.95, w.bigZ - 1.5], box: [26, 1.2, 2.5], n: 26, dir: [0, 1, 0.6], spread: 0.5, speed: [2, 5], size: [1.2, 2.6], life: [0.6, 1.0], seed: 180 + k * 3 }); fx.burst('drops', tk + 0.03, { pos: [0, lip * 0.9, w.bigZ - 2.0], box: [30, 0.6, 2.5], n: 40, dir: [0, 1, 0.7], spread: 0.4, speed: [3, 6], size: [0.05, 0.1], floor: -1, seed: 181 + k * 3 }); }   // spray off the travelling crest
  for (let k = 0; k < 6; k++) fx.burst('mist', IMPACT + 0.08 * k, { pos: [0, RY + 2 + 3.6 * k, 0.4], box: [5.5, 1.5, 3], n: 22, dir: [0, 1, 0.3], spread: 0.6, speed: [2, 5], size: [1.2, 2.4], life: [1.0, 1.6], seed: 260 + k });   // r3 look: spray boils up the tower with the crown
  fx.burst('mist', IMPACT + 0.3, { pos: [0, RY + 10, 0.8], box: [5, 16, 2.5], n: 140, dir: [0, 1, 0], spread: 0.6, speed: [0.3, 1.0], size: [2.6, 4.2], life: [0.9, 1.3], seed: 280 });   // r4 comedy: the tower vanishes in the white water, revealed on "holds"
  fx.burst('mist', IMPACT, { pos: [0, RY + 6, -2.5], box: [6, 8, 2], n: 160, dir: [0, 1, 0.45], spread: 0.35, speed: [14, 22], size: [1.4, 3.0], g: 9.8, life: [1.6, 2.4], seed: 181 });   // spray arcs up and OVER the dome (+z) and falls
  fx.burst('drops', IMPACT + 0.05, { pos: [0, RY + 6, -0.5], box: [5, 8, 2], color: 0xe6f6ff, n: 220, dir: [0, 1, 0.3], spread: 0.6, speed: [8, 16], size: [0.06, 0.12], floor: -0.5, life: [1.2, 1.8], seed: 182 }); kick(IMPACT, 1.6);
  for (let k = 0; k < 6; k++) { const an = -0.4 + k * 0.75; fx.stream('drops', IMPACT + 0.7, IMPACT + 2.3, { pos: [Math.cos(an) * 5.4, RY + 0.1, Math.sin(an) * 5.4], box: [0.8, 0.1, 0.8], rate: 30, dir: [Math.cos(an), -0.4, Math.sin(an)], spread: 0.35, speed: [1, 2.2], seed: 270 + k }); }   // r3 logic: the white water runs off the rock's edges
  fx.stream('drops', IMPACT + 0.6, WASH1 + 0.8, { pos: [0, GY, -0.6], box: [5.5, 1, 1.5], color: 0xe6f6ff, rate: 55, dir: [0, -1, 0.2], spread: 0.3, speed: [1, 3], size: [0.05, 0.1], floor: RY - 0.5, seed: 183 });
  // HOLD / FINISH / END: the miss, the pops, money, the gull's BONK + fall
  fx.burst('confetti', FLIP, { pos: [-3.3, RY + 1.9, 2.8], n: 50, dir: [0, 1, 0.3], spread: 0.8, speed: [1.5, 3], seed: 190 }); kick(FLIP, 0.35);
  for (const [k, tt, p] of [[0, t.radio, [1.6, GY + 1.6, -1.75]], [1, t.helipad, [0, D.dome1 + 1.2, 0]], [2, t.perch, [-2.25, GY + 0.8, -0.55]]]) { fx.burst('spark', tt, { pos: p, n: 26, speed: [1.5, 3], spread: 1.3, seed: 191 + k }); kick(tt, 0.4); }
  fx.burst('confetti', t.end + 0.1, { pos: [0, GY + 3, 1], n: 160, dir: [0, 1, 0.3], spread: 0.9, speed: [3, 6], seed: 195 }); kick(t.end + 0.1, 0.4);
  fx.burst('bill', t.fourE, { pos: [-2.4, RY + 4.5, 2.6], box: [3, 0.5, 1.5], n: 50, dir: [0, -1, 0], spread: 1.2, speed: [0.3, 0.8], seed: 196 }); kick(t.fourE, 0.4);
  fx.burst('confetti', GBONK, { pos: [-3.0, RY + 1.6, 2.4], n: 36, dir: [0, 1, 0.3], spread: 1, speed: [1, 2.5], color: 0xffffff, size: [0.04, 0.08], seed: 197 }); fx.burst('spark', GBONK, { pos: [-2.9, RY + 1.5, 2.7], n: 26, speed: [1.5, 3], spread: 1.3, seed: 198 }); kick(GBONK, 1.2);
  fx.burst('dust', GLAND2, { alpha: 0.4, grow: 1.5, pos: [-2.75, RY + 0.1, 3.45], n: 10, speed: [0.4, 1.0], spread: 1.2, size: [0.3, 0.5], color: 0x9a948a, seed: 199 }); fx.burst('confetti', GLAND2 + 0.02, { pos: [-2.75, RY + 0.4, 3.45], n: 24, dir: [0, 1, 0], spread: 1, speed: [1, 2], color: 0xffffff, size: [0.04, 0.07], seed: 200 }); kick(GLAND2, 0.9);
  fx.burst('drops', t.soaked - 0.1, { pos: [-1.95, RY + 0.2, 4.4], box: [1.4, 0.2, 0.4], n: 240, dir: [0, 1, -0.55], spread: 0.45, speed: [3.5, 5.5], size: [0.018, 0.03], life: [0.5, 0.7], seed: 206 }); fx.burst('mist', t.soaked - 0.06, { pos: [-1.95, RY + 0.45, 3.5], box: [1.2, 0.4, 0.3], n: 10, dir: [0, 0.4, -1], speed: [0.5, 1.0], spread: 0.6, size: [0.3, 0.5], life: [0.35, 0.55], seed: 207 }); kick(t.soaked, 0.35);
  fx.burst('spark', t.soaked - 0.12, { pos: [-2.75, RY + 1.1, 2.9], n: 10, speed: [0.8, 1.6], spread: 1, seed: 208 }); kick(t.soaked - 0.12, 0.25);   // BLIND: bonk into the sign post   // r2: SOAKED = a wave slaps over the edge onto him
  fx.burst('spark', GLB, { pos: [-1.5, GY + 1.45, -0.35], n: 14, speed: [1, 2.2], spread: 1.2, seed: 211 }); fx.burst('confetti', GLB + 0.02, { pos: [-1.5, GY + 1.45, -0.35], n: 14, dir: [0, 1, 0.4], spread: 1, speed: [0.8, 1.8], color: 0xffffff, size: [0.04, 0.07], seed: 212 }); kick(GLB, 0.35);   // feathers
  fx.stream('drops', WASH1 + 0.6, END, { pos: [-1.95, RY + 1.3, 3.0], box: [0.4, 0.5, 0.3], rate: 9, dir: [0, -1, 0], spread: 0.3, speed: [0.2, 0.6], size: [0.025, 0.045], floor: RY, seed: 205 });   // Gary drips to the end (soaked)
  // kicks on the remaining beats
  kick(t.congrats, 0.3); kick(t.worst, 0.25); kick(t.dark, 0.2); kick(t.lamp, 0.2); kick(t.away, 0.2); kick(t.hides, 0.2); kick(LAMPSET, 0.35); kick(t.twenty, 0.2); kick(t.sky, 0.25); kick(t.fish, 0.3); kick(SHADES, 0.3); kick(t.cuckoo, 0.3);
  kick(t.spins, 0.3); kick(t.carousel, 0.3); kick(t.storm, 0.9); kick(t.wide, 0.3); kick(t.what, 0.6); kick(t.stick, 0.3); kick(t.paint, 0.25); kick(t.holds, 0.5); kick(t.miss, 0.3); kick(t.rockEnd + 0.4, 0.3);
  for (const c of story.callouts) if ((c.style === 'sfx' || c.style === 'stamp') && /[A-Z]{3}/.test(c.text) && !/WHERE|WHIRR|CLICK|BLINK/.test(c.text) && !KM.some((k) => Math.abs(k[0] - c.t0) < 0.3)) kick(c.t0 + 0.02, 0.22);   // turbo: a soft jolt on every comic impact word
  const TERMS = story.callouts.filter((c) => c.style === 'term');
  const inTerm = (tk) => TERMS.find((c) => tk > c.t0 - 0.1 && tk < c.t1);
  for (const k of KM) { const c = inTerm(k[0]); if (c && k[1] >= 0.5 && c.t1 - k[0] < 0.3) k[0] = c.t1 + 0.02; }   // a real impact in a TERM's last 0.3 s waits for it to end
  const KM2 = KM.filter(([tk, s0]) => s0 >= 0.2 && !inTerm(tk)).map(([tk, s0, d]) => [tk, s0 >= 0.8 ? s0 : Math.min(s0, 0.35), d]);   // NO shake at all during a TERM line
  const KM_TERM = KM.filter(([tk, s0]) => s0 >= 0.5 && inTerm(tk)).map(([tk, s0]) => `${tk.toFixed(2)} ${s0} in ${inTerm(tk).text}`);
  const kickR = makeKick(KM2);
  { tw.setLean(0.12 * smooth(u01(FALL0, LEAN0, LEAN1))); tw.pivot.updateMatrixWorld(true); const q = new THREE.Vector3(1.25, GY + 0.2, -0.3); tw.g.localToWorld(q); FALLS = q.toArray(); tw.setLean(0); }

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words (turbo glide rule)
  const Fr = [], F = (tt, pos, look, fov = 44, o = {}) => Fr.push({ t: tt, pos, look, fov, ...o });
  const Fk = (tt, pos, look, fov = 44, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  const P = (tt, pos, look, fov = 44) => Fr.push({ t: tt, pos, look, fov, pass: true });
  // HOOK: the sailboat bonks the rock → Gary waving → the tug hits → splash
  Fk(0, [-4.8, 3.0, 11.5], [-8.6, 1.0, 2.8], 42, SB + 0.15);
  P(W('hook', 'rock'), [-1.5, 3.8, 10.5], [-3.2, 3.6, 2.6], 42);   // r1 camera: a sweep across the rock to Gary
  Fk(t.waves - 0.1, [2.6, 4.0, 9.2], [4.0, 3.4, 2.4], 40, t.flashlight + 0.2);
  Fk(t.tugboat - 0.05, [8.2, 4.6, 17], [7, 2.3, 2.4], 56, TUG + 0.12);   // Gary + the tug's bow both in frame
  F(SPL, [4.8, 3.4, 17.5], [2.8, 1.2, 8.8], 44);
  // CONGRATS: Gary up the ladder, ta-da; the gull steals the batteries; the sun dives
  Fk(t.worst - 0.2, [1.6, 4.4, 10.4], [1.0, 3.0, 3.6], 42, t.worst + 0.35);
  Fk(t.seagull - 0.1, [1.3, 4.3, 7.9], [0.9, 3.3, 3.6], 38, GOFF + 0.1);
  // RANGE: the lamp; over Gary's shoulder to the hull-down tug on the curved sea; the rise; the whole tug from the top; night
  Fk(t.lights - 0.05, [2.8, 3.9, 6.8], [0.6, 3.0, 0.0], 38, t.lamp);   // the lamp lights (r4 camera: the path in no longer passes through Gary)
  Fr.push({ t: t.three, pos: TUGCAM0, look: [0, 10.8, 0], fov: 64, keep: true, until: t.geographic - 0.7, swoop: 60, lead: 0, maxLead: 0 });   // r2: SWOOP out to the tug's deck (a new place): over the lookout's shoulder; the sea curves over the lamp; the tower rises over the horizon
  Fr.push({ t: t.geographic + 0.15, pos: TUGCAM0, look: [0, 23, 0], fov: 54, keep: true, until: t.four - 0.15, lead: 0, maxLead: 0 });   // r4 camera: tilt up with the rising tower (under GEOGRAPHIC RANGE)
  Fr.push({ t: t.two, pos: [5.5, GY + 1.8, 6.5], look: [0.6, GY + 0.9, 0], fov: 42, keep: true, until: t.twenty + 0.25, swoop: true });   // swoop back in: Gary + the lamp on top, 200 FT
  Fk(t.everywhere + 0.1, [6, 13, 22], [0, 10.5, 0], 52);
  // REFLECTOR: rays (sky) in the wide; the fish; the mirror (term); the beam out to sea; Gary's face in it
  Fk(W('reflector', 'called') - 0.05, [1.5, GY + 1.6, 5.6], [0, GY + 1.3, -0.5], 40, t.reflectorW + 0.1);
  F(t.fourR - 0.1, [-4.5, GY + 2.6, 11], [5, GY + 0.8, -2], 46);
  Fr.push({ t: t.looked - 0.05, pos: [2.0, GY + 1.25, 3.6], look: [0.9, GY + 0.75, -0.3], fov: 34, keep: true, until: t.now - 0.05, lead: 0.02, maxLead: 0.04 });   // (no drift: the next frame is 16 m down)   // the blast, then he turns to us: SHADES ON (held through "at night now")
  // LENS: shades; dive down with Gary on the banister to the boulder; slice; the lens; the climb; it lights
  { const gs = tw.stairAt(0.5), g = [Math.sin(gs.a) * 0.42, gs.y + 0.95, Math.cos(gs.a) * 0.42]; P(lerp(SLIDE0, SLIDE1, 0.5), [g[0] + 1.6, g[1] + 2.0, g[2] + 2.6], g, 62); }   // r4 camera: chase Gary down the banister
  Fr.push({ t: t.boulder - 0.05, pos: [4.4, 5.6, 9.6], look: [1.5, 3.8, 2.2], fov: 44, keep: true, until: THUD + 0.35, swoop: true });   // r2 camera: boulder 62 %, Gary 33 %   // the barge + its crane in frame
  Fk(t.sliced - 0.05, [3.3, 4.6, 7.6], [1.45, 3.7, 2.1], 40, SPLIT + 0.15);
  Fk(t.fresnel2 + 0.25, [5.8, 4.6, 5.4], [2, 3.9, 1.8], 40, t.bend);
  P(t.way + 0.1, [6, 6.5, 2.8], [1.6, 5.2, 1], 44);   // rise into the climb
  P(lerp(CLIMB0, CLIMB1, 0.5), [1.6, 9.8, 10.4], [-0.3, 10.2, -0.2], 46);
  Fk(SET + 0.1, [2.0, GY + 1.4, 6.0], [0.2, GY + 1.2, -0.4], 42, t.candlepower - 0.35);
  // CLOCK: one wide: the beam points one way (right), the cruise ship sneaks in on the dark left, BONK; the shaft + weight; CUCKOO; the shaft again; the crank; push to the lantern
  Fr.push({ t: t.wayC + 0.15, pos: [-3, 32, 25], look: [-3.5, 4, -3.5], fov: 60, swoop: 30 });
  P(CBONK - 0.3, [-6, 27, 23.5], [-6.0, 3.5, -3.0], 58);   // r3 camera: sink toward the bow, reaching it on the BONK   // r2: crane up and out: the beam one way (right), the cruise ship sneaks in on the dark left, BONK, in one high wide
  Fk(t.lensC, [2, 14, 18], [0, 13.5, 0], 48);
  Fk(CUCKOO + 0.35, [0.3, 17.8, 6.0], [0.2, 17.25, 0.1], 48, CUCKOO + 0.7);   // r2 camera: gull 16 %, Gary 78 %
  Fk(t.clockwork - 0.1, [2.4, 17.9, 6.2], [0, 17.5, -0.2], 46);   // r2 camera: a slide, not a 4th zoom
  Fk(t.hours - 0.25, [4, 12.5, 13.5], [0.2, 11.5, -0.3], 54);
  Fk(W('clock', 'back'), [3.4, 17.6, 5], [0.8, 16.9, 0.3], 40, t.upK + 0.2);   // crank push-in (face above the caption)
  // MERCURY: the stutter; the pour; the poke; the carousel (all in the lantern: short moves)
  Fk(t.barely - 0.1, [2.6, GY + 1.5, 6.0], [0.3, GY + 0.55, 0], 42, t.turns + 0.15);
  Fk(t.mercury - 0.2, [-1.6, GY + 2.3, 3.4], [0.65, GY + 0.45, 0.25], 44, POUR1);   // r2: mercury macro at the trough rim: the pour, the silver ring rising, the lens lifting
  Fk(t.nowM - 0.1, [2.6, GY + 1.6, 6.0], [0.3, GY + 1.1, 0], 42, t.finger + 0.05);
  Fr.push({ t: t.spins + 0.35, pos: [6.6, 21.6, 4.2], look: [-0.6, 20.3, -0.4], fov: 46, swoop: 30 });   // r4 (manager): orbit OUT behind the lantern: the spinning beams sweep the night sea and flash across the incoming freighter
  Fk(t.carousel - 0.3, [5.4, 21.4, 3.2], [0, 20.5, 0], 42, t.carousel + 0.3);   // …then push in to the back glass: the gull rides the lens like a carousel
  // CHAR: from the gallery, down-left to the confused sailboat (the light next door far behind it); the 2nd bullseye; from the sea: flash-flash; HELP blinks; the storm hits (same view)
  Fr.push({ t: t.mistakes + 0.02, pos: [-3, 5.0, 15], look: [-15, 3.6, 5.5], fov: 50, swoop: true });   // r3 camera: the bow arrives on "mistakes"
  Fk(W('char', 'lighthouse'), [-4, 4.8, 13], [-10, 3.6, 4.1], 50, SAIL_BONK + 0.35);   // r2 camera: the bow 35 %, the light next door 69 %
  F(t.characteristic - 0.15, [4.2, 4.0, 27], [-2.9, 12.0, 3.8], 56); P(t.yours - 0.1, [3, 8.5, 22], [-2.9, 14, 3.8], 54);   // r4 camera: a crane-up with both lights in frame
  Fk(t.garys - 0.1, [3.0, GY + 1.3, 5.0], [1.0, GY + 1.0, 0.2], 40, t.help + 0.3);   // r2 pacing: push into the gallery: Gary flaps a board over the lens = HELP
  // STORM: the wave rips the bottom bricks (base close); pull back as the tower leans
  Fk(t.bricks - 0.1, [-0.4, 4.2, 9.0], [-2.0, 3.3, 0.4], 42, BRK + 0.3);
  Fk(t.leans, [-1, 10, 21], [1.2, 10.5, 0], 54, LEAN1 + 0.1);
  // SMEATON: granite blocks lock in (the dovetails in section), the flare + the oak, the term, Smeaton's label
  Fk(t.puzzle - 0.1, [1.6, 4.4, 9.2], [1.4, 3.8, 0.6], 42, t.pieces + 0.15);
  Fk(t.oak - 0.25, [0.5, 3.8, 10.5], [-3, 5.2, -0.6], 46, t.oak + 0.1);   // r2 camera: the flared profile next to the oak
  Fk(t.dovetailed - 0.1, [6.9, 4.6, 6.6], [1.4, 4.0, 0.3], 46);   // r4 camera: over the boulder, toward Gary
  Fk(t.smeatons + 0.05, [6.0, 3.6, 10.0], [3.0, 3.0, 2.5], 46, t.rockS + 0.25);   // r3 logic: the wedge + its splash mid-frame   // r2 camera: the rock chunk in frame
  // FOG: in the fog; the bonk; the horn; the pump; the blast rings; Gary at the mouth; WHAT?
  Fk(t.nobody + 0.1, [12, 5, 17], [8, 2, -1], 48, FBONK + 0.15);
  Fk(t.compressed + 0.05, [3.8, 4.4, 7.6], [3.2, 3.5, 1.2], 40, t.air + 0.15);
  Fk(t.foghorn - 0.15, [9.5, 4.6, 9.0], [5.0, 3.6, 1.0], 44, t.out + 0.1);
  Fk(t.garyFg - 0.15, [5.6, 3.9, 5.4], [4.5, 3.25, 1.5], 36, t.what + 0.35);
  // DAYMARK: our white stick + the one next door; the orbit round the back while Gary paints; polka dots; the big wave rolls in from the right
  Fk(W('daymark', 'every') - 0.05, [8, 4.5, 24], [3.2, 10, 0], 40, t.stick + 0.25);   // r3 camera: our tower left third, the sticks right third   // r2 camera: our tower 27 %, three more white sticks 51/70/85 %
  F(t.paint + 0.1, [7.0, 6.2, 6.4], [3.1, 5.0, -0.5], 44);   // r4 camera: Gary mid-frame on the swing
  P(t.daymark + 0.3, [10.0, 9.0, -2.5], [1.2, 8.5, -1.0], 44);
  Fk(t.spiral - 0.15, [14, 9, -16], [0.5, 12.3, -1], 54);   // r2 camera: the whole painted back of the tower
  Fk(t.polka - 0.05, [8.0, 12.6, -4.5], [0.6, 12.2, -0.8], 40, t.dots + 0.2);
  Fr.push({ t: t.waveW, pos: [23, 10, 8], look: [0, 11, -2.5], fov: 63, keep: true, until: IMPACT + 0.9, swoop: 35 });   // r2: pull back from the polka dots to the side: the 11 m breaker rolls in, hits, its white water swallows the whole tower
  // HOLD + FINISH: arc round from the side to a front wide: the granite holds, the lens turns, the cruise ship sails safely past behind
  // the rock (the sign → 1), then the radio, helipad and perch pop on top; push to the perch
  Fk(t.misses - 0.3, [7, 10, 28], [-1, 11, -2], 52, FLIP + 0.05);
  Fr.push({ t: t.radio + 0.3, pos: [4.5, 18.0, 15.0], look: [0.3, 20.6, -0.5], fov: 44, keep: true, until: t.perch + 0.3, swoop: true });   // r3 camera: the top's kit, close
  Fk(t.fly - 0.1, [1.5, 17.5, 13], [-1.6, 20, -0.4], 42, GLB + 0.6);   // push in: the gull flies into the glass
  // END: the hero wide at sunset (front-right: the cut + the spiral flank); Gary at the sign; money; blind, soaked, deaf; the boats pass
  // behind; the gull dives into the sign (BONK, the card → 0) and lands dazed at Gary's feet — one frame from "blind" to the end
  Fk(t.lighthouseE - 0.1, [20, 11, 19], [0, 12, -1], 56, t.lighthouseE + 0.3);   // r4: the finished lighthouse whole
  Fk(t.rockE - 0.1, [-1.4, 5.0, 10.0], [-2.5, 3.8, 2.4], 42, t.rockE + 0.25);   // r4 camera: low look → the money move is a push, not a bounce
  Fk(t.fourE - 0.1, [-1.2, 5.6, 10.5], [-2.4, 4.75, 2.4], 44, t.dollars + 0.15);
  Fk(t.blind - 0.15, [-2.25, 3.75, 6.8], [-2.45, 3.45, 2.8], 42, t.deaf + 0.2);   // r3: low and close — Gary ~45 % of the frame for BLIND / SOAKED / DEAF
  Fk(t.miss - 0.1, [1.5, 6.2, 12.5], [-4.2, 3.0, 1.5], 52);   // r3 camera: rise — the boats sail past left of the oak, the sign + Gary on the left
  Fk(t.seagullE - 0.15, [-2.4, 4.4, 9.6], [-2.6, 3.2, 2.7], 46);   // push in for the gull's dive into the sign
  Fk(GLAND2 + 0.05, [-2.3, 4.6, 9.9], [-2.6, 4.0, 2.7], 44, END - 1.2);   // r2 camera: sign 7–45 %, Gary 70 %, the gull dazed at his feet
  Fr.push({ t: END - 0.35, pos: [15, 12.5, 18], look: [-0.5, 11, 0], fov: 54, keep: true, swoop: true, lead: 0.02, maxLead: 0.04 });   // r4: crane back to the finished, painted lighthouse at sunset — lands early
  Fr.push({ t: END, pos: [15.2, 12.6, 18.3], look: [-0.5, 11, 0], fov: 53.5, stop: true });   // …and rests (a tiny drift)
  // turbo creep: every hold longer than 1.8 s gets a mid-hold pass key that orbits ±11° round its own look point (same subject,
  // a slow arc instead of a parked lens); telephotos are left alone
  { Fr.sort((a, b) => a.t - b.t); const add = [];
    for (let i = 0; i + 1 < Fr.length; i++) { const a = Fr[i], b = Fr[i + 1]; if (b.t - a.t < 1.8 || a.pass || a.stop || a.fov < 20 || (a.until && a.until > a.t + 0.5 * (b.t - a.t))) continue;   // r2 camera: a creep never leaves before `until`
      const th = (i % 2 ? 1 : -1) * 0.19, dx = a.pos[0] - a.look[0], dz = a.pos[2] - a.look[2];
      const c = { t: a.t + 0.5 * (b.t - a.t), pos: [a.look[0] + dx * Math.cos(th) - dz * Math.sin(th), a.pos[1], a.look[2] + dx * Math.sin(th) + dz * Math.cos(th)], look: a.look, fov: a.fov * 0.94, pass: true, creep: true };
      const d3 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), need = (p, q) => 0.28 + Math.max(d3(p.pos, q.pos), 0.7 * d3(p.look, q.look)) / 16;
      if (b.t - c.t >= 1.2 * need(c, b) + 0.15 && c.t - a.t >= 0.7) add.push(c); }   // only where the next move keeps its legal time
    Fr.push(...add); }
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr, { shortHoldPass: true, minHold: 0.9, move: [0.28, 16], lead: 0.12, maxLead: 0.25 }));   // turbo+: holds creep toward the next frame (never a dead stop)
  const HOLDS = []; { let a = null; const dt = 1 / 30; let prev = rail.at(0);
    for (let tt = dt; tt <= END + dt; tt += dt) { const c = rail.at(Math.min(tt, END)); const m = Math.hypot(...c.pos.map((v, i) => v - prev.pos[i])) + Math.hypot(...c.look.map((v, i) => v - prev.look[i])) + Math.abs(c.fov - prev.fov) * 0.02; prev = c;
      if (m < 0.004) { if (a == null) a = tt - dt; } else { if (a != null && tt - a >= 0.9) HOLDS.push([a, tt]); a = null; } } }
  const pushAt = (tt) => { for (const [a, b] of HOLDS) { if (tt >= a && tt <= b) return 0.07 * smooth((tt - a) / (b - a)); if (tt > b && tt < b + 0.6) return 0.07 * (1 - smooth((tt - b) / 0.6)); } return 0; };

  // TURBO fill: every stretch > 0.55 s with no new burst / kick / framing / callout gets a small burst at the subject (the rail's
  // look point, pulled 0.8 m toward the lens), keyed to the nearest spoken word in it: spray at sea level, sparkles at the lantern
  const FILL = []; {
    const evT = [...FXN.times, ...KM2.map((k) => k[0]), ...Fr.map((f) => f.t), ...story.callouts.map((c) => c.t0)].filter((x) => x >= 0.2 && x <= END - 0.3).sort((p, q) => p - q);
    const wT = story.words.map((w) => w.t0);
    for (let i = 0; i + 1 < evT.length; i++) { const a = evT[i], b = evT[i + 1]; if (b - a <= 0.36) continue; const n = Math.floor((b - a) / 0.36);
      for (let k = 1; k <= n; k++) { let tk = a + k * (b - a) / (n + 1); const w = wT.find((x) => Math.abs(x - tk) < 0.18); if (w) tk = w; FILL.push(tk); } }
    FILL.forEach((tk, i) => { const c = rail.at(tk), L = c.look; if (c.fov < 20) return; const P0 = c.pos, d = Math.hypot(P0[0] - L[0], P0[1] - L[1], P0[2] - L[2]), q = Math.min(0.8, d * 0.15) / d, side = (i % 2 ? 1 : -1) * d * 0.08;
      const pos = [L[0] + (P0[0] - L[0]) * q + side, L[1] + (P0[1] - L[1]) * q + 0.3, L[2] + (P0[2] - L[2]) * q], wet = L[1] < 2.2 || (tk > STORM && tk < FOG1);
      if (wet) fx.burst('drops', tk, { pos, box: [d * 0.1, 0.2, 0.3], n: 12, dir: [0, 1, 0.3], spread: 0.6, speed: [1.2, 2.6], size: [0.03, 0.06], floor: L[1] < 2.2 ? -0.3 : RY, seed: 400 + i });
      else fx.burst('spark', tk, { pos, box: [d * 0.06, d * 0.06, 0.2], n: 10, speed: [0.5, 1.4], spread: 1.3, size: [0.04, 0.09], seed: 400 + i }); });
  }

  // ---------------------------------------------------------------- Gary
  const WET = (tt) => (tt > SPL && tt < t.lights + 2 ? 1 - u01(tt, t.lights, t.lights + 2) : 0) + (tt > IMPACT ? 1 : 0);
  function garyAt(tt) {
    const g = gary; let p = { t: tt, eyes: blinkE(tt), mouth: 'smile', brows: 0 };
    const hold = { armR: { x: -1.2, z: 0.15, el: 0.6 } };
    if (tt < FL0) { const wave = Math.sin(tt * 9) * 0.35; p = { ...p, x: 4.4, y: RY, z: 2.4, rotY: 1.05, armR: { x: -2.4 + wave, z: 0.3, el: 0.25 }, armL: { x: -0.4, z: 0.2, el: 0.3 }, mouth: tt > t.tugboat ? 'scream' : 'grin', eyes: tt > t.tugboat ? 'wide' : blinkE(tt) }; }
    else if (tt < SPL) { const q = hop(tt, FL0, SPL, [4.4, RY, 2.4], [2.9, -0.5, 9.4], 3.0); const u = u01(tt, FL0, SPL); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 0.6, rx: -u * 2.4, armR: { x: -2.8, z: 0.8 }, armL: { x: -2.8, z: 0.8 }, legL: { x: -0.6 }, legR: { x: 0.4 }, eyes: 'wide', mouth: 'scream' }; }
    else if (tt < CL0) { p = { ...p, x: lerp(2.9, 2.72, u01(tt, SPL, CL0)), y: -0.95 + 0.25 * smooth(u01(tt, SPL, CL0)), z: lerp(9.4, 9.0, u01(tt, SPL, CL0)), rotY: 0.2, eyes: 'wide', mouth: 'o', armR: { x: -2.6, z: 0.6 }, armL: { x: -2.6, z: 0.6 } }; }
    else if (tt < CL1) { const u = smooth(u01(tt, CL0, CL1)); p = { ...p, x: lerp(2.72, 1.62, u), y: lerp(-0.7, RY - 0.1, u), z: lerp(9.0, 5.45, u), rotY: PI + 0.29, rx: 0.55, armR: { x: -2.6 + Math.sin(tt * 14) * 0.4, z: 0.2 }, armL: { x: -2.6 - Math.sin(tt * 14) * 0.4, z: 0.2 }, legL: { x: -0.6 + Math.sin(tt * 14) * 0.5, kn: 0.6 }, legR: { x: -0.6 - Math.sin(tt * 14) * 0.5, kn: 0.6 } }; }
    else if (tt < WALK0) {
      const q = K(tt, [[CL1, [1.6, RY, 5.4]], [STAND, [0.9, RY, 3.7]]]);
      const tada = tt > t.worst - 0.15 && tt < GOFF + 0.1, look = tt > GIN && tt < GOFF + 0.3 ? 'up' : tt > t.andC ? 'sky' : null;
      p = { ...p, x: q[0], y: RY, z: q[2], rotY: tt < STAND ? PI + 0.6 : look === 'sky' ? 0.9 : 0.15, walk: tt < STAND ? tt * 11 : undefined, armR: tada ? { x: -2.7, z: 0.35, el: 0.15 } : hold.armR, armL: tada ? { x: -0.2, z: 0.9, el: 0.6 } : { x: 0, z: 0.15 },
        mouth: tt > BAT ? 'o' : tada ? 'grin' : 'smile', eyes: tt > BAT && tt < GOFF + 0.6 ? 'wide' : blinkE(tt), look: look === 'up' ? [0, 1] : look === 'sky' ? [0.6, 0.6] : [0, 0], head: { x: look ? -0.3 : 0, y: 0 }, brows: tt > t.yet - 0.2 ? 0.8 : 0 };
    }
    else if (tt < GROW0) {
      const q = K(tt, [[WALK0, [0.9, RY, 3.7]], [t.lights, [0.35, RY, -0.35]]]); const crouch = tt > t.lights && tt < PICK ? 1 : 0;
      p = { ...p, x: q[0], y: RY - crouch * 0.18, z: q[2], rotY: tt < t.lights ? PI + 0.7 : tt > PICK ? 1.83 : 0.9, walk: tt < t.lights ? tt * 11 : undefined, legL: crouch ? { x: -1.0, kn: 1.4 } : undefined, legR: crouch ? { x: -1.0, kn: 1.4 } : undefined,
        armR: { x: -1.3, z: 0.2, el: 0.9 }, armL: { x: -1.0, z: 0.2, el: 0.9 }, mouth: tt > t.ships ? 'flat' : 'grin', look: tt > t.see ? [0.8, 0.1] : [0, -0.4] };
    }
    else if (tt < SLIDE0) {
      const y = tt < GROW1 ? growY(tt) : GY;
      const q = tt < LAMPSET ? [0.35, y, -0.35] : K(tt, [[LAMPSET, [0.35, GY, -0.35]], [LAMPSET + 0.4, [-0.8, GY, -0.75]], [LOOK0, [-0.8, GY, -0.75]], [LOOK0 + 0.45, [1.0, GY, -0.45]]]);
      const blasted = tt > BLAST - 0.05;
      p = { ...p, x: q[0], y: q[1], z: q[2], rotY: tt < LAMPSET ? 1.83 : tt < LOOK0 ? 0.35 : tt < SHADES - 0.3 ? -1.25 : lerp(-1.25, 0.2, smooth(u01(tt, SHADES - 0.3, SHADES))),   // r2: turns to us for the shades armR: tt < LAMPSET ? { x: -1.3, z: 0.2, el: 0.9 } : tt > MIR - 0.5 && tt < MIR + 0.2 ? { x: -1.8, z: 0.2, el: 0.4 } : { x: -0.1, z: 0.15 },
        armL: tt < LAMPSET ? { x: -1.0, z: 0.2, el: 0.9 } : { x: 0, z: 0.15 }, mouth: tt < GROW1 ? 'o' : blasted ? 'scream' : 'grin', eyes: blasted && tt < SHADES ? 'spiral' : tt < GROW1 ? 'wide' : blinkE(tt), look: tt > t.geographic && tt < LAMPSET + 1 ? [0.8, 0] : [0, 0],
        glow: blasted && tt < BLAST + 0.6 ? [0xfff2c0, 1.6 * (1 - u01(tt, BLAST, BLAST + 0.6))] : [0, 0], rx: blasted ? -0.25 * Math.exp(-(tt - BLAST) * 2) : 0, char: blasted ? 0.15 : 0 };
    }
    else if (tt < SLIDE1) { const u = 1 - smooth(u01(tt, SLIDE0, SLIDE1)) * 0.999, s = tw.stairAt(u), a = s.a; p = { ...p, x: Math.sin(a) * 0.42, y: s.y + 0.95, z: Math.cos(a) * 0.42, rotY: a - PI / 2 + PI, legL: { x: -1.45, kn: 1.3 }, legR: { x: -1.45, kn: 1.3 }, armR: { x: -2.9, z: 0.5 }, armL: { x: -2.9, z: 0.5 }, mouth: 'grin', eyes: 'open' }; }
    else if (tt < LIFT + 0.3) {
      const q = K(tt, [[SLIDE1, [-1.25, D.T.base, 0.3]], [SLIDE1 + 0.25, [-1.4, RY, 1.4]], [THUD - 0.3, [0.95, RY, 2.5]]]); const scared = tt > THUD - 0.1 && tt < THUD + 0.5;
      const swing = CUTS.reduce((s, c) => s + (tt > c - 0.12 && tt < c + 0.18 ? Math.sin((tt - c + 0.12) / 0.3 * PI) : 0), 0);
      p = { ...p, x: q[0], y: q[1] + (scared ? 0.35 * Math.sin(u01(tt, THUD - 0.1, THUD + 0.5) * PI) : 0), z: q[2], rotY: tt < THUD - 0.3 ? 2.1 : 0.85, walk: tt < THUD - 0.3 ? tt * 12 : undefined, mouth: scared ? 'scream' : 'grin', eyes: scared ? 'wide' : blinkE(tt),
        armR: tt > t.sliced - 0.4 && tt < SPLIT + 0.2 ? { x: -2.4 + swing * 1.8, z: 0.2, el: 0.2 } : { x: -0.2, z: 0.2 }, armL: { x: -0.3, z: 0.2 } };
    }
    else if (tt < SET + 0.2) {
      const q = garyPath(tt), climbing = tt > CLIMB0 && tt < CLIMB1 - 0.25, s = climbing ? tw.stairAt(smooth(u01(tt, CLIMB0, CLIMB1 - 0.25))) : null;
      p = { ...p, x: q[0], y: q[1], z: q[2], rotY: s ? Math.atan2(Math.cos(s.a), -Math.sin(s.a)) : tt < HOP0 ? -2.2 : 0.4, walk: tt < CLIMB1 ? tt * 17 : undefined, armR: { x: -3.0, z: 0.45, el: 0.55 }, armL: { x: -3.0, z: 0.45, el: 0.55 }, squash: tt < LIFT + 0.5 ? squash(tt, LIFT + 0.3, 0.3) : [1, 1], mouth: 'teeth', eyes: tt > CLIMB1 - 0.3 ? 'half' : 'wide', faceTint: [0xd83a3a, 0.35] };
    }
    else if (tt < STORM) {
      // in the lantern / watch room: the clockwork, the crank, the mercury, the poke, the bullseye, morse
      const DN = [t.falling - 1.0, t.falling - 0.35], UPW = [t.night + 0.1, t.night + 0.75], inWatch = tt > DN[1] && tt < UPW[0];   // r3 logic: down / up the hatch ladder (he used to teleport through the floor)
      const HT = [0.35, GY, 1.0], HB = [0.35, TW, 1.02], climb = (tt >= DN[0] && tt <= DN[1]) || (tt >= UPW[0] && tt <= UPW[1]);
      let pos = inWatch ? [1.0, TW, 0.35] : tt < BULL - 0.4 || tt > BULL + 0.6 ? [1.15, GY, 0.45] : [0.65, GY, 0.85];
      if (tt >= DN[0] && tt <= DN[1]) pos = K(tt, [[DN[0], [1.15, GY, 0.45]], [DN[0] + 0.15, HT], [DN[1] - 0.12, HB], [DN[1], [1.0, TW, 0.35]]]);
      if (tt >= UPW[0] && tt <= UPW[1]) pos = K(tt, [[UPW[0], [1.0, TW, 0.35]], [UPW[0] + 0.12, HB], [UPW[1] - 0.15, HT], [UPW[1], [1.15, GY, 0.45]]]);
      const crank = tt > CR0 && tt < t.night + 0.6 ? (tt < CR1 ? 1 : 0.35) : 0, ca = tt * (tt < CR1 ? 16 : 5);
      const push = tt > STUCK0 && tt < POUR0, pour = tt > POUR0 && tt < POUR1 + 0.2, poke = tt > POKE - 0.15 && tt < POKE + 0.5, morse = tt > MORSE0 - 0.2 && tt < MORSE1;
      p = { ...p, x: pos[0], y: pos[1], z: pos[2], rotY: climb ? 0 : inWatch ? -1.1 : push ? -1.4 : pour || poke ? -0.9 : 0.15, armR: climb ? { x: -2.6 + 0.45 * Math.sin(tt * 16), z: 0.25, el: 0.4 } : crank ? { x: -1.4 + Math.sin(ca) * 0.6, z: 0.3, el: 0.6 + Math.cos(ca) * 0.4 } : push ? { x: -1.6, z: 0.1, el: 0.2 } : pour ? { x: -1.1, z: 0.15, el: 0.7 } : poke ? { x: -1.6, z: 0.4, el: 0.05 } : morse ? { x: -1.8 + (morseOn(tt) ? 0 : 0.5), z: 0.3, el: 0.6 } : { x: -0.1, z: 0.15 },
        armL: climb ? { x: -2.6 - 0.45 * Math.sin(tt * 16), z: 0.25, el: 0.4 } : push ? { x: -1.6, z: 0.1, el: 0.2 } : { x: 0, z: 0.15 }, lean: push ? 0.35 : 0.03, mouth: push ? 'teeth' : tt > CUCKOO && tt < CUCKOO + 0.8 ? 'scream' : poke ? 'o' : 'smile', eyes: tt > NIGHT0 && tt < STUCK0 ? 'half' : tt > CUCKOO && tt < CUCKOO + 0.8 ? 'wide' : blinkE(tt), faceTint: push ? [0xd83a3a, 0.3] : [0, 0] };
    }
    else if (tt > FALL0 && tt < GETUP) {
      if (tt < FALLE) { const q = hop(tt, FALL0, FALLE, FALLS, [2.95, RY, 1.65], 0.8), u = u01(tt, FALL0, FALLE); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 0.3, rx: -u * 1.5, armR: { x: -2.8, z: 1.0 }, armL: { x: -2.8, z: 1.0 }, eyes: 'wide', mouth: 'scream', world: true }; }
      else p = { ...p, x: 2.95, y: RY, z: 1.65, rotY: 0.3, rx: -PI / 2 * (1 - smooth(u01(tt, GETUP - 0.3, GETUP))), eyes: 'spiral', mouth: 'wavy', world: true };
    }
    else if (tt <= FALL0) {
      const sl = smooth(u01(tt, LEAN0, LEAN1)); p = { ...p, x: lerp(1.15, 1.25, sl), y: GY, z: lerp(0.45, -0.3, sl), rotY: 0.35, rz: -0.15 * sl, armR: { x: -2.4, z: 1.0 }, armL: { x: -2.4, z: 1.0 }, mouth: 'scream', eyes: 'wide', squash: tt > LEAN1 ? squash(tt, LEAN1, 0.3) : [1, 1] };
    }
    else if (tt < PUMP0 - 0.4) {
      const ham = Math.max(0, Math.sin(tt * 13)), wob = tt > t.rockS - 0.5 && tt < t.rockS + 0.5; p = { ...p, x: 2.95, y: RY, z: 1.65, rotY: wob ? 0.4 : -1.2, armR: { x: -2.6 + ham * 1.8, z: 0.25, el: 0.2 }, mouth: wob ? 'scream' : tt > OAK && tt < OAK + 0.8 ? 'o' : 'grin', eyes: wob ? 'wide' : blinkE(tt), look: tt > OAK - 0.2 && tt < OAK + 0.9 ? [-0.8, 0.3] : [0, 0] };
      if (wob) { const w = Math.sin((tt - t.rockS) * 18); p.armR = { x: -2.6 + w, z: 1.0 }; p.armL = { x: -2.6 - w, z: 1.0 }; p.rz = 0.15 * w; }
      if (tt > FOG0) p = { ...p, x: 2.0, z: 1.9, rotY: 0.7, armR: { x: -0.2, z: 0.2 }, mouth: tt > FBONK ? 'o' : 'flat', eyes: tt > FBONK && tt < FBONK + 0.6 ? 'wide' : blinkE(tt) };
    }
    else if (tt < CHAIR0) {
      const atMouth = tt > t.garyFg - 0.6, blown = tt > HB2, wq = K(tt, [[t.garyFg - 0.6, [2.05, 1.9]], [t.garyFg, [5.05, 1.6]]]);
      p = { ...p, x: wq[0], y: RY, z: wq[1], walk: atMouth && tt < t.garyFg ? tt * 12 : undefined, rotY: atMouth ? (tt > t.what - 0.2 ? (() => { const c = rail.at(tt).pos; return Math.atan2(c[0] - 5.05, c[2] - 1.6); })() : -1.0) : 0.7, armR: tt < PUMP1 ? { x: -1.4 + Math.sin(tt * 18) * 0.5, z: 0.2, el: 0.5 } : tt > t.what - 0.1 ? { x: -1.2, z: 1.2, el: 2.2 } : { x: -0.2, z: 0.2 }, armL: { x: 0, z: 0.15 },
        mouth: blown ? (tt > t.what - 0.1 ? 'o' : 'scream') : 'grin', eyes: blown ? 'spiral' : blinkE(tt), hatLift: blown ? clamp(u01(tt, HB2, HB2 + 0.3)) * (1 - smooth(u01(tt, t.what + 0.45, t.what + 0.75))) : 0, hairUp: blown && tt < t.what + 0.6 ? 1 : 0, rz: blown ? 0.2 * Math.exp(-(tt - HB2) * 3) : 0 };
      if (tt > t.by - 0.4) { const yC = paintY(CHAIR0 + 0.05), rr = tw.rAt(yC) + 0.55; p = { ...p, x: lerp(5.05, Math.cos(0.55) * rr, u01(tt, t.by - 0.4, CHAIR0)), z: lerp(1.6, -Math.sin(0.55) * rr, u01(tt, t.by - 0.4, CHAIR0)), rotY: -2.4, walk: tt * 11, eyes: blinkE(tt), mouth: 'smile', hatLift: 0, rz: 0 }; }
    }
    else if (tt < IMPACT) {
      const yC = paintY(tt); const ang = 0.55;   // the chair hangs on the +x/back side, visible to the orbit
      p = { ...p, x: Math.cos(ang) * (tw.rAt(yC) + 0.55), y: yC - 0.8, z: -Math.sin(ang) * (tw.rAt(yC) + 0.55), rotY: PI / 2 - ang + PI, legL: { x: -1.45, kn: 1.4 }, legR: { x: -1.45, kn: 1.4 },
        armR: { x: -1.9 + Math.sin(tt * 10) * 0.5, z: 0.1, el: 0.5 }, mouth: tt > WV0 + 0.3 ? 'scream' : 'grin', eyes: tt > WV0 + 0.3 ? 'wide' : blinkE(tt) };
      if (tt > t.bigW - 0.4) { const q = K(tt, [[t.bigW - 0.4, [p.x, p.y, p.z]], [t.bigW, [1.9, GY, -0.6]]]); p = { ...p, x: q[0], y: q[1], z: q[2], legL: undefined, legR: undefined, rotY: 0.5, armR: { x: -2.6, z: 0.8 }, armL: { x: -2.6, z: 0.8 } }; }
    }
    else if (tt < FLIP + 1.0 || tt < t.radio) {
      if (tt < WASH1) { const q = hop(tt, IMPACT + 0.2, WASH1, [1.9, GY, -0.6], [-2.9, RY, 1.4], 2.0); const u = u01(tt, IMPACT + 0.2, WASH1); p = { ...p, x: q[0], y: Math.max(RY, q[1]), z: q[2], rotY: 0.4, rx: -u * 1.6, armR: { x: -2.8, z: 0.9 }, armL: { x: -2.8, z: 0.9 }, eyes: 'wide', mouth: 'scream' }; }
      else { const q = K(tt, [[WASH1 + 0.5, [-2.9, RY, 1.4]], [FLIP - 0.35, [-1.95, RY, 3.0]]]); const flat = tt < WASH1 + 0.5; p = { ...p, x: q[0], y: RY, z: q[2], rotY: tt < FLIP - 0.35 ? 0.3 : 0.6, rx: flat ? -PI / 2 * (1 - u01(tt, WASH1 + 0.2, WASH1 + 0.5)) : 0, walk: !flat && tt < FLIP - 0.35 ? tt * 10 : undefined,
        armR: tt > FLIP - 0.3 && tt < FLIP + 0.4 ? { x: -2.0, z: 0.4, el: 0.4 } : tt > FLIP + 0.4 ? { x: -2.7, z: 0.4, el: 0.2 } : { x: -0.2, z: 0.2 }, mouth: tt > FLIP ? 'grin' : 'flat', eyes: blinkE(tt) }; }
    }
    else {
      const blindA = tt > t.blind - 0.05 && tt < t.soaked - 0.05, soakA = tt > t.soaked - 0.05 && tt < t.deaf - 0.05, deafA = tt > t.deaf - 0.05 && tt < t.deaf + 0.75;   // r2 comedy: act out each stamp
      const gx = tt < t.blind - 0.05 ? -1.95 : tt < t.soaked - 0.1 ? lerp(-1.95, -2.45, smooth(u01(tt, t.blind - 0.05, t.soaked - 0.12))) : lerp(-2.45, -1.95, smooth(u01(tt, t.soaked - 0.05, t.soaked + 0.35)));   // r3: gropes into the sign post, the slap shoves him back
      p = { ...p, x: gx, y: RY, z: 3.0, rotY: tt > GBONK - 0.4 ? -0.5 : blindA ? -1.2 : soakA || deafA ? 0.15 : 0.4, hatLift: tt > t.soaked - 0.08 ? clamp(u01(tt, t.soaked - 0.08, t.soaked + 0.3)) : 0, noHat: tt > t.soaked + 0.32, walk: blindA ? tt * 8 : undefined, armR: tt > CARD0 ? { x: -2.2, z: 0.2, el: 1.9 } : blindA ? { x: -1.45 + 0.2 * Math.sin(tt * 9), z: 0.25, el: 0.15 } : deafA ? { x: -1.3, z: 0.9, el: 2.5 } : soakA ? { x: -0.1, z: 0.55 + 0.12 * Math.sin(tt * 30), el: 0.3 } : { x: -0.2, z: 0.2 },
        armL: blindA ? { x: -1.45 - 0.2 * Math.sin(tt * 9), z: 0.25, el: 0.15 } : soakA ? { x: -0.1, z: 0.55 + 0.12 * Math.sin(tt * 30 + 1), el: 0.3 } : { x: -0.2, z: 0.2 }, mouth: tt > CARD0 ? 'frown' : tt > t.blind - 0.1 && tt < t.deaf + 0.5 ? 'wavy' : 'smile', eyes: tt > t.blind - 0.1 && tt < t.deaf + 0.5 ? 'half' : blinkE(tt), look: tt > GBONK - 0.5 ? [-0.3, 0.9] : [0, 0], head: { x: tt > GBONK - 0.5 && tt < GLAND2 ? -0.35 : 0 } };
      if (tt > CARD0) p.head = { x: 0.25, y: 0, z: 0.1 };
    }
    if (!p.world && leanAt(tt) > 0.001 && p.y > RY + 1) { tw.setLean(leanAt(tt)); tw.pivot.updateMatrixWorld(true); v3.set(p.x, p.y, p.z); tw.g.localToWorld(v3); p.x = v3.x; p.y = v3.y; p.z = v3.z; p.rz = (p.rz ?? 0) - leanAt(tt); }
    const wet = clamp(WET(tt));
    p.tint = wet > 0 ? [0x1c3550, 0.22 * wet] : [0, 0];
    g.set(p);
    shades.visible = tt > SHADES; shades.scale.setScalar(tt < SHADES + 0.25 ? Math.max(0.01, easeOutBack(u01(tt, SHADES, SHADES + 0.25))) : 1);
    flash.g.visible = tt < LIGHT; Lt.handBeam.visible = tt > t.flashlight && tt < BAT; Lt.handBeam.material.uniforms.uOpacity.value = 0.35;
    flash.lensM.color.setScalar(tt > t.flashlight && tt < BAT ? 1 : 0.15);
    cutter.visible = tt > t.sliced - 0.5 && tt < SPLIT + 0.3; flask.visible = tt > POUR0 - 0.3 && tt < POUR1 + 0.3; mallet.visible = tt > GETUP && tt < FOG0; roller.visible = tt > CHAIR0 && tt < t.bigW - 0.4; board.visible = tt > MORSE0 - 0.2 && tt < MORSE1;
    board.position.set(0, -0.05, morseOn(tt) ? 0.2 : 0.32);
    dizzy.update(tt, (tt > BLAST && tt < BLAST + 1.2) || (tt > HB2 && tt < t.what + 0.8) ? 1 : 0, gary.head.getWorldPosition(v3).toArray());
  }

  // ---------------------------------------------------------------- the seagull
  function gullAt(tt) {
    let p = { t: tt, flap: 0, eyes: 'open' }, vis = true;
    const flyPath = (a, b, pts) => { const u = smooth(u01(tt, a, b)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), f = u - i; return pts[i].map((v, k) => lerp(v, pts[i + 1][k], f)); };
    if (tt < GIN) vis = false;
    else if (tt < GLAND) { flash.g.getWorldPosition(v3); const q = flyPath(GIN, GLAND, [[-6, RY + 6, 1], [-1, RY + 3.5, 3], [v3.x, v3.y + 0.06, v3.z]]); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 1.0, flap: 1 }; }
    else if (tt < GOFF) { flash.g.getWorldPosition(v3); p = { ...p, x: v3.x, y: v3.y + 0.06, z: v3.z, rotY: 0.4, peck: tt > t.stole ? 1 : 0, open: tt > BAT - 0.1 ? 0.6 : 0, flap: 0.25 }; }
    else if (tt < GOFF + 1.6) { flash.g.getWorldPosition(v3); const q = flyPath(GOFF, GOFF + 1.6, [[v3.x, v3.y + 0.06, v3.z], [-2, RY + 4, 2], [-9, RY + 9, -6]]); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: -2.2, flap: 1, open: 0.3 }; }
    else if (tt < t.sky - 0.6) vis = false;
    else if (tt < t.sky + 0.6) { const q = flyPath(t.sky - 0.6, t.sky + 0.6, [[-7, GY + 5, -2], [-1.0, GY + 3.2, -1.0], [3.0, GY + 2.2, -2.5]]); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 1.2, flap: 1, eyes: 'angry' }; }
    else if (tt < t.big) { p = { ...p, x: 2.15, y: GY + 1.03, z: -0.9, rotY: -0.6, eyes: tt > BLAST && tt < BLAST + 0.8 ? 'wide' : 'open' }; }
    else if (tt < CLIMB0) { p = { ...p, x: 2.0, y: RY + 2.25, z: 2.0, rotY: 0.3 }; if (tt < LIFT + 0.6) { const q = flyPath(t.big, ASM1, [[2.15, GY + 1.03, -0.9], [4, 10, 2], [2.2, RY + 2.25, 2.0]]); p = { ...p, x: q[0], y: q[1], z: q[2], flap: tt < ASM1 ? 1 : 0 }; } }
    else if (tt < SET + 0.3) { const L = lensPos(tt); p = { ...p, x: L[0], y: L[1] + 1.18, z: L[2], rotY: 0.6, eyes: 'open' }; }
    else if (tt < CUCKOO - 0.3) { p = { ...p, x: 0, y: FY + 1.18, z: 0, rotY: 0.5 }; }
    else if (tt < CUCKOO + 1.0) { const out = Math.sin(clamp(u01(tt, CUCKOO - 0.1, CUCKOO + 0.9)) * PI); p = { ...p, x: -0.52 - out * 0.35, y: TW + 0.55, z: 0.0, rotY: -PI / 2 + 0.6, open: tt > CUCKOO && tt < CUCKOO + 0.5 ? 0.8 : 0, eyes: 'wide', scale: 0.9 }; vis = out > 0.05; }
    else if (tt < CAR0 - 0.8) vis = false;
    else if (tt < t.thenC) { const a = lensAng(tt); if (tt < CAR0) { const q = flyPath(CAR0 - 0.8, CAR0, [[-4, GY + 5, 2], [0, FY + 1.18, 0]]); p = { ...p, x: q[0], y: q[1], z: q[2], flap: 1, rotY: 1 }; } else p = { ...p, x: Math.cos(-a) * 0.15, y: FY + 1.18, z: Math.sin(-a) * 0.15, rotY: a + 1.2, flap: 0.4, open: 0.5, eyes: 'wide', spread: 1 }; }
    else if (tt < STORM) { p = { ...p, x: -2.15, y: GY + 1.03, z: -0.9, rotY: 0.6 }; }
    else if (tt < SK0) { const wob = Math.sin(tt * 17) * 0.3; p = { ...p, x: 0.3, y: D.dome1 + 0.95, z: 0, rotY: 0.4, rz: wob + 0.6, flap: 1, eyes: 'wide' }; }
    else if (tt < FOG0) { p = { ...p, x: -3.9, y: RY + 2.45, z: -0.35, rotY: 0.6, eyes: tt > t.oak && tt < t.oak + 0.8 ? 'wide' : 'open' }; vis = tt > OAK + 0.2; }
    else if (tt < DOT[0] - 0.9) vis = false;
    else if (tt < DOT[2] + 0.9) { const a0 = 0.2, q = flyPath(DOT[0] - 0.9, DOT[2] + 0.9, [[-6, 16, -9], [0.5, 13.4, -3.2], [2.6, 13.0, -1.6], [4, 15, 3], [9, 18, 6]]); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 0.9 + a0, flap: 1 }; }
    else if (tt < t.perch - 0.8) vis = false;
    else if (tt < GBONK) { if (tt < t.perch + 0.4) { const q = flyPath(t.perch - 0.8, t.perch + 0.4, [[-8, GY + 5, 3], [-2.25, GY + 0.75 + 0.02, -0.55]]); p = { ...p, x: q[0], y: q[1], z: q[2], flap: 1, rotY: 1.4 }; } else if (tt < t.fly - 0.35) p = { ...p, x: -2.25, y: GY + 0.75, z: -0.55, rotY: 0.6 };
      else if (tt < GLB) { const q = flyPath(t.fly - 0.35, GLB, [[-2.25, GY + 0.75, -0.55], [-3.8, GY + 1.7, 1.3], [-1.5, GY + 1.45, -0.35]]); p = { ...p, x: q[0], y: q[1], z: q[2], flap: 1, rotY: tt < lerp(t.fly - 0.35, GLB, 0.5) ? -0.6 : 2.2, eyes: tt > GLB - 0.3 ? 'wide' : 'open' }; }
      else if (tt < GLB + 0.55) { const u = u01(tt, GLB, GLB + 0.55); p = { ...p, x: lerp(-1.5, -1.75, u), y: lerp(GY + 1.45, GY + 0.05, u * u), z: -0.38, rotY: 2.2, squash: tt < GLB + 0.15 ? 0.6 : 1, spread: 1, eyes: 'spiral' }; }   // slides down the glass
      else if (tt < t.end + 1.5) p = { ...p, x: -1.75, y: GY + 0.05, z: -0.38, rotY: 0.9, eyes: tt < GLB + 1.6 ? 'spiral' : 'open' };
      else { const q = flyPath(t.end + 1.5, GBONK, [[-1.75, GY + 0.05, -0.38], [-7, 13, -7], [-5.2, 5.5, -2.5], [-3.0, RY + 1.4, 2.25]]); p = { ...p, x: q[0], y: q[1], z: q[2], flap: 1, rotY: 0.35, rx: 0.3, eyes: tt > GBONK - 0.6 ? 'wide' : 'open', open: tt > GBONK - 0.5 ? 0.6 : 0 }; } }
    else if (tt < GFALL0) { p = { ...p, x: -3.0, y: RY + 1.4, z: 2.25, rotY: 0.35, eyes: 'spiral', squash: 0.7, spread: 1 }; }
    else { const q = hop(tt, GFALL0, GLAND2, [-3.0, RY + 1.4, 2.25], [-2.75, RY + 0.12, 3.45], 1.1), u = u01(tt, GFALL0, GLAND2); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 0.4, rx: tt < GLAND2 ? u * 6.2 : 0, rz: tt > GLAND2 ? 1.4 : 0, eyes: 'spiral', squash: tt > GLAND2 ? 0.5 * Math.exp(-(tt - GLAND2) * 6) : 0, spread: 1 }; }
    if (vis && leanAt(tt) > 0.001 && p.y > RY + 1) { tw.setLean(leanAt(tt)); tw.pivot.updateMatrixWorld(true); v3.set(p.x, p.y, p.z); tw.g.localToWorld(v3); p.x = v3.x; p.y = v3.y; p.z = v3.z; p.rz = (p.rz ?? 0) - leanAt(tt); }
    gull.root.visible = vis; if (vis) gull.set(p);
    flash.cells.forEach((c, i) => {   // the D cells: one in the gull's beak, one plops into the tide pool
      c.visible = tt > BAT && tt < BAT + (i ? 0.9 : 2.0);
      if (!c.visible) return;
      if (i === 0) { gull.beak.getWorldPosition(v3); c.position.set(v3.x, v3.y - 0.05, v3.z + 0.1); c.rotation.set(0, 0, PI / 2); }
      else { flash.g.getWorldPosition(v3); const q = hop(tt, BAT, BAT + 0.6, [v3.x, v3.y, v3.z], [2.3, RY + 0.03, 3.95], 0.5); c.position.set(...q); c.rotation.set(tt * 9, 0, 0.5); }
    });
  }

  // ---------------------------------------------------------------- boats, the set's stages
  function boatsAt(tt, SU) {
    // tug: in from the right → hits (hook) → backs off + turns → out to sea (the range lookout) → in the fog it bonks the right side → misses at the end
    { let x, z, yaw;
      if (tt < t.tugboat - 1.6) { x = 30; z = 2.2; yaw = PI; }
      else if (tt < TUG) { x = lerp(18, 10.3, smooth(u01(tt, t.tugboat - 1.6, TUG))); z = 2.4; yaw = PI; }
      else if (tt < TUG + 1.2) { x = 10.3 + 1.1 * smooth(u01(tt, TUG, TUG + 1.2)); z = 2.4; yaw = PI + 0.1 * Math.sin((tt - TUG) * 8) * Math.exp(-(tt - TUG) * 3); }
      else if (tt < 20) { const u = smooth(u01(tt, TUG + 1.2, t.ships)); x = lerp(11.4, 53, u); z = lerp(2.4, -14.5, u); yaw = lerp(PI, 0.3, smooth(u01(tt, TUG + 1.2, TUG + 2.8))) + PI * smooth(u01(tt, t.ships - 0.55, t.three - 0.15)); }   // turns round: bow (and the lookout) to the rock
      else if (tt < FOG0 - 1) { x = 70; z = -60; yaw = 0.3; }
      else if (tt < FBONK) { const u = smooth(u01(tt, FOG0 - 1, FBONK)); x = lerp(24, 10.4, u); z = lerp(-8, -1.2, u); yaw = PI - 0.25; }
      else if (tt < t.by) { x = 10.4 + 2.0 * smooth(u01(tt, FBONK, FBONK + 1.6)); z = -1.2 - 6 * smooth(u01(tt, HEARt(), HEARt() + 2)); yaw = PI - 0.25 + 1.2 * smooth(u01(tt, HEARt(), HEARt() + 1.5)); }
      else if (tt < t.end + 1) { x = 70; z = -70; yaw = 0; }
      else { const u = u01(tt, t.end + 1, END + 2); x = lerp(26, -26, u); z = lerp(-14, -18, u); yaw = PI; }
      const bonk = (tt > TUG && tt < TUG + 0.5 ? 0.18 * Math.sin((tt - TUG) * 25) * Math.exp(-(tt - TUG) * 6) : 0) + (tt > FBONK && tt < FBONK + 0.5 ? 0.18 * Math.sin((tt - FBONK) * 25) * Math.exp(-(tt - FBONK) * 6) : 0);
      const steady = tt > t.three - 0.4 && tt < t.four + 0.3; place(tug, x, z, yaw, SU, { pitch: bonk + (steady ? 0.015 * Math.sin(tt * 1.3) : 0), roll: steady ? 0.02 * Math.sin(tt * 0.9 + 1) : 0, dy: 0, flatCurve: tt > 8 && tt < 20, steady });   // the deck camera: a steady deck (no seasick swing)
      tug.wmat.emissiveIntensity = S.M.win * 0.9;
      const shrug = tt > t.hides + 0.05 && tt < GROW0 + 0.6;   // WHERE? turns round to us and shrugs, then points at the tower rising over the horizon
      capt.set({ scale: 0.7, hatLift: 0.12, x: tt > 8 && tt < 20 ? 1.85 : -0.2, y: tt > 8 && tt < 20 ? 0.73 : 0.73, z: tt > 8 && tt < 20 ? 0.12 : 0.4, rotY: tt > 8 && tt < 20 ? (shrug ? -PI / 2 + 0.6 : tt > GROW0 + 0.6 ? PI / 2 - 0.5 : PI / 2) : PI / 2 - 0.4, t: tt, armR: shrug ? { x: -0.5, z: 1.3, el: 1.3 } : tt > GROW0 + 0.6 && tt < 20 ? { x: -1.55, z: 0.25, el: 0.1 } : tt > 8 && tt < 20 ? { x: -1.6, z: 0.1, el: 1.2 } : { x: -0.2, z: 0.15 }, armL: shrug ? { x: -0.5, z: 1.3, el: 1.3 } : { x: 0, z: 0.15 }, eyes: (tt > TUG && tt < TUG + 1) || (tt > FBONK && tt < FBONK + 1) ? 'wide' : tt > SPOT && tt < 20 ? 'wide' : blinkE(tt + 1), mouth: shrug || (tt > GROW0 + 0.6 && tt < 20) ? 'o' : 'smile', look: tt > 8 && tt < 20 && !shrug ? [-0.5, 0] : [0, 0] });
      scope.visible = tt > 8 && tt < 20 && !shrug && tt < GROW0 + 0.6;
    }
    // sailboat: bonks the left side (hook) → drifts off → (char) comes back confused, bonks again → (hold) sails round you → (end) passes
    { let x, z, yaw;
      if (tt < SB) { x = lerp(-12.4, -10.3, smooth(u01(tt, -0.5, SB))); z = 2.9; yaw = 0; }
      else if (tt < 12) { x = -10.3 - 3.1 * smooth(u01(tt, SB, SB + 3)); z = 2.9 + 4 * smooth(u01(tt, SB + 1, 12)); yaw = 0.3 * smooth(u01(tt, SB, SB + 2)); }
      else if (tt < t.thenC - 2) { x = -60; z = 30; yaw = 0; }
      else if (tt < SAIL_MISS0) { x = -60; z = 30; yaw = 0; }
      else if (tt < t.end) { const a = lerp(2.4, 0.9, smooth(u01(tt, SAIL_MISS0, t.lighthouses))); const R = 13; x = Math.cos(a) * R - 1; z = Math.sin(a) * R; yaw = -(a + PI / 2) + PI; }
      else { const u = u01(tt, t.miss - 3, t.miss + 3); x = lerp(-22, -4, u); z = -8; yaw = 0; }   // r3 camera: passes left of the oak on "finally miss"
      const bonk = (tt > SB && tt < SB + 0.5 ? 0.15 * Math.sin((tt - SB) * 25) * Math.exp(-(tt - SB) * 6) : 0) + (tt > SAIL_BONK && tt < SAIL_BONK + 0.5 ? 0.15 * Math.sin((tt - SAIL_BONK) * 25) * Math.exp(-(tt - SAIL_BONK) * 6) : 0);
      place(sail, x, z, yaw, SU, { pitch: bonk });
      sailor.set({ scale: 0.65, x: -1.2, y: 0.48, z: 0.45, rotY: 0.6, t: tt, eyes: (tt > SB && tt < SB + 1) || (tt > SAIL_BONK && tt < SAIL_BONK + 1) ? 'wide' : blinkE(tt + 2), mouth: (tt > SB && tt < SB + 1) || (tt > SAIL_BONK && tt < SAIL_BONK + 1) ? 'scream' : tt > SAIL_MISS0 ? 'grin' : 'smile', armR: tt > t.thenC - 1 && tt < SAIL_BONK ? { x: -1.6, z: 0.3, el: 1.6 } : tt > FLIP - 0.5 && tt < t.end ? { x: -2.7, z: 0.5, el: 0.2 } : { x: -0.2, z: 0.15 }, look: tt > t.thenC - 1 && tt < SAIL_BONK ? [Math.sin(tt * 4), 0] : [0, 0] });
    }
    // cruise ship: far out (range, hull-down) … sneaks in from the dark left (clock), BONK, backs off; passes far at the end
    { let x, z, yaw = 0, jolt = 0;
      if (tt < t.oneC - 3) { x = -120; z = -60; }
      else if (tt < CBONK) { x = lerp(-60, -22.0, smooth(u01(tt, t.oneC - 3, CBONK))); z = -2.6; }
      else if (tt < t.allK) { x = -22.0 - 4 * smooth(u01(tt, CBONK + 0.3, CBONK + 2.5)); z = -2.6 - 3 * smooth(u01(tt, CBONK + 0.5, CBONK + 3)); jolt = Math.exp(-(tt - CBONK) * 2) * Math.sin((tt - CBONK) * 9); }
      else if (tt > t.andH - 1.5 && tt < t.end - 0.5) { x = lerp(46, -46, u01(tt, t.andH - 1.5, t.end - 0.5)); z = -15; yaw = PI; }   // the miss: past behind the rock
      else if (tt < t.end) { x = -140; z = -80; }
      else { x = lerp(30, -40, u01(tt, t.miss - 4.8, t.miss + 3.2)); z = -16; yaw = PI; }   // r3: sails past behind the rock on "the boats finally miss"
      place(cruise, x, z, yaw, SU, { pitch: tt > CBONK && tt < CBONK + 0.8 ? 0.03 * Math.sin((tt - CBONK) * 20) * Math.exp(-(tt - CBONK) * 4) : 0 });
      cruise.setPass(tt, jolt); cruise.winM.emissiveIntensity = S.M.win * 1.2;
    }
    // freighter (char): bigger than the cruise ship — in from the left, mistakes you for the light next door, BONK, backs off
    { let x, z = 3.4, yaw = 0, jolt = 0;
      if (tt < t.thenC - 2.5 || tt > t.storm + 2) { x = -160; z = 80; }
      else if (tt < SAIL_BONK) { const u = smooth(u01(tt, t.thenC - 2.5, SAIL_BONK)); x = lerp(-60, -25.4, u); z = lerp(14, 3.4, u); yaw = lerp(-0.3, 0, u); }
      else { x = -25.4 - 6 * smooth(u01(tt, SAIL_BONK + 0.3, SAIL_BONK + 4)); z = 3.4 + 3 * smooth(u01(tt, SAIL_BONK + 1, SAIL_BONK + 5)); jolt = tt < SAIL_BONK + 0.6 ? 0.04 * Math.sin((tt - SAIL_BONK) * 22) * Math.exp(-(tt - SAIL_BONK) * 5) : 0; }
      place(freighter, x, z, yaw, SU, { pitch: jolt }); { const brg = Math.atan2(-z, x); let fl = 0; for (const b of beamsAt(tt)) { const d = Math.atan2(Math.sin(b.yaw - brg), Math.cos(b.yaw - brg)); fl = Math.max(fl, b.on * Math.max(0, 1 - Math.abs(d) / 0.16)); } freighter.winM.emissiveIntensity = S.M.win * 1.1 + 5 * fl; }   // r4: the ship flashes as a beam sweeps over it
    }
    // barge: in from the right with the boulder on its hook (lens), THUD, bobs up, backs out
    { let x, yaw = PI, dy = 0;
      if (tt < BARGE0) x = 60; else if (tt < THUD) x = lerp(30, 11.6, smooth(u01(tt, BARGE0, THUD - 0.6))); else x = 11.6 + 20 * easeInQuad(u01(tt, t.fresnel2, t.fresnel2 + 3));
      if (tt > THUD) dy = 0.45 * Math.exp(-(tt - THUD) * 1.6) * Math.cos((tt - THUD) * 7);
      place(barge, x, 2.0, yaw, SU, { dy });
      const tipW = new THREE.Vector3(x - barge.tipX, barge.g.position.y + barge.tipY, 2.0);
      const load = tt < THUD ? K(tt, [[THUD - 0.5, tipW.y - 1.6], [THUD, RY + 1.1]]) : null;
      const hookY = load != null ? load + 1.1 : tipW.y - 1.2 - 0.4 * clamp(u01(tt, THUD, THUD + 0.5));
      barge.cable.position.set(barge.tipX, (barge.tipY + (hookY - barge.g.position.y)) / 2, 0); barge.cable.scale.y = Math.max(0.05, barge.g.position.y + barge.tipY - hookY);
      boulder.g.visible = tt > BARGE0 && tt < SPLIT; fdisc.g.visible = tt >= SPLIT && tt < ASM0 + 0.5;
      if (tt < THUD) boulder.g.position.set(tipW.x - 0.35, load, 2.0); else boulder.g.position.set(1.9, RY + 1.1 + (tt < THUD + 0.4 ? 0.08 * Math.abs(Math.sin((tt - THUD) * 16)) * Math.exp(-(tt - THUD) * 6) : 0), 2.0);
      if (fdisc.g.visible) { const k = 1 - smooth(u01(tt, ASM0, ASM0 + 0.5)); fdisc.g.scale.setScalar(Math.max(0.01, k)); fdisc.g.position.set(1.9, RY + 1.1, 2.0); }
    }
  }
  const HEARt = () => t.hear;

  function setAt(tt) {
    const SU = seaAt(tt); S.setSea(SU);
    const [ma, mb, mu] = moodAt(tt); S.setMood(ma, mb, mu, clamp(flashAt(tt)));
    // the tower: rises (range), leans (storm), Smeaton's skirt (rebuild), daymark paint, dirt
    tw.setGrow(tt < GROW1 ? growY(tt) : 1000); tw.top.visible = tt > TOPPOP - 0.05;
    tw.top.scale.setScalar(tt < TOPPOP + 0.4 ? Math.max(0.01, easeOutBack(u01(tt, TOPPOP - 0.05, TOPPOP + 0.35))) : 1);
    tw.top.position.set(0, (1 - tw.top.scale.y) * GY, 0);
    tw.setLean(leanAt(tt)); skirt.setSkirt(smooth(u01(tt, SK0, SK1 + 0.3)));
    tw.PU.uPaintY.value = tt < CHAIR0 + 0.3 ? -999 : paintY(tt); tw.PU.uDirt.value = tt > BRK && tt < SK1 ? 1 : 0;
    scaffold.visible = tt > GROW0 - 0.1 && tt < GROW1 + 0.1; scaffold.position.set(0, growY(tt) + 0.01, 0);
    brickPile.visible = tt > t.lights && tt < GROW1 + 0.3; brickPile.scale.setScalar(1 - 0.85 * u01(tt, GROW0, GROW1));
    // the light: Gary's lamp → the focal point; mirror; lens (assembled on the rock, carried, set); the beams; rays
    if (tt < t.lights) Lt.g.visible = false;
    else { Lt.g.visible = true; let L;
      if (tt < PICK) L = [0.75, RY + 0.3, -0.05];
      else if (tt < LAMPSET) { gary.hand(1).updateWorldMatrix(true, false); gary.hand(1).getWorldPosition(v3); L = [v3.x + 0.1, v3.y + 0.15, v3.z + 0.1]; }
      else L = D.focal;
      Lt.g.position.set(...L); }
    const lampOn = tt > LIGHT; Lt.lamp.visible = Lt.g.visible; Lt.flame.visible = lampOn; Lt.glow.visible = lampOn;
    const flick = 1 + 0.08 * Math.sin(tt * 23) * Math.sin(tt * 7.1);
    Lt.light.intensity = lampOn ? (tt < GROW0 ? 1.6 : tt < MIR ? 5 : tt < LIT ? 9 : 16) * flick * (S.M.beam > 0.5 ? 1 : 0.4) : 0;
    Lt.glow.scale.setScalar((tt < GROW0 ? 0.7 : tt < MIR ? 1.4 : 0.9) * flick); Lt.flame.scale.set(0.13 * flick, 0.26 * flick, 1);
    Lt.mirror.visible = tt > MIR; Lt.mirror.scale.setScalar(tt < MIR + 0.3 ? easeOutBack(u01(tt, MIR, MIR + 0.3)) : 1);
    { const u = smooth(u01(tt, CLIMB1 - 0.3, CLIMB1 + 0.1)); Lt.mirror.position.set(-1.0 * u, -0.72 * u, -0.78 * u); Lt.mirror.rotation.set(0, 0.9 * u, 0.25 * u); }   // parked against the back-left glass as the lens goes on
    const lp = lensPos(tt);
    if (lp) { Lt.setLens(tt < ASM1 ? u01(tt, ASM0, ASM1) : 1); Lt.lens.position.set(lp[0] - Lt.g.position.x, lp[1] - Lt.g.position.y + (tt > SET ? 0.16 * smooth(u01(tt, POUR0 + 0.4, POUR1)) : 0), lp[2] - Lt.g.position.z); Lt.lens.rotation.y = tt > SET ? lensAng(tt) : 0; } else Lt.setLens(0);
    Lt.glassM.emissiveIntensity = tt > LIT ? 0.35 + 0.25 * Math.exp(-(tt - LIT) * 2) : 0; Lt.panelM.emissiveIntensity = Lt.glassM.emissiveIntensity;
    rays.visible = tt > RAYS0 && tt < MIR + 0.1; rays.children.forEach((r, i) => { r.material.uniforms.uOpacity.value = 0.32 * smooth(u01(tt, RAYS0 + i * 0.03, RAYS0 + 0.3)) * (1 - smooth(u01(tt, MIR - 0.1, MIR + 0.1))); });
    // the weight + clockwork + mercury + the bullseyes
    tw.clock.visible = tt > t.falling - 0.4; tw.clock.scale.setScalar(tt < t.falling ? Math.max(0.01, easeOutBack(u01(tt, t.falling - 0.4, t.falling))) : 1);
    const wy = (() => { const top = TW - 0.9, bot = D.T.base + 0.6; if (tt < WT0) return top; if (tt < BOT) return lerp(top, bot, u01(tt, WT0, BOT)); if (tt < CR0) return bot; if (tt < CR1) return lerp(bot, top, smooth(u01(tt, CR0, CR1)));
      if (tt < NIGHT0) return top; if (tt < t.twoM) { const u = u01(tt, NIGHT0, t.twoM) * 2; const f = u % 1; return f < 0.7 ? lerp(top, bot, f / 0.7) : lerp(bot, top, (f - 0.7) / 0.3); } return lerp(top, top - 3, u01(tt, t.twoM, STORM)); })();
    tw.setWeight(wy); tw.weight.visible = tt > WT0 - 0.1;   // r2 logic: no weight in the shaft before "falling weights"
    const ga = lensAng(tt); tw.gears.forEach((gm, i) => (gm.rotation.z = ga * (i === 1 ? -2.6 : i === 2 ? 1.8 : 1) * 3)); tw.fan.rotation.y = ga * 30; tw.crank.rotation.z = tt > CR0 && tt < t.night + 0.6 ? tt * (tt < CR1 ? -16 : -5) : 0;
    tw.cDoor.rotation.y = tt > CUCKOO - 0.15 && tt < CUCKOO + 0.9 ? -1.4 * Math.sin(clamp(u01(tt, CUCKOO - 0.15, CUCKOO + 0.9)) * PI) : 0;
    tw.pedestal.visible = tt > SET - 0.2; tw.trough.visible = tt > POUR0 - 0.3; tw.setFill(smooth(u01(tt, POUR0 + 0.15, POUR1)));
    flask.rotation.z = tt > POUR0 && tt < POUR1 + 0.1 ? -2.1 * smooth(u01(tt, POUR0, POUR0 + 0.25)) : 0; stream.visible = tt > POUR0 + 0.1 && tt < POUR1; if (stream.visible) { flask.updateWorldMatrix(true, false); flask.localToWorld(v3.set(0, 0.13, 0)); const y0 = v3.y, y1 = GY + 0.26 + 0.17 * smooth(u01(tt, POUR0 + 0.15, POUR1)); stream.position.set(v3.x + 0.05, (y0 + y1) / 2, v3.z + 0.05); stream.scale.y = Math.max(0.05, y0 - y1); }
    Lt.bulls.forEach((b) => (b.visible = false));
    // wall clock (2.5 hours flick by; then all night)
    const hours = tt < TL0 ? 0 : tt < BOT ? 2.5 * u01(tt, TL0, BOT) : tt < NIGHT0 ? 2.5 : 2.5 + 6 * u01(tt, NIGHT0, t.twoM);
    hM.rotation.z = -hours * TAU; hH.rotation.z = -hours / 12 * TAU - 0.4;
    // the far coast drops with the sea's curve; moon arcs during "all night"
    S.coast.g.position.y = -curveAt(tt) * 600;
    // sticky gull dots on the daymark (on the +x/back side the camera orbits to)
    dots.forEach((d, i) => { const tk = DOT[i % 3] + Math.floor(i / 3) * 0.06; d.visible = tt > tk && tt < t.end - 0.3; if (!d.visible) return; const a = 0.35 + i * 0.12, y = 11.8 + (i % 4) * 0.45, r = tw.rAt(y) + 0.012; d.position.set(Math.cos(a) * r, y, -Math.sin(a) * r); d.lookAt(d.position.x * 2, y, d.position.z * 2); d.scale.setScalar(tt < tk + 0.12 ? easeOutBack(u01(tt, tk, tk + 0.12)) : 1); });
    // the oak, the horn, the chair, the finishing kit, the crown splash, lightning, sound rings
    oak.g.visible = tt > OAK; oak.g.scale.setScalar(tt < OAK + 0.4 ? Math.max(0.01, easeOutBack(u01(tt, OAK, OAK + 0.4))) : 1);
    horn.g.visible = tt > HORN; horn.g.scale.setScalar(tt < HORN + 0.3 ? Math.max(0.01, easeOutBack(u01(tt, HORN, HORN + 0.3))) : 1);
    horn.tank.scale.setScalar(1 + 0.12 * smooth(u01(tt, PUMP0, PUMP1)) * (1 - u01(tt, HB1, HB1 + 0.3))); horn.pump.position.y = 0.95 - (tt > PUMP0 && tt < PUMP1 ? 0.15 * Math.abs(Math.sin(tt * 18)) : 0);
    horn.bell.scale.set(1, 1 + ([HB1, HB2].some((h) => tt > h && tt < h + 0.5) ? 0.06 * Math.sin(tt * 60) : 0), 1);
    soundRings.forEach((r, i) => { const h = [HB1, HB1 + 0.2, HB2][i], a = tt - h; r.visible = a > 0 && a < 1.2; if (!r.visible) return; r.position.set(4.6 + a * 6, RY + 0.9, 1.25); r.scale.setScalar(0.6 + a * 3); r.material.opacity = 0.7 * (1 - a / 1.2); });
    chair.visible = tt > CHAIR0 && tt < t.bigW - 0.3; if (chair.visible) { const yC = paintY(tt), ang = 0.55, rr = tw.rAt(yC) + 0.55; chair.position.set(Math.cos(ang) * rr, yC - 0.45, -Math.sin(ang) * rr); chair.rotation.y = PI / 2 - ang; const L = GY - (yC - 0.45); ropes.forEach((r) => { r.scale.y = L; r.position.y = L / 2; }); }
    radio.g.visible = tt > t.radio; radio.g.scale.setScalar(tt < t.radio + 0.3 ? Math.max(0.01, easeOutBack(u01(tt, t.radio, t.radio + 0.3))) : 1);
    heli.g.visible = tt > t.helipad; heli.g.scale.setScalar(tt < t.helipad + 0.35 ? Math.max(0.01, easeOutBack(u01(tt, t.helipad, t.helipad + 0.35))) : 1);
    perch.g.visible = tt > t.perch; perch.g.scale.setScalar(tt < t.perch + 0.3 ? Math.max(0.01, easeOutBack(u01(tt, t.perch, t.perch + 0.3))) : 1);
    { const a = tt - IMPACT; S.crown.mesh.visible = a > 0 && a < 1.9; if (S.crown.mesh.visible) { const h = 25 * Math.sin(Math.min(1, a / 0.62) * PI / 2) * (a < 1.0 ? 1 : 1 - (a - 1.0) / 0.9); S.crown.mesh.position.set(0, RY - 0.15 + h / 2, -0.3); S.crown.mesh.scale.set(2.7 + a * 1.2, Math.max(0.1, h), 2.7 + a * 1.2); S.crown.m.opacity = a < 1.2 ? 1 : 1 - (a - 1.2) / 0.6; } }
    bolts.forEach((b, i) => { const tb = [STORM, LEAN1 + 0.05][i], a = tt - tb; b.visible = a > 0 && a < 0.28; if (!b.visible) return; const x0 = i ? 14 : -18, z0 = i ? -40 : -30; let x = x0, y = 60; b.children.forEach((seg, k) => { const nx = x + Math.sin(k * 7.1 + i * 3) * 4, ny = y - 7; const L = Math.hypot(nx - x, ny - y); seg.position.set((x + nx) / 2, (y + ny) / 2, z0); seg.scale.set(0.6, L, 0.6); seg.rotation.z = Math.atan2(nx - x, y - ny); x = nx; y = ny; }); });
    { const a2 = tt - IMPACT; foamTop.visible = a2 > 0.25 && a2 < 2.2; if (foamTop.visible) { foamTop.material.opacity = 0.9 * smooth(u01(a2, 0.25, 0.5)) * (1 - smooth(u01(a2, 1.2, 2.2))); foamTop.scale.setScalar(1 + 0.08 * a2); } }
    // r2: an 11 m breaker 32 m wide (the side lens sees its curl, not a 90 m slab); the crown = white water climbing the tower and swallowing it (La Jument 1989), then draining
    { const w = bigAt(tt), on = tt > WV0 && tt < IMPACT + 0.45 && w.bigZ < -9; bigWave.mesh.visible = on; if (on) { const hgt = 11 * smooth(u01(tt, WV0, WV0 + 0.9)) * (tt > IMPACT ? 1 - smooth(u01(tt, IMPACT, IMPACT + 0.45)) : 1); bigWave.mesh.rotation.y = PI / 2; bigWave.mesh.position.set(0, -1.2, w.bigZ - 6.4); bigWave.mesh.scale.set(0.6 + 0.25 * u01(tt, WV0, IMPACT), Math.max(0.05, hgt), 0.36); bigWave.m.opacity = 0.96 * (tt > IMPACT ? 1 - u01(tt, IMPACT, IMPACT + 0.45) : 1); } }
    // sign card: 0 → 1 (a ship missed) → 0 (the gull)
    if (tt < FLIP) S.sign.setCard(0, 0, 0); else if (tt < CARD0) S.sign.setCard(0, 1, u01(tt, FLIP, FLIP + 0.35)); else S.sign.setCard(1, 0, u01(tt, CARD0, CARD0 + 0.22));
    S.sign.g.rotation.x = tt > GBONK && tt < GBONK + 0.8 ? 0.12 * Math.sin((tt - GBONK) * 26) * Math.exp(-(tt - GBONK) * 5) : 0;
    S.shack.flag.rotation.y = 0.3 * Math.sin(tt * (stormAt(tt) > 0.3 ? 9 : 3));
    { const a = tt - t.rockS + 0.5, CH = [3.6, RY - 0.2, 4.3]; chunk.visible = true; if (a < 0) chunk.position.set(...CH); else { const q = hop(tt, t.rockS - 0.5, t.rockS + 0.15, CH, [4.4, -0.6, 7.0], 0.25); chunk.position.set(...q); chunk.rotation.set(a * 3, 0, -a * 4); } chunk.visible = a < 1.2; }
    // the fish that jumps through the downward ray
    { const a = tt - (t.fish - 0.35); fish.g.visible = a > 0 && a < 0.9; if (fish.g.visible) { const x = lerp(4.5, 6.5, a / 0.9), y = 3.6 * (a / 0.9) * (1 - a / 0.9) * 4 * 0.6; fish.g.position.set(x, y - 0.1, 9.4 + a * 0.4); fish.g.rotation.z = 1.0 - a * 2.2; fish.tail.rotation.y = Math.sin(tt * 30) * 0.5; } }
    // the rowboat at the rock, the buoy
    { const bx = 6.3, bz = 6.4, p = floatPose(bx, bz, 2.2, SU, 2.2, 1.0); S.rowboat.position.set(bx, p.y, bz); S.rowboat.rotation.set(p.roll, 2.2, p.pitch); }
    { const bx = 13, bz = 11, p = floatPose(bx, bz, 0, SU, 1.2, 1.2); S.coast.buoy.position.set(bx, p.y, bz); S.coast.buoy.rotation.set(p.roll * 1.5, 0, p.pitch * 1.5); }
    return SU;
  }

  function update(tt) {
    const SU = setAt(tt);
    garyAt(tt); gullAt(tt); boatsAt(tt, SU);
    const cam = rail.at(tt);
    { const cv = curveAt(tt); if (cv > 0) for (const v of [cam.pos, cam.look]) v[1] -= cv * Math.max(0, Math.hypot(v[0], v[2]) - 10) ** 2 / (2 * SEA_R); }   // the lens rides the curved sea like everything else
    const tugW = smooth(u01(tt, t.three - 0.35, t.three)) * (1 - smooth(u01(tt, t.four - 0.15, t.four + 0.15)));
    { const w = tugW; if (w > 0) { tug.body.updateWorldMatrix(true, false); const m = tugCam.getWorldPosition(new THREE.Vector3()); cam.pos = cam.pos.map((c, i) => lerp(c, m.getComponent(i), w)); cam.look[1] -= 14 * curveAt(tt) * w; cam.fov = lerp(cam.fov, 54, w * smooth(u01(tt, t.hides, t.four - 0.2))); } }   // r3: a slow push while the tower rises   // on the tug's deck: carried by the tug (bob + pitch)
    studio.setCamera(cam.pos, cam.look, cam.fov * (1 - pushAt(tt)), tt, 0);
    kickR.apply(studio.camera, tt, lerp(Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]), 5, tugW));   // on the deck the lookout is 1.3 m away: shake for that, not for the 55 m to the rock
    S.update(tt, studio.camera, { beams: beamsAt(tt) });
    studio.fill.intensity = 0.5 + 2.6 * S.M.win; studio.fill.distance = 9;   // night / storm / fog: a warmer, stronger fill on faces (Gary went black against the lit lens)
    S.aimSun(cam.look[0], Math.max(0, cam.look[1]), cam.look[2], Math.max(10, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.7));
    fx.update(tt, studio.camera);
  }

  // QC (`node tools/render.mjs 039-flashlight-lighthouse --qc`): faces (Gary, the gull) under the caption/callouts
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, head, up] of [['Gary', gary.head, 0], ['Gary\'s hat', gary.head, 0.3], ['the gull', gull.head, 0]]) {
        if (who === 'the gull' && !gull.root.visible) continue;
        head.updateWorldMatrix(true, false); head.getWorldPosition(v); v.y += up; v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`counts: framings ${Fr.length}, kicks ${KM2.length} (${KM2.filter((k) => k[1] >= 0.8).length} full-strength), fx bursts ${FXN.burst} + streams ${FXN.stream} (${FILL.length} fill), callouts ${story.callouts.length}`);
    out.push('holds ≥ 0.9 s (pushed in): ' + HOLDS.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}`).join(', '));
    out.push('kicks dropped inside a TERM: ' + (KM_TERM.join('; ') || 'none'));
    out.push('events: ' + JSON.stringify({ fx: FXN.times.map((x) => +x.toFixed(2)), kicks: KM2.map((k) => +k[0].toFixed(2)), frames: Fr.map((f) => +f.t.toFixed(2)) }));
    const CS = []; for (let tt = 0; tt < END; tt += 0.1) { const c = rail.at(tt), m = moodAt(tt); CS.push([+tt.toFixed(1), ...c.pos.map((x) => +x.toFixed(2)), ...c.look.map((x) => +x.toFixed(2)), +c.fov.toFixed(1), m[2] < 0.5 ? m[0] : m[1]]); }
    out.push('cams: ' + JSON.stringify(CS));   // camera samples for the scene-change count (tools: pos, look, fov, mood every 0.1 s)
    update(0); return out;
  };
  window.EDSTUDIO_COUNTS = { framings: Fr.length, kicks: KM2.length };
  update(0);
  return { update };
}
