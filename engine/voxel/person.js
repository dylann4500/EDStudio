// Voxel style (059): the blocky person. Square 8 × 8 × 8 px head, 8 × 12 × 4 torso, 4 × 12 × 4 arms and legs (32 px tall),
// every face painted from ONE 64 × 64 pixel "skin" canvas (NEAREST: crisp pixels, our own outfits and faces). Arms and legs are
// two blocks each (elbow / knee) so people can hold a phone, sit or crouch; at bend 0 they read as one straight block.
//   const P = makeVoxPerson({ height: 1.7, skin: 0xe0ac86, hair: 0x2a1c14, hairStyle: 'short', top: 'hoodie', shirt: 0x9a1c25 });
//   scene.add(P.root);
//   P.pose({ x, z, rotY, walk: P.phaseFor(dist), face: 'shock', armR: ARMS.point, head: { yaw: 0.3, pitch: -0.2 } });
//   P.hand.R.add(prop)            // a group at the bottom of each forearm (the palm), local y down the arm
// Conventions: the figure faces +z. armL / legL = its LEFT (+x side), armR / legR = its right (−x). Arm x < 0 swings forward,
// z > 0 raises it outward (both sides), bend < 0 lifts the forearm. Head pitch > 0 looks down, yaw > 0 turns to its left.
import * as THREE from 'three';
import { boxModel } from './vox.js';
import { shade, hex } from './tex.js';

const S = 64;                                   // skin canvas size (px)
// skin layout: [u, v, w, h, d] per part (a standard box unwrap)
const LAY = { head: [0, 0, 8, 8, 8], torso: [16, 16, 8, 12, 4], armR: [40, 16, 4, 12, 4], armL: [32, 48, 4, 12, 4], legR: [0, 16, 4, 12, 4], legL: [16, 48, 4, 12, 4] };
const rects = ([u, v, w, h, d]) => ({
  top: [u + d, v, w, d], bottom: [u + d + w, v, w, d],
  nx: [u, v + d, d, h], front: [u + d, v + d, w, h], px: [u + d + w, v + d, d, h], back: [u + 2 * d + w, v + d, w, h],
});

// faces as in vox.js: U = canvas left→right, V = canvas bottom→top, U × V = outward normal
const BF = [
  { k: 'px', n: [1, 0, 0], U: [0, 0, -1], V: [0, 1, 0] }, { k: 'nx', n: [-1, 0, 0], U: [0, 0, 1], V: [0, 1, 0] },
  { k: 'top', n: [0, 1, 0], U: [1, 0, 0], V: [0, 0, -1] }, { k: 'bottom', n: [0, -1, 0], U: [1, 0, 0], V: [0, 0, 1] },
  { k: 'front', n: [0, 0, 1], U: [1, 0, 0], V: [0, 1, 0] }, { k: 'back', n: [0, 0, -1], U: [-1, 0, 0], V: [0, 1, 0] },
];
/** box geometry w × h × d (px units × px size) spanning y ∈ [y0, y0 + h], centred in x/z, UVs from the skin rects.
 *  rows = [r0, r1]: use only rows r0..r1 of the side rects (the upper / lower half of a limb). */
