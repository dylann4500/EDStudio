// 034 — "How a Go-Kart Becomes a Tank" (build genre, TURBO pace: docs/BUILD.md → Turbo pace). ONE continuous camera take over a
// farm test-track cutaway (engine/build/tank.js): the ground is sliced along the track, so the mud pit and the creek are seen
// in section; the vehicle's near hull side is cut open (Gary, the turret ring + basket, the engine bay → turbine), the turret's
// near side too (breech, recoil cylinders, the gyro). Gary builds every step and takes every failure; the GOOSE won't move,
// honks, chases Gary, outwalks the 70-ton tank, swims past him and finally drives it away. A chicken from the barn rides
// Gary's head until the turbine blast. Everything is keyed to the spoken word: W(beat, word) (story.json from tools/narrate.py).
// Continuity: one vehicle that only gains parts (kart → tracks → flat plates → tilted glacis → hull gun → turret → gyro →
// turbine → periscopes → kit); the melon bale, the barn (two tank-shaped holes), the scarecrow, the bridge (in the creek),
// the fence the blind tank flattens all stay broken; Gary's goo (pumpkin) → soot + no eyebrows → mud again at the end.
//
// Facts (web-searched Oct 27 2026):
//   Ground pressure: M1 Abrams ≈ 15 psi (103 kPa) vs an adult horse ≈ 25 psi, a passenger car ≈ 30 psi (Wikipedia "Ground
//     pressure" table; globalsecurity M1A2 15.4 psi). The often-quoted "same as a person's foot" doesn't hold (walking foot
//     60–80 kPa), so the line uses the horse.
//   Sloped armour: line-of-sight thickness = t / cos(angle); 60° from vertical = 2× (Wikipedia "Sloped armour").
//   Spin in place: the M1's X1100 cross-drive transmission pivot-steers (turning diameter "pivot") (Wikipedia "Cross-drive
//     steering transmission"; afvdatabase.com M1).
//   Recoil: the M256 120 mm gun recoils 304.8 mm = 12 in (Wikipedia "M256").
//   Stabilizer: a 1986 Bundeswehr film shows a Leopard 2 driving rough ground with a full beer stein balanced on its 120 mm gun
//     (Forces News; Task & Purpose). We show lemonade.
//   AGT1500 gas turbine: 1,500 hp, under 2,500 lb, 0–20 mph in 6 s (Honeywell); the Army fits heat shields that deflect the
//     exhaust upward so it doesn't burn crews (DVIDS, Fort Stewart). No exhaust temperature is stated anywhere we trust.
//   ~70 tons: M1A2 SEPv3 66.8 t basic, 73.5 short tons with combat loads (GDLS via Sandboxx; DTIC AD1151141) → MLC 79 at that
//     load (DTIC AD1151141) = "needs eighty"; MLC signs are yellow discs with the class number (Wikipedia "Military Load
//     Classification"; STANAG 2021).
//   Periscopes: the M1 driver has three, ≈ 120° view (afvdatabase.com; historyofwar.org).
//   $19 M: Poland bought 250 M1A2 SEPv3 for ≈ $4.75 B net = $19 M a tank incl. support (defence24.pl).
import * as THREE from 'three';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, squash, u01, easeOutBack, easeInQuad } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { makeKick } from '@engine/build/cuts.js';
import { buildFarm, D, groundY, makeKartTank, makeGoose, makeChicken, makeHorse, makePumpkin, makeMelon, makeLemonade, makeMowerEngine, tex, signTex } from '@engine/build/tank.js';

const PI = Math.PI, V = (x, y, z) => new THREE.Vector3(x, y, z);

