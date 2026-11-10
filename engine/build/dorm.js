// Dorm cutaway set (build genre, video 073 "How a Dorm Desk Becomes a Homework Factory", Vex as the builder). A dollhouse cut:
// the dorm's FRONT wall is sliced away at z = 0, so the lens (z > 0) sees two rooms stacked in section — a vertical frame's
// natural shape:
//   upstairs (y 2.9 … 5.5): Vex's goth room — plum walls, fairy lights, a black bed with a plush bat, a bookshelf with a skull,
//     a chandelier pendant, a night-campus window (right). The desk (a door on two milk crates) stands mid-room at D.desk.
//   the floor slab between (y 2.6 … 2.9) is ONE subdivided box that bows: setSag(s) pushes its centre down by s m (cos² bell,
//     pinned at the side + back walls, free at the cut) — floor, ceiling and the section all bend together; sagAt(x, z) gives the
//     drop at any point so props/rigs on the floor ride it. A steel I-beam (`beam`) can slide in under it through the right wall.
//   downstairs (y 0 … 2.6): Derek's messy room — a loft bed whose front edge he sits on (D.derek), a desk + monitor under the loft,
//     laundry, pizza, cans, a lava lamp, a TV glow from the lens side (`tvLight`).
//   below: the ground slab, footings under both side walls and a strip of soil strata (the load path ends there).
// Lights: a warm key from the front-left, a cool hemi, a pendant per room; setPower(up, down) dims rooms (blackouts) and the
// key/hemi with them so a blackout reads; the laptop/screens stay lit. Night sky + campus backdrop behind the windows.
// Props (exported): makeDoorDesk (racking + the diagonal brace), makeTextbook, makeDeskLamp, makeMiniFridge, makeKettle,
// makePowerStrip, makeCord, makeConduit (draw-on), makePanel, makePrinter, makeConveyor, makeChute, makeDrill, makePhone,
// makePaperStack, makeIBeam.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, rng, clamp, lerp, canvasTex } from '../core.js';

const PI = Math.PI;
export const D = {
  FY: 2.9, CY: 2.6, TOP: 5.5, ROOF: 5.8, X: 3.0, WT: 0.3, BACK: -3.6,
  desk: [-0.05, -1.25], deskTop: 0.67, deskW: 2.0, deskD: 0.8,
  vex: [0.05, -2.12],
  derek: [0.12, -0.98], loftTop: 1.3, loft: { x0: -0.95, x1: 1.25, z0: -2.05, z1: -0.88 },
  sag: { c: [-0.05, -1.25], rx: 3.0, rz: 2.7 },
  beam: { z: -1.25, h: 0.28 },
  panel: [2.3, -3.58], winU: [-0.25, 1.25], winL: [-2.65, -1.15],
};
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra });
const box = (w, h, d, m, parent, x, y, z) => mk(new THREE.BoxGeometry(w, h, d), m, parent, x, y, z);
const rbox = (w, h, d, r, m, parent, x, y, z) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, parent, x, y, z);
const label = (w, h, draw) => canvasTex(w, h, draw);

/** the bow of the middle slab at (x, z) for a sag of s metres (0 at the walls, s at the centre) */
export function sagAt(s, x, z) {
  const { c, rx, rz } = D.sag, ux = (x - c[0]) / rx, uz = (z - c[1]) / rz;
  if (Math.abs(ux) >= 1 || Math.abs(uz) >= 1) return 0;
  return s * Math.cos(ux * PI / 2) ** 2 * Math.cos(uz * PI / 2) ** 2;
}

// ---------------------------------------------------------------- textures
const concreteTex = (seed = 1) => canvasTex(512, 64, (g, w, h) => {
  g.fillStyle = '#a9a6a0'; g.fillRect(0, 0, w, h); const R = rng(seed);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '60,58,55' : '235,232,226'},${0.12 + R() * 0.2})`; g.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
  g.fillStyle = '#6d4a3a'; for (let x = 18; x < w; x += 36) { g.beginPath(); g.arc(x, h * 0.72, 4.5, 0, 7); g.fill(); g.beginPath(); g.arc(x + 18, h * 0.28, 4.5, 0, 7); g.fill(); }   // rebar ends
}, [6, 1]);
const brickTex = () => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#d8d2c6'; g.fillRect(0, 0, w, h); const R = rng(4);
  for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) { const x = c * 72 + (r % 2) * 36, y = r * 32; const v = 150 + Math.floor(R() * 40); g.fillStyle = `rgb(${v + 20},${Math.floor(v * 0.42)},${Math.floor(v * 0.32)})`; g.fillRect(x + 3, y + 3, 66, 26); }
}, [2, 6]);
const woodTex = (base = '#6b4a35') => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(7);
  for (let i = 0; i < 16; i++) { const y = i * 32; g.fillStyle = `rgba(0,0,0,${0.08 + R() * 0.1})`; g.fillRect(0, y, w, 2); for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(255,230,200,${R() * 0.06})`; g.fillRect(R() * w, y + R() * 30, 30 + R() * 80, 1.5); } }
}, [3, 3]);
const carpetTex = (a, b) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 2600; i++) { g.fillStyle = R() < 0.5 ? b : 'rgba(255,255,255,.05)'; g.fillRect(R() * w, R() * h, 2, 2); } }, [4, 4]);

