// 068 — "Remember November 2026 is coming" — the polar-bear meme from the future, finally explained (Scribe promo, VOXEL style).
// The trend (checked Nov 9 2026): a 2023 TikTok of an AI polar bear on night snow, captioned in Russian "this is a November meme
// from 2026, you won't understand yet" (@gmd_arahis, Mar 27 2023), revived Aug 28 2026 as an AI bear singing "Remember November
// 2026 is coming" (@bigbakdiskk28) — Know Your Meme "Remember November 2026 Is Coming"; TikTok #remembernovember2026iscoming is full
// of "THE POLAR BEAR FINALLY REVEALED WHAT IT WAS WARNING US ABOUT?!" / "…well it's here" posts this week. Nobody real is depicted.
// Our joke: we finally learn what the bear meant — a chemistry problem set due Friday the 13th, handwritten → Scribe.
// Fact: Heinz von Foerster, Patricia Mora & Lawrence Amiot, "Doomsday: Friday, 13 November, A.D. 2026", Science 132 (1960) — the
// population-growth fit that blows up on that date (our 1960 scientist + his curve are generic, not von Foerster's likeness).
// Scribe claims (docs/lanes/scribe.md): a photo of the homework → every problem solved → written out in the student's own
// handwriting, stroke by stroke, with the figures chemistry needs (a Lewis structure) → a PDF. Subject: chemistry (packs rotate).
//
// Shots key to the narration's word times (story.json from tools/narrate.py, Fish "Authentic Conversational Storyteller", tempo 1.2):
//   hook   snow at night, the bear sits up (the 2023 pose) → close: it sings "remember, November 2026 is coming"
//   nobody POV her phone in bed (the bear video) → her confused face          places  the calendar flips 2023→2026 · a chip bag
//          "BEST BY NOV 2026" · asleep, the bear's face in the window           doom    1960 film: a scientist + his doomsday curve
//   now    the bedside clock flips to 12:00 AM NOV 1 → her eyes over the blanket   nothing  sunny morning, the whole street shrugs
//   class  the bear walks into chemistry class, kids scream     deadline  board slap · a 40-problem stack slams on her desk · her scream
//   scribe POV photo with the Scribe app → scan   hand  solved 40/40 → her face → written in her handwriting, the Lewis structure drawn
//   approve  the bear reads her phone, happy eyes, nods     dec  it leans in and whispers "December is coming" → end card
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { buildVoxTown, buildVoxClassroom, buildVoxBedroom, voxWorld, voxTree, makeVoxPerson, randomOutfit, ARMS, voxPhone, voxPaper, boxModel, nearestTex, pixelCanvas, VoxGrid, meshGrid, colorBlock, makeVoxBear } from '@engine/voxel/index.js';
import { loadHand, loadImg } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { beatClock } from '@engine/build/anim.js';
import { makeHud } from '@engine/build/brhud.js';

const PI = Math.PI;
const OFF = { snow: [60000, 0, 0], room: [0, 0, 9000], bed: [400, 0, 9000] };
const V3 = (a, o = [0, 0, 0]) => new THREE.Vector3(a[0] + o[0], a[1] + o[1], a[2] + o[2]);
const add = (a, o) => [a[0] + o[0], a[1] + o[1], a[2] + o[2]];

