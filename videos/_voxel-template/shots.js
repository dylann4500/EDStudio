// VOXEL TEMPLATE — `npm run new -- NNN-my-slug --from _voxel-template`. The blocky-game look (engine/voxel/, docs/STYLES.md →
// voxel): a block town with baked ambient occlusion, square-headed people with 8 × 8 pixel faces, flat chunky clouds, bright
// flat daylight. Two shots (town street → bedroom) + a lineup at t ≥ 200 (every arm preset + face, render --stills 200,201,202,203).
// Keep the structure (SHOTS, CAMS, build/update); swap the sets, people and cameras.
import * as THREE from 'three';
import { K, clamp, lerp, smooth, walkLegs } from '@engine/core.js';
import { buildVoxTown, buildVoxBedroom, makeVoxPerson, randomOutfit, ARMS, FACES, voxPhone, pixelCanvas, nearestTex } from '@engine/voxel/index.js';

const PI = Math.PI;
const OFF_ROOM = [0, 0, 3000];                     // the bedroom is parked far from the town (one root visible per shot)
export const SHOTS = [
  { t0: 0, t1: 5, cam: 'street', set: 'town' },
  { t0: 5, t1: 10, cam: 'room', set: 'room' },
];
// p: camera position [start, end]; a: look-at [start, end] (set-local); fov in degrees
export const CAMS = {
  street: { p: [[-30, 1.9, 1.2], [-24, 2.0, 1.6]], a: [[-24, 1.3, 6.4], [-18, 1.3, 6.4]], fov: 46 },
  room: { p: [[-0.6, 1.75, 4.6], [-0.3, 1.65, 4.0]], a: [[1.6, 0.95, 0.9], [1.7, 0.95, 0.9]], fov: 50 },
};

export async function build(studio, story) {
  const { scene, camera, setCamera } = studio;
  const town = buildVoxTown(studio, { school: true });
  const townFog = scene.fog;
  const room = buildVoxBedroom(studio); room.root.position.set(...OFF_ROOM);

  const hero = makeVoxPerson({ height: 1.7, skin: 0xe0ac86, hair: 0x2a1c14, hairStyle: 'messy', top: 'hoodie', shirt: 0x9a1c25, pants: 0x34405c, backpack: 0x3c6fd8 });
  scene.add(hero.root);
  const kids = [0, 1, 2].map((i) => { const p = makeVoxPerson({ height: 1.55 + i * 0.06, ...randomOutfit(11 + i) }); scene.add(p.root); return p; });
  const phoneC = pixelCanvas(30, 60, (g) => { g.fillStyle = '#f3f1eb'; g.fillRect(0, 0, 30, 60); g.fillStyle = '#9a1c25'; g.fillRect(0, 0, 30, 9); g.fillStyle = '#26282c'; for (let i = 0; i < 6; i++) g.fillRect(4, 14 + i * 7, 14 + (i * 5) % 9, 2); });
  const phone = voxPhone(nearestTex(phoneC)); scene.add(phone);

  // lineup (t ≥ 200): every arm preset on its own figure, faces cycling — hide the text layer (CLAUDE.md lineup rule)
  const LINE = Object.keys(ARMS).map((k, i) => { const p = makeVoxPerson({ height: 1.75, ...randomOutfit(40 + i) }); p.root.visible = false; scene.add(p.root); return [k, p]; });

  function useSet(name) {
    town.world.root.visible = name === 'town'; room.root.visible = name === 'room';
    scene.fog = name === 'town' ? townFog : null; camera.near = 0.05; camera.far = name === 'town' ? 12000 : 200; camera.updateProjectionMatrix();
    scene.background = new THREE.Color(name === 'town' ? 0xcfe6fb : 0x9fc6ee);
  }

  function update(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = t >= 200 ? 'none' : '';
    LINE.forEach(([, p]) => (p.root.visible = false));
    if (t >= 200) return lineup(t);
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    useSet(shot.set);
    town.update(t);
    hero.root.visible = true; kids.forEach((k) => (k.root.visible = shot.set === 'town')); phone.visible = false;
    if (shot.set === 'town') {
      town.world.aim(-24, 6, 30); town.cars.forEach((c) => (c.visible = !(c.position.z > 0 && c.position.z < 5 && c.position.x > -40 && c.position.x < -8)));
      const w = walkLegs(t, [-30, 6.2], [{ t0: 0.0, t1: 5.2, pts: [[-14, 6.2]] }]);
      hero.pose({ x: w.x, z: w.z, rotY: PI / 2, walk: hero.phaseFor(w.dist), face: t > 3.2 && t < 3.6 ? 'blink' : 'happy', head: { yaw: -0.5 * smooth((t - 2) / 0.6) } });
      kids.forEach((k, i) => {
        const wk = walkLegs(t, [-33.5 - i * 1.4, 5.4 + (i % 2) * 1.2], [{ t0: 0.3 + i * 0.2, t1: 5.4, pts: [[-19.5 - i * 1.4, 5.4 + (i % 2) * 1.2]] }]);
        k.pose({ x: wk.x, z: wk.z, rotY: PI / 2, walk: k.phaseFor(wk.dist), face: i === 1 ? 'talk' : 'idle', armL: i === 2 ? ARMS.wave : undefined });
      });
    } else {
      const O = OFF_ROOM;
      hero.pose({ x: O[0] + 2.0, z: O[2] + 1.15, rotY: PI, crouch: 0, legL: { x: -1.45, bend: 1.45 }, legR: { x: -1.45, bend: 1.45 }, y: -0.24, armR: ARMS.phone, armL: { x: -0.9, z: 0.05, bend: -0.6 }, head: { pitch: 0.35 }, face: t > 7.5 ? 'shock' : 'idle' });
      phone.visible = true; hero.root.updateMatrixWorld(true);
      hero.hand.R.getWorldPosition(phone.position); phone.position.y += 0.06; phone.rotation.set(-0.5, PI, 0);
    }
    if (shot.set === 'town') {                          // the street camera tracks the hero from the road (frame people by position, not by eye)
      const hx = hero.root.position.x;
      setCamera([hx + 2.2, 1.35, 1.0], [hx - 0.6, 1.05, 6.2], 46, t, 0.004); return;
    }
    const c = CAMS[shot.cam], u = smooth((t - shot.t0) / (shot.t1 - shot.t0)), O = shot.set === 'room' ? OFF_ROOM : [0, 0, 0];
    setCamera(c.p[0].map((v, i) => lerp(v, c.p[1][i], u) + O[i]), c.a[0].map((v, i) => lerp(v, c.a[1][i], u) + O[i]), c.fov, t, 0.004);
  }

  function lineup(t) {
    useSet('town'); hero.root.visible = false; kids.forEach((k) => (k.root.visible = false)); phone.visible = false;
    const page = Math.floor(t - 200);
    if (page === 3) {                                   // a wide of the town from above (the look at scale)
      town.world.aim(0, 10, 90); setCamera([-60, 46, 70], [10, 0, 0], 50, 0, 0); return;
    }
    const per = 5, list = LINE.slice(page * per, page * per + per);
    town.world.aim(-40, 6, 12);
    list.forEach(([k, p], i) => { p.root.visible = true; p.pose({ x: -42.4 + i * 0.8, z: 6, rotY: PI, armL: ARMS[k], armR: ARMS[k], face: FACES[(i + page * per) % FACES.length] }); });
    setCamera([-40.8, 1.2, 1.2], [-40.8, 1.0, 6], 44, 0, 0);
  }
  return { update };
}
