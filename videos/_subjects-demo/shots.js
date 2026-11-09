// _subjects-demo (Nov 9): every Scribe subject pack (engine/build/subjects.js) written one after another, 7 s each — the sheet
// on top (its figure drawn by the pen in writing order), the app below it (scan → solve → write → done with the pack's class line).
// Not a reel: a catalogue for producers. `node tools/render.mjs _subjects-demo --stills 6.6,13.6,20.6,27.6,34.6` = each pack done;
// `--stills 200 --full` = all five sheets + their app screens on one frame (the lineup below), the picture to pick a pack from.
import * as THREE from 'three';
import { clamp } from '@engine/core.js';
import { loadHand, loadImg, makeScreen } from '@engine/build/scribe.js';
import { subjectSheet, SUBJECT_KEYS, SUBJECTS } from '@engine/build/subjects.js';
import { makePen } from '@engine/build/library.js';

const SEG = 7, SCAN = 0.7, SOLVE = 1.5, W0 = 1.6, W1 = 6.2;   // per pack: scan, solve, write the sheet, hold on 'done'
const PW = 0.94, PH = PW * 1325 / 1024, PY = 0.3;               // the paper plane (world units; camera frame ≈ 1.11 × 1.98)

function labelTex(text, sub) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#f3efe6'; g.font = '600 40px Inter, Arial'; g.fillText(text, 8, 44);
  if (sub) { g.fillStyle = '#c9a36a'; g.font = '500 28px Inter, Arial'; g.fillText(sub, 8, 84); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function build(studio) {
  const { scene, setCamera } = studio;
  scene.background = new THREE.Color(0x24211d);
  scene.add(new THREE.AmbientLight(0xffffff, 1.4)); const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(1, 2, 3); scene.add(key);
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const packs = SUBJECT_KEYS.map((key) => { const sheet = subjectSheet(G, key); return { key, sheet, screen: makeScreen(G, icon, sheet), label: labelTex(`subjectSheet(G, '${key}')`, `${SUBJECTS[key].label}  ·  ${sheet.total.toFixed(0)} pen units`) }; });
  const basic = () => new THREE.MeshBasicMaterial({ toneMapped: false });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), basic()); paper.position.set(0, PY, 0); scene.add(paper);
  const lap = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), basic()); lap.position.set(0, -0.63, 0); scene.add(lap);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(PW, PW * 96 / 1024), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true })); tag.position.set(0, PY + PH / 2 + 0.035, 0); scene.add(tag);
  const pen = makePen(); pen.g.scale.setScalar(0.9); scene.add(pen.g);
  // lineup (t ≥ 200): the five sheets fully written, a 3 × 2 grid, the sixth cell = two app screens
  const lineup = new THREE.Group(); scene.add(lineup);
  const LW = 0.44, LH = LW * 1325 / 1024, LG = 0.012, LY = (3 * LH + 2 * LG) / 2 - LH / 2;
  packs.forEach((P, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ toneMapped: false, map: P.sheet.tex })); m.position.set((i % 2 ? 1 : -1) * (LW / 2 + LG / 2), LY - Math.floor(i / 2) * (LH + LG), 0); lineup.add(m); });
  const shot = (P, mode, k) => { const c = document.createElement('canvas'); c.width = 1280; c.height = 800; P.sheet.draw(mode === 'write' ? P.sheet.total * 0.6 : 0, true); P.screen.draw({ mode, k }); c.getContext('2d').drawImage(P.screen.canvas, 0, 0); P.sheet.draw(0, true); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  [[packs[0], 'solve', 0.5], [packs[2], 'write', 0.5]].forEach(([P, mode, k], j) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(LW, LW * 0.625), new THREE.MeshBasicMaterial({ toneMapped: false, map: shot(P, mode, k) })); m.position.set(LW / 2 + LG / 2, LY - 2 * (LH + LG) + LH / 2 - LW * 0.3125 - j * (LW * 0.625 + 0.01), 0); lineup.add(m); });

  function update(t) {
    const lu = t >= 200; lineup.visible = lu; paper.visible = lap.visible = tag.visible = !lu; pen.g.visible = false;
    if (lu) { document.getElementById('ui').style.display = 'none'; for (const P of packs) P.sheet.draw(P.sheet.total + 1); setCamera([0, 0, 3.75], [0, 0, 0], 30, t, 0); return; }
    const i = Math.min(packs.length - 1, Math.floor(t / SEG)), u = t - i * SEG, P = packs[i];
    if (paper.material.map !== P.sheet.tex) { paper.material.map = P.sheet.tex; lap.material.map = P.screen.tex; tag.material.map = P.label; for (const m of [paper.material, lap.material, tag.material]) m.needsUpdate = true; }
    const p = clamp((u - W0) / (W1 - W0)) * P.sheet.total, tip = P.sheet.draw(p);
    P.screen.draw(u < SCAN ? { mode: 'scan', k: u / SCAN } : u < SOLVE ? { mode: 'solve', k: (u - SCAN) / (SOLVE - SCAN) } : u < W1 ? { mode: 'write', k: clamp((u - W0) / (W1 - W0)) } : { mode: 'done', k: 1 });
    if (u > W0 && u < W1 + 0.2) {   // Scribe's pen rides the tip of the ink (canvas px → the paper plane)
      pen.g.visible = true;
      pen.g.position.set((tip[0] / 1024 - 0.5) * PW, PY + (0.5 - tip[1] / 1325) * PH, 0.004);
      pen.g.rotation.set(0.95, 0, -0.55);
    }
    setCamera([0, 0, 3.75], [0, 0, 0], 30, t, 0);
  }
  return { update };
}
