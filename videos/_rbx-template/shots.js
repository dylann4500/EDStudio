// RBX TEMPLATE — `npm run new -- NNN-my-slug --from _rbx-template`. The blocky-avatar game look (engine/rbx/, docs/STYLES.md → rbx):
// a grey studded baseplate under a bright painted sky, glossy plastic parts, classic blocky avatars with printed faces, obby props
// (spinner, lava, checkpoint, truss, coins), floating name tags, chat bubbles + a chat log, the stiff walk/jump and the "oof"
// (the avatar breaks into its parts). 10 s: walk + wave + "hi chat" → jump the bricks → lava → oof → respawn at the checkpoint.
// t ≥ 200 = lineups (render --stills 200,201,202,203,204): faces, arm presets, hair + hats, dogs + debris, a wide of the course.
import * as THREE from 'three';
import { clamp, lerp, smooth } from '@engine/core.js';
import * as R from '@engine/rbx/index.js';

const PI = Math.PI;
export async function build(studio, story) {
  const { scene, camera, setCamera } = studio;
  await Promise.all(['700 64px Fredoka', '600 52px Fredoka'].map((f) => document.fonts.load(f).catch(() => {})));
  const W = R.rbxWorld(studio, { size: 700 });
  const tags = R.makeTags(scene), chat = R.makeBubbles(scene);

  // ---- the course (all positions in metres; the camera looks roughly −z)
  const cp1 = R.makeCheckpoint({ n: 1, color: 0x2fd06a }); cp1.g.position.set(0, 0, 6); scene.add(cp1.g);
  const spin = R.makeSpinner({ len: 8 }); spin.g.position.set(-5, 0, -6); scene.add(spin.g);
  const lava = R.makeLava([6, 5]); lava.g.position.set(3.5, 0, -7.5); scene.add(lava.g);
  const bricks = R.obbyCourse(scene, [[1.2, 0.3, -1.5, 2, 2, 0x3c8dff], [2.3, 0.9, -3.6, 2, 2, 0xffc73b], [3.4, 1.5, -5.6, 2, 1.6, 0x2fd06a]]);
  const truss = R.makeTruss(6); truss.position.set(-1.5, 0, -9); scene.add(truss);
  R.part([8, 6, 1], { color: 0xb6b9bf, top: 'studs', parent: scene, pos: [-1.5, 3, -10] });
  const coins = [0, 1, 2].map((i) => { const c = R.makeCoin(); c.g.position.set(-5.5 + i * 1.4, 1.2, -2.5); scene.add(c.g); return c; });
  const sign = R.makeSign(['OBBY', 'stage 1'], { w: 3, h: 1.6, bg: '#2f7cf6' }); sign.g.position.set(4.2, 1.6, 3); sign.g.rotation.y = -0.5; scene.add(sign.g);
  R.part([0.25, 0.8, 0.25], { color: 0x6b6f76, parent: scene, pos: [4.2, 0.4, 3] });
  for (const [x, z, k] of [[-12, -18, 'round'], [9, -22, 'pine'], [-18, -6, 'round'], [16, -10, 'round']]) { const t = R.rbxTree(k); t.position.set(x, 0, z); scene.add(t); }

  // ---- people
  const hero = R.makeAvatar({ skin: 0xf5cd30, shirt: 0x2f7cf6, pants: 0x2fa84f, hair: 'short', hat: 'cap', hatColor: 0xe5384f, print: 'star', printColor: '#ffd84a' });
  const pal = R.makeAvatar({ skin: 0xd8a173, shirt: 0xff6fb5, pants: 0x2b2f3a, hair: 'pony', hairColor: 0x2a1c14, face: 'happy', sleeve: 1 });
  scene.add(hero.root, pal.root);
  tags.add(hero, 'Player1'); tags.add(pal, 'CoolKid_77', { color: '#9fe6ff' });
  chat.say(hero, 'hi chat!', 1.0, 3.0); chat.say(pal, 'lol', 6.9, 8.6); chat.say(hero, 'not again', 8.0, 9.6);
  const log = R.makeChatLog({ top: 260, show: [0.6, 9.7], lines: [[0.8, 'Player1', '#ffd84a', 'hi chat!'], [3.2, 'CoolKid_77', '#9fe6ff', 'jump the bricks'], [6.3, 'Player1', '#ffd84a', 'oof'], [7.0, 'CoolKid_77', '#9fe6ff', 'lol']] });

  // lineup figures (t ≥ 200)
  const LINE = []; for (let i = 0; i < 6; i++) { const p = R.makeAvatar({ ...outfit(i) }); p.root.visible = false; scene.add(p.root); LINE.push(p); }
  const dogs = [R.makeBlockDog({ jersey: 0x2f7cf6, number: '7' }), R.makeBlockDog({ coat: 0xc8873f, dark: 0x2a2522 }), R.makeBlockDog({ coat: 0xd9893a })];
  dogs.forEach((d) => { d.root.visible = false; scene.add(d.root); });

  // ---- the run: walk (0–3.6) → hop the bricks (3.6–5.4) → into the lava (5.6) → oof (6.0) → respawn (7.2)
  const path = (t) => {
    if (t < 3.6) { const u = smooth(t / 3.6); return { x: lerp(-1.2, 0.6, u), y: 0, z: lerp(5.4, 0.2, u), air: 0 }; }
    const hops = [[3.6, [0.6, 0, 0.2], [1.2, 0.6, -1.5]], [4.2, [1.2, 0.6, -1.5], [2.3, 1.2, -3.6]], [4.8, [2.3, 1.2, -3.6], [3.4, 1.8, -5.6]], [5.4, [3.4, 1.8, -5.6], [3.8, 0.3, -7.6]]];
    for (const [t0, a, b] of hops) if (t < t0 + 0.6) { const u = clamp((t - t0) / 0.5); const y = lerp(a[1], b[1], u) + 1.3 * 4 * u * (1 - u); return { x: lerp(a[0], b[0], u), y, z: lerp(a[2], b[2], u), air: u > 0 && u < 1 ? 1 : 0 }; }
    return { x: 3.8, y: 0.3, z: -7.6, air: 0 };
  };
  const OOF = 6.0, SPAWN = 7.2;

  function update(t) {
    const ui = document.getElementById('ui'); if (ui) ui.style.display = t >= 200 ? 'none' : '';
    LINE.forEach((p) => (p.root.visible = false)); dogs.forEach((d) => (d.root.visible = false));
    W.update(t); spin.update(t); lava.update(t); cp1.update(t); coins.forEach((c, i) => c.update(t + i * 0.7, 1.2));
    if (t >= 200) return lineup(t);
    hero.root.visible = pal.root.visible = true;
    // pal stands by the checkpoint, waves, laughs at the oof
    pal.pose({ x: 2.2, z: 5.2, rotY: -0.6 + (t > OOF ? -0.5 : 0), idle: t, face: t > OOF + 0.3 ? 'grin' : 'happy', armR: t < 2.5 ? R.ARMS.wave(t) : t > OOF + 0.3 && t < 8.5 ? R.ARMS.point : undefined, head: { yaw: t > OOF ? -0.3 : 0 } });
    if (t < OOF) {
      const p = path(t), p2 = path(t + 0.05), yaw = Math.atan2(p2.x - p.x, p2.z - p.z) || PI;
      hero.pose({ x: p.x, y: p.y, z: p.z, rotY: t < 3.6 ? PI + 0.2 : yaw, walk: t < 3.6 ? hero.phaseFor(t * 1.6) : null, jump: p.air, face: t < 3.6 ? 'smile' : t > 5.6 ? 'scream' : 'grin', armR: t < 1.9 && t > 0.9 ? R.ARMS.wave(t) : undefined });
      if (t > 5.6) hero.pose({ x: 3.8, y: 0.3, z: -7.6, rotY: PI, face: 'scream', armL: R.ARMS.flail(t), armR: R.ARMS.flail(t, 2), legL: { a: 0.3 * Math.sin(t * 20) }, legR: { a: -0.3 * Math.sin(t * 20) } });
    } else if (t < SPAWN) {
      hero.shatter(t, OOF, { x: 3.8, y: 0.3, z: -7.6, rotY: PI, face: 'oof' }, { floor: 0.3, dir: [0, 0, 0.3], power: 1.5, seed: 11 });
    } else {
      const u = smooth((t - SPAWN) / 0.4);
      hero.pose({ x: 0, y: 0.3, z: 6, rotY: PI, scale: 0.4 + 0.6 * R_easeBack(u), idle: t, face: 'meh', armL: t > 8.0 ? R.ARMS.facepalm : undefined });
      cp1.setOn(1 - smooth((t - SPAWN) / 1.2) * 0.6);
    }
    // a third-person game camera: behind + above the hero, lagging a little
    const h = t < SPAWN ? path(Math.min(t, OOF)) : { x: 0, y: 0.3, z: 6 };
    W.aim(h.x, h.z, 14);
    const cam = t < 3.6 ? [[-0.8 + 0.2 * t, 2.2, -2.8], [-0.2, 1.1, 5]] : t < 5.45 ? [[h.x - 2.2, h.y + 3.2, h.z + 6.2], [h.x + 0.3, h.y + 0.9, h.z - 1]] : t < SPAWN ? [[7.6, 2.6, -4.6], [3.8, 0.7, -7.6]] : [[1.2, 2.0, 1.4], [0.2, 1.2, 6]];
    setCamera(cam[0], cam[1], 52, t, 0.01);
    tags.update(camera, t); chat.update(camera, t); log.update(t);
  }

  function lineup(t) {
    const page = Math.floor(t - 200), X = 40;
    hero.root.visible = pal.root.visible = false;
    tags.list.forEach((e) => (e.on = false));
    W.aim(X, 0, 8);
    if (page === 0 || page === 1) {               // faces (page 0) / more faces + hats (page 1)
      const faces = R.FACES.slice(page * 6, page * 6 + 6);
      LINE.forEach((p, i) => { p.root.visible = !!faces[i]; p.pose({ x: X - 4.0 + i * 1.6, z: 0, rotY: 0, face: faces[i], idle: 0 }); });
      setCamera([X, 1.6, 8.6], [X, 1.15, 0], 44, 0, 0);
    } else if (page === 2) {                      // arm presets
      const keys = ['point', 'up', 'hold', 'cheer', 'shrug', 'facepalm'];
      LINE.forEach((p, i) => { p.root.visible = true; p.pose({ x: X - 4.0 + i * 1.6, z: 0, rotY: 0.35, armR: R.ARMS[keys[i]], armL: keys[i] === 'cheer' || keys[i] === 'shrug' || keys[i] === 'up' ? R.ARMS[keys[i]] : undefined, face: 'smile', walk: null }); });
      setCamera([X, 1.5, 9.4], [X, 1.3, 0], 44, 0, 0);
    } else if (page === 3) {                      // dogs + an oof mid-air and settled
      dogs.forEach((d, i) => d.pose({ x: X - 1.2 + i * 0.9, z: 1.2, rotY: 0.5, run: i === 0 ? 1.2 : null, t: 0.3, scale: 1.3 }));
      LINE[0].root.visible = true; LINE[0].shatter(0.45, 0, { x: X - 1.6, z: -1.0, rotY: 0.3 }, { seed: 3 });
      LINE[1].root.visible = true; LINE[1].shatter(3.0, 0, { x: X + 1.4, z: -1.2, rotY: 0.3 }, { seed: 5 });
      setCamera([X, 2.3, 5.4], [X, 0.4, -0.2], 50, 0, 0);
    } else {                                      // a wide of the course
      W.aim(0, -2, 20); hero.root.visible = true; hero.pose({ x: 0, z: 2, rotY: PI });
      setCamera([9, 7.5, 12], [0, 0.5, -3], 50, 0, 0);
    }
    tags.update(camera, t); chat.update(camera, -1);
  }
  return { update };
}
const R_easeBack = (u) => { u = clamp(u); const s = 2.2; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
function outfit(i) {
  return [
    { skin: 0xf5cd30, shirt: 0xe5384f, pants: 0x2b4c8c, hair: 'short', print: 'number:7' },
    { skin: 0xf2c79b, shirt: 0x2fd06a, pants: 0x24272e, hair: 'long', hairColor: 0xf0c25a, sleeve: 1 },
    { skin: 0x8d5a3b, shirt: 0xffc73b, pants: 0x3c3f46, hair: 'afro', hairColor: 0x1d1410, hat: 'headphones', hatColor: 0x24272e },
    { skin: 0xd8a173, shirt: 0x9b5cf6, pants: 0x2b2f3a, hair: 'spiky', hairColor: 0x2a1c14, print: 'bolt', printColor: '#ffd84a' },
    { skin: 0xffe0bd, shirt: 0x24272e, pants: 0x24272e, hair: 'swoop', hairColor: 0x6b3d1f, hat: 'tophat', hatColor: 0x1b1b1f, tie: 0xe5384f, sleeve: 1 },
    { skin: 0xf5cd30, shirt: 0xff8a2f, pants: 0x2b4c8c, hair: 'bun', hairColor: 0x2a1c14, hat: 'crown', glasses: true },
  ][i];
}
