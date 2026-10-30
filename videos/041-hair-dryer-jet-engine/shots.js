// 041 — "How a Hair Dryer Becomes a Jet Engine" (build genre, TURBO pace like 039: docs/BUILD.md → "039 is the reference cut").
// ONE continuous camera take along +x (engine/build/jet.js): Gary's bathroom → hallway → garage → driveway → across the street,
// through the airfield fence → the test stand → onto GARY AIR's wing → takeoff → up through the clouds → above them at sunset →
// down onto the runway → GARY INTERNATIONAL. The ENGINE is a half-section cut at its axis (z = D.eZ), so we watch it COME
// TOGETHER (user, on 039: "build progression a tiny bit slower so we can see it come together"): duct rings slide on one at a
// time, six compressor stages slot onto the shaft, the coil slides back and becomes the flame, the shaft runs back to the turbine
// and its blades go in one by one, nozzle petals close, holes are drilled blade by blade, the nacelle rings + 16 fan blades go
// in one at a time. The hair dryer stays inside it the whole way (its handle pokes out of the duct). Gary builds every step and
// takes every failure (mummified by toilet paper → spun free → singed → bonked by the plug → dripped on → his fillings rattle
// out → jellied → squished); the DUCK from his bathtub gets a blowout, walks faster than the plane, rides the nose, is sucked
// through the bypass, and at the end could fly the whole time.
//
// Facts (web-searched Oct 28 2026; full list in caption.md's comment):
//   Hair dryer thrust ≈ an egg: thrust = mass flow × exit speed; Dyson Supersonic primary airflow 13 L/s (Dyson tech spec), a
//     1.8 kW dryer ~0.03 kg/s at ~15–20 m/s → ≈ 0.3–0.7 N ≈ 30–70 g (our estimate; no published measurement exists).
//   GE9X (GE Aerospace): Guinness record 134,300 lbf (Peebles OH, 10 Nov 2017) ≈ 60.9 t ≈ 1,000,000 eggs; fan 134 in (≈ 11 ft),
//     16 composite fan blades, ~10:1 bypass ratio, 60:1 overall pressure ratio; certified ~105,000 lbf ("a hundred thousand
//     pounds"). Price: GE's Qatar order (Jun 2015) — 20 GE9X + 8 GE90-115B for > $1.1 B list ≈ $39 M each → "forty million".
//   Hot section: gas ≈ 1,600 °C, nickel blade alloy melts ≈ 1,200–1,400 °C; compressor air through tiny holes forms a protective
//     film (Rolls-Royce's Neil D'Souza, The Naked Scientists). Lava ≈ 1,160 °C (USGS, Kīlauea) → "hotter than lava".
//   Whittle: patent GB 347,206 filed 16 Jan 1930, lapsed 1935 over the £5 renewal fee (Grace's Guide; National Academies).
//   Bird strike: 14 CFR §33.76 — one large bird up to 3.65 kg (8 lb) fired at 200 knots at the fan; the fan slings debris out
//     through the bypass, away from the core (fan-case patents). Development tests use gelatin bird substitutes (ours: jelly).
//   Thrust reverser: translating sleeves expose cascades; blocker doors turn the fan air forward (planefyi; patents).
//   Spinner swirl: shows ground crews the engine is turning (KLM via Jalopnik/SlashGear). Starter: a gas turbine must be spun up
//     before light-off (planefyi) — Gary hand-spins it until "Add a starter".
import * as THREE from 'three';
import { clamp, lerp, smooth, mk, mat, canvasTex } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad } from '@engine/build/anim.js';
import { makeFX, makeDizzy, makeArrows } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildJet, makeEngine, makeDuck, makeCardboardPlane, makeAirliner, makeJellyBird, makeBirdCannon, makeJerryCan, makeScissors, makeTank, makeRibbon, makeCord, makeForklift, makeEgg, D, P, E } from '@engine/build/jet.js';

const PI = Math.PI, TAU = PI * 2, EZ = D.eZ;

