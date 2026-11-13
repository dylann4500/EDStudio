// 086 — POV story genre test (docs/POVSTORY.md, breakdown docs/genres/pov-story.md): "POV: you fell asleep in the library
// during finals week". The viewer is Sam: the camera is Sam's head, the arms/phone are Sam's. Five voices, no narrator —
// PA (orange), Sam (white), Theo on FaceTime (cyan), the "night guard" (yellow), Jules from the stairwell (pink).
// One continuous POV take with head turns (whips) instead of cuts, fisheye lens + ink outlines (engine/povstory/look.js).
// Scribe is IN the story: Theo tells Sam to snap the worksheet, the photo is the scan (and the twist: someone's in it),
// and Scribe's "done" notification lights up the phone under the table — the buzz gives Sam away.
// Every time comes from story.json (tools/narrate.py): re-voicing (Fish/ElevenLabs) re-times the whole reel.
import * as THREE from 'three';
import { clamp, lerp, smooth, rng } from '@engine/core.js';
import { makeToon } from '@engine/build/toon.js';
import { makeFlashlight } from '@engine/props.js';
import { loadHand } from '@engine/build/scribe.js';
import { subjectSheet } from '@engine/build/subjects.js';
import { buildStacks, D } from '@engine/povstory/stacks.js';
import { addFisheyePass, addInk } from '@engine/povstory/look.js';
import { createPovStoryHud } from '@engine/povstory/hud.js';
import { makePovArms, makePhone, moves, shake, setHead } from '@engine/povstory/pov.js';

const PI = Math.PI;
const DIR = '/videos/086-pov-library-lockin/';

