// 062 (Scribe promo "How f*cking airplanes f*cking fly"): an airport in the toon look, in three pieces + small props.
//   buildAirfield(studio)  ONE world at the origin: a runway along +x (threshold x = 0, centerline z = 0, 45 m wide) with markings,
//                          edge + approach lights, a perimeter fence across the approach (x = AD.fenceX, the planespotter's spot
//                          outside it), taxiways, an apron (the gate AD.gate: park a makeAirliner there nose +x), a long glass
//                          terminal (AIRPORT) with jet bridges, a control tower, a hangar, ground vehicles, cones, a windsock, far
//                          hills; a camera-following sky dome (setMood 'day' | 'air'), sparse far clouds for ground shots, and the
//                          CLOUD LAYER for flight shots (`clouds`: an opaque deck top at AD.cloudY + puffs above it; show it only in
//                          the air — it hides the ground). aimSun(cx, cy, cz, half) per shot (sharp shadows where the action is).
//   buildSecurity(studio)  the security checkpoint (its own root; park it away from the airfield and show one root per shot):
//                          a walk-through metal detector (`detector.setLight(state)` 'green'|'red'|'off'), an x-ray belt with
//                          bins (`bins[]`), queue stanchions, a SECURITY sign, a departures board, windows onto the apron.
//                          Travellers walk +z through the arch (the camera sits at +z looking −z, faces toward the lens).
//   makeCockpit()          an airliner flight deck, x forward (+x = nose, +z = the right seat): floor, side windows, overhead
//                          panel, a glareshield + instrument panel whose screens are a live canvas (`setSpeed(knots)`),
//                          windshield panes, two seats (`seatL/seatR` pelvis spots), yokes, a throttle pedestal (`setThrottle(0..1)`).
//                          Parent it to an airliner's body at its nose and hide the airliner's own parts for the inside shots.
//   relivery(air, name)    repaints jet.js makeAirliner's GARY AIR livery + fin logo (a pretzel) with our own name.
//   props: makePretzel, makePretzelBag, makeCup (paper coffee cup + coffee level), makePaperPlane(tex), makeWand,
//          makeBoxers (heart boxers for a toon), makeSuitcase(color), makeTug (baggage tug + carts).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mk, clamp, lerp } from '../core.js';

const PI = Math.PI, TAU = PI * 2;
export const AD = {
  rwyW: 45, rwyX1: 2800, fenceX: -125, spot: [-138, 0, 6],     // the planespotter outside the approach fence
  gate: [420, 0, -118], apronZ: [-62, -222], termZ: -232,      // the airliner's parking spot (origin under the wing root, nose +x)
  cloudY: 520,                                                  // flight shots fly at cloudY + 60…260 (the deck hides the ground)
};
const h2 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const steel = (color = 0x9aa3ad, roughness = 0.35, metalness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const font = (px) => `${px}px "Luckiest Guy", "Arial Black", Arial`;
export const signTex = (text, { w = 512, h = 160, bg = '#1f5fbf', fg = '#fff', px = 96, border = null } = {}) => tex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); }
  let s = px; g.font = font(s); while (g.measureText(text).width > w * 0.88 && s > 14) { s -= 3; g.font = font(s); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + s * 0.06);
});
const sign = (parent, text, w, h, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(text, { w: Math.round(160 * w / h), h: 160, ...o }), roughness: 0.6, emissive: 0xffffff, emissiveIntensity: o.glow ?? 0.12, emissiveMap: null })); m.material.emissiveMap = m.material.map; parent.add(m); return m; };
const puffTex = () => tex(256, 128, (c, w, h) => { for (let i = 0; i < 9; i++) { const x = w * (0.2 + 0.6 * h2(i, 3)), y = h * (0.45 + 0.25 * h2(i, 4)), r = 34 + 30 * h2(i, 5); const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); } });

