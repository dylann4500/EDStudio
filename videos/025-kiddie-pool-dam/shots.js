// 025 — "How a Kiddie Pool Becomes a Dam" (build genre, docs/BUILD.md). ONE continuous camera take (engine/build/rail.js
// planRail); every gag is keyed to its spoken word: W(beat, word) = when that word is said (story.json from tools/narrate.py),
// so re-voicing keeps every move on its word.
// Set: engine/build/dam.js — a desert canyon cut ALONG the river: the lake rises on the left, the river runs on to the right.
// Continuity: the kiddie pool is thrown into the creek, floats to the beaver's dam and stays there (Gary keeps landing in it);
// the beaver's little dam holds through every failure; one diversion tunnel (dug once, plugged once); the earth dam piles up
// where the pool sat, slides, crumbles; the concrete dam rises in columns on the same spot and only ever gains parts.
//
// Facts (web-searched Oct 26 2026):
//   Hoover Dam had four diversion tunnels, 56 ft bore / 50 ft lined, ~15,946 ft combined (USBR "Tunnels" essay; NPS NRHP 81000382).
//   Base 660 ft thick, crest 45 ft, structural height 726.4 ft (usbr.gov project page id=122; Nevada SHPO; USGS).
//   One continuous pour would have taken 125 years to cool → poured in columns with 1-inch steel cooling pipe (USBR "Concrete").
//   $49 million: Six Companies' bid $48,890,955, Mar 11 1931 (US Census Bureau "History and the Census: Hoover Dam", Sept 2025).
//   St. Thomas, Nevada: abandoned and drowned by Lake Mead in the 1930s; resurfaces in droughts (NPS Lake Mead NRA; Travel Nevada).
//   Piping / cutoff wall / gravity dam / spillway / penstock / fish ladder: standard dam-engineering terms (USBR, ASDSO).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, mat } from '@engine/core.js';
import { beatClock, pop, drop, squash, wobble, shake, u01, easeOutBack, softTex } from '@engine/build/anim.js';
import { makeFX, makeArrows, makeDizzy } from '@engine/build/fx.js';
import { makeToon, makeShades } from '@engine/build/toon.js';
import { makeRail, planRail } from '@engine/build/rail.js';
import { buildDam, D, makeKiddiePool, makeBeaver, makeSalmon, makeWaterBody, slopeY, signTex } from '@engine/build/dam.js';

const PI = Math.PI, BED = D.bed, G = D.dam, E = D.earth, PW = D.power;
const CRK = -0.18, PND = -0.24, LOW = -0.36;                       // creek, beaver pond, below the beaver dam (water levels)
const INLET = D.tunnel.path[0][0], BVX = D.beaver.x;                 // diversion inlet x; the beaver dam x
const KPR = D.kp.r + 0.14, KP_AT_BV = BVX - 0.72 - KPR;             // the kiddie pool's outer radius; where it rests against the beaver dam
const SL = 2.5;                                                      // how far the lake shoves the earth dam
const LAKE = 7.6, FULL = 8.7;                                         // lake after the gravity dam; at the spillway crest
const FIN = [9.1, -1.15];                                            // where Gary's kiddie pool ends up (below the beaver dam, by the public pool)