export async function build(studio, story) {
  const { scene, camera, renderer } = studio;
  camera.near = 0.03; camera.far = 45; camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0x0a0d18);
  // ---- story times (all from story.json) --------------------------------------------------------------------------
  const BT = (id) => story.beats[id];
  const WT = (id, word, n = 1) => { let k = 0; for (const w of BT(id).w) if (w[0] === word && ++k === n) return w[1]; throw new Error(`word ${word} #${n} not in ${id}`); };
  const T = {};
  T.off = [0.1, WT('pa1', 'now'), WT('pa2', 'midnight'), BT('wake').s1 + 0.4, WT('nono', 'no', 2), WT('nono', 'i') - 0.05];   // light banks, far → near
  T.phoneUp = BT('wake').s0 + 0.05;
  T.ring = BT('nono').s1 + 0.2; T.accept = BT('theo1').s0 - 0.12;
  T.scan = BT('snap').s0 + 0.15; T.tap = BT('snap').s1 + 0.75; T.flash = T.tap + 0.1; T.preview = T.flash + 0.14;
  T.zoom0 = BT('photo').s0 - 0.1; T.zoom1 = WT('photo', 'photo'); T.lookUp = BT('photo').s1 - 0.05;
  T.beam0 = BT('theo3').s1 + 0.15; T.beam1 = BT('g1').s1 + 0.9;
  T.stand = WT('thank', 'over') - 0.45; T.dont = BT('dont').s0;
  T.enter = BT('g2').s0 - 0.7; T.duck = BT('g2').s1 + 0.25; T.buzz = T.duck + 0.9; T.smother = T.buzz + 1.05;
  T.what = BT('g3').s0; T.door = BT('jules').s0 - 0.35;
  T.sent = BT('sent').s0; T.nope = BT('nope').s0; T.come = BT('g4').s0; T.hurry = BT('hurry').s0;
  T.choice = BT('hurry').s1 + 0.45;
  story.debugView = { center: [0, 0, -6], height: 22 };

  // ---- the world -------------------------------------------------------------------------------------------------
  const L = buildStacks(studio);
  const G = await loadHand('/videos/049-scribe-promo/hand.json');
  const blank = subjectSheet(G, 'chemistry', { name: 'Sam', note: 'Due Fri 8:00 AM  ·  SHOW ALL WORK, HANDWRITTEN' });   // on the table: nothing written
  blank.draw(0, true);
  L.sheet.material.map = blank.tex; L.sheet.material.needsUpdate = true;
  const done = subjectSheet(G, 'chemistry', { name: 'Sam', note: 'Due Fri 8:00 AM  ·  SHOW ALL WORK, HANDWRITTEN' });
  done.draw(1e9, true);   // the finished page (the Scribe notification's thumbnail)
  const icon = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = DIR + 'scribe-icon.png'; });

  // the "night guard": a toon tinted to a silhouette (only the eye whites stay white), with a flashlight in his right hand
  const guard = makeToon({ shirt: 0x24304a, pants: 0x1b2232, shoes: 0x111111, skin: 0x8a6a55, hair: 0x1a1a1a, hairStyle: 'side', hat: 'cap', hatColor: 0x1d273c });
  guard.root.scale.setScalar(1.25); scene.add(guard.root);
  const torch = makeFlashlight({ length: 9, radius: 1.1, color: 0xfff1d0 }); scene.add(torch.g);
  torch.spot.decay = 1.4; torch.spot.distance = 22; torch.spot.angle = 0.2; torch.spot.penumbra = 0.7;
  // the torch's glare when it points at the lens (an additive sprite at its head; bloom does the rest)
  const glareC = document.createElement('canvas'); glareC.width = glareC.height = 128;
  { const g = glareC.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.18, 'rgba(255,240,205,.75)'); gr.addColorStop(0.5, 'rgba(255,225,170,.18)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const glareT = new THREE.CanvasTexture(glareC); glareT.colorSpace = THREE.SRGBColorSpace;
  const glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glareT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); scene.add(glare);
  const gpos = new THREE.Vector3(), hpos = new THREE.Vector3(), tgt = new THREE.Vector3();
  function poseGuard(p) {   // {x, z, rotY, walk, aim: [x,y,z] | null, on, arm}
    guard.set({ x: p.x, z: p.z, rotY: p.rotY ?? 0, scale: 1.25, walk: p.walk ?? null, eyes: 'open', mouth: 'flat', tint: [0x0b0d14, 0.9],
      armR: p.armR || { x: -1.25, z: 0.18, el: 0.2 }, armL: p.walk != null ? undefined : { x: 0.05, z: 0.12 }, look: [0, 0], lean: p.lean ?? 0.03 });
    guard.root.visible = p.visible !== false;
    guard.root.updateMatrixWorld(true);
    guard.hand(1).getWorldPosition(hpos);
    if (p.aim) { tgt.fromArray(p.aim); torch.aim(hpos, tgt); torch.setOn(p.on ?? 1, p.beamOp ?? 0.42); torch.g.visible = true; }
    else { torch.setOn(0); torch.g.visible = p.visible !== false; torch.aim(hpos, tgt.set(hpos.x + Math.sin(p.rotY ?? 0), hpos.y - 0.3, hpos.z + Math.cos(p.rotY ?? 0))); }
  }

  // "Jules": a figure in the lit stairwell doorway — backlit, so a silhouette (you can't tell who it is: that's the dilemma)
  const jules = makeToon({ shirt: 0xff8fcf, pants: 0x2a2a3a, hair: 0x3a2318, hairStyle: 'side', skin: 0xd9a07a });
  jules.root.scale.setScalar(1.12); scene.add(jules.root);

  // Theo's dorm (parked at x = 200): his FaceTime picture is rendered into a texture every frame he's on screen
  const dorm = new THREE.Group(); dorm.position.set(200, 0, 0); scene.add(dorm);
  {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshLambertMaterial({ color: 0x6f5aa0 })); wall.position.set(0, 1.6, -1.2); dorm.add(wall);
    const posterT = (bg, fg, txt) => { const c = document.createElement('canvas'); c.width = 256; c.height = 360; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 360); g.fillStyle = fg; g.font = '900 64px Inter, Arial'; g.textAlign = 'center'; txt.split('\n').forEach((l, i) => g.fillText(l, 128, 140 + i * 72)); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    [[-0.7, 1.9, '#ffcf3f', '#1b1b1b', 'LO-FI\nBEATS'], [0.75, 1.75, '#2bb3a3', '#fff', 'GO\nHAWKS']].forEach(([x, y, bg, fg, tx]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshLambertMaterial({ map: posterT(bg, fg, tx) })); p.position.set(x, y, -1.19); p.rotation.z = (x > 0 ? -0.05 : 0.04); dorm.add(p); });
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: [0xffd27a, 0xff8fcf, 0x7fe3ff][i % 3], toneMapped: false })); b.position.set(-1.4 + i * 0.21, 2.35 - Math.sin(i * 0.45) * 0.12, -1.15); dorm.add(b); }
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1), new THREE.MeshLambertMaterial({ color: 0x3b4f8a })); bed.position.set(-1.1, 0.35, -0.7); dorm.add(bed);
    const lamp = new THREE.PointLight(0xffc98a, 6, 5, 1.6); lamp.position.set(0.8, 1.9, 0.4); dorm.add(lamp);
    const fillD = new THREE.PointLight(0x9fc0ff, 2.5, 4, 1.6); fillD.position.set(-0.6, 1.4, 1.0); dorm.add(fillD);
  }
  const theo = makeToon({ skin: 0xa86f4a, shirt: 0xf0883a, pants: 0x2a3550, hair: 0x1d140f, hairStyle: 'tuft' });
  dorm.add(theo.root); theo.root.position.set(0, 0, 0);
  theo.set({});
  theo.root.updateMatrixWorld(true);
  const theoHead = theo.head.getWorldPosition(new THREE.Vector3());
  const callCam = new THREE.PerspectiveCamera(52, 66 / 146, 0.05, 20);
  const RT_W = 360, RT_H = 796;
  const rtCall = new THREE.WebGLRenderTarget(RT_W, RT_H, { samples: 4 }); rtCall.texture.colorSpace = THREE.SRGBColorSpace;
  const rtCam = new THREE.WebGLRenderTarget(RT_W, RT_H, { samples: 4 }); rtCam.texture.colorSpace = THREE.SRGBColorSpace;
  const phoneCam = new THREE.PerspectiveCamera(74, 66 / 146, 0.02, 40);

  // ---- you: arms + phone ------------------------------------------------------------------------------------------
  const arms = makePovArms(camera, { sleeve: 0x3c4560, cuff: 0x30374d, skin: 0xe2a77e });
  const phone = makePhone({ w: 0.072, h: 0.152, light: 0.05, skin: 0xe2a77e }); camera.add(phone.g);
  arms.L.hold(phone);
  const flashL = new THREE.PointLight(0xfff4dc, 0, 30, 1.0); camera.add(flashL); flashL.position.set(0, 0.05, -0.9);   // ahead of the hands (at −0.35 it blew the tapping hand white)
  const flashW = new THREE.PointLight(0xfff4dc, 0, 30, 0.9); scene.add(flashW);   // the flash inside the frozen photo (permanent: adding lights per frame recompiles every shader)

  // ---- look: ink + fisheye -----------------------------------------------------------------------------------------
  addInk(L.root, { width: 0.0026 });
  addInk(guard.root, { width: 0.0026 }); addInk(jules.root, { width: 0.0026 }); addInk(theo.root, { width: 0.0032 });
  addInk(arms.root, { width: 0.0042 }); addInk(phone.g, { width: 0.0042, filter: (o) => o !== phone.screen });
  const lens = addFisheyePass(studio, { k: 0.42 });

  // ---- phone screens (canvas UI) ----------------------------------------------------------------------------------
  const SW = 540, SH = 1194;
  const mkC = (transparent) => { const c = document.createElement('canvas'); c.width = SW; c.height = SH; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), t, key: '' }; };
  const base = mkC(false), over = mkC(true);
  const font = (w, px) => `${w} ${px}px Inter, Fredoka, Arial`;
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const status = (g, time, batt, dark = true) => {
    g.fillStyle = dark ? '#fff' : '#111'; g.font = font(700, 30); g.textAlign = 'left'; g.fillText(time, 46, 54);
    g.textAlign = 'right'; g.fillStyle = batt <= 5 ? '#ff453a' : (dark ? '#fff' : '#111'); g.font = font(700, 26); g.fillText(`${batt}%`, SW - 96, 54);
    g.strokeStyle = dark ? '#fff' : '#111'; g.lineWidth = 3; rr(g, SW - 86, 32, 46, 26, 7); g.stroke(); g.fillStyle = '#ff453a'; g.fillRect(SW - 82, 36, 5, 18);
  };
  const wallpaper = (g) => { const gr = g.createLinearGradient(0, 0, SW, SH); gr.addColorStop(0, '#2b1f5c'); gr.addColorStop(0.55, '#16224a'); gr.addColorStop(1, '#0b1026'); g.fillStyle = gr; g.fillRect(0, 0, SW, SH); for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(${[255, 120, 200][i]},${[140, 90, 255][i]},${[220, 255, 180][i]},.12)`; g.beginPath(); g.arc([120, 420, 260][i], [380, 640, 980][i], [210, 260, 230][i], 0, 2 * PI); g.fill(); } };
  function drawBase(state, x = {}) {
    const key = state + JSON.stringify(x); if (base.key === key) return; base.key = key;
    const g = base.g; g.clearRect(0, 0, SW, SH);
    if (state === 'white') { g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH); }
    else if (state === 'lock' || state === 'notif') {
      wallpaper(g); status(g, '', x.batt ?? 4);
      g.fillStyle = 'rgba(255,255,255,.88)'; g.textAlign = 'center'; g.font = font(600, 30); g.fillText('Thursday, December 11', SW / 2, 196);
      g.fillStyle = '#fff'; g.font = font(700, 168); g.fillText(x.time || '11:58', SW / 2, 352);
      if (state === 'lock') { g.font = font(600, 26); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText('Low Battery · 4% remaining', SW / 2, 1060); rr(g, SW / 2 - 70, 1130, 140, 9, 5); g.fill(); }
      if (state === 'notif') {   // the Scribe notification card (the plug: the worksheet came back DONE, in Sam's handwriting)
        g.fillStyle = 'rgba(245,244,250,.95)'; rr(g, 26, 430, SW - 52, 520, 34); g.fill();
        g.drawImage(icon, 50, 456, 70, 70);
        g.textAlign = 'left'; g.fillStyle = '#5c5b66'; g.font = font(700, 26); g.fillText('SCRIBE', 138, 486); g.textAlign = 'right'; g.font = font(600, 24); g.fillText('now', SW - 52, 486);
        g.textAlign = 'left'; g.fillStyle = '#16151b'; g.font = font(800, 34); g.fillText('Worksheet done', 138, 528); g.fillStyle = '#1f9d55'; g.fillText('✓', 138 + g.measureText('Worksheet done').width + 10, 528);
        g.fillStyle = '#2d2c33'; g.font = font(600, 27); g.fillText('20/20 answered, in your handwriting.', 52, 574); g.fillText('Tap to export the PDF.', 52, 610);
        g.save(); rr(g, 52, 636, SW - 104, 290, 18); g.clip(); g.drawImage(done.canvas, 0, 230, done.w, done.w * 290 / (SW - 104), 52, 636, SW - 104, 290); g.restore();
        g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; rr(g, 52, 636, SW - 104, 290, 18); g.stroke();
      }
    } else if (state === 'incoming') {
      const gr = g.createLinearGradient(0, 0, 0, SH); gr.addColorStop(0, '#3a2a1e'); gr.addColorStop(1, '#120c09'); g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
      status(g, '11:59', 4);
      g.fillStyle = '#f0883a'; g.beginPath(); g.arc(SW / 2, 330, 96, 0, 2 * PI); g.fill(); g.fillStyle = '#fff'; g.font = font(800, 100); g.textAlign = 'center'; g.fillText('T', SW / 2, 366);
      g.font = font(700, 64); g.fillText('Theo', SW / 2, 530); g.font = font(500, 32); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText('FaceTime Video…', SW / 2, 580);
      [[150, '#ff453a'], [SW - 150, '#30d158']].forEach(([cx, c]) => { g.fillStyle = c; g.beginPath(); g.arc(cx, 1010, 66, 0, 2 * PI); g.fill(); });
      g.fillStyle = '#fff'; g.font = font(600, 26); g.fillText('Decline', 150, 1112); g.fillText('Accept', SW - 150, 1112);
    }
    base.t.needsUpdate = true;
  }
  function drawOver(state, x = {}) {
    const key = state + JSON.stringify(x); if (over.key === key) return; over.key = key;
    const g = over.g; g.clearRect(0, 0, SW, SH);
    if (state === 'call') {
      const gr = g.createLinearGradient(0, 0, 0, 230); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, SW, 230);
      status(g, '11:59', x.batt ?? 4);
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = font(800, 44); g.fillText('Theo', 40, 128); g.font = font(600, 28); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(x.timer || '0:01', 40, 168);
      g.fillStyle = '#20232c'; rr(g, SW - 170, 92, 130, 200, 22); g.fill(); g.fillStyle = '#3a3f4e'; g.beginPath(); g.arc(SW - 105, 170, 34, 0, 2 * PI); g.fill(); rr(g, SW - 150, 210, 90, 70, 30); g.fill();
      g.fillStyle = 'rgba(30,30,36,.72)'; rr(g, 40, SH - 170, SW - 80, 120, 60); g.fill();
      [[130, '#5b5e6a'], [SW / 2, '#5b5e6a'], [SW - 130, '#ff453a']].forEach(([cx, c]) => { g.fillStyle = c; g.beginPath(); g.arc(cx, SH - 110, 40, 0, 2 * PI); g.fill(); });
    } else if (state === 'scan' || state === 'preview') {
      g.fillStyle = 'rgba(10,10,14,.78)'; g.fillRect(0, 0, SW, 150);
      status(g, '11:59', 3);
      g.drawImage(icon, 36, 82, 52, 52); g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = font(800, 36); g.fillText('Scribe', 100, 120);
      g.textAlign = 'right'; g.font = font(600, 26); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(state === 'scan' ? 'Scan worksheet' : '1 page', SW - 36, 120);
      if (state === 'scan') {
        g.strokeStyle = '#ffd84a'; g.lineWidth = 9; g.lineCap = 'round';
        const [x0, y0, x1, y1] = [70, 640, SW - 70, 1010], c = 46;
        [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x, y + sy * c); g.lineTo(x, y); g.lineTo(x + sx * c, y); g.stroke(); });
        g.fillStyle = 'rgba(10,10,14,.7)'; g.fillRect(0, SH - 170, SW, 170);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(SW / 2, SH - 88, 54, 0, 2 * PI); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6; g.beginPath(); g.arc(SW / 2, SH - 88, 66, 0, 2 * PI); g.stroke();
      } else {
        g.fillStyle = 'rgba(10,10,14,.8)'; rr(g, 40, SH - 190, SW - 80, 130, 26); g.fill();
        g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = font(700, 30); g.fillText('Reading 20 problems…', 72, SH - 135);
        g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, 72, SH - 108, SW - 144, 14, 7); g.fill(); g.fillStyle = '#ffd84a'; rr(g, 72, SH - 108, (SW - 144) * (x.prog ?? 0.3), 14, 7); g.fill();
      }
    }
    over.t.needsUpdate = true;
  }

  // ---- head + phone tracks --------------------------------------------------------------------------------------
  const SEAT = [0, D.eye, D.seat[1]], DOWN = [0.04, 0.87, 0.24], STAND = [0, 1.36, 0.47], UNDER = [0.1, 0.35, 0.66];
  const HEAD0 = { p: DOWN, yaw: 0.12, pitch: -0.16, roll: 0.78, fov: 92 };   // head on the desk, cheek on the worksheet: the aisle on its side
  const HEAD = [
    { t: 1.35, d: 0.95, p: SEAT, yaw: 0, pitch: -0.08, roll: 0, ease: 'out' },
    { t: T.phoneUp + 0.45, d: 0.4, pitch: -0.4, fov: 84 },
    { t: T.off[4] + 0.08, d: 0.24, pitch: -0.03, fov: 92, ease: 'whip' },
    { t: T.off[5] + 0.45, d: 0.45, yaw: 0.1 },
    { t: T.ring + 0.35, d: 0.35, pitch: -0.42, yaw: 0, fov: 78 },
    { t: BT('you1').s0 + 0.35, d: 0.4, pitch: -0.06, yaw: -0.06, fov: 90 },
    { t: WT('you1', 'worksheets') + 0.25, d: 0.35, pitch: -0.8, yaw: 0.0, fov: 84 },
    { t: BT('theo2').s0 + 0.25, d: 0.35, pitch: -0.42, fov: 78 },
    { t: T.scan + 0.35, d: 0.5, pitch: -0.62, fov: 80 },
    { t: T.zoom1, d: T.zoom1 - T.zoom0, p: [0, 1.1, 0.46], fov: 52 },
    { t: T.lookUp + 0.2, d: 0.22, p: SEAT, pitch: -0.02, fov: 92, ease: 'whip' },
    { t: BT('g1').s0 + 0.3, d: 0.6, yaw: 0.05, pitch: 0.0 },
    { t: T.stand + 0.55, d: 0.55, p: STAND, pitch: -0.12, yaw: 0 },
    { t: T.dont + 0.25, d: 0.22, pitch: -0.62, fov: 76, ease: 'whip' },
    { t: BT('sick').s1 + 0.6, d: 0.6, p: [0, 1.25, 0.5], pitch: -0.03, fov: 90 },
    { t: T.duck + 0.5, d: 0.5, p: UNDER, pitch: 0.0, yaw: 0, fov: 96 },
    { t: T.buzz + 0.22, d: 0.22, pitch: -0.45, yaw: 0.08, fov: 82, ease: 'whip' },
    { t: T.what + 0.12, d: 0.24, pitch: 0.0, yaw: 0, fov: 96, ease: 'whip' },
    { t: T.door + 0.75, d: 0.6, fov: 72, yaw: -0.03 },
    { t: T.sent + 0.25, d: 0.3, pitch: -0.48, yaw: 0.1, fov: 76 },
    { t: BT('nope').s1 + 0.35, d: 0.45, pitch: 0.0, yaw: 0, fov: 96 },
    { t: T.hurry + 0.12, d: 0.16, fov: 26, yaw: 0.0, pitch: 0.035, ease: 'whip' },
    { t: BT('hurry').s1 + 0.25, d: 0.18, fov: 96, yaw: 0, ease: 'whip' },
  ];
  // phone in camera space: p, pitch = rotation.x (+ tilts the back up), yaw = rotation.y, roll = rotation.z
  const LOW = [0.05, -0.29, -0.34], MID = [0.0, 0.0, -0.3];
  const PH0 = { p: [-0.05, -0.55, -0.36], pitch: 0.1, yaw: 0, roll: 0.1 };
  const PHONE = [
    { t: T.phoneUp + 0.45, d: 0.45, p: MID, pitch: 0.1, roll: 0 },
    { t: T.off[4] + 0.1, d: 0.3, p: LOW, pitch: -0.45, roll: -0.08 },
    { t: T.ring + 0.35, d: 0.35, p: MID, pitch: 0.1, roll: 0 },
    { t: BT('you1').s0 + 0.35, d: 0.4, p: LOW, pitch: -0.45 },
    { t: WT('you1', 'worksheets') + 0.25, d: 0.35, p: [0.17, -0.13, -0.3], pitch: 0.05, roll: -0.2 },
    { t: BT('theo2').s0 + 0.25, d: 0.35, p: MID, pitch: 0.1, roll: 0 },
    { t: T.scan + 0.35, d: 0.5, p: [0.0, -0.01, -0.3], pitch: 0.22 },
    { t: T.lookUp + 0.2, d: 0.25, p: LOW, pitch: -0.45 },
    { t: T.dont + 0.25, d: 0.25, p: MID, pitch: 0.1 },
    { t: BT('sick').s1 + 0.6, d: 0.5, p: LOW, pitch: -0.45 },
    { t: T.duck + 0.5, d: 0.5, p: [-0.06, -0.24, -0.27], pitch: -0.3, roll: 0.15 },
    { t: T.buzz + 0.22, d: 0.22, p: [-0.02, -0.04, -0.26], pitch: 0.05, roll: 0.05 },
    { t: T.smother + 0.3, d: 0.3, p: [-0.02, -0.33, -0.22], pitch: -1.45, roll: 0 },
    { t: T.sent + 0.25, d: 0.3, p: [-0.01, -0.035, -0.25], pitch: 0.08 },
    { t: BT('nope').s1 + 0.35, d: 0.45, p: [-0.04, -0.3, -0.26], pitch: -0.6 },
  ];
  // a temp head for camera math without touching the real camera (the photo's pose at the flash)
  const tmpCam = new THREE.Object3D(), tmpPh = new THREE.Object3D(); tmpCam.add(tmpPh);
  function phoneWorld(t, outCam) {
    const h = moves(t, HEAD0, HEAD), pp = moves(t, PH0, PHONE);
    tmpCam.position.fromArray(h.p); tmpCam.rotation.set(h.pitch, h.yaw, h.roll, 'YXZ');
    tmpPh.position.fromArray(pp.p); tmpPh.rotation.set(pp.pitch, pp.yaw, pp.roll);
    tmpCam.updateMatrixWorld(true);
    // the phone's camera: at the lens on its back, looking out the back (−z of the phone)
    outCam.position.set(-0.02, 0.06, -0.012); outCam.rotation.set(0, 0, 0);   // identity: a child camera looks down the phone's −z (out of its back)
    tmpPh.add(outCam); outCam.updateMatrixWorld(true);
    const m = outCam.matrixWorld.clone(); tmpPh.remove(outCam);
    m.decompose(outCam.position, outCam.quaternion, outCam.scale);
    outCam.updateMatrixWorld(true);
  }
  // the photo: frozen at the flash; where the figure lands in it (for the pinch-zoom on the preview)
  const GUARD_PHOTO = { x: 0.25, z: -12.3, rotY: 0 };
  phoneWorld(T.flash, phoneCam);
  const photoPose = { p: phoneCam.position.clone(), q: phoneCam.quaternion.clone() };
  poseGuard({ ...GUARD_PHOTO, visible: true });
  const figUV = guard.head.getWorldPosition(new THREE.Vector3()).project(phoneCam);
  const FIG = [(figUV.x + 1) / 2, (figUV.y + 1) / 2 - 0.03];
  console.log('[086] photo figure uv', FIG.map((v) => v.toFixed(3)).join(', '));

  // Theo's lines (for his mouth) and faces per beat
  const theoLines = (story.phrases || []).filter((p) => p.who === 'theo');
  const allWords = Object.values(story.beats).filter((b) => b.who === 'theo').flatMap((b) => b.w);
  const THEO_FACE = { theo1: { brows: 0.55, eyes: 'open' }, theo2: { brows: -0.1, eyes: 'open', grin: true }, theo3: { brows: 0.2, eyes: 'open' }, dont: { brows: 0.9, eyes: 'wide' },
    sick: { brows: 0.8, eyes: 'wide' }, nope: { brows: 1.0, eyes: 'wide' }, sent: { brows: 0.6, eyes: 'open' } };
  const beatAt = (t) => { let id = story.order[0]; for (const k of story.order) if (BT(k).t0 <= t) id = k; return id; };

  // ---- text layer -------------------------------------------------------------------------------------------------
  const hud = createPovStoryHud(story, {
    stamp: { t0: 0.0, t1: 4.2, day: 'THURSDAY · 11:58 PM', place: 'Library, 4th floor · finals week' },
    banners: [
      { t0: T.ring - 0.05, t1: T.accept + 0.1, iconText: 'T', iconBg: '#f0883a', app: 'FaceTime', time: 'now', title: 'Theo', text: 'Incoming video call…' },
      { t0: T.buzz, t1: T.buzz + 2.5, icon: DIR + 'scribe-icon.png', app: 'Scribe', time: 'now', title: 'Worksheet done <span style="color:#1f9d55">✓</span>', text: '20/20 answered, in <em>your handwriting</em>.' },
    ],
    choice: { t: T.choice, q: 'WHAT WOULD<br>YOU DO?', a: { text: 'GO TO THE GUARD', color: '#2fae5a', icon: 'flashlight' }, b: { text: 'RUN FOR THE STAIRS', color: '#e0383e', icon: 'stairs' } },
  });

  // ---- per-frame ----------------------------------------------------------------------------------------------------
  const camHead = new THREE.Vector3();
  function update(t) {
    // lights: banks clack off far → near; the banker's lamp stays; the stairwell lights up when Jules opens the door
    const banks = D.banks.map((_, i) => { const k = [0, 0, 1, 2, 3, 4, 5][i]; return t < T.off[k] ? 1 : 0; });
    L.setBanks(banks);
    L.setLamp(1);
    const doorK = smooth((t - T.door) / 0.5), wide = smooth((t - T.hurry + 0.2) / 0.4);
    L.setDoor(-(0.95 + 0.3 * wide) * doorK); L.setStair(doorK);
    const wave = t > T.hurry - 0.1 ? Math.sin((t - T.hurry) * 9) * 0.35 : 0;
    jules.set({ x: 0.3, z: D.back - 0.45, rotY: 0, scale: 1.12, eyes: 'open', mouth: 'o', tint: [0x140c14, 0.82], lean: 0.08,
      armL: t > T.hurry - 0.1 ? { x: -2.5 + wave, z: 0.35, el: 0.5 } : { x: -0.3, z: 0.2, el: 0.6 }, armR: { x: -0.2, z: 0.15 }, head: { z: 0.12 } });
    jules.root.visible = doorK > 0.05;
    L.setClock(11, 58 + Math.min(1, Math.max(0, (t - 20) / 40)));

    // guard
    let gp = { visible: false };
    if (t >= T.beam0 - 0.2 && t < T.enter) {   // hidden in the far cross aisle, sweeping his beam across the main aisle
      const u = clamp((t - T.beam0) / (T.beam1 - T.beam0));
      const sw = Math.sin(u * PI * 1.5);
      gp = { x: -1.95, z: D.cross[1], rotY: PI / 2, visible: true, aim: [1.3 + 0.5 * sw, 0.15, D.cross[1] + 0.45 + 0.4 * sw], on: smooth((t - T.beam0) / 0.4) };
    } else if (t >= T.enter) {
      // steps into the main aisle at the near cross aisle, then walks toward the table, stops, turns to the door, comes close
      const zWalk = lerp(D.cross[0], -2.7, smooth((t - (T.duck + 0.2)) / 2.4));
      const zCome = lerp(-2.7, -1.55, smooth((t - T.come) / 1.4));
      const x = lerp(lerp(lerp(-2.0, -0.25, smooth((t - T.enter) / 1.1)), -0.78, smooth((t - T.door + 0.5) / 0.7)), -0.42, smooth((t - T.come) / 1.2));   // steps aside (the stairwell door shows past him), then comes to our table
      const z = t < T.come ? zWalk : zCome;
      const walking = (t > T.enter && t < T.enter + 1.1) || (t > T.duck + 0.2 && t < T.duck + 2.6) || (t > T.come && t < T.come + 1.4);
      const toDoor = smooth((t - T.door - 0.2) / 0.6) * (1 - smooth((t - T.come + 0.3) / 0.5));
      const rotY = lerp(t < T.enter + 0.9 ? PI / 2 : 0, PI, toDoor);
      const sweep = Math.sin(t * 1.3) * 0.6;
      let aim = [x + sweep * 0.8, 0, z + 3.0];
      if (t >= T.what - 0.1 && t < T.door) aim = [0.2 + Math.sin(t * 2.2) * 0.25, 0.1, 0.0];            // "What was that?" — beam to our table
      if (toDoor > 0.02) aim = [lerp(aim[0], 0, toDoor), lerp(aim[1], 1.0, toDoor), lerp(aim[2], D.back, toDoor)];
      if (t >= T.come) { const u = smooth((t - T.come - 0.3) / 0.9); aim = [lerp(0.3, 0.1, u), lerp(0.0, 0.36, u), lerp(-0.6, 0.66, u)]; }   // across the floor, then into the lens
      const bend = smooth((t - T.come - 0.3) / 0.9);   // "Come on out": he bends down, the torch low, into the lens
      gp = { x, z, rotY: t >= T.come ? lerp(rotY, 0.15, smooth((t - T.come) / 0.5)) : rotY, visible: true, walk: walking ? t * 7.5 : null, aim, on: 1, lean: 0.03 + 0.55 * bend,
        armR: { x: lerp(-1.25, -0.55, bend), z: 0.18, el: 0.2 }, beamOp: lerp(0.42, 0.035, bend) };
    }
    poseGuard(gp);

    // head + phone
    const amp = t < T.off[3] ? 1 : t < T.duck ? 1.6 : 2.4;
    const h = moves(t, HEAD0, HEAD), sh = shake(t, amp);
    setHead(camera, h, sh);
    const pp = moves(t, PH0, PHONE);
    phone.g.position.fromArray(pp.p); phone.g.rotation.set(pp.pitch, pp.yaw, pp.roll);
    const phoneVisible = t >= T.phoneUp && t < T.choice + 1;
    phone.g.visible = phoneVisible;
    arms.L.set({ visible: phoneVisible });
    // right hand: on the table at first (world → camera space), the shutter tap, then out of shot
    if (t < T.phoneUp + 0.3) {
      const w = camera.worldToLocal(new THREE.Vector3(0.24, D.tableY + 0.03, 0.18));
      arms.R.set({ cam: w.toArray(), rot: [-0.25 - h.pitch, -0.35, 0], pose: 'rest' });
    } else if (t > T.tap - 0.45 && t < T.tap + 0.35) {
      const u = smooth((t - (T.tap - 0.45)) / 0.3) * (1 - smooth((t - (T.tap + 0.1)) / 0.25));
      phone.g.updateMatrix();
      const btn = new THREE.Vector3(0.0, -phone.H * 0.39, 0.03).applyMatrix4(phone.g.matrix);
      const far = btn.clone().add(new THREE.Vector3(0.14, -0.2, -0.02));   // reach in at the phone's depth (closer to the lens it filled a third of the frame)
      arms.R.set({ cam: far.lerp(btn, u).add(new THREE.Vector3(0.03, -0.07, 0.035)).toArray(), rot: [0.25, -0.35, 0.5], pose: 'point' });
    } else arms.R.set({ visible: false });

    // the torch glare: how straight the beam points at the lens
    { const lp = torch.g.localToWorld(new THREE.Vector3(0, 0, 0.14)), dir = torch.g.getWorldDirection(new THREE.Vector3()), to = camera.position.clone().sub(lp).normalize();
      const k = torch.g.visible && torch.beam.visible ? Math.pow(Math.max(0, dir.dot(to)), 10) : 0;
      glare.visible = k > 0.01; glare.position.copy(lp); glare.scale.setScalar(0.08 + 0.42 * k); glare.material.opacity = Math.min(1, 0.3 + k); }
    // phone screen state
    let st = 'off';
    if (t >= T.phoneUp) st = 'lock';
    if (t >= T.ring) st = 'incoming';
    if (t >= T.accept) st = 'call';
    if (t >= T.scan) st = 'scan';
    if (t >= T.flash) st = 'white';
    if (t >= T.preview) st = 'preview';
    if (t >= T.lookUp) st = 'call';
    if (t >= T.buzz) st = 'notif';
    if (t >= T.sent - 0.1) st = 'call';
    const bright = st === 'notif' ? 1 - 0.85 * smooth((t - T.smother) / 0.4) : t >= T.duck && st === 'call' ? 0.72 : t < T.buzz && t >= T.duck ? 0.0 : 1;
    phone.setOn(st === 'off' ? 0 : bright);
    const batt = t < T.buzz ? 4 : 2;
    if (st === 'lock') { drawBase('lock', { batt }); phone.setMap(base.t); phone.setUI(null); }
    else if (st === 'incoming') { drawBase('incoming'); phone.setMap(base.t); phone.setUI(null); }
    else if (st === 'notif') { drawBase('notif', { time: '12:00', batt }); phone.setMap(base.t); phone.setUI(null); }
    else if (st === 'white') { drawBase('white'); phone.setMap(base.t); phone.setUI(null); }
    else if (st === 'call' || st === 'scan' || st === 'preview') {
      if (st === 'call') {
        // Theo talks: mouth flaps on his word times; face per beat
        const id = beatAt(t), F = THEO_FACE[id] || { brows: 0.3, eyes: 'open' };
        const w = allWords.find((x) => t >= x[1] && t < x[2]);
        const flap = w ? (Math.floor((t - w[1]) * 9) % 2 === 0 ? 'o' : (F.grin ? 'grin' : 'flat')) : (F.grin ? 'smile' : 'flat');
        const nod = Math.sin(t * 2.1) * 0.05 + (w ? Math.sin(t * 11) * 0.025 : 0);
        theo.set({ x: 0, z: 0, eyes: F.eyes, brows: F.brows, mouth: flap, look: [0, 0.15], head: { x: 0.05 + nod, y: Math.sin(t * 0.7) * 0.08, z: Math.sin(t * 0.9) * 0.05 },
          armR: { x: -1.3, z: 0.25, el: 1.6 }, lean: 0.06 });
        callCam.position.set(200 + 0.08, theoHead.y + 0.06, theoHead.z + 1.75);
        callCam.lookAt(200, theoHead.y - 0.12, theoHead.z); callCam.rotation.z += Math.sin(t * 1.3) * 0.02;
        renderer.setRenderTarget(rtCall); renderer.render(scene, callCam); renderer.setRenderTarget(null);
        rtCall.texture.repeat.set(1, 1); rtCall.texture.offset.set(0, 0);
        phone.setMap(rtCall.texture);
        const secs = Math.max(1, Math.floor(t - T.accept) + 1);
        drawOver('call', { timer: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, batt });
      } else {
        // the phone camera: live viewfinder (no one there) / the frozen photo at the flash (someone there)
        const frozen = st === 'preview';
        if (frozen) { phoneCam.position.copy(photoPose.p); phoneCam.quaternion.copy(photoPose.q); phoneCam.updateMatrixWorld(true); }
        else phoneWorld(t, phoneCam);
        const keep = { gv: guard.root.visible, tv: torch.g.visible, av: arms.root.visible, pv: phone.g.visible, fl: flashL.intensity };
        arms.root.visible = false; phone.g.visible = false;
        if (frozen) { poseGuard({ ...GUARD_PHOTO, visible: true }); torch.g.visible = false; flashL.intensity = 0; }
        else { guard.root.visible = false; torch.g.visible = false; }
        if (frozen) { flashW.position.copy(phoneCam.position); flashW.intensity = 14; }
        renderer.setRenderTarget(rtCam); renderer.render(scene, phoneCam); renderer.setRenderTarget(null);
        flashW.intensity = 0;
        if (frozen) poseGuard(gp);
        guard.root.visible = keep.gv; torch.g.visible = keep.tv; arms.root.visible = keep.av; phone.g.visible = keep.pv;
        // pinch-zoom into the photo's top where the figure stands
        const z = frozen ? lerp(1, 0.3, smooth((t - T.zoom0) / Math.max(0.2, T.zoom1 - T.zoom0))) : 1;
        rtCam.texture.repeat.set(z, z);
        rtCam.texture.offset.set(clamp(FIG[0] - z / 2, 0, 1 - z), clamp(FIG[1] - z * 0.55, 0, 1 - z));
        phone.setMap(rtCam.texture);
        drawOver(st, { prog: frozen ? clamp((t - T.preview) / 3) : 0 });
      }
      phone.setUI(over.t);
    }
    // the camera flash lights the real room too (3 frames)
    flashL.intensity = t >= T.flash && t < T.flash + 0.1 ? 14 : 0;
    // the screen's glow on the hands under the table
    phone.light.intensity *= t >= T.duck ? 1.6 : 1;

    // fisheye: a touch stronger when Sam is scared
    lens.set(t < T.duck ? 0.42 : 0.5);
    hud.update(t);
  }
  return { update };
}
