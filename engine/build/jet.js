// Hair dryer → jet engine (build genre, video 041 "How a Hair Dryer Becomes a Jet Engine"). ONE world laid out along +x (the
// story marches +x), the camera lives on +z, ground y = 0:
//   Gary's house (x 0…14.4), a dollhouse cut at z = 0 (front walls sliced, section ends): the BATHROOM (x 0…3.4: tub with the
//   duck, toilet + toilet paper, sink + mirror, the outlet the hair dryer is plugged into), the HALLWAY (x 3.4…7.4: runner,
//   photos, a coat rack), the GARAGE (x 7.4…14.4: workbench, pegboard, shelves, a mower, a roll-up door in its right wall);
//   the DRIVEWAY (x 14.4…24), the STREET (x 24…31, running along z), the AIRFIELD fence (x 32), the TEST STAND (x 40: a portal
//   frame, a blast fence on its −x side, a control booth), the HANGAR + tower + parked planes behind, the RUNWAY along
//   z = D.rwyZ, a terminal far down the runway; a cloud deck and a sunset sky for the flight.
// The ENGINE (makeEngine) is the hero: a half-section cut at its own axis (local z = 0, the camera side is clipped away; closed
// solids show a flat "section" colour where they're cut) that is built part by part — the hair dryer (its little fan, its
// glowing coil, its handle + cord) → a box-fan blade + duct rings → six compressor stages → the combustor (the coil becomes a
// flame) → the shaft + turbine disc + blades → nozzle petals → drilled cooling holes → the nacelle + a 16-blade fan → the
// thrust reverser. Every part has its own 0..1 (or count) so shots.js can assemble it ON SCREEN over seconds (user, on 039:
// "build progression a tiny bit slower so we can see it come together").
// Props: makeDuck (a mallard: waddle, flap, fluff), makeCardboardPlane, makeAirliner (a toy wide-body: fuselage, swept wings,
// pylon, cockpit window with a seat for Gary), makeJellyBird + makeBirdCannon, makeJerryCan, makeScissors, makeTP (a roll).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, clamp, lerp, rng } from '../core.js';

const PI = Math.PI, TAU = PI * 2;
export const D = {
  bath: { x0: 0, x1: 3.4 }, hall: { x0: 3.4, x1: 7.4 }, garage: { x0: 7.4, x1: 14.4 }, back: -3.4, wallH: 2.6,
  drive: { x0: 14.4, x1: 24 }, street: { x0: 24, x1: 31 }, fenceX: 32.5,
  stand: { x: 61, y: 3.0 },            // the test stand: the engine axis (z = D.eZ), hung from an overhead frame (towers at z −4.2)
  eZ: -0.75,                          // the engine axis z everywhere on the ground (its section faces the lens)
  plane: [77, 0, -9.25],               // the airliner's parking spot (nose +x): its right-wing engine mount lands at (75, 3.0, D.eZ)
  rwyZ: -9.25, rwyX0: 110, rwyX1: 2400, terminal: 470,   // runway along x (the apron before it), the terminal by the rollout end
  cloudY: 64, cruiseY: 112,
};
const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
export const signTex = (text, { w = 512, h = 160, bg = '#c0392b', fg = '#fff', px = 96, border = null, lines = null } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); }
  const L = lines || [text]; let s = px / (L.length > 1 ? 1.25 : 1); g.font = font(s); while (Math.max(...L.map((l) => g.measureText(l).width)) > w * 0.86 && s > 14) { s -= 3; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; L.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (L.length - 1) / 2) * s * 1.05 + s * 0.06));
});
export const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const steel = (color = 0x9aa3ad, roughness = 0.35, metalness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const sign = (parent, text, w, h, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(text, { w: Math.round(160 * w / h), h: 160, ...o }), roughness: 0.6 })); parent.add(m); return m; };
const SECTION = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.9 });

// ---------------------------------------------------------------- section materials (the engine's cutaway)
// A closed solid clipped by the engine's plane shows its BACK faces through the cut: draw those in a flat section colour (the
// genre's light cut colour; a little shade so it isn't a white void). One shared plane per engine (world space, set per frame).
const SEC_KEY = { n: 0 };
function secMat(color, { rough = 0.45, metal = 0.35, sec = 0xe8603c, emissive = 0x000000, ei = 0, map = null, clip, transparent = false, opacity = 1 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, side: THREE.DoubleSide, emissive, emissiveIntensity: ei, map, transparent, opacity });
  if (clip) { m.clippingPlanes = [clip]; m.clipShadows = true; }
  const sc = new THREE.Color(sec), U = { value: sc };
  m.onBeforeCompile = (sh) => { sh.uniforms.uSec = U; sh.fragmentShader = 'uniform vec3 uSec;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\nif (!gl_FrontFacing) gl_FragColor = vec4(uSec * 0.78, gl_FragColor.a);'); };
  m.customProgramCacheKey = () => 'sec' + (SEC_KEY.n++ % 1);
  m.userData.sec = U; return m;
}
// a closed ring/tube solid about the X axis: inner radius a(u), outer b(u) along x from x0 (u=0) to x1 (u=1); lathe → rotated
function ringGeo(x0, x1, a0, b0, a1 = a0, b1 = b0, seg = 48, steps = 1) {
  const e = 0.0015, P = [];
  P.push(new THREE.Vector2(a0, x0), new THREE.Vector2(b0 - e, x0));
  for (let i = 0; i <= steps; i++) { const u = i / steps; P.push(new THREE.Vector2(lerp(b0, b1, u), lerp(x0, x1, u) + (i === 0 ? e : i === steps ? -e : 0))); }
  P.push(new THREE.Vector2(b1 - e, x1), new THREE.Vector2(a1 + e, x1));
  for (let i = steps; i >= 0; i--) { const u = i / steps; P.push(new THREE.Vector2(lerp(a0, a1, u), lerp(x0, x1, u) + (i === steps ? -e : i === 0 ? e : 0))); }
  P.push(new THREE.Vector2(a0 + e, x0));
  const g = new THREE.LatheGeometry(P, seg); g.rotateZ(-PI / 2); return g;   // lathe axis y → x
}
// a solid of revolution about X from a profile [[x, r], ...] (closed through the axis)
function solidX(prof, seg = 40) {
  const P = [new THREE.Vector2(0.0005, prof[0][0])]; prof.forEach(([x, r]) => P.push(new THREE.Vector2(Math.max(0.0006, r), x))); P.push(new THREE.Vector2(0.0005, prof[prof.length - 1][0]));
  const g = new THREE.LatheGeometry(P, seg); g.rotateZ(-PI / 2); return g;
}
const tubeX = (r, x0, x1, seg = 16) => { const g = new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), seg); g.rotateZ(-PI / 2); g.translate((x0 + x1) / 2, 0, 0); return g; };
// a blade: a thin twisted box from r0 to r1 at axial x, chord c — returns a geometry in "rotor" space (blade along +y)
function bladeGeo(r0, r1, chord, thick, twist = 0.6, seg = 6) {
  const g = new THREE.BoxGeometry(chord, r1 - r0, thick, 1, seg, 1); g.translate(0, (r0 + r1) / 2, 0);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const u = (v.y - r0) / (r1 - r0), a = (u - 0.5) * twist + 0.55; const x = v.x * Math.cos(a) - v.z * Math.sin(a), z = v.x * Math.sin(a) + v.z * Math.cos(a); p.setXYZ(i, x, v.y, z); }
  g.computeVertexNormals(); return g;
}

// ---------------------------------------------------------------- the hair dryer (origin = barrel centre; air goes −x: grille +x, nozzle −x)
export function makeHairDryer(clip) {
  const g = new THREE.Group();
  const bodyM = secMat(0xff6fa3, { rough: 0.35, metal: 0.05, clip, sec: 0xffd6e4 }), darkM = secMat(0x3a3540, { rough: 0.5, metal: 0.2, clip }), chromeM = secMat(0xd8dde2, { rough: 0.2, metal: 0.9, clip });
  const barrel = mk(ringGeo(-0.15, 0.15, 0.055, 0.068, 0.05, 0.064, 32), bodyM, g);             // a hollow barrel (we see the coil + fan inside)
  const nozzle = mk(ringGeo(-0.26, -0.15, 0.025, 0.035, 0.05, 0.064, 32), darkM, g);            // the concentrator nozzle (flat-ish slot read as a cone)
  const grille = mk(new THREE.CylinderGeometry(0.066, 0.066, 0.02, 28), darkM, g, 0.16, 0, 0); grille.rotation.z = PI / 2;
  const handle = new THREE.Group(); g.add(handle); handle.position.set(0.04, -0.05, 0); handle.rotation.z = -0.28;
  mk(new THREE.CylinderGeometry(0.03, 0.036, 0.19, 20), bodyM, handle, 0, -0.1, 0);
  const btn = mk(new RoundedBoxGeometry(0.02, 0.05, 0.03, 2, 0.008), secMat(0xffffff, { clip }), handle, -0.033, -0.06, 0);
  const fan = new THREE.Group(); g.add(fan); fan.position.x = 0.12;                         // the little fan (behind the grille)
  for (let i = 0; i < 5; i++) { const b = mk(new THREE.BoxGeometry(0.012, 0.045, 0.02), chromeM, fan, 0, 0.026, 0); b.rotation.x = 0; const p = new THREE.Group(); fan.add(p); p.rotation.x = (i / 5) * TAU; p.add(b); b.rotation.y = 0.5; }
  mk(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 12), chromeM, fan).rotation.z = PI / 2;
  const coilM = new THREE.MeshStandardMaterial({ color: 0x8a4a2a, roughness: 0.4, metalness: 0.6, emissive: 0xff5a1a, emissiveIntensity: 0 }); coilM.clippingPlanes = [clip]; coilM.clipShadows = true;
  const helix = new THREE.CatmullRomCurve3(Array.from({ length: 90 }, (_, i) => { const a = i * 0.55; return new THREE.Vector3(0.09 - i * 0.002, Math.cos(a) * 0.032, Math.sin(a) * 0.032); }));
  const coil = mk(new THREE.TubeGeometry(helix, 200, 0.0055, 6, false), coilM, g);
  const cordAnchor = new THREE.Object3D(); handle.add(cordAnchor); cordAnchor.position.set(0, -0.2, 0);
  return { g, fan, coil, coilM, handle, nozzle, cordAnchor, setGlow(k) { coilM.emissiveIntensity = 2.2 * k; coilM.color.setHex(k > 0.2 ? 0xc0602a : 0x8a4a2a); } };
}