// ---------------------------------------------------------------- the airfield
const MOODS = {
  day: { top: 0x3c8de0, hor: 0xd8ecf8, bot: 0x9cb886, sun: 0xfff2dc, sunI: 2.7, hs: 0xe6f2ff, hg: 0x8a7a62, hi: 1.15, fog: 0xd8ecf8, fn: 260, ff: 2600, glow: 0.6 },
  air: { top: 0x2b72d4, hor: 0xe4f1fb, bot: 0xf4f7fa, sun: 0xfff6e6, sunI: 2.6, hs: 0xeaf4ff, hg: 0xdfe6ee, hi: 1.35, fog: 0xe8f2fa, fn: 300, ff: 3200, glow: 0.8 },
};
export async function buildAirfield(studio) {
  const { scene, renderer, camera } = studio;
  await document.fonts.load(font(96)).catch(() => {});
  camera.far = 5200; camera.near = 0.08; camera.updateProjectionMatrix();
  const root = new THREE.Group(); scene.add(root);
  const fog = new THREE.Fog(0xd8ecf8, 260, 2600);
  const hemi = new THREE.HemisphereLight(0xe6f2ff, 0x8a7a62, 1.15); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.7); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; root.add(sun, sun.target);
  const SUN = new THREE.Vector3(-0.4, 0.8, 0.45).normalize();
  function aimSun(cx, cy, cz, half = 12) { sun.position.set(cx + SUN.x * 120, cy + SUN.y * 120, cz + SUN.z * 120); sun.target.position.set(cx, cy, cz); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 300 }); sun.shadow.camera.updateProjectionMatrix(); }
  aimSun(0, 0, 0, 20);

  // sky dome (follows the camera; the root stays at the origin, so world = local)
  const skyU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uBot: { value: new THREE.Color() }, uSunDir: { value: SUN.clone() }, uSunCol: { value: new THREE.Color() }, uGlow: { value: 0.6 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4800, 48, 24), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uTop, uHor, uBot, uSunDir, uSunCol; uniform float uGlow; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float h = d.y; vec3 c = h > 0.0 ? mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHor, uBot, clamp(-h * 6.0, 0.0, 1.0));
        float s = max(dot(d, normalize(uSunDir)), 0.0); c += uSunCol * (pow(s, 900.0) * 3.0 + pow(s, 14.0) * 0.3 * uGlow + pow(s, 3.0) * 0.06 * uGlow); gl_FragColor = vec4(c, 1.0); }` }));
  sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);
  sky.onBeforeRender = (r, s, cam) => { sky.position.copy(cam.position); sky.updateMatrixWorld(); };

  // ---- ground: far patchwork, the airfield grass, apron, taxiways, runway + markings
  const ground = new THREE.Group(); root.add(ground);
  const farT = tex(1024, 1024, (c) => { const cols = ['#9cc46a', '#b8cf74', '#86b45a', '#c9c27a', '#a7c96e', '#8fbf62', '#d2c98a']; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { c.fillStyle = cols[Math.floor(h2(i, j) * cols.length)]; c.fillRect(i * 64, j * 64, 64, 64); c.strokeStyle = 'rgba(70,90,50,.3)'; c.lineWidth = 2; c.strokeRect(i * 64, j * 64, 64, 64); } });
  farT.wrapS = farT.wrapT = THREE.RepeatWrapping; farT.repeat.set(16, 16);
  const far = mk(new THREE.PlaneGeometry(9000, 9000), std(0xffffff, 1, { map: farT }), ground, 1200, -0.3, 0); far.rotation.x = -PI / 2; far.receiveShadow = true;
  const grassT = tex(64, 64, (c, w, h) => { c.fillStyle = '#9ccf6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#90c45f'; c.fillRect(0, 0, w, 32); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${h2(i, 1) > 0.5 ? '255,255,255' : '0,40,0'},.06)`; c.fillRect(h2(i, 2) * 64, h2(i, 3) * 64, 1, 3); } });
  grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(180, 50); grassT.magFilter = THREE.NearestFilter;
  const field = mk(new THREE.PlaneGeometry(3600, 1000), std(0xffffff, 0.95, { map: grassT }), ground, 1300, -0.02, -150); field.rotation.x = -PI / 2; field.receiveShadow = true;
  const concT = tex(256, 256, (c, w, h) => { c.fillStyle = '#b4b1a9'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.13)'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(60,60,55,${0.03 + h2(i) * 0.05})`; c.beginPath(); c.ellipse(h2(i, 1) * w, h2(i, 2) * h, 8 + h2(i, 3) * 30, 4 + h2(i, 4) * 14, h2(i, 5) * 3, 0, 7); c.fill(); } });
  concT.wrapS = concT.wrapT = THREE.RepeatWrapping;
  const flat = (w, d, m, x, z, y = 0.02) => { const p = mk(new THREE.PlaneGeometry(w, d), m, ground, x, y, z); p.rotation.x = -PI / 2; p.receiveShadow = true; p.castShadow = false; return p; };
  { const t = concT.clone(); t.needsUpdate = true; t.repeat.set(680 / 8, 160 / 8); flat(680, 160, std(0xffffff, 0.85, { map: t }), 440, (AD.apronZ[0] + AD.apronZ[1]) / 2, 0.04); }
  const asphM = std(0x5d6066, 0.9);
  for (const x of [250, 610, 980]) { flat(24, 50, asphM, x, -42, 0.05); }
  const tw = flat(1100, 22, asphM, 600, -50, 0.045); void tw;
  const taxiY = std(0xffc21a, 0.6); for (const x of [250, 610, 980]) flat(0.4, 50, taxiY, x, -42, 0.07); flat(1100, 0.4, taxiY, 600, -50, 0.065);
  // gate lead-in lines (yellow) on the apron
  for (const gx of [AD.gate[0], AD.gate[0] + 140, AD.gate[0] - 150]) flat(0.45, 90, taxiY, gx, AD.gate[2] + 20, 0.07).rotation.z = PI / 2;
  const rwyT = tex(512, 512, (c, w, h) => { c.fillStyle = '#5f6268'; c.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { const b = h2(i) > 0.5 ? 255 : 0; c.fillStyle = `rgba(${b},${b},${b},.05)`; c.fillRect(h2(i, 1) * w, h2(i, 2) * h, 3, 3); } c.fillStyle = '#f2f2ee'; c.fillRect(0, h / 2 - 6, w * 0.55, 12); c.fillRect(0, 12, w, 9); c.fillRect(0, h - 21, w, 9); });
  rwyT.wrapS = THREE.RepeatWrapping; rwyT.repeat.set(AD.rwyX1 / 60, 1); rwyT.anisotropy = 16;
  const rwy = flat(AD.rwyX1 + 20, AD.rwyW, std(0xffffff, 0.9, { map: rwyT }), AD.rwyX1 / 2 - 10, 0, 0.06);
  const keysT = tex(256, 256, (c, w, h) => { c.fillStyle = '#4b4e52'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; for (let i = 0; i < 8; i++) c.fillRect(16, 10 + i * 31, w - 32, 16); });
  flat(16, 40, std(0xffffff, 0.9, { map: keysT }), 10, 0, 0.08);
  const numT = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; c.font = font(170); c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(w / 2, h / 2); c.rotate(PI / 2); c.fillText('09', 0, 10); });
  flat(14, 14, new THREE.MeshStandardMaterial({ map: numT, transparent: true, roughness: 0.9 }), 30, 0, 0.09);
  for (const x of [150, 300, 450]) for (const z of [-9, 9]) flat(22, 3.2, std(0xf2f2ee, 0.85), x + 20, z, 0.08);   // touchdown zone bars
  for (const z of [-11, 11]) flat(48, 7, std(0xf2f2ee, 0.85), 330, z, 0.085);   // aiming point
  { const tm = std(0x2a2c30, 0.95); for (let i = 0; i < 26; i++) { const x = 150 + i * 9 + h2(i, 7) * 6, z = (h2(i, 8) - 0.5) * 12; flat(10 + h2(i, 9) * 14, 0.7, tm, x, z, 0.075).material = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.95, transparent: true, opacity: 0.35 }); } }   // rubber marks
  // edge lights + approach lights (instanced)
  const poleG = new THREE.CylinderGeometry(0.07, 0.09, 1, 6), bulbG = new THREE.SphereGeometry(0.16, 8, 6);
  const lampM = new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffe08a, emissiveIntensity: 1.2 }), poleM = std(0x6f7378, 0.6);
  const lights = [];
  for (let x = 0; x <= 1800; x += 60) for (const z of [-AD.rwyW / 2 - 1, AD.rwyW / 2 + 1]) lights.push([x, 0.45, z]);
  for (let x = -30; x >= -330; x -= 30) for (let k = -2; k <= 2; k++) lights.push([x, 1.2 + (-x) * 0.012, k * 2.2]);
  const poles = new THREE.InstancedMesh(poleG, poleM, lights.length), bulbs = new THREE.InstancedMesh(bulbG, lampM, lights.length);
  const M4 = new THREE.Matrix4();
  lights.forEach(([x, y, z], i) => { M4.makeScale(1, y, 1).setPosition(x, y / 2, z); poles.setMatrixAt(i, M4); M4.makeTranslation(x, y + 0.08, z); bulbs.setMatrixAt(i, M4); });
  poles.castShadow = true; ground.add(poles, bulbs);
  for (let x = -30; x >= -330; x -= 30) mk(new THREE.BoxGeometry(0.2, 0.2, 9.2), poleM, ground, x, 1.2 + (-x) * 0.012, 0);   // the crossbars

  // ---- the perimeter fence across the approach (chain link panels) + a PLANE SPOTTING sign outside it
  const linkT = tex(64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#9aa3ab'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke(); });
  linkT.wrapS = linkT.wrapT = THREE.RepeatWrapping; linkT.repeat.set(12, 9);
  const linkM = new THREE.MeshStandardMaterial({ map: linkT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
  const fence = new THREE.Group(); root.add(fence); fence.position.x = AD.fenceX;
  for (let z = -60; z < 60; z += 3) { mk(new THREE.PlaneGeometry(3, 2.2), linkM, fence, 0, 1.1, z + 1.5).rotation.y = PI / 2; mk(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8), steel(0x8a929a), fence, 0, 1.25, z); }
  mk(new THREE.CylinderGeometry(0.04, 0.04, 120, 6), steel(0x8a929a), fence, 0, 2.3, 0).rotation.x = PI / 2;
  { const s = new THREE.Group(); root.add(s); s.position.set(AD.fenceX - 26, 0, 9); s.rotation.y = PI / 2 - 0.25; mk(new THREE.BoxGeometry(0.1, 2.2, 0.1), std(0x6b4a33), s, -0.7, 1.1, 0); mk(new THREE.BoxGeometry(0.1, 2.2, 0.1), std(0x6b4a33), s, 0.7, 1.1, 0); const sg = sign(s, 'PLANE SPOTTING', 2.0, 0.6, { bg: '#2f8f4e' }); sg.position.set(0, 1.9, 0.06); }
  { const bench = new THREE.Group(); root.add(bench); bench.position.set(AD.fenceX - 22, 0, -6); bench.rotation.y = PI / 2 + 0.3; mk(new THREE.BoxGeometry(1.8, 0.08, 0.45), std(0x8a5a3a), bench, 0, 0.45, 0); mk(new THREE.BoxGeometry(1.8, 0.4, 0.06), std(0x8a5a3a), bench, 0, 0.75, -0.2); for (const x of [-0.8, 0.8]) mk(new THREE.BoxGeometry(0.06, 0.45, 0.4), steel(0x3a3e44), bench, x, 0.22, 0); }

  // ---- terminal, jet bridges, tower, hangar, windsock, vehicles, far hills
  const back = new THREE.Group(); root.add(back);
  const term = new THREE.Group(); back.add(term); term.position.set(470, 0, AD.termZ);
  { const wallM = std(0xe6e9ec, 0.6); mk(new THREE.BoxGeometry(480, 16, 40), wallM, term, 0, 8, -20);
    const glassT = tex(512, 128, (c, w, h) => { c.fillStyle = '#3a5f80'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(220,240,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,.05)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#d9dee3'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 3, h); c.fillRect(0, h / 2 - 2, w, 4); c.fillStyle = 'rgba(255,214,150,.35)'; for (let i = 0; i < 18; i++) c.fillRect(h2(i, 2) * w, h * 0.55 + h2(i, 3) * h * 0.3, 10, 18); });
    glassT.wrapS = THREE.RepeatWrapping; glassT.repeat.set(16, 1);
    const glass = mk(new THREE.PlaneGeometry(470, 9), new THREE.MeshStandardMaterial({ map: glassT, roughness: 0.15, metalness: 0.4, emissive: 0x223344, emissiveIntensity: 0.4 }), term, 0, 7, 0.05);
    mk(new THREE.BoxGeometry(490, 1.4, 52), std(0xd2d6db, 0.5), term, 0, 16.7, -16);   // roof slab overhang
    const ts = sign(term, 'AIRPORT', 46, 6, { bg: '#1f5fbf' }); ts.position.set(0, 20.6, 4);
    mk(new THREE.BoxGeometry(48, 7, 0.6), std(0x1f5fbf, 0.5), term, 0, 20.6, 3.6); void glass;
    for (const gx of [AD.gate[0] - 150, AD.gate[0], AD.gate[0] + 140]) {   // jet bridges toward each gate
      const jb = new THREE.Group(); term.add(jb); jb.position.set(gx - 470 + 22, 0, 0);
      mk(new THREE.BoxGeometry(3.2, 3.2, 72), std(0xd8dde2, 0.5), jb, 0, 6.2, 36); mk(new THREE.BoxGeometry(4.2, 4.2, 4.2), std(0xc9ced3, 0.5), jb, 0, 6.2, 74);
      mk(new THREE.CylinderGeometry(0.35, 0.35, 4.6, 10), steel(0x6b737b), jb, 0, 2.3, 60); mk(new THREE.BoxGeometry(2.6, 0.9, 1.4), std(0x2b2d31), jb, 0, 0.45, 60);
    }
  }
  const tower = new THREE.Group(); back.add(tower); tower.position.set(780, 0, -165);
  { mk(new THREE.CylinderGeometry(3, 4, 42, 16), std(0xe9ecee, 0.6), tower, 0, 21, 0); mk(new THREE.CylinderGeometry(6.4, 5.0, 6, 16), std(0x22303c, 0.15, { metalness: 0.5 }), tower, 0, 45, 0); mk(new THREE.CylinderGeometry(7, 7, 0.8, 16), std(0xe9ecee, 0.6), tower, 0, 48.4, 0); mk(new THREE.CylinderGeometry(0.15, 0.15, 6, 6), steel(), tower, 0, 51.8, 0); mk(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff3030, emissive: 0xff2020, emissiveIntensity: 1.5 }), tower, 0, 55, 0); }
  const hangar = new THREE.Group(); back.add(hangar); hangar.position.set(60, 0, -190);
  { const arc = mk(new THREE.CylinderGeometry(32, 32, 70, 32, 1, true, -PI / 2, PI), std(0xbfc6cc, 0.55, { metalness: 0.3, side: THREE.DoubleSide }), hangar, 0, -8, 0); arc.rotation.x = PI / 2; arc.scale.set(1, 1, 0.75);
    mk(new THREE.PlaneGeometry(60, 18), std(0x5a6a80, 0.6, { metalness: 0.3 }), hangar, 0, 9, 35); const hs = sign(hangar, 'HANGAR 2', 18, 3.2, { bg: '#d62f2f' }); hs.position.set(0, 21, 35.3); }
  const sock = new THREE.Group(); root.add(sock); sock.position.set(60, 0, 40); mk(new THREE.CylinderGeometry(0.08, 0.08, 7, 8), steel(), sock, 0, 3.5, 0);
  const sockM = new THREE.MeshStandardMaterial({ map: tex(128, 32, (c, w, h) => { for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff6a1a'; c.fillRect(i * w / 5, 0, w / 5, h); } }), roughness: 0.7, side: THREE.DoubleSide });
  const sockC = mk(new THREE.CylinderGeometry(0.45, 0.22, 2.6, 14, 1, true), sockM, sock, 1.3, 6.8, 0); sockC.rotation.z = PI / 2 - 0.15;
  // ground vehicles + cones near the gate (the engine beat's set dressing)
  const G = AD.gate;
  const tug = makeTug(); tug.position.set(G[0] + 12, 0, G[2] + 20); tug.rotation.y = -0.35; back.add(tug);
  const fuel = new THREE.Group(); back.add(fuel); fuel.position.set(G[0] - 14, 0, G[2] - 12); fuel.rotation.y = 0.2;
  { mk(new RoundedBoxGeometry(2.6, 2.4, 2.6, 2, 0.2), std(0xffc21a, 0.5), fuel, 3.6, 1.5, 0); mk(new THREE.CylinderGeometry(1.3, 1.3, 5.6, 18), std(0xe9ecee, 0.35, { metalness: 0.5 }), fuel, -0.7, 1.9, 0).rotation.z = PI / 2; for (const x of [-2.6, 0.2, 3.6]) for (const z of [-1.2, 1.2]) mk(new THREE.CylinderGeometry(0.55, 0.55, 0.38, 14), std(0x1b1b1d), fuel, x, 0.55, z).rotation.x = PI / 2; }
  const coneM = std(0xff7a1a, 0.6), stripeM = std(0xffffff, 0.5);
  for (const [x, z] of [[G[0] + 21, G[2] + 2], [G[0] - 26, G[2] + 3], [G[0] - 4, G[2] + 25], [G[0] - 4, G[2] - 25], [G[0] + 3, G[2] + 9.6], [G[0] - 6.5, G[2] + 9.6]]) { const c = new THREE.Group(); back.add(c); c.position.set(x, 0, z); mk(new THREE.ConeGeometry(0.22, 0.7, 12), coneM, c, 0, 0.35, 0); mk(new THREE.CylinderGeometry(0.135, 0.165, 0.1, 12), stripeM, c, 0, 0.4, 0); mk(new THREE.BoxGeometry(0.5, 0.05, 0.5), coneM, c, 0, 0.025, 0); }
  // far hills + a town strip on the horizon
  const hillM = std(0x86a86a, 1.0);
  for (let i = 0; i < 26; i++) { const a = -PI * 0.9 + i * 0.25 + h2(i, 31) * 0.1, r = 2300 + h2(i, 32) * 500; const hl = mk(new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, PI / 2), hillM, back, 900 + Math.cos(a) * r, -2, Math.sin(a) * r); hl.scale.set(220 + h2(i, 33) * 260, 60 + h2(i, 34) * 90, 200 + h2(i, 35) * 200); hl.castShadow = false; }
  // sparse far clouds for the ground shots
  const pT = puffTex();
  const farPuffM = new THREE.SpriteMaterial({ map: pT, transparent: true, depthWrite: false, opacity: 0.92, fog: false });
  const skyPuffs = new THREE.Group(); root.add(skyPuffs);
  for (let i = 0; i < 36; i++) { const sp = new THREE.Sprite(farPuffM); const a = h2(i, 41) * TAU, r = 900 + h2(i, 42) * 1800; sp.position.set(700 + Math.cos(a) * r, 300 + h2(i, 43) * 420, Math.sin(a) * r); const s = 160 + h2(i, 44) * 220; sp.scale.set(s * 2, s, 1); skyPuffs.add(sp); }

  // ---- the CLOUD LAYER (flight shots only): a deck top + puffs above it + tall towers along the flight path (x 600 … 5000)
  const clouds = new THREE.Group(); root.add(clouds); clouds.visible = false;
  const deckT = tex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { const x = h2(i) * w, y = h2(i, 2) * h, r = 18 + h2(i, 3) * 40; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(200,208,222,.55)'); gr.addColorStop(1, 'rgba(200,208,222,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); } });
  deckT.wrapS = deckT.wrapT = THREE.RepeatWrapping; deckT.repeat.set(40, 40);
  const deck = mk(new THREE.PlaneGeometry(14000, 14000), new THREE.MeshStandardMaterial({ map: deckT, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.3, emissiveMap: deckT }), clouds, 2000, AD.cloudY, 0); deck.rotation.x = -PI / 2; deck.receiveShadow = true;
  const puffM = new THREE.SpriteMaterial({ map: pT, transparent: true, depthWrite: false, opacity: 0.97 });
  const flightPuffs = [];
  for (let i = 0; i < 700; i++) {
    const sp = new THREE.Sprite(puffM), x = -1500 + h2(i, 51) * 9000, z = -1800 + h2(i, 52) * 3600, tall = i < 260;
    sp.position.set(x, AD.cloudY + (tall ? 30 + h2(i, 53) * 340 : 6 + h2(i, 53) * 26), tall ? (h2(i, 54) - 0.5) * 900 : z);
    const s = tall ? 40 + h2(i, 55) * 80 : 90 + h2(i, 55) * 140; sp.scale.set(s * 1.8, s, 1); clouds.add(sp); flightPuffs.push(sp);
  }
  root.traverse((o) => { if (o.isMesh && !o.isInstancedMesh && o !== sky && o !== deck) { o.castShadow = o.castShadow !== false; } });
  back.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  let mood = 'day';
  function setMood(m) {
    mood = m; const A = MOODS[m]; const C = (h) => new THREE.Color(h);
    skyU.uTop.value.copy(C(A.top)); skyU.uHor.value.copy(C(A.hor)); skyU.uBot.value.copy(C(A.bot)); skyU.uSunCol.value.copy(C(A.sun)); skyU.uGlow.value = A.glow; skyU.uSunDir.value.copy(SUN);
    sun.color.setHex(A.sun); sun.intensity = A.sunI; hemi.color.setHex(A.hs); hemi.groundColor.setHex(A.hg); hemi.intensity = A.hi;
    fog.color.setHex(A.fog); fog.near = A.fn; fog.far = A.ff;
    clouds.visible = m === 'air'; ground.visible = m !== 'air'; back.visible = m !== 'air'; fence.visible = m !== 'air'; skyPuffs.visible = m !== 'air'; sock.visible = m !== 'air';
  }
  setMood('day');
  function update(t) { sockC.rotation.y = 0.12 * Math.sin(t * 1.3); }
  return { root, fog, sky, skyU, sun, hemi, aimSun, setMood, get mood() { return mood; }, update, clouds, ground, back, fence, term, tower, hangar, tug, fuel, skyPuffs, flightPuffs, AD };
}

/** Paint our own airline on jet.js makeAirliner (its fuselage map is the 2048-wide GARY AIR canvas; its fin wears a 3.2 m logo). */
export function relivery(air, name = 'PRETZEL AIR') {
  const liv = tex(2048, 256, (c, w, h) => { c.fillStyle = '#f7f8fa'; c.fillRect(0, 0, w, h); c.fillStyle = '#d2452c'; c.fillRect(0, h * 0.66, w, h * 0.34); c.fillStyle = '#ffc21a'; c.fillRect(0, h * 0.62, w, h * 0.04);
    c.fillStyle = '#26303a'; for (let x = 120; x < w - 260; x += 30) { c.beginPath(); c.roundRect(x, h * 0.36, 15, 22, 6); c.fill(); }
    c.fillStyle = '#d2452c'; c.font = font(92); c.textAlign = 'center'; c.fillText(name, w * 0.62, h * 0.27); });
  liv.wrapS = THREE.ClampToEdgeWrapping;
  const logo = tex(256, 256, (c, w, h) => { c.fillStyle = '#d2452c'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 4, 0, 7); c.fill(); c.strokeStyle = '#f2c27a'; c.lineWidth = 22; c.lineCap = 'round';
    c.beginPath(); c.moveTo(80, 190); c.bezierCurveTo(20, 120, 60, 50, 128, 110); c.bezierCurveTo(196, 50, 236, 120, 176, 190); c.moveTo(80, 190); c.lineTo(170, 120); c.moveTo(176, 190); c.lineTo(86, 120); c.stroke(); });
  air.body.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const m = o.material.map;
    if (m && m.image && m.image.width === 2048 && m.image.height === 256) { o.material.map = liv; o.material.needsUpdate = true; }
    else if (m && m.image && m.image.width === 256 && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 3.2) { o.material.map = logo; o.material.needsUpdate = true; }
    if (o.material.color && o.material.color.getHex() === 0x1f5fbf) o.material.color.setHex(0xd2452c);
  });
}