function skyTex() {
  return canvasTex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141238'); gr.addColorStop(0.55, '#3a2a6a'); gr.addColorStop(0.82, '#a0587a'); gr.addColorStop(1, '#e8906a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(21); for (let i = 0; i < 260; i++) { const y = R() * h * 0.55, a = 0.3 + R() * 0.7; g.fillStyle = `rgba(255,255,240,${a})`; g.beginPath(); g.arc(R() * w, y, 0.8 + R() * 1.8, 0, 7); g.fill(); }
    g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(w * 0.72, h * 0.2, 46, 0, 7); g.fill(); g.fillStyle = '#e8dcbc'; g.beginPath(); g.arc(w * 0.715, h * 0.19, 9, 0, 7); g.arc(w * 0.73, h * 0.215, 6, 0, 7); g.fill();
    // campus silhouettes with lit windows, trees, lamp posts
    const bld = (x, bw, bh, col) => { g.fillStyle = col; g.fillRect(x, h - bh, bw, bh); for (let yy = h - bh + 18; yy < h - 30; yy += 34) for (let xx = x + 12; xx < x + bw - 16; xx += 30) { if (R() < 0.55) { g.fillStyle = R() < 0.7 ? '#ffd27a' : '#9fd0ff'; g.fillRect(xx, yy, 14, 18); } } };
    bld(40, 300, 330, '#241c3e'); bld(380, 220, 250, '#2a2046'); bld(640, 380, 420, '#1e1836'); bld(1080, 260, 300, '#282044'); bld(1400, 340, 380, '#221a3c'); bld(1780, 240, 280, '#2a2246');
    g.fillStyle = '#1e1836'; g.fillRect(780, h - 520, 60, 110); g.beginPath(); g.moveTo(770, h - 520); g.lineTo(810, h - 590); g.lineTo(850, h - 520); g.fill();   // a clock tower
    g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(810, h - 480, 18, 0, 7); g.fill();
    for (let i = 0; i < 26; i++) { const x = R() * w, r = 30 + R() * 50; g.fillStyle = '#16122a'; g.beginPath(); g.arc(x, h - r * 0.6, r, 0, 7); g.fill(); }
    g.fillStyle = '#2a3a2a'; g.fillRect(0, h - 26, w, 26);
  });
}

// ---------------------------------------------------------------- props
/** A door laid flat on two jumbo milk crates (top at D.deskTop). set({rack: shear angle, brace: 0..1, bolt: 0..1 spin}) */
export function makeDoorDesk() {
  const g = new THREE.Group(), top = new THREE.Group(); g.add(top);
  const W = D.deskW, Dd = D.deskD, ch = 0.62;
  const doorT = label(1024, 410, (c, w, h) => {
    c.fillStyle = '#f2ece0'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,100,80,.35)'; c.lineWidth = 8;
    for (const [x, y, ww, hh] of [[60, 50, 400, 130], [60, 230, 400, 130], [560, 50, 400, 130], [560, 230, 400, 130]]) c.strokeRect(x, y, ww, hh);
  });
  const door = rbox(W, 0.05, Dd, 0.01, std(0xffffff, 0.6, { map: doorT }), top, 0, ch + 0.025, 0);
  const brass = std(0xd9a648, 0.3, { metalness: 0.8 });
  const knob = new THREE.Group(); top.add(knob); knob.position.set(W / 2 - 0.16, ch + 0.05, Dd / 2 - 0.12);   // the knob is still on it
  mk(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), brass, knob, 0, 0.006, 0); mk(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 10), brass, knob, 0, 0.03, 0); mk(new THREE.SphereGeometry(0.04, 16, 12), brass, knob, 0, 0.07, 0);
  for (const z of [-0.25, 0.25]) box(0.02, 0.05, 0.09, brass, top, -W / 2 - 0.005, ch + 0.025, z);   // hinges on the end
  // the crates: blue plastic lattice (a canvas with holes = alphaTest)
  const latT = label(256, 256, (c, w, h) => { c.fillStyle = '#2f6fd6'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out'; for (let y = 30; y < h - 30; y += 46) for (let x = 22; x < w - 30; x += 46) { c.beginPath(); c.roundRect(x, y, 30, 30, 6); c.fill(); } });
  const crateM = new THREE.MeshStandardMaterial({ map: latT, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 });
  const crates = [-1, 1].map((s) => {
    const c = new THREE.Group(); g.add(c); c.position.set(s * (W / 2 - 0.32), 0, 0);
    const piv = new THREE.Group(); c.add(piv);
    for (const [w2, d2, x, z, ry] of [[0.52, 0, 0, 0.24, 0], [0.52, 0, 0, -0.24, 0], [0.48, 0, 0.26, 0, PI / 2], [0.48, 0, -0.26, 0, PI / 2]]) { const p = mk(new THREE.PlaneGeometry(w2, ch), crateM, piv, x, ch / 2, z); p.rotation.y = ry; void d2; }
    box(0.52, 0.03, 0.48, std(0x2f6fd6, 0.55), piv, 0, 0.015, 0); box(0.54, 0.04, 0.5, std(0x2a62c0, 0.5), piv, 0, ch - 0.02, 0);
    return { c, piv };
  });
  // the diagonal brace (a 2×4) on the BACK side (seen through the gap between the crates), from the right crate's foot up to the
  // left crate's top (world x; the top bolt sits on Vex's right as she stands behind the desk); it grows from its foot
  const brace = new THREE.Group(); g.add(brace);
  const a = [W / 2 - 0.32, 0.08], b = [-(W / 2 - 0.32), ch - 0.06], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  brace.position.set(a[0], a[1], -(Dd / 2 - 0.06)); brace.rotation.z = ang;
  const pg = new THREE.BoxGeometry(L, 0.12, 0.05); pg.translate(L / 2, 0, 0);
  const plank = mk(pg, std(0xf0b95a, 0.7), brace, 0, 0, 0);
  const bolts = [0, L].map((x) => { const bg = new THREE.Group(); brace.add(bg); bg.position.set(x, 0, 0.03); mk(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 6), std(0x9aa3ad, 0.3, { metalness: 0.8 }), bg).rotation.x = PI / 2; return bg; });
  const braceEnds = { foot: [a[0], a[1], -(Dd / 2 - 0.06)], top: [b[0], b[1], -(Dd / 2 - 0.06)] };
  return {
    g, top, door, knob, crates, brace, bolts, braceEnds, ch, topY: ch + 0.05,
    set({ rack = 0, brace: bk = 0, spin = 0 } = {}) {
      for (const c of crates) c.piv.rotation.z = -rack;
      top.position.x = Math.sin(rack) * ch; top.position.y = -(1 - Math.cos(rack)) * ch;
      brace.visible = bk > 0.01; plank.scale.x = Math.max(0.01, bk); bolts[1].visible = bk > 0.98; bolts.forEach((bb) => (bb.rotation.x = spin));
    },
  };
}

