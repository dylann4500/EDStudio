// 051 (Scribe promo): a high-school hallway in the toon/build look (reusable for any school beat).
// Root-local coordinates: the corridor runs along z (floor y 0, ceiling D.h 3.1), walls at x = ±D.halfW (2.3), locker fronts at
// x = ±D.lockerX (1.84), so people walk in |x| < 1.6. Far end wall at z = D.z0 (−18) with bright glass double doors + an EXIT
// sign (a vertical frame loves the depth: shoot from z ≈ +3 looking −z); near end wall at z = D.z1 (+5) for reverse shots.
// Classroom doors cut into the locker rows at D.doors ([side, z]); a trophy case, a water fountain, posters, a VOTE MAYA
// campaign wall, a FINALS WEEK banner, a clock and ceiling light panels.
//   const H = buildHallway(studio, { banner: 'FINALS WEEK · YOU GOT THIS' }); H.root.position.set(...);
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, rng } from '../core.js';
import { tex } from './lighthouse.js';

const PI = Math.PI;
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const HD = { halfW: 2.3, lockerX: 1.84, h: 3.1, z0: -18, z1: 5, doors: [[-1, -4.2], [1, -8.6], [-1, -12.8]], trophy: [1, -2.6], fountain: [-1, 0.9] };

function poster(text, { bg = '#ffffff', fg = '#1d1d1d', sub = '', subFg = '#c1121f', w = 512, h = 640, px = 120, font = '"Luckiest Guy", "Arial Black"' } = {}) {
  return tex(w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg;
    const lines = text.split('\n'); c.font = `${px}px ${font}`;
    lines.forEach((L, i) => c.fillText(L, w / 2, h * 0.38 + (i - (lines.length - 1) / 2) * px * 1.05));
    if (sub) { c.font = `700 ${Math.round(px * 0.42)}px Fredoka, Arial`; c.fillStyle = subFg; c.fillText(sub, w / 2, h * 0.82); }
  });
}

