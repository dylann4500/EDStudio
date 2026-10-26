// SET: a deep basalt gorge spanned by a steel-arch bridge with a bungee platform (in the spirit of the Victoria Falls Bridge,
// 111 m above the Zambezi): dark rock walls with green rims, a rapids river far below (`update(t)` scrolls it), the falls in
// the distance (a white curtain + rising mist + a rainbow), rainforest trees on both rims, afternoon sun. Built for video 017
// (gravity off: a bungee cord at full stretch fires the jumper back up past the bridge).
//
// Coordinates (meters, y up). Deck top y = 0, bridge along x (x∈[-110,110]), deck center z = 0, width 10 (z∈[-5,5]).
// Jump platform at DIMS.jump (x 0, edge z = −5.4, anchor y 0.9). River surface y = DIMS.river (−110). The gorge runs along z;
// the falls are upstream at z ≈ −420. Rims at y = DIMS.rim. Set camera.far ≥ 1200.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
export const DIMS = { river: -110, rim: -3, jump: [0, 0.9, -5.6], deckW: 10 };

export function buildGorge(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 111);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xe8e2d4, 260, 1300);
  const sky = makeSkyDome(0x4a8ad6, 0xf2e8d6, 1400); root.add(sky.mesh);
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 12; i++) { const a = R() * PI * 2, cg = new THREE.Group(); cg.position.set(Math.cos(a) * 950, 170 + R() * 150, Math.sin(a) * 950); root.add(cg); for (let k = 0; k < 5; k++) { const p = mk(new THREE.SphereGeometry(30 + R() * 22, 12, 8), cloudM, cg, (k - 2) * 34, R() * 10, R() * 18); p.scale.y = 0.45; p.castShadow = false; } }

  // plateau (both rims) + gorge walls: stacked slabs stepping inward with depth, dark basalt with strata
  const rockT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(${R() < 0.5 ? '90,80,70' : '30,26,24'},${0.25 + R() * 0.3})`; g.fillRect(0, y, w, 2 + R() * 4); } for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(0,0,0,${R() * 0.15})`; g.fillRect(R() * w, R() * h, 3, 6); } }, [8, 8]);
  const rockM = new THREE.MeshStandardMaterial({ map: rockT, roughness: 0.95 }), rockM2 = new THREE.MeshStandardMaterial({ map: rockT, color: 0xb8a898, roughness: 0.95 });
  const greenM = [mat(0x3f7a3a, 0.95), mat(0x4f8a42, 0.95), mat(0x2f6a34, 0.95)], trunkM = mat(0x5a4632, 0.9);
  for (const s of [-1, 1]) {
    const plat = box(900, 20, 1600, mat(0x8a7a52, 1), s * (72 + 450), DIMS.rim - 10, -200); plat.castShadow = false;
    for (let k = 0; k < 12; k++) {   // wall slabs: from the rim (x≈±72) down to the river (x≈±38)
      const y = DIMS.rim - 4.5 - k * 9.2, x = s * (72 - k * 2.9 + (R() - 0.5) * 2);
      const sl = box(40, 9.6, 1600, k % 2 ? rockM : rockM2, x + s * 20, y, -200); sl.castShadow = false;
    }
    for (let i = 0; i < 70; i++) { const z = -650 + R() * 1000, k = Math.floor(R() * 12), x = s * (72 - k * 2.9 - 1); const l = mk(new THREE.IcosahedronGeometry(1, 0), rockM, root, x, DIMS.rim - 4 - k * 9.2, z); l.scale.set(4 + R() * 4, 3 + R() * 4, 6 + R() * 8); l.rotation.set(R(), R(), R()); l.castShadow = false; }
    for (let i = 0; i < 150; i++) { const z = -700 + R() * 1100, x = s * (78 + R() * 140); if (Math.abs(z) < 12 && Math.abs(x) < 120) continue;
      const g = new THREE.Group(); g.position.set(x, DIMS.rim, z); g.scale.setScalar(0.8 + R() * 1.0); root.add(g); mk(new THREE.CylinderGeometry(0.35, 0.5, 6, 6), trunkM, g, 0, 3, 0);
      for (let k = 0; k < 4; k++) { const b = mk(new THREE.SphereGeometry(3 + R() * 1.5, 8, 6), greenM[(i + k) % 3], g, (R() - 0.5) * 4, 7 + R() * 2, (R() - 0.5) * 4); b.scale.y = 0.75; } }
    for (let i = 0; i < 40; i++) { const z = -650 + R() * 1000, x = s * (73 + R() * 3); const b = mk(new THREE.SphereGeometry(2.5 + R() * 2, 8, 6), greenM[i % 3], root, x, DIMS.rim + 0.5, z); b.scale.y = 0.6; b.castShadow = false; }
  }
  // the river: rapids texture scrolled along the gorge
  const riverT = canvasTex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2f5a5a'); gr.addColorStop(0.5, '#3f7270'); gr.addColorStop(1, '#2f5a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(230,245,245,${0.15 + R() * 0.4})`; g.fillRect(R() * w, R() * h, 2 + R() * 3, 10 + R() * 40); } }, [2, 14]);
  const river = mk(new THREE.PlaneGeometry(90, 1600), new THREE.MeshStandardMaterial({ map: riverT, roughness: 0.3, metalness: 0.1 }), root, 0, DIMS.river, -200); river.rotation.x = -PI / 2; river.castShadow = false;
  // the falls upstream: a wide white curtain + mist sprites + a rainbow
  const fallsT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9eef0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(150,170,180,${R() * 0.35})`; g.fillRect(R() * w, 0, 1 + R() * 3, h); } }, [6, 1]);
  const falls = mk(new THREE.PlaneGeometry(700, 120), new THREE.MeshStandardMaterial({ map: fallsT, roughness: 0.6, emissive: 0x6a7276 }), root, 0, DIMS.river + 55, -440); falls.castShadow = false;
  const mist = makeSpritePool(root, 22, 'smoke'); const mistC = new THREE.Color(0xf4f6f8);
  for (let i = 0; i < 22; i++) mist.set(i, new THREE.Vector3(-280 + i * 26 + R() * 10, DIMS.rim + 10 + R() * 60, -420 + R() * 40), 90 + R() * 60, 0.55, mistC);
  const bowT = canvasTex(512, 256, (g, w, h) => { const cols = ['rgba(255,60,60,.0)', 'rgba(255,80,60,.35)', 'rgba(255,200,60,.35)', 'rgba(80,220,90,.3)', 'rgba(60,120,255,.3)', 'rgba(150,80,255,.25)', 'rgba(150,80,255,.0)']; cols.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.arc(w / 2, h, h - 30 - i * 7, PI, 0); g.stroke(); }); });
  const bow = new THREE.Mesh(new THREE.PlaneGeometry(300, 150), new THREE.MeshBasicMaterial({ map: bowT, transparent: true, depthWrite: false, toneMapped: false, fog: false })); bow.position.set(-60, DIMS.rim - 40, -360); root.add(bow);

  // the bridge: deck + girders + railings + the steel arch with verticals, a bungee platform at mid-span
  const steelM = mat(0x7a8088, 0.5, { metalness: 0.5 }), deckM = mat(0x9a948a, 0.9);
  const deck = new THREE.Group(); root.add(deck);
  box(230, 0.6, DIMS.deckW, deckM, 0, -0.3, 0, deck);
  for (const z of [-4.6, 4.6]) { box(230, 2.4, 0.4, steelM, 0, -1.8, z, deck); box(230, 0.08, 0.08, steelM, 0, 1.05, z + Math.sign(z) * 0.3, deck); box(230, 0.08, 0.08, steelM, 0, 0.55, z + Math.sign(z) * 0.3, deck); }
  for (let x = -114; x <= 114; x += 3) for (const z of [-4.9, 4.9]) box(0.08, 1.1, 0.08, steelM, x, 0.55, z, deck);
  for (const z of [-1.5, 1.5]) box(230, 0.15, 0.2, mat(0x5a4a3a, 0.8), 0, 0.07, z, deck);   // railway lines
  const arch = new THREE.Group(); root.add(arch);
  const span = 56, rise = 57, springY = -62;
  const archY = (x) => springY + rise * (1 - (x / span) ** 2);
  for (const z of [-4.0, 4.0]) for (let i = 0; i < 40; i++) { const x0 = -span + (i / 40) * span * 2, x1 = -span + ((i + 1) / 40) * span * 2, y0 = archY(x0), y1 = archY(x1); const seg = box(Math.hypot(x1 - x0, y1 - y0) + 0.3, 2.6, 1.2, steelM, (x0 + x1) / 2, (y0 + y1) / 2, z, arch); seg.rotation.z = Math.atan2(y1 - y0, x1 - x0); }
  for (let x = -span + 6; x < span; x += 8) { const y = archY(x); if (-2.4 - y > 1) for (const z of [-4.0, 4.0]) box(0.6, -2.4 - y, 0.6, steelM, x, (y - 2.4) / 2, z, arch); }
  for (let i = 0; i < 18; i++) { const x = -span + (i + 0.5) * (span * 2 / 18), y = archY(x); box(0.4, 0.4, 8, steelM, x, y, 0, arch); }
  const plat = new THREE.Group(); plat.position.set(0, 0, -5.1); root.add(plat);
  box(4, 0.3, 1.6, mat(0xc9a25a, 0.7), 0, 0.15, -0.8, plat); box(0.15, 2.2, 0.15, mat(0xd8b46a, 0.6), -1.8, 1.1, -1.5, plat); box(0.15, 2.2, 0.15, mat(0xd8b46a, 0.6), 1.8, 1.1, -1.5, plat);
  const banT = canvasTex(512, 96, (g, w, h) => { g.fillStyle = '#1d2a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.font = 'bold 56px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BUNGEE · 111 m', w / 2, h / 2 + 3); });
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.7), new THREE.MeshStandardMaterial({ map: banT, roughness: 0.6, side: THREE.DoubleSide })); ban.position.set(0, 2.0, -1.5); ban.rotation.y = PI; plat.add(ban);
  function update(t) { riverT.offset.y = -t * 0.08; }

  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x6a5a40, 1.1); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.8); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0005;
  function aimSun(cx = 0, cy = -40, cz = 0, half = 60) { sun.target.position.set(cx, cy, cz); sun.position.set(cx + 70, cy + 180, cz + 90); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 500 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, fog, sky, update, aimSun, deck, arch, plat, archY, lights: { hemi, sun } };
}