export async function build(studio, story) {
  const S = await buildDam(studio), B = beatClock(story), scene = S.root;
  const W = (b, w, n) => B.W(b, w, n);
  const END = story.duration;
  const fx = makeFX(scene);
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  // ---------------------------------------------------------------- key times (all from the narration)
  const t = {
    n104: W('hook', '104'), closed: W('hook', 'closed'), so0: W('hook', 'so'), shove: W('hook', 'shove'), kiddie: W('hook', 'kiddie'), creek: W('hook', 'creek'),
    congrats: W('congrats', 'congratulations'), built: W('congrats', 'built'), damC: W('congrats', 'dam'), holds: W('congrats', 'holds'), six: W('congrats', 'six'), inches: W('congrats', 'inches'),
    beaver: W('congrats', 'beaver'), notes: W('congrats', 'notes'),
    garyF: W('float', 'gary'), hops: W('float', 'hops'), inF: W('float', 'in'), lifts: W('float', 'lifts'), floats: W('float', 'floats'), lost: W('float', 'lost'), flip: W('float', 'flipflop'),
    cant: W('divert', 'cant'), running: W('divert', 'running'), river: W('divert', 'river'), dig: W('divert', 'dig'), around: W('divert', 'around'), diversion: W('divert', 'diversion'),
    hoover: W('divert', 'hoover'), four: W('divert', 'four'), garyD: W('divert', 'gary'), got: W('divert', 'got'), flushed: W('divert', 'flushed'),
    nowP: W('piping', 'now'), pile: W('piping', 'pile'), wallP: W('piping', 'wall'), dirt: W('piping', 'dirt'), sneaks: W('piping', 'sneaks'), carves: W('piping', 'carves'), piping: W('piping', 'piping'),
    garyP: W('piping', 'gary'), plugs: W('piping', 'plugs'), finger: W('piping', 'finger'), garyP2: W('piping', 'gary', 2), cork: W('piping', 'cork'),
    soC: W('cutoff', 'so'), drive: W('cutoff', 'drive'), bedrock: W('cutoff', 'bedrock'), cutoff: W('cutoff', 'cutoff'), beaverC: W('cutoff', 'beaver'), already: W('cutoff', 'already'), oneC: W('cutoff', 'one'),
    lake: W('push', 'lake'), deeper: W('push', 'deeper'), shoves: W('push', 'shoves'), downstream: W('push', 'downstream'), included: W('push', 'included'), soP: W('push', 'so'), pour: W('push', 'pour'),
    wedge: W('push', 'wedge'), n660: W('push', '660'), bottom: W('push', 'bottom'), gravity: W('push', 'gravity'), heavy: W('push', 'heavy'), bully: W('push', 'bully'),
    concreteH: W('heat', 'concrete'), hot: W('heat', 'hot'), sets: W('heat', 'sets'), hoovers: W('heat', 'hoovers'), n125: W('heat', '125'), cool: W('heat', 'cool'),
    garyH: W('heat', 'gary'), sat: W('heat', 'sat'), medium: W('heat', 'medium'), rare: W('heat', 'rare'), soH: W('heat', 'so'), run: W('heat', 'run'), pipesH: W('heat', 'pipes'), inside: W('heat', 'inside'), cooling: W('heat', 'cooling'),
    rains: W('spill', 'rains'), week: W('spill', 'week'), pours: W('spill', 'pours'), top: W('spill', 'top'), soS: W('spill', 'so'), spillway: W('spill', 'spillway'), exit: W('spill', 'exit'),
    garyS: W('spill', 'gary'), slide: W('spill', 'slide'), once: W('spill', 'once'),
    rent: W('power', 'rent'), send: W('power', 'send'), giant: W('power', 'giant'), pipesW: W('power', 'pipes'), spin: W('power', 'spin'), turbines: W('power', 'turbines'), penstocks: W('power', 'penstocks'),
    garyW: W('power', 'gary'), spin2: W('power', 'spin', 2), cycle: W('power', 'cycle'),
    salmon: W('fish', 'salmon'), home: W('fish', 'home'), blame: W('fish', 'blame'), furious: W('fish', 'blame'), fishW: W('fish', 'fish'), ladder: W('fish', 'ladder'), pools: W('fish', 'pools'), climb: W('fish', 'climb'), garyFi: W('fish', 'gary', 2), cantF: W('fish', 'cant', 2),
    also: W('town', 'your'), lakefront: W('town', 'lakefront'), sells: W('town', 'sells'), drowned: W('town', 'drowned'), town: W('town', 'town'), happened: W('town', 'happened'), mead: W('town', 'mead'), only: W('town', 'only'), up: W('town', 'up'), droughts: W('town', 'droughts'),
    add: W('finish', 'add'), road: W('finish', 'road'), visitor: W('finish', 'visitor'), gift: W('finish', 'gift'), sign: W('finish', 'sign'), swimmingF: W('finish', 'swimming'),
    end: W('end', 'congratulations'), damE: W('end', 'dam'), wanted: W('end', 'wanted'), coolE: W('end', 'cool'), spent: W('end', 'spent'), n49: W('end', '49'), money: W('end', 'money'),
    swimming: W('end', 'swimming'), illegal: W('end', 'illegal'), beavers: W('end', 'beavers'), bestseller: W('end', 'bestseller'), publicE: W('end', 'public'), still: W('end', 'still'), closedE: W('end', 'closed'),
  };
  // derived beats
  const THROW = t.shove - 0.1, LANDK = Math.max(t.congrats - 0.1, THROW + 0.9);       // Gary heaves the pool; it lands in the creek
  const FLOAT0 = t.floats - 0.15, FLOAT1 = Math.max(t.flip + 0.55, FLOAT0 + 1.6);       // the pool drifts to the beaver's dam
  const DIG0 = t.dig - 0.05, DIG1 = t.diversion;                                         // the tunnel is dug from the outlet back to the inlet
  const RUN0 = t.dig + 0.35, RUN1 = Math.max(t.four, RUN0 + 2.6);                        // Gary runs upstream above the dig
  const SUCK = t.got, OUT = SUCK + 1.5, ONPILE = Math.min(OUT + 1.0, t.dirt - 0.1);                             // flushed through the tunnel, out, into the pool
  const DUMPS = [t.pile, t.wallP, t.dirt].map((x) => x + 0.05);                          // three loads of dirt
  const PLUG = t.dirt + 0.45;                                                             // the inlet is plugged: the lake fills
  const JET = t.carves + 0.9, POPC = t.cork;                                             // the leak breaks out; Gary pops off it
  const SLAM = t.drive + 0.3;                                                             // the cutoff wall lands
  const SLIDE0 = t.downstream - 0.45, SLIDE1 = t.downstream + 0.6, CRUMB = t.included + 0.05, CRUMB1 = CRUMB + 0.65, KPOVER = CRUMB + 1.5;
  const COL0 = t.pour - 0.1, COLDT = 0.2, COLDUR = 0.62;                                  // the concrete columns rise in lifts, heel → toe
  const FILL0 = t.gravity - 0.55, FILL1 = t.bully - 0.15;                                 // the lake comes back, slams the dam on "bully"
  const SIT = t.sat - 0.1, LEAP = t.medium - 0.05;
  const PIPE0 = t.run, PIPE1 = t.inside + 0.4;
  const RAIN0 = t.rains - 0.4, RAIN1 = t.spillway + 0.6, OVER = t.pours - 0.05;
  const SLD0 = t.garyS + 0.25, SLD1 = SLD0 + 1.0, SPLASH = Math.max(SLD1 + 0.45, t.once + 0.02);   // the water slide, ski-jump, head-first "exactly once"
  const PH = t.pipesW - 0.05, SUCKT = t.garyW + 0.15, SPIT = t.cycle + 0.55, SPLAT = SPIT + 0.5;
  const LAD0 = t.fishW - 0.05, LAD1 = t.pools + 0.1, SLAP = t.cantF - 0.02;
  const DRY0 = t.only - 0.05, DRY1 = t.up + 0.25, WET0 = t.lakefront + 0.5, WET1 = t.visitor + 0.4;

  // ---------------------------------------------------------------- cast + props
  const gary = makeToon({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'hardhat' }); scene.add(gary.root);
  const garyShades = makeShades(0.075, 0.1); gary.head.add(garyShades); garyShades.position.set(0, 0.05, 0.3);
  const floatie = mk(new THREE.TorusGeometry(0.25, 0.085, 12, 28), mat(0xff6fb1, 0.35), gary.root.children[0], 0, -0.12, 0); floatie.rotation.x = PI / 2;
  for (let i = 0; i < 4; i++) { const s = mk(new THREE.TorusGeometry(0.25, 0.088, 6, 6, 0.35), mat(0xffffff, 0.35), floatie); s.rotation.z = (i * PI) / 2; }
  const beaver = makeBeaver(); scene.add(beaver.root);
  const salmon = [0, 1, 2, 3, 4, 5].map((i) => { const f = makeSalmon(i); f.g.scale.setScalar(1.25); scene.add(f.g); return f; });
  const kp = makeKiddiePool(D.kp.r); scene.add(kp.g);
  const dizzy = makeDizzy(scene);
  const water = { far: makeWaterBody(scene, { flow: 1, depth: 7.5 }), site: makeWaterBody(scene, { flow: 1, depth: 7.5 }), pond: makeWaterBody(scene, { flow: 0.6 }), low: makeWaterBody(scene, { flow: 1 }) };
  const rock = mk(new THREE.IcosahedronGeometry(0.42, 1), new THREE.MeshStandardMaterial({ color: 0x8c8276, roughness: 0.9, flatShading: true }), scene, -0.55, BED + 0.12, -0.75); rock.scale.set(1.1, 0.75, 0.9);
  // "six inches": a yardstick standing in the water behind the pool
  const stick = new THREE.Group(); scene.add(stick); stick.position.set(-3.95, BED, 0.02);
  mk(new THREE.BoxGeometry(0.1, 1.2, 0.02), new THREE.MeshStandardMaterial({ map: tex(32, 384, (g, w, h) => { g.fillStyle = '#ffd43b'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; for (let i = 0; i <= 24; i++) g.fillRect(0, h - (i * h) / 24, i % 4 ? 10 : 20, 3); }) }), stick, 0, 0.6, 0);
  const stickTag = mk(new THREE.PlaneGeometry(0.66, 0.31), new THREE.MeshStandardMaterial({ map: signTex(220, 104, '6 IN', { bg: '#ffffff', fg: '#d8231c', border: '#d8231c' }) }), stick, -0.38, 0.42, 0.01);
  const flipflop = new THREE.Group(); scene.add(flipflop);
  mk(new THREE.CylinderGeometry(0.14, 0.11, 0.03, 18), mat(0xff5fa2, 0.5), flipflop).scale.set(0.8, 1, 1.9);
  mk(new THREE.TorusGeometry(0.07, 0.012, 6, 14, PI), mat(0x3ec7ff, 0.5), flipflop, 0, 0.03, 0.06).rotation.x = -PI / 2;
  // the hook: Gary carries the pool over his head; the CLOSED sign slaps onto the fence; the thermometer pegs at 104
  const sweat = [];
  // the 660 ft dimension line along the dam's base
  const DIML = G.toe + 0.35 - G.heel, dim = new THREE.Group(); scene.add(dim); dim.position.set(G.toe + 0.35, BED + 0.05, 0.25);
  const yelM = new THREE.MeshBasicMaterial({ color: 0xffd43b }), tapeT = tex(512, 32, (g, w, h) => { g.fillStyle = '#ffd43b'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b1a05'; for (let i = 0; i < 64; i++) g.fillRect(i * 8, 0, 2, i % 4 ? 10 : 20); });
  tapeT.wrapS = THREE.RepeatWrapping; tapeT.repeat.set(4, 1);
  const dimLine = mk(new THREE.BoxGeometry(1, 0.1, 0.02).translate(-0.5, 0, 0), new THREE.MeshBasicMaterial({ map: tapeT }), dim);
  const dimEnd = new THREE.Group(); dim.add(dimEnd); { const c = mk(new THREE.ConeGeometry(0.16, 0.34, 3), yelM, dimEnd, 0.12, 0, 0); c.rotation.z = PI / 2; mk(new THREE.BoxGeometry(0.06, 0.55, 0.02), yelM, dimEnd); }
  const tapeCase = mk(new RoundedBoxGeometry(0.16, 0.16, 0.08, 2, 0.03), mat(0xffc21a, 0.4), gary.hand(1), 0, -0.05, 0.06);
  const coolBoard = new THREE.Group(); scene.add(coolBoard); coolBoard.position.set(0.75, BED, -0.35);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), mat(0x6b4a30), coolBoard, 0, 0.5, 0);
  const coolTex = [1, 2].map((pct) => tex(512, 220, (g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 22); g.fill(); g.strokeStyle = '#1b1b1b'; g.lineWidth = 8; g.stroke();
    g.fillStyle = '#1b1b1b'; g.font = '62px "Luckiest Guy", Arial Black'; g.textAlign = 'center'; g.fillText('COOLING…', w / 2, 82); g.strokeRect(40, 112, w - 80, 58); g.fillStyle = '#3fb2ea'; g.fillRect(44, 116, (w - 88) * pct / 100, 50);
    g.fillStyle = '#d8231c'; g.font = '44px "Luckiest Guy", Arial Black'; g.fillText(pct + '%', w / 2, 158); }));
  const coolSign = mk(new THREE.PlaneGeometry(1.05, 0.45), new THREE.MeshStandardMaterial({ map: coolTex[0], roughness: 0.6 }), coolBoard, 0, 1.1, 0.03);
  const forSale = new THREE.Group(); scene.add(forSale); forSale.position.set(-11.15, 1.84, -3.9);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), mat(0x6b4a30), forSale, 0, 0.45, 0);
  mk(new THREE.PlaneGeometry(1.0, 0.62), new THREE.MeshStandardMaterial({ map: signTex(320, 200, 'LAKEFRONT\nFOR SALE', { bg: '#ffffff', fg: '#d8231c', border: '#d8231c' }), roughness: 0.6, side: THREE.DoubleSide }), forSale, 0, 0.95, 0.03);
  const anger = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: tex(128, 128, (g) => { g.strokeStyle = '#e8231c'; g.lineWidth = 14; g.lineCap = 'round'; for (const [a, b] of [[0.6, 1], [2.17, 1], [3.74, 1], [5.31, 1]]) { const x = 64 + Math.cos(a) * 30, y = 64 + Math.sin(a) * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(64, 64, 64 + Math.cos(a + 0.9) * 30, 64 + Math.sin(a + 0.9) * 30); g.stroke(); } }) }));
  anger.scale.setScalar(0.35); scene.add(anger);
  // the egg that fries on the hot concrete; frost puffs
  const egg = new THREE.Group(); scene.add(egg);
  mk(new THREE.CircleGeometry(0.16, 20), mat(0xffffff, 0.4), egg).position.z = 0.002; mk(new THREE.SphereGeometry(0.065, 12, 8, 0, PI * 2, 0, PI / 2), mat(0xffb11a, 0.3), egg, 0.02, 0, 0.01).rotation.x = PI / 2;
  // rain clouds (soft grey puffs over the canyon)
  const cloudTex = softTex('120,128,138', 128), clouds = [];
  for (let i = 0; i < 14; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0, depthWrite: false, fog: false })); sp.scale.set(9 + (i % 4) * 2.5, 4.5 + (i % 3), 1); sp.position.set(-24 + i * 2.6, 16.5 + (i % 3) * 1.3, -6 - (i % 4) * 2.5); scene.add(sp); clouds.push(sp); }
  // the penstock's flow + the electricity on the wires
  const penFlow = makeArrows(scene, S.penCurve.getPoints(12).map((p) => [p.x, p.y, 0.09]), { color: 0xbfeaff, count: 7, size: 0.32, speed: 2.4, emissive: 0.8 });
  const creekFlow = makeArrows(scene, [[-10, CRK + 0.06, -0.15], [5.5, CRK + 0.06, -0.15]], { color: 0xffffff, count: 9, size: 0.34, speed: 2.2, emissive: 0.6 });
  const tunFlow = makeArrows(scene, S.tCurve.getPoints(20).map((p) => [p.x, p.y, 0.02]), { color: 0xbfeaff, count: 10, size: 0.36, speed: 4.5, emissive: 0.8 });
  const pushArrows = makeArrows(scene, [[-8.6, 0.9, 0.12], [-5.4, 0.9, 0.12]], { color: 0xff8a3d, count: 4, size: 0.6, speed: 3, emissive: 0.8 });
  const bullyArrows = makeArrows(scene, [[-13, 4.0, 0.08], [G.heel - 0.2, 4.0, 0.08]], { color: 0xff8a3d, count: 6, size: 0.6, speed: 4, emissive: 0.7 });
  // the plug that closes the tunnel just inside its inlet
  const PLUG_U = 0.12, plugP = S.tCurve.getPointAt(PLUG_U), plugT = S.tCurve.getTangentAt(PLUG_U);
  S.plug.position.set(plugP.x, plugP.y, D.tunnel.z); S.plug.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), plugT);
  const tWaterUplug = PLUG_U;
  // the cut face holes of the diversion tunnel: circles stamped along the curve from u0 to 1
  const tunnelHoles = (u0) => { const out = []; if (u0 >= 1) return out; for (let i = 90; i >= 0; i--) { const u = i / 90; if (u < u0) break; const p = S.tCurve.getPointAt(u); out.push({ circle: [p.x, p.y, D.tunnel.R] }); } return out; };
  const tUatX = (x) => { let best = 0, bd = 1e9; for (let i = 0; i <= 200; i++) { const u = i / 200, d = Math.abs(S.tCurve.getPoint(u).x - x); if (d < bd) { bd = d; best = u; } } return best; };
  // where the cutoff wall crosses the piping tube (param along it): the water downstream of it is cut off
  const pipeU = (() => { let best = 0, bd = 1e9; for (let i = 0; i <= 200; i++) { const u = i / 200, d = Math.abs(S.pipeCurve.getPoint(u).x - (D.cutoff.x0 + D.cutoff.x1) / 2); if (d < bd) { bd = d; best = u; } } return best; })();
  const JETP = S.pipeCurve.getPoint(1);                                                  // where the leak breaks out of the face
  const cutoffH = BED + E.h - D.cutoff.y1;                                                // the decal's full height (dam top → bedrock)
  const book = S.heldBook;

  // ---------------------------------------------------------------- water levels (lake = far + site; pond; low)
  const lakeLevel = (tt) => {
    if (tt < LANDK) return CRK;
    if (tt < t.lifts) return lerp(CRK, 0.0, smooth(u01(tt, LANDK, t.inches)));             // six inches piles up behind the pool
    if (tt < PLUG) return lerp(0.0, CRK, smooth(u01(tt, t.lifts, t.lifts + 0.6)));
    if (tt < CRUMB) return lerp(CRK, 2.0, smooth(u01(tt, PLUG, t.piping))) + 0.38 * smooth(u01(tt, t.deeper, t.downstream));
    if (tt < FILL0) return lerp(2.38, CRK, smooth(u01(tt, CRUMB, CRUMB1)));
    if (tt < OVER - 1.5) return lerp(CRK, LAKE, easeOutBack(u01(tt, FILL0, FILL1), 1.2));
    if (tt < t.spillway) return lerp(LAKE, G.crest + 0.22, smooth(u01(tt, RAIN0, OVER + 0.5)));
    if (tt < DRY0) return lerp(G.crest + 0.22, FULL, smooth(u01(tt, t.spillway, t.exit + 0.3)));
    if (tt < WET0) return lerp(FULL, 1.4, smooth(u01(tt, DRY0, DRY1)));
    return lerp(1.4, FULL, smooth(u01(tt, WET0, WET1)));
  };
  // the site between the inlet and the dam line: drained by the diversion, dry again for the concrete pour
  const siteLevel = (tt) => {
    const L = lakeLevel(tt);
    if (tt < DIG1) return L;
    if (tt < PLUG) return lerp(L, BED - 0.05, smooth(u01(tt, DIG1, DIG1 + 0.9)));
    if (tt < CRUMB) return L;
    if (tt < FILL0) return Math.min(L, lerp(2.38, BED - 0.05, smooth(u01(tt, CRUMB, COL0))));
    return L;
  };
  const eK3 = (tt) => (tt < DUMPS[0] ? 0 : DUMPS.reduce((a, d) => a + easeOutBack(u01(tt, d, d + 0.3), 1.6) / 3, 0));
  const slideX = (tt) => { const u = u01(tt, SLIDE0, SLIDE1), k = Math.min(2, Math.floor(u * 3)); return SL * (u >= 1 ? 1 : (k + smooth(clamp((u * 3 - k) * 1.8))) / 3); };
  const damLine = (tt) => {   // [site x1, pond x0]
    const kpx = kpPos(tt)[0];
    if (tt < LANDK || (tt > t.lifts + 0.3 && tt < t.pile)) return [kpx, kpx];
    if (tt < t.lifts + 0.3) return [kpx - KPR + 0.12, kpx + KPR - 0.12];
    if (tt < CRUMB1) { const L = lakeLevel(tt), s = slideX(tt), f = clamp((L - BED) / E.h); return [E.x0 + s + f * (E.t0 - E.x0), E.x1 + s]; }
    if (tt < COL0) return [G.heel, G.toe];
    return [G.heel, G.toe];
  };
  const pondLevel = (tt) => PND + 0.25 * Math.exp(-Math.max(0, tt - CRUMB) * 1.6) * (tt > CRUMB ? Math.sin((tt - CRUMB) * 5) * 0.6 + 0.6 : 0) + (tt > t.spillway ? 0.06 : 0);

  // ---------------------------------------------------------------- the kiddie pool: thrown, lands, floats to the beaver dam, ends by the public pool
  const HOLD = [9.1, 1.78, -2.45];
  function kpPos(tt) {
    if (tt < THROW) return [HOLD[0], HOLD[1], HOLD[2]];
    if (tt < LANDK) { const u = u01(tt, THROW, LANDK), e = smooth(u); return [lerp(HOLD[0], D.kp.x, e), lerp(HOLD[1], BED + 0.02, u) + 3.2 * u * (1 - u), lerp(HOLD[2], D.kp.z, e)]; }   // eased so the follow-pan keeps it framed
    if (tt < t.lifts) return [D.kp.x, BED + 0.02, D.kp.z];
    if (tt < FLOAT0) return [D.kp.x, BED + 0.02 + 0.22 * smooth(u01(tt, t.lifts, t.lifts + 0.5)) + 0.03 * Math.sin(tt * 4), D.kp.z];
    if (tt < CRUMB + 0.1) { const u = smooth(u01(tt, FLOAT0, FLOAT1)); return [lerp(D.kp.x, KP_AT_BV, u), lerp(BED + 0.24, pondLevel(tt) - 0.16, u) + 0.03 * Math.sin(tt * 3.1), D.kp.z - 0.08 * Math.sin(u * PI)]; }
    if (tt < KPOVER) { const u = u01(tt, CRUMB + 0.1, KPOVER), e = smooth(u); return [lerp(KP_AT_BV, FIN[0], e), lerp(PND - 0.16, LOW - 0.14, e) + 0.75 * Math.sin(PI * clamp(u * 1.3)), lerp(D.kp.z, FIN[1], e)]; }   // the flood washes it over the beaver's dam
    return [FIN[0], LOW - 0.14 + 0.025 * Math.sin(tt * 2.7), FIN[1]];
  }

  // ---------------------------------------------------------------- effects (scheduled from the narration)
  for (let k = 0; k < 6; k++) fx.burst('drops', 0.3 + k * 0.45, { pos: [9.1 + (k % 2 ? 0.15 : -0.15), 1.35, -2.2], n: 3, dir: [k % 2 ? 1 : -1, 0.5, 0.4], spread: 0.4, speed: [0.6, 1.1], size: [0.025, 0.04], seed: 300 + k });   // sweat
  fx.burst('drops', t.n104, { pos: [D.thermo[0], 2.12, D.thermo[1] + 0.12], n: 26, dir: [0, 1, 0.3], spread: 0.7, speed: [1.2, 2.6], color: 0xe8231c, size: [0.03, 0.05], seed: 2 });   // the mercury blows its top
  fx.burst('drops', LANDK, { pos: [D.kp.x, CRK, -0.9], box: [2.0, 0.1, 0.8], n: 90, dir: [0, 1, 0.2], spread: 0.8, speed: [2, 4], seed: 1 });
  fx.burst('confetti', t.congrats, { pos: [D.kp.x, 0.3, -1.0], n: 220, dir: [0, 1, 0.15], spread: 0.6, speed: [4.5, 7.5], seed: 3 });
  fx.burst('drops', t.beaver - 0.35, { pos: [-0.55, CRK, -0.75], n: 30, dir: [0, 1, 0.2], spread: 0.6, speed: [1.2, 2.6], seed: 4 });
  fx.burst('drops', t.inF, { pos: [D.kp.x, 0.0, -1.0], n: 70, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 4], seed: 5 });
  fx.burst('drops', FLOAT1 - 0.2, { pos: [KP_AT_BV + 1.0, PND, -1.0], n: 30, dir: [0, 1, 0.2], spread: 0.7, speed: [1, 2.4], seed: 6 });
  for (let k = 0; k < 14; k++) { const tk = lerp(DIG0, DIG1, k / 14), p = S.tCurve.getPointAt(1 - smooth(k / 14)); fx.burst('dirt', tk, { pos: [p.x, p.y, 0.35], n: 10, dir: [0.2, 0.8, 1], spread: 0.6, speed: [1.5, 3.5], size: [0.04, 0.1], floor: p.y - 0.8, seed: 10 + k }); }
  fx.burst('drops', DIG1, { pos: [INLET + 0.3, CRK, -0.9], n: 60, dir: [0.3, 1, 0.2], spread: 0.7, speed: [1.5, 3], seed: 30 });
  fx.burst('drops', SUCK, { pos: [INLET + 0.5, CRK, -0.9], n: 60, dir: [0, 1, 0.3], spread: 0.7, speed: [2, 3.5], seed: 31 });
  fx.burst('drops', OUT, { pos: [D.tunnel.path[9][0], BED + 0.1, -0.6], n: 70, dir: [0.4, 1, 0.2], spread: 0.6, speed: [3, 5], seed: 32 });
  DUMPS.forEach((tk, k) => { fx.burst('dirt', tk - 0.15, { pos: [-4.4, 4.0 - k * 0.4, -1.0], box: [3.5, 0.6, 1.5], n: 80, dir: [0, -1, 0], spread: 0.4, speed: [1, 3], floor: BED + (E.h * (k + 1)) / 3, life: [0.4, 0.7], seed: 40 + k }); fx.burst('dust', tk + 0.05, { pos: [-4.4, BED + (E.h * (k + 1)) / 3, -0.6], box: [4, 0.4, 0.4], n: 8, speed: [0.4, 1], spread: 1.3, size: [0.4, 0.8], seed: 50 + k }); });
  fx.burst('drops', JET, { pos: [JETP.x + 0.05, JETP.y, 0.05], n: 60, dir: [1, 0.5, 0.2], spread: 0.6, speed: [2.5, 4.5], seed: 59 });   // the leak breaks out of the face
  fx.burst('dirt', JET, { pos: [JETP.x + 0.05, JETP.y, 0.1], n: 18, dir: [1, 0.6, 0.3], spread: 0.6, speed: [1.5, 3], floor: BED, size: [0.03, 0.06], seed: 58 });
  fx.stream('drops', JET, t.finger + 0.02, { pos: [JETP.x + 0.05, JETP.y, 0.05], dir: [1, 0.35, 0.1], spread: 0.15, speed: [2.5, 3.5], rate: 70, floor: BED, size: [0.03, 0.05], seed: 60 });
  for (const [dy, sd] of [[0.18, 57], [-0.12, 56]]) fx.stream('drops', t.finger + 0.35, POPC, { pos: [JETP.x - 0.05, JETP.y + dy, 0.1], dir: [0.4, Math.sign(dy) * 1, 0.4], spread: 0.3, speed: [1.2, 2.2], rate: 22, floor: BED, size: [0.02, 0.035], seed: sd });   // squirts round his finger
  fx.stream('drops', POPC + 0.05, SLAM + 0.2, { pos: [JETP.x + 0.05, JETP.y, 0.05], dir: [1, 0.45, 0.1], spread: 0.2, speed: [4, 6], rate: 110, floor: BED, size: [0.035, 0.06], seed: 61 });
  fx.burst('dust', POPC, { pos: [JETP.x + 0.2, JETP.y, 0.2], n: 8, speed: [0.5, 1.2], spread: 1.3, size: [0.25, 0.45], seed: 62 });
  fx.burst('drops', POPC, { pos: [JETP.x + 0.2, JETP.y, 0.1], n: 60, dir: [1, 0.6, 0.2], spread: 0.6, speed: [3, 6], seed: 63 });
  fx.burst('dirt', SLAM, { pos: [-4.4, BED + E.h, -1.0], box: [0.8, 0.2, 2.5], n: 70, dir: [0, 1, 0.3], spread: 0.9, speed: [2, 5], floor: BED + E.h, seed: 64 });
  fx.burst('dust', SLAM, { pos: [-4.4, BED + E.h + 0.2, -0.6], n: 10, speed: [0.5, 1.3], spread: 1.3, size: [0.4, 0.7], seed: 65 });
  for (let k = 0; k < 6; k++) fx.burst('rock', lerp(SLAM + 0.1, t.bedrock + 0.1, k / 5), { pos: [-4.4, lerp(BED - 0.3, D.cutoff.y1 + 0.2, k / 5), 0.3], n: 12, dir: [0, 0.4, 1], spread: 1.1, speed: [1, 2.5], floor: lerp(BED - 0.6, D.cutoff.y1, k / 5), size: [0.04, 0.09], life: [0.5, 0.8], seed: 66 + k });
  fx.burst('drops', CRUMB, { pos: [-0.5 + SL, 1.0, -1.5], box: [1.5, 1.6, 3], n: 160, dir: [1, 0.6, 0.2], spread: 0.6, speed: [3, 6], seed: 80 });
  fx.burst('dirt', CRUMB, { pos: [-4.4 + SL, BED + 1.2, -0.6], box: [5, 1.5, 0.8], n: 120, dir: [0.4, 1, 0.2], spread: 0.9, speed: [2, 4.5], floor: BED, life: [0.6, 1.0], seed: 81 });
  fx.burst('drops', CRUMB1 + 0.2, { pos: [1.1, PND, -0.95], n: 70, dir: [0, 1, 0.3], spread: 0.7, speed: [2, 4], seed: 83 });   // Gary hits the pond
  fx.burst('drops', t.pour + 0.5, { pos: [1.1, PND, -0.95], n: 40, dir: [0, 1, 0.3], spread: 0.6, speed: [1.5, 3], seed: 84 });   // …and surfaces
  fx.burst('dust', CRUMB + 0.1, { pos: [-4.4 + SL, BED + 0.6, -0.4], box: [5, 0.6, 0.4], n: 12, speed: [0.4, 1.2], spread: 1.3, size: [0.5, 0.9], seed: 82 });
  for (let i = 0; i < S.damCols.length; i++) { const tk = COL0 + i * COLDT + COLDUR; const c = S.damCols[i]; fx.burst('dust', tk, { pos: [(c.x0 + c.x1) / 2, BED + 0.1, 0.4], box: [c.x1 - c.x0, 0.1, 0.3], n: 4, speed: [0.4, 0.9], spread: 1.2, size: [0.3, 0.5], life: [0.4, 0.6], seed: 90 + i }); }
  fx.burst('drops', FILL1, { pos: [G.heel - 0.3, LAKE - 0.2, -1.0], box: [0.6, 0.6, 3], n: 180, dir: [-0.4, 1, 0.3], spread: 0.6, speed: [4, 8], seed: 110 });
  fx.burst('mist', FILL1, { pos: [G.heel - 0.4, LAKE + 0.3, -0.8], box: [0.8, 0.5, 2], n: 12, speed: [0.5, 1.5], spread: 1.2, size: [0.5, 1.0], seed: 111 });
  fx.stream('mist', t.concreteH, PIPE1, { pos: [-7.6, G.crest + 0.3, -1.6], box: [1.2, 0.2, 2.6], rate: 14, dir: [0.15, 1, 0], spread: 0.25, speed: [0.8, 1.4], size: [0.35, 0.6], grow: 2.4, alpha: 0.28, seed: 112 });   // steam off the crest
  fx.stream('smoke', SIT + 0.1, LEAP + 0.6, { pos: [-0.25, -0.2, -0.75], box: [0.3, 0.1, 0.2], rate: 14, dir: [0, 1, 0], spread: 0.3, speed: [0.4, 0.9], size: [0.18, 0.32], seed: 113 });
  fx.stream('rain', RAIN0, RAIN1, { pos: [-6, 16, -2.6], box: [26, 0.5, 6], rate: 900, dir: [0.12, -1, 0], spread: 0.02, speed: [9, 11], life: [1.4, 1.8], seed: 115 });
  fx.stream('drops', OVER + 0.3, t.spillway + 0.4, { pos: [G.toe + 0.2, BED + 0.4, -3.2], box: [0.6, 0.3, 6], rate: 160, dir: [1, 0.7, 0], spread: 0.5, speed: [2, 4], size: [0.03, 0.06], seed: 116 });
  fx.stream('mist', OVER + 0.3, t.spillway + 0.4, { pos: [G.toe + 0.6, BED + 0.5, -3.0], box: [0.8, 0.3, 6], rate: 14, speed: [0.4, 1.0], spread: 1.2, size: [0.5, 1.0], seed: 117 });
  fx.stream('drops', t.spillway + 0.3, END, { pos: [G.toe + 0.55, BED + 0.9, -0.95], box: [0.3, 0.2, 1.6], rate: 50, dir: [1, 0.9, 0], spread: 0.35, speed: [2, 3.2], size: [0.03, 0.05], floor: PND, seed: 118 });
  fx.burst('drops', SPLASH, { pos: [2.5, PND, -1.0], n: 110, dir: [0, 1, 0.3], spread: 0.8, speed: [2.5, 5], seed: 119 });
  fx.stream('drops', SPIT, SPIT + 0.6, { pos: [PW.turb[0] + 0.3, 0.3, PW.z0 + 0.5], dir: [0, 0.4, 1], spread: 0.4, speed: [2, 3.5], rate: 80, floor: PND, seed: 120 });
  fx.burst('drops', SPLAT, { pos: [3.9, PND, -1.2], n: 60, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 3.5], seed: 121 });
  for (let k = 0; k < 6; k++) fx.burst('spark', t.turbines + 0.2 + k * 0.18, { pos: [lerp(D.pylon[0], 24, k / 6), 6.0 - 1.4 * Math.sin(PI * k / 6), D.pylon[1]], n: 10, dir: [0, 1, 0.4], spread: 1.1, speed: [1, 2.5], seed: 122 + k });
  for (let k = 0; k < 6; k++) fx.burst('drops', t.salmon - 0.2 + k * 0.32, { pos: [0.3 + (k % 3) * 0.5, PND, -0.7 - (k % 2) * 0.6], n: 12, dir: [0, 1, 0.2], spread: 0.5, speed: [1.2, 2.4], seed: 130 + k });
  fx.burst('drops', SLAP, { pos: [0.9, 1.0, -2.6], n: 30, dir: [0, 1, 0.5], spread: 0.8, speed: [1.5, 3], seed: 140 });
  fx.burst('drops', SLAP + 0.5, { pos: [0.9, PND, -1.4], n: 70, dir: [0, 1, 0.3], spread: 0.8, speed: [2, 4], seed: 141 });
  for (let k = 0; k < 8; k++) fx.burst('drops', DRY1 - 0.3 + k * 0.08, { pos: [-22 + k * 1.6, 1.5 + (k % 3) * 0.6, -4.3], box: [1.2, 0.2, 1.2], n: 10, dir: [0, -1, 0], spread: 0.3, speed: [0.3, 0.8], floor: 0, size: [0.03, 0.05], seed: 150 + k });
  fx.burst('dust', t.road, { pos: [(G.heel + G.crestX) / 2, G.crest + 0.3, -2.5], box: [1.2, 0.3, 6], n: 10, speed: [0.3, 0.8], spread: 1.2, size: [0.4, 0.7], seed: 160 });
  fx.burst('dust', t.visitor, { pos: [D.visitor.x, 0.3, D.visitor.z + 0.8], box: [2.4, 0.3, 0.4], n: 8, speed: [0.3, 0.8], spread: 1.2, size: [0.4, 0.7], seed: 161 });
  fx.burst('dust', t.gift, { pos: [D.shop.x, 0.2, D.shop.z + 0.4], box: [1.6, 0.2, 0.3], n: 6, speed: [0.3, 0.8], spread: 1.2, size: [0.3, 0.6], seed: 162 });
  fx.burst('confetti', t.end, { pos: [-4, 9.8, -1.5], box: [8, 0.5, 2], n: 300, dir: [0, 1, 0.3], spread: 0.8, speed: [4, 7], size: [0.12, 0.2], seed: 170 });
  fx.burst('drops', t.coolE, { pos: [D.thermo[0], 2.12, D.thermo[1] + 0.12], n: 30, dir: [0, 1, 0.3], spread: 0.7, speed: [1.2, 2.6], color: 0xe8231c, size: [0.03, 0.05], seed: 173 });
  fx.burst('confetti', t.end + 0.1, { pos: [8, 3.2, -1.2], box: [9, 0.5, 2], n: 360, dir: [0, 1, 0.3], spread: 0.8, speed: [4.5, 7.5], size: [0.12, 0.2], seed: 171 });
  fx.burst('drops', CRUMB + 0.6, { pos: [BVX, 0.3, -1.1], box: [0.6, 0.3, 1.8], n: 80, dir: [1, 1, 0.2], spread: 0.6, speed: [2, 4], seed: 172 });   // the flood pours over the beaver's dam (it holds)
  fx.stream('bill', t.n49 + 0.1, t.illegal, { pos: [7.5, 5.5, -2.0], box: [7, 0.4, 2.6], rate: 110, dir: [0, -1, 0], spread: 0.4, speed: [0.5, 1.4], life: [3.4, 4.2], seed: 172 });
  for (let k = 0; k < 4; k++) fx.burst('drops', t.coolE - 0.4 + k * 0.4, { pos: [FIN[0] + (k % 2 ? 0.15 : -0.15), LOW + 1.1, FIN[1] + 0.2], n: 3, dir: [k % 2 ? 1 : -1, 0.5, 0.4], spread: 0.4, speed: [0.6, 1.1], size: [0.025, 0.04], seed: 180 + k });

  // ---------------------------------------------------------------- the camera: ONE continuous take, framed on the words
  const Fr = [], F = (tt, pos, look, fov = 40, pass = false) => Fr.push({ t: tt, pos, look, fov, pass });
  const Fk = (tt, pos, look, fov = 40, until) => Fr.push({ t: tt, pos, look, fov, keep: true, until });
  // look points sit ~1 m below a standing toon's head so faces stay above the one-word caption (52 %)
  F(0, [8.7, 1.8, 8.6], [8.7, 0.5, -2.6], 48);                            // FIX hook: held pool + thermometer both in, slow push
  Fk(t.closed - 0.1, [9.3, 1.6, 7.0], [9.4, 0.5, -2.6], 42, t.shove + 0.15);
  Fk(t.congrats - 0.05, [-1.9, 1.9, 8.6], [-2.2, 0.0, -1.2], 42);
  Fk(t.six - 0.15, [-2.45, 1.3, 9.8], [-2.45, 0.0, -0.8], 50);
  Fk(W('congrats', 'taking') - 0.2, [-1.15, 1.15, 7.6], [-0.8, -0.1, -0.8], 42, t.notes + 0.7);   // the beaver + its card; also holds the hop into the pool          // FIX: aim lower, beaver face off the caption
    F(t.floats + 0.4, [-0.3, 1.7, 8.4], [-0.4, 0.15, -1.3], 42, true);         // FIX lint: earlier, wider pass
  Fk(t.flip + 0.3, [4.7, 1.3, 7.6], [4.9, 0.15, -1.2], 42);
  F(t.dig + 0.7, [1.4, 1.1, 12.0], [1.2, -1.5, -0.6], 46, true);
  F(t.diversion, [-5.6, 1.1, 12.0], [-5.8, -1.5, -0.6], 46, true);
  Fk(t.four - 0.25, [-12.2, 2.3, 8.6], [-12.4, 1.6, -3.0], 42);
  F(t.flushed + 0.35, [-10.6, 1.3, 9.4], [-5.6, -2.5, -0.4], 46, true);
  Fk(t.dirt - 0.05, [-2.4, 1.9, 13.5], [-3.2, 0.5, -1.0], 46);            // FIX: one dirt+leak frame (jet in), no STOP at piping
  Fk(t.finger - 0.1, [-1.3, 0.8, 5.8], [-1.45, -0.05, -0.8], 40);
  Fk(W('piping', 'now', 2), [-2.85, 2.1, 9.0], [-2.85, 1.6, -0.8], 46, POPC + 0.6);      // FIX: plug + landing in one frame for the cork pop
  Fk(t.bedrock, [-3.3, -1.0, 13.8], [-3.2, -1.0, -0.4], 46, W('cutoff', 'wall', 2) + 0.3);  // FIX: hold the wall through its TERM
  Fk(t.oneC + 0.25, [2.4, 0.55, 11.2], [5.8, -0.5, -0.8], 34);
  Fk(t.downstream - 0.3, [-1.6, 1.4, 15.5], [-1.8, -0.4, -1.2], 46, W('push', 'included') + 0.5);
  Fk(t.n660 - 0.2, [-4.3, 3.3, 20.5], [-4.3, 2.6, -1.5], 46);             // FIX: a touch wider: crest + both 660 arrows in
  Fk(t.bully - 0.6, [-3.4, 4.2, 20.0], [-3.6, 3.7, -1.5], 46);
  F(t.hot, [-2.4, 3.6, 16.5], [-2.6, 3.0, -1.0], 46);                     // FIX: Gary + egg in the hot frame
  Fk(t.sat - 0.15, [-0.2, 1.0, 6.4], [-0.25, 0.0, -0.9], 40, LEAP + 0.7);  // FIX: leap stays in frame
  Fk(t.inside, [-3.7, 4.3, 18.5], [-3.8, 4.1, -1.0], 46);                 // FIX: whole dam (crest..toe) for cooling pipes
  Fk(t.week, [-4.4, 5.8, 21.5], [-4.8, 4.9, -2.0], 46, t.top);
  Fk(t.exit - 0.2, [-6.0, 10.0, 9.0], [-6.9, 9.4, -1.0], 42);
  F(SLD0 + 0.6, [-3.0, 6.0, 9.5], [-3.6, 4.4, -1.0], 42, true);
  Fk(t.rent - 0.25, [6.1, 2.4, 6.3], [6.3, 0.5, -1.0], 40);                       // FIX: beaver + RENT DUE + the pool, not two edges
  Fk(t.penstocks - 0.2, [0.6, 1.6, 13.6], [0.4, -0.1, -1.6], 46);  // FIX: penstock through the dam + turbine for the TERM
  Fk(t.cycle - 0.25, [3.0, 2.0, 5.6], [3.1, 0.75, -3.0], 40, SPIT + 0.2);   // FIX: d 8.7 not 6.2; turbine at ~42 %
  Fk(t.furious, [4.6, 1.4, 6.6], [3.0, 0.3, -1.6], 40);                     // FIX: salmon + ladder foot
  Fk(W('fish', 'staircase'), [3.8, 2.4, 7.6], [-1.6, 2.8, -3.4], 46);
  Fk(t.cantF - 0.3, [1.8, 2.2, 9.0], [0.6, 1.3, -2.8], 36, SLAP + 0.25);