export function buildHallway(studio, { banner = 'FINALS WEEK · YOU GOT THIS', seed = 51 } = {}) {
  const root = new THREE.Group(); studio.scene.add(root);
  const R = rng(seed), D = HD, W = D.halfW, L = D.z1 - D.z0, zc = (D.z0 + D.z1) / 2;
  // floor: glossy cream/grey vinyl tiles + a blue border stripe
  const floorT = tex(512, 512, (c, w, h) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#e9e3d6' : '#d7d2c7'; c.fillRect(i * 128, j * 128, 128, 128); }
    for (let k = 0; k < 900; k++) { c.fillStyle = `rgba(${R() < 0.5 ? '60,60,70' : '255,255,255'},${0.05 + R() * 0.07})`; c.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(k * 128, 0); c.lineTo(k * 128, h); c.stroke(); c.beginPath(); c.moveTo(0, k * 128); c.lineTo(w, k * 128); c.stroke(); }
  });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(2 * W / 1.2, L / 1.2);
  const floor = mk(new THREE.PlaneGeometry(2 * W, L), std(0xffffff, 0.32, { map: floorT, metalness: 0.0 }), root, 0, 0, zc); floor.rotation.x = -PI / 2; floor.castShadow = false; floor.receiveShadow = true;
  for (const s of [-1, 1]) { const st = mk(new THREE.PlaneGeometry(0.16, L), std(0x2f5ea8, 0.4), root, s * 1.5, 0.002, zc); st.rotation.x = -PI / 2; st.castShadow = false; }
  // walls + ceiling
  const wallM = std(0xf1e7d0, 0.9), band = std(0x2f5ea8, 0.7);
  for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.2, D.h, L), wallM, root, s * (W + 0.1), D.h / 2, zc); mk(new THREE.BoxGeometry(0.04, 0.18, L), band, root, s * (W - 0.02), 2.12, zc); }
  mk(new THREE.BoxGeometry(2 * W + 0.4, 0.12, L), std(0xf7f4ec, 0.95), root, 0, D.h + 0.06, zc);
  mk(new THREE.BoxGeometry(2 * W, D.h, 0.2), wallM, root, 0, D.h / 2, D.z1 + 0.1);
  // ceiling light panels (emissive) every 2.4 m
  const panelM = new THREE.MeshBasicMaterial({ color: 0xfffbf0, toneMapped: false });
  for (let z = D.z1 - 1.5; z > D.z0 + 0.5; z -= 2.4) { mk(new THREE.BoxGeometry(1.1, 0.04, 0.55), std(0xbfbab0, 0.6), root, 0, D.h - 0.02, z); mk(new THREE.PlaneGeometry(1.0, 0.46), panelM, root, 0, D.h - 0.045, z).rotation.x = PI / 2; }
  // far wall: glass double doors onto a sunny day + EXIT
  const day = tex(512, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#bfe4ff'); g.addColorStop(0.55, '#eaf6ff'); g.addColorStop(0.56, '#9ccf6a'); g.addColorStop(1, '#7fb552'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(70,120,60,.8)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(30 + i * 60, h * 0.55, 34 + (i % 3) * 10, PI, 0); c.fill(); } });
  const farW = new THREE.Group(); farW.position.set(0, 0, D.z0); root.add(farW);
  mk(new THREE.BoxGeometry(2 * W, D.h, 0.2), wallM, farW, 0, D.h / 2, -0.12);
  const view = mk(new THREE.PlaneGeometry(2.2, 2.3), new THREE.MeshBasicMaterial({ map: day, toneMapped: false }), farW, 0, 1.15, -0.0); view.castShadow = false;
  const frameM = std(0x4a4f57, 0.4, { metalness: 0.5 });
  for (const x of [-1.1, 0, 1.1]) mk(new THREE.BoxGeometry(0.08, 2.3, 0.08), frameM, farW, x, 1.15, 0.03);
  mk(new THREE.BoxGeometry(2.3, 0.08, 0.08), frameM, farW, 0, 2.3, 0.03); for (const x of [-0.55, 0.55]) mk(new THREE.BoxGeometry(0.5, 0.05, 0.05), frameM, farW, x, 1.05, 0.08);
  const exitT = tex(256, 96, (c, w, h) => { c.fillStyle = '#1b1b1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3b30'; c.font = '700 70px Fredoka, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2, h / 2 + 4); });
  mk(new THREE.PlaneGeometry(0.6, 0.22), new THREE.MeshBasicMaterial({ map: exitT, toneMapped: false }), farW, 0, 2.6, 0.02);
  const doorLight = new THREE.PointLight(0xfff4dc, 2.0, 9, 1.6); doorLight.position.set(0, 2.0, D.z0 + 1.2); root.add(doorLight);
  // lockers: instanced, two tones per row, vents + handle + number plate on the door texture
  const lockT = tex(128, 512, (c, w, h) => {
    c.fillStyle = '#f2f2f2'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 5; c.strokeRect(4, 4, w - 8, h - 8);
    c.fillStyle = 'rgba(0,0,0,.45)'; for (let k = 0; k < 5; k++) c.fillRect(26, 34 + k * 14, w - 52, 6);
    c.fillStyle = '#bdbdbd'; c.fillRect(w - 36, h * 0.48, 14, 70); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(w - 36, h * 0.48 + 62, 14, 8);
    c.fillStyle = '#d9d9d9'; c.fillRect(30, 130, 48, 22);
  });
  const lockGeo = new RoundedBoxGeometry(0.4, 1.84, 0.46, 1, 0.02), lockM = std(0xffffff, 0.45, { map: lockT, metalness: 0.15 });
  const spots = [];
  const doorGap = (s, z) => D.doors.some(([ds, dz]) => ds === s && Math.abs(z - dz) < 0.75) || (D.trophy[0] === s && Math.abs(z - D.trophy[1]) < 0.95) || (D.fountain[0] === s && Math.abs(z - D.fountain[1]) < 0.55);
  for (const s of [-1, 1]) for (let z = D.z1 - 0.6; z > D.z0 + 0.4; z -= 0.42) if (!doorGap(s, z)) spots.push([s, z]);
  const lockers = new THREE.InstancedMesh(lockGeo, lockM, spots.length); lockers.castShadow = true; lockers.receiveShadow = true;
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), C = new THREE.Color(), E = new THREE.Euler();
  spots.forEach(([s, z], i) => { M4.compose(V.set(s * (W - 0.23), 0.98, z), Q.setFromEuler(E.set(0, -s * PI / 2, 0)), S); lockers.setMatrixAt(i, M4); lockers.setColorAt(i, C.setHex(s < 0 ? (i % 2 ? 0x3d7fd1 : 0x3672bd) : (i % 2 ? 0xd94a3a : 0xc63f31))); });
  root.add(lockers);
  for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.5, 0.08, L), std(0x5a5f66, 0.6), root, s * (W - 0.25), 0.04, zc); mk(new THREE.BoxGeometry(0.48, 0.06, L), std(0xe4e0d6, 0.7), root, s * (W - 0.24), 1.93, zc); }
  // classroom doors (wood, a narrow window, a room number)
  const doorM = std(0xa8723f, 0.55), frameD = std(0x5a5f66, 0.5);
  D.doors.forEach(([s, z], k) => {
    const g = new THREE.Group(); g.position.set(s * (W - 0.02), 0, z); g.rotation.y = -s * PI / 2; root.add(g);
    mk(new THREE.BoxGeometry(1.1, 2.3, 0.06), frameD, g, 0, 1.15, 0.0);
    mk(new THREE.BoxGeometry(0.94, 2.16, 0.06), doorM, g, 0, 1.08, 0.03);
    mk(new THREE.PlaneGeometry(0.16, 0.6), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, roughness: 0.1, emissive: 0x8fb8d8, emissiveIntensity: 0.4 }), g, -0.24, 1.45, 0.065);
    mk(new THREE.SphereGeometry(0.035, 10, 8), std(0xd9c27a, 0.3, { metalness: 0.7 }), g, 0.36, 1.0, 0.08);
    const n = tex(128, 64, (c, w, h) => { c.fillStyle = '#1d3d6b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '700 40px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(201 + k * 3), w / 2, h / 2 + 2); });
    mk(new THREE.PlaneGeometry(0.26, 0.13), new THREE.MeshBasicMaterial({ map: n }), g, 0, 2.45, 0.04);
  });
  // trophy case (glass front, gold cups on two shelves, lit)
  { const [s, z] = D.trophy, g = new THREE.Group(); g.position.set(s * (W - 0.25), 0, z); g.rotation.y = -s * PI / 2; root.add(g);
    mk(new THREE.BoxGeometry(1.7, 0.9, 0.45), std(0x6e4a2c, 0.6), g, 0, 0.45, 0); mk(new THREE.BoxGeometry(1.7, 1.2, 0.04), std(0x3a2a1c, 0.7), g, 0, 1.5, -0.2);
    const gold = std(0xe0b04a, 0.25, { metalness: 0.85 });
    for (const [x, y, sc] of [[-0.55, 0.92, 1], [-0.15, 0.92, 1.3], [0.3, 0.92, 0.9], [0.62, 0.92, 1.1], [-0.4, 1.42, 0.8], [0.1, 1.42, 1.2], [0.5, 1.42, 0.9]]) {
      const cup = new THREE.Group(); cup.position.set(x, y, 0); cup.scale.setScalar(sc); g.add(cup);
      mk(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 12), gold, cup, 0, 0.02, 0); mk(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8), gold, cup, 0, 0.09, 0); mk(new THREE.CylinderGeometry(0.08, 0.035, 0.12, 14), gold, cup, 0, 0.2, 0);
    }
    mk(new THREE.BoxGeometry(1.7, 0.03, 0.4), std(0xffffff, 0.2, { transparent: true, opacity: 0.5 }), g, 0, 1.37, 0);
    const glass = mk(new THREE.BoxGeometry(1.7, 1.2, 0.02), std(0xdff2ff, 0.05, { transparent: true, opacity: 0.18 }), g, 0, 1.5, 0.22); glass.castShadow = false;
    const tl = new THREE.PointLight(0xfff1c8, 0.8, 2.2, 1.6); tl.position.set(0, 1.9, 0.1); g.add(tl);
  }
  // water fountain
  { const [s, z] = D.fountain, g = new THREE.Group(); g.position.set(s * (W - 0.2), 0, z); g.rotation.y = -s * PI / 2; root.add(g);
    const steel = std(0xc9cdd3, 0.3, { metalness: 0.7 }); mk(new RoundedBoxGeometry(0.55, 0.3, 0.4, 2, 0.04), steel, g, 0, 0.9, 0); mk(new THREE.BoxGeometry(0.3, 0.75, 0.1), steel, g, 0, 0.4, -0.12); }
  // posters above the lockers + the campaign wall (VOTE MAYA) + bulletin board + clock
  const P = [
    ['VOTE\nMAYA', { bg: '#c1121f', fg: '#ffffff', sub: 'CLASS PRESIDENT', subFg: '#ffe66d' }, -1, 1.6], ['VOTE\nMAYA', { bg: '#ffffff', fg: '#c1121f', sub: '★ 0 HOURS LEFT ★', subFg: '#1d3d6b' }, -1, -1.0],
    ['STUDY\nHARD', { bg: '#2f5ea8', fg: '#ffd23f', sub: 'FINALS ARE COMING' }, 1, 0.2], ['MATH\nCLUB', { bg: '#ffd23f', fg: '#1d1d1d', sub: 'TUES 3:30 · RM 204' }, 1, -6.0],
    ['PROM', { bg: '#8e44ad', fg: '#ffffff', sub: 'TICKETS $40', subFg: '#ffe66d', px: 150 }, -1, -7.2], ['GO\nHORNETS', { bg: '#1d1d1d', fg: '#ffd23f', sub: 'BEAT CENTRAL', subFg: '#ffffff' }, 1, -11.2],
    ['VOTE\nMAYA', { bg: '#c1121f', fg: '#ffffff', sub: 'SHE GETS IT DONE', subFg: '#ffe66d' }, -1, -10.0], ['NO\nRUNNING', { bg: '#ffffff', fg: '#c1121f', px: 110 }, 1, -14.6],
  ];
  for (const [txt, o, s, z] of P) { const m = mk(new THREE.PlaneGeometry(0.62, 0.78), std(0xffffff, 0.7, { map: poster(txt, o) }), root, s * (W - 0.005), 2.5, z); m.rotation.y = -s * PI / 2; m.castShadow = false; }
  const bb = mk(new THREE.BoxGeometry(0.05, 0.75, 1.5), std(0xb98a5a, 0.9), root, -(W - 0.02), 2.5, -3.0); bb.castShadow = false;
  for (let k = 0; k < 6; k++) { const m = mk(new THREE.PlaneGeometry(0.28, 0.22), std([0xffffff, 0xffe66d, 0xbfe6ff, 0xffc2d1][k % 4], 0.8), root, -(W - 0.05), 2.32 + (k % 2) * 0.3, -3.55 + Math.floor(k / 2) * 0.48); m.rotation.set(0, PI / 2, (R() - 0.5) * 0.2); m.castShadow = false; }
  const clockT = tex(256, 256, (c, w) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.lineWidth = 12; c.strokeStyle = '#222'; c.stroke(); c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(128, 128); c.lineTo(128, 52); c.stroke(); c.lineWidth = 12; c.beginPath(); c.moveTo(128, 128); c.lineTo(180, 150); c.stroke(); });
  mk(new THREE.CircleGeometry(0.22, 32), std(0xffffff, 0.5, { map: clockT }), root, 0, 2.62, D.z1 - 0.005).rotation.y = PI;
  // the banner across the hall
  const banT = tex(1024, 192, (c, w, h) => { c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h); c.fillStyle = '#c1121f'; c.fillRect(0, 0, w, 16); c.fillRect(0, h - 16, w, 16); c.fillStyle = '#1d1d1d'; let px = 110; c.font = `${px}px "Luckiest Guy", "Arial Black"`; while (c.measureText(banner).width > w - 80 && px > 40) { px -= 4; c.font = `${px}px "Luckiest Guy", "Arial Black"`; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(banner, w / 2, h / 2 + 6); });   // fit: canvas text wider than its canvas is clipped
  const ban = mk(new THREE.PlaneGeometry(3.6, 0.62), std(0xffffff, 0.8, { map: banT, side: THREE.DoubleSide }), root, 0, 2.62, -6.5); ban.castShadow = false;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), std(0x333333), root, s * 1.7, 2.85, -6.5);
  // a trash can + a backpack on the floor
  mk(new THREE.CylinderGeometry(0.22, 0.19, 0.6, 16), std(0x2f6f4a, 0.6), root, 1.45, 0.3, -5.2);
  mk(new RoundedBoxGeometry(0.34, 0.42, 0.2, 2, 0.06), std(0xff8a3c, 0.7), root, -1.55, 0.21, -2.2).rotation.y = 0.3;
  // lights: bright school daylight (hemi + a soft top key with shadows)
  const hemi = new THREE.HemisphereLight(0xfffaf0, 0x9c907c, 1.25); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff3df, 1.5); key.position.set(1.5, 8, 2); key.target.position.set(0, 0, -3); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 10, bottom: -10, near: 1, far: 30 }); key.shadow.bias = -0.0006; root.add(key, key.target);
  const fillL = new THREE.PointLight(0xfff0dc, 1.2, 10, 1.4); fillL.position.set(0, 2.6, 2.5); root.add(fillL);
  return { root, D, lockers, hemi, key, doorLight };
}
