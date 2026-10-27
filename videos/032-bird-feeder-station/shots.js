// 032 — "How a Bird Feeder Becomes a Space Station" (build genre, docs/BUILD.md). ONE continuous camera take: a sunny backyard on
// top of a toy planet (engine/build/station.js), a rocket chase up through the cloud deck to orbit, then a space station built
// as a dollhouse cutaway (vertical modules sliced by z = D.zc) above the backyard, and a dive back down with the one burning seed.
// Everything is keyed to the spoken word: Wd(beat, word) (story.json from tools/narrate.py), so re-voicing keeps every gag on it.
// Continuity: the feeder goes pole → rocket → Gary's hands → bolted on top of M1 (it leaks seeds into space to the end); the
// squirrel is in every beat (feeder thief → baffle → branch → Gary's face → rocket fin → helmet → feeder → hatch → mudroom →
// recycler → treadmill captain); Gary rides in the rocket's cockpit bubble, exits in orbit, is squished in the doorway, blown
// out of the side hatch on a tether, swatted by a solar panel, turns blue, drinks the coffee blob, and plugs the hole to the end.
// Physics: things fall in the yard (g); in orbit nothing falls (seeds, coffee, confetti and money drift — "falling around").
//
// Facts (web-searched Oct 27 2026):
//   17,500 mph, ~250 mi up; 16 orbits = 16 sunrises/sunsets a day (NASA "Space Station Facts and Figures").
//   Solar array wingspan 356 ft (109 m) = one yard shy of a 360 ft football field incl. end zones (NASA Facts and Figures).
//   98 % total water recovery (June 2023, Brine Processor Assembly; urine + sweat + breath humidity are processed into clean
//     water — NASA: "the crew is not drinking urine") (NASA "Water Recovery Milestone").
//   Universal Waste Management System toilet: $23 M (Smithsonian 2020; NASA "Boldly Go!").
//   Cost: "over $100 billion", the most expensive man-made object (Guinness World Records; NASA OIG 2009 ≈ $100 B+ with partners).
//   Whipple shield: Fred Whipple, 1947 — a thin bumper ahead of the wall shatters/vaporizes the impactor (NASA NTRS 20100006702);
//     orbital debris closing speeds ≈ 7–15 km/s; a paint fleck / metal fragment chipped a Cupola window in 2016 (ESA "Impact chip").
//   Squirrels jump up to 10 ft (UF/IFAS); feeder advice: 5 ft up, 10 ft from anything they can leap from (Nebraska Extension G1924).
import * as THREE from 'three';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, drop, squash, wobble, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeDizzy, makeArrows } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildWorld, buildYard, buildStation, makeFeeder, makeRocket, makeSquirrel, makeSongbird, makeHelmet, makeBackpack, makeBlob, makeTreadmill, makeToilet, D, ST } from '@engine/build/station.js';

const PI = Math.PI;
const LP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const arcP = (a, b, u, h) => { const p = LP(a, b, u); p[1] += 4 * h * u * (1 - u); return p; };
const bez3 = (a, b, c, d, u) => { const v = 1 - u; return [0, 1, 2].map((k) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]); };
const bez3d = (a, b, c, d, u) => { const v = 1 - u; return [0, 1, 2].map((k) => 3 * v * v * (b[k] - a[k]) + 6 * v * u * (c[k] - b[k]) + 3 * u * u * (d[k] - c[k])); };
const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
const P = ST;   // station-local → world