// ---------------------------------------------------------------- 1960 film pass (the doomsday beat only): warm grey + grain + vignette
const OLD = {
  uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 }, uT: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmt, uT; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(0.3, 0.59, 0.11));
      l = (l - 0.5) * 1.12 + 0.5;
      vec3 s = vec3(l * 1.04, l * 0.98, l * 0.88);
      float fr = floor(uT * 24.0), g = (h(floor(vUv * vec2(540.0, 960.0)) + fr) - 0.5) * 0.10;
      float sc = step(0.9975, h(vec2(floor(vUv.x * 300.0), fr))) * 0.18;
      float v = smoothstep(0.95, 0.35, length((vUv - 0.5) * vec2(1.0, 0.75)));
      gl_FragColor = vec4(mix(c, (s + g + sc) * mix(0.55, 1.0, v), uAmt), 1.0);
    }`,
};

// ---------------------------------------------------------------- canvases
function nightSky() {          // zenith at the canvas top, horizon at y ≈ 413 (the dome spans 0.62π)
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#070d22'); gr.addColorStop(0.5, '#13214a'); gr.addColorStop(0.8, '#2a4277'); gr.addColorStop(1, '#2f4a80');
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 512);
  const r = rng(11);
  for (let i = 0; i < 1400; i++) { const x = Math.floor(r() * 2048), y = Math.floor(Math.pow(r(), 1.3) * 380), s = r() < 0.12 ? 2 : 1; g.fillStyle = `rgba(255,255,255,${0.45 + 0.55 * r()})`; g.fillRect(x, y, s, s); }
  // aurora: soft green bands low in the north
  for (let k = 0; k < 3; k++) { const a = g.createLinearGradient(0, 230, 0, 380); a.addColorStop(0, 'rgba(90,255,170,0)'); a.addColorStop(0.6, `rgba(90,255,170,${0.10 + 0.04 * k})`); a.addColorStop(1, 'rgba(90,255,170,0)');
    g.fillStyle = a; g.beginPath(); g.moveTo(0, 380); for (let x = 0; x <= 2048; x += 32) g.lineTo(x, 300 - 40 * Math.sin(x / 210 + k * 1.7) - 18 * k); g.lineTo(2048, 380); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}
function moonTex() {
  return nearestTex(pixelCanvas(32, 32, (g) => {
    g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, 32, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot(x - 15.5, y - 15.5); if (d < 14) { g.fillStyle = d > 12.5 ? '#dfe6f2' : '#f4f6fb'; g.fillRect(x, y, 1, 1); } }
    g.fillStyle = '#d3dbe9'; for (const [x, y, s] of [[10, 9, 4], [19, 15, 5], [12, 20, 3], [21, 8, 2]]) g.fillRect(x, y, s, s);
  }));
}
/** a pixel portrait of our bear on night snow (calendar, phone video, chip bag) */
function bearPic(g, x, y, w, h, { night = true } = {}) {
  g.fillStyle = night ? '#132449' : '#9fd2f2'; g.fillRect(x, y, w, h);
  g.fillStyle = '#e9eef6'; g.fillRect(x, y + h * 0.72, w, h * 0.28);
  if (night) { g.fillStyle = '#f4f6fb'; g.fillRect(x + w * 0.76, y + h * 0.1, w * 0.1, w * 0.1); g.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 9; i++) g.fillRect(x + ((i * 37) % 97) / 97 * w, y + ((i * 53) % 61) / 61 * h * 0.5, 1, 1); }
  const u = w / 20, bx = x + w * 0.5, by = y + h * 0.78;
  g.fillStyle = '#f2efe6'; g.fillRect(bx - 4 * u, by - 9 * u, 8 * u, 9 * u);            // body (sitting up)
  g.fillRect(bx - 3 * u, by - 14 * u, 6 * u, 5.5 * u);                                   // head
  g.fillRect(bx - 3 * u, by - 15 * u, 1.5 * u, 1.5 * u); g.fillRect(bx + 1.5 * u, by - 15 * u, 1.5 * u, 1.5 * u);
  g.fillStyle = '#ece4d3'; g.fillRect(bx - 1.5 * u, by - 11.5 * u, 3 * u, 2.2 * u);
  g.fillStyle = '#1d1d22'; g.fillRect(bx - 0.6 * u, by - 11.6 * u, 1.2 * u, 0.9 * u); g.fillRect(bx - 2.2 * u, by - 13 * u, u, u); g.fillRect(bx + 1.2 * u, by - 13 * u, u, u);
  g.fillStyle = '#d6ccb8'; g.fillRect(bx - 3.5 * u, by - u, 2.5 * u, u); g.fillRect(bx + u, by - u, 2.5 * u, u);
}

export async function build(studio, story) {
  const { scene, camera, setCamera } = studio;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), WE = (b, w, n) => B.WE(b, w, n), END = story.duration;
  const old = new ShaderPass(OLD); studio.composer.addPass(old); old.enabled = false;
  const HAND = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const ENDC = WE('dec', 'coming') + 0.55;
  const hud = makeHud({ show: [0, 0], end: { t: ENDC, icon: '/videos/049-scribe-promo/scribe-icon.png', tag: 'Your homework, in your handwriting.', url: 'tryscribe.ink', offer: '10 free assignments ✦' } });

  // ---- the shot list (absolute times from the narration)
  const T = {
    close: W('hook', 'remember') - 0.1, phone: W('nobody', 'nobody'), face: W('nobody', 'what') - 0.05, cal: W('nobody', 'for'),
    chips: W('places', 'on', 2), dream: W('places', 'in'), doom: W('doom', 'a'), board: W('doom', 'for'),
    now: W('now', 'well'), flip: W('now', 'its'), eyes: W('now', 'november') + 0.15, town: W('nothing', 'and'), shrug: W('nothing', 'happened'),
    cls: W('class', 'until'), dl: W('deadline', 'it'), slap: W('deadline', 'deadline') + 0.05, stack: W('deadline', 'forty') - 0.05, hw: W('deadline', 'handwritten') - 0.06,
    pov: W('scribe', 'so'), snap: W('scribe', 'photo') + 0.05, scr: W('scribe', 'of') + 0.1, solve: W('hand', 'solved'), awe: W('hand', 'wrote') - 0.05,
    write: W('hand', 'handwriting') - 0.15, lewis: W('hand', 'lewis'), appr: W('approve', 'the'), nod: W('approve', 'approved'), dec: W('dec', 'then'),
    december: W('dec', 'december'), endc: ENDC,
  };
  const SHOTS = [
    ['snowWide', 0], ['snowClose', T.close], ['phonePov', T.phone], ['phoneFace', T.face], ['calendar', T.cal], ['chips', T.chips], ['dream', T.dream],
    ['doomWide', T.doom], ['doomBoard', T.board], ['clock', T.now], ['blanket', T.eyes], ['town', T.town], ['door', T.cls],
    ['slap', T.dl], ['stack', T.stack], ['scream', T.hw], ['pov', T.pov], ['screen', T.scr], ['awe', T.awe], ['screen2', T.write],
    ['approve', T.appr], ['whisper', T.dec],
  ].map(([cam, t0], i, a) => ({ cam, t0, t1: i + 1 < a.length ? a[i + 1][1] : 1e9 }));
  window.EDSTUDIO_CUTS = SHOTS.slice(1).map((s) => s.t0);

  // ---------------------------------------------------------------- sets
  const town = buildVoxTown(studio, { school: true });
  const townFog = scene.fog;
  const snowW = voxWorld(studio, { size: 3000, ground: 'snow', clouds: false, far: false, fogNear: 30, fogFar: 260 });
  const snowFog = scene.fog; snowW.root.position.set(...OFF.snow); snowW.ground.position.y = 0;
  snowW.sky.material.map = nightSky(); snowW.sky.material.needsUpdate = true;
  snowFog.color.set(0x16264c);
  snowW.hemi.color.set(0x9fb6e8); snowW.hemi.groundColor.set(0x51607f); snowW.hemi.intensity = 1.55;
  snowW.sun.color.set(0xd6e4ff); snowW.sun.intensity = 1.9;
  { // snowy terrain: mounds, ice blocks, snow-capped spruces
    const G = new VoxGrid(), R = rng(4), ice = colorBlock(0xbfe3f5);
    for (let i = 0; i < 26; i++) { const a = R() * PI * 2, d = 7 + R() * 50, x = Math.round(Math.cos(a) * d), z = Math.round(Math.sin(a) * d); if (z < -2 && Math.abs(x) < 6) continue; G.blob(x, 0, z, 1.5 + R() * 2.5, 0.8 + R() * 1.4, 1.5 + R() * 2.5, 'snow', 0.3, 20 + i); }
    for (const [x, z] of [[-4, 6], [5, 9], [-9, 3], [8, 4], [3, 14]]) G.fill(x, 0, z, x + (z % 2), 0 + (x % 2 ? 1 : 0), z + 1, ice);
    for (let i = 0; i < 18; i++) {
      const a = 0.4 + R() * 2.4, d = 14 + R() * 40, x = Math.round(Math.cos(a) * d * 1.3), z = Math.round(Math.sin(a) * d);
      const h = 4 + Math.floor(R() * 4); G.fill(x, 0, z, x, h - 1, z, 'log');
      for (let k = 0; k < h - 1; k++) { const r = Math.max(0, Math.floor((h - k) / 2) - 0); G.fill(x - r, 2 + k, z - r, x + r, 2 + k, z + r, k % 2 ? 'snow' : 'leaves', { ifEmpty: true }); }
      G.set(x, h + 1, z, 'snow');
    }
    snowW.root.add(meshGrid(G, { bs: 1, ao: true }));
  }
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, alphaTest: 0.5, fog: false, toneMapped: false }));
  moon.renderOrder = -5; snowW.root.add(moon);
  // falling snow: pixel flakes in a box around the camera
  const NF = 700, flakes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xf4f8ff, fog: false }), NF);
  flakes.frustumCulled = false; scene.add(flakes);
  const FR = rng(9), FS = Array.from({ length: NF }, () => [FR(), FR(), FR(), FR()]);
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  function snowfall(t, on) {
    flakes.visible = on; if (!on) return;
    const c = camera.position;
    for (let i = 0; i < NF; i++) {
      const [a, b, d, e] = FS[i], H = 9;
      _p.set(c.x + (a - 0.5) * 16 + Math.sin(t * 0.7 + e * 9) * 0.3, c.y - 3 + ((b * H - t * (0.55 + 0.35 * e)) % H + H) % H, c.z + (d - 0.15) * 18);
      const near = _p.distanceTo(c) < 1.6; const s = near ? 0 : 0.035 + 0.035 * e;
      _m.compose(_p, _q, _s.setScalar(s)); flakes.setMatrixAt(i, _m);
    }
    flakes.instanceMatrix.needsUpdate = true;
  }

  const room = buildVoxClassroom(studio, { board: [' ', ' ', ' '] }); room.root.position.set(...OFF.room);
  // turn the desks so the chair sits behind the desk and the kid faces the board (−z)
  const deskObjs = room.root.children.filter((c) => room.D.desks.some(([x, z]) => Math.abs(c.position.x - x) < 1e-3 && Math.abs(c.position.z - z) < 1e-3));
  deskObjs.forEach((d) => (d.rotation.y = 0));
  // a big chalk overlay IN FRONT of the set's board (CLAUDE.md: the set font is too small)
  const boardC = document.createElement('canvas'); boardC.width = 480; boardC.height = 176; const bg2 = boardC.getContext('2d');
  const boardTex = new THREE.CanvasTexture(boardC); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.magFilter = THREE.NearestFilter; boardTex.minFilter = THREE.LinearFilter;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.4), new THREE.MeshLambertMaterial({ map: boardTex })); board.position.set(-0.5, 2.2, 0.04); room.root.add(board);
  let boardKey = '';
  function setBoard(mode) {
    if (mode === boardKey) return; boardKey = mode;
    const g = bg2; g.imageSmoothingEnabled = false; g.fillStyle = '#2f5e46'; g.fillRect(0, 0, 480, 176); g.strokeStyle = '#8a5a33'; g.lineWidth = 8; g.strokeRect(4, 4, 472, 168);
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % 470, (i * 61) % 170, 18, 2);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#eef3ea';
    if (mode === 'chem') {
      g.font = 'bold 26px monospace'; g.fillText('CHEMISTRY  ·  ROOM 4', 240, 44); g.font = 'bold 20px monospace'; g.fillText('TODAY: LEWIS STRUCTURES', 240, 84);
      g.font = 'bold 30px monospace'; g.fillText('H — O — H', 240, 132);
    } else if (mode === 'deadline') {
      g.font = 'bold 20px monospace'; g.fillText('PROBLEM SET 4', 232, 30); g.fillStyle = '#ffd23f'; g.font = 'bold 30px monospace'; g.fillText('DUE FRI', 232, 70); g.fillText('NOV 13', 232, 108);
      g.fillStyle = '#ff8a7a'; g.font = 'bold 20px monospace'; g.fillText('HANDWRITTEN', 232, 148);
    } else if (mode === 'doom') {
      g.textAlign = 'left'; g.font = 'bold 22px monospace'; g.fillText('POPULATION N(t)', 26, 30);
      g.strokeStyle = '#eef3ea'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 160); g.lineTo(250, 160); g.moveTo(30, 160); g.lineTo(30, 46); g.stroke();
      g.beginPath(); for (let i = 0; i <= 60; i++) { const x = 34 + i * 3.4, y = 156 - 6 / Math.max(0.05, (1 - i / 62)) ; i ? g.lineTo(x, Math.max(48, y)) : g.moveTo(x, y); } g.stroke();
      g.setLineDash([6, 6]); g.beginPath(); g.moveTo(246, 160); g.lineTo(246, 46); g.stroke(); g.setLineDash([]);
      g.textAlign = 'center'; g.font = 'bold 30px monospace'; g.font = 'bold 27px monospace'; g.fillText('DOOMSDAY', 384, 50); g.fillStyle = '#ffe9a8'; g.font = 'bold 26px monospace'; g.fillText('FRI 13 NOV', 384, 98); g.font = 'bold 32px monospace'; g.fillText('2026', 384, 142);
    } else if (mode === 'dec') {
      g.font = 'bold 30px monospace'; g.fillText('PROBLEM SET 4', 240, 40); g.fillStyle = '#9fe0a6'; g.font = 'bold 36px monospace'; g.fillText('✓ TURNED IN', 240, 100);
    }
    boardTex.needsUpdate = true;
  }
  setBoard('chem');
  // the doorway: a lit hallway over the door blocks + a door leaf swung into the room
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.4), new THREE.MeshBasicMaterial({ map: nearestTex(pixelCanvas(16, 38, (g) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, 16, 38); g.fillStyle = '#cdbd9c'; g.fillRect(0, 30, 16, 8); g.fillStyle = '#b9a885'; g.fillRect(0, 29, 16, 1); g.fillStyle = '#f6efde'; g.fillRect(5, 2, 6, 2); })), toneMapped: false }));
  hall.rotation.y = PI / 2; hall.position.set(room.D.x0 + 0.012, 1.2, 6.5); room.root.add(hall);
  const leafG = new THREE.Group(); leafG.position.set(room.D.x0 + 0.02, 0, 7.0); room.root.add(leafG);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 1.0), new THREE.MeshLambertMaterial({ color: 0x8a5a33 })); leaf.position.set(0.04, 1.2, -0.5); leafG.add(leaf);
  // the stack of 40 worksheets (her desk), its top sheet shows the chem page
  const bed = buildVoxBedroom(studio); bed.root.position.set(...OFF.bed);
  const bedView = bed.root.children.find((c) => c.isMesh && c.geometry.type === 'PlaneGeometry' && c.position.z < -20);
  const nightView = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ map: nearestTex(pixelCanvas(128, 72, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 72); gr.addColorStop(0, '#0b1430'); gr.addColorStop(0.62, '#24396a'); g.fillStyle = gr; g.fillRect(0, 0, 128, 72);
    g.fillStyle = '#e9eef6'; g.fillRect(0, 46, 128, 26); g.fillStyle = '#cfd9e8'; for (let x = 0; x < 128; x += 7) g.fillRect(x, 44 - ((x * 7) % 4), 6, 3);
    g.fillStyle = '#1d3a2c'; for (let x = 5; x < 128; x += 13) { g.fillRect(x, 34, 4, 12); g.fillRect(x - 1, 38, 6, 4); } g.fillStyle = '#e9eef6'; for (let x = 5; x < 128; x += 13) g.fillRect(x, 33, 4, 2);
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 60; i++) g.fillRect((i * 53) % 128, (i * 29) % 30, 1, 1); g.fillStyle = '#f4f6fb'; g.fillRect(96, 6, 7, 7);
  })), fog: false, toneMapped: false }));
  nightView.position.set(2, 2.2, -4.2); bed.root.add(nightView);
  const lampL = new THREE.PointLight(0xffc27a, 0, 6, 1.4); lampL.position.set(-0.55, 1.05, 0.55); bed.root.add(lampL);
  const glowL = new THREE.PointLight(0x9fd0ff, 0, 2.2, 1.5); bed.root.add(glowL);
  const winL = new THREE.PointLight(0xcfe0ff, 0, 3.4, 1.4); bed.root.add(winL);
  function bedMode(m) {
    const night = m === 'night', L = bed.lights;
    L.hemi.intensity = night ? 0.42 : 1.15; L.hemi.color.set(night ? 0x8fa6d8 : 0xfdf6ea); L.hemi.groundColor.set(night ? 0x3a3448 : 0x9a8c78);
    L.sun.intensity = night ? 0.55 : 1.3; L.sun.color.set(night ? 0xbcd2ff : 0xfff1dc);
    bed.fill.intensity = night ? 0.6 : 4; lampL.intensity = night ? 2.2 : 0;
    nightView.visible = night; if (bedView) bedView.visible = !night;
  }
  // nightstand + digital clock
  const stand = boxModel([[-3, 0, -2, 2, 4, 2, 0x8a5a33], [-3, 5, -2, 2, 5, 2, 0xc89b62], [-2, 2, 3, 1, 2, 3, 0x6d4a2c]], { bs: 0.125 }); stand.position.set(-0.55, 0, 0.4); bed.root.add(stand);
  const clockC = document.createElement('canvas'); clockC.width = 160; clockC.height = 80; const cg = clockC.getContext('2d');
  const clockTex = new THREE.CanvasTexture(clockC); clockTex.colorSpace = THREE.SRGBColorSpace;
  const clockBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.17, 0.12), new THREE.MeshLambertMaterial({ color: 0x26282c })); clockBox.position.set(-0.6, 0.835, 0.5); bed.root.add(clockBox);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: clockTex, toneMapped: false })); clockFace.position.set(-0.6, 0.835, 0.561); bed.root.add(clockFace);
  let clockKey = '';
  function setClock(a, b) {
    if (clockKey === a + b) return; clockKey = a + b;
    cg.fillStyle = '#120808'; cg.fillRect(0, 0, 160, 80); cg.fillStyle = '#ff4b3a'; cg.textAlign = 'center'; cg.font = 'bold 46px monospace'; cg.fillText(a, 80, 48);
    cg.font = 'bold 15px monospace'; cg.fillStyle = '#ff8f7a'; cg.fillText(b, 80, 70); clockTex.needsUpdate = true;
  }
  // wall calendar (flips 2023 → 2026)
  const calC = document.createElement('canvas'); calC.width = 120; calC.height = 170; const kg = calC.getContext('2d'); kg.imageSmoothingEnabled = false;
  const calTex = new THREE.CanvasTexture(calC); calTex.colorSpace = THREE.SRGBColorSpace; calTex.magFilter = THREE.NearestFilter;
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.02), new THREE.MeshLambertMaterial({ map: calTex })); cal.position.set(0.25, 1.72, 0.03); bed.root.add(cal);
  const calLeafG = new THREE.Group(); calLeafG.position.set(0.25, 1.72 + 0.51, 0.045); bed.root.add(calLeafG);
  const calLeafC = document.createElement('canvas'); calLeafC.width = 120; calLeafC.height = 170; const klg = calLeafC.getContext('2d');
  const calLeafTex = new THREE.CanvasTexture(calLeafC); calLeafTex.colorSpace = THREE.SRGBColorSpace; calLeafTex.magFilter = THREE.NearestFilter;
  const calLeaf = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.02), new THREE.MeshLambertMaterial({ map: calLeafTex, side: THREE.DoubleSide })); calLeaf.position.y = -0.51; calLeafG.add(calLeaf);
  function calPage(g, year, month = 'NOVEMBER', mark = false) {
    g.fillStyle = '#f3f1ec'; g.fillRect(0, 0, 120, 170); g.fillStyle = '#26282c'; g.fillRect(56, 0, 8, 4);
    bearPic(g, 6, 8, 108, 70);
    g.fillStyle = '#b3261e'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText(`${month} ${year}`, 60, 94);
    g.fillStyle = '#9a9a96'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(8 + c * 15, 102 + r * 13, 13, 11);
    g.fillStyle = '#f3f1ec'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(9 + c * 15, 103 + r * 13, 11, 9);
    if (mark) { g.strokeStyle = '#d8413a'; g.lineWidth = 2; g.strokeRect(8 + 5 * 15 - 1, 102 + 1 * 13 - 1, 15, 13); g.fillStyle = '#d8413a'; g.font = 'bold 8px monospace'; g.fillText('13', 8 + 5 * 15 + 6.5, 102 + 13 + 9); }
  }
  const YEARS = [2023, 2024, 2025, 2026];
  let calKey = '';
  function setCal(t) {   // flips every ~0.42 s from T.cal + 0.15; lands on NOVEMBER 2026 by "calendars"
    const step = (W('places', 'calendars') - (T.cal + 0.25)) / 3, k = clamp((t - (T.cal + 0.25)) / step, 0, 3), i = Math.floor(k), f = k - i;
    const key = `${i}`; if (key !== calKey) { calKey = key; calPage(kg, YEARS[Math.min(3, i + (i < 3 ? 1 : 0))], 'NOVEMBER', i + 1 >= 3); calPage(klg, YEARS[i], 'NOVEMBER', i >= 3); calTex.needsUpdate = calLeafTex.needsUpdate = true; }
    calLeafG.rotation.x = i >= 3 ? 0 : -smooth(f / 0.7) * 2.6; calLeaf.visible = i < 3 || true;
    if (i >= 3) { calPage(klg, 2026, 'NOVEMBER', true); if (calKey !== 'end') { calKey = 'end'; calTex.needsUpdate = calLeafTex.needsUpdate = true; } }
  }
  // chip bag: "SNOW CHIPS — BEST BY NOV 2026"
  const chipC = pixelCanvas(64, 84, (g) => {
    g.fillStyle = '#2f6fd8'; g.fillRect(0, 0, 64, 84); g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#b3261e'; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText('SNOW CHIPS', 32, 12);
    bearPic(g, 8, 20, 48, 38); g.fillStyle = '#f3f1ec'; g.fillRect(4, 62, 56, 18); g.fillStyle = '#26282c'; g.font = 'bold 7px monospace'; g.fillText('BEST BY', 32, 70); g.fillStyle = '#d8413a'; g.font = 'bold 10px monospace'; g.fillText('NOV 2026', 32, 79);
  });
  const chips = new THREE.Group(); bed.root.add(chips);
  { const f = new THREE.MeshLambertMaterial({ map: nearestTex(chipC) }), s = new THREE.MeshLambertMaterial({ color: 0x2f6fd8 }), cr = new THREE.MeshLambertMaterial({ color: 0xc9a227 });
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.08), [s, s, s, s, f, s]); bag.position.y = 0.17; bag.castShadow = true; chips.add(bag);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.03, 0.02), cr); top.position.y = 0.345; chips.add(top); chips.userData.bag = bag; }

  // ---------------------------------------------------------------- people + the bear
  const hero = makeVoxPerson({ height: 1.5, skin: 0xe8b48e, hair: 0x3a2214, hairStyle: 'ponytail', top: 'hoodie', shirt: 0x8a55c9, pants: 0x34405c, shoes: 0xf3f1ec });
  scene.add(hero.root);
  const heroHead = [hero.headMesh, ...hero.head.children.filter((c) => c !== hero.headMesh)];
  const showHead = (on) => { heroHead.forEach((m) => (m.visible = on)); hero.torso.visible = on; };
  const sci = makeVoxPerson({ height: 1.78, skin: 0xf1c8a4, hair: 0x9a9a9a, hairStyle: 'short', top: 'shirt', shirt: 0xf3f1ec, tie: 0x26282c, glasses: true, pants: 0x5a6270, shoes: 0x26282c });
  scene.add(sci.root);
  const kids = Array.from({ length: 9 }, (_, i) => { const p = makeVoxPerson({ height: 1.48 + (i % 3) * 0.05, ...randomOutfit(300 + i * 7) }); scene.add(p.root); return p; });
  const folks = Array.from({ length: 5 }, (_, i) => { const p = makeVoxPerson({ height: 1.72 + (i % 2) * 0.08, ...randomOutfit(500 + i * 11) }); scene.add(p.root); return p; });
  const bear = makeVoxBear(); scene.add(bear.root);
  const quilt = boxModel([[0, 0, 0, 9, 6, 1, 0x3c6fd8], [0, 6, 0, 9, 6, 1, 0xf3f1ec], [2, 2, 1, 3, 3, 1, 0x2f5fc0], [6, 1, 1, 7, 2, 1, 0x2f5fc0]], { bs: 0.1 }); quilt.children.forEach((m) => m.position.x -= 0.5); bed.root.add(quilt);   // pulled up to her nose
  const blanket = boxModel([[0, 0, 0, 13, 1, 13, 0x3c6fd8], [0, 2, 0, 13, 2, 1, 0xf3f1ec]], { bs: 0.125 }); bed.root.add(blanket);   // over her (lying / sitting up)
  const phoneC = document.createElement('canvas'); phoneC.width = 600; phoneC.height = 1280; const pg = phoneC.getContext('2d');
  const phoneTex = new THREE.CanvasTexture(phoneC); phoneTex.colorSpace = THREE.SRGBColorSpace; phoneTex.anisotropy = 8;
  const phone = voxPhone(phoneTex, { case: 0x26282c }); scene.add(phone);
  const dreamC = pixelCanvas(96, 104, (g) => {     // a dream bubble: the bear singing on night snow, zZz
    g.clearRect(0, 0, 96, 104); g.fillStyle = '#f7f8fc';
    for (const [x, y, r] of [[48, 44, 40], [22, 40, 18], [74, 40, 18], [30, 66, 18], [66, 66, 18], [48, 18, 18], [14, 96, 5], [24, 86, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.save(); g.beginPath(); g.arc(48, 46, 34, 0, 7); g.clip(); bearPic(g, 14, 12, 68, 68); g.restore();
    g.fillStyle = '#3c6fd8'; g.font = 'bold 12px monospace'; g.fillText('z', 84, 14); g.font = 'bold 9px monospace'; g.fillText('z', 90, 6);
  });
  const dreamB = new THREE.Sprite(new THREE.SpriteMaterial({ map: nearestTex(dreamC), transparent: true, alphaTest: 0.3, fog: false })); dreamB.visible = false; scene.add(dreamB);
  const chalk = boxModel([[0, 0, 0, 0, 0, 5, 0xf3f1ec]], { bs: 0.03 }); scene.add(chalk);
  // the 40-sheet stack + loose sheets
  const ws = subjectSheet(HAND, 'chemistry', { name: 'Maya', note: 'Due Fri, Nov 13  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 10' });
  const wsBlank = subjectSheet(HAND, 'chemistry', { name: '', note: 'Due Fri, Nov 13  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 10' }); wsBlank.draw(0, true);
  const stack = new THREE.Group(); scene.add(stack);
  { const side = new THREE.MeshLambertMaterial({ color: 0xf1eee4 }), edge = new THREE.MeshLambertMaterial({ color: 0xdcd6c6 });
    for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.216, 0.016, 0.279), i % 2 ? side : edge); m.position.set(Math.sin(i * 2.3) * 0.006, 0.008 + i * 0.016, Math.cos(i * 1.7) * 0.006); m.rotation.y = Math.sin(i * 1.1) * 0.03; m.castShadow = true; stack.add(m); }
    const top = voxPaper(wsBlank.tex); top.position.y = 0.193; stack.add(top); }

  // lewis box on the sheet (canvas px) for the app's zoom: problem 2's figure (the molecule on the left)
  const bb = [1e9, 1e9, -1e9, -1e9];
  for (const it of ws.items.filter((q) => q.pi === 1)) {
    const pts = it.kind === 'g' ? [[it.x, it.y], [it.x + it.w, it.y + it.h]] : it.pts;
    for (const [x, y] of pts) if (x < 480) { bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.max(bb[2], x); bb[3] = Math.max(bb[3], y); }
  }
  const fig0 = ws.items.findIndex((q) => q.pi === 1), fig1 = ws.items.findIndex((q) => q.pi === 2);
  const wAt = (n) => ws.items.slice(0, n).reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);
  const P_FIG0 = wAt(fig0), P_FIG1 = wAt(fig1 < 0 ? ws.items.length : fig1);

  // ---------------------------------------------------------------- the phone screens (portrait 600 × 1280)
  const RED = '#9a1c25', CREAM = '#f3f1eb';
  const bar = (g) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 600, 110); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 110, 600, 3);
    g.drawImage(icon, 26, 22, 66, 66); g.fillStyle = '#1d1d1d'; g.font = '50px Georgia, serif'; g.textAlign = 'left'; g.fillText('Scribe', 104, 72);
    g.fillStyle = '#f1e3c4'; g.beginPath(); g.roundRect(600 - 236, 32, 210, 46, 23); g.fill(); g.fillStyle = RED; g.font = '600 26px Inter, Arial'; g.textAlign = 'center'; g.fillText('Chemistry', 600 - 131, 64);
  };
  const deskView = document.createElement('canvas'); deskView.width = 600; deskView.height = 1280;
  { const v = deskView.getContext('2d'); v.fillStyle = '#c89b62'; v.fillRect(0, 0, 600, 1280); v.fillStyle = '#b98a52'; for (let y = 0; y < 1280; y += 64) v.fillRect(0, y, 600, 6);
    v.fillStyle = 'rgba(0,0,0,.25)'; v.fillRect(86, 300, 446, 578); v.save(); v.translate(300, 580); v.rotate(-0.03); v.drawImage(wsBlank.canvas, -220, -285, 440, 570); v.restore(); }
  let phoneKey = '';
  function drawPhone(mode, k = 0, zoom = 0) {
    const key = `${mode}:${Math.round(k * 80)}:${Math.round(zoom * 60)}`; if (key === phoneKey) return; phoneKey = key;
    const g = pg, Wd = 600, H = 1280; g.textAlign = 'left';
    if (mode === 'video') {                     // the bear video in a generic short-video player
      g.fillStyle = '#0b0d14'; g.fillRect(0, 0, Wd, H); bearPic(g, 0, 160, Wd, 900);
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 1040, Wd, 240); g.fillStyle = '#fff'; g.font = '600 34px Inter, Arial'; g.fillText('remember november', 30, 1100); g.fillText('2026 is coming', 30, 1146);
      g.font = '500 26px Inter, Arial'; g.fillStyle = '#c9d1db'; g.fillText('posted 2023', 30, 1196);
      for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(540, 640 + i * 120, 30, 0, 7); g.fill(); }
      g.fillStyle = '#ff3b5c'; g.beginPath(); g.arc(540, 640, 22, 0, 7); g.fill();
    } else if (mode === 'cam' || mode === 'flash' || mode === 'scan') {
      g.drawImage(deskView, 0, 0, Wd, H); bar(g);
      if (mode !== 'scan') {
        g.strokeStyle = '#fff'; g.lineWidth = 8; const L = 60;
        for (const [x, y, sx, sy] of [[90, 300, 1, 1], [Wd - 90, 300, -1, 1], [90, 880, 1, -1], [Wd - 90, 880, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }
        g.fillStyle = 'rgba(20,20,20,.62)'; g.beginPath(); g.roundRect(Wd / 2 - 220, 1060, 440, 64, 32); g.fill();
        g.fillStyle = '#fff'; g.font = '600 32px Inter, Arial'; g.textAlign = 'center'; g.fillText('Snap your homework', Wd / 2, 1103);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(Wd / 2, 1192, 46, 0, 7); g.fill(); g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.arc(Wd / 2, 1192, 36, 0, 7); g.stroke();
        if (mode === 'flash') { g.fillStyle = `rgba(255,255,255,${1 - k})`; g.fillRect(0, 0, Wd, H); }
      } else {
        const sy = 120 + (H - 120) * k; g.fillStyle = 'rgba(154,28,37,.2)'; g.fillRect(0, 120, Wd, sy - 120); g.fillStyle = RED; g.fillRect(0, sy - 5, Wd, 10);
        g.fillStyle = 'rgba(251,250,246,.96)'; g.beginPath(); g.roundRect(30, 860, Wd - 60, 300, 26); g.fill();
        g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '44px Georgia, serif'; g.fillText('Reading your homework…', Wd / 2, 930);
        g.font = '600 56px Inter, Arial'; g.fillText('40 problems', Wd / 2, 1014); g.font = '500 32px Inter, Arial'; g.fillStyle = '#6b665c'; g.fillText('Chemistry · Problem Set 4', Wd / 2, 1066);
        g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(70, 1100, Wd - 140, 16, 8); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(70, 1100, (Wd - 140) * k, 16, 8); g.fill();
      }
    } else if (mode === 'solve') {
      g.fillStyle = CREAM; g.fillRect(0, 0, Wd, H); bar(g);
      const n = Math.round(40 * k);
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '48px Georgia, serif'; g.fillText(n >= 40 ? 'All 40 solved.' : `Solving… ${n}/40`, Wd / 2, 200);
      g.font = '600 26px Inter, Arial'; g.fillStyle = RED; g.fillText('CHEMISTRY · PROBLEM SET 4', Wd / 2, 250);
      for (let i = 0; i < 40; i++) {
        const cx = 48 + (i % 5) * 104, cy = 300 + Math.floor(i / 5) * 92, done = i < n;
        g.fillStyle = done ? '#2f9e5b' : '#e3ddd0'; g.beginPath(); g.roundRect(cx, cy, 92, 78, 14); g.fill();
        g.fillStyle = done ? '#fff' : '#8a8578'; g.font = '600 32px Inter, Arial'; g.fillText(done ? '✓' : String(i + 1), cx + 46, cy + 51);
      }
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 1080, Wd - 100, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 1080, (Wd - 100) * k, 18, 9); g.fill();
      g.fillStyle = '#6b665c'; g.font = '500 28px Inter, Arial'; g.fillText('Balance · Lewis · Molar mass · ICE tables', Wd / 2, 1150);
    } else {                                    // write / done: the page, zoomed onto the Lewis structure while the pen draws it
      g.fillStyle = CREAM; g.fillRect(0, 0, Wd, H); bar(g);
      g.fillStyle = '#1d1d1d'; g.textAlign = 'center'; g.font = '40px Georgia, serif'; g.fillText(mode === 'write' ? 'Writing it in your handwriting…' : 'Done. All 40 problems.', Wd / 2, 162);
      const cx = 24, cy = 186, cw = Wd - 48, ch = 880, asp = cw / ch;
      const zx0 = bb[0] - 40, zx1 = bb[2] + 40, zw = zx1 - zx0, zh = zw / asp, zcy = (bb[1] + bb[3]) / 2 + 0.2 * zw / asp;
      const fw = lerp(ws.w, zw, zoom), fh = lerp(ws.w / asp, zh, zoom), fx = lerp(0, zx0, zoom), fy = lerp(0, zcy - zh / 2, zoom);
      g.save(); g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.clip(); g.fillStyle = '#fffdf6'; g.fillRect(cx, cy, cw, ch);
      g.drawImage(ws.canvas, fx, fy, fw, fh, cx, cy, cw, ch); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx, cy, cw, ch, 12); g.stroke();
      g.fillStyle = '#e3ddd0'; g.beginPath(); g.roundRect(50, 1110, Wd - 100, 18, 9); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(50, 1110, (Wd - 100) * k, 18, 9); g.fill();
      g.fillStyle = '#4b463d'; g.font = '600 34px Inter, Arial'; g.fillText(`${Math.max(1, Math.round(40 * k))} / 40 written`, Wd / 2, 1182);
      g.font = '500 28px Inter, Arial'; g.fillStyle = '#6b665c'; g.fillText('your handwriting · ballpoint · navy', Wd / 2, 1230);
    }
    phoneTex.needsUpdate = true;
  }

  // ---------------------------------------------------------------- helpers
  function useSet(name) {
    town.world.root.visible = name === 'town'; if (town.root && town.root !== town.world.root) town.root.visible = name === 'town';
    snowW.root.visible = name === 'snow'; room.root.visible = name === 'room'; bed.root.visible = name === 'bed';
    scene.fog = name === 'town' ? townFog : name === 'snow' ? snowFog : null;
    camera.near = 0.02; camera.far = name === 'town' ? 12000 : name === 'snow' ? 2000 : 300; camera.updateProjectionMatrix();
    scene.background = new THREE.Color(name === 'snow' ? 0x16264c : name === 'town' ? 0xcfe6fb : name === 'bed' ? 0x0b1430 : 0x9fc6ee);
  }
  const everyone = [hero, sci, ...kids, ...folks];
  const reset = () => {
    everyone.forEach((p) => (p.root.visible = false)); bear.root.visible = false; bear.root.scale.setScalar(1);
    [phone, chalk, stack, blanket, chips, dreamB, quilt].forEach((o) => (o.visible = false)); deskObjs.forEach((d) => (d.visible = true)); showHead(true); hero.root.rotation.set(0, 0, 0);
    glowL.intensity = 0; winL.intensity = 0; camera.up.set(0, 1, 0); leafG.rotation.y = 0; leafG.visible = true;
  };
  /** jaw open while words of a beat are spoken (syllable-ish flaps), between word indices [a, b] */
  function jawSing(t, beat, from = null) {
    const all = story.beats[beat].w, a = from ? Math.max(0, all.findIndex((w) => w[0] === from)) : 0, ws2 = all.slice(a);
    for (const [w, t0, t1] of ws2) if (t >= t0 && t < t1 + 0.05) { const syl = Math.max(1, (w.match(/[aeiouy]+/g) || []).length); return Math.abs(Math.sin(PI * syl * clamp((t - t0) / Math.max(0.08, t1 - t0)))); }
    return 0;
  }
  /** seat a person on a chair (seat top y) facing rotY, world x/z of the hips */
  const seat = (p, x, z, rotY, seatY, extra = {}) => p.pose({ x, z, y: seatY - 10 * p.px, rotY, legL: { x: -1.45, bend: 1.45 }, legR: { x: -1.45, bend: 1.45 }, ...extra });
  // classroom layout (room-local): her desk is row 1, col 2; kids fill the rest
  const DESKS = room.D.desks, HER = 6;
  const kidDesks = [0, 1, 3, 10, 5, 7, 8, 9, 11];   // desk 2 (in front of hers) stays empty: her close-ups shoot from there
  const RL = (x, y, z) => add([x, y, z], OFF.room);
  function seatKids(t, react = 0, lookYaw = 0) {
    kids.forEach((k, i) => {
      const di = kidDesks[i % kidDesks.length], [dx, dz] = DESKS[di]; k.root.visible = true;
      const faces = ['shock', 'scream', 'wow'], wob = Math.sin(t * 9 + i * 1.7) * 0.06 * react;
      seat(k, OFF.room[0] + dx, OFF.room[2] + dz + 0.72, PI, 0.5, {
        face: react > 0.5 ? faces[i % 3] : (i % 4 === 0 ? 'talk' : 'idle'),
        head: { yaw: lookYaw * (0.8 + 0.2 * (i % 2)) + wob, pitch: react > 0.5 ? -0.15 : 0.05 },
        armL: react > 0.5 && i % 2 ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 }, armR: react > 0.5 && i % 3 === 0 ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 },
        twist: lookYaw * 0.3,
      });
    });
  }
  const herDesk = () => { const [dx, dz] = DESKS[HER]; return [OFF.room[0] + dx, OFF.room[2] + dz]; };

  // ---------------------------------------------------------------- per frame
  function update(t) {
    reset();
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    const u = clamp((t - shot.t0) / Math.max(0.1, Math.min(6, shot.t1 - shot.t0)));
    let cam = null, amp = 0.004, shake = 0, oldAmt = 0, snowing = false;
    switch (shot.cam) {
      // ======================= HOOK: the bear on night snow (the 2023 picture), then it sings
      case 'snowWide':
      case 'snowClose': {
        useSet('snow'); snowing = true; const O = OFF.snow;
        bear.root.visible = true;
        const close = shot.cam === 'snowClose';
        const look = close ? smooth((t - T.close) / 0.6) : 0;
        bear.pose({ x: O[0], z: O[2], rotY: PI, mode: 'sit', head: { yaw: 0.25 * (1 - look) - 0.05, pitch: -0.08 - 0.06 * look, roll: 0.05 * Math.sin(t * 1.3) }, jaw: close ? jawSing(t, 'hook', 'remember') : 0, eyes: t % 3.1 < 0.12 ? 'blink' : 'open' });
        snowW.aim(0, 0, 14);
        if (!close) {
          cam = { P: add([0.7 - 0.25 * u, 0.8 + 0.12 * u, -5.4 + 1.2 * u], O), A: add([0.15, 1.05, 0], O), fov: 48 };
          moon.position.set(-14, 22, 60); moon.scale.setScalar(5.5);
        } else {
          const e = bear.eyeWorld(new THREE.Vector3());
          cam = { P: [e.x + 0.15 - 0.05 * u, e.y - 0.12, e.z - 2.3 + 0.55 * u], A: [e.x, e.y - 0.12, e.z], fov: 42 };
          moon.position.set(-6, 14, 40); moon.scale.setScalar(3.2);
        }
        moon.lookAt(new THREE.Vector3(...cam.P));
        amp = 0.006;
        break;
      }
      // ======================= NOBODY: her phone in bed (POV), her confused face
      case 'phonePov':
      case 'phoneFace': {
        useSet('bed'); bedMode('night'); const O = OFF.bed;
        hero.root.visible = true; blanket.visible = true; blanket.position.set(-2.95, 0.62, 0.55);
        const pov = shot.cam === 'phonePov';
        hero.pose({ x: O[0] - 2.0, z: O[2] + 0.45, y: 0.75 - 10 * hero.px, rotY: 0, legL: { x: -1.5, bend: 0 }, legR: { x: -1.5, bend: 0 },
          armR: pov ? { x: -1.1, z: -0.3, bend: -0.95 } : { x: -0.85, z: -0.3, bend: -0.75 }, armL: pov ? { x: -1.0, z: -0.25, bend: -0.9 } : { x: -0.8, z: -0.25, bend: -0.7 },
          face: pov ? 'idle' : (t - T.face < 0.35 ? 'worried' : 'wow'), head: { pitch: pov ? 0.35 : 0.1, roll: pov ? 0 : -0.18 * smooth((t - T.face) / 0.3), yaw: pov ? 0 : 0.1 } });
        const eye = hero.eyeWorld(new THREE.Vector3(), pov ? -1 : 4.6);
        phone.visible = true; drawPhone('video');
        const gR = hero.gripWorld('R', -5, 1.5), gL = hero.gripWorld('L', -5, 1.5), mid = gR.clone().lerp(gL, 0.5);
        phone.position.copy(mid).add(new THREE.Vector3(0, 0.06, 0)); phone.lookAt(eye);
        glowL.position.copy(phone.position).sub(bed.root.position).add(new THREE.Vector3(0, 0.05, -0.1)); glowL.intensity = pov ? 1.6 : 0.85;
        bed.lights.sun.position.set(3, 6, -8);
        if (pov) { showHead(false); cam = { P: eye.toArray(), A: phone.position.clone().add(new THREE.Vector3(0, 0.0, 0)).toArray(), fov: 36 }; camera.near = 0.01; camera.updateProjectionMatrix(); amp = 0.0015; }
        else { const h = hero.eyeWorld(new THREE.Vector3(), 4.6); cam = { P: [h.x + 0.3, h.y + 0.05, h.z + 1.55 - 0.15 * u], A: [h.x + 0.02, h.y - 0.2, h.z], fov: 44 }; amp = 0.002; }
        break;
      }
      // ======================= PLACES: the calendar flips 2023 → 2026, the chip bag, the bear in her window
      case 'calendar': {
        useSet('bed'); bedMode('day'); const O = OFF.bed;
        setCal(t);
        const c = V3([0.25, 1.72, 0.03], O);
        cam = { P: [c.x + 0.1 - 0.08 * u, c.y - 0.1, c.z + 2.0 - 0.25 * u], A: [c.x, c.y - 0.2, c.z], fov: 42 }; amp = 0.002;
        hero.root.visible = false;
        break;
      }
      case 'chips': {
        useSet('bed'); bedMode('day'); const O = OFF.bed;
        chips.visible = true; const land = T.chips + 0.12, hgt = t < land ? 0.25 * (1 - smooth((t - T.chips) / 0.12)) : 0, sq = t > land ? Math.exp(-(t - land) * 9) * Math.sin((t - land) * 30) * 0.12 : 0;
        chips.position.set(2.0, 0.875 + hgt, 0.42); chips.rotation.set(0, -0.15, 0); chips.scale.set(1 + sq, 1 - sq, 1);
        const c = V3([2.0, 0.875, 0.42], O);
        cam = { P: [c.x - 0.1, c.y + 0.3, c.z + 0.95 - 0.12 * u], A: [c.x, c.y + 0.12, c.z], fov: 40 }; amp = 0.002;
        break;
      }
      case 'dream': {
        useSet('bed'); bedMode('night'); const O = OFF.bed;
        hero.root.visible = true; blanket.visible = true; blanket.position.set(-2.95, 0.75, 0.75);
        hero.pose({ x: O[0] - 2.0, z: O[2] + 0.35 + 1.5, y: 0.83, rotY: 0, face: 'sleepy', armL: ARMS.down, armR: ARMS.down });
        hero.root.rotation.x = -PI / 2;
        const pop = smooth((t - T.dream - 0.05) / 0.22), e = hero.eyeWorld(new THREE.Vector3(), 4.6);
        dreamB.visible = true; dreamB.position.set(e.x + 0.28, e.y + 0.5, e.z - 0.12); dreamB.scale.set(0.5 * pop, 0.5 * 1.08 * pop, 1);
        winL.position.set(-1.6, 1.75, 1.2); winL.intensity = 1.6;
        dreamB.material.rotation = 0.04 * Math.sin(t * 2);
        cam = { P: [e.x + 0.35, e.y + 1.05, e.z + 1.5 - 0.1 * u], A: [e.x + 0.16, e.y + 0.18, e.z], fov: 46 }; amp = 0.002;
        break;
      }
      // ======================= DOOM: 1960 film, a scientist and his doomsday curve
      case 'doomWide':
      case 'doomBoard': {
        useSet('room'); oldAmt = 1; setBoard('doom'); const O = OFF.room;
        sci.root.visible = true;
        const tap = shot.cam === 'doomBoard' ? Math.max(0, Math.sin(clamp((t - W('doom', 'november')) / 0.25) * PI)) : 0;
        sci.pose({ x: O[0] + 2.95, z: O[2] + 0.75, rotY: -0.35, face: t > W('doom', 'doomsday') ? 'wow' : 'talk', armR: { x: -0.35 - 0.2 * tap, z: 1.35 + 0.1 * tap, bend: -0.1 }, armL: ARMS.hips, head: { yaw: -0.25, pitch: -0.05 } });
        chalk.visible = true; chalk.position.copy(sci.gripWorld('R', -5.5, 0)); sci.arms.R.lo.getWorldQuaternion(chalk.quaternion);
        if (shot.cam === 'doomWide') cam = { P: add([1.95 - 0.1 * u, 1.45, 6.9 - 0.4 * u], O), A: add([1.85, 1.08, 0.4], O), fov: 52 };
        else cam = { P: add([1.45 + 0.08 * u, 1.85, 4.4 - 0.3 * u], O), A: add([1.42, 1.95, 0.0], O), fov: 50 };
        amp = 0.003;
        break;
      }
      // ======================= NOW: the clock flips to Nov 1, her eyes over the blanket
      case 'clock':
      case 'blanket': {
        useSet('bed'); bedMode('night'); const O = OFF.bed;
        setClock(t < T.flip ? '11:59' : '12:00', t < T.flip ? 'PM  OCT 31' : 'AM  NOV 1 2026');
        hero.root.visible = true; blanket.visible = true;
        const duck = shot.cam === 'blanket' ? smooth((t - (W('now', '2026') + 0.75)) / 0.3) : 0;
        hero.pose({ x: O[0] - 2.0, z: O[2] + 0.45, y: 0.75 - 10 * hero.px, rotY: 0.12, legL: { x: -1.5, bend: 0 }, legR: { x: -1.5, bend: 0 }, face: shot.cam === 'clock' ? 'worried' : 'shock',
          armR: { x: -0.95, z: -0.35, bend: -1.5 }, armL: { x: -0.95, z: -0.35, bend: -1.5 }, crouch: 0.25 * duck, head: { yaw: shot.cam === 'clock' ? 0.5 : 0.05, pitch: 0.12 * duck } });
        quilt.visible = true; quilt.position.set(-2.02, 0.83 + 0.22 * duck, 0.66); quilt.rotation.set(-0.12, 0.12, 0);
        blanket.position.set(-2.95, 0.62, 0.85);
        if (shot.cam === 'clock') { const c = V3([-0.6, 0.835, 0.56], O); cam = { P: [c.x + 0.3, c.y + 0.02, c.z + 0.8 - 0.15 * u], A: [c.x - 0.03, c.y - 0.11, c.z], fov: 40 }; amp = 0.0015; }
        else { const e = hero.eyeWorld(new THREE.Vector3(), 4.6); cam = { P: [e.x + 0.2, e.y + 0.1, e.z + 1.35 - 0.12 * u], A: [e.x + 0.02, e.y - 0.04, e.z], fov: 42 }; amp = 0.002; shake = 0.003; }
        break;
      }
      // ======================= NOTHING: a sunny morning, the whole street shrugs
      case 'town': {
        useSet('town'); const D = town.D;
        const h = D.houses.find((q) => q.side === 1 && q.x > -30 && q.x < 10) || D.houses[0], dx = h.door[0], dz = h.door[1];
        const sh = smooth((t - T.shrug) / 0.25);
        hero.root.visible = true; hero.pose({ x: dx, z: dz - 0.6, rotY: PI, face: sh > 0.5 ? 'worried' : 'idle', armL: sh > 0.5 ? ARMS.shrug : ARMS.down, armR: sh > 0.5 ? ARMS.shrug : ARMS.down, head: { roll: 0.15 * sh } });
        const spots = [[dx - 1.05, 4.6, PI - 0.25], [dx + 1.0, 6.0, PI + 0.3], [dx - 1.3, 8.0, PI - 0.1], [dx + 1.6, 9.0, PI + 0.4], [dx + 40, 0, 0]];
        folks.forEach((f, i) => { const [x, z, r] = spots[i]; f.root.visible = true; f.pose({ x, z, rotY: r, face: sh > 0.5 ? (i % 2 ? 'worried' : 'idle') : 'idle', armL: sh > 0.5 ? ARMS.shrug : ARMS.down, armR: sh > 0.5 ? ARMS.shrug : (i === 1 ? ARMS.phone : ARMS.down), head: { pitch: sh > 0.5 ? 0 : -0.45, roll: 0.12 * sh * (i % 2 ? 1 : -1) } }); });
        town.world.aim(dx, 6, 18); town.cars.forEach((c) => (c.visible = !(Math.abs(c.position.x - dx) < 9 && c.position.z > -2 && c.position.z < 5)));
        cam = { P: [dx - 0.4 + 0.35 * u, 1.65, 0.4], A: [dx + 0.05, 1.05, 9.0], fov: 50 }; amp = 0.004;
        break;
      }
      // ======================= CLASS: the bear walks in, kids scream
      case 'door': {
        useSet('room'); setBoard('chem'); const O = OFF.room;
        leafG.visible = false;   // the open door leaf would fill the hallway lens's right third
        const wx = lerp(-6.2, -4.95, smooth((t - T.cls) / (W('class', 'class') - T.cls))), rear = smooth((t - W('class', 'class')) / 0.35);
        bear.root.visible = true; bear.pose({ x: O[0] + wx, z: O[2] + 6.5, rotY: PI / 2 + 0.5 * rear, mode: rear > 0.01 ? 'upright' : 'four', pitch: 1.25 * rear, scale: 0.85, walk: rear > 0.01 ? undefined : bear.phaseFor(wx + 6.2, 0.85), head: { yaw: -0.35 * smooth((t - W('class', 'chemistry')) / 0.3), pitch: 0.05 }, jaw: 0.6 * rear, pawL: rear > 0.01 ? { x: -1.6 * rear, z: 0.5 } : undefined, pawR: rear > 0.01 ? { x: -1.6 * rear, z: 0.5 } : undefined });
        const react = smooth((t - (T.cls + 0.45)) / 0.2);
        seatKids(t, react, 1.0 * react);
        hero.root.visible = true; const [hx, hz] = herDesk(); seat(hero, hx, hz + 0.72, PI, 0.5, { face: react > 0.5 ? 'shock' : 'idle', head: { yaw: 0.9 * react }, armL: react > 0.5 ? ARMS.shock : ARMS.down, armR: ARMS.down });
        cam = { P: add([-6.85, 1.75 - 0.1 * u, 6.55], O), A: add([-2.2, 1.15, 5.7], O), fov: 54 }; amp = 0.004;
        break;
      }
      // ======================= DEADLINE: board slap, the stack slams down, her scream
      case 'slap':
      case 'stack':
      case 'scream': {
        useSet('room'); const O = OFF.room; const [hx, hz] = herDesk();
        setBoard(t < T.slap ? 'chem' : 'deadline');
        bear.root.visible = true;
        if (shot.cam === 'slap') {
          const hit = smooth((t - (T.slap - 0.25)) / 0.25), back = smooth((t - (T.slap + 0.1)) / 0.3);
          bear.pose({ x: O[0] + 0.95, z: O[2] + 0.8, rotY: lerp(PI + 0.25, 0.3, back), mode: 'upright', scale: 0.85, pawR: { x: -2.2 * hit * (1 - back) - 0.35, z: 0.25 }, pawL: { x: -0.4 - 0.9 * back, z: 0.3 }, head: { yaw: 0.4 * (1 - back), pitch: 0.12 }, jaw: jawSing(t, 'deadline') * 0.6, eyes: 'squint' });
          seatKids(t, 0.6, 0);
          shake = t > T.slap ? 0.02 * Math.exp(-(t - T.slap) * 7) : 0;
          cam = { P: add([-0.2, 1.35, 6.4], O), A: add([-0.1, 1.8, 0.6], O), fov: 50 }; amp = 0.004;
        } else {
          const land = T.stack + 0.25;
          stack.visible = true; const fall = t < land ? (1 - smooth((t - T.stack) / 0.25)) * 0.9 : 0, bounce = t > land ? Math.abs(Math.sin((t - land) * 16)) * Math.exp(-(t - land) * 8) * 0.03 : 0;
          stack.position.set(hx + 0.05, 0.75 + fall + bounce, hz - 0.05); stack.rotation.set(0, 0.1, 0);
          bear.pose({ x: hx + 0.95, z: hz - 0.9, rotY: -0.75, mode: 'upright', scale: 0.85, pitch: 1.15, pawL: { x: t < land ? -1.4 : -0.5 }, pawR: { x: -0.4 }, head: { pitch: 0.35, yaw: -0.2 }, jaw: jawSing(t, 'deadline', 'forty') * 0.7, eyes: 'squint' });
          hero.root.visible = true;
          const sc = shot.cam === 'scream';
          seat(hero, hx, hz + 0.72, PI, 0.5, { face: sc ? 'scream' : t > land ? 'shock' : 'worried', armL: sc ? ARMS.shock : t > land ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 }, armR: sc ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 }, head: { pitch: sc ? -0.1 : 0.15, yaw: 0 } });
          seatKids(t, 0.2, 0);
          shake = t > land && t < land + 0.5 ? 0.012 * Math.exp(-(t - land) * 8) : 0;
          const e = hero.eyeWorld(new THREE.Vector3(), 4.6);
          if (!sc) cam = { P: [e.x - 0.55, e.y + 0.15, e.z - 1.65 + 0.15 * u], A: [e.x + 0.18, e.y - 0.35, e.z + 0.2], fov: 50 };
          else { cam = { P: [e.x - 0.12, e.y + 0.02, e.z - 0.8 + 0.12 * u], A: [e.x, e.y - 0.05, e.z], fov: 46 }; shake = 0.008; }
          amp = 0.004;
        }
        break;
      }
      // ======================= SCRIBE: one photo (POV), then the screen
      case 'pov':
      case 'screen':
      case 'screen2': {
        useSet('room'); setBoard('deadline'); const O = OFF.room; const [hx, hz] = herDesk();
        hero.root.visible = true; stack.visible = true; stack.position.set(hx + 0.05, 0.75, hz - 0.05); stack.rotation.set(0, 0.1, 0);
        seat(hero, hx, hz + 0.72, PI, 0.5, { face: 'idle', armR: { x: -1.25, z: -0.42, bend: -0.75 }, armL: { x: -1.2, z: -0.5, bend: -0.7 }, head: { pitch: 0.75 } });
        showHead(false); phone.visible = true;
        const eye = hero.eyeWorld(new THREE.Vector3(), -1), gr = hero.gripWorld('R', -5, 2), gl = hero.gripWorld('L', -5, 2), mid = gr.clone().lerp(gl, 0.5);
        phone.position.copy(mid).add(new THREE.Vector3(0, 0.04, 0)); phone.lookAt(eye);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(phone.quaternion), nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.quaternion), ph = 0.158;
        if (shot.cam === 'pov') {
          drawPhone(t < T.snap ? 'cam' : 'flash', clamp((t - T.snap) / 0.45));
          const top = stack.position.clone().add(new THREE.Vector3(0, 0.19, 0));
          cam = { P: eye.toArray(), A: phone.position.clone().lerp(top, 0.25).toArray(), fov: 46 }; amp = 0.0012;
        } else {
          let mode = 'scan', k = 0, zoom = 0;
          if (t < T.solve) { mode = 'scan'; k = clamp((t - T.scr) / (T.solve - T.scr - 0.1)); }
          else if (t < W('hand', 'wrote')) { mode = 'solve'; k = clamp((t - T.solve) / (W('hand', 'and') - T.solve)); }
          else {
            const a0 = T.write, a1 = T.lewis - 0.1, a2 = WE('hand', 'all') + 0.15;
            const p = t < a1 ? lerp(P_FIG0 * 0.55, P_FIG0, smooth((t - a0) / (a1 - a0))) : t < a2 ? lerp(P_FIG0, P_FIG1, clamp((t - a1) / (a2 - a1))) : lerp(P_FIG1, ws.total, smooth((t - a2) / 0.4));
            ws.draw(p); mode = t < a2 + 0.3 ? 'write' : 'done'; k = clamp(0.1 + 0.9 * (t - a0) / (a2 + 0.3 - a0));
            zoom = smooth((t - (T.lewis - 0.45)) / 0.4);
          }
          drawPhone(mode, k, zoom);
          const off = phone.position.clone().addScaledVector(up, 0.0);
          const d = lerp(2.2, 2.0, u) * ph;
          cam = { P: off.clone().addScaledVector(nrm, d).toArray(), A: off.toArray(), fov: 40 }; camera.up.copy(up); amp = 0.0003;
        }
        camera.near = 0.01; camera.updateProjectionMatrix();
        break;
      }
      case 'awe': {                       // her face lit by the screen, the bear peering over her shoulder
        useSet('room'); setBoard('deadline'); const O = OFF.room; const [hx, hz] = herDesk();
        hero.root.visible = true; stack.visible = true; stack.position.set(hx + 0.05, 0.75, hz - 0.05);
        seat(hero, hx, hz + 0.72, PI, 0.5, { face: 'wow', armR: ARMS.phone, armL: { x: -0.9, z: 0.05, bend: -0.5 }, head: { pitch: 0.2, yaw: -0.15 } });
        phone.visible = true; drawPhone('write', 0.3, 0); const eye = hero.eyeWorld(new THREE.Vector3(), 4.6);
        phone.position.copy(hero.gripWorld('R', -5, 1.6)); phone.lookAt(eye);
        bear.root.visible = true; bear.pose({ x: hx - 0.85, z: hz + 1.75, rotY: PI - 0.45, mode: 'upright', scale: 0.85, pitch: 1.1, head: { pitch: 0.35, yaw: -0.25 }, eyes: 'wide', pawL: { x: -0.6 }, pawR: { x: -0.3 } });
        cam = { P: [eye.x + 0.55, eye.y + 0.12, eye.z - 1.85 + 0.12 * u], A: [eye.x - 0.2, eye.y + 0.18, eye.z + 0.45], fov: 50 }; amp = 0.003;
        break;
      }
      // ======================= APPROVE + DEC: the bear reads it, nods, leans in and whispers
      case 'approve':
      case 'whisper': {
        useSet('room'); setBoard(shot.cam === 'whisper' && t > T.december ? 'dec' : 'deadline'); const O = OFF.room; const [hx, hz] = herDesk();
        hero.root.visible = true; stack.visible = true; stack.position.set(hx + 0.05, 0.75, hz - 0.05);
        bear.root.visible = true;
        const ap = shot.cam === 'approve';
        const nod = ap ? Math.sin(clamp((t - T.nod) / 0.6) * PI * 2) * 0.18 : 0;
        const lean = ap ? 0 : smooth((t - (W('dec', 'leaned') - 0.1)) / 0.5);
        const scared = !ap && t > T.december;
        seat(hero, hx, hz + 0.72, PI, 0.5, { face: ap ? 'grin' : scared ? 'shock' : 'happy', armL: ap ? { x: -1.55, z: 0.2, bend: -0.6 } : scared ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 }, armR: scared ? ARMS.shock : { x: -0.9, z: 0.05, bend: -0.5 }, head: { yaw: ap ? 0.35 : 0.45 * (1 - lean) + 0.2, pitch: ap ? -0.1 : 0 } });
        if (ap) { phone.visible = true; drawPhone('done', 1, 0); phone.position.copy(hero.gripWorld('L', -5, 1.6)); phone.lookAt(bear.eyeWorld(new THREE.Vector3())); }
        const bx = hx - 1.55, bz = hz + 1.05;
        bear.pose({ x: bx, z: bz, rotY: PI / 2 + 0.25, mode: 'upright', scale: 0.85, pitch: 1.3 - 0.45 * lean, head: { pitch: ap ? 0.3 + nod : 0.35 + 0.1 * lean, yaw: 0.2 * lean, roll: -0.1 * lean }, eyes: ap && t > T.nod ? 'happy' : 'open', jaw: ap ? 0 : jawSing(t, 'dec', 'remember') * 0.5, pawL: { x: ap ? -0.5 : -0.4 }, pawR: { x: ap ? -1.1 : -0.3 } });
        const e = hero.eyeWorld(new THREE.Vector3(), 4.6);
        if (ap) cam = { P: [e.x + 0.85, e.y + 0.12, e.z - 1.9], A: [e.x - 0.42, e.y + 0.12, e.z + 0.2], fov: 46 };
        else cam = { P: [e.x + 0.75 - 0.1 * lean, e.y + 0.1, e.z - 1.75 + 0.3 * lean], A: [e.x - 0.32, e.y + 0.1, e.z + 0.15], fov: 46 };
        if (scared) shake = 0.006 * Math.exp(-(t - T.december) * 3);
        amp = 0.003;
        break;
      }
    }
    if (['stack', 'scream', 'pov', 'screen', 'screen2', 'awe', 'approve', 'whisper'].includes(shot.cam)) deskObjs[2].visible = false;
    if (shot.cam === 'door') deskObjs[4].visible = false;   // its red chair poked through the bear walking in
    snowfall(t, snowing);
    old.enabled = oldAmt > 0; old.uniforms.uAmt.value = oldAmt; old.uniforms.uT.value = t;
    const n = shake ? [Math.sin(t * 61) * shake, Math.sin(t * 47 + 1) * shake * 0.7] : [0, 0];
    setCamera([cam.P[0] + n[0], cam.P[1] + n[1], cam.P[2]], cam.A, cam.fov, t, amp);
    hud.update(t);
  }
  return { update };
}