// ---------------------------------------------------------------- the security checkpoint (local: travellers walk +z through the arch at the origin)
export function buildSecurity(studio) {
  const root = new THREE.Group(); studio.scene.add(root);
  const W = 14, Dp = 18;   // room x −7…7, z −14…4 (the camera side +z is open)
  const tileT = tex(128, 128, (c, w, h) => { c.fillStyle = '#d9d6cf'; c.fillRect(0, 0, w, h); c.fillStyle = '#cbc7bf'; c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 2; c.strokeRect(0, 0, w, h); });
  tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(W / 1.2, Dp / 1.2);
  const floor = mk(new THREE.PlaneGeometry(W, Dp), std(0xffffff, 0.45, { map: tileT }), root, 0, 0, -5); floor.rotation.x = -PI / 2; floor.receiveShadow = true; floor.castShadow = false;
  const wallM = std(0xeceae4, 0.8);
  mk(new THREE.BoxGeometry(W, 4.2, 0.3), wallM, root, 0, 2.1, -14);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.3, 4.2, Dp), wallM, root, s * 7, 2.1, -5);
  const ceil = mk(new THREE.BoxGeometry(W, 0.2, Dp), std(0xf4f2ee, 0.9), root, 0, 4.2, -5); ceil.castShadow = false;
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff6e6).multiplyScalar(1.3), toneMapped: false });
  for (let x = -4.5; x <= 4.5; x += 3) for (let z = -12; z <= 2; z += 3.5) { const p = mk(new THREE.PlaneGeometry(1.4, 0.5), panelM, root, x, 4.09, z); p.rotation.x = PI / 2; p.castShadow = false; }
  // back wall: big windows onto the apron (a painted view) + the departures board + SECURITY sign
  const viewT = tex(1024, 384, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#4f97e0'); g.addColorStop(0.62, '#d4ebf8'); g.addColorStop(0.62, '#a9a69f'); g.addColorStop(1, '#8f8c85'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(80 + i * 170, 60 + (i % 2) * 30, 70, 22, 0, 0, 7); c.fill(); }
    c.fillStyle = '#f4f5f7'; c.beginPath(); c.roundRect(150, 170, 520, 64, 32); c.fill(); c.fillStyle = '#d2452c'; c.fillRect(150, 214, 520, 18); c.beginPath(); c.moveTo(560, 180); c.lineTo(640, 70); c.lineTo(690, 70); c.lineTo(660, 190); c.fill();
    c.fillStyle = '#26303a'; for (let x = 200; x < 600; x += 22) c.fillRect(x, 186, 10, 12); c.fillStyle = '#ffd23f'; c.fillRect(0, 300, w, 6); });
  const win = mk(new THREE.PlaneGeometry(10, 2.6), new THREE.MeshBasicMaterial({ map: viewT, toneMapped: false, color: 0xe8e8e8 }), root, -1.2, 2.3, -13.84); win.castShadow = false;
  for (let x = -6.2; x <= 3.8; x += 2) mk(new THREE.BoxGeometry(0.12, 2.7, 0.12), steel(0x7d868f), root, x, 2.3, -13.8);
  const boardT = tex(512, 320, (c, w, h) => { c.fillStyle = '#10161f'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.font = '600 34px Inter, Arial'; c.fillText('DEPARTURES', 24, 46);
    const rows = [['PA 101', 'PRETZELTOWN', 'BOARDING'], ['PA 202', 'SNACKVILLE', 'ON TIME'], ['PA 303', 'LIFT CITY', 'DELAYED'], ['PA 404', 'DRAG LAKE', 'ON TIME'], ['PA 505', 'THRUSTON', 'CANCELLED']];
    c.font = '500 25px Inter, Arial'; rows.forEach((r, i) => { c.fillStyle = '#e8eef5'; c.fillText(r[0], 24, 100 + i * 46); c.fillText(r[1], 140, 100 + i * 46); c.fillStyle = r[2] === 'BOARDING' ? '#55e07a' : r[2] === 'DELAYED' || r[2] === 'CANCELLED' ? '#ff6a5a' : '#e8eef5'; c.fillText(r[2], 360, 100 + i * 46); }); });
  const board = mk(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshBasicMaterial({ map: boardT, toneMapped: false }), root, 5.0, 2.6, -13.82); board.castShadow = false;
  const secSign = sign(root, 'SECURITY', 3.6, 0.8, { bg: '#1f5fbf', glow: 0.3 }); secSign.position.set(0, 3.55, -2.6);
  mk(new THREE.BoxGeometry(3.7, 0.9, 0.08), std(0x1f5fbf, 0.5), root, 0, 3.55, -2.65);
  for (const x of [-1.5, 1.5]) mk(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), steel(), root, x, 3.95, -2.62);
  const poster = mk(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshStandardMaterial({ roughness: 0.7, map: tex(256, 320, (c, w, h) => { c.fillStyle = '#fff6d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#d2452c'; c.fillRect(0, 0, w, 70); c.fillStyle = '#fff'; c.font = font(44); c.textAlign = 'center'; c.fillText('REMOVE:', w / 2, 52); c.fillStyle = '#1d1d1d'; c.font = '600 30px Inter, Arial'; ['SHOES', 'BELTS', 'LAPTOPS', 'LIQUIDS', 'HOPE'].forEach((s, i) => c.fillText('• ' + s, w / 2, 120 + i * 42)); }) }), root, -6.83, 1.8, -5.5);
  poster.rotation.y = PI / 2;
  // the walk-through metal detector (opening 0.95 m wide, 2.15 m tall) + its light on top
  const det = new THREE.Group(); root.add(det);
  const detM = std(0xcfd4d9, 0.45, { metalness: 0.3 }), detDk = std(0x3a3f46, 0.5);
  for (const s of [-1, 1]) { mk(new RoundedBoxGeometry(0.22, 2.2, 0.6, 2, 0.05), detM, det, s * 0.6, 1.1, 0); mk(new THREE.BoxGeometry(0.02, 1.8, 0.45), detDk, det, s * 0.49, 1.05, 0); }
  mk(new RoundedBoxGeometry(1.44, 0.3, 0.62, 2, 0.06), detM, det, 0, 2.33, 0);
  const lampG = new THREE.MeshStandardMaterial({ color: 0x2a3a2a, emissive: 0x30ff60, emissiveIntensity: 0.0, roughness: 0.3 });
  const lamp = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16), lampG, det, 0, 2.56, 0);
  const lampLight = new THREE.PointLight(0xff3030, 0, 4, 2); lampLight.position.set(0, 2.5, 0.6); det.add(lampLight);
  const detector = { g: det, lamp, setLight(state, k = 1) { const c = state === 'red' ? 0xff2a20 : state === 'green' ? 0x30ff60 : 0x000000; lampG.emissive.setHex(c); lampG.emissiveIntensity = state === 'off' ? 0 : 2.2 * k; lampG.color.setHex(state === 'red' ? 0x5a1a1a : 0x2a3a2a); lampLight.color.setHex(c || 0xffffff); lampLight.intensity = state === 'red' ? 3 * k : 0; } };
  detector.setLight('green');
  // the x-ray machine + belt (left of the arch, along z), rollers, bins
  const xr = new THREE.Group(); root.add(xr); xr.position.set(-1.75, 0, 0);
  mk(new RoundedBoxGeometry(1.1, 1.25, 1.9, 2, 0.08), std(0xdfe3e6, 0.5), xr, 0, 0.95, -0.4);
  mk(new THREE.BoxGeometry(0.75, 0.45, 0.02), std(0x2a2d31), xr, 0, 0.75, 0.56);
  for (let i = 0; i < 6; i++) { const fl = mk(new THREE.BoxGeometry(0.11, 0.42, 0.01), std(0x2a2d31, 0.8), xr, -0.3 + i * 0.12, 0.76, 0.57); fl.castShadow = false; }
  const beltM = std(0x2a2c30, 0.9); mk(new THREE.BoxGeometry(0.8, 0.08, 6.2), beltM, xr, 0, 0.68, 0.3);
  mk(new THREE.BoxGeometry(0.9, 0.62, 6.2), steel(0xa9b0b7, 0.4, 0.5), xr, 0, 0.32, 0.3);
  const scrM = new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(256, 160, (c, w, h) => { c.fillStyle = '#0d1d2e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ff9a3a'; c.lineWidth = 6; c.beginPath(); c.ellipse(80, 90, 40, 26, 0.3, 0, 7); c.stroke(); c.strokeStyle = '#4ac8ff'; c.beginPath(); c.roundRect(140, 50, 80, 70, 10); c.stroke(); c.fillStyle = '#4ac8ff'; c.font = '600 18px Inter'; c.fillText('X-RAY', 12, 24); }) });
  const xmon = new THREE.Group(); xr.add(xmon); xmon.position.set(-0.75, 1.15, -1.0); xmon.rotation.y = 0.6; mk(new THREE.BoxGeometry(0.5, 0.36, 0.05), std(0x222428), xmon); mk(new THREE.PlaneGeometry(0.44, 0.3), scrM, xmon, 0, 0, 0.027);
  const binM = std(0x8f979f, 0.6);
  const makeBin = () => { const b = new THREE.Group(); mk(new THREE.BoxGeometry(0.6, 0.02, 0.45), binM, b, 0, 0.01, 0); for (const s of [-1, 1]) { mk(new THREE.BoxGeometry(0.6, 0.14, 0.02), binM, b, 0, 0.07, s * 0.215); mk(new THREE.BoxGeometry(0.02, 0.14, 0.45), binM, b, s * 0.29, 0.07, 0); } b.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return b; };
  const bins = []; for (let i = 0; i < 4; i++) { const b = makeBin(); xr.add(b); b.position.set(0, 0.72, 2.6 - i * 0.62); bins.push(b); }
  // stacked spare bins + the officer's podium
  { const st = new THREE.Group(); xr.add(st); st.position.set(-0.75, 0, 2.6); for (let i = 0; i < 6; i++) { const b = makeBin(); st.add(b); b.position.y = 0.02 + i * 0.05; } }
  const podium = new THREE.Group(); root.add(podium); podium.position.set(1.8, 0, -0.9); mk(new RoundedBoxGeometry(0.8, 1.05, 0.5, 2, 0.04), std(0x2f4f73, 0.6), podium, 0, 0.525, 0); mk(new THREE.BoxGeometry(0.85, 0.04, 0.55), std(0xdfe3e6, 0.5), podium, 0, 1.07, 0);
  // queue stanchions: posts + retractable belts in a switchback behind the arch (−z)
  const postM = steel(0xc9ced3, 0.25, 0.8), tapeM = std(0x1f5fbf, 0.6);
  const posts = []; for (const z of [-2.2, -3.6, -5.0]) for (const x of [-1.2, 0.6, 2.4, 4.2]) posts.push([x, z]);
  for (const [x, z] of posts) { mk(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8), postM, root, x, 0.475, z); mk(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 16), postM, root, x, 0.015, z); }
  for (const z of [-2.2, -3.6, -5.0]) for (let i = 0; i < 3; i++) { const x0 = -1.2 + i * 1.8; if ((z === -3.6 && i === 0) || (z === -2.2 && i === 2) || (z === -5.0 && i === 2)) continue; mk(new THREE.BoxGeometry(1.8, 0.05, 0.01), tapeM, root, x0 + 0.9, 0.86, z); }
  // a plant + a trash can + a "LIQUIDS" bin by the wall
  { const pl = new THREE.Group(); root.add(pl); pl.position.set(6.2, 0, -12.8); mk(new THREE.CylinderGeometry(0.3, 0.24, 0.6, 14), std(0xd9c48a), pl, 0, 0.3, 0); for (let i = 0; i < 7; i++) { const l = mk(new THREE.SphereGeometry(0.26, 10, 8), std(0x3f8f4a, 0.7), pl, Math.cos(i) * 0.2, 0.85 + (i % 3) * 0.2, Math.sin(i) * 0.2); l.scale.set(1, 1.4, 1); } }
  { const tc = new THREE.Group(); root.add(tc); tc.position.set(-5.8, 0, -1.4); mk(new THREE.CylinderGeometry(0.32, 0.28, 0.9, 14), std(0x5a6a7a, 0.5), tc, 0, 0.45, 0); const ls = sign(tc, 'LIQUIDS', 0.7, 0.22, { bg: '#d2452c' }); ls.position.set(0, 0.62, 0.33); }
  // lights
  const hemi = new THREE.HemisphereLight(0xfff8ee, 0x8a8478, 1.2); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dc, 1.6); key.position.set(3, 8, 6); key.target.position.set(0, 0, -2); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); key.shadow.bias = -0.0005;
  root.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial && o.castShadow !== false && o !== floor && o !== ceil) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, detector, bins, xr, podium, posts, lights: { hemi, key, lampLight } };
}