export async function build(studio, story) {
  const W = await buildWorld(studio), Y = await buildYard(W.root), S = await buildStation(W.root), scene = W.root;
  const B = beatClock(story), Wd = (b, w, n) => B.W(b, w, n), END = story.duration;
  const fx = makeFX(scene);
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const font = (px) => `${px}px "Luckiest Guy", Arial Black`;

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    squirrels: Wd('hook', 'squirrels'), robbing: Wd('hook', 'robbing'), feeder0: Wd('hook', 'feeder'), so0: Wd('hook', 'so'), hang: Wd('hook', 'hang'), higher: Wd('hook', 'higher'),
    c0: Wd('congrats', 'congratulations'), built: Wd('congrats', 'built'), station0: Wd('congrats', 'restaurant'), cq: Wd('congrats', 'squirrel'), gave: Wd('congrats', 'got'), five: Wd('congrats', 'five'), stars: Wd('congrats', 'stars'),
    bso: Wd('baffle', 'so'), put: Wd('baffle', 'put'), metal: Wd('baffle', 'metal'), cone: Wd('baffle', 'cone'), pole: Wd('baffle', 'pole'), bthis: Wd('baffle', 'this'), baffle: Wd('baffle', 'baffle'), bsq2: Wd('baffle', 'squirrel', 2), not: Wd('baffle', 'not'), baffled: Wd('baffle', 'baffled'),
    jit: Wd('jump', 'it'), jumps: Wd('jump', 'jumps'), ten: Wd('jump', 'ten'), feet: Wd('jump', 'feet'), off: Wd('jump', 'off'), tree: Wd('jump', 'tree'), using: Wd('jump', 'using'), face: Wd('jump', 'face'), step: Wd('jump', 'step'),
    rso: Wd('rocket', 'so'), strap: Wd('rocket', 'strap'), rfeed: Wd('rocket', 'feeder'), rocket: Wd('rocket', 'rocket'), goes: Wd('rocket', 'goes'), up: Wd('rocket', 'up'), rand: Wd('rocket', 'and'), back: Wd('rocket', 'back'), down: Wd('rocket', 'down'), rgary: Wd('rocket', 'gary'),
    oso: Wd('orbit', 'so'), sideways: Wd('orbit', 'sideways'), really: Wd('orbit', 'really'), fast: Wd('orbit', 'fast'), n17: Wd('orbit', '17500'), miles: Wd('orbit', 'miles'), hour: Wd('orbit', 'hour'), falls: Wd('orbit', 'falls'), keeps: Wd('orbit', 'keeps'), missing: Wd('orbit', 'missing'), earth: Wd('orbit', 'earth'), ocalled: Wd('orbit', 'called'), orbit: Wd('orbit', 'orbit'),
    fgary: Wd('float', 'gary'), floats: Wd('float', 'floats'), falling: Wd('float', 'falling'), too: Wd('float', 'too'), fso: Wd('float', 'so'), fsq: Wd('float', 'squirrel'),
    dfeed: Wd('dock', 'feeder'), tiny: Wd('dock', 'tiny'), dso: Wd('dock', 'so'), launch: Wd('dock', 'launch'), rooms: Wd('dock', 'rooms'), bolt: Wd('dock', 'bolt'), don: Wd('dock', 'on'), docking: Wd('dock', 'docking'), dgary: Wd('dock', 'gary'), doorway: Wd('dock', 'doorway'),
    dthen: Wd('dark', 'then'), dark: Wd('dark', 'dark'), sixteen: Wd('dark', 'sixteen'), sunsets: Wd('dark', 'sunsets'), day: Wd('dark', 'day'), power: Wd('dark', 'power'), kgary: Wd('dark', 'gary'), opens: Wd('dark', 'opens'), hatch: Wd('dark', 'hatch'), fix: Wd('dark', 'fix'), kair: Wd('dark', 'air'), leaves: Wd('dark', 'leaves'), him: Wd('dark', 'him'),
    aso: Wd('airlock', 'so'), room: Wd('airlock', 'room'), empties: Wd('airlock', 'empties'), first: Wd('airlock', 'first'), airlock: Wd('airlock', 'airlock'), mudroom: Wd('airlock', 'mudroom'), aspace: Wd('airlock', 'space'),
    outside: Wd('solar', 'outside'), unfolds: Wd('solar', 'unfolds'), wings: Wd('solar', 'wings'), yard: Wd('solar', 'yard'), football: Wd('solar', 'football'), field: Wd('solar', 'field'), array: Wd('solar', 'array'), sit: Wd('solar', 'it'), swatted: Wd('solar', 'swatted'), shim: Wd('solar', 'him'),
    inside: Wd('air', 'inside'), igary: Wd('air', 'garys'), blue: Wd('air', 'blue'), ibreath: Wd('air', 'breath'), iso: Wd('air', 'so'), machines: Wd('air', 'machines'), clean: Wd('air', 'clean'), iair: Wd('air', 'air'), recycle: Wd('air', 'recycle'), water: Wd('air', 'water'), life: Wd('air', 'life'), support: Wd('air', 'support'),
    sweat: Wd('water', 'sweat'), wbreath: Wd('water', 'breath'), even: Wd('water', 'even'), pee: Wd('water', 'pee'), n98: Wd('water', '98'), comes: Wd('water', 'comes'), wback: Wd('water', 'back'), yesterdays: Wd('water', 'yesterdays'), c1: Wd('water', 'coffee'), todays: Wd('water', 'todays'), c2: Wd('water', 'coffee', 2),
    hthen: Wd('hit', 'then'), fleck: Wd('hit', 'fleck'), hits: Wd('hit', 'hits'), hten: Wd('hit', 'ten'), second: Wd('hit', 'second'), hgary: Wd('hit', 'gary'), now: Wd('hit', 'now'), plug: Wd('hit', 'plug'),
    wso: Wd('whipple', 'so'), whang: Wd('whipple', 'hang'), thin: Wd('whipple', 'thin'), sheet: Wd('whipple', 'sheet'), vest: Wd('whipple', 'vest'), wall: Wd('whipple', 'wall'), blows: Wd('whipple', 'turns'), whits: Wd('whipple', 'hits'), vapor: Wd('whipple', 'vapor'), whipple: Wd('whipple', 'whipple'), shield: Wd('whipple', 'shield'), bulletproof: Wd('whipple', 'bulletproof'), tinfoil: Wd('whipple', 'tinfoil'),
    fadd: Wd('finish', 'add'), n23: Wd('finish', '23'), toilet: Wd('finish', 'toilet'), treadmill: Wd('finish', 'treadmill'), bungee: Wd('finish', 'bungee'), cords: Wd('finish', 'cords'), window: Wd('finish', 'window'), backyard: Wd('finish', 'backyard'),
    e0: Wd('end', 'congratulations'), est: Wd('end', 'station'), eyou: Wd('end', 'you'), wanted: Wd('end', 'wanted'), feed: Wd('end', 'feed'), ebirds: Wd('end', 'birds'), enow: Wd('end', 'now'), spent: Wd('end', 'spent'), hundred: Wd('end', 'hundred'), billion: Wd('end', 'billion'),
    esq: Wd('end', 'squirrel'), runs: Wd('end', 'runs'), place: Wd('end', 'place'), egary: Wd('end', 'gary'), still: Wd('end', 'still'), eplug: Wd('end', 'plug'),
    e2birds: Wd('end2', 'birds'), got: Wd('end2', 'got'), one: Wd('end2', 'one'), seed: Wd('end2', 'seed'), e2it: Wd('end2', 'it'), fire: Wd('end2', 'fire'),
  };
  // derived event times
  const POLE_UP = t.higher - 0.05;                       // the telescoping pole shoots up
  const poleH = (tt) => (tt < t.rso ? lerp(1.0, 2.0, Math.min(1.12, pop(tt, POLE_UP - 0.05, 0.3))) : lerp(2.0, 1.0, smooth(u01(tt, t.rso, t.rso + 0.4))));   // …and back down on "so" so Gary can reach the feeder
  const CONE = t.cone - 0.05, BONK = t.bthis + 0.1, SLID = BONK + 0.45, ZIP0 = t.baffle + 0.45, ON_BRANCH = t.not - 0.05;   // dazed under the TERM, then the zip to the oak
  const LEAP = t.tree, FACE = t.face, STEP = t.step, ON_FEEDER = STEP + 0.45;
  const GRAB = t.rfeed - 0.05, TAPED = t.rocket + 0.1, IGN1 = t.goes - 0.1, APEX = t.up + 0.55, FLIP0 = APEX - 0.1, FALL0 = APEX + 0.25, IMPACT = t.rgary;
  const POPOUT = t.oso + 0.12, UPRIGHT = POPOUT + 0.45, INCOCKPIT = UPRIGHT + 0.25, IGN2 = Math.max(t.sideways, INCOCKPIT + 0.2), ORBIT_IN = t.n17 + 0.4, COAST1 = t.fgary - 0.1;
  const EXIT = t.fgary - 0.05, SQ_LET = t.fso - 0.25;
  const DOCK_T = [0, t.docking, t.docking + 0.32, t.docking + 0.64, t.docking + 0.96];   // M2..M5 arrive one after another (each a CLUNK)
  const PUSH = t.tiny + 0.2, M1_IN0 = t.launch - 0.35, M1_IN1 = t.rooms + 0.45, BOLT1 = t.bolt, BOLT2 = t.don, DIVE = t.don + 0.35, M2_IN0 = t.docking - 1.1, M2_CAP = t.docking, LATCH = t.doorway;
  const SUNSET0 = t.dthen - 0.1, SUNSET1 = t.dark + 0.1, SWEEP0 = t.sixteen - 0.05, SWEEP1 = t.day + 0.3, LIGHTS_OFF = t.dark, WHOOSH = t.kair - 0.05, HATCH_OPEN = WHOOSH - 0.08, TAUT = t.him + 0.05;
  const HAUL0 = t.aso - 0.1, HAUL1 = t.room + 0.15, AL_IN0 = t.aso - 0.2, AL_DOCK = t.first, INTO_AL = t.airlock - 0.6, WIPE = t.mudroom - 0.1;
  const OUT0 = t.outside - 0.1, AT_ROOT = t.unfolds - 0.05, UNF0 = t.unfolds, UNF1 = t.field + 0.25, SUNRISE0 = t.outside + 0.3, SUNRISE1 = t.wings + 0.6, POWER_ON = t.array, SWAT = t.swatted;
  const BLUE0 = t.blue - 0.2, SCRUB = t.machines - 0.05, RECYC = t.recycle - 0.05, PINK = t.water + 0.2;
  const PEE_IN = t.pee + 0.15, GAUGE0 = t.n98 - 0.1, GAUGE1 = t.wback, POUR = t.yesterdays - 0.05, SIP = t.todays - 0.1, GULP = t.c2;
  const HIT = t.hits, SUCK0 = t.hgary - 0.3, PLUG = t.plug, SHIELD = t.sheet - 0.1, HIT2 = t.vapor - 0.12;
  const TOILET = t.n23 - 0.05, TREAD = t.treadmill - 0.05, CUPOLA = t.window - 0.05;
  const SEED_OUT = t.e2birds, SEED0 = t.got - 0.1, LAND = t.fire - 0.04;
  const W0 = t.outside - 0.35, W1 = t.blue - 0.1;   // the wing ride + the fling back inside (a follow-cam between rail-2 frames)
  const NW = D.wing.n, PW = D.wing.pw, ROOTX = D.truss.half + 0.2;
  const unfoldK = (tt) => smooth(u01(tt, UNF0, UNF1));
  const tipX = (k) => ROOTX + 0.6 + (NW - 1) * PW * k;   // the outer edge of the second-to-last panel (the last one stays folded back)
  const MT = D.mtop, ML = D.mlen;   // the stack (engine/build/station.js): M1 HAB, M2 LIFE SUPPORT, M3 GALLEY, M4 LAB (the hole), M5 WC
  const G2 = P(0.05, MT[1] - 2.85, 0.3), G3 = P(-0.35, MT[2] - 3.5, 0.35), HOLE = P(D.hole[0], D.hole[1] - 0.47, -1.25 + 0.2);   // Gary's spots (root): life support, galley, the plug
  const FLING = [[0, null], [0.7, P(4.95, -3.3, 0.3)], [0.95, P(1.3, -3.1, 0.2)], [1.12, P(0, MT[1] + 0.25, 0.2)], [1.3, P(-0.65, MT[1] - 2.0, 0.25)]];   // the swat flings him back through the airlock, down the hatch into M2
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const gHelmet = makeHelmet(0.47); gary.head.add(gHelmet); gHelmet.position.set(0, 0.08, 0.01);
  const gPack = makeBackpack(); gary.head.parent.parent.add(gPack); gPack.position.set(0, 0.2, -0.24);
  const sq = makeSquirrel(); scene.add(sq.root);
  const dizzy = makeDizzy(scene), sqDizzy = makeDizzy(scene, { r: 0.16, size: 0.05 });
  const feeder = makeFeeder(); scene.add(feeder.g);
  const rocket = await makeRocket(); scene.add(rocket.g);
  // the cockpit bubble Gary rides in (his head in a glass dome on the rocket's face)
  const domeHinge = new THREE.Group(); rocket.body.add(domeHinge); domeHinge.position.set(0, 2.65, 0.4);   // a canopy hinged at its top edge
  const dome = new THREE.Group(); domeHinge.add(dome); dome.position.set(0, -0.4, -0.04);
  mk(new THREE.SphereGeometry(0.4, 28, 18, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ color: 0xe6f4ff, roughness: 0.04, transparent: true, opacity: 0.2, depthWrite: false }), dome).rotation.x = PI / 2;
  mk(new THREE.TorusGeometry(0.4, 0.04, 8, 28), mat(0x3a3f48, 0.4, { metalness: 0.5 }), dome);
  const tape = [0, 1].map((k) => { const b = mk(new THREE.CylinderGeometry(0.435, 0.435, 0.07, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide }), rocket.body, 0, 1.18 + k * 0.42, 0); return b; });
  const birdLooks = [{ body: 0xd9322b, wing: 0xb42620, crest: true, mask: true }, { body: 0x3f7fd6, belly: 0xeeeeee, wing: 0x2f5fa6, crest: true }, { body: 0xf2d23a, wing: 0x333333, beak: 0xe8b060 }, { body: 0x9a9a9a, belly: 0xf0ede6, wing: 0x6f6f6f, cap: 0x1a1a1a }];
  const birds = birdLooks.map((o) => { const b = makeSongbird(o); scene.add(b.root); return b; });
  const BIRD_X = [1.55, 2.15, 2.75, 3.35];
  const card = new THREE.Group(); scene.add(card);   // the squirrel's 5-star review card
  { const ct = tex(256, 128, (c, w, h) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#333'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); for (let k = 0; k < 5; k++) { const cx = 30 + k * 49, cy = h / 2; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2 - PI / 2, r = i % 2 ? 9 : 21; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fillStyle = '#ffc21a'; c.fill(); c.strokeStyle = '#b07a00'; c.lineWidth = 2; c.stroke(); } });
    mk(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.7, side: THREE.DoubleSide }), card).castShadow = false; }
  const measure = Array.from({ length: 12 }, () => { const d = mk(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffd23f, emissiveIntensity: 0.7 }), scene); d.castShadow = false; return d; });   // the dotted 10-ft arc
  const crater = new THREE.Group(); scene.add(crater); crater.position.set(1.85, 0.005, -0.95);
  mk(new THREE.CircleGeometry(0.75, 28), mat(0x3e2a1a, 1), crater).rotation.x = -PI / 2;
  { const rim = mk(new THREE.TorusGeometry(0.82, 0.16, 8, 28), mat(0x6b4a2e, 1), crater, 0, 0.02, 0); rim.rotation.x = PI / 2; rim.scale.set(1, 1, 0.55); }
  crater.visible = false;
  // tether (Gary outside): a tube on a bezier, rebuilt per frame
  const tetherM = mat(0xf2f2ee, 0.6); let tether = null;
  const setTether = (a, b, slack) => { if (tether) { scene.remove(tether); tether.geometry.dispose(); tether = null; } if (!a) return; const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), M = A.clone().lerp(Bv, 0.5).add(new THREE.Vector3(0, -slack * 0.6, slack * 0.35));
    tether = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, M, Bv), 24, 0.018, 6, false), tetherM); tether.castShadow = false; scene.add(tether); };
  // life support: the CO2 scrubber (M1 back wall, upper left) + the water recycler (lower right) with a gauge and a coffee tap
  const SCR = P(-0.45, MT[1] - 1.3, -1.25 + 0.17), REC = P(0.55, MT[1] - 3.0, -1.25 + 0.19);   // both in M2 (life support)
  const scrub = new THREE.Group(); scene.add(scrub); scrub.position.set(...SCR);
  mk(new THREE.BoxGeometry(0.78, 0.66, 0.34), mat(0xdedcd4, 0.5), scrub);
  const fan = new THREE.Group(); scrub.add(fan); fan.position.set(-0.12, 0, 0.18);
  mk(new THREE.TorusGeometry(0.2, 0.025, 8, 24), mat(0x3a3f48, 0.4), fan); for (let k = 0; k < 4; k++) { const b = mk(new THREE.BoxGeometry(0.34, 0.06, 0.01), mat(0x6a707a, 0.4), fan); b.rotation.z = (k * PI) / 4; }
  mk(new THREE.PlaneGeometry(0.22, 0.12), new THREE.MeshStandardMaterial({ map: tex(128, 64, (c, w, h) => { c.fillStyle = '#2b2f36'; c.fillRect(0, 0, w, h); c.font = font(44); c.fillStyle = '#7dff9a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CO2', w / 2, h / 2 + 4); }), emissive: 0x2a6a3a, emissiveIntensity: 0.6 }), scrub, 0.24, 0.12, 0.175);
  const scrubLed = mk(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshStandardMaterial({ color: 0x58ff7a, emissive: 0x58ff7a, emissiveIntensity: 1.5 }), scrub, 0.24, -0.12, 0.18);
  const recyc = new THREE.Group(); scene.add(recyc); recyc.position.set(...REC);
  mk(new THREE.BoxGeometry(0.86, 0.74, 0.38), mat(0xd6d9de, 0.5), recyc);
  const gaugeT = tex(256, 256, (c, w, h) => { c.fillStyle = '#fffdf6'; c.beginPath(); c.arc(w / 2, h / 2, 120, 0, 7); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 8; c.stroke(); c.font = font(36); c.fillStyle = '#222'; c.textAlign = 'center'; c.fillText('98%', w / 2, h * 0.78); for (let k = 0; k <= 10; k++) { const a = PI * 0.75 + (k / 10) * PI * 1.5; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * 92, h / 2 + Math.sin(a) * 92); c.lineTo(w / 2 + Math.cos(a) * 110, h / 2 + Math.sin(a) * 110); c.lineWidth = 5; c.stroke(); } c.fillStyle = '#58b368'; c.beginPath(); c.arc(w / 2, h / 2, 108, PI * 0.75 + PI * 1.5 * 0.92, PI * 0.75 + PI * 1.5, false); c.lineTo(w / 2, h / 2); c.fill(); });
  mk(new THREE.CircleGeometry(0.2, 32), new THREE.MeshStandardMaterial({ map: gaugeT, roughness: 0.4 }), recyc, -0.18, 0.08, 0.195).castShadow = false;
  const needle = new THREE.Group(); recyc.add(needle); needle.position.set(-0.18, 0.08, 0.2); mk(new THREE.BoxGeometry(0.02, 0.15, 0.01), mat(0xd9322b, 0.4), needle, 0, 0.07, 0);
  const tap = mk(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 10), mat(0x9aa0a8, 0.3, { metalness: 0.6 }), recyc, 0.24, -0.12, 0.26); tap.rotation.x = PI / 2;
  const hopper = mk(new THREE.CylinderGeometry(0.16, 0.08, 0.16, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide }), recyc, 0.22, 0.45, 0.04);
  for (const [x, c] of [[-0.3, 0x58b368], [-0.12, 0x3fa9ff], [0.06, 0xffd23f]]) { const p2 = mk(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), mat(c, 0.5), recyc, x, 0.6, -0.08); }
  const tags = [['SWEAT', -0.3, '#58b368'], ['BREATH', -0.12, '#3fa9ff'], ['PEE', 0.06, '#e0b400']].map(([s, x, col]) => { const tg = mk(new THREE.PlaneGeometry(0.2, 0.08), new THREE.MeshStandardMaterial({ map: tex(128, 52, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.font = font(30); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, w / 2, h / 2 + 2); }), roughness: 0.6 }), recyc, x, 0.48, 0.05); tg.castShadow = false; return tg; });
  const peeBag = new THREE.Group(); scene.add(peeBag);
  mk(new THREE.SphereGeometry(0.11, 14, 10), new THREE.MeshStandardMaterial({ color: 0xf2d23a, roughness: 0.3, transparent: true, opacity: 0.9 }), peeBag).scale.set(1, 0.75, 0.55);
  mk(new THREE.PlaneGeometry(0.14, 0.06), new THREE.MeshStandardMaterial({ map: tex(96, 40, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.font = font(30); c.fillStyle = '#c08a00'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PEE', w / 2, h / 2 + 2); }) }), peeBag, 0, 0, 0.065);
  const pouch = new THREE.Group(); scene.add(pouch);
  mk(new THREE.BoxGeometry(0.12, 0.16, 0.04), mat(0xc0c4cc, 0.35, { metalness: 0.5 }), pouch); mk(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), mat(0xe8504a, 0.5), pouch, 0.02, 0.12, 0);
  const coffee = makeBlob(); scene.add(coffee.m);
  const vest = new THREE.Group(); gary.head.parent.parent.add(vest); vest.position.set(0, 0.17, 0.0);   // "a bulletproof vest made of tinfoil" — on Gary
  { const fv = tex(128, 128, (c, w, h) => { c.fillStyle = "#e6e9ee"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.6)' : 'rgba(80,88,100,.45)'; const x = (i * 37) % w, y = (i * 61) % h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y + 6); c.lineTo(x + 4, y + 16); c.fill(); } });
    const vm = new THREE.MeshStandardMaterial({ map: fv, metalness: 0.85, roughness: 0.2, emissive: 0x3a3e46, flatShading: true });
    const body = mk(new THREE.CylinderGeometry(0.2, 0.19, 0.3, 14, 2, true), vm, vest); body.scale.set(1, 1, 0.9);
    const sign = mk(new THREE.PlaneGeometry(0.2, 0.08), new THREE.MeshBasicMaterial({ map: tex(128, 52, (c, w, h) => { c.fillStyle = '#1b2a44'; c.fillRect(0, 0, w, h); c.font = font(34); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VEST', w / 2, h / 2 + 2); }) }), vest, 0, 0.02, 0.185); sign.castShadow = false; }
  vest.visible = false;
  const goalposts = [0, 1].map(() => { const g = new THREE.Group(); scene.add(g); const y = mat(0xffd23f, 0.4, { emissive: 0x6a5200 });   // "one yard short of a football field": a goalpost at each end of the right wing
    mk(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), y, g, 0, 0.8, 0); mk(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), y, g, 0, 1.6, 0).rotation.z = PI / 2; for (const sx of [-0.9, 0.9]) mk(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), y, g, sx, 2.4, 0); g.visible = false; return g; });
  const junk = [[0xffffff, 'sock'], [0x2f6fd6, 'pen'], [0xe8504a, 'pouch'], [0xffd23f, 'pen']].map(([c, k], i) => { const m = k === 'sock' ? mk(new THREE.CapsuleGeometry(0.05, 0.16, 4, 8), mat(c, 0.9), scene) : k === 'pen' ? mk(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), mat(c, 0.4), scene) : mk(new THREE.BoxGeometry(0.1, 0.13, 0.03), mat(c, 0.5), scene); m.castShadow = false; return { m, i }; });   // zero-g junk drifting in the rooms
  const emergency = new THREE.PointLight(0xff3a26, 0, 5.5, 1.5); emergency.position.set(...P(0.4, -1.5, 0.9)); scene.add(emergency);
  const sweat = [0, 1, 2].map(() => { const b = makeBlob(0xbfe6ff, 0.8); scene.add(b.m); return b; });
  const toilet = makeToilet(); scene.add(toilet.g); toilet.g.position.set(...P(1.25, MT[4] - 1.45, -0.25)); toilet.g.rotation.z = PI / 2; toilet.g.userData.s = 1.3;   // M5, the WC: its own little room
  const goldSeat = mk(new THREE.TorusGeometry(0.17, 0.05, 10, 24), mat(0xf2c14e, 0.25, { metalness: 0.9 }), toilet.g, 0, 0.39, 0); goldSeat.rotation.x = PI / 2;
  const tread = makeTreadmill(); scene.add(tread.g); tread.g.position.set(...P(-0.88, MT[3] - 3.3, 0.15)); tread.g.scale.setScalar(0.75); mk(new THREE.BoxGeometry(0.95, 0.06, 0.6), mat(0x9aa3b0, 0.5), scene, ...P(-0.85, MT[3] - 3.34, 0.1));   // on a rack shelf in the LAB, under the plugged Gary
  const bungee = [0, 1].map(() => { const b = mk(new THREE.CylinderGeometry(0.01, 0.01, 1, 6), mat(0xff4fa0, 0.5), scene); b.castShadow = false; return b; });
  // the orbit explainer: chevrons flowing along the real circular path around the planet
  const orbitPts = []; { const c = W.C, ox = P(-4.8)[0], oy = 78.4, r = Math.hypot(ox - c.x, oy - c.y), a0 = Math.atan2(ox - c.x, oy - c.y); for (let k = 0; k <= 60; k++) { const a = a0 - 0.004 + k * 0.0028; orbitPts.push([c.x + Math.sin(a) * r, c.y + Math.cos(a) * r, 0.3]); } }
  const orbitArrows = makeArrows(scene, orbitPts, { color: 0xffd23f, count: 18, size: 3.0, speed: 22, emissive: 0.9 });
  // the paint fleck streaks (hit + whipple demo) and the burning seed
  const streak = mk(new THREE.CylinderGeometry(0.02, 0.0, 1.6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2c0).multiplyScalar(2), toneMapped: false, transparent: true }), scene); streak.castShadow = false;
  const looseHelmet = makeHelmet(0.47); scene.add(looseHelmet); looseHelmet.visible = false;   // knocked off in the fling
  const spit = mk(new THREE.SphereGeometry(0.03, 8, 6), mat(0x2e2b28, 0.6), scene); spit.scale.set(0.7, 0.45, 1.5); spit.castShadow = false;
  const hotSeed = new THREE.Group(); scene.add(hotSeed);
  { const s2 = mk(new THREE.SphereGeometry(0.05, 10, 8), mat(0x2e2b28, 0.5), hotSeed); s2.scale.set(0.7, 0.45, 1.5); }
  const seedGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.3, 'rgba(255,170,60,.9)'); g.addColorStop(1, 'rgba(255,80,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true }));
  hotSeed.add(seedGlow);
  const seedLight = new THREE.PointLight(0xff8a30, 0, 4, 1.6); hotSeed.add(seedLight);

  // ---------------------------------------------------------------- FX schedule (analytic; the same word times drive the cue sheet)
  const FP = [0, 1.05, -1.6];   // feeder on the low pole
  fx.stream('seed', t.squirrels, t.so0, { pos: [0.05, 1.12, -1.42], box: [0.2, 0.05, 0.1], rate: 16, dir: [0, 0.6, 1], spread: 0.9, speed: [0.6, 1.4], floor: 0.01, life: [1.6, 2.2], seed: 1 });   // the thief flings shells
  fx.burst('seed', t.robbing, { pos: [0.05, 1.15, -1.42], n: 16, dir: [0.3, 1, 0.6], spread: 0.9, speed: [1, 2], floor: 0.01, seed: 2 });
  fx.burst('dust', POLE_UP + 0.15, { pos: [0, 0.1, -1.6], n: 8, speed: [0.3, 0.8], spread: 1.4, size: [0.25, 0.5], floor: 0, seed: 3 });
  fx.burst('seed', POLE_UP + 0.18, { pos: [0, 2.15, -1.55], n: 22, dir: [0, 1, 0.4], spread: 1.0, speed: [1, 2.4], floor: 0.01, seed: 4 });
  fx.burst('confetti', t.c0, { pos: [0.4, 3.6, -1.0], box: [3.5, 0.5, 2], n: 320, dir: [0, 1, 0.2], spread: 0.9, speed: [1.5, 4], seed: 5 });
  fx.burst('spark', t.five + 0.05, { pos: [0.05, 2.75, -1.35], n: 14, speed: [0.6, 1.4], spread: 1.4, seed: 6 });
  fx.burst('seed', t.bso + 0.35, { pos: [0, 2.4, -1.55], n: 14, dir: [0.4, 1, 0.3], spread: 0.9, speed: [1, 2], floor: 0.01, seed: 7 });   // shooed off the roof
  fx.burst('spark', CONE, { pos: [0, 0.78, -1.5], n: 16, speed: [0.8, 2], spread: 1.4, seed: 8 });
  fx.burst('spark', BONK, { pos: [0, 0.6, -1.45], n: 12, speed: [0.6, 1.6], spread: 1.4, seed: 10 });
  fx.stream('dust', ZIP0, ZIP0 + 0.6, { pos: [-2.2, 0.08, -2.2], box: [4.4, 0.05, 1.0], rate: 18, speed: [0.2, 0.5], spread: 1.4, size: [0.25, 0.45], floor: 0, seed: 11 });
  fx.burst('crumb', ZIP0 + 0.85, { pos: [-4.55, 1.4, -2.9], n: 10, speed: [0.5, 1.4], spread: 1.2, floor: 0.01, seed: 12, color: 0x6e5236 });   // bark flakes on the climb
  fx.burst('dust', LEAP, { pos: [-2.95, 2.45, -2.3], n: 5, speed: [0.2, 0.5], spread: 1.4, size: [0.15, 0.3], seed: 13 });
  fx.burst('glow', FACE, { pos: [-1.45, 1.2, -1.1], n: 2, size: [0.25, 0.4], seed: 14 });
  fx.burst('spark', FACE, { pos: [-1.45, 1.2, -1.0], n: 12, speed: [0.6, 1.6], spread: 1.4, seed: 15 });
  fx.burst('dust', STEP + 0.3, { pos: [-1.6, 0.1, -1.3], n: 10, speed: [0.3, 0.9], spread: 1.4, size: [0.3, 0.55], floor: 0, seed: 16 });
  fx.burst('dust', t.strap - 0.02, { pos: [2.1, 0.2, -1.2], n: 12, speed: [0.4, 1.0], spread: 1.4, size: [0.35, 0.7], floor: 0, seed: 17 });   // the rocket pops in
  fx.burst('seed', GRAB + 0.1, { pos: [0, 2.1, -1.55], n: 12, dir: [0.4, 1, 0.3], spread: 0.9, speed: [1, 2], floor: 0.01, seed: 18 });
  fx.burst('spark', TAPED, { pos: [2.1, 1.3, -0.75], n: 8, speed: [0.4, 1], spread: 1.2, seed: 19 });
  fx.stream('smoke', IGN1, IGN1 + 1.0, { pos: [2.1, 0.2, -1.6], box: [0.6, 0.2, 0.4], rate: 26, dir: [0, 0.3, -0.3], spread: 1.3, speed: [1, 2.5], size: [0.4, 0.8], floor: 0.05, seed: 20, color: 0xe2ded6 });
  fx.burst('dust', IGN1 + 0.05, { pos: [2.1, 0.2, -1.2], n: 18, speed: [1.5, 3.5], spread: 1.5, dir: [0, 0.2, 0], size: [0.5, 0.9], floor: 0, seed: 21 });
  fx.burst('dirt', IMPACT, { pos: [1.85, 0.1, -0.95], n: 140, dir: [0, 1, 0], spread: 0.9, speed: [3, 7], floor: 0.0, seed: 22 });
  fx.burst('dust', IMPACT, { pos: [2.1, 0.3, -1.0], n: 22, speed: [1, 2.6], spread: 1.5, size: [0.5, 1.0], floor: 0, seed: 23 });
  fx.burst('seed', IMPACT + 0.02, { pos: [2.1, 1.2, -0.6], n: 30, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3], floor: 0.01, seed: 24 });
  fx.burst('dirt', POPOUT, { pos: [2.0, 0.2, -1.0], n: 60, dir: [0, 1, 0.2], spread: 0.8, speed: [2.5, 5], floor: 0, seed: 25 });
  fx.burst('dust', UPRIGHT, { pos: [2.1, 0.2, -1.2], n: 10, speed: [0.5, 1.2], spread: 1.4, size: [0.35, 0.6], floor: 0, seed: 26 });
  fx.stream('smoke', IGN2, IGN2 + 2.6, { pos: [2.1, 0.3, -1.7], box: [0.8, 0.4, 0.5], rate: 50, dir: [0, 0.2, -0.3], spread: 1.5, speed: [1.5, 4], size: [0.7, 1.4], floor: 0.05, seed: 27, color: 0xe2ded6 });
  fx.burst('dust', IGN2, { pos: [2.1, 0.2, -1.2], n: 26, speed: [2, 4], spread: 1.5, dir: [0, 0.15, 0], size: [0.6, 1.1], floor: 0, seed: 28 });
  fx.burst('spark', BOLT1, { pos: P(0.75, 0.05, 0.45), n: 14, speed: [0.6, 1.6], spread: 1.4, g: 0, seed: 30 });
  fx.burst('spark', BOLT2, { pos: P(0.75, 0.05, 0.45), n: 14, speed: [0.6, 1.6], spread: 1.4, g: 0, seed: 31 });
  fx.stream('smoke', M1_IN0 - 0.4, M1_IN1 - 0.2, { pos: P(0, -6.5, 0), box: [1.6, 2, 1.0], rate: 30, dir: [0, -1, 0], spread: 0.5, speed: [1, 3], size: [0.8, 1.6], g: 0, drag: 1.5, seed: 32 });
  for (let i = 1; i < 5; i++) fx.stream('smoke', DOCK_T[i] - 1.1, DOCK_T[i] - 0.1, { pos: P(0, MT[i] - ML[i] - 4, 0), box: [1.2, 6, 1.0], rate: 18, dir: [0, -1, 0], spread: 0.5, speed: [1, 2.5], size: [0.6, 1.2], g: 0, drag: 1.5, seed: 140 + i });
  fx.burst('mist', M2_CAP, { pos: P(0, -4.75, 0.6), box: [1.4, 0.1, 0.4], n: 16, speed: [0.3, 0.8], spread: 1.5, g: 0, size: [0.2, 0.4], seed: 33 });
  fx.burst('spark', LATCH, { pos: P(0, -4.75, 0.8), box: [1.4, 0.05, 0.3], n: 24, speed: [0.8, 2], spread: 1.4, g: 0, seed: 34 });
  fx.burst('glow', LATCH, { pos: P(0, -4.75, 0.9), n: 2, size: [0.3, 0.5], seed: 35 });
  fx.stream('seed', t.feed - 4, END, { pos: P(0.75, 0.38, 0.45), box: [0.1, 0.05, 0.1], rate: 4, dir: [0.1, 1, 0.3], spread: 1.0, speed: [0.12, 0.35], g: 0, drag: 0.15, life: [5, 7], seed: 36 });   // the bolted-on feeder leaks seeds into space
  fx.stream('seed', M1_IN1, t.feed - 4, { pos: P(0.75, 0.38, 0.45), box: [0.1, 0.05, 0.1], rate: 3, dir: [0.1, 1, 0.3], spread: 1.0, speed: [0.12, 0.3], g: 0, drag: 0.15, life: [5, 7], seed: 37 });
  fx.burst('spark', LIGHTS_OFF - 0.25, { pos: P(-1.0, -0.6, -1.1), n: 10, speed: [0.5, 1.2], spread: 1.4, g: 2, seed: 38 });
  fx.burst('spark', LIGHTS_OFF, { pos: P(1.0, -0.6, -1.1), n: 10, speed: [0.5, 1.2], spread: 1.4, g: 2, seed: 39 });
  fx.stream('mist', WHOOSH, WHOOSH + 1.0, { pos: P(0.6, -2.6, 0.0), box: [1.2, 1.0, 0.8], rate: 45, dir: [1, 0, -0.1], spread: 0.25, speed: [3, 5], g: 0, drag: 0.5, size: [0.1, 0.22], seed: 40 });
  fx.burst('seed', WHOOSH, { pos: P(0, -2.6, 0.2), box: [1.6, 2, 1.2], n: 60, dir: [1, 0, 0], spread: 0.3, speed: [3, 6], g: 0, drag: 0.4, life: [2.5, 3.5], seed: 41 });
  fx.burst('confetti', WHOOSH + 0.05, { pos: P(-0.3, -2.0, 0.0), box: [1.2, 1.2, 1], n: 40, dir: [1, 0, 0], spread: 0.35, speed: [3, 6], g: 0, drag: 0.6, seed: 42 });   // papers, socks, snacks
  fx.burst('mist', AL_DOCK, { pos: P(1.95, -2.6, 0.7), box: [0.1, 1.4, 0.6], n: 18, speed: [0.3, 0.9], spread: 1.5, g: 0, size: [0.2, 0.4], seed: 43 });
  fx.burst('spark', AL_DOCK, { pos: P(1.95, -2.6, 0.8), box: [0.1, 1.6, 0.3], n: 18, speed: [0.6, 1.5], spread: 1.4, g: 0, seed: 44 });
  fx.stream('mist', t.empties - 0.1, t.first + 0.6, { pos: P(4.6, -2.0, 0.3), box: [0.2, 0.3, 0.3], rate: 30, dir: [1, 0.3, 0], spread: 0.4, speed: [1.5, 3], g: 0, drag: 0.6, size: [0.15, 0.35], seed: 45 });   // the airlock vents (empties first)
  fx.burst('dust', WIPE + 0.1, { pos: P(3.4, -3.4, -0.1), box: [0.6, 0.1, 0.3], n: 10, speed: [0.2, 0.6], spread: 1.4, g: 0, drag: 2, size: [0.12, 0.25], seed: 46 });
  fx.burst('dust', WIPE + 0.5, { pos: P(3.4, -3.4, -0.1), box: [0.6, 0.1, 0.3], n: 10, speed: [0.2, 0.6], spread: 1.4, g: 0, drag: 2, size: [0.12, 0.25], seed: 47 });
  fx.stream('mist', OUT0, OUT0 + 0.5, { pos: P(4.75, -2.6, 0.2), box: [0.1, 0.5, 0.5], rate: 30, dir: [1, 0, 0], spread: 0.5, speed: [1, 2], g: 0, drag: 0.8, size: [0.15, 0.3], seed: 48 });
  for (const [s, k] of [[-1, 0], [1, 1]]) fx.burst('spark', UNF0 + 0.15 + k * 0.1, { pos: P(s * (D.truss.half + 0.7), D.truss.y, 0.3), n: 16, speed: [0.8, 2], spread: 1.4, g: 0, seed: 49 + k });
  fx.burst('glow', SUNRISE1 - 0.3, { pos: P(0, 3.5, -8), n: 1, size: [1.4, 1.8], seed: 51 });
  const SWP = P(D.truss.half + 0.2 + 0.6 + (D.wing.n - 1) * D.wing.pw + 0.2, D.truss.y - 0.3, 0.8);
  fx.burst('glow', SWAT, { pos: SWP, n: 2, size: [0.3, 0.5], seed: 52 });
  fx.burst('spark', SWAT, { pos: SWP, n: 18, speed: [1, 2.5], spread: 1.4, g: 0, seed: 53 });
  fx.burst('dust', SWAT + 1.3, { pos: P(-1.0, MT[1] - 2.0, 0.3), n: 10, speed: [0.3, 0.8], spread: 1.4, g: 0, drag: 2, size: [0.15, 0.3], seed: 85, color: 0xd8dde4 });   // he lands inside, against the rack
  fx.burst('spark', SWAT + 1.3, { pos: P(-1.0, MT[1] - 2.0, 0.3), n: 12, speed: [0.6, 1.4], spread: 1.4, g: 0, seed: 86 });
  fx.burst('spark', POWER_ON, { pos: P(0, -0.4, -1.0), box: [2, 0.2, 0.2], n: 14, speed: [0.4, 1], spread: 1.4, g: 1, seed: 54 });
  fx.stream('smoke', BLUE0 - 0.4, SCRUB + 0.6, { pos: P(0.1, MT[1] - 1.75, 0.3), box: [0.7, 0.5, 0.4], rate: 14, dir: [0, 0.2, 0], spread: 1.3, speed: [0.1, 0.3], g: 0, drag: 1.5, size: [0.25, 0.5], seed: 55, color: 0x8a8f95 });   // stale CO2 haze around Gary
  fx.stream('smoke', SCRUB + 0.25, PINK, { pos: P(0.0, MT[1] - 1.6, 0.3), box: [0.9, 0.6, 0.5], rate: 22, dir: [-0.5, 0.6, -1], spread: 0.25, speed: [0.8, 1.4], g: 0, drag: 0.2, size: [0.18, 0.35], life: [0.6, 0.9], seed: 56, color: 0x8a8f95 });   // sucked into the scrubber
  fx.burst('spark', SCRUB, { pos: SCR, box: [0.6, 0.5, 0.1], n: 12, speed: [0.5, 1.2], spread: 1.4, g: 0, seed: 57 });
  fx.burst('spark', RECYC, { pos: REC, box: [0.6, 0.5, 0.1], n: 12, speed: [0.5, 1.2], spread: 1.4, g: 0, seed: 58 });
  fx.burst('mist', t.wbreath, { pos: P(-0.35, MT[1] - 1.85, 0.6), n: 8, dir: [0.6, -0.6, -0.5], spread: 0.5, speed: [0.6, 1.0], g: 0, drag: 0.8, size: [0.12, 0.25], seed: 59 });
  fx.burst('drops', GAUGE1, { pos: [REC[0] + 0.24, REC[1] - 0.12, REC[2] + 0.36], n: 8, dir: [0, 0, 1], spread: 0.4, speed: [0.2, 0.4], g: 0, drag: 1.2, life: [2, 3], seed: 60, color: 0x5a3418 });
  const HP = P(D.hole[0], D.hole[1], -1.1), WX = -Math.sqrt((D.Rm + 0.38) ** 2 - D.zc ** 2);   // the hole; the shield's left cut edge (x)
  fx.burst('glow', HIT, { pos: HP, n: 2, size: [0.3, 0.5], seed: 62 });
  fx.burst('spark', HIT, { pos: HP, n: 30, dir: [0, 0, 1], speed: [1, 3], spread: 1.0, g: 0, seed: 63 });
  fx.stream('mist', HIT + 0.05, PLUG, { pos: P(0.0, MT[3] + 0.9, 0.4), box: [2.0, 2.4, 1.6], rate: 50, dir: [-0.3, -1, -0.8], spread: 0.45, speed: [2, 4], g: 0, drag: 0.4, size: [0.15, 0.35], life: [0.5, 0.8], seed: 64 });
  fx.burst('seed', SUCK0, { pos: P(0.0, MT[2] - 2.6, 0.5), box: [1.6, 1.6, 1], n: 30, dir: [-0.2, -1, -0.4], spread: 0.35, speed: [2, 4], g: 0, drag: 0.6, life: [0.7, 1.0], seed: 65 });
  fx.burst('dust', PLUG, { pos: P(D.hole[0], D.hole[1], -0.9), n: 10, speed: [0.4, 1], spread: 1.5, g: 0, drag: 2, size: [0.2, 0.4], seed: 66, color: 0xd8dde4 });
  fx.burst('spark', PLUG, { pos: P(D.hole[0], D.hole[1], -0.9), n: 14, speed: [0.6, 1.6], spread: 1.4, g: 0, seed: 67 });
  fx.stream('mist', PLUG + 0.5, SEED_OUT, { pos: P(D.hole[0] + 0.33, D.hole[1] - 0.05, -0.95), box: [0.04, 0.25, 0.04], rate: 9, dir: [0.15, 0, -1], spread: 0.3, speed: [0.4, 0.8], g: 0, drag: 0.6, size: [0.05, 0.11], life: [0.4, 0.7], seed: 90 });
  fx.burst('spark', SHIELD + 0.1, { pos: P(WX, MT[3] - 1.6, 1.1), box: [0.3, 3.5, 0.2], n: 22, speed: [0.5, 1.5], spread: 1.4, g: 0, seed: 68 });
  fx.burst('glow', HIT2, { pos: P(WX, MT[3] - 1.4, 1.0), n: 1, size: [0.18, 0.28], seed: 69 });
  fx.burst('mist', HIT2, { pos: P((WX - 1.43) / 2, MT[3] - 1.4, 1.18), box: [0.1, 0.4, 0.1], n: 30, size: [0.08, 0.2], dir: [0.2, 0, 0.3], spread: 1.3, speed: [0.3, 1.1], g: 0, drag: 1.2, seed: 70, color: 0xe8eef6 });
  fx.burst('spark', HIT2, { pos: P(WX, MT[3] - 1.4, 1.2), n: 20, speed: [0.8, 2.2], spread: 1.4, g: 0, seed: 71 });
  fx.burst('spark', TOILET, { pos: P(0.9, MT[4] - 1.45, 0), n: 14, speed: [0.5, 1.2], spread: 1.4, g: 0, seed: 72 });
  fx.burst('bill', TOILET + 0.2, { pos: P(0.55, MT[4] - 0.9, 0.4), box: [0.6, 0.4, 0.3], n: 10, dir: [-0.3, 0.4, 0.4], spread: 1.2, speed: [0.3, 0.8], g: 0, drag: 0.8, life: [3, 4], seed: 73 });
  fx.stream('bill', t.toilet - 0.3, t.toilet + 1.0, { pos: P(0.15, MT[4] - 1.05, 0.5), box: [0.4, 0.5, 0.4], rate: 12, dir: [1, -0.4, -0.4], spread: 0.25, speed: [0.8, 1.2], g: 0, drag: 0.3, life: [0.7, 0.9], seed: 150 });   // the money flushes
  fx.stream('mist', t.toilet + 0.1, t.toilet + 0.8, { pos: P(0.98, MT[4] - 1.45, 0), box: [0.1, 0.2, 0.2], rate: 24, dir: [1, 0, 0], spread: 0.4, speed: [0.6, 1.2], g: 0, drag: 0.5, size: [0.1, 0.22], seed: 74, color: 0x9fd8ff });   // the fan whooshes
  fx.burst('spark', TREAD, { pos: P(-0.88, MT[3] - 3.1, 0.3), n: 12, speed: [0.5, 1.2], spread: 1.4, g: 0, seed: 75 });
  fx.burst('spark', CUPOLA, { pos: P(0, D.m2bot - 0.4, 0.6), n: 14, speed: [0.5, 1.3], spread: 1.4, g: 0, seed: 76 });
  fx.burst('confetti', t.e0, { pos: P(0, -10, 1), box: [18, 26, 8], n: 900, dir: [0, 0, 1], spread: 1.6, speed: [0.1, 0.5], g: 0, drag: 0.3, life: [9, 11], seed: 77 });   // zero-g confetti hangs in the air
  for (const sx of [-1, 1]) fx.stream('bill', t.hundred - 0.4, t.runs - 1.6, { pos: P(sx * 4.6, -10, -0.6), box: [4.2, 22, 2.6], rate: 80, dir: [0, 0, 1], spread: 1.6, speed: [0.05, 0.25], g: 0, drag: 0.3, life: [5, 7], seed: 78 });
  fx.burst('dust', t.runs + 0.05, { pos: P(-0.6, MT[3] - 3.05, 0.3), n: 8, speed: [0.2, 0.6], spread: 1.4, g: 0, drag: 2, size: [0.1, 0.2], seed: 79 });
  fx.burst('smoke', LAND, { pos: [0.1, 1.1, -1.6], n: 7, color: 0xc8c2bb, speed: [0.2, 0.6], dir: [0, 1, 0], spread: 0.8, size: [0.12, 0.3], g: -0.5, seed: 81 });
  fx.stream('smoke', LAND, END, { pos: [0.12, 1.1, -1.62], box: [0.04, 0.02, 0.04], rate: 6, dir: [0.3, 1, -0.3], spread: 0.3, speed: [0.25, 0.4], size: [0.05, 0.12], g: -0.6, seed: 82, color: 0xbdb8b2 });
  fx.burst('spark', LAND, { pos: [0.06, 1.08, -1.5], n: 16, speed: [0.5, 1.4], spread: 1.4, seed: 83 });
  fx.burst('mist', SEED_OUT, { pos: P(D.hole[0] + 0.32, D.hole[1], -0.85), n: 10, dir: [0.3, 0.2, -1], spread: 0.6, speed: [0.4, 0.9], g: 0, drag: 1.5, size: [0.08, 0.16], seed: 87 });   // pfft: past his hip
  fx.stream('spark', LAND, LAND + 1.5, { pos: [0.06, 1.09, -1.5], box: [0.03, 0.01, 0.03], rate: 16, dir: [0, 1, 0], spread: 0.5, speed: [0.3, 0.7], seed: 88 });   // it's still on fire
  fx.burst('smoke', LAND + 0.9, { pos: [0.0, 1.27, -1.45], n: 5, dir: [0, 0.4, 1], spread: 0.5, speed: [0.3, 0.6], size: [0.05, 0.1], g: -0.4, seed: 89, color: 0x6a6a6a });   // the cardinal coughs
  fx.burst('crumb', LAND + 0.45, { pos: [0.02, 1.12, -1.45], n: 6, size: [0.012, 0.022], speed: [0.4, 0.9], spread: 1.3, floor: 1.03, seed: 84, color: 0x3a2a20 });   // soot
  const seedPath = (tt) => { const u = clamp((tt - SEED0) / (LAND - SEED0)), e = u * u * (3 - 2 * u) * 0.35 + u * u * 0.65; return bez3(P(D.hole[0] - 0.05, D.hole[1], -2.3), P(-0.8, -20, -2.0), P(-8, -50, 0), [0.06, 1.07, -1.5], e); };   // out the hole past Gary, down behind the stack
  for (let k = 0; k < 26; k++) { const tt = SEED0 + 0.1 + k * (LAND - SEED0 - 0.15) / 26; if (seedPath(tt)[1] > 40) continue; fx.burst('smoke', tt, { pos: seedPath(tt), n: 2, speed: [0.05, 0.2], spread: 1.4, g: 0, drag: 2, size: [0.25, 0.6], life: [0.8, 1.4], seed: 90 + k, color: 0x777777 }); fx.burst('spark', tt, { pos: seedPath(tt), n: 3, speed: [0.3, 0.8], spread: 1.4, g: 0, seed: 130 + k }); }

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words
  const C0 = IGN2 - 0.15, C1 = t.falls + 0.15;   // the rocket chase (between rail 1 and rail 2)
  const F1 = [], F2 = [];
  const F = (L, tt, pos, look, fov = 42, pass = false) => L.push({ t: tt, pos, look, fov, pass });
  const Fk = (L, tt, pos, look, fov = 42, until) => L.push({ t: tt, pos, look, fov, keep: true, until });
  Fk(F1, 0, [0.6, 1.3, 4.4], [0.45, 0.62, -1.4], 40, POLE_UP - 0.6);                                 // the thief in the feeder (left), Gary + the birds (right)
  Fk(F1, POLE_UP + 0.2, [0.7, 2.0, 6.4], [0.15, 1.85, -1.6], 44, POLE_UP + 0.5);     // the pole shoots up (squirrel above the caption, Gary below)
  F(F1, t.c0 + 0.2, [0.9, 2.05, 7.0], [0.25, 1.6, -1.4], 44);                         // confetti, Gary's ta-da
  Fk(F1, t.five - 0.4, [0.3, 2.62, 3.4], [0.05, 2.45, -1.6], 36, t.stars + 0.35);    // the 5-star card
  F(F1, t.bso + 0.25, [0.6, 1.45, 5.2], [0.15, 1.0, -1.6], 42);                      // Gary shoos the squirrel, the cone
  Fk(F1, CONE - 0.15, [0.4, 1.5, 4.0], [0.05, 1.05, -1.6], 38, t.baffle + 0.35);   // the cone pops on; the squirrel bonks it, slides down, sits dazed under SQUIRREL BAFFLE
  Fk(F1, t.not, [-2.55, 2.75, 1.4], [-2.9, 2.45, -2.3], 38, t.baffled + 0.4);       // NOT BAFFLED on the branch tip
  Fk(F1, t.tree - 0.1, [-1.6, 2.8, 7.6], [-1.65, 2.35, -1.9], 44, STEP + 0.15);     // a straight dolly back: the 10-ft arc grows, the leap, Gary's face, the step
  F(F1, t.rfeed - 0.05, [1.0, 1.95, 6.6], [1.15, 1.55, -1.3], 44);                    // the rocket pops in; the feeder is taped on
  F(F1, t.goes - 0.05, [1.6, 2.2, 13.0], [2.0, 5.2, -1.2], 50, true);                  // tilt up after it
  Fk(F1, t.down - 0.3, [1.8, 2.3, 9.0], [1.9, 2.4, -1.1], 46, IMPACT + 0.55);        // back down onto Gary
  Fk(F1, POPOUT + 0.1, [1.8, 2.0, 7.2], [2.0, 1.55, -1.1], 44);                      // he pops out, the rocket rights itself, he climbs in
  const WIDE_ORBIT = { pos: [10, 85, 21], look: [23, 69.5, -20], fov: 50 };
  Fk(F2, C1, WIDE_ORBIT.pos, WIDE_ORBIT.look, WIDE_ORBIT.fov, t.earth + 0.25);       // the orbit: the arrows fall around the planet
  F(F2, t.ocalled - 0.25, [17.5, 79.1, 7.6], [17.7, 77.75, 0.3], 46);                 // back in on the rocket (ORBIT)
  Fk(F2, t.floats - 0.25, [19.2, 79.5, 6.2], [19.1, 78.9, 0.5], 42, t.too + 0.1);    // Gary floats out, seeds drift
  Fk(F2, t.fsq - 0.35, [18.8, 78.5, 5.2], [19.3, 78.05, 1.4], 38, t.fsq + 0.4);        // SO IS THE SQUIRREL
  F(F2, t.tiny - 0.35, [20.4, 79.3, 5.2], [20.3, 78.7, 0.6], 40);                    // a feeder is tiny
  Fk(F2, t.launch - 0.1, [21.7, 79.8, 8.4], [21.6, 78.2, 0], 42, t.don);             // M1 rises in under him; the feeder is bolted on top
  F(F2, t.docking - 0.05, [22.1, 74.6, 12.0], [22.0, 73.8, 0], 50);   // the docking train rises, Gary dives to the doorway
  Fk(F2, LATCH - 0.45, [22.05, 73.7, 5.6], [22.0, 73.3, 0], 38, LATCH + 0.15);        // Gary in the doorway: CLUNK
  Fk(F2, t.sixteen - 0.2, [24.2, 76.6, 10.5], [21.6, 72.8, -3.0], 46, t.power - 0.1); // dark: the terminator sweeps the planet below
  Fk(F2, t.kgary + 0.15, [23.3, 75.9, 6.6], [23.5, 75.35, 0], 44, WHOOSH);          // Gary at the side hatch (the door swings open)
  Fk(F2, t.him - 0.2, [25.0, 76.2, 8.2], [25.2, 75.4, 0], 46, AL_DOCK + 0.2);        // the pan trails his blowout; the airlock flies in
  Fk(F2, t.airlock - 0.35, [25.3, 76.0, 6.0], [25.3, 75.6, 0], 46, t.mudroom + 0.35);   // the mudroom
  F(F2, t.blue - 0.35, [22.0, 71.7, 6.4], [21.95, 70.55, 0], 42);                    // M2 LIFE SUPPORT (green): Gary turns blue, the squirrel isn't
  Fk(F2, t.machines - 0.2, [21.85, 72.0, 5.4], [21.8, 71.2, 0], 40, t.iair + 0.2);   // the scrubber eats the haze
  F(F2, t.recycle - 0.15, [22.25, 70.85, 5.8], [22.35, 70.3, 0], 42);                // the recycler
  F(F2, t.life - 0.3, [22.0, 71.2, 8.0], [22.0, 70.4, 0], 44);                       // LIFE SUPPORT: the whole green room (plants, fans)
  Fk(F2, t.sweat - 0.2, [22.05, 71.0, 5.6], [22.1, 70.6, 0], 40, t.pee + 0.4);       // sweat, breath, the PEE bag into the hopper
  F(F2, t.n98 + 0.4, [22.6, 70.4, 3.4], [22.45, 70.2, -0.9], 36);                    // the 98 % gauge
  Fk(F2, t.yesterdays - 0.2, [21.75, 66.15, 4.2], [21.65, 65.55, 0.3], 36, GULP + 0.35);   // M3 GALLEY (warm): the coffee blob, GULP
  Fk(F2, HIT + 0.1, [21.9, 64.6, 7.0], [21.8, 64.3, -0.3], 50);                      // the galley over the LAB: the hit, the hole, the red alarm
  Fk(F2, PLUG - 0.45, [21.65, 64.05, 5.0], [21.5, 63.2, -0.4], 38, PLUG + 0.7);      // Gary is now the plug
  Fk(F2, t.sheet, [19.75, 63.35, 5.6], [20.85, 62.6, 0.2], 44, t.whipple + 0.15);     // three-quarter from the left: the tinfoil wraps the LAB, a hit turns to vapor at the cut edge; Gary plugged inside
  Fk(F2, t.bulletproof + 0.15, [21.65, 64.05, 5.0], [21.5, 63.2, -0.4], 38);        // the tinfoil vest on the plugged Gary
  Fk(F2, t.toilet - 0.45, [22.5, 58.55, 6.2], [22.6, 57.95, 0], 42, t.toilet); // M5 W.C.: the $23M toilet
  Fk(F2, t.treadmill - 0.25, [21.8, 59.95, 5.8], [21.6, 59.75, 0], 46, t.treadmill + 0.4);                   // the treadmill on its LAB shelf (+ bungees), under the plugged Gary
  F(F2, t.window - 0.12, [22.45, 55.85, 2.5], [22.0, 53.6, -0.4], 60);
  Fk(F2, t.backyard - 0.3, [22.4, 55.98, 0.12], [21.25, 53.3, -0.05], 72);   // inside the cupola: the backyard through the struts   // the cupola: the window over your backyard (far below)
  const LAST = { pos: [0.32, 1.36, 0.95], look: [0.05, 0.93, -1.55], fov: 36 };   // the bird + the seed at ~41 % (above the caption)
  F2.push({ t: END, pos: LAST.pos, look: LAST.look, fov: LAST.fov, stop: true });
  planRail.verbose = true;
  const rail1 = makeRail(planRail(F1, { shortHoldPass: true })), rail2 = makeRail(planRail(F2.slice(0, -1), { shortHoldPass: true }));
  const E0 = t.backyard + 0.4, WIDE_END = { pos: [14, 74, 30], look: [22, 68, 0], fov: 46 }, RUNS = { pos: [21.5, 62.75, 6.0], look: [21.4, 62.35, -0.3], fov: 44 };
  const endRail = makeRail([{ t: E0, ...rail2.at(E0) }, { t: E0 + 0.85, pos: [22.45, 55.8, 3.4], look: [22.2, 58.6, 0], fov: 52, pass: true }, { t: t.eyou - 0.2, ...WIDE_END, pass: true },   // back out of the cupola, then up and away to the whole station { t: t.ebirds, pos: [16.5, 79, 20], look: [22.4, 76.5, 0], fov: 44, pass: true },
    { t: t.spent, pos: [17.6, 76.2, 17.0], look: [22.3, 73.6, 0], fov: 44, pass: true }, { t: Wd('end', 'dollars') - 0.1, pos: [20.6, 63.7, 12.6], look: [21.5, 62.9, -0.3], fov: 44, pass: true }, { t: t.runs - 0.15, ...RUNS, pass: true }, { t: t.egary, pos: [21.5, 62.85, 5.5], look: [21.45, 62.45, -0.4], fov: 42, pass: true }, { t: SEED_OUT + 0.8, pos: [21.5, 62.9, 4.8], look: [21.45, 62.5, -0.4], fov: 40 }]);   // no stop: a slow push on Gary into the dive
  // the chase: from the yard frame to the rocket, up through the clouds, then out to the wide orbit frame
  const rocketCenter = (tt) => { const st = rocketAt(tt); return [st.p[0] + st.dir[0] * 1.6, st.p[1] + st.dir[1] * 1.6, st.p[2] + st.dir[2] * 1.6]; };
  function chaseAt(tt) {
    const u = clamp((tt - C0) / (C1 - C0)), rc = rocketCenter(tt), lift = smooth(u01(tt, IGN2, IGN2 + 1.6));
    const off = LP([0.2, 0.9, 8.4], [-3.8, -1.0, 8.6], smooth(u01(tt, IGN2 + 0.6, ORBIT_IN)));
    let pos = [rc[0] + off[0], rc[1] + off[1] * lift + (1 - lift) * 0.4, rc[2] + off[2]], look = [rc[0] + 0.6 * smooth(u01(tt, IGN2 + 1, ORBIT_IN)), rc[1] - 0.4 * lift, rc[2]], fov = 44;
    const a = smooth(u01(tt, C0, C0 + 0.6)); if (a < 1) { const r = rail1.at(tt); pos = LP(r.pos, pos, a); look = LP(r.look, look, a); fov = lerp(r.fov, fov, a); }
    const close = smooth(u01(tt, t.really - 0.35, t.really + 0.1)) * (1 - smooth(u01(tt, t.fast + 0.3, ORBIT_IN))); if (close > 0) { const ck = local(rocket.body, [0, 2.25, 0.45]); pos = LP(pos, [ck[0] + 0.3, ck[1] + 0.2, ck[2] + 3.0], close); look = LP(look, [ck[0], ck[1] - 0.35, ck[2]], close); fov = lerp(fov, 38, close); }   // Gary's face squashed in the bubble
    const b = smooth(u01(tt, t.miles - 0.4, C1)); if (b > 0) { pos = LP(pos, WIDE_ORBIT.pos, b); look = LP(look, WIDE_ORBIT.look, b); fov = lerp(fov, WIDE_ORBIT.fov, b); }
    return { pos, look, fov };
  }
  // the dive: from Gary's plug close-up, follow the burning seed down through the clouds to the birds
  const D0 = SEED_OUT + 0.15;
  function diveAt(tt) {
    const r = endRail.at(tt); if (tt <= D0) return r;
    const sp = seedPath(Math.min(tt, LAND)), SL = seedPath(LAND), endOff = [LAST.pos[0] - SL[0], LAST.pos[1] - SL[1], LAST.pos[2] - SL[2]];
    const off = LP([1.2, 1.2, 6.0], endOff, smooth(u01(tt, SEED0 + 0.3, LAND - 0.3)));
    let pos = [sp[0] + off[0], sp[1] + off[1], sp[2] + off[2]];
    pos = LP(pos, LAST.pos, smooth(u01(tt, LAND - 1.0, LAND - 0.3)));   // the seed streaks into a held frame (the LAND kick sells the hit)
    const dist = Math.hypot(pos[0] - sp[0], pos[1] - sp[1], pos[2] - sp[2]);
    let look = [sp[0], sp[1] - 0.06 * dist, sp[2]], fov = lerp(44, LAST.fov, smooth(u01(tt, LAND - 1.0, LAND)));   // the seed sits above the caption band
    if (tt >= LAND) { const k = smooth(u01(tt, LAND, END)); pos = LP(LAST.pos, [LAST.pos[0] - 0.08, LAST.pos[1] - 0.04, LAST.pos[2] - 0.25], k); look = LAST.look; fov = LAST.fov; }
    const a = smooth(u01(tt, D0, D0 + 0.55)); return { pos: LP(r.pos, pos, a), look: LP(r.look, look, a), fov: lerp(r.fov, fov, a) };
  }
  // the wing ride: follow Gary out along the unfolding wing (the panels stream past), pull back on "football field", tighten for
  function rideAt(tt) {
    gary.root.updateMatrixWorld(true); const g = gary.root.position, G = [g.x, g.y + 0.9, g.z];
    const pull = smooth(u01(tt, t.football - 0.6, t.football + 0.2)) * (1 - smooth(u01(tt, t.array - 0.5, t.sit - 0.3)));
    const tight = smooth(u01(tt, t.sit - 0.6, t.sit - 0.1)) * (1 - smooth(u01(tt, SWAT + 0.1, SWAT + 0.4)));
    const off = LP(LP([-1.7, 0.9, 6.6], [-5.0, 2.0, 15.5], pull), [-0.9, 0.45, 4.6], tight), drift = -0.3 * Math.max(0, tt - (t.football - 0.6)) * pull;
    let pos = [G[0] + off[0] + drift, G[1] + off[1], G[2] + off[2]], look = [G[0] + 0.9 * (1 - tight) - 1.6 * pull, G[1] - 0.25 - 0.35 * tight, G[2] - 0.5], fov = lerp(44, 50, pull);
    const f = smooth(u01(tt, SWAT + 0.15, W1)); if (f > 0) { const r = rail2.at(W1); pos = LP(pos, r.pos, f); look = LP(look, r.look, f); fov = lerp(fov, r.fov, f); }
    const a = smooth(u01(tt, W0, W0 + 0.8)); if (a < 1) { const r = rail2.at(tt); pos = LP(r.pos, pos, a); look = LP(r.look, look, a); fov = lerp(r.fov, fov, a); }
    return { pos, look, fov };
  }
  const camAt = (tt) => (tt < C0 ? rail1.at(tt) : tt < C1 ? chaseAt(tt) : tt < W0 ? rail2.at(tt) : tt < W1 ? rideAt(tt) : tt < E0 ? rail2.at(tt) : tt < D0 ? endRail.at(tt) : diveAt(tt));
  const kick = makeKick([[POLE_UP + 0.12, 0.6], [t.c0, 0.35], [CONE, 0.6], [BONK, 0.45], [FACE, 0.8], [STEP + 0.25, 0.7], [t.strap - 0.02, 0.5], [TAPED, 0.3], [IGN1, 0.6], [IMPACT, 1.3, 0.6],
    [POPOUT, 0.6], [UPRIGHT, 0.5], [IGN2, 1.0, 0.7], [IGN2 + 1.2, 0.5], [t.n17 + 0.3, 0.6], [M1_IN1 - 0.05, 0.6], [BOLT1, 0.35], [BOLT2, 0.35], [M2_CAP, 0.5], [LATCH, 1.1, 0.55], [LIGHTS_OFF, 0.35],
    [HATCH_OPEN, 0.4], [WHOOSH, 1.0, 0.6], [TAUT, 0.7], [AL_DOCK, 0.8], [UNF0 + 0.2, 0.5], [SWAT, 1.1, 0.55], [POWER_ON, 0.3], [SCRUB, 0.6], [RECYC, 0.6], [PEE_IN, 0.35], [GULP, 0.45], [HIT, 0.9],
    [PLUG, 1.2, 0.6], [SHIELD, 0.5], [HIT2, 0.8], [TOILET, 0.5], [TREAD, 0.5], [CUPOLA, 0.5], [t.e0, 0.45], [LAND, 0.8, 0.5]]);

  // ---------------------------------------------------------------- per-actor state (pure functions of t)
  const seq = (tt, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, pa] = keys[i], [b, pb] = keys[i + 1]; if (tt <= a) return pa; if (tt < b) return LP(pa, pb, smooth((tt - a) / (b - a))); p = pb; } return p; };
  // the rocket: base position p, axis dir (its nose direction), roll (about the axis), visibility
  const R0 = [2.1, 0, -1.2], ARRIVE = P(-6.6, 0.4, 0.3), COAST = P(-5.8, 0.4, 0.3);   // the orbit spot: clear of M1's arrival column (x ≥ 20.1)
  function rocketAt(tt) {
    if (tt < t.strap - 0.05) return { vis: false, p: R0, dir: [0, 1, 0] };
    if (tt < IGN1) return { vis: true, p: R0, dir: [0, 1, 0], s: pop(tt, t.strap - 0.05, 0.3) };
    if (tt < FALL0) { const y = 8 * (1 - (1 - clamp((tt - IGN1) / (APEX - IGN1))) ** 2); const fl = smooth(u01(tt, FLIP0, FALL0 + 0.25)), a = PI * fl; const dir = [0, Math.cos(a), Math.sin(a) * 0.15];
      return { vis: true, p: [R0[0], y + 1.6 - dir[1] * 1.6, R0[2] - dir[2] * 1.6], dir, flame: tt < APEX + 0.05 ? 1 : 0 }; }
    if (tt < IMPACT) { const u = clamp((tt - FALL0) / (IMPACT - FALL0)), a = PI * smooth(u01(tt, FLIP0, FALL0 + 0.25)), dir = [0, Math.cos(a), Math.sin(a) * 0.15]; const cy = lerp(8 + 1.6, 1.32, u * u);
      return { vis: true, p: [R0[0], cy - dir[1] * 1.6, R0[2] + 0.2 * u - dir[2] * 1.6], dir }; }
    if (tt < POPOUT + 0.15) return { vis: true, p: [2.1, 2.92, -1.0], dir: [0, -1, 0] };
    if (tt < UPRIGHT) { const u = smooth(u01(tt, POPOUT + 0.15, UPRIGHT)), a = PI * (1 - u), dir = [Math.sin(a) * 0.2, Math.cos(a), 0]; const c = arcP([2.1, 1.32, -1.0], [R0[0], 1.6, R0[2]], u, 1.0); return { vis: true, p: [c[0] - dir[0] * 1.6, c[1] - dir[1] * 1.6, c[2] - dir[2] * 1.6], dir }; }
    if (tt < IGN2) return { vis: true, p: R0, dir: [0, 1, 0], wob: wobble(tt, UPRIGHT, 0.08, 18, 6) };
    if (tt < ORBIT_IN) { const u = clamp((tt - IGN2) / (ORBIT_IN - IGN2)), ee = u * u * (3 - 2 * u);
      const c0 = R0, c1 = [2.1, 30, -1.2], c2 = [4.0, 74, 0], c3 = ARRIVE, p = bez3(c0, c1, c2, c3, ee), d = bez3d(c0, c1, c2, c3, Math.max(0.001, ee)), L = Math.hypot(...d) || 1;
      return { vis: true, p, dir: d.map((v) => v / L), flame: 1, big: 1 }; }
    if (tt < PUSH) { const u = smooth(u01(tt, ORBIT_IN, COAST1 + 0.6)); return { vis: true, p: LP(ARRIVE, COAST, u), dir: [1, 0.02 * Math.sin(tt), 0], flame: tt < t.hour + 0.3 ? 1 : 0.5 * (1 - u01(tt, t.hour + 0.3, t.orbit + 0.4)), big: tt < t.hour + 0.3 ? 1 : 0 }; }
    const a = tt - PUSH; return { vis: a < 5, p: [COAST[0] - 1.6 * a - 0.15 * a * a, COAST[1] - 0.35 * a, COAST[2] - 0.6 * a], dir: [Math.cos(a * 1.3), Math.sin(a * 1.3), 0], roll: a * 0.8 };
  }
  const qa = new THREE.Quaternion(), qr = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), dv = new THREE.Vector3();
  function placeRocket(tt) {
    const st = rocketAt(tt); rocket.g.visible = st.vis; if (!st.vis) return st;
    rocket.g.position.set(...st.p); dv.set(...st.dir).normalize(); qa.setFromUnitVectors(up, dv); qr.setFromAxisAngle(up, st.roll ?? 0); rocket.g.quaternion.copy(qa).multiply(qr);
    rocket.g.scale.setScalar(st.s ?? 1); if (st.wob) rocket.g.rotation.z += st.wob;
    rocket.setFlame((st.flame ?? 0) * (st.big ? 1.4 : 1), tt); return st;
  }
  const v3 = new THREE.Vector3();
  const local = (obj, p) => { obj.updateMatrixWorld(true); return obj.localToWorld(v3.set(...p)).toArray(); };

  // Gary: one pose function for the whole take (yard → cockpit → orbit → station), reparented to the rocket while riding
  const FLOAT = (tt, k = 1) => ({ armL: { x: -0.35 + 0.35 * Math.sin(tt * 2.6), z: 1.0 * k + 0.15 + 0.15 * Math.sin(tt * 1.9), el: 0.4 + 0.2 * Math.sin(tt * 3.1) }, armR: { x: -0.35 + 0.35 * Math.sin(tt * 2.8 + 1), z: 1.0 * k + 0.15 + 0.15 * Math.sin(tt * 2.1 + 2), el: 0.4 + 0.2 * Math.sin(tt * 2.7 + 1) }, legL: { x: -0.3 + 0.4 * Math.sin(tt * 2.2), kn: 0.5 + 0.3 * Math.sin(tt * 2.2 + 1.2) }, legR: { x: -0.3 + 0.4 * Math.sin(tt * 2.2 + PI), kn: 0.5 + 0.3 * Math.sin(tt * 2.2 + PI + 1.2) } });   // paddling, bicycling
  function garyAt(tt) {
    let p = { t: tt }, parent = scene, helmet = false, pack = false;
    const G0 = [1.05, 0, -0.95];
    if (tt < t.so0 + 0.1) { p = { x: G0[0], z: G0[2], rotY: -0.55, eyes: 'open', mouth: 'frown', brows: -0.8, look: [-0.6, 0.4], head: { x: -0.3, y: -0.4 }, armR: { x: -2.4 + 0.2 * Math.sin(tt * 9), z: 0.3, el: 0.3 }, armL: { x: 0, z: 0.25, el: 0.6 } }; }
    else if (tt < POLE_UP + 0.5) { const u = smooth(u01(tt, t.so0 + 0.1, t.hang + 0.1)), x = lerp(G0[0], 0.42, u), z = lerp(G0[2], -1.2, u), yank = smooth(u01(tt, POLE_UP - 0.15, POLE_UP + 0.15));
      p = { x, z, rotY: -1.2, walk: u < 1 ? tt * 11 : null, eyes: 'open', mouth: yank > 0 ? 'teeth' : 'flat', brows: -0.5, armL: { x: -1.4 - yank * 1.2, z: 0.2, el: 0.3 }, armR: { x: -1.4 - yank * 1.2, z: 0.1, el: 0.3 }, look: [-0.5, 0.6 * yank], squash: [1 + 0.06 * yank, 1 - 0.04 * yank] }; }
    else if (tt < t.bso) { const u = smooth(u01(tt, POLE_UP + 0.5, t.c0 + 0.3)), x = lerp(0.42, 0.95, u), z = lerp(-1.2, -0.55, u), tada = smooth(u01(tt, t.c0 - 0.1, t.c0 + 0.25)) * (1 - smooth(u01(tt, t.station0 + 0.3, t.cq))), sad = smooth(u01(tt, t.five - 0.1, t.five + 0.3));
      p = { x, z, rotY: lerp(-1.2, -0.25, u), walk: u > 0 && u < 1 ? tt * 11 : null, eyes: sad ? 'half' : 'open', mouth: sad > 0.5 ? 'frown' : 'grin', brows: sad ? 0.8 : 0.2, armL: { x: -2.6 * tada, z: 0.4 + 0.5 * tada, el: 0.3 }, armR: { x: -2.6 * tada, z: 0.4 + 0.5 * tada, el: 0.3 }, head: { x: -0.35 - 0.25 * (1 - tada), y: -0.15 }, look: [-0.2, 0.8] }; }
    else if (tt < t.bthis + 0.3) { const u = smooth(u01(tt, t.bso, t.put)), x = lerp(0.95, 0.38, u), z = lerp(-0.55, -1.15, u), shoo = clamp((tt - t.bso) / 0.6), snap = smooth(u01(tt, CONE - 0.25, CONE)), back = smooth(u01(tt, t.pole, t.bthis + 0.3));
      p = { x: lerp(x, 0.95, back), z: lerp(z, -0.6, back), rotY: lerp(-1.25, -0.4, back), walk: (u > 0 && u < 1) || (back > 0 && back < 1) ? tt * 11 : null, eyes: 'open', mouth: shoo < 1 ? 'o' : 'grin', brows: -0.6, armL: { x: -2.3 * (1 - snap) * (shoo < 1 ? 1 : 0) - 1.3 * snap, z: 0.5 + 0.6 * Math.sin(tt * 18) * (shoo < 1 ? 1 : 0), el: 0.4 }, armR: { x: -2.3 * (shoo < 1 ? 1 : 0) - 1.3 * snap, z: 0.4, el: 0.4 }, look: [-0.5, 0.2] }; }
    else if (tt < t.jit - 0.35) { p = { x: 0.95, z: -0.6, rotY: -0.35, eyes: 'half', mouth: 'grin', brows: -0.2, armL: { x: -1.1, z: -0.25, el: 1.9 }, armR: { x: -1.1, z: -0.25, el: 1.9 }, head: { y: tt > t.not ? -0.6 : 0 }, look: tt > t.not ? [-0.9, 0.3] : [-0.5, -0.2] }; }   // arms crossed, smug — then he sees the branch
    else if (tt < STEP) { const u = smooth(u01(tt, t.jit - 0.35, t.ten - 0.1)), x = lerp(0.95, -1.45, u), z = lerp(-0.6, -1.3, u), onFace = tt > FACE - 0.05;
      p = { x, z, rotY: u < 1 ? -1.6 : -0.45, walk: u > 0 && u < 1 ? tt * 12 : null, eyes: onFace ? 'wide' : 'open', mouth: onFace ? 'scream' : 'flat', brows: onFace ? 1 : -0.7, head: { x: -0.45, y: -0.5 }, look: [-0.7, 0.7], armR: onFace ? { x: -2.2, z: 0.9 + 0.3 * Math.sin(tt * 30), el: 0.6 } : { x: -2.1, z: 0.2, el: 1.0 + 0.3 * Math.sin(tt * 14) }, armL: onFace ? { x: -2.2, z: 0.9 + 0.3 * Math.sin(tt * 27), el: 0.6 } : { x: 0, z: 0.25, el: 0.6 } }; }
    else if (tt < t.rso + 0.25) { const fall = smooth(u01(tt, STEP, STEP + 0.3)); p = { x: -1.45, z: -1.3 - 0.4 * fall, rotY: -0.45, rx: -1.45 * fall, y: 0.05 * fall, eyes: 'spiral', mouth: 'wavy', armL: { x: -0.4, z: 1.2 }, armR: { x: -0.4, z: 1.2 }, legL: { x: -0.4, kn: 0.2 }, legR: { x: 0.2, kn: 0.3 } }; }
    else if (tt < IGN1 + 0.4) { const up2 = smooth(u01(tt, t.rso + 0.25, t.rso + 0.6)), u = smooth(u01(tt, t.rso + 0.5, t.strap + 0.4)), x = lerp(-1.45, 0.75, u), z = lerp(-1.7, -1.0, u), grab = smooth(u01(tt, GRAB - 0.2, GRAB)), swing = smooth(u01(tt, GRAB + 0.1, TAPED - 0.2)), back = smooth(u01(tt, TAPED + 0.1, IGN1 + 0.3));
      p = { x: lerp(x, 0.6, back), z: lerp(z, -0.3, back), rotY: lerp(1.2 - 2.4 * (1 - swing) * grab, 0.4, back), rx: -1.45 * (1 - up2), walk: (u > 0 && u < 1) || (back > 0 && back < 1) ? tt * 12 : null, eyes: tt < t.rso + 0.5 ? 'spiral' : 'open', mouth: grab && !back ? 'teeth' : back ? 'o' : 'flat', brows: -0.4, armL: { x: -1.5 * grab * (1 - back) - 1.2 * back, z: 0.3, el: 0.4 + 1.5 * back }, armR: { x: -1.5 * grab * (1 - back) - 1.2 * back, z: 0.3, el: 0.4 + 1.5 * back }, look: [0.3, 0.4] }; }
    else if (tt < IMPACT) { const u = smooth(u01(tt, IGN1 + 0.4, t.rand)), see = smooth(u01(tt, t.back - 0.1, t.back + 0.2));
      p = { x: lerp(0.6, 1.62, u), z: lerp(-0.3, -0.8, u), rotY: 0.1, walk: u > 0 && u < 1 ? tt * 12 : null, head: { x: -0.75 }, eyes: see ? 'wide' : 'open', mouth: see ? 'scream' : 'flat', look: [0, 1], brows: see ? 1 : 0, armR: see ? { x: -2.8, z: 0.5, el: 0.3 } : { x: -1.9, z: -0.3, el: 2.0 }, armL: see ? { x: -2.8, z: 0.5, el: 0.3 } : { x: 0, z: 0.25, el: 0.5 } }; }
    else if (tt < POPOUT) { p = { x: 1.55, z: -0.75, y: -0.78, rx: PI, rotY: 0.2, legL: { x: 0.4 * Math.sin(tt * 22), kn: 0.6 }, legR: { x: -0.4 * Math.sin(tt * 22), kn: 0.6 }, armL: { x: 0, z: 0.2 }, armR: { x: 0, z: 0.2 } }; }   // legs sticking out of the crater, kicking
    else if (tt < INCOCKPIT) { const u = u01(tt, POPOUT, POPOUT + 0.4), c = arcP([1.55, -0.4, -0.75], [1.15, 0, -0.45], u, 1.4), jump = smooth(u01(tt, UPRIGHT - 0.1, INCOCKPIT)), c2 = arcP([1.15, 0, -0.45], [2.1, 1.45, -0.95], jump, 1.0);
      p = { x: jump ? c2[0] : c[0], y: jump ? c2[1] : Math.max(0, c[1]), z: jump ? c2[2] : c[2], rotY: 0.2, rx: u < 1 ? -PI * 2 * u : 0, eyes: 'spiral', mouth: 'wavy', armL: { x: -2.5, z: 0.5 }, armR: { x: -2.5, z: 0.5 }, squash: tt > POPOUT + 0.4 && !jump ? squash(tt, POPOUT + 0.4, 0.3) : [1, 1] }; }
    else if (tt < EXIT) { parent = rocket.body; const blast = tt > IGN2 ? 1 : 0; p = { x: 0, y: 2.25 - 1.12 - 0.02, z: 0.0, rotY: 0, eyes: blast ? 'wide' : 'open', mouth: blast && tt < ORBIT_IN ? 'scream' : tt > ORBIT_IN ? 'o' : 'grin', brows: blast ? 1 : 0, hairUp: blast && tt < ORBIT_IN ? 1 : 0, squash: blast && tt < ORBIT_IN ? [1.05, 0.93] : [1, 1], armL: { x: 0, z: 0.2 }, armR: { x: 0, z: 0.2 }, look: [0, 0] }; }   // in the cockpit bubble
    else if (tt < t.tiny + 0.6) { helmet = true; const u = smooth(u01(tt, EXIT, t.too)), c = local(rocket.body, [0, 1.15, 0.55]), tgt = P(-1.7, 0.5, 0.7), pos = LP(c, tgt, u);
      p = { x: pos[0], y: pos[1], z: pos[2], rotY: 0.15 * Math.sin(tt * 0.8), rx: 0.25 * Math.sin(tt * 1.3) + 0.15, rz: 0.2 * Math.sin(tt * 0.9 + 1), eyes: 'wide', mouth: tt < t.too ? 'o' : 'grin', brows: 0.6, ...FLOAT(tt), look: [0.2, 0] }; }
    else if (tt < DIVE) { helmet = true; const u = smooth(u01(tt, t.tiny + 0.6, t.rooms - 0.1)), pos = LP(P(-1.7, 0.5, 0.7), P(-0.1, 1.15, 0.45), u), bolt = tt > BOLT1 - 0.3;
      p = { x: pos[0], y: pos[1], z: pos[2], rotY: 0.1, rx: 0.2 + 0.1 * Math.sin(tt), rz: -0.15 * u, eyes: 'open', mouth: bolt ? 'teeth' : 'grin', brows: -0.2, ...FLOAT(tt, 0.6), armR: bolt ? { x: -1.5, z: -0.3 + 0.35 * Math.sin(tt * 20), el: 0.6 } : { x: -1.6, z: 0.2, el: 0.6 }, look: [0.4, -0.5] }; }
    else if (tt < LATCH + 0.6) { const into = smooth(u01(tt, DIVE, DIVE + 0.5)), down = smooth(u01(tt, DIVE + 0.5, LATCH - 0.25)), y = lerp(lerp(1.15, -0.9, into), -4.6 - 0.62 + 0.5, down);
      const sq2 = tt > LATCH ? [1.5 - 0.5 * smooth(u01(tt, LATCH + 0.3, LATCH + 0.6)), 0.5 + 0.5 * smooth(u01(tt, LATCH + 0.3, LATCH + 0.6))] : [1, 1];
      p = { x: D.st[0] + lerp(-0.1, 0, into), y: D.st[1] + y, z: lerp(0.45, 0.15, into), rotY: 0, eyes: tt > LATCH ? 'x' : 'open', mouth: tt > LATCH ? 'scream' : down > 0.3 ? 'o' : 'grin', brows: tt > LATCH ? 1 : 0, ...FLOAT(tt, 0.4), squash: sq2, look: [0, -0.6] }; helmet = tt < DIVE + 0.35; }
    else if (tt < WHOOSH) { const u = smooth(u01(tt, LATCH + 0.6, t.dthen + 0.6)), y = lerp(-4.6 - 0.12, -2.6 - 0.62 - 0.05, u), toHatch = smooth(u01(tt, t.kgary - 0.2, t.opens + 0.05)), turn = tt > t.opens - 0.15;
      p = { x: D.st[0] + lerp(0, 0.72, toHatch), y: D.st[1] + y, z: lerp(0.15, 0.1, toHatch), rotY: turn ? 1.1 : 0.2 * Math.sin(tt * 0.7), rx: 0.08 * Math.sin(tt * 1.1), eyes: tt > LIGHTS_OFF - 0.1 && tt < t.kgary ? 'wide' : 'open', mouth: tt > t.dark && tt < t.kgary ? 'o' : 'flat', brows: 0.5, ...FLOAT(tt, 0.5), armR: turn ? { x: -1.5, z: -0.2 + 0.3 * Math.sin(tt * 16), el: 0.5 } : FLOAT(tt, 0.5).armR, look: turn ? [0.8, 0] : [0.3, 0.6] }; }
    else if (tt < HAUL1) { const u = clamp((tt - WHOOSH) / (TAUT - WHOOSH)), e = 1 - (1 - u) ** 2, x = lerp(0.72, 3.5, e) + (tt > TAUT ? 0.15 * wobble(tt, TAUT, 1, 14, 4) - 0.15 : 0), back = smooth(u01(tt, HAUL0, HAUL1));
      p = { x: D.st[0] + lerp(x, 1.05, back), y: D.st[1] - 2.62 - 0.55 + 0.25 * Math.sin(u * PI), z: 0.1 + 0.2 * e * (1 - back), rotY: PI / 2 - 0.4, rz: -1.2 * e * (1 - back) + Math.sin(tt * 6) * 0.15 * (1 - back), eyes: 'wide', mouth: back > 0.5 ? 'frown' : 'teeth', brows: 1, faceTint: [0x2f5ff0, 0.8 * (1 - back)], squash: [1 - 0.1 * (1 - back), 1], armL: { x: -2.6, z: 0.6 }, armR: { x: -2.6, z: 0.6 }, legL: { x: 0.3, kn: 0.2 }, legR: { x: -0.2, kn: 0.2 }, look: [0, 0] }; }
    else if (tt < OUT0) { const inn = smooth(u01(tt, INTO_AL - 0.1, INTO_AL + 0.5)), wipe = tt > WIPE && tt < WIPE + 1.0, gear = smooth(u01(tt, t.mudroom + 0.35, t.aspace + 0.15));
      p = { x: D.st[0] + lerp(1.05, 3.25, inn), y: D.st[1] - 2.62 - 0.45 + (wipe ? 0.08 * Math.sin(tt * 18) : 0), z: lerp(0.1, -0.15, inn), rotY: inn > 0.5 ? 0.3 : PI / 2, eyes: 'open', mouth: wipe ? 'flat' : 'grin', brows: wipe ? -0.3 : 0, legL: { x: wipe ? 0.5 * Math.sin(tt * 18) : 0, kn: 0.3 }, legR: { x: wipe ? -0.5 * Math.sin(tt * 18) : 0, kn: 0.3 }, armL: { x: -1.2 * gear, z: 0.3, el: 1.2 * gear }, armR: { x: -1.2 * gear, z: 0.3, el: 1.2 * gear }, look: [0.4, -0.5] };
      helmet = gear > 0.6; pack = gear > 0.3; }
    else if (tt < SWAT + 1.3) { helmet = tt < SWAT + 1.05; pack = true;
      const k = unfoldK(tt), TIP = P(tipX(k) + 0.15, D.truss.y - 0.9, 0.78), outU = smooth(u01(tt, OUT0, AT_ROOT)), gone = tt > SWAT;
      let pos = tt < AT_ROOT ? arcP(P(3.25, -2.6 - 0.45, -0.15), P(ROOTX + 0.75, D.truss.y - 0.9, 0.78), outU, 1.6) : TIP, rz = 0, rx = 0.15;
      if (gone) { const a = tt - SWAT, A = P(tipX(1) + 0.15, D.truss.y - 0.9, 0.78); let prev = A, ta = 0; for (const [tb, q] of FLING.slice(1)) { if (a <= tb) { const u = (a - ta) / (tb - ta); pos = ta === 0 ? arcP(prev, q, smooth(u), 1.2) : LP(prev, q, u); break; } prev = q; ta = tb; pos = q; } rz = a * 14; rx = a * 5; }
      const ride = tt > AT_ROOT && tt < UNF1 + 0.2, poke = tt > t.sit - 0.25 && !gone;
      p = { x: pos[0], y: pos[1], z: pos[2], rotY: ride ? 0.7 : 0.25, rz: gone ? rz : (ride ? -0.25 : 0), rx, eyes: gone ? 'spiral' : poke ? 'wide' : 'open', mouth: gone ? 'scream' : ride ? 'grin' : poke ? 'o' : 'grin', brows: gone ? 1 : -0.2, ...FLOAT(tt, 0.6),
        armR: ride ? { x: -2.4, z: 0.4, el: 0.3 } : poke ? { x: -1.6, z: -0.5, el: 0.2 } : { x: -1.8, z: 0.3, el: 0.4 }, armL: ride ? { x: -0.6, z: 1.3, el: 0.3 } : FLOAT(tt, 0.6).armL, look: [0.6, 0.2] }; }
    else if (tt < HIT) { const u = smooth(u01(tt, SWAT + 1.3, t.blue - 0.15)), side = smooth(u01(tt, t.life - 0.2, t.sweat + 0.2)), down = smooth(u01(tt, t.wback - 0.1, t.yesterdays - 0.15)), G2s = P(-0.42, MT[1] - 2.85, 0.35), RING = P(0, MT[2] + 0.2, 0.3);
      const pos = down > 0 ? (down < 0.5 ? LP(G2s, RING, down * 2) : LP(RING, G3, down * 2 - 1)) : LP(LP(P(-0.65, MT[1] - 2.0, 0.25), G2, u), G2s, side), bonk = tt < SWAT + 1.9, blue = smooth(u01(tt, BLUE0 - 0.3, t.blue)) * (1 - smooth(u01(tt, SCRUB + 0.4, PINK)));
      const sip = tt > SIP - 0.3 && tt < GULP + 0.8, gulp = tt > GULP - 0.15 && tt < GULP + 0.6, aftr = tt > GULP + 0.2;
      p = { x: pos[0], y: pos[1], z: pos[2], rotY: tt > t.sweat - 0.3 && tt < t.n98 ? 0.5 : 0.1 * Math.sin(tt * 0.7), rx: 0.08 * Math.sin(tt * 1.2), eyes: bonk ? 'spiral' : blue > 0.3 ? 'half' : gulp ? 'wide' : 'open', mouth: bonk ? 'wavy' : blue > 0.3 ? 'wavy' : gulp ? 'o' : aftr ? 'wavy' : tt > t.yesterdays - 0.2 && tt < SIP ? 'grin' : 'flat', brows: blue > 0.3 ? 0.9 : aftr ? 0.7 : 0,
        faceTint: blue > 0.01 ? [0x2f5ff0, 0.92 * blue] : aftr ? [0x7fb86a, 0.6 * smooth(u01(tt, GULP + 0.2, GULP + 0.5))] : null, ...FLOAT(tt, 0.5),
        armR: sip ? { x: -1.9, z: -0.2, el: 1.7 } : FLOAT(tt, 0.5).armR, armL: tt > t.recycle && tt < t.life ? { x: -1.6, z: 0.6, el: 0.2 } : FLOAT(tt, 0.5).armL, look: blue > 0.3 ? [0, -0.3] : [0.3, -0.2] }; }
    else { // M2: sucked onto the hole, plugged to the end
      const startle = smooth(u01(tt, HIT, HIT + 0.3)), suck = clamp((tt - SUCK0) / (PLUG - SUCK0)), e = suck * suck, from = LP(G3, P(-0.15, MT[2] - 3.3, 0.35), startle), RING = P(0, MT[3] + 0.25, 0.3);
      const tug = tt > t.still - 0.3 && tt < t.still + 0.45 ? Math.sin(PI * clamp((tt - t.still + 0.3) / 0.65)) : 0, pos0 = tt < SUCK0 ? from : e < 0.5 ? LP(from, RING, e * 2) : LP(RING, HOLE, e * 2 - 1), pos = [pos0[0], pos0[1], pos0[2] + 0.35 * tug * (tt < t.still + 0.3 ? 1 : 0.2)], plugged = tt > PLUG, wave = tt > t.egary - 0.1 && tt < t.eplug + 0.8, pfft = tt > SEED_OUT - 0.1 && tt < SEED_OUT + 0.35;
      p = { x: pos[0], y: pos[1], z: pos[2], rotY: plugged ? 0 : 0.4 * Math.sin(tt), rx: plugged ? 0 : -0.3 * e, eyes: plugged ? (pfft ? 'closed' : 'wide') : suck > 0 ? 'wide' : 'open', mouth: plugged ? (pfft ? 'o' : tt > t.tinfoil ? 'flat' : 'teeth') : suck > 0 ? 'scream' : 'flat', brows: plugged ? 0.8 : suck > 0 ? 1 : 0,
        squash: plugged ? (tt < PLUG + 0.6 ? squash(tt, PLUG, 0.45) : [1.08 + 0.02 * Math.sin(tt * 3), 0.94]) : [1, 1], armL: plugged ? { x: -0.2, z: 1.45, el: 0.2 } : { x: -2.4, z: 0.8 }, armR: tug > 0.1 ? { x: -1.6, z: 0.2, el: 0.2 } : wave ? { x: -2.3, z: 0.3, el: 0.4 + 0.5 * Math.sin(tt * 9) } : plugged ? { x: -0.4, z: 1.3, el: 0.3 } : { x: -2.4, z: 0.8 },
        legL: plugged ? { x: -1.45, kn: 0.25 + 0.1 * Math.sin(tt * 2) } : FLOAT(tt).legL, legR: plugged ? { x: -1.35, kn: 0.3 } : FLOAT(tt).legR, look: [0, 0], cheeks: plugged, faceTint: plugged ? [0xe8504a, tt < PLUG + 1.4 ? 0.4 : 0.18] : null }; }
    if (gary.root.parent !== parent) parent.add(gary.root);
    gary.set(p); gHelmet.visible = helmet; gPack.visible = pack; gary.head.position.z = parent === rocket.body ? 0.4 : 0;   // in the cockpit: the body stays inside the hull, the head sits in the bubble
    return p;
  }
  // the squirrel
  const SS = 1.35;   // the squirrel reads bigger in space (it runs the place by the end)
  function sqAt(tt) {
    let p = { t: tt, pose: 'sit' }, parent = scene, hidden = false;
    const ROOF = (h) => [0.02, h + 0.44, -1.62];
    if (tt < t.so0 + 0.2) p = { ...p, x: 0.02, y: 1.07, z: -1.43, rotY: 0.1, cheeks: 1, chew: 1, eyes: 'half', hold: true, look: [0.3, 0] };
    else if (tt < t.bso + 0.3) { const ph = pop(tt, POLE_UP - 0.05, 0.3), h = lerp(1.0, 2.0, Math.min(1, ph)), onRoof = smooth(u01(tt, POLE_UP + 0.4, t.c0 + 0.2)), r = arcP([0.02, h + 0.07, -1.43], ROOF(h), onRoof, 0.25);
      p = { ...p, x: r[0], y: r[1], z: r[2], rotY: 0.15, cheeks: tt < t.c0 ? 1 : 0.4, chew: tt < t.c0 ? 1 : 0, eyes: tt > t.five - 0.2 ? 'half' : 'open', hold: tt < t.cq, armsUp: smooth(u01(tt, t.gave - 0.1, t.five)), look: [0.2, 0.2], tailWag: 0.4 }; }
    else if (tt < CONE + 0.4) { const u = clamp((tt - (t.bso + 0.3)) / 0.5), r = arcP(ROOF(2.0), [0.55, 0, -1.05], u, 0.4); p = { ...p, pose: u < 1 ? 'leap' : 'sit', x: r[0], y: r[1], z: r[2], rotY: u < 1 ? 0.6 : -0.6, eyes: 'wide', look: [-0.5, 0.3] }; }
    else if (tt < SLID) { const u = smooth(u01(tt, CONE + 0.4, CONE + 0.7)), x = lerp(0.55, 0.06, u), z = lerp(-1.05, -1.45, u), climb = smooth(u01(tt, CONE + 0.7, BONK)), y = 0.17 * climb;
      p = { ...p, pose: climb > 0 ? 'cling' : 'run', x, y, z, rotY: climb > 0 ? 0 : -2.2, eyes: tt > BONK ? 'x' : 'open', ph: tt * 20 }; }
    else if (tt < ZIP0) { const u = clamp((tt - SLID) / 0.4); p = { ...p, x: 0.06 + 0.25 * u, y: 0.17 * (1 - u) * (1 - u), z: -1.45 + 0.2 * u, rotY: u < 1 ? 0 : 0.3, pose: u < 1 ? 'cling' : 'sit', eyes: 'spiral', look: [0, 0.5] }; }
    else if (tt < ON_BRANCH) { const k = (tt - ZIP0) / (ON_BRANCH - ZIP0), TR = [D.tree[0] + 0.3, 0, D.tree[1] + 0.25];
      let pos, ry = -1.9, pose = 'run', rx = 0;
      if (k < 0.5) { pos = LP([0.3, 0, -1.25], TR, smooth(k / 0.5)); }
      else if (k < 0.75) { pos = LP(TR, [TR[0], 2.15, TR[2]], (k - 0.5) / 0.25); rx = -PI / 2; ry = PI; }
      else { pos = LP([D.tree[0] + 0.3, 2.3, D.tree[1] + 0.2], D.branch, smooth((k - 0.75) / 0.25)); ry = 1.0; }
      p = { ...p, pose, x: pos[0], y: pos[1], z: pos[2], rotY: ry, rx, ph: tt * 26 }; }
    else if (tt < LEAP) { const crouch = smooth(u01(tt, t.feet, LEAP)); p = { ...p, x: D.branch[0] + 0.05, y: D.branch[1] + 0.02, z: D.branch[2], rotY: tt < t.jit ? 0.25 : 1.0, eyes: tt < t.jit ? 'half' : 'open', look: tt < t.jit ? [0, 0] : [0.8, -0.3], squash: [1 + 0.15 * crouch, 1 - 0.2 * crouch], tailWag: crouch * 1.5, cheeks: 0.3 }; }
    else if (tt < STEP + 0.1) { const GF = [-1.44, 1.0, -0.98], u = clamp((tt - LEAP) / (FACE - LEAP)), r = tt < FACE ? arcP(D.branch, GF, u, 0.9) : GF;
      p = { ...p, pose: tt < FACE ? 'leap' : 'sit', x: r[0], y: r[1], z: r[2], rotY: 1.2, rx: tt < FACE ? 0 : -0.3, eyes: 'open', squash: tt > FACE ? squash(tt, FACE, 0.3) : [1, 1], look: [0.6, 0.3] }; }
    else if (tt < GRAB - 0.15) { const u = clamp((tt - STEP - 0.1) / 0.45), r = arcP([-1.42, 1.0, -0.98], ROOF(poleH(tt)), u, 0.8); p = { ...p, pose: u < 1 ? 'leap' : 'sit', x: r[0], y: r[1], z: r[2], rotY: u < 1 ? 1.5 : 0.1, eyes: 'half', cheeks: u >= 1 ? 0.8 : 0, chew: u >= 1 ? 1 : 0, hold: u >= 1 }; }
    else if (tt < UPRIGHT + 0.1) { const u = clamp((tt - GRAB + 0.15) / 0.45), r = arcP(ROOF(poleH(GRAB)), [-0.45, 0, -0.95], u, 0.7), see = tt > IGN1; p = { ...p, pose: u < 1 ? 'leap' : 'sit', x: r[0], y: r[1], z: r[2], rotY: see ? 0.5 : -0.3, eyes: see ? 'wide' : 'half', look: see ? [0.8, 0.8] : [0.5, 0], tailWag: 0.5 }; }
    else if (tt < SQ_LET) { const jump = smooth(u01(tt, UPRIGHT + 0.1, INCOCKPIT)), fp = local(rocket.body, [0, 1.7, 0.6]);   // a stowaway: it dives into the feeder taped to the rocket
      const r = arcP([-0.45, 0, -0.95], fp, jump, 1.0); p = { ...p, pose: 'leap', x: r[0], y: r[1], z: r[2], rotY: 0.8, squash: [1 - 0.3 * jump, 1 + 0.2 * jump] }; hidden = jump >= 1; }
    else if (tt < t.tiny - 0.1) { const u = smooth(u01(tt, SQ_LET, t.fsq - 0.05)), c = local(rocket.body, [0, 1.75, 0.6]), pos = arcP(c, P(-2.7, 0.1, 1.4), u, 0.3), out = Math.max(0.05, easeOutBack(u01(tt, SQ_LET, SQ_LET + 0.3), 2.4));   // SO IS THE SQUIRREL: it pops out of the feeder in a tiny helmet
      p = { ...p, pose: 'float', x: pos[0], y: pos[1], z: pos[2], rotY: 0.2, rx: 0.3 * Math.sin(tt * 1.4), helmet: true, cheeks: 1, chew: 1, eyes: 'open', look: [0, 0], tailWag: 1, scale: SS * out, armsUp: tt < t.fsq + 0.4 ? 1 : 0 }; }
    else if (tt < DIVE + 0.6) { const fd = feeder.g.position, u = smooth(u01(tt, t.tiny - 0.1, t.tiny + 0.35)), pos = LP(P(-2.7, 0.1, 1.4), [fd.x, fd.y + 0.44, fd.z], u);
      p = { ...p, pose: u < 1 ? 'float' : 'sit', x: u < 1 ? pos[0] : fd.x, y: u < 1 ? pos[1] : fd.y + 0.44, z: u < 1 ? pos[2] : fd.z, rotY: 0.2, helmet: true, cheeks: 1, chew: 1, eyes: 'half', hold: true }; }
    else if (tt < WHOOSH) { const u = smooth(u01(tt, DIVE + 0.6, t.docking + 0.3)), pos = LP(P(0.75, 0.46, 0.4), P(-0.6, -1.6, 0.3), u), toHatch = smooth(u01(tt, t.kgary, t.hatch));
      const pos2 = LP(pos, P(1.0, -2.15, 0.35), toHatch); p = { ...p, pose: 'float', x: pos2[0], y: pos2[1], z: pos2[2], rotY: 0.3, helmet: true, cheeks: 0.6, eyes: tt > LIGHTS_OFF - 0.1 && tt < t.kgary ? 'wide' : 'open', tailWag: 0.5 }; }
    else if (tt < INTO_AL) { const pos = P(1.1, -2.15, 0.35); p = { ...p, pose: 'cling', x: pos[0], y: pos[1], z: pos[2], rotY: -PI / 2, rz: tt < HAUL1 ? 0.2 * Math.sin(tt * 22) : 0, helmet: true, eyes: tt < HAUL1 ? 'wide' : 'open', tail: tt < HAUL1 ? -1 : 0, tailWag: tt < HAUL1 ? 3 : 0.5 }; }
    else if (tt < OUT0 + 0.5) { const inn = smooth(u01(tt, INTO_AL, INTO_AL + 0.5)), pos = LP(P(1.1, -2.15, 0.35), P(3.7, -3.42, 0.05), inn), wipe = tt > WIPE + 0.15; p = { ...p, pose: wipe ? 'sit' : 'float', x: pos[0], y: pos[1], z: pos[2], rotY: wipe ? -0.3 : 0.3, helmet: true, eyes: wipe ? 'half' : 'open', ph: tt * 30, squash: wipe ? [1, 1 + 0.06 * Math.sin(tt * 30)] : [1, 1] }; }
    else if (tt < t.inside + 0.4) { p = { ...p, pose: 'sit', x: P(3.7)[0], y: P(0, -3.42)[1], z: 0.05, rotY: 0.4, helmet: true, eyes: 'half', cheeks: 0.8, chew: 1, hold: true }; }
    else if (tt < HIT) {   // beside Gary in each room: life support (the only one not blue: helmet on, eating), the PEE bag, then the galley
      const u = smooth(u01(tt, t.inside + 0.4, t.blue - 0.1)), M2S = P(-0.9, MT[1] - 1.85, 0.55), pos = LP(P(1.4, -3.42, 0.05), M2S, u), bag = smooth(u01(tt, t.even - 0.4, PEE_IN)), BAG = P(0.72, MT[1] - 2.6, 0.25);
      const back = smooth(u01(tt, PEE_IN + 0.3, t.n98 + 0.3)), down = smooth(u01(tt, t.wback, t.yesterdays)), M3S = P(0.55, MT[2] - 2.55, 0.5);
      const pos2 = down > 0 ? LP(LP(BAG, M2S, back), M3S, down) : LP(LP(pos, BAG, bag), M2S, back);
      p = { ...p, pose: 'float', x: pos2[0], y: pos2[1], z: pos2[2], rotY: 0.25, helmet: true, cheeks: bag > 0 && back < 1 ? 0.2 : 1, chew: bag > 0 && back < 1 ? 0 : 1, eyes: tt > t.blue && tt < t.iso ? 'half' : 'open', hold: !(bag > 0 && back < 1), armsUp: bag > 0.2 && tt < PEE_IN + 0.3 ? 1 : 0, look: [0.2, -0.3], tailWag: 0.6 }; }
    else if (tt < t.bulletproof + 1.2) { const r = P(0.6, MT[3] + 0.38, 0.35), hang = tt < PLUG; p = { ...p, pose: 'cling', x: r[0], y: r[1], z: r[2], rotY: 0, rx: hang ? 0.5 : 0.1, helmet: true, eyes: tt > PLUG ? 'half' : 'wide', tail: hang ? -1 : 0, tailWag: hang ? 3 : 0.4 }; }   // hangs on the hatch rim while the air rushes down
    else if (tt < TREAD) { const u = smooth(u01(tt, t.bulletproof + 1.2, TREAD - 0.1)), r = arcP(P(0.6, MT[3] + 0.38, 0.35), P(-0.88, MT[3] - 3.18, 0.15), u, 0.3); p = { ...p, pose: 'float', x: r[0], y: r[1], z: r[2], rotY: 0.3, helmet: true, eyes: 'open' }; }
    else { const tp = P(-0.88, MT[3] - 3.3 + 0.14 * 0.75 + 0.02, 0.15); p = { ...p, pose: 'jog', x: tp[0], y: tp[1], z: tp[2], rotY: 0.75, ph: tt * 20, helmet: true, hat: tt > t.runs - 0.15, eyes: tt > t.runs ? 'half' : 'open', cheeks: 0.5, look: [-0.6, 0.2] }; }   // three-quarter to the lens
    if (tt > INCOCKPIT && p.scale === undefined) p.scale = SS;
    if (sq.root.parent !== parent) parent.add(sq.root);
    sq.set(p); sq.root.visible = !hidden; return p;
  }
  function feederAt(tt) {
    let pos = [0, 1.015, -1.6], parent = scene, ry = 0;
    if (tt < GRAB) pos = [0, poleH(tt) + 0.015, -1.6];
    else if (tt < TAPED) { gary.root.updateMatrixWorld(true); const hp = gary.hand(1).getWorldPosition(v3).toArray(), u = smooth(u01(tt, GRAB, GRAB + 0.25)), stick = smooth(u01(tt, TAPED - 0.3, TAPED - 0.05)); pos = LP(LP([0, poleH(tt) + 0.015, -1.6], [hp[0], hp[1] - 0.2, hp[2] + 0.12], u), local(rocket.body, [0, 1.25, 0.6]), stick); ry = -0.4 * stick; }   // in his hands
    else if (tt < t.tiny - 0.2) { parent = rocket.body; pos = [0, 1.25, 0.58]; }
    else if (tt < BOLT1 - 0.1) { gary.root.updateMatrixWorld(true); const hp = gary.hand(1).getWorldPosition(v3).toArray(), lift = smooth(u01(tt, t.tiny - 0.2, t.tiny + 0.1)); pos = LP(local(rocket.body, [0, 1.25, 0.58]), [hp[0] + 0.05, hp[1] - 0.1, hp[2] + 0.12], lift); if (tt > M1_IN1) pos = LP(pos, P(0.75, 0.02, 0.4), smooth(u01(tt, M1_IN1, BOLT1 - 0.1))); }
    else pos = P(0.75, 0.02, 0.4);
    if (feeder.g.parent !== parent) parent.add(feeder.g);
    feeder.g.position.set(...pos); feeder.g.rotation.set(0, ry, 0);
    const roofOpen = tt > EXIT + 0.1; feeder.setRoof(roofOpen ? 0.1 + 0.03 * Math.sin(tt * 2) : 0, roofOpen ? 0.5 : 0); feeder.setFill(tt < t.robbing ? 1 : tt < IMPACT ? 0.75 : 0.5);
  }
  function birdsAt(tt) {
    birds.forEach((b, i) => {
      let x = BIRD_X[i], y = D.fence.top + 0.04, z = D.fence.z, ry = -0.25, peck = 0, flap = 0, hop = 0, soot = 0, wide = false;
      if (tt < IGN1) { flap = tt > t.robbing && tt < t.robbing + 0.6 && i === 0 ? 1 : 0; hop = tt > t.five && tt < t.stars + 0.5 && i === 1 ? 1 : 0; ry = -0.5; }
      if (tt > IMPACT - 0.05 && tt < IMPACT + 0.7) { const a = tt - IMPACT + 0.05; y += 0.6 * Math.sin(Math.min(PI, a * 4.5)); flap = 1; wide = true; }
      if (tt > D0 - 1) {   // the ending: the cardinal on the empty pole's top plate, the others on the rail
        if (i === 0) { x = 0.0; y = 1.035; z = -1.66; ry = 0.15; } else { x = BIRD_X[i] - 0.35; }
        if (i === 0 && tt > LAND) { peck = tt > LAND + 0.35 && tt < LAND + 0.9 ? 1 : 0; soot = smooth(u01(tt, LAND + 0.5, LAND + 0.7)); wide = tt > LAND; flap = tt > LAND + 0.5 && tt < LAND + 0.9 ? 1 : 0; }
        if (i > 0) ry = -0.9;
      }
      b.set({ x, y, z, rotY: ry, t: tt, peck, flap, hop, soot, wide, ph: i * 1.7, look: i === 0 && tt > D0 ? -0.3 : 0, scale: i === 0 && tt > LAND ? 1 + 0.28 * smooth(u01(tt, LAND + 0.45, LAND + 0.65)) : 1 });   // feathers puff
    });
  }

  // ---------------------------------------------------------------- the frame
  function update(tt) {
    // world state: sky by camera altitude, the sun, cloud drift, power
    const sunDay = new THREE.Vector3(0.42, 0.72, 0.55).normalize(), sunNight = new THREE.Vector3(0.25, -0.42, -0.87).normalize(), sunMid = new THREE.Vector3(0.5, 0.12, -0.86).normalize();
    let sd = sunDay.clone(), sk = 1;
    if (tt > SUNSET0 && tt < SUNRISE1) {
      const a = smooth(u01(tt, SUNSET0, SUNSET1)), b = smooth(u01(tt, SUNRISE0, SUNRISE1));
      if (b > 0) sd = b < 0.5 ? sunNight.clone().lerp(sunMid, b * 2).normalize() : sunMid.clone().lerp(sunDay, b * 2 - 1).normalize();
      else sd = a < 0.5 ? sunDay.clone().lerp(sunMid, a * 2).normalize() : sunMid.clone().lerp(sunNight, a * 2 - 1).normalize();
      sk = Math.max(1 - smooth(u01(tt, SUNSET0 + 0.2, SUNSET1)), smooth(u01(tt, SUNRISE0 + 0.4, SUNRISE1)));
      const sw = u01(tt, SWEEP0, SWEEP1); if (sw > 0 && sw < 1) sd.applyAxisAngle(new THREE.Vector3(0, 0, 1), -PI * 2 * 3 * smooth(sw));   // 16 sunsets a day: the terminator sweeps the planet
    }
    if (tt < IGN2 + 3) sd = new THREE.Vector3(0.72, 0.58, 0.38).normalize().lerp(sunDay, smooth(u01(tt, IGN2, IGN2 + 3))).normalize();   // a raking yard sun (from behind the camera flattened the siding)
    { const sw = u01(tt, SWEEP0, SWEEP1); if (sw > 0 && sw < 1) sk = Math.max(sk, 0.85 * Math.sin(PI * sw * 2) ** 2); }   // 16 sunsets a day: the light sweeps over twice
    W.setSun(sd, sk);
    { const spin = (x) => 0.0011 * (x - IGN2) + 0.006 * smooth(u01(x, IGN2 + 1, ORBIT_IN)) + 0.05 * smooth(u01(x, ORBIT_IN - 0.5, t.falls)); W.setCloudSpin(tt < IGN2 ? 0 : tt < D0 - 3 ? spin(tt) : spin(D0 - 3) * (1 - smooth(u01(tt, D0 - 3, D0 - 1.5)))); }   // the clouds streak past at 17,500 mph
    const pw = tt < M1_IN0 ? 1 : tt < LIGHTS_OFF - 0.6 ? 1 : tt < LIGHTS_OFF ? (Math.floor(tt * 14) % 3 ? 0.25 : 1) * (1 - u01(tt, LIGHTS_OFF - 0.6, LIGHTS_OFF)) : tt < POWER_ON - 0.4 ? 0.0 : tt < POWER_ON ? (Math.floor(tt * 12) % 2 ? 0.3 : 0.9) : 1;
    S.setPower(pw); studio.fill.intensity = 0.45 * (tt > M1_IN0 ? lerp(0.35, 1, Math.max(pw, smooth(u01(tt, SUNRISE0, SUNRISE1)))) : 1);   // the dark beat reads dark
    Y.setPole(poleH(tt));
    Y.baffle.visible = tt > CONE - 0.05; Y.baffle.scale.setScalar(Math.max(0.001, easeOutBack(u01(tt, CONE - 0.05, CONE + 0.2), 2.2)));
    Y.baffle.rotation.z = wobble(tt, BONK, 0.15, 22, 6) + wobble(tt, CONE + 0.2, 0.08, 20, 6);
    crater.visible = tt > IMPACT - 0.02; crater.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, IMPACT - 0.02, IMPACT + 0.2), 1.6)));
    tape.forEach((b, k) => { b.visible = tt > TAPED - 0.1 + k * 0.2; b.scale.set(1, Math.max(0.01, pop(tt, TAPED - 0.1 + k * 0.2, 0.25)), 1); });
    dome.visible = true;
    placeRocket(tt);
    garyAt(tt); feederAt(tt); sqAt(tt); birdsAt(tt);
    card.visible = tt > t.gave - 0.2 && tt < t.bso + 0.3;
    if (card.visible) { sq.root.updateMatrixWorld(true); sq.head.getWorldPosition(v3); card.position.set(v3.x + 0.02, v3.y - 0.3 + 0.08 * smooth(u01(tt, t.gave - 0.2, t.five)), v3.z + 0.2); card.rotation.set(0, 0.1, 0.06 * Math.sin(tt * 6)); card.scale.setScalar(Math.max(0.01, pop(tt, t.gave - 0.2, 0.3))); }
    measure.forEach((d, i) => { const k = i / (measure.length - 1), on = tt > t.ten - 0.05 + k * 0.35 && tt < LEAP + 0.2; d.visible = on; if (on) { const r = arcP([D.branch[0] + 0.15, D.branch[1] + 0.15, D.branch[2]], [0, 2.6, -1.6], k, 0.45); d.position.set(...r); d.scale.setScalar(pop(tt, t.ten - 0.05 + k * 0.35, 0.2)); } });
    // the station: modules rise in from below and dock; the airlock flies in; the shield, hole, cupola, props pop
    const m1y = tt < M1_IN0 ? -90 : -14 * (1 - easeOutBack(u01(tt, M1_IN0, M1_IN1), 0.8));
    S.g.visible = tt > M1_IN0 - 0.05;
    S.m1.g.position.y = m1y; S.truss.g.position.y = D.truss.y + m1y;
    { const cinch = tt < LATCH - 0.02 ? 1 : 1 - smooth(u01(tt, LATCH - 0.02, LATCH + 0.08));
      for (let i = 1; i < 5; i++) { const A = DOCK_T[i], rise = tt < A - 1.1 ? 1 : 1 - smooth(u01(tt, A - 1.1, A)); S.mods[i].g.position.y = MT[i] - (7 + 2.5 * i) * rise - 0.32 * i * cinch + (tt > A && tt < A + 0.3 ? 0.04 * wobble(tt, A, 1, 20, 8) : 0); S.mods[i].g.visible = tt > A - 1.15; }
      S.rings.forEach((r, i) => { r.visible = tt > LATCH - 0.05; });
      S.cup.position.y = D.bottom + (S.mods[4].g.position.y - MT[4]);
      S.m1.ends.top.door.open(tt > DIVE - 0.4 ? 1 : 0); S.mods.forEach((m, i) => { if (i < 4) m.ends.bot.door.open(tt > M2_CAP - 0.6 ? 1 : 0); if (i > 0) m.ends.top.door.open(tt > M2_CAP - 0.6 ? 1 : 0); }); S.m5.ends.bot.door.open(tt > CUPOLA ? 1 : 0); }
    // M2's fans spin, M4's alarm (after the hit, a slow red beacon), the WC's toilet roll drifts; the HAB's red emergency light while the power is out
    S.m2.g.userData.fans.forEach((f, i) => (f.userData.blades.rotation.z = -tt * (8 + 3 * i) * Math.max(0.15, pw)));
    S.setAlarm(tt > HIT + 0.2 ? 0.55 + 0.45 * Math.sin((tt - HIT) * 3.2) : 0);
    { const tp = S.m5.g.userData.tp; tp.rotation.set(0.5 + tt * 0.6, 0.3 + tt * 0.4, 0.8); tp.position.y = -1.5 + 0.1 * Math.sin(tt * 0.9); }
    emergency.intensity = tt > LIGHTS_OFF - 0.1 && tt < POWER_ON ? 3.2 * (1 - pw) : 0;
    const alU = smooth(u01(tt, AL_IN0, AL_DOCK)); S.al.visible = tt > AL_IN0; S.al.position.set(3.2 * (1 - alU), D.side.y + 3.4 * (1 - alU), 0); S.al.rotation.z = 0.35 * (1 - alU);
    S.outerDoor.open(tt > OUT0 - 0.2 && tt < SWAT + 1.4 ? 1 : 0);
    { const sd = tt < HATCH_OPEN - 0.05 ? 0 : tt < HAUL1 + 0.2 ? smooth(u01(tt, HATCH_OPEN - 0.05, HATCH_OPEN + 0.12)) : tt < AL_DOCK + 0.2 ? 1 - smooth(u01(tt, HAUL1 + 0.2, HAUL1 + 0.5)) : smooth(u01(tt, AL_DOCK + 0.2, AL_DOCK + 0.5)); S.m1.sideDoor.open(sd); S.m1.sideDoor.wheel.rotation.x = tt > t.opens - 0.1 && tt < HATCH_OPEN ? (tt - t.opens) * 12 : 0; }
    domeHinge.rotation.x = -1.4 * Math.max(smooth(u01(tt, INCOCKPIT - 0.35, INCOCKPIT - 0.15)) * (1 - smooth(u01(tt, INCOCKPIT + 0.05, INCOCKPIT + 0.25))), smooth(u01(tt, EXIT - 0.3, EXIT - 0.05)) * (1 - smooth(u01(tt, EXIT + 0.6, EXIT + 0.9))));
    { const k = unfoldK(tt); S.truss.unfold(k); const last = S.truss.wings[1].panels[NW - 1], hx = 0.6 + (NW - 1) * PW * k, th = tt < SWAT - 0.12 ? -PI + 0.07 : tt < SWAT + 0.04 ? lerp(-PI + 0.07, 0, smooth(u01(tt, SWAT - 0.12, SWAT + 0.04))) : wobble(tt, SWAT + 0.04, 0.2, 16, 5);
      last.position.set(hx + Math.cos(th) * PW / 2, 0, -Math.sin(th) * PW / 2 + (tt < SWAT - 0.12 ? 0.06 : 0)); last.rotation.set(0, th, 0); last.visible = k > 0.002; }   // hinged at its inner edge: it swings out through the front (where Gary is)
    S.hole.visible = tt > HIT; S.hole.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, HIT, HIT + 0.15), 2)));
    S.shield.visible = tt > SHIELD; S.shield.scale.set(lerp(0.85, 1, easeOutBack(u01(tt, SHIELD, SHIELD + 0.35), 2)), 1, lerp(0.85, 1, easeOutBack(u01(tt, SHIELD, SHIELD + 0.35), 2)));
    S.cup.visible = tt > CUPOLA; S.cup.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, CUPOLA, CUPOLA + 0.3), 2)));
    scrub.visible = tt > SCRUB; scrub.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, SCRUB, SCRUB + 0.3), 2.2))); fan.rotation.z = -tt * 14; scrubLed.material.emissiveIntensity = 1.5 * pw;
    recyc.visible = tt > RECYC; recyc.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, RECYC, RECYC + 0.3), 2.2)));
    needle.rotation.z = -(PI * 0.75 + PI * 1.5 * 0.98 * smooth(u01(tt, GAUGE0, GAUGE1))) + PI * 0.5 + 0.03 * Math.sin(tt * 30) * (tt > GAUGE1 ? 1 : 0);
    tags.forEach((tg, i) => { tg.visible = tt > [t.sweat, t.wbreath, t.pee][i] - 0.1; tg.scale.setScalar(Math.max(0.01, pop(tt, [t.sweat, t.wbreath, t.pee][i] - 0.1, 0.25))); });
    // the pee bag: the squirrel shoves it into the hopper
    peeBag.visible = tt > t.even - 0.55 && tt < PEE_IN + 0.1; if (peeBag.visible) { sq.root.updateMatrixWorld(true); sq.head.getWorldPosition(v3); const into = smooth(u01(tt, PEE_IN - 0.35, PEE_IN)), grab = smooth(u01(tt, t.even - 0.55, t.even - 0.1)), hp = [REC[0] + 0.22, REC[1] + 0.5, REC[2] + 0.04], gp = gary.root.position, hip = [gp.x + 0.18, gp.y + 0.5, gp.z + 0.2]; peeBag.position.set(...LP(LP(hip, [v3.x, v3.y + 0.18, v3.z + 0.08], grab), hp, into)); peeBag.scale.setScalar(Math.max(0.01, (1 - 0.7 * into) * pop(tt, t.even - 0.5, 0.25))); peeBag.rotation.z = 0.3 * Math.sin(tt * 3); }   // from Gary's hip, the squirrel delivers it
    gary.root.updateMatrixWorld(true); gary.head.getWorldPosition(v3); const GH = v3.toArray();
    sweat.forEach((s2, i) => { const a = t.sweat - 0.15 + i * 0.12, u = u01(tt, a, a + 0.85), from = [GH[0] + 0.15 - i * 0.12, GH[1] + 0.22, GH[2] + 0.2], to = [REC[0] - 0.3 + i * 0.18, REC[1] + 0.62, REC[2] - 0.05]; s2.set(LP(from, to, smooth(u)), u > 0 && u < 1 ? 0.035 : 0, tt + i, 1); });
    pouch.visible = tt > POUR - 0.3 && tt < GULP + 1.2; if (pouch.visible) { const hp = gary.hand(1).getWorldPosition(new THREE.Vector3()); pouch.position.set(hp.x + 0.02, hp.y + 0.06, hp.z + 0.05); pouch.rotation.set(0, 0, -0.3); }
    { const rel = SIP + 0.05; if (tt > rel && tt < GULP + 0.12) { const u = smooth(u01(tt, rel, rel + 0.45)), hp = pouch.position.toArray(), drift = [GH[0] + 0.2, GH[1] + 0.02, GH[2] + 0.45], gp = [GH[0], GH[1] - 0.12, GH[2] + 0.3], to = tt > GULP - 0.15 ? LP(drift, gp, smooth(u01(tt, GULP - 0.15, GULP + 0.1))) : LP(hp, drift, u); coffee.set(to, 0.12 * (tt > GULP - 0.05 ? 1 - smooth(u01(tt, GULP - 0.05, GULP + 0.12)) : 1), tt, 1.2); } else coffee.set([0, -100, 0], 0, tt); }
    tread.update(tt, tt > TREAD ? 1.4 : 0); tread.g.visible = tt > TREAD; tread.g.scale.setScalar(0.7 * Math.max(0.01, easeOutBack(u01(tt, TREAD, TREAD + 0.3), 2.2)));
    toilet.g.visible = tt > TOILET; toilet.g.scale.setScalar(1.3 * Math.max(0.01, easeOutBack(u01(tt, TOILET, TOILET + 0.3), 2.2)));
    bungee.forEach((b, i) => { b.visible = tt > t.bungee - 0.1; if (!b.visible) return; sq.root.updateMatrixWorld(true); const a = sq.body.localToWorld(new THREE.Vector3(0, 0.05, 0)), c = new THREE.Vector3(...P(-0.88 + (i ? 0.34 : -0.34), MT[3] - 3.29, i ? -0.2 : 0.4)); b.position.copy(a).lerp(c, 0.5); b.scale.set(1, Math.max(0.01, a.distanceTo(c)), 1); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize()); });
    // tether while Gary is outside
    if (tt > WHOOSH && tt < HAUL1) { const g2 = gary.root.position; setTether(P(1.3, -2.6, 0.2), [g2.x, g2.y + 0.55, g2.z], tt < TAUT ? 0.8 * (1 - u01(tt, WHOOSH, TAUT)) : 0.05 + 0.6 * smooth(u01(tt, HAUL0, HAUL1))); }
    else if (tt > OUT0 && tt < SWAT + 0.3) { const g2 = gary.root.position; setTether(P(4.75, -2.6, 0.1), [g2.x, g2.y + 0.55, g2.z], tt > SWAT ? 1.2 : 0.5 + 0.4 * Math.sin(tt * 1.3)); }
    else setTether(null);
    // the paint flecks: a streak into the back wall (hit), a streak into the shield (whipple)
    { let on = false; for (const [a, from, to] of [[HIT, P(-4.2, D.hole[1] + 1.4, -2.6), P(D.hole[0], D.hole[1], -1.6)], [HIT2, P(-4.6, MT[3] - 0.6, 1.25), P(WX, MT[3] - 1.4, 1.2)]]) { const u = (tt - (a - 0.12)) / 0.12; if (u > 0 && u < 1) { on = true; const p0 = new THREE.Vector3(...from), p1 = new THREE.Vector3(...to), pos = p0.clone().lerp(p1, u); streak.position.copy(pos); streak.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), p1.clone().sub(p0).normalize()); } } streak.visible = on; }
    // the burning seed
    spit.visible = tt > SEED_OUT - 0.45 && tt < SEED_OUT - 0.02; if (spit.visible) { sq.root.updateMatrixWorld(true); sq.head.getWorldPosition(v3); spit.position.set(...arcP(v3.toArray(), P(D.hole[0] + 0.3, D.hole[1] + 0.05, -0.9), smooth(u01(tt, SEED_OUT - 0.45, SEED_OUT - 0.02)), 0.25)); spit.rotation.set(tt * 9, tt * 7, 0); }
    hotSeed.visible = tt > SEED0 && tt < END + 1; if (hotSeed.visible) { const sp = seedPath(Math.min(tt, LAND)); hotSeed.position.set(...sp); const burn = (tt < LAND ? 1 : 1 - 0.6 * smooth(u01(tt, LAND, LAND + 1.2))) * (tt < LAND ? smooth(clamp((40 - sp[1]) / 10)) : 1); seedGlow.scale.setScalar((tt < LAND ? 0.9 : 0.35) * burn); seedLight.intensity = (tt < LAND ? 6 : 1.2) * burn; hotSeed.rotation.set(tt * 5, tt * 3, 0); }   // dark in space, it ignites at the cloud deck (re-entry)
    looseHelmet.visible = tt > SWAT + 1.05 && tt < t.water; if (looseHelmet.visible) { const a = tt - SWAT - 1.05; looseHelmet.position.set(...LP(P(-0.15, MT[1] + 0.1, 0.35), P(0.8, MT[1] - 0.7, 0.5), smooth(clamp(a / 4)))); looseHelmet.rotation.set(a * 1.3, a * 0.9, a * 0.5); }
    goalposts.forEach((g, i) => { const on = tt > t.football - 0.15 && tt < t.array + 0.6; g.visible = on; if (!on) return; g.position.set(...P(i ? tipX(unfoldK(tt)) + PW + 0.25 : ROOTX + 0.75, D.truss.y - 1.75, 0.3)); g.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, t.football - 0.15 + i * 0.15, t.football + 0.15 + i * 0.15), 2.2))); });
    vest.visible = tt > t.vest - 0.08; vest.scale.setScalar(Math.max(0.01, easeOutBack(u01(tt, t.vest - 0.08, t.vest + 0.2), 2.4)));
    junk.forEach(({ m, i }) => { m.visible = tt > LATCH + 1 && tt < E0; const r = i % 2 ? 2 : 1; m.position.set(...P(-0.85 + 0.55 * i + 0.15 * Math.sin(tt * 0.7 + i), MT[r] - 1.0 - 0.9 * (i >> 1) + 0.12 * Math.sin(tt * 0.5 + i * 2), 0.65 + 0.2 * Math.sin(tt * 0.6 + i))); m.rotation.set(tt * (0.6 + 0.2 * i), tt * 0.4, i); });   // a sock, pens, a pouch drift in the rooms
    orbitArrows.update(tt, smooth(u01(tt, t.falls - 0.3, t.falls + 0.2)) * (1 - smooth(u01(tt, t.earth + 0.1, t.ocalled))));
    // dizzy stars after the face-step + the swat; the squirrel's after the cone bonk
    { const on1 = tt > STEP + 0.3 && tt < t.strap, on2 = tt > SWAT + 0.1 && tt < SWAT + 0.9; if (on1 || on2) { gary.head.getWorldPosition(v3); dizzy.update(tt, 1, [v3.x, v3.y + 0.35, v3.z]); } else dizzy.update(tt, 0, [0, 0, 0]);
      if (tt > BONK && tt < ZIP0 + 0.1) { sq.root.updateMatrixWorld(true); sq.head.getWorldPosition(v3); sqDizzy.update(tt, 1, [v3.x, v3.y + 0.15, v3.z]); } else sqDizzy.update(tt, 0, [0, 0, 0]); }
    // camera + impact kicks; the sky follows the camera's altitude
    const cam = camAt(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    kick.apply(studio.camera, tt, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]));
    W.setSpace(smooth(clamp((cam.pos[1] - 8) / 52)));
    const ld = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]);
    W.aimSun(cam.look[0], cam.look[1], cam.look[2], Math.max(5, Math.min(28, ld * 0.7)));
    W.update(tt, studio.camera);
    fx.update(tt, studio.camera);
    story.debugView = { center: cam.look, height: 14 };
  }

  // QC (`node tools/render.mjs 032-bird-feeder-station --qc`): every 0.1 s, project the tracked faces (Gary, the squirrel) and list
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, head, root] of [['Gary', gary.head, gary.root], ['the squirrel', sq.head, sq.root]]) { if (!root.visible) continue;
        root.updateMatrixWorld(true); head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`); }
    }
    update(0); return out;
  };
  { placeRocket(EXIT + 0.3); const fp = local(rocket.body, [0, 1.62, 0.6]);   // zero-g: seeds drift out of the open feeder on the rocket
    fx.stream('seed', EXIT + 0.1, t.tiny, { pos: fp, box: [0.15, 0.1, 0.15], rate: 26, dir: [0.2, 0.4, 0.6], spread: 1.2, speed: [0.15, 0.5], g: 0, drag: 0.35, life: [4, 6], seed: 29 }); }
  update(0);
  return { update };
}