export async function build(studio, story) {
  const S = await buildJet(studio), scene = S.root, B = beatClock(story);
  const W = (b, w, n) => B.W(b, w, n), END = story.duration;
  const fx = makeFX(scene, { max: { crumb: 700, drops: 1200, dust: 420, spark: 700, confetti: 900, smoke: 360, glow: 140, mist: 500, rock: 300, bill: 300 }, nearFade: [1.2, 3.2], unlit: ['drops'] });
  const FXN = { burst: 0, stream: 0, times: [] }; { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx); fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); return b0(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); return s0(k, t0, t1, o); }; }

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    want: W('hook', 'want'), garyH: W('hook', 'gary'), tapes: W('hook', 'tapes'), cardboard: W('hook', 'cardboard'), gives: W('hook', 'gives'), duckH: W('hook', 'duck'), blowout: W('hook', 'blowout'),
    congrats: W('congrats', 'congratulations'), youve: W('congrats', 'youve'), worst: W('congrats', 'worst'), thrustC: W('congrats', 'thrust'), egg: W('congrats', 'egg'), weighs: W('congrats', 'weighs'), thousand: W('congrats', 'thousand'),
    swap: W('duct', 'swap'), bigger: W('duct', 'bigger'), fanD: W('duct', 'fan'), air: W('duct', 'air'), everywhere: W('duct', 'everywhere'), toilet: W('duct', 'toilet'), mummifies: W('duct', 'mummifies'),
    soWrap: W('duct', 'so', 2), wrap: W('duct', 'wrap'), tube: W('duct', 'tube'), ducted: W('duct', 'ducted'), all: W('duct', 'all'), oneway: W('duct', 'way'), creeps: W('duct', 'creeps'), duckD: W('duct', 'duck'), faster: W('duct', 'faster'),
    squeezed: W('squeeze', 'squeezed'), stack: W('squeeze', 'stack'), row: W('squeeze', 'row'), tighter: W('squeeze', 'tighter'), axial: W('squeeze', 'axial'), compressor: W('squeeze', 'compressor'),
    sucks: W('squeeze', 'sucks'), garyS: W('squeeze', 'gary'),
    burns: W('burn', 'burns'), soB: W('burn', 'so'), heater: W('burn', 'heater'), coil: W('burn', 'coil'), fuel: W('burn', 'fuel'), flame: W('burn', 'flame'), combustion: W('burn', 'combustion'), squeezedB: W('burn', 'squeezed'), garyB: W('burn', 'gary'), behindB: W('burn', 'behind'),
    but: W('cord', 'but'), cord: W('cord', 'cord'), rolls: W('cord', 'rolls'), driveway: W('cord', 'driveway'), plug: W('cord', 'plug'), out: W('cord', 'out'),
    soT: W('turbine', 'so'), windmill: W('turbine', 'windmill'), exhaustT: W('turbine', 'exhaust'), shaft: W('turbine', 'shaft'), fire: W('turbine', 'fire'), spins: W('turbine', 'spins'), turbineW: W('turbine', 'turbine'),
    fansT: W('turbine', 'fans'), whittle: W('turbine', 'whittle'), afford: W('turbine', 'afford'), five: W('turbine', 'five'), renewal: W('turbine', 'renewal'), cuts: W('turbine', 'more'),
    exhaustN: W('nozzle', 'exhaust'), blobs: W('nozzle', 'blobs'), soN: W('nozzle', 'so'), pinch: W('nozzle', 'pinch'), thumb: W('nozzle', 'thumb'), hose: W('nozzle', 'hose'), nozzleW: W('nozzle', 'nozzle'), youveE: W('end', 'youve'), slowly: W('nozzle', 'slowly'), oneN: W('nozzle', 'one'), goesD: W('duck', 'goes'), came: W('nozzle', 'came'), now: W('nozzle', 'now'), goes: W('nozzle', 'goes'),
    melts: W('cool', 'melts'), gas: W('cool', 'gas'), sixteen: W('cool', 'sixteen'), thirteen: W('cool', 'thirteen'), make: W('cool', 'so'), hollow: W('cool', 'hollow'), drill: W('cool', 'drill'), holes: W('cool', 'holes'), blanket: W('cool', 'blankets'), film: W('cool', 'film'), drips: W('cool', 'dripped'),
    works: W('fan', 'works'), screams: W('fan', 'screams'), fillings: W('fan', 'fillings'), rattle: W('fan', 'rattle'), add: W('fan', 'add'), giant: W('fan', 'giant'), around: W('fan', 'around'), core: W('fan', 'core'), turbofan: W('fan', 'turbofan'), quieter: W('fan', 'quieter'),
    waddles: W('duck', 'waddles'), inD: W('duck', 'in', 2),
    flings: W('duck2', 'flings'), back: W('duck2', 'back'), fluffed: W('duck2', 'fluffed'), fine: W('duck2', 'fine'), engines: W('duck2', 'engines'), birds: W('duck2', 'birds'), strike: W('duck2', 'strike'), jelly: W('duck2', 'jelly'), testB: W('duck2', 'test', 2), bird: W('duck2', 'bird'), patented: W('turbine', 'patented'), eggsE: W('end', 'eggs'), behindJ: W('duck2', 'behind'), again: W('duck2', 'again'),
    starter: W('finish', 'starter'), bottles: W('finish', 'bottles'), swirl: W('finish', 'swirl'),
    nowF: W('fly', 'now'), hang: W('fly', 'hang'), planeF: W('fly', 'plane'), takeoff: W('fly', 'takeoff'), hundred: W('fly', 'hundred'), thrustF: W('fly', 'thrust'), garyF: W('fly', 'gary'), flies: W('fly', 'flies'),
    landing: W('land', 'landing'), stop: W('land', 'stop'), doors: W('land', 'doors'), flip: W('land', 'flip'), forward: W('land', 'forward'), reverser: W('land', 'reverser'), stops: W('land', 'stops'), doesnt: W('land', 'doesnt'),
    end: W('end', 'congratulations'), engineE: W('end', 'engine'), wanted: W('end', 'wanted'), flyE: W('end', 'fly'), forty: W('end', 'forty'), dollars: W('end', 'dollars'), millionE: W('end', 'million', 2), eggs: W('end', 'eggs'),
    garyE: W('end', 'gary'), singed: W('end', 'singed'), jellied: W('end', 'jellied'), squished: W('end', 'squished'), duckE: W('end', 'duck'), whole: W('end', 'whole'), timeE: W('end', 'time'),
    came2: W('end2', 'came'), blowout2: W('end2', 'blowout'),
  };
  const mono = (keys) => { for (let i = 1; i < keys.length; i++) t[keys[i]] = Math.max(t[keys[i]], t[keys[i - 1]] + 0.12); };   // scratch word times can come out of order
  mono(['thrustC', 'egg', 'weighs', 'thousand']); mono(['ducted', 'all', 'oneway', 'creeps', 'duckD', 'faster']); mono(['axial', 'compressor', 'sucks', 'garyS']); mono(['stop', 'doors', 'flip', 'forward', 'reverser', 'stops', 'doesnt']);
  // ---- derived event times (mirrored in make_cues.py — keep in sync). r2: every big build runs ≥ ~3 s, starting on its problem
  // line and carrying on under the next one (user: "build progression a tiny bit slower so we can see it come together")
  const TEND = (txt) => (story.callouts.find((c) => c.text === txt) || { t1: 0 }).t1;   // a TERM line's end: impacts that finish a build land after it (no kick inside a TERM)
  const ON = t.gives - 0.08, BLOW = t.blowout, EGG1 = t.egg, EGGS = t.thousand;
  const YANK = t.swap, FANON = Math.max(t.fanD, YANK + 0.5), SPRAY = t.air, TP0 = t.toilet - 0.3, TP1 = t.mummifies + 0.45;
  const RING0 = t.soWrap - 0.05, RING1 = Math.max(RING0 + 3.2, t.creeps - 0.35), ONEWAY = t.all, CREEP = t.creeps - 0.1, DHOP = t.creeps - 0.55, SLEEK = t.stack - 0.75;
  const SQK = t.squeezed, STG0 = t.stack - 0.05, STG1 = Math.max(STG0 + 3.0, t.compressor + 0.3), SUCK0 = t.sucks - 0.25, SUCK1 = t.garyS + 0.45;
  const COMB0 = SUCK1 - 0.3, COMB1 = t.flame - 0.1, COIL0 = t.heater - 0.1, COIL1 = t.coil + 0.45, POUR0 = t.fuel - 0.55, POUR1 = t.fuel + 0.25, IGN = t.flame + 0.05, LAVA = IGN + 0.55;
  const BEH0 = t.garyB - 0.75, BLAST = t.behindB - 0.05;
  const DOOR0 = t.but - 0.2, DOOR1 = DOOR0 + 0.9, HOP0 = t.but, HOP1 = t.but + 0.75, ROLL0 = t.rolls - 0.35, ROLL1 = t.plug, PLUG = t.out + 0.04;
  const TC0 = t.soT + 0.3, TC1 = TC0 + 0.5, TD0 = TC1, TD1 = TD0 + 0.3, TB0 = TD1, TB1 = Math.max(TB0 + 2.0, t.fansT - 0.35), SH0 = t.shaft - 0.5, SH1 = t.shaft + 0.1;
  const HAND0 = TB1 - 0.05, IGN2 = Math.max(HAND0 + 0.45, t.fansT), SNIP = t.cuts + 0.15;
  const BLOB = t.blobs - 0.15, PET0 = t.soN - 0.05, PET1 = Math.max(PET0 + 3.2, t.nozzleW + 0.5), TINY = t.came - 0.35, SEAT = t.now - 0.55, GO = t.goes - 0.05;
  const FENCE = GO + 0.42, SHRED = GO + 0.52, CATCH = GO + 1.2, GLAND = CATCH + 0.1, DLAND = CATCH + 0.25;
  const MELT0 = Math.max(t.melts + 0.05, CATCH + 0.15), DRILL0 = t.make, DRILL1 = Math.max(DRILL0 + 2.6, t.film - 0.3), FILM0 = t.blanket - 0.1, LAD0 = t.make - 0.6, STILL0 = MELT0 + 1.4, STILL1 = FILM0 + 1.0;
  const BOOTH0 = t.works + 0.05, RUN = t.works, RATTLE = t.rattle - 0.1, OUT0 = t.add - 0.45, HUB0 = t.add - 0.1, HUB1 = HUB0 + 0.45, BLD0 = HUB1, BLD1 = Math.max(BLD0 + 2.4, t.turbofan - 0.1), COWL0 = HUB0 + 0.2, NAC0 = BLD0 + 0.4, NAC1 = Math.max(NAC0 + 2.4, t.turbofan + 0.4, TEND('TURBOFAN') + 0.02), QUIET = t.quieter - 0.15;
  const DW0 = t.waddles - 0.7, SUCKD = t.inD - 0.2, THRU1 = t.back, DOUT = THRU1 + 0.45, RUN0 = t.flings - 0.1, RUN1 = t.back - 0.15;
  const CAN0 = t.engines, CAN1 = t.birds, HOPJ = t.bird - 0.35, FIRE = t.testB - 0.05, JIN = FIRE + 0.4, JOUT = JIN + 0.55, SPLAT = Math.max(JOUT + 0.2, t.behindJ + 0.02);   // r3: fired on Gary's 'test', slow enough to follow
  const STARTER = t.starter, BOTTLES = t.bottles, SWIRL = t.swirl;
  const FORK0 = t.nowF - 0.5, LIFT0 = t.nowF, DRIVE0 = LIFT0 + 0.3, DRIVE1 = Math.max(DRIVE0 + 0.85, t.planeF), BOLT = DRIVE1, WING0 = BOLT - 0.15, WING1 = BOLT + 0.35;
  const TAXI0 = W('finish', 'starter') - 0.6, TAXI1 = t.nowF - 0.2;   // r5: GARY AIR taxis in behind the bird test (not parked behind the stand all along)
  const TO = Math.max(t.takeoff - 0.05, WING1 + 0.02), LIFTOFF = TO + 0.55, CLOUD_IN = LIFTOFF + 0.45, ABOVE = CLOUD_IN + 0.25, DIVE = t.landing + 0.15, TELE = DIVE + 0.2, TOUCH = Math.max(TELE + 0.8, t.stop + 0.05);   // r3: the runway rushes up for ≥ 0.8 s
  const FLIP = t.flip - 0.05, STOP = Math.max(t.stops, TEND('THRUST REVERSER') + 0.04), GFLY0 = t.doesnt - 0.08, GSPLAT = GFLY0 + 0.45;
  const MONEY = t.forty, EGGBLOW = t.millionE + 0.1, DFLY0 = t.duckE - 0.3, DLAND2 = t.blowout2 - 0.1, POOF = t.blowout2;

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const pilot = makeToon({ shirt: 0xf4f4f4, pants: 0x1b2a44, hair: 0x2a2a2a, hairStyle: 'side', hat: 'cap', hatColor: 0x1b2a44, mustache: 0x2a2a2a });
  const duck = makeDuck(); scene.add(duck.root);
  const eng = makeEngine(); scene.add(eng.g);
  const cp = await makeCardboardPlane(); scene.add(cp.g); cp.mount.position.set(-1.75, 0.63, 0);
  const air = await makeAirliner(); scene.add(air.g); air.seat.add(pilot.root);
  const tank = makeTank(); cp.body.add(tank.g); tank.g.position.set(0.3, 0.52, 0.72); tank.g.scale.setScalar(0.65);
  const can = makeJerryCan(); scene.add(can.g);
  const scissors = makeScissors(); gary.hand(1).add(scissors.g); scissors.g.position.set(0, -0.1, 0.08); scissors.g.rotation.x = 1.2;
  const cannon = makeBirdCannon(); scene.add(cannon.g);
  const jelly = makeJellyBird(); scene.add(jelly.g); jelly.g.scale.setScalar(1.5);   // r3: readable in the wide
  const fork = makeForklift(); scene.add(fork.g);
  const cradle = mk(new THREE.BoxGeometry(1.65, 1.25, 0.8), mat(0xf2b21e, 0.5), fork.car, 0.93, 0.7, 0); cradle.castShadow = true;   // r4: the engine visibly rides on it
  const tpStrip = makeRibbon(140), tpWrap = makeRibbon(220); scene.add(tpStrip.m, tpWrap.m);
  const cord = makeCord(0xff7a1a, 0.024); cord.plug.scale.setScalar(3); cord.plug.children[0].material = mat(0xf4f4f4, 0.5); scene.add(cord.m, cord.plug);
  const rubber = mk(new THREE.SphereGeometry(0.07, 14, 10), mat(0xffd23f, 0.4), gary.hand(1), 0, -0.1, 0.1); mk(new THREE.SphereGeometry(0.045, 12, 8), mat(0xffd23f, 0.4), rubber, 0, 0.07, 0.03); mk(new THREE.ConeGeometry(0.02, 0.05, 8), mat(0xff8a2a, 0.5), rubber, 0, 0.065, 0.08).rotation.x = PI / 2;
  const fanBlade = new THREE.Group(); gary.hand(1).add(fanBlade); fanBlade.position.set(0, -0.12, 0.12); for (let i = 0; i < 5; i++) { const p = new THREE.Group(); fanBlade.add(p); p.rotation.z = (i / 5) * TAU; mk(new THREE.BoxGeometry(0.06, 0.28, 0.01), mat(0x58a8e8, 0.4), p, 0, 0.17, 0); }
  const mallet = new THREE.Group(); mk(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), mat(0x8a6a44, 0.7), mallet, 0, 0.12, 0); mk(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12), mat(0x7a5232, 0.8), mallet, 0, 0.35, 0).rotation.z = PI / 2; gary.hand(1).add(mallet); mallet.position.set(0, -0.08, 0.05); mallet.rotation.x = 1.3;
  const drill = new THREE.Group(); mk(new THREE.BoxGeometry(0.08, 0.2, 0.08), mat(0x2f6fd6, 0.45), drill, 0, 0, 0); mk(new THREE.BoxGeometry(0.08, 0.08, 0.22), mat(0x2f6fd6, 0.45), drill, 0, 0.1, 0.1); mk(new THREE.CylinderGeometry(0.03, 0.025, 0.06, 10), mat(0x222222, 0.4), drill, 0, 0.1, 0.24).rotation.x = PI / 2; mk(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), mat(0xdddddd, 0.25), drill, 0, 0.1, 0.34).rotation.x = PI / 2; gary.hand(1).add(drill); drill.position.set(0, -0.05, 0.06);
  const remote = mk(new THREE.BoxGeometry(0.06, 0.12, 0.03), mat(0x222222, 0.5), gary.hand(1), 0, -0.08, 0.06); mk(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), mat(0xd62f2f, 0.4), remote, 0, 0.03, 0.02).rotation.x = PI / 2;
  const goggles = new THREE.Group(); gary.head.add(goggles); goggles.position.set(0, 0.2, 0.18); goggles.rotation.x = -0.5; for (const x of [-0.08, 0.08]) { mk(new THREE.TorusGeometry(0.055, 0.018, 8, 16), mat(0x5a3a22, 0.5), goggles, x, 0, 0); mk(new THREE.CircleGeometry(0.05, 16), new THREE.MeshStandardMaterial({ color: 0x6fb6d8, roughness: 0.1, metalness: 0.3 }), goggles, x, 0, 0.005); }
  const ladder = new THREE.Group(); scene.add(ladder); { const lm = mat(0xd6dade, 0.4); for (const x of [-0.22, 0.22]) mk(new THREE.BoxGeometry(0.05, 1.7, 0.05), lm, ladder, x, 0.85, 0); for (let i = 0; i < 5; i++) mk(new THREE.BoxGeometry(0.44, 0.04, 0.06), lm, ladder, 0, 0.3 + i * 0.32, 0); }
  // r5: "a million eggs" = an avalanche onto flat Gary (the egg unit's payoff); "blobs out slowly" = ONE fat exhaust blob
  const AVAL = 120, aval = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, emissive: 0x3a3a3a }), AVAL); aval.frustumCulled = false; aval.castShadow = true; aval.visible = false; scene.add(aval);
  const AV = Array.from({ length: AVAL }, (_, i) => { const a = (i * 2.399) % TAU, r = Math.sqrt(((i % 70) + 0.5) / 70), lay = Math.floor(i / 45); return { x: 0.35 + Math.cos(a) * r * 0.8, z: Math.sin(a) * r * 0.55, y: 0.11 + 0.2 * lay + 0.1 * (1 - r), d: ((i * 13) % 37) / 37 * 0.35 + lay * 0.08, h: 0.9 + ((i * 7) % 13) / 13 * 0.9, s: i * 1.7 }; });
  const _am = new THREE.Matrix4(), _aq = new THREE.Quaternion(), _ae = new THREE.Euler(), _ap = new THREE.Vector3(), _as = new THREE.Vector3(1, 1.3, 1);
  const blob = mk(new THREE.SphereGeometry(0.3, 18, 12), new THREE.MeshStandardMaterial({ color: 0x9ab0c8, roughness: 0.25, transparent: true, opacity: 0.85 }), scene); blob.visible = false;
  const flame = new THREE.Group(); scene.add(flame); { const fo = new THREE.ConeGeometry(0.28, 1.6, 18, 1, true); fo.rotateZ(PI / 2); fo.translate(-0.8, 0, 0); mk(fo, new THREE.MeshBasicMaterial({ color: 0xff6a1a, side: THREE.DoubleSide }), flame); const fi = new THREE.ConeGeometry(0.15, 1.1, 14, 1, true); fi.rotateZ(PI / 2); fi.translate(-0.55, 0, 0); mk(fi, new THREE.MeshBasicMaterial({ color: 0xffe14a, side: THREE.DoubleSide }), flame); } flame.visible = false;   // r5b: the singe has a visible cause
  const eggs = Array.from({ length: 34 }, (_, i) => { const e = makeEgg(); scene.add(e); return e; });
  const eggOne = makeEgg(); scene.add(eggOne);
  const eggCart = new THREE.Group(); scene.add(eggCart); mk(new THREE.BoxGeometry(1.6, 0.12, 1.0), mat(0x3a7ad6, 0.5), eggCart, 0, 0.45, 0); for (const [x, z] of [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]]) mk(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), mat(0x1b1b1d), eggCart, x, 0.12, z).rotation.x = PI / 2;
  const EGGPILE = []; { let k = 0; for (let lay = 0; lay < 3; lay++) for (let i = 0; i < 4 - lay; i++) for (let j = 0; j < 3 - lay; j++) if (k < 20) { EGGPILE.push([-0.45 + (i + lay * 0.5) * 0.3, 0.6 + lay * 0.16, -0.3 + (j + lay * 0.5) * 0.3]); k++; } }
  const fiver = mk(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshStandardMaterial({ map: canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f3ead2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2f7a5a'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#1f4a38'; c.font = 'bold 70px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£5', w / 2, h / 2 + 4); }), side: THREE.DoubleSide, roughness: 0.7 }), scene);   // r3: Whittle's renewal fee, slurped by the intake
  const fillings = Array.from({ length: 4 }, () => mk(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffc23a, roughness: 0.25, metalness: 0.8, emissive: 0x6a4a00, emissiveIntensity: 0.4 }), scene));
  const hatDrips = Array.from({ length: 5 }, (_, i) => mk(new THREE.SphereGeometry(0.035 + i * 0.006, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc9ced3, metalness: 0.9, roughness: 0.25 }), gary.hat ?? gary.head, (i - 2) * 0.08, 0.33 - Math.abs(i - 2) * 0.03, 0.03 * i - 0.03));
  const jellyM = new THREE.MeshPhysicalMaterial({ color: 0xff6a3a, roughness: 0.12, transparent: true, opacity: 0.85, depthWrite: true, clearcoat: 1, emissive: 0x5a1a08, emissiveIntensity: 0.3 });
  const jellyGoo = mk(new THREE.SphereGeometry(0.33, 20, 14, 0, TAU, 0, PI * 0.62), jellyM, gary.head, 0, 0.05, 0); const jellyChest = mk(new THREE.SphereGeometry(0.24, 16, 12), jellyM, gary.root, 0, 0.82, 0.06); jellyChest.scale.set(1.2, 1.1, 0.9);
  const dizzy = makeDizzy(scene);
  const bypassArrows = makeArrows(eng.g, [[3.6, 1.15, -0.08], [2.4, 1.2, -0.08], [1.0, 1.25, -0.08], [0.0, 1.25, -0.08], [-1.0, 1.2, -0.08]], { color: 0x9fe8ff, count: 12, size: 0.28, speed: 3.2 });
  const coreArrows = makeArrows(eng.g, [[2.6, 0.3, -0.08], [1.8, 0.28, -0.08], [0.6, 0.24, -0.08], [-0.3, 0.24, -0.08], [-1.6, 0.18, -0.08]], { color: 0xffd23f, count: 7, size: 0.16, speed: 2.4 });
  const ductArrows = makeArrows(eng.g, [[2.6, 0.22, -0.08], [1.9, 0.22, -0.08], [1.2, 0.22, -0.08], [0.2, 0.22, -0.08], [-0.9, 0.2, -0.08]], { color: 0x9fe8ff, count: 6, size: 0.17, speed: 2.0 });
  const revArrows = makeArrows(eng.g, [[0.8, 1.6, -0.1], [0.9, 2.3, -0.1], [1.9, 2.9, -0.1], [3.2, 3.1, -0.1]], { color: 0x9fe8ff, count: 8, size: 0.55, speed: 3.0 }), revArrows2 = makeArrows(eng.g, [[0.8, -1.6, -0.1], [0.9, -2.3, -0.1], [1.9, -2.9, -0.1], [3.2, -3.1, -0.1]], { color: 0x9fe8ff, count: 8, size: 0.55, speed: 3.0 });

  // ---------------------------------------------------------------- paths (stateless functions of t)
  const K = (tt, keys) => { if (tt <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (tt <= b) { const u = smooth((tt - a) / (b - a)); return Array.isArray(va) ? va.map((v, k) => lerp(v, vb[k], u)) : lerp(va, vb, u); } } return keys[keys.length - 1][1]; };
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const blinkE = (tt, open = 'open') => ((tt * 0.73) % 3.1 < 0.11 ? 'closed' : open);
  // the cardboard plane's x: bathroom → creeps → rolls through the hallway into the garage → down the driveway
  const CPX = [[0, 1.9], [CREEP, 1.9], [t.squeezed, 2.35], [t.burns, 10.3], [ROLL0, 11.0], [ROLL1, 19.4]];   // r3: the combustor in the garage, not the hallway
  const cpX = (tt) => { if (tt < GO) { let x = 1.9; for (let i = 0; i < CPX.length - 1; i++) { const [a, va] = CPX[i], [b, vb] = CPX[i + 1]; if (tt >= a && tt <= b) x = lerp(va, vb, i === 3 ? smooth(u01(tt, a, b)) : i === 2 ? u01(tt, a, b) : smooth(u01(tt, a, b))); else if (tt > b) x = vb; } return x; } return 19.4; };
  const axisY = (tt) => lerp(0.85, 1.15, smooth(u01(tt, FANON - 0.45, FANON)));
  // GO: the plane rockets across the street, through the fence; the cardboard shreds; the engine arcs into the stand's hanger
  const goPath = (tt) => { const u = u01(tt, GO, CATCH), e = easeInQuad(u) * 0.35 + smooth(u) * 0.65; return [lerp(19.4 - 1.75, D.stand.x, e), lerp(1.15, D.stand.y, e) + 4 * 2.2 * e * (1 - e), EZ]; };
  // the airliner: parked → forklift time → takeoff roll → climb → above the clouds → (inside a cloud: jump to the approach) → touchdown → rollout + reversers → stop
  const PARK = D.plane;
  function planePose(tt) {
    if (tt < TO) return { x: PARK[0] + (tt < TAXI1 ? 70 * (1 - u01(tt, TAXI0, TAXI1)) ** 2 : 0), y: 0, z: PARK[2], pitch: 0, gear: 1 };
    if (tt < LIFTOFF) { const u = tt - TO, a = 2 * 140 / (LIFTOFF - TO) ** 2; return { x: PARK[0] + 0.5 * a * u * u, y: 0, z: PARK[2], pitch: 0.06 * smooth(u01(tt, LIFTOFF - 0.35, LIFTOFF)), gear: 1 }; }
    const vx = 2 * 140 / (LIFTOFF - TO);   // speed at liftoff
    if (tt < TELE) { const u = tt - LIFTOFF, y = Math.min(118, 210 * easeInQuad(Math.min(1, u / 1.0)) + Math.max(0, u - 1) * 30); return { x: PARK[0] + 140 + vx * u, y, z: PARK[2], pitch: 0.28 * smooth(u01(tt, LIFTOFF, LIFTOFF + 0.3)) * (1 - smooth(u01(tt, ABOVE, ABOVE + 0.4))) - 0.22 * smooth(u01(tt, DIVE, TELE)), gear: 1 - smooth(u01(tt, LIFTOFF + 0.1, LIFTOFF + 0.5)) }; }
    const xT = D.terminal - 170;   // touchdown x; the rollout ends by the terminal
    if (tt < TOUCH) { const u = u01(tt, TELE, TOUCH); return { x: lerp(xT - 260, xT, u), y: lerp(72, 0, smooth(u) * 0.3 + u * 0.7), z: PARK[2], pitch: -0.1 * (1 - u) + 0.07 * smooth(u01(u, 0.7, 1)), gear: smooth(u01(u, 0.2, 0.6)) }; }
    const T2 = STOP - TOUCH, v0 = 2 * 165 / T2, u = clamp(tt - TOUCH, 0, T2); return { x: xT + v0 * u - 0.5 * (v0 / T2) * u * u, y: 0, z: PARK[2], pitch: 0.07 * (1 - smooth(u01(tt, TOUCH, TOUCH + 0.5))) + (tt > STOP ? 0.012 * Math.sin((tt - STOP) * 9) * Math.exp(-(tt - STOP) * 3) : 0), gear: 1 };
  }
  // Mrel(t): parked frame → world (identity until takeoff): every framing / prop after takeoff is authored in the PARKED frame
  const _m0 = new THREE.Matrix4(), _m1 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();
  const _pv = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1); const poseM = (p, out) => out.compose(_pv.set(p.x, p.y, p.z), _q.setFromEuler(_e.set(0, 0, p.pitch, 'YXZ')), _one);
  const PARKINV = poseM({ x: PARK[0], y: 0, z: PARK[2], pitch: 0 }, new THREE.Matrix4()).invert();   // the PARKED pose (planePose(0) is now out on the taxiway)
  const relM = (tt) => poseM(planePose(tt), _m0).multiply(PARKINV);
  const rel = (tt, p) => { if (tt < TO) return p; const M = relM(tt); return _v.set(...p).applyMatrix4(M).toArray(); };

  // ---------------------------------------------------------------- rotor speeds (integrated once: stateless frames)
  const OMEGA = (tt) => {   // rad/s of the core shaft (dryer fan → box fan → stages → turbine)
    if (tt < ON) return 0; if (tt < FANON) return 40;
    if (tt < PLUG) return tt < IGN ? 22 + 8 * u01(tt, RING1, RING1 + 0.5) : 34 + 10 * u01(tt, IGN, IGN + 0.6);
    if (tt < HAND0) return 30 * Math.max(0, 1 - (tt - PLUG) / 1.6);
    if (tt < IGN2) return 6 * Math.sin(u01(tt, HAND0, IGN2) * PI) + 4 * u01(tt, HAND0, IGN2);   // Gary hand-spins it
    if (tt < MELT0) return lerp(4, 46, smooth(u01(tt, IGN2, IGN2 + 1.6)));   // spool-up takes time
    if (tt > STILL0 && tt < STILL1) return 46 * (1 - smooth(u01(tt, STILL0 - 0.6, STILL0)));   // shut down while the blades get their holes
    if (tt < RUN) return 46; if (tt < STOP + 1) return 52; return 30;
  };
  const OMF = (tt) => { if (tt < BLD1) return 0; if (tt < STOP) return lerp(0, 22, smooth(u01(tt, BLD1, BLD1 + 1.2))); return lerp(22, 9, smooth(u01(tt, STOP, STOP + 1.5))); };
  const ANG = [], ANF = [], DT = 1 / 120; { let a = 0, f = 0; for (let tt = 0; tt <= END + 1; tt += DT) { ANG.push(a); ANF.push(f); a += OMEGA(tt) * DT; f += OMF(tt) * DT; } }
  const angAt = (arr, tt) => { const i = clamp(tt / DT, 0, arr.length - 2), k = Math.floor(i); return lerp(arr[k], arr[k + 1], i - k); };
  const HOLE_RANK = (() => { const a0 = angAt(ANG, (STILL0 + STILL1) / 2), ks = [...Array(14).keys()].sort((p, q) => Math.sin(a0 + p / 14 * TAU) - Math.sin(a0 + q / 14 * TAU)), r = []; ks.forEach((k, i) => { r[k] = i; }); return r; })();   // visible blades first (rotor stopped)

  // ---------------------------------------------------------------- the engine, stage by stage (every part assembles over its own window)
  function engAt(tt) {
    const s = { t: tt, spin: angAt(ANG, tt), fanSpin: angAt(ANF, tt) };
    s.coil = tt > ON && tt < IGN ? (tt < PLUG ? 1 : 0) : 0; s.coilDX = -1.75 * smooth(u01(tt, COIL0, COIL1)); s.coilOn = tt < IGN ? 1 : 0;
    s.boxFan = smooth(u01(tt, FANON - 0.45, FANON));
    s.duct = 4 * u01(tt, RING0, RING1);
    s.stages = 6 * u01(tt, STG0, STG1); s.shaftA = smooth(u01(tt, STG0 - 0.35, STG0));
    s.comb = u01(tt, COMB0, COMB1);
    s.flame = tt < IGN ? 0 : tt < PLUG ? 1 : tt < IGN2 ? Math.max(0, 1 - (tt - PLUG) / 0.3) : 1;
    s.flameBig = 1 + 0.7 * Math.exp(-Math.abs(tt - LAVA - 0.15) * 4) + 0.9 * (tt > IGN && tt < IGN + 0.4 ? 1 - (tt - IGN) / 0.4 : 0);
    s.turbCase = u01(tt, TC0, TC1); s.shaft = smooth(u01(tt, SH0, SH1)); s.turbDisc = smooth(u01(tt, TD0, TD1)); s.turbBlades = 14 * u01(tt, TB0, TB1);
    s.petals = 10 * u01(tt, PET0, PET1);
    s.tGlow = smooth(u01(tt, MELT0, MELT0 + 0.4)); s.melt = smooth(u01(tt, MELT0 + 0.2, MELT0 + 1.1));
    s.holes = 14 * u01(tt, DRILL0, DRILL1); s.holeRank = HOLE_RANK; s.film = smooth(u01(tt, FILM0, FILM0 + 0.6));
    s.cowl = smooth(u01(tt, COWL0, COWL0 + 0.5)); s.fanHub = smooth(u01(tt, HUB0, HUB1)); s.fan = 16 * u01(tt, BLD0, BLD1); s.ogv = 24 * u01(tt, BLD1 - 0.6, NAC1); s.nacelle = 6 * u01(tt, NAC0, NAC1);
    s.starter = tt < STARTER ? 0 : easeOutBack(u01(tt, STARTER, STARTER + 0.3)); s.bottles = tt < BOTTLES ? 0 : easeOutBack(u01(tt, BOTTLES, BOTTLES + 0.3)); s.swirl = tt > SWIRL ? 1 : 0;
    s.pylon = smooth(u01(tt, BOLT - 0.3, BOLT)); s.reverser = smooth(u01(tt, FLIP, FLIP + 0.45)) * (1 - smooth(u01(tt, STOP + 0.4, STOP + 1.2)));
    return s;
  }
  // where the engine is (world origin + parent): on the cardboard plane → arcing to the stand → the stand → the forklift → the wing
  function engPlace(tt) {
    if (tt < GO) { const x = cpX(tt); return { p: [x - 1.75, axisY(tt), EZ] }; }
    if (tt < CATCH) return { p: goPath(tt), rz: -0.25 * Math.sin(u01(tt, GO, CATCH) * PI) };
    if (tt < LIFT0) return { p: [D.stand.x, D.stand.y + (tt < CATCH + 0.4 ? 0.12 * Math.sin((tt - CATCH) * 24) * Math.exp(-(tt - CATCH) * 6) : 0), EZ] };
    if (tt < BOLT) { const u = smooth(u01(tt, DRIVE0, DRIVE1)); return { p: [lerp(D.stand.x, P.engine[0] + PARK[0], u), D.stand.y + 0.08 * smooth(u01(tt, LIFT0, LIFT0 + 0.3)) * (1 - smooth(u01(tt, DRIVE1 - 0.2, DRIVE1))), EZ] }; }
    return { onPlane: true };
  }

  // ---------------------------------------------------------------- effects + kicks, scheduled from the word times
  const KM = [], kick = (tt, s, d) => KM.push(d ? [tt, s, d] : [tt, s]);
  const ex = (tt) => { const p = engPlace(tt); return p.onPlane ? rel(tt, [PARK[0] + P.engine[0], P.engine[1], EZ]) : p.p; };   // engine origin (world) at t
  const at = (tt, dx, dy = 0, dz = 0) => { const o = ex(tt); return [o[0] + dx, o[1] + dy, o[2] + dz]; };
  // HOOK: tape rips, CLICK, the blast at the tub, POOF
  for (let k = 0; k < 3; k++) fx.burst('confetti', t.tapes + k * 0.14, { pos: at(t.tapes, 1.55, 0.05, 0.15), n: 5, dir: [0, 1, 0.3], spread: 1, speed: [0.4, 0.9], color: 0xdddddd, size: [0.03, 0.05], seed: 1 + k });
  fx.burst('spark', ON, { pos: at(ON, 1.7, 0.1, 0.1), n: 10, speed: [0.5, 1.2], spread: 1.2, seed: 4 }); kick(ON, 0.2);
  fx.stream('mist', ON + 0.05, FANON - 0.2, { pos: at(ON, 1.2, 0, 0.05), box: [0.2, 0.1, 0.1], rate: 22, dir: [-1, 0.1, 0], spread: 0.25, speed: [2.2, 3.5], size: [0.12, 0.25], color: 0xffe6c8, seed: 5 });
  fx.burst('confetti', BLOW, { pos: [0.6, 0.75, -1.5], n: 40, dir: [0, 1, 0], spread: 1.2, speed: [0.8, 1.8], color: 0xf2efe6, size: [0.03, 0.06], seed: 6 }); kick(BLOW, 0.85);
  // CONGRATS: ta-da confetti, the egg pops, the egg fountain
  fx.burst('confetti', t.congrats + 0.05, { pos: [2.3, 2.0, -0.6], n: 110, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 4], seed: 10 }); kick(t.congrats, 0.35);
  fx.burst('spark', EGG1, { pos: [2.32, 0.75, -0.13], n: 14, speed: [0.6, 1.4], spread: 1.2, seed: 11 }); kick(EGG1, 0.25);
  fx.burst('spark', EGGS, { pos: [2.5, 1.2, EZ], box: [1.2, 0.4, 0.6], n: 30, speed: [1, 2], spread: 1.3, seed: 12 }); kick(EGGS, 0.4);
  // DUCT: the yank, the open-fan storm, the TP, the rings, the focused jet, the creep
  fx.burst('spark', YANK + 0.1, { pos: [3.0, 0.4, -1.75], n: 14, speed: [0.8, 1.6], spread: 1.2, seed: 15 }); kick(YANK + 0.1, 0.35);
  fx.burst('spark', FANON, { pos: at(FANON, 1.9, 0, 0.05), n: 18, speed: [1, 2], spread: 1.2, seed: 16 }); kick(FANON, 0.4);
  fx.stream('mist', SPRAY, RING0 + 0.6, { pos: at(SPRAY, 1.9, 0, 0), box: [0.1, 0.5, 0.5], rate: 34, dir: [0, 1, 0], spread: 1.4, speed: [2, 4], size: [0.15, 0.35], color: 0xeaf4ff, seed: 17 });
  fx.stream('dust', SPRAY + 0.1, RING0, { alpha: 0.3, grow: 1.4, pos: [1.7, 0.4, -1.3], box: [3, 0.4, 1.5], rate: 9, dir: [1, 0.3, 0], spread: 1.2, speed: [1, 2.5], size: [0.3, 0.6], color: 0xe8e2d6, seed: 18 }); kick(SPRAY, 0.85);
  for (let k = 0; k < 4; k++) { const tk = RING0 + (k + 0.85) * (RING1 - RING0) / 4; fx.burst('spark', tk, { pos: at(tk, 1.92 - k * 0.18, 0.47, -0.05), n: 14, speed: [1, 2.2], spread: 1.2, seed: 20 + k }); kick(tk, k === 3 ? 0.55 : 0.3); }
  fx.stream('mist', ONEWAY, STG0, { pos: at(ONEWAY, -0.2, 0, 0), box: [0.1, 0.18, 0.18], rate: 20, dir: [-1, 0, 0], spread: 0.12, speed: [3, 4.5], size: [0.15, 0.3], color: 0xeaf4ff, seed: 25 });
  fx.burst('dust', CREEP, { alpha: 0.35, grow: 1.3, pos: [2.3, 0.1, EZ + 0.3], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.25, 0.45], color: 0xe8e2d6, seed: 26 }); kick(CREEP, 0.3);
  // SQUEEZE: the rubber duck's puff, the stages click in one by one, the TP sucked in (spin)
  fx.burst('mist', SQK + 0.1, { pos: [2.35 + 0.95, 1.05, EZ + 0.3], n: 8, dir: [1, 0.2, 0.2], spread: 0.3, speed: [1.5, 2.5], size: [0.1, 0.18], seed: 30 }); kick(SQK + 0.1, 0.25);
  for (let k = 0; k < 6; k++) { const tk = STG0 + (k + 0.9) * (STG1 - STG0) / 6; fx.burst('spark', tk, { pos: at(tk, E.comp[0] - 0.09 - k * 0.18, 0.4, -0.05), n: 16, speed: [1, 2.2], spread: 1.2, seed: 32 + k }); kick(tk, 0.3); }
  fx.burst('confetti', SUCK0 + 0.2, { pos: at(SUCK0, 2.4, 0, 0.1), n: 30, dir: [-1, 0.2, 0], spread: 0.6, speed: [1.5, 3], color: 0xfbfbf6, size: [0.05, 0.08], seed: 40 }); kick(SUCK1 - 0.2, 0.6);
  // BURN: casing rings, the pour, FWOOSH, lava flare, the blast on Gary
  for (let k = 0; k < 2; k++) { const tk = COMB0 + (k + 0.9) * (COMB1 - COMB0) / 2.4; fx.burst('spark', tk, { pos: at(tk, 0.2 - k * 0.34, 0.45, -0.05), n: 16, speed: [1, 2], spread: 1.2, seed: 45 + k }); kick(tk, 0.3); }
  fx.burst('glow', IGN, { pos: at(IGN, -0.15, 0, -0.1), n: 3, speed: [0, 0.01], size: [0.6, 0.9], color: 0xffb060, seed: 48 }); fx.burst('spark', IGN, { pos: at(IGN, -0.15, 0, 0), n: 30, speed: [1.5, 3], spread: 1.2, seed: 49 }); kick(IGN, 0.8);
  fx.burst('spark', LAVA, { pos: at(LAVA, -0.15, 0, 0), n: 20, speed: [1, 2.5], spread: 1.2, seed: 50 }); kick(LAVA, 0.3);
  fx.stream('glow', BLAST - 0.1, BLAST + 0.4, { pos: at(BLAST, -1.45, 0, -0.05), box: [0.05, 0.08, 0.08], rate: 36, dir: [-1, 0.05, 0], spread: 0.12, speed: [4, 6], size: [0.22, 0.4], color: 0xff7a1a, seed: 53 }); fx.stream('spark', BLAST - 0.1, BLAST + 0.35, { pos: at(BLAST, -1.45, 0, -0.05), box: [0.05, 0.08, 0.08], rate: 40, dir: [-1, 0.05, 0], spread: 0.2, speed: [4, 7], seed: 54 });   /* r5: a horizontal flame jet reaches Gary */ fx.burst('smoke', BLAST + 0.1, { pos: at(BLAST, -1.8, 0.1, 0.1), n: 12, dir: [0, 1, 0], speed: [0.4, 1], spread: 0.7, size: [0.25, 0.45], color: 0x555555, seed: 52 }); kick(BLAST, 1.0);
  // CORD: the door rolls up, the cord BOINGs taut, the plug bonks Gary, flameout smoke
  fx.burst('dust', DOOR0 + 0.4, { alpha: 0.3, grow: 1.3, pos: [14.5, 2.0, -1.3], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.3, 0.5], seed: 55 });
  fx.burst('dust', ROLL0 + 0.3, { alpha: 0.35, grow: 1.4, pos: [14.8, 0.1, EZ + 0.2], n: 8, speed: [0.4, 1], spread: 1.2, size: [0.3, 0.6], color: 0xd8d0c0, seed: 56 }); kick(ROLL0 + 0.3, 0.3);
  fx.burst('spark', PLUG, { pos: [19.4 + 0.62, 1.55, EZ + 0.1], n: 22, speed: [1, 2.5], spread: 1.3, seed: 57 }); kick(PLUG, 1.0);
  fx.burst('smoke', PLUG + 0.15, { pos: at(PLUG, -1.2, 0.1, -0.3), n: 6, dir: [-1, 0.6, 0], speed: [0.4, 1.0], spread: 0.6, size: [0.18, 0.3], color: 0xb4b4b4, alpha: 0.4, seed: 58 });
  // TURBINE: rings, the shaft CLUNK, blades in one by one, the relight, spool-up, SNIP
  for (let k = 0; k < 2; k++) { const tk = TC0 + (k + 0.9) * (TC1 - TC0) / 2; fx.burst('spark', tk, { pos: at(tk, -0.48 - k * 0.18, 0.45, -0.05), n: 14, speed: [1, 2], spread: 1.2, seed: 60 + k }); kick(tk, 0.3); }
  fx.burst('spark', SH1, { pos: at(SH1, -0.86, 0, 0), n: 20, speed: [1, 2.2], spread: 1.2, seed: 62 }); kick(SH1, 0.55);
  for (let k = 0; k < 7; k++) { const tk = TB0 + (k * 2 + 1) * (TB1 - TB0) / 14; fx.burst('spark', tk, { pos: at(tk, -0.68, 0.3, -0.05), n: 8, speed: [0.8, 1.6], spread: 1.2, size: [0.04, 0.09], seed: 63 + k }); kick(tk, 0.18); }
  fx.burst('glow', IGN2, { pos: at(IGN2, -0.15, 0, -0.1), n: 3, speed: [0, 0.01], size: [0.6, 0.9], color: 0xffb060, seed: 71 }); fx.burst('spark', IGN2, { pos: at(IGN2, -1.0, 0, 0), n: 26, dir: [-1, 0, 0], speed: [2, 4], spread: 0.5, seed: 72 }); kick(IGN2, 0.7);
  fx.stream('smoke', IGN2 + 0.2, BLOB - 0.3, { pos: at(IGN2, -1.3, 0, -0.35), box: [0.1, 0.2, 0.2], rate: 4, dir: [-1, 0.15, 0], spread: 0.3, speed: [1.5, 2.5], size: [0.16, 0.28], color: 0xbcbcbc, alpha: 0.35, seed: 73 });
  fx.burst('spark', SNIP, { pos: at(SNIP, 1.7, -0.4, 0.2), n: 10, speed: [0.5, 1.2], spread: 1.2, seed: 74 }); kick(SNIP, 0.35);
  // NOZZLE: fat slow blobs, petals click, the jet, GO: the launch, the fence, the shred, the catch
  fx.burst('glow', W('nozzle', 'one') - 0.05, { pos: at(W('nozzle', 'one'), 1.36, 0, 0.05), n: 3, speed: [0, 0.02], size: [0.25, 0.4], color: 0xfff2a0, seed: 177 });   // the dryer's own nozzle glints on "one"
  for (let k = 0; k < 1; k++) fx.burst('smoke', t.slowly + 0.7, { pos: at(BLOB, -2.2, -0.9, -0.2), n: 2, dir: [-1, 0, 0], speed: [0.5, 0.9], spread: 0.25, size: [0.24, 0.32], color: 0xc4c4c4, alpha: 0.42, seed: 76 + k });
  for (let k = 0; k < 5; k++) { const tk = PET0 + (k * 2 + 1.5) * (PET1 - PET0) / 10; fx.burst('spark', tk, { pos: at(tk, -1.05, 0.3, -0.05), n: 10, speed: [0.8, 1.6], spread: 1.2, seed: 80 + k }); kick(tk, 0.22); }
  fx.stream('spark', PET1, GO, { pos: at(PET1, -1.5, 0, 0), box: [0.1, 0.1, 0.1], rate: 30, dir: [-1, 0, 0], spread: 0.15, speed: [4, 6], size: [0.05, 0.1], seed: 86 });
  fx.burst('glow', GO, { pos: at(GO, -1.6, 0, 0), n: 4, speed: [0.5, 1], dir: [-1, 0, 0], size: [0.8, 1.2], color: 0xffa050, seed: 87 }); fx.burst('dust', GO + 0.02, { alpha: 0.45, grow: 1.6, pos: [17.5, 0.2, EZ], box: [2, 0.2, 1], n: 14, speed: [1, 2.5], spread: 1.2, size: [0.5, 0.9], color: 0xd8d0c0, seed: 88 }); kick(GO, 1.1);
  fx.burst('spark', FENCE, { pos: [D.fenceX, 1.2, EZ], n: 28, speed: [1.5, 3], spread: 1.3, seed: 89 }); kick(FENCE, 0.8);
  fx.burst('crumb', SHRED, { pos: goPath(SHRED), box: [1.5, 0.5, 0.8], n: 80, dir: [0, 1, 0], spread: 1.2, speed: [2, 4], color: 0xc99a62, size: [0.06, 0.14], floor: 0, seed: 90 });
  fx.burst('spark', CATCH, { pos: [D.stand.x, D.stand.y + 0.5, EZ], n: 40, speed: [1.5, 3.5], spread: 1.3, seed: 91 }); fx.burst('dust', CATCH + 0.05, { alpha: 0.4, grow: 1.6, pos: [D.stand.x, 0.2, EZ + 0.5], box: [4, 0.2, 1.5], n: 14, speed: [0.5, 1.4], spread: 1.2, size: [0.5, 0.9], color: 0xc8c4bc, seed: 92 }); kick(CATCH, 1.2);
  fx.burst('dust', GLAND, { alpha: 0.4, grow: 1.4, pos: [60.0, 0.1, -0.1], n: 8, speed: [0.4, 0.9], spread: 1.2, size: [0.3, 0.5], seed: 93 });
  // COOL: glow, drips onto Gary, the drill sparks blade by blade, the film (cool blue mist)
  fx.stream('drops', MELT0 + 0.3, MELT0 + 1.9, { pos: [D.stand.x - 0.68, D.stand.y - 0.35, EZ + 0.55], box: [0.12, 0.05, 0.1], rate: 6, dir: [0, -1, 0], spread: 0.05, speed: [0.2, 0.4], size: [0.035, 0.05], color: 0xc9ced3, floor: 1.42, seed: 95 });
  fx.burst('spark', MELT0 + 0.2, { pos: [D.stand.x - 0.68, D.stand.y, EZ], n: 30, speed: [1, 2.5], spread: 1.3, color: 0xff8a3a, seed: 96 }); kick(MELT0 + 0.6, 0.5);
  for (let k = 0; k < 7; k++) { const tk = DRILL0 + (k * 2 + 1) * (DRILL1 - DRILL0) / 14; fx.burst('spark', tk, { pos: [D.stand.x - 0.68, D.stand.y - 0.3, EZ + 0.2], n: 12, speed: [1, 2.2], spread: 1.2, seed: 100 + k }); kick(tk, 0.15); }
  fx.stream('mist', FILM0, FILM0 + 1.6, { pos: [D.stand.x - 0.68, D.stand.y, EZ - 0.05], box: [0.15, 0.6, 0.1], rate: 16, dir: [-1, 0, 0], spread: 0.3, speed: [0.8, 1.5], size: [0.08, 0.16], color: 0xaee6ff, seed: 108 });
  // FAN: the scream (vibration), fillings, the hub + blades + nacelle rings, the airflow
  fx.burst('spark', RATTLE, { pos: [60.1, 1.3, 0.35], n: 10, speed: [0.6, 1.2], spread: 1.2, size: [0.03, 0.06], seed: 110 }); kick(RATTLE, 0.35); kick(RUN, 0.45);
  fx.burst('spark', HUB1, { pos: [D.stand.x + E.bigFanX, D.stand.y, EZ], n: 24, speed: [1, 2.5], spread: 1.2, seed: 111 }); kick(HUB1, 0.5);
  for (let k = 0; k < 8; k++) { const tk = BLD0 + (k * 2 + 1) * (BLD1 - BLD0) / 16; fx.burst('spark', tk, { pos: [D.stand.x + E.bigFanX, D.stand.y + 1.1, EZ - 0.2], n: 10, speed: [0.8, 1.8], spread: 1.2, seed: 112 + k }); kick(tk, 0.18); }
  for (let k = 0; k < 6; k++) { const tk = NAC0 + (k + 0.9) * (NAC1 - NAC0) / 6; fx.burst('spark', tk, { pos: [D.stand.x + E.nac[0] - k * 0.48 - 0.24, D.stand.y + 1.8, EZ - 0.2], n: 14, speed: [1, 2.2], spread: 1.2, seed: 122 + k }); kick(tk, 0.3); }
  fx.burst('confetti', NAC1 + 0.05, { pos: [D.stand.x + 1, D.stand.y + 2.4, EZ], n: 90, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 4], seed: 129 }); kick(NAC1 + 0.05, 0.6);
  // DUCK + BIRD TEST
  fx.burst('confetti', SUCKD + 0.25, { pos: [D.stand.x + E.bigFanX + 0.3, D.stand.y - 0.8, EZ], n: 30, dir: [-1, 0.3, 0], spread: 0.8, speed: [1, 2.5], color: 0xd8d2c6, size: [0.04, 0.07], seed: 131 }); kick(SUCKD + 0.25, 0.9);
  fx.burst('confetti', THRU1, { pos: [D.stand.x - 0.2, D.stand.y - 1.1, EZ], n: 40, dir: [-1, 0.5, 0], spread: 0.8, speed: [1.5, 3], color: 0xd8d2c6, size: [0.04, 0.07], seed: 132 }); kick(THRU1, 0.85);
  fx.burst('dust', CAN1, { alpha: 0.35, grow: 1.4, pos: [67.3, 0.2, EZ + 0.4], n: 8, speed: [0.4, 1], spread: 1.2, size: [0.3, 0.6], seed: 133 }); kick(CAN1, 0.35);
  fx.burst('smoke', FIRE, { pos: [65.6, 1.3, EZ], n: 12, dir: [-1, 0.2, 0], speed: [1, 2], spread: 0.6, size: [0.3, 0.5], color: 0xdddddd, seed: 134 }); kick(FIRE, 0.9);
  fx.burst('confetti', SPLAT, { pos: [57.9, 1.4, EZ + 0.55], n: 40, dir: [-0.3, 1, 0.4], spread: 0.9, speed: [1.5, 3], color: 0xff6a3a, size: [0.05, 0.09], seed: 135 }); kick(SPLAT, 1.0);
  // FINISH: pops
  fx.burst('spark', STARTER, { pos: [D.stand.x + 0.9, D.stand.y - 0.58, EZ - 0.15], n: 18, speed: [1, 2], spread: 1.2, seed: 140 }); kick(STARTER, 0.35);
  fx.burst('spark', BOTTLES, { pos: [D.stand.x + 0.4, D.stand.y + 0.62, EZ - 0.2], n: 18, speed: [1, 2], spread: 1.2, seed: 141 }); kick(BOTTLES, 0.35);
  fx.burst('confetti', SWIRL, { pos: [D.stand.x + 3.1, D.stand.y + 0.4, EZ + 0.2], n: 40, dir: [1, 0.6, 0], spread: 0.8, speed: [1, 2.5], color: 0xffffff, size: [0.04, 0.07], seed: 142 }); kick(SWIRL, 0.4);
  // FLY: the lift, the bolt-up CLUNK, the takeoff roll dust, the liftoff, the clouds
  fx.burst('spark', BOLT, { pos: [PARK[0] + P.engine[0] + 1.3, P.engine[1] + 1.9, EZ], n: 30, speed: [1, 2.5], spread: 1.2, seed: 145 }); kick(BOLT, 0.6);
  kick(TO + 0.1, 0.5); kick(LIFTOFF, 0.85); kick(CLOUD_IN, 0.3); kick(TELE + 0.1, 0.3);
  // LAND: touchdown smoke, the reverser CLACK, braking smoke, the stop, Gary flies off → SPLAT
  { const p = planePose(TOUCH); fx.burst('smoke', TOUCH, { pos: [p.x - 3.5, 0.3, PARK[2] + 2.7], n: 18, dir: [-1, 0.4, 0], speed: [1, 3], spread: 0.6, size: [0.4, 0.8], color: 0xdddddd, seed: 150 }); kick(TOUCH, 1.1); }
  { const p = planePose(FLIP); fx.burst('spark', FLIP, { pos: [p.x + P.engine[0] + 0.7, 4.9, EZ], n: 20, speed: [1, 2], spread: 1.2, seed: 151 }); kick(FLIP, 0.6); }
  const xStop = planePose(STOP + 1).x, dX = xStop - PARK[0];
  kick(STOP, 0.9); fx.burst('dust', GSPLAT, { alpha: 0.45, grow: 1.5, pos: [PARK[0] + dX + 9.0, 0.1, EZ + 0.4], n: 12, speed: [0.5, 1.2], spread: 1.2, size: [0.4, 0.7], seed: 152 }); kick(GSPLAT, 1.0);
  // END: confetti, bills, the stamps, the duck flies in, POOF
  fx.burst('confetti', t.end + 0.05, { pos: [PARK[0] + dX + 3, 7, EZ], n: 160, dir: [0, 1, 0.3], spread: 0.9, speed: [3, 6], seed: 155 }); kick(t.end, 0.4);
  fx.burst('bill', MONEY, { pos: [PARK[0] + dX + 8.5, 2.6, EZ + 0.6], box: [3, 0.4, 1.6], n: 70, dir: [0, -1, 0], spread: 1.0, speed: [1.5, 2.5], seed: 156 }); kick(MONEY, 0.4);
  // r4: each roll-call stamp gets a physical beat (singe smoke, jelly splatter, a squish dust puff)
  { const gx = PARK[0] + 9.0 + dX; fx.burst('smoke', t.singed + 0.05, { pos: [gx, 0.35, EZ + 0.4], n: 10, dir: [0, 1, 0], speed: [0.4, 1.0], spread: 0.6, size: [0.2, 0.35], color: 0x555555, alpha: 0.5, seed: 171 }); fx.burst('drops', t.jellied + 0.05, { pos: [gx - 0.2, 0.3, EZ + 0.4], n: 16, dir: [0, 1, 0], speed: [1, 2], spread: 1.0, size: [0.05, 0.1], color: 0xff6a3a, floor: 0, seed: 172 }); kick(t.squished + 0.05, 0.35); }
  fx.burst('confetti', DLAND2, { pos: [PARK[0] + dX - 4.2, 2.8, EZ + 0.3], n: 24, dir: [-1, 0.3, 0], spread: 1, speed: [0.8, 1.6], color: 0xd8d2c6, size: [0.04, 0.07], seed: 157 }); kick(DLAND2, 0.4);
  fx.burst('confetti', POOF, { pos: [PARK[0] + dX - 4.2, 2.8, EZ + 0.3], n: 50, dir: [-1, 0.4, 0], spread: 1, speed: [1, 2.5], color: 0xd8d2c6, size: [0.04, 0.07], seed: 158 }); kick(POOF, 0.5);
  fx.stream('mist', DLAND2, END, { pos: [PARK[0] + dX - 3.2, 2.9, EZ], box: [0.2, 0.4, 0.3], rate: 14, dir: [-1, 0, 0], spread: 0.2, speed: [3, 4.5], size: [0.15, 0.3], color: 0xfff0dc, seed: 159 });
  kick(t.worst, 0.25); kick(t.mummifies, 0.4); kick(t.ducted, 0.2); kick(t.axial, 0.2); kick(t.combustion, 0.2); kick(t.cord, 0.2); kick(t.whittle, 0.2); kick(t.renewal, 0.25); kick(t.came, 0.25);
  kick(t.sixteen, 0.25); kick(t.thirteen, 0.25); kick(t.drips, 0.3); kick(t.screams, 0.4); kick(t.quieter, 0.2); kick(t.waddles, 0.2); kick(t.fine, 0.3); kick(t.birds, 0.25); kick(t.again, 0.4);
  kick(t.hundred, 0.3); kick(t.flies, 0.5); kick(t.forward, 0.3); kick(t.singed, 0.25); kick(t.jellied, 0.25); kick(t.squished, 0.3); kick(t.whole, 0.4);
  for (const c of story.callouts) if ((c.style === 'sfx' || c.style === 'stamp') && /[A-Z]{3}/.test(c.text) && !/WHIRR|CLICK|hmm|BLORP/.test(c.text) && !KM.some((k) => Math.abs(k[0] - c.t0) < 0.3)) kick(c.t0 + 0.02, 0.22);   // a soft jolt on every comic impact word
  const TERMS = story.callouts.filter((c) => c.style === 'term');
  const inTerm = (tk) => TERMS.find((c) => tk > c.t0 - 0.1 && tk < c.t1);
  for (const k of KM) { const c = inTerm(k[0]); if (c && k[1] >= 0.5 && c.t1 - k[0] < 0.3) k[0] = c.t1 + 0.02; }   // a real impact in a TERM's last 0.3 s waits for it to end
  const KM2 = KM.filter(([tk, s0]) => s0 >= 0.15 && !inTerm(tk)).map(([tk, s0, d]) => [tk, s0 >= 0.8 ? s0 : Math.min(s0, 0.35), d]);   // NO shake during a TERM line
  const KM_TERM = KM.filter(([tk, s0]) => s0 >= 0.5 && inTerm(tk)).map(([tk, s0]) => `${tk.toFixed(2)} ${s0} in ${inTerm(tk).text}`);
  const kickR = makeKick(KM2);

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words (turbo glide rule)
  const Fr = [], F = (tt, pos, look, fov = 44, o = {}) => Fr.push({ t: tt, pos, look, fov, ...o });
  const Fk = (tt, pos, look, fov = 44, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  const Pp = (tt, pos, look, fov = 44) => Fr.push({ t: tt, pos, look, fov, pass: true });
  const cx = (tt) => cpX(tt);   // the cardboard plane's x on a word (framings follow it through the house)
  // HOOK: Gary in his cardboard plane (the dryer + the tub in frame) → the dryer + tape close → the blast gives the duck a blowout ON the word
  Fk(0, [3.95, 1.35, 1.6], [2.55, 0.9, EZ], 42, t.garyH);
  Fk(t.tapes - 0.15, [2.05, 1.2, 0.8], [1.7, 0.85, EZ], 40, t.cardboard);
  Fk(t.gives - 0.15, [1.2, 1.75, 3.3], [1.15, 0.6, -1.1], 46, BLOW + 0.45);
  // CONGRATS (on "you've"): a low hero angle on Gary; the egg, tele; the egg fountain from above
  Fk(t.youve - 0.1, [2.95, 1.05, 1.7], [2.5, 0.8, EZ], 56);
  Fk(t.egg - 0.2, [3.3, 1.0, 2.3], [2.35, 0.62, -0.15], 34, t.egg + 0.5);
  Fk(t.thousand - 0.1, [4.3, 2.6, 4.4], [2.6, 0.6, -1.0], 42);
  // DUCT: the box fan from the right; the storm wide; the TP roll + Gary in one medium shot; mummified; the RINGS (one held framing while
  // all four slide on); the jet at the duck, high-left; the creep at floor level (tele)
  Fk(t.swap - 0.15, [3.6, 2.3, 4.9], [2.6, 0.75, -1.3], 42, FANON + 0.1);
  Fk(t.air - 0.1, [2.4, 2.2, 6.0], [2.0, 0.95, -1.3], 44);
  Fk(t.toilet - 0.25, [3.0, 1.6, 3.6], [2.6, 0.85, -1.0], 44, t.mummifies - 0.35);
  Fk(t.mummifies + 0.05, [4.0, 1.35, 1.3], [2.55, 0.9, EZ], 46, TP1 - 0.15);   // r4: mummified Gary from the front (r3: from behind)
  Fk(RING0 + 0.8, [-0.2, 1.55, 1.9], [1.8, 1.05, EZ], 50, t.all - 0.05);   // r5b: the tub side (a real new look), reached by a 1.35 s orbit
  Fk(t.all + 0.2, [0.64, 2.48, 3.6], [1.3, 0.75, -1.3], 48, t.oneway + 0.2);
  Fk(t.creeps - 0.25, [3.14, 0.53, 2.44], [2.8, 0.55, -0.8], 40);
  // SQUEEZE: the rubber duck squeak; ride along the hallway while the six stages slot in (tele from across the hall); the term close; Gary spun free
  Fk(t.squeezed - 0.05, [cx(t.squeezed) + 1.31, 1.37, 1.58], [cx(t.squeezed) + 0.65, 0.95, EZ], 48, t.stack - 0.3);
  F(t.stack + 0.1, [cx(t.stack) - 0.59, 1.57, 3.07], [cx(t.stack) - 0.85, 1.1, EZ], 40);
  Pp(lerp(t.stack, t.axial, 0.5), [cx(lerp(t.stack, t.axial, 0.5)) - 0.65, 1.57, 3.07], [cx(lerp(t.stack, t.axial, 0.5)) - 0.9, 1.1, EZ], 40);
  Fk(t.axial - 0.1, [cx(t.axial) - 0.54, 1.7, 3.01], [cx(t.axial) - 0.9, 1.1, EZ], 48, STG1 + 0.05);
  Fk(t.sucks - 0.15, [cx(t.sucks + 0.5) + 1.43, 1.7, 3.49], [cx(t.sucks + 0.5) + 0.62, 0.8, EZ], 48, SUCK1 + 0.15);
  // BURN: the combustor assembles in section (medium); the pour + the coil sliding back (one wide); FWOOSH close; Gary behind it
  Fk(t.burns - 0.05, [cx(t.burns) - 1.4, 1.75, 3.2], [cx(t.burns) - 1.8, 1.05, EZ], 46, IGN - 0.6);   // r5b: the combustor builds in ONE held framing (the pour stays off-frame)
  Fk(IGN + 0.1, [cx(IGN) - 3.6, 1.5, 1.6], [cx(IGN) - 1.9, 1.15, EZ], 44, t.combustion - 0.1);   // r5: the FWOOSH from the side
  Fk(t.garyB - 0.1, [cx(t.garyB) - 2.0, 1.55, 3.6], [cx(t.garyB) - 2.8, 0.95, EZ], 48, BLAST + 0.7);
  // CORD: the handle + cord close; follow the plane out of the garage and down the driveway; hold on Gary for the plug BONK
  Fk(t.cord - 0.25, [cx(t.cord) + 0.9, 1.3, 2.2], [cx(t.cord) - 0.2, 0.72, EZ], 44);
  for (const tk of [ROLL0 + 0.25, ROLL0 + 0.7]) Pp(tk, [cpX(tk) + 0.4, 2.2, 5.2], [cpX(tk) + 0.3, 0.9, EZ], 50);
  Fk(t.out - 0.3, [20.7, 1.75, 2.6], [19.9, 0.85, EZ], 50, PLUG + 0.2);
  // TURBINE: one held close framing (lens high, no caster in it) while the casing, the disc, 14 blades and the shaft go in; the relight wide;
  // Whittle (tele on Gary at the back); the £5 high wide; NO MORE CORD (tele)
  Fk(t.soT + 0.8, [15.2, 1.75, 2.6], [17.0, 1.15, EZ], 34, IGN2 - 0.35);
  Fk(IGN2 - 0.05, [15.0, 2.0, 3.2], [16.6, 1.0, EZ], 44, t.patented - 0.1);
  Fk(t.patented + 0.1, [13.6, 1.6, 2.9], [15.85, 0.9, -0.4], 34, t.five - 1.05);
  Fk(t.five, [14.6, 2.2, 3.9], [18.2, 1.0, -0.2], 44);   // r4: down the engine after Gary → he turns at the intake → SHLOOP
  Fk(t.cuts - 0.2, [15.6, 1.9, 3.3], [18.9, 0.9, -0.5], 42, SNIP + 0.05);
  // NOZZLE: the back (blobs, lens upstream of the plume); the petals close like an iris (rear ¾ tele); the term; the tiny dryer nozzle inside;
  // "Now" = the chase's start pose (the launch is a camera locked alongside the plane, camAt) → it lands at the stand
  Fk(t.blobs + 0.3, [14.3, 1.8, 3.4], [16.75, 1.1, EZ], 38, t.nozzleW + 0.5);
  Fk(t.came + 0.1, [17.65, 2.3, 6.4], [17.65, 1.15, EZ], 48, t.now - 0.4);   // r5: the petals, the tail cone AND the dryer in one wide   // the petals AND the tiny dryer nozzle in one frame (no dive in + out)
  Fk(t.now - 0.1, [16.1, 2.75, 6.2], [19.2, 1.1, EZ], 54, GO);   // = the chase's start pose
  Fr.push({ t: CATCH + 0.05, pos: [60.0, 4.1, 8.2], look: [61.2, 2.7, EZ], fov: 54, keep: true, until: MELT0 + 0.1, swoop: 60 });
  // COOL: melting close; GAS 1,600; low under the engine (drips onto Gary); ONE blade getting its holes (tele) → pull back for the rest;
  // the film close; behind the blast fence (the term); Gary's hat
  Fk(MELT0 + 0.75, [61.6, 0.9, 2.8], [60.3, 2.2, -0.4], 50);
  Fk(t.thirteen - 0.2, [60.95, 3.35, 2.1], [60.35, 3.0, EZ], 36);
  Fk(DRILL0 + 0.05, [60.86, 3.12, 2.5], [60.33, 2.95, EZ], 34, FILM0 + 0.3);   // r4: the holes go in blade by blade IN this close
  Fk(FILM0 + 0.5, [60.85, 3.2, 1.65], [60.33, 3.0, EZ], 32, t.film + 0.35);   // the film holds through its TERM
  Fk(t.drips - 0.15, [61.0, 1.85, 1.9], [60.15, 1.4, -0.2], 38, t.drips + 0.25);
  // FAN: the CONTROL booth (Gary behind the shaking window as it screams); his fillings, close; out to the front: the fan assembles
  // (front ¾, orbiting to the side as the blades + rings go in); under the fan for "around the core"; the term side-on; quieter
  Fk(t.works + 0.1, [63.4, 2.1, 3.4], [66.6, 1.9, -4.2], 46);   // r5b: follow Gary's dash one way (no fov-60 pump)   // wide: the engine screams, Gary dashes to the booth
  Fk(t.rattle - 0.3, [67.4, 1.6, -2.4], [67.6, 1.22, -5.6], 38, W('fan', 'out') + 0.15);
  Pp(W('fan', 'out') + 0.5, [67.5, 2.4, 2.2], [66.2, 2.2, -3.0], 50);
  Fk(t.giant + 0.25, [67.6, 3.6, 6.4], [62.6, 3.0, EZ], 40);
  Fk(t.around - 0.15, [63.2, 0.6, 3.6], [62.8, 2.6, EZ], 52);
  Fk(t.turbofan - 0.1, [63.0, 3.4, 9.5], [62.6, 3.0, EZ], 50);
  Fk(t.quieter - 0.15, [68.6, 1.9, 4.6], [66.4, 1.8, 1.0], 44);
  // DUCK: in front of the intake; sucked in; through the bypass (section); out the back into Gary's arms; fluffed but fine
  Fk(t.waddles - 0.2, [70.6, 2.6, 5.6], [65.4, 2.45, EZ], 50, t.goesD - 0.75);
  Fk(t.goesD - 0.2, [64.0, 1.6, 4.4], [65.0, 1.25, -0.9], 44, SUCKD + 0.45);   // r5: side-on through the cutaway, held still from "goes" to "IN"
  Fk(t.flings - 0.1, [61.7, 4.0, 7.6], [61.6, 3.7, EZ], 44, THRU1 - 0.1);
  Fk(t.back + 0.05, [56.0, 2.2, 5.0], [59.0, 1.5, EZ], 46);   // the duck shoots out of the nozzle in frame
  Fk(t.fine - 0.2, [56.6, 1.6, 3.2], [58.0, 1.9, 0.0], 42);
  // BIRD TEST, one way: out to the cannon (+x); the jelly bird in the breech; FOLLOW it back through the engine to Gary (−x): SPLAT, AGAIN
  Pp(t.engines + 0.3, [58.6, 2.4, 6.0], [59.6, 1.8, -0.4], 48);   // r5b: a parallel move along z≈6, not a 14 m swoop
  Fk(t.birds, [71.2, 2.6, 6.2], [66.5, 1.6, EZ], 50);
  Fk(t.strike - 0.2, [69.4, 2.4, 6.4], [67.6, 1.7, EZ], 50, FIRE - 0.05);
  Pp(FIRE + 0.4, [64.8, 2.6, 6.8], [63.8, 1.7, EZ], 52);
  Pp(JOUT, [60.6, 2.6, 6.8], [59.6, 1.7, EZ], 52);
  Fk(SPLAT + 0.1, [58.5, 2.3, 2.4], [57.9, 1.65, -0.35], 42, t.again + 0.55);
  // FINISH (+x): the starter + bottles in section; the swirl on the spinner (front)
  Fk(W('finish', 'fire') - 0.1, [62.4, 2.9, 4.6], [61.9, 3.3, EZ], 44);
  Fk(t.swirl - 0.3, [67.2, 3.4, 4.6], [64.0, 3.0, EZ], 44);
  // FLY (+x): the forklift carries it to the wing; the bolt-up; then the camera rides the plane (parked-frame coords): a low takeoff over the
  // streaming runway; an exterior above the clouds with Gary on the wing ("finally FLIES")
  Fk(t.hang - 0.2, [67.5, 3.5, 8.6], [63.5, 2.4, EZ], 48);
  Fk(BOLT, [78.5, 4.4, 9.8], [75.0, 3.9, EZ], 52, TO - 0.3);
  Fk(t.hundred - 0.05, [81.0, 1.8, 9.0], [76.0, 3.9, -2.5], 52);   // (a lens behind the engine crossed the wing on its way up to Gary)
  Fk(t.garyF - 0.2, [79.4, 7.1, 4.4], [75.9, 5.95, -0.7], 44, t.landing - 0.1);   // Gary arms out against the sunset (a deck view needs the lens on the fuselage side: it can't reach the landing framing legally)
  Fk(t.landing + 0.1, [83.0, 9.0, 7.5], [76.5, 4.0, -0.2], 50, TOUCH - 0.05);   // the runway rushes up past the wing edge
  // LAND: the descent wide; the reverser close; the term; the stop: ride with Gary on the wing → he flies off → SPLAT on the runway
  Fk(W('land', 'open') + 0.05, [77.6, 4.0, 5.6], [75.6, 3.4, EZ], 44);
  Fk(t.reverser - 0.1, [80.5, 5.0, 12.5], [76.5, 4.4, EZ], 50);
  Fk(t.stops - 0.1, [85.8, 5.4, 14.6], [80.6, 2.9, -0.5], 60, GSPLAT - 0.15);   // r5: Gary flies across ONE wide
  Fk(GSPLAT + 0.45, [89.2, 1.7, 3.2], [85.8, 0.7, -0.4], 46);
  // END (parked frame; Mrel carries it to the terminal): the finished engine ta-da; Gary squished (tele); money; the egg pile blown away;
  // the roll call on Gary; the duck flies over him → the blowout swoop; rest
  Fk(t.engineE - 0.1, [90.2, 1.9, 2.0], [82.0, 0.6, -0.8], 46);
  Fk(t.forty - 0.2, [89.4, 1.8, 1.9], [82.6, 0.6, -0.7], 46);
  Fk(t.eggsE - 0.3, [88.6, 1.7, 1.8], [83.4, 0.8, -0.6], 46);
  Fk(t.singed - 0.2, [87.4, 1.4, 1.6], [85.4, 0.62, -0.45], 50, t.squished + 0.3);
  Fk(t.whole - 0.3, [87.6, 2.9, 6.6], [84.8, 0.75, -0.6], 52, DFLY0 + 0.95);   // voiced: Gary + the duck loop sit above the caption
  Fk(t.blowout2 + 0.2, [79.0, 3.5, 9.8], [74.6, 2.8, EZ], 56);   // r5: wide enough to follow the duck to the exhaust at a legal speed
  Fr.push({ t: END, pos: [78.7, 3.52, 10.0], look: [74.6, 2.8, EZ], fov: 56 });
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr, { shortHoldPass: true, minHold: 0.9, move: [0.28, 16], lead: 0.12, maxLead: 0.25 }));
  const HOLDS = []; { let a = null; const dt = 1 / 30; let prev = rail.at(0);
    for (let tt = dt; tt <= END + dt; tt += dt) { const c = rail.at(Math.min(tt, END)); const m = Math.hypot(...c.pos.map((v, i) => v - prev.pos[i])) + Math.hypot(...c.look.map((v, i) => v - prev.look[i])) + Math.abs(c.fov - prev.fov) * 0.02; prev = c;
      if (m < 0.004) { if (a == null) a = tt - dt; } else { if (a != null && tt - a >= 0.9) HOLDS.push([a, tt]); a = null; } } }
  const pushAt = (tt) => { for (const [a, b] of HOLDS) { if (tt >= a && tt <= b) return 0.07 * smooth((tt - a) / (b - a)); if (tt > b && tt < b + 0.6) return 0.07 * (1 - smooth((tt - b) / 0.6)); } return 0; };
  const camAt = (tt) => { const c = rail.at(tt), w = smooth(u01(tt, GO - 0.35, GO)) * (1 - smooth(u01(tt, CATCH - 0.25, CATCH + 0.05)));
    if (w > 0) { const g = goPath(Math.max(GO, Math.min(tt, CATCH))), cp0 = [g[0] - 2.1, g[1] + 1.5 + 2.5 * smooth(u01(tt, CATCH - 0.45, CATCH - 0.1)), 6.2], lk = [g[0] + 1.0, g[1] - 0.15, g[2]]; c.pos = c.pos.map((v, i) => lerp(v, cp0[i], w)); c.look = c.look.map((v, i) => lerp(v, lk[i], w)); c.fov = lerp(c.fov, 54, w); }
    return { pos: rel(tt, c.pos), look: rel(tt, c.look), fov: Math.max(32, c.fov) }; };

  // TURBO fill: every stretch > 0.36 s with no new burst / kick / framing / callout gets a small sparkle at the subject
  const FILL = []; {
    const evT = [...FXN.times, ...KM2.map((k) => k[0]), ...Fr.map((f) => f.t), ...story.callouts.map((c) => c.t0)].filter((x) => x >= 0.2 && x <= END - 0.3).sort((p, q) => p - q);
    const wT = story.words.map((w) => w.t0);
    for (let i = 0; i + 1 < evT.length; i++) { const a = evT[i], b = evT[i + 1]; if (b - a <= 0.36) continue; const n = Math.floor((b - a) / 0.36);
      for (let k = 1; k <= n; k++) { let tk = a + k * (b - a) / (n + 1); const w = wT.find((x) => Math.abs(x - tk) < 0.18); if (w) tk = w; FILL.push(tk); } }
    FILL.forEach((tk, i) => { const c = camAt(tk), L = c.look, P0 = c.pos, d = Math.hypot(P0[0] - L[0], P0[1] - L[1], P0[2] - L[2]), q = Math.min(0.8, d * 0.15) / d, side = (i % 2 ? 1 : -1) * d * 0.08;
      const pos = [L[0] + (P0[0] - L[0]) * q + side, L[1] + (P0[1] - L[1]) * q + 0.3, L[2] + (P0[2] - L[2]) * q];
      fx.burst('spark', tk, { pos, box: [d * 0.06, d * 0.06, 0.2], n: 10, speed: [0.5, 1.4], spread: 1.3, size: [0.04, 0.09], seed: 400 + i }); });
  }

  // ---------------------------------------------------------------- moods
  const MOODK = [[0, 'day'], [t.melts, 'day'], [t.works, 'golden'], [t.nowF, 'golden'], [ABOVE - 0.1, 'sunset']];
  const moodAt = (tt) => { let i = 0; while (i < MOODK.length - 1 && tt >= MOODK[i + 1][0]) i++; const a = MOODK[i], b = MOODK[Math.min(i + 1, MOODK.length - 1)]; return a === b || a[1] === b[1] ? [a[1], a[1], 0] : [a[1], b[1], smooth((tt - a[0]) / (b[0] - a[0]))]; };

  // ---------------------------------------------------------------- Gary
  const SEATP = (tt) => [cpX(tt) + 0.62, 0.03, EZ];
  const sit = { legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.45 } };
  const WINGP = [PARK[0] + P.engine[0] + 0.4, 5.55, EZ + 0.15];   // Gary's spot on top of the right wing (parked frame)
  const GSTAND = [D.stand.x - 0.95, 0, -0.1], GFRONT = [D.stand.x + 5.6, 0, 1.4], GBACK = [D.stand.x - 3.1, 0, -0.35], BOOTHP = [D.stand.x + 6.6, 0, -6.45];
  function garyAt(tt) {
    let p = { t: tt, eyes: blinkE(tt), mouth: 'smile', brows: 0, rotY: PI / 2 };
    const soot = tt > BLAST ? 1 : 0, mess = { soot: soot * 0.8, noBrows: tt > BLAST, hairUp: tt > BLAST && tt < BLAST + 1.5 ? 1 - u01(tt, BLAST + 0.8, BLAST + 1.5) : 0 };
    if (tt < TP1 || (tt < SUCK0 + 0.01)) {   // seated in the plane (bathroom → hallway)
      const s = SEATP(tt), yank = tt > YANK - 0.35 && tt < FANON + 0.15, reachBack = tt > t.tapes - 0.25 && tt < t.tapes + 0.5;
      p = { ...p, x: s[0], y: s[1], z: s[2], ...sit, rotY: yank ? lerp(PI / 2, PI * 0.95, smooth(u01(tt, YANK - 0.35, YANK))) : PI / 2,
        armR: yank ? { x: -1.8, z: 0.6, el: 0.4 } : reachBack ? { x: -0.4, z: 1.1, el: 0.6 } : tt < t.want + 0.7 ? { x: -0.2, z: 1.5, el: 0.1 } : { x: -0.6, z: 0.25, el: 0.6 },
        armL: tt < t.want + 0.7 ? { x: -0.2, z: 1.5, el: 0.1 } : { x: -0.6, z: 0.25, el: 0.6 }, mouth: tt < ON ? 'grin' : tt < BLOW + 0.5 ? 'o' : tt > TP0 ? 'scream' : 'grin', eyes: tt > SPRAY && tt < TP1 ? 'wide' : blinkE(tt), look: tt > ON && tt < BLOW + 0.6 ? [-0.8, 0] : [0, 0], head: { y: tt > ON && tt < BLOW + 0.6 ? -1.0 : 0 } };
      if (tt > SQK - 0.2 && tt < SQK + 0.6) p.armR = { x: -1.3, z: 0.2, el: 0.9 };
    } else if (tt < SUCK1 + 0.9) {   // mummified in the seat → spun free by the intake → dizzy
      const s = SEATP(tt), spin = tt > SUCK0 ? 26 * Math.max(0, tt - SUCK0) - 6 * Math.max(0, tt - SUCK1) ** 2 : 0;
      p = { ...p, x: s[0], y: s[1], z: s[2], ...sit, rotY: PI / 2 + (tt > SUCK0 && tt < SUCK1 + 0.4 ? spin : 0), armR: { x: 0, z: 0.1 }, armL: { x: 0, z: 0.1 }, mouth: tt > SUCK0 ? 'scream' : 'flat', eyes: tt > SUCK1 ? 'spiral' : tt > SUCK0 ? 'wide' : 'half' };
    } else if (tt < HOP0) {   // the garage: out of the seat, to the jerry can, pour, then round to the back → BLAST
      const s = SEATP(tt), cx0 = cpX(tt);
      const route = [[SUCK1 + 0.9, s], [SUCK1 + 1.3, [cx0 + 0.9, 0, -0.1]], [POUR0 - 0.4, [cx0 + 1.0, 0, 0.75]], [POUR0, [cx0 + 0.85, 0, 0.5]], [POUR1 + 0.2, [cx0 + 0.85, 0, 0.5]], [BEH0, [cx0 - 0.4, 0, 0.6]], [BEH0 + 0.6, [cx0 - 3.3, 0, EZ + 0.05]]];
      const q = K(tt, route), walking = (tt > SUCK1 + 1.3 && tt < POUR0) || (tt > POUR1 + 0.2 && tt < BEH0 + 0.6), pouring = tt > POUR0 && tt < POUR1 + 0.2, blasted = tt > BLAST;
      p = { ...p, x: q[0] - (blasted ? 0.6 * smooth(u01(tt, BLAST, BLAST + 0.35)) : 0), y: 0, z: q[2], rotY: tt < POUR0 - 0.4 ? PI * 0.75 : pouring ? -PI / 2 - 0.4 : tt < BEH0 ? -PI / 2 : PI / 2, walk: walking ? tt * 12 : undefined, eyes: tt < SUCK1 + 1.6 ? 'spiral' : blasted ? 'wide' : blinkE(tt),
        armR: pouring ? { x: -1.4, z: 0.3, el: 0.6 } : { x: -0.3, z: 0.2, el: 0.5 }, armL: pouring ? { x: -1.2, z: 0.2, el: 0.6 } : { x: -0.2, z: 0.2 }, mouth: blasted ? 'o' : tt > BEH0 + 0.6 ? 'grin' : 'smile', rx: blasted ? -0.25 * Math.exp(-(tt - BLAST) * 3) : 0, ...mess, hatLift: tt > BLAST && tt < BLAST + 0.7 ? 1 : 0 };
    } else if (tt < SEAT || tt < GO) {   // back in the seat for the roll (plug BONK), then out to build the turbine + nozzle, then back in
      const s = SEATP(tt), cx0 = cpX(tt);
      if (tt < HOP1) { const q = K(tt, [[HOP0, [cx0 - 2.7, 0, EZ + 0.05]], [HOP0 + 0.35, [cx0 - 1.0, 0, 0.6]], [HOP1, s]]); p = { ...p, x: q[0], y: q[1], z: q[2], walk: tt * 12, ...mess, eyes: 'half' }; }
      else if (tt < t.soT + 0.15) { const bonk = tt > PLUG; p = { ...p, x: s[0], y: s[1], z: s[2], ...sit, ...mess, mouth: bonk ? 'scream' : 'grin', eyes: bonk ? (tt > PLUG + 0.15 ? 'spiral' : 'x') : blinkE(tt), squash: bonk ? squash(tt, PLUG, 0.35) : [1, 1], head: { x: bonk ? 0.25 * Math.exp(-(tt - PLUG) * 4) : 0 } }; }
      else {
        const work = [[t.soT + 0.05, s], [t.soT + 0.35, [cx0 + 0.6, 0, -2.4]], [t.soT + 1.15, [cx0 - 3.0, 0, -2.4]], [t.soT + 1.5, [cx0 - 3.55, 0, EZ + 0.35]], [t.five - 0.45, [cx0 - 3.55, 0, EZ + 0.35]], [t.renewal, [cx0 + 0.95, 0, 0.55]], [SNIP - 0.4, [cx0 + 0.55, 0, 0.45]], [SNIP + 0.3, [cx0 + 0.55, 0, 0.45]], [BLOB - 0.1, [cx0 - 0.2, 0, 1.8]], [PET1 + 0.2, [cx0 - 0.2, 0, 1.8]], [TINY, [cx0 - 0.2, 0, 1.8]], [SEAT - 0.2, [cx0 + 0.6, 0, -1.6]], [SEAT + 0.4, s]];
        const q = K(tt, work), handSpin = tt > HAND0 && tt < IGN2, snipping = tt > SNIP - 0.45 && tt < SNIP + 0.3, hammer = (tt > t.soT + 0.8 && tt < HAND0) || (tt > PET0 && tt < PET1);
        const moving = [[t.soT + 0.05, t.soT + 1.5], [t.five - 0.45, t.renewal], [t.renewal + 0.15, SNIP - 0.4], [SNIP + 0.3, BLOB - 0.1], [PET1 + 0.2, SEAT + 0.4]].some(([a, b]) => tt > a && tt < b);
        const seated = tt > SEAT + 0.4, ham = Math.max(0, Math.sin(tt * 14));
        p = { ...p, x: q[0], y: q[1], z: q[2], ...(seated ? sit : {}), ...mess, rotY: seated ? PI / 2 : handSpin ? PI / 2 + 0.3 : snipping ? -PI * 0.75 : hammer ? (tt > PET0 - 0.2 ? -PI * 0.7 : PI / 2 + 0.35) : tt > IGN2 + 0.8 && tt < t.five - 0.45 ? -0.24 : PI * 0.4, walk: moving && !seated ? tt * 12 : undefined,
          armR: handSpin ? { x: -2.2 + Math.sin(tt * 16) * 0.8, z: 0.4, el: 0.4 } : tt > t.patented && tt < t.five - 0.45 ? { x: -2.7, z: 0.5, el: 0.1 } : hammer ? { x: -2.4 + ham * 1.6, z: 0.25, el: 0.2 } : snipping ? { x: -1.3, z: 0.2, el: 0.5 } : { x: -0.3, z: 0.2, el: 0.5 }, armL: { x: -0.3, z: 0.2 },
          mouth: tt > IGN2 && tt < IGN2 + 0.8 ? 'o' : tt > GO - 0.2 ? 'grin' : 'smile', eyes: tt > t.afford && tt < t.renewal + 0.3 ? 'half' : blinkE(tt) };
      }
    } else if (tt < GLAND + 0.75) {   // GO: flung from the shredding plane in an arc → FACEPLANT by the stand (r3) → pops up
      if (tt < SHRED) { const s = SEATP(GO), g = goPath(tt), o = goPath(GO); p = { ...p, x: s[0] + g[0] - o[0], y: s[1] + g[1] - o[1], z: s[2], ...sit, ...mess, mouth: 'scream', eyes: 'wide', armR: { x: -2.8, z: 0.6 }, armL: { x: -2.8, z: 0.6 } }; }
      else { const s = SEATP(GO), g = goPath(SHRED), o = goPath(GO), q = hop(tt, SHRED, GLAND, [s[0] + g[0] - o[0], s[1] + g[1] - o[1], s[2]], GSTAND, 1.5), u = u01(tt, SHRED, GLAND), flat = tt > GLAND ? 1 - smooth(u01(tt, GLAND + 0.45, GLAND + 0.75)) : 0; p = { ...p, x: q[0], y: q[1] + 0.12 * flat, z: q[2] + 0.5 * flat, rx: tt < GLAND ? -u * TAU : PI / 2 * 0.95 * flat, ...mess, mouth: 'scream', eyes: 'wide', squash: tt > GLAND ? squash(tt, GLAND, 0.35) : [1, 1], armR: { x: -2.8, z: 0.8 }, armL: { x: -2.8, z: 0.8 } }; }
    } else if (tt < RUN0) {   // at the stand: drips, ladder + drill, film, fillings, the fan assembly (front)
      const onLadder = tt > LAD0 + 0.4 && tt < FILM0 + 0.8, ladderP = [D.stand.x + 0.25, 0, 0.35];   /* on the ladder prop, off the drill close's lens */
      let q = GSTAND; if (tt > LAD0 && tt < FILM0 + 1.2) q = K(tt, [[LAD0, GSTAND], [LAD0 + 0.4, ladderP], [FILM0 + 0.8, ladderP], [FILM0 + 1.2, GSTAND]]);
      if (tt > BOOTH0) q = K(tt, [[BOOTH0, GSTAND], [BOOTH0 + 0.5, [D.stand.x + 4.2, 0, -1.6]], [t.fillings - 0.1, BOOTHP], [OUT0, BOOTHP], [OUT0 + 0.35, [D.stand.x + 8.6, 0, -6.45]], [OUT0 + 0.8, [D.stand.x + 8.4, 0, -2.6]], [HUB0 + 0.9, GFRONT]]);
      const inBooth = tt > t.fillings - 0.2 && tt < OUT0 + 0.05, vib = tt > RUN && tt < QUIET ? 0.04 * Math.sin(tt * 70) : 0, ladderY = onLadder ? 1.3 : inBooth ? 0.3 : 0, drilling = tt > DRILL0 && tt < DRILL1, ears = tt > RUN && tt < QUIET && !(tt > HUB0 && tt < NAC1);
      const directing = tt > HUB0 + 0.9 && tt < NAC1;
      p = { ...p, x: q[0] + vib, y: ladderY, z: q[2], rotY: directing ? -PI * 0.6 : onLadder ? PI / 2 : inBooth ? 0 : tt > BOOTH0 && tt < OUT0 ? PI * 0.8 : tt > OUT0 && tt < HUB0 + 0.9 ? -PI * 0.4 : 0.15, ...mess, walk: (tt > LAD0 && tt < LAD0 + 0.4) || (tt > BOOTH0 && tt < t.fillings - 0.1) || (tt > OUT0 && tt < HUB0 + 0.9) ? tt * 16 : undefined,
        armR: drilling ? { x: -1.85, z: 0.3, el: 0.2 + 0.08 * Math.sin(tt * 40) } : ears ? { x: -0.4, z: 1.6, el: 2.2 } : directing ? { x: -2.4 + Math.max(0, Math.sin(tt * 9)) * 1.0, z: 0.4, el: 0.3 } : { x: -0.3, z: 0.2, el: 0.5 },
        armL: ears ? { x: -0.4, z: 1.6, el: 2.2 } : { x: -0.2, z: 0.2 }, mouth: tt > MELT0 + 0.3 && tt < MELT0 + 1.9 ? 'scream' : tt > RATTLE - 0.1 && tt < RATTLE + 0.8 ? 'scream' : ears ? 'wavy' : tt > QUIET ? 'grin' : 'smile',
        eyes: tt > MELT0 + 0.3 && tt < MELT0 + 1.9 ? 'wide' : tt > RATTLE - 0.2 && tt < RATTLE + 0.8 ? 'wide' : blinkE(tt), look: tt > MELT0 && tt < MELT0 + 1.9 ? [0, 1] : [0, 0] };
    } else if (tt < FORK0) {   // dash to the back, catch the duck, the remote, SPLAT, AGAIN
      const q = K(tt, [[RUN0, GFRONT], [RUN1, GBACK]]), holding = tt > DOUT, splat = tt > SPLAT;
      p = { ...p, x: q[0], y: 0, z: q[2], rotY: tt < RUN1 ? -PI / 2 : 0.35, walk: tt < RUN1 ? tt * 16 : undefined, mouth: tt < RUN1 ? 'scream' : splat ? 'o' : 'grin', eyes: tt < RUN1 ? 'wide' : splat && tt < SPLAT + 0.5 ? 'x' : blinkE(tt),
        armR: holding ? { x: -1.2, z: 0.15, el: 1.2 } : { x: -0.6, z: 0.3, el: 0.5 }, armL: holding ? { x: -1.2, z: 0.15, el: 1.2 } : { x: -0.6, z: 0.3, el: 0.5 }, squash: splat ? squash(tt, SPLAT, 0.3) : [1, 1] };
    } else if (tt < WING1) {   // the forklift: hop on, carry the engine to the wing, climb up
      const fp = forkAt(tt);
      if (tt < WING0) p = { ...p, x: fp.x - 0.45, y: 1.25 - 0.47, z: fp.z, ...sit, rotY: PI / 2, armR: { x: -1.2, z: 0.2, el: 0.8 }, armL: { x: -1.2, z: 0.2, el: 0.8 }, mouth: 'grin' };
      else { const q = hop(tt, WING0, WING1, [fp.x - 0.45, 0.8, fp.z], WINGP, 0.8); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: PI / 2, armR: { x: -2.6, z: 0.4 }, armL: { x: -2.6, z: 0.4 }, mouth: 'o', eyes: 'wide' }; }
    } else if (tt < GFLY0) {   // on the wing (rides the plane): wind face on takeoff + above the clouds
      const wind = smooth(u01(tt, TO + 0.3, LIFTOFF)) * (1 - smooth(u01(tt, STOP - 0.4, STOP)));
      const w2 = rel(tt, WINGP), yay = tt > t.garyF - 0.1 && tt < t.landing - 0.05, panic = tt > t.landing - 0.05; p = { ...p, x: w2[0], y: w2[1], z: w2[2], ...sit, rotY: PI / 2, rz: 0, armR: yay ? { x: -2.5, z: 1.25, el: 0.05 } : { x: -1.4 - 0.3 * wind, z: 0.5, el: 0.2 }, armL: yay ? { x: -2.5, z: 1.25, el: 0.05 } : { x: -1.4 - 0.3 * wind, z: 0.5, el: 0.2 },
        mouth: yay ? 'grin' : panic ? 'scream' : wind > 0.3 ? 'wavy' : 'grin', eyes: wind > 0.3 && !yay && !panic ? 'half' : 'wide', hatLift: 0, squash: [1 + 0.08 * wind, 1 - 0.05 * wind], head: { x: -0.2 * wind } };
    } else {   // flung off the wing at the stop → squished flat on the runway, face up, the roll call; sits up for the duck
      const land = [PARK[0] + 9.0 + dX, 0.02, EZ + 0.4];
      if (tt < GSPLAT) { const q = hop(tt, GFLY0, GSPLAT, rel(GFLY0, WINGP), land, 1.2), u = u01(tt, GFLY0, GSPLAT); p = { ...p, x: q[0], y: q[1], z: q[2], rx: -u * 1.7, mouth: 'scream', eyes: 'wide', armR: { x: -2.8, z: 0.8 }, armL: { x: -2.8, z: 0.8 } }; }
      else { const sitUp = smooth(u01(tt, t.duckE - 0.5, t.duckE + 0.3)); const look = tt > DFLY0 + 0.4 && tt < DFLY0 + 1.2 ? 0.9 * Math.sin((tt - DFLY0 - 0.45) * TAU / 0.6) : 0, wave = tt > t.youveE - 0.1 && tt < t.forty ? 0.5 * Math.max(0, Math.sin((tt - t.youveE) * 5)) : 0; p = { ...p, x: land[0], y: land[1] - 0.35 * sitUp, z: land[2], rotY: lerp(PI * 0.62, 0.5, sitUp), rx: -PI / 2 * (1 - sitUp), pancake: 1 - sitUp, legL: { x: -1.5 * sitUp, kn: 0 }, legR: { x: -1.5 * sitUp, kn: 0 }, head: { y: look, x: -0.35 * sitUp }, mouth: tt > t.duckE ? 'o' : 'wavy', eyes: tt < GSPLAT + 0.6 ? 'spiral' : tt > t.duckE ? 'wide' : 'half', armR: sitUp > 0.5 ? { x: 0.25, z: 0.45, el: 0.3 } : { x: -0.2 - wave, z: 1.3, el: wave }, armL: sitUp > 0.5 ? { x: 0.25, z: 0.45, el: 0.3 } : { x: -0.2, z: 1.3 } }; }
    }
    // the mess builds up: soot (singed) for good, jelly after the splat, the metal drips on his hat
    if (tt > BLAST) { p.soot = 0.75; p.noBrows = true; }
    gary.set(p); { const pk = p.pancake ?? 0; gary.root.scale.set(1 + 0.4 * pk, 1 - 0.72 * pk, 1 + 0.4 * pk); }
    goggles.visible = tt < BLAST;
    rubber.visible = tt > SQK - 0.25 && tt < SQK + 0.9; fanBlade.visible = tt > YANK && tt < FANON - 0.25; mallet.visible = (tt > TC0 + 0.3 && tt < HAND0 - 0.45) || (tt > PET0 && tt < PET1) || (tt > RING0 && tt < RING1);
    scissors.g.visible = tt > SNIP - 0.5 && tt < SNIP + 0.35; scissors.set(tt > SNIP - 0.5 && tt < SNIP ? 1 - u01(tt, SNIP - 0.15, SNIP) : 0);
    drill.visible = tt > DRILL0 - 0.3 && tt < DRILL1 + 0.2; remote.visible = tt > FIRE - 0.6 && tt < FIRE + 0.4;
    hatDrips.forEach((d, i) => { d.visible = tt > MELT0 + 0.5 + i * 0.25; });
    { const on = tt > SPLAT && tt < GFLY0, wob = 1 + 0.12 * Math.exp(-(tt - SPLAT) * 3) * Math.sin((tt - SPLAT) * 26); jellyGoo.visible = tt > SPLAT; jellyChest.visible = on; const cap = smooth(u01(tt, SPLAT + 0.9, SPLAT + 1.5)) /* slides up to a cap so the face reads again */; jellyGoo.position.y = 0.05 + 0.17 * cap; jellyGoo.scale.set(1.12 * wob * (1 - 0.1 * cap), 1.0 / wob, 1.12 * wob * (1 - 0.1 * cap)); jellyChest.scale.set(1.2 * wob, 1.1 / wob, 0.9); }
    { gary.head.updateWorldMatrix(true, false); const mth = new THREE.Vector3(0, -0.12, 0.26).applyMatrix4(gary.head.matrixWorld); fillings.forEach((f, i) => { const a = tt - (RATTLE + i * 0.12); f.visible = a > 0 && a < 1.1; if (f.visible) { const yy = mth.y + a * 1.6 - 4.9 * a * a, floorY = 1.34; f.position.set(mth.x + a * (i - 1.5) * 0.5, yy > floorY ? yy : floorY + 0.14 * Math.abs(Math.sin(a * 14)) * Math.exp(-a * 3), mth.z + Math.min(a, 0.5) * 1.6); } }); }
    dizzy.update(tt, tt > SUCK1 && tt < SUCK1 + 1.4 ? 1 : tt > PLUG && tt < PLUG + 1.2 ? 1 : tt > GSPLAT && tt < GSPLAT + 1.2 ? 1 : 0, (() => { gary.head.updateWorldMatrix(true, false); const v = gary.head.getWorldPosition(new THREE.Vector3()); return [v.x, v.y + 0.35, v.z]; })());
  }
  // the forklift (parked beside the stand → behind the engine → carries it to the wing → drives off)
  function forkAt(tt) {
    const parked = { x: D.stand.x - 8.0, z: -3.4, rotY: 0 }, behind = { x: D.stand.x - 2.2, z: EZ };   // r3: forks under the nacelle
    if (tt < FORK0) return { ...parked, lift: 0.1 };
    if (tt < LIFT0) { const u = smooth(u01(tt, FORK0, LIFT0)); return { x: lerp(parked.x, behind.x, u), z: lerp(parked.z, behind.z, u), rotY: 0, lift: 0.1 }; }
    if (tt < DRIVE1) { const u = smooth(u01(tt, DRIVE0, DRIVE1)), dx = (PARK[0] + P.engine[0]) - D.stand.x; return { x: behind.x + dx * u, z: EZ, rotY: 0, lift: 0.1 + 0.95 * smooth(u01(tt, LIFT0, LIFT0 + 0.3)), wheel: u * 12 }; }
    const u = smooth(u01(tt, BOLT + 0.6, BOLT + 1.8)); return { x: behind.x + (PARK[0] + P.engine[0]) - D.stand.x - u * 6, z: EZ + u * 6, rotY: u * 0.9, lift: 1.05 - 0.95 * smooth(u01(tt, BOLT, BOLT + 0.5)) };
  }

  // ---------------------------------------------------------------- the duck
  const TUB = [0.5, 0.42, -1.35];
  function duckAt(tt) {
    let p = { t: tt, rotY: PI / 2, eyes: 'open', fluff: tt > BLOW ? (tt < BLOW + 0.25 ? easeOutBack(u01(tt, BLOW, BLOW + 0.25)) : 1 - smooth(u01(tt, SLEEK, SLEEK + 0.35))) : 0, tilt: tt > SLEEK && tt < SLEEK + 0.5 ? 0.25 * Math.sin((tt - SLEEK) * 40) : 0 };   // r2: it shakes itself sleek in the hallway (so FLUFFED later is a change)
    if (tt < DHOP) { p = { ...p, x: TUB[0], y: TUB[1] + 0.02 * Math.sin(tt * 2), z: TUB[2], rotY: PI / 2 + (tt > ON && tt < BLOW + 0.3 ? 0.4 : 0), eyes: tt > BLOW && tt < BLOW + 0.6 ? 'wide' : tt > ONEWAY && tt < DHOP ? 'happy' : 'open', quack: tt > BLOW && tt < BLOW + 0.3 ? 1 : 0 }; }
    else if (tt < t.stack) {   // hops out of the tub, waddles past the creeping plane, hops onto its nose
      const route = [[DHOP, TUB], [DHOP + 0.4, [1.2, 0, -0.1]], [t.faster + 0.6, [4.3, 0, -0.1]], [t.stack - 0.35, [cpX(t.stack) + 1.75, 0, EZ + 0.3]]];
      if (tt < DHOP + 0.4) { const q = hop(tt, DHOP, DHOP + 0.4, TUB, [1.2, 0, -0.1], 0.35); p = { ...p, x: q[0], y: q[1], z: q[2] }; }
      else if (tt < t.stack - 0.35) { const q = K(tt, route); p = { ...p, x: q[0], y: 0, z: q[2], waddle: tt * 14, quack: tt > t.faster && tt < t.faster + 0.3 ? 1 : 0, rotY: tt < t.faster + 0.6 ? PI / 2 : -PI / 2 }; }
      else { const q = hop(tt, t.stack - 0.35, t.stack, [cpX(t.stack) + 1.75, 0, EZ + 0.3], [cpX(t.stack) + 1.25, 0.66, EZ], 0.4); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: PI / 2 }; }
    } else if (tt < GO + 0.3) {   // rides the plane's nose (house → driveway)
      const x = cpX(tt) + 1.25; p = { ...p, x, y: 0.66, z: EZ, rotY: tt > BLAST - 0.2 && tt < BLAST + 0.8 ? -PI / 2 : PI / 2, eyes: tt > PLUG && tt < PLUG + 0.6 ? 'wide' : blinkE(tt + 0.5), quack: tt > t.out - 0.1 && tt < t.out + 0.2 ? 1 : 0 };
    } else if (tt < DW0) {   // tumbles off at the launch (no flapping), lands by the stand, pokes around
      const land = [D.stand.x + 6.2, 0, -2.0];   // r4: clear of Gary's spot (he hid the duck's walk to the intake)
      if (tt < DLAND) { const q = hop(tt, GO + 0.3, DLAND, [goPath(GO + 0.3)[0] + 3.2, 1.2, EZ], land, 2.0); p = { ...p, x: q[0], y: q[1], z: q[2], rx: -u01(tt, GO + 0.3, DLAND) * TAU, eyes: 'wide' }; }
      else p = { ...p, x: land[0] + 0.3 * Math.sin(tt * 0.6), y: 0, z: land[2], rotY: -PI / 2 + 0.6 * Math.sin(tt * 0.4), waddle: Math.sin(tt * 0.6) > 0.7 ? tt * 12 : undefined, squash: tt < DLAND + 0.4 ? squash(tt, DLAND, 0.3) : [1, 1] };
    } else if (tt < SUCKD + 0.35) {   // waddles in front of the intake → sucked in
      const q = K(tt, [[DW0, [D.stand.x + 6.2, 0, -2.0]], [SUCKD, [D.stand.x + E.nac[0] + 1.0, 0.0, EZ - 0.25]]]);
      if (tt < SUCKD) p = { ...p, x: q[0], y: 0, z: q[2], rotY: -1.1, waddle: tt * 14, quack: tt > t.waddles && tt < t.waddles + 0.25 ? 1 : 0 };
      else { const u = u01(tt, SUCKD, SUCKD + 0.35); p = { ...p, x: lerp(q[0], D.stand.x + E.bigFanX + 0.2, easeInQuad(u)), y: lerp(0, D.stand.y - 1.2, u), z: EZ - 0.05, rotY: PI / 2, eyes: 'wide', quack: 1, squash: [1 - 0.3 * u, 1 + 0.4 * u] }; }
    } else if (tt < DOUT) {   // through the bypass (behind the fan, outside the core) → out the back → into Gary's arms
      if (tt < THRU1) { const u = u01(tt, SUCKD + 0.35, THRU1), x = lerp(D.stand.x + E.bigFanX - 0.2, D.stand.x + E.nac[1] - 0.4, smooth(u)); p = { ...p, x, y: D.stand.y - 1.15 + 0.08 * Math.sin(tt * 30), z: EZ - 0.25, rotY: -PI / 2, rz: u * TAU * 2, eyes: 'spiral', scale: 1.3 }; }
      else { const q = hop(tt, THRU1, DOUT, [D.stand.x + E.nac[1] - 0.6, D.stand.y - 1.15, EZ - 0.2], [GBACK[0] + 0.15, 0.9, GBACK[2] + 0.35], 0.6); p = { ...p, x: q[0], y: q[1], z: q[2], rotY: 0.4, eyes: 'wide', fluff: 1.25 }; }
    } else if (tt < GO + 1e9 && tt < DFLY0) {   // in Gary's arms (back of the stand) → sits on the pad when Gary rides off
      const held = tt < FORK0, sh = smooth(u01(tt, t.engines - 0.2, t.engines + 0.15)); const x = held ? lerp(GBACK[0] + 0.15, GBACK[0] - 0.24, sh) : GBACK[0] + 0.6, z = held ? lerp(GBACK[2] + 0.35, GBACK[2] + 0.06, sh) : GBACK[2] + 1.0;   // r2: hops onto his shoulder (it covered his face in his arms)
      p = { ...p, x, y: held ? lerp(0.9, 1.04, sh) + 0.25 * Math.sin(sh * PI) : 0, z, scale: held ? lerp(1, 0.72, sh) : 1, rotY: 0.4, fluff: 1.25 - 0.2 * u01(tt, DOUT, DOUT + 2), eyes: tt > t.fine - 0.2 && tt < t.fine + 0.4 ? 'happy' : blinkE(tt + 0.3), quack: tt > t.fine && tt < t.fine + 0.25 ? 1 : 0 };
      if (tt > TO) p.y = -50;   // (off-screen once the plane leaves; it flies to the terminal by itself)
    } else {   // END: flies in from the sky, lands behind the engine, plants itself in the exhaust: the blowout
      const behind = [PARK[0] + dX - 4.2, 2.55, EZ + 0.25];
      if (tt < DLAND2) { const u = u01(tt, DFLY0, DLAND2), A = [PARK[0] + dX + 15, 5.5, 3.0], M = [PARK[0] + dX + 9, 2.6, -0.2]; const O = [PARK[0] + dX + 0.5, 0.8, 1.4], G0 = PARK[0] + 9.0 + dX - 0.35, G2 = EZ + 0.4, q = K(tt, [[DFLY0, A], [DFLY0 + 0.45, [G0 + 0.2, 1.0, G2 + 0.45]], [DFLY0 + 0.6, [G0 + 0.45, 1.0, G2]], [DFLY0 + 0.75, [G0, 1.05, G2 - 0.45]], [DFLY0 + 0.9, [G0 - 0.45, 1.0, G2]], [DFLY0 + 1.05, [G0, 1.0, G2 + 0.45]], [DFLY0 + 1.5, [PARK[0] + dX + 4.5, 0.9, 1.0]], [DFLY0 + 1.75, O], [DLAND2, behind]]); /* r5: one loop round Gary's head on "the WHOLE TIME" */ p = { ...p, x: q[0], y: q[1], z: q[2], rotY: -PI / 2, flap: 1, fly: 1, scale: 1.3, eyes: 'happy', fluff: 0.5, quack: u > 0.4 && u < 0.5 ? 1 : 0 }; }
      else p = { ...p, x: behind[0] + 0.15 * Math.sin(tt * 3), y: behind[1] + 0.12 * Math.sin(tt * 5), z: behind[2], rotY: PI / 2, flap: 0.8, fly: 1, scale: 1.5, fluff: tt > POOF ? lerp(0.9, 1.5, easeOutBack(u01(tt, POOF, POOF + 0.3))) : 0.75 + 0.12 * Math.sin(tt * 20), eyes: 'happy' };
    }
    duck.set(p);
  }

  // ---------------------------------------------------------------- set dressing + props per frame
  const v3 = new THREE.Vector3();
  const OUTLET = [2.18, 1.05, D.back + 0.04];
  const cordRoute = (tt) => {   // outlet → down the wall → along the floor beside the plane's route → up to the dryer's handle
    eng.dryer.cordAnchor.updateWorldMatrix(true, false); const h = eng.dryer.cordAnchor.getWorldPosition(v3).toArray();
    const x0 = cpX(tt), pts = [OUTLET, [2.18, 0.03, -3.0], [2.4, 0.03, -1.7]];
    for (let x = 3.0; x < x0 - 0.2; x += 1.0) pts.push([x, 0.03, -1.65 + 0.08 * Math.sin(x * 3)]);
    pts.push([x0 - 0.1, 0.03, -1.4], [h[0] + 0.05, 0.25, h[2] - 0.25], h); return pts;
  };
  const eggSpot = (i) => [1.4 + (i % 7) * 0.32 + 0.1 * Math.sin(i * 7), 0.04, -0.2 - Math.floor(i / 7) * 0.28 + 0.1 * Math.cos(i * 3)];
  function propsAt(tt) {
    // cardboard plane
    if (tt < GO) cp.set({ x: cpX(tt), z: EZ, roll2: tt * 3, caster: tt > STG0 });
    else if (tt < SHRED) { const g = goPath(tt); cp.set({ x: g[0] + 1.75, y: g[1] - 1.15, z: EZ, pitch: 0.1 * Math.sin(u01(tt, GO, SHRED) * PI), char: u01(tt, GO, SHRED), caster: true }); }
    else { cp.set({ x: goPath(SHRED)[0] + 1.75, y: Math.max(0, goPath(SHRED)[1] - 1.15), z: EZ, shred: u01(tt, SHRED, SHRED + 1.4), char: 1 }); }
    cp.g.visible = tt < SHRED + 1.4;
    tank.set(smooth(u01(tt, POUR0 + 0.15, POUR1)) * (tt < PLUG ? 1 : tt < SNIP ? 0.85 : 0.7));
    // the jerry can: on the garage floor → in Gary's hands (tilted) → back down
    { const home = [cpX(t.burns) + 1.95, 0, 0.95]; if (tt > POUR0 - 0.4 && tt < POUR1 + 0.2) { gary.hand(1).updateWorldMatrix(true, false); const h = gary.hand(1).getWorldPosition(v3); can.g.position.set(h.x, h.y - 0.45, h.z + 0.1); can.g.rotation.set(0, 0, tt > POUR0 ? -1.1 : 0); } else { can.g.position.set(...home); can.g.rotation.set(0, 0.4, 0); } can.g.visible = tt > 18 && tt < GO; }
    // the cord: plugged in → yanked out (the plug flies along the route and bonks Gary) → hangs from the handle → snipped
    { const on = tt > 0 && tt < SNIP + 1.6 && tt < GO; cord.m.visible = on; cord.plug.visible = on;
      if (on) { let pts = cordRoute(Math.min(tt, ROLL1));
        if (tt < PLUG - 0.5) { cord.plug.position.set(...OUTLET); cord.plug.rotation.set(0, PI / 2, 0); }
        else if (tt < PLUG) { const u = u01(tt, PLUG - 0.5, PLUG), n = pts.length, k = Math.floor(u * (n - 3)); const head = pts.slice(k); gary.head.updateWorldMatrix(true, false); const gh = gary.head.getWorldPosition(new THREE.Vector3()); const tip = u > 0.85 ? [gh.x, gh.y + 0.3, gh.z] : head[0]; pts = [tip, ...head.slice(1)]; cord.plug.position.set(...tip); cord.plug.rotation.set(u * 9, u * 5, 0); }
        else if (tt < PLUG + 0.45) { gary.head.updateWorldMatrix(true, false); const gh = gary.head.getWorldPosition(new THREE.Vector3()); const q = hop(tt, PLUG, PLUG + 0.45, [gh.x, gh.y + 0.3, gh.z], [gh.x + 0.5, 0.06, gh.z + 1.3], 0.5); eng.dryer.cordAnchor.updateWorldMatrix(true, false); const h = eng.dryer.cordAnchor.getWorldPosition(new THREE.Vector3()); pts = [[h.x, h.y, h.z], [(h.x + q[0]) / 2, Math.max(q[1], 0.4), (h.z + q[2]) / 2], q]; cord.plug.position.set(...q); cord.plug.rotation.set(tt * 20, tt * 13, 0); }   // r4: bounces off the hat toward the lens
        else { eng.dryer.cordAnchor.updateWorldMatrix(true, false); const h = eng.dryer.cordAnchor.getWorldPosition(new THREE.Vector3()); const tail = tt < SNIP ? [h.x - 0.3, 0.03, h.z + 0.6] : [h.x + 0.2, 0.03, h.z + 0.8]; const end = [tail[0] - 2.2, 0.03, tail[2] + 0.4]; pts = tt < SNIP ? [[h.x, h.y, h.z], [h.x - 0.05, 0.3, h.z + 0.3], tail, end] : [[h.x + 0.2, 0.25, h.z + 0.5], [h.x + 0.1, 0.03, h.z + 0.6], tail, end]; cord.plug.position.set(...end); cord.plug.rotation.set(0, 0.3, PI / 2); }
        cord.update(pts); } }
    // toilet paper: the strip from the roll to Gary; the mummy wrap; unwinding into the intake
    { const g0 = SEATP(tt), wrapK = clamp(u01(tt, TP0 + 0.35, TP1)) * (1 - u01(tt, SUCK0, SUCK1)), turns = 14 * wrapK;
      const ang0 = tt > SUCK0 && tt < SUCK1 ? 26 * (tt - SUCK0) : 0;
      if (turns > 0.05) { const pts = []; const n = Math.max(2, Math.floor(turns * 14)); for (let i = 0; i < n; i++) { const u = i / 14, a = u * TAU + ang0, y = 0.28 + (u / 14) * 0.95 * 14 / 14 * (i / Math.max(1, n - 1)) * 0.0 + 0.22 + 0.8 * (i / (14 * 14)) * 14; pts.push([g0[0] + Math.cos(a) * 0.24, g0[1] + 0.35 + 0.78 * (i / (14 * 14)), g0[2] + Math.sin(a) * 0.24]); }
        tpWrap.update(pts, 0.05, () => [0, 1, 0]); tpWrap.m.visible = true; } else tpWrap.m.visible = false;
      let strip = null;
      if (tt > TP0 && tt < TP1) { const u = u01(tt, TP0, TP0 + 0.6), A = [D.hall.x0 - 0.18, 0.66, -2.9], Bp = [g0[0] - 0.1, 0.9, g0[2] + 0.25]; strip = []; for (let i = 0; i <= 30; i++) { const s = (i / 30) * u, x = lerp(A[0], Bp[0], s), y = lerp(A[1], Bp[1], s) + 0.35 * Math.sin(s * PI) + 0.06 * Math.sin(tt * 18 + i * 0.7), z = lerp(A[2], Bp[2], s); strip.push([x, y, z]); } }
      if (tt > SUCK0 && tt < SUCK1) { const A = [g0[0] - 0.05, 0.95, g0[2] - 0.1], Bp = [g0[0] - 0.75, 1.15, EZ]; strip = []; for (let i = 0; i <= 20; i++) { const s = i / 20; strip.push([lerp(A[0], Bp[0], s), lerp(A[1], Bp[1], s) + 0.05 * Math.sin(tt * 30 + i), lerp(A[2], Bp[2], s)]); } }
      if (strip) { tpStrip.update(strip, 0.05, () => [0, 0.2, 1]); tpStrip.m.visible = true; } else tpStrip.m.visible = false;
      S.tpRoll.scale.set(1, 1, 1); S.tpRoll.scale.setScalar(tt > TP0 ? lerp(1, 0.45, u01(tt, TP0, TP1)) : 1); S.tpRoll.rotation.y = tt > TP0 && tt < TP1 ? tt * 30 : 0; }
    // the spray storm: towels fly off the rail, the eggs blow away
    S.towels.forEach((tw, i) => { const a = tt - (SPRAY + 0.1 + i * 0.15); if (a < 0) { tw.position.set(0.85 + i * 0.5, 1.45, D.back + 0.06); tw.rotation.set(0, 0, 0); return; } const q = hop(Math.min(a, 1.1), 0, 1.1, [0.85 + i * 0.5, 1.45, D.back + 0.06], [2.3 + i * 0.6, 0.03, -1.6 - i * 0.6], 0.6); tw.position.set(...q); tw.rotation.set(Math.min(1, a) * (PI / 2), a * 2, 0); });
    eggOne.visible = tt > EGG1 && tt < SPRAY + 0.3; if (eggOne.visible) { const s0 = easeOutBack(u01(tt, EGG1, EGG1 + 0.25)); eggOne.scale.set(s0, 1.3 * s0, s0); eggOne.position.set(cpX(tt) + 0.42, 0.6, EZ + 0.62); if (tt > SPRAY) eggOne.position.x += (tt - SPRAY) * 3; }
    { const C0 = [PARK[0] - 6.5 + dX, 0, EZ - 0.45]; eggCart.position.set(...C0); eggCart.scale.setScalar(2); eggCart.visible = false; }   // r5b: the avalanche IS the egg payoff (the cart appeared with no setup)
    { aval.visible = tt > t.millionE - 0.2; if (aval.visible) { const L0 = [PARK[0] + 9.0 + dX, EZ + 0.4]; AV.forEach((e, i) => { const a = Math.max(0, tt - (t.millionE - 0.25 + e.d)), fall = Math.sqrt(2 * e.h / 9.8), landed = a >= fall, y = landed ? e.y + 0.12 * Math.abs(Math.sin((a - fall) * 14)) * Math.exp(-(a - fall) * 6) : e.y + e.h - 4.9 * a * a; _ap.set(L0[0] + e.x, a > 0 ? y : -5, L0[1] + e.z); _aq.setFromEuler(_ae.set(e.s + (landed ? 0 : a * 6), e.s * 0.7, 0)); _am.compose(_ap, _aq, _as); aval.setMatrixAt(i, _am); }); aval.instanceMatrix.needsUpdate = true; } }
    { flame.visible = tt > BLAST - 0.08 && tt < BLAST + 0.32; if (flame.visible) { const p0 = at(tt, -1.45, 0, -0.05), u = u01(tt, BLAST - 0.08, BLAST + 0.05); flame.position.set(p0[0], p0[1], p0[2] + 0.05); flame.scale.set(0.2 + 0.8 * u, 1 + 0.15 * Math.sin(tt * 60), 1 + 0.15 * Math.cos(tt * 55)); } S.heater.visible = !(tt > t.garyB - 0.9 && tt < BLAST + 0.9); }
    { const s0 = BLOB, s1 = t.slowly + 0.1, s2 = s1 + 0.6; blob.visible = tt > s0 && tt < s2; if (blob.visible) { const ex0 = at(tt, -1.3, 0, 0); if (tt < s1) { const u = smooth(u01(tt, s0, s1)); blob.position.set(ex0[0] - 0.2 * u, ex0[1] - 0.2 * u, ex0[2] + 0.1); blob.scale.set(0.4 + 1.3 * u, 0.4 + 1.0 * u, 0.4 + 1.1 * u); } else { const u = u01(tt, s1, s2), y = Math.max(0.3, ex0[1] - 0.2 - 4.9 * (u * 0.6) ** 2), sq = y <= 0.31 ? 1 : 0; blob.position.set(ex0[0] - 0.2 - 0.1 * u, y, ex0[2] + 0.1); blob.scale.set(1.5 + 0.5 * sq, 1.2 - 0.6 * sq, 1.3 + 0.5 * sq); } } }
    if (false) { eggs.forEach((e, i) => { const P0 = EGGPILE[i]; if (!P0) { e.visible = false; return; } e.visible = true; const a = Math.max(0, tt - EGGBLOW - (i % 5) * 0.03), base = [eggCart.position.x + 2 * P0[0], 2 * P0[1], eggCart.position.z + 2 * P0[2]]; e.position.set(base[0] - a * (6 + (i % 4)), Math.max(0.12, base[1] + a * (1.5 + (i % 3) * 0.5) - 4.9 * a * a), base[2] + a * ((i % 3) - 1) * 1.2); e.rotation.set(a * 9, 0, a * 7); e.scale.set(2, 2.6, 2); }); }
    else eggs.forEach((e, i) => { const sp = eggSpot(i), a = tt - (EGGS + i * 0.012); e.visible = a > 0 && tt < SPRAY + 1.2; if (!e.visible) return; const fl = tt > SPRAY ? tt - SPRAY : 0;
      if (a < 0.6) { const q = hop(a, 0, 0.6, [2.5, 1.0, EZ], sp, 0.6); e.position.set(...q); } else e.position.set(sp[0] + fl * (1.5 + (i % 3)), sp[1] + (fl > 0 ? 0.04 : 0), sp[2] + fl * (i % 2 ? 1 : -1) * 0.8); e.rotation.set(fl * 9, 0, fl * 6); });

    // the box fan frame loses its blade; the roll-up door; the fence panel; the stand's hanger
    S.setRollDoor(smooth(u01(tt, DOOR0, DOOR1)));
    S.setHangarDoors(smooth(u01(tt, t.add - 0.3, t.add + 0.9)));   // r5: HANGAR 1 rolls open on "a giant fan up front"
    air.farEng.visible = tt < STOP;   // (its plain far engine read as a cowl behind the roll call)
    S.setFence(smooth(u01(tt, FENCE - 0.05, FENCE + 0.25)));
    { const topY = tt < NAC0 ? D.stand.y + 0.52 : D.stand.y + E.RN + 0.05; S.setHanger(tt > CATCH - 0.05 && tt < LIFT0 + 0.15 ? topY : 9); S.hanger.visible = tt > CATCH - 0.3 && tt < LIFT0 + 0.15; }
    S.boardFace.visible = true; S.boothGlass.visible = !(tt > t.rattle - 0.4 && tt < W('fan', 'out') + 0.3); S.boothGlass.position.y = 1.71 + (tt > RUN && tt < OUT0 ? 0.012 * Math.sin(tt * 90) : 0); S.boothGlass.rotation.z = tt > RUN && tt < OUT0 ? 0.01 * Math.sin(tt * 77) : 0;
    // the stand's ladder (dressing beside the stand until Gary uses it)
    ladder.position.set(tt > LAD0 && tt < FILM0 + 1.2 ? D.stand.x + 0.25 : D.stand.x - 2.4, 0, tt > LAD0 && tt < FILM0 + 1.2 ? 0.35 : 2.4); ladder.rotation.y = tt > LAD0 && tt < FILM0 + 1.2 ? 0 : 0.6; ladder.visible = tt > GO;
    // the forklift
    { const f = forkAt(tt); fork.set(f); fork.g.visible = tt > CATCH + 0.6 && tt < TO + 2; cradle.visible = tt > LIFT0 - 0.1 && tt < BOLT + 0.4; }
    // the bird cannon: rolls in from the right in front of the intake; the jelly bird in the breech → fired → through → SPLAT
    { const home = [D.stand.x + 12.5, 0, 1.6], spot = [D.stand.x + 6.3, 0, EZ]; const u = smooth(u01(tt, CAN0, CAN1)); cannon.g.position.set(lerp(home[0], spot[0], u), 0, lerp(home[2], spot[2], u)); cannon.g.rotation.y = PI + lerp(0.5, 0, u); cannon.g.visible = tt > GO && tt < FORK0;
      cannon.g.position.x += tt > FIRE && tt < FIRE + 0.4 ? 0.25 * Math.exp(-(tt - FIRE) * 10) : 0;
      const mz = new THREE.Vector3(spot[0] - 1.8 + 0.3, 1.2, EZ); let jp = null;
      if (tt > CAN1 - 0.2 && tt < HOPJ) jp = [spot[0] + 2.3, 0.72 + 0.03 * Math.sin(tt * 9), 1.6];
      else if (tt >= HOPJ && tt < FIRE - 0.12) jp = tt < HOPJ + 0.4 ? hop(tt, HOPJ, HOPJ + 0.4, [spot[0] + 2.3, 0.72, 1.6], [spot[0] + 1.8, 1.62, EZ], 0.5) : [spot[0] + 1.8, 1.62, EZ];   // on top of the gun's tank
      else if (tt >= FIRE && tt < JIN) jp = [lerp(spot[0] - 1.6, D.stand.x + E.bigFanX + 0.3, u01(tt, FIRE, JIN)), lerp(1.2, D.stand.y - 1.1, u01(tt, FIRE, JIN)), EZ - 0.1];
      else if (tt >= JIN && tt < JOUT) jp = [lerp(D.stand.x + E.bigFanX, D.stand.x + E.nac[1] - 0.4, u01(tt, JIN, JOUT)), D.stand.y - 1.15, EZ - 0.25];
      else if (tt >= JOUT && tt < SPLAT) jp = hop(tt, JOUT, SPLAT, [D.stand.x + E.nac[1] - 0.6, D.stand.y - 1.15, EZ - 0.2], [GBACK[0] + 0.1, 1.5, GBACK[2] + 0.1], 0.3);
      jelly.g.visible = !!jp; if (jp) { jelly.g.position.set(...jp); jelly.g.rotation.y = tt < FIRE ? PI / 2 : -PI / 2; jelly.set(tt, tt < SPLAT ? 1 : 0.4); } }
    // the cloud deck only exists for the flight (from the ground the sky stays blue)
    S.deck.visible = tt > LIFTOFF - 0.5 && tt < TOUCH + 0.6;
  }

  // ---------------------------------------------------------------- the engine + airliner per frame
  function engineAt(tt) {
    const st = engAt(tt), pl = engPlace(tt);
    eng.set(st);
    if (pl.onPlane) { if (eng.g.parent !== air.engineMount) air.engineMount.add(eng.g); eng.g.position.set(0, 0, 0); eng.g.rotation.set(0, 0, 0); }
    else { if (eng.g.parent !== scene) scene.add(eng.g); eng.g.position.set(...pl.p); eng.g.rotation.set(0, 0, pl.rz ?? 0); }
    eng.updateClip();
    // airflow arrows (local): the open duct, the core, the bypass (10:1), the reverser
    const runCore = tt > ONEWAY && tt < PLUG ? 1 : tt > IGN2 + 0.4 && tt < GO ? 1 : 0;
    ductArrows.update(tt, tt > ONEWAY && tt < PLUG && tt < STG0 + 0.5 ? 0.9 : 0); coreArrows.update(tt, (tt > STG0 + 0.5 && tt < PLUG) || (tt > IGN2 + 0.4 && tt < GO) || (tt > t.around - 0.2 && tt < t.through + 0.6) ? 0.9 : 0);
    bypassArrows.update(tt, tt > t.around - 0.3 && tt < t.quieter + 0.4 ? 0.95 : 0); revArrows.update(tt, tt > t.flip && tt < STOP ? 0.95 : 0); revArrows2.update(tt, tt > t.flip && tt < STOP ? 0.95 : 0);
    const pp = planePose(tt); air.set({ x: pp.x, y: pp.y, z: pp.z, pitch: pp.pitch, gear: pp.gear });
    pilot.set({ x: 0, y: -0.2, z: 0, rotY: PI / 2 - 0.95, legL: { x: -1.5, kn: 1.45 }, legR: { x: -1.5, kn: 1.45 }, armR: { x: -1.0, z: 0.2, el: 0.7 }, armL: { x: -1.0, z: 0.2, el: 0.7 }, mouth: tt > t.landing - 0.1 && tt < STOP + 1 ? 'scream' : 'smile', eyes: tt > t.landing - 0.1 && tt < STOP + 1 ? 'wide' : blinkE(tt + 1.3), armR: tt > t.landing && tt < STOP ? { x: -2.6, z: 0.6, el: 0.2 } : { x: -1.0, z: 0.2, el: 0.7 }, t: tt });
  }

  // the £5 note: in Gary's hand on 'five' → sucked into the intake on 'renewal' (after garyAt: it reads his posed hand)
  function fiverAt(tt) {
    { const h = gary.hand ? gary.hand(-1) : null;   /* the near-side hand */ fiver.visible = tt > t.five - 0.35 && tt < t.renewal + 0.42 && !!h; if (fiver.visible) { h.updateWorldMatrix(true, false); const hp = new THREE.Vector3().setFromMatrixPosition(h.matrixWorld), ip = new THREE.Vector3(cpX(tt) - 1.75 + 2.05, 1.15, EZ), u = smooth(u01(tt, t.renewal - 0.02, t.renewal + 0.38)); fiver.position.lerpVectors(hp, ip, u); fiver.position.y += 0.1 * (1 - u) + 0.55 * Math.sin(PI * u); fiver.rotation.set(-0.2 + u * 5, u * 3, 0.15 + u * 2.5); fiver.scale.setScalar(1 - 0.75 * u);   /* r4: 2× cream note, a 0.4 s arc into the intake */ } }
  }

  function update(tt) {
    const m = moodAt(tt); S.setMood(m[0], m[1], m[2]);
    engineAt(tt); propsAt(tt); garyAt(tt); duckAt(tt);
    fiverAt(tt);
    const cam = camAt(tt);
    // inside the cloud layer: a white-out (fog) while the camera passes through
    const cy = cam.pos[1], cwin = (a) => smooth(u01(tt, a - 0.4, a)) * (1 - smooth(u01(tt, a + 0.1, a + 0.5))), inCloud = S.deck.visible ? Math.max(cwin(TELE), cwin(CLOUD_IN)) : 0;
    S.deck.visible = S.deck.visible && cy > D.cloudY - 25;
    if (inCloud > 0.01) S.setMood(m[2] < 0.5 ? m[0] : m[1], 'cloud', 0.72 * smooth(inCloud));
    S.hangar.visible = cy < 15; S.beaconM.emissiveIntensity = 0.9 + 1.4 * Math.max(0, Math.sin(tt * 9));   // r4: its door read as a black slab from the descent
    { const gp = gary.root.position; gary.root.visible = Math.hypot(cam.pos[0] - gp.x, cam.pos[1] - gp.y - 0.9, cam.pos[2] - gp.z) > 0.9; }   // r4: never through the lens (44.05)
    { const dl = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]); studio.camera.near = clamp(0.02 * dl, 0.05, 0.5); }
    studio.setCamera(cam.pos, cam.look, cam.fov * (1 - pushAt(tt)), tt, 0);
    kickR.apply(studio.camera, tt, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]));
    S.update(tt);
    studio.fill.intensity = 0.55; studio.fill.distance = 8;
    S.aimSun(cam.look[0], Math.max(0, cam.look[1]), cam.look[2], Math.max(8, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.8));
    fx.update(tt, studio.camera);
  }

  // QC (`node tools/render.mjs 041-hair-dryer-jet-engine --qc`): faces (Gary, the duck) under the caption/callouts + turbo counts + camera samples
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, head, up] of [['Gary', gary.head, 0], ['Gary\'s hat', gary.head, 0.3], ['the duck', duck.head, 0]]) {
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
    const CS = []; for (let tt = 0; tt < END; tt += 0.1) { const c = camAt(tt), m = moodAt(tt); CS.push([+tt.toFixed(1), ...c.pos.map((x) => +x.toFixed(2)), ...c.look.map((x) => +x.toFixed(2)), +c.fov.toFixed(1), m[2] < 0.5 ? m[0] : m[1]]); }
    out.push('cams: ' + JSON.stringify(CS));
    update(0); return out;
  };
  window.EDSTUDIO_COUNTS = { framings: Fr.length, kicks: KM2.length };
  update(0);
  return { update };
}
