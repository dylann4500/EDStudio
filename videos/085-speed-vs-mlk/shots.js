// 085 — Scribe promo, accent-narrator explainer: "IShowSpeed vs Martin Luther King Jr.: who can pull the bigger crowd?"
// Narrated by the Fish "Amir" voice (narrator-indian preset), tiki phonk underneath. A respectful EDUCATIONAL versus: every laugh
// comes from the streamer's hype (a generic toon in a plain orange tee, no merch/logo/channel branding) and his cameraman Gary;
// Dr. King's beats are told straight and warm (no jokes about him, race, civil rights or anyone's suffering; no speech text quoted).
// Hook: a split-screen VS (top = the streamer live on a city street, bottom = 1963 rendered to a texture, sepia). The streamer's
// numbers (60M+ subscribers, a 1,043,028 peak on one stream, tens of thousands chasing him in person) → Gary gets flattened by the
// stampede. Then Dr. King: no internet, no algorithm (a church office mimeograph running off flyers, 1955), the Montgomery bus
// boycott (people walking past an empty bus, 381 days), the March on Washington (Aug 28 1963, ~250,000 people at a reflecting pool
// by a generic memorial and obelisk), his "I Have a Dream" speech (named + paraphrased only). The streamer's jaw drops.
// Pivot (~58 %): Derek's history homework is a civil-rights timeline, handwritten → Scribe on his phone: one photo, the worksheet's
// blanks found and filled ON SCREEN in his handwriting (README §Worksheets), Download PDF. Then the verdict split ("No contest": the
// 1963 half shoves the street half up), three period newspapers (Civil Rights Act 1964, the Nobel Peace Prize at 35 — the youngest
// winner at the time, Voting Rights Act 1965), a last crane over the 1963 crowd as the sepia warms to colour, and the streamer
// today, sitting on the memorial steps, genuinely impressed, taking notes. End card.
// Numbers (sources in caption.md): 60M+ YouTube subscribers (60M on Jul 31 2026; ~61.6M Oct 2026); 1,043,028 peak concurrent
// viewers, Jakarta, Sep 18 2024 (Streams Charts); "tens of thousands" in person (Lima, Jan 2025, Dexerto; Nairobi ~30,000 Feb 2026);
// Montgomery bus boycott Dec 5 1955 – Dec 20 1956 = 381 days (King Institute); March on Washington Aug 28 1963, ~250,000 (NPS);
// Nobel Peace Prize Oct 14 1964 at 35, then the youngest laureate; Civil Rights Act Jul 2 1964; Voting Rights Act Aug 6 1965.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, mk, rng } from '@engine/core.js';
import { beatClock, u01, easeOutBack } from '@engine/build/anim.js';
import { makeFX, makeDizzy } from '@engine/build/fx.js';
import { makeToon } from '@engine/build/toon.js';
import { makeKick } from '@engine/build/cuts.js';
import { makeCrowd } from '@engine/build/brprops.js';
import { loadHand, loadImg, penKit } from '@engine/build/scribe.js';
import { makeHud } from '@engine/build/brhud.js';
import { buildRoom, makePhone, tex } from '@engine/build/ww2.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { makeBus } from '@engine/props.js';

const PI = Math.PI, TAU = PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const hsh = (i, a = 0) => { const s = Math.sin(i * 12.9898 + a * 78.233) * 43758.5453; return s - Math.floor(s); };
const UPV = new THREE.Vector3(0, 1, 0);