// ---------------------------------------------------------------- the engine (axis = local x, intake +x; the clipped half is local z > 0)
// Layout (local x, metres): duct + box fan 2.0…1.28 (the dryer sits behind the fan as its motor pod) · compressor stages 1.28…0.20 ·
// combustor 0.20…−0.48 · turbine −0.48…−0.84 · nozzle −0.84…−1.40 · (turbofan) spinner 3.05, big fan 2.62, nacelle 3.25…0.35.
export const E = {
  RC: 0.42, W: 0.05, fanX: 1.86, duct: [2.0, 1.28], comp: [1.28, 0.2], comb: [0.2, -0.48], turb: [-0.48, -0.84], noz: [-0.84, -1.4],
  dryerX: 1.56, bigFanX: 2.62, nac: [3.25, 0.35], RF: 1.7, RN: 1.86,
};
export function makeEngine() {
  const g = new THREE.Group();
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const casM = secMat(0xb9c2cb, { rough: 0.32, metal: 0.8, clip }), casDk = secMat(0x7f8a95, { rough: 0.4, metal: 0.8, clip }), sleeveM = secMat(0x3f454d, { rough: 0.6, metal: 0.3, clip, sec: 0x3f454d });
  const sleeve = (r, x0, x1) => mk(ringGeo(x0 + 0.003, x1 - 0.003, E.RC - 0.014, E.RC - 0.004), sleeveM, r, 0, 0, 0);   // the casing's dark inside: blades + flame pop against it
  const bladeM = secMat(0xe2e8ee, { rough: 0.32, metal: 0.45, clip }), hubM = secMat(0x9aa4ae, { rough: 0.35, metal: 0.6, clip });
  const statM = secMat(0x8fb0d0, { rough: 0.4, metal: 0.35, clip }), hotM = secMat(0xb0a296, { rough: 0.45, metal: 0.55, clip });
  const fanBladeM = secMat(0x2f3b47, { rough: 0.4, metal: 0.25, clip }), nacM = secMat(0xeef1f4, { rough: 0.35, metal: 0.25, clip }), nacIn = secMat(0x7d8794, { rough: 0.5, metal: 0.3, clip, sec: 0x7d8794 });
  const S = { spin: 0, fanSpin: 0 };
  // the hair dryer = the motor pod right behind the first fan
  const dryer = makeHairDryer(clip); g.add(dryer.g); dryer.g.position.x = E.dryerX;
  // the box-fan blade (fan 1): 5 wide blue plastic blades on a hub
  const boxFan = new THREE.Group(); g.add(boxFan); boxFan.position.x = E.fanX;
  const boxM = secMat(0x58a8e8, { rough: 0.4, metal: 0.05, clip, sec: 0xd9ecfa });
  for (let i = 0; i < 5; i++) { const p = new THREE.Group(); boxFan.add(p); p.rotation.x = (i / 5) * TAU; const b = mk(bladeGeo(0.07, 0.385, 0.16, 0.012, 0.5), boxM, p); }
  mk(solidX([[0.06, 0.075], [0.0, 0.08], [-0.05, 0.06]]), secMat(0x3f88c8, { clip }), boxFan);
  // duct rings (4) — ring 0 is the front lip
  const ductRings = []; for (let i = 0; i < 4; i++) { const x1 = E.duct[0] - i * 0.18, x0 = x1 - 0.18; const r = mk(ringGeo(x0, x1, E.RC, E.RC + E.W, E.RC, i === 0 ? E.RC + E.W + 0.03 : E.RC + E.W), casM, g); sleeve(r, x0, x1); ductRings.push(r); }
  // compressor: 6 stages (rotor disc + blades, stator vanes) + 6 casing rings; blades shorten as the hub grows
  const stages = [], compRings = [];
  for (let i = 0; i < 6; i++) {
    const xs = E.comp[0] - 0.09 - i * 0.18, rh = 0.11 + i * 0.022, st = new THREE.Group(); g.add(st); st.position.x = xs;
    const rot = new THREE.Group(); st.add(rot); const n = 12 + i;
    for (let k = 0; k < n; k++) { const p = new THREE.Group(); rot.add(p); p.rotation.x = (k / n) * TAU; mk(bladeGeo(rh, E.RC - 0.01, 0.07, 0.008, 0.7), bladeM, p, 0.02, 0, 0); }
    mk(ringGeo(-0.01, 0.06, 0.001, rh, 0.001, rh, 32), hubM, rot);
    const sta = new THREE.Group(); st.add(sta); for (let k = 0; k < 14; k++) { const p = new THREE.Group(); sta.add(p); p.rotation.x = (k / 14) * TAU + 0.08; mk(bladeGeo(rh + 0.01, E.RC, 0.05, 0.006, -0.3), statM, p, -0.06, 0, 0); }
    stages.push({ g: st, rot, sta, x: xs });
    const x1 = E.comp[0] - i * 0.18; const cr = mk(ringGeo(x1 - 0.18, x1, E.RC, E.RC + E.W), i % 2 ? casM : casDk, g); sleeve(cr, x1 - 0.18, x1); compRings.push(cr);
  }
  // the inner drum (the hub cone the stages ride on) grows with the stages
  const drum = mk(solidX([[E.comp[0], 0.1], [E.comp[1], 0.24]], 32), hubM, g);
  // the shaft (it runs from the first fan back to the turbine; `shaft` = how far back it has slid, 0..1)
  const shaftM = secMat(0xc8a64a, { rough: 0.3, metal: 0.9, clip, sec: 0xf6e7b8 });
  const shaft = mk(tubeX(0.04, 0, -1, 16), shaftM, g);
  // combustor: 2 casing rings, a liner annulus, 12 fuel nozzles, the flame
  const combRings = [0, 1].map((i) => { const x1 = E.comb[0] - i * 0.34; const r = mk(ringGeo(x1 - 0.34, x1, E.RC, E.RC + E.W), hotM, g); sleeve(r, x1 - 0.34, x1); return r; });
  const linerT = tex(256, 64, (c, w, h) => { c.fillStyle = '#b8a48c'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a3a2c'; for (let x = 10; x < w; x += 22) for (let y = 12; y < h; y += 20) { c.beginPath(); c.arc(x + (y % 40 ? 6 : 0), y, 3.5, 0, 7); c.fill(); } });
  linerT.wrapS = THREE.RepeatWrapping; linerT.repeat.set(6, 1);
  const linerM = secMat(0xe8d8c0, { rough: 0.55, metal: 0.4, clip, map: linerT, sec: 0xead6b8 });
  const liner = new THREE.Group(); g.add(liner);
  mk(ringGeo(-0.44, 0.08, 0.34, 0.36), linerM, liner); mk(ringGeo(-0.44, 0.08, 0.15, 0.17), linerM, liner);
  const injectors = new THREE.Group(); g.add(injectors); injectors.position.x = 0.12;
  for (let k = 0; k < 12; k++) { const p = new THREE.Group(); injectors.add(p); p.rotation.x = (k / 12) * TAU; mk(new THREE.CylinderGeometry(0.018, 0.026, 0.1, 10), shaftM, p, 0, 0.255, 0).rotation.z = PI / 2; }
  // the flame: additive sprites in the liner (only the back half — the front is clipped open), flickered per frame
  const flameT = tex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.3, 'rgba(255,190,70,.85)'); gr.addColorStop(0.65, 'rgba(255,90,20,.35)'); gr.addColorStop(1, 'rgba(255,40,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const flameM = new THREE.SpriteMaterial({ map: flameT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, toneMapped: false });
  const flames = []; const flameG = new THREE.Group(); g.add(flameG);
  for (let k = 0; k < 26; k++) { const s = new THREE.Sprite(flameM.clone()); flameG.add(s); flames.push({ s, a: PI / 2 + (k % 13) / 12 * PI, x: 0.02 - (k / 26) * 0.42, ph: h2(k, 3) * 10 }); }
  // turbine: guide vanes, disc + 14 blades (each with its own material: glow / melt / drilled), 2 rings
  const turbRings = [0, 1].map((i) => { const x1 = E.turb[0] - i * 0.18; const r = mk(ringGeo(x1 - 0.18, x1, E.RC, E.RC + E.W), hotM, g); sleeve(r, x1 - 0.18, x1); return r; });
  const ngv = new THREE.Group(); g.add(ngv); ngv.position.x = -0.53; for (let k = 0; k < 22; k++) { const p = new THREE.Group(); ngv.add(p); p.rotation.x = (k / 22) * TAU; mk(bladeGeo(0.15, E.RC, 0.05, 0.008, -0.4), statM, p); }
  const turb = new THREE.Group(); g.add(turb); turb.position.x = -0.68;
  const tDisc = mk(ringGeo(-0.05, 0.05, 0.001, 0.15, 0.001, 0.15, 36), secMat(0xa58f6c, { rough: 0.35, metal: 0.85, clip }), turb);
  const holesT = tex(64, 128, (c, w, h) => { c.fillStyle = '#d0d5da'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d2228'; for (let y = 10; y < h; y += 13) for (const x of [16, 32, 48]) { c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); } });
  const tBlades = [];
  for (let k = 0; k < 14; k++) { const p = new THREE.Group(); turb.add(p); p.rotation.x = (k / 14) * TAU; const m = secMat(0xc4ccd4, { rough: 0.3, metal: 0.85, clip, sec: 0xf0e6d4 }); const bg = bladeGeo(0.15, 0.39, 0.09, 0.02, 0.8, 8); const b = mk(bg, m, p);
    const film = mk(bladeGeo(0.16, 0.395, 0.1, 0.03, 0.8, 4), new THREE.MeshBasicMaterial({ color: 0x8fd6ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, clippingPlanes: [clip] }), p); film.visible = false;
    tBlades.push({ p, b, m, film, base: bg.attributes.position.array.slice() }); }
  // nozzle: 10 petals (each a curved quad strip) + the tail cone
  const petals = []; const petalM = secMat(0x6b6f74, { rough: 0.45, metal: 0.8, clip, sec: 0xe6dccb });
  for (let k = 0; k < 10; k++) { const p = new THREE.Group(); g.add(p); p.position.x = E.noz[0]; const a0 = (k / 10) * TAU, a1 = ((k + 1) / 10) * TAU + 0.02;
    const gg = new THREE.CylinderGeometry(0.27, E.RC + 0.02, 0.56, 6, 1, true, a0, a1 - a0); gg.rotateZ(PI / 2); gg.translate(-0.28, 0, 0);   // (rotateZ(+PI/2): y → −x: the cone narrows backward)
    const m = mk(gg, petalM, p); petals.push({ p, m }); }
  const plug = mk(solidX([[-0.8, 0.15], [-1.0, 0.13], [-1.25, 0.02]], 28), hubM, g);
  // ---------------- turbofan: spinner, big fan (16 blades), nacelle rings (6, the last two = the reverser sleeve), splitter cowl, OGVs
  const spinnerT = tex(256, 256, (c, w, h) => { c.fillStyle = '#20262c'; c.fillRect(0, 0, w, h); });
  const swirlT = tex(512, 256, (c, w, h) => { c.fillStyle = '#20262c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 64; c.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, x = u * w * 0.98, y = h * (0.02 + 0.9 * u); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
  const spinM = secMat(0x20262c, { rough: 0.3, metal: 0.4, clip, map: spinnerT });
  const fanG = new THREE.Group(); g.add(fanG); fanG.position.x = E.bigFanX;
  const spinner = mk(solidX([[0.12, 0.5], [0.3, 0.42], [0.48, 0.24], [0.58, 0.0]], 40), spinM, fanG);
  const fanBlades = [];
  for (let k = 0; k < 16; k++) { const p = new THREE.Group(); fanG.add(p); p.rotation.x = (k / 16) * TAU; const b = mk(bladeGeo(0.48, E.RF - 0.02, 0.42, 0.04, 0.95, 8), fanBladeM, p); fanBlades.push(p); }
  const fanHub = mk(ringGeo(-0.15, 0.13, 0.001, 0.5, 0.001, 0.5, 40), hubM, fanG);
  const nacRings = [];
  for (let i = 0; i < 6; i++) { const x1 = E.nac[0] - i * 0.48, x0 = x1 - 0.48, rIn = i === 0 ? 1.74 : 1.72, rOut0 = i === 0 ? 1.84 : E.RN - (i > 3 ? (i - 3) * 0.06 : 0), rOut1 = E.RN - (i > 2 ? (i - 2) * 0.06 : 0);
    const gr = new THREE.Group(); g.add(gr); mk(ringGeo(x0, x1, rIn, rOut1, i === 0 ? 1.72 : rIn, rOut0, 64), i % 2 ? nacM : nacM, gr); mk(ringGeo(x0 + 0.002, x1 - 0.002, rIn - 0.012, rIn - 0.004, rIn - 0.012, rIn - 0.004, 64), nacIn, gr); nacRings.push(gr); }
  const lipT = mk(new THREE.TorusGeometry(1.79, 0.07, 12, 64), nacM, g); lipT.rotation.y = PI / 2; lipT.position.x = E.nac[0];
  const cowl = mk(ringGeo(-0.95, 2.05, 0.47, 0.5, 0.47, 0.62, 48, 6), secMat(0xd9dde1, { rough: 0.4, metal: 0.3, clip }), g);   // the core cowl (splitter) — the bypass air flows outside it
  const ogv = new THREE.Group(); g.add(ogv); ogv.position.x = 1.7; for (let k = 0; k < 24; k++) { const p = new THREE.Group(); ogv.add(p); p.rotation.x = (k / 24) * TAU; mk(bladeGeo(0.62, 1.72, 0.22, 0.02, -0.25, 3), statM, p); }
  // thrust reverser: cascade vanes revealed when the aft sleeve (nacelle rings 4 + 5) slides back; blocker doors swing into the bypass
  const cascade = new THREE.Group(); g.add(cascade); cascade.position.x = 1.0;
  for (let k = 0; k < 8; k++) mk(ringGeo(-0.02, 0.02, 1.74, 1.86, 1.74, 1.86, 48), casDk, cascade, -k * 0.08, 0, 0);
  const blockers = []; for (let k = 0; k < 8; k++) { const p = new THREE.Group(); g.add(p); p.position.x = 0.75; p.rotation.x = (k / 8) * TAU + PI / 8; const d = mk(new THREE.BoxGeometry(0.5, 0.04, 0.55), casDk, p, 0, 1.68, 0); d.geometry.translate(-0.25, 0, 0); blockers.push({ p, d }); }
  // pylon (on top, toward the wing) + the hair dryer-shaped sticker: GARY-DRY 1875 W on the nacelle
  const pylon = mk(new RoundedBoxGeometry(2.6, 1.6, 0.36, 3, 0.08), steel(0xd5dade, 0.35, 0.4), g, 1.4, 2.55, -0.2);   /* front face 2 cm behind the section plane (on it, the clip test flickered in blocks) */ pylon.material.clippingPlanes = [clip];
  // accessories: the starter (a box on the core's underside), two red fire bottles, the stand's hoist lug
  const starter = new THREE.Group(); g.add(starter); starter.position.set(0.9, -0.58, -0.18); mk(new RoundedBoxGeometry(0.34, 0.24, 0.26, 2, 0.04), secMat(0x2f6fd6, { clip }), starter); mk(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12), steel(), starter, 0.12, 0.2, 0);
  const bottles = new THREE.Group(); g.add(bottles); bottles.position.set(0.4, 0.62, -0.25); for (const x of [-0.18, 0.18]) { mk(new THREE.SphereGeometry(0.13, 16, 12), secMat(0xd62f2f, { clip, rough: 0.35 }), bottles, x, 0, 0); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8), steel(), bottles, x, 0.16, 0); }
  // ---------------- per-frame state
  const tmpM = new THREE.Matrix4(), tmpN = new THREE.Matrix3();
  function updateClip() { g.updateWorldMatrix(true, false); clip.normal.set(0, 0, -1); clip.constant = 0; clip.applyMatrix4(g.matrixWorld); }
  function set(st) {
    for (const k of Object.keys(S)) delete S[k]; Object.assign(S, { spin: 0, fanSpin: 0 }, st);
    const t = S.t ?? 0;
    // dryer
    dryer.g.visible = (S.dryer ?? 1) > 0; dryer.g.position.set(E.dryerX + (S.dryerDX ?? 0), S.dryerDY ?? 0, 0); dryer.g.scale.setScalar(S.dryerScale ?? 1);
    dryer.fan.rotation.x = S.spin * 1.4; dryer.fan.visible = (S.boxFan ?? 0) < 0.5; dryer.setGlow(S.coil ?? 0);
    dryer.coil.position.x = S.coilDX ?? 0; dryer.coil.visible = (S.coilOn ?? 1) > 0;
    // box fan: slides in from +x (0 → 1)
    { const k = S.boxFan ?? 0; boxFan.visible = k > 0.001; boxFan.position.x = E.fanX + (1 - k) * 0.6; boxFan.rotation.x = S.spin; boxFan.scale.setScalar(lerp(0.4, 1, Math.min(1, k * 1.4))); }
    // duct rings: count (continuous) — ring i slides in from the front (+x) over its own 0..1
    ductRings.forEach((r, i) => { const k = clamp((S.duct ?? 0) - i), e = 1 - (1 - k) * (1 - k); r.visible = k > 0.001; r.position.set(0, (1 - e) * 1.1, 0); r.scale.setScalar(lerp(1.15, 1, e)); });   // r5: each ring DROPS on from above (a slide along the axis hid behind Gary)
    stages.forEach((s, i) => { const k = clamp((S.stages ?? 0) - i); s.g.visible = k > 0.001; s.g.position.x = s.x - (1 - k) * 0.9; s.rot.rotation.x = S.spin; });   // slide in from behind
    compRings.forEach((r, i) => { const k = clamp((S.stages ?? 0) - i - 0.15); r.visible = k > 0.001; r.position.y = (1 - k) * 0.7; });   // casing ring drops on over its stage
    { const k = clamp((S.stages ?? 0) / 6); drum.visible = k > 0.01; const kd = Math.max(0.01, k); drum.scale.set(kd, 1, 1); drum.position.x = E.comp[0] * (1 - kd);   /* r4: grows from the front with the stages (r3: popped in) */ }
    // shaft: S.shaft 0 → 1 = its back end runs from x 1.4 (the dryer's motor) to −0.84 (the turbine)
    { const a = clamp(S.shaftA ?? 0), b = clamp(S.shaft ?? 0), xb = b > 0 ? lerp(0.2, -0.86, b) : lerp(1.42, 0.2, a), x0 = 1.9; shaft.visible = a > 0; shaft.scale.x = Math.max(0.01, x0 - xb); shaft.position.x = x0; shaft.rotation.x = S.spin; }
    // combustor
    { const k = S.comb ?? 0; combRings.forEach((r, i) => { const q = clamp(k * 2 - i); r.visible = q > 0.001; r.position.y = (1 - q) * 0.7; }); const q2 = clamp(k * 2 - 0.8); liner.visible = q2 > 0.001; liner.scale.setScalar(lerp(0.6, 1, q2)); liner.position.x = (1 - q2) * -0.3;
      const q3 = clamp(k * 2 - 1.2); injectors.visible = q3 > 0.001; injectors.scale.setScalar(Math.max(0.001, q3)); }
    { const f = S.flame ?? 0; flameG.visible = f > 0.01; flames.forEach((o, k) => { const fl = 0.75 + 0.25 * Math.sin(t * 31 + o.ph) * Math.sin(t * 17 + o.ph * 2), r = 0.255; o.s.position.set(o.x, Math.cos(o.a) * r, -Math.abs(Math.sin(o.a)) * r);
      const sz = (0.15 + 0.06 * fl) * (0.6 + 0.4 * f) * (S.flameBig ?? 1); o.s.scale.setScalar(sz); o.s.material.opacity = f * (0.55 + 0.35 * fl); }); }
    // turbine
    turbRings.forEach((r, i) => { const q = clamp((S.turbCase ?? 0) * 2 - i); r.visible = q > 0.001; r.position.y = (1 - q) * 0.7; });
    ngv.visible = (S.turbCase ?? 0) > 0.5;
    { const k = S.turbDisc ?? 0; turb.visible = k > 0.001; turb.position.x = -0.68 - (1 - k) * 0.8; turb.rotation.x = S.spin; tDisc.visible = k > 0.001;
      tBlades.forEach((b, i) => { const q = clamp((S.turbBlades ?? 0) - i); b.p.visible = q > 0.001; const out = (1 - q) * 0.5; b.b.position.y = out; b.b.scale.setScalar(Math.max(0.001, Math.min(1, q * 1.5)));
        const glow = S.tGlow ?? 0, melt = S.melt ?? 0, drilled = clamp((S.holes ?? 0) - (S.holeRank ? S.holeRank[i] : i)), film = (S.film ?? 0) * drilled;
        b.m.emissive.setHex(0xff4a10); b.m.emissiveIntensity = 1.8 * glow * (1 - drilled); b.m.color.setHex(glow > 0.3 && drilled < 1 ? 0x7a4a30 : 0xc4ccd4);
        b.m.map = drilled > 0.5 ? holesT : null; b.m.needsUpdate = b.m.userData.mapWas !== (drilled > 0.5); b.m.userData.mapWas = drilled > 0.5;
        // melt: the outer half sags (the blade droops toward the wall) — restored by the drilled replacement
        const m = melt * (1 - drilled); const pa = b.b.geometry.attributes.position, base = b.base;
        for (let v = 0; v < pa.count; v++) { const y = base[v * 3 + 1], u = clamp((y - 0.15) / 0.24); pa.array[v * 3] = base[v * 3] + m * u * u * 0.09 * Math.sin(i); pa.array[v * 3 + 1] = y - m * u * u * 0.07; }
        pa.needsUpdate = true;
        b.film.visible = film > 0.01; b.film.material.opacity = 0.55 * film * (0.75 + 0.25 * Math.sin(t * 22 + i)); });
    }
    // nozzle petals close in one by one (each swings from open-flat to its place)
    petals.forEach((pt, i) => { const q = clamp((S.petals ?? 0) - i); pt.p.visible = q > 0.001; pt.p.rotation.x = 0; pt.p.scale.setScalar(1); pt.m.position.set(0, 0, 0); pt.p.position.x = E.noz[0] - (1 - q) * 0.6; pt.m.scale.setScalar(lerp(1.3, 1, q)); });
    { const q = clamp(((S.petals ?? 0) - 5) / 5); plug.visible = q > 0.01; plug.position.x = -0.9 * (1 - q * q * (3 - 2 * q)); }   // r4: the tail cone slides in with the petals (r3: popped)
    // turbofan
    { const nk = S.nacelle ?? 0; nacRings.forEach((r, i) => { const q = clamp(nk - i); r.visible = q > 0.001; r.position.set((1 - q) * (2.4 + i * 0.4), 0, 0); r.scale.setScalar(lerp(0.9, 1, q)); }); lipT.visible = nk > 5.3; lipT.position.set(E.nac[0] + clamp((6 - nk) / 0.7) * 2.4, 0, 0);   /* r5: the lip goes on LAST */
      const hk = S.fanHub ?? 0; fanG.visible = hk > 0.001; fanG.position.x = E.bigFanX + (1 - hk) * 1.5; fanG.rotation.x = S.fanSpin;
      fanBlades.forEach((p, i) => { const q = clamp((S.fan ?? 0) - i); p.visible = q > 0.001; p.children[0].position.y = (1 - q) * 1.3; p.children[0].scale.setScalar(Math.max(0.001, Math.min(1, q * 1.4))); });
      cowl.visible = (S.cowl ?? 0) > 0.01; cowl.scale.set(1, lerp(0.7, 1, S.cowl ?? 0), lerp(0.7, 1, S.cowl ?? 0)); ogv.visible = (S.cowl ?? 0) > 0.9; { const n = S.ogv ?? 24; ogv.children.forEach((p, k) => { const q = clamp(n - k); p.visible = q > 0.01; p.scale.setScalar(Math.max(0.01, q)); }); }   /* r5b: the 24 stator vanes go in one by one AFTER the fan (they all popped at once and read as the fan) */
      spinM.map = (S.swirl ?? 0) > 0.5 ? swirlT : spinnerT; spinM.needsUpdate = spinM.userData.sw !== (S.swirl > 0.5); spinM.userData.sw = S.swirl > 0.5; spinner.scale.setScalar(1);
      const rv = S.reverser ?? 0; [nacRings[4], nacRings[5]].forEach((r) => { if (r.visible) r.position.x = -rv * 0.55; }); cascade.visible = rv > 0.02 && nk > 5.5; blockers.forEach((b) => { b.p.visible = rv > 0.02 && nk > 5.5; b.d.rotation.z = -rv * 1.1; }); }
    pylon.visible = (S.pylon ?? 0) > 0.001; pylon.position.y = 2.55 + (1 - (S.pylon ?? 0)) * 1.5;
    starter.visible = (S.starter ?? 0) > 0.001; starter.scale.setScalar(Math.max(0.001, S.starter ?? 0));
    bottles.visible = (S.bottles ?? 0) > 0.001; bottles.scale.setScalar(Math.max(0.001, S.bottles ?? 0));
  }
  set({});
  return { g, clip, updateClip, set, S, dryer, boxFan, fanG, stages, turb, tBlades, petals, nacRings, liner, flames, pylon, starter, bottles, E };
}

// ---------------------------------------------------------------- the duck (a mallard drake; origin = between the feet; faces +z)
// set({x,y,z,rotY, waddle (phase), flap 0..1, fly (legs tucked, body level), fluff 0..1 (a puffed-up fluffball), quack 0..1, eyes
// 'open'|'wide'|'closed'|'happy'|'spiral', look [dx, dy], tilt, scale, squash [sx, sy], t})
export function makeDuck() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const M = { grey: std(0xb9b4ab, 0.85), chest: std(0x8a4a2e, 0.8), head: std(0x1f7a4a, 0.45), ring: std(0xf4f2ec, 0.8), bill: std(0xf2c230, 0.5), feet: std(0xf08a2a, 0.6),
    wing: std(0x8f8a82, 0.85), speculum: std(0x3a5ec8, 0.4), tail: std(0x2a2a2a, 0.7), white: std(0xffffff, 0.25), pupil: std(0x15110e, 0.2), fluff: std(0xd8d2c6, 1) };
  const torso = mk(new THREE.SphereGeometry(0.2, 24, 16), M.grey, body, 0, 0.24, -0.02); torso.scale.set(0.95, 0.8, 1.35);
  const chest = mk(new THREE.SphereGeometry(0.16, 20, 14), M.chest, body, 0, 0.27, 0.13); chest.scale.set(0.95, 0.95, 0.8);
  const tail = mk(new THREE.ConeGeometry(0.08, 0.18, 12), M.grey, body, 0, 0.3, -0.27); tail.rotation.x = -2.2;
  const curl = mk(new THREE.TorusGeometry(0.03, 0.012, 6, 12, 4.5), M.tail, body, 0, 0.4, -0.3); curl.rotation.y = PI / 2;
  const neck = new THREE.Group(); body.add(neck); neck.position.set(0, 0.36, 0.15);
  mk(new THREE.CylinderGeometry(0.07, 0.085, 0.07, 16), M.ring, neck, 0, 0.02, 0);
  const head = new THREE.Group(); neck.add(head); head.position.set(0, 0.14, 0.02);
  mk(new THREE.SphereGeometry(0.12, 24, 18), M.head, head, 0, 0, 0).scale.set(0.95, 1, 1.05);
  const billTop = mk(new THREE.BoxGeometry(0.1, 0.03, 0.15), M.bill, head, 0, -0.025, 0.15); billTop.geometry.translate(0, 0, 0.04);
  const billBot = mk(new THREE.BoxGeometry(0.09, 0.02, 0.13), M.bill, head, 0, -0.05, 0.15); billBot.geometry.translate(0, 0, 0.035);
  const eyes = [-1, 1].map((s) => { const e = new THREE.Group(); head.add(e); e.position.set(s * 0.075, 0.035, 0.075); e.rotation.y = s * 0.55;
    const w = mk(new THREE.SphereGeometry(0.042, 14, 10), M.white, e); w.scale.z = 0.6; const p = mk(new THREE.SphereGeometry(0.021, 10, 8), M.pupil, e, 0, 0, 0.026);
    const lid = mk(new THREE.SphereGeometry(0.045, 14, 10, 0, TAU, 0, PI / 2), M.head, e); lid.rotation.x = -PI / 2; return { e, p, lid, w }; });
  const wings = [-1, 1].map((s) => { const piv = new THREE.Group(); body.add(piv); piv.position.set(s * 0.16, 0.32, 0.02); const w = mk(new THREE.SphereGeometry(0.16, 16, 10), M.wing, piv, s * 0.02, -0.05, -0.08); w.scale.set(0.25, 0.55, 1.15);
    const sp = mk(new THREE.BoxGeometry(0.02, 0.05, 0.1), M.speculum, piv, s * 0.05, -0.05, -0.12); return piv; });
  const legs = [-1, 1].map((s) => { const L = new THREE.Group(); body.add(L); L.position.set(s * 0.08, 0.14, 0.02); mk(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 8), M.feet, L, 0, -0.07, 0);
    const ft = mk(new THREE.BoxGeometry(0.11, 0.015, 0.13), M.feet, L, 0, -0.14, 0.04); return L; });
  // fluff shell: a spiky puff (shown when fluffed: the blowout)
  const fluff = new THREE.Group(); body.add(fluff); fluff.position.set(0, 0.27, 0); fluff.visible = false;
  for (let i = 0; i < 46; i++) { const u = h2(i, 21) * 2 - 1, a = h2(i, 22) * TAU, r = Math.sqrt(1 - u * u), R2 = 0.25; const b = mk(new THREE.SphereGeometry(0.09 + h2(i, 23) * 0.06, 12, 9), i % 5 ? M.fluff : M.chest, fluff, Math.cos(a) * r * R2, u * R2 * 0.9, Math.sin(a) * r * R2 * 1.2); b.scale.setScalar(1); }
  const fluffHead = new THREE.Group(); head.add(fluffHead); fluffHead.visible = false; for (let i = 0; i < 18; i++) { const u = h2(i, 31) * 2 - 1, a = h2(i, 32) * TAU, r = Math.sqrt(1 - u * u); mk(new THREE.SphereGeometry(0.05 + h2(i, 33) * 0.03, 10, 8), M.head, fluffHead, Math.cos(a) * r * 0.12, u * 0.12 + 0.02, Math.sin(a) * r * 0.12 - 0.02); }
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  function set(p = {}) {
    const t = p.t ?? 0, s = p.scale ?? 1;
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(p.rx ?? 0, p.rotY ?? 0, p.rz ?? 0); root.scale.setScalar(s);
    const wd = p.waddle, fly = p.fly ?? 0, [sx, sy] = p.squash || [1, 1];
    body.rotation.set(fly * -0.15 + (p.tilt ?? 0), 0, wd == null ? 0 : Math.sin(wd) * 0.18); body.position.y = wd == null ? 0 : Math.abs(Math.sin(wd)) * 0.02; body.scale.set(sx, sy, sx);
    legs.forEach((L, i) => { L.rotation.x = wd == null ? fly * 1.2 : Math.sin(wd + i * PI) * 0.5; L.position.y = 0.14 + fly * 0.05; });
    const fl = p.flap ?? 0; wings.forEach((w, i) => { const s2 = i ? 1 : -1; w.rotation.z = s2 * (fl > 0 ? (0.2 + 1.0 * fl * (0.5 + 0.5 * Math.sin(t * 34))) : 0.05); w.rotation.y = s2 * fl * 0.3; });
    const f = p.fluff ?? 0; fluff.visible = f > 0.01; fluff.scale.setScalar(Math.max(0.01, f) * 0.78 * (1 + 0.03 * Math.sin(t * 9))); torso.visible = chest.visible = f < 0.7; fluffHead.visible = f > 0.3; fluffHead.scale.setScalar(Math.max(0.01, f));
    head.rotation.set((p.look?.[1] ?? 0) * -0.5 + (p.nod ?? 0), (p.look?.[0] ?? 0) * 0.7, p.headTilt ?? 0);
    const q = p.quack ?? 0; billBot.rotation.x = q * 0.5;
    const ey = p.eyes ?? 'open'; const blink = ((t * 0.83) % 2.7) < 0.1;
    eyes.forEach(({ e, p: pu, lid, w }) => { const wide = ey === 'wide' ? 1.3 : 1; w.scale.set(wide, wide, 0.6 * wide); pu.scale.setScalar(ey === 'spiral' ? 0.4 : 1); lid.visible = ey === 'closed' || ey === 'happy' || blink || ey === 'half'; lid.rotation.x = ey === 'half' ? -0.9 : -PI / 2 + (ey === 'happy' ? 0.5 : 0);
      pu.position.set((p.look?.[0] ?? 0) * 0.012, (p.look?.[1] ?? 0) * 0.012, 0.026); });
  }
  set({});
  return { root, body, head, set };
}

// ---------------------------------------------------------------- Gary's cardboard plane (a fridge box with wings; origin = ground under its centre; nose +x)
export async function makeCardboardPlane() {
  await document.fonts.load(font(64)).catch(() => {});
  const g = new THREE.Group();
  const cardT = tex(512, 256, (c, w, h) => { c.fillStyle = '#c99a62'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,80,40,.25)'; c.lineWidth = 2; for (let y = 6; y < h; y += 9) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.fillStyle = '#2b2b2b'; c.font = font(64); c.textAlign = 'center'; c.fillText('GARY AIR', w * 0.5, h * 0.42); c.font = font(30); c.fillText('THIS SIDE UP ↑', w * 0.5, h * 0.78);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 16; c.beginPath(); c.moveTo(w * 0.08, h * 0.12); c.lineTo(w * 0.08, h * 0.9); c.stroke(); });
  const cardM = new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.95 }), plainM = std(0xc99a62, 0.95), tapeM = std(0xd9d9d9, 0.4, { transparent: true, opacity: 0.85 });
  const body = new THREE.Group(); g.add(body);
  const box = mk(new THREE.BoxGeometry(1.8, 0.46, 0.62), [plainM, plainM, plainM, plainM, cardM, cardM], body, 0.2, 0.4, 0);
  mk(new THREE.BoxGeometry(0.62, 0.66, 0.74), std(0x111111, 0.9), body, 0.62, 0.5, 0).visible = false;
  const nose = mk(new THREE.ConeGeometry(0.32, 0.5, 4), plainM, body, 1.35, 0.4, 0); nose.rotation.set(PI / 4, 0, -PI / 2);
  for (const s of [-1, 1]) { const w = mk(new THREE.BoxGeometry(0.6, 0.03, 0.72), plainM, body, 0.35, 0.5, s * 0.66); w.rotation.x = s * -0.06; mk(new THREE.BoxGeometry(0.2, 0.032, 0.4), tapeM, body, 0.35, 0.52, s * 0.42); }
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.32, 0.03, 0.45), plainM, body, -0.6, 0.64, s * 0.34);
  // the engine mount: two cardboard cradles on the box's back + a skateboard + a tail caster under the overhang
  const board = mk(new RoundedBoxGeometry(1.9, 0.05, 0.42, 2, 0.02), std(0x2b6fd6, 0.6), body, 0.15, 0.13, 0);
  const wheels = []; for (const x of [-0.6, 0.85]) for (const z of [-0.16, 0.16]) { const w = mk(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 14), std(0xffd23f, 0.5), body, x, 0.06, z); w.rotation.x = PI / 2; wheels.push(w); }
  const caster = new THREE.Group(); body.add(caster); caster.position.set(-2.3, 0, -0.3); mk(new THREE.BoxGeometry(0.06, 0.6, 0.06), std(0x3a3e44, 0.6), caster, 0, 0.38, 0); mk(new THREE.BoxGeometry(0.3, 0.05, 0.2), std(0x3a3e44, 0.6), caster, 0, 0.1, 0); const cw = mk(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), std(0xffd23f, 0.5), caster, 0, 0.11, 0);   /* r5: a real tail wheel (v4 read as a display stand) */ cw.rotation.x = PI / 2; caster.visible = false;
  const seat = new THREE.Object3D(); body.add(seat); seat.position.set(0.62, 0.5, 0);   // Gary's seat (his pelvis sits here)
  const mount = new THREE.Object3D(); body.add(mount); mount.position.set(-1.45, 0.79, 0);  // the engine's local origin (axis height set per stage)
  // burnt / shredded state: char + falling panels
  const chunks = []; for (let i = 0; i < 14; i++) { const c = mk(new THREE.BoxGeometry(0.6 + h2(i) * 0.5, 0.03, 0.45 + h2(i, 2) * 0.4), i % 3 ? plainM : cardM, g, 0, 0, 0); c.visible = false; chunks.push(c); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  function set(p = {}) {
    g.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); g.rotation.set(0, p.rotY ?? 0, p.roll ?? 0); body.rotation.z = p.pitch ?? 0;
    wheels.forEach((w) => { w.rotation.y = (p.roll2 ?? 0); }); caster.visible = !!p.caster;
    const ch = p.char ?? 0; plainM.color.setHex(0xc99a62).lerp(new THREE.Color(0x3a2a1c), ch * 0.8); cardM.color.setHex(0xffffff).lerp(new THREE.Color(0x4a3a2c), ch * 0.8);
    const sh = p.shred ?? 0; body.visible = sh < 0.05;
    chunks.forEach((c, i) => { c.visible = sh > 0.02 && sh < 1; if (!c.visible) return; const a = sh * 1.6, d = [h2(i, 4) - 0.5, 0.8 + h2(i, 5), h2(i, 6) - 0.5]; c.position.set(d[0] * a * 4 + a * 5, Math.max(0.02, 0.6 + d[1] * a * 3.2 - 4.9 * a * a), d[2] * a * 4); c.rotation.set(a * 9 * d[0], a * 7, a * 11 * d[2]); /* r3: bigger, more, carried forward (v2 vanished in a frame) */ });
  }
  set({});
  return { g, body, seat, mount, set, box };
}

