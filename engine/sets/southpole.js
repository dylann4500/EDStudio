// SET: the geographic South Pole on a bright polar "night" (late-October sun, ~13° up all day) — a flat white plateau with
// wind-carved sastrugi, the ceremonial pole (red-and-white barber pole + chrome globe) in a ring of 12 flags, the survey marker
// + its sign, an elevated research station on stilts, a tracked snowcat, cargo containers, flag-lined roads, a fuel bladder
// berm, glittering "diamond dust" in the air and a 22° sun halo. Built for video 028 (Earth stops spinning: the ground at the
// pole moves at 0 km/h, so nothing happens).
//
// Coordinates (meters, y up). The ceremonial pole stands at the origin. Flags on a half ring (r = 4.2) behind it (−z).
// Survey marker + sign at DIMS.marker. Station (elevated, 3 m stilts) along z = DIMS.station.z, x∈[−55, 55], facing +z.
// Camera usually at z ≈ +4…+8 looking −z (the station behind the pole). The sun is low in the +x/+z quadrant (faces lit).
// update(t) twinkles the diamond dust and flaps the flags (`wind` 0..1). aimSun(cx, cz, half) per shot.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
export const DIMS = { pole: [0, 0], ringR: 4.2, marker: [-5.2, 1.6], station: { z: -70, x0: -55, x1: 55, y0: 3.2, h: 8.5 }, snowcat: [16, -18] };

// the 12 original Antarctic Treaty signatories, as simple cartoon flags (stripes + a mark)
const FLAGS = [
  ['h', ['#74acdf', '#ffffff', '#74acdf'], 'sun'],            // Argentina
  ['blue', '#00247d', 'stars'],                                // Australia
  ['v', ['#111111', '#fdda24', '#ef3340']],                    // Belgium
  ['chile'],                                                   // Chile
  ['v', ['#0055a4', '#ffffff', '#ef4135']],                    // France
  ['japan'],                                                   // Japan
  ['blue', '#00247d', 'red-stars'],                            // New Zealand
  ['nordic', '#ba0c2f', '#ffffff', '#00205b'],                 // Norway
  ['h', ['#de3831', '#ffffff', '#007a4d', '#ffffff', '#002395']],  // South Africa (stylized)
  ['uk'],                                                      // United Kingdom
  ['us'],                                                      // United States
  ['h', ['#ffffff', '#0039a6', '#d52b1e']],                    // Russia
];
function flagTexture(spec) {
  return canvasTex(192, 128, (g, w, h) => {
    const [kind] = spec;
    if (kind === 'h') { const c = spec[1]; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, (i * h) / c.length, w, h / c.length + 1); }); if (spec[2] === 'sun') { g.fillStyle = '#f6b40e'; g.beginPath(); g.arc(w / 2, h / 2, 12, 0, 7); g.fill(); } }
    else if (kind === 'v') { const c = spec[1]; c.forEach((col, i) => { g.fillStyle = col; g.fillRect((i * w) / c.length, 0, w / c.length + 1, h); }); }
    else if (kind === 'blue' || kind === 'uk') {
      g.fillStyle = kind === 'uk' ? '#012169' : spec[1]; g.fillRect(0, 0, w, h);
      const uw = kind === 'uk' ? w : w / 2, uh = kind === 'uk' ? h : h / 2;
      g.strokeStyle = '#ffffff'; g.lineWidth = uh * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(uw, uh); g.moveTo(uw, 0); g.lineTo(0, uh); g.stroke();
      g.strokeStyle = '#c8102e'; g.lineWidth = uh * 0.07; g.stroke();
      g.fillStyle = '#ffffff'; g.fillRect(uw / 2 - uh * 0.17, 0, uh * 0.34, uh); g.fillRect(0, uh / 2 - uh * 0.17, uw, uh * 0.34);
      g.fillStyle = '#c8102e'; g.fillRect(uw / 2 - uh * 0.1, 0, uh * 0.2, uh); g.fillRect(0, uh / 2 - uh * 0.1, uw, uh * 0.2);
      if (kind === 'blue') { g.fillStyle = spec[2] === 'red-stars' ? '#c8102e' : '#ffffff'; for (const [x, y] of [[0.72, 0.25], [0.84, 0.48], [0.72, 0.78], [0.62, 0.52], [0.25, 0.78]]) { g.beginPath(); g.arc(x * w, y * h, 6, 0, 7); g.fill(); } }
    } else if (kind === 'chile') { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h / 2); g.fillStyle = '#d52b1e'; g.fillRect(0, h / 2, w, h / 2); g.fillStyle = '#0039a6'; g.fillRect(0, 0, w / 3, h / 2); g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 6, h / 4, 9, 0, 7); g.fill(); }
    else if (kind === 'japan') { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#bc002d'; g.beginPath(); g.arc(w / 2, h / 2, h * 0.3, 0, 7); g.fill(); }
    else if (kind === 'nordic') { g.fillStyle = spec[1]; g.fillRect(0, 0, w, h); g.fillStyle = spec[2]; g.fillRect(w * 0.28, 0, w * 0.2, h); g.fillRect(0, h * 0.4, w, h * 0.2); g.fillStyle = spec[3]; g.fillRect(w * 0.32, 0, w * 0.1, h); g.fillRect(0, h * 0.45, w, h * 0.1); }
    else if (kind === 'us') { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#b22234'; g.fillRect(0, (i * h) / 13, w, h / 13 + 1); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, w * 0.42, h * 0.54); g.fillStyle = '#fff'; for (let i = 0; i < 20; i++) g.fillRect(6 + (i % 5) * 15, 6 + Math.floor(i / 5) * 15, 3, 3); }
  });
}

