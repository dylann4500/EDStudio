// FLAT2D TEMPLATE — a 10 s narrated scaffold in the flat 2D cartoon look (docs/STYLES.md → flat2d; proof reel: 053).
//   npm run new -- NNN-slug --from _flat2d-template      (copies script.json + make_cues.py + story/shots/cues)
//   edit script.json → python3 -I tools/narrate.py NNN-slug --scratch → stills → voice once with Eleven → make_cues.py → synth.py → render
// Everything is drawn with Canvas 2D by engine/flat2d (the WebGL studio idles): boiling ink outlines, flat fills with one cel-shade
// step, big-headed puppets, bold labels in the world. Shots cut on WORDS (beatClock), so a re-voice keeps every gag on its word.
// Keep faces out of the one-word caption band (y 950–1050): `node tools/render.mjs NNN-slug --qc` lists any face under it.
import { K, clamp, lerp } from '@engine/core.js';
import { beatClock } from '@engine/build/anim.js';
import { createStage, shotAt } from '@engine/flat2d/stage.js';
import { makePuppet, ARM, talkAt } from '@engine/flat2d/puppet.js';
import * as SET from '@engine/flat2d/sets.js';
import * as FX from '@engine/flat2d/fx.js';
import { makeRobotDog } from '@engine/flat2d/critters.js';
import { drawEndCard } from '@engine/flat2d/endcard.js';
import { loadImg } from '@engine/build/scribe.js';

const ob = (u, s = 2.0) => { u = clamp(u); return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
const pop = (t, t0, d = 0.28) => (t < t0 ? 0 : ob((t - t0) / d));

export async function build(studio, story) {
  const S = await createStage(studio, { bg: '#f4e4c4', boil: 8, wob: 1.7 });   // boil = line re-draws per second, wob = px of wobble
  const I = S.I, ctx = S.ctx;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n);
  const icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const T = { every: W('hook', 'every'), today: W('gag', 'today'), robot: W('gag', 'robot'), lasted: W('gag', 'lasted'), seconds: W('gag', 'seconds') };
  const BOOM = T.seconds + 0.08, ENDCARD = BOOM + 1.1;

  // the cast: kid / teen / adult bodies; L/R arms are SCREEN sides; ARM.* = tested presets
  const kid = makePuppet({ kind: 'kid', seed: 3, skin: '#f2c49a', hair: '#4a2c17', hairStyle: 'spiky', shirt: '#ffc531', logo: 'bolt', bottom: 'shorts', pants: '#2f5fa8', shoes: '#e5483d', extras: { goggles: true, freckles: true } });
  const teen = makePuppet({ kind: 'teen', seed: 5, skin: '#e9b58c', hair: '#1f1611', hairStyle: 'short', shirt: '#2fa39a', top: 'hoodie', pants: '#2b2f45', shoes: '#f4f4f4' });
  const robo = makeRobotDog({ seed: 41 });

  function garage(t) {   // a set = a room shell + dressing (anchor props by their bottom on the baseboard y = −240)
    SET.room(I, { wall: '#cfd8dc', pattern: 'cinder', floor: '#9aa0a6', kind: 'concrete', base: -240, x0: -1600, x1: 1600, top: -2300 });
    SET.garageDoor(I, -980, -240, 640, 780);
    SET.pegboard(I, 420, -840, 560, 330);
    SET.sign(I, 420, -1120, "LEO'S LAB", { size: 72, fill: '#ffc531', rot: -0.05 });
    SET.shelf(I, -330, -760, 380, { items: ['cans', 'robot'] });
    SET.workbench(I, 420, -240, 640);
    SET.box(I, 1000, -240, 230, 170, { label: 'JUNK' });
    SET.bulb(I, 60, -2300, 900, { t, on: true, glow: 520 });
  }
  // shots: hard cuts on words; cam {x, y, z} = the world point at the frame centre + zoom (keyframed with [[t, v], …])
  const cam = (x, y, z, x1, y1, z1, a, b) => ({ x: [[a, x], [b, x1]], y: [[a, y], [b, y1]], z: [[a, z], [b, z1]] });
  const SH = [
    { t0: 0, id: 'two', cam: cam(90, -170, 1.12, 90, -200, 1.22, 0, T.today) },
    { t0: T.today, id: 'gadget', cam: cam(0, -150, 1.05, 0, -155, 1.12, T.today, T.seconds) },
    { t0: T.seconds, id: 'boom', cam: cam(0, -150, 1.12, 0, -150, 1.12, T.seconds, ENDCARD) },
  ];
  const HITS = [[BOOM, 46, 0.6]];   // screen shake [t, px, s]
  const put = (P, pose, name) => { P.draw(I, pose); S.face(P.headAt(pose), name); };   // draw + register the face for --qc

  function update(t) {
    const { shot, cam: c } = shotAt(t, SH, K);
    S.begin(t, c, HITS);
    const tt = S.twos(t);   // characters animate "on twos"; the camera moves on ones
    garage(t);
    if (shot.id === 'two') {
      put(kid, { x: -160, y: 70, s: 1.1, t: tt, eyes: t > T.every ? 'happy' : 'open', mouth: 'grin', arms: { L: ARM.cheer, R: ARM.hips }, bob: Math.abs(Math.sin(tt * 2.2)) * 6 }, 'kid');
      put(teen, { x: 330, y: 20, s: 1.0, t: tt, turn: -0.25, eyes: 'half', mouth: 'open', open: talkAt(t, story.words), arms: { L: ARM.cross, R: ARM.cross } }, 'teen');
      SET.nameTag(I, 'LEO, 9', -160, -640, { size: 70, sub: 'INVENTOR', pop: pop(t, 0.4) });
    } else {
      const boom = shot.id === 'boom' && t > BOOM;
      if (!boom) robo.draw(I, { x: 120, y: 200, s: 0.9, t, chomp: 0.5 + 0.5 * Math.sin(t * 22), run: t > T.lasted ? t * 3 : null });
      put(kid, { x: -260, y: 110, s: 1.05, t: tt, turn: 0.4, eyes: boom ? 'x' : 'happy', mouth: boom ? 'wavy' : 'grin', arms: boom ? { L: ARM.down, R: ARM.down } : { L: ARM.out, R: ARM.wave }, soot: boom ? 1 : 0, puff: boom ? 1 : 0 }, 'kid');
      SET.nameTag(I, 'HOMEWORK EATER', 140, -560, { size: 52, sub: 'INVENTION #1', pop: pop(t, T.robot) });
      FX.explosion(I, 160, 80, 230, t - BOOM, { word: 'BOOM!', wy: 230 });
    }
    S.screen();   // frame-pixel overlays from here: the counter board, then the end card
    if (t < ENDCARD) SET.board(I, 540, 236, [['INVENTIONS', t < T.today ? 0 : 1], ['WORKING', 0]], { size: 48, valueColors: [null, '#e5483d'] });
    drawEndCard(S, icon, t - ENDCARD);
    S.end();
  }
  window.EDSTUDIO_QC = () => S.qcCaptions(update, story);
  return { update };
}