export async function build(studio, story) {
  const { scene, renderer } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 40px Fredoka', '400 40px "Luckiest Guy"', '30px Georgia', 'bold 40px Georgia'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------------------------------------------------------------- word times (everything keys to the narration)
  const t = {
    versus: W('hook', 'versus'), martin: W('hook', 'martin'), who: W('hook', 'who'), crowd1: W('hook', 'crowd'),
    speed: W('speed', 'speed'), sixty: W('speed', 'sixty'), one1: W('speed', 'one'), million2: W('speed', 'million', 2), live: W('speed', 'live'),
    in1: W('streets', 'in'), tens: W('streets', 'tens'), chase: W('streets', 'chase'), gary: W('streets', 'gary'), flattened: W('streets', 'flattened'),
    now: W('king', 'now'), no1: W('king', 'no'), internet: W('king', 'internet'), algorithm: W('king', 'algorithm'), in2: W('king', 'in'), montgomery: W('king', 'montgomery'), people1: W('king', 'people'), three: W('king', 'three'), days: W('king', 'days'),
    in3: W('march', 'in'), y1963: W('march', '1963'), march: W('march', 'march'), two: W('march', 'two'), came: W('march', 'came'), in4: W('march', 'in', 2), person: W('march', 'person'),
    he1: W('speech', 'he'), dream: W('speech', 'dream'), calling: W('speech', 'calling'), equal: W('speech', 'equal'), every: W('speech', 'every'),
    back: W('hw', 'back'), derek: W('hw', 'derek'), history: W('hw', 'history'), handwritten: W('hw', 'handwritten'), so1: W('hw', 'so'), scribe: W('hw', 'scribe'), one2: W('hw', 'one'), photo: W('hw', 'photo'), and1: W('hw', 'and'), fills: W('hw', 'fills'), handwriting: W('hw', 'handwriting'),
    so2: W('answer', 'so'), no2: W('answer', 'no'), contest: W('answer', 'contest'),
    then: W('legacy', 'then'), civil2: W('legacy', 'civil'), nobel: W('legacy', 'nobel'), youngest: W('legacy', 'youngest'), voting: W('legacy', 'voting'),
    king3: W('end', 'king'), zero: W('end', 'zero'), moved: W('end', 'moved'), speed3: W('end', 'speed'), taking: W('end', 'taking'), notes: W('end', 'notes'),
  };
  const LASTW = story.beats.end.w[story.beats.end.w.length - 1][2];
  const ENDCARD = LASTW + 0.45;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ================================================================ SETS
  const ST = buildStreet(studio); const STfog = scene.fog;                                  // modern street (origin)
  const SB0 = [-5000, 0, 0], SB = buildSuburb(studio); SB.root.position.set(...SB0); const SBfog = SB.fog || scene.fog;   // Montgomery 1955
  const SBw = (x, y, z) => [SB0[0] + x, SB0[1] + y, SB0[2] + z];
  const RM0 = [0, 0, -5000], ROOM = buildRoom(studio); ROOM.root.position.set(...RM0);   // Derek's room, 2026
  const RMw = (x, y, z) => [RM0[0] + x, RM0[1] + y, RM0[2] + z];
  const ML0 = [5000, 0, 0], MLw = (x, y, z) => [ML0[0] + x, ML0[1] + y, ML0[2] + z];
  const OF0 = [0, 0, 5000], OFw = (x, y, z) => [OF0[0] + x, OF0[1] + y, OF0[2] + z];

  // ---------------------------------------------------------------- the Mall, 1963: a generic memorial on steps, a reflecting pool, an obelisk
  const SY = 3.6;   // the memorial platform's top (the lectern stands at its front edge)
  const stepTop = (z) => (z > 4.3 ? 0 : z < -5.6 ? SY : Math.min(SY, Math.ceil((4.3 - z) / 0.9) * 0.3));
  const ML = (() => {
    const root = new THREE.Group(); scene.add(root); root.position.set(...ML0);
    const R = rng(63);
    const grassT = tex(512, 512, (c, w, h) => { c.fillStyle = '#78a24e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = R() < 0.5 ? 'rgba(40,80,20,.16)' : 'rgba(180,215,120,.14)'; c.fillRect(R() * w, R() * h, 2, 3); } });
    grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(160, 240);
    const ground = mk(new THREE.PlaneGeometry(1600, 2400), std(0xffffff, 0.95, { map: grassT }), root, 0, 0, 500); ground.rotation.x = -PI / 2; ground.castShadow = false; ground.receiveShadow = true;
    const stoneT = tex(256, 256, (c, w, h) => { c.fillStyle = '#d9d2c2'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(90,80,60,.22)'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); } });
    stoneT.wrapS = stoneT.wrapT = THREE.RepeatWrapping; stoneT.repeat.set(30, 19);
    const plaza = mk(new THREE.PlaneGeometry(120, 76), std(0xffffff, 0.9, { map: stoneT }), root, 0, 0.012, 42); plaza.rotation.x = -PI / 2; plaza.castShadow = false; plaza.receiveShadow = true;
    for (const s of [-1, 1]) { const wk = mk(new THREE.PlaneGeometry(7.5, 600), std(0xd6ccb4, 0.95), root, s * 29.25, 0.014, 380); wk.rotation.x = -PI / 2; wk.castShadow = false; wk.receiveShadow = true; }
    // the reflecting pool: a stone kerb round a still sheet of water
    const kerb = std(0xcfc6b4, 0.8);
    for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(1.2, 0.45, 600), kerb, root, s * 24.9, 0.225, 380); mk(new THREE.BoxGeometry(51, 0.45, 1.2), kerb, root, 0, 0.225, 380 + s * 299.4); }
    const water = mk(new THREE.PlaneGeometry(48.6, 598), new THREE.MeshStandardMaterial({ color: 0x5f8299, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.3 }), root, 0, 0.33, 380); water.rotation.x = -PI / 2; water.castShadow = false;
    // the memorial: platform, steps, cheek blocks, a colonnade, entablature, attic, a dark cella doorway
    const marble = std(0xece6d9, 0.55), marbleD = std(0xddd5c5, 0.6);
    mk(new THREE.BoxGeometry(56, SY, 28.4), marble, root, 0, SY / 2, -19.8);
    const nose = std(0xa8a090, 0.8), riser = std(0xc4bcac, 0.65);
    for (let i = 0; i < 12; i++) { const h = (i + 1) * 0.3; mk(new THREE.BoxGeometry(40, h, 0.9), [marble, marble, i % 2 ? marble : marbleD, marble, riser, marble], root, 0, h / 2, 4.3 - i * 0.9 - 0.45); const ln = mk(new THREE.BoxGeometry(40, 0.035, 0.03), nose, root, 0, i * 0.3 + 0.0175, 4.3 - i * 0.9 + 0.012); ln.castShadow = false; }
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(8, SY, 11), marble, root, s * 24, SY / 2, -0.2);
    const colG = new THREE.CylinderGeometry(0.85, 0.95, 12.5, 18), capG = new THREE.BoxGeometry(2.1, 0.5, 2.1);
    const colAt = (x, z) => { mk(colG, marble, root, x, SY + 6.25, z); mk(capG, marbleD, root, x, SY + 12.5, z); };
    for (let i = 0; i < 12; i++) colAt(-24.2 + i * 4.4, -13);
    for (const s of [-1, 1]) for (let k = 1; k <= 4; k++) colAt(s * 24.2, -13 - k * 4.4);
    mk(new THREE.BoxGeometry(54, 3.2, 21.2), marble, root, 0, SY + 12.75 + 1.6, -22.6);
    mk(new THREE.BoxGeometry(54.2, 0.9, 21.4), marbleD, root, 0, SY + 15.2, -22.6);
    mk(new THREE.BoxGeometry(46, 3, 17), marble, root, 0, SY + 17.85, -22.8);
    mk(new THREE.BoxGeometry(38, 12.5, 15), marbleD, root, 0, SY + 6.25, -24.5);
    const door = mk(new THREE.PlaneGeometry(12, 10), new THREE.MeshBasicMaterial({ color: 0x8a8274 }), root, 0, SY + 5, -16.98); door.castShadow = false;
    const kingKey = new THREE.PointLight(0xfff0dc, 3.2, 5.5, 1.5); kingKey.position.set(0.4, SY + 1.9, -5.4); root.add(kingKey);
    // the lectern + a cluster of radio microphones (generic, no call letters)
    const lectern = new THREE.Group(); root.add(lectern); lectern.position.set(0, SY, -6.75);
    { const wood = std(0x5a3b24, 0.6); mk(new THREE.BoxGeometry(0.66, 0.68, 0.42), wood, lectern, 0, 0.34, 0); const top = mk(new THREE.BoxGeometry(0.74, 0.05, 0.5), wood, lectern, 0, 0.7, 0); top.rotation.x = 0.18;
      const metal = std(0x2a2a2e, 0.4, { metalness: 0.6 }), head = std(0x34363c, 0.45, { metalness: 0.5 });
      [-0.2, -0.1, 0, 0.1, 0.2].forEach((x, i) => { const hgt = 0.03 + (i % 2) * 0.03; mk(new THREE.CylinderGeometry(0.009, 0.009, hgt, 6), metal, lectern, x, 0.72 + hgt / 2, 0.1); const m = mk(new RoundedBoxGeometry(0.045, 0.06, 0.04, 2, 0.012), head, lectern, x, 0.75 + hgt, 0.1); m.rotation.x = -0.6; }); }
    // the obelisk at the far end of the pool
    const ob = new THREE.Group(); root.add(ob); ob.position.set(0, 0, 1100);
    { const sh = mk(new THREE.CylinderGeometry(7.4, 11.9, 152, 4), marble, ob, 0, 76, 0); sh.rotation.y = PI / 4; const py = mk(new THREE.ConeGeometry(7.4, 17, 4), marble, ob, 0, 160.5, 0); py.rotation.y = PI / 4;
      const base = mk(new THREE.CylinderGeometry(60, 60, 0.4, 40), std(0xcfc6b4, 0.9), ob, 0, 0.2, 0); base.castShadow = false; }
    // elms in rows along the pool + round the plaza
    const crownG = new THREE.SphereGeometry(4.6, 10, 8), trunkG = new THREE.CylinderGeometry(0.35, 0.45, 5.4, 7); trunkG.translate(0, 2.7, 0);
    const treeP = [];
    for (const x of [-50, -38, 38, 50]) for (let z = 85; z <= 675; z += 15) treeP.push([x + (R() - 0.5), z + (R() - 0.5) * 2]);
    for (const x of [-66, 66]) for (let z = 10; z <= 80; z += 12) treeP.push([x, z]);
    const crowns = new THREE.InstancedMesh(crownG, std(0x4f7a3a, 0.9), treeP.length), trunks = new THREE.InstancedMesh(trunkG, std(0x5a4632, 0.9), treeP.length);
    { const M4 = new THREE.Matrix4(), C = new THREE.Color(); treeP.forEach(([x, z], i) => { const s = 0.9 + R() * 0.3; M4.makeScale(s, s * 0.85, s).setPosition(x, 8.6 * s, z); crowns.setMatrixAt(i, M4); crowns.setColorAt(i, C.setHex([0x4f7a3a, 0x5a8540, 0x46703a][i % 3])); M4.makeScale(s, s, s).setPosition(x, 0, z); trunks.setMatrixAt(i, M4); }); }
    crowns.castShadow = trunks.castShadow = true; root.add(crowns, trunks);
    // sky + light
    const skyT = tex(64, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6da4da'); g.addColorStop(0.42, '#b6d2ea'); g.addColorStop(0.5, '#e9e3d1'); g.addColorStop(1, '#d9d1bd'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const sky = mk(new THREE.SphereGeometry(2400, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }), root, 0, 0, 400); sky.castShadow = false; sky.renderOrder = -1;
    const fog = new THREE.Fog(0xe2dccb, 320, 2600);
    const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x6c7a52, 1.2); root.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.7); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    const SUN_DIR = new THREE.Vector3(0.3, 0.82, 0.48).normalize(), SUN_BACK = new THREE.Vector3(0.35, 0.8, -0.5).normalize();
    function aim(cx, cz, half = 16, dir = SUN_DIR) { sun.target.position.set(cx, 0, cz); sun.position.copy(sun.target.position).addScaledVector(dir, 90); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 220 }); sun.shadow.camera.updateProjectionMatrix(); }
    aim(0, 0);
    // the far crowd: ~23,000 cheap figures (a body + a head, instanced, unshadowed) round the plaza and along both sides of the pool
    const MASS_N = 24000;
    const bodyG = new THREE.CylinderGeometry(0.19, 0.23, 1.0, 7); bodyG.translate(0, 0.5, 0);
    const headG = new THREE.SphereGeometry(0.2, 8, 6); headG.translate(0, 1.2, 0);
    const massB = new THREE.InstancedMesh(bodyG, std(0xffffff, 0.85), MASS_N), massH = new THREE.InstancedMesh(headG, std(0xffffff, 0.6), MASS_N);
    for (const m of [massB, massH]) { m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; root.add(m); }
    const CL = [0xf3f1ea, 0xf3f1ea, 0xe8e4da, 0x3a3f4a, 0x2e3340, 0x8a8d93, 0xbcd0e6, 0xd8c8a8, 0xe6b8c8, 0xf0e0a0, 0x6d7f9c, 0xa45a52];
    const SK = [0x3d2616, 0x5a3a24, 0x6e4428, 0x8a5a3b, 0xa8754f, 0xc68863, 0xe8b48a, 0xf2c29a];
    let n = 0; { const M4 = new THREE.Matrix4(), C = new THREE.Color(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), P3 = new THREE.Vector3();
      const place = (x, z) => { if (n >= MASS_N) return; const s = 1.0 + R() * 0.15; Q.setFromAxisAngle(UPV, PI + (R() - 0.5) * 0.8); M4.compose(P3.set(x, 0, z), Q, S3.set(s, s, s)); massB.setMatrixAt(n, M4); massH.setMatrixAt(n, M4); massB.setColorAt(n, C.setHex(CL[Math.floor(R() * CL.length)])); massH.setColorAt(n, C.setHex(SK[Math.floor(R() * SK.length)])); n++; };
      const zone = (x0, x1, z0, z1, sp) => { for (let z = z0; z < z1; z += sp) for (let x = x0; x < x1; x += sp) place(x + (R() - 0.5) * sp * 0.7, z + (R() - 0.5) * sp * 0.7); };
      for (const s of [-1, 1]) { zone(s > 0 ? 26 : -34, s > 0 ? 34 : -26, 80, 600, 1.0); zone(s > 0 ? 34 : -64, s > 0 ? 64 : -34, 80, 470, 1.6); zone(s > 0 ? 21.5 : -40, s > 0 ? 40 : -21.5, 6, 25, 1.1); }
      ML_SIDES = n;                         // everything after this index is the plaza block in front of the steps (hidden while the march arrives)
      zone(-58, 58, 25.5, 79, 1.15); }
    massB.count = massH.count = n; const MASS_ALL = n;
    return { root, fog, sky, sun, hemi, aim, lectern, massB, massH, MASS_ALL, water, SUN_DIR, SUN_BACK };
  })();
  var ML_SIDES;   // (set inside the builder above)

  // ---------------------------------------------------------------- a church office, 1955: desk, mimeograph, typewriter, rotary phone, flyers
  const OF = (() => {
    const root = new THREE.Group(); scene.add(root); root.position.set(...OF0);
    const R = rng(55);
    const floorT = tex(256, 256, (c, w, h) => { c.fillStyle = '#8a6444'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.05)'; c.fillRect(0, i * 32, w, 32); } });
    floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
    const floor = mk(new THREE.PlaneGeometry(10, 10), std(0xffffff, 0.8, { map: floorT }), root, 0, 0, 0); floor.rotation.x = -PI / 2; floor.castShadow = false; floor.receiveShadow = true;
    const wallM = std(0xd9ccb0, 0.9), woodD = std(0x5a3b24, 0.6), wood = std(0x8a5a36, 0.6);
    mk(new THREE.BoxGeometry(10, 3.2, 0.1), wallM, root, 0, 1.6, -2.65); mk(new THREE.BoxGeometry(0.1, 3.2, 8), wallM, root, -3.0, 1.6, 0.6);
    mk(new THREE.BoxGeometry(10, 0.9, 0.04), woodD, root, 0, 0.45, -2.58);   // wainscot
    // window on the back wall (bright day outside) + frame
    const winT = tex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#bcd8ee'); g.addColorStop(1, '#f4ecd8'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#7a9a5a'; c.beginPath(); c.arc(60, h, 90, PI, TAU); c.fill(); c.beginPath(); c.arc(200, h + 20, 110, PI, TAU); c.fill(); });
    const win = mk(new THREE.PlaneGeometry(1.4, 1.3), new THREE.MeshBasicMaterial({ map: winT, toneMapped: false }), root, 1.5, 1.75, -2.59); win.castShadow = false;
    for (const [x, y, w2, h2] of [[1.5, 2.43, 1.55, 0.08], [1.5, 1.07, 1.55, 0.08], [0.76, 1.75, 0.08, 1.4], [2.24, 1.75, 0.08, 1.4], [1.5, 1.75, 0.05, 1.3]]) mk(new THREE.BoxGeometry(w2, h2, 0.06), std(0xf0ece2, 0.6), root, x, y, -2.56);
    // a framed print + a shelf of books + a coat rack with a hat
    mk(new THREE.BoxGeometry(0.62, 0.82, 0.03), woodD, root, -1.4, 1.85, -2.58); mk(new THREE.PlaneGeometry(0.52, 0.72), std(0xc8b890, 0.9), root, -1.4, 1.85, -2.56);
    const shelf = new THREE.Group(); root.add(shelf); shelf.position.set(-2.88, 1.5, -1.0); shelf.rotation.y = PI / 2;
    mk(new THREE.BoxGeometry(1.4, 0.04, 0.28), wood, shelf, 0, 0, 0); mk(new THREE.BoxGeometry(1.4, 0.04, 0.28), wood, shelf, 0, 0.42, 0);
    for (let i = 0; i < 14; i++) mk(new THREE.BoxGeometry(0.06 + R() * 0.03, 0.26 + R() * 0.08, 0.2), std([0x7a2a22, 0x2a3a5a, 0x3a5a3a, 0x6a5030, 0x1f1f24][i % 5], 0.8), shelf, -0.62 + i * 0.09, 0.16 + (i % 7 === 3 ? 0.42 : 0), 0);
    // the desk
    const deskY = 0.79;
    mk(new THREE.BoxGeometry(1.9, 0.06, 0.92), wood, root, 0, 0.76, -1.5);
    for (const x of [-0.72, 0.72]) mk(new THREE.BoxGeometry(0.42, 0.73, 0.86), woodD, root, x, 0.365, -1.5);
    // mimeograph: base, a drum on an axle, a crank, the feed stack, the output tray
    const mimeo = new THREE.Group(); root.add(mimeo); mimeo.position.set(0.55, deskY, -1.42);
    mk(new RoundedBoxGeometry(0.5, 0.16, 0.36, 3, 0.03), std(0x3c4a3c, 0.5), mimeo, 0, 0.08, 0);
    const drum = new THREE.Group(); mimeo.add(drum); drum.position.set(0, 0.25, 0);
    { const dm = mk(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 20), std(0x2a2c30, 0.4, { metalness: 0.4 }), drum, 0, 0, 0); dm.rotation.z = PI / 2;
      for (let k = 0; k < 4; k++) { const st = mk(new THREE.BoxGeometry(0.4, 0.012, 0.02), std(0xd8d0bc, 0.6), drum, 0, 0, 0); st.position.set(0, Math.cos(k * PI / 2) * 0.101, Math.sin(k * PI / 2) * 0.101); st.rotation.x = k * PI / 2; } }
    for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.03, 0.18, 0.08), std(0x3c4a3c, 0.5), mimeo, s * 0.23, 0.2, 0);
    const crank = new THREE.Group(); mimeo.add(crank); crank.position.set(0.27, 0.25, 0);
    mk(new THREE.BoxGeometry(0.02, 0.16, 0.025), std(0x8a8d93, 0.3, { metalness: 0.7 }), crank, 0, 0.08, 0); mk(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8), std(0x1d1d1d, 0.5), crank, 0.035, 0.15, 0).rotation.z = PI / 2;
    const feed = mk(new THREE.BoxGeometry(0.24, 0.05, 0.3), std(0xf4f0e4, 0.8), mimeo, 0, 0.33, -0.16); feed.rotation.x = 0.5;
    mk(new THREE.BoxGeometry(0.3, 0.02, 0.26), std(0x3c4a3c, 0.5), mimeo, 0, 0.03, 0.3);
    // a typewriter, a rotary phone, a lamp, flyer stacks
    const tw = new THREE.Group(); root.add(tw); tw.position.set(-0.6, deskY, -1.5);
    mk(new RoundedBoxGeometry(0.38, 0.12, 0.3, 3, 0.03), std(0x24262a, 0.4), tw, 0, 0.06, 0); const cyl = mk(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12), std(0x111111, 0.5), tw, 0, 0.14, -0.1); cyl.rotation.z = PI / 2;
    mk(new THREE.BoxGeometry(0.22, 0.2, 0.004), std(0xf8f4ea, 0.8), tw, 0, 0.25, -0.12).rotation.x = -0.25;
    const ph = new THREE.Group(); root.add(ph); ph.position.set(0.12, deskY, -1.86); ph.rotation.y = -0.2;
    mk(new RoundedBoxGeometry(0.2, 0.08, 0.22, 3, 0.03), std(0x111113, 0.3), ph, 0, 0.04, 0); const dial = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 20), std(0xe8e4da, 0.4), ph, 0, 0.085, 0.04); dial.rotation.x = 0.4;
    const hs = mk(new THREE.CapsuleGeometry(0.025, 0.17, 4, 8), std(0x111113, 0.3), ph, 0, 0.11, -0.04); hs.rotation.z = PI / 2;
    const lamp = new THREE.Group(); root.add(lamp); lamp.position.set(-0.86, deskY, -1.9);
    mk(new THREE.CylinderGeometry(0.08, 0.09, 0.03, 14), std(0xa8823a, 0.3, { metalness: 0.7 }), lamp, 0, 0.015, 0); mk(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), std(0xa8823a, 0.3, { metalness: 0.7 }), lamp, 0, 0.22, 0);
    mk(new THREE.ConeGeometry(0.13, 0.12, 16, 1, true), std(0x2f5a3a, 0.5, { side: THREE.DoubleSide }), lamp, 0, 0.42, 0.04);
    const flyerT = tex(256, 330, (c, w, h) => { c.fillStyle = '#f6f1e2'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1d1d'; c.textAlign = 'center'; c.font = 'bold 50px Georgia'; c.fillText('NO BUSES', w / 2, 70); c.font = 'bold 30px Georgia'; c.fillText('MONDAY, DEC. 5', w / 2, 118);
      c.font = '24px Georgia'; c.fillText('Walk. Share a ride.', w / 2, 170); c.fillText('Stand together.', w / 2, 202); c.fillRect(40, 228, w - 80, 3); c.font = 'bold 24px Georgia'; c.fillText('MASS MEETING', w / 2, 266); c.font = '22px Georgia'; c.fillText('Monday, 7 P.M.', w / 2, 298); });
    const flyerM = new THREE.MeshStandardMaterial({ map: flyerT, roughness: 0.85, side: THREE.DoubleSide });
    for (const [x, z, n] of [[0.95, -1.75, 14], [0.95, -1.15, 6]]) for (let k = 0; k < n; k++) { const f = mk(new THREE.PlaneGeometry(0.21, 0.27), flyerM, root, x + (R() - 0.5) * 0.01, deskY + 0.002 + k * 0.004, z + (R() - 0.5) * 0.01); f.rotation.set(-PI / 2, 0, (R() - 0.5) * 0.15); }
    const hemi = new THREE.HemisphereLight(0xfff4e0, 0x6a5040, 1.0); root.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d4, 2.0); root.add(sun, sun.target); sun.position.set(2.6, 4.0, 3.2); sun.target.position.set(0, 0.6, -1.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 12 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    const lampL = new THREE.PointLight(0xffd8a0, 1.4, 4, 1.6); lampL.position.set(-0.8, deskY + 0.38, -1.8); root.add(lampL);
    return { root, deskY, drum, crank, flyerM, flyerT };
  })();

  // ================================================================ CAST
  const mk1 = (o) => { const r = makeToon(o); scene.add(r.root); return r; };
  const torsoOf = (toon) => toon.armL.g.parent;
  function suit(toon, { jacket, shirt = 0xf4f2ec, tie = 0x6a1f24 }) {   // jacket sleeves to the wrist + a white shirt V and a tie on the chest
    const jm = std(jacket, 0.75);
    for (const arm of [toon.armL, toon.armR]) { const fore = arm.el.children.find((c) => c.isMesh && c.geometry.type === 'CapsuleGeometry'); if (fore) fore.material = jm; }
    const torso = torsoOf(toon), sh = new THREE.Shape(); sh.moveTo(-0.066, 0.36); sh.lineTo(0.066, 0.36); sh.lineTo(0, 0.17); sh.closePath();
    const v = mk(new THREE.ShapeGeometry(sh), std(shirt, 0.6), torso, 0, 0, 0.146); v.castShadow = false;
    const ti = mk(new THREE.BoxGeometry(0.03, 0.15, 0.012), std(tie, 0.5), torso, 0, 0.27, 0.15); ti.castShadow = false;
  }
  const S_SPD = 1.15, S_MLK = 1.15, S_GARY = 1.1;
  // the streamer: a generic hyper toon (plain orange tee, no print, no merch)
  const spd = mk1({ skin: 0x5e3a22, shirt: 0xff5a2e, pants: 0x1d1f24, shoes: 0xf4f4f4, hair: 0x111111, hairStyle: 'tuft', browScale: 1.15 });
  const notebook = new THREE.Group(); scene.add(notebook);
  { mk(new THREE.BoxGeometry(0.15, 0.012, 0.2), std(0x2a4a8a, 0.6), notebook, 0, 0, 0); const pg = mk(new THREE.PlaneGeometry(0.13, 0.18), std(0xfbf8ee, 0.8, { map: tex(128, 176, (c, w, h) => { c.fillStyle = '#fbf8ee'; c.fillRect(0, 0, w, h); c.strokeStyle = '#9ab8d8'; c.lineWidth = 2; for (let y = 24; y < h; y += 16) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); } c.strokeStyle = '#1b2760'; c.lineWidth = 2.4; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(12, 22 + k * 16); for (let x = 12; x < 40 + (k * 37) % 70; x += 6) c.lineTo(x, 22 + k * 16 + Math.sin(x * 0.7 + k) * 2.5); c.stroke(); } }) }), notebook, 0, 0.007, 0); pg.rotation.x = -PI / 2; }
  const pen = mk(new THREE.CylinderGeometry(0.005, 0.005, 0.13, 6), std(0x1d1d1d, 0.4), scene); pen.castShadow = false;
  const spdScr = tex(360, 770, (c, w, h) => { c.fillStyle = '#101014'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 200, 0, 560); g.addColorStop(0, '#d8c9a8'); g.addColorStop(1, '#8a7a5c'); c.fillStyle = g; c.fillRect(0, 200, w, 360);
    c.fillStyle = '#efe6d2'; c.fillRect(w / 2 - 6, 230, 12, 120); c.beginPath(); c.moveTo(w / 2 - 6, 230); c.lineTo(w / 2, 214); c.lineTo(w / 2 + 6, 230); c.fill(); c.fillStyle = '#6a6250'; c.fillRect(150, 350, 60, 210);
    for (let i = 0; i < 900; i++) { const y = 360 + (i * 37 % 200), x = (i * 53 % w); if (Math.abs(x - w / 2) < 30 && y < 470) continue; c.fillStyle = ['#3a3226', '#5a4e3a', '#e8dcc0', '#2a241c'][i % 4]; c.beginPath(); c.arc(x, y, 2 + (y - 360) / 60, 0, 7); c.fill(); }
    c.fillStyle = '#e8222e'; c.fillRect(0, 556, w * 0.62, 6); c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.62, 559, 9, 0, 7); c.fill(); c.font = '600 26px Inter, Arial'; c.fillText('March on Washington, 1963', 22, 610); c.fillStyle = '#9a9aa2'; c.font = '500 20px Inter, Arial'; c.fillText('archive footage', 22, 642); });
  const spdPhone = makePhone(spdScr); scene.add(spdPhone.g);
  // Gary, his cameraman (teal tee, cap, a handheld camera)
  const gary = mk1({ shirt: 0x2bb3a3, pants: 0x34495e, hair: 0x6b3f22, hairStyle: 'tuft', hat: 'cap', hatColor: 0x2bb3a3, skin: 0xf2c29a, browScale: 1.2 });
  const garyCam = new THREE.Group(); scene.add(garyCam);
  { mk(new RoundedBoxGeometry(0.14, 0.12, 0.22, 2, 0.02), std(0x1d1e22, 0.4), garyCam, 0, 0, 0); const ln = mk(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 14), std(0x0d0d10, 0.3), garyCam, 0, 0, 0.14); ln.rotation.x = PI / 2; mk(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3030 }), garyCam, 0.05, 0.05, 0.06); }
  const band = new THREE.Group(); gary.head.add(band); band.position.set(0.12, 0.08, 0.22); band.rotation.set(0, 0.45, -0.4);   // a plaster for the ending
  { const pm = std(0xf2e6d0, 0.7); mk(new THREE.BoxGeometry(0.13, 0.04, 0.015), pm, band); mk(new THREE.BoxGeometry(0.04, 0.13, 0.015), pm, band); }
  // Dr. King (a stylized toon: dark suit, white shirt, tie, short hair, moustache) + four generic fellow leaders
  const mlk = mk1({ skin: 0x6b4428, shirt: 0x2b2f38, pants: 0x2b2f38, shoes: 0x111111, hair: 0x141210, hairStyle: 'side', mustache: true, browScale: 1.05 });
  suit(mlk, { jacket: 0x2b2f38, tie: 0x2a2a30 });
  const LEAD = [
    { skin: 0x8a5a3b, jacket: 0x4a4f58, hair: 0x1d1612, tie: 0x7a2a2a },
    { skin: 0x5a3a24, jacket: 0x33363d, hair: 0x9a9a9a, tie: 0x2a3a5a },
    { skin: 0xe8c4a0, jacket: 0x50555e, hair: 0xcfc8bc, tie: 0x3a3a3a },
    { skin: 0x7a4a2e, jacket: 0x5a4636, hair: 0x1d1612, tie: 0x5a2a3a },
  ].map((o) => { const r = mk1({ skin: o.skin, shirt: o.jacket, pants: o.jacket, shoes: 0x151515, hair: o.hair, hairStyle: 'side' }); suit(r, { jacket: o.jacket, tie: o.tie }); return r; });
  const volunteer = mk1({ skin: 0x8a5a3b, shirt: 0xc9b48a, pants: 0x4a3a2a, shoes: 0x2a1d14, hair: 0x2b1d14, hairStyle: 'side' });
  const derek = mk1({ shirt: 0x3a7bd5, pants: 0x2f3e5a, hair: 0x2b1d14, hairStyle: 'messy', skin: 0xc68863 });
  const TOUR = [
    { shirt: 0xe2574c, pants: 0x34495e, hair: 0xd8a55a, hairStyle: 'side', skin: 0xf6d2b0 },
    { shirt: 0x3fb0c9, pants: 0x3d4250, hair: 0x2b1d14, hairStyle: 'messy', skin: 0x9c6644 },
    { shirt: 0xf2d232, pants: 0x4a3a2a, hair: 0x1a1a1a, hairStyle: 'tuft', skin: 0xe0a97e },
  ].map((o) => mk1(o));
  const people = [spd, gary, mlk, ...LEAD, volunteer, derek, ...TOUR];

  // ---------------------------------------------------------------- crowds
  const recolor = (cr, i, shirt, pants, hair) => { const C = new THREE.Color(); const M = cr.meshes;
    if (shirt != null) { M.chest.setColorAt(i, C.setHex(shirt)); M.arm.setColorAt(i * 2, C); M.arm.setColorAt(i * 2 + 1, C); }
    if (pants != null) { M.pelvis.setColorAt(i, C.setHex(pants)); M.leg.setColorAt(i * 2, C); M.leg.setColorAt(i * 2 + 1, C); }
    if (hair != null) { cr.people[i].bald = false; M.hair.setColorAt(i, C.setHex(hair)); } };
  // street fans (bright modern clothes)
  const FAN_N = 380, FANS = makeCrowd(scene, FAN_N, { seed: 851, shirt: 0xff5a5f });
  { const SH = [0xff5a5f, 0x2ec4b6, 0xffb703, 0x8e7dff, 0x3a86ff, 0xff8fab, 0x06d6a0, 0xf77f00, 0xffffff, 0x222222, 0xe23b3b], PA = [0x1d1f24, 0x34495e, 0x5a6a8a, 0xd8d0c0, 0x2a2a2a];
    for (let i = 0; i < FAN_N; i++) recolor(FANS, i, SH[Math.floor(hsh(i, 1) * SH.length)], PA[Math.floor(hsh(i, 2) * PA.length)]); }
  // 1955 walkers (period colours)
  const WALK_N = 70, WALKERS = makeCrowd(scene, WALK_N, { seed: 852, shirt: 0xe8e4da });
  { const SH = [0xe8e4da, 0x8a8d93, 0x6d7f9c, 0xd8c8a8, 0xa45a52, 0x5a6a4a, 0x3a3f4a, 0xbcd0e6], PA = [0x3a3f4a, 0x4a3a2a, 0x5a5e66, 0x2e3340, 0x6a5a48];
    for (let i = 0; i < WALK_N; i++) recolor(WALKERS, i, SH[Math.floor(hsh(i, 3) * SH.length)], PA[Math.floor(hsh(i, 4) * PA.length)], 0x1d1612); }
  // 1963 audience near the steps (detailed toons) — also the marchers behind the leaders
  const NEAR = [], NEAR_MAX = 820; { const R = rng(85); for (let z = 5.4; z < 25 && NEAR.length < NEAR_MAX; z += 1.0) for (let x = -20; x <= 20 && NEAR.length < NEAR_MAX; x += 1.0) NEAR.push({ x: x + (R() - 0.5) * 0.5, z: z + (R() - 0.5) * 0.5, yaw: (R() - 0.5) * 0.5, s: 1.0 + R() * 0.15, ph: R() * TAU }); }
  const NEAR_N = NEAR.length, AUD = makeCrowd(scene, NEAR_N, { seed: 853, shirt: 0xf3f1ea });
  { const SH = [0xf3f1ea, 0xf3f1ea, 0xe8e4da, 0x3a3f4a, 0x2e3340, 0x8a8d93, 0xbcd0e6, 0xd8c8a8, 0xe6b8c8, 0xf0e0a0, 0x6d7f9c, 0xa45a52], PA = [0x2e3340, 0x3a3f4a, 0x5a5e66, 0x6a5a48, 0x8a8478, 0x2a2a2a];
    for (let i = 0; i < NEAR_N; i++) recolor(AUD, i, SH[Math.floor(hsh(i, 5) * SH.length)], PA[Math.floor(hsh(i, 6) * PA.length)]); }
  // placards (six period slogans, paraphrased) on sticks, carried by every 19th person in the audience
  const SIGNS = [['EQUAL RIGHTS', 'NOW'], ['JOBS AND', 'FREEDOM'], ['VOTING RIGHTS', 'NOW'], ['END', 'SEGREGATION'], ['FREEDOM', 'NOW'], ['WE MARCH', 'TOGETHER']];
  const signer = (i) => i % 19 === 7;
  const SIGNERS = []; for (let i = 0; i < NEAR_N; i++) if (signer(i)) SIGNERS.push(i);
  const boardG = new THREE.PlaneGeometry(0.8, 0.5), stickG = new THREE.CylinderGeometry(0.014, 0.014, 0.75, 5);
  const boards = SIGNS.map(([a, b]) => { const m = new THREE.InstancedMesh(boardG, new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide, map: tex(384, 240, (c, w, h) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1b1b1b'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#1b1b1b'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fit = (s, y, px) => { let p = px; c.font = `bold ${p}px Arial`; while (c.measureText(s).width > w - 40 && p > 20) { p -= 2; c.font = `bold ${p}px Arial`; } c.fillText(s, w / 2, y); }; fit(a, 86, 62); c.fillStyle = '#9a1c25'; fit(b, 166, 66); }) }), SIGNERS.length); m.frustumCulled = false; m.castShadow = true; scene.add(m); return m; });
  const sticks = new THREE.InstancedMesh(stickG, std(0x8a6a44, 0.8), SIGNERS.length); sticks.frustumCulled = false; scene.add(sticks);
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

  // ---------------------------------------------------------------- props: the bus, flying flyers, newspapers, a medal
  const bus = makeBus({ color: 0x3f7a5a, stripe: 0xe8dcc0, sign: 'DOWNTOWN' }); scene.add(bus.g ?? bus);
  const busG = bus.g ?? bus;
  const FLY_N = 40, flyers = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.21, 0.27), OF.flyerM, FLY_N); flyers.frustumCulled = false; flyers.castShadow = true; scene.add(flyers);
  const NEWS = [
    { date: 'JULY 2, 1964', h: ['CIVIL RIGHTS ACT', 'SIGNED INTO LAW'], sub: 'Bans discrimination in public places and jobs' },
    { date: 'OCTOBER 14, 1964', h: ['DR. KING WINS', 'NOBEL PEACE PRIZE'], sub: 'At 35, the youngest winner ever' },
    { date: 'AUGUST 6, 1965', h: ['VOTING RIGHTS ACT', 'SIGNED INTO LAW'], sub: 'Bans racial discrimination in voting' },
  ].map((o, k) => {
    const T = tex(760, 1040, (c, w, h) => { c.fillStyle = '#f2ead6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1b1b'; c.textAlign = 'center';
      c.font = 'bold 74px Georgia'; c.fillText('★  E X T R A  ★', w / 2, 96); c.fillRect(40, 122, w - 80, 5); c.font = '22px Georgia'; c.fillText(o.date + '   ·   FIVE CENTS', w / 2, 156); c.fillRect(40, 170, w - 80, 2);
      const fit = (s, y, px) => { let p = px; c.font = `bold ${p}px Georgia`; while (c.measureText(s).width > w - 70 && p > 30) { p -= 2; c.font = `bold ${p}px Georgia`; } c.fillText(s, w / 2, y); };
      fit(o.h[0], 270, 92); fit(o.h[1], 372, 92); c.font = 'italic 32px Georgia'; c.fillText(o.sub, w / 2, 436); c.fillRect(40, 462, w - 80, 2);
      c.fillStyle = '#b8ac90'; c.fillRect(48, 486, 320, 250); c.fillStyle = '#8a7f68'; c.fillRect(48, 486, 320, 250); c.fillStyle = '#c9bea4'; for (let i = 0; i < 9; i++) c.fillRect(70 + i * 32, 600 - (i % 3) * 18, 18, 140);
      c.fillStyle = 'rgba(27,27,27,.55)'; for (let col = 0; col < 2; col++) for (let r = 0; r < 26; r++) { const x0 = col ? 392 : 48, ww = col ? 320 : 320; if (!col && r < 11) continue; c.fillRect(x0, 500 + r * 20, ww * (0.75 + 0.25 * hsh(r + col * 30, k)), 7); } });
    const m = mk(new THREE.PlaneGeometry(0.3, 0.3 * 1040 / 760), std(0xffffff, 0.85, { map: T, side: THREE.DoubleSide }), scene); m.castShadow = true; return m; });
  const medal = new THREE.Group(); scene.add(medal);
  { const gold = std(0xd8a838, 0.25, { metalness: 0.9 }); const d = mk(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 28), gold, medal, 0, 0.004, 0); d.castShadow = true;
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + PI / 2, r = i % 2 ? 0.012 : 0.026; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const sg = mk(new THREE.ExtrudeGeometry(star, { depth: 0.003, bevelEnabled: false }), gold, medal, 0, 0.009, 0); sg.rotation.x = -PI / 2;
    const rib = mk(new THREE.BoxGeometry(0.03, 0.002, 0.11), std(0x9a1c25, 0.7), medal, 0, 0.001, -0.08); rib.castShadow = false; }

  // ---------------------------------------------------------------- Derek's worksheet: U.S. HISTORY · CIVIL RIGHTS TIMELINE (Scribe fills its blanks)
  const WSW = 1024, WSH = 1325, wsC = document.createElement('canvas'); wsC.width = WSW; wsC.height = WSH; const wsG = wsC.getContext('2d');
  const wsTex = new THREE.CanvasTexture(wsC); wsTex.colorSpace = THREE.SRGBColorSpace; wsTex.anisotropy = 8;
  const TX = [60, 190, 640, 964], TY = [300, 362, 436, 510, 584, 658, 732];
  const ROWS = [['1955', 'Montgomery bus boycott', '381 days'], ['1963', 'March on Washington', '250,000 people'], ['1964', 'Civil Rights Act', 'signed July 2'], ['1964', 'Nobel Peace Prize', 'King, age 35'], ['1965', 'Voting Rights Act', 'signed Aug. 6']];
  const QF = '500 27px Georgia, serif', INK = '#1b2760';
  const kp = penKit(G, 85, { u: 25 }), ans = [];
  ans.push(kp.text('Derek', 150, 196, { u: 30 }));
  ROWS.forEach((r, i) => { const yb = TY[i + 1] + 48; ans.push(kp.text(r[1], TX[1] + 16, yb, { u: 25 })); ans.push(kp.text(r[2], TX[2] + 16, yb, { u: 25 })); });
  ans.push(kp.text('It built support for the Civil', 70, 872, { u: 26 })); ans.push(kp.text('Rights Act of 1964.', 70, 942, { u: 26 }));
  const items = ans.flat(), wt = (it) => (it.kind === 'p' ? it.w : 1);
  const NW = items.reduce((s, it) => s + wt(it), 0);
  const BLANKS = [[140, 160, 300, 50], ...ROWS.flatMap((r, i) => [[TX[1] + 6, TY[i + 1] + 6, TX[2] - TX[1] - 12, 62], [TX[2] + 6, TY[i + 1] + 6, TX[3] - TX[2] - 12, 62]]), [60, 836, 900, 54], [60, 906, 900, 54]];
  let wsKey = -1, wsTip = [WSW / 2, WSH / 2];
  function drawWS(p, outline = 0) {
    const key = Math.round(p * 4) / 4 + outline * 1000; if (key === wsKey) return wsTip; wsKey = key;
    const g = wsG; g.fillStyle = '#fffdf6'; g.fillRect(0, 0, WSW, WSH);
    g.fillStyle = '#1d1d1d'; g.font = '600 38px Inter, Arial'; g.fillText('U.S. HISTORY · UNIT 7: CIVIL RIGHTS', 60, 92);
    g.font = '500 24px Inter, Arial'; g.fillStyle = '#b3261e'; g.fillText('Due Friday  ·  HANDWRITTEN ANSWERS ONLY', 60, 134);
    g.fillStyle = '#333'; g.font = '500 26px Inter, Arial'; g.fillText('Name:', 60, 196); g.fillRect(140, 204, 300, 2);
    g.fillStyle = '#1d1d1d'; g.font = QF; g.fillText('1.  Complete the timeline of the civil rights movement.', 60, 272);
    g.strokeStyle = '#333'; g.lineWidth = 2; for (const x of TX) { g.beginPath(); g.moveTo(x, TY[0]); g.lineTo(x, TY[6]); g.stroke(); } for (const y of TY) { g.beginPath(); g.moveTo(TX[0], y); g.lineTo(TX[3], y); g.stroke(); }
    g.fillStyle = '#eceae2'; g.fillRect(TX[0] + 1, TY[0] + 1, TX[3] - TX[0] - 2, TY[1] - TY[0] - 2);
    g.fillStyle = '#1d1d1d'; g.font = '600 24px Inter, Arial'; g.textAlign = 'center'; g.fillText('Year', (TX[0] + TX[1]) / 2, TY[0] + 40); g.fillText('Event', (TX[1] + TX[2]) / 2, TY[0] + 40); g.fillText('Key fact', (TX[2] + TX[3]) / 2, TY[0] + 40);
    g.font = QF; ROWS.forEach((r, i) => g.fillText(r[0], (TX[0] + TX[1]) / 2, TY[i + 1] + 46)); g.textAlign = 'left';
    g.fillText('2.  Why did the March on Washington matter? (one sentence)', 60, 808);
    g.fillStyle = '#9aa6b8'; g.fillRect(60, 884, 900, 2); g.fillRect(60, 954, 900, 2);
    if (outline) { g.save(); g.strokeStyle = `rgba(154,28,37,${0.85 * outline})`; g.lineWidth = 4; g.setLineDash([12, 8]); for (const [x, y, w, h] of BLANKS) g.strokeRect(x, y, w, h); g.restore(); }
    g.save(); g.globalAlpha = 0.95;
    let acc = 0, tip = wsTip;
    for (const it of items) {
      const w = wt(it); if (acc >= p) break; const f = Math.min(1, (p - acc) / w);
      if (it.kind === 'g') { g.save(); g.beginPath(); g.rect(it.x - 2, it.y - 4, (it.w + 4) * f, it.h + 8); g.clip(); g.translate(it.x + it.w / 2, it.y + it.h / 2); g.rotate(it.rot || 0); g.drawImage(it.c, -it.w / 2, -it.h / 2, it.w, it.h); g.restore(); tip = [it.x + it.w * f, it.y + it.h * 0.6]; }
      else { const P = it.pts, nn = Math.max(2, Math.ceil(P.length * f)); g.strokeStyle = INK; g.lineWidth = it.line ?? 3.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); for (let j = 0; j < nn; j++) { const [x, y] = P[Math.min(j, P.length - 1)]; j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); tip = P[Math.min(nn - 1, P.length - 1)]; }
      acc += w;
    }
    g.restore(); wsTex.needsUpdate = true; wsTip = tip; return tip;
  }
  drawWS(0);

  // ---------------------------------------------------------------- the Scribe app on a portrait phone (720 × 1540)
  const PW = 720, PH = 1540, pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
  const pg = pc.getContext('2d'), ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 8;
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const PAGE = { x: 24, y: 236, w: 672 }; PAGE.h = PAGE.w * WSH / WSW;
  let phoneKey = '';
  function drawPhone(mode, k = 0, tip = null) {
    const key = mode + ':' + Math.round(k * 60) + ':' + wsKey; if (key === phoneKey) return; phoneKey = key;
    const g = pg; g.fillStyle = CREAM; g.fillRect(0, 0, PW, PH);
    g.fillStyle = '#1d1d1d'; g.font = '600 30px Inter, Arial'; g.fillText('9:41', 40, 56); g.fillRect(PW - 96, 34, 52, 24); g.fillStyle = CREAM; g.fillRect(PW - 92, 38, 30, 16);
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 84, PW, 110); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 194, PW, 2);
    g.drawImage(icon, 30, 104, 70, 70); g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.fillText('Scribe', 112, 156);
    g.font = '600 28px Inter, Arial'; const chip = 'History', cw = g.measureText(chip).width + 44; g.fillStyle = '#e7f2e4'; g.beginPath(); g.roundRect(PW - cw - 30, 116, cw, 50, 25); g.fill(); g.fillStyle = '#2f7d46'; g.fillText(chip, PW - cw - 8, 151);
    const button = (x, y, w, h, text, on = true) => { g.fillStyle = on ? RED : '#d8d1c3'; g.beginPath(); g.roundRect(x, y, w, h, 22); g.fill(); g.fillStyle = '#fff'; g.font = '600 38px Inter, Arial'; g.textAlign = 'center'; g.fillText(text, x + w / 2, y + h / 2 + 13); g.textAlign = 'left'; };
    if (mode === 'home') {
      g.drawImage(icon, PW / 2 - 150, 330, 300, 300);
      g.fillStyle = '#1d1d1d'; g.font = '58px Georgia, serif'; g.textAlign = 'center'; g.fillText('What are we', PW / 2, 760); g.fillText('solving today?', PW / 2, 836);
      g.fillStyle = '#6b665c'; g.font = '500 30px Inter, Arial'; g.fillText('Snap it. Solve it. Your hand.', PW / 2, 916); g.textAlign = 'left';
      button(80, 1010, PW - 160, 120, 'Take a photo'); button(80, 1160, PW - 160, 120, 'Upload a PDF', false);
    } else if (mode === 'cam') {
      g.fillStyle = '#121214'; g.fillRect(0, 196, PW, PH - 196);
      g.save(); g.translate(PW / 2, 760); g.rotate(-0.04); g.drawImage(wsC, -300, -388, 600, 776); g.restore();
      g.strokeStyle = '#ffffff'; g.lineWidth = 8; for (const [x, y, sx, sy] of [[70, 340, 1, 1], [PW - 70, 340, -1, 1], [70, 1180, 1, -1], [PW - 70, 1180, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 70); g.lineTo(x, y); g.lineTo(x + sx * 70, y); g.stroke(); }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(PW / 2, 1360, 70, 0, TAU); g.fill(); g.strokeStyle = '#121214'; g.lineWidth = 8; g.beginPath(); g.arc(PW / 2, 1360, 56, 0, TAU); g.stroke();
      if (k > 0) { g.fillStyle = `rgba(255,255,255,${clamp(1 - k) * 0.95})`; g.fillRect(0, 196, PW, PH - 196); }
    } else {   // found / write / done: the worksheet itself in the app, filled in his hand, an on-screen pen cursor at the tip
      g.fillStyle = '#ffffff'; g.fillRect(PAGE.x - 4, PAGE.y - 4, PAGE.w + 8, PAGE.h + 8); g.drawImage(wsC, PAGE.x, PAGE.y, PAGE.w, PAGE.h);
      g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.strokeRect(PAGE.x, PAGE.y, PAGE.w, PAGE.h);
      if (mode === 'write' && tip) {
        const px = PAGE.x + tip[0] * PAGE.w / WSW, py = PAGE.y + tip[1] * PAGE.h / WSH;
        g.save(); g.translate(px, py); g.rotate(-0.6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(4, -76, 18, 80); g.fillStyle = '#1a1b20'; g.fillRect(-8, -84, 16, 70); g.fillStyle = '#e0b04a'; g.beginPath(); g.moveTo(-8, -14); g.lineTo(8, -14); g.lineTo(0, 4); g.closePath(); g.fill(); g.fillStyle = RED; g.fillRect(-8, -92, 16, 10); g.restore();
        g.fillStyle = 'rgba(154,28,37,.25)'; g.beginPath(); g.arc(px, py, 14, 0, TAU); g.fill();
      }
      const by = PAGE.y + PAGE.h + 40;
      g.fillStyle = '#1d1d1d'; g.font = '44px Georgia, serif'; g.fillText(mode === 'done' ? 'Done. 13 blanks, your hand.' : mode === 'found' ? 'Worksheet found: 13 blanks' : 'Writing on your worksheet…', 40, by + 40);
      g.fillStyle = '#2f7d46'; g.font = '600 28px Inter, Arial'; g.fillText('History · answers written on the page', 40, by + 92);
      button(40, by + 130, PW - 80, 110, 'Download PDF', mode === 'done');
    }
    ptex.needsUpdate = true;
  }
  drawPhone('home');
  const phone = makePhone(ptex); scene.add(phone.g);
  const deskSheet = mk(new THREE.PlaneGeometry(0.27, 0.27 * WSH / WSW), new THREE.MeshStandardMaterial({ map: wsTex, roughness: 0.85 }), scene); deskSheet.rotation.x = -PI / 2; deskSheet.castShadow = false;
  const SHEETP = RMw(-0.15, 0.786, -1.55); deskSheet.position.set(...SHEETP); deskSheet.rotation.z = 0.06;
  const imprint = mk(new THREE.PlaneGeometry(0.2, 0.06), new THREE.MeshBasicMaterial({ map: tex(512, 160, (c, w, h) => { c.strokeStyle = '#d0141e'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#d0141e'; c.font = '64px "Luckiest Guy", "Arial Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HANDWRITTEN', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), scene);
  imprint.rotation.set(-PI / 2, 0, 0.22); imprint.position.set(SHEETP[0] + 0.02, SHEETP[1] + 0.002, SHEETP[2] + 0.1);
  const povHands = new THREE.Group(); scene.add(povHands);
  for (const sx of [-1, 1]) { const hg = new THREE.Group(); povHands.add(hg); hg.position.set(sx * 0.047, -0.07, -0.01); const m = mk(new THREE.SphereGeometry(0.027, 16, 12), derek.M.skin, hg); m.scale.set(0.8, 1.15, 0.9); const th = mk(new THREE.CapsuleGeometry(0.008, 0.028, 4, 8), derek.M.skin, hg, -sx * 0.012, 0.03, 0.014); th.rotation.z = sx * 0.25; mk(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 12), derek.M.skin, hg, sx * 0.01, -0.08, 0.07).rotation.x = -0.78; }
  const glowT = tex(64, 64, (c, w) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); flash.scale.setScalar(0.35); scene.add(flash);

  // ---------------------------------------------------------------- the split screen: the 1963 half is rendered to a texture and laid over the bottom of the frame
  const splitRT = new THREE.WebGLRenderTarget(1080, 1080, { type: THREE.HalfFloatType, samples: 4 });
  const cam2 = new THREE.PerspectiveCamera(50, 1, 0.1, 3000); scene.add(cam2);
  { const f2 = new THREE.PointLight(0xffe2c4, 0.5, 7, 2); f2.position.set(0.25, 0.15, 0); cam2.add(f2); }
  const SEP = { value: 0.72 };
  const splitMat = new THREE.MeshBasicMaterial({ map: splitRT.texture, depthTest: false, depthWrite: false, fog: false });
  splitMat.onBeforeCompile = (sh) => { sh.uniforms.uSep = SEP; sh.fragmentShader = 'uniform float uSep;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n{ float l = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(l * 1.08, l * 0.9, l * 0.66), uSep); }'); };
  const splitPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), splitMat); splitPlane.renderOrder = 998; splitPlane.frustumCulled = false; splitPlane.castShadow = false; studio.camera.add(splitPlane);

  // ---------------------------------------------------------------- DOM overlay under the captions: the stream UI, the split divider + VS badge
  const ui = document.getElementById('ui'), su = document.createElement('canvas'); su.width = 1080; su.height = 1920;
  su.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;'; ui.insertBefore(su, ui.firstChild);
  const sg = su.getContext('2d'); let suKey = '';
  const CHAT = [['wolfpack22', 'W'], ['mia.k', 'NO WAY'], ['jj_runs', 'LETS GOOO'], ['tiny.tom', 'a MILLION??'], ['ana.b', 'goat'], ['lilnoodle', 'chat is this real'], ['ryder', 'W STREAM'], ['zee', 'HISTORY']];
  function drawUI(st) {
    const key = JSON.stringify(st); if (key === suKey) return; suKey = key;
    sg.clearRect(0, 0, 1080, 1920);
    if (st.split != null) {   // a jagged white seam with a dark edge + a red VS badge on the right (clear of the centred caption)
      const y = st.split * 1920; sg.save(); sg.beginPath(); sg.moveTo(0, y - 9); for (let x = 0; x <= 1080; x += 54) sg.lineTo(x, y + ((x / 54) % 2 ? 9 : -9)); sg.lineTo(1080, y + 9); for (let x = 1080; x >= 0; x -= 54) sg.lineTo(x, y + 9 + ((x / 54) % 2 ? 9 : -9) + 8); sg.closePath();
      sg.fillStyle = '#ffffff'; sg.shadowColor = 'rgba(0,0,0,.6)'; sg.shadowBlur = 14; sg.fill(); sg.restore();
      if (st.vs) { sg.save(); sg.translate(890, y); sg.rotate(-0.12); sg.fillStyle = '#e8222e'; sg.strokeStyle = '#fff'; sg.lineWidth = 10; sg.beginPath(); sg.arc(0, 0, 74, 0, TAU); sg.fill(); sg.stroke();
        sg.fillStyle = '#fff'; sg.font = '400 84px "Luckiest Guy", "Arial Black"'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText('VS', 0, 8); sg.restore(); }
    }
    if (st.live) {
      sg.save(); sg.fillStyle = '#e8222e'; sg.beginPath(); sg.roundRect(44, 150, 132, 62, 14); sg.fill(); sg.fillStyle = '#fff'; sg.font = '800 38px Inter, Arial'; sg.fillText('LIVE', 66, 195);
      const v = Math.round(st.viewers).toLocaleString('en-US') + ' watching'; sg.font = '700 34px Inter, Arial'; const vw = sg.measureText(v).width + 48;
      sg.fillStyle = 'rgba(10,10,14,.6)'; sg.beginPath(); sg.roundRect(188, 150, vw, 62, 14); sg.fill(); sg.fillStyle = '#fff'; sg.fillText(v, 212, 193);
      for (let k = 0; k < st.chat; k++) { const m = CHAT[(st.chat - 1 - k) % CHAT.length], y = 1390 - k * 66; if (y < 1130) break; sg.globalAlpha = 1 - k * 0.14;
        sg.font = '700 32px Inter, Arial'; const nw = sg.measureText(m[0] + '  ').width; sg.font = '600 32px Inter, Arial'; const tw2 = sg.measureText(m[1]).width;
        sg.fillStyle = 'rgba(10,10,14,.5)'; sg.beginPath(); sg.roundRect(44, y - 42, nw + tw2 + 40, 56, 16); sg.fill();
        sg.font = '700 32px Inter, Arial'; sg.fillStyle = ['#ffd23f', '#7ee0ff', '#ff9ad5', '#9dff8a'][(st.chat - 1 - k) % 4]; sg.fillText(m[0], 64, y - 3); sg.font = '600 32px Inter, Arial'; sg.fillStyle = '#fff'; sg.fillText(m[1], 64 + nw, y - 3); }
      sg.restore();
    }
  }

  // ================================================================ TIMES
  const CH0 = t.in1 - 0.1, VRUN = 7.2;
  const xsAt = (tt) => -8 + VRUN * (tt - CH0);                              // the streamer sprinting down the road toward the lens
  const TRIP = t.gary + 0.12, XG = xsAt(TRIP) - 2.2, STOMP = t.gary + 0.36; // Gary slips, then the crowd runs over him
  const garyF = (tt) => (tt < STOMP ? 1 : lerp(1, 0.34, easeOutBack(u01(tt, STOMP, STOMP + 0.3))));
  const BUS0 = t.in2 - 0.05, VWALK = 1.25;
  const FLY0 = t.no1 - 0.25, FLYP = 0.055;
  const STAMP = t.handwritten + 0.04, FLASH = t.photo + 0.06, FOUND0 = t.and1 - 0.05, WRITE0 = t.fills - 0.05, WRITE1 = t.so2 - 0.22;
  const writeP = (tt) => NW * smooth(u01(tt, WRITE0, WRITE1)) ** 0.85;
  const NEWS_T = [t.civil2 - 0.3, t.nobel - 0.2, t.voting - 0.3], MEDAL_T = t.nobel + 0.75;
  const NEWS_P = [[-0.1, 0.002, -1.27, 0.1], [-0.04, 0.006, -1.25, -0.07], [-0.08, 0.010, -1.26, 0.05]];
  const VERDICT = t.no2 - 0.02;
  const splitAt = (tt, sh) => (sh.id === 'verdict' ? lerp(0.46, 0.17, easeOutBack(u01(tt, VERDICT, VERDICT + 0.38))) : 0.46);

  // ---------------------------------------------------------------- FX + kicks
  const fx = makeFX(scene, { max: { dust: 600, confetti: 500, spark: 200, glow: 60, smoke: 200 }, nearFade: [0.3, 1.1] });
  const dizzy = makeDizzy(scene, { r: 0.34, n: 5, size: 0.08 });
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.12, 0.18);
  kick(0.06, 0.5); kick(t.versus, 0.35); kick(t.who, 0.3);
  kick(t.speed - 0.02, 0.4); kick(t.million2, 0.3); kick(t.live, 0.6);
  for (let k = 0; k < 30; k++) { const tt = t.speed + k * 0.06; if (tt > t.one1) break; fx.burst('confetti', tt, { pos: [10 + (k % 5 - 2) * 0.8, 2.6, -1.6], n: 6, speed: [1, 3], spread: 2.4, floor: SIDEWALK_H, seed: 300 + k }); }
  kick(CH0 + 0.05, 0.5); kick(t.tens, 0.4); kick(t.chase, 0.5);
  for (let k = 0; k < 40; k++) { const tt = CH0 + k * 0.07; if (tt > t.gary - 0.1) break; fx.burst('dust', tt, { pos: [xsAt(tt) - 4 - (k % 4) * 3, 0.2, 1.2 + (k % 5) * 1.2], n: 3, spread: 1.6, speed: [0.5, 2], size: [0.4, 0.9], color: 0xb8a890, seed: 400 + k }); }
  kick(TRIP, 0.6); kick(STOMP, 1.1, 0.6); kick(STOMP + 0.22, 0.6); kick(t.flattened, 0.5);
  fx.burst('dust', STOMP, { pos: [XG + 0.6, 0.15, 2.6], n: 9, spread: 1.6, speed: [1, 3], size: [0.25, 0.5], color: 0xb8a890 });
  fx.burst('spark', STOMP + 0.05, { pos: [XG + 0.6, 0.4, 2.6], n: 24, color: 0xffe08a, speed: [1, 3.5], spread: 1.6 });
  kick(STAMP, 0.9); kick(FLASH, 0.35); kick(WRITE0, 0.3); kick(t.handwriting + 0.1, 0.35);
  fx.burst('spark', STAMP, { pos: add(SHEETP, [0.02, 0.02, 0.1]), n: 16, color: 0xff6b6b, speed: [0.4, 1.2], spread: 1.4 });
  kick(t.so2, 0.3); kick(VERDICT, 0.9, 0.5);
  kick(t.speed3, 0.25);

  // ---------------------------------------------------------------- the end card (Scribe) via brhud (only its end card is used)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: null, day: [[0, '']], feed: [], end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ================================================================ CAMERA HELPERS
  const headW = (toon) => { toon.root.updateMatrixWorld(true); return toon.head.getWorldPosition(V(0, 0, 0)).toArray(); };
  const glide = (p0, l0, p1, l1, fov, t0, t1, fov1 = fov) => (tt) => { const u = smooth(u01(tt, t0, t1)); return { pos: L3(p0, p1, u), look: L3(l0, l1, u), fov: lerp(fov, fov1, u) }; };
  const SPD0 = [1.5, 0, 3.4];   // where he streams from (the road in front of the market)
  // a selfie lens framed so his face lands at fraction fy of the frame (the phone is the camera)
  const selfie = (d, fov, fy, dx = 0.12) => () => { const h = headW(spd), fh = 2 * d * Math.tan(fov * PI / 360); return { pos: [h[0] + dx, h[1] + 0.06, h[2] + d], look: [h[0], h[1] - (0.5 - fy) * fh, h[2]], fov }; };
  const scrP = V(0, 0, 0), scrN = V(0, 0, 0), scrQ = new THREE.Quaternion(), scrU = V(0, 0, 0);
  const phoneW = (px, py) => { phone.scr.updateWorldMatrix(true, false); return phone.scr.localToWorld(V((px / PW - 0.5) * 0.072, (0.5 - py / PH) * 0.154, 0)); };
  const screenCam = (px, py, d, fov = 34) => { phone.scr.updateWorldMatrix(true, false); phone.scr.getWorldQuaternion(scrQ); scrN.set(0, 0, 1).applyQuaternion(scrQ); scrU.set(0, 1, 0).applyQuaternion(scrQ); const c = phoneW(px, py); scrP.copy(c).addScaledVector(scrN, d); return { pos: scrP.toArray(), look: c.toArray(), fov, up: scrU.toArray() }; };
  const KINGP = [0, SY, -7.3];
  const BOT = {   // the 1963 half of the split screens (rendered into splitRT)
    hook: (tt) => tt < t.who - 0.04 ? glide(MLw(0.55, SY + 1.05, -4.2), MLw(0, SY + 1.15, -7.3), MLw(0.45, SY + 1.08, -4.7), MLw(0, SY + 1.18, -7.3), 36, 0, t.who)(tt)
      : glide(MLw(-1.4, SY + 2.6, -10.6), MLw(0, 0, 70), MLw(-2.4, SY + 6.5, -12.2), MLw(0, 0, 90), 52, t.who, t.speed)(tt),
    verdict: glide(MLw(-14, 22, -6), MLw(0, 0, 110), MLw(-17, 34, -4), MLw(0, 0, 150), 56, t.so2, t.then),
  };

  // ================================================================ SHOTS (hard cuts between framings; each glides)
  const SHOTS = [
    { id: 'vs', t0: 0, set: 'st', split: 'hook', cam: (tt) => { const d = tt < t.who ? lerp(1.75, 1.6, u01(tt, 0, t.who)) : lerp(1.6, 3.2, smooth(u01(tt, t.who, t.who + 0.7))); return selfie(d, 58, 0.22)(); } },
    { id: 'subs', t0: t.speed - 0.04, set: 'st', cam: glide([10.45, 2.3, 3.6], [10.0, 1.3, -2.2], [10.4, 2.25, 3.1], [10.0, 1.35, -2.2], 46, t.speed, t.one1) },
    { id: 'live', t0: t.one1 - 0.05, set: 'st', cam: (tt) => selfie(lerp(1.55, 1.3, smooth(u01(tt, t.one1, t.in1))), 58, 0.36)() },
    { id: 'chase', t0: t.in1 - 0.04, set: 'st', cam: glide([13.4, 1.15, 3.1], [-2, 2.45, 3.5], [12.6, 1.1, 3.15], [-2, 2.4, 3.5], 44, t.in1, t.gary) },
    { id: 'splat', t0: t.gary - 0.05, set: 'st', cam: glide([XG + 0.9, 3.3, 5.6], [XG + 0.75, 0.1, 2.55], [XG + 0.85, 3.0, 5.3], [XG + 0.75, 0.1, 2.55], 44, t.gary, t.now) },
    { id: 'king', t0: t.now - 0.04, set: 'of', cam: glide(OFw(0.3, 1.5, 0.95), OFw(-0.3, 0.98, -2.0), OFw(0.18, 1.48, 0.45), OFw(-0.32, 1.0, -2.0), 40, t.now, t.no1) },
    { id: 'flyers', t0: t.no1 - 0.04, set: 'of', cam: glide(OFw(0.02, 1.04, -0.38), OFw(0.5, 0.92, -1.42), OFw(0.08, 1.02, -0.5), OFw(0.52, 0.92, -1.42), 50, t.no1, t.in2) },
    { id: 'bus', t0: t.in2 - 0.04, set: 'sb', cam: (tt) => { const u = tt - t.in2; return { pos: SBw(8.6 + 0.55 * u, 2.0, -0.3), look: SBw(1.2 + 1.0 * u, 1.0, -0.05), fov: 48 }; } },
    { id: 'walk', t0: t.people1 - 0.04, set: 'sb', cam: (tt) => { const xf = 2.5 + VWALK * (tt - t.people1); return { pos: SBw(xf + 3.6, 1.55, 2.3), look: SBw(xf - 4.5, 0.95, -1.0), fov: 46 }; } },
    { id: 'arrive', t0: t.in3 - 0.04, set: 'ml', cam: (tt) => { const u = tt - t.in3; const zl = 41.4 - 0.95 * u; return { pos: MLw(0.8, 1.55, zl - 5.8), look: MLw(0, 0.45, zl), fov: 46 }; } },
    { id: 'crane', t0: t.two - 0.05, set: 'ml', cam: glide(MLw(-7, 13, -4), MLw(0, 0, 110), MLw(-10, 26, -2), MLw(0, 0, 160), 54, t.two, t.in4) },
    { id: 'react', t0: t.in4 - 0.04, set: 'st', cam: (tt) => selfie(lerp(1.9, 1.65, u01(tt, t.in4, t.he1)), 54, 0.36, 0.45)() },
    { id: 'podium', t0: t.he1 - 0.04, set: 'ml', cam: glide(MLw(-0.42, SY + 1.95, -9.95), MLw(0.6, SY - 0.9, 30), MLw(-0.38, SY + 1.9, -9.75), MLw(0.6, SY - 0.9, 30), 50, t.he1, t.calling) },
    { id: 'kingfront', t0: t.calling - 0.05, set: 'ml', cam: glide(MLw(0.8, 2.5, 6.4), MLw(0, SY + 0.72, -7.3), MLw(0.7, 2.5, 5.9), MLw(0, SY + 0.75, -7.3), 13, t.calling, t.every) },
    { id: 'faces', t0: t.every - 0.05, set: 'ml', cam: glide(MLw(4.0, 1.85, 6.2), MLw(5.6, 1.25, 13.5), MLw(4.4, 1.85, 6.0), MLw(6.2, 1.25, 13.5), 48, t.every, t.back) },
    { id: 'room', t0: t.back - 0.04, set: 'rm', cam: glide(RMw(1.55, 1.75, 1.1), RMw(-0.3, 1.0, -1.45), RMw(1.25, 1.65, 0.75), RMw(-0.3, 1.0, -1.45), 50, t.back, t.history) },
    { id: 'sheet', t0: t.history - 0.05, set: 'rm', cam: glide(add(SHEETP, [0.0, 0.5, 0.26]), add(SHEETP, [0, 0, 0.005]), add(SHEETP, [0.0, 0.42, 0.21]), add(SHEETP, [0, 0, 0.0]), 44, t.history, t.so1) },
    { id: 'open', t0: t.so1 - 0.04, set: 'rm', cam: (tt) => { const c = phoneW(PW / 2, PH * 0.5).toArray(), u = smooth(u01(tt, t.so1, t.one2)); return { pos: add(c, [0.03, 0.1 - 0.02 * u, 0.36 - 0.07 * u]), look: c, fov: 46 }; } },
    { id: 'snap', t0: t.one2 - 0.05, set: 'rm', cam: (tt) => { const u = u01(tt, t.one2, t.and1); return { pos: add(SHEETP, [0.05, 0.42 - 0.05 * u, 0.2]), look: add(SHEETP, [0, 0.08, 0.0]), fov: 46 }; } },
    { id: 'write', t0: t.and1 - 0.05, set: 'rm', cam: (tt) => { const u = smooth(u01(tt, WRITE0, WRITE1)); const py = lerp(PAGE.y + PAGE.h * 0.3, PAGE.y + PAGE.h * 0.62, u), d = lerp(0.21, 0.19, u); return screenCam(PW / 2, tt < WRITE0 ? PH * 0.42 : py, tt < WRITE0 ? 0.24 : d); } },
    { id: 'verdict', t0: t.so2 - 0.04, set: 'st', split: 'verdict', cam: (tt) => selfie(lerp(3.0, 3.3, u01(tt, t.so2, t.then)), 58, 0.21)() },
    { id: 'news', t0: t.then - 0.04, set: 'of', cam: (tt) => { const k = tt < NEWS_T[1] + 0.2 ? 0 : tt < NEWS_T[2] + 0.2 ? 1 : 2, P = NEWS_P[k], u = u01(tt, k ? NEWS_T[k] + 0.2 : t.then, k === 2 ? t.king3 : NEWS_T[k + 1] + 0.2);
      return { pos: OFw(P[0] + 0.01, 0.79 + lerp(1.08, 0.94, smooth(u)), P[2] + 0.13), look: OFw(P[0], 0.79, P[2] - 0.01), fov: 40 }; } },
    { id: 'moved', t0: t.king3 - 0.04, set: 'ml', cam: glide(MLw(0.55, SY + 1.6, -9.6), MLw(0, SY + 0.4, 25), MLw(-3, 26, 16), MLw(0, 0, 260), 52, t.king3, t.speed3) },
    { id: 'notes', t0: t.speed3 - 0.05, set: 'ml', modern: true, cam: glide(MLw(4.3, 1.15, 4.1), MLw(2.7, 2.85, -1.0), MLw(4.1, 1.2, 3.6), MLw(2.7, 2.9, -1.0), 46, t.speed3, END) },
  ].sort((a, b) => a.t0 - b.t0);
  SHOTS.forEach((s, i) => { s.t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : END + 1; });
  window.EDSTUDIO_CUTS = [...SHOTS.slice(1).map((s) => s.t0), t.who - 0.04];
  const kickR = makeKick(KICKS);
  const shotAt = (tt) => { let s = SHOTS[0]; for (const x of SHOTS) if (tt >= x.t0) s = x; return s; };

  // ================================================================ PER-FRAME
  const glCanvas = renderer.domElement;
  function useSet(set, sepia) {
    ST.root.visible = set === 'st'; SB.root.visible = set === 'sb'; ML.root.visible = set === 'ml'; ROOM.root.visible = set === 'rm'; OF.root.visible = set === 'of';
    const cam = studio.camera;
    if (set === 'st') { scene.fog = STfog; scene.background = STfog.color; cam.near = 0.05; cam.far = 400; scene.environmentIntensity = 0.45; renderer.toneMappingExposure = 1.0; }
    else if (set === 'sb') { scene.fog = SBfog; scene.background = SBfog.color; cam.near = 0.05; cam.far = 400; scene.environmentIntensity = 0.45; renderer.toneMappingExposure = 1.0; }
    else if (set === 'ml') { scene.fog = ML.fog; scene.background = ML.fog.color; cam.near = 0.08; cam.far = 3000; scene.environmentIntensity = 0.45; renderer.toneMappingExposure = 1.08; }
    else if (set === 'rm') { scene.fog = null; scene.background = new THREE.Color(0x141826); cam.near = 0.01; cam.far = 60; scene.environmentIntensity = 0.25; renderer.toneMappingExposure = 1.05; }
    else { scene.fog = null; scene.background = new THREE.Color(0x2a2620); cam.near = 0.02; cam.far = 40; scene.environmentIntensity = 0.3; renderer.toneMappingExposure = 1.0; }
    cam.updateProjectionMatrix();
    // the filter goes on BOTH canvases: with motion blur (the full render) main.js averages the sub-frames on a 2-D canvas laid
    // over the GL one (gl.nextElementSibling), and a filter on the GL canvas alone never reaches the video (stills only)
    const filt = sepia > 0.001 ? `sepia(${(0.62 * sepia).toFixed(3)}) saturate(${(1 - 0.18 * sepia).toFixed(3)}) contrast(${(1 + 0.05 * sepia).toFixed(3)})` : '';
    for (const el of [glCanvas, glCanvas.nextElementSibling]) if (el && el.tagName === 'CANVAS') el.style.filter = filt;
  }
  const hideAll = () => {
    for (const r of people) r.root.visible = false;
    for (const x of [notebook, pen, garyCam, spdPhone.g, busG, flyers, ...NEWS, medal, phone.g, deskSheet, imprint, povHands, flash, splitPlane]) x.visible = false;
    for (const cr of [FANS, WALKERS, AUD]) { cr.hideAll(); cr.commit(); }
    for (const b of boards) b.visible = false; sticks.visible = false;
    dizzy.update(0, 0, [0, 0, 0]); band.visible = false;
    ML.massB.visible = ML.massH.visible = true; ML.massB.count = ML.massH.count = ML.MASS_ALL;
  };
  const put = (toon, p) => { toon.root.visible = true; toon.set(p); };
  const STANCE = { legL: { x: 0.05, z: 0.14 }, legR: { x: -0.05, z: 0.14 }, armL: { x: 0.05, z: 0.22, el: 0.1 }, armR: { x: 0.05, z: 0.22, el: 0.1 } };
  const handAt = (toon, side) => { toon.root.updateMatrixWorld(true); return toon.hand(side).getWorldPosition(V(0, 0, 0)); };

  // ---- the streamer, live (hype): bouncing, screaming at the lens held out in his right hand
  function streamer(tt, o = {}) {
    const hop = Math.abs(Math.sin(tt * 8.5)), base = o.base ?? SPD0;
    put(spd, { x: base[0], y: (base[1] || 0) + (o.hop ?? 0.07) * hop, z: base[2], rotY: o.rotY ?? 0, scale: S_SPD, lean: 0.06,
      armR: o.armR ?? { x: -1.45, z: -0.05, el: 0.12 }, armL: o.armL ?? { x: -2.5 + 0.35 * Math.sin(tt * 9), z: 0.45, el: 1.3 },
      legL: { x: -0.15 * hop, kn: 0.3 * hop }, legR: { x: 0.1 * hop, kn: 0.2 * hop },
      head: { x: -0.05, y: 0.12 * Math.sin(tt * 3.1), z: 0.1 * Math.sin(tt * 4.3) }, eyes: o.eyes ?? 'wide', mouth: o.mouth ?? (Math.sin(tt * 11) > -0.3 ? 'scream' : 'teeth'), brows: 0.4, hairUp: 0.35, look: [0, 0], t: tt });
  }
  // ---- fans behind him (selfie shots): phones up, bouncing
  function fansBehind(tt, cx, cz, n = 90, spread = 4.6) {
    for (let i = 0; i < n; i++) { const a = hsh(i, 7), b = hsh(i, 8), x = cx - spread + a * spread * 2, z = cz - 0.9 - b * 5.2, ph = tt * 7 + i;
      FANS.set(i, { x, y: (z < 0 ? SIDEWALK_H : 0) + 0.06 * Math.abs(Math.sin(ph)), z, rotY: Math.atan2(cx - x, cz + 2 - z) * 0.6, scale: 1.05 + 0.1 * hsh(i, 9), phone: i % 3 !== 0, armL: i % 3 === 0 ? { x: -2.7, z: 0.4 + 0.2 * Math.sin(ph) } : { x: -1.2, z: 0.1 }, armR: { x: -2.4 + 0.3 * Math.sin(ph), z: 0.35 }, look: [0, 0.2], wide: i % 4 === 0, t: tt }); }
    FANS.commit();
  }
  // ---- the 1963 audience in front of the steps (and the placards)
  const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), P4 = new THREE.Vector3(), S4 = new THREE.Vector3(), E4 = new THREE.Euler();
  function audience(tt, camPos, o = {}) {
    let si = 0; const cheer = o.cheer ?? 0;
    for (let i = 0; i < NEAR_N; i++) {
      const p = NEAR[i]; let x = p.x, z = p.z, rotY = PI + p.yaw, walk = 0;
      if (o.march) { z = 47 + (z - 5.4) * 1.55; x = p.x * 0.55; rotY = PI + p.yaw * 0.3; z -= 0.95 * (tt - t.in3); walk = 1; }
      const wx = ML0[0] + x, wz = ML0[2] + z;
      if (camPos && Math.hypot(wx - camPos[0], wz - camPos[2]) < 1.3) { AUD.set(i, null); if (signer(i)) { boards[si % 6].setMatrixAt(Math.floor(si / 6), ZERO); sticks.setMatrixAt(si, ZERO); si++; } continue; }
      const ph = tt * (walk ? 6.5 : 2) + p.ph, up = cheer * (0.5 + 0.5 * Math.sin(ph * 2));
      const sign = signer(i);
      AUD.set(i, { x: wx, y: walk ? 0.03 * Math.abs(Math.sin(ph)) : cheer * 0.08 * Math.abs(Math.sin(ph * 2)), z: wz, rotY, scale: p.s, kick: walk ? 0.4 : 0, t: tt,
        armL: cheer > 0 && i % 3 === 0 ? { x: -2.7, z: 0.3 + 0.2 * up } : walk ? { x: Math.sin(ph) * 0.4, z: 0.12 } : { x: -0.1, z: 0.12 },
        armR: sign ? { x: -2.85, z: 0.12 } : cheer > 0 && i % 3 === 0 ? { x: -2.7, z: 0.3 + 0.2 * up } : walk ? { x: -Math.sin(ph) * 0.4, z: 0.12 } : { x: -0.1, z: 0.12 },
        headX: walk ? 0 : -0.18, look: [0.1 * Math.sin(p.ph), walk ? 0 : 0.5] });
      if (sign) { const s = p.s, cy = Math.cos(rotY), syy = Math.sin(rotY), lx = 0.2 * s, lz = 0.06 * s;
        const bx = wx + lx * cy + lz * syy, bz = wz - lx * syy + lz * cy;
        Q4.setFromEuler(E4.set(0, rotY, 0.05 * Math.sin(tt * 2 + i)));
        M4.compose(P4.set(bx, 2.12 * s, bz), Q4, S4.set(s, s, s)); boards[si % 6].setMatrixAt(Math.floor(si / 6), M4);
        M4.compose(P4.set(bx, 1.62 * s, bz), Q4, S4.set(s, s, s)); sticks.setMatrixAt(si, M4); si++; }
    }
    AUD.commit(); for (const b of boards) { b.visible = true; b.instanceMatrix.needsUpdate = true; } sticks.visible = true; sticks.instanceMatrix.needsUpdate = true;
  }
  // ---- Dr. King at the lectern (speaking = a slow open hand + the mouth moving; never a joke)
  function kingAtLectern(tt, o = {}) {
    const sp = o.speaking ?? false, wave = o.wave ?? 0;
    put(mlk, { x: ML0[0] + KINGP[0], y: SY, z: ML0[2] + KINGP[2], rotY: 0, scale: S_MLK,
      armL: { x: -0.55, z: 0.12, el: 0.95 }, armR: wave > 0 ? { x: lerp(-0.6, -2.6, wave), z: 0.45, el: lerp(0.9, 0.3, wave) } : sp ? { x: -1.0 - 0.22 * Math.sin(tt * 2.3), z: 0.35, el: 0.75 } : { x: -0.55, z: 0.12, el: 0.95 },
      head: { x: -0.06, y: 0.14 * Math.sin(tt * 0.8), z: 0 }, eyes: 'open', mouth: sp ? (Math.sin(tt * 12.5) > 0.15 ? 'o' : 'flat') : 'smile', brows: -0.05, look: [0.08 * Math.sin(tt * 0.8), 0.12], t: tt });
    LEAD.forEach((r, i) => { const x = [-2.0, 2.0, -3.6, 3.6][i]; put(r, { x: ML0[0] + x, y: SY, z: ML0[2] - 10.6 - (i > 1 ? 0.5 : 0), rotY: -x * 0.06, scale: 1.1, ...STANCE, armL: { x: -0.3, z: 0.1, el: 0.5 }, armR: { x: -0.3, z: 0.1, el: 0.5 }, eyes: 'open', mouth: 'smile', brows: 0, head: { y: -x * 0.05 }, t: tt + i }); });
  }
  function mall63(tt, camPos, o = {}) {
    ML.aim(o.aim?.[0] ?? 0, o.aim?.[1] ?? 6, o.aim?.[2] ?? 22, o.front ? ML.SUN_DIR : ML.SUN_BACK);
    kingAtLectern(tt, o); audience(tt, camPos, o);
  }

  // ---- render the 1963 half into splitRT (the street stays the main scene)
  function renderSplit(tt, sh, s) {
    const c = BOT[sh.split](tt);
    mall63(tt, c.pos, { speaking: false, front: sh.split === 'hook' && tt < t.who - 0.04, aim: [0, 10, 40] });
    ST.root.visible = false; ML.root.visible = true; scene.fog = ML.fog; scene.background = ML.fog.color;
    cam2.position.set(...c.pos); cam2.up.set(0, 1, 0); cam2.lookAt(...c.look); cam2.fov = c.fov; cam2.aspect = (9 / 16) / (1 - s); cam2.near = 0.1; cam2.far = 3000; cam2.updateProjectionMatrix(); cam2.updateMatrixWorld();
    const prevT = renderer.getRenderTarget(); renderer.setRenderTarget(splitRT); renderer.clear(); renderer.render(scene, cam2); renderer.setRenderTarget(prevT);
    ST.root.visible = true; ML.root.visible = false; scene.fog = STfog; scene.background = STfog.color;
  }

  function update(tt) {
    const sh = shotAt(tt), id = sh.id; hideAll();
    const sepia = sh.set === 'of' || sh.set === 'sb' || (sh.set === 'ml' && !sh.modern) ? (id === 'moved' ? 1 - smooth(u01(tt, t.king3 + 0.3, t.speed3 - 0.1)) : 1) : 0;
    useSet(sh.set, sepia);
    let cam = sh.cam(tt);
    const camW = cam.pos;

    // ======================================================== HOOK + THE STREAMER
    if (id === 'vs' || id === 'live' || id === 'react') {
      ST.aimSun(SPD0[0], SPD0[2] - 1, 9);
      const react = id === 'react';
      streamer(tt, react ? { hop: 0, armR: { x: -1.25, z: 0.05, el: 0.7 }, armL: { x: -0.2, z: 0.2, el: 0.3 }, eyes: 'wide', mouth: 'o' } : {});
      if (react) { const k = u01(tt, t.in4, t.in4 + 0.35); spd.set({ x: SPD0[0], y: 0, z: SPD0[2], rotY: 0, scale: S_SPD, ...STANCE, armR: { x: lerp(-1.25, -0.6, k), z: 0.05, el: lerp(0.7, 0.4, k) }, armL: { x: -0.2, z: 0.2, el: 0.3 }, head: { x: lerp(0.25, -0.05, k) }, eyes: 'wide', mouth: 'o', brows: 0.85, look: [0, lerp(-0.6, 0, k)], t: tt });
        spdPhone.g.visible = true; const hp = handAt(spd, 1); spdPhone.g.position.set(hp.x, hp.y + 0.06, hp.z + 0.05); spdPhone.g.rotation.set(-0.9 + 0.5 * k, 0, 0); }
      fansBehind(tt, SPD0[0], SPD0[2], id === 'vs' ? 110 : 90);
      if (id === 'live') { const v = Math.round(lerp(812406, 1043028, smooth(u01(tt, t.one1, t.live + 0.05)))); drawUI({ live: true, viewers: v, chat: 1 + Math.floor((tt - t.one1) * 6) }); }
      else if (id === 'vs') drawUI({ split: 0.46, vs: true });
      else drawUI({});
    } else if (id === 'subs') {
      ST.aimSun(10, -1.5, 9);
      const B0 = [10.0, 0.6, -2.2];
      put(spd, { x: B0[0], y: B0[1] + 0.12 * Math.abs(Math.sin(tt * 8)), z: B0[2], rotY: 0.15, scale: S_SPD, armR: { x: -2.2, z: 0.35, el: 0.3 }, armL: { x: -2.75, z: 0.5 + 0.2 * Math.sin(tt * 9), el: 0.2 }, legL: { x: 0, kn: 0.2 }, legR: { x: 0, kn: 0.2 }, eyes: 'wide', mouth: 'scream', brows: 0.5, hairUp: 0.5, head: { x: -0.25 }, look: [0, 0.4], t: tt });
      spdPhone.g.visible = true; { const hp = handAt(spd, 1); spdPhone.g.position.set(hp.x, hp.y + 0.08, hp.z + 0.02); spdPhone.g.rotation.set(0.35, 0.2, 0); }
      for (let i = 0; i < 150; i++) { const a = hsh(i, 11) * PI * 1.25 - PI * 0.12, r = 1.0 + hsh(i, 12) * 3.2, x = B0[0] + Math.cos(a) * r * 1.1, z = B0[2] + Math.sin(a) * r * 0.9 + 0.6, ph = tt * 7 + i;
        if (z > 1.0 || (Math.abs(x - B0[0]) < 0.6 && z > -1.4)) { FANS.set(i, null); continue; }
        FANS.set(i, { x, y: (z > 0 ? 0 : SIDEWALK_H) + 0.06 * Math.abs(Math.sin(ph)), z, rotY: Math.atan2(B0[0] - x, B0[2] - z), scale: 1.05 + 0.1 * hsh(i, 9), phone: i % 2 === 0, armL: { x: -2.7, z: 0.4 + 0.2 * Math.sin(ph) }, armR: i % 2 ? { x: -2.6, z: 0.3 } : { x: -1.2, z: 0.1 }, look: [0, 0.6], wide: true, t: tt }); }
      FANS.commit(); drawUI({});
    } else if (id === 'chase' || id === 'splat' || id === 'verdict') {
      const xs = xsAt(tt);
      ST.aimSun(id === 'verdict' ? 1 : id === 'splat' ? XG : xs - 4, 3, id === 'verdict' ? 14 : 12);
      if (id === 'verdict') {
        const sq = u01(tt, VERDICT, VERDICT + 0.3);
        streamer(tt, sq > 0 ? { eyes: 'wide', mouth: 'o', hop: 0 } : {});
        fansBehind(tt, SPD0[0], SPD0[2], 110);
      } else {
        // the streamer sprinting toward the lens, Gary filming behind him, a road full of fans after them
        const ph = xs * 1.25, sprint = id === 'chase';
        if (sprint) put(spd, { x: xs, y: 0, z: 3.4, rotY: PI / 2, scale: S_SPD, walk: ph, walkAmt: 1.8, lean: 0.32, armL: { x: Math.sin(ph) * 1.2, z: 0.15, el: 1.4 }, armR: { x: -Math.sin(ph) * 1.2, z: 0.15, el: 1.4 }, eyes: 'wide', mouth: 'scream', brows: 0.6, hairUp: 0.8, look: [-0.5, 0], head: { y: -0.5 }, t: tt });
        const fell = tt > TRIP, fall = smooth(u01(tt, TRIP, TRIP + 0.22)), f = garyF(tt);
        const gx = fell ? XG + 0.7 * fall : xs - 2.2, gph = gx * 1.25;
        put(gary, { x: gx, y: 0, z: 2.6, rotY: PI / 2, rx: fell ? -PI / 2 * fall : 0, scale: S_GARY, walk: fell ? undefined : gph, walkAmt: 1.6, lean: fell ? 0 : 0.25,
          armL: fell ? { x: -0.4, z: 1.2 + 0.2 * Math.sin(tt * 9), el: 0.4 } : { x: -1.35, z: 0.05, el: 1.2 }, armR: fell ? { x: -0.4, z: 1.2 - 0.2 * Math.sin(tt * 9), el: 0.4 } : { x: -1.35, z: -0.05, el: 1.2 },
          legL: fell ? { x: -1.3, kn: 0.3 } : undefined, legR: fell ? { x: -1.0, kn: 0.5 } : undefined,
          eyes: tt > STOMP ? 'spiral' : fell ? 'wide' : 'open', mouth: tt > STOMP ? 'wavy' : fell ? 'scream' : 'grin', brows: 0.7, t: tt });
        if (fell) { gary.root.scale.set(S_GARY * (1 + 0.25 * (1 - f)), S_GARY * f, S_GARY * (1 + 0.25 * (1 - f))); gary.root.position.y = -0.45 * S_GARY * f * fall + 0.02; }
        garyCam.visible = true;
        if (!fell) { const hp = handAt(gary, 1); garyCam.position.set(hp.x + 0.06, hp.y + 0.06, hp.z - 0.06); garyCam.rotation.set(0, PI / 2, 0); }
        else { const k = smooth(u01(tt, TRIP, TRIP + 0.5)); garyCam.position.set(XG + 2.2 * k + 0.8, 0.07 + 0.9 * Math.sin(PI * k), 2.0 - 0.3 * k); garyCam.rotation.set(tt * 6 * (1 - k), PI / 2 + 2 * k, 0.4 * k); }
        if (tt > STOMP) dizzy.update(tt, 1, [XG + 0.7 - 0.85, 0.3, 2.6]);
        for (let i = 0; i < FAN_N; i++) {
          const gap = 3.2 + hsh(i, 15) * 52, lane = 0.5 + hsh(i, 16) * 6.0, x = xs - gap, ph2 = x * 1.3 + i;
          if (x > (sprint ? 12.0 : XG + 7) || x < -70 || (!sprint && (lane > 3.8 || i % 2 || (x < XG + 1.3 && tt > STOMP + 0.12)))) { FANS.set(i, null); continue; }
          const over = !sprint && Math.abs(x - (XG + 0.7)) < 1.0 && Math.abs(lane - 2.6) < 0.9 ? Math.sin(PI * clamp((x - (XG - 0.3)) / 2)) * 0.55 : 0;
          FANS.set(i, { x, y: 0.08 * Math.abs(Math.sin(ph2)) + over, z: lane, rotY: PI / 2, scale: 1.05 + 0.1 * hsh(i, 9), kick: 1, armL: i % 3 === 0 ? { x: -2.7, z: 0.3 } : { x: Math.sin(ph2) * 0.9, z: 0.15 }, armR: i % 3 === 0 ? { x: -2.7, z: 0.3 } : { x: -Math.sin(ph2) * 0.9, z: 0.15 }, phone: i % 4 === 1, look: [0.3, 0.1], wide: true, lean: 0.25, t: tt });
        }
        FANS.commit();
      }
      drawUI(id === 'verdict' ? { split: splitAt(tt, sh) } : {});
    } else drawUI({});

    // ======================================================== 1955: the church office (King, the mimeograph, flyers) + the newspapers
    if (sh.set === 'of') {
      OF.drum.rotation.x = -tt * 7; OF.crank.rotation.x = -tt * 7;
      if (id === 'king' || id === 'flyers') {
        put(mlk, { x: OF0[0] - 0.32, y: 0, z: OF0[2] - 2.05, rotY: 0.08, scale: S_MLK, ...STANCE, armL: { x: -0.75, z: 0.1, el: 0.55 }, armR: { x: -0.75, z: 0.1, el: 0.55 }, head: { x: -0.05, y: 0.1 * Math.sin(tt * 0.9) }, eyes: 'open', mouth: 'smile', brows: -0.05, look: [0.1, 0], t: tt });
        put(volunteer, { x: OF0[0] + 1.15, y: 0, z: OF0[2] - 1.42, rotY: -PI / 2, scale: 1.1, ...STANCE, armR: { x: -1.2 + 0.35 * Math.sin(tt * 7), z: -0.1, el: 0.8 + 0.3 * Math.cos(tt * 7) }, armL: { x: -0.9, z: 0.1, el: 0.7 }, head: { x: 0.25 }, eyes: 'open', mouth: 'smile', t: tt });
        flyers.visible = true;
        const src = OFw(0.55, OF.deskY + 0.12, -1.18);
        for (let k = 0; k < FLY_N; k++) {
          const t0 = FLY0 + k * FLYP, a = tt - t0; if (a < 0) { flyers.setMatrixAt(k, ZERO); continue; }
          const vx = (hsh(k, 1) - 0.5) * 1.2, vy = 0.9 + hsh(k, 2) * 0.9, vz = 1.5 + hsh(k, 3) * 1.1;
          let x = src[0] + vx * a, y = src[1] + vy * a - 1.6 * a * a, z = src[2] + vz * a * Math.exp(-a * 0.6), landed = y < 0.004;
          if (landed) y = 0.004 + (k % 7) * 0.0005;
          if (Math.hypot(x - camW[0], y - camW[1], z - camW[2]) < 0.28) { flyers.setMatrixAt(k, ZERO); continue; }
          Q4.setFromEuler(E4.set(landed ? -PI / 2 : -PI / 2 + Math.sin(a * 9 + k) * 1.1, hsh(k, 4) * TAU, landed ? 0 : Math.sin(a * 7 + k * 2) * 0.8));
          M4.compose(P4.set(x, y, z), Q4, S4.set(1, 1, 1)); flyers.setMatrixAt(k, M4);
        }
        flyers.instanceMatrix.needsUpdate = true;
      }
      if (id === 'news') {
        NEWS.forEach((m, k) => { const t0 = NEWS_T[k]; if (tt < t0) return; m.visible = true; const u = smooth(u01(tt, t0, t0 + 0.42)), P = NEWS_P[k];
          m.position.set(...OFw(P[0] + 0.25 * (1 - u), OF.deskY + P[1] + 0.9 * (1 - u) * (1 - u), P[2] + 0.45 * (1 - u)));
          m.rotation.set(-PI / 2 + 0.9 * (1 - u), 0, P[3] + 2.4 * (1 - u)); });
        if (tt > MEDAL_T) { medal.visible = true; const u = smooth(u01(tt, MEDAL_T, MEDAL_T + 0.35)), P = NEWS_P[1]; medal.position.set(...OFw(P[0] + 0.1, OF.deskY + P[1] + 0.006 + 0.25 * (1 - u), P[2] + 0.15)); medal.rotation.set(0.4 * (1 - u), 0.3, 0); }
      }
    }
    // ======================================================== 1955: Montgomery — the empty bus, people walking to work
    if (sh.set === 'sb') {
      SB.aimSun(id === 'bus' ? 3 : 4 + VWALK * (tt - t.people1), -1, 12);
      if (id === 'walk') { const a = lerp(-0.9, 0.9, u01(tt, t.people1, t.in3)); SB.lights.sun.position.copy(SB.lights.sun.target.position).add(V(Math.sin(a) * 50, 45, 30 + 10 * Math.cos(a))); }
      const T0 = id === 'bus' ? t.in2 : t.people1;
      for (let i = 0; i < WALK_N; i++) {
        const lane = i % 2 ? -1.45 : -0.62, x0 = (id === 'bus' ? 0.2 : 2.5) - Math.floor(i / 2) * 1.35 - hsh(i, 21) * 0.4, v = VWALK * (0.94 + 0.12 * hsh(i, 22)), x = x0 + v * (tt - T0), ph = x * 3.1 + i;
        if (Math.hypot(SB0[0] + x - camW[0], SB0[2] + lane - camW[2]) < 1.2) { WALKERS.set(i, null); continue; }
        WALKERS.set(i, { x: SB0[0] + x, y: 0.12 + 0.025 * Math.abs(Math.sin(ph)), z: SB0[2] + lane, rotY: PI / 2, scale: 1.05 + 0.1 * hsh(i, 23), kick: 0.38, t: tt, armL: { x: Math.sin(ph) * 0.35, z: 0.12 }, armR: i % 5 === 0 ? { x: -0.1, z: 0.05 } : { x: -Math.sin(ph) * 0.35, z: 0.12 }, look: [0.4, 0] });
      }
      WALKERS.commit();
      if (id === 'bus') {
        const kx = 1.35 + VWALK * (tt - t.in2), ph = kx * 2.4;
        put(mlk, { x: SB0[0] + kx, y: 0.12, z: SB0[2] - 1.0, rotY: PI / 2 - 0.2, scale: S_MLK, walk: ph, walkAmt: 0.9, head: { y: 0.25 }, eyes: 'open', mouth: 'smile', brows: -0.1, look: [0.2, 0], t: tt });
        busG.visible = true; busG.position.set(...SBw(10 - 6.5 * (tt - BUS0), 0, 1.95)); busG.rotation.set(0, -PI / 2, 0);
      }
    }
    // ======================================================== 1963: the March on Washington
    if (sh.set === 'ml' && !sh.modern) {
      if (id === 'arrive') {
        ML.massB.count = ML.massH.count = ML_SIDES;
        ML.aim(0, 44, 18, ML.SUN_BACK);
        const u = tt - t.in3, zl = 41.4 - 0.95 * u;
        const row = [mlk, ...LEAD], X = [0, -1.0, 1.0, -2.0, 2.0];
        row.forEach((r, i) => { const ph = (zl * 2.6 + (i % 2) * 0.4); put(r, { x: ML0[0] + X[i], y: 0, z: ML0[2] + zl + (i > 2 ? 0.15 : i > 0 ? 0.07 : 0), rotY: PI, scale: i ? 1.1 : S_MLK, walk: ph, walkAmt: 0.85,
          armL: { x: 0.05, z: 0.75, el: 0.45 }, armR: { x: 0.05, z: 0.75, el: 0.45 }, eyes: 'open', mouth: 'smile', brows: -0.05, head: { y: 0.08 * Math.sin(u + i) }, t: tt }); });
        audience(tt, camW, { march: true });
      } else if (id === 'crane') { mall63(tt, camW, { aim: [0, 30, 60] }); }
      else if (id === 'podium') { mall63(tt, camW, { speaking: true, aim: [0, 6, 26] }); }
      else if (id === 'kingfront') { mall63(tt, camW, { speaking: true, front: true, aim: [0, -4, 14] }); }
      else if (id === 'faces') { mall63(tt, camW, { speaking: true, aim: [5, 11, 12] }); }
      else if (id === 'moved') { mall63(tt, camW, { wave: smooth(u01(tt, t.king3 + 0.2, t.king3 + 0.9)), cheer: smooth(u01(tt, t.king3 + 0.3, t.king3 + 1.2)), aim: [0, 20, 60] }); }
    }
    // ======================================================== TODAY: the memorial steps, the streamer taking notes
    if (id === 'notes') {
      ML.massB.visible = ML.massH.visible = false; ML.aim(2.5, -3, 14, V(-0.75, 0.5, 0.42).normalize());
      const seatY = stepTop(-0.65), sx = 2.2, k = smooth(u01(tt, t.taking - 0.1, t.taking + 0.4));
      put(spd, { x: ML0[0] + sx, y: seatY - 0.47 * S_SPD + 0.05, z: ML0[2] - 0.75, rotY: -0.12, scale: S_SPD, legL: { x: -1.45, kn: 1.05 }, legR: { x: -1.45, kn: 1.05 },
        armL: { x: -1.05, z: 0.05, el: 1.1 }, armR: { x: -1.0 - 0.06 * Math.sin(tt * 14) * k, z: -0.12, el: 1.35 }, head: { x: lerp(-0.15, 0.35, k), y: lerp(0.35, 0, k) }, eyes: 'wide', mouth: k > 0.5 ? 'o' : 'smile', brows: lerp(0.6, 0.3, k), look: [lerp(0.4, 0, k), lerp(0.3, -0.6, k)], t: tt });
      notebook.visible = true; pen.visible = true;
      { const hl = handAt(spd, -1), hr = handAt(spd, 1); notebook.position.set(hl.x + 0.06, hl.y + 0.03, hl.z + 0.02); notebook.rotation.set(0.35, -0.12, 0); pen.position.set(hr.x - 0.02, hr.y + 0.04, hr.z); pen.rotation.set(0.6, 0, 0.5); }
      put(gary, { x: ML0[0] + sx + 1.25, y: seatY - 0.47 * S_GARY + 0.05, z: ML0[2] - 0.7, rotY: -0.35, scale: S_GARY, legL: { x: -1.45, kn: 1.05 }, legR: { x: -1.45, kn: 1.05 }, armL: { x: -0.7, z: 0.1, el: 0.9 }, armR: { x: -0.7, z: 0.1, el: 0.9 }, head: { y: -0.5, x: 0.05 }, eyes: 'open', mouth: 'smile', brows: 0.3, look: [-0.6, 0], t: tt });
      band.visible = true;
      TOUR.forEach((r, i) => { const P = [[-3.2, 7.5, PI + 0.3], [-1.9, 8.1, PI - 0.2], [5.8, 9.5, PI]][i]; put(r, { x: ML0[0] + P[0], y: 0, z: ML0[2] + P[1], rotY: P[2], scale: 1.05, ...STANCE, armR: i === 1 ? { x: -1.6, z: 0.1, el: 0.6 } : STANCE.armR, head: { x: -0.35 }, eyes: 'open', mouth: 'smile', t: tt + i }); });
    }
    // ======================================================== 2026: DEREK + SCRIBE
    if (sh.set === 'rm') {
      deskSheet.visible = true; imprint.visible = tt > STAMP; imprint.scale.setScalar(imprint.visible ? Math.max(0.01, easeOutBack(u01(tt, STAMP, STAMP + 0.2))) : 1);
      const scribeOn = tt > t.so1 - 0.05;
      put(derek, { x: RM0[0] - 0.2, y: 0, z: RM0[2] - 0.95, rotY: PI, scale: 1.1, legL: { x: -1.5, kn: 1.5 }, legR: { x: -1.5, kn: 1.5 },
        armL: scribeOn ? { x: -1.25, z: -0.15, el: 1.0 } : { x: -1.0, z: 0.1, el: 1.1 }, armR: scribeOn ? { x: -1.25, z: -0.15, el: 1.0 } : { x: -1.0, z: 0.1, el: 1.1 },
        head: { x: scribeOn ? 0.1 : id === 'sheet' ? 0.45 : 0.25, y: tt > STAMP && !scribeOn ? -0.4 : 0 }, eyes: tt > STAMP && !scribeOn ? 'half' : scribeOn ? 'wide' : 'open', mouth: tt > STAMP && !scribeOn ? 'wavy' : scribeOn ? 'grin' : 'flat', brows: tt > STAMP ? 0.8 : 0.2, look: [0, -0.4], lean: 0.12, t: tt });
      if (scribeOn) {
        phone.g.visible = true;
        if (id === 'snap') { phone.g.position.set(SHEETP[0] + 0.01, SHEETP[1] + 0.14, SHEETP[2] + 0.02); phone.g.rotation.set(-PI / 2, 0, 0.06); drawWS(0); drawPhone('cam', tt > FLASH ? u01(tt, FLASH, FLASH + 0.35) : 0);
          flash.visible = tt > FLASH && tt < FLASH + 0.3; flash.material.opacity = 1 - u01(tt, FLASH, FLASH + 0.3); flash.position.set(SHEETP[0], SHEETP[1] + 0.13, SHEETP[2] + 0.05); }
        else { phone.g.position.set(...RMw(-0.2, 1.22, -1.28)); phone.g.rotation.set(-0.12, 0, 0); }
        if (id === 'open') drawPhone('home');
        if (id === 'open' || id === 'write') derek.root.visible = false;
        povHands.visible = id === 'open'; if (povHands.visible) { phone.g.updateMatrixWorld(true); povHands.position.copy(phone.g.position); povHands.quaternion.copy(phone.g.quaternion); }
        if (id === 'write') { if (tt < WRITE0) { drawWS(0, smooth(u01(tt, FOUND0, FOUND0 + 0.15))); drawPhone('found', 0); } else { const p = writeP(tt), tip = drawWS(p); drawPhone(p >= NW - 0.01 && tt > WRITE1 - 0.05 ? 'done' : 'write', p / NW, tip); } }
      } else drawWS(0);
      if (id === 'sheet') derek.root.visible = false;
    }

    // ----- split screen (the 1963 half), then the main camera (re-read: selfie lenses ride his head, the write lens rides the phone)
    cam = sh.cam(tt);
    let split = null;
    if (sh.split) { split = splitAt(tt, sh); SEP.value = 0.72; renderSplit(tt, sh, split); }
    if (cam.up) studio.camera.up.set(...cam.up); else studio.camera.up.set(0, 1, 0);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0);
    studio.camera.updateMatrixWorld();
    if (split != null) {
      const d = 0.2, h = 2 * d * Math.tan(studio.camera.fov * PI / 360), w = h * 9 / 16;
      splitPlane.visible = true; splitPlane.position.set(0, -h * split / 2, -d); splitPlane.scale.set(w * 1.02, h * (1 - split) * 1.01, 1);
    }
    const dd = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(studio.camera, tt, Math.min(dd, 6));
    studio.fill.intensity = sh.set === 'rm' ? (['sheet', 'snap'].includes(id) ? 0.12 : 0.4) : sh.set === 'of' ? 0.75 : 0.45; studio.fill.distance = 8;
    fx.update(tt, studio.camera);
    hud.update(tt);
  }

  // QC (`node tools/render.mjs 085-speed-vs-mlk --qc`): faces under the caption / callouts, shot lengths
  const BAND_Y = { term: 390, label: 262, money: 318, stamp: 560 };
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['streamer', spd], ['gary', gary], ['king', mlk], ['derek', derek], ...LEAD.map((e, i) => ['leader ' + (i + 1), e])];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of names) {
        if (!r.root.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(studio.camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const bands = [];
        const cw = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw && Math.abs(hx - 0.5) < 0.016 * cw.w.length + 0.06) bands.push(['caption', 1000 / 1920]);
        for (const c of story.callouts) if (tt >= c.t0 && tt <= c.t1) { const x = c.style === 'sfx' ? c.pos[0] : c.x; if (x == null || Math.abs(hx - x) < 0.3) bands.push([c.style + ' ' + c.text, c.style === 'sfx' ? c.pos[1] : c.y ?? BAND_Y[c.style] / 1920, 0.065]); }
        for (const [name, y, m = 0.045] of bands) if (Math.abs(hy - y) < m) out.push(`${tt.toFixed(2)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under ${name}`);
      }
    }
    out.push(`shots: ${SHOTS.length} → ` + SHOTS.map((s) => `${s.id} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)} (${(s.t1 - s.t0).toFixed(1)} s)`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}