// ---------------------------------------------------------------- the airliner ("GARY AIR", a toy wide-body; origin = the ground under the fuselage at the wing root; nose +x,
// right wing toward +z). P.engine = where Gary's engine's local origin sits (right wing); P.seat = Gary's pelvis in the cockpit (behind the +z side window).
export const P = { FY: 6.2, FR: 2.6, nose: 20.2, tail: -30, engine: [-2.0, 3.0, 8.5], seat: [16.6, 6.25, 1.05], wingY: 4.4 };
export async function makeAirliner() {
  await document.fonts.load(font(64)).catch(() => {});
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const liv = tex(2048, 256, (c, w, h) => { c.fillStyle = '#f7f8fa'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fbf'; c.fillRect(0, h * 0.66, w, h * 0.34); c.fillStyle = '#ffc21a'; c.fillRect(0, h * 0.62, w, h * 0.04);
    c.fillStyle = '#26303a'; for (let x = 120; x < w - 260; x += 30) { c.beginPath(); c.roundRect(x, h * 0.36, 15, 22, 6); c.fill(); }
    c.fillStyle = '#1f5fbf'; c.font = font(92); c.textAlign = 'center'; c.fillText('GARY AIR', w * 0.62, h * 0.27); });
  liv.wrapS = THREE.ClampToEdgeWrapping;
  const whiteM = std(0xf7f8fa, 0.4, { metalness: 0.1 }), blueM = std(0x1f5fbf, 0.45), glassM = std(0x1c2a38, 0.15, { metalness: 0.4, transparent: true, opacity: 0.45 }), greyM = std(0x9aa3ad, 0.45, { metalness: 0.5 }), tyreM = std(0x34363a, 0.85);
  // fuselage: a cylinder (liveried) + nose + upswept tail cone
  const fgeo = new THREE.CylinderGeometry(P.FR, P.FR, 34, 48, 1, true); fgeo.rotateZ(-PI / 2); fgeo.translate(-3, P.FY, 0);
  { const uv = fgeo.attributes.uv, pos = fgeo.attributes.position; for (let i = 0; i < uv.count; i++) { const x = pos.getX(i), y = pos.getY(i) - P.FY, z = pos.getZ(i); uv.setXY(i, (x + 20) / 34, z >= 0 ? (y / P.FR) * 0.5 + 0.5 : (y < 0 ? 0.02 : 0.98)); } }
  const fus = mk(fgeo, new THREE.MeshStandardMaterial({ map: liv, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide }), body);
  // the nose cap, with a gap behind the +z side windows so the pilot shows through the glass (theta from the nose tip, phi round the axis)
  const noseC = new THREE.Group(); body.add(noseC); noseC.position.set(14, P.FY, 0); noseC.rotation.z = -PI / 2; noseC.scale.set(1, 2.4, 1);
  for (const [p0, pl, t0, tl] of [[0, TAU, 0, 0.92], [0, 0.72, 0.92, 0.36], [1.6, TAU - 1.6, 0.92, 0.36], [0, TAU, 1.28, PI / 2 - 1.28]]) mk(new THREE.SphereGeometry(P.FR, 40, 24, p0, pl, t0, tl), whiteM.clone(), noseC).material.side = THREE.DoubleSide;
  const tailC = mk(new THREE.CylinderGeometry(0.5, P.FR, 10, 40, 1, true), whiteM, body, -25, P.FY + 0.9, 0); tailC.rotation.z = PI / 2 - 0.12; tailC.material.side = THREE.DoubleSide;
  // cockpit: windshield panes on both sides + a dark cab inside (Gary sits behind the +z pane)
  const cab = mk(new THREE.BoxGeometry(3.2, 1.6, 3.6), std(0x2a2f36, 0.8, { side: THREE.BackSide }), body, 16.8, 6.6, 0);
  const panes = []; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const pn = mk(new THREE.PlaneGeometry(0.9, 0.62), glassM, body, 16.3 + i * 0.95, 7.15, s * (P.FR * 0.9 - i * 0.28)); pn.rotation.y = s > 0 ? -0.15 - i * 0.35 : PI + 0.15 + i * 0.35; panes.push(pn); }
  const frameM = std(0x30363d, 0.6); mk(new THREE.BoxGeometry(2.2, 0.12, 0.08), frameM, body, 16.8, 7.5, P.FR * 0.82); mk(new THREE.BoxGeometry(2.2, 0.12, 0.08), frameM, body, 16.8, 6.82, P.FR * 0.84);
  // wings (swept, tapered, dihedral) + flaps; the right wing (+z) carries Gary's engine
  function wing(s) { const sh = new THREE.Shape(); const root = 2.5, span = 24.5, sweep = 0.58, cR = 9.5, cT = 2.3; sh.moveTo(3.5, 0); sh.lineTo(3.5 - sweep * span, span); sh.lineTo(3.5 - sweep * span - cT, span); sh.lineTo(3.5 - cR, 0); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2 }); geo.rotateX(PI / 2); geo.translate(0, 0.5, 0);   // shape y (span) → +z, extrude depth → −y (thickness)
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), th = 1 - 0.65 * clamp(z / span); p.setY(i, (p.getY(i) - 0.5) * th + 0.5 + z * 0.105); p.setZ(i, s * (z + root)); } if (s < 0) geo.index && geo.setIndex(geo.index.array.slice().reverse()); geo.computeVertexNormals();
    const w = mk(geo, whiteM, body, 0, P.wingY, 0); if (s < 0) w.geometry.scale(1, 1, 1); return w; }
  const wings = [wing(1), wing(-1)];
  // tail fin + stabilisers (the fin wears a pink hair dryer logo)
  const finSh = new THREE.Shape(); finSh.moveTo(-22.5, 0); finSh.lineTo(-28.2, 8.4); finSh.lineTo(-30.6, 8.4); finSh.lineTo(-29.4, 0); finSh.closePath();
  const fin = mk(new THREE.ExtrudeGeometry(finSh, { depth: 0.4, bevelEnabled: false }), whiteM, body, 0, P.FY + 1.4, -0.2);
  const logo = mk(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshStandardMaterial({ map: tex(256, 256, (c, w, h) => { c.fillStyle = '#1f5fbf'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 4, 0, 7); c.fill(); c.fillStyle = '#ff6fa3'; c.beginPath(); c.roundRect(60, 80, 120, 56, 26); c.fill(); c.beginPath(); c.roundRect(118, 118, 34, 80, 12); c.fill(); c.fillStyle = '#26303a'; c.fillRect(30, 92, 34, 32); }), roughness: 0.5, transparent: true }), body, -27.4, P.FY + 5.6, 0.23);
  for (const s of [-1, 1]) { const st = new THREE.Shape(); st.moveTo(-24, 0); st.lineTo(-27.8, 8 * s); st.lineTo(-29.4, 8 * s); st.lineTo(-29.2, 0); st.closePath(); const sg = new THREE.ExtrudeGeometry(st, { depth: 0.25, bevelEnabled: false }); sg.rotateX(PI / 2); mk(sg, whiteM, body, 0, P.FY + 1.1, 0); }
  // landing gear: nose + two main bogies (setGear k: 1 down, 0 up)
  const gear = []; for (const [x, z, n] of [[15.4, 0, 1], [-3.5, 2.7, 2], [-3.5, -2.7, 2]]) { const gg = new THREE.Group(); body.add(gg); gg.position.set(x, P.FY - P.FR + 0.4, z);
    mk(new THREE.CylinderGeometry(0.16, 0.16, 2.8, 10), greyM, gg, 0, -1.4, 0); for (let k = 0; k < n; k++) for (const sz of [-0.32, 0.32]) { const w = mk(new THREE.CylinderGeometry(0.6, 0.6, 0.38, 20), tyreM, gg, (k - (n - 1) / 2) * 1.3, -2.85, sz); w.rotation.x = PI / 2; } gear.push(gg); }
  // the far (left) engine: a plain closed nacelle (it's always on the far side of the fuselage)
  const farEng = new THREE.Group(); body.add(farEng); farEng.position.set(-2.0, 3.0, -8.5);
  mk(new THREE.CylinderGeometry(1.86, 1.6, 3.9, 40, 1, true), whiteM, farEng, 0.9, 0, 0).rotation.z = PI / 2; farEng.children[0].material = whiteM.clone(); farEng.children[0].material.side = THREE.DoubleSide;
  mk(new THREE.CircleGeometry(1.72, 32), std(0x20262c, 0.5), farEng, 2.7, 0, 0).rotation.y = PI / 2;
  mk(new RoundedBoxGeometry(2.6, 1.6, 0.36, 3, 0.08), whiteM, farEng, 1.4, 2.0, 0);
  const engineMount = new THREE.Object3D(); body.add(engineMount); engineMount.position.set(...P.engine);
  const seat = new THREE.Object3D(); body.add(seat); seat.position.set(...P.seat);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  function set(p = {}) { g.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); g.rotation.set(p.roll ?? 0, p.yaw ?? 0, p.pitch ?? 0, 'YXZ'); const k = p.gear ?? 1; gear.forEach((gg) => { gg.rotation.z = (1 - k) * 1.5 * (gg.position.x > 0 ? -1 : 1); gg.visible = k > 0.02; }); }
  set({});
  return { g, body, set, engineMount, seat, panes, cab, wings, gear, farEng };
}