export function buildSouthPole(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 90);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xe6eef6, 160, 1500);

  // sky: deep polar blue overhead, pale at the horizon
  const sky = makeSkyDome(0x2f6fd0, 0xe4eef8, 1600); root.add(sky.mesh);
  // the snow: a huge plateau with sastrugi (wind ridges) painted in + a few real drift ridges near the camera
  const snowT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#f3f6fa'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = R() * h, x = R() * w, l = 40 + R() * 140; const gr = g.createLinearGradient(x, y, x, y + 7); gr.addColorStop(0, 'rgba(160,185,215,.0)'); gr.addColorStop(0.5, `rgba(150,175,210,${0.12 + R() * 0.18})`); gr.addColorStop(1, 'rgba(255,255,255,.0)'); g.fillStyle = gr; g.fillRect(x, y, l, 7); }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h, 2, 2); }
  }, [120, 120]);
  const snowM = new THREE.MeshStandardMaterial({ map: snowT, color: 0xf6f8fc, roughness: 0.75 });
  const ground = mk(new THREE.PlaneGeometry(3000, 3000), snowM, root, 0, 0, 0); ground.rotation.x = -PI / 2; ground.castShadow = false;
  const driftM = mat(0xeef3f9, 0.8);
  for (let i = 0; i < 60; i++) { const x = -60 + R() * 120, z = -50 + R() * 70; if (Math.hypot(x, z) < 7 || (x > -10 && x < 14 && z > -2)) continue; const d = mk(new THREE.SphereGeometry(1, 12, 6, 0, PI * 2, 0, PI / 2), driftM, root, x, -0.02, z); d.scale.set(1.5 + R() * 3, 0.12 + R() * 0.22, 0.5 + R() * 0.8); d.rotation.y = 0.5 + R() * 0.3; d.castShadow = false; }

  // ceremonial pole: barber stripes + a chrome globe, on a little snow-packed plinth
  const stripeT = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8202a'; g.lineWidth = 34; for (let k = -4; k < 8; k++) { g.beginPath(); g.moveTo(0, k * 64); g.lineTo(w, k * 64 + 64); g.stroke(); } }, [1, 2]);
  const cer = new THREE.Group(); root.add(cer);
  mk(new THREE.CylinderGeometry(0.75, 0.9, 0.18, 24), mat(0xe9eef4, 0.8), cer, 0, 0.09, 0);
  mk(new THREE.CylinderGeometry(0.07, 0.07, 1.25, 20), new THREE.MeshStandardMaterial({ map: stripeT, roughness: 0.4 }), cer, 0, 0.8, 0);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, metalness: 1.0, roughness: 0.06, envMapIntensity: 1 });
  const globe = mk(new THREE.SphereGeometry(0.26, 32, 20), chrome, cer, 0, 1.68, 0);
  // a simple reflection map for the chrome (sky above, snow below) so it reads as a mirror ball, not grey plastic
  const envT = canvasTex(256, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f6fd0'); gr.addColorStop(0.47, '#cfe0f4'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#e9eef6'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#4a5a6a'; g.fillRect(w * 0.1, h * 0.43, w * 0.3, h * 0.05); g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(w * 0.7, h * 0.38, 6, 0, 7); g.fill(); });
  envT.mapping = THREE.EquirectangularReflectionMapping; chrome.envMap = envT;
  // the flag ring
  const flags = [];
  FLAGS.forEach((spec, i) => {
    const a = PI * (0.08 + (i / (FLAGS.length - 1)) * 0.84), x = Math.cos(a) * DIMS.ringR * 1.15, z = -Math.sin(a) * DIMS.ringR;
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    mk(new THREE.CylinderGeometry(0.03, 0.035, 3.1, 8), mat(0xd8dce2, 0.3, { metalness: 0.6 }), g, 0, 1.55, 0);
    mk(new THREE.SphereGeometry(0.045, 8, 6), mat(0xc9a050, 0.3, { metalness: 0.7 }), g, 0, 3.12, 0);
    const geo = new THREE.PlaneGeometry(0.9, 0.6, 10, 4); geo.translate(0.45, 0, 0);
    const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagTexture(spec), roughness: 0.85, side: THREE.DoubleSide }));
    cloth.position.y = 2.75; cloth.rotation.y = -0.6 + R() * 0.3; cloth.castShadow = true; g.add(cloth);
    flags.push({ g, cloth, base: geo.attributes.position.array.slice(), seed: R() * 6 });
  });
  // the survey marker (brass cap on a post) + the sign
  const [mx, mz] = DIMS.marker;
  mk(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 10), mat(0xb08a3a, 0.3, { metalness: 0.8 }), root, mx, 0.45, mz);
  mk(new THREE.CylinderGeometry(0.11, 0.09, 0.08, 14), mat(0xd8b04a, 0.25, { metalness: 0.9 }), root, mx, 0.94, mz);
  const signT = canvasTex(512, 288, (g, w, h) => {
    g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1d2a3a'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#1d2a3a'; g.textAlign = 'center'; g.font = 'bold 50px Helvetica, Arial, sans-serif'; g.fillText('GEOGRAPHIC', w / 2, 84); g.fillText('SOUTH POLE', w / 2, 142);
    g.fillStyle = '#c8202a'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.fillText('90° S', w / 2, 196);
    g.fillStyle = '#44505e'; g.font = '28px Helvetica, Arial, sans-serif'; g.fillText('ELEVATION 9,301 FT', w / 2, 246);
  });
  const sign = new THREE.Group(); sign.position.set(mx - 1.1, 0, mz - 0.5); sign.rotation.y = 0.35; root.add(sign);
  for (const sx of [-0.55, 0.55]) mk(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 8), mat(0x6a6e74, 0.5), sign, sx, 0.75, -0.02);
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.73), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.6 })); signM.position.set(0, 1.25, 0.01); sign.add(signM);

  // the station: a long two-storey box on stilts, sloped underside (so drifting snow blows through), rows of small windows
  const S = DIMS.station, sw = S.x1 - S.x0;
  const panelT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#9aa9b8'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(40,55,70,.18)'; g.fillRect(x, 0, 2, h); } for (const y of [22, 82]) for (let x = 10; x < w; x += 32) { g.fillStyle = '#2c3e52'; g.fillRect(x, y, 14, 18); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 2, y + 2, 4, 6); } }, [Math.round(sw / 12), 1]);
  const st = new THREE.Group(); st.position.set(0, 0, S.z); root.add(st);
  box(sw, S.h, 16, new THREE.MeshStandardMaterial({ map: panelT, roughness: 0.6 }), 0, S.y0 + S.h / 2, 0, st);
  const under = box(sw, 0.5, 17, mat(0x7c8a98, 0.6), 0, S.y0 - 0.1, 0.2, st); under.rotation.x = 0.06;
  box(sw + 0.6, 0.4, 16.6, mat(0x5a6878, 0.6), 0, S.y0 + S.h + 0.2, 0, st);
  for (let x = S.x0 + 3; x <= S.x1 - 3; x += 8) for (const z of [-6, 6]) mk(new THREE.CylinderGeometry(0.35, 0.35, S.y0, 10), mat(0x6a7684, 0.5), st, x, S.y0 / 2, z);
  for (const x of [-20, 24]) { box(4, S.y0 + S.h * 0.6, 4, mat(0x8494a4, 0.6), x, (S.y0 + S.h * 0.6) / 2, 9.5, st); box(3.6, 0.2, 6, mat(0x6a7684, 0.6), x, 1.2, 13, st); }
  const nameT = canvasTex(1024, 96, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = '#1d2a3a'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOUTH POLE STATION', w / 2, h / 2 + 3); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(30, 2.8), new THREE.MeshStandardMaterial({ map: nameT, transparent: true, roughness: 0.6 })); nm.position.set(0, S.y0 + S.h - 1.6, 8.02); st.add(nm);
  // far structures: a radome on a tower, a telescope dish building, blue/orange cargo, a fuel berm
  const far = new THREE.Group(); root.add(far);
  box(14, 9, 12, mat(0x8a96a4, 0.6), -150, 4.5, -260, far); mk(new THREE.SphereGeometry(6, 20, 12, 0, PI * 2, 0, PI / 2), mat(0xf2f4f6, 0.5), far, -150, 9, -260);
  box(16, 7, 12, mat(0xb8c0c8, 0.6), 140, 3.5, -320, far); const dish = mk(new THREE.SphereGeometry(8, 24, 10, 0, PI * 2, 0, PI * 0.28), mat(0xf4f6f8, 0.4, { side: THREE.DoubleSide }), far, 140, 12, -320); dish.rotation.x = -0.9;
  const cargoC = [0x2f6aa8, 0xe2752c, 0x2f6aa8, 0x58b368, 0xe2752c, 0x9a2f2f];
  for (let i = 0; i < 12; i++) { const c = box(6, 2.6, 2.4, mat(cargoC[i % 6], 0.7), 30 + (i % 4) * 7, 1.3 + Math.floor(i / 8) * 2.6, -38 - Math.floor(i / 4) * 3.2); c.rotation.y = 0.02 * (i % 3); }
  box(26, 2.2, 8, mat(0xe6ebf2, 0.9), -42, 1.1, -36); box(24, 0.6, 7, mat(0x3a3d42, 0.7), -42, 2.5, -36);
  // flag-lined roads (bamboo poles with little black/red flags) + a snowcat
  const roadFlagM = [mat(0x1a1a1a, 0.7, { side: THREE.DoubleSide }), mat(0xd2302a, 0.7, { side: THREE.DoubleSide })];
  for (let i = 0; i < 40; i++) { const x = -95 + i * 5, z = -20 - (i % 2) * 0.2; mk(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 5), mat(0xc9b98a, 0.8), root, x, 0.9, z); const f = mk(new THREE.PlaneGeometry(0.35, 0.25), roadFlagM[i % 2], root, x + 0.18, 1.65, z); f.rotation.y = 0.2; f.castShadow = false; }
  const cat = new THREE.Group(); cat.position.set(DIMS.snowcat[0], 0, DIMS.snowcat[1]); cat.rotation.y = -0.5; root.add(cat);
  box(3.4, 1.4, 2.4, mat(0xe2752c, 0.6), 0, 1.4, 0, cat); box(1.8, 1.1, 2.2, mat(0xe2752c, 0.6), -0.6, 2.6, 0, cat); box(1.7, 0.7, 2.25, mat(0x2c3e52, 0.2), -0.6, 2.7, 0, cat);
  for (const z of [-1.35, 1.35]) box(4.2, 0.8, 0.7, mat(0x2a2d31, 0.8), 0, 0.4, z, cat);
  box(0.4, 1.2, 2.8, mat(0xd8dce2, 0.4, { metalness: 0.4 }), 2.0, 0.9, 0, cat);

  // diamond dust: tiny ice crystals glinting in the sunlit air (twinkle in update)
  const DN = 1400, dGeo = new THREE.BufferGeometry(), dPos = new Float32Array(DN * 3), dSeed = [];
  for (let i = 0; i < DN; i++) { dPos.set([-14 + R() * 28, 0.2 + R() * 6, -16 + R() * 24], i * 3); dSeed.push(R() * 7); }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3)); dGeo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(DN), 1));
  const sparkC = document.createElement('canvas'); sparkC.width = sparkC.height = 32; const sg = sparkC.getContext('2d'); const srg = sg.createRadialGradient(16, 16, 0, 16, 16, 16); srg.addColorStop(0, 'rgba(255,255,255,1)'); srg.addColorStop(0.25, 'rgba(255,255,255,.6)'); srg.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = srg; sg.fillRect(0, 0, 32, 32);
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.035, map: new THREE.CanvasTexture(sparkC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
  dust.frustumCulled = false; root.add(dust);

  // the low sun (13° up) + a soft 22° halo sprite around it (common at the pole: ice crystals in the air)
  const SUN_DIR = new THREE.Vector3(0.62, 0.24, 0.75).normalize();
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,250,1)'); gr.addColorStop(0.12, 'rgba(255,252,235,.95)'); gr.addColorStop(0.3, 'rgba(255,245,215,.25)'); gr.addColorStop(1, 'rgba(255,245,215,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), fog: false, depthWrite: false, toneMapped: false, transparent: true }));
  sunDisc.position.copy(SUN_DIR).multiplyScalar(1400); sunDisc.scale.setScalar(220); root.add(sunDisc);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(512, 512, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.40, w / 2, h / 2, w * 0.5); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.45, 'rgba(255,230,200,.35)'); gr.addColorStop(0.6, 'rgba(220,235,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), fog: false, depthWrite: false, toneMapped: false, transparent: true, opacity: 0.8 }));
  halo.position.copy(sunDisc.position); halo.scale.setScalar(2 * 1400 * Math.tan(22 * PI / 180) * 1.05); root.add(halo);

  const hemi = new THREE.HemisphereLight(0xdbe8ff, 0xf2f4f8, 1.25); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); root.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  function aimSun(cx = 0, cz = -2, half = 14) {
    sun.target.position.set(cx, 0, cz); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 120);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 260 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun();
  function update(t, wind = 0.35) {
    const sz = dGeo.attributes.size; void sz;
    const p = dGeo.attributes.position;
    for (let i = 0; i < DN; i++) { const s = dSeed[i]; p.setX(i, -14 + ((dPos[i * 3] + 14 + t * 0.25 * wind) % 28)); p.setY(i, dPos[i * 3 + 1] + 0.08 * Math.sin(t * 0.7 + s)); }
    p.needsUpdate = true;
    dust.material.opacity = 0.75;
    flags.forEach((f) => { const pp = f.cloth.geometry.attributes.position; for (let i = 0; i < pp.count; i++) { const x = f.base[i * 3], y = f.base[i * 3 + 1], k = x / 0.9; pp.setZ(i, wind * k * 0.12 * Math.sin(x * 4 - t * 5 + f.seed + y)); pp.setY(i, y - (1 - wind) * k * 0.18); } pp.needsUpdate = true; f.cloth.geometry.computeVertexNormals(); });
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, fog, sky, flags, globe, sign, station: st, snowcat: cat, update, aimSun, lights: { hemi, sun } };
}
