// iso style (060): the classic ISOMETRIC ROOM — a floor slab with two walls (back −z and left −x), cut so their thickness shows,
// floating like a dollhouse slice. Windows are real openings (the wall is built from boxes around them) with a view card behind.
//   const R = makeRoom({ w: 6, d: 6, h: 3, wall: 0xf2e3c8, wall2, floor: 'wood'|'tile'|'carpet'|'terrazzo', floorColor,
//                        windows: [{ side: 'back'|'left', at: 1.2, y: 1.0, w: 1.4, h: 1.2, view: 'night'|'day' }] })
//   scene.add(R.g); furniture goes in R.g (floor top at y = 0, the room spans x −w/2…w/2, z −d/2…d/2)
//   R.views[i].material.map … swap a window's view; R.slab, R.walls.{back,left}
//   isoDesk(), isoBed(), isoChair(), isoShelf(), isoRug(), isoPoster(tex, w, h), isoDeskLamp() — matching furniture
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng } from '../core.js';

const M = (c, r = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...extra });
const add = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };

export function floorTexture(kind = 'wood', { color, seed = 1, w = 6, d = 6 } = {}) {
  const R = rng(seed);
  if (kind === 'tile') return tex(256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? (color ?? '#e9e2d4') : '#c9b9a0'; g.fillRect(i * 64, j * 64, 64, 64); } }, [w / 2, d / 2]);
  if (kind === 'terrazzo') return tex(256, 256, (g) => { g.fillStyle = color ?? '#e8dfd0'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 500; i++) { g.fillStyle = ['#b9a98f', '#9c8f7a', '#d9b48f', '#7d7468'][Math.floor(R() * 4)]; g.fillRect(R() * 256, R() * 256, 2 + R() * 4, 2 + R() * 3); } }, [w / 3, d / 3]);
  if (kind === 'carpet') return tex(128, 128, (g) => { g.fillStyle = color ?? '#6f8fb3'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},.06)`; g.fillRect(R() * 128, R() * 128, 2, 2); } }, [w / 2, d / 2]);
  return tex(512, 512, (g) => {   // wood planks
    const base = new THREE.Color(color ?? '#c08a58');
    for (let i = 0; i < 8; i++) {
      const c = base.clone().offsetHSL(0, 0, (R() - 0.5) * 0.08); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, i * 64, 512, 64);
      g.fillStyle = 'rgba(60,35,20,.35)'; g.fillRect(0, i * 64, 512, 2); const off = R() * 512; g.fillRect(off, i * 64, 2, 64);
      for (let k = 0; k < 14; k++) { g.fillStyle = 'rgba(80,50,30,.10)'; g.fillRect(R() * 512, i * 64 + 8 + R() * 48, 40 + R() * 90, 1.5); }
    }
  }, [w / 3, d / 3]);
}

export function viewTexture(kind = 'night') {
  return tex(256, 256, (g, w, h) => {
    if (kind === 'night') {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0f1840'); gr.addColorStop(1, '#2c3f7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const R = rng(4); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.7, 2, 2); }
      g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(w * 0.72, h * 0.28, 22, 0, 7); g.fill(); g.fillStyle = '#16204d'; g.beginPath(); g.arc(w * 0.66, h * 0.25, 20, 0, 7); g.fill();
      g.fillStyle = '#1a2240'; for (let i = 0; i < 9; i++) { const bw = 20 + R() * 30, bh = 30 + R() * 70; g.fillRect(i * 30 - 10, h - bh, bw, bh); }
      g.fillStyle = '#ffd77a'; for (let i = 0; i < 26; i++) g.fillRect(R() * w, h - R() * 70, 4, 5);
    } else {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fd0f5'); gr.addColorStop(1, '#d9f0fb'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.9)'; for (const [x, y, r] of [[60, 70, 26], [90, 64, 30], [120, 74, 22], [190, 120, 20], [214, 114, 26]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      g.fillStyle = '#7fae6a'; g.fillRect(0, h - 40, w, 40);
    }
  });
}

/** A wall along x (len, height h, thickness th) with rectangular openings [{at (centre x), y (sill), w, h}]. */
function wallWithHoles(len, h, th, holes, mat) {
  const g = new THREE.Group();
  const xs = [-len / 2]; const segs = [];
  const sorted = [...holes].sort((a, b) => a.at - b.at);
  let x0 = -len / 2;
  for (const o of sorted) {
    const a = o.at - o.w / 2, b = o.at + o.w / 2;
    if (a > x0) segs.push([x0, a, 0, h]);
    segs.push([a, b, 0, o.y]); segs.push([a, b, o.y + o.h, h]);
    x0 = b;
  }
  if (x0 < len / 2) segs.push([x0, len / 2, 0, h]);
  for (const [a, b, y0, y1] of segs) if (b - a > 0.001 && y1 - y0 > 0.001) add(g, new THREE.BoxGeometry(b - a, y1 - y0, th), mat, (a + b) / 2, (y0 + y1) / 2, 0);
  void xs;
  return g;
}

export function makeRoom({ w = 6, d = 6, h = 3, th = 0.18, slab = 0.45, wall = 0xf2e3c8, wall2, floor = 'wood', floorColor, windows = [], cut = 0xe9dcc6, seed = 1 } = {}) {
  const g = new THREE.Group();
  const fmap = floorTexture(floor, { color: floorColor, seed, w, d });
  const fl = new THREE.MeshStandardMaterial({ map: fmap, roughness: 0.75 }), cm = M(cut, 0.9), bot = M(0x8a7a66, 1);
  const s = add(g, new RoundedBoxGeometry(w, slab, d, 2, 0.06), [cm, cm, fl, bot, cm, cm], 0, -slab / 2, 0);
  const wm = M(wall, 0.9), wm2 = M(wall2 ?? wall, 0.9), trimM = M(0xffffff, 0.7);
  const back = new THREE.Group(); back.position.set(0, 0, -d / 2 + th / 2); g.add(back);
  back.add(wallWithHoles(w, h, th, windows.filter((o) => o.side !== 'left'), wm));
  const left = new THREE.Group(); left.position.set(-w / 2 + th / 2, 0, 0); left.rotation.y = Math.PI / 2; g.add(left);
  left.add(wallWithHoles(d - th, h, th, windows.filter((o) => o.side === 'left').map((o) => ({ ...o, at: -o.at })), wm2));
  left.position.z = th / 2;
  // skirting + the cut tops of the walls (a lighter cap reads as "sliced")
  add(back, new THREE.BoxGeometry(w, 0.12, th + 0.03), trimM, 0, 0.06, 0.01);
  add(left, new THREE.BoxGeometry(d - th, 0.12, th + 0.03), trimM, 0, 0.06, 0.01);
  add(back, new THREE.BoxGeometry(w, 0.02, th), M(0xfaf6ee, 0.9), 0, h + 0.01, 0);
  add(left, new THREE.BoxGeometry(d - th, 0.02, th), M(0xfaf6ee, 0.9), 0, h + 0.01, 0);
  const views = [];
  for (const o of windows) {
    const parent = o.side === 'left' ? left : back, at = o.side === 'left' ? -o.at : o.at;
    const v = new THREE.Mesh(new THREE.PlaneGeometry(o.w * 1.6, o.h * 1.6), new THREE.MeshBasicMaterial({ map: viewTexture(o.view ?? 'night') }));
    v.position.set(at, o.y + o.h / 2, -th / 2 - 0.4); parent.add(v); views.push(v);
    const fr = M(0xffffff, 0.6);
    add(parent, new THREE.BoxGeometry(o.w + 0.12, 0.08, th + 0.1), fr, at, o.y - 0.02, 0.02);
    add(parent, new THREE.BoxGeometry(o.w + 0.12, 0.06, th + 0.04), fr, at, o.y + o.h + 0.02, 0);
    add(parent, new THREE.BoxGeometry(0.05, o.h, 0.05), fr, at, o.y + o.h / 2, 0);
    add(parent, new THREE.BoxGeometry(o.w, 0.05, 0.05), fr, at, o.y + o.h / 2, 0);
  }
  return { g, slab: s, walls: { back, left }, views, D: { w, d, h, th, slab } };
}

export function isoDesk({ w = 1.3, d = 0.65, h = 0.75, color = 0xb98a5a } = {}) {
  const g = new THREE.Group(), m = M(color, 0.6);
  add(g, new THREE.BoxGeometry(w, 0.05, d), m, 0, h, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, new THREE.BoxGeometry(0.05, h, 0.05), m, sx * (w / 2 - 0.05), h / 2, sz * (d / 2 - 0.05));
  add(g, new THREE.BoxGeometry(0.4, 0.45, d - 0.06), M(0xe9dccb, 0.7), w / 2 - 0.25, h - 0.25, 0);
  return g;
}
export function isoChair({ color = 0x3d7fd6, seatH = 0.42 } = {}) {   // seat top at seatH (rig.js proper seat: y −0.375, footFwd 0.42)
  const g = new THREE.Group(), m = M(color, 0.6), metal = M(0x333333, 0.4);
  add(g, new THREE.BoxGeometry(0.46, 0.08, 0.44), m, 0, seatH - 0.04, 0); add(g, new THREE.BoxGeometry(0.46, 0.5, 0.07), m, 0, seatH + 0.28, -0.2);
  add(g, new THREE.CylinderGeometry(0.03, 0.03, seatH - 0.1, 8), metal, 0, (seatH - 0.08) / 2 + 0.04, 0); add(g, new THREE.CylinderGeometry(0.24, 0.24, 0.04, 10), metal, 0, 0.03, 0);
  return g;
}
export function isoBed({ w = 1.1, L = 2.0, sheet = 0x6a8fd0, pillow = 0xf6f1e6, frame = 0x8a5a3a } = {}) {
  const g = new THREE.Group();
  add(g, new THREE.BoxGeometry(w, 0.3, L), M(frame, 0.7), 0, 0.15, 0);
  add(g, new RoundedBoxGeometry(w - 0.06, 0.2, L - 0.06, 2, 0.06), M(0xf3efe6, 0.9), 0, 0.4, 0);
  add(g, new RoundedBoxGeometry(w + 0.04, 0.12, L * 0.62, 2, 0.05), M(sheet, 0.85), 0, 0.52, L * 0.17);
  add(g, new RoundedBoxGeometry(w * 0.7, 0.14, 0.34, 2, 0.06), M(pillow, 0.9), 0, 0.56, -L / 2 + 0.25);
  add(g, new THREE.BoxGeometry(w, 0.8, 0.08), M(frame, 0.7), 0, 0.4, -L / 2);
  return g;
}
export function isoShelf({ w = 1.2, h = 1.6, books = true, seed = 3 } = {}) {
  const g = new THREE.Group(), m = M(0xe9e0cf, 0.7), R = rng(seed);
  add(g, new THREE.BoxGeometry(w, h, 0.3), m, 0, h / 2, 0);
  for (let i = 1; i < 4; i++) {
    const y = (i * h) / 4;
    add(g, new THREE.BoxGeometry(w - 0.04, 0.03, 0.28), M(0xd6cbb5), 0, y, 0.02);
    if (books) { let x = -w / 2 + 0.08; while (x < w / 2 - 0.12) { const bw = 0.05 + R() * 0.05, bh = 0.18 + R() * 0.12; add(g, new THREE.BoxGeometry(bw, bh, 0.2), M([0xd8342c, 0x3d7fd6, 0xf2c14e, 0x5bb36a, 0x7a5cc7, 0x2b3a55][Math.floor(R() * 6)], 0.7), x + bw / 2, y - h / 4 + 0.02 + bh / 2 + 0.03, 0.05); x += bw + 0.01; } }
  }
  return g;
}
export function isoRug({ w = 2.2, d = 1.5, color = '#d86a4a', color2 = '#f2d7a8' } = {}) {
  const t = tex(256, 180, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); g.strokeStyle = color2; g.lineWidth = 10; g.strokeRect(16, 16, W - 32, H - 32); g.lineWidth = 4; g.strokeRect(34, 34, W - 68, H - 68); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;   // a group, so rug.position.set(x, 0, z) keeps the 12 mm lift (else it z-fights the floor)
}
export function isoPoster(map, w = 0.7, h = 0.9) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: 0.8 })); m.receiveShadow = true; return m;
}
export function isoDeskLamp({ color = 0x2b3a55, light = true, intensity = 2.2 } = {}) {
  const g = new THREE.Group(), m = M(color, 0.5);
  add(g, new THREE.CylinderGeometry(0.1, 0.12, 0.03, 16), m, 0, 0.015, 0);
  const arm = add(g, new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), m, 0.05, 0.22, 0); arm.rotation.z = -0.25;
  const sh = add(g, new THREE.ConeGeometry(0.11, 0.16, 16, 1, true), M(color, 0.5, { side: THREE.DoubleSide }), 0.13, 0.44, 0); sh.rotation.z = 0.6;
  const bulb = add(g, new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c8 }), 0.15, 0.4, 0); bulb.castShadow = false;
  let L = null;
  if (light) { L = new THREE.PointLight(0xffc77a, intensity, 3.5, 1.6); L.position.set(0.18, 0.36, 0); g.add(L); }
  g.userData = { light: L, bulb };
  return g;
}