// ---------------------------------------------------------------- small props
export function makeJellyBird() {   // a gelatin stand-in bird for the bird-strike test: translucent, wobbly (origin = its belly)
  const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: 0xff6a3a, roughness: 0.12, transmission: 0.0, transparent: true, opacity: 0.78, emissive: 0x6a1a08, emissiveIntensity: 0.35, clearcoat: 1 });
  const b = mk(new THREE.SphereGeometry(0.2, 20, 14), m, g, 0, 0.18, 0); b.scale.set(1, 0.8, 1.3); const hd = mk(new THREE.SphereGeometry(0.11, 16, 12), m, g, 0, 0.36, 0.17); mk(new THREE.ConeGeometry(0.05, 0.12, 10), m, g, 0, 0.34, 0.31).rotation.x = PI / 2;
  return { g, set(t, w = 0) { const s = 1 + 0.12 * w * Math.sin(t * 40); g.scale.set(s, 1 / s, s); } };
}
export function makeBirdCannon() {  // a compressed-air "chicken gun": a long barrel on a tripod + a tank (barrel along +x, origin = the muzzle's foot)
  const g = new THREE.Group(), bar = new THREE.Group(); g.add(bar); bar.position.set(-1.6, 1.2, 0);
  mk(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 20), steel(0x6b737b), bar, 1.7, 0, 0).rotation.z = PI / 2; mk(new THREE.TorusGeometry(0.24, 0.04, 8, 24), steel(0x3a3e44), bar, 3.4, 0, 0).rotation.y = PI / 2;
  mk(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 20), std(0xd62f2f, 0.4), bar, -0.2, 0, 0).rotation.z = PI / 2;
  for (const [x, z] of [[0.5, 0.6], [0.5, -0.6], [2.6, 0]]) mk(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 8), steel(0x3a3e44), g, x - 1.6, 0.6, z);
  const label = sign(bar, 'BIRD GUN', 1.4, 0.32, { bg: '#ffd23f', fg: '#222' }); label.position.set(1.2, -0.06, -0.225); label.rotation.set(-0.35, PI, 0);   // r3: faces the lens once it's turned to fire
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return { g, muzzle: new THREE.Vector3(1.8, 1.2, 0) };
}
export function makeJerryCan() { const g = new THREE.Group(); mk(new RoundedBoxGeometry(0.34, 0.46, 0.16, 3, 0.03), std(0xd62f2f, 0.4), g, 0, 0.23, 0); mk(new THREE.TorusGeometry(0.07, 0.02, 6, 12, PI), std(0xd62f2f, 0.4), g, 0, 0.5, 0); const sp = mk(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 8), std(0x222222, 0.5), g, 0.14, 0.5, 0); sp.rotation.z = -0.8; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return { g, spout: new THREE.Vector3(0.22, 0.56, 0) }; }
export function makeScissors() { const g = new THREE.Group(), a = new THREE.Group(), b = new THREE.Group(); g.add(a, b); for (const [h, s] of [[a, 1], [b, -1]]) { mk(new THREE.BoxGeometry(0.02, 0.2, 0.012), steel(0xdfe5ea, 0.2), h, 0, 0.1, s * 0.006); mk(new THREE.TorusGeometry(0.035, 0.012, 6, 14), std(0xd62f2f, 0.5), h, 0, -0.05, s * 0.006); }
  return { g, set(open) { a.rotation.z = open * 0.35; b.rotation.z = -open * 0.35; } }; }
export function makeTank() {   // a clear jug on the plane's side; the fuel level fills it (flat surface, fills the whole cross-section)
  const g = new THREE.Group(); const R = 0.16, H = 0.42;
  mk(new THREE.CylinderGeometry(R, R, H, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }), g, 0, H / 2, 0);
  mk(new THREE.CircleGeometry(R, 24), std(0xdddddd, 0.4), g, 0, 0.002, 0).rotation.x = -PI / 2;
  const fuel = mk(new THREE.CylinderGeometry(R - 0.006, R - 0.006, 1, 24), new THREE.MeshStandardMaterial({ color: 0xf2b84a, roughness: 0.15, transparent: true, opacity: 0.9, emissive: 0x3a2200, emissiveIntensity: 0.3 }), g, 0, 0, 0);
  const cap = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), std(0x2f6fd6, 0.4), g, 0, H + 0.02, 0);
  return { g, set(level) { const L = clamp(level) * (H - 0.01); fuel.visible = L > 0.002; fuel.scale.y = Math.max(0.001, L); fuel.position.y = 0.004 + L / 2; } };
}
// a flat paper ribbon along points (toilet paper: the unrolling strip + the mummy wrap). update(pts, width, up(i) → side vector)
export function makeRibbon(n = 160, color = 0xfbfbf6) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 2 * 3), idx = [];
  for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide })); m.castShadow = true; m.frustumCulled = false;
  return { m, n, update(pts, w, side) { const k = Math.min(n, pts.length); m.visible = k > 1; for (let i = 0; i < n; i++) { const j = Math.min(i, k - 1), p = pts[j], s = side(j, p); pos[i * 6] = p[0] - s[0] * w; pos[i * 6 + 1] = p[1] - s[1] * w; pos[i * 6 + 2] = p[2] - s[2] * w; pos[i * 6 + 3] = p[0] + s[0] * w; pos[i * 6 + 4] = p[1] + s[1] * w; pos[i * 6 + 5] = p[2] + s[2] * w; } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); } };
}
// a power cord (a tube rebuilt per frame through points)
export function makeCord(color = 0xf2f2f2, r = 0.012) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), std(color, 0.5)); m.castShadow = true; m.frustumCulled = false;
  const plug = new THREE.Group(); mk(new RoundedBoxGeometry(0.05, 0.04, 0.035, 2, 0.008), std(color, 0.5), plug); for (const z of [-0.008, 0.008]) mk(new THREE.BoxGeometry(0.035, 0.004, 0.006), steel(0xd9c27a, 0.3), plug, 0.04, 0, z);
  return { m, plug, update(pts) { if (pts.length < 2) { m.visible = false; return; } m.visible = true; const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(c, Math.min(400, pts.length * 6), r, 6, false); } };
}

// ---------------------------------------------------------------- moods (blended by setMood)
const C = (h) => new THREE.Color(h);
export const MOODS = {
  day:    { top: C(0x3f8fdf), hor: C(0xd6ecf8), bot: C(0x8fb07a), sun: C(0xfff2dc), sunI: 2.8, dir: [-0.42, 0.78, 0.46], hs: C(0xe6f2ff), hg: C(0x8a7a62), hi: 1.15, fog: C(0xd6ecf8), fn: 120, ff: 900, glow: 0.6, exp: 1.0, room: 1.0 },
  golden: { top: C(0x4a7fd0), hor: C(0xffd9a8), bot: C(0x9a9a72), sun: C(0xffc98a), sunI: 2.7, dir: [-0.62, 0.42, 0.66], hs: C(0xffe6c8), hg: C(0x7a6650), hi: 0.92, fog: C(0xf2d8b8), fn: 140, ff: 1100, glow: 1.0, exp: 1.02, room: 1.0 },
  sunset: { top: C(0x3a4a8e), hor: C(0xff9a62), bot: C(0x7a5a6a), sun: C(0xffa868), sunI: 2.3, dir: [0.86, 0.2, 0.46], hs: C(0xffc6a8), hg: C(0x5a4a58), hi: 1.02, fog: C(0xf0b090), fn: 500, ff: 4200, glow: 1.4, exp: 1.06, room: 1.2 },
  cloud:  { top: C(0xd8dde2), hor: C(0xeceff1), bot: C(0xe6e9ec), sun: C(0xffffff), sunI: 1.4, dir: [0.86, 0.3, 0.46], hs: C(0xf2f4f6), hg: C(0xd0d4d8), hi: 1.6, fog: C(0xeef0f2), fn: 2, ff: 70, glow: 0, exp: 1.0, room: 1.0 },
};

