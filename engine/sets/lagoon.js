// SET: an Icelandic geothermal lagoon at night (036, "What if the Sun disappeared?") — milky-blue water that glows from below,
// steam rolling off it, black lava rocks with snow caps round an irregular shore, a snowfield, a lit wooden bar hut + boardwalk,
// lamp posts, a geothermal greenhouse with pink grow lights, a power plant with steam plumes, snowy mountains and a painted
// Milky Way sky. Also exports `nightSkyTexture()` — the same star sky, for any day set whose sky dome should turn to night.
//
// Coordinates (meters, y up). Lagoon centered at the origin, water surface y = DIMS.water (0), floor −1.3 (the water is opaque
// and milky, so only heads + shoulders show). Shore radius DIMS.shore(θ) ≈ 8 m (wider along x). Snow ground y = 0.15.
// Swimmers: rig y = −1.45 (shoulders at the surface), floor = y. Camera low at +z (z ≈ 4…7) looking −z: the hut, greenhouse and
// power plant line up behind the water. update(t) ripples the water + rolls the steam. Camera far ≥ 450 (sky dome r 400).
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSpritePool } from '@engine/sets/tech.js';

const PI = Math.PI;
const shore = (a) => 8.2 * (1 + 0.11 * Math.sin(3 * a + 0.4) + 0.07 * Math.sin(5 * a + 1.3)) * (1 + 0.18 * Math.cos(a) ** 2);
export const DIMS = { water: 0, floor: -1.3, ground: 0.15, shore, hut: [-7.5, -12], greenhouse: [10, -17], plant: [-34, -70] };

/** A painted night sky (equirectangular, 4096×2048): deep blue-black, ~9,000 soft stars, a Milky Way band with dust lanes. */
export function nightSkyTexture(seed = 36) {
  return canvasTex(4096, 2048, (g, w, h) => {
    const R = rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02040b'); gr.addColorStop(0.42, '#060b1c'); gr.addColorStop(0.5, '#0d1630'); gr.addColorStop(1, '#0d1630');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const bandY = (x) => h * 0.27 + h * 0.13 * Math.sin((x / w) * PI * 2 + 0.9);
    // Milky Way glow + grain
    for (let i = 0; i < 1400; i++) { const x = R() * w, y = bandY(x) + (R() - 0.5) * h * 0.09, r = 20 + R() * 60, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${170 + R() * 60},${170 + R() * 50},${210 + R() * 40},0.05)`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 60000; i++) { const x = R() * w, s = (R() + R() + R() - 1.5) * h * 0.07, y = bandY(x) + s; g.fillStyle = `rgba(230,232,255,${0.15 + R() * 0.35})`; g.fillRect(x, y, 1, 1); }
    // dust lanes
    for (let i = 0; i < 500; i++) { const x = R() * w, y = bandY(x) + (R() - 0.45) * h * 0.03, r = 6 + R() * 20, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(4,6,14,0.35)'); rg.addColorStop(1, 'rgba(4,6,14,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    // stars: mostly faint pinpricks, a few bright ones with a soft halo (above the horizon only: y < 0.5 h)
    for (let i = 0; i < 9000; i++) {
      const x = R() * w, y = R() * h * 0.5, b = R() ** 3, r = 0.6 + b * 1.6;
      const c = R() < 0.15 ? '255,214,170' : R() < 0.3 ? '190,210,255' : '255,250,240';
      if (b > 0.5) { const rg = g.createRadialGradient(x, y, 0, x, y, r * 4); rg.addColorStop(0, `rgba(${c},0.35)`); rg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = rg; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8); }
      g.fillStyle = `rgba(${c},${0.35 + b * 0.65})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
  });
}