export function makeTextbook(title, color, { w = 0.52, h = 0.11, d = 0.38 } = {}) {
  const g = new THREE.Group();
  const spine = label(512, 110, (c, ww, hh) => { c.fillStyle = '#' + new THREE.Color(color).getHexString(); c.fillRect(0, 0, ww, hh); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(0, 14, ww, 6); c.fillRect(0, hh - 20, ww, 6); c.fillStyle = '#fff'; c.font = '800 54px Fredoka, Arial'; c.textAlign = 'center'; c.fillText(title, ww / 2, 74); });
  const pages = std(0xf4efe2, 0.9), cover = std(color, 0.55), sm = std(0xffffff, 0.55, { map: spine });
  const b = mk(new THREE.BoxGeometry(w, h, d), [cover, cover, cover, cover, sm, pages], g, 0, h / 2, 0); void b;
  return g;
}

export function makeDeskLamp() {
  const g = new THREE.Group(), blk = std(0x1c1a22, 0.35, { metalness: 0.4 });
  mk(new THREE.CylinderGeometry(0.09, 0.1, 0.025, 20), blk, g, 0, 0.012, 0);
  const arm = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), blk, g, 0, 0.21, 0); arm.rotation.z = 0.25;
  const head = new THREE.Group(); g.add(head); head.position.set(-0.1, 0.4, 0); head.rotation.z = -0.9;
  mk(new THREE.ConeGeometry(0.09, 0.14, 18, 1, true), std(0x2a1a3a, 0.4, { side: THREE.DoubleSide }), head, 0, -0.05, 0);
  const bulb = mk(new THREE.SphereGeometry(0.035, 12, 10), basic(0xfff1c8), head, 0, -0.1, 0);
  const light = new THREE.PointLight(0xffcf8a, 0, 2.2, 1.6); light.position.set(-0.2, 0.25, 0.05); g.add(light);
  return { g, bulb, light, set(on) { bulb.material.color.setHex(on > 0.5 ? 0xfff1c8 : 0x3a3530); light.intensity = 0.8 * on; } };
}

export function makeMiniFridge() {
  const g = new THREE.Group();
  rbox(0.48, 0.62, 0.48, 0.03, std(0xeceef0, 0.35), g, 0, 0.31, 0);
  const door = rbox(0.46, 0.6, 0.03, 0.012, std(0xf6f7f8, 0.3), g, 0, 0.31, 0.25); void door;
  box(0.03, 0.3, 0.03, std(0x9aa3ad, 0.3, { metalness: 0.7 }), g, 0.18, 0.36, 0.28);
  const stk = label(256, 128, (c, w, h) => { c.fillStyle = '#1a1a1f'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 20); c.fill(); c.fillStyle = '#ff5ad1'; c.font = '800 70px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('VEX', w / 2, 90); });
  mk(new THREE.PlaneGeometry(0.2, 0.1), std(0xffffff, 0.5, { map: stk }), g, -0.06, 0.46, 0.267);
  for (const [x, y, col] of [[0.05, 0.24, 0xff4d5e], [-0.12, 0.2, 0x58d36b], [0.1, 0.5, 0xffd23f]]) mk(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10), std(col, 0.5), g, x, y, 0.27).rotation.x = PI / 2;
  return g;
}

export function makeKettle() {
  const g = new THREE.Group(), steel = std(0xc6ccd3, 0.25, { metalness: 0.8 });
  mk(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 20), std(0x1c1a22, 0.4), g, 0, 0.01, 0);
  mk(new THREE.CylinderGeometry(0.07, 0.085, 0.2, 20), steel, g, 0, 0.12, 0);
  mk(new THREE.SphereGeometry(0.07, 18, 10, 0, PI * 2, 0, PI / 2), steel, g, 0, 0.22, 0);
  const sp = mk(new THREE.CylinderGeometry(0.012, 0.022, 0.1, 10), steel, g, 0.1, 0.17, 0); sp.rotation.z = -0.9;
  const hd = mk(new THREE.TorusGeometry(0.06, 0.012, 6, 16, PI), std(0x1c1a22, 0.4), g, -0.075, 0.15, 0); hd.rotation.z = PI / 2;
  const led = mk(new THREE.SphereGeometry(0.012, 8, 6), basic(0x333333), g, 0, 0.04, 0.083);
  return { g, led, spout: [0.15, 0.22, 0], set(on) { led.material.color.setHex(on ? 0x5ab0ff : 0x333333); } };
}

export function makePowerStrip() {
  const g = new THREE.Group();
  rbox(0.36, 0.045, 0.09, 0.015, std(0xf2f2f0, 0.45), g, 0, 0.0225, 0);
  for (let i = 0; i < 5; i++) for (const dz of [-0.012, 0.012]) box(0.006, 0.004, 0.012, std(0x222222, 0.5), g, -0.13 + i * 0.06 + (dz > 0 ? 0.01 : -0.01), 0.046, 0);
  const sw = box(0.04, 0.02, 0.03, std(0xd8343a, 0.4), g, 0.16, 0.05, 0);
  const scorch = mk(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0 }), g, 0, 0.002, 0); scorch.rotation.x = -PI / 2;
  return { g, sw, scorch };
}