// ---------------------------------------------------------------- the world
export async function buildJet(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96)).catch(() => {});
  renderer.localClippingEnabled = true;
  camera.far = 3000; camera.near = 0.05; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0xd6ecf8); scene.fog = new THREE.Fog(0xd6ecf8, 120, 900);
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xe6f2ff, 0x8a7a62, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.8); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; root.add(sun, sun.target);
  const SUN = new THREE.Vector3(-0.42, 0.78, 0.46).normalize();
  function aimSun(cx, cy, cz, half = 10) { sun.position.set(cx + SUN.x * 80, cy + SUN.y * 80, cz + SUN.z * 80); sun.target.position.set(cx, cy, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 200 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(2, 1, -1, 8);

  // ---- sky dome (follows the camera) + far painted clouds
  const skyU = { uTop: { value: C(0x3f8fdf) }, uHor: { value: C(0xd6ecf8) }, uBot: { value: C(0x8fb07a) }, uSunDir: { value: SUN.clone() }, uSunCol: { value: C(0xfff2dc) }, uGlow: { value: 0.6 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 48, 24), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uTop, uHor, uBot, uSunDir, uSunCol; uniform float uGlow; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float h = d.y; vec3 c = h > 0.0 ? mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.5)) : mix(uHor, uBot, clamp(-h * 5.0, 0.0, 1.0));
        float s = max(dot(d, normalize(uSunDir)), 0.0); c += uSunCol * (pow(s, 900.0) * 3.0 + pow(s, 14.0) * 0.32 * uGlow + pow(s, 3.0) * 0.08 * uGlow); gl_FragColor = vec4(c, 1.0); }` }));
  sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);
  sky.onBeforeRender = (r, s, cam) => { sky.position.copy(cam.position); };
  const puffT = tex(256, 128, (c, w, h) => { for (let k = 0; k < 9; k++) { const x = w * (0.18 + 0.64 * h2(k, 3)), y = h * (0.45 + 0.25 * (h2(k, 4) - 0.5)), r = h * (0.22 + 0.2 * h2(k, 5)); const gr = c.createRadialGradient(x, y - r * 0.25, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.65, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  const skyClouds = []; for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false, opacity: 0.95 })); const a = (i / 26) * TAU + h2(i) * 0.3, r = 900 + 400 * h2(i, 2); sp.position.set(Math.cos(a) * r, 140 + 160 * h2(i, 7), Math.sin(a) * r); sp.scale.set(260 + 160 * h2(i, 8), 110 + 60 * h2(i, 9), 1); sp.renderOrder = -9; root.add(sp); skyClouds.push(sp); }

  // ---- ground: lawn (around the house), the far patchwork, the airfield grass + apron + runway
  const lawnT = tex(64, 64, (c, w, h) => { c.fillStyle = '#86c45e'; c.fillRect(0, 0, 32, 64); c.fillStyle = '#78b652'; c.fillRect(32, 0, 32, 64); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${h2(i, 1) > 0.5 ? '255,255,255' : '0,40,0'},.06)`; c.fillRect(h2(i, 2) * 64, h2(i, 3) * 64, 1, 3); } });
  lawnT.wrapS = lawnT.wrapT = THREE.RepeatWrapping; lawnT.repeat.set(140 / 1.8, 140 / 1.8); lawnT.magFilter = THREE.NearestFilter;
  const lawn = mk(new THREE.PlaneGeometry(140, 140), std(0xffffff, 0.95, { map: lawnT }), root, 20, -0.02, 10); lawn.rotation.x = -PI / 2; lawn.receiveShadow = true;
  const farT = tex(1024, 1024, (c, w, h) => { const cols = ['#9cc46a', '#b8cf74', '#86b45a', '#c9c27a', '#a7c96e', '#8fbf62', '#d2c98a']; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { c.fillStyle = cols[Math.floor(h2(i, j) * cols.length)]; c.fillRect(i * 64, j * 64, 64, 64); c.strokeStyle = 'rgba(70,90,50,.35)'; c.lineWidth = 2; c.strokeRect(i * 64, j * 64, 64, 64); } });
  farT.wrapS = farT.wrapT = THREE.RepeatWrapping; farT.repeat.set(12, 12);
  const far = mk(new THREE.PlaneGeometry(6000, 6000), std(0xffffff, 1, { map: farT }), root, 600, -0.2, 0); far.rotation.x = -PI / 2; far.receiveShadow = true;
  const grassT = tex(64, 64, (c, w, h) => { c.fillStyle = '#9ccf6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#8fc35f'; c.fillRect(0, 0, w, 32); }); grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(60, 40); grassT.magFilter = THREE.NearestFilter;
  const field = mk(new THREE.PlaneGeometry(2600, 300), std(0xffffff, 0.95, { map: grassT }), root, 32.5 + 1300, -0.01, -20); field.rotation.x = -PI / 2; field.receiveShadow = true;
  const apronT = tex(256, 256, (c, w, h) => { c.fillStyle = '#a7a49c'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(60,60,55,${0.03 + h2(i) * 0.05})`; c.beginPath(); c.ellipse(h2(i, 1) * w, h2(i, 2) * h, 8 + h2(i, 3) * 30, 4 + h2(i, 4) * 14, h2(i, 5) * 3, 0, 7); c.fill(); } });
  apronT.wrapS = apronT.wrapT = THREE.RepeatWrapping; apronT.repeat.set(80 / 6, 48 / 6);
  const apron = mk(new THREE.PlaneGeometry(80, 48), std(0xffffff, 0.85, { map: apronT }), root, 34 + 40, 0.004, -10); apron.rotation.x = -PI / 2; apron.receiveShadow = true;
  { const fT = tex(256, 8, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(167,164,156,0)'); g.addColorStop(0.35, 'rgba(167,164,156,0.85)'); g.addColorStop(1, 'rgba(167,164,156,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const fe = mk(new THREE.PlaneGeometry(14, 48), new THREE.MeshStandardMaterial({ map: fT, transparent: true, depthWrite: false, roughness: 0.9 }), root, 112, 0.009, -10); fe.rotation.x = -PI / 2; fe.receiveShadow = true; }   // r5: a feathered apron → runway edge (it popped in one frame on the takeoff roll)
  const rwyT = tex(512, 512, (c, w, h) => { c.fillStyle = '#62656b'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${h2(i) > 0.5 ? 255 : 0},${h2(i) > 0.5 ? 255 : 0},${h2(i) > 0.5 ? 255 : 0},.05)`; c.fillRect(h2(i, 1) * w, h2(i, 2) * h, 3, 3); } c.fillStyle = '#f2f2ee'; c.fillRect(0, h / 2 - 6, w * 0.55, 12); c.fillRect(0, 10, w, 10); c.fillRect(0, h - 20, w, 10); });
  rwyT.wrapS = THREE.RepeatWrapping; rwyT.repeat.set((D.rwyX1 - D.rwyX0) / 60, 1); rwyT.anisotropy = 16;
  const rwy = mk(new THREE.PlaneGeometry(D.rwyX1 - D.rwyX0, 44), std(0xffffff, 0.9, { map: rwyT }), root, (D.rwyX0 + D.rwyX1) / 2, 0.006, D.rwyZ); rwy.rotation.x = -PI / 2; rwy.receiveShadow = true;
  const keysT = tex(256, 256, (c, w, h) => { c.fillStyle = '#4b4e52'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; for (let i = 0; i < 8; i++) c.fillRect(16, 10 + i * 31, w - 32, 16); });
  const keys = mk(new THREE.PlaneGeometry(14, 40), std(0xffffff, 0.9, { map: keysT }), root, D.rwyX0 + 9, 0.008, D.rwyZ); keys.rotation.x = -PI / 2;
  const numT = tex(256, 256, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; c.font = font(170); c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(w / 2, h / 2); c.rotate(PI / 2); c.fillText('09', 0, 10); });
  const num = mk(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: numT, transparent: true, roughness: 0.9 }), root, D.rwyX0 + 26, 0.01, D.rwyZ); num.rotation.x = -PI / 2;
  const taxiLine = mk(new THREE.PlaneGeometry(D.rwyX0 - 40, 0.35), std(0xffc21a, 0.6), root, (40 + D.rwyX0) / 2, 0.009, D.rwyZ); taxiLine.rotation.x = -PI / 2;
  // runway edge lights
  const lampM = new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffe08a, emissiveIntensity: 0.8 });
  for (let x = D.rwyX0; x < 1500; x += 30) for (const z of [D.rwyZ - 22.5, D.rwyZ + 22.5]) { mk(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6), std(0x777777), root, x, 0.2, z); mk(new THREE.SphereGeometry(0.12, 8, 6), lampM, root, x, 0.45, z); }

  // ---- the HOUSE (dollhouse cut at z = 0)
  const house = new THREE.Group(); root.add(house);
  const B = D.back, WH = D.wallH;
  const tileT = tex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#f4f6f6' : '#5fc0b8'; c.fillRect(i * 32, j * 32, 32, 32); } c.strokeStyle = 'rgba(0,0,0,.1)'; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } }); tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(3.4 / 1.2, 3.4 / 1.2);
  const woodT = tex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#b98a5a', '#a87a4c', '#c4956a', '#b08250'][i % 4]; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, i * 32, w, 2); c.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); } }); woodT.wrapS = woodT.wrapT = THREE.RepeatWrapping; woodT.repeat.set(2, 2);
  const concT = tex(256, 256, (c, w, h) => { c.fillStyle = '#b9b5ae'; c.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(40,35,30,${0.04 + h2(i) * 0.08})`; c.beginPath(); c.ellipse(h2(i, 1) * w, h2(i, 2) * h, 10 + h2(i, 3) * 40, 6 + h2(i, 4) * 20, h2(i, 5) * 3, 0, 7); c.fill(); } }); concT.wrapS = concT.wrapT = THREE.RepeatWrapping; concT.repeat.set(2.5, 1.2);
  const floor = (x0, x1, map, y = 0.0) => { const f = mk(new THREE.PlaneGeometry(x1 - x0, -B), std(0xffffff, 0.8, { map }), house, (x0 + x1) / 2, y + 0.004, B / 2); f.rotation.x = -PI / 2; f.receiveShadow = true; return f; };
  floor(D.bath.x0, D.bath.x1, tileT); floor(D.hall.x0, D.hall.x1, woodT); floor(D.garage.x0, D.garage.x1, concT);
  // foundation step in section along the front + a slab
  mk(new THREE.BoxGeometry(14.8, 0.2, -B + 0.2), [SECTION, SECTION, std(0xa8a49c), SECTION, SECTION, SECTION], house, 7.2, -0.1, B / 2 - 0.1);
  const bathWT = tex(256, 256, (c, w, h) => { c.fillStyle = '#7fd0c8'; c.fillRect(0, 0, w, h); c.fillStyle = '#f4f6f6'; c.fillRect(0, h * 0.55, w, h * 0.45); c.strokeStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, h * 0.55); c.lineTo(x, h); c.stroke(); } for (let y = h * 0.55; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.fillStyle = '#4fa8a0'; c.fillRect(0, h * 0.53, w, 6); }); bathWT.wrapS = THREE.RepeatWrapping; bathWT.repeat.set(2, 1);
  const hallWT = tex(256, 256, (c, w, h) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(200,150,90,.35)'; for (let x = 0; x < w; x += 24) c.fillRect(x, 0, 6, h * 0.7); c.fillStyle = '#8a5a3a'; c.fillRect(0, h * 0.7, w, h * 0.3); c.fillStyle = '#6a4228'; c.fillRect(0, h * 0.7, w, 6); }); hallWT.wrapS = THREE.RepeatWrapping; hallWT.repeat.set(3, 1);
  const garWT = tex(256, 256, (c, w, h) => { c.fillStyle = '#dfe6e9'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < h; y += 24) c.fillRect(0, y, w, 2); }); garWT.wrapS = THREE.RepeatWrapping; garWT.repeat.set(3, 1);
  const backWall = (x0, x1, map) => { const m = mk(new THREE.PlaneGeometry(x1 - x0, WH), std(0xffffff, 0.9, { map }), house, (x0 + x1) / 2, WH / 2, B); m.receiveShadow = true; return m; };
  backWall(D.bath.x0, D.bath.x1, bathWT); backWall(D.hall.x0, D.hall.x1, hallWT); backWall(D.garage.x0, D.garage.x1, garWT);
  const wallM = std(0xf0ebe0, 0.9);
  // end + partition walls (the plane passes through doorways z ∈ [door, 0]): a back stub + a lintel, section on the cut ends
  const DOOR = -2.45, LIN = 2.15;
  const partition = (x, full = false) => { mk(new THREE.BoxGeometry(0.16, WH, (full ? 0 : DOOR) - B), [wallM, wallM, wallM, wallM, full ? SECTION : wallM, wallM], house, x, WH / 2, (B + (full ? 0 : DOOR)) / 2); if (!full) mk(new THREE.BoxGeometry(0.16, WH - LIN, -DOOR), [wallM, wallM, wallM, wallM, SECTION, wallM], house, x, (WH + LIN) / 2, DOOR / 2); };
  partition(-0.08, true); partition(D.hall.x0); partition(D.garage.x0);
  // the garage's end wall (x = 14.4): siding outside, a roll-up door over the doorway
  const sidingT = tex(256, 256, (c, w, h) => { c.fillStyle = '#9fc4dc'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 3); }); sidingT.wrapS = sidingT.wrapT = THREE.RepeatWrapping; sidingT.repeat.set(1, 3);
  const sideM = std(0xffffff, 0.85, { map: sidingT });
  const GX = D.garage.x1, GD0 = -2.75;
  mk(new THREE.BoxGeometry(0.16, WH, GD0 - B), [sideM, wallM, wallM, wallM, wallM, wallM], house, GX + 0.08, WH / 2, (B + GD0) / 2);
  mk(new THREE.BoxGeometry(0.16, WH - 2.25, -GD0), [sideM, wallM, wallM, wallM, SECTION, wallM], house, GX + 0.08, (WH + 2.25) / 2, GD0 / 2);
  const rollT = tex(128, 256, (c, w, h) => { c.fillStyle = '#f4f2ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#cfcbc4'; for (let y = 0; y < h; y += 22) c.fillRect(0, y, w, 4); });
  const rollDoor = mk(new THREE.PlaneGeometry(-GD0, 2.25), new THREE.MeshStandardMaterial({ map: rollT, roughness: 0.7, side: THREE.DoubleSide }), house, GX + 0.1, 1.125, GD0 / 2); rollDoor.rotation.y = PI / 2;
  const setRollDoor = (k) => { rollDoor.scale.y = Math.max(0.03, 1 - k); rollDoor.position.y = 2.25 - (2.25 * rollDoor.scale.y) / 2; };
  // ceiling + a gable roof (sectioned at the front)
  const ceil = mk(new THREE.BoxGeometry(14.7, 0.08, -B + 0.1), [wallM, wallM, wallM, std(0xf6f2ea), SECTION, wallM], house, 7.2, WH + 0.04, B / 2 + 0.05);
  const roofSh = new THREE.Shape(); roofSh.moveTo(-0.6, WH + 0.08); roofSh.lineTo(7.2, WH + 2.0); roofSh.lineTo(15.0, WH + 0.08); roofSh.lineTo(15.0, WH + 0.24); roofSh.lineTo(7.2, WH + 2.18); roofSh.lineTo(-0.6, WH + 0.24); roofSh.closePath();
  mk(new THREE.ExtrudeGeometry(roofSh, { depth: -B + 0.4, bevelEnabled: false }), [SECTION, std(0xb5523b, 0.8)], house, 0, 0, B - 0.4);
  const gab = new THREE.Shape(); gab.moveTo(-0.08, WH + 0.08); gab.lineTo(7.2, WH + 1.95); gab.lineTo(14.48, WH + 0.08); gab.closePath(); mk(new THREE.ShapeGeometry(gab), std(0xe8dcc6, 0.9), house, 0, 0, B + 0.01);
  const lamps = [[1.7, 0], [5.4, 0], [10.9, 0]].map(([x]) => { const l = new THREE.PointLight(0xffe2b8, 3.0, 7, 1.6); l.position.set(x, WH - 0.3, -1.6); house.add(l); mk(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0c8, emissiveIntensity: 1.2 }), house, x, WH - 0.12, -1.6); return l; });

  // ---- BATHROOM dressing: tub (left wall) + duck spot, sink + mirror, toilet, TP holder, towels, box fan, outlet, mat, plant, hamper
  const bath = new THREE.Group(); house.add(bath);
  const porc = std(0xfbfbf8, 0.25);
  const tub = new THREE.Group(); bath.add(tub); tub.position.set(0.52, 0, -1.9);
  mk(new RoundedBoxGeometry(0.86, 0.56, 1.75, 4, 0.1), porc, tub, 0, 0.28, 0);
  const water = mk(new THREE.BoxGeometry(0.7, 0.04, 1.58), new THREE.MeshStandardMaterial({ color: 0x7fd2f2, roughness: 0.08, transparent: true, opacity: 0.8 }), tub, 0, 0.5, 0);
  for (let i = 0; i < 16; i++) mk(new THREE.SphereGeometry(0.05 + h2(i) * 0.05, 10, 8), std(0xffffff, 0.3), tub, (h2(i, 2) - 0.5) * 0.6, 0.53, (h2(i, 3) - 0.5) * 1.3);
  mk(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), steel(), tub, -0.3, 0.75, -0.82); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), steel(), tub, -0.2, 0.88, -0.82).rotation.z = PI / 2;
  for (let i = 0; i < 3; i++) mk(new RoundedBoxGeometry(0.07, 0.16 + i * 0.03, 0.07, 2, 0.02), std([0xff6fa3, 0x58b368, 0xffc21a][i], 0.4), tub, -0.33, 0.64 + i * 0.015, 0.45 + i * 0.1);
  const rubberDuck = mk(new THREE.SphereGeometry(0.06, 12, 10), std(0xffd23f, 0.4), tub, 0.18, 0.56, 0.55);
  const sink = new THREE.Group(); bath.add(sink); sink.position.set(1.7, 0, B + 0.3);
  mk(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 16), porc, sink, 0, 0.4, 0); mk(new RoundedBoxGeometry(0.6, 0.14, 0.44, 3, 0.05), porc, sink, 0, 0.86, 0); mk(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), steel(), sink, 0, 1.0, -0.15);
  const mirror = mk(new THREE.PlaneGeometry(0.72, 0.9), new THREE.MeshStandardMaterial({ color: 0xcfe6ee, roughness: 0.05, metalness: 0.9 }), bath, 1.7, 1.62, B + 0.035); mk(new THREE.BoxGeometry(0.8, 0.98, 0.03), std(0xffffff, 0.5), bath, 1.7, 1.62, B + 0.005);
  mk(new THREE.BoxGeometry(0.6, 0.08, 0.06), new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0c8, emissiveIntensity: 1.0 }), bath, 1.7, 2.16, B + 0.05);
  const outlet = new THREE.Group(); bath.add(outlet); outlet.position.set(2.18, 1.05, B + 0.02); mk(new THREE.BoxGeometry(0.08, 0.12, 0.02), std(0xf4f0e6, 0.4), outlet); for (const y of [-0.025, 0.025]) mk(new THREE.BoxGeometry(0.03, 0.012, 0.01), std(0x222222), outlet, 0, y, 0.012);
  const toilet = new THREE.Group(); bath.add(toilet); toilet.position.set(2.85, 0, B + 0.45);
  mk(new THREE.CylinderGeometry(0.2, 0.15, 0.4, 18), porc, toilet, 0, 0.2, 0.08); mk(new THREE.TorusGeometry(0.19, 0.04, 8, 20), porc, toilet, 0, 0.42, 0.08).rotation.x = PI / 2; mk(new RoundedBoxGeometry(0.44, 0.38, 0.2, 2, 0.04), porc, toilet, 0, 0.62, -0.2);
  const tpHolder = new THREE.Group(); bath.add(tpHolder); tpHolder.position.set(D.hall.x0 - 0.1, 0.72, -2.9); mk(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), steel(), tpHolder, -0.02, 0, 0).rotation.x = PI / 2;
  const tpRoll = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.11, 18), std(0xfbfbf6, 0.9), tpHolder, -0.08, 0, 0); tpRoll.rotation.x = PI / 2;
  const towels = []; for (let i = 0; i < 2; i++) { const t = mk(new THREE.BoxGeometry(0.42, 0.6, 0.04), std([0xff8a6a, 0x6aa8ff][i], 0.95), bath, 0.85 + i * 0.5, 1.45, B + 0.06); towels.push(t); } mk(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 8), steel(), bath, 1.1, 1.75, B + 0.08).rotation.z = PI / 2;
  const boxFanFrame = new THREE.Group(); bath.add(boxFanFrame); boxFanFrame.position.set(3.15, 0, -1.85); boxFanFrame.rotation.y = -0.6;
  mk(new RoundedBoxGeometry(0.62, 0.62, 0.16, 2, 0.03), std(0xf2f2f2, 0.5, { transparent: true, opacity: 1 }), boxFanFrame, 0, 0.36, 0).material = std(0xf2f2f2, 0.5); mk(new THREE.BoxGeometry(0.5, 0.5, 0.18), std(0x222222, 0.6), boxFanFrame, 0, 0.36, 0);
  for (let i = 0; i < 6; i++) mk(new THREE.BoxGeometry(0.52, 0.01, 0.01), steel(0xbbbbbb), boxFanFrame, 0, 0.13 + i * 0.09, 0.09);
  mk(new RoundedBoxGeometry(0.7, 0.02, 0.45, 2, 0.01), std(0x5fc0b8, 0.95), bath, 1.6, 0.012, -1.0);
  const hamper = mk(new THREE.CylinderGeometry(0.18, 0.15, 0.5, 14), std(0xd9c48a, 0.9), bath, 2.32, 0.25, -3.05); const plant = new THREE.Group(); bath.add(plant); plant.position.set(0.3, 0, B + 0.25); mk(new THREE.CylinderGeometry(0.12, 0.1, 0.25, 12), std(0xc96a3a, 0.8), plant, 0, 0.12, 0); for (let i = 0; i < 6; i++) { const l = mk(new THREE.SphereGeometry(0.1, 8, 6), std(0x4caf50, 0.7), plant, (h2(i) - 0.5) * 0.2, 0.32 + h2(i, 2) * 0.2, (h2(i, 3) - 0.5) * 0.2); l.scale.set(0.6, 1.4, 0.6); }

  // ---- HALLWAY dressing: runner, photos (Gary + the duck), coat rack, side table + lamp, umbrella stand, a HOME SWEET HOME sign
  const hall = new THREE.Group(); house.add(hall);
  const runner = mk(new THREE.PlaneGeometry(3.6, 1.0), std(0xb33a3a, 0.95), hall, 5.4, 0.01, -1.4); runner.rotation.x = -PI / 2; mk(new THREE.PlaneGeometry(3.4, 0.8), std(0xe0b84a, 0.95), hall, 5.4, 0.012, -1.4).rotation.x = -PI / 2;
  const photoT = (kind) => tex(160, 200, (c, w, h) => { c.fillStyle = '#7a5232'; c.fillRect(0, 0, w, h); c.fillStyle = kind ? '#bfe3f2' : '#f2d3a8'; c.fillRect(12, 12, w - 24, h - 24); c.fillStyle = '#f2c29a'; c.beginPath(); c.arc(w * 0.42, h * 0.45, 30, 0, 7); c.fill(); c.fillStyle = '#ffc21a'; c.beginPath(); c.arc(w * 0.42, h * 0.36, 30, PI, 0); c.fill(); c.fillStyle = '#1f7a4a'; c.beginPath(); c.arc(w * 0.7, h * 0.66, 18, 0, 7); c.fill(); c.fillStyle = '#f2c230'; c.fillRect(w * 0.76, h * 0.66, 18, 7); c.fillStyle = '#2bb3a3'; c.fillRect(w * 0.28, h * 0.6, 50, 50); });
  [[4.2, 1.6, 0], [5.0, 1.75, 1], [5.9, 1.55, 0], [6.6, 1.7, 1]].forEach(([x, y, k]) => mk(new THREE.PlaneGeometry(0.42, 0.52), std(0xffffff, 0.6, { map: photoT(k) }), hall, x, y, B + 0.02));
  const coat = new THREE.Group(); hall.add(coat); coat.position.set(7.0, 0, B + 0.35); mk(new THREE.CylinderGeometry(0.025, 0.03, 1.8, 8), std(0x6b4a33), coat, 0, 0.9, 0); mk(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 12), std(0x6b4a33), coat, 0, 0.02, 0); mk(new THREE.BoxGeometry(0.4, 0.75, 0.2), std(0x3a5ec8, 0.9), coat, 0.12, 1.3, 0.05); mk(new THREE.SphereGeometry(0.12, 12, 8), std(0xd62f2f, 0.8), coat, -0.1, 1.75, 0);
  const table = new THREE.Group(); hall.add(table); table.position.set(3.95, 0, B + 0.3); mk(new THREE.BoxGeometry(0.6, 0.04, 0.35), std(0x8a5a3a), table, 0, 0.75, 0); for (const x of [-0.26, 0.26]) mk(new THREE.BoxGeometry(0.04, 0.75, 0.3), std(0x8a5a3a), table, x, 0.375, 0);
  mk(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 10), std(0x5fc0b8, 0.4), table, 0, 0.92, 0); mk(new THREE.CylinderGeometry(0.1, 0.18, 0.2, 14, 1, true), std(0xfff2d0, 0.8, { emissive: 0xffe2a0, emissiveIntensity: 0.6, side: THREE.DoubleSide }), table, 0, 1.15, 0);
  const homeSign = sign(hall, 'HOME SWEET HOME', 1.0, 0.28, { bg: '#f7efe0', fg: '#8a5a3a', border: '#8a5a3a' }); homeSign.position.set(5.4, 2.2, B + 0.03);

  // ---- GARAGE dressing: pegboard + tools, workbench, shelves + cans, water heater, bike, mower, jerry-can spot, an oil stain
  const gar = new THREE.Group(); house.add(gar);
  const peg = tex(512, 256, (c, w, h) => { c.fillStyle = '#c8a172'; c.fillRect(0, 0, w, h); c.fillStyle = '#8f6b44'; for (let x = 8; x < w; x += 16) for (let y = 8; y < h; y += 16) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } });
  mk(new THREE.PlaneGeometry(2.6, 1.1), std(0xffffff, 0.85, { map: peg }), gar, 9.4, 1.7, B + 0.02);
  const toolM = steel(0x9aa3ad, 0.35), handM = std(0xd12f3a, 0.5);
  for (let i = 0; i < 7; i++) { const x = 8.3 + i * 0.34, y = 1.75 + (i % 2) * 0.1; if (i % 3 === 0) { mk(new THREE.BoxGeometry(0.05, 0.32, 0.03), toolM, gar, x, y, B + 0.06); mk(new THREE.BoxGeometry(0.14, 0.05, 0.04), toolM, gar, x, y + 0.16, B + 0.06); } else if (i % 3 === 1) { mk(new THREE.BoxGeometry(0.04, 0.3, 0.03), handM, gar, x, y - 0.06, B + 0.06); mk(new THREE.BoxGeometry(0.16, 0.06, 0.05), toolM, gar, x, y + 0.11, B + 0.06); } else mk(new THREE.TorusGeometry(0.08, 0.018, 6, 14), toolM, gar, x, y, B + 0.06); }
  const bench = new THREE.Group(); gar.add(bench); bench.position.set(9.4, 0, B + 0.4); mk(new THREE.BoxGeometry(2.6, 0.08, 0.7), std(0x9a6a3e, 0.7), bench, 0, 0.9, 0); for (const x of [-1.2, 1.2]) for (const z of [-0.3, 0.3]) mk(new THREE.BoxGeometry(0.07, 0.9, 0.07), std(0x7a5233), bench, x, 0.45, z); mk(new THREE.BoxGeometry(2.4, 0.04, 0.6), std(0x7a5233), bench, 0, 0.25, 0); mk(new RoundedBoxGeometry(0.22, 0.18, 0.2, 2, 0.03), steel(0x2f6fd6, 0.4), bench, 0.9, 1.03, 0);
  for (let i = 0; i < 5; i++) mk(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 12), std([0x58b368, 0xffc21a, 0x2f6fd6, 0xd12f3a, 0xffffff][i], 0.4), bench, -0.9 + i * 0.25, 0.4, 0);
  const shelf = new THREE.Group(); gar.add(shelf); shelf.position.set(12.4, 0, B + 0.3); for (const y of [0.5, 1.15, 1.8]) mk(new THREE.BoxGeometry(2.0, 0.04, 0.45), steel(0x6b737b), shelf, 0, y, 0); for (const x of [-0.98, 0.98]) for (const z of [-0.2, 0.2]) mk(new THREE.BoxGeometry(0.04, 2.1, 0.04), steel(0x6b737b), shelf, x, 1.05, z);
  for (let i = 0; i < 12; i++) mk(new RoundedBoxGeometry(0.3, 0.25 + h2(i) * 0.2, 0.32, 2, 0.03), std([0xc9a26b, 0xb8905a, 0x2f6fd6, 0x58b368, 0xd12f3a][i % 5], 0.8), shelf, -0.75 + (i % 4) * 0.5, [0.5, 1.15, 1.8][Math.floor(i / 4)] + 0.16, 0);
  const heater = mk(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 18), std(0xe9ecee, 0.5), gar, 7.95, 0.75, B + 0.35);
  const bike = new THREE.Group(); gar.add(bike); bike.position.set(11.0, 1.4, B + 0.15); for (const x of [-0.42, 0.42]) mk(new THREE.TorusGeometry(0.3, 0.025, 8, 24), std(0x1c1c1e), bike, x, 0, 0); mk(new THREE.BoxGeometry(0.8, 0.04, 0.04), std(0xd62f2f), bike, 0, 0.2, 0).rotation.z = 0.2;
  const mower = new THREE.Group(); gar.add(mower); mower.position.set(13.6, 0, B + 0.55); mk(new RoundedBoxGeometry(0.6, 0.2, 0.5, 2, 0.05), std(0x58b368, 0.5), mower, 0, 0.22, 0); mk(new RoundedBoxGeometry(0.3, 0.22, 0.3, 2, 0.04), std(0xcf2e2e, 0.45), mower, 0, 0.43, 0);
  const oil = mk(new THREE.CircleGeometry(0.6, 20), new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.2, transparent: true, opacity: 0.5 }), gar, 10.4, 0.008, -1.4); oil.rotation.x = -PI / 2; oil.scale.set(1.4, 0.8, 1);
  const garSign = sign(gar, "GARY'S WORKSHOP", 1.6, 0.36, { bg: '#2f6fd6', fg: '#fff', border: '#ffd23f' }); garSign.position.set(10.9, 2.32, B + 0.03);

  // ---- DRIVEWAY + yard + STREET
  const yard = new THREE.Group(); root.add(yard);
  const drive = mk(new THREE.PlaneGeometry(D.drive.x1 - D.drive.x0, 4.6), std(0xffffff, 0.85, { map: concT.clone() }), yard, (D.drive.x0 + D.drive.x1) / 2, 0.012, -0.85); drive.rotation.x = -PI / 2; drive.receiveShadow = true;
  const mailbox = new THREE.Group(); yard.add(mailbox); mailbox.position.set(23.2, 0, 2.6); mk(new THREE.BoxGeometry(0.08, 1.1, 0.08), std(0x6b4a33), mailbox, 0, 0.55, 0); mk(new RoundedBoxGeometry(0.45, 0.25, 0.25, 3, 0.1), std(0x2f6fd6, 0.4), mailbox, 0, 1.2, 0); mk(new THREE.BoxGeometry(0.03, 0.18, 0.1), std(0xd62f2f), mailbox, 0.2, 1.35, 0.1);
  const cans = [0, 1].map((i) => { const c = new THREE.Group(); yard.add(c); c.position.set(21.2 + i * 0.7, 0, -3.85); mk(new THREE.CylinderGeometry(0.3, 0.26, 0.95, 14), std([0x3a7a3a, 0x2f6fd6][i], 0.6), c, 0, 0.47, 0); mk(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 14), std([0x2f5f2f, 0x24559f][i], 0.6), c, 0, 0.97, 0); return c; });
  const kidBike = new THREE.Group(); yard.add(kidBike); kidBike.position.set(19.5, 0.22, 3.4); kidBike.rotation.set(PI / 2 - 0.3, 0.6, 0); for (const x of [-0.3, 0.3]) mk(new THREE.TorusGeometry(0.2, 0.02, 6, 18), std(0x1c1c1e), kidBike, x, 0, 0); mk(new THREE.BoxGeometry(0.6, 0.03, 0.03), std(0xff6fa3), kidBike, 0, 0.14, 0);
  const gnome = new THREE.Group(); yard.add(gnome); gnome.position.set(16.5, 0, 2.5); mk(new THREE.ConeGeometry(0.12, 0.3, 10), std(0xd62f2f, 0.6), gnome, 0, 0.5, 0); mk(new THREE.SphereGeometry(0.1, 10, 8), std(0xf2c29a), gnome, 0, 0.32, 0); mk(new THREE.CylinderGeometry(0.11, 0.13, 0.25, 10), std(0x2f6fd6), gnome, 0, 0.12, 0); mk(new THREE.ConeGeometry(0.08, 0.14, 8), std(0xffffff, 0.9), gnome, 0, 0.24, 0.06).rotation.x = PI;
  for (let i = 0; i < 14; i++) { const fx0 = 15 + i * 0.62; mk(new THREE.SphereGeometry(0.13, 8, 6), std([0xff6fa3, 0xffd23f, 0xff8a3d, 0xb36bff][i % 4], 0.6), yard, fx0, 0.18, -3.95 + (i % 2) * 0.15); mk(new THREE.SphereGeometry(0.16, 8, 6), std(0x3f8a3a, 0.8), yard, fx0 + 0.2, 0.12, -3.9); }
  for (let x = 14.6; x < 24; x += 0.26) mk(new THREE.BoxGeometry(0.09, 0.9, 0.03), std(0xf4f0e6, 0.8), yard, x, 0.45, -4.4); mk(new THREE.BoxGeometry(9.4, 0.06, 0.04), std(0xf4f0e6, 0.8), yard, 19.3, 0.7, -4.42);
  const tree = (x, z, s = 1) => { const t = new THREE.Group(); yard.add(t); t.position.set(x, 0, z); mk(new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 2.2 * s, 10), std(0x6b4a33), t, 0, 1.1 * s, 0); for (let i = 0; i < 5; i++) mk(new THREE.SphereGeometry((0.9 + h2(i, x) * 0.4) * s, 14, 10), std(0x4f9a3f, 0.8), t, (h2(i, 1) - 0.5) * 1.2 * s, (2.6 + h2(i, 2) * 0.8) * s, (h2(i, 3) - 0.5) * 1.2 * s); t.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return t; };
  tree(-3.5, -6, 1.2); tree(18.5, -7, 1.3); tree(22.6, -7.6, 1.0); tree(-4.5, 5.5, 1.0);
  const asphT = tex(256, 256, (c, w, h) => { c.fillStyle = '#55585c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${0.03 + h2(i) * 0.04})`; c.fillRect(h2(i, 1) * w, h2(i, 2) * h, 2, 2); } c.fillStyle = '#ffd23f'; c.fillRect(w / 2 - 4, 0, 8, h * 0.6); }); asphT.wrapS = asphT.wrapT = THREE.RepeatWrapping; asphT.repeat.set(1, 30);
  const street = mk(new THREE.PlaneGeometry(D.street.x1 - D.street.x0, 140), std(0xffffff, 0.9, { map: asphT }), yard, (D.street.x0 + D.street.x1) / 2, 0.008, 0); street.rotation.x = -PI / 2; street.receiveShadow = true;
  for (const x of [D.street.x0, D.street.x1]) mk(new THREE.BoxGeometry(0.25, 0.14, 140), std(0xd8d4cc, 0.8), yard, x, 0.07, 0);
  const car = new THREE.Group(); yard.add(car); car.position.set(29.5, 0, 22); mk(new RoundedBoxGeometry(1.8, 0.6, 4.2, 3, 0.2), std(0xd62f2f, 0.35), car, 0, 0.6, 0); mk(new RoundedBoxGeometry(1.6, 0.55, 2.2, 3, 0.2), std(0x22303c, 0.15, { metalness: 0.4 }), car, 0, 1.1, -0.2); for (const [x, z] of [[0.85, 1.3], [-0.85, 1.3], [0.85, -1.3], [-0.85, -1.3]]) mk(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 16), std(0x1b1b1d), car, x, 0.32, z).rotation.z = PI / 2;
  const pole = new THREE.Group(); yard.add(pole); pole.position.set(24.3, 0, -6.5); mk(new THREE.CylinderGeometry(0.07, 0.09, 5, 8), steel(0x6b737b), pole, 0, 2.5, 0); mk(new THREE.BoxGeometry(1.2, 0.08, 0.08), steel(0x6b737b), pole, 0.55, 4.95, 0); mk(new THREE.BoxGeometry(0.4, 0.12, 0.25), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.4 }), pole, 1.1, 4.88, 0);
  const stop = new THREE.Group(); yard.add(stop); stop.position.set(23.9, 0, 4.6); mk(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), steel(), stop, 0, 1.1, 0); const st8 = mk(new THREE.CircleGeometry(0.32, 8), std(0xffffff, 0.6, { map: signTex('STOP', { w: 256, h: 256, bg: '#d62f2f', px: 92 }) }), stop, 0, 2.15, 0.03); st8.rotation.set(0, PI / 2 - 0.6, PI / 8);
  yard.traverse((o) => { if (o.isMesh) { o.castShadow = o.castShadow || false; o.receiveShadow = true; } });

  // ---- the airfield FENCE (chain link; a panel at the plane's path can be knocked flat: setFence)
  const linkT = tex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(190,196,200,1)'; c.lineWidth = 3; for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + h, h); c.stroke(); c.beginPath(); c.moveTo(i * 16 + h, 0); c.lineTo(i * 16, h); c.stroke(); } });
  linkT.wrapS = linkT.wrapT = THREE.RepeatWrapping; linkT.repeat.set(1.5, 1.2);
  const linkM = new THREE.MeshStandardMaterial({ map: linkT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.4 });
  const fence = new THREE.Group(); root.add(fence); fence.position.x = D.fenceX; let gatePanel = null;
  for (let z = -40; z < 40; z += 3) { const pn = new THREE.Group(); fence.add(pn); pn.position.z = z + 1.5; mk(new THREE.PlaneGeometry(3, 2.2), linkM, pn, 0, 1.1, 0).rotation.y = PI / 2; mk(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8), steel(0x8a9298), pn, 0, 1.25, -1.5); mk(new THREE.CylinderGeometry(0.035, 0.035, 3, 6), steel(0x8a9298), pn, 0, 2.2, 0).rotation.x = PI / 2; if (Math.abs(z + 1.5 - D.eZ) < 1.6) gatePanel = pn; }
  const fenceSign = sign(fence, 'AIRPORT · KEEP OUT', 1.6, 0.42, { bg: '#ffd23f', fg: '#222', border: '#222' }); fenceSign.position.set(-0.06, 1.25, 4.2); fenceSign.rotation.y = -PI / 2;
  const setFence = (k) => { if (!gatePanel) return; gatePanel.rotation.z = -k * 1.45; gatePanel.position.y = 0; };

  // ---- the TEST STAND: two gallows towers behind (z −4.2) + an overhead beam over the engine; a hanger rod to the engine's top lug;
  // a blast fence on the −x side; a control booth; hazard paint; a THRUST readout board
  const stand = new THREE.Group(); root.add(stand); stand.position.set(D.stand.x, 0, 0);
  const yel = std(0xf2b21e, 0.5, { metalness: 0.3 }), dk = steel(0x4a5058, 0.4, 0.6);
  for (const x of [-4.2, 4.2]) { mk(new THREE.BoxGeometry(0.45, 6.6, 0.45), yel, stand, x, 3.3, -4.4); mk(new THREE.BoxGeometry(0.4, 0.4, 4.2), yel, stand, x, 6.3, -2.4); mk(new THREE.BoxGeometry(1.2, 0.2, 1.2), dk, stand, x, 0.1, -4.4); const br = mk(new THREE.BoxGeometry(0.18, 2.6, 0.18), yel, stand, x, 5.2, -3.3); br.rotation.x = 0.85; }
  const beam = mk(new THREE.BoxGeometry(9.0, 0.5, 0.5), yel, stand, 0, 6.3, D.eZ);
  const hanger = new THREE.Group(); stand.add(hanger); mk(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), dk, hanger, 0, -0.5, 0); mk(new THREE.BoxGeometry(0.8, 0.12, 0.4), dk, hanger, 0, -1, 0); hanger.position.set(0.9, 6.05, D.eZ);
  const setHanger = (topY) => { const L = Math.max(0.3, 6.05 - topY); hanger.children[0].scale.y = L; hanger.children[0].position.y = -L / 2; hanger.children[1].position.y = -L; };
  const pad = mk(new THREE.PlaneGeometry(16, 11), std(0xffffff, 0.85, { map: (() => { const t = apronT.clone(); t.repeat.set(3, 2); t.needsUpdate = true; return t; })() }), stand, 0, 0.008, -0.6); pad.rotation.x = -PI / 2; pad.receiveShadow = true;
  const hazT = tex(256, 32, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#222' : '#f2c21a'; c.beginPath(); c.moveTo(i * 16, h); c.lineTo(i * 16 + 16, 0); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, h); c.fill(); } }); hazT.wrapS = THREE.RepeatWrapping; hazT.repeat.set(4, 1);
  for (const [x, z, w, r] of [[0, 4.85, 16, 0], [0, -6.05, 16, 0]]) { const s2 = mk(new THREE.PlaneGeometry(w, 0.3), std(0xffffff, 0.7, { map: hazT }), stand, x, 0.01, z); s2.rotation.x = -PI / 2; }
  const blast = new THREE.Group(); stand.add(blast); blast.position.set(-9.5, 0, -0.6);
  { const bs = sign(blast, 'JET BLAST · KEEP CLEAR', 2.6, 0.5, { bg: '#d62f2f', fg: '#fff', border: '#fff' }); bs.position.set(0.75, 2.6, 0.6); bs.rotation.y = PI / 2;
    const scorchT = tex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(30,26,22,.75)'); gr.addColorStop(0.6, 'rgba(40,34,28,.35)'); gr.addColorStop(1, 'rgba(40,34,28,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    const sc = mk(new THREE.PlaneGeometry(7, 3.4), new THREE.MeshStandardMaterial({ map: scorchT, transparent: true, depthWrite: false, roughness: 1 }), stand, -5.5, 0.012, -0.6); sc.rotation.x = -PI / 2; sc.receiveShadow = true; } for (let i = 0; i < 9; i++) { const sl = mk(new THREE.BoxGeometry(0.12, 3.4, 1.2), steel(0x9aa3ad, 0.45), blast, 0, 1.7, -4 + i * 1.0); sl.rotation.z = 0.35; } mk(new THREE.BoxGeometry(0.3, 0.3, 9.4), dk, blast, 0.5, 3.3, 0);
  const board = new THREE.Group(); stand.add(board); board.position.set(9.6, 0, -5.6); /* r5: right of the booth, off the SPLAT + turbofan framings (it read as a cropped TERM) */ mk(new THREE.BoxGeometry(0.15, 3.4, 0.15), dk, board, -1.0, 1.7, 0); mk(new THREE.BoxGeometry(0.15, 3.4, 0.15), dk, board, 1.0, 1.7, 0); const boardFace = mk(new THREE.PlaneGeometry(2.2, 1.0), std(0xffffff, 0.6, { map: signTex('THRUST TEST', { bg: '#1f5fbf', fg: '#ffffff' }) }), board, 0, 3.0, 0.08);
  // the BIRD STRIKE range (r3: its own place): crates of jelly test birds, amber beacons, a range sign — by the cannon's firing spot
  const range = new THREE.Group(); stand.add(range); const beaconM = new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xff9a10, emissiveIntensity: 1.6, roughness: 0.4 });
  { const crateT = signTex('TEST BIRDS · JELLY', { bg: '#c99a62', fg: '#5a2a10', border: '#5a2a10' }), crM = std(0xffffff, 0.8, { map: crateT }), woodM = std(0xc99a62, 0.85);
    for (const [x, y, z, r] of [[8.6, 0.35, 1.6, 0.1], [9.45, 0.35, 1.2, -0.2], [9.45, 1.05, 1.2, 0.15], [10.2, 0.35, 1.9, 0.3]]) { const cr = new THREE.Group(); range.add(cr); cr.position.set(x, y, z); cr.rotation.y = r; mk(new THREE.BoxGeometry(0.7, 0.7, 0.7), woodM, cr, 0, 0, 0); mk(new THREE.PlaneGeometry(0.62, 0.3), crM, cr, 0, 0.05, 0.352); }
    const ambM = beaconM;
    for (const [x, z] of [[11.0, 2.6], [12.2, -1.8]]) { mk(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), steel(0x8a9298), range, x, 1.1, z); mk(new THREE.SphereGeometry(0.16, 14, 10), ambM, range, x, 2.3, z); }
    const rs = sign(range, 'BIRD STRIKE RANGE', 2.4, 0.5, { bg: '#d62f2f', fg: '#ffffff', border: '#ffffff' }); rs.position.set(11.6, 1.6, 0.6); rs.rotation.y = -0.5; mk(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), steel(0x8a9298), range, 11.6, 0.7, 0.55); }
  const booth = new THREE.Group(); stand.add(booth); booth.position.set(6.6, 0, -6.4);   // right of the stand's leg (at 4.2 it hid the window from the front)
  { const bm = std(0xd8d4cc, 0.8); mk(new THREE.BoxGeometry(3.2, 0.3, 2.4), bm, booth, 0, 0.15, 0); mk(new THREE.BoxGeometry(3.2, 0.3, 2.4), bm, booth, 0, 2.55, 0); mk(new THREE.BoxGeometry(3.2, 2.7, 0.15), bm, booth, 0, 1.35, -1.12); for (const x of [-1.52, 1.52]) mk(new THREE.BoxGeometry(0.16, 2.7, 2.4), bm, booth, x, 1.35, 0);
    mk(new THREE.BoxGeometry(3.2, 1.0, 0.15), bm, booth, 0, 0.8, 1.12); mk(new THREE.BoxGeometry(3.2, 0.4, 0.15), bm, booth, 0, 2.3, 1.12); mk(new THREE.BoxGeometry(2.6, 0.08, 0.6), std(0x4a5058, 0.5), booth, 0, 1.0, 0.75); mk(new THREE.PlaneGeometry(3.0, 2.0), std(0x8a8f96, 0.9), booth, 0, 1.35, -1.04); }
  const boothGlass = mk(new THREE.PlaneGeometry(2.9, 0.82), new THREE.MeshStandardMaterial({ color: 0xbfe0f0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.22, depthWrite: false }), booth, 0, 1.71, 1.2);
  const boothSign = sign(booth, 'CONTROL', 1.2, 0.3, { bg: '#1f5fbf', fg: '#fff' }); boothSign.position.set(0, 2.55, 1.23);
  const scrT = (k) => tex(256, 160, (c, w, h) => { c.fillStyle = '#0f1d17'; c.fillRect(0, 0, w, h); c.strokeStyle = k ? '#ffb347' : '#5cff8a'; c.lineWidth = 5; c.beginPath(); for (let x = 0; x <= w; x += 8) { const y = h * (k ? 0.75 - 0.55 * (x / w) ** 2 : 0.5 + 0.3 * Math.sin(x * 0.08)); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = '#5cff8a'; c.font = 'bold 26px monospace'; c.fillText(k ? 'THRUST' : 'RPM', 12, 30); });
  for (const [x, k] of [[-0.7, 0], [0.7, 1]]) { mk(new THREE.BoxGeometry(0.9, 0.6, 0.08), std(0x222428, 0.5), booth, x, 1.55, -0.95); mk(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ map: scrT(k) }), booth, x, 1.55, -0.905); }
  mk(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 12), std(0xd62f2f, 0.4), booth, 0.9, 1.1, 0.55); mk(new RoundedBoxGeometry(0.5, 0.08, 0.5, 2, 0.03), std(0x2a2d31, 0.6), booth, -0.3, 0.75, 0.1);
  const boothLight = new THREE.PointLight(0xfff2d8, 1.6, 4, 1.6); boothLight.position.set(0, 2.2, 0.3); booth.add(boothLight);
  const windsock = new THREE.Group(); root.add(windsock); windsock.position.set(52, 0, 9); mk(new THREE.CylinderGeometry(0.06, 0.06, 6, 8), steel(), windsock, 0, 3, 0); const sock = mk(new THREE.CylinderGeometry(0.4, 0.2, 2.2, 12, 4, true), std(0xff7a1a, 0.7, { side: THREE.DoubleSide }), windsock, 1.1, 5.8, 0); sock.rotation.z = PI / 2 + 0.2;
  stand.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---- HANGAR + TOWER (behind), the TERMINAL by the rollout end, a fuel truck, baggage carts, cones
  const back = new THREE.Group(); root.add(back);
  // HANGAR 1 (041 r5: its own place for the turbofan build): a box hangar right behind the test stand, its mouth 27 m back (z −28),
  // two sliding doors that roll open (setHangarDoors 0..1) onto a warm, lit interior — the backdrop of every −z look from the stand
  const hangar = new THREE.Group(); back.add(hangar); hangar.position.set(52, 0, -43);
  { const wallM = std(0xbfc6cc, 0.6, { metalness: 0.3 }), trimM = std(0x8a949e, 0.5, { metalness: 0.4 });
    mk(new THREE.BoxGeometry(30, 12, 0.4), wallM, hangar, 0, 6, -15); for (const x of [-15, 15]) mk(new THREE.BoxGeometry(0.4, 12, 30), wallM, hangar, x, 6, 0);
    mk(new THREE.BoxGeometry(31, 0.6, 31), trimM, hangar, 0, 12.3, 0); mk(new THREE.BoxGeometry(30, 3, 0.6), wallM, hangar, 0, 10.5, 15); for (const x of [-13.5, 13.5]) mk(new THREE.BoxGeometry(3, 9, 0.6), wallM, hangar, x, 4.5, 15);
    const warm = new THREE.MeshStandardMaterial({ color: 0xf6e2c4, roughness: 0.8, emissive: 0xd8963e, emissiveIntensity: 1.1 });
    mk(new THREE.PlaneGeometry(29.2, 11.6), warm, hangar, 0, 5.9, -14.75);   // the lit back wall (inner face)
    mk(new THREE.PlaneGeometry(29, 29), new THREE.MeshStandardMaterial({ color: 0xd8cdbd, roughness: 0.9, emissive: 0x8a6232, emissiveIntensity: 0.7 }), hangar, 0, 0.02, 0).rotation.x = -PI / 2;
    const lampM = new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffe2a8, emissiveIntensity: 2.2 });
    for (const x of [-8, 0, 8]) for (const z of [-8, 4]) mk(new THREE.BoxGeometry(2.2, 0.25, 0.9), lampM, hangar, x, 11.6, z);
    const hl = new THREE.PointLight(0xffd9a0, 4.0, 46, 1.4); hl.position.set(0, 9, 6); hangar.add(hl);
    const banner = sign(hangar, 'GARY AERO · ENGINE SHOP', 14, 1.4, { bg: '#d62f2f', fg: '#fff' }); banner.position.set(0, 8.6, -14.5);
    for (const [x, z, c] of [[-9, -9, 0xd62f2f], [7, -10, 0x2b6fd6], [10, -4, 0xf2b21e]]) mk(new RoundedBoxGeometry(1.6, 1.1, 0.9, 2, 0.08), std(c, 0.5), hangar, x, 0.55, z);
    mk(new RoundedBoxGeometry(3.2, 1.4, 1.8, 2, 0.15), std(0xf2b21e, 0.5), hangar, -4, 0.7, -6);
    // r5 dressing: an engine on a cradle, a hanging engine, parts racks, a red tool chest, pools of light on the floor
    { const eM = std(0xd8dde2, 0.4, { metalness: 0.5 }), dkM = std(0x2a2d31, 0.6); const e1 = mk(new THREE.CylinderGeometry(1.4, 1.2, 3.6, 28), eM, hangar, 6, 2.2, -6); e1.rotation.z = PI / 2; mk(new THREE.CircleGeometry(1.3, 24), dkM, hangar, 7.81, 2.2, -6).rotation.y = PI / 2; mk(new THREE.BoxGeometry(3.0, 0.8, 2.0), std(0x3a6ad6, 0.5), hangar, 6, 0.4, -6);
      const e2 = mk(new THREE.CylinderGeometry(1.1, 0.95, 2.8, 24), eM, hangar, -7, 7.2, -2); e2.rotation.z = PI / 2; mk(new THREE.CylinderGeometry(0.05, 0.05, 4.0, 6), dkM, hangar, -7, 10.2, -2);
      for (const x of [-12.5, 12.5]) for (let k = 0; k < 3; k++) { mk(new THREE.BoxGeometry(1.2, 0.08, 6), dkM, hangar, x, 1.0 + k * 1.6, -6); for (let j = 0; j < 4; j++) mk(new RoundedBoxGeometry(0.7, 0.6, 0.9, 2, 0.06), std([0xd62f2f, 0x2b6fd6, 0xf2b21e, 0x6a7680][(j + k) % 4], 0.5), hangar, x, 1.35 + k * 1.6, -8.4 + j * 1.6); }
      mk(new RoundedBoxGeometry(1.8, 1.3, 0.9, 2, 0.08), std(0xd62f2f, 0.4), hangar, -2, 0.65, -12);
      const poolM = new THREE.MeshBasicMaterial({ color: 0xffe9c0, transparent: true, opacity: 0.35, depthWrite: false }); for (const x of [-8, 0, 8]) for (const z of [-8, 4]) mk(new THREE.CircleGeometry(2.6, 28), poolM, hangar, x, 0.04, z).rotation.x = -PI / 2; } }
  const hDoors = [-1, 1].map((sd) => { const d = mk(new THREE.BoxGeometry(12.2, 9, 0.3), std(0x5a6a80, 0.6, { metalness: 0.3 }), hangar, sd * 6, 4.5, 15.45); for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(12.2, 0.12, 0.05), std(0x3c4652, 0.6), d, 0, -3.4 + k * 2.3, 0.17); return d; });
  function setHangarDoors(k) { hDoors.forEach((d, i) => { d.position.x = (i ? 1 : -1) * (6 + 12.2 * k); }); }
  const hsign = sign(hangar, 'HANGAR 1', 8, 1.6, { bg: '#1f5fbf', fg: '#fff' }); hsign.position.set(0, 10.8, 15.35);
  const tower = new THREE.Group(); back.add(tower); tower.position.set(150, 0, -70); mk(new THREE.CylinderGeometry(2.2, 3, 24, 16), std(0xe9ecee, 0.6), tower, 0, 12, 0); mk(new THREE.CylinderGeometry(4.2, 3.4, 4, 16), std(0x22303c, 0.15, { metalness: 0.5 }), tower, 0, 26, 0); mk(new THREE.CylinderGeometry(4.6, 4.6, 0.6, 16), std(0xe9ecee, 0.6), tower, 0, 28.3, 0);
  const term = new THREE.Group(); back.add(term); term.position.set(D.terminal - 156, 0, -60);   // r3: in the ending's sightline (down the runway, past the wing)
  mk(new THREE.BoxGeometry(120, 14, 26), std(0xe6e9ec, 0.6), term, 0, 7, -6); mk(new THREE.BoxGeometry(120, 6, 0.5), std(0x2a4a68, 0.1, { metalness: 0.6 }), term, 0, 8, 7.3); const tsign = sign(term, 'GARY INTERNATIONAL', 30, 3.6, { bg: '#1f5fbf', fg: '#ffffff' }); tsign.position.set(0, 16, 7.4);
  for (const x of [-30, 0, 30]) { const jb = mk(new THREE.BoxGeometry(3, 3, 22), std(0xd8dde2, 0.5), term, x, 6, 17); }
  for (let i = 0; i < 12; i++) mk(new THREE.ConeGeometry(0.25, 0.7, 10), std(0xff7a1a, 0.6), root, 48 + i * 4.2, 0.35, 6.5);
  const fuelTruck = new THREE.Group(); back.add(fuelTruck); fuelTruck.position.set(118, 0, 18); mk(new RoundedBoxGeometry(2.4, 2.2, 2.4, 2, 0.2), std(0xffc21a, 0.5), fuelTruck, 3.2, 1.4, 0); mk(new THREE.CylinderGeometry(1.2, 1.2, 5, 18), std(0xe9ecee, 0.4, { metalness: 0.5 }), fuelTruck, -0.6, 1.8, 0).rotation.z = PI / 2; for (const x of [-2.4, 0.2, 3.2]) for (const z of [-1.1, 1.1]) mk(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 14), std(0x1b1b1d), fuelTruck, x, 0.5, z).rotation.x = PI / 2;
  back.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---- the CLOUD DECK (only up during the flight): soft sprite puffs + a flat cloud top for the gaps
  const deckT = tex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { const gr = c.createRadialGradient(h2(i) * w, h2(i, 2) * h, 0, h2(i) * w, h2(i, 2) * h, 20 + h2(i, 3) * 40); gr.addColorStop(0, 'rgba(210,214,224,.5)'); gr.addColorStop(1, 'rgba(210,214,224,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); } });
  deckT.wrapS = deckT.wrapT = THREE.RepeatWrapping; deckT.repeat.set(30, 30);
  const deck = new THREE.Group(); root.add(deck); deck.visible = false;
  const deckTopM = new THREE.MeshStandardMaterial({ map: deckT, roughness: 1, color: 0xffffff, transparent: true, opacity: 0.96, emissive: 0xffffff, emissiveIntensity: 0.25, emissiveMap: deckT });
  const deckTop = mk(new THREE.PlaneGeometry(5200, 1600), deckTopM, deck, 600, D.cloudY + 9, 0); deckTop.rotation.x = -PI / 2; deckTop.receiveShadow = false;
  const deckBot = mk(new THREE.PlaneGeometry(5200, 1600), new THREE.MeshStandardMaterial({ map: deckT, roughness: 1, color: 0xf0c8b4, side: THREE.BackSide, transparent: true, opacity: 0.96 }), deck, 600, D.cloudY - 2, 0); deckBot.rotation.x = -PI / 2;
  const puffM = new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, color: 0xffffff, opacity: 0.95, fog: false });
  const puffs = []; for (let i = 0; i < 520; i++) { const sp = new THREE.Sprite(puffM); const x = -900 + h2(i, 11) * 3600, z = -500 + h2(i, 12) * 1000; sp.position.set(x, D.cloudY + 4 + h2(i, 13) * 12, z); const s = 50 + h2(i, 14) * 70; sp.scale.set(s * 2, s, 1); deck.add(sp); puffs.push(sp); }

  // ---- moods
  const M = {};
  function setMood(a, b = a, u = 0) {
    const A = MOODS[a], Bm = MOODS[b], mc = (k) => A[k].clone().lerp(Bm[k], u), mn = (k) => lerp(A[k], Bm[k], u);
    skyU.uTop.value.copy(mc('top')); skyU.uHor.value.copy(mc('hor')); skyU.uBot.value.copy(mc('bot')); skyU.uSunCol.value.copy(mc('sun')); skyU.uGlow.value = mn('glow');
    SUN.set(...A.dir.map((v, i) => lerp(v, Bm.dir[i], u))).normalize(); skyU.uSunDir.value.copy(SUN);
    sun.color.copy(mc('sun')); sun.intensity = mn('sunI'); hemi.color.copy(mc('hs')); hemi.groundColor.copy(mc('hg')); hemi.intensity = mn('hi');
    scene.fog.color.copy(mc('fog')); scene.fog.near = mn('fn'); scene.fog.far = mn('ff'); scene.background.copy(mc('fog'));
    renderer.toneMappingExposure = mn('exp') * (studio.baseExposure ?? 1.04); lamps.forEach((l) => { l.intensity = 3.0 * mn('room'); });
    const warm = mc('sun'); puffM.color.copy(C(0xffffff).lerp(warm, 0.2)); deckTopM.color.copy(C(0xffffff).lerp(warm, 0.15)); skyClouds.forEach((c) => c.material.color.copy(C(0xffffff).lerp(warm, 0.25)));
    Object.assign(M, { a, b, u });
  }
  studio.baseExposure = renderer.toneMappingExposure;
  setMood('day');
  function update(t) { sock.rotation.y = 0.15 * Math.sin(t * 1.3); sock.scale.set(1, 1 + 0.05 * Math.sin(t * 7), 1); }
  return { root, house, bath, hall, gar, yard, fence, stand, back, deck, puffs, sky, skyU, sun, hemi, aimSun, setMood, update, M,
    tub, water, rubberDuck, mirror, outlet, booth, boothGlass, toilet, tpHolder, tpRoll, towels, boxFanFrame, setRollDoor, rollDoor, setHangarDoors, beaconM, heater, setFence, setHanger, hanger, cans, mailbox, lamps, boardFace, term, hangar, sock, gnome };
}