function skinBox(part, px, y0, rows = null, inflate = 0) {
  const L = LAY[part], [, , w, h0, d] = L, R = rects(L);
  const h = rows ? rows[1] - rows[0] : h0;
  const pos = [], nor = [], uv = [], idx = [];
  const half = [(w / 2 + inflate) * px, (h / 2 + inflate) * px, (d / 2 + inflate) * px], cen = [0, (y0 + h / 2) * px, 0];
  for (const F of BF) {
    let [rx, ry, rw, rh] = R[F.k];
    if (rows && (F.k !== 'top' && F.k !== 'bottom')) { ry += rows[0]; rh = rows[1] - rows[0]; }
    const base = pos.length / 3;
    for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      const c = [0, 1, 2].map((a) => cen[a] + (F.n[a] + F.U[a] * (2 * u - 1) + F.V[a] * (2 * v - 1)) * half[a]);
      pos.push(...c); nor.push(...F.n);
      uv.push((rx + u * rw) / S, 1 - (ry + (1 - v) * rh) / S);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}

// ---------------------------------------------------------------- painting the skin
function R(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function fillN(g, c, x, y, w, h, seed, amt = 0.06, n = 0.35) {
  const r = R(seed); g.fillStyle = hex(c); g.fillRect(x, y, w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (r() < n) { g.fillStyle = hex(shade(c, (r() - 0.5) * 2 * amt)); g.fillRect(x + i, y + j, 1, 1); }
}
const P1 = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = typeof c === 'number' ? hex(c) : c; g.fillRect(x, y, w, h); };

export const FACES = ['idle', 'blink', 'happy', 'grin', 'shock', 'scream', 'worried', 'angry', 'talk', 'smirk', 'wow', 'sleepy'];

function paintFace(g, o, face) {
  const [fx, fy] = rects(LAY.head).front;                 // 8 × 8 at (8, 8)
  const sk = o.skin, dk = shade(sk, -0.32), mouth = shade(sk, -0.5), white = 0xf7f7f2, iris = o.eyes ?? 0x3b2a20;
  fillN(g, sk, fx, fy, 8, 8, 11, 0.04, 0.25);
  // hair fringe (rows 0–1) per style
  const H = o.hair;
  if (o.hairStyle !== 'bald') {
    P1(g, H, fx, fy, 8, 1);
    if (o.hairStyle === 'long' || o.hairStyle === 'bob') { P1(g, H, fx, fy + 1, 8, 1); P1(g, H, fx, fy + 2, 1, 4); P1(g, H, fx + 7, fy + 2, 1, 4); P1(g, sk, fx + 3, fy + 1, 2, 1); }
    else if (o.hairStyle === 'spiky' || o.hairStyle === 'messy') { P1(g, H, fx, fy + 1, 3, 1); P1(g, H, fx + 4, fy + 1, 2, 1); P1(g, H, fx + 7, fy + 1, 1, 1); }
    else if (o.hairStyle === 'cap') { /* the cap box covers the top */ P1(g, H, fx, fy + 1, 1, 1); P1(g, H, fx + 7, fy + 1, 1, 1); }
    else if (o.hairStyle !== 'buzz') { P1(g, H, fx, fy + 1, 2, 1); P1(g, H, fx + 6, fy + 1, 2, 1); }
  }
  if (o.hairStyle === 'bald' || o.hairStyle === 'buzz') P1(g, shade(sk, -0.08), fx, fy, 8, 1);
  // brows (row 2/3) + eyes (row 4) + nose (row 5) + mouth (row 6–7)
  const br = shade(H, o.hairStyle === 'bald' ? -0.2 : 0.05);
  const eyes = (open = 1) => {
    if (open === 0) { P1(g, dk, fx + 1, fy + 4, 2, 1); P1(g, dk, fx + 5, fy + 4, 2, 1); return; }
    P1(g, white, fx + 1, fy + 4, 1, 1); P1(g, iris, fx + 2, fy + 4, 1, 1); P1(g, iris, fx + 5, fy + 4, 1, 1); P1(g, white, fx + 6, fy + 4, 1, 1);
  };
  const brows = (kind) => {
    if (kind === 'up') { P1(g, br, fx + 1, fy + 2, 2, 1); P1(g, br, fx + 5, fy + 2, 2, 1); }
    else if (kind === 'angry') { P1(g, br, fx + 1, fy + 2, 1, 1); P1(g, br, fx + 2, fy + 3, 1, 1); P1(g, br, fx + 6, fy + 2, 1, 1); P1(g, br, fx + 5, fy + 3, 1, 1); }
    else if (kind === 'worried') { P1(g, br, fx + 2, fy + 2, 1, 1); P1(g, br, fx + 1, fy + 3, 1, 1); P1(g, br, fx + 5, fy + 2, 1, 1); P1(g, br, fx + 6, fy + 3, 1, 1); }
    else { P1(g, br, fx + 1, fy + 3, 2, 1); P1(g, br, fx + 5, fy + 3, 2, 1); }
  };
  P1(g, shade(sk, -0.12), fx + 3, fy + 5, 2, 1);                                                    // nose shadow
  switch (face) {
    case 'blink': brows(); eyes(0); P1(g, mouth, fx + 3, fy + 6, 2, 1); break;
    case 'sleepy': eyes(0); P1(g, mouth, fx + 3, fy + 6, 2, 1); break;
    case 'happy': brows('up'); eyes(1); P1(g, mouth, fx + 2, fy + 6, 4, 1); P1(g, mouth, fx + 1, fy + 5, 1, 1); P1(g, mouth, fx + 6, fy + 5, 1, 1); break;
    case 'grin': brows('up'); eyes(1); P1(g, mouth, fx + 1, fy + 5, 6, 3); P1(g, 0xffffff, fx + 2, fy + 6, 4, 1); P1(g, sk, fx + 1, fy + 7, 1, 1); P1(g, sk, fx + 6, fy + 7, 1, 1); break;
    case 'shock': brows('up'); P1(g, white, fx + 1, fy + 3, 2, 2); P1(g, white, fx + 5, fy + 3, 2, 2); P1(g, iris, fx + 2, fy + 4, 1, 1); P1(g, iris, fx + 5, fy + 4, 1, 1);
      P1(g, mouth, fx + 3, fy + 6, 2, 2); break;
    case 'scream': brows('worried'); P1(g, white, fx + 1, fy + 3, 2, 2); P1(g, white, fx + 5, fy + 3, 2, 2); P1(g, iris, fx + 2, fy + 3, 1, 1); P1(g, iris, fx + 5, fy + 3, 1, 1);
      P1(g, mouth, fx + 2, fy + 5, 4, 3); P1(g, 0xc84b55, fx + 3, fy + 7, 2, 1); break;
    case 'wow': brows('up'); eyes(1); P1(g, mouth, fx + 3, fy + 6, 2, 2); break;
    case 'worried': brows('worried'); eyes(1); P1(g, mouth, fx + 2, fy + 6, 4, 1); P1(g, mouth, fx + 1, fy + 7, 1, 1); P1(g, mouth, fx + 6, fy + 7, 1, 1); break;
    case 'angry': brows('angry'); eyes(1); P1(g, mouth, fx + 2, fy + 6, 4, 1); break;
    case 'talk': brows(); eyes(1); P1(g, mouth, fx + 2, fy + 6, 4, 2); P1(g, 0xc84b55, fx + 3, fy + 7, 2, 1); break;
    case 'smirk': brows(); eyes(1); P1(g, mouth, fx + 3, fy + 6, 3, 1); P1(g, mouth, fx + 6, fy + 5, 1, 1); break;
    default: brows(); eyes(1); P1(g, mouth, fx + 3, fy + 6, 2, 1);
  }
  if (o.glasses) { const gc = o.glasses === true ? 0x1e1e22 : o.glasses; P1(g, gc, fx, fy + 4, 1, 1); P1(g, gc, fx + 3, fy + 4, 2, 1); P1(g, gc, fx + 7, fy + 4, 1, 1); P1(g, gc, fx + 1, fy + 3, 2, 1); P1(g, gc, fx + 5, fy + 3, 2, 1); P1(g, gc, fx + 1, fy + 5, 2, 1); P1(g, gc, fx + 5, fy + 5, 2, 1); }
  if (o.beard) { P1(g, o.beard, fx, fy + 5, 1, 3); P1(g, o.beard, fx + 7, fy + 5, 1, 3); P1(g, o.beard, fx + 1, fy + 7, 6, 1); if (face !== 'shock' && face !== 'scream' && face !== 'grin') P1(g, o.beard, fx + 2, fy + 5, 4, 1); }
  if (o.blush) { P1(g, shade(0xf08a8a, 0.1), fx + 1, fy + 5, 1, 1); P1(g, shade(0xf08a8a, 0.1), fx + 6, fy + 5, 1, 1); }
}

function paintHead(g, o) {
  const R0 = rects(LAY.head), sk = o.skin, H = o.hair;
  for (const k of ['nx', 'px', 'back', 'top', 'bottom']) { const [x, y, w, h] = R0[k]; fillN(g, sk, x, y, w, h, 3 + x, 0.04, 0.2); }
  if (o.hairStyle !== 'bald') {
    const [tx, ty] = R0.top; fillN(g, H, tx, ty, 8, 8, 5, 0.1, 0.4);
    const deep = { long: 7, bob: 6, short: 3, spiky: 3, messy: 4, buzz: 1, bun: 4, ponytail: 4, cap: 3, afro: 4 }[o.hairStyle] ?? 3;
    const back = { long: 8, bob: 7, short: 5, spiky: 5, messy: 6, buzz: 2, bun: 6, ponytail: 6, cap: 5, afro: 6 }[o.hairStyle] ?? 5;
    for (const k of ['nx', 'px']) { const [x, y] = R0[k]; fillN(g, H, x, y, 8, deep, 6 + x, 0.1, 0.4); if (deep < 7) { P1(g, H, k === 'nx' ? x + 6 : x, y + deep, 2, 1); } }
    { const [x, y] = R0.back; fillN(g, H, x, y, 8, back, 7, 0.1, 0.4); }
    if (o.hairStyle !== 'long') { for (const k of ['nx', 'px']) { const [x, y] = R0[k]; P1(g, shade(sk, -0.15), k === 'nx' ? x + 3 : x + 4, y + 4, 1, 2); } }   // ears
  }
}

function paintBody(g, o) {
  const top = o.shirt ?? 0x3c6fd8, pants = o.pants ?? 0x34405c, shoes = o.shoes ?? 0xf3f1ec, sk = o.skin;
  const T = rects(LAY.torso);
  for (const k of Object.keys(T)) { const [x, y, w, h] = T[k]; fillN(g, top, x, y, w, h, 20 + x + y, 0.07, 0.35); }
  const [fx, fy] = T.front, [bx, by] = T.back;
  if (o.top === 'hoodie') {
    P1(g, shade(top, -0.2), fx + 2, fy + 7, 4, 3); P1(g, shade(top, -0.3), fx + 2, fy + 7, 4, 1);    // kangaroo pocket
    P1(g, 0xf3f1ec, fx + 3, fy + 1, 1, 3); P1(g, 0xf3f1ec, fx + 4, fy + 1, 1, 2);                    // drawstrings
    P1(g, shade(top, -0.22), fx + 1, fy, 6, 1); P1(g, shade(top, -0.22), bx + 1, by, 6, 3);           // hood
    P1(g, shade(top, -0.14), fx, fy + 11, 8, 1); P1(g, shade(top, -0.14), bx, by + 11, 8, 1);         // waistband
  } else if (o.top === 'shirt') {
    P1(g, 0xffffff, fx + 3, fy, 2, 1); P1(g, shade(top, -0.25), fx + 4, fy + 1, 1, 10); P1(g, shade(top, 0.15), fx + 2, fy, 1, 2); P1(g, shade(top, 0.15), fx + 5, fy, 1, 2);
    if (o.tie) { P1(g, o.tie, fx + 3, fy + 1, 2, 1); P1(g, o.tie, fx + 3, fy + 2, 2, 5); P1(g, shade(o.tie, -0.2), fx + 3, fy + 7, 2, 1); }
  } else if (o.top === 'cardigan') {
    P1(g, o.under ?? 0xf3f1ec, fx + 3, fy, 2, 12); P1(g, shade(top, -0.2), fx + 2, fy, 1, 12); P1(g, shade(top, -0.2), fx + 5, fy, 1, 12);
    P1(g, 0xf2c53d, fx + 1, fy + 4, 1, 1); P1(g, 0xf2c53d, fx + 1, fy + 7, 1, 1);
  } else if (o.top === 'dress') {
    P1(g, shade(top, -0.15), fx, fy + 6, 8, 1);
  } else if (o.top === 'vest') {
    P1(g, o.under ?? 0xf3f1ec, fx + 2, fy, 4, 5); P1(g, o.under ?? 0xf3f1ec, fx + 3, fy + 5, 2, 2);
  } else {                                                   // tee: a collar + a logo stripe
    P1(g, shade(top, -0.25), fx + 2, fy, 4, 1); P1(g, shade(top, -0.25), fx + 3, fy + 1, 2, 1);
    if (o.logo) P1(g, o.logo, fx + 2, fy + 4, 4, 2);
  }
  // arms: sleeves + hands (bottom rows skin), short sleeves show forearms
  for (const part of ['armL', 'armR']) {
    const A = rects(LAY[part]), sleeve = o.sleeves === 'short' ? 4 : 10;
    for (const k of ['nx', 'px', 'front', 'back']) { const [x, y, w, h] = A[k]; fillN(g, top, x, y, w, sleeve, 30 + x, 0.07, 0.35); fillN(g, sk, x, y + sleeve, w, h - sleeve, 31 + x, 0.04, 0.2); if (o.top === 'hoodie' && sleeve === 10) P1(g, shade(top, -0.18), x, y + 9, w, 1); }
    { const [x, y, w, h] = A.top; fillN(g, top, x, y, w, h, 32, 0.07, 0.35); }
    { const [x, y, w, h] = A.bottom; fillN(g, sk, x, y, w, h, 33, 0.04, 0.2); }
  }
  // legs: pants (or skirt colour), shoes (bottom 2 rows), soles
  for (const part of ['legL', 'legR']) {
    const A = rects(LAY[part]);
    const legC = o.top === 'dress' ? (o.legs ?? sk) : pants;
    for (const k of ['nx', 'px', 'front', 'back']) {
      const [x, y, w, h] = A[k];
      if (o.top === 'dress') { fillN(g, top, x, y, w, 4, 40 + x, 0.07, 0.35); fillN(g, legC, x, y + 4, w, h - 6, 41 + x, 0.04, 0.2); }
      else if (o.shorts) { fillN(g, pants, x, y, w, 5, 42 + x, 0.07, 0.35); fillN(g, sk, x, y + 5, w, h - 7, 43 + x, 0.04, 0.2); }
      else { fillN(g, pants, x, y, w, h - (o.shoeH ?? 3), 44 + x, 0.08, 0.4); P1(g, shade(pants, -0.18), x, y + 5, w, 1); }
      const sh = o.shoeH ?? 3; fillN(g, shoes, x, y + h - sh, w, sh, 45 + x, 0.05, 0.2); P1(g, shade(shoes, -0.35), x, y + h - 1, w, 1); if (sh > 2) P1(g, shade(shoes, -0.12), x, y + h - sh, w, 1);
    }
    { const [x, y, w, h] = A.top; fillN(g, o.top === 'dress' ? top : pants, x, y, w, h, 46, 0.07, 0.35); }
    { const [x, y, w, h] = A.bottom; P1(g, shade(shoes, -0.4), x, y, w, h); }
  }
}

// ---------------------------------------------------------------- arm presets (tested on the template lineup)
export const ARMS = {
  down: { x: 0, z: 0.04, bend: 0 },
  point: { x: -1.5, z: 0.08, bend: 0 },
  pointUp: { x: -2.6, z: 0.15, bend: 0 },
  wave: { x: -0.15, z: 2.55, bend: -0.7 },
  cheer: { x: -0.25, z: 2.75, bend: 0 },
  phone: { x: -1.05, z: -0.32, bend: -0.75 },              // a phone held up in front of the chest/face (use on armR)
  hold: { x: -0.85, z: -0.12, bend: -0.55 },                // carrying something in front (both arms)
  reach: { x: -1.35, z: 0.0, bend: 0 },
  shock: { x: -0.5, z: 0.75, bend: -1.7 },                  // hands up by the face
  shrug: { x: -0.25, z: 0.45, bend: -1.4 },
  hips: { x: 0.15, z: 0.55, bend: -0.9 },
  facepalm: { x: -1.25, z: -0.38, bend: -1.95 },
  megaphone: { x: -1.25, z: -0.28, bend: -1.2 },
};

// ---------------------------------------------------------------- the person
/**
 * opts: height (m, 1.75), skin, hair, hairStyle ('short'|'long'|'bob'|'spiky'|'messy'|'buzz'|'bun'|'ponytail'|'cap'|'afro'|'bald'),
 * eyes (iris colour), top ('tee'|'hoodie'|'shirt'|'cardigan'|'dress'|'vest'), shirt (colour), under, tie, logo, sleeves ('long'|'short'),
 * pants, shorts, shoes, shoeH (px of shoe at the bottom of each leg, 3), legs (bare-leg colour under a dress), glasses (true | colour), beard (colour), blush, cap (colour),
 * backpack (colour), shadows (true).
 */
export function makeVoxPerson(opts = {}) {
  const o = { height: 1.75, skin: 0xe0ac86, hair: 0x3a2618, hairStyle: 'short', top: 'tee', shirt: 0x3c6fd8, pants: 0x34405c, shoes: 0xf3f1ec, ...opts };
  const px = o.height / 32;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = S;
  const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
  paintHead(g, o); paintBody(g, o); paintFace(g, o, 'idle');
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const shadows = o.shadows ?? true;
  const mesh = (geo, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadows; m.receiveShadow = true; parent.add(m); return m; };

  const root = new THREE.Group(); root.name = 'voxPerson';
  const body = new THREE.Group(); body.position.y = 12 * px; root.add(body);                 // hips pivot (lean / twist)
  const torso = mesh(skinBox('torso', px, 0), body);
  const neck = new THREE.Group(); neck.position.y = 12 * px; body.add(neck);
  const head = new THREE.Group(); neck.add(head);
  const headMesh = mesh(skinBox('head', px, 0), head);
  const arms = {}, legs = {}, hand = {}, foot = {};
  for (const [side, part, sx] of [['L', 'armL', 1], ['R', 'armR', -1]]) {
    const up = new THREE.Group(); up.position.set(sx * 6 * px, 10 * px, 0); body.add(up);          // shoulder pivot, 2 px below the top
    mesh(skinBox(part, px, -4, [0, 6]), up);
    const lo = new THREE.Group(); lo.position.y = -4 * px; up.add(lo);                            // elbow
    mesh(skinBox(part, px, -6, [6, 12]), lo);
    const h = new THREE.Group(); h.position.y = -6 * px; lo.add(h);                              // palm (props go here)
    arms[side] = { up, lo, side: sx }; hand[side] = h;
  }
  for (const [side, part, sx] of [['L', 'legL', 1], ['R', 'legR', -1]]) {
    const up = new THREE.Group(); up.position.set(sx * 2 * px, 12 * px, 0); root.add(up);
    mesh(skinBox(part, px, -6, [0, 6]), up);
    const lo = new THREE.Group(); lo.position.y = -6 * px; up.add(lo);
    mesh(skinBox(part, px, -6, [6, 12]), lo);
    const f = new THREE.Group(); f.position.y = -6 * px; lo.add(f);
    legs[side] = { up, lo, side: sx }; foot[side] = f;
  }
  // hair volume + accessories as colour voxels at the person's pixel size
  const addModel = (boxes, parent, dx = 0, dy = 0, dz = 0) => { const m = boxModel(boxes, { bs: px, ao: false }); m.position.set(dx, dy, dz); m.traverse((q) => { if (q.isMesh) { q.castShadow = shadows; } }); parent.add(m); return m; };
  const H = o.hair;
  if (o.hairStyle === 'bun') addModel([[-2, 8, -5, 1, 10, -2, H]], head);
  if (o.hairStyle === 'ponytail') addModel([[-1, 4, -5, 0, 7, -5, H], [-1, 2, -6, 0, 5, -6, H]], head);
  if (o.hairStyle === 'afro') addModel([[-5, 5, -5, 4, 9, 4, H]], head);
  if (o.hairStyle === 'spiky') addModel([[-4, 8, -4, -3, 8, 3, H], [-1, 8, -4, 0, 9, 1, H], [2, 8, -3, 3, 8, 2, H]], head);
  if (o.hairStyle === 'long') addModel([[-4, -2, -5, 3, 7, -5, H]], head);
  if (o.hairStyle === 'cap' || o.cap) { const c = o.cap ?? 0xd8413a; addModel([[-5, 7, -5, 4, 8, 4, c], [-5, 7, 4, 4, 7, 6, shade(c, -0.15)]], head); }
  if (o.backpack) addModel([[-4, 1, -6, 3, 10, -3, o.backpack], [-3, 2, -7, 2, 6, -7, shade(o.backpack, -0.18)], [-4, 10, -4, -3, 11, -3, shade(o.backpack, -0.25)], [2, 10, -4, 3, 11, -3, shade(o.backpack, -0.25)]], body);

  let face = 'idle';
  function setFace(f) { if (f === face) return; face = f; paintFace(g, o, f); tex.needsUpdate = true; }

  /** pose: x, y, z, rotY, walk (phase, rad), stride (0.62), bob, lean, twist, side (lean sideways), head {yaw, pitch, roll},
   *  armL/armR {x, z, y, bend} (or a preset name), legL/legR {x, z, bend}, crouch (0..1), face, scale */
  function pose(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0); root.rotation.set(0, p.rotY ?? 0, 0);
    if (p.scale !== undefined) root.scale.setScalar(p.scale);
    const st = p.stride ?? 0.62, ph = p.walk;
    const walking = ph !== undefined && ph !== null;
    const sw = walking ? Math.sin(ph) : 0;
    body.rotation.set(p.lean ?? 0, p.twist ?? 0, p.side ?? 0);
    const crouch = p.crouch ?? 0;
    body.position.y = (12 - 3.2 * crouch) * px + (walking ? Math.abs(Math.cos(ph)) * 0.35 * px * (st / 0.62) : 0) + (p.bob ?? 0);
    neck.rotation.set(0, 0, 0);
    head.rotation.set(p.head?.pitch ?? 0, p.head?.yaw ?? 0, p.head?.roll ?? 0, 'YXZ');
    const arm = (side, a, swing) => {
      const A = arms[side]; a = typeof a === 'string' ? ARMS[a] : a;
      const ax = a?.x ?? swing, az = (a?.z ?? 0.04) * A.side, ay = (a?.y ?? 0) * A.side;
      A.up.rotation.set(ax, ay, az); A.lo.rotation.set(a?.bend ?? (walking ? -0.12 - 0.12 * Math.abs(swing) : 0), 0, 0);
    };
    arm('L', p.armL, -sw * st * 0.85); arm('R', p.armR, sw * st * 0.85);
    const leg = (side, l, swing) => {
      const L = legs[side]; const lx = l?.x ?? swing - 0.9 * crouch;
      L.up.position.y = (12 - 3.2 * crouch) * px; L.up.rotation.set(lx, 0, (l?.z ?? 0) * L.side);
      const knee = l?.bend ?? (walking ? Math.max(0, -Math.sin((side === 'L' ? ph : ph + Math.PI) - 0.6)) * 0.55 * (st / 0.62) : 0) + 1.8 * crouch;
      L.lo.rotation.set(knee, 0, 0);
    };
    leg('L', p.legL, sw * st); leg('R', p.legR, -sw * st);
    if (p.face) setFace(p.face);
  }
  /** gait phase for a walked distance (m): one full cycle = two steps */
  const phaseFor = (dist, s = 1) => (dist / (2 * 12 * px * s * Math.sin(0.62) * 2)) * Math.PI * 2;
  const _v = new THREE.Vector3();
  /** world position of a point in head space (px units from the neck): eyes = eyeWorld() */
  function eyeWorld(out = new THREE.Vector3(), fwd = 4.6) { root.updateMatrixWorld(true); return head.localToWorld(out.set(0, 4.4 * px, fwd * px)); }
  function handWorld(side, out = new THREE.Vector3()) { root.updateMatrixWorld(true); return hand[side].getWorldPosition(out); }
  /** a point in the fist (px along the forearm from the elbow: −4.5 = the fist's centre; fwd = px toward the forearm's +z face) */
  function gripWorld(side, along = -4.5, fwd = 0, out = new THREE.Vector3()) { root.updateMatrixWorld(true); return arms[side].lo.localToWorld(out.set(0, along * px, fwd * px)); }
  pose({});
  return { root, body, torso, neck, head, headMesh, arms, legs, hand, foot, px, height: o.height, opts: o, canvas, tex, mat, setFace, pose, phaseFor, eyeWorld, handWorld, gripWorld, get face() { return face; } };
}

/** A few ready outfits for crowds (seeded picks): returns opts for makeVoxPerson. */
const SKINS = [0xf1c8a4, 0xe0ac86, 0xc98e66, 0xa8714d, 0x7d4f33, 0x5c3a26];
const HAIRS = [0x2a1c14, 0x3a2618, 0x6b4325, 0xc89b52, 0x1d1d22, 0x8c4a2a, 0xd9c08a];
const TOPS = [0xd8413a, 0x3c6fd8, 0x56b04a, 0xf2c53d, 0x8a55c9, 0xf08a35, 0xf3f1ec, 0x2a3b6e, 0xf09ab8, 0x3fb8c8, 0x26282c];
const PANTS = [0x34405c, 0x26282c, 0x7d5434, 0x5a6270, 0x2a3b6e, 0xcfc4a8];
const STYLES = ['short', 'long', 'bob', 'spiky', 'messy', 'buzz', 'bun', 'ponytail', 'cap', 'afro'];
export function randomOutfit(seed, extra = {}) {
  let s = (seed * 2654435761) >>> 0 || 1; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); r(); r();
  const pick = (a) => a[Math.floor(r() * a.length)];
  const top = pick(['tee', 'tee', 'hoodie', 'shirt', 'dress', 'cardigan']);
  return { skin: pick(SKINS), hair: pick(HAIRS), hairStyle: pick(STYLES), top, shirt: pick(TOPS), pants: pick(PANTS), shoes: pick([0xf3f1ec, 0x26282c, 0xd8413a, 0x7d5434]), sleeves: r() < 0.4 ? 'short' : 'long', cap: undefined, ...extra };
}