// ---------------------------------------------------------------- the cockpit (x forward, y up, +z = right seat; origin = floor centre under the seats)
export function makeCockpit() {
  const g = new THREE.Group();
  const trimM = std(0x5a6068, 0.6), wallM = std(0xd9dbd6, 0.75), darkM = std(0x2a2d32, 0.6), seatM = std(0x2f3438, 0.8), sheepM = std(0xe9e0cc, 1.0);
  mk(new THREE.BoxGeometry(3.4, 0.06, 2.7), std(0x4a4f56, 0.9), g, 0.1, -0.03, 0);
  // side walls with windows (boxes around the opening x 0.35…1.25, y 0.95…1.55)
  for (const s of [-1, 1]) {
    const z = s * 1.32;
    mk(new THREE.BoxGeometry(3.1, 0.95, 0.06), wallM, g, -0.05, 0.475, z);
    mk(new THREE.BoxGeometry(3.1, 0.5, 0.06), wallM, g, -0.05, 1.8, z);
    mk(new THREE.BoxGeometry(1.95, 0.6, 0.06), wallM, g, -0.62, 1.25, z);
    mk(new THREE.BoxGeometry(0.15, 0.6, 0.06), wallM, g, 1.33, 1.25, z);
    mk(new THREE.BoxGeometry(0.06, 0.6, 0.07), trimM, g, 0.35, 1.25, z);
  }
  // ceiling + the overhead panel (buttons), rear bulkhead with a door
  mk(new THREE.BoxGeometry(3.1, 0.06, 2.7), wallM, g, -0.05, 2.05, 0);
  const ovT = tex(512, 256, (c, w, h) => { c.fillStyle = '#3a3f46'; c.fillRect(0, 0, w, h); for (let i = 0; i < 64; i++) { const x = 24 + (i % 16) * 30, y = 30 + Math.floor(i / 16) * 52; c.fillStyle = '#20242a'; c.fillRect(x, y, 22, 30); c.fillStyle = ['#e8eef5', '#ffd23f', '#55e07a', '#4ac8ff'][(i * 7) % 4]; c.fillRect(x + 4, y + 4, 14, 8); } });
  const ov = mk(new THREE.BoxGeometry(1.1, 0.08, 1.3), new THREE.MeshStandardMaterial({ map: ovT, roughness: 0.6, emissive: 0xffffff, emissiveMap: ovT, emissiveIntensity: 0.25 }), g, 0.55, 1.95, 0); ov.rotation.z = 0.32;
  mk(new THREE.BoxGeometry(0.08, 2.05, 2.7), wallM, g, -1.6, 1.02, 0);
  mk(new THREE.PlaneGeometry(0.7, 1.75), std(0x8a8f96, 0.5), g, -1.55, 0.88, 0.3).rotation.y = PI / 2;
  // nose: under-panel block, glareshield, instrument panel (live canvas), windshield frame + panes
  mk(new THREE.BoxGeometry(0.9, 0.62, 2.6), darkM, g, 1.9, 0.31, 0);
  const pc = document.createElement('canvas'); pc.width = 1024; pc.height = 256; const pg = pc.getContext('2d');
  const panelT = new THREE.CanvasTexture(pc); panelT.colorSpace = THREE.SRGBColorSpace; panelT.anisotropy = 8;
  const panel = mk(new THREE.PlaneGeometry(2.5, 0.62), new THREE.MeshBasicMaterial({ map: panelT, toneMapped: false }), g, 1.47, 0.92, 0); panel.rotation.set(0, -PI / 2, 0); panel.rotateX(-0.12); panel.castShadow = false;
  mk(new THREE.BoxGeometry(0.12, 0.66, 2.62), darkM, g, 1.54, 0.92, 0);
  const glare = mk(new THREE.BoxGeometry(0.45, 0.1, 2.62), std(0x1f2226, 0.9), g, 1.52, 1.27, 0);  void glare;
  let lastSpd = -1;
  function drawPanel(knots = 150, alt = 18000, pitch = 0) {
    const key = Math.round(knots) + ':' + Math.round(alt / 100) + ':' + Math.round(pitch * 20); if (key === lastSpd) return; lastSpd = key;
    pg.fillStyle = '#26292e'; pg.fillRect(0, 0, 1024, 256);
    const scr = (x, w) => { pg.fillStyle = '#0b0f14'; pg.beginPath(); pg.roundRect(x, 18, w, 220, 12); pg.fill(); };
    // left PFD: horizon + speed tape with a big readout
    for (const x0 of [40, 560]) {
      scr(x0, 200); pg.save(); pg.beginPath(); pg.roundRect(x0 + 6, 24, 188, 208, 10); pg.clip();
      pg.translate(x0 + 100, 128); pg.rotate(0); const hy = pitch * 260; pg.fillStyle = '#3a8fe0'; pg.fillRect(-120, -200 + hy, 240, 200); pg.fillStyle = '#9a6a3a'; pg.fillRect(-120, hy, 240, 200); pg.fillStyle = '#fff'; pg.fillRect(-120, hy - 2, 240, 4);
      pg.strokeStyle = '#ffd23f'; pg.lineWidth = 6; pg.beginPath(); pg.moveTo(-60, 0); pg.lineTo(-18, 0); pg.lineTo(0, 12); pg.lineTo(18, 0); pg.lineTo(60, 0); pg.stroke(); pg.restore();
      scr(x0 + 210, 120); pg.fillStyle = '#e8eef5'; pg.font = '600 22px Inter, Arial'; pg.textAlign = 'center'; pg.fillText('SPEED', x0 + 270, 54);
      pg.fillStyle = knots > 250 ? '#ffd23f' : '#55e07a'; pg.font = '700 64px Inter, Arial'; pg.fillText(String(Math.round(knots)), x0 + 270, 140); pg.fillStyle = '#9aa3ab'; pg.font = '500 22px Inter, Arial'; pg.fillText('KNOTS', x0 + 270, 176);
      pg.fillStyle = '#e8eef5'; pg.font = '600 20px Inter, Arial'; pg.fillText('ALT ' + Math.round(alt / 100) * 100, x0 + 270, 214); pg.textAlign = 'left';
    }
    // centre: engine gauges
    scr(380, 160); for (let i = 0; i < 2; i++) { const cx = 425 + i * 70, cy = 100; pg.strokeStyle = '#55e07a'; pg.lineWidth = 6; pg.beginPath(); pg.arc(cx, cy, 26, PI * 0.75, PI * 0.75 + PI * 1.5 * clamp(0.5 + knots / 600)); pg.stroke(); pg.fillStyle = '#e8eef5'; pg.font = '600 16px Inter'; pg.textAlign = 'center'; pg.fillText('N1', cx, cy + 6); pg.textAlign = 'left'; }
    pg.fillStyle = '#ff9a3a'; pg.font = '600 18px Inter'; pg.fillText('ENG 1   ENG 2', 405, 190);
    panelT.needsUpdate = true;
  }
  drawPanel();
  // windshield: frame posts + four tinted panes, sloping back over the glareshield
  const glassM = new THREE.MeshStandardMaterial({ color: 0xbfd8ea, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const ws = new THREE.Group(); g.add(ws); ws.position.set(1.62, 1.3, 0); ws.rotation.z = 0.5;   // the frame tilts back toward the crew
  for (const z of [-1.3, -0.62, 0, 0.62, 1.3]) mk(new THREE.BoxGeometry(0.07, 0.8, 0.07), trimM, ws, 0, 0.4, z);
  mk(new THREE.BoxGeometry(0.08, 0.07, 2.66), trimM, ws, 0, 0.8, 0);
  for (const z of [-0.95, -0.31, 0.31, 0.95]) { const p = mk(new THREE.PlaneGeometry(0.6, 0.78), glassM, ws, 0, 0.4, z); p.rotation.y = PI / 2; p.castShadow = false; }
  // seats (pelvis spots), yokes, throttle pedestal
  const seat = (z) => { const s = new THREE.Group(); g.add(s); s.position.set(-0.15, 0, z); mk(new RoundedBoxGeometry(0.62, 0.16, 0.6, 2, 0.05), seatM, s, 0, 0.5, 0); const bk = mk(new RoundedBoxGeometry(0.14, 0.95, 0.58, 2, 0.05), sheepM, s, -0.33, 1.02, 0); bk.rotation.z = -0.12; mk(new RoundedBoxGeometry(0.12, 0.26, 0.4, 2, 0.05), seatM, s, -0.4, 1.6, 0); mk(new THREE.CylinderGeometry(0.06, 0.08, 0.42, 10), steel(0x6b737b), s, 0, 0.21, 0); for (const sz of [-1, 1]) mk(new THREE.BoxGeometry(0.4, 0.05, 0.06), darkM, s, 0, 0.75, sz * 0.32); return s; };
  const seatL = seat(-0.62), seatR = seat(0.62);
  const yoke = (z) => { const y = new THREE.Group(); g.add(y); y.position.set(0.95, 0, z); mk(new THREE.CylinderGeometry(0.035, 0.035, 0.75, 8), darkM, y, 0, 0.42, 0); const w = mk(new THREE.TorusGeometry(0.15, 0.025, 8, 20, PI * 1.25), darkM, y, -0.05, 0.86, 0); w.rotation.set(0, PI / 2, PI * 0.875); mk(new THREE.BoxGeometry(0.06, 0.06, 0.3), darkM, y, -0.05, 0.82, 0); return y; };
  const yokes = [yoke(-0.62), yoke(0.62)];
  const ped = new THREE.Group(); g.add(ped); ped.position.set(0.75, 0, 0); mk(new RoundedBoxGeometry(0.85, 0.72, 0.42, 2, 0.04), darkM, ped, 0, 0.36, 0);
  const thr = new THREE.Group(); ped.add(thr); thr.position.set(-0.1, 0.72, 0);
  for (const z of [-0.08, 0.08]) { mk(new THREE.BoxGeometry(0.04, 0.32, 0.03), steel(0xbfc6cc, 0.3), thr, 0, 0.16, z); mk(new THREE.CylinderGeometry(0.04, 0.04, 0.11, 10), std(0x111111, 0.4), thr, 0, 0.33, z).rotation.x = PI / 2; }
  mk(new THREE.BoxGeometry(0.5, 0.02, 0.34), std(0x3a3f46, 0.5), ped, 0, 0.73, 0);
  const cabL = new THREE.PointLight(0xfff0dc, 1.6, 4, 1.6); cabL.position.set(-0.3, 1.8, 0); g.add(cabL);
  g.traverse((o) => { if (o.isMesh && !o.material.transparent && !o.material.isMeshBasicMaterial) { o.castShadow = true; o.receiveShadow = true; } });
  const S = { seatL: [-0.15, 0.5, -0.62], seatR: [-0.15, 0.5, 0.62] };
  return { g, S, seatL, seatR, yokes, thr, ped, setSpeed: drawPanel, setThrottle(k) { thr.rotation.z = -0.5 + 1.0 * clamp(k); }, light: cabL };
}

// ---------------------------------------------------------------- small props
export function makePretzel(s = 1) {   // a trefoil knot flattened into a pretzel, with salt
  const g = new THREE.Group();
  const p = mk(new THREE.TorusKnotGeometry(0.03 * s, 0.009 * s, 90, 10, 2, 3), std(0x9a5a22, 0.35, { emissive: 0x2a1204, emissiveIntensity: 0.2 }), g); p.scale.set(1, 1, 0.38);
  const saltM = std(0xffffff, 0.4); for (let i = 0; i < 9; i++) { const a = i * 2.3; mk(new THREE.BoxGeometry(0.006 * s, 0.006 * s, 0.006 * s), saltM, g, Math.cos(a) * 0.03 * s, Math.sin(a) * 0.03 * s, 0.006 * s); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
export function makePretzelBag() {   // a tiny foil snack bag (0.09 × 0.12 m) with a PRETZELS label; `open(k)` tears the top open
  const g = new THREE.Group();
  const t = tex(256, 320, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2f6fd1'); gr.addColorStop(1, '#1d4a99'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.font = font(46); c.textAlign = 'center'; c.fillText('PRETZELS', w / 2, 120); c.fillStyle = '#fff'; c.font = '600 24px Inter, Arial'; c.fillText('1 SERVING', w / 2, 168); c.fillStyle = '#f2c27a'; c.beginPath(); c.arc(w / 2, 240, 36, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, 0, w, 18); c.fillRect(0, h - 18, w, 18); });
  const body = mk(new RoundedBoxGeometry(0.09, 0.12, 0.02, 2, 0.008), new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.5 }), g, 0, 0.06, 0); body.castShadow = true;
  const flap = new THREE.Group(); g.add(flap); flap.position.set(0, 0.12, 0); mk(new THREE.BoxGeometry(0.09, 0.025, 0.012), std(0xc9d2dc, 0.3, { metalness: 0.6 }), flap, 0, 0.0125, 0);
  return { g, body, flap, open(k) { flap.rotation.x = -1.6 * clamp(k); flap.visible = k < 0.98; } };
}
export function makeCup() {   // a paper coffee cup + lid; `setLevel(0..1)` the coffee inside (lid off: `lid.visible = false`)
  const g = new THREE.Group();
  const cupT = tex(256, 128, (c, w, h) => { c.fillStyle = '#f6f2ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#d2452c'; c.fillRect(0, 50, w, 30); c.fillStyle = '#fff'; c.font = '600 20px Inter, Arial'; c.fillText('PRETZEL AIR', 70, 72); });
  mk(new THREE.CylinderGeometry(0.045, 0.034, 0.11, 20, 1, true), new THREE.MeshStandardMaterial({ map: cupT, roughness: 0.7, side: THREE.DoubleSide }), g, 0, 0.055, 0);
  mk(new THREE.CircleGeometry(0.034, 20), std(0xf6f2ea), g, 0, 0.002, 0).rotation.x = -PI / 2;
  const coffee = mk(new THREE.CircleGeometry(0.043, 20), std(0x4a2a12, 0.2), g, 0, 0.1, 0); coffee.rotation.x = -PI / 2;
  const lid = mk(new THREE.CylinderGeometry(0.048, 0.047, 0.012, 20), std(0xffffff, 0.5), g, 0, 0.115, 0);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, coffee, lid, setLevel(k) { coffee.visible = k > 0.02; coffee.position.y = 0.006 + 0.096 * clamp(k); coffee.scale.setScalar(0.79 + 0.21 * clamp(k)); } };
}
export function makePaperPlane(map) {   // a classic dart folded from the worksheet (nose +x); the sheet texture runs over the wings
  const geo = new THREE.BufferGeometry();
  const L = 0.32, Wd = 0.12, K = 0.045;   // length, half span, keel depth
  const P = [[L / 2, 0, 0], [-L / 2, 0, 0], [-L / 2, 0.012, -Wd], [L / 2, 0, 0], [-L / 2, 0.012, Wd], [-L / 2, 0, 0], [L / 2, 0, 0], [-L / 2, -K, 0], [-L / 2, 0, 0]];
  const pos = new Float32Array(P.flat()), uv = new Float32Array(P.flatMap(([x, , z]) => [0.5 + z / (2 * Wd) * 0.9, 0.5 + x / L * 0.95]));
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, roughness: 0.85, side: THREE.DoubleSide, color: 0xffffff }));
  m.castShadow = true; const g = new THREE.Group(); g.add(m); return g;
}
export function makeWand() { const g = new THREE.Group(); mk(new RoundedBoxGeometry(0.08, 0.28, 0.025, 2, 0.01), std(0x1b1b1d, 0.4), g, 0, 0.2, 0); mk(new THREE.CylinderGeometry(0.018, 0.02, 0.14, 10), std(0x1b1b1d, 0.5), g, 0, 0.0, 0); const led = mk(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshStandardMaterial({ color: 0x5a1a1a, emissive: 0xff2a20, emissiveIntensity: 0 }), g, 0, 0.1, 0.016); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return { g, led }; }
export function makeSuitcase(color = 0x2f6fd1) { const g = new THREE.Group(); mk(new RoundedBoxGeometry(0.4, 0.55, 0.22, 3, 0.04), std(color, 0.4), g, 0, 0.33, 0); mk(new THREE.BoxGeometry(0.02, 0.3, 0.02), steel(0x8a929a), g, -0.1, 0.75, -0.09); mk(new THREE.BoxGeometry(0.02, 0.3, 0.02), steel(0x8a929a), g, 0.1, 0.75, -0.09); mk(new THREE.BoxGeometry(0.22, 0.03, 0.03), std(0x222222), g, 0, 0.9, -0.09); for (const x of [-0.15, 0.15]) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), std(0x222222), g, x, 0.03, -0.08).rotation.z = PI / 2; g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g; }
export function makeTug() {   // a baggage tug + three carts of suitcases (nose +x)
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(2.2, 1.0, 1.4, 2, 0.12), std(0xffc21a, 0.5), g, 0, 0.75, 0); mk(new THREE.BoxGeometry(0.9, 0.8, 1.3), std(0x2a2d31, 0.4), g, -0.4, 1.6, 0);
  for (const x of [-0.7, 0.7]) for (const z of [-0.65, 0.65]) mk(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 14), std(0x1b1b1d), g, x, 0.32, z).rotation.x = PI / 2;
  const cols = [0x2f6fd1, 0xd62f2f, 0x2f8f4e, 0x6a3fa0, 0xe8833a, 0x3a3f46];
  for (let k = 0; k < 3; k++) { const c = new THREE.Group(); g.add(c); c.position.set(-2.9 - k * 2.6, 0, 0); mk(new THREE.BoxGeometry(2.2, 0.12, 1.3), std(0x8a929a, 0.5, { metalness: 0.4 }), c, 0, 0.5, 0); for (const x of [-0.8, 0.8]) for (const z of [-0.6, 0.6]) mk(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 12), std(0x1b1b1d), c, x, 0.2, z).rotation.x = PI / 2;
    for (let i = 0; i < 5; i++) { const s = mk(new RoundedBoxGeometry(0.6, 0.38, 0.45, 2, 0.05), std(cols[(i + k * 2) % cols.length], 0.45), c, -0.7 + (i % 3) * 0.7, 0.75 + Math.floor(i / 3) * 0.4, (i % 2 ? 0.25 : -0.25)); s.rotation.y = (i - 2) * 0.12; } }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