// a yellow forklift (origin = ground under its centre; forks point +x; set({x, z, lift (fork height m), wheel}))
export function makeForklift() {
  const g = new THREE.Group(), y = std(0xf2b21e, 0.45), dk = std(0x2a2d31, 0.6);
  mk(new RoundedBoxGeometry(2.0, 1.0, 1.4, 3, 0.12), y, g, -0.4, 0.75, 0); mk(new RoundedBoxGeometry(0.9, 0.7, 1.3, 3, 0.1), dk, g, -1.1, 0.95, 0);
  const seat = new THREE.Object3D(); g.add(seat); seat.position.set(-0.45, 1.25, 0);
  for (const x of [-0.45, 0.25]) mk(new THREE.BoxGeometry(0.06, 1.0, 0.06), dk, g, x, 1.75, 0.62).visible = true; for (const x of [-0.45, 0.25]) mk(new THREE.BoxGeometry(0.06, 1.0, 0.06), dk, g, x, 1.75, -0.62); mk(new THREE.BoxGeometry(0.8, 0.05, 1.3), dk, g, -0.1, 2.27, 0);
  const mast = new THREE.Group(); g.add(mast); mast.position.set(0.75, 0, 0); for (const z of [-0.45, 0.45]) mk(new THREE.BoxGeometry(0.12, 3.6, 0.12), dk, mast, 0, 1.8, z); mk(new THREE.BoxGeometry(0.12, 0.12, 1.0), dk, mast, 0, 3.55, 0);
  const car = new THREE.Group(); mast.add(car); mk(new THREE.BoxGeometry(0.1, 0.6, 1.0), dk, car, 0.08, 0.3, 0); for (const z of [-0.35, 0.35]) mk(new THREE.BoxGeometry(2.4, 0.07, 0.14), steel(0x8a9298), car, 1.3, 0.04, z);
  const wheels = []; for (const [x, r] of [[0.4, 0.38], [-1.2, 0.3]]) for (const z of [-0.62, 0.62]) { const w = mk(new THREE.CylinderGeometry(r, r, 0.3, 16), std(0x1b1b1d, 0.85), g, x, r, z); w.rotation.x = PI / 2; wheels.push(w); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, seat, car, set(p = {}) { g.position.set(p.x ?? 0, 0, p.z ?? 0); g.rotation.y = p.rotY ?? 0; car.position.y = p.lift ?? 0.1; wheels.forEach((w) => { w.rotation.y = p.wheel ?? 0; }); } };
}
export function makeEgg() { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), std(0xfff4e2, 0.4)); m.scale.set(1, 1.3, 1); m.castShadow = true; return m; }