F(t.town + 0.1, [-4.6, 4.4, 14.0], [-9.0, 2.4, -3.8], 40, true);
  Fk(W('town', 'happened'), [-10.5, 5.6, 12.5], [-17.0, 2.2, -4.0], 44);     // FIX: yaw ~21 deg, not 33
  Fk(t.only + 0.2, [-9.4, 4.8, 12.8], [-12.9, 1.2, -4.0], 44);
Fk(t.sells - 0.15, [-9.7, 2.9, 7.4], [-10.8, 1.4, -4.0], 40, t.lakefront + 0.35);   // push in: the beaver's LAKEFRONT sign
  F(t.road + 0.3, [-4.0, 11.5, 14.0], [-7.0, 8.8, -3.0], 46, true);
  F(t.gift + 0.15, [3.0, 4.6, 13.0], [5.5, 0.7, -3.0], 46, true);
  Fk(t.swimmingF, [8.0, 2.2, 9.9], [8.0, -0.35, -2.8], 44, t.damE);     // FIX: the bank cluster in one 5.6 m frame
  F(t.coolE + 0.6, [9.6, 1.7, 7.4], [9.2, -0.6, -1.6], 42, true);
  Fk(t.money, [9.0, 2.0, 10.4], [8.4, -0.6, -2.0], 46);
  Fk(t.bestseller - 0.2, [7.0, 1.5, 5.2], [6.7, 0.85, -2.8], 40);
  F(t.closedE - 0.1, [8.6, 1.4, 7.8], [8.5, -0.3, -2.2], 42);
  Fr.push({ t: END, pos: [8.6, 1.36, 7.45], look: [8.5, -0.3, -2.2], fov: 42, stop: true });
  planRail.verbose = true;
  const rail = makeRail(planRail(Fr));
  const hits = [[LANDK, 0.08, 0.5], [t.inF + 0.05, 0.05, 0.4], [FLOAT1 - 0.2, 0.05, 0.4], ...DUMPS.map((d) => [d, 0.1, 0.5]), [POPC, 0.12, 0.5], [SLAM, 0.22, 0.8],
    [CRUMB, 0.18, 0.8], ...S.damCols.map((_, i) => [COL0 + i * COLDT + COLDUR, 0.07, 0.4]), [FILL1, 0.2, 0.8], [LEAP, 0.06, 0.4], [OVER + 0.3, 0.08, 0.6], [SPLASH, 0.1, 0.5],
    [t.cycle, 0.08, 0.8], [SLAP, 0.08, 0.4], [t.road, 0.04, 0.4], [t.visitor, 0.04, 0.4], [t.gift, 0.04, 0.4], [t.closedE, 0.05, 0.5]];

  // ---------------------------------------------------------------- helpers
  const hop = (tt, a, b, p0, p1, h) => { const u = clamp((tt - a) / (b - a)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) + 4 * h * u * (1 - u), lerp(p0[2], p1[2], u)]; };
  const hide = (o) => (o.root.visible = false);
  const show = (o, on) => (o.visible = !!on);
  const popIn = (o, tt, t0, s = 1) => { o.visible = tt > t0; if (o.visible) o.scale.setScalar(Math.max(0.001, s * pop(tt, t0))); };
  const sun0 = S.sun.intensity, hemi0 = S.hemi.intensity, _pq = new THREE.Quaternion(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), boreMap = S.bore.material.map, exp0 = studio.renderer.toneMappingExposure;

  function update(tt) {
    // ---- the cut face: the diversion tunnel (dug once, from the outlet back to the inlet)
    const digU = 1 - smooth(u01(tt, DIG0, DIG1)), dug = tt > DIG0;
    S.setHoles(dug ? tunnelHoles(digU) : []);
    S.bore.visible = dug; const fp = S.tCurve.getPointAt(digU);
    const plugged = tt > PLUG + 0.6; if (S.bore.material.map !== (plugged ? null : boreMap)) { S.bore.material.map = plugged ? null : boreMap; S.bore.material.needsUpdate = true; }
    S.bore.material.color.setHex(plugged ? 0x5a4334 : 0xffffff); if (plugged) S.bore.material.color.lerp(new THREE.Color(0x9d9a93), smooth(u01(tt, COL0, COL0 + 1.2))); S.digClip.normal.set(1, 0, 0); S.digClip.constant = -(fp.x - 0.05);
    const tw = tt < DIG1 ? 0 : smooth(u01(tt, DIG1, DIG1 + 0.5)), drain = smooth(u01(tt, PLUG, PLUG + 1.6)) * (1 - tWaterUplug) + (tt > PLUG ? tWaterUplug : 0);
    const st0 = Math.floor((S.tWaterIdx * drain) / 3) * 3, cnt = Math.floor((S.tWaterIdx * tw) / 3) * 3 - st0;
    S.tWater.visible = cnt > 3 && drain < 0.99; S.tWater.geometry.setDrawRange(st0, Math.max(0, cnt));
    tunFlow.update(tt, smooth(u01(tt, DIG1, DIG1 + 0.4)) * (1 - smooth(u01(tt, PLUG - 0.2, PLUG + 0.1))));
    S.mouths[0].visible = digU < 0.02 && tt < FILL0; S.mouths[1].visible = dug;
    S.plug.visible = tt > PLUG - 0.25; S.plug.scale.setScalar(Math.max(0.001, pop(tt, PLUG - 0.25)));
    S.portals.forEach((p, i) => { popIn(p, tt, t.four - 0.15 + i * 0.09); if (lakeLevel(tt) > 2.4 || tt > FILL0) p.visible = false; });

    // ---- water
    const L = lakeLevel(tt), Ls = siteLevel(tt), [x1s, x0p] = damLine(tt);
    water.far.set(-60, INLET, L, tt); water.site.set(INLET, x1s, Ls, tt); water.pond.set(x0p, BVX - 0.45, pondLevel(tt), tt); water.low.set(BVX + 0.45, 60, LOW, tt);
    const seeTown = smooth(u01(tt, t.also - 0.3, t.drowned)) * (1 - smooth(u01(tt, WET1, WET1 + 0.6)));
    for (const k of ['far', 'site']) water[k].front.opacity = 0.7 - 0.3 * seeTown;
    creekFlow.update(tt, smooth(u01(tt, t.cant - 0.2, t.cant + 0.2)) * (1 - smooth(u01(tt, t.dig, t.dig + 0.4))));
    S.setRing(L + 0.05, tt > DRY0 && tt < WET1 + 0.5 ? FULL : -10);

    // ---- the hook: the thermometer pegs at 104, the CLOSED sign slaps onto the gate; the beaver's rock
    S.mercury.scale.y = lerp(0.35, 1.3, easeOutBack(u01(tt, t.n104 - 0.1, t.n104 + 0.35), 2.2)) * (tt > t.end ? 0.8 + 0.25 * easeOutBack(u01(tt, t.coolE - 0.15, t.coolE + 0.25), 2.2) : 1);
    S.closed.visible = tt > t.closed - 0.2; S.closed.position.y = 1.62 + drop(tt, t.closed - 0.2, 2.2, 0.18); S.closed.rotation.z = wobble(tt, t.closed - 0.02, 0.12, 20, 6);
    show(rock, tt < t.dig);
    forSale.visible = tt > t.lakefront - 0.4 && lakeLevel(tt) < 2.6; forSale.scale.setScalar(Math.max(0.001, pop(tt, t.lakefront - 0.4))); forSale.position.y = 1.84 - 0.12 * smooth(u01(tt, t.lakefront - 0.4, t.lakefront + 0.1));
    // ---- the kiddie pool, the yardstick, the flip-flop
    const kpp = kpPos(tt); kp.g.position.set(...kpp);
    const [ksx, ksy] = squash(tt, LANDK, 0.35); kp.g.scale.set(ksx, ksy * (tt > t.closedE ? lerp(1, 0.25, smooth(u01(tt, t.closedE + 0.1, t.closedE + 0.9))) : 1), ksx);
    kp.g.rotation.set(tt > CRUMB && tt < KPOVER ? 0.5 * Math.sin(PI * u01(tt, CRUMB, KPOVER)) : tt < THROW ? 0.1 + 0.04 * Math.sin(tt * 3) : tt < LANDK ? 4 * u01(tt, THROW, LANDK) * (1 - u01(tt, THROW, LANDK)) : 0.04 * Math.sin(tt * 2.3), tt > FLOAT0 ? 2.2 * smooth(u01(tt, FLOAT0, FLOAT1)) + 3 * smooth(u01(tt, CRUMB, KPOVER)) : 0, tt < LANDK ? 0 : 0.04 * Math.sin(tt * 1.9));
    kp.setWater(tt > LANDK ? 0.25 : 0);
    popIn(stick, tt, t.six - 0.2); if (stick.visible && tt > t.lifts) stick.visible = false;
    show(flipflop, tt > t.lost - 0.1 && tt < t.dig + 1.5); if (flipflop.visible) { flipflop.position.set(kpp[0] + 1.25, pondLevel(tt) + 0.02, kpp[2] + 0.75); flipflop.rotation.y = tt * 0.8; flipflop.scale.setScalar(1.3 * pop(tt, t.lost - 0.1)); }

    // ---- the earth dam: three loads of dirt, the leak (piping), the cutoff wall, the shove, the crumble
    const eK = tt < CRUMB ? eK3(tt) : lerp(1, 0.04, smooth(u01(tt, CRUMB, CRUMB1)));
    S.earth.visible = eK > 0.01 && tt < COL0 + 0.6; S.earth.scale.set(1, Math.max(0.01, eK), 1); S.earth.position.set(slideX(tt), BED * (1 - Math.max(0.01, eK)), 0);
    S.earth.rotation.z = tt > SLIDE0 && tt < CRUMB ? -0.05 * Math.sin(PI * u01(tt, SLIDE0, SLIDE1)) : tt > t.garyP2 - 0.2 && tt < POPC ? 0.006 * Math.sin(tt * 45) : 0;
    const pipeK = smooth(u01(tt, t.sneaks, JET)), cutK = tt > SLAM + 0.1 ? pipeU : 1;
    S.pipeWater.position.z = 0.13; S.pipeDark.visible = S.pipeWater.visible = pipeK > 0.01 && tt < SLIDE0;
    S.pipeDark.geometry.setDrawRange(0, Math.floor((S.pipeIdx * pipeK) / 3) * 3); S.pipeWater.geometry.setDrawRange(0, Math.floor((S.pipeIdx * Math.min(pipeK, cutK)) / 3) * 3);
    const cutDown = smooth(u01(tt, SLAM, t.bedrock + 0.1));
    const above = tt < SLIDE0;
    S.cutoff.visible = tt > SLAM; S.cutoff.scale.y = Math.max(0.001, above ? cutDown * cutoffH : BED - D.cutoff.y1);
    S.cutoff.position.set(S.cutoff.position.x, above ? BED + E.h : tt > COL0 ? BED - 0.32 : BED, 0.022); if (tt > COL0) S.cutoff.scale.y = BED - 0.32 - D.cutoff.y1;
    S.cutoffTop.visible = tt > t.drive - 0.3 && tt < CRUMB + 0.2;
    S.cutoffTop.position.set((D.cutoff.x0 + D.cutoff.x1) / 2 + slideX(tt), BED + E.h + 0.25 + (tt < SLAM ? 9 * (1 - u01(tt, t.drive - 0.3, SLAM)) ** 2 : 0) - (tt > CRUMB ? 2 * u01(tt, CRUMB, CRUMB + 0.2) : 0), -D.CW / 2);
    pushArrows.update(tt + slideX(tt) * 0.4, smooth(u01(tt, t.deeper - 0.1, t.shoves)) * (1 - smooth(u01(tt, SLIDE1, SLIDE1 + 0.3))));

    // ---- the gravity dam: columns rise in lifts (heel → toe), the 660 ft line, the lake slams it; heat + cooling pipes
    S.damCols.forEach((c, i) => {
      const a = COL0 + i * COLDT, f = u01(tt, a, a + COLDUR), k = (Math.floor(Math.min(f, 0.999) * 3) + smooth(clamp(((f * 3) % 1) * 1.7))) / 3;
      const kk = f >= 1 ? 1 : k, y0 = BED - 0.3; c.g.visible = tt > a; c.g.scale.y = Math.max(0.001, kk); c.g.position.y = y0 * (1 - Math.max(0.001, kk));
    });
    const zip = easeOutBack(u01(tt, t.n660 - 0.15, t.n660 + 0.3), 1.3);
    dim.visible = tt > t.n660 - 0.15 && tt < t.gravity; dimLine.scale.x = Math.max(0.001, DIML * zip); dimEnd.position.x = -DIML * zip;   // Gary's tape zips out to the heel
    tapeCase.visible = tt > t.n660 - 0.4 && tt < t.gravity + 0.2;
    bullyArrows.update(tt, smooth(u01(tt, FILL1 - 0.6, FILL1)) * (1 - smooth(u01(tt, FILL1 + 0.4, FILL1 + 0.8))));
    const heat = smooth(u01(tt, t.concreteH - 0.1, t.hot + 0.3)) * (1 - smooth(u01(tt, PIPE0, PIPE1)));
    S.secM.emissiveIntensity = 0.85 * heat; S.sideM.emissiveIntensity = 0.65 * heat; S.secM.color.setRGB(1 - 0.5 * heat, 1 - 0.62 * heat, 1 - 0.72 * heat); S.sideM.color.setRGB(0.72 * (1 - 0.5 * heat), 0.71 * (1 - 0.62 * heat), 0.67 * (1 - 0.72 * heat));
    const pipeShrink = 1 - 0.65 * smooth(u01(tt, t.cooling + 0.8, t.cooling + 1.8)), pipeOff = smooth(u01(tt, t.cooling + 0.8, t.cooling + 1.8));
    S.coolCore.material.emissiveIntensity = 0.6 * (1 - pipeOff); S.coolCore.material.color.setHex(0x6fd6ff).lerp(new THREE.Color(0x8f8b84), pipeOff); S.coolRing.material.color.setHex(0x44474c).lerp(new THREE.Color(0x77736c), pipeOff);   // after their beat the pipes settle into the concrete (no polka dots)
    S.setPipes((x, y) => (tt < PIPE0 ? 0 : pipeShrink * pop(tt, PIPE0 + ((y - BED) / (G.crest - BED)) * (PIPE1 - PIPE0 - 0.4) + ((x - G.heel) / 9) * 0.15)));
    if (tt > PIPE1 - 0.6 && tt < t.rains) { const c = new THREE.Color(); S.pipeSpots.forEach(([x, y], i) => { const w = 0.5 + 0.5 * Math.sin(x * 2.2 - y * 0.6 - tt * 9); S.coolCore.setColorAt(i, c.setRGB(0.55 + 0.45 * w, 0.75 + 0.25 * w, 1)); }); S.coolCore.instanceColor.needsUpdate = true; }
    show(egg, tt > t.hot - 0.1 && tt < t.rains); if (egg.visible) { egg.position.set(-1.05, slopeY(-1.05) - 0.38, 0.03); egg.scale.setScalar(pop(tt, t.hot - 0.1) * (1 + 0.4 * smooth(u01(tt, t.hot, t.cool)))); }
    popIn(coolBoard, tt, t.n125 - 0.1); if (tt > t.rains - 0.4) coolBoard.visible = false; coolSign.material.map = tt > t.cooling ? coolTex[1] : coolTex[0];

    // ---- rain, overtopping, the spillway (+ EXIT), the chute that keeps flowing
    const storm = smooth(u01(tt, RAIN0 - 0.2, t.rains + 0.2)) * (1 - smooth(u01(tt, RAIN1 - 0.2, RAIN1 + 0.6)));
    S.storm.material.opacity = 0.7 * storm; clouds.forEach((c) => (c.material.opacity = 0.85 * storm)); S.hemi.color.setHex(0xe8f2ff).lerp(new THREE.Color(0x9aa6b4), storm);
    const over = smooth(u01(tt, OVER, OVER + 0.4)) * (1 - smooth(u01(tt, t.spillway - 0.1, t.spillway + 0.3)));
    S.sheetAll.m.visible = over > 0.01; S.sheetAll.m.material.opacity = 0.85 * over; S.sheetAll.t2.offset.x = -tt * 1.3;
    const spOn = tt > t.spillway - 0.12; S.spill.visible = spOn;
    for (const o of [S.chuteBack, S.ogee, S.bucket]) o.scale.setScalar(Math.max(0.001, pop(tt, t.spillway - 0.12)));
    popIn(S.exitSign, tt, t.exit - 0.1);
    S.sheetChute.m.visible = tt > t.spillway + 0.1; S.sheetChute.m.material.opacity = 0.9 * smooth(u01(tt, t.spillway + 0.1, t.spillway + 0.5)); S.sheetChute.t2.offset.x = -tt * 1.6;
    S.sun.intensity = sun0 * (1 - 0.7 * storm); S.hemi.intensity = hemi0 * (1 - 0.45 * storm); studio.renderer.toneMappingExposure = exp0 * (1 - 0.2 * storm);

    // ---- power: the penstock draws in the dam's section, the powerhouse pops, the turbine spins, the wires spark
    const penK = smooth(u01(tt, t.send, PH + 0.3));
    S.penstock.visible = penK > 0.01; S.penOuter.geometry.setDrawRange(0, Math.floor((S.penIdx * penK) / 3) * 3); S.penInner.geometry.setDrawRange(0, Math.floor((S.penIdx * penK) / 3) * 3);
    S.rack.scale.setScalar(Math.max(0.001, pop(tt, t.send)));
    penFlow.update(tt, smooth(u01(tt, PH, PH + 0.4)));
    popIn(S.power, tt, PH);
    const spinA = tt < t.spin ? 0 : (tt - t.spin) ** 1.4 * 7; S.rotor.rotation.z = -spinA; S.swirl.material.opacity = 0.5 * smooth(u01(tt, t.spin, t.spin + 0.5));
    S.wireGlow.opacity = tt > t.turbines ? 0.25 + 0.2 * Math.sin(tt * 9) : 0;
    S.winMats.forEach((m) => (m.emissiveIntensity = 0.35 * smooth(u01(tt, t.turbines, t.turbines + 0.6))));

    // ---- the fish ladder (bottom → top)
    S.ladder.forEach((st, i) => popIn(st.g, tt, lerp(LAD0, LAD1 - 0.3, i / (S.ladder.length - 1))));

    // ---- finishing: road (+ cars), visitor center, gift shop, NO SWIMMING
    popIn(S.road, tt, t.road - 0.12);
    S.crestCars.forEach((c, i) => { const ph = ((((tt - t.road) * 1.4 + i * 3.1) % 6.4) + 6.4) % 6.4; c.g.visible = tt > t.road + 0.25; c.g.position.set(i ? G.heel + 0.35 : G.crestX - 0.35, G.crest + 0.06, i ? -6.3 + ph : -ph); c.g.rotation.y = i ? 0 : PI; });
    popIn(S.visitor, tt, W('finish', 'center') + 0.25); popIn(S.shop, tt, t.gift - 0.1); popIn(S.noSwim, tt, t.sign - 0.1);
    S.noSwim.rotation.z = wobble(tt, t.illegal, 0.12, 18, 5);

    garyAt(tt); beaverAt(tt); salmonAt(tt);

    // ---- camera (one take) + impact shake; the sun follows what we look at
    const cam = rail.at(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    const k = shake(tt, hits); studio.camera.position.x += k.x; studio.camera.position.y += k.y; studio.camera.rotation.z += k.r;
    S.aimSun(cam.look[0], cam.look[1], Math.max(7, Math.hypot(cam.pos[0] - cam.look[0], cam.pos[2] - cam.look[2]) * 0.6));
    if (beaver.card.visible) { // the card faces the lens and sits above the beaver's head (in the hand's own frame it drifted onto its face)
      beaver.root.updateMatrixWorld(true); beaver.head.getWorldPosition(_v3); _v3.y += 0.62; _v3.addScaledVector(_v4.subVectors(studio.camera.position, _v3).normalize(), 0.25);
      beaver.card.parent.getWorldQuaternion(_pq); beaver.card.quaternion.copy(_pq.invert().multiply(studio.camera.quaternion)); beaver.card.position.copy(beaver.card.parent.worldToLocal(_v3)); }
    fx.update(tt, studio.camera);
  }

  // ---------------------------------------------------------------- Gary (never teleports on screen)
  const RUNZ = -2.6, INLET_EDGE = [INLET + 0.95, 0, -2.35];
  const ladderBottom = S.ladder[0];
  function garyAt(tt) {
    const g = gary; g.root.visible = true; dizzy.update(tt, 0, [0, 0, 0]);
    const hat = tt > t.dig - 0.1;
    garyShades.visible = !hat;
    const base = { t: tt, eyes: 'open', mouth: 'smile', brows: 0, noHat: !hat, hatLift: hat ? 3 * (1 - smooth(u01(tt, t.dig - 0.1, t.dig + 0.3))) : 0 };
    // the hook: melting at the locked gate, the pool held over his head; heaves it on "shove"
    if (tt < THROW + 0.35) { const heave = smooth(u01(tt, THROW - 0.3, THROW + 0.1));
      const peek = tt > t.closed - 0.05 && tt < t.shove - 0.3, flinch = tt > t.closed - 0.05 && tt < t.closed + 0.3, hold = 1 - heave;
      return g.set({ ...base, x: 9.1, y: 0, z: -2.5, rotY: -0.2 - 0.9 * heave, lean: 0.4 * heave, eyes: flinch ? 'wide' : 'half', mouth: tt > t.closed && tt < t.shove ? 'frown' : 'o', brows: tt > t.closed ? 1 : 0.4,
        squash: flinch ? [0.94, 1.05] : [1, 1], faceTint: [0xe0483a, 0.35], look: peek ? [0.8, 0.2] : [0, 0], head: peek ? { x: 0, y: 0.6, z: 0 } : undefined,
        armR: { x: -2.9 * hold - 1.5 * heave, z: 0.3 * hold, el: 0.45 * hold }, armL: { x: -2.9 * hold - 1.5 * heave, z: 0.3 * hold, el: 0.45 * hold } }); }
    const WALK1 = t.hops - 0.3, WALKA = Math.min(t.beaver - 0.5, WALK1 - 0.5);
    if (tt < WALK1) { const u = u01(tt, THROW + 0.35, WALKA); if (u >= 1) return g.set({ ...base, x: -1.6, y: 0, z: -2.55, rotY: 0.3, eyes: tt > t.notes - 0.1 ? 'wide' : 'half', mouth: tt > t.notes - 0.1 ? 'o' : 'smile', look: [0.8, 0], faceTint: [0xe0483a, 0.3] }); return g.set({ ...base, x: lerp(9.1, -1.6, u), y: 0, z: -2.55, rotY: -PI / 2 + 0.25, walk: tt * 10, eyes: 'half', mouth: 'o', faceTint: [0xe0483a, 0.3] }); }
    // hops in, floats away happy, bonks into the beaver's dam
    const POOLSEAT = () => { const p = kpPos(tt); return [p[0], p[1] - 0.12, p[2]]; };
    if (tt < t.inF + 0.1) { const [x, y, z] = hop(tt, WALK1, t.inF + 0.1, [-1.6, 0, -2.55], POOLSEAT(), 0.9); return g.set({ ...base, x, y, z, rotY: -0.3, eyes: 'wide', mouth: 'grin', armL: { x: -2.8, z: 0.4 }, armR: { x: -2.8, z: 0.4 } }); }
    const sitPose = { legL: { x: -1.5, kn: 0.25 }, legR: { x: -1.5, kn: 0.25 } };
    if (tt < t.dig - 0.15) { const [x, y, z] = POOLSEAT(), bonk = tt > FLOAT1 - 0.25 && tt < FLOAT1 + 0.3;
      return g.set({ ...base, ...sitPose, x, y, z, rotY: 0.2 + 0.4 * Math.sin(tt * 0.9), squash: squash(tt, FLOAT1 - 0.2, 0.3), eyes: bonk ? 'wide' : 'half', mouth: bonk ? 'o' : 'grin', armL: { x: -2.2, z: 0.9, el: 1.9 }, armR: { x: -2.2, z: 0.9, el: 1.9 } }); }
    // hard hat on: out of the pool, runs upstream over the tunnel being dug, to the inlet
    if (tt < RUN0) { const [x, y, z] = hop(tt, t.dig - 0.15, RUN0, POOLSEAT(), [KP_AT_BV - 0.5, 0, RUNZ], 0.6); return g.set({ ...base, x, y, z, rotY: -PI / 2, eyes: 'wide', mouth: 'o' }); }
    if (tt < RUN1) { const u0 = u01(tt, RUN0, RUN1), u = 0.15 * smooth(u0) + 0.85 * u0; return g.set({ ...base, x: lerp(KP_AT_BV - 0.5, INLET_EDGE[0], u), y: 0, z: RUNZ, rotY: -PI / 2 + 0.2, walk: tt * 15, lean: 0.3, eyes: 'wide', mouth: 'grin' }); }
    if (tt < SUCK) { const u = smooth(u01(tt, RUN1, SUCK - 0.05)); return g.set({ ...base, x: lerp(INLET_EDGE[0], INLET + 0.6, u), y: lerp(0, BED + 0.05, u), z: lerp(RUNZ, -1.3, u), rotY: -PI / 2 + 0.6, lean: 0.4 * u, look: [-0.6, -0.8], eyes: 'open', mouth: 'smile', head: { x: 0.4, y: 0, z: 0 } }); }
    // flushed: down the inlet, through the tunnel (seen in section), out the far end, into the kiddie pool
    if (tt < OUT) { const u = u01(tt, SUCK, OUT), p = S.tCurve.getPointAt(Math.pow(u, 1.15)); dizzy.update(tt, 0, [0, 0, 0]);
      return g.set({ ...base, x: p.x, y: p.y - 0.55, z: D.tunnel.z - 0.2, rx: tt * 11, eyes: 'wide', mouth: 'scream', brows: 1, armL: { x: -2.9, z: 0.6 }, armR: { x: -2.9, z: 0.6 }, legL: { x: 0.4 }, legR: { x: -0.4 } }); }
    // shot out of the outlet, over the creek, onto the dirt pile — where the last load lands on him
    const PILE = [-4.3, BED + (E.h * 2) / 3, -1.0];
    if (tt < ONPILE) { const op = D.tunnel.path[9]; const [x, y, z] = hop(tt, OUT, ONPILE, [op[0], op[1] - 0.2, -0.5], PILE, 2.6); return g.set({ ...base, x, y, z, rx: tt * 9, eyes: 'spiral', mouth: 'scream', armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    const WADE0 = t.piping - 0.2, PLUGX = JETP.x + 0.45, DUG = Math.max(DUMPS[2] + 0.5, WADE0 - 0.6);
    if (tt < DUG) { const buried = tt > DUMPS[2] - 0.05, top = BED + E.h * eK3(tt); dizzy.update(tt, !buried ? 1 : 0, [PILE[0], PILE[1] + 1.62, PILE[2]]);
      return g.set({ ...base, x: PILE[0], y: buried ? top - 0.95 : PILE[1], z: PILE[2], rotY: 0.1, squash: squash(tt, ONPILE, 0.35), eyes: buried ? 'x' : 'spiral', mouth: 'wavy' }); }
    if (tt < t.plugs) { const u = u01(tt, DUG, t.plugs), top = BED + E.h, [x, y, z] = u < 0.25 ? hop(tt, DUG, DUG + (t.plugs - DUG) * 0.25, [PILE[0], top - 0.95, PILE[2]], [E.t1 + 0.1, top, -0.7], 1.0)
        : [lerp(E.t1 + 0.1, PLUGX, u01(u, 0.25, 1)), lerp(top, BED, u01(u, 0.25, 1)), lerp(-0.7, -0.35, u01(u, 0.25, 1))];
      return g.set({ ...base, x, y, z, rotY: u < 0.25 ? 0 : PI / 2 - 0.2, rx: u > 0.25 && u < 0.95 ? -0.5 : 0, ...(u > 0.25 && u < 0.95 ? sitPose : {}), eyes: u < 0.25 ? 'wide' : 'open', mouth: u < 0.25 ? 'o' : 'grin', brows: -0.2 }); }
    if (tt < POPC) { const reach = smooth(u01(tt, t.plugs, t.finger)), grin = tt > t.finger + 0.25, strain = tt > t.garyP2 - 0.1 ? Math.sin(tt * 40) * 0.02 : 0;
      return g.set({ ...base, x: PLUGX + strain, y: BED, z: -0.35, rotY: -PI / 2 + (grin ? 0.95 : 0.4), lean: 0.25 * reach, legL: { x: -0.4 * reach, kn: 0.6 * reach }, legR: { x: -0.1, kn: 0.4 * reach },
        armR: { x: -1.15 * reach - 0.1, z: -0.05, el: 0.05 }, armL: grin ? { x: -0.4, z: 0.9, el: 1.6 } : { x: 0, z: 0.2 }, eyes: tt > t.garyP2 ? 'wide' : grin ? 'open' : 'open', mouth: tt > t.garyP2 ? 'o' : grin ? 'grin' : 'flat', brows: tt > t.garyP2 ? 1 : 0, look: grin ? [0.5, 0] : [-0.8, -0.3], faceTint: [0xe0483a, 0.4 * u01(tt, t.garyP2, POPC)] }); }
    const TOPX = -3.92, TOPY = BED + E.h, LANDC = POPC + 0.7;
    if (tt < LANDC) { const [x, y, z] = hop(tt, POPC, LANDC, [PLUGX, BED + 0.2, -0.35], [TOPX, TOPY, -1.0], 1.6); return g.set({ ...base, x, y, z, rx: -(tt - POPC) * 10, eyes: 'spiral', mouth: 'scream', armL: { x: -2.9, z: 0.5 }, armR: { x: -2.9, z: 0.5 }, legL: { x: 0.5 }, legR: { x: -0.5 } }); }
    // on the dirt dam's top: the cutoff wall slams down beside him (he jumps); then rides the dam as the lake shoves it; it crumbles
    if (tt < CRUMB) { const s = slideX(tt), jump = tt > SLAM && tt < SLAM + 0.45 ? 0.5 * Math.sin(PI * u01(tt, SLAM, SLAM + 0.45)) : 0, surf = tt > SLIDE0;
      dizzy.update(tt, tt < LANDC + 1.0 ? 1 : 0, [TOPX + s, TOPY + 1.62, -1.0]);
      return g.set({ ...base, x: TOPX + s, y: TOPY + jump, z: -1.0, rotY: surf ? 0.5 : 0.25, squash: squash(tt, LANDC, 0.35), lean: surf ? 0.25 : 0, eyes: tt < LANDC + 1.0 ? 'spiral' : surf || jump > 0 ? 'wide' : 'open', mouth: surf ? 'scream' : jump > 0 ? 'o' : 'smile', brows: surf ? 1 : 0,
        armL: surf ? { x: -0.3, z: 1.4 + 0.2 * Math.sin(tt * 18) } : jump > 0 ? { x: -2.8, z: 0.4 } : undefined, armR: surf ? { x: -0.3, z: 1.4 + 0.2 * Math.sin(tt * 18 + 1) } : jump > 0 ? { x: -2.8, z: 0.4 } : undefined, hatLift: jump > 0.2 ? 0.6 : base.hatLift }); }
    const MUD = [1.1, BED, -0.95], UNDER = t.pour + 0.5;   // the crumble dumps him in the pond; he surfaces once the concrete is going in
    if (tt < CRUMB1 + 0.2) { const [x, y, z] = hop(tt, CRUMB, CRUMB1 + 0.2, [TOPX + SL, TOPY, -1.0], [MUD[0], PND - 1.6, MUD[2]], 0.9); return g.set({ ...base, x, y, z, rx: (tt - CRUMB) * 6, eyes: 'wide', mouth: 'scream', armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    if (tt < UNDER) return hide(g);
    if (tt < UNDER + 0.35) { const u = u01(tt, UNDER, UNDER + 0.35); return g.set({ ...base, x: MUD[0], y: lerp(PND - 1.4, BED, smooth(u)), z: MUD[2], rotY: -0.3, eyes: 'wide', mouth: 'o', squash: [0.9, 1.1] }); }
    // the concrete rises next to him; he backs off; the lake slams it; then the heat: he sits on the toe… medium rare… cooling pipes
    const TOE = [0.35, BED, -0.85];
    // "too heavy to bully": Gary shoulder-charges the toe of the dam and bounces off (it doesn't budge)
    if (tt > t.bully - 0.5 && tt < t.hot - 0.2) { const ch = u01(tt, t.bully - 0.5, t.bully - 0.05), back = u01(tt, t.bully - 0.05, t.bully + 0.45), home = u01(tt, t.bully + 0.6, t.hot - 0.2);
      if (ch < 1) return g.set({ ...base, x: lerp(TOE[0] + 0.7, 0.05, ch * ch), y: BED, z: TOE[2], rotY: -PI / 2 + 0.3, walk: tt * 16, lean: 0.45, eyes: 'wide', mouth: 'teeth', brows: -1, armL: { x: 0.3, z: 0.2 }, armR: { x: 0.3, z: 0.2 } });
      dizzy.update(tt, home < 1 ? 1 : 0, [lerp(1.0, TOE[0], home), BED + 1.62, TOE[2]]);
      if (back < 1) { const [x, y, z] = hop(tt, t.bully - 0.05, t.bully + 0.45, [0.05, BED, TOE[2]], [1.0, BED, TOE[2]], 0.5); return g.set({ ...base, x, y, z, rotY: -PI / 2 + 0.3, rx: -0.5 * Math.sin(PI * back), squash: [0.85, 1.1], eyes: 'x', mouth: 'o', armL: { x: -2.6, z: 0.6 }, armR: { x: -2.6, z: 0.6 } }); }
      return g.set({ ...base, x: lerp(1.0, TOE[0], home), y: BED, z: TOE[2], rotY: -0.3, walk: home > 0 && home < 1 ? tt * 8 : undefined, squash: squash(tt, t.bully + 0.45, 0.35), eyes: 'spiral', mouth: 'wavy' }); }
    if (tt < SIT) { const u = smooth(u01(tt, COL0 + 1.0, COL0 + 1.6)), back = tt > COL0 + 1.0;
      dizzy.update(tt, tt < CRUMB1 + 1.2 ? 1 : 0, [lerp(MUD[0], TOE[0], u), BED + 1.62, -0.9]);
      const hot = tt > t.hot;
      const tape = tt > t.n660 - 0.4 && tt < t.gravity + 0.2, smug = tt > t.heavy - 0.2 && tt < t.concreteH;
      return g.set({ ...base, x: lerp(MUD[0], TOE[0], u), y: BED, z: lerp(MUD[2], TOE[2], u), rotY: tape ? -0.9 : smug ? -0.25 : back ? -0.35 : 0, walk: u > 0.01 && u < 0.99 ? tt * 9 : undefined, squash: squash(tt, CRUMB1 + 0.2, 0.3), lean: tape ? 0.25 : smug ? -0.12 : 0,
        eyes: tt < CRUMB1 + 1.2 ? 'spiral' : smug ? 'half' : hot ? 'half' : 'open', mouth: smug ? 'grin' : hot ? 'o' : 'smile', brows: smug ? -0.6 : 0, faceTint: [0xe0483a, 0.3 * smooth(u01(tt, t.hot, t.hot + 0.6))],
        armR: tape ? { x: -1.3, z: -0.1, el: 0.3 } : smug ? { x: -1.25, z: -0.55, el: 1.75 } : hot ? { x: -2.2, z: 0.3, el: 1.6 + 0.3 * Math.sin(tt * 14) } : undefined,
        armL: smug ? { x: -1.15, z: -0.55, el: 1.75 } : undefined, look: tape ? [-0.9, -0.2] : tt > t.hoovers && tt < t.garyH ? [-0.8, -0.6] : [0, 0] }); }
    const SEAT = [-0.18, slopeY(-0.18) - 0.32, -0.85];
    if (tt < LEAP) { const u = smooth(u01(tt, SIT - 0.25, SIT)); return g.set({ ...base, ...sitPose, x: lerp(TOE[0], SEAT[0], u), y: lerp(BED, SEAT[1], u), z: SEAT[2], rotY: 0.1, eyes: tt > SIT + 0.15 ? 'wide' : 'half', mouth: tt > SIT + 0.15 ? 'scream' : 'smile', brows: tt > SIT + 0.15 ? 1 : 0, faceTint: [0xe0483a, 0.3 + 0.4 * u01(tt, SIT, LEAP)], hairUp: u01(tt, SIT + 0.1, LEAP) }); }
    if (tt < PIPE0 + 0.2) { const up = tt < LEAP + 0.7 ? Math.sin(PI * u01(tt, LEAP, LEAP + 0.7)) * 1.1 : 0;
      return g.set({ ...base, x: 0.55, y: BED + up, z: -0.85, rotY: -0.4, eyes: 'wide', mouth: tt < LEAP + 0.8 ? 'scream' : 'teeth', brows: 1, faceTint: [0xe0483a, 0.45], tint: [0xc85a3e, 0.22], hairUp: 1,
        armL: { x: 0.9, z: 0.3, el: 1.3 }, armR: { x: 0.9, z: 0.3, el: 1.3 }, legL: { x: -0.6 * Math.max(0, Math.sin(tt * 20)) }, legR: { x: -0.6 * Math.max(0, -Math.sin(tt * 20)) } }); }
    if (tt < t.cooling + 0.55) { const u = smooth(u01(tt, PIPE0 + 0.2, t.cooling)), frost = smooth(u01(tt, t.cooling, t.cooling + 0.6));
      return g.set({ ...base, ...sitPose, x: lerp(0.55, SEAT[0], u), y: lerp(BED, SEAT[1], u), z: SEAT[2], rotY: 0.1, eyes: frost > 0.5 ? 'wide' : 'closed', mouth: frost > 0.5 ? 'teeth' : 'smile', tint: [0x9fdcff, 0.35 * frost], faceTint: [0xe0483a, 0.45 * (1 - u)] }); }
    // (a week of rain: he climbs to the crest) — balancing as it overtops; floatie water-slide down the spillway; splash
    const CREST = [-7.75, G.crest, -0.95], CL0 = t.cooling + 0.55, CL1 = Math.max(t.week + 0.5, CL0 + 1.3);
    if (tt < CL1) { const u = smooth(u01(tt, CL0, CL1)), x = lerp(SEAT[0] + 0.3, CREST[0], u), c = Math.sin(tt * 22);
      return g.set({ ...base, x, y: x < G.crestX ? G.crest : slopeY(x), z: -1.4, rotY: -PI / 2 + 0.25, lean: 0.55, eyes: 'wide', mouth: 'teeth', brows: -0.5,
        armL: { x: -2.5 + 0.5 * c, z: 0.3, el: 0.4 }, armR: { x: -2.5 - 0.5 * c, z: 0.3, el: 0.4 }, legL: { x: -0.7 * Math.max(0, c), kn: 0.9 * Math.max(0, c) }, legR: { x: -0.7 * Math.max(0, -c), kn: 0.9 * Math.max(0, -c) } }); }
    if (tt < SLD0) { const over = tt > OVER; return g.set({ ...base, x: CREST[0], y: CREST[1] + (over ? 0.04 : 0), z: CREST[2], rotY: tt > t.spillway ? 0.6 : 0, eyes: over ? 'wide' : 'half', mouth: over && tt < t.spillway ? 'scream' : tt > t.exit ? 'grin' : 'frown',
      armL: over && tt < t.spillway ? { x: -0.2, z: 1.3 + 0.3 * Math.sin(tt * 16) } : undefined, armR: over && tt < t.spillway ? { x: -0.2, z: 1.3 + 0.3 * Math.sin(tt * 16 + 1) } : undefined, lean: over && tt < t.spillway ? 0.15 * Math.sin(tt * 7) : 0 }); }
    if (tt < SLD1) { const u = u01(tt, SLD0, SLD1) ** 1.6, x = lerp(G.crestX + 0.1, G.toe + 0.2, u); return g.set({ ...base, ...sitPose, x, y: slopeY(x) - 0.12, z: -0.95, rotY: PI / 2 - 0.5, rz: -0.35, eyes: 'wide', mouth: 'grin', armL: { x: -2.9, z: 0.5 }, armR: { x: -2.9, z: 0.5 } }); }
    if (tt < SPLASH) { const [x, y, z] = hop(tt, SLD1, SPLASH, [G.toe + 0.4, BED + 0.6, -0.95], [2.5, PND + 0.25, -1.0], 1.6), u = u01(tt, SLD1, SPLASH); return g.set({ ...base, ...sitPose, x, y, z, rx: PI * smooth(u), eyes: 'wide', mouth: u > 0.6 ? 'scream' : 'grin', armL: { x: -2.9, z: 0.5 }, armR: { x: -2.9, z: 0.5 } }); }
    if (tt < SPLASH + 1.1) { const k = Math.sin(tt * 20); return g.set({ ...base, x: 2.5, y: PND + 0.25 - 0.15 * smooth(u01(tt, SPLASH, SPLASH + 0.15)), z: -1.0, rx: PI, eyes: 'closed', mouth: 'o', legL: { x: 0.5 * k, kn: 0.6 * Math.max(0, k) }, legR: { x: -0.5 * k, kn: 0.6 * Math.max(0, -k) }, armL: { x: 0.2, z: 1.2 }, armR: { x: 0.2, z: 1.2 } }); }
    // power: bobs in the pond, climbs out, peeks into the turbine; sucked in; spin cycle; spat out into the creek
    const PEEK = [PW.turb[0] + PW.R + 0.5, 0, PW.turb[2] + 0.55], WALKP0 = Math.max(t.send - 0.1, SPLASH + 1.15), WALKP1 = t.turbines - 0.1;
    if (tt < WALKP0) return g.set({ ...base, ...sitPose, x: 2.5, y: PND - 0.55 + 0.05 * Math.sin(tt * 3), z: -1.0, rotY: 0.3, squash: squash(tt, SPLASH + 1.1, 0.3), eyes: 'open', mouth: 'grin', armL: { x: -2.2, z: 0.9, el: 1.9 }, armR: { x: -2.2, z: 0.9, el: 1.9 } });
    if (tt < SUCKT) { const u = smooth(u01(tt, WALKP0, WALKP1)), peek = tt > WALKP1;
      return g.set({ ...base, x: lerp(2.5, PEEK[0], u), y: lerp(PND - 0.45, 0, smooth(u01(tt, WALKP0, WALKP0 + 0.5))), z: lerp(-1.0, PEEK[2], u), rotY: peek ? -PI / 2 + 0.55 : PI / 2 + 0.2, walk: u > 0.01 && u < 0.99 ? tt * 10 : undefined, lean: peek ? 0.4 : 0, eyes: peek && tt > t.penstocks ? 'wide' : 'open', mouth: peek && tt > t.penstocks ? 'o' : 'smile', look: peek ? [-0.8, 0] : [0, 0] }); }
    if (tt < SPIT) { const c = PW.turb, a = (tt - SUCKT) * 13, r = tt < SUCKT + 0.25 ? lerp(0.9, 0.32, u01(tt, SUCKT, SUCKT + 0.25)) : 0.32;
      return g.set({ ...base, x: c[0] + Math.cos(a) * r, y: c[1] - 0.5 + Math.sin(a) * r, z: c[2] - 0.35, rotY: 0, rz: -a, squash: [0.8, 0.8], eyes: 'spiral', mouth: 'scream', armL: { x: -0.3, z: 1.4 }, armR: { x: -0.3, z: 1.4 }, legL: { x: 0.6 }, legR: { x: -0.6 } }); }
    const SPLATP = [3.9, PND - 0.55, -1.25];
    if (tt < SPLAT) { const [x, y, z] = hop(tt, SPIT, SPLAT, [PW.turb[0] + 0.3, 0.2, PW.z0 + 0.3], SPLATP, 0.7); return g.set({ ...base, x, y, z, rx: (tt - SPIT) * 9, eyes: 'spiral', mouth: 'o', armL: { x: -2.8, z: 0.5 }, armR: { x: -2.8, z: 0.5 } }); }
    // fish: dazed, wades to the ladder, tries the first step — slapped back into the pond
    const LB = [ladderBottom.x + 0.6, 0, D.ladder.z0 + 0.15], STEP = [ladderBottom.x + 0.15, ladderBottom.y - 0.05, (D.ladder.z0 + D.ladder.z1) / 2 + 0.3];
    if (tt < t.climb - 0.4) { const u = smooth(u01(tt, SPLAT + 1.2, t.climb - 0.4)), hp = u01(u, 0.7, 1);
      dizzy.update(tt, tt < SPLAT + 1.2 ? 1 : 0, [SPLATP[0], SPLATP[1] + 0.55 + 1.62, SPLATP[2]]);
      return g.set({ ...base, ...(u < 0.01 ? sitPose : {}), x: lerp(SPLATP[0], LB[0], u), y: u < 0.7 ? lerp(SPLATP[1] + 0.25, BED + 0.0, u01(u, 0, 0.3)) : lerp(BED, 0, hp), z: lerp(SPLATP[2], LB[2], u), rotY: -PI / 2 - 0.3, walk: u > 0.01 && u < 0.99 ? tt * 9 : undefined, eyes: tt < SPLAT + 1.2 ? 'spiral' : 'open', mouth: 'smile' }); }
    if (tt < SLAP) { const u = smooth(u01(tt, t.climb - 0.4, t.garyFi + 0.1)); return g.set({ ...base, x: lerp(LB[0], STEP[0], u), y: lerp(0, STEP[1], u) + 0.25 * Math.sin(PI * u), z: lerp(LB[2], STEP[2], u), rotY: -PI / 2 + 0.7, lean: 0.2, eyes: 'open', mouth: 'grin', armL: { x: -1.6, z: 0.2 }, armR: { x: -1.6, z: 0.2 } }); }
    if (tt < SLAP + 0.8) { const [x, y, z] = hop(tt, SLAP, SLAP + 0.8, STEP, [0.9, PND - 0.5, -1.4], 0.8); return g.set({ ...base, x, y, z, rx: -(tt - SLAP) * 7, eyes: 'x', mouth: 'o', faceTint: [0xf07a6a, 0.3], armL: { x: -2.8, z: 0.6 }, armR: { x: -2.8, z: 0.6 } }); }
    if (tt < t.add) return hide(g);
    // the end: in the kiddie pool by the closed public pool, still too hot; NO SWIMMING; STILL CLOSED; the pool deflates under him
    const [px, py, pz] = kpPos(tt), sink = tt > t.closedE ? 0.42 * smooth(u01(tt, t.closedE + 0.1, t.closedE + 0.9)) : 0, sad = tt > t.closedE - 0.1, dive = tt > t.swimming - 0.3 && tt < t.illegal + 0.2;
    return g.set({ ...base, ...sitPose, x: px, y: py - 0.12 - sink, z: pz, rotY: sad ? 0.3 : dive ? -0.6 : 0.5, lean: dive ? 0.35 : 0, eyes: sad ? 'half' : dive ? 'wide' : 'half', mouth: sad ? 'frown' : dive ? 'o' : 'o', brows: sad ? 1 : 0.5,
      faceTint: [0xe0483a, 0.35], armR: tt < t.money ? { x: -2.2, z: 0.3, el: 1.6 + 0.3 * Math.sin(tt * 14) } : dive ? { x: -2.8, z: 0.3 } : undefined, armL: dive ? { x: -2.8, z: 0.3 } : undefined,
      look: sad ? [0.6, 0.1] : tt > t.illegal - 0.1 && tt < t.beavers ? [-0.7, 0.2] : [0, 0], head: sad ? { x: 0.25, y: 0.5, z: 0 } : undefined });
  }

  // ---------------------------------------------------------------- the beaver (silent engineer: judges, holds, collects rent, sells the book)
  const BV = [BVX + 0.05, BED + 0.82, -0.25];   // on the front of its stick pile (from behind, the sticks hid it)
  function beaverAt(tt) {
    const b = beaver, sc = 1.35; b.root.visible = true; book.visible = false;
    if (tt < t.beaver - 0.4) return hide(b);
    const ROCK = [-0.55, BED + 0.4, -0.75];
    if (tt < t.floats - 0.2) { const up = smooth(u01(tt, t.beaver - 0.4, t.beaver + 0.2)), writing = tt > t.already - 0.1, card = smooth(u01(tt, t.notes - 0.35, t.notes - 0.05)) * (1 - smooth(u01(tt, t.notes + 1.1, t.notes + 1.3)));
      return b.set({ x: ROCK[0], y: lerp(CRK - 0.5, ROCK[1], up), z: ROCK[2], rotY: -0.5, stand: up, write: writing && card < 0.5 ? 1 : 0, card: 1.5 * card, cardText: '2/10', cardLift: 0.25, cardFwd: 0.12, t: tt, scale: sc, look: tt < t.hops ? [-0.6, 0] : [-0.8, 0.2] }); }
    if (tt < t.flip) { const u = smooth(u01(tt, t.floats - 0.2, t.flip)); return b.set({ x: lerp(ROCK[0] + 0.6, BV[0] - 0.4, u), y: pondLevel(tt) - 0.12, z: lerp(ROCK[2], BV[2], u), rotY: PI / 2, swim: 1, t: tt * 2, scale: sc, clip: 0 }); }
    if (tt < t.flip + 0.35) { const [x, y, z] = hop(tt, t.flip, t.flip + 0.35, [BV[0] - 0.4, pondLevel(tt) - 0.12, BV[2]], BV, 0.3); return b.set({ x, y, z, rotY: 0, stand: 0.5, t: tt, scale: sc }); }
    const TOWNB = [-10.3, 1.84, -4.05];
    if (tt > t.sells - 0.7 && tt < WET0 + 0.9) { const up = u01(tt, t.sells - 0.7, t.sells - 0.2), L = lakeLevel(tt), off = tt > WET0 + 0.2;
      if (off) return b.set({ x: TOWNB[0] - 1.2 * u01(tt, WET0 + 0.2, WET0 + 0.9), y: L - 0.12, z: TOWNB[2] + 0.4, rotY: -PI / 2, swim: 1, t: tt * 2, scale: sc, clip: 0 });
      const [x, y, z] = up < 1 ? hop(tt, t.sells - 0.7, t.sells - 0.2, [TOWNB[0] + 0.9, L - 0.1, TOWNB[2] + 0.6], TOWNB, 0.5) : TOWNB, hammer = tt > t.lakefront - 0.4 && tt < t.lakefront + 0.1;
      return b.set({ x, y, z, rotY: 0.45, stand: up, point: hammer ? 0.6 + 0.4 * Math.abs(Math.sin(tt * 18)) : 0, clip: 0, t: tt, scale: sc, nod: hammer ? 0.2 : 0, look: [0.5, 0] }); }
    if (tt > WET0 + 0.9 && tt < t.finish0) return hide(b);
    if (tt < t.finish0) {
      const rent = smooth(u01(tt, t.rent - 0.15, t.rent + 0.05)) * (1 - smooth(u01(tt, t.rent + 1.1, t.rent + 1.3)));
      const point = smooth(u01(tt, t.already - 0.1, t.already + 0.2)) * (1 - smooth(u01(tt, t.oneC + 0.6, t.oneC + 0.9)));
      const shakeNo = tt > t.running && tt < t.river + 0.4 ? 0.35 * Math.sin((tt - t.running) * 16) : 0;
      const writing = (tt > FLOAT1 && tt < FLOAT1 + 1.4) || (tt > POPC && tt < POPC + 1.2) || (tt > CRUMB && tt < CRUMB + 1.4) || (tt > SPLASH && tt < SPLASH + 1.0);
      return b.set({ x: BV[0], y: BV[1], z: BV[2], rotY: point > 0.1 ? 0.2 : -0.35, stand: 1, write: writing ? 1 : 0, card: 1.8 * rent, cardText: 'RENT\nDUE', cardLift: 0.5, cardFwd: 0.2, point, nod: point * 0.35 * Math.max(0, Math.sin(tt * 6)), headY: shakeNo, t: tt, scale: sc, look: point > 0.5 ? [0, -1] : [-0.6, 0] });
    }
    // the gift shop: behind the counter; holds up the bestseller
    const hold = smooth(u01(tt, t.bestseller - 0.35, t.bestseller - 0.05));
    b.set({ x: D.shop.x - 0.1, y: 0.42, z: D.shop.z - 0.38, rotY: 0.35, stand: 1, card: 0, clip: 0, point: hold * 0.6, t: tt, scale: sc, look: [0.4, 0] });
    if (hold > 0.01) { b.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); b.hand(1).getWorldPosition(hp); book.visible = true; book.position.set(hp.x, hp.y + 0.28, hp.z + 0.1); book.rotation.set(0, 0.2, 0); book.scale.setScalar(2.2 * hold); }
  }
  t.finish0 = t.gift - 0.12;
  for (let k = 0; k < 9; k++) fx.burst('drops', t.also + 0.2 + k * 0.32, { pos: [-22 + k * 1.5, 1.0 + (k % 3) * 0.7, -4.2], box: [1.0, 0.3, 0.6], n: 5, dir: [0, 1, 0], spread: 0.3, speed: [0.3, 0.6], g: -2.2, size: [0.04, 0.07], life: [1.2, 1.8], seed: 190 + k });   // bubbles rise from the drowned town

  // ---------------------------------------------------------------- salmon: furious at the dam, climb the ladder (one slaps Gary), swim past the drowned town
  function salmonAt(tt) {
    salmon.forEach((f, i) => {
      f.g.visible = false;
      if (tt > t.salmon - 0.4 && tt < t.blame) { // can't get home: they leap at the dam face and bonk off it
        const ph = ((tt - t.salmon + i * 0.27) % 0.9) / 0.9, x = 1.3 + (i % 3) * 0.35, z = -0.6 - (i % 2) * 0.7, hit = 0.55;
        const xx = ph < hit ? lerp(x, 0.15, ph / hit) : lerp(0.15, x + 0.3, (ph - hit) / (1 - hit)), yy = PND - 0.05 + (ph < hit ? 1.0 * Math.sin((PI / 2) * (ph / hit)) : 1.0 * Math.cos((PI / 2) * ((ph - hit) / (1 - hit))));
        f.g.visible = true; return f.set({ x: xx, y: yy, z, rotY: ph < hit ? -PI / 2 : PI / 2, pitch: ph < hit ? -0.5 : 0.6, roll: ph > hit && ph < hit + 0.15 ? 0.8 : 0, t: tt });
      }
      if (tt >= t.blame && tt < t.climb - 0.6) { // …and blame Gary: they leap at his head
        const g0 = gary.root.position, a = t.blame - 0.05 + i * 0.14, u = u01(tt, a, a + 0.5), from = [1.3 + (i % 3) * 0.35, PND, -0.6 - (i % 2) * 0.7];
        f.g.visible = true; return f.set({ x: lerp(from[0], g0.x, u), y: lerp(from[1], g0.y + 1.0, u) + 0.8 * Math.sin(PI * u), z: lerp(from[2], g0.z + 0.2, u), rotY: PI / 2, pitch: -0.3, t: tt });
      }
      if (tt >= t.climb - 0.6 && tt < t.also) { // up the ladder: step to step
        const t0 = t.climb - 0.6 + i * 0.28, steps = S.ladder, k = (tt - t0) / 0.3; if (k < 0) { const u = u01(tt, t.climb - 0.6, t0); f.g.visible = true; return f.set({ x: lerp(3.3 + (i % 3) * 0.5, 1.6, u), y: PND - 0.05, z: -1.3, rotY: -PI / 2, t: tt }); }
        const n = Math.floor(k), fr = k - n; if (n >= steps.length) return;
        const a = n === 0 ? { x: 1.6, y: PND, z: -1.6 } : steps[n - 1], c = steps[n];
        f.g.visible = true; return f.set({ x: lerp(a.x, c.x, fr), y: lerp(a.y, c.y, fr) + 0.55 * Math.sin(PI * fr), z: lerp(a.z, c.z, fr), rotY: -PI / 2, pitch: lerp(-0.6, 0.6, fr), t: tt });
      }
      if (tt >= t.also && tt < t.add && i < 3) { // swimming past the drowned houses
        const u = ((tt - t.also) * 0.5 + i * 0.33) % 1; f.g.visible = true; return f.set({ x: lerp(-9.5, -22, u), y: 1.2 + i * 0.9 + 0.1 * Math.sin(tt * 3 + i), z: -2.8 - i * 0.4, rotY: -PI / 2, t: tt });
      }
    });
    anger.visible = tt > t.salmon - 0.2 && tt < t.blame + 0.7; if (anger.visible) { const p0 = salmon[0].g.position; anger.position.set(p0.x + 0.15, p0.y + 0.4, p0.z + 0.1); anger.scale.setScalar(0.35 + 0.05 * Math.sin(tt * 20)); }
    // the slapper: leaps across Gary's face on "can't"
    const s = salmon[5]; if (tt > SLAP - 0.35 && tt < SLAP + 0.35) { const u = u01(tt, SLAP - 0.35, SLAP + 0.35); s.g.visible = true; s.set({ x: lerp(1.6, 0.0, u), y: lerp(PND, 2.4, u) + 0.6 * Math.sin(PI * u), z: -2.75, rotY: -PI / 2, pitch: -0.4, roll: u * 6, t: tt }); }
  }

  // QC (`node tools/render.mjs 025-kiddie-pool-dam --qc`): every 0.25 s, project Gary's (and the beaver's) head and list the
  // moments a caption/callout band covers it.
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = new THREE.Vector3();
    for (let tt = 0; tt < END; tt += 0.25) {
      update(tt);
      for (const [who, head, rig] of [['Gary', gary.head, gary.root], ['the beaver', beaver.head, beaver.root]]) { if (!rig.visible) continue;
        rig.updateMatrixWorld(true); head.getWorldPosition(v); v.project(studio.camera);
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