export function makeBoxers(toon) {   // white boxers with red hearts over a toon's pelvis + thigh cuffs (show them when the pants come down)
  const t = tex(256, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e2302f'; for (let i = 0; i < 26; i++) { const x = (i * 37) % w, y = ((i * 53) % h); c.beginPath(); c.moveTo(x, y + 6); c.bezierCurveTo(x - 12, y - 6, x - 4, y - 14, x, y - 5); c.bezierCurveTo(x + 4, y - 14, x + 12, y - 6, x, y + 6); c.fill(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 });
  const body = toon.legL.g.parent, parts = [];
  const pel = mk(new THREE.SphereGeometry(0.172, 24, 16), m, body, 0, 0.47, 0); pel.scale.set(1, 0.74, 0.87); parts.push(pel);
  for (const leg of [toon.legL, toon.legR]) { const cuff = mk(new THREE.CylinderGeometry(0.075, 0.08, 0.13, 14), m, leg.g, 0, -0.05, 0); parts.push(cuff); }
  const pile = new THREE.Group(); body.add(pile); pile.position.set(0, 0.06, 0.02);   // the dropped pants round the ankles
  const pm = toon.M.pants.clone(); for (const s of [-1, 1]) { const r = mk(new THREE.TorusGeometry(0.085, 0.045, 8, 16), pm, pile, s * 0.085, 0, 0); r.rotation.x = PI / 2; r.scale.set(1.15, 1.25, 1); }
  parts.forEach((p) => (p.castShadow = true));
  const set = (on) => { parts.forEach((p) => (p.visible = on)); pile.visible = on; };
  set(false);
  return { parts, pile, set };
}