/** a cable as a tube along points (world or parent space); set(k) reveals it from the first point */
export function makeCord(parent, pts, { r = 0.012, color = 0x1c1c22, seg = 64 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const geo = new THREE.TubeGeometry(curve, seg, r, 8, false);
  const m = mk(geo, std(color, 0.55), parent); const total = geo.index.count;
  return { m, curve, set(k) { m.visible = k > 0.005; geo.setDrawRange(0, Math.floor(total * clamp(k) / 6) * 6); } };
}
export const makeConduit = (parent, pts) => makeCord(parent, pts, { r: 0.028, color: 0x9aa1a8, seg: 120 });

export function makePanel() {
  const g = new THREE.Group();
  rbox(0.42, 0.6, 0.1, 0.015, std(0x8f969c, 0.35, { metalness: 0.5 }), g, 0, 0, 0.05);
  box(0.36, 0.54, 0.01, std(0x2a2d31, 0.6), g, 0, 0, 0.101);
  const flips = [];
  for (let r = 0; r < 6; r++) for (const s of [-1, 1]) { const f = box(0.1, 0.035, 0.03, std(r === 0 && s < 0 ? 0xff4fd8 : 0x1c1c1f, 0.4, r === 0 && s < 0 ? { emissive: 0xff4fd8, emissiveIntensity: 0.6 } : {}), g, s * 0.07, 0.2 - r * 0.075, 0.115); flips.push(f); }
  const tag = label(256, 80, (c, w, h) => { c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = '800 46px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('VEX ONLY', w / 2, 56); });
  mk(new THREE.PlaneGeometry(0.3, 0.094), basic(0xffffff, { map: tag }), g, 0, 0.36, 0.105);
  const door = new THREE.Group(); g.add(door); door.position.set(-0.21, 0, 0.105);
  box(0.42, 0.6, 0.012, std(0x9ca3a9, 0.35, { metalness: 0.5 }), door, 0.21, 0, 0.006);
  return { g, door, flips };
}

export function makePrinter() {
  const g = new THREE.Group();
  rbox(0.5, 0.22, 0.38, 0.03, std(0x2b2b33, 0.45), g, 0, 0.11, 0);
  rbox(0.46, 0.04, 0.3, 0.015, std(0x3a3a44, 0.45), g, 0, 0.235, -0.02);
  box(0.36, 0.01, 0.2, std(0x1c1c22, 0.5), g, 0, 0.06, 0.24);   // the output tray
  const led = mk(new THREE.SphereGeometry(0.012, 8, 6), basic(0x58d36b), g, 0.2, 0.2, 0.19);
  const paper = mk(new THREE.PlaneGeometry(0.21, 0.27), std(0xfbfaf6, 0.9, { side: THREE.DoubleSide }), g, 0, 0.12, 0.2); paper.rotation.x = -PI / 2;
  return { g, led, paper };
}

/** a little desk conveyor along +x (length L); the belt texture scrolls with set(offset) */
export function makeConveyor(L = 1.6) {
  const g = new THREE.Group();
  const beltT = label(512, 64, (c, w, h) => { c.fillStyle = '#26272c'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a3c43'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 14, h); }); beltT.wrapS = THREE.RepeatWrapping; beltT.repeat.set(L * 3, 1);
  const belt = mk(new THREE.BoxGeometry(L, 0.04, 0.32), [std(0x26272c), std(0x26272c), std(0xffffff, 0.6, { map: beltT }), std(0x26272c), std(0x26272c), std(0x26272c)], g, L / 2, 0.38, 0);
  const frame = std(0xffd23f, 0.45);
  for (const z of [-0.18, 0.18]) box(L + 0.06, 0.06, 0.03, frame, g, L / 2, 0.37, z);
  for (const x of [0.08, L / 2, L - 0.08]) for (const z of [-0.16, 0.16]) box(0.04, 0.36, 0.04, std(0x3a3c43, 0.5), g, x, 0.18, z);
  for (let x = 0.0; x <= L; x += L / 4) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), std(0x9aa3ad, 0.3, { metalness: 0.7 }), g, x, 0.36, 0).rotation.x = PI / 2;
  return { g, topY: 0.4, set(off) { beltT.offset.x = -off * 3; }, belt };
}

/** a clear snack chute from the ceiling: a tube + a funnel mouth; bags slide down it */
export function makeChute(len = 1.2) {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: 0xd8f0ff, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
  mk(new THREE.CylinderGeometry(0.11, 0.11, len, 20, 1, true), glass, g, 0, -len / 2, 0);
  for (const y of [-0.05, -len + 0.05]) mk(new THREE.TorusGeometry(0.115, 0.015, 8, 20), std(0xff4fd8, 0.4), g, 0, y, 0).rotation.x = PI / 2;
  const bags = [0xff4d5e, 0xffd23f, 0x3ec7ff, 0x58d36b].map((col, i) => { const b = rbox(0.14, 0.18, 0.05, 0.02, std(col, 0.4), g, 0, -0.2 - i * 0.25, 0); return b; });
  return { g, bags, len };
}

export function makeDrill() {
  const g = new THREE.Group(), body = std(0x7a3fd0, 0.4), blk = std(0x1c1a22, 0.5);
  rbox(0.2, 0.07, 0.07, 0.02, body, g, 0.04, 0.08, 0);           // body along +x (the bit points +x)
  rbox(0.06, 0.14, 0.06, 0.015, blk, g, 0, 0.0, 0);               // the grip (the origin = where the fist closes)
  rbox(0.1, 0.05, 0.08, 0.015, body, g, 0, -0.08, 0);             // battery
  const chuck = mk(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 12), std(0x9aa3ad, 0.3, { metalness: 0.8 }), g, 0.165, 0.08, 0); chuck.rotation.z = -PI / 2;
  const bit = mk(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), std(0xc8ccd0, 0.2, { metalness: 0.9 }), g, 0.225, 0.08, 0); bit.rotation.z = -PI / 2;
  return { g, chuck, bit };
}

export function makePhone() {
  const g = new THREE.Group();
  rbox(0.075, 0.155, 0.009, 0.008, std(0xff4fd8, 0.35), g, 0, 0, 0);   // a pink case: it reads at a distance
  const scrT = label(150, 310, (c, w, h) => { c.fillStyle = '#0d0d12'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(20, 60, w - 40, h - 130); c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h - 36, 20, 0, 7); c.fill(); });
  const scr = mk(new THREE.PlaneGeometry(0.068, 0.145), basic(0xffffff, { map: scrT }), g, 0, 0, -0.0048); scr.rotation.y = PI;   // the screen faces −z (her), the camera bump +z (the sheet)
  mk(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 12), std(0x333340, 0.2), g, -0.02, 0.055, 0.0055).rotation.x = PI / 2;
  const flash = new THREE.PointLight(0xffffff, 0, 2.5, 1.5); flash.position.set(0, 0.05, 0.05); g.add(flash);
  return { g, flash };
}

/** a ream of problem sets: n sheets as one block + a printed top sheet (canvas texture) */
export function makePaperStack(topTex, { w = 0.34, d = 0.44, h = 0.32 } = {}) {
  const g = new THREE.Group();
  const side = label(64, 256, (c, ww, hh) => { c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, ww, hh); c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < hh; y += 4) c.fillRect(0, y, ww, 1); });
  const sm = std(0xffffff, 0.9, { map: side });
  mk(new THREE.BoxGeometry(w, h, d), [sm, sm, std(0xfbfaf6, 0.9), sm, sm, sm], g, 0, h / 2, 0);
  const top = mk(new THREE.PlaneGeometry(w * 0.98, d * 0.98), std(0xffffff, 0.85, { map: topTex }), g, 0, h + 0.002, 0); top.rotation.x = -PI / 2;
  const band = box(w + 0.01, 0.04, 0.03, std(0xd8343a, 0.5), g, 0, h * 0.55, 0); void band;
  return { g, h };
}

