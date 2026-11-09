// SIM TEMPLATE (docs/STYLES.md → sim) — copy via `npm run new -- NNN-slug --from _sim-template`. 10 s: the dollhouse-cutaway
// bedroom, a realistic-proportion teen sitting up in bed on his phone, a mini fridge that drops in on "fridge" and a reach
// into it, then a cut to a wider shot of the whole house with Mom walking through the kitchen. Day counter top-centre,
// one-word captions (story.words; narrated reels get them from tools/narrate.py). Keep the structure: SHOTS with a held,
// slowly pushing camera per shot, poses from rig.js applyPose + sim extras (simFace, legsOut), house handles per beat.
import * as THREE from 'three';
import { K, clamp, lerp, smooth, rng } from '@engine/core.js';
import { basePose, applyPose, blink } from '@engine/rig.js';
import { makeSim, simFace, legsOut, lift } from '@engine/sim/person.js';
import { buildSimHouse, D, FY, ROOM_C } from '@engine/sim/house.js';
import { makeMiniFridge, makeCan } from '@engine/sim/props.js';
import { makeSimHud, SIM_FONTS } from '@engine/sim/hud.js';

const PI = Math.PI;
const easeOutBack = (u) => { const c = 1.7; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  await Promise.all(SIM_FONTS.map((f) => document.fonts.load(f).catch(() => {})));
  const H = buildSimHouse(studio, {});
  const B = H.bed.D;
  // the hero: sits up in bed against the pillows (pelvis on the mattress, legs out under the duvet)
  const kid = makeSim({ skin: 0xd6a587, hair: 0x3b2a1d, hairStyle: 'swoop', top: 'hoodie', topColor: 0x4d7a5a, pants: 0x5a5f66, eyes: 0x4a3322 });
  scene.add(kid.root);
  const mom = makeSim({ female: true, skin: 0xd9a88a, hair: 0x6b4a32, hairStyle: 'bun', top: 'cardigan', topColor: 0x9a7fa8, pants: 0x3e4a5e, shoes: 0x6b5a4a, sole: 0x3a302a });
  scene.add(mom.root);
  const fridge = makeMiniFridge(); H.root.add(fridge.g);
  const FR = [-2.42, FY, -3.25];
  const can = makeCan(0xc8322c); scene.add(can);
  const hud = makeSimHud({ show: [0, 10], day: [[0, 1], [5.2, 2]] });
  const DROP = 1.7;

  function kidPose(t) {
    const p = basePose();
    Object.assign(p, { x: B.x - 0.05, z: B.z0 + 0.62, y: H.bed.top - 0.865 + 0.1, rotY: 0, lean: -0.12, headPitch: 0.25, eyes: blink(t, 2) });
    // phone in both hands, then the right arm reaches down to the fridge
    const reach = smooth((t - (DROP + 0.5)) / 0.6) * (1 - smooth((t - 4.4) / 0.6));
    p.armA = { sx: -0.95, sz: 0.12, el: -1.25, twist: 0.4, free: 0 };
    p.armB = { sx: lerp(-0.95, -0.55, reach), sz: lerp(0.12, 0.62, reach), el: lerp(-1.25, -0.25, reach), twist: lerp(-0.4, 0, reach), free: 0 };
    p.headYaw = lerp(0, -0.55, reach); p.headPitch = lerp(0.35, 0.3, reach);
    p.mouth = reach > 0.5 ? 'smile' : 'flat';
    return p;
  }
  function momPose(t) {
    const p = basePose(); const u = clamp((t - 6) / 4);
    Object.assign(p, { x: lerp(0.4, 2.2, u), z: -3.1, rotY: PI / 2, dist: u * 1.8, speed: 0.6, eyes: blink(t, 5) }); lift(p, FY);
    return p;
  }

  const SHOTS = [
    { t0: 0, t1: 5.2, cam: (t) => { const u = smooth(t / 5.2); return { p: [lerp(-3.45, -3.25, u), lerp(2.45, 2.3, u), lerp(7.6, 6.4, u)], a: [-3.45, 0.85, -2.4], fov: 50 };   // aim low: his face sits above the caption band (52 %) } },
    { t0: 5.2, t1: 10, cam: (t) => { const u = smooth((t - 5.2) / 4.8); return { p: [lerp(-1.4, -1.2, u), lerp(4.2, 4.0, u), lerp(17.5, 16.0, u)], a: [-1.2, 1.4, -2.2], fov: 50 }; } },
  ];

  function lineup(t) {   // t >= 200: close-ups to judge faces + proportions (hide the text)
    document.getElementById('ui').style.display = 'none';
    const k = Math.floor(t - 200), p = basePose(), q = basePose();
    Object.assign(p, { x: -3.9, z: -1.2, rotY: 0.25, mouth: k % 2 ? 'smile' : 'flat' }); Object.assign(q, { x: -3.1, z: -1.3, rotY: -0.25 }); lift(p, FY); lift(q, FY);
    applyPose(kid, p); simFace(kid, { open: k === 3 ? 0.7 : 0, brows: k === 2 ? 1 : 0 }); applyPose(mom, q); simFace(mom, {});
    if (k >= 4) { applyPose(kid, kidPose(k === 4 ? 1 : 3)); legsOut(kid); mom.root.visible = false; const hx = B.x, hy = H.bed.top + 0.9; setCamera([hx + (k === 5 ? 0.9 : 0.25), hy + 0.1, B.z0 + 2.6], [hx, hy - 0.25, B.z0 + 0.5], 40, 0, 0); return; }
    H.bed.legBump.visible = false; fridge.g.visible = false; can.visible = false; H.aim(-3.5, -1.2, 5);
    const E = FY + 1.665, cams = [[[-3.5, 1.9, 2.4], [-3.5, 1.6, -1.2], 45], [[-3.8, E + 0.02, -0.62], [-3.86, E, -1.2], 40], [[-3.06, E - 0.04, -0.7], [-3.1, E - 0.06, -1.3], 40], [[-3.55, E + 0.02, -0.25], [-3.8, E, -1.2], 38]];
    const c = cams[k % cams.length]; setCamera(c[0], c[1], c[2], 0, 0);
  }
  function update(t) {
    if (t >= 200) return lineup(t);
    H.update(t); H.setCalendar(t < 5.2 ? 1 : 2); H.setClock(t < 5.2 ? 9 : 10, 15 + t * 2);
    const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    H.aim(sh === SHOTS[0] ? -3.5 : 0, -2, sh === SHOTS[0] ? 6 : 9);
    // the fridge drops in with a little boing
    const k = clamp((t - DROP) / 0.35);
    fridge.g.visible = t >= DROP - 0.4;
    fridge.g.position.set(FR[0], FR[1] + (1 - k) * 2.2 * (k < 1 ? 1 : 0), FR[2]);
    fridge.g.scale.set(1 + 0.12 * Math.sin(clamp((t - DROP - 0.35) / 0.3) * PI) * (t > DROP + 0.35 ? 1 : 0), 1 - 0.12 * Math.sin(clamp((t - DROP - 0.35) / 0.3) * PI) * (t > DROP + 0.35 ? 1 : 0), 1);
    fridge.setDoor(smooth((t - (DROP + 0.9)) / 0.4) * (1 - smooth((t - 4.0) / 0.4)) * 1.6);
    applyPose(kid, kidPose(t)); legsOut(kid); simFace(kid, { look: [0, -0.2] });
    H.bed.legBump.visible = true;
    applyPose(mom, momPose(t)); simFace(mom, {});
    // the can: in the fridge, then in his hand
    const grab = t > DROP + 1.35;
    if (grab) { kid.root.updateMatrixWorld(true); kid.arms[1].hand.getWorldPosition(can.position); can.position.y -= 0.09; can.rotation.set(0, 0, 0); }
    else { const fp = fridge.g.localToWorld(new THREE.Vector3(0, 0.22, 0.05)); can.position.copy(fp); }
    can.visible = t > DROP + 0.3;
    hud.update(t);
    const c = sh.cam(t);
    setCamera(c.p, c.a, c.fov, t, 0.003);
  }
  return { update };
}