export async function build(studio, story) {
  const S = await buildFarm(studio), B = beatClock(story), scene = S.root;
  const W = (b, w, n) => B.W(b, w, n), END = story.duration;
  const fx = makeFX(scene, { max: { crumb: 800, drops: 1400, dust: 420, spark: 500, confetti: 900, smoke: 260, glow: 90, mist: 260 }, nearFade: [1.4, 3.6] });   // turbo: overlapping bursts
  const FXN = { burst: 0, stream: 0, times: [] }; { const b0 = fx.burst.bind(fx), s0 = fx.stream.bind(fx); fx.burst = (k, t0, o) => { FXN.burst++; FXN.times.push(t0); return b0(k, t0, o); }; fx.stream = (k, t0, t1, o) => { FXN.stream++; FXN.times.push(t0); return s0(k, t0, t1, o); }; }   // turbo density counts (--qc prints them)
  const TZ = D.TZ, C = D.creek;

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    stuck: W('hook', 'stuck'), mud0: W('hook', 'mud'), garyH: W('hook', 'gary'), floors: W('hook', 'floors'), wins: W('hook', 'wins'),
    congrats: W('congrats', 'congratulations'), sprinkler: W('congrats', 'sprinkler'), gooseC: W('congrats', 'goose'), judging: W('congrats', 'judging'),
    wheels: W('tracks', 'wheels'), sink: W('tracks', 'sink'), four: W('tracks', 'four'), spots: W('tracks', 'spots'), soT: W('tracks', 'so'), wrap: W('tracks', 'wrap'), steelT: W('tracks', 'steel'), platesT: W('tracks', 'plates'),
    continuous: W('tracks', 'continuous'), trackT: W('tracks', 'track'), spreads: W('tracks', 'spreads'), wide: W('tracks', 'wide'), seventy: W('tracks', 'seventy'), ask: W('tracks', 'ask'), presses: W('tracks', 'presses'), softer: W('tracks', 'softer'), horse: W('tracks', 'horse'),
    nowS: W('steer', 'now'), straight: W('steer', 'straight'), slow: W('steer', 'slow'), other: W('steer', 'other'), swings: W('steer', 'swings'), around: W('steer', 'around'), skid: W('steer', 'skid'), steering: W('steer', 'steering'),
    run: W('steer', 'run'), opposite: W('steer', 'opposite'), spin: W('steer', 'spin'), place: W('steer', 'place'), soDo: W('steer', 'so'), eyeballs: W('steer', 'eyeballs'),
    thenG: W('goose', 'then'), goose: W('goose', 'goose'), blocks: W('goose', 'blocks'), road: W('goose', 'road'), honk: W('goose', 'honk'), honks: W('goose', 'honks'), louder: W('goose', 'louder'), garyG: W('goose', 'gary'), gets: W('goose', 'gets'), shoo: W('goose', 'shoo'), goose2: W('goose', 'goose', 2), shoos: W('goose', 'shoos'), garyG2: W('goose', 'gary', 2),
    neighbors: W('armor', 'neighbors'), cannon: W('armor', 'cannon'), opens: W('armor', 'cannon'), fireA: W('armor', 'cannon') + 0.35, bolt: W('armor', 'bolt'), steelA: W('armor', 'steel'), platesA: W('armor', 'plates'), flat: W('armor', 'flat'), take: W('armor', 'take'), headon: W('armor', 'headon'),
    tilt: W('armor', 'tilt'), them: W('armor', 'them'), sloped: W('armor', 'sloped'), armor: W('armor', 'armor'), sixty: W('armor', 'sixty'), degrees: W('armor', 'degrees'), cross: W('armor', 'cross'), twice: W('armor', 'twice'), steel2: W('armor', 'steel', 2), pumpkins: W('armor', 'pumpkins'), bounce: W('armor', 'bounce'),
    addC: W('turret', 'aiming'), cannonT: W('turret', 'cannon'), aiming: W('turret', 'aiming'), whole: W('turret', 'whole'), tankT: W('turret', 'tank'), soR: W('turret', 'so'), spinning: W('turret', 'spinning'), ring: W('turret', 'ring'), turret: W('turret', 'turret'),
    target: W('turret', 'target'), watermelon: W('turret', 'watermelon'), fireT: W('turret', 'fire'), explodes: W('turret', 'explodes'), flies: W('turret', 'flies'), backward: W('turret', 'backward'), right: W('turret', 'right'), barn: W('turret', 'barn'),
    soB: W('recoil', 'so'), backR: W('recoil', 'back'), barrel: W('recoil', 'barrel'), slides: W('recoil', 'slides'), shock: W('recoil', 'shock'), recoilW: W('recoil', 'recoil'), mechanism: W('recoil', 'mechanism'), gun: W('recoil', 'gun'), twelve: W('recoil', 'twelve'), inches: W('recoil', 'inches'), tankR: W('recoil', 'tank'), stays: W('recoil', 'stays'), put: W('recoil', 'put'), chicken: W('recoil', 'chicken'), head: W('recoil', 'head'),
    andS: W('stab', 'and'), classW: W('mlc', 'class'),
    but: W('stab', 'every'), bump: W('stab', 'bump'), aim: W('stab', 'aim'), hit: W('stab', 'hit'), scarecrow: W('stab', 'scarecrow'), cloud: W('stab', 'cloud'), gyros: W('stab', 'gyros'), still: W('stab', 'still'), bounces: W('stab', 'still'), stabilizer: W('stab', 'stabilizer'),
    germany: W('stab', 'germany'), full: W('stab', 'full'), glass: W('stab', 'glass'), gunS: W('stab', 'gun', 2), lemonade: W('stab', 'lemonade'), fine: W('stab', 'fine'), garyS: W('stab', 'gary'), isnt: W('stab', 'isnt'),
    heavy: W('turbine', 'heavy'), lawnmower: W('turbine', 'lawnmower'), gooseT: W('turbine', 'goose'), faster: W('turbine', 'faster'), drop: W('turbine', 'drop'), jet: W('turbine', 'jet'), gas: W('turbine', 'gas'), turbineW: W('turbine', 'turbine'), fifteen: W('turbine', 'fifteen'), horsepower: W('turbine', 'horsepower'),
    never: W('behind', 'never'), behind: W('behind', 'behind'), garyT: W('behind', 'gary'), stood: W('behind', 'stood'), byeE: Math.min(W('behind', 'bye'), W('behind', 'eyebrows')),
    weighs: W('bridge', 'weighs'), seventyB: W('bridge', 'seventy'), little: W('bridge', 'little'), bridgeW: W('bridge', 'bridge'), holds: W('bridge', 'holds'), three: W('bridge', 'three'), about: W('bridge', 'about'), second: W('bridge', 'second'),
    bridges: W('mlc', 'bridges'), number: W('mlc', 'number'), yellow: W('mlc', 'yellow'), circle: W('mlc', 'circle'), military: W('mlc', 'military'), says: W('mlc', 'says'), threeM: W('mlc', 'three'), yours: W('mlc', 'yours'), eighty: W('mlc', 'eighty'), garyM: W('mlc', 'gary'), submarine: W('mlc', 'submarine'),
    climb: W('peri', 'out'), shut: W('peri', 'shut'), hatch: W('peri', 'hatch'), blind: W('peri', 'blind'), mirror: W('peri', 'mirror'), tubes: W('peri', 'tubes'), roof: W('peri', 'tubes'), periscopes: W('peri', 'periscopes'), finds: W('peri', 'looks'), gooseP: W('peri', 'goose'), immediately: W('peri', 'in'),
    addF: W('finish', 'add'), radio: W('finish', 'radio'), cup: W('finish', 'cup'), horn: W('finish', 'horn'), honksF: W('finish', 'honks'), gooseF: W('finish', 'goose'),
    end: W('end', 'congratulations'), tankE: W('end', 'tank'), wanted: W('end', 'wanted'), mudE: W('end', 'mud'), nineteen: W('end', 'nineteen'), dollars: W('end', 'dollars'), bridgeE: W('end', 'bridge'), creekE: W('end', 'creek'), garyE: W('end', 'gary'), eyebrowsE: W('end', 'eyebrows'), gooseE: W('end', 'goose'), driving: W('end', 'driving'),
    garyE2: W('end2', 'gary'), back: W('end2', 'back'), mudEnd: W('end2', 'mud'),
  };
  // derived event times (mirrored in make_cues.py)
  const X0 = 0, XS = 5.6;                                                    // the mud pit; the station for the goose / armour / turret beats
  const TR0 = t.wrap - 0.05, TR1 = t.platesT + 0.3;                          // the tracks wrap on (far, near)
  const OUT0 = t.continuous, OUT1 = t.horse + 0.1;   // r3: rises as soon as the track is on                              // it rolls out of the mud
  const SP0 = t.opposite + 0.1, SP1 = Math.max(SP0 + 1.1, t.soDo + 0.15);   // the spin in place (two turns)
  const JUMP0 = t.gets + 0.05, JUMP1 = t.shoo - 0.05;                        // Gary hops down
  const CH0 = Math.max(t.goose2, JUMP1 + 0.4), CH1 = CH0 + 1.5, BACK1 = Math.min(t.fireA - 0.15, CH1 + 0.7);   // the chase; Gary leaps back aboard
  const PK = [[t.opens - 0.1, 'gary'], [t.take - 1.1, 'flat'], [t.headon - 1.1, 'flat'], [t.pumpkins - 1.1, 'slope'], [t.bounce - 1.05, 'slope']];   // pumpkin shots: [fire time, what it hits]
  const PK_T = 1.1, PKF = (i) => (PK[i][1] === 'gary' ? 0.65 : PK_T);     // flight time (r2: the one on Gary is quick: SPLAT lands on "bolt")
  const PL = [t.steelA, t.platesA, t.platesA + 0.2, t.platesA + 0.4];       // plates pop: front, sides, roof, rear (r2: after the splat has held 0.4 s)
  const TILT0 = t.tilt, TILT1 = t.them + 0.25;
  const HG = t.cannonT - 0.1;                                                // the hull gun pops on
  const PIV0 = t.aiming, PIV1 = t.tankT + 0.2, RET1 = t.ring;                // the whole tank pivots to aim … and swings back as the turret drops in
  const TUR0 = t.soR + 0.15;                                                 // the turret drops on
  const SHOT = t.fireT + 0.08, HITM = Math.min(t.explodes - 0.03, SHOT + 0.5);                     // r2: the gun goes off ON "fire" (flash, BOOM at the muzzle); a slow cartoon shell; the melon pops on "explodes"
  const RC0 = SHOT, RCX = 22.4;                                              // recoil slide: x(t) = XS + A(1 − e^{−Δ/τ})
  // r4: the recoil as a cartoon double-take — a 0.8 m lurch ON the shot, a beat, then it FLIES (airborne, nose up) on "flies",
  // ploughs through the barn, bursts out of the far wall and brakes to a stop at RCX (the recoil beat's framings stay put)
  const LURCH = 0.8, FLY0 = t.flies - 0.3, INW = FLY0 + 0.42, OUTW = INW + 0.8, X_IN = D.barn.x0 - 2.75, X_OUT = D.barn.x1 - 2.75, VOUT = (X_OUT - X_IN) / 0.8;
  const PUMPS = [t.shock + 0.02, t.shock + 0.45];                           // r3: the barrel pumps on "shock absorbers" (the TERM starts after)
  const TUR2 = t.soB + 0.1, SHOT2 = t.gun;                                   // the recoil demo: the turret swings to the target bale; fires on "gun"
  const DRV0 = t.but - 0.1, DRV1 = t.lawnmower + 0.4, XB0 = RCX, XB1 = 36.6; // over the bumps
  const MISS1 = t.hit - 0.12, MISS2 = t.andS - 0.05, GYRO = t.gyros - 0.05, STAB = t.gyros + 0.3;
  const GLASS0 = t.full - 0.3, GLASS1 = t.glass + 0.25, BOUNCE0 = t.isnt - 0.42, BOUNCE1 = t.isnt + 0.05;
  const MOW = t.drop + 0.05, TB = t.jet - 0.1, SPIN = t.gas - 0.2, HP = t.fifteen;
  const OFF0 = t.never + 0.05, OFF1 = t.never + 0.45, BLAST = t.byeE - 0.06;
  const AB0 = BLAST + 0.5, AB1 = t.weighs + 0.45;                           // Gary leaps back aboard as it pulls away
  const BR0 = t.weighs, BRX = 46, BR1 = t.three - 0.1;                       // to the middle of the bridge
  const SNAP = t.second - 0.05, LAND = SNAP + 0.62;
  const CL0 = t.climb - 0.1, CL1 = t.blind, XE = D.endFence - 2.45;           // climbs out, crashes into the end fence on "blind"
  const HATCH0 = t.shut - 0.05, HATCH1 = t.hatch;
  const PERI0 = t.mirror - 0.1;
  const GHOP0 = t.finds - 0.7, GHOP1 = t.finds - 0.1;                     // the goose hops onto the glacis
  const POPUP = Math.max(t.addF - 0.15, t.immediately + 0.38);                                               // Gary pops the hatch for the finishing kit
  const OUTG = t.creekE - 0.1, OUTG1 = t.garyE - 0.1;                        // Gary climbs out onto the rear deck (the camera is on the creek)
  const GOOSEIN = t.gooseE - 0.45, DRIVE = t.driving + 0.45, FALL1 = DRIVE + 0.55;   // the goose takes the hatch; the lurch; Gary lands in the mud

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat', browScale: 1.9 }); scene.add(gary.root);   // bushy brows: their loss has to read
  const goose = makeGoose(); scene.add(goose.root); const GS = 1.15;
  const hen = makeChicken(); scene.add(hen.root);
  const hens = [0, 1, 2].map(() => { const h = makeChicken(); scene.add(h.root); return h; });   // the barn's chickens
  const horse = makeHorse(); scene.add(horse.root);
  const Vh = makeKartTank(); scene.add(Vh.g);
  const SPL = [Vh.addSplat(0.45, 0.45, 1.5), Vh.addSplat(0.5, -0.4, 1.5)];   // r2: pumpkin goo on the flat plate (it was never added); it stays as the plate tilts
  const melon = makeMelon(); scene.add(melon.g); const MEL = V(D.melon[0], 1.22, D.melon[1]); melon.g.position.copy(MEL);
  const lem = makeLemonade(); scene.add(lem.g); lem.g.scale.setScalar(1.6);
  const mower = makeMowerEngine(); scene.add(mower.g); mower.g.visible = false;   // the flying copy (yanked out of the bay)
  const pumpkins = PK.map(() => { const p = makePumpkin(0.24); scene.add(p.g); return p; });
  const shell = new THREE.Group(); scene.add(shell); mk(new THREE.CapsuleGeometry(0.06, 0.22, 6, 12), mat(0x3b4022, 0.5), shell).rotation.z = PI / 2; shell.visible = false;
  mk(new THREE.CylinderGeometry(0.035, 0.0, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0xffc06a, transparent: true, opacity: 0.75, toneMapped: false, depthWrite: false }), shell, 0.75, 0, 0).rotation.z = PI / 2;   // r2: a hot streak behind it (local +x points away from the target after lookAt + rotateY) (it read as nothing at 10 m)
  const dizzy = makeDizzy(scene);
  const brows = [-1, 1].map(() => { const b = mk(new THREE.CapsuleGeometry(0.028, 0.11, 4, 10), new THREE.MeshStandardMaterial({ color: 0x6b3f22, roughness: 0.9 }), scene, 0, 0, 0); b.visible = false; return b; });   // r4: the eyebrows leave, toward the lens
  const flyHat = gary.hat.clone(); scene.add(flyHat); flyHat.visible = false;   // Gary's hard hat → the goose (the ending)
  const gHat = gary.hat.clone(); goose.head.add(gHat); gHat.scale.setScalar(0.5); gHat.position.set(0, 0.05, -0.01); gHat.visible = false;
  const wrench = new THREE.Group(); mk(new THREE.BoxGeometry(0.035, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.3, metalness: 0.8 }), wrench, 0, 0.12, 0); mk(new THREE.TorusGeometry(0.05, 0.016, 6, 12, PI * 1.5), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.3, metalness: 0.8 }), wrench, 0, 0.3, 0); gary.hand(1).add(wrench); wrench.position.set(0, -0.04, 0.03); wrench.rotation.x = 1.3;
  const bulb = new THREE.Group(); mk(new THREE.SphereGeometry(0.07, 14, 10), mat(0x1b1b1b, 0.5), bulb, -0.06, 0, 0); mk(new THREE.ConeGeometry(0.05, 0.12, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xd9a83a, roughness: 0.25, metalness: 0.85, side: THREE.DoubleSide }), bulb, 0.06, 0, 0).rotation.z = -PI / 2; gary.hand(-1).add(bulb); bulb.position.set(0, -0.06, 0.05);
  // a cloud you can shoot, the four pressure arrows, the spread arrows, the 60° marker + the 2× bar, the laser dot, the MLC 80 disc
  const cloud = new THREE.Group(); scene.add(cloud); cloud.position.set(...D.cloud);
  for (let k = 0; k < 7; k++) mk(new THREE.IcosahedronGeometry(1.2 + (k % 3) * 0.4, 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xdde8f2, emissiveIntensity: 0.35, flatShading: false }), cloud, (k - 3) * 1.1, Math.sin(k * 1.7) * 0.5, Math.cos(k * 2.1) * 0.5);
  const arrowM = new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 0.5, roughness: 0.4 }), spreadM = new THREE.MeshStandardMaterial({ color: 0x36d06a, emissive: 0x36d06a, emissiveIntensity: 0.5, roughness: 0.4 });
  const mkArrow = (m, s) => { const a = new THREE.Group(); mk(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.4 * s, 10), m, a, 0, 0.25 * s, 0); mk(new THREE.ConeGeometry(0.13 * s, 0.22 * s, 14), m, a, 0, 0, 0).rotation.x = PI; scene.add(a); a.visible = false; return a; };
  const press4 = [0, 1, 2, 3].map(() => mkArrow(arrowM, 1.6)), spreadA = Array.from({ length: 9 }, () => mkArrow(spreadM, 0.7));
  const angle = new THREE.Group(); Vh.glacis.add(angle); angle.visible = false;   // the 60° marker lives in the glacis' parent space (hull), see setAngle
  const yel = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
  const markerHull = new THREE.Group(); Vh.hull.add(markerHull); markerHull.position.set(2.85, 0.55, 1.42); markerHull.visible = false;
  mk(new THREE.BoxGeometry(0.035, 1.2, 0.03), yel, markerHull, 0, 0.6, 0);   // the vertical reference
  const arc = mk(new THREE.TorusGeometry(0.62, 0.025, 6, 32, PI / 3), yel, markerHull, 0, 0, 0); arc.rotation.z = PI / 2;   // from vertical, sweeping back 60°
  const bar2 = mk(new THREE.BoxGeometry(1, 0.09, 0.05), new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, transparent: true, opacity: 0.85 }), Vh.hull, 2.0, 1.0, 1.4); bar2.visible = false;
  const laser = mk(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false }), scene, 0, 0, 0); laser.visible = false;
  const disc80 = mk(new THREE.CircleGeometry(0.24, 32), new THREE.MeshStandardMaterial({ map: signTex('80', { w: 256, h: 256, bg: '#ffd21f', fg: '#1b1b1b', px: 150, round: true, border: '#1b1b1b' }), transparent: true, roughness: 0.5 }), Vh.tur, 0.25, 0.32, 0.935); disc80.visible = false;
  const steamCol = 0xf2f4f6, MUD = 0x4a3020, GOO = 0xf08a1f;
  // the goose's 1/10 scorecard (in its beak on "judging"), the aim laser (bumps → stabilizer), the DON'T STAND HERE sign
  const card = mk(new THREE.PlaneGeometry(0.34, 0.24), new THREE.MeshStandardMaterial({ map: signTex('1/10', { w: 256, h: 180, bg: '#ffffff', fg: '#d42a22', px: 130, border: '#1b1b1b' }), roughness: 0.6, side: THREE.DoubleSide }), scene, 0, 0, 0); card.visible = false;
  const laser2 = mk(new THREE.CylinderGeometry(0.018, 0.018, 1, 6), new THREE.MeshBasicMaterial({ color: 0xff3030, toneMapped: false, transparent: true, opacity: 0.85 }), scene, 0, 0, 0); laser2.visible = false;
  const warn = new THREE.Group(); scene.add(warn); warn.visible = false;
  mk(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), mat(0x8a8f94, 0.5), warn, 0, 0.55, 0);
  const warnSign = mk(new THREE.PlaneGeometry(0.75, 0.5), new THREE.MeshStandardMaterial({ map: signTex("DON'T STAND HERE", { w: 512, h: 340, bg: '#ffd21f', fg: '#1b1b1b', px: 80, border: '#1b1b1b' }), roughness: 0.6, side: THREE.DoubleSide }), warn, 0, 1.25, 0.03);
  // bridge planks: splinters that fall into the creek and float
  const bPlanks = Array.from({ length: 10 }, (_, i) => { const m = mk(new THREE.BoxGeometry(0.6, 0.06, 0.16), mat(i % 3 ? 0x9a7048 : 0x6f4e32, 0.85), scene, 0, 0, 0); m.visible = false; const h = (k) => { const v = Math.sin(i * 91.7 + k * 12.3) * 43758.5453; return v - Math.floor(v); }; m.userData = { x0: 45 + h(1) * 2, z0: -0.7 - h(2) * 2.5, vx: (h(3) - 0.5) * 4, vy: 2 + h(4) * 2.5, vz: (h(5) - 0.5) * 2, sp: h(6) * 8 }; return m; });
  // barn planks: long red splinters flung out of each end wall (gems of crumb read as rubies)
  const plankM = new THREE.MeshStandardMaterial({ color: 0xb5352a, roughness: 0.8 }), plankW = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.8 });
  const planks = Array.from({ length: 18 }, (_, i) => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.12, 0.8, 0.035), plankM, g, 0, 0, 0); mk(new THREE.BoxGeometry(0.125, 0.08, 0.04), plankW, g, 0, 0.36, 0); scene.add(g); g.visible = false; const h = (k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }; g.userData = { w: i % 2, y0: 0.5 + h(1) * 1.8, z0: TZ + (h(2) - 0.5) * 2.4, vx: 2.5 + h(3) * 4, vy: 1.5 + h(4) * 3, vz: (h(5) - 0.5) * 3, sp: [h(6) * 9 - 4.5, h(7) * 9 - 4.5, h(8) * 9 - 4.5] }; return g; });
  // the crown splash when the tank lands in the creek: a jagged ring of water that rises and falls
  const crownT = tex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(220,244,255,0.95)'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) { const sp = Math.abs(Math.sin(x * 0.21) * Math.sin(x * 0.053 + 1)); c.lineTo(x, h * (0.08 + 0.75 * (1 - sp))); c.lineTo(x + 4, h * 0.95); } c.lineTo(w, h); c.closePath(); c.fill(); });
  crownT.wrapS = THREE.RepeatWrapping; crownT.repeat.set(3, 1);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true), new THREE.MeshStandardMaterial({ map: crownT, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.2, emissive: 0x3a7aa0, emissiveIntensity: 0.3 })); crown.renderOrder = 6; scene.add(crown); crown.visible = false;

  // ---------------------------------------------------------------- the vehicle over time
  const drv = (tt, a, b, x0, x1, e = 0.6) => { const u = clamp((tt - a) / (b - a)), r = Math.min(0.45, e / (b - a)); const f = u < r ? u * u / (2 * r * (1 - r)) : u > 1 - r ? 1 - (1 - u) ** 2 / (2 * r * (1 - r)) : (u - r / 2) / (1 - r); return lerp(x0, x1, f); };   // constant speed with soft ends
  const K = (tt, keys) => { if (tt <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (tt <= b) return lerp(va, vb, smooth((tt - a) / (b - a))); } return keys[keys.length - 1][1]; };
  const RC1 = OUTW + 2 * (RCX - X_OUT) / VOUT, BRAKE = VOUT * VOUT / (2 * (RCX - X_OUT));   // when the slide stops; its braking
  const recX = (tt) => { if (tt < FLY0) return XS + LURCH * (1 - (1 - u01(tt, RC0, RC0 + 0.25)) ** 3); if (tt < INW) return lerp(XS + LURCH, X_IN, (tt - FLY0) / (INW - FLY0)); if (tt < OUTW) return lerp(X_IN, X_OUT, (tt - INW) / (OUTW - INW)); const d = Math.min(tt, RC1) - OUTW; return X_OUT + VOUT * d - 0.5 * BRAKE * d * d; };
  function vehX(tt) {
    if (tt < OUT0) return X0 + (tt > t.floors && tt < t.wins ? 0.06 * Math.sin((tt - t.floors) * 30) : 0);
    if (tt < t.nowS) return K(tt, [[OUT0, X0], [OUT1, 3.2]]);
    if (tt < t.goose) return K(tt, [[t.nowS, 3.2], [t.straight + 0.1, 4.9], [t.around, XS], [SP0, XS]]);
    if (tt < RC0) return XS;
    if (tt < RC1) return recX(tt);
    if (tt < DRV0) return RCX;
    if (tt < t.heavy) return drv(tt, DRV0, t.heavy, RCX, XB1 - 1.3);
    if (tt < BR0) return K(tt, [[t.heavy, XB1 - 1.3], [t.faster, XB1], [HP, XB1], [HP + 0.12, XB1 + 0.25], [HP + 0.6, XB1]]);
    if (tt < CL0) return drv(tt, BR0, BR1, XB1, BRX, 0.7);
    if (tt < DRIVE) return K(tt, [[CL0, BRX], [CL1, XE], [CL1 + 0.25, XE - 0.15], [CL1 + 0.5, XE]]);
    return XE + 4.5 * easeInQuad(clamp((tt - DRIVE) / 2.4));   // the goose drives off
  }
  const AIM_MELON = Math.atan2(-(MEL.z - TZ), MEL.x - (XS - 0.7)), PIV_MAX = 1.85;
  function vehYaw(tt) {
    if (tt < t.slow) return 0;
    if (tt < SP0) return K(tt, [[t.slow, 0], [t.around, 0.75], [t.skid, 0.75], [t.steering + 0.3, 0]]);
    if (tt < t.aiming) { const u = u01(tt, SP0, SP1); return 4 * PI * (u < 1 ? (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2) : 1) + (tt > SP1 ? 0.05 * Math.sin((tt - SP1) * 9) * Math.exp(-(tt - SP1) * 3) : 0); }
    if (tt < RET1 + 0.2) return 4 * PI + K(tt, [[PIV0, 0], [PIV1, PIV_MAX], [TUR0, PIV_MAX * 0.96], [RET1, 0]]) + (tt > PIV0 && tt < PIV1 ? 0.06 * Math.sin(tt * 23) : 0);   // struggles round
    return 4 * PI;
  }
  // ground contact: front/rear contact heights (bumps, the bridge, the creek); the fall
  const BRIDGE_Y = D.bridge.y + 0.07;
  const sagAt = (tt) => (tt < t.little ? 0 : tt < SNAP ? smooth(u01(tt, t.little, t.three + 0.2)) : 1);
  const brkAt = (tt) => (tt < SNAP ? 0 : smooth(u01(tt, SNAP, SNAP + 0.38)));
  function contactY(x, tt) {
    const onB = x > D.bridge.x0 && x < D.bridge.x1 && tt < SNAP + 0.05 && tt > BR0 - 2;
    if (onB) { const u = (x - D.bridge.x0) / (D.bridge.x1 - D.bridge.x0); return BRIDGE_Y - sagAt(tt) * 0.6 * Math.sin(PI * u); }
    return groundY(x);
  }
  function vehPose(tt) {
    const x = vehX(tt), yaw = vehYaw(tt), hx = Math.cos(yaw), hz = -Math.sin(yaw);
    let yf = contactY(x + 1.9 * hx, tt), yr = contactY(x - 1.9 * hx, tt);
    if (tt > SNAP && tt < CL0 + 0.1) { const fall = tt < LAND ? (BRIDGE_Y - 0.6) - 0.5 * 9.8 * (tt - SNAP) ** 2 * 0.95 : C.bed; const y = Math.max(C.bed, fall) - 0.1 * smooth(u01(tt, t.says, t.says + 0.3)) * (tt < CL0 - 0.3 ? 1 : 0); yf = yr = y + (tt > LAND ? 0 : 0.0); }   // r2: settles a notch into the silt on "says"
    const y = (yf + yr) / 2, pitch = Math.atan2(yf - yr, 3.8);
    const land = tt > LAND && tt < LAND + 0.6 ? -0.06 * Math.exp(-(tt - LAND) * 7) * Math.cos((tt - LAND) * 22) : 0;
    const crash = tt > CL1 && tt < CL1 + 0.6 ? -0.04 * Math.exp(-(tt - CL1) * 6) * Math.sin((tt - CL1) * 25) : 0;
    const rcl = tt > RC0 && tt < RC0 + 0.8 ? 0.05 * Math.exp(-(tt - RC0) * 6) * Math.sin((tt - RC0) * 20) : 0;
    const fly = tt > FLY0 && tt < INW ? Math.sin(PI * (tt - FLY0) / (INW - FLY0)) : 0, lurch = tt > RC0 && tt < RC0 + 0.3 ? Math.sin(PI * (tt - RC0) / 0.3) : 0;   // r4: airborne into the barn; the lurch on the shot
    return { x, yaw, y: y + land + 0.85 * fly + 0.1 * lurch, pitch: pitch + crash - rcl + 0.12 * fly + 0.1 * lurch };
  }
  // track distances: each side = distance travelled ± half-track × yaw (skid steering); idle wheel-spin in the mud
  const trackS = (tt) => {
    const p = vehPose(tt), d = p.x, w = 0.98 * p.yaw;
    const spin = tt < OUT0 ? 0 : 0;
    return [d - w + spin, d + w + spin];
  };
  const stageAt = (tt) => ({
    tr: smooth(u01(tt, TR0 + 0.2, TR1)),
    plates: PL.map((p) => u01(tt, p - 0.05, p + 0.25)),
    slope: smooth(u01(tt, TILT0, TILT1)),
    hullGun: tt > HG && tt < TUR0 + 0.4 ? u01(tt, HG, HG + 0.3) * (1 - u01(tt, TUR0 + 0.1, TUR0 + 0.4)) : 0,
    tur: u01(tt, TUR0, TUR0 + 0.45),
    gyro: u01(tt, GYRO, GYRO + 0.3), gyroSpin: tt > GYRO ? (tt - GYRO) * 26 : 0,
    deckOpen: tt > MOW - 0.35 && tt < TB + 0.75 ? smooth(u01(tt, MOW - 0.35, MOW - 0.05)) * (1 - smooth(u01(tt, TB + 0.35, TB + 0.7))) : 0,
    tb: u01(tt, TB - 0.35, TB + 0.25), mower: tt < MOW ? 1 : 0,
    peri: u01(tt, PERI0, t.roof + 0.15),
    kit: [u01(tt, t.radio - 0.05, t.radio + 0.3), 0, u01(tt, t.cup - 0.05, t.cup + 0.25), u01(tt, t.horn - 0.05, t.horn + 0.25)],
    hatch: tt < HATCH0 ? 1 : tt < POPUP ? 1 - smooth(u01(tt, HATCH0, HATCH1)) : 1.21 * smooth(u01(tt, POPUP, POPUP + 0.3)),   // r2: 2.3 rad, leaning back off his face (the turret nose is 1 cm behind its tip)
    dents: (tt > PK[1][0] + PK_T ? 1 : 0) + (tt > PK[2][0] + PK_T ? 1 : 0),
    splat: tt > PK[1][0] + PK_T ? 1 : 0,
    glow: tt < SPIN ? 0 : tt < BLAST ? 0.35 + 0.25 * smooth(u01(tt, HP, HP + 0.4)) : tt < BLAST + 1.2 ? 1 : 0.5,
    fan: tt < SPIN ? 0 : (tt - SPIN) ** 2 * 18 + (tt - SPIN) * 30,
    sway: tt > t.radio ? 0.12 * Math.sin((tt - t.radio) * 7) * Math.exp(-(tt - t.radio) * 1.2) + 0.03 * Math.sin(tt * 2.3) : 0,
    springGlow: tt > t.shock - 0.1 && tt < t.mechanism + 0.4 ? Math.sin(PI * u01(tt, t.shock - 0.1, t.mechanism + 0.4)) : 0,
    gauge: tt < t.heavy ? 0.8 : tt < SPIN ? lerp(0.8, -0.9, smooth(u01(tt, t.heavy, t.faster))) : tt < HP ? -0.9 : lerp(-0.9, 2.2, smooth(u01(tt, HP, HP + 0.4))) + 0.05 * Math.sin(tt * 31),
  });
  // turret yaw (relative to the hull), gun elevation (stabilised after the gyro), recoil
  const AIM_T2 = Math.atan2(-(D.t2[1] - TZ), D.t2[0] - (RCX - 0.7));
  const aimAt = (x, tx, tz) => Math.atan2(-(tz - TZ), tx - (x - 0.7));
  function turretAt(tt, p) {
    let yawW;   // world yaw of the gun
    if (tt < TUR0) yawW = p.yaw;
    else if (tt < TUR2) yawW = 4 * PI + AIM_MELON + (tt < TUR0 + 0.4 ? 0.4 * (1 - u01(tt, TUR0, TUR0 + 0.4)) : 0);
    else if (tt < DRV0) yawW = 4 * PI + lerp(AIM_MELON, AIM_T2, smooth(u01(tt, TUR2, TUR2 + 0.9)));
    else if (tt < CL0) { const x = p.x, a = aimAt(x, D.bull[0], D.bull[1]); yawW = 4 * PI + lerp(AIM_T2, a, smooth(u01(tt, DRV0, DRV0 + 0.8))); if (tt > t.heavy) yawW = 4 * PI + (tt < t.weighs ? lerp(a, 1.5, smooth(u01(tt, t.heavy, t.faster))) : lerp(1.5, 0.25, smooth(u01(tt, t.weighs, t.little)))); }
    else yawW = 4 * PI + lerp(0.25, 0.6, smooth(u01(tt, t.climb, t.blind)));   // the gun swings away to the far side: the periscopes + the goose stay clear, the cup holder ends up beside Gary on the rear deck (not in front of his face)
    let el = 0.02;
    if (tt > t.but && tt < STAB) el = 0.02 + (tt > MISS2 - 0.35 && tt < MISS2 + 0.3 ? 0.55 * Math.sin(PI * u01(tt, MISS2 - 0.35, MISS2 + 0.3)) : 0);   // un-stabilised: rides the hull (+ the up-bump that sends shot 2 into a cloud)
    if (tt > MISS1 - 0.3 && tt < MISS1 + 0.2) el -= 0.12 * Math.sin(PI * u01(tt, MISS1 - 0.3, MISS1 + 0.2));
    if (tt >= STAB && tt < t.heavy) el = 0.04 - p.pitch;   // stabilised: level in the world
    const rec = (s0) => (tt > s0 && tt < s0 + 0.55 ? 0.33 * Math.exp(-(tt - s0) * 7) * (tt - s0 < 0.04 ? (tt - s0) / 0.04 : 1) : 0);
    const demo = (tt > t.slides - 0.05 && tt < t.backR + 0.7 ? 0.3 * Math.sin(PI * u01(tt, t.slides - 0.05, t.backR + 0.7)) : 0) + PUMPS.reduce((a, p) => a + (tt > p && tt < p + 0.38 ? 0.24 * Math.sin(PI * (tt - p) / 0.38) : 0), 0);   // the barrel slides back into the springs and returns (the demo)
    return { turYaw: yawW - p.yaw, gunEl: el, rec: rec(SHOT) + rec(SHOT2) + rec(MISS1) + rec(MISS2) + demo };
  }
  function vehicleAt(tt) {
    const p = vehPose(tt);
    Vh.g.position.set(p.x, p.y, TZ); Vh.g.rotation.set(0, p.yaw, 0); Vh.body.rotation.set(0, 0, p.pitch);
    const st = stageAt(tt), tu = turretAt(tt, p);
    const sink = tt < OUT0 ? 0.13 + 0.05 * u01(tt, t.floors, t.wins) + 0.03 * u01(tt, t.sink - 0.1, t.sink + 0.3) : Math.max(0, 0.21 * (1 - smooth(u01(tt, OUT0, t.wide))));
    Vh.setStage({ ...st, ...tu, sink });
    SPL.forEach((g, k) => { const a = tt - (PK[k + 1][0] + PK_T); g.visible = a > 0; g.scale.setScalar(a > 0 ? Math.min(1, 0.4 + a * 6) : 0.01); });
    const [sF, sN] = trackS(tt); Vh.setTracks(sF, sN, st.tr, [u01(tt, TR0 - 0.05, t.platesT + 0.1), u01(tt, t.steelT - 0.05, t.continuous + 0.1)]);   // the chains wrap on, far side then near side, while Gary hammers
    Vh.kWheels.forEach((w, i) => (w.rotation.z = tt < TR0 ? -tt * (tt > t.floors ? 34 : 22) * (i < 2 ? 1 : 0.4) : 0));   // spinning in the mud
    // the kart's wheels spin in the mud (hook)
    Vh.g.updateMatrixWorld(true);
    return p;
  }
  const wpos = (o, out = new THREE.Vector3()) => { o.updateWorldMatrix(true, false); return o.getWorldPosition(out); };
  const muzzleAt = (tt) => { vehicleAt(tt); return wpos(Vh.muzzle, new THREE.Vector3()); };
  const gunDirAt = (tt) => { vehicleAt(tt); const a = wpos(Vh.muzzle, new THREE.Vector3()), b = Vh.recoil.localToWorld(new THREE.Vector3(2.0, 0, 0)); return a.sub(b).normalize(); };
  const toWorld = (lx, ly, lz) => { Vh.body.updateWorldMatrix(true, false); return Vh.body.localToWorld(V(lx, ly, lz)); };

  // ---------------------------------------------------------------- effects scheduled from the word times
  const KM = [];   // kick list, filled alongside the effects
  const kick = (tt, s, d) => KM.push(d ? [tt, s, d] : [tt, s]);
  // HOOK: the kart's rear wheels spray mud; the floor-it surge; SPLAT on Gary
  fx.stream('drops', 0, t.congrats + 0.6, { pos: [-0.65, 0.12, TZ], box: [0.2, 0.05, 0.9], rate: 70, dir: [-0.8, 1, 0.15], spread: 0.35, speed: [2.5, 4.5], color: MUD, size: [0.03, 0.06], floor: 0.0, seed: 1 });
  fx.stream('dirt', 0, t.congrats + 0.6, { pos: [-0.65, 0.12, TZ], box: [0.2, 0.05, 0.9], rate: 16, dir: [-0.8, 1, 0.1], spread: 0.3, speed: [2, 4], color: MUD, size: [0.03, 0.07], floor: 0, seed: 2 });
  fx.stream('drops', t.floors, t.wins + 0.3, { pos: [-0.65, 0.12, TZ], box: [0.2, 0.05, 0.9], rate: 160, dir: [-0.9, 1.2, 0.2], spread: 0.45, speed: [3.5, 6], color: MUD, size: [0.04, 0.08], floor: 0, seed: 3 });
  fx.burst('drops', t.wins - 0.12, { pos: [0.2, 0.9, TZ + 0.2], n: 40, dir: [-0.6, 1, 0.3], spread: 0.6, speed: [1.5, 3], color: MUD, size: [0.04, 0.07], floor: 0, seed: 4 });   // the big splat (it came off the front wheel)
  fx.burst('dust', t.floors, { alpha: 0.4, grow: 1.5, pos: [-0.7, 0.4, TZ], n: 8, speed: [0.4, 1.0], spread: 1.2, size: [0.3, 0.5], color: 0x6a5a48, seed: 5 });
  fx.burst('confetti', t.congrats, { pos: [0.2, 1.6, TZ - 0.5], n: 120, dir: [0, 1, 0.3], spread: 0.6, speed: [3, 5], seed: 6 });
  fx.burst('drops', t.sprinkler, { pos: [-0.65, 0.2, TZ], box: [0.2, 0.05, 0.9], n: 60, dir: [-0.3, 1.6, -0.3], spread: 0.3, speed: [4, 6], color: MUD, size: [0.04, 0.07], floor: 0, seed: 7 });   // the sprinkler arc
  fx.burst('drops', t.judging - 0.15, { pos: [D.post[0], D.postH + 0.9, D.post[1]], n: 14, dir: [0, -1, 0], spread: 0.4, speed: [0.3, 0.8], color: MUD, size: [0.03, 0.05], floor: 0, seed: 8 });   // it rains mud on the goose
  // TRACKS: bubbles, CLANKs, sparks, the rise out of the mud, the pressure arrows; the horse's hooves sink
  for (let k = 0; k < 4; k++) fx.burst('drops', t.sink + k * 0.18, { pos: [lerp(-1.6, 1.6, k / 3), 0.05, TZ + (k % 2 ? 0.5 : -0.5)], n: 6, dir: [0, 1, 0], spread: 0.4, speed: [0.5, 1.2], color: 0x6a4a30, size: [0.03, 0.05], floor: 0, seed: 10 + k });
  for (const [k, w] of [[0, t.wrap], [1, t.steelT], [2, t.platesT]]) { fx.burst('spark', w, { pos: [lerp(-1.5, 1.5, k / 2), 0.55, TZ + (k === 1 ? -1 : 1)], n: 26, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3.5], seed: 14 + k }); fx.burst('drops', w + 0.02, { pos: [lerp(-1.5, 1.5, k / 2), 0.2, TZ + (k === 1 ? -1 : 1)], n: 18, dir: [0, 1, 0.3], spread: 0.7, speed: [1.5, 3], color: MUD, size: [0.03, 0.06], floor: 0, seed: 17 + k }); kick(w, 0.6); }
  fx.burst('spark', t.continuous, { pos: [0.5, 0.5, TZ + 1.2], n: 14, speed: [0.8, 1.6], spread: 1.2, seed: 20 });
  fx.stream('drops', OUT0, t.wide + 0.4, { pos: [-2.1, 0.3, TZ], box: [0.2, 0.2, 2.2], rate: 50, dir: [-0.5, 1, 0], spread: 0.4, speed: [1, 2.5], color: MUD, size: [0.03, 0.06], floor: 0, seed: 21 });   // mud sheds off the rising tracks
  fx.burst('dust', OUT1, { alpha: 0.4, grow: 1.5, pos: [3.2, 0.1, TZ + 1.2], box: [4, 0.1, 0.2], n: 10, speed: [0.3, 0.8], spread: 1.2, size: [0.3, 0.5], seed: 22 });
  fx.burst('drops', t.softer + 0.1, { pos: [-0.9, 0.1, -3.7], box: [1.2, 0.05, 0.6], n: 30, dir: [0, 1, 0.3], spread: 0.6, speed: [1.2, 2.4], color: MUD, size: [0.04, 0.07], floor: 0, seed: 23 });   // SPLOOT: the horse sinks
  // STEER: dust off the arc + the spin ring; dizzy
  fx.stream('dust', t.slow, t.around + 0.2, { alpha: 0.4, grow: 1.5, pos: [4.6, 0.1, TZ + 1.2], box: [1.5, 0.1, 0.3], rate: 12, speed: [0.3, 0.8], spread: 1.2, size: [0.3, 0.5], seed: 25 });
  fx.stream('dust', SP0, SP1, { alpha: 0.45, grow: 1.6, pos: [XS, 0.15, TZ], box: [4.2, 0.1, 3.2], rate: 34, dir: [0, 0.5, 0], speed: [0.8, 1.8], spread: 1.4, size: [0.35, 0.6], seed: 26 });
  fx.stream('dirt', SP0, SP1, { pos: [XS, 0.1, TZ], box: [4, 0.05, 3], rate: 30, dir: [0, 1, 0], spread: 1.2, speed: [1.5, 3], color: 0x7b5a3a, floor: 0, seed: 27 });
  fx.burst('spark', t.eyeballs, { pos: [XS + 1.2, 1.9, TZ], n: 20, speed: [1, 2], spread: 1.3, seed: 28 });
  // GOOSE: the honk shockwave, Gary's landing, the chase dust + feathers
  fx.burst('dust', t.louder, { alpha: 0.35, grow: 2.2, pos: [9.0, 0.6, TZ], n: 12, dir: [-1, 0.2, 0], spread: 0.5, speed: [2, 4], size: [0.3, 0.5], color: 0xe8e4da, seed: 30 });
  fx.burst('confetti', t.louder + 0.05, { pos: [9.6, 0.9, TZ], n: 30, dir: [0, 1, 0], spread: 0.8, speed: [1, 2], color: 0xffffff, size: [0.04, 0.07], seed: 31 });   // feathers
  fx.burst('dust', JUMP1, { alpha: 0.4, grow: 1.5, pos: [8.55, 0.08, -0.45], n: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.2, 0.4], seed: 32 });
  fx.stream('dust', CH0, CH1, { alpha: 0.38, grow: 1.4, pos: [7.0, 0.06, -0.5], box: [5, 0.04, 0.2], rate: 14, speed: [0.3, 0.7], spread: 1.2, size: [0.2, 0.35], seed: 33 });
  fx.stream('confetti', CH0, CH1, { pos: [7.0, 0.7, -0.5], box: [5, 0.2, 0.2], rate: 12, dir: [0, 1, 0], spread: 1, speed: [0.5, 1.2], color: 0xffffff, size: [0.04, 0.06], seed: 34 });
  fx.burst('dust', BACK1, { alpha: 0.4, grow: 1.5, pos: [XS + 1.2, 0.9, TZ], n: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.2, 0.4], seed: 35 });
  // ARMOR: cannon puffs (FOOMP), splats, CLANG sparks, the tilt, the bounces
  PK.forEach(([f], i) => { fx.burst('smoke', f, { pos: [S.cannonMuzzle.x, S.cannonMuzzle.y, S.cannonMuzzle.z], n: 8, speed: [0.8, 1.8], spread: 0.8, size: [0.5, 0.9], color: 0xe8e4da, seed: 40 + i }); });
  PL.forEach((p, k) => { fx.burst('spark', p + 0.08, { pos: [XS + [2.6, 0.3, 0.0, -2.4][k], [0.9, 1.1, 1.5, 1.0][k], TZ + [0.4, 1.3, 0.5, 0.4][k]], n: 24, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3.2], seed: 46 + k }); kick(p + 0.08, k ? 0.15 : 0.45); });
  fx.burst('spark', TILT1 - 0.1, { pos: [XS + 2.6, 0.6, TZ + 1.3], n: 26, dir: [0, 1, 0.5], spread: 1.0, speed: [1.5, 3.2], seed: 51 });
  // TURRET: the hull gun's bolts, the pivot dust, the turret drop, the laser, the shot, the melon, the recoil slide, the barn
  for (let k = 0; k < 2; k++) fx.burst('spark', HG + 0.15 + k * 0.25, { pos: [XS + 1.6, 1.5, TZ + 0.4], n: 18, dir: [0, 1, 0.4], spread: 1.0, speed: [1.5, 3], seed: 55 + k });
  fx.stream('dust', PIV0, RET1, { alpha: 0.42, grow: 1.6, pos: [XS, 0.12, TZ], box: [4.4, 0.1, 3.0], rate: 22, speed: [0.5, 1.2], spread: 1.3, size: [0.3, 0.55], seed: 57 });
  fx.burst('dust', TUR0 + 0.4, { alpha: 0.42, grow: 1.5, pos: [XS - 0.5, 1.5, TZ], n: 12, speed: [0.5, 1.4], spread: 1.3, size: [0.3, 0.5], seed: 58 }); kick(TUR0 + 0.4, 0.7);
  fx.burst('spark', TUR0 + 0.4, { pos: [XS - 0.5, 1.5, TZ + 0.9], n: 30, dir: [0, 1, 0.4], spread: 1.2, speed: [1.5, 3.2], seed: 59 });
  fx.burst('glow', t.ring, { pos: [XS - 0.5, 1.5, TZ + 0.95], n: 3, speed: [0, 0.01], size: [0.6, 0.9], seed: 60 });
  { const m = muzzleAt(SHOT); fx.burst('glow', SHOT, { pos: m.toArray(), n: 3, speed: [0, 0.01], size: [1.3, 1.9], seed: 61 }); fx.burst('smoke', SHOT + 0.02, { pos: m.toArray(), n: 16, speed: [1, 2.5], spread: 1.0, size: [0.4, 0.8], color: 0xd8d4cc, seed: 62 }); fx.burst('spark', SHOT, { pos: m.toArray(), n: 40, dir: gunDirAt(SHOT).toArray(), spread: 0.5, speed: [3, 7], seed: 63 }); }
  fx.burst('crumb', HITM, { pos: [MEL.x, MEL.y + 0.1, MEL.z], n: 140, dir: [0.3, 1, 0.4], spread: 1.3, speed: [2.5, 6], color: 0xe8424a, size: [0.07, 0.15], floor: 0.02, seed: 64 });
  fx.burst('mist', HITM + 0.02, { pos: [MEL.x, MEL.y + 0.2, MEL.z + 0.2], n: 8, speed: [0.6, 1.4], spread: 1.0, size: [0.35, 0.7], color: 0xff7a8a, seed: 69 });
  fx.burst('crumb', HITM, { pos: [MEL.x, MEL.y + 0.1, MEL.z], n: 40, dir: [0, 1, 0.3], spread: 1.2, speed: [2, 4.5], color: 0x2f7f2a, size: [0.09, 0.18], floor: 0.02, seed: 65 });
  fx.burst('drops', HITM, { pos: [MEL.x, MEL.y + 0.1, MEL.z], n: 60, dir: [0, 1, 0.2], spread: 1.2, speed: [1.5, 4], color: 0xff6a7a, size: [0.03, 0.06], floor: 0.02, seed: 66 });
  fx.burst('crumb', HITM + 0.02, { pos: [MEL.x, MEL.y + 0.2, MEL.z], n: 30, dir: [0, 1, 0.2], spread: 1.2, speed: [1.5, 3], color: 0x1b1b1b, size: [0.015, 0.025], floor: 0.02, seed: 67 });   // the seeds
  fx.stream('dust', FLY0, OUTW + 0.6, { alpha: 0.42, grow: 1.6, pos: [XS + 5, 0.12, TZ], box: [9, 0.1, 3], rate: 30, speed: [0.5, 1.2], spread: 1.3, size: [0.35, 0.6], seed: 68 });
  const IN0 = INW - 0.02, IN1 = OUTW - 0.02;   // the front breaks the near end wall, then the far one
  fx.burst('dirt', RC0 + 0.05, { pos: [XS + 1.2, 0.1, TZ + 1.3], box: [3, 0.05, 0.3], n: 24, dir: [1, 1, 0.3], spread: 0.6, speed: [1.5, 3], color: 0x7b5a3a, floor: 0, seed: 79 });
  fx.burst('dust', FLY0, { alpha: 0.45, grow: 1.6, pos: [XS + LURCH, 0.15, TZ + 1.2], box: [3, 0.1, 0.4], n: 14, dir: [-1, 0.4, 0], spread: 0.8, speed: [1, 2.5], size: [0.35, 0.6], seed: 87 }); kick(FLY0, 0.5);
  for (const [k, w, x] of [[0, IN0, D.barn.x0], [1, IN1, D.barn.x1]]) {
    fx.burst('crumb', w, { pos: [x, 1.3, TZ], box: [0.2, 1.6, 2.4], n: 60, dir: [1, 0.6, 0.2], spread: 0.8, speed: [2.5, 6], color: 0xb5352a, size: [0.07, 0.16], floor: 0.02, seed: 70 + k });
    fx.burst('crumb', w + 0.02, { pos: [x, 1.0, TZ], box: [0.3, 1.2, 2.4], n: 70, dir: [1, 0.8, 0.3], spread: 1.0, speed: [1.5, 4], color: 0xe1bf5c, size: [0.04, 0.09], floor: 0.02, seed: 72 + k });
    fx.burst('dust', w + 0.03, { alpha: 0.45, grow: 1.6, pos: [x + 0.5, 1.0, TZ], n: 16, speed: [0.8, 2.0], spread: 1.3, size: [0.4, 0.7], color: 0xd8c08a, seed: 74 + k });
    kick(w, k ? 1.1 : 0.3);   // r3: the near-wall break is off-screen (the camera is on the melon) — only the far-wall burst is felt
  }
  fx.stream('crumb', IN0, IN1 + 0.6, { pos: [(D.barn.x0 + D.barn.x1) / 2, 3.0, -3.5], box: [5, 0.1, 4], rate: 40, dir: [0, -1, 0], spread: 0.6, speed: [0.2, 0.6], color: 0xe1bf5c, size: [0.04, 0.08], floor: 0.02, seed: 76 });   // hay sifts off the loft
  fx.stream('confetti', IN0, IN1 + 1.2, { pos: [(D.barn.x0 + D.barn.x1) / 2, 1.5, -3.0], box: [5, 1, 3], rate: 18, dir: [0, 1, 0], spread: 1, speed: [0.5, 1.5], color: 0xf2ece0, size: [0.04, 0.07], seed: 77 });   // chicken feathers
  fx.burst('dust', RC1, { alpha: 0.42, grow: 1.5, pos: [RCX + 2.2, 0.12, TZ + 1.2], box: [1.2, 0.1, 0.4], n: 12, dir: [1, 0.4, 0], spread: 0.9, speed: [1, 2], size: [0.3, 0.5], seed: 78 }); kick(RC1, 0.6);
  // RECOIL: the cylinders glow (arrows), the second shot, the target bale's hay burst, the chicken
  { const m = muzzleAt(SHOT2); fx.burst('glow', SHOT2, { pos: m.toArray(), n: 3, speed: [0, 0.01], size: [1.1, 1.6], seed: 80 }); fx.burst('smoke', SHOT2 + 0.02, { pos: m.toArray(), n: 14, speed: [1, 2.5], spread: 1.0, size: [0.4, 0.8], color: 0xd8d4cc, seed: 81 }); fx.burst('spark', SHOT2, { pos: m.toArray(), n: 30, dir: gunDirAt(SHOT2).toArray(), spread: 0.5, speed: [3, 7], seed: 82 }); }
  fx.burst('crumb', SHOT2 + 0.15, { pos: [D.t2[0], 0.7, D.t2[1]], n: 90, dir: [0, 1, 0.2], spread: 1.3, speed: [2, 5], color: 0xe1bf5c, size: [0.04, 0.09], floor: 0.02, seed: 83 });
  fx.burst('dust', SHOT2 + 0.17, { alpha: 0.45, grow: 1.7, pos: [D.t2[0], 0.8, D.t2[1]], n: 14, speed: [0.8, 2], spread: 1.3, size: [0.5, 0.9], color: 0xd8c08a, seed: 84 });
  fx.burst('confetti', t.chicken, { pos: [RCX + 1.0, 2.4, TZ], n: 25, dir: [0, 1, 0], spread: 0.8, speed: [1, 2], color: 0xf2ece0, size: [0.04, 0.06], seed: 85 });
  // STAB: shots 1 + 2 (scarecrow, cloud), the gyro's glow, the bounce-out
  for (const [k, s] of [[0, MISS1], [1, MISS2]]) { const m = muzzleAt(s); fx.burst('glow', s, { pos: m.toArray(), n: 2, speed: [0, 0.01], size: [1.0, 1.4], seed: 90 + k }); fx.burst('smoke', s + 0.02, { pos: m.toArray(), n: 10, speed: [1, 2.2], spread: 1.0, size: [0.4, 0.7], color: 0xd8d4cc, seed: 92 + k }); kick(s, 0.35); }
  const HITS = MISS1 + 0.18, POOF = MISS2 + 0.4;
  fx.burst('crumb', HITS, { pos: [D.scare[0], 1.6, D.scare[1]], n: 70, dir: [0.3, 1, 0.2], spread: 1.2, speed: [2, 4.5], color: 0xe8cf70, size: [0.03, 0.07], floor: 0.02, seed: 94 });
  fx.burst('crumb', HITS, { pos: [D.scare[0], 1.4, D.scare[1]], n: 20, dir: [0.3, 1, 0.2], spread: 1.0, speed: [2, 4], color: 0x3f6fb8, size: [0.05, 0.1], floor: 0.02, seed: 95 });
  fx.burst('dust', POOF, { alpha: 0.7, grow: 2.4, pos: D.cloud, box: [6, 1.4, 1.4], n: 30, speed: [1, 3], spread: 1.3, size: [1.2, 2.2], color: 0xffffff, g: 0, seed: 96 });
  fx.burst('confetti', POOF + 0.05, { pos: D.cloud, n: 40, speed: [1, 3], spread: 1.3, color: 0xffffff, seed: 97 });
  fx.burst('spark', GYRO + 0.2, { pos: (vehicleAt(GYRO + 0.2), toWorld(-1.2, 1.8, 0.4).toArray()), n: 14, speed: [0.8, 1.8], spread: 1.2, seed: 98 });
  fx.stream('dust', DRV0, DRV1, { alpha: 0.38, grow: 1.5, pos: [30, 0.3, TZ + 1.3], box: [12, 0.2, 0.3], rate: 10, speed: [0.3, 0.8], spread: 1.2, size: [0.3, 0.5], seed: 99 });
  // TURBINE: the mower coughs, the mower flies out, the turbine drop, the spin-up, 1,500 hp, the blast
  for (let k = 0; k < 5; k++) fx.burst('smoke', t.heavy + k * 0.32, { pos: [XB1 - 1.3 - 2.5, 1.05, TZ], n: 4, dir: [-1, 0.6, 0], speed: [0.4, 1], spread: 0.6, size: [0.25, 0.45], color: 0x3c3a38, seed: 100 + k });
  fx.burst('spark', MOW, { pos: [XB1 - 1.8, 1.5, TZ + 0.2], n: 26, dir: [0, 1, 0], spread: 0.8, speed: [1.5, 3], seed: 106 });
  fx.burst('dust', MOW + 0.75, { alpha: 0.42, grow: 1.5, pos: [XB1 - 5.4, 0.1, TZ + 0.6], n: 10, speed: [0.4, 1], spread: 1.2, size: [0.25, 0.45], seed: 107 }); kick(MOW + 0.75, 0.4);
  fx.burst('dust', TB + 0.25, { alpha: 0.42, grow: 1.5, pos: [XB1 - 1.85, 1.6, TZ], n: 10, speed: [0.4, 1], spread: 1.2, size: [0.25, 0.45], seed: 108 }); kick(TB + 0.25, 0.7);
  fx.burst('spark', TB + 0.25, { pos: [XB1 - 1.85, 1.3, TZ + 1.0], n: 30, dir: [0, 1, 0.4], spread: 1.0, speed: [1.5, 3], seed: 109 });
  fx.burst('spark', HP, { pos: [XB1 - 1.85, 1.0, TZ + 1.3], n: 20, speed: [1, 2.2], spread: 1.2, seed: 110 }); kick(HP, 0.8);
  fx.stream('dust', HP, BLAST, { alpha: 0.4, grow: 1.6, pos: [XB1 - 2.9, 0.4, TZ - 1.1], box: [0.3, 0.4, 0.6], rate: 12, dir: [-1, 0.2, 0], speed: [1.5, 3], spread: 0.5, size: [0.3, 0.55], seed: 111 });
  fx.burst('glow', BLAST, { pos: [XB1 - 2.7, 1.05, TZ - 0.3], n: 2, speed: [0, 0.01], size: [0.6, 0.9], seed: 112 });
  fx.burst('smoke', BLAST + 0.02, { pos: [XB1 - 2.8, 1.05, TZ - 0.2], n: 18, dir: [-1, 0.15, 0], spread: 0.35, speed: [3, 6], size: [0.35, 0.6], color: 0xc07a4a, seed: 118 });
  fx.burst('spark', BLAST, { pos: [XB1 - 2.6, 1.05, TZ], n: 90, dir: [-1, 0.1, 0], spread: 0.35, speed: [5, 10], color: 0xffa23a, seed: 113 });
  fx.stream('spark', BLAST, BLAST + 1.0, { pos: [XB1 - 2.6, 1.05, TZ], box: [0.1, 0.4, 1.5], rate: 90, dir: [-1, 0.1, 0], spread: 0.3, speed: [5, 9], seed: 114 });
  fx.burst('smoke', BLAST + 0.1, { pos: [XB1 - 3.6, 1.2, TZ], n: 16, dir: [-1, 0.3, 0], speed: [2, 4], spread: 0.6, size: [0.3, 0.55], color: 0x9a9a9a, alpha: 0.45, seed: 115 });
  fx.stream('smoke', BLAST + 0.3, BLAST + 3.0, { pos: [XB1 - 3.6, 1.6, TZ], box: [0.1, 0.05, 0.1], rate: 6, color: 0xb4b4b4, alpha: 0.45, dir: [0, 1, 0], spread: 0.3, speed: [0.12, 0.3], g: -0.5, life: [1.2, 1.9], size: [0.1, 0.18], seed: 116 });   // Gary smokes
  fx.burst('confetti', BLAST + 0.05, { pos: [XB1 - 3.6, 2.0, TZ], n: 30, dir: [-1, 1, 0], spread: 0.8, speed: [2, 4], color: 0x8a6a4a, size: [0.04, 0.06], seed: 117 });   // singed chicken feathers
  kick(BLAST, 1.2);
  // BRIDGE: creaks, the snap, the splash, the rise
  for (let k = 0; k < 3; k++) fx.burst('crumb', t.little + 0.3 + k * 0.4, { pos: [lerp(43, 49, k / 2), BRIDGE_Y - 0.05, TZ], n: 10, dir: [0, -1, 0], spread: 0.8, speed: [0.3, 0.8], color: 0x9a7048, size: [0.02, 0.05], floor: C.bed, seed: 120 + k });
  fx.burst('crumb', SNAP, { pos: [BRX, BRIDGE_Y, TZ], box: [1.4, 0.2, 3], n: 60, dir: [0, 1, 0.2], spread: 1.2, speed: [2, 4.5], color: 0x9a7048, size: [0.06, 0.15], floor: C.bed, seed: 123 }); kick(SNAP, 1.0);
  fx.burst('drops', LAND, { pos: [BRX, C.level + 0.1, TZ], box: [4.5, 0.2, 3], n: 200, dir: [0, 1, 0.3], spread: 0.7, speed: [3, 7], size: [0.04, 0.08], floor: C.level - 0.2, seed: 124 });
  fx.burst('mist', LAND + 0.05, { pos: [BRX, C.level + 0.6, TZ + 0.4], box: [4, 0.4, 2], n: 26, speed: [1, 2.2], spread: 1.2, size: [0.6, 1.2], color: steamCol, seed: 125 }); kick(LAND, 1.4);
  fx.burst('drops', LAND + 0.25, { pos: [BRX - 2.5, C.level + 0.1, TZ + 1.0], n: 40, dir: [-1, 1, 0.5], spread: 0.5, speed: [2, 4], size: [0.04, 0.07], floor: C.level - 0.2, seed: 126 });
  fx.stream('drops', t.garyM, t.submarine + 0.9, { pos: [BRX + 1.0, C.level + 0.05, TZ], box: [0.3, 0.05, 0.3], rate: 14, dir: [0, 1, 0], spread: 0.2, speed: [0.4, 0.9], size: [0.03, 0.05], floor: C.level - 0.3, seed: 127 });   // blub blub
  fx.burst('spark', t.circle, { pos: [D.mlc[0], 1.72, D.mlc[1] - 0.3], n: 18, speed: [0.8, 1.8], spread: 1.3, seed: 128 });
  fx.burst('spark', t.eighty, { pos: [BRX + 2.5, 0.2, TZ + 0.8], n: 24, speed: [1, 2.2], spread: 1.3, seed: 129 });
  // PERI: water sheds off the climb, the fence CRUNCH, the periscope pops, the goose hop
  fx.stream('drops', CL0, CL0 + 1.4, { pos: [50, 0.2, TZ], box: [3, 0.6, 2.4], rate: 80, dir: [0, -1, 0], spread: 0.4, speed: [0.5, 1.5], size: [0.03, 0.06], floor: C.level - 0.2, seed: 130 });
  fx.burst('crumb', CL1, { pos: [D.endFence, 0.7, TZ], box: [0.2, 0.6, 3.6], n: 50, dir: [1, 0.8, 0], spread: 0.9, speed: [2, 5], color: 0x8b6a44, size: [0.06, 0.14], floor: 0.02, seed: 131 });
  fx.burst('dust', CL1 + 0.02, { alpha: 0.45, grow: 1.6, pos: [D.endFence, 0.5, TZ], n: 14, speed: [0.8, 2], spread: 1.3, size: [0.4, 0.7], seed: 132 }); kick(CL1, 1.1);
  for (let k = 0; k < 3; k++) { fx.burst('spark', PERI0 + 0.15 + k * 0.33, { pos: [XE + 1.33, 1.6, TZ + (k - 1) * 0.36], n: 16, dir: [0, 1, 0], spread: 0.8, speed: [1, 2.2], seed: 133 + k }); kick(PERI0 + 0.15 + k * 0.33, 0.3); }
  fx.burst('dust', GHOP1, { alpha: 0.4, grow: 1.5, pos: [XE + 2.3, 1.2, TZ], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.2, 0.35], seed: 137 });
  fx.burst('confetti', t.immediately, { pos: [XE + 2.0, 1.9, TZ], n: 20, dir: [0, 1, 0], spread: 0.8, speed: [1, 2], color: 0xffffff, size: [0.04, 0.06], seed: 138 });
  // FINISH: antenna boing, the cup, the horn, the honk duel
  fx.burst('spark', t.radio, { pos: [XE - 1.8, 2.2, TZ - 0.5], n: 18, speed: [1, 2], spread: 1.3, seed: 140 });
  fx.burst('spark', t.cup, { pos: [XE - 1.95, 2.0, TZ - 0.98], n: 16, speed: [1, 2], spread: 1.3, seed: 143 });
  fx.burst('spark', t.horn, { pos: [XE + 2.35, 1.6, TZ + 1.0], n: 16, speed: [1, 2], spread: 1.3, seed: 144 });
  fx.burst('dust', t.honksF + 0.05, { alpha: 0.3, grow: 2.2, pos: [XE + 2.6, 1.6, TZ + 1.0], n: 8, dir: [1, 0.1, 0], spread: 0.4, speed: [2, 3.5], size: [0.2, 0.35], color: 0xe8e4da, seed: 145 });
  fx.burst('dust', t.gooseF + 0.1, { alpha: 0.3, grow: 2.2, pos: [XE + 2.2, 1.9, TZ], n: 8, dir: [-1, 0.1, 0], spread: 0.4, speed: [2, 3.5], size: [0.2, 0.35], color: 0xe8e4da, seed: 146 });
  // END: confetti, money, Gary's mud landing, the tank driving off
  fx.burst('confetti', t.end, { pos: [XE, 3.0, TZ], box: [4, 0.4, 1.5], n: 200, dir: [0, 1, 0.3], spread: 0.6, speed: [2.5, 4.5], seed: 150 });
  fx.burst('bill', t.nineteen, { pos: [XE - 0.5, 3.4, TZ - 1.4], box: [2.4, 0.3, 1.0], n: 60, dir: [0, 1, 0], spread: 0.8, speed: [1, 2.5], life: [1.8, 2.4], seed: 151 });
  fx.burst('drops', FALL1, { pos: [C.xr + 1.0, 0.1, TZ + 0.3], n: 60, dir: [0, 1, 0.3], spread: 0.8, speed: [1.5, 3.5], color: MUD, size: [0.04, 0.08], floor: 0, seed: 152 }); kick(FALL1, 1.0);
  fx.stream('dust', DRIVE, END, { alpha: 0.4, grow: 1.6, pos: [XE + 3, 0.12, TZ], box: [4, 0.1, 3], rate: 16, speed: [0.5, 1.2], spread: 1.3, size: [0.35, 0.6], seed: 153 });
  fx.burst('crumb', t.mudEnd, { pos: [C.xr + 1.0, 0.3, TZ + 0.3], n: 20, dir: [0, 1, 0.3], spread: 1.0, speed: [0.8, 1.6], color: MUD, size: [0.03, 0.06], floor: 0, seed: 154 });
  // TURBO fill (034): something new on screen at least every ~0.8 s — small word-keyed bursts in the stretches the density
  // report (tools/density.py) found empty
  const vp = (tt, lx, ly, lz) => { vehicleAt(tt); return toWorld(lx, ly, lz).toArray(); };
  fx.burst('drops', 0.35, { pos: [-0.65, 0.2, TZ + 0.5], n: 30, dir: [-0.4, 1.3, 0.6], spread: 0.4, speed: [3, 5], color: MUD, size: [0.04, 0.07], floor: 0, seed: 200 }); kick(0.35, 0.3);
  fx.burst('drops', 0.95, { pos: [0.65, 0.2, TZ + 0.5], n: 24, dir: [0.4, 1.3, 0.6], spread: 0.4, speed: [3, 5], color: MUD, size: [0.04, 0.07], floor: 0, seed: 201 }); kick(0.95, 0.25);
  fx.burst('drops', t.congrats + 0.6, { pos: [0.75, 1.4, TZ + 0.1], n: 10, dir: [0, -1, 0], spread: 0.3, speed: [0.2, 0.6], color: MUD, size: [0.03, 0.05], floor: 0.1, seed: 202 });   // mud drips off Gary
  fx.burst('dust', t.congrats + 1.1, { alpha: 0.35, grow: 1.4, pos: [D.post[0], 1.6, D.post[1]], n: 4, speed: [0.2, 0.5], spread: 1.2, size: [0.2, 0.3], color: 0xffffff, seed: 203 });
  for (let i = 0; i < 4; i++) kick(t.four + i * 0.1, 0.12, 0.2);   // each pressure arrow thumps
  for (const [k, w] of [[0, t.continuous + 0.4], [1, t.spreads + 0.2], [2, t.wide + 0.3], [3, t.seventy + 0.3], [4, t.softer]]) fx.burst('dirt', w, { pos: vp(w, -1.9 + k * 0.9, 0.08, 1.0), n: 12, dir: [-0.6, 1, 0.3], spread: 0.6, speed: [1, 2.2], color: MUD, size: [0.04, 0.08], floor: 0, seed: 204 + k });   // mud clods off the links
  fx.burst('dust', t.nowS + 0.2, { alpha: 0.4, grow: 1.5, pos: [3.6, 0.15, TZ + 1.3], n: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.3, 0.5], seed: 210 });
  for (let k = 0; k < 4; k++) { const w = t.slow + 0.35 + k * 0.42; fx.burst('dirt', w, { pos: vp(w, 0, 0.1, k % 2 ? 1.0 : -1.0), n: 10, dir: [0, 1, k % 2 ? 0.6 : -0.6], spread: 0.6, speed: [1.2, 2.5], color: 0x7b5a3a, floor: 0, seed: 211 + k }); }
  for (let k = 0; k < 3; k++) { const w = t.skid + 0.25 + k * 0.35; fx.burst('spark', w, { pos: vp(w, 1.6 - k, 0.4, 1.25), n: 10, speed: [1, 2], spread: 1.2, seed: 215 + k }); }
  fx.burst('spark', t.place - 0.1, { pos: [XS + 1.0, 2.0, TZ], n: 24, speed: [1.5, 3], spread: 1.3, seed: 218 }); kick(t.place, 0.3);
  fx.burst('confetti', t.blocks, { pos: [9.5, 0.8, TZ], n: 16, dir: [0, 1, 0], spread: 0.9, speed: [1, 2], color: 0xffffff, size: [0.04, 0.06], seed: 219 }); kick(t.blocks, 0.25);
  fx.burst('dust', t.gets, { alpha: 0.4, grow: 1.5, pos: [XS + 1.6, 0.9, TZ + 0.9], n: 6, speed: [0.3, 0.7], spread: 1.2, size: [0.2, 0.3], seed: 220 });
  for (let k = 0; k < 3; k++) fx.burst('confetti', CH0 + 0.4 + k * 0.4, { pos: [lerp(9, 5.5, k / 2), 0.8, -0.6], n: 12, dir: [0, 1, 0], spread: 1, speed: [0.8, 1.6], color: 0xffffff, size: [0.04, 0.06], seed: 221 + k });
  for (const [k, w] of [[0, t.sloped + 0.2], [1, t.sixty + 0.2], [2, t.cross]]) { fx.burst('spark', w, { pos: vp(w, 2.2, 1.0, 1.4), n: 8, speed: [0.6, 1.4], spread: 1.2, seed: 224 + k }); }   // r2: glints, not lens-sized glows; no kicks inside the TERM
  for (let k = 0; k < 4; k++) { const w = PIV0 + 0.3 + k * 0.45; fx.burst('dirt', w, { pos: vp(w, (k % 2 ? 1.8 : -1.8), 0.1, 1.0), n: 12, dir: [0, 1, 0.5], spread: 0.7, speed: [1.5, 3], color: 0x7b5a3a, floor: 0, seed: 227 + k }); }   // r2: no rumble kicks here (6 stacked under WRONG WAY)
  for (let k = 0; k < 2; k++) fx.burst('glow', t.target + 0.25 + k * 0.4, { pos: [MEL.x + 0.25, MEL.y + 0.1, MEL.z + 0.12], n: 1, speed: [0, 0.01], size: [0.25, 0.35], seed: 231 + k });
  for (let k = 0; k < 3; k++) { const w = t.shock + 0.1 + k * 0.45; fx.burst('spark', w, { pos: vp(w, -0.35, 1.75, 0.95), n: 8, dir: [0, 1, 0.4], spread: 0.8, speed: [0.8, 1.6], seed: 233 + k }); }   // r2: sparks off the spring collars, not white puffs over the breech
  fx.burst('crumb', t.recoilW + 0.3, { pos: [RCX, 2.6, TZ], box: [2, 0.2, 1], n: 20, dir: [0, -1, 0], spread: 0.6, speed: [0.2, 0.6], color: 0xe1bf5c, size: [0.03, 0.06], floor: 0.02, seed: 236 });   // hay still falling off it
  fx.burst('spark', t.put, { pos: vp(t.put, -1.0, 0.1, 1.2), n: 14, speed: [0.8, 1.6], spread: 1.3, seed: 237 });
  for (let x = D.bumps.x0 + 1; x < D.bumps.x1; x += D.bumps.p) { const tb = tAtDrive(x); if (tb) fx.burst('dust', tb, { alpha: 0.4, grow: 1.5, pos: [x, 0.35, TZ + 1.3], n: 6, speed: [0.3, 0.8], spread: 1.2, size: [0.25, 0.45], seed: 240 + Math.round(x) }); }
  for (let k = 0; k < 3; k++) fx.burst('spark', HP + 0.6 + k * 0.45, { pos: [XB1 - 2.6, 1.05, TZ], n: 14, dir: [-1, 0.2, 0], spread: 0.4, speed: [2, 4], seed: 260 + k });   // the turbine idling hot
  for (let k = 0; k < 3; k++) fx.burst('spark', t.stood + k * 0.22, { pos: [XB1 - 2.6, 1.05, TZ + 0.2], n: 10, dir: [-1, 0.3, 0.4], spread: 0.5, speed: [1.5, 3], color: 0xff9a3a, seed: 263 + k * 7 });   // r3: the exhaust heats up toward FWOOSH
  for (let k = 0; k < 3; k++) { const w = BR0 + 0.3 + k * 0.5; fx.burst('dust', w, { alpha: 0.4, grow: 1.5, pos: vp(w, -2.2, 0.1, 1.2), n: 6, speed: [0.4, 1], spread: 1.2, size: [0.3, 0.5], seed: 264 + k }); kick(w, 0.15, 0.25); }
  for (let k = 0; k < 3; k++) fx.burst('drops', t.number + k * 0.5, { pos: [BRX + (k - 1) * 1.4, C.level + 0.3, TZ + 0.6], n: 10, dir: [0, 1, 0], spread: 0.5, speed: [0.6, 1.4], size: [0.03, 0.05], floor: C.level, seed: 268 + k });   // the creek still sloshing
  fx.burst('spark', t.military, { pos: [D.mlc[0], 1.72, D.mlc[1] + 0.2], n: 12, speed: [0.8, 1.6], spread: 1.3, seed: 271 });
  fx.burst('confetti', t.immediately + 0.6, { pos: [XE + 2.0, 1.8, TZ], n: 12, dir: [0, 1, 0], spread: 1, speed: [0.8, 1.6], color: 0xffffff, size: [0.04, 0.06], seed: 272 });
  fx.burst('confetti', t.wanted, { pos: [XE, 3.2, TZ], box: [3, 0.4, 1.4], n: 80, dir: [0, 1, 0.3], spread: 0.6, speed: [2, 3.5], seed: 273 });
  fx.burst('drops', t.mudE, { pos: [C.xr + 1.1, 0.1, -1.9], n: 18, dir: [0, 1, 0], spread: 0.5, speed: [0.8, 1.6], color: MUD, size: [0.03, 0.06], floor: 0, seed: 274 });   // the mud burps
  fx.burst('spark', t.bridgeE, { pos: [BRX, 0.3, TZ + 0.5], n: 14, speed: [0.8, 1.6], spread: 1.3, seed: 275 });
  fx.burst('smoke', t.garyE, { pos: vp(t.garyE, -1.75, 2.75, 0.15), n: 3, dir: [0, 1, 0], speed: [0.2, 0.45], spread: 0.5, size: [0.08, 0.14], color: 0x9a9a9a, alpha: 0.5, seed: 276 });   // r3: two grey singe wisps (a black puff read as a hole)
  fx.burst('drops', t.mudEnd + 0.4, { pos: [C.xr + 1.05, 0.15, TZ + 0.35], n: 14, dir: [0, 1, 0], spread: 0.6, speed: [0.6, 1.2], color: MUD, size: [0.03, 0.05], floor: 0, seed: 277 }); kick(t.mudEnd + 0.4, 0.2);
  fx.stream('drops', LAND + 1.0, CL0, { pos: [BRX, C.level + 0.24, TZ + 0.6], box: [3.4, 0.04, 1.6], rate: 9, dir: [0, 1, 0], spread: 0.3, speed: [0.5, 1.1], color: 0xd8f4ff, size: [0.03, 0.06], floor: C.level + 0.2, seed: 290 });   // r2: the sunk tank bubbles
  fx.burst('drops', t.says + 0.05, { pos: [BRX, C.level + 0.25, TZ + 0.3], box: [2.6, 0.04, 1.2], n: 28, dir: [0, 1, 0], spread: 0.5, speed: [0.8, 1.8], color: 0xd8f4ff, size: [0.04, 0.07], floor: C.level + 0.2, seed: 291 }); kick(t.says + 0.05, 0.25);
  fx.burst('spark', t.circle, { pos: [D.mlc[0], 1.72, D.mlc[1] + 0.2], n: 16, speed: [0.8, 1.8], spread: 1.3, seed: 292 });
  fx.burst('drops', t.number + 0.05, { pos: (vehicleAt(t.number), toWorld(1.15, 1.55, 0.35).toArray()), n: 22, dir: [0.4, 1.2, 0.6], spread: 0.25, speed: [2, 3.2], size: [0.03, 0.05], floor: C.level + 0.2, seed: 293 });   // r3: Gary spits water
  PUMPS.forEach((p, k) => { kick(p + 0.02, 0.25); fx.burst('spark', p + 0.05, { pos: (vehicleAt(p), toWorld(-0.25, 1.8, 0.95).toArray()), n: 10, dir: [0, 1, 0.4], spread: 0.8, speed: [0.8, 1.6], seed: 294 + k }); });
  kick(t.eighty + 0.03, 0.35);
  fx.burst('drops', PK[0][0] + PKF(0), { pos: (vehicleAt(PK[0][0] + PKF(0)), toWorld(1.0, 1.75, 0.15).toArray()), n: 30, dir: [0, 1, 0.4], spread: 0.9, speed: [1.5, 3], color: GOO, size: [0.04, 0.08], floor: 0, seed: 295 });   // r4: the pumpkin bursts into goo on his head
  for (const k of [3, 4]) fx.burst('spark', PK[k][0] + PK_T, { pos: (vehicleAt(PK[k][0] + PK_T), toWorld(2.12, 1.08, k % 2 ? 0.45 : -0.4).toArray()), n: 20, speed: [1.5, 3], spread: 1.3, color: 0xffb24a, seed: 296 + k });   // r4: a spark ring where each pumpkin hits the slope
  for (let k = 0; k < 3; k++) fx.burst('drops', t.sprinkler - 0.35 + k * 0.32, { pos: [-0.65, 0.2, TZ], box: [0.2, 0.05, 0.9], n: 36, dir: [-0.3, 1.6, k % 2 ? 0.7 : -0.7], spread: 0.25, speed: [4, 6], color: MUD, size: [0.04, 0.07], floor: 0, seed: 297 + k });   // r5: tick, tick, tick
  fx.burst('drops', t.threeM + 0.82, { pos: [D.mlc[0] + 1.6, C.level + 0.25, D.mlc[1]], n: 30, dir: [0, 1, 0], spread: 0.6, speed: [1.5, 3], size: [0.04, 0.07], floor: C.level + 0.2, seed: 300 }); kick(t.threeM + 0.82, 0.3);   // r5: the 3 sign SPLOSHes into the creek
  // TURBO fill, pass 2 (on the real voice): one small word-keyed event per empty stretch (glints only inside TERM lines)
  const w2 = (b, w, n) => { try { return W(b, w, n); } catch (e) { return null; } };
  const F2 = [
    [t.judging + 0.3, 'spark', () => [D.post[0], D.postH + 1.0, D.post[1] + 0.3], 10], [t.wheels, 'drops', () => [-0.6, 0.15, TZ + 0.5], 14], [w2('tracks', 'sits'), 'drops', () => [0.66, 0.05, TZ + 0.45], 10],
    [t.spots + 0.1, 'spark', () => [0, 0.3, TZ + 0.6], 12], [t.soT, 'spark', () => [0.9, 0.9, TZ + 0.3], 10], [t.trackT + 0.35, 'dirt', () => vp(t.trackT + 0.35, 1.8, 0.1, 1.0), 10],
    [t.wide, 'dust', () => [1.5, 0.12, TZ + 1.2], 6], [t.eyeballs + 0.45, 'spark', () => [XS + 1.0, 2.1, TZ], 14], [t.thenG, 'confetti', () => [7.5, 0.7, -3.4], 12],
    [t.honks, 'confetti', () => [9.5, 0.9, TZ], 10], [t.neighbors, 'glow', () => S.cannonMuzzle.toArray(), 1], [t.armor + 0.3, 'spark', () => vp(t.armor + 0.3, 2.2, 1.0, 1.4), 10],
    [t.turret - 0.4, 'spark', () => vp(t.turret - 0.4, -0.7, 1.5, 0.9), 14], [t.turret + 0.2, 'spark', () => vp(t.turret + 0.2, -0.7, 1.5, -0.9), 14], [t.barn + 0.5, 'crumb', () => [16.5, 2.9, -3], 16],
    [t.slides, 'spark', () => vp(t.slides, -0.4, 1.95, 0.7), 10], [t.backR, 'spark', () => vp(t.backR, -0.4, 1.75, 0.95), 8], [t.tankR, 'dust', () => [RCX + 2.0, 0.12, TZ + 1.2], 6],
    [t.aim, 'spark', () => [33, 0.6, -7], 10], [w2('stab', 'spinning'), 'spark', () => vp(w2('stab', 'spinning'), -1.2, 1.8, 0.4), 10], [t.still + 0.2, 'spark', () => vp(t.still + 0.2, -1.3, 1.8, 0.4), 10],
    [t.stabilizer + 0.4, 'spark', () => vp(t.stabilizer + 0.4, 1.6, 2.1, 0), 10], [t.glass + 0.45, 'spark', () => wpos(Vh.glassSpot, new THREE.Vector3()).toArray(), 8], [t.fine, 'spark', () => wpos(Vh.glassSpot, new THREE.Vector3()).toArray(), 10],
    [t.gas + 0.25, 'spark', () => vp(t.gas + 0.25, -1.85, 1.0, 0.5), 10], [t.never + 0.1, 'spark', () => [XB1 - 3.0, 1.3, TZ + 1.15], 10], [t.stood, 'spark', () => [XB1 - 2.7, 1.05, TZ - 0.3], 12],
    [w2('mlc', 'load'), 'spark', () => [D.mlc[0], 1.72, D.mlc[1] - 0.3], 12], [w2('mlc', 'this', 2), 'drops', () => [BRX + 1.0, C.level + 0.25, TZ + 0.3], 10], [t.blind + 0.6, 'dust', () => [XE + 2.5, 0.3, TZ], 8],
    [W('peri', 'add'), 'spark', () => [XE + 1.2, 1.6, TZ], 10], [t.periscopes + 0.3, 'spark', () => [XE + 1.2, 1.75, TZ + 0.5], 10], [t.finds + 0.1, 'spark', () => [XE + 1.2, 1.75, TZ], 10],
    [t.tankE, 'confetti', () => [XE, 3.0, TZ], 60], [W('end', 'just'), 'spark', () => [XE + 1.0, 2.1, TZ], 10], [t.dollars, 'bill', () => [XE - 0.5, 3.4, TZ - 1.4], 30],
    [t.bridgeE, 'drops', () => [BRX, C.level + 0.3, TZ + 0.5], 14], [END - 0.8, 'drops', () => [C.xr + 1.3, 0.3, TZ + 0.35], 20],
    // r2 (density holes on the re-timed voice)
    [t.ask + 0.25, 'drops', () => [-0.9, 0.12, -3.4], 18], [t.watermelon + 0.45, 'spark', () => [MEL.x + 0.25, MEL.y + 0.15, MEL.z + 0.15], 10], [t.inches + 0.15, 'spark', () => vp(t.inches + 0.15, -0.5, 1.75, 0.95), 8],
    [t.bump - 0.05, 'dirt', () => vp(t.bump, 1.6, 0.1, 1.2), 12], [t.behind + 0.1, 'spark', () => [XB1 - 2.6, 1.05, TZ + 0.3], 10], [t.climb + 0.35, 'drops', () => vp(t.climb + 0.35, 1.5, 0.6, 1.2), 18],
    [t.end + 0.15, 'confetti', () => [XE, 3.0, TZ], 50], [W('end', 'built') - 0.05, 'spark', () => [XE + 0.5, 2.2, TZ + 0.8], 24], [W('end', 'built') + 0.25, 'confetti', () => [XE - 1.0, 2.6, 1.2], 40], [t.creekE, 'drops', () => [BRX + 1.0, C.level + 0.3, TZ + 0.5], 14],
  ];
  F2.forEach(([tt, kind, at, n], i) => { if (tt == null) return; const o = { pos: at(), n, speed: [0.6, 1.6], spread: 1.2, seed: 300 + i }; if (kind === 'glow') Object.assign(o, { speed: [0, 0.01], size: [0.35, 0.55] }); if (kind === 'drops' || kind === 'dirt') Object.assign(o, { dir: [0, 1, 0.3], floor: kind === 'drops' && tt > LAND ? C.level : 0, color: tt < LAND || tt > CL1 + 3 ? MUD : undefined, size: [0.03, 0.06] }); if (kind === 'dust') Object.assign(o, { alpha: 0.4, grow: 1.5, size: [0.25, 0.4] }); if (kind === 'bill') Object.assign(o, { dir: [0, 1, 0], life: [1.8, 2.4] }); fx.burst(kind, tt, o); });
  kick(END - 0.8, 0.3);
  // kicks on every remaining impact
  kick(t.wins - 0.1, 0.9); kick(t.stuck, 0.3); kick(t.floors, 0.4); kick(t.congrats, 0.4); kick(t.judging, 0.3); kick(t.sink, 0.3); kick(TR1, 0.5); kick(OUT1, 0.3); kick(t.straight, 0.3); kick(SP0, 0.4); kick(SP1, 0.5); kick(t.honk, 0.2); kick(t.louder, 0.7); kick(JUMP1, 0.4); kick(CH0, 0.3); kick(t.garyG2, 0.5); kick(BACK1, 0.5);
  PK.forEach(([f, what], i) => kick(f + PKF(i), what === 'gary' ? 0.9 : what === 'flat' ? (i === 2 ? 0.5 : 1.0) : 0.6)); PK.forEach(([f]) => kick(f, 0.15));
  kick(TILT1, 0.5); kick(t.sixty, 0.2); kick(t.twice, 0.2); kick(HG + 0.15, 0.3); kick(t.whole, 0.4); kick(SHOT, 1.3); kick(HITM, 0.8); kick(t.watermelon, 0.15);
  kick(SHOT2, 0.2);   /* r2: "the tank stays put" — barely a tremor */ kick(t.put, 0.2); kick(t.chicken, 0.3); kick(t.scarecrow, 0.4); kick(POOF, 0.5); kick(GYRO + 0.2, 0.3); kick(GLASS1, 0.2); kick(BOUNCE1, 0.9); kick(t.lawnmower, 0.3); kick(t.faster, 0.2);
  kick(BR0, 0.5); kick(t.three, 0.4); kick(t.yours, 0.2); kick(t.eighty, 0.3); kick(t.submarine, 0.3); kick(HATCH1, 0.4); kick(t.immediately, 0.4); kick(t.honksF, 0.4); kick(t.gooseF, 0.4);
  kick(t.end, 0.25); kick(AB1, 0.4); kick(t.nineteen, 0.4); kick(t.eyebrowsE, 0.3); kick(GOOSEIN + 0.3, 0.4); kick(DRIVE, 0.35); kick(t.mudEnd, 0.4);
  for (let x = D.bumps.x0 + 1; x < D.bumps.x1; x += D.bumps.p) { const tb = tAtDrive(x); if (tb) kick(tb, 0.35, 0.3); }
  function tAtDrive(x) { if (x < XB0 || x > XB1 - 1.3) return null; for (let tt = DRV0; tt < t.heavy; tt += 0.02) if (vehX(tt) >= x) return tt; return null; }
  const TERMS = story.callouts.filter((c) => c.style === 'term');
  const inTerm = (tk) => TERMS.find((c) => tk > c.t0 - 0.1 && tk < c.t1);
  for (const k of KM) { const c = inTerm(k[0]); if (c && k[1] >= 0.5 && c.t1 - k[0] < 0.3) k[0] = c.t1 + 0.02; }   // a real impact in a TERM's last 0.3 s waits for it to end
  const KM2 = KM.filter(([tk, s0]) => s0 >= 0.2 && !inTerm(tk)).map(([tk, s0, d]) => [tk, s0 >= 0.8 ? s0 : Math.min(s0, 0.35), d]);   // r2 (manager): NO shake at all during a TERM line
  const KM_TERM = KM.filter(([tk, s0]) => s0 >= 0.5 && inTerm(tk)).map(([tk, s0]) => `${tk.toFixed(2)} ${s0} in ${inTerm(tk).text}`);   // real impacts that a TERM swallowed: move them (QC log)
  const kickR = makeKick(KM2);

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words (turbo glide rule)
  const Fr = [], F = (tt, pos, look, fov = 44, o = {}) => Fr.push({ t: tt, pos, look, fov, ...o });
  const Fk = (tt, pos, look, fov = 44, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  F(0, [0.9, 1.55, 5.2], [0.05, 0.55, -1.9], 44); F(1.2, [0.7, 1.35, 4.2], [0.05, 0.55, -1.9], 42);                                       // the kart stuck in the mud, Gary flooring it
  Fk(t.wins - 0.25, [0.5, 1.2, 3.3], [0.1, 0.55, -1.9], 40, t.wins + 0.35);              // SPLAT: Gary's face
  Fk(t.sprinkler - 0.1, [1.6, 1.8, 6.4], [1.4, 0.75, -2.6], 46, t.sprinkler + 0.3); Fk(t.gooseC + 0.2, [2.5, 1.75, 2.4], [3.4, 1.1, -4.75], 34, t.judging + 0.3); Fk(t.sink, [0.6, 1.35, 4.3], [0.2, 0.35, -1.9], 44, t.sink + 0.5);
  Fk(t.four - 0.15, [0.2, 1.55, 5.0], [0.0, 0.25, -1.9], 46, t.spots + 0.2);           // four tiny spots (the arrows)
  Fk(t.wrap - 0.1, [-0.6, 1.6, 4.4], [0.0, 0.55, -1.9], 44, t.platesT + 0.3);          // the tracks wrap on, CLANK CLANK
  Fk(t.continuous - 0.1, [0.6, 1.25, 3.8], [0.8, 0.85, -1.4], 42);                       // CONTINUOUS TRACK: the links rolling, low
  Fk(t.spreads, [1.0, 1.9, 6.6], [1.2, 0.55, -2.4], 46, t.wide + 0.2);                 // it rises out of the mud (green arrows)
  Fk(t.softer - 0.2, [0.3, 1.9, 6.2], [0.2, 0.55, -3.2], 48, W('tracks', 'horse', 2) + 0.25);
  F(t.straight + 0.1, [4.9, 1.9, 6.0], [5.2, 1.0, -1.9], 44);
  Fk(t.swings - 0.2, [5.2, 2.6, 7.6], [5.4, 0.7, -2.2], 46, t.around + 0.2);           // the swing turn
  Fk(t.skid - 0.1, [5.8, 1.4, 4.8], [5.9, 0.95, -1.8], 44);
  Fk(t.spin - 0.25, [5.6, 3.4, 8.0], [5.6, 0.7, -2.0], 48, SP1 - 0.1);                 // the spin in place from above
  Fk(t.eyeballs - 0.15, [6.6, 1.55, 3.3], [6.7, 1.1, -1.9], 40, t.eyeballs + 0.35);    // Gary's spiral eyes
  F(t.blocks - 0.1, [8.0, 1.9, 8.4], [8.1, 0.8, -2.0], 50);                            // the goose on the road
  Fk(t.honk - 0.15, [7.9, 1.7, 7.6], [7.9, 0.6, -1.9], 50, t.gets + 0.3);
  Fk(t.shoo + 0.1, [8.9, 1.4, 4.6], [8.9, 0.8, -1.3], 44, t.goose2);               // Gary shoos
  F(t.shoos - 0.05, [8.8, 1.8, 6.6], [8.6, 0.9, -0.6], 52); F(t.garyG2 - 0.05, [7.3, 1.8, 6.7], [7.0, 0.95, -0.6], 50, { pass: true }); F(t.garyG2 + 0.35, [6.0, 1.8, 6.8], [5.6, 0.95, -0.6], 48, { pass: true });                // the chase (follow left)
  Fk(W('armor', 'pumpkin') - 0.1, [4.0, 2.2, 8.8], [8.4, 0.75, -4.0], 48, t.cannon + 0.2);           // the pumpkin cannon on its hill + Gary leaping back aboard
  F(PK[0][0] + PKF(0) - 0.08, [6.8, 2.0, 7.0], [6.2, 0.95, -2.0], 46);           // plates bolt on
  Fk(t.flat + 0.1, [12.2, 2.3, 3.4], [7.5, 1.25, -1.9], 46, t.tilt);   // r2: face the plate (it was edge-on)             // the flat front plate takes the hits (3/4 front)
                  // tilt
  Fk(t.sloped - 0.1, [9.6, 1.6, 3.8], [7.6, 1.0, -1.2], 48, t.degrees + 0.2);          // SLOPED ARMOR + the 60° marker, side-on
  Fk(t.twice - 0.25, [8.7, 1.1, 2.7], [8.0, 0.95, -1.2], 38, t.steel2 + 0.2);           // the 2× bar through the plate
  Fk(t.pumpkins - 0.2, [10.6, 2.6, 6.4], [7.6, 1.5, -2.2], 46, t.bounce + 0.4);         // BOING: they bounce off
  Fk(HG + 0.05, [7.0, 2.0, 5.2], [6.6, 1.2, -1.9], 44, t.cannonT + 0.3);                 // the hull gun bolts on
  Fk(t.whole - 0.1, [4.6, 4.2, 9.8], [4.8, 1.0, -2.4], 50, t.tankT + 0.2);              // the whole tank pivots (WRONG WAY)
  Fk(TUR0 + 0.2, [5.4, 3.2, 8.4], [6.1, 1.4, -1.9], 48, t.turret + 0.4);
  F(t.watermelon + 0.2, [1.4, 2.4, 5.6], [-3.0, 1.3, -4.3], 34, { pass: true });
  Fk(t.fireT + 0.05, [3.6, 3.0, 9.6], [-0.8, 1.3, -3.4], 48, HITM + 0.15);
  F(t.flies, [9.6, 2.6, 7.4], [9.2, 1.2, -2.0], 48, { pass: true }); Fk(t.backward + 0.5, [14.0, 3.4, 10.6], [17.0, 1.5, -3.2], 54, t.barn + 0.2);                // through the barn (cut front)
  Fk(t.slides - 0.1, [22.9, 2.9, 5.6], [22.3, 1.1, -2.0], 44, t.shock + 0.3);          // the barrel + the shock absorbers (turret cut)
  Fk(t.recoilW - 0.15, [23.0, 2.75, 4.6], [22.75, 1.6, -1.9], 40, t.mechanism + 0.3);
  Fk(t.gun - 0.2, [24.6, 2.6, 6.4], [24.0, 1.05, -3.6], 48, t.inches + 0.3);             // BOOM: the barrel slides back 12 in, the bale explodes
  Fk(t.put - 0.2, [23.2, 2.4, 6.0], [22.8, 1.25, -1.9], 46, t.put + 0.2);              // the tank stayed put
  Fk(t.chicken - 0.1, [23.6, 2.5, 3.8], [23.5, 1.42, -1.9], 40, t.head);           // BAWK: the chicken on Gary's head
  F(t.bump + 0.1, [24.6, 2.2, 8.0], [24.4, 1.3, -2.0], 50, { pass: true });                              // the bumps; the gun bobbing
  Fk(t.hit - 0.3, [28.4, 1.6, 8.0], [30.0, 5.2, -8.0], 54); Fk(t.cloud - 0.1, [28.6, 1.6, 7.4], [30.0, 5.4, -8.0], 52, POOF + 0.15);
  
  Fk(t.gyros + 0.15, [26.8, 2.4, 5.4], [26.6, 1.6, -1.9], 42, t.still + 0.3);
  Fk(t.stabilizer - 0.15, [29.0, 2.7, 6.4], [29.0, 1.5, -2.2], 46);                      // STABILIZER
  Fk(t.glass - 0.3, [33.2, 2.9, 2.8], [32.8, 1.35, -2.6], 40, t.gunS + 0.2);            // the glass goes on the gun
  Fk(t.lemonade - 0.2, [35.3, 2.9, 4.6], [35.3, 1.15, -1.95], 46, t.fine + 0.15);
  Fk(t.isnt - 0.05, [33.4, 2.9, 5.6], [33.0, 1.6, -1.9], 46, t.isnt + 0.45);
  Fk(t.heavy, [34.6, 2.5, 6.2], [34.4, 1.3, -1.9], 46, t.lawnmower + 0.2);               // the mower coughs (bay window)
  Fk(t.gooseT - 0.05, [36.2, 2.2, 5.2], [36.0, 1.9, -1.2], 48, t.faster + 0.3);          // the goose outwalks it
  Fk(t.drop - 0.1, [35.0, 2.6, 5.6], [34.9, 1.4, -1.9], 46, t.jet + 0.35);               // the mower out, the turbine in
  Fk(t.gas - 0.15, [35.15, 2.0, 4.8], [35.2, 0.75, -1.6], 44, t.turbineW + 0.25);        // GAS TURBINE spinning (bay window)
  Fk(t.fifteen - 0.1, [36.0, 2.2, 6.0], [35.4, 0.6, -1.9], 46, t.horsepower + 0.2);     // 1,500 HP lurch
  Fk(t.never - 0.1, [33.6, 1.8, 5.0], [33.9, 0.4, -1.9], 44, t.stood + 0.2);            // Gary behind it
  Fk(t.byeE - 0.25, [32.9, 1.6, 3.9], [33.4, 0.8, -1.9], 42, t.byeE + 0.5);             // FWOOSH: eyebrows gone
  F(t.seventyB, [36.4, 2.7, 7.6], [41.0, 0.9, -1.8], 48, { pass: true });
  Fk(t.little - 0.1, [35.0, 2.8, 5.0], [43.8, 0.2, -1.8], 50); Fk(SNAP - 0.1, [35.3, 2.65, 4.6], [43.8, 0.1, -1.8], 49, LAND + 0.5); Fk(t.circle - 0.1, [35.8, 2.4, 3.8], [43.6, -0.35, -1.8], 47); F(t.military + 0.25, [36.1, 2.3, 3.45], [43.5, 0.0, -1.75], 46, { pass: true }); Fk(t.threeM - 0.15, [36.4, 2.15, 3.0], [43.4, 0.35, -1.7], 45, t.eighty - 0.15);
  Fk(t.submarine - 0.25, [44.6, 0.6, 2.4], [46.9, -0.65, -1.95], 38, t.submarine + 0.45);
  
  Fk(t.blind - 0.2, [56.2, 2.3, 7.0], [56.4, 0.7, -2.0], 46, t.blind + 0.35);            // CRUNCH: blind into the fence
  Fk(t.mirror - 0.1, [57.4, 2.6, 4.4], [56.6, 1.45, -1.9], 42, t.roof + 0.2);             // the periscopes pop up
  Fk(t.periscopes - 0.15, [57.6, 2.3, 3.4], [56.6, 0.95, -1.9], 40);                     // PERISCOPES
  Fk(t.finds - 0.15, [56.25, 1.9, 3.0], [56.35, 1.52, -1.9], 30, t.immediately + 0.42);     // r2: Gary's eye at the eyepiece (through the cut), the goose peering into the mirror beyond
  Fk(t.radio + 0.05, [54.8, 2.7, 5.8], [54.8, 1.7, -2.0], 54, t.horn - 0.3);   // r2: nearer, later — the periscope gag keeps its jerk-back            // the radio antenna
    Fk(t.horn - 0.15, [58.8, 2.1, 4.8], [57.6, 1.35, -1.6], 44, t.gooseF + 0.4);            // the horn + the honk duel
  Fk(t.end - 0.05, [55.4, 2.7, 9.0], [55.2, 1.3, -2.2], 50, W('end', 'congratulations') + 0.45); Fk(W('end', 'built') - 0.1, [56.3, 2.2, 6.0], [56.3, 1.15, -2.0], 44, t.tankE + 0.3);   // r3: ta-da wide, then in on Gary + the goose              // ta-da
  Fk(t.wanted - 0.1, [53.2, 2.1, 6.2], [52.7, 0.8, -2.0], 46, t.mudE + 0.2);             // he just wanted out of the mud (the mud by the creek)
  Fk(t.nineteen - 0.1, [55.2, 3.1, 7.8], [55.0, 1.8, -2.2], 48, t.dollars + 0.2);         // $19,000,000
  Fk(t.bridgeE - 0.1, [49.0, 1.7, 6.6], [47.6, -0.2, -2.2], 48, t.creekE + 0.25);        // the bridge in the creek
  Fk(t.garyE - 0.1, [54.2, 2.5, 4.4], [53.6, 1.75, -2.0], 40, t.eyebrowsE + 0.3);        // Gary, no eyebrows (on the rear deck)
  Fk(t.gooseE - 0.15, [56.5, 2.3, 5.2], [56.2, 1.7, -1.9], 42, t.driving + 0.2);   // r2: re-centred on the goose's head         // the GOOSE drives; Gary topples off
  Fk(t.back - 0.1, [52.3, 1.4, 4.6], [52.1, 0.5, -1.9], 46);                             // Gary back in the mud, the tank leaving
  Fr.push({ t: END, pos: [52.2, 1.3, 4.2], look: [52.0, 0.5, -1.9], fov: 45, stop: true });   // Gary in the mud, the goose driving off behind
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr, { shortHoldPass: true, minHold: 0.9, move: [0.35, 13], lead: 0.12, maxLead: 0.25 }));   // turbo: holds creep toward the next frame (never a dead stop)
  // r2: any hold still ≥ 0.9 s gets a slow push-in (fov −7 %), eased back out over the next move — the camera never sits still
  const HOLDS = []; { let a = null; const dt = 1 / 30; let prev = rail.at(0);
    for (let tt = dt; tt <= END + dt; tt += dt) { const c = rail.at(Math.min(tt, END)); const m = Math.hypot(...c.pos.map((v, i) => v - prev.pos[i])) + Math.hypot(...c.look.map((v, i) => v - prev.look[i])) + Math.abs(c.fov - prev.fov) * 0.02; prev = c;
      if (m < 0.004) { if (a == null) a = tt - dt; } else { if (a != null && tt - a >= 0.9) HOLDS.push([a, tt]); a = null; } } }
  const pushAt = (tt) => { for (const [a, b] of HOLDS) { if (tt >= a && tt <= b) return 0.07 * smooth((tt - a) / (b - a)); if (tt > b && tt < b + 0.6) return 0.07 * (1 - smooth((tt - b) / 0.6)); } return 0; };

  // ---------------------------------------------------------------- helpers
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const path = (tt, a, b, pts) => { const u = smooth(u01(tt, a, b)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), f = u - i; return pts[i].map((v, k) => lerp(v, pts[i + 1][k], f)); };
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  const blinkE = (tt, open = 'open') => ((tt * 0.73) % 3.1 < 0.11 ? 'closed' : open);

  // ---------------------------------------------------------------- Gary
  const SIT = { legL: { x: -1.45, kn: 1.35 }, legR: { x: -1.45, kn: 1.35 } };
  const gooAt = (tt) => (tt < t.wins - 0.1 ? 0 : tt < LAND + 0.2 ? 1 : 0);   // mud, then the pumpkin goo over it, until the creek washes it off
  const gooCol = (tt) => (tt < PK[0][0] + PKF(0) ? MUD : GOO);
  const sootAt = (tt) => (tt < BLAST ? 0 : tt < LAND + 0.2 ? 1 : 0);   // r2: the creek washes it off (the eyebrows stay gone)
  function garyAt(tt) {
    const g = gary; dizzy.update(tt, 0, [0, 0, 0]);
    wrench.visible = (tt > t.soT && tt < TR1 + 0.2) || (tt > PL[0] - 0.3 && tt < PL[3] + 0.4) || (tt > HG - 0.2 && tt < HG + 0.7);
    bulb.visible = tt > t.road && tt < t.louder + 0.3;
    const base = { t: tt, mud: Math.max(gooAt(tt), tt > FALL1 ? 1 : 0), mudColor: tt > FALL1 ? MUD : gooCol(tt), soot: sootAt(tt), noBrows: tt > BLAST, hairUp: tt > BLAST && tt < BLAST + 3 ? 1 : 0, eyes: blinkE(tt), noHat: tt > GOOSEIN + 0.05 };
    const seat = () => wpos(Vh.seatAnchor, v3);
    const inSeat = (o = {}) => { const p = seat(); return g.set({ ...base, ...SIT, x: p.x, y: p.y - 0.36, z: p.z, rotY: Vh.g.rotation.y + PI / 2 - 0.55, head: { x: 0, y: -0.75, z: 0 }, armL: { x: -1.2, z: 0.15, el: 0.7 }, armR: { x: -1.2, z: 0.15, el: 0.7 }, ...o }); };
    // HOOK → TRACKS: floors it in the kart; mud; hammering the tracks on
    if (tt < t.soT) { const floor = tt > t.floors - 0.1, splat = tt > t.wins - 0.12; return inSeat({ eyes: splat ? (tt < t.wins + 0.5 ? 'closed' : blinkE(tt, 'half')) : floor ? 'wide' : 'open', mouth: splat ? 'wavy' : floor ? 'teeth' : 'flat', brows: floor && !splat ? -0.8 : 0.3, lean: floor && !splat ? 0.45 : 0.1, armL: { x: -1.3, z: 0.1, el: 0.5 + 0.1 * Math.sin(tt * 30) }, armR: { x: -1.3, z: 0.1, el: 0.5 + 0.1 * Math.sin(tt * 30 + 1) }, squash: squash(tt, t.wins - 0.12, 0.2), look: tt > t.gooseC - 0.2 && tt < t.four ? [0.8, 0.2] : [0, 0], head: { x: 0, y: tt > t.gooseC - 0.2 && tt < t.four ? -0.2 : -0.75, z: 0 } }); }
    if (tt < TR1 + 0.1) { const hit = Math.max(0, Math.sin((tt - t.soT) * 13)); return inSeat({ rotY: Vh.g.rotation.y + PI / 2 - 0.9, eyes: 'wide', mouth: 'teeth', brows: -0.6, lean: 0.55, armR: { x: -2.0 + 1.1 * hit, z: 0.3, el: 0.4 }, armL: { x: -0.6, z: 0.5, el: 0.4 }, head: { x: 0.3, y: -0.4, z: 0 }, look: [0.3, -0.7] }); }
    // TRACKS → STEER: rides it out; proud; yanks the wheel; spins; dizzy
    if (tt < t.slow) { const yank = tt > t.nowS && tt < t.slow ? Math.sin(tt * 14) : 0; return inSeat({ eyes: blinkE(tt), mouth: tt > t.nowS ? 'teeth' : 'grin', brows: tt > t.nowS ? -0.5 : 0, armL: { x: -1.3, z: 0.1 + 0.3 * yank, el: 0.6 }, armR: { x: -1.3, z: 0.1 - 0.3 * yank, el: 0.6 }, look: tt > t.horse - 0.4 && tt < t.nowS ? [0.9, 0.2] : [0, 0] }); }
    if (tt < JUMP0) { const sp = tt > SP0 && tt < t.blocks; const dz = tt > t.place - 0.2 && tt < t.blocks + 0.3; if (dz) dizzy.update(tt, 1, toWorld(1.22, 2.25, 0).toArray()); else dizzy.update(tt, 0, [0, 0, 0]);
      return inSeat({ eyes: dz ? 'spiral' : sp ? 'wide' : 'open', mouth: dz ? 'wavy' : sp ? 'scream' : tt > t.blocks ? 'flat' : 'grin', brows: sp ? 1 : 0, hairUp: sp ? 0.8 : 0, lean: sp ? -0.2 : 0.05, armL: tt > t.road && tt < t.louder + 0.3 ? { x: -1.6, z: -0.1, el: 0.5 } : sp ? { x: -2.6, z: 0.7 } : undefined, armR: sp ? { x: -2.6, z: 0.7 } : undefined, rz: dz ? 0.1 * Math.sin(tt * 6) : 0, squash: tt > t.louder - 0.05 && tt < t.louder + 0.6 ? [1.05, 0.92] : [1, 1], look: tt > t.blocks ? [0.8, -0.1] : [0, 0] }); }
    dizzy.update(tt, 0, [0, 0, 0]);
    // GOOSE: hops down, shoos, gets chased left, leaps back aboard
    const GD = [8.55, 0, -0.45];
    if (tt < JUMP1) { const p = seat(); const [x, y, z] = hop(tt, JUMP0, JUMP1, [p.x, p.y - 0.36, p.z], GD, 0.5); return g.set({ ...base, x, y, z, rotY: 0.6, eyes: 'open', mouth: 'flat', brows: -0.6, legL: { x: -0.6, kn: 0.8 }, legR: { x: -0.6, kn: 0.8 } }); }
    if (tt < CH0) { const w = Math.sin((tt - JUMP1) * 16); return g.set({ ...base, x: GD[0], z: GD[2], rotY: 1.0, eyes: 'open', mouth: 'teeth', brows: -0.8, armR: { x: -2.4 + 0.6 * w, z: 0.6, el: 0.4 }, armL: { x: -2.4 - 0.6 * w, z: 0.6, el: 0.4 }, squash: squash(tt, JUMP1, 0.2), look: [0.6, -0.4] }); }
    if (tt < CH1) { const x = lerp(GD[0], 4.0, smooth(u01(tt, CH0, CH1))); return g.set({ ...base, x, z: -0.5, rotY: -PI / 2 + 0.55, walk: tt * 24, walkAmt: 1.4, lean: 0.35, eyes: 'wide', mouth: 'scream', brows: 1, hairUp: 0.6, armR: { x: -2.6, z: 0.4 }, armL: { x: -2.6, z: 0.4 }, look: [0.8, 0] }); }
    if (tt < BACK1) { const p = seat(); const [x, y, z] = hop(tt, CH1, BACK1, [4.0, 0, -0.5], [p.x, p.y - 0.36, p.z], 1.4); return g.set({ ...base, x, y, z, rotY: PI / 2 - 0.4, eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.8, z: 0.4 }, armL: { x: -2.8, z: 0.4 }, legL: { x: -1.2, kn: 1.2 }, legR: { x: -0.6, kn: 0.6 }, rz: -0.3 }); }
    // ARMOR: goo splat, bolts plates, takes hits, pushes the plate back, smug
    if (tt < t.addC) { const splat = tt > PK[0][0] + PKF(0) - 0.02 && tt < PL[0] + 0.05; const hitF = [PK[1], PK[2]].some(([f]) => tt > f + PK_T - 0.02 && tt < f + PK_T + 0.5); const push = tt > TILT0 - 0.15 && tt < TILT1 + 0.1; const hammer = tt > PL[0] - 0.2 && tt < PL[3] + 0.4; const hit = Math.max(0, Math.sin((tt - PL[0]) * 12)); const smug = tt > t.pumpkins - 0.1;
      return inSeat({ eyes: splat ? 'closed' : hitF ? 'spiral' : smug ? 'half' : 'wide', mouth: splat ? 'wavy' : hitF ? 'o' : smug ? 'grin' : hammer ? 'teeth' : 'flat', brows: hitF ? 1 : smug ? -0.3 : -0.4, lean: push ? 0.6 : hitF ? -0.3 : 0.05, armR: push ? { x: -1.6, z: -0.1, el: 0.05 } : hammer ? { x: -2.0 + 0.9 * hit, z: 0.5, el: 0.4 } : smug ? { x: -1.25, z: -0.6, el: 1.75 } : undefined, armL: push ? { x: -1.6, z: -0.1, el: 0.05 } : smug ? { x: -1.15, z: -0.6, el: 1.75 } : undefined, squash: hitF ? [1.15, 0.85] : squash(tt, PK[0][0] + PKF(0), 0.25), head: { x: 0, y: -0.75 + (smug ? 0.25 : 0), z: 0 } }); }
    // TURRET: hammers the hull gun, holds on as it pivots, aims (squints), the lanyard, the ride through the barn
    if (tt < RC0) { const hammer = tt > HG - 0.2 && tt < HG + 0.7, hit = Math.max(0, Math.sin((tt - HG) * 12)); const piv = tt > PIV0 && tt < RET1; const aim = tt > t.target - 0.2;
      return inSeat({ eyes: aim ? 'half' : piv ? 'wide' : 'open', mouth: aim ? 'flat' : piv ? 'o' : 'teeth', brows: aim ? -0.9 : piv ? 0.8 : -0.4, armR: hammer ? { x: -2.0 + 0.9 * hit, z: 0.5, el: 0.4 } : aim && tt > t.fireT - 0.3 ? { x: -2.4, z: 0.3, el: 0.6 } : undefined, rz: piv ? 0.12 * Math.sin(tt * 9) : 0, head: { x: 0, y: aim ? -1.0 : -0.75, z: 0 }, look: aim ? [-0.9, 0] : [0, 0] }); }
    if (tt < RC1 + 0.3) { const ride = smooth(u01(tt, RC0, RC0 + 0.15)); return inSeat({ eyes: 'wide', mouth: 'scream', brows: 1, hairUp: 1, lean: -0.5 * ride, armR: { x: -2.8, z: 0.6 }, armL: { x: -2.8, z: 0.6 }, head: { x: -0.3 * ride, y: -0.75, z: 0 } }); }
    // RECOIL: hay in his hair, a chicken on his head; thumbs up on "put"
    if (tt < t.but) { const ok = tt > t.put - 0.2 && tt < t.chicken; return inSeat({ eyes: tt < t.slides ? 'spiral' : blinkE(tt), mouth: ok ? 'grin' : tt < t.slides ? 'wavy' : 'flat', brows: ok ? 0 : -0.2, armR: ok ? { x: -2.2, z: 0.4, el: 1.4 } : undefined, look: tt > t.chicken - 0.1 ? [0, 1] : [0, 0], head: { x: tt > t.chicken - 0.1 ? -0.25 : 0, y: -0.75, z: 0 } }); }
    // STAB: bounced about, sets the glass on the gun, bounced out onto the rear deck
    if (tt < BOUNCE0) { const reach = tt > GLASS0 && tt < GLASS1 + 0.2, bob = -0.12 * Math.sin(tt * 5); return inSeat({ eyes: tt < STAB ? 'wide' : 'open', mouth: tt < STAB ? 'o' : 'grin', brows: tt < STAB ? 0.6 : 0, armR: reach ? { x: -2.5, z: -0.2, el: 0.2 } : undefined, rz: tt < STAB ? 0.15 * Math.sin(tt * 7) : 0, y: (seat().y - 0.36) + (tt < STAB ? 0.04 * Math.abs(Math.sin(tt * 6)) : 0), lean: bob, head: { x: 0, y: reach ? -0.2 : -0.75, z: 0 } }); }
    const DECK = () => toWorld(-1.85, 1.48, 1.0);   // the near sponson behind the turret
    if (tt < BOUNCE1) { const p = seat(), d = DECK(); const [x, y, z] = hop(tt, BOUNCE0, BOUNCE1, [p.x, p.y - 0.36, p.z], [d.x, d.y, d.z], 1.2); return g.set({ ...base, x, y, z, rotY: 0.3, rx: -PI * 1.5 * u01(tt, BOUNCE0, BOUNCE1), eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.8, z: 0.6 }, armL: { x: -2.8, z: 0.6 } }); }
    // TURBINE: flat on the deck, gets up, yanks the mower, watches the turbine, hops down behind it — FWOOSH
    const GT0 = [XB1 - 0.95, 0, TZ + 1.7], DOWN0 = MOW + 0.2, DOWN1 = MOW + 0.62;   // r2: an own 0.42 s hop (it used to need TB − MOW > 0.4 → skipped)
    if (tt > DOWN0 && tt < OFF0) { const d = DECK(); if (tt < DOWN1) { const [x, y, z] = hop(tt, DOWN0, DOWN1, [d.x, d.y, d.z], GT0, 0.5); return g.set({ ...base, x, y, z, rotY: 0.3, eyes: 'wide', mouth: 'o', legL: { x: -0.6, kn: 0.8 }, legR: { x: -0.6, kn: 0.8 } }); }
      const spin = tt > SPIN; return g.set({ ...base, x: GT0[0], z: GT0[2], rotY: 0.35, eyes: spin ? 'wide' : 'open', mouth: tt > HP ? 'grin' : spin ? 'o' : 'smile', brows: spin ? 0.6 : 0, look: [-0.7, 0.3], head: { x: 0, y: -0.55, z: 0 }, squash: squash(tt, DOWN1, 0.2), hairUp: tt > HP && tt < HP + 0.6 ? 0.8 : 0 }); }   // beside the engine bay, watching it spin up
    if (tt < OFF0) { const d = DECK(), flat = tt < t.heavy + 0.4, yank = tt > MOW - 0.3 && tt < MOW + 0.3, cr = tt > TB + 0.3 && tt < OFF0 - 0.2 ? smooth(u01(tt, TB + 0.3, TB + 0.6)) : 0; return g.set({ ...base, x: d.x, y: d.y - (flat ? 0.25 : 0) - 0.24 * cr, z: d.z, rotY: 0.35, lean: 0.35 * cr, legL: cr ? { x: -1.25 * cr, kn: 2.0 * cr } : undefined, legR: cr ? { x: -1.1 * cr, kn: 1.9 * cr } : undefined, rz: flat ? -1.35 : 0, squash: flat ? [1.3, 0.75] : squash(tt, t.heavy + 0.4, 0.25), eyes: flat ? 'spiral' : tt > SPIN ? 'wide' : 'open', mouth: flat ? 'wavy' : tt > HP ? 'grin' : yank ? 'teeth' : 'flat', brows: tt > t.gooseT - 0.2 && tt < t.drop ? -0.8 : 0, armR: yank ? { x: -2.8, z: 0.3, el: 0.3 } : undefined, armL: yank ? { x: -2.8, z: 0.3, el: 0.3 } : undefined, look: tt > t.gooseT - 0.2 && tt < t.drop ? [0.8, -0.6] : [0, 0], head: { x: 0, y: tt > t.gooseT - 0.2 && tt < t.drop ? 0.6 : 0, z: 0 } }); }
    const BEH = [XB1 - 3.55, 0, TZ + 0.25], GT = [XB1 - 0.95, 0, TZ + 1.7];
    if (tt < OFF1) { const [x, , z] = path(tt, OFF0, OFF1, [GT, [XB1 - 2.0, 0, TZ + 1.5], BEH]); return g.set({ ...base, x, y: 0, z, rotY: -PI / 2 + 0.6, walk: tt * 15, eyes: 'open', mouth: 'smile' }); }   // behind the sign
    if (tt < AB0) { const blast = tt > BLAST; const bl = u01(tt, BLAST, BLAST + 0.25), shrug = !blast && tt > t.garyT - 0.05 && tt < t.stood + 0.1, step = smooth(u01(tt, t.stood, t.stood + 0.3)); if (shrug) return g.set({ ...base, x: BEH[0], z: BEH[2], rotY: 0.5, eyes: 'open', mouth: 'flat', brows: 0.7, look: [0.6, 0.1], head: { x: 0, y: 0.2, z: 0.15 }, armR: { x: -0.3, z: 1.1, el: 1.4 }, armL: { x: -0.3, z: 1.1, el: 1.4 } }); return g.set({ ...base, x: BEH[0] - 0.35 * bl + 0.25 * step, z: BEH[2], rotY: blast ? 0.25 : 0.9, eyes: blast ? (tt < BLAST + 0.45 ? 'closed' : 'wide') : 'open', mouth: blast ? 'o' : 'smile', brows: 0, lean: blast ? -0.4 * (1 - u01(tt, BLAST + 0.3, AB0)) : 0.25, look: blast ? [0, 0] : [0.9, 0.2], head: { x: 0, y: blast ? 0 : 0.35, z: 0 }, hatLift: blast ? 0.35 * (1 - u01(tt, BLAST + 0.4, AB0)) : 0, armR: blast ? { x: -0.4, z: 0.8 } : undefined, armL: blast ? { x: -0.4, z: 0.8 } : undefined }); }
    // BRIDGE → MLC: leaps aboard as it pulls away; rides onto the bridge; falls; head at the waterline
    if (tt < AB1) { const p = seat(); const [x, y, z] = hop(tt, AB0, AB1, [BEH[0] - 0.35, 0, BEH[2]], [p.x, p.y - 0.36, p.z], 1.6); return g.set({ ...base, x, y, z, rotY: PI / 2, rx: -PI * 2 * smooth(u01(tt, AB0, AB1)), eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.6, z: 0.3 }, armL: { x: -2.6, z: 0.3 } }); }   // r3: one somersault straight into the hatch (THUNK)
    if (tt < CL0) { const sag = tt > t.little && tt < SNAP, fall = tt > SNAP && tt < LAND + 0.3, sub = tt > LAND + 0.3, hl = sub ? Math.sin(PI * u01(tt, W('mlc', 'load') - 0.1, t.classW + 0.45)) : 0; return inSeat({ hatLift: 0.45 * hl, eyes: fall ? 'wide' : sub ? blinkE(tt, 'half') : sag ? 'wide' : 'open', mouth: fall ? 'scream' : sub ? 'flat' : sag ? 'o' : 'grin', brows: fall || sag ? 1 : sub ? -0.2 : 0, hairUp: fall ? 1 : 0, armR: fall ? { x: -2.8, z: 0.6 } : undefined, armL: fall ? { x: -2.8, z: 0.6 } : undefined, look: sag ? [0, -0.8] : sub && tt > t.garyM ? [0.8, 0] : [0, 0] }); }
    // PERI: shuts the hatch (ducks), pops up for the kit
    if (tt < POPUP) { const duck = smooth(u01(tt, HATCH0 - 0.1, HATCH1 - 0.05)), peek = tt > PERI0 + 0.3, jerk = tt > t.immediately + 0.04;   // r2: the periscope gag
      const lk = smooth(u01(tt, t.finds - 0.25, t.finds + 0.05)) * (1 - smooth(u01(tt, t.immediately + 0.04, t.immediately + 0.18)));
      return inSeat({ y: seat().y - 0.36 - 0.55 * duck - 0.1 * lk, z: seat().z + 0.38 * smooth(u01(tt, t.finds - 0.25, t.finds + 0.05)), eyes: jerk ? 'spiral' : lk > 0.5 ? 'open' : peek ? 'wide' : 'open', mouth: jerk ? 'scream' : lk > 0.5 ? 'smile' : 'flat', brows: jerk ? 1 : 0, lean: jerk ? -0.35 : 0, squash: squash(tt, t.immediately + 0.04, 0.25), head: { x: lk > 0.01 ? -0.55 * lk : peek ? -0.35 : 0, y: -0.75, z: 0 }, look: peek || lk > 0 ? [0.3, 0.9] : [0, 0] }); }
    if (tt < OUTG) { const pop = smooth(u01(tt, POPUP, POPUP + 0.3)), honk = tt > t.honksF - 0.1 && tt < t.honksF + 0.4, cheer = tt > t.end - 0.1; return inSeat({ y: seat().y - 0.36 - 0.55 * (1 - pop), eyes: cheer ? 'open' : blinkE(tt), mouth: cheer ? 'grin' : honk ? 'o' : 'smile', brows: 0, armR: cheer ? { x: -2.8, z: 0.5, el: 0.2 } : honk ? { x: -0.9, z: 1.1, el: 0.6 } : undefined, armL: cheer ? { x: -2.8, z: 0.5, el: 0.2 } : undefined, look: tt > t.wanted - 0.1 && tt < t.nineteen ? [-0.9, -0.3] : [0, 0], head: { x: 0, y: tt > t.wanted - 0.1 && tt < t.nineteen ? -1.1 : -0.75, z: 0 } }); }
    // END: climbs out onto the rear deck; the goose takes the hatch; the lurch throws him off the back into the mud
    const RD = () => toWorld(-1.75, 1.48, 0.15);
    if (tt < OUTG1) { const p = seat(), d = RD(); const [x, y, z] = hop(tt, OUTG, OUTG1, [p.x, p.y - 0.36, p.z], [d.x, d.y, d.z], 0.4); return g.set({ ...base, x, y, z, rotY: 0.2, eyes: 'open', mouth: 'smile' }); }
    if (tt < DRIVE) { const d = RD(); return g.set({ ...base, x: d.x, y: d.y, z: d.z, rotY: 0.15, eyes: tt > GOOSEIN ? 'wide' : 'half', mouth: tt > GOOSEIN ? 'o' : 'grin', brows: tt > GOOSEIN ? 0.9 : -0.2, look: tt > GOOSEIN ? [0.9, 0] : [0, 0], head: { x: 0, y: tt > GOOSEIN ? 1.0 : 0, z: 0 }, armR: tt < GOOSEIN ? { x: -0.4, z: 0.9, el: 1.6 } : undefined, armL: tt < GOOSEIN ? { x: -0.4, z: 0.9, el: 1.6 } : undefined }); }
    const MUDP = [C.xr + 1.05, -0.42, TZ + 0.35];
    if (tt < FALL1) { const d0 = wpos(Vh.g, v4); const [x, y, z] = hop(tt, DRIVE, FALL1, [d0.x - 1.75, 1.48, d0.z + 0.15], MUDP, 0.9); return g.set({ ...base, x, y, z, rotY: 0.2, rz: 1.2 * u01(tt, DRIVE, FALL1), eyes: 'wide', mouth: 'scream', brows: 1, armR: { x: -2.8, z: 0.6 }, armL: { x: -2.8, z: 0.6 }, legL: { x: -0.8 }, legR: { x: 0.4 } }); }
    return g.set({ ...base, x: MUDP[0], y: MUDP[1] - 0.09 * smooth(u01(tt, t.mudEnd, t.mudEnd + 0.3)), z: MUDP[2], rotY: 0.25, squash: squash(tt, FALL1, 0.25), eyes: tt < FALL1 + 0.5 ? 'closed' : 'half', mouth: 'flat', brows: 0.6, armR: { x: -0.4, z: 0.6, el: 0.4 }, armL: { x: -0.4, z: 0.6, el: 0.4 }, look: [0.6, -0.3] });
  }

  // ---------------------------------------------------------------- the goose
  const POSTTOP = [D.post[0], D.postH, D.post[1]], BLOCK = [9.5, 0, TZ + 0.05];
  function gooseAt(tt) {
    const g = goose, b = { t: tt, scale: GS };
    if (tt < t.place) { const look = tt > t.gooseC - 0.3; return g.set({ ...b, x: POSTTOP[0], y: POSTTOP[1], z: POSTTOP[2], rotY: look ? -0.35 : 0.35, honk: tt > t.gooseC - 0.05 && tt < t.gooseC + 0.35 ? 1 : 0, nod: tt > t.judging - 0.1 && tt < t.judging + 0.5 ? 0.25 * Math.sin((tt - t.judging) * 18) : 0, look: [-0.4, -0.3] }); }
    if (tt < t.blocks) { const [x, y, z] = tt < t.place + 0.35 ? hop(tt, t.place, t.place + 0.35, POSTTOP, [POSTTOP[0] + 0.6, 0, POSTTOP[2] + 0.3], 0.4) : path(tt, t.place + 0.35, t.blocks, [[POSTTOP[0] + 0.6, 0, POSTTOP[2] + 0.1], [9.4, 0, -4.7], [10.0, 0, -3.3], BLOCK]); return g.set({ ...b, x, y, z, rotY: PI / 2 + 0.3, run: 1, walk: tt * 22, wings: 0.5 }); }
    if (tt < CH0) { const hk = tt > t.honks - 0.05 && tt < t.louder + 0.5 ? 1 : 0; return g.set({ ...b, x: BLOCK[0], z: BLOCK[2], rotY: -PI / 2 + 0.45, honk: hk, wings: hk, look: [0.4, 0] }); }
    if (tt < CH1 + 0.3) { const x = lerp(BLOCK[0], 5.2, smooth(u01(tt, CH0, CH1 + 0.3))); return g.set({ ...b, x, z: lerp(BLOCK[2], -0.6, smooth(u01(tt, CH0, CH0 + 0.4))), rotY: -PI / 2 + 0.4, run: 1, walk: tt * 26, honk: Math.sin(tt * 18) > 0 ? 1 : 0.3, wings: 1 }); }
    const WATCH = [3.05, 0, -4.15];   // back by its post (out of the gun's way)
    if (tt < t.but) { const [x, , z] = path(tt, CH1 + 0.3, CH1 + 2.2, [[5.2, 0, -0.6], [2.5, 0, -0.7], [2.4, 0, -3.9], WATCH]); return g.set({ ...b, x, z, rotY: tt < CH1 + 2.2 ? -PI / 2 - 0.6 : 0.5, walk: tt < CH1 + 2.2 ? tt * 14 : null, honk: (tt > t.bounce - 0.1 && tt < t.bounce + 0.3) || (tt > HITM && tt < HITM + 0.4) ? 0.6 : 0, look: [0.5, 0], visible: tt < t.flies + 1.5 }); }
    const PASS0 = t.heavy - 1.6, PASS1 = t.drop + 0.6;
    if (tt < PASS1) { const x = lerp(XB1 - 8.6, XB1 + 3.6, u01(tt, PASS0, PASS1)); return g.set({ ...b, x, z: -0.55, rotY: PI / 2 - 0.35, walk: tt * 12, honk: tt > t.faster - 0.05 && tt < t.faster + 0.3 ? 0.7 : 0, look: [0.6, 0], visible: tt > PASS0 }); }
    // swims past Gary (submarine), climbs the far bank, hops onto the glacis, stares into the periscope
    const SW0 = t.eighty - 0.5, SW1 = t.climb - 0.15;   // r3: it hops onto the rear deck as the tank climbs out (it used to walk through the wheels)
    if (tt < SW0) return g.set({ ...b, visible: false });
    if (tt < SW1) { const x = lerp(BRX + 4.3, BRX + 1.35, smooth(u01(tt, SW0, t.submarine))); return g.set({ ...b, x, y: C.level + 0.06 + (tt > LAND ? 0.22 : 0), z: lerp(-0.95, -1.4, smooth(u01(tt, t.submarine - 0.6, t.submarine))), rotY: tt > t.submarine - 0.3 ? -0.6 : -PI / 2 + 0.35, swim: 1, look: [-0.5, 0], honk: tt > t.submarine - 0.1 && tt < t.submarine + 0.2 ? 0.4 : 0 }); }
    const RIDE = toWorld(-2.0, 1.48, 0.7), GL = toWorld(1.75, 1.19, 0.48);   // the rear deck (it rides out of the creek); the glacis in front of the near periscope
    if (tt < SW1 + 0.4) { const [x, y, z] = hop(tt, SW1, SW1 + 0.4, [BRX + 1.35, C.level + 0.28, -1.4], [RIDE.x, RIDE.y, RIDE.z], 0.7); return g.set({ ...b, x, y, z, rotY: PI / 2, wings: 1, flap: tt * 9 }); }
    if (tt < GHOP0) { const jolt = tt > CL1 && tt < CL1 + 0.5; return g.set({ ...b, x: RIDE.x, y: RIDE.y, z: RIDE.z, rotY: Vh.g.rotation.y + PI / 2 - 0.3, wings: jolt ? 1 : 0, flap: tt * 9, honk: jolt ? 1 : 0, look: [0.5, 0] }); }
    if (tt < GHOP1) { const [x, y, z] = hop(tt, GHOP0, GHOP1, [RIDE.x, RIDE.y, RIDE.z], [GL.x, GL.y, GL.z], 1.1); return g.set({ ...b, x, y, z, rotY: PI / 2 - 0.2, wings: 1, flap: tt * 9 }); }   // r3: one flap-hop over the turret
    if (tt < GOOSEIN) { const stare = tt < t.horn; return g.set({ ...b, x: GL.x, y: GL.y, z: GL.z, rotY: -PI / 2 + (stare ? 0.0 : 0.6), honk: (tt > t.immediately + 0.15 && tt < t.immediately + 0.5) || (tt > t.gooseF - 0.05 && tt < t.gooseF + 0.4) ? 1 : 0, wings: (tt > t.honksF && tt < t.honksF + 0.4) || (tt > t.immediately + 0.15 && tt < t.immediately + 0.5) ? 1 : 0, look: stare ? [0, -0.2] : [0.5, 0], reach: stare ? smooth(u01(tt, t.gooseP - 0.15, t.immediately - 0.05)) * (1 - smooth(u01(tt, t.immediately + 0.12, t.immediately + 0.3))) : 0, headUp: stare ? -0.3 : 0, nod: stare ? 0.55 : 0 }); }
    // the ending: hops into the hatch, pops up driving
    const HT = toWorld(1.0, 0.86, 0.05);   // the driver's seat: its body inside (seen through the cut), its head out of the hatch
    if (tt < GOOSEIN + 0.3) { const [x, y, z] = hop(tt, GOOSEIN, GOOSEIN + 0.3, [GL.x, GL.y, GL.z], [HT.x, HT.y, HT.z], 0.5); return g.set({ ...b, x, y, z, rotY: -PI / 2, wings: 1 }); }
    return g.set({ ...b, scale: GS * 1.3, x: HT.x, y: HT.y, z: HT.z, rotY: Vh.g.rotation.y + 0.45, honk: Math.sin(tt * 12) > 0.4 ? 1 : 0, wings: 0.7, flap: tt * 6, look: [0.5, 0] });
  }

  // ---------------------------------------------------------------- the chickens, the horse, props
  const HENS0 = [[13.4, 3.12, -4.5], [16.8, 3.12, -5.0], [15.2, 0, -5.8]];
  function chickensAt(tt) {
    hens.forEach((h, i) => { const p = HENS0[i]; const panic = tt > IN0 && tt < IN1 + 1.4; const fly = panic ? Math.sin(PI * u01(tt, IN0 + i * 0.15, IN1 + 1.2)) : 0; h.set({ x: p[0] + (panic ? (i - 1) * 1.2 * u01(tt, IN0, IN1 + 1.2) : 0), y: p[1] + 1.2 * fly, z: p[2], rotY: 0.5 + i, flap: panic ? 1 : 0, peck: panic ? 0 : Math.max(0, Math.sin(tt * 3 + i)), t: tt }); });
    // the one that lands on Gary's head: from the loft, onto his hat as he exits the far wall; flies off singed at the blast
    const LAND_H = IN1 + 0.25;
    if (tt < LAND_H - 0.5 || tt > BLAST + 1.5) { hen.set({ visible: false }); return; }
    gary.head.updateWorldMatrix(true, false); const hd = wpos(gary.head, v4).add(V(0, tt > BOUNCE1 && tt < t.heavy + 0.4 ? 0.16 : 0.31, 0));   // r3: ON the hat (it floated 10–15 cm above it)
    if (tt < LAND_H) { const [x, y, z] = hop(tt, LAND_H - 0.5, LAND_H, [15.8, 3.2, -2.6], [hd.x, hd.y, hd.z], 0.4); return hen.set({ x, y, z, rotY: 0.4, flap: 1, t: tt }); }
    if (tt > BOUNCE0 - 0.05 && tt < BOUNCE1 + 0.35) { const u = u01(tt, BOUNCE0 - 0.05, BOUNCE1 + 0.35); return hen.set({ x: hd.x, y: hd.y + 0.9 * Math.sin(PI * u), z: hd.z, rotY: 0.6, flap: 1, t: tt }); }
    if (tt < BLAST) return hen.set({ x: hd.x, y: hd.y, z: hd.z, rotY: 0.6, flap: tt > t.chicken - 0.1 && tt < t.chicken + 0.5 ? 1 : 0, peck: tt > t.head && tt < t.head + 0.6 ? Math.max(0, Math.sin(tt * 20)) : 0, sit: true, t: tt });
    const a = tt - BLAST; return hen.set({ x: hd.x - 2.5 * a, y: hd.y + 2.2 * a, z: hd.z + 0.5 * a, rotY: -1.2, flap: 1, t: tt, visible: a < 1.4 });
  }
  const HORSE = [-0.9, -3.7];
  function horseAt(tt) { const free = t.ask + 0.75, gone = t.slow + 0.9;
    const IN = t.spots, AT = t.softer - 0.25;   // it walks in from the left during the tracks beat (never in the hook's frame)
    if (tt < AT) { const u = smooth(u01(tt, IN, AT)); return horse.set({ x: lerp(-11, HORSE[0], u), z: lerp(-4.4, HORSE[1], u), rotY: PI / 2 - 0.2, walk: u > 0 && u < 1 ? tt * 12 : null, t: tt, visible: tt > IN }); }
    if (tt < free) { const sink = tt < t.softer - 0.05 ? 0 : 0.38 * smooth(u01(tt, t.softer - 0.05, t.horse)) + 0.32 * smooth(u01(tt, t.ask - 0.05, t.ask + 0.2)); return horse.set({ x: HORSE[0], z: HORSE[1], rotY: 1.05 - 1.05 * smooth(u01(tt, t.horse, t.ask)), sink, t: tt, nod: tt > t.ask && tt < t.ask + 0.6 ? 0.3 * Math.sin((tt - t.ask) * 12) : 0 }); }
    const u = smooth(u01(tt, free, gone)); horse.set({ x: lerp(HORSE[0], -11, u), z: lerp(HORSE[1], -4.4, u), rotY: -PI / 2 - 0.2, sink: 0.7 * (1 - smooth(u01(tt, free, free + 0.35))), walk: tt * 12, t: tt, visible: tt < gone + 0.1 }); }
  // pumpkins: ballistic from the cannon to their targets; the bouncers reflect off the sloped glacis
  const pumpTarget = (i) => { const [f, what] = PK[i]; vehicleAt(f + PKF(i)); if (what === 'gary') return toWorld(1.0, 1.62, 0.05); return what === 'flat' ? toWorld(2.95, 1.0, (i % 2 ? 0.45 : -0.4)) : toWorld(2.12, 1.08, (i % 2 ? 0.45 : -0.4)); };
  const PKT = PK.map((_, i) => pumpTarget(i));
  const g9 = 9.8;
  function pumpkinsAt(tt) {
    pumpkins.forEach((p, i) => {
      const [f, what] = PK[i], a = tt - f, P0 = S.cannonMuzzle, P1 = PKT[i], PK_T = PKF(i);
      if (a < 0 || a > PK_T + (what === 'slope' ? 1.6 : 0.02)) { p.g.visible = false; return; }
      p.g.visible = true;
      const v0 = V((P1.x - P0.x) / PK_T, (P1.y - P0.y) / PK_T + 0.5 * g9 * PK_T, (P1.z - P0.z) / PK_T);
      if (a <= PK_T) { p.g.position.set(P0.x + v0.x * a, P0.y + v0.y * a - 0.5 * g9 * a * a, P0.z + v0.z * a); p.g.rotation.set(a * 6, a * 4, 0); return; }
      // bounce: reflect the arrival velocity about the glacis normal (60° back from vertical: n = (sin 30°… ) in the vehicle frame)
      const vin = V(v0.x, v0.y - g9 * PK_T, v0.z), n = V(0.5, 0.866, 0); const vout = vin.clone().sub(n.clone().multiplyScalar(2 * vin.dot(n))).multiplyScalar(0.75); vout.z += 3.0; const b = a - PK_T;   // r3: the bounce heads toward the lens (it flew off away from the plate, 3 % of frame)
      p.g.position.set(P1.x + vout.x * b, P1.y + vout.y * b - 0.5 * g9 * b * b, P1.z + vout.z * b); p.g.rotation.set(b * 9, b * 6, 0);
    });
  }
  function propsAt(tt) {
    // the melon (gone after the hit), the laser dot on it
    melon.g.visible = tt < HITM; laser.visible = tt > t.target - 0.1 && tt < SHOT; laser.position.copy(MEL).add(V(0.25, 0.1, 0.12)); laser.scale.setScalar(1 + 0.3 * Math.sin(tt * 30));
    // the shell(s): straight lines from the muzzle to the hit point
    shell.visible = false;
    for (const [s, to, T] of [[SHOT, MEL, HITM - SHOT], [SHOT2, V(D.t2[0], 0.7, D.t2[1]), 0.15], [MISS1, V(D.scare[0], 1.6, D.scare[1]), 0.18], [MISS2, V(...D.cloud), 0.4]]) { const a = tt - s; if (a < 0 || a > T) continue; const m = muzzleAt(s); shell.visible = true; shell.position.lerpVectors(m, to, a / T); shell.lookAt(to); shell.rotateY(PI / 2); shell.scale.setScalar(s === SHOT ? 1.6 : 1.3); }
    vehicleAt(tt);
    // the pressure arrows (four under the kart wheels) and the spread arrows (along the near track)
    press4.forEach((a, i) => { const on = tt > t.four + i * 0.1 && tt < t.wrap - 0.1; a.visible = on; if (on) { a.position.set([-0.62, -0.62, 0.66, 0.66][i], 0.12, TZ + [-0.46, 0.46, -0.42, 0.42][i]); a.scale.setScalar(easeOutBack(u01(tt, t.four + i * 0.1, t.four + i * 0.1 + 0.25), 2.5) + 0.01); } });
    spreadA.forEach((a, i) => { const on = tt > t.spreads + i * 0.05 && tt < t.horse + 0.5; a.visible = on; if (on) { const p = toWorld(-2.0 + i * 0.5, 0.0, 1.35); a.position.set(p.x, 0.08, p.z); a.scale.setScalar(easeOutBack(u01(tt, t.spreads + i * 0.05, t.spreads + i * 0.05 + 0.25), 2.5) + 0.01); } });
    markerHull.visible = tt > t.sixty - 0.05 && tt < t.twice; markerHull.scale.setScalar(easeOutBack(u01(tt, t.sixty - 0.05, t.sixty + 0.2), 2.4) + 0.01);
    bar2.visible = tt > t.twice - 0.05 && tt < t.pumpkins - 0.1; if (bar2.visible) { const L = 0.75 * easeOutBack(u01(tt, t.twice - 0.05, t.twice + 0.25), 1.8); bar2.scale.set(Math.max(0.01, L), 1, 1); bar2.position.set(2.85 - 0.45 * Math.tan(PI / 3) + 0.0, 1.0, 1.4); }
    disc80.visible = tt > t.eighty - 0.2; { const u = u01(tt, t.eighty - 0.2, t.eighty + 0.02); disc80.position.y = 0.32 + 0.9 * (1 - u * u); disc80.scale.setScalar(1 + (tt > t.eighty + 0.02 && tt < t.eighty + 0.3 ? 0.18 * Math.sin(PI * u01(tt, t.eighty + 0.02, t.eighty + 0.3)) : 0)); }   // r3: slams down onto the turret
    // the lemonade: in Gary's hand, onto the barrel (stays level in the world), knocked about by nothing
    lem.g.visible = tt > GLASS0 - 0.4 && tt < t.heavy + 0.3;
    if (lem.g.visible) { const gs = wpos(Vh.glassSpot, v3), hand = wpos(gary.hand(1), v4); if (tt < GLASS0) lem.g.position.copy(hand).add(V(0, 0.04, 0)); else if (tt < GLASS1) lem.g.position.lerpVectors(hand, gs, smooth(u01(tt, GLASS0, GLASS1))); else lem.g.position.copy(gs); lem.g.rotation.set(0, 0, 0); }
    // the mower engine yanked out of the bay: up and over the back, lands behind
    mower.g.visible = tt > MOW && tt < END; if (mower.g.visible) { const p0 = toWorld(-1.8, 0.6, 0.2); const [x, y, z] = hop(tt, MOW, MOW + 0.75, [p0.x, p0.y, p0.z], [XB1 - 5.4, 0, TZ + 0.6], 2.2); mower.g.position.set(x, Math.max(0, y), z); mower.g.rotation.set(0, 0, tt < MOW + 0.75 ? (tt - MOW) * 9 : 0.4); }
    // barn planks: ballistic out of each end wall, then they lie where they land
    planks.forEach((g) => { const U = g.userData, t0 = U.w ? IN1 : IN0, x0 = U.w ? D.barn.x1 : D.barn.x0, a = tt - t0; g.visible = a > 0 && tt < END; if (!g.visible) return; const tl = Math.min(a, (U.vy + Math.sqrt(U.vy * U.vy + 2 * 9.8 * (U.y0 - 0.05))) / 9.8); g.position.set(x0 + U.vx * tl, Math.max(0.05, U.y0 + U.vy * tl - 4.9 * tl * tl), U.z0 + U.vz * tl); g.rotation.set(U.sp[0] * tl, U.sp[1] * tl, U.sp[2] * tl + (a > tl ? PI / 2 : 0)); });
    // the crown splash
    { const a = tt - LAND; crown.visible = a > 0 && a < 1.1; if (crown.visible) { const k = a / 1.1, H = 1.7 * Math.sin(PI * Math.min(1, k * 1.4)); crown.scale.set(lerp(2.0, 3.6, Math.sqrt(k)), Math.max(0.01, H), lerp(1.4, 2.4, Math.sqrt(k))); crown.position.set(BRX, C.level + 0.15 + H / 2, TZ); crown.material.opacity = 0.9 * (1 - k * k); } }
    { const a = tt - BLAST; brows.forEach((b, k) => { b.visible = a > 0 && a < 1.0; if (!b.visible) return; if (a < 0.02 || !b.userData.p0) { gary.head.updateWorldMatrix(true, false); b.userData.p0 = wpos(gary.head, new THREE.Vector3()).add(V((k ? 0.11 : -0.11), 0.16, 0.24)); } const p0 = b.userData.p0; b.position.set(p0.x + (k ? 0.9 : -0.9) * a, p0.y + 1.6 * a - 2.4 * a * a, p0.z + 3.2 * a); b.rotation.set(a * 11, a * 7, PI / 2 + a * (k ? 9 : -9)); }); }   // r4: two fuzzy brows fly off toward the lens
    // Gary's hard hat flies onto the goose (the ending)
    { const a0 = GOOSEIN, a1 = GOOSEIN + 0.35; flyHat.visible = tt > a0 && tt < a1; gHat.visible = tt >= a1; if (flyHat.visible) { gary.head.updateWorldMatrix(true, false); const ph = wpos(gary.head, new THREE.Vector3()).add(V(0, 0.3, 0)), pg = wpos(goose.head, new THREE.Vector3()).add(V(0, 0.08, 0)); const [x, y, z] = hop(tt, a0, a1, ph.toArray(), pg.toArray(), 0.6); flyHat.position.set(x, y, z); flyHat.rotation.set(tt * 9, 0, tt * 5); } }
    // the scorecard: in the goose's beak, turned to the lens
    { card.visible = tt > t.judging - 0.15 && tt < t.four; if (card.visible) { goose.head.updateWorldMatrix(true, false); const bk = goose.head.localToWorld(V(0.32, -0.12, 0.22)); card.position.copy(bk); card.quaternion.copy(studio.camera.quaternion); card.scale.setScalar(easeOutBack(u01(tt, t.judging - 0.15, t.judging + 0.1), 2.4) + 0.01); } }   // r2: beside the head (it hid it)
    // the aim laser: from the muzzle along the gun — it swings with the hull over the bumps, then locks once the gyros spin
    { laser2.visible = tt > t.bump - 0.2 && tt < t.heavy - 0.3 && !(tt > MISS1 - 0.05 && tt < MISS2 + 0.3); if (laser2.visible) { const m0 = wpos(Vh.muzzle, new THREE.Vector3()), dir = Vh.recoil.localToWorld(V(4.0, 0, 0)).sub(Vh.recoil.localToWorld(V(3.0, 0, 0))).normalize(), L = 9; laser2.position.copy(m0).addScaledVector(dir, L / 2); laser2.scale.set(1, L, 1); laser2.quaternion.setFromUnitVectors(V(0, 1, 0), dir); } }
    // DON'T STAND HERE pops up behind the tank on "Never"; the blast knocks it flat
    { warn.visible = tt > t.never - 0.05; if (warn.visible) { const k = easeOutBack(u01(tt, t.never - 0.05, t.never + 0.25), 2.2); warn.position.set(XB1 - 2.75, 0, TZ + 1.9); warn.scale.set(1, Math.max(0.01, k), 1); warn.rotation.set(0, 0.15, tt > BLAST ? -Math.min(1.45, (tt - BLAST) * 7) : 0); warnSign.material.color.setHex(tt > BLAST + 0.1 ? 0x3a3530 : 0xffffff); } }   // r2: right of the lens→Gary line (it hid his face)
    // bridge planks: splinter out on SNAP, fall into the creek, bob on the surface
    bPlanks.forEach((m) => { const U = m.userData, a = tt - SNAP; m.visible = a > 0 && tt < CL0 + 2; if (!m.visible) return; const lvl = C.level + (tt > LAND ? 0.22 : 0) + 0.02; const y = Math.max(lvl, 0.25 + U.vy * a - 4.9 * a * a), floating = y <= lvl + 0.001, dr = Math.max(0, a - 0.8); m.position.set(U.x0 + U.vx * Math.min(a, 0.8) + 0.12 * dr * Math.sin(U.sp), floating ? lvl + 0.02 * Math.sin(tt * 3 + U.sp) : y, U.z0 + U.vz * Math.min(a, 0.8) - 0.3 * dr); m.rotation.set(floating ? 0.05 * Math.sin(tt * 2 + U.sp) : U.sp * a, U.sp * Math.min(a, 0.8), 0); });   // r2: they drift off downstream
    // the cloud you can shoot (POOF), the scarecrow's top flies off
    cloud.visible = tt < POOF + 1.1; cloud.position.set(D.cloud[0] + Math.sin(tt * 0.2) * 0.4, D.cloud[1], D.cloud[2]);
    { const a = Math.max(0, tt - POOF); cloud.children.forEach((c, k) => { const dx = (k - 3) * 1.1, dy = Math.sin(k * 1.7) * 0.5, dz = Math.cos(k * 2.1) * 0.5, L = Math.hypot(dx, dy + 0.6, dz) || 1, f = 6 * (1 - Math.exp(-a * 3)); c.position.set(dx + dx / L * f, dy + (dy + 0.6) / L * f, dz + dz / L * f); c.scale.setScalar(a > 0 ? Math.max(0.01, 1 - a / 1.1) : 1); }); }   // r2: POOF = the puffs fly apart and shrink away
    { const a = tt - HITS, tp = S.scare.top; if (a > 0) { tp.position.set(1.8 * Math.min(a, 1.2), Math.max(-1.3, 2.4 * a - 4.9 * a * a), -0.6 * Math.min(a, 1.2)); tp.rotation.set(a * 3, a * 9, a * 4); } else { tp.position.set(0, 0, 0); tp.rotation.set(0, 0, 0); } }
    // the barn: holes; the bridge; the creek; the end fence; the windmill; the target bale's hay is gone after the hit
    S.barn.setHoles(tt > IN0 ? 1 : 0, tt > IN1 ? 1 : 0, TZ);
    S.bridge.set(sagAt(tt), brkAt(tt));
    const rise = tt < LAND ? 0 : 0.22 * smooth(u01(tt, LAND, LAND + 0.9)), slosh = tt > LAND && tt < LAND + 2.5 ? 0.06 * Math.sin((tt - LAND) * 6) * Math.exp(-(tt - LAND) * 1.2) : 0;
    const drain = tt > CL0 ? -0.1 * smooth(u01(tt, CL0, CL0 + 1.6)) : 0;
    S.water.setLevel(C.level + rise + slosh + drain, tt);
    S.endFence.rails.forEach((r, i) => { const a = tt - CL1; if (a < 0) { r.position.set(D.endFence, r.position.y > 0.6 ? 0.85 : 0.45, -2.35); r.rotation.set(0, PI / 2, 0); r.visible = true; return; } r.rotation.set(a * (3 + i), PI / 2 + a * 2, a * 2); r.position.set(D.endFence + 2.4 * Math.min(a, 0.9), Math.max(0.05, (i ? 0.85 : 0.45) + 2.0 * a - 4.9 * a * a), -2.35 + (i ? 0.6 : -0.6) * Math.min(a, 0.9)); });
    S.endFence.posts.forEach((p, i) => { const near = Math.abs(p.position.z - TZ) < 1.6; if (!near) return; const a = tt - CL1; p.rotation.z = a > 0 ? -Math.min(1.45, a * 6) : 0; });
    S.mill.rotation.z = tt * 1.2;
    { const a = tt - t.threeM + 0.05, f = Math.min(1, Math.max(0, (a - 0.3) / 0.45)); S.mlc.rotation.z = a > 0 ? -0.12 * smooth(Math.min(1, a / 0.25)) - 1.4 * f * f + (f >= 1 ? 0.04 * Math.sin((a - 0.75) * 18) * Math.exp(-(a - 0.75) * 4) : 0) : 0; }   // r3: the 3 sign creaks and leans on "three"
    { const a = tt - t.yellow + 0.1; S.mlcDisc.rotation.z = a > 0 && a < 2 ? 0.35 * Math.sin(a * 13) * Math.exp(-a * 2.2) : 0; S.mlcDisc.scale.setScalar(1 + (a > 0 && a < 0.5 ? 0.25 * Math.sin(PI * a / 0.5) : 0)); }   // r2: the yellow circle boings
    S.t2.g.visible = tt < SHOT2 + 0.15; S.bull.g.visible = true;
    S.melonBale.g.rotation.z = tt > HITM ? 0.05 * Math.sin((tt - HITM) * 20) * Math.exp(-(tt - HITM) * 4) : 0;
  }

  function update(tt) {
    const p = vehicleAt(tt);
    garyAt(tt); gooseAt(tt); chickensAt(tt); horseAt(tt); pumpkinsAt(tt); propsAt(tt);
    vehicleAt(tt);
    const cam = rail.at(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov * (1 - pushAt(tt)), tt, 0);
    kickR.apply(studio.camera, tt, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]));
    S.aimSun(cam.look[0], Math.max(0, cam.look[1]), Math.max(8, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.75));
    fx.update(tt, studio.camera);
  }

  // QC (`node tools/render.mjs 034-go-kart-tank --qc`): faces (Gary, his hat, the goose) under the caption/callouts
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, head, up] of [['Gary', gary.head, 0], ['Gary\'s hat', gary.head, 0.3], ['the goose', goose.head, 0]]) {
        if (!head.parent || !goose.root.visible && who === 'the goose') continue;
        head.updateWorldMatrix(true, false); head.getWorldPosition(v); v.y += up; v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`counts: framings ${Fr.length}, kicks ${KM2.length} (${KM2.filter((k) => k[1] >= 0.8).length} full-strength), fx bursts ${FXN.burst} + streams ${FXN.stream}, callouts ${story.callouts.length}`);
    out.push('holds ≥ 0.9 s (pushed in): ' + HOLDS.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}`).join(', '));
    out.push('kicks dropped inside a TERM: ' + (KM_TERM.join('; ') || 'none'));
    out.push('events: ' + JSON.stringify({ fx: FXN.times.map((x) => +x.toFixed(2)), kicks: KM2.map((k) => +k[0].toFixed(2)), frames: Fr.map((f) => +f.t.toFixed(2)) }));
    update(0); return out;
  };
  window.EDSTUDIO_COUNTS = { framings: Fr.length, kicks: KM2.length };
  update(0);
  return { update };
}