export function makeIBeam(len = 6.6, h = D.beam.h, color = 0xc8462a) {
  const g = new THREE.Group(), m = std(color, 0.5, { metalness: 0.35 });
  box(len, 0.025, 0.2, m, g, 0, h - 0.0125, 0); box(len, 0.025, 0.2, m, g, 0, 0.0125, 0); box(len, h - 0.05, 0.02, m, g, 0, h / 2, 0);
  for (let x = -len / 2 + 0.3; x < len / 2; x += 0.6) mk(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), std(0x9aa3ad, 0.3, { metalness: 0.8 }), g, x, h / 2, 0.012).rotation.x = PI / 2;
  const stamp = label(512, 96, (c, w, hh) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, hh); c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '800 64px Fredoka, Arial'; c.textAlign = 'center'; c.fillText('W8×31 STEEL', w / 2, 72); });
  mk(new THREE.PlaneGeometry(0.9, 0.17), new THREE.MeshStandardMaterial({ map: stamp, transparent: true, roughness: 0.6 }), g, 0.6, h / 2, 0.106);
  return { g, mat: m };
}

// ---------------------------------------------------------------- the set
export function buildDorm(studio) {
  const { scene } = studio, root = new THREE.Group(); scene.add(root);
  const { FY, CY, TOP, ROOF, X, WT, BACK } = D;
  scene.background = new THREE.Color(0x1a1636);
  const lights = {};
  // ---- sky + campus backdrop (behind every window and over the roof)
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(64, 32), new THREE.MeshBasicMaterial({ map: skyTex(), fog: false, toneMapped: false }));
  sky.position.set(0, 9, -16); root.add(sky);
  const lawn = mk(new THREE.PlaneGeometry(60, 14), std(0x2e4a2e, 0.95), root, 0, -0.02, -10); lawn.rotation.x = -PI / 2;
  // ---- structure: slabs (cut faces show concrete + rebar), walls (cut faces show brick)
  const conc = concreteTex(), concM = std(0xffffff, 0.92, { map: conc }), brickM = std(0xffffff, 0.9, { map: brickTex() });
  const plaster = std(0xf1ede6, 0.95);
  // ground slab + soil strata below + footings under the side walls
  box(2 * X + 2 * WT + 8, 0.3, 4.4, concM, root, 0, -0.15, -2.2);
  const soilT = canvasTex(1024, 256, (g, w, h) => {
    const bands = ['#7a5436', '#6b4a2e', '#8a6a48', '#5e4430', '#74583c'], R = rng(5); let y = 0;
    for (const c of bands) { const hh = 40 + R() * 30; g.fillStyle = c; g.fillRect(0, y, w, hh + 2); y += hh; } g.fillStyle = '#5e4430'; g.fillRect(0, y, w, h - y);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '40,25,15' : '200,170,130'},.35)`; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 5, 0, 7); g.fill(); }
  });
  mk(new THREE.PlaneGeometry(14.6, 2.2), std(0xffffff, 0.97, { map: soilT }), root, 0, -1.4, 0.0);
  for (const s of [-1, 1]) box(0.9, 0.5, 4.0, concM, root, s * (X + WT / 2), -0.55, -2.0);
  // the middle slab: one subdivided box (floor up, ceiling down, section to the front) that bows with setSag
  const SW = 2 * X, SD = -BACK;
  const slabGeo = new THREE.BoxGeometry(SW, 0.3, SD, 60, 1, 36);
  const floorUp = std(0xffffff, 0.8, { map: woodTex('#4a3428') }), ceilDown = plaster;
  const slab = mk(slabGeo, [concM, concM, floorUp, ceilDown, concM, concM], root, 0, CY + 0.15, BACK / 2);
  const slabP0 = slabGeo.attributes.position.array.slice();
  // roof slab + top floor slab front
  box(SW + 2 * WT, 0.3, SD + WT, concM, root, 0, TOP + 0.15, (BACK - WT) / 2);
  mk(new THREE.PlaneGeometry(SW, SD), plaster, root, 0, TOP - 0.002, BACK / 2).rotation.x = PI / 2;
  const lowFloor = mk(new THREE.PlaneGeometry(SW, SD), std(0xffffff, 0.95, { map: carpetTex('#9c8f78', 'rgba(60,50,40,.18)') }), root, 0, 0.002, BACK / 2); lowFloor.rotation.x = -PI / 2;
  // side walls (brick section at the cut, painted inside) + the back walls with a window each
  const plum = std(0x55355f, 0.9), blue = std(0x7d97b0, 0.9);
  for (const s of [-1, 1]) {
    const w = mk(new THREE.BoxGeometry(WT, ROOF + 0.3, SD + WT), [brickM, brickM, brickM, brickM, brickM, brickM], root, s * (X + WT / 2), (ROOF + 0.3) / 2 - 0.3, (BACK - WT) / 2); void w;
    mk(new THREE.PlaneGeometry(SD, TOP - FY), plum, root, s * (X - 0.002), (FY + TOP) / 2, BACK / 2).rotation.y = -s * PI / 2;
    mk(new THREE.PlaneGeometry(SD, CY), blue, root, s * (X - 0.002), CY / 2, BACK / 2).rotation.y = -s * PI / 2;
  }
  function backWall(y0, y1, win, wallM) {
    const [wx0, wx1] = win, wy0 = y0 + 0.95, wy1 = Math.min(y1 - 0.35, y0 + 2.25), z = BACK - WT / 2;
    const part = (x0, x1, ya, yb) => { if (x1 - x0 < 0.01 || yb - ya < 0.01) return; box(x1 - x0, yb - ya, WT, brickM, root, (x0 + x1) / 2, (ya + yb) / 2, z); mk(new THREE.PlaneGeometry(x1 - x0, yb - ya), wallM, root, (x0 + x1) / 2, (ya + yb) / 2, BACK + 0.002); };
    part(-X - WT, wx0, y0, y1); part(wx1, X + WT, y0, y1); part(wx0, wx1, y0, wy0); part(wx0, wx1, wy1, y1);
    const frame = std(0xf4f1ea, 0.6);
    for (const [w, h, x, y] of [[wx1 - wx0 + 0.08, 0.06, (wx0 + wx1) / 2, wy0], [wx1 - wx0 + 0.08, 0.06, (wx0 + wx1) / 2, wy1], [0.06, wy1 - wy0, wx0, (wy0 + wy1) / 2], [0.06, wy1 - wy0, wx1, (wy0 + wy1) / 2], [0.04, wy1 - wy0, (wx0 + wx1) / 2, (wy0 + wy1) / 2], [wx1 - wx0, 0.04, (wx0 + wx1) / 2, (wy0 + wy1) / 2]]) box(w, h, 0.08, frame, root, x, y, BACK - 0.02);
    box(wx1 - wx0 + 0.2, 0.05, 0.18, frame, root, (wx0 + wx1) / 2, wy0 - 0.02, BACK + 0.07);
    const glass = mk(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), new THREE.MeshStandardMaterial({ color: 0x9fb8ff, roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false }), root, (wx0 + wx1) / 2, (wy0 + wy1) / 2, BACK - 0.1); glass.castShadow = false;
    return { wx0, wx1, wy0, wy1 };
  }
  const winU = backWall(FY, TOP, D.winU, plum), winL = backWall(0, CY, D.winL, blue);
  // ---- lights
  lights.hemi = new THREE.HemisphereLight(0xc9c4ff, 0x3a2a34, 0.75); root.add(lights.hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 1.7); key.position.set(-3.5, 9, 9); key.target.position.set(0, 2.6, -1.8); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  lights.key = key;
  const lampU = new THREE.PointLight(0xffc98a, 4.2, 7, 1.5); lampU.position.set(-1.35, TOP - 0.55, -1.3); root.add(lampU);
  const lampL = new THREE.PointLight(0xe6eeff, 3.4, 5.5, 1.5); lampL.position.set(-1.2, CY - 0.35, -2.4); root.add(lampL);
  const tvLight = new THREE.PointLight(0x6fb4ff, 1.4, 3, 1.6); tvLight.position.set(D.derek[0], 1.9, 0.6); root.add(tvLight);
  lights.lampU = lampU; lights.lampL = lampL; lights.tv = tvLight;
  // ---- Vex's room (upstairs)
  const up = new THREE.Group(); root.add(up);   // everything on the bowing floor rides it (per-item sag offsets in setSag)
  const riders = [];   // [object, baseY, x, z]
  const ride = (o, x, z, y = 0) => { o.position.set(x, FY + y, z); up.add(o); riders.push([o, FY + y, x, z]); return o; };
  { const rug = mk(new THREE.CircleGeometry(1.25, 40), std(0xffffff, 0.95, { map: canvasTex(256, 256, (g, w) => { g.fillStyle = '#231a2e'; g.fillRect(0, 0, w, w); g.strokeStyle = '#7a3fd0'; g.lineWidth = 10; for (const r of [120, 96, 72]) { g.beginPath(); g.arc(w / 2, w / 2, r, 0, 7); g.stroke(); } }) }), up, 0, 0, 0); rug.rotation.x = -PI / 2; rug.receiveShadow = true; rug.position.set(-0.2, FY + 0.006, -1.6); riders.push([rug, FY + 0.006, -0.2, -1.6]); }
  // bed (left back corner): black frame, purple duvet, pillows, a plush bat
  { const bed = new THREE.Group(); ride(bed, -2.15, -2.75);
    box(1.6, 0.3, 1.0, std(0x16141a, 0.5), bed, 0, 0.15, 0); box(1.55, 0.2, 0.95, std(0x5b2a7a, 0.85), bed, 0.02, 0.4, 0); box(0.06, 0.9, 1.0, std(0x16141a, 0.5), bed, -0.8, 0.45, 0);
    rbox(0.32, 0.12, 0.6, 0.05, std(0x2a1a3a, 0.8), bed, -0.55, 0.56, 0);
    const bat = new THREE.Group(); bed.add(bat); bat.position.set(0.1, 0.56, 0.2);
    mk(new THREE.SphereGeometry(0.1, 14, 10), std(0x1c1a22, 0.8), bat, 0, 0.08, 0);
    for (const s of [-1, 1]) { const w = mk(new THREE.ConeGeometry(0.12, 0.2, 3), std(0x2a2433, 0.8), bat, s * 0.15, 0.1, 0); w.rotation.z = s * 1.6; w.scale.z = 0.3; mk(new THREE.ConeGeometry(0.025, 0.06, 6), std(0x1c1a22, 0.8), bat, s * 0.05, 0.19, 0); mk(new THREE.SphereGeometry(0.018, 8, 6), basic(0xff4fd8), bat, s * 0.035, 0.1, 0.09); } }
  // bookshelf on the right wall with books, a skull and candles
  { const sh = new THREE.Group(); ride(sh, 2.72, -2.4); sh.rotation.y = -PI / 2;
    const wd = std(0x1f1a24, 0.6); box(1.2, 1.9, 0.32, wd, sh, 0, 0.95, 0);
    const R = rng(33);
    for (let r = 0; r < 4; r++) { box(1.12, 0.03, 0.3, std(0x2c2533, 0.6), sh, 0, 0.3 + r * 0.42, 0.02); let x = -0.5; while (x < 0.45) { const bw = 0.04 + R() * 0.05, bh = 0.24 + R() * 0.1; box(bw, bh, 0.22, std([0x7a3fd0, 0x1c1a22, 0xd8343a, 0x3a2a6a, 0x8a8a90][Math.floor(R() * 5)], 0.6), sh, x + bw / 2, 0.315 + r * 0.42 + bh / 2, 0.04); x += bw + 0.01; } }
    mk(new THREE.SphereGeometry(0.09, 14, 10), std(0xe8e2d4, 0.6), sh, -0.3, 1.88, 0.05);
    for (const x of [0.2, 0.35]) { mk(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), std(0xf4efe4, 0.6), sh, x, 1.96, 0.05); mk(new THREE.SphereGeometry(0.015, 8, 6), basic(0xffb050), sh, x, 2.04, 0.05); } }
  // posters + fairy lights + a chandelier pendant
  const poster = (parent, w, h, draw, x, y, z, ry = 0) => { const p = mk(new THREE.PlaneGeometry(w, h), std(0xffffff, 0.85, { map: canvasTex(Math.round(w * 400), Math.round(h * 400), draw) }), parent, x, y, z); p.rotation.y = ry; return p; };
  poster(root, 0.7, 0.95, (g, w, h) => { g.fillStyle = '#120f18'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2e9ff'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w / 2, 60 + i * 70, 26, 0, 7); g.fill(); if (i !== 2) { g.fillStyle = '#120f18'; g.beginPath(); g.arc(w / 2 + (i - 2) * 14, 60 + i * 70, 26, 0, 7); g.fill(); g.fillStyle = '#f2e9ff'; } } g.font = '700 36px Georgia'; g.textAlign = 'center'; g.fillText('PHASES', w / 2, h - 24); }, -0.95, FY + 1.7, BACK + 0.01);
  poster(root, 0.6, 0.8, (g, w, h) => { g.fillStyle = '#7a3fd0'; g.fillRect(0, 0, w, h); g.fillStyle = '#16141a'; g.beginPath(); g.moveTo(w / 2, 90); g.quadraticCurveTo(w * 0.1, 40, 20, 150); g.quadraticCurveTo(w * 0.3, 140, w / 2, 190); g.quadraticCurveTo(w * 0.7, 140, w - 20, 150); g.quadraticCurveTo(w * 0.9, 40, w / 2, 90); g.fill(); g.fillStyle = '#fff'; g.font = '800 52px Fredoka, Arial'; g.textAlign = 'center'; g.fillText('NIGHT', w / 2, h - 70); g.fillText('SHIFT', w / 2, h - 20); }, -2.4, FY + 1.75, BACK + 0.01);
  const fairy = [];
  { const n = 26; for (let i = 0; i < n; i++) { const x = -2.9 + (i / (n - 1)) * 5.8, y = TOP - 0.22 - 0.12 * Math.sin((i / (n - 1)) * PI * 4) ** 2; const b = mk(new THREE.SphereGeometry(0.025, 8, 6), basic(0xffd27a), root, x, y, BACK + 0.05); fairy.push(b); } }
  { const pend = new THREE.Group(); pend.position.set(-1.35, TOP, -1.3); root.add(pend); mk(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 6), std(0x111111), pend, 0, -0.2, 0); mk(new THREE.ConeGeometry(0.22, 0.2, 6, 1, true), std(0x1c1a22, 0.4, { side: THREE.DoubleSide }), pend, 0, -0.45, 0); }
  const pendBulb = mk(new THREE.SphereGeometry(0.06, 10, 8), basic(0xffe2b0), root, -1.35, TOP - 0.52, -1.3);
  // curtains (black lace) at the window
  for (const x of [winU.wx0 - 0.12, winU.wx1 + 0.12]) { const c = mk(new THREE.BoxGeometry(0.22, winU.wy1 - winU.wy0 + 0.5, 0.04), std(0x1a1520, 0.9), root, x, (winU.wy0 + winU.wy1) / 2 + 0.1, BACK + 0.08); c.scale.x = 1; }
  // ---- Derek's room (downstairs): the loft bed he sits on, a desk + monitor under it, mess
  const low = new THREE.Group(); root.add(low);
  { const L = D.loft, fr = std(0x2c2c32, 0.5), top = D.loftTop;
    for (const [x, z] of [[L.x0, L.z0], [L.x1, L.z0], [L.x0, L.z1], [L.x1, L.z1]]) box(0.06, top + 0.35, 0.06, fr, low, x, (top + 0.35) / 2, z);
    box(L.x1 - L.x0, 0.08, L.z1 - L.z0, fr, low, (L.x0 + L.x1) / 2, top - 0.12, (L.z0 + L.z1) / 2);
    rbox(L.x1 - L.x0 - 0.06, 0.16, L.z1 - L.z0 - 0.04, 0.04, std(0x2b4a7a, 0.85), low, (L.x0 + L.x1) / 2, top, (L.z0 + L.z1) / 2);
    box(L.x1 - L.x0, 0.05, 0.04, fr, low, (L.x0 + L.x1) / 2, top + 0.28, L.z0);
    rbox(0.45, 0.12, 0.3, 0.05, std(0xeceae4, 0.85), low, L.x0 + 0.35, top + 0.12, L.z0 + 0.25);
    // the ladder at the right end
    for (const dz of [-0.18, 0.18]) box(0.04, top + 0.3, 0.04, fr, low, L.x1 + 0.05, (top + 0.3) / 2, (L.z0 + L.z1) / 2 + dz);
    for (let y = 0.3; y < top; y += 0.3) box(0.04, 0.03, 0.4, fr, low, L.x1 + 0.05, y, (L.z0 + L.z1) / 2);
    // desk under the loft: monitor glow, keyboard, an energy drink
    box(1.3, 0.04, 0.6, std(0x5a4a3a, 0.7), low, 0.1, 0.74, -1.65); for (const x of [-0.5, 0.7]) box(0.04, 0.74, 0.55, std(0x2c2c32, 0.5), low, x, 0.37, -1.65);
    const mon = rbox(0.6, 0.36, 0.04, 0.01, std(0x111111, 0.4), low, 0.1, 1.0, -1.85); void mon;
    mk(new THREE.PlaneGeometry(0.56, 0.32), basic(0x3a7bd5, { map: canvasTex(256, 144, (g, w, h) => { g.fillStyle = '#1e3b78'; g.fillRect(0, 0, w, h); g.fillStyle = '#58d36b'; for (let i = 0; i < 6; i++) g.fillRect(20 + i * 36, 90 - (i % 3) * 18, 26, 26); g.fillStyle = '#ffd23f'; g.fillRect(40, 30, 40, 40); }) }), low, 0.1, 1.0, -1.828);
    box(0.4, 0.02, 0.14, std(0x1c1c22, 0.5), low, 0.1, 0.77, -1.5);
  }
  { const R = rng(12);
    const pz = new THREE.Group(); pz.position.set(-1.6, 0.01, -0.8); pz.rotation.y = 0.4; low.add(pz); box(0.42, 0.04, 0.42, std(0xc8a878, 0.8), pz, 0, 0.02, 0); const lid = box(0.42, 0.01, 0.42, std(0xc8a878, 0.8), pz, 0, 0.21, -0.21); lid.rotation.x = -1.2; lid.position.set(0, 0.2, -0.28);
    for (let i = 0; i < 7; i++) { const c = rbox(0.3 + R() * 0.2, 0.06 + R() * 0.06, 0.2 + R() * 0.2, 0.03, std([0x3a5a8a, 0xd8343a, 0xe8e4dc, 0x2c2c32, 0x6a8a3a][i % 5], 0.9), low, 1.8 + R() * 0.6, 0.05 + i * 0.05, -0.9 - R() * 0.5); c.rotation.y = R() * 3; }
    for (let i = 0; i < 5; i++) { const c = mk(new THREE.CylinderGeometry(0.033, 0.033, 0.13, 12), std([0x58d36b, 0x1c1c22, 0x3ec7ff][i % 3], 0.4, { metalness: 0.6 }), low, -0.6 + R() * 1.4, 0.065, -0.3 - R() * 0.4); if (i % 2) { c.rotation.z = PI / 2; c.position.y = 0.033; } }
    const lava = new THREE.Group(); lava.position.set(-2.55, 0, -2.9); low.add(lava); box(0.5, 0.6, 0.4, std(0x2c2c32, 0.6), lava, 0, 0.3, 0); mk(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 14), basic(0xff7a3d), lava, 0, 0.75, 0); mk(new THREE.ConeGeometry(0.08, 0.1, 14), std(0x9aa3ad, 0.3, { metalness: 0.7 }), lava, 0, 0.55, 0);
    poster(root, 0.75, 0.55, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4d5e'; g.font = '800 64px Fredoka, Arial'; g.textAlign = 'center'; g.fillText('GAME', w / 2, 100); g.fillText('OVER', w / 2, 170); g.fillStyle = '#ffd23f'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(70 + i * 80, 200, 14, 0, 7); g.fill(); } }, 0.15, 1.95, BACK + 0.01);
    poster(root, 0.9, 0.3, (g, w, h) => { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h / 2); g.lineTo(0, h); g.fill(); g.fillStyle = '#1e3b78'; g.font = '800 64px Fredoka, Arial'; g.fillText('GO TEAM', 20, h / 2 + 22); }, 1.6, 1.9, BACK + 0.01);
  }
  const domeL = mk(new THREE.SphereGeometry(0.2, 16, 8, 0, PI * 2, 0, PI / 2), basic(0xf4f6ff), root, -1.2, CY - 0.002, -2.4); domeL.rotation.x = PI;
  // ---- neighbours (left/right of the cut, dimmer rooms so the wides read as a building)
  for (const s of [-1, 1]) for (const [y0, y1, col] of [[0, CY, s < 0 ? 0x8a7a5a : 0x6a8a7a], [FY, TOP, s < 0 ? 0x5a6a8a : 0x8a5a6a]]) {
    const cx = s * (X + WT + 2.2); mk(new THREE.PlaneGeometry(4.4, y1 - y0), std(col, 0.9), root, cx, (y0 + y1) / 2, BACK + 0.01);
    const f = mk(new THREE.PlaneGeometry(4.4, SD), std(0x6a5a4a, 0.9), root, cx, y0 + 0.002, BACK / 2); f.rotation.x = -PI / 2;
    box(1.6, 0.45, 0.9, std(0x3a3a48, 0.8), root, cx + s * 0.6, y0 + 0.225, -2.9);
    box(4.4, 0.3, SD, concM, root, cx, y1 + 0.15, BACK / 2);
    box(0.3, y1 - y0, SD, brickM, root, s * (X + WT + 4.55), (y0 + y1) / 2, BACK / 2);
  }
  // roof: parapet, an AC unit and the VEND machine (the snack chute's source)
  rbox(0.9, 0.6, 0.7, 0.04, std(0x9aa3ad, 0.4, { metalness: 0.5 }), root, 1.6, ROOF + 0.3, -2.3);
  const vend = new THREE.Group(); vend.position.set(-0.75, ROOF, -2.4); root.add(vend);
  rbox(0.7, 1.4, 0.6, 0.04, std(0xd8343a, 0.45), vend, 0, 0.7, 0); mk(new THREE.PlaneGeometry(0.46, 0.9), basic(0xffe9a8), vend, -0.06, 0.8, 0.301);
  mk(new THREE.PlaneGeometry(0.6, 0.18), basic(0xffffff, { map: canvasTex(256, 80, (g, w, h) => { g.fillStyle = '#d8343a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 54px Fredoka, Arial'; g.textAlign = 'center'; g.fillText('SNACKS', w / 2, 60); }) }), vend, 0, 1.25, 0.302);

  // ---- state
  let sagNow = -1;
  function setSag(s) {
    if (Math.abs(s - sagNow) < 1e-4) return; sagNow = s;
    const P = slabGeo.attributes.position.array;
    for (let i = 0; i < P.length; i += 3) { const x = slabP0[i], z = slabP0[i + 2] + BACK / 2; P[i + 1] = slabP0[i + 1] - sagAt(s, x, z); }
    slabGeo.attributes.position.needsUpdate = true; slabGeo.computeVertexNormals();
    for (const [o, y, x, z] of riders) o.position.y = y - sagAt(s, x, z);
  }
  let powNow = '';
  function setPower(u = 1, l = 1) {
    const key2 = u.toFixed(3) + '/' + l.toFixed(3); if (key2 === powNow) return; powNow = key2;
    lampU.intensity = 4.2 * u; lampL.intensity = 3.4 * l; tvLight.intensity = 1.4 * l;
    const m = Math.min(u, l), amb = 0.28 + 0.72 * Math.max(u, l) * 0.5 + 0.36 * m;
    lights.hemi.intensity = 0.75 * Math.min(1, amb) * (m < 0.5 ? 0.45 : 1); key.intensity = 1.7 * Math.min(1, 0.08 + 0.92 * m);
    fairy.forEach((b) => b.material.color.setHex(u > 0.5 ? 0xffd27a : 0x2a2420)); pendBulb.material.color.setHex(u > 0.5 ? 0xffe2b0 : 0x2a2420); domeL.material.color.setHex(l > 0.5 ? 0xf4f6ff : 0x2a2a30);
  }
  setPower(1, 1); setSag(0);
  return { root, D, lights, setSag, setPower, up, low, ride, slab, vend, winU, winL, sky };
}