export function buildLagoon(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 54), D = DIMS;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0x0a1124, 60, 430);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.MeshBasicMaterial({ map: nightSkyTexture(), side: THREE.BackSide, fog: false, toneMapped: false }));
  sky.material.color.setScalar(1.25); root.add(sky);

  // ---------------------------------------------------------------- water: a polar disc a little wider than the shore
  const RINGS = 22, SEG = 96, pos = [], idx = [];
  for (let i = 0; i <= RINGS; i++) for (let j = 0; j < SEG; j++) { const a = (j / SEG) * PI * 2, r = (i / RINGS) * (shore(a) + 0.8); pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
  for (let i = 0; i < RINGS; i++) for (let j = 0; j < SEG; j++) { const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG), c = a + SEG, d = b + SEG; idx.push(a, c, b, b, c, d); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setIndex(idx); wg.computeVertexNormals();
  const rip = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9fdcdc'; g.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(40,120,140,.10)'; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 18, 3 + r() * 6, r() * 3, 0, 7); g.fill(); } }, [6, 6]);
  const waterM = new THREE.MeshLambertMaterial({ map: rip, color: 0x8fd0d4, emissive: 0x1f8590, emissiveIntensity: 0.38, side: THREE.DoubleSide });
  const water = new THREE.Mesh(wg, waterM); water.position.y = D.water; water.receiveShadow = false; root.add(water);
  const base = Float32Array.from(pos);

  // ---------------------------------------------------------------- snow ground with a hole for the lagoon
  const outer = new THREE.Shape(); outer.moveTo(-300, -300); outer.lineTo(300, -300); outer.lineTo(300, 300); outer.lineTo(-300, 300); outer.lineTo(-300, -300);
  const hole = new THREE.Path(); for (let j = 0; j <= SEG; j++) { const a = -(j / SEG) * PI * 2, r = shore(a); j ? hole.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : hole.moveTo(Math.cos(a) * r, -Math.sin(a) * r); }
  outer.holes.push(hole);
  const snowTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#dfe7f2'; g.fillRect(0, 0, w, h); const r = rng(7); for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(160,180,215,.12)' : 'rgba(255,255,255,.25)'; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2); } }, [80, 80]);
  const snowM = new THREE.MeshLambertMaterial({ map: snowTex, color: 0xe8eef8 });
  const ground = new THREE.Mesh(new THREE.ShapeGeometry(outer, 1), snowM); ground.rotation.x = -PI / 2; ground.position.y = D.ground; ground.receiveShadow = true; root.add(ground);
  // the uv of a ShapeGeometry is in meters: rescale it so the snow texture tiles every ~4 m
  { const uv = ground.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 600 + 0.5, uv.getY(i) / 600 + 0.5); }
  const driftM = new THREE.MeshLambertMaterial({ color: 0xeaf0fa });
  for (let i = 0; i < 70; i++) { const a = R() * PI * 2, r = 13 + R() * 60, s = 1.5 + R() * 4; const d = mk(new THREE.SphereGeometry(1, 14, 8), driftM, root, Math.cos(a) * r, D.ground - 0.2, Math.sin(a) * r); d.scale.set(s, 0.35 + R() * 0.5, s * (0.6 + R() * 0.6)); d.castShadow = false; }

  // ---------------------------------------------------------------- lava rocks round the shore (+ snow caps) and a few in the water
  const rockGeo = (seed) => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, r = rng(seed); const k = [r(), r(), r()]; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.22 * Math.sin(x * 3 + k[0] * 9) * Math.cos(y * 2.6 + k[1] * 9) + 0.12 * Math.sin(z * 5 + k[2] * 9); p.setXYZ(i, x * n, y * n, z * n); } g.computeVertexNormals(); return g; };
  const rockGeos = [0, 1, 2, 3, 4].map((s) => rockGeo(40 + s));
  const lavaM = new THREE.MeshStandardMaterial({ color: 0x24221f, roughness: 0.95 }), capM = new THREE.MeshLambertMaterial({ color: 0xf0f4fb });
  const rock = (x, z, s, y = 0.1) => { const g = rockGeos[Math.floor(R() * 5)], m = mk(g, lavaM, root, x, y, z); m.scale.set(s * (0.8 + R() * 0.5), s * (0.45 + R() * 0.3), s * (0.8 + R() * 0.5)); m.rotation.y = R() * 6; const c = mk(g, capM, root, x, y + m.scale.y * 0.55, z); c.scale.set(m.scale.x * 0.82, m.scale.y * 0.35, m.scale.z * 0.82); c.rotation.y = m.rotation.y; c.castShadow = false; return m; };
  for (let j = 0; j < 74; j++) { const a = (j / 74) * PI * 2 + R() * 0.05; if (Math.sin(a) > 0.55 && Math.abs(Math.cos(a)) < 0.5) continue; const r = shore(a) + 0.2 + R() * 0.5; rock(Math.cos(a) * r, Math.sin(a) * r, 0.45 + R() * 0.55); }
  for (let j = 0; j < 40; j++) { const a = R() * PI * 2, r = shore(a) + 1.5 + R() * 9; if (Math.sin(a) > 0.3) continue; rock(Math.cos(a) * r, Math.sin(a) * r, 0.6 + R() * 1.4, 0.0); }
  for (const [x, z, s] of [[-4.6, -2.8, 0.55], [5.2, -3.6, 0.7], [1.2, -5.6, 0.5]]) rock(x, z, s, -0.15);

  // ---------------------------------------------------------------- boardwalk + bar hut (lit windows), lamp posts, sign
  const wood = mat(0x6b4a33, 0.85), dark = mat(0x2a211b, 0.8);
  const [hx, hz] = D.hut, hut = new THREE.Group(); hut.position.set(hx, D.ground, hz); hut.rotation.y = 0.35; root.add(hut);
  box(6, 3, 4, mat(0x3b2f28, 0.8), 0, 1.5, 0, hut); const roof = box(6.6, 0.25, 4.8, mat(0x1d1f24, 0.7), 0, 3.25, 0, hut); roof.rotation.x = 0.06;
  box(6.7, 0.3, 4.9, capM, 0, 3.45, 0, hut).castShadow = false;
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc274).multiplyScalar(1.4), toneMapped: false });
  for (const x of [-1.8, 0, 1.8]) mk(new THREE.PlaneGeometry(1.1, 1.2), winM, hut, x, 1.7, 2.01).castShadow = false;
  const hutL = new THREE.PointLight(0xffb060, 14, 16, 1.6); hutL.position.set(0, 1.8, 3.2); hut.add(hutL);
  const signTex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#1d1712'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd38a'; g.font = 'bold 64px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LAGOON BAR', w / 2, h / 2 + 4); });
  mk(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }), hut, 0, 2.75, 2.02);
  for (let k = 0; k < 9; k++) box(1.2, 0.08, 2.0, wood, hx + 2 + k * 1.15, D.ground + 0.1, hz + 3.3 + k * 0.55).rotation.y = 0.35;
  const lampHeadM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd9a0).multiplyScalar(2), toneMapped: false });
  const lampL = [];
  for (const [x, z] of [[-9.5, 2.5], [9.8, 1.5], [3.5, -9.8], [-3.5, -10.2], [2.6, 7.2], [-2.8, 7.4]]) {
    mk(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 8), dark, root, x, D.ground + 1.6, z); mk(new THREE.SphereGeometry(0.16, 12, 8), lampHeadM, root, x, D.ground + 3.25, z).castShadow = false;
    const L = new THREE.PointLight(0xffc680, 9, 14, 1.7); L.position.set(x, D.ground + 3.0, z); root.add(L); lampL.push(L);
  }

  // ---------------------------------------------------------------- geothermal greenhouse (pink grow lights) + power plant + steam
  const [gx, gz] = D.greenhouse, gh = new THREE.Group(); gh.position.set(gx, D.ground, gz); gh.rotation.y = -0.4; root.add(gh);
  const glassM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7ad0).multiplyScalar(0.9), transparent: true, opacity: 0.85, toneMapped: false });
  for (let k = 0; k < 3; k++) { const cg = new THREE.CylinderGeometry(1.6, 1.6, 9, 16, 1, true, 0, PI); cg.rotateX(PI / 2); cg.rotateZ(PI / 2); const b = mk(cg, glassM, gh, k * 3.4, 1.4, 0); b.castShadow = false; box(0.08, 1.4, 9, dark, k * 3.4 + 1.6, 0.7, 0, gh); box(0.08, 1.4, 9, dark, k * 3.4 - 1.6, 0.7, 0, gh); box(3.3, 1.4, 0.05, glassM, k * 3.4, 0.7, 4.5, gh).castShadow = false; }
  const ghL = new THREE.PointLight(0xff6ac8, 18, 22, 1.5); ghL.position.set(3.4, 3.5, 6); gh.add(ghL);
  const [px, pz] = D.plant, plant = new THREE.Group(); plant.position.set(px, 0, pz); root.add(plant);
  const steel = mat(0x8a9098, 0.5, { metalness: 0.4 });
  box(22, 9, 12, mat(0x5c646e, 0.7), 0, 4.5, 0, plant); box(10, 14, 8, mat(0x6a727c, 0.7), 12, 7, -3, plant);
  for (let k = 0; k < 4; k++) { mk(new THREE.CylinderGeometry(1.4, 1.6, 16, 14), steel, plant, -12 + k * 4.5, 8, 8); }
  for (let k = 0; k < 14; k++) mk(new THREE.CylinderGeometry(0.35, 0.35, 6, 8), steel, plant, -30 + k * 3.2, 2.4, 14 + Math.sin(k) * 2).rotation.z = PI / 2;
  const plantWin = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c8).multiplyScalar(1.3), toneMapped: false });
  for (let k = 0; k < 12; k++) mk(new THREE.PlaneGeometry(0.8, 0.5), plantWin, plant, -9.5 + k * 1.7, 6 + (k % 3) * 1.4, 6.02).castShadow = false;

  // mountains: low-poly cones with snow tops, far behind
  const mtM = new THREE.MeshLambertMaterial({ color: 0x1a2236 }), mtSnow = new THREE.MeshLambertMaterial({ color: 0x9fb0cc });
  for (let k = 0; k < 9; k++) { const a = -PI / 2 + (k - 4) * 0.28 + (R() - 0.5) * 0.1, r = 230 + R() * 90, hgt = 40 + R() * 55, w = 70 + R() * 50; const m = mk(new THREE.ConeGeometry(w, hgt, 7), mtM, root, Math.cos(a) * r, hgt / 2 - 2, Math.sin(a) * r); m.castShadow = false; const s = mk(new THREE.ConeGeometry(w * 0.34, hgt * 0.34, 7), mtSnow, root, m.position.x, hgt * 0.83 - 2, m.position.z); s.castShadow = false; }

  // ---------------------------------------------------------------- steam off the water + the plant's plumes
  const steam = makeSpritePool(root, 90, 'smoke');
  const steamC = new THREE.Color(0xdfeaf2), plumeC = new THREE.Color(0xc9d2de);
  const seeds = Array.from({ length: 90 }, () => [R() * PI * 2, Math.sqrt(R()), R(), 0.6 + R() * 0.8]);

  // ---------------------------------------------------------------- lights: starlight + the glowing water from below
  const hemi = new THREE.HemisphereLight(0x6a7cac, 0x2a2c34, 0.75); root.add(hemi);
  const glow = new THREE.PointLight(0x6fe6ee, 6, 22, 1.4); glow.position.set(0, 0.5, 0.5); root.add(glow);
  const key = new THREE.DirectionalLight(0x9fb4e8, 0.35); key.position.set(-20, 40, 30); root.add(key, key.target); key.castShadow = false;

  const v = new THREE.Vector3();
  function update(t, camLocal = null) {
    rip.offset.set(t * 0.01, t * 0.006);
    const p = wg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, 0.018 * Math.sin(x * 1.1 + t * 1.4) * Math.cos(z * 0.9 + t * 1.1)); }
    p.needsUpdate = true;
    // steam: slow puffs rising off the water (the near ones thinner so faces stay readable), plumes from the plant
    seeds.forEach(([a, rr, ph, sp], i) => {
      if (i < 78) {
        const age = (t * 0.11 * sp + ph) % 1, r = rr * (shore(a) - 0.5);
        v.set(Math.cos(a) * r + age * 1.2, 0.1 + age * 2.6, Math.sin(a) * r);
        let op = 0.075 * Math.sin(PI * age);
        if (camLocal) { const d = v.distanceTo(camLocal); op *= Math.min(1, Math.max(0, (d - 1.6) / 3)); }
        steam.set(i, v, 0.6 + age * 1.3, op, steamC);
      } else {
        const k = i - 78, age = (t * 0.05 + k / 12) % 1;
        v.set(px - 12 + (k % 4) * 4.5 + age * 6, 16 + age * 30, pz + 8);
        steam.set(i, v, 8 + age * 22, 0.2 * Math.sin(PI * age), plumeC);
      }
    });
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D, fog, sky, water, hut, greenhouse: gh, plant, steam, update, lights: { hemi, glow, key, hutL, ghL, lampL } };
}
