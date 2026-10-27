// SET: an office-building elevator seen from the lobby through its open doors (film cheat: no front wall, the steel door
// leaves are slid aside into the lobby wall). Brushed-steel walls, a wood dado + handrails, a lit ceiling, a floor display
// over the back wall (setFloor), a button panel, an inspection certificate (capacity), a lobby with marble floor + a plant.
// Built for video 022. Coordinates (meters, y up): car x∈[-1.1, 1.1], z∈[-0.9, 0.9], ceiling 2.5; the opening faces +z
// (lobby z > 0.9). People ride facing +z (toward the lens). DIMS.spots = six standing spots, back to front.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { w: 2.2, d: 1.8, h: 2.5, front: 0.9, spots: [[0, -0.5], [-0.72, -0.55], [0.72, -0.5], [-0.62, 0.3], [0.64, 0.32], [0.05, 0.42]] };

function steelTex(base = '#b8bdc4') {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(5);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '40,45,52'},${0.03 + R() * 0.05})`; g.fillRect(R() * w, 0, 1 + R() * 2, h); }
    g.fillStyle = 'rgba(40,45,52,.35)'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
  });
}

export function buildElevator(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const { w: W, d: Dp, h: Hh } = DIMS, z0 = -Dp / 2, z1 = DIMS.front;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const steel = new THREE.MeshStandardMaterial({ map: steelTex(), roughness: 0.35, metalness: 0.55 });
  const wood = mat(0x7d4a2a, 0.5), brass = mat(0xc9a25a, 0.3, { metalness: 0.8 });

  // floor (dark checker), ceiling with light panels
  const tile = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#3a3a3e' : '#2a2a2e'; g.fillRect(x * 64, y * 64, 64, 64); } }, [2, 2]);
  const fl = mk(new THREE.PlaneGeometry(W, Dp), new THREE.MeshStandardMaterial({ map: tile, roughness: 0.4 }), root, 0, 0.002, 0); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
  box(W, 0.06, Dp, mat(0xf2efe8, 0.9), 0, Hh + 0.03, 0);
  const lightM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff6e4).multiplyScalar(1.05), toneMapped: false });
  for (const x of [-0.55, 0, 0.55]) for (const z of [-0.45, 0.35]) box(0.36, 0.01, 0.36, lightM, x, Hh - 0.005, z);
  // walls: back + sides in brushed steel over a wood dado, brass handrails
  box(W, Hh, 0.05, steel, 0, Hh / 2, z0 - 0.025);
  for (const s of [-1, 1]) box(0.05, Hh, Dp, steel, s * (W / 2 + 0.025), Hh / 2, 0);
  box(W - 0.02, 0.8, 0.02, wood, 0, 0.45, z0 + 0.012);
  for (const s of [-1, 1]) box(0.02, 0.8, Dp - 0.02, wood, s * (W / 2 - 0.012), 0.45, 0);
  const rail = (x, z, l, rotY) => { const r = mk(new THREE.CylinderGeometry(0.022, 0.022, l, 10), brass, root, x, 0.92, z); r.rotation.z = Math.PI / 2; r.rotation.y = rotY; };
  rail(0, z0 + 0.07, W - 0.3, 0); for (const s of [-1, 1]) rail(s * (W / 2 - 0.07), 0, Dp - 0.4, Math.PI / 2);
  // floor display over the back wall
  const dispC = document.createElement('canvas'); dispC.width = 256; dispC.height = 96;
  const dispT = new THREE.CanvasTexture(dispC); dispT.colorSpace = THREE.SRGBColorSpace;
  const disp = box(0.5, 0.19, 0.03, [mat(0x111111, 0.5), mat(0x111111, 0.5), mat(0x111111, 0.5), mat(0x111111, 0.5), new THREE.MeshBasicMaterial({ map: dispT, toneMapped: false }), mat(0x111111, 0.5)], 0, Hh - 0.25, z0 + 0.02);
  void disp;
  function setFloor(n, up = true) {
    const g = dispC.getContext('2d'); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 256, 96);
    g.fillStyle = '#ff7a3a'; g.font = 'bold 70px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(`${up ? '▲' : '▼'} ${n}`, 128, 52); dispT.needsUpdate = true;
  }
  setFloor(12);
  // button panel (right wall, near the front) + inspection certificate (left wall)
  const panel = new THREE.Group(); panel.position.set(W / 2 - 0.03, 1.2, 0.55); panel.rotation.y = -Math.PI / 2; root.add(panel);
  mk(new RoundedBoxGeometry(0.28, 0.62, 0.02, 2, 0.008), mat(0xd8dce0, 0.25, { metalness: 0.7 }), panel);
  const bOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb341).multiplyScalar(1.4), toneMapped: false }), bOff = mat(0xe8e8e8, 0.3);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 2; c++) { const b = mk(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 16), r === 2 && c === 0 ? bOn : bOff, panel, -0.06 + c * 0.12, 0.24 - r * 0.075, 0.012); b.rotation.x = Math.PI / 2; }
  const cert = mk(new THREE.PlaneGeometry(0.24, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(240, 300, (g, w, h) => {
    g.fillStyle = '#f4f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a2a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.font = 'bold 20px Georgia, serif'; g.fillText('CERTIFICATE', w / 2, 50); g.fillText('OF INSPECTION', w / 2, 76);
    g.font = '17px Georgia, serif'; g.fillText('CAPACITY', w / 2, 130); g.font = 'bold 30px Georgia, serif'; g.fillText('1,600 KG', w / 2, 168); g.font = '17px Georgia, serif'; g.fillText('21 PERSONS', w / 2, 198);
    g.fillStyle = '#c9a25a'; g.beginPath(); g.arc(w / 2, 250, 22, 0, 7); g.fill();
  }) }), root, -W / 2 + 0.003, 1.5, 0.5); cert.rotation.y = Math.PI / 2;
  // lobby: marble floor, the wall around the opening, slid-open door leaves, a plant, a wall sconce
  const marble = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#e6e1d8'; g.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(120,110,100,${0.08 + R() * 0.1})`; g.lineWidth = 1 + R() * 2; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 120; y += (R() - 0.3) * 90; g.lineTo(x, y); } g.stroke(); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } }, [3, 3]);
  const lob = mk(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({ map: marble, roughness: 0.25 }), root, 0, 0, z1 + 4); lob.rotation.x = -Math.PI / 2; lob.castShadow = false;
  const lobbyWall = mat(0xd9cdb8, 0.85);
  for (const s of [-1, 1]) { box(4.5, 3.2, 0.2, lobbyWall, s * (W / 2 + 0.25 + 2.25), 1.6, z1 + 0.1); box(0.5, 3.2, 0.2, steel, s * (W / 2 + 0.25), 1.6, z1 + 0.1); }
  box(W + 1.0, 0.7, 0.2, lobbyWall, 0, Hh + 0.35, z1 + 0.1);
  const leaves = [-1, 1].map((s) => box(W / 2, Hh, 0.04, steel, s * (W / 2 + W / 4 + 0.05), Hh / 2, z1 + 0.24));
  const pot = new THREE.Group(); pot.position.set(1.9, 0, z1 + 0.7); root.add(pot);
  mk(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 16), mat(0x2a2d31, 0.5), pot, 0, 0.225, 0);
  const leafM = mat(0x3f7a3a, 0.7); const R = rng(9);
  for (let i = 0; i < 14; i++) { const l = mk(new THREE.SphereGeometry(0.16, 8, 6), leafM, pot, (R() - 0.5) * 0.4, 0.6 + R() * 0.9, (R() - 0.5) * 0.4); l.scale.set(0.5, 1.6, 0.3); l.rotation.set(R() - 0.5, R() * 3, (R() - 0.5) * 1.2); }
  // lights: car ceiling (warm), lobby key from the front (faces), hemi
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x6a5a4a, 0.55); root.add(hemi);
  const ceil = new THREE.PointLight(0xfff0dc, 4.5, 5, 1.6); ceil.position.set(0, Hh - 0.25, 0); root.add(ceil);
  const key = new THREE.SpotLight(0xfff2e0, 22, 0, 0.6, 0.5, 1.5); key.position.set(0.8, 2.6, 3.4); key.target.position.set(0, 1.1, -0.2); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
  return { root, D: DIMS, setFloor, leaves, lights: { hemi, ceil, key } };
}
